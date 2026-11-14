# Launch readiness — not ready

Status reviewed 2026-11-14. This is a pre-launch checklist, not an approval to deploy or print.

## Blocking items

- **Ocean:** The private schema migration and restricted group role have been applied to the configured project; a dedicated restricted login has been created and verified. The local API successfully read the real aggregate with writes disabled. The restricted login and HTTP handler passed rollback-only write, retry, duplicate, conflict and rate-limit checks; no test contribution remained. Keep `OCEAN_WRITE_ENABLED=false`. Follow `supabase/README.md`, verify private schema and role permissions, then test real aggregate reads, a controlled contribution, idempotent retry, rate limits, database outage, and the write kill switch before enabling writes. The owner approved D013 limits and retention; the Vercel ingress rule is published and verified with writes disabled. A separate controlled deployed write check remains required.
- **QR:** No family variants are approved. The `01` records are placeholders and currently show the fallback. Approve original artwork, copy and stable IDs, choose the real HTTPS domain, verify every resulting route, and freeze it before printing. Do not print sample or placeholder URLs as production codes.
- **Hosting:** The owner-approved placeholder build is deployed on Vercel Hobby at https://little-boraverse.vercel.app. HTTPS pages and the real aggregate read passed, including the server-only inline CA configuration. Production log-query access is verified; host rollback and recovery have passed a controlled live drill. GitHub integration is connected to `KimTaeman/boraverse`, with `main` as the production branch. The URL is not yet approved for printed QR codes.
- **Real devices and print:** Test Android and iPhone browsers, keyboard and reduced motion, poor connectivity, image saving, and actual QR print samples on each material. Check glare, quiet zones, cutting margins and sleeve fit before a print run.
- **Content and rights:** The gacha and Magic Shop use provisional original text and placeholder art. The song picker has only two official video links; review final selections, wording, attribution and licenses. Review and finalize the privacy statement and retention policy for the actual hosting setup.

## Recovery

1. Turn off Ocean writes through `OCEAN_WRITE_ENABLED` and redeploy the configuration according to the selected host's procedure; confirm a write receives 503 without modifying the count.
2. Keep the rest of the site available where possible. Check provider status and logs without exposing tokens, IDs or secrets.
3. Verify the database before re-enabling writes. Preserve unresolved client idempotency keys; do not compensate with invented counts.
4. Roll back the application using the host's documented mechanism. Do not drop Ocean tables or erase contributions as part of routine rollback.

## Local evidence

The production dependency audit, lint, TypeScript, unit tests, production build and browser smoke suite were run locally. Browser tests use mocked Ocean responses or the disabled write switch; a local API read against the configured database succeeded, but these are not evidence of a successful production contribution. The two placeholder SVG files occupy approximately 8 KiB combined on disk. The complete Chromium and iPhone-sized WebKit suites each passed all 27 tests after the availability changes; the WebKit command is `npm run test:e2e -- --config=playwright.webkit.config.ts`. It uses a single worker and extended timeouts for the slow local filesystem. This emulation does not replace testing on an actual iPhone. The deployed mobile Lighthouse sample is recorded below; physical-device checks remain outstanding.

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

## GitHub integration — 2026-11-14

After the owner updated GitHub App access, the connection succeeded. The Vercel project API confirmed provider `github`, repository `KimTaeman/boraverse` and production branch `main`. The live Ocean availability check remains part of release verification; physical-device checks remain outstanding; host rollback and recovery are now verified.

## Rollback drill — 2026-11-14

Vercel successfully rolled production back from the GitHub build to the previous CLI build, then promoted the GitHub build again. Both builds use the same application code. Live checks passed before and after both switches: homepage 200, aggregate 200 with writes disabled, contribution 503, and unchanged aggregate count. The current build is restored. See the operations runbook for commands and the deployment-environment caveat. This checks application recovery with writes disabled; it does not test recovery during live writes or a database incident.

## Deployed Lighthouse sample — 2026-11-14

Lighthouse 13.6.0 audited the public HTTPS homepage and Ocean sequentially with default mobile simulation, using the installed Playwright Chromium. These are single lab samples of the deployed placeholder site, not field measurements. Ocean was audited in view-only mode without submitting a contribution. Neither report contained a runtime error, run warning or failing automated accessibility check.

