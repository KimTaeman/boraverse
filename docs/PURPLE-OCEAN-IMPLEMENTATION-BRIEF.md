# The Little Boraverse — Purple Ocean Implementation Brief

**For:** Codex working in the EXISTING Next.js App Router repository  
**Task:** Purple Ocean visual and animation refinement, after user's **Fix 1A** (full-bleed layout)  
**Date:** 2026-11-14  
**Status:** Implementation specification; use repository inspection to reconcile names and routes  
**Priority:** Working, emotionally expressive contribution animation; preserve current working features and backend correctness.

> **Do not start a new Next.js project. Do not undo Fix 1A. Do not refactor unrelated areas.** Read repository instructions first, inspect the current `/ocean` page, asset usage, API shape, and database code, and implement incrementally in the current codebase.

---

## 0. Codex execution contract (read before changing code)

1. Read `AGENTS.md`, `PROJECT.md` or equivalent, architecture/design/security documents, then the actual relevant source files and tests. Where this document conflicts with the *implemented* API or stack, explain the difference before changing backend behavior; prefer backward-compatible integration.
2. Inspect the user's **already completed Fix 1A**. It removed the boxed Ocean presentation and/or made the scene full-bleed. **Preserve that fix.** The task is now art direction, layered scenes, choreographed animation, interaction states, performance, and QA—not rebuilding the page wrapper.
3. Keep the existing Next.js App Router, TypeScript, Tailwind setup, navigation, routes, API, Supabase (if present), and user-visible data intact. Do not create a second source of truth for counts or fake confirmed contributions.
4. Use placeholders for original illustrations **until the user provides final artwork**. Do not hotlink third-party art, reuse screenshots as shipped assets, or imply access to user reference images not actually in the repo. The placeholder system must be easy to replace later.
5. Deliver a complete working vertical slice, not merely CSS polish. The contribution should feel like a small cinematic event: charging light → curved ascent with emitted particles → arrival burst → whale/sky response → verified success.
6. Use an established animation library *only if warranted and compatible with the repo*. Check existing dependencies first. Prefer CSS/SVG for static styling and button micro-interactions; use controlled SVG path or Canvas 2D for the ascending light and particle field. **Do not animate thousands of React nodes or set React state on every animation frame.**
7. Preserve server-authoritative semantics: an animation may *prepare* while the request is pending, but an **accepted light must not join the shared sky** until a successful authoritative server response. On a failed request, no fake light or counter increment.
8. Add or update tests and document manual verification. Run the repo's existing lint/typecheck/test/build commands. Record blockers; never report tests as passed if not run.
9. Do not provision paid infrastructure or change production secrets. No database migration without demonstrable necessity and explicit explanation of any impact.
10. Keep modifications scoped. At the end, summarize changed files, reusable asset slots, backend assumptions, validations, screenshots (if available), and what remains for final illustration replacement.

## 1. Product goal / non-goals

### Goal

The Purple Ocean is a full-viewport, immersive, dreamy BTS/ARMY-inspired shared-night-sky experience. An ARMY taps **“Add my little light”**. A small purple light is born near the silhouettes at the bottom, rises on a graceful non-linear arc with glitter and sparks, and joins a growing communal sky. A *soft whale constellation made of starlight* reacts to the arrival, and the surrounding ocean subtly brightens. The user sees confirmed contribution feedback and can save a keepsake.

**The emotional sequence:** quiet anticipation → “this is my light” → wonder → togetherness → a keepsake.

### This pass must include

- Full-bleed scene preserved from Fix 1A on mobile and desktop, not a rounded poster card.
- Cohesive original-placeholder visual art direction: celestial, painterly/storybook-inspired, soft, luminous, slightly anime-poetic; **no realistic/photographic whale**.
- Layered scene with replaceable assets, stable depth, and genuine ambient life.
- Event-driven, multi-part contribution animation with real particles/trail/world response—not one CSS-translated PNG.
- Backend-aware state machine and safe request handling; no duplicate taps or false confirmations.
- Count-driven progressive brightness, whale/constellation visibility, and star density.
- Success, already contributed, loading, offline, failure/retry, and reduced-motion states.
- Readable responsive text/buttons; keyboard/assistive-tech support; asset placeholders that do not block progress.
- QA and automated tests appropriate to existing repo.

