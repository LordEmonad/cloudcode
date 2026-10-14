// Removes the VRChat lip-sync morph targets (vrc.v_*) the game never uses.
// Usage: node scripts/prune-morphs.mjs <in.glb> <out.glb>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const [input, output] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);

for (const mesh of doc.getRoot().listMeshes()) {
  const names = mesh.getExtras()?.targetNames;
  if (!Array.isArray(names)) continue;
  const keep = names.map((n) => !String(n).startsWith('vrc.v_'));
  if (keep.every(Boolean)) continue;
  for (const prim of mesh.listPrimitives()) {
    prim.listTargets().forEach((target, i) => {
      if (!keep[i]) { prim.removeTarget(target); target.dispose(); }
    });
  }
  const weights = mesh.getWeights();
  mesh.setWeights(weights.filter((_, i) => keep[i]));
  mesh.setExtras({ ...mesh.getExtras(), targetNames: names.filter((_, i) => keep[i]) });
  console.log(`${mesh.getName()}: kept ${keep.filter(Boolean).length} of ${names.length} morph targets`);
}
await io.write(output, doc);
