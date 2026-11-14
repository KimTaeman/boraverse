# Celestial Storybook Ocean — replaceable placeholder slots

These original SVG/CSS placeholders implement the owner's refinement brief. They are not approved final illustration, official branding, artist likenesses or sourced fan art. Text, controls, counts and flight effects are separate from every illustration.

| Manifest slot | Placeholder / artboard | Final delivery / placement |
|---|---|---|
| `ocean.sky` | sky-mobile.svg, 720×1280 | Portrait WebP/AVIF or SVG; cover viewport, keep central text area quiet |
| `ocean.skyDesktop` | sky-desktop.svg, 1440×900 | Wide counterpart; full bleed, no text or count |
| `ocean.cloudLeft`, `ocean.cloudRight` | cloud-back-left/right.svg, 900×450 | Transparent softly feathered edges; anchored beyond left/right viewport edges |
| `ocean.cloudForeground` | cloud-front.svg, 1200×400 | Transparent low mist; shallow valley in center, no opaque rectangle |
| `ocean.moon` | moon.svg, 180×180 | Soft small crescent, alpha halo, upper-right safe zone |
| `ocean.whale` | whale-constellation.svg, 900×450 | Gentle abstract constellation, no realistic eyes/skin; transparent margins; preserve aspect ratio |
| `ocean.stage` | horizon.svg, 1200×400 | Low distant horizon/glow, center-stage landmark; alpha above and below |
| `ocean.crowd` | seven-figures.svg, 900×450 | Seven generic back-view silhouettes, no portraits or lettering; bottom anchored |
| light orb / glints | Procedural Canvas 2D | Separate charge, curved path, emitted particles and landing rings; never a baked trail image |
| keepsake base | Reuses sky + the seven transparent illustration slots | Export composes the same manifest at 1080×1920; preserve transparency and title/footer safe areas |

## Safe zones and replacing art

Change paths/dimensions in `src/content/art.ts`, keeping each slot's aspect ratio/composition or adjusting its CSS anchor. `scene.tsx` defines named layers; the existing full-bleed page wrapper is unchanged. The constellation's main landing star is at (740,184) on its 900×450 artboard. Flight geometry reads its rendered bounds via ResizeObserver; preserve that anchor or update the documented anchor fractions in `contribution-effects.tsx` when final artwork moves it. No interactive hit target depends on this coordinate.

Top copy occupies roughly the first quarter of a normal phone; the whale sits below it. Keep the middle/upper sky free of opaque artwork. Controls use safe-area padding and localized scrims. Very short screens and enlarged text can scroll. Do not bake UI, logos, numbers or contribution stars into assets.

`visual.ts` maps confirmed counts logarithmically to atmosphere/whale opacity and a deterministic bounded field: zero shared lights at count zero, up to 150 visible lights on mobile and 220 on desktop. These are a visual density representation, not an individual-user map. The numeric total remains literal. Far stars are separate decoration. Orb/particle effects run only during an interaction; request acceptance gates the flight, not a timer.

The renderer caps DPR at 2 and transient particles at 64; it pauses offscreen/hidden, disconnects observers/listeners and cancels RAF on exit. Reduced motion skips travel and shows verified success immediately. Replacing images cannot decide whether a contribution was accepted.

Run `node e2e/capture-ocean.mjs` against the isolated local preview to capture progression at 0/3/50/500/5000, eight viewport checks, two recordings and the actual keepsake export. Its API responses are local fixtures; there is no production demo mode or database write. Final artist files, source/rights approval and actual-device QA are pending.
