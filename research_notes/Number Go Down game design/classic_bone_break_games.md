# Classic "bone-break" and crash-for-score games: scoring, combos, presentation, sharing

Research notes for "Number Go Down" (a slingshot-launched ragdoll falling through a vertical hell, scored on the damage he takes). Current as of 14 Oct 2026.

**How to read these notes**
- **Trust tags.** Each finding carries one. [Press/official] means a review, press piece, manual or store page. [Wiki] means a fan or encyclopedia wiki. [Datamine] means numbers pulled from game files by fan modders: specific and checked against footage, but not official EA data. [Forum] means player posts. [AI-src] means an AI-generated encyclopedia page, so low trust.
- **Method limits.** The shared web-search budget ran out partway through, and direct page fetches failed for almost every domain except GitHub. Many findings therefore rest on search-result digests of the cited pages rather than full reads. The Skate 3 numbers are the exception: I read the source files of a fan datamine repo directly.
- **Unverified recall.** Each Gaps section ends with a list of facts from memory that could not be checked in this session. Treat these as leads to verify, not as facts.

**Release years (verified where cited)**
- **Skate.** Skate in 2007 ([Wikipedia series](https://en.wikipedia.org/wiki/Skate_(series))), Skate 3 in 2010 ([bit-tech](https://www.bit-tech.net/news/gaming/skate-3-gets-reprint-due-to-youtube-popular/1/), [eBay listing title](https://www.ebay.com/p/78357966)), and skate. (Full Circle/EA, free-to-play) in early access in 2025 ([Skate wiki](https://skate.fandom.com/wiki/Skate._(2025))).
- **Burnout.** Burnout 3: Takedown in 2004 ([MobyGames](https://www.mobygames.com/game/14831/burnout-3-takedown/)) and Burnout Revenge in 2005 ([Slashdot review, Sept 2005](https://games.slashdot.org/story/05/09/28/0343256/review-burnout---revenge)). Danger Zone, a Crash Mode spiritual successor by Three Fields Entertainment, came out on 30 May 2017 ([Metacritic](https://www.metacritic.com/game/danger-zone/)).
- **Dismount.** Stair Dismount (Porrasturvat) in 2002, Truck Dismount (Rekkaturvat) in 2003 ([MobyGames](https://www.mobygames.com/game/10966/porrasturvat-stair-dismount/), [MobyGames](https://www.mobygames.com/game/10954/truck-dismount-rekkaturvat/)), and Turbo Dismount in 2014, in early access; MobyGames lists 2014 releases on Browser, Windows and Mac (from a search digest; the MobyGames URL was not captured) ([Wikipedia](https://en.wikipedia.org/wiki/Turbo_Dismount)). Turbo Dismount 2 entered early access on 23 Jan 2025 and reached 1.0 on 13 Mar 2026 ([Steam](https://store.steampowered.com/app/2280350/Turbo_Dismount_2/), [Dismount wiki](https://dismount.fandom.com/wiki/Turbo_Dismount_2), [PCGamingWiki](https://www.pcgamingwiki.com/wiki/Turbo_Dismount_2)).
- **Pain.** PS3/PSN, 2007 ([Metacritic "PAIN (2007)"](https://www.metacritic.com/game/pain-2007/)).
- **FlatOut.** FlatOut in 2004 ([MobyGames](https://www.mobygames.com/game/15632/flatout/)) and FlatOut 4: Total Insanity in 2017 ([Eggplante](https://www.eggplante.com/2017/05/05/flatout-4-total-insanity-brings-racing-ragdoll-physics-comedy-to-consoles/)).
- **"Porta Dismount".** I found no source for a game of this name. It is most likely a garbling of "Porrasturvat", the Finnish title of Stair Dismount.

---

## 1. How was damage turned into a score? (per bone, per impact force, combos, multipliers, chains, style bonuses)

### Takeaway
The best systems score in two layers. The first is a **per-body-part damage table**: each part has tiered thresholds by impact strength and pays fixed points per tier, and hits spread to linked parts. The second is a set of **"how spectacular was the whole event" metrics**: bail duration, drop height, airtime, speed, rotation, cars or pedestrians hit. Each metric runs through a hand-tuned curve that is steeply convex near the top.

Burnout instead turned damage into **dollars**, with multipliers and a second-stage detonation (the Crashbreaker). Dismount games multiply damage points with a multiplier fed by spectacle (flips, sustained crushing).

Skate 3's datamined table is the most concrete public model of the genre. It pays the most for the groin, skull and neck, at the lowest impact thresholds, which is a comedic design choice.

### Cited Findings

#### Skate / Skate 2 / Skate 3 "Hall of Meat" (EA Black Box, 2007–2010)

- **Series definition [Wiki].** The "Hall of Meat" is an injury system that tracks wipeout damage, especially broken bones, and some challenges depend on it. — [Wikipedia: Skate (series)](https://en.wikipedia.org/wiki/Skate_(series))
- **Skate 2 scoring [Wiki].** Skate 2 expanded the mode into a numbered scoring system rewarding bail length, rolls and hits, and some goals require breaking bones. — [Skate Fandom: Hall Of Meat](https://skate.fandom.com/wiki/Hall_Of_Meat) (via search digest)
- **Skate 3 scoring is per challenge [Wiki].** Skate 3 "changed the HoM system slightly, with the scoring system being removed from each and every bail. Instead, there are now HoM objectives." — [Neoseeker Skate Wiki](https://skate.neoseeker.com/wiki/Hall_of_Meat) (via search digest). This fits the datamine below: Skate 3 still has a full HoM scoring HUD, but it runs inside HoM challenges and the "Hall of Meat Battle" mode, not on every bail.

**Skate 3 datamine.** Source: a fan repo that unpacked Skate 3's Xbox 360 files (attribute vaults, Lua turn logic, HUD bytecode) to rebuild Hall of Meat as a mod for skate. (2025). The author says the numbers "match the video exactly" and gives HUD readings that check out against the curves (7.10 s of bail read 7,750 pts; 31.5 m of drop read 5,740; 65.5 km/h read 6,383). I re-derived the bail and speed examples from the curves and they match. — [HOM-FINDINGS.md](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md), [hom_core.cpp](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/source/hom_core.cpp)

- **Damage model structure [Datamine].** There are **25 body parts**:
  - 0 skull
  - 1 head joint
  - 2–5 left arm (hand, forearm, upper arm, shoulder)
  - 6–9 right arm (same four)
  - 10 chest
  - 11–13 spine (ribs, middle, lower)
  - 14–17 left leg (toes, foot, calf, thigh)
  - 18–21 right leg (same four)
  - 22 pelvis, 23 neck, 24 groin

  Each part has **4 links {part, share}** and **6 damage-level slots {points, impact}**. A hit reaches every level whose impact it meets, and each linked part takes its share of the hit (one step of propagation). Shares are 0.125, 0.25, 0.5 or 1.0; for example, the neck passes 1.0 to the skull and the groin passes 1.0 to the pelvis. — [hom_core.cpp](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/source/hom_core.cpp)
- **Points per damage tier [Datamine].** Format is points@impact threshold; units are unstated, probably impact speed. — [hom_core.cpp](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/source/hom_core.cpp)

  | Part | Tiers (points@impact) |
  |---|---|
  | Skull | 500@7, 1,000@14, 5,000@21 |
  | Neck | 500@6, 1,000@12, 5,000@20 |
  | **Groin** | **1,000@3, 2,500@5, 5,000@7, 10,000@14** (the highest payout at the lowest thresholds of any part) |
  | Hands | 100@6, 250@9, 500@12, 750@15, 1,000@18 |
  | Forearm / upper arm / shoulder | 100@9 … 1,000@21 |
  | Ribs / mid / lower spine | 250@7, 500@10, 1,000@15, 2,000@25 |
  | Pelvis | 250@7, 500@10, 750@16, 1,000@19, 2,000@25 |
  | Toes / feet | 100@7 … 1,000@19–22 |
  | Calves / thighs | 100@10 … 1,000@22 |
  | Head joint (1), chest (10) | 0 points; they only pass shares on |

- **Damage tier names [Datamine].** The executable contains the strings ID_HOM_BRUISED, SCRAPED, SPRAINED, DISLOCATED and BREAK. Their mapping onto the six slots is not recovered. — [HOM-FINDINGS.md](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md)
- **Event-metric score curves [Datamine].** Each is an 8-point piecewise-linear curve. — [hom_core.cpp](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/source/hom_core.cpp)
  - **Bail time:** <5 s = 0; 5 s→750, 5.25→1,250, 5.5→2,500, 6→5,000, 8→10,000, 9 s→15,000. Note the cliff: the jump from 5 s to 6 s is worth 6.7x.
  - **Drop height:** <7 m = 0; 7 m→750, 10.5→1,250, 17.5→2,500, 30→5,000, 40 m→10,000 (cap).
  - **Airtime:** <1.5 s = 0; 1.5 s→750, 2→1,250, 2.5→2,500, 3→5,000, 3.1 s→10,000 (cap).
  - **Body rotation:** <720° = 0; 720°→750, 1,080→1,250, 1,800→2,500, 2,520→5,000, 3,240→10,000, 3,500°→15,000.
  - **Bail speed:** <10 m/s = 0; 10→750, 12.5→2,500, 17.5→5,000, 20 m/s→10,000 (cap).
- **Bonus categories [Datamine].** Bonuses are counted and scored for **car**, **dmo** (dynamic map objects), **ped** (pedestrian), **skater** and **body tweak** (`HOM_GetBonusData`, `GetBonusCollisionScore`). The fan rebuild uses **2,000 points per car** taken from Skate 3's VehicleData. The HUD shows a metric row only once its points pass a threshold (air 5, others 1), and shows bonus counts only from 2 upward. — [HOM-FINDINGS.md](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md), [repo README](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4)
- **Hall of Meat Battle mode [Datamine].** Turn-based for 1+ players, with rounds, a random starting player, a per-turn timer, an optional "CumulativeScoring" setting, a leaderboard (rank, name, points), a highlight reel and an online "players choice" vote.
  - Only bails **started inside a ScoringBoundary volume** count.
  - The Lua turn logic contains `BonePoints = {1, 2, 4}`, a tiered count of broken bones.
  - Single-player HoM challenges are spread per district (`hom_dwtn_01…`, `hom_indu_*`, `hom_univ_*`, online `ol_hom_*`, DLC `ol_hom_dyr_01`).
  - Source: [HOM-FINDINGS.md](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md)
- **What was not recoverable [Datamine].** The native point formulas, meaning how bone values combine with the metric thresholds into a total, live in the PowerPC executable and were not extracted. — [HOM-FINDINGS.md](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md)
- **A second fan reconstruction, ReSkate's own Meat score [Datamine/fan design].** These are not Skate 3 values, but they show one modern tuning.
  - A bruise starts at a 7 m/s impact along the contact normal and a break at 12 m/s.
  - Head hits count double and vehicle hits count 1.5x. A break is "worth ten of the lightest hits", and falls are scored at half Skate 3's rate.
  - Categories: time, hits, broken bones, road rash, airtime, fall, top speed, rotations.
  - The thresholds were raised after playtests because "a hard fall on flat ground broke bones", and because a heavy bail's hits and breaks outweighed the rest of the score card.
  - Source: [ReSkate PR #137](https://github.com/Dingo-Shenanigans/ReSkate/pull/137)

#### Burnout 3 / Revenge / Paradise / Dominator (Criterion, 2004–2008)

- **Burnout 3 Crash Mode goal [Wiki].** Cause the largest monetary damage in a multi-vehicle pile-up at a traffic junction. There are **100 Crash junctions**. — [Wikipedia: Burnout 3](https://en.wikipedia.org/wiki/Burnout_3:_Takedown) (via search digest)
- **Burnout 3 pickups [Press].** Spinning coin icons add cash, and cash-multiplier icons float in hard-to-reach positions. A poisoned "Heartbreaker" pickup halves the score and overrides any multipliers. — Reviews returned together in one search: [GameSpot](https://www.gamespot.com/reviews/burnout-3-takedown-review/1900-6106827/), [HonestGamers](https://www.honestgamers.com/4952/playstation-2/burnout-3-takedown/review.html), [Slashdot](https://games.slashdot.org/story/05/01/18/1626202/review-burnout-3---takedown). The digest did not attribute each line to a specific review.
- **Crashbreaker [Wiki/Press].** "Causing enough cars to wreck enables the 'crashbreaker,' a player activated explosion that creates even more havoc than the original crash."
  - The wreck threshold varies per junction: **15 wrecks** for Crashed Out and Crash Fu, **8** for Shut Up and Jump.
  - Gold targets: **$700,000** (Crashed Out), **$600,000** (Crash Fu), **$200,000** (Shut Up and Jump).
  - Sources: [Burnout wiki: Crashbreaker](https://burnout.fandom.com/wiki/Crashbreaker), [Crashed Out](https://burnout.fandom.com/wiki/Crashed_Out), [Crash Fu](https://burnout.fandom.com/wiki/Crash_Fu), [Shut Up and Jump](https://burnout.fandom.com/wiki/Shut_Up_and_Jump)
- **Impact Time / Aftertouch [Wiki/Press].** After your crash, a slow-motion window lets you steer the wreck. During it you can steer into any pickup, **including the Crashbreaker icon before the wreck threshold is met**. — [Burnout wiki: Crashbreaker](https://burnout.fandom.com/wiki/Crashbreaker)
  - Speedrunners use Impact Time to reach the **4x multiplier** and then the crashbreaker, and wait for the pile-up to grow before detonating. — [Speedrun.com B3T crash headlines guide](https://www.speedrun.com/b3t/forums/e5wne)
  - In races, crashing a rival during aftertouch is an "Aftertouch Takedown", which "refills your boost meter and prevents you from losing any bonus meter segments". — [GameSpot review](https://www.gamespot.com/reviews/burnout-3-takedown-review/1900-6106827/)
- **Burnout Revenge Crash Mode (2005) [Press].** Revenge reworked the scoring.
  - A **launch bar**, compared to a three-click golf swing meter, replaced the rolling start. Its outcomes are perfect, fast, slow, stall or engine blowout.
  - Floating x-multiplier and $ icons were **removed**, and "every car has a set value" regardless of damage.
  - The Crashbreaker **charges from a meter** that fills as traffic piles up, and "multipliers are earned for each car affected by the blast".
  - Sources: [GameSpot Revenge Crash preview](https://www.gamespot.com/articles/burnout-revenge-crash-mode-preview/1100-6130814/), [GameFAQs review](https://gamefaqs.gamespot.com/xbox360/928661-burnout-revenge/reviews/92336), [Wikipedia: Burnout Revenge](https://en.wikipedia.org/wiki/Burnout_Revenge)
- **Burnout Paradise Showtime (2008) [Press/official manual].**
  - **Start:** press L1+R1 anywhere, at any time. The car explodes and catapults into the air.
  - **Continue:** use boost to bounce off the ground into other vehicles. Each vehicle hit adds score and refills boost. The run ends when you are stopped with no boost.
  - **Multiplier:** "Hitting a bus will add one to the score multiplier" (official manual), and buses are the only way to raise it.
  - **Bonuses and total:** signs reportedly give a flat $10,000 (single trophy-guide source). The final total also counts distance travelled.
  - **Records and trophies:** best scores are saved per road as "Showtime Road Rules". Trophies exist for a x5 multiplier and for 10 Road Rules, and Remastered guides cite a x10 goal. Showtime is disabled on motorcycles.
  - Sources: [Remastered manual (EA)](https://eaassets-a.akamaihd.net/eahelp/manuals/burnout-paradise-remastered-manual_switch_en-us.pdf), [PlaystationTrophies x5](https://www.playstationtrophies.org/game/burnout-paradise-ps3/trophy/2745-score-a-x5-multiplier-in-showtime.html), [Road Rule trophy](https://www.playstationtrophies.org/game/burnout-paradise-ps3/trophy/2730-set-a-showtime-road-rule-on-any-road.html), [10 Road Rules](https://www.playstationtrophies.org/game/burnout-paradise-ps3/trophy/2755-set-10-showtime-road-rules.html), [bit-tech review](https://bit-tech.net/reviews/gaming/xbox/burnout_paradise/3/), [TrueAchievements](https://www.trueachievements.com/a9964/the-show-must-go-on-achievement)
- **Danger Zone (2017) [Press].** This is a standalone Crash Mode made by Criterion's founders at Three Fields Entertainment. — [CGMagazine](https://www.cgmagonline.com/review/game/danger-zone-review-successing-burnout/), [EGM](https://egmnow.com/danger-zone-review/)

#### Dismount series (Jetro Lauha / tAAt → Secret Exit, 2002–2026)

- **Origins [Wiki].** Stair Dismount (Porrasturvat) was made by Jetro Lauha for the **Assembly 2002** game development competition and **won first prize**. Truck Dismount (Rekkaturvat) **won Assembly 2003**. Stair Dismount reached iPhone/iPod touch on **25 Nov 2009** (Secret Exit) and Android in **June 2011**. — [MobyGames](https://www.mobygames.com/game/10966/porrasturvat-stair-dismount/), [Codex Gamicus](https://gamicus.fandom.com/wiki/Stair_Dismount), [HandWiki](https://handwiki.org/wiki/Software:Stair_Dismount), [jet.ro Truck Dismount](https://jet.ro/games/truck-dismount/)
- **Turbo Dismount scoring [Press/Forum].**
  - Points come from "how much damage is dealt to Mr Dismount and his surroundings". — [minireview](https://minireview.io/simulation/turbo-dismount)
  - Each hit raises the points and triggers a multiplier that increases the value of further injuries. — [appgamer user reviews](https://www.appgamer.com/turbo-dismount/reviews/)
  - "Breaking as many bones as possible will reward you with a higher score." — [GameGrin preview](https://www.gamegrin.com/previews/turbo-dismount-preview/)
  - Flipping the truck repeatedly with the dummy inside gives "an insane amount of points and multipliers", and longer sandwiching between objects keeps accruing points. — [WriterParty guide](https://writerparty.com/party/turbo-dismount-tips-tricks-cheats-and-strategy-guide/)
  - A physics glitch kept a **10x multiplier** active and produced about **21 million points**. There is an achievement that requires the body to stay intact. — [Steam forum](https://steamcommunity.com/app/263760/discussions/0/540738050950720405/)
  - [AI-src] points for "pain" from impact forces, bone breaks and head trauma, plus flip and somersault bonuses (no numbers). — [Grokipedia](https://grokipedia.com/page/Turbo_Dismount)

#### Pain (Idol Minds / SCEA, PS3 PSN, 2007)

- **Core loop [Press/Wiki].** Load a character into a giant slingshot, launch him into a physics-driven (Havok) environment, and cause as much damage to the ragdoll and the surroundings as possible. — [Wikipedia: Pain](https://en.wikipedia.org/wiki/Pain_(video_game)), [GameSpot](https://www.gamespot.com/reviews/pain-review/1900-6183860/), [Push Square](https://www.pushsquare.com/reviews/2010/11/pain_psn) (via search digest)

#### FlatOut ragdoll driver events (Bugbear, 2004–2017)

- **FlatOut, 2004 [Press/user review].**
  - Hard crashes throw the driver through the windscreen, and the same ragdoll drives the bonus "Ragdoll Olympics" events: **high jump, darts, bowling**.
  - In those events the player presses the nitro button to fire the driver out of the car without crashing.
  - One event requires landing the driver on a mat rather than solid ground.
  - Source: [MobyGames user review](https://www.mobygames.com/game/15632/flatout/)
- **FlatOut 2, 2006 [Wiki].**
  - Stunts include knocking down bowling pins, hitting dartboard zones, kicking a **field goal** and flying through **flaming hoops**.
  - In flight the driver can be steered with "aerobatics", but **overusing aerobatics adds drag**, so steering costs distance.
  - A "**nudge**" gives a small upward boost and slightly reduces drag.
  - Sources: [FlatOut wiki: Ragdoll Physics](https://flatout.fandom.com/wiki/Ragdoll_Physics), [FlatOut wiki: FlatOut 2](https://flatout.fandom.com/wiki/FlatOut_2), [Wikipedia: FlatOut 2](https://en.wikipedia.org/wiki/FlatOut_2) (via search digest)
- **FlatOut 4, 2017 [Press].** The "Legendary Stunt Mode" has **6 new stunts and 6 re-imagined classic stunt minigames**. — [Eggplante](https://www.eggplante.com/2017/05/05/flatout-4-total-insanity-brings-racing-ragdoll-physics-comedy-to-consoles/)

### Inferences

- **Score parts and events, not bones.** Skate 3 scores 25 body *parts* (not anatomical bones), each with escalating tiered thresholds, and passes damage to neighbours. That is cheap to compute (one table lookup per contact) and produces satisfying "cascade" moments, because one big hit lights up several parts. It maps directly onto a WebGL ragdoll with about 15–25 rigid bodies.
- **Comedy weighting is deliberate.** The groin pays the most at the lowest threshold (1,000 points at impact 3 versus 100 at impact 6 for a hand), and skull and neck pay 5x a limb break. Number Go Down can follow this pattern: weight "funny" parts heavily (crotch on a red candle, head on a whale).
- **Event curves are steep and capped.** Every Skate 3 metric has a dead zone, then about a 13x ramp, then a cap. Examples: bail time pays nothing under 5 s, and 6 s is worth 6.7x 5 s. This creates "just one more second" goals. For a vertical fall, the analogues are fall duration, drop distance, peak speed and total rotation, and each could get its own curve with a visible next threshold.
- **Three ways to stack multipliers.** (a) Burnout 3: pickups placed in hard-to-reach spots, collected during a slow-mo steering window. (b) Burnout Paradise: a specific rare object type (buses) is the only multiplier source. (c) Dismount: spectacle such as flips and sustained crushing raises the multiplier. For Number Go Down, whales could be the "bus" (+1x each), and boost rings or candles could be pickups.
- **The two-stage payoff.** Both Burnout's Crashbreaker (unlocked after N wrecks, or by steering into its icon) and Paradise's boost-bounce let the player re-ignite a dying run. A falling game could do the same with a mid-fall "detonate" or "second fling" earned from damage.
- **Steering must cost something.** FlatOut's aerobatics-add-drag rule stops touch "sway" from dominating. Spending sway could slow descent or cost a meter.

### Gaps
- **Missing numbers.**
  - Exact Skate 1 and Skate 2 Hall of Meat formulas, and how Skate 3 sums bone points, metric points and bonuses into one total (it sits in the executable).
  - Burnout 3 cash values per car, multiplier icon values (x2, x4, others?), and the Crashbreaker blast radius.
  - Turbo Dismount's exact per-part values and how its multiplier grows.
  - Pain's scoring rules (points per hit, combo rules, multipliers). Search digests did not include them and the review pages could not be fetched.
  - FlatOut stunt point tables.
- **Unverified recall (memory only, not checked this session).**
  - Burnout 2: Point of Impact (2002) introduced Crash Mode.
  - Burnout Dominator (2007, PSP/PS2) dropped Crash Mode.
  - Burnout Crash! (2011) was a top-down Crash Mode spin-off. Its Wikipedia page appeared in results but the content was not read.
  - Pain's mid-flight inputs reportedly included a "flail" and a "grab" (latch onto objects or people). Its modes reportedly included "Mime Toss" and "Spank the Monkey".
  - FlatOut 2's stunt list reportedly also included long jump, stone skipping, curling, basketball, baseball and a poker-hand "Royal Flush" event, with launch angle set by a pre-launch meter.
  - Toribash (2006, Hampus "Hampa" Söderström, later Nabi) scores the damage dealt to the opponent per turn. Dismemberment and fracture are rule toggles with force thresholds.
  - Happy Wheels (2010, Jim Bonacci / Fancy Force) has no damage score. Its levels are goal-based and dismemberment is purely comedic.

---

## 2. What exactly happened on screen and in audio when a bone broke?

### Takeaway
Skate 3 is the gold standard and the only one with recoverable numbers. On a break:
- **Time:** drops to about **0.3x speed within 0.15 s**, holds about **1 s**, then ramps back over about **1 s**.
- **Picture:** a reddish post-FX tint flashes; the image is graded down to a desaturated blue-grey with a closing black spotlight, vignette and film grain; an **X-ray skeleton** of 19 bone meshes shows through the body, with hurt bones heating from white to orange and breaks burning red-orange.
- **Sound:** a slow-motion whoosh, a per-injury bone-crunch sound from 5 banks (297 sounds), and a 24-line announcer.

Burnout's equivalents are slow-mo Impact Time and Takedown cams, but no public numbers exist for their slow-mo factor or duration.

### Cited Findings

#### Skate 3 Hall of Meat presentation

- **Slow motion [Datamine].** The executable contains the flag `IsBrokenBoneSlowMo`, and slow motion is single-player only. The fan rebuild, "tuned frame by frame against Skate 3 footage", reproduces it as: **"down to 0.3 in 0.15 s, held 1 s, back over 1 s"**. A break during a running slow-mo only extends it, and its sound plays once per slow-mo. The 0.3/0.15/1/1 figures are footage-matched estimates, not values read from the files. — [s3hom_hud.cpp](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/source/s3hom_hud.cpp), [README](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4)
- **Post-FX [Datamine].**
  - The HoM grade `colour_matrix_hall_of_meat` uses near/far **saturation 0.5** and a **multiply of (1, 1, 1.2)**, which cools the image towards blue.
  - The slow-mo flash is `hom_slomo_effect` with **tint (0.4, 0.2, 0.2)**, which reads as red.
  - The function curves `functions_hall_of_meat` run over **score 0..20,000**, implying the look intensifies with score.
  - The rebuild describes the look as "the picture closes in to a dark, grainy blue-grey spotlight", with black corners and coarse scrolling film grain, plus red screen edges on a break.
  - Sources: [HOM-FINDINGS.md](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md), [README](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4)
- **X-ray skeleton [Datamine].**
  - The `dem_bones_hom` recipe has bone meshes for: Skull, Neck, Rib_Cage, Lower_Spine, Hips, and left/right Bicep, Forearm, Hand, Thigh, Calf, Ankle and Toes. That is **19 named meshes**, although the findings doc says "20 bone meshes".
  - The skeleton shows "from the moment you crash until you get back up".
  - Bone colour: **"white while bruised, orange as the damage builds, red-orange at a break"**. In the rebuild, broken bones throb (sine pulse) and show a white flash and a crack line at the moment of breaking.
  - Sources: [HOM-FINDINGS.md](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md), [Thunderstore mod page](https://thunderstore.io/c/reskate/p/Kitty_Meow/Hall_of_Meat/), [s3hom_hud.cpp](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/source/s3hom_hud.cpp)
- **Audio [Datamine].**
  - `HOM_Set_1..5.bnk` contain **297 decoded sounds**, mostly bone crunches, with one played "for every new injury".
  - `hom_slo_mo.abk` holds **4 slow-motion sounds**.
  - There are **24 announcer lines** (`340_*_HOM.dat`).
  - HUD sounds: `FE_SOUND_HOM_SCORE_RED`, `FE_SOUND_HOM_TRANSITION`.
  - Source: [HOM-FINDINGS.md](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md)
- **Score panel [Datamine].** A **Thrasher-branded** panel with intro, normal and outro states, rows for each metric (value plus points) and chips for car count and bones broken (for example "x3"). The rebuild shows "NEW BEST" in the break orange, or the score to beat, and keeps the panel on screen for 4.0 s with a 0.8 s fade. Those timings are the rebuild's choice and may not be Skate 3's. — [HOM-FINDINGS.md](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md), [s3hom_hud.cpp](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/source/s3hom_hud.cpp)
- **Skate 3 camera tables [Datamine].**
  - 243 `camera_shots`, all with a **12 mm lens**: 80° vertical FOV at 16:9, a fisheye-like wide angle.
  - Low chase 2 m; big-air shot 4 m back at 15° elevation; high chase 3 m at 30°.
  - Camera dynamics: heading spring 400, damping 100.
  - Replay cameras in skate. (2025) use a fisheye lens distortion (gain 0.413).
  - Source: [OG Camera FINDINGS.md](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/addons/og-camera/FINDINGS.md)
- **ReSkate's own HoM [Datamine/fan design].** Bruised bones yellow, broken bones red, the hit bone flashes, a red screen-edge pulse on a break, and slow motion "never faster than the trainer's game speed". — [ReSkate PR #137](https://github.com/Dingo-Shenanigans/ReSkate/pull/137)

#### Burnout

- **Impact Time [Wiki/Press].** A slow-motion window after your own crash in which you steer the wreck (Aftertouch). — [Burnout wiki: Crashbreaker](https://burnout.fandom.com/wiki/Crashbreaker), [GameSpot](https://www.gamespot.com/reviews/burnout-3-takedown-review/1900-6106827/)
- **Burnout 3 camera [Press].** Deliberately **wide-angled**, which increases the sense of movement in peripheral vision, and it **widens further when boosting**. — [PlayStation Blog, Classic Levels Deconstructed](https://blog.playstation.com/archive/2017/08/31/classic-levels-deconstructed-burnout-3-takedowns-blistering-alpine-track/)
- **Origin of the crash fantasy [Wiki].** Alex Ward (Burnout 3 director of design, Criterion co-founder) said the series was inspired by a crash sequence in a DVD film. — [Wikipedia: Burnout (video game)](https://en.wikipedia.org/wiki/Burnout_(video_game)), [MobyGames: Alex Ward](https://www.mobygames.com/person/62803/alex-ward/)

#### Pain

- **Feel [Press].** Push Square praised "Jarvis demonstrating great ragdoll effects as he bounces, flips and flops around the environments" and the sound design. — [Push Square](https://www.pushsquare.com/reviews/2010/11/pain_psn)

### Inferences

- **A recipe for Number Go Down's break moment**, built from Skate 3's measured values:
  - **Time:** timeScale 1.0 → 0.3 over 150 ms; hold about 1 s of real time; ease back over about 1 s; a new break extends rather than restarts the slow-mo.
  - **Picture:** one-frame red tint pulse; desaturate to 0.5 and push blue; vignette closes in; film grain; X-ray bones drawn over the ragdoll, with hurt bones fading white → orange and broken bones red, throbbing, with a crack sprite and a white flash.
  - **Sound:** a randomised crunch from a large pool (Skate used about 300 sounds to avoid repetition), a whoosh at slow-mo onset, and occasional announcer barks.
  - **Rendering cost:** this is all post-processing plus an overlay, so it suits mobile WebGL. The only heavy part is the fullscreen grade pass.
- **Cap slow-mo frequency.** A bone-break slow-mo in a fall with dozens of collisions needs a cooldown or merge rule, or the whole run plays in slow motion. Skate's "extend, don't restart" rule is one answer. Sniper Elite's frequency setting (unverified, below) is another.
- **Wide-angle camera for speed.** Burnout widens FOV on boost; Skate used a 12 mm, roughly 80° vertical lens. For a vertical fall, widening FOV on speed boosts and narrowing or zooming in on breaks gives strong contrast.

### Gaps
- **No sourced numbers for:**
  - Burnout's slow-mo factor and duration for Impact Time, Takedown cams or crash cams.
  - Turbo Dismount's replay camera behaviour beyond "fully adjustable" (PocketGamer).
  - Pain's camera.
- **Skate 1 and 2 presentation.** Whether the X-ray overlay existed in Skate 1 and 2 or only in Skate 3 is unconfirmed.
- **Unverified recall (memory only).**
  - Sniper Elite V2 (Rebellion, 2012) introduced the **X-ray kill cam**: a slow-motion follow of the bullet, then a cutaway X-ray showing bones fracturing and organs rupturing. Later entries (Sniper Elite III 2014, 4 2017, 5 2022, Resistance 2025) extended it, and the player can set how often it triggers.
  - Max Payne 3 (Rockstar, 2012) has a **final-kill cam**: on the last enemy of an encounter the camera follows the bullet in slow motion, and the player can keep firing into the body. It uses NaturalMotion Euphoria procedural animation.
  - Burnout 3's **Takedown cam** cuts to a slow-motion cinematic angle of the rival's crash, captioned "TAKEDOWN!", and can be skipped.
  - Tony Hawk's Pro Skater bails are a failure state: the combo is lost and blood decals appear. That is the opposite of Hall of Meat, which rewards bails.

---

## 3. What made runs differ each time, and what drove "one more try"?

### Takeaway
Variety came from **chaotic physics plus a small number of player-set launch parameters**:
- Skate: the spot and mid-bail body tweaks.
- Burnout: launch timing, steering into pickups during slow-mo, and when to detonate.
- Dismount: vehicle, push or launch point and strength, obstacle layout.
- FlatOut: launch angle plus in-flight aerobatics.
- Pain: slingshot aim and power plus mid-flight actions.

"One more try" was driven by:
- **visible near-miss thresholds** (medal targets, steep score curves)
- **per-location bests** (Showtime Road Rules, per-map best bail)
- **social comparison** (turn-based HoM battles, leaderboards)

### Cited Findings

- **Skate 2 bail controls [Wiki/Forum].**
  - Forcing a bail: pressing **both thumbsticks and both triggers together** is the reliable method, and Y works only sometimes. Neoseeker describes it as an intentional bail that can be triggered at any time.
  - Mid-air body control: the right stick's four directions map to body tweaks, **Cannonball (up), Spread Eagle (down), Judo (right), Torpedo (left)**, and you can also control spin while airborne. Hand gestures are also needed for some challenges.
  - Spread eagle and cannonball are used to slow down.
  - Sources: [Neoseeker](https://skate.neoseeker.com/wiki/Hall_of_Meat), [XboxAchievements HoM guide](https://www.xboxachievements.com/forum/topic/106028-hall-of-meat-guide/), [XboxAchievements bail-time thread](https://www.xboxachievements.com/forum/topic/103109-hall-of-meat-bail-time-challenge/)
- **Skate 2 challenge design [Forum].**
  - Body-damage challenges are "mostly about high drops", at The Dam, Lindley Tower and Top of the E.
  - Bail-time challenges (for example **5.5 s or 10 s**) are best done by rolling down a slope after landing.
  - Some challenges require hitting pedestrians or cars at a set speed (for example **40 mph**). One player failed a 40+ torpedo hit because his feet touched the ground first.
  - Sources: [XboxAchievements](https://www.xboxachievements.com/forum/topic/106028-hall-of-meat-guide/), [PSNProfiles Skate 2 HoM guide](https://psnprofiles.com/guide/9216-skate-2-hall-of-meat-guide), [PlayStationTrophies forum](https://www.playstationtrophies.org/forum/topic/6000-damn-hall-of-meat-challenges/)
- **Skate 3 structure [Datamine].** Per-district HoM spots with six spawn locators each, a scoring boundary, a per-turn timer, a random first player and a highlight reel plus vote after each round. The best bail per map is stored (in the fan rebuild). — [HOM-FINDINGS.md](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md)
- **Burnout 3 [Wiki/Forum].** Run-to-run variance comes from 100 different junctions, medal targets, pickup placement and the Impact Time steering skill. Players plan crashes to grab the 4x multiplier during aftertouch, and wait for a bigger pile-up before detonating. — [Wikipedia](https://en.wikipedia.org/wiki/Burnout_3:_Takedown), [Speedrun.com guide](https://www.speedrun.com/b3t/forums/e5wne), [Slashdot review](https://games.slashdot.org/story/05/01/18/1626202/review-burnout-3---takedown)
- **Burnout Revenge [Press].** The **golf-swing launch meter** (perfect / fast / slow / stall / engine blowout) adds a skill-timing input at the start of each attempt. — [GameSpot preview](https://www.gamespot.com/articles/burnout-revenge-crash-mode-preview/1100-6130814/), [GameFAQs review](https://gamefaqs.gamespot.com/xbox360/928661-burnout-revenge/reviews/92336)
- **Burnout Paradise [Press].** Showtime can start **anywhere in the open world**, and records are kept **per road** (Showtime Road Rules), which turns the whole map into hundreds of mini-leaderboards. — [Remastered manual](https://eaassets-a.akamaihd.net/eahelp/manuals/burnout-paradise-remastered-manual_switch_en-us.pdf), [PlaystationTrophies](https://www.playstationtrophies.org/game/burnout-paradise-ps3/trophy/2755-set-10-showtime-road-rules.html)
- **Turbo Dismount [Press/user].**
  - It "rewards setup and planning over reflexes". — [Hammer Gamer](https://hammergamer.com/games/action/turbo-dismount/)
  - Players can adjust obstacles. In the sequel, free obstacle movement was replaced by "a slider that barely shifts them", which players complained about. — [Steam negative reviews TD2](https://steamcommunity.com/app/2280350/negativereviews/?browsefilter=toprated) (via search digest)
  - The counterpoint: "the only way of climbing the high score table is to try over and over again until you get a lucky run". — [GameSpot user review](https://www.gamespot.com/turbo-dismount/user-reviews/2200-12600590/)
- **FlatOut 2 [Wiki].** Each stunt is a target-scoring launch (pins, dartboard rings, goalposts, hoops). In-flight aerobatics trade control for drag, and the nudge gives a small boost. — [FlatOut wiki](https://flatout.fandom.com/wiki/Ragdoll_Physics)
- **Pain [Press].** Reviewers framed it as best in short bursts and **"a surprisingly fun party game"**, meaning pass-the-controller turn-taking. — [Pain review digest: Push Square / CheatCC / GameSpot](https://www.cheatcc.com/articles/pain-review-for-playstation-3-ps3/)

### Inferences

- **What separates skill from luck.** The strongest "one more try" loops give the player **2–3 meaningful pre-launch choices plus 1 bounded mid-flight influence**. Turbo Dismount's weakest point ("lucky run") appears when the player's inputs end at launch. Skate's tweak stances, Burnout's aftertouch and FlatOut's drag-limited aerobatics all keep the player involved during the chaos without removing the chaos. Number Go Down's "sway with touch" is the right lever, but it needs a cost (FlatOut drag) and a payoff (steer into a whale = multiplier, like Burnout pickups).
- **Two more retention levers.** Per-segment or per-level bests (Paradise Road Rules, Skate per-map best) and threshold steps (Skate's bail-time cliff, Burnout's gold targets) both bring players back. Number Go Down could show "best at this depth" ghosts and the next score-curve threshold during the fall.
- **Social turn-taking is proven.** Pain as a party game and Skate 3's HoM Battle with highlight reel and vote both show it working. Async "pass-the-phone" or link-share challenges are the web equivalent.

### Gaps
- No sourced data on Dismount level counts, vehicle counts or Turbo Dismount 2 content totals (the Steam page could not be fetched).
- No sourced data on Pain's environments, DLC or scoring combos.
- **Unverified recall (memory only).** Turbo Dismount ships many vehicles and themed levels with movable obstacles, and later mobile versions had in-game video recording and sharing (possibly the Everyplay SDK, widely used in 2014–2016 mobile games).

---

## 4. How did replays, photo modes and sharing work, and how much did they drive spread?

### Takeaway
Skate pioneered **in-game clip editing plus an EA-hosted clip site (skate.Reel)**. Its servers are long gone, but the habit of filming bails is part of the series' identity. The real distribution engine, though, was **YouTube Let's Plays**, not in-game sharing.
- **Skate 3:** about four years after launch, PewDiePie's video (about 12.4M views at the time) drove a reprint and a roughly 33% unit-sales rise in H1 2014.
- **Dismount:** creator videos (Markiplier and others) built the brand. Turbo Dismount reports more than 50M Google Play downloads.

Ragdoll failure is inherently clip-shaped content.

### Cited Findings

- **Skate replay tools [Wiki/Press].**
  - Skate 2 footage "could be uploaded to 'Skate.Reel', an online service where players could view and rate other user created videos". — [Wikipedia: Skate 2](https://en.wikipedia.org/wiki/Skate_2)
  - The original Skate's demo was delayed to **21 Aug 2007** by a problem with its Skate Reel (video editing) feature, and the game's multiplayer was shut down in **July 2011**. — [Wikipedia: Skate (2007)](https://en.wikipedia.org/wiki/Skate_(2007_video_game))
  - skate.Reel let users "post, view, and rate other users' clips or photos". All Skate games' EA Nation servers are now shut down, so there is no in-game upload. — [Skate wiki: Replay Editor](https://skate.fandom.com/wiki/Replay_Editor)
- **skate. (2025) replay editor [Forum].** It exists but drew many bug reports (freezes, "not functional at all", saved clips and exports). — [Steam discussion](https://steamcommunity.com/app/3354750/discussions/0/592909223872261717/), [EA forums bug report](https://forums.ea.com/idea/skate-bug-reports-en/replay-editor-not-functional-at-all/12698071), [Steam: exports/saved clips](https://steamcommunity.com/app/3354750/discussions/0/684117266472687698/)
- **Skate 3 HoM Battle [Datamine].** After each round there is a highlight reel and an online "players choice" vote. In other words, social replay and judging were built into the mode. — [HOM-FINDINGS.md](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md)
- **The 2014 Skate 3 YouTube resurgence [Press].**
  - UK retailer GAME saw strong demand for the roughly four-year-old game and asked EA for a reprint "due to YouTube popularity". PewDiePie's Skate 3 video had about **12.37 million views** by then. — [bit-tech](https://www.bit-tech.net/news/gaming/skate-3-gets-reprint-due-to-youtube-popular/1/)
  - Unit sales rose about **33% in H1 2014 vs 2013**, and the game stayed in the **UK top 40 all year**. — [MCV/Develop](https://mcvuk.com/business-news/how-pewdiepie-fired-skate-3-back-into-the-charts/)
  - Wikipedia credits Let's Play channels "which showcased the game's ragdoll physics and glitches". — [Wikipedia: Skate 3](https://en.wikipedia.org/wiki/Skate_3)
  - Popularity lasted to late 2015, with creators like Jacksepticeye continuing videos. — [Operation Sports](https://www.operationsports.com/skate-2-or-skate-3-which-one-actually-got-it-right/)
  - The series' cult status comes from glitches, especially Skate 3's. — [Know Your Meme](https://knowyourmeme.com/memes/subcultures/skate)
- **Web precedent [Press].** EA released a browser game, **"EA Skate 2: Hall of Meat"**, on Kongregate, which shows the HoM concept was already shipped as a web or Flash promo. I could not fetch it, so its mechanics are unknown. — [Kongregate](https://www.kongregate.com/en/games/easkate/ea-skate-2-hall-of-meat)
- **Turbo Dismount reach [Wiki].** Downloaded **over 400,000 times on Steam** and **over 50 million on Google Play**. — [Wikipedia: Turbo Dismount](https://en.wikipedia.org/wiki/Turbo_Dismount) (via search digest)
- **Turbo Dismount creator video [Wiki].** A Markiplier video "Turbo Dismount | YOUTUBER EDITION" is catalogued, featuring other YouTubers including PewDiePie. No view count was found. — [Know Your Meme](https://knowyourmeme.com/videos/94435-markiplier)
- **PewDiePie's effect on indie sales [Wiki].** Wikipedia notes his coverage is recognised to boost indie game sales. This is a general claim, not specific to Dismount. — [Wikipedia: PewDiePie](https://en.wikipedia.org/wiki/PewDiePie)
- **Turbo Dismount replay friction [Forum].** Players report waits of **20–30 s** for physics to settle before the replay starts, and ask for a skip. — [Steam TD2 discussions](https://steamcommunity.com/app/2280350/discussions/0/594013058474446711/) (via search digest)

### Inferences

- **Clips spread the genre; in-game social systems died.** Skate.Reel died with EA's servers. YouTube and Let's Plays outlived them and drove sales years later. A web game can do what consoles could not: produce a **shareable link or short vertical video on the client side**, for example with MediaRecorder on the canvas or a deterministic replay seed plus inputs. That turns every run into TikTok or X content with zero friction.
- **Make the replay fast.** Players hate waiting for physics to settle (20–30 s complaints). Cut the replay at the peak moment, or auto-end on low kinetic energy (the Skate rebuild ends a bail when the body has been "still" for 0.4 s and below 0.6 m/s).
- **Build in a "highlight + vote" layer.** Skate 3's built-in highlight reel and vote is an under-used idea that a web game could revive as a daily "worst fall" gallery.

### Gaps
- No view-count data for the biggest Skate HoM, Turbo Dismount, Happy Wheels or Toribash compilations. YouTube pages could not be fetched or searched after the budget ran out.
- No sales data attributed to creator coverage for Dismount, Happy Wheels or Pain.
- Whether Skate 1's skate.Reel had a clip-length cap (often recalled as 30 s) is unconfirmed.
- **Unverified recall (memory only).**
  - Happy Wheels' growth was driven largely by YouTubers around 2012 and by its in-browser user-level browser with ratings. Its creator site is totaljerkface.com, and it moved off Flash to an HTML5/Unity build around Flash's end of life (Dec 2020).
  - Toribash's culture centres on replay files shared on its forums (replay boards and contests). Replays are tiny because they store joint-state inputs per turn rather than video.

---

## 5. What did players and critics single out as the best and worst parts? What complaints recurred?

### Takeaway
**Praised:** physics comedy (the "unlikely fun of failing"), crisp impact sound and Foley, and planning a perfect launch.

**Recurring complaints:**
1. Shallowness, repetitiveness and thin content (Pain, Turbo Dismount, Danger Zone at "under two hours").
2. Randomness or luck over skill (Turbo Dismount high scores).
3. Over-complex or unresponsive controls (Pain used "nearly every PS3 button").
4. Grinding inputs (Revenge's Crashbreaker button-mashing).
5. Waiting, camera and replay friction (Turbo Dismount 2).
6. Losing the mode entirely: skate. (2025) removed Hall of Meat and players kept asking for it back.

### Cited Findings

- **Pain [Press].**
  - Metacritic **71 from 37 critics**; IGN **6.8/10**; Push Square **8/10**.
  - GameSpot: a "fine example of what can be done with the Havok physics engine".
  - HonestGamers: controls overly complex, "incorporated nearly every PS3 controller button".
  - A Metacritic user: "a ragdoll physics demo that you are charged $10 to buy".
  - Several reviews: best as a party game.
  - Sources: [Metacritic](https://www.metacritic.com/game/pain-2007/), [uvlist](https://www.uvlist.net/game-166713-Pain), [Push Square](https://www.pushsquare.com/reviews/2010/11/pain_psn), [GameSpot](https://www.gamespot.com/reviews/pain-review/1900-6183860/), [HonestGamers](https://www.honestgamers.com/7573/playstation-3/pain/review.html), [CheatCC](https://www.cheatcc.com/articles/pain-review-for-playstation-3-ps3/)
- **Turbo Dismount [Press/user].**
  - PocketGamer: it runs on one mechanic and offers little beyond the carnage, but "does that one thing well"; the camera is fully adjustable. — [PocketGamer](https://www.pocketgamer.com/turbo-dismount/review/)
  - Hammer Gamer: "low-poly, toy-like visuals and crisp impact Foley make collisions satisfying, though music and level variety grow repetitive"; thin progression. — [Hammer Gamer](https://hammergamer.com/games/action/turbo-dismount/)
  - A GameSpot user review: no real completion concept, and high scores come from "a lucky run". — [GameSpot user review](https://www.gamespot.com/turbo-dismount/user-reviews/2200-12600590/)
  - Steam reviewers: obstacles "frequently fail to produce an intended effect". — [Steam negative reviews](https://steamcommunity.com/app/263760/negativereviews/?browsefilter=toprated)
  - Leaderboard: high scores not recording, and unsaved scores lost on level change (older bug). — [Steam thread](https://steamcommunity.com/app/263760/discussions/0/630802344236179963/)
- **Turbo Dismount 2 (2025–26) [Forum].**
  - Free camera disabled during a dismount.
  - Free obstacle placement replaced by a weak slider.
  - Slow traffic AI, a timer that starts too early, and "Survive for 60 seconds" levels that don't fit the format.
  - 20–30 s stalls before replays.
  - Sources: [Steam TD2 complaints thread](https://steamcommunity.com/app/2280350/discussions/0/594013930994545480/), [TD2 feedback thread](https://steamcommunity.com/app/2280350/discussions/0/594013058474446711/), [TD2 negative reviews](https://steamcommunity.com/app/2280350/negativereviews/?browsefilter=toprated)
- **Burnout Revenge Crash Mode [Press/Forum].**
  - One review: the changes add up to "a smarter, more entertaining Crash mode", with icon clutter removed. — [GameFAQs review](https://gamefaqs.gamespot.com/xbox360/928661-burnout-revenge/reviews/92336)
  - A ResetEra user called Revenge a poor sequel to Burnout 3, objecting to the **button-mashing to charge the Crashbreaker**. This is forum opinion. — [ResetEra](https://www.resetera.com/threads/burnout-revenge-is-a-poor-sequel-to-burnout-3.206622/)
- **Danger Zone (2017) [Press].**
  - Metacritic **64 from 16 critics**.
  - "Entire game is twenty levels, which took me under two hours."
  - The framing is "so paperthin that it's bordering on transparent"; every level takes place in a grey simulation rather than real roads.
  - Core gameplay is "rock solid".
  - Sources: [Metacritic](https://www.metacritic.com/game/danger-zone/), [EGM](https://egmnow.com/danger-zone-review/), [TechRaptor](https://techraptor.net/gaming/reviews/danger-zone-review-meet-me-half-way), [Push Square](https://www.pushsquare.com/reviews/ps4/danger_zone)
- **skate. (2025) without Hall of Meat [Press/Wiki/Forum].**
  - The 2025 free-to-play game **removed Hall of Meat**, explained in-fiction as the company "ImpervaTEK" using "science" to make bails not hurt. — [Skate wiki: skate. (2025)](https://skate.fandom.com/wiki/Skate._(2025))
  - Inverse: about **15 million players** tried the first new Skate since 2010 "but the classic Hall of Meat feature is nowhere to be found", and argued it "has to bring back the unlikely fun of failing". — [Inverse](https://www.inverse.com/gaming/skate-15million-fan-favorite-feature-hall-of-meat)
  - EA forum threads: "BRING BACK BROKEN BONES AND GETTING WRECKED BY THE BUS" and "Hall of meat :(". — [EA forums](https://forums.ea.com/discussions/skate-en/bring-back-broken-bones-and-getting-wrecked-by-the-bus/12601318), [EA forums](https://forums.ea.com/discussions/skate-en/hall-of-meat-/12605857)
  - Lords of Gaming's preview title: "A Skater's Paradise Missing the Skater's Soul". — [Lords of Gaming](https://lordsofgaming.net/2025/09/skate-early-access-preview-a-skaters-paradise-missing-the-skaters-soul/)
  - The community answered with the open-source **ReSkate** mod platform. Its 2.0 restores a HoM bail screen with hurt bones and a Meat score, and a separate mod rebuilds Skate 3's exact HoM. — [skatemods ReSkate guide](https://skatemods.com/guides/play-skate-with-reskate/), [Hall-Of-Meat-for-Skate-4](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4)
- **Skate 3's lasting appeal [Press].** Wikipedia credits its 2014 surge to Let's Plays showcasing "ragdoll physics and glitches". — [Wikipedia: Skate 3](https://en.wikipedia.org/wiki/Skate_3)

### Inferences

- **The genre's failure mode is shallowness.** Every single-mechanic product (Pain, Danger Zone, Turbo Dismount) was praised for its physics and criticised for running out of content or progression. Number Go Down needs structure around the fling: several levels, unlockables, daily seeds, goals and cosmetics.
- **Watch the control complexity.** Pain's "every button" problem is a warning for touch: one gesture to launch and one to sway is plenty.
- **Players feel the loss of bone-break presentation.** The skate. (2025) backlash and the modding response show that the X-ray, slow-mo and Meat card are what players remember, more than the scoring maths.

### Gaps
- Could not retrieve professional reviews of Happy Wheels, Toribash, Rag Doll Kung Fu or TABS, nor Steam review percentages for any title. Store and Metacritic pages were not fetchable, and the search budget ran out.
- **Unverified recall (memory only).**
  - Happy Wheels criticism has centred on its user-level quality variance and on gore restricting its audience.
  - Toribash's steep learning curve (manually setting about 20 joints per turn) is its most-cited barrier, while the depth is its main praise.
  - TABS (Landfall; early access 1 Apr 2019, 1.0 1 Apr 2021) is praised for wobbly-physics comedy that is highly watchable on YouTube.

---

## 6. What is the "ceiling" of this genre today? What has never been done well, especially on mobile or web?

### Takeaway
The genre's peak presentation (Skate 3, 2010) and peak crash spectacle (Burnout 3, 2004, and Paradise, 2008) are console-era AAA. They have not been surpassed, and the 2025 Skate reboot removed the feature. Dismount proved huge mobile demand (more than 50M Google Play downloads) but with toy-like low-poly presentation and luck-driven scoring. The direct precedents for a slingshot or launch ragdoll (Pain 2007, FlatOut stunts) are ageing console games with shallow progression.

Never done well, especially in a browser on a phone:
- an AAA-feeling X-ray and slow-mo break presentation with a per-part damage table
- touch steering that is bounded and meaningful
- instant, frictionless replay-clip sharing
- async competition on shared seeds
- a structured multi-level campaign wrapped around the fling

### Cited Findings

- **Hall of Meat's status [Wiki/Press].** No official successor: skate. (2025) removed it, and only fan mods restore it. — [Skate wiki](https://skate.fandom.com/wiki/Skate._(2025)), [Inverse](https://www.inverse.com/gaming/skate-15million-fan-favorite-feature-hall-of-meat), [ReSkate guide](https://skatemods.com/guides/play-skate-with-reskate/)
- **Crash Mode's status [Press].** Its best attempted revival (Danger Zone, 2017) was judged short and bare: 20 levels, under 2 hours, Metacritic 64. — [EGM](https://egmnow.com/danger-zone-review/), [Metacritic](https://www.metacritic.com/game/danger-zone/)
- **Dismount on mobile [Wiki/Press].** It proved mass mobile reach (Stair Dismount on iOS in 2009, Android in 2011; Turbo Dismount at more than 50M Google Play downloads). Turbo Dismount 2's 2026 1.0 still draws complaints about camera, replays and obstacle control. — [Codex Gamicus](https://gamicus.fandom.com/wiki/Stair_Dismount), [Wikipedia: Turbo Dismount](https://en.wikipedia.org/wiki/Turbo_Dismount), [Steam TD2 threads](https://steamcommunity.com/app/2280350/discussions/0/594013930994545480/)
- **Web precedents [Press].** A browser Hall of Meat (EA Skate 2 promo on Kongregate) and MobyGames listing Turbo Dismount on "Browser" show that bone-break games have shipped in browsers before. No evidence was found of either reaching console-level presentation. — [Kongregate](https://www.kongregate.com/en/games/easkate/ea-skate-2-hall-of-meat), [Wikipedia/MobyGames digest](https://en.wikipedia.org/wiki/Turbo_Dismount)
- **Skate 3's system is cheap enough for a phone [Datamine].** It is data-light: a 25-row table, 5 curves, a 19-mesh overlay, a colour matrix and a slow-mo curve. A fan modder rebuilt it on top of another engine from those files. — [Hall-Of-Meat-for-Skate-4](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4)

### Inferences

Open territory for Number Go Down, ranked by how clearly the evidence points to a gap:
1. **AAA break presentation on mobile web.** No phone or browser game is documented doing Skate-3-grade X-ray, slow-mo, grade and announcer presentation. All of it is post-FX plus an overlay plus audio, which is feasible in WebGL2 or WebGPU.
2. **Skill expression inside chaos.** Fix Turbo Dismount's "lucky run" problem with bounded touch sway that costs something (FlatOut drag) and has targets (Burnout pickups, Paradise buses = whales as multipliers). Show each score curve's next threshold live, like Skate's bail-time cliff.
3. **Instant clip sharing.** Skate.Reel died with its servers, and Turbo Dismount 2 players complain about replay waits. A browser can export a 6–10 s vertical clip of the best slow-mo moment, or a deterministic replay URL, at the moment of peak emotion. No game in this list did that.
4. **Async social competition.** Skate 3's HoM Battle (turns, highlight reel, vote) and Paradise's per-road records were never brought to mobile or web. Equivalents: a daily seed, a "beat my fall" link, ghost falls.
5. **Content depth around the fling.** Every standalone entry (Pain, Danger Zone, Turbo Dismount) was dinged for thin progression. A multi-level descent with escalating hazards, unlocks and cosmetic ragdoll variants answers the most common complaint.
6. **Keep the comedy weighting.** The design canon (groin and skull premium, Paradise bus multiplier, Burnout's poisoned Heartbreaker) shows that funny, readable rules beat realism. A crypto-meme theme can map onto this naturally: red candles as damage, chart bars as crushers, whales as multipliers or "buses".

### Gaps
- **Not surveyed:** no 2020–2026 genre entries could be checked beyond Turbo Dismount 2 and skate. (2025), so the competitive landscape for new mobile and web ragdoll-damage games is unverified.
- **Unverified recall (memory only), possible newer or adjacent titles to check:**
  - People Playground (Studio Minus, Steam early access 2019): a layered flesh/bone damage sandbox.
  - Melon Playground (mobile, around 2022): a sandbox clone with huge mobile download counts.
  - BeamNG.drive (2015 early access): soft-body crash sim, a YouTube staple.
  - Wreckfest (Bugbear, 2018).
  - Human: Fall Flat (2016).
  - Kick the Buddy (mobile, around 2015).
  - Turbo Dismount 2 (2025/2026, verified above).
  - Web ragdoll games on portals such as Poki and CrazyGames, and the HTML5 Happy Wheels.
  - Rag Doll Kung Fu (Mark Healey, 2005; reportedly the first third-party game on Steam; PS3 "Fists of Plastic" 2008) as the mouse-puppeteer control precedent.
  - Jackass: The Game (2007, PS2/PSP; Red Mile / Sidhe) as a licensed "injury stunt" game whose scoring details I could not confirm.
- **No usable data found:** web-specific performance ceilings (ragdoll body counts or physics engines on mid-range phones). That likely belongs to another research thread.
- **More searching is possible.** The shared WebSearch budget for this turn was exhausted, so a follow-up pass could fill the Happy Wheels, Toribash, Pain-modes, FlatOut-stunt-list and 2020–2026 gaps.
