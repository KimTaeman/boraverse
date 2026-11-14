import { test } from "node:test";
import assert from "node:assert/strict";
import { oceanFetch, submitLight, confirmedKey } from "../src/components/ocean/live.ts";

function setup(t) {
  const storage = new Map();
  const originals = { window: globalThis.window, localStorage: globalThis.localStorage, fetch: globalThis.fetch };
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  t.after(() => Object.assign(globalThis, originals));
  return storage;
}

test("ambiguous failure preserves request identity; only a validated success records local history", async t => {
  const storage = setup(t), keys = [];
  globalThis.fetch = async (_url, init) => {
    keys.push(JSON.parse(init.body).idempotencyKey);
    return keys.length === 1 ? Response.json({ status: "error" }, { status: 503 }) : Response.json({ status: "accepted", totalLights: 4 });
  };
  await assert.rejects(submitLight());
  assert.equal(storage.get(confirmedKey), undefined);
  assert.equal(storage.get("boraverse-ocean-pending"), keys[0]);
  assert.deepEqual(await submitLight(), { status: "accepted", totalLights: 4 });
  assert.equal(keys[0], keys[1]);
  assert.equal(storage.get("boraverse-ocean-pending"), undefined);
  assert.equal(storage.get(confirmedKey), "1");
});

test("invalid success payload cannot record participation or discard a retry key", async t => {
  const storage = setup(t);
  globalThis.fetch = async () => Response.json({ status: "accepted", totalLights: -3 });
  await assert.rejects(submitLight());
  assert.ok(storage.get("boraverse-ocean-pending"));
  assert.equal(storage.get(confirmedKey), undefined);
});

test("caller cancellation aborts the request and retains an unresolved idempotency key", async t => {
  const storage = setup(t), controller = new AbortController();
  globalThis.fetch = (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError"))));
  const request = submitLight(controller.signal);
  controller.abort();
  await assert.rejects(request, { name: "AbortError" });
  assert.ok(storage.get("boraverse-ocean-pending"));
  assert.equal(storage.get(confirmedKey), undefined);
});

test("storage failure after server acceptance does not turn a verified success into an error", async t => {
  setup(t);
  globalThis.fetch = async () => Response.json({ status: "already_contributed", totalLights: 50 });
  globalThis.localStorage.removeItem = () => { throw new Error("Storage blocked"); };
  assert.equal((await submitLight()).status, "already_contributed");
});

test("a cancelled aggregate request does not remain in flight", async t => {
  setup(t); const controller = new AbortController();
  globalThis.fetch = (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError"))));
  const request = oceanFetch("/api/ocean", { signal: controller.signal });
  controller.abort();
  await assert.rejects(request, { name: "AbortError" });
});
