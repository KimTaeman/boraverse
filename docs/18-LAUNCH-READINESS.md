# Launch readiness — not ready

Status reviewed 2026-11-14. This is a pre-launch checklist, not an approval to deploy or print.

## Blocking items

- **Ocean:** The private schema migration and restricted group role have been applied to the configured project; a dedicated restricted login has been created and verified. The local API successfully read the real aggregate with writes disabled. The restricted login and HTTP handler passed rollback-only write, retry, duplicate, conflict and rate-limit checks; no test contribution remained. Keep `OCEAN_WRITE_ENABLED=false`. Follow `supabase/README.md`, verify private schema and role permissions, then test real aggregate reads, a controlled contribution, idempotent retry, rate limits, database outage, and the write kill switch before enabling writes. Review the proposed global limit with the owner and configure a trusted ingress limit appropriate to the host.
- **QR:** No family variants are approved. The `01` records are placeholders and currently show the fallback. Approve original artwork, copy and stable IDs, choose the real HTTPS domain, verify every resulting route, and freeze it before printing. Do not print sample or placeholder URLs as production codes.
- **Hosting:** The owner-approved placeholder build is deployed on Vercel Hobby at https://little-boraverse.vercel.app. HTTPS pages and the real aggregate read passed, including the server-only inline CA configuration. Production log-query access is verified; actual host rollback remains untested. The committed project is now published to GitHub, but Vercel Git integration still requires an owner-side app-access check; deployments currently use the CLI. The URL is not yet approved for printed QR codes.
- **Real devices and print:** Test Android and iPhone browsers, keyboard and reduced motion, poor connectivity, image saving, and actual QR print samples on each material. Check glare, quiet zones, cutting margins and sleeve fit before a print run.
- **Content and rights:** The gacha and Magic Shop use provisional original text and placeholder art. The song picker has only two official video links; review final selections, wording, attribution and licenses. Review and finalize the privacy statement and retention policy for the actual hosting setup.

## Recovery

1. Turn off Ocean writes through `OCEAN_WRITE_ENABLED` and redeploy the configuration according to the selected host's procedure; confirm a write receives 503 without modifying the count.
2. Keep the rest of the site available where possible. Check provider status and logs without exposing tokens, IDs or secrets.
3. Verify the database before re-enabling writes. Preserve unresolved client idempotency keys; do not compensate with invented counts.
4. Roll back the application using the host's documented mechanism. Do not drop Ocean tables or erase contributions as part of routine rollback.

## Local evidence

The production dependency audit, lint, TypeScript, unit tests, production build and browser smoke suite were run locally. Browser tests use mocked Ocean responses or the disabled write switch; a local API read against the configured database succeeded, but these are not evidence of a successful production contribution. The two placeholder SVG files occupy approximately 8 KiB combined on disk. The complete Chromium and iPhone-sized WebKit suites each passed all 27 tests after the availability changes; the WebKit command is `npm run test:e2e -- --config=playwright.webkit.config.ts`. It uses a single worker and extended timeouts for the slow local filesystem. This emulation does not replace testing on an actual iPhone. Performance auditing on the deployed site and physical-device checks remain outstanding.

## Local performance sample

On 2026-11-13, a production build was measured in headless Chromium with an iPhone 13 viewport, an empty cache, 4× CPU slowdown, 150 ms latency and 1.6 Mbps download throughput. The Ocean API response was mocked. First contentful paint was 0.83 s on home, 0.52 s on Ocean, 0.53 s on gacha and 0.50 s on Magic Shop; load events were 1.46–1.74 s. Browser-reported document and resource transfers totaled approximately 164–172 kB per page during the sample. These local measurements are indicative, not a Lighthouse score or production/mobile-device result.

The two placeholder illustrations total 2,160 bytes uncompressed, below the proposed 400 kB compressed critical-art target even before compression. Repeat performance and accessibility measurements after final art and deployment, including actual phones and cellular networks.

## Keyboard and reduced-motion evidence

The three targeted tests in `e2e/accessibility.spec.ts` passed in Chromium and iPhone-sized WebKit. At 390px and 1024px, keyboard-only navigation reveals the skip link, bypasses the header, shows a focus outline on the primary Ocean link and opens the Ocean with Enter. With reduced motion enabled, village hover movement and the accepted Ocean light animation are disabled while confirmation and keepsake actions remain available. Ocean responses are mocked; these checks do not replace screen-reader or physical-device testing.

## Production Lighthouse sample

