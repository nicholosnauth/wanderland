// The retro-futuristic settlement: Aurora Spire, glass dome habitats,
// a monorail ring with an orbiting tram pod, and relay pylons scattered
// in the wild that recharge stamina. Window glow ramps up at night.
import { CONFIG } from './config.js';
import { terrainHeight, hash, makeNoiseTexture } from './noise.js';

let windowMat, beacon, monorail, relays;

export function init(ctx) {
  const { PLATEAU_X: PLX, PLATEAU_Z: PLZ, MONORAIL_RADIUS, DOME_COUNT } = CONFIG;
  const PLY = terrainHeight(PLX, PLZ);

  const metalTex = makeNoiseTexture(128, 235, 40, 0.12, 4, 4);
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd8dde2, metalness: 0.92, roughness: 0.22, map: metalTex });
  const chromeDark = new THREE.MeshStandardMaterial({ color: 0x7c848c, metalness: 0.85, roughness: 0.3 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xaee6f5, metalness: 0.1, roughness: 0.06, transparent: true, opacity: 0.32 });
  windowMat = new THREE.MeshStandardMaterial({ color: 0x1a2026, emissive: 0x9fe8ff, emissiveIntensity: 0.25, roughness: 0.4 });
  const neonCyan = new THREE.MeshStandardMaterial({ color: 0x111418, emissive: 0x35d8ff, emissiveIntensity: 2.2 });
  const neonAmber = new THREE.MeshStandardMaterial({ color: 0x14100a, emissive: 0xffa028, emissiveIntensity: 2.0 });
  const castAllExceptGlass = g => g.traverse(o => { if (o.isMesh && o.material !== glassMat) o.castShadow = true; });

  /* --- Aurora Spire --- */
  const spire = new THREE.Group();
  {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(8, 11, 3.5, 24), chromeDark); base.position.y = 1.75; spire.add(base);
    for (let i = 0; i < 3; i++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.6, 40, 8), chrome);
      const a = i * Math.PI * 2 / 3;
      leg.position.set(Math.cos(a) * 5, 22, Math.sin(a) * 5);
      leg.rotation.z = -Math.cos(a) * 0.16;
      leg.rotation.x = Math.sin(a) * 0.16;
      spire.add(leg);
    }
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 2.2, 12, 12), chrome); neck.position.y = 46; spire.add(neck);
    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(10, 4, 3.2, 28), chrome); saucer.position.y = 53; spire.add(saucer);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(9.2, 24, 10, 0, Math.PI * 2, 0, Math.PI * 0.4), glassMat); dome.position.y = 54.4; spire.add(dome);
    const winBand = new THREE.Mesh(new THREE.CylinderGeometry(10.05, 10.05, 1.1, 28, 1, true), windowMat); winBand.position.y = 53.6; spire.add(winBand);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(10.6, 0.25, 8, 40), neonCyan); ring.rotation.x = Math.PI / 2; ring.position.y = 52.2; spire.add(ring);
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.3, 9, 6), chrome); antenna.position.y = 60; spire.add(antenna);
    beacon = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), neonAmber.clone()); beacon.position.y = 64.7; spire.add(beacon);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 320, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x74e0ff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
    beam.position.y = 210; spire.add(beam);
    const lamp = new THREE.PointLight(0x74d8ff, 1.6, 90); lamp.position.y = 55; spire.add(lamp);
    castAllExceptGlass(spire);
    spire.position.set(PLX, PLY, PLZ);
  }
  ctx.scene.add(spire);

  /* --- Dome habitats --- */
  for (let i = 0; i < DOME_COUNT; i++) {
    const a = i * Math.PI * 2 / DOME_COUNT + 0.4;
    const r = 26 + (i % 2) * 9;
    const dx = PLX + Math.cos(a) * r, dz = PLZ + Math.sin(a) * r;
    const g = new THREE.Group();
    const size = 4.5 + hash(i, i * 2) * 3;
    const ringBase = new THREE.Mesh(new THREE.CylinderGeometry(size + 0.7, size + 1.1, 1, 20), chromeDark); ringBase.position.y = 0.5; g.add(ringBase);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(size, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), glassMat); dome.position.y = 1; g.add(dome);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.35, size * 0.45, size * 0.8, 12), chrome); core.position.y = 1 + size * 0.4; g.add(core);
    const winStrip = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.36, size * 0.36, size * 0.22, 12, 1, true), windowMat); winStrip.position.y = 1 + size * 0.45; g.add(winStrip);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.3), neonAmber); door.position.set(0, 1.6, size + 0.15); g.add(door);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.35, 3.2, 6), chrome); fin.position.y = 1 + size + 1.2; g.add(fin);
    castAllExceptGlass(g);
    g.position.set(dx, terrainHeight(dx, dz), dz);
    ctx.scene.add(g);
  }

  /* --- Monorail ring + tram pod --- */
  {
    const R = MONORAIL_RADIUS;
    const track = new THREE.Mesh(new THREE.TorusGeometry(R, 0.55, 8, 90), chrome);
    track.rotation.x = Math.PI / 2;
    track.position.set(PLX, PLY + 12, PLZ);
    track.castShadow = true;
    ctx.scene.add(track);
    const rail = new THREE.Mesh(new THREE.TorusGeometry(R, 0.16, 6, 90), neonCyan);
    rail.rotation.x = Math.PI / 2;
    rail.position.set(PLX, PLY + 12.6, PLZ);
    ctx.scene.add(rail);
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI * 2 / 10;
      const px = PLX + Math.cos(a) * R, pz = PLZ + Math.sin(a) * R;
      const py = terrainHeight(px, pz);
      const h = PLY + 12 - py;
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, h, 8), chromeDark);
      pylon.position.set(px, py + h / 2, pz);
      pylon.castShadow = true;
      ctx.scene.add(pylon);
    }
    const pod = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.8, 14, 10), chrome); body.scale.set(1.7, 0.85, 1); pod.add(body);
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), glassMat);
    canopy.position.y = 0.4; canopy.scale.set(1.5, 0.9, 0.9); pod.add(canopy);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, 4), neonAmber); fin.rotation.x = -Math.PI / 2; fin.position.set(-2.6, 0.3, 0); pod.add(fin);
    castAllExceptGlass(pod);
    ctx.scene.add(pod);
    monorail = { pod, R, cx: PLX, cz: PLZ, y: PLY + 13.6 };
  }

  /* --- Relay pylons --- */
  relays = [];
  CONFIG.RELAY_POSITIONS.forEach(([sx, sz]) => {
    const g = new THREE.Group();
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 5.5, 1.4, 12), chromeDark); plinth.position.y = 0.7; g.add(plinth);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.1, 14, 10), chrome); mast.position.y = 8; g.add(mast);
    const dish = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.32), chrome);
    dish.rotation.x = Math.PI; dish.position.y = 15.6; g.add(dish);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.18, 6, 26), neonAmber);
    ring.rotation.x = Math.PI / 2; ring.position.y = 14.6; g.add(ring);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 220, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffb050, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }));
    beam.position.y = 120; g.add(beam);
    const lamp = new THREE.PointLight(0xffa040, 1.4, 45); lamp.position.y = 15; g.add(lamp);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    g.position.set(sx, terrainHeight(sx, sz), sz);
    ctx.scene.add(g);
    relays.push({ ring, visited: false, x: sx, z: sz });
  });
}

export function update(ctx) {
  const { dt, t } = ctx.frame;

  // tram pod orbits the ring
  const ma = t * 0.12;
  monorail.pod.position.set(monorail.cx + Math.cos(ma) * monorail.R, monorail.y, monorail.cz + Math.sin(ma) * monorail.R);
  monorail.pod.rotation.y = -ma;

  // beacon pulse
  beacon.material.emissiveIntensity = 1.2 + Math.sin(t * 4) * 1.1;

  // windows glow when the sun goes down
  windowMat.emissiveIntensity = 0.15 + (1 - ctx.time.sunUp) * 2.4;

  // relay interaction
  for (const r of relays) {
    r.ring.rotation.z += dt * 0.8;
    if (!r.visited && Math.hypot(ctx.player.pos.x - r.x, ctx.player.pos.z - r.z) < 9) {
      r.visited = true;
      ctx.hud.toast('Relay pylon synchronized — stamina cells recharged', 3200);
      ctx.player.stamina = CONFIG.STAMINA_MAX;
    }
  }
}
