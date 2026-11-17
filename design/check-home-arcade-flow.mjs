import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { chromium, webkit, expect } from "@playwright/test";

const source = await readFile(new URL("./home-arcade-flow.html", import.meta.url), "utf8");
assert.ok(!/<!doctype|<(?:html|head|body)(?:\s|>)/i.test(source));
assert.ok(!source.includes('\\"'), "Fragment must use literal markup.");
assert.ok(!/\bfetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage/.test(source), "Study must not contact APIs or use product storage.");
const preview = new URL("../out/home-arcade-flow-preview.html", import.meta.url);
const output = new URL("../out/home-arcade-flow/", import.meta.url);
await mkdir(output, { recursive: true });
const results = [];
const rendererAssets = new Set([
  "https://unpkg.com/@floating-ui/core@1.7.3/dist/floating-ui.core.umd.min.js",
  "https://unpkg.com/@floating-ui/dom@1.7.4/dist/floating-ui.dom.umd.min.js",
  "https://unpkg.com/lucide@1.17.0/dist/umd/lucide.js"
]);
for (const [name, engine] of [["chromium", chromium], ["webkit", webkit]]) {
  const browser = await engine.launch();
  try {
    for (const width of [320, 375, 390, 430, 736, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
      const errors = [], requests = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("request", request => { if (/^https?:/.test(request.url()) && !rendererAssets.has(request.url())) requests.push(request.url()); });
      await page.goto(preview.href);
      const frame = page.frameLocator("iframe");
      const root = frame.locator("#home-arcade-flow");
      const shot = stage => page.screenshot({ path: new URL(`${name}-${width}-${stage}.png`, output).pathname, fullPage: true });
      const fit = async () => assert.equal(await root.evaluate(node => node.ownerDocument.documentElement.scrollWidth <= node.ownerDocument.defaultView.innerWidth), true, `${name}/${width} overflow`);
      await expect(frame.getByRole("heading", { name: "A little magic found you.", exact: true })).toBeVisible();
      await expect(frame.getByRole("button", { name: "Visit the Purple Ocean", exact: true })).toHaveCount(1);
      await fit();
      assert.equal(await root.evaluate(node => {
        const box = node.getBoundingClientRect();
        return [...node.querySelectorAll('.hf-place-art > div')].every(art => { const bounds = art.getBoundingClientRect(); return bounds.left >= box.left && bounds.right <= box.right; });
      }), true, "Village buildings must remain inside the scene at narrow widths.");
      await shot("village");
      await frame.getByRole("button", { name: "Visit the Purple Ocean", exact: true }).click();
      await expect(frame.getByRole("heading", { name: "Our Purple Ocean", exact: true })).toBeVisible();
      await expect(frame.getByText("Connection point", { exact: false })).toBeVisible();
      await frame.getByRole("button", { name: "Back to the village", exact: true }).click();
      await frame.getByRole("button", { name: "Magic Shop", exact: true }).click();
      await expect(frame.getByRole("heading", { name: "Magic Shop", exact: true })).toBeVisible();
      await frame.getByRole("button", { name: "Back to the village", exact: true }).click();
      const arcade = frame.getByRole("button", { name: "Bangtan Arcade", exact: true });
      await arcade.focus(); await page.keyboard.press("Enter");
      await expect(frame.getByRole("button", { name: "Back to the village", exact: false })).toBeFocused();
      await expect(frame.getByRole("heading", { name: "A little play goes a long way.", exact: true })).toBeVisible();
      await fit(); await shot("arcade");
      await frame.getByRole("button", { name: "Try the gacha", exact: true }).click();
      await frame.getByRole("button", { name: "Turn the handle", exact: true }).click();
      await expect(frame.getByRole("button", { name: "Open my capsule", exact: true })).toBeVisible();
      await expect(frame.getByRole("button", { name: "Open my capsule", exact: true })).toBeFocused();
      await expect(frame.locator(".hf-ticket")).toHaveCount(0);
      await frame.getByRole("button", { name: "Open my capsule", exact: true }).click();
      const reward = await frame.locator(".hf-ticket h2").innerText();
      assert.ok(["Little Star", "Purple Cloud", "Pocket Moon", "Lucky Blossom", "Golden Ticket", "Rainbow Ribbon", "Dreaming Lantern"].includes(reward));
      await fit(); await shot("gacha-result");
      await frame.getByRole("button", { name: "Keep this little moment", exact: true }).click();
      await expect(frame.getByRole("button", { name: "Kept in this preview", exact: true })).toBeDisabled();
      await frame.getByRole("button", { name: "Back to the arcade", exact: false }).click();
      await frame.getByRole("button", { name: "Try the gacha", exact: true }).click();
      await expect(frame.locator(".hf-ticket h2")).toHaveText(reward);
      await frame.getByRole("button", { name: "Back to the arcade", exact: false }).click();
      await frame.getByRole("button", { name: "Find my song", exact: true }).click();
      await frame.getByLabel("Your mood", { exact: true }).selectOption("comfort");
      await frame.getByRole("button", { name: "Let a song find me", exact: true }).click();
      await expect(frame.getByRole("heading", { name: "Spring Day · BTS", exact: true })).toBeVisible();
      const listen = frame.getByRole("link", { name: "Listen on official YouTube", exact: false });
      await expect(listen).toHaveAttribute("href", "https://www.youtube.com/watch?v=xEeFrLSkMm8");
      await expect(listen).toHaveAttribute("rel", "noopener noreferrer");
      await expect(frame.locator("audio,iframe,video")).toHaveCount(0);
      await frame.getByRole("button", { name: "Keep this little moment", exact: true }).click();
      await fit(); await shot("song-result");
      await frame.getByRole("button", { name: "Find another song", exact: true }).click();
      await frame.getByLabel("Your mood", { exact: true }).selectOption("energy");
      await frame.getByRole("button", { name: "Let a song find me", exact: true }).click();
      await expect(frame.getByRole("heading", { name: "Dynamite · BTS", exact: true })).toBeVisible();
      await frame.getByRole("button", { name: "Preview keepsakes", exact: false }).click();
      await expect(frame.locator(".hf-memory")).toHaveCount(2);
      await expect(frame.getByText("These stay only in this preview.", { exact: true })).toBeVisible();
      await frame.getByRole("button", { name: "Back to exploring", exact: false }).click();
      await expect(frame.getByRole("heading", { name: "Dynamite · BTS", exact: true })).toBeVisible();
      await fit();
      await page.reload();
      await expect(frame.locator("#hf-count")).toHaveText("0");
      assert.deepEqual(errors, []); assert.deepEqual(requests, []);
      results.push({ engine: name, width, passed: true });
      await page.close();
    }
    const page = await browser.newPage({ reducedMotion: "no-preference" });
    await page.goto(preview.href);
    const frame = page.frameLocator("iframe");
    await frame.getByRole("button", { name: "Bangtan Arcade", exact: true }).click();
    await frame.getByRole("button", { name: "Try the gacha", exact: true }).click();
    await frame.getByRole("button", { name: "Turn the handle", exact: true }).click();
    await expect(frame.getByRole("button", { name: "Your capsule is on its way…", exact: true })).toBeDisabled();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(frame.getByRole("button", { name: "Open my capsule", exact: true })).toBeVisible();
    await frame.getByRole("button", { name: "Back to the arcade", exact: false }).click();
    await frame.getByRole("button", { name: "Find my song", exact: true }).click();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await frame.getByRole("button", { name: "Let a song find me", exact: true }).click();
    await frame.getByRole("button", { name: "Back to the arcade", exact: false }).click();
    await expect(frame.getByRole("heading", { name: "A little play goes a long way.", exact: true })).toBeVisible();
    await frame.getByRole("button", { name: "Find my song", exact: true }).click();
    await expect(frame.locator(".hf-ticket")).toHaveCount(1);
    await page.close();
  } finally { await browser.close(); }
}
await writeFile(new URL("checks.json", output), JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify({ responsiveJourneysPassed: results.length, animationAndReducedMotionChecks: 2, pageErrors: 0, productNetworkRequests: 0 }));
