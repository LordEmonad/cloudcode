// Ragdoll lab: a test scene for tuning and stress-testing the ragdoll.
// Open with ?lab=1. With ?lab=stress it runs scripted high-speed impacts and
// reports stability numbers on window.__lab for the automated checks.
import * as THREE from 'three';
import { RAPIER, GROUP, groups, initPhysics } from './physics';
import { PHYSICS } from './config';
import { Ragdoll } from './ragdoll';
import { loadEmonad } from './assets';

export async function runLab(canvas: HTMLCanvasElement, mode: string): Promise<void> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1024);
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.05, 200);
  camera.position.set(0, 1.4, 6);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x442255, 2.2));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(3, 6, 5);
  scene.add(sun);

  const world = await initPhysics();
  const q = new URLSearchParams(location.search);
  if (q.has('iters')) world.numSolverIterations = Number(q.get('iters'));
  if (q.has('pgs')) world.numInternalPgsIterations = Number(q.get('pgs'));
  const env = groups(GROUP.ENV, 0xffff);
  const box = (x: number, y: number, z: number, hx: number, hy: number, hz: number, color = 0x553366) => {
    const b = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z));
    world.createCollider(RAPIER.ColliderDesc.cuboid(hx, hy, hz).setCollisionGroups(env).setFriction(0.8), b);
    const m = new THREE.Mesh(new THREE.BoxGeometry(hx * 2, hy * 2, hz * 2), new THREE.MeshStandardMaterial({ color }));
    m.position.set(x, y, z);
    scene.add(m);
  };
  // A walled pit: floor, four walls and a few blocks to tumble over.
  box(0, -0.5, 0, 6, 0.5, 6, 0x2a1838);
  box(-6, 4, 0, 0.5, 4.5, 6); box(6, 4, 0, 0.5, 4.5, 6);
  box(0, 4, -6, 6, 4.5, 0.5);
  // Front wall: physics only, so the camera can see in.
  {
    const b = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, 4, 6));
    world.createCollider(RAPIER.ColliderDesc.cuboid(6, 4.5, 0.5).setCollisionGroups(env), b);
  }
  box(-2, 0.6, 0, 0.6, 0.6, 1.5, 0xc0303a); box(2.2, 1.0, -1, 0.5, 1.0, 0.5, 0xc0303a);

  const model = await loadEmonad();
  scene.add(model);
  const ragdoll = new Ragdoll(world, model);
  (window as unknown as { __ragdoll: unknown }).__ragdoll = ragdoll;
  ragdoll.resetPose(new THREE.Vector3(0, 0.95, 0), new THREE.Quaternion());

  // Debug wireframe of the physics shapes.
  const debugGeo = new THREE.BufferGeometry();
  const debugLines = new THREE.LineSegments(debugGeo, new THREE.LineBasicMaterial({ color: 0x55ffcc, depthTest: false, transparent: true, opacity: 0.8 }));
  debugLines.renderOrder = 10;
  debugLines.visible = mode !== 'stress' || new URLSearchParams(location.search).has('debug');
  scene.add(debugLines);

  const rng = mulberry32(7);
  const stats = { launches: 0, maxGap: 0, nan: 0, stepMsAvg: 0, stepMsMax: 0, steps: 0, maxSpeed: 0, done: false, worstOvershoot: 0, overshootP99: 0 };
  const overshoots: number[] = [];
  const gaps: number[] = [];
  let timeToNext = 0.4;
  const steer = new THREE.Vector3();
  const launch = () => {
    stats.launches++;
    const pos = new THREE.Vector3((rng() - 0.5) * 6, 3 + rng() * 3, (rng() - 0.5) * 4);
    const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(rng() * 6.28, rng() * 6.28, rng() * 6.28));
    ragdoll.resetPose(pos, rot);
    const dir = new THREE.Vector3(rng() - 0.5, -0.6 - rng(), rng() - 0.5).normalize();
    const lo = Number(new URLSearchParams(location.search).get('vmin') ?? 25);
    const hi = Number(new URLSearchParams(location.search).get('vmax') ?? 42);
    const speed = lo + rng() * (hi - lo); // default 25-42 m/s into the floor and walls
    ragdoll.setVelocity(dir.multiplyScalar(speed), new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(8));
  };

  const anchorWorld = (p: { body: { translation(): { x: number; y: number; z: number }; rotation(): { x: number; y: number; z: number; w: number } } }, local: { x: number; y: number; z: number }) => {
    const t = p.body.translation(), r = p.body.rotation();
    return new THREE.Vector3(local.x, local.y, local.z).applyQuaternion(new THREE.Quaternion(r.x, r.y, r.z, r.w)).add(new THREE.Vector3(t.x, t.y, t.z));
  };

  const step = () => {
    ragdoll.preStep(PHYSICS.step, PHYSICS.dragPerSpeed, steer);
    ragdoll.updateMuscles(PHYSICS.step, Number(new URLSearchParams(location.search).get('muscle') ?? (mode === 'pose' ? 1 : 0.15)));
    const t0 = performance.now();
    world.step();
    const ms = performance.now() - t0;
    stats.steps++;
    stats.stepMsAvg += (ms - stats.stepMsAvg) / stats.steps;
    stats.stepMsMax = Math.max(stats.stepMsMax, ms);
    ragdoll.postStep();
    for (const part of ragdoll.parts) {
      const t = part.body.translation();
      if (!Number.isFinite(t.x + t.y + t.z)) stats.nan++;
      const v = part.body.linvel();
      stats.maxSpeed = Math.max(stats.maxSpeed, Math.hypot(v.x, v.y, v.z));
      if (part.joint) {
        const parent = ragdoll.get(part.spec.parent!);
        const a = anchorWorld(parent, part.joint.anchor1());
        const b = anchorWorld(part, part.joint.anchor2());
        const gap = a.distanceTo(b);
        gaps.push(gap);
        stats.maxGap = Math.max(stats.maxGap, gap);
        const o = overshoot(world, ragdoll.get(part.spec.parent!).body, part.body, part.joint);
        overshoots.push(o);
        stats.worstOvershoot = Math.max(stats.worstOvershoot, o);
      }
    }
  };

  const fast = mode === 'stress';
  const targetLaunches = Number(new URLSearchParams(location.search).get('n') ?? 200);
  let last = performance.now();
  const frame = () => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const freeze = new URLSearchParams(location.search).get('freeze');
    const steps = freeze !== null ? (stats.steps < Number(freeze) ? 1 : 0) : fast ? 24 : Math.max(1, Math.round(dt / PHYSICS.step));
    for (let i = 0; i < steps; i++) {
      step();
      timeToNext -= PHYSICS.step;
      if (timeToNext <= 0) {
        if (stats.launches >= targetLaunches && fast) {
          gaps.sort((a, b) => a - b);
          overshoots.sort((a, b) => a - b);
          Object.assign(stats, { gapP99: gaps[Math.floor(gaps.length * 0.99)], overshootP99: overshoots[Math.floor(overshoots.length * 0.99)], done: true });
          (window as unknown as { __lab: unknown }).__lab = stats;
          break;
        }
        launch();
        timeToNext = 1.6;
      }
    }
    ragdoll.syncBones(1);
    if (debugLines.visible) {
      const buffers = world.debugRender();
      debugGeo.setAttribute('position', new THREE.BufferAttribute(buffers.vertices, 3));
    }
    if (mode !== 'pose') {
      const com = ragdoll.centerOfMass();
      camera.position.lerp(new THREE.Vector3(com.x * 0.6, Math.max(1.2, com.y + 1.0), Math.min(5.2, com.z + 4.2)), 0.08);
      camera.lookAt(com.x, Math.max(0.4, com.y), com.z);
    }
    renderer.render(scene, camera);
    const pr = ragdoll.get('pelvis').body.rotation();
    (window as unknown as { __lab: unknown }).__lab = { ...stats, pelvisRot: [pr.x, pr.y, pr.z, pr.w].map((v) => +v.toFixed(3)) };
    if (!stats.done) requestAnimationFrame(frame);
  };
  if (mode === 'pose') {
    // Hold him upright with full muscle strength to check the shapes against the mesh.
    ragdoll.resetPose(new THREE.Vector3(0, 1.2, 0), new THREE.Quaternion());
    ragdoll.setHeld(true);
    timeToNext = Infinity;
    const yaw = Number(new URLSearchParams(location.search).get('yaw') ?? 0) * Math.PI / 180;
    camera.position.set(Math.sin(yaw) * 3.2, 1.25, Math.cos(yaw) * 3.2);
    camera.lookAt(0, 1.05, 0);
  } else if (mode !== 'stress') launch();
  requestAnimationFrame(frame);
}

