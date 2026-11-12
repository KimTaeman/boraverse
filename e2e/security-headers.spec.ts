import { expect, test } from "@playwright/test";

test("pages and API responses include baseline security headers", async ({ request }) => {
  for (const path of ["/", "/api/ocean"]) {
    const response = await request.get(path);
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response.headers()["x-frame-options"]).toBe("DENY");
    expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(response.headers()["permissions-policy"]).toContain("camera=()");
  }
});
