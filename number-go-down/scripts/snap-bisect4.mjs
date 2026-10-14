import RAPIER from '@dimforge/rapier3d-simd-compat';
import fs from 'node:fs';
await RAPIER.init();
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const bytes = Uint8Array.from(Buffer.from(data.snap, 'base64'));
const deg = 180 / Math.PI;
function rel(a, b) { const w = a.w * b.w + a.x * b.x + a.y * b.y + a.z * b.z; return 2 * Math.acos(Math.min(1, Math.abs(w))) * deg; }
function run(label, removeIds, modify) {
  const world = RAPIER.World.restoreSnapshot(bytes);
  const p = Object.fromEntries(data.parts.map((x) => [x.id, { ...x, b: world.getRigidBody(x.body) }]));
  for (const id of removeIds) world.removeRigidBody(p[id].b);
  modify?.(world, p);
  const rows = [];
  for (let i = 1; i <= 240; i++) {
    world.step();
    if (i % 60 === 0) rows.push(['pelvis', 'spine', 'chest', 'head'].slice(1).map((id, k, arr) => rel(p[['pelvis', 'spine', 'chest'][k]].b.rotation(), p[id].b.rotation()).toFixed(0)).join('/'));
  }
  const hm = p.head.b.mass(), hc = p.head.b.localCom();
  console.log(label.padEnd(26), 'ps/sc/ch:', rows.join(' | '), ' headMass', hm.toFixed(2), 'headCom', [hc.x, hc.y, hc.z].map((v) => v.toFixed(2)).join(','));
}
const limbs = ['upperArmL', 'foreArmL', 'upperArmR', 'foreArmR', 'thighL', 'shinL', 'thighR', 'shinR'];
run('torso+head', limbs);
run('torso+head iters 30', limbs, (w) => { w.numSolverIterations = 30; w.numInternalPgsIterations = 4; });
run('torso+head, head 1kg', limbs, (w, p) => { for (const h of p.head.colliders) w.getCollider(h).setMass(0.5); });
run('torso+head, head joint wide', limbs, (w) => { const h = data.parts.find((x) => x.id === 'head').joint; for (const ax of [3,4,5]) w.impulseJoints.raw.jointSetLimits(h, ax, -3, 3); });
