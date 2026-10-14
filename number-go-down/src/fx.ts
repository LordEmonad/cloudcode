import * as THREE from 'three';
import {
  EffectComposer, RenderPass, EffectPass, BloomEffect,
  ToneMappingEffect, ToneMappingMode, Effect, BlendFunction, GodRaysEffect, KernelSize,
} from 'postprocessing';
import { softDotTexture, starTexture } from './textures';

// ------------------------------------------------------------------ particles

interface ParticleKind {
  texture: THREE.Texture;
  additive: boolean;
  max: number;
}

class ParticleSystem {
  readonly points: THREE.Points;
  private pos: Float32Array;
  private vel: Float32Array;
  private col: Float32Array;
  private size: Float32Array;
  private life: Float32Array;
  private maxLife: Float32Array;
  private baseSize: Float32Array;
  private gravity: Float32Array;
  private drag: Float32Array;
  private spin: Float32Array;
  private angle: Float32Array;
  private next = 0;
  private alive = 0;

  constructor(kind: ParticleKind) {
    const n = kind.max;
    this.pos = new Float32Array(n * 3);
    this.vel = new Float32Array(n * 3);
    this.col = new Float32Array(n * 4);
    this.size = new Float32Array(n);
    this.life = new Float32Array(n);
    this.maxLife = new Float32Array(n);
    this.baseSize = new Float32Array(n);
    this.gravity = new Float32Array(n);
    this.drag = new Float32Array(n);
    this.spin = new Float32Array(n);
    this.angle = new Float32Array(n);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('color', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('angle', new THREE.BufferAttribute(this.angle, 1).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: kind.texture }, scale: { value: 600 } },
      vertexShader: `
        attribute float size; attribute vec4 color; attribute float angle;
        uniform float scale;
        varying vec4 vColor; varying float vAngle;
        void main() {
          vColor = color; vAngle = angle;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * scale / max(0.1, -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform sampler2D map;
        varying vec4 vColor; varying float vAngle;
        void main() {
          vec2 p = gl_PointCoord - 0.5;
          float c = cos(vAngle), s = sin(vAngle);
          p = mat2(c, -s, s, c) * p + 0.5;
          vec4 t = texture2D(map, p);
          gl_FragColor = vec4(vColor.rgb, vColor.a * t.a);
          if (gl_FragColor.a < 0.01) discard;
        }`,
      transparent: true,
      depthWrite: false,
      blending: kind.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      toneMapped: false,
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
  }

  setScale(px: number): void {
    (this.points.material as THREE.ShaderMaterial).uniforms.scale.value = px;
  }

  emit(p: THREE.Vector3, v: THREE.Vector3, color: THREE.Color, alpha: number, size: number, life: number, gravity = 0, drag = 1, spin = 0): void {
    const i = this.next;
    this.next = (this.next + 1) % this.life.length;
    this.pos.set([p.x, p.y, p.z], i * 3);
    this.vel.set([v.x, v.y, v.z], i * 3);
    this.col.set([color.r, color.g, color.b, alpha], i * 4);
    this.size[i] = size;
    this.baseSize[i] = size;
    this.life[i] = life;
    this.maxLife[i] = life;
    this.gravity[i] = gravity;
    this.drag[i] = drag;
    this.spin[i] = spin;
    this.angle[i] = Math.random() * Math.PI * 2;
    this.alive = Math.min(this.life.length, this.alive + 1);
  }

  update(dt: number): void {
    const n = this.life.length;
    for (let i = 0; i < n; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this.col[i * 4 + 3] = 0; this.size[i] = 0; continue; }
      const d = Math.exp(-this.drag[i] * dt);
      this.vel[i * 3] *= d;
      this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * d + this.gravity[i] * dt;
      this.vel[i * 3 + 2] *= d;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.angle[i] += this.spin[i] * dt;
      const k = this.life[i] / this.maxLife[i];
      this.col[i * 4 + 3] = Math.min(1, k * 2);
      this.size[i] = this.baseSize[i] * (0.4 + 0.6 * k);
    }
    const g = this.points.geometry;
    (g.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (g.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    (g.attributes.size as THREE.BufferAttribute).needsUpdate = true;
    (g.attributes.angle as THREE.BufferAttribute).needsUpdate = true;
  }
}

const _v = new THREE.Vector3();
const _c = new THREE.Color();

export class Particles {
  private glow: ParticleSystem;
  private solid: ParticleSystem;
  private stars: ParticleSystem;

