import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// Served from public/, so the path is relative to the page.
const EMONAD_URL = './models/emonad.glb';

export async function loadEmonad(onProgress?: (f: number) => void): Promise<THREE.Object3D> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(EMONAD_URL, (e) => {
    if (onProgress && e.total) onProgress(e.loaded / e.total);
  });
  return gltf.scene;
}
