import "server-only";
import { createHmac } from "node:crypto";
import { database } from "./database";
import { listLetters, performMagic } from "@/lib/magic/store";
import type { MagicInput } from "@/lib/magic/validation";
export const getLetters = (cursor?: string) => listLetters(database(), cursor);
export async function magicAction(input: MagicInput) {
  const secret = process.env.OCEAN_HMAC_SECRET;
  if (!secret || secret.length < 32 || secret.includes("REPLACE_")) throw new Error("secret unavailable");
  const hash = createHmac("sha256", secret).update("magic:v1:" + input.visitorToken).digest("hex");
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    await client.query("set local statement_timeout='5s'");
    const result = await performMagic(client, hash, input);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally { client.release(); }
}
