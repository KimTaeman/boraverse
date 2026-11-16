import { expect, test } from "@playwright/test";

test("privacy explains local keepsakes, server retention and external listening without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/privacy");
    const main = page.getByRole("main");
    await expect(main.getByText("it is not uploaded or synced", { exact: false })).toBeVisible();
    await expect(main.getByText("clear this site’s data", { exact: false })).toBeVisible();
    await expect(main.getByText("does not delete contributions already stored on the server", { exact: false })).toBeVisible();
    await expect(main.getByText("YouTube’s own privacy practices apply", { exact: false })).toBeVisible();
    await main.getByRole("link", { name: "← Back to the village" }).click();
    await expect(page.getByRole("heading", { name: "A little magic found you." })).toBeVisible();
  } finally { await context.close(); }
});

test("games, local saves and image export make no write or external requests", async ({ page, context, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const external: string[] = [];
  const writes: string[] = [];
  context.on("request", request => {
    if (!/^https?:/.test(request.url())) return;
    if (new URL(request.url()).origin !== origin) external.push(request.url());
    if (!["GET", "HEAD"].includes(request.method())) writes.push(request.method());
  });
  await page.goto("/arcade/gacha");
  await page.getByRole("button", { name: "Draw a surprise" }).click();
  await page.getByRole("button", { name: "Save to keepsakes" }).click();
  await expect(page.getByRole("status")).toHaveText("Saved on this device.");
  await page.goto("/magic-shop?experience=letters");
  await page.getByRole("button", { name: "A little breathing room", exact: true }).click();
  await page.getByRole("button", { name: "Save to keepsakes" }).click();
  await expect(page.getByRole("status")).toHaveText("Saved on this device.");
  await page.goto("/keepsakes");
  await expect(page.locator("article")).toHaveCount(2);
  await page.getByRole("button", { name: "Create image" }).first().click();
  await expect(page.getByRole("link", { name: "Download image" })).toHaveAttribute("href", /^blob:/);
  await page.goto("/arcade/music");
  await page.getByLabel("Your mood").selectOption("comfort");
  await page.getByRole("button", { name: "Find a song" }).click();
  const listening = page.getByRole("link", { name: /official video on YouTube/ });
  await expect(listening).toBeVisible();
  expect(external).toEqual([]);
  expect(writes).toEqual([]);
  await context.route("https://www.youtube.com/**", route => route.fulfill({ contentType: "text/html", body: "<h1>Local listening-link test</h1>" }));
  const popup = context.waitForEvent("page");
  await listening.click();
  const opened = await popup;
  await expect(opened.getByRole("heading", { name: "Local listening-link test" })).toBeVisible();
  expect(external).toEqual(["https://www.youtube.com/watch?v=xEeFrLSkMm8"]);
  expect(writes).toEqual([]);
});
