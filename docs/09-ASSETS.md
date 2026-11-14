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

The owner selected Dreamy whale galaxy on 2026-11-14. `ocean.sky` still points to the lightweight original `/placeholders/ocean-scene.svg`; text and controls remain semantic DOM. Named procedural SVG layers live in `src/components/ocean/scene.tsx`; the original whale outline is shared with the canvas keepsake. These are placeholders for later original illustration, not crops of the supplied reference boards. No embedded logo, font, recording or reference image is distributed.
