import RAPIER from '@dimforge/rapier3d-simd-compat';
import { PHYSICS } from './config';

export { RAPIER };
export type World = InstanceType<typeof RAPIER.World>;
export type RigidBody = ReturnType<World['createRigidBody']>;
export type Collider = ReturnType<World['createCollider']>;

// Collision group bits. Bits 0-11 are the twelve ragdoll parts, so each part
// can opt out of colliding with the parts it overlaps at rest.
export const GROUP = {
  partBit: (i: number) => 1 << i,
  ENV: 1 << 12,
  SENSOR: 1 << 13,
  DEBRIS: 1 << 14,
  ALL_PARTS: (1 << 12) - 1,
};

export function groups(membership: number, filter: number): number {
  return ((membership & 0xffff) << 16) | (filter & 0xffff);
}

export async function initPhysics(): Promise<World> {
  await RAPIER.init();
  const world = new RAPIER.World({ x: 0, y: PHYSICS.gravity, z: 0 });
  world.timestep = PHYSICS.step;
  world.numSolverIterations = PHYSICS.solverIterations;
  world.numInternalPgsIterations = PHYSICS.pgsIterations;
  return world;
}
