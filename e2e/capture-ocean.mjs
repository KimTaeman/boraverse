// Local browser fixtures only: no production demo route or database writes.
import { chromium } from "@playwright/test";
import { mkdir, rename, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const base = process.env.OCEAN_CAPTURE_URL || "http://127.0.0.1:3469";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(base).hostname), "Capture fixtures must use a local preview");
const output = "out/ocean-cinematic";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const errors = [], checks = [], sequences = [];
try {
  for (const [name, width, height] of [["mobile", 390, 844], ["desktop", 1440, 900]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (["warning", "error"].includes(message.type())) errors.push(message.text()); });
    for (const total of [0, 3, 50, 500, 5000]) {
      await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: total, writesEnabled: true } }));
      await page.goto(`${base}/ocean`);
      await page.getByText(`${total.toLocaleString()} lights`).waitFor();
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `${output}/after-${name}-${total}.png`, fullPage: true });
      await page.unroute("**/api/ocean");
    }
    await page.getByRole("button", { name: "About these lights" }).click();
    await page.screenshot({ path: `${output}/information-${name}.png`, fullPage: true });
    await page.keyboard.press("Escape");
    await context.close();
    const recorded = await browser.newContext({ viewport: { width, height }, reducedMotion: "no-preference", recordVideo: { dir: `${output}/video`, size: { width, height } } });
    const film = await recorded.newPage();
    film.on("pageerror", error => errors.push(error.message));
    await film.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 3, writesEnabled: true } }));
    await film.route("**/api/ocean/contribute", async route => { await new Promise(resolve => setTimeout(resolve, 100)); await route.fulfill({ status: 201, json: { status: "accepted", totalLights: 4 } }); });
    await film.goto(`${base}/ocean`);
    await film.getByText("3 lights").waitFor();
    await film.waitForLoadState("networkidle");
    await film.waitForTimeout(700);
    const tapped = Date.now();
    await film.getByRole("button", { name: "Add my little light" }).click();
    await film.getByRole("button", { name: "Save my moment" }).waitFor();
    sequences.push({ viewport: name, fromTapToSuccessMs: Date.now() - tapped });
    await film.screenshot({ path: `${output}/success-${name}.png`, fullPage: true });
    await film.getByRole("button", { name: "Save my moment" }).click();
    await film.getByRole("link", { name: "Download keepsake" }).waitFor();
    if (name === "mobile") {
      const bytes = await film.getByRole("link", { name: "Download keepsake" }).evaluate(async link => Array.from(new Uint8Array(await (await fetch(link.href)).arrayBuffer())));
      await writeFile(`${output}/keepsake.png`, Buffer.from(bytes));
    }
    await film.waitForTimeout(800);
    const video = film.video();
    await recorded.close();
    await rename(await video.path(), `${output}/success-${name}.webm`);
    const states = await browser.newContext({ viewport: { width, height } });
    const statePage = await states.newPage();
    await statePage.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 500, writesEnabled: true } }));
    let release;
    const held = new Promise(resolve => { release = resolve; });
    await statePage.route("**/api/ocean/contribute", async route => { await held; await route.fulfill({ status: 503, json: { status: "error" } }); });
    await statePage.goto(`${base}/ocean`);
    await statePage.getByRole("button", { name: "Add my little light" }).click();
    await statePage.waitForFunction(() => document.querySelector(".ocean-scene")?.dataset.phase === "preparing");
    await statePage.screenshot({ path: `${output}/submitting-${name}.png`, fullPage: true });
    release();
    await statePage.getByRole("button", { name: "Try again" }).waitFor();
    await statePage.screenshot({ path: `${output}/error-${name}.png`, fullPage: true });
    await states.setOffline(true);
    await statePage.getByRole("button", { name: "Try again" }).click();
    await statePage.waitForFunction(() => document.querySelector(".ocean-scene")?.dataset.phase === "offline");
    await statePage.screenshot({ path: `${output}/offline-${name}.png`, fullPage: true });
    await states.setOffline(false);
    await statePage.unroute("**/api/ocean/contribute");
    await statePage.route("**/api/ocean/contribute", route => route.fulfill({ json: { status: "already_contributed", totalLights: 500 } }));
    await statePage.getByRole("button", { name: "Try again" }).click();
    await statePage.getByRole("button", { name: "Save my moment" }).waitFor();
    await statePage.screenshot({ path: `${output}/already-contributed-${name}.png`, fullPage: true });
    await states.close();

  }
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.route("**/api/ocean", route => route.fulfill({ json: { status: "ok", totalLights: 500, writesEnabled: true } }));
  for (const [width, height] of [[320, 568], [375, 812], [390, 844], [430, 932], [768, 1024], [1366, 768], [1440, 900], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`${base}/ocean`);
    await page.getByText("500 lights").waitFor();
    await page.waitForLoadState("networkidle");
    const scene = await page.locator(".ocean-nebula").boundingBox();
    assert.equal(scene.x, 0); assert.equal(scene.width, width); assert.ok(scene.height >= height);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const button = await page.getByRole("button", { name: "Add my little light" }).boundingBox();
    if (height >= 768) assert.ok(button.y + button.height <= height, "CTA should fit on a normal viewport");
    await page.screenshot({ path: `${output}/responsive-${width}x${height}.png`, fullPage: true });
    checks.push({ width, height, scene, button });
  }
  assert.deepEqual(errors, []);
  await writeFile(`${output}/checks.json`, JSON.stringify({ fixturesOnly: true, consoleErrors: errors, sequences, responsive: checks }, null, 2));
  await writeFile(`${output}/README.md`, "# Cinematic Purple Ocean review\n\nEvery count and successful response here is a local Playwright fixture. No live contributions were created.\n\n- before-*-500.png: previous text-heavy version.\n- after-{mobile,desktop}-{0,3,50,500,5000}.png: independent milestone progression.\n- success-*.webm: existing curved-flight choreography with strengthened arrival response and short success copy.\n- submitting/error/offline/already-contributed-*.png: state checks.\n- information-*.png: keyboard-accessible count/legal/privacy information panel.\n- responsive-*.png and checks.json: eight viewport checks and recorded timing.\n- keepsake.png: actual PNG export.\n\nRun a local preview with writes disabled, then OCEAN_CAPTURE_URL=http://127.0.0.1:3467 node e2e/capture-ocean.mjs. Physical-phone QA and final artist illustrations remain pending.\n");
  console.log(`Captured progression, two recordings, keepsake and ${checks.length} responsive checks in ${output}.`);
} finally { await browser.close(); }
