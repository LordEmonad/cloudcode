import * as THREE from 'three';

// The look: stylised PBR under a hell sky. Dark, low-albedo surfaces so the
// coloured rim lights, lava glow and neon carry the image (Hades by way of a
// crypto crash): hot pink from camera-left, ember orange from camera-right,
// a warm key from above, lava from below, and a light that follows Emonad.

export const PALETTE = {
  ink: 0x0b0410,
  paper: 0xfff7f2,
  red: 0xff2a4d,
  crimson: 0xb5122e,
  pink: 0xff4fd8,
  purple: 0xa259ff,
  gold: 0xffcf3a,
  ember: 0xff6a10,
  mint: 0x39f0b0,
  cyan: 0x3ad8ff,
  whale: 0x3d7bff,
};

export interface SurfOptions {
  color?: THREE.ColorRepresentation;
  map?: THREE.Texture | null;
  roughness?: number;
  metalness?: number;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  emissiveMap?: THREE.Texture | null;
  envMapIntensity?: number;
  /** Rim light strength (0 disables). Rims are coloured by the global rim lights. */
  rim?: number;
  rimPower?: number;
  /** Fake subsurface: light wraps round and the back glows this colour. */
  sss?: THREE.ColorRepresentation;
  transparent?: boolean;
  opacity?: number;
  side?: THREE.Side;
  vertexColors?: boolean;
  flatShading?: boolean;
}

/** Global rim-light directions and colours, shared by every rim material. */
export const RIM = {
  dirA: { value: new THREE.Vector3(-0.7, 0.3, 0.6).normalize() },
  colorA: { value: new THREE.Color(PALETTE.pink).multiplyScalar(1.4) },
  dirB: { value: new THREE.Vector3(0.8, -0.2, 0.4).normalize() },
  colorB: { value: new THREE.Color(PALETTE.ember).multiplyScalar(1.2) },
};

const RIM_GLSL = /* glsl */ `
  uniform vec3 uRimDirA; uniform vec3 uRimColA; uniform vec3 uRimDirB; uniform vec3 uRimColB;
  uniform float uRim; uniform float uRimPower; uniform vec3 uSss;
`;

/** Stylised PBR material with directional rim lights injected. */
export function surf(opts: SurfOptions = {}): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    color: opts.color ?? 0xffffff,
    map: opts.map ?? null,
    roughness: opts.roughness ?? 0.6,
    metalness: opts.metalness ?? 0,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    emissiveMap: opts.emissiveMap ?? null,
    envMapIntensity: opts.envMapIntensity ?? 1,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
    vertexColors: opts.vertexColors ?? false,
    flatShading: opts.flatShading ?? false,
  });
  const rim = opts.rim ?? 1;
  if (rim > 0 || opts.sss) addRim(mat, rim, opts.rimPower ?? 2.2, opts.sss);
  return mat;
}

export function addRim(mat: THREE.Material, strength: number, power: number, sss?: THREE.ColorRepresentation): void {
  const uniforms = {
    uRimDirA: RIM.dirA, uRimColA: RIM.colorA, uRimDirB: RIM.dirB, uRimColB: RIM.colorB,
    uRim: { value: strength }, uRimPower: { value: power }, uSss: { value: new THREE.Color(sss ?? 0x000000) },
  };
  mat.userData.rim = uniforms;
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, renderer) => {
    prev?.(shader, renderer);
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${RIM_GLSL}`)
      .replace(
        '#include <opaque_fragment>',
        `{
          vec3 V = normalize(vViewPosition);
          vec3 N = normalize(normal);
          float fres = pow(1.0 - saturate(dot(N, V)), uRimPower);
          // Light directions are given in view space (camera-relative), so the rims stay put as the camera turns.
          float la = saturate(dot(N, uRimDirA));
          float lb = saturate(dot(N, uRimDirB));
          vec3 rim = (uRimColA * la + uRimColB * lb) * fres * uRim;
          // Fake subsurface: wrap the key light round and tint the shadow side.
          float wrap = saturate(dot(N, normalize(vec3(0.3, 0.8, 0.5))) * 0.5 + 0.5);
          vec3 sss = uSss * (0.35 + 0.65 * (1.0 - wrap)) * (0.6 + 0.4 * fres);
          outgoingLight += rim * diffuseColor.a + sss;
          // Never let a light inside a surface push the HDR buffer toward Inf (bloom would smear NaN everywhere).
          outgoingLight = min(outgoingLight, vec3(48.0));
        }
        #include <opaque_fragment>`,
      );
  };
  // Compose the program cache key with whatever the material already injects.
  mat.userData.cacheKey = `${mat.userData.cacheKey ?? ''}|rim2-${power}`;
  mat.customProgramCacheKey = () => mat.userData.cacheKey as string;
}

