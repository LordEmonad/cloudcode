// Do joint limits hold when the parent body is switched to kinematic at runtime?
import RAPIER from '@dimforge/rapier3d-simd-compat';
await RAPIER.init();
const deg = Math.PI / 180;
function run(label, parentKind) {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  world.timestep = 1 / 120;
  const parent = world.createRigidBody(
    parentKind === 'fixed' ? RAPIER.RigidBodyDesc.fixed()
      : parentKind === 'kinematicDesc' ? RAPIER.RigidBodyDesc.kinematicPositionBased()
        : RAPIER.RigidBodyDesc.dynamic(),
  );
  world.createCollider(RAPIER.ColliderDesc.ball(0.1).setMass(5), parent);
  if (parentKind === 'switched') parent.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
  const child = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 0.1, 0));
  world.createCollider(RAPIER.ColliderDesc.capsule(0.3, 0.1).setTranslation(0, 0.4, 0).setMass(5), child);
  const joint = world.createImpulseJoint(RAPIER.JointData.spherical({ x: 0, y: 0.1, z: 0 }, { x: 0, y: 0, z: 0 }), parent, child, true);
  const raw = world.impulseJoints.raw;
  for (const [ax, lo, hi] of [[3, -15, 15], [4, -20, 20], [5, -20, 25]]) raw.jointSetLimits(joint.handle, ax, lo * deg, hi * deg);
  child.applyImpulse({ x: 0, y: 0, z: 0.8 }, true);
  for (let i = 0; i < 360; i++) world.step();
  const q = child.rotation();
  console.log(label.padEnd(26), 'tilt', (2 * Math.acos(Math.min(1, Math.abs(q.w))) / deg).toFixed(1), 'deg');
}
run('fixed parent', 'fixed');
run('kinematic from desc', 'kinematicDesc');
run('switched to kinematic', 'switched');