### Explicitly NOT in this pass

- Redesign the rest of the Boraverse, Arcade, Magic Shop, navigation system, or QR system.
- Create lifelike BTS portraits or exact likenesses; treat seven people at the bottom as symbolic **back-view silhouettes** or soft generic figures.
- Implement custom ARMY avatar builder, free-text message wall, music playback, complex milestone events, or new authentication.
- Overhaul Supabase setup, rewrite working API endpoints, switch hosting providers, or replace the existing database just for animation.
- Generate a giant final composite with text/CTA baked into it; all UI and dynamic lights remain independent layers.

---

## 2. Visual direction and composition

### Art direction — lock for this implementation

**Style name:** *Celestial Storybook Ocean*. Combine a cinematic concert-sky composition with a soft anime watercolor/storybook fantasy illustration. Indigo, midnight plum, lilac, violet, lavender, very restrained blush pink, a hint of warm ivory. The sky should feel *dreamy and emotional*, not sinister, dull, sterile, overly neon, plastic, overly cute, or photorealistic.

**Most important changes from the previous build:**
- Old: static illustrated poster inside a dark UI box, realistic whale taking up center, separate flat count/button panel.
- Target: **one continuous full-bleed scene**, text and actions overlaid on it, whale made of faint stars/constellation lines/light, a sky whose luminosity visibly responds to community count and user action.
- On empty ocean: still visually inviting and legible, but with few shared lights and an almost imperceptible whale outline; do not render a featureless black screen.
- At higher totals: rich purple lights and a legible whale constellation, without blowing out UI contrast or blocking the CTA.

### Scene layer order (rear → front)

1. `BaseSky`: CSS gradient or optimized base illustration, full viewport and full bleed; atmospheric indigo/plum with violet toward horizon.
2. `NebulaHaze`: subtle diffuse cloud/gradient noise; do not overload with glitter.
3. `FarStars`: deterministic background stars of low intensity, independent of contribution count.
4. `Moon`: small soft crescent near upper-right, never a bright overpowering moon.
5. `CloudsBack`: misty cloud shapes at edges/horizon; gentle parallax.
6. `SharedLightField`: count-driven, deterministic, bounded field of purple stars/lightstick glows; may use Canvas 2D.
7. `WhaleConstellation`: **stylized celestial silhouette and star points**, not realistic anatomy. At count=0 almost unseen, increasing in reveal as count rises. The whale is a shared symbolic motif, not one user's single light.
8. `Horizon / StageGlow`: stylized distant concert horizon, lit by audience, integrated with lower part of sky.
9. `ForegroundSevenFigures`: seven small generic stylized back-view figures near bottom (not literal member portraits). Keep silhouettes subtle; never compete with action.
10. `ContributionEffects`: charged orb, curved trail, sparks, landing burst, localized ripples, and transient glints.
11. `UIOverlay`: header/back/nav, title, accessible count, CTA, status, success/keepsake controls. UI must be rendered as semantic HTML, not embedded in artwork.

All layers live inside one stable, full-bleed scene coordinate system. Do not create separate image cards; the backdrop extends under the fixed/safe-area-aware action region.

### Layout rules

- **Page:** `min-height: 100svh` or modern `100dvh` with safe fallbacks; support long content, on-screen keyboards, and desktop tall screens. Preserve already-fixed full-bleed architecture.
- **Desktop:** art goes edge-to-edge across viewport, not constrained by the site's standard max-width container. A readable central content column can have a max width, but **only its text/buttons**, not the background illustration. No large empty flat purple gutters.
- **Mobile (320–430 px):** sky should dominate the screen. Back/header small; title in top 10–20%; whale in upper/middle visual band, subtle; seven silhouettes/horizon near lower 70–88%; count + CTA within lower safe area as overlay with local gradient scrim. No scrolling just to press CTA on normal phones; allow natural scroll on very short displays.
- **Text:** dynamic responsive typography using `clamp()`; readable at 320 px; avoid tiny 9px labels. Elegant serif only for headings, restrained sans for body/buttons. Fallback fonts are acceptable; do not add an external paid font dependency.
- **Contrast:** add local shadow/scrim behind type or control when needed, not giant opaque black panels. Count should look editorial, not a dashboard metric tile.
- **No giant logo or whale obscuring the main message.** The user should recognize the action within a few seconds.
- Never bake actual text, number, button, or logo into art assets.

