import { PATTERNS, TILE_SIZE } from "./patterns.js";
import {
  createEntityHost,
  updateMouseWorld,
  mouse,
  death,
  toggleToggleDeath,
  toggleTripmineLeniency,
} from "./entityHost.js";
import { setup as spawnBell } from "./Enemies/Bell.js";
import { setup as spawnMart } from "./Enemies/Mart.js";
import { setup as spawnBaby } from "./Enemies/Baby.js";
import { setup as spawnICBM } from "./Enemies/ICBM.js";
import { setup as spawnSkinwalker } from "./Enemies/Skinwalker.js";
import { setup as spawnSpringer } from "./Enemies/Springer.js";
import { setup as spawnVoidboundBaby } from "./Enemies/VoidboundBaby.js";
import { setup as spawnFlesh } from "./Enemies/Flesh.js";
import { setup as spawnNIL } from "./Enemies/NIL.js";
import { setup as spawnGuardian } from "./Enemies/Guardian.js";
import { setup as spawnDozer } from "./Enemies/Dozer.js";
import { setup as spawnTelefragger } from "./Enemies/Telefragger.js";
import { setup as spawnSeamine } from "./Enemies/Seamine.js";
import { setup as spawnKookoo } from "./Enemies/Kookoo.js";
import { setup as spawnVoidImplosions } from "./Enemies/VoidImplosions.js";
import { setup as spawnSorrow } from "./Enemies/Sorrow.js";
import { setup as spawnDoombringer } from "./Enemies/Doombringer.js";
import { setup as spawnPonderer } from "./Enemies/Ponderer.js";
import { setup as spawnVoidbreaker } from "./Enemies/Voidbreaker.js";
import { setup as spawnCadence } from "./Enemies/Cadence.js";
import { setup as spawnVoidboundGuardian } from "./Enemies/VoidboundGuardian.js";

const canvas = document.getElementById("screen");
const entityCanvas = document.getElementById("entities");
const viewport = document.getElementById("viewport");
const ctx = canvas.getContext("2d");
const counterEl = document.getElementById("counter");
const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");
const graphicsSlider = document.getElementById("graphics-slider");
const panel = document.getElementById("entity-panel");
const content = document.getElementById("entity-panel-content");
const entityCounts = new Map();

const entityHost = createEntityHost(entityCanvas, ctx);
let panelOpen = false;
let lastEntitySpawnAt = 0;
let lastEntityPicked;
let tripmineExplosion = null;
let isSeamineEnabled = false;
let lastCursorInfectAt = 0;
let sorrowActive = false;
let skinwalkerCount = 0;
let babyCount = 0;
const spawnedUnstackables = new Set();
export let voidbreakerCount = 0;
export let voidbreakerActive;
export function setVoidbreakerActive(v) {
  voidbreakerActive = v;
}
export function setSorrowActive(v) {
  sorrowActive = v;
}
export const fleshPositions = new Set();
export const cleanseZones = [];
const ENTITY_POOL = [
  {
    name: "Bell",
    spawn: () => spawnBell(entityHost),
    start: 100,
    src: "./ASSET/Enemies/Bell.png",
  },
  {
    name: "Mart",
    spawn: () => spawnMart(entityHost),
    start: 100,
    src: "./ASSET/Enemies/Mart.png",
  },
  {
    name: "Baby",
    spawn: () => spawnBaby(entityHost),
    start: 100,
    src: "./ASSET/Enemies/Baby.png",
  },
  {
    name: "ICBM",
    spawn: () => spawnICBM(entityHost),
    start: 100,
    src: "./ASSET/Enemies/ICBM.png",
  },
  {
    name: "Skinwalker",
    spawn: () => spawnSkinwalker(entityHost, skinwalkerCount++),
    start: 100,
    src: "./ASSET/Enemies/Skinwalker.png",
  },
  {
    name: "Springer",
    spawn: () => spawnSpringer(entityHost),
    start: 100,
    src: "./ASSET/Enemies/Springer.png",
  },
  {
    name: "VoidboundBaby",
    spawn: () => spawnVoidboundBaby(entityHost),
    start: 200,
    src: "./ASSET/Enemies/VoidboundBaby.png",
  },
  {
    name: "Flesh",
    spawn: () => spawnFlesh(entityHost),
    start: 500,
    src: "./ASSET/Enemies/Flesh.png",
  },
  {
    name: "NIL",
    spawn: () => spawnNIL(entityHost),
    start: 500,
    src: "./ASSET/Enemies/NIL.png",
  },
  {
    name: "Guardian",
    spawn: () => spawnGuardian(entityHost),
    start: 500,
    src: "./ASSET/Enemies/Guardian.png",
  },
  {
    name: "Dozer",
    spawn: () => spawnDozer(entityHost),
    start: 500,
    src: "./ASSET/Enemies/Dozer.png",
    unstackable: true,
  },
  {
    name: "Telefragger",
    spawn: () => spawnTelefragger(entityHost),
    start: 800,
    src: "./ASSET/Enemies/Telefragger.png",
  },
  {
    name: "Random",
    start: 800,
    src: "./ASSET/Enemies/Random.png",
  },
  {
    name: "Random",
    start: 1300,
    src: "./ASSET/Enemies/Random.png",
  },
  {
    name: "Random",
    start: 1800,
    src: "./ASSET/Enemies/Random.png",
  },
  {
    name: "Kookoo",
    spawn: () => spawnKookoo(entityHost),
    start: 1000,
    src: "./ASSET/Enemies/Kookoo.png",
    unstackable: true,
  },
  {
    name: "VoidImplosions",
    spawn: () => spawnVoidImplosions(entityHost),
    start: 1000,
    src: "./ASSET/Curses/VoidImplosions.png",
    unstackable: true,
  },
  {
    name: "Sorrow",
    spawn: () => spawnSorrow(entityHost),
    start: 1000,
    src: "./ASSET/Curses/Sorrow.png",
    unstackable: true,
  },
  {
    name: "Doombringer",
    spawn: () => spawnDoombringer(entityHost),
    start: 1000,
    src: "./ASSET/Curses/Doombringer.png",
    unstackable: true,
  },
  {
    name: "Ponderer",
    spawn: () => spawnPonderer(entityHost),
    start: 1200,
    src: "./ASSET/Enemies/Ponderer.png",
    rare: true,
  },
  {
    name: "Voidbreaker",
    spawn: () => spawnVoidbreaker(entityHost, voidbreakerCount++),
    start: 1500,
    src: "./ASSET/Enemies/Voidbreaker.png",
  },
  {
    name: "Cadence",
    spawn: () => spawnCadence(entityHost),
    start: 1500,
    src: "./ASSET/Enemies/Cadence.png",
    unstackable: true,
  },
  {
    name: "VoidboundGuardian",
    spawn: () => spawnVoidboundGuardian(entityHost),
    start: 2000,
    src: "./ASSET/Enemies/VoidboundGuardian.png",
  },
  // catalyst
];

