# Ragdoll Animation Quality: Making Emonad Look Alive, Funny and Satisfying

Research context (read first): Researched 14 Oct 2026. Midway through, the shared web-search budget ran out and the sandbox proxy blocked direct fetches of most non-GitHub sites (gamedeveloper.com, mocaponline.com, killscreen.com, wikipedia.org, GDC Vault). So the findings come from two kinds of source. (a) Search-result summaries of pages that could not be opened in full; these are marked "(search summary)" and are secondhand. (b) Primary source code and docs on GitHub that were read in full: Unity's built-in Ragdoll Wizard, Jolt Physics, Bullet, cannon-es, Godot docs, three-vrm, the GTA V Euphoria message wrapper and open-source active-ragdoll projects. Concrete tuning numbers come almost entirely from (b). Topics I could not source (Burnout Aftertouch, Skate bail steering, TLOU/Halo hit reactions, Party Animals/TABS/Exanima/Toribash internals, X-ray break cams) are listed under Gaps rather than filled in from memory.

## 1. Euphoria / NaturalMotion: how its behaviours worked, and which parts are cheap enough to copy in a browser

### Takeaway
Euphoria was a library of named, parameterised "behaviours": short controllers that set per-joint muscle stiffness and pose targets for a physical ragdoll, such as brace for impact, catch fall, windmill the arms, pedal the legs, writhe, curl up and grab. It was layered on the game's own physics and freely used "cheat" forces and torques. The expensive part (full-body balance and an optimised nervous system) is not needed for a falling character. The cheap part is a small library of pose targets plus per-joint strength, switched by simple triggers like time-to-impact or airborne. That part is exactly what makes a tumbling body read as alive.