### Candidate initial copy

- Eyebrow: `BANGKOK 2026 · A SHARED SKY`
- Heading: `Our Little Purple Ocean`
- Supporting: `Every little light carries a story.`
- Before: `Will you add yours to our sky?`
- CTA: `Add my little light` (exact priority copy)
- Pending: `Getting your light ready…`
- Animation: `Your little light is on its way…`
- Success: `Your light has joined the ocean. ♡`
- Secondary success: `Somewhere, another ARMY is shining with you.`
- Download: `Save my moment`
- Retained participation: `Your light is already part of our sky.`
- Failure: `Your light couldn't be sent right now. Please try again.`
- Shared count label: `confirmed little lights` or equivalent, with a discreet explanation these are contributions, not verified distinct people.

---

## 3. Scene evolution: from quiet night to collective ocean

The background must change as **server-confirmed total contributions** increase, not based on fake client clicks. Use a **smooth saturating progression**, not a large 2–5% global brightness increase for each individual light (that would quickly saturate).

Recommended normalized intensity for visual art (fine-tune based on screenshot comparison):

```ts
export function oceanProgress(total: number, reference = 5000): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.min(1, Math.log1p(total) / Math.log1p(reference));
}
```

Map `progress` (0..1) onto bounded values:
- Shared star field: e.g. **8 → 150 stars on mobile**, up to **220 on desktop**, not `total` individual DOM objects.
- Ambient bloom opacity: **0.06 → 0.45**.
- Horizon light intensity: **0.10 → 0.70**.
- Whale constellation opacity: **0.04 → 0.82**.
- Sky base brightness: subtle and bounded, so text retains contrast even at maximum.
- Cloud rim tint: restrained and count-responsive.
- The numerical total remains literal and server-authoritative; graphics are **representations**, never one-to-one points.

Narrative guide, not hard thresholds:

| Confirmed total | Mood | Visual changes |
| --- | --- | --- |
| 0 | Quiet, welcoming night | moon, a handful of ambient stars, very faint whale outline |
| 1–49 | First sparks | a few purple shared lights appear; faint glow around horizon |
| 50–199 | Gathering | more star clusters, subtle cloud-rim lavender, whale begins to emerge |
| 200–999 | Constellation | whale star points and lines visible, light field growing |
| 1,000–4,999 | Shared ocean | richer glow and density, whale more recognizable |
| 5,000+ | Radiant collective sky | cinematic sky, still readable and not overexposed |

**Important:** star positions must be deterministic between count changes (seed by fixed scene seed + star index, not new `Math.random()` each render), so existing lights do not jump when totals update or screen resizes. New confirmed contributions can add 1 visually special **transient** star in addition to recomputing the normalized aggregate. Do not claim that each rendered star represents an individual user.

Optional later: a few different whale constellation poses or subtle traveling wave when milestones are reached. Not required for this pass.

---

## 4. Contribution interaction: exact behavior and timing

**This is the key implementation. A single static orb moving upward is not acceptable.** Create an orchestrated sequence of nested visual events using a normalized scene path, emitted particles, independent trails, soft camera/sky reactions and an authoritative backend confirmation.

### State machine

States: `booting`, `ready`, `preparing`, `travelling`, `joining`, `success`, `already-contributed`, `offline`, `error`, `view-only`.

