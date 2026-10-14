// Restores a ragdoll physics snapshot exported from the browser and measures
// spine/chest/head drift under different modifications.
import RAPIER from '@dimforge/rapier3d-simd-compat';
import fs from 'node:fs';
await RAPIER.init();
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const bytes = Uint8Array.from(Buffer.from(data.snap, 'base64'));
const deg = 180 / Math.PI;

function run(label, modify) {
  const world = RAPIER.World.restoreSnapshot(bytes);
  const parts = Object.fromEntries(data.parts.map((p) => [p.id, { ...p, b: world.getRigidBody(p.body) }]));
  modify?.(world, parts);
  for (let i = 0; i < 240; i++) world.step();
  const ang = (id) => { const q = parts[id].b.rotation(); return (2 * Math.acos(Math.min(1, Math.abs(q.w))) * deg).toFixed(1); };
  console.log(label.padEnd(44), 'spine', ang('spine'), 'chest', ang('chest'), 'head', ang('head'),
    'pelvisType', parts.pelvis.b.bodyType(), 'iters', world.numSolverIterations, world.numInternalPgsIterations);
}
const removeJointMotors = (world) => {
  // Motors were configured with zero stiffness; nothing to remove via API, so skip.
};
run('as exported');
run('pelvis fixed', (w, p) => p.pelvis.b.setBodyType(RAPIER.RigidBodyType.Fixed, true));
run('remove arms', (w, p) => { for (const id of ['upperArmL', 'foreArmL', 'upperArmR', 'foreArmR']) w.removeRigidBody(p[id].b); });
run('remove legs', (w, p) => { for (const id of ['thighL', 'shinL', 'thighR', 'shinR']) w.removeRigidBody(p[id].b); });
run('remove arms+legs', (w, p) => { for (const id of ['upperArmL', 'foreArmL', 'upperArmR', 'foreArmR', 'thighL', 'shinL', 'thighR', 'shinR']) w.removeRigidBody(p[id].b); });
run('remove arms+legs+head', (w, p) => { for (const id of ['upperArmL', 'foreArmL', 'upperArmR', 'foreArmR', 'thighL', 'shinL', 'thighR', 'shinR', 'head']) w.removeRigidBody(p[id].b); });
run('iters 20 pgs 4', (w) => { w.numSolverIterations = 20; w.numInternalPgsIterations = 4; });
run('no colliders between parts', (w, p) => {
  for (const part of Object.values(p)) for (const h of part.colliders) {
    const c = w.getCollider(h);
    c.setCollisionGroups(((1 << 15) << 16) | (1 << 12));
  }
});
