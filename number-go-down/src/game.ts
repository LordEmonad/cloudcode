import * as THREE from 'three';
import { initPhysics, RAPIER, GROUP, groups, type World } from './physics';
import { PHYSICS, RAGDOLL, STEER, DAMAGE } from './config';
import { Ragdoll, type PartId } from './ragdoll';
import { loadEmonad } from './assets';
import { Course, ZONES, type Obstacle, type Sensor, type Frame, type Zone } from './course';
import { Slingshot } from './slingshot';
import { CameraRig } from './camera';
import { DamageModel, BONE_NAMES, type ImpactEvent } from './damage';
import { Director, type Settings, type Tier } from './director';
import { XRay } from './xray';
import { Face } from './face';
import { Particles, Post, EmberField } from './fx';
import { Hud, fmt } from './hud';
import { GameAudio } from './audio';
import { toon, outlineMaterial } from './materials';
import { createSky } from './hell';

type State = 'aim' | 'flight' | 'landed' | 'results';

const BONK_WORDS = ['BONK!', 'WHAM!', 'OOF!', 'THWACK!', 'CLONK!', 'SPLAT!', 'BOINK!'];
const CRACK_WORDS = ['CRACK!', 'SNAP!', 'KRAK!', 'CRUNCH!'];
const STORAGE = 'ngd.v1';

/** Ember colours and density per circle of hell. */
const EMBERS: Record<string, [number, number, number]> = {
  top: [0xffcf3a, 0xfff2c0, 0.2],
  dip: [0xff3a2a, 0xff9a3a, 0.7],
  whale: [0x3ad8ff, 0xa259ff, 0.55],
  inferno: [0xff6a10, 0xffd23a, 1],
  abyss: [0xff2a4d, 0xa259ff, 0.6],
};

interface Saved {
  best: number;
  settings: Settings & { sound: boolean; music: boolean; haptics: boolean };
}

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();

export class Game {
  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private rig!: CameraRig;
  private world!: World;
  private ragdoll!: Ragdoll;
  private course!: Course;
  private sling!: Slingshot;
  private damage = new DamageModel();
  private director!: Director;
  private xray!: XRay;
  private face!: Face;
  private particles!: Particles;
  private embers!: EmberField;
  private post!: Post;
  private hud!: Hud;
  private audio = new GameAudio();
  private events!: InstanceType<typeof RAPIER.EventQueue>;
  private keyLight!: THREE.DirectionalLight;
  private fillLight!: THREE.DirectionalLight;
  private hemi!: THREE.HemisphereLight;
  private glowLight!: THREE.DirectionalLight;
  private sky!: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  private frameNow: Frame | null = null;
  private bannerZone: Zone | null = null;
  private farthest = 0;
  private farthestAt = 0;
  private rescues = 0;
  private outlines: THREE.Mesh[] = [];
  private outlineMat = outlineMaterial(0x0b0410, 2.4);

  private state: State = 'aim';
  private simT = 0;
  private acc = 0;
  private realT = 0;
  private last = 0;
  private pendingEvents: ImpactEvent[] = [];
  private pendingSensors: Sensor[] = [];
  private pendingGlass: Obstacle[] = [];

  // Input.
  private pointer: { id: number; x0: number; y0: number; x: number; y: number; t0: number } | null = null;
  private aim: ReturnType<Slingshot['aimFromDrag']> | null = null;
  private steerInput = 0;
  private steerSmoothed = 0;
  private steerInputY = 0;
  private steerSmoothedY = 0;
  private keys = new Set<string>();
  private steerDampUntil = 0;

  // Run state.
  private stillTime = 0;
  private whaleContact = 0;
  private pendingCallouts: { text: string; at: THREE.Vector3; style: 'gate' | 'whale' | 'big'; sub?: string }[] = [];
  private landedAt = 0;
  private finaleDone = false;
  private hintTimer = 0;
  private flailPhase = Math.random() * 10;
  private braceCooldown = 0;
  private lastHeartbeat = 0;
  private saved: Saved;
  private frameTimes: number[] = [];
  private pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  private stats = { runs: 0, events: 0, breaks: 0, cinematics: 0, fps: 0 };

  constructor(private canvas: HTMLCanvasElement) {
    this.saved = loadSaved();
  }

  async init(): Promise<void> {
    const fill = document.querySelector<HTMLElement>('.loading-fill');
    const progress = (f: number) => { if (fill) fill.style.width = `${Math.round(f * 100)}%`; };
    progress(0.05);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    const [model, world] = await Promise.all([
      loadEmonad((f) => progress(0.1 + f * 0.6)),
      initPhysics(),
      document.fonts?.load('48px Bangers').catch(() => undefined),
    ]);
    progress(0.8);
    this.world = world;
    this.events = new RAPIER.EventQueue(true);

    this.rig = new CameraRig(window.innerWidth / window.innerHeight);
    this.setupLights();
    this.course = new Course(world, this.scene);
    this.rig.restForward.copy(this.course.craterForward);
    this.sling = new Slingshot(this.scene, new THREE.Vector3(0, 0, 0.5), (pos, q) => this.course.addPost(pos, q));
    this.ragdoll = new Ragdoll(world, model);
    this.scene.add(model);
    this.dressEmonad();
    this.xray = new XRay(this.scene, this.ragdoll);
    this.face = new Face(this.ragdoll);
    this.particles = new Particles(this.scene);
    this.embers = new EmberField(this.scene);
    const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4;
    this.post = new Post(this.renderer, this.scene, this.rig.camera, lowEnd ? 'low' : 'high');
    this.hud = new Hud(document.getElementById('hud')!);
    this.hud.onAgain = () => { this.audio.ui(); this.resetRun(); };
    this.hud.onSettings = () => this.openSettings();
    this.director = new Director(this.saved.settings);
    this.applySettings();
    progress(1);

    this.bindInput();
    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.resetRun();
    // Compile shaders up front so the first hit does not hitch.
    this.renderer.compile(this.scene, this.rig.camera);
    document.getElementById('loading')?.classList.add('done');
    setTimeout(() => document.getElementById('loading')?.remove(), 600);
    this.last = performance.now();
    this.renderer.setAnimationLoop(() => this.frame());
    this.exposeTestHooks();
  }

