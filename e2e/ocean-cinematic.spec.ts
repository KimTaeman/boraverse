import { expect, test } from "@playwright/test";

for (const [width, height] of [[320, 568], [375, 812], [390, 844], [430, 932], [1440, 900], [1920, 1080]]) {
  test(`cinematic artwork and compact controls stay separate at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 5000, writesEnabled: true } }));
    await page.goto("/ocean");
    await expect(page.getByRole("heading", { name: "Our Purple Ocean" })).toBeVisible();
    await expect(page.getByText("5,000 lights", { exact: true })).toBeVisible();
    const art = await page.locator(".ocean-artwork").boundingBox();
    const figures = await page.locator(".ocean-crowd").boundingBox();
    const count = await page.locator(".ocean-count-row").boundingBox();
    expect(count!.y).toBeGreaterThanOrEqual(art!.y + art!.height);
    expect(count!.y).toBeGreaterThanOrEqual(figures!.y + figures!.height);
    const sky = await page.locator(".ocean-nebula").boundingBox();
    expect(sky!.x).toBe(0); expect(sky!.width).toBe(width); expect(sky!.height).toBeGreaterThanOrEqual(height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const button = page.getByRole("button", { name: "Add my little light" });
    await button.scrollIntoViewIfNeeded(); await expect(button).toBeInViewport();
    await expect(page.getByRole("status")).toBeEmpty();
    await expect(page.getByText("Illustration placeholders", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Keep exploring" })).toHaveCount(0);
  });
}

test("count information is keyboard accessible and preserves legal/privacy navigation", async ({ page }) => {
  let posts = 0;
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 50, writesEnabled: true } }));
  await page.route("**/api/ocean/contribute", route => { posts++; return route.abort(); });
  await page.goto("/ocean");
  const info = page.getByRole("button", { name: "About these lights" });
  await info.focus(); await page.keyboard.press("Space");
  const panel = page.getByRole("dialog", { name: "About these lights" });
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("accepted contributions");
  await expect(panel).toContainText("not necessarily represent unique people");
  await expect(panel).toContainText("limited per browser");
  await expect(panel.getByRole("link", { name: "Privacy", exact: true })).toBeVisible();
  await page.keyboard.press("Escape"); await expect(panel).toBeHidden(); await expect(info).toBeFocused();
  await info.click(); await panel.getByRole("button", { name: "Close information" }).click();
  await expect(panel).toBeHidden(); await expect(info).toBeFocused(); expect(posts).toBe(0);
  await info.click(); await panel.getByRole("link", { name: "About this project" }).click();
  await expect(page.getByText("It is not affiliated", { exact: false })).toBeVisible();
  await expect(page.getByText("Illustrations are original", { exact: false })).toBeVisible();
});

test("confirmed success gives the emotional acknowledgement and keepsake priority", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 3, writesEnabled: true } }));
  await page.route("**/api/ocean/contribute", route => route.fulfill({ status: 201, json: { status: "accepted", totalLights: 4 } }));
  await page.goto("/ocean"); await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.getByRole("status")).toHaveText("Your light is shining ♡");
  await expect(page.getByText("You made our sky a little brighter.")).toBeVisible();
  await expect(page.getByText("4 lights", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save my moment" })).toBeEnabled();
  await expect(page.locator(".ocean-secondary").getByRole("link", { name: "Keep exploring" })).toBeVisible();
});
