// Every tunable in one place. Values marked "report" come from the design
// report's spec; the rest are starting points for playtesting.

export const PHYSICS = {
  step: 1 / 120, // report: 120 Hz fixed step
  maxStepsPerFrame: 8,
  // Rebalanced masses + 8/4 iterations hold the joint limits to ~1 degree
  // (scripts/snap-bisect6.mjs); 6/2 let the spine fold 90+ degrees.
  solverIterations: 8,
  pgsIterations: 4,
  gravity: -17, // heavy: falls read as violent, not floaty
  // Quadratic air drag; terminal speed sqrt(g / drag).
  dragPerSpeed: 0.009, // ~43 m/s terminal
  limbDragBoost: 1.35, // limbs trail behind the torso, the classic falling pose
  maxAngularSpeed: 34, // report: cap angular speed at 20-40 rad/s
};

export const RAGDOLL = {
  modelScale: 0.1875, // report: 9.6 units -> 1.8 m
  totalMass: 52,
  // Relative masses per body. Flatter than the report's table: a light spine
  // under a heavy chest and head made the joint chain go soft, so the torso
  // chain is kept near Jolt's 0.8-1.2 parent/child ratio.
  relMass: {
    pelvis: 3.0, spine: 2.4, chest: 2.4, head: 1.3,
    upperArm: 0.9, foreArm: 0.7, thigh: 1.5, shin: 1.1,
  },
  friction: 0.8,
  restitution: 0.05,
  linearDamping: 0.02,
  angularDamping: 0.6,
  brokenAngularDamping: 0.3,
  // Muscle strength (0..1) of the faint "alive" pose control.
  muscleFreefall: 0.18,
  muscleHeld: 0.55,
  muscleRegainPerSecond: 3.2,
  muscleFloorInContact: 0.06,
};

export const STEER = {
  targetSpeed: 7.5, // m/s sideways at full drag: crosses the road in under a second
  maxAccelG: 0.9, // real authority, not a nudge
  response: 0.16,
  dragPixelsForFull: 80,
  afterImpactScale: 0.45,
  afterImpactTime: 0.2,
  slowmoBoost: 2,
  assistBelow: 16, // m/s along the track: below this, the hill gives him a shove
  assistMax: 12, // m/s^2
  fallSpeed: 9, // m/s across the shaft at full drag
  fallAuthority: 1.6,
};

export const SLAM = {
  cooldown: 1.1, // seconds between slams
  burst: 26, // m/s added straight down (and a little forward)
  forward: 6,
  window: 0.45, // seconds after a slam in which hits count as SLAM hits
  spin: 14, // rad/s of forward flip
};

export const LAUNCH = {
  cancelRadiusPx: 40, // report
  fullPowerScreenFraction: 0.36, // report: full power at 35-40% of screen height
  minSpeed: 16,
  maxSpeed: 34,
  maxYaw: 24 * (Math.PI / 180), // aim left/right
  elevation: 14 * (Math.PI / 180), // launch angle above horizontal
  previewSeconds: 0.9,
};

export const DAMAGE = {
  ignoreBelow: 2.2, // m/s normal speed change: micro contacts
  bruiseAt: 7, // report: ReSkate bruise at 7 m/s
  breakAt: 17, // our falls are fast, so bones hold a little longer than the report's 12
  hitCooldown: 0.1,
  breakCooldown: 0.5, // report: 0.5 s per bone
  refImpact: 18, // m/s that counts as impact strength 1.0
  chainWindow: 0.7, // seconds of silence before the combo meter starts to drain
  chainDecay: 0.55, // seconds for a full meter to drain
  comboPerLink: 0.4,
  comboCap: 6,
  whaleBonus: 0.5, // each whale bonk adds +0.5x
  slamDamage: 1.2, // impacts in the slam window hit harder
  slamPoints: 1.3,
};

export const SHOW = {
  t1: 0.08, t2: 0.35, t3Break: true, // report tiers by impact strength
  hitstopScale: 0.02,
  slowmoScale: 0.22,
  slowmoEaseIn: 0.12,
  slowmoHold: 0.75,
  slowmoEaseOut: 0.28,
  cinematicCooldown: 4.5,
  cinematicSecondsPerRun: 8,
  traumaDecay: 1.1,
  maxShakeOffset: 0.45,
  maxShakeRoll: 0.07,
};