  // ---------------------------------------------------------------- setup

  private setupLights(): void {
    this.hemi = new THREE.HemisphereLight(0xfff2f6, 0x3a1030, 1.0);
    this.scene.add(this.hemi);
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
    this.scene.add(this.keyLight, this.keyLight.target);
    this.fillLight = new THREE.DirectionalLight(0xa259ff, 1.1);
    this.scene.add(this.fillLight, this.fillLight.target);
    // Hell glows from below: lava light up into faces and undersides.
    this.glowLight = new THREE.DirectionalLight(0xff5a20, 1.2);
    this.scene.add(this.glowLight, this.glowLight.target);
    this.scene.fog = new THREE.FogExp2(0x5a0a1c, 0.011);
    this.sky = createSky();
    this.scene.add(this.sky);
    // Real-time shadow from the key light, only around Emonad (cheap and grounding).
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    const sc = this.keyLight.shadow.camera;
    sc.left = -7; sc.right = 7; sc.top = 7; sc.bottom = -7; sc.near = 1; sc.far = 40;
    this.keyLight.shadow.bias = -0.0015;
    this.keyLight.shadow.normalBias = 0.04;
  }

  /** Comic toon materials, a hot-pink rim and an inverted-hull outline (report). */
  private dressEmonad(): void {
    const body = this.ragdoll.body;
    const oldBody = body.material as THREE.MeshStandardMaterial;
    body.material = toon(0xffffff, { map: oldBody.map, rim: 0xff4fd8, rimPower: 2.2, rimStrength: 0.75 });
    body.castShadow = true;
    const hair = this.ragdoll.hair;
    if (hair) hair.castShadow = true;
    if (hair) {
      const oldHair = hair.material as THREE.MeshStandardMaterial;
      hair.material = toon(0xffffff, { map: oldHair.map, rim: 0xc49bff, rimPower: 2.0, rimStrength: 0.9, emissive: 0x160626 });
    }
    // Outline copies share geometry, skeleton and morph weights.
    const bodyOutline = new THREE.SkinnedMesh(body.geometry, this.outlineMat);
    bodyOutline.bind(body.skeleton, body.bindMatrix);
    bodyOutline.morphTargetInfluences = body.morphTargetInfluences;
    bodyOutline.morphTargetDictionary = body.morphTargetDictionary;
    bodyOutline.position.copy(body.position);
    bodyOutline.quaternion.copy(body.quaternion);
    bodyOutline.scale.copy(body.scale);
    bodyOutline.frustumCulled = false;
    body.parent!.add(bodyOutline);
    this.outlines.push(bodyOutline);
    if (hair) {
      const hairOutline = new THREE.Mesh(hair.geometry, this.outlineMat);
      hairOutline.morphTargetInfluences = hair.morphTargetInfluences;
      hairOutline.morphTargetDictionary = hair.morphTargetDictionary;
      hairOutline.frustumCulled = false;
      hair.add(hairOutline);
      this.outlines.push(hairOutline);
    }
  }

