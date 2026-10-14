import * as THREE from 'three';
import { RAPIER, GROUP, groups, type World, type RigidBody, type Collider } from './physics';
import { RAGDOLL, PHYSICS } from './config';

export type PartId =
  | 'pelvis' | 'spine' | 'chest' | 'head'
  | 'upperArmL' | 'foreArmL' | 'upperArmR' | 'foreArmR'
  | 'thighL' | 'shinL' | 'thighR' | 'shinR';

type Deg3 = [number, number, number]; // twist (X), swing (Y), flex (Z), degrees

interface JointSpec {
  flexToward: 'forward' | 'back';
  twist: [number, number];
  swing: [number, number];
  flex: [number, number];
  brokenExtra: Deg3; // degrees added to each side of each axis once broken
}

interface PartSpec {
  id: PartId;
  bone: string;
  owns: (name: string) => boolean;
  massKey: keyof typeof RAGDOLL.relMass;
  shape: 'box' | 'limb' | 'head' | 'shin';
  end?: string;
  parent?: PartId;
  joint?: JointSpec;
  label: string;
  side: '' | 'L' | 'R';
  limb: boolean;
  fragility: number;
  points: number;
}

const fingers = /(Thumb|Index|Middle|Ring|Little)/;

function side(s: 'Left' | 'Right'): 'L' | 'R' {
  return s === 'Left' ? 'L' : 'R';
}

function limbSpecs(s: 'Left' | 'Right'): PartSpec[] {
  const L = side(s);
  return [
    {
      id: `upperArm${L}` as PartId, bone: `${s}UpperArm`, owns: (n) => n === `${s}UpperArm`,
      massKey: 'upperArm', shape: 'limb', end: `${s}LowerArm`, parent: 'chest', label: 'HUMERUS', side: L, limb: true,
      fragility: 0.95, points: 650,
      joint: { flexToward: 'forward', twist: [-35, 35], swing: [-70, 70], flex: [-50, 95], brokenExtra: [30, 40, 50] },
    },
    {
      id: `foreArm${L}` as PartId, bone: `${s}LowerArm`,
      owns: (n) => n === `${s}LowerArm` || n === `${s}Hand` || (n.startsWith(s) && fingers.test(n)),
      massKey: 'foreArm', shape: 'limb', end: `${s}Hand`, parent: `upperArm${L}` as PartId, label: 'FOREARM', side: L, limb: true,
      fragility: 0.85, points: 500,
      joint: { flexToward: 'forward', twist: [-40, 40], swing: [-8, 8], flex: [-5, 140], brokenExtra: [25, 30, 75] },
    },
    {
      id: `thigh${L}` as PartId, bone: `${s}UpperLeg`, owns: (n) => n === `${s}UpperLeg`,
      massKey: 'thigh', shape: 'limb', end: `${s}LowerLeg`, parent: 'pelvis', label: 'FEMUR', side: L, limb: true,
      fragility: 1.15, points: 1200,
      joint: { flexToward: 'forward', twist: [-25, 25], swing: [-35, 35], flex: [-25, 100], brokenExtra: [30, 40, 50] },
    },
    {
      id: `shin${L}` as PartId, bone: `${s}LowerLeg`, owns: (n) => n === `${s}LowerLeg` || n === `${s}Foot`,
      massKey: 'shin', shape: 'shin', end: `${s}Foot`, parent: `thigh${L}` as PartId, label: 'TIBIA', side: L, limb: true,
      fragility: 1.0, points: 900,
      joint: { flexToward: 'back', twist: [-10, 10], swing: [-6, 6], flex: [-3, 140], brokenExtra: [25, 30, 75] },
    },
  ];
}

export const PART_SPECS: PartSpec[] = [
  {
    id: 'pelvis', bone: 'Hips', owns: (n) => n === 'Hips', massKey: 'pelvis', shape: 'box',
    label: 'PELVIS', side: '', limb: false, fragility: 1.2, points: 1500,
  },
  {
    id: 'spine', bone: 'Spine', owns: (n) => n === 'Spine', massKey: 'spine', shape: 'box', parent: 'pelvis',
    label: 'SPINE', side: '', limb: false, fragility: 1.25, points: 2000,
    joint: { flexToward: 'forward', twist: [-15, 15], swing: [-20, 20], flex: [-20, 25], brokenExtra: [15, 25, 35] },
  },
  {
    id: 'chest', bone: 'Chest', owns: (n) => n === 'Chest' || n === 'LeftShoulder' || n === 'RightShoulder',
    massKey: 'chest', shape: 'box', parent: 'spine', label: 'RIBS', side: '', limb: false, fragility: 0.9, points: 1400,
    joint: { flexToward: 'forward', twist: [-15, 15], swing: [-18, 18], flex: [-18, 22], brokenExtra: [15, 20, 30] },
  },
  {
    id: 'head', bone: 'Neck',
    owns: (n) => ['Neck', 'Head', 'Jaw', 'LeftEye', 'RightEye', 'Hair_Root', 'Hair_Mid', 'Hair_Tip'].includes(n),
    massKey: 'head', shape: 'head', parent: 'chest', label: 'SKULL', side: '', limb: false, fragility: 1.1, points: 2500,
    joint: { flexToward: 'forward', twist: [-55, 55], swing: [-35, 35], flex: [-35, 40], brokenExtra: [25, 25, 35] },
  },
  ...limbSpecs('Left'),
  ...limbSpecs('Right'),
];

