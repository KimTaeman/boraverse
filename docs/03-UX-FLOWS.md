# UX FLOWS — Architecture and precise interactions

## Site navigation

```text
Physical freebie QR /c/:family/:variant → matching reveal → reward → Enter Boraverse
                                                     ↘ skip to village
Root / → Village hub immediately (D020; no entrance prerequisite)
Village ↔ /ocean ↔ share souvenir
       ↔ /arcade → /arcade/gacha | /arcade/music
       ↔ /magic-shop → /magic-shop/fortune | /magic-shop/letters
       ↔ /keepsakes
       ↔ /garden [P1]
```

Mobile: persistent bottom navigation `Home, Ocean, Arcade, Magic, Saved`; Garden linked from hub. Desktop: accessible top navigation. `Back` returns to previous meaningful page; deep links don't dead-end. Header includes logo, sound toggle if any audio, menu. Ocean is an immersive exception: full-viewport artwork with Back, a count-information button and compact contribution controls replaces the shared bars. About/Privacy links live in that information dialog; Keep Exploring is secondary after contribution. Scene art is never only navigation control.

## Journey 1 — 15-second QR visitor
1. Scan printed QR on Pokémon card.
2. A lightweight `/c/pokemon/<variant>` page paints immediately with meaningful title and fallback card even before rich image loads.
3. Optional 0.4–0.8s glow/flip animation; no countdown.
4. Tap `Reveal my surprise` to receive funny ability/fortune/song; no login/cookies prompt.
5. CTA `Save result` or `Visit our little world`. Skip intro available.

**Definition of good:** The page communicates what it is and provides a working action within a few seconds on midrange phones; avoid busy loaders on poor networks.

## Journey 2 — Home → Ocean
1. Land on village hero. Primary action `Light up our ocean` visible without deep scroll.
2. Navigate to `/ocean`. Ocean canvas or static fallback and inviting message displayed.
3. Initial state depends on local participation token and server status.
4. Tap. Button disables while request pending. Visual feedback says `Sending your little light…` but does not increase confirmed count.
5. Server returns `accepted` with authoritative count OR `already_contributed` OR explicit error.
6. On `accepted`, finish the charge, send the light along a curved glitter-emitting ascent, then burst/shimmer the constellation and ease the environment to the confirmed total. Show success/keepsake after arrival; skip/reduced motion gives immediate verified acknowledgement.
7. On `already_contributed`, show previous light without increment.
8. On network/server error, show retry; preserve idempotency key for safe retries.

## Journey 3 — Magic Shop
1. Enter room; see seven named envelopes and a tarot mirror.
2. Choose one; animation is skippable. Original letter text appears, scrollable at readable font sizes.
3. Save as local keepsake, export postcard, select another letter, return hub.
4. Visitors who are not deeply familiar with BTS can request explanation for references.

## Journey 4 — Arcade
1. Enter pastel arcade with two clear launch games: Gacha and DJ Spin.
2. Gacha: tap machine → client picks among seven approved outcomes → optional 1–2s reveal → save/share/retry.
3. DJ: choose mood or surprise → spin → shows a verified song title and an outbound official-service link. External listening site opens only on user intent.
4. Easy return from any game; no paid, earned, or scarce coins for basic actions.

## Journey 5 — Return visit
- Returning visitor bypasses opening door if preference stored locally, but can replay welcome from Settings/About.
- Saved results are shown from local storage. Explain if storage reset or browser differs.
- Ocean shows `Already contributed` if backend recognizes visitor token; do not rely solely on localStorage as source of truth.

## Content and layout states for every feature
Design **loading**, **empty**, **ready**, **pending**, **success**, **duplicate**, **offline/failure**, **invalid route**, **reduced-motion**, **small screen**, and **keyboard-only** states. Every error includes a friendly next action and is never styled as malware/system infection.

## Mobile dimensions
- Reference design viewport: 390×844 CSS pixels; test widths 320, 360, 375, 390, 430.
- Bottom nav respects safe-area inset; minimum tap target ~44×44 CSS px (or better).
- Use responsive typography, not images containing essential text.
- Important buttons visible before optional long scroll on QR and Ocean pages.
- Don't use hover-only interactions.

