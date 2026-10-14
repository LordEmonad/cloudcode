# Impact Audio, Slow-Motion Audio, Voice, Music and Haptics for "Number Go Down" (phone web browser)

Research notes current to 14 October 2026. Method note: many primary domains (MDN, webkit.org, w3.org, designingsound.org, sonniss.com, freesound.org, unpkg.com, frequal.com) were blocked by the research proxy, so several facts come from search-engine extracts of those pages rather than full reads. The session's web-search budget also ran out before searches on master-bus compression, the "inhale before impact" technique, pop-punk library licensing and Suno's primary terms could run. Those topics are flagged in Gaps. Everything under "Inferences" is engineering or design reasoning built on the cited findings (plus general Web Audio knowledge where noted); it is not a sourced fact.

## 1. Impact sound design: layering, randomization, anti-repetition, comedic layers, and how reference games did it

### Takeaway
Great impacts are built, not recorded. Each hit is a stack of short layers: a transient/crack, a body/thump and a tail. Each layer is chosen per hit from round-robin pools across velocity tiers, with small random changes to pitch and volume. The transient and the tail are the layers whose variation matters most. The reference games' published audio material is thin. The usable lessons are Sniper Elite (drop realism and go for maximum intensity in the x-ray moment; produce-crushing foley), Mortal Kombat (gore built from destroyed produce), Overwatch (a single unmistakable "confirm" sound that cuts through the mix) and Turbo Dismount (a sympathetic victim that holds back the blood). Together they support a "cartoon crunch, not gore" palette for Emonad.