const gift = new Image();
gift.src = "./ASSET/Misc/Gifts.png";
const goldGift = new Image();
goldGift.src = "./ASSET/Misc/GoldGifts.png";
const tripmine = new Image();
tripmine.src = "./ASSET/Curses/Tripmine.png";

/* ===== SETTINGS ===== */
let settingsEnabled = true;
let showBorder = JSON.parse(localStorage.getItem("border")) ?? true;
let showFloor = JSON.parse(localStorage.getItem("floor")) ?? true;
let showGrids = JSON.parse(localStorage.getItem("grids")) ?? false;
let reducedMotion = JSON.parse(localStorage.getItem("reduced-motion")) ?? false;
let epilepticMode = JSON.parse(localStorage.getItem("epileptic")) ?? false;
let blindnessMode = JSON.parse(localStorage.getItem("blindness")) ?? false;
let drunkCamera = JSON.parse(localStorage.getItem("drunk-camera")) ?? false;
let accurateCursor =
  JSON.parse(localStorage.getItem("accurate-cursor")) ?? false;
let sfxVolume = Number(localStorage.getItem("sfxVolume")) * 100 || 50;
graphicsSlider.value = Number(localStorage.getItem("graphicsLevel")) || 0;

document.getElementById("toggle-grids").checked = showGrids;
document.getElementById("toggle-floor").checked = showFloor;
document.getElementById("toggle-border").checked = showBorder;
document.getElementById("toggle-epileptic").checked = epilepticMode;
document.getElementById("toggle-blindness").checked = blindnessMode;
document.getElementById("toggle-reduced-motion").checked = reducedMotion;
document.getElementById("toggle-drunk-camera").checked = drunkCamera;
document.getElementById("toggle-accurate-cursor").checked = accurateCursor;
document.getElementById("sfx-volume").value = sfxVolume;
graphicsSlider.dispatchEvent(new Event("input"));

settingsBtn.addEventListener("click", () => {
  if (settingsPanel.style.display === "block") {
    settingsPanel.style.display = "none";
  } else {
    settingsPanel.style.display = "block";
  }
});
graphicsSlider.addEventListener("input", () => {
  const v = Number(graphicsSlider.value);
  localStorage.setItem("graphicsLevel", graphicsSlider.value);

  if (v === 0) setGraphicsLow();
  else if (v === 1) setGraphicsMedium();
  else if (v === 2) setGraphicsHigh();
  else setGraphicsUltra();
});
toggle("toggle-grids", (v) => {
  showGrids = v;
});
toggle("toggle-floor", (v) => {
  showFloor = v;
});
toggle("toggle-border", (v) => {
  showBorder = v;
  canvas.style.boxShadow = showBorder
    ? "0 0 240px rgba(255, 0, 0, 0.5), 0 0 240px rgba(255, 0, 0, 0.5), inset 0 0 240px rgba(255, 0, 0, 0.5)"
    : "0 0 240px rgba(255, 0, 0, 0.1), 0 0 240px rgba(255, 0, 0, 0.1), inset 0 0 240px rgba(255, 0, 0, 0.1)";
});
toggle("toggle-epileptic", (v) => {
  epilepticMode = v;
  canvas.style.animation = epilepticMode
    ? "bg-epileptic-lol 1s infinite"
    : "bg 60s infinite";
});
toggle("toggle-blindness", (v) => {
  blindnessMode = v;
  RENDER_RADIUS =
    cheat >= 8 && cheat <= 16
      ? RESPAWN_RADIUS * 10
      : blindnessMode
      ? 200
      : RESPAWN_RADIUS * 1.3;
});
toggle("toggle-reduced-motion", (v) => {
  reducedMotion = v;
});
toggle("toggle-drunk-camera", (v) => {
  drunkCamera = v;
});
toggle("toggle-accurate-cursor", (v) => {
  accurateCursor = v;
  if (accurateCursor) {
    canvas.style.cursor = "none";
    entityCanvas.style.cursor = "none";
  } else {
    canvas.style.cursor = "auto";
    entityCanvas.style.cursor = "auto";
  }
});
document.getElementById("sfx-volume").oninput = (e) => {
  sfxVolume = e.target.value / 100;
  localStorage.setItem("sfxVolume", sfxVolume);
  // TODO: add sfx on gift
};
function toggle(id, fn) {
  const el = document.getElementById(id);
  el.onchange = () => {
    fn(el.checked);
    localStorage.setItem(id.replace("toggle-", ""), el.checked);
  };
}
function setGraphicsLow() {
  REGEN_BUDGET = 8;
  REGEN_INTERVAL = 400;
  DESPAWN_RADIUS = SUPER_TILE * TILE * 6;
  RESPAWN_RADIUS = SUPER_TILE * TILE * 4.5;
  RENDER_RADIUS =
    cheat >= 8 && cheat <= 16
      ? RESPAWN_RADIUS * 10
      : blindnessMode
      ? 200
      : RESPAWN_RADIUS * 1.3;
}
function setGraphicsMedium() {
  REGEN_BUDGET = 12;
  REGEN_INTERVAL = 300;
  DESPAWN_RADIUS = SUPER_TILE * TILE * 7.5;
  RESPAWN_RADIUS = SUPER_TILE * TILE * 6;
  RENDER_RADIUS =
    cheat >= 8 && cheat <= 16
      ? RESPAWN_RADIUS * 10
      : blindnessMode
      ? 200
      : RESPAWN_RADIUS * 1.3;
}
function setGraphicsHigh() {
  REGEN_BUDGET = 18;
  REGEN_INTERVAL = 180;
  DESPAWN_RADIUS = SUPER_TILE * TILE * 10;
  RESPAWN_RADIUS = SUPER_TILE * TILE * 8;
  RENDER_RADIUS =
    cheat >= 8 && cheat <= 16
      ? RESPAWN_RADIUS * 10
      : blindnessMode
      ? 200
      : RESPAWN_RADIUS * 1.3;
}
function setGraphicsUltra() {
  REGEN_BUDGET = 28;
  REGEN_INTERVAL = 100;
  DESPAWN_RADIUS = SUPER_TILE * TILE * 14;
  RESPAWN_RADIUS = SUPER_TILE * TILE * 11;
  RENDER_RADIUS = blindnessMode ? 200 : RESPAWN_RADIUS * 10;
}

