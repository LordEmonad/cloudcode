import RAPIER from '@dimforge/rapier3d-simd-compat';
import fs from 'node:fs';
await RAPIER.init();
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const bytes = Uint8Array.from(Buffer.from(data.snap, 'base64'));
const deg = 180 / Math.PI;
const torsoOnly = ['upperArmL', 'foreArmL', 'upperArmR', 'foreArmR', 'thighL', 'shinL', 'thighR', 'shinR', 'head', 'chest'];

function run(label, modify, removeIds = torsoOnly) {
  const world = RAPIER.World.restoreSnapshot(bytes);
  const parts = Object.fromEntries(data.parts.map((p) => [p.id, { ...p, b: world.getRigidBody(p.body) }]));
  for (const id of removeIds) world.removeRigidBody(parts[id].b);
  modify?.(world, parts);
  const rel = () => {
    const a = parts.pelvis.b.rotation(), b = parts.spine.b.rotation();
    // relative rotation pelvis^-1 * spine
    const w = a.w * b.w + a.x * b.x + a.y * b.y + a.z * b.z;
    return (2 * Math.acos(Math.min(1, Math.abs(w))) * deg).toFixed(1);
  };
  const trace = [];
  for (let i = 1; i <= 240; i++) { world.step(); if (i % 40 === 0) trace.push(rel()); }
  console.log(label.padEnd(40), 'pelvis->spine angle every 40 steps:', trace.join(' '));
}
const raw = (w) => w.impulseJoints.raw;
const spineJoint = data.parts.find((p) => p.id === 'spine').joint;
run('pelvis+spine only (as exported)');
run('limits disabled (huge)', (w) => { for (const ax of [3, 4, 5]) raw(w).jointSetLimits(spineJoint, ax, -3, 3); });
run('limits re-set to +-0.2', (w) => { for (const ax of [3, 4, 5]) raw(w).jointSetLimits(spineJoint, ax, -0.2, 0.2); });
run('motor model force-based', (w) => { for (const ax of [3, 4, 5]) raw(w).jointConfigureMotorModel(spineJoint, ax, 1); });
run('motor stiff 0 damping 0', (w) => { for (const ax of [3, 4, 5]) raw(w).jointConfigureMotorPosition(spineJoint, ax, 0, 0, 0); });
run('pelvis fixed', (w, p) => p.pelvis.b.setBodyType(RAPIER.RigidBodyType.Fixed, true));
