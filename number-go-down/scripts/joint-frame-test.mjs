// Do raw per-axis limits still hold after setLocalFrame and motor configuration?
import RAPIER from '@dimforge/rapier3d-simd-compat';
await RAPIER.init();
const deg = Math.PI / 180;

function run(label, { frame, motor, order }) {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  world.timestep = 1 / 120;
  const parent = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  const child = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 0.1, 0));
  world.createCollider(RAPIER.ColliderDesc.capsule(0.3, 0.1).setTranslation(0, 0.4, 0).setMass(5), child);
  const joint = world.createImpulseJoint(RAPIER.JointData.spherical({ x: 0, y: 0.1, z: 0 }, { x: 0, y: 0, z: 0 }), parent, child, true);
  const raw = world.impulseJoints.raw;
  const limits = () => {
    raw.jointSetLimits(joint.handle, RAPIER.JointAxis.AngX, -15 * deg, 15 * deg);
    raw.jointSetLimits(joint.handle, RAPIER.JointAxis.AngY, -20 * deg, 20 * deg);
    raw.jointSetLimits(joint.handle, RAPIER.JointAxis.AngZ, -20 * deg, 25 * deg);
  };
  const frames = () => {
    if (!frame) return;
    // Joint X = world up, Y = world forward (+Z), Z = world +X.
    const q = { x: 0.5, y: 0.5, z: 0.5, w: 0.5 }; // maps X->Y, Y->Z, Z->X
    joint.setLocalFrame1({ x: 0, y: 0.1, z: 0 }, q);
    joint.setLocalFrame2({ x: 0, y: 0, z: 0 }, q);
  };
  if (order === 'framesFirst') { frames(); limits(); } else { limits(); frames(); }
  if (motor) for (const ax of [3, 4, 5]) raw.jointConfigureMotorModel(joint.handle, ax, 0);
  child.applyImpulse({ x: 0, y: 0, z: 0.8 }, true); // tip it over about world X
  for (let i = 0; i < 360; i++) {
    if (motor) for (const ax of [3, 4, 5]) raw.jointConfigureMotorPosition(joint.handle, ax, 0, 0, 0.45);
    world.step();
  }
  const q = child.rotation();
  const angle = 2 * Math.acos(Math.min(1, Math.abs(q.w))) / deg;
  console.log(label.padEnd(36), 'tilt', angle.toFixed(1), 'deg', JSON.stringify([q.x, q.y, q.z, q.w].map((v) => +v.toFixed(3))));
}
run('default frames, limits', { frame: false, motor: false });
run('frames then limits', { frame: true, motor: false, order: 'framesFirst' });
run('limits then frames', { frame: true, motor: false, order: 'limitsFirst' });
run('frames then limits + motors', { frame: true, motor: true, order: 'framesFirst' });
run('default frames + motors', { frame: false, motor: true });
