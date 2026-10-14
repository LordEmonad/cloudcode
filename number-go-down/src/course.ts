import * as THREE from 'three';
import { RAPIER, GROUP, groups, type World, type RigidBody, type Collider } from './physics';
import { toon, neon } from './materials';
import { chartGridTexture, wallPanelTexture, signTexture, guitarNeckTexture } from './textures';

export const SHAFT = {
  halfWidth: 4,
  slab: 1.6,
  summitY: 0,
  dipTop: -6,
  bottomTop: -148,
  floorY: -162,
};

export type ObstacleKind =
  | 'wall' | 'soft' | 'bumper' | 'ledge' | 'glass' | 'peg' | 'whale' | 'rotor' | 'piston' | 'floor' | 'divider' | 'summit';

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
}

export interface Well {
  label: string;
  mult: number;
  x0: number;
  x1: number;
}

export const WELLS: Well[] = [
  { label: '-50%', mult: 1.5, x0: -4, x1: -2.4 },
  { label: '-90%', mult: 2, x0: -2.4, x1: -0.8 },
  { label: 'REKT', mult: 5, x0: -0.8, x1: 0.8 },
  { label: '-99%', mult: 3, x0: 0.8, x1: 2.4 },
  { label: '-50%', mult: 1.5, x0: 2.4, x1: 4 },
];

const ENV = groups(GROUP.ENV, GROUP.ALL_PARTS | GROUP.DEBRIS);
const SENSOR = groups(GROUP.SENSOR, GROUP.ALL_PARTS);

export class Course {
  group = new THREE.Group();
  obstacles: Obstacle[] = [];
  sensors: Sensor[] = [];
  private byCollider = new Map<number, Obstacle>();
  private sensorByCollider = new Map<number, Sensor>();
  private moving: Obstacle[] = [];
  private mats = {
    red: toon(0xe8102e, { emissive: 0x4a0010 }),
    redDark: toon(0x9c1230),
    green: toon(0x16d98f, { emissive: 0x053a24 }),
    wick: toon(0x1a0a12),
    gold: toon(0xffcf3a, { emissive: 0x2a1a00 }),
    whale: toon(0x3d7bff, { emissive: 0x081a40 }),
    whaleBelly: toon(0xdfe8ff),
    ink: toon(0x0b0410),
    glass: toon(0x7fffd4, { transparent: true, opacity: 0.45, emissive: 0x0d4038 }),
    steel: toon(0x6a6680),
  };

  constructor(private world: World, scene: THREE.Scene) {
    scene.add(this.group);
    this.buildWalls();
    this.buildSummit();
    this.buildDip();
    this.buildRockBottom();
  }

  obstacleOf(handle: number): Obstacle | undefined {
    return this.byCollider.get(handle);
  }

  sensorOf(handle: number): Sensor | undefined {
    return this.sensorByCollider.get(handle);
  }