- `booting`: scene shown as static/ambient; fetch current total and participation status if supported. Skeleton only for count; never block navigation.
- `ready`: accessible button enabled; starry scene alive.
- `preparing`: one request in flight. Disable repeated submit. Compress CTA, emit ripple, begin charging a light **without yet adding it to shared sky**.
- On success from backend: if confirmation arrives quickly, finish a short minimum charge (roughly 350–500 ms) and transition to `travelling`. If response is slow, hold a subtle charge animation and show pending message, no fake count.
- `travelling`: orb follows curved path with particles spawning *along the path* and fading on their own trajectories; do not simply move a fixed trail image.
- `joining`: orb lands at a chosen sky/whale constellation point, yields a burst, triggers whale shimmer and slight horizon/world response; count animates to authoritative total.
- `success`: result message and `Save my moment` appear; navigation remains usable.
- `already-contributed`: confirmed by existing server logic, if present; show view-only/keep exploring/keepsake. Do not manufacture a second light.
- `offline`/`error`: charge glows down; no travelling/landing or success; meaningful retry using same idempotency key when appropriate.
- `view-only`: usable ambient scene with no write access, if existing backend intentionally restricts requests.

If the existing API only returns aggregate counts and does not support per-browser definitive status, **do not claim server-verified browser uniqueness**. Treat locally remembered success as a soft UI reminder, with server validation authoritative.

### Timeline for successfully accepted contribution (total ~2.8–3.2 s)

| Time from tap | Event | Visual behavior |
| --- | --- | --- |
| 0–180 ms | Touch confirmation | CTA scale 1 → 0.97 → 1, soft focus glow, an outward ripple from actual CTA or origin; immediate pending label |
| 180–550 ms | Charge | near silhouettes, particles converge, small orb condenses and pulses, its halo brightens; waiting on server if needed |
| 550–2050 ms | Curved ascent | confirmed orb travels on cubic Bézier/`offset-path`, emits luminous dust, small sparkles diverge and fade; subtle scale/velocity changes |
| 1700–2450 ms | Approach | orb slows and shrinks slightly; constellation star point anticipates glow, nearby stars flicker softly |
| 2100–2750 ms | Join | orb bursts into a star cluster; 12–24 burst fragments disperse; soft concentric ripple; whale lines and internal stars shimmer across body; scene light level eases toward new count-driven target |
| 2600–3200 ms | Acknowledge | confirmed total displayed; success copy enters; keepsake action and continue-exploring link become available |

**Sequencing rule:** these are design targets, not timers that govern server truth. If API resolves late, stay in `preparing` safely; do not launch until authoritative success. If API resolves early, perform visual sequence normally. If navigation/unmount occurs, cancel animations/RAF and any subscriptions; no orphaned effects.

### Required path motion

Use a cubic Bézier curve in normalized scene coordinates rather than straight `translateY`:

```
P0 = (0.50, 0.78)  # launch near bottom-center silhouettes/raised light
P1 = (0.29, 0.62)  # first drift to the left
P2 = (0.76, 0.42)  # arc and return toward sky
P3 = (0.64, 0.28)  # join point in whale/sky
```

Adjust for device width, portrait/landscape, and composition collision with headings. Use an explicit SVG motion path or compute Bézier position and tangent `B(t)` per frame. Use `t` easing for velocity. For visual variety, allow small **deterministic** end point offsets based on the accepted contribution, while staying in safe sky region.

`B(t)=(1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t)t^2 P2 + t^3 P3`.

Trail & particles:
- Bright orb center (not large PNG), soft halo separately drawn/composited.
- Tail/afterglow that follows the path and dissipates, not a single asset attached at fixed position.
- Spawn about 20–45 trail particles per full flight (adapt to device capability); size and speed vary mildly; lifetime ~0.6–1.5s; fade/scale down with slight lateral drift.
- Small sparkle events at meaningful moments along the arc. Avoid hard flashes, strobes, or excessive particle counts.
- At landing, 12–24 soft particles disperse, with 1–2 slowly expanding low-opacity rings.
- Whale response: an internal wave of star points twinkles from tail toward head OR a soft gradient shimmer follows the whale outline. Do not scale the entire whale dramatically.
- Horizon responds by a brief localized lavender bloom (not global white flash).

For reduced motion, replace with: short glow at origin → quick dissolve/reappear at destination → gentle static star highlight + confirmed success. No curved camera movement or long trailing effects.

