# Impact timing gap fill: kill-cams, slow-mo, hitstop, impact frames and damage-number popups

Source tags used below. [code] means read directly from source code hosted on GitHub: a decompile, a reverse-engineered dump or an official release. [search summary] means the claim comes only from a web-search result summary. The page itself could not be fetched, because every non-GitHub host returned DNS or proxy errors in this environment. [secondary note] means a third-party research or notes file on GitHub that compiles the claim from a talk or video. Treat [search summary] and [secondary note] items as lower confidence.

## Burnout 3 / Revenge / Paradise crash cams, Takedown cams and Aftertouch (and Wreckfest)

### Takeaway
No published numbers exist for Burnout's crash-cam slow-mo factor, duration, cut count or Aftertouch time scale. Every source found is qualitative. Burnout's crash and Takedown cams cut away to slow-motion views of the wreck from several angles before returning to the player's car. Aftertouch ("Impact Time") lets the player steer the wreck along its momentum during the slowdown. Players complained that the crash cam could not be skipped in Paradise.

### Cited Findings
- Burnout 3: crashing enters a slow-motion state ("Impact Time"), and the player can steer the wrecked car during it. A GameSpot preview says the game slows time "down to a crawl". No factor is given. [search summary] — [GameSpot feature preview](https://gamespot.com/articles/burnout-3-takedown-feature-preview/1100-6104473/)
- Burnout 3 crash cam: after a Takedown, the camera focuses on the wrecked opponent in slow motion "for a short time" and then returns to the player's car. A reviewer says this cam can be turned off. [search summary] — [Gaming Pastime review](https://gamingpastime.com/burnout-3-takedown-xbox-review/)
- Aftertouch Takedown: if your wreckage hits an opponent while you steer it, you earn an Aftertouch Takedown, which refills boost. [search summary] — [GameSpot review](https://gamespot.com/reviews/burnout-3-takedown-review/1900-6106835/)
- Aftertouch steering follows momentum: the car cannot abruptly reverse its heading, but it can extend air time or carry the car up a ramp. The slowdown also puts the camera on the player's car. One source describes holding the trigger to slow everything and steer the wreck. [search summary] — [Burnout Wiki: Aftertouch](https://burnout.fandom.com/wiki/Aftertouch); [MobyGames](https://www.mobygames.com/game/14831/burnout-3-takedown/)
- In Crash mode, Aftertouch can steer the wreck into more vehicles to extend a pile-up, and it combines with the Crashbreaker explosion. [search summary] — [Worth Playing review](https://worthplaying.com/article/2004/9/22/reviews/19370/)
- Burnout Revenge: activating Aftertouch points the camera backward so the player can see oncoming traffic. Aftertouch Takedowns were removed, Crash mode became "Showtime", and the Crashbreaker must be primed before use. [search summary] — [TV Tropes: Burnout](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/Burnout?from=VideoGame.BurnoutRevenge)
- Burnout Paradise: hard crashes force a slow-motion replay that moves through several viewpoints of the wreck: the bonnet collapsing, windows shattering toward the camera, tyres rolling down the road. [search summary] — [bit-tech review](https://bit-tech.net/reviews/gaming/xbox/burnout_paradise/3/). A Gamecritics reviewer says Paradise's takedown view is toned down compared with earlier games. [search summary] — [Gamecritics review](https://gamecritics.com/brandon-erickson/burnout-paradise-review/)
- Players found the Paradise crash cam tiresome on repeat and asked for a way to disable it. Community replies said no such option exists. [search summary] — [Steam: "Any way to disable the dramatic crash camera?"](https://steamcommunity.com/app/24740/discussions/0/540744475532078726/); [GameFAQs: "Love the game, hate the cinemas and camera"](https://gamefaqs.gamespot.com/boards/933706-burnout-paradise/44439502)
- The original Burnout (2001) shows the crash from several angles before a replacement car appears. [search summary] — [Wikipedia: Burnout (video game)](https://en.wikipedia.org/wiki/Burnout_(video_game))
- Wreckfest: no source mentions a crash slow-mo or crash cam during play. Reviews only describe it as a Destruction Derby successor with detailed damage modelling. [search summary] — [bit-tech Wreckfest review](https://bit-tech.net/reviews/wreckfest-review/1)

### Inferences
- The design pattern is consistent across the Burnout series: slow down, cut to a dramatic angle on the wreck, give the player some steering during the slow-mo, then return to play. The repeated player complaints about forced, unskippable crash cams in Paradise are a direct warning for Number Go Down. Cinematic interruptions on every bone break need a frequency limit and a tap-to-skip.
- Aftertouch is a useful model for "steer the mascot while slowed after an impact". It is momentum-preserving nudging, not free control.

### Gaps
- No slow-mo time-scale factor, cam duration in seconds, cut count per crash or score-tally timing was found for Burnout 3, Revenge or Paradise. No frame-by-frame player analysis was found. Only footage exists: timing it from a YouTube crash compilation would be the way to get numbers.
- The earlier research pass's Skate 3 values remain the only concrete slow-mo curve.
- Wreckfest: nothing found on crash slow-mo, which suggests it has none during play.

## Sniper Elite (4, 5, Resistance) X-ray kill cam: sequence, skip options and frequency settings

### Takeaway
The X-ray kill cam follows the bullet from barrel to impact in slow motion, then shows an anatomical x-ray of bones and organs breaking. Sniper Elite 5 exposes separate frequency settings for bullet and melee kill cams ("none" up to "frequently"), plus on/off toggles for trap cams, X-ray and the kill-cam HUD. Players can also speed up or slow down the cam while it plays. No official timings in seconds or slow-mo factors were found.

### Cited Findings
- Sniper Elite 5 accessibility options:
  - Bullet kill cam frequency is adjustable from "none" to "frequently".
  - Melee kill cam frequency uses the same scale.
  - Trap kill cams (for example landmines) are On/Off.
  - The kill cam HUD overlay is On/Off.
  - X-Rays are On/Off.
  - [search summary] — [Rebellion: Sniper Elite 5 Accessibility](https://rebellion.com/accessibility/sniper-elite-5-accessibility/)
- The path is Options > Game > Bullet Kill Cameras. Setting it to "Frequently" makes non-headshots trigger a bullet cam more often. [search summary] — [Cultured Vultures guide](https://culturedvultures.com/sniper-elite-5-kill-cams/)
- Sniper Elite 5's "enhanced kill cam" lets players speed up or slow down the cinematic and adjust the camera angle in real time. No dedicated skip button is described. [search summary] — [Steam announcement: "Sniper Elite 5 Takes Kill Cam To The Next Level"](https://steamcommunity.com/games/1029690/announcements/detail/3225151657958368159); [GamingBolt](https://gamingbolt.com/sniper-elite-5s-latest-trailer-shows-off-enhanced-kill-cam-features)
- Sniper Elite 4 sequence: the cam triggers on long-range kills and follows the bullet from the moment it leaves the barrel until impact. It then shows bones and organs breaking or rupturing in slow motion, as an anatomically correct x-ray. The X-ray cam originated in Sniper Elite V2. Sniper Elite 4 added shrapnel, melee and stealth kill cams. [search summary] — [Christian Today](https://www.christiantoday.com/trends/sniper-elite-4-release-date-x-ray-kill-cam-and-better-ai-dropping-with-game-in-february); [CGMagazine](https://www.cgmagonline.com/articles/previews/sniper-elite-4-rebellion-gave-brendan-pie/)
- A reviewer describes bones fragmenting "into hundreds of pieces" and the brain compacting slightly as the bullet enters. [search summary] — [Neowin review](https://www.neowin.net/news/who-knew-war-could-be-so-gratifying-sniper-elite-4-review/)
- Multiplayer uses a short version that shows only the impact and a long version that shows the bullet's flight. This is user-reported. [search summary] — [Steam discussion](https://steamcommunity.com/app/312660/discussions/0/1620599015872989205/)

### Inferences
- Sniper Elite's settings are a good model for Number Go Down's x-ray bone-break shot: a frequency slider (off / rare / default / frequent), a separate X-ray toggle for squeamish or photosensitive players, and in-cam speed control. A short "impact only" variant for repeat breaks plus a long variant for the first or biggest break mirrors the multiplayer short/long split.

### Gaps
- No timings were found for the bullet-flight phase, the slow-down ramp, the x-ray layer transitions (skin, then muscle and organs, then skeleton) or the total cam length. Footage frame-counting would be needed.
- No data was found specific to Sniper Elite: Resistance (2025). It is assumed to inherit Sniper Elite 5's settings, but this is unverified.

## Mortal Kombat 9 / X / 11 X-ray and Fatal Blow timing

### Takeaway
The only number found is a community estimate: MK11 Fatal Blows average about 11 to 12 seconds. MK9 X-rays cost the full three-segment meter and show an internal bone and organ view in slow motion. No hit counts or durations were documented.

### Cited Findings
- MK11 Fatal Blows run about 11–12 seconds on average (a user estimate on the TestYourMight forum). A side-by-side timing comparison in the thread concluded they are only slightly longer than typical fighting-game supers. [search summary] — [TestYourMight: "Fatal Blow length"](https://testyourmight.com/threads/fatal-blow-length.70300/)
- A Fatal Blow can take about 25–30% of the opponent's health. [search summary] — [Twinfinite guide](https://twinfinite.net/guides/mortal-kombat-11-fatal-blows-how-perform-what-do/)
- MK9 (2011) meter: one level gives an enhanced special, two levels a combo breaker, and the full three levels the X-ray move. The X-ray is a series of attacks with an internal view showing bones and organs breaking or rupturing in slow motion. [search summary] — [Wikipedia: Mortal Kombat (2011)](https://en.wikipedia.org/wiki/Mortal_Kombat_(2011_video_game)); [MK Wiki: X-Ray](https://mortalkombat.fandom.com/wiki/X-Ray)
- Players report that MK9 PC X-ray slow-motion speed seemed to vary and sometimes ran "almost in slow motion". This is anecdotal and possibly a performance bug. [search summary] — [Steam: "A Different SlowMo problem"](https://steamcommunity.com/app/237110/discussions/0/864975026899358457/)
- MK11 replaced X-rays with Fatal Blows. [search summary] — [MK Wiki: X-Ray](https://mortalkombat.fandom.com/wiki/X-Ray)

### Inferences
- For a phone game, the MK model (about 10 s or more of cinematic for one big hit) is far too long to repeat. It suits at most one run-ending "finisher" bone break, and it would still need a skip.

### Gaps
- No hit counts per X-ray (commonly described as three-hit sequences, but unverified here), durations in seconds, or slow-mo factors were found for MK9, MKX or MK11. A claim on playmortalkombat.com about "internal NetherRealm documents" was not corroborated and is excluded.

## Max Payne 3 final-kill cam and bullet time, Superhot time scaling

### Takeaway
Max Payne 3's bullet cam fires on the last enemy in an area. The player can hold a button to slow it almost to a stop and can keep firing into the target. The cam accounts for weapon type and distance. No time-scale numbers are published. Superhot has no published time scale either. The developers say time is "very slow, not stopped" when the player stands still.

### Cited Findings
- The Max Payne 3 bullet cam triggers when the player kills the last living enemy in a room or area, similar to the kill cam in the first two games. [search summary] — [Max Payne Wiki: Bullet Cam](https://maxpayne.fandom.com/wiki/Bullet_Cam)
- Holding a button slows the bullet cam: one player says holding A slows it "almost to a stop", and the wiki says right-click on PC. Firing more rounds during the cam makes them hit, and one player unloaded half a clip into a target in full slow motion. [search summary] — [GameFAQs: "Very Slow Bullet Cam"](https://gamefaqs.gamespot.com/boards/958969-max-payne-3/62823065); [Max Payne Wiki: Bullet Cam](https://maxpayne.fandom.com/wiki/Bullet_Cam)
- The final kill takes into account the weapon type and the distance to the target. [search summary] — [Game Rant: Max Payne 3 tech video series](https://gamerant.com/max-payne-3-bullet-time-video/)
- Shootdodge engages slow motion. Unlike Max Payne 2, Max moves at the same slowed speed as the world rather than at superhuman speed. In "Last Man Standing", time slows and the reticle is drawn back to the enemy who shot Max, giving one last chance to revive. [search summary] — [TrueAchievements guide](https://www.trueachievements.com/game/Max-Payne-3/walkthrough/2); [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=391726164)
- Superhot: developer Tom Kaczmarczyk said that when you stand still, time is still "fairly slow". A developer reply on Steam said it is slowed so much that it gives "enough time to take a break". [search summary] — [Voices of VR #88](https://voicesofvr.com/88-tom-kaczmarczyk-on-the-vr-implementation-of-superhot-an-fps-where-time-moves-only-when-you-move/); [Steam discussion](https://steamcommunity.com/app/322500/discussions/0/1642038749319817377/)
- Time in Superhot never fully stops: distant bullets still move, very slowly. [search summary] — [Anime Harvest blog](https://theanimeharvest.wordpress.com/2016/02/09/superhot-the-fps-where-time-moves-only-when-you-move/). A Minecraft mod that copies the mechanic uses 1/20 speed, which is the mod author's value, not the game's. [search summary] — [9minecraft Superhot Mod](https://www.9minecraft.net/superhot-mod/)

### Inferences
- Max Payne 3 shows two transferable ideas. First, reserve the cinematic cam for the last or decisive event, not every event. Second, give the player a "hold to slow further" input during the cam. A hold-to-slow on the x-ray shot would let players savour big breaks and skip small ones.
- Superhot's lesson is to never use exactly 0 time scale when motion must still read. Hollow Knight does the same thing: its player-damage freeze targets 0.0001, not 0 (see the hitstop section).

### Gaps
- No time-scale factor was found for Max Payne 3 bullet time, Shootdodge or the bullet cam, and no frame-count analysis.
- The exact Superhot time scale while standing still is unverified. The commonly quoted 0.01 is not sourced.

## Hitstop values: Hollow Knight, Celeste, Street Fighter 6, Guilty Gear Strive, God of War, Monster Hunter (plus Nuclear Throne)

### Takeaway
Hard numbers exist from game code for Hollow Knight and Celeste, and from frame-data wikis for SF6 and GGST:

| Event | Freeze |
|---|---|
| Hollow Knight enemy kill | 0.04 s ramp down, 0.03 s hold, 0.04 s ramp up (about 0.11 s), plus a camera shake |
| Hollow Knight player hit | about 0.3 s near-freeze |
| Celeste dash | 0.05 s (3 frames) |
| Celeste bumper or explosion launch | 0.1 s |
| SF6 normals (Ed) | 9 / 11 / 13 frames (light / medium / heavy) |
| GGST counter hits | hitstop 21 or 31 frames plus 25 or 35 frames of half-speed slowdown, by tier |

God of War and Monster Hunter have only qualitative sources.

### Cited Findings
- **Hollow Knight, from decompiled `GameManager.FreezeMoment(int type)`** [code] — [GameManager.cs](https://github.com/ayushpaharia/hollow-knight-code/blob/HEAD/Assembly-CSharp/GameManager.cs). Each call is `FreezeMoment(rampDownTime, waitTime, rampUpTime, targetTimeScale)`:
  - type 0: 0.01 s ramp down, 0.35 s hold, 0.1 s ramp up, target time scale 0.
  - type 1: 0.04 s ramp down, 0.03 s hold, 0.04 s ramp up, target 0.
  - type 2: 0.25 s ramp down, 2 s hold, 0.25 s ramp up, target 0.15. This is a slow-mo rather than a freeze.
  - types 3, 4 and 5: 0.01 s, 0.25 s, 0.1 s, target 0.
  - The hold is counted in unscaled time, and the ramps use a `SetTimeScale(target, duration)` coroutine.
- Hollow Knight calls `FreezeMoment(1)` in these places [code] — [HealthManager.cs](https://github.com/ayushpaharia/hollow-knight-code/blob/HEAD/Assembly-CSharp/HealthManager.cs); [EnemyDeathEffects.cs](https://github.com/ayushpaharia/hollow-knight-code/blob/HEAD/Assembly-CSharp/EnemyDeathEffects.cs):
  - when an enemy dies in HealthManager, followed immediately by `cameraShakeFSM.SendEvent("EnemyKillShake")`;
  - in EnemyDeathEffects when `doKillFreeze` is set;
  - on lever strikes (BridgeLever, BossStatueLever).
  - A code search of the repository found no other `FreezeMoment` call sites. This suggests ordinary non-lethal nail hits do not freeze global time (an inference from the search).
- Hollow Knight player damage [code] — [HeroController.cs](https://github.com/ayushpaharia/hollow-knight-code/blob/HEAD/Assembly-CSharp/HeroController.cs); constants dump [code] — [hero_controller_constants.txt](https://raw.githubusercontent.com/Jeffjewett27/AriadneAgent/master/physics/hero_controller_constants.txt):
  - `FreezeMoment(DAMAGE_FREEZE_DOWN, DAMAGE_FREEZE_WAIT, DAMAGE_FREEZE_UP, 0.0001f)` with DAMAGE_FREEZE_DOWN = 0.001 s, DAMAGE_FREEZE_WAIT = 0.25 s and DAMAGE_FREEZE_UP = 0.05 s.
  - After the freeze come RECOIL_DURATION = 0.2 s and INVUL_TIME = 1.3 s.
- **Celeste, official source release of `Player.cs`** [code] — [NoelFB/Celeste Player.cs](https://github.com/NoelFB/Celeste/blob/master/Source/Player/Player.cs):
  - `DashBegin()` calls `Celeste.Freeze(.05f)`, which is 50 ms or 3 frames at 60 fps. It only does so when `Engine.TimeRate > 0.25f`, so there is no freeze stacking during slow-mo.
  - `RedDashBegin()` (red booster) freezes 0.05 s.
  - `ExplodeLaunch()` (bumpers, explosions) freezes 0.1 s together with `Input.Rumble(Strong, Medium)`.
  - Exiting a dream block freezes 0.05 s.
  - Smashing a crystal spinner freezes 0.01 s together with `level.Shake()` and a medium rumble.
- **Street Fighter 6:** hitstop on Ed's standing normals is 9 frames for 5LP, 11 for 5MP and 13 for 5HP. [search summary] — [SuperCombo: SF6 Ed frame data](https://wiki.supercombo.gg/w/Street_Fighter_6/Ed/Frame_data)
  - Medium and heavy jumping normals typically have 11 frames of hitstop or more. [search summary] — [SuperCombo: SF6 E.Honda data](https://wiki.supercombo.gg/w/Street_Fighter_6/E.Honda/Data)
  - General rule: heavier attacks have longer hitstop, and some Punish Counters with special effects have extra-long hitstop. [search summary] — [SuperCombo: SF6 Game Data](https://srk.shib.live/w/Street_Fighter_6/Game_Data)
  - Projectiles hitting Drive Impact armour add 6 frames of hitfreeze per hit. [search summary] — [Street Fighter Wiki: Drive Impact](https://streetfighter.fandom.com/wiki/Drive_Impact)
  - The Ed table was about 2 years old at search time, so patches may have changed values.
- **Guilty Gear Strive** counter-hit tiers [search summary] — [Dustloop: GGST Frame Data](https://www.dustloop.com/w/GGST/Frame_Data); [Dustloop: GGST Mechanics](https://www.dustloop.com/w/GGST/Mechanics); [Dustloop: GGST Esoterica](https://www.dustloop.com/w/GGST/Esoterica):

  | Tier | Hitstop | Slowdown | Extra frame advantage | Notes |
  |---|---|---|---|---|
  | Very Small | base | none | none | community term, not official |
  | Small | — | 11 frames | +6 | |
  | Mid | 21 frames | 25 frames | +13 | |
  | Large | 31 frames | 35 frames | +18 | the camera also zooms |

  - "Slowdown" makes the opponent act at half speed. On odd slowdown frames the opponent is fully frozen.
  - For comparison, the older GG Accent Core +R attack levels have 11–15 frames of hitstop (level 1 to level 5). [search summary] — [Dustloop: GGACR Attack Attributes](https://www.dustloop.com/w/GGACR/Attack_Attributes)
- **God of War (2018):** "a subtle technique that freezes both Kratos and the target in the impact pose for a brief moment… emphasizes the connection of the swing and can simulate resistance on the follow-through." No frame counts are given. [search summary] — [PlayStation Blog, 2022-10-04](https://blog.playstation.com/2022/10/04/game-developers-explain-what-makes-god-of-war-2018s-combat-tick/). A GDC 2019 talk (Mihir Sheth, "Evolving Combat in God of War for a New Perspective") exists but was not read. [secondary note] — [GDC Vault](https://www.gdcvault.com/play/1026423/Evolving-Combat-in-God-of)
- **Monster Hunter:** a modder says every MH title before Rise had "quite a lot of hitstop" and that Rise decreased it significantly. Great Sword charge hits look chunkier in Iceborne than in Rise. Hitstop is defined per attack in the weapon files, so a global multiplier barely affects Dual Blades and Sword & Shield. [search summary] — [Nexus Mods: More Hit Stop (MH Rise)](https://www.nexusmods.com/monsterhunterrise/mods/221?tab=posts). A GameFAQs poster says 4U's hitstop "was great on slower weapons but made faster weapons feel really sluggish". [search summary] — [GameFAQs thread](https://gamefaqs.gamespot.com/boards/300976-monster-hunter-rise/79263278)
- **Nuclear Throne (Vlambeer):** in a community recreation that aims to port the base game's `Sleep()` calls, the `sleep(ms)` busy-wait is scaled by an options multiplier `opt_freeze`. Values in milliseconds [code, fan recreation] — [toarch7/nt-recreated-public sleep.gml](https://github.com/toarch7/nt-recreated-public/blob/HEAD/scripts/sleep/sleep.gml); [enemy/Destroy_0.gml](https://github.com/toarch7/nt-recreated-public/blob/HEAD/objects/enemy/Destroy_0.gml):

  | Event | Sleep |
  |---|---|
  | Enemy death | 20 + size × 15 ms |
  | Disc hit | 10 ms |
  | Plasma ball impact | 10 ms |
  | Laser cannon and Devastator hits | 5 ms |
  | Slug wall bounce | 1 ms |
  | Flak explosion | 20 ms |
  | Hyper grenade | 50 ms |
  | Scrap boss death | 50 ms |
  | Big or huge plasma spawn | 100 ms |
  | Flare | 100 ms |
  | Super flak | 100 ms |

  The project's TODO says not all base-game `Sleep()` cases have been ported yet.

### Inferences
- Across these games, a "normal" impact freezes for 50–110 ms: Celeste dash 50 ms, Hollow Knight kill about 110 ms, Nuclear Throne small-enemy death 35 ms (20 + 1 × 15). A "big" impact freezes for 100–300 ms: Celeste launch 100 ms, Hollow Knight player hit about 300 ms, GGST Large counter 31 frames (about 517 ms) plus slowdown. Bigger freezes are reserved for rare, high-stakes events.
- Scaling freeze by size, as Nuclear Throne does with 20 + size × 15 ms, maps cleanly to bone size or break severity. For example, a finger break would get about 35 ms and a femur or skull about 110 ms or more.
- Hollow Knight's pattern of a short freeze paired with a camera-shake event on kills is a good template. Its type-2 freeze (ramp to 0.15× over 0.25 s, hold 2 s, ramp back over 0.25 s) is a ready-made "dramatic slow-mo" curve close to the Skate 3 values from the earlier pass.
- Two implementation details are worth copying:
  - Celeste skips the freeze if time is already slowed (TimeRate ≤ 0.25), which prevents stacked freezes during slow-mo.
  - Hollow Knight times the hold in unscaled time.
- GGST's tiered table (hitstop plus a separate slowdown period plus a camera zoom at the top tier) is a direct template for minor, major and "x-ray worthy" bone-break tiers.

### Gaps
- Exact SF6 hitstop for specials, Super Arts, Drive Impact on clean hit and Punish Counter extras is not confirmed. The search summary did not give them.
- No numeric hitstop was found for God of War 2018 or Ragnarök, or for any Monster Hunter title. The Sheth GDC slides PDF could not be fetched.
- No primary data was found on Hollow Knight's nail-hit enemy flash or recoil timings beyond the freeze calls.

## Jan Willem Nijman, "The Art of Screenshake" (INDIGO 2013): the technique list and the "sleep" duration

### Takeaway
The talk adds about 30 tricks in a fixed order to a bland shooter, with "sleep" (hitstop) as roughly step 17 at about 18:06. According to people who checked the talk and its recreations, it gives no numeric durations or amplitudes. Claims of "1–2 frames", "tens of ms" or "100–200 ms" for sleep are inferences by later writers. Vlambeer's own practice, as reconstructed in Nuclear Throne, uses sleeps of 1 to 100 ms by event, scaled by enemy size.

### Cited Findings
- Ordered list with timestamps, compiled by a researcher who watched the talk:

  | Time | Step |
  |---|---|
  | 7:24 | baseline |
  | 8:28 | animations and sound |
  | 9:03 | lower enemy HP |
  | 9:28 | higher rate of fire |
  | 9:45 | more enemies |
  | 10:13 | bigger bullets |
  | 10:39 | muzzle flash |
  | 10:58 | faster bullets |
  | 11:19 | less accuracy |
  | 11:46 | impact effects |
  | 12:10 | hit animation |
  | 12:42 | enemy knockback |
  | 13:18 | permanence |
  | 14:49 | camera lerp |
  | 15:27 | camera position offset |
  | 16:36 | screen shake |
  | 17:15 | player knockback |
  | 18:06 | sleep (hitstop) |
  | 19:52 | gun delay |
  | 20:01 | gun kickback |
  | 20:23 | strafing |
  | 20:36 | shell casings |
  | 21:43 | more bass |
  | 23:16 | machine-gun mode |
  | 23:54 | random explosions |
  | 23:59 | faster enemies |
  | 24:40 | more enemies |
  | 25:09 | higher rate of fire plus camera kick |
  | 26:47 | bigger explosions |
  | 27:54 | more permanence (smoke) |
  | 29:04 | meaning (stakes) |
  | 31:00 | balancing |

  The same note says the talk and two community recreations (colinbellino/screenshake and an itch.io recreation) "publish no amplitude, duration or frame values". [secondary note] — [Stephenuffugus/Sweet-Spot RESEARCH.md](https://github.com/Stephenuffugus/Sweet-Spot/blob/HEAD/shardfall/design/RESEARCH.md)
- A second compiled ordering agrees, ending "→ meaning → death animation", and cites the Engineering of Conscious Experience timestamp notes. [secondary note] — [aarohkandy/cadygame feel.md](https://github.com/aarohkandy/cadygame/blob/HEAD/docs/design/research/emotion/feel.md); original notes: [Engineering of Conscious Experience](https://theengineeringofconsciousexperience.com/jan-willem-nijman-vlambeer-the-art-of-screenshake/) [search summary]
- That blog's breakdown describes sleep as "a momentary pause when hitting enemy". A developer who tested it says the freeze works only in the "sweet spot before players become conscious of the freeze". [search summary] — [Engineering of Conscious Experience](https://theengineeringofconsciousexperience.com/jan-willem-nijman-vlambeer-the-art-of-screenshake/); [Blue Tengu experiments](https://www.bluetengu.com/2014/12/12/art-of-screenshake-experiments/)
- Summaries disagree on the direction of camera kick. One says "move camera in opposite direction of shooting", another "in the direction of the action/shooting". [search summary] — [Engineering of Conscious Experience](https://theengineeringofconsciousexperience.com/jan-willem-nijman-vlambeer-the-art-of-screenshake/); [Bloodirony: Art of Screenshake in Unity2D](https://www.bloodirony.com/blog/the-art-of-screenshake-in-unity2d)
- Conflicting secondary claims about sleep length:
  - "pause 1–2 frames when enemies die, the player is hit, things explode" [secondary note] — [jjoaqu7/prisongame design-references.md](https://github.com/jjoaqu7/prisongame/blob/HEAD/docs/research/combat/notes/design-references.md), citing Blue Tengu
  - "freezing the frame ~100–200ms on impactful hits" [secondary note] — [zfert99 web-design-and-game-juice.md](https://github.com/zfert99/Puzzle-Generator/blob/HEAD/Docs/research/web-design-and-game-juice.md)
  - "sleep 几十毫秒" ("sleep tens of milliseconds") [secondary note] — [liujiangmu123 research note](https://github.com/liujiangmu123/auto-motion-motion-knowledge-pack/blob/HEAD/rules/research/2026-07-20-西方动画运动经典调研.md)
- The talk video is on YouTube, and archive.org hosts a copy. [secondary note] — [YouTube AJdEqssNZ-U](https://www.youtube.com/watch?v=AJdEqssNZ-U); [archive.org](https://archive.org/details/the-art-of-screenshake)
- Vlambeer-style sleep values in Nuclear Throne run from 1 to 100 ms, with enemy death at 20 + size × 15 ms (see the hitstop section). [code, fan recreation] — [toarch7/nt-recreated-public](https://github.com/toarch7/nt-recreated-public/blob/HEAD/objects/enemy/Destroy_0.gml)

### Inferences
- The best-supported answer to "what sleep duration did Nijman use?" is that the talk does not state one. Vlambeer's shipped practice, as reconstructed from Nuclear Throne, is tens of milliseconds for ordinary deaths and up to 100 ms for big explosions. Citing "100–200 ms" as Vlambeer's figure is unsupported.
- The talk's order of operations is itself guidance. Screen shake and sleep come late, after impact effects, hit animation, knockback and permanence. For Number Go Down, the break visual, bone-crack SFX, ragdoll reaction and lasting marks such as bruises should exist before stacking shake and freeze.

### Gaps
- No verbatim transcript was accessible to confirm whether Nijman says a number aloud in the sleep segment. The secondary note says no number is given, but this could not be verified first-hand.

## Anime-style "impact frames" in games: Hi-Fi Rush, Sifu, Jujutsu Kaisen and Dragon Ball games, Guilty Gear Strive

### Takeaway
No developer documentation or frame counts were found for impact frames in any of these games. The only concrete evidence is player discussion: Sparking! Zero's very brief black-and-white flash on big hits, which some players found harsh and wanted an option to turn off. Hi-Fi Rush's comic-book onomatopoeia on hits and GGST's counter-hit slowdown and zoom are the nearest documented equivalents.

### Cited Findings
- Dragon Ball: Sparking! ZERO: players describe a brief black-and-white frame during big attacks. One compared it to a flashbang and asked for it to be removed or made optional, saying it was not in older Sparking games. Others defended it as a standard impact frame "found all over high-budget anime". [search summary] — [Steam discussions, Sparking! ZERO](https://steamcommunity.com/app/1790600/discussions/0/4846527331298874206/). Fans praised the effect at reveal in March 2024 ("Impact Frames in Dragon Ball Sparking Zero are INSANE"). [search summary] — [X post](https://x.com/Zakashiii/status/1770462904833265952?lang=en)
- No in-game toggle for the Sparking! ZERO flash was confirmed. A commenter suggested only mods could remove it. [search summary] — [Steam discussions](https://steamcommunity.com/app/1790600/discussions/0/4846527331298874206/)
- Hi-Fi Rush: each movement and impact is "punctuated with a comic book flare declaring 'clunk', 'bang', 'pow'". Attacks land only on the beat: one beat for a light attack, two for a heavy. [search summary] — [Lap Full of Crumbs review](https://lapfullofcrumbs.net/2024/05/22/hi-fi-rush-review/); [PCWorld](https://www.pcworld.com/article/1485054/hi-fi-rush-is-a-colorful-beat-em-up-that-lacks-variety-but-not-personality.html)
- Guilty Gear Strive: on a big counter hit "the weight of the blow sends the opponent flying in slow motion, but the attacker can move freely". This is the slowdown mechanic, with Large counter hits also zooming the camera. [search summary] — [gamesoftrobo Substack](https://gamesoftrobo.substack.com/p/what-does-guilty-gear-strive-do-right); [Dustloop: GGST Mechanics](https://www.dustloop.com/w/GGST/Mechanics)
- Sifu: Sloclap describes balancing "credibility" (realistic techniques, faithful animation) against "crisp action and immersive camera framings". Structure breaks unlock a takedown. No hitstop or impact-frame specifics were given. [search summary] — [PlayStation Blog: How Sifu's kung fu combat works](https://blog.playstation.com/2021/11/18/how-sifus-kung-fu-combat-works/)
- An academic study (Lin et al., 2022) found that impact feel depends on hit stop, sound coherence and camera control, based on analysing player reviews of top action games. [search summary] — [Lin et al. 2022 PDF](https://faculty.washington.edu/zkwen/articles/lin22features.pdf)

### Inferences
- An impact frame here means a one- to few-frame full-screen palette swap: inverted or black-and-white silhouettes, often with radial lines. It reads as very strong on big hits, but it is a photosensitivity and comfort risk if used often. The Sparking! ZERO backlash suggests reserving it for the rarest, biggest event (for example the x-ray "money shot" or a skull break) and putting it behind the same toggle as flashes, in line with the WCAG limits from the earlier pass.
- Hi-Fi Rush's approach (diegetic comic text such as "CRACK!" or "SNAP!" at the impact point) gives impact emphasis without a full-screen flash, which suits a cartoon emo mascot.

### Gaps
- No frame counts, colour specs or frequency data were found for impact frames in Hi-Fi Rush, Sifu, Jujutsu Kaisen Cursed Clash, Sparking! ZERO or GGST. The Hi-Fi Rush GDC 2024 talk and any Sifu GDC talk could not be located by search. Frame-stepping footage is the only route.

## Damage-number and score-popup design: Borderlands, Diablo, Vampire Survivors, Path of Exile, Brotato, Peggle, and Balatro's scoring animation

### Takeaway
Balatro's full scoring timing is readable in its Lua source (version 1.0.1o):

| Element | Value |
|---|---|
| Time per trigger | about 0.75–0.94 s at 1× speed |
| Pitch per trigger | rises 1.6% |
| Card wobble | 0.4 s |
| Screen jiggle per popup | adds 0.7 |
| Score transfer | 0.4 s pause, then hand total "pulses"; 0.8 s later a lerp of 0.5 s into the round score |
| Flames | ignite only when this single hand's chips × mult already meets the whole blind |
| Speed options | 0.5×, 1×, 2×, 4× |
| Auto-acceleration | long scoring sequences speed up on their own after about 10 s |

Other games mainly offer colour coding (Diablo 4, Borderlands) and on/off toggles (Vampire Survivors, Brotato). Path of Exile deliberately has no floating numbers. Peggle's Extreme Fever is the classic "zoom plus slow-mo plus music before the tally" moment.

### Cited Findings
**Balatro scoring animation** [code], read from the reverse-engineered Lua of Balatro 1.0.1o in [balatro-src/balatro-src-reverse-engineering](https://github.com/balatro-src/balatro-src-reverse-engineering).

*Per-trigger popups* — [functions/common_events.lua `card_eval_status_text`](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/functions/common_events.lua#L779-L920):
- Base delay is 0.65 s. All delays are then multiplied by 1.25.

  | Trigger | Delay | Sound | Colour | Popup motion |
  |---|---|---|---|---|
  | Chips | 0.6 × 1.25 = 0.75 s | `chips1` | blue | — |
  | Mult (+Mult) | 0.65 × 1.25 = 0.81 s | `multhit1` | red | "fade", scale 0.7 |
  | X-mult | 0.81 s | `multhit2` at 0.7 volume | XMULT | "fade" |
  | Joker or extra | 0.75 × 1.25 = 0.94 s | varies | varies | "fall" |

- The popup `attention_text` is held for (delay − 0.2) s.
- Each popup also calls `card:juice_up(0.6, 0.1)` and adds `G.ROOM.jiggle += 0.7` (screen wobble).

*Rising pitch* — [functions/state_events.lua](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/functions/state_events.lua#L607-L608):
- Sounds play at pitch `0.8 + percent × 0.2`.
- In `evaluate_play`, `percent` starts at 0.3 and rises by `percent_delta = 0.08` per trigger.
- So the pitch climbs by 0.016 (1.6%) with each successive trigger in a hand: about 0.88 at the first trigger, 1.02 by the tenth and 1.18 by the twentieth.

*Card juice* — [engine/moveable.lua `juice_up`](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/engine/moveable.lua#L250-L275):
- Lasts 0.4 s.
- The visual scale is snapped to `1 − 0.6 × amount` and then springs back.
- The scale oscillation is `amount × sin(50.8 t) × (remaining/0.4)^3`, about 8 Hz with cubic decay.
- The rotation is `r_amt × sin(40.8 t) × (remaining/0.4)^2`, about 6.5 Hz.
- It is disabled entirely when the "reduced motion" setting is on.

*Screen jiggle* — [functions/common_events.lua `update_canvas_juice`](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/functions/common_events.lua#L1125-L1146):
- Jiggle decays by a factor of `(1 − 5 dt)` per frame, roughly e^(−5t), a half-life of about 0.14 s.
- The wobble is sinusoidal, not random noise: x ≈ 3.2 Hz (19.9 rad/s), y ≈ 3.5 Hz (21.9 rad/s), rotation ≈ 6.4 Hz (39.9 rad/s).
- It is scaled by the screenshake setting (default 50, or 0 under reduced motion).
- Bigger events add +1, +2 or +3 jiggle.

*End-of-hand tally* — [functions/state_events.lua](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/functions/state_events.lua#L1029-L1060). After all triggers:
- 0.4 s wait, then chips and mult reset to 0 and the hand total `chip_total = floor(chips × mult)` appears with a `pulse(0.5)` and a "button" sound (pitch 0.9, volume 0.6).
- `delay(0.8)`, then the `chips2` sound.
- The round score `G.GAME.chips` lerps up to its new value over 0.5 s, while the hand total simultaneously lerps down to 0 over 0.5 s, so the number visibly "pours" across.
- 0.3 s wait.
- Elsewhere, `ease_chips` uses a 0.3 s lerp with `juice_up` and a `chips2` sound — [common_events.lua](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/functions/common_events.lua#L41-L66).

*Chips and mult box updates* — [common_events.lua `update_hand_text`](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/functions/common_events.lua#L495-L560):
- The default delay is 0.8 s.
- A "+delta" label covers the chips or mult box for 1 s (green for a gain, red for a loss).
- The mult box gets `juice_up()`.
- The hand name pulses at 0.2.

*Flames* — [functions/button_callbacks.lua `flame_handler`](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/functions/button_callbacks.lua#L1963-L2034):
- The flame shader on the chips and mult boxes only gets intensity when `chips × mult ≥ blind requirement`, that is, when this one hand alone beats the blind's full target.
- Intensity = max(0, log₅(score) − 2). It is 0 at 25, 1 at 125, 2 at 625, 3 at 3,125 and so on.
- The displayed intensity springs toward the target, and the flame animation speeds up by ×(1 + 0.2 × intensity).
- Flames are coloured blue for chips and red for mult, each mixed with yellow for an accent.

*Fire and organ audio* — [functions/misc_functions.lua](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/functions/misc_functions.lua#L738-L754):
- Ambient fire loops fade in with flame intensity.
- An "organ" drone fades in at volume `min(0.4, 0.1 × log₅(score / required))`, so it swells as the hand overshoots the target.

*Game speed* — [functions/UI_definitions.lua](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/functions/UI_definitions.lua#L2302); [game.lua](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/game.lua#L2484-L2498):
- The game-speed options are 0.5, 1, 2 and 4.
- While a hand is scoring, an accumulator `G.ACC` grows at 0.2 × gamespeed per second, capped at 16.
- Effective speed is `gamespeed + max(0, ACC − 2)`. At 1× speed, scoring starts accelerating after 10 s, reaches 3× at 20 s and caps at 15× (18× at the 4× setting).

**Balatro developer statements**
- LocalThunk says the chip × mult mechanic already existed when he added the flaming score effect. He initially disliked it, then decided it "really fit perfectly" with the game. [search summary] — [LocalThunk: The Balatro Timeline](https://localthunk.com/blog/balatro-timeline-3aarh)
- He cites Luck Be a Landlord's scoring as an inspiration and says most of the design came from trial and error. [search summary] — [Wikipedia: Balatro](https://en.wikipedia.org/wiki/Balatro); [TouchArcade interview](https://toucharcade.com/2024/03/18/balatro-interview-mobile-port-localthunk-dlc-plans-updates-new-jokers-demo-feedback/)
- A third-party "juice stack" analysis describes rolling digits, score-scaled shake, particles trailing the score and a rising note per scored card. It is not developer-sourced. The rising-note claim is confirmed by the code above. [search summary] — [Blake Crosley: Balatro design guide](https://blakecrosley.com/guides/design/balatro)

**Other games**
- Diablo 4 damage-number colours: white for a normal hit, yellow for a critical, aqua or blue for Overpower, orange for a critical Overpower. A base 5% crit chance and +50% crit damage were cited by a guide that may be outdated. No official size spec was found. [search summary] — [AlcastHQ](https://alcasthq.com/diablo-4-why-does-combat-text-have-different-colours/); [Blizzard forums](https://us.forums.blizzard.com/en/d4/t/what-are-the-four-damage-colors-please-normal-crit-overpower-and/203037)
- Players asked Blizzard for per-type toggles (normal, crit, DoT, minions, NPCs) and custom colours. This is a suggestion thread, not a shipped feature. [search summary] — [Blizzard forums suggestion](https://us.forums.blizzard.com/en/d4/t/suggestion-detailed-options-for-combat-text-customisable-colors-and-minion-numbers-with-picture/204356)
- Borderlands: elemental damage-over-time shows "a stream of numbers in the appropriate elemental colour", for example green for corrosive. The element palette is blue for shock, green for corrosive, red or orange for incendiary and yellow for explosive. No source was found on the critical-text design or the number arc. [search summary] — [Borderlands Wiki: Elemental damage](https://borderlands.fandom.com/wiki/Elemental_damage/Borderlands)
- Vampire Survivors: a Damage Numbers toggle exists in Options (Gameplay, also in Favourites). A July 2022 patch fixed hiding damage numbers also hiding recovery numbers. Players switch them off for clutter or performance. [search summary] — [Vampire Survivors Wiki: Options](https://vampire.survivors.wiki/w/Options); [Steam discussion](https://steamcommunity.com/app/1794680/discussions/0/3470612993483101082/)
- Brotato: damage numbers can be turned off in Options. [search summary] — [Steam discussion](https://steamcommunity.com/app/1942280/discussions/0/3364776031338858779/)
- Path of Exile has no floating combat text. Players relay, second-hand, that the developers cite immersion and performance. PoE 2 shows a DPS number above the boss health bar during boss fights, and players repeatedly request a toggle. No first-party quote was found. [search summary] — [PoE forum: "Why PoE doesn't need floating combat text"](https://www.pathofexile.com/forum/view-thread/64932); [PoE 2 feedback thread](https://www.pathofexile.com/forum/view-thread/3614156); [Gamers and Geek guide](https://gamersandgeek.com/how-to-see-damage-numbers-in-poe-2/)
- Peggle's Extreme Fever: when the last orange peg is about to be hit, the camera zooms in on the ball and goes into slow motion while "Ode to Joy" plays. A near miss makes the choir groan.
  - Then the bottom of the board becomes five bins of different values. The score adds the bin plus any unused balls.
  - Ultra Extreme Fever (all pegs cleared) makes every bin 100,000.
  - The community scoring formula is bF + aF + H + m × 10,000, where m is the number of unshot pegs.
  - Per a community wiki, the feature began as a placeholder text plus music and was then upgraded with the ball zoom.
  - [search summary] — [Peggle Wiki: Scoring System](https://peggle.fandom.com/wiki/Scoring_System); [Peggle Deluxe wiki](https://chace-dream-company.fandom.com/wiki/Peggle_Deluxe); [TV Tropes: Peggle](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/Peggle)

### Inferences
- Balatro's recipe maps almost one-to-one onto "Number Go Down" damage tallies:
  1. Sequential per-event popups of about 0.75–0.94 s each, at the impact point, colour-coded by type.
  2. A pitch rising 1.6% per event within one flight.
  3. A short squash and 8 Hz wobble on the struck element (the bone or limb label).
  4. A small decaying screen wobble per event.
  5. A final "pour" of the flight total into the run total over 0.5 s, after a 0.4–0.8 s beat.
  6. Speed options plus automatic acceleration of long chains, so 30-break flights don't drag.
- On a phone, 0.75 s per break is too slow for dense break chains. Balatro's own accelerator makes the case for compressing the cadence after the first several events.
- Balatro's flame threshold is worth copying: flames appear only when this flight alone beats the level target. The visual escalation is then tied to "you've already won" rather than to raw size, and log-scaled intensity keeps it from saturating.
- Diablo and Borderlands colour schemes suggest a small fixed palette per damage type, for example plain break white, compound fracture yellow and x-ray crit orange. Vampire Survivors, Brotato and PoE show that some players want numbers off, so provide a toggle.
- Peggle's sequence (detect a near-final decisive event, zoom, slow-mo, music sting, then a tally phase with bonus bins) is a good template for the course's final drop and the run-end tally.

### Gaps
- Balatro values come from a reverse-engineered dump of version 1.0.1o. Later patches may differ.
- No first-party design talk on Balatro's juice was found. The Game Maker's Notebook podcast and the Game Informer interview were not checked.
- No numeric specs were found for Borderlands or Diablo number size, arc, lifetime or stacking. Brotato's popup timing was not found (its source is not public).
- Peggle's slow-mo factor, zoom amount and tally count-up speed were not found.

## Masahiro Sakurai's videos on hitstop, screen shake and effects: specific recommendations

### Takeaway
Sakurai's hitstop recommendations from Smash Ultimate:
1. The victim shakes more than the attacker.
2. Hurtboxes do not move with the visual shake.
3. On the ground the shake is horizontal only; in the air it goes in all directions.
4. Shake amplitude decays.
5. Hitstop length is set per attack by a coefficient (Marth's tip is stronger than his blade).
6. The hit pose blends in over about 4 frames.
7. The attacker drifts very slightly during the stop.
8. Shake amplitude scales with camera distance.

His screen-shake video recommends:
- a strong start that decays, with randomness;
- choosing between moving the camera (3D) and moving the rendered image (2D, at the cost of the UI shaking and black borders showing);
- several presets by size and duration;
- scaling by field of view.

He coins "boss stop" for the pause when a boss is defeated.

### Cited Findings
- "Eight Hit Stop Techniques" video (YouTube tycbMSjDDLg). The seven Smash Ultimate items with Japanese quotes: 1 "やられた相手をより大きくぶれさせる" (shake the victim more), 2 "やられ判定はぶれない" (the hurtbox doesn't shake), 3 "地上では横、空中では全方向" (horizontal on the ground, all directions in the air), 4 "振幅は徐々に収束" (amplitude gradually converges), 5 hitstop size control via a coefficient (Marth's sword tip stops harder than the base), 6 the hit pose is interpolated over about 4 frames, 7 the attacker moves very slightly during hitstop (sword-slide feel, and it can be toggled). It also covers extra hitstop for electric hits and multiplayer adjustments. [secondary note: a distilled, transcript-based summary] — [patchouli-handbook: Eight Hit Stop Techniques evidence](https://github.com/Tritium0041/patchouli-handbook/blob/HEAD/example/masahiro-sakurai-on-creating-games/evidence/tycbMSjDDLg.md); video: [YouTube tycbMSjDDLg](https://www.youtube.com/watch?v=tycbMSjDDLg)
- The compilation video adds that shake amplitude changes with camera distance, "カメラの距離で振幅は変わる", so hits read the same when zoomed in or out (at 16:16). [secondary note] — [patchouli-handbook evidence 5MBxBsF6-vg](https://github.com/Tritium0041/patchouli-handbook/blob/HEAD/example/masahiro-sakurai-on-creating-games/evidence/5MBxBsF6-vg.md)
- Nintendo Wire's coverage of the follow-up video describes "eight different ways to enhance hit stop", including shaking the struck character, controlling the pause length and adjusting shake for camera distance. [search summary] — [Nintendo Wire: This Week in Sakurai 12/5–12/11](https://nintendowire.com/news/2022/12/12/this-week-in-sakurai-12-5-12-11-fine-tuning-hit-stop-and-cheating-the-system/)
- "Stop for Big Moments!" (OdVkEOzdCPw):
  - "ストップ演出どんどん入れていきましょう" ("let's keep adding stop effects").
  - Hit stop on attacks, and "boss stop" (his own term) when a boss is defeated. Kirby's Adventure on the Famicom already did a boss stop.
  - Fantasy Zone (1986) freezes the screen briefly at the moment of collision, inherited from Defender (1980).
  - Smash's finishing "special" zoom is an extension of boss stop.
  - Use stops for being hit as well as for hitting.
  - Recommends stops in every genre.
  - [secondary note] — [patchouli-handbook evidence OdVkEOzdCPw](https://github.com/Tritium0041/patchouli-handbook/blob/HEAD/example/masahiro-sakurai-on-creating-games/evidence/OdVkEOzdCPw.md); [search summary] — [Nintendo Wire](https://nintendowire.com/news/2022/12/12/this-week-in-sakurai-12-5-12-11-fine-tuning-hit-stop-and-cheating-the-system/)
- "Screen Shake" video (2JXR7IASSog) [secondary note] — [patchouli-handbook evidence 2JXR7IASSog](https://github.com/Tritium0041/patchouli-handbook/blob/HEAD/example/masahiro-sakurai-on-creating-games/evidence/2JXR7IASSog.md):
  - "画面を振動させること…大きなショックを表現するのにうってつけ" ("shaking the screen is ideal for expressing a big shock").
  - There are two methods. Moving the camera loses effect on distant objects. Moving the rendered image also shakes the UI and exposes black borders.
  - Smash has several patterns (large, medium, small, sustained).
  - Strength is adjusted by field of view: narrow-FOV stages like Flat Zone get reduced shake.
  - The pattern is strong then decaying, with randomness.
  - "画面振動がないゲームってかなり味気ない" ("games without screen shake are pretty bland"), but excessive shake makes the screen unreadable.
- "Hit Marks" video (B-P4ysHSjCg), seven conditions for hit-effect sprites [secondary note] — [patchouli-handbook evidence B-P4ysHSjCg](https://github.com/Tritium0041/patchouli-handbook/blob/HEAD/example/masahiro-sakurai-on-creating-games/evidence/B-P4ysHSjCg.md):
  1. As flashy as the hit is worth.
  2. Clear contrast and outline.
  3. Placed exactly where the hitbox and hurtbox meet.
  4. Combine several elements (a shockwave punching through, splashes flying up, sparks).
  5. Don't over-cover the characters; lower opacity if needed.
  6. A short lifetime suited to combos.
  7. Mix bright and dark elements so the mark reads on any background. Smash puts black behind hit marks.
- Effects compilation (w8iJGj9n2uA) [secondary note] — [patchouli-handbook evidence w8iJGj9n2uA](https://github.com/Tritium0041/patchouli-handbook/blob/HEAD/example/masahiro-sakurai-on-creating-games/evidence/w8iJGj9n2uA.md):
  - Additive colour effects are easy but get blurry and only show on dark backgrounds. Pair them with solid, crisp shapes.
  - Explosions follow flash, then blast smoke, then black smoke, then dissipation. Mix dark colours into the flash so it reads on white backgrounds.
  - Hit marks keep animating during hitstop, and the longer stop time should be used well.
  - In Smash, the victim's input during hitstop shows an effect indicating the launch direction.
- "Visual Effects in Slow Motion" video: effects pass too fast to notice, but turning them off makes the game bland. "エフェクトをバンバン出していきましょう" ("let's put out effects generously"). [secondary note] — [patchouli-handbook evidence 353K_6kPqeE](https://github.com/Tritium0041/patchouli-handbook/blob/HEAD/example/masahiro-sakurai-on-creating-games/evidence/353K_6kPqeE.md)
- Famitsu column vol. 490–491 (2015): both parties freeze, longer hitstop for more damage, with a cap. Projectiles get minimal hitstop. Characters vibrate during the freeze, and the attacker only slightly. [secondary note] — [aarohkandy/cadygame feel.md](https://github.com/aarohkandy/cadygame/blob/HEAD/docs/design/research/emotion/feel.md), citing [Source Gaming translation](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/)

### Inferences
- For a ragdoll bone break:
  - Shake the victim (the mascot) during the freeze, not the camera alone.
  - Keep physics positions fixed and offset only the rendered transform, mirroring "the hurtbox doesn't shake".
  - Decay the shake amplitude.
  - Scale the freeze length by a per-bone coefficient.
  - Blend into the "broken" pose over about 4 frames.
  - Scale shake by the current camera zoom, since the camera zooms in on breaks.
- "Boss stop" maps to a run-ending stop on the final or biggest break.
- Sakurai's hit-mark rules suggest each break VFX should be a crisp shape plus a dark backing, placed exactly at the break point, short-lived, and never covering the mascot's face.

### Gaps
- Sakurai gives no frame counts in these videos beyond the about 4-frame pose blend. The Smash hitlag formulas are covered by the earlier pass.
- The video summaries come from a third-party, AI-assisted distillation of Japanese transcripts. The quotes look like auto-transcribed Japanese, with some ASR errors such as "中止点" for "注視点" (the camera's look-at point). The videos themselves were not watched.
