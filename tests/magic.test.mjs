import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { validateMagic, validReply } from "../src/lib/magic/validation.ts";
import { handleMagic } from "../src/lib/magic/http.ts";
import { wrapPostcard } from "../src/lib/keepsakes/postcard.ts";
const submit = () => ({ action: "submit", visitorToken: randomUUID(), requestId: randomUUID(), kind: "bangtan", title: "A little gratitude", text: "Thank you for the small moments of joy.", consent: true });
const req = body => new Request("https://boraverse.com/api/magic", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
test("shared text requires explicit consent, bounded plain words and valid identifiers", () => {
  const input = submit(); assert.deepEqual(validateMagic(input), input);
  for (const value of [{ ...input, consent: false }, { ...input, status: "published" }, { ...input, text: " " }, { ...input, visitorToken: "bad" }, { ...input, text: "<img src=x>" }, { ...input, text: "https://other.com" }, { ...input, text: "me@example.com" }, { ...input, text: "x".repeat(1201) }, { ...input, kind: "army", text: "x".repeat(501) }]) assert.equal(validateMagic(value), null);
  assert.ok(validateMagic({ action: "react", visitorToken: randomUUID(), requestId: randomUUID(), messageId: randomUUID(), active: false }));
});
test("disabled writes, malformed/oversized requests and cross-origin writes cannot reach the database", async () => {
  let calls = 0; const perform = async () => { calls++; throw new Error("must not call"); };
  assert.equal((await handleMagic(req(submit()), false, perform)).status, 503);
  assert.equal((await handleMagic(req({ ...submit(), consent: false }), true, perform)).status, 400);
  const oversized = req({ ...submit(), text: "x".repeat(9000) });
  assert.equal((await handleMagic(oversized, true, perform)).status, 413);
  const foreign = req(submit()); foreign.headers.set("Origin", "https://other.com");
  assert.equal((await handleMagic(foreign, true, perform)).status, 403);
  assert.equal(calls, 0);
});
test("submission confirms review queue only; errors leak no body or internal details", async () => {
  const id = randomUUID();
  const response = await handleMagic(req(submit()), true, async () => ({ status: "submitted", submissionId: id, kind: "bangtan", reviewStatus: "pending" }));
  assert.deepEqual(await response.json(), { status: "submitted", submissionId: id, kind: "bangtan", reviewStatus: "pending" });
  assert.equal(response.headers.get("cache-control"), "no-store");
  const failed = await handleMagic(req(submit()), true, async () => { throw new Error("private database secret"); });
  assert.equal(failed.status, 503); assert.ok(!(await failed.text()).includes("private database secret"));
  const limited = await handleMagic(req(submit()), true, async () => ({ status: "rate_limited" }));
  assert.equal(limited.status, 429); assert.equal(limited.headers.get("retry-after"), "60");
});
test("draws remain read-only while posting is disabled, and valid replies match their action", async () => {
  const input = { action: "draw", visitorToken: randomUUID() };
  const response = await handleMagic(req(input), false, async () => ({ status: "drawn", message: null }));
  assert.equal(response.status, 200);
  assert.equal(validReply({ status: "drawn", message: null }, input), true);
  const reaction = { action: "react", messageId: randomUUID(), requestId: randomUUID(), visitorToken: randomUUID(), active: true };
  assert.equal(validReply({ status: "reacted", messageId: reaction.messageId, active: true, reactions: -1 }, reaction), false);
  assert.equal(validReply({ status: "reacted", messageId: randomUUID(), active: true, reactions: 2 }, reaction), false);
});
test("postcards preserve paragraphs and wrap long unbroken and Unicode text", () => {
  assert.deepEqual(wrapPostcard("hello\nworld", value => value.length, 10), ["hello", "world"]);
  assert.deepEqual(wrapPostcard("abcdefghij", value => value.length, 3), ["abc", "def", "ghi", "j"]);
  assert.deepEqual(wrapPostcard("💜💜💜", value => [...value].length, 2), ["💜💜", "💜"]);
});

test("owner review CLI rejects invalid configuration without exposing connection input", () => {
  const secret = "private-connection-value-that-is-not-a-url";
  const result = spawnSync(process.execPath, ["scripts/review-magic.mjs", "list"], { encoding: "utf8", env: { ...process.env, DATABASE_URL: secret } });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Review could not complete/);
  assert.ok(!result.stderr.includes(secret));
  assert.equal(result.stdout, "");
});