document.getElementById("reset-settings").onclick = () => {
  localStorage.removeItem("border");
  localStorage.removeItem("floor");
  localStorage.removeItem("grids");
  localStorage.removeItem("reduced-motion");
  localStorage.removeItem("epileptic");
  localStorage.removeItem("blindness");
  localStorage.removeItem("drunk-camera");
  localStorage.removeItem("accurate-cursor");
  localStorage.removeItem("graphicsLevel");
  localStorage.removeItem("sfxVolume");
  showBorder = true;
  showFloor = true;
  showGrids = false;
  reducedMotion = false;
  epilepticMode = false;
  blindnessMode = false;
  drunkCamera = false;
  accurateCursor = false;
  sfxVolume = 0.5;
  document.getElementById("toggle-border").checked = true;
  document.getElementById("toggle-floor").checked = true;
  document.getElementById("toggle-grids").checked = false;
  document.getElementById("toggle-reduced-motion").checked = false;
  document.getElementById("toggle-epileptic").checked = false;
  document.getElementById("toggle-blindness").checked = false;
  document.getElementById("toggle-drunk-camera").checked = false;
  document.getElementById("toggle-accurate-cursor").checked = false;
  document.getElementById("sfx-volume").value = 50;
  graphicsSlider.value = 0;
  graphicsSlider.dispatchEvent(new Event("input"));
  canvas.style.animation = "bg 60s infinite";
  canvas.style.boxShadow =
    "0 0 240px rgba(255, 0, 0, 0.5), 0 0 240px rgba(255, 0, 0, 0.5), inset 0 0 240px rgba(255, 0, 0, 0.5)";
  if (accurateCursor) {
    canvas.style.cursor = "none";
    entityCanvas.style.cursor = "none";
  } else {
    canvas.style.cursor = "auto";
    entityCanvas.style.cursor = "auto";
  }

  RENDER_RADIUS = RESPAWN_RADIUS * 1.3;
};

/* ===== CONFIG ===== */
canvas.width = 10000;
canvas.height = 10000;
entityCanvas.width = 10000;
entityCanvas.height = 10000;

const MAX_SPEED = 20;
const GRID_DIVS = 10;
const GIFT_SIZE = 30;
let HIT_RADIUS = GIFT_SIZE;
let cameraRadius = 0.4;
let dynamicHitRadius;
const randTile = Math.random();
let cheat = 0;
const SUPER_TILE = 9;
let lagDebt = 0;
let lagFactor = 1;

/* ===== EVENTS ===== */
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.key === "/") cheat++;
  if (cheat >= 8 && cheat <= 16) {
    HIT_RADIUS = GIFT_SIZE * 10;
    RENDER_RADIUS = RESPAWN_RADIUS * 10;
  } else {
    HIT_RADIUS = GIFT_SIZE;
    RENDER_RADIUS = RESPAWN_RADIUS * 1.3;
  }
  if (e.key === "\\") {
    if (topLeftInput.style.display === "none") {
      topLeftInput.value = "";
      topLeftInput.style.display = "block";
      topLeftInput.focus();
    } else {
      topLeftInput.value = "";
      topLeftInput.style.display = "none";
      topLeftInput.blur();
    }
  }
  if (e.key.toLowerCase() === "m") {
    panelOpen = !panelOpen;
    panel.classList.toggle("open", panelOpen);
  }
});
const topLeftInput = document.getElementById("spawn-input");
topLeftInput.addEventListener("input", () => {
  const input = topLeftInput.value.trim().toLowerCase();
  if (input === "\\") topLeftInput.value = "";
  const entity = ENTITY_POOL.find((e) => e.name.toLowerCase() === input);
  if (entity) {
    if (entity.name === "Random") {
      const randUnlocked = ENTITY_POOL.filter((e) => {
        if (e.name === "Random") return false;
        if (collectedCount < e.start) return false;
        if (e.unstackable) return false;
        return true;
      });
      if (randUnlocked.length !== 0) {
        let randPick = randUnlocked[(Math.random() * randUnlocked.length) | 0];
        randPick.spawn();
        registerEntitySpawn(entity.name, entity.src);
      }
    } else {
      entity.spawn();
      registerEntitySpawn(entity.name, entity.src);
    }
    topLeftInput.value = "";
    topLeftInput.style.display = "none";
    topLeftInput.blur();
  }
  if (input === "toggledeath") {
    toggleToggleDeath();
    topLeftInput.value = "";
    topLeftInput.style.display = "none";
    topLeftInput.blur();
  }
});
let reducedMotionHoldActive = false;
let reducedMotionBeforeHold = reducedMotion;
window.addEventListener("keydown", (e) => {
  if (reducedMotionHoldActive) return;
  if (e.key !== "Shift" && e.key !== "Control") return;

  reducedMotionHoldActive = true;
  reducedMotionBeforeHold = reducedMotion;
  reducedMotion = !reducedMotionBeforeHold;
});
window.addEventListener("keyup", (e) => {
  if (!reducedMotionHoldActive) return;
  if (e.key !== "Shift" && e.key !== "Control") return;

  reducedMotion = reducedMotionBeforeHold;
  reducedMotionHoldActive = false;
});
const input = document.getElementById("death-input");
const img = document.getElementById("death-image");
let wobbleTimer;
input.addEventListener("input", () => {
  if (input.value.toLowerCase() === "shutup") {
    location.reload();
  }

  clearTimeout(wobbleTimer);

  img.style.transition = "none";
  img.style.transform = `translate(-50%, -50%) rotate(${
    Math.random() * 8 - 4
  }deg) scale(1.05)`;

  wobbleTimer = setTimeout(() => {
    img.style.transition = "transform 0.5s ease-out";
    img.style.transform = "translate(-50%, -50%) rotate(0deg) scale(1)";
  }, 30);
});

