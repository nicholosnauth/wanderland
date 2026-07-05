// Composition root: initializes every system in dependency order, then
// runs the loop. Each system exposes init(ctx) and optionally update(ctx);
// they communicate only through the shared ctx object.
//
// To add a new system (wildlife, combat, weather...):
//   1. create src/yoursystem.js with init(ctx) / update(ctx)
//   2. import it here and add it to the lists below
import * as engine from './engine.js';
import * as hud from './hud.js';
import * as sky from './sky.js';
import * as terrain from './terrain.js';
import * as water from './water.js';
import * as flora from './flora.js';
import * as settlement from './settlement.js';
import * as player from './player.js';
import * as character from './character.js';
import * as camera from './camera.js';
import * as collectibles from './collectibles.js';

const ctx = {};

// init order: engine first (creates scene), player before sky/flora
// (they read ctx.player), hud before anything that toasts.
const systems = [engine, hud, player, camera, sky, terrain, water, flora, settlement, character, collectibles];
for (const s of systems) s.init(ctx);

// update order: input/physics → visuals that depend on player →
// world systems → camera last-ish so it follows this frame's position.
const updaters = [player, character, camera, sky, water, flora, settlement, collectibles];

const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  ctx.frame = { dt: Math.min(clock.getDelta(), 0.05), t: clock.elapsedTime };
  for (const s of updaters) s.update(ctx);
  engine.render(ctx);
}
loop();