// ------------------------------------------------------------------ material library

const texCache = new Map<string, THREE.Texture>();

function canvasTex(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat = true): THREE.CanvasTexture {
  const cached = texCache.get(key);
  if (cached) return cached as THREE.CanvasTexture;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  texCache.set(key, t);
  return t;
}

/** Fine noise used as a roughness/bump-ish detail map (data texture, linear). */
export function grainTexture(): THREE.DataTexture {
  const cached = texCache.get('grain');
  if (cached) return cached as THREE.DataTexture;
  const n = 128;
  const data = new Uint8Array(n * n * 4);
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < n * n; i++) {
    const v = 150 + rand() * 105;
    data.set([v, v, v, 255], i * 4);
  }
  const t = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  texCache.set('grain', t);
  return t;
}

/** Yellow/black hazard stripes. */
export function hazardTexture(): THREE.CanvasTexture {
  return canvasTex('hazard', 128, 128, (g) => {
    g.fillStyle = '#ffcf3a';
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#0b0410';
    for (let i = -2; i < 4; i++) {
      g.beginPath();
      g.moveTo(i * 64, 0); g.lineTo(i * 64 + 32, 0); g.lineTo(i * 64 + 96, 128); g.lineTo(i * 64 + 64, 128);
      g.closePath(); g.fill();
    }
  });
}

/** Scratched metal: brushed streaks for chrome parts. */
export function brushedTexture(): THREE.CanvasTexture {
  return canvasTex('brushed', 256, 256, (g) => {
    g.fillStyle = '#d8d8e0';
    g.fillRect(0, 0, 256, 256);
    let seed = 3;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 900; i++) {
      const y = rand() * 256;
      const v = Math.floor(150 + rand() * 100);
      g.strokeStyle = `rgba(${v},${v},${v + 8},0.5)`;
      g.lineWidth = 0.5 + rand() * 1.5;
      g.beginPath(); g.moveTo(0, y); g.lineTo(256, y + (rand() - 0.5) * 3); g.stroke();
    }
  });
}

