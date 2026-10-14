import * as THREE from 'three';
import { addRim } from './look';

// Procedural surface shading for the track, injected into MeshStandardMaterial
// so it keeps PBR lighting, reflections, fog and shadows. Every road vertex carries aTrack:
// x = metres across from the centre, y = metres along the track, z = part
// (0 road, 1 bank, 2 lip, 3 underside).

export interface SurfaceStyle {
  base: THREE.ColorRepresentation; // road colour
  bankA: THREE.ColorRepresentation; // checker squares on the banks
  bankB: THREE.ColorRepresentation;
  neon: THREE.ColorRepresentation; // edge lines, chevrons, the lip
  crack: number; // 0..1 lava cracks in the road
  halfWidth: number;
  chevrons?: number; // 0 hides them
}

const NOISE = /* glsl */ `
  float tHash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  vec2 tHash2(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
  float tNoise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(tHash(i), tHash(i + vec2(1, 0)), u.x), mix(tHash(i + vec2(0, 1)), tHash(i + vec2(1, 1)), u.x), u.y); }
  float tCrack(vec2 x) {
    vec2 n = floor(x), f = fract(x);
    float d1 = 8.0, d2 = 8.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 r = g + tHash2(n + g) - f;
      float d = dot(r, r);
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
    }
    return sqrt(d2) - sqrt(d1);
  }
`;

const timeUniform = { value: 0 };

export function tickSurfaces(time: number): void {
  timeUniform.value = time;
}

export function trackMaterial(style: SurfaceStyle): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.06, envMapIntensity: 0.3 });
  const uniforms = {
    uBase: { value: new THREE.Color(style.base) },
    uBankA: { value: new THREE.Color(style.bankA) },
    uBankB: { value: new THREE.Color(style.bankB) },
    uNeon: { value: new THREE.Color(style.neon) },
    uCrack: { value: style.crack },
    uHalfWidth: { value: style.halfWidth },
    uChevrons: { value: style.chevrons ?? 1 },
    uTime: timeUniform,
  };
  mat.userData.track = uniforms;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 aTrack;\nvarying vec3 vTrack;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTrack = aTrack;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vTrack;
        uniform vec3 uBase; uniform vec3 uBankA; uniform vec3 uBankB; uniform vec3 uNeon;
        uniform float uCrack; uniform float uHalfWidth; uniform float uChevrons; uniform float uTime;
        ${NOISE}`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        vec3 trackGlow = vec3(0.0);
        {
          float u = vTrack.x, v = vTrack.y, part = vTrack.z;
          float px = fwidth(u) + fwidth(v);
          if (part < 0.5) {
            // Road: black obsidian with a faint chart grid, neon edge lines and chevrons pointing down.
            float n = tNoise(vec2(u, v) * 0.35) * 0.6 + tNoise(vec2(u, v) * 1.7) * 0.4;
            vec3 c = uBase * (1.0 + 0.8 * n);
            vec2 g = abs(fract(vec2(u * 0.5, v * 0.25)) - 0.5);
            float grid = 1.0 - smoothstep(0.0, 0.02 + px * 0.5, min(g.x, g.y));
            c = mix(c, c * 1.6 + uNeon * 0.06, grid * 0.3);
            float edge = abs(abs(u) - (uHalfWidth - 0.35));
            float line = 1.0 - smoothstep(0.05, 0.09 + px, edge);
            trackGlow += uNeon * line * 2.4;
            float chev = fract((v + abs(u) * 0.7) / 9.0);
            float arrow = (1.0 - smoothstep(0.0, 0.025 + px * 0.1, abs(chev - 0.5) - 0.02)) * step(abs(u), 2.6) * uChevrons;
            trackGlow += uNeon * arrow * 0.7;
            c = mix(c, uNeon * 0.3, arrow * 0.5);
            if (uCrack > 0.0) {
              float k = tCrack(vec2(u * 0.8, v * 0.32));
              float hot = (1.0 - smoothstep(0.0, 0.025 + px * 0.12, k)) * smoothstep(0.5, 0.85, tNoise(vec2(u, v) * 0.09 + 3.0));
              float pulse = 0.8 + 0.2 * sin(uTime * 2.2 + v * 0.15);
              trackGlow += vec3(2.6, 0.6, 0.08) * hot * uCrack * pulse;
              c = mix(c, vec3(0.05, 0.0, 0.0), hot * uCrack * 0.6);
            }
            diffuseColor.rgb = c;
            roughnessFactor = 0.45 + 0.35 * n;
          } else if (part < 1.5) {
            // Banks: carved hell rock, with a glowing seam where they meet the road.
            float n = tNoise(vec2(u * 0.9, v * 0.45)) * 0.6 + tNoise(vec2(u * 2.7, v * 1.3)) * 0.4;
            float k = tCrack(vec2(u * 0.7 + 3.0, v * 0.25));
            float vein = 1.0 - smoothstep(0.0, 0.05 + px * 0.2, k);
            vec3 c = mix(uBankA, uBankB, n * 0.6) * (0.6 + 0.6 * n);
            float seam = 1.0 - smoothstep(0.0, 0.9, abs(u) - uHalfWidth);
            trackGlow += uNeon * vein * 0.35 * (0.4 + 0.6 * seam) + uNeon * seam * 0.25;
            diffuseColor.rgb = c;
            roughnessFactor = 0.85;
          } else if (part < 2.5) {
            // The lip: a bright neon tube along the top of each bank.
            diffuseColor.rgb = uNeon * 0.4;
            trackGlow += uNeon * 2.8;
          } else {
            // Underside: rock lit from below by the lava.
            float n = tNoise(vec2(u, v) * 0.4);
            vec3 c = vec3(0.09, 0.05, 0.07) * (0.6 + 0.8 * n);
            float k = tCrack(vec2(u * 0.4 + 7.0, v * 0.15));
            float vein = 1.0 - smoothstep(0.0, 0.05 + px * 0.2, k);
            trackGlow += vec3(1.8, 0.35, 0.05) * vein * 0.7;
            diffuseColor.rgb = c;
            roughnessFactor = 0.9;
          }
        }`)
      .replace('#include <opaque_fragment>', 'outgoingLight += trackGlow;\n#include <opaque_fragment>');
  };
  mat.userData.cacheKey = 'track-surface';
  addRim(mat, 0.8, 2.4);
  return mat;
}

