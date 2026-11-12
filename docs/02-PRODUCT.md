# PRODUCT — Functional requirements and priority

Priorities: **P0 = launch must**, **P1 = if core stable**, **P2 = later**. A visually beautiful, stable P0 is worth more than 12 unfinished games.

## P0-01 Home / Magical Village
- Show illustrated magical village at dusk/night, brand title, inviting headline, primary Ocean CTA.
- Four labeled destinations: Ocean, Arcade, Magic Shop, Garden (Garden may show a clear later/preview state rather than dead button).
- Header: logo, sound control (muted by default if sound included), accessible menu.
- Bottom navigation on mobile: Home, Ocean, Arcade, Magic, Saved; Garden accessible from Home and Magic.
- Placeholder artwork decoupled from text/buttons; no hardcoded hotspots into raster image.
- Returning visits skip intro; no blocking hero animation; room backgrounds can lazy-load.
- All main actions keyboard-accessible and labeled.

## P0-02 Purple Ocean (signature)
- A visually rich glowing purple ocean/sky with bounded render complexity. User taps **Add my little light**.
- Stages: initial/loading, ready, submitting, accepted, previously contributed, offline/error, read-only.
- When accepted, show light joining ocean and give an optional downloadable share card (1080×1920).
- Shared authoritative count is provided by server; count is of **accepted submissions**, NOT verified unique people.
- Anonymous browser token permits gentle 1-contribution-per-browser behavior; this is not strong identity verification.
- Ability to view total and optional Dec 3/5/6/day-unspecified breakdown; date selection is optional, not mandatory.
- Rendering uses finite particles / canvas density based on counts; it must not create one DOM node per all submissions.
- A failure never produces a fake confirmed light or increases the displayed authoritative count.
- Reduced-motion users see instant result and static sky; no sound required.

## P0-03 Physical QR reveals
- Every freebie family (pokemon, tarot, license, meme, quote, invitation, banknote, receipt) has valid route(s).
- Scanning `/c/{family}/{variant}` opens matching themed reveal. Clear CTA `Reveal my little surprise` or `Open the Boraverse`; skip option.
- Nonexistent variant → friendly, safe welcome fallback (404 semantics can remain but friendly display).
- Unapproved draft variants must not become public production routes.
- Rewards mostly client-side and are optional; no unique code per individual printed copy.

## P0-04 Bangtan Gacha
- Seven original character placeholders and data-driven outcomes.
- Free, unlimited entertainment; no paid currency, no manipulative scarcity.
- Tap to spin; short optional animation; reveal mascot, funny ability/title, original heartfelt line, related song link.
- Save outcome locally; repeat/reroll or explore. No backend required.

## P0-05 DJ, Spin That! music roulette
- Mood filters: comfort, hype, nostalgic, dreamy, chaotic, surprise-me.
- Random song from curated and verified metadata. Show title, era/album, ORIGINAL one-liner, official listening link(s).
- No hosting music, no autoplay copyrighted songs or embeds with autoplay. User initiates an external listen action.
- Support deterministic tests through a fixed seed or injected random source.

## P0-06 Magic Shop fortunes and letters
- Seven symbolic envelope themes: comfort, belonging, missing, hope, courage, friendship, silly mystery.
- Tarot digital reveal matched to printed variant when available.
- Original brief message; `What's the meaning?` optional; downloadable letter/postcard.
- No unrestricted submissions or publicly visible user text.

## P0-07 My Keepsakes
- Local-only collection of gacha, fortune, song, letter, ocean participation; use versioned local storage schema.
- Device-specific, not synchronized; clear copy explaining storage limits.
- Export one image at a time, where applicable. Gracefully handle Safari download restrictions (share/open-in-new-tab fallback).
- No login or cloud save.

## P0-08 Legal, trust, accessibility
- Clear `Unofficial fan-made, not for sale, not affiliated` statement on pages and footer.
- Privacy explanation; no required account; no collecting nickname or message on server.
- Accessible content, language-ready strings, descriptive controls, no motion requirement.

## P1 after P0 is stable
- ARMY license/certificate generator: nickname remains local and is not stored server-side; export PNG.
- One polished meme mini-game (Jam Jar is recommended first), with context explanation.
- Memory Garden visualization linked to existing Ocean contribution (NOT a second inflationary counter); optional verified BTS timeline.
- English/Thai full translation pass; basic EN launch, Thai-ready components.

## P2 later
- Share-link Borahae Poke with abuse considerations; additional games (Lachimolala, Yoongi proposal queue, Super Tuna, protect RM furniture); expanded personal scrapbook; timeline of 7–10 verified milestones.
- Open fan letter wall only after a concrete moderation/security/privacy model; otherwise excluded indefinitely.

## Visitor-facing microcopy (draft; adjustable)
- Brand: `The Little Boraverse`.
- Hero: `A little magic found you.`
- Hero subline: `Come wander among the stars, songs, and memories.`
- Ocean title: `Shine together.`
- Ocean CTA: `Add my little light`.
- Ocean accepted: `Your light has joined the others. Somewhere, another ARMY is shining with you.`
- Network failure: `Your light wasn't saved this time. Please try again when you're connected.`
- Duplicate: `Your little light is already part of this sky.`
- Arcade: `Insert 0 coins. Have unlimited fun.`
- Gacha: `Who's waiting inside?`
- Music: `Let a song find you.`
- Footer: `Unofficial ARMY-made fan project · Not affiliated with BTS, BIGHIT MUSIC, HYBE, or event organizers.`
