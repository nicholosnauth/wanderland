// Player state and physics: camera-relative movement, jumping, gravity,
// gliding, stamina/exhaustion, terrain collision, and world bounds.
// Owns the keyboard; the camera module owns the mouse.
import { CONFIG } from './config.js';
import { terrainHeight } from './noise.js';

export function init(ctx) {
  ctx.player = {
    pos: new THREE.Vector3(0, terrainHeight(0, 0) + 0.1, 0),
    vel: new THREE.Vector3(),
    facing: 0,
    moving: false,
    sprinting: false,
    gliding: false,
    onGround: true,
    stamina: CONFIG.STAMINA_MAX,
    exhausted: false,
    moveDir: new THREE.Vector3(),   // world-space intent, read by character.js
  };

  ctx.keys = {};
  addEventListener('keydown', e => { ctx.keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); });
  addEventListener('keyup', e => ctx.keys[e.code] = false);
}

export function update(ctx) {
  const { dt } = ctx.frame;
  const p = ctx.player;
  const keys = ctx.keys;
  const C = CONFIG;

  /* ---- input intent (camera-relative) ---- */
  let moveX = 0, moveZ = 0;
  if (document.pointerLockElement) {
    if (keys['KeyW']) moveZ -= 1;
    if (keys['KeyS']) moveZ += 1;
    if (keys['KeyA']) moveX -= 1;
    if (keys['KeyD']) moveX += 1;
  }
  p.moving = moveX !== 0 || moveZ !== 0;

  if (p.moving) {
    const f = new THREE.Vector3(-Math.sin(ctx.cam.yaw), 0, -Math.cos(ctx.cam.yaw));
    const r = new THREE.Vector3(-f.z, 0, f.x);
    p.moveDir.copy(f.multiplyScalar(-moveZ)).addScaledVector(r, moveX).normalize();
  } else {
    p.moveDir.set(0, 0, 0);
  }

  const wantSprint = (keys['ShiftLeft'] || keys['ShiftRight']) && p.moving && p.onGround;
  p.sprinting = wantSprint && !p.exhausted && p.stamina > 0;
  const speed = p.sprinting ? C.SPRINT_SPEED : C.RUN_SPEED;

  /* ---- horizontal velocity ---- */
  const accel = p.onGround ? 12 : 4;
  p.vel.x += (p.moveDir.x * speed - p.vel.x) * Math.min(1, dt * accel);
  p.vel.z += (p.moveDir.z * speed - p.vel.z) * Math.min(1, dt * accel);

  /* ---- jump / glide / gravity ---- */
  if (keys['Space'] && p.onGround) { p.vel.y = C.JUMP_VELOCITY; p.onGround = false; }

  p.gliding = !p.onGround && keys['Space'] && p.vel.y < 0 && !p.exhausted && p.stamina > 0;
  if (p.gliding) {
    p.vel.y = Math.max(p.vel.y - C.GRAVITY * dt, -C.GLIDE_FALL_SPEED);
    if (p.moving) {
      p.vel.x += p.moveDir.x * C.GLIDE_PUSH * dt;
      p.vel.z += p.moveDir.z * C.GLIDE_PUSH * dt;
    }
    p.stamina -= C.GLIDE_DRAIN * dt;
  } else {
    p.vel.y -= C.GRAVITY * dt;
  }

  /* ---- stamina ---- */
  if (p.sprinting) p.stamina -= C.SPRINT_DRAIN * dt;
  else if (p.onGround && !p.gliding) p.stamina += C.STAMINA_REGEN * dt;
  p.stamina = Math.max(0, Math.min(C.STAMINA_MAX, p.stamina));
  if (p.stamina <= 0) p.exhausted = true;
  if (p.exhausted && p.stamina > C.EXHAUST_RECOVER_AT) p.exhausted = false;
  ctx.hud.setStamina(p.stamina / C.STAMINA_MAX, p.exhausted);

  /* ---- integrate & collide with terrain ---- */
  p.pos.addScaledVector(p.vel, dt);
  const groundH = Math.max(terrainHeight(p.pos.x, p.pos.z), C.WATER_Y - 0.35);
  if (p.pos.y <= groundH) {
    p.pos.y = groundH;
    p.vel.y = 0;
    p.onGround = true;
    p.gliding = false;
  } else if (p.pos.y > groundH + 0.05) {
    p.onGround = false;
  }

  /* ---- soft world boundary ---- */
  const d = Math.hypot(p.pos.x, p.pos.z);
  const limit = C.WORLD * 0.95;
  if (d > limit) {
    p.pos.x *= limit / d;
    p.pos.z *= limit / d;
  }

  /* ---- facing (turn toward movement) ---- */
  if (p.moving) {
    const target = Math.atan2(p.moveDir.x, p.moveDir.z);
    let diff = target - p.facing;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    p.facing += diff * Math.min(1, dt * 12);
  }
}
