import * as THREE from 'three';
import { signTexture } from './textures';
import { neon } from './materials';

// Hell's set dressing: lava, sky, jagged canyon rock, neon trims and the
// scenery that sells the scale of the descent. Everything is procedural.

const LAVA_GLSL = /* glsl */ `
  vec2 h2(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
  float h1(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(h1(i), h1(i + vec2(1, 0)), u.x), mix(h1(i + vec2(0, 1)), h1(i + vec2(1, 1)), u.x), u.y); }
  // Cellular noise: distance to nearest and second-nearest feature points.
  vec2 cells(vec2 x, float t) {
    vec2 n = floor(x), f = fract(x);
    float d1 = 8.0, d2 = 8.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = h2(n + g);
      o = 0.5 + 0.45 * sin(t * 0.35 + 6.2831 * o);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
    }
    return vec2(sqrt(d1), sqrt(d2));
  }
  vec3 lava(vec2 p, float t) {
    // Domain-warp so the crust drifts like it is floating on something hot.
    vec2 w = vec2(vnoise(p * 0.21 + t * 0.05), vnoise(p * 0.21 - t * 0.04 + 7.3)) * 2.4;
    vec2 c = cells(p * 0.42 + w, t);
    float crack = 1.0 - smoothstep(0.0, 0.16, c.y - c.x);
    float heat = vnoise(p * 0.12 - t * 0.08);
    float pulse = 0.75 + 0.25 * sin(t * 1.7 + heat * 9.0);
    float thin = 1.0 - smoothstep(0.0, 0.06, c.y - c.x);
    vec3 crust = mix(vec3(0.025, 0.006, 0.006), vec3(0.09, 0.02, 0.015), heat) * (0.5 + 0.8 * c.x);
    vec3 glow = mix(vec3(1.4, 0.18, 0.01), vec3(3.4, 1.4, 0.32), thin * heat) * pulse;
    // Hot pools where the crust has melted through.
    float pool = smoothstep(0.62, 0.8, heat) * smoothstep(0.15, 0.0, c.x);
    return mix(crust, glow, max(crack * 0.85, pool));
  }
`;

let lavaMat: THREE.ShaderMaterial | null = null;

export function lavaMaterial(): THREE.ShaderMaterial {
  if (lavaMat) return lavaMat;
  lavaMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, fogColor: { value: new THREE.Color(0x5a0a1c) }, fogDensity: { value: 0.004 } },
    vertexShader: `varying vec3 vWorld; varying float vDepth;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; vec4 mv = viewMatrix * w; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float time; uniform vec3 fogColor; uniform float fogDensity; varying vec3 vWorld; varying float vDepth;
      ${LAVA_GLSL}
      void main() {
        vec3 c = lava(vWorld.xz * 0.12, time);
        // Far lava sinks into the haze: depth reads, and the sea never becomes a wall.
        float fog = 1.0 - exp(-fogDensity * fogDensity * vDepth * vDepth);
        c *= 1.0 - 0.55 * smoothstep(80.0, 420.0, vDepth);
        gl_FragColor = vec4(mix(c, fogColor * 1.15, min(1.0, fog * 1.05)), 1.0);
      }`,
    toneMapped: false,
  });
  return lavaMat;
}

