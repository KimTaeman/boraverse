# CODEX IMPLEMENTATION TASKS — Copy/paste sequentially

These tasks are intended for a **new or existing repo**, do not assume one is already initialized. Only proceed one phase at a time. Require each completion to report changed files, tests, limitations, and decisions.

## Task 0 — Bootstrap / baseline
> Read AGENTS.md and all relevant docs. Scaffold a strict TypeScript Next.js App Router project using Tailwind CSS, ESLint and basic testing. Add route stubs for `/`, `/ocean`, `/arcade`, `/magic-shop`, `/keepsakes`, and `/c/[family]/[variant]`. Implement a token-based visual design foundation, accessible header and bottom navigation, reusable placeholder art manifest and friendly error fallback. Do NOT connect to production Supabase, create real illustrations or print QR codes. Add unit/Playwright smoke harness. Run lint, typecheck, tests, build and report results. Work only on Phase 0.

## Task 1 — Homepage first
> Following 03-UX-FLOWS, 04-DESIGN-SYSTEM and 09-ASSETS, implement the mobile-first Magical Village homepage with layered responsive placeholders and semantic links. Include hero `A little magic found you`, an immediately usable Purple Ocean CTA, illustrated-but-accessible room portals, return-visit intro skip, footer unofficial disclaimer and keyboard/reduced-motion support. Avoid overlarge image bundles and keep Client Components localized. Add responsive and accessibility tests at 320/390/430px. Stop after this phase.

## Task 2 — Purple Ocean UI state machine, no live DB yet
> Implement `/ocean` with placeholder sky/waves, bounded canvas/SVG light renderer, primary action, and UI states ready/pending/accepted/already-contributed/failed/offline/view-only using an injected mock API adapter. Never label mock increments as real data. Add a 1080×1920 souvenir export UI with stub artwork. Write state-machine tests including failure and retry, reduced motion, Safari download fallback strategy. Stop; report.

## Task 3 — Supabase Ocean backend
> Read architecture, data/API, security and testing docs. Add versioned SQL migration in a private schema and a Node-runtime Next.js Route Handler GET `/api/ocean` and POST `/api/ocean/contribute` with server-only Postgres.js via transaction pooler. Validate payloads, HMAC-hash visitor token, enforce uniqueness and idempotency in an atomic transaction, rate limit writes, and return authoritative count/status. Include no-secrets mock mode and production write kill-switch. Do not use Supabase Auth or add public direct table writes. Add integration tests for races, retries, duplicate token, conflict, outage, invalid body and rate limits. No live deployment until owner configures secrets.

## Task 4 — Wire real Ocean safely
> Replace mock adapter with real API behind environment/config. Success animation only after server accepted result; duplicate shows no new light; failures preserve unresolved idempotency key. Read GET counts with bounded refresh. Verify mobile and reduced-motion states and ensure the rest of the site works during DB outage. Add E2E and performance tests. Stop/report.

## Task 5 — QR entry and content foundation
> Create typed static registry for 8 freebie families with placeholder variants, no unapproved content exposed. Implement `/c/[family]/[variant]` matching reveal, skip intro, and fallback. Implement sample route manifest and automated route-validation tests. Don't finalize real QR image assets or publish a fake production domain. Link every family to appropriate module; no paywalls or forced signup.

## Task 6 — Core fun / warm experiences
> Implement seven-outcome client-side Bangtan Gacha, mood-based verified BTS song roulette with official outbound listening links and original descriptions, Magic Shop envelope letters and tarot reveals, local-only keepsakes with versioned storage, and image export. Use `08-CONTENT-AND-LORE.md` to verify references. Keep P1 mini-games and public messages out. Test repeated scans, no-login access and empty storage handling.

## Task 7 — Hardening and launch
> Follow 11-TESTING, 13-OPERATIONS. Audit performance, mobile Safari/Android, offline handling, accessibility, UX copy, licensing, all approved QR routes, production DB secrets, health checks and write-off switch. Produce a deployment/runbook checklist, unresolved risks, and final `ready/not ready` reasons. Do not mass-print URLs until owner approves real HTTPS routes.

## Definition of complete (for every phase)
- Production-ready relative to scope, not just visual screenshot.
- Changed files enumerated, tests executed with exact results.
- Remaining TODOs explicit and honest.
- No unrelated rearchitecture, paid provisioning, or pretending a deferred feature is complete.

## Model usage tips
- Use higher reasoning for architecture, security, migrations, concurrent writes and design planning.
- Use moderate effort for focused UI components/tests following locked specs.
- Keep task prompts concise by referring to files rather than pasting all docs into one prompt.
