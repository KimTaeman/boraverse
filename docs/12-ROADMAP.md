# ROADMAP — Time-boxed through BTS ARIRANG Bangkok

**Baseline:** 2026-11-12. **First concert:** 2026-12-03. Dates are planning targets, not promises; adjust to actual time available. Quality beats feature count.

## Phase 0: Nov 12–14 — Scaffold and guardrails
- Initialize Next.js App Router, TS strict, Tailwind, lint/test/build/Playwright.
- Set repo structure, design tokens and `server-only` boundary, placeholder manifest, env example.
- Add static shell and fallback routes, documented content registry.
- PASS: `lint`, `typecheck`, `test`, `build`; no external service required.

## Phase 1: Nov 14–18 — Homepage visual + navigation
- Home hero and Village layout using placeholder art, links, bottom nav, responsive/adaptive behavior.
- Ocean page static layout shell with state fixtures.
- PASS: keyboard navigation, 320–430px, no blocking animation, art fallback.

## Phase 2: Nov 18–23 — Shared Purple Ocean
- Provision Supabase after owner's action; migrations, private DB, rate limiting, GET/POST handlers.
- Canvas/stars bounded; success/error/duplicate/retry behavior; save a commemorative image.
- PASS: concurrency, idempotency, DB outage and status feedback tests.

## Phase 3: Nov 23–26 — QR routes and content
- Create typed approved variants for all 8 families with placeholder visuals and approved original text.
- Build gacha, song roulette, magic letters/fortunes if core stable.
- PASS: every approved printed QR gets correct reveal; no unapproved / broken destinations.

## Phase 4: Nov 26–29 — Polish and practical checks
- Keepsakes, downloadable PNGs, English content QA, mobile accessibility, performance audit.
- Optional certificate only if there's time. No unmoderated message wall; D017/D018 separately approve the reviewed Magic Shop collection and message jar.
- PASS: real phones, weak networks, reduced motion, copy review.

## Phase 5: Nov 29–Dec 2 — Launch freeze
- Confirm hosting availability, active database, API usage, fallback mode.
- Freeze domain, QR registry, printed sheets after real-device and sleeve-fit test.
- Test live environment, rollback/kill-switch, verify production URLs.
- No new ambitious features after freeze.

## Deferred backlog
- More meme mini-games, friendship pokes, Memory Garden timeline, polished bilingual Thai translation, gallery features.

## Cut order if schedule slips
1. Drop P2 games, Poke, UGC and live timeline.
2. Defer certificate generator and Garden details.
3. Reduce gacha outcomes and letter variants (retain minimum satisfying set).
4. Keep home, reliable Ocean, approved QR route reveals, minimal music/letter entry, privacy and trust features.
5. Never sacrifice database safety or truthful contribution behavior for extra animation.

## Owner-directed Magic Shop refinement — D018

The reviewed journey and review-before-publication source implementation extend the core warm-experience work. Final colours/art remain replaceable. Deployment, permanent migration, controlled shared-write verification and activation are separate remaining steps; Ocean UI and physical-phone/print checks stay deferred as requested.
