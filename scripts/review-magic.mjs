import pg from "pg";
import { readFileSync } from "node:fs";
import { isUuid } from "../src/lib/magic/validation.ts";
const [operation, id] = process.argv.slice(2);
if (!["list", "show", "publish", "reject", "hide", "reports"].includes(operation) || (!["list", "reports"].includes(operation) && !isUuid(id))) {
  console.error("Usage: node --env-file=<private-owner-env> scripts/review-magic.mjs list|reports|show <id>|publish <id>|reject <id>|hide <id>"); process.exit(1);
}
let client;
try {
  const url = new URL(process.env.DATABASE_URL);
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) url.searchParams.delete(key);
  const ca = process.env.DATABASE_CA_CERT || (process.env.DATABASE_CA_CERT_PATH ? readFileSync(process.env.DATABASE_CA_CERT_PATH, "utf8") : undefined);
  client = new pg.Client({ connectionString: url.toString(), ssl: { rejectUnauthorized: true, ca }, connectionTimeoutMillis: 10000 });
  await client.connect();
  await client.query("set statement_timeout='5s'");
  const owner = await client.query("select pg_has_role(current_user,(select relowner from pg_class where oid='app_private.magic_messages'::regclass),'MEMBER') as allowed");
  if (!owner.rows[0]?.allowed) throw new Error("Use the private database owner credentials, not the website login.");
  if (operation === "list") console.log(JSON.stringify((await client.query("select id,kind,title,created_at from app_private.magic_messages where status='pending' order by created_at limit 50")).rows, null, 2));
  else if (operation === "reports") console.log(JSON.stringify((await client.query("select message_id,reason,count(*)::int as reports from app_private.magic_reports group by message_id,reason order by reports desc limit 50")).rows, null, 2));
  else if (operation === "show") console.log(JSON.stringify((await client.query("select id,kind,title,body,status,created_at from app_private.magic_messages where id=$1", [id])).rows, null, 2));
  else {
    const publish = operation === "publish";
    const result = await client.query(`update app_private.magic_messages set status=$2,published_at=${publish ? "now()" : "null"}
      where id=$1 and status ${publish || operation === "reject" ? "='pending'" : "='published'"} returning id,status`, [id, publish ? "published" : operation === "reject" ? "rejected" : "withdrawn"]);
    if (result.rowCount !== 1) throw new Error("No eligible message changed. Inspect its current status first.");
    console.log(JSON.stringify(result.rows[0]));
  }
} catch { console.error("Review could not complete. Check owner access, migration state and the selected message. No approval was inferred."); process.exitCode = 1; }
finally { await client?.end().catch(() => {}); }
