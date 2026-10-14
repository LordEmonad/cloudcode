import * as THREE from 'three';
import {
  EffectComposer, RenderPass, EffectPass, BloomEffect, ChromaticAberrationEffect, VignetteEffect,
  NoiseEffect, ToneMappingEffect, ToneMappingMode, Effect, BlendFunction,
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
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
  }

  setScale(px: number): void {
    (this.points.material as THREE.ShaderMaterial).uniforms.scale.value = px;
  }

  emit(p: THREE.Vector3, v: THREE.Vector3, color: THREE.Color, alpha: number, size: number, life: number, gravity = 0, drag = 1, spin = 0): void {
    const n = this.life.length;
    const i = this.next;
    this.next = (this.next + 1) % n;
    this.pos.set([p.x, p.y, p.z], i * 3);
    this.vel.set([v.x, v.y, v.z], i * 3);
    this.col.set([color.r, color.g, color.b, alpha], i * 4);
    this.baseSize[i] = size;
    this.size[i] = size;
    this.life[i] = life;
    this.maxLife[i] = life;
    this.gravity[i] = gravity;
    this.drag[i] = drag;
    this.spin[i] = spin;
    this.angle[i] = Math.random() * Math.PI * 2;
    this.alive = Math.min(n, this.alive + 1);
  }

  update(dt: number, wrap?: { center: THREE.Vector3; half: THREE.Vector3 }): void {
    const n = this.life.length;
    for (let i = 0; i < n; i++) {
      if (this.life[i] <= 0) { this.size[i] = 0; continue; }
      this.life[i] -= dt;
      const k = Math.exp(-this.drag[i] * dt);
      this.vel[i * 3 + 1] += this.gravity[i] * dt;
      this.vel[i * 3] *= k; this.vel[i * 3 + 1] *= k; this.vel[i * 3 + 2] *= k;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.angle[i] += this.spin[i] * dt;
      if (wrap) {
        // Ambient embers wrap around the camera so their cost stays constant.
        for (let a = 0; a < 3; a++) {
          const c = wrap.center.getComponent(a);
          const h = wrap.half.getComponent(a);
          let v = this.pos[i * 3 + a];
          if (v < c - h) v += 2 * h; else if (v > c + h) v -= 2 * h;
          this.pos[i * 3 + a] = v;
        }
        this.life[i] = this.maxLife[i];
      }
      const f = this.life[i] / this.maxLife[i];
      this.size[i] = this.baseSize[i] * (wrap ? 1 : 0.4 + 0.6 * f);
      this.col[i * 4 + 3] = wrap ? this.col[i * 4 + 3] : Math.min(1, f * 1.6);
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
    g.attributes.size.needsUpdate = true;
    g.attributes.angle.needsUpdate = true;
  }
}

const _v = new THREE.Vector3();
const _c = new THREE.Color();

export class Particles {
  private glow: ParticleSystem;
  private solid: ParticleSystem;
  private stars: ParticleSystem;
  private embers: ParticleSystem;
  private emberCenter = new THREE.Vector3();
  private emberHalf = new THREE.Vector3(6, 14, 3);

