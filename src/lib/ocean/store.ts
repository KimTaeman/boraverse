import type { PoolClient } from "pg";
import type { Contribution } from "./validation";

export async function writeOcean(client: PoolClient, visitorHash: string, input: Contribution) {
    const rate = await client.query<{ hits: number }>(`insert into app_private.ocean_rate_buckets (bucket_hash, window_start, hits)
      values ('global', date_trunc('minute', now()), 1)
      on conflict (bucket_hash, window_start) do update set hits = app_private.ocean_rate_buckets.hits + 1 returning hits`);
    if (rate.rows[0].hits > 60) return { status: "rate_limited" as const };
    await client.query("delete from app_private.ocean_rate_buckets where window_start < now() - interval '1 day'");
    const visitorRate = await client.query<{ hits: number }>(`insert into app_private.ocean_rate_buckets (bucket_hash, window_start, hits)
      values ($1, date_trunc('minute', now()), 1)
      on conflict (bucket_hash, window_start) do update set hits = app_private.ocean_rate_buckets.hits + 1 returning hits`, [visitorHash]);
    if (visitorRate.rows[0].hits > 5) return { status: "rate_limited" as const };
    const inserted = await client.query<{ id: string; concert_day: string }>(`insert into app_private.ocean_contributions (visitor_hash, idempotency_key, concert_day)
      values ($1, $2, $3) on conflict do nothing returning id, concert_day`, [visitorHash, input.idempotencyKey, input.concertDay]);
    let row = inserted.rows[0];
    let status: "accepted" | "already_contributed" = "accepted";
    if (!row) {
      const existing = await client.query<{ id: string; concert_day: string; visitor_hash: string; idempotency_key: string }>(`select id, concert_day, visitor_hash, idempotency_key::text from app_private.ocean_contributions where idempotency_key = $1 or visitor_hash = $2`, [input.idempotencyKey, visitorHash]);
      if (existing.rows.some((item) => item.idempotency_key === input.idempotencyKey && item.visitor_hash !== visitorHash)) {
        return { status: "conflict" as const };
      }
      const match = existing.rows.find((item) => item.visitor_hash === visitorHash);
      if (!match) throw new Error("contribution conflict");
      row = match;
      status = match.idempotency_key === input.idempotencyKey ? "accepted" : "already_contributed";
    }
    const count = await client.query<{ total: number }>("select count(*)::int as total from app_private.ocean_contributions");
    return { status, totalLights: count.rows[0].total, lightId: row.id, concertDay: row.concert_day };
}