/* ===== REGEN THROTTLE ===== */
let REGEN_BUDGET = 8;
let REGEN_INTERVAL = 400;
let lastRegenTime = 0;

/* ===== GRID / SUPERGRID CALC ===== */
const SUPER_W = Math.max(
  1,
  Math.floor(canvas.width / (TILE_SIZE * SUPER_TILE))
);
const SUPER_H = Math.max(
  1,
  Math.floor(canvas.height / (TILE_SIZE * SUPER_TILE))
);

const MAP_TILES_X = SUPER_W * SUPER_TILE;
export const TILE = canvas.width / MAP_TILES_X;
let prevMouseWorld = { x: 0, y: 0 };

/* radii use TILE (world units) */
let DESPAWN_RADIUS = SUPER_TILE * TILE * 6;
let RESPAWN_RADIUS = SUPER_TILE * TILE * 4.5;
let RENDER_RADIUS = RESPAWN_RADIUS * 1.3;

let collectedCount = 0;

/* ===== MAP OCCUPANCY ===== */
const superOccupied = Array.from({ length: SUPER_H }, () =>
  Array(SUPER_W).fill(false)
);

/* ===== STATE ===== */
let camX = 0;
let camY = 0;
let camVX = 0;
let camVY = 0;
let slowness = false;
let slownessTimeout = null;

/* ===== TILE DATA ===== */
let giftPositions = [];
let floorTiles = [];

/* ===== PATTERN STATE ===== */
const patternsState = new Map();
canvas.style.animation = epilepticMode
  ? "bg-epileptic-lol 1s infinite"
  : "bg 60s infinite";
canvas.style.boxShadow = showBorder
  ? "0 0 240px rgba(255, 0, 0, 0.5), 0 0 240px rgba(255, 0, 0, 0.5), inset 0 0 240px rgba(255, 0, 0, 0.5)"
  : "0 0 240px rgba(255, 0, 0, 0.1), 0 0 240px rgba(255, 0, 0, 0.1), inset 0 0 240px rgba(255, 0, 0, 0.1)";
RENDER_RADIUS = blindnessMode ? 200 : RESPAWN_RADIUS * 1.3;
if (graphicsSlider.value === "0") setGraphicsLow();
else if (graphicsSlider.value === "1") setGraphicsMedium();
else if (graphicsSlider.value === "2") setGraphicsHigh();
else setGraphicsUltra();
if (accurateCursor) {
  canvas.style.cursor = "none";
  entityCanvas.style.cursor = "none";
} else {
  canvas.style.cursor = "auto";
  entityCanvas.style.cursor = "auto";
}

/* ===== HELPERS ===== */
export function setSlowness(v) {
  slowness = v;
}
export function getCameraPos() {
  return { x: -camX, y: -camY };
}
export function moveCamera(x, y, instant = false) {
  if (instant) {
    camX += x;
    camY += y;
  } else {
    camVX += x;
    camVY += y;
  }
}
export function isCursorOnFloor() {
  for (const t of floorTiles) {
    if (
      mouse.x >= t.x &&
      mouse.x < t.x + TILE &&
      mouse.y >= t.y &&
      mouse.y < t.y + TILE
    ) {
      return true;
    }
  }
  return false;
}

function registerEntitySpawn(name, imageSrc) {
  let data = entityCounts.get(name);
  if (!data) {
    data = { count: 0, img: imageSrc };
    entityCounts.set(name, data);
  }
  data.count++;
  renderPanel();
}

function renderPanel() {
  content.innerHTML = "";

  for (const [name, data] of entityCounts) {
    const slot = document.createElement("div");
    slot.className = "entity-slot";

    const img = document.createElement("img");
    img.src = data.img;
    img.alt = name;

    slot.appendChild(img);

    if (data.count >= 2) {
      const badge = document.createElement("div");
      badge.className = "entity-count";
      badge.textContent = data.count;
      slot.appendChild(badge);
    }

    content.appendChild(slot);
  }
}

function rotateMatrix90(m) {
  const h = m.length;
  const w = m[0].length;
  const r = Array.from({ length: w }, () => Array(h).fill(0));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) r[x][h - 1 - y] = m[y][x];
  return r;
}

function patternCenter(sx, sy) {
  return {
    x: (sx * SUPER_TILE + SUPER_TILE / 2) * TILE,
    y: (sy * SUPER_TILE + SUPER_TILE / 2) * TILE,
  };
}

function pickPatternsBySize(patterns) {
  // Precompute weights once per call (cheap)
  const pool = patterns.map((p) => {
    const area = p.length * p[0].length;
    return {
      p,
      // same rarity curve as before
      w: 1 / area,
    };
  });

  const result = [];
  let totalWeight = pool.reduce((s, o) => s + o.w, 0);

  while (pool.length) {
    let r = Math.random() * totalWeight;

    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].w;
      if (r <= 0) {
        result.push(pool[i].p);
        totalWeight -= pool[i].w;
        pool.splice(i, 1);
        break;
      }
    }
  }

  return result;
}

