import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MATS, neonMat, surf } from './look';
import { signTexture } from './textures';
import { neon } from './materials';

// Hero props, all procedural. Every prop is a Group of meshes sharing the
// material library, so the static batcher can fold them into a few draw calls.

const UP = new THREE.Vector3(0, 1, 0);

/** Make a lathe face outward (its winding depends on the profile's direction). */
function outwardWinding(geo: THREE.BufferGeometry, axis: 'x' | 'y'): void {
  geo.computeVertexNormals();
  const pos = geo.attributes.position;
  const nrm = geo.attributes.normal;
  let agree = 0;
  for (let i = 0; i < pos.count; i++) {
    const radial = axis === 'x' ? [0, pos.getY(i), pos.getZ(i)] : [pos.getX(i), 0, pos.getZ(i)];
    agree += Math.sign(radial[0] * nrm.getX(i) + radial[1] * nrm.getY(i) + radial[2] * nrm.getZ(i));
  }
  if (agree >= 0) return;
  const index = geo.index!;
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i + 1);
    index.setX(i + 1, index.getX(i + 2));
    index.setX(i + 2, a);
  }
  index.needsUpdate = true;
  geo.computeVertexNormals();
}

/**
 * Merge a prop's meshes per material (transforms baked), so a whale or a bull
 * is a handful of draw calls instead of thirty. Instanced meshes are kept.
 */
export function compact(g: THREE.Group): THREE.Group {
  g.updateMatrixWorld(true);
  const inv = g.matrixWorld.clone().invert();
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const remove: THREE.Object3D[] = [];
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || (m as unknown as THREE.InstancedMesh).isInstancedMesh || Array.isArray(m.material)) return;
    const geo = m.geometry.clone().applyMatrix4(inv.clone().multiply(m.matrixWorld));
    const list = buckets.get(m.material) ?? [];
    list.push(geo);
    buckets.set(m.material, list);
    remove.push(m);
  });
  for (const o of remove) o.removeFromParent();
  for (const [mat, geos] of buckets) {
    const names = Object.keys(geos[0].attributes).filter((n) => geos.every((x) => n in x.attributes));
    const indexed = geos.every((x) => x.index);
    const ready = geos.map((x) => {
      const y = indexed ? x : x.toNonIndexed();
      for (const n of Object.keys(y.attributes)) if (!names.includes(n)) y.deleteAttribute(n);
      return y;
    });
    const merged = ready.length === 1 ? ready[0] : mergeGeometries(ready);
    if (merged) g.add(new THREE.Mesh(merged, mat));
  }
  return g;
}

let shared: {
  wax: THREE.MeshStandardMaterial; waxGreen: THREE.MeshStandardMaterial; waxDark: THREE.MeshStandardMaterial;
  wick: THREE.MeshStandardMaterial; gold: THREE.MeshStandardMaterial; chrome: THREE.MeshStandardMaterial;
  iron: THREE.MeshStandardMaterial; hazard: THREE.MeshStandardMaterial; bone: THREE.MeshStandardMaterial;
  stone: THREE.MeshStandardMaterial; ink: THREE.MeshStandardMaterial; whale: THREE.MeshStandardMaterial;
  eye: THREE.MeshStandardMaterial; glint: THREE.MeshBasicMaterial;
} | null = null;

export function propMats() {
  if (shared) return shared;
  shared = {
    wax: MATS.wax(),
    waxGreen: MATS.waxGreen(),
    waxDark: MATS.wax(0x5a0616, 0x1a0004),
    wick: surf({ color: 0x1a0a12, roughness: 0.9, rim: 0.3 }),
    gold: MATS.gold(),
    chrome: MATS.chrome(),
    iron: MATS.iron(),
    hazard: MATS.hazard(),
    bone: MATS.bone(),
    stone: MATS.stone(),
    ink: MATS.ink(),
    whale: MATS.whale(),
    eye: surf({ color: 0x0b0410, roughness: 0.2, metalness: 0.1, rim: 0.2 }),
    glint: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  };
  return shared;
}

