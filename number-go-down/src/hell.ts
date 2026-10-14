import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { signTexture } from './textures';
import { neon } from './materials';
import { MATS, surf } from './look';
import type { Flames } from './props';

// Hell's set dressing: lava, the sky, the blood moon and the scenery that
// sells the scale of the descent. Everything is procedural.

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
    float edge = c.y - c.x;
    // Heat varies over large areas: mostly black crust, with hot regions where it all glows.
    float heat = vnoise(p * 0.07 - t * 0.03) * 0.65 + vnoise(p * 0.19 + 3.1) * 0.35;
    float hotZone = smoothstep(0.42, 0.74, heat);
    float crack = (1.0 - smoothstep(0.0, 0.04 + 0.1 * hotZone, edge)) * (0.2 + 0.8 * hotZone);
    // Molten rivers winding through the crust.
    float r = abs(sin(vnoise(p * 0.045 + w * 0.08) * 11.0 + t * 0.25));
    float river = (1.0 - smoothstep(0.0, 0.1, r)) * smoothstep(0.3, 0.6, heat);
    float pulse = 0.8 + 0.2 * sin(t * 1.7 + heat * 9.0);
    vec3 crust = mix(vec3(0.018, 0.004, 0.006), vec3(0.075, 0.02, 0.014), c.x);
    vec3 glow = mix(vec3(1.1, 0.12, 0.01), vec3(3.2, 1.3, 0.3), hotZone) * pulse;
    float pool = smoothstep(0.8, 0.92, heat) * smoothstep(0.22, 0.0, c.x);
    return mix(crust, glow, clamp(max(max(crack, river * 0.9), pool), 0.0, 1.0));
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

// ------------------------------------------------------------------ liquidity

let liqMat: THREE.ShaderMaterial | null = null;

