import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import { parseEnv, promisify } from "node:util";
import { execFile } from "node:child_process";
import pg from "pg";
import { performMagic } from "../src/lib/magic/store.ts";

// Real commits are limited to synthetic pending records; cleanup never selects visitor data.
assert.equal(process.env.OCEAN_WRITE_ENABLED, "false", "Ocean must remain disabled.");
assert.equal(process.env.MAGIC_WRITE_ENABLED, "false", "Keep the persistent Magic setting off.");
const target = new URL(process.env.MAGIC_TEST_URL || "http://127.0.0.1:3468");
assert.equal(target.protocol, "http:"); assert.equal(target.hostname, "127.0.0.1");
assert.equal(target.port, "3468", "Use the isolated loopback test server.");
const ownerEnv = { ...process.env, ...parseEnv(await readFile(".env.admin.local", "utf8")) };
async function connect(env) {
  const url = new URL(env.DATABASE_URL);
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) url.searchParams.delete(key);
  const ca = env.DATABASE_CA_CERT || await readFile(env.DATABASE_CA_CERT_PATH, "utf8");
  const client = new pg.Client({ connectionString: url.toString(), ssl: { rejectUnauthorized: true, ca }, connectionTimeoutMillis: 10000 });
  await client.connect(); await client.query("set statement_timeout='10s'"); return client;
}
const token = randomUUID(), concurrentToken = randomUUID();
const requestId = randomUUID(), concurrentId = randomUUID(), removeId = randomUUID();
const hash = value => createHmac("sha256", process.env.OCEAN_HMAC_SECRET).update("magic:v1:" + value).digest("hex");
const input = { action: "submit", visitorToken: token, requestId, kind: "bangtan", title: "Private rollout verification", text: "A synthetic pending check that must never be published.", consent: true };
const ids = [requestId, concurrentId, removeId];
const clients = [];
let owner;
async function post(body) {
  const response = await fetch(new URL("/api/magic", target), { method: "POST", headers: { "Content-Type": "application/json", Origin: target.origin }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200); assert.equal(response.headers.get("cache-control"), "no-store"); return response.json();
}
const execute = promisify(execFile);
async function review(operation, id) {
  const { stdout } = await execute(process.execPath, ["--env-file=.env.local", "--env-file=.env.admin.local", "scripts/review-magic.mjs", operation, id], { timeout: 20000, env: ownerEnv });
  return JSON.parse(stdout);
}
try {
  owner = await connect(ownerEnv);
  const oceanBefore = (await owner.query("select count(*)::int as n from app_private.ocean_contributions")).rows[0].n;
  const status = await (await fetch(new URL("/api/magic", target))).json(); assert.equal(status.writesEnabled, true);
  assert.equal((await (await fetch(new URL("/api/ocean", target))).json()).writesEnabled, false);
  const submitted = await post(input); assert.equal(submitted.status, "submitted"); assert.equal(submitted.reviewStatus, "pending");
  assert.equal((await post(input)).submissionId, submitted.submissionId);
  assert.equal((await owner.query("select count(*)::int as n from app_private.magic_messages where request_id=$1", [requestId])).rows[0].n, 1);
  const queue = await review("show", submitted.submissionId); assert.equal(queue[0].status, "pending"); assert.equal(queue[0].body, input.text);
  assert.equal((await review("reject", submitted.submissionId)).status, "rejected");
  assert.equal((await post(input)).reviewStatus, "rejected", "A retry reports the actual reviewed state.");
  assert.equal((await post({ action: "remove", visitorToken: token, requestId: removeId, messageId: submitted.submissionId })).status, "withdrawn");
  const concurrent = { ...input, requestId: concurrentId, visitorToken: concurrentToken, kind: "army" };
  const settled = await Promise.allSettled([0, 1].map(async () => {
    const client = await connect(process.env); clients.push(client);
    assert.equal((await client.query("select rolsuper or rolbypassrls as unsafe from pg_roles where rolname=current_user")).rows[0].unsafe, false);
    await client.query("BEGIN");
    try { const result = await performMagic(client, hash(concurrentToken), concurrent); await client.query("COMMIT"); return result; }
    catch (error) { await client.query("ROLLBACK"); throw error; }
  }));
  for (const result of settled) assert.equal(result.status, "fulfilled", "Both database transactions must settle successfully before cleanup.");
  const outcomes = settled.map(result => result.value);
  assert.equal(outcomes[0].status, "submitted"); assert.equal(outcomes[0].reviewStatus, "pending");
  assert.equal(outcomes[1].submissionId, outcomes[0].submissionId);
  assert.equal((await owner.query("select count(*)::int as n from app_private.magic_messages where request_id=$1", [concurrentId])).rows[0].n, 1);
  const reader = clients[0]; await reader.query("BEGIN");
  try {
    await reader.query("select set_config('app.magic_visitor',$1,true)", [hash(concurrentToken)]);
    await assert.rejects(reader.query("update app_private.magic_messages set status='published',published_at=now() where id=$1", [outcomes[0].submissionId]), /row-level security/);
  } finally { await reader.query("ROLLBACK"); }
  const feed = await (await fetch(new URL("/api/magic", target))).json();
  assert.ok(feed.items.every(item => ![submitted.submissionId, outcomes[0].submissionId].includes(item.id)));
  assert.equal((await owner.query("select count(*)::int as n from app_private.ocean_contributions")).rows[0].n, oceanBefore);
  console.log("Real local HTTP commit/retry, owner review/rejection, withdrawal, concurrent restricted-login idempotency and publication denial passed.");
} finally {
  await Promise.allSettled(clients.map(client => client.end()));
  if (owner) {
    try {
      await owner.query("BEGIN");
      await owner.query("delete from app_private.magic_messages where request_id=any($1::uuid[])", [ids]);
      await owner.query("delete from app_private.magic_requests where request_id=any($1::uuid[])", [ids]);
      await owner.query("delete from app_private.magic_rate_buckets where bucket_hash=any($1::text[])", [[token, concurrentToken].flatMap(value => [`magic:write:${hash(value)}`, `magic:draw:${hash(value)}`])]);
      await owner.query("COMMIT");
      assert.equal((await owner.query("select count(*)::int as n from app_private.magic_messages where request_id=any($1::uuid[])", [ids])).rows[0].n, 0);
      assert.equal((await owner.query("select count(*)::int as n from app_private.magic_requests where request_id=any($1::uuid[])", [ids])).rows[0].n, 0);
      console.log("Synthetic messages/request receipts removed; global rate accounting preserved. No test text was published.");
    } finally { await owner.query("ROLLBACK").catch(() => {}); await owner.end(); }
  }
}
