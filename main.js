import { PATTERNS, TILE_SIZE } from "./patterns.js";
import {
  createEntityHost,
  updateMouseWorld,
  mouse,
  death,
  toggleToggleDeath,
  toggleTripmineLeniency,
  toggleImmortality,
  shieldActive,
  activateShield,
  shieldBroken,
} from "./entityHost.js";
import { setup as spawnAltarPurgatory } from "./Enemies/AltarOfPurgatory.js";
import { setup as spawnAltarChance } from "./Enemies/AltarOfChance.js";
import { setup as spawnAltarProtection } from "./Enemies/AltarOfProtection.js";
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
import { setup as spawnCatalyst } from "./Enemies/Catalyst.js";
import { setup as spawnCatalystHunger } from "./Enemies/CatalystHunger.js";
import { setup as spawnCatalystHand } from "./Enemies/CatalystHand.js";
import { setup as spawnVoid } from "./Enemies/Void.js";
import { setup as spawnBeacon } from "./Enemies/Beacon.js";

const canvas = document.getElementById("screen");
const entityCanvas = document.getElementById("entities");
export const entityCanvas2 = document.getElementById("entities-2");
const viewport = document.getElementById("viewport");
const ctx = canvas.getContext("2d");
const entityCtx = entityCanvas.getContext("2d");
const entityCtx2 = entityCanvas.getContext("2d");
const counterEl = document.getElementById("counter");
const lvlEl = document.getElementById("lvl");
const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");
const graphicsSlider = document.getElementById("graphics-slider");
const panel = document.getElementById("entity-panel");
const content = document.getElementById("entity-panel-content");
const entityCounts = new Map();

const entityHost = createEntityHost(entityCanvas, entityCtx, entityCtx2, ctx);
let casualMode = JSON.parse(localStorage.getItem("casual-mode")) ?? false;
let panelOpen = false;
let lastEntitySpawnAt = 0;
let lastEntityPicked;
let tripmineExplosion = null;
let isSeamineEnabled = false;
let spawnedVoid = false;
let spawnedAltar = [false, false];
let spawnedCatalyst = false;
let spawnedBeacon = false;
let transformAllGift = false;
let allGold = false;
let disableTripmine = false;
let disableCollect = false;
let disablespawn = false;
let lastCursorInfectAt = 0;
let sorrowActive = false;
let skinwalkerCount = 0;
let babyCount = 0;
const pickedOnce = new Set();
const spawnedUnstackables = new Set();
export let despawnCatalyst = false;
export let voidbreakerCount = 0;
export let voidbreakerActive;
export function setVoidbreakerActive(v) {
  voidbreakerActive = v;
}
export function setSorrowActive(v) {
  sorrowActive = v;
}
export const pondererPositions = new Set();
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
    start: casualMode ? 1500 : 1000,
    src: "./ASSET/Curses/VoidImplosions.png",
    unstackable: true,
  },
  {
    name: "Sorrow",
    spawn: () => spawnSorrow(entityHost),
    start: casualMode ? 1500 : 1000,
    src: "./ASSET/Curses/Sorrow.png",
    unstackable: true,
  },
  {
    name: "Doombringer",
    spawn: () => spawnDoombringer(entityHost),
    start: casualMode ? 1500 : 1000,
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
let sfxVolume = Number(localStorage.getItem("sfxVolume")) ?? 50;
let musicVolume = Number(localStorage.getItem("musicVolume")) ?? 10;
graphicsSlider.value = Number(localStorage.getItem("graphicsLevel")) || 0;

document.getElementById("toggle-grids").checked = showGrids;
document.getElementById("toggle-floor").checked = showFloor;
document.getElementById("toggle-border").checked = showBorder;
document.getElementById("toggle-epileptic").checked = epilepticMode;
document.getElementById("toggle-blindness").checked = blindnessMode;
document.getElementById("toggle-reduced-motion").checked = reducedMotion;
document.getElementById("toggle-drunk-camera").checked = drunkCamera;
document.getElementById("toggle-accurate-cursor").checked = accurateCursor;
document.getElementById("toggle-casual-mode").checked = casualMode;
document.getElementById("sfx-volume").value = sfxVolume;
document.getElementById("music-volume").value = musicVolume;
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
    entityCanvas2.style.cursor = "none";
  } else {
    canvas.style.cursor = "auto";
    entityCanvas.style.cursor = "auto";
    entityCanvas2.style.cursor = "auto";
  }
});
toggle("toggle-casual-mode", (v) => {
  casualMode = v;
});
document.getElementById("sfx-volume").oninput = (e) => {
  sfxVolume = Number(e.target.value);
  localStorage.setItem("sfxVolume", sfxVolume);
};
document.getElementById("music-volume").oninput = (e) => {
  musicVolume = Number(e.target.value);
  localStorage.setItem("musicVolume", musicVolume);
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
  localStorage.setItem("sfxVolume", "50");
  localStorage.setItem("musicVolume", "10");
  showBorder = true;
  showFloor = true;
  showGrids = false;
  reducedMotion = false;
  epilepticMode = false;
  blindnessMode = false;
  drunkCamera = false;
  accurateCursor = false;
  sfxVolume = 50;
  musicVolume = 10;
  document.getElementById("toggle-border").checked = true;
  document.getElementById("toggle-floor").checked = true;
  document.getElementById("toggle-grids").checked = false;
  document.getElementById("toggle-reduced-motion").checked = false;
  document.getElementById("toggle-epileptic").checked = false;
  document.getElementById("toggle-blindness").checked = false;
  document.getElementById("toggle-drunk-camera").checked = false;
  document.getElementById("toggle-accurate-cursor").checked = false;
  document.getElementById("sfx-volume").value = 50;
  document.getElementById("music-volume").value = 10;
  graphicsSlider.value = 0;
  graphicsSlider.dispatchEvent(new Event("input"));
  canvas.style.animation = "bg 60s infinite";
  canvas.style.boxShadow =
    "0 0 240px rgba(255, 0, 0, 0.5), 0 0 240px rgba(255, 0, 0, 0.5), inset 0 0 240px rgba(255, 0, 0, 0.5)";
  if (accurateCursor) {
    canvas.style.cursor = "none";
    entityCanvas.style.cursor = "none";
    entityCanvas2.style.cursor = "none";
  } else {
    canvas.style.cursor = "auto";
    entityCanvas.style.cursor = "auto";
    entityCanvas2.style.cursor = "auto";
  }

  RENDER_RADIUS = RESPAWN_RADIUS * 1.3;
};

