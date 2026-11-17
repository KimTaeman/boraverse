# TEST PLAN & DEFINITION OF DONE

## Core quality gates (run after meaningful changes)
- TypeScript strict/typecheck succeeds.
- ESLint succeeds without new warnings/errors where reasonable.
- Unit/integration tests for modified business logic succeed.
- Next.js production build succeeds.
- Playwright smoke/E2E on home, ocean, deep-link QR, offline/error states where environment allows.
- Manual test on actual Android and iPhone before public QR print; browsers may differ in image download behavior.

## Home E2E
- `/` renders title and immediate primary CTA with JS enabled; functional basic navigation without fancy art.
- On 320, 375, 390, 430px screens no horizontal overflow, bottom nav covers no CTA, readable layout.
- Home → Ocean in a single primary tap; Back returns home.
- If placeholder scene asset 404s, site still works and provides fallback.
- Keyboard tab order, focus indicator, accessible link names, reduced-motion behavior.

## Ocean API integration
1. New browser token/idempotency → exactly one accepted DB row, return server count.
2. Two simultaneous POSTs with same token/key → one contribution.
3. Same token, new idempotency → already contributed, no count change.
4. Same idempotency key, different token → safe conflict; no leak.
5. Network timeout then retry same key → no second row.
6. Malformed JSON, UUID/date, huge body → appropriate 4xx; no write.
7. Rate limit triggers 429 and Retry-After; no write.
8. DB unavailable or write-disabled → 503 and UX retry/view-only; no fake success.
9. `GET /api/ocean` returns only total/byDay; count true to database.
10. No server secret or raw browser token in client bundle, API response, error output or logs.

## Purple Ocean UI
- Test confirmed tiers 0/3/50/500/5000: logarithmic progression, deterministic positions, bounded shared lights and no hydration warnings.
- Hold POST beyond 3.5s: charge/slow-network copy only, no count/flight/success; rapid keyboard/click activation still sends one request. After acceptance, assert travelling → joining → success and the literal returned total (which may jump by more than one).
- Changing reduced motion mid-flight skips to verified success; missing canvas falls back safely. Route exit cancels requests/RAF and preserves unresolved idempotency. Local remembered success is explicitly distinguished from server verification.
- Scene reaches every viewport edge at phone/desktop/landscape sizes; overlaid controls remain accessible with enlarged text and scrolling on short screens. Leaving Ocean restores the shared site shell.
- Pending state disables multiple taps, never increments **confirmed** total before response.
- Accepted animates new star once; duplicate shows `already added` without new star.
- Server error shows retry while keeping same unresolved idempotency key.
- Reduced-motion uses static scene + instant acknowledged feedback.
- Works with forced offline condition; canvas fallback present; no more than fixed count of lights rendered even for huge total.
- Souvenir PNG share/download works or provides supported fallback on iOS Safari.

## QR/print
- Every registry variant has one stable HTTPS route and a usable landing page.
- Invalid/unapproved variants show friendly fallback.
- Print real sample sheets across 215/150/80–100gsm; check readability, cut layout and sizing.
- Test 63×88 premium card inside nominal 65×90 sleeve (may require size adjustment to 59×86).
- Scan physical QR on at least two different phone cameras, in bright/glare and dim conditions.
- Test no QR routes to preview/staging or `YOUR_FINAL_DOMAIN` placeholder.

## Content / art
- Verify BTS song metadata, meme origin and attribution, copyright constraints, member names and translations.
- Illustrations are visibly placeholders until final art is approved.
- Check contrast, alt text, responsive crop, heavy asset loading.

## Launch gates
P0 sections pass, deployment HTTPS valid, DB active, no critical leaks, write kill-switch tested, server logs/metrics viewable, physical QR route freeze recorded, simple recovery guidance documented. More in operations document.

## Celestial Storybook refinement verification — 2026-11-14

- `npm run lint`, `npm run typecheck`, `npm test` (15 unit tests) and `npm run build`: passed.
- `npm run test:e2e -- --workers=1`: 46/46 passed across the application.
- `npm run test:e2e -- --config=playwright.webkit.config.ts`: 46/46 passed with iPhone WebKit.
- After the dropped-frame timing adjustment, `npm run test:e2e -- e2e/ocean-refinement.spec.ts --workers=1` and the same spec with `--config=playwright.webkit.config.ts`: 11/11 passed in each engine. Includes settled browser-back recovery, preserved retry identity, stable charge/launch position, hidden-tab pause and route-exit cleanup.
- `OCEAN_CAPTURE_URL=http://127.0.0.1:3467 node e2e/capture-ocean.mjs` against the local production build: fixture totals 0/3/50/500/5000 on mobile/desktop, two animation recordings, actual 1080×1920 keepsake, eight responsive sizes, no console warnings/errors. Artifacts and `checks.json` are in ignored `out/ocean-refinement/`; all mocked responses are local and no database contributions are created.
- Actual iOS/Android hardware, low-end battery/frame rate and native image save/share still need owner QA. Live writes remain disabled; no production write smoke or database migration was performed for this visual refinement.

