import { test } from "node:test";
import assert from "node:assert/strict";
import { attemptPreview } from "../src/components/ocean/attempt.ts";
import { createMockOcean } from "../src/components/ocean/mock.ts";

test("the preview adapter accepts once and then returns duplicate", async () => {
  const adapter = createMockOcean();
  assert.equal(await adapter.contribute("first"), "accepted");
  assert.equal(await adapter.contribute("second"), "already_contributed");
});

test("failed previews retry with the same key and clear it after a result", async () => {
  const key = { current: null };
  const seen = [];
  const adapter = { async contribute(value) { seen.push(value); if (seen.length === 1) throw Error("offline"); return "accepted"; } };
  assert.equal(await attemptPreview(adapter, key, () => "same-key"), "failed");
  assert.equal(key.current, "same-key");
  assert.equal(await attemptPreview(adapter, key, () => "new-key"), "accepted");
  assert.deepEqual(seen, ["same-key", "same-key"]);
  assert.equal(key.current, null);
});
