# HOMEPAGE & PURPLE OCEAN — Detailed Screen Blueprint

**Priority:** These are the first two screens to design and implement. **Artwork:** All supplied visuals are placeholders. Maintain pixel-perfect *behavior and composition*, not the particular placeholder drawing.

## Screen A — Village Home `/`

### Primary visitor outcomes
- Understand within 3 seconds that this is a warm, unofficial, fan-made BTS experience.
- Identify a clear button to enter or jump to Purple Ocean without hunting inside art.
- Recognize other destinations at a glance (Arcade, Magic Shop, Garden); understand that other content is optional.
- On return, resume exploring without mandatory repeated door animation.

### Mobile structure (390px reference)
1. **Header (approximately 52–64px height):** tiny star/brand, `little boraverse`, menu control with accessible label, optional mute toggle. Sticky only if it does not crowd viewport.
2. **Hero copy:** short eyebrow `A LITTLE WORLD FOR ARMY`, heading `A little magic found you.`, two-line welcoming subtitle. Accessible HTML text positioned over gradient sky, not embedded into art.
3. **Illustrated entrance scene:** ratio flexible, approximately 280–400px high depending on viewport; door centered, distant ocean/moon, two small scenic building silhouettes, flowers in foreground. The door can pulse gently but decorative animation never blocks CTA.
4. **Primary action:** `Enter our little universe` first time / `Continue exploring` returning. If already directly viewing village, main featured action becomes `Light up our ocean`.
5. **Village portals:** large labeled scenic destinations `Purple Ocean`, `Bangtan Arcade`, `Magic Shop`, `Memory Garden`. Use semantic links over/outside visual art; portals are approximately 44px minimum targets and large enough to tap with one hand.
6. **Featured Ocean invitation:** small themed band/panel with emotionally resonant one-line invitation and a direct CTA. Do not require a second modal before the Ocean page.
7. **Daily discovery shortcut:** `Let a song find you` or `Find a little fortune`, data-driven; decorative, not feature blocker.
8. **Footer:** clear unofficial fan-project notice; About/Privacy links, `Bangkok 2026`.
9. **Bottom bar:** fixed safe-area-aware `Home / Ocean / Arcade / Magic / Saved`; some destinations may have explicit `coming soon` state during staged implementation, but never dead controls.

### First-time vs returning
- A very short optional door-open visual can occur on initial click but NOT on every revisit; honor reduced motion.
- Store a local `seenWelcome` flag. The flag must not trigger hydration mismatch; server renders stable baseline, client enhances after mount.
- Scanning a QR `/c/*` skips the general door welcome unless user expressly opens Home.

### Interaction and accessible semantics
- Hero button and portal links must work if fancy illustration fails to load.
- Scene decorative layers `aria-hidden=true`; interactive elements have actual text labels.
- Menu has clear focus, Escape to dismiss, focus return to trigger; no hover-only paths.
- Provide visible skip-link to main content for keyboard visitors.
- Outbound listening platform links clearly indicate external site.

### Motion and fallback
- Ambient: tiny stars twinkle, flower sway and warm window glow; subtle, paused offscreen.
- Transition to Ocean: short crossfade/zoom (not a heavy mandatory 3D camera move); respect reduced-motion instant transition.
- On slow network: gradient/silhouette placeholder loads immediately; buttons still work.
- On JS failure: SSR content, links and basic accessible page remain navigable as far as possible.

## Screen B — Purple Ocean `/ocean`

### Main page composition
1. **Back link + heading:** `Our Little Purple Ocean`; little introductory subtitle `One little light. One beautiful memory.`
2. **Full-viewport environment:** an edge-to-edge indigo-purple sky with independent clouds, whale, crowd, particles and glow behind the content. No rounded scene card or outer gutters. Use minimum 100dvh (100svh fallback), allow vertical scrolling for short screens/enlarged text, and preserve static CSS/SVG fallbacks.
3. **Community context:** server-authoritative count displayed with label `accepted lights` or `little lights`, never `people` unless proven.
4. **Primary action:** `Add my little light` (>=44px tall), overlaid on the scene with safe contrast.
5. **Optional concert-day selection:** `December 3`, `December 5`, `December 6`, `Not attending / Prefer not to say`; default `unspecified`, no geolocation. Changing selected day **after** accepted contribution does not rewrite historical record.
6. **Feedback area:** pending, accepted, previously-contributed, retry; consistent height to limit layout shift.
7. **Keepsake panel:** appears after accepted or if previously contributed; option `Save my Bangkok star` as 1080×1920 export, alternative text share/copy.
8. **More experiences:** return Village / visit Gacha / Magic Shop. Overlaid in-page links replace the shared header, footer and persistent bottom nav on Ocean. Compact unofficial/artwork credits and About/Privacy remain available.
9. **Fine print:** contribution is anonymous per browser, may be repeated from different browsers, no unique-person claim.

### State machine: events and UI
| State | Visual and button | Trigger / transition |
|---|---|---|
| `loading` | background and loading label; contribution button not misleading | initial aggregate/visitor status request |
| `ready` | full scene; `Add my little light` enabled | no local accepted state, no blocking error |
| `submitting` | pending sparkles, disabled repeat button, `Sending your light…` | click → POST |
| `accepted` | one rising light, authoritative count, keepsake available | server confirmed new row |
| `already_contributed` | previously-added label, keepsake available, no new shared light | server confirms existing visitor |
| `error` | safe explanation + `Retry`, no confirmed count increment | failed POST/network/validation |
| `read_only` | browse sky, friendly unavailable message, writes hidden/disabled | DB offline/kill-switch |
| `reduced_motion` | static/lightly faded variant of any state | visitor setting / media query |

