# Wanderland — Neo Valley

Open-world exploration game in Three.js. Ginkgo groves, retro-futuristic
settlement, day/night cycle, glider, stamina, 20 spirit lights to collect.

## Run it

Browsers block ES module imports over `file://`, so serve the folder:

```bash
cd wanderland
python3 -m http.server 8000
```

Then open http://localhost:8000

Any static server works (`npx serve`, VS Code Live Server, etc.).

## Controls

| Input | Action |
|---|---|
| WASD | move |
| Shift | sprint (drains stamina) |
| Space | jump; hold while falling to glide |
| Mouse | orbit camera |
| Scroll | zoom |
| Esc | release cursor |

## Architecture

Every system is a module exporting `init(ctx)` and optionally `update(ctx)`.
Systems never import each other's internals; they communicate through the
shared `ctx` object that `main.js` passes around:

```
ctx.scene / ctx.camera / ctx.renderer / ctx.sun / ctx.hemi   (engine)
ctx.player   { pos, vel, facing, stamina, gliding, ... }     (player)
ctx.cam      { yaw, pitch, dist }                            (camera)
ctx.time     { timeOfDay, sunUp, duskAmt, night }            (sky)
ctx.frame    { dt, t }                                       (main loop)
ctx.hud      { toast, setStamina, setClock, setOrbs }        (hud)
ctx.keys     keyboard state                                  (player)
```

```
src/
  config.js       every tunable number in one place
  noise.js        pure functions: noise, terrainHeight, textures, scatter
  engine.js       renderer, scene, lighting rig, ACES pipeline
  sky.js          sky shader, stars, clouds, day/night cycle
  terrain.js      heightmap mesh + biome coloring
  water.js        animated wave surface
  flora.js        ginkgos, grass wind shader, rocks, leaf/firefly particles
  settlement.js   Aurora Spire, domes, monorail, relay pylons
  player.js       physics, stamina, glide, keyboard
  character.js    hero mesh + procedural animation
  camera.js       third-person orbit follow, mouse input
  collectibles.js spirit lights
  hud.js          all DOM: overlay, banner, toasts, stamina ring
  main.js         composition root + game loop
```

`noise.terrainHeight(x, z)` is the single source of truth for ground height,
shared by rendering, physics, and placement — change it and everything
(terrain mesh, collision, tree placement, building foundations) stays in sync.

## Adding a system

1. Create `src/wildlife.js`:
   ```js
   export function init(ctx) { /* build meshes, add to ctx.scene */ }
   export function update(ctx) { /* use ctx.frame.dt, ctx.player, ctx.time */ }
   ```
2. In `main.js`, import it and add to `systems` and `updaters`.

## Tuning

Open `src/config.js`. World size, day length, movement speeds, stamina rates,
tree/grass counts, plateau location — all there. No hunting through code.
