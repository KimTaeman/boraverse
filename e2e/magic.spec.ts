import { expect, test } from "@playwright/test";

test("letters and playful fortunes can be revealed without an account", async ({ page }) => {
  await page.goto("/magic-shop");
  await page.getByRole("button", { name: "✉ Envelope 1" }).click();
  await expect(page.getByText("Take a breath.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Reveal a fortune" }).click();
  await expect(page.locator("section.ocean-notice p[aria-live]")).not.toBeEmpty();
});
