# Browser physics engine, architecture and performance budget for "Number Go Down" (as of 14 Oct 2026)

Method note: Version numbers and dates come from npm registry metadata pulled on 2026-10-14. API facts come from the TypeScript declaration files shipped in each npm tarball, which I unpacked and grepped. Changelogs come from the engines' GitHub repos. WASM sizes are my own measurements from the npm tarballs (raw bytes, then `gzip -9`; brotli was not available, so expect brotli to come in somewhat smaller). The shared web-search quota ran out partway through this task. After that, only primary sources reachable over raw GitHub and the npm registry could be read, and the Gaps sections flag what this left open. The project's own model file (`number-go-down/assets/model/emonad.glb`) was parsed directly.

## 1. Physics engine comparison (Rapier, Jolt, cannon-es, Ammo, PhysX, Havok, Bounce, Oimo)

### Takeaway
Rapier (`@dimforge/rapier3d-simd` 0.21.0, released 25 Sep 2026) is the strongest default for a Three.js ragdoll game on phones. It is actively developed, and its August 2026 rewrite turned on CCD against static geometry by default, added velocity caps and a NaN quarantine, and added `started` flags to contact-force events. It ships a SIMD build and a cross-platform-deterministic build, and it can snapshot the world.

Jolt (`jolt-physics` 1.1.0, released 11 Jul 2026) has the richest ragdoll toolkit: `RagdollSettings`, swing-twist constraints that report the impulse (lambda) they apply, and drive-to-pose motors. On the web it has three drawbacks:
- Its multithreaded build "doesn't work in Safari nor with any JS callbacks".
- The single-thread npm build ships without SIMD and with a fixed 128 MB heap.
- Cross-platform determinism needs a custom build.

Havok's web build reports joint impulses and has a speed limit. However, it is closed-source, has no snapshot API, and has no official Three.js wrapper. cannon-es, ammo.js and Oimo are stale. Bounce (pure TypeScript) has no cone or swing-twist joint and no CCD. PhysX-WASM is heavy (5.4 MB WASM).

### Cited Findings

**Versions and release dates (npm registry, checked 2026-10-14)**

