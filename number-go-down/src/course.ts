import * as THREE from 'three';
import { RAPIER, GROUP, groups, type World, type RigidBody, type Collider } from './physics';
import { toon, neon } from './materials';
import { signTexture, rockTexture, chartGridTexture, checkerTexture } from './textures';
import { lavaChannelMaterial, rockSlab, Scenery, tickLava } from './hell';

// The descent into hell. A centreline path of waypoints, each segment built as
// a ramp, staircase, kicker, gap or sheer fall, walled in by a canyon. The
// camera, steering and progress all read the same path.

export type ObstacleKind =
  | 'wall' | 'soft' | 'bumper' | 'ledge' | 'glass' | 'peg' | 'whale' | 'rotor' | 'piston' | 'floor' | 'divider' | 'summit' | 'track' | 'stairs';

export interface Obstacle {
  kind: ObstacleKind;
  label: string;
  damageScale: number;
  kick: number;
  lastKick: number;
  body: RigidBody;
  collider?: Collider;
  mesh?: THREE.Object3D;
  broken?: boolean;
  contactTime?: number;
  update?: (t: number) => void;
  sync?: () => void;
}

export type SensorKind = 'leverage' | 'boost';

export interface Sensor {
  kind: SensorKind;
  value: number;
  label: string;
  collider: Collider;
  mesh: THREE.Object3D;
  used: boolean;
  pos: THREE.Vector3;
  dir: THREE.Vector3;
}

export interface Well {
  label: string;
  mult: number;
  x0: number;
  x1: number;
}

export type ZoneId = 'top' | 'dip' | 'whale' | 'inferno' | 'abyss';

export interface Zone {
  id: ZoneId;
  banner: string;
  sub: string;
  skyTop: number;
  skyHorizon: number;
  fog: number;
  fogDensity: number;
  hemiSky: number;
  hemiGround: number;
  glow: number; // warm light from below (lava)
}

export const ZONES: Record<ZoneId, Zone> = {
  top: { id: 'top', banner: 'ALL TIME HIGH', sub: 'ENJOY THE VIEW', skyTop: 0x2fd6a6, skyHorizon: 0xffc24a, fog: 0xffb070, fogDensity: 0.006, hemiSky: 0xfff4e8, hemiGround: 0x6a3a40, glow: 0xff8a40 },
  dip: { id: 'dip', banner: 'THE DIP', sub: '1ST CIRCLE', skyTop: 0x1a0410, skyHorizon: 0xb0182e, fog: 0x5a0a1c, fogDensity: 0.011, hemiSky: 0xffd6dc, hemiGround: 0x4a0a18, glow: 0xff3a2a },
  whale: { id: 'whale', banner: 'WHALE WATERS', sub: '2ND CIRCLE', skyTop: 0x0a0620, skyHorizon: 0x6a1a5a, fog: 0x2a0d3a, fogDensity: 0.012, hemiSky: 0xd8dcff, hemiGround: 0x1a0a40, glow: 0x7a3aff },
  inferno: { id: 'inferno', banner: 'LIQUIDATION INFERNO', sub: '3RD CIRCLE', skyTop: 0x1a0402, skyHorizon: 0xff5a10, fog: 0x6a1a06, fogDensity: 0.013, hemiSky: 0xffe0c0, hemiGround: 0x5a1004, glow: 0xff6a10 },
  abyss: { id: 'abyss', banner: 'ROCK BOTTOM', sub: '9TH CIRCLE', skyTop: 0x05020a, skyHorizon: 0x3a0a4a, fog: 0x12041c, fogDensity: 0.014, hemiSky: 0xe0d0ff, hemiGround: 0x2a0418, glow: 0xff2a4d },
};

type SegKind = 'flat' | 'slope' | 'stairs' | 'kicker' | 'gap' | 'fall';

interface Waypoint {
  p: [number, number, number];
  kind: SegKind; // the segment that ends at this point
  zone: ZoneId;
  width: number;
}

// Segment i runs from PATH[i - 1] to PATH[i].
const PATH: Waypoint[] = [
  { p: [0, 0, 7], kind: 'flat', zone: 'top', width: 10 },
  { p: [0, 0, -5], kind: 'flat', zone: 'top', width: 10 }, // 1 summit
  { p: [0, -7, -6], kind: 'gap', zone: 'dip', width: 11 }, // 2 off the edge, through the Gates of Hell
  { p: [0, -42, -49], kind: 'stairs', zone: 'dip', width: 11 }, // 3 candle staircase (~39 degrees)
  { p: [0, -45, -61], kind: 'slope', zone: 'dip', width: 11 }, // 4 runout
  { p: [0, -46, -69], kind: 'slope', zone: 'dip', width: 11 }, // 5 the lip: fast clears the chasm, slow drops to the chute
  { p: [0, -58, -91], kind: 'gap', zone: 'whale', width: 12 }, // 6 the chasm
  { p: [9, -100, -152], kind: 'slope', zone: 'whale', width: 12 }, // 7 whale slide (~35 degrees)
  { p: [9, -106, -170], kind: 'slope', zone: 'whale', width: 12 }, // 8 whale pool
  { p: [0, -146, -226], kind: 'slope', zone: 'inferno', width: 9.5 }, // 9 inferno canyon (~35 degrees)
  { p: [0, -148, -238], kind: 'slope', zone: 'inferno', width: 9.5 }, // 10 the lip
  { p: [0, -248, -244], kind: 'fall', zone: 'abyss', width: 10 }, // 11 THE FALL
  { p: [0, -248, -248], kind: 'gap', zone: 'abyss', width: 10 }, // 12 crater (built separately)
];

export const FLOOR_Y = -248;
const CRATER_CENTER = new THREE.Vector3(0, FLOOR_Y, -244);

