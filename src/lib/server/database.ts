import "server-only";
import { readFileSync } from "node:fs";
import { Pool } from "pg";

let connection: Pool | undefined;
export function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("database unavailable");
  const parsed = new URL(url);
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) parsed.searchParams.delete(key);
  const ca = process.env.DATABASE_CA_CERT || (process.env.DATABASE_CA_CERT_PATH ? readFileSync(process.env.DATABASE_CA_CERT_PATH, "utf8") : undefined);
  return connection ??= new Pool({ connectionString: parsed.toString(), max: 1, connectionTimeoutMillis: 10000, idleTimeoutMillis: 20000, ssl: { rejectUnauthorized: true, ca } });
}