### Animation ownership

- A dedicated `useOceanContribution` (or equivalent) handles API state and request lifetime.
- `ContributionSequence` handles orchestration of charge, flight, merge, bloom, success; it receives success **data**, never decides whether the database write succeeded.
- `ParticleCanvas` or specialized SVG layer renders transient paths/particles independently from React render loops.
- Count display interpolates to server value only after successful response; on initial load it displays fetched value, no fabricated count.
- Keep animations deterministic/testable where possible. Expose a dev-only debug mode via explicit test fixtures, not production URL behavior.

---

## 5. Suggested component and asset architecture (adapt to actual repo)

**Don't enforce this exact file tree if equivalent components already exist. Refactor minimally.**

```text
src/
  app/ocean/page.tsx                 # Prefer Server Component shell if practical
  components/ocean/
    PurpleOceanExperience.tsx       # Client orchestrator; accessible state & composition
    OceanScene.tsx                  # Layers + normalized coordinate space
    OceanSky.tsx                    # Gradient/nebula/cloud/moon/static artwork slots
    SharedLightField.tsx            # Canvas or bounded procedural sparkle render
    WhaleConstellation.tsx          # Stylized whale placeholder + intensity/shimmer
    OceanForeground.tsx             # Distant stage/horizon/seven figures
    ContributionSequence.tsx        # Charge/flight/land event choreography
    ParticleCanvas.tsx              # RAF and particle emission; cleanup on unmount
    ContributionControls.tsx        # Button, count, status, retry
    OceanSuccess.tsx                # Confirmation + download/continue actions
    OceanKeepsake.tsx               # Export rendering; can reuse existing feature
  lib/ocean/
    ocean-progress.ts               # Pure clamped brightness computation
    ocean-particles.ts              # Pure particles + seeded RNG/geometry
    ocean-api.ts                    # Typed wrapper around existing backend contract
    ocean-types.ts                  # Types/state union
  public/assets/ocean/
    README.md                        # Artwork slots and replacement guidance
    ...optional SVG placeholders...
```

### Asset manifest / replaceable slots

Create named placeholders or slots, all optional and gracefully falling back:

| Slot | Purpose | Suggested final format | Must be independent? |
| --- | --- | --- | --- |
| `skyBase` | full-bleed quiet twilight sky | WebP/AVIF portrait plus wide variant | yes |
| `cloudBack` | far mist | transparent WebP/AVIF | yes |
| `cloudFront` | low soft foreground haze | transparent WebP/AVIF | yes |
| `crescentMoon` | upper-right moon | SVG/transparent WebP | yes |
| `whaleConstellation` | stylized soft luminous whale / constellation | SVG preferred; otherwise transparent WebP with separate glow | **yes** |
| `horizonGlow` | stage-like distant warm/purple bloom | transparent WebP/CSS | yes |
| `sevenBackFigures` | seven small generic symbolic silhouettes | transparent WebP/SVG | yes |
| `lightOrb` | user light | SVG/procedural Canvas preferred | can be procedural |
| `glints` | star shapes/sparkles | procedural Canvas/SVG | can be procedural |
| `keepsakeBase` | static downloadable artwork | WebP/AVIF | yes |

Rules:
- **No pre-rendered static shooting-star trail for the main event.** Build trail dynamically.
- Whale must not have physically realistic face/eyes/skin texture. Use abstract light-body and star constellation stylization.
- All final assets should share a consistent painterly/anime-storybook style; placeholders should be artistically soft, not generic clip art or emoji.
- Distinguish scene art (decorative) from meaningful text and controls (semantic UI).
- Expose a `public/assets/ocean/README.md` specifying artboard/aspect ratios, transparency, safe zones, anchoring and replacement workflow. Do not bake in navigation or counts.
- If supplied assets are absent, build a credible gradient/SVG placeholder scene; no broken-image icons or generic grey boxes.

### Suggested scene positioning

