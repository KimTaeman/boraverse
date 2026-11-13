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

## Proposed Vercel deployment setup

Owner approval is required before project creation or deployment. Use the Next.js preset, repository root, `npm run build` and framework-default output. Keep the current placeholder art and QR fallbacks. Vercel Hobby remains a proposal, subject to personal/noncommercial eligibility: https://vercel.com/docs/plans/hobby.

Configure these variables separately for the intended Preview/Production environment using the platform environment settings (https://vercel.com/docs/environment-variables):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Existing restricted-login transaction-pooler URL, server-only |
| `DATABASE_CA_CERT` | Actual multiline PEM contents from the trusted database CA file, server-only |
| `OCEAN_HMAC_SECRET` | Existing private HMAC secret, server-only |
| `OCEAN_WRITE_ENABLED` | `false` |
| `NEXT_PUBLIC_SITE_URL` | Real assigned HTTPS destination once known |

Leave `DATABASE_CA_CERT_PATH` unset on the host; the local absolute path is not portable. Inline `DATABASE_CA_CERT` takes precedence when both are present. TLS verification remains enabled. Do not set `NEXT_E2E` on the host. Never put secret values in commands, source, screenshots or logs. Environment changes require a new deployment to take effect.

After an approved deployment, verify home/navigation, the Ocean aggregate with `writesEnabled:false`, contribution 503, image saving, headers, and failed-request fallback before sharing the link. Production QR approval and print testing remain separate gates.

Local verification: the production API successfully read the real aggregate using inline CA contents with `DATABASE_CA_CERT_PATH` deliberately pointing to a missing file; `writesEnabled` remained false. Lint, TypeScript, six unit tests and build passed. Vercel account verification currently fails because the CLI token is invalid; renew authentication with `vercel login` before an approved deployment. No hosted project was created or deployed during preparation.