  constructor(scene: THREE.Scene) {
    const dot = softDotTexture();
    const star = starTexture();
    this.glow = new ParticleSystem({ texture: dot, additive: true, max: 900 });
    this.solid = new ParticleSystem({ texture: dot, additive: false, max: 600 });
    this.stars = new ParticleSystem({ texture: star, additive: false, max: 120 });
    scene.add(this.solid.points, this.glow.points, this.stars.points);
  }

  setViewport(heightPx: number, fovDeg: number): void {
    const scale = heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2));
    for (const s of [this.glow, this.solid, this.stars]) s.setScale(scale);
  }

  /** Sparks and dust for a hit; more and bigger for stronger hits. */
  impact(p: THREE.Vector3, n: THREE.Vector3, strength: number, color = 0xffcf3a): void {
    const count = Math.round(6 + strength * 26);
    for (let i = 0; i < count; i++) {
      _v.copy(n).multiplyScalar(3 + Math.random() * 8 * (0.5 + strength)).add(new THREE.Vector3((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 4));
      _c.set(color).lerp(new THREE.Color(0xffffff), Math.random() * 0.5).multiplyScalar(1.6);
      this.glow.emit(p, _v, _c, 1, 0.04 + Math.random() * 0.05, 0.25 + Math.random() * 0.3, -16, 3, 0);
    }
    const dust = Math.round(2 + strength * 4);
    for (let i = 0; i < dust; i++) {
      _v.copy(n).multiplyScalar(0.8 + Math.random() * 1.5).add(new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 1));
      _c.set(0xd8c4e0);
      this.solid.emit(p, _v, _c, 0.22, 0.18 + Math.random() * 0.2 * (1 + Math.min(strength, 1)), 0.35 + Math.random() * 0.3, 0, 2.5);
    }
  }

  /** A shockwave ring of sparks for slams and big hits. */
  burst(p: THREE.Vector3, color: number, size = 1): void {
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      _v.set(Math.cos(a) * 9 * size, 1.5 + Math.random() * 2, Math.sin(a) * 9 * size);
      _c.set(color).multiplyScalar(1.8);
      this.glow.emit(p, _v, _c, 1, 0.09 * size, 0.35, -6, 4);
    }
  }

  /** Comic stars circling a big hit. */
  stars3(p: THREE.Vector3, strength: number): void {
    const count = 2 + Math.round(strength * 2);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      _v.set(Math.cos(a) * 3.5, Math.sin(a) * 3.5 + 1.5, 0.5);
      _c.set(i % 2 ? 0xffcf3a : 0xfff7f2);
      this.stars.emit(p, _v, _c, 1, 0.14 + strength * 0.06, 0.5, -6, 3, (Math.random() - 0.5) * 12);
    }
  }

  /** Bone chips for a break (white shards, no blood). */
  boneChips(p: THREE.Vector3, n: THREE.Vector3): void {
    for (let i = 0; i < 14; i++) {
      _v.copy(n).multiplyScalar(2 + Math.random() * 5).add(new THREE.Vector3((Math.random() - 0.5) * 7, Math.random() * 6, (Math.random() - 0.5) * 3));
      _c.set(0xfff3e0);
      this.solid.emit(p, _v, _c, 1, 0.07 + Math.random() * 0.06, 0.6 + Math.random() * 0.4, -20, 1.5, (Math.random() - 0.5) * 20);
    }
  }

  /** Glass shards when the SUPPORT floor breaks. */
  shatter(center: THREE.Vector3, width: number): void {
    for (let i = 0; i < 110; i++) {
      const p = center.clone().add(new THREE.Vector3((Math.random() - 0.5) * width, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 2));
      _v.set((Math.random() - 0.5) * 8, -2 - Math.random() * 8, (Math.random() - 0.5) * 3);
      _c.set(0x9fffe0).multiplyScalar(1.5);
      this.glow.emit(p, _v, _c, 0.9, 0.08 + Math.random() * 0.1, 0.8 + Math.random() * 0.6, -16, 0.5, (Math.random() - 0.5) * 16);
    }
  }

  /** A burst of gate/boost sparkles. */
  ring(center: THREE.Vector3, radius: number, color: number): void {
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const p = center.clone().add(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
      _v.set(Math.cos(a) * 6, Math.sin(a) * 6, 0);
      _c.set(color).multiplyScalar(1.7);
      this.glow.emit(p, _v, _c, 1, 0.13, 0.5, 0, 2);
    }
  }

  /** Water thrown up by a whale or the spout. */
  splash(p: THREE.Vector3, count = 40, up = 9): void {
    for (let i = 0; i < count; i++) {
      _v.set((Math.random() - 0.5) * 7, up * (0.5 + Math.random()), (Math.random() - 0.5) * 7);
      _c.set(0x9fe8ff).lerp(new THREE.Color(0xffffff), Math.random() * 0.6);
      this.solid.emit(p, _v, _c, 0.9, 0.08 + Math.random() * 0.1, 0.6 + Math.random() * 0.5, -18, 0.8);
    }
  }

  /** Lava thrown by a geyser. */
  magma(p: THREE.Vector3, count = 50): void {
    for (let i = 0; i < count; i++) {
      _v.set((Math.random() - 0.5) * 6, 10 + Math.random() * 14, (Math.random() - 0.5) * 6);
      _c.set(Math.random() < 0.5 ? 0xff6a10 : 0xffd23a).multiplyScalar(1.8);
      this.glow.emit(p, _v, _c, 1, 0.1 + Math.random() * 0.12, 0.8 + Math.random() * 0.6, -20, 0.6);
    }
  }

  update(dt: number): void {
    this.glow.update(dt);
    this.solid.update(dt);
    this.stars.update(dt);
  }
}

