# Practical Workflows for Codex (reference, not an installed Codex skill)

These short routines guide repeatable work. This file is not by itself an auto-discovered Codex skill; Codex reads the repository's `AGENTS.md` and linked docs. Only create `.agents/skills/<name>/SKILL.md` if later needed and supported by the installed Codex environment.

## Workflow 1: Build a new room UI
1. Read product scope, UX, design tokens, placeholder manifest.
2. Write loading/empty/error/returning/reduced-motion states before animation.
3. Implement accessible semantic control layer first. Use original SVG/CSS placeholders behind it.
4. Add progressive enhancement animation; keep primary CTA usable immediately.
5. Test 320, 375, 390, 430px and desktop; keyboard, screen reader, reduced motion, slow 3G.
6. Report performance impact and whether source art is final or placeholder.

## Workflow 2: Add a QR variant
1. Register validated `family`/`variant` in the typed content registry with attribution and draft/approved status.
2. Resolve to a stable canonical URL and matching first reveal; never use arbitrary URL destinations from query parameters.
3. Verify QR generated with sufficient quiet zone and dimensions appropriate to physical print; do actual print/phone testing before mass printing.
4. Test unknown or disabled variants go to a friendly fallback; no 500 errors.
5. Record precise design family, size, count and tested destination in print registry.

## Workflow 3: Add a shared Ocean backend change
1. Review security and API contracts; write migration and integration tests first.
2. Confirm private database access, atomic/unique contribution handling, browser token handling, and idempotency.
3. Test concurrency, duplicate POST, retry after lost response, invalid input, abused requests, DB unavailable, provider limits.
4. Confirm frontend counts only **accepted** contributions; preserve an explicit retry state.
5. Validate production health checks; do not claim real unique-person counts.

## Workflow 4: Curate BTS-related content
1. Verify facts/joke origins using official material or dependable references.
2. Write original text; avoid substantial song lyrics, audio, borrowed artworks, and endorsement claims.
3. Mark lore as `verified`, `needs-review`, or `fictional-playful` in the registry.
4. Ensure an optional `What's the reference?` explanation for new ARMYs.
5. Validate typos, member names, title capitalization, translations and source link.

## Workflow 5: Replace placeholder illustration
1. Inspect new art files and license/origin; don't change routing, state machines, or interactive hit target semantics.
2. Map layers via `docs/09-ASSETS.md` and manifest IDs.
3. Export responsive and optimized formats with accessible text overlays external to image.
4. Test visual crop, contrast, compressed sizes, reduced-motion and low-end mobile memory.
5. Preserve fallback illustration when art fails to load.

## Workflow 6: Prepare for show day
1. Run `docs/11-TESTING.md` launch gates and `docs/13-OPERATIONS.md` runbook.
2. Verify real production QR samples on printed paper on Android/iOS.
3. Verify database project is active and endpoint returns correct counts without exposing secrets.
4. Do a safe load/abuse rehearsal within free-tier limits; confirm error fallback.
5. Freeze printed QR destinations and content IDs; fix bugs without breaking old links.
