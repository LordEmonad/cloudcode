import RAPIER from '@dimforge/rapier3d-simd-compat';
import fs from 'node:fs';
await RAPIER.init();
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const bytes = Uint8Array.from(Buffer.from(data.snap, 'base64'));
const deg = 180 / Math.PI;
function relAngle(a, b) {
  const w = a.w * b.w + a.x * b.x + a.y * b.y + a.z * b.z;
  return 2 * Math.acos(Math.min(1, Math.abs(w))) * deg;
}
function run(label, removeIds, modify) {
  const world = RAPIER.World.restoreSnapshot(bytes);
  const parts = Object.fromEntries(data.parts.map((p) => [p.id, { ...p, b: world.getRigidBody(p.body) }]));
  for (const id of removeIds) world.removeRigidBody(parts[id].b);
  modify?.(world, parts);
  const rows = [];
  for (let i = 1; i <= 240; i++) {
    world.step();
    if (i % 60 === 0) rows.push(`ps ${relAngle(parts.pelvis.b.rotation(), parts.spine.b.rotation()).toFixed(1)} sc ${relAngle(parts.spine.b.rotation(), parts.chest.b.rotation()).toFixed(1)}`);
  }
  console.log(label.padEnd(30), rows.join(' | '));
}
const limbs = ['upperArmL', 'foreArmL', 'upperArmR', 'foreArmR', 'thighL', 'shinL', 'thighR', 'shinR', 'head'];
run('pelvis+spine+chest', limbs);
run('...chest joint limits wide', limbs, (w) => { const h = data.parts.find((p) => p.id === 'chest').joint; for (const ax of [3,4,5]) w.impulseJoints.raw.jointSetLimits(h, ax, -3, 3); });
run('...iters 30', limbs, (w) => { w.numSolverIterations = 30; });
run('...pgs 10', limbs, (w) => { w.numInternalPgsIterations = 10; });
run('...gravity off', limbs, (w) => { w.gravity = { x: 0, y: 0, z: 0 }; });
