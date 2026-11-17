# QR REGISTRY & PHYSICAL FREEBIES — Settled production plan

**Locked from conversation:** 2,000 freebies (8 families × 250), all have website QR. Printing available free through university Brother MFC-T920DW. Paper sizing still requires final physical mock test; owner will return to artwork and sleeve-fit later.

## Materials owned / purchased
- Approx. **100 A4 sheets of 215gsm one-sided glossy photo paper** (owner already tested printing photo on it).
- **100 A4 sheets of 150gsm** card paper bought.
- **600 open-end transparent sleeves** about **65×90mm**, 50 micron, bought.
- **80–100gsm** paper already owned but **exact number not established**.
- Cutting and storage tools already owned; no additional shopping assumed.

## Exact planned family allocation
| Family key | Physical design | Paper | Card size | Distribution | Yield per A4 | Minimum A4 sheets | Wrap? |
|---|---|---|---|---:|---:|---:|---|
| `pokemon` | Pokémon-inspired BTS battle cards | 215gsm glossy | 63×88mm | 250 | 9 | 28 (252 made) | yes |
| `tarot` | Mini oracle/tarot cards | 215gsm glossy | 55×85mm | 250 | 10 | 25 | yes |
| `license` | ARMY licenses + certificates | 150gsm | 45×65mm | 250 | 16 | 16 (256 made) | no |
| `meme` | Bangtan meme cards | 150gsm | 45×65mm | 250 | 16 | 16 (256 made) | no |
| `quote` | Quote/letter cards | 150gsm | 45×65mm | 250 | 16 | 16 (256 made) | no |
| `invitation` | Little Magic Shop invitation (replaced pocket kit) | 150gsm | 45×65mm | 250 | 16 | 16 (256 made) | no |
| `banknote` | Borabucks novelty banknotes | 80–100gsm | 90×50mm | 250 | 10 | 25 | no |
| `receipt` | Funny receipts/invoices | 80–100gsm | 90×50mm | 250 | 10 | 25 | no |
| **TOTAL** | | | | **2,000** | | **167** | **500 sleeves** |

**Minimum printing use:** 53 A4 glossy, 64 A4 150gsm, **50 A4 thin paper required**. Remaining before test/reprint: 47 glossy and 36 150gsm; thin quantity depends on actual stock. Planned sheets yield 2,026 cut pieces: 26 extras for trimming/replacements. 100 sleeves remain unused. Never claim these yields without test/trim margin verification.

## Print geometry notes
- 63×88mm: 3×3 per A4; sleeve 65×90 is a tight nominal fit, test internal usable width and card thickness. If too tight, possible fallback 59×86mm, preserving 9 per A4.
- 55×85mm tarot: rotate 90° as needed to lay 2 columns × 5 rows (10 per sheet).
- 45×65mm regular: 4 columns × 4 rows (16 per sheet).
- 90×50mm notes: 2 columns × 5 rows (10 per sheet).
- Allow real printer margins / cutting gaps; exact print template will be validated later. Trim precision matters for standard Pokémon-sized cards.
- QR on **printed front/one side** for every item; avoid duplex alignment reliance. For small 45×65 cards, reserve ~20mm–25mm QR region where possible, with quiet zone and sufficient contrast. If QR layout conflicts, use a shorter target path and test actual print—never reduce below reliable scan threshold by guess.
- Standard Pokémon cards are 63×88mm. No need to imitate official Pokemon branding/logo; use original inspired character art.

## QR URL contract
- Canonical base `NEXT_PUBLIC_SITE_URL` configured when actual HTTPS site is live; placeholder domain must NEVER be mass printed.
- Route example: `https://YOUR_FINAL_DOMAIN/c/pokemon/01`.
- Each **artwork variant** has one QR URL; do NOT generate 2,000 per-copy unique URLs.
- Route patterns validated from static/typed registry; unknown variant returns friendly page.
- Every card should also present a human-readable short domain/path if legible and a tiny label `Free ARMY-made experience · No login`.
- Entry behaviors: Pokémon→matching gacha; Tarot→matching fortune; License→certificate; Meme→matching joke/minigame; Quote→letter; Invitation→village welcome; Banknote→arcade mystery reward; Receipt→Ocean / funny message. Every route offers clear entry to the full site.
- Keep URL IDs stable after printing. Redirect deprecated routes; never delete working paths silently.

## Content variant plan (NOT locked counts)
- Pokémon: 7 member designs and optional OT7 variant.
- Tarot: 7 symbolic themes.
- Licenses, meme, quote and others: 4–8 variants each, potentially unequal counts by availability.
- The first eight message bodies, titles and module destinations are approved for website preview (D014/D015). Final artwork and print details remain pending; all references must be vetted before print.

## Final printed QR release checklist
1. Actual HTTPS domain chosen and controlled.
2. Test direct route, trailing slash behavior, fallback route and redirect.
3. Generate print-quality QR with correct quiet zone (ordinary QR more universal than Spotify-specific scanner code).
4. Physically print on each stock, scan on multiple Android/iOS phones under direct light and glare.
5. Cut and fit one 63×88 card to open-end 65×90 sleeve. Test easy insertion/removal.
6. Re-test ALL approved variant URLs from a machine-readable manifest; archive final registry/QR assets.
7. Freeze IDs, batch export print sheets, spot-check each family and date before 2,000 run.

## Automated route audit (does not approve printing)

After approving actual registry variants and choosing the canonical HTTPS host, run:

```sh
npm run qr:check -- https://little-boraverse.vercel.app
```

The existing deployment URL above is a candidate, not an approved printed destination. Substitute the actual owner-approved origin if it changes. The checker rejects example/local origins, IP literals, URL credentials/paths/queries and other Vercel deployment hosts. Custom-domain ownership and whether a custom domain points to staging still require owner verification.

The command reads the real registry, includes only approved variants, validates stable IDs/duplicates/copy/internal destinations, and prints a JSON route report. For each approved variant it checks the canonical and trailing-slash URLs, exact reveal heading/message, exploration link, village link and destination response. A friendly HTTP-200 fallback cannot pass as an approved reveal. Missing approved content in any of the eight families, a browser failure or a failed route exits nonzero. The present registry contains eight approved website previews (D015). The checker probes them on the supplied host; this does not approve artwork, freeze the printed domain or clear physical print gates.

Use Node 22.18+ or 24 (native TypeScript stripping) and the installed Playwright Chromium. For an archiveable JSON report, use `npm run --silent qr:check -- <approved-https-origin>` and save stdout to a local file; check the command's exit status. No environment secrets, contribution writes, QR images, print sheets, domain freeze or approval flags are created. A passing audit verifies web routes only; original-art/copy approval, physical-device scans, glare and sleeve-fit checks still apply. Repeat after deploying the approved registry so the deployed copy matches the local manifest.

## DJ Spin QR experience clarification — D021

The owner wants the random-song physical QR to deliver a song directly in Little Jukebox: scan → Jukebox song result, with optional mood-based picking afterward. QR visitors should not have to traverse Home/Arcade or press multiple reveal controls first. A preconfigured song pool/filter is a possibility; exact presets and which existing/new family or variant carries this behavior are not yet selected. Automatic result generation must not autoplay audio or automatically open YouTube.

This is an experience requirement for future implementation. The eight D015-approved website-preview destinations and IDs remain unchanged. Do not silently remap an existing family, add per-copy tracking codes, freeze a printed URL or generate print assets from this clarification. Home/Arcade redesign is paused pending owner reference images/links.
