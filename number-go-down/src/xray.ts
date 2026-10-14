import * as THREE from 'three';
import type { Ragdoll, Part, PartId } from './ragdoll';

// Cartoon X-ray (report): chunky dog-bone skeleton drawn on top of a
// translucent body; white -> orange when bruised -> red-orange when broken,
// with a zigzag crack and a two-piece snap. Skin then bones only, no gore.

const BONE = new THREE.Color(0xfff3e0);
const BRUISED = new THREE.Color(0xffa63d);
const BROKEN = new THREE.Color(0xff3d1f);

interface BoneVisual {
  part: Part;
  root: THREE.Group;
  mats: THREE.MeshBasicMaterial[];
  halves: [THREE.Group, THREE.Group] | null;
  crack: THREE.Object3D;
  state: 0 | 1 | 2;
  pulse: number;
}

export class XRay {
  group = new THREE.Group();
  private visuals = new Map<PartId, BoneVisual>();
  private ghost: THREE.MeshBasicMaterial;
  private ghostHair: THREE.MeshBasicMaterial;
  private originals: [THREE.Mesh, THREE.Material | THREE.Material[]][] = [];
  private ghosted = false;
  private outlineMat = new THREE.MeshBasicMaterial({ color: 0x0b0410, side: THREE.BackSide, depthTest: false, transparent: true });

  constructor(scene: THREE.Scene, private ragdoll: Ragdoll) {
    this.group.visible = false;
    this.group.renderOrder = 20;
    scene.add(this.group);
    this.ghost = new THREE.MeshBasicMaterial({ color: 0x8fe3ff, transparent: true, opacity: 0.2, depthWrite: false });
    this.ghostHair = new THREE.MeshBasicMaterial({ color: 0xb48cff, transparent: true, opacity: 0.16, depthWrite: false });
    for (const part of ragdoll.parts) this.build(part);
    this.originals.push([ragdoll.body, ragdoll.body.material]);
    if (ragdoll.hair) this.originals.push([ragdoll.hair, ragdoll.hair.material]);
  }