## Content tone
Warm, fun, sincere, slightly whimsical. BTS jokes are gentle and affectionate; no invasive parasocial claims or deceptive `official` presentation. The pop-culture humor and the heartfelt letter should feel like they're made by the same caring fan.

## Magic Shop flow design — 2026-11-16

D016 locks the emotional intention, not a final illustration style. The clickable study is `design/magic-shop-flow.html`; it is a design-only, in-memory preview. The live Next.js page is unchanged. Existing letters/fortunes supply sample text, still provisional outside the separately approved QR copy. All screen copy, feature naming, exact motion and route proposals below are proposed.

### Entrance → room → personal moment → keepsake → explore or leave

1. **Arrive:** one welcoming sentence, a softly lit door and one proposed CTA, Come on in ♡. Activating it swings the door open, brings the viewpoint through warm light, then reveals the interior (~1 second). There is no competing skip/enter button; reduced motion enters immediately. Returning from a feature always returns to the interior; visitors do not repeat the entrance. Direct feature/QR entry should bypass it. The existing `/c/*` URLs and approved destinations remain intact.
2. **Enter the room:** a warm interior with a small number of clearly labeled objects. Letters are the emotional center; a mirror, writing desk and message jar offer other gentle discoveries. No forced mood questionnaire or required sequence. Object artwork and accessible controls remain separate. A plain, labeled choice list is the fallback if art fails.
3. **Little Letters:** choose a descriptively named envelope → unfold → read original comforting words → keep/download or choose another → return to room. The study uses three samples; the existing seven letters can be retained in implementation. No suggestion that these are private messages written by BTS.
4. **Fortune Mirror:** view a card back → deliberately turn it → receive a symbolic, playful reflection → keep/download or draw another → return. No rarity, score, prediction guarantee or time pressure. Longer reflection copy is future content review, not approved text.
5. **Dear Bangtan (D017, new):** open a collection of public ARMY letters → read without writing → react with I feel this too ♡ and see the confirmed reaction count, or choose Write a letter. The collection is one place to browse all eligible letters with bounded pagination, not an unbounded page. Writing stays private until an explicit preview/consent/submission step. A letter is an ARMY expression, not a message delivered to BTS. The prototype uses three labeled sample letters and local 0/1 reaction toggles; production requires server-confirmed reaction counts and a publishing policy.
6. **Dear ARMY (D017, new):** choose Pick a message to receive a random eligible published message written by another ARMY, or Write a message to leave encouragement for others. Writing is optional. Separate drafts for each audience prevent accidentally transferring a private letter between flows. Published content, random selection, author/self/repeat handling, empty pool and submission feedback require backend work; the prototype draws from clearly labeled example messages only. A public-sharing checkbox and an explicit submission action are separate from keeping a private moment. Neither action in the study publishes anything.
7. **Carry a moment away:** keep on device and download within the feature, with access from My Keepsakes; show saved only after storage succeeds, image-ready only after encoding succeeds. Preserve existing no-login/local-storage behavior. Download/open-image fallback, storage-denied/full, failed export and retry remain first-class states. Keeping is optional; a visitor can return to the shop without saving.

### Composition and behavior

Mobile: compact Back/brand header, one focused object or reading surface, reachable action below it, safe-area-aware navigation. The room's objects can form a readable two-column arrangement; reading/writing gets one comfortable column. Desktop: use the extra width for the interior and its labeled objects; keep the paper reading measure narrow. A website should feel inhabitable even with simple replaceable drawings; a flattened poster must not own hit targets, copy or navigation.

Proposed motion: the door opens first (~550 ms), the view moves through it into warm light, and the interior settles into view (~1 second total plus a short arrival). Envelope unfolds/card turns ~300–500 ms. Entrance is immediate under reduced motion, including a preference change during entry; other optional sequences can be skipped or reduced, with no autoplay audio or looping effects required. Keyboard focus must move to the new screen's heading/action and return to the originating room choice; browser Back must follow the journey rather than discard a draft. Keep text readable with larger fonts, a short viewport and artwork failure.

### Study limits and implementation handoff

