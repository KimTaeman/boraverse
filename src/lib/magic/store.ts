import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import type { MagicInput, MagicWrite, MagicReply, PublicMessage } from "./validation.ts";
import type { MagicFailure } from "./http.ts";
export type MagicClient = Pick<PoolClient, "query">;
export async function listLetters(client: MagicClient, cursor?: string) {
  const { rows } = await client.query<PublicMessage>(`select m.id,m.title,m.body as text,
    (select count(*)::int from app_private.magic_reactions r where r.message_id=m.id and r.active) as reactions
    from app_private.magic_messages m where m.kind='bangtan' and m.status='published'
    and ($1::uuid is null or m.id < $1::uuid) order by m.id desc limit 13`, [cursor || null]);
  return { items: rows.slice(0, 12), nextCursor: rows.length > 12 ? rows[11].id : null };
}
async function throttle(client: MagicClient, hash: string, draw: boolean) {
  for (const [bucket, limit] of [[`magic:${draw ? "draw" : "write"}:global`, draw ? 120 : 60], [`magic:${draw ? "draw" : "write"}:${hash}`, draw ? 20 : 5]] as const) {
    const result = await client.query(`insert into app_private.magic_rate_buckets(bucket_hash,window_start,hits)
      values($1,date_trunc('minute',now()),1) on conflict(bucket_hash,window_start)
      do update set hits=app_private.magic_rate_buckets.hits+1 where app_private.magic_rate_buckets.hits < $2 returning hits`, [bucket, limit]);
    if (!result.rowCount) return false;
  }
  await client.query("delete from app_private.magic_rate_buckets where window_start < now()-interval '1 day'");
  return true;
}
async function resultFor(client: MagicClient, input: MagicWrite, id: string): Promise<MagicReply | MagicFailure> {
  if (input.action === "submit") {
    const { rows } = await client.query("select id,status,kind from app_private.magic_messages where id=$1 and author_hash=current_setting('app.magic_visitor',true)", [id]);
    return rows[0] ? { status: "submitted", submissionId: rows[0].id, kind: rows[0].kind, reviewStatus: rows[0].status } : { status: "not_found" };
  }
  if (input.action === "react") {
    const { rows } = await client.query(`select m.id,
      coalesce((select active from app_private.magic_reactions where message_id=m.id and visitor_hash=current_setting('app.magic_visitor',true)),false) as active,
      (select count(*)::int from app_private.magic_reactions where message_id=m.id and active) as reactions
      from app_private.magic_messages m where id=$1 and kind='bangtan' and status='published'`, [id]);
    return rows[0] ? { status: "reacted", messageId: id, active: rows[0].active, reactions: rows[0].reactions } : { status: "not_found" };
  }
  return { status: input.action === "remove" ? "withdrawn" : "reported", messageId: id };
}
export async function performMagic(client: MagicClient, hash: string, input: MagicInput): Promise<MagicReply | MagicFailure> {
  await client.query("select set_config('app.magic_visitor',$1,true)", [hash]);
  if (input.action === "draw") {
    if (!await throttle(client, hash, true)) return { status: "rate_limited" };
    const { rows } = await client.query<PublicMessage>(`select id,title,body as text,0::int as reactions from app_private.magic_messages
      where kind='army' and status='published' and author_hash<>$1 and ($2::uuid is null or id<>$2::uuid)
      order by random() limit 1`, [hash, input.previousId || null]);
    return { status: "drawn", message: rows[0] || null };
  }
  const fingerprint = createHash("sha256").update(JSON.stringify(input, Object.keys(input).sort())).digest("hex");
  const prior = await client.query("select payload_hash,result_id from app_private.magic_requests where request_id=$1 and visitor_hash=$2", [input.requestId, hash]);
  if (prior.rows[0]) return prior.rows[0].payload_hash === fingerprint ? resultFor(client, input, prior.rows[0].result_id) : { status: "conflict" };
  if (!await throttle(client, hash, false)) return { status: "rate_limited" };
  // Serialize capacity checks and reaction count reads across simultaneous writes.
  await client.query("select pg_advisory_xact_lock(hashtext('magic-write-budget'))");
  const capacity = await client.query("select count(*)::int as n from app_private.magic_requests");
  if (capacity.rows[0].n >= 50000) return { status: "full" };
  if (input.action !== "submit") {
    const target = await client.query(`select id from app_private.magic_messages where id=$1
      and ${input.action === "remove" ? "author_hash=$2" : "status='published'"}
      ${input.action === "react" ? "and kind='bangtan'" : ""}`, input.action === "remove" ? [input.messageId, hash] : [input.messageId]);
    if (!target.rowCount) return { status: "not_found" };
  }
  const claim = await client.query(`insert into app_private.magic_requests(request_id,visitor_hash,operation,payload_hash)
    values($1,$2,$3,$4) on conflict do nothing returning request_id`, [input.requestId, hash, input.action, fingerprint]);
  if (!claim.rowCount) {
    const retry = await client.query("select payload_hash,result_id from app_private.magic_requests where request_id=$1 and visitor_hash=$2", [input.requestId, hash]);
    return retry.rows[0]?.payload_hash === fingerprint ? resultFor(client, input, retry.rows[0].result_id) : { status: "conflict" };
  }
  let id: string;
  if (input.action === "submit") {
    const { rows } = await client.query(`insert into app_private.magic_messages(request_id,kind,title,body,author_hash,status)
      values($1,$2,$3,$4,$5,'pending') returning id`, [input.requestId, input.kind, input.title.trim(), input.text.trim(), hash]);
    id = rows[0].id;
  } else {
    id = input.messageId;
    if (input.action === "react") await client.query(`insert into app_private.magic_reactions(message_id,visitor_hash,active) values($1,$2,$3)
      on conflict(message_id,visitor_hash) do update set active=excluded.active`, [id, hash, input.active]);
    if (input.action === "remove") await client.query("update app_private.magic_messages set status='withdrawn',published_at=null where id=$1 and author_hash=$2", [id, hash]);
    if (input.action === "report") await client.query("insert into app_private.magic_reports(request_id,message_id,reporter_hash,reason) values($1,$2,$3,$4)", [input.requestId, id, hash, input.reason]);
  }
  await client.query("update app_private.magic_requests set result_id=$2 where request_id=$1", [input.requestId, id]);
  return resultFor(client, input, id);
}
