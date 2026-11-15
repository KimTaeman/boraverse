# DESIGN SYSTEM — Enchanted Purple Storybook

**Status:** Functional design tokens and art direction are **proposed v1**, not final illustrations. The owner will supply original artwork later. Implement with swap-friendly placeholders.

## Visual architecture
- Home: enchanted twilight village; miniature illuminated Magic Shop doorway, tiny flowers, stars, background coastline.
- Ocean: cinematic purple night, layered indigo sky, gentle waves and bounded glowing lights.
- Arcade: pastel Y2K/pixel world, rounded gacha machines, playful UI.
- Magic Shop: warm paper, illustrated envelopes, vintage scrapbook warmth.
- Garden P1: snow-to-blossom illustrated seasons, slower calmer motion.
- All rooms share typography, button semantics, navigation, responsive grid and brand tokens.

## Initial theme tokens (modifiable in one place)
| CSS token | HEX | Purpose |
|---|---|---|
| `--midnight` | `#241833` | dark background |
| `--indigo` | `#17142B` | Ocean background |
| `--violet` | `#6E4EA5` | identity / borders |
| `--lavender` | `#B99AE7` | primary light accent |
| `--blossom` | `#F4C6DC` | playful highlight |
| `--paper` | `#FFF5E9` | light panels, letters |
| `--star-gold` | `#F4D78A` | sparkles / reward |
| `--ink-light` | `#FFFFFF` | text over dark |
| `--ink-dark` | `#30213D` | text over cream |
| `--muted-light` | `#DEC9EF` | subtext on dark; recheck contrast |

Use accessible contrast combinations; color is not the only state indicator. Do not assume every lavender/pink pairing passes WCAG—measure in final implementation.

## Typography
- Primary readable rounded sans: **Nunito Sans** (or similarly legible licensed font, with system sans fallback).
- Decorative serif headings: **Fraunces** or another licensed ornamental face, limited to short, prominent headings.
- Arcade accent: licensed pixel face for tiny noncritical titles only; no 8px body text.
- Body: 16px base; small metadata >= 12px with sufficient contrast; line-height 1.45–1.6.
- Heading mobile scale: ~28–36px hero, ~22–28px screen title, ~18–20px section title, subject to responsive tests.
- Fonts are not included in this pack; never distribute proprietary font files.

## Layout and spacing
- Design reference: 390px mobile width, responsive to 320px. Desktop max content width ~1200px but rich scenes can extend edge-to-edge.
- Safe-area-aware header and fixed bottom nav; avoid overlays covering CTA.
- 4px base spacing scale. Rounded buttons/chips (999px), cards 16–24px radius, paper panels slight irregular border/texture if accessible.
- Main route content must work without heavy art; decorative layers should be `aria-hidden` and `pointer-events:none` unless deliberately interactive.
- Separate screen text/buttons in DOM from illustration background.

## Components to build
`SiteHeader`, `MobileBottomNav`, `WorldScene`, `RoomPortal`, `PrimaryCTA`, `PaperPanel`, `FloatingSparkle`, `EnvelopeTile`, `CollectibleReveal`, `ResultPostcard`, `SiteFooter`, `AudioToggle`, `ReducedMotionProvider`, `LoadingFallback`, `FriendlyError`, `OceanCanvas`, `OceanAction`, `OceanCounter`, `OceanSouvenir`.

## Motion grammar
| Level | Examples | Guidance |
|---|---|---|
| Ambient | flowers sway, stars twinkle | subtle, paused offscreen, reduced-motion off |
| Feedback | button press, envelope hover/tap | immediate (~100–250ms) |
| Reward | gacha reveal, door opening, ocean star ascent | ~500–1800ms, skippable |

Avoid mandatory waits. Honor `prefers-reduced-motion`; provide explicit reduced-motion setting if useful. No autoplay audio. Sound effects must be original/licensed and user-initiated.

## Home layout
1. Compact brand header / sound toggle if included / menu.
2. Hero `A little magic found you.` over an illustrated door (independent text layer).
3. Strong CTA `Enter our little universe` first visit; `Continue exploring` returning.
4. Magical Village scene: four labeled scenic destinations with independently positioned accessible link hit areas.
5. Featured Purple Ocean CTA + quick shortcut of the day (song/fortune).
6. Footer / unofficial fan project disclaimer.

## Ocean layout

Ocean fills the viewport without card borders, rounded frame, outer gutters or the shared site bars. Independent artwork layers fill the background; copy, count, status and actions overlay it with contrast gradients. Keep safe-area padding on controls, not the scene. Short screens and enlarged text can scroll.
1. Back to Village, `Our Little Purple Ocean`, emotional line.
2. Large canvas or SVG/static scene with bounded particles, light-dense based on authoritative count.
3. Primary `Add my little light`; pending state uses explicit status text, no inflated number.
4. Accepted state: star animation + confirmation + `Save my memory` and return.
5. Verified total, optional day tabs, explanation `Lights represent accepted contributions, not verified unique people`.
6. Error / duplicate / view-only states, all usable and friendly.

Current refinement: `Our Purple Ocean` and one story line form the small upper zone. Illustration occupies its own flexible zone; `N lights`, a 44px information button, a short state line and primary action sit below the figures. Legal/privacy and placeholder disclosure are available through the count dialog and dedicated pages. Ready state has no invitation paragraph or footer. Desktop and mobile artwork anchors are tuned independently. Shared density, whale line/glitter, cloud/horizon light, haze and figure rims interpolate independently across the 0/3/50/500/5000 milestones.

## Art placeholders and replacement
- Default fallback visual uses simple original gradient/SVG components in `/public/placeholders`.
- Scenes load art from a manifest using stable semantic IDs: `home.sky`, `home.shop`, `home.foreground`, `ocean.sky`, `ocean.waves`, `ocean.glow`, `ocean.lightParticle`.
- If art missing: render usable CSS/SVG fallback. Final art should not contain core text, QR code, CTA, interactive targets, or logos that need translation.
- Full art specifications in `docs/09-ASSETS.md`.

## Sharing templates
- Instagram Story export 1080×1920, safe margins; no unsupported social claims.
- Export may use Canvas or SVG-to-PNG client-side; support file download fallback and descriptive alt/copy text.
- Footer on export: `Unofficial ARMY-made keepsake · Bangkok 2026`.
