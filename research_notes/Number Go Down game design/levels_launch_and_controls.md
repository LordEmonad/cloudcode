# Level design, slingshot launch and one-finger steering for "Number Go Down"

Scope: vertical-descent and chaotic-bounce level design, pacing a 20-60 s run, procedural vs handcrafted vs seeded-daily courses, slingshot launch UX on a portrait phone, one-finger steering of a falling ragdoll, portrait UX, and an obstacle catalogue. Researched 14 Oct 2026.

Method note for the report writer: every WebFetch failed with DNS errors (gamedeveloper.com, pcgamer.com, wikipedia.org, killscreen.com, design.google, yorku.ca, letsmakeagame.net, thumbsticks.com). So the "Cited Findings" below come from search-result excerpts of those pages, not full-page reads. Quotes are as close to the source as the excerpts allow. Where an excerpt mixed several sources and I could not tell which page said what, I cite the group and flag it. Design recommendations specific to Number Go Down (NGD) are in "Inferences" and should be playtested. They are reasoning, not sourced fact.

---

## 1. Vertical-descent and chaotic-bounce level design: how Downwell, Helix Jump, Tiny Wings, Peggle/pachinko, pinball, Burnout Crash Mode and Turbo Dismount structure obstacles, speed, rhythm and "fair chaos"

### Takeaway
The best references each build around one core verb and pile everything else onto it: Downwell's gunboots, Tiny Wings' hold-to-dive, Peggle's single aimed shot, Burnout's Aftertouch. Each makes randomness feel fair in three ways: the player owns the input that started the chaos, the system pays out generously and visibly for lucky outcomes, and there is a cinematic "moment" (slow-mo, zoom, music sting) when the outcome is decided. For NGD the core verb should be "fling, then nudge the wreck," and every obstacle should exist to make that nudge matter.

