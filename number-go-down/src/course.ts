import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RAPIER, GROUP, groups, type World, type RigidBody, type Collider } from './physics';
import { toon, neon, toonRamp } from './materials';
import { signTexture, checkerTexture, rockTexture } from './textures';
import { lavaChannelMaterial, Scenery, tickLava } from './hell';
import { Track, type Section, type SectionInfo, type SectionKind, type ZoneId, type Sample } from './track';
import { trackMaterial, roadProfile, sweep, tickSurfaces, type SurfaceStyle } from './surfaces';

export type { ZoneId, SectionKind };

// The descent into hell: the ATH summit, the candle staircase through the
// Gates of Hell, a banked road winding down over the abyss, a drop into Whale
// Waters, the Liquidation Inferno, and The Fall down a shaft to Rock Bottom.

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
  r0: number;
  r1: number;
}

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
  top: { id: 'top', banner: 'ALL TIME HIGH', sub: 'ENJOY THE VIEW', skyTop: 0x2fd6a6, skyHorizon: 0xffc24a, fog: 0xff9a6a, fogDensity: 0.0045, hemiSky: 0xfff4e8, hemiGround: 0x6a3a40, glow: 0xff8a40 },
  dip: { id: 'dip', banner: 'THE DIP', sub: '1ST CIRCLE', skyTop: 0x1a0410, skyHorizon: 0xc0182e, fog: 0x5a0a1c, fogDensity: 0.0085, hemiSky: 0xffd6dc, hemiGround: 0x4a0a18, glow: 0xff3a2a },
  whale: { id: 'whale', banner: 'WHALE WATERS', sub: '2ND CIRCLE', skyTop: 0x080520, skyHorizon: 0x7a1a6a, fog: 0x2a0d3a, fogDensity: 0.009, hemiSky: 0xd8dcff, hemiGround: 0x1a0a40, glow: 0x7a3aff },
  inferno: { id: 'inferno', banner: 'LIQUIDATION INFERNO', sub: '3RD CIRCLE', skyTop: 0x1a0402, skyHorizon: 0xff5a10, fog: 0x6a1a06, fogDensity: 0.0095, hemiSky: 0xffe0c0, hemiGround: 0x5a1004, glow: 0xff6a10 },
  abyss: { id: 'abyss', banner: 'ROCK BOTTOM', sub: '9TH CIRCLE', skyTop: 0x05020a, skyHorizon: 0x3a0a4a, fog: 0x12041c, fogDensity: 0.012, hemiSky: 0xe0d0ff, hemiGround: 0x2a0418, glow: 0xff2a4d },
};

export const SECTIONS: Section[] = [
  { name: 'summit', kind: 'summit', len: 10, width: 10, zone: 'top' },
  { name: 'stairs', kind: 'stairs', len: 40, pitch: -38, width: 11, zone: 'dip' },
  { name: 'dip', kind: 'road', len: 54, pitch: -26, ease: 12, turn: 30, width: 11, bank: 1.8, zone: 'dip' },
  { name: 'lip1', kind: 'road', len: 12, pitch: -9, ease: 10, width: 11, bank: 1.8, zone: 'dip' },
  { name: 'chasm', kind: 'drop', len: 14, drop: 12, width: 12, zone: 'whale' },
  { name: 'whale', kind: 'road', len: 68, pitch: -28, ease: 14, turn: -40, width: 13, bank: 1.6, zone: 'whale' },
  { name: 'pool', kind: 'road', len: 16, pitch: -16, ease: 8, width: 13, bank: 1.6, zone: 'whale' },
  { name: 'inferno', kind: 'road', len: 62, pitch: -33, ease: 12, turn: 28, width: 10, bank: 2.0, zone: 'inferno' },
  { name: 'lip2', kind: 'road', len: 10, pitch: -12, ease: 8, width: 10, bank: 2.0, zone: 'inferno' },
  { name: 'brink', kind: 'drop', len: 8.5, drop: 3, width: 12, zone: 'abyss' },
  { name: 'fall', kind: 'fall', len: 76, width: 17, zone: 'abyss' },
];

const SHAFT_R = 8.5;

/** Rock Bottom is a bullseye: rings out from the middle of the shaft. */
export const WELLS: Well[] = [
  { label: 'REKT', mult: 5, r0: 0, r1: 1.9 },
  { label: '-99%', mult: 3, r0: 1.9, r1: 4.1 },
  { label: '-90%', mult: 2, r0: 4.1, r1: 6.3 },
  { label: '-50%', mult: 1.5, r0: 6.3, r1: 99 },
];

export interface Frame {
  s: number;
  progress: number;
  point: THREE.Vector3;
  tangent: THREE.Vector3;
  right: THREE.Vector3;
  zone: Zone;
  section: number;
  kind: SectionKind;
  name: string;
}

const STYLES: Partial<Record<ZoneId, SurfaceStyle>> = {
  dip: { base: 0x2c0812, bankA: 0x12060a, bankB: 0xa8102a, neon: 0xff2a4d, crack: 0, halfWidth: 5.5 },
  whale: { base: 0x0b1236, bankA: 0x080a22, bankB: 0x2a58d8, neon: 0x3ad8ff, crack: 0, halfWidth: 6.5 },
  inferno: { base: 0x1c0904, bankA: 0x140604, bankB: 0xd04a0c, neon: 0xff8a1a, crack: 0.7, halfWidth: 5 },
  abyss: { base: 0x14061e, bankA: 0x0c0412, bankB: 0x5a1a8a, neon: 0xa259ff, crack: 0, halfWidth: 6 },
};

const UP = new THREE.Vector3(0, 1, 0);
const ENV = groups(GROUP.ENV, GROUP.ALL_PARTS | GROUP.DEBRIS);
const SENSOR = groups(GROUP.SENSOR, GROUP.ALL_PARTS);
const BANK_ANGLE = THREE.MathUtils.degToRad(55);
const _m = new THREE.Matrix4();
const STAIR_TREAD = new THREE.Color(0x2a0812);
const STAIR_RISER = new THREE.Color(0xd0122c);

/** Rotation whose local x, y and -z are r, n and f. Needs r x n = -f (right-handed). */
function basis(r: THREE.Vector3, n: THREE.Vector3, f: THREE.Vector3): THREE.Quaternion {
  _m.makeBasis(r, n, f.clone().negate());
  return new THREE.Quaternion().setFromRotationMatrix(_m);
}

