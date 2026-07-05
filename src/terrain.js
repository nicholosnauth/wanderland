// The landmass: a displaced plane colored by biome bands (sand, grass,
// rock, snow), with tiled procedural detail + roughness maps for close-up
// realism under the PBR pipeline.
import { CONFIG } from './config.js';
import { terrainHeight, fbm, makeNoiseTexture } from './noise.js';

export function init(ctx) {
  const { WORLD, WATER_Y, TERRAIN_SEGMENTS } = CONFIG;

  const terrDetail = makeNoiseTexture(256, 208, 100, 0.05, 90, 90);
  const roughTex = makeNoiseTexture(128, 205, 90, 0.09, 90, 90);

  const geo = new THREE.PlaneGeometry(WORLD * 2, WORLD * 2, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colors = [];
  const cGrassA = new THREE.Color(0x577f3a), cGrassB = new THREE.Color(0x6f9a47), cGrassC = new THREE.Color(0x4c7334);
  const cSand = new THREE.Color(0xc9b586), cRock = new THREE.Color(0x77705f), cRock2 = new THREE.Color(0x8d8677), cSnow = new THREE.Color(0xeef1f3);
  const tmp = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = terrainHeight(x, z);
    pos.setY(i, h);
    const patch = fbm(x / 26 + 40, z / 26 - 40);
    if (h < WATER_Y + 1.0) tmp.copy(cSand);
    else if (h < 19) tmp.copy(cGrassA).lerp(patch > 0.55 ? cGrassB : cGrassC, Math.abs(patch - 0.5) * 2);
    else if (h < 32) tmp.copy(cRock).lerp(cRock2, patch);
    else tmp.copy(cSnow);
    colors.push(tmp.r, tmp.g, tmp.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    vertexColors: true, map: terrDetail, roughnessMap: roughTex, roughness: 0.95, metalness: 0.0
  }));
  mesh.receiveShadow = true;
  ctx.scene.add(mesh);
}
