# TEST PLAN & DEFINITION OF DONE

## Core quality gates (run after meaningful changes)
- TypeScript strict/typecheck succeeds.
- ESLint succeeds without new warnings/errors where reasonable.
- Unit/integration tests for modified business logic succeed.
- Next.js production build succeeds.
- Playwright smoke/E2E on home, ocean, deep-link QR, offline/error states where environment allows.
- Manual test on actual Android and iPhone before public QR print; browsers may differ in image download behavior.

## Home E2E
- `/` renders title and immediate primary CTA with JS enabled; functional basic navigation without fancy art.
- On 320, 375, 390, 430px screens no horizontal overflow, bottom nav covers no CTA, readable layout.
- Home → Ocean in a single primary tap; Back returns home.
- If placeholder scene asset 404s, site still works and provides fallback.
- Keyboard tab order, focus indicator, accessible link names, reduced-motion behavior.

## Ocean API integration
1. New browser token/idempotency → exactly one accepted DB row, return server count.
2. Two simultaneous POSTs with same token/key → one contribution.
3. Same token, new idempotency → already contributed, no count change.
4. Same idempotency key, different token → safe conflict; no leak.
5. Network timeout then retry same key → no second row.
6. Malformed JSON, UUID/date, huge body → appropriate 4xx; no write.
7. Rate limit triggers 429 and Retry-After; no write.
8. DB unavailable or write-disabled → 503 and UX retry/view-only; no fake success.
9. `GET /api/ocean` returns only total/byDay; count true to database.
10. No server secret or raw browser token in client bundle, API response, error output or logs.

## Purple Ocean UI
- Pending state disables multiple taps, never increments **confirmed** total before response.
- Accepted animates new star once; duplicate shows `already added` without new star.
- Server error shows retry while keeping same unresolved idempotency key.
- Reduced-motion uses static scene + instant acknowledged feedback.
- Works with forced offline condition; canvas fallback present; no more than fixed count of lights rendered even for huge total.
- Souvenir PNG share/download works or provides supported fallback on iOS Safari.

## QR/print
- Every registry variant has one stable HTTPS route and a usable landing page.
- Invalid/unapproved variants show friendly fallback.
- Print real sample sheets across 215/150/80–100gsm; check readability, cut layout and sizing.
- Test 63×88 premium card inside nominal 65×90 sleeve (may require size adjustment to 59×86).
- Scan physical QR on at least two different phone cameras, in bright/glare and dim conditions.
- Test no QR routes to preview/staging or `YOUR_FINAL_DOMAIN` placeholder.

## Content / art
- Verify BTS song metadata, meme origin and attribution, copyright constraints, member names and translations.
- Illustrations are visibly placeholders until final art is approved.
- Check contrast, alt text, responsive crop, heavy asset loading.

## Launch gates
P0 sections pass, deployment HTTPS valid, DB active, no critical leaks, write kill-switch tested, server logs/metrics viewable, physical QR route freeze recorded, simple recovery guidance documented. More in operations document.