/* ===== CONFIG ===== */
canvas.width = 10000;
canvas.height = 10000;
entityCanvas.width = 10000;
entityCanvas.height = 10000;
entityCanvas2.width = 10000;
entityCanvas2.height = 10000;

export let latestCollectedCount = 0;
export let collectedCount = 0;
export let actualCollectedCount = 0;
let giftMultiplier = 1;
let MAX_SPEED = 25;
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
  if (input === "disablespawn") {
    disablespawn = !disablespawn;
    topLeftInput.value = "";
    topLeftInput.style.display = "none";
    topLeftInput.blur();
  }
  if (input === "catalyst") {
    spawnCatalyst(entityHost);
    setInterval(() => {
      if (Math.random() < 0.5) {
        spawnCatalystHunger(entityHost, 0.82 + Math.random() * 0.2);
      } else {
        spawnCatalystHand(entityHost);
      }
    }, 20000);
    registerEntitySpawn("Catalyst", "./ASSET/Enemies/CatalystIcon.png");
    topLeftInput.value = "";
    topLeftInput.style.display = "none";
    topLeftInput.blur();
  }
  if (input === "shield") {
    activateShield();
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
  Math.floor(canvas.width / (TILE_SIZE * SUPER_TILE)),
);
const SUPER_H = Math.max(
  1,
  Math.floor(canvas.height / (TILE_SIZE * SUPER_TILE)),
);

const MAP_TILES_X = SUPER_W * SUPER_TILE;
export const TILE = canvas.width / MAP_TILES_X;
let prevMouseWorld = { x: 0, y: 0 };

/* radii use TILE (world units) */
let DESPAWN_RADIUS = SUPER_TILE * TILE * 6;
let RESPAWN_RADIUS = SUPER_TILE * TILE * 4.5;
let RENDER_RADIUS = RESPAWN_RADIUS * 1.3;

