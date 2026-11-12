# OPERATIONS — Provisioning, deployment and show-day runbook

## Provisioning checklist (manual owner action)
- Choose deployment host. Vercel Hobby is candidate for non-commercial personal use; confirm current terms and usage limits. Create project manually.
- Create Supabase project manually, choose region near intended visitors and function deployment, copy pooler DATABASE_URL from actual dashboard, use a strong password.
- Create strong random OCEAN_HMAC_SECRET; store via platform secret manager, never repo.
- Set `OCEAN_WRITE_ENABLED=false` until database, schema and abuse controls are validated.
- Run migrations in controlled environment, verify private schema is not exposed.
- Configure canonical HTTPS site URL for QR and allowed origins if relevant.
- Domain purchase not mandatory; default hosting HTTPS subdomain is acceptable if stable.

## Local dev
- `.env.example` lists names only. Developer creates `.env.local`, never commit.
- Without DB, homepage, QR reveals, Gacha, music and Magic Shop should still run; Ocean shows explicit demo/read-only fixture **not a simulated confirmed real contribution**.
- Use a separate dev database or transaction rollback for tests. Never reset production data during testing.

## Show-day health checklist (manual; do not imply autonomous monitoring)
- Open production URL from a cellular phone.
- Scan print-sample QR for at least one card from each family.
- Verify Supabase is active (free projects may pause for low activity over 7 days).
- Verify `/api/ocean` returns a valid JSON total and no secrets.
- Make one controlled live contribution (not spam) and verify idempotent retry.
- Verify download souvenir, iPhone/Android navigation, fallback in offline mode.
- Check hosting function request/error metrics and database utilization.
- Ensure a `writes off` toggle is easy to apply without destroying existing data.

## Failure modes and responses
| Symptom | Response |
|---|---|
| DB paused/down | Switch to read-only/temporary-unavailable Ocean; don't claim saving; revive project through provider dashboard |
| High abuse / flood | Disable writes; tighten server rate limits / challenge; preserve read-only browsing |
| Incorrect count | Treat DB as truth; avoid client-side inflation; audit duplicate logic |
| Asset CDN failure | Show lightweight CSS/SVG fallback; links remain accessible |
| QR path typo | Add route alias/redirect without invalidating printed QR; update content registry |
| Site outage | Keep printed card useful; post an update through optional owner channels; don't collect alternate contact data |

## Free-tier risks
- Supabase Free: 500MB DB as of Nov 2026, project can pause with insufficient activity (not a guaranteed uptime service).
- Vercel Hobby: personal/noncommercial use and limits apply; unexpected viral traffic can hit limits or throttle. Check current docs in sources.
- Prefer measured polling (not every second), small payloads and static compressed assets.
- Upgrade only after owner approves cost; otherwise disable heavy or write features gracefully.

## Privacy / deletion
- Owner should publish a concise privacy statement matching actual deployed technology, including anonymous browser token storage and approximate retention.
- If owner retires site, stop writes, export aggregate/reports as appropriate, and delete stored hashed contributions per policy.
- Backups are not guaranteed on Supabase Free; save migration source and consider safe one-off aggregate export if valuable.