/** Narrow lava channels that sit on track surfaces (finer scale). */
let channelMat: THREE.ShaderMaterial | null = null;
export function lavaChannelMaterial(): THREE.ShaderMaterial {
  if (channelMat) return channelMat;
  channelMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec3 vWorld; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float time; varying vec3 vWorld;
      ${LAVA_GLSL}
      void main() { gl_FragColor = vec4(lava(vWorld.xz * 0.9 + vec2(0.0, time * 0.6), time) * 1.3, 1.0); }`,
    toneMapped: false,
  });
  return channelMat;
}

export function tickLava(time: number, fog?: THREE.FogExp2): void {
  if (lavaMat) {
    lavaMat.uniforms.time.value = time;
    if (fog) {
      (lavaMat.uniforms.fogColor.value as THREE.Color).copy(fog.color);
      lavaMat.uniforms.fogDensity.value = fog.density * 0.8;
    }
  }
  if (channelMat) channelMat.uniforms.time.value = time;
}

// ------------------------------------------------------------------ sky

export function createSky(): THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial> {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      top: { value: new THREE.Color(0x2fd6a6) },
      horizon: { value: new THREE.Color(0xffc24a) },
      below: { value: new THREE.Color(0x1a0204) },
      time: { value: 0 },
      hell: { value: 0 },
      sunDir: { value: new THREE.Vector3(0.15, 0.2, -1).normalize() },
    },
    vertexShader: `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 below; uniform float time; uniform float hell; uniform vec3 sunDir; varying vec3 vDir;
      float h(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
      float n(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(h(i), h(i + vec2(1, 0)), u.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), u.x), u.y); }
      float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * n(p); p *= 2.07; a *= 0.5; } return s; }
      void main() {
        vec3 d = normalize(vDir);
        float y = d.y;
        vec3 c = y > 0.0 ? mix(horizon, top, pow(smoothstep(0.0, 0.8, y), 0.65)) : mix(horizon, below, smoothstep(0.0, -0.3, y));
        c += horizon * 0.45 * exp(-abs(y) * 12.0);
        // Smoke clouds drifting across hell's sky (bands that thicken near the horizon).
        vec2 uv = d.xz / (abs(y) + 0.25) * 1.6 + vec2(time * 0.02, time * 0.01);
        float cl = fbm(uv) * smoothstep(-0.05, 0.25, y) * (1.0 - smoothstep(0.5, 0.95, y));
        vec3 smoke = mix(vec3(0.02, 0.0, 0.01), horizon * 0.55, fbm(uv * 1.7 + 3.0));
        c = mix(c, smoke, smoothstep(0.42, 0.75, cl) * 0.85 * hell);
        // The blood moon in eclipse: a black disc with a burning corona.
        float a = acos(clamp(dot(d, sunDir), -1.0, 1.0));
        float disc = 1.0 - smoothstep(0.075, 0.08, a);
        float corona = exp(-(a - 0.078) * 26.0) * step(0.078, a);
        vec3 moon = vec3(2.6, 0.5, 0.25) * corona * (0.85 + 0.15 * sin(time * 2.0 + a * 120.0));
        c = mix(c + moon * hell, vec3(0.01, 0.0, 0.0), disc * hell);
        gl_FragColor = vec4(c, 1.0);
      }`,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    toneMapped: false,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), mat);
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  return sky;
}

// ------------------------------------------------------------------ rock

function hash(x: number, y: number, z: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function smooth3(x: number, y: number, z: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  return l(
    l(l(hash(xi, yi, zi), hash(xi + 1, yi, zi), u), l(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), u), v),
    l(l(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), u), l(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), u), v),
    w,
  );
}

/**
 * A slab of jagged rock: a box whose inner face bulges and whose top edge is
 * broken into crags. Displacement is in world space so neighbouring slabs match.
 */
export function rockSlab(width: number, height: number, length: number, transform: THREE.Matrix4, seed: number): THREE.BufferGeometry {
  const segY = Math.max(4, Math.round(height / 1.4));
  const segZ = Math.max(4, Math.round(length / 1.6));
  const geo = new THREE.BoxGeometry(width, height, length, 2, segY, segZ);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const p = new THREE.Vector3();
  const w = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    w.copy(p).applyMatrix4(transform);
    const top = (p.y + height / 2) / height; // 0 at the bottom, 1 at the top
    const n1 = smooth3(w.x * 0.18 + seed, w.y * 0.18, w.z * 0.18);
    const n2 = smooth3(w.x * 0.55, w.y * 0.55 + seed, w.z * 0.55);
    // Bulge outward/inward along local x and break up the top edge.
    p.x += (n1 - 0.5) * 1.6 + (n2 - 0.5) * 0.5;
    if (top > 0.98) p.y += (smooth3(w.z * 0.35 + seed, 0, w.x * 0.35) - 0.35) * height * 0.45;
    pos.setXYZ(i, p.x, p.y, p.z);
    // World-space UVs so the rock texture keeps one scale on every slab.
    uv.setXY(i, (w.x + w.z) / 7, w.y / 7);
  }
  geo.computeVertexNormals();
  return geo;
}

// ------------------------------------------------------------------ scenery

export interface SceneryOptions {
  pathPoints: THREE.Vector3[];
  seaY: number;
  /** A hole in the lava sea where The Fall's shaft goes through it. */
  hole: THREE.Vector3;
  holeRadius: number;
  /** Fraction of the path where The Fall begins (no billboards past it). */
  fallStart: number;
}

/** Distant spires, burning candle towers, tumbling coins and joke billboards. */
export class Scenery {
  group = new THREE.Group();
  private coins: THREE.InstancedMesh;
  private coinData: { p: THREE.Vector3; spin: THREE.Vector3; rot: THREE.Euler; fall: number }[] = [];
  private flames: THREE.Mesh[] = [];
  private seaY = -300;

  constructor(scene: THREE.Scene, opts: SceneryOptions) {
    scene.add(this.group);
    let seed = 11;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const path = opts.pathPoints;
    const along = (t: number) => {
      const f = t * (path.length - 1);
      const i = Math.min(path.length - 2, Math.floor(f));
      return path[i].clone().lerp(path[i + 1], f - i);
    };

    // Lava sea, with a hole for the shaft.
    const seaY = opts.seaY;
    const sea = new THREE.Mesh(new THREE.RingGeometry(opts.holeRadius, 1400, 64, 4), lavaMaterial());
    sea.rotation.x = -Math.PI / 2;
    sea.position.set(opts.hole.x, seaY, opts.hole.z);
    this.group.add(sea);
    this.seaY = seaY;

    // Rock spires: jagged cones rising out of the lava.
    const spireMat = new THREE.MeshToonMaterial({ color: 0x2a1418, emissive: 0x3a0804 });
    for (let k = 0; k < 46; k++) {
      const t = rand();
      const c = along(t);
      const side = k % 2 ? 1 : -1;
      const dist = 26 + rand() * 140;
      const h = 60 + rand() * 260;
      const r = 4 + rand() * 14;
      const geo = new THREE.ConeGeometry(r, h, 6, 6);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const j = (smooth3(pos.getX(i) * 0.3, y * 0.08 + k, pos.getZ(i) * 0.3) - 0.5) * r * 0.6;
        pos.setX(i, pos.getX(i) + j);
        pos.setZ(i, pos.getZ(i) - j * 0.6);
      }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, spireMat);
      m.position.set(c.x + side * dist, seaY + h / 2 - 10, c.z + (rand() - 0.5) * 60);
      m.rotation.y = rand() * Math.PI;
      this.group.add(m);
    }

    // Burning candle towers: giant red candles with fire on their wicks.
    const candleMat = new THREE.MeshToonMaterial({ color: 0x9c0a22, emissive: 0x3a0008 });
    const flameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff7a20).multiplyScalar(2.4), toneMapped: false, fog: false });
    for (let k = 0; k < 14; k++) {
      const c = along(0.05 + (k / 14) * opts.fallStart);
      const side = k % 2 ? 1 : -1;
      const w = 6 + rand() * 6;
      const h = 90 + rand() * 160;
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), candleMat);
      g.add(body);
      const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, h * 0.12, 6), new THREE.MeshBasicMaterial({ color: 0x0b0410 }));
      wick.position.y = h / 2 + h * 0.06;
      g.add(wick);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(w * 0.35, w * 1.4, 10), flameMat);
      flame.position.y = h / 2 + h * 0.12 + w * 0.5;
      g.add(flame);
      this.flames.push(flame);
      g.position.set(c.x + side * (40 + rand() * 50), Math.max(seaY + h / 2 - 20, c.y - 120 + rand() * 60), c.z - 10 + rand() * 20);
      this.group.add(g);
    }

    // Golden coins tumbling down through hell's sky.
    const coinGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.22, 24);
    const coinMat = new THREE.MeshToonMaterial({ color: 0xffcf3a, emissive: 0x4a2a00 });
    this.coins = new THREE.InstancedMesh(coinGeo, coinMat, 40);
    for (let k = 0; k < 40; k++) {
      const c = along(rand());
      const side = rand() < 0.5 ? -1 : 1;
      this.coinData.push({
        p: new THREE.Vector3(c.x + side * (16 + rand() * 50), c.y + 20 + rand() * 60, c.z + (rand() - 0.5) * 40),
        spin: new THREE.Vector3(rand() * 2, rand() * 3, rand()),
        rot: new THREE.Euler(rand() * 6, rand() * 6, rand() * 6),
        fall: 2 + rand() * 4,
      });
    }
    this.group.add(this.coins);

    // Neon billboards bolted onto the canyon tops: hell's ad space.
    const jokes: [string, string][] = [
      ['WAGMI', '#39f0b0'], ['NGMI', '#ff2a4d'], ['HODL', '#ffcf3a'], ['FUD', '#a259ff'], ['THIS IS FINE', '#ff8a3a'],
      ['BUY THE DIP', '#ff2a4d'], ['-99.9%', '#ff2a4d'], ['FEW', '#39f0b0'], ['GM', '#ff4fd8'], ['REKT', '#ff2a4d'],
      ['LIQUIDATED', '#ff8a3a'], ['NUMBER GO DOWN', '#ff2a4d'],
    ];
    jokes.forEach(([text, color], k) => {
      const t = 0.05 + (k / jokes.length) * (opts.fallStart - 0.08);
      const c = along(t);
      const next = along(Math.min(1, t + 0.02));
      const f = next.clone().sub(c).setY(0).normalize();
      const r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
      const side = k % 2 ? 1 : -1;
      const tex = signTexture(text, { color, glow: color, stroke: '#0b0410', width: 512, height: 160, background: 'rgba(11,4,16,0.75)', border: color });
      const board = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.2), neon(tex, 1.7));
      board.position.copy(c).addScaledVector(r, side * 9.5).add(new THREE.Vector3(0, 11, 0));
      // Face back up the track, toward the camera chasing Emonad.
      board.lookAt(board.position.clone().sub(f).addScaledVector(r, -side * 0.6));
      this.group.add(board);
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6, 0.3), new THREE.MeshToonMaterial({ color: 0x1a1018 }));
      pole.position.copy(board.position).add(new THREE.Vector3(0, -4, 0));
      this.group.add(pole);
    });
  }

  update(time: number, dt: number): void {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    this.coinData.forEach((c, k) => {
      c.rot.x += c.spin.x * dt; c.rot.y += c.spin.y * dt; c.rot.z += c.spin.z * dt;
      c.p.y -= c.fall * dt;
      if (c.p.y < this.seaY) c.p.y += 330;
      m.compose(c.p, q.setFromEuler(c.rot), new THREE.Vector3(1, 1, 1));
      this.coins.setMatrixAt(k, m);
    });
    this.coins.instanceMatrix.needsUpdate = true;
    this.flames.forEach((f, k) => {
      const s = 1 + Math.sin(time * 9 + k * 1.7) * 0.12 + Math.sin(time * 23 + k) * 0.05;
      f.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
    });
  }
}
