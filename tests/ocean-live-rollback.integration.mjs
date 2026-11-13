import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import pg from "pg";
import { writeOcean } from "../src/lib/ocean/store.ts";

if (process.env.OCEAN_WRITE_ENABLED !== "false") throw new Error("The public write switch must be explicitly disabled");
const ca = await readFile(process.env.DATABASE_CA_CERT_PATH, "utf8");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { ca, rejectUnauthorized: true }, max: 1, connectionTimeoutMillis: 10000 });
const client = await pool.connect();
const hash = randomBytes(32).toString("hex");
let inTransaction = false;
const input = { visitorToken: randomUUID(), idempotencyKey: randomUUID(), concertDay: "unspecified" };
try {
  const role = await client.query("select current_user = $1 as restricted", ["ocean_login"]);
  assert.equal(role.rows[0].restricted, true, "Use the dedicated restricted login");
  await client.query("BEGIN");
  inTransaction = true;
  await client.query("set local lock_timeout = \'5s\'");
  await client.query("set local statement_timeout = \'10s\'");
  const before = (await client.query("select count(*)::int as n from app_private.ocean_contributions")).rows[0].n;
  const accepted = await writeOcean(client, hash, input);
  assert.equal(accepted.status, "accepted");
  assert.equal(accepted.totalLights, before + 1);
  const retry = await writeOcean(client, hash, input);
  assert.equal(retry.status, "accepted");
  assert.equal(retry.lightId, accepted.lightId);
  assert.equal((await writeOcean(client, hash, { ...input, idempotencyKey: randomUUID() })).status, "already_contributed");
  assert.equal((await writeOcean(client, randomBytes(32).toString("hex"), input)).status, "conflict");
  assert.equal((await client.query("select count(*)::int as n from app_private.ocean_contributions")).rows[0].n, before + 1);
  await writeOcean(client, hash, input);
  await writeOcean(client, hash, input);
  assert.equal((await writeOcean(client, hash, input)).status, "rate_limited");
  await client.query("ROLLBACK");
  inTransaction = false;
  const remaining = await client.query("select count(*)::int as n from app_private.ocean_contributions where visitor_hash = $1", [hash]);
  assert.equal(remaining.rows[0].n, 0, "Test contribution must not remain");
  console.log("Restricted login write, retry, duplicate, conflict and rate-limit checks passed; rollback verified.");
} finally {
  if (inTransaction) await client.query("ROLLBACK").catch(() => {});
  client.release();
  await pool.end();
}
