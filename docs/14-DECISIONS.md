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
| D012 | 2026-11-13: Owner approved initial Vercel deployment with placeholder art and Ocean writes disabled. Deployed to https://little-boraverse.vercel.app; printed QR destination remains unfrozen. |
| D013 | 2026-11-14: Owner approved Ocean limits of 60 attempts/minute globally, 5/token/minute, and a Vercel edge rule of 120 POSTs/IP/minute for `/api/ocean/contribute` returning 429. Keep writes disabled pending a separate controlled live-write check. Rate buckets become cleanup-eligible after one day and are removed opportunistically; review cleanup before reopening/retiring an inactive site. Retain contributions until retirement, then review export/deletion. Stay within Hobby included capability; paid changes require separate approval. |
| D014 | 2026-11-16: Owner approved the eight English QR message bodies presented for Pokémon-inspired, tarot, license, meme, quote, invitation, banknote and receipt families. Exact wording is recorded in `08-CONTENT-AND-LORE.md` and the existing `01` registry rows. This approves message wording only; separate titles, route/destination freeze, final artwork/source rights, per-variant quantities, public reveal, printed domain and printing remain pending. Keep every registry `approved` flag false until its remaining review gates pass. |
| D015 | 2026-11-16: Owner approved all eight existing `01` titles and listed module destinations for public website previews with placeholders, using the D014-approved messages. Enable these eight registry reveals (`approved: true`) and publish the tested preview website. This supersedes D014’s remaining title/public-reveal gate for this set only. Final illustration/source-rights approval, printed canonical domain, physical checks, quantities and printing remain pending; Ocean writes remain disabled and Ocean UI work stays paused. |
| D016 | 2026-11-16: Owner selected the Magic Shop emotional journey: arrive tired or uncertain, feel welcomed and understood, leave with a little encouragement. A softly glowing entrance leads to a warm interior with lamps, paper, flowers and gentle celestial wonder; personal moments and self-paced discovery guide the flow. Illustration style remains open. The current task designs the flow; screen copy, interaction details and new feature implementation remain proposed. |
| D017 | 2026-11-16: Owner requested shared Magic Shop writing: Dear Bangtan collects public ARMY letters with counted agreement reactions, including participation by readers who do not write; Dear ARMY accepts messages from visitors and gives a random published message to another visitor. This supersedes the private-only Dear Bangtan and curated-only Dear ARMY assumptions for the planned feature. Drafts stay private until explicit sharing; nothing is delivered to BTS. Publishing/moderation policy was subsequently approved in D018. No public posting or shared reactions are live yet; real counts must be server-authoritative. All other public UGC remains outside scope. |
| D018 | 2026-11-16: Owner reviewed and accepted the Magic Shop journey and chose owner review before publication for both shared letters and ARMY messages. Implement the reviewed flow with explicit sharing consent, pending-only submissions, published-only browsing/random draws, server-confirmed agreement counts and safe retries. Colours, illustrations and decorative elements remain replaceable and may change later. This is source implementation approval, not final art, deployment, database rollout or enabling public writes; the separate Magic write gate defaults off. |
| D019 | 2026-11-17: Owner continued from the database handoff to publish the reviewed Magic Shop preview at the existing website address, with both `MAGIC_WRITE_ENABLED=false` and `OCEAN_WRITE_ENABLED=false`. This clears D018’s deployment gate for the reviewed write-off preview only. It does not activate public sharing/contributions, approve final colours/artwork, freeze the printed destination or clear phone/print QA. |

## Ocean UI direction — 2026-11-14

Owner selected **Dreamy whale galaxy** from the supplied reference boards (Image 3, B). Build a quiet cinematic purple sky, original luminous whale, a small crowd below, and a light rising only after server acceptance. Generated illustrations are integrated as replaceable draft layers; final art and rights approval are still pending. Counts/density remain server-authoritative and bounded, and reduced motion skips the ascent. No official logos or flattened storyboard imagery are included in the implementation.

Owner refinement: `/ocean` is a full-bleed, minimum-full-viewport environment. Sky, clouds, particles and glow reach the viewport edges; title, count, status and actions overlay the scene. Replace the shared header/footer/bottom bar on this route with an overlaid village link and compact project/privacy credits. Allow scrolling on short screens and enlarged text rather than clipping controls.

## Celestial Storybook refinement — 2026-11-14

Owner supplied `PURPLE-OCEAN-IMPLEMENTATION-BRIEF.md` and locked the next refinement: preserve Fix 1A unchanged; replace the realistic raster whale and scene illustrations with replaceable SVG/CSS celestial storybook placeholders. Whale opacity, horizon/cloud lighting and deterministic shared-star density follow a saturating logarithmic curve from real confirmed totals (reference 5000), rather than one rendered star per row. Maximum visible shared stars: 150 mobile / 220 desktop; zero shared stars at total zero, with faint decorative constellation and far stars. A 450ms minimum charge precedes a confirmed-only 1500ms Bézier ascent with emitted glitter, 900ms burst/shimmer/world response and success. Reduced motion skips the flight. Existing API, private schema, idempotency, limits and write kill-switch remain in place; no migration or new dependency.

## Cinematic hierarchy and progression — 2026-11-15

Owner requested six linked UI refinement steps. Preserve full bleed; organize a small title area, dominant sky/whale/figure zone, and compact controls beneath it. Display `Our Purple Ocean`, the story line, literal `N lights`, primary action, subtle brand and Back. Remove invitations, explanation paragraphs, placeholder labels and legal footer from the scene; preserve that information in a keyboard-accessible count-information dialog and About/Privacy pages. Keep the primary button visible but disabled when the existing kill-switch blocks writes.

Independent visual parameters interpolate smoothly between milestones 0/3/50/500/5000: shared density, whale lines, whale stardust fill, cloud light, horizon, haze, ambient dust and character rim lighting. Rendered shared-light targets are 0/5/32/110/220 (mobile still caps visible density at 150); these are artistic representation, not a fake numeric total or individual-person map. Retain existing flight/state infrastructure; strengthen nearby-star/horizon response only. After verified success use `Your light is shining ♡`, `You made our sky a little brighter.`, and prominent Save My Moment. No backend, limits, write availability or paid-service decision changes.

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
- Additional English content, Thai translations and official song selections; the eight QR messages/titles/destinations are approved for website preview in D014/D015.
- Verify approved D013 limits and retention in operation before enabling writes; review provider metadata/log retention separately.
- Whether Memory Garden launches as P1 or remains a polished coming-soon portal on launch day.

## Change control
Document any changed locked item with date and reason; update relevant QR/print, API, design and test docs in same pull request.

## Magic Shop database rollout — 2026-11-16

After the owner continued from the source handoff, migration `20261116133329_magic_shop.sql` was applied to the existing database and recorded atomically in migration history. No new service, role, paid capability or public write setting was introduced. Controlled verification uses synthetic pending-only records and exact-record cleanup; no sample content is published. D018's owner-review policy and replaceable appearance remain unchanged. Public deployment/activation, provider/retention readiness and physical-device/print checks are still pending.
