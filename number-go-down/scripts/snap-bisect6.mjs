import RAPIER from '@dimforge/rapier3d-simd-compat';
import fs from 'node:fs';
await RAPIER.init();
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const bytes = Uint8Array.from(Buffer.from(data.snap, 'base64'));
const deg = 180 / Math.PI;
const mul = (a, b) => ({
  w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
  y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
  z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
});
const inv = (q) => ({ x: -q.x, y: -q.y, z: -q.z, w: q.w });
const rel_ = { pelvis: 3.0, spine: 2.4, chest: 2.4, head: 1.3, upperArm: 0.9, foreArm: 0.7, thigh: 1.5, shin: 1.1 };
const key = (id) => id.replace(/[LR]$/, '');
export function violation(world, p, x) {
  const j = world.getImpulseJoint(x.joint);
  const f1 = j.frameX1(), f2 = j.frameX2();
  let r = mul(inv(mul(p[x.parent].b.rotation(), f1)), mul(p[x.id].b.rotation(), f2));
  if (r.w < 0) r = { x: -r.x, y: -r.y, z: -r.z, w: -r.w };
  const raw = world.impulseJoints.raw;
  let worst = 0;
  [r.x, r.y, r.z].forEach((c, k) => {
    const a = 2 * Math.asin(Math.max(-1, Math.min(1, c)));
    const lo = raw.jointLimitsMin(x.joint, 3 + k), hi = raw.jointLimitsMax(x.joint, 3 + k);
    worst = Math.max(worst, a - hi, lo - a);
  });
  return worst * deg;
}
function run(label, iters, pgs, rebalance) {
  const world = RAPIER.World.restoreSnapshot(bytes);
  world.numSolverIterations = iters; world.numInternalPgsIterations = pgs;
  const p = Object.fromEntries(data.parts.map((x) => [x.id, { ...x, b: world.getRigidBody(x.body) }]));
  if (rebalance) {
    const total = data.parts.reduce((s, x) => s + rel_[key(x.id)], 0);
    for (const x of data.parts) {
      const m = 52 * rel_[key(x.id)] / total;
      const cs = x.colliders.map((h) => world.getCollider(h));
      const v = cs.map((c) => c.mass()); const sum = v.reduce((a, b) => a + b, 0);
      cs.forEach((c, i) => c.setMass(m * v[i] / sum));
    }
  }
  const worst = {};
  const pairs = data.parts.filter((x) => x.parent);
  for (let i = 1; i <= 480; i++) {
    world.step();
    for (const x of pairs) worst[x.id] = Math.max(worst[x.id] ?? 0, violation(world, p, x));
  }
  const top = Object.entries(worst).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ');
  console.log(label.padEnd(20), `iters ${iters}/${pgs}`.padEnd(12), 'worst overshoot (deg):', top);
}
for (const [it, pg] of [[6, 2], [8, 4], [12, 4], [30, 4]]) {
  run('original masses', it, pg, false);
  run('rebalanced', it, pg, true);
}