### Cited Findings
- Euphoria's first commercial title was GTA IV (Rockstar). It also shipped in Max Payne 3 and in Backbreaker, where it generated tackles in real time (search summary of Wikipedia) — [Wikipedia: Euphoria (software)](https://en.wikipedia.org/wiki/Euphoria_(software))
- NaturalMotion showed Euphoria privately at GDC 2006. I found no public recording of that showing (search summary) — [Game Developer: NaturalMotion To Launch Euphoria](https://www.gamedeveloper.com/game-platforms/naturalmotion-to-launch-euphoria-real-time-anim-technology)
- In 2007 Torsten Reil (NaturalMotion CEO) demonstrated Euphoria as the runtime animation technology Rockstar used for interactive sequences in GTA IV (search summary) — [CGW, SIGGRAPH 2007](https://cgw.com/Press-Center/Siggraph/2007/NaturalMotion-Exec-Discusses-Euphoria.aspx)
- 2008 coverage described Euphoria as giving characters a "muscular and nervous system" that interacts with physics and AI. Examples: drunk staggering and falling, generated in real time rather than from canned animations (search summary) — [VidaExtra, GDC 2008](https://www.vidaextra.com/ps3/gdc-2008-el-motor-euphoria-dotara-de-mayor-realismo-a-gta-iv). Liberty City residents keep balance and dodge hazards on their own (search summary) — [Computerwoche](https://www.computerwoche.de/article/2701332/euphoria-meistert-simulierte-bewegungsablaeufe.html)
- Reil (Max Payne 3 interview): Euphoria runs on top of Rockstar's RAGE engine and controls the physical characters (search summary) — [TechRadar: The technology of Max Payne 3](https://www.techradar.com/news/gaming/the-technology-of-max-payne-3-1082751)
- GTA V's Euphoria message set, as wrapped by ScriptHookVDotNet, names the behaviour vocabulary directly. It includes ActivePose, AnimPose, ArmsWindmill, ArmsWindmillAdaptive, BalancerCollisionsReaction, BodyBalance, BodyFoetal, BodyRelax, BodyRollUp, BodyWrithe, BraceForImpact, CatchFall, Dangle, Electrocute, FallOverWall, Grab, HeadLook, HighFall, InjuredOnGround, OnFire, PedalLegs, RollDownStairs, SmartFall, StaggerFall, StayUpright, Teeter, the Shot* family (ShotFallToKnees, ShotShockSpin, ShotSnap, ShotInGuts, ShotFromBehind) and configuration messages (ConfigureLimits, ConfigureSoftLimit, ConfigureShotInjuredArm, ConfigureShotInjuredLeg, SetMuscleStiffness, SetCharacterStrength, SetCharacterDamping, SetFrictionScale, ForceToBodyPart, ApplyImpulse, LeanInDirection, HipsLeanInDirection) — [scripthookvdotnet Euphoria.cs](https://github.com/scripthookvdotnet/scripthookvdotnet/blob/main/source/scripting_v3/GTA.NaturalMotion/Euphoria.cs)
- The same source documents ShotShockSpin as "configure the shockSpin effect in shot. Spin/Lift the character using cheat torques/forces". So Euphoria itself used non-physical helper forces for drama — [Euphoria.cs](https://github.com/scripthookvdotnet/scripthookvdotnet/blob/main/source/scripting_v3/GTA.NaturalMotion/Euphoria.cs)
- SetMuscleStiffness is documented as "use this message to manually set the muscle stiffness values before using Active Pose to drive to an animated pose". In other words, Euphoria blended stiffness-controlled physics toward animation poses. SmartFall is "Clone of High Fall with a wider range of operating conditions" — [Euphoria.cs](https://github.com/scripthookvdotnet/scripthookvdotnet/blob/main/source/scripting_v3/GTA.NaturalMotion/Euphoria.cs)
- A fan mod reports Max Payne 3 "brace fall" tunables. It also reports that in high falls, peds keep their hands raised, as in Red Dead Redemption. This is fan-made and secondhand (search summary) — [GTA5-Mods Euphoria mod](https://www.gta5-mods.com/misc/naturalmotion-euphoria-oiv-kaai210-bravercoolio-jedijosh920)
- I could not find a GDC talk specifically on Euphoria's bracing or protective-arm behaviours (search summary) — see the search notes above.

### Inferences
- **Copy the vocabulary, not the engine.** For a limp tumbling mascot, about six cheap "behaviours" give most of the Euphoria look. Each is just (target pose per joint, strength per joint, trigger):
  1. **Airborne flail ("HighFall" = ArmsWindmill + PedalLegs).** While airborne for more than ~0.3 s, shoulders follow a slow circular target (about 1–2 Hz, opposite phase per arm) and hips/knees follow a bicycle target, at only 10–25% strength. This is the single biggest "alive" signal during a long vertical fall.
  2. **BraceForImpact / protective arms.** Each physics step, raycast or sweep along the pelvis velocity. When time-to-impact is under ~0.15–0.25 s, drive the shoulders and elbows so the hands reach toward the contact point in front of the head, at 30–50% strength. Drop strength to near 0 on contact so the arms crumple. Reaching then failing is funnier than a perfect brace.
  3. **Foetal / RollUp after a big hit.** Briefly pull knees and elbows in (strength 20–40% for ~0.3 s), then release. It reads as "ow".
  4. **HeadLook.** A weak neck target (5–10%) toward the next obstacle or the camera. It sells awareness cheaply.
  5. **Writhe / InjuredOnGround at the end.** Low-strength noise targets on the spine, legs and broken limb while lying down, plus a facial blendshape.
  6. **Cheat torques.** Like ShotShockSpin, add small authored angular impulses to the pelvis or chest on big hits to make tumbles spin readably. Euphoria did it too.
- All of these cost a handful of vector maths per joint per step, plus at most one or two raycasts per step. They are well within phone budgets for one character with about 11–15 bodies.
- Skip full balance controllers (BodyBalance, StayUpright, StaggerFall). Emonad never needs to stand under physics, so the get-up should be animation-driven (see section 7).

### Gaps
- No primary NaturalMotion/Rockstar technical talk on BraceForImpact/CatchFall internals (parameters, timing) was reachable. The parameter-level docs for each helper live in separate files I could not fetch.
- I found no source to confirm the Star Wars: The Force Unleashed details (for example stormtroopers grabbing each other). The only hit was a GamesRadar headline, "GTA IV to employ Star Wars tech?" ([GamesRadar](https://gamesradar.com/gta-iv-to-employ-star-wars-tech)), with no readable content. RDR1/RDR2 Euphoria specifics were not found either.

## 2. Active ragdolls: PD controllers / joint motors, strength blending, hit reactions, and indie examples

### Takeaway
The standard architecture is two skeletons. An animated "target/master" skeleton plays an animation or procedural pose. A physical "ragdoll/slave" skeleton follows it through per-joint motors (angular drives, PD torques). Optional root or limb forces are added for position matching. Everything is scaled by a per-bone "strength" that drops instantly on contact and recovers over time. Indie wobbly games (Gang Beasts, Human: Fall Flat, Octodad, TABS) are this same architecture with low strength, crude balance forces and few or no keyframes.

### Cited Findings
- **Architecture.** A parent object holds an animated body (hidden, Animator set to "Always animate") and a physical duplicate. In the duplicate, every body part has a Rigidbody connected by ConfigurableJoints whose angular drive Target Rotation is set to the matching animated bone's rotation each step — [sergioabreu-g/active-ragdolls README](https://github.com/sergioabreu-g/active-ragdolls); [Medium tutorial](https://sergioabreu-g.medium.com/how-to-make-active-ragdolls-in-unity-35347dcb952d)
- **Concrete PD defaults (EggyStudio Unity active ragdoll).** PForce 8 (range 0–160), DForce 0.01 (range 0–0.064), maxForce 10, maxJointTorque 2000, jointDamping 0.6, Rigidbody drag 0.1, angular drag 0, maxAngularVelocity 1000. The PD signal is `P * (error + D * (error - lastError) / fixedDeltaTime)` on the world centre-of-mass error, plus joint slerp-drive targetRotation for orientation. Strength control: looseStrengthLerp 1.0 (instant loss on contact), gainStrengthLerp 0.05 per step (slow regain), minContactForce 0.1 and minContactTorque 0.1 (10% floor while colliding), deadTime 4.0 s. A state machine has Following Animation / Losing Strength / Gaining Strength / Dead, and a LayerMask stops self-contact from causing weakness — [AnimationFollowing.cs](https://github.com/EggyStudio/Unity.Humanoid.ActiveRagdoll/blob/main/Editor/AnimationFollowing.cs); [SlaveController.cs](https://github.com/EggyStudio/Unity.Humanoid.ActiveRagdoll/blob/main/Editor/SlaveController.cs); [README](https://github.com/EggyStudio/Unity.Humanoid.ActiveRagdoll)
- **The same contact-weakening idea in Rust.** Quaternion PD torques. Strength attenuates smoothly during contact (`loose_strength_lerp`) and recovers on release (`gain_strength_lerp`) (search summary) — [active-ragdoll-rs](https://github.com/bhubbard/active-ragdoll-rs)
- **Hairibar.Ragdoll** replaces PD gains with two artist-friendly parameters:
  - **Alpha (0–1)** is stiffness. 1 reaches the target in one physics step; 0 is pure physics. "Low values differ much more visibly than high ones", so prefer the lower of two similar-looking values for stability.
  - **Damping ratio (0–1).** 0 is undamped, 1 is critically damped; in-between values give wobble.
  - **Per-bone power profiles:** Kinematic, Powered or Unpowered. Partial ragdolls work, but children of an unsimulated bone must also be unsimulated.
  - **Matching spaces:** position is matched in world space and rotation in local space, so the pose can still deform.
  - **RagdollCollisionReaction** temporarily lowers alpha on bones in contact, "which prevents the vibration caused by fighting a collider".
  - **RagdollPowerOnTransitioner** ramps alpha up gradually after a snapped pose.

  [Hairibar.Ragdoll](https://github.com/hairibar/Hairibar.Ragdoll)
- **Jolt Physics** has both drive modes built in. `DriveToPoseUsingMotors(pose)` activates each constraint's motor; an overload takes previous and current poses plus dt to drive target velocity too. `DriveToPoseUsingKinematics(pose, dt)` sets body velocities so the ragdoll reaches the pose in dt — [Jolt Ragdoll.h](https://github.com/jrouwe/JoltPhysics/blob/master/Jolt/Physics/Ragdoll/Ragdoll.h)
- A Unity physical-animation guide suggests tweening angular drive strength from normal to 0 over 0.15–0.25 s to go from animation to physics, and the reverse to recover (search summary; page not fetchable) — [mocaponline ragdoll guide](https://mocaponline.com/blogs/mocap-news/ragdoll-physics-animation-guide)
- An Unreal approach: a custom anim node drives joint motors toward the animation pose (search summary) — [AnimMotion: How To Implement Active Ragdoll](https://peyman-mass.blogspot.com/2018/01/how-to-implement-active-ragdoll.html)
- **Naughty Dog, Uncharted 4 (GDC 2017, Michal Mach, "Physics Animation in Uncharted 4").** A layer of physics simulation sits on top of gameplay animation "for added fluidity and momentum", partly to save production time by making fewer assets. A physics programmer found a way to drive physics objects with animation "more predictably, with minimal distortions and strong artistic control" (search summary of GDC announcement) — [GDC news](https://www.gdconf.com/news/see-naughty-dog-deconstruct-uncharted-4s-physics-animation-gdc-2017)
- "Games like Gang Beasts, Human: Fall Flat, Octodad, or Totally Accurate Battle Simulator all use some sort of external forces to balance their characters" (search summary) — [Medium: Balancing of Active Ragdolls](https://medium.com/@jacasch/balancing-of-active-ragdolls-in-games-367f146b25fb)
- **A Human: Fall Flat developer on Steam:**
  - Gang Beasts and Octodad were the triggers that showed a fully active 3D ragdoll was possible.
  - Once keyframes were removed and the animation went fully procedural, their character looked much like Gang Beasts, even after several rewrites.
  - They guessed this is partly down to how Unity handles physics and joints.

  (Forum post, search summary) — [Steam discussion](https://steamcommunity.com/app/477160/discussions/0/358417008729560708/). TheGamer claims Gang Beasts uses "the same physics system" as HFF, which conflicts with the developer's "same engine behaviour" explanation and is unconfirmed — [TheGamer](https://www.thegamer.com/games-to-play-if-you-like-human-fall-flat/)
- HFF creator Tomas Sakalauskas: it is "difficult to make really big triple-A productions relying on just physics because it could go totally sideways" (search summary) — [TheGamer interview](https://www.thegamer.com/risky-human-fall-flat-big-games-simple-physics/)

### Inferences
- **For Emonad, use a "mostly limp, faintly alive" active ragdoll.**
  - Global strength around 0.1–0.25 while tumbling. Behaviour targets come from section 1, not mocap.
  - On every hard contact, drop the touched limb's strength to 0 and the whole body's to ~0.05 at once (Eggy-style instant loss).
  - Recover over ~0.4–1.0 s. Eggy's 0.05/step at 60 Hz is about a 0.3 s time constant.
  - Keep the head and spine slightly stronger than the limbs so the silhouette stays readable while the arms and legs flop.
- Use motor-based rotation targets only (local rotations). Do not add world-position matching forces during tumbling. Position-matching forces fight gravity and make the body look puppeted, which suits standing characters (Hairibar, Eggy) but not a falling one.
- Treat "power profiles" as the main authoring tool:
  - "Launch": arms Kinematic or Powered, high alpha.
  - "Freefall": all Powered at low alpha.
  - "Impact": all Unpowered for ~0.2 s.
  - "Broken": the broken chain is Unpowered permanently.
  - "Outro": blend to an animation (section 7).
- Partial ragdoll (Halo/Uncharted style) is less relevant because Emonad is fully physical between launch and outro. It does fit the slingshot hold: upper body Kinematic, legs Powered and dangling.

### Gaps
- I could not reach primary material on The Last of Us, Halo partial ragdoll, Party Animals, TABS "wobbler" tech, Exanima, Toribash or Rag Doll Kung Fu. The search budget ran out before those queries.
- I found no published PD gains from a shipped AAA title.

## 3. What makes a ragdoll funny (floppiness, mass, heads, secondary motion, faces, timing; Turbo Dismount and Skate)

### Takeaway
Comedy comes from readable, physical, slightly sympathetic failure. That means a simple, readable figure whose motion carries the joke; a character who seems to try (clinging, bracing) and fail; consequences you can measure and replay (slow-mo replays, injury tallies, skeleton read-outs); and contrast between a light tone and violent physics. Floppiness alone is not funny. A body that is visibly trying, then fails at the right moment, is funny.

### Cited Findings
- **Turbo Dismount (Secret Exit).** CEO/designer Kahrama described Mr. Dismount as "an abstraction of a human figure" rather than a crash-test dummy. The simplified visual style keeps attention on the movement. The team deliberately built sympathy: Mr. Dismount clings to his vehicles so he seems to be "holding on for dear life" (search summary of Kill Screen article "Why are ragdoll physics so funny?") — [Kill Screen](https://killscreen.com/why-are-ragdoll-physics-so-funny)
- Turbo Dismount crashes depend on speed, weight and gravity. They are watched on "hilarious slow-motion replays", and launch posture affects outcomes (search summary) — [TouchArcade GDC 2014](https://toucharcade.com/2014/03/21/gdc-2014-turbo-dismount/). Reviewers called it a light-hearted physics sim that "just happens to feature high speed collisions and dismemberment" and that holds back on blood and guts (search summary) — [Wikipedia: Turbo Dismount](https://en.wikipedia.org/wiki/Turbo_Dismount)
- Turbo Dismount 2 was announced in August 2024 with a webcam face-capture feature, putting the player's own face on the figure. Japanese press report it launched on Steam on 14 March 2026 to "overwhelmingly positive" reviews (search summary) — [Automaton 2024](https://automaton-media.com/articles/newsjp/sandbox-turbodismount2-20240809-305187/); [Automaton 2026](https://automaton-media.com/articles/newsjp/20260318-430340/)
- **Skate.** Skate 2's box copy promised "all-new bone-crushing bail physics" and the "Thrasher Hall of Meat" mode — [Walmart listing](https://www.walmart.com/ip/10660648). Hall of Meat is essentially turn-based multiplayer where the goal is to do as much damage to your skater as possible. The first Skate already tracked injuries per bail but did nothing with them until Skate 2 (search summary) — [Bit-Tech Skate 2 preview](https://bit-tech.net/reviews/gaming/xbox/skate-2-hands-on-preview/4/). A fan wiki instead says the original game showed a skeleton diagram highlighting broken bones, which conflicts with Bit-Tech — [Tropedia: Skate](https://tropedia.fandom.com/wiki/Skate). In Skate 3, Hall of Meat has specific objectives, and completing five unlocks the "Dem Bones" (skeleton) character (search summary) — [TouchTapPlay](https://www.touchtapplay.com/how-to-get-dem-bones-in-skate-3/)
- Euphoria's behaviour list includes inherently comic states: ArmsWindmill, PedalLegs, Teeter, Dangle, BodyWrithe, BodyFoetal, OnFire and Electrocute, plus ShotShockSpin "cheat torques" — [Euphoria.cs](https://github.com/scripthookvdotnet/scripthookvdotnet/blob/main/source/scripting_v3/GTA.NaturalMotion/Euphoria.cs)
- cannon-es's ragdoll demo shows the same rig with three limit settings: cone, shoulder and twist all at π (effectively no limits), at π/4, π/3 and π/8, and at 0 (rigid). It shows how limit range alone changes character from "rag" to "doll" to "mannequin" — [cannon-es ragdoll example](https://github.com/pmndrs/cannon-es/blob/master/examples/ragdoll.html)

### Inferences
- **Comedy toolkit for Emonad.** Each item is cheap and each answers "why is this funny?":
  1. **Try-then-fail.** Brace arms reach toward the obstacle, then crumple (section 1). This is the Turbo Dismount "holding on for dear life" principle.
  2. **Top-heavy cartoon mass.** A big head that is somewhat heavier than realistic (realistic is ~7% of body mass, see section 4) makes the head lead the tumble and whip on impacts. Cap it (head ≤ ~0.6× chest mass) or the neck jitters.
  3. **Delayed secondary motion.** Hair-sway blendshapes and the fringe should lag head motion by a spring (frequency ~3–5 Hz, damping ratio ~0.3–0.5), so hair keeps moving after the body stops. Overlap and follow-through are where the cartoon feel comes from.
  4. **Facial timing.**
     - About 0.1–0.2 s before a predicted impact (same raycast as the brace), switch to Surprise.
     - On impact frame, a 1–2 frame squash-blink, then Sorrow or Angry.
     - Big hits: eyes shut.
     - Holding the reaction ~100–200 ms longer than the physics needs gives a comic beat. Blendshapes are nearly free on GPU.
  5. **Hit-stop and slow-mo.** Freeze or slow physics to ~0.1–0.2× for 80–150 ms on big hits and bone breaks. Turbo Dismount's slow-mo replay shows players love re-watching impacts.
  6. **Measured damage.** A Hall-of-Meat-style tally and skeleton read-out turns pain into score. That fits "Number Go Down".
  7. **Limb spin.** Small authored angular impulses on the forearms and shins after hits ("cheat torques") make limbs helicopter readably. Clamp max angular velocity so the motion stays legible (see section 4).
  8. **Dazed stars or tweety birds** orbiting the head during the end lie-down. These are a pure VFX layer.
- Keep the figure readable: a strong silhouette, high-contrast hands and feet, and a camera framed so the whole body and the impact are visible. Kill Screen's "abstraction keeps attention on movement" point argues against clutter.

### Gaps
- I could not fetch the full Kill Screen article (more developer quotes) or any academic/comic-theory source. Bergson's "mechanical encrusted on the living" is a commonly cited framing but was not verified in this session.
- No source was reached on how Skate's bail camera, slow-mo or sound design were tuned.

## 4. Tuning: mass ratios, joint limits, damping/stiffness, friction/restitution, sleeping, jitter, interpenetration, stretching, collision shapes and filtered pairs

### Takeaway
Shipped and engine-reference ragdolls use 11–12 capsule or box bodies and no hands or feet as separate bodies. They use much flatter mass distributions than real humans: about 2.5:1 at most between linked bodies, versus about 16:1 for a real trunk and upper arm. They use high angular damping, disable parent-child collisions and keep limits conservative. Stability comes from mass-ratio clamping, inertia inflation, soft limits, root-first constraint priority and fixed small timesteps. Floppiness comes from slightly wider limits and low damping on the limbs.

### Cited Findings
**Mass**
- **Real human segment masses (de Leva 1996).**
  - Male: head 6.94%, trunk 43.46%, upper arm 2.71%, forearm 1.62%, hand 0.61%, thigh 14.16%, shank 4.33%, foot 1.37%.
  - Female: 6.68 / 42.57 / 2.55 / 1.38 / 0.56 / 14.78 / 4.81 / 1.29%.

  [segdim_deleva.py](https://github.com/Westview-USC-Biomechanics-Collaboration/Prepare2Play-Learning-Experience/blob/main/vector_overlay/segdim_deleva.py)
- **Unity's built-in Ragdoll Wizard** (decompiled editor source):
  - `totalMass = 20`. Relative densities are pelvis 2.5, middle spine 2.5, each upper leg 1.5, each lower leg 1.5, each upper arm 1.0, each forearm 1.0, head 1.0, scaled so they sum to totalMass.
  - That works out to pelvis 3.125 kg, chest 3.125, thigh 1.875, shin 1.875, upper arm 1.25, forearm 1.25 and head 1.25.
  - 11 bodies in all: no hands, feet or separate neck.

  [Unity RagdollBuilder.cs](https://github.com/duanjiahao/UnityDecompiled/blob/master/UnityEditor/UnityEditor/RagdollBuilder.cs)
- **Jolt `RagdollSettings::Stabilize()`.** It is "Based on: Stop my Constraints from Blowing Up! – Oliver Strunk (Havok)". It does two things:
  1. Limits parent-to-child mass ratios (`cMinMassRatio = 0.8`, `cMaxMassRatio = 1.2`, then redistributes total mass along the chain).
  2. Increases each parent's inertia to at least the sum of its children's, with `cMaxInertiaIncrease = 2.0`.

  [Jolt Ragdoll.cpp](https://github.com/jrouwe/JoltPhysics/blob/master/Jolt/Physics/Ragdoll/Ragdoll.cpp)
- Hairibar: a total-mass setting plus distribution profiles. Heavier bones near the centre of mass are a good start and matter most for unpowered ragdolls — [Hairibar.Ragdoll](https://github.com/hairibar/Hairibar.Ragdoll)
- Stiff-feeling ragdolls are commonly blamed on joint limits that are too tight, high linear damping or unrealistic mass distribution, with mass concentrated in the torso and pelvis (search summary) — [Homo Deus Lab](https://homo-deus.com/lab/animation-physics/ragdoll-physics/)
- A third-party engine issue warns that ragdolls whose mass is derived from collider volume came out 1.5–1.8× heavier than the person they were fitted to (title only; secondary) — [ae3d issue #626](https://github.com/aether-lang-dev/ae3d/issues/626)

**Joint limits (all sources, degrees)**
- **Unity Ragdoll Wizard (CharacterJoint).** Format: low twist / high twist / swing1; swing2 is always 0.
  - Thigh: -20 / 70 / 30.
  - Knee: -80 / 0 / 0.
  - Spine: -20 / 20 / 10.
  - Upper arm: -70 / 10 / 50.
  - Elbow: -90 / 0 / 0.
  - Head: -40 / 25 / 25.
  - Hinge-like joints put their bend axis on the "twist" axis (worldRight for knees and hips, worldForward for elbows). `enablePreprocessing = false` on all joints.

  [RagdollBuilder.cs](https://github.com/duanjiahao/UnityDecompiled/blob/master/UnityEditor/UnityEditor/RagdollBuilder.cs)
- **Jolt sample human (SwingTwist constraint).** Format: twist ±, normal half-cone, plane half-cone.
  - Mid and upper body: ±5, 10, 10.
  - Head: ±90, 45, 45.
  - Upper arm: ±45, 90, 45.
  - Lower arm: ±45, 0, 90 (hinge-like).
  - Upper leg: ±45, 45, 45.
  - Lower leg: ±45, 0, 60, with the code comment "cheating here, a knee is not symmetric".

  It has 12 bodies (3 torso segments, head, 2×upper and lower arm, 2×upper and lower leg) and calls `Stabilize()`, `CalculateConstraintPriorities()` and `DisableParentChildCollisions()` — [Jolt RagdollLoader.cpp](https://github.com/jrouwe/JoltPhysics/blob/master/Samples/Utils/RagdollLoader.cpp)
- **Bullet benchmark ragdoll** (11 bodies).
  - Pelvis–spine: hinge -45° to +90°.
  - Neck: cone with swing 45°/45° and twist 90°.
  - Hips: cone 45°/45°, twist 0.
  - Knees: hinge 0 to 90°.
  - Shoulders: cone 90°/90°, twist 0.
  - Elbows: hinge -90° to 0.

  [Bullet BenchmarkDemo.cpp](https://github.com/bulletphysics/bullet3/blob/master/examples/Benchmarks/BenchmarkDemo.cpp)
- Godot docs: for ConeJoint, "it's usually best to limit Swing Span between 20 and 90 degrees, and the Twist Span between 20 and 45 degrees". Use HingeJoint for elbows and knees. The default PinJoint "leads to 'crumpling' of the bones" — [Godot ragdoll_system.rst](https://github.com/godotengine/godot-docs/blob/master/tutorials/physics/ragdoll_system.rst)
- An older thesis models the neck, shoulders and hips with 3 DOF each and the knees and elbows with 1 DOF (search summary) — [Linköping thesis](https://www.diva-portal.org/smash/get/diva2:23898/FULLTEXT01.pdf)

**Damping, sleeping, shapes**
- **Bullet ragdoll per-body settings:**
  - `setDamping(linear 0.05, angular 0.85)`.
  - `setDeactivationTime(0.8 s)`.
  - `setSleepingThresholds(linear 1.6, angular 2.5)`.
  - Capsules (radius, height): pelvis 0.15/0.20, spine 0.15/0.28, head 0.10/0.05, upper leg 0.07/0.45, lower leg 0.05/0.37, upper arm 0.05/0.33, lower arm 0.04/0.25.

  [BenchmarkDemo.cpp](https://github.com/bulletphysics/bullet3/blob/master/examples/Benchmarks/BenchmarkDemo.cpp)
- **Unity Ragdoll Wizard colliders:**
  - Limbs are capsules aligned from the bone to its child, with height equal to the distance to the child and `radius = length × radiusScale` (upper leg 0.3, lower leg 0.25, upper arm 0.25, forearm 0.2).
  - End bones (no single child) size to the bounds of their child transforms.
  - Pelvis and spine get BoxColliders; the head gets a SphereCollider.

  [RagdollBuilder.cs](https://github.com/duanjiahao/UnityDecompiled/blob/master/UnityEditor/UnityEditor/RagdollBuilder.cs)
- Jolt sample capsules (half-height, radius): upper arm 0.15/0.06, lower arm 0.15/0.05, upper leg 0.2/0.075, lower leg 0.2/0.06 — [RagdollLoader.cpp](https://github.com/jrouwe/JoltPhysics/blob/master/Samples/Utils/RagdollLoader.cpp)
- EggyStudio defaults: drag 0.1, angular drag 0, joint damping 0.6 — [AnimationFollowing.cs](https://github.com/EggyStudio/Unity.Humanoid.ActiveRagdoll/blob/main/Editor/AnimationFollowing.cs)

**Collision filtering, jitter, explosions, stretching**
- Jolt `DisableParentChildCollisions()` creates a GroupFilterTable so that parents and children don't collide. A GroupFilter "allows you [to] fine tune collision e.g. by discarding collisions between bodies connected by a constraint" — [Ragdoll.h](https://github.com/jrouwe/JoltPhysics/blob/master/Jolt/Physics/Ragdoll/Ragdoll.h); [Jolt Architecture.md](https://github.com/jrouwe/JoltPhysics/blob/master/Docs/Architecture.md)
- Jolt `CalculateConstraintPriorities()` gives "constraints near the leaves ... a lower priority than constraints near the root", so the solver resolves the root first — [Ragdoll.h](https://github.com/jrouwe/JoltPhysics/blob/master/Jolt/Physics/Ragdoll/Ragdoll.h)
- Jolt warns that velocities are stored as floats. At large velocities, for example "an object with constraints (e.g. a ragdoll)" moving at high speed, "the constraints will not be solved properly" because relative velocities become too small to represent — [Architecture.md](https://github.com/jrouwe/JoltPhysics/blob/master/Docs/Architecture.md)
- Hairibar: set `limitSpring > 0` for soft joint limits, "the main stability fix for ragdolls that blow up after large shocks". Keep ragdolls on their own physics layer. Use a CollisionSpammer to find unwanted self-collisions that cause odd poses. Lower alpha on bones in contact to stop vibration — [Hairibar.Ragdoll](https://github.com/hairibar/Hairibar.Ragdoll)
- Godot: every PhysicalBone3D costs performance. Remove bones too small to matter, such as fingers, and use one hand bone — [Godot docs](https://github.com/godotengine/godot-docs/blob/master/tutorials/physics/ragdoll_system.rst)

### Inferences
**Starter tuning sheet for Emonad.** These are starting values to tune, derived from the sources above; cartoon-skewed but kept within solver-safe ranges.

| Body (13 total) | Shape | Relative mass | Notes |
|---|---|---|---|
| Hips/pelvis (root) | capsule lying sideways, or box | 3.0 | root; highest constraint priority |
| Spine | capsule | 1.5 | merge Spine+Chest into one body if budget is tight (Unity uses 1 spine body) |
| Chest (+shoulders) | capsule/box | 2.0 | VRM shoulder bones: no body; fixed to Chest |
| Head (+neck) | sphere (big, cartoon) | 1.6–1.8 | heavier than Unity's 1.0 for top-heavy comedy; ≤ ~0.9× chest |
| UpperArm ×2 | capsule, r ≈ 0.25×len | 0.9 | |
| LowerArm+Hand ×2 | capsule to fingertip, r ≈ 0.2×len | 0.7 | hand is not a body; fingers posed by blendshape or static |
| UpperLeg ×2 | capsule, r ≈ 0.3×len | 1.6 | |
| LowerLeg+Foot ×2 | capsule (or capsule + small foot box in the same body) | 1.2 | |

- **Largest linked-body ratio:** chest to upper arm ≈ 2.2:1, close to Unity's 2.5:1. Scale the total to whatever makes obstacle impulses feel right (Unity uses 20). If using Jolt, `Stabilize()` will flatten this further.
- **Inertia inflation.** Inflate forearm and shin inertia toward that of a body ~1.5–2× wider (Jolt caps its own increase at 2×). Long thin limbs then spin less wildly and jitter less.

**Joint limits (degrees)**

| Joint | Cartoon "healthy" limit | Basis |
|---|---|---|
| Neck (Head↔Chest) | swing cone 40–45°, twist ±60° | Bullet 45/45 with twist 90; Jolt 45/45 with ±90; Unity -40/+25 bend, 25 swing |
| Spine↔Hips, Chest↔Spine | each: flex 30°, extend 15°, side 15°, twist ±10° | Unity ±20 bend, 10 swing; Jolt 10/10, ±5 twist |
| Shoulder | cone 80–90° (asymmetric: more forward and up than back), twist ±45° | Bullet 90/90; Jolt 90/45, ±45 |
| Elbow | hinge 0 to 120–135° flex, 0–5° hyperextension | Unity and Bullet 90° are stiff-looking; realistic flex is larger |
| Hip | cone ~45–60° (forward flex up to ~90° via asymmetric twist-axis setup), twist ±30° | Unity -20/+70 plus 30; Bullet 45/45 |
| Knee | hinge 0 to 120–135° flex, no hyperextension | Unity -80/0; Bullet 0–90; Jolt symmetric ±60 "cheat" |

- **Reserve 30–60° of extra range per joint for broken states** (section 6). If healthy limits are already huge, a break cannot read as wrong.
- Use soft limits (small spring and damping) rather than hard stops. Hard limits plus big impacts are what blow up or jitter.
- **Damping:**
  - Angular damping ~0.5–0.9 on limbs (Bullet uses 0.85) and slightly less on the head, so it keeps bobbling.
  - Linear damping ~0–0.05; air drag should be gameplay-tuned separately.
  - A small joint friction or damping (a velocity motor with target 0 and low max torque) adds "weight" and kills micro-oscillation without stiffening the pose.
- **Friction and restitution (no sourced values found).** Restitution 0–0.1 on all body parts, because bouncy limbs read as rubber. Fake the comedic bounce with authored impulses on specific obstacles instead. Friction 0.6–1.0 so the body tumbles and rolls rather than sliding like soap on slopes.
- **Sleeping.** Disable sleep during the run. At the end, use thresholds like Bullet's (1.6 m/s, 2.5 rad/s for 0.8 s) to decide "came to rest → start outro".
- **Max angular velocity.** Clamp each body to roughly 20–40 rad/s so spins stay readable and joints don't separate. EggyStudio's 1000 is effectively unclamped.
- **Anti-"spaghetti" checklist.** Spaghetti means limbs stretch apart at speed. To prevent it:
  - Use a fixed 60 Hz or 120 Hz substep with render interpolation.
  - Give constraints root-first priority.
  - Clamp mass ratios.
  - Use soft limits.
  - At slingshot launch, set the same linear velocity on all bodies (`DriveToPoseUsingKinematics`-style) rather than one large impulse on the hips. A single-body impulse is the classic cause of limbs trailing and stretching.
  - Keep world speeds moderate (scale the world rather than using huge velocities, per Jolt's float warning).
  - Use reduced-coordinate articulations/multibody joints if the chosen engine offers them, since they cannot stretch by construction.
- **Collision pairs to disable:**
  - All parent-child pairs.
  - Plus Spine↔UpperLegs, Chest↔Hips, Chest↔UpperArms, Head↔UpperArms (overlapping volumes around the shoulders) and UpperLeg↔UpperLeg (the hips overlap).
- **Collision pairs to keep:** forearm and hand vs torso and head, shin vs the other shin. These stop the most visible interpenetration (arms through the body, legs crossing through each other).

### Gaps
- No primary source gave per-material friction or restitution for ragdoll parts.
- The Oliver Strunk/Havok GDC talk itself, and PhysX articulation best-practice docs, were not reachable. Only Jolt's code comment summarising Strunk's slides 16 and 34 was available.
- I found no source on mobile-specific budgets (bodies, iterations) for ragdolls.

## 5. Mapping a skinned mesh (VRM-style GLB) to a ragdoll: bones, capsules, rigs, A/T-pose, syncing, fingers and hair

### Takeaway
Map only about 11–13 major humanoid bones to bodies. Size the capsules from bone-to-child distances times a radius factor. Build joint frames in the bind pose, using VRM 1.0's normalized bones, which have identity rest rotation, to avoid per-rig axis chaos. Write physics back to the skeleton every rendered frame as world transforms converted to bone-local. Everything else (fingers, toes, shoulders, hair, eyes) is kinematic, blendshape-driven or a spring-bone layer on top.

### Cited Findings
- **three-vrm (VRM 1.0).** Models may have "non-normalized" bone orientations, so three-vrm exposes normalized human bones that "have identity orientation ([0, 0, 0; 1] in quaternion) in its rest pose". They are proxy objects synced to raw bones on `VRM.update` / `VRMHumanoid.update`; set `autoUpdateHumanBones = false` to opt out. Access is through `getRawBoneNode` and `getNormalizedBoneNode`. three-vrm also ships springBone, lookAt and constraint helpers — [three-vrm migration guide](https://github.com/pixiv/three-vrm/blob/dev/guides/migration-guide-1.0.md)
- **rapierjs-ragdoll (three.js + Rapier + Blender GLTF).** Each body part is a dynamic rigid body connected with spherical joints, each bone is mapped to a physics body, and "the position and rotation of each physics body are used to update the corresponding bone's transformation every frame" — [mattvb91/rapierjs-ragdoll](https://github.com/mattvb91/rapierjs-ragdoll). Its author calls aligning colliders and bones "super finicky" and full of "nightmare fuel" bugs. They suggest pausing the sim, lining up the bodies and bones, and then attaching each body to its bone (search summary) — [three.js forum](https://discourse.threejs.org/t/blender-mesh-rapierjs-colliders-results-in-weird-mesh-issues/86683)
- A cannon.js ragdoll thread notes that matching bones to bodies "in the reverse direction doesn't seem to work". The usual fix is to drive bones from bodies (search summary) — [html5gamedevs](https://html5gamedevs.com/topic/29464-ways-to-achieve-ragdoll-effect-using-cannonjs)
- Unity's wizard sizes limb capsules by distance to the single child bone times radiusScale. For end bones it uses the bounds of descendant transforms. Pelvis and spine get boxes and the head a sphere. Joint axes are given in world space, then converted to each bone's local space — [RagdollBuilder.cs](https://github.com/duanjiahao/UnityDecompiled/blob/master/UnityEditor/UnityEditor/RagdollBuilder.cs)
- Jolt's reference human is authored in T-pose: arms horizontal along ±X, with twist axes along the limb — [RagdollLoader.cpp](https://github.com/jrouwe/JoltPhysics/blob/master/Samples/Utils/RagdollLoader.cpp). `Ragdoll::GetPose` computes skeleton joint matrices from body transforms, and `SetPose` teleports bodies to a pose — [Ragdoll.h](https://github.com/jrouwe/JoltPhysics/blob/master/Jolt/Physics/Ragdoll/Ragdoll.h)
- Hairibar matches position in world space and rotation in local space. Before rendering, the visible (Target) bones copy the ragdoll pose — [Hairibar.Ragdoll](https://github.com/hairibar/Hairibar.Ragdoll)
- Godot: no physical bones for fingers. Use a single hand bone, or palm + thumb + fingers at most, and remove utility bones — [Godot docs](https://github.com/godotengine/godot-docs/blob/master/tutorials/physics/ragdoll_system.rst)

### Inferences
**Bone-to-body map for Emonad (VRM names):**

| VRM bones | Ragdoll handling |
|---|---|
| hips | root body |
| spine | body |
| chest (+ upperChest if present) | body |
| neck + head | one head body, centred on the head mesh, not the head bone pivot |
| leftShoulder / rightShoulder | fixed to chest, no body |
| leftUpperArm / rightUpperArm | body |
| leftLowerArm / rightLowerArm (+ hand) | body |
| leftUpperLeg / rightUpperLeg | body |
| leftLowerLeg / rightLowerLeg (+ foot, toes) | body |

- **Capsule sizing.**
  - Length = |child.worldPos − bone.worldPos|.
  - Radius = length × 0.2–0.3, then hand-adjust against the actual mesh thickness. A cartoon emo kid probably has thin limbs and a big head.
  - Offset the capsule centre to the midpoint of the segment.
  - For the forearm and shin, extend the length to cover the hand or foot.
  - Store a constant "body-from-bone" offset transform at bind time.
- **A-pose vs T-pose.**
  - Never author joint limits as world-space Euler angles. Define each joint's frame at bind time from the bind-pose bone direction (twist axis = parent-to-child direction) plus a chosen bend axis (the character's right vector for knees and hips, the arm's forward for elbows), then express limits relative to that frame.
  - If the GLB is in A-pose, the shoulder cone centre must point down-and-out along the A-pose arm. Otherwise half the cone is wasted and arms lock against the body.
  - The simplest route is to snap the normalized VRM rig into T-pose (identity normalized rotations) before building bodies, then build exactly as the Jolt and cannon samples do.
- **Sync every frame.**
  1. Step physics at a fixed rate.
  2. For each mapped bone, compute `boneWorld = bodyWorld(interpolated) × inverse(bodyFromBone)`.
  3. Convert to local: `boneLocal = inverse(parentBoneWorld) × boneWorld`, processing parents first (hips → spine → chest → limbs).
  4. Apply the root translation only to hips.
  5. Unmapped children (hands, feet, fingers, shoulders) keep their bind-relative local transforms, or get a procedural pose.

  Work with three-vrm's normalized bones, or else disable `autoUpdateHumanBones` and write raw bones directly, so the two systems don't fight.
- **Fingers.** Use a static "relaxed curl" pose, plus a "splayed" pose blended in on Surprise and a "fist" pose on Angry or brace. These are bone rotations driven like blendshapes, not physics.
- **Hair.**
  - Drive the provided hair-sway blendshapes from a 1D or 2D damped spring that takes the head body's angular velocity and acceleration as input. Split into left-right and forward-back channels.
  - Add an extra impulse on impacts.
  - VRM springBone (supported by three-vrm) is an alternative if the hair has bones, but blendshapes are cheaper and safer on mobile.

### Gaps
- No VRM-specific ragdoll project, Mixamo-to-ragdoll mapping guide or A-pose-specific limit guidance was found in reachable sources.
- I could not confirm that the VRM 0.x spec requires a T-pose rest from a primary source in this session.

## 6. Making "broken" bones visible and funny

### Takeaway
No reachable source documents exactly how Skate showed breaks on the body beyond an injury tally and skeleton read-outs. Euphoria did expose explicit "injured limb" and limit-configuration messages, which suggests the right lever: change the broken joint's physical properties at runtime (wider limits, zero muscle) and pair it with strong non-physical feedback (slow-mo, X-ray or skeleton flash, sound, face). The break should be visible in the silhouette, through a joint bending the wrong way, and on the HUD, through a skeleton diagram plus score.

### Cited Findings
- GTA V's Euphoria messages include ConfigureShotInjuredArm, ConfigureShotInjuredLeg, ConfigureLimits, ConfigureSoftLimit, SetMuscleStiffness and SetCharacterStrength. These are runtime controls for injured limbs, joint limits and per-muscle strength — [Euphoria.cs](https://github.com/scripthookvdotnet/scripthookvdotnet/blob/main/source/scripting_v3/GTA.NaturalMotion/Euphoria.cs)
- Skate tracked injuries per bail. Skate 2's Hall of Meat made maximising damage the goal (search summary) — [Bit-Tech](https://bit-tech.net/reviews/gaming/xbox/skate-2-hands-on-preview/4/). A fan wiki says the original Skate showed a skeleton diagram highlighting broken bones; this conflicts with Bit-Tech's account — [Tropedia](https://tropedia.fandom.com/wiki/Skate). Skate 3 objectives unlock the "Dem Bones" skeleton character (search summary) — [TouchTapPlay](https://www.touchtapplay.com/how-to-get-dem-bones-in-skate-3/)
- Hairibar: per-bone power can be switched to Unpowered while the rest stays powered. Changing joint and rigidbody settings at runtime requires re-applying settings — [Hairibar.Ragdoll](https://github.com/hairibar/Hairibar.Ragdoll)
- cannon-es's demo shows that widening cone and twist limits (up to π) turns the same rig into a noodle — [cannon-es ragdoll example](https://github.com/pmndrs/cannon-es/blob/master/examples/ragdoll.html)

### Inferences
**A "bone break" recipe, staged over about 0.6 s and cheap on mobile:**
1. **Detect.**
   - Trigger on impulse at a body or joint above a threshold. Better still, trigger on the joint-limit violation impulse, or on the angle past the healthy limit at impact.
   - Pick the bone, apply score, and avoid re-breaking the same bone within ~0.5 s.
2. **Hit-stop and slow-mo.** Run physics at 0 for 50–80 ms, then at 0.15–0.25× for 300–500 ms, then ease back to 1× over 200 ms. Use a timeScale on the fixed-step accumulator; never change the dt per step, or joints destabilise.
3. **Make it visibly wrong.**
   - At the break moment, widen that joint's limits by 40–90°. A knee or elbow may now hyperextend 30–60°, and the forearm or shin twist range grows by ±45°.
   - Set that chain's motor strength to 0 permanently.
   - Optionally add a small authored angular impulse that pushes the limb into the newly allowed wrong angle. Cartoon breaks read best as a clear reverse bend, not as subtle floppiness.
   - **Mid-bone break.** For a cartoon "extra joint", split the visual: either bend a dedicated mid-bone helper, or swap to a pre-authored "bent" blendshape or morph on that limb segment. This is better than adding a physics body.
4. **X-ray or skeleton flash.** For 150–300 ms, render a skeleton overlay or X-ray shader over the limb, with the cracked bone highlighted in red, plus the HUD skeleton diagram ticking that bone (Skate-style).
5. **Face and audio.** Show Surprise, then a squeezed-eyes Sorrow, and play a crunch SFX layered with a comic boing or kazoo. Camera shake and FOV punch on the break.
6. **Persistent state.** The broken limb stays floppier (Unpowered, wider limits, lower angular damping ~0.3) for the rest of the run. Each break visibly changes how Emonad tumbles, which turns "Number Go Down" score into visible consequence. A "Dem Bones" style unlock fits the meta.

### Gaps
- No primary source on how Skate 3 rendered breaks on the skater model (X-ray, bent limbs or only the HUD).
- No reachable source on Sniper Elite or Mortal Kombat X-ray implementation, or on the timing of break slow-mo in shipped games. The timings above are design inferences.

## 7. Transitions: slingshot (animated) → ragdoll at launch, and ragdoll → get-up / dazed / dance at the end

### Takeaway
At launch, teleport the ragdoll bodies onto the current animated pose, give every body its animated velocity, then ramp muscle strength down over ~0.15–0.25 s rather than cutting to limp. At the end, wait for rest. Then classify face-up vs face-down from the hips orientation, align the animation root to the ragdoll's hips, snapshot the ragdoll pose, and cross-fade to the matching get-up clip over ~0.2–0.5 s, then chain into dazed or dance.

### Cited Findings
- Jolt `SetPose` teleports ragdoll bodies to a skeleton pose. `ResetWarmStart()` "can be used after calling SetPose to reset previous frames impulses". `DriveToPoseUsingKinematics(pose, dt)` sets velocities so bodies reach the pose in dt — [Ragdoll.h](https://github.com/jrouwe/JoltPhysics/blob/master/Jolt/Physics/Ragdoll/Ragdoll.h)
- Hairibar's RagdollPowerOnTransitioner ramps alpha up gradually when a ragdoll spawns in a snapped pose or when power profiles change. Profile switches blend values over time — [Hairibar.Ragdoll](https://github.com/hairibar/Hairibar.Ragdoll)
- Tween angular drive strength to 0 over 0.15–0.25 s when going from animation to physics (search summary) — [mocaponline](https://mocaponline.com/blogs/mocap-news/ragdoll-physics-animation-guide)
- **Get-up method (search summary):**
  - Read the ragdoll root's rotation at get-up time and keep at least two variants, from the back and from the front.
  - Align (teleport or lerp) the animation skeleton onto the ragdoll pose.
  - Fade physics weight out over about 0.2–0.5 s.
  - Unreal's Pose Snapshot captures the simulated pose to blend from without snapping.

  [mocaponline](https://mocaponline.com/blogs/mocap-news/ragdoll-physics-animation-guide)
- A Unity helper chooses face-up vs face-down get-ups by checking whether the hips' forward vector points up (search summary) — [nbzeman/Ragdoll RagdollHelper.cs](https://github.com/nbzeman/Ragdoll/blob/master/Assets/Scripts/RagdollHelper.cs)
- In Mecanim, since a transition can't be forced to start immediately, an older approach waits for the get-up clip to start, reads its hip position and orientation, and offsets the root to match (search summary) — [Perttu Hämäläinen blog](http://perttuh.blogspot.com/2013/10/unity-mecanim-and-ragdolls.html)
- An open-source engine notes that a reference ragdoll's hip and knee limits cannot reach a sitting or crouching pose. So the get-up was keyed on the rig rather than muscle-driven, with face-up and face-down variants and a blend in and out (search summary of a third-party PR; treat as secondary) — [ae3d PR #436](https://github.com/nicolas-maman/ae3d/pull/436)

### Inferences
**Launch sequence:**
1. While held in the slingshot, the animated pose (stretch or "eek" pose) is shown, with the ragdoll Kinematic and following the anim each frame. Kinematic bodies already carry the animation's velocities.
2. On release frame:
   - Switch all bodies to Dynamic.
   - Set each body's linear and angular velocity to its kinematic velocity plus the slingshot launch velocity, applied uniformly to all bodies to avoid stretching.
   - Call ResetWarmStart or the equivalent.
3. Keep motors at 60–80% for ~0.1 s, so the pose survives the first frames and reads as "launched in pose". Ramp to the freefall profile (10–25%) over 0.15–0.25 s.
4. Start the face on Surprise or Joy at release and the hair spring with a kick.

**End sequence:**
1. Rest detection: hips speed < ~0.3 m/s and angular < ~0.5 rad/s for 0.5–0.8 s, or Bullet-style thresholds.
2. Optional "lying there" beat of 0.5–1.5 s: writhe noise, dazed stars, Sorrow or Blink. This is a comic pause.
3. Snapshot the current ragdoll bone locals into a "pose snapshot".
4. Classify:
   - `dot(hipsForward, worldUp) > 0` → face-up, else face-down.
   - Optionally side-lying from `dot(hipsRight, up)`.
5. Pick the get-up clip (face-up, face-down; side optional) and evaluate its first frame.
6. Align root:
   - Move and yaw the animation root so the clip's first-frame hips match the ragdoll hips' position (projected to the ground) and heading (hips-to-head direction projected onto the ground plane).
   - Do not pitch or roll the root; the clip itself starts lying down.
7. Over 0.2–0.5 s, blend from the snapshot to the clip per bone (slerp locals; hips in world space). Physics bodies become Kinematic and follow.
8. Chain the clip's end into a dazed loop (wobbly idle with stars) or a victory or emo-shrug dance, depending on score.
9. Ragdoll limits often cannot reach the clip's crouched or kneeling poses. Run the get-up purely as animation; bodies are Kinematic followers.

- **Cheaper alternative if only one get-up clip exists.** Always use the face-down clip. For face-up results, first play a short "roll over" physics nudge: a cheat torque around the spine axis for ~0.4 s.

### Gaps
- No primary GDC source on shipped AAA get-up systems (pose-matched selection among many clips, motion matching for get-ups) was reachable. The specifics of mocaponline and the Unreal Pose Snapshot are search summaries only.

## 8. Touch steering of a ragdoll (forces vs torques, keeping it floppy, how much control feels good)

### Takeaway
I found no reachable primary source on Skate's bail steering or Burnout's Aftertouch. What the sources do show is that shipped physical-animation systems expose steering as forces on specific body parts, leans and impulses rather than direct pose control. Euphoria has ForceToBodyPart, ApplyImpulse, LeanInDirection and HipsLeanInDirection, and Turbo Dismount outcomes depend on launch posture. The recommendation for Emonad is to steer with a clamped, smoothed horizontal force at the pelvis or centre of mass (plus an optional small chest torque for "lean"). Never move the limbs directly, so the body stays limp and the steering reads as nudging the trajectory.

### Cited Findings
- Euphoria exposes ForceToBodyPart, ApplyImpulse, LeanInDirection, HipsLeanInDirection, ForceLeanInDirection, LeanToPosition and LeanTowardsObject as separate messages. Steering and nudging were applied as forces on specific parts or as lean targets layered on behaviours — [Euphoria.cs](https://github.com/scripthookvdotnet/scripthookvdotnet/blob/main/source/scripting_v3/GTA.NaturalMotion/Euphoria.cs)
- Jolt's docs suggest using a physics step listener for per-step work "e.g. set velocities on ragdoll bodies" — [Jolt Architecture.md](https://github.com/jrouwe/JoltPhysics/blob/master/Docs/Architecture.md)
- Turbo Dismount: launch posture affects the crash outcome (search summary) — [TouchArcade](https://toucharcade.com/2014/03/21/gdc-2014-turbo-dismount/)
- Active-ragdoll balance in Gang Beasts, HFF, Octodad and TABS is done with external forces on the body, not purely with joint torques (search summary) — [Medium](https://medium.com/@jacasch/balancing-of-active-ragdolls-in-games-367f146b25fb)

### Inferences
- **Where to push.**
  - Apply the steering force at the pelvis, or distribute it to all bodies in proportion to mass, which equals a force at the whole-body centre of mass. That moves the trajectory without changing the pose.
  - Pushing at the chest or head makes the body rotate and peel, which reads as being "dragged by the face". Use it only deliberately, for example a "flick" gesture that spins him.
  - Never push the hands or feet; that produces puppet-on-a-string motion and stretching.
- **Force model.**
  - Map finger horizontal offset (or drag velocity) to a target lateral velocity, for example ±3–5 m/s scaled to course width.
  - Apply a clamped force `F = k·(v_target − v_current)` with k giving a 0.15–0.3 s response.
  - Cap the force at ~0.5–1.5 g × total mass, so gravity and collisions always dominate. That keeps the body "flung" rather than flown.
  - Low-pass the finger input (~80–120 ms) so twitchy touches don't shake the ragdoll.
- **Keep it floppy.** Steering should not raise muscle strength. A tiny optional "lean" is fine: chest torque toward the steer direction at ≤ 10% of the motor budget, or the arms swinging toward it. Then the body visibly "tries" to steer, which is the Turbo Dismount sympathy principle.
- **How much control.**
  - Give influence over where he goes, not over how he lands.
  - Reduce steering authority for ~0.2–0.3 s after big impacts (pain beat).
  - Optionally boost it during slow-mo windows. This is an Aftertouch-like moment: let the player aim the next hit during slow-mo, which is the best use of slow-mo for interactivity.
- Steering should never add energy along the fall axis, or the course timing breaks. Only apply forces horizontally, in the course plane.

### Gaps
- I could not research Skate's bail steering (whether players could control the body mid-bail and how) or Burnout 3's Aftertouch (slow-mo wreck steering), because the web search budget was exhausted. These are the most valuable remaining design references for this question and should be checked in a follow-up.
- No source gave measured "good feel" values for player influence on ragdoll trajectories.