- Scene is a single `position: relative` container filling viewport. Use `position: absolute; inset: 0` decorative layers with `pointer-events: none; user-select: none`.
- Use `object-fit: cover` on base scenery, but anchor meaningful silhouettes/whale layers separately so cropping never cuts important subjects. For narrow viewports, alter focal positions or swap art variants rather than stretching the whale.
- Use normalized positions for flight origin and destination; map these to actual `ResizeObserver` scene bounds, updating on resize/orientation changes.
- Foreground figures stay near bottom; main CTA may overlap via a translucent scrim, but not cover all seven figures.
- On desktop, art is full-bleed; text content max width floats above it. On mobile, star scene fills screen and controls are safe-area aware.

---

## 6. Backend preservation and correctness contract

The current screenshots show a confirmed count and post-contribution experience; **assume there may already be a functioning backend**. Inspect and preserve it. This task is **not** permission to rebuild the DB layer.

### Requirements

1. Use existing typed GET count and POST contribute functions if available. If not, wrap the existing endpoint shape in a typed adapter and report the assumptions.
2. No optimistic permanent increment. The returned **confirmed count** is authoritative.
3. Prevent repeated submissions in the same pending interaction (`inFlightRef` or equivalent plus UI disable). Do not rely only on disabled button state (double taps can race).
4. If API supports an idempotency key, generate once per attempted contribution and reuse for retries after ambiguous failures. Prefer `crypto.randomUUID()` in browser; only store a non-sensitive key needed for safe retry. Do not silently regenerate after timeout and risk double contribution.
5. If the API *does not* support idempotency, identify the gap and do not claim exact-once semantics. Avoid backend mutation unless in scope; suggest a narrow follow-up change.
6. Handle server-side `already contributed` responses distinctly from generic errors. Local storage alone is not proof of unique personhood.
7. Persist a local success flag **only after verified success**. Use a versioned key, e.g. `boraverse:ocean:participation:v1`, but inspect existing keys before adding a new one.
8. A current total can increase by more than one between requests because other users also contribute; animate to the actual value and do not assume `previous + 1`.
9. Avoid continuous polling or realtime subscriptions unless already supported; refresh total on mount, after success, and optionally on return to visible/focus with throttling. Show graceful fallback if read fails.
10. Properly abort in-flight GETs when unmounted, guard async state updates, clean up RAF, observers, event listeners, and animations. Aborting HTTP is not the same as rolling back a server write; account for ambiguous outcomes.
11. No browser exposure of Supabase service-role or server-only secrets. Preserve existing RLS and input validation.
12. Keep client-side fake totals, seeded star-count examples, and any `?demo` debug mode **out of production**.

### Acceptance behavior (API timing)

- **Fast success (100ms):** button pulses/charges; confirmed event then launches light; count updates to server response; success visible after cinematic event.
- **Slow success (4s):** gentle charge/pending state continues; no traveling or finished light before confirmation; after response, sequence plays and succeeds.
- **500/network error:** charge fades safely, state becomes error; count unchanged; retry available; no false success.
- **Timeout with ambiguous commit:** existing idempotency mechanism, if supported, retries safely or re-queries status; never blindly claims failure permanently or sends a new request ID in a way that may duplicate.
- **Already contributed:** still show a beautiful scene + saved message; do not submit again unless server legitimately allows it.
- **Offline:** explain briefly; scene viewable, retry when online; avoid claiming upload happened.

---

## 7. Performance, accessibility and reduced motion

### Performance strategy

- Keep static visual layers (CSS background/optimized images) separate from high-frequency canvas rendering.
- Preload only essential current-screen art; lazy-load optional/high-resolution whale/keepsake assets as appropriate.
- Cap canvas device pixel ratio at 2 (or lower on resource-constrained devices). Resize canvas with element's actual box; clear/redraw responsibly.
- Keep shared lights bounded (e.g. 150 mobile / 220 desktop) even when server count reaches hundreds of thousands. Represent total via brightness/density, not one DOM node per contribution.
- No React `setState` on every RAF tick. Mutable refs or internal canvas renderer for frame state; React updates only at phase transitions and user-facing status updates.
- Pause ambient requestAnimationFrame when `document.hidden`, when scene offscreen if applicable, or under reduced motion. Clean on unmount. Do not leave orphan animations after route changes.
- Ensure skyline layers do not cause large layout shifts. Reserve dimensions and use responsive cropping.
- Do not introduce an expensive WebGL/Three.js stack for this one effect unless the repository already has it and a measurable need exists. Canvas 2D/SVG is enough.
- Respect browser battery/data constraints; ambient sky should be subtle, with restrained particle counts and reasonable frame rates.