export const MATS = {
  /** Glossy black volcanic glass: catches the sky in its reflections. */
  obsidian: (): THREE.MeshStandardMaterial => surf({ color: 0x120a16, roughness: 0.42, metalness: 0.1, envMapIntensity: 0.8, rim: 0.9 }),
  /** Red candle wax, soft and lit through. */
  wax: (color: THREE.ColorRepresentation = 0xd8102c, glow: THREE.ColorRepresentation = 0x5a0410): THREE.MeshStandardMaterial =>
    surf({ color, roughness: 0.55, metalness: 0, emissive: glow, emissiveIntensity: 0.6, rim: 1.1, rimPower: 2.6, sss: new THREE.Color(color).multiplyScalar(0.22) }),
  /** Green ATH wax. */
  waxGreen: (): THREE.MeshStandardMaterial => surf({ color: 0x16d98f, roughness: 0.55, emissive: 0x063a26, emissiveIntensity: 0.8, rim: 1.1, rimPower: 2.6, sss: 0x0a4a30 }),
  /** Hell gold. */
  gold: (): THREE.MeshStandardMaterial => surf({ color: 0xffc83a, roughness: 0.32, metalness: 1, envMapIntensity: 1.6, rim: 0.6, emissive: 0x3a2000, emissiveIntensity: 0.6 }),
  /** Chrome for machinery. */
  chrome: (): THREE.MeshStandardMaterial => surf({ color: 0xc8c8d4, map: brushedTexture(), roughness: 0.3, metalness: 0.95, envMapIntensity: 1.4, rim: 0.5 }),
  /** Dark iron. */
  iron: (): THREE.MeshStandardMaterial => surf({ color: 0x2a2630, roughness: 0.55, metalness: 0.8, envMapIntensity: 0.9, rim: 0.7 }),
  /** Hazard stripes on machinery. */
  hazard: (): THREE.MeshStandardMaterial => surf({ color: 0xffffff, map: hazardTexture(), roughness: 0.5, metalness: 0.2, rim: 0.5 }),
  /** Old bone for the skull and gates. */
  bone: (): THREE.MeshStandardMaterial => surf({ color: 0xb8a48c, roughness: 0.8, metalness: 0, envMapIntensity: 0.5, rim: 1.2, rimPower: 2.2, sss: 0x2a1408, emissive: 0x120804, emissiveIntensity: 0.5 }),
  /** Carved hell stone. */
  stone: (): THREE.MeshStandardMaterial => surf({ color: 0x2a1a24, roughness: 0.85, metalness: 0, rim: 0.8, emissive: 0x12040a, emissiveIntensity: 0.5 }),
  /** Black ink for silhouettes and outlines. */
  ink: (): THREE.MeshStandardMaterial => surf({ color: 0x0b0410, roughness: 1, rim: 0.3 }),
  /** Whale skin: deep glossy blue. */
  whale: (): THREE.MeshStandardMaterial => surf({ color: 0xffffff, vertexColors: true, roughness: 0.35, metalness: 0.05, envMapIntensity: 1.1, rim: 1.0, rimPower: 2.0, sss: 0x0a1a4a }),
  /** Liquidity: a glossy dark pool. */
  liquidity: (): THREE.MeshStandardMaterial => surf({ color: 0x0a1030, roughness: 0.12, metalness: 0.3, envMapIntensity: 1.8, rim: 0.6, emissive: 0x06103a, emissiveIntensity: 0.8 }),
  /** Bright emissive for neon trims (feeds bloom). */
  neon: (color: THREE.ColorRepresentation, intensity = 2.2): THREE.MeshBasicMaterial =>
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: false }),
};

/** Shared neon materials so the static batcher can merge everything with the same glow. */
const neonCache = new Map<string, THREE.MeshBasicMaterial>();
export function neonMat(color: THREE.ColorRepresentation, intensity = 2.2): THREE.MeshBasicMaterial {
  const key = `${new THREE.Color(color).getHex()}:${intensity}`;
  let m = neonCache.get(key);
  if (!m) {
    m = MATS.neon(color, intensity);
    neonCache.set(key, m);
  }
  return m;
}

// ------------------------------------------------------------------ environment

/**
 * Procedural environment map for reflections: a hell sky rendered once into a
 * PMREM. The horizon burns orange, the zenith is near-black, the ground glows.
 */