// ------------------------------------------------------------------ embers

/**
 * Hell's air: a few thousand embers rising and swirling around the camera,
 * wrapped in a box that follows it. All motion is in the vertex shader.
 */
export class EmberField {
  readonly points: THREE.Points;
  private uniforms = {
    uTime: { value: 0 },
    uCenter: { value: new THREE.Vector3() },
    uBox: { value: new THREE.Vector3(70, 46, 70) },
    uColorA: { value: new THREE.Color(0xff6a2a) },
    uColorB: { value: new THREE.Color(0xffcf3a) },
    uScale: { value: 600 },
    uDensity: { value: 1 },
  };

  constructor(scene: THREE.Scene, count = 1500) {
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute('seed', new THREE.BufferAttribute(seeds, 4));
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        attribute vec4 seed;
        uniform float uTime; uniform vec3 uCenter; uniform vec3 uBox; uniform float uScale; uniform float uDensity;
        varying float vHeat; varying float vAlpha;
        void main() {
          vec3 p = seed.xyz * uBox;
          float t = uTime;
          p.y += t * (1.2 + seed.w * 3.0);
          p.x += sin(t * (0.4 + seed.w) + seed.y * 40.0) * 2.2;
          p.z += cos(t * (0.3 + seed.x * 0.6) + seed.z * 30.0) * 2.2;
          vec3 lo = uCenter - uBox * 0.5;
          p = lo + mod(p - lo, uBox);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float flick = 0.6 + 0.4 * sin(t * (6.0 + seed.w * 9.0) + seed.x * 60.0);
          vHeat = seed.w;
          // Fade near the box faces so wrapping never pops; thin out with uDensity.
          vec3 q = abs(p - uCenter) / (uBox * 0.5);
          float edge = 1.0 - smoothstep(0.75, 1.0, max(max(q.x, q.y), q.z));
          // Embers right in front of the lens would be huge sprites: shrink and fade them (overdraw).
          float near = smoothstep(1.0, 5.0, -mv.z);
          vAlpha = flick * edge * step(seed.x * 0.999, uDensity) * near;
          gl_PointSize = (0.05 + seed.y * 0.09) * uScale / max(0.5, -mv.z) * (0.4 + 0.6 * near);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColorA; uniform vec3 uColorB;
        varying float vHeat; varying float vAlpha;
        void main() {
          vec2 d = gl_PointCoord - 0.5;
          float a = smoothstep(0.5, 0.0, length(d));
          gl_FragColor = vec4(mix(uColorA, uColorB, vHeat) * 2.2, a * a * vAlpha);
          if (gl_FragColor.a < 0.01) discard;
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
      toneMapped: false,
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 4;
    scene.add(this.points);
  }

  setViewport(heightPx: number, fovDeg: number): void {
    this.uniforms.uScale.value = heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2));
  }