type Desc = ReturnType<typeof RAPIER.ColliderDesc.cuboid>;
type Opts = { damageScale?: number; kick?: number; restitution?: number; friction?: number };

export class Course {
  group = new THREE.Group();
  obstacles: Obstacle[] = [];
  sensors: Sensor[] = [];
  readonly track: Track;
  readonly length: number;
  readonly floorY: number;
  readonly craterCenter: THREE.Vector3;
  /** Across the crater (the wells run along it) and toward its back wall. */
  readonly craterRight: THREE.Vector3;
  readonly craterForward: THREE.Vector3;
  private byCollider = new Map<number, Obstacle>();
  private sensorByCollider = new Map<number, Sensor>();
  private moving: Obstacle[] = [];
  private scenery!: Scenery;
  private flames: { mesh: THREE.InstancedMesh; base: THREE.Matrix4[] } | null = null;
  private bullseye: THREE.MeshBasicMaterial | null = null;
  private mats = {
    red: toon(0xe8102e, { emissive: 0x4a0010, rim: 0xff9a8a, rimStrength: 0.45 }),
    redDark: toon(0x8a0c22),
    green: toon(0x16d98f, { emissive: 0x053a24 }),
    wick: toon(0x1a0a12),
    whale: toon(0x3d7bff, { emissive: 0x081a40, rim: 0x9fe8ff, rimStrength: 0.6 }),
    whaleBelly: toon(0xdfe8ff),
    ink: toon(0x0b0410),
    outline: toon(0x0b0410, { side: THREE.BackSide }),
    glass: toon(0x7fffd4, { transparent: true, opacity: 0.4, emissive: 0x0d4038 }),
    steel: toon(0x6a6680),
    crater: toon(0x1c0a26, { emissive: 0x220418 }),
    ledge: toon(0x4a0612, { emissive: 0x1a0004, rim: 0xff4a6a, rimStrength: 0.5 }),
    stone: toon(0x241420, { rim: 0xff2a4d, rimStrength: 0.35 }),
  };