export interface Part {
  spec: PartSpec;
  index: number;
  body: RigidBody;
  colliders: Collider[];
  mass: number;
  joint: ReturnType<World['createImpulseJoint']> | null;
  bindOffset: THREE.Vector3; // body origin relative to the pelvis origin at bind
  prevPos: THREE.Vector3;
  currPos: THREE.Vector3;
  prevRot: THREE.Quaternion;
  currRot: THREE.Quaternion;
  preLinvel: THREE.Vector3;
  preAngvel: THREE.Vector3;
  strength: number;
  contact: boolean;
  broken: boolean;
  boneMesh: THREE.Bone;
  bindWorldQuat: THREE.Quaternion;
  parentChainQuat: THREE.Quaternion; // rest rotation from the driven ancestor to this bone's parent
  drivenAncestor: Part | null;
  segment: { a: THREE.Vector3; b: THREE.Vector3; radius: number }; // bind-pose bone segment (body local)
  muscleK: number; // full-strength motor stiffness (N*m/rad), sized to the load this joint carries
  muscleD: number;
}

interface RawJoints {
  jointSetLimits(handle: number, axis: number, min: number, max: number): void;
  jointConfigureMotorModel(handle: number, axis: number, model: number): void;
  jointConfigureMotorPosition(handle: number, axis: number, target: number, stiffness: number, damping: number): void;
}

const AX = { twist: RAPIER.JointAxis.AngX, swing: RAPIER.JointAxis.AngY, flex: RAPIER.JointAxis.AngZ };
const DEG = Math.PI / 180;

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))));
  return sorted[i];
}

const _v = new THREE.Vector3();
const _p = new THREE.Vector3();
const _g = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _qa = new THREE.Quaternion();
const _qb = new THREE.Quaternion();
const _qf = new THREE.Quaternion();
const _qr = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const PROJECT_GAP = 0.02; // metres of joint separation tolerated before snapping
const PROJECT_ANGLE = 6 * (Math.PI / 180); // overshoot tolerated past each limit

export class Ragdoll {
  parts: Part[] = [];
  byId = new Map<PartId, Part>();
  root: THREE.Object3D;
  body: THREE.SkinnedMesh;
  hair: THREE.Mesh | null;
  totalMass = 0;
  held = false;
  private armatureInv = new THREE.Matrix4();
  private hipsBone!: THREE.Bone;
  private poseTargets = new Map<PartId, Deg3>();
  private colliderPart = new Map<number, Part>();
  renderOffset = new THREE.Vector3();

  constructor(private world: World, gltfScene: THREE.Object3D) {
    this.root = gltfScene;
    this.root.scale.setScalar(RAGDOLL.modelScale);
    this.root.rotation.y = Math.PI; // the model faces -Z; turn him to face the camera on +Z
    this.root.updateMatrixWorld(true);

    const found: { body: THREE.SkinnedMesh | null; hair: THREE.Mesh | null } = { body: null, hair: null };
    this.root.traverse((o) => {
      if ((o as THREE.SkinnedMesh).isSkinnedMesh) found.body = o as THREE.SkinnedMesh;
      else if ((o as THREE.Mesh).isMesh && o.name.toUpperCase().includes('HAIR')) found.hair = o as THREE.Mesh;
    });
    if (!found.body) throw new Error('Emonad model has no skinned mesh');
    this.body = found.body;
    this.hair = found.hair;
    this.body.frustumCulled = false;
    if (this.hair) this.hair.frustumCulled = false;

    this.fixArmRig();
    this.build();
  }

  /**
   * The source rig has T-pose arm bones inside an A-pose mesh, so the elbows and
   * wrists pivot about a unit above the real joints. Move each arm bone to the
   * seam where its skin weights hand over to the next bone, then re-bind.
   */
  private fixArmRig(): void {
    const mesh = this.body;
    const geo = mesh.geometry;
    const skinIndex = geo.attributes.skinIndex;
    const skinWeight = geo.attributes.skinWeight;
    const bones = mesh.skeleton.bones;
    const index = new Map(bones.map((b, i) => [b.name, i] as const));
    const seam = (a: string, b: string): THREE.Vector3 | null => {
      const ia = index.get(a), ib = index.get(b);
      if (ia === undefined || ib === undefined) return null;
      const sum = new THREE.Vector3();
      const p = new THREE.Vector3();
      let n = 0;
      for (let i = 0; i < geo.attributes.position.count; i++) {
        let wa = 0, wb = 0;
        for (let k = 0; k < 4; k++) {
          const j = skinIndex.getComponent(i, k);
          if (j === ia) wa += skinWeight.getComponent(i, k);
          if (j === ib) wb += skinWeight.getComponent(i, k);
        }
        if (wa > 0.25 && wb > 0.25) {
          mesh.getVertexPosition(i, p);
          sum.add(p.applyMatrix4(mesh.matrixWorld));
          n++;
        }
      }
      return n >= 5 ? sum.multiplyScalar(1 / n) : null;
    };
    const oldWorld = bones.map((b) => b.matrixWorld.clone());
    for (const s of ['Left', 'Right']) {
      const targets: [string, THREE.Vector3 | null][] = [
        [`${s}UpperArm`, seam(`${s}Shoulder`, `${s}UpperArm`)],
        [`${s}LowerArm`, seam(`${s}UpperArm`, `${s}LowerArm`)],
        [`${s}Hand`, seam(`${s}LowerArm`, `${s}Hand`)],
      ];
      for (const [name, world] of targets) {
        if (!world) continue;
        const bone = this.bone(name);
        bone.parent!.updateWorldMatrix(true, false);
        bone.position.copy(bone.parent!.worldToLocal(world.clone()));
        bone.updateMatrixWorld(true);
      }
    }
    this.root.updateMatrixWorld(true);
    // Fold each bone's move into its inverse bind matrix so the rest mesh does not
    // move. Recomputing them from scratch would drop the mesh quantization scale
    // that glTF-Transform stores in the original inverse bind matrices.
    const inverses = mesh.skeleton.boneInverses;
    bones.forEach((b, i) => {
      inverses[i] = b.matrixWorld.clone().invert().multiply(oldWorld[i]).multiply(inverses[i]);
    });
  }

