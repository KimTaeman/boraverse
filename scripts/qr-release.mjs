import assert from "node:assert/strict";
import { freebies } from "../src/content/freebies.ts";

export function createQrManifest(siteUrl, registry = freebies) {
  const site = new URL(siteUrl);
  assert.ok(site.protocol === "https:" && !site.username && !site.password && site.pathname === "/" && !site.search && !site.hash,
    "Supply an HTTPS origin without credentials, path, query or fragment.");
  assert.ok(!/(localhost|example\.(com|org|net)|your[_-]?final[_-]?domain|\.invalid$|\.test$|\.local$|\.vercel\.app$)/i.test(site.hostname) || site.hostname === "little-boraverse.vercel.app",
    "Use a real canonical host, not an example, local or Vercel preview host.");
  assert.ok(!/^[\d.]+$/.test(site.hostname) && !site.hostname.includes(":"), "Use a public hostname, not an IP address.");
  const routes = [], missingFamilies = [], seen = new Set();
  for (const [family, entry] of Object.entries(registry)) {
    let approved = 0;
    for (const item of entry.variants) {
      assert.match(family, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      const path = `/c/${family}/${item.id}`;
      assert.ok(!seen.has(path), `Duplicate QR path: ${path}`);
      seen.add(path);
      if (item.approved !== true) continue;
      assert.ok(item.title.trim() && item.message.trim(), `Empty approved copy: ${path}`);
      assert.ok(["/", "/arcade", "/magic-shop", "/ocean"].includes(entry.destination), `Invalid destination: ${path}`);
      approved++;
      routes.push({ family, variant: item.id, url: site.origin + path, destination: entry.destination, title: item.title, message: item.message });
    }
    if (!approved) missingFamilies.push(family);
  }
  return { site: site.origin, routes, missingFamilies };
}

export async function checkQrPage(page, entry) {
  for (const url of [entry.url, entry.url + "/"]) {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    assert.equal(response?.status(), 200, `QR page failed: ${url}`);
    assert.equal(page.url().replace(/\/$/, ""), entry.url, `Unexpected QR redirect: ${url}`);
    await page.getByRole("heading", { name: entry.title, exact: true }).waitFor();
    await page.getByText(entry.message, { exact: true }).waitFor();
    assert.equal(await page.getByRole("link", { name: "Explore this little corner", exact: true }).getAttribute("href"), entry.destination);
    await page.getByRole("link", { name: "Visit the village", exact: true }).waitFor();
  }
  const destination = await page.goto(new URL(entry.destination, entry.url).href, { waitUntil: "domcontentloaded", timeout: 30000 });
  assert.equal(destination?.status(), 200, `Destination failed: ${entry.destination}`);
  assert.equal(new URL(page.url()).origin, new URL(entry.url).origin, "Destination left the canonical host.");
  assert.equal(new URL(page.url()).pathname.replace(/\/$/, ""), entry.destination.replace(/\/$/, ""), "Destination redirected to another path.");
}

