// The visible hero: a primitive-built explorer with a glowing chest core,
// cape, and paraglider. All animation is procedural, driven by player state
// (run cycle, jump pose, glide pose, idle breathing).
import { CONFIG } from './config.js';

let hero, parts;

export function init(ctx) {
  hero = new THREE.Group();
  parts = {};

  const suit = new THREE.MeshStandardMaterial({ color: 0x3c5a78, roughness: 0.5, metalness: 0.25 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xe0b088, roughness: 0.7 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x4a3826, roughness: 0.85 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x5a5148, roughness: 0.8 });
  const boot = new THREE.MeshStandardMaterial({ color: 0x3a2f24, roughness: 0.75 });
  const capeM = new THREE.MeshStandardMaterial({ color: 0xa8402c, roughness: 0.8, side: THREE.DoubleSide });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.85, 10), suit); body.position.y = 1.05; hero.add(body);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0x111418, emissive: 0x35d8ff, emissiveIntensity: 1.4 }));
  chest.position.set(0, 1.25, 0.3); hero.add(chest);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 11), skin); head.position.y = 1.78; hero.add(head);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), hair); hairM.position.y = 1.84; hero.add(hairM);

  const mkLimb = (rad, len, mat, px, py) => {
    const pivot = new THREE.Group();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 0.85, len, 7), mat);
    m.position.y = -len / 2;
    pivot.add(m);
    pivot.position.set(px, py, 0);
    hero.add(pivot);
    return pivot;
  };
  parts.armL = mkLimb(0.09, 0.62, skin, -0.44, 1.42);
  parts.armR = mkLimb(0.09, 0.62, skin, 0.44, 1.42);
  parts.legL = mkLimb(0.11, 0.66, pants, -0.17, 0.66);
  parts.legR = mkLimb(0.11, 0.66, pants, 0.17, 0.66);
  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.3), boot); bootL.position.set(0, -0.66, 0.04);
  parts.legL.add(bootL);
  parts.legR.add(bootL.clone());

  parts.cape = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), capeM);
  parts.cape.position.set(0, 1.35, -0.24);
  parts.cape.rotation.x = 0.15;
  hero.add(parts.cape);

  const glider = new THREE.Group();
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.32),
    new THREE.MeshStandardMaterial({ color: 0xb03828, roughness: 0.7, side: THREE.DoubleSide }));
  canopy.scale.set(1.15, 0.55, 0.8);
  glider.add(canopy);
  const barL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 4), hair); barL.position.set(-0.4, -0.45, 0); glider.add(barL);
  const barR = barL.clone(); barR.position.x = 0.4; glider.add(barR);
  glider.position.y = 2.6;
  glider.visible = false;
  hero.add(glider);
  parts.glider = glider;

  hero.traverse(o => { if (o.isMesh) o.castShadow = true; });
  ctx.scene.add(hero);
}

export function update(ctx) {
  const { t } = ctx.frame;
  const p = ctx.player;

  hero.position.copy(p.pos);
  hero.rotation.y = p.facing;

  const horizSpeed = Math.hypot(p.vel.x, p.vel.z);
  const runPhase = t * (p.sprinting ? 13 : 9);
  const runAmt = Math.min(1, horizSpeed / CONFIG.RUN_SPEED);

  if (p.gliding) {
    parts.legL.rotation.x = 0.5; parts.legR.rotation.x = 0.4;
    parts.armL.rotation.x = -2.6; parts.armR.rotation.x = -2.6;
    parts.glider.visible = true;
    parts.cape.rotation.x = 1.1;
  } else if (!p.onGround) {
    parts.legL.rotation.x = -0.5; parts.legR.rotation.x = 0.35;
    parts.armL.rotation.x = -0.9; parts.armR.rotation.x = -0.9;
    parts.glider.visible = false;
    parts.cape.rotation.x = 0.7;
  } else {
    const s = Math.sin(runPhase) * runAmt;
    parts.legL.rotation.x = s * 0.9;
    parts.legR.rotation.x = -s * 0.9;
    parts.armL.rotation.x = -s * 0.7;
    parts.armR.rotation.x = s * 0.7;
    parts.glider.visible = false;
    parts.cape.rotation.x = 0.15 + runAmt * 0.4 + Math.sin(t * 3) * 0.04;
    hero.position.y += Math.abs(Math.sin(runPhase)) * 0.07 * runAmt;
    if (!p.moving) {
      parts.armL.rotation.x = Math.sin(t * 1.6) * 0.05;
      parts.armR.rotation.x = -Math.sin(t * 1.6) * 0.05;
    }
  }
}
