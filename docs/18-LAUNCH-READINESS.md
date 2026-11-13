# Launch readiness — not ready

Status reviewed 2026-11-13. This is a pre-launch checklist, not an approval to deploy or print.

## Blocking items

- **Ocean:** The private schema migration and restricted group role have been applied to the configured project; a dedicated restricted login has been created and verified. The local API successfully read the real aggregate with writes disabled. The restricted login and HTTP handler passed rollback-only write, retry, duplicate, conflict and rate-limit checks; no test contribution remained. Keep `OCEAN_WRITE_ENABLED=false`. Follow `supabase/README.md`, verify private schema and role permissions, then test real aggregate reads, a controlled contribution, idempotent retry, rate limits, database outage, and the write kill switch before enabling writes. Review the proposed global limit with the owner and configure a trusted ingress limit appropriate to the host.
- **QR:** No family variants are approved. The `01` records are placeholders and currently show the fallback. Approve original artwork, copy and stable IDs, choose the real HTTPS domain, verify every resulting route, and freeze it before printing. Do not print sample or placeholder URLs as production codes.
- **Hosting:** No production deployment, domain, TLS route, monitoring or rollback has been verified. Confirm host terms and budget, configure secrets server-side, verify CA availability on the host, and deploy only with owner approval.
- **Real devices and print:** Test Android and iPhone browsers, keyboard and reduced motion, poor connectivity, image saving, and actual QR print samples on each material. Check glare, quiet zones, cutting margins and sleeve fit before a print run.
- **Content and rights:** The gacha and Magic Shop use provisional original text and placeholder art. The song picker has only two official video links; review final selections, wording, attribution and licenses. Review and finalize the privacy statement and retention policy for the actual hosting setup.

## Recovery

1. Turn off Ocean writes through `OCEAN_WRITE_ENABLED` and redeploy the configuration according to the selected host's procedure; confirm a write receives 503 without modifying the count.
2. Keep the rest of the site available where possible. Check provider status and logs without exposing tokens, IDs or secrets.
3. Verify the database before re-enabling writes. Preserve unresolved client idempotency keys; do not compensate with invented counts.
4. Roll back the application using the host's documented mechanism. Do not drop Ocean tables or erase contributions as part of routine rollback.

## Local evidence

The production dependency audit, lint, TypeScript, unit tests, production build and browser smoke suite were run locally. Browser tests use mocked Ocean responses or the disabled write switch; a local API read against the configured database succeeded, but these are not evidence of a successful production contribution. The two placeholder SVG files occupy approximately 8 KiB combined on disk. The iPhone-sized WebKit suite passed all 20 tests using `npm run test:e2e -- --config=playwright.webkit.config.ts`. It uses a single worker and extended timeouts for the slow local filesystem. This emulation does not replace testing on an actual iPhone. A full performance audit and physical-device checks remain outstanding.

## Local performance sample

On 2026-11-13, a production build was measured in headless Chromium with an iPhone 13 viewport, an empty cache, 4× CPU slowdown, 150 ms latency and 1.6 Mbps download throughput. The Ocean API response was mocked. First contentful paint was 0.83 s on home, 0.52 s on Ocean, 0.53 s on gacha and 0.50 s on Magic Shop; load events were 1.46–1.74 s. Browser-reported document and resource transfers totaled approximately 164–172 kB per page during the sample. These local measurements are indicative, not a Lighthouse score or production/mobile-device result.

The two placeholder illustrations total 2,160 bytes uncompressed, below the proposed 400 kB compressed critical-art target even before compression. Repeat performance and accessibility measurements after final art and deployment, including actual phones and cellular networks.
