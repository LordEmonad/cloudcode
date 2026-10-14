import RAPIER from '@dimforge/rapier3d-simd-compat';
import fs from 'node:fs';
await RAPIER.init();
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const bytes = Uint8Array.from(Buffer.from(data.snap, 'base64'));
const deg = 180 / Math.PI;
function rel(a, b) { const w = a.w * b.w + a.x * b.x + a.y * b.y + a.z * b.z; return 2 * Math.acos(Math.min(1, Math.abs(w))) * deg; }
const rel_ = { pelvis: 3.0, spine: 2.4, chest: 2.4, head: 1.3, upperArm: 0.9, foreArm: 0.7, thigh: 1.5, shin: 1.1 };
const key = (id) => id.replace(/[LR]$/, '');
function run(label, iters, pgs, rebalance) {
  const world = RAPIER.World.restoreSnapshot(bytes);
  world.numSolverIterations = iters; world.numInternalPgsIterations = pgs;
  const p = Object.fromEntries(data.parts.map((x) => [x.id, { ...x, b: world.getRigidBody(x.body) }]));
  if (rebalance) {
    const total = data.parts.reduce((s, x) => s + rel_[key(x.id)], 0);
    for (const x of data.parts) {
      const m = 52 * rel_[key(x.id)] / total;
      const cs = x.colliders.map((h) => world.getCollider(h));
      const vol = cs.map((c) => c.mass());
      const sum = vol.reduce((a, b) => a + b, 0);
      cs.forEach((c, i) => c.setMass(m * vol[i] / sum));
    }
  }
  let worst = 0;
  const pairs = data.parts.filter((x) => x.parent);
  for (let i = 1; i <= 480; i++) {
    world.step();
    if (i > 120) for (const x of pairs) worst = Math.max(worst, rel(p[x.parent].b.rotation(), p[x.id].b.rotation()));
  }
  const t0 = performance.now();
  for (let i = 0; i < 600; i++) world.step();
  const ms = (performance.now() - t0) / 600;
  console.log(label.padEnd(28), `iters ${iters}/${pgs}`, 'worst torso-ish joint angle', worst.toFixed(0), 'deg', `step ${ms.toFixed(3)} ms`);
}
for (const [it, pg] of [[6, 2], [8, 2], [8, 4], [12, 2]]) {
  run('original masses', it, pg, false);
  run('rebalanced masses', it, pg, true);
}