  constructor(private world: World, scene: THREE.Scene) {
    this.track = new Track(SECTIONS, new THREE.Vector3(0, 0, 7));
    this.length = this.track.length;
    const last = this.track.samples[this.track.samples.length - 1];
    this.floorY = last.p.y;
    this.craterCenter = last.p.clone();
    this.craterRight = last.r.clone();
    this.craterForward = new THREE.Vector3().crossVectors(UP, last.r).normalize();
    scene.add(this.group);

    for (const sec of this.track.sections) {
      if (sec.kind === 'summit') this.buildSummit(sec);
      else if (sec.kind === 'stairs') this.buildStairs(sec);
      else if (sec.kind === 'road') this.buildRoad(sec, this.track.samples.slice(sec.i0, sec.i1 + 1));
      else if (sec.kind === 'drop') this.buildDrop(sec);
      else if (sec.kind === 'fall') this.buildFall(sec);
    }
    this.buildCrater();
    this.buildObstacles();
    this.scenery = new Scenery(scene, {
      pathPoints: this.track.samples.filter((_, i) => i % 4 === 0).map((x) => x.p),
      seaY: this.floorY + 22,
      hole: this.craterCenter,
      holeRadius: SHAFT_R + 1.5,
      fallStart: this.track.section('fall').s0 / this.length,
    });
    this.batchStatic();
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && (m.material as THREE.Material).type === 'MeshToonMaterial') m.receiveShadow = true;
    });
  }

  /**
   * Bake every static decor mesh into one mesh per material: hundreds of
   * candles, wicks, trims and signs become a few dozen draw calls.
   */
  private batchStatic(): void {
    const keep = new Set<THREE.Object3D>();
    for (const o of this.moving) if (o.mesh) keep.add(o.mesh);
    for (const o of this.obstacles) if (o.kind === 'glass' && o.mesh) keep.add(o.mesh);
    for (const sn of this.sensors) keep.add(sn.mesh);
    this.group.updateMatrixWorld(true);
    const buckets = new Map<THREE.Material, { mesh: THREE.Mesh; geo: THREE.BufferGeometry }[]>();
    const visit = (o: THREE.Object3D) => {
      if (keep.has(o)) return;
      const m = o as THREE.Mesh;
      if (m.isMesh && !(m as unknown as THREE.InstancedMesh).isInstancedMesh && !Array.isArray(m.material)) {
        const geo = m.geometry.clone().applyMatrix4(m.matrixWorld);
        const list = buckets.get(m.material) ?? [];
        list.push({ mesh: m, geo });
        buckets.set(m.material, list);
      }
      for (const c of [...o.children]) visit(c);
    };
    for (const c of [...this.group.children]) visit(c);
    for (const [mat, list] of buckets) {
      if (list.length < 2) { list[0].geo.dispose(); continue; }
      // Merge needs identical attribute sets and consistent indexing.
      const names = Object.keys(list[0].geo.attributes).filter((n) => list.every((x) => n in x.geo.attributes));
      const indexed = list.every((x) => x.geo.index);
      const geos = list.map((x) => {
        let g = indexed ? x.geo : x.geo.toNonIndexed();
        for (const n of Object.keys(g.attributes)) if (!names.includes(n)) g.deleteAttribute(n);
        g.morphAttributes = {};
        return g;
      });
      const merged = mergeGeometries(geos);
      if (!merged) continue;
      for (const x of list) x.mesh.removeFromParent();
      const batch = new THREE.Mesh(merged, mat);
      batch.matrixAutoUpdate = false;
      this.group.add(batch);
    }
  }

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
    const r = Math.hypot(pos.x - this.craterCenter.x, pos.z - this.craterCenter.z);
    return WELLS.find((w) => r >= w.r0 && r < w.r1) ?? WELLS[WELLS.length - 1];
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
    tickSurfaces(time);
    this.scenery.update(time, dt);
    if (this.bullseye) this.bullseye.color.setRGB(1, 0.81, 0.23).multiplyScalar(1.2 + 0.6 * Math.max(0, Math.sin(time * 5)));
    if (this.flames) {
      const m = new THREE.Matrix4();
      const s = new THREE.Matrix4();
      this.flames.base.forEach((b, k) => {
        const f = 1 + Math.sin(time * 9 + k * 1.7) * 0.14 + Math.sin(time * 23 + k * 0.7) * 0.06;
        s.makeScale(1 / Math.sqrt(f), f, 1 / Math.sqrt(f));
        m.copy(b).multiply(s);
        this.flames!.mesh.setMatrixAt(k, m);
      });
      this.flames.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  /** Nearest centreline point, with a smoothed direction for the camera and steering. */
  frameAt(pos: THREE.Vector3): Frame {
    const near = this.track.nearest(pos);
    const s = near.s;
    const sample = this.track.samples[near.i];
    const sec = this.track.sections[sample.section];
    const point = this.track.pointAt(s);
    const tangent = this.track.pointAt(s + 9).sub(this.track.pointAt(s - 3)).normalize();
    const right = new THREE.Vector3().crossVectors(tangent, UP);
    if (right.lengthSq() < 0.04) right.copy(sample.r); else right.normalize();
    return { s, progress: s / this.length, point, tangent, right, zone: ZONES[sec.zone], section: sec.index, kind: sec.kind, name: sec.name ?? '' };
  }

  pointAt(s: number): THREE.Vector3 {
    return this.track.pointAt(s);
  }

  // ------------------------------------------------------------------ building blocks

  private addStatic(kind: ObstacleKind, label: string, desc: Desc, pos: THREE.Vector3, rot: THREE.Quaternion, opts: Opts = {}, mesh?: THREE.Object3D): Obstacle {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z).setRotation({ x: rot.x, y: rot.y, z: rot.z, w: rot.w }),
    );
    const c = this.world.createCollider(this.envDesc(desc, opts), body);
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

  private envDesc(desc: Desc, opts: Opts): Desc {
    // Min friction: the surface decides how slick it is, not Emonad's hoodie.
    return desc.setCollisionGroups(ENV).setRestitution(opts.restitution ?? 0.12).setFriction(opts.friction ?? 0.5)
      .setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Max)
      .setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min);
  }

  /** One fixed body holding many colliders that all score as the same obstacle. */
  private compound(kind: ObstacleKind, label: string, opts: Opts): (d: Desc, p: THREE.Vector3, q: THREE.Quaternion) => void {
    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    const o: Obstacle = { kind, label, damageScale: opts.damageScale ?? 1, kick: opts.kick ?? 0, lastKick: -1, body };
    this.obstacles.push(o);
    return (d, p, q) => {
      const c = this.world.createCollider(this.envDesc(d, opts).setTranslation(p.x, p.y, p.z).setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }), body);
      this.byCollider.set(c.handle, o);
    };
  }

  private addKinematic(kind: ObstacleKind, label: string, descs: Desc[], mesh: THREE.Object3D,
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
    // Soft bevels catch the rim light, so candles read as solid objects rather than boxes.
    g.add(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.12), mat));
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
    g.add(new THREE.Mesh(new THREE.BoxGeometry(w * 1.05, h * 1.02, d * 1.05), this.mats.outline));
    return g;
  }

  private neonCache = new Map<string, THREE.MeshBasicMaterial>();

  /** Shared emissive materials, so the static batcher can merge everything with the same glow. */
  private neonMat(color: number, intensity = 2.2): THREE.MeshBasicMaterial {
    const key = `${color}:${intensity}`;
    let m = this.neonCache.get(key);
    if (!m) {
      m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: false });
      this.neonCache.set(key, m);
    }
    return m;
  }

  // ------------------------------------------------------------------ the summit

  private buildSummit(sec: SectionInfo): void {
    const a = this.track.samples[sec.i0].p;
    const b = this.track.samples[sec.i1].p;
    const len = a.distanceTo(b);
    const width = sec.width;
    const T = 2;
    const center = a.clone().add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, -T / 2, 0));
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(width, T, len + 0.2), this.mats.ink));
    // The emo checkerboard (the Vans pattern) with hot-pink neon edges.
    const checker = new THREE.Mesh(new THREE.PlaneGeometry(width, len), new THREE.MeshToonMaterial({ map: checkerTexture(width / 1.25, len / 1.25), gradientMap: toonRamp() }));
    checker.rotation.x = -Math.PI / 2;
    checker.position.y = T / 2 + 0.01;
    g.add(checker);
    for (const side of [-1, 1]) {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, len), this.neonMat(0xff4fd8));
      trim.position.set(side * (width / 2 - 0.08), T / 2 + 0.08, 0);
      g.add(trim);
    }
    const front = new THREE.Mesh(new THREE.BoxGeometry(width, 0.16, 0.16), this.neonMat(0xff4fd8));
    front.position.set(0, T / 2 + 0.08, -len / 2);
    g.add(front);
    this.addStatic('summit', 'THE TOP', RAPIER.ColliderDesc.cuboid(width / 2, T / 2, len / 2 + 0.1), center, new THREE.Quaternion(),
      { damageScale: 0.85, friction: 0.5, restitution: 0.08 }, g);
    // Invisible rails so a sideways fling still goes over the edge, not off the side.
    for (const side of [-1, 1]) {
      this.addStatic('soft', '', RAPIER.ColliderDesc.cuboid(0.5, 2, len / 2), center.clone().add(new THREE.Vector3(side * (width / 2 + 0.5), 2.5, 0)), new THREE.Quaternion());
    }
    // The summit is the top of a colossal green ATH candle.
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(width - 0.6, 260, len - 0.6), toon(0x16d98f, { emissive: 0x06402a, rim: 0xc6ffe8, rimStrength: 0.5 }));
    pillar.position.copy(center).add(new THREE.Vector3(0, -T / 2 - 130, 0));
    this.group.add(pillar);
    // ATH candles flanking the slingshot.
    for (const side of [-1, 1]) {
      const m = this.candleMesh(1.4, 5, 1.4, this.mats.green, 1.4, 0);
      this.addStatic('summit', 'GREEN CANDLE', RAPIER.ColliderDesc.cuboid(0.7, 2.5, 0.7), new THREE.Vector3(side * 4.2, 2.5, 3), new THREE.Quaternion(), { damageScale: 0.7 }, m);
    }
  }

  // ------------------------------------------------------------------ the candle staircase

  private stairGeometry(sec: SectionInfo): { a: THREE.Vector3; f: THREE.Vector3; r: THREE.Vector3; steps: number; rise: number; run: number; horiz: number } {
    const a = this.track.samples[sec.i0].p;
    const b = this.track.samples[sec.i1].p;
    const flat = new THREE.Vector3(b.x - a.x, 0, b.z - a.z);
    const horiz = flat.length();
    const f = flat.normalize();
    const r = new THREE.Vector3().crossVectors(f, UP).normalize();
    const drop = a.y - b.y;
    const steps = Math.max(2, Math.round(drop / 1.0));
    return { a, f, r, steps, rise: drop / steps, run: horiz / steps, horiz };
  }

  private buildStairs(sec: SectionInfo): void {
    const { a, f, r, steps, rise, run, horiz } = this.stairGeometry(sec);
    const b = this.track.samples[sec.i1].p;
    const width = sec.width;
    const q = basis(r, UP, f);
    const depth = rise + 2.2;
    const stepGeos: THREE.BufferGeometry[] = [];
    const noseGeos: THREE.BufferGeometry[] = [];
    const addStep = this.compound('stairs', 'RED CANDLE', { damageScale: 1.05, friction: 0.14, restitution: 0.16 });
    for (let k = 0; k < steps; k++) {
      const top = a.y - (k + 1) * rise;
      const center = new THREE.Vector3(a.x, top - depth / 2, a.z).addScaledVector(f, (k + 0.5) * run);
      addStep(RAPIER.ColliderDesc.cuboid(width / 2, depth / 2, run / 2 + 0.02), center, q);
      const box = new THREE.BoxGeometry(width, depth, run);
      // Dark obsidian treads, red candle risers.
      const nrm = box.attributes.normal;
      const cols = new Float32Array(nrm.count * 3);
      for (let v = 0; v < nrm.count; v++) {
        const tread = nrm.getY(v) > 0.5;
        const c = tread ? STAIR_TREAD : STAIR_RISER;
        cols.set([c.r, c.g, c.b], v * 3);
      }
      box.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      box.applyQuaternion(q);
      box.translate(center.x, center.y, center.z);
      stepGeos.push(box);
      // A glowing nose on every step: lines racing past the camera read as speed.
      const nose = new THREE.BoxGeometry(width, 0.09, 0.09);
      nose.applyQuaternion(q);
      const np = new THREE.Vector3(a.x, top + 0.02, a.z).addScaledVector(f, (k + 1) * run - 0.04);
      nose.translate(np.x, np.y, np.z);
      noseGeos.push(nose);
    }
    const stepMat = toon(0xffffff, { emissive: 0x1a0006, rim: 0xff6a7a, rimStrength: 0.3 });
    stepMat.vertexColors = true;
    this.group.add(new THREE.Mesh(mergeGeometries(stepGeos), stepMat));
    this.group.add(new THREE.Mesh(mergeGeometries(noseGeos), this.neonMat(0xff3a5a, 2.4)));

    // Balustrades: rows of burning candles down both sides, and walls to keep him on.
    const slope = b.clone().sub(a);
    const slopeLen = slope.length();
    const sf = slope.normalize();
    const sn = new THREE.Vector3().crossVectors(r, sf).normalize();
    const addWall = this.compound('wall', 'CANDLE WALL', { damageScale: 0.8, friction: 0.2, restitution: 0.2 });
    for (const side of [-1, 1]) {
      const c = a.clone().add(b).multiplyScalar(0.5).addScaledVector(r, side * (width / 2 + 0.6)).addScaledVector(sn, 2);
      addWall(RAPIER.ColliderDesc.cuboid(0.6, 4.5, slopeLen / 2 + 1), c, basis(r, sn, sf));
    }
    const count = Math.floor(horiz / 2.6);
    const bodyGeo = new THREE.BoxGeometry(1, 1, 1);
    bodyGeo.translate(0, 0.5, 0);
    const bodies = new THREE.InstancedMesh(bodyGeo, toon(0xb00c26, { emissive: 0x30000a, rim: 0xff8a6a, rimStrength: 0.35 }), count * 2);
    const flameGeo = new THREE.ConeGeometry(0.32, 1.1, 8);
    flameGeo.translate(0, 0.55, 0);
    const flames = new THREE.InstancedMesh(flameGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff8a2a).multiplyScalar(2.6), toneMapped: false }), count * 2);
    const base: THREE.Matrix4[] = [];
    let k = 0;
    for (let i = 0; i < count; i++) {
      for (const side of [-1, 1]) {
        const along = (i + 0.5) * (horiz / count);
        const stepIdx = Math.min(steps - 1, Math.floor(along / run));
        const groundY = a.y - (stepIdx + 1) * rise;
        const h = 2.2 + ((i * 7 + (side > 0 ? 3 : 0)) % 5) * 0.55;
        const p = new THREE.Vector3(a.x, groundY - 1, a.z).addScaledVector(f, along).addScaledVector(r, side * (width / 2 + 0.75));
        _m.compose(p, new THREE.Quaternion(), new THREE.Vector3(1, h + 1, 1));
        bodies.setMatrixAt(k, _m);
        const fm = new THREE.Matrix4().compose(p.clone().add(new THREE.Vector3(0, h + 1.15, 0)), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
        flames.setMatrixAt(k, fm);
        base.push(fm);
        k++;
      }
    }
    this.group.add(bodies, flames);
    this.flames = { mesh: flames, base };
  }

  // ------------------------------------------------------------------ banked road

  private buildRoad(sec: SectionInfo, samples: Sample[]): void {
    const width = sec.width;
    const bank = sec.bank ?? 1.6;
    const style = STYLES[sec.zone] ?? STYLES.dip!;
    const mat = trackMaterial({ ...style, halfWidth: width / 2 });
    this.group.add(new THREE.Mesh(sweep(samples, roadProfile(width, bank)), mat));

    const T = 2;
    const run = bank / Math.tan(BANK_ANGLE);
    const slant = bank / Math.sin(BANK_ANGLE);
    const addRoad = this.compound('track', 'THE GROUND', { damageScale: 0.85, friction: 0.1, restitution: 0.1 });
    const addBank = this.compound('wall', 'THE BANK', { damageScale: 0.7, friction: 0.12, restitution: 0.1 });
    const addCatch = this.compound('soft', '', { friction: 0.1 });
    const STEP = 2;
    for (let i = 0; i < samples.length - 1; i += STEP) {
      const sa = samples[i];
      const sb = samples[Math.min(i + STEP, samples.length - 1)];
      const d = sb.p.clone().sub(sa.p);
      const len = d.length();
      if (len < 0.05) continue;
      const f = d.normalize();
      const r = sa.r.clone().add(sb.r).projectOnPlane(f).normalize();
      const n = new THREE.Vector3().crossVectors(r, f).normalize();
      const mid = sa.p.clone().add(sb.p).multiplyScalar(0.5);
      const q = basis(r, n, f);
      addRoad(RAPIER.ColliderDesc.cuboid(width / 2 + 0.3, T / 2, len / 2 + 0.25), mid.clone().addScaledVector(n, -T / 2), q);
      for (const side of [-1, 1]) {
        const u = r.clone().multiplyScalar(side * Math.cos(BANK_ANGLE)).addScaledVector(n, Math.sin(BANK_ANGLE));
        const x = side > 0 ? u.clone() : u.clone().negate();
        const y = r.clone().multiplyScalar(-side * Math.sin(BANK_ANGLE)).addScaledVector(n, Math.cos(BANK_ANGLE));
        const edge = mid.clone().addScaledVector(r, side * width / 2);
        const c = edge.clone().addScaledVector(u, slant / 2).addScaledVector(y, -0.3);
        addBank(RAPIER.ColliderDesc.cuboid(slant / 2 + 0.3, 0.3, len / 2 + 0.25), c, basis(x, y, f));
        const top = mid.clone().addScaledVector(r, side * (width / 2 + run + 0.4)).addScaledVector(n, bank + 3);
        addCatch(RAPIER.ColliderDesc.cuboid(0.4, 3.5, len / 2 + 0.25), top, q);
      }
    }
  }

  // ------------------------------------------------------------------ drops

  private buildDrop(sec: SectionInfo): void {
    if (sec.name !== 'chasm') return;
    const lip = this.track.samples[sec.i0];
    const land = this.track.samples[sec.i1];
    // An apron: the next road starts back under the lip, so even a dribble lands on it.
    const next = this.track.sections[sec.index + 1];
    const first = this.track.samples[next.i0];
    const back = Math.ceil(sec.len + 3);
    const apron: Sample[] = [];
    for (let k = back; k >= 0; k--) apron.push({ ...first, p: first.p.clone().addScaledVector(first.f, -k), s: first.s - k });
    this.buildRoad(next, apron);
    // Invisible walls through the drop so steering cannot carry him past the apron.
    const addWall = this.compound('soft', '', {});
    const mid = lip.p.clone().add(land.p).multiplyScalar(0.5);
    const f = new THREE.Vector3(land.p.x - lip.p.x, 0, land.p.z - lip.p.z).normalize();
    const r = new THREE.Vector3().crossVectors(f, UP).normalize();
    for (const side of [-1, 1]) {
      addWall(RAPIER.ColliderDesc.cuboid(0.5, 14, back / 2 + 2), mid.clone().addScaledVector(r, side * (next.width / 2 + 2.2)), basis(r, UP, f));
    }
    // SUPPORT: a glass floor partway down that holds for about a third of a second.
    const g = new THREE.Group();
    const paneLen = sec.len * 0.75;
    g.add(new THREE.Mesh(new THREE.BoxGeometry(next.width + 2, 0.3, paneLen), this.mats.glass));
    const label = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.2), neon(signTexture('SUPPORT', { color: '#7fffd4', glow: '#39f0b0', stroke: '#002a1c' }), 1.6));
    label.rotation.x = -Math.PI / 2;
    label.position.y = 0.17;
    g.add(label);
    const edgeMat = this.neonMat(0x39f0b0, 1.6);
    for (const side of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, paneLen), edgeMat);
      e.position.set(side * (next.width / 2 + 1), 0.16, 0);
      g.add(e);
    }
    const p = lip.p.clone().addScaledVector(f, paneLen / 2 + 1).add(new THREE.Vector3(0, -4.2, 0));
    const o = this.addStatic('glass', 'SUPPORT', RAPIER.ColliderDesc.cuboid(next.width / 2 + 1, 0.15, paneLen / 2), p, basis(r, UP, f), { damageScale: 0.8, restitution: 0.1 }, g);
    o.broken = false;
    o.contactTime = 0;
  }

  // ------------------------------------------------------------------ The Fall

  private buildFall(sec: SectionInfo): void {
    const c = this.track.samples[sec.i0].p.clone();
    const bottomY = this.track.samples[sec.i1].p.y;
    const entry = this.track.sections[sec.index - 1];
    const lip = this.track.samples[entry.i0].p;
    const lipY = lip.y;
    const entryDir = new THREE.Vector3(lip.x - c.x, 0, lip.z - c.z).normalize();
    const entryAngle = Math.atan2(entryDir.z, entryDir.x);
    const N = 18;
    const addWall = this.compound('wall', 'SHAFT WALL', { damageScale: 0.85, friction: 0.25, restitution: 0.15 });
    const wallTop = lipY + 10;
    for (let k = 0; k < N; k++) {
      const ang = (k / N) * Math.PI * 2;
      const dir = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang));
      let diff = Math.abs(ang - entryAngle) % (Math.PI * 2);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      const yTop = diff < 0.6 ? lipY - 2.6 : wallTop;
      const h = yTop - (bottomY - 2);
      const center = c.clone().addScaledVector(dir, SHAFT_R + 0.6).setY(bottomY - 2 + h / 2);
      const r = new THREE.Vector3().crossVectors(UP, dir).normalize(); // dir x UP = -r keeps the basis right-handed
      const halfW = (SHAFT_R + 0.6) * Math.tan(Math.PI / N) + 0.2;
      addWall(RAPIER.ColliderDesc.cuboid(0.6, h / 2, halfW), center, basis(dir, UP, r));
    }
    // Rock walls, ringed with neon so the depth reads when you look straight down.
    const rock = rockTexture();
    rock.repeat.set(6, 10);
    const rockMat = new THREE.MeshToonMaterial({ map: rock, color: 0x6a4a66, emissive: 0x2a0418, emissiveMap: rock, gradientMap: toonRamp(), side: THREE.BackSide });
    const lowerH = lipY - 2.6 - (bottomY - 3);
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(SHAFT_R + 0.1, SHAFT_R + 0.1, lowerH, 36, 12, true), rockMat);
    lower.position.copy(c).setY(bottomY - 3 + lowerH / 2);
    this.group.add(lower);
    const upperH = wallTop - (lipY - 2.6);
    // three.js cylinders start at +z and sweep toward +x; leave a gap toward the entry.
    const gap = 1.2;
    const theta0 = Math.atan2(entryDir.x, entryDir.z) + gap / 2;
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(SHAFT_R + 0.1, SHAFT_R + 0.1, upperH, 36, 3, true, theta0, Math.PI * 2 - gap), rockMat);
    upper.position.copy(c).setY(lipY - 2.6 + upperH / 2);
    this.group.add(upper);
    const ringMat = this.neonMat(0xa259ff, 2);
    for (let y = lipY - 10; y > bottomY + 4; y -= 13) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(SHAFT_R - 0.05, 0.09, 6, 64), ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.copy(c).setY(y);
      this.group.add(ring);
    }
    // Candle ledges jutting from the wall: something to hit on the way down.
    // [depth below the lip, angle from the far wall, length]: he crosses the shaft and rides the far wall down.
    const ledges: [number, number, number][] = [[14, 0.05, 2.8], [26, 0.6, 3.0], [38, -0.5, 2.8], [50, 0.2, 2.6], [61, -0.25, 3.0]];
    for (const [depth, ang0, len] of ledges) {
      const ang = entryAngle + Math.PI + ang0;
      const dir = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang));
      const p = c.clone().addScaledVector(dir, SHAFT_R - len / 2 + 0.3).setY(lipY - depth);
      const r = new THREE.Vector3().crossVectors(UP, dir).normalize();
      // Tilted down toward the middle so nothing rests on it.
      const q = new THREE.Quaternion().setFromAxisAngle(r, -0.42).multiply(basis(dir, UP, r));
      const m = this.candleMesh(len, 0.9, 3.2, this.mats.ledge, 0, 0);
      const lip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 3.2), this.neonMat(0xff2a4d, 2.2));
      lip.position.set(-len / 2, 0.46, 0);
      m.add(lip);
      this.addStatic('ledge', 'RED CANDLE', RAPIER.ColliderDesc.cuboid(len / 2, 0.45, 1.6), p, q, { damageScale: 1.1, kick: 3, friction: 0.05, restitution: 0.3 }, m);
    }
  }

  // ------------------------------------------------------------------ Rock Bottom

  private buildCrater(): void {
    const c = this.craterCenter;
    const q = basis(this.craterRight, UP, this.craterForward);
    const floor = new THREE.Group();
    floor.add(new THREE.Mesh(new THREE.CylinderGeometry(SHAFT_R + 0.2, SHAFT_R + 0.2, 2, 48), this.mats.crater));
    this.addStatic('floor', 'ROCK BOTTOM', RAPIER.ColliderDesc.cuboid(SHAFT_R + 1, 1, SHAFT_R + 1), c.clone().add(new THREE.Vector3(0, -1, 0)), q,
      { damageScale: 1.5, restitution: 0.2, friction: 0.9 }, floor);
    const colors: Record<string, number> = { REKT: 0xffcf3a, '-99%': 0xff2a4d, '-90%': 0xff4fd8, '-50%': 0x7a3acc };
    for (const w of WELLS) {
      const hot = w.label === 'REKT';
      const r1 = Math.min(w.r1, SHAFT_R);
      const padMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(colors[w.label]).multiplyScalar(hot ? 1.4 : 0.6), toneMapped: false });
      const pad = new THREE.Mesh(
        w.r0 === 0 ? new THREE.CircleGeometry(r1 - 0.12, 40) : new THREE.RingGeometry(w.r0 + 0.12, r1 - 0.12, 64),
        padMat,
      );
      if (hot) this.bullseye = padMat;
      pad.rotation.x = -Math.PI / 2;
      pad.position.copy(c).add(new THREE.Vector3(0, 0.02, 0));
      this.group.add(pad);
      // Labels on the floor, readable from the camera hanging over the shaft.
      const tex = signTexture(`${w.label}\nx${w.mult}`, { color: hot ? '#2a1400' : '#ffffff', glow: hot ? undefined : '#0b0410', stroke: hot ? '#ffe9a0' : '#0b0410', width: 256, height: 256 });
      const size = hot ? 3.2 : 2.3;
      const places = hot ? [0] : [0, Math.PI];
      const labelMat = neon(tex, 1.3);
      for (const a of places) {
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(size, size), labelMat);
        sign.rotation.x = -Math.PI / 2;
        const holder = new THREE.Group();
        holder.add(sign);
        const mid = hot ? 0 : (w.r0 + r1) / 2;
        holder.position.copy(c).addScaledVector(this.craterRight, Math.cos(a) * mid).addScaledVector(this.craterForward, Math.sin(a) * mid).add(new THREE.Vector3(0, 0.05, 0));
        holder.quaternion.copy(q);
        this.group.add(holder);
      }
    }
    // Low ring walls between the wells: a bonk on the way in, and they keep him from rolling out.
    const ringMat = this.neonMat(0xff2a4d, 2);
    const addRing = this.compound('divider', 'DIVIDER', { damageScale: 1.1, friction: 0.6 });
    for (const w of WELLS.slice(1)) {
      const r = w.r0;
      const n = Math.max(10, Math.round(r * 5));
      const half = Math.PI * r / n + 0.05;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
        addRing(RAPIER.ColliderDesc.cuboid(0.12, 0.35, half), c.clone().addScaledVector(dir, r).add(new THREE.Vector3(0, 0.35, 0)), basis(dir, UP, new THREE.Vector3().crossVectors(UP, dir)));
      }
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.7, 64, 1, true), this.mats.ink);
      wall.position.copy(c).add(new THREE.Vector3(0, 0.35, 0));
      (wall.material as THREE.Material).side = THREE.DoubleSide;
      this.group.add(wall);
      const glow = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 6, 72), ringMat);
      glow.rotation.x = Math.PI / 2;
      glow.position.copy(c).add(new THREE.Vector3(0, 0.72, 0));
      this.group.add(glow);
    }
    // A ring of hellfire around the floor.
    const fire = new THREE.Mesh(new THREE.TorusGeometry(SHAFT_R - 0.3, 0.35, 8, 64), this.neonMat(0xff5a20, 2.4));
    fire.rotation.x = Math.PI / 2;
    fire.position.copy(c).add(new THREE.Vector3(0, 0.3, 0));
    this.group.add(fire);
  }

  // ------------------------------------------------------------------ obstacles

  /** Arc length at a fraction of a named section. */
  private s(name: string, t: number): number {
    const sec = this.track.section(name);
    return sec.s0 + (sec.s1 - sec.s0) * t;
  }

  private buildObstacles(): void {
    const stairs = this.track.section('stairs');
    const gateAt = this.ground(stairs.s0 + 9, 0, 0);
    this.gatesOfHell(gateAt.p, this.track.samples[stairs.i0].f);

    // 1st circle, The Dip: wicks and bumper candles on the staircase, then the road.
    for (const [t, x] of [[0.2, 1.6], [0.36, -2.4], [0.55, 0.6], [0.74, -1.2], [0.88, 2.6]] as const) this.wick(this.s('stairs', t), x);
    this.bumperCandle(this.s('stairs', 0.45), 3.4, 1.2, 3.2);
    this.bumperCandle(this.s('stairs', 0.66), -3.6, 1.2, 3.6);
    this.gate('leverage', 2, 'x2', this.s('stairs', 0.62), 1.8, 2.6, 1.1);
    this.bumperCandle(this.s('dip', 0.18), -2.6, 1.3, 3.4);
    this.bumperCandle(this.s('dip', 0.4), 2.4, 1.2, 4.0);
    this.bumperCandle(this.s('dip', 0.62), -3.0, 1.4, 3.0);
    this.bumperCandle(this.s('dip', 0.84), 3.0, 1.1, 3.6);
    this.gate('leverage', 3, 'x3', this.s('dip', 0.52), -3.4, 1.6, 1.1);
    this.gate('boost', 10, 'DUMP\nIT', this.s('lip1', 0.35), 0, 1.4, 1.6);

    // Over the chasm: a big x5 ring for a clean, centred jump.
    const lip = this.track.samples[this.track.section('chasm').i0];
    const flatF = new THREE.Vector3(lip.f.x, 0, lip.f.z).normalize();
    this.gateAt('leverage', 5, 'x5', lip.p.clone().addScaledVector(flatF, 6).add(new THREE.Vector3(0, -2.2, 0)), flatF.clone().setY(-0.35).normalize(), 1.5);

    // 2nd circle, Whale Waters.
    this.whale(this.s('whale', 0.24), 1.1, 0.9);
    this.whale(this.s('whale', 0.5), -1.0, 1.2);
    this.whale(this.s('whale', 0.78), 0.7, 0.8);
    this.bumperCandle(this.s('whale', 0.36), 4.4, 1.2, 3.2);
    this.bumperCandle(this.s('whale', 0.64), -4.6, 1.2, 3.6);
    this.gate('leverage', 2, 'x2', this.s('whale', 0.9), 0, 1.6, 1.3);
    this.megaWhale(this.s('pool', 0.45));

    // 3rd circle, Liquidation Inferno.
    this.rotor(this.s('inferno', 0.2), 'flat');
    this.piston(this.s('inferno', 0.38), -1);
    this.piston(this.s('inferno', 0.46), 1);
    this.rotor(this.s('inferno', 0.64), 'wheel');
    this.bumperCandle(this.s('inferno', 0.8), 2.4, 1.1, 3.2);
    this.bumperCandle(this.s('inferno', 0.88), -2.2, 1.1, 3.0);
    this.gate('boost', 12, 'DUMP\nIT', this.s('inferno', 0.94), 0, 1.4, 1.5);
    this.gate('leverage', 2, 'x2', this.s('lip2', 0.6), 0, 1.6, 1.4);
    this.lavaChannels('inferno');
    this.lavaChannels('lip2');
  }

  private gatesOfHell(at: THREE.Vector3, dir: THREE.Vector3): void {
    const fwd = dir.clone().setY(0).normalize();
    const r = new THREE.Vector3().crossVectors(fwd, UP).normalize();
    const q = basis(r, UP, fwd);
    const g = new THREE.Group();
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 15, 1.5), this.mats.stone);
      pillar.position.set(side * 6.6, 1.5, 0);
      g.add(pillar);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2, 4), this.mats.ink);
      cap.position.set(side * 6.6, 10, 0);
      cap.rotation.y = Math.PI / 4;
      g.add(cap);
      // Horns: this is hell, after all.
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.6, 8), this.mats.redDark);
      horn.position.set(side * 7.5, 9.8, 0);
      horn.rotation.z = -side * 0.7;
      g.add(horn);
      const brazier = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.6, 8), this.neonMat(0xff7a20, 2.6));
      brazier.position.set(side * 6.6, 11.6, 0);
      g.add(brazier);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(14.6, 1.8, 1.2), this.mats.stone);
    lintel.position.set(0, 7.4, 0);
    g.add(lintel);
    const tex = signTexture('ABANDON ALL HOPE\nYE WHO BUY THE TOP', { color: '#ff2a4d', glow: '#ff2a4d', stroke: '#1a0006', width: 1024, height: 240 });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 2.25), neon(tex, 1.8));
    sign.position.set(0, 7.4, 0.65);
    g.add(sign);
    g.position.copy(at);
    g.quaternion.copy(q);
    this.group.add(g);
    for (const side of [-1, 1]) {
      this.addStatic('wall', 'GATES OF HELL', RAPIER.ColliderDesc.cuboid(0.75, 7.5, 0.75), at.clone().addScaledVector(r, side * 6.6).add(new THREE.Vector3(0, 1.5, 0)), q, { damageScale: 1 });
    }
    this.addStatic('wall', 'GATES OF HELL', RAPIER.ColliderDesc.cuboid(7.3, 0.9, 0.6), at.clone().add(new THREE.Vector3(0, 7.4, 0)), q, { damageScale: 1.1 });
  }

  /** Ground point at arc length s: on stairs, the step under the point rather than the diagonal. */
  private ground(s: number, x: number, h = 0): { p: THREE.Vector3; f: THREE.Vector3; r: THREE.Vector3; n: THREE.Vector3 } {
    const at = this.track.at(s, x, h);
    const sec = this.track.sections[at.sample.section];
    if (sec.kind === 'stairs') {
      const { a, f, steps, rise, run } = this.stairGeometry(sec);
      const along = new THREE.Vector3(at.p.x - a.x, 0, at.p.z - a.z).dot(f);
      const k = THREE.MathUtils.clamp(Math.floor(along / run), 0, steps - 1);
      at.p.y = a.y - (k + 1) * rise + h;
      return { p: at.p, f: at.f, r: at.r, n: UP.clone() };
    }
    return at;
  }

  private bumperCandle(s: number, x: number, w: number, h: number): void {
    const { p } = this.ground(s, x, 0);
    p.y += h / 2 - 0.3;
    const mesh = this.candleMesh(w, h, w, this.mats.red, h * 0.28, 0);
    const glow = new THREE.Mesh(new THREE.BoxGeometry(w * 1.02, 0.08, w * 1.02), this.neonMat(0xff4a6a, 1.8));
    glow.position.y = h / 2;
    mesh.add(glow);
    this.addStatic('bumper', 'RED CANDLE', RAPIER.ColliderDesc.cuboid(w / 2, h / 2, w / 2), p, new THREE.Quaternion(), { damageScale: 1.1, kick: 7.5, restitution: 0.55 }, mesh);
    const wickBody = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(p.x, p.y, p.z));
    const c = this.world.createCollider(RAPIER.ColliderDesc.capsule(h * 0.14, 0.08).setTranslation(0, h / 2 + h * 0.14, 0).setCollisionGroups(ENV), wickBody);
    this.byCollider.set(c.handle, { kind: 'peg', label: 'WICK', damageScale: 1.3, kick: 0, lastKick: -1, body: wickBody });
  }

  /** A bare candle wick sticking out of a step: thin, snaggy, funny. */
  private wick(s: number, x: number): void {
    const { p } = this.ground(s, x, 0);
    const h = 1.4;
    p.y += h / 2;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, h, 8), this.mats.wick);
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), this.neonMat(0xff7a20, 2.6));
    ember.position.y = h / 2;
    m.add(ember);
    this.addStatic('peg', 'WICK', RAPIER.ColliderDesc.capsule(h / 2, 0.09), p, new THREE.Quaternion(), { damageScale: 1.3, restitution: 0.3 }, m);
  }

  private gate(kind: SensorKind, value: number, label: string, s: number, x: number, h: number, radius: number): void {
    const { p, f } = this.ground(s, x, h);
    this.gateAt(kind, value, label, p, f, radius);
  }

  private gateAt(kind: SensorKind, value: number, label: string, p: THREE.Vector3, f: THREE.Vector3, radius: number): void {
    const g = new THREE.Group();
    const color = kind === 'boost' ? 0x39f0b0 : 0xffcf3a;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.13, 10, 40), this.neonMat(color, 1.8));
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

  /** A whale swimming across the road, breaching up off the surface and back down. */
  private whale(s: number, phase: number, speed: number): void {
    const base = this.track.at(s, 0, 0);
    const width = base.sample.width;
    const g = this.whaleMesh(1.15);
    const yaw = Math.atan2(-base.r.z, base.r.x);
    this.addKinematic('whale', 'WHALE', [
      RAPIER.ColliderDesc.capsule(1.25, 1.05).setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))),
    ], g, { damageScale: 1.2, kick: 9, restitution: 0.9 }, (time, b) => {
      const swim = Math.sin(time * speed + phase);
      const x = swim * (width / 2 - 2.4);
      // Never dips below the surface: a kinematic body would shove him through the road.
      const breach = 1.25 + Math.max(0, Math.sin(time * speed * 2 + phase * 3)) * 1.6;
      const p = base.p.clone().addScaledVector(base.r, x).addScaledVector(base.n, breach);
      b.setNextKinematicTranslation({ x: p.x, y: p.y, z: p.z });
      const dir = Math.cos(time * speed + phase) >= 0 ? 0 : Math.PI;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw + dir, Math.sin(time * speed * 2 + phase * 3) * 0.25));
      b.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    });
  }

  /** The mega whale wallows in the pool and blows you onward. */
  private megaWhale(s: number): void {
    const base = this.track.at(s, 0, 2.6);
    const g = this.whaleMesh(2.1);
    const yaw = Math.atan2(-base.r.z, base.r.x);
    this.addKinematic('whale', 'MEGA WHALE', [
      RAPIER.ColliderDesc.capsule(2.3, 1.9).setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))),
    ], g, { damageScale: 1.3, kick: 11, restitution: 0.95 }, (time, b) => {
      const p = base.p.clone().addScaledVector(base.n, Math.sin(time * 1.6) * 0.35);
      b.setNextKinematicTranslation({ x: p.x, y: p.y, z: p.z });
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw + Math.sin(time * 0.5) * 0.3, Math.sin(time * 1.6) * 0.06));
      b.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    });
  }

  /** SELL WALL: a red bar sweeping across the road ('flat') or wheeling over it ('wheel'). */
  private rotor(s: number, mode: 'flat' | 'wheel'): void {
    const base = this.track.at(s, 0, mode === 'flat' ? 0.85 : 3.4);
    const width = base.sample.width;
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
        const q = frameQ.clone().multiply(spin);
        b.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
      });
  }

  private piston(s: number, side: number): void {
    const base = this.track.at(s, 0, 0.75);
    const width = base.sample.width;
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

  /** Glowing lava gutters where the inferno's road meets its banks. */
  private lavaChannels(name: string): void {
    const sec = this.track.section(name);
    const samples = this.track.samples.slice(sec.i0, sec.i1 + 1);
    const mat = lavaChannelMaterial();
    for (const side of [-1, 1]) {
      const frames = samples.map((x) => ({ ...x, p: x.p.clone().addScaledVector(x.r, side * (sec.width / 2 - 0.45)).addScaledVector(x.n, 0.03) }));
      this.group.add(new THREE.Mesh(sweep(frames, { pts: [[-0.45, 0, 0], [0.45, 0, 0]] }, false), mat));
    }
  }
}
