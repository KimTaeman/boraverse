# Codex Agent Instructions — The Little Boraverse

## Mission
Build a delightful, safe, lightweight, mobile-first **unofficial ARMY fan website** for BTS ARIRANG Bangkok 2026. The experience prioritizes the **Magical Village homepage and shared Purple Ocean** first. The first concert is **2026-12-03**.

## Read before work
- For every task: `docs/01-PROJECT.md`, `docs/14-DECISIONS.md`, relevant feature doc, and `docs/11-TESTING.md`.
- For UI: `docs/03-UX-FLOWS.md`, `docs/04-DESIGN-SYSTEM.md`, `docs/09-ASSETS.md`, `docs/17-HOME-AND-OCEAN-SCREENS.md`.
- For backend: `docs/05-TECH-ARCHITECTURE.md`, `docs/06-DATA-AND-API.md`, `docs/10-SECURITY-AND-PRIVACY.md`.
- For QR/print: `docs/07-QR-AND-PRINT.md`.
- For roadmap: `docs/12-ROADMAP.md`, `docs/15-CODEX-TASKS.md`.

## Non-negotiables
1. Next.js **App Router**, TypeScript strict, accessible semantic UI, Tailwind and project design tokens. Server Components by default; Client Components only for required interactivity.
2. **No auth, payment, marketing form, tracking pixel, invasive analytics, or direct fan-to-BTS messaging** in launch scope. Public visitor writing is limited to the owner-requested Dear Bangtan/Dear ARMY flows in D017; publishing policy and release checks must be settled before they go live. All other public UGC remains outside scope.
3. Supabase is **PostgreSQL hosting**, not a reason to add its Auth/Storage/Realtime products. Backend data operations happen only from server-only Next.js Route Handlers. Secret database URL never reaches the client.
4. Never falsely report an Ocean contribution as saved. Use server-authoritative result, atomic insert and uniqueness, explicit retry/duplicate states, resource limits, and idempotency.
5. All 2,000 physical freebies use a stable website QR. Don't finalize or print a production destination until the deployed HTTPS route is tested. Avoid unique-per-copy codes unless explicitly approved.
6. Art is **placeholder** until user supplies original illustrations. Keep scene layout/navigation and overlay text independent of images; don't hardcode click coordinates into a flattened image. Use artwork manifest and named layers.
7. Respect BTS/artists' IP: don't embed recordings, reproduce lyrics, use unlicensed fan art, or imply affiliation/endorsement. Original writing and original graphics; link externally to official platforms.
8. Follow mobile-first UX, reduced motion, mute by default, keyboard access, adequate contrast, offline/failed-request fallbacks.
9. Never deploy or provision paid services without the owner's approval. Never commit secrets or publish private IDs.
10. Do not implement optional mini-games at the expense of a stable home/Ocean experience.

## Working method
- Before coding, restate targeted phase and check docs. Work incrementally, not an unrequested big rewrite.
- Document assumptions as `proposed` if not locked. Prefer reversible choices.
- Add/modify tests for changed behavior; run `lint`, TypeScript check, unit tests, build and relevant E2E where possible. Report what could not run.
- Make failure conditions visible and friendly to visitors (not scary technical or virus-like copy).
- Add no heavyweight dependencies unless they clearly support a required feature. Explain trade-offs.
- For database changes, use versioned migrations with least privilege and reversible rollout. Do not depend on local in-memory server state for shared counters.
- For every completion report: changed files, exact user-visible behavior, tests with results, known limitations, next phase.
- Commit completed work after each phase, after running the applicable checks.

## Source of truth precedence
`docs/14-DECISIONS.md` (locked choices) > current task request > feature-specific docs > illustrative examples. If a new user choice changes a locked decision, update the decision log and dependent docs together.

## Tasks by phase
Follow `docs/15-CODEX-TASKS.md`; do not jump ahead silently. Phase 0 scaffold and test harness; Phase 1 homepage; Phase 2 database API/Ocean; Phase 3 QR integration; Phase 4 essential content/rewards; Phase 5 launch hardening.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
