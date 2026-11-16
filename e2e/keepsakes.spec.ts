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

const savedItem = { id: "saved-test", title: "A little test memory", text: "A memory kept only in this browser." };

test("blocked keepsake reads can be retried without changing saved data", async ({ page }) => {
  await page.addInitScript(item => {
    localStorage.setItem("boraverse-keepsakes-v1", JSON.stringify([item]));
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      if (key === "boraverse-keepsakes-v1") throw new DOMException("Blocked", "SecurityError");
      return original.call(this, key);
    };
    Object.assign(window, { restoreKeepsakeRead: () => { Storage.prototype.getItem = original; } });
  }, savedItem);
  await page.goto("/keepsakes");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("not overwritten");
  await expect(page.getByText("No keepsakes yet.", { exact: false })).toHaveCount(0);
  await page.evaluate(() => (window as unknown as { restoreKeepsakeRead: () => void }).restoreKeepsakeRead());
  await page.getByRole("button", { name: "Try opening keepsakes again" }).click();
  await expect(page.getByRole("heading", { name: savedItem.title })).toBeVisible();
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("boraverse-keepsakes-v1")!))).toEqual([savedItem]);
});

for (const failure of ["no-context", "throws", "empty-blob"] as const) {
  test(`image export recovers from ${failure} without offering a stale image`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(item => localStorage.setItem("boraverse-keepsakes-v1", JSON.stringify([item])), savedItem);
    await page.goto("/keepsakes");
    const create = page.getByRole("button", { name: "Create image" });
    await create.click();
    await expect(page.getByRole("link", { name: "Download image" })).toBeVisible();
    await page.evaluate(mode => {
      const canvas = HTMLCanvasElement.prototype;
      const originalContext = canvas.getContext;
      const originalBlob = canvas.toBlob;
      if (mode === "no-context") canvas.getContext = (() => null) as typeof canvas.getContext;
      else canvas.toBlob = callback => {
        if (mode === "throws") throw new DOMException("Unavailable", "SecurityError");
        callback(null);
      };
      Object.assign(window, { restoreKeepsakeExport: () => { canvas.getContext = originalContext; canvas.toBlob = originalBlob; } });
    }, failure);
    await create.click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Your keepsake is still saved");
    await expect(page.getByRole("link", { name: "Download image" })).toHaveCount(0);
    await expect(create).toBeEnabled();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("boraverse-keepsakes-v1")!))).toEqual([savedItem]);
    await page.evaluate(() => (window as unknown as { restoreKeepsakeExport: () => void }).restoreKeepsakeExport());
    await create.click();
    await expect(page.getByRole("link", { name: "Download image" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test("full storage never reports a saved result and supports retry", async ({ page }) => {
  await page.addInitScript(item => {
    localStorage.setItem("boraverse-keepsakes-v1", JSON.stringify([item]));
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "boraverse-keepsakes-v1") throw new DOMException("Full", "QuotaExceededError");
      return original.call(this, key, value);
    };
    Object.assign(window, { restoreKeepsakeWrite: () => { Storage.prototype.setItem = original; } });
  }, savedItem);
  await page.goto("/arcade/gacha");
  await page.getByRole("button", { name: "Draw a surprise" }).click();
  await page.getByRole("button", { name: "Save to keepsakes" }).click();
  await expect(page.getByRole("status")).toContainText("Could not save");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("boraverse-keepsakes-v1")!))).toEqual([savedItem]);
  await page.evaluate(() => (window as unknown as { restoreKeepsakeWrite: () => void }).restoreKeepsakeWrite());
  await page.getByRole("button", { name: "Save to keepsakes" }).click();
  await expect(page.getByRole("status")).toHaveText("Saved on this device.");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("boraverse-keepsakes-v1")!).length)).toBe(2);
});
