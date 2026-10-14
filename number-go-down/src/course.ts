import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RAPIER, GROUP, groups, type World, type RigidBody, type Collider } from './physics';
import { neon } from './materials';
import { signTexture, checkerTexture, rockTexture } from './textures';
import { lavaChannelMaterial, Scenery, tickLava, liquidityMaterial, tickLiquidity } from './hell';
import { Track, type Section, type SectionInfo, type SectionKind, type ZoneId, type Sample } from './track';
import { trackMaterial, roadProfile, sweep, tickSurfaces, type SurfaceStyle } from './surfaces';
import { MATS, neonMat, surf } from './look';
import { Flames, candle, whale as whaleProp, piston as pistonProp, blade as bladeProp, bull as bullProp, gatesOfHell as gatesProp, skullMaw, torch, coinPile, propMats } from './props';

export type { ZoneId, SectionKind };

// The descent into hell as five beats: the Gates, The Dip (candle stairs, the
// Bull Trap), Whale Waters (a liquidity pool, the mega whale's spout), the
// Liquidation Engine (pistons, blades, geysers) and The Fall down the throat
// of a colossal skull onto the bullseye.

export type ObstacleKind =
  | 'wall' | 'soft' | 'bumper' | 'ledge' | 'glass' | 'peg' | 'whale' | 'rotor' | 'piston' | 'floor' | 'divider' | 'summit' | 'track' | 'stairs' | 'bull';

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
  /** Reactive props squash when hit (kept out of the static batch). */
  reactive?: boolean;
  hitAt?: number;
}

export type SensorKind = 'leverage' | 'boost' | 'geyser' | 'spout' | 'gate';

export interface Sensor {
  kind: SensorKind;
  value: number;
  label: string;
  collider: Collider;
  mesh: THREE.Object3D;
  used: boolean;
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  /** Repeatable sensors (geysers) re-arm after this many seconds. */
  rearm?: number;
  usedAt?: number;
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
  rimA: number;
  rimB: number;
  embers: [number, number, number];
}

export const ZONES: Record<ZoneId, Zone> = {
  top: { id: 'top', banner: 'ALL TIME HIGH', sub: 'ENJOY THE VIEW', skyTop: 0x2fd6a6, skyHorizon: 0xffc24a, fog: 0xff9a6a, fogDensity: 0.0045, hemiSky: 0xfff4e8, hemiGround: 0x6a3a40, glow: 0xff8a40, rimA: 0xff4fd8, rimB: 0xffcf3a, embers: [0xffcf3a, 0xfff2c0, 0.2] },
  dip: { id: 'dip', banner: 'THE DIP', sub: '1ST CIRCLE', skyTop: 0x1a0410, skyHorizon: 0xc0182e, fog: 0x4a0818, fogDensity: 0.008, hemiSky: 0xffd6dc, hemiGround: 0x4a0a18, glow: 0xff3a2a, rimA: 0xff4fd8, rimB: 0xff6a10, embers: [0xff3a2a, 0xff9a3a, 0.7] },
  whale: { id: 'whale', banner: 'WHALE WATERS', sub: '2ND CIRCLE', skyTop: 0x06061e, skyHorizon: 0x4a1a7a, fog: 0x10103a, fogDensity: 0.0085, hemiSky: 0xc8d8ff, hemiGround: 0x0a1040, glow: 0x3a5aff, rimA: 0x3ad8ff, rimB: 0x9a6aff, embers: [0x3ad8ff, 0xa259ff, 0.55] },
  inferno: { id: 'inferno', banner: 'LIQUIDATION ENGINE', sub: '3RD CIRCLE', skyTop: 0x1a0402, skyHorizon: 0xff5a10, fog: 0x5a1606, fogDensity: 0.009, hemiSky: 0xffe0c0, hemiGround: 0x5a1004, glow: 0xff6a10, rimA: 0xff4fd8, rimB: 0xffb020, embers: [0xff6a10, 0xffd23a, 1] },
  abyss: { id: 'abyss', banner: 'ROCK BOTTOM', sub: '9TH CIRCLE', skyTop: 0x05020a, skyHorizon: 0x3a0a4a, fog: 0x12041c, fogDensity: 0.012, hemiSky: 0xe0d0ff, hemiGround: 0x2a0418, glow: 0xff2a4d, rimA: 0xa259ff, rimB: 0xff2a4d, embers: [0xff2a4d, 0xa259ff, 0.6] },
};

