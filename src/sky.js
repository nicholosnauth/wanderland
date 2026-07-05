// Atmosphere: sky dome shader (sun disc, corona, haze), stars, drifting
// clouds, and the day/night cycle. Publishes ctx.time.{timeOfDay,sunUp,duskAmt,night}
// each frame so other systems (flora, settlement) can react to daylight.
import { CONFIG } from './config.js';

const P = {
  dayTop: new THREE.Color(0x3f78c0),  dayHor: new THREE.Color(0xd6e4ef),
  duskTop: new THREE.Color(0x6b4a86), duskHor: new THREE.Color(0xf5964f),
  nightTop: new THREE.Color(0x060a18), nightHor: new THREE.Color(0x16223a),
  fogDay: new THREE.Color(0xb8cadd), fogNight: new THREE.Color(0x10182a), fogDusk: new THREE.Color(0xdd9a63),
  sunDay: new THREE.Color(0xfff1dc), sunDusk: new THREE.Color(0xff9040),
};

let sky, skyUniforms, starMat, clouds, cloudMat;

export function init(ctx) {
  skyUniforms = {
    topColor:     { value: P.dayTop.clone() },
    horizonColor: { value: P.dayHor.clone() },
    sunDir:       { value: new THREE.Vector3(0, 1, 0) },
    sunColor:     { value: P.sunDay.clone() },
    haze:         { value: 0.5 },
  };
  sky = new THREE.Mesh(
    new THREE.SphereGeometry(1500, 28, 18),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyUniforms,
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 topColor, horizonColor, sunColor, sunDir; uniform float haze;
        varying vec3 vDir;
        void main(){
          float h = clamp(vDir.y, 0.0, 1.0);
          vec3 col = mix(horizonColor, topColor, pow(h, 0.62));
          float s = max(dot(normalize(vDir), normalize(sunDir)), 0.0);
          col += sunColor * pow(s, 900.0) * 5.0;
          col += sunColor * pow(s, 26.0) * 0.30;
          col += sunColor * pow(s, 4.0) * haze * 0.13;
          col = mix(col, vec3(dot(col, vec3(0.333))), (1.0 - h) * 0.08);
          gl_FragColor = vec4(col, 1.0);
        }`
    })
  );
  ctx.scene.add(sky);

  // stars
  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let i = 0; i < 600; i++) {
    const t = Math.random() * Math.PI * 2, p = Math.acos(Math.random() * 0.85);
    starPos.push(1450 * Math.sin(p) * Math.cos(t), 1450 * Math.cos(p), 1450 * Math.sin(p) * Math.sin(t));
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  ctx.scene.add(new THREE.Points(starGeo, starMat));

  // clouds
  cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.85 });
  clouds = [];
  for (let i = 0; i < CONFIG.CLOUD_COUNT; i++) {
    const g = new THREE.Group();
    const blobs = 3 + Math.floor(Math.random() * 3);
    for (let b = 0; b < blobs; b++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(9 + Math.random() * 11, 8, 6), cloudMat);
      m.position.set((b - blobs / 2) * 13 + Math.random() * 6, Math.random() * 4, Math.random() * 9);
      m.scale.y = 0.4;
      g.add(m);
    }
    g.position.set((Math.random() - 0.5) * 1700, 135 + Math.random() * 80, (Math.random() - 0.5) * 1700);
    ctx.scene.add(g);
    clouds.push({ g, speed: 1.5 + Math.random() * 2 });
  }

  ctx.time = { timeOfDay: CONFIG.START_TIME, sunUp: 1, duskAmt: 0, night: false };
}

export function update(ctx) {
  const { dt, t } = ctx.frame;
  const time = ctx.time;
  time.timeOfDay = (time.timeOfDay + dt / CONFIG.DAY_LENGTH) % 1;

  const ang = time.timeOfDay * Math.PI * 2 - Math.PI / 2;
  const sunDir = new THREE.Vector3(Math.cos(ang), Math.sin(ang), 0.3).normalize();
  const sunUp = Math.max(0, Math.sin(ang));
  const duskAmt = Math.max(0, 1 - Math.abs(Math.sin(ang)) * 3.2);
  time.sunUp = sunUp;
  time.duskAmt = duskAmt;
  time.night = sunUp < 0.08;

  // sun light follows the player so the shadow frustum stays useful
  ctx.sun.position.copy(ctx.player.pos).addScaledVector(sunDir, 240);
  ctx.sun.target.position.copy(ctx.player.pos);
  ctx.sun.intensity = 0.12 + sunUp * 2.7;
  ctx.sun.color.copy(P.sunDay).lerp(P.sunDusk, duskAmt);
  ctx.hemi.intensity = 0.16 + sunUp * 0.5;
  ctx.renderer.toneMappingExposure = 0.75 + sunUp * 0.5 + duskAmt * 0.1;

  // sky colors
  skyUniforms.sunDir.value.copy(sunDir);
  skyUniforms.topColor.value.copy(P.nightTop).lerp(P.dayTop, sunUp).lerp(P.duskTop, duskAmt * 0.6);
  skyUniforms.horizonColor.value.copy(P.nightHor).lerp(P.dayHor, sunUp).lerp(P.duskHor, duskAmt * 0.8);
  skyUniforms.sunColor.value.copy(P.sunDay).lerp(P.sunDusk, duskAmt);
  skyUniforms.haze.value = 0.3 + duskAmt * 0.9;
  ctx.scene.fog.color.copy(P.fogNight).lerp(P.fogDay, sunUp).lerp(P.fogDusk, duskAmt * 0.55);

  starMat.opacity = Math.max(0, 0.9 - sunUp * 3);
  cloudMat.opacity = 0.25 + sunUp * 0.6;

  for (const c of clouds) {
    c.g.position.x += c.speed * dt;
    if (c.g.position.x > 950) c.g.position.x = -950;
  }

  sky.position.copy(ctx.camera.position);

  const hrs = Math.floor(time.timeOfDay * 24), mins = Math.floor((time.timeOfDay * 24 % 1) * 60);
  ctx.hud.setClock(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
}
