import { expect, test } from "@playwright/test";

test("the free gacha can be drawn repeatedly without an account", async ({ page }) => {
  await page.goto("/arcade/gacha");
  await expect(page.getByText("Your surprise will appear here.")).toBeVisible();
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Draw a surprise" }).click();
    await expect(page.locator(".souvenir h2")).toBeVisible();
  }
});
