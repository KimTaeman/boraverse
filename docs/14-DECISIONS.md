# DECISIONS — What's locked vs pending

**Prepared 2026-11-12.** Update this document whenever the user changes an agreed requirement. Do not convert a proposal into a supposed user decision without confirmation.

## Locked by user or explicitly settled in discussion
| ID | Choice |
|---|---|
| D001 | Project working name: The Little Boraverse |
| D002 | Overall experience: **Hybrid Universe** (magical illustrated village, scrapbook, retro arcade) |
| D003 | All **2,000** physical freebies carry website QR |
| D004 | Eight families, ~250 each, as detailed in `07-QR-AND-PRINT.md` |
| D005 | Existing ~100 A4 215gsm glossy, 100 A4 150gsm, 600 65×90mm sleeves; 80–100gsm paper already owned |
| D006 | No more materials required in the present plan; printer Brother MFC-T920DW; 215gsm tested by user |
| D007 | Pocket Kit removed from regular paper family; **Magic Shop Invitation** replaces it |
| D008 | Art style/content and physical sleeve-fit testing postponed; owner will create original illustrations later |
| D009 | **Next.js App Router** preferred over plain React/Vite |
| D010 | Homepage and Purple Ocean designed/implemented first |
| D011 | QR entry should be friendly, cute, not scary technical warnings |

## Architecture recommendations adopted for pack (implementation proposals, not provisioned)
| ID | Proposal |
|---|---|
| P001 | Use Supabase PostgreSQL for Ocean-only shared state through Next.js server routes |
| P002 | Vercel Hobby as initial deployment if project complies with noncommercial-use rules |
| P003 | Supabase transaction pooler + server-only PostgreSQL access, minimal SQL schema; **proposed:** use node-postgres without pipelining because Supabase documents a Postgres.js transaction-pooler incompatibility |
| P004 | No login/Auth/Realtime/Storage or public free-text wall for first launch |
| P005 | Ocean 1 accepted contribution per browser token, not guaranteed unique-person count |
| P006 | Site initially English, Thai-ready; no autoplay audio |
| P007 | Design palette/tokens in `04-DESIGN-SYSTEM.md` are candidates, not final brand art |
| P008 | P0 feature set and roadmap target Dec 3, 2026 |

## Open implementation decisions / gates
- Actual domain and deployed host URL; final platform account/region.
- Number of 80–100gsm sheets; physical trim margins, printer feed/cutting QA.
- Sleeve fit: 63×88 Pokémon inside nominal 65×90mm sleeve; fallback 59×86 if too tight.
- Final illustration, fonts, member-inspired mascot artwork and approved source rights.
- Specific variants and per-variant print run counts.
- Final English/Thai content and official song links.
- Exact throttle thresholds and data retention after legal/platform/privacy review.
- Whether Memory Garden launches as P1 or remains a polished coming-soon portal on launch day.

## Change control
Document any changed locked item with date and reason; update relevant QR/print, API, design and test docs in same pull request.