  partOfCollider(handle: number): Part | undefined {
    return this.colliderPart.get(handle);
  }

  get(id: PartId): Part {
    return this.byId.get(id)!;
  }

  private bone(name: string): THREE.Bone {
    const b = this.body.skeleton.bones.find((x) => x.name === name);
    if (!b) throw new Error(`Missing bone ${name}`);
    return b;
  }

  private bonePos(name: string): THREE.Vector3 {
    return this.bone(name).getWorldPosition(new THREE.Vector3());
  }

  /** Bind-pose world-space vertices grouped by the bone that dominates each one. */
  private verticesByBone(): Map<string, THREE.Vector3[]> {
    const out = new Map<string, THREE.Vector3[]>();
    const mesh = this.body;
    const geo = mesh.geometry;
    const skinIndex = geo.attributes.skinIndex;
    const skinWeight = geo.attributes.skinWeight;
    const count = geo.attributes.position.count;
    const bones = mesh.skeleton.bones;
    for (let i = 0; i < count; i++) {
      let best = 0;
      let bestW = -1;
      for (let k = 0; k < 4; k++) {
        const w = skinWeight.getComponent(i, k);
        if (w > bestW) { bestW = w; best = skinIndex.getComponent(i, k); }
      }
      const name = bones[best].name;
      const p = new THREE.Vector3();
      mesh.getVertexPosition(i, p);
      p.applyMatrix4(mesh.matrixWorld);
      if (!out.has(name)) out.set(name, []);
      out.get(name)!.push(p);
    }
    if (this.hair) {
      const pos = this.hair.geometry.attributes.position;
      const list: THREE.Vector3[] = [];
      for (let i = 0; i < pos.count; i++) {
        list.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(this.hair.matrixWorld));
      }
      out.set('__hair__', list);
    }
    return out;
  }

  private build(): void {
    const verts = this.verticesByBone();
    const relTotal = PART_SPECS.reduce((s, p) => s + RAGDOLL.relMass[p.massKey], 0);
    const massUnit = RAGDOLL.totalMass / relTotal;
    const armature = this.bone('Hips').parent!;
    this.armatureInv.copy(armature.matrixWorld).invert();
    this.hipsBone = this.bone('Hips');
    const pelvisOrigin = this.bonePos('Hips');

    PART_SPECS.forEach((spec, index) => {
      const origin = this.bonePos(spec.bone);
      const owned: THREE.Vector3[] = [];
      verts.forEach((list, name) => { if (spec.owns(name)) owned.push(...list); });
      const mass = RAGDOLL.relMass[spec.massKey] * massUnit;

      const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(origin.x, origin.y, origin.z)
        .setLinearDamping(RAGDOLL.linearDamping)
        .setAngularDamping(RAGDOLL.angularDamping)
        .setCcdEnabled(true)
        .setCanSleep(false);
      const body = this.world.createRigidBody(bodyDesc);

      const shapes = this.fitShapes(spec, origin, owned, verts);
      const totalVolume = shapes.reduce((s, sh) => s + sh.volume, 0);
      const colliders = shapes.map((sh) => {
        const desc = sh.desc
          .setMass(mass * (sh.volume / totalVolume))
          .setFriction(RAGDOLL.friction)
          .setRestitution(RAGDOLL.restitution)
          .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
        return this.world.createCollider(desc, body);
      });

      const bone = this.bone(spec.bone);
      const part: Part = {
        spec, index, body, colliders, mass,
        joint: null,
        bindOffset: origin.clone().sub(pelvisOrigin),
        prevPos: origin.clone(), currPos: origin.clone(),
        prevRot: new THREE.Quaternion(), currRot: new THREE.Quaternion(),
        preLinvel: new THREE.Vector3(), preAngvel: new THREE.Vector3(),
        strength: RAGDOLL.muscleFreefall,
        contact: false,
        broken: false,
        boneMesh: bone,
        bindWorldQuat: bone.getWorldQuaternion(new THREE.Quaternion()),
        parentChainQuat: new THREE.Quaternion(),
        drivenAncestor: null,
        segment: this.segmentFor(spec, origin, owned),
        muscleK: 0,
        muscleD: 0,
      };
      this.totalMass += mass;
      this.parts.push(part);
      this.byId.set(spec.id, part);
      colliders.forEach((c) => this.colliderPart.set(c.handle, part));
    });

    this.linkDrivenAncestors();
    this.createJoints();
    this.sizeMuscles();
    this.filterSelfCollisions();
    this.parts.forEach((p) => this.snapshot(p, true));
  }

  private segmentFor(spec: PartSpec, origin: THREE.Vector3, owned: THREE.Vector3[]) {
    const a = new THREE.Vector3();
    let b: THREE.Vector3;
    if (spec.end) {
      b = this.bonePos(spec.end).sub(origin);
    } else if (spec.id === 'head') {
      b = this.bonePos('Head').sub(origin).multiplyScalar(2.2);
    } else if (spec.id === 'pelvis') {
      b = this.bonePos('Spine').sub(origin);
    } else {
      b = new THREE.Vector3(0, 0.15, 0);
    }
    const r = owned.length ? Math.min(0.12, percentile(owned.map((p) => p.distanceTo(origin)), 0.3)) : 0.05;
    return { a, b, radius: r };
  }

  private fitShapes(spec: PartSpec, origin: THREE.Vector3, owned: THREE.Vector3[], verts: Map<string, THREE.Vector3[]>) {
    type Shape = { desc: ReturnType<typeof RAPIER.ColliderDesc.ball>; volume: number };
    const shapes: Shape[] = [];

    const capsuleBetween = (p0: THREE.Vector3, p1: THREE.Vector3, radius: number): Shape => {
      const mid = p0.clone().add(p1).multiplyScalar(0.5).sub(origin);
      const axis = p1.clone().sub(p0);
      const len = axis.length();
      const halfHeight = Math.max(0.001, len / 2);
      const rot = new THREE.Quaternion();
      if (len > 1e-5) rot.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.normalize());
      const desc = RAPIER.ColliderDesc.capsule(halfHeight, radius)
        .setTranslation(mid.x, mid.y, mid.z)
        .setRotation({ x: rot.x, y: rot.y, z: rot.z, w: rot.w });
      const volume = Math.PI * radius * radius * (2 * halfHeight) + (4 / 3) * Math.PI * radius ** 3;
      return { desc, volume };
    };

    const fitAlong = (points: THREE.Vector3[], a: THREE.Vector3, dir: THREE.Vector3, rPct: number, rMin: number, rMax: number) => {
      const ts: number[] = [];
      const rs: number[] = [];
      for (const p of points) {
        _v.copy(p).sub(a);
        const t = _v.dot(dir);
        ts.push(t);
        rs.push(_v.addScaledVector(dir, -t).length());
      }
      const radius = THREE.MathUtils.clamp(percentile(rs, rPct), rMin, rMax);
      let s0 = percentile(ts, 0.02) + radius;
      let s1 = percentile(ts, 0.98) - radius;
      if (s1 < s0) { const m = (s0 + s1) / 2; s0 = m; s1 = m; }
      return { p0: a.clone().addScaledVector(dir, s0), p1: a.clone().addScaledVector(dir, s1), radius };
    };

    if (spec.shape === 'box') {
      const xs = owned.map((p) => p.x), ys = owned.map((p) => p.y), zs = owned.map((p) => p.z);
      const lo = new THREE.Vector3(percentile(xs, 0.04), percentile(ys, 0.03), percentile(zs, 0.06));
      const hi = new THREE.Vector3(percentile(xs, 0.96), percentile(ys, 0.97), percentile(zs, 0.94));
      if (spec.id === 'chest') {
        // The shoulders' vertices stretch toward the arms; keep the ribcage narrower.
        const cx = (lo.x + hi.x) / 2;
        const hx = (hi.x - lo.x) / 2 * 0.78;
        lo.x = cx - hx; hi.x = cx + hx;
      }
      const half = hi.clone().sub(lo).multiplyScalar(0.5);
      const center = lo.clone().add(hi).multiplyScalar(0.5).sub(origin);
      const border = Math.min(0.045, Math.min(half.x, half.y, half.z) * 0.6);
      const desc = RAPIER.ColliderDesc.roundCuboid(
        Math.max(0.01, half.x - border), Math.max(0.01, half.y - border), Math.max(0.01, half.z - border), border,
      ).setTranslation(center.x, center.y, center.z);
      shapes.push({ desc, volume: 8 * half.x * half.y * half.z });
    } else if (spec.shape === 'head') {
      const skull = [...(verts.get('Head') ?? []), ...(verts.get('Jaw') ?? [])];
      const c = skull.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / Math.max(1, skull.length));
      const r = percentile(skull.map((p) => p.distanceTo(c)), 0.82);
      const local = c.clone().sub(origin);
      shapes.push({ desc: RAPIER.ColliderDesc.ball(r).setTranslation(local.x, local.y, local.z), volume: (4 / 3) * Math.PI * r ** 3 });
      const hair = verts.get('__hair__') ?? [];
      if (hair.length) {
        const hc = hair.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / hair.length);
        const hr = percentile(hair.map((p) => p.distanceTo(hc)), 0.7);
        const hl = hc.sub(origin);
        shapes.push({ desc: RAPIER.ColliderDesc.ball(hr).setTranslation(hl.x, hl.y, hl.z), volume: 0.35 * (4 / 3) * Math.PI * hr ** 3 });
      }
    } else if (spec.shape === 'limb') {
      // Bone-to-bone capsule. Sleeves and cuffs make vertex radii too fat, so the
      // radius is a fitted median capped by the report's ratio to bone length.
      const end = this.bonePos(spec.end!);
      const len = end.distanceTo(origin);
      const dir = end.clone().sub(origin).normalize();
      const ratio = spec.massKey === 'thigh' ? 0.3 : spec.massKey === 'upperArm' ? 0.25 : 0.2;
      const fit = fitAlong(owned, origin, dir, 0.5, 0.03, ratio * len);
      // Forearms reach to the fingertips; upper arms and thighs stop at the next joint.
      const reach = spec.massKey === 'foreArm' ? Math.max(len, fit.p1.distanceTo(origin) + fit.radius) : len;
      const p0 = origin.clone().addScaledVector(dir, fit.radius * 0.6);
      const p1 = origin.clone().addScaledVector(dir, Math.max(fit.radius * 0.6, reach - fit.radius * 0.8));
      shapes.push(capsuleBetween(p0, p1, fit.radius));
    } else if (spec.shape === 'shin') {
      const s = spec.side === 'L' ? 'Left' : 'Right';
      const end = this.bonePos(spec.end!);
      const len = end.distanceTo(origin);
      const dir = end.clone().sub(origin).normalize();
      const shinVerts = verts.get(`${s}LowerLeg`) ?? owned;
      const fit = fitAlong(shinVerts, origin, dir, 0.5, 0.03, 0.22 * len);
      const p0 = origin.clone().addScaledVector(dir, fit.radius * 0.6);
      const p1 = origin.clone().addScaledVector(dir, Math.max(fit.radius * 0.6, len - fit.radius * 0.5));
      shapes.push(capsuleBetween(p0, p1, fit.radius));
      // Sneaker: capsule along the foot's longest axis (heel to toe).
      const foot = verts.get(`${s}Foot`) ?? [];
      if (foot.length > 10) {
        const c = foot.reduce((acc, p) => acc.add(p), new THREE.Vector3()).multiplyScalar(1 / foot.length);
        const axis = principalAxis(foot, c);
        const ff = fitAlong(foot, c, axis, 0.6, 0.03, 0.09);
        shapes.push(capsuleBetween(ff.p0, ff.p1, ff.radius));
      }
    }
    return shapes;
  }

  private linkDrivenAncestors(): void {
    const driven = new Map(this.parts.map((p) => [p.boneMesh, p] as const));
    for (const part of this.parts) {
      let chain = new THREE.Quaternion();
      let node = part.boneMesh.parent;
      while (node && !driven.has(node as THREE.Bone)) {
        chain = node.quaternion.clone().multiply(chain);
        node = node.parent;
      }
      part.drivenAncestor = node ? driven.get(node as THREE.Bone)! : null;
      part.parentChainQuat.copy(chain);
    }
  }

  private jointFrame(spec: PartSpec): THREE.Quaternion {
    const origin = this.bonePos(spec.bone);
    let along: THREE.Vector3;
    if (spec.end) along = this.bonePos(spec.end).sub(origin);
    else if (spec.id === 'head') along = this.bonePos('Head').sub(origin);
    else if (spec.id === 'spine') along = this.bonePos('Chest').sub(origin);
    else along = this.bonePos('Neck').sub(origin);
    const x = along.normalize();
    const forward = new THREE.Vector3(0, 0, spec.joint!.flexToward === 'forward' ? 1 : -1);
    const y = forward.addScaledVector(x, -forward.dot(x));
    if (y.lengthSq() < 1e-6) y.set(0, 1, 0).addScaledVector(x, -x.y);
    y.normalize();
    const z = new THREE.Vector3().crossVectors(x, y).normalize();
    _m.makeBasis(x, y, z);
    return new THREE.Quaternion().setFromRotationMatrix(_m);
  }

  private createJoints(): void {
    for (const part of this.parts) {
      const spec = part.spec;
      if (!spec.parent || !spec.joint) continue;
      const parent = this.byId.get(spec.parent)!;
      const anchorWorld = this.bonePos(spec.bone);
      const parentOrigin = parent.currPos;
      const a1 = anchorWorld.clone().sub(parentOrigin);
      const frame = this.jointFrame(spec);
      const data = RAPIER.JointData.spherical({ x: a1.x, y: a1.y, z: a1.z }, { x: 0, y: 0, z: 0 });
      const joint = this.world.createImpulseJoint(data, parent.body, part.body, true);
      const q = { x: frame.x, y: frame.y, z: frame.z, w: frame.w };
      joint.setLocalFrame1({ x: a1.x, y: a1.y, z: a1.z }, q);
      joint.setLocalFrame2({ x: 0, y: 0, z: 0 }, q);
      joint.setContactsEnabled(false);
      part.joint = joint;
      this.applyLimits(part);
      // Force-based motors: acceleration-based ones barely hold a long chain
      // hanging from a pinned pelvis (scripts/joint-motor-test.mjs).
      for (const axis of [AX.twist, AX.swing, AX.flex]) {
        this.rawJoints().jointConfigureMotorModel(joint.handle, axis, RAPIER.MotorModel.ForceBased);
      }
    }
  }

  /**
   * Rapier's typed API has no limits or motors for spherical joints, but the raw
   * per-axis setters work on them (checked in scripts/joint-limit-test.mjs).
   */
  private rawJoints(): RawJoints {
    return this.world.impulseJoints.raw as unknown as RawJoints;
  }

  /**
   * Size each joint's muscle to the weight it carries: at full strength it
   * holds its whole subtree against gravity within ~7 degrees, critically damped.
   */
  private sizeMuscles(): void {
    const children = new Map<PartId, Part[]>();
    for (const p of this.parts) {
      if (!p.spec.parent) continue;
      if (!children.has(p.spec.parent)) children.set(p.spec.parent, []);
      children.get(p.spec.parent)!.push(p);
    }
    const subtree = (p: Part): Part[] => [p, ...(children.get(p.spec.id) ?? []).flatMap(subtree)];
    const g = Math.abs(PHYSICS.gravity);
    for (const part of this.parts) {
      if (!part.joint) continue;
      const anchor = part.currPos;
      const parts = subtree(part);
      let m = 0;
      const com = new THREE.Vector3();
      let inertia = 0;
      for (const p of parts) {
        const c = p.body.worldCom();
        com.add(new THREE.Vector3(c.x, c.y, c.z).multiplyScalar(p.mass));
        m += p.mass;
      }
      com.multiplyScalar(1 / m);
      for (const p of parts) {
        const c = p.body.worldCom();
        inertia += p.mass * new THREE.Vector3(c.x, c.y, c.z).distanceToSquared(anchor) + p.mass * 0.004;
      }
      const lever = Math.max(0.05, com.distanceTo(anchor));
      part.muscleK = (m * g * lever) / 0.12;
      part.muscleD = 2 * 0.8 * Math.sqrt(part.muscleK * inertia);
    }
  }

  private applyLimits(part: Part): void {
    const j = part.spec.joint;
    if (!j || !part.joint) return;
    const extra = part.broken ? j.brokenExtra : [0, 0, 0];
    const raw = this.rawJoints();
    raw.jointSetLimits(part.joint.handle, AX.twist, (j.twist[0] - extra[0]) * DEG, (j.twist[1] + extra[0]) * DEG);
    raw.jointSetLimits(part.joint.handle, AX.swing, (j.swing[0] - extra[1]) * DEG, (j.swing[1] + extra[1]) * DEG);
    raw.jointSetLimits(part.joint.handle, AX.flex, (j.flex[0] - extra[2]) * DEG, (j.flex[1] + extra[2]) * DEG);
  }

  /** Turn off collisions between parts that touch at rest or share a joint. */
  private filterSelfCollisions(): void {
    const masks = this.parts.map(() => GROUP.ALL_PARTS);
    const block = (a: Part, b: Part) => {
      masks[a.index] &= ~GROUP.partBit(b.index);
      masks[b.index] &= ~GROUP.partBit(a.index);
    };
    for (const part of this.parts) {
      if (part.spec.parent) block(part, this.byId.get(part.spec.parent)!);
    }
    for (let i = 0; i < this.parts.length; i++) {
      for (let k = i + 1; k < this.parts.length; k++) {
        const a = this.parts[i], b = this.parts[k];
        let touching = false;
        for (const ca of a.colliders) for (const cb of b.colliders) {
          if (ca.contactCollider(cb, 0.025)) touching = true;
        }
        if (touching) block(a, b);
      }
    }
    for (const part of this.parts) {
      const g = groups(GROUP.partBit(part.index), (masks[part.index] & GROUP.ALL_PARTS) | GROUP.ENV | GROUP.SENSOR | GROUP.DEBRIS);
      part.colliders.forEach((c) => c.setCollisionGroups(g));
    }
  }

  /** Copy the body's current transform into the interpolation slots. */
  snapshot(part: Part, both = false): void {
    const t = part.body.translation();
    const r = part.body.rotation();
    if (both) {
      part.prevPos.set(t.x, t.y, t.z);
      part.prevRot.set(r.x, r.y, r.z, r.w);
    } else {
      part.prevPos.copy(part.currPos);
      part.prevRot.copy(part.currRot);
    }
    part.currPos.set(t.x, t.y, t.z);
    part.currRot.set(r.x, r.y, r.z, r.w);
  }

  /** Teleport the whole ragdoll into its rest pose at a root position and rotation. */
  resetPose(rootPos: THREE.Vector3, rootRot: THREE.Quaternion): void {
    for (const part of this.parts) {
      _v.copy(part.bindOffset).applyQuaternion(rootRot).add(rootPos);
      part.body.setTranslation({ x: _v.x, y: _v.y, z: _v.z }, true);
      part.body.setRotation({ x: rootRot.x, y: rootRot.y, z: rootRot.z, w: rootRot.w }, true);
      part.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      part.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      part.broken = false;
      part.strength = RAGDOLL.muscleFreefall;
      part.body.setAngularDamping(RAGDOLL.angularDamping);
      this.applyLimits(part);
      this.snapshot(part, true);
    }
  }

  /** Move the whole body by an offset, keeping its pose (respawns). Interpolation snaps too. */
  teleport(offset: THREE.Vector3, velocity: THREE.Vector3): void {
    for (const part of this.parts) {
      const t = part.body.translation();
      part.body.setTranslation({ x: t.x + offset.x, y: t.y + offset.y, z: t.z + offset.z }, true);
      part.body.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
      part.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      part.currPos.add(offset);
      part.prevPos.copy(part.currPos);
    }
  }

  setVelocity(v: THREE.Vector3, spin?: THREE.Vector3): void {
    for (const part of this.parts) {
      part.body.setLinvel({ x: v.x, y: v.y, z: v.z }, true);
      part.body.setAngvel(spin ? { x: spin.x, y: spin.y, z: spin.z } : { x: 0, y: 0, z: 0 }, true);
    }
  }

  /** Hold the pelvis kinematically (in the slingshot pouch) or release it. */
  setHeld(held: boolean): void {
    this.held = held;
    const pelvis = this.get('pelvis').body;
    pelvis.setBodyType(held ? RAPIER.RigidBodyType.KinematicPositionBased : RAPIER.RigidBodyType.Dynamic, true);
  }

  moveHeld(pos: THREE.Vector3, rot: THREE.Quaternion): void {
    const pelvis = this.get('pelvis').body;
    pelvis.setNextKinematicTranslation({ x: pos.x, y: pos.y, z: pos.z });
    pelvis.setNextKinematicRotation({ x: rot.x, y: rot.y, z: rot.z, w: rot.w });
  }

  breakPart(part: Part): void {
    if (part.broken) return;
    part.broken = true;
    part.strength = 0;
    part.body.setAngularDamping(RAGDOLL.brokenAngularDamping);
    this.applyLimits(part);
  }

  setPose(id: PartId, deg: Deg3): void {
    this.poseTargets.set(id, deg);
  }

  clearPose(): void {
    this.poseTargets.clear();
  }

  /** Called once per fixed step before the world steps. */
  preStep(dt: number, drag: number, steer: THREE.Vector3): void {
    for (const part of this.parts) {
      const lv = part.body.linvel();
      const av = part.body.angvel();
      part.preLinvel.set(lv.x, lv.y, lv.z);
      part.preAngvel.set(av.x, av.y, av.z);
      if (part.body.isKinematic()) continue;

      // Quadratic air drag and the player's sideways steering, both as accelerations.
      const speed = part.preLinvel.length();
      const k = drag * (part.spec.limb ? PHYSICS.limbDragBoost : 1) * speed;
      const ix = (-lv.x * k + steer.x) * part.mass * dt;
      const iy = (-lv.y * k + steer.y) * part.mass * dt;
      const iz = (-lv.z * k + steer.z) * part.mass * dt;
      part.body.applyImpulse({ x: ix, y: iy, z: iz }, true);

      const w = part.preAngvel.length();
      if (w > PHYSICS.maxAngularSpeed) {
        const s = PHYSICS.maxAngularSpeed / w;
        part.body.setAngvel({ x: av.x * s, y: av.y * s, z: av.z * s }, true);
      }
    }
  }

  /** Update muscle strengths and drive the joint motors toward the pose targets. */
  updateMuscles(dt: number, baseStrength: number): void {
    for (const part of this.parts) {
      if (!part.joint || !part.spec.joint) continue;
      const parent = this.byId.get(part.spec.parent!)!;
      const target = part.broken ? 0 : (part.contact || parent.contact)
        ? Math.min(baseStrength, RAGDOLL.muscleFloorInContact)
        : baseStrength;
      if (part.contact) part.strength = Math.min(part.strength, target);
      else part.strength += Math.sign(target - part.strength) * Math.min(Math.abs(target - part.strength), RAGDOLL.muscleRegainPerSecond * dt);
      const s = part.broken ? 0 : part.strength;
      const pose = this.poseTargets.get(part.spec.id) ?? [0, 0, 0];
      // Never send zero stiffness AND zero damping: Rapier then locks the axis rigid.
      const k = part.muscleK * s;
      const d = part.muscleD * Math.sqrt(s) + 0.4;
      const raw = this.rawJoints();
      const h = part.joint.handle;
      raw.jointConfigureMotorPosition(h, AX.twist, pose[0] * DEG, k, d);
      raw.jointConfigureMotorPosition(h, AX.swing, pose[1] * DEG, k, d);
      raw.jointConfigureMotorPosition(h, AX.flex, pose[2] * DEG, k, d);
    }
  }

  postStep(): void {
    this.project();
    for (const part of this.parts) this.snapshot(part);
  }

  /**
   * Joint projection (as in PhysX and Unity): after a violent step, snap any
   * joint that has separated or overshot its limits back into range, parents
   * before children. The solver alone lets limbs stretch on 40 m/s impacts.
   */
  private project(): void {
    const raw = this.rawJoints() as RawJoints & { jointLimitsMin(h: number, ax: number): number; jointLimitsMax(h: number, ax: number): number };
    for (const part of this.parts) {
      const joint = part.joint;
      if (!joint || part.body.isKinematic()) continue;
      const parent = this.byId.get(part.spec.parent!)!;
      const pt = parent.body.translation();
      const pr = parent.body.rotation();
      const parentRot = _q.set(pr.x, pr.y, pr.z, pr.w);
      const a1 = joint.anchor1();
      const anchor = _v.set(a1.x, a1.y, a1.z).applyQuaternion(parentRot).add(_p.set(pt.x, pt.y, pt.z));
      const ct = part.body.translation();
      const gap = _g.set(anchor.x - ct.x, anchor.y - ct.y, anchor.z - ct.z);
      if (gap.lengthSq() > PROJECT_GAP * PROJECT_GAP) {
        part.body.setTranslation({ x: anchor.x, y: anchor.y, z: anchor.z }, true);
      }

      const f1 = joint.frameX1();
      const f2 = joint.frameX2();
      const cr = part.body.rotation();
      _qa.set(f1.x, f1.y, f1.z, f1.w).premultiply(parentRot); // parent joint frame in world
      _qb.set(cr.x, cr.y, cr.z, cr.w).multiply(_qf.set(f2.x, f2.y, f2.z, f2.w)); // child joint frame in world
      const rel = _qr.copy(_qa).invert().multiply(_qb);
      if (rel.w < 0) rel.set(-rel.x, -rel.y, -rel.z, -rel.w);
      const comps = [rel.x, rel.y, rel.z];
      let clamped = false;
      for (let k = 0; k < 3; k++) {
        const lo = raw.jointLimitsMin(joint.handle, 3 + k) - PROJECT_ANGLE;
        const hi = raw.jointLimitsMax(joint.handle, 3 + k) + PROJECT_ANGLE;
        const ang = 2 * Math.asin(THREE.MathUtils.clamp(comps[k], -1, 1));
        if (ang < lo || ang > hi) {
          comps[k] = Math.sin(THREE.MathUtils.clamp(ang, lo, hi) / 2);
          clamped = true;
        }
      }
      if (clamped) {
        const w2 = 1 - comps[0] ** 2 - comps[1] ** 2 - comps[2] ** 2;
        rel.set(comps[0], comps[1], comps[2], Math.sqrt(Math.max(0, w2))).normalize();
        // child = parentFrame * rel * inverse(childFrame offset)
        const fixed = _qa.multiply(rel).multiply(_qf.invert());
        part.body.setRotation({ x: fixed.x, y: fixed.y, z: fixed.z, w: fixed.w }, true);
        // Bleed the relative spin that caused the overshoot.
        const pw = parent.body.angvel();
        const cw = part.body.angvel();
        part.body.setAngvel({ x: (cw.x + pw.x) / 2, y: (cw.y + pw.y) / 2, z: (cw.z + pw.z) / 2 }, true);
      }
    }
  }

  centerOfMass(target = new THREE.Vector3()): THREE.Vector3 {
    target.set(0, 0, 0);
    for (const part of this.parts) {
      const c = part.body.worldCom();
      target.x += c.x * part.mass; target.y += c.y * part.mass; target.z += c.z * part.mass;
    }
    return target.multiplyScalar(1 / this.totalMass);
  }

  velocity(target = new THREE.Vector3()): THREE.Vector3 {
    target.set(0, 0, 0);
    for (const part of this.parts) {
      const v = part.body.linvel();
      target.x += v.x * part.mass; target.y += v.y * part.mass; target.z += v.z * part.mass;
    }
    return target.multiplyScalar(1 / this.totalMass);
  }

  /** Interpolated render position of a part's body origin. */
  renderPos(part: Part, alpha: number, target = new THREE.Vector3()): THREE.Vector3 {
    return target.lerpVectors(part.prevPos, part.currPos, alpha);
  }

  renderRot(part: Part, alpha: number, target = new THREE.Quaternion()): THREE.Quaternion {
    return target.slerpQuaternions(part.prevRot, part.currRot, alpha);
  }

  /** Drive the skinned mesh's bones from the interpolated physics state. */
  syncBones(alpha: number): void {
    const worldQuats = new Map<Part, THREE.Quaternion>();
    for (const part of this.parts) {
      const bodyQ = this.renderRot(part, alpha, new THREE.Quaternion());
      const worldQ = bodyQ.multiply(part.bindWorldQuat);
      worldQuats.set(part, worldQ);
      // Parent world rotation = driven ancestor's world rotation * rest chain.
      let parentQ: THREE.Quaternion;
      if (part.drivenAncestor) {
        parentQ = worldQuats.get(part.drivenAncestor)!.clone().multiply(part.parentChainQuat);
      } else {
        parentQ = part.boneMesh.parent!.getWorldQuaternion(_q).clone();
      }
      part.boneMesh.quaternion.copy(parentQ.invert().multiply(worldQ));
    }
    const pelvis = this.get('pelvis');
    this.renderPos(pelvis, alpha, _v).add(this.renderOffset).applyMatrix4(this.armatureInv);
    this.hipsBone.position.copy(_v);
  }
}

function principalAxis(points: THREE.Vector3[], c: THREE.Vector3): THREE.Vector3 {
  // Power iteration on the covariance matrix.
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0;
  for (const p of points) {
    const x = p.x - c.x, y = p.y - c.y, z = p.z - c.z;
    xx += x * x; xy += x * y; xz += x * z; yy += y * y; yz += y * z; zz += z * z;
  }
  const v = new THREE.Vector3(0.3, 0.2, 1).normalize();
  for (let i = 0; i < 24; i++) {
    v.set(xx * v.x + xy * v.y + xz * v.z, xy * v.x + yy * v.y + yz * v.z, xz * v.x + yz * v.y + zz * v.z).normalize();
  }
  return v;
}
