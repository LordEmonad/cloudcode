# Mid-crash steering, genre scoring and 2022–2026 ragdoll launches (gap fill for "Number Go Down")

Research notes, current as of 14 Oct 2026. They fill gaps left by the earlier pass (see `classic_bone_break_games.md`, `levels_launch_and_controls.md`, `browser_physics_and_performance.md`). They do not repeat the Skate 3 datamined scoring, the Burnout 3/Revenge/Paradise crash-mode rules (including Showtime), FlatOut 2 steering, Turbo Dismount history, Unity/Jolt/Bullet tuning or Angry Birds history.

**How to read these notes**
- **Fetching was blocked.** WebFetch and curl were blocked for every non-GitHub site in this environment: DNS failures, plus proxy 403s for fandom.com, gamespot.com, vaporlens.app and wikipedia.org. So almost every web finding comes from **search-engine summaries**, tagged **[SS]**. Treat an [SS] finding as a lead backed by the named page, not as a verified quote.
- **Primary source code.** Findings tagged **[Code]** come from source code I read directly: a GitHub clone or an npm tarball. They are primary and exact.
- **Third-party estimates.** Figures from Raijin, Steambase, SteamPulse, Vaporlens or SteamPageAnalyzer are tagged **[Est]**. They are estimates, not publisher figures.

---

## 1. Burnout Aftertouch (Burnout 3 onward): what the player controls, how strong it is, time scaling, scoring effect, why it was loved

### Takeaway
Aftertouch is a held-button slow-motion window after your own crash, called "Impact Time". In it the stick *nudges* the wreck's path "somewhat", within limits; it does not drive the car. Its power comes from the reward: hitting a rival during it turns a crash, normally a penalty, into a takedown that refills boost and keeps your multiplier. In Crash Mode it is the skill for reaching multiplier icons. I found no public number for the slow-mo factor or the steering force.

