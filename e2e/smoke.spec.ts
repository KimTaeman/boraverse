import { test, expect } from "@playwright/test";

for (const width of [320, 390, 430]) {
  test(`village is accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/placeholders/home-scene.svg", route => route.abort());
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "A little magic found you." })).toBeVisible();
    const ocean = page.getByRole("link", { name: "Light up our ocean" });
    await expect(ocean).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await ocean.click();
    await expect(page.getByRole("heading", { name: "Our Little Purple Ocean" })).toBeVisible();
    await page.getByRole("link", { name: "← Back to the village" }).click();
    await expect(page.getByRole("heading", { name: "A little magic found you." })).toBeVisible();
  });
}

test("unknown card shows a friendly way home", async ({ page }) => {
  await page.goto("/c/example/unknown");
  await expect(page.getByRole("link", { name: "Back to the village" })).toBeVisible();
});

test("navigation destinations and missing pages have a way home", async ({ page }) => {
  for (const [path, title] of [
    ["/arcade", "Bangtan Arcade"], ["/magic-shop", "Magic Shop"], ["/keepsakes", "My Keepsakes"], ["/garden", "Memory Garden"], ["/missing-page", "This path is a little quiet"],
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to the village" })).toBeVisible();
  }
});
