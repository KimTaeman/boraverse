# ART PLACEHOLDERS & REPLACEMENT PIPELINE

The user will create original illustrations later. Until then the site MUST remain delightful and usable with **clearly designated placeholders**. No generated illustration is presumed final.

## Core rule: structural independence
- Layout, headings, accessible button hit targets, and animations are not baked into a giant flattened scene image.
- Use semantic DOM for links/controls plus decorative SVG/WebP/AVIF layers behind them.
- Keep a stable **asset manifest** mapping semantic IDs to files. Swapping files should not require rewriting page structure or state logic.
- Never auto-generate misleading official BTS logos/art or represent a placeholder as commissioned final art.

## Proposed manifest
```ts
type ArtAsset = { src: string; alt?: string; width: number; height: number; role: 'decorative' | 'content'; status: 'placeholder' | 'final' };
const art: Record<string, ArtAsset> = {
  'home.sky': { src:'/placeholders/home-scene.svg', width:1200, height:900, role:'decorative', status:'placeholder' },
  'ocean.sky': { src:'/placeholders/ocean-scene.svg', width:1200, height:900, role:'decorative', status:'placeholder' }
};
```

## Illustration deliverable brief for future artist
### Home: layered village
- Desktop visual reference 16:9 landscape and mobile 9:16 portrait adaptations. Don't rely on cropping the single desktop scene for phone.
- Layers: background twilight sky, stars/moon, hills, Magic Shop building/portal, Arcade building, coastline, foreground flowers, optional mascots.
- Provide transparent layers where relevant; plan clickable overlay positions semantically rather than exact raster pixels.
- No embedded labels/CTAs in art so English/Thai can swap cleanly.

### Ocean: layered cinematic sky
- Background night sky/gradient, atmospheric haze, coastline/waves foreground, tiny purple points of light, glow overlay.
- Lights generated in code, not a prebaked count that visually conflicts with real data.
- Provide minimal static fallback for reduced motion and failed canvas.

### Future environments
- Arcade: pastel machine and machines layered; Magic Shop: envelope/shelves/letter desk; Garden: winter/spring transitions.

## Performance budget (targets, not guarantees)
- Initial mobile critical art: aim <= ~400KB compressed combined, with placeholders even smaller.
- Lazy-load offscreen scenes and alternate room assets; support low-memory Android browsers.
- Supply WebP/AVIF where practical, SVG for clean vector line-art, PNG for downloadable exports only when needed.
- No embedded high-resolution animation spritesheet shipped site-wide by default.

## Included files
- `/public/placeholders/home-scene.svg` and `/public/placeholders/ocean-scene.svg` are simple generic gradients/shapes for visual stand-in; **not approved final art**.

## Replacement verification
1. Check origin/license and integrity of delivered art.
2. Map to manifest with stable IDs; do not rename app routes.
3. Test responsive crop at 320px/390px/desktop; maintain visible button labels.
4. Test contrast and overlays, loading fallback, reduced motion.
5. Confirm file sizes and re-run build/performance checks.

## Current Ocean placeholders — Celestial Storybook

The owner supplied `PURPLE-OCEAN-IMPLEMENTATION-BRIEF.md` after Fix 1A. The full-bleed wrapper is preserved. Current manifest slots point to original SVG placeholders in `public/assets/ocean/`; sky variants, feathered clouds, crescent, soft whale constellation, distant horizon and seven generic back-view figures share a restrained indigo/lavender palette. No raster whale or reference-board imagery is used by the scene or keepsake. See `public/assets/ocean/README.md` for artboards, safe zones, landing anchor and replacement workflow.

Far stars and aggregate shared lights are distinct. Smooth interpolation between the owner’s 0/3/50/500/5000 milestones independently controls shared-star density, whale line glow, masked interior stardust, cloud illumination, horizon, haze, ambient dust and figure rim light. Shared lights are deterministic and bounded (150 visible on mobile, 220 desktop); they are density, not individually mapped contributors. The count text stays literal and server-authoritative. Transient charge/flight/glitter/burst are procedural Canvas, with a CSS constellation shimmer; neither count nor movement is baked into art.

The 1080×1920 PNG keepsake loads the same SVG slots on demand. Broken artwork leaves semantic controls, a CSS atmosphere and SVG star field usable; export has an explicit error/retry path. All artwork remains placeholder pending the owner's final illustrations and rights approval.

## Previous generated raster review set — v1 (archived)

PNG masters in `assets/ocean/generated-v1/`, their prompts/metadata and earlier WebP derivatives in `public/art/ocean/v1/` are retained for review history. The active manifest no longer references them. Source masters and downloadable ZIP output stay excluded from deployment uploads. No further image-generation dependency or service was added.

## Cinematic refinement replacement notes

`ocean.whaleBody` adds a white alpha silhouette matching the constellation’s 900×450 artboard. It masks the independently controlled stardust/fill and must be replaced alongside the whale if the final silhouette changes. It contains no counts. The distant horizon now uses soft beams instead of a rectangular stage symbol. An artwork-only flow zone clips/fades scenery before the count/control row; no scene object or figure can obscure the number. Final artist illustrations remain pending; the visible placeholder label has moved to About as requested by the owner.

## Magic Shop replaceable slots — D018

`art.magic.sky` and `art.magic.interior` point to original lightweight SVGs in `public/placeholders/magic/`. The Server Component passes named CSS properties to the scene. Door, envelope, mirror, stationery, flowers and jar are CSS stand-ins independent of copy and semantic buttons. Replace backgrounds through `src/content/art.ts`; replace each object illustration in its existing named component/style without changing navigation coordinates. Essential labels and shared text never live inside artwork. Final exterior/interior illustrations, individual object art, stationery embellishments, palette and typography remain open for later owner review. No reference-board artwork or song lyrics were copied into production assets.

## Home/Arcade flow-study slots — D020

The study adds only original CSS stand-ins, no raster generation or borrowed reference artwork. Named layers cover `home-village`, `home-magic-shop`, `home-arcade`, `home-ocean-path`, `arcade-gacha`, `arcade-jukebox`, `arcade-capsule` and `arcade-reward`. They are review labels, not new production manifest entries. Final implementation should map the approved illustrations to named manifest slots and retain semantic controls separately.

Artist work remains provisional: desktop and mobile village compositions, sky/hills/coastline/foreground layers, building exteriors, arcade interior atmosphere, gacha shell/handle/capsule stages, jukebox/record, and final reward/card illustrations. Generic keepsake samples do not authorize member portraits, mascots or official logos. No numbers or essential copy should be baked into these images.