  wellAt(x: number): Well {
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

  /** Advance kinematic obstacles to simulation time t (called every fixed step). */
  step(t: number): void {
    for (const o of this.moving) o.update!(t);
  }

  /** Copy kinematic bodies to their meshes (called every rendered frame). */
  syncMeshes(): void {
    for (const o of this.moving) o.sync?.();
  }

  // ---------------------------------------------------------------- builders

  private addStatic(
    kind: ObstacleKind, label: string, desc: ReturnType<typeof RAPIER.ColliderDesc.cuboid>,
    pos: THREE.Vector3, rot: THREE.Quaternion, opts: Partial<Pick<Obstacle, 'damageScale' | 'kick'>> & { restitution?: number; friction?: number } = {},
    mesh?: THREE.Object3D,
  ): Obstacle {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z).setRotation({ x: rot.x, y: rot.y, z: rot.z, w: rot.w }),
    );
    const c = this.world.createCollider(
      desc.setCollisionGroups(ENV).setRestitution(opts.restitution ?? 0.15).setFriction(opts.friction ?? 0.6)
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
    // Teleport to the start pose so the first step does not sweep.
    const next = body.nextTranslation();
    const nextRot = body.nextRotation();
    body.setTranslation(next, true);
    body.setRotation(nextRot, true);
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

  private addSensor(kind: SensorKind, value: number, label: string, pos: THREE.Vector3, radius: number, mesh: THREE.Object3D): void {
    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z));
    const c = this.world.createCollider(
      RAPIER.ColliderDesc.cylinder(radius * 0.35, radius).setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)))
        .setSensor(true).setCollisionGroups(SENSOR).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS),
      body,
    );
    mesh.position.copy(pos);
    this.group.add(mesh);
    const s: Sensor = { kind, value, label, collider: c, mesh, used: false, pos: pos.clone() };
    this.sensors.push(s);
    this.sensorByCollider.set(c.handle, s);
  }

  // ---------------------------------------------------------------- walls

  private buildWalls(): void {
    const top = 14;
    const bottom = SHAFT.floorY - 4;
    const height = top - bottom;
    const midY = (top + bottom) / 2;
    const hw = SHAFT.halfWidth;

    // Physics: side walls, invisible front and back walls that keep him in the slab.
    for (const side of [-1, 1]) {
      this.addStatic('wall', 'WALL', RAPIER.ColliderDesc.cuboid(0.5, height / 2, 3), new THREE.Vector3(side * (hw + 0.5), midY, 0), new THREE.Quaternion(), { damageScale: 0.75 });
    }
    for (const z of [-1, 1]) {
      this.addStatic('soft', '', RAPIER.ColliderDesc.cuboid(hw + 1, height / 2, 0.25), new THREE.Vector3(0, midY, z * (SHAFT.slab + 0.25)), new THREE.Quaternion(), { damageScale: 0.15, friction: 0.05 });
    }

    // Visuals: back wall chart grid and side wall panels, coloured by depth.
    const segs = 120;
    const backGeo = new THREE.PlaneGeometry(hw * 2, height, 1, segs);
    const sideGeo = new THREE.PlaneGeometry(4, height, 1, segs);
    for (const geo of [backGeo, sideGeo]) {
      const pos = geo.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const col = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        zoneColor(pos.getY(i) + midY, col, geo === backGeo ? 'back' : 'side');
        colors.set([col.r, col.g, col.b], i * 3);
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
    const grid = chartGridTexture();
    grid.repeat.set(2, height / 8);
    const back = new THREE.Mesh(backGeo, new THREE.MeshToonMaterial({ map: grid, vertexColors: true, gradientMap: this.mats.red.gradientMap }));
    back.position.set(0, midY, -SHAFT.slab - 0.5);
    this.group.add(back);

    const panels = wallPanelTexture();
    panels.repeat.set(1, height / 4);
    const sideMat = new THREE.MeshToonMaterial({ map: panels, vertexColors: true, gradientMap: this.mats.red.gradientMap });
    for (const side of [-1, 1]) {
      const wall = new THREE.Mesh(sideGeo, sideMat);
      wall.position.set(side * hw, midY, 0);
      wall.rotation.y = -side * Math.PI / 2;
      this.group.add(wall);
    }
  }

  // ---------------------------------------------------------------- summit

  private buildSummit(): void {
    // Two green "ATH" candles form the ledges the slingshot posts stand on.
    for (const side of [-1, 1]) {
      const w = 1.5;
      const h = 9;
      const x = side * 2.5;
      const candle = this.candleMesh(w, h, 2.4, this.mats.green, 1.2, 0);
      this.addStatic('summit', 'THE TOP', RAPIER.ColliderDesc.cuboid(w / 2, h / 2, 1.2), new THREE.Vector3(x, -h / 2, 0), new THREE.Quaternion(), { damageScale: 0.6 }, candle);
    }
    const ath = signTexture('ALL TIME HIGH', { color: '#ffcf3a', glow: '#ffcf3a', stroke: '#2a1600', width: 1024, height: 160 });
    const athSign = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 0.97), neon(ath, 1.4));
    athSign.position.set(0, 6.1, -SHAFT.slab - 0.3);
    this.group.add(athSign);
    const ngd = signTexture('NUMBER GO DOWN', { color: '#ff2a4d', glow: '#ff2a4d', stroke: '#1a0006', width: 1024, height: 160 });
    const ngdSign = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 0.97), neon(ngd, 1.6));
    ngdSign.position.set(0, -4.6, -SHAFT.slab - 0.3);
    this.group.add(ngdSign);
  }

  /** Guitar-neck slingshot posts, returned so the slingshot can attach its band. */
  buildPosts(): { left: THREE.Vector3; right: THREE.Vector3 } {
    const neckTex = guitarNeckTexture();
    const neckMat = toon(0xffffff, { map: neckTex });
    const headMat = toon(0x16101c, { rim: 0xa259ff, rimStrength: 0.8 });
    const pegMat = toon(0xd9d9e2);
    const tips = { left: new THREE.Vector3(), right: new THREE.Vector3() };
    for (const side of [-1, 1]) {
      const g = new THREE.Group();
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.36, 3.6, 0.18), neckMat);
      neck.position.y = 1.8;
      g.add(neck);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.15, 0.2), headMat);
      head.position.y = 4.15;
      head.rotation.z = side * 0.12;
      g.add(head);
      for (let i = 0; i < 6; i++) {
        const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 8), pegMat);
        peg.rotation.z = Math.PI / 2;
        peg.position.set((i < 3 ? -1 : 1) * 0.36, 3.75 + (i % 3) * 0.32, 0);
        g.add(peg);
      }
      const x = side * 2.3;
      g.position.set(x, 0, 0);
      g.rotation.z = side * 0.1;
      this.group.add(g);
      const tip = new THREE.Vector3(0, 3.55, 0.12).applyEuler(g.rotation).add(g.position);
      if (side < 0) tips.left.copy(tip); else tips.right.copy(tip);
      // Thin collider so a backward fling bonks the post.
      this.addStatic('wall', 'GUITAR', RAPIER.ColliderDesc.cuboid(0.2, 2.1, 0.12), new THREE.Vector3(x, 2.1, 0), g.quaternion.clone(), { damageScale: 0.9 });
    }
    return tips;
  }

  // ---------------------------------------------------------------- The Dip

  private buildDip(): void {
    // A: red candle pop bumpers.
    this.bumperCandle(-1.6, -14, 1.1, 3.2);
    this.bumperCandle(2.0, -20, 1.1, 3.6);
    this.bumperCandle(-0.3, -27, 1.2, 3.0);
    this.gate('leverage', 2, 'x2\nLEVERAGE', new THREE.Vector3(2.5, -34, 0), 0.95);

    // B: slanted candles jutting out of the walls.
    this.ledge(-1, -41, 3.5, -0.5);
    this.ledge(1, -47, 3.7, 0.48);
    this.ledge(-1, -53, 3.3, -0.45);

    // C: the SUPPORT floor, smashed on impact.
    this.glassFloor(-61);

    // D: candle pachinko.
    let row = 0;
    for (let y = -68; y >= -83; y -= 3.6, row++) {
      const offset = row % 2 === 0 ? 0 : 1;
      for (let x = -3 + offset; x <= 3; x += 2) this.peg(x + (row % 2 ? 0 : 0), y);
    }
    this.gate('boost', 12, 'DUMP\nIT', new THREE.Vector3(0, -92, 0), 1.1);

    // E: whale.
    this.whale(-102);

    // F: sell wall rotor, liquidation pistons, a risky x5 gate.
    this.rotor(-115);
    this.piston(-1, -125);
    this.piston(1, -131);
    this.gate('leverage', 5, 'x5', new THREE.Vector3(-3.1, -139, 0), 0.7);
  }

  private candleMesh(w: number, h: number, d: number, mat: THREE.Material, wickTop: number, wickBottom: number): THREE.Group {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    g.add(body);
    const wickR = Math.min(0.09, w * 0.08);
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
    // Dark edge strip down the front reads as a comic outline.
    const edge = new THREE.Mesh(new THREE.BoxGeometry(w * 1.04, h * 1.01, d * 0.96), this.mats.ink);
    edge.scale.set(1, 1, 1);
    edge.position.z = -0.04;
    g.add(edge);
    return g;
  }

  private bumperCandle(x: number, y: number, w: number, h: number): void {
    const mesh = this.candleMesh(w, h, 1.6, this.mats.red, h * 0.28, h * 0.22);
    this.addStatic('bumper', 'RED CANDLE', RAPIER.ColliderDesc.cuboid(w / 2, h / 2, 0.8), new THREE.Vector3(x, y, 0), new THREE.Quaternion(),
      { damageScale: 1.1, kick: 7.5, restitution: 0.55 }, mesh);
    // Wicks are thin capsules so limbs can snag on them.
    const wickBody = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, 0));
    for (const [cy, len] of [[h / 2 + h * 0.14, h * 0.28], [-h / 2 - h * 0.11, h * 0.22]] as const) {
      const c = this.world.createCollider(RAPIER.ColliderDesc.capsule(len / 2, 0.07).setTranslation(0, cy, 0).setCollisionGroups(ENV), wickBody);
      this.byCollider.set(c.handle, { kind: 'peg', label: 'WICK', damageScale: 1.3, kick: 0, lastKick: -1, body: wickBody });
    }
  }

  private ledge(side: number, y: number, len: number, tilt: number): void {
    const mesh = this.candleMesh(len, 0.8, 1.8, this.mats.red, 0, 0);
    const x = side * (SHAFT.halfWidth - len / 2 + 0.2);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, tilt));
    // Steep and slick so he tumbles off instead of resting.
    this.addStatic('ledge', 'RED CANDLE', RAPIER.ColliderDesc.cuboid(len / 2, 0.4, 0.9), new THREE.Vector3(x, y, 0), q, { damageScale: 1, restitution: 0.3, friction: 0.12, kick: 2.5 }, mesh);
  }

  private peg(x: number, y: number): void {
    const mesh = this.candleMesh(0.55, 1.5, 1.2, this.mats.red, 0.35, 0.3);
    // Round cross-section so he glances off instead of balancing on a flat top.
    this.addStatic('peg', 'RED CANDLE', RAPIER.ColliderDesc.capsule(0.5, 0.29), new THREE.Vector3(x, y, 0), new THREE.Quaternion(),
      { damageScale: 1, kick: 6, restitution: 0.5 }, mesh);
  }

  private glassFloor(y: number): void {
    const g = new THREE.Group();
    const slab = new THREE.Mesh(new THREE.BoxGeometry(SHAFT.halfWidth * 2, 0.35, 2.6), this.mats.glass);
    g.add(slab);
    const label = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.62), neon(signTexture('SUPPORT', { color: '#7fffd4', glow: '#39f0b0', stroke: '#002a1c' }), 1.5));
    label.position.set(0, 0.62, -0.6);
    g.add(label);
    const o = this.addStatic('glass', 'SUPPORT', RAPIER.ColliderDesc.cuboid(SHAFT.halfWidth, 0.175, 1.3), new THREE.Vector3(0, y, 0), new THREE.Quaternion(),
      { damageScale: 0.8, restitution: 0.1 }, g);
    o.broken = false;
    o.contactTime = 0;
  }

  private gate(kind: SensorKind, value: number, label: string, pos: THREE.Vector3, radius: number): void {
    const g = new THREE.Group();
    const color = kind === 'boost' ? 0x39f0b0 : 0xffcf3a;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.12, 10, 40), new THREE.MeshBasicMaterial({ color, toneMapped: false }));
    ring.material.color.multiplyScalar(1.8);
    g.add(ring);
    const inner = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.92, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, depthWrite: false }));
    g.add(inner);
    const tex = signTexture(label, { color: '#fff7f2', stroke: '#0b0410', width: 256, height: 256 });
    const text = new THREE.Mesh(new THREE.PlaneGeometry(radius * 1.5, radius * 1.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    text.position.z = 0.05;
    g.add(text);
    g.userData.spin = ring;
    this.addSensor(kind, value, kind === 'boost' ? 'DUMP IT' : `x${value} LEVERAGE`, pos, radius, g);
  }

  private whale(y: number): void {
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
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.42), neon(signTexture('WHALE', { color: '#fff7f2', stroke: '#0b2a6a' }), 1.2));
    sign.position.set(0, 1.25, 0.2);
    g.add(sign);
    this.addKinematic('whale', 'WHALE', [
      RAPIER.ColliderDesc.capsule(1.1, 0.95).setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))),
    ], g, { damageScale: 1.2, kick: 9, restitution: 0.9 }, (t, b) => {
      const x = Math.sin(t * 0.7) * 1.3;
      b.setNextKinematicTranslation({ x, y: y + Math.sin(t * 1.3) * 0.35, z: 0 });
      const face = Math.cos(t * 0.7) >= 0 ? 0 : Math.PI;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, face, Math.sin(t * 1.3) * 0.08));
      b.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    });
  }

  private rotor(y: number): void {
    const g = new THREE.Group();
    const bar = this.candleMesh(5.4, 0.55, 1.4, this.mats.red, 0, 0);
    g.add(bar);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.6, 20), this.mats.steel);
    hub.rotation.x = Math.PI / 2;
    g.add(hub);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), neon(signTexture('SELL WALL', { color: '#fff7f2', stroke: '#3a0010' }), 1.2));
    sign.position.set(0, 0, 0.75);
    g.add(sign);
    this.addKinematic('rotor', 'SELL WALL', [RAPIER.ColliderDesc.cuboid(2.7, 0.275, 0.7), RAPIER.ColliderDesc.ball(0.45)], g,
      { damageScale: 1.35, restitution: 0.3 }, (t, b) => {
        b.setNextKinematicTranslation({ x: 0, y, z: 0 });
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -t * 2.1));
        b.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
      });
  }

  private piston(side: number, y: number): void {
    const g = new THREE.Group();
    const head = this.candleMesh(2.6, 1.1, 1.8, this.mats.red, 0, 0);
    g.add(head);
    const rod = new THREE.Mesh(new THREE.BoxGeometry(3, 0.35, 0.5), this.mats.steel);
    rod.position.x = side * 2.6;
    g.add(rod);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.48), neon(signTexture('LIQUIDATED', { color: '#fff7f2', stroke: '#3a0010' }), 1.2));
    sign.position.set(0, 0, 0.95);
    g.add(sign);
    const phase = side > 0 ? Math.PI : 0;
    // Sloped toward the middle so nothing can sit on top; kicks on contact.
    const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, side * 0.32));
    this.addKinematic('piston', 'LIQUIDATION', [RAPIER.ColliderDesc.cuboid(1.3, 0.55, 0.9)], g, { damageScale: 1.25, kick: 7, restitution: 0.4 }, (t, b) => {
      const out = 0.5 + 0.5 * Math.sin(t * 2.4 + phase);
      const x = side * (SHAFT.halfWidth - 1.3 - out * 1.9);
      b.setNextKinematicTranslation({ x, y, z: 0 });
      b.setNextKinematicRotation({ x: tilt.x, y: tilt.y, z: tilt.z, w: tilt.w });
    });
  }

  // ---------------------------------------------------------------- Rock Bottom

  private buildRockBottom(): void {
    const floorY = SHAFT.floorY;
    const floor = new THREE.Group();
    const slab = new THREE.Mesh(new THREE.BoxGeometry(SHAFT.halfWidth * 2, 2, 3.4), toon(0x1c0a26, { emissive: 0x2a0418 }));
    floor.add(slab);
    // Glowing crater rim along the top face.
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(SHAFT.halfWidth * 2, 3.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff2a4d).multiplyScalar(0.9), toneMapped: false }));
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 1.01;
    floor.add(glow);
    this.addStatic('floor', 'ROCK BOTTOM', RAPIER.ColliderDesc.cuboid(SHAFT.halfWidth, 1, 1.7), new THREE.Vector3(0, floorY - 1, 0), new THREE.Quaternion(),
      { damageScale: 1.5, restitution: 0.2, friction: 0.9 }, floor);

    for (const x of [-2.4, -0.8, 0.8, 2.4]) {
      const div = this.candleMesh(0.22, 1.3, 2.4, this.mats.ink, 0, 0);
      this.addStatic('divider', 'DIVIDER', RAPIER.ColliderDesc.cuboid(0.11, 0.65, 1.2), new THREE.Vector3(x, floorY + 0.65, 0), new THREE.Quaternion(), { damageScale: 1.1 }, div);
    }
    for (const w of WELLS) {
      const hot = w.label === 'REKT';
      const tex = signTexture(w.label, { color: hot ? '#ffcf3a' : '#ff2a4d', glow: hot ? '#ffcf3a' : '#ff2a4d', stroke: '#0b0410', width: 256, height: 128 });
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.72), neon(tex, 1.5));
      sign.position.set((w.x0 + w.x1) / 2, floorY + 2.1, -SHAFT.slab - 0.3);
      this.group.add(sign);
      const multTex = signTexture(`x${w.mult}`, { color: '#fff7f2', stroke: '#0b0410', width: 128, height: 96 });
      const mult = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), neon(multTex, 1.2));
      mult.position.set((w.x0 + w.x1) / 2, floorY + 1.45, -SHAFT.slab - 0.3);
      this.group.add(mult);
    }
    const rb = signTexture('ROCK BOTTOM', { color: '#a259ff', glow: '#a259ff', stroke: '#12041c', width: 1024, height: 160 });
    const rbSign = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.94), neon(rb, 1.6));
    rbSign.position.set(0, floorY + 6, -SHAFT.slab - 0.3);
    this.group.add(rbSign);
  }
}

