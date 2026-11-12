import { expect, test } from "@playwright/test";

test("preview is honest, works offline and produces a PNG", async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ocean");
  await expect(page.getByText("PREVIEW ONLY · No lights are saved or shared")).toBeVisible();
  await expect(page.getByRole("button", { name: "Try adding a little light" })).toBeEnabled();
  await context.setOffline(true);
  await page.getByRole("button", { name: "Try adding a little light" }).click();
  await expect(page.getByRole("status")).toContainText("offline");
  await context.setOffline(false);
  await page.getByRole("button", { name: "Try the preview again" }).click();
  await expect(page.getByRole("status")).toContainText("not been saved or shared");
  await page.getByRole("button", { name: "Create preview image" }).click();
  await expect(page.getByRole("link", { name: "Download preview image" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open image" })).toBeVisible();
});
