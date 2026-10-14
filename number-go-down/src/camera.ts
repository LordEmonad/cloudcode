import * as THREE from 'three';
import { SHOW } from './config';
import type { Frame } from './course';

// Chase camera for the descent: behind and above Emonad along the track's
// direction, looking ahead and down the slope. It swings overhead when the
// track drops vertically, frames the crater at rest, and blends into a close
// orbit during slow-mo cinematics. Trauma-squared shake, no roll in play.

const UP = new THREE.Vector3(0, 1, 0);

export type CamMode = 'aim' | 'chase' | 'rest';

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  trauma = 0;
  cinematic = 0;
  orbit = 0;
  shakeScale = 1;
  private kick = new THREE.Vector3();
  private kickVel = new THREE.Vector3();
  private pos = new THREE.Vector3(0, 5, 10);
  private look = new THREE.Vector3(0, 0, -10);
  private fwd = new THREE.Vector3(0, 0, -1);
  private flatFwd = new THREE.Vector3(0, 0, -1);
  /** Horizontal direction toward the crater's far wall (set by the game). */
  restForward = new THREE.Vector3(0, 0, -1);
  private dist = 8;
  private height = 3;
  private t = 0;
  private baseFov = 64;
  private fovKick = 0;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(this.baseFov, aspect, 0.1, 2000);
    this.camera.position.copy(this.pos);
  }

  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    // Portrait phones need a taller field of view to see down the slope.
    this.baseFov = aspect < 0.6 ? 66 : 54;
    this.camera.updateProjectionMatrix();
  }

  addTrauma(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  punch(dir: THREE.Vector3, strength: number): void {
    this.kickVel.addScaledVector(dir, strength);
  }

  boostFov(amount: number): void {
    this.fovKick = Math.max(this.fovKick, amount);
  }

  snapAim(pouch: THREE.Vector3): void {
    this.fwd.set(0, 0, -1);
    this.flatFwd.set(0, 0, -1);
    this.aimPose(pouch, 0, this.pos, this.look);
    this.camera.position.copy(this.pos);
    this.camera.lookAt(this.look);
  }

  private aimPose(pouch: THREE.Vector3, pull: number, pos: THREE.Vector3, look: THREE.Vector3): void {
    // A crane shot from behind and above the slingshot: Emonad in the pouch,
    // the Gates of Hell, and the road winding down into the abyss beyond.
    pos.set(pouch.x * 0.4, pouch.y + 6.4 + pull * 1.0, pouch.z + 9.0 + pull * 2.6);
    look.set(pouch.x * 0.2, pouch.y - 6, pouch.z - 26);
  }

  /** Sideways steering input (-1..1) rolls the camera a little, like leaning into a turn. */
  lean = 0;

  update(dt: number, target: THREE.Vector3, velocity: THREE.Vector3, mode: CamMode, frame: Frame | null, closeUp: THREE.Vector3, pull = 0, restCenter?: THREE.Vector3): void {
    this.t += dt;
    const speed = velocity.length();
    const desiredPos = new THREE.Vector3();
    const desiredLook = new THREE.Vector3();
    let followRate = 4;

    if (mode === 'aim') {
      this.aimPose(target, pull, desiredPos, desiredLook);
      followRate = 6;
    } else if (mode === 'rest' && restCenter) {
      // Hanging over the bullseye, the far wall at the top of the screen.
      desiredLook.copy(restCenter).lerp(target, 0.35);
      desiredPos.copy(restCenter).add(new THREE.Vector3(0, 13, 0)).addScaledVector(this.restForward, -3.5);
      this.flatFwd.lerp(this.restForward, 1 - Math.exp(-dt * 2)).normalize();
      followRate = 2.5;
    } else if (frame) {
      // Smooth the track direction so corners and the drop swing the camera, not snap it.
      this.fwd.lerp(frame.tangent, 1 - Math.exp(-dt * 2.4)).normalize();
      const f = this.fwd;
      const flat = new THREE.Vector3(f.x, 0, f.z);
      if (flat.lengthSq() > 0.02) this.flatFwd.lerp(flat.normalize(), 1 - Math.exp(-dt * 3)).normalize();
      const vertical = THREE.MathUtils.clamp(-f.y, 0, 1);
      // "Up" for the camera: world up with the forward component removed; over a sheer drop, back the way he came.
      const up = UP.clone().addScaledVector(f, -UP.dot(f));
      if (vertical > 0.85 || up.lengthSq() < 0.05) up.copy(this.flatFwd).negate();
      up.normalize();
      const fast = THREE.MathUtils.clamp(speed / 26, 0, 1);
      const desiredDist = THREE.MathUtils.lerp(4.6, 7.2, fast) + vertical * 5;
      this.dist += (desiredDist - this.dist) * (1 - Math.exp(-dt * 2));
      this.height += (THREE.MathUtils.lerp(1.9, 1.4, vertical) - this.height) * (1 - Math.exp(-dt * 2));
      // Stay on the track's centreline sideways, but follow him most of the way.
      const lateral = target.clone().sub(frame.point).dot(frame.right);
      const anchor = frame.point.clone().addScaledVector(frame.right, lateral * 0.75);
      anchor.addScaledVector(UP, target.clone().sub(frame.point).dot(UP) * (1 - vertical));
      if (vertical > 0.5) anchor.copy(target);
      desiredPos.copy(anchor).addScaledVector(f, -this.dist).addScaledVector(up, this.height);
      desiredLook.copy(target).addScaledVector(f, THREE.MathUtils.lerp(3.5, 9, fast)).addScaledVector(up, -0.6);
      followRate = 6 + Math.min(speed, 30) * 0.25;
    } else {
      desiredPos.copy(target).add(new THREE.Vector3(0, 4, 8));
      desiredLook.copy(target);
    }

    const k = 1 - Math.exp(-dt * followRate);
    this.pos.lerp(desiredPos, k);
    this.look.lerp(desiredLook, Math.min(1, k * 1.4));

    // Cinematic: blend toward a close orbit around Emonad.
    const c = this.cinematic;
    let camPos = this.pos.clone();
    let camLook = this.look.clone();
    if (c > 0.001) {
      const toCam = this.pos.clone().sub(closeUp);
      toCam.y = Math.max(toCam.y, 1.5);
      toCam.normalize().applyAxisAngle(UP, this.orbit * c);
      const close = closeUp.clone().addScaledVector(toCam, 4.4);
      camPos = this.pos.clone().lerp(close, c);
      camLook = this.look.clone().lerp(closeUp, c);
    }

    // Directional kick: damped spring back to zero.
    this.kickVel.addScaledVector(this.kick, -260 * dt);
    this.kickVel.multiplyScalar(Math.exp(-dt * 16));
    this.kick.addScaledVector(this.kickVel, dt);

    // Trauma-squared shake with smooth noise.
    this.trauma = Math.max(0, this.trauma - SHOW.traumaDecay * dt);
    const shake = this.trauma * this.trauma * this.shakeScale * (1 - c * 0.5);
    const ox = noise(this.t * 18, 1.3) * SHOW.maxShakeOffset * shake;
    const oy = noise(this.t * 18, 7.1) * SHOW.maxShakeOffset * shake;
    const roll = noise(this.t * 14, 3.7) * SHOW.maxShakeRoll * shake + this.lean * -0.06;

    this.camera.position.copy(camPos).add(this.kick).add(new THREE.Vector3(ox, oy, 0));
    this.camera.up.copy(UP);
    // Looking straight down: the way he is heading is the top of the screen.
    if (Math.abs(camLook.clone().sub(this.camera.position).normalize().y) > 0.9) this.camera.up.copy(this.flatFwd);
    this.camera.lookAt(camLook.x + this.kick.x * 0.5, camLook.y + this.kick.y * 0.5, camLook.z + this.kick.z * 0.5);
    this.camera.rotateZ(roll);

    this.fovKick = Math.max(0, this.fovKick - dt * 12);
    const fov = this.baseFov * (1 - 0.18 * c) + this.fovKick + THREE.MathUtils.clamp(speed - 16, 0, 20) * 0.45;
    if (Math.abs(fov - this.camera.fov) > 0.01) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }
}

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
