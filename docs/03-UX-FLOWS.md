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

Mobile: persistent bottom navigation `Home, Ocean, Arcade, Magic, Saved`; Garden linked from hub. Desktop: accessible top navigation. `Back` returns to previous meaningful page; deep links don't dead-end. Header includes logo, sound toggle if any audio, menu. Ocean is an immersive exception: full-viewport artwork with overlaid Back to Village, Keep Exploring and About/Privacy links replaces the shared bars. Scene art is never only navigation control.

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
