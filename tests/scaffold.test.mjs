import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

test("art manifest points to existing local files and keeps web artwork within budget", async () => {
  const manifest = await readFile(new URL("../src/content/art.ts", import.meta.url), "utf8");
  const paths = [...manifest.matchAll(/src: "(\/[^"]+)"/g)].map((match) => match[1]);
  assert.ok(paths.includes("/placeholders/home-scene.svg"));
  assert.ok(paths.includes("/art/ocean/v1/sky-mobile.webp"));
  const sizes = [];
  for (const path of paths) {
    const file = await readFile(new URL(`../public${path}`, import.meta.url));
    assert.ok(file.length > 0);
    if (path.startsWith("/art/ocean/")) sizes.push(file.length);
  }
  assert.ok(sizes.reduce((total, size) => total + size, 0) <= 400000);
});