### Cited Findings
**Layer anatomy and anti-repetition**
- A 2025 MPSE Wavelength sound-design example splits one sound into onset, body, thump and tail. The body is "multiple short bursts drawn from processed recordings, randomized to avoid repetition", and the thump is "a dense, low-end transient made from pitch-shifted strikes" that plays slightly after the main hit — [MPSE Wavelength, Fall 2025](https://digital.copcomm.com/i/1538144-fall-2025/18)
- A practitioner thread citing university research says the transient and the identifiable pitched sounds in the tail are the two most important factors. Randomizing those slightly (even a random pitch envelope on one sample) "drastically reduces the machine-gun effect", while pitch-shifting the whole sound helps less than you'd think. This is forum-reported research and was not checked against the original study — [VI-Control forum](https://vi-control.net/community/threads/if-you-had-only-one-snare-sample.138821/)
- Zero-G's Impact Designer splits impacts into hit / boom / decay (attack / body / tail) and uses "3 dynamic velocity layers and 3 round robins per sound to avoid a machine-gun effect". It is a commercial product spec and an example, not a standard — [KVR Audio news](https://www.kvraudio.com/news-print.php?id=26585)
- Steinberg Nuendo's Randomizer generates variations of an event by randomly changing pitch, impact, color and timing within set ranges, for export as random-playback pools in a game engine — [Steinberg Nuendo Randomizer docs](https://steinberg.help/nuendo_plugin_reference/v11/en/_shared/topics/plug_ref/randomizer/randomizer_variations_of_audio_events_creating_t.html)
- Round-robin systems plus randomized sample variations are described as the standard fix for repetition in game audio — [IRPR Sound](https://sounddesign.irpr.agency/solutions/game-audio-repetitive/)
- How noticeable repetition is depends on the length of the experience, the time between repeats of the same sound, and how plausible the repetition is. Plausibility is lower for "complex or improbable" sounds, so a distinctive bone crack or scream wears out faster than a generic thud — [Sound in Games wiki: Variety](https://soundingames.dei.uc.pt/index.php/Variety)

**Crash / vehicle-destruction layering (Burnout and peers)**
- Designing Sound ran a 2017 Burnout sound-design retrospective with Ben Minto (audio designer; with audio director Stephen Root and audio programmer Peter Bishop). It describes the team as "one set of headphones, two blimps, and three steely looks". The crash-recording details could not be read; the page was blocked and the search extract was mostly intro — [Designing Sound](https://designingsound.org/2017/08/31/burnout-a-sound-design-retrospective-with-ben-minto/)
- Ben Minto on crash sound philosophy: "sure, you can turn crash sounds up and change the pitch, but what emotion do you want to create?" He also describes capturing game footage and tracklaying it like a film, without thinking about limitations at first — [MCV: Ben Minto Unplugged](https://mcvuk.com/development-news/ben-minto-unplugged/)
- A secondary blog interview with Criterion audio programmer Adam Hawkins claims Burnout 2 shipped "over 30 seconds of bespoke audio for each crash" and streamed in a new crash variant from disc in the window between crashes, under a ~2 MB audio RAM budget on PS2. UNVERIFIED: it is a blog summary, not a primary source, and some figures in the extract looked garbled — [Zebra Home Cinema](https://zebrahomecinema.com/blog/inside-game-audio-design-with-adam-hawkins-f1-operation-flashpoint-dirt-and-burn)
- Modern crash libraries build crash sequences "from individual, meticulously recorded sound layers", recorded in studio, scrapyard and crane-drop sessions — [Sonic State, July 2026](https://sonicstate.com/news/2026/07/31/the-sounds-of-vehicle-destruction/). Typical crash layers are a deep metallic crash, high-frequency shattering, ambient debris and tire squeals — [BOOM Library Road Rage overview](https://www.podcastvideos.com/boom-library-road-rage-essential-vehicle-crash-sound-effects-for-film-and-games/)
- No GDC talk specifically on Burnout crash audio was found (the search turned up none; GDC Vault was not reachable).

**X-ray / bone-break moments (Sniper Elite, Mortal Kombat, Skate)**
- Sniper Elite 3: for the slow-motion X-ray kill cam, the team reworked recordings of fast vehicles and layered them over the slowed bullet flight. For body impacts they recorded themselves crushing fruit and vegetables — [Game Informer, 2014](https://gameinformer.com/games/sniper_elite_3/b/xboxone/archive/2014/02/14/new-kill-cam-adds-gruesome-detail.aspx)
- Rebellion lead audio designer Nick D Brewer named the X-ray kill cam as his favourite sound moment. He called it the one point where the team sets realism aside and goes for maximum intensity — [MCV: Sniper Elite 4 Boom Shot](https://www.mcvuk.com/sniper-elite-4-boom-shot/)
- Sniper Elite 5 has options to reduce gore, lower how often kill cams play, or switch them off. Even the flagship slow-mo payoff is made optional and frequency-limited — [Wireframe review](https://wireframe.raspberrypi.com/articles/sniper-elite-5-review-aint-that-a-kick-or-bullet-in-the-head)
- NetherRealm sound designer Stephen Schappler (Mortal Kombat) said much of the gore audio comes from destroyed produce, naming green peppers, grapefruits and walnuts. This is a secondhand summary of a VICE video — [Dread Central](https://dreadcentral.com/news/299082/new-video-goes-into-the-disgusting-sounds-of-mortal-kombat)
- For the 2021 Mortal Kombat film, Foley artist Adrian Medhurst snapped celery and crushed a bell pepper for a hollow crunch, and also used citrus, melons and wet gravel — [No Film School](https://nofilmschool.com/want-perfect-gory-sound-how-you-create-it). Celery is a standard bone-break stand-in, often wrapped in a damp cloth for a wet layer — [Mental Floss](https://www.mentalfloss.com/article/91335/how-foley-artists-use-food-make-sound-effects); [Storyblocks](https://www.storyblocks.com/resources/blog/foley-sfx-everyday-household-objects/)
- Mortal Kombat X's Story Mode Foley mixed custom recordings, sample libraries and MIDI — [A Sound Effect](https://asoundeffect.com/mortal-kombat-x-sound/)
- Skate's Hall of Meat: the public sources discuss gameplay (an X-ray bone view and bone-break scoring), not sound design. Fans say bails feel tame without "seeing and hearing the bones break" — [EA Forums](https://forums.ea.com/discussions/skate-en/bring-back-hall-of-meat/12627386); [Inverse](https://www.inverse.com/gaming/skate-15million-fan-favorite-feature-hall-of-meat); [EGM](https://egmnow.com/?p=10763)

**Hit-confirm sounds (Overwatch)**
- Overwatch's hit-confirmation sound is a beer bottle opening, reversed and altered (per sound designer Paul Lackey in the Collector's Edition source book, via secondhand reporting). The design goal was a sound that is audible through all other effects yet doesn't seem to come from another hero — [PC Gamer](https://www.pcgamer.com/au/overwatchs-hit-sound-effect-is-apparently-powered-by-beer)
- Overwatch's GDC 2016 talk "The Elusive Goal: Play by Sound" (Scott Lawlor, Tomas Neumann) set out its pillars: a clean mix, sounds that can be pinpointed, sounds that carry gameplay information, and descriptive voice-over — [PCGamesN](https://pcgamesn.com/overwatch/overwatch-devs-on-creating-a-game-you-can-play-by-sound-and-announcing-dolby-atmos-support); [Tom's Guide](https://tomsguide.com/us/overwatch-sound,news-22801.html)

**Comedic ragdoll references (Turbo Dismount, Happy Wheels, Kick the Buddy, Fall Guys)**
- Turbo Dismount's developers wanted to "defy the standard of most ragdoll/physics sims" by making Mr. Dismount a sympathetic character — [Wikipedia](https://en.wikipedia.org/wiki/Turbo_Dismount). The game holds back on blood and guts — [Kill Screen](https://www.killscreen.com/why-are-ragdoll-physics-so-funny/)
- Kick the Buddy: a fan-style article credits the "thwack" of the bat and Buddy's comical screams as a big part of the appeal. It is opinion, not developer material — [u-bordeaux hosted article](https://participation.u-bordeaux.fr/processes/FTLV/f/213/proposals/2204)
- Fall Guys lead designer Joe Walsh: "a big focus for us is making sure the punchline to that joke is different every time, and a lot of that comes from getting the physics of our character just right" — [Digitally Downloaded](https://www.digitallydownloaded.net/?p=42226). The devs on the characters: "Falling over is funny" — [GGRecon](https://www.ggrecon.com/articles/fall-guys-developers-reveal-what-makes-their-jelly-beans-so-lovable)

**Game-feel coupling (hit-stop + audio)**
- A heavy-hit freeze ("hit-stop") of about 50–100 ms makes a hit feel like it connected. Shorter goes unnoticed and longer looks like lag — [Wayline game-feel course](https://www.wayline.io/learn/game-feel/1); [Easton Dev blog, May 2026](https://eastondev.com/blog/en/posts/dev/20260521-game-feedback-feel/)
- A 2022 IEEE study of 19 impact-feel design features reportedly found hit stop, sound coherence and camera control had the highest weights. This is secondhand via a blog; the paper itself was not reached — [Easton Dev blog](https://eastondev.com/blog/en/posts/dev/20260521-game-feedback-feel/)

### Inferences
- **Impact recipe for Emonad (starting point, tune by ear):** each collision event computes the normal impulse (relative velocity × mass along the contact normal), then maps it to tiers: *tick* (limb grazes), *thud* (body hit), *slam* (big obstacle), *BREAK* (bone-break event, gameplay-driven). Each tier picks from its own pools:
  - transient/crack: short, bright, 5–30 ms; celery snap, knuckle crack, wooden click
  - body/thump: low "bonk", punch, mattress whump
  - sweetener: cartoon layer such as a xylophone "boing", rubber squeak, cash-register "cha-ching" or coin spill (fits a crypto-meme "number go down" theme), or a tiny slide-whistle down
  - tail: debris, a short room reverb, or a comedic wobble
- Vary per hit (sources say transient and tail variation matter most): pick a round robin, never repeat the last N; pitch ±1–2 semitones on transient and tail; gain ±2–3 dB; a 0–15 ms offset between layers. These numbers are conventional starting values, not sourced.
- **Velocity → sample, not velocity → volume:** following the Impact Designer model, have 3 velocity layers per category, with harder hits switching to different, brighter recordings rather than the same file louder. Clamp very small impulses to silence so a sliding ragdoll doesn't spam ticks. Add a per-body-part cooldown (e.g. 60–120 ms) and a global voice cap.
- **"Funny, not gory":** borrow Sniper Elite's "set realism aside" stance for the bone-break moment, but swap the wet produce squelch (peppers, grapefruit) for dry, crisp, cartoon-ish cracks (celery or carrot snap, cracked walnut shell, pitched up), then a comedic sweetener. Skip wet or squelch layers. Turbo Dismount's sympathetic-victim framing and holding back the blood is the tonal precedent.
- **One unmistakable "BREAK confirm" sound** (Overwatch lesson): a single short signature sound (e.g. a crunchy crack plus a bright pitched "ding"/glitch tied to the score) that always cuts through the mix and tells the player a scoring bone break happened. Keep it consistent; vary only the layers around it.
- Hit-stop of ~50–100 ms on BREAK events, with the transient landing on the first frozen frame, plus a matching haptic (see section 6), applies the "sound coherence + hit stop + camera" trio.

### Gaps
- No primary source on how Skate's Hall of Meat bone cracks, Happy Wheels or Turbo Dismount impacts were actually recorded or layered. No GDC talk on Burnout crash audio was found, and GDC Vault was unreachable.
- Burnout figures (30+ seconds per crash, streaming variants, 2 MB RAM) come from an unverified secondary blog.
- No God of War or Hitman impact-audio talk content was retrieved (searches ran out before those were reached).
- No sourced numeric norms for pitch/volume randomization ranges; the ranges above are conventional practice.

## 2. Slow-motion audio: pitch-down, low-pass, reverb swell, heartbeat, ducking, whoosh in/out

### Takeaway
The proven convention is to make slow motion sound like a slowed recording: pitch-down plus low-pass filtering, with ambience pitched down and faded and the music ducked. Best practice is to crossfade to purpose-made slow-motion variants of key sounds rather than relying on pitch-shifting alone. Web Audio can do all of this live with playbackRate, BiquadFilterNode and gain automation.

### Cited Findings
- Games with time manipulation generally follow cinematic conventions for reverse, fast-forward and slow-motion audio. Max Payne 2's bullet time is cited as an example of slow-motion sound designed to mimic a slowed recording — [Sound in Games wiki: Time Twist](https://soundingames.dei.uc.pt/index.php/Time_Twist)
- CRI's bullet-time tutorial pitches down and fades the ambience during slow motion. For gunshots it crossfades to a specially made slow-motion variant, and recommends creating special versions of assets rather than relying only on pitch-shifting and filtering — [CRIWARE blog, June 2024](https://blog.criware.com/index.php/2024/06/03/bullet-time/)
- A Unity tutorial recommends a mixer "snapshot" for bullet time that drops a low-pass cutoff to about 800 Hz and lowers volume. Its claim that Max Payne and Superhot use heavy low-pass plus bass emphasis is unverified — [bugnet.io](https://bugnet.io/blog/fix-unity-timescale-affecting-audio-pitch)
- Sniper Elite 3's slow-mo X-ray cam layered reworked fast-vehicle recordings over the slowed bullet flight. A "whoosh" bed built from sped/processed vehicle passes carries the slow-motion travel — [Game Informer](https://gameinformer.com/games/sniper_elite_3/b/xboxone/archive/2014/02/14/new-kill-cam-adds-gruesome-detail.aspx)
- Frequency control is part of the genre: Sniper Elite 5 lets players reduce how often kill cams play — [Wireframe](https://wireframe.raspberrypi.com/articles/sniper-elite-5-review-aint-that-a-kick-or-bullet-in-the-head)

### Inferences
- **Bone-break slow-mo sequence (about 1.2–2.0 s total), Web Audio sketch:**
  1. *Inhale (t-150 ms to 0):* a short reverse swell (reversed cymbal or whoosh) rising into the hit, and music gain ramps down about 6–10 dB. This is the "suck before the punch". When the break is decided a frame or two before visual contact (the physics knows it is coming), the swell can lead it.
  2. *Hit (t=0):* full-bandwidth BREAK stack plus hit-stop, so the crack is the crispest thing in the moment. Then:
  3. *Slow-mo body:* the SFX bus goes through a BiquadFilterNode lowpass ramped from ~18 kHz to ~800–1500 Hz over 150–250 ms. All live sources' `playbackRate` ramps to 0.5–0.6 (varispeed pitch-down, matching the "slowed recording" convention). Add a pre-rendered "slow-mo" variant of the crack (time-stretched, with a sub drop), a heartbeat loop (2 beats, low-passed, about 50–60 bpm feel), a wet reverb send swell (ConvolverNode with a short IR, or a pre-baked reverb tail to save CPU) and a comedic vocal (see section 3) stretched or pitched down for a "nooo"-style gag.
  4. *Whoosh out:* a forward whoosh, filter opens back up over ~200 ms, playbackRate returns to 1, music returns (or slams back in on a downbeat).
- Pitch the music too (`playbackRate` on the music source) for the classic tape-stop or slow-down gag, then hard-cut back. In emo/pop-punk this reads as a "breakdown". Alternatively keep the music running but low-passed, and drop a stinger on resume.
- CRI's advice implies authoring 2–3 dedicated slow-mo assets (slow crack, slow whoosh, heartbeat) rather than pitching the normal crack down; pitched-down short transients turn mushy.
- **Repetition control:** the first break of a run gets the full sequence; later breaks get progressively shorter versions, and slow-mo is skipped if the previous one was under ~3 s ago. This mirrors Sniper Elite 5's frequency options. A user setting for "slow-mo frequency" is cheap insurance.

### Gaps
- The search budget ran out before a source on the "inhale"/reverse-swell pre-impact technique or heartbeat usage in slow motion could be found; these are presented as conventional technique only.
- No primary (developer) source confirms Max Payne's or Superhot's specific filter settings.

## 3. Character voice: pain grunts, comedic reactions, variant counts, tie-in to facial expressions

### Takeaway
No sourced industry number exists for "how many grunt variants". The research does show that repetition becomes noticeable faster for distinctive, "improbable" sounds like voices, and that vocal effort makes voices louder, higher and more pressed. So Emonad's voice should be organized by intensity tier, gated by cooldowns, and carry far more variants for the frequent small reactions than for the rare big ones.

### Cited Findings
- The factors governing perceived repetition: total experience length, time between repeats of the same sound, and plausibility of the repetition, which is lower for complex or improbable sounds — [Sound in Games wiki: Variety](https://soundingames.dei.uc.pt/index.php/Variety)
- Physical effort tends to make the voice louder, higher-pitched and more "pressed"; evidence on intonation is mixed — [Anikin, PeerJ 2023](https://peerj.com/articles/14944.pdf)
- Overwatch's audio pillars include character voice-over that is descriptive (it carries gameplay information) — [PCGamesN](https://pcgamesn.com/overwatch/overwatch-devs-on-creating-a-game-you-can-play-by-sound-and-announcing-dolby-atmos-support)
- Kick the Buddy's "comical screams" are cited (by a fan article) as a core part of its appeal — [u-bordeaux hosted article](https://participation.u-bordeaux.fr/processes/FTLV/f/213/proposals/2204)
- Fall Guys' "Eliminated" sting is described as a short descending phrase, major key with a drooping final note. This comes from a meme blog, not the developer — [VoxBooster](https://voxbooster.com/blog/soundboard-meme-audios-fall-guys-eliminated/)

### Inferences
- **Variant budget (design inference, not sourced):**
  - Tier 1 "oof" (small hits, frequent): 12–20 variants, voiced only on about 1 in 3 eligible hits, with a 400–800 ms cooldown
  - Tier 2 "OW"/yelp (big hits): 8–12 variants
  - Tier 3 "BREAK" reactions (rarer, longer, funnier, e.g. a deadpan emo "...cool. that's my femur."): 10–20 one-liners, a shuffle bag with no repeat until all are used
  - Launch and flight: 6–10 "whee/aaaa" screams
  - Finale/landing: 5–8
  - Plus idle and emo sighs
  The "improbable sound" principle means the funniest lines need the largest pools or the lowest frequency.
- Use the effort research for intensity mapping: Tier 1 quiet, low and breathy; Tier 3 loud, high and strained. A single actor can record all tiers in one session. Record efforts at 3 intensities per line type.
- **Tie to faces:** drive the facial-expression state machine and the vocal tier from the same impact tier so they stay in sync (e.g. wince sprite + "oof"; eyes-X + scream; deadpan face + sarcastic line). Have one "current emotion" owner that throttles both.
- **Emo comedic character:** the deadpan, under-reacting voice (sighs, "ugh", monotone sarcasm) contrasted with over-the-top physics is a distinct joke, and Fall Guys' "punchline different every time" principle argues for physics doing the comedy and the voice punctuating it, not narrating every hit.
- Pitch-randomize voice variants only slightly (±0.5–1 semitone) so the character stays recognizable. Larger shifts read as different characters.

### Gaps
- No sourced industry guidance (GDC or postmortem) on the number of bark or effort variants per character; the search for one returned nothing relevant.
- No sources on facial-expression/voice synchronization systems in comedic ragdoll games.

## 4. Adaptive music (layers by speed/depth, stingers, finale drop) and emo / pop-punk / emo-rap licensing, including AI music terms as of 2026

### Takeaway
Use vertical layering (stems faded in by a smoothed depth/speed parameter) for continuous intensity, horizontal resequencing or quantized transitions for big state changes, and stingers for bone breaks and a "drop" at the finale. For licensing, there is no clean, sourced plug-and-play option for emo/pop-punk. Epidemic Sound requires a commercial tier and has reported game-claim friction. Suno's paid plans reportedly grant commercial use but no guaranteed copyright, with litigation ongoing. ElevenLabs Music's self-serve terms exclude commercial video games. Commissioning original stems is the lowest-risk path, though that route itself went unresearched (see Gaps).

### Cited Findings
**Adaptive structure**
- Vertical layering: one value (e.g. intensity) drives the mix of all layers at once, giving a continuous rise and fall. Example: calm = pad only; enemies spotted = rhythm layer fades in over 2 s; combat = melody and bass join — [IRPR Sound: Vertical layering](https://sounddesign.irpr.agency/glossary/vertical-layering/)
- Horizontal resequencing reorders or branches musical segments by game state, with transition rules such as next beat, next bar or a marked exit point — [IRPR Sound: Horizontal resequencing](https://sounddesign.irpr.agency/glossary/horizontal-resequencing/)
- Sackboy's team used stingers and musical embellishments to reward progress toward the goal — [Audiokinetic blog](https://blog.audiokinetic.com/how-to-use-interactive-music-to-score-gameplay/)
- Many games combine both: resequencing for large state changes, layering for finer intensity. Start with a base loop plus one intensity layer, and smooth the intensity parameter so the music doesn't flutter — [bugnet.io adaptive music guide](https://bugnet.io/blog/adaptive-music-a-beginners-guide); [Abratabia web game dynamic music](https://abratabia.com/web-game-audio/dynamic-game-music.php)

**Licensing: libraries**
- Epidemic Sound offers several license types (Creator, Pro, exclusive) on its game-development page, and lists Personal / Commercial / Enterprise plans; Personal is for non-commercial creators — [Epidemic Sound: music for video games](https://www.epidemicsound.com/game-development/music-for-video-games/)
- Community reports indicate "friction for game developers and streaming scenarios related to whitelisting and claims", and such uses may need custom licensing — [Airframe analysis of Epidemic Sound](https://www.airframe.ai/product/epidemicsound-com/analysis)
- A third-party review says Epidemic's single-track license covers indie games and apps (unverified against Epidemic's terms) — [Epidemic Sound review (Google Sites)](https://www.sites.google.com/site/videoblocksreview/best-royalty-free-music-wesites/epidemic-sound-review)
- No source confirmed pop-punk/emo specifically in Epidemic's catalogue.

**Licensing: AI music (as of 2026)**
- Suno: a 2026 explainer says Suno's August 2026 terms grant commercial rights to songs downloaded by paying subscribers, and none for free-tier downloads. Suno makes no promise that copyright will vest in any output, so you may hold a license without an enforceable copyright. This is a secondary source; Suno's live terms were not read — [Dubspot, 2026](https://blog.dubspot.com/ai-music-licensing-explained-2026)
- Udio: sources conflict. One says Udio terms limit output to personal, non-commercial use and downloads have been unavailable since October 2025, as Udio moves to a licensed "walled garden" where creations can't be downloaded or posted elsewhere. Another says Standard/Pro allow commercial use — [Dubspot](https://blog.dubspot.com/ai-music-licensing-explained-2026); [Dupple: Suno vs Udio](https://dupple.com/learn/suno-vs-udio)
- Litigation (secondary, conflicting): UMG and Warner settled with Udio in late 2025, and Warner settled with Suno in November 2025. Sony's case against Suno and Udio, and reportedly UMG's against Suno, were described as ongoing into mid-2026 — [Dubspot](https://blog.dubspot.com/ai-music-licensing-explained-2026); [Dupple](https://dupple.com/learn/suno-vs-udio)
- ElevenLabs Eleven Music: the docs say it is "cleared for nearly all commercial uses... from advertisements to gaming" — [ElevenLabs docs](https://elevenlabs.io/docs/overview/capabilities/music); [The Decoder](https://the-decoder.com/elevenlabs-launches-eleven-music-an-ai-music-generator-cleared-for-broad-commercial-use/). But the Eleven Music v1 Terms (updated 5 Aug 2025) list "commercial video games" among "Prohibited Commercial Contexts" for the Creator/Pro/Scale/Business plans; Enterprise is governed by separate agreements — [Eleven Music v1 Terms](https://elevenlabs.io/ja/eleven-music-v1-terms); [Eleven Music model-specific terms](https://elevenlabs.io/eleven-music-model-specific-terms). An August 2026 guide says self-serve excludes "film, TV, and Studio Games" while Enterprise covers all commercial use — [invideo blog](https://invideo.io/blog/elevenlabs-music-ai-generator/)
- ElevenLabs released a Music v2 with genre switching and section-level editing (May 2026) — [mer.vin](https://mer.vin/2026/05/elevenlabs-music-v2-genre-switching-ai-songs-with-section-level-editing/)

### Inferences
- **Structure for a descending-hell run:** 4 stems in one key and tempo (e.g. 150–170 bpm, typical of pop-punk; or a half-time trap feel for emo-rap):
  - L0: sad clean/arpeggiated guitar + 808 sub (menu/aim)
  - L1: trap hats + kick (launch)
  - L2: distorted power-chord guitars (depth > 33%)
  - L3: lead/gang vocals or a synth hook (depth > 66% or speed above threshold)
  Fade stems with `GainNode.setTargetAtTime` driven by a smoothed max(depth, speed) parameter.
- Stingers: bone-break stinger (a guitar "chug + cymbal choke" or 808 slide) quantized to the next 8th note. Finale (hitting bottom): stop the music for one beat of silence, then a full-band "drop" or breakdown with the final score count, the classic pop-punk "stop... and all in" move.
- **Web memory caveat (see section 5):** decoded stems are large (3 min stereo at 48 kHz ≈ 69 MB per stem), so use short looping stems (8–16 bars ≈ 15–30 s) decoded into AudioBuffers for sample-accurate sync, rather than full-length songs.
- **Licensing ranking (inference):**
  1. Commission an indie emo/pop-punk/emo-rap producer for an original stem pack under a written buyout or exclusive license (cleanest IP, stems by design)
  2. A library track with explicit "games/apps" coverage, confirmed in writing (Epidemic's own licensing team, given the reported claim friction)
  3. Suno paid tier: usable, but no guaranteed copyright, pending litigation, and brand risk if output resembles real emo artists; the crypto-meme context adds scrutiny
  4. ElevenLabs Music: only on Enterprise, given the "commercial video games" exclusion on self-serve
  Avoid Udio for shipping.
- Also avoid "in the style of [named band]" prompts or soundalikes for a crypto-meme brand; the reputational and legal exposure is high.

### Gaps
- The search budget ran out before searches on pop-punk/emo-specific royalty-free sources (Artlist, Pond5, itch.io packs, Bandcamp direct licensing), commissioning price norms, or Suno's primary terms page could run.
- No source verified the exact current state of the Sony/UMG v. Suno litigation as of October 2026.

## 5. Web Audio implementation on phones (iOS Safari unlock, latency, decoding/memory, sprites, pooling, master bus, libraries, codecs, silent switch/audioSession)

### Takeaway
Use raw Web Audio (or Howler for less code). Unlock the AudioContext synchronously inside a real touch handler and re-resume it on `visibilitychange`. Decode short SFX sprites into AudioBuffers once and play slices with `start(when, offset, duration)`. Keep music as short decoded loops or streamed media. On iOS Safari 16.4+, set `navigator.audioSession.type = "playback"` so the game is audible with the silent switch on. That stops the user's other audio, so offer an "ambient" option. Ship AAC/MP3 (or test Ogg Opus on iOS 18.4+) as the safe iOS format.

### Cited Findings
**Unlock and lifecycle (iOS Safari)**
- iOS has long required a user gesture to start an AudioContext or media element; a mic permission does not unlock output — [WebKit bug 177292](https://bugs.webkit.org/show_bug.cgi?id=177292)
- `resume()` must run inside the real gesture handler (touch/click), not from a timer or promise, or it is ignored. Check that `state === 'running'` before scheduling, and retry on the next gesture — [bugnet.io: AudioContext stuck suspended](https://bugnet.io/blog/how-to-fix-web-game-audio-context-stuck-suspended-on-mobile); [Matt Montag: unlock Web Audio in Safari](https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos)
- The iOS AudioContext can get stuck in the "interrupted" state with `resume()` failing (iOS 17.6 report). The workaround is to suspend then resume on `visibilitychange` when the page becomes visible — [WebKit bug 276016](https://bugs.webkit.org/show_bug.cgi?id=276016)
- Howler's default unlock plays an empty buffer on the first `touchend` (`Howler.autoUnlock`); handle `onplayerror` and retry after the `unlock` event — [howler.js README](https://github.com/goldfire/howler.js)

**Silent switch and Audio Session API**
- By default Web Audio uses an "ambient"-type session that is muted by the silent switch; setting the session type to "playback" prevents that — [WebKit bug 237322](https://auto-bugs.webkit.org/show_bug.cgi?id=237322); a WebKit maintainer confirmed "playback" helps with silent mode but said background behaviour needed more work — [WebKit bug 251532](https://bugs.webkit.org/show_bug.cgi?id=251532)
- AudioSession `type` values: auto (default), playback, transient, transient-solo, ambient, play-and-record — [W3C Audio Session](https://www.w3.org/TR/audio-session/). "playback" is for music/video/podcasts and is exclusive: it pauses other playback audio on the device (notifications may still play) — [MDN AudioSession.type](https://developer.mozilla.org/docs/Web/API/AudioSession/type)
- Support: Safari / iOS Safari 16.4 through 26.3 (latest in caniuse's snapshot) supported. Chrome and Firefox are not supported. The API is experimental and not Baseline, so feature-detect `'audioSession' in navigator` — [caniuse: AudioSession](https://caniuse.com/mdn-api_audiosession); [MDN navigator.audioSession](https://developer.mozilla.org/docs/Web/API/Navigator/audioSession)
- Caveat: with "transient"/"transient-solo" on iOS 17 (and reportedly iOS 18), an `<audio>` element kept "playing" silently. The bug was closed as invalid, so its status is unclear — [WebKit bug 264473](https://bugs.webkit.org/show_bug.cgi?id=264473)

**Latency**
- `AudioContext.outputLatency` (Chrome Android 102+) estimates the delay from handing a buffer to the OS until playback. `baseLatency` covers the context's internal processing. `latencyHint` can be requested at construction, but the browser may ignore it — [MDN outputLatency (mirror)](https://docs.w3cub.com/dom/audiocontext/outputlatency); [MDN baseLatency (mirror)](https://docs.w3cub.com/dom/audiocontext/baselatency)
- Chromium's Intent to Ship for outputLatency cites typical callback buffer sizes of 128 frames on macOS, 10 ms on Windows and 96 frames on Android — [blink-dev Intent to Ship](https://groups.google.com/a/chromium.org/g/blink-dev/c/dTQniJNVVMY/m/LKo0cx7-CwAJ)
- Summing baseLatency + outputLatency gives total latency for syncing visuals; Firefox's baseLatency is always 0 — [WebAudio issue #2467](https://github.com/WebAudio/web-audio-api/issues/2467); [web.dev: audio output latency](https://web.dev/articles/audio-output-latency)

**Decoding, memory, sprites**
- An AudioBuffer stores non-interleaved 32-bit float PCM, about duration × sample rate × channels × 4 bytes. A 60 s stereo 48 kHz clip is ~23 MB decoded. AudioBuffers are designed for snippets "typically less than 45 s"; longer audio suits MediaElementAudioSourceNode — [MDN AudioBuffer (mirror)](https://docs.w3cub.com/dom/audiobuffer)
- `decodeAudioData` works only on complete files, not fragments. Decoded data is resampled to the context's sample rate — [MDN decodeAudioData (mirror)](https://docs.w3cub.com/dom/baseaudiocontext/decodeaudiodata)
- An anecdote: decoding a 70.9 MB file used almost 10 GB in desktop Chrome, with warnings of hundreds of MB and seconds of CPU and battery on mobile — [jessuni blog](https://jessuni.typlog.io/2019/why-generating-waveform-for-a-large-audio-file-may-not-be-a-good-thing)

**Libraries**
- Howler.js defaults to Web Audio with an HTML5 Audio fallback. It offers sprites, fades, rate, spatial plugin, per-sound/group/global control and a `pool` option (default 5) recycling inactive sounds. It is "as light as 7kb gzipped", and `html5: true` streams large files. The README's copyright reads 2013–2021, so check its maintenance cadence — [howler.js GitHub](https://github.com/goldfire/howler.js)
- Comparisons: Howler is for playback and mobile unlock; Tone.js is a DAW-grade music framework (transport, synths) with a larger footprint; raw Web Audio has no dependency and full scheduling control but means handling many edge cases yourself — [pistack comparison, Aug 2026](https://www.pistack.xyz/posts/2026-08-23-javascript-audio-libraries-howler-tonejs-wavesurfer-comparison/); [dinogame.gg Howler guide](https://dinogame.gg/blog/how-to-use-howler-js-audio/)

**Codecs on iOS Safari**
- An MDN content PR states that Safari 18.4+ (macOS 15.4+, iOS/iPadOS 18.4+, visionOS 2.4+) supports Opus and Vorbis in Ogg containers — [MDN content PR #39592](https://github.com/mdn/content/pull/39592). A French Mac outlet reported in February 2026 that Apple "quietly" added Ogg Vorbis native playback in macOS/iOS. The date discrepancy is unresolved — [MacGeneration, Feb 2026](https://www.macg.co/macos/2026/02/apple-ajoute-le-support-de-logg-vorbis-en-douce-dans-macos-et-ios-avec-une-lecture-native-306585)
- Independent testing says Ogg Opus support in Safari 18.4 is "incomplete, buggy, and far behind Firefox and Chrome" (e.g. MediaRecorder Ogg/Opus fails) — [frequal.com](https://frequal.com/java/OggOpusStillNotWorkingInSafari18_4.html)
- History: Safari 15 added WebM Opus for `<audio>` but not for `decodeAudioData` — [WebKit bug 226922](https://bugs.webkit.org/show_bug.cgi?id=226922). On iPadOS 15.4 the reverse was observed (decodeAudioData worked, `<audio>` didn't) — [WebKit bug 238546](https://bugs.webkit.org/show_bug.cgi?id=238546). Opus in an MP4 container plays via AVPlayer on iOS 17 but not 15 (developer report) — [Apple Developer Forums](https://developer.apple.com/forums/thread/775937)
- Howler's README recommends WebM with an MP3 fallback, listing sources in order of preference — [howler.js GitHub](https://github.com/goldfire/howler.js)

### Inferences
- **Recommended architecture (raw Web Audio, ~300–500 lines, or Howler if speed matters more than control):**
  - **Graph:** `sources → per-category GainNodes (sfx, voice, music, ui) → sfx bus BiquadFilter (for the slow-mo low-pass) → master GainNode → DynamicsCompressorNode (as a safety limiter: threshold ≈ -6 to -10 dB, ratio 12–20, fast attack ~3 ms, release ~100–250 ms) → destination`. A master compressor/limiter is general Web Audio practice; it was not sourced this session. It prevents clipping when many impacts and a voice stack in one frame, a real risk with ragdoll multi-contact collisions.
  - **Voice management:** a global cap of ~16–24 simultaneous one-shots. Steal the quietest or oldest when over the cap, with per-category caps (e.g. ≤6 impact ticks, ≤2 voice, 1 BREAK). AudioBufferSourceNodes are single-use, so "pooling" in Web Audio means pooling the gain/panner chains and capping counts, not reusing sources.
  - **Sprites:** one SFX sprite per category (impacts, voice, UI) as compressed files. Decode each once at load, then `src.start(ctx.currentTime, offset, duration)`. Keep SFX mono to halve decoded memory. Total decoded SFX budget is ~20–40 MB (inference; iOS memory pressure kills tabs).
  - **Unlock:** on the first `pointerup`/`touchend` (the slingshot tutorial tap), synchronously call `ctx.resume()`, set `navigator.audioSession.type` if supported, and start a 1-sample silent buffer. Re-run on `visibilitychange` → visible, and handle the iOS "interrupted" state.
  - **Silent switch:** default to `"playback"` while in a run so the game is audible on muted iPhones (most players keep the switch on silent). Because "playback" pauses the user's Spotify, offer a "Mix with my music" toggle that sets `"ambient"` and mutes in-game music.
  - **Latency:** request `latencyHint: "interactive"`. Fire audio on the physics contact frame, not the next render. Use `outputLatency + baseLatency` (where available) to shift haptic/visual hits if a device shows a consistent lag.
- **Formats (Oct 2026):** given contradictory Ogg Opus reports on Safari, the low-risk choice is AAC-in-M4A (or MP3) for iOS and Opus (WebM/Ogg) for Chromium. Choose by `canPlayType` and confirm by trying `decodeAudioData` with a fallback. A single AAC set for all is acceptable at small SFX sizes. For seamless music loops, MP3/AAC encoder padding can cause gaps (general knowledge, unsourced): trim loop points in code with `loopStart`/`loopEnd` or use Opus where it decodes.
- **Tone.js** is only worth it if the music is generated or sequenced at runtime. For stem layering plus stingers, raw `AudioBufferSourceNode.start(when)` at quantized times is sufficient and smaller.
- **ZzFX** (section 7) can generate UI blips and cartoon sweeteners at runtime with no asset download.

### Gaps
- No measured real-device Web Audio output latency figures (ms) for iPhone Safari or Android Chrome were found.
- No sourced iOS Safari per-tab audio memory limit; the budget above is an inference.
- Sources on DynamicsCompressorNode master-bus settings for web games were not retrieved (search budget exhausted).
- Whether `navigator.audioSession` behaviour changed in iOS 26.4+/iOS 27 was not verified; caniuse's snapshot listed support only up to Safari 26.3.

## 6. Haptics: Vibration API, the iOS switch trick (and its iOS 26.5 break), impact patterns, annoyance/battery limits, Apple and Android guidance

### Takeaway
On Android Chrome, `navigator.vibrate()` works after a user gesture and should be used sparingly, with short crisp pulses scaled by impact tier. On iOS there is no Vibration API. The `<input type="checkbox" switch>` system-haptic trick worked from script on iOS 17.4–26.4, but iOS 26.5 (2026) patched it: only a *real finger tap* on a switch now fires a single system tick. On current iPhones, in-game impacts (which are not taps) therefore cannot trigger haptics from a web page. The only reliable iOS haptic is on the player's slingshot release tap.

### Cited Findings
**Vibration API**
- Implemented in Chromium-based browsers; Firefox removed its implementation in version 129; WebKit has published an opposing position — [W3C Vibration API](https://www.w3.org/TR/vibration/); [caniuse: Vibration](https://caniuse.com/vibration)
- caniuse lists Safari on iOS as unsupported through 26.3, and lists current Chrome for Android (143) as supported. caniuse tracks only the latest Android Chrome version, so this does not indicate a start version — [caniuse: Vibration](https://caniuse.com/vibration)
- All iOS browsers use WebKit, so Chrome/Firefox on iOS also lack vibration; the call returns false without vibrating — [bugnet.io: vibrate not available on iOS](https://bugnet.io/blog/fix-web-game-vibrate-api-not-available-ios-safari)
- Sticky user activation is required (the user must have interacted with the page). A `true` return does not guarantee hardware vibrated — [MDN vibrate (mirror)](https://docs.w3cub.com/dom/navigator/vibrate); [bugnet.io](https://bugnet.io/blog/fix-web-game-vibrate-api-not-available-ios-safari)

**iOS switch haptic trick**
- Toggling a WebKit `<input type="checkbox" switch>` (switch element introduced in Safari 17.4) triggers the system haptic. Libraries create a hidden label+switch, programmatically click the label, then remove them — [ios-haptics (npm)](https://www.npmjs.com/package/ios-haptics); [azukiazusa.dev](https://azukiazusa.dev/en/blog/ios-safari-web-haptics)
- ios-haptics: "only works on iOS 17.4 to 26.4, as apple patched it in ios 26.5" — [ios-haptics (npm)](https://www.npmjs.com/package/ios-haptics); [iOS Haptics Tester](https://rapidtoolset.com/en/tool/ios-haptics-tester); developer report: "apple silently patched web-haptics in Safari 26.5 and it no longer works at all" — [@pugson on X](https://x.com/pugson/status/2038938647991337433)
- Mechanism (community analysis): a WebKit change (cited as commit fc1ef83, bug 309082) makes a programmatic `label.click()` reach the switch as an untrusted click (`isTrusted: false`), "and an untrusted click fires no haptic". Only a real finger on a switch or its label triggers the Taptic Engine. The workaround `attach()` overlays a transparent label wired to a hidden switch on the tapped element. It was verified on Safari 26.6.1, and "the first haptic requested during that tap uses the trusted click" — [tappt PR #5](https://github.com/mxerf/tappt/pull/5)
- Project Fathom (verified on iOS 26.5): "only a direct tap fires the haptic — it can't be triggered from script anymore". The switch must be invisible (`opacity: 0`) over the button, sized 100%, and use `clip-path` for hit-testing. Stripping the native appearance "disables the haptic". "System tick only — not custom Core Haptics waveforms." It lists the haptic as Safari 17.4 / iOS 18+ — [Project Fathom](https://github.com/m1ckc3s/project-fathom). (Minor conflict: ios-haptics says 17.4+.)
- On iOS 26.5+, multi-segment haptic presets fire only their first tick — [haptics-web](https://haptics-web.vercel.app/). Some projects removed the hidden-switch trick entirely in favour of real styled switches — [TurfCut PR #35](https://github.com/whiterican/TurfCut/pull/35)

**Platform guidance**
- Android: "less is more". Too much vibration is annoying and numbing, and users may turn off all haptics. Prefer clear (crisp, discrete, button-like) haptics; rich haptics need wide-bandwidth actuators and a fallback. Given the choice between buzzy haptics and none, choose none — [Android: Haptics design principles](https://developer.android.com/develop/ui/views/haptics/haptics-principles)
- Android timing: a good click lasts 10–20 ms, and the actuator can ring 20–50 ms after a 20 ms input. Long legacy one-shot vibrations feel buzzy, especially on low-end actuators. Frequent events should be very subtle and important events stronger; ramp amplitude toward a target. "We strongly recommend co-design of visual, audio, and haptic effects"; out-of-sync haptics feel broken — [Android: Haptics design principles](https://developer.android.com/develop/ui/views/haptics/haptics-principles); [AOSP haptics UX foundation](https://source.android.com/docs/core/interaction/haptics/haptics-ux-foundation)
- Apple HIG: haptics engage touch alongside visual and audio feedback. A haptic that doesn't reinforce a cause-and-effect relationship "can be confusing and seem gratuitous" (its example concerns a game character failing a task) — [Apple HIG: Playing haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics). Apple's WWDC19 "Designing Audio-Haptic Experiences" presents haptics combined with audio for realism in apps and games — [WWDC19 session 810](https://developer.apple.com/videos/play/wwdc2019/810)

### Inferences
- **Android Chrome patterns** (web vibrate has on/off durations only, no amplitude, so "strength" = duration and pulse count). Keep pulses ≤ 40 ms per Android's buzzy-vibration warning:
  - tick (graze): none, or 8–10 ms, max ~1 per 150 ms
  - thud (body hit): 15–20 ms
  - slam (big obstacle): 30–40 ms
  - BREAK: `[35, 40, 15]` (pulse–gap–aftershock) fired on the hit-stop frame
  - slow-mo heartbeat: `[20, 120, 12]` once
  - finale landing: `[50, 60, 30, 60, 20]`
  - launch release: 12 ms
  Use a global haptic budget (e.g. ≤ 1 haptic per 100 ms, ≤ ~3 per second), skip ticks during slow-mo, and keep a settings toggle (default on, persisted). Call `navigator.vibrate(0)` to cancel when pausing or backgrounding.
- **iOS (Oct 2026):** treat haptics as an Android-only enhancement for in-game impacts. On iOS 26.5+, wrap the slingshot "release" control (and menu buttons) in a native switch overlay so the release tap gives one system tick. That is the only trusted-tap moment the game gets. It is one tick per tap, so no BREAK patterns. iOS 17.4–26.4 devices could still use the scripted trick for impacts, but those are a shrinking population (inference). Compensate on iOS with stronger audio-visual punch (hit-stop, screen shake, sub-bass "thump" layer in the BREAK stack, which phone speakers render weakly but earbuds do not).
- Since slingshot release fires on touch-end (toggle happens on click), a switch overlay naturally aligns its tick with the launch, a good cause-and-effect pairing per Apple's HIG.
- **Native wrapper option:** if the game is later wrapped (Capacitor/WKWebView or TWA), native Core Haptics / Android VibrationEffect primitives (e.g. impact light/medium/heavy) become available. That is the only path to real impact haptics on iPhone (general platform knowledge, unverified this session).

### Gaps
- No source on iOS 27 (expected September 2026) behaviour of the switch haptic; all 26.5 evidence is community-reported, with no Apple release note found.
- No data found on battery cost of web vibration or on user annoyance thresholds in games beyond Android's qualitative guidance.
- The Apple HIG page body could not be fully read; only extracted quotes were available.
- Whether Chrome blocks `navigator.vibrate` inside cross-origin iframes (relevant if the game is embedded) was not verified this session.

## 7. Sound sources: Sonniss GDC bundles, Freesound, Kenney, Epidemic, and procedural/synth (jsfxr, ZzFX)

### Takeaway
For a small, commercially safe palette, start from the Sonniss GDC bundles (free, royalty-free, no attribution; no standalone resale, no AI training), Kenney (CC0), and Freesound filtered to CC0 (or CC-BY with credits; never CC-BY-NC). Use ZzFX (<1 KB, MIT) for runtime-generated cartoon blips and sweeteners. Record a small amount of custom Foley (celery snaps, walnut cracks, bonks) and voice for the signature BREAK sound and Emonad's voice.

### Cited Findings
- Sonniss released a free GDC 2026 Game Audio Bundle: royalty-free sounds from 17 vendors, 7.47 GB+, no attribution required, usable on unlimited projects for life — [Rekkerd](https://rekkerd.org/sonniss-releases-gdc-2026-game-audio-bundle/). The full multi-year archive is reported at 200+ GB — [Cinevva guide](https://app.cinevva.com/guides/free-sound-effects-music)
- Sonniss restrictions: no reselling or redistributing sounds as standalone files or in competing libraries; they may ship only inside a finished project (game, film, app) — [licenseorg.com](https://licenseorg.com/guide/music-audio/sonniss). AI/ML training is prohibited — [Zeli](https://zeli.app/en/story/49262841). Demand was high enough that Sonniss distributed via BitTorrent, with direct downloads limited to 100 per 24 h — [TouchArcade](https://toucharcade.com/?p=166172). The license text itself was not read (sonniss.com was blocked).
- Freesound licensing is per file (CC0, CC-BY, CC-BY-SA, CC-BY-NC). CC-BY-NC can't ship in a commercial game, CC-BY needs a credit line, and CC0 needs no credit. Search can be filtered to CC0, and downloads need a free account — [Cinevva: game asset licenses](https://app.cinevva.com/guides/game-asset-licenses.html); [Freesound FAQ, 2016 archive](https://web-archive.nli.org.il/National_Library/20160526010038mp_/https://freesound.org/help/faq)
- Kenney: all asset packs, including audio, are CC0 and usable commercially; credit is optional (the Kenney logo is separately restricted) — [gtstu.com](https://gtstu.com/?p=5011); [Cinevva](https://app.cinevva.com/guides/free-sound-effects-music)
- Epidemic Sound (also sells SFX): commercial use needs a commercial tier, and game-claim friction has been reported — [Epidemic Sound](https://www.epidemicsound.com/game-development/music-for-video-games/); [Airframe](https://www.airframe.ai/product/epidemicsound-com/analysis)
- ZzFX: "less than 1 kilobyte when compressed", 20 parameters, MIT license. It synthesizes into an AudioBuffer at runtime via Web Audio; sounds can be precached. There is a web designer tool at killedbyapixel.github.io/ZzFX, and music via ZzFXM — [ZzFX GitHub](https://github.com/KilledByAPixel/ZzFX); [zzfx npm](https://npmjs.com/package/zzfx); [ZzFXM](https://keithclark.co.uk/articles/zzfxm/). The ZzFXMicro build is ~880 bytes — [npmtrends](https://www.npmtrends.com/zzfx)
- jsfxr: an informal Hacker News comment says the npm package changed hands in 2022 and is now a fork, which is unverified — [HN via hn.svelte.dev](https://hn.svelte.dev/item/44721932)

### Inferences
- **Sourcing plan:**
  - Impacts, debris, whooshes and reverse swells: Sonniss GDC bundles (also mine the Foley, body-fall, punch and cartoon libraries)
  - UI/coins and cartoon sweeteners: Kenney + ZzFX
  - Gap-fill: Freesound CC0 only
  - Custom Foley (one afternoon with a phone or recorder): celery/carrot snaps, walnut cracks, knuckle cracks, cardboard tube bonks, rubber-glove squeaks, slide whistle
  - Voice: one voice actor (or the developer) recording Emonad efforts at 3 intensities
  Keep a license manifest (file → source → license) in the repo.
- The BREAK signature sound should be custom (recorded + layered), since it is the brand's audio identity. Library sounds risk being recognized from other games.
- Use ZzFX for anything that benefits from infinite variation at zero bytes: coin/score ticks whose pitch climbs with the "number" going down, combo blips, cartoon "boing" sweeteners with randomized parameters. It is not suited to realistic cracks or voices.
- **Bundle size:** about 60–100 short mono SFX at ~32–64 kbps AAC/Opus fits in ~1–2 MB. Music stems as short loops are ~1–3 MB compressed. Load music after first interaction to keep first paint fast (inference).

### Gaps
- Sonniss, Freesound and Kenney license texts were not read directly (domains blocked); terms are from secondary summaries and an archived 2016 Freesound FAQ. Verify on the live sites.
- No source confirmed jsfxr's size or current maintainer status.
- No pricing data for Epidemic Sound's commercial or game tiers as of October 2026.
