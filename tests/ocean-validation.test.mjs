import { test } from "node:test";
import assert from "node:assert/strict";
import { validateContribution } from "../src/lib/ocean/validation.ts";

const valid = { visitorToken: "1b0bf57d-f0f7-4df5-84ec-e711b7f842aa", idempotencyKey: "467768ec-3c06-4fc3-8dc3-58949fd0b047" };
test("accepts valid identifiers and defaults the concert day", () => {
  assert.equal(validateContribution(valid)?.concertDay, "unspecified");
});
test("rejects malformed identifiers, dates and unexpected fields", () => {
  for (const input of [null, [], { ...valid, visitorToken: "bad" }, { ...valid, concertDay: "2026-12-04" }, { ...valid, message: "hello" }]) assert.equal(validateContribution(input), null);
});