/** Colour of the shaft at a given depth (Bull Market Heaven -> The Dip -> Rock Bottom). */
export function zoneColor(y: number, out: THREE.Color, surface: 'back' | 'side' | 'sky'): THREE.Color {
  // Bull Market Heaven (mint and gold) -> sunset at the top of the chart ->
  // the red Dip -> purple-black Rock Bottom.
  const stops: [number, number][] = surface === 'sky'
    ? [[14, 0x2fd6a6], [6, 0x9ee8a0], [2, 0xffc24a], [-4, 0xff6a4a], [-10, 0x4a0a1c], [-60, 0x2e0612], [-120, 0x24051a], [-150, 0x12041c], [-170, 0x0b0410]]
    : surface === 'back'
      ? [[14, 0x5ff0c0], [6, 0xb8f0a0], [2, 0xffd060], [-4, 0xff7a55], [-10, 0x7a1630], [-60, 0x5c0f24], [-120, 0x4a0c2a], [-150, 0x2a0a3a], [-170, 0x1a0624]]
      : [[14, 0x2fb890], [6, 0x8ac880], [2, 0xd8a040], [-4, 0xb84a3a], [-10, 0x4a0d1e], [-60, 0x3a0a18], [-120, 0x30081c], [-150, 0x1c0628], [-170, 0x12041c]];
  if (y >= stops[0][0]) return out.set(stops[0][1]);
  for (let i = 0; i < stops.length - 1; i++) {
    const [y0, c0] = stops[i];
    const [y1, c1] = stops[i + 1];
    if (y <= y0 && y >= y1) {
      const t = (y0 - y) / (y0 - y1);
      return out.set(c0).lerp(new THREE.Color(c1), t);
    }
  }
  return out.set(stops[stops.length - 1][1]);
}
