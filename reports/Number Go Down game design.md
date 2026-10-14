# Break Bones, Not Frame Rates: Building Number Go Down

Number Go Down can become the best ragdoll bone-break launch game ever made because the genre's high point is still a 2010 console mode, and nobody has built its equivalent for a phone. Skate 3's Hall of Meat set that high point with a 25-part damage table, a 0.3x slow-mo and an X-ray skeleton, and the 2025 skate. reboot dropped it. The 2022–2026 phone and browser entries are Unity WebGL ports, 2D stickman games or toy-like Dismount games whose high scores players put down to luck. Getting there takes five things at once. First, bone-break presentation as good as Skate 3's, rationed so it stays special. Second, a weak one-finger sway, like Burnout's Aftertouch, that turns chaos into skill. Third, a 13-body "mostly limp, faintly alive" ragdoll built on the Emonad model that already exists, which has a 53-joint skeleton with VRM bone names. Fourth, 60 fps on mid-range phones with about 3 MB to download before the first fling. Fifth, a sharing layer that gives every player a finished vertical clip, a challenge link and a daily board with a shared seed, verified by re-running the physics on the server. The October 2026 tools can do all of this: Rapier 0.21, three.js r186, WebCodecs video encoding in iOS 26, and Cloudflare Durable Objects with 30 s of CPU per call. Rapier 0.21 already checks fast bodies against static walls for tunnelling (CCD), reports contact forces and ships a build that gives identical results on every platform. The biggest unknowns are four:

- whether the ragdoll feels right, given that Rapier's JavaScript API has no limit setter for ball joints
- whether the frame rate holds on a phone across a whole run
- whether the physics gives identical results on every device, which ghosts and score checks depend on
- whether a broken emo kid reads as slapstick rather than grim

So the first thing to build is not a level or a menu but one perfect fall: slingshot, Emonad, one zone and one bone break with full slow-mo, X-ray and crunch, running on two real phones.

