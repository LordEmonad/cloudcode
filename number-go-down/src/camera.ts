import * as THREE from 'three';
import { SHOW } from './config';
import { SHAFT } from './course';

// Follow camera for a portrait fall. Report: Emonad ~30% from the top, view
// widens with speed for >= 0.8 s of warning, trauma-squared shake, no roll in
// normal play, zoom + orbit only during slow-mo cinematics.

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  trauma = 0;
  private kick = new THREE.Vector3();
  private kickVel = new THREE.Vector3();
  private pos = new THREE.Vector3(0, 2, 13);
  private look = new THREE.Vector3(0, 1, 0);
  private dist = 13;
  private pitch = 0.18;
  private t = 0;
  cinematic = 0; // 0..1 blend toward the close-up framing
  orbit = 0; // radians of orbit during a cinematic
  shakeScale = 1;
  private baseFov = 60;
  private fovKick = 0;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(this.baseFov, aspect, 0.1, 400);
    this.camera.position.copy(this.pos);
  }

  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    // Narrow screens need a wider vertical field of view to keep the shaft in frame.
    this.baseFov = aspect < 0.6 ? 62 : 52;
    this.camera.updateProjectionMatrix();
  }

  addTrauma(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  /** Directional kick along a hit normal (report: T2 slams). */
  punch(dir: THREE.Vector3, strength: number): void {
    this.kickVel.addScaledVector(dir, strength);
  }

  boostFov(amount: number): void {
    this.fovKick = Math.max(this.fovKick, amount);
  }

  snapTo(target: THREE.Vector3, distance: number): void {
    this.dist = distance;
    this.look.copy(target);
    this.pos.set(target.x, target.y + 0.5, target.z + distance);
    this.camera.position.copy(this.pos);
    this.camera.lookAt(this.look);
  }

  /**
   * @param target the point to follow (Emonad's centre of mass)
   * @param velocity his velocity, for look-ahead and zoom-out with speed
   * @param mode 'aim' frames the slingshot; 'fall' leads the fall; 'rest' frames the crater
   */
  update(dt: number, target: THREE.Vector3, velocity: THREE.Vector3, mode: 'aim' | 'fall' | 'rest', closeUp: THREE.Vector3): void {
    this.t += dt;
    const speed = velocity.length();
    const fall = Math.max(0, -velocity.y);
    let desiredDist: number;
    let pitch = 0.18; // camera height above the look point, as a fraction of distance
    const desiredLook = new THREE.Vector3();
    if (mode === 'aim') {
      // Zoom out a little as the band stretches so the whole pull stays in frame.
      const pull = THREE.MathUtils.clamp(target.y - 2.9, 0, 3);
      desiredDist = 8.6 + pull * 1.3;
      desiredLook.set(target.x * 0.3, target.y - 1.6 - pull * 0.35, 0);
      pitch = 0.1;
    } else if (mode === 'rest') {
      // Frame the wells, their signs and Emonad in the crater.
      desiredDist = 11.5;
      desiredLook.set(THREE.MathUtils.clamp(target.x * 0.25, -0.6, 0.6), SHAFT.floorY + 2.4, 0);
      pitch = 0.16;
    } else {
      // Close enough to read the ragdoll, wider as he speeds up, tilted down
      // into the pit so the next obstacles show in perspective.
      desiredDist = THREE.MathUtils.clamp(9.5 + fall * 0.22, 9.5, 14.5);
      const halfH = desiredDist * Math.tan(THREE.MathUtils.degToRad(this.baseFov / 2));
      // Emonad sits ~30% from the top: look at a point below him.
      const lead = 0.42 * halfH * THREE.MathUtils.clamp(fall / 8, 0.4, 1);
      desiredLook.set(THREE.MathUtils.clamp(target.x * 0.6, -1.5, 1.5), target.y - lead, 0);
      pitch = 0.3;
    }
    // Catch up faster when he is moving fast (the launch would otherwise leave the camera behind).
    const rate = mode === 'fall' ? 8 + Math.min(speed, 30) * 0.35 : 4;
    const k = 1 - Math.exp(-dt * rate);
    this.dist += (desiredDist - this.dist) * (1 - Math.exp(-dt * 2.5));
    this.look.lerp(desiredLook, k);
    this.pitch += (pitch - this.pitch) * (1 - Math.exp(-dt * 3));
    // Do not let the camera peek below the crater floor.
    this.look.y = Math.max(this.look.y, SHAFT.floorY + 1.6);

    // Cinematic: blend toward a close, slightly orbiting shot of Emonad.
    const c = this.cinematic;
    const camLook = this.look.clone().lerp(closeUp, c);
    const d = THREE.MathUtils.lerp(this.dist, Math.max(4.4, this.dist * 0.36), c);
    const yaw = this.orbit * c;
    const height = THREE.MathUtils.lerp(this.pitch * d, 0.6, c) + 0.4;
    this.pos.set(camLook.x + Math.sin(yaw) * d, camLook.y + height, Math.cos(yaw) * d + camLook.z * (1 - c));

    // Directional kick: damped spring back to zero.
    this.kickVel.addScaledVector(this.kick, -260 * dt);
    this.kickVel.multiplyScalar(Math.exp(-dt * 16));
    this.kick.addScaledVector(this.kickVel, dt);

    // Trauma-squared shake with smooth noise, scaled by distance (Sakurai: zoomed-in shots shake less).
    this.trauma = Math.max(0, this.trauma - SHOW.traumaDecay * dt);
    const shake = this.trauma * this.trauma * this.shakeScale * (d / 13);
    const ox = noise(this.t * 18, 1.3) * SHOW.maxShakeOffset * shake;
    const oy = noise(this.t * 18, 7.1) * SHOW.maxShakeOffset * shake;
    const roll = noise(this.t * 14, 3.7) * SHOW.maxShakeRoll * shake;

    this.camera.position.copy(this.pos).add(this.kick).add(new THREE.Vector3(ox, oy, 0));
    this.camera.lookAt(camLook.x + this.kick.x * 0.5, camLook.y + this.kick.y * 0.5, camLook.z);
    this.camera.rotateZ(roll);

    this.fovKick = Math.max(0, this.fovKick - dt * 12);
    const fov = this.baseFov * (1 - 0.22 * c) + this.fovKick + THREE.MathUtils.clamp(speed - 20, 0, 12) * 0.25;
    if (Math.abs(fov - this.camera.fov) > 0.01) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }
}

// Cheap smooth 1D value noise in [-1, 1].
function noise(x: number, seed: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const a = hash(i + seed * 57.3);
  const b = hash(i + 1 + seed * 57.3);
  const u = f * f * (3 - 2 * f);
  return (a + (b - a) * u) * 2 - 1;
}

function hash(n: number): number {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}