| Metric | Home | Ocean |
|---|---|---|
| Performance score | 92 | 94 |
| Automated accessibility score | 100 | 100 |
| First contentful paint | 1.5 s | 0.9 s |
| Largest contentful paint | 1.5 s | 0.9 s |
| Total blocking time | 290 ms | 300 ms |
| Cumulative layout shift | 0 | 0.008 |
| Speed index | 3.7 s | 2.3 s |

Unused/legacy framework JavaScript and render-blocking CSS remain optimization opportunities; the Ocean report also flagged forced reflow. This audit alone does not establish a launch-blocking defect. Repeat after final artwork or material code changes, and assess responsiveness on actual phones. To reproduce, use the existing Lighthouse command above with the public HTTPS page URL instead of the local URL.

Next owner check: open the public site on an actual iPhone and Android phone over cellular data, navigate Home → Ocean → Gacha → Keepsakes, draw/save a result, and verify that the downloaded or manually opened image can be saved. Test larger text and a screen reader; record device/browser and any failure. QR artwork/content approval, ingress/retention decisions and print tests remain separate launch gates.

## Approved Ocean opening policy — D013

Review on 2026-11-14 confirmed that no custom Vercel firewall rules are configured. The broad firewall overview fails because it also queries a Pro-only IP bypass feature; the rules-only query succeeds on Hobby. No rule or billing setting was changed.

| Setting | Proposed policy |
|---|---|
| Application limits | Retain 60 attempts/minute globally and 5 attempts/minute per browser token |
| Trusted ingress | Vercel WAF, POST requests whose path equals `/api/ocean/contribute`; fixed 60-second window, 120 requests per source IP, then return 429 |
| Shared networks | The edge threshold is deliberately above the global application threshold to reduce accidental blocking of shared concert Wi-Fi; distributed traffic still reaches the global database guard |
| Rate buckets | Retain current one-day cleanup eligibility; deletion runs during attempts that pass the global limit, so inactive-site rows may remain longer. Perform a reviewed cleanup when retiring or before reopening an inactive site |
| Contributions | Retain commemorative contribution records until site retirement; review export/deletion at retirement |
| Cost boundary | Use Hobby included capability only; do not upgrade or accept paid provisioning without separate approval |
| Write switch | Keep disabled while configuring/verifying the edge rule and reviewing privacy copy; request a controlled live write check separately |

The owner approved these choices on 2026-11-14 (D013). Vercel documents one rate-limiting rule and one million included allowed requests for Hobby; verify the account-specific pricing acknowledgement before applying anything: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting. IP counting happens at the hosting edge; the application will not receive or store a new raw-IP field. This does not prevent all distributed abuse or guarantee uninterrupted concert traffic.

## Approved edge rule verification — 2026-11-14

The contribution-only rule was staged, inspected and published within the existing Hobby plan. Conditions: path equals `/api/ocean/contribute` AND method equals POST. Fixed window: 120 requests per source IP per 60 seconds; excess action 429. No other draft rules were present. A bounded live test returned 120 handler 503 responses and 10 edge 429 responses. Home and aggregate reads remained 200, `writesEnabled` remained false and the count stayed unchanged. No successful contribution or database deletion occurred. Privacy copy now describes approved retention, opportunistic cleanup and provider-side IP counting.

## Ocean visual refinement — Dreamy whale galaxy

The owner selected the dreamy whale-galaxy reference direction. The redesigned screen uses original replaceable sky/whale/crowd layers, one contribution star per confirmed light up to a 120-star visual cap, a confirmation-gated 1.8-second ascent, reduced-motion fallback and a matching whale keepsake. The save action stays in the primary action area after confirmation. Empty/unavailable counts do not populate contribution stars.

Lint, TypeScript, six unit tests and production build passed. The full Chromium and WebKit suites each passed 30 tests; after the final density refinement, the three mobile confirmation/star-count checks passed again in each browser. Mobile and desktop screenshots were visually reviewed with mocked totals, not production contributions. Previous Lighthouse figures predate this UI revision; re-audit after final artwork and verify actual phones. Ocean writes remain disabled.
