import "server-only";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { writeOcean } from "@/lib/ocean/store";
import type { Contribution } from "@/lib/ocean/validation";

let connection: Pool | undefined;
function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("database unavailable");
  const parsed = new URL(url);
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) parsed.searchParams.delete(key);
  const ca = process.env.DATABASE_CA_CERT_PATH ? readFileSync(process.env.DATABASE_CA_CERT_PATH, "utf8") : undefined;
  return connection ??= new Pool({ connectionString: parsed.toString(), max: 1, connectionTimeoutMillis: 10000, idleTimeoutMillis: 20000, ssl: { rejectUnauthorized: true, ca } });
}

export async function getOcean() {
  const { rows } = await database().query<{ concert_day: string; count: number }>("select concert_day, count(*)::int as count from app_private.ocean_contributions group by concert_day");
  const byDay: Record<string, number> = { "2026-12-03": 0, "2026-12-05": 0, "2026-12-06": 0, unspecified: 0 };
  for (const row of rows) byDay[row.concert_day] = row.count;
  return { status: "ok", totalLights: Object.values(byDay).reduce((a, b) => a + b, 0), byDay, updatedAt: new Date().toISOString() };
}

export async function contribute(input: Contribution) {
  const secret = process.env.OCEAN_HMAC_SECRET;
  if (!secret || secret.length < 32 || secret.includes("REPLACE_")) throw new Error("secret unavailable");
  const visitorHash = createHmac("sha256", secret).update(input.visitorToken).digest("hex");
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    const result = await writeOcean(client, visitorHash, input);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
