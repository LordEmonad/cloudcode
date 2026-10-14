// Checks whether Rapier's raw per-axis limits clamp a spherical joint.
import RAPIER from '@dimforge/rapier3d-simd-compat';

await RAPIER.init();
const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
world.timestep = 1 / 120;

const parent = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
const child = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, -0.5, 0));
world.createCollider(RAPIER.ColliderDesc.capsule(0.4, 0.1).setTranslation(0, 0, 0).setDensity(1), child);

const data = RAPIER.JointData.spherical({ x: 0, y: 0, z: 0 }, { x: 0, y: 0.5, z: 0 });
const joint = world.createImpulseJoint(data, parent, child, true);
const raw = world.impulseJoints.raw;
const deg = Math.PI / 180;
// Twist about X (joint X = world X here), swing about Y and Z.
raw.jointSetLimits(joint.handle, RAPIER.JointAxis.AngX, -30 * deg, 30 * deg);
raw.jointSetLimits(joint.handle, RAPIER.JointAxis.AngY, -10 * deg, 10 * deg);
raw.jointSetLimits(joint.handle, RAPIER.JointAxis.AngZ, -45 * deg, 45 * deg);

function angles() {
  const q = child.rotation();
  // Swing-twist style readout: rotation angles about each world axis from the quaternion.
  const ax = 2 * Math.atan2(q.x, q.w) / deg, ay = 2 * Math.atan2(q.y, q.w) / deg, az = 2 * Math.atan2(q.z, q.w) / deg;
  return [ax, ay, az].map((v) => v.toFixed(1));
}
for (const [label, torque] of [['about X', { x: 2, y: 0, z: 0 }], ['about Y', { x: 0, y: 2, z: 0 }], ['about Z', { x: 0, y: 0, z: 2 }]]) {
  child.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
  child.setAngvel({ x: 0, y: 0, z: 0 }, true);
  child.setTranslation({ x: 0, y: -0.5, z: 0 }, true);
  child.setLinvel({ x: 0, y: 0, z: 0 }, true);
  for (let i = 0; i < 240; i++) {
    child.resetTorques(true);
    child.addTorque(torque, true);
    world.step();
  }
  console.log(label, 'final angles x/y/z (deg):', angles().join(' / '));
}
