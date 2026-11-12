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
