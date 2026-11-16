import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { sendMagic, retryMagic, pendingMagic, submittedMagic, drawMagic } from "../src/components/magic/live.ts";
const originals = { window: globalThis.window, localStorage: globalThis.localStorage, fetch: globalThis.fetch };
afterEach(() => { for (const [key, value] of Object.entries(originals)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } });
function browser() {
  const values = new Map(); globalThis.window = globalThis;
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
const intent = { action: "submit", kind: "bangtan", title: "A little gratitude", text: "Thank you for the ordinary moments.", consent: true };
test("an ambiguous failure keeps the same request and a confirmed queue response clears only its retry data", async () => {
  browser(); const requests = [];
  globalThis.fetch = async (_url, init) => { requests.push(JSON.parse(init.body)); throw new TypeError("network"); };
  await assert.rejects(sendMagic(intent), /not confirmed/);
  const first = pendingMagic(); assert.ok(first); assert.deepEqual(submittedMagic(), []);
  const id = randomUUID();
  globalThis.fetch = async (_url, init) => { requests.push(JSON.parse(init.body)); return Response.json({ status: "submitted", submissionId: id, kind: "bangtan", reviewStatus: "pending" }); };
  const result = await retryMagic(); assert.equal(result.reviewStatus, "pending");
  assert.equal(requests[0].requestId, requests[1].requestId); assert.equal(pendingMagic(), null);
  assert.deepEqual(submittedMagic(), [{ id, kind: "bangtan" }]);
});
test("unconfirmed success payloads and different pending content never discard the earlier request", async () => {
  browser(); globalThis.fetch = async () => Response.json({ status: "submitted", submissionId: randomUUID(), kind: "army", reviewStatus: "published" });
  await assert.rejects(sendMagic(intent), /could not confirm/);
  const key = pendingMagic().requestId;
  await assert.rejects(sendMagic({ ...intent, text: "Edited words" }), /earlier request/);
  assert.equal(pendingMagic().requestId, key); assert.deepEqual(submittedMagic(), []);
});
test("a failed read-only draw cannot discard a pending shared submission", async () => {
  browser(); globalThis.fetch = async () => { throw new TypeError("network"); };
  await assert.rejects(sendMagic(intent)); const key = pendingMagic().requestId;
  globalThis.fetch = async () => Response.json({ message: "Unavailable" }, { status: 404 });
  await assert.rejects(drawMagic()); assert.equal(pendingMagic().requestId, key);
});
test("storage failure after server confirmation does not turn a queued submission into an error", async () => {
  browser(); const id = randomUUID();
  globalThis.fetch = async () => { globalThis.localStorage.setItem = () => { throw new Error("full"); }; return Response.json({ status: "submitted", submissionId: id, kind: "bangtan", reviewStatus: "pending" }); };
  assert.equal((await sendMagic(intent)).submissionId, id);
});
test("a confirmed withdrawal removes its local receipt without deleting other private data", async () => {
  browser(); const id = randomUUID();
  globalThis.localStorage.setItem("boraverse-magic-submissions-v1", JSON.stringify([{ id, kind: "bangtan" }]));
  globalThis.localStorage.setItem("boraverse-keepsakes-v1", "untouched");
  globalThis.fetch = async () => Response.json({ status: "withdrawn", messageId: id });
  assert.equal((await sendMagic({ action: "remove", messageId: id })).status, "withdrawn");
  assert.deepEqual(submittedMagic(), []);
  assert.equal(globalThis.localStorage.getItem("boraverse-keepsakes-v1"), "untouched");
});
