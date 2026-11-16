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

Local verification: the production API successfully read the real aggregate using inline CA contents with `DATABASE_CA_CERT_PATH` deliberately pointing to a missing file; `writesEnabled` remained false. Lint, TypeScript, six unit tests and build passed. Vercel authentication was subsequently renewed and the owner-approved initial build deployed to https://little-boraverse.vercel.app with writes disabled. GitHub integration is now connected to `KimTaeman/boraverse`, with `main` as the production branch. See the launch-readiness checklist for live verification and remaining gates.

## Production monitoring and Git integration

Production log-query access was verified on 2026-11-14 with `vercel logs --environment production --no-branch --since 24h --limit 10 --json --scope kimtaemans-projects`. Inspect logs privately; never publish visitor/request details or credentials. This is manual access, not automatic monitoring or alerting.

On 2026-11-14, after the owner updated GitHub App access, Vercel connected successfully to `KimTaeman/boraverse`. The project API confirmed GitHub as provider and `main` as the production branch. Pushes to `main` now trigger production builds. Keep `OCEAN_WRITE_ENABLED=false`; verify deployment completion and the live API after release. CLI deployment remains available as a fallback.

## Verified rollback and recovery

On 2026-11-14, production was rolled back to the immediately previous verified build, checked, then restored by promoting the current verified build. After each switch, home returned 200, aggregate reads succeeded with `writesEnabled:false`, POST returned 503 and the count matched the pre-drill count. No database rollback, deletion or successful contribution was performed.

Use `vercel rollback <previous-ready-production-url> --yes --scope kimtaemans-projects` for recovery, then verify the public site and Ocean. Restore the current known-good release with `vercel promote <current-ready-production-url> --yes --scope kimtaemans-projects`. Select URLs from the actual project deployment list, not a guessed hostname.

Vercel rollback retains the target deployment configuration and temporarily disables automatic production-domain assignment; promoting a different deployment restores normal automatic assignment. Verify the write switch on the target build before choosing it: an old deployment may retain an older environment setting. Do not use application rollback as a database reset or assume it applies the latest secrets. Hobby supports the immediately previous deployment. Source: https://vercel.com/docs/instant-rollback.

## Approved Ocean ingress and retention

D013 is approved. The enabled Vercel rule `Ocean contribution rate limit` matches only POST `/api/ocean/contribute`, counts by source IP in fixed 60-second windows and returns 429 above 120 requests. Application limits remain 60 attempts/minute globally and 5/token/minute. Inspect with `vercel firewall rules inspect "Ocean contribution rate limit" --scope kimtaemans-projects`; use rules-only commands because the broad overview queries a Pro-only bypass feature.

Rate buckets become cleanup-eligible after one day and are deleted during attempts passing the global guard; this is not a daily scheduler or a guaranteed maximum retention. Review manual cleanup before reopening/retiring an inactive site. Keep contribution records until retirement, then review export/deletion. Provider logs have separate retention. Writes remain disabled pending a separately approved controlled live-write check. No paid provisioning was enabled.

## Magic Shop moderation and activation — D018

The reviewed flow is implemented locally. The private migration was applied and recorded on 2026-11-16; public deployment and activation of the default-off `MAGIC_WRITE_ENABLED` gate remain pending. No production publication was performed. Keep Ocean writes disabled independently. Follow `supabase/README.md` for owner-only review commands, migration precautions and rollback-only verification. Only publish after inspecting the full original text; check reports and hide unsuitable published text promptly. There is no public admin route or automatic moderation claim.

Before public activation, verify schema/history and restricted-role grants, published-only feeds, one controlled pending submission/retry/withdrawal with cleanup, published random draws, authoritative reaction counts, review availability, privacy/retention wording and provider/edge usage limits. Public-empty and unavailable states are deliberate until real reviewed contributions exist. If disabling writes also pauses visitor withdrawal/reporting, the owner can still use the private review tool to hide content. Site retirement requires reviewing exports/deletion of text and security records; bucket cleanup remains opportunistic after one day of successful requests.

Migration rollout verification uses the existing owner connection and the restricted website login, not new roles/services. Follow the post-migration loopback check in `supabase/README.md`; the earlier migration-building rollback test intentionally requires an absent Magic schema and is no longer appropriate on this migrated project. Stop the write-enabled loopback instance after checking; persistent/public gates remain false. The controlled test never publishes synthetic text or edits Ocean records. Public privacy/review availability, provider quotas/ingress controls and a deployed boundary check still precede activation.
