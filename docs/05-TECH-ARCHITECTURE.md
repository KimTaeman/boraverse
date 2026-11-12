# TECH ARCHITECTURE — Next.js App Router + Supabase Postgres

## Recommended stack (provisional hosting, locked application architecture)
- Next.js App Router, TypeScript strict.
- React Server Components for route shell, headings, initial data, navigational content; Client Components for Canvas, gacha spins, localStorage, animations, downloads.
- Tailwind CSS plus CSS custom properties for design tokens; Motion optional for selective reveal animations.
- Supabase **hosted PostgreSQL**, **no Supabase Auth/Storage/Realtime needed at launch**.
- Postgres access from **Next.js server-only Route Handlers** using Postgres.js via Supabase **transaction pooler** and a `DATABASE_URL` secret (not a `NEXT_PUBLIC_` key). This avoids browser DB access and permits atomic SQL transactions.
- Vercel Hobby candidate for truly personal, non-commercial fan project; confirm plan/traffic limits and permissions before deployment. No production account set up by this pack.
- Keep serverless function location reasonable for Supabase database region to reduce round trips; avoid per-request image generation.

## Browser → server boundaries
**Browser:** visual scene, games, curated local content, route navigation, local ID stored in browser, downloadable keepsakes, non-sensitive preferences.
**Server:** ocean GET summary, POST contribution, input validation, throttling, idempotency, DB writes, server secrets, response caching headers.
**Database:** accepted contributions, unique keys/hashes, timestamp and optional day, short-lived abuse throttle entries. No letters/nicknames/user messages in DB.

## App layout (design target, not files created)
```text
src/app/
  layout.tsx
  page.tsx                    # Magical Village
  ocean/page.tsx
  arcade/page.tsx
  arcade/gacha/page.tsx
  arcade/music/page.tsx
  magic-shop/page.tsx
  magic-shop/fortune/page.tsx
  magic-shop/letters/page.tsx
  garden/page.tsx            # P1 or explicit coming-soon
  keepsakes/page.tsx
  c/[family]/[variant]/page.tsx
  api/ocean/route.ts         # GET aggregate only
  api/ocean/contribute/route.ts  # POST only
src/components/{shell,village,ocean,arcade,magic,ui}/
src/content/{freebies,songs,letters,lore}/
src/lib/{db,ocean,security,qr}/
src/styles/tokens.css
public/placeholders/
supabase/migrations/
```

## Rendering strategy
- Don't mark `app/layout.tsx` or full homepage `'use client'` simply for tiny interactive controls.
- Scene backgrounds use optimized static assets and responsive `<Image>` where useful; no high-resolution asset download before the hero's functional copy paints.
- The Ocean canvas is a small client island; initialize on visible route and stop animation when backgrounded; hide pixel-perfect complexity behind feature flags.
- Initial GET summary can be fetched server-side with dynamic caching strategy; never treat a cached count as a just-confirmed write.
- Auth and visitor token are **not** required for reading the page.

## Data access decision
Use `postgres` (Postgres.js) in server-only module with database connection from dashboard's transaction pooler endpoint. Recommended serverless settings as per Supabase docs: `max:1`, `prepare:false`, SSL enforced. Do not connect directly from browser. Database credentials live only in deployment secrets.

```ts
// DESIGN REFERENCE ONLY; not an implemented file
import 'server-only';
import postgres from 'postgres';
export const sql = postgres(process.env.DATABASE_URL!, {
  max: 1,
  prepare: false,
  ssl: 'require',
});
```

Supabase's database region and pooler endpoint come from real project dashboard—never guess them. Use versioned SQL migrations and private schema with minimal grants. Avoid Drizzle/Prisma until there is a demonstrated reason; direct SQL is enough for one small table.

## Environment variables (names proposed)
- `DATABASE_URL` — Supabase transaction pooler URL, server-only.
- `OCEAN_HMAC_SECRET` — long random server secret for hashing anonymous browser tokens (and optional temporary abuse fingerprints).
- `NEXT_PUBLIC_SITE_URL` — canonical public HTTPS site URL (safe client exposure).
- `OCEAN_WRITE_ENABLED` — operational kill-switch, default false in non-configured environments.
- Optional future: `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` only if abuse mitigation is added.

## Libraries / dependencies
Essential only: next, react, react-dom, TypeScript, eslint, tailwindcss, postgres, a validation library (e.g. zod) and a light icon system. Motion / Canvas rendering dependencies only if needed; native CSS/SVG may be enough. Use `next/font` or licensed web fonts with fallback.

## Deployment alternatives
- Vercel for straightforward Next.js hosting, subject to Hobby's non-commercial use rules.
- Other platforms are possible; don't switch to experimental compatibility layers during a near-term deadline without a reproducible smoke test.
- Supabase Free can pause after low activity; scheduled manual pre-event verification is required. See operations doc.

## Explicitly excluded at launch
WebSockets, polling every second, Supabase Realtime, auth, multiuser saved collectibles, messaging server, music uploads, admin dashboard, headless CMS, monetization, distributed queues, user analytics trackers.
