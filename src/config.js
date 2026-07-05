// All game tunables live here. Change numbers, refresh, play.
export const CONFIG = {
  // world
  WORLD: 620,            // half-size of the map in meters
  WATER_Y: 1.2,          // sea level
  TERRAIN_SEGMENTS: 250, // heightmap resolution

  // day/night
  DAY_LENGTH: 300,       // seconds per full cycle
  START_TIME: 0.30,      // 0..1 (0.25 ≈ sunrise, 0.5 ≈ noon)

  // player
  RUN_SPEED: 7.2,
  SPRINT_SPEED: 13.5,
  JUMP_VELOCITY: 10,
  GRAVITY: 26,
  GLIDE_FALL_SPEED: 2.2,
  GLIDE_PUSH: 6,

  // stamina
  STAMINA_MAX: 100,
  SPRINT_DRAIN: 14,      // per second
  GLIDE_DRAIN: 9,
  STAMINA_REGEN: 22,
  EXHAUST_RECOVER_AT: 28,

  // camera
  CAM_MIN_DIST: 3,
  CAM_MAX_DIST: 12,
  CAM_START_DIST: 6.5,

  // content counts
  ORB_TOTAL: 20,
  GINKGO_COUNT: 380,
  GRASS_COUNT: 16000,
  ROCK_COUNT: 240,
  CLOUD_COUNT: 14,
  LEAF_PARTICLES: 220,
  FIREFLY_PARTICLES: 150,

  // settlement (plateau center)
  PLATEAU_X: 40,
  PLATEAU_Z: -60,
  PLATEAU_RADIUS: 60,
  PLATEAU_HEIGHT: 24,
  MONORAIL_RADIUS: 46,
  DOME_COUNT: 6,

  // relay pylons out in the wild [x, z]
  RELAY_POSITIONS: [[-180, 150], [220, 180], [-120, -260]],
};
