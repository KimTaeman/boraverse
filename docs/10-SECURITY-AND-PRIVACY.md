# SECURITY, TRUST & PRIVACY

## Threat model
Anonymous public QR website used at crowded concerts. Risks: bot/flooded contributions, duplicate requests, database exhaustion, secrets leaked to frontend, malicious external links, user confusion about official status, abuse from open UGC, accessibility/poor network issues.

## Security principles
- No login for launch. No collection of name, email, phone, social accounts, precise location, or messages into a shared database.
- No publicly posted visitor messages. The optional `Dear Bangtan` editor is **local-only** and exports images; it never purports to send direct messages to BTS.
- No session replay, invasive third-party advertising or marketing trackers.
- Pages have visible official-status disclaimer.
- Validate paths against a registry; no arbitrary external redirects, unescaped HTML, raw Markdown HTML from untrusted content.

## Server-side Ocean API requirements
- `DATABASE_URL` and `OCEAN_HMAC_SECRET` are deployment secrets only. No `NEXT_PUBLIC_` on secrets, never commit `.env.local`.
- Use private DB schema; no browser direct write; protect any public schema tables with RLS and revoked grants. Use minimal privilege role if possible.
- Limit request size and accepted HTTP methods; reject malformed UUIDs and dates.
- Browser generates random anonymous visitor token. Server HMAC hashes it; do not persist raw token.
- Unique visitor_hash + unique idempotency_key ensures one contribution per browser token and safe retries. Does not ensure 1 unique human.
- Rate limits: server-side short windows on visitor token and trusted ingress fingerprint; do not trust arbitrary client-controlled IP headers. Reject/request challenge under abuse. Avoid retaining raw IP; use rotating keyed hashes and expire throttle buckets promptly.
- Set write kill-switch and conservative platform usage thresholds. Disable write if database availability or provider budget is threatened; show view-only mode.
- Disable/cap repeat submission; confirm only after backend response. For failure, preserve retry key and show retry state.
- Protect GET aggregate from expensive queries and excessive polling; short caching if acceptable. No per-row data exposure.

## Privacy copy to display (draft)
> No account needed. Your games and keepsakes stay on this device unless you choose to download/share them. To protect the Purple Ocean from repeated submissions, we use an anonymous browser token and short-lived security checks. We don't ask for your name or precise location. This is an unofficial ARMY-made project.

Revise to match actual deployed telemetry, cookies, platform logging and retention. Hosting/database services may process technical request metadata; don't promise zero server metadata collection.

## Retention
- Ocean contribution count/record retained for commemorative purpose unless project is retired; no identity tied to a person, browser hash treated as pseudonymous data.
- Throttle bucket data must be short lived; choose retention (e.g. <= 7 days) and implement cleanup. Document actual schedule.
- Frontend localStorage can be cleared by user; add a simple privacy/data explanation.

## Safety copy
Avoid terms `infection`, `virus`, `system compromised`, false payment/credential requests. Even fun `error 404` memes should be unmistakably fictional and opt-in, not core page UI.

## Dependency/security review
- Pin dependencies with lockfile, run audit, avoid unmaintained packages and unsanitized `dangerouslySetInnerHTML`.
- External links use secure URLs and `rel="noopener noreferrer"` for new tabs.
- Don't expose admin pages, RLS bypass credentials or DB dumps.
- Consider a basic security header policy (CSP, Referrer-Policy), with testing so art/CDN remains functional.
- If public growth exceeds free limits, degrade gracefully or turn off writes; don't allow unexpected charges.