/* ===== MAP OCCUPANCY ===== */
const superOccupied = Array.from({ length: SUPER_H }, () =>
  Array(SUPER_W).fill(false),
);

/* ===== STATE ===== */
let camX = 0;
let camY = 0;
let camVX = 0;
let camVY = 0;
export let slowness = false;
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
  entityCanvas2.style.cursor = "none";
} else {
  canvas.style.cursor = "auto";
  entityCanvas.style.cursor = "auto";
  entityCanvas2.style.cursor = "auto";
}

/* ===== SOUND ===== */
const activeSounds = new Set();
export function playSound(
  soundPath,
  rate = 1,
  clip = { start: 0, end: 1 },
  music = false,
  onEnd = null,
  important = false,
) {
  const audio = new Audio(soundPath);
  audio.playbackRate = rate;
  if (typeof important === "string") {
    audio.volume = Math.max(0, Math.min(1, sfxVolume / Number(important)));
  } else {
    audio.volume = Math.max(
      0,
      Math.min(
        1,
        important ? sfxVolume / 100 : (music ? musicVolume : sfxVolume) / 200,
      ),
    );
  }

  let stopped = false;

  audio.addEventListener("loadedmetadata", () => {
    const startTime = clip.start * audio.duration;
    const endTime = clip.end * audio.duration;

    audio.currentTime = startTime;
    audio.play();

    const stopAt = () => {
      if (stopped) return;

      if (audio.currentTime >= endTime) {
        stop();
        if (onEnd) onEnd();
      } else {
        requestAnimationFrame(stopAt);
      }
    };

    requestAnimationFrame(stopAt);
  });

  function stop() {
    if (stopped) return;
    stopped = true;
    audio.pause();
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = clip.start * audio.duration;
    } else {
      audio.currentTime = 0;
    }
    activeSounds.delete(entry);
  }
  const entry = { stop, audio };
  activeSounds.add(entry);

  return stop;
}
export function stopAllSounds() {
  const fadeDuration = 1000;
  const start = performance.now();

  for (const { audio, stop } of activeSounds) {
    const startVolume = audio.volume;

    const fade = (now) => {
      const t = Math.min(1, (now - start) / fadeDuration);
      audio.volume = startVolume * (1 - t);

      if (t < 1) {
        requestAnimationFrame(fade);
      } else {
        audio.volume = 0;
        stop();
      }
    };

    requestAnimationFrame(fade);
  }

  activeSounds.clear();
}
const musicList = [
  {
    start: 100,
    end: 599,
    src: "./ASSET/Sound/Music/Kenophobia.mp3",
  },
  {
    start: 500,
    end: 999,
    src: "./ASSET/Sound/Music/Dimension.mp3",
  },
  {
    start: 100,
    end: 999,
    src: "./ASSET/Sound/Music/A-Delightful-New-Death.mp3",
  },
  {
    start: 1000,
    end: 1999,
    src: "./ASSET/Sound/Music/Conga-Line.mp3",
  },
  {
    start: 1000,
    end: 1999,
    src: "./ASSET/Sound/Music/Former-Gardens.mp3",
  },
  {
    start: 1000,
    end: 1999,
    src: "./ASSET/Sound/Music/Death-Defiance.mp3",
  },
  {
    start: 2000,
    end: 3999,
    src: "./ASSET/Sound/Music/Void-Breaker.mp3",
  },
  {
    start: 2000,
    end: 3999,
    src: "./ASSET/Sound/Music/IMPERIAL-ENIGMA.mp3",
  },
  {
    start: 4000,
    end: 0,
    src: "./ASSET/Sound/Music/Temporal-Tenacity.mp3",
  },
  {
    start: 4000,
    end: 0,
    src: "./ASSET/Sound/Music/DECAY-TRUE.mp3",
  },
  {
    start: 1000,
    end: 1999,
    src: "./ASSET/Sound/Music/Find-your-Flame.mp3",
  },
  {
    start: 2000,
    end: 3999,
    src: "./ASSET/Sound/Music/Find-your-Flame.mp3",
  },
  {
    start: 4000,
    end: 0,
    src: "./ASSET/Sound/Music/Find-your-Flame.mp3",
  },
];
let lobbyMusic = null;
let stopMusic = null;
let lastMusicSrc = null;
let currentMusic = null;
function playNextMusic() {
  const candidates = musicList.filter((m) => {
    if (collectedCount < m.start) return false;
    if (m.end !== 0 && collectedCount > m.end) return false;
    if (m.src === lastMusicSrc) return false; // prevent repeat
    return true;
  });

  // fallback: if only one valid song exists, allow repeat
  const pool = candidates.length
    ? candidates
    : musicList.filter((m) => {
        if (collectedCount < m.start) return false;
        if (m.end !== 0 && collectedCount > m.end) return false;
        return true;
      });

  if (pool.length === 0) return;

  if (stopMusic) {
    stopMusic();
    stopMusic = null;
  }

  const pick = pool[Math.floor(Math.random() * pool.length) | 0];
  lastMusicSrc = pick.src;
  currentMusic = pick;

  stopMusic = playSound(
    pick.src,
    1,
    { start: 0, end: 1 },
    true,
    () => {
      playNextMusic();
    },
    false,
  );
}

