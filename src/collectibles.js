// Spirit lights: glowing orbs scattered across the map (some placed near
// relay pylons to reward visiting landmarks). Bob, pulse, pickup, win toast.
import { CONFIG } from './config.js';
import { terrainHeight, scatterSpots } from './noise.js';

let orbs, collected;

export function init(ctx) {
  const spots = scatterSpots(CONFIG.ORB_TOTAL - CONFIG.RELAY_POSITIONS.length, CONFIG.WATER_Y + 1.3, 34, 3.6, null)
    .concat(CONFIG.RELAY_POSITIONS.map(([x, z]) => [x + 8, terrainHeight(x + 8, z), z]));

  orbs = [];
  collected = 0;
  spots.forEach(s => {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffe27a }));
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.85, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0xffca50, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }));
    const lamp = new THREE.PointLight(0xffc850, 0.9, 15);
    g.add(core, halo, lamp);
    g.position.set(s[0], s[1] + 1.9, s[2]);
    ctx.scene.add(g);
    orbs.push({ g, halo, base: s[1] + 1.9, taken: false });
  });
  ctx.hud.setOrbs(0, CONFIG.ORB_TOTAL);
}

export function update(ctx) {
  const { t } = ctx.frame;
  for (const o of orbs) {
    if (o.taken) continue;
    o.g.position.y = o.base + Math.sin(t * 2 + o.base) * 0.35;
    o.halo.scale.setScalar(1 + Math.sin(t * 3 + o.base) * 0.12);
    if (o.g.position.distanceToSquared(ctx.player.pos) < 7) {
      o.taken = true;
      ctx.scene.remove(o.g);
      collected++;
      ctx.hud.setOrbs(collected, CONFIG.ORB_TOTAL);
      const won = collected === CONFIG.ORB_TOTAL;
      ctx.hud.toast(
        won ? '✦ ALL SPIRIT LIGHTS RESTORED — Neo Valley hums back to life ✦' : 'Spirit light recovered',
        won ? 6000 : 2000
      );
    }
  }
}