  constructor(scene: THREE.Scene) {
    const dot = softDotTexture();
    const star = starTexture();
    this.glow = new ParticleSystem({ texture: dot, additive: true, max: 700 });
    this.solid = new ParticleSystem({ texture: dot, additive: false, max: 500 });
    this.stars = new ParticleSystem({ texture: star, additive: false, max: 120 });
    this.embers = new ParticleSystem({ texture: dot, additive: true, max: 160 });
    scene.add(this.embers.points, this.solid.points, this.glow.points, this.stars.points);
    for (let i = 0; i < 160; i++) {
      _v.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 28, (Math.random() - 0.5) * 6);
      const hot = Math.random() < 0.7;
      _c.set(hot ? 0xff5a3c : 0xffcf3a);
      this.embers.emit(_v, new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.6 + Math.random() * 1.6, 0), _c, 0.55, 0.05 + Math.random() * 0.08, 1e9, 0, 0);
    }
  }

  setViewport(heightPx: number, fovDeg: number): void {
    const scale = heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2));
    for (const s of [this.glow, this.solid, this.stars, this.embers]) s.setScale(scale);
  }

  /** Sparks and dust for a hit; more and bigger for stronger hits. */
  impact(p: THREE.Vector3, n: THREE.Vector3, strength: number, color = 0xffcf3a): void {
    const count = Math.round(4 + strength * 18);
    for (let i = 0; i < count; i++) {
      _v.copy(n).multiplyScalar(2 + Math.random() * 6 * (0.5 + strength)).add(new THREE.Vector3((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 3));
      _c.set(color).lerp(new THREE.Color(0xffffff), Math.random() * 0.5);
      this.glow.emit(p, _v, _c, 1, 0.04 + Math.random() * 0.04, 0.2 + Math.random() * 0.25, -14, 3);
    }
    const dust = Math.round(1 + strength * 3);
    for (let i = 0; i < dust; i++) {
      _v.copy(n).multiplyScalar(0.8 + Math.random() * 1.5).add(new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 1));
      _c.set(0xd8c4e0);
      this.solid.emit(p, _v, _c, 0.18, 0.16 + Math.random() * 0.16 * (1 + Math.min(strength, 1)), 0.3 + Math.random() * 0.25, 0, 2.5);
    }
  }

  /** Comic stars circling a big hit. */
  stars3(p: THREE.Vector3, strength: number): void {
    const count = 2 + Math.round(strength * 2);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      _v.set(Math.cos(a) * 3.5, Math.sin(a) * 3.5 + 1.5, 0.5);
      _c.set(i % 2 ? 0xffcf3a : 0xfff7f2);
      this.stars.emit(p, _v, _c, 1, 0.13 + strength * 0.06, 0.5, -6, 3, (Math.random() - 0.5) * 12);
    }
  }

  /** Bone chips for a break (white shards, no blood). */
  boneChips(p: THREE.Vector3, n: THREE.Vector3): void {
    for (let i = 0; i < 12; i++) {
      _v.copy(n).multiplyScalar(2 + Math.random() * 4).add(new THREE.Vector3((Math.random() - 0.5) * 6, Math.random() * 5, (Math.random() - 0.5) * 3));
      _c.set(0xfff3e0);
      this.solid.emit(p, _v, _c, 1, 0.07 + Math.random() * 0.06, 0.6 + Math.random() * 0.4, -18, 1.5, (Math.random() - 0.5) * 20);
    }
  }

  /** Glass shards when the SUPPORT floor breaks. */
  shatter(center: THREE.Vector3, width: number): void {
    for (let i = 0; i < 90; i++) {
      const p = center.clone().add(new THREE.Vector3((Math.random() - 0.5) * width, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 2));
      _v.set((Math.random() - 0.5) * 8, -2 - Math.random() * 8, (Math.random() - 0.5) * 3);
      _c.set(0x9fffe0);
      this.glow.emit(p, _v, _c, 0.9, 0.08 + Math.random() * 0.1, 0.8 + Math.random() * 0.6, -16, 0.5, (Math.random() - 0.5) * 16);
    }
  }

  /** A burst of gate/boost sparkles. */
  ring(center: THREE.Vector3, radius: number, color: number): void {
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const p = center.clone().add(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
      _v.set(Math.cos(a) * 5, Math.sin(a) * 5, 0);
      _c.set(color);
      this.glow.emit(p, _v, _c, 1, 0.12, 0.5, 0, 2);
    }
  }

  update(dt: number, cameraPos: THREE.Vector3): void {
    this.glow.update(dt);
    this.solid.update(dt);
    this.stars.update(dt);
    this.emberCenter.set(cameraPos.x, cameraPos.y, 0);
    this.embers.update(dt, { center: this.emberCenter, half: this.emberHalf });
  }
}

