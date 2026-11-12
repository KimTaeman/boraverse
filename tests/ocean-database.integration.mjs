import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { writeOcean } from "../src/lib/ocean/store.ts";

const ca = await readFile(process.env.DATABASE_CA_CERT_PATH, "utf8");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { ca, rejectUnauthorized: true }, max: 1, connectionTimeoutMillis: 10000 });
const client = await pool.connect();
try {
  await client.query("BEGIN");
  const check = await client.query("select exists (select 1 from pg_namespace where nspname = 'app_private') as present");
  if (check.rows[0].present) throw new Error("Ocean schema already exists; refusing to run destructive test");
  await client.query(await readFile("supabase/migrations/202611120001_ocean.sql", "utf8"));
  const access = await client.query("select has_schema_privilege('anon', 'app_private', 'USAGE') as anon, has_schema_privilege('authenticated', 'app_private', 'USAGE') as authenticated");
  assert.equal(access.rows[0].anon, false);
  assert.equal(access.rows[0].authenticated, false);
  const role = `ocean_test_role_${randomUUID().replaceAll("-", "")}`;
  const roleSql = (await readFile("supabase/ocean-app-role.sql", "utf8")).replaceAll("ocean_app", role);
  await client.query(roleSql);
  await client.query(`grant ${role} to current_user`);
  await client.query(`set local role ${role}`);
  const key = randomUUID(), otherKey = randomUUID();
  const input = { visitorToken: randomUUID(), idempotencyKey: key, concertDay: "unspecified" };
  const first = await writeOcean(client, "test-visitor-1", input);
  assert.equal(first.status, "accepted");
  const retry = await writeOcean(client, "test-visitor-1", input);
  assert.equal(retry.status, "accepted");
  assert.equal(retry.lightId, first.lightId);
  assert.equal((await writeOcean(client, "test-visitor-1", { ...input, idempotencyKey: otherKey })).status, "already_contributed");
  assert.equal((await writeOcean(client, "test-visitor-2", input)).status, "conflict");
  assert.equal((await client.query("select count(*)::int as total from app_private.ocean_contributions")).rows[0].total, 1);
  await writeOcean(client, "test-visitor-1", input);
  await writeOcean(client, "test-visitor-1", input);
  assert.equal((await writeOcean(client, "test-visitor-1", input)).status, "rate_limited");
  await client.query("SAVEPOINT permission_check");
  await assert.rejects(client.query("delete from app_private.ocean_contributions"), error => error.code === "42501");
  await client.query("ROLLBACK TO SAVEPOINT permission_check");
  console.log("Migration, role permissions, and uniqueness checks passed; changes will be rolled back.");
} finally {
  await client.query("ROLLBACK");
  client.release();
  await pool.end();
}
