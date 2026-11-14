import { expect, test } from "@playwright/test";

test("a failed request retries with the same key and only confirms after the server", async ({ page }) => {
  let calls = 0;
  const keys: string[] = [];
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 5, writesEnabled: true } }));
  await page.route("**/api/ocean/contribute", async route => {
    const body = route.request().postDataJSON();
    keys.push(body.idempotencyKey);
    calls++;
    if (calls === 1) await route.fulfill({ status: 503, json: { status: "error" } });
    else await route.fulfill({ status: 201, json: { status: "accepted", totalLights: 6 } });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ocean");
  await expect(page.getByText("5 confirmed little lights")).toBeVisible();
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.getByRole("status")).toContainText("wasn't confirmed");
  await expect(page.getByText("5 confirmed little lights")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.getByRole("status")).toContainText("joined");
  await expect(page.getByText("6 confirmed little lights")).toBeVisible();
  expect(keys[0]).toBe(keys[1]);
  await page.getByRole("button", { name: "Save my moment" }).click();
  await expect(page.getByRole("link", { name: "Download keepsake" })).toBeVisible();
});

test("duplicate does not animate a new light", async ({ page }) => {
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 5, writesEnabled: true } }));
  await page.route("**/api/ocean/contribute", route => route.fulfill({ json: { status: "already_contributed", totalLights: 5, writesEnabled: true } }));
  await page.goto("/ocean");
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.getByRole("status")).toContainText("already");
  await expect(page.locator(".new-light")).toHaveCount(0);
});

test("pending and offline states never invent a confirmed light", async ({ page, context }) => {
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 5, writesEnabled: true } }));
  let release!: () => void;
  const wait = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/ocean/contribute", async route => { await wait; await route.fulfill({ status: 503, json: { status: "error" } }); });
  await page.goto("/ocean");
  await expect(page.getByText("5 confirmed little lights")).toBeVisible();
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.getByRole("button", { name: "Sending…" })).toBeDisabled();
  await expect(page.getByText("5 confirmed little lights")).toBeVisible();
  release();
  await expect(page.getByRole("status")).toContainText("wasn't confirmed");
  await context.setOffline(true);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("status")).toContainText("offline");
  await expect(page.getByText("5 confirmed little lights")).toBeVisible();
});

test("a large confirmed total keeps the scene bounded", async ({ page }) => {
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 1000000, writesEnabled: true } }));
  await page.goto("/ocean");
  await expect(page.getByText("1,000,000 confirmed little lights")).toBeVisible();
  await expect(page.locator(".ocean-contribution-light")).toHaveCount(120);
});

test("rate limits pause retries and remain effective after reload", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 5, writesEnabled: true } }));
  await page.route("**/api/ocean/contribute", route => { requests++; return route.fulfill({ status: 429, headers: { "Retry-After": "60" }, json: { status: "error" } }); });
  await page.goto("/ocean");
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.getByRole("button", { name: "Please wait…" })).toBeDisabled();
  await page.reload();
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.getByRole("button", { name: "Please wait…" })).toBeDisabled();
  expect(requests).toBe(1);
});

test("a definite idempotency conflict permits a fresh retry key", async ({ page }) => {
  const keys: string[] = [];
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 5, writesEnabled: true } }));
  await page.route("**/api/ocean/contribute", route => {
    keys.push(route.request().postDataJSON().idempotencyKey);
    return keys.length === 1 ? route.fulfill({ status: 409, json: { status: "error", code: "CONFLICT" } }) : route.fulfill({ json: { status: "already_contributed", totalLights: 5, writesEnabled: true } });
  });
  await page.goto("/ocean");
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.getByRole("status")).toContainText("wasn't confirmed");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("status")).toContainText("already");
  expect(keys[0]).not.toBe(keys[1]);
});

test("unavailable Ocean keeps the count and pending request for retry", async ({ page }) => {
  const keys: string[] = [];
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 5, writesEnabled: true } }));
  await page.route("**/api/ocean/contribute", route => {
    keys.push(route.request().postDataJSON().idempotencyKey);
    return route.fulfill({ status: 503, json: { status: "error" } });
  });
  await page.goto("/ocean");
  await expect(page.getByText("5 confirmed little lights")).toBeVisible();
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.getByRole("status")).toContainText("taking a little rest");
  await expect(page.getByText("5 confirmed little lights")).toBeVisible();
  await expect(page.locator(".new-light")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save my moment" })).toHaveCount(0);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("status")).toContainText("taking a little rest");
  expect(keys).toHaveLength(2);
  expect(keys[1]).toBe(keys[0]);
  await page.getByRole("link", { name: "← Back to the village" }).click();
  await expect(page.getByRole("heading", { name: "A little magic found you." })).toBeVisible();
});

test("disabled writes show view-only mode without a contribution request", async ({ page }) => {
  let posts = 0;
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 5, writesEnabled: false } }));
  await page.route("**/api/ocean/contribute", route => { posts++; return route.abort(); });
  await page.goto("/ocean");
  await expect(page.getByRole("status")).toContainText("taking a little rest");
  await expect(page.getByText("5 confirmed little lights")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add my little light" })).toHaveCount(0);
  expect(posts).toBe(0);
});

test("an unavailable aggregate recovers on the next refresh", async ({ page }) => {
  await page.clock.install();
  let available = false;
  await page.route("**/api/ocean", route => available ? route.fulfill({ json: { status: "ok", totalLights: 5, writesEnabled: true } }) : route.fulfill({ status: 503 }));
  await page.goto("/ocean");
  await expect(page.getByRole("status")).toContainText("taking a little rest");
  await expect(page.getByRole("button", { name: "Add my little light" })).toHaveCount(0);
  available = true;
  await page.clock.fastForward(30000);
  await expect(page.getByRole("button", { name: "Add my little light" })).toBeEnabled();
  await expect(page.getByText("5 confirmed little lights")).toBeVisible();
});

for (const width of [320, 390, 430]) {
  test(`quiet Ocean fits at ${width}px and only launches after confirmation`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 0, writesEnabled: true } }));
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/api/ocean/contribute", async route => {
      await pending;
      await route.fulfill({ status: 201, json: { status: "accepted", totalLights: 1 } });
    });
    await page.goto("/ocean");
    await expect(page.getByText("0 confirmed little lights")).toBeVisible();
    await expect(page.locator(".ocean-contribution-light")).toHaveCount(0);
    await expect(page.locator(".ocean-whale")).toHaveAttribute("opacity", "0");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const button = page.getByRole("button", { name: "Add my little light" });
    await expect(button).toBeInViewport();
    await button.click();
    await expect(page.locator(".new-light")).toHaveCount(0);
    await expect(page.getByText("0 confirmed little lights")).toBeVisible();
    release();
    await expect(page.getByRole("status")).toContainText("joined");
    await expect(page.locator(".new-light")).toHaveCount(1);
    await expect(page.getByText("1 confirmed little lights")).toBeVisible();
    await expect(page.locator(".ocean-contribution-light")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Save my moment" })).toBeVisible();
  });
}
