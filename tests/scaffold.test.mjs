import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

test("placeholder art manifest points to existing local files", async () => {
  const manifest = await readFile(new URL("../src/content/art.ts", import.meta.url), "utf8");
  const paths = [...manifest.matchAll(/src: "(\/placeholders\/[^"]+)"/g)].map((match) => match[1]);
  assert.equal(paths.length, 2);
  for (const path of paths) assert.ok((await readFile(new URL(`../public${path}`, import.meta.url))).length > 0);
});