## Cinematic hierarchy verification — 2026-11-15

- `npm run lint`, `npm run typecheck`, `npm test` (17 unit tests), and `npm run build`: passed.
- Full `npm run test:e2e -- --workers=1`: 54/54 Chromium tests passed. Full `npm run test:e2e -- --config=playwright.webkit.config.ts`: 54/54 iPhone WebKit tests passed.
- New checks cover six phone/desktop sizes, artwork/figure/count separation, the count dialog’s three explanations, keyboard opening, Escape/Close focus restoration, About/Privacy navigation, quiet ready copy and the exact confirmed-success messages. Existing pending/slow, retry identity, duplicate, offline, missing-canvas/art, reduced-motion, browser-back, QR and security tests remain covered.
- `OCEAN_CAPTURE_URL=http://127.0.0.1:3467 node e2e/capture-ocean.mjs` against the production build captured local fixture totals 0/3/50/500/5000 on mobile and desktop, eight responsive sizes, information/submitting/error/offline/already-contributed states, two success recordings and the PNG keepsake. Normal capture contexts reported no console warnings/errors. Results are in ignored `out/ocean-cinematic/`.
- Shared-light targets are bounded artistic density, not individual people: 0/5/32/110/220 at the five milestones, with 150 visible maximum on mobile. Tests cover continuous, monotonic interpolation across every independent layer and retain stable star positions.
- Physical Android/iPhone hardware, native image saving and final artist approval remain pending. Production writes stay disabled; no live write, database migration, secrets or dependency change was performed.

## Reviewed Magic Shop implementation — D018, 2026-11-16

- `npm run lint`, `npm run typecheck`, `npm test` (35/35), and `npm run build`: passed. No dependencies added. Existing Node module-type and Playwright colour-environment warnings remain non-failing.
- Full Chromium regression passed 76/76 before the last three Magic tests were added. Full iPhone WebKit regression passed 79/79. Final targeted Chromium Magic suite passed 14/14 after a restoration-timing fix: the shop exposes controls only after resolving the initial view/session state, avoiding layout movement beneath an early click. The final targeted iPhone WebKit Magic suite also passed 14/14 after the same fix.
- Magic browser coverage includes 320/375/390/430/1440 layouts, absent artwork, animated and changing reduced motion, keyboard/focus/browser Back, private audience drafts, plain-text markup, saves/1080×1920 image export, real-shaped published fixtures, delayed authoritative agreement, unresolved submission/reload/same-key retry, pending-only receipt, empty/random jar, unavailable API, confirmed withdrawal and approved QR destination/bypass. Browser fixtures are local only; no real messages or reaction counts are invented in production.
- `MAGIC_WRITE_ENABLED=false OCEAN_WRITE_ENABLED=false node --env-file=.env.local --env-file=.env.admin.local tests/magic-database.integration.mjs`: passed. The test applies the new migration and temporary role membership inside a transaction; verifies pending-only submission/idempotency, restricted-role publication denial, another visitor's pending-row invisibility, explicit published feed projection, reaction add/remove/old-retry semantics, eligible random draws/self/previous exclusions, visitor conflict and withdrawal; then rolls back and verifies no tables remain. This is serial transaction verification, not multi-connection concurrency or a deployed committed write.
- Actual Next.js mobile (390×844) and desktop (1440×1000) entrance, interior and letter screenshots were captured and inspected in ignored `out/magic-shop-app/`. Art remains original replaceable SVG/CSS, and desktop uses a wide four-object room rather than a phone-sized container.
- An exact-value scan of 94 source/public/build-static files found neither configured database URL nor HMAC secret. This checks those values only, not every possible secret/vulnerability.

Shared activation is intentionally off. The permanent migration, production deployment, controlled committed write/owner review verification, provider/retention readiness, actual phone saving/screen-reader checks and final artwork remain pending. Ocean UI and physical/print QA remain deferred by the owner; both public write gates stay off.

## Magic Shop migration rollout and committed local check — 2026-11-16

The pre-migration rollback suite passed again before applying version `20261116133329`. The migration and its complete SQL were then committed atomically to the existing database/history. Five Magic tables use RLS; no new role, dependency, service or paid capability was added.

`tests/magic-live.integration.mjs` passed against the local production build on HTTP loopback port 3468 and the hosted database. It checks a real committed pending submission, exact-key HTTP retry with one row, the actual owner `show`/`reject` commands, retry reflecting the reviewed status, HTTP withdrawal, two simultaneous transactions through separate restricted connections yielding one pending message, restricted-role publication denial and pending/withdrawn feed exclusion. Cleanup removes only generated message/request IDs and visitor buckets, preserving global rate accounting; no synthetic text is published. The temporary write-enabled loopback server was stopped after checking. Persistent/public write settings were not changed.