/** Degrees past the joint's per-axis limits (0 when inside them). */
function overshoot(
  world: Awaited<ReturnType<typeof initPhysics>>,
  parent: { rotation(): { x: number; y: number; z: number; w: number } },
  child: { rotation(): { x: number; y: number; z: number; w: number } },
  joint: { handle: number; frameX1(): { x: number; y: number; z: number; w: number }; frameX2(): { x: number; y: number; z: number; w: number } },
): number {
  const q = (r: { x: number; y: number; z: number; w: number }) => new THREE.Quaternion(r.x, r.y, r.z, r.w);
  const a = q(parent.rotation()).multiply(q(joint.frameX1()));
  const b = q(child.rotation()).multiply(q(joint.frameX2()));
  const r = a.invert().multiply(b);
  if (r.w < 0) r.set(-r.x, -r.y, -r.z, -r.w);
  const raw = world.impulseJoints.raw as unknown as { jointLimitsMin(h: number, ax: number): number; jointLimitsMax(h: number, ax: number): number };
  let worst = 0;
  [r.x, r.y, r.z].forEach((c, k) => {
    const ang = 2 * Math.asin(THREE.MathUtils.clamp(c, -1, 1));
    worst = Math.max(worst, ang - raw.jointLimitsMax(joint.handle, 3 + k), raw.jointLimitsMin(joint.handle, 3 + k) - ang);
  });
  return (worst * 180) / Math.PI;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