function count3x3Patterns() {
  let count = 0;
  for (const p of patternsState.values()) {
    if (p.pw === 3 && p.ph === 3) count++;
  }
  return count;
}

function findReplacementSlot(mouseWorld) {
  for (const p of patternsState.values()) {
    const c = patternCenter(p.sx, p.sy);
    const d = Math.hypot(c.x - mouseWorld.x, c.y - mouseWorld.y);

    if (d > DESPAWN_RADIUS * 1.2) {
      return p;
    }
  }
  return null;
}

function forceSpawn3x3(mouseWorld) {
  const base3x3 = PATTERNS.filter(
    (p) => p.length / SUPER_TILE === 3 && p[0].length / SUPER_TILE === 3
  );

  if (!base3x3.length) return;

  const target = findReplacementSlot(mouseWorld);
  if (!target) return;

  destroyPattern(target);

  const shuffled = pickPatternsBySize(base3x3);
  for (let i = 0; i < shuffled.length; i++) {
    const base = shuffled[i];
    const baseIndex = PATTERNS.indexOf(base);
    const pat = pickRotatedPattern(baseIndex);

    if (canPlaceSuper(target.sx, target.sy, pat)) {
      placeSuper(target.sx, target.sy, pat);
      break;
    }
  }
}

function superRangeFromRadius(x, y, r) {
  const minSX = Math.max(0, Math.floor((x - r) / (SUPER_TILE * TILE)));
  const maxSX = Math.min(
    SUPER_W - 1,
    Math.floor((x + r) / (SUPER_TILE * TILE))
  );
  const minSY = Math.max(0, Math.floor((y - r) / (SUPER_TILE * TILE)));
  const maxSY = Math.min(
    SUPER_H - 1,
    Math.floor((y + r) / (SUPER_TILE * TILE))
  );
  return { minSX, maxSX, minSY, maxSY };
}

function pickRotatedPattern(index) {
  const variants = ROTATED_PATTERNS[index];
  return variants[(Math.random() * 4) | 0];
}

/* ===== PRECOMPUTE ROTATED PATTERNS ===== */
const ROTATED_PATTERNS = PATTERNS.map((base) => {
  const r0 = base;
  const r1 = rotateMatrix90(r0);
  const r2 = rotateMatrix90(r1);
  const r3 = rotateMatrix90(r2);
  return [r0, r1, r2, r3];
});

/* ===== PATTERN PLACEMENT ===== */
function canPlaceSuper(sx, sy, pattern) {
  const ph = pattern.length / SUPER_TILE;
  const pw = pattern[0].length / SUPER_TILE;

  if (sx + pw > SUPER_W || sy + ph > SUPER_H) return false;

  for (let y = 0; y < ph; y++)
    for (let x = 0; x < pw; x++)
      if (superOccupied[sy + y][sx + x]) return false;

  return true;
}

function placeSuper(sx, sy, pattern) {
  const ph = pattern.length;
  const pw = pattern[0].length;

  let gifts = 0;

  // mark super-tile occupancy
  for (let y = 0; y < ph / SUPER_TILE; y++)
    for (let x = 0; x < pw / SUPER_TILE; x++)
      superOccupied[sy + y][sx + x] = true;

  // stamp tiles (use TILE for positions so rendering grid lines up)
  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      const wx = (sx * SUPER_TILE + x) * TILE;
      const wy = (sy * SUPER_TILE + y) * TILE;

      if (
        pattern[y][x] === 1 ||
        pattern[y][x] === 2 ||
        pattern[y][x] === 4 ||
        pattern[y][x] === 5
      ) {
        floorTiles.push({ x: wx, y: wy, sx, sy });
      }

      const isTripmineEnabled = collectedCount > 500;

      if (pattern[y][x] === 2 || pattern[y][x] === 3 || pattern[y][x] === 5) {
        const r = Math.random();
        let type = "gift";
        if (isTripmineEnabled) {
          if (r < 0.01) type = "gold"; // 1%
          else if (r < Math.min(0.00009 * collectedCount - 0.035, 0.1))
            type = "tripmine"; // 0-9%
          else type = "gift"; // 99-90%
        } else {
          type = r < 0.01 ? "gold" : "gift"; // original
        }

        giftPositions.push({
          x: wx,
          y: wy,
          sx,
          sy,
          type, // "gift", "gold", or "tripmine"
          golden: type === "gold",
        });

        if (type !== "tripmine") gifts++; // tripmine does not count
      }
    }
  }

  const spw = pw / SUPER_TILE;
  const sph = ph / SUPER_TILE;

  patternsState.set(`${sx},${sy}`, {
    sx,
    sy,
    pw: spw,
    ph: sph,
    sizeKey: `${spw}x${sph}`,
    giftsLeft: gifts,
    cleared: gifts === 0,
    pattern,
  });
}

function destroyPattern(p) {
  floorTiles = floorTiles.filter((t) => t.sx !== p.sx || t.sy !== p.sy);
  giftPositions = giftPositions.filter((g) => g.sx !== p.sx || g.sy !== p.sy);

  for (let y = 0; y < p.ph; y++)
    for (let x = 0; x < p.pw; x++) superOccupied[p.sy + y][p.sx + x] = false;

  patternsState.delete(`${p.sx},${p.sy}`);
}