  update(time: number, camera: THREE.Vector3, a: THREE.ColorRepresentation, b: THREE.ColorRepresentation, density: number, dt: number): void {
    this.uniforms.uTime.value = time;
    this.uniforms.uCenter.value.copy(camera);
    const k = 1 - Math.exp(-dt * 1.5);
    this.uniforms.uColorA.value.lerp(_c.set(a), k);
    this.uniforms.uColorB.value.lerp(_c.set(b), k);
    this.uniforms.uDensity.value += (density - this.uniforms.uDensity.value) * k;
  }
}

// ------------------------------------------------------------------ post

const gradeShader = /* glsl */ `
  uniform float desat;
  uniform float cool;
  uniform float flash;
  uniform float speed;
  uniform float seed;
  uniform float heat;
  uniform float pop;
  uniform float chroma;
  uniform float vignette;
  uniform float grain;
  float gh(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float gn(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(gh(i), gh(i + vec2(1, 0)), u.x), mix(gh(i + vec2(0, 1)), gh(i + vec2(1, 1)), u.x), u.y); }
  void mainUv(inout vec2 uv) {
    // Heat haze: the picture shimmers near the bottom of the frame, more when hell is excited.
    float amt = heat * 0.0035 * (1.0 - smoothstep(0.1, 0.8, uv.y));
    uv += vec2(gn(uv * 18.0 + vec2(0.0, seed * 2.5)) - 0.5, gn(uv * 18.0 + vec2(7.0, seed * 2.1)) - 0.5) * amt;
  }
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 d = uv - 0.5;
    // Chromatic aberration on hits: red and blue pulled apart radially.
    vec3 c = inputColor.rgb;
    if (chroma > 0.001) {
      vec2 off = d * chroma * 0.012;
      c.r = texture2D(inputBuffer, uv + off).r;
      c.b = texture2D(inputBuffer, uv - off).b;
    }
    // Punch: a little contrast and saturation, blacks crushed toward ink purple.
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(l), c, 1.0 + 0.18 * pop);
    c = (c - 0.5) * (1.0 + 0.1 * pop) + 0.5;
    c = max(c, vec3(0.012, 0.004, 0.02) * pop);
    c = mix(c, vec3(l), desat);
    c = mix(c, c * vec3(0.78, 0.93, 1.22) + vec3(0.0, 0.015, 0.05), cool);
    // Speed lines toward the screen edges, stronger the faster he goes.
    float ang = atan(d.y, d.x);
    float lane = floor(ang * 44.0 / 3.14159);
    float h = fract(sin(lane * 91.7 + floor(seed * 12.0) * 3.1) * 43758.5);
    float r = length(d * vec2(0.6, 1.0));
    float line = step(0.8, h) * smoothstep(0.3, 0.62, r) * speed;
    c += vec3(1.0, 0.92, 0.96) * line * 0.28;
    c = mix(c, vec3(1.0, 0.97, 0.94), flash * 0.4);
    // Vignette and film grain (grain only during cinematics).
    float v = smoothstep(0.3, 1.1, length(d * vec2(1.0, 1.2)) * 1.3);
    c *= 1.0 - v * vignette;
    float n = fract(sin(dot(uv * 1000.0 + seed, vec2(12.9898, 78.233))) * 43758.5453);
    c += (n - 0.5) * (grain * 0.12 + 1.0 / 255.0);
    outputColor = vec4(c, inputColor.a);
  }
`;

class GradeEffect extends Effect {
  constructor() {
    super('GradeEffect', gradeShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform>([
        ['desat', new THREE.Uniform(0)],
        ['cool', new THREE.Uniform(0)],
        ['flash', new THREE.Uniform(0)],
        ['speed', new THREE.Uniform(0)],
        ['seed', new THREE.Uniform(0)],
        ['heat', new THREE.Uniform(0)],
        ['pop', new THREE.Uniform(1)],
        ['chroma', new THREE.Uniform(0)],
        ['vignette', new THREE.Uniform(0.38)],
        ['grain', new THREE.Uniform(0)],
      ]),
    });
  }
}

