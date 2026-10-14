import * as THREE from 'three';
import { toon } from './materials';
import { studdedBeltTexture } from './textures';
import { LAUNCH, PHYSICS } from './config';

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

/** The studded-belt band between the two guitar-neck posts, plus the aim preview. */
export class Slingshot {
  group = new THREE.Group();
  readonly rest: THREE.Vector3;
  readonly pouch = new THREE.Vector3();
  private bands: THREE.Mesh[] = [];
  private pouchMesh: THREE.Mesh;
  private dots: THREE.InstancedMesh;
  private ghostDots: THREE.InstancedMesh;
  private snapVel = new THREE.Vector3();
  private snapping = false;
  private beltTex: THREE.Texture;
  private readonly dotCount = 14;
  private lastPath: THREE.Vector3[] = [];

  constructor(scene: THREE.Scene, private tips: { left: THREE.Vector3; right: THREE.Vector3 }) {
    this.rest = tips.left.clone().add(tips.right).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.35, 0.05));
    this.pouch.copy(this.rest);
    this.beltTex = studdedBeltTexture();
    for (let i = 0; i < 2; i++) {
      const tex = this.beltTex.clone();
      tex.needsUpdate = true;
      const band = new THREE.Mesh(new THREE.BoxGeometry(1, 0.3, 0.06), toon(0xffffff, { map: tex, rim: 0xff4fd8, rimStrength: 0.5 }));
      this.bands.push(band);
      this.group.add(band);
    }
    this.pouchMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.34, 20, 1, true, Math.PI * 0.15, Math.PI * 0.7),
      toon(0x1a1220, { side: THREE.DoubleSide, rim: 0xff4fd8, rimStrength: 0.6 }),
    );
    this.pouchMesh.rotation.z = Math.PI / 2;
    this.group.add(this.pouchMesh);

    const dotGeo = new THREE.SphereGeometry(0.11, 10, 8);
    this.dots = new THREE.InstancedMesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xfff7f2, toneMapped: false }), this.dotCount);
    this.ghostDots = new THREE.InstancedMesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xff4fd8, transparent: true, opacity: 0.35, depthWrite: false }), this.dotCount);
    this.dots.visible = false;
    this.ghostDots.visible = false;
    this.group.add(this.dots, this.ghostDots);
    scene.add(this.group);
    this.updateBands();
  }

  /**
   * Turn a drag (in screen pixels, +y down) into a launch.
   * Report: pull up to fling down; ease-out power; full power at ~36% of screen height.
   */
  aimFromDrag(dx: number, dy: number, screenH: number): { power: number; velocity: THREE.Vector3; pull: THREE.Vector3; cancelled: boolean } {
    const len = Math.hypot(dx, dy);
    const cancelled = len < LAUNCH.cancelRadiusPx;
    const raw = Math.min(1, len / (LAUNCH.fullPowerScreenFraction * screenH));
    const power = 1 - (1 - raw) ** 2;
    // Pulling back up (screen -y) means flinging down; clamp to a cone around straight down.
    let angle = Math.atan2(-dx, -dy); // 0 = straight down when dragging straight up
    if (len < 1) angle = 0;
    angle = THREE.MathUtils.clamp(angle, -LAUNCH.maxAngleFromDown, LAUNCH.maxAngleFromDown);
    const dir = new THREE.Vector3(Math.sin(angle), -Math.cos(angle), 0);
    const speed = LAUNCH.minSpeed + power * (LAUNCH.maxSpeed - LAUNCH.minSpeed);
    const pull = dir.clone().multiplyScalar(-(0.25 + power * 2.3));
    return { power, velocity: dir.multiplyScalar(speed), pull, cancelled };
  }

  setPull(pull: THREE.Vector3, velocity: THREE.Vector3 | null): void {
    this.snapping = false;
    this.pouch.copy(this.rest).add(pull);
    this.updateBands();
    if (velocity) this.showPreview(velocity);
    else this.dots.visible = false;
  }

  private path(velocity: THREE.Vector3): THREE.Vector3[] {
    const pts: THREE.Vector3[] = [];
    const g = PHYSICS.gravity;
    for (let i = 1; i <= this.dotCount; i++) {
      const t = (i / this.dotCount) * LAUNCH.previewSeconds;
      pts.push(new THREE.Vector3(
        this.pouch.x + velocity.x * t,
        this.pouch.y + velocity.y * t + 0.5 * g * t * t,
        this.pouch.z + 0.05,
      ));
    }
    return pts;
  }

  private showPreview(velocity: THREE.Vector3): void {
    const m = new THREE.Matrix4();
    const pts = this.path(velocity);
    pts.forEach((p, i) => {
      const s = 1 - i / (this.dotCount * 1.4);
      m.makeScale(s, s, s).setPosition(p);
      this.dots.setMatrixAt(i, m);
    });
    this.dots.instanceMatrix.needsUpdate = true;
    this.dots.visible = true;
    this.lastPath = pts;
  }

  /** Leave the previous launch as faint ghost dots (report: trace the previous launch). */
  private keepGhost(): void {
    if (!this.lastPath.length) return;
    const m = new THREE.Matrix4();
    this.lastPath.forEach((p, i) => {
      m.makeScale(0.8, 0.8, 0.8).setPosition(p);
      this.ghostDots.setMatrixAt(i, m);
    });
    this.ghostDots.instanceMatrix.needsUpdate = true;
    this.ghostDots.visible = true;
  }

  release(): void {
    this.keepGhost();
    this.dots.visible = false;
    this.snapping = true;
    this.snapVel.set(0, 0, 0);
  }

  cancel(): void {
    this.dots.visible = false;
    this.snapping = true;
  }

  update(dt: number): void {
    if (this.snapping) {
      // Under-damped spring: the belt twangs past rest a few times.
      const k = 320;
      const c = 7;
      _a.copy(this.rest).sub(this.pouch).multiplyScalar(k).addScaledVector(this.snapVel, -c);
      this.snapVel.addScaledVector(_a, dt);
      this.pouch.addScaledVector(this.snapVel, dt);
      if (this.snapVel.lengthSq() < 1e-4 && this.pouch.distanceToSquared(this.rest) < 1e-5) this.snapping = false;
    }
    this.updateBands();
  }

  private updateBands(): void {
    const ends = [this.tips.left, this.tips.right];
    this.bands.forEach((band, i) => {
      const tip = ends[i];
      _a.copy(this.pouch).add(_b.set(i === 0 ? -0.36 : 0.36, 0, 0));
      const len = tip.distanceTo(_a);
      band.position.copy(tip).add(_a).multiplyScalar(0.5);
      band.scale.set(len, 1, 1);
      _b.copy(_a).sub(tip).normalize();
      band.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), _b);
      const mat = band.material as THREE.MeshToonMaterial;
      if (mat.map) mat.map.repeat.set(len * 1.7, 1);
    });
    this.pouchMesh.position.copy(this.pouch);
    const tilt = Math.atan2(this.pouch.x - this.rest.x, this.rest.y - this.pouch.y + 1.5);
    this.pouchMesh.rotation.set(0, 0, Math.PI / 2 + tilt * 0.5);
  }
}