export function pickRandomPlaced4or5(minRadius = 0) {
  // build list of placed patterns that actually contain a 4 or 5 AND are near the cursor
  const candidates = [];
  for (const p of patternsState.values()) {
    const pat = p.pattern;
    if (!pat) continue;

    // check if pattern contains 4 or 5
    let hasTarget = false;
    for (let y = 0; y < pat.length && !hasTarget; y++) {
      for (let x = 0; x < pat[0].length; x++) {
        if (pat[y][x] === 4 || pat[y][x] === 5) {
          hasTarget = true;
          break;
        }
      }
    }
    if (!hasTarget) continue;

    // check distance to cursor
    const center = patternCenter(p.sx, p.sy);
    const dx = center.x - mouse.x;
    const dy = center.y - mouse.y;
    const d2 = dx * dx + dy * dy;

    if (d2 >= minRadius * minRadius && d2 <= 1000 * 1000) {
      candidates.push(p);
    }
  }

  if (candidates.length === 0) return null;

  // pick random pattern
  const pickedPattern = candidates[(Math.random() * candidates.length) | 0];
  const pat = pickedPattern.pattern;

  // collect all 4/5 coords in that pattern
  const coords = [];
  for (let y = 0; y < pat.length; y++) {
    for (let x = 0; x < pat[0].length; x++) {
      const v = pat[y][x];
      if (v === 4 || v === 5) coords.push({ x, y, v });
    }
  }

  if (coords.length === 0) return null; // should not happen because we filtered, but safe

  const c = coords[(Math.random() * coords.length) | 0];

  // convert to world coords; using tile center
  const worldX = (pickedPattern.sx * SUPER_TILE + c.x) * TILE + TILE / 2;
  const worldY = (pickedPattern.sy * SUPER_TILE + c.y) * TILE + TILE / 2;

  return {
    x: worldX,
    y: worldY,
  };
}

/* ===== INITIAL MAP ===== */
const { minSX, maxSX, minSY, maxSY } = superRangeFromRadius(
  mouse.x,
  mouse.y,
  RESPAWN_RADIUS
);

for (let sy = minSY; sy <= maxSY; sy++) {
  for (let sx = minSX; sx <= maxSX; sx++) {
    if (superOccupied[sy][sx]) continue;

    const shuffled = pickPatternsBySize(PATTERNS);
    for (let i = 0; i < shuffled.length; i++) {
      const base = shuffled[i];
      const baseIndex = PATTERNS.indexOf(base);
      const pat = pickRotatedPattern(baseIndex);

      if (pat.length % SUPER_TILE !== 0 || pat[0].length % SUPER_TILE !== 0)
        continue;

      if (canPlaceSuper(sx, sy, pat)) {
        placeSuper(sx, sy, pat);
        break;
      }
    }
  }
}

/* ===== DRAW ===== */
function drawGrid() {
  let cursorOnCorruptedTile = false;

  // Clear only visible area (viewport + margin for movement)
  const margin = MAX_SPEED * 2;
  const visibleX = -camX;
  const visibleY = -camY;
  const visibleW = viewport.clientWidth + margin;
  const visibleH = viewport.clientHeight + margin;
  ctx.clearRect(
    visibleX - margin,
    visibleY - margin,
    visibleW + 2 * margin,
    visibleH + 2 * margin
  );

  // Floors (existing culling is fine, but ensure RENDER_RADIUS isn't too large)
  for (const t of floorTiles) {
    const cx = t.x + TILE / 2;
    const cy = t.y + TILE / 2;

    const dx = cx - mouse.x;
    const dy = cy - mouse.y;
    if (dx * dx + dy * dy > RENDER_RADIUS * RENDER_RADIUS) continue;

    let corrupted = false;
    let blocked = false;

    for (const z of cleanseZones) {
      const zx = cx - z.x;
      const zy = cy - z.y;
      if (zx * zx + zy * zy < z.r * z.r) {
        blocked = true;
        break;
      }
    }
    if (!blocked) {
      for (const f of fleshPositions) {
        const fx = f.x;
        const fy = f.y;

        const ddx = cx - fx;
        const ddy = cy - fy;

        if (ddx * ddx + ddy * ddy < (TILE * 3) ** 2) {
          corrupted = true;
          break;
        }
      }
    }

    // cursor inside this tile?
    if (corrupted) {
      if (
        mouse.x >= t.x &&
        mouse.x <= t.x + TILE &&
        mouse.y >= t.y &&
        mouse.y <= t.y + TILE
      ) {
        cursorOnCorruptedTile = true;
      }
    }

    if (corrupted) {
      ctx.fillStyle = showFloor
        ? `rgba(120, 0, 0, ${0.425 + Math.random() * 0.25})`
        : `rgba(120, 0, 0, 0.066)`;
      ctx.fillRect(t.x, t.y, TILE, TILE);
    } else {
      if (randTile < 0.5) {
        ctx.fillStyle = showFloor ? "#333" : "#3331";
        ctx.fillRect(t.x, t.y, TILE, TILE);
      } else {
        const h = TILE / 2;

        // top-left
        ctx.fillStyle = showFloor ? "#ccc" : "#ccc1";
        ctx.fillRect(t.x, t.y, h, h);

        // top-right
        ctx.fillStyle = showFloor ? "#333" : "#3331";
        ctx.fillRect(t.x + h, t.y, h, h);

        // bottom-left
        ctx.fillStyle = showFloor ? "#333" : "#3331";
        ctx.fillRect(t.x, t.y + h, h, h);

        // bottom-right
        ctx.fillStyle = showFloor ? "#ccc" : "#ccc1";
        ctx.fillRect(t.x + h, t.y + h, h, h);
      }
    }
  }
  if (cursorOnCorruptedTile) {
    slowness = true;

    if (slownessTimeout) {
      clearTimeout(slownessTimeout);
      slownessTimeout = null;
    }
  } else {
    if (slowness && !slownessTimeout) {
      slownessTimeout = setTimeout(() => {
        slowness = false;
        slownessTimeout = null;
      }, 3000);
    }
  }

  // gifts (center inside the tile)
  if (gift.complete) {
    for (const g of giftPositions) {
      const dx = g.x + TILE / 2 - mouse.x;
      const dy = g.y + TILE / 2 - mouse.y;
      if (dx * dx + dy * dy > RENDER_RADIUS * RENDER_RADIUS) continue;

      const img = g.golden ? goldGift : g.type === "tripmine" ? tripmine : gift;

      ctx.drawImage(
        img,
        g.x + (TILE - GIFT_SIZE) / 2,
        g.y + (TILE - GIFT_SIZE) / 2,
        GIFT_SIZE,
        GIFT_SIZE
      );
    }
  }

  // optional grid overlay (kept)
  ctx.strokeStyle = showGrids ? "#fff" : "#fff1";
  ctx.lineWidth = showGrids ? 3 : 1;
  const stepX = canvas.width / GRID_DIVS;
  const stepY = canvas.height / GRID_DIVS;
  for (let i = 1; i < GRID_DIVS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * stepX, 0);
    ctx.lineTo(i * stepX, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * stepY);
    ctx.lineTo(canvas.width, i * stepY);
    ctx.stroke();
  }
}

