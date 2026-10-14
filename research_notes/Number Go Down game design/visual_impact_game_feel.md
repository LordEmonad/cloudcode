# Visual impact "game feel" and juice: hitstop, slow-mo, camera, x-ray, particles, score UI (for Number Go Down)

*Method note for the report writer: the shared web-search budget ran out partway through this task, and the page fetcher could not resolve most domains. Findings come from (a) search-result summaries and (b) primary source code and specs that I read in full from GitHub: Martin Jonasson's "Juice it or lose it" demo source (juicy-breakout), Bevy's Eiserloh-based screen-shake example, pmndrs/postprocessing effect sources, and the W3C WCAG and MDN source files. Numbers taken from code are exact. Claims that come only from search summaries are marked "(search summary)". All recommended starting values for Number Go Down sit under **Inferences** and are my derivations, not sourced facts.*

## Q1. What concrete values and curves do respected developers recommend for each technique?

### Takeaway
Very few developers publish exact numbers. The exceptions are Smash Bros' hitlag formulas (frames = a constant plus a damage term), the shipped source of the "Juice it or lose it" demo (freeze up to 320 ms, fading in and out over up to 160 ms each; shake as a directional damped spring; stretch clamped to 0.85-1.35; Back.easeOut pops), and the reference implementation of Eiserloh's trauma shake (trauma 0-1, shake = trauma², Perlin noise, roughly 10° roll and 20 px offset at full trauma, decay 0.5/s). Everything else (Sniper Elite, Burnout, Skate, God of War, Hollow Knight, Sakurai) gives design rules but no published timings.

### Cited Findings