export const WELLS: Well[] = [
  { label: '-50%', mult: 1.5, x0: -5, x1: -3 },
  { label: '-90%', mult: 2, x0: -3, x1: -1 },
  { label: 'REKT', mult: 5, x0: -1, x1: 1 },
  { label: '-99%', mult: 3, x0: 1, x1: 3 },
  { label: '-50%', mult: 1.5, x0: 3, x1: 5 },
];

export interface Frame {
  s: number;
  progress: number;
  point: THREE.Vector3;
  tangent: THREE.Vector3;
  right: THREE.Vector3;
  zone: Zone;
  segment: number;
}

const UP = new THREE.Vector3(0, 1, 0);
const TRIM: Record<ZoneId, number> = { top: 0xffcf3a, dip: 0xff2a4d, whale: 0x3ac8ff, inferno: 0xff7a1a, abyss: 0xa259ff };
const ENV = groups(GROUP.ENV, GROUP.ALL_PARTS | GROUP.DEBRIS);
const SENSOR = groups(GROUP.SENSOR, GROUP.ALL_PARTS);
const _m = new THREE.Matrix4();

function v(p: [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(p[0], p[1], p[2]);
}

/** Frame of a segment: forward along it, right across it (horizontal), normal up off its surface. */
function segFrame(a: THREE.Vector3, b: THREE.Vector3): { f: THREE.Vector3; r: THREE.Vector3; n: THREE.Vector3; len: number } {
  const d = b.clone().sub(a);
  const len = d.length();
  const f = d.normalize();
  const r = new THREE.Vector3().crossVectors(f, UP);
  if (r.lengthSq() < 1e-6) r.set(1, 0, 0);
  r.normalize();
  const n = new THREE.Vector3().crossVectors(r, f).normalize();
  return { f, r, n, len };
}

function basis(r: THREE.Vector3, n: THREE.Vector3, f: THREE.Vector3): THREE.Quaternion {
  _m.makeBasis(r, n, f.clone().negate());
  return new THREE.Quaternion().setFromRotationMatrix(_m);
}

export class Course {
  group = new THREE.Group();
  obstacles: Obstacle[] = [];
  sensors: Sensor[] = [];
  private byCollider = new Map<number, Obstacle>();
  private sensorByCollider = new Map<number, Sensor>();
  private moving: Obstacle[] = [];
  private points = PATH.map((w) => v(w.p));
  private cumulative: number[] = [0];
  readonly length: number;
  readonly floorY = FLOOR_Y;
  private scenery!: Scenery;
  private mats = {
    red: toon(0xe8102e, { emissive: 0x4a0010 }),
    redStep: toon(0xd0122c, { emissive: 0x2a0008 }),
    redDark: toon(0x8a0c22),
    green: toon(0x16d98f, { emissive: 0x053a24 }),
    gold: toon(0xffcf3a, { emissive: 0x3a2400 }),
    marble: toon(0xffffff, { map: checkerTexture(), emissive: 0x150a12 }),
    wick: toon(0x1a0a12),
    whale: toon(0x3d7bff, { emissive: 0x081a40 }),
    whaleBelly: toon(0xdfe8ff),
    ink: toon(0x0b0410),
    glass: toon(0x7fffd4, { transparent: true, opacity: 0.45, emissive: 0x0d4038 }),
    steel: toon(0x6a6680),
    liquidity: toon(0x1c1a5a, { emissive: 0x0a0830, rim: 0x5a8cff, rimStrength: 0.5 }),
    basalt: toon(0x2a1414, { emissive: 0x1a0402 }),
    crater: toon(0x1c0a26, { emissive: 0x220418 }),
    stone: toon(0x1e1018),
  };

  constructor(private world: World, scene: THREE.Scene) {
    for (let i = 1; i < this.points.length; i++) {
      this.cumulative.push(this.cumulative[i - 1] + this.points[i].distanceTo(this.points[i - 1]));
    }
    this.length = this.cumulative[this.cumulative.length - 1];
    scene.add(this.group);
    this.buildTrack();
    this.buildObstacles();
    this.buildCrater();
    this.buildScenery(scene);
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && (m.material as THREE.Material).type === 'MeshToonMaterial') m.receiveShadow = true;
    });
  }

  readonly craterCenter = CRATER_CENTER.clone();

  /** A slingshot post collider (the slingshot builds its own visuals). */
  addPost(pos: THREE.Vector3, q: THREE.Quaternion): void {
    this.addStatic('wall', 'GUITAR', RAPIER.ColliderDesc.cuboid(0.2, 2.1, 0.12), pos, q, { damageScale: 0.9 });
  }

  obstacleOf(handle: number): Obstacle | undefined {
    return this.byCollider.get(handle);
  }

  sensorOf(handle: number): Sensor | undefined {
    return this.sensorByCollider.get(handle);
  }

  wellAt(pos: THREE.Vector3): Well {
    const x = pos.x - CRATER_CENTER.x;
    return WELLS.find((w) => x >= w.x0 && x < w.x1) ?? (x < 0 ? WELLS[0] : WELLS[WELLS.length - 1]);
  }

  reset(): void {
    for (const o of this.obstacles) {
      if (o.kind === 'glass' && o.broken) {
        o.broken = false;
        o.contactTime = 0;
        o.body.setEnabled(true);
        if (o.mesh) o.mesh.visible = true;
      }
    }
    for (const s of this.sensors) {
      s.used = false;
      s.mesh.visible = true;
    }
  }

  step(t: number): void {
    for (const o of this.moving) o.update!(t);
  }

  syncMeshes(time: number, dt: number, fog?: THREE.FogExp2): void {
    for (const o of this.moving) o.sync?.();
    tickLava(time, fog);
    this.scenery.update(time, dt);
  }

  /** Nearest point on the centreline, with a smoothed direction for the camera and steering. */
  frameAt(pos: THREE.Vector3): Frame {
    let best = { d: Infinity, i: 1, t: 0 };
    for (let i = 1; i < this.points.length; i++) {
      const a = this.points[i - 1];
      const b = this.points[i];
      const ab = b.clone().sub(a);
      const t = THREE.MathUtils.clamp(pos.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1);
      const d = a.clone().addScaledVector(ab, t).distanceToSquared(pos);
      if (d < best.d) best = { d, i, t };
    }
    const segLen = this.cumulative[best.i] - this.cumulative[best.i - 1];
    const s = this.cumulative[best.i - 1] + best.t * segLen;
    const point = this.pointAt(s);
    // Smooth the direction over a window so corners do not snap the camera.
    const tangent = this.pointAt(s + 9).sub(this.pointAt(s - 3)).normalize();
    const right = new THREE.Vector3().crossVectors(tangent, UP);
    if (right.lengthSq() < 1e-4) right.set(1, 0, 0);
    right.normalize();
    return { s, progress: s / this.length, point, tangent, right, zone: ZONES[PATH[best.i].zone], segment: best.i };
  }

  pointAt(s: number): THREE.Vector3 {
    const c = THREE.MathUtils.clamp(s, 0, this.length);
    for (let i = 1; i < this.points.length; i++) {
      if (c <= this.cumulative[i] || i === this.points.length - 1) {
        const t = (c - this.cumulative[i - 1]) / Math.max(1e-6, this.cumulative[i] - this.cumulative[i - 1]);
        return this.points[i - 1].clone().lerp(this.points[i], THREE.MathUtils.clamp(t, 0, 1));
      }
    }
    return this.points[this.points.length - 1].clone();
  }

  /** A point on segment i (1-based): fraction t along it, x across it, h above its surface. */
  private at(i: number, t: number, x = 0, h = 0): { p: THREE.Vector3; f: THREE.Vector3; r: THREE.Vector3; n: THREE.Vector3 } {
    const a = this.points[i - 1];
    const b = this.points[i];
    const fr = segFrame(a, b);
    const p = a.clone().lerp(b, t).addScaledVector(fr.r, x).addScaledVector(fr.n, h);
    if (PATH[i].kind === 'stairs') {
      // Stand on the step, not on the diagonal through the step corners.
      const steps = this.stepCount(i);
      const k = Math.min(steps - 1, Math.floor(t * steps));
      p.y = a.y - k * ((a.y - b.y) / steps) + h;
    }
    return { p, ...fr };
  }

  private stepCount(i: number): number {
    const a = this.points[i - 1];
    const b = this.points[i];
    // Short steps (Stair Dismount): every one is a bonk, none is a resting place.
    return Math.max(2, Math.round((a.y - b.y) / 1.3));
  }

  // ------------------------------------------------------------------ building blocks

  private addStatic(kind: ObstacleKind, label: string, desc: ReturnType<typeof RAPIER.ColliderDesc.cuboid>, pos: THREE.Vector3, rot: THREE.Quaternion,
    opts: { damageScale?: number; kick?: number; restitution?: number; friction?: number } = {}, mesh?: THREE.Object3D): Obstacle {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z).setRotation({ x: rot.x, y: rot.y, z: rot.z, w: rot.w }),
    );
    const c = this.world.createCollider(
      desc.setCollisionGroups(ENV).setRestitution(opts.restitution ?? 0.12).setFriction(opts.friction ?? 0.5)
        .setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Max),
      body,
    );
    const o: Obstacle = { kind, label, damageScale: opts.damageScale ?? 1, kick: opts.kick ?? 0, lastKick: -1, body, collider: c, mesh };
    this.byCollider.set(c.handle, o);
    this.obstacles.push(o);
    if (mesh) {
      mesh.position.copy(pos);
      mesh.quaternion.copy(rot);
      this.group.add(mesh);
    }
    return o;
  }

  private addKinematic(kind: ObstacleKind, label: string, descs: ReturnType<typeof RAPIER.ColliderDesc.cuboid>[], mesh: THREE.Object3D,
    opts: { damageScale?: number; kick?: number; restitution?: number },
    update: (t: number, body: RigidBody) => void): Obstacle {
    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased());
    const o: Obstacle = { kind, label, damageScale: opts.damageScale ?? 1, kick: opts.kick ?? 0, lastKick: -1, body, mesh };
    for (const d of descs) {
      const c = this.world.createCollider(
        d.setCollisionGroups(ENV).setRestitution(opts.restitution ?? 0.2).setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Max),
        body,
      );
      this.byCollider.set(c.handle, o);
    }
    o.update = (t) => update(t, body);
    o.update(0);
    body.setTranslation(body.nextTranslation(), true);
    body.setRotation(body.nextRotation(), true);
    o.sync = () => {
      const p = body.translation();
      const r = body.rotation();
      mesh.position.set(p.x, p.y, p.z);
      mesh.quaternion.set(r.x, r.y, r.z, r.w);
    };
    o.sync();
    this.group.add(mesh);
    this.obstacles.push(o);
    this.moving.push(o);
    return o;
  }

  private addSensor(kind: SensorKind, value: number, label: string, pos: THREE.Vector3, dir: THREE.Vector3, radius: number, mesh: THREE.Object3D): void {
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z).setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }));
    const c = this.world.createCollider(
      RAPIER.ColliderDesc.cylinder(radius * 0.4, radius).setSensor(true).setCollisionGroups(SENSOR).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
      body,
    );
    mesh.position.copy(pos);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().negate());
    this.group.add(mesh);
    const s: Sensor = { kind, value, label, collider: c, mesh, used: false, pos: pos.clone(), dir: dir.clone() };
    this.sensors.push(s);
    this.sensorByCollider.set(c.handle, s);
  }

  private candleMesh(w: number, h: number, d: number, mat: THREE.Material, wickTop: number, wickBottom: number): THREE.Group {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat));
    const wickR = Math.min(0.1, w * 0.08);
    if (wickTop > 0) {
      const wt = new THREE.Mesh(new THREE.CylinderGeometry(wickR, wickR, wickTop, 8), this.mats.wick);
      wt.position.y = h / 2 + wickTop / 2;
      g.add(wt);
    }
    if (wickBottom > 0) {
      const wb = new THREE.Mesh(new THREE.CylinderGeometry(wickR, wickR, wickBottom, 8), this.mats.wick);
      wb.position.y = -h / 2 - wickBottom / 2;
      g.add(wb);
    }
    // A slightly larger dark shell reads as a comic outline.
    const edge = new THREE.Mesh(new THREE.BoxGeometry(w * 1.05, h * 1.02, d * 1.05), this.mats.ink);
    (edge.material as THREE.Material).side = THREE.BackSide;
    g.add(edge);
    return g;
  }

  // ------------------------------------------------------------------ track

  private buildTrack(): void {
    const rock = rockTexture();
    for (let i = 1; i < this.points.length - 1; i++) {
      const w = PATH[i];
      const a = this.points[i - 1];
      const b = this.points[i];
      const fr = segFrame(a, b);
      const width = w.width;
      const mat = this.surfaceMat(w.zone, i);
      switch (w.kind) {
        case 'flat':
        case 'slope':
        case 'kicker':
          this.ramp(a, b, width, mat, w.zone === 'top' ? 'summit' : 'track', i);
          break;
        case 'stairs':
          this.stairs(i, width);
          break;
        case 'gap':
        case 'fall':
          break;
      }
      this.canyon(i, a, b, fr, width, rock, w.kind);
    }
    // Under the chasm: a slick chute so a short jump still reaches Whale Waters.
    const chuteA = new THREE.Vector3(0, -50.5, -70.5);
    const chuteB = this.points[6].clone().add(new THREE.Vector3(0, -0.05, 0.6));
    this.ramp(chuteA, chuteB, 12, this.mats.basalt, 'track', 6, 0.15);
  }

  private surfaceMat(zone: ZoneId, i: number): THREE.Material {
    if (zone === 'top') return this.mats.marble;
    if (zone === 'whale') return this.mats.liquidity;
    if (zone === 'inferno') return this.mats.basalt;
    if (zone === 'abyss') return this.mats.crater;
    return i % 2 ? this.mats.redStep : this.mats.red;
  }

  private ramp(a: THREE.Vector3, b: THREE.Vector3, width: number, mat: THREE.Material, kind: ObstacleKind, seg: number, friction = 0.16): void {
    const fr = segFrame(a, b);
    const T = 2;
    const center = a.clone().add(b).multiplyScalar(0.5).addScaledVector(fr.n, -T / 2);
    const q = basis(fr.r, fr.n, fr.f);
    const g = new THREE.Group();
    const slab = new THREE.Mesh(new THREE.BoxGeometry(width, T, fr.len + 0.2), mat);
    g.add(slab);
    // The summit: an emo checkerboard (the Vans pattern) with hot-pink neon edges.
    if (seg <= 1) {
      const checker = new THREE.Mesh(new THREE.PlaneGeometry(width, fr.len), new THREE.MeshToonMaterial({ map: checkerTexture(width / 1.25, fr.len / 1.25), gradientMap: (this.mats.red as THREE.MeshToonMaterial).gradientMap }));
      checker.rotation.x = -Math.PI / 2;
      checker.position.y = T / 2 + 0.01;
      checker.receiveShadow = true;
      g.add(checker);
      for (const side of [-1, 1]) {
        const trim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, fr.len), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff4fd8).multiplyScalar(2.2), toneMapped: false }));
        trim.position.set(side * (width / 2 - 0.07), T / 2 + 0.07, 0);
        g.add(trim);
      }
      void chartGridTexture;
    }
    this.addStatic(kind, kind === 'summit' ? 'THE TOP' : 'THE GROUND', RAPIER.ColliderDesc.cuboid(width / 2, T / 2, fr.len / 2 + 0.1), center, q,
      { damageScale: 0.85, friction, restitution: 0.08 }, g);
  }

  /** A staircase of giant red candles (Stair Dismount, but it is a chart). */
  private stairs(i: number, width: number): void {
    const a = this.points[i - 1];
    const b = this.points[i];
    const steps = this.stepCount(i);
    const rise = (a.y - b.y) / steps;
    const flat = new THREE.Vector3(b.x - a.x, 0, b.z - a.z);
    const run = flat.length() / steps;
    const f = flat.normalize();
    const r = new THREE.Vector3().crossVectors(f, UP).normalize();
    const q = basis(r, UP, f);
    const depth = rise + 2.5;
    for (let k = 0; k < steps; k++) {
      const top = a.y - k * rise;
      const center = new THREE.Vector3(a.x, top - depth / 2, a.z).addScaledVector(f, (k + 0.5) * run);
      const mesh = this.candleMesh(width, depth, run, k % 2 ? this.mats.red : this.mats.redStep, 0, 0);
      this.addStatic('stairs', 'RED CANDLE', RAPIER.ColliderDesc.cuboid(width / 2, depth / 2, run / 2), center, q, { damageScale: 1.05, friction: 0.16, restitution: 0.12 }, mesh);
    }
  }

  /** Canyon walls along a segment; tall colliders so nobody escapes, rock visuals. */
  private canyon(i: number, a: THREE.Vector3, b: THREE.Vector3, fr: ReturnType<typeof segFrame>, width: number, rock: THREE.Texture, kind: SegKind): void {
    const zone = PATH[i].zone;
    if (zone === 'top' && i === 1) {
      // Open summit: low invisible rails only, so the view stays clear.
      for (const side of [-1, 1]) {
        const c = a.clone().add(b).multiplyScalar(0.5).addScaledVector(fr.r, side * (width / 2 + 0.5)).add(new THREE.Vector3(0, 1.5, 0));
        this.addStatic('soft', '', RAPIER.ColliderDesc.cuboid(0.5, 1.5, fr.len / 2), c, basis(fr.r, fr.n, fr.f), { damageScale: 0.2 });
      }
      return;
    }
    const H = kind === 'fall' ? 40 : 22;
    const visH = kind === 'fall' ? 112 : 9;
    const tint = new THREE.Color(ZONES[zone].hemiGround).lerp(new THREE.Color(0x3a2a30), 0.5);
    const mat = new THREE.MeshToonMaterial({ map: rock, color: tint, emissive: new THREE.Color(ZONES[zone].glow).multiplyScalar(0.1), emissiveMap: rock, gradientMap: (this.mats.red as THREE.MeshToonMaterial).gradientMap });
    rock.repeat.set(1, 1);
    const len = kind === 'fall' ? width + 4 : fr.len + 1.5;
    for (const side of [-1, 1]) {
      if (kind === 'fall') {
        // A square shaft: four walls around the drop.
        break;
      }
      const base = a.clone().add(b).multiplyScalar(0.5).addScaledVector(fr.r, side * (width / 2 + 0.6));
      const q = basis(fr.r, fr.n, fr.f);
      const colCenter = base.clone().addScaledVector(fr.n, H / 2 - (kind === 'gap' ? 14 : 2));
      this.addStatic('wall', 'CANYON WALL', RAPIER.ColliderDesc.cuboid(0.6, H / 2 + (kind === 'gap' ? 8 : 0), len / 2), colCenter, q, { damageScale: 0.7, friction: 0.25 });
      const wallH = visH + (kind === 'gap' ? 26 : 0);
      const wallPos = base.clone().addScaledVector(fr.n, visH / 2 - 1.5 - (kind === 'gap' ? 13 : 0)).addScaledVector(fr.r, side * 0.8);
      const xf = new THREE.Matrix4().compose(wallPos, q, new THREE.Vector3(1, 1, 1));
      const wall = new THREE.Mesh(rockSlab(2.6, wallH, len + 2, xf, i * 7 + side), mat);
      wall.position.copy(wallPos);
      wall.quaternion.copy(q);
      this.group.add(wall);
      // Neon trim along the track edge in the circle's colour.
      if (kind !== 'gap') {
        const trim = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, fr.len), new THREE.MeshBasicMaterial({ color: new THREE.Color(TRIM[zone]).multiplyScalar(2.2), toneMapped: false }));
        trim.position.copy(a.clone().add(b).multiplyScalar(0.5).addScaledVector(fr.r, side * (width / 2 - 0.08)).addScaledVector(fr.n, 0.06));
        trim.quaternion.copy(q);
        this.group.add(trim);
      }
    }
    if (kind === 'fall') {
      const top = a.y + 6;
      const bottom = FLOOR_Y - 2;
      const h = top - bottom;
      const cx = (a.x + b.x) / 2;
      const cz = b.z;
      const half = width / 2 + 0.6;
      const walls: [number, number, number, number][] = [
        [cx - half, cz, 0.6, half + 0.6],
        [cx + half, cz, 0.6, half + 0.6],
        [cx, cz - half, half + 0.6, 0.6],
      ];
      for (const [x, z, hx, hz] of walls) {
        const c = new THREE.Vector3(x, bottom + h / 2, z);
        this.addStatic('wall', 'SHAFT WALL', RAPIER.ColliderDesc.cuboid(hx, h / 2, hz), c, new THREE.Quaternion(), { damageScale: 0.8, friction: 0.25 });
        const m = new THREE.Mesh(new THREE.BoxGeometry(hx * 2, h, hz * 2), mat);
        (m.material as THREE.MeshToonMaterial).map!.repeat.set(Math.max(hx, hz) / 4, h / 8);
        m.position.copy(c);
        this.group.add(m);
      }
      // The back of the shaft (toward the lip) is open above the lip for the camera.
      const backC = new THREE.Vector3(cx, (a.y - 2 + bottom) / 2, cz + half);
      this.addStatic('wall', 'SHAFT WALL', RAPIER.ColliderDesc.cuboid(half + 1.5, (a.y - 2 - bottom) / 2, 0.6), backC, new THREE.Quaternion(), { damageScale: 0.8, friction: 0.25 });
    }
  }

  // ------------------------------------------------------------------ obstacles

  private buildObstacles(): void {
    // Summit: ATH candles flanking the slingshot and the Gates of Hell at the edge.
    for (const side of [-1, 1]) {
      const m = this.candleMesh(1.4, 5, 1.4, this.mats.green, 1.4, 0);
      this.addStatic('summit', 'GREEN CANDLE', RAPIER.ColliderDesc.cuboid(0.7, 2.5, 0.7), new THREE.Vector3(side * 4.2, 2.5, 3), new THREE.Quaternion(), { damageScale: 0.7 }, m);
    }
    this.gatesOfHell(this.at(3, 0.16, 0, 0).p.setX(0));

    // 1st circle, The Dip: bumper candles and wicks on the staircase.
    this.bumperCandle(3, 0.22, -2.8, 1.2, 3.6);
    this.bumperCandle(3, 0.42, 3.0, 1.2, 4.2);
    this.bumperCandle(3, 0.62, -0.6, 1.3, 3.2);
    this.bumperCandle(3, 0.82, 2.4, 1.1, 3.8);
    for (const [t, x] of [[0.12, 1.5], [0.3, -0.8], [0.5, -3.6], [0.55, 1.2], [0.72, -2.5], [0.9, -1]] as const) this.wick(3, t, x);
    this.gate('leverage', 2, 'x2', 3, 0.5, 2.6, 3.2, 1.05);
    this.gate('boost', 10, 'DUMP\nIT', 4, 0.45, 0, 1.4, 1.5);

    // The chasm: a SUPPORT bridge for weak jumps, an x5 ring for big ones.
    this.glassBridge(6, 0.45, -3.2);
    this.gate('leverage', 5, 'x5', 6, 0.5, 0, 5.2, 0.9);

    // 2nd circle, Whale Waters.
    this.whale(7, 0.22, 1.1, 0.9);
    this.whale(7, 0.55, -1.0, 1.25);
    this.whale(7, 0.84, 0.7, 0.75);
    this.bumperCandle(7, 0.38, 4.2, 1.2, 3.2);
    this.bumperCandle(7, 0.7, -4.4, 1.2, 3.6);
    this.megaWhale(8, 0.5);

    // 3rd circle, Liquidation Inferno.
    this.rotor(9, 0.22, 'flat');
    this.piston(9, 0.42, -1);
    this.piston(9, 0.5, 1);
    this.rotor(9, 0.68, 'wheel');
    this.bumperCandle(9, 0.84, 2.6, 1.1, 3.2);
    this.gate('boost', 12, 'DUMP\nIT', 9, 0.92, 0, 1.4, 1.4);
    this.gate('leverage', 2, 'x2', 10, 0.75, 0, 1.8, 1.4);
    this.lavaPits();

    // The Fall: candle ledges jutting from the shaft walls.
    const fall = this.points[11];
    for (const [depth, side, len] of [[22, -1, 3.4], [44, 1, 3.8], [64, -1, 3.2], [82, 1, 3.6]] as const) {
      const y = this.points[10].y - depth;
      const x = side * (5 - len / 2 + 0.3);
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, side * -0.42));
      const m = this.candleMesh(len, 0.9, 3.4, this.mats.red, 0, 0);
      this.addStatic('ledge', 'RED CANDLE', RAPIER.ColliderDesc.cuboid(len / 2, 0.45, 1.7), new THREE.Vector3(fall.x + x, y, fall.z - 1), q,
        { damageScale: 1.1, kick: 3, friction: 0.12, restitution: 0.3 }, m);
    }
  }

  private gatesOfHell(at: THREE.Vector3): void {
    const g = new THREE.Group();
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 11, 1.4), this.mats.stone);
      pillar.position.set(side * 5.6, 3.5, 0);
      g.add(pillar);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.8, 4), this.mats.ink);
      cap.position.set(side * 5.6, 9.9, 0);
      cap.rotation.y = Math.PI / 4;
      g.add(cap);
      // Horns: this is hell, after all.
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.2, 8), this.mats.redDark);
      horn.position.set(side * 6.4, 9.6, 0);
      horn.rotation.z = -side * 0.7;
      g.add(horn);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(12.6, 1.7, 1.1), this.mats.stone);
    lintel.position.set(0, 8.4, 0);
    g.add(lintel);
    const tex = signTexture('ABANDON ALL HOPE\nYE WHO BUY THE TOP', { color: '#ff2a4d', glow: '#ff2a4d', stroke: '#1a0006', width: 1024, height: 240 });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 2.45), neon(tex, 1.8));
    sign.position.set(0, 8.4, 0.6);
    g.add(sign);
    g.position.copy(at);
    this.group.add(g);
    // Pillars are real obstacles.
    for (const side of [-1, 1]) {
      this.addStatic('wall', 'GATES OF HELL', RAPIER.ColliderDesc.cuboid(0.7, 5.5, 0.7), at.clone().add(new THREE.Vector3(side * 5.6, 3.5, 0)), new THREE.Quaternion(), { damageScale: 1 });
    }
    this.addStatic('wall', 'GATES OF HELL', RAPIER.ColliderDesc.cuboid(6.3, 0.85, 0.55), at.clone().add(new THREE.Vector3(0, 8.4, 0)), new THREE.Quaternion(), { damageScale: 1.1 });
  }

  private bumperCandle(i: number, t: number, x: number, w: number, h: number): void {
    const { p } = this.at(i, t, x, 0);
    p.y += h / 2;
    const mesh = this.candleMesh(w, h, w, this.mats.red, h * 0.28, 0);
    this.addStatic('bumper', 'RED CANDLE', RAPIER.ColliderDesc.cuboid(w / 2, h / 2, w / 2), p, new THREE.Quaternion(), { damageScale: 1.1, kick: 7.5, restitution: 0.55 }, mesh);
    const wickBody = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(p.x, p.y, p.z));
    const c = this.world.createCollider(RAPIER.ColliderDesc.capsule(h * 0.14, 0.08).setTranslation(0, h / 2 + h * 0.14, 0).setCollisionGroups(ENV), wickBody);
    this.byCollider.set(c.handle, { kind: 'peg', label: 'WICK', damageScale: 1.3, kick: 0, lastKick: -1, body: wickBody });
  }

  /** A bare candle wick sticking out of a step: thin, snaggy, funny. */
  private wick(i: number, t: number, x: number): void {
    const { p } = this.at(i, t, x, 0);
    const h = 1.6;
    p.y += h / 2;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, h, 8), this.mats.wick);
    this.addStatic('peg', 'WICK', RAPIER.ColliderDesc.capsule(h / 2, 0.09), p, new THREE.Quaternion(), { damageScale: 1.3, restitution: 0.3 }, m);
  }

  private gate(kind: SensorKind, value: number, label: string, i: number, t: number, x: number, h: number, radius: number): void {
    const { p, f } = this.at(i, t, x, h);
    const g = new THREE.Group();
    const color = kind === 'boost' ? 0x39f0b0 : 0xffcf3a;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.13, 10, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.8), toneMapped: false }));
    g.add(ring);
    const inner = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.92, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
    g.add(inner);
    const tex = signTexture(label, { color: '#fff7f2', stroke: '#0b0410', width: 256, height: 256 });
    const text = new THREE.Mesh(new THREE.PlaneGeometry(radius * 1.5, radius * 1.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    text.position.z = 0.05;
    g.add(text);
    g.userData.spin = ring;
    this.addSensor(kind, value, kind === 'boost' ? 'DUMP IT' : `x${value} LEVERAGE`, p, f, radius, g);
  }

  private glassBridge(i: number, t: number, drop: number): void {
    const a = this.points[i - 1];
    const b = this.points[i];
    const fr = segFrame(a, b);
    const flatF = new THREE.Vector3(fr.f.x, 0, fr.f.z).normalize();
    const r = new THREE.Vector3().crossVectors(flatF, UP).normalize();
    const p = a.clone().lerp(b, t);
    p.y = Math.max(a.y, b.y) + drop;
    const len = fr.len * 0.55;
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(12, 0.35, len), this.mats.glass));
    const label = new THREE.Mesh(new THREE.PlaneGeometry(5, 1), neon(signTexture('SUPPORT', { color: '#7fffd4', glow: '#39f0b0', stroke: '#002a1c' }), 1.5));
    label.rotation.x = -Math.PI / 2;
    label.position.y = 0.2;
    g.add(label);
    const o = this.addStatic('glass', 'SUPPORT', RAPIER.ColliderDesc.cuboid(6, 0.175, len / 2), p, basis(r, UP, flatF), { damageScale: 0.8, restitution: 0.1 }, g);
    o.broken = false;
    o.contactTime = 0;
  }

  private whaleMesh(scale: number): THREE.Group {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), this.mats.whale);
    body.scale.set(2.0, 1.05, 1.0);
    g.add(body);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45), this.mats.whaleBelly);
    belly.scale.set(1.92, 1.0, 0.96);
    g.add(belly);
    const tail = new THREE.Group();
    for (const s of [-1, 1]) {
      const fluke = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.2, 4), this.mats.whale);
      fluke.rotation.z = s * 0.9 + Math.PI / 2;
      fluke.scale.set(1, 1, 0.3);
      fluke.position.set(0.25, s * 0.42, 0);
      tail.add(fluke);
    }
    tail.position.set(-2.2, 0.35, 0);
    g.add(tail);
    for (const z of [-0.55, 0.55]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), this.mats.ink);
      eye.position.set(1.35, 0.2, z * 1.1);
      g.add(eye);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      glint.position.set(1.4, 0.26, z * 1.18);
      g.add(glint);
    }
    g.scale.setScalar(scale);
    return g;
  }

  /** A whale swimming across the slide, breaching up and down through the surface. */
  private whale(i: number, t: number, phase: number, speed: number): void {
    const base = this.at(i, t, 0, 0);
    const width = PATH[i].width;
    const g = this.whaleMesh(1.15);
    // Local +X is the head; swim across the slide.
    const yaw = Math.atan2(-base.r.z, base.r.x);
    this.addKinematic('whale', 'WHALE', [
      RAPIER.ColliderDesc.capsule(1.25, 1.05).setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))),
    ], g, { damageScale: 1.2, kick: 9, restitution: 0.9 }, (time, b) => {
      const swim = Math.sin(time * speed + phase);
      const x = swim * (width / 2 - 2.2);
      const breach = 0.4 + Math.max(0, Math.sin(time * speed * 2 + phase * 3)) * 1.6;
      const p = base.p.clone().addScaledVector(base.r, x).addScaledVector(base.n, breach);
      b.setNextKinematicTranslation({ x: p.x, y: p.y, z: p.z });
      const dir = Math.cos(time * speed + phase) >= 0 ? 0 : Math.PI;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw + dir, Math.sin(time * speed * 2 + phase * 3) * 0.25));
      b.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    });
  }

  /** The mega whale sits in the pool and blows you onward. */
  private megaWhale(i: number, t: number): void {
    const base = this.at(i, t, 0, 1.4);
    const g = this.whaleMesh(2.1);
    const yaw = Math.atan2(-base.r.z, base.r.x);
    this.addKinematic('whale', 'MEGA WHALE', [
      RAPIER.ColliderDesc.capsule(2.3, 1.9).setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))),
    ], g, { damageScale: 1.3, kick: 11, restitution: 0.95 }, (time, b) => {
      const p = base.p.clone().addScaledVector(base.n, Math.sin(time * 1.6) * 0.4);
      b.setNextKinematicTranslation({ x: p.x, y: p.y, z: p.z });
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw + Math.sin(time * 0.5) * 0.3, Math.sin(time * 1.6) * 0.06));
      b.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    });
  }

  /** SELL WALL: a red bar sweeping across the track ('flat') or wheeling over it ('wheel'). */
  private rotor(i: number, t: number, mode: 'flat' | 'wheel'): void {
    const base = this.at(i, t, 0, mode === 'flat' ? 0.8 : 3.4);
    const width = PATH[i].width;
    const len = width * 0.82;
    const g = new THREE.Group();
    g.add(this.candleMesh(len, 0.7, 0.9, this.mats.red, 0, 0));
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 20), this.mats.steel);
    if (mode === 'wheel') hub.rotation.x = Math.PI / 2;
    g.add(hub);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), neon(signTexture('SELL WALL', { color: '#fff7f2', stroke: '#3a0010' }), 1.2));
    sign.position.set(len * 0.25, 0, 0.47);
    g.add(sign);
    const frameQ = basis(base.r, base.n, base.f);
    this.addKinematic('rotor', 'SELL WALL', [RAPIER.ColliderDesc.cuboid(len / 2, 0.35, 0.45), RAPIER.ColliderDesc.ball(0.5)], g,
      { damageScale: 1.35, restitution: 0.35, kick: 4 }, (time, b) => {
        b.setNextKinematicTranslation({ x: base.p.x, y: base.p.y, z: base.p.z });
        const spin = new THREE.Quaternion().setFromEuler(mode === 'flat' ? new THREE.Euler(0, time * 1.7, 0) : new THREE.Euler(0, 0, -time * 1.9));
        const q = frameQ.clone().multiply(mode === 'flat' ? spin : spin);
        b.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
      });
  }

  private piston(i: number, t: number, side: number): void {
    const width = PATH[i].width;
    const base = this.at(i, t, 0, 0.7);
    const g = new THREE.Group();
    g.add(this.candleMesh(3, 1.4, 2.2, this.mats.red, 0, 0));
    const rod = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 0.6), this.mats.steel);
    rod.position.x = side * 3.4;
    g.add(rod);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), neon(signTexture('LIQUIDATED', { color: '#fff7f2', stroke: '#3a0010' }), 1.2));
    sign.position.set(0, 0.72, 0);
    sign.rotation.x = -Math.PI / 2;
    g.add(sign);
    const frameQ = basis(base.r, base.n, base.f);
    const phase = side > 0 ? Math.PI : 0;
    this.addKinematic('piston', 'LIQUIDATION', [RAPIER.ColliderDesc.cuboid(1.5, 0.7, 1.1)], g, { damageScale: 1.25, kick: 8, restitution: 0.4 }, (time, b) => {
      const out = 0.5 + 0.5 * Math.sin(time * 2.6 + phase);
      const x = side * (width / 2 - 1.5 - out * (width / 2 - 1.2));
      const p = base.p.clone().addScaledVector(base.r, x);
      b.setNextKinematicTranslation({ x: p.x, y: p.y, z: p.z });
      b.setNextKinematicRotation({ x: frameQ.x, y: frameQ.y, z: frameQ.z, w: frameQ.w });
    });
  }

  /** Glowing lava channels along the inferno's edges (visual; the walls do the hitting). */
  private lavaPits(): void {
    const mat = lavaChannelMaterial();
    for (const side of [-1, 1]) {
      for (const i of [9, 10]) {
        const a = this.points[i - 1];
        const b = this.points[i];
        const fr = segFrame(a, b);
        const strip = new THREE.Mesh(new THREE.PlaneGeometry(1.1, fr.len), mat);
        const c = a.clone().add(b).multiplyScalar(0.5).addScaledVector(fr.r, side * (PATH[i].width / 2 - 0.55)).addScaledVector(fr.n, 0.03);
        strip.position.copy(c);
        strip.quaternion.copy(basis(fr.r, fr.n, fr.f)).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)));
        this.group.add(strip);
      }
    }
  }

  // ------------------------------------------------------------------ Rock Bottom

  private buildCrater(): void {
    const c = CRATER_CENTER;
    const floor = new THREE.Group();
    floor.add(new THREE.Mesh(new THREE.BoxGeometry(10, 2, 12), this.mats.crater));
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(10, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff2a4d).multiplyScalar(0.55), toneMapped: false }));
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 1.01;
    floor.add(glow);
    this.addStatic('floor', 'ROCK BOTTOM', RAPIER.ColliderDesc.cuboid(5, 1, 6), new THREE.Vector3(c.x, FLOOR_Y - 1, c.z), new THREE.Quaternion(),
      { damageScale: 1.5, restitution: 0.2, friction: 0.9 }, floor);
    for (const x of [-3, -1, 1, 3]) {
      const div = this.candleMesh(0.24, 1.4, 11, this.mats.ink, 0, 0);
      this.addStatic('divider', 'DIVIDER', RAPIER.ColliderDesc.cuboid(0.12, 0.7, 5.5), new THREE.Vector3(c.x + x, FLOOR_Y + 0.7, c.z), new THREE.Quaternion(), { damageScale: 1.1 }, div);
    }
    for (const w of WELLS) {
      const hot = w.label === 'REKT';
      const tex = signTexture(`${w.label}\nx${w.mult}`, { color: hot ? '#ffcf3a' : '#ff2a4d', glow: hot ? '#ffcf3a' : '#ff2a4d', stroke: '#0b0410', width: 256, height: 256 });
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), neon(tex, 1.5));
      sign.rotation.x = -Math.PI / 2;
      sign.position.set(c.x + (w.x0 + w.x1) / 2, FLOOR_Y + 0.03, c.z);
      this.group.add(sign);
    }
  }

  // ------------------------------------------------------------------ scenery

  private buildScenery(scene: THREE.Scene): void {
    this.scenery = new Scenery(scene, { pathPoints: this.points, rockMat: this.mats.stone });
    // The crash chart: a neon line dropping across the sky behind everything.
    const pts: THREE.Vector3[] = [];
    let y = 160;
    for (let k = 0; k <= 40; k++) {
      y += (k % 3 === 0 ? 16 : -24) * (0.6 + ((k * 37) % 10) / 12);
      pts.push(new THREE.Vector3(-260 + k * 13, Math.max(-160, y - k * 5), -620));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0);
    const chart = new THREE.Mesh(new THREE.TubeGeometry(curve, 300, 2.4, 6, false), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff2a4d).multiplyScalar(2.6), toneMapped: false, fog: false }));
    this.group.add(chart);
  }
}