The real HTTP check found and fixed valid-origin rejection on numeric loopback hosts: installed NextURL normalizes the URL hostname to localhost, while the browser's Origin remains numeric. The guard now compares Origin against the incoming Host and request protocol, retaining cross-site rejection and ignoring untrusted forwarded-host claims. New unit cases cover valid numeric Host, wrong host/protocol, spoofed forwarded host and Sec-Fetch-Site cross-site. The real write-off browser boundary now supplies Origin explicitly. The test harness also passes owner configuration explicitly to the moderation subprocess, avoiding inherited restricted credentials.

Validation: lint, TypeScript, all 36 unit tests and production build passed; targeted Magic Shop suites passed 14/14 in Chromium and 14/14 in iPhone WebKit. The whole-site regression was not repeated: the runtime change is limited to Magic's origin guard, with prior full-suite evidence above. The committed check is local HTTP plus real database verification, not a deployed public write test. Artwork and actual phone/print QA remain pending.

## Public write-off preview verification — D019, 2026-11-17

Published the already-tested runtime at source commit `88ba882` through the existing GitHub/Vercel production integration. The hosted Next.js build and TypeScript step passed. No runtime code changed in this release phase, so the source lint/typecheck/36-unit-test/build and 14-per-engine Magic browser evidence above was reused rather than rerunning unchanged local suites.

Live canonical-site verification passed:

- `GET /api/magic` returned real empty published items and `writesEnabled:false`; `GET /api/ocean` returned `writesEnabled:false` and the unchanged pre-deployment total of 5.
- Valid same-origin Magic submit/react/report/remove requests returned 503 with no-store errors. Foreign Origin returned 403; malformed cursor returned 400. Ocean POST returned 503. No shared message or contribution was accepted.
- Chromium at 390×844 and 1440×1000, plus mobile WebKit at 390×844: entrance/interior navigation, no horizontal overflow, original letter, private writing/folding, disabled public submission even with consent selected, device-local save, decoded 1080×1920 PNG, genuinely empty published collection/message draw, and approved QR entry all passed. No-JavaScript Magic fallback and Privacy access passed separately.
- The first desktop probe hit `ERR_NETWORK_CHANGED` while fetching the collection and correctly showed the visitor retry state; direct verification and the final complete run passed without network recovery or page errors. No application change was needed for that environment failure.
- `npm run --silent qr:check -- https://little-boraverse.vercel.app`: all eight approved routes passed exact copy, slash handling and destination checks, with no missing family or audit errors.

Live reports and nine screenshots are stored only in ignored `out/magic-shop-release/`. Room screenshots wait for SVG decoding so they show settled artwork. Local browser contexts were discarded; test private text/images were not uploaded. The read-only ARMY draws use normal short-lived rate-limit accounting but publish no text. Physical phone saving/screen-reader/print checks, final artwork and public write activation remain pending. A passing website audit does not freeze the printed destination.

## Home/Arcade flow study — D020, 2026-11-17

`design/check-home-arcade-flow.mjs` passed 12 complete journeys: Chromium and WebKit at 320/375/390/430/736/1440px. Checks cover immediate Ocean access, explicit destination handoffs, keyboard navigation/focus, village artwork fitting its columns, overflow, separate turn/drop/open gacha stages, current-result preservation, mood-specific song results/official outbound links, absence of embedded audio/video, explicit temporary keeping, duplicate-keep prevention, preview tray/back, and clearing kept items on reload. Both engines additionally passed normal-motion, preference changes during animation, and leaving/re-entering during a reveal. Screenshots of village, arcade and result stages are in ignored `out/home-arcade-flow/`.

The flow itself made no product/API requests and uses no product local/session storage. The optional standalone renderer loads its three existing pinned UI resources (Floating UI core/dom and Lucide); the checker explicitly distinguishes those resources from product requests. Links to official listening pages were inspected but not followed. No deployment, shared text, Ocean contribution, API change or database operation occurred.

Lint, TypeScript, all 36 unit tests and production build passed. Full application E2E was not repeated because the production application is unchanged. The study is `design/home-arcade-flow.html`, rendered for local browser inspection with the installed visualization renderer. Original CSS objects, colours, typography, sample rewards/two-song roster, timing and exact copy remain proposed. Actual Next.js wiring, production keepsake/image export, browser-history/QR integration, final illustrations and physical-device review are not implemented by this design study.

## Home/Arcade feedback record — D021, 2026-11-17

Documentation only: recorded rejected visuals/homepage row, simpler interaction requirements, direct DJ Spin QR-to-song delivery, optional mood/preset exploration, and the owner's request to pause redesign pending references. `git diff --check` passed. No runtime/study/test code, QR registry, API, database or deployment changed; lint/typecheck/unit/build/browser suites were not rerun. Prior study checks verify the historical prototype, not implementation of the new QR behavior.