/* ===== HELPERS ===== */
export function setSlowness(v) {
  slowness = v;
}
export function getCameraPos() {
  return { x: -camX, y: -camY };
}
export function moveCamera(x, y, instant = false) {
  if (disableCollect) return;
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
  let total = 0;
  for (const data of entityCounts.values()) {
    total += data.count;
  }
  document.getElementById("entity-panel-count").textContent =
    `EntityCount: ${total}`;
  if (total >= 10) {
    document.getElementById("entity-panel-count").style.right = "-8.8vw";
  }
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
    (p) => p.length / SUPER_TILE === 3 && p[0].length / SUPER_TILE === 3,
  );

  if (!base3x3.length) return;

  const target = findReplacementSlot(mouseWorld);
  if (!target) return;

  destroyPattern(target);

  const shuffled = pickPatternsBySize(base3x3);
  for (let i = 0; i < shuffled.length; i++) {
    const base = shuffled[i];
    const baseIndex = PATTERNS.indexOf(base);
    let pat = pickBiasedRotatedPattern(
      baseIndex,
      target.sx,
      target.sy,
      patternsState,
    );
    // fallback for initial / no-neighbor / no-9 cases
    if (!pat) {
      pat = pickRotatedPattern(baseIndex);
    }

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
    Math.floor((x + r) / (SUPER_TILE * TILE)),
  );
  const minSY = Math.max(0, Math.floor((y - r) / (SUPER_TILE * TILE)));
  const maxSY = Math.min(
    SUPER_H - 1,
    Math.floor((y + r) / (SUPER_TILE * TILE)),
  );
  return { minSX, maxSX, minSY, maxSY };
}

function pickRotatedPattern(index) {
  const variants = ROTATED_PATTERNS[index];
  return variants[(Math.random() * 4) | 0];
}
function pickBiasedRotatedPattern(baseIndex, sx, sy, patternsState) {
  const variants = ROTATED_PATTERNS[baseIndex];
  const scores = [];

  const left = patternsState.get(`${sx - 1},${sy}`);
  const right = patternsState.get(`${sx + 1},${sy}`);
  const top = patternsState.get(`${sx},${sy - 1}`);
  const bot = patternsState.get(`${sx},${sy + 1}`);

  const hasNeighbor = left || right || top || bot;

  // bootstrap: no constraints yet
  if (!hasNeighbor) {
    return pickRotatedPattern(baseIndex);
  }

  for (let i = 0; i < 4; i++) {
    const pat = variants[i];
    let score = 0;

    const h = pat.length;
    const w = pat[0].length;

    if (left) {
      const p = left.pattern;
      const pw = p[0].length;
      for (let y = 0; y < h; y++) {
        if (p[y]?.[pw - 1] === 9 && pat[y][0] === 9) score++;
      }
    }

    if (right) {
      const p = right.pattern;
      for (let y = 0; y < h; y++) {
        if (p[y]?.[0] === 9 && pat[y][w - 1] === 9) score++;
      }
    }

    if (top) {
      const p = top.pattern;
      const ph = p.length;
      for (let x = 0; x < w; x++) {
        if (p[ph - 1]?.[x] === 9 && pat[0][x] === 9) score++;
      }
    }

    if (bot) {
      const p = bot.pattern;
      for (let x = 0; x < w; x++) {
        if (p[0]?.[x] === 9 && pat[h - 1][x] === 9) score++;
      }
    }

    scores[i] = score;
  }

  let bestScore = 0;
  let bestList = [];

  for (let i = 0; i < 4; i++) {
    if (scores[i] > bestScore) {
      bestScore = scores[i];
      bestList = [i];
    } else if (scores[i] === bestScore && bestScore > 0) {
      bestList.push(i);
    }
  }

  if (bestScore === 0) return null;
  return variants[bestList[(Math.random() * bestList.length) | 0]];
}

