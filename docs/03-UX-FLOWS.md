# UX FLOWS — Architecture and precise interactions

## Site navigation

```text
Physical freebie QR /c/:family/:variant → matching reveal → reward → Enter Boraverse
                                                     ↘ skip to village
Root / → first-time optional door welcome → / (Village hub)
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

1. **Arrive:** one welcoming sentence, a softly lit door and Open the door. Step straight inside skips the short transition. Returning from a feature always returns to the interior; visitors do not repeat the entrance. Direct feature/QR entry should bypass it. The existing `/c/*` URLs and approved destinations remain intact.
2. **Enter the room:** a warm interior with a small number of clearly labeled objects. Letters are the emotional center; a mirror, writing desk and message jar offer other gentle discoveries. No forced mood questionnaire or required sequence. Object artwork and accessible controls remain separate. A plain, labeled choice list is the fallback if art fails.
3. **Little Letters:** choose a descriptively named envelope → unfold → read original comforting words → keep/download or choose another → return to room. The study uses three samples; the existing seven letters can be retained in implementation. No suggestion that these are private messages written by BTS.
4. **Fortune Mirror:** view a card back → deliberately turn it → receive a symbolic, playful reflection → keep/download or draw another → return. No rarity, score, prediction guarantee or time pressure. Longer reflection copy is future content review, not approved text.
5. **Dear Bangtan (new, proposed):** private writing corner → type → fold and read → edit or explicitly keep/download → return. The prototype stores text in memory only and preserves the draft while exploring. No delivery to BTS, account, server upload or public posting. Plain text must remain plain text when displayed/exported; do not put it in URLs or analytics. Production draft storage/persistence needs a deliberate UX decision and truthful failure feedback before implementation.
6. **Dear ARMY (new, proposed):** pick a slip from a kindness jar → read a short curated original encouragement → keep/download or pick another → return. This is curated content, not a public user message exchange. Little Letters can provide longer notes; jar messages should be brief/shareable so the two features earn distinct roles. If content stays identical, merge these experiences rather than duplicating them.
7. **Carry a moment away:** keep on device and download within the feature, with access from My Keepsakes; show saved only after storage succeeds, image-ready only after encoding succeeds. Preserve existing no-login/local-storage behavior. Download/open-image fallback, storage-denied/full, failed export and retry remain first-class states. Keeping is optional; a visitor can return to the shop without saving.

### Composition and behavior

Mobile: compact Back/brand header, one focused object or reading surface, reachable action below it, safe-area-aware navigation. The room's objects can form a readable two-column arrangement; reading/writing gets one comfortable column. Desktop: use the extra width for the interior and its labeled objects; keep the paper reading measure narrow. A website should feel inhabitable even with simple replaceable drawings; a flattened poster must not own hit targets, copy or navigation.

Proposed motion: door opens ~400 ms, envelope unfolds/card turns ~300–500 ms. Every sequence is skippable or immediate under reduced motion, with no autoplay audio or looping effects required. Keyboard focus must move to the new screen's heading/action and return to the originating room choice; browser Back must follow the journey rather than discard a draft. Keep text readable with larger fonts, a short viewport and artwork failure.

### Study limits and implementation handoff

The interactive study demonstrates entrance/skip, room choices, three sample letters, a cycling fortune/messaging sample, private writing/folding/editing, and an in-memory moments tray. It explicitly labels preview-only saving and clearing on close. It does not write real keepsakes, persist drafts, export an image, alter routes or contact a server. Its selected sample sequence is deterministic for review, not a production random/daily claim. Visual shapes and palette are compositional stand-ins, not final illustrations or a locked style.

Implement incrementally: first entrance/interior + existing letter/fortune rituals; then matching keepsake export and navigation/failure states; then the proposed private-writing/curated-jar features if their roles are retained. Preserve the backend, approved QR reveals and paused Ocean UI. Test mobile 320/375/390/430 and desktop 1440, keyboard/back/focus, reduced motion, empty writing, HTML-like input as text, draft preservation, blocked/full storage and export retries.

Flow-study validation: `node design/check-magic-shop-flow.mjs` passed eight complete journeys (Chromium/WebKit × 320/390/736/1440px), plus normal-motion entrance/skip in both engines. Checks cover all four room choices, keyboard choice/focus return, empty writing, draft preservation, folding/editing, markup rendered as plain text, preview-only keeping, and the moments tray, with zero page errors/network requests. Lint, TypeScript, all 24 unit tests and production build passed. Representative entrance/interior/letter screenshots and `checks.json` are in ignored `out/magic-shop-flow/`; reviewed at phone sizes. Production feature implementation, real persistent saves/exports, final illustration and physical-device QA remain outside this design study. The live app is unchanged.