/** Whale Waters: a glossy pool of liquidity. Caustic ripples, a sky reflection, sees through to the road. */
export function liquidityMaterial(): THREE.ShaderMaterial {
  if (liqMat) return liqMat;
  liqMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec3 vWorld; varying vec3 vNormalW; varying vec3 vView;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; vNormalW = normalize(mat3(modelMatrix) * normal); vView = cameraPosition - w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float time; varying vec3 vWorld; varying vec3 vNormalW; varying vec3 vView;
      float h(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
      float n(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(h(i), h(i + vec2(1, 0)), u.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), u.x), u.y); }
      void main() {
        vec2 p = vWorld.xz * 0.5;
        float t = time;
        // Two layers of drifting ripples; their crossing makes caustic lines.
        float a = n(p * 1.3 + vec2(t * 0.25, t * 0.1));
        float b = n(p * 1.9 - vec2(t * 0.15, t * 0.3) + 5.0);
        float caustic = pow(1.0 - abs(a - b), 9.0);
        vec3 V = normalize(vView);
        float fres = pow(1.0 - max(0.0, dot(normalize(vNormalW), V)), 3.0);
        vec3 deep = vec3(0.02, 0.05, 0.22);
        vec3 sky = vec3(0.35, 0.12, 0.55);
        vec3 c = mix(deep, sky, fres * 0.7) + vec3(0.35, 0.9, 1.3) * caustic * 0.9;
        // A soft glow where the neon rims would reflect.
        c += vec3(0.1, 0.5, 0.9) * fres * 0.4;
        float alpha = 0.55 + fres * 0.35;
        gl_FragColor = vec4(c, alpha);
      }`,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  return liqMat;
}

export function tickLiquidity(time: number): void {
  if (liqMat) liqMat.uniforms.time.value = time;
}

// ------------------------------------------------------------------ sky

export const SUN_DIR = new THREE.Vector3(0.15, 0.2, -1).normalize();

export function createSky(): THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial> {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      top: { value: new THREE.Color(0x2fd6a6) },
      horizon: { value: new THREE.Color(0xffc24a) },
      below: { value: new THREE.Color(0x1a0204) },
      time: { value: 0 },
      hell: { value: 0 },
      flash: { value: 0 },
      sunDir: { value: SUN_DIR.clone() },
    },
    vertexShader: `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 below; uniform float time; uniform float hell; uniform float flash; uniform vec3 sunDir; varying vec3 vDir;
      float h(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
      float n(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(h(i), h(i + vec2(1, 0)), u.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), u.x), u.y); }
      float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * n(p); p = p * 2.07 + 1.7; a *= 0.5; } return s; }
      void main() {
        vec3 d = normalize(vDir);
        float y = d.y;
        vec3 c = y > 0.0 ? mix(horizon, top, pow(smoothstep(0.0, 0.8, y), 0.65)) : mix(horizon, below, smoothstep(0.0, -0.3, y));
        c += horizon * 0.5 * exp(-abs(y) * 12.0);
        // Two layers of smoke rolling across hell's sky at different speeds (parallax).
        vec2 uv = d.xz / (abs(y) + 0.22);
        float cl1 = fbm(uv * 1.4 + vec2(time * 0.018, time * 0.008));
        float cl2 = fbm(uv * 2.6 + vec2(-time * 0.03, time * 0.012) + 9.0);
        float band = smoothstep(-0.05, 0.3, y) * (1.0 - smoothstep(0.45, 0.95, y));
        float smokeAmt = smoothstep(0.38, 0.72, cl1 * 0.65 + cl2 * 0.35) * band;
        vec3 smokeCol = mix(vec3(0.02, 0.0, 0.01), horizon * 0.5, cl2);
        // Smoke edges catch the lava light from below.
        smokeCol += horizon * 0.35 * pow(1.0 - smokeAmt, 2.0) * smokeAmt;
        c = mix(c, smokeCol, smokeAmt * 0.9 * hell);
        // The blood moon in eclipse: a black disc with a burning corona.
        float a = acos(clamp(dot(d, sunDir), -1.0, 1.0));
        float disc = 1.0 - smoothstep(0.085, 0.09, a);
        float corona = exp(-(a - 0.088) * 22.0) * step(0.088, a);
        float rays = 0.6 + 0.4 * sin(atan(d.y - sunDir.y, d.x - sunDir.x) * 9.0 + time * 0.7);
        vec3 moon = vec3(2.8, 0.55, 0.25) * corona * (0.75 + 0.25 * rays);
        c = mix(c + moon * hell, vec3(0.01, 0.0, 0.0), disc * hell);
        // Lightning: the whole sky blinks white-violet, strongest near the horizon.
        c += vec3(0.9, 0.7, 1.2) * flash * (0.35 + 0.65 * exp(-abs(y) * 4.0));
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

/**
 * The eclipse corona as a real mesh, for the god-rays pass: a bright ring far
 * away along the sun direction. It follows the camera like the sky does.
 */
export function createMoon(): THREE.Mesh {
  const g = new THREE.Group();
  void g;
  const ring = new THREE.Mesh(new THREE.RingGeometry(66, 78, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff5a2a).multiplyScalar(1.6), toneMapped: false, fog: false, depthWrite: false, side: THREE.DoubleSide }));
  ring.renderOrder = -9;
  ring.frustumCulled = false;
  return ring;
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

// ------------------------------------------------------------------ scenery

export interface SceneryOptions {
  pathPoints: THREE.Vector3[];
  seaY: number;
  /** A hole in the lava sea where The Fall's shaft goes through it. */
  hole: THREE.Vector3;
  holeRadius: number;
  /** Fraction of the path where The Fall begins (no billboards past it). */
  fallStart: number;
  flames: Flames;
}

const _flameScale = new THREE.Vector3();

