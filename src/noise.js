// Pure functions: noise, terrain height field, procedural textures, scattering.
// Everything here is deterministic given the same inputs (except scatterSpots,
// which intentionally uses Math.random for varied placement per load).
import { CONFIG } from './config.js';

export function hash(x, z) {
  let h = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

export function smoothNoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z);
  const xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x, z) {
  let val = 0, amp = 1, freq = 1, tot = 0;
  for (let i = 0; i < 5; i++) {
    val += smoothNoise(x * freq, z * freq) * amp;
    tot += amp; amp *= 0.5; freq *= 2.13;
  }
  return val / tot;
}

/** World height at (x, z). The single source of truth used by terrain,
 *  physics, scattering, and building placement. */
export function terrainHeight(x, z) {
  const { WORLD, PLATEAU_X, PLATEAU_Z, PLATEAU_RADIUS, PLATEAU_HEIGHT } = CONFIG;
  const nx = x / 95, nz = z / 95;
  let h = Math.pow(fbm(nx, nz), 1.6) * 52;
  const d = Math.sqrt(x * x + z * z) / (WORLD * 0.55);
  h *= Math.max(0, 1 - d * d);
  const dt = Math.hypot(x - PLATEAU_X, z - PLATEAU_Z);
  if (dt < PLATEAU_RADIUS) {
    h = h * (dt / PLATEAU_RADIUS) + PLATEAU_HEIGHT * (1 - dt / PLATEAU_RADIUS);
  }
  return h;
}

/** Grayscale fbm canvas texture — used for terrain detail, roughness, bark. */
export function makeNoiseTexture(size, base, variance, grain, repeatX, repeatY) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const x = i % size, y = (i / size) | 0;
    let n = 0, amp = 1, f = grain;
    for (let o = 0; o < 4; o++) { n += smoothNoise(x * f + 7, y * f + 13) * amp; amp *= 0.5; f *= 2; }
    n /= 1.875;
    const v = Math.max(0, Math.min(255, base + (n - 0.5) * variance));
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

/** Find `count` positions on terrain matching height/slope limits,
 *  optionally avoiding circles [[x, z, radius], ...]. Returns [x, y, z][]. */
export function scatterSpots(count, minH, maxH, maxSlope, avoid) {
  const { WORLD } = CONFIG;
  const spots = [];
  let tries = 0;
  while (spots.length < count && tries < count * 40) {
    tries++;
    const x = (Math.random() - 0.5) * WORLD * 1.85;
    const z = (Math.random() - 0.5) * WORLD * 1.85;
    const h = terrainHeight(x, z);
    if (h < minH || h > maxH) continue;
    const slope = Math.abs(terrainHeight(x + 2, z) - h) + Math.abs(terrainHeight(x, z + 2) - h);
    if (slope > maxSlope) continue;
    if (avoid && avoid.some(a => Math.hypot(x - a[0], z - a[1]) < a[2])) continue;
    spots.push([x, h, z]);
  }
  return spots;
}
