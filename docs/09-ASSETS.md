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

## Ocean reference implementation

The owner selected Dreamy whale galaxy on 2026-11-14. `ocean.sky` and `ocean.skyDesktop` point to optimized generated draft skies; text and controls remain semantic DOM. Named SVG layers live in `src/components/ocean/scene.tsx`; transparent illustrations are placed independently while contribution stars and feedback remain procedural. These are placeholders for later original illustration, not crops of the supplied reference boards. No embedded logo, font, recording or reference image is distributed.

## Generated raster review set — v1

Ten AI-generated PNG masters are saved in `assets/ocean/generated-v1/`: mobile and desktop skies, main whale, left/right/foreground clouds, seven-person crowd, distant stage/horizon, crescent moon and contribution light. They were generated with the built-in image_gen tool in the selected Dreamy whale galaxy direction. Full prompts, actual pixel dimensions, byte sizes and alpha ranges are recorded in that folder’s `manifest.json`. All PNGs decoded successfully; the eight overlays have verified transparency.

These remain review drafts, not final approved artwork. Source masters and downloadable ZIP output are excluded from deployment uploads.

### Integrated web derivatives — 2026-11-14

`public/art/ocean/v1/` contains ten WebP derivatives totaling **189,876 bytes** (all variants combined). Generated with installed Sharp: resize widths mobile sky 720, desktop sky 1440, whale/crowd/foreground 900, side clouds 600, stage 1000, moon 180, contribution light 96; WebP quality 72, alphaQuality 75, effort 6. Original PNG masters remain unchanged. CSS selects the mobile or desktop sky at 700px; named manifest entries supply the eight transparent layers. No image optimization service or new dependency is required.

The scene and 1080×1920 keepsake share these assets. The sky’s faint decorative stars and illustration details are atmosphere, separate from confirmed contribution stars. A missing illustration leaves the CSS background, semantic controls, status and bounded SVG lights usable; export reports image-loading failure and supports retry. The page and keepsake identify the artwork as an AI-generated draft. Automated checks cover file existence/400KB total budget, export dimensions, image failure/retry, count honesty and mobile layout; actual-device download checks and final art approval remain pending.