/** Distant spires, burning candle towers, tumbling coins, joke billboards, and the crash chart. */
export class Scenery {
  group = new THREE.Group();
  private coins: THREE.InstancedMesh;
  private coinData: { p: THREE.Vector3; spin: THREE.Vector3; rot: THREE.Euler; fall: number }[] = [];
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
    // Keep set dressing out of the way of the course (and its camera).
    const clear = (x: number, z: number, r: number) => path.every((q) => (q.x - x) ** 2 + (q.z - z) ** 2 > r * r);

    // Lava sea, with a hole for the shaft.
    const seaY = opts.seaY;
    const sea = new THREE.Mesh(new THREE.RingGeometry(opts.holeRadius, 1400, 64, 4), lavaMaterial());
    sea.rotation.x = -Math.PI / 2;
    sea.position.set(opts.hole.x, seaY, opts.hole.z);
    this.group.add(sea);
    this.seaY = seaY;

    // Rock spires: black silhouettes rising out of the lava, lit from below. One draw call.
    const spireMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    const spireGeos: THREE.BufferGeometry[] = [];
    const hotBase = new THREE.Color(0xff4a12);
    const cold = new THREE.Color(0x120608);
    for (let k = 0; k < 52; k++) {
      const t = rand() * opts.fallStart;
      const c = along(t);
      const side = k % 2 ? 1 : -1;
      const dist = 30 + rand() * 160;
      const h = 60 + rand() * 280;
      const r = 4 + rand() * 15;
      const geo = new THREE.ConeGeometry(r, h, 7, 8);
      const pos = geo.attributes.position;
      const cols = new Float32Array(pos.count * 3);
      const col = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const j = (smooth3(pos.getX(i) * 0.3, y * 0.08 + k, pos.getZ(i) * 0.3) - 0.5) * r * 0.6;
        pos.setX(i, pos.getX(i) + j);
        pos.setZ(i, pos.getZ(i) - j * 0.6);
        const up = (y + h / 2) / h;
        col.copy(hotBase).lerp(cold, Math.min(1, Math.pow(up * 3.2, 0.7))).multiplyScalar(1 + (1 - Math.min(1, up * 4)) * 0.8);
        cols.set([col.r, col.g, col.b], i * 3);
      }
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      const x = c.x + side * dist;
      const z = c.z + (rand() - 0.5) * 60;
      if (!clear(x, z, r + 16)) { geo.dispose(); continue; }
      geo.rotateY(rand() * Math.PI);
      geo.translate(x, seaY + h / 2 - 10, z);
      spireGeos.push(geo);
    }
    if (spireGeos.length) this.group.add(new THREE.Mesh(mergeGeometries(spireGeos), spireMat));

    // Burning candle towers: giant red candles with wax rivers down their sides and fire on their wicks.
    const candleMat = MATS.wax(0x9c0a22, 0x2a0006);
    const towerGeos: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 16; k++) {
      const c = along(0.05 + (k / 16) * opts.fallStart);
      const side = k % 2 ? 1 : -1;
      const w = 6 + rand() * 7;
      const h = 90 + rand() * 170;
      const pos = new THREE.Vector3(c.x + side * (38 + rand() * 50), Math.max(seaY + h / 2 - 20, c.y - 120 + rand() * 60), c.z - 10 + rand() * 20);
      if (!clear(pos.x, pos.z, w + 18)) continue;
      const body = new THREE.BoxGeometry(w, h, w);
      body.translate(pos.x, pos.y, pos.z);
      towerGeos.push(body);
      for (let d = 0; d < 3; d++) {
        const len = h * (0.2 + rand() * 0.4);
        const drip = new THREE.CapsuleGeometry(w * 0.08, len, 3, 8);
        const a = rand() * Math.PI * 2;
        drip.translate(pos.x + Math.cos(a) * w * 0.52, pos.y + h / 2 - len / 2, pos.z + Math.sin(a) * w * 0.52);
        towerGeos.push(drip);
      }
      const wick = new THREE.BoxGeometry(1, h * 0.1, 1);
      wick.translate(pos.x, pos.y + h / 2 + h * 0.05, pos.z);
      towerGeos.push(wick);
      opts.flames.add(new THREE.Vector3(pos.x, pos.y + h / 2 + h * 0.1, pos.z), w * 0.9);
    }
    if (towerGeos.length) this.group.add(new THREE.Mesh(mergeGeometries(towerGeos), candleMat));

    // The crash chart: a colossal neon price line plunging across hell's sky.
    const end = path[path.length - 1];
    const pts: THREE.Vector3[] = [];
    let y = end.y + 420;
    for (let k = 0; k <= 36; k++) {
      y += (k % 3 === 0 ? 22 : -34) * (0.6 + ((k * 37) % 10) / 12);
      pts.push(new THREE.Vector3(end.x - 330 + k * 19, Math.max(end.y - 40, y - k * 4), end.z - 360 - k * 4));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0);
    const chartMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff2a4d).multiplyScalar(2.4), toneMapped: false, fog: false });
    this.group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 360, 2.2, 6, false), chartMat));
    const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff2a4d).multiplyScalar(0.5), toneMapped: false, fog: false, transparent: true, opacity: 0.35, depthWrite: false });
    this.group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 360, 6, 6, false), glowMat));
    const last = pts[pts.length - 1];
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(90, 28), neon(signTexture('-99.9%', { color: '#ff2a4d', glow: '#ff2a4d', stroke: '#1a0006', width: 512, height: 160 }), 2.2));
    (tag.material as THREE.MeshBasicMaterial).fog = false;
    tag.position.copy(last).add(new THREE.Vector3(30, -30, 0));
    tag.lookAt(path[0].clone().setY(tag.position.y));
    this.group.add(tag);

    // Golden coins tumbling down through hell's sky.
    const coinGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.22, 24);
    this.coins = new THREE.InstancedMesh(coinGeo, MATS.gold(), 48);
    for (let k = 0; k < 48; k++) {
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

    // Neon billboards on long poles out of the abyss: hell's ad space.
    const jokes: [string, string][] = [
      ['WAGMI', '#39f0b0'], ['NGMI', '#ff2a4d'], ['HODL', '#ffcf3a'], ['FUD', '#a259ff'], ['THIS IS FINE', '#ff8a3a'],
      ['BUY THE DIP', '#ff2a4d'], ['-99.9%', '#ff2a4d'], ['FEW', '#39f0b0'], ['GM', '#ff4fd8'], ['REKT', '#ff2a4d'],
      ['LIQUIDATED', '#ff8a3a'], ['NUMBER GO DOWN', '#ff2a4d'],
    ];
    const poles: THREE.BufferGeometry[] = [];
    jokes.forEach(([text, color], k) => {
      const t = 0.05 + (k / jokes.length) * (opts.fallStart - 0.08);
      const c = along(t);
      const next = along(Math.min(1, t + 0.02));
      const f = next.clone().sub(c).setY(0).normalize();
      const r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
      const side = k % 2 ? 1 : -1;
      const tex = signTexture(text, { color, glow: color, stroke: '#0b0410', width: 512, height: 160, background: 'rgba(11,4,16,0.75)', border: color });
      const board = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.2), neon(tex, 1.7));
      board.position.copy(c).addScaledVector(r, side * 10).add(new THREE.Vector3(0, 11, 0));
      // Face back up the track, toward the camera chasing Emonad.
      board.lookAt(board.position.clone().sub(f).addScaledVector(r, -side * 0.6));
      this.group.add(board);
      const pole = new THREE.BoxGeometry(0.35, 44, 0.35);
      pole.translate(board.position.x, board.position.y - 23, board.position.z);
      poles.push(pole);
    });
    this.group.add(new THREE.Mesh(mergeGeometries(poles), surf({ color: 0x14080e, roughness: 0.7, metalness: 0.6, rim: 0.4 })));
    void _flameScale;
  }

  update(time: number, dt: number): void {
    void time;
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
  }
}