**Idempotency behavior:** persist unresolved request's UUID across retries; no new key until it is definitively resolved. Do not optimistically add confirmed count. GET count may be stale within bounded cache; POST returned count is definitive for that action.

### Canvas behavior
- Render **bounded** particles for density (implemented maximum 150 visible mobile / 220 desktop contribution lights); don't render a DOM element per database record.
- Density/brightness increases as total grows, not necessarily exact per-light mapping once total exceeds particle budget. Provide textual true count separately.
- Resize and device pixel ratio handling; cap internal pixel ratio on low-end devices.
- Pause animation when document hidden; honor reduced motion; avoid significant battery drain.
- Pointer/touch on canvas can produce local transient sparkle effect, but **must never POST extra contributions**.

### Successful contribution micro-interaction
1. User click produces immediate tactile visual response + pending status.
2. On server `accepted`, spark of light rises for <= 1.8 s and joins sky, with skip/reduced-motion option.
3. Show `Your light has joined the others.` and share card preview.
4. Visitor downloads a keepsake; if native download blocked, provide share-sheet/new-tab fallback.

### Error and privacy
- Server 429: gentle `The sky needs a tiny pause. Try again shortly.` honoring Retry-After.
- DB 503: `The ocean is taking a little rest. You can still explore the Boraverse.`
- Network offline: `Your light wasn't saved yet. Reconnect and try again.`
- No raw visitor token or IP is displayed in logs, UI or downloaded image.
- Never request camera, microphone, contacts, push notifications, or precise location.

## Component tree suggestions
```text
HomePage (server)
  SiteHeader
  HomeHero (server content + small client door control)
  VillageScene (art manifest, decorative)
  VillagePortals (semantic links)
  FeaturedOceanCTA
  DailyDiscovery
  MobileBottomNav
  SiteFooter

OceanPage (server shell)
  OceanHeader
  OceanExperience (client island)
    OceanVisual (canvas/static fallback)
    OceanCount (server-auth summary)
    ConcertDaySelector
    ContributionButton + Pending/Result/Error
    OceanSouvenir (on-demand image export)
  RelatedDestinations
  MobileBottomNav
  SiteFooter
```

## Acceptance walkthrough
- Start in 390px browser; homepage title readable and Ocean accessible immediately.
- Switch off JS / block hero image: baseline navigation and identity remain readable.
- Open `/ocean`; on mock backend accepted state, only one light joins and keepsake becomes available.
- Force offline: no accepted success, retry available and Ocean is still beautiful.
- Refresh after accepted: browser remembers local state, backend guards uniqueness.
- Test at 320px, iOS Safari safe area, Android Chrome, keyboard and reduced motion.

## Copy and naming caveats
Use approved original textual content. The title and page names are working product identifiers. Avoid exact BTS lyrics and implying an official concert interaction. All final imagery and any 7-member mascots are future original assets; the current placeholder visual is not final.

## Celestial Storybook refinement — 2026-11-14

The owner's implementation brief supersedes the previous realistic whale treatment. Fix 1A's full-bleed wrapper, safe areas, semantic overlays and route-specific shell are preserved. Nine named SVG illustration slots supply a soft constellation whale, watercolor-like sky/mist, crescent, distant horizon and seven symbolic back-view figures. Canvas transient effects remain independent of art.

Confirmed total → logarithmic progress (reference 5000) → bounded shared-star density, atmospheric bloom, cloud light, horizon light and constellation visibility. Zero renders no shared stars but retains faint decorative stars/whale; high totals saturate without flooding the DOM. Existing star positions remain stable. Shared lights are a representation, not a one-to-one visitor map.

`use-contribution.ts` owns request lifetime and phases: booting / ready / preparing / travelling / joining / success, plus duplicate, view-only, error/offline and rate-limit states. Only POST acceptance can start travelling. A fast response finishes a 450ms minimum charge; a slow response keeps charging and adds an explanatory message after 3.5s. The 1500ms normalized cubic flight emits 42 independently drifting particles; landing adds 20 fragments and two rings, updates the literal authoritative count, shimmers the whale and blooms the horizon. After the 900ms join, success and Save My Moment appear. Skip animation and reduced motion expose the verified result immediately; neither can fabricate acceptance.

GET remains aggregate-only. Existing visitor/pending/cooldown keys are preserved. A new versioned local success reminder is written only after validated POST success; it is never treated as current server participation status and does not cause automatic POST. Check My Light explicitly revalidates with the existing idempotent endpoint. Reads still refresh every 30s while visible, suppress stale aggregate updates during/just after a confirmed contribution, abort on exit and preserve unresolved keys after ambiguous failures.

Canvas DPR is capped at 2; transient particles at 64. RAF pauses while hidden/offscreen; observers, listeners and requests are cleaned up on route exit. CSS ambient motion pauses with scene visibility and respects reduced motion. Missing canvas falls back to immediate verified acknowledgement. Keepsake export uses the same constellation/illustration slots with download/open-image fallback.

See `public/assets/ocean/README.md` for final-art slots and `e2e/capture-ocean.mjs` for reproducible local-only fixture screenshots/recordings; no product demo query or fake production count exists.