export const SECTIONS: Section[] = [
  { name: 'summit', kind: 'summit', len: 10, width: 10, zone: 'top' },
  { name: 'stairs', kind: 'stairs', len: 26, pitch: -42, width: 11, zone: 'dip' },
  { name: 'dip', kind: 'road', len: 46, pitch: -34, ease: 10, turn: 28, width: 11, bank: 2.2, zone: 'dip' },
  { name: 'lip1', kind: 'road', len: 8, pitch: -10, ease: 7, width: 11, bank: 2.2, zone: 'dip' },
  { name: 'chasm', kind: 'drop', len: 14, drop: 12, width: 12, zone: 'whale' },
  { name: 'whale', kind: 'road', len: 46, pitch: -32, ease: 12, turn: -34, width: 13, bank: 1.8, zone: 'whale' },
  { name: 'pool', kind: 'road', len: 14, pitch: -24, ease: 8, width: 13, bank: 1.8, zone: 'whale' },
  { name: 'engine', kind: 'road', len: 46, pitch: -35, ease: 12, turn: 22, width: 10, bank: 2.4, zone: 'inferno' },
  { name: 'lip2', kind: 'road', len: 8, pitch: -12, ease: 7, width: 10, bank: 2.4, zone: 'inferno' },
  { name: 'brink', kind: 'drop', len: 8, drop: 3, width: 12, zone: 'abyss' },
  { name: 'fall', kind: 'fall', len: 70, width: 17, zone: 'abyss' },
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
  dip: { base: 0x1a0812, bankA: 0x2a0a14, bankB: 0x6a1020, neon: 0xff2a4d, crack: 0, halfWidth: 5.5 },
  whale: { base: 0x040820, bankA: 0x080c2e, bankB: 0x18307a, neon: 0x3ad8ff, crack: 0, halfWidth: 6.5 },
  inferno: { base: 0x140604, bankA: 0x1a0804, bankB: 0x5a1c08, neon: 0xff8a1a, crack: 0.8, halfWidth: 5 },
  abyss: { base: 0x0e0418, bankA: 0x0c0412, bankB: 0x3a1060, neon: 0xa259ff, crack: 0, halfWidth: 6 },
};

const UP = new THREE.Vector3(0, 1, 0);
const ENV = groups(GROUP.ENV, GROUP.ALL_PARTS | GROUP.DEBRIS);
const SENSOR = groups(GROUP.SENSOR, GROUP.ALL_PARTS);
const BANK_ANGLE = THREE.MathUtils.degToRad(55);
const _m = new THREE.Matrix4();

/** Rotation whose local x, y and -z are r, n and f. Needs r x n = -f (right-handed). */
function basis(r: THREE.Vector3, n: THREE.Vector3, f: THREE.Vector3): THREE.Quaternion {
  _m.makeBasis(r, n, f.clone().negate());
  return new THREE.Quaternion().setFromRotationMatrix(_m);
}

