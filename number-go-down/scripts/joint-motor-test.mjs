// Do raw per-axis motors hold a spherical joint against gravity?
import RAPIER from '@dimforge/rapier3d-simd-compat';
await RAPIER.init();
const deg = 180 / Math.PI;
function run(label, model, stiffness, damping, opts = {}) {
  const world = new RAPIER.World({ x: 0, y: -13.5, z: 0 });
  world.timestep = 1 / 120;
  world.numSolverIterations = 8; world.numInternalPgsIterations = 4;
  const parent = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  const child = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 0, 0).setAngularDamping(0.6).setCanSleep(false));
  world.createCollider(RAPIER.ColliderDesc.capsule(0.2, 0.1).setTranslation(0.3, 0, 0).setRotation({ x: 0, y: 0, z: 0.7071, w: 0.7071 }).setMass(5), child);
  const j = world.createImpulseJoint(RAPIER.JointData.spherical({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }), parent, child, true);
  const raw = world.impulseJoints.raw;
  if (opts.frame) {
    const q = { x: 0.5, y: 0.5, z: 0.5, w: 0.5 };
    j.setLocalFrame1({ x: 0, y: 0, z: 0 }, q); j.setLocalFrame2({ x: 0, y: 0, z: 0 }, q);
  }
  if (opts.limits) for (const ax of [3, 4, 5]) raw.jointSetLimits(j.handle, ax, -1, 1);
  if (!opts.skipMotor) for (const ax of [3, 4, 5]) raw.jointConfigureMotorModel(j.handle, ax, model);
  child.applyImpulse({ x: 0.5, y: 0, z: 0 }, true);
  const trace = [];
  for (let i = 1; i <= 360; i++) {
    if (!opts.skipMotor) for (const ax of [3, 4, 5]) raw.jointConfigureMotorPosition(j.handle, ax, 0, stiffness, damping);
    world.step();
    if (i % 45 === 0) {
      const q = child.rotation();
      trace.push((2 * Math.acos(Math.min(1, Math.abs(q.w))) * deg).toFixed(0));
    }
  }
  console.log(label.padEnd(44), 'tilt over time', trace.join(' '));
}
run('no motor at all', 0, 0, 0, { skipMotor: true });
run('accel-based k=900 d=45', 0, 900, 45);
run('accel-based k=900 d=45, frame', 0, 900, 45, { frame: true });
run('accel-based k=900 d=45, frame+limits', 0, 900, 45, { frame: true, limits: true });
run('force-based k=900 d=45', 1, 900, 45);
run('force-based k=200 d=20', 1, 200, 20);
run('force-based k=0 d=0 (limp?)', 1, 0, 0);
run('force-based k=0 d=0.5', 1, 0, 0.5);