### Cited Findings
- **Input and control [SS].**
  - At the moment of the crash you "push and hold down the A button to slow down time and use the joystick to *somewhat* control where your car goes after the initial impact". The stick "nudges the wrecked car's path". — [Worthplaying Xbox review (2004)](https://worthplaying.com/article/2004/9/22/reviews/19370-xbox-review-burnout-3-takedown/); [GameSpot review](https://gamespot.com/reviews/burnout-3-takedown-review/1900-6106835/)
  - An Italian review says holding "A" after an accident activates "impact time", which slows the action and lets you steer the wreck "within limits". — [Everyeye.it review](https://www.everyeye.it/articoli/recensione-burnout-3-takedown-464.html)
  - Another review says the left analog stick **or the d-pad** works. — [GameSpot review](https://gamespot.com/reviews/burnout-3-takedown-review/1900-6106835/)
- **Description in other reviews [SS].**
  - Game Revolution: "hold a single button" to enter a "Max Payne-esque slow-mo" that "allows you to minutely guide your car". — [Game Revolution review](https://www.gamerevolution.com/review/34364-burnout-3-takedown-review-2)
  - Wikipedia: Impact Time "allows players to slow time after a crash in order to direct their mangled frame of a car around the road and, ideally, hit other cars for an Aftertouch Takedown". — [Wikipedia: Burnout 3](https://en.wikipedia.org/wiki/Burnout_3:_Takedown)
- **Scoring effect in races [SS].**
  - An Aftertouch Takedown "refills your boost meter and prevents you from losing any bonus meter segments… it functions as a recovery move". — [GameSpot review](https://gamespot.com/reviews/burnout-3-takedown-review/1900-6106835/)
  - It also "restores the boost multiplier you might have lost". — [Everyeye.it](https://www.everyeye.it/articoli/recensione-burnout-3-takedown-464.html)
  - Hitting a car during it "rack[s] up oodles of points, especially if the car is one of your five competitors". — [Game Revolution](https://www.gamerevolution.com/review/34364-burnout-3-takedown-review-2)
- **Crash Mode use [SS].**
  - Many cash multipliers "have to be snagged with some skillful Aftertouching once a wreck is started". — [GameSpot review](https://gamespot.com/reviews/burnout-3-takedown-review/1900-6106835/)
  - A German guide calls the 2x and 4x icons the key to success. — [Gameswelt tips](https://www.gameswelt.de/burnout-3-takedown/tipp/burnout-3-takedown-allgemeine-tipps-tricks-113894)
  - A cheat-site walkthrough for one junction says to grab the bronze/silver pickups, then the 4x, hit the car nearest the yellow strip, and hold the Crashbreaker until 2–3 s remain. It estimates $1.8–2.5M for that run (community tips, not official numbers). — [CheatCC](https://www.cheatcc.com/?p=80838)
  - After a Crashbreaker detonation, practised players "can often still reach symbols or cars" they thought they had missed, so aftertouch control continues after the explosion. — [Gameswelt](https://www.gameswelt.de/burnout-3-takedown/tipp/burnout-3-takedown-allgemeine-tipps-tricks-113894); [GameSpot user review via SS](https://www.gamespot.com/burnout-3-takedown/user-reviews/2200-520177/)
- **Readability problem [SS].** "In Aftertouch cam mode, it is usually extremely hard to see the oncoming cars", which makes aiming tricky. — [GameSpot review](https://gamespot.com/reviews/burnout-3-takedown-review/1900-6106835/)
- **Why it was loved [SS].**
  - Retro Gamer's making-of calls Burnout 3 a game where "even crashing out is a joy, thanks to the inspired Aftertouch mechanic". — [Retro Gamer: The Making of Burnout 3 (Everand)](https://everand.com/article/731660762/The-Making-Of-Burnout-3-Takedowntm)
  - TIME notes the game "immediately replays those crashes in slow-motion". — [TIME Top 10 racing games](https://entertainment.time.com/2011/11/01/top-10-racing-games/slide/burnout-3-takedown/)
  - A 2007 piece titled "Mourning Aftertouch" lamented its absence from Burnout Paradise's demo. By then it had become a series convention, and Paradise kept only its "spirit" in a side mode (Showtime). — [The New Gamer](https://thenewgamer.com/content/archives/burnout_paradise_(demo)__mourning_aftertouch.html)
- **Burnout Revenge (2005) changes [SS].**
  - Crash Mode was redesigned with golf as inspiration: bigger, multi-level courses. — [GameSpot Revenge crash preview](https://www.gamespot.com/articles/burnout-revenge-crash-mode-preview/1100-6130816/)
  - It added a timing-bar launch: tap in the top green zone, then again as the gauge falls through the lower green zone, for a speed burst. — [Slashdot review](https://games.slashdot.org/story/05/09/28/0343256/review-burnout---revenge)
  - Sources conflict on multipliers. One review says multipliers now come "for each car affected by the blast" rather than from icons. — [Slashdot](https://games.slashdot.org/story/05/09/28/0343256/review-burnout---revenge). Another says Crashbreaker courses "eliminated the score multipliers". — [Lollipop Magazine](https://lollipopmagazine.com/2006/04/burnout-revenge-review/)
  - Aftertouch remained a slow-motion wreck-steering system used "to wreck the cars behind you". — [AV Club](https://avclub.com/burnout-revenge-1798208737)
  - In Revenge's races, the Crashbreaker costs all your boost, and boost level sets the blast size. — [Burnout Wiki (SS)](https://burnout.fandom.com/wiki/File:PreCrashbreak.jpg)
- **Designer lineage [SS].**
  - Alex Ward and Fiona Sperry left Criterion and founded Three Fields Entertainment. Its Danger Zone "distills" Burnout 3 Crash Mode into 4 tutorial segments and 20 stages.
  - Ward told Eurogamer, "It's not the same game as it was."
  - The Burnout Crash! spin-off began as a scrapped Wii prototype where players drew roads with the controller.
  - Sources: [Game Informer 2017](https://gameinformer.com/b/news/archive/2017/04/26/burnout-crash-mode-creators-speed-into-the-danger-zone); [DSOGaming](https://dsogaming.com/?p=2351)

### Inferences
- **Copy Burnout's structure.** Aftertouch is (a) opt-in or automatic slow-mo, (b) a weak, bounded nudge on an already-moving body, and (c) a reward for *aiming the chaos*: multiplier icons, rivals, Crashbreaker. Number Go Down's one-finger sway maps directly onto it: sway the falling mascot toward "multiplier" obstacles, not away from danger.
- **Keep the nudge weak, as Burnout did.** Reviewers describe it as "somewhat" and "within limits". Burnout's steering adds *agency over the outcome* without letting the player avoid crashes.
- **Make targets readable during slow-mo.** The one recurring complaint was poor visibility of targets in aftertouch cam. NGD's camera should frame the next 1–2 obstacles below the mascot during any slow-mo window.
- **Turn failure into a resource.** An aftertouch takedown refunded boost and protected the multiplier. A hard hit could likewise refill a small "sway stamina" or protect a combo.

### Gaps
- No source gives Impact Time's slow-mo factor (e.g. 0.25x), its duration, or the steering force or acceleration applied to the wreck. GameSpot, the Burnout fandom wiki and the Retro Gamer article could not be fetched. The earlier notes already flagged this gap, and it remains open.
- No Criterion developer quote explaining *why* Aftertouch was added was found.
- Whether Aftertouch was automatic or required the held button in every mode: one review says "hold", another says "push and hold". Some sources describe slow-mo starting automatically on crash.

---

## 2. Skate 1/2/3 bail steering: what the stick does during a bail, how much it changes outcomes, how Hall of Meat used it

### Takeaway
Skate 1 had bails but **no mid-bail body control**; reviewers call that control *the* headline addition of Skate 2. In Skate 2 and 3 you can bail on purpose, then rotate and pose the body into a few preset positions; Skate 3 reviews name glide, torpedo and roll. That steers the body toward targets and changes the damage. Hall of Meat challenges then ask for specific targets, positions or bone counts. Sources disagree on whether the left or right stick does the posing.

### Cited Findings
- **Skate 2 added body control [SS].**
  - "The coolest addition is the ability to control your body after a bad move sends you flying. A spectacular bail scores big points for the Hall of Meat." — [Stars and Stripes Skate 2 review](https://www.stripes.com/living/games-skate-on-a-roll-1.88929)
  - "You can even deliberately bail during big leaps, and use the right stick to pose." GamesRadar compares this to Burnout's Crash junctions. — [GamesRadar Skate 2 review](https://www.gamesradar.com/skate-2-review/2)
- **Positions [SS].**
  - Wikipedia (Skate 2): the player can manually trigger a bail, and "while bailing, the player can rotate their character and make them move into **four different positions**". Bails feed Hall of Meat, where you damage your character as much as possible. — [Wikipedia: Skate 2](https://en.wikipedia.com/wiki/Skate_2)
  - Skate 3 reviews: players "can tweak the fall into **glide, torpedo, or roll** positions", and the challenges recall PSN's *Pain*. — [VideoGamer Skate 3 review](https://www.videogamer.com/?p=167044); [TheSixthAxis Skate 3 review](https://www.thesixthaxis.com/2010/07/16/review-skate-3/)
- **Which stick? (conflict) [SS].**
  - A Skate 3 guide says the left stick controls the body in the air after bailing, so you can aim for objects. — [ludo.guide HoM page](https://www.ludo.guide/guide/skate-3/side-quests-activities/hall-of-meat)
  - GamesRadar says the right stick poses (Skate 2). — [GamesRadar](https://www.gamesradar.com/skate-2-review/2)
  - In normal skating the left stick drives the body and the right stick the board, per several reviews. — [SS summary of Skate 2 reviews](https://www.gamesradar.com/skate-2-10/2/)
  - Likely reconciliation (unverified): the left stick steers or rotates the body, and the right stick picks the pose.
- **Bail trigger (conflict) [SS].** One guide says B/Circle; another says both triggers plus both bumpers. — [ludo.guide](https://www.ludo.guide/guide/skate-3/side-quests-activities/hall-of-meat); [Cal Poly page (low quality)](https://grandavehousing.calpoly.edu/news/skate-3-tips-and-tricks)
- **How Hall of Meat used it [SS].**
  - Skate 3 HoM challenges include "hitting a specific target or tweaking your fall in a certain way". — [VideoGamer](https://www.videogamer.com/?p=167044)
  - Skate 3 Hall of Meat also ran as a 3-on-3 online mode scored on the damage done during a bail. — [Shacknews Skate 3 multiplayer impressions](https://www.shacknews.com/article/63674/skate-3-multiplayer-impressions)
  - Skate 3's challenge set is finite: "once these are completed, no more will be unlocked". Finishing them unlocks the character Dem Bones, and the "Masochist" achievement is for the "Thorax Crunch" challenge. — [TheSixthAxis](https://www.thesixthaxis.com/2010/07/16/review-skate-3/); [CheatCC Skate 3](https://cheatcc.com/articles/skate-3-cheats-codes-cheat-codes-walkthrough-guide-faq-unlockables-for-xbox-360-xbox360/)
  - Skate 2 achievements:
    - "Sandbag": break at least **15 bones in a single wipeout**.
    - "Uninsurable": break **100 bones** in career.
    - "Juggling Chainsaws": wipe out at high speed.
    - "Spare Parts": complete all Hall of Meat paths. HoM starts with 4 challenges, and each completed one unlocks another.
    - Sources: [GameRevolution achievements](https://www.gamerevolution.com/?p=42723); [PlayStation LifeStyle trophy guide](https://www.playstationlifestyle.net/?p=25688)
- **What happens to outcomes [SS].** A 2025 slam guide for the new game says slam distance depends on initial velocity, launch angle and **in-air body control**. — [ingamenews 2025](https://ingamenews.com/2025/09/skate-guide-how-to-increase-slam.html)
- **Criticism [SS].** Off-board physics feel "a bit wonky", "doubly noticeable in Hall of Meat", and landings and crashes look "very stiff and fake". — [TheSixthAxis Skate 3 review](https://www.thesixthaxis.com/2010/07/16/review-skate-3/)
- **Praise [SS].**
  - "Bone-breakingly good" and "the most fun set of challenges in the game". — [VideoGamer](https://www.videogamer.com/?p=167044); [IndianVideoGamer](https://indianvideogamer.com/?p=4484)
  - Skate 2's bails "mirror a million bail videos". — [Den of Geek](https://www.denofgeek.com/games/skate-2-ps3-review)
  - The bone-crunch and skin-scrape audio improved over Skate 1. — [PlayStation LifeStyle](https://www.playstationlifestyle.net/2009/02/06/skate-2-review-what-skate-should-have-been/)
- **skate. (2025 reboot) [SS].** Inverse reports the new free-to-play skate. lacks Hall of Meat and that "its absence is felt". The URL slug references "15 million" players. — [Inverse](https://www.inverse.com/gaming/skate-15million-fan-favorite-feature-hall-of-meat)

### Inferences
- **Skate's design is "steer + pose".** The player chooses *where* (rotate or aim) and *how* (preset pose: glide, torpedo or roll, i.e. spread, streamlined or tucked). Each pose changes drag, rotation speed and which body parts lead into the impact.
- **Map to one finger.** Drag left/right sways the mascot. A second gesture (press-and-hold to tuck into a ball; release to spread) could give the pose choice without a second stick.
- **Hall of Meat challenge templates that fit NGD:**
  - "hit target X"
  - "break N bones in one fall" (Sandbag = 15)
  - "land in pose Y"
  - a damage race against friends (3v3 HoM)
- **Variety and lifespan.** Reviewers' "stiff" complaint suggests the poses need blending, not snapping, to stay comic. Skate 3's finite challenge list was a noted limit, which argues for procedural or daily challenges in NGD.

### Gaps
- No primary source (manual or controls screen) confirmed exactly which stick does what during a Skate 2/3 bail, or the names of all four Skate 2 positions. Fandom wikis and Wikipedia were unfetchable.
- No quantitative data on how much body control changes distance or damage.

---

## 3. Turbo Dismount and Turbo Dismount 2: scoring rules, camera and replay, what TD2 added, player reviews

### Takeaway
No public source gives Turbo Dismount's per-body-part point table or its exact multiplier rules. Guides confirm only that points come from damage, type and speed of collision, traffic crashes, vehicle damage and dismemberment, and that launch angle and pose matter more than top speed. Turbo Dismount 2 is a different kind of game: a "comedy physics racing sandbox" with webcam/photo bobblehead faces, a Unity-based Workshop level editor, challenge and sandbox modes, multiple characters per vehicle, and a replay system tied to Steam Gameplay Recording. It was in Early Access from 23 Jan 2025 and hit 1.0 on 13 Mar 2026. Reviews are about 95% positive, but sales are small: an estimated 33K copies and an all-time peak of 171 concurrent players. The recurring complaints are performance, replay bugs and camera.

### Cited Findings
- **TD1 scoring basics [SS].**
  - "Damage awards points". Total score depends on "the type and speed of the collision, combined with crashing traffic, vehicle damage and dismembered limbs". — [SS summary of Turbo Dismount listings](https://turbo-dismount.fileplanet.com/apk); [Wikipedia: Turbo Dismount](https://en.wikipedia.org/wiki/Turbo_Dismount)
  - High scores "are always about injuring Mr./Ms. Dismount". Small pose changes "can have a huge effect on their launch angle, which can lead to huge point differentials". — [Gamezebo tips](https://www.gamezebo.com/walkthroughs/turbo-dismount-tips-cheats-and-strategies/)
  - "Going full speed right away isn't always the best decision". On the high-structure map, flooring it gives low points, and vehicle choice matters. A "Use Manual Steering" tip exists but its text wasn't captured. — [AppGamer tips](https://www.appgamer.com/turbo-dismount/strategy-guide/tips-and-hints)
- **TD1 achievement rules [SS].**
  - Lose only a single limb in one dismount.
  - Do **10 somersaults** in one dismount.
  - Launch 3 consecutive dismounts at max velocity.
  - Source: [VGTimes Google Play achievements](https://vgtimes.ru/games/turbo-dismount/achievements-and-trophies/google-play/); [NerdBurglars list](https://nerdburglars.net/android/achievementlist/turbo-dismount)
- **TD1 post-1.0 updates [SS].** Updates after v1.0 (May 2014) added "obstacle position tweaking, new levels, a new character, and seasonal heads". — [Steam discussion (Secret Exit post)](https://steamcommunity.com/app/263760/discussions/0/619573787432360582)
- **TD2 features (store page and pre-release coverage) [SS].**
  - Billed as a "comedy physics racing sandbox" and a "tragic kinetic racing physics sandbox" starring Mr. Dismount "and his friends".
  - Each level has its own objective (stunt racing, physics puzzles, or relaxed play), extended by Steam Workshop.
  - Feature bullets:
    - "multiple characters on vehicles"
    - "Live face support with webcams"
    - "Animated bobblehead faces, with custom photo support"
    - Challenge Mode ("rewards skill") and Sandbox Mode (everything unlocked)
    - "Immensely capable level editing tools in Unity for your Steam Workshop delight"
    - "An even more awesome replay system with support for Steam Gameplay Recording"
  - An Early Access developer note stressed level tools that can change level rules and game logic, and promised more level types and vehicles for 1.0.
  - Sources: [Steam store (EN)](https://store.steampowered.com/app/2280350/Turbo_Dismount_2/); [Steam store (FR)](https://store.steampowered.com/app/2280350/Turbo_Dismount_2/?l=french); [CogConnected 2024](https://cogconnected.com/2024/08/turbo-dismount-2-is-coming-soon-on-steam/); [OnlineRaceDriver 2024](https://onlineracedriver.com/2024/08/09/turbo-dismount-2-announced-for-a-2024-release)
  - No source mentions online multiplayer. — [SS across the above]
- **TD2 head-related achievements [SS].** Detach a head, and perform **25 decapitations**. — [GamerBlurb TD2 achievements guide](https://gamerblurb.com/articles/turbo-dismount-2-achievements-guide)
- **TD2 dates [SS].**
  - Early Access opened 23 Jan 2025 and full release came 13 Mar 2026, per the Steam page and Wikipedia. — [Wikipedia](https://en.wikipedia.org/wiki/Turbo_Dismount); [Steam](https://store.steampowered.com/app/2280350/)
  - Japanese press in the earlier notes say 14 March, probably a time-zone difference.
  - Price: $19.99, discounted to $12.99–13.99 in sales. — [Raijin](https://raijin.gg/app/2280350/Turbo_Dismount_2)
- **TD2 reviews [SS/Est].**
  - About 96.8% positive of 565 reviews (15 Mar 2026). — [Vaporlens](https://vaporlens.app/app/2280350/turbo_dismount_2)
  - 719 reviews, "Overwhelmingly Positive" (June 2026). — [Steambase](https://steambase.io/apps/2280350)
  - 95% of 752 (July 2026). — [Raijin](https://raijin.gg/app/2280350/Turbo_Dismount_2)
  - "Overwhelmingly Positive (758)". — [Discord game page](https://discord.com/game/turbo-dismount-2-1395133005386748075)
- **TD2 commercial scale [Est].**
  - About **33.2K copies** sold on Steam and about $398K gross (medium confidence, as of 22 Jul 2026).
  - **All-time peak of 171 CCU**, with 17 in-game at that snapshot. Steambase showed 7 CCU on 28 Jun 2026.
  - Sources: [Raijin](https://raijin.gg/app/2280350/Turbo_Dismount_2); [Steambase](https://steambase.io/apps/2280350)
- **TD2 praise and complaints [SS].**
  - Praise: an improvement on the original, the graphics, and nostalgia.
  - Complaints:
    - "significant optimization and performance issues", including crashes, lag and low-end PCs
    - "semi-frequent bugs", game crashes, and "issues with replays"
  - Source: [Vaporlens summary (automated)](https://vaporlens.app/app/2280350/turbo_dismount_2)
  - Next Fest demo thread (2024, pre-1.0):
    - An RTX 3060 Mobile player struggled to hold 60 fps on integrated graphics.
    - Particle-dense scenes "heavily tank the framerate".
    - The camera gets stuck after returning from a replay.
    - Replay music plays even with music off (the dev said it would be fixed).
    - Once you start driving you can't switch to the dismount character, which leaves only a first-person view.
    - Audio is delayed in recorded videos.
    - Source: [Steam demo discussion](https://steamcommunity.com/app/2280350/discussions/0/4839771328514919549/?ctp=5)
- **TD2 mobile.** An unofficial fan site says mobile is planned but undated (already in the earlier notes). — [turbodismount2.com](https://turbodismount2.com/mobile/)

### Inferences
- **TD2's reach is tiny.** Quality ratings are top-tier, but about 33K Steam copies and a 171 peak CCU mean the premium PC sandbox reaches far fewer people than Turbo Dismount 1's mobile reach (50M+ Google Play, per earlier notes). The mass audience for "launch a dummy for damage" is still mobile and web, not $20 PC.
- **TD2 copied UGC, but UGC didn't create the hit.** Its additions (webcam faces, Workshop editor, Steam recording) are UGC and shareability features. They did not create a viral moment. For NGD, "put your face on the mascot" is a cheaper personalisation hook than an editor, but the mascot *is* the brand, so face swap should be optional at most.
- **Replay and camera are the genre's weak spot.** Replay and camera complaints recur from TD1 into TD2, and a smooth instant replay or clip is a concrete differentiator.

### Gaps
- No source found for Turbo Dismount's actual per-part point values, head-hit multiplier, "dismount" bonus definition, or how its combo multiplier ramps. Gamezebo and AppGamer were cut off, and fandom and Steam guides were unfetchable. The earlier notes have only "10x multiplier glitch" and "each hit raises the multiplier".
- No detail on TD2's replay camera modes.
- No professional (press) review of TD2 1.0 was found.

---

## 4. Happy Wheels: scoring and level goals, why the ragdoll comedy works, the editor's role in its spread

### Takeaway
Happy Wheels has **no damage score**. A level is won by reaching a finish line, collecting all tokens (added Sept 2011) or hitting a victory trigger, and the gore is consequence and comedy, not points. It spread through YouTube Let's Plays (PewDiePie alone made 70+ Happy Wheels videos, one at 22.6M views) and through about 10M user levels with 13B+ plays. On 21 Sep 2026 it launched on Steam: about 750K wishlists (the creator expected about 5K), a 3,193 launch-day peak, and about 94–95% positive reviews.

### Cited Findings
- **Goals [SS].**
  - The goal is "to get to the finish line, activate a trigger that triggers victory, or collect a required amount of tokens".
  - Tokens arrived in v1.48 (Sept 2011); before that the finish line was the only win condition.
  - Dying before the finish line means restarting.
  - Victory triggers do *not* require the character to be alive.
  - Secondary characters can collect tokens, so a level can be finished after the main character dies.
  - Sources: [Happy Wheels Wiki: Token](https://happywheels.fandom.com/wiki/Token); [Wikipedia](https://en.wikipedia.org/wiki/Happy_Wheels)
- **Characters [SS].** Characters have asymmetric abilities and weaknesses: a dad and son on a bike, a businessman on a Segway, a man in a rocket wheelchair, and Santa in a flying sleigh. — [SS summary of Wikipedia/fan pages](https://en.wikipedia.org/wiki/Happy_Wheels)
- **Editor and curation [SS].**
  - Gameplay is "provided through user-made levels".
  - Jim Bonacci personally picks highly rated, highly played levels as "Featured" on the main screen.
  - Wikipedia: about 10 million user levels and **13 billion+ level plays**.
  - Sources: [Happy Wheels Wiki: Level Editor](https://happywheels.fandom.com/wiki/Level_Editor); [Wikipedia](https://en.wikipedia.org/wiki/Happy_Wheels)
- **YouTube-driven spread [SS].**
  - The game "got famous thanks in large part to its popularity on YouTube" and is "a few years past its peak" of Let's Play volume (written 2016). PewDiePie made 70+ Happy Wheels episodes. A 2016 Machinima animated adaptation launched on go90. — [Tubefilter 2016](https://tubefilter.com/2016/11/15/happy-wheels-animated-adaptation-machinima/)
  - Several of PewDiePie's most-viewed videos were Happy Wheels montages, one at 22.6M views (undated). — [Mic](https://www.mic.com/articles/53505/this-gamer-is-bigger-than-miley-cyrus-and-one-direction)
- **Platforms and history [SS].**
  - Published 4 June 2010 as a browser game. iOS followed in 2015 and Android on 25 Jan 2020.
  - Before Flash's end of life, an official HTML5 remake was made, "outsourced to Goodboy Digital", per the fan wiki.
  - Sources: [Wikipedia](https://en.wikipedia.org/wiki/Happy_Wheels); [Happy Wheels Wiki (JS homescreen file)](https://happywheels.fandom.com/wiki/File:JS_Homescreen_-_Farewell_Flash....PNG)
- **Steam launch 2026 [SS].**
  - Released 21 Sep 2026 at £4.59, with the level editor and 5M+ user levels, no ads, and controller support.
  - About 750K wishlists in two weeks; Bonacci had expected "maybe 5k at best".
  - Launch-day peak of 3,193 CCU (SteamDB).
  - Reviews: about 95% positive of 1,000+ early, 1,442/1,516 later, and 94% of 2,725 in another snapshot.
  - Sources: [Notebookcheck](https://www.notebookcheck.net/16-year-old-PC-game-gets-750-000-Steam-wishlists-in-two-weeks-after-developer-expected-just-5-000.1405791.0.html); [Teknoblog](https://www.teknoblog.com/?p=406253); [CulturaGeek](https://culturageek.com.ar/happy-wheels-en-steam/); [gg.deals](https://gg.deals/steam/app/4705510/); [WASDland](https://www.wasdland.com/game/happy-wheels-4705510/)
- **Why the comedy works (secondary, low-quality sources) [SS].**
  - The appeal is the contrast between a "pleasant, idyllic setting" and an "over-the-top, insatiable sense of bloodlust". — [Tubefilter](https://tubefilter.com/2016/11/15/happy-wheels-animated-adaptation-machinima/)
  - Other pages credit schadenfreude, a "darkly comedic tone that prevents it from being truly disturbing", no two attempts playing out the same, and free, "unblocked" browser access in schools. These are SEO-quality pages: [ArkTimes](https://001.arktimes.com/?p=37191); [Cal Poly page](https://grandavehousing.calpoly.edu/news/happy-wheels-tips-tricks-and)

### Inferences
- **Two lessons for NGD:**
  - The *character's goal* (reach the finish) is separate from the *comedy* (what happens to his body on the way).
  - Spread was driven by **commentators reacting**, not by a score. A run that ends in a funny, readable moment with a face reaction (an emo mascot's expressions) is the clip.
- **Curation over volume.** Bonacci hand-picking Featured levels is the curation layer that made 10M user levels watchable. If NGD ever adds user courses, curation matters more than tools.
- **Old ragdoll IP still has demand.** The 2026 Steam relaunch (750K wishlists against a 5K expectation) shows strong latent demand, and that the genre's audience remembers ragdoll comedy fondly.

### Gaps
- No Jim Bonacci interview on design intent was found.
- No mobile download totals.
- Which engine the Goodboy HTML5 remake uses was not verified. Goodboy Digital is known as the studio behind PixiJS, but no source in this pass confirms the remake uses it.

---

## 5. Toribash: joint states, dismemberment rules, replay culture

### Takeaway
Each joint has four states: relax, hold, extend and contract, with raise/lower variants for shoulders, chest and lumbar. Turns are paused planning steps; one source says pressing Space advances 10 frames by default. The score is damage points, and touching the ground with anything but the feet disqualifies you. Fracture and dismemberment are per-mod rule toggles with thresholds. Replays (.rpl) save automatically and are the community's main art form, helped by special replay mods. Toribash Next (Jan 2024, free) added weapons, 3–4 player modes and a **replay editor that lets you rewind a finished fight and change the outcome**, but it sits at Mostly Negative (37% of 378).

### Cited Findings
- **Joint states [SS].**
  - The four modes are relax, hold, extend and contract.
  - A relaxed joint "moves freely with the body", and a holding joint resists moving unless forced.
  - Shoulders, chest and lumbar use variants (e.g. shoulders raise or lower in place of extend or contract).
  - A **damaged joint cannot change modes**. A **fractured** joint always shows as relaxed but "can move more freely than normal relaxed joints".
  - A **dismembered** joint shows red, is detached, and cannot move.
  - After dismemberment the victim goes fully relaxed until the player moves it.
  - Source: [Toribash Wiki: Shoulder/Joints](https://toribash.fandom.com/wiki/Shoulder)
- **Turn structure [SS].**
  - "Select the muscles to move, then press space and (with the default settings) ten frames of time pass". — [Beacon (NWCiowa) article](https://beacon.nwciowa.edu/5408/)
  - TV Tropes says the "standard mods move in 50-frame increments" and that Aikido uses 20 frames per move. This conflicts with the 10-frame default and is probably about different mods or settings. — [TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/ToriBash)
  - A ghost figure previews the result of the current joint settings, which a review called "invaluable". Setting up one move can take about 20 seconds. — [Nintendo Life (WiiWare) review](https://www.nintendolife.com/reviews/2010/07/toribash)
- **Scoring and DQ [SS].**
  - You win by out-damaging the opponent on points by round end, or by disqualifying them when non-foot body parts touch the ground. — [DVDTalk forum](https://forum.dvdtalk.com/video-game-talk/519505-toribash-turn-based-physics-based-fighting.html)
  - Even a dismembered limb touching the mat can count as a loss in some rule sets. — [SS summary of the guides above](https://www.404techsupport.com/2011/01/10/toribash-a-free-ragdoll-fighting-game/amp/)
  - "Some limbs break more easily than others, and some give more points when hit". — [LinuxLinks](https://www.linuxlinks.com/toribash/)
  - Losing a limb is "the equivalent of a stun", but you can still control that body part next turn. — [TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/ToriBash)
- **Mods as rule sets [SS].**
  - Game modes vary frames per turn, match length, gravity, distance between players, and "ease of dismemberment or fracture". — [Softpedia (Mac)](https://mac.softpedia.com/get/Games/Toribash.shtml)
  - Aikido makes limbs "harder to break and almost impossible to remove". — [TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/ToriBash)
  - Competitive mods group into grappling (aikido), striking (wushu) and kicking. Non-competitive mods like "xspar" exist for making replays. User mods include swords, frisbees, dive competitions and "Assassin's Creed jump" setups. — [404 Tech Support](https://www.404techsupport.com/2011/01/10/toribash-a-free-ragdoll-fighting-game/amp/); [Steam discussion](https://steamcommunity.com/app/248570/discussions/0/364041432728017949)
- **Replays [SS].** Saving is automatic, files are .rpl, and many players share them. — [404 Tech Support](https://www.404techsupport.com/2011/01/10/toribash-a-free-ragdoll-fighting-game/amp/)
- **Toribash Next (24 Jan 2024; Nabi Studios / Nicalis; free on Steam and Epic, cross-play) [SS].**
  - New: weapons (guns, swords, staves), 3–4 player and team modes, a **replay editor that lets you go back to any point in a finished fight and change the outcome**, rule and environment changes mid-match, player-hosted servers, and an in-game economy for custom characters and mods.
  - Reception: Steam "Mostly Negative (378)", 37% positive.
  - Sources: [Gematsu](https://gematsu.com/2024/01/free-to-play-fighting-game-sequel-toribash-next-announced-for-pc); [God is a Geek](https://godisageek.com/2024/01/toribash-next-announced-coming-to-pc-at-the-end-of-january/); [gg.deals](https://gg.deals/gb/game/toribash-next/); [Steam](https://store.steampowered.com/app/787760?cc=us)

### Inferences
- **Breaking bones as a state machine.** Toribash's damage model (intact → damaged, which can't change state → fractured, which goes looser than relaxed → dismembered and detached) maps straight onto a ragdoll. Each "break" lowers that joint's limits and drive. This is a cheap, readable way to make bone breaks *visibly* change how the mascot flops for the rest of the fall.
- **Replays as input logs.** Toribash replays are tiny because they record joint-state inputs, not video. For NGD, a deterministic fixed-step sim plus a log of the sway inputs would allow a "replay link", as long as determinism holds across devices (see earlier physics notes).
- **Interactive replays didn't save Toribash Next.** Its rewind-and-change replay editor is a striking idea, but the game's poor reception shows that features like that don't rescue a game whose core is hard to learn.

### Gaps
- No numeric defaults found for fracture or dismemberment thresholds, match frames or engage distance. The official wiki and forum were unfetchable, and no GitHub mod files surfaced.
- The exact joint count (often quoted as about 20 joints plus 2 hand grips) was not confirmed by a source in this pass.

---

## 6. Ragdoll and physics-comedy games launched or updated 2022–2026, numbers, and closest competitors to a slingshot-into-a-falling-course bone-break game

### Takeaway
2022–2026 produced big ragdoll *party* or *co-op* hits (Party Animals; PEAK, which is co-op climbing; Stick It to the Stickman) and big **2D stickman browser hits** (Ericetto's Ragdoll Archers and Ragdoll Hit, with roughly 0.4–0.6M votes each). The *damage-for-score fall* niche, though, is served mostly by small Unity mobile games, some ported to WebGL portals:
- Falling Art Ragdoll Simulator (BoomBit, 2022; launch with a power meter, score by spectacle, about $1.1M in its first 3 months)
- Mega Fall Ragdoll Simulator (2024)
- Stickmen Falling (2M+ downloads)
- Ragdoll Stair Fall (you steer while falling)
- Ericetto's Ragdoll Drop (Poki, Nov 2025: launch a ragdoll into pits, walls and rockets, 15 levels)

Turbo Dismount 2 is the only premium entry, and it is small. I found **no** browser game that combines a slingshot launch, a vertical obstacle course, mid-fall steering and high-quality 3D. The closest are Ragdoll Drop (concept) and the Unity WebGL ports of Falling Art and Mega Fall (format).

### Cited Findings

**Closest-concept competitors (launch or fall for damage)**
- **Falling Art Ragdoll Simulator (BoomBit) [SS].**
  - Android/iOS launched June 2022; a WebGL version went up on CrazyGames in April 2024 (rating 9.3).
  - "The more spectacular the fall, the higher the score". A power-meter launch; coins come from distance and damage.
  - Revenue: almost $1.1M in the first three months, and over $0.4M in Sept 2022 alone. One of BoomBit's top three games in March 2024.
  - iOS rating: 3.9 of 5.7K.
  - Sources: [CrazyGames](https://crazygames.com/game/falling-art-ragdoll-simulator); [GIGA review](https://www.giga.de/entertainment/falling-art-ragdoll-simulator--01JMKSK03N734G1WMS3Z0MYJZC); [BoomBit IR Sept 2022](https://investors.boombit.com/?p=3884); [BoomBit IR Mar 2024](https://investors.boombit.com/en/boombit-group-revenue-for-march-2024/); [App Store](https://apps.apple.com/app/id1620339095)
- **Mega Fall Ragdoll Simulator (Whitebrix Interactive) [SS].**
  - Drop a ragdoll from tall structures and earn coins for skins.
  - Released Feb 2024 on iOS and WebGL, built with **Unity 2022**.
  - Ratings: CrazyGames 9.0; App Store 4.7 of 234.
  - Sources: [CrazyGames](https://www.crazygames.com/game/mega-fall-ragdoll-simulator); [App Store](https://apps.apple.com/us/app/-/id6477785596)
- **Ragdoll Drop (Ericetto, Poki) [SS].** Released Nov 2025. A physics action game with **15 levels** where you **launch a ragdoll character into pits, walls and rockets**. Runs on desktop and mobile browsers. — [Poki EN](https://poki.com/en/g/ragdoll-drop); [Poki DE](https://poki.com/de/g/ragdoll-drop)
- **Stickmen Falling (iOS) [SS].** **2M+ downloads**, 4.7/5 from about 11K ratings. A stickman tumbling down stairs, with vehicles, obstacles and damage scoring (a Turbo Dismount-like). — [MWM Spark listing](https://spark.mwm.ai/en/apps/stickmen-falling/1341395415)
- **Ragdoll Stair Fall (Kodii Systems, Android) [SS].** Free; you **steer a falling ragdoll down a staircase**. FileHippo reviewed it 7 Jun 2024. No install count. — [FileHippo](https://filehippo.com/android/download_ragdoll-stair-fall/)
- **Ragdoll Fall: Break the Bones! (AI Games FZ, iOS) [SS].** Drop a ragdoll from construction-site buildings. 3.8 of about 467 ratings, updated Mar 2026. — [App Store](https://apps.apple.com/app/ragdoll-fall-break-the-bones/id1617268672); [AppFollow](https://apps.appfollow.io/ios/ragdoll-fall-break-the-bones/1617268672?country=ie)
- **Ragdoll Break: Dummy Destroy (iOS) [SS].** Stair-breaking levels; 3.6 of 28 ratings. — [App Store](https://apps.apple.com/app/id6478543174)
- **Bouncy Ragdoll (CrazyGames, July 2025) [SS].** Rated 9.1. — [CrazyGames](https://www.crazygames.com/it/game/bouncy-ragdoll)
- **Turbo Dismount 2 (PC, 1.0 Mar 2026) [SS/Est].** About 33K copies, 171 peak CCU, 95% positive (see section 3).

**Web portal ragdoll hits**
- **Ragdoll Hit (Ericetto, Poki) [SS].**
  - May 2024 release, updated Aug 2024.
  - A 2D ragdoll-stickman fighter for 1–2 players.
  - **4.5 rating from about 570–577K votes**.
  - Ericetto's first Poki game, "from the maker of Ragdoll Archers".
  - Sources: [Poki EN](https://poki.com/en/g/ragdoll-hit); [Poki ES](https://poki.com/es/g/ragdoll-hit)
- **Ragdoll Archers (Ericetto, CrazyGames) [SS].** Released 2023 (May or Aug; the page is inconsistent). Rated 9.1 from **418,535 votes**. — [CrazyGames ES](https://www.crazygames.com/es/juego/ragdoll-archers)
- **CrazyGames "most played" rankings.** No reliable 2025 ranking was found. A listicle claims Zombie Launcher X held #1 on CrazyGames for 6 weeks (unverified). — [Analytics Insight](https://www.analyticsinsight.net/amp/story/games/most-popular-crazy-games-in-2025)

**Steam and console physics-comedy launches and updates, 2022–2026**
- **Party Animals (Recreate Games, 20 Sep 2023) [SS/Est].**
  - Peak **104,174 CCU** (SteamDB), a top-10 Steam launch of 2023.
  - Launched "Mostly Negative" on Steam (China-driven) against a PC Metascore of 77.
  - About **2.6M** Steam copies and $30.8M gross.
  - Came to PS5 on 23 Jan 2025 with a new "Crisis" mode.
  - Sources: [Game World Observer](https://gameworldobserver.com/2023/09/21/party-animals-100k-ccu-negative-reviews-china-steam); [Raijin](https://raijin.gg/app/1260320/Party_Animals); [TrueTrophies](https://www.truetrophies.com/news/party-animals-xbox-exclusive-ps5); [Push Square](https://www.pushsquare.com/news/2025/01/party-animals-knocks-off-among-us-as-it-completes-transition-from-xbox-to-ps5)
  - A spam page claiming "20M units" is unreliable and was not corroborated.
- **Stick It to the Stickman (Free Lives, Early Access 18 Aug 2025; not 2024) [SS/Est].**
  - A physics brawler about climbing from stickman office drone to CEO: platforming, brawling, car theft, kicking people out of windows. 20 classes, 4 modes, couch and Remote Play co-op.
  - Price: $4.99, later $6.99.
  - Reviews: **97% positive of 7,345**.
  - Sales estimates vary: about 45K early, 264K (VGI) or about 417K. Peak CCU 2,800.
  - Players report poor optimisation and stutter.
  - Sources: [Gematsu](https://www.gematsu.com/2025/08/stick-it-to-the-stickman-launches-in-early-access-on-august-18); [GamesIndustryAfrica](https://gamesindustryafrica.com/2025/08/25/south-african-studio-free-lives-launches-stick-it-to-the-stickman/); [SteamPulse](https://steampulse.org/game/2085540); [SteamPageAnalyzer](https://www.steampageanalyzer.com/games/2085540); [Steambase](https://steambase.io/apps/2085540); [Vaporlens](https://vaporlens.app/app/2085540/stick_it_to_the_stickman.md); [Notebookcheck](https://www.notebookcheck.net/Absurd-brawler-blows-up-on-Steam-Probably-the-best-4-dollars-I-ve-ever-spent.1093133.0.html)
- **PEAK (Aggro Crab and Landfall, 16 Jun 2025) [SS].**
  - Co-op climbing. 100K copies in 24 h, 1M in 6 days, 2M in 9 days, 5M in about a month.
  - Later coverage cites approaching 10M sales and "20 million players" after a year.
  - Made by a team of about 12, from a month-long game jam in Seoul.
  - Sources: [CGMagazine](https://www.cgmagonline.com/news/steam-peak-sells-1-million-copies/); [DSOGaming](https://www.dsogaming.com/tag/aggro-crab/); [Gamereactor](https://www.gamereactor.eu/peak-180533/); [Wikipedia: Aggro Crab](https://en.wikipedia.org/wiki/Aggro_Crab)
  - The search summaries did not confirm its ragdoll-fall mechanics.
- **Only Up! (SCKR Games, May 2023) [SS].** A viral streamer climbing game, delisted 8 Sep 2023. Look-alike clones peaked at only 16–66 CCU. — [Automaton](https://automaton-media.com/en/news/20230908-21469/); [Steambase](https://steambase.io/apps/2562240)
- **Totally Accurate Battle Simulator (Landfall) [Est/SS].**
  - About 145.5K Steam reviews, 97% positive.
  - Sales estimates conflict: **3.3M** (Raijin, Jul 2026) vs about **9.9M** (Vaporlens). All-time peak 13,506 CCU.
  - Switch port 2022; sold at $1.99 in a 2026 sale.
  - Sources: [Raijin](https://raijin.gg/app/508440/Totally_Accurate_Battle_Simulator); [Vaporlens](https://vaporlens.app/app/508440/totally_accurate_battle_simulator/stats/details); [Notebookcheck](https://www.notebookcheck.net/1-99-97-positive-reviews-Legendary-indie-game-hits-lowest-ever-price-on-Steam.1255744.0.html); [Gematsu 2022](https://gematsu.com/2022/05/totally-accurate-battle-simulator-coming-to-switch-this-summer)
- **Gang Beasts (Boneloaf) [SS/Est].**
  - About 1.3M Steam copies and $15.1M gross (est.).
  - The "Crane Stage" update (Nov 2024) raised PS4/PS5 player counts by 52.8%.
  - Update 1.27 (12 Aug 2025) was mostly bug fixes.
  - Sources: [Raijin](https://raijin.gg/app/285900/Gang_Beasts); [TrueTrophies](https://i2.truetrophies.com/news/gang-beasts-ps4-player-count)
- **Human Fall Flat / HFF2 [SS].** Human Fall Flat had shipped **50M copies** across platforms by Dec 2023. Devolver delayed Human Fall Flat 2 to 2026; launch status as of Oct 2026 was not confirmed. — [VGC](https://www.videogameschronicle.com/news/human-fall-flat-2-has-been-delayed-to-2026/); [Press Start](https://press-start.com.au/?p=154063)
- **Happy Wheels on Steam (21 Sep 2026) [SS].** About 750K wishlists, a 3,193 peak, about 94–95% positive (see section 4).
- **Toribash Next (Jan 2024) [SS].** Mostly Negative (see section 5).
- **Small 2025 Steam ragdoll launches [SS].**
  - Ragdoll Rumble: F2P party game, 6 Sep 2025, briefly #2 on Steam trending.
  - Banana Ragdoll: Mar 2025, $0.99.
  - Ragdoll Mayhem Maker: Oct 2025, EA 2D sandbox.
  - Ragdoll Playground: Oct 2024.
  - Sources: [Notebookcheck (Ragdoll Rumble)](https://www.notebookcheck.it/Il-caotico-party-game-gratuito-diventa-trending-su-Steam-poco-dopo-il-rilascio.1108024.0.html); [gg.deals Ragdoll Playground](https://gg.deals/game/ragdoll-playground/); [DekuDeals](https://www.dekudeals.com/items/ragdoll-tumble)
- **Melon Playground / Melon Sandbox (mobile ragdoll sandbox) [SS].** Still updated through v32 (Sept 2025). No reliable download or TikTok data found. — [APKMirror](https://apkmirror.com/apk/playducky-com/melon-sandbox/melon-sandbox-27-6-release)
- **Roblox ragdoll experiences [SS].** "RAGDOLL" has 25.7M visits and "Tip's Ragdolls" 15.9M (capture dates unclear). — [Rotrends](https://rotrends.com/game/7165819903)

### Inferences
- **Closest competitors by mechanic:**
  1. Falling Art Ragdoll Simulator: launch by power meter, fall, score by spectacle, mobile plus WebGL.
  2. Ragdoll Drop (Poki): launch into hazards, level-based, browser-native audience.
  3. Mega Fall Ragdoll Simulator and Ragdoll Fall: Break the Bones: drop from height.
  4. Ragdoll Stair Fall: the only one found where you *steer while falling*.
  5. Turbo Dismount 1/2: the quality bar for damage scoring, but launched by vehicle and PC-first.
- **Nobody combines the full set.** None combines (a) a slingshot pull-back, (b) a long *vertical* obstacle course, (c) continuous one-finger sway during the fall, (d) a mascot with personality and (e) high-end 3D in a phone browser. The portal entrants are Unity WebGL ports or 2D stickman games. That is NGD's gap, unverified against games I couldn't see.
- **Evidence of demand.** BoomBit's roughly $1.1M in three months for Falling Art shows a casual "fall for spectacle" game monetises on mobile. Ericetto's 400–577K-vote Poki/CrazyGames games show ragdoll stickman comedy is among the most-played browser genres. Turbo Dismount 2's numbers show premium PC is not where that audience is.
- **Party, not damage-scoring.** The 2022–2026 breakout ragdoll successes (Party Animals, PEAK, Stick It to the Stickman) are social or co-op. None is a single-player damage-score game, so NGD's spread must rely on clips and leaderboards, not co-op.

### Gaps
- No Google Play install ranges for Falling Art, Mega Fall, Ragdoll Stair Fall or Melon Playground; Sensor Tower and AppMagic weren't reachable.
- No play counts for Ragdoll Drop. The vote counts for Ragdoll Hit and Ragdoll Archers are ratings, not plays.
- No reliable data on TikTok-viral ragdoll mobile games in 2024–2026. Searches returned only SEO spam.
- Human Fall Flat 2's actual 2026 launch status is unknown. A Gang Beasts 2025–26 sales total and R.E.P.O. / A Difficult Game About Climbing sales were not researched.
- Engines behind Ragdoll Hit, Ragdoll Archers and Ragdoll Drop are unconfirmed (likely Unity, unverified).

---

## 7. three.js / Babylon.js / PlayCanvas ragdoll projects and browser ragdoll games: engines and phone performance

### Takeaway
As of Oct 2026, all three web engines have *demo-grade* ragdolls, and none ships a production ragdoll:
- **PlayCanvas.** The best-documented official example: Ammo.js, 11 box bodies, ball and hinge joints with explicit swing and twist limits, 120 Hz physics, touch input.
- **Babylon.js.** Has an *experimental* `Ragdoll` class (Havok) that still uses box shapes only and, in v9.30.0, **never applies the min/max joint limits it accepts**.
- **three.js.** Community demos only, e.g. `mattvb91/rapierjs-ragdoll`: Rapier, 10 cuboids, spherical joints with no limits.

The browser ragdoll *games* people actually play are Unity WebGL ports or 2D stickman games. I found no phone benchmark for any 3D browser ragdoll game.

### Cited Findings
- **PlayCanvas official ragdoll example [Code].** File `examples/src/examples/physics/ragdoll.example.mjs` in playcanvas/engine HEAD (2.24.0-beta.11, 14 Oct 2026). — [GitHub](https://github.com/playcanvas/engine/blob/main/examples/src/examples/physics/ragdoll.example.mjs)
  - Engine and physics:
    - Ammo.js (wasm with JS fallback) through `JointComponentSystem` (`JOINTTYPE_BALL`, `JOINTTYPE_HINGE`)
    - `fixedTimeStep = 1/120`, with the comment: "Ragdolls are chains of small fast-moving bodies — a finer physics timestep prevents limbs tunneling through the floor on impact"
    - `device.maxPixelRatio = min(devicePixelRatio, 2)`, plus mouse *and* touch input
  - Bodies (box colliders, masses in kg) and joint limits:

    | Body | Mass (kg) | Joint | Type | Limits |
    |---|---|---|---|---|
    | pelvis | 8 | spine (torso to pelvis) | ball | swing 20/20, twist 15 |
    | torso | 10 | | | |
    | head | 3 | neck | ball | swing 35/35, twist 60 |
    | thigh ×2 | 4 | hip | ball | swingY 30, swingZ 70, twist 20 |
    | shin ×2 | 2.5 | knee | hinge | 0–140° |
    | upper arm ×2 | 1.5 | shoulder | ball | swing 80/80, twist 30 |
    | forearm ×2 | 1 | elbow | hinge | 0–140° (mirrored per side) |

    - Body total: about 34 kg.
    - Every part has `linearDamping 0.05` and `angularDamping 0.1`.
- **Babylon.js `Ragdoll` (Physics V2 / Havok) [Code + SS].**
  - From the `@babylonjs/core` 9.30.0 npm tarball, `Physics/v2/ragdoll.{d.ts,js}`. — [npm @babylonjs/core 9.30.0](https://registry.npmjs.org/@babylonjs/core/-/core-9.30.0.tgz); [GitHub source](https://github.com/BabylonJS/Babylon.js/blob/master/packages/dev/core/src/Physics/v2/ragdoll.ts)
    - Marked `@experimental`.
    - Every bone gets a `PhysicsShapeType.BOX` aggregate.
    - Defaults: mass 10, restitution 0, joint type HINGE, min -90 / max 90.
    - Joints are created with `collision: false`.
    - **The `min`/`max` values are stored in the config but never passed to the `PhysicsConstraint`.** Grepping the 9.30.0 JS finds no other use, so joint limits are not applied.
    - API: `new Ragdoll(skeleton, rootTransformNode, config[])`, `ragdoll()` to go dynamic, `pauseSync`, `getAggregate(i)`, `getConstraints()`, `dispose()`.
  - Forum reports (v6.48.1) say the same: box shapes and ball-and-socket only, min/max not applied, erratic limbs, and the mesh can vanish far from origin. Returning to animation requires `pauseSync` plus `returnToRest`, which snaps instantly with no blend. — [Babylon forum: Issues with Ragdolls](https://forum.babylonjs.com/t/issues-with-ragdolls-physics-v2/49090); [Babylon forum: return ragdoll to original position](https://forum.babylonjs.com/t/best-way-to-return-ragdoll-back-to-its-original-position-physics-v2/47397)
  - An older community "small lib for creating ragdolls" thread also exists. — [Babylon forum](https://forum.babylonjs.com/t/small-lib-for-creating-ragdolls/14924)
- **three.js + Rapier community demo [Code + SS].** `mattvb91/rapierjs-ragdoll`, last commit 10 May 2026, shared on r/threejs in May 2025. — [GitHub README](https://raw.githubusercontent.com/mattvb91/rapierjs-ragdoll/main/README.md); [r/threejs post (Redlib mirror)](https://redlib.hackliberty.org/r/threejs/comments/1kor1q3/ragdoll_physics_update); live demo at [mavon.ie/demos/rapierjs-ragdoll](https://mavon.ie/demos/rapierjs-ragdoll), not tested
  - three 0.184 and `@dimforge/rapier3d-compat` ^0.19.3, Vite. A glTF character plus a Blender file are included.
  - 10 dynamic bodies (torso, head, 2× upper arm, 2× lower arm, 2× thigh, 2× shin), all **cuboid** colliders, density 0.16.
  - Joints are `JointData.spherical`, with **no limits set**. A 0.03 "stiffness" gap separates the bodies.
  - Each physics body is mapped to a glTF bone and synced every frame.
- **Rapier JS joint API [Code].** In `@dimforge/rapier3d-compat` **0.21.0** (latest on npm, Oct 2026), `dist/dynamics/impulse_joint.d.ts` shows `SphericalImpulseJoint` exposes only per-angular-axis **motor** methods: `configureMotorModel`, `setMotorMaxForce`, `configureMotorVelocity`, `configureMotorPosition` and `configureMotor`. It has **no `setLimits`**, which exists only on `UnitImpulseJoint` (revolute and prismatic). The alternative is `JointData.generic(anchor1, anchor2, axis, axesMask)`, which locks chosen axes. So in the JS API, swing/twist cone limits on a spherical joint must be approximated with position motors acting as soft springs, or by building the joint as a generic joint or a revolute chain. — [npm @dimforge/rapier3d-compat 0.21.0](https://registry.npmjs.org/@dimforge/rapier3d-compat/-/rapier3d-compat-0.21.0.tgz)
- **three.js forum [SS].** An "Active Ragdoll Physics" thread asks for examples of an animated ragdoll that reacts to obstacles. A reply points to a cannon.js demo another user says is broken. The forum's Showcase category had no ragdoll showcase in search results. — [three.js forum: Active Ragdoll Physics](https://discourse.threejs.org/t/active-ragdoll-physics/67247)
- **three.js phone performance anecdote [SS].** A developer of a three.js combat game with ragdoll-style characters said it is "playable on mobile now". The remaining bottlenecks are "heavy combat with blood and hit effects" and several active actors at once. — [r/threejs (Redlib mirror)](https://redlib.hackliberty.org/r/threejs/rising)
- **Browser ragdoll games' engines [SS].**
  - Mega Fall Ragdoll Simulator's WebGL build is **Unity 2022**. — [CrazyGames](https://www.crazygames.com/game/mega-fall-ragdoll-simulator)
  - Falling Art Ragdoll Simulator has a WebGL build on CrazyGames (Apr 2024), presumably Unity like its mobile version (engine not stated). — [CrazyGames](https://crazygames.com/game/falling-art-ragdoll-simulator)
  - Happy Wheels' HTML5 version was outsourced to Goodboy Digital. — [Happy Wheels Wiki](https://happywheels.fandom.com/wiki/File:JS_Homescreen_-_Farewell_Flash....PNG)
  - Ericetto's Poki games' engine was not confirmed. — [Poki](https://poki.com/en/g/ragdoll-hit)
- **PlayCanvas showcase [SS].** The "Made with PlayCanvas" page and the Awesome PlayCanvas list surfaced no ragdoll game. — [PlayCanvas docs](https://developer.playcanvas.com/user-manual/getting-started/made-with-playcanvas)
- **From the earlier pass (not re-researched).** Jolt's JoltPhysics.js "Powered Rig" and Ragdoll demos, cannon-es's ConeTwist ragdoll and the kool PhysX ragdoll are in `browser_physics_and_performance.md`.

### Inferences
- **Starting points:**
  - **PlayCanvas.** Its Oct 2026 example is the most production-like *limit table* published for a web ragdoll. Its limits are a good starting point for any engine: spine 20/20/15, neck 35/35/60, hip 30/70/20, shoulder 80/80/30, knee and elbow 0–140. So is its 120 Hz substep note for fast falls.
  - **Babylon.js.** Do not use the built-in `Ragdoll` for NGD. With no joint limits and box-only shapes, limbs hyper-rotate. A custom Havok 6DoF setup would be needed.
  - **three.js + Rapier.** The community demos are a bone-sync reference only. They need joint limits, capsules and CCD before they're fit for a fall-and-smash game. Rapier's JS spherical joint has no limit setter in 0.21.0, so plan on motor-based soft limits, or generic or revolute joints, from day one. Check the earlier physics notes on the 2026 Rapier rework, in case a newer API adds cone limits.
- **What it means for NGD.** No one has shipped a polished 3D browser ragdoll game for phones that I could find. The existing quality bar on portals is Unity WebGL, with its heavy downloads and slow start. A three.js/WebGPU game with a well-limited ragdoll and fast load would be visibly better than what's on Poki and CrazyGames today.

### Gaps
- No measured phone frame rates or physics-step timings for any browser ragdoll game or demo were found. I could not run the demos on a device.
- The three.js forum, CodePen and GitHub search were unreachable (GitHub search API blocked in this session), so other community projects (react-three-rapier ragdolls, VRM ragdolls) remain unsurveyed.
- Whether Poki/CrazyGames ragdoll hits use Unity, Construct, Phaser or custom engines was not verified.
