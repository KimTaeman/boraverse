import { expect, test } from "@playwright/test";

for (const width of [390, 1024]) {
  test(`skip link reaches the Ocean using only the keyboard at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    const ocean = page.getByRole("link", { name: "Light up our ocean" });
    await expect(ocean).toBeFocused();
    await expect(ocean).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Our Little Purple Ocean" })).toBeVisible();
  });
}

test("reduced motion keeps the village and accepted Ocean light static", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 5 } }));
  await page.route("**/api/ocean/contribute", route => route.fulfill({ status: 201, json: { status: "accepted", totalLights: 6 } }));
  await page.goto("/");
  const portal = page.locator(".room-card").first();
  await portal.hover();
  await expect(portal).toHaveCSS("transition-duration", "0s");
  await expect(portal).toHaveCSS("transform", "none");
  await page.getByRole("link", { name: "Light up our ocean" }).click();
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.getByRole("status")).toContainText("joined");
  await expect(page.getByText("6 confirmed little lights")).toBeVisible();
  await expect(page.locator(".new-light")).toHaveCSS("animation-name", "none");
  await expect(page.getByRole("button", { name: "Create keepsake image" })).toBeVisible();
});
