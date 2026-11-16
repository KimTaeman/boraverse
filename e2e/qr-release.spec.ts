import { expect, test } from "@playwright/test";
import { freebies } from "../src/content/freebies";
import { checkQrPage, createQrManifest } from "../scripts/qr-release.mjs";

const title = "Approved fixture title";
const message = "Original fixture message";
const site = "https://little-boraverse.vercel.app";
const entry = createQrManifest(site, { ...freebies, pokemon: { destination: "/arcade", variants: [{ id: "01", title, message, approved: true }] } }).routes[0];

test("QR checker verifies the reveal, slash URL and destination using local fixtures only", async ({ page }) => {
  const visited: string[] = [];
  await page.route(site + "/**", route => {
    const url = new URL(route.request().url());
    visited.push(url.pathname);
    return route.fulfill({ contentType: "text/html", body: url.pathname === "/arcade" ? "<h1>Arcade</h1>" : `<h1>${title}</h1><p>${message}</p><a href="/arcade">Explore this little corner</a><a href="/">Visit the village</a>` });
  });
  await checkQrPage(page, entry);
  expect(visited).toEqual(["/c/pokemon/01", "/c/pokemon/01/", "/arcade"]);
});

test("a 200 fallback page cannot pass the approved QR reveal check", async ({ page }) => {
  page.setDefaultTimeout(1000);
  await page.route(site + "/**", route => route.fulfill({ contentType: "text/html", body: "<h1>A little surprise</h1><p>This surprise is not ready.</p>" }));
  await expect(checkQrPage(page, entry)).rejects.toThrow();
});

test("a wrong destination cannot pass even when approved copy matches", async ({ page }) => {
  await page.route(site + "/**", route => route.fulfill({ contentType: "text/html", body: `<h1>${title}</h1><p>${message}</p><a href="/ocean">Explore this little corner</a><a href="/">Visit the village</a>` }));
  await expect(checkQrPage(page, entry)).rejects.toThrow();
});
