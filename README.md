# The Little Boraverse — Codex Project Pack

**Status:** Phase 1 homepage implemented; Ocean and other rooms are placeholders. **Prepared:** 2026-11-12. **First target event:** BTS ARIRANG Bangkok, 2026-12-03 (additional dates Dec 5 and 6). **Audience:** ARMY recipients of ~2,000 handmade paper freebies.

## The 30-second decision summary

Build a **mobile-first, explicitly unofficial BTS/ARMY fan experience** in **Next.js App Router + TypeScript + Tailwind**. It has a magical illustrated village, a shared Purple Ocean, a cute retro arcade, a Magic Shop for fortunes/letters, and personal keepsakes. **Start with the Homepage and Purple Ocean**. Use original, easily replaced placeholder artwork until the creator supplies illustrations. **Use Supabase-hosted PostgreSQL through server-only Next.js Route Handlers** for durable collective Ocean contributions; do not add login, public message storage, Supabase Storage, or Realtime for launch. All other games can work client-side.

The application runs locally without a database. Hosting, production domain, and shared Ocean service remain unconfigured.

## Read in this order

1. [`AGENTS.md`](AGENTS.md) — binding operating instructions for Codex.
2. [`docs/01-PROJECT.md`](docs/01-PROJECT.md) — mission, constraints, audience, decisions.
3. [`docs/02-PRODUCT.md`](docs/02-PRODUCT.md) — detailed feature requirements and priorities.
4. [`docs/03-UX-FLOWS.md`](docs/03-UX-FLOWS.md) — navigation and user journeys.
5. [`docs/04-DESIGN-SYSTEM.md`](docs/04-DESIGN-SYSTEM.md) — visual tokens, responsiveness, components, animations.
6. [`docs/05-TECH-ARCHITECTURE.md`](docs/05-TECH-ARCHITECTURE.md) — Next.js architecture and hosting.
7. [`docs/06-DATA-AND-API.md`](docs/06-DATA-AND-API.md) — database, endpoints, idempotency, failure behavior.
8. [`docs/07-QR-AND-PRINT.md`](docs/07-QR-AND-PRINT.md) — 2,000 card plan and URL contracts.
9. [`docs/08-CONTENT-AND-LORE.md`](docs/08-CONTENT-AND-LORE.md) — BTS research, writing constraints, meme glossary.
10. [`docs/09-ASSETS.md`](docs/09-ASSETS.md) — placeholder replacement architecture.
11. [`docs/10-SECURITY-AND-PRIVACY.md`](docs/10-SECURITY-AND-PRIVACY.md) — security rules and anti-abuse.
12. [`docs/11-TESTING.md`](docs/11-TESTING.md) — acceptance criteria, automated/manual tests.
13. [`docs/12-ROADMAP.md`](docs/12-ROADMAP.md) — phases, milestones, scope cuts.
14. [`docs/13-OPERATIONS.md`](docs/13-OPERATIONS.md) — deployment, monitoring, emergency plan.
15. [`docs/14-DECISIONS.md`](docs/14-DECISIONS.md) — locked, suggested, unconfirmed.
16. [`docs/15-CODEX-TASKS.md`](docs/15-CODEX-TASKS.md) — ready-to-use Codex task prompts.
17. [`SKILLS.md`](SKILLS.md) — practical task-specific workflows, not a registered agent skill.

See [`docs/16-SOURCES.md`](docs/16-SOURCES.md) for current platform documentation and verification notes.

## Intended end-user promise

> A little card leads to laughter, music, discovery, and a shared purple memory.

- **Discover:** A card-specific QR reward, ideally understandable in seconds.
- **Explore:** Magic Village, Purple Ocean, Arcade, Magic Shop, Memory Garden (the latter optional later).
- **Remember:** Downloadable card/letter/star souvenir and optional on-device keepsake storage.

**Important:** Pricing and vendor/platform rules can change; reread official docs before provisioning. No secrets should go into Git.

## Local development

Run `npm ci`, then `npm run dev` and open http://localhost:3000. The routes are early placeholders, and the Ocean does not yet save contributions. No external services or environment variables are needed for this phase. The artwork and design tokens are proposed placeholders.

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e`. Install the browser for the latter with `npx playwright install chromium`.
