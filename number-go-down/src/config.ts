// Every tunable in one place. Values marked "report" come from the design
// report's spec; the rest are starting points for playtesting.

export const PHYSICS = {
  step: 1 / 120, // report: 120 Hz fixed step
  maxStepsPerFrame: 8,
  // Rebalanced masses + 8/4 iterations hold the joint limits to ~1 degree
  // (scripts/snap-bisect6.mjs); 6/2 let the spine fold 90+ degrees.
  solverIterations: 8,
  pgsIterations: 4,
  gravity: -13.5, // a little heavier than Earth so falls read as snappy
  // Quadratic air drag tuned for a terminal speed of roughly 30 m/s.
  dragPerSpeed: 0.014, // terminal speed sqrt(g / drag) ~ 25 m/s
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
  targetSpeed: 4.2, // report: +-4 m/s sideways
  maxAccelG: 0.38, // report: start at 0.35 g
  response: 0.2,
  dragPixelsForFull: 90,
  afterImpactScale: 0.3,
  afterImpactTime: 0.25,
  slowmoBoost: 2,
  assistBelow: 14, // m/s along the track: below this, the hill gives him a shove
  assistMax: 10, // m/s^2
  fallSpeed: 7, // m/s across the shaft at full drag
  fallAuthority: 1.5,
};

export const LAUNCH = {
  cancelRadiusPx: 40, // report
  fullPowerScreenFraction: 0.36, // report: full power at 35-40% of screen height
  minSpeed: 12,
  maxSpeed: 27,
  maxYaw: 24 * (Math.PI / 180), // aim left/right
  elevation: 16 * (Math.PI / 180), // launch angle above horizontal
  previewSeconds: 0.9,
};

export const DAMAGE = {
  ignoreBelow: 2.2, // m/s normal speed change: micro contacts
  bruiseAt: 7, // report: ReSkate bruise at 7 m/s
  breakAt: 15, // report says 12 m/s; our falls are faster, so bones hold a little longer
  hitCooldown: 0.12,
  breakCooldown: 0.5, // report: 0.5 s per bone
  refImpact: 16, // m/s that counts as impact strength 1.0
  chainWindow: 1.0, // report: +0.1x per new bone within 1.0 s
};

export const SHOW = {
  t1: 0.08, t2: 0.35, t3Break: true, // report tiers by impact strength
  hitstopScale: 0.02,
  slowmoScale: 0.25, // report: 0.25x in play
  slowmoEaseIn: 0.15,
  slowmoHold: 0.9,
  slowmoEaseOut: 0.3,
  cinematicCooldown: 6.5, // report: 6-8 s
  cinematicSecondsPerRun: 12, // report: max(2, run / 12 s)
  traumaDecay: 0.9,
  maxShakeOffset: 0.35,
  maxShakeRoll: 0.06,
};
