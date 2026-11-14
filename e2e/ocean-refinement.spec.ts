import { expect, test } from "@playwright/test";
import { oceanProgress, sharedLightCount } from "../src/lib/ocean/visual";

for (const total of [0, 3, 50, 500, 5000]) {
  test(`confirmed total ${total} controls the constellation and atmosphere without hydration errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error" || message.type() === "warning") errors.push(message.text()); });
    await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: total, writesEnabled: true } }));
    await page.goto("/ocean");
    await expect(page.getByText(`${total.toLocaleString()} confirmed little lights`)).toBeVisible();
    await expect(page.locator(".ocean-contribution-light")).toHaveCount(sharedLightCount(total));
    const progress = await page.locator(".ocean-scene").evaluate(el => Number((el as HTMLElement).style.getPropertyValue("--ocean-progress")));
    expect(progress).toBeCloseTo(oceanProgress(total));
    await expect(page.locator(".ocean-whale img")).toHaveAttribute("src", "/assets/ocean/whale-constellation.svg");
    await page.waitForTimeout(100);
    expect(errors).toEqual([]);
  });
}

test("slow confirmation holds the charge and rapid keyboard/click activation makes one request", async ({ page }) => {
  let posts = 0;
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 3, writesEnabled: true } }));
  await page.route("**/api/ocean/contribute", async route => {
    posts++; await held;
    await route.fulfill({ status: 201, json: { status: "accepted", totalLights: 50 } });
  });
  await page.goto("/ocean");
  const button = page.getByRole("button", { name: "Add my little light" });
  await expect(button).toBeEnabled();
  await button.focus(); await page.keyboard.press("Enter");
  await page.locator(".ocean-action > .button").evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  await expect(page.locator(".ocean-scene")).toHaveAttribute("data-phase", "preparing");
  await expect(page.getByRole("status")).toContainText("slow connection", { timeout: 6000 });
  await expect(page.getByText("3 confirmed little lights")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save my moment" })).toHaveCount(0);
  expect(posts).toBe(1);
  const chargedButton = await page.locator(".ocean-action > .button").boundingBox();
  release();
  await expect(page.locator(".ocean-scene")).toHaveAttribute("data-phase", "travelling");
  const flyingButton = await page.locator(".ocean-action > .button").boundingBox();
  expect(flyingButton!.y).toBeCloseTo(chargedButton!.y, 0);
  await expect(page.getByText("3 confirmed little lights")).toBeVisible();
  await expect(page.locator(".ocean-scene")).toHaveAttribute("data-phase", "joining");
  await expect(page.getByText("50 confirmed little lights")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("joined");
  await expect(page.getByRole("button", { name: "Save my moment" })).toBeVisible();
});

test("changing reduced motion during flight skips to verified success", async ({ page }) => {
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 3, writesEnabled: true } }));
  await page.route("**/api/ocean/contribute", route => route.fulfill({ status: 201, json: { status: "accepted", totalLights: 4 } }));
  await page.goto("/ocean");
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.locator(".ocean-scene")).toHaveAttribute("data-phase", "travelling");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("status")).toContainText("joined");
  await expect(page.getByText("4 confirmed little lights")).toBeVisible();
  await expect(page.locator(".ocean-scene")).toHaveAttribute("data-reduced-motion", "true");
  await expect(page.getByRole("button", { name: "Save my moment" })).toBeVisible();
});

test("locally remembered participation never invents status or sends an automatic POST", async ({ page }) => {
  let posts = 0;
  await page.addInitScript(() => localStorage.setItem("boraverse-ocean-confirmed-v1", "1"));
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 50, writesEnabled: true } }));
  await page.route("**/api/ocean/contribute", route => { posts++; return route.fulfill({ json: { status: "already_contributed", totalLights: 50 } }); });
  await page.goto("/ocean");
  await expect(page.getByRole("status")).toContainText("browser remembers");
  expect(posts).toBe(0);
  await expect(page.getByRole("button", { name: "Save my moment" })).toHaveCount(0);
  await page.getByRole("button", { name: "Check my light" }).click();
  await expect(page.getByRole("status")).toContainText("already");
  await expect(page.locator(".ocean-scene")).toHaveAttribute("data-phase", "already_contributed");
  expect(posts).toBe(1);
});

test("leaving during a request preserves the unresolved key and cleans up animation frames", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    const frames = new Set<number>();
    const request = window.requestAnimationFrame.bind(window), cancel = window.cancelAnimationFrame.bind(window);
    Object.assign(window, { oceanTestFrames: frames });
    window.requestAnimationFrame = callback => {
      const id = request(time => { frames.delete(id); callback(time); });
      frames.add(id); return id;
    };
    window.cancelAnimationFrame = id => { frames.delete(id); cancel(id); };
  });
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 3, writesEnabled: true } }));
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/ocean/contribute", async route => { await held; await route.abort().catch(() => {}); });
  await page.goto("/ocean");
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.locator(".ocean-scene")).toHaveAttribute("data-phase", "preparing");
  const key = await page.evaluate(() => localStorage.getItem("boraverse-ocean-pending"));
  expect(key).toBeTruthy();
  await page.getByRole("link", { name: "← Back to the village" }).click();
  await expect(page.getByRole("heading", { name: "A little magic found you." })).toBeVisible();
  release();
  await expect.poll(() => page.evaluate(() => (window as unknown as { oceanTestFrames: Set<number> }).oceanTestFrames.size)).toBe(0);
  expect(await page.evaluate(() => localStorage.getItem("boraverse-ocean-pending"))).toBe(key);
  expect(errors).toEqual([]);
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Our Little Purple Ocean" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add my little light" })).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem("boraverse-ocean-pending"))).toBe(key);
});

test("loading never substitutes a made-up total and a missing canvas still confirms safely", async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await page.route("**/api/ocean", async route => { await held; await route.fulfill({ json: { status: "ok", totalLights: 3, writesEnabled: true } }); });
  await page.route("**/api/ocean/contribute", route => route.fulfill({ status: 201, json: { status: "accepted", totalLights: 4 } }));
  await page.goto("/ocean");
  await expect(page.getByText("Gathering the little lights…")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add my little light" })).toBeDisabled();
  release();
  await expect(page.getByText("3 confirmed little lights")).toBeVisible();
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.getByRole("status")).toContainText("joined");
  await expect(page.getByText("4 confirmed little lights")).toBeVisible();
});

test("a hidden scene pauses its flight and navigation cleans up a confirmed sequence", async ({ page }) => {
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 3, writesEnabled: true } }));
  await page.route("**/api/ocean/contribute", route => route.fulfill({ status: 201, json: { status: "accepted", totalLights: 4 } }));
  await page.goto("/ocean");
  await page.getByRole("button", { name: "Add my little light" }).click();
  await expect(page.locator(".ocean-scene")).toHaveAttribute("data-phase", "travelling");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.locator(".ocean-scene")).toHaveAttribute("data-paused", "true");
  await page.waitForTimeout(2500);
  await expect(page.locator(".ocean-scene")).toHaveAttribute("data-phase", "travelling");
  await expect(page.getByText("3 confirmed little lights")).toBeVisible();
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: false }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.locator(".ocean-scene")).toHaveAttribute("data-paused", "false");
  await page.getByRole("link", { name: "← Back to the village" }).click();
  await expect(page.getByRole("heading", { name: "A little magic found you." })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("boraverse-ocean-confirmed-v1"))).toBe("1");
  expect(await page.evaluate(() => localStorage.getItem("boraverse-ocean-pending"))).toBeNull();
});
