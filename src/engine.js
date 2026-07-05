// Rendering foundation: scene, camera, WebGL renderer with the filmic
// pipeline (ACES tone mapping + sRGB), the lighting rig, and resize handling.

export function init(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 1800);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  document.body.appendChild(renderer.domElement);

  // lighting rig
  const hemi = new THREE.HemisphereLight(0xbdd7f5, 0x54513c, 0.55);
  const bounce = new THREE.AmbientLight(0x334455, 0.12);
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.camera.left = -85; sun.shadow.camera.right = 85;
  sun.shadow.camera.top = 85; sun.shadow.camera.bottom = -85;
  sun.shadow.camera.far = 550;
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.02;
  scene.add(hemi, bounce, sun, sun.target);

  scene.fog = new THREE.Fog(0xb8cadd, 110, 950);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  ctx.scene = scene;
  ctx.camera = camera;
  ctx.renderer = renderer;
  ctx.sun = sun;
  ctx.hemi = hemi;
}

export function render(ctx) {
  ctx.renderer.render(ctx.scene, ctx.camera);
}