#### Hitstop / hit-pause / freeze frames
- **Smash Bros hitlag formulas, in frames at 60 fps, where d = damage dealt** (search summary of SmashWiki; the multipliers' exact definitions were not retrieved):
  - Melee: ⌊⌊⌊d/3 + 3⌋ × e⌋ × c⌋
  - Brawl and Smash 4: ⌊⌊(d × 0.3846154 + 5) × h × e⌋ × c⌋
  - Ultimate: ⌊⌊⌊(d × 0.65 + 6) × h × e × s⌋ × p⌋ × c⌋, where p is a player-count factor of 1.0 with 2 players and 0.75 with 8, set from the number of players at the start of the match
  - Smash 64 used d/3 + 4 (JP) and d/3 + 5 (international)
  - "In all games, hitlag is higher the more damage a move deals." — [SmashWiki: Hitlag](https://www.ssbwiki.com/Hitlag)
- A community rule of thumb, "divide the damage by 3, add 3, round down," matches the Melee formula. — [SmashWiki: Hitlag](https://www.ssbwiki.com/Hitlag) (search summary citing a Smashboards frame-data thread)
- Sakurai (Famitsu column, translated): "Normally, only the character that takes damage vibrates, but in Smash, the attacker also vibrates slightly." The vibration is visual only. Hurtboxes stay still, because moving them "would cause attacks that should have hit to miss." — [Source Gaming translation of Sakurai's Famitsu column vol. 490](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/); [My Nintendo News](https://mynintendonews.com/2015/11/12/sakurai-talks-about-the-term-hitstop-used-in-fighting-games/)
- Hitstop stops both the user and the victim in place and makes them shake slightly. — [Dragdown wiki, SSBU hitting mechanics](https://dragdown.wiki/wiki/SSBU/System_Mechanics/Hitting_the_Opponent)
- Hitstop (also called hitlag) is a visual freeze. Hitstun is a separate concept: the period when the victim cannot act. — [Source Gaming](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/); [Infil's Fighting Game Glossary: Hitstop](https://glossary.infil.net/?t=Hitstop)
- The third video on Sakurai's YouTube channel covers hitstop. It shows the same attack with and without hitstop to demonstrate how much the small pause adds. — [Upcomer](https://upcomer.com/sakurai-starts-new-youtube-channel-sharing-game-development-secrets/) (search summary; I could not view the video itself)
- **"Juice it or lose it" demo source** (Martin Jonasson; the Breakout demo from the Jonasson & Purho talk). The freeze ("sleep") settings expose:
  - `EFFECT_FREEZE_DURATION_MS`, slider range 0-320 ms
  - `EFFECT_FREEZE_SPEED_MULTIPLIER`, range 0-1, so a "freeze" can be a partial slowdown rather than a full stop
  - `EFFECT_FREEZE_FADE_IN_MS` and `EFFECT_FREEZE_FADE_OUT_MS`, each 0-160 ms

  `Freezer.multiplier` lerps the game speed from 1 down to the multiplier over the fade-in, holds it for the duration, then lerps back to 1 over the fade-out. The result is multiplied into the global game speed and into every tween's time scale (`GTween.timeScaleAll`). — [grapefrukt/juicy-breakout Settings.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/Settings.as); [Freezer.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/Freezer.as); [Main.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/Main.as)
- **Nijman's "sleep"** (The Art of Screenshake, 2013): a brief freeze on a deadly hit, explained as giving "your brain" time "to process what is going on." The duration conflicts between write-ups: one reports about 20 ms, another about 0.2 s. — [Blue Tengu experiments](https://www.bluetengu.com/2014/12/12/art-of-screenshake-experiments/); [Victor Weidar summary](https://victorweidar.wordpress.com/2016/10/06/the-art-of-screenshake/); [Shiuneel's blog](https://ssharancom.wordpress.com/2017/06/28/the-art-of-screenshake-vlambeers-games-2/) (search summary; the summary did not say which write-up gives which number)
- **Hollow Knight:**
  - Players report that the pause or loss of control when getting hit is intentional, as is the micropause on killing blows. Some players found the kill micropause too long. — [Steam discussion 1](https://steamcommunity.com/app/367520/discussions/0/135510393196991561/); [Steam discussion 2](https://steamcommunity.com/app/367520/discussions/0/5185299686167216571/) (search summary)
  - When the player is hit, "the music cuts out and the action slows for just a second." A critic calls Hollow Knight's hit pause "egregious" and warns that hit pause lasting "longer than a few frames" makes a game "feel like it has a stutter." — [Critical Points: Hollow Knight review](https://critpoints.net/2017/06/22/hollow-knight-review/) (search summary)
  - A common implementation is to set the engine time scale to 0, then restore it after a short real-time interval. — [itch.io dev post](https://itch.io/post/13671079) (search summary)
- **Celeste:** No hitstop numbers were found. Maddy Thorson's published game-feel list covers different tricks (coyote time, jump buffering, half gravity at the jump apex, corner correction), all "centered around widening timing/positioning windows." — [Thorson thread via Thread Reader](https://threadreaderapp.com/thread/1238338574220546049.html)

#### Screen shake: the trauma model (Eiserloh, GDC 2016) and camera kick
- The talk is "Math for Game Programmers: Juicing Your Cameras With Math" by Squirrel Eiserloh (SMU Guildhall), GDC 2016, and covers screen shake and split screen. — [Game Developer: "Sprucing up cameras with math"](https://www.gamedeveloper.com/programming/video-sprucing-up-cameras-with-math); video linked from Bevy's source: [YouTube tu-Qe66AvtY](https://www.youtube.com/watch?v=tu-Qe66AvtY)
- **Bevy's official example**, which states it "follows the GDC talk" (exact constants and comments; I read the source):
  - Trauma is a value in [0, 1] that "automatically decays over time."
  - `TRAUMA_DECAY_PER_SECOND = 0.5`: full trauma reaches 0 in 2 s.
  - `TRAUMA_EXPONENT = 2.0`: "Camera shakes don't feel punchy when they go up linearly… The higher the exponent, the more abrupt is the transition between no shake and full shake."
  - `MAX_ANGLE = 10°`: "somewhat high but still reasonable… Try bigger values for something more silly and wiggly."
  - `MAX_TRANSLATION = 20 px`: "low enough… to not be distracting."
  - `NOISE_SPEED = 20`: "a fairly fast shake. Try lower values for a more dreamy effect."
  - `TRAUMA_PER_PRESS = 0.4`
  - The offset is computed per axis as `perlin(t·speed + seed) × trauma^exp × max`, using three decorrelated seeds (0, 100, 200) for roll, x and y.
  - The comment explains why: "Human senses are much more attuned to exponential changes." Noise guarantees "the shake is smooth and continuous."

  — [bevyengine/bevy examples/camera/2d_screen_shake.rs](https://github.com/bevyengine/bevy/blob/main/examples/camera/2d_screen_shake.rs)
- Other implementations of the talk: an npm package uses "Perlin noise and exponential trauma for a more satisfying shake." A Godot asset uses shake = stress². Godot's recipe uses OpenSimplex because of patent concerns around Perlin and simplex noise. — [npm screen-shake](https://www.npmjs.com/package/screen-shake); [Godot asset 2481](https://godotengine.org/asset-library/asset/edit/2481); [KidsCanCode Godot recipe](https://kidscancode.org/godot_recipes/3.x/2d/screen_shake/) (search summary)
- A three.js forum thread implements Eiserloh's camera shake in three.js ("Camera shake, or much damage such wow"). I could not read its code. — [three.js forum](https://discourse.threejs.org/t/camera-shake-or-much-damage-such-wow/8963)
- **Shake in the "Juice it or lose it" demo** is not random noise. It is a directional damped spring (`Shaker.as`):
  - Each hit adds velocity of `-ball.velocity × EFFECT_SCREEN_SHAKE_POWER`, with power defaulting to 0.5 on a 0-1 slider.
  - Each tick, `velocity -= velocity × drag(0.1) × dt`, then `velocity -= position × elasticity(0.1) × dt`, then `position += velocity × dt`.
  - A separate `shakeRandom(power)` method kicks in a random polar direction.

  — [juicy-breakout Shaker.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/Shaker.as); [Main.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/Main.as)
- Nijman's talk outline, from a fan-made timestamp list (order unverified): permanence, sleep, gun delay, gun kickback, shells, camera kick, bigger explosions, death animation. It is often described as "around 30 tricks in 25 minutes." Permanence means bodies and shells stay in the scene, and dust or smoke fades slowly after big explosions. — [Blue Tengu](https://www.bluetengu.com/2014/12/12/art-of-screenshake-experiments/); [The Engineering of Conscious Experience](https://theengineeringofconsciousexperience.com/jan-willem-nijman-vlambeer-the-art-of-screenshake/); [artificials.ch "Juice up your game"](http://artificials.ch/juice-up-your-game/) (search summary)
- The FEEL toolkit docs advise defining an intensity scale for shakes and giving each type of screenshake a meaning. — [Feel docs: screen shakes](https://feel-docs.moremountains.com/screen-shakes.html) (search summary)
- **God of War (2018):** "camera shake is also significantly reduced. While this can hurt impact perception, it greatly improves legibility of targets and aids gameplay… what is reduced by these camera choices is made up for in audio and animation." — [PlayStation Blog, 2022](https://blog.playstation.com/2022/10/04/game-developers-explain-what-makes-god-of-war-2018s-combat-tick/). The combat GDC talk (Mihir Sheth, "Evolving Combat in God of War for a New Perspective") says combat was re-imagined around the close camera. — [GDC Vault](https://www.gdcvault.com/play/1026423/Evolving-Combat-in-God-of) (search summary; the talk's hit-pause content was not retrieved)
- A devcom 2019 session titled "Creating Impact Without Shaky-Cam" exists. Its content was not retrieved. — [devcom 2019 schedule](https://app.swapcard.com/widget/event/devcom-2019-1/planning/UGxhbm5pbmdfNzMwNjk%3D)

#### Squash and stretch, pops, tweens and easing
- **Juicy Breakout ball stretch:**
  - Speed-based: `scaleX = 1 + norm(speed) × 0.3`, `scaleY = 1 − norm(speed) × 0.2`.
  - The animated variant uses `scaleX = r`, `scaleY = 1/r` (area-preserving), plus a "shakiness" wobble, clamped to [0.85, 1.35].
  - The ball rotates toward its velocity with smoothing 0.5 × dt.
  - On impact, `_ball_extra_scale += 1.5` decays by `dt × extra × 0.35` per tick, a big pop that falls off exponentially.
  - Brightness/glow tweens over 0.7 s with `Back.easeOut`.

  — [juicy-breakout Ball.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/gameobjects/Ball.as)
- **Juicy Breakout paddle stretch:** `scaleX = 1 + |Δx|/100`, `scaleY = 1.5 − scaleX × 0.5`, a volume-ish compensation. — [Main.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/Main.as)
- **Juicy Breakout block tween-in:**
  - Default 0.7 s, slider 0.01-3 s, random per-block delay of 0-1 s.
  - Easing choices: Linear, Quadratic.easeOut, Back.easeOut, Bounce.easeOut.
  - Start rotation is random ±45°, start scale 0.2.
  - The block-shatter constants are rotation 5 and force 2.

  — [Block.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/gameobjects/Block.as); [Settings.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/Settings.as)
- Juicy Breakout's "personality" toggles add a face to the paddle that looks at the ball (smile, eye size, eye separation). A "screen color glitch" flashes the background to a random tint and decays it by ×0.8 per frame from a 0.05 force. — [Settings.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/Settings.as); [Main.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/Main.as)
- Classical animation principle: squash flattens a form, and stretch increases the sense of speed. Volume should stay constant during the distortion. — [UW CSE 457 animation lecture](https://courses.cs.washington.edu/courses/cse457/14wi/lectures/animation-2pp.pdf) (search summary)

#### Slow motion, kill cams, crash replays
- **Burnout 3 (Impact Time and Aftertouch):**
  - Crashing triggers slow motion. One review describes holding a button during a crash to get a "Max Payne-esque slow-mo," during which the player steers the wreck ("aftertouch").
  - The Crash mode score is tallied a set number of seconds after the initial impact, which is why the post-impact steering phase matters.
  - An aftertouch takedown refills boost.

  — [Wikipedia: Burnout 3: Takedown](https://en.wikipedia.org/wiki/Burnout_3:_Takedown); [GameSpot review](https://gamespot.com/reviews/burnout-3-takedown-review/1900-6106835/); [GameRevolution review](https://www.gamerevolution.com/review/34364-burnout-3-takedown-review-2) (search summary; no published slow-mo durations or time scales)
- **Sniper Elite kill cam:**
  - Rebellion's Tim Jones says the first game "wasn't originally developed with a killcam in mind." It came in late as "a team effort… that just worked."
  - V2 showed the bullet passing through three layers (skin, bones, organs). Sniper Elite 3 added muscle and circulatory layers.
  - Sniper Elite 4 "completely re-engineer[ed]" the system, with emphasis on "fidelity of the fracturing," and added melee and explosive kill cams.
  - Sniper Elite 5 added bullets that ricochet off bones and gave the player "real time control over the speed of the cinematic and camera angles."
  - For sound, SE3 used recordings of the team smashing fruit and vegetables.

  — [MCV/Develop on the evolution of the killcam](https://mcvuk.com/?p=23739); [Game Informer SE3](https://gameinformer.com/games/sniper_elite_3/b/xboxone/archive/2014/02/14/new-kill-cam-adds-gruesome-detail.aspx); [TheSixthAxis SE5](https://www.thesixthaxis.com/2022/05/19/sniper-elite-5-trailer-enhanced-x-ray-kill-cam/); [TheSixthAxis SE3 behind the scenes](https://www.thesixthaxis.com/?p=212545) (search summary; which outlet said which point is my best attribution from a merged summary)

#### X-ray bone-break presentations
- Sniper Elite's x-ray is built as stacked anatomical layers (skin, then muscle, bone, organs, circulatory) that the camera reveals as the bullet passes. Later games increased fracture fidelity and let the player control playback speed and angle. — [MCV/Develop](https://mcvuk.com/?p=23739); [Game Informer](https://gameinformer.com/games/sniper_elite_3/b/xboxone/archive/2014/02/14/new-kill-cam-adds-gruesome-detail.aspx); [TheSixthAxis](https://www.thesixthaxis.com/2022/05/19/sniper-elite-5-trailer-enhanced-x-ray-kill-cam/) (search summary)
- The Skate series' "Hall of Meat" tracks wipeout injuries, particularly broken bones. Its injury display is described as an x-ray view of the bones broken in a hard landing. — [Wikipedia: Skate (series)](https://en.wikipedia.org/wiki/Skate_(series)); [EGM: "The one feature Skate 4 can't launch without"](https://egmnow.com/?p=10763) (search summary)

#### Score UI / Hall of Meat
- Hall of Meat scoring came from broken bones plus distance and air time. — [MobyGames](https://www.mobygames.com/game/78792) (search summary)
- Skate 2 introduced the mode as turn-based, with "the score… shown as a hospital bill." — [bit-tech Skate 2 preview](https://bit-tech.net/reviews/gaming/xbox/skate-2-hands-on-preview/4/) (search summary)
- Skate 3 expanded it into a fuller mode with several midair poses and varied objectives. Sources disagree on whether the original showed an x-ray or a skeleton diagram. — [EGM](https://egmnow.com/?p=10763); [Nerdschalk (conflicting)](https://nerdschalk.com/you-guide-to-hall-of-meat-in-skate-4/) (search summary)
- Coverage of the new skate. calls Hall of Meat a fan-favorite feature. — [Inverse](https://www.inverse.com/gaming/skate-15million-fan-favorite-feature-hall-of-meat) (title only; content not retrieved)

### Inferences
**Starting-value cheat sheet for Number Go Down** (my derivations from the cited numbers; tune in playtest; 1 frame = 16.7 ms at 60 fps):

| Technique | Starting values | Derived from |
|---|---|---|
| Hitstop, small hit | 0 ms below a threshold; 33-67 ms (2-4 f) above it | Melee floor of 3 f (50 ms); the Hollow Knight "stutter" warning |
| Hitstop, big hit | 100-150 ms (6-9 f) | Ultimate: d = 5 gives 9 f (150 ms); Brawl: d = 10 gives 8 f (133 ms) |
| Hitstop, bone break | 150-250 ms (9-15 f), then ramp into slow-mo | Ultimate: d = 20 gives 19 f (317 ms); Juicy Breakout max 320 ms |
| Hitstop shape | Time scale 1 → 0.02-0.05, with 0-16 ms fade-in, a hold, and 60-120 ms fade-out (ease-out) | Juicy Breakout freeze multiplier and 0-160 ms fade-in/out |
| Victim vibration during hitstop | Shake the mascot's **render mesh only** (not the physics bodies) ±1.5-3% of body height along the impact normal, alternating sign every 1-2 frames, amplitude decaying to 0 across the hitstop | Sakurai: visual vibration with static hurtboxes |
| Trauma added per impact | 0.15 (bump) / 0.35 (hard) / 0.6 (bone break) / 1.0 (finale) | Bevy 0.4 per event |
| Shake output | `shake = trauma²` (try `trauma³` for an even "quieter small, louder big" curve) | Bevy and Eiserloh |
| Trauma decay | 1.0-1.5 per second (faster than Bevy's 0.5/s, because impacts are frequent in a 20-60 s run) | Bevy constant, adjusted |
| Max roll | 3-5° (Bevy's 10° is "somewhat high"; reserve 6-8° for the finale) | Bevy |
| Max translation | ~2-3% of viewport width (8-12 CSS px on a 390 px wide portrait phone), versus Bevy's 20 px at desktop scale | Bevy |
| Noise | 1D Perlin or OpenSimplex, speed ~15-25 units/s, independent seeds per axis | Bevy |
| Directional "camera kick" | A damped spring kicked along the impact normal: drag ≈ 0.1, stiffness ≈ 0.1 per 60 Hz tick, underdamped (ζ ≈ 0.16, period ≈ 0.33 s, assuming dt = 1 per frame) | Juicy Breakout `Shaker.as` |
| Squash on impact | Visual-only scale along the normal of 0.75-0.85, perpendicular 1.1-1.2 (keep the product ≈ 1), recovering in 150-300 ms with Back.easeOut or an underdamped spring | Juicy Breakout clamp 0.85-1.35; volume preservation |
| Stretch in flight | Along velocity, 1 + 0.2-0.3 × normalized speed, perpendicular 1 − 0.15-0.2 × normalized speed | Juicy Breakout ball (0.3 / 0.2) |
| UI and number "pop" | Scale 0 → 1.3-1.5 → 1.0 over ~150-250 ms with Back.easeOut; glow or brightness flash on a 0.7 s Back.easeOut | Juicy Breakout `_ball_extra_scale += 1.5`; glow tween 0.7 s Back.easeOut |
| Tween-in for UI elements | 0.3-0.7 s, Back.easeOut or Bounce.easeOut, with 0-80 ms stagger | Juicy Breakout default 0.7 s and easing set |

- **Hitstop on a ragdoll is a time-scale problem.** Scale the physics step and animation time, but run camera smoothing, UI, particle spawn and the hitstop timer itself on unscaled real time. Juicy Breakout multiplies the freeze into both game speed and every tween; Number Go Down should do the same for gameplay tweens, but not for UI that must stay responsive.
- **Victim vibration should be visual only.** Sakurai's rule (vibrate the visual, keep hurtboxes still) translates directly: offset the skinned mesh or root render transform, never the Rapier or cannon bodies, or the ragdoll will gain energy and jitter.
- **Use trauma and a directional kick together.** The kick (a spring along the impact normal) communicates direction. Trauma noise communicates magnitude. Nijman's "camera kick" and Juicy Breakout both use directional kicks, and Bevy/Eiserloh use noise.
- **Keep shake modest for a falling game.** God of War cut shake to protect legibility and compensated with audio and animation. A descent game where the player must read upcoming obstacles should do the same: shake strongly only when the view is frozen (hitstop or slow-mo) or during the finale.
- **Funny rather than gory.** Use the Juicy Breakout "personality" lesson. Give the mascot exaggerated faces (X-eyes, swirl eyes, tongue out) during hitstop frames, and keep "permanence" (Nijman) as comic marks: bandages, casts, cracked-obstacle decals, a growing pile of dropped accessories. This replaces blood and bodies.

### Gaps
- I could not retrieve exact values for any of these, because the search budget ran out and pages were unreachable: Hollow Knight or Celeste hitstop frame counts; God of War hit-pause numbers; Street Fighter hitstop values; Max Payne, Superhot or Mortal Kombat time-scale factors; Mortal Kombat X-ray durations; anime-style impact-frame practice in Hi-Fi Rush or Sifu; Steve Swink's *Game Feel* parameter discussions; GMTK video content; Sakurai's "effects" video content.
- The SmashWiki multipliers (h, e, s, c) and the Ultimate hitlag cap were not retrieved. From memory, an electric multiplier of 1.5× and a cap near 30 frames are commonly cited; both are **unverified**.
- Eiserloh's own slides were not read, only Bevy's faithful implementation. Two points commonly attributed to him are **unverified** here: that 3D games should favor rotational over translational shake, and that he suggested trauma³ as an alternative.
- Nijman's "sleep" duration conflicts between write-ups (about 20 ms vs about 0.2 s).
- I found no published durations for the Burnout 3 Impact Time slow-mo, Skate replay timing, or Sniper Elite kill-cam length.

## Q2. How should effects scale with impact size, so small hits stay snappy and huge hits get the full cinematic treatment?

### Takeaway
Respected systems scale with a **constant floor plus a linear term** for timing (Smash hitlag) and with a **power curve** for camera energy (trauma², exponent 2+). Small hits therefore get a fixed, short, crisp response, while stacked or huge hits grow superlinearly. Layer effects in tiers: small hits get local effects only (particles, squash, sound), medium hits add hitstop and kick, and only rare, gated events get time dilation, zoom, x-ray and full-screen flashes.

### Cited Findings
- Smash hitlag is an affine function of damage. Ultimate uses 6 frames base + 0.65 frames per damage point; Brawl and Smash 4 use 5 + 0.385·d; Melee uses 3 + d/3. Big hits pause longer, but even tiny hits get a few frames. — [SmashWiki: Hitlag](https://www.ssbwiki.com/Hitlag) (search summary)
- Ultimate scales hitlag down in crowded matches (p = 0.75 at 8 players), so busy, multi-hit scenes get shorter pauses. — [SmashWiki: Hitlag](https://www.ssbwiki.com/Hitlag) (search summary)
- Eiserloh-style trauma maps linear "damage in" to non-linear "shake out." Bevy uses an exponent of 2 because "Camera shakes don't feel punchy when they go up linearly," and a higher exponent makes the transition "more abrupt" between no shake and full shake. Trauma accumulates (`+=`) and is clamped to 1. — [Bevy 2d_screen_shake.rs](https://github.com/bevyengine/bevy/blob/main/examples/camera/2d_screen_shake.rs)
- Juicy Breakout scales the shake impulse with the ball's velocity vector (`-velocity × power`), so faster impacts kick harder, in the hit direction. Ball stretch scales with normalized speed. — [Shaker.as / Main.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/Main.as); [Ball.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/gameobjects/Ball.as)
- Long pauses on frequent hits read as stutter: "longer than a few frames… feel like it has a stutter." — [Critical Points](https://critpoints.net/2017/06/22/hollow-knight-review/) (search summary)
- Define an intensity scale and give each shake type a meaning. — [Feel docs](https://feel-docs.moremountains.com/screen-shakes.html) (search summary)

### Inferences
- **Impact metric.** Compute `I = clamp(impulse / I_ref, 0, 1)` per contact, using the ragdoll contact impulse (or relative normal velocity × effective mass). Pick `I_ref` so that the run's biggest slams reach about 1. Add a bonus of +0.3 when the contact breaks a bone. Ignore contacts with I < 0.08, because limp ragdolls generate dozens of micro-contacts per second.
- **Hitstop frames, Smash-style.** `frames = floor(base + k × I)`, with base = 2 and k = 10 for regular hits (2-12 f, 33-200 ms). Bone breaks get base 8 (8-18 f, 133-300 ms). Apply a crowding factor like Smash's p: if another hitstop ended within the last 250 ms, multiply by 0.5-0.6 so chains of bonks don't feel sluggish.
- **Shake.** Add `trauma += 0.6 × I^1.2` (bone break: +0.25 extra). Output `trauma²`. With squared output, one hit at trauma 0.4 shakes at only 16% of max, while three quick hits that stack to about 1.0 give full shake. This handles "small snappy, combo huge" automatically.
- **Tiers** (cumulative: each tier adds to the one before):

| Tier | Trigger | Effects |
|---|---|---|
| T0 | I < 0.08 | Nothing, or a tiny dust puff |
| T1 | 0.08-0.35 | Dust/star particles (3-8), mesh squash 0.85-0.9, small "+N" number, no hitstop or 2 f, trauma +0.1-0.2 |
| T2 | 0.35-0.7 | Hitstop 4-8 f with mesh vibration, directional camera kick, comic "BONK" word (scale-pop 0 → 1.4 → 1 in about 200 ms, slight random rotation ±10-15°), speed-line burst, chromatic-aberration pulse (offset spike decaying over about 150 ms), trauma +0.3 |
| T3 (bone break, not gated) | Break event, cinematic budget empty | Hitstop 9-15 f, mesh x-ray "blink" (2-4 frames of skeleton overlay on the mascot in place, without changing the camera), "CRACK!" text, bone icon flying to the HUD body diagram, trauma +0.5 |
| T4 (cinematic) | Break event or huge impact, and the budget allows (see Q3) | Hitstop → slow-mo ramp → zoom/orbit → full x-ray, plus impact frame(s), then ramp out |

- **Particles scale by count and speed, not by size.** For example, `count = 4 + 20 × I`, initial speed proportional to I, and lifetime fixed at about 300-600 ms. Big puffs that cover the mascot hurt readability.
- **Damage and score numbers.** Font scale ∝ 1 + 0.6 × I. Bigger numbers also linger longer (600 → 1000 ms). Numbers above a threshold get a color change (white → yellow → pink) and a 1-2 frame white flash on spawn.

### Gaps
- I found no published "impact energy → effect" tables from AAA ragdoll games (Skate, Burnout, Turbo Dismount, Happy Wheels). The tier boundaries above are proposals for playtesting.

## Q3. How should cinematic moments (slow-mo plus zoom plus x-ray) be rationed so they stay special across a 20-60 second run?

### Takeaway
The references show three rationing levers: **novelty** (Sniper Elite's kill cam came late and did not fire on everything), **player control** (Burnout's Impact Time is held by the player; Sniper Elite 5 lets players control speed and angle), and **deferring the score payoff** (Burnout tallies seconds after impact; Skate presents injuries as a bill or x-ray summary). For Number Go Down, gate cinematics with a budget plus cooldown plus novelty test, make every cinematic skippable and speed-uppable by tap, and save the biggest moment for the end-of-run summary.

### Cited Findings
- Sniper Elite's kill cam was a late addition that "just worked." The franchise then kept evolving it each game (more layers, then fracture fidelity, then ricochets and player control). — [MCV/Develop](https://mcvuk.com/?p=23739) (search summary)
- Sniper Elite 5 gives players "real time control over the speed of the cinematic and camera angles." — [TheSixthAxis](https://www.thesixthaxis.com/2022/05/19/sniper-elite-5-trailer-enhanced-x-ray-kill-cam/) (search summary)
- In Burnout 3, slow-mo happens on crash. Reviewers describe the player holding a button to enter it and steering the wreck with "aftertouch." Crash-mode scoring is computed a set number of seconds after the first impact. — [Wikipedia](https://en.wikipedia.org/wiki/Burnout_3:_Takedown); [GameSpot](https://gamespot.com/reviews/burnout-3-takedown-review/1900-6106835/) (search summary)
- Skate's Hall of Meat turns injuries into a separate scoring presentation: "a hospital bill" (Skate 2) and an x-ray view of the broken bones. — [bit-tech](https://bit-tech.net/reviews/gaming/xbox/skate-2-hands-on-preview/4/); [EGM](https://egmnow.com/?p=10763) (search summary)
- Players complained about Hollow Knight's kill micropause being too long, even though it was brief. Repeated pauses accumulate annoyance. — [Steam discussion](https://steamcommunity.com/app/367520/discussions/0/5185299686167216571/) (search summary)
- Juicy Breakout's freeze has an explicit fade-out (up to 160 ms) rather than snapping back, which shows that the exit curve matters. — [Freezer.as](https://github.com/grapefrukt/juicy-breakout/blob/master/src/com/grapefrukt/games/juicy/Freezer.as)

### Inferences
- **Cinematic budget (T4)** for a run of length R seconds:
  - Allow `max(2, round(R / 12))` full cinematics, so 2 in a 20 s run and 5 in a 60 s run.
  - Impose a global cooldown of 6-8 s of real play between cinematics.
  - A T4 fires only if the event is **novel** (first break of that bone type this run, or a new "body region") **or bigger** (impact ≥ 1.25× the biggest cinematic so far).
  - The **finale** (final crash or landing) is always guaranteed a cinematic and does not use the budget.
  - Everything that fails the gate falls back to T3 (in-place x-ray blink and hitstop), so no break goes unacknowledged.
- **Cinematic timeline** (real-time ms; ease names follow the Penner set used by GTween):
  1. 0-120 ms: hitstop at time scale ~0.02 with mesh vibration.
  2. 0-50 ms: one or two impact frames (see Q4 for flash limits).
  3. 120-300 ms: ramp the time scale to 0.15-0.25 with easeOutCubic while zooming the camera (FOV −15-25% or dolly-in) with easeOutQuart.
  4. 300-1100 ms: hold slow-mo. The x-ray is on, the bone crack plays, "CRACK!" text appears, and the camera orbits 10-25° around the break point.
  5. 1100-1400 ms: ramp back to 1.0 with easeInCubic. Zoom and the x-ray fade out together, and the camera snaps back to follow (cut on the ramp end, or a 150 ms ease).
  6. Total ≈ 1.2-1.5 s. The finale may run 2-3 s.
- **Skippable.** Tapping during a cinematic jumps to the ramp-out, which never feels like lost control. Holding slows it further (the Sniper Elite 5 model). Burnout's "hold to slow" idea could also become an optional "aftertouch" nudge: the player swipes during slow-mo to steer the limp mascot into the next obstacle, adding agency and combos.
- **Diminishing returns within a run.** Each later cinematic in the same run can be 15-20% shorter (shorter hold, same ramps), and a repeat break of the same bone type is always T3. If the player skips 2 cinematics in a row, halve the remaining budget, since they are signalling fatigue.
- **End-of-run "Hall of Meat" summary** (deferred payoff, Burnout/Skate style):
  1. A front-facing comic skeleton diagram of Emonad with each broken bone lighting up in sequence (100-150 ms stagger, each with a pop scale 1 → 1.3 → 1 and a tick sound).
  2. A line-item tally ("Left femur ×1 ... 2,500") counting up over 300-600 ms per line with easeOutExpo.
  3. Multiplier callouts that slam in (scale 2 → 1 in 120 ms with a small kick).
  4. A final total with a big pop and confetti.
  5. A "hospital bill" receipt gag (as in Skate 2) suits the comedic tone.
  6. Offer a replay GIF/clip of the top cinematic for sharing.
- **Combo meter in-run.** A chain counter increments on each T1+ hit within a 1.0-1.5 s window, shown as "×N". The multiplier text punches (scale 1.6 → 1 in 150 ms) and its color heats up. The meter's decay bar shrinks linearly, and its "banked" score flies to the total with a 300-400 ms arc (easeInQuad) when the chain ends.

### Gaps
- I found no developer statement on optimal slow-mo hold length or frequency before tedium for Max Payne, Superhot, Burnout, Skate, Sniper Elite or Mortal Kombat. The 1.2-1.5 s cinematic and 6-8 s cooldown are inferences.
- I could not confirm a Sniper Elite "kill cam frequency" option or its default.

## Q4. Which effects are cheap enough for a mid-range phone browser at 60fps, which need a fallback, and how do we avoid overload, nausea and photosensitivity problems?

### Takeaway
Time-domain effects (hitstop, slow-mo), transform effects (shake, kick, squash, zoom via FOV) and UI and number pops are essentially free. Single-pass screen effects merged into one pmndrs `EffectPass` are cheap: chromatic aberration (2 extra texture reads per pixel), vignette, color flash or invert, and a shockwave UV ripple. Multi-pass or many-sample effects need a budget or a fallback: mipmap bloom (8 levels at half resolution by default), radial or zoom blur (god-rays-style 60 samples), and depth of field. Full-screen flashes on a phone exceed the WCAG area threshold, so they must stay at or below 3 per second, and reduce-motion must disable zooms and orbits.

### Cited Findings
- pmndrs/postprocessing's `EffectPass` "automatically organizes and merges any given combination of effects. This minimizes the amount of render operations and makes it possible to combine many effects without the performance penalties of traditional pass chaining." — [pmndrs/postprocessing README](https://github.com/pmndrs/postprocessing)
- pmndrs/postprocessing defaults to `UnsignedByteType` sRGB intermediate buffers as a trade-off between "hardware support, efficiency and quality." `HalfFloatType` is "preferred… for HDR-like workflows on desktop devices." The README's renderer setup uses `antialias: false` and `powerPreference: "high-performance"`. — [pmndrs/postprocessing README](https://github.com/pmndrs/postprocessing)
- `ChromaticAberrationEffect` default offset is (0.001, 0.0005) in UV units, with optional `radialModulation` (`modulationOffset` 0.15). The fragment shader does two extra texture fetches (R and B channels at offset UVs). — [ChromaticAberrationEffect.js](https://github.com/pmndrs/postprocessing/blob/main/src/effects/ChromaticAberrationEffect.js); [chromatic-aberration.frag](https://github.com/pmndrs/postprocessing/blob/main/src/effects/glsl/chromatic-aberration.frag)
- `BloomEffect` defaults: `mipmapBlur: true`, `levels: 8`, `resolutionScale: 0.5`, `luminanceThreshold: 1.0`, `luminanceSmoothing: 0.03`, `intensity: 1.0`, `radius: 0.85`. `MipmapBlurPass` "produces a wide blur by downsampling and upsampling the input over multiple MIP levels." — [BloomEffect.js](https://github.com/pmndrs/postprocessing/blob/main/src/effects/BloomEffect.js); [MipmapBlurPass.js](https://github.com/pmndrs/postprocessing/blob/main/src/passes/MipmapBlurPass.js)
- `ShockWaveEffect` defaults: `speed 2.0`, `maxRadius 1.0`, `waveSize 0.2`, `amplitude 0.05`. It is a screen-space ripple anchored at a world position. — [ShockWaveEffect.js](https://github.com/pmndrs/postprocessing/blob/main/src/effects/ShockWaveEffect.js)
- `GodRaysEffect` (radial-blur-style) defaults: `samples: 60`, `density 0.96`, `decay 0.9`, `weight 0.4`, `exposure 0.6`, `resolutionScale 0.5`, with an extra blur. — [GodRaysEffect.js](https://github.com/pmndrs/postprocessing/blob/main/src/effects/GodRaysEffect.js)
- **WCAG 2.3.1** (Three Flashes or Below Threshold) is based on broadcast guidelines.
  - The area threshold is a 341 × 256 px block, representing a 10° visual field. With CSS pixels, the combined flashing area becomes 341 × 256 CSS px = **87,296 CSS px²**.
  - Content passes if it does not flash more than three times in any one-second period.
  - People are "even more sensitive to red flashing," so a special saturated-red test applies.

  — [W3C Understanding SC 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) (source read from [w3c/wcag on GitHub](https://github.com/w3c/wcag/blob/main/understanding/20/three-flashes-or-below-threshold.html))
- **WCAG 2.3.3** (Animation from Interactions): "Vestibular (inner ear) disorder reactions include dizziness, nausea and headaches." Parallax is cited as often non-essential animation. Sites should respect `prefers-reduced-motion`. — [W3C Understanding SC 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (source read from [w3c/wcag GitHub](https://github.com/w3c/wcag/blob/main/understanding/21/animation-from-interactions.html))
- MDN: "Animations such as scaling or panning large objects can be vestibular motion triggers." `prefers-reduced-motion: reduce` indicates the user has enabled reduced motion at the OS level (for example, macOS Settings → Accessibility → Motion → Reduce motion). — [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) (source read from [mdn/content GitHub](https://github.com/mdn/content/blob/main/files/en-us/web/css/reference/at-rules/@media/prefers-reduced-motion/index.md))
- God of War reduced camera shake for legibility and compensated with audio and animation. — [PlayStation Blog](https://blog.playstation.com/2022/10/04/game-developers-explain-what-makes-god-of-war-2018s-combat-tick/)

### Inferences
- **Per-effect cost and fallback** (mid-range phone, about 2-3× DPR, portrait). The relative costs are reasoned from pass and sample counts, not measured.

| Effect | Cost | Plan |
|---|---|---|
| Hitstop / slow-mo (time scale) | Free | Always on (it is stillness, so it is safe for reduced motion) |
| Trauma shake / directional kick / FOV zoom punch | Free (camera transform) | Slider: 0 / 50 / 100%. Reduced motion disables zoom and orbit and sets shake to 0-25% |
| Mesh squash and stretch, mesh vibration | Free (CPU bone transforms) | Always on |
| UI pops, damage numbers, combo text, "BONK" sprites | Cheap (DOM/CSS transforms or a sprite atlas with instancing) | Prefer an instanced sprite atlas or bitmap font in WebGL. If DOM, animate only `transform` and `opacity` and cap live numbers at about 20 |
| Particles (dust, stars, sparks) | Cheap if instanced (`InstancedMesh` or `Points` with a texture atlas), with fill-rate the main cost for large soft sprites | Cap at about 150-300 live; keep sprites small; additive blending only on small sprites |
| Speed lines | Cheap (a few stretched quads, or a radial-lines texture on a full-screen quad) | Show only during fast fall and cinematic entry |
| Chromatic aberration pulse | Cheap (2 extra fetches/px, merged into the same `EffectPass`) | Pulse offset to about 0.004-0.008 UV on T2+ and decay over 150-250 ms. Disable for reduced motion |
| Vignette, color grade, impact flash or invert, desaturate during slow-mo | Cheap (ALU-only inside the merged pass) | Use for x-ray tint, slow-mo desaturation and impact frames |
| Shockwave ripple | Cheap (one UV-distortion effect in the merged pass) | T3/T4 only. Start from pmndrs defaults (amplitude 0.05, waveSize 0.2), with a shorter life |
| Bloom (mipmap, 8 levels at 0.5×) | Medium-heavy (many small passes; bandwidth-bound on mobile) | Use 4-5 levels and threshold ≥ 0.9, or enable bloom only during cinematics. Fallback: baked glow sprites on bright elements |
| Radial or zoom blur | Heavy at god-rays scale (60 samples) | 6-10 samples at half resolution, only for the 100-200 ms of a zoom punch. Fallback: speed lines plus CA |
| Depth of field | Heavy | Skip, or fake it with a blurred background plane |
| Motion blur / afterimage | Medium (an extra full-screen buffer read and write) | Optional "high" tier only |
| Second camera / x-ray render | Medium (renders the skeleton and mascot again) | Render only the mascot and skeleton layer (small screen area) with `depthTest:false` on the bones, and only during T3/T4 |

- **Engine settings.** Cap the device pixel ratio at about 1.5-2 for the scene and use `antialias:false` with the composer (as the pmndrs README does). Keep all screen effects in **one** `EffectPass`. Default to `UnsignedByteType` buffers on mobile (HalfFloat is "preferred on desktop"). Add an automatic quality governor: if the frame time over 1 s is above 18 ms, step down (bloom off, then DPR −0.25, then particle cap ×0.5).
- **Cartoon x-ray build (cheap and cute).**
  - The mascot gets a second, simplified skeleton mesh: chunky rounded "dog-bone" bones parented to the ragdoll bones, hidden normally.
  - During x-ray: swap the mascot's material to a fresnel or rim-lit translucent shader (cyan/teal, opacity 0.25-0.4, scanline or halftone pattern) and render the bone meshes in white/cream with a dark outline and `depthTest:false`. Add a blue-black background grade (vignette plus tint in the merged pass).
  - The break itself: a zigzag crack line decal (or an emissive texture swap) appears on the bone in 1 frame. A comic two-piece "snap" splits the bone mesh by 5-10% with a little rotation. Add 3-6 white "crack star" sprites and a "CRACK!" or "SNAP!" word.
  - Follow Sniper Elite's layering idea in reduced form: **skin → bones** only, with no muscle, organs or blood.
  - Afterward, a cast or bandage appears on that limb for the rest of the run (Nijman's permanence, comic).
- **Impact frames, anime-style.** One to three frames (16-50 ms) where the scene renders as a 2-tone silhouette (black mascot on white, or inverted), done as a threshold or invert inside the merged pass. On a portrait phone of about 390 × 844 CSS px (≈329,000 CSS px²), a full-screen flash covers about **3.8×** WCAG's 87,296 px² threshold area. Therefore:
  - limit full-screen impact frames to at most 1 per cinematic (and never more than 3 per second globally);
  - avoid saturated red;
  - prefer a dark-to-light inversion with moderated contrast (for example, invert toward mid-grey rather than pure white);
  - offer a "Reduce flashing" toggle that replaces the flash with a vignette pulse or a localized burst behind the mascot.
- **Nausea controls.**
  - Honor `prefers-reduced-motion` by default (`matchMedia('(prefers-reduced-motion: reduce)')`). That setting should disable zoom punches, orbit cuts, CA, radial blur and speed lines, and cap shake at 0-25%.
  - Provide in-game toggles: Screen shake (0-100% slider), Flashing effects (on/off), Cinematics (Always / Big moments only / Off), and Camera motion (Full / Reduced).
  - Prefer **roll plus small translation** over large camera pans, and keep the follow camera's look-ahead smooth (a critically damped spring, about 0.15-0.3 s time constant) so that constant falling does not add oscillation.
  - Keep large camera moves inside time-dilated windows, where the world is slow and the player expects a cut.
- **Overload rule.** At most one "screen-wide" effect family (CA, flash, shockwave, radial blur) should peak at a time. If several triggers overlap within about 100 ms, merge them by taking the max of their intensities instead of summing. Trauma does this for shake by clamping at 1.

### Gaps
- I found no measured frame-time numbers for pmndrs effects on specific mid-range phones (for example, a Snapdragon 7-series or Apple A15-class device). The cost ranking above is inferred from pass and sample counts, and it should be profiled on target devices.
- I could not retrieve the Xbox Accessibility Guidelines or Game Accessibility Guidelines entries on screen shake and motion. Their exact wording and recommendations remain to be filled in.
- I found no source on anime impact-frame conventions (frame counts in TV anime, or use in Hi-Fi Rush and Sifu), so the 1-3 frame recommendation is an inference.
- I found no sources for damage-number design in Borderlands, Diablo or Vampire Survivors, such as pop curves, stacking and accumulation rules. The number-pop values above derive only from the Juicy Breakout Back.easeOut pops.
