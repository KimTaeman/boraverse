import { expect, test } from "@playwright/test";

test("a failed request retries with the same key and only confirms after the server", async ({ page }) => {
  let calls = 0;
  const keys: string[] = [];
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 5 } }));
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
  await page.getByRole("button", { name: "Create keepsake image" }).click();
  await expect(page.getByRole("link", { name: "Download keepsake" })).toBeVisible();
});

test("duplicate does not animate a new light", async ({ page }) => {
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 5 } }));
  await page.route("**/api/ocean/contribute", route => route.fulfill({ json: { status: "already_contributed", totalLights: 5 } }));
  await page.goto("/ocean");
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.getByRole("status")).toContainText("already");
  await expect(page.locator(".new-light")).toHaveCount(0);
});

test("pending and offline states never invent a confirmed light", async ({ page, context }) => {
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 5 } }));
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
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 1000000 } }));
  await page.goto("/ocean");
  await expect(page.getByText("1,000,000 confirmed little lights")).toBeVisible();
  await expect(page.locator(".ocean-stars circle")).toHaveCount(42);
});
