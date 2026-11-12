import { expect, test } from "@playwright/test";

test("all unapproved QR examples have a friendly fallback", async ({ page }) => {
  for (const family of ["pokemon", "tarot", "license", "meme", "quote", "invitation", "banknote", "receipt"]) {
    await page.goto(`/c/${family}/01`);
    await expect(page.getByRole("heading", { name: "A little surprise" })).toBeVisible();
    await expect(page.getByText("This surprise is not ready", { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to the village" })).toBeVisible();
  }
});

test("navigation and clear fallbacks work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await page.getByRole("link", { name: /Light up our ocean/ }).click();
  await expect(page.getByText("Adding a light needs JavaScript.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add my little light" })).not.toBeVisible();
  for (const path of ["/arcade/gacha", "/arcade/music", "/magic-shop", "/keepsakes"]) {
    await page.goto(path);
    await expect(page.getByText("JavaScript is needed", { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to/ }).first()).toBeVisible();
  }
  await context.close();
});
