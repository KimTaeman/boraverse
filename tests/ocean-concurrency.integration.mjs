import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { writeOcean } from "../src/lib/ocean/store.ts";

const ca = await readFile(process.env.DATABASE_CA_CERT_PATH, "utf8");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { ca, rejectUnauthorized: true }, max: 3, connectionTimeoutMillis: 10000 });
const schema = `ocean_test_${randomUUID().replaceAll("-", "")}`;
const migration = (await readFile("supabase/migrations/202611120001_ocean.sql", "utf8")).replaceAll("app_private", schema);
async function submit(hash, input) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const wrapped = { query: (query, values) => client.query(query.replaceAll("app_private.", `${schema}.`), values) };
    const result = await writeOcean(wrapped, hash, input);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}
let created = false;
try {
  await pool.query(migration);
  created = true;
  const input = { visitorToken: randomUUID(), idempotencyKey: randomUUID(), concertDay: "unspecified" };
  const results = await Promise.all([submit("visitor-one", input), submit("visitor-one", input)]);
  assert.equal(results[0].status, "accepted");
  assert.equal(results[1].status, "accepted");
  assert.equal(results[0].lightId, results[1].lightId);
  assert.equal((await submit("visitor-one", { ...input, idempotencyKey: randomUUID() })).status, "already_contributed");
  assert.equal((await submit("visitor-two", input)).status, "conflict");
  assert.equal((await submit("visitor-two", { ...input, idempotencyKey: randomUUID() })).status, "accepted");
  assert.equal((await pool.query(`select count(*)::int as total from ${schema}.ocean_contributions`)).rows[0].total, 2);
  console.log("Concurrent requests, retry, duplicate, and conflict checks passed.");
} finally {
  if (created) await pool.query(`drop schema ${schema} cascade`);
  await pool.end();
}
