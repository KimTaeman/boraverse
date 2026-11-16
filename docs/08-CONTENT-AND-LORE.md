# BTS / ARMY CONTENT GUIDE — Quality, lore and tone

## Identity and respect
- This is a **fan-made** work. It must never claim endorsement or official ARMY membership rights.
- Use BTS facts and memes only after checking origins. Make original jokes/art and keep them affectionate, not insulting.
- Don't host commercial songs, music-video footage, copyrighted album art or substantial lyric excerpts. Link to official sources/services; song **titles**, factual release metadata and original commentary are suitable.
- Don't reproduce third-party fan art without the artist's permission. No downloadable exact replicas of brand trademarks/logos.
- No romantic/deceptive bot impersonation or suggestions BTS members are privately communicating through this website.

## Research source order
1. Official BIGHIT MUSIC/HYBE BTS discography/tour announcements, BTS official channels, Weverse official posts.
2. Original clips/episodes for meme context where legally accessible.
3. Trustworthy documented fan explainers/community discussion, cross-checked with primary footage.
4. Unverified internet listicles are inspiration only, not authority.

## Cultural / era pillars
- `Magic Shop`: welcoming, warm place for comfort and letters (2018 song; original site imagery, not lyric reproduction).
- `Spring Day`: missing, changing seasons, hopeful reunion (2017 song; original scenery, not MV recreation).
- `Mikrokosmos`: tiny lights creating a sky together, consistent with Purple Ocean vision.
- `ARIRANG`: identity, togetherness, long growth; contemporary songs like `SWIM` and `Into the Sun` can inspire original emotions, after checking official track info.
- `Bangkok 2026`: a fan keepsake for Rajamangala National Stadium concert dates; don't imply special tour partnerships.

## Fandom-joke candidates — require fact check before publishing
| Reference | Proposed experience | Guardrail |
|---|---|---|
| Lachimolala | Misheard-word game | Check exact Run BTS context before naming actor/episode |
| Jimin got no jams | Jam-jar refilling game | Humor about meme, avoid mean-spirited personal attack |
| Yoongi marry me | Fictional ridiculous queue ticket | Never promise real response or actual proposal submission |
| Worldwide Handsome | Funny certificate | Credit as recognizable Jin catchphrase and avoid logo misuse |
| Important Business | Fake office license | Verify original travel clip before quoting details |
| RM's accidental destruction | Protect the furniture mini-game | Keep affectionate; not defamation |
| Super Tuna | Lighthearted fish game | Do not embed official recording or lyrics |
| Borahae | Shared purple affection | Correct origin/history in final lore card |
| APOBANGPO | Belonging/memory phrase | Verify translation and origin before publishing |

## Tone rubric
Each copy item should meet: (a) readable within seconds, (b) warm, not condescending, (c) fun without requiring encyclopedic lore, (d) original, (e) culturally respectful, (f) no scary fake errors/virus warnings. Provide `What's the reference?` optional explanation where needed.

## Content object schema (draft)
```ts
type LoreStatus = 'verified' | 'needs-review' | 'fictional-playful';
type ExperienceCopy = {
  id: string;
  title: string;
  body: string;
  tone: 'cute' | 'chaotic' | 'comforting' | 'nostalgic';
  loreStatus: LoreStatus;
  optionalExplanation?: string;
  sourceUrl?: string; // required for factual origin claims
  locale: 'en' | 'th';
};
```

## Original copy examples (draft, not official lyrics)
- `To the ARMY holding this card: We may never meet again, but tonight our paths met under one purple sky.`
- `Somewhere among millions of people, this little purple world found its way to you.`
- `Today's certificate: Professional Bias-Wrecker Survivor. Qualification: Absolutely none.`
- `This tiny paper star has one job: remind you you're not alone in the crowd.`

## Song roulette dataset requirements
Metadata for each song: `id`, `title`, `artist`, `releaseYear`, `albumOrEra`, `moods[]`, `officialListenUrl`, `originalDescription`, `sourceUrl`, `approved`. Keep set curated and small initially (e.g. 20–30 verified songs). No unverified random discography scraped into production.

## Translation notes
English first; architecture supports Thai. Translations should be culturally natural rather than word-for-word. BTS proper names and official song titles stay consistent. Do not show machine translations as approved without a human proofreading pass.

## First QR copy review — message wording approved, 2026-11-16

The owner approved the eight English message bodies below on 2026-11-16 (D014), as presented in the chat review. They occupy the existing `01` records in `src/content/freebies.ts`. Titles remain proposed; these are original messages, not lyrics, artist quotations or factual lore claims. Every record remains `approved: false` while titles, final artwork/source rights and release details await review, so public routes still show the generic fallback. Existing IDs/destinations are preserved but not frozen for printing.

| Family / existing record | Title (proposed) | Message (approved D014) | Existing destination |
|---|---|---|---|
| `pokemon/01` | A tiny companion for a big night | Every great adventure needs a little sidekick. Meet a pocket-sized surprise in the arcade. | `/arcade` |
| `tarot/01` | The Little Lantern | A small brave step can light the way. Visit the Magic Shop for a playful fortune, just for fun. | `/magic-shop` |
| `license/01` | Licensed to make little memories | Permission to laugh too loudly, treasure small moments, and enjoy the arcade. A playful keepsake, not an official credential. | `/arcade` |
| `meme/01` | My serious plans have left the chat | Today's agenda: find a little joy, collect a silly surprise, and call it a productive day. | `/arcade` |
| `quote/01` | A little kindness, folded for you | You do not have to shine at full brightness every day. There is a quiet corner waiting for you in the Magic Shop. | `/magic-shop` |
| `invitation/01` | You found our little universe | Come in, take a breath, and wander at your own pace. There is a little magic here for you. | `/` |
| `banknote/01` | One pocketful of possibility | This pretend note has no cash value. The little surprises in our arcade are free, and your curiosity is all you need. | `/arcade` |
| `receipt/01` | A receipt for a little togetherness | One shared sky. A memory to carry home. Visit our Purple Ocean and see the lights we are making together. | `/ocean` |

Remaining review gates: owner approves the separate title, intended destination/stable ID and final original artwork/source rights. Message-body approval alone does not unlock the public reveal; only mark a variant approved once its remaining gates pass. The license is explicitly a playful keepsake, not a credential; the banknote is not money; the fortune is for fun. No real certificate, paid reward, mini-game, saved Ocean contribution or artist message is promised. The receipt invites visiting the shared sky and does not imply a light was already saved.

This set deliberately uses original writing instead of unverified fandom quotations. Title review, Thai translation/proofreading, additional variants, art selection and per-variant quantities remain pending. Do not print or distribute these route examples as production QR codes until the existing release checks pass.
