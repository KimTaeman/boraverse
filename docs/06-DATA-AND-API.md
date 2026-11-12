# DATA MODEL & API CONTRACT — The Purple Ocean

## Design goal
Shared public view of an ocean that fills with accepted anonymous **contributions**. **Not a census of unique people.** The backend is needed because Next.js serverless instances do not provide durable shared in-memory data.

## Proposed PostgreSQL schema
Create in a **private, non-Data-API-exposed schema**, migration-controlled. Database access only through server-side pooled connection. Names are implementation suggestions; review before executing.

```sql
create schema if not exists app_private;

create table if not exists app_private.ocean_contributions (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  visitor_hash text not null unique,
  concert_day text not null default 'unspecified'
    check (concert_day in ('2026-12-03','2026-12-05','2026-12-06','unspecified')),
  accepted_at timestamptz not null default now()
);

create index if not exists ocean_contributions_day_idx
  on app_private.ocean_contributions (concert_day);

-- Optional short-lived abuse throttle; privacy and retention in security doc.
create table if not exists app_private.ocean_rate_buckets (
  bucket_hash text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket_hash, window_start)
);
```

Do **not** expose this schema in Supabase Data API. Revoke public/anonymous grants; use a narrowly privileged server DB role where practical. If a public schema is used instead, enable RLS and revoke unauthenticated grants. Do not rely on hidden URLs for DB security. SQL above is a proposed reference and is not deployed.

## Atomicity / idempotency logic
- Browser generates cryptographically random persistent **visitor token UUID** (local only). In each contribution attempt, generate random **idempotency key UUID** and save while request unresolved.
- Server validates both as UUIDs, limits body size, HMAC-hashes visitor token with server secret, and checks server-side abuse controls.
- In a DB transaction, insert accepted contribution using unique `(idempotency_key)` and unique `(visitor_hash)`. If conflict, fetch existing matching row and return `already_contributed` / retried result. Never create 2 rows in a race.
- Do not trust client-sent counts or accepted state. Read authoritative `COUNT(*)` after acceptance/conflict and return it. For this scale (couple thousand) `COUNT(*)` is acceptable; no additional counter table needed. If scale grows, introduce aggregate materialization transactionally.
- **Conflict correctness:** a repeated idempotency key associated with a different visitor hash must never reveal another person's token/row or be silently accepted. Return safe conflict error.
- Retried request after timeout uses **same idempotency key**, permitting safe resolution.

## HTTP API

### `GET /api/ocean`
Public, bounded aggregate only; no PII or per-contribution records.
Response example:
```json
{
  "status":"ok",
  "totalLights":1240,
  "byDay":{"2026-12-03":600,"2026-12-05":320,"2026-12-06":120,"unspecified":200},
  "updatedAt":"2026-12-03T10:15:00Z"
}
```
All numbers above are **illustrative, not real data**. Client may receive cached aggregate on initial read with a short TTL (e.g. 15–30 s) but POST always returns authoritative result. Do not serve GET with infinite static caching.

### `POST /api/ocean/contribute`
Request JSON, max ~1KB:
```json
{
  "visitorToken":"1b0bf57d-f0f7-4df5-84ec-e711b7f842aa",
  "idempotencyKey":"467768ec-3c06-4fc3-8dc3-58949fd0b047",
  "concertDay":"2026-12-03"
}
```

Success 201/200 (choose a single documented consistent mapping during implementation):
```json
{"status":"accepted","totalLights":1241,"lightId":"random-uuid","concertDay":"2026-12-03"}
```
Duplicate by same visitor/browser:
```json
{"status":"already_contributed","totalLights":1241,"lightId":"existing-uuid","concertDay":"2026-12-03"}
```

Errors (consistent shape):
```json
{"status":"error","code":"RATE_LIMITED","message":"Please try again a little later."}
```

Status codes: validation 400; too large 413; rate limited 429; DB unavailable 503; no writes permitted 503; unexpected 500 without internal details. Include `Cache-Control: no-store` on writes. Return `Retry-After` where relevant. API response must be safe to display; do not echo credentials or internal errors.

## Business rules
- One accepted contribution per anonymous browser token. This is **not** proof of uniqueness (new browsers/devices or cleared storage may contribute again).
- Concert day is user-selected or `unspecified`; don't infer attendance/geolocation.
- Decline empty/invalid tokens and malformed dates; reject oversized payloads.
- Prevent concurrent double-clicks in UI; server protects against retries/races independent of UI.
- A `pending` animation may run, but **star joining the confirmed ocean** only occurs after successful server response.
- If DB offline, show visual scene and retry action; don't invent increment.
- Don't expose individual anonymous contribution records in any public endpoint.

## Security-specific design notes
- HMAC secret is server-only; never keep raw browser token, IP or UA in database.
- Rate limit in front of write using bounded DB buckets keyed by non-reversible short-lived hashes derived from trusted infrastructure metadata where feasible; no persistent raw IP. Investigate provider trust model for forwarded headers; don't assume an arbitrary client header is authentic.
- Prevent unbounded growth/abuse; add challenge (e.g. Turnstile) only if necessary and after UX/privacy review.
- Clean rate-bucket rows on operational schedule or manual maintenance; track retention policy. Global count should be based only on ocean_contributions.
- No admin write API from public browser.

## Testing expectations
Concurrent identical requests → one accepted row. Two idempotency keys for same browser → one row. Same idempotency key with different visitor → safe conflict. Timeout/retry → same result. Two distinct visitors → two rows. Invalid body/oversize/rate-limited/DB down → no false confirmed star. GET returns only aggregate. See testing doc.