### Accessibility

- One real semantic button for contribution; keyboard activation (Enter/Space), touch target >=44×44 px, clear focus ring.
- Announce confirmed success/error via dedicated `aria-live="polite"` region; don't force screen readers through every intermediate animation line.
- Title, count and explanatory text remain readable over scene at all count tiers.
- Decorative sky/canvas/whale layers marked hidden from assistive tech; meaningful text not baked into artwork.
- Read existing `prefers-reduced-motion` and respect changes. Provide instant/lightweight fallback that still communicates success and count update. No mandatory motion to access the result.
- No flashing/strobing patterns. No autoplay music. Existing audio toggle behavior remains unchanged.
- Color is not the only success/error cue. Error message and retry action must be visible.
- Consider `prefers-contrast` where practical; ensure CTA, back navigation and control labels distinguishable.
- Works with browser zoom and large text without clipping essential action.

### Responsive QA matrix

- Mobile narrow: 320×568.
- Typical modern phone: 375×812, 390×844, 430×932.
- Small tablet: 768×1024.
- Desktop: 1366×768, 1440×900, 1920×1080.
- Test iOS Safari and Android Chrome on at least one real device each if available; otherwise record limitations.
- Check browser back/forward and direct `/ocean` navigation, scrollbars, safe-area, changing orientation, text scaling.

---

## 8. Proposed tests

### Unit

- `oceanProgress`: clamps negative, NaN, 0, 3, 50, 200, 1000, 5000, very large; always returns 0..1, monotonic.
- Seeded star layout stable for same seed and dimensions; star count bounded; changes in count don't reposition existing stars arbitrarily.
- Bézier helper returns correct start/end, normalized values; endpoint remains visible on narrow and wide aspect ratios.
- Contribution reducer/state transitions: no success without confirmed API response; duplicate tap ignored; failures permit retry; route exit cleanup.
- Particle simulation bounds count/lifetime and eventually ends; reduced-motion path skips high motion.

### Component/integration

- On initial load, visible real count/appropriate loading state.
- `ready → preparing → travelling → joining → success` after mocked success.
- With delayed promise, no permanent light/count/success before resolve.
- With 500/rejected request, clear error and unchanged count.
- With existing contribution status, no accidental POST.
- Success message announced; keyboard button works.
- Broken artwork image does not break UI.

### E2E (Playwright if repo has it; otherwise adapt to existing tooling)

- Mock GET totals **0, 3, 50, 500, 5000** and compare screenshots of visual progression.
- Mock POST success with authoritative total 4, then success view/keepsake actions.
- Slow network, offline/error and already-contributed states.
- Repeated click/tap only initiates one in-flight POST.
- Desktop screenshot shows full-bleed scene, not a centered round-corner card or flat gutters.
- Mobile screenshot shows scene extending under the page with CTA usable without excessive scrolling.
- Reduced motion has no long shoot-up animation but does confirm participation visibly.
- No console warnings/hydration mismatches, no lingering loops after navigation, no unhandled promise rejections.

If browser automation is available: save before/after screenshots or short screen recordings for **mobile and desktop**. If unavailable, state that and give precise manual steps.

---

## 9. Implementation order (incremental deliverables)

### Step 0 — Audit & baseline

- Inspect components, 1A full-bleed fixes, repo instructions, existing assets/API, animations/test scripts.
- Capture before screenshots of current desktop/mobile (if possible).
- Report current implementation shape and any relevant conflicts; no large rewrites.

### Step 1 — Layered scene and placeholder art