Lighthouse 13.6.0 audited the local production build at `/` and `/ocean` using its default mobile simulation and the installed Playwright Chromium. Both pages scored **99 performance / 100 automated accessibility**, with no run warnings or failing automated accessibility checks. Ocean was measured in its initial state without submitting a contribution.

| Metric | Home | Ocean |
|---|---|---|
| First contentful paint | 0.8 s | 0.8 s |
| Largest contentful paint | 0.8 s | 0.8 s |
| Total blocking time | 70 ms | 90 ms |
| Cumulative layout shift | 0 | 0 |
| Speed index | 2.7 s | 0.8 s |

Reproduce after `npm run build` and starting the production server: set `CHROME_PATH` to the installed Chromium executable and run `npx --yes lighthouse@13.6.0 <local-page-url> --chrome-flags="--headless" --only-categories=performance,accessibility`. This is a single local lab sample per page, not field Core Web Vitals or a full accessibility certification. Recheck after deployment and final artwork; test screen readers and actual devices manually. Framework JavaScript and render-blocking CSS diagnostics remain optimization opportunities, with no launch-blocking issue identified by this sample.

## Ocean unavailable fallback

A contribution receiving HTTP 503 now displays an explicit resting-ocean message and offers a retry. The confirmed count stays unchanged, no accepted light or keepsake is shown, and the unresolved idempotency key is preserved. All seven Ocean browser tests passed in Chromium; the targeted unavailable-state test also passed in WebKit. These responses were mocked and do not verify production host recovery.

## Initial Ocean view-only mode

The aggregate endpoint now includes the public `writesEnabled` hint. The UI waits for availability before allowing a submission, shows view-only mode when writes are disabled or reads fail, and retries availability on its existing 30-second refresh. Previously confirmed totals are preserved on read failures. POST still enforces the kill switch independently; cached availability can lag by the aggregate cache window. Twelve Ocean/accessibility checks passed in Chromium and both new view-only/recovery checks passed in WebKit, alongside lint, TypeScript, six unit tests and the production build. Production host verification remains outstanding.

## Local regression handoff

The complete browser suites passed: Chromium 27/27 and WebKit 27/27. `npm audit --omit=dev` reported zero known vulnerabilities. An exact-value scan of 18 files in `.next/static` found neither the configured database URL nor Ocean HMAC secret; this checks those configured values only, not every possible secret. The tracked environment/certificate filename check returned only `.env.example`. No application change was needed during this regression pass.

Next: choose the host and stable HTTPS destination, then approve deployment with placeholders and Ocean writes disabled. After deployment, verify TLS, server-only configuration, database CA availability, aggregate reads, view-only mode and recovery. Review trusted ingress limits and retention before enabling writes. Final artwork/copy/QR approvals, actual phone and screen-reader testing, and print/sleeve checks remain owner-dependent launch gates.

## Initial deployment verification

On 2026-11-13, the approved placeholder build deployed successfully to https://little-boraverse.vercel.app. Live home, Ocean and aggregate requests returned 200 over HTTPS with the baseline nosniff header. The aggregate reported `writesEnabled:false`; a controlled POST returned 503 with `Cache-Control:no-store`, and the aggregate count stayed unchanged. Mobile Chromium and WebKit checks passed for navigation, Ocean view-only mode, unapproved QR fallback, saving a gacha result locally and creating an image with download/open links. An initial smoke command used the wrong button name; the corrected check passed in both browsers.

No successful production contribution was attempted. Physical phones, screen readers, live write enablement/ingress limits, monitoring, rollback and production QR/print approval remain outstanding. The initial interruption occurred before any deployment existed; deployment was retried after DNS connectivity recovered.

## Hosting handoff — 2026-11-14

The committed `main` branch is published at https://github.com/KimTaeman/boraverse. An exact-value scan of all 91 tracked files found neither the configured database URL nor HMAC secret. This scan covers those two current values only. Publishing used the existing authenticated GitHub CLI because the configured `credential-wincred` helper is unavailable in WSL; global Git configuration was not changed.

A production log query succeeded and returned zero records in the sampled 24-hour window. This verifies query access, not alerting or that no historical errors occurred. The Vercel repository-connect retry failed even after publishing. The likely cause is GitHub App access; owner must inspect Vercel under https://github.com/settings/installations and grant access to `KimTaeman/boraverse`, then retry connecting. The existing GitHub CLI token cannot list app installations (403). The current live CLI deployment is unaffected.
