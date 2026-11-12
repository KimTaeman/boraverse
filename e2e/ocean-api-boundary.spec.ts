import { expect, test } from "@playwright/test";

test("invalid bodies and database outages fail safely", async ({ request }) => {
  const endpoint = "/api/ocean/contribute";
  const malformed = await request.post(endpoint, { headers: { "content-type": "application/json" }, data: "{" });
  expect(malformed.status()).toBe(400);
  const invalid = await request.post(endpoint, { data: { visitorToken: "bad", idempotencyKey: "bad" } });
  expect(invalid.status()).toBe(400);
  const oversized = await request.post(endpoint, { headers: { "content-type": "application/json" }, data: "x".repeat(1025) });
  expect(oversized.status()).toBe(413);
  const unavailable = await request.post(endpoint, { data: { visitorToken: "1b0bf57d-f0f7-4df5-84ec-e711b7f842aa", idempotencyKey: "467768ec-3c06-4fc3-8dc3-58949fd0b047" } });
  expect(unavailable.status()).toBe(503);
  expect(await unavailable.json()).toMatchObject({ status: "error", code: "UNAVAILABLE" });
  expect((await request.get("/api/ocean")).status()).toBe(503);
});
