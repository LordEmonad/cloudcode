import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { toon } from './materials';
import { studdedBeltTexture, guitarNeckTexture } from './textures';
import { LAUNCH, PHYSICS } from './config';

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

/**
 * The emo slingshot, seen from behind: two guitar necks planted on the summit
 * with a studded belt between them. Pull back toward the camera (drag down)
 * and let go to fling Emonad forward, through the Gates of Hell.
 */
export class Slingshot {
  group = new THREE.Group();
  readonly rest: THREE.Vector3;
  readonly pouch = new THREE.Vector3();
  readonly tips: { left: THREE.Vector3; right: THREE.Vector3 };
  private bands: THREE.Mesh[] = [];
  private pouchMesh: THREE.Mesh;
  private dots: THREE.InstancedMesh;
  private ghostDots: THREE.InstancedMesh;
  private snapVel = new THREE.Vector3();
  private snapping = false;
  private readonly dotCount = 22;
  private lastPath: THREE.Vector3[] = [];

  constructor(scene: THREE.Scene, base: THREE.Vector3, addCollider: (pos: THREE.Vector3, q: THREE.Quaternion) => void) {
    this.tips = this.buildPosts(base, addCollider);
    this.rest = this.tips.left.clone().add(this.tips.right).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.45, 0));
    this.pouch.copy(this.rest);
    const belt = studdedBeltTexture();
    for (let i = 0; i < 2; i++) {
      const tex = belt.clone();
      tex.needsUpdate = true;
      const band = new THREE.Mesh(new THREE.BoxGeometry(1, 0.32, 0.07), toon(0xffffff, { map: tex, rim: 0xff4fd8, rimStrength: 0.5 }));
      this.bands.push(band);
      this.group.add(band);
    }
    this.pouchMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.46, 0.36, 20, 1, true, Math.PI * 0.1, Math.PI * 0.8),
      toon(0x1a1220, { side: THREE.DoubleSide, rim: 0xff4fd8, rimStrength: 0.6 }),
    );
    this.group.add(this.pouchMesh);

    const dotGeo = new THREE.SphereGeometry(0.09, 10, 8);
    this.dots = new THREE.InstancedMesh(dotGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff7f2).multiplyScalar(1.6), toneMapped: false }), this.dotCount);
    this.ghostDots = new THREE.InstancedMesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xff4fd8, transparent: true, opacity: 0.4, depthWrite: false }), this.dotCount);
    this.dots.visible = false;
    this.ghostDots.visible = false;
    this.group.add(this.dots, this.ghostDots);
    scene.add(this.group);
    this.updateBands();
  }

  private buildPosts(base: THREE.Vector3, addCollider: (pos: THREE.Vector3, q: THREE.Quaternion) => void): { left: THREE.Vector3; right: THREE.Vector3 } {
    const neckMat = toon(0xffffff, { map: guitarNeckTexture() });
    const headMat = toon(0x16101c, { rim: 0xa259ff, rimStrength: 0.8 });
    const pegMat = toon(0xd9d9e2);
    const tips = { left: new THREE.Vector3(), right: new THREE.Vector3() };
    for (const side of [-1, 1]) {
      const g = new THREE.Group();
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.38, 3.6, 0.2), neckMat);
      neck.position.y = 1.8;
      g.add(neck);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.66, 1.2, 0.22), headMat);
      head.position.y = 4.2;
      head.rotation.z = side * 0.12;
      g.add(head);
      // Tuning pegs: one merged mesh per headstock.
      const pegs: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 6; i++) {
        const peg = new THREE.CylinderGeometry(0.06, 0.06, 0.24, 8);
        peg.rotateZ(Math.PI / 2);
        peg.translate((i < 3 ? -1 : 1) * 0.38, 3.8 + (i % 3) * 0.33, 0);
        pegs.push(peg);
      }
      g.add(new THREE.Mesh(mergeGeometries(pegs), pegMat));
      g.position.copy(base).add(new THREE.Vector3(side * 2.4, 0, 0));
      g.rotation.z = side * -0.12;
      this.group.add(g);
      const tip = new THREE.Vector3(0, 3.55, 0).applyEuler(g.rotation).add(g.position);
      if (side < 0) tips.left.copy(tip); else tips.right.copy(tip);
      addCollider(g.position.clone().add(new THREE.Vector3(0, 2.1, 0)), g.quaternion.clone());
    }
    return tips;
  }

  /**
   * Drag (screen pixels, +y down) -> launch. Pull back toward yourself (drag
   * down) to fling forward; drag sideways to aim the other way (Angry Birds).
   */
  aimFromDrag(dx: number, dy: number, screenH: number): { power: number; velocity: THREE.Vector3; pull: THREE.Vector3; cancelled: boolean } {
    const len = Math.hypot(dx, dy);
    const cancelled = len < LAUNCH.cancelRadiusPx || dy < 10;
    const raw = Math.min(1, Math.max(0, dy) / (LAUNCH.fullPowerScreenFraction * screenH));
    const power = 1 - (1 - raw) ** 2;
    const yaw = THREE.MathUtils.clamp(-dx / (screenH * 0.5), -1, 1) * LAUNCH.maxYaw;
    const elev = LAUNCH.elevation;
    const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(elev), Math.sin(elev), -Math.cos(yaw) * Math.cos(elev));
    const speed = LAUNCH.minSpeed + power * (LAUNCH.maxSpeed - LAUNCH.minSpeed);
    // The pouch moves back toward the camera, opposite the launch.
    const back = new THREE.Vector3(-dir.x, -0.35, -dir.z).normalize();
    const pull = back.multiplyScalar(0.3 + power * 2.6);
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
        this.pouch.y + 0.4 + velocity.y * t + 0.5 * g * t * t,
        this.pouch.z + velocity.z * t,
      ));
    }
    return pts;
  }

  private showPreview(velocity: THREE.Vector3): void {
    const m = new THREE.Matrix4();
    const pts = this.path(velocity);
    pts.forEach((p, i) => {
      const s = 1 - i / (this.dotCount * 1.6);
      m.makeScale(s, s, s).setPosition(p);
      this.dots.setMatrixAt(i, m);
    });
    this.dots.instanceMatrix.needsUpdate = true;
    this.dots.visible = true;
    this.lastPath = pts;
  }

  private keepGhost(): void {
    if (!this.lastPath.length) return;
    const m = new THREE.Matrix4();
    this.lastPath.forEach((p, i) => {
      m.makeScale(0.75, 0.75, 0.75).setPosition(p);
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
      _a.copy(this.rest).sub(this.pouch).multiplyScalar(320).addScaledVector(this.snapVel, -7);
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
      _a.copy(this.pouch).add(_b.set(i === 0 ? -0.4 : 0.4, 0, 0));
      // Never scale to ~0: a singular normal matrix puts NaN into the HDR buffer and bloom smears it over the frame.
      const len = Math.max(0.1, tip.distanceTo(_a));
      band.position.copy(tip).add(_a).multiplyScalar(0.5);
      band.scale.set(len, 1, 1);
      _b.copy(_a).sub(tip).normalize();
      band.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), _b);
      const mat = band.material as THREE.MeshToonMaterial;
      if (mat.map) mat.map.repeat.set(len * 1.7, 1);
    });
    this.pouchMesh.position.copy(this.pouch);
    this.pouchMesh.rotation.set(0, Math.PI, Math.PI / 2);
  }
}
