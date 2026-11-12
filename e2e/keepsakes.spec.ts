import { expect, test } from "@playwright/test";

test("save a gacha result locally and create an image", async ({ page }) => {
  await page.goto("/keepsakes");
  await expect(page.getByText("No keepsakes yet.", { exact: false })).toBeVisible();
  await page.goto("/arcade/gacha");
  await page.getByRole("button", { name: "Draw a surprise" }).click();
  const title = await page.locator(".souvenir h2").innerText();
  await page.getByRole("button", { name: "Save to keepsakes" }).click();
  await expect(page.getByRole("status")).toHaveText("Saved on this device.");
  await page.goto("/keepsakes");
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await page.getByRole("button", { name: "Create image" }).click();
  await expect(page.getByRole("link", { name: "Download image" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open image" })).toBeVisible();
});

test("invalid saved data is not overwritten", async ({ page }) => {
  await page.goto("/arcade/gacha");
  await page.evaluate(() => localStorage.setItem("boraverse-keepsakes-v1", "broken"));
  await page.getByRole("button", { name: "Draw a surprise" }).click();
  await page.getByRole("button", { name: "Save to keepsakes" }).click();
  await expect(page.getByRole("status")).toContainText("Could not save");
  expect(await page.evaluate(() => localStorage.getItem("boraverse-keepsakes-v1"))).toBe("broken");
});

test("song picker links to an official video", async ({ page }) => {
  await page.goto("/arcade/music");
  await page.getByLabel("Your mood").selectOption("comfort");
  await page.getByRole("button", { name: "Find a song" }).click();
  await expect(page.getByRole("heading", { name: "Spring Day · BTS" })).toBeVisible();
  await expect(page.getByRole("link", { name: /official video on YouTube/ })).toHaveAttribute("href", "https://www.youtube.com/watch?v=xEeFrLSkMm8");
});