The interactive study demonstrates a single-CTA entrance (instant under reduced motion), room choices, three sample letters, a cycling fortune sample, a sample public-letter collection with preview agreement toggles, random sample ARMY messages, separate audience drafts/folding/editing/sharing consent, and an in-memory moments tray. It explicitly labels preview-only saving and clearing on close. It does not write real keepsakes, persist drafts, export an image, alter routes or contact a server. Fortunes cycle for review; ARMY samples are randomly picked without an immediate repeat. Neither samples nor preview reactions represent actual visitors or shared counts. Visual shapes and palette are compositional stand-ins, not final illustrations or a locked style.

Implement incrementally: first entrance/interior + existing letter/fortune rituals; then matching keepsake export and navigation/failure states; then the D017 shared letter/reaction and ARMY-message features after settling the publishing policy and implementing server-side controls. Preserve the backend, approved QR reveals and paused Ocean UI. Test mobile 320/375/390/430 and desktop 1440, keyboard/back/focus, reduced motion, empty writing, HTML-like input as text, draft preservation, blocked/full storage and export retries.

Flow-study validation: `node design/check-magic-shop-flow.mjs` passed eight complete journeys (Chromium/WebKit × 320/390/736/1440px), plus single-CTA animated entrance and reduced-motion switching during entry in both engines. Checks cover all four room choices, keyboard choice/focus return, empty writing, draft preservation, folding/editing, markup rendered as plain text, preview-only keeping, and the moments tray, with zero page errors/network requests. Lint, TypeScript, all 24 unit tests and production build passed. Representative entrance/interior/letter screenshots and `checks.json` are in ignored `out/magic-shop-flow/`; reviewed at phone sizes. Production feature implementation, real persistent saves/exports, final illustration and physical-device QA remain outside this design study. The live app is unchanged.

Entrance refinement: owner requested a single welcoming CTA and an animated opening/entry rather than two entry choices. The study proposes Come on in ♡ (original interface copy, not a song quotation). Existing direct-feature and returning-to-room behavior remains as described above.

Single-CTA refinement validation: all eight responsive browser journeys and animated/reduced-motion entrance checks passed in Chromium/WebKit, with zero page errors or network requests; lint and diff checks passed. Full Next.js build/typecheck/unit suites were not repeated because application code is unchanged.

Shared-flow refinement validation: all eight responsive journeys and both engines' entrance checks passed after adding collection/read/agree/unreact, separate audience drafts, random-message non-repeat, plain-text rendering, explicit public-sharing consent and a clearly simulated submission. No app/backend/database files changed, no content was published, and the production private-to-public transition remains pending the publishing-policy answer. Lint and diff checks passed; no production build was repeated for this design-only change.

## Implemented journey — D018, 2026-11-16

This supersedes the study's implementation-pending notes above. `/magic-shop` now implements the reviewed entrance, four-object interior, seven original letters, playful fortunes, separate private audience drafts, folding/editing, local keepsakes and inline PNG export. The interior uses four columns at desktop width and two on phones; reading surfaces intentionally keep a narrow measure. Colours, CSS objects and two SVG atmosphere slots remain provisional.

`?experience=room|letters|mirror|collection|jar` opens a named view directly. Back follows the journey and retains in-memory drafts; a same-tab return skips the door. Existing approved Magic QR links keep `/magic-shop` as their destination and skip the entrance on activation. Reduced motion enters immediately, including a preference change during entry.

Dear Bangtan browses published server records in bounded pages; agreement is an explicit desired state confirmed by the server, never a local pretend counter. Dear ARMY randomly draws a published message excluding the visitor's own and the immediately previous message; an empty pool is stated honestly. No sample messages enter the production feed.

Writing is private until the visitor consents and chooses Submit for review. Confirmation says pending review only after acknowledgement. An unresolved shared request retains its exact key and body for explicit retry, including after reload; it is never automatically reposted. My shared words provides withdrawal, and received public content provides reporting. Loading, empty, unavailable, offline, storage failure, encoding failure and retry retain usable navigation and private keepsakes. Public mutations are disabled until the separate Magic gate is enabled.