  private resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(w, h);
    this.post.setSize(w, h);
    this.rig.setAspect(w / h);
    this.particles.setViewport(h * this.pixelRatio, this.rig.camera.fov);
    this.embers.setViewport(h * this.pixelRatio, this.rig.camera.fov);
    (this.outlineMat.userData.outline.uResolution.value as THREE.Vector2).set(w, h);
  }

  // ---------------------------------------------------------------- input

  private bindInput(): void {
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => {
      this.audio.unlock();
      if (this.pointer) return;
      c.setPointerCapture(e.pointerId);
      this.pointer = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now() };
      this.hintTimer = 0;
      this.hud.showHint(false);
      if (this.state === 'aim') this.face.mood = 'tense';
    });
    c.addEventListener('pointermove', (e) => {
      if (!this.pointer || e.pointerId !== this.pointer.id) return;
      this.pointer.x = e.clientX;
      this.pointer.y = e.clientY;
      this.onDrag();
    });
    const end = (e: PointerEvent) => {
      if (!this.pointer || e.pointerId !== this.pointer.id) return;
      const p = this.pointer;
      this.pointer = null;
      const moved = Math.hypot(p.x - p.x0, p.y - p.y0);
      if (this.state === 'aim') this.release();
      else if (this.state === 'flight') {
        this.steerInput = 0;
        this.steerInputY = 0;
        if (moved < 12 && performance.now() - p.t0 < 220) this.director.skip();
      }
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', (e) => {
      if (this.state === 'aim' && this.pointer) {
        this.pointer = null;
        this.sling.cancel();
        this.aim = null;
        this.audio.stopCreak();
      } else end(e);
    });
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key);
      if (e.key === ' ' && this.state === 'results') this.resetRun();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key));
  }

  private onDrag(): void {
    const p = this.pointer!;
    const dx = p.x - p.x0;
    const dy = p.y - p.y0;
    if (this.state === 'aim') {
      this.aim = this.sling.aimFromDrag(dx, dy, window.innerHeight);
      this.sling.setPull(this.aim.pull, this.aim.cancelled ? null : this.aim.velocity);
      this.audio.stretch(this.aim.cancelled ? 0 : this.aim.power);
    } else if (this.state === 'flight') {
      // Report: relative horizontal drag from wherever the finger lands -> target sideways speed.
      // In The Fall the camera looks straight down, so dragging up/down steers forward/back too.
      this.steerInput = THREE.MathUtils.clamp(dx / STEER.dragPixelsForFull, -1, 1);
      this.steerInputY = THREE.MathUtils.clamp(-dy / STEER.dragPixelsForFull, -1, 1);
    }
  }

  private release(): void {
    const aim = this.aim;
    this.aim = null;
    this.audio.stopCreak();
    if (!aim || aim.cancelled) {
      this.sling.cancel();
      this.face.mood = 'smug';
      return;
    }
    this.launch(aim.velocity, aim.power);
  }

  // ---------------------------------------------------------------- run flow

  private resetRun(): void {
    this.state = 'aim';
    this.simT = 0;
    this.acc = 0;
    this.stillTime = 0;
    this.whaleContact = 0;
    this.finaleDone = false;
    this.course.reset();
    this.damage.reset();
    this.director.reset();
    this.xray.reset();
    this.face.reset();
    this.audio.resetRun();
    this.audio.stopMusic();
    this.hud.reset(this.saved.best);
    this.hud.setFlying(false);
    this.pendingEvents = [];
    this.sling.setPull(new THREE.Vector3(), null);
    this.ragdoll.resetPose(this.seatPosition(), new THREE.Quaternion());
    this.ragdoll.setHeld(true);
    this.setSeatedPose();
    this.rig.snapAim(this.sling.pouch);
    this.farthest = 0;
    this.farthestAt = 0;
    this.rescues = 0;
    this.steerInput = this.steerInputY = this.steerSmoothed = this.steerSmoothedY = 0;
    this.bannerZone = null;
    this.hintTimer = 0;
    this.stats.runs++;
  }

  private seatPosition(): THREE.Vector3 {
    return this.sling.pouch.clone().add(new THREE.Vector3(0, 0.22, 0.05));
  }

  private setSeatedPose(): void {
    const r = this.ragdoll;
    r.clearPose();
    r.setPose('thighL', [0, -8, 78]);
    r.setPose('thighR', [0, 8, 78]);
    r.setPose('shinL', [0, 0, 70]);
    r.setPose('shinR', [0, 0, 70]);
    r.setPose('upperArmL', [0, 0, 25]);
    r.setPose('upperArmR', [0, 0, 25]);
    r.setPose('foreArmL', [0, 0, 35]);
    r.setPose('foreArmR', [0, 0, 35]);
    // Sitting up and looking back at you, scared.
    r.setPose('spine', [0, 0, -6]);
    r.setPose('chest', [0, 0, -6]);
    r.setPose('head', [0, 0, -28]);
  }

  private launch(velocity: THREE.Vector3, power: number): void {
    this.state = 'flight';
    this.simT = 0;
    this.ragdoll.setHeld(false);
    this.ragdoll.clearPose();
    // Report: every body gets the same launch velocity, so limbs do not stretch.
    // He leaves facing the camera, so he tumbles backward head over heels.
    const spin = new THREE.Vector3(-2 - Math.random() * 2.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 2);
    this.ragdoll.setVelocity(velocity, spin);
    this.sling.release();
    this.director.liftOff();
    this.audio.launch(power);
    this.audio.startMusic();
    this.face.mood = 'falling';
    this.hud.setFlying(true);
    this.hud.showHint(false);
    this.rig.addTrauma(0.2 + power * 0.25);
    this.rig.boostFov(4 + power * 6);
  }

  // ---------------------------------------------------------------- simulation

  private fixedStep(): void {
    const dt = PHYSICS.step;
    this.simT += dt;
    this.course.step(this.simT);

    const com = this.ragdoll.centerOfMass(_v);
    const vel = this.ragdoll.velocity(new THREE.Vector3());
    const steer = new THREE.Vector3();

    if (this.state === 'aim') {
      this.ragdoll.moveHeld(this.seatPosition(), _q.identity());
    } else if (this.state === 'flight' || this.state === 'landed') {
      // Sideways steering at the centre of mass, capped at 0.35 g (report).
      const keySteer = (this.keys.has('ArrowRight') || this.keys.has('d') ? 1 : 0) - (this.keys.has('ArrowLeft') || this.keys.has('a') ? 1 : 0);
      const keySteerY = (this.keys.has('ArrowUp') || this.keys.has('w') ? 1 : 0) - (this.keys.has('ArrowDown') || this.keys.has('s') ? 1 : 0);
      const input = keySteer !== 0 ? keySteer : this.steerInput;
      const inputY = keySteerY !== 0 ? keySteerY : this.steerInputY;
      this.steerSmoothed += (input - this.steerSmoothed) * (1 - Math.exp(-dt / 0.1));
      this.steerSmoothedY += (inputY - this.steerSmoothedY) * (1 - Math.exp(-dt / 0.1));
      if (this.state === 'flight') {
        // Steering is sideways across the track, wherever the track points.
        const frame = this.course.frameAt(com);
        let scale = this.simT < this.steerDampUntil ? STEER.afterImpactScale : 1;
        scale *= this.director.steeringBoost;
        if (frame.kind === 'fall') {
          // The Fall: aim for the bullseye in two dimensions, with a little more authority.
          const maxA = STEER.maxAccelG * 9.81 * scale * STEER.fallAuthority;
          const right = this.course.craterRight;
          const fwd = this.course.craterForward;
          const ax = THREE.MathUtils.clamp((this.steerSmoothed * STEER.fallSpeed - vel.dot(right)) / STEER.response, -maxA, maxA);
          const az = THREE.MathUtils.clamp((this.steerSmoothedY * STEER.fallSpeed - vel.dot(fwd)) / STEER.response, -maxA, maxA);
          // Only steer when there is input: otherwise momentum carries him.
          if (Math.abs(this.steerSmoothed) > 0.05) steer.addScaledVector(right, ax);
          if (Math.abs(this.steerSmoothedY) > 0.05) steer.addScaledVector(fwd, az);
        } else {
          const right = frame.right;
          const target = this.steerSmoothed * STEER.targetSpeed;
          const maxA = STEER.maxAccelG * 9.81 * scale;
          const a = THREE.MathUtils.clamp((target - vel.dot(right)) / STEER.response, -maxA, maxA);
          steer.copy(right).multiplyScalar(a);
        }
        // Downhill assist: an arcade push along the track (never into it) when he bogs down on the ground.
        if ((frame.kind === 'stairs' || frame.kind === 'road') && this.ragdoll.parts.some((p) => p.contact)) {
          const downhill = frame.tangent.clone();
          if (downhill.y < 0) downhill.y *= 0.5;
          downhill.normalize();
          const along = vel.dot(downhill);
          if (along < STEER.assistBelow) steer.addScaledVector(downhill, Math.min(STEER.assistMax, (STEER.assistBelow - along) * 1.2));
        }
      }
    }

    // Steering costs speed (FlatOut rule): up to 15% extra air drag at full sway.
    const drag = PHYSICS.dragPerSpeed * (1 + 0.15 * Math.abs(this.steerSmoothed));
    this.ragdoll.preStep(dt, drag, steer);
    this.updateBehaviours(dt, com, vel);
    this.world.step(this.events);
    this.ragdoll.postStep();

    this.events.drainCollisionEvents((h1, h2, started) => {
      if (!started) return;
      const sensor = this.course.sensorOf(h1) ?? this.course.sensorOf(h2);
      if (!sensor || sensor.used) return;
      const other = this.course.sensorOf(h1) ? h2 : h1;
      if (!this.ragdoll.partOfCollider(other)) return;
      sensor.used = true;
      this.triggerSensor(sensor);
    });

    if (this.state === 'flight' || this.state === 'landed') {
      const evs = this.damage.detect(this.world, this.ragdoll, this.course, this.simT);
      for (const ev of evs) this.obstacleReaction(ev);
      this.pendingEvents.push(...evs);
      this.checkGlass(dt);
      this.checkWhaleSpout(dt);
      this.checkStuck(com, vel);
    } else {
      for (const p of this.ragdoll.parts) p.contact = false;
    }
  }

  /** Faintly alive: flail in freefall, brace before impacts, crumple on contact. */
  private updateBehaviours(dt: number, com: THREE.Vector3, vel: THREE.Vector3): void {
    const r = this.ragdoll;
    if (this.state === 'aim') {
      r.updateMuscles(dt, RAGDOLL.muscleHeld);
      return;
    }
    let strength = this.state === 'landed' ? 0.04 : RAGDOLL.muscleFreefall;
    if (this.state === 'flight') {
      this.flailPhase += dt * 7;
      const f = this.flailPhase;
      // Arm windmill and leg pedal (Euphoria vocabulary), weak and out of phase.
      r.setPose('upperArmL', [0, Math.sin(f) * 35, 40 + Math.sin(f * 1.1) * 70]);
      r.setPose('upperArmR', [0, -Math.sin(f + 1.7) * 35, 40 + Math.sin(f * 1.1 + 2.4) * 70]);
      r.setPose('foreArmL', [0, 0, 40 + Math.sin(f * 1.3) * 30]);
      r.setPose('foreArmR', [0, 0, 40 + Math.sin(f * 1.3 + 1) * 30]);
      r.setPose('thighL', [0, 0, 25 + Math.sin(f * 0.9) * 35]);
      r.setPose('thighR', [0, 0, 25 + Math.sin(f * 0.9 + Math.PI) * 35]);
      r.setPose('shinL', [0, 0, 30 + Math.sin(f * 0.9 + 1) * 30]);
      r.setPose('shinR', [0, 0, 30 + Math.sin(f * 0.9 + Math.PI + 1) * 30]);
      r.setPose('head', [0, 0, -10]);
      // Brace: if a hit is ~0.2 s away, reach toward it.
      this.braceCooldown -= dt;
      const speed = vel.length();
      if (speed > 6 && this.braceCooldown <= 0) {
        const dir = vel.clone().normalize();
        const ray = new RAPIER.Ray({ x: com.x, y: com.y, z: com.z }, { x: dir.x, y: dir.y, z: dir.z });
        const hit = this.world.castRay(ray, speed * 0.22, true, RAPIER.QueryFilterFlags.EXCLUDE_SENSORS, groups(0xffff, GROUP.ENV));
        if (hit && hit.timeOfImpact / speed < 0.2) {
          this.face.brace();
          this.braceCooldown = 0.6;
          r.setPose('upperArmL', [0, 20, 90]);
          r.setPose('upperArmR', [0, -20, 90]);
          r.setPose('foreArmL', [0, 0, 15]);
          r.setPose('foreArmR', [0, 0, 15]);
          strength = 0.42;
        }
      }
    } else {
      r.clearPose();
    }
    r.updateMuscles(dt, strength);
  }

  private obstacleReaction(ev: ImpactEvent): void {
    const o = ev.obstacle;
    // Pop bumpers kick the whole body outward along the hit normal.
    if (o.kick > 0 && ev.speed > 2.5 && this.simT - o.lastKick > 0.25) {
      o.lastKick = this.simT;
      const kick = ev.normal.clone().multiplyScalar(o.kick * THREE.MathUtils.clamp(ev.speed / 10, 0.5, 1.2));
      for (const p of this.ragdoll.parts) p.body.applyImpulse({ x: kick.x * p.mass, y: kick.y * p.mass, z: 0 }, true);
    }
    if (ev.tier >= 2) this.steerDampUntil = this.simT + STEER.afterImpactTime;
    if (ev.broke) this.ragdoll.breakPart(ev.part);
    if (o.kind === 'glass' && !o.broken && ev.speed >= 6) this.breakGlass(o);
    if ((o.kind === 'floor' || o.kind === 'divider') && !this.finaleDone && this.state === 'flight') {
      this.finaleDone = true;
      this.state = 'landed';
      this.landedAt = this.realT;
      this.director.finale(ev);
      this.audio.crater();
      this.audio.stopMusic();
    }
  }

  private checkGlass(dt: number): void {
    for (const o of this.course.obstacles) {
      if (o.kind !== 'glass' || o.broken || !o.collider) continue;
      let touching = false;
      this.world.contactPairsWith(o.collider, (other) => {
        if (this.ragdoll.partOfCollider(other.handle)) touching = true;
      });
      o.contactTime = touching ? (o.contactTime ?? 0) + dt : 0;
      // The floor cannot hold him for long either way.
      if ((o.contactTime ?? 0) > 0.3) this.breakGlass(o);
    }
  }

  /** Resting on the whale? It spouts him off. */
  private checkWhaleSpout(dt: number): void {
    let touching = false;
    for (const p of this.ragdoll.parts) {
      if (!p.contact) continue;
      for (const c of p.colliders) {
        this.world.contactPairsWith(c, (other) => {
          if (this.course.obstacleOf(other.handle)?.kind === 'whale') touching = true;
        });
      }
    }
    this.whaleContact = touching ? this.whaleContact + dt : 0;
    if (this.whaleContact < 0.35) return;
    this.whaleContact = 0;
    const com = this.ragdoll.centerOfMass();
    const side = com.x > 0 ? 1 : -1;
    for (const p of this.ragdoll.parts) {
      const v = p.body.linvel();
      p.body.setLinvel({ x: side * 6, y: Math.max(v.y, 0) + 9, z: v.z }, true);
    }
    this.pendingCallouts.push({ text: 'SPOUTED!', at: com, style: 'whale', sub: 'NO FREE RIDES' });
  }

  private breakGlass(o: Obstacle): void {
    o.broken = true;
    o.body.setEnabled(false);
    if (o.mesh) o.mesh.visible = false;
    this.pendingGlass.push(o);
    const bonus = Math.round(2500 * this.damage.multiplier(this.simT) / 10) * 10;
    this.damage.total += bonus;
  }

  /**
   * Rescue stalls by track progress, not speed: riding the whale or a piston
   * still counts as moving. No new progress for ~1 s means he is stuck: first
   * the HODL hand hops him loose, then harder, then hell spits him further down.
   * Falling off the course respawns him on it.
   */
  private checkStuck(com: THREE.Vector3, vel: THREE.Vector3): void {
    if (this.state !== 'flight') return;
    const frame = this.course.frameAt(com);
    const offTrack = com.distanceTo(frame.point) > 28 || (frame.kind !== 'fall' && com.y < frame.point.y - 18);
    if (offTrack) {
      this.respawn(Math.max(frame.s, this.farthest) + 6, 'HELL SPAT YOU BACK');
      return;
    }
    if (frame.s > this.farthest + 1 || this.simT < 0.5) {
      this.farthest = Math.max(this.farthest, frame.s);
      this.farthestAt = this.simT;
      this.rescues = 0;
      return;
    }
    if (this.simT - this.farthestAt < 1.1) return;
    this.farthestAt = this.simT;
    this.rescues++;
    if (this.rescues >= 3) {
      this.respawn(this.farthest + 5, 'UNSTUCK');
      return;
    }
    const flat = frame.tangent.clone().setY(0);
    if (flat.lengthSq() < 0.01) flat.copy(this.course.craterCenter).sub(com).setY(0);
    flat.normalize();
    const toCenter = frame.point.clone().sub(com).setY(0);
    const want = flat.multiplyScalar(5 + this.rescues * 2).add(new THREE.Vector3(0, 5 + this.rescues * 3, 0)).addScaledVector(toCenter, Math.min(1, 3 / Math.max(0.1, toCenter.length())));
    const kick = want.sub(vel.clone().multiplyScalar(0.6));
    for (const p of this.ragdoll.parts) p.body.applyImpulse({ x: kick.x * p.mass, y: kick.y * p.mass, z: kick.z * p.mass }, true);
    this.pendingCallouts.push({ text: 'SHAKEN OUT', at: com.clone(), style: 'gate' });
  }

  private respawn(s: number, text: string): void {
    const fall = this.course.track.section('fall');
    const at = this.course.track.at(s >= fall.s0 ? Math.min(s, fall.s1 - 3) : Math.min(s, fall.s0 - 2), 0, 1.6);
    const com = this.ragdoll.centerOfMass();
    this.ragdoll.teleport(at.p.clone().sub(com), at.f.clone().multiplyScalar(7));
    this.farthest = Math.max(this.farthest, s);
    this.farthestAt = this.simT;
    this.rescues = 0;
    this.pendingCallouts.push({ text, at: at.p.clone(), style: 'gate' });
  }

  private triggerSensor(s: Sensor): void {
    this.pendingSensors.push(s);
    if (s.kind === 'leverage') {
      this.damage.setLeverage(s.value, this.simT, 4);
    } else {
      // DUMP IT: a shove down the track.
      for (const p of this.ragdoll.parts) {
        const v = p.body.linvel();
        p.body.setLinvel({ x: v.x * 0.5 + s.dir.x * s.value, y: Math.min(v.y, 0) * 0.5 + s.dir.y * s.value - 2, z: v.z * 0.5 + s.dir.z * s.value }, true);
      }
    }
  }

  // ---------------------------------------------------------------- presentation

  private present(): void {
    const events = this.pendingEvents;
    this.pendingEvents = [];
    if (events.length) {
      const tiers = this.director.handle(events, this.simT);
      // The finale event was already given its cinematic in obstacleReaction.
      for (const { ev, tier } of tiers) this.presentEvent(ev, tier);
    }
    for (const s of this.pendingSensors) this.presentSensor(s);
    this.pendingSensors = [];
    for (const o of this.pendingGlass) this.presentGlass(o);
    this.pendingGlass = [];
    for (const c of this.pendingCallouts) {
      const p = this.hud.project(c.at, this.rig.camera);
      this.hud.callout(c.text, p.x, p.y - 50, c.style, c.sub);
    }
    this.pendingCallouts = [];
  }

  private presentEvent(ev: ImpactEvent, tier: Tier): void {
    this.stats.events++;
    const cam = this.rig.camera;
    const s = this.hud.project(ev.point, cam);
    const strength = ev.strength;
    const soft = ev.obstacle.kind === 'wall' || ev.obstacle.kind === 'summit';
    this.particles.impact(ev.point, ev.normal, Math.min(1.5, strength), ev.obstacle.kind === 'whale' ? 0x7fb2ff : 0xffcf3a);
    this.audio.hit(strength, soft);
    this.audio.scoreTick(this.simT);
    this.face.impact(Math.min(1, strength));
    if (ev.speed >= DAMAGE.bruiseAt) {
      this.xray.setState(ev.part.spec.id, 1);
      this.hud.markBone(ev.part.spec.id, 'hit');
    }
    this.rig.addTrauma(tier === 1 ? 0.1 + strength * 0.15 : tier === 2 ? 0.32 : 0.5);
    if (ev.points >= 40) this.hud.callout(`+${fmt(ev.points)}`, s.x + 30, s.y - 30, 'points');

    if (ev.obstacle.kind === 'whale' && this.damage.whales > 0 && this.simT - ev.t < 0.05) {
      this.audio.whale();
      this.hud.callout('WHALE BONK', s.x, s.y - 70, 'whale', `+1x MULTIPLIER`);
    }
    if (ev.groin) {
      this.hud.callout('OOF! GROIN', s.x, s.y - 50, 'big');
      this.audio.hit(1.2, false);
    }

    if (tier >= 2) {
      this.rig.punch(ev.normal.clone().multiplyScalar(-0.06 - strength * 0.08), 1);
      if (tier === 2 && !ev.groin) this.hud.callout(pick(BONK_WORDS), s.x, s.y - 10, 'bonk');
      if (strength > 0.5) this.particles.stars3(ev.point, strength);
    }
    if (tier >= 3) {
      this.stats.breaks++;
      this.xray.setState(ev.part.spec.id, 2);
      this.hud.markBone(ev.part.spec.id, 'broken');
      this.particles.boneChips(ev.point, ev.normal);
      this.audio.crack(ev.part.spec.points / 300);
      this.face.hurt();
      const name = BONE_NAMES[ev.part.spec.id];
      this.hud.callout(pick(CRACK_WORDS), s.x, s.y - 20, tier === 4 ? 'big' : 'crack', ev.firstBreakOfBone ? `${name} SNAPPED` : `${name} AGAIN`);
    }
    if (tier === 4) {
      this.stats.cinematics++;
      this.audio.swell();
      this.audio.heartbeat();
      this.lastHeartbeat = this.realT;
    }
  }

  private presentSensor(s: Sensor): void {
    const p = this.hud.project(s.pos, this.rig.camera);
    s.mesh.visible = false;
    this.particles.ring(s.pos, 1, s.kind === 'boost' ? 0x39f0b0 : 0xffcf3a);
    if (s.kind === 'leverage') {
      this.audio.gate(s.value);
      this.hud.callout(`x${s.value} LEVERAGE`, p.x, p.y, 'gate', 'DAMAGE MULTIPLIED');
    } else {
      this.audio.boost();
      this.hud.callout('DUMP IT', p.x, p.y, 'gate', 'SPEED UP');
      this.rig.boostFov(10);
      this.rig.addTrauma(0.3);
    }
  }

  private presentGlass(o: Obstacle): void {
    const t = o.body.translation();
    const center = new THREE.Vector3(t.x, t.y, t.z);
    this.particles.shatter(center, 12);
    this.audio.shatter();
    this.rig.addTrauma(0.45);
    const p = this.hud.project(this.ragdoll.centerOfMass(), this.rig.camera);
    this.hud.callout('SUPPORT BROKEN', p.x, p.y - 60, 'big', `+${fmt(2500 * this.damage.multiplier(this.simT))}`);
  }

  // ---------------------------------------------------------------- frame

  private frame(): void {
    const now = performance.now();
    const realDt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.realT += realDt;
    this.trackPerformance(realDt);

    this.director.update(realDt);
    const timeScale = this.director.timeScale;
    this.acc += realDt * timeScale;
    let steps = 0;
    while (this.acc >= PHYSICS.step && steps < PHYSICS.maxStepsPerFrame) {
      this.fixedStep();
      this.acc -= PHYSICS.step;
      steps++;
    }
    if (steps === PHYSICS.maxStepsPerFrame) this.acc = 0;
    const alpha = this.acc / PHYSICS.step;
    this.present();

    // Visual-only vibration of the victim during freezes (Sakurai).
    const vib = this.director.vibrate * 0.035;
    this.ragdoll.renderOffset.set((Math.random() - 0.5) * vib, (Math.random() - 0.5) * vib, 0);
    this.ragdoll.syncBones(alpha);
    this.face.update(realDt * Math.max(0.3, timeScale), alpha);
    this.xray.update(alpha, this.director.xray, realDt);
    for (const o of this.outlines) o.visible = this.director.xray < 0.5;
    this.course.syncMeshes(this.realT, realDt, this.scene.fog as THREE.FogExp2);
    this.sling.update(realDt);
    for (const s of this.course.sensors) {
      const ring = s.mesh.userData.spin as THREE.Object3D | undefined;
      if (ring) ring.rotation.z += realDt * 1.5;
    }

    const pelvis = this.ragdoll.get('pelvis');
    const target = this.ragdoll.renderPos(pelvis, alpha, new THREE.Vector3());
    const vel = this.ragdoll.velocity(new THREE.Vector3());
    this.frameNow = this.course.frameAt(target);
    const mode = this.state === 'aim' ? 'aim' : this.state === 'flight' ? 'chase' : 'rest';
    this.rig.cinematic = this.director.cinematic;
    this.rig.orbit = 0.55 * this.director.orbitSign;
    // Slow-mo frames Emonad first, nudged toward the contact point.
    const closeUp = target.clone().lerp(this.director.closeUp, 0.3);
    this.rig.update(realDt, this.state === 'aim' ? this.sling.pouch : target, vel, mode, this.frameNow, closeUp,
      this.aim && !this.aim.cancelled ? this.aim.power : 0, this.course.craterCenter);
    this.keepCameraClear(this.state === 'aim' ? this.sling.pouch : target);
    if (this.state === 'flight') this.announceZone(this.frameNow.zone);

    this.updateAtmosphere(realDt);
    this.particles.update(realDt * Math.max(timeScale, 0.12));
    const em = EMBERS[this.frameNow.zone.id];
    this.embers.update(this.realT, this.rig.camera.position, em[0], em[1], em[2], realDt);
    this.post.update(this.director.grade, this.state === 'flight' ? vel.length() : 0, this.realT);
    this.post.render(realDt);

    this.hud.update(realDt);
    this.hud.setDamage(this.damage.total);
    this.hud.setMultiplier(
      this.damage.multiplier(this.simT) / ((this.simT < this.damage.leverageUntil ? this.damage.leverage : 1) * (1 + this.damage.whales)),
      this.simT < this.damage.leverageUntil ? this.damage.leverage : 1,
      this.damage.whales,
    );
    this.hud.setDepth(this.frameNow.progress);
    const slowmo = THREE.MathUtils.clamp((1 - timeScale) / 0.75, 0, 1) * (this.director.inCinematic ? 1 : 0);
    this.audio.update(vel.length(), slowmo, this.state === 'flight');
    if (this.director.inCinematic && this.realT - this.lastHeartbeat > 0.85) {
      this.audio.heartbeat();
      this.lastHeartbeat = this.realT;
    }

    if (this.state === 'aim' && !this.pointer) {
      this.hintTimer += realDt;
      this.hud.showHint(this.hintTimer > 1.2);
      if (this.face.mood !== 'smug') this.face.mood = 'smug';
    }
    if (this.state === 'landed') this.checkLanded(realDt, vel);
    this.publishTestState();
  }

  /** Blend sky, fog and lights toward the current circle of hell. */
  private updateAtmosphere(dt = 1 / 60): void {
    const z = this.frameNow?.zone ?? ZONES.top;
    const k = 1 - Math.exp(-dt * 1.8);
    const u = this.sky.material.uniforms;
    (u.top.value as THREE.Color).lerp(new THREE.Color(z.skyTop), k);
    (u.horizon.value as THREE.Color).lerp(new THREE.Color(z.skyHorizon), k);
    const fog = this.scene.fog as THREE.FogExp2;
    fog.color.lerp(new THREE.Color(z.fog), k);
    fog.density += (z.fogDensity - fog.density) * k;
    this.hemi.color.lerp(new THREE.Color(z.hemiSky), k);
    this.hemi.groundColor.lerp(new THREE.Color(z.hemiGround), k);
    this.glowLight.color.lerp(new THREE.Color(z.glow), k);
    const hell = z.id === 'top' ? 0 : 1;
    u.hell.value += (hell - (u.hell.value as number)) * k;
    u.time.value = this.realT;
    // Lights follow Emonad so every depth is lit the same way and his shadow stays crisp.
    const cp = this.rig.camera.position;
    this.sky.position.copy(cp);
    const em = this.ragdoll.get('pelvis').currPos;
    this.keyLight.position.set(em.x + 6, em.y + 14, em.z + 8);
    this.keyLight.target.position.copy(em);
    this.fillLight.position.set(cp.x - 8, cp.y + 2, cp.z - 4);
    this.fillLight.target.position.set(cp.x, cp.y - 3, cp.z - 8);
    this.glowLight.position.set(cp.x, cp.y - 20, cp.z - 6);
    this.glowLight.target.position.set(cp.x, cp.y, cp.z - 8);
  }

  /** Pull the camera in front of anything solid between it and Emonad. */
  private keepCameraClear(target: THREE.Vector3): void {
    const cam = this.rig.camera.position;
    const dir = cam.clone().sub(target);
    const dist = dir.length();
    if (dist < 0.5) return;
    dir.divideScalar(dist);
    const ray = new RAPIER.Ray({ x: target.x, y: target.y + 0.3, z: target.z }, { x: dir.x, y: dir.y, z: dir.z });
    const hit = this.world.castRay(ray, dist, true, RAPIER.QueryFilterFlags.EXCLUDE_SENSORS | RAPIER.QueryFilterFlags.EXCLUDE_KINEMATIC, groups(0xffff, GROUP.ENV));
    if (hit && hit.timeOfImpact < dist) {
      const safe = Math.max(0.8, hit.timeOfImpact - 0.45);
      cam.set(target.x, target.y + 0.3, target.z).addScaledVector(dir, safe);
    }
  }

  /** Title card when Emonad enters a new circle of hell. */
  private announceZone(z: Zone): void {
    if (z === this.bannerZone || z.id === 'top') return;
    this.bannerZone = z;
    this.hud.banner(z.sub, z.banner);
  }

  private checkLanded(dt: number, vel: THREE.Vector3): void {
    if (vel.length() < 0.7) this.stillTime += dt;
    else this.stillTime = 0;
    const waited = this.realT - this.landedAt;
    if ((this.stillTime > 1.0 && waited > 2.2) || waited > 5.5) this.finishRun();
  }

  private finishRun(): void {
    this.state = 'results';
    this.face.mood = 'dazed';
    this.hud.setFlying(false);
    const com = this.ragdoll.centerOfMass();
    const well = this.course.wellAt(com);
    const final = Math.round((this.damage.total * well.mult) / 10) * 10;
    const newBest = final > this.saved.best;
    if (newBest) {
      this.saved.best = final;
      persist(this.saved);
    }
    this.hud.showResults({
      damage: this.damage.total,
      final,
      well,
      broken: [...this.damage.breakOrder],
      hits: this.damage.hits,
      maxImpact: this.damage.maxImpact,
      time: this.simT,
      best: this.saved.best,
      newBest,
      whales: this.damage.whales,
    });
  }

  // ---------------------------------------------------------------- settings

  private applySettings(): void {
    const s = this.saved.settings;
    this.director.settings = s;
    this.rig.shakeScale = s.reducedMotion ? s.shake * 0.4 : s.shake;
    this.audio.enabled = s.sound;
    this.audio.musicEnabled = s.music;
    this.audio.haptics = s.haptics;
  }

  private openSettings(): void {
    let panel = document.querySelector<HTMLElement>('.settings');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'settings';
      document.body.appendChild(panel);
    }
    const s = this.saved.settings;
    panel.innerHTML = `
      <div class="settings-card">
        <h2>SETTINGS</h2>
        <label class="settings-row">Screen shake <input type="range" min="0" max="1" step="0.1" value="${s.shake}" data-k="shake"></label>
        <label class="settings-row">Flashing <input type="checkbox" ${s.flashing ? 'checked' : ''} data-k="flashing"></label>
        <label class="settings-row">Slow-mo cinematics
          <select data-k="cinematics">
            <option value="always" ${s.cinematics === 'always' ? 'selected' : ''}>Always</option>
            <option value="big" ${s.cinematics === 'big' ? 'selected' : ''}>Big moments only</option>
            <option value="off" ${s.cinematics === 'off' ? 'selected' : ''}>Off</option>
          </select></label>
        <label class="settings-row">Reduced motion <input type="checkbox" ${s.reducedMotion ? 'checked' : ''} data-k="reducedMotion"></label>
        <label class="settings-row">Sound <input type="checkbox" ${s.sound ? 'checked' : ''} data-k="sound"></label>
        <label class="settings-row">Music <input type="checkbox" ${s.music ? 'checked' : ''} data-k="music"></label>
        <label class="settings-row">Vibration <input type="checkbox" ${s.haptics ? 'checked' : ''} data-k="haptics"></label>
        <button class="settings-close">DONE</button>
      </div>`;
    panel.hidden = false;
    panel.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-k]').forEach((el) => {
      el.addEventListener('change', () => {
        const k = el.dataset.k as keyof Saved['settings'];
        const value = el instanceof HTMLInputElement
          ? el.type === 'checkbox' ? el.checked : Number(el.value)
          : el.value;
        (this.saved.settings as unknown as Record<string, unknown>)[k] = value;
        this.applySettings();
        persist(this.saved);
      });
    });
    panel.querySelector('.settings-close')!.addEventListener('click', () => { panel!.hidden = true; });
  }

  // ---------------------------------------------------------------- perf + tests

  /** Quality governor: drop resolution, then bloom, if frames run long. */
  private trackPerformance(dt: number): void {
    this.frameTimes.push(dt);
    if (this.frameTimes.length < 90) return;
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.frameTimes = [];
    this.stats.fps = Math.round(1 / avg);
    if (avg > 1 / 45 && this.pixelRatio > 1) {
      this.pixelRatio = Math.max(1, this.pixelRatio - 0.25);
      this.resize();
    }
  }

  private publishTestState(): void {
    (window as unknown as { __game: unknown }).__game = {
      state: this.state,
      simT: +this.simT.toFixed(2),
      damage: this.damage.total,
      broken: [...this.damage.breakOrder],
      hits: this.damage.hits,
      whales: this.damage.whales,
      y: +this.ragdoll.get('pelvis').currPos.y.toFixed(1),
      timeScale: +this.director.timeScale.toFixed(2),
      xray: +this.director.xray.toFixed(2),
      ...this.stats,
    };
  }

  private exposeTestHooks(): void {
    (window as unknown as { __gameObj: unknown }).__gameObj = this;
    (window as unknown as { __ngd: unknown }).__ngd = {
      fling: (dx: number, dy: number) => {
        if (this.state !== 'aim') return false;
        const aim = this.sling.aimFromDrag(dx, dy, window.innerHeight);
        this.launch(aim.velocity, aim.power);
        return true;
      },
      steer: (x: number, y = 0) => { this.steerInput = THREE.MathUtils.clamp(x, -1, 1); this.steerInputY = THREE.MathUtils.clamp(y, -1, 1); },
      again: () => this.resetRun(),
      aim: (dx: number, dy: number) => {
        const aim = this.sling.aimFromDrag(dx, dy, window.innerHeight);
        this.sling.setPull(aim.pull, aim.velocity);
      },
      // Headless course-flow test: run physics only, as fast as possible, and trace the run.
      simulate: (seconds: number, steerPlan: [number, number][] = []) => {
        const trace: { t: number; s: number; seg: number; name: string; y: number; v: number }[] = [];
        const steps = Math.round(seconds / PHYSICS.step);
        let landedT = -1;
        for (let i = 0; i < steps; i++) {
          for (const [t, x] of steerPlan) if (Math.abs(this.simT - t) < PHYSICS.step / 2) this.steerInput = x;
          this.fixedStep();
          this.pendingEvents = [];
          this.pendingSensors = [];
          this.pendingGlass = [];
          this.pendingCallouts = [];
          if (this.state === 'landed' && landedT < 0) landedT = this.simT;
          if (i % 30 === 0) {
            const com = this.ragdoll.centerOfMass();
            const f = this.course.frameAt(com);
            trace.push({ t: +this.simT.toFixed(2), s: +f.s.toFixed(1), seg: f.section, name: f.name, y: +com.y.toFixed(1), v: +this.ragdoll.velocity(new THREE.Vector3()).length().toFixed(1) });
          }
          if (landedT > 0 && this.simT - landedT > 2) break;
        }
        const com = this.ragdoll.centerOfMass();
        return {
          state: this.state, landedT: +landedT.toFixed(2), damage: this.damage.total, hits: this.damage.hits,
          broken: [...this.damage.breakOrder], well: this.course.wellAt(com).label, com: com.toArray().map((n) => +n.toFixed(1)),
          trackLength: +this.course.length.toFixed(1), trace,
        };
      },
    };
  }
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function loadSaved(): Saved {
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const defaults: Saved = {
    best: 0,
    settings: {
      shake: 1, flashing: true, cinematics: reduced ? 'big' : 'always', reducedMotion: reduced,
      sound: true, music: true, haptics: true,
    },
  };
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Saved>;
    return { best: parsed.best ?? 0, settings: { ...defaults.settings, ...(parsed.settings ?? {}) } };
  } catch {
    return defaults;
  }
}

function persist(saved: Saved): void {
  try { localStorage.setItem(STORAGE, JSON.stringify(saved)); } catch { /* private mode */ }
}

export type { PartId };