### Cited Findings
**Downwell (vertical descent, portrait mobile origin)**
- Ojiro Fumoto's GDC 2016 talk is titled "Polishing the Boots: Designing Downwell Around One Key Mechanic". It covers how he found one fun "gimmick" and designed the whole game to get the most out of it — [GDC Vault](https://gdcvault.com/play/1023533/Polishing-the-Boots-Designing-Downwell); [TouchArcade](https://toucharcade.com/2016/06/02/watch-downwell-developer-ojiro-fumoto-talk-about-how-he-designed-his-fantastic-platformer/)
- Downwell started as an attempt at "a Spelunky-like game" for mobile, and the gunboots came later. Fumoto worked without a design document — [Thumbsticks GDC 2016 report](https://www.thumbsticks.com/gdc-2016-ojiro-fumoto-on-polishing-downwells-gun-boots/)
- The gunboots do two jobs from one input: killing enemies and giving recoil for movement. The idea came from wanting jump and fire on one button to suit a portrait mobile screen — [Thumbsticks](https://www.thumbsticks.com/gdc-2016-ojiro-fumoto-on-polishing-downwells-gun-boots/); [Famitsu](https://www.famitsu.com/news/201603/16101475.html) (search-excerpt synthesis; exact wording not verified)
- The talk traced many iterations of the gunboot mechanic over a 15-month development — [Kill Screen](https://www.killscreen.com/the-tricky-brilliance-of-downwells-gunboots/)
- Combos count kills chained without touching the ground. Guides consistently give the thresholds as 8 (gem bonus), 15 (adds a gunboot charge/ammo) and 25 (adds health). One analysis criticises that nothing improves past 25 — [Steam guide "How to Downwell"](https://steamcommunity.com/sharedfiles/filedetails/?id=1613957513); [Let's Make a Game design review](https://letsmakeagame.net/downwell-design-review/); [Game Developer: Downwell Design Analysis](https://www.gamedeveloper.com/design/downwell-design-analysis) (thresholds aggregated across these; not checked on each page)
- "Gem high" starts after collecting 100 gems quickly. It boosts weapon range and damage, and the design pushes the player to keep up tempo to hold it. Side rooms (shops, gun modules) let players rest *without* breaking a combo or losing gem high — same sources as above
- Each run's layout is procedural, but each world follows a set pattern/theme — [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=1613957513); [Gabriel Chauri, game-jam notes with Downwell examples](https://www.gabrielchauri.com/game-jam-mentor-downwell/)

**Helix Jump (Voodoo hyper-casual descent)** — no primary design source found; only reviews and guides:
- Falling through several platforms in one drop scores as a combo, and is "where the real skill ceiling shows up". A free-fall of several levels without touching a surface builds momentum that can break through the next platform — [PlayPile](https://playpile.gg/games/helix-jump); [games.gg](https://games.gg/helix-jump/) (non-authoritative)
- Later levels have narrower gaps, faster rotation, moving platforms and rotating sections. Danger zones get more dangerous, especially at the edge of holes — [Pocket Gamer tips](https://www.pocketgamer.com/articles/077966/helix-jump-cheats-and-tips-everything-you-need-to-get-high-scores-in-helix-jump/); [PlayPile](https://playpile.gg/games/helix-jump)

**Tiny Wings / Alto (flow descent, one-touch)**
- Tiny Wings: holding the screen stops the bird flapping so it dives faster downhill, and releasing makes it flap and launch. The skill is timing the touch to land on a downslope and release at the valley. Nightfall is the run clock, speed coins help you outrun the night, and islands are procedurally generated — [TouchArcade review](https://toucharcade.com/2011/02/22/tiny-wings-review/); [App Store listing](https://apps.apple.com/app/tiny-wings/id417817520); [appmus](https://appmus.com/software/tiny-wings) (secondary)
- Alto's Adventure is "primarily a one-touch game", playable mostly with one hand: tap to jump, hold to backflip — [AppUnwrapper review](https://appunwrapper.com/2015/02/19/altos-adventure-review/); [TechCrunch](https://techcrunch.com/?p=1122228). Ryan Cash traces its origins to Tiny Wings and Sky Safari — [Applesfera interview](https://www.applesfera.com/entrevistas/boca-oido-nos-convirtio-exito-inesperado-hablamos-ryan-cash-creador-altos-adventure)

**Peggle (pachinko made fair)**
- Sukhbir Sidhu was inspired by pachinko but saw it as mostly luck, which would not translate to a video game. "The main issue was finding the right balance of luck versus skill." His prototypes were more random, while Brian Rothstein's were more skill-based. The game is "held together by randomness" — [PC Gamer, The Making of Peggle p.2](https://www.pcgamer.com/the-making-of-peggle/2/); [Wikipedia: Peggle](https://en.wikipedia.org/wiki/Peggle); [Peggle wiki, Making of](https://peggle.fandom.com/wiki/Peggle_Deluxe/Making_of_Peggle)
- GameSpot: "it's that very randomness, the way that each shot is a gamble no matter how well-practiced you are, that makes Peggle so utterly engrossing" — [GameSpot Peggle 2 review](https://www.gamespot.com/reviews/peggle-2-review/1900-6415588/)
- Free Ball Bucket: a moving bucket at the bottom returns the ball as a free ball if it lands in it. In Duel mode it becomes a Bucket Bonus that starts at 2,500 and grows by 2,500 per catch — [Wikipedia: Peggle](https://en.wikipedia.org/wiki/Peggle); [PopCap wiki](https://popcapgames.fandom.com/wiki/Peggle)
- Final-peg drama: when a shot approaches the last orange peg, a drum roll starts, the camera zooms in and the moment plays in slow motion. Hitting it triggers "Extreme Fever" with Beethoven's "Ode to Joy". The bottom of the board becomes five scoring wells worth 10,000 to 100,000, and the 100k hole "erupts in a volcano of green stars" — [GamesRadar review](https://www.gamesradar.com/peggle-10/); [NBC News](https://www.nbcnews.com/id/wbna18221146); [TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/Peggle)
- Near-miss: if the ball gets close enough to trigger the super close-up but misses, the "Ode to Joy" chorus groans in disappointment — [TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/Peggle)
- Peggle 2 changes the celebration music in later levels, using other classical pieces instead of always Beethoven — [GamePro.de Peggle 2 review](https://www.gamepro.de/artikel/peggle-2-beethovens-neuste,3031014.html)

**Pinball (chaos with safety nets)**
- Black Knight's "Magna-Save" let the player fire a magnet to stop outlane drains. The lower playfield was deliberately fast and drain-prone to keep playtime short, because the ball could not drain from the upper playfield — [Wikipedia: Black Knight (pinball)](https://en.wikipedia.org/wiki/Black_Knight_(pinball))
- In competitive play, ball savers can reward a fast drain (free ball back) more than a long, skilful ball, which players argue is unfair — [Tilt Forums thread](https://tiltforums.com/t/on-ball-saver-in-high-level-competition/611)

**Burnout Crash Mode (junction set pieces)**
- Crash Mode: cause as much monetary damage as possible in a pileup at a busy junction. Burnout 3 has 100 junctions, and Crash Mode returned from Burnout 2, reworked around Aftertouch — [Wikipedia: Burnout 3](https://en.wikipedia.org/wiki/Burnout_3:_Takedown); [Burnout wiki](https://burnout.fandom.com/wiki/Burnout_3_Crash)
- Crashbreaker: once enough vehicles are in the pileup, the player can detonate their car to damage nearby traffic. Pickups on the junction give cash, score multipliers, speed boosts or an instant Crashbreaker. One negative pickup, the "Heartbreaker", cuts the score — [Wikipedia](https://en.wikipedia.org/wiki/Burnout_3:_Takedown); [Burnout wiki](https://burnout.fandom.com/wiki/Burnout_3_Crash)
- Impact Time is a slow-motion mode during a crash. Aftertouch lets the player steer the wreck, and hitting another car earns extra points and boost — [Game Revolution review](https://www.gamerevolution.com/review/33575-burnout-3-takedown-review); [Wikipedia](https://en.wikipedia.org/wiki/Burnout_3:_Takedown). Giant Bomb: Impact Time slows "the normally intensely high-speed feel in order to get some post-crash satisfaction" — [Giant Bomb](https://giantbomb.com/wiki/Games/Burnout_3_Takedown)
- Criterion built the series on the idea that "reckless, ridiculously high-speed driving and apocalyptic auto wrecks are really, really fun" — [GameSpot preview](https://gamespot.com/articles/burnout-3-takedown-feature-preview/1100-6104473/)

**Turbo Dismount (Secret Exit; ragdoll damage-as-score)**
- Core loop: pick a vehicle and a pose for the character, set launch speed (described as set on a moving bar), then watch the crash. Courses include overpasses, bridges, busy crossings and roads with loops and jumps. Players can place obstacles such as brick walls, ramps and turbo pads — [Wikipedia: Turbo Dismount](https://en.wikipedia.org/wiki/Turbo_Dismount); [Pocket Gamer review](https://www.pocketgamer.com/turbo-dismount/review/); [Mobilissimo review](https://www.mobilissimo.ro/jocuri-telefoane/turbo-dismount-review-allview-x2-soul-mini-un-simulator-de-accidente-rutiere-cu-fizica-ragdoll-buna-video) (excerpts mixed; which page said which detail is not verified)
- Score depends on the type and speed of collision, crashing traffic, vehicle damage and dismembered limbs. Stacking a big ramp, bowling pins or a palm tree raises damage and points — same review sources
- Design intent (Secret Exit): the figure is "not a crash-test dummy, he's an abstraction of a human figure", which keeps the focus on movement rather than gore — [Kill Screen, "Why are ragdoll physics so funny"](https://www.killscreen.com/why-are-ragdoll-physics-so-funny/) (attribution from excerpt)
- Turbo Dismount 2 (announced Aug 2024) adds webcam face capture onto the ragdoll — [Automaton](https://automaton-media.com/articles/newsjp/sandbox-turbodismount2-20240809-305187/)

### Inferences
- **The common structure is one verb, a dense layer that pays out, and a finale.** Downwell (one button), Peggle (one shot), Burnout Crash (one drive in, then Aftertouch) and Turbo Dismount (one launch) all give the player one high-leverage input, then let a dense physical system amplify it. NGD maps onto this cleanly: launch (one verb), then light nudging (Aftertouch-style), with the course as the amplifier.
- **How to make chaotic bounces feel fair (applying Peggle and pinball to NGD):**
  1. The player owns the cause. Launch angle and power, plus visible nudges, mean any lucky bounce follows from something the player did.
  2. Lucky outcomes pay out loudly and bad luck is quiet. Peggle's free-ball bucket, Extreme Fever wells and pinball ball-saves are generosity aimed at the bounce. For NGD, add "luck catches": a moving "bag holder" bucket or mattress that rewards rather than punishes, and a safety net (e.g., a Magna-Save-style one-shot "HODL" grab) so a run never dies early to one bad bounce.
  3. A spotlight on decisive moments. Slow-mo plus zoom plus a drum roll on the final impact, and on any bone break that pushes the score over a milestone. Near-misses get a comic "groan" sting, as Peggle does.
  4. Visible probability. Bumpers, multiplier gates and buckets should be readable shapes the player can aim toward, not hidden RNG.
  5. No hidden RNG in the physics. Randomness should come from the course generator and chaotic dynamics, not from dice rolled at collision time, so players feel "I could do that again" (relevant to dailies, see section 3).
- **Downwell's tempo loop is useful for NGD's score multiplier.** Use a "freefall combo": consecutive hits without touching a "floor"/ledge, or without stopping, raise a multiplier. Lose it if Emonad gets stuck on a ledge or rests too long. Set thresholds every ~5 hits with tangible rewards (bigger particles, louder bone cracks, speed). Add an equivalent of "gem high" ("Number Go Down mode" / "capitulation") when the multiplier passes a level. Avoid Downwell's criticised cap: let it keep escalating cosmetically and audibly even if scoring caps.
- **Helix-style "smash-through" momentum** fits the crypto theme. If Emonad falls far enough without contact (a "liquidation cascade"), he smashes through the next breakable floor (chart bar or candle) instead of bouncing. That rewards steering into gaps and creates rhythm: accelerate through gaps, smash, scatter.
- **Burnout Crash junctions as set pieces.** Each zone should have 1-2 handcrafted "junctions": a dense cluster (whale belly, pinball table of red candles, grinding gears of a "liquidation engine") with pickups placed so the player can steer for them (multiplier, "Crashbreaker"-style self-detonation such as a "rug pull" that explodes the area, and a negative "Heartbreaker" equivalent such as a "green candle" that heals and reduces damage score). The negative pickup is a good comic risk/reward element on-theme for "number go down".
- **Turbo Dismount's scoring vocabulary** (impact speed, type, chain-reaction traffic, damage to the vehicle and limbs) maps directly to NGD: damage = impact velocity × body part weight × combo multiplier, plus bonuses for objects destroyed. Make the ragdoll abstract-cartoonish like Secret Exit's figure: bone-break comedy, not gore. That also suits a crypto-meme brand and wider audiences.

### Gaps
- No primary source found for **Rolly Vortex** design (Voodoo); no Voodoo postmortem for Helix Jump. Their design intent is unverified.
- No designer source for **Plinko**-style payout boards beyond Peggle's pachinko lineage.
- Peggle's exact Fever-meter multiplier thresholds (commonly remembered as x2/x3/x5/x10 as orange pegs are cleared) could not be confirmed from a reachable source.
- No primary source on whether Downwell's level chunks are handcrafted pieces assembled procedurally; guides only say "procedural per run, themed per world".
- The Downwell GDC talk itself (GDC Vault) and the PC Gamer "Making of Peggle" article could not be fetched in full.

---

## 2. Pacing a 20-60 second run: escalation, set pieces, zones, speed boosts, rest beats, risk/reward routes, finale ("rock bottom")

### Takeaway
Short runs need a clock that is felt but not punishing, rising intensity in clearly themed zones, brief "breather" beats that do not break the combo, and a guaranteed spectacular ending. Tiny Wings' nightfall clock, Downwell's combo-preserving side rooms, Burnout's slow-mo Impact Time and Peggle's Extreme Fever finale are the templates. For NGD the bottom impact should be the Extreme Fever moment: a crater that converts all accumulated speed into one huge, slow-motion, multiplied damage payout.

### Cited Findings
- Tiny Wings uses nightfall as the run's clock, with speed coins to outrun the night. The run ends when night catches the bird — [TouchArcade review](https://toucharcade.com/2011/02/22/tiny-wings-review/); [App Store](https://apps.apple.com/app/tiny-wings/id417817520)
- Downwell: the design rewards keeping tempo (combo and gem high) and gives side rooms that act as rest areas *without* breaking combo or gem high — [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=1613957513); [Let's Make a Game](https://letsmakeagame.net/downwell-design-review/)
- Helix Jump escalates through narrower gaps, faster rotation, then moving/rotating sections — [Pocket Gamer](https://www.pocketgamer.com/articles/077966/helix-jump-cheats-and-tips-everything-you-need-to-get-high-scores-in-helix-jump/); [PlayPile](https://playpile.gg/games/helix-jump)
- Burnout 3's Impact Time slows the high-speed action to give "post-crash satisfaction" — [Giant Bomb](https://giantbomb.com/wiki/Games/Burnout_3_Takedown)
- Peggle's finale stack: slow-mo zoom, then Fever music, then bonus wells worth 10k-100k, then a visual eruption — [GamesRadar](https://www.gamesradar.com/peggle-10/); [NBC News](https://www.nbcnews.com/id/wbna18221146)
- "Juice it or lose it" (Jonasson and Purho, GDC Europe): applying abundant feedback makes play more fun. Techniques include scaling objects on events, easing and screenshake to show impact — [roblog summary](https://roblog.co.uk/2024/03/juicy-games/); [Game Developer / GameDiscoverCo](https://www.gamedeveloper.com/business/has-your-game-got-juice-more-); [EOLT on game feel](https://eolt.org/articles/game-feel/). Counterpoint: Folmer Kelly's "Don't Juice It or Lose It" warns that juice for its own sake can distract from the goal and cost immersion — [roblog](https://roblog.co.uk/2024/03/juicy-games/)
- Wordle's creator framed a game asking for ~3 minutes a day, with no notifications, as a feature — [WION](https://www.wionews.com/technology/he-made-wordle-for-his-partner-now-its-an-online-hit-442289)

### Inferences
**Proposed run skeleton for NGD (target median ~40 s; tune by playtest):**

| Beat | Time | Content | Purpose |
|---|---|---|---|
| 0. Launch | 0-3 s | Slingshot pull, release, slow-mo "lift-off" frame | Ownership of the run |
| 1. Zone 1 "Red Candles" | 3-12 s | Wide lanes, big friendly bumpers, first multiplier gate, one smash-through floor | Teach nudging by reward, not text |
| Breather | ~1-2 s | Clear shaft, speed ring, coins/"sats" trail, background reveal of the next zone | Rest without losing combo (Downwell side-room logic) |
| 2. Zone 2 "Whale Waters / Falling Bars" | 12-25 s | Moving hazards, falling chart bars, first risk/reward fork | Escalation; first real choice |
| Set piece | ~25 s | Handcrafted "junction": pinball cluster or whale belly | Burnout-style chain-reaction moment |
| 3. Zone 3 "Emo Hell / Liquidation Engine" | 25-45 s | Grinders, hammers, fans, narrow fast shafts, highest multipliers | Peak intensity |
| Finale | final 3-6 s | "Rock Bottom" crater: camera pulls out, slow-mo, drum roll, impact, bone X-ray, Fever-style score wells | Guaranteed spectacular payoff |

- **The run should end on its own clock.** The fall depth is fixed per course, so run length = depth ÷ average speed. Boost rings shorten the run but raise impact velocity, so they are risk/reward ("go faster for a bigger final crater, but less time to collect hits"). This replaces Tiny Wings' "night" with "depth": pacing is bounded and the 20-60 s window falls out of course length plus speed range.
- **Two-lane risk/reward forks in each zone.** The safe lane has fewer hazards and a steady multiplier; the risk lane has grinders, a "Heartbreaker"/green-candle trap and a big multiplier. Telegraph the fork 1-1.5 s ahead (see section 6) so a nudge decides it.
- **Escalation levers, in order:** fall speed → obstacle density → moving hazards → smaller gaps → combined hazards. Change one at a time per zone so each zone has one identity.
- **Rest beats every ~8-12 s.** A short clear shaft with collectibles and a change of zone art. Keep the combo alive across them (Downwell). Use them for a "zone banner" (wordless icon or emoji plus colour shift).
- **Finale design ("Rock Bottom"):**
  - Make the ending deterministic. The run always ends in the crater, even after a bad run, so every run gets the payoff (the Peggle Fever moment happens every run, not only on success).
  - Use a Peggle-style wells/bins floor: 3-5 crater zones with different multipliers ("-50%", "-90%", "-99.9%", "REKT"). The last 1-2 s of nudging is the final skill decision.
  - Use Burnout Impact Time-style slow-mo just before contact. Zoom in, play a drum roll, then on impact: hit-stop, screenshake, bone X-ray overlay, and the score counter "number go down" spinning.
  - Near-miss on the top well gets a comedic groan sting (Peggle's disappointed choir).
  - Show a damage receipt ("hospital bill"/"portfolio loss" breakdown) so the score is legible and shareable.
- **Juice budget:** slow-mo and hit-stop should be rare enough to stay special: the finale, big multiplier crossings and set-piece moments. Constant slow-mo kills pace (Folmer Kelly's warning).

### Gaps
- No published data found on ideal session length for hyper-casual runs or on retention vs run length. The 20-60 s window is the brief's assumption.
- No source found on how many rest beats per minute work well in descent games. The 8-12 s cadence is a proposal.

---

## 3. Procedural vs handcrafted courses; seeded daily courses and why they make leaderboards fair

### Takeaway
Use "procedural assembly of handcrafted chunks" (the Downwell/Spelunky approach: random layout, fixed per-world themes) for endless replay. Add one seeded "Daily Drop" course that is identical for everyone, with its own leaderboard. A shared seed makes leaderboards comparable because everyone faces the same course. A ragdoll's physics chaos still varies per run, so allow multiple attempts (Trackmania-style, best score in 24 h) rather than Spelunky's single attempt, or offer one "ranked" try plus unlimited practice.

### Cited Findings
- Spelunky's Daily Challenge uses a shared seed for all copies (separate seeds for Steam and PS4/PSN). Everyone gets one shot before it rolls over 24 h later, the cave is identical for every player that day, and if you die you wait until the next day — [Game Developer, "The 24-hour ticket: examining daily runs"](https://www.gamedeveloper.com/design/the-24-hour-ticket-examining-daily-runs-); [Spelunky wiki, Daily Challenge Mode (HD)](https://spelunky.fandom.com/wiki/Daily_Challenge_Mode_(HD))
- Each Spelunky daily has its own leaderboard comparing final money and level. The Black Market gambling wheel is locked in the daily so its random outcome cannot affect results — [Spelunky wiki](https://spelunky.fandom.com/wiki/Daily_Challenge_Mode_(HD))
- Critique: The Ludite argued the single-attempt daily is "actually a bad idea" for Spelunky. Because the game is about risk management, one attempt pushes players to overly cautious or extreme play — [The Ludite, "Spelunky: When Scoring Goes Bad"](https://theludite.com/2014/06/23/spelunky-when-scoring-goes-bad/)
- Trackmania's Track of the Day is a daily curated community map released at 19:00 CE(S)T. Players have 24 h and unlimited attempts to set a best time on its leaderboard, and trophy rewards scale down through the top 10,000. A separate "Cup of the Day" knockout opens with a 15-minute seeding time attack. Track of the Day requires a Standard or Club access subscription — [Trackmania docs: What is a Track Of The Day?](https://doc.trackmania.com/play/what-is-totd/); [Wikipedia: Trackmania (2020)](https://en.wikipedia.org/wiki/Trackmania_(2020_video_game))
- Wordle: Josh Wardle said the one-game-a-day cap was the breakthrough because it created scarcity, partly inspired by NYT Spelling Bee leaving players wanting more. He contrasted it with apps that push notifications. Players grew from 90 on Nov 1, 2021 to over 300,000 about two months later — [WION (NYT syndication)](https://www.wionews.com/technology/he-made-wordle-for-his-partner-now-its-an-online-hit-442289); [Boston.com (NYT syndication)](https://www.boston.com/news/national-news/2022/01/04/he-made-wordle-for-his-partner-now-its-an-online-hit/); [Slashdot repost](https://tech.slashdot.org/story/22/01/04/1412258/wordle-is-a-love-story)
- Tiny Wings islands and Downwell layouts are procedurally generated per run, while Downwell worlds keep a fixed thematic pattern — [TouchArcade](https://toucharcade.com/2011/02/22/tiny-wings-review/); [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=1613957513)
- Burnout 3 shipped 100 handcrafted Crash junctions — [Wikipedia](https://en.wikipedia.org/wiki/Burnout_3:_Takedown)

### Inferences
- **Recommended architecture: three modes from one generator.**
  1. **Endless "Free Fall"**: a random seed each run. The generator stitches handcrafted chunks (e.g., 40-80 chunks per zone, each ~1-2 screens tall, tagged by difficulty, type and lane-exit position) in zone order with a difficulty ramp. Handcrafted chunks guarantee readable, funny set ups; procedural order guarantees replay.
  2. **"Daily Drop"**: seed = date (UTC), same for everyone. A leaderboard per day, a shareable Wordle-like emoji result card (e.g., bone icons per zone plus final "-99.9%"). Use the one-a-day scarcity for the share card and streak, not for the play itself.
  3. **Handcrafted "Junctions"/challenge courses** (optional, Burnout-style): fixed levels with star targets for players who want mastery.
- **Attempts policy for the daily.** A ragdoll game has high outcome variance from tiny input differences, so a single attempt mostly measures luck (The Ludite's critique, worse with physics). Recommendation: unlimited attempts with best score counted (Trackmania model), *plus* the first attempt's score shown on the share card as a "first-try" badge (Wordle-style honesty). Alternatively, 3 ranked attempts per day.
- **Why the shared seed makes it fair:** identical obstacles, boosts and multiplier placement mean score differences come from launch, nudging and routing, not from one player getting a richer course. Lock out any per-run RNG that changes payouts in daily mode (Spelunky locked the gambling wheel). Anything random (e.g., which pickup spawns) must come from the seeded PRNG, never `Math.random()`.
- **Determinism caveat (technical, flag for the tech researcher):** a seed makes the *course* identical, but the ragdoll simulation will only replay identically if physics is deterministic across devices and frame rates. Use a fixed-timestep physics step, decoupled from render rate, so 60 Hz vs 120 Hz phones behave the same. If replays or anti-cheat verification are wanted, record inputs and seed and re-simulate server-side. That only works with a physics engine that guarantees cross-platform determinism. I did not research engine support in this pass.
- **Anti-cheat for a free browser leaderboard:** a client-reported score is trivially forgeable. Seed plus input-log replay validation is the standard approach, and it is another reason to keep physics deterministic. Not researched here.
- **Endless variety without content bloat:** vary per-run "modifiers" (wind direction, zone order permutation, a "bull trap" bonus zone) instead of only re-shuffling chunks.

### Gaps
- Could not fetch the Game Developer "24-hour ticket" article in full (DNS failure), so its full list of examples and arguments (e.g., Crypt of the NecroDancer, Binding of Isaac dailies) is missing.
- No source found on cross-device physics determinism for browser JS physics engines (Rapier/Box2D/Matter.js) in this pass.
- No data found on daily-mode retention impact for mobile/browser games.

---

## 4. Slingshot launch UX on touch: pull-back, aim preview, power curve, cancel, portrait layout, and how much skill goes in the launch vs the fall

### Takeaway
Use Angry Birds' mental model (pull back opposite to the launch direction, release to fire, distance = power). Make it modeless (drag can start anywhere, not only on the tiny slingshot), show only a short initial trajectory preview, and make "drag back to the start point and release" a cancel. In portrait with the slingshot at the top, "pull up to fling down" is the natural mapping, done with a relative drag from wherever the thumb rests. The launch should decide entry lane and initial speed (a meaningful but small share of score). Most skill and comedy should live in the fall.

### Cited Findings
- Angry Birds: the player drags to set angle, and power comes from how far the slingshot is pulled back. Lifting the finger launches the bird — [player guide (low-authority)](https://elearning.midasuser.com/?p=31309)
- Angry Birds Space: while pulling back, a dotted line shows "exactly what the initial trajectory looks like", curving if the path passes a gravity well — [Computerwoche review](https://computerwoche.de/a/angry-birds-space-review-an-amazingly-fun-innovative-take-on-the-familiar-game,2511007)
- Implementation: the dots are the projectile motion equation evaluated at discrete times, i.e., a parabola if air resistance is ignored — [Unity Discussions](https://discussions.unity.com/t/angry-birds-dotted-trajectory-for-the-slingshot/103819); [GameDev.net](https://gamedev.net/forums/topic/715283-aiming-feature-like-angry-bird/)
- A developer write-up describes a "modeless drag-back throw": the pull can start anywhere on screen, with a *minimum launch strength* so short pulls still produce a usable flick rather than an unfireable shot — [GitHub: SAFEtrace PR #4, "The slingshot as a gesture: pull back from where you are"](https://github.com/scottyfncodes/SAFEtrace/pull/4) (individual developer, low authority but directly on point)
- A small web slingshot game notes the pull-then-release flow "seems weird at first, but soon becomes second nature" — [Shot Sling on itch.io](https://pixel-pheonix.itch.io/shot-sling)
- General drag UX on mobile: give a haptic "bump" on grab, make interactions feel like physical movement, and use shadow/elevation to show the dragged object is "picked up" — [Smart Interface Design Patterns: Drag-and-drop UX](https://smart-interface-design-patterns.com/articles/drag-and-drop-ux/)
- Turbo Dismount's launch speed is reportedly set on a moving bar (timing-based power), before the crash plays out — [Pocket Gamer review](https://www.pocketgamer.com/turbo-dismount/review/) / [Wikipedia](https://en.wikipedia.org/wiki/Turbo_Dismount) (excerpt attribution uncertain)

### Inferences
**Recommended launch spec for NGD (portrait):**
- **Layout:** Emonad hangs in an emo slingshot (barbed-wire/black-heart band) in the top ~25% of the screen, with the hellish pit opening below. The fling goes *downward* into the descent.
- **Gesture: relative "pull up to fling down".** Touch anywhere in the lower two-thirds (the thumb zone, see section 6), then drag *up* and to the side. The band stretches proportionally on screen and Emonad is pulled up and back, so the on-screen pull mirrors the thumb's motion. Launch vector = opposite of the drag vector (pull up-left → fling down-right). This keeps the Angry Birds "pull back" model while the thumb never has to reach the hard-to-reach top of the screen where the slingshot is drawn.
  - Alternative to playtest: *direct* "flick down" (swipe in the launch direction). It is more intuitive for touch-native players but loses the satisfying tension of a pull-back. Pull-back is the brand moment (the emo slingshot), so default to pull-back.
- **Power curve:** non-linear (ease-out). The first ~30% of drag distance gives ~50% power, so casual short pulls still feel strong. A minimum power floor (as in the SAFEtrace pattern) avoids wimpy launches, and a max-power "overpull" zone gives a slight visual tremble and haptic tick. Cap drag distance at ~35-40% of screen height so full power is reachable one-handed.
- **"Perfect launch" sweet spot (optional skill layer):** a small band near max power or a pulsing timing ring (cf. Turbo Dismount's moving bar) gives a speed bonus and a "PERFECT" sting. Keep the bonus modest (e.g., +10% initial speed) so the fall dominates.
- **Aim preview:** show a short dotted arc covering only the first ~0.4-0.6 s of flight (as Angry Birds Space shows the "initial trajectory"), fading out. It should reach the first bumper cluster or entry gate, never the whole course. A short preview teaches the aim-to-lane link while keeping the descent unpredictable and funny.
- **Cancel:** dragging back within a dead-zone radius of the touch-down point (e.g., ~40 px) and releasing cancels with a "boing" and the band relaxing. Also make sure an accidental tiny tap does not launch (use the same dead-zone).
- **Feedback during the pull:** band stretch with a creaking SFX that rises in pitch with power, Emonad's face going from bored to panicked as power rises (comedy), a light haptic tick at power thresholds (where the browser supports it), and a slow-mo first 0.2 s after release.
- **Skill split (recommendation):** launch ≈ 15-25% of score variance, fall steering and routing ≈ 50-60%, physics luck ≈ 20-30%. The launch picks the entry lane and initial speed (it can set up the first chain reaction, like the angle and speed into a Burnout junction). Keep the launch under ~3 s so replays stay fast. One-tap "re-fling" from the results screen with the last aim remembered (ghost band) speeds up retries.
- **Daily mode:** the same launcher and course for everyone. The launch becomes a known "opening move" players can study and share, which adds skill depth without adding controls.

### Gaps
- No authoritative source (GDC talk, Rovio postmortem) found on Angry Birds' preview length, cancel behaviour or power curve. The cancel and power-curve specs above are proposals.
- Could not confirm from a reachable source the widely remembered Angry Birds feature that shows the *previous* shot's trail (white puffs). Not cited.
- No source found comparing pull-back vs flick launch on portrait phones.

---

## 5. One-finger touch steering for a falling ragdoll: relative drag vs tilt vs screen halves vs virtual stick; how much control to give

### Takeaway
Use a relative horizontal drag (a "floating" one-axis stick from wherever the finger lands) that applies a capped lateral force to the ragdoll's torso/pelvis only, never to the limbs. That is Burnout's Aftertouch or Skate's bail-steering: steer the *wreck*, not the body. The limbs stay fully physical and floppy, so the comedy survives, while the centre of mass responds predictably enough to feel like skill. In Foddy's terms, the input should do "exactly what you ask" at the micro level, with the chaos coming from the physics. Offer tilt as an opt-in option, not the default.

### Cited Findings
- Burnout 3 Aftertouch: after a crash, a button press enters slow-motion Impact Time and the player steers the wreck with the D-pad/stick. Hitting cars earns points and boost, and a resulting Takedown negates the crash penalty — [Game Revolution](https://www.gamerevolution.com/review/33575-burnout-3-takedown-review); [Wikipedia](https://en.wikipedia.org/wiki/Burnout_3:_Takedown)
- Skate 2/3 Hall of Meat: you trigger a bail, then steer the skater's body mid-air into objects and surfaces to raise the injury score. Body parts have different point values, combos and objectives add multipliers, and the score is framed as a "hospital bill: the more bones you break, the better". Hall of Meat was introduced in Skate 2 — [Bit-tech Skate 2 preview](https://bit-tech.net/reviews/gaming/xbox/skate-2-hands-on-preview/4/); [Ludo.guide Skate 3](https://www.ludo.guide/guide/skate-3/side-quests-activities/hall-of-meat); [Wikipedia: Skate (series)](https://en.wikipedia.org/wiki/Skate_(series)). The newer live-service *skate.* was reported launching without a full Hall of Meat, and fans noticed its absence — [Inverse](https://www.inverse.com/gaming/skate-15million-fan-favorite-feature-hall-of-meat) (status may have changed by Oct 2026; not re-verified)
- QWOP maps thighs to Q/W and calves to O/P. That literal body mapping makes it very hard, and the failures are the comedy. Getting Over It differs: Foddy says "at least on a micro level, the character is doing exactly what you're asking him to do at all times", so the difficulty comes from physics, not unresponsive input. Foddy frames frustration as deliberate but always within the player's power to overcome — [Jesper Juul interview with Foddy](https://jesperjuul.net/handmadepixels/interviews/foddy.html); [Google Design: Foddy interview](https://design.google/library/bennett-foddy-getting-over-it-interview); [Expert Reviews interview](https://www.expertreviews.co.uk/games/8032/bennett-foddy-interview-the-game-changer/2) (quotes from search excerpts; which interview holds which quote not verified)
- Human: Fall Flat's clumsy controls are described as a deliberate choice by No Brakes Games, with the frustration part of the joke — [XboxAddict review](https://xboxaddict.com/Staff-Review/13947/Human:-Fall-Flat.html) (review, not a developer source)
- Downwell maps jump and shoot to one button to suit a portrait phone — [Thumbsticks](https://www.thumbsticks.com/gdc-2016-ojiro-fumoto-on-polishing-downwells-gun-boots/)
- Alto's Adventure and Tiny Wings are one-touch (tap/hold) and playable one-handed — [AppUnwrapper](https://appunwrapper.com/2015/02/19/altos-adventure-review/); [TouchArcade](https://toucharcade.com/2011/02/22/tiny-wings-review/)
- **Tilt vs touch research (York University, MacKenzie lab and others):**
  - In a *Bit.Trip Beat* study, touch gave better gameplay statistics, but tilt was better received. Tilt-preferrers found it more challenging and engaging, while touch-preferrers valued simplicity. Tilt showed a substantial learning effect, touch only a small one — [Medryk & MacKenzie, "A Comparison of Accelerometer and Touch-based Input for Mobile Gaming"](https://www.yorku.ca/mack/mhci2013h.html)
  - In a tilt study, 83.3% of participants chose velocity-control over position-control even though they performed better with position-control, citing its natural, physics-like mapping — [York University, "Tilt-Controlled Mobile Games: Velocity-control vs. Position-control"](https://www.yorku.ca/mack/ieeegem2014a.html)
  - In a point-and-shoot study, tilt and AR gave more enjoyment and immersion than touch, but touch "caused fewer nuisances and was playable under more varied situations" — [ResearchGate: Evaluating Controls for a Point and Shoot Mobile Game](https://www.researchgate.net/publication/275517770_Evaluating_Controls_for_a_Point_and_Shoot_Mobile_Game_Augmented_Reality_Tilt_and_Touch)
  - For a dual-analog shooter, participants preferred touch, with tilt-movement plus touch-aim a close second — [Tilt-Touch synergy (Entertainment Computing 2017)](https://www.yorku.ca/mack/ec2017.pdf)
  - Caveat from the same body of work: small samples and varied prototypes, so the results are indicative

### Inferences
**Comparison of steering schemes for NGD:**

| Scheme | Pros | Cons | Verdict |
|---|---|---|---|
| **Relative horizontal drag** (touch anywhere; offset from touch-down point = steer amount) | Analog, one finger, no fixed UI to cover the view, works for any hand size and grip, "playable under varied situations" | Needs a small dead-zone and clamp; first-time players must discover it | **Default** |
| Absolute "follow finger" (Emonad drifts toward the finger's x) | Very intuitive, zero learning | Finger covers the character; with physics, steering becomes "teleport" and kills floppiness | Use only as an accessibility option |
| Left/right screen halves (hold to push) | Simplest; good for one-handed bottom-of-screen taps | Binary, not analog; less expressive "nudge" skill; a thumb on the centre line is ambiguous | Option for accessibility |
| Tilt (DeviceOrientation) | Engaging and physical (tilt-preferred in studies); velocity-control feels natural (83% chose it) | Performance and learning cost; awkward on a bus or in bed; iOS browsers require a permission prompt (general knowledge, not verified this pass) | **Opt-in toggle** |
| Virtual stick | Familiar to gamers | Occludes view; overkill for one axis; worse discoverability in hyper-casual | Avoid |

**How much control (keep it floppy *and* skilful):**
- **Steer the centre of mass, never the limbs.** Apply lateral force to the pelvis/torso rigid body only, so arms and legs trail, flail and snag. That preserves the ragdoll comedy (Turbo Dismount, Human Fall Flat) while the player feels Aftertouch-style agency (Burnout, Skate).
- **Velocity control with a cap.** Map drag offset to target lateral velocity (velocity-control was preferred in the tilt study), with a max lateral acceleration well below gravity (proposal: ~0.25-0.4 g). Momentum must still matter: a bumper hit should overpower steering for ~0.2-0.4 s ("you're along for the ride") before control returns. This is the key tuning dial between QWOP (too little control) and an arcade sprite (too much).
- **Never touch rotation directly.** Let spin come from collisions. Optionally, a quick double-flick could add a "tuck" (pull limbs in to spin faster or slip through gaps) as an advanced verb; keep it out of onboarding.
- **Short slow-mo "aftertouch windows".** Just before a set-piece junction or the final crater, auto-enter ~0.5 s of Impact-Time slow-mo where steering is extra-effective. That puts a skill spotlight on the moments that decide big scores (Burnout Impact Time, Peggle final-peg zoom).
- **Make the input feel exact even if the body isn't (Foddy's Getting Over It principle).** Show a subtle velocity arrow or "wind trail" on Emonad's torso so the player sees their nudge registered, even when a limb catches and spins him.
- **Assisted targeting, hidden:** a slight magnetism toward multiplier gates and boost rings within a small radius (proposal: ~0.5 body widths) improves perceived skill without removing chaos. Never apply it in daily ranked mode, or apply it identically for all players.
- **Comedy from failure:** being bounced the "wrong" way should still score damage, so steering mistakes are funny, not frustrating (Foddy: frustration should stay within the player's power to overcome).
- **Haptics (where supported):** a short vibration on bone break or heavy impact reinforces physicality. Browser vibration support is uneven across platforms (not verified this pass), so treat it as an enhancement.

### Gaps
- No primary developer source found for Gang Beasts or Human: Fall Flat control rationale. Only reviews.
- No source found on Skate's exact bail-steering force model or on Alto's Odyssey-specific control changes.
- No published research found specifically on "relative drag" vs "screen halves" steering for falling or endless games; the comparison table is reasoning.
- iOS Safari motion-permission requirements and browser vibration support were not re-verified in this pass. Check them in the tech/platform research.

---

## 6. Portrait phone UX: thumb zones, camera framing for a fall, readability of incoming obstacles at speed, onboarding in under 5 seconds with no text

### Takeaway
Keep all input in the lower-middle of the screen. Hoober's data says one-handed use is the most common grip, though centre-screen touches are also fast and accurate, and gestures should start anywhere. Frame Emonad in the upper third so about two-thirds of the screen shows what is coming. Pull the camera back as speed rises and telegraph off-screen threats at the bottom edge. Onboard with a looping ghost-hand demo of the pull-and-release, then reward the first nudge, with no words.

### Cited Findings
- Steven Hoober observed 1,333 people (Nov 2012-Jan 2013): 49% held the phone one-handed, 36% cradled it in one hand and tapped with the other hand's thumb or finger, and 15% used two hands. Secondary sources disagree slightly on the split — [Monterail summary](https://www.monterail.com/blog/thumb-friendly-navigation-word-oriented-design); [UX Planet](https://uxplanet.org/mobile-usability-made-simple-945e106e23eb); [A List Apart grip figure](https://alistapart.com/1-2-phone-grips-jpg/)
- The thumb-zone map shows easy, stretch and hard-to-reach regions, with easy reach roughly bottom-centre. Hoober later qualified it: people view and touch the centre of the screen most often, accurately and quickly, and his early zone diagrams were misread as rigid constraints — [Parachute Design](https://parachutedesign.ca/blog/thumb-zone-ux/); [Addy Osmani, Modern Touch-Friendly Design](https://addyosmani.com/blog/touch-friendly-design/)
- Touch target sizes: Apple HIG minimum hit target 44×44 pt. NN/g is commonly cited at ~1×1 cm. WCAG 2.2 AA minimum is 24×24 CSS px, and the older AAA criterion 2.5.5 is 44×44 CSS px — [Adrian Roselli, Target Size and 2.5.5](https://adrianroselli.com/2019/06/target-size-and-2-5-5.html); [UXPin](https://uxpin.com/studio/blog/responsive-design-touch-devices-key-considerations/); [OpenReplay](https://blog.openreplay.com/improving-tap-targets-mobile-ux/) (Apple and NN/g figures via secondary sources; primary pages not reachable)
- Downwell was designed for a portrait phone with one button for jump and fire — [Thumbsticks](https://www.thumbsticks.com/gdc-2016-ojiro-fumoto-on-polishing-downwells-gun-boots/)
- Juice techniques for impact readability: scale pops on events, easing and screenshake — [roblog summary of "Juice it or lose it"](https://roblog.co.uk/2024/03/juicy-games/)

### Inferences
**Camera framing for a portrait fall:**
- Put Emonad's vertical position at ~28-35% from the top of the viewport, so ~65% of screen height is look-ahead. Shift him up as speed rises (more look-ahead at higher speed).
- **Speed-linked zoom-out:** widen the field of view (zoom out 10-25%) as fall speed rises, so the *time* of warning stays roughly constant (proposal: ≥0.8-1.0 s of visible lead time before an obstacle reaches Emonad). Snap back in for slow-mo moments and the finale.
- **Horizontal framing:** keep the course width ≤ the screen width at base zoom, with no horizontal scrolling. In portrait, side-scrolling hides threats. Use soft lateral camera follow only if a set piece is wider.
- **Smoothing:** critically damped vertical follow, with no lag at high speed (lag reduces look-ahead). Rotate the camera only for set-piece drama, never during normal play (motion comfort).

**Readability at speed:**
- Use a strict colour-and-shape grammar: hazards (grinders, hammers, spikes) in red/black with spiky silhouettes; friendly bounce items (bumpers, trampolines) rounded with glowing rims; boosts as chevrons or rings; multipliers as gates with big numerals. Crypto-red can't mean both "good" and "bad". Since red candles are the theme, make *damage-giving* (score-positive) objects the red ones and give "Heartbreaker" traps a distinct green ("green candle = bad for score").
- **Off-screen telegraphs:** an edge marker at the bottom edge (arrow plus icon) ~1-1.5 s before an obstacle scrolls into view, especially for moving hazards and forks.
- **Parallax restraint:** background layers (emo hell, falling chart bars) desaturated and darker than the gameplay layer; motion blur only on the background.
- **Speed lines and vignette** carry the sense of speed without moving the gameplay layer faster than is readable.

**Input placement:**
- No buttons during the fall. The whole screen is a gesture surface, so a drag can start anywhere, best near the bottom-centre where thumbs rest.
- Pause/menu: a small but ≥44 pt target in a top corner, deliberately out of thumb reach so it is not hit by accident; respect the notch/home-indicator safe areas.
- Results screen: a big "Fling again" button (≥ 1/3 screen width, bottom-centre, in the thumb zone). Share and leaderboard secondary, above it.

**Onboarding in under 5 s, no text:**
1. 0-1.5 s: Emonad sags in the slingshot. A ghost hand appears at the bottom-centre, drags up (the band stretches with a dotted arc), and releases, looping until touched.
2. The player's first pull: make the first launch nearly impossible to "fail" (generous power floor, wide entry funnel).
3. ~2-4 s: the first time a big friendly bumper or boost ring is slightly off-centre, show a ghost hand sliding left/right with a pulsing arrow. Pause or slow time a little (to ~0.5×) until the player moves a finger, then resume. The ring pays out immediately (sound, multiplier pop), teaching "nudge = reward".
4. Teach everything else (forks, traps, combos) by the course, not prompts, in order of first appearance (Downwell: one mechanic, built around).
5. Persist "tutorial seen" per viewer (browser storage, failure-tolerant). The ghost hand returns only if the player does not steer for ~5 s.

### Gaps
- Could not reach Hoober's original UXmatters articles or Apple's HIG / NN/g pages directly. Figures are via secondary summaries.
- No source found on recommended look-ahead time or camera framing ratios for vertical fallers. The numbers above are proposals for playtest.
- No research found on wordless onboarding effectiveness for hyper-casual web games.

---

## 7. Obstacle and interactable catalogue: what each does for score and comedy

### Takeaway
Every interactable should do at least one of: (a) add damage/score, (b) change speed or direction, so the player has a reason to steer, (c) create a comedic body reaction (stretch, spin, splat, smash-through). The best items do all three. The precedents are Turbo Dismount's walls, ramps and turbo pads; Burnout's multipliers, cash, boost, Crashbreaker and the negative Heartbreaker; pinball's bumpers, flippers and ball-save magnets; Peggle's buckets and Fever wells; and Skate's per-body-part injury values.

### Cited Findings
- Turbo Dismount: placeable brick walls, ramps and turbo pads. Bowling pins, big ramps and palm trees increase damage and points. Score is collision type and speed, plus traffic, vehicle damage and limbs — [Pocket Gamer review](https://www.pocketgamer.com/turbo-dismount/review/); [Wikipedia](https://en.wikipedia.org/wiki/Turbo_Dismount) (excerpt attribution uncertain)
- Burnout 3 Crash junction pickups: cash bonus, score multiplier, speed boost, instant Crashbreaker, and the negative Heartbreaker that lowers score — [Wikipedia](https://en.wikipedia.org/wiki/Burnout_3:_Takedown)
- Skate Hall of Meat: body parts carry different point values, with multipliers from combos/objectives — [Ludo.guide](https://www.ludo.guide/guide/skate-3/side-quests-activities/hall-of-meat); [Bit-tech](https://bit-tech.net/reviews/gaming/xbox/skate-2-hands-on-preview/4/)
- Pinball: Magna-Save outlane magnet, drain-prone lower playfield for pacing — [Wikipedia: Black Knight](https://en.wikipedia.org/wiki/Black_Knight_(pinball))
- Peggle: moving free-ball bucket and the Extreme Fever scoring wells (10k-100k) — [Wikipedia: Peggle](https://en.wikipedia.org/wiki/Peggle); [GamesRadar](https://www.gamesradar.com/peggle-10/)
- Helix Jump: breakable platforms and danger segments; free-fall momentum breaks through — [PlayPile](https://playpile.gg/games/helix-jump); [Pocket Gamer](https://www.pocketgamer.com/articles/077966/helix-jump-cheats-and-tips-everything-you-need-to-get-high-scores-in-helix-jump/)

### Inferences
**Catalogue with NGD theme skins.** All scores are relative. Tune them so the final crater is ~25-40% of a typical run's score, so mid-run play matters but the finale stays the payoff.

| Interactable | NGD skin (crypto/emo) | Mechanical role | Score role | Comedy role | Notes / zone |
|---|---|---|---|---|---|
| Pop bumper | "Red candle wick" or spiked black-heart bumper | Strong radial kick, small damage | Steady damage plus combo tick | Pinball "boing", limbs whip | Zone 1 staple; teach steering |
| Slingshot kicker (pinball side kicker) | Diagonal "short-squeeze" pad | Fast sideways redirect | Small damage | Sudden comedic change of direction | Lane walls |
| Spinner | "Mining rig fan" / pentagram wheel | Spins Emonad; transfers angular momentum | Damage per rotation | Cartoon helicopter-limb spin | Mid zones |
| Grinder/gears | "Liquidation engine", "rekt rollers" | Holds and chews briefly, then spits out | High continuous damage; risk of slowing (time cost) | Crunch SFX, X-ray flashes | Risk lane, Zone 3 |
| Trampoline | Emo mattress / "bounce pad" | Vertical rebound, slows descent | Small damage; resets fall-speed combo (trade-off) | Big stretchy limbs | Teaches risk: bounce vs speed |
| Boost ring | Green "pump" rings, ironic "to the moon" arrow pointing down | Adds downward speed | Raises impact velocity, so later hits are bigger; shortens run | Whoosh, speed lines, Emonad's hair flaps | Lines of rings as "racing line" guides |
| Breakable glass/planks | Chart bars, exchange "floor" glass, frozen-withdrawal panels | Break above a speed threshold, else bounce | Smash bonus; chains if several broken in a row (Helix-style) | Shatter plus body flying through | Rewards building speed |
| Pinball flippers (automatic) | Whale fins / "paper hands" flippers | Timed swats that fling Emonad back up or sideways | Big hit damage; extends run | Slapstick swat | Set-piece junctions; auto-timed (no extra button) |
| Conveyor belt | "Order book" belt | Lateral transport across a ledge | Low damage; positions for the next hit | Ragdoll faceplant while being carried | Use sparingly; can feel like loss of control |
| Moving hammer/pendulum | "Ban hammer", "SEC gavel" | Big timed hit; can block a lane | Very high single-hit damage | Huge comedic launch | Telegraph swing; risk lane |
| Wind fan | "FUD fan" / exhaust vents | Lateral or upward push zone | Indirect: sets up hits | Floaty flailing | Good for forks; visible particles |
| Multiplier gate | "x2 leverage", "x10 leverage", "100x" gate | Pass through to multiply subsequent damage for N s or until next floor | Core score lever | Number pops, sting | Placed off the safe line = risk/reward |
| Negative pickup ("Heartbreaker") | Green candle / "bull trap" / "stablecoin" | Heals Emonad or cuts multiplier | Negative score | Groan sting, Emonad looks briefly happy (and that's bad) | Theme joke: number going *up* is bad |
| Bucket/catch (Peggle bucket) | Moving "bag holder" bag | Catching it gives a bonus or a second-chance launch | Bonus | Emonad stuffed into a bag | Luck-generosity device |
| Safety magnet (Magna-Save) | "HODL hand" grab | One-shot rescue from a dead-end/stuck spot | Preserves combo | Comic yank | Stops runs from stalling; once per run |
| Self-detonation ("Crashbreaker") | "Rug pull" | Player-triggered or pickup-triggered blast after N hits | Area damage to breakables nearby | Big explosion, slow-mo | Set-piece finisher; triggered by a tap |
| Whale (moving set piece) | Giant whale swallowing and spitting | Long hold then strong ejection | Large damage, cinematic | Swallow gag | Zone 2 set piece |
| Falling chart bars | Red bars crashing down | Moving crushers / platforms that break under him | Damage if struck at speed | Comic crush | Zone 2-3 hazard |
| Final crater wells | "Rock Bottom": -50%/-90%/-99%/REKT bins | Final steer into bins | Final multiplier on accumulated speed and damage | Slow-mo, X-ray, bone count, crater | Always present (guaranteed payoff) |

**Scoring model (proposal):** damage per contact = f(relative impact speed) × body-part factor (head/spine high, limbs low, as in Skate) × active multiplier. Bone-break events at thresholds trigger an X-ray flash, crunch and a "-$X" popup. Running total shown as a falling "portfolio value" / "NUMBER" ticker (brand joke: the number going down *is* winning). Bonuses for objects destroyed (Turbo Dismount/Burnout), plus a combo for consecutive contacts without a "stall" (Downwell).

**Comedy rules:** (1) every hit has a distinct sound plus a body-reaction class (boing, crunch, splat, shatter, swallow); (2) Emonad's face reacts (bored, then panic, then dazed, then emo-content at rock bottom); (3) rare, surprising events (a whale swallow, a ban hammer home run) are the "clip moments" for sharing; (4) keep it cartoon/abstract (the Secret Exit "abstraction of a human figure" principle) to stay brand-safe.

### Gaps
- No source found quantifying the score/comedy contribution of each obstacle type in shipped games. The catalogue roles are design reasoning grounded in the precedents above.
- No source found on conveyor belts and wind fans in descent games specifically.