| Package | Latest | Published | Note | Source |
|---|---|---|---|---|
| `@dimforge/rapier3d`, `-simd`, `-deterministic`, `-compat`, `-simd-compat`, `-deterministic-compat` | 0.21.0 | 2026-09-25 | Nightly builds also published as `0.0.0-<sha>-<date>` | [npm registry](https://registry.npmjs.org/@dimforge/rapier3d-simd) |
| Rapier (Rust core) | 0.36.1 | 2026-10-04 | JS 0.21.0 is "Update to Rapier 0.36.0 and parry 0.31" | [Rapier CHANGELOG](https://github.com/dimforge/rapier/blob/master/CHANGELOG.md); [TS bindings CHANGELOG](https://github.com/dimforge/rapier/blob/master/bindings/typescript/CHANGELOG.md) |
| `jolt-physics` (JoltPhysics.js) | 1.1.0 | 2026-07-11 | 1.0.0 was 2025-12-28 and 1.0.1 was 2026-07-03 | [npm registry](https://registry.npmjs.org/jolt-physics) |
| Jolt Physics (C++) | v5.6.0 is the latest section in the release notes | — | — | [Jolt ReleaseNotes](https://github.com/jrouwe/JoltPhysics/blob/master/Docs/ReleaseNotes.md) |
| `@babylonjs/havok` | 1.3.14 | 2026-07-29 | MIT licence | [npm registry](https://registry.npmjs.org/@babylonjs/havok) |
| `physx-js-webidl` | 2.8.0 | 2026-09-27 | "Javascript/WASM bindings for Nvidia PhysX 5.11.0" | [npm registry](https://registry.npmjs.org/physx-js-webidl) |
| `@perplexdotgg/bounce` | 1.10.0 | 2026-08-10 | Pure TypeScript, no WASM | [npm registry](https://registry.npmjs.org/@perplexdotgg/bounce) |
| `cannon-es` | 0.20.0 | 2022-08-12 | No release since | [npm registry](https://registry.npmjs.org/cannon-es) |
| `ammo.js` (npm) | 0.0.10 | 2016-04-17 | The npm package is abandoned | [npm registry](https://registry.npmjs.org/ammo.js) |
| `oimophysics` | 1.2.2 | 2020-03-02 | — | [npm registry](https://registry.npmjs.org/oimophysics) |
| `@react-three/rapier` | 2.2.0 | 2025-11-03 | — | [npm registry](https://registry.npmjs.org/@react-three/rapier) |

**Download size (measured from the npm tarballs; gzip -9)**

| Engine build | Raw size | Gzip | Source |
|---|---|---|---|
| Rapier simd 0.21.0 `rapier_wasm3d_bg.wasm` | 3,292,228 B | 1,147,293 B | [tarball](https://registry.npmjs.org/@dimforge/rapier3d-simd/-/rapier3d-simd-0.21.0.tgz) |
| Rapier JS glue (`rapier_wasm3d_bg.js`) | 338 KB | 34 KB | same tarball |
| Rapier deterministic 0.21.0 `.wasm` | 3,105,893 B | 1,173,038 B | [tarball](https://registry.npmjs.org/@dimforge/rapier3d-deterministic/-/rapier3d-deterministic-0.21.0.tgz) |
| Rapier `-compat` packages (WASM inlined as base64) | 15.0–15.8 MB unpacked | — | [npm registry](https://registry.npmjs.org/@dimforge/rapier3d-compat) |
| Jolt 1.1.0 single-thread `jolt-physics.wasm.wasm` | 2,021,569 B | 741,965 B | [tarball](https://registry.npmjs.org/jolt-physics/-/jolt-physics-1.1.0.tgz) |
| Jolt JS glue (`jolt-physics.wasm.js`) | 964,712 B | 135,512 B | same tarball |
| Jolt multithread `.wasm` | 2,482,284 B | 711,905 B | same tarball |
| Jolt `wasm-compat` JS (WASM embedded) | 3,222,495 B | — | same tarball |
| Havok 1.3.14 `HavokPhysics.wasm` (glue `HavokPhysics_es.js` is 67 KB) | 2,094,563 B | 658,471 B | [tarball](https://registry.npmjs.org/@babylonjs/havok/-/havok-1.3.14.tgz) |
| PhysX 2.8.0 `.wasm` (plus a 4.8 MB `.mjs`) | 5,401,715 B | 1,611,918 B | [tarball](https://registry.npmjs.org/physx-js-webidl/-/physx-js-webidl-2.8.0.tgz) |
| Bounce 1.10.0 `bounce.js` | 576,157 B | 95,508 B | [tarball](https://registry.npmjs.org/@perplexdotgg/bounce/-/bounce-1.10.0.tgz) |
| cannon-es 0.20.0 `cannon-es.js` | 346,256 B | 74,520 B | [tarball](https://registry.npmjs.org/cannon-es/-/cannon-es-0.20.0.tgz) |

**Rapier (2025–2026 changes that matter here)**

Build variants:
- Rapier ships three variants. The main build is "locally deterministic, on the same machine" but not across platforms. The `-simd` build "requires support for simd128". The `-deterministic` build is "less optimized ... but with a guarantee of a cross-platform deterministic execution". `-compat` variants embed the `.wasm` as base64 "for much wider bundler support" — [Rapier npm README (in the 0.21.0 tarball)](https://registry.npmjs.org/@dimforge/rapier3d-simd/-/rapier3d-simd-0.21.0.tgz)
- The JS bindings moved from the old `dimforge/rapier.js` repo into `bindings/typescript` of the main rapier repo. The old rapier.js changelog stops at 0.19.3 (5 Nov 2025) — [TS CHANGELOG](https://github.com/dimforge/rapier/blob/master/bindings/typescript/CHANGELOG.md); [rapier.js CHANGELOG](https://github.com/dimforge/rapier.js/blob/master/CHANGELOG.md)

Rapier 0.35.0-beta.0 (2 Aug 2026) and 0.35.0 (8 Aug 2026), shipped to JS in 0.20.0 (8 Aug 2026) — [Rapier CHANGELOG](https://github.com/dimforge/rapier/blob/master/CHANGELOG.md):
- The CCD solver was "rewritten around sweep-based time of impact". "Fast dynamic bodies now always run CCD against fixed colliders." `ccd_enabled` "upgrades a body to a 'bullet' that also sweeps kinematic and dynamic bodies."
- "Body velocities are now capped each substep: linear speed at `max_linear_velocity()` (default 400 units/s) and rotation at ~45° per step" (`set_allow_fast_rotation` bypasses the angular cap).
- Contact defaults changed:
  - `normalized_prediction_distance` went from 0.002 to 0.02.
  - `normalized_max_corrective_velocity` went from 10.0 to 3.0.
  - `normalized_allowed_linear_error` went from 0.001 to 0.005.
  - The changelog says this is "greatly reducing tunneling through thin walls".
  - Contacts against fixed bodies use a stiffer spring.
- "NaN/infinity quarantine": bodies whose pose or velocity goes non-finite are "rolled back to their last valid pose, disabled, and reported" instead of corrupting the simulation.
- Sleeping was rewritten around persistent islands. Default `time_until_sleep` dropped from 2.0 s to 0.5 s.
- "The broad phase was reworked for large, mostly-static worlds: scenes with very large static collider counts now pay near-zero per-step broad-phase cost."
- The narrow phase and solver were reworked "around a persistent contact graph and a staged multithreaded solver ... for lower per-step overhead and steadier timings".
- "`enhanced-determinism` can now be combined with `parallel` ... and costs no measurable performance anymore." It remains incompatible with `simd8`, a new feature that needs AVX2, so it does not apply to WASM.
- `RigidBody::additional_solver_iterations` "now adds whole solver substeps for the body's constraint-connected component, converging much better on high mass ratios".
- `ContactForceEvent::started` is `true` on the step a pair's total contact force first exceeds its threshold.
- Restitution became an end-of-step pass.
- "Angular joint limits are no longer restricted to (-π, π)."
- "Improved 3D solver performance by caching the constraints angular jacobians."
- The broad phase now filters pairs by collision groups and skips colliders on the same body.

Rapier 0.35.2 (15 Aug 2026) — [Rapier CHANGELOG](https://github.com/dimforge/rapier/blob/master/CHANGELOG.md):
- Contact impulses, and the contact-force events derived from them, "are now the total impulse applied during the step, instead of one substep too many: they drop by `1 / (num_solver_iterations + 1)`". Any thresholds tuned on an older version must be retuned.

Rapier 0.36.0 (24 Sep 2026), shipped as JS 0.21.0 — [Rapier CHANGELOG](https://github.com/dimforge/rapier/blob/master/CHANGELOG.md); [TS CHANGELOG](https://github.com/dimforge/rapier/blob/master/bindings/typescript/CHANGELOG.md):
- Adds soft bodies (ropes, cloth, volumes, FEM) with tearing and cutting.
- "Snapshots serialized with previous versions can't be loaded anymore."
- A step with `dt == 0` no longer produces NaNs.
- JS: `EventQueue.clear()` now also discards pending contact-force events.

JS 0.20.0 (8 Aug 2026) — [TS CHANGELOG](https://github.com/dimforge/rapier/blob/master/bindings/typescript/CHANGELOG.md):
- "`SphericalImpulseJoint` motors are now exposed (they were commented out as 'unsupported')". They are per-axis and take a `JointAxis` argument.
- The `-compat` packages' files moved into `dist/`.
- `IntegrationParameters.minIslandSize` was removed.

Earlier JS releases — [rapier.js CHANGELOG](https://github.com/dimforge/rapier.js/blob/master/CHANGELOG.md):
- 0.18.0 (Jul 2025) added the `World.timing*` profiler and `World.maxCcdSubsteps`.
- 0.18.0-beta reworked the broad phase.
- 0.19.0 (Sep 2025) brought "performance improvements for scenes involving a lot of contact constraints" and removed the legacy PGS solver switches.

Rapier JS 0.21.0 API surface (from the shipped `.d.ts`) — [tarball](https://registry.npmjs.org/@dimforge/rapier3d-simd/-/rapier3d-simd-0.21.0.tgz):
- Joints:
  - Constructors: `JointData.spherical`, `revolute`, `revoluteWithAxes`, `prismatic`, `fixed`, `rope`, `spring` and `generic(anchor1, anchor2, axis, axesMask)`.
  - `UnitImpulseJoint.setLimits(min, max)` exists for revolute and prismatic joints.
  - `SphericalImpulseJoint` exposes per-axis motors (`configureMotorPosition(axis, target, stiffness, damping)`, `setMotorMaxForce(axis, f)`) but no `setLimits` in the TS wrapper. The raw `rawimpulsejointset_jointSetLimits` export does take an axis argument.
  - Multibody joints are available through `createMultibodyJoint`.
- Snapshots: `world.takeSnapshot(): Uint8Array` and `World.restoreSnapshot(data)`.
- Integration parameters: `numSolverIterations` (default 4), `numInternalPgsIterations`, `maxCcdSubsteps`, `lengthUnit`, `dt`.
- Per-body controls: `enableCcd`, `setSoftCcdPrediction`, `setAdditionalSolverIterations`, `setAdditionalPgsIterations` and `setDominanceGroup`.
- Collision events: `collider.setActiveEvents(ActiveEvents.CONTACT_FORCE_EVENTS)`, `setContactForceEventThreshold`, and `TempContactForceEvent.totalForce()`, `totalForceMagnitude()`, `maxForceDirection()` and `maxForceMagnitude()`.
- Not exposed in the JS `.d.ts` (grep found no such methods):
  - an accessor for a joint's applied impulse;
  - `setAllowFastRotation`;
  - a `maxLinearVelocity` setter.

**Jolt / JoltPhysics.js**

Builds and build options:
- The library comes in 7 flavours (`wasm-compat`, `wasm`, `asm`, and multithread and debug variants). The interface mirrors C++, so the C++ docs serve as the reference. The WASM flavour on Vite uses `import url from 'jolt-physics/jolt-physics.wasm.wasm?url'` plus `locateFile` — [JoltPhysics.js README](https://github.com/jrouwe/JoltPhysics.js/blob/main/README.md)
- Memory is managed manually: everything created with `new Jolt.X` must be released with `Jolt.destroy`, and ref-counted classes (including `RagdollSettings` and `Ragdoll`) need `AddRef`/`Release` — [JoltPhysics.js README](https://github.com/jrouwe/JoltPhysics.js/blob/main/README.md)
- CMake options in the JS port — [JoltPhysics.js CMakeLists.txt](https://github.com/jrouwe/JoltPhysics.js/blob/main/CMakeLists.txt); [build.sh](https://github.com/jrouwe/JoltPhysics.js/blob/main/build.sh):
  - `ENABLE_MULTI_THREADING` carries the warning "doesn't work in Safari nor with any JS callbacks currently".
  - `ENABLE_SIMD` defaults to OFF with the comment "last major browser to support this was Safari 16.4". build.sh turns it on only for the multithread builds.
  - `INITIAL_MEMORY` is 134217728 (128 MB) with `ALLOW_MEMORY_GROWTH` OFF.
  - The multithread build uses `PTHREAD_POOL_SIZE=16`.
- `-DCROSS_PLATFORM_DETERMINISTIC=ON` is an opt-in build flag in the JS port, and build.sh does not pass it. In the C++ library this option makes it "approximately 8% slower" but deterministic across compilers (including emscripten), OS and architecture — [JoltPhysics.js README](https://github.com/jrouwe/JoltPhysics.js/blob/main/README.md); [Jolt Architecture: Deterministic Simulation](https://github.com/jrouwe/JoltPhysics/blob/master/Docs/Architecture.md)
- ContactListener, StepListener and other listeners "are called from multiple threads", so their callback order is not deterministic — [Jolt Architecture](https://github.com/jrouwe/JoltPhysics/blob/master/Docs/Architecture.md)

Ragdoll and contact APIs exposed in JS (`dist/types.d.ts` of 1.1.0) — [tarball](https://registry.npmjs.org/jolt-physics/-/jolt-physics-1.1.0.tgz):
- Ragdoll classes: `RagdollSettings`, `Ragdoll`, `RagdollPart`, `SkeletonPose`, `DriveToPoseUsingMotors`.
- `SwingTwistConstraintSettings`, and a constraint with `GetTotalLambdaPosition()`, `GetTotalLambdaRotation()`, `GetTotalLambdaRotationLimits()`, `GetTotalLambdaMotor()`, `SetTargetOrientationBS` and `SetLimits`.
- `ContactListenerJS` with `OnContactValidate`, `OnContactAdded`, `OnContactPersisted` and `OnContactRemoved`.
- `ContactManifold` with `mWorldSpaceNormal`, `mPenetrationDepth` and world contact points. `ContactSettings` has combined friction and restitution.
- `StateRecorderImpl` / `SaveState` for snapshots, `EMotionQuality` (LinearCast), `mMaxLinearVelocity` and `PhysicsSettings.mNumVelocitySteps`.

Jolt C++ release notes — [Jolt ReleaseNotes](https://github.com/jrouwe/JoltPhysics/blob/master/Docs/ReleaseNotes.md):
- v5.6.0 lists:
  - a new friction model ("15% faster, 40% less memory for Pyramid test");
  - a `Ragdoll::DriveToPoseUsingMotors` variant that drives both position and velocity;
  - "Up to 40% performance improvement (scene dependent) and up to 70% memory reduction";
  - GPU compute interfaces for DX12, Vulkan and Metal (not WebGPU).
- v5.5.0 added `RagdollSettings::CalculateConstraintPriorities`, which "boost[s] the priority of joints towards the root of the ragdoll".

Other Jolt documentation:
- Jolt is used by Horizon Forbidden West and Death Stranding 2. Its feature list includes animated ragdolls (hard keying, soft keying, driving motors to an animated pose, and mapping a high-detail skeleton onto a low-detail ragdoll skeleton) — [Jolt README](https://github.com/jrouwe/JoltPhysics/blob/master/README.md)
- Jolt's own PerformanceTest has a "Ragdoll" scene that drops many ragdolls (motors enabled) on Horizon Zero Dawn terrain — [RagdollScene.h](https://github.com/jrouwe/JoltPhysics/blob/master/PerformanceTest/RagdollScene.h)
- "Jolt stores velocities in floats ... if you create an object with constraints (e.g. a ragdoll) and make it move at high speeds ... the constraints will not be solved properly." The context is very large velocities, as in space games — [Jolt Architecture](https://github.com/jrouwe/JoltPhysics/blob/master/Docs/Architecture.md)

**Havok (web)** — [@babylonjs/havok 1.3.14 tarball](https://registry.npmjs.org/@babylonjs/havok/-/havok-1.3.14.tgz) (`HavokPhysics.d.ts`)
- Constraints are 6-DOF: axes `LINEAR_X/Y/Z`, `ANGULAR_X/Y/Z` and `LINEAR_DISTANCE`, each set to `FREE`, `LIMITED` or `LOCKED`.
- Motor types are `VELOCITY`, `POSITION`, `SPRING_FORCE` and `SPRING_ACCELERATION`.
- `HP_Constraint_GetAppliedImpulses(constraint)` returns the linear and angular impulses in world space.
- `CollisionEvent` includes an "Impulse applied" field, and events are opt-in per body via an event mask.
- `HP_World_SetSpeedLimit(world, maxLinear, maxAngular)` sets velocity caps.
- I found no snapshot, serialization or CCD API in the `.d.ts`.

Community reports on Havok and Rapier:
- No official Three.js integration exists. A community port of Babylon's Havok plugin to Three.js exists, and its author calls it rough — [three.js forum](https://discourse.threejs.org/t/i-ported-babylon-jss-havok-physics-plugin-to-three-js/85539)
- In another thread, commenters call the WASM "close sourced with little to no documentation". One user found Havok did not show the promised 50x gain over Ammo, and another found "Rapier falls short in terms of accuracy, especially evident in the ragdoll" demo — [three.js forum thread](https://discourse.threejs.org/t/anyone-used-the-havok-physics-engine-for-three/53205). These are anecdotal and their dates are unclear.
- A Babylon forum user reported Rapier "caps out around 1000–2000 dynamic entities" in their setup — [Babylon forum](https://forum.babylonjs.com/t/havok-physics-benchmark-multithreading-question/49009)

**PhysX (WASM)**
- `physx-js-webidl` covers "All joint types (revolute, spherical, prismatic, fixed, distance and D6)" and articulations. Its author's demos, including a ragdoll demo, are written in Kotlin (the kool engine), not JS — [physx-js-webidl README (in the 2.8.0 tarball)](https://registry.npmjs.org/physx-js-webidl/-/physx-js-webidl-2.8.0.tgz); [kool ragdoll demo](https://fabmax.github.io/kool/kool-js/?demo=phys-ragdoll)

**Bounce** — [Bounce docs](https://codeberg.org/perplexdotgg/bounce/src/branch/main/docs/documentation.md) (also shipped in the [npm tarball](https://registry.npmjs.org/@perplexdotgg/bounce/-/bounce-1.10.0.tgz))
- Constraints are limited to Point (ball-and-socket), Distance, Fixed and Hinge. There is no cone or swing-twist constraint.
- Defaults are `maxLinearSpeed: 30.0` and `maxAngularSpeed: 30.0`, with 6 velocity iterations and 2 position iterations.
- It supports world serialization and rollback.
- It describes itself as "fast and deterministic".
- The docs do not mention CCD (grep for ccd, continuous and LinearCast found nothing).

**cannon-es**
- Pure JS. Its ragdoll example builds the body with `ConeTwistConstraint` (angle, twistAngle) — [cannon-es ragdoll example](https://github.com/pmndrs/cannon-es/blob/master/examples/ragdoll.html)

**Benchmarks**
- A tutorial site ranks Rapier as top for web games and Jolt-WASM as "excellent", but gives no reproducible numbers (its "2-5x faster" claim has no source) — [Cinevva guide](https://app.cinevva.com/tutorials/game-physics-libraries.html)

### Inferences
- **Recommendation:** Rapier `-simd` as the primary engine, with its scene setup wrapped behind a thin `PhysicsAdapter` interface. On download size, Rapier SIMD costs about 1.18 MB gzip (WASM plus glue) against about 0.88 MB for Jolt ST (0.74 MB WASM plus 0.14 MB glue). That is a modest premium for:
  - 2026-era active maintenance (eight Rust releases in 2026);
  - CCD-by-default and velocity caps, which suit a high-speed tumbling body;
  - built-in contact-force thresholds for bone breaks;
  - snapshots;
  - a deterministic sibling package that uses the same API, for replay verification.
- **Rapier's ragdoll gaps:**
  - There is no shipped ragdoll helper or demo.
  - The spherical joint lacks TS-level cone/twist limits. To work around this, use `JointData.generic` with angular axes left free, then set per-axis limits through the raw API. Alternatively, use multibody joints.
  - There is no joint-impulse readout in JS, so joint stress must be estimated (see section 3).
- **Jolt is the better pure-ragdoll engine** (swing-twist with lambdas, `CalculateConstraintPriorities`, `DriveToPoseUsingMotors`, and skeleton mappers). Its threading cannot be used on iOS Safari, and with JS contact callbacks it is unusable anywhere. So on phones you get a non-SIMD single-thread build with a 128 MB fixed heap, unless you build it yourself with `ENABLE_SIMD=ON`, which is safe since iOS 16.4+. If the "ragdoll feel" researcher finds that Rapier joints feel worse, a custom Jolt build (SIMD on, CROSS_PLATFORM_DETERMINISTIC on if replays matter, smaller INITIAL_MEMORY) is the credible plan B.
- **Havok** offers the cleanest bone-break signal (applied constraint impulses). However, closed source, no snapshots and no Three.js binding make it a poor bet for a long-lived game.
- **Excluded engines:** cannon-es, ammo.js and Oimo should be ruled out because they are unmaintained. Bounce lacks cone/swing-twist joints and CCD, which a high-speed ragdoll needs. PhysX-WASM is too heavy for a fast first load.
- **Per-step cost:** for about 15–20 ragdoll bodies with roughly 15–20 joints, plus a few hundred mostly static or kinematic colliders, any of the WASM engines should step in well under 1–2 ms on a 2023+ phone. This is not measured, and the next point applies. Rapier's 2026 broad-phase rework specifically targets "very large static collider counts".
- **Benchmark it yourself:** build a micro-benchmark of the actual course and ragdoll in both Rapier and Jolt, and run it on a mid-range Android (Snapdragon 7-series) and an iPhone 13/14-class device before committing.

### Gaps
- I found no rigorous, current (2026) head-to-head browser benchmark of Rapier 0.21 vs Jolt 1.1 vs Havok 1.3.14 for ragdolls on phones. The available comparisons are anecdotal forum posts.
- I could not confirm the release date of Jolt C++ v5.6.0 from a primary source. A search snippet said "11 Jul", which matches `jolt-physics` 1.1.0, so it is plausible that 1.1.0 wraps Jolt 5.6.0, but this is unverified.
- The state of kripken/ammo.js builds outside npm was not checked. GitHub API access was blocked and web search was exhausted.
- Whether Rapier's raw (wasm-bindgen) layer exposes joint impulses was not found. Only the public `.d.ts` was checked.
- I did not test whether the JS builds' ~45°-per-step angular cap applies per substep or per step.

## 2. Existing open-source ragdoll examples in the browser

### Takeaway
Jolt is the only engine with official in-browser ragdoll demos. JoltPhysics.js has "Create Rig", "Load Rig", "Kinematic Rig" and "Powered Rig", which drives a ragdoll to an animated pose with motors. Rapier has no ragdoll demo in either its JS testbed or its Rust examples as of October 2026, so you build one from the joints demo. cannon-es has a simple ConeTwist ragdoll. The three.js core repo has physics examples (Rapier, Jolt, Ammo) but none with a ragdoll.

### Cited Findings
- **JoltPhysics.js:**
  - The demo index lists "Create Rig", "Load Rig", "Kinematic Rig", "Powered Rig", "Contact Listener", "Snapshot Demo", "Stress Test Demo (Multi Threaded)" and others — [JoltPhysics.js Examples/index.html](https://github.com/jrouwe/JoltPhysics.js/blob/main/Examples/index.html)
  - The Powered Rig demo loads `Human.tof` through `RagdollLoader`, samples an animation each frame into a `SkeletonPose`, and calls `mRagdoll.DriveToPoseUsingMotors(mPose)` — [powered_rig.html](https://github.com/jrouwe/JoltPhysics.js/blob/main/Examples/rig/powered_rig.html)
  - React wrappers exist: `react-three-jolt` (pmndrs) and `r3f-jolt` — [JoltPhysics.js README](https://github.com/jrouwe/JoltPhysics.js/blob/main/README.md)
- **Rapier:**
  - The 3D JS testbed demos are trimesh, voxels, collisionGroups, pyramid, keva, joints, fountain, damping, heightfield, lockedRotations, convexPolyhedron, ccd, platform, characterController, pidController, glbToTrimesh, glbToConvexHull, compoundShapes, convexDecomposition, softBodies and softTearing. None is a ragdoll — [testbed3d/src/index.ts](https://github.com/dimforge/rapier/blob/master/bindings/typescript/testbed3d/src/index.ts)
  - The Rust 3D example list also has no ragdoll. Relevant debug scenes include `debug_angular_limits3`, `debug_chain_high_mass_ratio3`, `debug_long_chain3`, `debug_rollback3`, `inverse_kinematics3`, `joint_motor_position3` and `ccd3` — [examples3d/all_examples3.rs](https://github.com/dimforge/rapier/blob/master/examples3d/all_examples3.rs)
- **three.js r186** physics examples are `physics_ammo_{break,cloth,instancing,rope,terrain,volume}`, `physics_jolt_instancing` and `physics_rapier_{basic,instancing,joints,character_controller,vehicle_controller,terrain}`. None is a ragdoll — [three.js examples/files.json](https://github.com/mrdoob/three.js/blob/dev/examples/files.json)
- three's physics add-ons load engines from CDNs pinned to old versions: `RapierPhysics.js` uses `@dimforge/rapier3d-compat@0.17.3` and `JoltPhysics.js` uses `jolt-physics@1.0.0` `wasm-compat` — [three 0.186.1 tarball](https://registry.npmjs.org/three/-/three-0.186.1.tgz) (`examples/jsm/physics/*`)
- **cannon-es** ragdoll example: `createRagdoll({angle, angleShoulders, twistAngle})` using `CANNON.ConeTwistConstraint` — [cannon-es examples/ragdoll.html](https://github.com/pmndrs/cannon-es/blob/master/examples/ragdoll.html)
- **PhysX:** a ragdoll demo exists in the kool engine, written in Kotlin — [kool ragdoll demo](https://fabmax.github.io/kool/kool-js/?demo=phys-ragdoll)
- **Havok:** a community Havok-to-Three.js port with a debug viewer exists — [three.js forum](https://discourse.threejs.org/t/i-ported-babylon-jss-havok-physics-plugin-to-three-js/85539)

### Inferences
- **If Jolt:** start from the Jolt "Load Rig"/"Powered Rig" code. Its `RagdollSettings` with `SkeletonMapper` maps a high-detail skeleton (the 53-joint VRM rig) onto a low-detail ragdoll (about 15 bodies), which is exactly the Number Go Down setup.
- **If Rapier:** write a VRM-bone-to-ragdoll mapper. Create one capsule or box per major bone and one joint per parent-child pair. Read physics transforms back into the 53-bone skeleton each frame; the finger, eye, jaw and hair bones stay animated or locked.
- **Don't use three's built-in `RapierPhysics.js` and `JoltPhysics.js` add-ons in production.** They pin CDN versions that predate the 2026 Rapier rework.

### Gaps
- I could not search the three.js forum, CodePen or GitHub for community ragdoll projects (react-three-rapier ragdoll sandboxes, VRM ragdoll demos), because the web-search quota was exhausted and discourse.threejs.org was unreachable from this environment.
- No 2026 VRM-specific ragdoll library was confirmed.

## 3. Detecting bone breaks (impulse/force thresholds, contact events, relative impact velocity)

### Takeaway
Use two signals per bone:
1. **Impact force or impulse on the bone's collider.** Rapier's contact-force events give a per-collider threshold, a `started` flag, and total and max force; Havok collision events carry an applied impulse.
2. **Joint stress.** Jolt swing-twist `GetTotalLambda*` and Havok `GetAppliedImpulses` provide it directly. Rapier JS does not expose it, so estimate it from limit violation and relative angular velocity.

Gate both signals with the relative normal impact velocity at the contact point. Retune any Rapier thresholds tuned before 15 Aug 2026, because 0.35.2 changed impulse scaling.

### Cited Findings
- **Rapier:**
  - Enable events per collider with `collider.setActiveEvents(ActiveEvents.CONTACT_FORCE_EVENTS)` and `setContactForceEventThreshold(threshold)`.
  - Drain them with `eventQueue.drainContactForceEvents(e => ...)`.
  - Each event exposes `collider1()`, `collider2()`, `totalForce()`, `totalForceMagnitude()`, `maxForceDirection()` and `maxForceMagnitude()`.
  - Source: [Rapier 0.21.0 `.d.ts` (tarball)](https://registry.npmjs.org/@dimforge/rapier3d-simd/-/rapier3d-simd-0.21.0.tgz)
- **Rapier 0.35.0** ([Rapier CHANGELOG](https://github.com/dimforge/rapier/blob/master/CHANGELOG.md)):
  - `ContactForceEvent::started` is "true on the step a pair's total contact force first exceeds its `contact_force_event_threshold` ... false while it stays above". This is described as the analogue of PhysX's "threshold force found" vs "persists".
  - `ContactForceEvent` "sums the pair's *solver* manifolds", so reported force matches what the solver applied.
- **Rapier 0.35.2:** reported impulses and contact-force events "drop by `1 / (num_solver_iterations + 1)`" and "no longer vary with `warmstart_coefficient`" — [Rapier CHANGELOG](https://github.com/dimforge/rapier/blob/master/CHANGELOG.md)
- **Rapier JS 0.21.0:** `EventQueue.clear()` now also discards pending contact-force events — [TS CHANGELOG](https://github.com/dimforge/rapier/blob/master/bindings/typescript/CHANGELOG.md)
- **Jolt:**
  - `ContactListenerJS.OnContactAdded(body1, body2, manifold, settings)` / `OnContactPersisted` give the `ContactManifold`: `mWorldSpaceNormal`, `mPenetrationDepth` and contact points — [jolt-physics 1.1.0 types.d.ts](https://registry.npmjs.org/jolt-physics/-/jolt-physics-1.1.0.tgz)
  - Swing-twist and other constraints expose `GetTotalLambdaPosition/Rotation/RotationLimits/Motor()`, the accumulated constraint impulse of the last step — [same](https://registry.npmjs.org/jolt-physics/-/jolt-physics-1.1.0.tgz)
  - Listener callbacks can arrive on multiple threads in nondeterministic order, so "store and sort the information" — [Jolt Architecture](https://github.com/jrouwe/JoltPhysics/blob/master/Docs/Architecture.md)
- **Havok:**
  - `CollisionEvent = [type, ..., /* Impulse applied */ number]` from `HP_World_GetCollisionEvents`.
  - `HP_Constraint_GetAppliedImpulses` returns the linear and angular joint impulse.
  - Events are opt-in per body via `HP_Body_SetEventMask`.
  - Source: [@babylonjs/havok 1.3.14 `HavokPhysics.d.ts`](https://registry.npmjs.org/@babylonjs/havok/-/havok-1.3.14.tgz)

### Inferences
- **Recommended Rapier detector:**
  1. Give each ragdoll limb collider `CONTACT_FORCE_EVENTS` and a per-bone threshold (for example, forearm lower than femur).
  2. Per step, drain events. For events with `started === true`, or with a jump in force above the per-bone break threshold, compute the impact impulse ≈ `totalForceMagnitude() × dt`.
  3. Compute the relative normal velocity at the contact: `v_rel = (v_bone + ω_bone × r) − (v_obstacle + ω_obstacle × r)`, dotted with the normal.
  4. Mark the bone broken when both the impulse and `v_rel` exceed the thresholds and a per-bone cooldown has elapsed.
- **Joint "snaps" (hyperextension):** for each Rapier joint, measure the angle past its anatomical limit and the relative angular velocity of parent and child each step. Break when the overshoot multiplied by the angular speed exceeds a threshold. This approximates joint stress without an impulse readout.
- **Event timing:** because events are produced inside the fixed step, run the break logic in the fixed-step loop and enqueue presentation (slow-mo, x-ray, haptics, score) for the render loop. Sort events by collider handle to keep replays deterministic.
- **Slow-mo:** trigger it on the first break of a run or a multi-bone break. Leave the break detector running during slow-mo, as section 4 explains.

### Gaps
- I found no published per-bone force thresholds for a game ragdoll. These need empirical tuning, possibly informed by the other researcher's biomechanics notes.
- I did not verify whether Rapier's raw WASM layer exposes per-contact impulses (`TempContactManifold.solverContact*`) cheaply enough to use per frame.

## 4. High-speed stability (substeps, CCD, velocity clamps, fixed timestep, slow-mo)

### Takeaway
Run a fixed timestep (1/60 s; 1/120 s if the budget allows) with an accumulator and render interpolation, and never vary `dt`.

On Rapier 0.35+ the defaults already help a lot:
- sweep-based CCD against fixed colliders;
- a linear cap of 400 units/s and an angular cap of about 45° per step;
- a larger prediction distance;
- NaN quarantine.

Beyond the defaults:
- Mark ragdoll limbs as CCD "bullets" so they sweep against moving obstacles too.
- Add extra solver iterations only on the ragdoll's island.
- Scale the world to metres. The mascot is 9.6 units tall, so either scale him or set `lengthUnit`.
- Implement slow-mo by advancing fewer fixed steps per real second, not by shrinking `dt`.

### Cited Findings
- **Rapier timestep doc:** a simulation timestep should "not vary too much during the course of the simulation. A timestep with large variations may cause instabilities" — [Rapier 0.21.0 `world.d.ts`](https://registry.npmjs.org/@dimforge/rapier3d-simd/-/rapier3d-simd-0.21.0.tgz)
- **Rapier 0.35 CCD and stability defaults** ([Rapier CHANGELOG](https://github.com/dimforge/rapier/blob/master/CHANGELOG.md)):
  - Sweep-based CCD: "each fast body is clamped to its earliest impact".
  - "Fast dynamic bodies now always run CCD against fixed colliders."
  - `ccd_enabled` makes a "bullet" that also sweeps kinematic and dynamic bodies.
  - `max_ccd_substeps = 0` disables CCD.
  - Velocity caps of 400 units/s linear and about 45° per step angular.
  - New contact defaults "greatly reducing tunneling through thin walls".
  - NaN quarantine.
  - "Gyroscopic forces are applied per-substep ... improving fast-spinning asymmetric bodies".
- **Rapier 0.36:** "With `max_ccd_substeps > 1`: end-of-step AABBs cover the full next step ... heavy bodies under gravity are no longer flagged as fast" — [Rapier CHANGELOG](https://github.com/dimforge/rapier/blob/master/CHANGELOG.md)
- **Rapier JS knobs:** `world.integrationParameters.maxCcdSubsteps`, `numSolverIterations` (default 4), `rigidBody.enableCcd(true)`, `setSoftCcdPrediction(distance)`, `setAdditionalSolverIterations(n)` (which "lets you increase accuracy on only a subset of the scene") and `lengthUnit` (the scale of internal thresholds) — [Rapier 0.21.0 `.d.ts`](https://registry.npmjs.org/@dimforge/rapier3d-simd/-/rapier3d-simd-0.21.0.tgz)
- **Rapier `additional_solver_iterations`** now "adds whole solver substeps for the body's constraint-connected component, converging much better on high mass ratios" (0.35) — [Rapier CHANGELOG](https://github.com/dimforge/rapier/blob/master/CHANGELOG.md)
- **Jolt CCD:**
  - The default motion quality is Discrete, under which fast, small objects "can easily 'tunnel'". Use `LinearCast` for those.
  - "Fast rotating long objects ... the LinearCast motion quality will fully rotate the object at the beginning of the time step ... there is a chance that the object misses a collision."
  - Source: [Jolt Architecture: CCD](https://github.com/jrouwe/JoltPhysics/blob/master/Docs/Architecture.md)
- **Jolt ghost collisions:** to avoid internal-edge snags on meshes, use `mEnhancedInternalEdgeRemoval` and combine adjacent static shapes into one `StaticCompoundShape` — [Jolt Architecture](https://github.com/jrouwe/JoltPhysics/blob/master/Docs/Architecture.md)
- **Havok** exposes a world-wide `HP_World_SetSpeedLimit(maxLinear, maxAngular)` — [Havok `.d.ts`](https://registry.npmjs.org/@babylonjs/havok/-/havok-1.3.14.tgz)
- **Bounce** defaults to `maxLinearSpeed: 30` and `maxAngularSpeed: 30` — [Bounce docs](https://codeberg.org/perplexdotgg/bounce/src/branch/main/docs/documentation.md)
- **Mascot dimensions:** the model is "About 9.6 units tall, feet at y = 0" — [project asset README](../../number-go-down/assets/README.md) (local file)

### Inferences
- **Fixed-step loop:**
  ```
  acc += min(realDt, 0.1) × timeScale
  while (acc ≥ h) { step(h); acc -= h }
  alpha = acc / h
  ```
  Render with `alpha`-interpolated transforms (store previous and current poses per body). The `min(…, 0.1)` clamp avoids a "spiral of death" after an iOS tab switch or thermal hitch.
- **Slow-mo** sets `timeScale` to about 0.1–0.25 while keeping `h` fixed. This keeps the solver identical, so it stays deterministic and stable. If 0.1× looks steppy at a 60 Hz sim (only 6 sim steps per real second), either:
  - raise the sim rate during slow-mo, using h = 1/240 for the slow-mo window only (h changes rarely, which the Rapier doc tolerates better than per-frame variation); or
  - interpolate render poses, which already smooths this.
- **Scale:** scale the GLB by about 0.19 so he is about 1.8 m tall, or set `lengthUnit ≈ 5.3`. Rapier's tolerances (prediction distance, allowed error, the 400 units/s cap) are tuned for metres.
- **Speeds:**
  - A falling human's terminal velocity (about 55 m/s, from general physics knowledge, not sourced here) is far below the 400 m/s cap.
  - The ~45°-per-step angular cap equals 47 rad/s at 60 Hz. A limb whipped by a high-speed impact may exceed that briefly, so a 120 Hz step doubles the headroom. JS does not expose `setAllowFastRotation` to bypass it.
- **Ragdoll stability recipe for Rapier:**
  - capsule colliders per bone;
  - mass ratios between adjacent bodies kept under about 1:10;
  - collisions between jointed neighbours disabled (`setContactsEnabled(false)` on the joint, or collision groups);
  - `setAdditionalSolverIterations(2–4)` on ragdoll bodies;
  - `enableCcd(true)` on limbs;
  - a light linear and angular damping;
  - static course geometry as convex primitives or a trimesh, with thin walls avoided or thickened.

### Gaps
- I found no published measurements of how many substeps or iterations a mobile ragdoll needs at 30–60 m/s impacts. This needs in-game profiling.
- I found no source on how Rapier's angular cap interacts with `numSolverIterations` substeps in the JS build.

## 5. Architecture: main thread vs Web Worker, SharedArrayBuffer and COOP/COEP on Cloudflare, OffscreenCanvas, iOS frame pacing

### Takeaway
At this scale (about 20 bodies), physics fits comfortably on the main thread. A worker mainly buys protection from main-thread hitches, and costs latency and complexity. Neither Rapier's npm builds nor (on Safari) Jolt's can use WASM threads, so a worker is the only way to parallelise. If you use one, SharedArrayBuffer needs cross-origin isolation, which is a `_headers` file on Cloudflare Workers static assets or Pages.

iOS Safari by default paces `requestAnimationFrame` near 60 fps even on 120 Hz ProMotion displays. It halves to 30 fps in Low Power Mode, under aggressive thermal mitigation, or inside a cross-origin iframe the user hasn't interacted with. So "locked 60" is the realistic iPhone target, and 120 Hz is an Android/Chrome bonus.

### Cited Findings
- **SharedArrayBuffer** support (when cross-origin isolated): Chrome 68, Chrome Android 89, Safari 15.2 (iOS mirrors) — [MDN browser-compat-data: SharedArrayBuffer](https://github.com/mdn/browser-compat-data/blob/main/javascript/builtins/SharedArrayBuffer.json)
- **OffscreenCanvas** — [MDN BCD: OffscreenCanvas](https://github.com/mdn/browser-compat-data/blob/main/api/OffscreenCanvas.json):

  | Context | Chrome | Chrome Android | Safari / iOS |
  |---|---|---|---|
  | OffscreenCanvas | 69 | (mirrors Chrome) | 16.4 |
  | `webgl`/`webgl2` context | 69 | (mirrors Chrome) | 17 |
  | `webgpu` context | 144 | 121 | 26 |

  `contextlost`/`contextrestored` events are not supported in Safari.
- **Jolt threading:** the multithread build "doesn't work in Safari nor with any JS callbacks currently" — [JoltPhysics.js CMakeLists.txt](https://github.com/jrouwe/JoltPhysics.js/blob/main/CMakeLists.txt)
- **Rapier threading:** Rapier's thread pool is a Rust `parallel` feature. The new `unsync-callbacks` feature targets "thread-affine callbacks (a JS closure ...)". The npm WASM is a single module with no worker or thread files (inspected tarball contents) — [Rapier CHANGELOG](https://github.com/dimforge/rapier/blob/master/CHANGELOG.md); [tarball](https://registry.npmjs.org/@dimforge/rapier3d-simd/-/rapier3d-simd-0.21.0.tgz)
- **Cloudflare Workers static assets `_headers`** — [Cloudflare docs: Workers static assets headers](https://developers.cloudflare.com/workers/static-assets/headers/) (source: [cloudflare-docs repo](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/static-assets/headers.mdx)):
  - It is a plain-text `_headers` file in the asset directory. Rules are a URL pattern followed by indented `Name: value` lines.
  - Limits are "up to 100 header rules" and a "2,000 character limit" per line. Splats (`/*`) and placeholders are supported. `! Header` detaches a header.
  - Caveat: "Custom headers defined in the `_headers` file are not applied to responses generated by your Worker code". With `run_worker_first` or SSR, set COOP/COEP in the Worker's `Response`.
  - Default asset headers include `Cache-Control: public, max-age=0, must-revalidate` plus an `ETag`.
- **Cloudflare Pages `_headers`** has the same syntax and limits. Pages Functions responses are excluded — [Cloudflare docs: Pages headers](https://developers.cloudflare.com/pages/configuration/headers/) (source: [cloudflare-docs repo](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/configuration/headers.mdx))
- **COOP/COEP recipe:**
  - The `_headers` file is `/*` then `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. Verify with `crossOriginIsolated === true` in the console.
  - With `require-corp`, cross-origin resources must opt in via CORS or CORP. `credentialless` is an alternative.
  - Sources: [dev.to](https://dev.to/sike_ren_f38951df83469817/why-sharedarraybuffer-forced-me-to-delete-every-third-party-script-on-my-site-4fa6); [Cinevva tutorial](https://app.cinevva.com/tutorials/coop-coep-sharedarraybuffer.html) (secondary sources)
- **WebKit frame pacing (source code, `main` branch):**
  - The preference `PreferPageRenderingUpdatesNear60FPSEnabled` (UI name "Prefer Page Rendering Updates near 60fps") has `default: true`, and `false` only on visionOS — [UnifiedWebPreferences.yaml](https://github.com/WebKit/WebKit/blob/main/Source/WTF/Scripts/Preferences/UnifiedWebPreferences.yaml)
  - `FullSpeedFramesPerSecond = 60` and `HalfSpeedThrottlingFramesPerSecond = 30`. Throttling reasons are `VisuallyIdle`, `OutsideViewport`, `LowPowerMode`, `NonInteractedCrossOriginFrame`, `ThermalMitigation` and `AggressiveThermalMitigation` — [AnimationFrameRate.h](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/graphics/AnimationFrameRate.h)
  - The half-speed reasons are `LowPowerMode`, `NonInteractedCrossOriginFrame`, `VisuallyIdle` and `AggressiveThermalMitigation`. With `preferFrameRatesNear60FPS`, a higher nominal display rate is snapped to the nearest "full speed" (60) rate — [AnimationFrameRate.cpp](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/graphics/AnimationFrameRate.cpp)
  - `Page.cpp` adds `ThermalMitigation`, and sets `AggressiveThermalMitigation` only if `respondToThermalPressureAggressively()` is on. That internal preference defaults to `false` — [Page.cpp](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/Page.cpp); [UnifiedWebPreferences.yaml](https://github.com/WebKit/WebKit/blob/main/Source/WTF/Scripts/Preferences/UnifiedWebPreferences.yaml)

### Inferences
- **Recommended architecture (v1):** a single main thread. Input → fixed-step Rapier → break detection → render with interpolation. Physics for about 20 bodies plus a few hundred static colliders should be well under 2 ms, so a worker adds a frame of latency to the player's touch-sway for little gain.
- **Recommended architecture (v2, if profiling shows main-thread hitches from GC, asset decode or UI):** move physics into a dedicated Worker that steps on its own `setTimeout`/`Atomics.wait` clock. It writes body transforms into a SharedArrayBuffer double-buffer (about 20 bodies × 7 floats is tiny) plus an event ring buffer for breaks; the main thread interpolates. Without SAB, `postMessage` with transferable `Float32Array`s is fine at this size, so COOP/COEP is optional rather than required.
- **OffscreenCanvas rendering in a worker** is possible on iOS 17+ (WebGL) and iOS 26+ (WebGPU). It complicates input, DOM UI and audio, and is not worth it for this game.
- **Frame pacing on iPhone:**
  - Design for 60 fps.
  - Detect 30 fps throttling by measuring rAF deltas. On Low Power Mode or thermal halving, keep the physics at fixed `h` (it catches up via the accumulator) and lower render cost.
  - Don't embed the game in a third-party iframe, such as a portal or a social in-app frame; if you must, require a tap first, because non-interacted cross-origin frames are halved to 30 fps.
- **120 Hz:** treat it as Android-only (Chrome on high-refresh panels runs rAF at display rate — general knowledge, not verified here). Run the sim at a fixed 120 Hz, or at 60 Hz with interpolation, so a frame-rate change never alters gameplay.
- **Cloudflare `_headers` sketch** (if SAB is used):
  ```
  /*
    Cross-Origin-Opener-Policy: same-origin
    Cross-Origin-Embedder-Policy: require-corp
  /assets/*
    Cache-Control: public, max-age=31536000, immutable
  ```
  Any third-party scripts (analytics, ads, leaderboard SDKs on other origins) must send CORP/CORS or they will break.

### Gaps
- I could not verify whether Safari 26/27 changed the 60 fps preference for web content in shipping iOS builds. The WebKit `main` default is `true`. I also could not verify whether any web API lets a page opt into 120 Hz on iOS. The web-search quota was exhausted.
- I could not verify `COEP: credentialless` support in Safari.
- I found no measured data on iPhone thermal throttling over a 60-second WebGL/WebGPU session.

## 6. Rendering performance (WebGLRenderer vs WebGPURenderer/TSL, WebGPU availability, draw calls, instancing, post-processing, dynamic resolution, thermals)

### Takeaway
three.js is at r186 (0.186.1, 24 Sep 2026), and `WebGPURenderer` automatically falls back to a WebGL2 backend. WebGPU is enabled by default in iOS/iPadOS Safari 26+ and in Chrome Android 121+, so a WebGPURenderer/TSL codebase now reaches both target platforms. The trade-offs are:
- a larger bundle (about 728 KB vs 415 KB gzip for the unminified upper bounds);
- a default half-float output buffer, which costs bandwidth;
- ongoing API churn (TSL `PostProcessing` was renamed `RenderPipeline` in r183, and shadow and AO APIs changed in r184–r186).

Mobile budgets should come from on-device profiling. The mascot's heavy materials (clearcoat, sheen, anisotropy, specular, plus 32 morph targets) are the obvious first cost to cut.

### Cited Findings
- **three versions:** 0.186.1 was published 2026-09-24, 0.186.0 on 2026-09-08 and 0.185.0 on 2026-06-25 — [npm registry](https://registry.npmjs.org/three)
- **WebGPURenderer source** ([WebGPURenderer.js (r186)](https://github.com/mrdoob/three.js/blob/dev/src/renderers/webgpu/WebGPURenderer.js)):
  - "By default, the renderer tries to use a WebGPU backend if the browser supports WebGPU. If not, `WebGPURenderer` falls backs to a WebGL 2 backend."
  - `forceWebGL` forces the WebGL2 backend.
  - `outputBufferType` defaults to `HalfFloatType`, which is "recommend[ed] for best quality. To save memory and bandwidth, `UnsignedByteType` might be used."
  - `antialias` is false by default.
- **three.js migration guide** ([three.js Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)):
  - r182→183: "`PostProcessing` has been renamed to `RenderPipeline`", `Clock` is deprecated in favour of `Timer`, and `PCFSoftShadowMap` with `WebGLRenderer` is deprecated.
  - r184→185: `PCFSoftShadowMap` with `WebGPURenderer` was removed ("Use `PCFShadowMap` which is now soft as well"), and the `GTAONode` distance model changed.
  - The upcoming r186→187 notes say both renderers now use `WeakRef`/`FinalizationRegistry`.
- **TSL/WebGPU example coverage in r186** includes `webgpu_postprocessing_bloom`, `_bloom_selective`, `_ao`, `_motion_blur`, `_traa`, `_smaa`, `_fxaa`, `_ssr`, `_ssgi`, `_dof`, `_outline`, `_ca`, `webgpu_instance_mesh`, `webgpu_skinning_instancing` and `webgpu_compute_*` — [three.js examples/files.json](https://github.com/mrdoob/three.js/blob/dev/examples/files.json)
- **Bundle size (my measurement from the three 0.186.1 tarball, unminified, gzip -9):**
  - `three.core.js` + `three.module.js` (WebGL path): 415,205 B.
  - `three.core.js` + `three.webgpu.js`: 728,029 B.
  - The npm package ships no minified builds.
  - Source: [three 0.186.1 tarball](https://registry.npmjs.org/three/-/three-0.186.1.tgz)
- **WebGPU availability:**
  - caniuse: iOS Safari "y" from 26.0 (through 27.2). Desktop Safari is "partial" (default only on macOS 26 Tahoe+). Chrome Android is "y" (current 154). Samsung Internet is "y" from 24. Firefox Android has no support — [caniuse WebGPU data](https://github.com/Fyrd/caniuse/blob/main/features-json/webgpu.json) / [caniuse.com/webgpu](https://caniuse.com/webgpu)
  - MDN BCD: `GPU` in Chrome Android since 121 and Safari 26 — [MDN BCD api/GPU.json](https://github.com/mdn/browser-compat-data/blob/main/api/GPU.json)
  - WebKit's WWDC25 post: WebGPU shipping in Safari 26 for macOS, iOS, iPadOS and visionOS — [WWDC25 WebKit news (repost)](https://discuss.privacyguides.net/t/news-from-wwdc25-webkit-in-safari-26-beta/28226)
  - WebKit source: `WebGPUEnabled` is true when built with `ENABLE(WEBGPU_BY_DEFAULT)` and is disabled in Lockdown Mode — [UnifiedWebPreferences.yaml](https://github.com/WebKit/WebKit/blob/main/Source/WTF/Scripts/Preferences/UnifiedWebPreferences.yaml)
- **WebAssembly SIMD** (needed by `rapier3d-simd`): iOS Safari 16.4+, Chrome 91+, Samsung 16+ — [caniuse wasm-simd data](https://github.com/Fyrd/caniuse/blob/main/features-json/wasm-simd.json)
- **The mascot asset** (parsed from `number-go-down/assets/model/emonad.glb`; also [asset README](../../number-go-down/assets/README.md)):
  - 14,441 triangles in 2 meshes.
  - The `BODY` mesh has 32 morph targets and the `HAIR` mesh has 4.
  - A 53-joint skin.
  - 2 materials using `KHR_materials_clearcoat`, `KHR_materials_specular`, `KHR_materials_anisotropy` and `KHR_materials_sheen`.
  - Vertex attributes include `COLOR_0`/`COLOR_1`.
- **WebKit thermal throttling:** WebKit throttles rAF under `ThermalMitigation`, with a half-speed reason for aggressive mitigation (see section 5) — [AnimationFrameRate.cpp](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/graphics/AnimationFrameRate.cpp)

### Inferences
- **Renderer choice:**
  - For the most predictable phone performance in October 2026, start on `WebGLRenderer`, which is mature, has a smaller bundle and a well-understood mobile cost model.
  - Move to `WebGPURenderer` only if you want TSL effects (selective bloom, TRAA, GPU-compute particles for "bone dust" or debris) and can absorb the API churn. The automatic WebGL2 fallback makes a later switch low-risk, especially if materials are written in TSL from day one.
  - Either way, set `outputBufferType: UnsignedByteType` (WebGPU) or avoid HalfFloat render targets on mid-range phones unless HDR bloom needs them.
- **Starting budget (assumptions to verify on device):**
  - 60 fps leaves a 16.6 ms frame. Aim for about 10–11 ms total on a mid-range phone, to leave thermal headroom over a 60-second run.
  - Split: about 2 ms physics plus game logic, about 1 ms skinning and morphs, about 5–6 ms main pass, and about 2 ms post.
  - Fewer than about 100–150 draw calls.
  - Device pixel ratio capped at about 1.5 (iPhones report 3).
  - At most one shadow-casting light. Prefer a blob or projected shadow for the mascot.
- **Instancing:** draw repeated static obstacles (pegs, girders, coins) with `InstancedMesh` or `BatchedMesh`, one draw per obstacle type. Physics colliders for instanced obstacles are separate, simple primitives. Breakable obstacles swap to pre-fractured pieces from a pooled set.
- **Post-processing on mobile tile GPUs:**
  - Bloom at half or quarter resolution is affordable.
  - SSAO/GTAO and SSR at full resolution are usually not affordable at 60 fps on mid-range phones. Fake AO with baked or vertex AO.
  - Motion blur: use a cheap per-object or camera velocity blur only during high-speed segments, or skip it.
  - X-ray bone view: render the skeleton meshes in a second pass with depth test off and a Fresnel shader. This is cheap because it involves few vertices.
- **Mascot materials:** clearcoat, sheen and anisotropy on hair and body each add shader cost on every pixel he covers. Since he is often close to the camera, consider a custom simplified material (MeshStandard plus a matcap or rim term) on low tiers.
- **Morph targets:** the 32 BODY morph targets (VRM expressions and visemes) are bound and uploaded even when unused. Strip the visemes the game doesn't use, or bake to only the needed expressions such as pain faces.
- **Dynamic resolution:**
  - Measure GPU-bound frame time (rAF delta, plus `EXT_disjoint_timer_query` where available, which is not on iOS).
  - Step the DPR or render scale down in about 10% increments when the 95th-percentile frame time exceeds about 14 ms, and step it back up slowly.
  - Also drop post effects on a detected 30 fps (Low Power or thermal) state.
- **Thermals:** a 60-second run is long enough for an iPhone to begin thermal mitigation under sustained heavy GPU load. Budgeting at about 60–70% of frame time is the main defence. (This is an inference; no measurement was found.)

### Gaps
- I found no 2026 benchmark comparing three.js WebGPURenderer vs WebGLRenderer frame times on iPhones or mid-range Androids. The web-search quota was exhausted before this could be searched.
- I found no measured mobile GPU costs for three's bloom, GTAO or motion blur, and no iPhone thermal-throttling curves for WebGL or WebGPU sessions.
- I did not verify the WebGPU stability of `WebGPURenderer` with skinned and morphed meshes on iOS 26.

## 7. Asset pipeline (glTF compression, KTX2/Basis, download targets, streaming levels)

### Takeaway
The 3.3 MB GLB is about 70% PNG textures (2.31 MB, with the hair base map alone at 1.29 MB). Running it through `gltf-transform` (4.5.1) or `gltfpack` (meshoptimizer 1.3.0) with meshopt geometry compression and KTX2 (or WebP/AVIF) textures should bring it under about 1 MB. The GLB has no VRM extension blocks, so these tools lose nothing. Its four material extensions are all supported by gltfpack.

The decoders are small:
- meshopt about 8 KB gzip;
- Basis transcoder about 260 KB gzip;
- Draco about 75 KB gzip.

Draco is not needed if you use meshopt.

### Cited Findings
- **Asset breakdown** (parsed from `number-go-down/assets/model/emonad.glb`; also [asset README](../../number-go-down/assets/README.md)):
  - The file is 3,323,728 bytes, with 2,306,499 bytes in 5 PNG images: BODY BaseMap 317 KB, BODY Normal 625 KB, HAIR BaseMap 1.29 MB, and two emissive maps of 12 KB and 60 KB.
  - The other 986 KB is geometry and morph targets.
  - `extensionsUsed` is only the 4 `KHR_materials_*` extensions. There is no `VRMC_vrm` or `VRM` extension; the bones simply use VRM humanoid names.
- **gltf-transform `optimize` defaults** ([gltf-transform CLI source](https://github.com/donmccurdy/glTF-Transform/blob/main/packages/cli/src/cli.ts)):
  - `--compress meshopt` (choices `draco|meshopt|quantize|false`).
  - `--texture-compress auto` (choices `ktx2|webp|avif|auto|false`), where "KTX2 optimizes VRAM usage and performance; AVIF and WebP optimize transmission size".
  - `--texture-size 2048`.
  - `--flatten true` and `--join true`.
  - Options for `--instance`, `--simplify`, `--palette` and `--weld`.
- **gltf-transform versions:** `@gltf-transform/core` 4.5.1 was published 2026-09-28 — [npm registry](https://registry.npmjs.org/@gltf-transform/core)
- **gltf-transform unknown extensions:** the reader warns "Missing optional extension" for unregistered extensions — [gltf-transform reader.ts](https://github.com/donmccurdy/glTF-Transform/blob/main/packages/core/src/io/reader.ts)
- **gltfpack options** ([gltfpack README](https://github.com/zeux/meshoptimizer/blob/master/gltf/README.md)):
  - `-cc` produces meshopt-compressed output designed to be further gzip/brotli-compressed by the CDN. `-tc` gives KTX2/BasisU textures, `-tw` gives WebP, and `-si R` simplifies.
  - It fully supports `KHR_materials_anisotropy`, `clearcoat`, `sheen` and `specular`.
  - "gltfpack does not support vendor-specific extensions or custom extensions ... Unknown extension nodes are discarded."
  - Draco is not supported.
  - Extras are discarded unless `-ke` is used.
  - three.js needs `GLTFLoader.setMeshoptDecoder` for `EXT_meshopt_compression`.
- **meshoptimizer versions:** `meshoptimizer` 1.3.0 was published 2026-09-25 — [npm registry](https://registry.npmjs.org/meshoptimizer)
- **Decoder sizes in three 0.186.1** (my measurement, gzip -9) — [three 0.186.1 tarball](https://registry.npmjs.org/three/-/three-0.186.1.tgz):

  | Decoder | Raw | Gzip |
  |---|---|---|
  | `basis_transcoder.wasm` | 527,333 B | 245,408 B |
  | `basis_transcoder.js` | — | 15,060 B |
  | `draco_decoder.wasm` | — | 63,240 B |
  | `draco_wasm_wrapper.js` | — | 11,524 B |
  | `meshopt_decoder.module.js` | — | 7,714 B |

- **three-vrm:** `@pixiv/three-vrm` 3.5.5 was published 2026-07-09 with peer `three >=0.137` — [npm registry](https://registry.npmjs.org/@pixiv/three-vrm)
- **Cloudflare static assets limits:**
  - Files per Worker version: 20,000 on the free plan, 100,000 on the paid plan.
  - 25 MiB per individual file.
  - Source: [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/) (source: [cloudflare-docs](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/platform/limits.mdx))

### Inferences
- **Mascot pipeline:**
  ```
  gltf-transform optimize emonad.glb emonad.opt.glb --compress meshopt --texture-compress ktx2 --texture-size 1024 --join false --flatten false
  ```
  Keep `--join` and `--flatten` off so the skinned mesh, the HAIR child of the Head bone, and the bone hierarchy stay intact.
  - Use UASTC for the normal map and ETC1S for the base and emissive maps. A 1024² hair base map is likely enough on a phone screen.
  - Alternatively use WebP/AVIF for the smallest transfer. These decode to uncompressed RGBA in VRAM, which matters less for 5 textures.
  - Prune unused morph targets (visemes) before compression to cut the 986 KB non-texture part.
  - Expected result: well under 1 MB. This is an estimate, not measured.
- **VRM metadata:** because the GLB has no VRM extension, no metadata is lost. If a later export adds `VRMC_vrm` or springbone extensions, register them in gltf-transform or keep a JSON sidecar, because gltfpack will drop them.
- **First-load target on mobile data** (say 4G at about 5–10 Mbps effective):
  - Aim for under about 2.5–3 MB total before the first playable frame:
    - three (about 150–250 KB gzip after tree-shaking and minification, an estimate below the 415 KB unminified upper bound);
    - Rapier SIMD about 1.15 MB gzip;
    - mascot under 1 MB;
    - first course chunk and UI.
  - The Basis transcoder (about 260 KB) is only worth it if many textures use KTX2. For 5 mascot textures plus a few course atlases, WebP/AVIF may be the smaller total download.
  - Preload the physics WASM with `<link rel=preload as=fetch crossorigin>` while the title screen shows, and use `WebAssembly.compileStreaming` (needs `Content-Type: application/wasm`, which Cloudflare sets by extension).
- **Streaming the course:**
  - Split the vertical course into chunks (glTF per segment with `EXT_mesh_gpu_instancing` for repeated obstacles) and load the next segment while the current one plays.
  - Create static colliders from simple primitives described in JSON rather than mesh-derived trimeshes.
  - Remove colliders behind the player to keep the broad phase small. Rapier's 2026 broad phase already makes static colliders cheap.

### Gaps
- I could not verify actual compressed sizes for this GLB, because the tools were not run here (no network install was attempted).
- I could not compare KTX2 vs WebP/AVIF VRAM and decode time on iOS without on-device tests.

## 8. Build tooling (Vite + TypeScript, WASM loading, code splitting, PWA/offline) and Cloudflare deployment

### Takeaway
Use Vite 8 with TypeScript:
- Load Rapier's non-compat SIMD build, either with `vite-plugin-wasm` because it uses ESM WASM imports, or by switching to `-simd-compat`, which inlines the WASM as base64 at a size cost and loses streaming compilation.
- Load Jolt's `wasm` flavour with `?url` and `locateFile`.
- Lazy-load physics, the mascot and the course chunks behind the title screen.
- Add offline caching with `vite-plugin-pwa` 2.0.0.

Deploy as a Cloudflare Worker with static assets, which Cloudflare now positions as the superset of Pages. Use `_headers` for COOP/COEP and immutable caching, and a Worker route plus Durable Objects or D1 for the leaderboard. Cross-platform-deterministic Rapier opens the option of server-side replay verification within Worker CPU limits on the paid plan.

### Cited Findings
- **Build tool versions (npm registry, checked 2026-10-14):**

  | Package | Version | Published | Source |
  |---|---|---|---|
  | `vite` | 8.3.4 | 2026-10-08 | [npm](https://registry.npmjs.org/vite) |
  | `vite-plugin-pwa` | 2.0.0 (peer `vite ^3.1 … ^8`, `workbox-build ^7.4.1`) | 2026-10-03 | [npm](https://registry.npmjs.org/vite-plugin-pwa) |
  | `vite-plugin-wasm` | 3.6.0 (peer `vite ^2 … ^8`) | 2026-03-15 | [npm](https://registry.npmjs.org/vite-plugin-wasm) |
  | `vite-plugin-top-level-await` | 1.6.0 | 2025-07-17 | [npm](https://registry.npmjs.org/vite-plugin-top-level-await) |
  | `wrangler` | 4.150.0 | 2026-10-13 | [npm](https://registry.npmjs.org/wrangler) |

- **Rapier WASM import:** the entry `rapier_wasm3d.js` starts with `import * as wasm from "./rapier_wasm3d_bg.wasm"`, an ESM-integration-style WASM import (wasm-bindgen bundler target). The README says "Some bundlers will struggle with the `.wasm` file ... Alternative `-compat` versions ... embed the `.wasm` file into the `.js` sources encoded with base64" — [Rapier 0.21.0 tarball](https://registry.npmjs.org/@dimforge/rapier3d-simd/-/rapier3d-simd-0.21.0.tgz)
- **Rapier `-compat` breaking change (JS 0.20.0):** files moved to `dist/` (`dist/rapier.mjs`, etc.), and "-compat packages now pass the embedded wasm module to `init()` as an object" — [TS CHANGELOG](https://github.com/dimforge/rapier/blob/master/bindings/typescript/CHANGELOG.md)
- **Jolt with Vite:** `import joltWasmUrl from "jolt-physics/jolt-physics.wasm.wasm?url"; await initJolt({ locateFile: () => joltWasmUrl })` — [JoltPhysics.js README](https://github.com/jrouwe/JoltPhysics.js/blob/main/README.md)
- **Cloudflare positioning** ([Cloudflare: Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/) (source: [cloudflare-docs](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/static-assets/migration-guides/migrate-from-pages.mdx))):
  - "Unlike Pages, Workers has a distinctly broader set of features available to it, (including Durable Objects, Cron Triggers, and more comprehensive Observability)."
  - Static asset requests are free on both.
  - `_headers` and `_redirects` "are supported natively in Workers with static assets".
- **Workers limits (free vs paid)** — [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/) (source: [cloudflare-docs](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/platform/limits.mdx)):

  | Limit | Free | Paid |
  |---|---|---|
  | CPU time per HTTP request | 10 ms | 5 min (default 30 s, configurable) |
  | Memory | 128 MB | 128 MB |
  | Worker size | 64 MiB | 64 MiB |
  | Startup time | 1 s | 1 s |
  | Requests | 100,000/day | No limit |

  "The average Worker uses approximately 2.2 ms per request."
- **Default asset caching** is `Cache-Control: public, max-age=0, must-revalidate` with an `ETag`, and `_headers` can override it — [Cloudflare static assets headers](https://developers.cloudflare.com/workers/static-assets/headers/)

### Inferences
- **Project layout:**
  - Vite app (TypeScript), with `src/physics/` (an adapter over Rapier), `src/render/`, `src/game/` and `src/net/`.
  - Hashed build output in `dist/assets/*` gets `Cache-Control: public, max-age=31536000, immutable` via `_headers`, and `index.html` keeps the default revalidation.
  - Deploy with Wrangler as one Worker with static assets plus API routes (`/api/score`, `/api/leaderboard`). The custom headers for any Worker-generated responses must be set in code, because `_headers` doesn't apply to them.
  - This mirrors a typical "Number Go Up" Pages/Workers setup. I could not inspect the sibling repo; only its asset copies exist locally.
- **Code splitting:**
  - The title screen and menu go in the entry chunk (three's renderer can load here as well).
  - `import()` the physics engine plus the WASM, and the mascot GLB, as soon as the title renders. Load course segments on demand.
  - Prefer the non-compat Rapier build with `vite-plugin-wasm` (and top-level-await handling) so the browser can stream-compile about 3.3 MB of WASM. The `-compat` base64 variant inflates the JS by about 33% before gzip and forces a synchronous decode on the main thread.
- **PWA:** `vite-plugin-pwa` (Workbox) with precaching of the shell, the physics WASM and the mascot, and runtime caching for course chunks. This allows instant replays and offline play of cached courses. Leaderboard submissions queue when offline.
- **Leaderboard integrity:**
  - With `@dimforge/rapier3d-deterministic`, the client can submit seed + course id + input log (touch-sway samples per fixed step). A Worker can then re-simulate the run with the same WASM to verify the score.
  - Rough estimate: 3,600 steps for 60 s at 60 Hz, at perhaps about 0.1–0.3 ms per step for 20 bodies, is about 0.4–1 s of CPU. That exceeds the free plan's 10 ms per request, so it requires the paid plan, or a queue or Durable Object to absorb it.
  - The determinism caveat: the client must also run the `-deterministic` build. The ordinary and SIMD builds only guarantee same-machine determinism.
  - A cheaper alternative is plausibility checks (score vs run duration, bone-break count vs impacts) plus rate limiting.
- **Jolt and leaderboards:** if Jolt is chosen, its npm builds are not compiled with `CROSS_PLATFORM_DETERMINISTIC`, so replay verification would need a custom Emscripten build, plus the same build in the Worker.

### Gaps
- I could not inspect the sibling "Number Go Up" repo's actual Cloudflare config (wrangler config, `_headers`, Pages vs Workers). It isn't present in this workspace, and GitHub API access was blocked.
- `vite-plugin-wasm` 3.6.0 declares Vite 8 in its peer range, but I did not test it against Rapier 0.21's wasm-bindgen output under Vite 8.
- I found no measured per-step timing of the Rapier deterministic WASM in Cloudflare's workerd runtime, so the replay-verification CPU estimate is unvalidated.