/* ===== CAMERA + GAME LOGIC ===== */
function getLimits() {
  return {
    maxX: 0,
    maxY: 0,
    minX: viewport.clientWidth - canvas.offsetWidth,
    minY: viewport.clientHeight - canvas.offsetHeight,
  };
}

window.addEventListener("mousemove", (e) => {
  mouse._clientX = e.clientX;
  mouse._clientY = e.clientY;
});

function updateCamera() {
  const w = viewport.clientWidth;
  const h = viewport.clientHeight;

  let vx = 0,
    vy = 0;

  let edgeFactorX = 0;
  let edgeFactorY = 0;

  if (mouse._clientX < w * cameraRadius) {
    vx = MAX_SPEED * (1 - mouse._clientX / (w * cameraRadius));
    edgeFactorX = 1 - mouse._clientX / (w * cameraRadius);
  } else if (mouse._clientX > w * (1 - cameraRadius)) {
    vx =
      -MAX_SPEED *
      ((mouse._clientX - w * (1 - cameraRadius)) / (w * cameraRadius));
    edgeFactorX =
      (mouse._clientX - w * (1 - cameraRadius)) / (w * cameraRadius);
  }

  if (mouse._clientY < h * cameraRadius) {
    vy = MAX_SPEED * (1 - mouse._clientY / (h * cameraRadius));
    edgeFactorY = 1 - mouse._clientY / (h * cameraRadius);
  } else if (mouse._clientY > h * (1 - cameraRadius)) {
    vy =
      -MAX_SPEED *
      ((mouse._clientY - h * (1 - cameraRadius)) / (h * cameraRadius));
    edgeFactorY =
      (mouse._clientY - h * (1 - cameraRadius)) / (h * cameraRadius);
  }

  const edgeFactor = Math.max(edgeFactorX, edgeFactorY);
  let edgeMultiplier = 1;
  if (reducedMotion) {
    edgeMultiplier = drunkCamera ? 1 : 0.5;
  } else {
    edgeMultiplier = drunkCamera ? 1.5 : 1;
  }
  dynamicHitRadius = HIT_RADIUS * lagFactor * (1 + edgeFactor * edgeMultiplier);
  toggleTripmineLeniency(
    Math.max(0, Math.min(1, edgeFactor * edgeMultiplier)) * 0.5
  );

  const motionScale = reducedMotion ? 0.5 : 1;
  const slowScale = slowness ? 0.25 : 1;
  camX += vx * motionScale * slowScale;
  camY += vy * motionScale * slowScale;

  const lim = getLimits();
  camX = Math.max(lim.minX, Math.min(lim.maxX, camX));
  camY = Math.max(lim.minY, Math.min(lim.maxY, camY));
  if (drunkCamera) {
    const t = performance.now() * 0.002;
    camX += Math.sin(t * 1.3) * 2;
    camY += Math.cos(t * 1.7) * 2;
  }
  canvas.style.transform = `translate(${camX}px, ${camY}px)`;
  entityCanvas.style.transform = `translate(${camX}px, ${camY - 10000}px)`;

  // mouseWorld = screenToWorld(mouseX, mouseY);

  // cursor spreads infection while slowed
  if (slowness) {
    const now = performance.now();

    if (now - lastCursorInfectAt > 120) {
      fleshPositions.add({
        x: mouse.x,
        y: mouse.y,
        until: now + 18750,
      });

      lastCursorInfectAt = now;
    }
  }

  /* collect gifts */
  for (let i = giftPositions.length - 1; i >= 0; i--) {
    const g = giftPositions[i];
    const dx = g.x + TILE / 2 - mouse.x;
    const dy = g.y + TILE / 2 - mouse.y;

    const radius = g.type === "tripmine" ? GIFT_SIZE * 0.45 : dynamicHitRadius;

    if (dx * dx + dy * dy < radius * radius) {
      giftPositions.splice(i, 1);

      if (g.type === "tripmine") {
        tripmineExplosion = {
          x: g.x + TILE / 2,
          y: g.y + TILE / 2,
          t: performance.now(),
        };
        continue;
      }

      const value = g.golden ? 5 : 1;
      collectedCount += value;
      counterEl.textContent = `Collected: ${collectedCount}`;

      if (
        Math.floor(collectedCount / 100) > Math.floor(lastEntitySpawnAt / 100)
      ) {
        lastEntitySpawnAt = collectedCount;

        const unlocked = ENTITY_POOL.filter((e) => {
          if (collectedCount < e.start) return false;
          if (e.unstackable && spawnedUnstackables.has(e.name)) return false;
          return true;
        });

        if (unlocked.length > 0) {
          let pick;
          while (true) {
            pick = unlocked[(Math.random() * unlocked.length) | 0];
            if (lastEntityPicked !== pick.name) {
              if (pick.name === "Baby") {
                babyCount++;
              } else if (pick.name === "VoidboundBaby") {
                if (babyCount < 2) {
                  continue;
                }
              }
              if (pick.rare) {
                if (Math.random() < 0.5) {
                  continue;
                }
              }
              lastEntityPicked = pick.name;
              break;
            }
          }
          if (pick.name === "Random") {
            const randUnlocked = ENTITY_POOL.filter((e) => {
              if (e.name === "Random") return false;
              if (collectedCount < e.start) return false;
              if (e.unstackable) return false;
              return true;
            });
            if (randUnlocked.length !== 0) {
              let randPick =
                randUnlocked[(Math.random() * randUnlocked.length) | 0];
              randPick.spawn();
            }
          } else {
            pick.spawn();
          }
          registerEntitySpawn(pick.name, pick.src);
          if (collectedCount >= 1000 && !isSeamineEnabled) {
            isSeamineEnabled = true;
            spawnSeamine(entityHost);
            spawnSeamine(entityHost);
            spawnSeamine(entityHost);
          }
          if (pick.unstackable) {
            spawnedUnstackables.add(pick.name);
          }
        }
      }

      const p = patternsState.get(`${g.sx},${g.sy}`);
      if (p && --p.giftsLeft === 0) p.cleared = true;
    }
  }
  if (collectedCount >= 100 && settingsEnabled) {
    settingsBtn.style.opacity = "0";
    settingsBtn.style.pointerEvents = "none";
    settingsEnabled = false;
    settingsPanel.style.display = "none";
  }

  /* despawn cleared patterns */
  for (const p of [...patternsState.values()]) {
    if (!p.cleared) continue;
    const c = patternCenter(p.sx, p.sy);
    if (Math.hypot(c.x - mouse.x, c.y - mouse.y) > DESPAWN_RADIUS)
      destroyPattern(p);
  }

  const current3x3 = count3x3Patterns();
  if (current3x3 < 5) {
    forceSpawn3x3(mouse);
  }

  /* regenerate empty slots (THROTTLED + BUDGETED) */
  const now = performance.now();
  for (let i = cleanseZones.length - 1; i >= 0; i--) {
    if (cleanseZones[i].expiresAt <= now) {
      cleanseZones.splice(i, 1);
    }
  }
  if (now - lastRegenTime > REGEN_INTERVAL) {
    lastRegenTime = now;

    let regenLeft = REGEN_BUDGET;

    const { minSX, maxSX, minSY, maxSY } = superRangeFromRadius(
      mouse.x,
      mouse.y,
      RESPAWN_RADIUS
    );

    for (let sy = minSY; sy <= maxSY && regenLeft > 0; sy++) {
      for (let sx = minSX; sx <= maxSX && regenLeft > 0; sx++) {
        if (superOccupied[sy][sx]) continue;

        const c = patternCenter(sx, sy);
        if (Math.hypot(c.x - mouse.x, c.y - mouse.y) > RESPAWN_RADIUS) continue;

        const shuffled = pickPatternsBySize(PATTERNS);
        for (let i = 0; i < shuffled.length; i++) {
          const base = shuffled[i];
          const baseIndex = PATTERNS.indexOf(base);
          const pat = pickRotatedPattern(baseIndex);

          if (pat.length % SUPER_TILE !== 0 || pat[0].length % SUPER_TILE !== 0)
            continue;

          if (canPlaceSuper(sx, sy, pat)) {
            placeSuper(sx, sy, pat);
            regenLeft--;
            break;
          }
        }
      }
    }
  }
}