> **How to read the evidence.** This report draws on eleven research notes written on 14 October 2026. In the research environment, page fetches were blocked for almost every site except GitHub, and the shared search budget ran out partway through. Many web claims therefore rest on search-engine summaries of the cited pages rather than full reads, so treat them as well-pointed leads, not checked quotes. The firmest numbers come from primary material the researchers read in full:
>
> - a fan datamine of Skate 3's game files
> - decompiled, released or reconstructed game code (Hollow Knight, Celeste, Balatro, a Nuclear Throne recreation)
> - engine source (Jolt, Bullet, Unity's ragdoll wizard, PlayCanvas, Babylon.js)
> - npm package tarballs and WebKit source
>
> Any design value in this report without a citation is the report's own inference: a starting point for playtesting, not a finding. Tables mark the difference in a "Basis" column.

## The genre peaked on consoles in 2010 and never reached phones

The most complete public model of a bone-break game is Skate 3's Hall of Meat, and a fan datamine has made its rules readable. It scores **25 body parts**. Each part has up to six damage tiers keyed to impact strength and passes a share of every hit to linked parts, so one big slam lights up a cascade ([HOM-FINDINGS](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md); [hom_core.cpp](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/source/hom_core.cpp)). The weighting is a comedy decision, not anatomy. The **groin pays 1,000 points at an impact of just 3** and 10,000 at 14, while a hand pays 100 at 6; skull and neck top out at 5,000 ([hom_core.cpp](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/source/hom_core.cpp)). Whole-crash measures sit on steep, capped curves that pay nothing below a threshold. Bail time pays nothing under 5 s, and **a 6 s bail is worth 6.7x a 5 s one**, which builds in a "just one more second" goal ([hom_core.cpp](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/source/hom_core.cpp)). Players remembered the presentation more than the maths. When skate. (2025) launched without Hall of Meat, roughly 15 million players found "the classic Hall of Meat feature is nowhere to be found" ([Inverse](https://www.inverse.com/gaming/skate-15million-fan-favorite-feature-hall-of-meat)). Forum threads demanded "BRING BACK BROKEN BONES" ([EA forums](https://forums.ea.com/discussions/skate-en/bring-back-broken-bones-and-getting-wrecked-by-the-bus/12601318)), and modders rebuilt the mode ([ReSkate guide](https://skatemods.com/guides/play-skate-with-reskate/)). The ReSkate rebuild also carries a tuning warning: it raised its break thresholds after playtests because "a hard fall on flat ground broke bones" ([ReSkate PR #137](https://github.com/Dingo-Shenanigans/ReSkate/pull/137)).

Burnout taught the genre how to give chaos a steering wheel and a second act. Burnout 3's Crash Mode turned damage into dollars across **100 junctions** ([Wikipedia](https://en.wikipedia.org/wiki/Burnout_3:_Takedown)). Once enough cars had wrecked, the player could detonate the Crashbreaker for a second blast ([Burnout wiki](https://burnout.fandom.com/wiki/Crashbreaker)), and a poisoned "Heartbreaker" pickup halved the score ([GameSpot](https://www.gamespot.com/reviews/burnout-3-takedown-review/1900-6106827/)). Aftertouch was a held slow-motion window called "Impact Time", in which the stick could "somewhat" nudge the wreck's path ([Worthplaying](https://worthplaying.com/article/2004/9/22/reviews/19370-xbox-review-burnout-3-takedown/)). The control was weak; its value came from what it let the player reach: multiplier icons, rivals, and a boost refill in races that turned a crash into "a recovery move" ([GameSpot](https://gamespot.com/reviews/burnout-3-takedown-review/1900-6106835/)). Burnout Paradise's Showtime mode made **buses the only multiplier source**: "Hitting a bus will add one to the score multiplier" ([EA manual](https://eaassets-a.akamaihd.net/eahelp/manuals/burnout-paradise-remastered-manual_switch_en-us.pdf)). The series also left three warnings:

- Revenge's button-mashed Crashbreaker drew complaints ([ResetEra](https://www.resetera.com/threads/burnout-revenge-is-a-poor-sequel-to-burnout-3.206622/)).
- Paradise players asked in vain for a way to skip its forced crash cam ([Steam](https://steamcommunity.com/app/24740/discussions/0/540744475532078726/)).
- Danger Zone, a Crash Mode revival by Burnout's founders, was judged thin at 20 levels and under two hours ([EGM](https://egmnow.com/danger-zone-review/)).

The direct ancestors of a slingshot ragdoll show both how far the genre reaches and where it stops. Pain (PS3, 2007) loaded a character into a giant slingshot and scored the damage to him and the world ([Wikipedia](https://en.wikipedia.org/wiki/Pain_(video_game))). Reviewers praised its Havok physics but faulted controls that used "nearly every PS3 controller button" ([HonestGamers](https://www.honestgamers.com/7573/playstation-3/pain/review.html)), and it settled at a Metacritic score of 71 ([Metacritic](https://www.metacritic.com/game/pain-2007/)). Turbo Dismount proved the mass market: over 50 million Google Play downloads by Wikipedia's count ([Wikipedia](https://en.wikipedia.org/wiki/Turbo_Dismount)) and about 71 million Android installs by AppBrain's estimate before its 2023 removal ([AppBrain](https://www.appbrain.com/app/turbo-dismount%E2%84%A2/com.secretexit.turbodismount)). Its weak spots are the ones Number Go Down must fix. One player wrote that the only way up the high-score table is "to try over and over again until you get a lucky run" ([GameSpot user review](https://www.gamespot.com/turbo-dismount/user-reviews/2200-12600590/)). Turbo Dismount 2 players complain of 20–30 s waits for the physics to settle before a replay starts ([Steam](https://steamcommunity.com/app/2280350/discussions/0/594013058474446711/)). Despite about 95% positive reviews, Turbo Dismount 2 sold an estimated 33K copies on PC, with an all-time peak of 171 concurrent players ([Raijin](https://raijin.gg/app/2280350/Turbo_Dismount_2)), so the genre's audience is on phones and the web, not premium PC. FlatOut 2's ragdoll stunt events supply the most useful steering rule: in-flight "aerobatics" add drag, so control costs distance, while a small "nudge" gives a lift ([FlatOut wiki](https://flatout.fandom.com/wiki/Ragdoll_Physics)).

Launch and falling games supply the loop and the pacing. Rovio returned to the slingshot because players understood it instantly. It tuned aiming "so that players could decipher why they had failed" and moved structures further from the sling "to increase anticipation and excitement" ([Wikipedia](https://en.wikipedia.org/wiki/Angry_Birds_(video_game))). Its 2012 re-release also fixed accidental flings while zooming ([Rovio](https://www.rovio.com/articles/bringing-back-2012-angry-birds-sets-a-flightpath-for-a-re-release/)). The Kitten Cannon lineage runs on launch, earn, upgrade, go further; Burrito Bison: Launcha Libre reached 8.4 million mobile downloads plus 1.8 million web plays within ten months ([Juicy Beast](https://juicybeast.com/2017/08/03/in-case-of-emergency-make-burrito-bison-3/)). Kick the Buddy reached roughly 520 million Android downloads ([AppBrain](https://www.appbrain.com/app/kick-the-buddy%EF%BC%8Dfun-action-game/com.playgendary.kickthebuddy)), but players complain of weapons "locked behind 5000 coins" and ads "literally every minute" ([App Store](https://apps.apple.com/us/app/kick-the-buddy/id1278869953)). The copycats show why the category stayed low quality: one "Ragdoll Dismounting" clone has 5M+ lifetime installs but only about 1.6K in the last 30 days ([AppBrain](https://www.appbrain.com/app/ragdoll-dismounting/com.stickman.ragdoll.turbo.dismount.physics)). Falling games add the combo grammar:

- Downwell rewards chains of kills made without touching the ground ([Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=1613957513)).
- Helix Jump turns the ball into a smashing fireball after several clean drops ([LevelWinner](https://www.levelwinner.com/helix-jump-voodoo-cheats-tips-hints-get-super-high-score/)).
- BoomBit's Falling Art Ragdoll Simulator (power-meter launch, fall, score the spectacle) made almost $1.1 million in its first three months ([BoomBit IR](https://investors.boombit.com/?p=3884)).

People watching, not share buttons, spread these games. Skate's own clip site died with EA's servers ([Skate wiki](https://skate.fandom.com/wiki/Replay_Editor)). Yet a PewDiePie Skate 3 video with 12.37 million views pushed the four-year-old game into a reprint ([bit-tech](https://www.bit-tech.net/news/gaming/skate-3-gets-reprint-due-to-youtube-popular/1/)) and lifted unit sales about 33% in the first half of 2014 ([MCV](https://mcvuk.com/business-news/how-pewdiepie-fired-skate-3-back-into-the-charts/)). Happy Wheels has no damage score at all ([Wikipedia](https://en.wikipedia.org/wiki/Happy_Wheels)) and still spread through YouTube, where one PewDiePie montage reached 22.6 million views ([Mic](https://www.mic.com/articles/53505/this-gamer-is-bigger-than-miley-cyrus-and-one-direction)). Its September 2026 Steam release drew about 750K wishlists against its creator's 5K expectation ([Notebookcheck](https://www.notebookcheck.net/16-year-old-PC-game-gets-750-000-Steam-wishlists-in-two-weeks-after-developer-expected-just-5-000.1405791.0.html)). Ragdoll failure is naturally clip-shaped content. Number Go Down's job is to cut the clip for the player.

| Ancestor | What it proved | What failed | What Number Go Down takes |
|---|---|---|---|
| Skate 2/3 Hall of Meat | Per-part damage table, steep capped curves, X-ray and slow-mo are what players remember | Finite challenge list; dropped from the 2025 reboot | The scoring shape, comedy weighting and break presentation |
| Burnout 3 / Paradise | Weak slow-mo steering aimed at rewards; a second-stage detonation; a single rare multiplier source | Button-mashing; unskippable cams | Sway aimed at whales and gates; "Rug Pull" detonation; tap-to-skip |
| Turbo Dismount 1/2 | Huge mobile demand for "launch a dummy for damage" | "Lucky run" high scores; slow replays; small premium reach | Skill through mid-fall input; instant replays; free on the web |
| Pain / FlatOut | A slingshot ragdoll is instantly fun; steering that costs distance | Too many buttons; shallow content | One gesture to launch, one to sway; steering adds drag |
| Angry Birds | A recognisable launch mechanism; failure you can read; distance builds anticipation | Its dotted trail goes wrong on bounces | Pull-back launch; ghost of the last launch; a short preview arc only |
| Kick the Buddy and clones | Ragdoll abuse is a mass-market toy | Paywalled destruction, constant ads, near-zero retention | Every damage tool earnable; cosmetics only |
| Downwell / Helix Jump | Combos for chaining without touching; smash-through momentum | Downwell's rewards stop at 25 combos | A freefall chain that keeps escalating; "Capitulation" smash-through |
| Happy Wheels / Skate 3 on YouTube | Watchers spread ragdoll comedy | In-game clip sites died | A vertical clip already rendered at the results screen |

The open ground is precise. The gap-fill researcher found no browser game that combines a slingshot, a vertical obstacle course, continuous one-finger steering, a mascot with personality and high-end 3D. The nearest are Ericetto's Ragdoll Drop on Poki, 15 levels of launching a ragdoll into pits, walls and rockets ([Poki](https://poki.com/en/g/ragdoll-drop)), and Unity WebGL ports such as Mega Fall Ragdoll Simulator ([CrazyGames](https://www.crazygames.com/game/mega-fall-ragdoll-simulator)). Web engines lag behind too. Babylon.js's experimental `Ragdoll` class stores joint limits but never applies them to its constraints ([Babylon.js source](https://github.com/BabylonJS/Babylon.js/blob/master/packages/dev/core/src/Physics/v2/ragdoll.ts)). The best-known three.js + Rapier demo uses ten box-shaped bodies joined by ball joints with no limits ([rapierjs-ragdoll](https://github.com/mattvb91/rapierjs-ragdoll)). The console bar is high and the phone-browser bar is low, and that gap is the opportunity.

## A bone break is a 1.4-second production, not a sound effect

### Freeze briefly, slow down once, then get out of the way

Only a few games publish exact timings, and they agree more than they differ:

- **Skate 3.** Its break slow-mo, rebuilt frame by frame against footage, drops to **0.3x within 0.15 s, holds about 1 s and ramps back over about 1 s**. A second break extends the slow-mo rather than restarting it ([s3hom_hud.cpp](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/source/s3hom_hud.cpp)).
- **Hollow Knight (decompiled).** Enemy kills freeze for 0.04 s down, 0.03 s hold and 0.04 s up, about 110 ms, always paired with a camera-shake event. Its dramatic slow-mo eases to **0.15x over 0.25 s, holds for 2 s and returns over 0.25 s** ([GameManager.cs](https://github.com/ayushpaharia/hollow-knight-code/blob/HEAD/Assembly-CSharp/GameManager.cs)).
- **Celeste.** It freezes 50 ms on a dash and 100 ms on a bumper launch, and skips the freeze entirely when time is already slowed ([Player.cs](https://github.com/NoelFB/Celeste/blob/master/Source/Player/Player.cs)).
- **Nuclear Throne.** A community recreation of the game's hit pauses (its "sleep" calls) scales them with enemy size: 20 ms plus 15 ms per size unit ([nt-recreated](https://github.com/toarch7/nt-recreated-public/blob/HEAD/objects/enemy/Destroy_0.gml)).
- **Smash Bros. Ultimate.** Its hitlag (the freeze on a hit) is a fixed floor plus a damage term ([SmashWiki](https://www.ssbwiki.com/Hitlag)).

The counter-warning is just as clear: on frequent hits, pauses "longer than a few frames" make a game "feel like it has a stutter" ([Critical Points](https://critpoints.net/2017/06/22/hollow-knight-review/)). A study that mined player reviews of top action games found hit stop, sound coherence and camera control to be the biggest contributors to impact feel ([Lin et al. 2022](https://faculty.washington.edu/zkwen/articles/lin22features.pdf)).

Camera energy should grow as a power curve, not linearly. Bevy's reference implementation of Squirrel Eiserloh's "trauma" model works like this ([Bevy](https://github.com/bevyengine/bevy/blob/main/examples/camera/2d_screen_shake.rs)):

- Each event adds trauma, which decays at 0.5 per second.
- The shake is trauma squared, because linear shake "doesn't feel punchy".

Masahiro Sakurai's hitstop rules carry straight over to a ragdoll ([Sakurai via patchouli-handbook](https://github.com/Tritium0041/patchouli-handbook/blob/HEAD/example/masahiro-sakurai-on-creating-games/evidence/tycbMSjDDLg.md)):

- Shake the victim more than anything else.
- Never move the hit-detection shape with the visual shake.
- Let the amplitude decay.
- Set each hit's freeze length with its own multiplier.
- Scale shake with camera distance, so zoomed-in breaks don't blow out the frame ([compilation notes](https://github.com/Tritium0041/patchouli-handbook/blob/HEAD/example/masahiro-sakurai-on-creating-games/evidence/5MBxBsF6-vg.md)).

His hit-mark rules apply too: place the effect exactly where the bodies meet, back bright shapes with dark ones, give them short lives and never cover the character ([Sakurai via patchouli-handbook](https://github.com/Tritium0041/patchouli-handbook/blob/HEAD/example/masahiro-sakurai-on-creating-games/evidence/B-P4ysHSjCg.md)). God of War cut camera shake to keep targets legible and made up the impact in audio and animation ([PlayStation Blog](https://blog.playstation.com/2022/10/04/game-developers-explain-what-makes-god-of-war-2018s-combat-tick/)). That is the right call for a game where the player must read the obstacles below.

The notes disagreed on how long a bone-break freeze should be. The audio and art researchers proposed 50–100 ms; the game-feel researcher proposed 150–250 ms. The code-sourced anchors favour the short end for anything that happens often and save 200 ms or more for rare events. This report therefore sets ordinary breaks at 60–140 ms, scaled by bone size, and adds slow motion only for the rationed cinematics in tier T4 below. In the table, I is a 0–1 impact strength: the contact impulse divided by a reference impulse.

| Tier | Trigger | Time | Camera and screen | Other feedback | Basis |
|---|---|---|---|---|---|
| T0 | I < 0.08 | None | None | Tiny dust puff at most; limp ragdolls make dozens of micro-contacts per second | Inference |
| T1 bump | I 0.08–0.35 | No freeze | Trauma +0.1–0.2 | Mesh squash to 0.85–0.9; 3–8 particles; small "+N" | Juicy Breakout stretch clamp ([Ball.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/gameobjects/Ball.as)); values inferred |
| T2 slam | I 0.35–0.7 | 40–80 ms freeze at time scale ~0.02 | Directional kick along the hit normal; trauma +0.3 | Visual-only vibration of the mascot's mesh; "BONK" pop; chromatic-aberration pulse | Celeste 50–100 ms; Sakurai's victim shake |
| T3 break | Any bone break that fails the cinematic gate | 20 + 15 × bone size ms, giving 60–140 ms (hand ~60, femur or skull ~130) | Trauma +0.5; no camera cut | 150–300 ms X-ray blink in place; "CRACK!"; bone icon flies to the HUD skeleton; signature BREAK sound; Android haptic | Nuclear Throne size scaling; Hollow Knight ~110 ms kill |
| T4 cinematic | A break or huge hit that passes the budget, novelty and cooldown gate; the finale always qualifies | ~100 ms freeze → ease to **0.25x** over 150 ms → hold 0.8–1.0 s real time → ease out over 300 ms | Zoom (FOV −15–25%), 10–25° orbit, desaturate to 0.5, cool blue push, red flash, film grain, vignette | Full X-ray, slow-mo audio, music duck, steering doubled; tap to skip, hold to slow | Skate 3 envelope and grade ([HOM-FINDINGS](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md)); Hollow Knight type 2 |

Score popups need their own timing. Balatro's decompiled scoring code shows the best-documented recipe ([state_events.lua](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/functions/state_events.lua#L607-L608); [game.lua](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/game.lua#L2484-L2498); [moveable.lua](https://github.com/balatro-src/balatro-src-reverse-engineering/blob/HEAD/engine/moveable.lua#L250-L275)):

- Each successive scoring event plays its sound **1.6% higher in pitch**.
- Long scoring chains speed themselves up after about 10 s.
- Every wobble is switched off under reduced motion.

For Number Go Down, each new broken bone in a fall can climb in pitch the same way, and the end-of-run tally can accelerate when a run produces 20 or more breaks.

### Ration the cinematic or players will beg to skip it

The genre's most-repeated presentation complaint is the forced cinematic. Paradise players wanted the crash cam gone ([Steam](https://steamcommunity.com/app/24740/discussions/0/540744475532078726/)). Sniper Elite 5, by contrast, puts its X-ray kill cam behind settings ([Rebellion accessibility](https://rebellion.com/accessibility/sniper-elite-5-accessibility/)):

- separate frequency settings for bullet and melee kill cams, from "none" to "frequently"
- an X-ray on/off switch
- playback speed the player can change during the cam

Max Payne 3 keeps its bullet cam for the last enemy in an area and lets the player hold a button to slow it almost to a stop ([Max Payne wiki](https://maxpayne.fandom.com/wiki/Bullet_Cam)). At the long end, Mortal Kombat 11's Fatal Blows average about 11–12 s by one player's timing ([TestYourMight](https://testyourmight.com/threads/fatal-blow-length.70300/)), far too long to repeat in a 35-second run.

This report's budget is an inference to tune in playtesting:

- **Count.** At most max(2, run length ÷ 12 s) T4 cinematics per run.
- **Cooldown.** 6–8 s of game time between cinematics.
- **Novelty.** A T4 fires only for the first break of that bone this run, or for a hit at least 1.25x bigger than any earlier cinematic.
- **Fallback.** A break that fails the gate drops to T3, so no break goes unacknowledged.
- **Shrinking.** Later cinematics in the same run run 15–20% shorter.
- **Finale.** The final crater always gets a cinematic, outside the budget, as Peggle always zooms and slows on the last orange peg ([GamesRadar](https://www.gamesradar.com/peggle-10/)).

One subtlety matters for fair leaderboards. If slow-mo doubles steering strength, the gate must run on simulation events and simulation time, not on whether the cinematic was shown. A player who sets cinematics to "Off" must still get exactly the same physics.

Flashes and motion need hard limits on a phone. Under WCAG 2.3.1, content may not flash more than three times in any second, measured against a 341 × 256 px area (87,296 px²), and saturated red has its own stricter test ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)). A full-screen flash on a 390 × 844 portrait phone covers about **3.8 times that area**, so an anime-style "impact frame" can fire at most once per cinematic and needs a "Reduce flashing" toggle. Dragon Ball Sparking! ZERO players compared its brief black-and-white impact frame to a flashbang and asked for a way to turn it off ([Steam](https://steamcommunity.com/app/1790600/discussions/0/4846527331298874206/)). The game should respect the operating system's `prefers-reduced-motion` setting by default. It should also expose four settings:

- screen shake (0–100%)
- flashing (on/off)
- cinematics (Always / Big moments only / Off)
- camera motion (Full / Reduced)

### Sound carries the crunch, and iPhones get no impact haptics

Great impacts are built from short layers:

- a transient (the initial crack)
- a body or thump
- a tail

A 2025 sound-design article describes exactly this onset/body/thump/tail stack ([MPSE Wavelength](https://digital.copcomm.com/i/1538144-fall-2025/18)). Practitioners report that varying the transient and the tail matters more than pitch-shifting the whole sound ([VI-Control](https://vi-control.net/community/threads/if-you-had-only-one-snare-sample.138821/)). Distinctive sounds wear out fastest when repeated ([Sound in Games wiki](https://soundingames.dei.uc.pt/index.php/Variety)), which is why Skate 3 shipped **297 decoded bone-crunch sounds**, 4 slow-mo sounds and 24 announcer lines ([HOM-FINDINGS](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md)). Sniper Elite's lead audio designer calls the X-ray cam the one moment where the team sets realism aside and goes for maximum intensity ([MCV](https://www.mcvuk.com/sniper-elite-4-boom-shot/)). The team built body impacts by crushing fruit and vegetables ([Game Informer](https://gameinformer.com/games/sniper_elite_3/b/xboxone/archive/2014/02/14/new-kill-cam-adds-gruesome-detail.aspx)), and Mortal Kombat's gore comes from peppers, grapefruits and walnuts ([Dread Central](https://dreadcentral.com/news/299082/new-video-goes-into-the-disgusting-sounds-of-mortal-kombat)).

For a cartoon emo mascot, the inference is to keep the crisp crack and drop the wet squelch: celery and walnut snaps pitched up, followed by a comic sweetener such as a boing, a coin spill or a falling slide whistle. Above all of it sits one unmistakable "BREAK confirm" sound. Overwatch made its hit-confirm sound from a reversed, altered beer-bottle opening, designed to be audible through every other effect ([PC Gamer](https://www.pcgamer.com/au/overwatchs-hit-sound-effect-is-apparently-powered-by-beer)).

Slow-motion audio should sound like a slowed recording. The convention is pitch-down plus low-pass filtering, with the ambience faded down ([Sound in Games wiki](https://soundingames.dei.uc.pt/index.php/Time_Twist)). CRI's bullet-time guide adds that key sounds should crossfade into purpose-made slow-motion versions rather than simply being pitch-shifted ([CRIWARE](https://blog.criware.com/index.php/2024/06/03/bullet-time/)), and one Unity tutorial pulls a low-pass filter down to about 800 Hz ([bugnet.io](https://bugnet.io/blog/fix-unity-timescale-affecting-audio-pitch)). For Number Go Down that means three or four dedicated assets: a slow crack, a slow whoosh, a heartbeat and a reverse swell into the hit.

Music should work in two ways at once:

- **Layers.** Stems at one tempo fade in with depth and speed, the vertical-layering method ([IRPR](https://sounddesign.irpr.agency/glossary/vertical-layering/)).
- **Stingers.** A sting on each break, quantised to the beat, and a beat of silence before a full-band drop at Rock Bottom (an inference).

Licensing points to commissioning original emo/pop-punk stems. ElevenLabs' music terms list "commercial video games" as a prohibited use on self-serve plans ([Eleven Music terms](https://elevenlabs.io/eleven-music-model-specific-terms)). A 2026 explainer says Suno grants paying users commercial rights but promises no copyright in the output ([Dubspot](https://blog.dubspot.com/ai-music-licensing-explained-2026)). For sound effects, the Sonniss GDC 2026 bundle offers 7.47 GB royalty-free with no attribution ([Rekkerd](https://rekkerd.org/sonniss-releases-gdc-2026-game-audio-bundle/)), and ZzFX generates endless UI blips in under 1 KB ([ZzFX](https://github.com/KilledByAPixel/ZzFX)).

The phone browser imposes four constraints:

- **Unlocking.** iOS ignores `AudioContext.resume()` unless it runs inside a real touch handler ([Matt Montag](https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos)), and the context can get stuck "interrupted" until it is suspended and resumed on `visibilitychange` ([WebKit bug 276016](https://bugs.webkit.org/show_bug.cgi?id=276016)).
- **The silent switch.** By default the mute switch silences Web Audio. Setting `navigator.audioSession.type = "playback"` (Safari 16.4+) stops that ([WebKit bug 237322](https://auto-bugs.webkit.org/show_bug.cgi?id=237322)), but it also pauses the player's own music ([MDN](https://developer.mozilla.org/docs/Web/API/AudioSession/type)). Default to "playback" during runs and offer a "mix with my music" toggle.
- **Memory.** A decoded 60 s stereo clip takes about 23 MB ([MDN mirror](https://docs.w3cub.com/dom/audiobuffer)), so music must ship as short decoded loops.
- **Formats.** Independent testing found Ogg Opus in Safari 18.4 "incomplete, buggy" ([frequal](https://frequal.com/java/OggOpusStillNotWorkingInSafari18_4.html)), so AAC is the safe iOS format.

Haptics are an Android-only enhancement for impacts. The Vibration API runs in Chromium browsers, Firefox removed it in version 129, and iOS does not support it ([caniuse](https://caniuse.com/vibration)). The hidden-switch trick, which triggered iPhone haptics from script, worked on iOS 17.4–26.4 until Apple patched it in 26.5 ([ios-haptics](https://www.npmjs.com/package/ios-haptics)). Now only a real finger tap on a switch element fires a single system tick ([tappt PR #5](https://github.com/mxerf/tappt/pull/5); [Project Fathom](https://github.com/m1ckc3s/project-fathom)). The audio researcher proposed putting a switch overlay on the slingshot release to get that tick. This report flags the idea as doubtful: a long drag-and-release normally produces no click event, so it likely fires no haptic. That needs a device test before anyone relies on it. On Android, keep pulses crisp and short. Android's guidance treats 10–20 ms as a good click and says "given the choice between buzzy haptics and none, choose none" ([Android Developers](https://developer.android.com/develop/ui/views/haptics/haptics-principles)). On iOS, the sub-bass thump and the freeze frame have to carry the impact.

## Emonad should look limp but faintly alive

Euphoria, the NaturalMotion system behind GTA's ragdolls, is worth copying for its vocabulary, not its engine. GTA V's Euphoria message set names behaviours such as these ([Euphoria.cs](https://github.com/scripthookvdotnet/scripthookvdotnet/blob/main/source/scripting_v3/GTA.NaturalMotion/Euphoria.cs)):

- ArmsWindmill and PedalLegs
- BraceForImpact
- BodyFoetal and BodyWrithe
- HeadLook
- ShotShockSpin, documented as spinning the character "using cheat torques/forces"

So even Euphoria used non-physical pushes for drama. Each behaviour can be rebuilt as a target pose plus a per-joint strength plus a trigger, which costs a few vector operations per joint per step. That gives six behaviours, all inferred starting values:

- **Airborne flail.** Arm windmill and leg pedalling at 10–25% strength while airborne.
- **Brace.** When time to impact drops under about 0.2 s, reach the hands toward the contact at 30–50% strength, then cut strength to zero on contact so the arms crumple.
- **Foetal curl.** A brief tuck after big hits.
- **Head-look.** A weak neck pull (5–10%) toward the next obstacle.
- **Writhe.** Low-strength wriggling at rest.
- **Cheat torques.** Small authored spin impulses that make tumbles readable.

Active-ragdoll projects supply the strength model. EggyStudio's Unity active ragdoll drops strength instantly on contact and regains 0.05 per physics step, with a 10% floor while colliding ([AnimationFollowing.cs](https://github.com/EggyStudio/Unity.Humanoid.ActiveRagdoll/blob/main/Editor/AnimationFollowing.cs)). Hairibar's ragdoll library recommends three things ([Hairibar.Ragdoll](https://github.com/hairibar/Hairibar.Ragdoll)):

- soft joint limits, as "the main stability fix for ragdolls that blow up after large shocks"
- lowering strength on bones in contact, to stop vibration
- favouring low stiffness values, because "low values differ much more visibly than high ones"

The comedy comes from a body that visibly tries and then fails. Secret Exit made Turbo Dismount's figure "an abstraction of a human figure" who clings to his vehicle, "holding on for dear life" ([Kill Screen](https://killscreen.com/why-are-ragdoll-physics-so-funny)). Fall Guys' lead designer says the goal is making "the punchline to that joke different every time" through the character's physics ([Digitally Downloaded](https://www.digitallydownloaded.net/?p=42226)). The cannon-es ragdoll demo shows that joint-limit range alone moves the same rig from rag to doll to mannequin ([cannon-es](https://github.com/pmndrs/cannon-es/blob/master/examples/ragdoll.html)).

Shipped reference ragdolls use flatter mass distributions and fewer bodies than anatomy would suggest:

| Reference | Bodies | Masses | Other settings |
|---|---|---|---|
| Unity Ragdoll Wizard ([RagdollBuilder.cs](https://github.com/duanjiahao/UnityDecompiled/blob/master/UnityEditor/UnityEditor/RagdollBuilder.cs)) | 11, no hands or feet | 20 kg total; pelvis and spine weighted 2.5, legs 1.5, arms and head 1.0 | — |
| Jolt `Stabilize()` ([Ragdoll.cpp](https://github.com/jrouwe/JoltPhysics/blob/master/Jolt/Physics/Ragdoll/Ragdoll.cpp)) | — | Parent-to-child mass ratio clamped to 0.8–1.2 | Parent inertia raised up to 2x, following a Havok talk on stable constraints |
| Real humans, de Leva 1996 ([de Leva table](https://github.com/Westview-USC-Biomechanics-Collaboration/Prepare2Play-Learning-Experience/blob/main/vector_overlay/segdim_deleva.py)) | — | Head 6.94%, trunk 43.46%, upper arm 2.71% of body mass | Shows how far game ragdolls flatten real proportions |
| PlayCanvas example, Oct 2026 ([ragdoll.example.mjs](https://github.com/playcanvas/engine/blob/main/examples/src/examples/physics/ragdoll.example.mjs)) | 11 box bodies, about 34 kg | — | 1/120 s step, "a finer physics timestep prevents limbs tunneling"; spine swing 20°/20°, twist 15°; neck 35°/35°, twist 60°; hip 30°/70°, twist 20°; shoulder 80°/80°, twist 30°; knees and elbows 0–140° |
| Bullet benchmark ragdoll ([BenchmarkDemo.cpp](https://github.com/bulletphysics/bullet3/blob/master/examples/Benchmarks/BenchmarkDemo.cpp)) | 11 | — | Linear damping 0.05, angular damping 0.85 |

The asset in hand fixes several concrete decisions ([asset README](../number-go-down/assets/README.md)):

- **Scale.** Emonad is about 9.6 units tall with his feet at y = 0. Rapier's tolerances assume metres, so either scale the model by 0.1875 to 1.8 m or set Rapier's `lengthUnit`.
- **Facing.** He faces −Z, so the slingshot shot must put the camera on the −Z side to see his face.
- **Rest pose.** He is in an A-pose. Each shoulder joint's swing cone must point down and out along the A-pose arm, or the model must be snapped to a T-pose before the bodies are built ([three-vrm guide](https://github.com/pixiv/three-vrm/blob/dev/guides/migration-guide-1.0.md)).
- **No VRM metadata.** The GLB has no VRM extension; its bones only carry VRM names. This report parsed the file to confirm it: the only extensions are the four `KHR_materials_*` ones, and there is no `UpperChest` bone. So three-vrm's "normalized bones" will not appear automatically. Either export a real VRM from Blender, or, more simply, compute each joint's reference frame from the bind-pose bone directions, the method that rig-independent ragdolls use anyway.
- **Hair.** The `HAIR` mesh is unskinned and moves rigidly with the Head bone, so drive its four sway morphs (`Sway_Left`, `Sway_Right`, `Sway_Forward`, `Bounce`) from a damped spring fed by the head's angular velocity, kicked on impacts.
- **Faces.** The body mesh's 32 morph targets include Blink, Joy, Angry, Sorrow and Surprise. That covers the face timing: Surprise about 150 ms before a predicted impact, a squeeze-blink on contact, then Sorrow. Prune the 15 `vrc.v_*` lip-sync shapes the game will never use.
- **Fingers.** No physics: Godot's ragdoll guide advises against physical finger bones ([Godot docs](https://github.com/godotengine/godot-docs/blob/master/tutorials/physics/ragdoll_system.rst)).
- **Animations.** The four Mixamo dance clips (4–6 s, `mixamorig` bone names, Spine1 and Spine2 mapping onto Chest) should be retargeted offline in Blender, not at runtime, and used for the menu idle and the personal-best celebration. Get-up clips are not in hand. Face-up and face-down get-ups from Mixamo, whose terms allow commercial game use ([Adobe Community](https://community.adobe.com/t5/mixamo-discussions/mixamo-faq-licensing-royalties-ownership-eula-and-tos/m-p/13234775)), fill that gap.

| Body (13) | VRM bones | Shape | Relative mass | Healthy limits (degrees) | Basis |
|---|---|---|---|---|---|
| Pelvis (root) | Hips | Sideways capsule | 3.0 | — | Unity and PlayCanvas root weighting |
| Spine | Spine | Capsule | 1.5 | Swing 20/20, twist 15 | PlayCanvas spine |
| Chest | Chest, with both shoulders fixed to it | Capsule | 2.0 | Swing 20/20, twist 15 | PlayCanvas spine |
| Head | Neck + Head, centred on the head mesh | Big sphere | 1.6–1.8 (top-heavy for comedy, at most 0.9x the chest) | Swing 35/35, twist 60 | PlayCanvas neck; comedy inference |
| Upper arm ×2 | UpperArm | Capsule, radius ≈ 0.25 × length | 0.9 | Swing 80/80 aimed along the A-pose arm, twist 30 | PlayCanvas shoulder |
| Forearm ×2 | LowerArm + Hand | Capsule to the fingertips, radius ≈ 0.2 × length | 0.7 | Hinge 0–140 | PlayCanvas elbow |
| Thigh ×2 | UpperLeg | Capsule, radius ≈ 0.3 × length | 1.6 | Swing 30/70, twist 20 | PlayCanvas hip |
| Shin ×2 | LowerLeg + Foot | Capsule, optionally with a foot box | 1.2 | Hinge 0–140, no hyperextension | PlayCanvas knee |

Everything in the table beyond the PlayCanvas limits is a starting value. Three tuning choices complete it:

- **Spare range.** Keep 30–60° of extra range in reserve on each joint so a break can visibly bend it the wrong way.
- **Bounce and grip.** Restitution near 0 (bouncy limbs read as rubber) and friction 0.6–1.0.
- **Self-collision.** Turn off collisions between linked body parts, but keep forearm-versus-torso and shin-versus-shin collisions so limbs don't pass through the body.

Breaks should change the body for the rest of the run, not just add points. Toribash's damage states give a readable model ([Toribash wiki](https://toribash.fandom.com/wiki/Shoulder)):

- A damaged joint can no longer change its mode.
- A fractured joint "can move more freely than normal relaxed joints".
- A dismembered limb detaches and goes red.

Euphoria likewise had dedicated messages for configuring injured arms and legs and for changing joint limits at runtime ([Euphoria.cs](https://github.com/scripthookvdotnet/scripthookvdotnet/blob/main/source/scripting_v3/GTA.NaturalMotion/Euphoria.cs)). The inferred break recipe:

1. Widen the broken joint's limits by 40–90°.
2. Switch off that limb's muscle strength permanently and lower its angular damping to about 0.3.
3. Push it into the newly allowed wrong angle with a small spin.
4. Add a comic cast or bandage that stays for the rest of the run. Vlambeer's "permanence" principle, keeping marks of past hits on screen, is the reason ([Engineering of Conscious Experience](https://theengineeringofconsciousexperience.com/jan-willem-nijman-vlambeer-the-art-of-screenshake/)).

Each break then visibly changes how Emonad tumbles. No dismemberment: it pushes the tone from slapstick toward gore.

Transitions decide whether the ragdoll looks built or bolted on. At launch:

1. Hold the ragdoll as kinematic (animation-driven) in the slingshot.
2. On release, give every body the same launch velocity. A single shove on the hips makes the limbs trail and stretch.
3. Reset the solver's warm-start cache, as Jolt's `ResetWarmStart` does after a pose teleport ([Ragdoll.h](https://github.com/jrouwe/JoltPhysics/blob/master/Jolt/Physics/Ragdoll/Ragdoll.h)).
4. Fade muscle strength to the freefall level over 0.15–0.25 s ([mocaponline](https://mocaponline.com/blogs/mocap-news/ragdoll-physics-animation-guide)).

At the end:

1. Wait until he comes to rest.
2. Check whether he is face-up or face-down from the hips' orientation ([RagdollHelper.cs](https://github.com/nbzeman/Ragdoll/blob/master/Assets/Scripts/RagdollHelper.cs)).
3. Snapshot the ragdoll's pose and blend into the matching get-up clip over 0.2–0.5 s.
4. Then play a dazed loop or a dance.

## Rapier 0.21 is the right engine, once its joint gap is plugged

| Engine | Latest version (Oct 2026) | Download (gzip) | Ragdoll strengths | Web blockers | Verdict |
|---|---|---|---|---|---|
| Rapier `-simd` / `-deterministic` | 0.21.0, 25 Sep 2026 ([npm](https://registry.npmjs.org/@dimforge/rapier3d-simd)) | ~1.15 MB WASM + 34 KB glue; deterministic build ~1.17 MB ([tarball](https://registry.npmjs.org/@dimforge/rapier3d-simd/-/rapier3d-simd-0.21.0.tgz)) | Built-in tunnelling protection (CCD), speed caps, NaN quarantine, contact-force events, world snapshots, a build that gives identical results on every platform | No ragdoll demo; no limit setter on ball joints in its TypeScript API; no way to read joint forces | **Primary** |
| Jolt (`jolt-physics`) | 1.1.0, 11 Jul 2026 ([npm](https://registry.npmjs.org/jolt-physics)) | ~0.74 MB WASM + 0.14 MB glue | `RagdollSettings`, swing-twist joints that report their forces, drive-to-pose motors, official rig demos ([powered_rig.html](https://github.com/jrouwe/JoltPhysics.js/blob/main/Examples/rig/powered_rig.html)) | Multithreaded build "doesn't work in Safari nor with any JS callbacks"; npm build has SIMD off and a fixed 128 MB heap ([CMakeLists](https://github.com/jrouwe/JoltPhysics.js/blob/main/CMakeLists.txt)) | **Plan B** (custom build) |
| Havok (`@babylonjs/havok`) | 1.3.14 | ~0.66 MB | Reports the forces applied at joints; has a speed limit ([tarball](https://registry.npmjs.org/@babylonjs/havok/-/havok-1.3.14.tgz)) | Closed source; no snapshot API; no official three.js integration ([three.js forum](https://discourse.threejs.org/t/i-ported-babylon-jss-havok-physics-plugin-to-three-js/85539)) | No |
| PhysX (`physx-js-webidl`) | 2.8.0 | ~1.61 MB | All joint types | Heavy first download | No |
| Bounce | 1.10.0 | ~96 KB | Deterministic; supports rollback | No cone or swing-twist joint; no documented CCD ([docs](https://codeberg.org/perplexdotgg/bounce/src/branch/main/docs/documentation.md)) | No |
| cannon-es / ammo.js / Oimo | Last releases 2022 / 2016 / 2020 ([npm](https://registry.npmjs.org/cannon-es)) | — | Simple cone-twist ragdoll demo | Unmaintained | No |

Rapier's August 2026 rework is what makes it fit a game about a body falling fast. Rapier 0.35 brought these changes ([Rapier CHANGELOG](https://github.com/dimforge/rapier/blob/master/CHANGELOG.md)):

- fast bodies always run continuous collision detection (CCD) against fixed geometry, so they cannot tunnel through walls
- body speeds are capped each substep at 400 units/s and about 45° of rotation per step
- bodies that go numerically invalid are rolled back and disabled, a "NaN quarantine"
- contact-force events gained a `started` flag on the step a pair first crosses its force threshold

Two later changes are traps for anyone copying older code. Version 0.35.2 rescaled reported impulses by 1/(solver iterations + 1), so break thresholds tuned on older versions are wrong. Version 0.36 cannot load snapshots saved by earlier versions ([Rapier CHANGELOG](https://github.com/dimforge/rapier/blob/master/CHANGELOG.md)). Neither three.js's built-in Rapier add-on, which pins `rapier3d-compat@0.17.3` ([three 0.186.1 tarball](https://registry.npmjs.org/three/-/three-0.186.1.tgz)), nor the community ragdoll demo, which uses `^0.19.3` ([rapierjs-ragdoll](https://github.com/mattvb91/rapierjs-ragdoll)), reflects the rework. Pin 0.21.0 and treat every pre-August-2026 tutorial and threshold as stale.

The joint-limit gap is the project's first technical risk, and two researchers described it differently. Both read the 0.21.0 TypeScript declarations and agree on the facts:

- `SphericalImpulseJoint` exposes only per-axis motors (added in JS 0.20.0) and has no `setLimits`.
- `setLimits` exists only for revolute and prismatic joints ([rapier3d-compat 0.21.0](https://registry.npmjs.org/@dimforge/rapier3d-compat/-/rapier3d-compat-0.21.0.tgz); [TS CHANGELOG](https://github.com/dimforge/rapier/blob/master/bindings/typescript/CHANGELOG.md)).

They part on the workaround. The physics researcher noted that the raw WASM export `rawimpulsejointset_jointSetLimits` takes an axis argument, so a generic joint with free angular axes might accept per-axis limits through the untyped raw layer. The gap-fill researcher concluded that cone limits must be approximated with position motors acting as soft springs, or with generic or revolute joints. Neither tested the raw route, and per-axis limits only roughly match a real cone: at diagonal swings, a box-shaped limit lets the shoulder overshoot.

This report's call:

- **Knees and elbows.** Use revolute joints, which have real limits.
- **Shoulders, hips, neck and spine.** Use ball joints with motor-driven soft limits, plus a small JavaScript "cone clamp" that applies a corrective torque past the swing cone. The motors double as the active-ragdoll muscles, and soft limits are what Hairibar recommends for stability anyway.
- **Day one.** Spend a day testing the raw generic-joint limits.
- **Fallback.** If none of this feels right on a phone, move to a custom Jolt build with SIMD on, which iOS 16.4+ supports ([caniuse wasm-simd](https://github.com/Fyrd/caniuse/blob/main/features-json/wasm-simd.json)). Jolt has real swing-twist joints and official rig demos.

Bone breaks should be detected from two signals per bone, both checked against the relative speed of the bodies along the contact normal:

- **Hit strength.** Use Rapier's contact-force events (`setContactForceEventThreshold`, the `started` flag, `totalForceMagnitude`) ([rapier3d-simd 0.21.0](https://registry.npmjs.org/@dimforge/rapier3d-simd/-/rapier3d-simd-0.21.0.tgz)).
- **Joint overextension.** Estimate it as angle past the healthy limit × angular speed. Rapier's JavaScript API exposes no joint forces, so this has to be calculated rather than read.

ReSkate's fan design gives sourced starting thresholds: **a bruise at 7 m/s along the contact normal and a break at 12 m/s**, with head hits counted double ([ReSkate PR #137](https://github.com/Dingo-Shenanigans/ReSkate/pull/137)). Scale those per bone, add a 0.5 s cooldown per bone, and run the detector inside the fixed physics step. Results go into a queue that the render loop reads to drive presentation.

The simulation must step at a fixed rate with an accumulator and smooth (interpolated) rendering. Rapier's documentation warns that a timestep that varies "may cause instabilities" ([rapier3d-simd 0.21.0](https://registry.npmjs.org/@dimforge/rapier3d-simd/-/rapier3d-simd-0.21.0.tgz)). This report recommends **120 Hz**, as in PlayCanvas's ragdoll example, for two reasons. It doubles the headroom under Rapier's ~45°-per-step rotation cap. It also leaves 30 simulation steps per real second at 0.25x slow-mo, enough for slow motion to look smooth. Slow-mo then means running fewer fixed steps per real second, never shrinking the step size, which keeps it deterministic. Physics stays on the main thread. Roughly 13 bodies don't justify a worker, and neither Rapier's npm build nor Jolt on Safari can use WASM threads anyway.

On iPhone, WebKit by default paces frames near 60 fps even on 120 Hz displays. It halves to 30 fps in Low Power Mode, under aggressive thermal throttling, or inside a cross-origin iframe the user has not tapped ([UnifiedWebPreferences.yaml](https://github.com/WebKit/WebKit/blob/main/Source/WTF/Scripts/Preferences/UnifiedWebPreferences.yaml); [AnimationFrameRate.h](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/graphics/AnimationFrameRate.h)). That iframe case covers web portals and Telegram Web. Plan for a locked 60 on iPhone and treat 120 Hz as an Android bonus.

Use three.js's `WebGLRenderer` with pmndrs postprocessing for version 1, and evaluate `WebGPURenderer` later with on-device measurements. WebGPU is on by default in iOS Safari 26+ and Chrome Android 121+ ([caniuse](https://caniuse.com/webgpu)), and `WebGPURenderer` falls back to WebGL2 automatically ([WebGPURenderer.js](https://github.com/mrdoob/three.js/blob/dev/src/renderers/webgpu/WebGPURenderer.js)). It still costs more:

- a larger download (728 KB vs 415 KB gzip, unminified upper bounds)
- a half-float output buffer by default, which uses more memory bandwidth
- ongoing API churn: `PostProcessing` was renamed `RenderPipeline` in r183, and shadow APIs changed in r184–r185 ([Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide))

No mobile benchmark comparing the two renderers was found. Every effect in the visual spec below works in WebGL2.

| Budget | Target | Basis |
|---|---|---|
| Frame time | 16.6 ms available at 60 fps; plan to use 10–11 ms, keeping headroom for heat over a run | Inference |
| Physics and game logic | ≤ 2 ms per frame (two 120 Hz steps for about 13 bodies plus a few hundred static colliders) | Inference; measure in phase 0 |
| Skinning and morphs | ≤ 1 ms | Inference |
| Main render pass | 5–6 ms | Inference |
| Post-processing | ≤ 2 ms, in one merged pass | pmndrs `EffectPass` merges effects into one pass ([pmndrs](https://github.com/pmndrs/postprocessing)) |
| Draw calls | 30–80 typical, under 100 hard cap | Practitioner rule of thumb ([MetaDesign](https://metadesignsolutions.com/blog/threejs-performance-optimization-best-practices)) |
| Device pixel ratio | Capped at 1.5, scaling down to 1.0 under load | Inference |
| Live particles | ≤ 2–5k CPU-simulated, in 1–4 batched draw calls | Inference |
| Download before first fling | ≤ 3 MB | Inference (see the disagreements table) |
| Total game download | ≤ 10 MB, streamed while playing | Inference |
| Decoded audio memory | ≤ 20–40 MB | Inference |

The asset pipeline has easy wins. The GLB is 3.3 MB, of which 2.3 MB is five PNG textures. The hair base map alone is 1.29 MB; the other 986 KB is geometry and morph targets. Its four `KHR_materials` extensions are all supported by gltfpack, which discards any extensions it doesn't recognise ([gltfpack README](https://github.com/zeux/meshoptimizer/blob/master/gltf/README.md)). Run gltf-transform 4.5.1 with meshopt geometry compression and KTX2 or WebP textures at 1024 px, keeping `--join` and `--flatten` off so the bone hierarchy survives ([gltf-transform CLI](https://github.com/donmccurdy/glTF-Transform/blob/main/packages/cli/src/cli.ts)). Then prune the unused lip-sync morphs. This report estimates the result at under 1 MB, not yet measured. The meshopt decoder costs about 8 KB gzip, against about 260 KB for the Basis texture transcoder ([three 0.186.1 tarball](https://registry.npmjs.org/three/-/three-0.186.1.tgz)), so WebP is likely the smaller total for a handful of textures.

Build with Vite 8.3.4 ([npm](https://registry.npmjs.org/vite)) and load Rapier's non-compat build through `vite-plugin-wasm`, so the browser can compile the WASM while it streams in. Deploy as a Cloudflare Worker with static assets, with long-lived immutable caching set in a `_headers` file. Those headers do not apply to responses the Worker itself generates ([Cloudflare docs](https://developers.cloudflare.com/workers/static-assets/headers/)).

## Comic-punk toon will read as more expensive than realism

The browser 3D work that feels like a console game wins on art direction, not polygon count:

- **Messenger** (Abeto, 2025) is a cel-shaded three.js game whose team modelled in Blender and Houdini and made "almost everything else" custom ([Communication Arts](https://www.commarts.com/webpicks/messenger); [Wikipedia](https://en.wikipedia.org/wiki/Messenger_(video_game))).
- **Bruno Simon's 2025 portfolio** is MIT-licensed. It runs a staged game loop, compresses every texture to ETC1S and shades props from a shared palette texture ([folio-2025](https://github.com/brunosimon/folio-2025)).
- **Igloo Inc.**, Awwwards' 2024 Site of the Year in the developer category, was tuned directly in the browser with custom tools for shaders, textures and models ([Awwwards](https://awwwards.com/igloo-inc-case-study.html)).

The lesson for a small team is one coherent stylised look, custom shaders and a live tuning panel for every zone's fog, colour grade, bloom and toon ramp from day one.

The recommended look is "comic-punk toon": Hi-Fi Rush's energy, Spider-Verse's print texture and an emo palette. Hi-Fi Rush's renderer applies a step function to the lighting term and uses a dedicated "threshold map" texture for face shadows, because adjusted normals broke under rotation and deformation ([GDC Vault](https://gdcvault.com/play/1034330/3D-Toon-Rendering-in-Hi); [GCORES](https://www.gcores.com/articles/181912)). That matters doubly for a ragdoll whose head ends up at extreme angles. Guilty Gear Xrd deliberately avoided "strict mathematical accuracy" to get consistent cel shading ([GDC Vault](https://gdcvault.com/play/1022031/GuiltyGearXrd-s-Art-Style-The)). The three.js r186 examples already include toon, matcap and halftone shaders and outline passes ([examples index](https://github.com/mrdoob/three.js/blob/dev/examples/files.json)). Post-process outlines cost a lot on mobile GPUs, which "commonly have much lower fill-rate throughput" ([Tom Looman](https://www.tomlooman.com/ue4-local-outlines)).

The resulting choices are inferred, with cost tiers reasoned rather than measured:

- **Emonad.** A two- to three-band toon ramp with a hot-pink rim light.
- **Outline.** An inverted-hull outline drawn on Emonad only.
- **Shadows.** A halftone dot pattern only in the shadow band, computed inside the material.
- **Avoid.** Full-screen outline passes, ambient-occlusion passes (SSAO/GTAO), screen-space reflections and soft shadows.

Emonad's current materials use clearcoat, specular, sheen and anisotropy ([asset README](../number-go-down/assets/README.md)), the most expensive per-pixel combination three.js offers, on a character who often fills the screen. Keep them for a "High" quality tier and fake the hair highlight with a stripe texture everywhere else.

Post-processing should be one merged pass. pmndrs's `EffectPass` merges any set of effects to avoid the cost of chaining passes, and its 8-bit buffers "can band in dark scenes" ([pmndrs](https://github.com/pmndrs/postprocessing)), a real risk in a red and purple hell gradient. So add dither. The always-on stack:

- tone mapping
- a per-zone colour-grade lookup table (LUT), crossfaded at zone boundaries
- vignette
- dither

Effects driven by speed or by moments:

- **Bloom.** Only on emissive objects, at half resolution with 4–5 blur levels rather than pmndrs's default 8 ([BloomEffect.js](https://github.com/pmndrs/postprocessing/blob/main/src/effects/BloomEffect.js)).
- **Speed.** Radial blur and speed lines driven by fall speed, plus a field-of-view kick on boosts. Burnout 3's camera widened when boosting ([PlayStation Blog](https://blog.playstation.com/archive/2017/08/31/classic-levels-deconstructed-burnout-3-takedowns-blistering-alpine-track/)).
- **Slow-mo only.** Depth of field and a comic-panel halftone grade appear only during slow-mo, when the frame budget is easier because the simulation is slowed.

For anti-aliasing, use 4x MSAA where affordable, otherwise FXAA. Avoid temporal AA, which smears at high speed.

The X-ray is the signature shot and should be cartoon, not anatomy:

- **Skeleton.** Chunky "dog-bone" skeleton meshes attached to the ragdoll bones, drawn on top with depth testing off. Skate 3's X-ray used 19 named bone meshes ([HOM-FINDINGS](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md)).
- **Body.** A translucent, rim-lit body shader.
- **Bone colour.** Skate's progression: white while bruised, orange as damage builds, red-orange at a break.
- **Grade.** Skate's grade: saturation 0.5, a cool blue push and a red flash.
- **The break itself.** A zigzag crack line, a two-piece snap and "CRACK!" lettering.

Sniper Elite's skin, then muscle, then organ layering is cut to skin then bones only, with no blood. Stylised bones, stars and X-eyes keep the tone slapstick. That matters because an emo mascot taking violent damage carries self-harm-adjacent optics. Copy and captions should never use self-harm language.

The environment is a vertical shaft built from a few recycled segments per zone. Active Theory's homepage was "an endless journey through 5 repeating alley geometries" ([Awwwards](https://awwwards.com/active-theory-v4-wins-january-2018-site-of-the-month.html)). The construction rules, all inferred:

- Instance every prop type and give each zone one palette-texture material, so a zone renders in a few draw calls.
- Re-centre the world periodically to avoid floating-point jitter at large depths.
- Use a gradient backdrop rather than a skybox cubemap.

Speed reads best from close-passing repeated geometry, such as chart grid lines, shaft ribs and rings, where the passing frequency equals speed. The theme inverts as Emonad falls: a mint-and-gold "Bull Market Heaven" holds the emo slingshot, then the red-candle Dip, then Whale Waters with whale silhouettes crossing behind, then the fire-curtain Liquidation Inferno, then the black-purple Emo Abyss above the Rock Bottom crater.

For effects, three.quarks is MIT-licensed, batches all particle systems sharing a pipeline into one draw call and has a visual editor ([three.quarks](https://github.com/Alchemist0823/three.quarks)). Ambient embers should wrap around the camera so their cost stays constant during an endless fall.

The HUD should use chunky outlined comic numerals in the DOM, animating only transform and opacity. The Game UI Database's "Comic/Graphic" filter is the reference library ([GameFromScratch](https://gamefromscratch.com/the-game-ui-database/)).

Two licensing traps apply to assets:

- Only Up! was delisted over a single Sketchfab model licensed for non-commercial use ([Kotaku](https://kotaku.com/only-up-twitch-steam-delisted-pulled-copyright-dispute-1850597603)).
- Hunyuan3D's licence excludes the EU, the UK and South Korea, which makes it unusable for a global web game ([LICENSE](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE)).

Keep a licence ledger for every asset from the first commit.

## One fling, one nudge, one guaranteed crater

The strongest references each wrap everything around one verb. Downwell's design talk is literally about "Designing Downwell Around One Key Mechanic" ([GDC Vault](https://gdcvault.com/play/1023533/Polishing-the-Boots-Designing-Downwell)). Peggle's co-creator said "the main issue was finding the right balance of luck versus skill" ([PC Gamer](https://www.pcgamer.com/the-making-of-peggle/2/)), and pinball's Magna-Save, a magnet that rescues the ball from the drain, shows chaos with a safety net ([Wikipedia](https://en.wikipedia.org/wiki/Black_Knight_(pinball))). Number Go Down's verb is "fling, then nudge the wreck." Chaos stays fair under four rules, all inferred:

1. The player owns the cause, through the launch and visible nudges.
2. Lucky outcomes pay out loudly; bad luck stays quiet.
3. Every decisive moment gets a spotlight.
4. All randomness comes from the seeded course, never from dice rolled at collision time.

**The launch** keeps Angry Birds' mental model: pull back away from where you want him to go, and release to fire. It is adapted for a portrait phone, where the slingshot sits at the top but the thumb rests at the bottom:

- **Gesture.** Pull up to fling down, using a relative drag that starts anywhere. A modeless drag-back with a minimum launch strength is a documented web pattern ([SAFEtrace PR #4](https://github.com/scottyfncodes/SAFEtrace/pull/4)).
- **Cancel.** Releasing within about 40 px of the touch-down point cancels the shot, as Angry Birds 2 allows cancelling a pulled bird ([Angry Birds wiki](https://angrybirds.fandom.com/wiki/Slingshot)). A pinch must never fire.
- **Power.** An ease-out curve, so the first 30% of the drag gives 50% of the power. Full power is reachable at 35–40% of screen height.
- **Preview.** A dotted arc covers only the first 0.4–0.6 s of flight, the way Angry Birds Space shows just the "initial trajectory" ([Computerwoche](https://computerwoche.de/a/angry-birds-space-review-an-amazingly-fun-innovative-take-on-the-familiar-game,2511007)), plus ghost dots tracing the previous launch.

Rovio sold the full forward preview as a paid consumable, the Sling Scope ([Angry Birds wiki](https://angrybirds.fandom.com/wiki/Sling_Scope)). Number Go Down should offer it only as a daily-challenge modifier, never for sale.

The launch should decide the entry lane and starting speed and account for roughly 15–25% of the score variance. The fall should carry most of the skill.

**The sway** is a relative horizontal drag from wherever the finger lands. It applies a capped sideways force spread over the whole body in proportion to mass, which acts at the centre of mass, and never touches the limbs. Burnout's Aftertouch "nudges the wrecked car's path" ([Worthplaying](https://worthplaying.com/article/2004/9/22/reviews/19370-xbox-review-burnout-3-takedown/)), and Skate 2 made mid-bail body control its headline addition ([Stars and Stripes](https://www.stripes.com/living/games-skate-on-a-roll-1.88929)). Two York University studies inform the input mapping:

- Touch gave better results than tilt, but tilt was better received ([Medryk & MacKenzie](https://www.yorku.ca/mack/mhci2013h.html)). So tilt should be an opt-in setting.
- 83.3% of players preferred velocity control to position control, even though they performed better with position control ([York University](https://www.yorku.ca/mack/ieeegem2014a.html)). So map the drag offset to a target sideways velocity.

Bennett Foddy's principle settles the feel: at the micro level, "the character is doing exactly what you're asking him to do at all times" ([Jesper Juul interview](https://jesperjuul.net/handmadepixels/interviews/foddy.html)). The input is exact, and the chaos belongs to the physics.

The notes disagreed on strength. The ragdoll researcher proposed a force cap of 0.5–1.5 g × body mass; the level researcher proposed a sideways acceleration of 0.25–0.4 g. This report starts at **0.35 g**, tested across 0.25–0.6 g. Above that, he is flown rather than flung. The full sway model, all inferred values:

- **Target speed.** ±4 m/s sideways.
- **Response.** About 0.2 s, with the finger input smoothed over about 100 ms.
- **After impacts.** Steering drops to 30% strength for 0.25 s after a T2 or bigger impact.
- **During slow-mo.** Steering doubles in strength.
- **Cost.** Full sway adds up to 15% extra air drag, so steering costs impact speed and therefore damage. This is FlatOut's rule.
- **Reward.** Hitting a whale while swaying refunds the cost, as an Aftertouch takedown refunded boost.

Steering never adds vertical energy, and any aim assist toward gates is switched off on ranked boards.

**Camera and readability** follow from the portrait screen. Hoober observed that 49% of 1,333 people hold the phone one-handed ([Monterail summary](https://www.monterail.com/blog/thumb-friendly-navigation-word-oriented-design)), so no buttons appear during the fall. The camera and colour rules, all inferred:

- **Framing.** Emonad sits about 30% from the top, leaving two-thirds of the screen as look-ahead.
- **Lead time.** The view widens with speed so the player always gets at least 0.8–1.0 s of warning before reaching an obstacle.
- **Off-screen warnings.** Moving hazards and forks get an edge marker 1–1.5 s before they appear.
- **Slow-mo framing.** During slow-mo the camera must frame the next one or two obstacles. The one recurring Aftertouch complaint was that "it is usually extremely hard to see the oncoming cars" ([GameSpot](https://gamespot.com/reviews/burnout-3-takedown-review/1900-6106835/)).
- **Colour grammar.** Red means good for score, because red candles are damage-givers. The "Heartbreaker" trap is a green candle: number going up is bad.

| Beat | Time | Content | Purpose |
|---|---|---|---|
| Launch | 0–3 s | Pull, release, 0.2 s lift-off slow-mo | The player owns the run |
| Zone 1, The Dip | 3–12 s | Red-candle bumpers, wide lanes, first leverage gate, one chart bar to smash through | Teach sway by rewarding it |
| Rest beat | ~1–2 s | Clear shaft, boost rings, zone banner, first look at the next zone | Breathe without losing the combo, like Downwell's side rooms |
| Zone 2, Whale Waters | 12–25 s | Falling chart bars, the first whale, the first safe-or-risky fork | Escalate and offer the first real choice |
| Set piece | ~25 s | A handcrafted "junction" cluster | A Burnout-style chain reaction |
| Zone 3, Liquidation Inferno | 25–40 s | Grinders, ban hammers, FUD fans, the biggest multipliers | Peak intensity |
| Rock Bottom | Final 3–6 s | Camera pull-out, slow-mo, crater wells marked −50% / −90% / −99% / REKT | A guaranteed payoff every run |

All timings in the run skeleton are inferences for playtesting. Run length falls out of course depth ÷ average speed, so boost rings trade a shorter run for harder hits.

| Interactable | Theme skin | What it does | Score and comedy role |
|---|---|---|---|
| Pop bumper | Red candle with its wick | Strong outward kick, small damage | Steady damage and combo ticks; limbs whip |
| Breakable floor | Falling chart bar, exchange "floor" glass | Breaks above a speed threshold, otherwise bounces him | Smash bonus that chains, Helix-style |
| Whale | Swallows Emonad and spits him out | Long hold, then a strong ejection | +1x run multiplier, the only permanent source, like Paradise's buses; the clip moment |
| Leverage gate | "x2" / "x5 leverage" | Multiplies damage for about 4 s | Placed off the safe line as risk and reward |
| Boost ring | Downward-pointing "to the moon" arrow | Adds downward speed | Bigger later hits, shorter run |
| Grinder | "Liquidation engine" | Holds and chews him briefly | High continuous damage, X-ray flashes, costs time |
| Ban hammer | Swinging "SEC gavel" | Big hit on a timed swing | Very high single-hit damage; a comic home run |
| FUD fan | Exhaust vent | Pushes him sideways or upward | Sets up forks; floaty flailing |
| Green candle | "Heartbreaker" / bull trap | Heals him and halves the multiplier | Burnout's poisoned pickup; a groan sting |
| Bag-holder bucket | Moving bag | Catching him gives a bonus or a second launch | Peggle's free-ball generosity |
| HODL hand | One-shot grab | Rescues a stuck run once | Pinball's Magna-Save |
| Rug Pull | Tap to detonate after 5 breaks | Area blast plus a kick that restarts a dying run | Burnout's Crashbreaker, without the button mashing |
| Crater wells | −50% / −90% / −99% / REKT | Final steer into a bin | Final multiplier; Peggle's Fever finale |

Courses should be procedurally assembled from handcrafted chunks: random order per run, fixed themes per zone, which is how players describe Downwell ([Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=1613957513)). A daily seed then gives everyone the same course. Spelunky locked its gambling wheel in daily mode so chance could not swing results ([Spelunky wiki](https://spelunky.fandom.com/wiki/Daily_Challenge_Mode_(HD))), so in daily mode every random choice must come from the seeded generator, never `Math.random()`.

Onboarding should take under five seconds with no text:

1. A looping ghost hand demonstrates pull-and-release.
2. The first launch is nearly impossible to fail.
3. The first time a bumper sits slightly off-centre, time slows to half speed and a ghost hand shows the sway, until the player moves a finger.
4. The course teaches everything else, in the order things first appear.

## Scores must be comparable before they can be competitive

Scoring combines three proven layers, all with inferred values:

1. **Per-part damage.** Following Skate 3, use 17 cartoon X-ray bones (skull, neck, ribcage, spine, pelvis, and left and right upper arm, forearm, hand, thigh, shin and foot) plus a groin zone. Each has tiers named bruise, sprain, crack and BREAK, after the injury strings Skate's executable contains ([HOM-FINDINGS](https://github.com/layton-brewer/Hall-Of-Meat-for-Skate-4/blob/main/docs/HOM-FINDINGS.md)), and passes one step of damage to linked parts. Hands and feet are the far quarter of the forearm and shin bodies, and the groin is the front-low face of the pelvis body. Weight for comedy, as Skate did: skull and groin about 5x a limb, spine and pelvis about 2x.
2. **Whole-run curves.** Skate-style curves for freefall time between contacts, top speed, total rotation and depth. Each has a dead zone, a steep ramp and a cap, and the next threshold is shown live ("+1.2 s to the next tier").
3. **Multipliers.** Whales add +1x permanently, leverage gates multiply temporarily, the chain bonus adds +0.1x for each new bone broken within 1.0 s of the last hit, the green candle halves the multiplier and the crater well applies at the end.

Named bonuses double as clip captions:

- "Sandbag" for 15 breaks in one fall, which was Skate 2's achievement threshold ([GameRevolution](https://www.gamerevolution.com/?p=42723))
- "Full Skeleton"
- "Headfirst"
- "Whale Rider"

The HUD shows a red ticker that falls below zero as damage piles up. The number going down is winning, which is the brand joke.

Retention comes from a shared daily object plus a personal record:

- **Daily scarcity.** Wordle's creator credits its one-puzzle-a-day cap ([WION](https://www.wionews.com/technology/he-made-wordle-for-his-partner-now-its-an-online-hit-442289)).
- **Daily track.** Trackmania runs a Track of the Day with unlimited attempts over 24 hours ([Trackmania docs](https://doc.trackmania.com/play/what-is-totd/)).
- **Streaks.** When Wordle's move to the New York Times reset some players' streaks, it made the news ([Tom's Guide](https://www.tomsguide.com/uk/news/wordle-disaster-some-players-lose-their-streaks-in-transfer-to-nyt)).
- **Single attempts are a trap.** A critic argued Spelunky's single daily attempt pushes players into overly cautious or reckless play ([The Ludite](https://theludite.com/2014/06/23/spelunky-when-scoring-goes-bad/)), and physics chaos makes one attempt measure luck even more.

The recommendation is a numbered "Descent #N" each day, resetting at 00:00 UTC. It gives three ranked attempts with the best one counting, unlimited practice, and a "first try" badge on the share card. Alongside it run a Weekly Hell and a three-month season.

Progression on any ranked board must be cosmetic only. Launch-and-upgrade power would make daily seeds and ghosts incomparable, and Kick the Buddy shows players resent paywalled destruction. If casual players want power upgrades, give them a separate unranked Career board.

Progression and benchmarks, all inferred unless cited:

- **Challenge list.** 30–60 permanent Hall-of-Meat-style challenges plus three rotating daily ones, all unlocking cosmetics.
- **Collection log.** A skeleton map that fills in across runs.
- **Streaks.** Streak-freezes are earned through play, never bought.
- **Retention benchmark.** Casual publishers reportedly want day-1 retention of at least 35% ([PocketGamer.biz](https://www.pocketgamer.biz/five-key-takeaways-gameanalytics-h1-2019-mobile-benchmark-report/)). Hypercasual medians in late 2022 were 23–24% on day 1 and 4–7% on day 7 ([GameDev Reports](https://gamedevreports.substack.com/p/tenjin-and-gameanalytics-hypercasual-6e4)).
- **Targets.** Day-1 retention of 35% or more and day-7 of 10% or more mark a hit.

Leaderboards motivate more than the top few only when they show where you stand. A plain ranked list energises only the top 5–10% of players ([Yu-kai Chou](https://yukaichou.com/?p=18869)). Chou recommends showing percentile, small scoped boards and movement, because "movement motivates everyone while status motivates only leaders" ([Yu-kai Chou 2026](https://yukaichou.com/advanced-gamification/how-to-design-effective-leaderboards-boosting-motivation-and-engagement/)). Telegram's own game-score API already returns the player, two neighbours on each side and the top three ([aiogram docs](https://docs.aiogram.dev/en/latest/_modules/aiogram/methods/get_game_high_scores.html)). The default view should therefore lead with "You beat 87% of today's players", then the near-me window, then the rank change since the last run.

Identity should climb a ladder from lowest friction:

1. **Anonymous device ID.** Zero friction, with an auto-generated emo handle.
2. **Telegram Mini App identity.** Validated on the server with HMAC-SHA256 over the `initData` string ([telegram-mini-apps docs](https://docs.telegram-mini-apps.com/platform/init-data)), which also gives group boards for free.
3. **X login.** For bragging rights on crypto Twitter.
4. **Wallet.** Optional and cosmetic only. Telegram requires crypto features in Mini Apps to use TON exclusively ([Decrypt](https://decrypt.co/302023/telegram-exclusive-ton-barring-other-networks)).

Anti-cheat should replay inputs on the server, in tiers, and assume tool-assisted play. Re-simulation fits Cloudflare: Workers Paid and Durable Objects default to 30 s of CPU per invocation, configurable up to 5 minutes, with 128 MB per isolate. The free plan's 10 ms per request is far too little ([Workers limits](https://developers.cloudflare.com/workers/platform/limits); [Durable Objects limits](https://developers.cloudflare.com/durable-objects/platform/limits)). The physics researcher estimated 0.4–1 s of CPU for a 60 s run at 60 Hz, roughly double at 120 Hz. This is unmeasured. Determinism is where the notes conflicted:

- The meta researcher read Rapier's JavaScript guide as saying the standard WASM build is cross-platform deterministic ([Rapier docs](https://rapier.rs/docs/user_guides/javascript/determinism)).
- The physics researcher read the README shipped in the 0.21.0 package, which says the main build is "locally deterministic, on the same machine" and that only `-deterministic` guarantees identical results across platforms ([tarball](https://registry.npmjs.org/@dimforge/rapier3d-simd/-/rapier3d-simd-0.21.0.tgz)).

Trust the shipped README. Anything ranked, ghosted or replayed across devices must run `@dimforge/rapier3d-deterministic` on both client and server, checked with periodic state hashes. The phase 0 benchmark must therefore measure the deterministic build, not just the SIMD one.

The pipeline:

1. **Start.** The server issues the seed and a signed run ID, gated by an invisible Turnstile check ([Forminit](https://forminit.com/docs/cloudflare-turnstile/)).
2. **Ingest checks.** Every submission gets cheap checks: the signature, wall-clock time, a plausibility ceiling and the attempt cap.
3. **Re-simulation.** Only runs that would enter the top 1%, a friend group's top 3 or beat a personal best by a lot get re-simulated. They show as "Verifying…" until confirmed.
4. **Human review.** The all-time top 100 get human review with an appeal path.

The threat that survives re-simulation is tool-assisted play. Trackmania's 2021 scandal turned on runs made by slowing the game to 40–80% speed ([PC Gamer](https://www.pcgamer.com/au/cheating-allegations-catch-up-with-some-of-trackmanias-fastest-drivers)). Nadeo's later anti-cheat sweep also wiped valid runs ([devtrackers](https://devtrackers.gg/trackmania/p/b1c5ba74-false-positive-runs-wiped-out)). Number Go Down has a natural defence: continuous sway makes the input space far larger than a single launch vector, so offline brute-force is harder. Two further layers help:

- a tiny server-chosen wind or spawn jitter per run, revealed only at run start
- statistical flags on input timing that looks inhumanly precise

Legal and brand safety point the same way: free play, cosmetic rewards and no tokens. A US illegal lottery is prize plus chance plus consideration ([Morgan Lewis](https://www.morganlewis.com/-/media/files/publication/presentation/speech/ppt-best-practices-sweepstakes-prizes-awards.pdf)), and a Coinbase sweepstakes was litigated because its free entry route was "not well-publicized" ([Olshan](https://www.olshanlaw.com/Advertising-Law-Blog/2022/09)). Hamster Kombat's airdrop shows what token rewards attract: it banned about 2.3 million accounts for bots or multi-accounting ([CryptoPotato](https://cryptopotato.com/hamster-kombat-announces-details-of-airdrop-2-3m-accounts-banned-for-cheating/)) and drew backlash for excluding 57% of users under opaque criteria ([The Defiant](https://thedefiant.io/news/tokens/hamster-kombat-faces-backlash-for-excluding-57-of-users-from-airdrop)). Rewards should be cosmetic and non-transferable. Any prize event needs counsel first. The crypto theme is for jokes, not for the economy.

## Every run should end with its clip already rendered

The genre's history argues for client-side clips. In-game clip sites died with their servers, YouTube carried the games for years, and Turbo Dismount's replays make players wait. A browser can do what consoles couldn't: hand over a finished vertical video at the moment of peak emotion.

Two data paths keep it reliable, both inferred:

- **Input log.** Seed + inputs + physics version is the canonical replay for ghosts, challenge links and verification. With 120 sway samples per second, delta-encoded and quantised, it should stay a few kilobytes.
- **Transform ring buffer.** A separate buffer stores each body's position and rotation at 60 Hz, about 1.3 MB per minute for 13 bodies. A highlight can then be re-rendered offline at a fixed frame rate without re-simulating, so clip export never depends on determinism.

The highlight picker scans the event log:

1. Find the 6–8 s window with the most damage, weighting new bones, combo peaks and the single biggest impulse.
2. Add a 1 s lead-in and a 1 s limp tail, often the funniest beat.
3. Drop to 0.3x around the biggest hit.
4. Burn in the score, the bonus captions, a watermark and the challenge URL. TikTok and Instagram strip links, so the URL has to be in the video itself.

Encoding has a good path and a fallback:

- **Good path.** Since Safari 26, WebCodecs is fully supported on iOS ([caniuse](https://caniuse.com/webcodecs)). The highlight can be rendered offline to 720 × 1280 frames, encoded as H.264 and muxed to MP4 with Mediabunny. Mediabunny replaces the deprecated mp4-muxer ([mp4-muxer migration guide](https://raw.githubusercontent.com/Vanilagy/mp4-muxer/HEAD/MIGRATION-GUIDE.md); [Mediabunny](https://mediabunny.dev/guide/introduction)). This runs faster than real time with no dropped frames.
- **Fallback.** Older iOS (14.3+) can record a canvas with MediaRecorder, which outputs MP4 with H.264 and AAC ([WebKit blog](https://webkit.org/blog/11353/mediarecorder-api/)). A 10 s clip takes 10 s to record, so it needs a progress bar.

Sharing has its own traps:

- **Files.** The Web Share API can share video files from iOS 15 ([Apple Developer Forums](https://developer.apple.com/forums/thread/133310)). But `share()` requires a fresh user gesture ([W3C](https://www.w3.org/TR/2023/REC-web-share-20230530/)), and Safari rejects the first attempt if anything asynchronous runs before it ([WebKit bug 197779](https://bugs.webkit.org/show_bug.cgi?id=197779)). Encode first, then show a "Share" button whose handler calls `navigator.share` immediately.
- **TikTok and Instagram.** They have no web share API, only native SDKs ([TikTok Share Kit](https://developers.tiktok.com/doc/share-kit-android-quickstart-v2); [Meta](https://developers.facebook.com/docs/ios/sharing-to-reels-instagram/)). So "Save video, then post" is the primary instruction, not an error state.
- **Telegram.** `shareToStory` (Bot API 7.8) and prepared inline messages opened with `shareMessage` (Bot API 8.0) give native paths ([Telegram Mini Apps](https://core.telegram.org/bots/webapps); [savePreparedInlineMessage](https://core.telegram.org/method/messages.savePreparedInlineMessage)). A `startapp` parameter carries the challenge ID; community docs limit it to 64 characters of `[A-Za-z0-9_]` ([telegram-mini-apps](https://docs.telegram-mini-apps.com/platform/start-parameter)).
- **Link previews.** Challenge links should unfurl into a score card generated at the edge with satori and resvg. Workers block dynamic WASM compilation, so resvg has to be imported precompiled ([workers-og](https://cdn.jsdelivr.net/npm/workers-og@0.0.27/README.md); [Cloudflare tutorial](https://developers.cloudflare.com/workers/tutorials/generate-dynamic-og-images-using-workers)). Cards are 1200 × 675 and cached in R2.
- **Text share.** A Wordle-style emoji share ("Number Go Down #142 💀 4,206,900 · 🦴×17/18 · top 3%") works in any chat. Wordle's grid spread because it was spoiler-free and made outsiders curious ([Newstalk ZB](https://newstalkzb.co.nz/on-air/heather-du-plessis-allan-drive/audio/andrew-chen-the-wordle-emoji-grid-was-created-by-a-kiwi)).

## Where the research disagreed, and the calls this report makes

| Topic | One note says | Another says | This report's call |
|---|---|---|---|
| Rapier ball-joint limits in JS | Physics: the TypeScript wrapper lacks them, but a raw WASM export takes an axis; use a generic joint with raw per-axis limits, or multibody joints | Gap fill: only motors exist; approximate limits with soft-spring motors or use generic or revolute joints | Agreed fact: no spherical limits in 0.21.0's TypeScript API. Revolute joints with real limits for knees and elbows; motor soft limits plus a JS cone clamp elsewhere; test raw limits on day 1; custom Jolt build as plan B |
| Which Rapier version to trust | Physics: 0.21.0 / Rust 0.36; impulses rescaled in 0.35.2; snapshot break in 0.36 | Community demo on compat ^0.19.3; three.js add-on pins 0.17.3 | Pin 0.21.0; retune any pre-August-2026 threshold; don't use the three.js add-on |
| Determinism of standard Rapier WASM | Meta: the JS guide says the WASM build is cross-platform deterministic | Physics: the shipped README says only same-machine; `-deterministic` guarantees it | Use `-deterministic` on client and server for anything ranked or replayed; verify with state hashes |
| Bone-break freeze | Audio and art: 50–100 ms | Game feel: 150–250 ms, then slow-mo | 60–140 ms scaled by bone size; slow-mo only in rationed T4 cinematics |
| Slow-mo factor | Physics: 0.1–0.25; ragdoll and feel: 0.15–0.25 | Skate footage: 0.3; clips: 0.25–0.35 | 0.25 in play, 0.3 in clips; tune within 0.15–0.3 |
| Steering strength | Ragdoll: force cap 0.5–1.5 g × body mass | Levels: sideways acceleration 0.25–0.4 g | Start at 0.35 g; test 0.25–0.6 g |
| Daily attempts | Levels: unlimited, best counts, "first try" badge | Meta: 3 ranked attempts plus practice | 3 ranked attempts, best counts, unlimited practice, "first try" badge |
| First-load size | Physics: ≤ 2.5–3 MB before first play | Art: 5–10 MB first load | ≤ 3 MB to first fling; ≤ 10 MB total, streamed |
| Renderer | Physics: start on WebGLRenderer | Art: WebGL2 baseline but write shaders in TSL | WebGLRenderer + pmndrs for v1; TSL only after an on-device test |
| Facial expressions | Art: texture swaps instead of blendshapes | Ragdoll + asset: the GLB already has 32 morphs | Use the existing morphs; add a few texture decals (X-eyes, swirl) |
| iOS haptic on launch | Audio: a switch overlay on release fires one tick | This report: a drag-release likely fires no click | Unproven; device-test it; audio and visuals carry iOS |

## The opinionated spec

Number Go Down's pillars are four:

- **Every break is an event.**
- **The player aims the chaos.**
- **The phone never stutters.**
- **Every run leaves a clip.**

The spec below is what this report would build. Its numbers are starting points for playtesting unless the Basis column cites a source.

| System | Spec | Basis |
|---|---|---|
| Run | 25–45 s with a median around 35 s; depth fixed per course; 3 zones plus Rock Bottom; a rest beat every 8–12 s; always ends in the crater | Inference; Peggle and Tiny Wings patterns |
| Launch | Relative pull-up-to-fling-down drag; 40 px cancel zone; ease-out power with a floor; 0.4–0.6 s preview arc and ghost dots; optional "PERFECT" band worth +10% speed | Angry Birds, Rovio fixes, SAFEtrace; values inferred |
| Sway | Relative horizontal drag → target sideways velocity ±4 m/s; acceleration cap 0.35 g at the centre of mass; up to 15% extra drag; 30% strength for 0.25 s after big hits; 2x during slow-mo; tilt as an option | Burnout, FlatOut, York studies; values inferred |
| Taps | Skip a cinematic; hold to slow it further; detonate the Rug Pull once 5 breaks have charged it | Sniper Elite 5, Max Payne 3, Burnout |
| Camera | Emonad about 30% from the top; vertical field of view about 70° widening 10–15° with speed; ≥ 0.8 s of look-ahead; no roll in normal play | Burnout widening; values inferred |
| Ragdoll | 13 bodies; capsules plus a head sphere; PlayCanvas limits with 30–60° held in reserve; 120 Hz fixed step; CCD on limbs; +2–4 solver iterations on ragdoll bodies; angular speed capped at 20–40 rad/s; restitution ≤ 0.1 | PlayCanvas, Unity, Jolt, Bullet |
| Muscles | Freefall strength 10–25%; instant loss on contact, about 0.3 s to recover; flail, brace, curl, head-look and writhe behaviours; cheat torques on big hits | Euphoria vocabulary, EggyStudio; values inferred |
| Face and hair | Existing VRM morphs: Surprise before impact, squeeze-blink on contact, Sorrow after; hair spring at 3–5 Hz driving the 4 sway morphs; X-eye and swirl texture decals | Asset README; inference |
| Breaks | 17 bones + groin zone; bruise from 7 m/s and break from 12 m/s, scaled per bone; 0.5 s cooldown; broken joint gets +40–90° of limit, no muscle and a cast | ReSkate thresholds, Toribash, Euphoria |
| Presentation | Tiers T0–T4 from the earlier table; T4 budget max(2, run ÷ 12 s) with a 6–8 s cooldown, novelty gate and guaranteed finale; settings for shake, flash, cinematics and motion | Skate 3, Hollow Knight, Celeste, Sniper Elite 5, WCAG |
| Score | Part tiers with comedy weighting and one-step spread to linked parts; Skate-style capped curves with the next threshold shown; whales +1x permanent; gates ×2/×5 for 4 s; +0.1x per new bone in a 1.0 s chain; green candle halves; crater wells | Skate 3, Burnout Paradise; values inferred |
| Audio | 4 hit tiers × 3 velocity layers × round-robin variants; signature BREAK sound; slow-mo low-pass and dedicated slow assets; voice tiers driven by the same emotion state as the face; 4 commissioned emo/pop-punk stems | Skate 3, CRI, Overwatch; inference |
| Haptics | Android: 12 ms on release, 15–40 ms by tier, `[35, 40, 15]` on BREAK, budget ≤ 3 per second; iOS: none in-game | Android guidance; iOS 26.5 patch |
| Content at launch | 3 hells (the Bear Market descent plus two variants), about 15 handcrafted chunks per zone, 20 handcrafted challenge drops with star targets; one new hell per season | Inference; Danger Zone's 20 levels judged too thin |
| Meta | Descent #N daily seed (3 ranked attempts, best counts) plus Weekly Hell plus a season; 30–60 cosmetic challenges; skeleton collection log; earned streak-freezes; ghosts of your best, the player just above you and the day's #1; cross-promotion with Number Go Up (a bull skin) | Wordle, Trackmania, Geometry Dash |
| Social | Auto-clip on the results screen; challenge links with edge-generated cards; emoji text share; Telegram story and inline paths; percentile and near-me boards | Section on clips |
| Integrity | Server-issued seeds; Turnstile; ingest checks; tiered `-deterministic` re-simulation in Durable Objects; human review of the top 100 | Cloudflare limits, Trackmania lessons |
| Stack | three r186 WebGLRenderer + pmndrs; Rapier 0.21 (`-deterministic` everywhere if verification ships, otherwise `-simd`); Vite 8; Cloudflare Workers + Durable Objects + D1 + R2; raw Web Audio; Mediabunny | Physics notes |
| Monetisation | None at launch. Later, cosmetics only: no ads during runs, no paywalled damage tools, no tokens | Kick the Buddy, Hamster Kombat lessons |

## Build one perfect fall first, then widen

The phases below are indicative for a team of three or four: one or two engineers, an artist and part-time audio. The durations are estimates, not findings.

| Phase | Length | What gets built | Exit test |
|---|---|---|---|
| 0. Spikes | 2 weeks | Rapier joint options (revolute + soft-limit cone clamp; raw generic limits; Jolt custom build); 13-body Emonad from the GLB with bone sync; `-simd` vs `-deterministic` step timing; 60 vs 120 Hz; GLB pipeline to under 1 MB; the same input log hashed on iOS, Android, desktop and Cloudflare's runtime | No stretching or NaN across 200 scripted impacts at 40 m/s; physics ≤ 2 ms per frame on an iPhone 13/14-class phone and a Snapdragon 7-series Android; hashes match, or a determinism fallback is chosen |
| 1. One perfect fall | 4 weeks | Slingshot; one zone (The Dip); sway; break detector; T1–T4 presentation including X-ray; crunch audio stack; faces and hair; plain results card | 10–20 cold playtesters re-fling without prompting; breaks rated funny rather than grim; 60 fps held for 10 minutes on both phones |
| 2. The descent | 5 weeks | Chunk generator; 3 zones + Rock Bottom; full obstacle set; scoring tables; combos and multipliers; camera rules; wordless onboarding; quality governor; comfort settings | Median run 25–45 s; same-player score spread clearly narrower than between-player spread on a fixed seed |
| 3. The loop | 4 weeks | Daily seed; boards in Durable Objects and D1; identity ladder; ghosts; clip export; edge cards; challenge links; Telegram wrapper | Clip export works across the device matrix; from a shared link to playing in under 10 s |
| 4. Proof and polish | 4–5 weeks | Server re-simulation and ingest checks; music stems and voice; art pass on every zone; cosmetics and challenges; soft launch | Day-1 retention ≥ 35%, day-7 ≥ 10%; the verified top 100 holds up |
| 5. Live | Ongoing | Weekly hells, seasons, new hells, a "Meat of the Week" clip showcase | — |

| Rank | Unknown | Why it could sink the game | How to settle it first | Fallback |
|---|---|---|---|---|
| 1 | Ragdoll feel under Rapier's JS joint API | Jittery shoulders or noodle limbs kill the comedy and the AAA claim | Phase 0 three-way joint test on real phones | Custom Jolt build with swing-twist joints and `Stabilize` |
| 2 | Holding frame rate on a phone through a whole run | Toon shading + post + skinned morph mesh + physics, with iOS capped at 60 and halved in Low Power Mode, and no published benchmarks | 10-minute soak tests with the quality governor on both reference phones | Drop to Low tier materials, post at half resolution, lower DPR |
| 3 | Tone | A violently broken emo kid can read as grim or self-harm-adjacent | Cold playtests in phase 1; strict copy rules | Push further into cartoon: stars, casts, boings |
| 4 | Skill versus luck | Turbo Dismount's "lucky run" problem would gut the leaderboards | Measure same-player vs between-player score spread on fixed seeds | Raise sway strength or add multiplier targets |
| 5 | Identical results across devices | Ghosts, challenge replays and verification depend on it | Phase 0 hash test, including Cloudflare's runtime | Verify only on the server; ship clips from the ring buffer |
| 6 | Clip export on iOS and in in-app browsers | The growth loop depends on it | Device and webview test matrix in phase 3 | Still score cards plus an "open in Safari" prompt |
| 7 | Cinematic fatigue | Repeated slow-mo turns into Paradise's crash cam | Telemetry on skip rate per cinematic | Shrink the budget; default to "Big moments only" |
| 8 | Re-simulation cost and tool-assisted runs | Unmeasured CPU time; offline search on a known seed | Benchmark in phase 0; flag statistics in phase 4 | Re-simulate only the top runs; per-run jitter |
| 9 | iOS audio (silent switch versus the player's music) and no iOS haptics | Silent or intrusive sound weakens the hits | Device testing | A "Mix with my music" toggle; sub-bass thump |
| 10 | Music licensing | Shipping blockers and brand risk | Commission stems early | Library tracks with written game clearance |

The first ten working days should produce one thing: a test scene where Emonad, loaded from the real GLB at real scale, is flung from a placeholder slingshot onto three red candles and a floor, on two physical phones. Days one to three settle the joint question. Days four and five add the break detector and the in-place X-ray blink. Days six to eight add the T4 cinematic with slow-mo audio, the crunch stack and the face reactions. Days nine and ten run a soak test on both phones and put the build in front of five people who have never seen it. Menus, meta, leaderboards and the art for zones 2 and 3 can all wait. If that single fall does not make people laugh and fling again, nothing built on top of it will.

## Conclusion

The moat is not physics. Rapier, Jolt and Havok all ship credible WASM ragdolls in 2026, and nobody has a proprietary advantage there. The moat is everything wrapped around the impact: Skate's table-and-curve scoring, Burnout's weak but well-aimed steering, Sakurai's and Hollow Knight's timing discipline, and a clip pipeline that consoles never had. The genre's own ancestors left the pieces unassembled. Skate's clip site, the Burnout series and Pain each held a part, and the 2025 Skate reboot dropped the one people loved. The crypto theme turns out to be useful as well as decorative, because each classic mechanic already has a meme-native skin: bumpers are red candles, Paradise's buses are whales, the Heartbreaker is a green candle, the Crashbreaker is a rug pull.

Two findings shift the plan from the obvious one. The first is that the hardest engineering problem is not frame rate but trust. Ghosts, challenge links and verified boards all need physics that gives identical results on every device, which means paying for Rapier's slower deterministic build on every client and confirming it with hashes before any leaderboard design is final. The second is that the hardest design problem is restraint. The research consistently says slow-mo, X-ray and shake lose value with frequency, and the strongest player complaints in this genre are about cinematics they could not skip and control that did too little or too much. So the dials worth the most playtest time are the T4 budget and the 0.35 g sway cap, not polygon counts.
