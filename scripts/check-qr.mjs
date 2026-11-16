import { createQrManifest, checkQrPage } from "./qr-release.mjs";

async function main() {
  const manifest = createQrManifest(process.argv[2]);
  const report = { ...manifest, checked: [], errors: [], printApproval: "Manual owner approval and physical scan tests are still required." };
  if (!manifest.routes.length) report.errors.push("No approved QR routes to verify.");
  if (manifest.missingFamilies.length) report.errors.push(`Families without approved content: ${manifest.missingFamilies.join(", ")}`);
  if (manifest.routes.length) {
    const { chromium } = await import("@playwright/test");
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      for (const entry of manifest.routes) {
        try { await checkQrPage(page, entry); report.checked.push(entry.url); }
        catch { report.errors.push(`Reveal, trailing slash or destination check failed: ${entry.url}`); }
      }
    } finally { await browser.close(); }
  }
  console.log(JSON.stringify(report, null, 2));
  if (report.errors.length) process.exitCode = 1;
}

main().catch(() => { console.error("QR check could not complete. Supply a canonical HTTPS origin and check the registry/browser setup. No release was approved."); process.exitCode = 1; });