- Keep full bleed; break artwork into independent visual layers.
- Replace photorealistic whale with gentle abstract whale constellation SVG placeholder.
- Add sky progression helper and stable seeded shared lights.
- Overlay semantic title/count/button; refine typography/contrast and mobile safe-area.
- Test 0, 3, 50, 500, 5000 count screenshots.

### Step 2 — Contribution choreography

- Implement state machine and loading/cancel/error behavior.
- Implement charge, curved Bézier flight, **emitted** particle trail, landing burst, whale shimmer/horizon bloom, success transition.
- Integrate existing backend and authoritative count. No false success.
- Reduced-motion fallback and cleanup.

### Step 3 — Polish and QA

- Verify real responsive behavior, lower-end device smoothness, animation/reduced motion, error handling, direct navigation, returns.
- Test before/after screenshots, typecheck, lint, tests and build; fix issues within scope.
- Write concise asset replacement notes and final implementation report.

Prefer completing these 3 steps in one task if feasible; do not stop after producing skeletons or planning notes. If blocked by missing assets, use high-quality SVG/CSS placeholders and continue. If blocked by a missing backend, implement scene and animation against an explicit mock/typed adapter in **development only** and report the blocker instead of fabricating production success.

---

## 10. Definition of done — reject shallow implementations

The task is complete only when:

- [ ] Existing Fix 1A full-bleed layout remains intact across desktop/mobile.
- [ ] Main `/ocean` scene looks cohesive without final artwork, with **no photorealistic/scary whale**.
- [ ] Whale is a soft constellation/light-body that becomes clearer as confirmed contributions grow.
- [ ] Shared count affects sky light density/brightness at mocked totals 0, 3, 50, 500 and 5000.
- [ ] Pressing contribute creates **charge → curved flight → independently animated glitter trail → landing burst → subtle whale/sky reaction → confirmed success**.
- [ ] API failure does not leave a phantom light or increment displayed confirmed count.
- [ ] Duplicate rapid taps do not send parallel requests.
- [ ] Already-contributed and offline states have correct UI and no false claims.
- [ ] No large persistent particle DOM lists, no `setState` per frame, no abandoned RAF/listeners.
- [ ] UI is legible and the CTA accessible at 320px width and 1440px desktop.
- [ ] `prefers-reduced-motion` preserves clear meaning without long animations.
- [ ] Artwork replacement requires only substituting assets/manifest, not restructuring the page.
- [ ] Existing navigation, QR entry, keepsake and API behavior remain intact.
- [ ] Repo's appropriate validation checks run; their results are reported accurately.
- [ ] A final report contains changed files, assumptions, manual tests, and pending final-art placeholders.

---

## 11. Final response format for Codex

At completion, respond with:

1. **Implemented:** concise summary and specific user-visible improvements.
2. **Changed files:** list with brief explanation.
3. **Animation behavior:** actual sequence and how it is tied to server confirmation.
4. **Backend:** what existing endpoints/data were used, and any unresolved idempotency/status caveats.
5. **Asset slots:** what placeholders exist and what needs later replacement.
6. **Validation:** commands run, results, screenshot/recording locations if generated, and device limitations.
7. **Known issues / next steps:** only real remaining blockers, no invented completion.

### Short user-provided creative notes

- Current site felt dull because imagery sat inside a boxed panel (Fix 1A reportedly corrected), the whale was realistic/scary, and button press resembled translating one asset.
- User wants luminous illustrated purple sky, gentle surreal whale, tiny seven-person silhouette at bottom, dark-to-bright evolution as users contribute, shooting-star or little light traveling upward and joining a collective whale/ocean, cinematic/emotional but warm and welcoming.
- Reference mood: dreamy purple sky full of stars, storybook/anime painting, Mikrokosmos/Whalien emotional symbolism, purple lightstick ocean, glow and glitter. **These are mood references, not permission to copy uploaded art or official brand assets.**

---

## 12. Primary documentation links for implementation context

- Next.js App Router / Server & Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Motion for React / scoped sequencing: https://motion.dev/docs/react-use-animate
- Motion animation/path: https://motion.dev/docs/react-animation
- Reduced motion / accessibility: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility

Use the project's installed library APIs as the authority. These are references, not a mandate to install new dependencies.