/* ===== ALTARS ===== */
function ENTITY_SPAWN() {
  const unlocked = ENTITY_POOL.filter((e) => {
    if (collectedCount < e.start) return false;
    if (e.unstackable && spawnedUnstackables.has(e.name)) return false;
    return true;
  });

  if (unlocked.length > 0) {
    let pick;
    if (collectedCount >= 5000 && !spawnedCatalyst) {
      spawnedCatalyst = true;
      pick = {
        name: "Catalyst",
        spawn: () => spawnCatalyst(entityHost),
        start: 5000,
        src: "./ASSET/Enemies/CatalystIcon.png",
      };
    } else if (collectedCount >= 5500 && !spawnedBeacon) {
      spawnedBeacon = true;
      pick = {
        name: "Beacon",
        spawn: () => spawnBeacon(entityHost),
        start: 5500,
      };
    } else {
      while (true) {
        const weighted = [];
        for (const e of unlocked) {
          const weight = pickedOnce.has(e.name) ? 1 : 3;
          for (let i = 0; i < weight; i++) weighted.push(e);
          if (e.name === "baby" && babyCount < 2) weighted.push(e);
        }
        pick = weighted[(Math.random() * weighted.length) | 0];
        if (lastEntityPicked !== pick.name) {
          if (pick.name === "Baby") {
            babyCount++;
          } else if (pick.name === "VoidboundBaby") {
            if (babyCount < 2) {
              continue;
            }
          }
          if (pick.rare) {
            if (Math.random() < 0.25) {
              continue;
            }
          }
          if (casualMode && (pick.name === "Kookoo" || pick.name === "Cadence"))
            continue;
          lastEntityPicked = pick.name;
          pickedOnce.add(pick.name);
          break;
        }
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
        let randPick = randUnlocked[(Math.random() * randUnlocked.length) | 0];
        randPick.spawn();
      }
    } else if (pick.name === "Catalyst") {
      pick.spawn();
      setInterval(() => {
        if (Math.random() < 0.5) {
          spawnCatalystHunger(entityHost, 0.82 + Math.random() * 0.2);
        } else {
          spawnCatalystHand(entityHost);
        }
      }, 20000);
    } else {
      pick.spawn();
    }
    if (pick.src) registerEntitySpawn(pick.name, pick.src);
    if (
      collectedCount >= (casualMode ? 1500 : 1000) &&
      !isSeamineEnabled &&
      !disablespawn
    ) {
      isSeamineEnabled = true;
      spawnSeamine(entityHost, casualMode);
      spawnSeamine(entityHost, casualMode);
      spawnSeamine(entityHost, casualMode);
    }
    if (pick.unstackable) {
      spawnedUnstackables.add(pick.name);
    }
  }
}
export function activatePurgatory() {
  if (!disableCollect) actualCollectedCount += 1000;
  if (actualCollectedCount > 10000) actualCollectedCount = 10000;
  collectedCount = Math.floor(actualCollectedCount / 2);
  counterEl.textContent = `Collected: ${collectedCount >= 5000 && collectedCount <= 5500 ? -11000 + Math.floor(Math.random() * 22000) : actualCollectedCount}`;
  lvlEl.textContent =
    latestCollectedCount >= 5000 && latestCollectedCount <= 5500
      ? `lvl 100`
      : `Lvl ${Math.floor(latestCollectedCount / 50)}`;
  lastEntitySpawnAt = collectedCount;
  for (let i = 0; i < 5; i++) ENTITY_SPAWN();
}
let alreadyBenefitChanced = [false, false];
export function activateChance() {
  let chance;
  while (true) {
    chance = Math.floor(Math.random() * 4);
    if (chance === 0 || chance === 1) break;
    if (chance === 2 && !alreadyBenefitChanced[0]) break;
    if (chance === 3 && !alreadyBenefitChanced[1] && !casualMode) break;
  }
  switch (chance) {
    case 0:
      // - payment 1000
      actualCollectedCount -= 1000;
      // if (actualCollectedCount < 0) actualCollectedCount = 0;
      collectedCount = Math.floor(actualCollectedCount / 2);
      counterEl.textContent = `Collected: ${collectedCount >= 5000 && collectedCount <= 5500 ? -11000 + Math.floor(Math.random() * 22000) : actualCollectedCount}`;
      lvlEl.textContent =
        latestCollectedCount >= 5000 && latestCollectedCount <= 5500
          ? `lvl 100`
          : `Lvl ${Math.floor(latestCollectedCount / 50)}`;
      break;
    case 1:
      // - random enemy 4
      for (let i = 0; i < 4; i++) ENTITY_SPAWN();
      break;
    case 2:
      // + gift multiplier x2
      giftMultiplier = 2;
      alreadyBenefitChanced[0] = true;
      break;
    case 3:
      // + no tripmines
      disableTripmine = true;
      giftPositions.forEach((gift) => {
        if (gift.type === "tripmine") {
          gift.type = "gift";
        }
      });
      alreadyBenefitChanced[1] = true;
      break;
  }
  return chance;
}
export function activateProtection() {
  if (actualCollectedCount >= 1000 && shieldActive === false) {
    actualCollectedCount -= 1000;
    collectedCount = Math.floor(actualCollectedCount / 2);
    counterEl.textContent = `Collected: ${collectedCount >= 5000 && collectedCount <= 5500 ? -11000 + Math.floor(Math.random() * 22000) : actualCollectedCount}`;
    lvlEl.textContent =
      latestCollectedCount >= 5000 && latestCollectedCount <= 5500
        ? `lvl 100`
        : `Lvl ${Math.floor(latestCollectedCount / 50)}`;
    activateShield();
    return true;
  }
  return false;
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
        pattern[y][x] === 5 ||
        pattern[y][x] === 9
      ) {
        floorTiles.push({ x: wx, y: wy, sx, sy });
      }

      const isTripmineEnabled =
        !disableTripmine && !casualMode && collectedCount > 500;

      if (
        pattern[y][x] === 2 ||
        pattern[y][x] === 3 ||
        pattern[y][x] === 5 ||
        pattern[y][x] === 9
      ) {
        const r = Math.random();
        let type = "gift";
        if (allGold) {
          type = r < 0.9 ? "gold" : "tripmine";
        } else if (isTripmineEnabled) {
          if (r < 0.01)
            type = "gold"; // 1%
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

    const maxRadius = minRadius + 1000;
    if (d2 >= minRadius * minRadius && d2 <= maxRadius * maxRadius) {
      candidates.push(p);
    }
  }

  if (candidates.length === 0) return { x: 0, y: 0 };

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

  if (coords.length === 0) return { x: 0, y: 0 }; // should not happen because we filtered, but safe

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
  RESPAWN_RADIUS,
);