export function buildEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const scene = new THREE.Scene();
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {},
    vertexShader: 'varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec3 vDir;
      void main() {
        float y = vDir.y;
        vec3 zenith = vec3(0.02, 0.005, 0.03);
        vec3 horizon = vec3(1.6, 0.42, 0.12);
        vec3 ground = vec3(0.9, 0.18, 0.05);
        vec3 c = y > 0.0 ? mix(horizon, zenith, pow(smoothstep(0.0, 0.7, y), 0.6)) : mix(horizon, ground, smoothstep(0.0, -0.5, y));
        // A hot band at the horizon and a couple of bright "lamps" so highlights read on gloss.
        c += horizon * 0.8 * exp(-abs(y) * 10.0);
        float lampA = pow(clamp(dot(vDir, normalize(vec3(-0.7, 0.4, 0.5))), 0.0, 1.0), 60.0);
        float lampB = pow(clamp(dot(vDir, normalize(vec3(0.8, 0.1, -0.3))), 0.0, 1.0), 50.0);
        c += vec3(1.0, 0.35, 0.8) * lampA * 2.5 + vec3(1.0, 0.55, 0.2) * lampB * 3.5;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), mat));
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(scene, 0.04);
  pmrem.dispose();
  mat.dispose();
  return target.texture;
}

// ------------------------------------------------------------------ lights

export interface ZoneLight {
  hemiSky: number;
  hemiGround: number;
  glow: number;
  rimA?: number;
  rimB?: number;
}

/** The lighting rig. Everything follows Emonad and the camera so every depth is lit the same way. */
export class Lights {
  readonly hemi: THREE.HemisphereLight;
  readonly key: THREE.DirectionalLight;
  readonly glow: THREE.DirectionalLight;
  readonly follow: THREE.PointLight;
  private rimA = new THREE.Color(PALETTE.pink).multiplyScalar(1.4);
  private rimB = new THREE.Color(PALETTE.ember).multiplyScalar(1.2);

  constructor(scene: THREE.Scene) {
    this.hemi = new THREE.HemisphereLight(0xffd6dc, 0x3a0a18, 0.9);
    this.key = new THREE.DirectionalLight(0xfff0e0, 3.2);
    this.glow = new THREE.DirectionalLight(0xff5a20, 1.0);
    this.follow = new THREE.PointLight(0xffe6ea, 26, 10, 1.8);
    scene.add(this.hemi, this.key, this.key.target, this.glow, this.glow.target, this.follow);
    // Real-time shadow from the key light, only around Emonad (cheap and grounding).
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(1024, 1024);
    const sc = this.key.shadow.camera;
    sc.left = -7; sc.right = 7; sc.top = 7; sc.bottom = -7; sc.near = 1; sc.far = 40;
    this.key.shadow.bias = -0.0015;
    this.key.shadow.normalBias = 0.05;
  }

  /** Blend toward a circle's palette. */
  setZone(z: ZoneLight, k: number): void {
    this.hemi.color.lerp(new THREE.Color(z.hemiSky), k);
    this.hemi.groundColor.lerp(new THREE.Color(z.hemiGround), k);
    this.glow.color.lerp(new THREE.Color(z.glow), k);
    if (z.rimA !== undefined) this.rimA.set(z.rimA).multiplyScalar(1.4);
    if (z.rimB !== undefined) this.rimB.set(z.rimB).multiplyScalar(1.2);
    RIM.colorA.value.lerp(this.rimA, k);
    RIM.colorB.value.lerp(this.rimB, k);
  }

  /** The follow light is off while he sits in the slingshot (the bands would pass through it) and fades in after launch. */
  followOn = 0;

  update(emonad: THREE.Vector3, camera: THREE.Camera): void {
    const cp = camera.position;
    this.follow.intensity = 26 * this.followOn;
    this.key.position.set(emonad.x + 5, emonad.y + 13, emonad.z + 7);
    this.key.target.position.copy(emonad);
    this.glow.position.set(cp.x, cp.y - 20, cp.z - 6);
    this.glow.target.position.set(cp.x, cp.y, cp.z - 8);
    // Well clear of the tumbling body: a point light inside a mesh blows up to Inf in the HDR buffer.
    this.follow.position.set(emonad.x, emonad.y + 2.6, emonad.z + 0.9);
    // Rim directions live in view space; keep them camera-relative so the colours stay on their sides.
    RIM.dirA.value.set(-0.7, 0.3, 0.6).normalize();
    RIM.dirB.value.set(0.8, -0.2, 0.4).normalize();
  }
}