  private material(): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({ color: BONE.clone(), depthTest: false, transparent: true });
  }

  private build(part: Part): void {
    const root = new THREE.Group();
    const mats: THREE.MeshBasicMaterial[] = [];
    const mat = () => { const m = this.material(); mats.push(m); return m; };
    let halves: [THREE.Group, THREE.Group] | null = null;
    const crack = zigzag();
    const id = part.spec.id;
    const seg = part.segment;
    const local = (c: { translation(): { x: number; y: number; z: number } }) => {
      const t = c.translation();
      const b = part.body.translation();
      const r = part.body.rotation();
      return new THREE.Vector3(t.x - b.x, t.y - b.y, t.z - b.z).applyQuaternion(new THREE.Quaternion(r.x, r.y, r.z, r.w).invert());
    };

    if (part.spec.limb) {
      const a = seg.a.clone();
      const b = seg.b.clone();
      const dir = b.clone().sub(a);
      const len = dir.length();
      dir.normalize();
      const r = THREE.MathUtils.clamp(len * 0.075, 0.016, 0.04);
      const holder = new THREE.Group();
      holder.position.copy(a);
      holder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      const lower = new THREE.Group();
      const upper = new THREE.Group();
      upper.position.y = len / 2;
      lower.add(dogBoneHalf(len / 2, r, mat(), this.outlineMat, false));
      const upperHalf = dogBoneHalf(len / 2, r, mat(), this.outlineMat, true);
      upper.add(upperHalf);
      holder.add(lower, upper);
      crack.position.y = len / 2;
      crack.scale.setScalar(r * 2.6);
      holder.add(crack);
      root.add(holder);
      halves = [lower, upper];
    } else if (id === 'head') {
      const skullCenter = local(part.colliders[0]);
      const r = (part.colliders[0].shape as unknown as { radius: number }).radius * 0.78;
      const skull = new THREE.Group();
      skull.position.copy(skullCenter);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat());
      dome.scale.set(1, 1.05, 0.95);
      skull.add(dome, outlined(dome, this.outlineMat, 1.08));
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(r * 1.0, r * 0.45, r * 0.8), mat());
      jaw.position.set(0, -r * 0.82, r * 0.25);
      skull.add(jaw, outlined(jaw, this.outlineMat, 1.12));
      const socketMat = new THREE.MeshBasicMaterial({ color: 0x0b0410, depthTest: false, transparent: true });
      mats.push(socketMat);
      for (const s of [-1, 1]) {
        const socket = new THREE.Mesh(new THREE.CircleGeometry(r * 0.28, 16), socketMat);
        socket.position.set(s * r * 0.38, r * 0.08, r * 0.93);
        skull.add(socket);
      }
      const nose = new THREE.Mesh(new THREE.CircleGeometry(r * 0.13, 3), socketMat);
      nose.position.set(0, -r * 0.25, r * 0.97);
      nose.rotation.z = Math.PI / 2;
      skull.add(nose);
      crack.position.set(r * 0.4, r * 0.55, r * 0.75);
      crack.scale.setScalar(r * 0.8);
      skull.add(crack);
      root.add(skull);
    } else if (id === 'chest') {
      const shape = part.colliders[0].shape as unknown as { halfExtents: { x: number; y: number; z: number }; borderRadius: number };
      const center = local(part.colliders[0]);
      const hx = shape.halfExtents.x + shape.borderRadius;
      const hy = shape.halfExtents.y + shape.borderRadius;
      const hz = shape.halfExtents.z + shape.borderRadius;
      const cage = new THREE.Group();
      cage.position.copy(center);
      for (let i = 0; i < 4; i++) {
        const y = hy * (0.55 - i * 0.32);
        const w = hx * (0.78 - Math.abs(i - 1.2) * 0.06);
        const rib = new THREE.Mesh(new THREE.TorusGeometry(1, 0.075, 6, 22, Math.PI * 1.55), mat());
        rib.scale.set(w, hz * 0.85, w);
        rib.rotation.set(Math.PI / 2, 0, Math.PI / 2 + Math.PI * 0.225);
        rib.position.y = y;
        cage.add(rib);
      }
      const sternum = new THREE.Mesh(new THREE.BoxGeometry(hx * 0.16, hy * 1.2, hz * 0.12), mat());
      sternum.position.set(0, hy * 0.05, hz * 0.82);
      cage.add(sternum, outlined(sternum, this.outlineMat, 1.2));
      addVertebrae(cage, new THREE.Vector3(0, -hy, -hz * 0.55), new THREE.Vector3(0, hy, -hz * 0.55), 4, hx * 0.12, mat(), this.outlineMat);
      crack.position.set(hx * 0.45, 0, hz * 0.9);
      crack.scale.setScalar(hx * 0.45);
      cage.add(crack);
      root.add(cage);
    } else if (id === 'spine') {
      const center = local(part.colliders[0]);
      const shape = part.colliders[0].shape as unknown as { halfExtents: { x: number; y: number; z: number }; borderRadius: number };
      const hy = shape.halfExtents.y + shape.borderRadius;
      const hz = shape.halfExtents.z + shape.borderRadius;
      const g = new THREE.Group();
      g.position.copy(center);
      addVertebrae(g, new THREE.Vector3(0, -hy, -hz * 0.4), new THREE.Vector3(0, hy, -hz * 0.4), 3, 0.045, mat(), this.outlineMat);
      crack.position.set(0.05, 0, 0);
      crack.scale.setScalar(0.07);
      g.add(crack);
      root.add(g);
    } else if (id === 'pelvis') {
      const center = local(part.colliders[0]);
      const shape = part.colliders[0].shape as unknown as { halfExtents: { x: number; y: number; z: number }; borderRadius: number };
      const hx = shape.halfExtents.x + shape.borderRadius;
      const g = new THREE.Group();
      g.position.copy(center);
      for (const s of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), mat());
        wing.scale.set(hx * 0.42, hx * 0.38, hx * 0.16);
        wing.position.set(s * hx * 0.42, hx * 0.05, 0);
        wing.rotation.z = s * 0.4;
        g.add(wing, outlined(wing, this.outlineMat, 1.12));
      }
      const sacrum = new THREE.Mesh(new THREE.ConeGeometry(hx * 0.18, hx * 0.5, 4), mat());
      sacrum.rotation.x = Math.PI;
      sacrum.position.set(0, -hx * 0.1, -hx * 0.1);
      g.add(sacrum);
      crack.position.set(hx * 0.4, 0, hx * 0.2);
      crack.scale.setScalar(hx * 0.4);
      g.add(crack);
      root.add(g);
    }
    crack.visible = false;
    this.group.add(root);
    this.visuals.set(id, { part, root, mats, halves, crack, state: 0, pulse: 0 });
  }

  /** 0 healthy, 1 bruised, 2 broken. */
  setState(id: PartId, state: 0 | 1 | 2): void {
    const v = this.visuals.get(id);
    if (!v || state <= v.state) return;
    v.state = state;
    v.pulse = 1;
    if (state === 2) {
      v.crack.visible = true;
      if (v.halves) {
        // Two-piece snap: each half kinks away from the break.
        v.halves[0].rotation.z = 0.16;
        v.halves[1].rotation.z = -0.22;
        v.halves[1].position.x = 0.012;
      }
    }
  }

  reset(): void {
    for (const v of this.visuals.values()) {
      v.state = 0;
      v.pulse = 0;
      v.crack.visible = false;
      if (v.halves) {
        v.halves[0].rotation.z = 0;
        v.halves[1].rotation.z = 0;
        v.halves[1].position.x = 0;
      }
    }
  }

  update(alpha: number, amount: number, dt: number): void {
    const show = amount > 0.04;
    this.group.visible = show;
    this.setGhost(amount > 0.5);
    if (!show) return;
    const pos = new THREE.Vector3();
    const rot = new THREE.Quaternion();
    for (const v of this.visuals.values()) {
      this.ragdoll.renderPos(v.part, alpha, pos);
      this.ragdoll.renderRot(v.part, alpha, rot);
      v.root.position.copy(pos);
      v.root.quaternion.copy(rot);
      v.pulse = Math.max(0, v.pulse - dt * 2.5);
      const base = v.state === 2 ? BROKEN : v.state === 1 ? BRUISED : BONE;
      for (const m of v.mats) {
        if (m.color.getHex() === 0x0b0410) continue;
        m.color.copy(base).lerp(new THREE.Color(0xffffff), v.pulse * 0.6);
        m.opacity = Math.min(1, amount * 1.4);
      }
      const s = 1 + v.pulse * 0.25;
      v.root.scale.setScalar(s * (0.92 + 0.08 * amount));
    }
    this.outlineMat.opacity = Math.min(1, amount * 1.4);
  }

  private setGhost(on: boolean): void {
    if (on === this.ghosted) return;
    this.ghosted = on;
    for (const [mesh, original] of this.originals) {
      mesh.material = on ? (mesh === this.ragdoll.hair ? this.ghostHair : this.ghost) : original;
    }
  }
}

