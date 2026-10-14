# Number Go Down: Meta Layer, Leaderboards, Anti-Cheat, Replays/Clip Export and the Sharing Loop (phone browser, Oct 2026)

Research method note for the report writer: direct page fetches to developers.cloudflare.com, core.telegram.org and mediabunny.dev were blocked by the sandbox egress proxy, and the web-search budget ran out near the end. Figures attributed to those official docs come from search-engine extracts of the official pages, not full-page reads. Where only secondary or community sources were available, the notes say so. Each "Inferences" block holds this researcher's design and engineering recommendations for Number Go Down (NGD), built on the cited findings. They are not sourced facts.

---

## 1. Replayability and meta: multipliers, combos, challenge lists, achievements, unlocks, cosmetics vs power, streaks, daily/weekly seeds, ghosts, PB moments; what keeps short-session score games alive

### Takeaway
Long-lived short-session games pair a single shared daily or weekly object (Wordle's word, Trackmania's Track of the Day, Geometry Dash's Daily and Weekly levels) with a persistent personal record (streaks and stats). Bone-break games already have a proven challenge format: Skate's "Hall of Meat", which scores injuries and shows an X-ray of broken bones. For NGD, comparable boards and seeded dailies require cosmetic-only progression on anything ranked.

### Cited Findings
**Hall of Meat / bone-break precedents**
- In Skate 2 and Skate 3, Hall of Meat challenges were one of the event types for career progression. The game tallied the player's injuries (typically how many bones they broke) and awarded points. A hard landing showed an X-ray view of the broken bones. — [Inverse](https://www.inverse.com/gaming/skate-15million-fan-favorite-feature-hall-of-meat); [GamesRadar Skate 2 review](https://www.gamesradar.com/skate-2-10/2/)
- Fans treat Hall of Meat as a must-have for the new "skate." reboot (EA/Full Circle). 2025 coverage conflicts on whether the reboot ships full injury tracking and scoring: some guides say the full feature is missing, and one claims it returns with updated ragdolls. — [EGM "The one feature Skate 4 can't launch without"](https://egmnow.com/?p=10763); [Nerdschalk guide](https://nerdschalk.com/you-guide-to-hall-of-meat-in-skate-4/); [Inverse](https://www.inverse.com/gaming/skate-15million-fan-favorite-feature-hall-of-meat)
- Turbo Dismount (Secret Exit, makers of Stair Dismount) uses a simple loop: "damage awards points". Players vary obstacles, vehicles, poses and levels to climb leaderboards, and an adjustable replay follows every crash. Turbo Dismount 2 was announced in August 2024, with webcam face capture among its features. — [Wikipedia: Turbo Dismount](https://en.wikipedia.org/wiki/Turbo_Dismount); [TouchArcade GDC 2014](https://toucharcade.com/2014/03/21/gdc-2014-turbo-dismount/); [Automaton (JP)](https://automaton-media.com/articles/newsjp/sandbox-turbodismount2-20240809-305187/)

**Daily/weekly shared content and seasons**
- Trackmania (2020): the Track of the Day is a developer-picked user map that rotates daily. Cup of the Day runs three times a day on that map: a seeding phase, then knockout divisions of 64 players. A 25-track seasonal campaign rotates every three months next to a permanent 25-track Training campaign. TOTD and Cup of the Day sat behind the Club subscription (about $29.99/yr at launch; may be out of date). — [Wikipedia: Trackmania (2020)](https://en.wikipedia.org/wiki/Trackmania_(2020_video_game))
- Before launch, Nadeo said the game would follow a seasonal content model "much like" Fortnite and PUBG. — [GamingTrend preview](https://gamingtrend.com/previews/racing-as-a-service-trackmania-preview/)
- Geometry Dash Weekly Demon (since Update 2.1): finishing it gives a chest (orbs, diamonds, a key, Shards of Power). The next week's level appears after the reward is collected, and a skip opens only 7 days after the last one loaded. From 2.2, past weeklies can be replayed via "the Safe". — [Geometry Dash Wiki: Weekly Demon](https://geometry-dash.fandom.com/wiki/Weekly_Demon)
- Geometry Dash Event Levels (Update 2.207) are RobTop-picked user levels shown next to Daily and Weekly. They do not reset on a fixed timer: the next one appears only after the player opens the current chest. Demon Event levels have always given Gold Keys. — [Geometry Dash Wiki: Event Level](https://geometrydash.wiki.gg/wiki/Event_Level)

**Wordle: the daily ritual and streaks**
- Writers credit Wordle's spread to its shared daily puzzle and a sense of community, with no ads, influencer campaigns or marketing budget. Note that these are uneven blog sources. — [buildd](https://buildd.co/product/wordle-the-viral-sensation); [dinogame.gg](https://dinogame.gg/blog/why-wordle-blew-up/)
- Players value streaks and stats as much as the game itself. When the NYT migration in early 2022 reset some streaks, it became a news story and the NYT said it was "actively working on a solution". — [Tom's Guide](https://www.tomsguide.com/uk/news/wordle-disaster-some-players-lose-their-streaks-in-transfer-to-nyt); [FOX 7 Austin](https://www.fox7austin.com/news/wordle-moves-to-new-york-times-website-after-sale-some-users-streaks-interrupted)
- Wordle win rates are estimated at 97–99%, averaging about 3.8 guesses (from 250k+ shared results; the NYT publishes no official data). — [Udonis](https://www.blog.udonis.co/mobile-marketing/mobile-games/wordle)
- Headline: Wordle "brought tens of millions of new users" to the New York Times. — [AOL/Yahoo report](https://www.aol.com/news/wordle-brought-tens-millions-users-150000203.html)

**Flappy Bird**
- At its peak Flappy Bird reportedly earned about $50,000/day from ads, per Dong Nguyen's interview with The Verge. He pulled it, saying it had "become an addictive product" when it was "designed to play in a few minutes when you are relaxed". — [AppleInsider forum/news](https://forums.appleinsider.com/discussion/161966); [InformationWeek](https://www.informationweek.com/software-services/flappy-bird-killed-by-creator); [KitGuru](https://www.kitguru.net/page/1082/!https:/www.kitguru.net/gaming/matthew-wilson/flappy-bird-creator-pulled-game-to-stop-others-becoming-addicted/)

**Retention benchmarks (to set targets)**
- Hypercasual medians in Q4 2022 (Tenjin + GameAnalytics): D1 24% iOS / 23% Android, D7 7% iOS / 4% Android. The top 2% averaged D1 45% iOS / 38% Android. — [GameDev Reports (Substack summary)](https://gamedevreports.substack.com/p/tenjin-and-gameanalytics-hypercasual-6e4)
- In 2019 GameAnalytics put average D1 at about 25% and D7 just under 6%. Only top games reached D1 35% and D7 11%. Casual publishers reportedly want D1 of at least 35%. — [PocketGamer.biz](https://www.pocketgamer.biz/five-key-takeaways-gameanalytics-h1-2019-mobile-benchmark-report/)

### Inferences
- **Scoring layer.** Score = damage, with a combo multiplier. Impacts within about 0.4–0.6 s of the previous one extend the chain, and each *new* bone in a chain adds +0.1x. Add named "trick" bonuses in the style of Hall of Meat and Turbo Dismount: "Femur Pair", "Full Skeleton" (every bone), "Headfirst" (first impact is the skull), "Pinball" (8+ surfaces in one chain), "Long Fall" (airtime before the first impact). Show the X-ray skeleton (Skate's proven readout) on the results screen and in clips. Named bonuses double as the caption text for clips (section 4).
- **Challenge list (Hall of Meat clone).** Run about 30–60 permanent challenges in tiers, plus 3 rotating daily micro-challenges ("break 3 ribs on the spikes"). Challenges unlock cosmetics only. "Break every bone" is the capstone: a persistent per-player skeleton map that fills in across runs works like a collection log and gives a reason to keep playing.
- **Cosmetics vs power.** Ranked and seeded boards must be pure skill: same physics, same mass, same slingshot strength. A Learn-to-Fly style upgrade grind would make daily seeds and ghosts incomparable. Unlock skins (emo outfits, meme hoodies), slingshot *skins*, trails, impact VFX and SFX packs, and death poses. Launch *sites* can be unlockable non-ranked "playgrounds" while ranked sites stay fixed per board. If a power-progression mode is wanted for casuals, keep it on a separate unranked "Career" board.
- **Daily ritual = Wordle + TOTD.** One global "Descent of the Day" (#N numbered, same seed for all, resets 00:00 UTC). Give 3 ranked attempts per day plus unlimited practice. A small attempt cap makes each run matter, makes the share comparable, and limits brute-force abuse (section 3). Add a "Weekly Hell" (harder, longer seed, 7-day board) like GD's Weekly Demon and a 3-month Season like Trackmania's campaign. Seasons reset boards and give returning players a fresh start.
- **Streaks.** Count a daily streak when one ranked daily run is played. Add a streak-freeze item earned through play, never bought, because Wordle shows streak loss feels like real loss. Store streaks server-side per identity so they survive device changes, which the anonymous-only path cannot do (section 2).
- **Ghosts and PB moments.** Always race a ghost: your PB on that seed, the "player just above you", and the daily #1. A ghost is input log + seed (section 3), so it costs a few hundred bytes. "NEW PB" gets a freeze-frame, X-ray, rank delta ("+1,204 places") and a one-tap "Make clip". The PB moment is the most likely moment to share.
- **What keeps these games alive, in NGD terms.** (a) A fresh shared daily object (Wordle, TOTD, GD Daily); (b) persistent personal identity (streaks, stats, skeleton collection log); (c) skill ceiling plus comparability (Trackmania, GD); (d) cheap, spoiler-free bragging artifacts (Wordle grid). Flappy Bird is a caution: viral peaks fade without a ritual. Its creator's addiction worries are also a brand-safety signal for a crypto audience (section 6).
- **Target.** D1 at least 35% (the publisher bar for casual) and D7 at least 10% would put NGD in the top tier of hypercasual by 2019–2022 benchmarks.

### Gaps
- No GDC or Deconstructor of Fun sources were reached on live ops for short-session games (search budget). Helix Jump and Learn to Fly design data were not found. Cosmetics-vs-power advice is reasoned from design principles, not cited studies.
- No authoritative NYT DAU figure for Wordle was found, only the "tens of millions of new users" headline.
- Whether the 2025 "skate." reboot fully restores Hall of Meat scoring is unclear; sources conflict.

---

## 2. Leaderboard design that stays motivating, and low-friction identity options

### Takeaway
Plain global rank lists motivate only the top 5–10%. Show percentile, a "near me" window (the players just above and below), scoped boards (friends, Telegram group, region) and periodic resets. Telegram's own game high-score API returns the user plus 2 neighbours on each side plus the top 3, which is a ready-made pattern. Start identity anonymous and offer Telegram initData as the strongest low-friction upgrade. Wallets should stay optional and cosmetic.

### Cited Findings
**Board design**
- A plain first-to-last leaderboard energizes the top 5–10% while the rest feel they can't catch up. — [Yu-kai Chou, Leaderboard Design (Game Technique #3)](https://yukaichou.com/?p=18869)
- In large pools a rank like "582 of 6,024" feels meaningless even though it is top 10%, so showing percentile helps. Chou also recommends "micro leaderboards" (region and friends) for "optimism and urgency" and regular resets so new users aren't overwhelmed. — [Yu-kai Chou, Points, Badges, Leaderboards Part 3](https://yukaichou.com/behavioral-design/points-badges-leaderboards-part-3-of-3/)
- A 2026 Chou article suggests showing only the top 10, the user's position and who sits just above them. It also suggests showing movement (rank change over time), because "movement motivates everyone while status motivates only leaders". — [Yu-kai Chou 2026](https://yukaichou.com/advanced-gamification/how-to-design-effective-leaderboards-boosting-motivation-and-engagement/)
- A vendor guide likewise recommends showing nearest competitors above and below and using percentile framing in large pools. — [Blask leaderboard guide](https://blask.com/knowledge/leaderboard/)
- Academic caveat: leaderboards motivate through social comparison but can *reduce* motivation when comparison feels forced or users can't act on it (gamified IS / health apps). — [KIT publication](https://publikationen.bibliothek.kit.edu/1000169056/152385336)
- Practitioner advice here comes mostly from one blog (Chou) and its reprints, so treat it as heuristics. — (same sources as above)

**Telegram group boards (built-in pattern)**
- Telegram bots can offer HTML5 games played solo or competitively "in groups and one-on-one chats". When a score changes, clients should refetch the scoreboard. — [Telegram API: Games](https://core.telegram.org/api/bots/games)
- `getGameHighScores` returns "scores for the target user, plus two of their closest neighbors on each side", plus the top three if they are not already included. Telegram says this behaviour may change. — [aiogram getGameHighScores](https://docs.aiogram.dev/en/latest/_modules/aiogram/methods/get_game_high_scores.html)
- `setGameScore` is **bot-only**, so the game's front end cannot write scores. New scores must beat the old one unless `force` is set ("for fixing mistakes or banning cheaters"), and scores must be non-negative. — [Telegram messages.setGameScore](https://core.telegram.org/method/messages.setGameScore); [aiogram set_game_score](https://docs.aiogram.dev/en/latest/api/methods/set_game_score.html)

**Identity: Telegram Mini App**
- Mini App `initData` is validated server-side with HMAC-SHA256. The key is derived from the bot token with the constant "WebAppData", and you hash the alphabetically sorted key=value data-check string (minus `hash`). Use a constant-time compare and check `auth_date` freshness (24h is a common default; shorter for money-like features). — [telegram-mini-apps.com: init data](https://docs.telegram-mini-apps.com/platform/init-data); [AdsGram TMA mistakes](https://adsgram.ai/blog/adsgram/telegram-mini-app-tma-development-mistakes-and-how-to-avoid-them); [telega_webapp docs](https://telega-webapp.hexdocs.pm/telega_webapp.html)
- For third-party validation (apps that don't hold the bot token), an Ed25519 `signature` field can be verified with the bot's numeric ID and the prod/test environment. The signature is base64url without padding, a known pitfall. This was not verified against Telegram's official page. — [telepass crate](https://docs.rs/crate/telepass/latest); [telega_webapp](https://telega-webapp.hexdocs.pm/telega_webapp.html)
- In Telegram Web the Mini App runs inside an iframe, which breaks session persistence (bug report). — [Telegram bug tracker](https://bugs.telegram.org/c/2364/9)

**Identity: crypto/wallet inside Telegram**
- Telegram and the TON Foundation agreed that Mini Apps (including games) with crypto features must use TON exclusively. Apps on Sui, Aptos and others had to migrate, with grants of up to $50k for migrating within 30 days. — [Decrypt](https://decrypt.co/302023/telegram-exclusive-ton-barring-other-networks)

### Inferences
- **Board set.** (1) **Daily** seeded board, the main one. (2) **Weekly Hell** board. (3) **Season** board (3 months, resets). (4) **All-time Hall of Meat**: top 100, verified runs only (section 3). (5) **Friends/Group** boards: a Telegram group via `chat_instance`/group id, plus "crews" created from a challenge link. (6) Optional country board from Cloudflare's `request.cf.country`.
- **Default view per player.** Show percentile first ("You beat 87% of today's players") and the near-me window (3 above, 3 below, matching Telegram's ±2 plus top 3). Show the top 3 small, plus rank movement since the last run ("+1,204 ↑"). Never open on a long list where the player is at #48,213.
- **Percentile at scale on Cloudflare.** Keep one Durable Object per board (`daily:2026-10-14`) holding (a) a fixed log-scale histogram of scores (e.g., 512 buckets) for O(1) percentile and (b) an exact top-N heap. Persist runs to D1 for history. The near-me window can come from D1 with an index on (board, score) and `LIMIT/OFFSET` around the player's score. DO single-threading avoids write races on hot boards. Shard by time bucket if one DO gets too hot.
- **Identity ladder, lowest friction first.**
  1. **Anonymous device identity**: a server-issued random ID in localStorage + IndexedDB, plus an auto-generated emo handle ("SadLimpBoi#4821"). Zero friction, but streaks and PBs are lost if storage is cleared. Safari may evict script-written storage for sites that are not used for a while (ITP; not researched here), so prompt an upgrade after a PB.
  2. **Telegram Mini App**: identity comes for free and is cryptographically verifiable (initData HMAC), group boards come naturally, and it is the strongest anti-sybil option of the three. Rate-limit by Telegram user ID.
  3. **X/Twitter login (OAuth)**: the best brag identity for crypto Twitter (handle and avatar on boards and OG cards). Trade-offs are OAuth friction, possible API costs or limits (not researched) and no sybil resistance.
  4. **Wallet connect**: optional, used only for cosmetic ownership or a "verified holder" badge. Never require it to play. Inside Telegram it must be TON (TON Connect). On the open web, SIWE-style message signing works and needs no transaction. Wallet identity is cheap to farm (one wallet per bot), so never use it as anti-cheat.
- **Merge rules.** Allow linking anon → Telegram/X/wallet, keeping the best PB and the longest streak.

### Gaps
- X OAuth 2.0 pricing and rate limits for "Sign in with X" in 2026 were not researched (search budget).
- Cloudflare D1 size and query limits and KV consistency details were not retrieved. Durable Object CPU and memory figures are in section 3.
- The official Telegram doc page for the Ed25519 third-party validation was not fetched; it is confirmed only via third-party libraries.

---

## 3. Anti-cheat for a client-side physics sim

### Takeaway
The proven approach is input-log + seed replays re-simulated on the server. Trackmania's model is a replay file, with community re-sim ideas and an official server-side anticheat. Cloudflare Workers Paid and Durable Objects allow 30 s of CPU by default (configurable to 5 min) and 128 MB per isolate, enough to re-simulate a 60 s ragdoll run if the physics is cross-platform deterministic. Rapier's WASM build claims this; Box2D v3 also targets it. Re-simulation does not stop *tool-assisted* play. Slowed-down game speed was exactly how Trackmania's top runs were faked, and a deterministic slingshot sim can be brute-forced offline. NGD therefore also needs server-issued seeds, timing and plausibility checks, limited ranked attempts and review of top runs.

### Cited Findings
**Cloudflare compute limits**
- Workers CPU time per HTTP request: **10 ms on Free**. **On Paid: default 30 s, configurable up to 5 min (300,000 ms)** via `limits.cpu_ms` in Wrangler or the dashboard. Waiting on fetch, KV or database I/O does not count. Cron Triggers on Paid get 30 s (interval < 1 h) or 15 min (interval ≥ 1 h). — [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits)
- Durable Objects: default **30 s CPU per invocation** (HTTP request, WebSocket message or alarm), configurable to 5 min via `limits.cpu_ms`. Only active CPU counts. — [Cloudflare DO FAQ](https://developers.cloudflare.com/durable-objects/reference/faq); [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits)
- **128 MB memory per isolate**, shared across the concurrent requests that isolate handles. In-memory state is lost on eviction or hibernation. — [Cloudflare DO metrics/analytics](https://developers.cloudflare.com/durable-objects/observability/metrics-and-analytics/)
- Workflows steps on Paid: 30 s default, configurable to 5 min CPU. — [Cloudflare Workflows limits](https://developers.cloudflare.com/workflows/reference/limits)

**Deterministic physics for re-simulation**
- Rapier: "locally deterministic by default", so two different computers can diverge. Cross-platform determinism needs the `enhanced-determinism` feature, identical initial conditions and strict IEEE-754, which WASM provides. The JS guide says the WASM build is cross-platform deterministic, recommends snapshot hashing to verify it and warns that `Math.sin` and `Math.cos` are not guaranteed to match across platforms. npm has a slower `-deterministic` package variant that guarantees cross-platform determinism. `enhanced-determinism` conflicts with `simd8` (older docs: simd and parallel). — [Rapier JS determinism](https://rapier.rs/docs/user_guides/javascript/determinism); [Rapier Rust determinism](https://rapier.rs/docs/user_guides/rust/determinism/); [@dimforge/rapier3d npm](https://npmjs.com/package/@dimforge/rapier3d)
- Box2D v3 (Erin Catto, Aug 2024) targets cross-platform determinism, defined as the same world giving the same results on different CPUs and compilers. It was tested on x64 and ARM with MSVC, GCC and Clang, and is also multithread-deterministic. — [box2d.org: Determinism](https://box2d.org/posts/2024/08/determinism/)

**Trackmania lessons**
- Trackmania server configs expose a built-in anticheat toggle, options to save every player's run, "autosave validation replays" and a "changing validation seed" option for extra validation randomness. — [Shockbyte TM server settings](https://shockbyte.com/es/help/knowledgebase/articles/how-to-configure-your-trackmania-server-settings); [evoesports TM docker](https://hub.docker.com/r/evoesports/trackmania)
- The 2021 cheating scandal: Wirtual and donadigo analysed replay *inputs* and found inhuman input spikes. They concluded runs were made with tools that **slowed the game**, allowing more precise inputs. One player admitted to game speeds of 40–80%. Records needed only an uploaded replay, with no video. — [PC Gamer](https://www.pcgamer.com/au/cheating-allegations-catch-up-with-some-of-trackmanias-fastest-drivers); [Kotaku](https://kotaku.com/trackmania-cheating-scandal-is-utterly-fascinating-1846960428); [Tildes discussion](https://tildes.net/~games/x1x/the_biggest_cheating_scandal_in_trackmania_history)
- Community proposal: re-run recorded inputs on a clean install and compare trajectories to catch modified physics (speed hacks). — [Steam discussion](https://steamcommunity.com/app/232910/discussions/0/4691153621053044524)
- A newer Nadeo anticheat scan wiped some *valid* top runs (false positives). Staff asked players for video and screenshots. — [devtrackers.gg (Nadeo staff post)](https://devtrackers.gg/trackmania/p/b1c5ba74-false-positive-runs-wiped-out)

**Other ecosystems**
- speedrun.com: some boards require video for top runs (e.g., SMW top 5 from Jan 2017). Moderators are expected to process submissions within about 21 days, at least 3 active mods per board is advised, and any run can be disputed. — [speedrun.com moderation rules](https://www.speedrun.com/de-DE/support/learn/moderation-rules); [SMW verification process](https://www.speedrun.com/de-DE/smw/forums/f7cr2)
- Geometry Dash: there is no official public description of RobTop's leaderboard anticheat. Steam forum anecdotes describe players removed from leaderboards after using hacks and a 2015 exploit that altered other players' leaderboard names and icons. These are community claims only. — [Steam GD discussion](https://steamcommunity.com/app/322170/discussions/0/352792037322868772/); [Steam GD discussion 2](https://steamcommunity.com/app/322170/discussions/0/133259855831258388)
- Telegram's classic game platform puts trust at the bot backend: only bots can call `setGameScore`. — [Telegram setGameScore](https://core.telegram.org/method/messages.setGameScore)

**How cheating hit Telegram crypto games**
- Hamster Kombat's Season 1 airdrop (Sept 2024): about **2.3 million accounts banned** for bots or multi-accounting. In one case 400+ accounts were tied to a single Binance address, and another account invited almost 2,000 "friends". About 131M of about 300M users qualified. **6.8B tokens** were seized from cheaters (half redistributed, half burned). Open-source Python bots automating all in-game tasks circulated on GitHub. — [CryptoPotato](https://cryptopotato.com/hamster-kombat-announces-details-of-airdrop-2-3m-accounts-banned-for-cheating/); [Decrypt](https://decrypt.co/250940/why-hamster-kombat-purged-millions-players-telegram-airdrop?amp=1)
- Players objected that the disqualification criteria were never explained. Some allocations were worth only $5–15, and 57% of users were excluded. — [The Defiant](https://thedefiant.io/news/tokens/hamster-kombat-faces-backlash-for-excluding-57-of-users-from-airdrop)
- Hamster Kombat lost "nearly 260 million players" after listing (headline). — [ForkLog](https://forklog.com/en/hamster-kombat-loses-nearly-260-million-players-post-listing/amp)

**Bot friction at session start**
- Cloudflare Turnstile is free with unlimited verifications (sources conflict on a widget cap: one lists 20 widgets on Free). Invisible mode shows no widget, but it cannot present an interactive challenge, so token issuance just fails for suspicious visitors. Tokens are single-use (a second siteverify returns `timeout-or-duplicate`) and expire after about 5 minutes. siteverify must be called server-to-server. — [Forminit](https://forminit.com/docs/cloudflare-turnstile/); [Flavio Copes](https://flaviocopes.com/cloudflare-turnstile/); [craft-turnstile-pass](https://packagist.org/packages/cdgrph/craft-turnstile-pass); [skills.sh listing (20-widget claim)](https://skills.sh/jezweb/claude-skills/cloudflare-turnstile)

### Inferences
**Recommended pipeline (Workers + Durable Objects, Workers Paid required: 10 ms Free CPU is far too little for re-sim)**
1. **Start run** `POST /run/start` with Turnstile token (invisible) and identity (anon token, Telegram initData or X session). The server returns `{runId, seed, board, issuedAt, physicsVersion, sig=HMAC(secret, runId|seed|board|issuedAt|uid)}`. For daily boards the *seed* is the day's seed, but runId and nonce are unique, so each run is server-registered and counts against the daily attempt cap (e.g., 3 ranked).
2. **Client sim.** Fixed timestep (e.g., 60 Hz), no frame-rate-dependent logic, seeded PRNG (e.g., mulberry32/xorshift on the seed) for anything random. Use Rapier's `-deterministic` WASM build or Box2D v3 compiled to WASM. Never use `Math.sin/cos/random` in sim code; use library or table trig. Rendering can be interpolated and nondeterministic; the sim cannot.
3. **Input log.** A slingshot game has very few inputs: launch vector (pull angle and power quantized to, e.g., 1/4096), plus any mid-air inputs (flail, grab, tuck) as `(tick, inputBits)` deltas. A 60 s run is typically well under 1 KB after varint and deflate. Submit `{runId, sig, inputs, claimedScore, claimedEventsHash, finalStateHash, clientMeta}`.
4. **Cheap checks on ingest (Worker, ~ms):** valid HMAC, issued run not already used, wall-clock elapsed ≥ simulated duration (reject impossibly fast submits), run not older than X minutes, physicsVersion current, claimedScore below the board's plausibility ceiling, per-identity, per-IP and per-ASN rate limits (counter in a DO), attempt cap.
5. **Re-simulate** in a DO or queue consumer with the same WASM physics, assets and version, at the same fixed step and without rendering. Compare final score, event-list hash and periodic state hashes (e.g., every 60 ticks; Rapier recommends snapshot hashing). Benchmark the CPU cost. A ~20-body ragdoll in a mostly static level for 3,600 steps should fit far inside the 30 s default, but there is no published number, so measure it. Set `limits.cpu_ms` with headroom.
6. **Tiered verification to control cost:** every run gets ingest checks. Re-sim **only** runs that would enter the top N, top 1% or friend/group top 3, or that beat the player's PB by a lot. Show these as "Verifying…" on the board until confirmed, so a provisional score is displayed without being official.
7. **Human review lane** for the Hall of Meat (all-time) top 100: the replay *is* the proof (better than speedrun.com's video requirement). Publish rules and a dispute path. Hamster Kombat's backlash was about opaque bans, and Nadeo's false positives show automatic wipes need an appeal.

**Threat model specific to NGD**
- **Forged scores** (the Telegram-game classic: POST a fake number) are stopped by re-sim, since the score comes from the server sim, not the claim.
- **Modified physics or speed hacks** are stopped by re-sim, the Trackmania re-run idea.
- **Tool-assisted, brute-forced launches**: the biggest risk. A deterministic, published sim lets a cheater search launch parameters offline on a known daily seed and submit a perfect but "valid" input log. Re-sim cannot catch this (the Trackmania slow-mo lesson). Mitigations:
  - (a) Limited ranked attempts per daily, so brute force must happen offline and be submitted in 3 tries. This raises effort but does not prevent it.
  - (b) Mid-run inputs with timing requirements (flail and grab windows), so outcomes need real-time interaction rather than a single launch vector.
  - (c) A server-side micro-perturbation per run: the server picks a tiny per-run wind or spawn jitter from the runId and reveals it only at run start. Precomputed optimal launches then stop working, while fairness (expected difficulty) stays equal.
  - (d) Statistical flags: input timing entropy, inhumanly precise quantized values, superhuman consistency across attempts.
  - (e) Separate "Open/TAS" board if the community wants it.
- **Multi-accounting and bot farms**: only matters if rewards have value. Keep rewards cosmetic (section 6). Use Telegram identity, Turnstile, IP/ASN limits, attempt caps tied to identity, and invite-graph anomaly detection (Hamster's 2,000-invite account).
- **Client tampering** (memory editing, devtools) is covered by re-sim. Do not invest in client obfuscation beyond minification.
- **Version drift**: tag every run with `physicsVersion` and keep old WASM builds available for verification and ghost playback, or invalidate boards on physics changes, as Trackmania does with seasons.

### Gaps
- No primary Nadeo documentation of the TM2020 server-side validation pipeline was found. Poki's leaderboard and anticheat approach was not researched. Geometry Dash's anticheat is undocumented officially.
- No benchmark exists for Rapier or Box2D WASM CPU time inside Workers for a ragdoll run. It must be measured.
- I did not verify whether the Rapier JS standard build (vs `-deterministic`) is cross-platform deterministic; Rapier's JS guide and npm package descriptions appear to differ in emphasis. Treat `-deterministic` as required.

---

## 4. Replays and clip export in the phone browser

### Takeaway
Use input-log replays for ghosts and verification. For clips, keep a transform ring buffer so the highlight can be re-rendered offline at a fixed frame rate. On iOS/Safari 26+ and current Chrome, the best path is WebCodecs `VideoEncoder` → MP4 via Mediabunny, which replaces the deprecated mp4-muxer. Fall back to `canvas.captureStream()` + MediaRecorder (Safari 14.3+ MP4/H.264; Chrome 126+ MP4 per a secondary source). Share with `navigator.canShare({files})` → `navigator.share()` (iOS Safari 15+ for files), with the file fully generated *before* the tap, and keep a download/"Save video" fallback. TikTok and Instagram have no web share API; they are reachable only through the OS share sheet or by saving to the camera roll.

### Cited Findings
**MediaRecorder**
- Safari MediaRecorder was enabled by default in Safari TP 105 and the **iOS 14.3** beta. It accepts any MediaStreamTrack, including canvas tracks, and outputs **MP4 with H.264 video and AAC audio**. Use `MediaRecorder.isTypeSupported()` for feature detection. — [WebKit blog: MediaRecorder API](https://webkit.org/blog/11353/mediarecorder-api/)
- Known WebKit issues: canvas `captureStream()` → MediaRecorder gave a blank video in Safari 15 on the macOS 12 beta (reported working on iOS 14), duped to bug 230613. MP4 codec variants failed in the iOS 18.4 beta (duped to 288459). WebM recordings on iOS 18.4 beta were rotated 90° (marked fixed). — [WebKit bug 229611](https://bugs.webkit.org/show_bug.cgi?id=229611); [WebKit bug 290002](https://bugs.webkit.org/show_bug.cgi?id=290002); [WebKit bug 290223](https://auto-bugs.webkit.org/show_bug.cgi?id=290223)
- Secondary compatibility table: **Safari 18.4+** (macOS and iOS) MediaRecorder supports mp4 and webm containers with H.264, VP8, VP9, HEVC and AV1 (some flagged) plus AAC/Opus. **Chrome MP4 container from v126**, HEVC from v136. — [Addpipe MediaRecorder demo](https://addpipe.com/media-recorder-api-demo/)
- Chrome's MP4 muxer handles VP9, AV1, H.264 and H.265 with Opus or AAC and is used mainly by MediaRecorder. A Feb 2025 Blink intent covered H.26x MIME strings for MP4 and Matroska, with HEVC depending on the device and OS. — [Chromium media/muxers README](https://chromium.googlesource.com/chromium/src/media/+/refs/heads/main/muxers/README.md); [Blink-dev Intent to Ship](https://groups.google.com/a/chromium.org/g/blink-dev/c/YJ1QijNiHeM/m/3EhMjMVwAgAJ)
- `isTypeSupported()` returning true does not guarantee success, because recording can still fail for lack of resources. Chrome and Safari parse codec strings loosely, with exceptions. — [MDN isTypeSupported](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static); [W3C public-webrtc-logs](https://lists.w3.org/Archives/Public/public-webrtc-logs/2025Jul/0111.html)

**WebCodecs + muxing**
- caniuse: Safari **16.4–18.7 Partial**, **Safari 26.0+ Supported** (iOS Safari follows the same versions). MDN still lists `VideoEncoder` as "Limited availability" (not Baseline). — [caniuse WebCodecs](https://caniuse.com/webcodecs); [MDN VideoEncoder](https://developer.mozilla.org/docs/Web/API/VideoEncoder)
- Safari's early WebCodecs was video-only. Audio parity (`AudioEncoder`) arrived in Safari 26 per a secondary source; caniuse doesn't split audio out. — [Digital Samba](https://www.digitalsamba.com/blog/webcodecs-api-explained)
- **Mediabunny** is a zero-dependency TypeScript library that reads, writes and converts media in the browser using WebCodecs hardware encode and decode. `CanvasSource` takes a canvas, outputs `Mp4OutputFormat` to a `BufferTarget` with codec `'avc'` (H.264), and `finalize()` returns the MP4 bytes. It can write to memory or stream. — [Mediabunny intro](https://mediabunny.dev/guide/introduction); [Mediabunny README mirror](https://cdn.jsdelivr.net/npm/@kenzuya/mediabunny@1.28.8/README.md)
- **mp4-muxer is deprecated and superseded by Mediabunny.** Mediabunny's MP4 muxer grew out of mp4-muxer's code and adds multi-track, .mov and subtitles. The MP4 muxer alone is about 17 kB vs mp4-muxer's 9 kB. — [mp4-muxer MIGRATION-GUIDE](https://raw.githubusercontent.com/Vanilagy/mp4-muxer/HEAD/MIGRATION-GUIDE.md)
- `canvas-record` uses Mediabunny (`Mp4OutputFormat`, `EncodedVideoPacketSource`) for MP4, MOV, WebM and MKV. — [canvas-record source](https://app.unpkg.com/canvas-record@5.5.1/files/src/encoders/WebCodecsEncoder.js)

**Web Share API Level 2 (files)**
- web.dev compatibility box for `navigator.canShare()`: Chrome 128 (desktop), Edge 93, Safari 14, Firefox behind a flag. HTTPS is required. Video is among the permitted file types (see Chromium's list). The progressive-enhancement pattern falls back to a download. — [web.dev: Web Share](https://web.dev/articles/web-share)
- iOS 14 had file sharing behind a flag. **It works from iOS 15** (developer forum, plus a Japanese guide stating iOS Safari 15+ for video file sharing via `canShare`). — [Apple Developer Forums](https://developer.apple.com/forums/thread/133310); [Zenn](https://zenn.dev/ajitama_tkd/articles/15c5fb7e9382e8); [WebKit bug 198606](https://bugs.webkit.org/show_bug.cgi?id=198606)
- Spec: `share()` rejects with **NotAllowedError without transient user activation** and consumes the activation. `canShare()` needs no activation. — [W3C Web Share Recommendation (May 2023)](https://www.w3.org/TR/2023/REC-web-share-20230530/)
- WebKit bug: an async call before `navigator.share()` in a click handler works in Chrome/Android but gives NotAllowedError in Safari on the first attempt. — [WebKit bug 197779](https://bugs.webkit.org/show_bug.cgi?id=197779)
- iOS 15 bug: choosing "Save Image" in the share sheet could leave the share promise unresolved, so later shares failed until reload. — [WebKit bug 231995](https://auto-bugs.webkit.org/show_bug.cgi?id=231995)
- Some embedded webviews don't support `files` in `navigator.share` (Shopify embedded apps, for example). — [Shopify App Bridge share](https://shopify.dev/docs/api/app-bridge-library/apis/share)
- caniuse lists Web Share (general) on iOS Safari from 12.2. — [caniuse web-share](https://caniuse.com/web-share)

**TikTok / Instagram / Telegram targets**
- Instagram Reels sharing from iOS is a native mechanism (the `instagram-reels://share` URL scheme plus the pasteboard with app ID), not a web API. — [Meta: Sharing to Reels from iOS](https://developers.facebook.com/docs/ios/sharing-to-reels-instagram/)
- TikTok sharing is a native Share Kit SDK (Android intents with `video/mp4`). On iOS the video is saved to Photos first and TikTok creates a draft from it. — [TikTok Share Kit Android](https://developers.tiktok.com/doc/share-kit-android-quickstart-v2); [ITNEXT Swift guide](https://itnext.io/how-to-share-a-video-from-your-app-on-tiktok-using-swift-3f1e62d0860f)
- Telegram Bot API 7.8: Mini Apps can share media to the native **Story editor** (`shareToStory` in the WebApp API, `shareStory` in the tma.js SDK). It takes a media URL, caption up to 200 chars (2048 for Premium) and a widget link (Premium only). — [Bot API 7.8 notes](https://telegram.space/s/NewsAndTipsNT?after=2661); [tma.js SDK utils](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/3-x/utils/uncategorized)
- Telegram Bot API 8.0 ("largest update in the history of Mini Apps"): full-screen mode and "Media Sharing and File Downloads". — [Telegram Mini Apps docs](https://core.telegram.org/bots/webapps); [dev.ua coverage](https://dev.ua/en/news/telegram-predstavyv-velyke-onovlennia-api-dlia-mini-apps-iake-vkliuchaie-10-novykh-funktsii-1731924469)
- Telegram Web A has had download bugs (files not downloading or stalling, Sept 2024 report). — [Telegram bug tracker](https://bugs.telegram.org/c/43266/1)

### Inferences
**Replay data model**
- **Input log + seed + physicsVersion** (under 1 KB) is the canonical replay. Use it for ghosts, challenge links, server verification and "watch #1's run".
- **Transform ring buffer for clips.** About 20 ragdoll bodies × (pos 3 + quat 4) floats × 60 Hz × 60 s ≈ 504k floats ≈ 2 MB Float32, plus the camera path and an event log (`tick, type, boneId, impulse, damage`). This allows slow-mo (interpolate between ticks), re-framing for 9:16, and re-rendering without re-simulating, which avoids any client-side determinism risk in the clip path.

**Auto-picking the best 5–10 s**
- Over the event log, compute damage-per-window. Pick the 6–8 s window with maximum damage, weighting new-bone breaks, combo peaks and the single biggest impulse. Add 1 s lead-in (launch or fall) and 1 s tail (the limp aftermath, which is often the funniest beat).
- Slow-mo: drop to 0.25–0.35x for about 0.6 s around the largest impulse, with ease in and out. Keep the final clip ≤ 10 s, ideal for TikTok and Reels loops.
- Overlays drawn on the same canvas before encoding: big damage counter ticking down ("NUMBER GO DOWN" brand joke), combo or bonus captions ("FEMUR PAIR x2.4"), an X-ray flash on bone breaks, a persistent corner watermark (logo + URL short-link) and an end card (score, percentile, "Beat me: ngd.gg/c/abc123"). Burn the challenge URL into the video, because TikTok and IG strip links.

**Encoding paths (ordered)**
1. **WebCodecs offline render** (Safari/iOS 26+ per caniuse; current Chromium desktop and Android; verify exact Chromium versions on caniuse): render each output frame from the transform buffer to an OffscreenCanvas at 720×1280 at exact timestamps, `VideoFrame` → `VideoEncoder` (avc1, ~4–6 Mbps), mux with Mediabunny `Mp4OutputFormat` + `BufferTarget`. This runs faster than real time with no dropped frames, and the user doesn't watch it record. Check `VideoEncoder.isConfigSupported()` first, trying H.264 Main then Baseline. Audio: use `AudioEncoder` (AAC) where available (Safari 26+); otherwise ship silent or use path 2.
2. **MediaRecorder real-time** (iOS 14.3–18.x, older Android): play the highlight on a hidden 720×1280 canvas, `canvas.captureStream(30)` plus a WebAudio `MediaStreamDestination` track, MediaRecorder with the first supported type from `['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm']`. A 10 s clip takes 10 s to record, so show a "recording highlight" progress UI. WebM output from old Chrome should not be shared to iOS users. If MP4 is unavailable, offer a GIF or still card instead.
3. **Server fallback** (optional): upload the input log and render server-side. This is expensive and not suitable for Workers CPU, so treat it as out of scope at launch.

**Sharing flow (avoids the activation trap)**
- Step 1: the "Make clip" button triggers encoding, with a progress bar of about 1–4 s on WebCodecs.
- Step 2: when the `File` (`ngd-<score>.mp4`, `video/mp4`) is ready, show **"Share"**. In that tap handler call `navigator.share({files:[file], text, url})` synchronously, with no awaits before it. Check `navigator.canShare({files:[file]})` beforehand (no activation needed) to decide which buttons to render.
- Fallbacks: "Save video" (`<a download>` with a blob URL; on iOS this opens a preview where users can save), "Copy link" (challenge URL + Wordle-style text), and on Telegram `WebApp.downloadFile` (8.0+) plus `shareToStory` (7.8+, needs an HTTPS media URL, so upload the MP4 to R2 first).
- **TikTok/IG reality:** no web API exists. On iOS and Android the OS share sheet shows only targets whose extensions accept video. Coach users with "Save video → post to TikTok/Reels" as a primary instruction, not an error state.
- In-app browsers (X, TikTok, Instagram, Telegram) are where much crypto traffic lands. Feature-detect at runtime, and offer "Open in Safari/Chrome" when `canShare` with files is false.

### Gaps
- **iOS 26.x MediaRecorder canvas-capture reliability** (2026) was not confirmed; only older bugs were found. Test on devices.
- No primary source confirms Chrome's exact MediaRecorder MP4 milestone (the Addpipe table says 126).
- No source confirms whether TikTok's and Instagram's iOS share extensions accept MP4 handed over from Safari's Web Share sheet, or whether X/TikTok/IG/Telegram in-app webviews support `navigator.share({files})` in 2026. Device testing is required.
- The exact `downloadFile` and `shareToStory` signatures were not retrieved from the official page (fetch blocked).

---

## 5. Virality mechanics for crypto/meme communities: share cards, challenge links, referrals, X cards, Telegram sharing, Wordle's grid

### Takeaway
Spread comes from three artifacts that work without installing anything. (1) A funny **native video clip** uploaded to TikTok, X and Telegram. (2) A **challenge link** that unfurls into a score card (OG image generated at the edge) and loads the same seed and ghost. (3) A **spoiler-free text share** in Wordle-grid style, pasteable into any chat. Telegram adds native Story sharing and prepared inline messages that open the Mini App with a `startapp` payload.

### Cited Findings
**Wordle's grid**
- The emoji grid let players share their guessing path without spoilers. Accounts differ on its origin: Wardle saw New Zealand players posting coloured squares and automated it, or an early player ("Elizabeth S") invented it. The grids sparked curiosity among people who didn't know the game ("wanted to feel like they were part of the club") and worked as peer recommendation. — [Newstalk ZB](https://newstalkzb.co.nz/on-air/heather-du-plessis-allan-drive/audio/andrew-chen-the-wordle-emoji-grid-was-created-by-a-kiwi); [buildd](https://buildd.co/product/wordle-the-viral-sensation); [dinogame.gg](https://dinogame.gg/blog/why-wordle-blew-up/)

**OG share cards on Cloudflare**
- `workers-og` generates OG images on Workers without a browser: Satori turns HTML/JSX into SVG, then resvg WASM produces PNG. Its API is modeled on `@vercel/og`, which itself fails on Workers due to WASM bundling. It accepts HTML strings (parsed with HTMLRewriter) and has Google Fonts and emoji helpers. Maintenance activity is low. — [workers-og README](https://cdn.jsdelivr.net/npm/workers-og@0.0.27/README.md); [openapps listing](https://openapps.pro/packages/workers-og)
- `@cf-wasm/og` is an alternative (satori + resvg) with Workers and Next.js Edge entry points. Its README warns breaking changes may ignore semver. — [@cf-wasm/og README](https://unpkg.com/@cf-wasm/og@0.4.1/README.md)
- Cloudflare has an official tutorial on dynamic OG images with Workers. A Feb 2026 write-up says Workers block *dynamic* WASM compilation, so resvg must be imported as a precompiled module. — [Cloudflare tutorial](https://developers.cloudflare.com/workers/tutorials/generate-dynamic-og-images-using-workers); [6 Pitfalls of Dynamic OG Image Generation on Cloudflare](https://neura.market/directories/deepseek/blog/devto-3257610)
- A Japanese guide covers generating and *caching* OGP images on Cloudflare. — [Zenn (BEENOS)](https://zenn.dev/beenos_tech/articles/20230413_generate-and-cache-ogp-image-on-cf)

**X card behaviour**
- Set `twitter:card=summary_large_image`, with `twitter:image` (falling back to `og:image`) as an absolute HTTPS URL. Guides disagree on dimensions: 1200×675 (16:9) is most common, moda.app says 2:1 (e.g., 1200×600), others give 1200×630. The minimum is 300×157 and the maximum about 5 MB. No official X doc was retrieved; 1200×675 under 5 MB satisfies all guides. — [moda.app](https://moda.app/resources/sizes/twitter-card); [Screenhance 2026](https://screenhance.com/blog/twitter-card-dimensions-2026); [OpenTweet validator](https://opentweet.io/tools/x-card-validator); [Frontend Checklist](https://frontendchecklist.io/rules/seo/twitter-cards)

**Telegram sharing primitives**
- **Direct links**: a non-empty `startapp` parameter in a Mini App direct link is passed to the app as `start_param`. — [Telegram Mini Apps docs](https://core.telegram.org/bots/webapps)
- Community docs restrict `startapp`/`start_param` to **64 chars, `[A-Za-z0-9_]`** (regex `/[\w]{0,64}/`). This is unofficial; some sources suggest other limits. — [telegram-mini-apps.com: Start Parameter](https://docs.telegram-mini-apps.com/platform/start-parameter)
- **shareMessage** (Bot API 8.0): the backend calls `savePreparedInlineMessage` (bot-only; takes a user ID and an inline result, with flags allowing user, bot, group and channel chats) and gets an ID. The Mini App calls `shareMessage(id)`, which opens Telegram's native share dialog. — [Telegram savePreparedInlineMessage](https://core.telegram.org/method/messages.savePreparedInlineMessage); [tma.js SDK](https://docs.telegram-mini-apps.com/packages/tma-js-sdk/features/uncategorized); [DEV tutorial](https://dev.to/diana_agliamutdinova_741a/your-first-telegram-mini-app-fast-deployment-with-nextjs-vercel-and-telegram-sdk-4063)
- **Story sharing** (Bot API 7.8) and **Main Mini Apps** launchable from links or the bot profile (7.8). — [Bot API 7.8 notes](https://telegram.space/s/NewsAndTipsNT?after=2661)
- The game platform's group high scores update in-chat, and clients refetch the board on score updates. — [Telegram API: Games](https://core.telegram.org/api/bots/games)

**Referral loops: crypto cautionary data**
- Hamster Kombat's referral loop was farmed (one account invited ~2,000 "friends"), and the referral/airdrop economy drove mass botting. — [CryptoPotato](https://cryptopotato.com/hamster-kombat-announces-details-of-airdrop-2-3m-accounts-banned-for-cheating/)

### Inferences
- **Clip-first loop.** PB or funny crash → auto-highlight → MP4 with burned-in URL and score → native upload to TikTok, X or Telegram. Viewers search or type the URL, or tap the link in the post text.
- **Challenge links.** `https://ngd.gg/c/<runId>` (or `t.me/<bot>/<app>?startapp=c_<runId>`, ≤64 chars, `[\w]`). On open: same seed and board, the sender's ghost is visible, banner "Beat @emo_degen's 4,206,900". After the attempt: "You beat them by 12%" plus re-share ("Revenge clip"). A runId fits easily in 64 chars.
- **Edge-rendered OG card.** For `/c/<runId>`, a Worker returns HTML with `og:title` ("4,206,900 DMG — 17/21 bones — Top 3%"), `og:image=/og/<runId>.png` and `twitter:card=summary_large_image`. The image is generated once by workers-og (1200×675, Emonad X-ray pose, score, percentile, bones grid) and cached in R2 or the Cache API, since runs are immutable. Precompile the resvg WASM module (no dynamic WASM compile). Bundle 1–2 fonts as ArrayBuffers to avoid Google Fonts fetch latency.
- **Wordle-style text share** (works everywhere, including Telegram groups and X text):
  `Number Go Down #142 💀 4,206,900 dmg (top 3%)`
  `🦴🦴🦴🦴🦴🦴🦴🦴🦴🦴🦴🦴🦴🦴🦴🦴🦴⬛⬛⬛⬛ 17/21`
  `💥x6 combo · 🧠 headfirst · ⏱ 38s`
  `ngd.gg/d/142`
  The daily number and bone grid are spoiler-free and comparable, like Wordle. The link goes to the daily board, not a personal page, so curiosity converts to play.
- **Telegram-native loop.** (1) After a run, the backend prepares an inline message (photo or OG card + caption + "Play the same descent" button carrying `startapp=c_<runId>`) and the client calls `shareMessage`. (2) "Post to Story" via `shareToStory` with the uploaded clip URL. (3) Group boards: posting the game in a group creates a group leaderboard, with group-vs-group weekly rivalry ("Which TG raids hardest?"). This fits Telegram crypto communities.
- **X specifics.** X cards show a static image; video should be uploaded natively, not linked. Use the link only for the challenge (card image + URL). Pre-fill tweet text via `https://x.com/intent/post?text=...&url=...` as a no-file fallback.
- **Referral loop, safely.** Reward referrals with *cosmetics* (e.g., "Bring 3 friends who finish a run → Emo Hoodie skin"). Count a referral only after the invitee completes a verified run, with caps and Telegram identity. Never pay tokens per invite; Hamster Kombat shows that invites get farmed at scale.
- **Brand hooks for the meme audience:** "Number Go Down" vs the sibling "Number Go Up" (cross-promo: a big NGU score unlocks a "bull" skin and vice versa). Shareable death-pose names. Weekly "Meat of the Week" community clip showcase (Hall of Meat homage), with clips submitted via the challenge link so they bring their replay.

### Gaps
- Official X Cards documentation (exact `summary_large_image` spec, player-card policy in 2026) was not retrieved; dimension guidance conflicts.
- No data was found on share-to-install conversion for web games, OG cards vs native video, or TikTok discovery for browser games.
- The official `startapp` length limit (64 vs larger) is unconfirmed; test it.
- No research covered Telegram inline-mode game sharing beyond `savePreparedInlineMessage`.

---

## 6. Legal and brand safety for score-chasing crypto audiences (high level)

### Takeaway
Keep NGD a free, skill-based game whose rewards are cosmetic and non-transferable. Once prizes have monetary value, US lottery law (prize + chance + consideration) and state skill-contest rules apply. Token-for-play reward schemes invite mass botting and backlash (Hamster Kombat). Inside Telegram, crypto features must be TON and digital goods must be sold in Stars.

### Cited Findings
- US illegal lottery = **prize + chance + consideration**. Because a promotion always has a prize, a legal promotion removes chance (a true skill contest) or consideration (free entry / AMOE). — [Morgan Lewis sweepstakes best practices](https://www.morganlewis.com/-/media/files/publication/presentation/speech/ppt-best-practices-sweepstakes-prizes-awards.pdf); [Lewis Roca guide](https://lewisroca.com/a-practical-guide-for-offering-online-contests-and-promotions-1)
- Most US states treat a contest as legal if **skill is the dominant factor**, but some are stricter and several states **prohibit entry fees** for skill contests. Some states require registration or bonding for prizes above thresholds. Violations can be criminal. — [Lewis Roca](https://lewisroca.com/a-practical-guide-for-offering-online-contests-and-promotions-1); [Globig US prize promotion](https://platform.globig.co/knowledgebase/US/how-to-marketing-for-us/prize-promotion-competition-law-us); [Stinson: sweepstakes in esports/online gaming](https://sitepilot10.firmseek.com/client/stinson/www/printpilot-publication-running-a-legal-sweepstakes-or-contest-in-the-esports-and-online-gaming-world.pdf)
- AMOE (free-entry) sweepstakes get more scrutiny when operators monetize paying entrants. A free route cannot disguise what is in substance gambling. — [Stinson](https://sitepilot10.firmseek.com/client/stinson/www/printpilot-publication-running-a-legal-sweepstakes-or-contest-in-the-esports-and-online-gaming-world.pdf)
- Crypto precedent: *Suski v. Marden-Kane* (N.D. Cal. 2022), a Coinbase Dogecoin sweepstakes. The free entry method existed but was "not well-publicized", and that became the issue in litigation. — [Olshan Advertising Law Blog (Sept 2022)](https://www.olshanlaw.com/Advertising-Law-Blog/2022/09)
- Canada's Criminal Code (ss. 197–206) bans for-profit gaming or betting with narrow exceptions, and its skill-contest rules differ from the US (low-quality secondary source). — [ICAI Surat blog](https://icaisurat.org/?p=139330)
- Telegram: Mini Apps with crypto features must use TON exclusively. — [Decrypt](https://decrypt.co/302023/telegram-exclusive-ton-barring-other-networks)
- Telegram requires **Stars** for digital goods and services sold inside bots and Mini Apps; TON payments don't replace Stars checkout for digital goods (vendor blog). Developers can convert Stars to TON via Fragment or spend them on ads. — [InviteMember](https://blog.invitemember.com/telegram-stars-vs-toncoin/); [The Block](https://www.theblock.co/post/303217/telegram-mini-app-developers-can-now-use-stars-to-get-ton-rewards-or-ad-discounts)
- Hamster Kombat's airdrop: 2.3M bans, 57% of users excluded, opaque criteria, $5–15 allocations, and a later collapse in player count. This is reputational fallout from token-for-play. — [CryptoPotato](https://cryptopotato.com/hamster-kombat-announces-details-of-airdrop-2-3m-accounts-banned-for-cheating/); [The Defiant](https://thedefiant.io/news/tokens/hamster-kombat-faces-backlash-for-excluding-57-of-users-from-airdrop); [ForkLog](https://forklog.com/en/hamster-kombat-loses-nearly-260-million-players-post-listing/amp)
- Flappy Bird's creator pulled a $50k/day game over concerns that it was addictive. Compulsion is a reputational risk even without money involved. — [InformationWeek](https://www.informationweek.com/software-services/flappy-bird-killed-by-creator)

### Inferences
- **Default posture:** free to play, no purchases needed for anything ranked, cosmetics-only rewards that are **non-transferable and have no cash-out**. That removes "consideration" and "prize value", so lottery and gambling questions mostly don't arise.
- **Avoid:** paid random loot boxes or gacha for skins (chance + consideration). "Play-to-earn" token emissions tied to score. Token airdrops weighted by leaderboard rank, which turns leaderboards into a bot-farming target. Wagering or "bet on your run" features. Copy saying "earn", "profit" or "returns". Selling skins as investments.
- **If prize events happen** (e.g., a sponsored weekly top-10 prize): make it skill-dominant and free to enter with no purchase to compete. Publish official rules (eligibility, geofencing excluded jurisdictions, tie-breaks, verification by replay re-sim and human review, disqualification and appeal). Keep prizes modest and non-token where possible. Get counsel to review state registration and bonding and international rules. Publicize the free route prominently (Suski lesson).
- **Wallet features:** optional, cosmetic or badge only. In Telegram they must be TON. Any in-Telegram digital-goods sale must use Stars, though NGD can sell nothing at launch.
- **Brand and content safety:** the cartoonish ragdoll violence and the emo mascot carry self-harm-adjacent optics. Keep the tone slapstick (no gore, blood toggle off by default, no self-harm language in copy or captions). Clip watermark and caption templates should stay platform-safe for TikTok and X. Add a "take a break" nudge after long sessions as a cheap hedge against the Flappy Bird compulsion narrative.
- **Fairness transparency** (Hamster lesson): publish anticheat principles, show "verifying" states, and provide an appeal path. Never retroactively confiscate rewards without stated criteria.

### Gaps
- UK, EU and Asia skill-contest and prize-draw rules were not researched (search budget exhausted). Neither was the regulatory status of airdrops or securities for game tokens in 2026, or TikTok and X policies on crypto-promotional game content.
- No authoritative source was found on whether in-game tokens with secondary-market value count as a "prize" for US lottery analysis.
- This is not legal advice. The sources are law-firm overviews and secondary blogs, and gambling counsel is needed before any prize or token mechanic.