// ------------------------------------------------------------------ post

const gradeShader = /* glsl */ `
  uniform float desat;
  uniform float cool;
  uniform float flash;
  uniform float speed;
  uniform float seed;
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 c = inputColor.rgb;
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(c, vec3(l), desat);
    c = mix(c, c * vec3(0.78, 0.93, 1.22) + vec3(0.0, 0.015, 0.05), cool);
    // Speed lines toward the screen edges, stronger the faster he falls.
    vec2 d = uv - 0.5;
    float ang = atan(d.y, d.x);
    float lane = floor(ang * 38.0 / 3.14159);
    float h = fract(sin(lane * 91.7 + floor(seed * 9.0) * 3.1) * 43758.5);
    float r = length(d * vec2(0.6, 1.0));
    float line = step(0.82, h) * smoothstep(0.32, 0.62, r) * speed;
    c += vec3(1.0, 0.92, 0.96) * line * 0.22;
    c = mix(c, vec3(1.0, 0.97, 0.94), flash * 0.35);
    // Dither so the dark red-purple gradients do not band in 8-bit buffers.
    float n = fract(sin(dot(uv * 1000.0 + seed, vec2(12.9898, 78.233))) * 43758.5453);
    c += (n - 0.5) / 255.0;
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
      ]),
    });
  }
}

export interface GradeParams {
  desat: number; cool: number; grain: number; flash: number; chroma: number; vignette: number;
}

export class Post {
  readonly composer: EffectComposer;
  private grade = new GradeEffect();
  private chroma: ChromaticAberrationEffect;
  private vignette: VignetteEffect;
  private noise: NoiseEffect;
  private bloom: BloomEffect | null = null;
  enabled = true;

  constructor(private renderer: THREE.WebGLRenderer, private scene: THREE.Scene, private camera: THREE.Camera, quality: 'high' | 'low') {
    this.composer = new EffectComposer(renderer, {
      multisampling: quality === 'high' ? Math.min(4, renderer.capabilities.maxSamples) : 0,
      frameBufferType: THREE.HalfFloatType,
    });
    this.composer.addPass(new RenderPass(scene, camera));
    this.chroma = new ChromaticAberrationEffect({ offset: new THREE.Vector2(0, 0), radialModulation: true, modulationOffset: 0.2 });
    this.vignette = new VignetteEffect({ offset: 0.3, darkness: 0.35 });
    this.noise = new NoiseEffect({ premultiply: true, blendFunction: BlendFunction.OVERLAY });
    this.noise.blendMode.opacity.value = 0;
    const effects: Effect[] = [];
    if (quality === 'high') {
      // Bloom only catches emissive signs, gates and sparks (report: 4-5 levels, half resolution).
      this.bloom = new BloomEffect({ mipmapBlur: true, intensity: 1.1, luminanceThreshold: 0.92, luminanceSmoothing: 0.12, levels: 5, radius: 0.7 });
      effects.push(this.bloom);
    }
    effects.push(this.chroma, this.grade, this.noise, this.vignette, new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }));
    this.composer.addPass(new EffectPass(camera, ...effects));
  }

  setSize(w: number, h: number): void {
    this.composer.setSize(w, h);
  }

  update(p: GradeParams, fallSpeed: number, t: number): void {
    const u = this.grade.uniforms;
    u.get('desat')!.value = p.desat;
    u.get('cool')!.value = p.cool;
    u.get('flash')!.value = p.flash;
    u.get('speed')!.value = THREE.MathUtils.clamp((fallSpeed - 14) / 16, 0, 1);
    u.get('seed')!.value = t;
    const o = 0.0035 * p.chroma;
    this.chroma.offset.set(o, o * 0.6);
    this.vignette.darkness = p.vignette;
    this.noise.blendMode.opacity.value = p.grain * 0.35;
  }

  render(dt: number): void {
    if (this.enabled) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
  }
}