// ------------------------------------------------------------------ flames

/**
 * Every flame in the world is one instanced mesh of camera-facing quads with
 * an animated noise shader: candle tips, braziers, torches.
 */
export class Flames {
  readonly mesh: THREE.InstancedMesh;
  private count = 0;
  private uniforms = { uTime: { value: 0 }, uCamRight: { value: new THREE.Vector3(1, 0, 0) }, uCamUp: { value: new THREE.Vector3(0, 1, 0) } };

  constructor(scene: THREE.Scene, max = 400) {
    const geo = new THREE.PlaneGeometry(1, 1.6);
    geo.translate(0, 0.6, 0);
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        uniform vec3 uCamRight; uniform vec3 uCamUp;
        varying vec2 vUv; varying float vSeed;
        void main() {
          vUv = uv;
          // Instance translation and scale, billboarded toward the camera.
          vec3 origin = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
          float sx = length(instanceMatrix[0].xyz);
          float sy = length(instanceMatrix[1].xyz);
          vSeed = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.11;
          vec3 world = origin + uCamRight * (position.x * sx) + uCamUp * (position.y * sy);
          gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
        }`,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv; varying float vSeed;
        float h(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
        float n(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1, 0)), u.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), u.x), u.y); }
        void main() {
          vec2 uv = vUv;
          float t = uTime * 2.2 + vSeed * 10.0;
          // Rising noise narrows the flame toward the tip and makes it lick.
          float nz = n(vec2(uv.x * 3.0 + vSeed, uv.y * 4.0 - t)) * 0.6 + n(vec2(uv.x * 7.0, uv.y * 9.0 - t * 1.7)) * 0.4;
          float width = mix(0.42, 0.06, pow(uv.y, 0.9)) * (0.8 + 0.4 * nz);
          float d = abs(uv.x - 0.5 + (nz - 0.5) * 0.25 * uv.y);
          float body = 1.0 - smoothstep(width * 0.6, width, d);
          float core = 1.0 - smoothstep(0.0, width * 0.45, d);
          float fade = smoothstep(0.0, 0.12, uv.y) * (1.0 - smoothstep(0.7, 1.0, uv.y + nz * 0.15));
          vec3 col = mix(vec3(1.6, 0.3, 0.04), vec3(2.2, 1.1, 0.25), core) * body;
          col += vec3(1.4, 1.0, 0.5) * core * core * 0.5;
          float a = body * fade;
          if (a < 0.02) discard;
          gl_FragColor = vec4(col, a);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.InstancedMesh(geo, mat, max);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 6;
    scene.add(this.mesh);
  }

  add(p: THREE.Vector3, size = 1): void {
    if (this.count >= this.mesh.instanceMatrix.count) return;
    size = Math.min(size, 7);
    const m = new THREE.Matrix4().compose(p, new THREE.Quaternion(), new THREE.Vector3(size, size, size));
    this.mesh.setMatrixAt(this.count++, m);
    this.mesh.count = this.count;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  update(time: number, camera: THREE.Camera): void {
    this.uniforms.uTime.value = time;
    const m = camera.matrixWorld.elements;
    this.uniforms.uCamRight.value.set(m[0], m[1], m[2]).normalize();
    this.uniforms.uCamUp.value.set(m[4], m[5], m[6]).normalize();
  }
}

// ------------------------------------------------------------------ candles

export interface CandleOptions {
  w: number; h: number; d: number;
  color?: 'red' | 'green' | 'dark';
  wick?: number; // wick height above the top (0 = none)
  drips?: number; // how many wax drips hang off the top edge
  seed?: number;
  flame?: Flames | null;
  topGlow?: THREE.ColorRepresentation;
}

/** A chart candle you can hit: a beveled wax block with drips, a wick and a flame. */
export function candle(o: CandleOptions): THREE.Group {
  const m = propMats();
  const g = new THREE.Group();
  const mat = o.color === 'green' ? m.waxGreen : o.color === 'dark' ? m.waxDark : m.wax;
  const r = Math.min(o.w, o.d) * 0.14;
  g.add(new THREE.Mesh(new RoundedBoxGeometry(o.w, o.h, o.d, 2, r), mat));
  let seed = (o.seed ?? 1) * 13 + 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const drips = o.drips ?? Math.round(2 + rand() * 3);
  const dripGeos: THREE.BufferGeometry[] = [];
  for (let i = 0; i < drips; i++) {
    // A drip: a thin tongue of wax running down one face from the top edge.
    const side = Math.floor(rand() * 4);
    const along = (rand() - 0.5) * 0.8;
    const len = o.h * (0.15 + rand() * 0.35);
    const rad = 0.05 + rand() * 0.05 * Math.min(1, o.w);
    const drip = new THREE.CapsuleGeometry(rad, len, 3, 8);
    drip.translate(0, o.h / 2 - len / 2 - rad, 0);
    const blob = new THREE.SphereGeometry(rad * 1.5, 8, 6);
    blob.translate(0, o.h / 2 - len - rad, 0);
    for (const geo of [drip, blob]) {
      if (side === 0) geo.translate(along * o.w, 0, o.d / 2 + rad * 0.5);
      else if (side === 1) geo.translate(along * o.w, 0, -o.d / 2 - rad * 0.5);
      else if (side === 2) geo.translate(o.w / 2 + rad * 0.5, 0, along * o.d);
      else geo.translate(-o.w / 2 - rad * 0.5, 0, along * o.d);
      dripGeos.push(geo);
    }
  }
  if (dripGeos.length) g.add(new THREE.Mesh(mergeGeometries(dripGeos), mat));
  // A molten pool on top: a lighter, glossier inset.
  const pool = new THREE.Mesh(new THREE.BoxGeometry(o.w * 0.84, 0.04, o.d * 0.84), neonMat(o.topGlow ?? (o.color === 'green' ? 0x3fd8a0 : 0xff4a3a), 0.55));
  pool.position.y = o.h / 2 + 0.01;
  g.add(pool);
  const wick = o.wick ?? 0;
  if (wick > 0) {
    const wr = Math.min(0.09, o.w * 0.07);
    const wk = new THREE.Mesh(new THREE.CylinderGeometry(wr, wr * 1.2, wick, 8), m.wick);
    wk.position.y = o.h / 2 + wick / 2;
    g.add(wk);
    o.flame?.add(new THREE.Vector3(0, o.h / 2 + wick, 0), Math.max(0.5, Math.min(2.2, o.w * 0.9)));
  }
  return compact(g);
}

// ------------------------------------------------------------------ whale

/** A proper whale: lathed body with a white belly, flukes, fins and a grin. */
export function whale(scale = 1): THREE.Group {
  const m = propMats();
  const g = new THREE.Group();
  // Body profile from nose (+x) to tail (-x), lathed around x.
  const profile: [number, number][] = [[2.4, 0.02], [2.3, 0.45], [2.0, 0.78], [1.4, 1.0], [0.6, 1.05], [-0.3, 0.95], [-1.1, 0.7], [-1.8, 0.42], [-2.3, 0.26], [-2.6, 0.2]];
  const pts = profile.map(([x, r]) => new THREE.Vector2(r, x));
  const body = new THREE.LatheGeometry(pts, 28);
  body.rotateZ(-Math.PI / 2);
  outwardWinding(body, 'x');
  // Vertex colours: deep blue above, white belly below, with a soft seam.
  const pos = body.attributes.position;
  const cols = new Float32Array(pos.count * 3);
  const blue = new THREE.Color(0x2f6cf0);
  const belly = new THREE.Color(0xe8f0ff);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const k = THREE.MathUtils.smoothstep(y, -0.55, -0.15);
    c.copy(belly).lerp(blue, k);
    cols.set([c.r, c.g, c.b], i * 3);
  }
  body.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  g.add(new THREE.Mesh(body, m.whale));
  // Tail flukes: two flattened wedges.
  const flukeMat = surf({ color: 0x2f6cf0, roughness: 0.4, rim: 1 });
  for (const s of [-1, 1]) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.5, 4), flukeMat);
    f.scale.set(1, 1, 0.22);
    f.rotation.z = Math.PI / 2 + s * 0.95;
    f.position.set(-2.75, 0.08, s * 0.5);
    f.rotation.x = Math.PI / 2;
    g.add(f);
  }
  // Dorsal and pectoral fins.
  const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 4), flukeMat);
  dorsal.scale.set(1, 1, 0.3);
  dorsal.position.set(-0.4, 1.1, 0);
  dorsal.rotation.z = -0.5;
  g.add(dorsal);
  for (const s of [-1, 1]) {
    const pec = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.1, 4), flukeMat);
    pec.scale.set(1, 1, 0.25);
    pec.position.set(0.9, -0.55, s * 0.95);
    pec.rotation.set(s * 0.9, 0, 1.3);
    g.add(pec);
  }
  // Eyes with a glint, and a long grin.
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), m.eye);
    eye.position.set(1.55, 0.25, s * 0.72);
    g.add(eye);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), m.glint);
    glint.position.set(1.62, 0.31, s * 0.78);
    g.add(glint);
  }
  const grin = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.04, 6, 24, Math.PI * 0.9), m.eye);
  grin.position.set(1.65, -0.1, 0);
  grin.rotation.set(0, Math.PI / 2, Math.PI + 0.45);
  g.add(grin);
  compact(g);
  g.scale.setScalar(scale);
  return g;
}

// ------------------------------------------------------------------ machinery

/** A LIQUIDATED piston: a hazard-striped ram on a chrome rod out of an iron housing. */
export function piston(len = 4): THREE.Group {
  const m = propMats();
  const g = new THREE.Group();
  const head = new THREE.Mesh(new RoundedBoxGeometry(2.8, 1.6, 2.4, 2, 0.18), m.hazard);
  g.add(head);
  const face = new THREE.Mesh(new RoundedBoxGeometry(2.4, 1.3, 0.3, 2, 0.08), m.iron);
  face.position.z = 1.25;
  g.add(face);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, len, 16), m.chrome);
  rod.rotation.z = Math.PI / 2;
  rod.position.x = -len / 2 - 1.2;
  g.add(rod);
  for (const y of [-0.5, 0.5]) {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8), m.chrome);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(1.0, y, 1.42);
    g.add(bolt);
  }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), neon(signTexture('LIQUIDATED', { color: '#fff7f2', stroke: '#3a0010' }), 1.4));
  sign.position.set(0, 0.84, 0);
  sign.rotation.x = -Math.PI / 2;
  g.add(sign);
  return compact(g);
}

/** A SELL WALL blade: a long red beam, chrome hub, hazard tips. */
export function blade(len: number): THREE.Group {
  const m = propMats();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(len, 0.7, 0.9, 2, 0.12), m.waxDark));
  for (const s of [-1, 1]) {
    const tip = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.76, 0.96, 2, 0.1), m.hazard);
    tip.position.x = s * (len / 2 - 0.6);
    g.add(tip);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.5, 20), m.chrome);
  g.add(hub);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.55), neon(signTexture('SELL WALL', { color: '#fff7f2', stroke: '#3a0010' }), 1.3));
  sign.position.set(len * 0.25, 0, 0.47);
  g.add(sign);
  const sign2 = sign.clone();
  sign2.position.set(-len * 0.25, 0, -0.47);
  sign2.rotation.y = Math.PI;
  g.add(sign2);
  return compact(g);
}

// ------------------------------------------------------------------ the bull

/** The golden bull: a charging statue on a plinth. Smash into it for the BULL TRAP. */
export function bull(): THREE.Group {
  const m = propMats();
  const g = new THREE.Group();
  const gold = m.gold;
  // Plinth.
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(3.6, 0.8, 2.2, 2, 0.1), m.stone);
  plinth.position.y = 0.4;
  g.add(plinth);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.08, 2.3), neonMat(0xffcf3a, 1.8));
  trim.position.y = 0.82;
  g.add(trim);
  // Body: a big barrel, chest forward.
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), gold);
  body.scale.set(1.5, 1.0, 0.95);
  body.position.set(-0.2, 1.95, 0);
  g.add(body);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.95, 20, 14), gold);
  chest.scale.set(1.1, 1.05, 1.0);
  chest.position.set(0.9, 2.05, 0);
  g.add(chest);
  // Head, lowered to charge.
  const head = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.9, 0.8, 2, 0.25), gold);
  head.position.set(1.85, 1.55, 0);
  head.rotation.z = 0.35;
  g.add(head);
  const snout = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.5, 0.6, 2, 0.18), gold);
  snout.position.set(2.35, 1.25, 0);
  g.add(snout);
  // Horns: curved tubes.
  for (const s of [-1, 1]) {
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(1.7, 1.95, s * 0.35), new THREE.Vector3(1.9, 2.6, s * 0.9), new THREE.Vector3(2.5, 2.9, s * 0.6));
    const horn = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.12, 8, false), m.bone);
    g.add(horn);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), m.bone);
    tip.position.set(2.5, 2.9, s * 0.6);
    g.add(tip);
    // Eyes: burning.
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), neonMat(0xff2a4d, 2.6));
    eye.position.set(2.3, 1.75, s * 0.3);
    g.add(eye);
    // Legs: front braced, back planted.
    for (const [x, z] of [[1.0, s * 0.45], [-0.9, s * 0.45]] as const) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 1.3, 10), gold);
      leg.position.set(x, 1.15, z);
      leg.rotation.z = x > 0 ? -0.25 : 0.15;
      g.add(leg);
      const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.2, 10), m.iron);
      hoof.position.set(x + (x > 0 ? 0.15 : -0.1), 0.9, z);
      g.add(hoof);
    }
  }
  // Tail.
  const tail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-1.6, 2.3, 0), new THREE.Vector3(-2.3, 2.5, 0.2), new THREE.Vector3(-2.4, 1.7, 0.1)), 8, 0.06, 6, false), gold);
  g.add(tail);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.7), neon(signTexture('BULL TRAP', { color: '#ffcf3a', glow: '#ffcf3a', stroke: '#2a1400' }), 1.6));
  sign.position.set(0, 0.45, 1.16);
  g.add(sign);
  return compact(g);
}

// ------------------------------------------------------------------ gates

/** The Gates of Hell: skull-capped pillars, chains, braziers, and the sign. */
export function gatesOfHell(flames: Flames | null, at: THREE.Vector3, q: THREE.Quaternion): THREE.Group {
  const m = propMats();
  const g = new THREE.Group();
  const halfSpan = 7.2;
  const height = 16;
  for (const side of [-1, 1]) {
    // A stacked, tapering pillar of carved stone.
    const pillar = new THREE.Group();
    for (let k = 0; k < 5; k++) {
      const w = 1.9 - k * 0.12;
      const block = new THREE.Mesh(new RoundedBoxGeometry(w, 3.0, w, 2, 0.12), m.stone);
      block.position.y = k * 3.0 + 1.5;
      block.rotation.y = (k % 2) * 0.12;
      pillar.add(block);
      const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.12, w + 0.1), neonMat(0xff2a4d, 1.4));
      band.position.y = k * 3.0 + 3.0;
      pillar.add(band);
    }
    // Skull on top.
    const skull = skullHead(1.1);
    skull.position.y = height + 0.6;
    pillar.add(skull);
    // Brazier.
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.4, 0.6, 12), m.iron);
    bowl.position.set(side * 1.6, height - 1.2, 0);
    pillar.add(bowl);
    pillar.position.x = side * halfSpan;
    g.add(pillar);
    if (flames) {
      const p = new THREE.Vector3(side * (halfSpan + side * 1.6), height - 0.9, 0).applyQuaternion(q).add(at);
      flames.add(p, 2.4);
    }
  }
  // Lintel with the sign, and horns.
  const lintel = new THREE.Mesh(new RoundedBoxGeometry(halfSpan * 2 + 2.2, 2.0, 1.6, 2, 0.15), m.stone);
  lintel.position.y = height - 1;
  g.add(lintel);
  const lintelTrim = new THREE.Mesh(new THREE.BoxGeometry(halfSpan * 2 + 2.3, 0.1, 1.7), neonMat(0xff2a4d, 1.4));
  lintelTrim.position.y = height - 1.95;
  g.add(lintelTrim);
  for (const side of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.45, 3.0, 8), m.bone);
    horn.position.set(side * 3.2, height + 1.2, 0);
    horn.rotation.z = -side * 0.55;
    g.add(horn);
  }
  const tex = signTexture('ABANDON ALL HOPE\nYE WHO BUY THE TOP', { color: '#ff2a4d', glow: '#ff2a4d', stroke: '#1a0006', width: 1024, height: 240 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 2.9), neon(tex, 1.9));
  sign.position.set(0, height - 1, 0.9);
  g.add(sign);
  // Chains hanging in catenaries across the opening.
  const chainMat = m.iron;
  for (const [y0, sag, z] of [[height - 2.4, 2.2, 0.3], [height - 2.6, 3.4, -0.4]] as const) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push(new THREE.Vector3(-halfSpan + t * halfSpan * 2, y0 - Math.sin(t * Math.PI) * sag, z));
    }
    const chain = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.09, 6, false), chainMat);
    g.add(chain);
  }
  g.position.copy(at);
  g.quaternion.copy(q);
  return g;
}

/** A skull: cranium, jaw, sockets with burning eyes, nasal cavity, teeth. */
export function skullHead(size = 1): THREE.Group {
  const m = propMats();
  const g = new THREE.Group();
  const cranium = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), m.bone);
  cranium.scale.set(1, 1.05, 1.1);
  g.add(cranium);
  const jaw = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.8, 1.1, 2, 0.3), m.bone);
  jaw.position.set(0, -0.75, 0.25);
  g.add(jaw);
  for (const s of [-1, 1]) {
    const socket = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), m.ink);
    socket.position.set(s * 0.4, 0.1, 0.85);
    g.add(socket);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), neonMat(0xff2a4d, 2.6));
    eye.position.set(s * 0.4, 0.1, 0.98);
    g.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 3), m.ink);
  nose.position.set(0, -0.3, 1.0);
  nose.rotation.x = -0.3;
  g.add(nose);
  const teeth: THREE.BufferGeometry[] = [];
  for (let i = -2; i <= 2; i++) {
    const t = new THREE.BoxGeometry(0.16, 0.26, 0.12);
    t.translate(i * 0.2, -0.5, 1.05);
    teeth.push(t);
  }
  g.add(new THREE.Mesh(mergeGeometries(teeth), m.bone));
  g.scale.setScalar(size);
  return g;
}

/**
 * The colossal skull whose open mouth is The Fall. It lies face-up: the
 * cranium beyond the shaft, eye sockets burning, teeth ringing the throat.
 */
export function skullMaw(shaftR: number, entryDir: THREE.Vector3): THREE.Group {
  const m = propMats();
  const g = new THREE.Group();
  const back = entryDir.clone().negate();
  const right = new THREE.Vector3().crossVectors(UP, back).normalize();
  const R = shaftR;
  // Cranium: a huge dome beyond the throat (never over it), half-buried.
  const cranium = new THREE.Mesh(new THREE.SphereGeometry(R * 1.5, 36, 20), m.bone);
  cranium.position.copy(back).multiplyScalar(R * 2.7).add(new THREE.Vector3(0, -R * 0.35, 0));
  cranium.scale.set(1.15, 0.8, 1);
  g.add(cranium);
  // Cheekbones either side of the throat.
  for (const s of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(R * 0.6, 20, 12), m.bone);
    cheek.position.copy(back).multiplyScalar(R * 0.9).addScaledVector(right, s * R * 1.45).add(new THREE.Vector3(0, -R * 0.1, 0));
    cheek.scale.set(1, 0.55, 1.3);
    g.add(cheek);
  }
  // Eye sockets, looking up at the sky (and at the camera hanging over the throat).
  for (const s of [-1, 1]) {
    const c = back.clone().multiplyScalar(R * 2.2).addScaledVector(right, s * R * 0.72).add(new THREE.Vector3(0, R * 0.62, 0));
    const socket = new THREE.Mesh(new THREE.SphereGeometry(R * 0.42, 18, 12), m.ink);
    socket.position.copy(c);
    socket.scale.set(1, 0.55, 1);
    g.add(socket);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(R * 0.2, 12, 8), neonMat(0xff2a4d, 2.6));
    eye.position.copy(c).add(new THREE.Vector3(0, R * 0.1, 0));
    g.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(R * 0.26, R * 0.7, 3), m.ink);
  nose.position.copy(back).multiplyScalar(R * 1.55).add(new THREE.Vector3(0, R * 0.55, 0));
  nose.rotation.x = Math.PI / 2;
  g.add(nose);
  // Teeth ringing the throat: upper teeth hang from the far side, lower teeth rise on the near side.
  const teeth: THREE.BufferGeometry[] = [];
  const N = 22;
  const entryAng = Math.atan2(entryDir.z, entryDir.x);
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2;
    let diff = Math.abs(a - entryAng) % (Math.PI * 2);
    if (diff > Math.PI) diff = Math.PI * 2 - diff;
    if (diff < 0.55) continue; // the road comes in here
    const near = diff > Math.PI * 0.5;
    const h = (near ? 1.6 : 2.6) * (0.8 + 0.4 * Math.sin(k * 3.1));
    const tooth = new THREE.ConeGeometry(0.42, h, 6);
    if (near) tooth.rotateX(Math.PI); // upper teeth point down into the throat
    tooth.translate(Math.cos(a) * (R + 0.2), near ? -h / 2 + 1.0 : h / 2 - 0.2, Math.sin(a) * (R + 0.2));
    teeth.push(tooth);
  }
  g.add(new THREE.Mesh(mergeGeometries(teeth), m.bone));
  // Jaw bone rim around the lip.
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R + 0.9, 0.7, 10, 48), m.bone);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.2;
  g.add(rim);
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(R * 1.8, R * 0.5), neon(signTexture('ROCK BOTTOM', { color: '#ff2a4d', glow: '#ff2a4d', stroke: '#1a0006', width: 768, height: 200 }), 1.8));
  banner.position.copy(back).multiplyScalar(R * 1.5).add(new THREE.Vector3(0, R * 1.15, 0));
  banner.lookAt(banner.position.clone().add(entryDir).add(new THREE.Vector3(0, 0.6, 0)));
  g.add(banner);
  return g;
}

// ------------------------------------------------------------------ small dressing

/** A standing torch: iron post, bowl, flame. */
export function torch(flames: Flames | null, at: THREE.Vector3, h = 3): THREE.Group {
  const m = propMats();
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, h, 8), m.iron);
  post.position.y = h / 2;
  g.add(post);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.16, 0.36, 10), m.iron);
  bowl.position.y = h;
  g.add(bowl);
  g.position.copy(at);
  flames?.add(at.clone().add(new THREE.Vector3(0, h + 0.15, 0)), 1.2);
  return g;
}

/** A pile of gold coins (dressing). */
export function coinPile(seed = 1, count = 14): THREE.Mesh {
  const m = propMats();
  let s = seed * 31 + 5;
  const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const geos: THREE.BufferGeometry[] = [];
  for (let i = 0; i < count; i++) {
    const c = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 14);
    c.rotateX((rand() - 0.5) * 0.9);
    c.rotateZ((rand() - 0.5) * 0.9);
    const r = rand() * 0.9;
    const a = rand() * Math.PI * 2;
    c.translate(Math.cos(a) * r, 0.05 + rand() * 0.5 * (1 - r), Math.sin(a) * r);
    geos.push(c);
  }
  return new THREE.Mesh(mergeGeometries(geos), m.gold);
}
