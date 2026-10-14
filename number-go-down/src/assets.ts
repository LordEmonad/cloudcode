import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// Served from public/, so paths are relative to the page. The claude.ai
// artifact build cannot serve .glb files, so it ships the model as base64 text.
const EMONAD_URL = './models/emonad.glb';
const EMONAD_B64_URL = './models/emonad.glb.txt';

export async function loadEmonad(onProgress?: (f: number) => void): Promise<THREE.Object3D> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  if (import.meta.env.MODE === 'artifact') {
    const res = await fetch(EMONAD_B64_URL);
    if (!res.ok) throw new Error(`Could not load Emonad (${res.status})`);
    const b64 = (await res.text()).trim();
    onProgress?.(0.8);
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const gltf = await loader.parseAsync(bin.buffer, './models/');
    onProgress?.(1);
    return gltf.scene;
  }
  const gltf = await loader.loadAsync(EMONAD_URL, (e) => {
    if (onProgress && e.total) onProgress(e.loaded / e.total);
  });
  return gltf.scene;
}
