// Vegetation and ambient particles: instanced ginkgo biloba trees with
// fan-shaped leaves, rocks, a 16k-instance wind-shader grass field, plus
// falling gold leaves (day) and fireflies (night) that follow the player.
import { CONFIG } from './config.js';
import { hash, scatterSpots, makeNoiseTexture } from './noise.js';

let grassUniforms, goldLeaves, fireflies;

/* ---------- ginkgo biloba ---------- */
function buildGinkgos(ctx, avoid) {
  const spots = scatterSpots(CONFIG.GINKGO_COUNT, CONFIG.WATER_Y + 1.6, 20, 2.3, avoid);
  const barkTex = makeNoiseTexture(128, 215, 80, 0.2, 2, 4);
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x9a9083, roughness: 0.92, map: barkTex });

  const dummy = new THREE.Object3D();
  const trunkMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.4, 4.8, 7), barkMat, spots.length);
  const BR = 4;
  const branchMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.13, 2.6, 5), barkMat, spots.length * BR);

  // the signature fan leaf: a circle sector
  const fanGeo = new THREE.CircleGeometry(0.95, 8, Math.PI / 2 - 1.05, 2.1);
  fanGeo.translate(0, 0.1, 0);
  const LV = 26;
  const leavesGold = new THREE.InstancedMesh(fanGeo,
    new THREE.MeshStandardMaterial({ color: 0xe6b83a, roughness: 0.6, side: THREE.DoubleSide }), spots.length * LV);
  const leavesChar = new THREE.InstancedMesh(fanGeo,
    new THREE.MeshStandardMaterial({ color: 0xc7cf4e, roughness: 0.62, side: THREE.DoubleSide }),
    Math.ceil(spots.length * LV * 0.45));

  let goldIdx = 0, charIdx = 0, brIdx = 0;
  spots.forEach((s, ti) => {
    const sc = 0.75 + hash(s[0], s[2]) * 0.9;
    const ry = hash(s[2], s[0]) * Math.PI * 2;
    dummy.position.set(s[0], s[1] + 2.4 * sc, s[2]);
    dummy.rotation.set(0, ry, (hash(s[0] * 3, s[2]) - 0.5) * 0.08);
    dummy.scale.setScalar(sc);
    dummy.updateMatrix();
    trunkMesh.setMatrixAt(ti, dummy.matrix);

    for (let b = 0; b < BR; b++) {
      const a = ry + b * (Math.PI * 2 / BR) + hash(ti, b) * 0.8;
      dummy.position.set(s[0] + Math.cos(a) * 0.5 * sc, s[1] + (2.6 + b * 0.55) * sc, s[2] + Math.sin(a) * 0.5 * sc);
      dummy.rotation.set(Math.cos(a) * 0.9, 0, -Math.sin(a) * 0.9);
      dummy.scale.setScalar(sc * (0.8 + hash(b, ti) * 0.4));
      dummy.updateMatrix();
      branchMesh.setMatrixAt(brIdx++, dummy.matrix);
    }

    const cy = s[1] + 4.6 * sc;
    for (let l = 0; l < LV; l++) {
      const u = hash(ti * 7, l), v = hash(l * 3, ti), w = hash(ti + l, l - ti);
      const theta = u * Math.PI * 2;
      const rad = Math.pow(v, 0.5) * 1.9 * sc;
      const yy = (w - 0.35) * 3.2 * sc;
      const pinch = 1 - Math.abs(yy) / (4 * sc);
      dummy.position.set(s[0] + Math.cos(theta) * rad * pinch, cy + yy, s[2] + Math.sin(theta) * rad * pinch);
      dummy.rotation.set(u * 6.28, v * 6.28, w * 6.28);
      dummy.scale.setScalar((0.7 + u * 0.7) * sc);
      dummy.updateMatrix();
      if ((l + ti) % 3 === 0 && charIdx < leavesChar.count) leavesChar.setMatrixAt(charIdx++, dummy.matrix);
      else leavesGold.setMatrixAt(goldIdx++, dummy.matrix);
    }
  });
  leavesGold.count = goldIdx;
  leavesChar.count = charIdx;
  [trunkMesh, branchMesh, leavesGold, leavesChar].forEach(m => { m.castShadow = true; ctx.scene.add(m); });
}