## Home and Arcade journey study — D020, 2026-11-17

**Review status — D021:** The owner rejected the demonstrated Home/Arcade visual designs and the homepage destination row. This study is review history, not an approved implementation handoff. Home/Arcade redesign is paused until owner references arrive. The accepted emotional roles below remain valid.

Approved emotional roles: Home begins with magical discovery and a warm welcome; Arcade offers playful nostalgia and small surprises. Ocean remains the shared, awe-filled sky; Magic Shop remains the comforting sanctuary. The broad Hybrid Universe choice stays intact. Final art style and exact interface/content choices are still open.

The clickable study is `design/home-arcade-flow.html`. It is separate from the production Next.js pages. Proposed journey:

1. **Arrive in the village:** one short welcome, immediate Purple Ocean action, a warm Magic Shop doorway, playful arcade building and a shoreline path. The buildings and their readable controls are independent. No forced door opening, onboarding, quest or required reading before choosing a destination. Memory Garden is clearly still growing.
2. **Choose a place:** Ocean and Magic Shop controls show explicit handoff views in this study, not simulated versions of their existing experiences. Arcade opens its own small room with two recognizable attractions and short descriptions.
3. **Gacha ritual:** choose the machine → deliberately turn its handle → capsule arrives → choose Open my capsule → reveal one sample keepsake → optionally keep it in the preview, draw again or return. There are no coins, paid mechanics, rarity pressure, quotas or mandatory collection goals. Leaving and returning preserves the current result until another draw is deliberately requested.
4. **Jukebox ritual:** choose a mood or surprise → activate the jukebox → a short record motion → reveal a song card → optionally follow its official listening link, keep the preview card or choose another. No embedded music/autoplay. The two existing curated songs and seven existing generic gacha outcomes are flow samples, not a final content roster or member-art decision.
5. **Carry a discovery:** the preview tray demonstrates optional keeping and revisiting results, with explicit in-memory wording. No product storage, file export, API, contribution or shared-message write is performed. Closing/reloading clears kept items. Official listening links leave only on an explicit visitor click.

Desktop uses the available width: welcome beside the village, and two arcade attractions side by side. Phones put the welcome before two smaller village portals and stack the arcade attractions. There is no fixed phone-sized preview frame. Controls wrap, art stays inside its columns, text remains readable, and there is one clear primary action per stage.

Motion is brief and user-triggered. Reduced motion skips the handle/record movement while preserving the deliberate capsule-open step. Switching the preference mid-animation settles into the real next preview stage. Leaving during a reveal preserves its selected result and cancels the pending animation. Keyboard focus follows newly available actions; duplicate keeps are prevented. Prototype navigation uses internal Back controls; it does not replace real routes, browser history, QR destinations or production keepsake behavior.

Study copy, colours, object shapes, atmosphere controls and timing are proposed. Review the flow and the meaning of gacha rewards/song choices next, then implement the agreed behavior incrementally in the existing app. Final original illustrations remain a later step.

## Home/Arcade review corrections — D021, 2026-11-17

- **Home:** do not carry forward the three-destination row arrangement. A replacement composition is not selected yet; wait for the owner's images/links.
- **Arcade:** retain the playful discovery concept as a starting point, while simplifying actions and transitions. Its current visual UI is not approved. No specific replacement gacha sequence has been selected.
- **DJ Spin / Little Jukebox via a physical QR:** scan → enter Little Jukebox directly → show a randomly selected song. Do not require entering Home/Arcade, choosing the attraction, selecting a mood or pressing another spin/reveal button before the first result. A brief non-blocking reveal may accompany the result; exact motion remains open.
- **Optional exploration:** visitors can choose a mood or another song when they want. Mood selection should not block QR delivery. A QR preset pool/filter is a proposed implementation choice, not a chosen mood/category or final content roster. Regular-entry presentation can be refined with the references.
- **Listening:** automatically selecting/showing a song does not automatically play music or open an external listening page. Listening remains an explicit visitor choice.

Only feedback is recorded now. The study, live UI, routes, approved QR registry, backend and write gates are unchanged. Resume visual design after the owner supplies references; no further design variants are requested in this pause.
