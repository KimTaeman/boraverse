import { expect, test } from "@playwright/test";

test("Ocean writes are unavailable by default", async ({ request }) => {
  const response = await request.post("/api/ocean/contribute", {
    data: { visitorToken: "1b0bf57d-f0f7-4df5-84ec-e711b7f842aa", idempotencyKey: "467768ec-3c06-4fc3-8dc3-58949fd0b047" },
  });
  expect(response.status()).toBe(503);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(await response.json()).toMatchObject({ status: "error", code: "UNAVAILABLE" });
});