function outlined(mesh: THREE.Mesh, mat: THREE.Material, scale: number): THREE.Mesh {
  const o = new THREE.Mesh(mesh.geometry, mat);
  o.position.copy(mesh.position);
  o.rotation.copy(mesh.rotation);
  o.scale.copy(mesh.scale).multiplyScalar(scale);
  o.renderOrder = -1;
  return o;
}

/** Half a cartoon bone along +Y from 0 to len, knobbed at one end. */
function dogBoneHalf(len: number, r: number, mat: THREE.Material, outline: THREE.Material, knobAtTop: boolean): THREE.Group {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
  shaft.position.y = len / 2;
  g.add(outlined(shaft, outline, 1.0), shaft);
  const shaftOutline = g.children[0] as THREE.Mesh;
  shaftOutline.scale.set(1.35, 1.0, 1.35);
  const knobY = knobAtTop ? len : 0;
  for (const s of [-1, 1]) {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(r * 1.45, 12, 10), mat);
    knob.position.set(s * r * 0.95, knobY, 0);
    g.add(outlined(knob, outline, 1.18), knob);
  }
  return g;
}

function addVertebrae(parent: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3, count: number, size: number, mat: THREE.Material, outline: THREE.Material): void {
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const v = new THREE.Mesh(new THREE.BoxGeometry(size * 1.6, size * 0.9, size * 1.2), mat);
    v.position.lerpVectors(from, to, t);
    parent.add(outlined(v, outline, 1.2), v);
  }
}

/** A short zigzag crack built from thin boxes (lines are 1 px on WebGL). */
function zigzag(): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x0b0410, depthTest: false, transparent: true });
  const pts = [[-1, 0.2], [-0.45, -0.25], [0, 0.3], [0.45, -0.3], [1, 0.15]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const seg = new THREE.Mesh(new THREE.BoxGeometry(len, 0.14, 0.14), mat);
    seg.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0.02);
    seg.rotation.z = Math.atan2(y1 - y0, x1 - x0);
    seg.renderOrder = 30;
    g.add(seg);
  }
  return g;
}
