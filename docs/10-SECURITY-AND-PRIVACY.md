# SECURITY, TRUST & PRIVACY

## Threat model
Anonymous public QR website used at crowded concerts. Risks: bot/flooded contributions, duplicate requests, database exhaustion, secrets leaked to frontend, malicious external links, user confusion about official status, abuse from open UGC, accessibility/poor network issues.

## Security principles
- No login for launch. No collection of name, email, phone, social accounts or precise location. Shared text is limited to the planned D017 Magic Shop flows and must use explicit publication consent and the settled publishing policy.
- D017 authorizes designing a public Dear Bangtan letter collection/reactions and a visitor-written Dear ARMY message jar. Drafts remain private until explicit sharing, and neither feature sends direct messages to BTS. These shared features are not live yet; other public visitor-message features remain outside scope.
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
- Approved D013: rate buckets become eligible for deletion after one day. Existing cleanup runs during contribution attempts that pass the global limit; idle-site rows may remain longer. Review manual cleanup before reopening or retiring an inactive site. Contributions are retained until retirement, when export/deletion is reviewed. Provider metadata/log retention is separate.
- Approved ingress: Vercel counts source IP at the hosting edge for POST `/api/ocean/contribute`, allowing 120 requests per fixed 60-second window and returning 429 above that. The app stores no new raw-IP field. Application limits remain 60 attempts/minute globally and 5/token/minute.
- Frontend localStorage can be cleared by user; add a simple privacy/data explanation.

## Safety copy
Avoid terms `infection`, `virus`, `system compromised`, false payment/credential requests. Even fun `error 404` memes should be unmistakably fictional and opt-in, not core page UI.

## Dependency/security review
- Pin dependencies with lockfile, run audit, avoid unmaintained packages and unsanitized `dangerouslySetInnerHTML`.
- External links use secure URLs and `rel="noopener noreferrer"` for new tabs.
- Don't expose admin pages, RLS bypass credentials or DB dumps.
- Consider a basic security header policy (CSP, Referrer-Policy), with testing so art/CDN remains functional.
- If public growth exceeds free limits, degrade gracefully or turn off writes; don't allow unexpected charges.

## Implemented browser-data disclosure — 2026-11-16

The public Privacy page explains local-only games/letters, explicit browser-local keepsake saves, on-device image generation, and clearing site data. Clearing browser data removes local keepsakes/identifiers but does not delete server-held Ocean records or copies already downloaded/shared. The page also explains that a chosen listening link opens YouTube under that service's separate privacy practices. Existing Ocean hash, ingress, provider metadata and approved retention disclosures remain intact. This describes current implementation; final owner review of public wording/provider settings is still pending.

## Shared Magic Shop implementation requirements — proposed, D017

The publishing policy (pre-publication review versus immediate publication with reporting/removal) is awaiting the owner. UI work must not silently pick a live policy. The current study uses clearly labeled sample content and local preview reactions, with no network requests or fabricated shared success/counts.

Before implementation/release: obtain explicit sharing consent; render bounded plain text only; keep contact details, URLs, uploads and arbitrary HTML out of submitted content; provide reporting, removal and queue handling appropriate to the selected policy. Choose and disclose retention and anonymous removal/recovery behavior before collecting text. Reuse server-only route-handler access to private PostgreSQL, validation, idempotency, resource/rate limits and a separate write-off switch. Do not add Auth, Storage, Realtime or paid services just for this feature. Database work needs versioned migrations, least privilege and tests before use.

Dear Bangtan agreement reactions need one active reaction per browser token per letter, atomic toggles/idempotent retries, returned server counts and clear offline/error feedback; they do not prove unique-person counts. Public feeds must be bounded/paginated and expose no author/token hashes or private/pending/rejected content. Dear ARMY random selection must use only eligible published messages, handle an empty pool truthfully, and avoid the author's own message and immediate repeats where feasible. Never migrate private drafts/keepsakes into public content, log submitted bodies, put them in URLs, or display an accepted/shared state before confirmation. Public privacy text must be revised before collecting shared messages; current local-only wording remains accurate for the unchanged deployed app.
