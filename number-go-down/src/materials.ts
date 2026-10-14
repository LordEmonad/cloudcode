import * as THREE from 'three';
import { surf } from './look';

// Comic-punk toon look (report: two- to three-band ramp, hot-pink rim on Emonad,
// inverted-hull outline on Emonad only).

let ramp: THREE.DataTexture | null = null;

export function toonRamp(): THREE.DataTexture {
  if (ramp) return ramp;
  const steps = [70, 150, 255];
  const data = new Uint8Array(steps.length * 4);
  steps.forEach((v, i) => data.set([v, v, v, 255], i * 4));
  ramp = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
  ramp.minFilter = THREE.NearestFilter;
  ramp.magFilter = THREE.NearestFilter;
  ramp.generateMipmaps = false;
  ramp.needsUpdate = true;
  return ramp;
}

export interface ToonOptions {
  map?: THREE.Texture | null;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  rim?: THREE.ColorRepresentation;
  rimPower?: number;
  rimStrength?: number;
  transparent?: boolean;
  opacity?: number;
  side?: THREE.Side;
  roughness?: number;
  metalness?: number;
}

/**
 * Compatibility shim: the old toon factory now returns the stylised PBR
 * surface from look.ts (the rim colour is global, so `rim` only enables it).
 */
export function toon(color: THREE.ColorRepresentation, opts: ToonOptions = {}): THREE.MeshStandardMaterial {
  return surf({
    color,
    map: opts.map ?? null,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    rim: opts.rim !== undefined ? (opts.rimStrength ?? 1) : 0.7,
    rimPower: opts.rimPower ?? 2.2,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
    roughness: opts.roughness ?? 0.6,
    metalness: opts.metalness ?? 0,
  });
}

/**
 * Inverted-hull outline with constant on-screen width, for skinned and morphed
 * meshes too (it expands along the skinned normal after projection).
 */
export function outlineMaterial(color: THREE.ColorRepresentation, widthPx: number): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  const uniforms = { uOutlineWidth: { value: widthPx }, uResolution: { value: new THREE.Vector2(390, 844) } };
  mat.userData.outline = uniforms;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uOutlineWidth;\nuniform vec2 uResolution;')
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        {
          // MeshBasicMaterial only computes (skinned) objectNormal when skinning or
          // an env map is on; plain meshes fall back to the raw normal attribute.
          #if defined( USE_ENVMAP ) || defined( USE_SKINNING )
            vec3 n = objectNormal;
          #else
            vec3 n = normal;
          #endif
          vec3 viewN = normalize(normalMatrix * n);
          vec4 clipN = projectionMatrix * vec4(viewN, 0.0);
          vec2 dir = normalize(clipN.xy + 1e-6);
          gl_Position.xy += dir * uOutlineWidth * 2.0 / uResolution * gl_Position.w;
        }`,
      );
  };
  mat.customProgramCacheKey = () => 'outline';
  return mat;
}

/** Emissive "neon" sign material from a canvas; feeds bloom. */
export function neon(texture: THREE.Texture, intensity = 1.6): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
  mat.color.setScalar(intensity);
  return mat;
}