export interface Profile {
  /** Points across the track (x across, y up), outer left to outer right, as a closed loop. */
  pts: [number, number, number][]; // x, y, part
}

/**
 * Cross-section of a banked road: fillets into the banks, neon lips, a rocky keel.
 * Each point's part is the part of the edge that starts at it.
 */
export function roadProfile(width: number, bank: number): Profile {
  const w = width / 2;
  const angle = THREE.MathUtils.degToRad(55);
  const run = bank / Math.tan(angle);
  const lip = 0.35;
  const bankFace = (side: number): [number, number][] => {
    const out: [number, number][] = [];
    const steps = 6;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      // Quadratic Bezier from the bank top to the road edge, control near the corner.
      const mt = 1 - t;
      const cx = side * (w + run * 0.15);
      out.push([mt * mt * side * (w + run) + 2 * mt * t * cx + t * t * side * w, mt * mt * bank]);
    }
    return out;
  };
  const pts: [number, number, number][] = [];
  pts.push([-(w + run + lip), bank - 0.05, 2], [-(w + run + lip * 0.5), bank + 0.12, 2]);
  const left = bankFace(-1);
  left.forEach(([x, y], k) => pts.push([x, y, k === left.length - 1 ? 0 : 1]));
  for (let k = 1; k < 8; k++) pts.push([-w + (2 * w * k) / 8, 0, 0]);
  const right = bankFace(1).reverse();
  right.forEach(([x, y], k) => pts.push([x, y, k === right.length - 1 ? 2 : 1]));
  pts.push([w + run + lip * 0.5, bank + 0.12, 2], [w + run + lip, bank - 0.05, 3]);
  pts.push([w + run + lip, -1.2, 3], [w * 0.55, -4.5, 3], [-w * 0.55, -4.5, 3], [-(w + run + lip), -1.2, 3]);
  return { pts };
}

/**
 * Sweep a profile along frames. Parts are per-vertex (hard edges between parts
 * duplicate vertices so the patterns do not smear across them).
 */
export function sweep(frames: { p: THREE.Vector3; r: THREE.Vector3; n: THREE.Vector3; s: number }[], profile: Profile, closed = true): THREE.BufferGeometry {
  const prof = profile.pts;
  const m = prof.length;
  const segs = closed ? m : m - 1;
  const positions: number[] = [];
  const track: number[] = [];
  const index: number[] = [];
  // Each profile edge gets its own pair of vertex columns so normals stay crisp per face strip.
  const cols: { a: number; b: number; part: number }[] = [];
  for (let k = 0; k < segs; k++) cols.push({ a: k, b: (k + 1) % m, part: prof[k][2] });
  const tmp = new THREE.Vector3();
  frames.forEach((fr) => {
    for (const c of cols) {
      for (const k of [c.a, c.b]) {
        const [x, y] = prof[k];
        tmp.copy(fr.p).addScaledVector(fr.r, x).addScaledVector(fr.n, y);
        positions.push(tmp.x, tmp.y, tmp.z);
        track.push(x, fr.s, c.part);
      }
    }
  });
  const stride = cols.length * 2;
  for (let i = 0; i < frames.length - 1; i++) {
    for (let c = 0; c < cols.length; c++) {
      const a0 = i * stride + c * 2, b0 = a0 + 1;
      const a1 = a0 + stride, b1 = b0 + stride;
      index.push(a0, b0, a1, b0, b1, a1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('aTrack', new THREE.Float32BufferAttribute(track, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}
