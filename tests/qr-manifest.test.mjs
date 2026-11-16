import { spawnSync } from "node:child_process";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createQrManifest } from "../scripts/qr-release.mjs";

const site = "https://little-boraverse.vercel.app";
const item = { id: "01", title: "Original title", message: "Original message", approved: true };
const fixture = (variants = [item], destination = "/arcade") => ({ pokemon: { destination, variants } });

test("current QR registry includes all eight approved website previews", () => {
  const manifest = createQrManifest(site);
  assert.equal(manifest.routes.length, 8);
  assert.deepEqual(manifest.missingFamilies, []);
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

test("unapproved content remains absent from the manifest", () => {
  const manifest = createQrManifest(site, fixture([{ ...item, approved: false }]));
  assert.deepEqual(manifest.routes, []);
  assert.deepEqual(manifest.missingFamilies, ["pokemon"]);
});
test("CLI rejects a placeholder origin before launching a browser", () => {
  const result = spawnSync(process.execPath, ["scripts/check-qr.mjs", "https://example.com"], { encoding: "utf8", timeout: 10000 });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /No release was approved/);
  assert.equal(result.stdout, "");
});
