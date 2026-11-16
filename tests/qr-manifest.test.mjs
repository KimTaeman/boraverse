import { spawnSync } from "node:child_process";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createQrManifest } from "../scripts/qr-release.mjs";

const site = "https://little-boraverse.vercel.app";
const item = { id: "01", title: "Original title", message: "Original message", approved: true };
const fixture = (variants = [item], destination = "/arcade") => ({ pokemon: { destination, variants } });

test("current QR registry has no releasable content and names all eight blocked families", () => {
  const manifest = createQrManifest(site);
  assert.deepEqual(manifest.routes, []);
  assert.equal(manifest.missingFamilies.length, 8);
});
test("manifest contains only approved stable routes, without changing registry data", () => {
  const registry = fixture([item, { ...item, id: "02", approved: false }]);
  const before = JSON.stringify(registry);
  const manifest = createQrManifest(site + "/", registry);
  assert.deepEqual(manifest.routes, [{ family: "pokemon", variant: "01", url: site + "/c/pokemon/01", destination: "/arcade", title: item.title, message: item.message }]);
  assert.deepEqual(manifest.missingFamilies, []);
  assert.equal(JSON.stringify(registry), before);
});
test("QR manifest rejects noncanonical, placeholder, local and preview origins", () => {
  for (const input of [undefined, "http://boraverse.com", "https://YOUR_FINAL_DOMAIN", "https://example.com", "https://localhost", "https://127.0.0.1", "https://[::1]", "https://demo.test", "https://boraverse-git-main-owner.vercel.app", site + "/path", site + "?preview=1", site + "#fragment", "https://user:secret@boraverse.com"]) {
    assert.throws(() => createQrManifest(input), String(input));
  }
});
test("duplicate IDs, unsafe paths, empty approved copy and external destinations block the manifest", () => {
  for (const registry of [fixture([item, item]), fixture([{ ...item, id: "../01" }]), fixture([{ ...item, title: " " }]), fixture([item], "https://other.com"), fixture([item], "//other.com")]) {
    assert.throws(() => createQrManifest(site, registry));
  }
});

test("CLI exits nonzero and reports blockers instead of passing an empty release", () => {
  const result = spawnSync(process.execPath, ["scripts/check-qr.mjs", site], { encoding: "utf8", timeout: 10000 });
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.checked, []);
  assert.equal(report.missingFamilies.length, 8);
  assert.ok(report.errors.includes("No approved QR routes to verify."));
});