type Desc = ReturnType<typeof RAPIER.ColliderDesc.cuboid>;
type Opts = { damageScale?: number; kick?: number; restitution?: number; friction?: number; reactive?: boolean };

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
  readonly flames: Flames;
  /** Geyser columns, scaled by their eruption phase each frame. */
  private geysers: { mesh: THREE.Mesh; phase: number; sensor: Sensor }[] = [];
  private byCollider = new Map<number, Obstacle>();
  private sensorByCollider = new Map<number, Sensor>();
  private moving: Obstacle[] = [];
  private reactive: Obstacle[] = [];
  private scenery!: Scenery;
  private bullseye: THREE.MeshBasicMaterial | null = null;
  private splashes: THREE.Vector3[] = [];

  /** Positions where a whale broke the surface since the last frame. */
  takeSplashes(): THREE.Vector3[] {
    const out = this.splashes;
    this.splashes = [];
    return out;
  }
  private mats = {
    glass: surf({ color: 0x7fffd4, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.2, emissive: 0x0d4038, envMapIntensity: 2, rim: 1.2 }),
    crater: surf({ color: 0x1c0a26, emissive: 0x220418, roughness: 0.6 }),
  };

  constructor(private world: World, scene: THREE.Scene) {
    this.track = new Track(SECTIONS, new THREE.Vector3(0, 0, 7));
    this.length = this.track.length;
    const last = this.track.samples[this.track.samples.length - 1];
    this.floorY = last.p.y;
    this.craterCenter = last.p.clone();
    this.craterRight = last.r.clone();
    this.craterForward = new THREE.Vector3().crossVectors(UP, last.r).normalize();
    this.flames = new Flames(scene, 500);
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
      flames: this.flames,
    });
    this.batchStatic();
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && (m.material as THREE.Material).type === 'MeshStandardMaterial') m.receiveShadow = true;
    });
  }

  /**
   * Bake every static decor mesh into one mesh per material: hundreds of
   * candles, drips, trims and signs become a few dozen draw calls.
   */
  private batchStatic(): void {
    const keep = new Set<THREE.Object3D>();
    for (const o of this.moving) if (o.mesh) keep.add(o.mesh);
    for (const o of this.reactive) if (o.mesh) keep.add(o.mesh);
    for (const o of this.obstacles) if (o.kind === 'glass' && o.mesh) keep.add(o.mesh);
    for (const sn of this.sensors) keep.add(sn.mesh);
    for (const g of this.geysers) keep.add(g.mesh);
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
        const g = indexed ? x.geo : x.geo.toNonIndexed();
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
      o.hitAt = undefined;
      if (o.reactive && o.mesh) o.mesh.scale.setScalar(1);
    }
    for (const s of this.sensors) {
      s.used = false;
      s.mesh.visible = true;
    }
  }

  step(t: number): void {
    for (const o of this.moving) o.update!(t);
    for (const s of this.sensors) {
      if (s.used && s.rearm !== undefined && s.usedAt !== undefined && t - s.usedAt > s.rearm) {
        s.used = false;
        s.mesh.visible = true;
      }
    }
  }

  /** How hard a geyser is erupting right now (0..1). */
  geyserPower(sensor: Sensor, time: number): number {
    const g = this.geysers.find((x) => x.sensor === sensor);
    if (!g) return 1;
    return THREE.MathUtils.clamp((Math.sin(time * 1.4 + g.phase) - 0.1) / 0.9, 0.25, 1);
  }

  /** A prop was hit: squash it (presentation). */
  react(o: Obstacle, time: number): void {
    if (!o.reactive) return;
    o.hitAt = time;
  }

  syncMeshes(time: number, dt: number, camera: THREE.Camera, fog?: THREE.FogExp2): void {
    for (const o of this.moving) o.sync?.();
    tickLava(time, fog);
    tickLiquidity(time);
    tickSurfaces(time);
    this.flames.update(time, camera);
    this.scenery.update(time, dt);
    if (this.bullseye) this.bullseye.color.setRGB(1, 0.81, 0.23).multiplyScalar(1.2 + 0.6 * Math.max(0, Math.sin(time * 5)));
    for (const g of this.geysers) {
      const p = THREE.MathUtils.clamp((Math.sin(time * 1.4 + g.phase) - 0.1) / 0.9, 0, 1);
      g.mesh.scale.set(0.6 + p * 0.6, Math.max(0.02, p * p), 0.6 + p * 0.6);
      (g.mesh.material as THREE.ShaderMaterial).uniforms.uPower.value = p;
      (g.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
    }
    for (const o of this.reactive) {
      if (!o.mesh || o.hitAt === undefined) continue;
      const e = time - o.hitAt;
      if (e > 0.5) { o.mesh.scale.setScalar(1); o.hitAt = undefined; continue; }
      // A damped squash: flatten, bulge sideways, ring back.
      const k = Math.sin(e * 22) * Math.exp(-e * 7) * 0.22;
      o.mesh.scale.set(1 + k, 1 - k * 1.4, 1 + k);
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
    const o: Obstacle = { kind, label, damageScale: opts.damageScale ?? 1, kick: opts.kick ?? 0, lastKick: -1, body, collider: c, mesh, reactive: opts.reactive };
    this.byCollider.set(c.handle, o);
    this.obstacles.push(o);
    if (opts.reactive && mesh) this.reactive.push(o);
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

  private addSensor(kind: SensorKind, value: number, label: string, pos: THREE.Vector3, dir: THREE.Vector3, radius: number, mesh: THREE.Object3D, height = radius * 0.4, rearm?: number): Sensor {
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z).setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }));
    const c = this.world.createCollider(
      RAPIER.ColliderDesc.cylinder(height, radius).setSensor(true).setCollisionGroups(SENSOR).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
      body,
    );
    mesh.position.copy(pos);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().negate());
    this.group.add(mesh);
    const s: Sensor = { kind, value, label, collider: c, mesh, used: false, pos: pos.clone(), dir: dir.clone(), rearm };
    this.sensors.push(s);
    this.sensorByCollider.set(c.handle, s);
    return s;
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
    g.add(new THREE.Mesh(new THREE.BoxGeometry(width, T, len + 0.2), propMats().ink));
    // The emo checkerboard (the Vans pattern) with hot-pink neon edges.
    const checker = new THREE.Mesh(new THREE.PlaneGeometry(width, len), surf({ map: checkerTexture(width / 1.25, len / 1.25), roughness: 0.35, metalness: 0.05, envMapIntensity: 1.2, rim: 0.4 }));
    checker.rotation.x = -Math.PI / 2;
    checker.position.y = T / 2 + 0.01;
    g.add(checker);
    for (const side of [-1, 1]) {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, len), neonMat(0xff4fd8));
      trim.position.set(side * (width / 2 - 0.08), T / 2 + 0.08, 0);
      g.add(trim);
    }
    const front = new THREE.Mesh(new THREE.BoxGeometry(width, 0.16, 0.16), neonMat(0xff4fd8));
    front.position.set(0, T / 2 + 0.08, -len / 2);
    g.add(front);
    this.addStatic('summit', 'THE TOP', RAPIER.ColliderDesc.cuboid(width / 2, T / 2, len / 2 + 0.1), center, new THREE.Quaternion(),
      { damageScale: 0.85, friction: 0.5, restitution: 0.08 }, g);
    // Invisible rails so a sideways fling still goes over the edge, not off the side.
    for (const side of [-1, 1]) {
      this.addStatic('soft', '', RAPIER.ColliderDesc.cuboid(0.5, 2, len / 2), center.clone().add(new THREE.Vector3(side * (width / 2 + 0.5), 2.5, 0)), new THREE.Quaternion());
    }
    // The summit is the top of a colossal green ATH candle.
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(width - 0.6, 260, len - 0.6), MATS.waxGreen());
    pillar.position.copy(center).add(new THREE.Vector3(0, -T / 2 - 130, 0));
    this.group.add(pillar);
    // ATH candles flanking the slingshot, lit, with the gains piled at their feet.
    for (const side of [-1, 1]) {
      const m = candle({ w: 1.4, h: 5, d: 1.4, color: 'green', wick: 0.5, drips: 3, seed: side + 3, flame: this.flames });
      this.addStatic('summit', 'GREEN CANDLE', RAPIER.ColliderDesc.cuboid(0.7, 2.5, 0.7), new THREE.Vector3(side * 4.2, 2.5, 3), new THREE.Quaternion(), { damageScale: 0.7, reactive: true }, m);
      const pile = coinPile(side + 5);
      pile.position.set(side * 3.2, 0.02, -1.5);
      this.group.add(pile);
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
    const addStep = this.compound('stairs', 'RED CANDLE', { damageScale: 1.05, friction: 0.12, restitution: 0.18 });
    const m = propMats();
    const treadGeos: THREE.BufferGeometry[] = [];
    const riserGeos: THREE.BufferGeometry[] = [];
    const noseGeos: THREE.BufferGeometry[] = [];
    for (let k = 0; k < steps; k++) {
      const top = a.y - (k + 1) * rise;
      const center = new THREE.Vector3(a.x, top - depth / 2, a.z).addScaledVector(f, (k + 0.5) * run);
      addStep(RAPIER.ColliderDesc.cuboid(width / 2, depth / 2, run / 2 + 0.02), center, q);
      // Obsidian tread, red wax riser.
      const tread = new THREE.BoxGeometry(width, 0.3, run);
      tread.applyQuaternion(q);
      tread.translate(center.x, top - 0.15, center.z);
      treadGeos.push(tread);
      const riser = new THREE.BoxGeometry(width, depth - 0.3, run);
      riser.applyQuaternion(q);
      riser.translate(center.x, top - 0.3 - (depth - 0.3) / 2, center.z);
      riserGeos.push(riser);
      // A glowing nose on every step: lines racing past the camera read as speed.
      const nose = new THREE.BoxGeometry(width, 0.09, 0.09);
      nose.applyQuaternion(q);
      const np = new THREE.Vector3(a.x, top + 0.02, a.z).addScaledVector(f, (k + 1) * run - 0.04);
      nose.translate(np.x, np.y, np.z);
      noseGeos.push(nose);
    }
    this.group.add(new THREE.Mesh(mergeGeometries(treadGeos), MATS.obsidian()));
    this.group.add(new THREE.Mesh(mergeGeometries(riserGeos), m.wax));
    this.group.add(new THREE.Mesh(mergeGeometries(noseGeos), neonMat(0xff3a5a, 2.4)));

    // Walls to keep him on, and balustrades of burning candles down both sides.
    const slope = b.clone().sub(a);
    const slopeLen = slope.length();
    const sf = slope.normalize();
    const sn = new THREE.Vector3().crossVectors(r, sf).normalize();
    const addWall = this.compound('wall', 'CANDLE WALL', { damageScale: 0.8, friction: 0.2, restitution: 0.2 });
    for (const side of [-1, 1]) {
      const c = a.clone().add(b).multiplyScalar(0.5).addScaledVector(r, side * (width / 2 + 0.6)).addScaledVector(sn, 2);
      addWall(RAPIER.ColliderDesc.cuboid(0.6, 4.5, slopeLen / 2 + 1), c, basis(r, sn, sf));
    }
    const count = Math.floor(horiz / 2.4);
    for (let i = 0; i < count; i++) {
      for (const side of [-1, 1]) {
        const along = (i + 0.5) * (horiz / count);
        const stepIdx = Math.min(steps - 1, Math.floor(along / run));
        const groundY = a.y - (stepIdx + 1) * rise;
        const h = 2.0 + ((i * 7 + (side > 0 ? 3 : 0)) % 5) * 0.5;
        const p = new THREE.Vector3(a.x, groundY, a.z).addScaledVector(f, along).addScaledVector(r, side * (width / 2 + 0.85));
        const green = (i + (side > 0 ? 1 : 0)) % 5 === 2;
        const c = candle({ w: 1.0, h: h + 1, d: 1.0, color: green ? 'green' : 'red', wick: 0.4, drips: 2, seed: i * 3 + side, flame: null });
        c.position.copy(p).add(new THREE.Vector3(0, (h + 1) / 2 - 1, 0));
        this.group.add(c);
        this.flames.add(p.clone().add(new THREE.Vector3(0, h + 0.4, 0)), 1.0);
      }
    }
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
    const addRoad = this.compound('track', 'THE GROUND', { damageScale: 0.85, friction: 0.08, restitution: 0.1 });
    const addBank = this.compound('wall', 'THE BANK', { damageScale: 0.7, friction: 0.1, restitution: 0.12 });
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
    // Torches along the lips every so often.
    for (let i = 6; i < samples.length - 4; i += 12) {
      const s = samples[i];
      const side = (i / 12) % 2 ? 1 : -1;
      const p = s.p.clone().addScaledVector(s.r, side * (width / 2 + run + 0.5)).addScaledVector(s.n, bank + 0.1);
      this.group.add(torch(this.flames, p, 2.6));
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
    const edgeMat = neonMat(0x39f0b0, 1.6);
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
    // The throat: bone-coloured rock walls, ringed with neon so the depth reads when you look straight down.
    const rock = rockTexture();
    rock.repeat.set(6, 10);
    const rockMat = surf({ map: rock, color: 0x7a5a6a, emissive: 0x2a0418, emissiveMap: rock, roughness: 0.85, side: THREE.BackSide, rim: 0.4 });
    const lowerH = lipY - 2.6 - (bottomY - 3);
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(SHAFT_R + 0.1, SHAFT_R + 0.1, lowerH, 36, 12, true), rockMat);
    lower.position.copy(c).setY(bottomY - 3 + lowerH / 2);
    this.group.add(lower);
    const ringMat = neonMat(0xa259ff, 2);
    for (let y = lipY - 10; y > bottomY + 4; y -= 13) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(SHAFT_R - 0.05, 0.09, 6, 64), ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.copy(c).setY(y);
      this.group.add(ring);
    }
    // The skull whose mouth this is.
    const maw = skullMaw(SHAFT_R, entryDir);
    maw.position.copy(c).setY(lipY - 2.6);
    this.group.add(maw);
    // Candle ledges jutting from the wall: something to hit on the way down.
    // [depth below the lip, angle from the far wall, length]: he crosses the shaft and rides the far wall down.
    const ledges: [number, number, number][] = [[14, 0.05, 2.8], [26, 0.6, 3.0], [38, -0.5, 2.8], [50, 0.2, 2.6], [60, -0.25, 3.0]];
    for (const [depth, ang0, len] of ledges) {
      const ang = entryAngle + Math.PI + ang0;
      const dir = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang));
      const p = c.clone().addScaledVector(dir, SHAFT_R - len / 2 + 0.3).setY(lipY - depth);
      const r = new THREE.Vector3().crossVectors(UP, dir).normalize();
      // Tilted down toward the middle so nothing rests on it.
      const q = new THREE.Quaternion().setFromAxisAngle(r, -0.42).multiply(basis(dir, UP, r));
      const m = candle({ w: len, h: 0.9, d: 3.2, color: 'dark', drips: 4, seed: depth, topGlow: 0xff2a4d });
      this.addStatic('ledge', 'RED CANDLE', RAPIER.ColliderDesc.cuboid(len / 2, 0.45, 1.6), p, q, { damageScale: 1.1, kick: 3, friction: 0.05, restitution: 0.3, reactive: true }, m);
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
    const ringMat = neonMat(0xff2a4d, 2);
    const addRing = this.compound('divider', 'DIVIDER', { damageScale: 1.1, friction: 0.6 });
    const wallMat = surf({ color: 0x0b0410, roughness: 0.8, side: THREE.DoubleSide, rim: 0.5 });
    for (const w of WELLS.slice(1)) {
      const r = w.r0;
      const n = Math.max(10, Math.round(r * 5));
      const half = Math.PI * r / n + 0.05;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
        addRing(RAPIER.ColliderDesc.cuboid(0.12, 0.35, half), c.clone().addScaledVector(dir, r).add(new THREE.Vector3(0, 0.35, 0)), basis(dir, UP, new THREE.Vector3().crossVectors(UP, dir)));
      }
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.7, 64, 1, true), wallMat);
      wall.position.copy(c).add(new THREE.Vector3(0, 0.35, 0));
      this.group.add(wall);
      const glow = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 6, 72), ringMat);
      glow.rotation.x = Math.PI / 2;
      glow.position.copy(c).add(new THREE.Vector3(0, 0.72, 0));
      this.group.add(glow);
    }
    // A ring of hellfire around the floor.
    const fire = new THREE.Mesh(new THREE.TorusGeometry(SHAFT_R - 0.3, 0.35, 8, 64), neonMat(0xff5a20, 2.4));
    fire.rotation.x = Math.PI / 2;
    fire.position.copy(c).add(new THREE.Vector3(0, 0.3, 0));
    this.group.add(fire);
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      this.flames.add(c.clone().add(new THREE.Vector3(Math.cos(a) * (SHAFT_R - 0.3), 0.4, Math.sin(a) * (SHAFT_R - 0.3))), 1.6);
    }
  }

  // ------------------------------------------------------------------ obstacles

  /** Arc length at a fraction of a named section. */
  private s(name: string, t: number): number {
    const sec = this.track.section(name);
    return sec.s0 + (sec.s1 - sec.s0) * t;
  }

  private buildObstacles(): void {
    // BEAT 1: the Gates. The launch arc goes through the arch.
    const stairs = this.track.section('stairs');
    const gateAt = this.ground(stairs.s0 + 6, 0, 0);
    const gf = this.track.samples[stairs.i0].f.clone().setY(0).normalize();
    const gr = new THREE.Vector3().crossVectors(gf, UP).normalize();
    const gq = basis(gr, UP, gf);
    this.group.add(gatesProp(this.flames, gateAt.p.clone(), gq));
    for (const side of [-1, 1]) {
      this.addStatic('wall', 'GATES OF HELL', RAPIER.ColliderDesc.cuboid(0.95, 8, 0.95), gateAt.p.clone().addScaledVector(gr, side * 7.2).add(new THREE.Vector3(0, 8, 0)), gq, { damageScale: 1 });
    }
    this.addStatic('wall', 'GATES OF HELL', RAPIER.ColliderDesc.cuboid(8.2, 1, 0.8), gateAt.p.clone().add(new THREE.Vector3(0, 15, 0)), gq, { damageScale: 1.1 });
    // A gate sensor under the lintel: GATE CRASHER.
    this.addSensor('gate', 0, 'GATE CRASHER', gateAt.p.clone().add(new THREE.Vector3(0, 8, 0)), gf, 6.5, new THREE.Group(), 0.4);

    // BEAT 2: The Dip. Wicks and candles on the stairs, the Bull Trap and rings on the road.
    for (const [t, x] of [[0.25, 1.6], [0.45, -2.4], [0.65, 0.6], [0.85, -1.4]] as const) this.wick(this.s('stairs', t), x);
    this.bumperCandle(this.s('stairs', 0.55), 3.6, 1.2, 3.0, 'red');
    this.bumperCandle(this.s('stairs', 0.75), -3.8, 1.2, 3.4, 'green');
    this.gate('leverage', 2, 'x2', this.s('stairs', 0.68), 1.6, 2.6, 1.2);
    this.bumperCandle(this.s('dip', 0.12), -2.8, 1.3, 3.4, 'red');
    this.bumperCandle(this.s('dip', 0.3), 3.0, 1.2, 4.0, 'green');
    this.bull(this.s('dip', 0.5), 0.4);
    this.bumperCandle(this.s('dip', 0.68), -3.2, 1.4, 3.0, 'red');
    this.bumperCandle(this.s('dip', 0.86), 3.2, 1.1, 3.6, 'red');
    this.gate('leverage', 3, 'x3', this.s('dip', 0.4), -3.4, 1.6, 1.2);
    this.gate('boost', 12, 'DUMP\nIT', this.s('lip1', 0.4), 0, 1.5, 1.7);

    // Over the chasm: a big x5 ring for a clean, centred jump.
    const lip = this.track.samples[this.track.section('chasm').i0];
    const flatF = new THREE.Vector3(lip.f.x, 0, lip.f.z).normalize();
    this.gateAt('leverage', 5, 'x5', lip.p.clone().addScaledVector(flatF, 6).add(new THREE.Vector3(0, -2.2, 0)), flatF.clone().setY(-0.35).normalize(), 1.6);

    // BEAT 3: Whale Waters. A liquidity pool over the road, whales breaching across it, the mega whale's spout.
    this.liquidityPool('whale');
    this.liquidityPool('pool');
    this.whale(this.s('whale', 0.22), 1.1, 1.0);
    this.whale(this.s('whale', 0.48), -1.0, 1.25);
    this.whale(this.s('whale', 0.74), 0.7, 0.9);
    this.bumperCandle(this.s('whale', 0.36), 4.6, 1.2, 3.2, 'red');
    this.bumperCandle(this.s('whale', 0.62), -4.8, 1.2, 3.6, 'red');
    this.gate('leverage', 2, 'x2', this.s('whale', 0.9), 0, 1.6, 1.4);
    this.megaWhale(this.s('pool', 0.5));

    // BEAT 4: the Liquidation Engine.
    this.rotor(this.s('engine', 0.14), 'flat');
    this.geyser(this.s('engine', 0.26), -2.6, 0.4);
    this.piston(this.s('engine', 0.36), -1);
    this.piston(this.s('engine', 0.44), 1);
    this.geyser(this.s('engine', 0.54), 2.4, 2.4);
    this.rotor(this.s('engine', 0.64), 'wheel');
    this.bumperCandle(this.s('engine', 0.76), 2.6, 1.1, 3.2, 'red');
    this.bumperCandle(this.s('engine', 0.86), -2.4, 1.1, 3.0, 'red');
    this.gate('boost', 14, 'DUMP\nIT', this.s('engine', 0.94), 0, 1.5, 1.6);
    this.gate('leverage', 2, 'x2', this.s('lip2', 0.6), 0, 1.6, 1.5);
    this.lavaChannels('engine');
    this.lavaChannels('lip2');
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

  private bumperCandle(s: number, x: number, w: number, h: number, color: 'red' | 'green'): void {
    const { p } = this.ground(s, x, 0);
    p.y += h / 2 - 0.3;
    const mesh = candle({ w, h, d: w, color, wick: h * 0.22, drips: 3, seed: Math.round(s * 7 + x * 3), flame: null });
    this.flames.add(p.clone().add(new THREE.Vector3(0, h / 2 + h * 0.22, 0)), Math.max(0.8, w));
    this.addStatic('bumper', color === 'green' ? 'GREEN CANDLE' : 'RED CANDLE', RAPIER.ColliderDesc.cuboid(w / 2, h / 2, w / 2), p, new THREE.Quaternion(), { damageScale: 1.1, kick: 8.5, restitution: 0.55, reactive: true }, mesh);
    const wickBody = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(p.x, p.y, p.z));
    const c = this.world.createCollider(RAPIER.ColliderDesc.capsule(h * 0.11, 0.08).setTranslation(0, h / 2 + h * 0.11, 0).setCollisionGroups(ENV), wickBody);
    this.byCollider.set(c.handle, { kind: 'peg', label: 'WICK', damageScale: 1.3, kick: 0, lastKick: -1, body: wickBody });
  }

  /** A bare candle wick sticking out of a step: thin, snaggy, funny. */
  private wick(s: number, x: number): void {
    const { p } = this.ground(s, x, 0);
    const h = 1.4;
    p.y += h / 2;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, h, 8), propMats().wick);
    this.flames.add(p.clone().add(new THREE.Vector3(0, h / 2, 0)), 0.7);
    this.addStatic('peg', 'WICK', RAPIER.ColliderDesc.capsule(h / 2, 0.09), p, new THREE.Quaternion(), { damageScale: 1.3, restitution: 0.3 }, m);
  }

  /** The golden bull: a hard, bouncy statue in the middle of the road. */
  private bull(s: number, x: number): void {
    const { p, f, r } = this.ground(s, x, 0);
    const q = basis(r, UP, f);
    const mesh = bullProp();
    // The bull faces up the road, charging the player.
    mesh.rotation.y = Math.PI / 2;
    const holder = new THREE.Group();
    holder.add(mesh);
    // One tall box from the ground up: nothing to rest against, everything bounces.
    this.addStatic('bull', 'BULL TRAP', RAPIER.ColliderDesc.cuboid(1.2, 1.7, 1.9), p.clone().add(new THREE.Vector3(0, 1.7, 0)), q, { damageScale: 1.4, kick: 13, restitution: 0.7, reactive: true }, holder);
    for (const side of [-1, 1]) this.group.add(torch(this.flames, p.clone().addScaledVector(r, side * 2.6), 2.2));
  }

  private gate(kind: SensorKind, value: number, label: string, s: number, x: number, h: number, radius: number): void {
    const { p, f } = this.ground(s, x, h);
    this.gateAt(kind, value, label, p, f, radius);
  }

  private gateAt(kind: SensorKind, value: number, label: string, p: THREE.Vector3, f: THREE.Vector3, radius: number): void {
    const g = new THREE.Group();
    const color = kind === 'boost' ? 0x39f0b0 : 0xffcf3a;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.14, 10, 40), neonMat(color, 1.9));
    g.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.12, 0.05, 6, 40), neonMat(color, 1.2));
    g.add(ring2);
    const inner = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.92, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }));
    g.add(inner);
    const tex = signTexture(label, { color: '#fff7f2', stroke: '#0b0410', width: 256, height: 256 });
    const text = new THREE.Mesh(new THREE.PlaneGeometry(radius * 1.5, radius * 1.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    text.position.z = 0.05;
    g.add(text);
    g.userData.spin = ring;
    g.userData.spin2 = ring2;
    this.addSensor(kind, value, kind === 'boost' ? 'DUMP IT' : `x${value} LEVERAGE`, p, f, radius, g);
  }

  /** A whale swimming across the road, breaching up off the surface and back down. */
  private whale(s: number, phase: number, speed: number): void {
    const base = this.track.at(s, 0, 0);
    const width = base.sample.width;
    const g = whaleProp(1.25);
    const yaw = Math.atan2(-base.r.z, base.r.x);
    let wasUnder = true;
    this.addKinematic('whale', 'WHALE', [
      RAPIER.ColliderDesc.capsule(1.6, 1.25).setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))),
    ], g, { damageScale: 1.2, kick: 10, restitution: 0.9 }, (time, b) => {
      const swim = Math.sin(time * speed + phase);
      const x = swim * (width / 2 - 2.6);
      // Breaches up through the pool from under the road and sinks back out of sight.
      const breach = -1.7 + Math.max(0, Math.sin(time * speed * 2 + phase * 3)) * 5.2;
      const p = base.p.clone().addScaledVector(base.r, x).addScaledVector(base.n, breach);
      if (wasUnder && breach > 0.2) this.splashes.push(p.clone().addScaledVector(base.n, 0.6 - breach));
      wasUnder = breach <= 0.2;
      b.setNextKinematicTranslation({ x: p.x, y: p.y, z: p.z });
      const dir = Math.cos(time * speed + phase) >= 0 ? 0 : Math.PI;
      const pitch = Math.cos(time * speed * 2 + phase * 3) * 0.35;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw + dir, pitch * (dir === 0 ? 1 : -1)));
      b.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    });
  }

  /** The mega whale breaches up the pool: ride its back to the blowhole, and the spout throws you into the Engine. */
  private megaWhale(s: number): void {
    const base = this.track.at(s, 0, 0);
    const g = whaleProp(2.4);
    const pitch = 0.42; // nose up, tail down toward the player
    const yaw = Math.atan2(-base.f.z, base.f.x); // local +x (the nose) points down the road
    const centre = base.p.clone().addScaledVector(base.n, 2.4 + 2.2);
    // One capsule along the spine, pitched, so the back is a smooth ramp.
    this.addKinematic('whale', 'MEGA WHALE', [
      RAPIER.ColliderDesc.capsule(2.9, 2.4).setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))).setFriction(0.03),
    ], g, { damageScale: 1.3, kick: 0, restitution: 0.1 }, (time, b) => {
      const bob = Math.sin(time * 1.3) * 0.25;
      const p = centre.clone().addScaledVector(base.n, bob);
      b.setNextKinematicTranslation({ x: p.x, y: p.y, z: p.z });
      const q = basis(base.r, base.n, base.f)
        .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)))
        .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, pitch + Math.sin(time * 1.3) * 0.03)));
      b.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    });
    void yaw;
    // The SPOUT: a sensor over the blowhole at the top of the ramp.
    const blow = centre.clone().addScaledVector(base.f, 3.2 * Math.cos(pitch)).addScaledVector(base.n, 3.2 * Math.sin(pitch) + 2.4 + 1.2);
    const dir = base.f.clone().multiplyScalar(0.72).addScaledVector(base.n, 0.7).normalize();
    const spout = new THREE.Group();
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.1, 9, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }));
    column.position.y = 4.5;
    spout.add(column);
    this.addSensor('spout', 17, 'SPOUTED', blow, dir, 2.8, spout, 2.2, 1.5);
  }

  /** A glossy liquidity surface over a section's road: he skims through it, whales breach out of it. */
  private liquidityPool(name: string): void {
    const sec = this.track.section(name);
    const samples = this.track.samples.slice(sec.i0, sec.i1 + 1);
    const w = sec.width / 2 + 0.2;
    const frames = samples.map((x) => ({ ...x, p: x.p.clone().addScaledVector(x.n, 0.45) }));
    const geo = sweep(frames, { pts: [[-w, 0, 0], [-w * 0.5, 0, 0], [0, 0, 0], [w * 0.5, 0, 0], [w, 0, 0]] }, false);
    const mesh = new THREE.Mesh(geo, liquidityMaterial());
    mesh.renderOrder = 2;
    this.group.add(mesh);
  }

  /** SELL WALL: a red blade sweeping across the road ('flat') or wheeling over it ('wheel'). */
  private rotor(s: number, mode: 'flat' | 'wheel'): void {
    const base = this.track.at(s, 0, mode === 'flat' ? 0.9 : 3.6);
    const width = base.sample.width;
    const len = width * 0.86;
    const g = bladeProp(len);
    const frameQ = basis(base.r, base.n, base.f);
    this.addKinematic('rotor', 'SELL WALL', [RAPIER.ColliderDesc.cuboid(len / 2, 0.35, 0.45), RAPIER.ColliderDesc.ball(0.55)], g,
      { damageScale: 1.35, restitution: 0.35, kick: 5 }, (time, b) => {
        b.setNextKinematicTranslation({ x: base.p.x, y: base.p.y, z: base.p.z });
        const spin = new THREE.Quaternion().setFromEuler(mode === 'flat' ? new THREE.Euler(0, time * 2.1, 0) : new THREE.Euler(0, 0, -time * 2.3));
        const q = frameQ.clone().multiply(spin);
        b.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
      });
  }

  private piston(s: number, side: number): void {
    const base = this.track.at(s, 0, 0.8);
    const width = base.sample.width;
    const g = pistonProp(width * 0.5);
    const frameQ = basis(base.r, base.n, base.f);
    // The prop's ram faces +z and its rod runs along -x; turn it to push across the road.
    const faceQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0));
    const phase = side > 0 ? 0.5 : 0;
    this.addKinematic('piston', 'LIQUIDATION', [RAPIER.ColliderDesc.cuboid(1.2, 0.8, 1.4)], g, { damageScale: 1.25, kick: 9, restitution: 0.4 }, (time, b) => {
      // Fast strike, slow return.
      const ph = (time * 0.85 + phase) % 1;
      const out = ph < 0.18 ? ph / 0.18 : 1 - (ph - 0.18) / 0.82;
      const ease = out * out * (3 - 2 * out);
      const x = side * (width / 2 + 1.0 - ease * (width / 2 + 0.6));
      const p = base.p.clone().addScaledVector(base.r, x);
      b.setNextKinematicTranslation({ x: p.x, y: p.y, z: p.z });
      const q = frameQ.clone().multiply(faceQ);
      b.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    });
    // The housing in the bank it strikes from.
    const housing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.4, 3.2), propMats().iron);
    housing.position.copy(base.p).addScaledVector(base.r, side * (width / 2 + 1.6)).addScaledVector(base.n, 0.4);
    housing.quaternion.copy(frameQ);
    this.group.add(housing);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.5, 3.3), propMats().hazard);
    stripe.position.copy(housing.position).addScaledVector(base.n, 1.2);
    stripe.quaternion.copy(frameQ);
    this.group.add(stripe);
  }

  /** A lava geyser: a grate in the road that erupts on a timer and throws him up the track. */
  private geyser(s: number, x: number, phase: number): void {
    const base = this.track.at(s, x, 0.05);
    const grate = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.5, 24), propMats().hazard);
    grate.position.copy(base.p).addScaledVector(base.n, 0.03);
    grate.quaternion.copy(basis(base.r, base.n, base.f)).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)));
    this.group.add(grate);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPower: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uTime; uniform float uPower; varying vec2 vUv;
        float h(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
        float n(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1, 0)), u.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), u.x), u.y); }
        void main() {
          float t = uTime * 3.0;
          float k = n(vec2(vUv.x * 6.0, vUv.y * 5.0 - t)) * 0.6 + n(vec2(vUv.x * 13.0 + 2.0, vUv.y * 11.0 - t * 1.6)) * 0.4;
          float a = smoothstep(0.35, 0.7, k) * (1.0 - smoothstep(0.55, 1.0, vUv.y)) * uPower;
          vec3 c = mix(vec3(2.4, 0.5, 0.05), vec3(3.0, 1.9, 0.6), k * k);
          if (a < 0.02) discard;
          gl_FragColor = vec4(c, a * 0.9);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide,
    });
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.2, 10, 16, 1, true), mat);
    column.geometry.translate(0, 5, 0);
    column.position.copy(base.p);
    column.quaternion.copy(basis(base.r, base.n, base.f));
    this.group.add(column);
    const dir = base.f.clone().multiplyScalar(0.45).addScaledVector(base.n, 0.9).normalize();
    const sensor = this.addSensor('geyser', 17, 'GEYSER', base.p.clone().addScaledVector(base.n, 1.2), dir, 1.5, new THREE.Group(), 1.4, 1.2);
    this.geysers.push({ mesh: column, phase, sensor });
  }

  /** Glowing lava gutters where the engine's road meets its banks. */
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
