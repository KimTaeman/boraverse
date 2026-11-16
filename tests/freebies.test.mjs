import { test } from "node:test";
import assert from "node:assert/strict";
import { freebies, approvedFreebie } from "../src/content/freebies.ts";

test("all eight planned families exist with only safe internal destinations", () => {
  assert.deepEqual(Object.keys(freebies).sort(), ["banknote", "invitation", "license", "meme", "pokemon", "quote", "receipt", "tarot"]);
  for (const item of Object.values(freebies)) assert.ok(["/", "/arcade", "/magic-shop", "/ocean"].includes(item.destination));
});
test("unknown variants never reveal content", () => {
  assert.equal(approvedFreebie("pokemon", "not-reviewed"), null);
  assert.equal(approvedFreebie("unknown", "01"), null);
  assert.equal(approvedFreebie("__proto__", "01"), null);
});
test("only an explicitly approved variant resolves to its family destination", () => {
  const variants = freebies.pokemon.variants;
  variants.push({ id: "test", title: "Test", message: "Test", approved: false });
  try {
    assert.equal(approvedFreebie("pokemon", "test"), null);
    variants[variants.length - 1].approved = true;
    assert.equal(approvedFreebie("pokemon", "test")?.destination, "/arcade");
  } finally { variants.pop(); }
});

test("all eight owner-approved previews resolve to their reviewed destination", () => {
  for (const [family, entry] of Object.entries(freebies)) {
    assert.equal(entry.variants.length, 1);
    const item = entry.variants[0];
    assert.equal(item.id, "01");
    assert.equal(item.approved, true);
    assert.ok(item.title.trim().length > 0 && item.message.trim().length > 0);
    assert.notEqual(item.title, "A little surprise");
    assert.deepEqual(approvedFreebie(family, item.id), { ...item, destination: entry.destination });
  }
});
