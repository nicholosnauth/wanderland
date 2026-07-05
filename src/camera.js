// Third-person orbit camera: mouse controls yaw/pitch, scroll controls
// distance, camera lerps toward its target and stays above the terrain.
import { CONFIG } from './config.js';
import { terrainHeight } from './noise.js';

export function init(ctx) {
  ctx.cam = { yaw: 0.6, pitch: 0.3, dist: CONFIG.CAM_START_DIST };

  document.addEventListener('mousemove', e => {
    if (!document.pointerLockElement) return;
    ctx.cam.yaw -= e.movementX * 0.0023;
    ctx.cam.pitch += e.movementY * 0.0023;
    ctx.cam.pitch = Math.max(-0.5, Math.min(1.25, ctx.cam.pitch));
  });

  addEventListener('wheel', e => {
    ctx.cam.dist = Math.max(CONFIG.CAM_MIN_DIST, Math.min(CONFIG.CAM_MAX_DIST, ctx.cam.dist + e.deltaY * 0.004));
  });
}

export function update(ctx) {
  const { dt } = ctx.frame;
  const cam = ctx.cam;
  const p = ctx.player.pos;

  const target = new THREE.Vector3(
    p.x + Math.sin(cam.yaw) * Math.cos(cam.pitch) * cam.dist,
    p.y + 1.6 + Math.sin(cam.pitch) * cam.dist,
    p.z + Math.cos(cam.yaw) * Math.cos(cam.pitch) * cam.dist
  );
  const minY = terrainHeight(target.x, target.z) + 0.5;
  if (target.y < minY) target.y = minY;

  ctx.camera.position.lerp(target, Math.min(1, dt * 10));
  ctx.camera.lookAt(p.x, p.y + 1.5, p.z);
}