/* ---------- rocks ---------- */
function buildRocks(ctx) {
  const spots = scatterSpots(CONFIG.ROCK_COUNT, CONFIG.WATER_Y + 0.4, 44, 6, null);
  const tex = makeNoiseTexture(128, 215, 80, 0.2, 2, 2);
  const mesh = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({ color: 0x8b857c, roughness: 0.85, map: tex }), spots.length);
  const dummy = new THREE.Object3D();
  spots.forEach((s, i) => {
    const sc = 0.4 + Math.random() * 1.9;
    dummy.position.set(s[0], s[1] + sc * 0.25, s[2]);
    dummy.scale.set(sc * (0.8 + Math.random() * 0.6), sc * 0.65, sc);
    dummy.rotation.set(Math.random(), Math.random() * Math.PI, Math.random());
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.castShadow = true;
  ctx.scene.add(mesh);
}

/* ---------- grass ---------- */
function buildGrass(ctx, avoid) {
  const bladeGeo = new THREE.BufferGeometry();
  const v = [], uv = [], idx = [];
  [[1, 0, 0], [0, 0, 1]].forEach((n, q) => {
    const o = q * 4;
    v.push(-0.5 * n[0], 0, -0.5 * n[2], 0.5 * n[0], 0, 0.5 * n[2], 0.5 * n[0], 1, 0.5 * n[2], -0.5 * n[0], 1, -0.5 * n[2]);
    uv.push(0, 0, 1, 0, 1, 1, 0, 1);
    idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });
  bladeGeo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  bladeGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  bladeGeo.setIndex(idx);

  grassUniforms = {
    time: { value: 0 }, daylight: { value: 1 },
    fogColor: { value: ctx.scene.fog.color }, fogNear: { value: 110 }, fogFar: { value: 950 }
  };
  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide, uniforms: grassUniforms,
    vertexShader: `
      uniform float time;
      varying vec2 vUv; varying float vFogDepth;
      void main(){
        vUv = uv;
        vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
        float sway = sin(time * 2.1 + world.x * 0.34 + world.z * 0.3) * 0.17 * uv.y;
        world.x += sway; world.z += sway * 0.6;
        vec4 mv = viewMatrix * world;
        vFogDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 fogColor; uniform float fogNear, fogFar, daylight;
      varying vec2 vUv; varying float vFogDepth;
      void main(){
        vec3 bottom = vec3(0.20, 0.34, 0.13), top = vec3(0.45, 0.66, 0.27);
        vec3 col = mix(bottom, top, vUv.y) * (0.28 + daylight * 0.72);
        float f = smoothstep(fogNear, fogFar, vFogDepth);
        gl_FragColor = vec4(mix(col, fogColor, f), 1.0);
      }`
  });

  const spots = scatterSpots(CONFIG.GRASS_COUNT, CONFIG.WATER_Y + 1.4, 18, 2.4, avoid);
  const grass = new THREE.InstancedMesh(bladeGeo, mat, spots.length);
  const dummy = new THREE.Object3D();
  spots.forEach((s, i) => {
    dummy.position.set(s[0], s[1], s[2]);
    dummy.scale.set(0.8 + Math.random() * 0.9, 0.7 + Math.random() * 1.0, 0.8 + Math.random() * 0.9);
    dummy.rotation.set(0, Math.random() * Math.PI, 0);
    dummy.updateMatrix();
    grass.setMatrixAt(i, dummy.matrix);
  });
  ctx.scene.add(grass);
}

/* ---------- drifting particle clouds ---------- */
function driftCloud(ctx, n, color, size, spread, blend) {
  const geo = new THREE.BufferGeometry();
  const base = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    base[i * 3] = (Math.random() - 0.5) * spread;
    base[i * 3 + 1] = Math.random() * 14;
    base[i * 3 + 2] = (Math.random() - 0.5) * spread;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3));
  const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0, depthWrite: false, blending: blend || THREE.NormalBlending });
  const pts = new THREE.Points(geo, mat);
  ctx.scene.add(pts);
  return { pts, geo, mat, base, n };
}

export function init(ctx) {
  const avoid = [
    [CONFIG.PLATEAU_X, CONFIG.PLATEAU_Z, CONFIG.PLATEAU_RADIUS + 4],
    [0, 0, 14],
  ];
  buildGinkgos(ctx, avoid);
  buildRocks(ctx);
  buildGrass(ctx, avoid);
  goldLeaves = driftCloud(ctx, CONFIG.LEAF_PARTICLES, 0xe8bc45, 0.22, 80);
  fireflies = driftCloud(ctx, CONFIG.FIREFLY_PARTICLES, 0xc8ffa0, 0.26, 85, THREE.AdditiveBlending);
}

export function update(ctx) {
  const { dt, t } = ctx.frame;
  grassUniforms.time.value = t;
  grassUniforms.daylight.value = ctx.time.sunUp;
  grassUniforms.fogColor.value = ctx.scene.fog.color;

  const night = ctx.time.night;
  goldLeaves.mat.opacity += ((!night ? 0.85 : 0) - goldLeaves.mat.opacity) * Math.min(1, dt * 1.2);
  fireflies.mat.opacity += ((night ? 0.9 : 0) - fireflies.mat.opacity) * Math.min(1, dt * 1.5);

  for (const cloud of [goldLeaves, fireflies]) {
    if (cloud.mat.opacity < 0.02) continue;
    cloud.pts.position.x += (ctx.player.pos.x - cloud.pts.position.x) * dt * 0.4;
    cloud.pts.position.z += (ctx.player.pos.z - cloud.pts.position.z) * dt * 0.4;
    cloud.pts.position.y = ctx.player.pos.y;
    const p = cloud.geo.attributes.position;
    const falling = cloud === goldLeaves;
    for (let i = 0; i < cloud.n; i++) {
      if (falling) {
        let y = p.getY(i) - dt * (0.6 + hash(i, 3) * 0.7);
        if (y < -1) y = 13;
        p.setY(i, y);
        p.setX(i, cloud.base[i * 3] + Math.sin(t * 0.8 + i) * 1.6);
      } else {
        p.setY(i, cloud.base[i * 3 + 1] * 0.5 + Math.sin(t * 1.3 + i) * 0.8 + 0.6);
        p.setX(i, cloud.base[i * 3] + Math.sin(t * 0.5 + i * 2.1) * 1.5);
      }
    }
    p.needsUpdate = true;
  }
}