/* ===== LOOP ===== */
function loop(now) {
  // limit FPS to ~30
  if (!loop.lastTime) loop.lastTime = now;
  const dt = (now - loop.lastTime) / 1000;

  // only update ~30fps
  const FRAME_TIME = 33.333;
  if (now - loop.lastTime < FRAME_TIME) {
    requestAnimationFrame(loop);
    return;
  }

  loop.lastTime = now;

  updateCamera();
  updateMouseWorld(entityCanvas, camX, camY);
  drawGrid();

  // simple cursor
  if (accurateCursor) {
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }

  // hitradius
  const g = ctx.createRadialGradient(
    mouse.x,
    mouse.y,
    0,
    mouse.x,
    mouse.y,
    dynamicHitRadius
  );
  g.addColorStop(0, "rgba(0, 0, 255, 0)");
  g.addColorStop(1, `rgba(0, 0, 255, ${Math.random() * 0.2})`);
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, dynamicHitRadius - GIFT_SIZE / 2, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();

  // camera smoothing
  camX += camVX;
  camY += camVY;
  camVX *= 0.88;
  camVY *= 0.88;

  // lag detection
  const dx = mouse.x - prevMouseWorld.x;
  const dy = mouse.y - prevMouseWorld.y;
  const dist = Math.hypot(dx, dy);
  const TELEPORT_THRESHOLD = TILE * 2;
  if (dist > TELEPORT_THRESHOLD) {
    lagDebt += (dist / TELEPORT_THRESHOLD) * 0.15;
  } else {
    lagDebt -= 0.08;
  }
  lagDebt = Math.max(0, Math.min(lagDebt, 1));
  lagFactor = 1 + lagDebt;
  prevMouseWorld.x = mouse.x;
  prevMouseWorld.y = mouse.y;

  // tripmine explosion
  if (tripmineExplosion) {
    const age = performance.now() - tripmineExplosion.t;
    const r = TILE * (4 + age * 0.04);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const g = ctx.createRadialGradient(
      tripmineExplosion.x,
      tripmineExplosion.y,
      0,
      tripmineExplosion.x,
      tripmineExplosion.y,
      r
    );

    g.addColorStop(0, "rgba(255, 0, 255, 0.5)");
    g.addColorStop(1, "rgba(255, 0, 255, 0.1)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(tripmineExplosion.x, tripmineExplosion.y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (age > 80) {
      tripmineExplosion = null;
      death("Tripmine", "#FF00FF");
    }
  }

  entityHost.update(dt);
  entityHost.draw();

  // slowness
  if (slowness || sorrowActive) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(255, 0, 0, ${slowness ? 0.18 : 0.09})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  for (const f of [...fleshPositions]) {
    if (f.until <= now) fleshPositions.delete(f);
  }

  requestAnimationFrame(loop);
}

// center camera
camX = (viewport.clientWidth - canvas.offsetWidth) / 2;
camY = (viewport.clientHeight - canvas.offsetHeight) / 2;

loop();