/** One NaN pixel in the HDR buffer becomes a black screen after bloom; scrub them before the heavy pass. */
class SanitizeEffect extends Effect {
  constructor() {
    super('SanitizeEffect', /* glsl */ `
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 c = inputColor.rgb;
        bvec3 bad = bvec3(isnan(c.r) || isinf(c.r), isnan(c.g) || isinf(c.g), isnan(c.b) || isinf(c.b));
        outputColor = vec4(any(bad) ? vec3(0.0) : min(c, vec3(64.0)), inputColor.a);
      }`, { blendFunction: BlendFunction.SET });
  }
}

export interface GradeParams {
  desat: number; cool: number; grain: number; flash: number; chroma: number; vignette: number; heat: number;
}

export class Post {
  readonly composer: EffectComposer;
  private grade = new GradeEffect();
  private bloom: BloomEffect | null = null;
  private rays: GodRaysEffect | null = null;
  private heavy: EffectPass | null = null;
  enabled = true;
  /** 2 = god rays + bloom, 1 = bloom only, 0 = grade only. */
  quality = 2;

  constructor(private renderer: THREE.WebGLRenderer, private scene: THREE.Scene, private camera: THREE.Camera, quality: 'high' | 'low', moon?: THREE.Mesh) {
    const touch = navigator.maxTouchPoints > 0;
    this.composer = new EffectComposer(renderer, {
      // MSAA is a big fill cost on phones; the stylised look reads fine without it there.
      multisampling: quality === 'high' && !touch ? Math.min(4, renderer.capabilities.maxSamples) : 0,
      frameBufferType: THREE.HalfFloatType,
    });
    this.composer.addPass(new RenderPass(scene, camera));
    if (quality === 'high') {
      this.composer.addPass(new EffectPass(camera, new SanitizeEffect()));
      const effects: Effect[] = [];
      if (moon) {
        // Light shafts from the eclipse corona, broken up by the spires and candle towers.
        this.rays = new GodRaysEffect(camera, moon, { resolutionScale: 0.4, density: 0.92, decay: 0.94, weight: 0.5, exposure: 0.55, samples: 32, clampMax: 1, kernelSize: KernelSize.SMALL, blur: true });
        effects.push(this.rays);
      }
      // Bloom only catches emissive signs, gates, flames and sparks (report: 4-5 levels, half resolution).
      this.bloom = new BloomEffect({ mipmapBlur: true, intensity: 0.75, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, levels: 6, radius: 0.7 });
      effects.push(this.bloom);
      this.heavy = new EffectPass(camera, ...effects);
      this.composer.addPass(this.heavy);
    } else {
      this.quality = 0;
    }
    // The grade (chroma, haze, speed lines, vignette, grain) and tone mapping in one pass.
    this.composer.addPass(new EffectPass(camera, this.grade, new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL })));
  }

  /** Step the heavy effects down when frames run long. Returns false if nothing is left to drop. */
  dropQuality(): boolean {
    if (this.quality === 2 && this.rays) {
      this.rays.blendMode.opacity.value = 0;
      this.quality = 1;
      return true;
    }
    if (this.quality >= 1 && this.heavy) {
      this.heavy.enabled = false;
      this.quality = 0;
      return true;
    }
    return false;
  }

  setSize(w: number, h: number): void {
    this.composer.setSize(w, h);
  }

  update(p: GradeParams, speed: number, t: number): void {
    const u = this.grade.uniforms;
    u.get('desat')!.value = p.desat;
    u.get('cool')!.value = p.cool;
    u.get('flash')!.value = p.flash;
    u.get('speed')!.value = THREE.MathUtils.clamp((speed - 14) / 16, 0, 1);
    u.get('seed')!.value = t;
    u.get('heat')!.value = p.heat;
    u.get('chroma')!.value = p.chroma;
    u.get('vignette')!.value = p.vignette;
    u.get('grain')!.value = p.grain;
  }

  render(dt: number): void {
    if (this.enabled) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
  }
}