for (let sy = minSY; sy <= maxSY; sy++) {
  for (let sx = minSX; sx <= maxSX; sx++) {
    if (superOccupied[sy][sx]) continue;

    const shuffled = pickPatternsBySize(PATTERNS);
    for (let i = 0; i < shuffled.length; i++) {
      const base = shuffled[i];
      const baseIndex = PATTERNS.indexOf(base);
      const pat = pickBiasedRotatedPattern(baseIndex, sx, sy, patternsState);
      if (!pat) continue;

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
    visibleH + 2 * margin,
  );
  entityCtx.clearRect(
    visibleX - margin,
    visibleY - margin,
    visibleW + 2 * margin,
    visibleH + 2 * margin,
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
      if (randTile < 0.6) {
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
      }, 1500);
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
        GIFT_SIZE,
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

  MAX_SPEED = 25 + collectedCount / 200;

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
    Math.max(0, Math.min(1, edgeFactor * edgeMultiplier)) * 0.5,
  );

  if (!disableCollect) {
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
    entityCanvas2.style.transform = `translate(${camX}px, ${camY - 20000}px)`;
  }

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

    const radius = g.type === "tripmine" ? GIFT_SIZE * 0.2 : dynamicHitRadius;

    if (dx * dx + dy * dy < radius * radius) {
      giftPositions.splice(i, 1);

      if (g.type === "tripmine") {
        tripmineExplosion = {
          x: g.x + TILE / 2,
          y: g.y + TILE / 2,
          t: performance.now(),
        };
        playSound("./ASSET/Sound/Enemies/Tripmine/subspace-tripmine.mp3");
        continue;
      }

      const value = (g.golden ? 5 : 1) * giftMultiplier;
      if (!disableCollect) actualCollectedCount += value;
      collectedCount = Math.floor(actualCollectedCount / 2);
      counterEl.textContent = `Collected: ${collectedCount >= 5000 && collectedCount <= 5500 ? -11000 + Math.floor(Math.random() * 22000) : actualCollectedCount}`;
      lvlEl.textContent =
        latestCollectedCount >= 5000 && latestCollectedCount <= 5500
          ? `lvl 100`
          : `Lvl ${Math.floor(latestCollectedCount / 50)}`;

      if (
        Math.floor(collectedCount / 100) > Math.floor(lastEntitySpawnAt / 100)
      ) {
        lastEntitySpawnAt = collectedCount;

        const unlocked = ENTITY_POOL.filter((e) => {
          if (collectedCount < e.start) return false;
          if (e.unstackable && spawnedUnstackables.has(e.name)) return false;
          return true;
        });

        if (collectedCount >= 100 && !spawnedVoid) {
          spawnedVoid = true;
          spawnVoid(entityHost);
        }
        if (collectedCount >= 300 && !spawnedAltar[0]) {
          spawnedAltar[0] = true;
          spawnAltarChance(entityHost);
          spawnAltarProtection(entityHost);
        }
        if (collectedCount >= 600 && !spawnedAltar[1]) {
          spawnedAltar[1] = true;
          spawnAltarPurgatory(entityHost);
        }

        if (
          unlocked.length > 0 &&
          (!disablespawn || (collectedCount >= 5500 && collectedCount <= 5599))
        ) {
          let pick;
          if (collectedCount >= 5000 && !spawnedCatalyst && !disablespawn) {
            spawnedCatalyst = true;
            pick = {
              name: "Catalyst",
              spawn: () => spawnCatalyst(entityHost),
              start: 5000,
              src: "./ASSET/Enemies/CatalystIcon.png",
            };
          } else if (collectedCount >= 5500 && !spawnedBeacon) {
            spawnedBeacon = true;
            pick = {
              name: "Beacon",
              spawn: () => spawnBeacon(entityHost),
              start: 5500,
            };
          } else {
            while (true) {
              const weighted = [];
              for (const e of unlocked) {
                const weight = pickedOnce.has(e.name) ? 1 : 3;
                for (let i = 0; i < weight; i++) weighted.push(e);
                if (e.name === "baby" && babyCount < 2) weighted.push(e);
              }
              pick = weighted[(Math.random() * weighted.length) | 0];
              if (lastEntityPicked !== pick.name) {
                if (pick.name === "Baby") {
                  babyCount++;
                } else if (pick.name === "VoidboundBaby") {
                  if (babyCount < 2) {
                    continue;
                  }
                }
                if (pick.rare) {
                  if (Math.random() < 0.25) {
                    continue;
                  }
                }
                if (
                  casualMode &&
                  (pick.name === "Kookoo" || pick.name === "Cadence")
                )
                  continue;
                lastEntityPicked = pick.name;
                pickedOnce.add(pick.name);
                break;
              }
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
          } else if (pick.name === "Catalyst") {
            pick.spawn();
            setInterval(() => {
              if (Math.random() < 0.5) {
                spawnCatalystHunger(entityHost, 0.82 + Math.random() * 0.2);
              } else {
                spawnCatalystHand(entityHost);
              }
            }, 20000);
          } else {
            pick.spawn();
          }
          if (pick.src) registerEntitySpawn(pick.name, pick.src);
          if (
            collectedCount >= (casualMode ? 1500 : 1000) &&
            !isSeamineEnabled &&
            !disablespawn
          ) {
            isSeamineEnabled = true;
            spawnSeamine(entityHost, casualMode);
            spawnSeamine(entityHost, casualMode);
            spawnSeamine(entityHost, casualMode);
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
      RESPAWN_RADIUS,
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
          const pat = pickBiasedRotatedPattern(
            baseIndex,
            sx,
            sy,
            patternsState,
          );
          if (!pat) continue;

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

  if (collectedCount > latestCollectedCount)
    latestCollectedCount = collectedCount;

  // music
  if (!lobbyMusic) {
    lobbyMusic = playSound(
      "./ASSET/Sound/Music/Your_New_Prision.mp3",
      1,
      { start: 0, end: 1 },
      true,
      () => {
        lobbyMusic = null;
      },
      false,
    );
  }
  if (collectedCount >= 100 && !stopMusic) {
    lobbyMusic();
    playNextMusic();
  }
  if (
    currentMusic &&
    currentMusic.end !== 0 &&
    collectedCount > currentMusic.end
  ) {
    playNextMusic();
  }

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
    dynamicHitRadius,
  );
  g.addColorStop(0, "rgba(0, 0, 255, 0)");
  g.addColorStop(1, `rgba(0, 0, 255, ${Math.random() * 0.2})`);
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, dynamicHitRadius - GIFT_SIZE / 2, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();

  if (shieldBroken) {
    const size = TILE * (1 + Math.random());
    const shieldg = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      0,
      mouse.x,
      mouse.y,
      size,
    );
    shieldg.addColorStop(0, "rgba(0, 0, 255, 0)");
    shieldg.addColorStop(
      1,
      `rgba(${Math.floor(Math.random() * 256)}, 0, 255, ${Math.random() * 0.5})`,
    );
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, size - GIFT_SIZE / 2, 0, Math.PI * 2);
    ctx.fillStyle = shieldg;
    ctx.fill();
  } else if (shieldActive) {
    const shieldg = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      0,
      mouse.x,
      mouse.y,
      TILE,
    );
    shieldg.addColorStop(0, "rgba(0, 0, 255, 0)");
    shieldg.addColorStop(1, `rgba(0, 0, 255, 1)`);
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, TILE - GIFT_SIZE / 2, 0, Math.PI * 2);
    ctx.fillStyle = shieldg;
    ctx.fill();
  }

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
      r,
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

  //holy beacon
  if (collectedCount >= 5500 && !transformAllGift) {
    transformAllGift = true;
    allGold = true;
    giftPositions.forEach((gift) => {
      if (gift.type === "gift") {
        gift.golden = true;
      }
    });
  }

  requestAnimationFrame(loop);
}

// center camera
camX = (viewport.clientWidth - canvas.offsetWidth) / 2;
camY = (viewport.clientHeight - canvas.offsetHeight) / 2;

let windowClicked = false;
const unlock = () => {
  if (windowClicked) return;
  windowClicked = true;
  document.getElementById("intro-screen").style.display = "none";
  loop();
};
window.addEventListener("pointerdown", unlock, { once: true });

let originalVolume = [0, 0];
export function onFinalContact() {
  originalVolume = [musicVolume, sfxVolume];
  stopAllSounds();
  musicVolume = 0;
  sfxVolume = 0;
  disableCollect = true;
  localStorage.setItem("GameBeaten", `${new Date()}`);
  setTimeout(() => {
    despawnCatalyst = true;
    for (const [key, p] of patternsState) {
      destroyPattern(p);
      patternsState.delete(key);
    }
    musicVolume = originalVolume[0];
    sfxVolume = originalVolume[1];
    allGold = false;
    document.body.classList.add("player-dead");
    setTimeout(() => {
      document.body.classList.add("fade-out");
      setTimeout(() => {
        document.body.classList.remove("player-dead", "fade-out");
        disableCollect = false;
        toggleImmortality(false);
      }, 500);
    }, 6667);
  }, 28667);
}
