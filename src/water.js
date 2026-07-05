// Water: a subdivided plane whose vertices ride three overlapping sine
// waves. Normals are recomputed every frame so the glossy PBR material
// catches real specular glints from the sun.
import { CONFIG } from './config.js';

let water, basePositions;

export function init(ctx) {
  const { WORLD, WATER_Y } = CONFIG;
  const geo = new THREE.PlaneGeometry(WORLD * 2.6, WORLD * 2.6, 110, 110);
  geo.rotateX(-Math.PI / 2);
  basePositions = geo.attributes.position.array.slice();

  water = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0x175a7d, roughness: 0.14, metalness: 0.02, transparent: true, opacity: 0.9
  }));
  water.position.y = WATER_Y;
  ctx.scene.add(water);
}

export function update(ctx) {
  const { t } = ctx.frame;
  const p = water.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const bx = basePositions[i * 3], bz = basePositions[i * 3 + 2];
    p.setY(i,
      Math.sin(bx * 0.05 + t * 1.1) * 0.28 +
      Math.sin(bz * 0.043 - t * 0.85) * 0.28 +
      Math.sin((bx + bz) * 0.02 + t * 0.5) * 0.18
    );
  }
  p.needsUpdate = true;
  water.geometry.computeVertexNormals();
}
