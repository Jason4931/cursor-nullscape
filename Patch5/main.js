import {
  AllPatterns,
  PATTERNS,
  TILE_SIZE,
  changePatterns,
} from "./patterns.js";
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
  revive,
} from "./entityHost.js";
import { setup as spawnAltarPurgatory } from "./Enemies/AltarOfPurgatory.js";
import { setup as spawnAltarChance } from "./Enemies/AltarOfChance.js";
import { setup as spawnAltarProtection } from "./Enemies/AltarOfProtection.js";
import { setup as spawnAltarPurification } from "./Enemies/AltarOfPurification.js";
import { setup as spawnAltarEcho } from "./Enemies/AltarOfEcho.js";
import { setup as spawnAltarPassage } from "./Enemies/AltarOfPassage.js";
import { setup as spawnJumpPad } from "./Enemies/JumpPad.js";
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
import { setup as spawnGrindrail } from "./Enemies/Grindrail.js";
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
import { setup as spawnGlitch } from "./Enemies/Glitch.js";
import { setup as spawnVoid } from "./Enemies/Void.js";
import { setup as spawnBeacon } from "./Enemies/Beacon.js";
import { setup as spawnCascade } from "./Enemies/Cascade.js";

export const canvas = document.getElementById("screen");
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
const tempEntityCounts = new Map();

const entityHost = createEntityHost(canvas, entityCtx, entityCtx2, ctx);
let deafMode = JSON.parse(localStorage.getItem("deaf-mode")) ?? true;
const cheatDetector = true;

/* ===== DIFFICULTY ===== */
const beaten = localStorage.getItem("GameBeaten") != null;
const difficulties = beaten
  ? ["Casual", "Normal", "Hard"]
  : ["Casual", "Normal"];
let difficultyIndex = localStorage.getItem("difficulty") ?? 1; // default = Normal
let casualMode = difficultyIndex === 0;
export let hardMode = difficultyIndex === 2;
const diffLabel = document.getElementById("diff-label");
const diffLeft = document.getElementById("diff-left");
const diffRight = document.getElementById("diff-right");
function applyDifficulty(firstLoad = false, direction = 0) {
  const diff = difficulties[difficultyIndex];
  // diffLabel.textContent = diff;
  if (direction !== 0) {
    diffLabel.style.transform =
      direction > 0 ? "translateX(-100%)" : "translateX(100%)";
    diffLabel.style.opacity = "0";

    setTimeout(() => {
      diffLabel.textContent = diff;

      // Move instantly to opposite side
      diffLabel.style.transition = "none";
      diffLabel.style.transform =
        direction > 0 ? "translateX(100%)" : "translateX(-100%)";

      // Force layout flush
      diffLabel.offsetWidth;

      // Now animate back in
      diffLabel.style.transition =
        "transform 0.25s ease, opacity 0.2s ease, color 0.2s ease";
      diffLabel.style.transform = "translateX(0)";
      diffLabel.style.opacity = "1";
    }, 200);
  } else {
    diffLabel.textContent = diff;
  }

  if (diff === "Casual") {
    diffLabel.style.color = "#0f0";
  } else if (diff === "Hard") {
    diffLabel.style.color = "#f00";
  } else {
    diffLabel.style.color = "#fff";
  }
  casualMode = diff === "Casual";
  hardMode = diff === "Hard";
  if (!firstLoad) localStorage.setItem("difficulty", difficultyIndex);
  checkDiff();
}
diffLeft.addEventListener("click", () => {
  difficultyIndex =
    (difficultyIndex - 1 + difficulties.length) % difficulties.length;
  applyDifficulty(false, -1);
});
diffRight.addEventListener("click", () => {
  difficultyIndex = (difficultyIndex + 1) % difficulties.length;
  applyDifficulty(false, 1);
});
applyDifficulty(true);

let panelOpen = false;
let lastEntitySpawnAt = 0;
let lastEntityPicked;
let tripmineExplosion = null;
let isSeamineEnabled = false;
let isIceTileEnabled = false;
let spawnedVoid = false;
let voidScale = 1;
let seamineScale = 1;
let grindrailScale = 1;
let wallScale = 1;
let iceEffect = false;
let lastTouchedIce;
let debtAltar = null;
let spawnedAltar = [false, false, false, false];
let spawnedCatalyst = false;
let spawnedBeacon = false;
let jumppadActive = false;
let SHAKE = false;
let transformAllGift = false;
let allGold = false;
let passageGoldPattern = 0;
let disableTripmine = false;
let disableCollect = false;
let disablespawn = false;
let disableKnockback = false;
let immunebell = false;
let deathOpacity = 0;
let lastCursorInfectAt = 0;
let sorrowActive = false;
let skinwalkerCount = 0;
let highestEntitySpawned = [];
const pickedOnce = new Set();
const spawnedUnstackables = new Set();
export let beaconed = false;
export let despawnCatalyst = false;
export let voidbreakerCount = 0;
export let voidbreakerActive;
export function setVoidbreakerActive(v) {
  voidbreakerActive = v;
}
export function setSorrowActive(v) {
  sorrowActive = v;
}
export function setVoidScale(v) {
  voidScale = v;
}
export function setSeamineScale(v) {
  seamineScale = v;
}
export function setGrindrailScale(v) {
  grindrailScale = v;
}
export function setDeathOpacity(v) {
  deathOpacity = v;
}
export const pondererPositions = new Set();
export const fleshPositions = new Set();
export const cleanseZones = [];
const ENTITY_POOL = [
  {
    name: "Bell",
    spawn: () => spawnBell(entityHost, hardMode, immunebell),
    start: 0,
    src: "./ASSET/Enemies/Bell.png",
    desc: "A mostly harmless bell. Rings on contact and cleanses flesh.",
  },
  {
    name: "Mart",
    spawn: () => spawnMart(entityHost, hardMode),
    start: 0,
    src: "./ASSET/Enemies/Mart.png",
    desc: "I am Mart! The waterimp!",
  },
  {
    name: "Baby",
    spawn: () => spawnBaby(entityHost, hardMode),
    start: 0,
    src: "./ASSET/Enemies/Baby.png",
    desc: "Dashes in a straight line towards you.",
  },
  {
    name: "ICBM",
    spawn: () => spawnICBM(entityHost, hardMode),
    start: 0,
    src: "./ASSET/Enemies/ICBM.png",
    desc: "Highly explosive, stay out of the blast.",
  },
  {
    name: "Skinwalker",
    spawn: () => spawnSkinwalker(entityHost, skinwalkerCount++, hardMode),
    start: 0,
    src: "./ASSET/Enemies/Skinwalker.png",
    desc: "Mimics your every movement.",
  },
  {
    name: "Springer",
    spawn: () => spawnSpringer(entityHost, hardMode),
    start: 0,
    src: "./ASSET/Enemies/Springer.png",
    desc: "Jumps around the map, creating shockwaves that fling you.",
  },
  {
    name: "Flesh",
    spawn: () => spawnFlesh(entityHost, hardMode),
    start: 500,
    src: "./ASSET/Enemies/Flesh.png",
    desc: "Infects nearby tiles, hinders ability usage for a short duration.",
  },
  {
    name: "NIL",
    spawn: () => spawnNIL(entityHost, deafMode),
    start: 500,
    src: "./ASSET/Enemies/NIL.png",
    desc: "<0>",
  },
  {
    name: "Guardian",
    spawn: () => spawnGuardian(entityHost, hardMode),
    start: 500,
    src: "./ASSET/Enemies/Guardian.png",
    desc: "Fires a volley of bullets.",
  },
  {
    name: "Dozer",
    spawn: () => spawnDozer(entityHost, hardMode),
    start: 500,
    src: "./ASSET/Enemies/Dozer.png",
    unstackable: true,
    desc: "Let go of all movements before its eyes open: the earlier you stop, the earlier it triggers.",
  },
  {
    name: "Telefragger",
    spawn: () => spawnTelefragger(entityHost, hardMode, deafMode),
    start: 800,
    src: "./ASSET/Enemies/Telefragger.png",
    desc: "Teleports infront of you.",
  },
  {
    name: "Random",
    start: 800,
    src: "./ASSET/Enemies/Random.png",
    desc: "Takes on the temporary form of a random enemy.",
  },
  {
    name: "Random",
    start: 1300,
    src: "./ASSET/Enemies/Random.png",
    desc: "Takes on the temporary form of a random enemy.",
  },
  {
    name: "Random",
    start: 1800,
    src: "./ASSET/Enemies/Random.png",
    desc: "Takes on the temporary form of a random enemy.",
  },
  {
    name: "Kookoo",
    spawn: () => spawnKookoo(entityHost),
    start: 800,
    src: "./ASSET/Enemies/Kookoo.png",
    unstackable: true,
    desc: "Dash your cursor right after it hits the number that was shown at the start.",
  },
  {
    name: "VoidImplosions",
    spawn: () => spawnVoidImplosions(entityHost),
    start: 1000,
    src: "./ASSET/Curses/VoidImplosions.png",
    unstackable: true,
    desc: "Creates several implosions around the map that explode after a short duration.",
  },
  {
    name: "Sorrow",
    spawn: () => spawnSorrow(entityHost),
    start: 1000,
    src: "./ASSET/Curses/Sorrow.png",
    unstackable: true,
    desc: "When the rain starts, get above something, those in the air will quickly melt away.",
  },
  {
    name: "Doombringer",
    spawn: () => spawnDoombringer(entityHost),
    start: 1000,
    src: "./ASSET/Curses/Doombringer.png",
    unstackable: true,
    desc: "It will scream, shut it up by touching a Jumppad.",
  },
  {
    name: "VoidboundBaby",
    spawn: () => spawnVoidboundBaby(entityHost, hardMode),
    start: 1200,
    src: "./ASSET/Enemies/VoidboundBaby.png",
    desc: "Much quicker dash. Much deadlier.",
  },
  {
    name: "Ponderer",
    spawn: () => spawnPonderer(entityHost, hardMode),
    start: 1200,
    src: "./ASSET/Enemies/Ponderer.png",
    rare: true,
    desc: "Focus on it. Don't let the clock tick down.",
  },
  {
    name: "VoidboundGuardian",
    spawn: () => spawnVoidboundGuardian(entityHost, hardMode),
    start: 1200,
    src: "./ASSET/Enemies/VoidboundGuardian.png",
    desc: "Bullets will begin to home in, much more agile.",
  },
  {
    name: "Voidbreaker",
    spawn: () => spawnVoidbreaker(entityHost, voidbreakerCount++, hardMode),
    start: 1500,
    src: "./ASSET/Enemies/Voidbreaker.png",
    desc: "Steer clear of his blades direction, his accuracy cannot be underestimated.",
  },
  {
    name: "Cadence",
    spawn: () => spawnCadence(entityHost, hardMode, deafMode),
    start: 1500,
    src: "./ASSET/Enemies/Cadence.png",
    desc: "Collect the instruments, keep it at bay.",
    unstackable: true,
  },
  {
    name: "Catalyst",
    spawn: () => spawnCatalyst(entityHost),
    start: 1000000000,
    src: "./ASSET/Enemies/CatalystIcon.png",
    desc: "למה לבזבז את כל הזמן הזה באור? תהיה איתי בחושך.",
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
let tripmineHell = JSON.parse(localStorage.getItem("tripmine-hell")) ?? false;
let enableVoid = JSON.parse(localStorage.getItem("enable-void")) ?? true;
let enablePonderer =
  JSON.parse(localStorage.getItem("enable-ponderer")) ?? true;
let accurateCursor =
  JSON.parse(localStorage.getItem("accurate-cursor")) ?? false;
let sfxVolume = localStorage.getItem("sfxVolume")
  ? Number(localStorage.getItem("sfxVolume"))
  : 50;
let musicVolume = localStorage.getItem("musicVolume")
  ? Number(localStorage.getItem("musicVolume"))
  : 30;
graphicsSlider.value = Number(localStorage.getItem("graphicsLevel")) || 0;

document.getElementById("toggle-grids").checked = showGrids;
document.getElementById("toggle-floor").checked = showFloor;
document.getElementById("toggle-border").checked = showBorder;
document.getElementById("toggle-epileptic").checked = epilepticMode;
document.getElementById("toggle-blindness").checked = blindnessMode;
document.getElementById("toggle-reduced-motion").checked = reducedMotion;
document.getElementById("toggle-deaf-mode").checked = deafMode;
document.getElementById("toggle-drunk-camera").checked = drunkCamera;
document.getElementById("toggle-tripmine-hell").checked = tripmineHell;
document.getElementById("toggle-enable-void").checked = enableVoid;
document.getElementById("toggle-enable-ponderer").checked = enablePonderer;
document.getElementById("toggle-accurate-cursor").checked = accurateCursor;
document.getElementById("sfx-volume").value = sfxVolume;
document.getElementById("music-volume").value = musicVolume;
graphicsSlider.dispatchEvent(new Event("input"));

function checkDiff() {
  if (casualMode) {
    document.getElementById("entity-panel-diff").textContent = "Casual";
  } else if (hardMode) {
    document.getElementById("entity-panel-diff").textContent = "Hard";
  } else {
    document.getElementById("entity-panel-diff").textContent = "Normal";
  }
}
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
  RENDER_RADIUS = blindnessMode ? 200 : RESPAWN_RADIUS * 1.3;
});
toggle("toggle-reduced-motion", (v) => {
  reducedMotion = v;
});
toggle("toggle-deaf-mode", (v) => {
  deafMode = v;
});
toggle("toggle-drunk-camera", (v) => {
  drunkCamera = v;
});
toggle("toggle-tripmine-hell", (v) => {
  tripmineHell = v;
});
toggle("toggle-enable-void", (v) => {
  enableVoid = v;
});
toggle("toggle-enable-ponderer", (v) => {
  enablePonderer = v;
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
  RENDER_RADIUS = blindnessMode ? 200 : RESPAWN_RADIUS * 1.3;
}
function setGraphicsMedium() {
  REGEN_BUDGET = 12;
  REGEN_INTERVAL = 300;
  DESPAWN_RADIUS = SUPER_TILE * TILE * 7.5;
  RESPAWN_RADIUS = SUPER_TILE * TILE * 6;
  RENDER_RADIUS = blindnessMode ? 200 : RESPAWN_RADIUS * 1.3;
}
function setGraphicsHigh() {
  REGEN_BUDGET = 18;
  REGEN_INTERVAL = 180;
  DESPAWN_RADIUS = SUPER_TILE * TILE * 10;
  RESPAWN_RADIUS = SUPER_TILE * TILE * 8;
  RENDER_RADIUS = blindnessMode ? 200 : RESPAWN_RADIUS * 1.3;
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
  localStorage.removeItem("deaf-mode");
  localStorage.removeItem("epileptic");
  localStorage.removeItem("blindness");
  localStorage.removeItem("drunk-camera");
  localStorage.removeItem("tripmine-hell");
  localStorage.removeItem("enable-void");
  localStorage.removeItem("enable-ponderer");
  localStorage.removeItem("accurate-cursor");
  localStorage.removeItem("graphicsLevel");
  localStorage.setItem("sfxVolume", "50");
  localStorage.setItem("musicVolume", "30");
  showBorder = true;
  showFloor = true;
  showGrids = false;
  reducedMotion = false;
  deafMode = true;
  epilepticMode = false;
  blindnessMode = false;
  drunkCamera = false;
  tripmineHell = false;
  enableVoid = true;
  enablePonderer = true;
  accurateCursor = false;
  sfxVolume = 50;
  musicVolume = 30;
  document.getElementById("toggle-border").checked = true;
  document.getElementById("toggle-floor").checked = true;
  document.getElementById("toggle-grids").checked = false;
  document.getElementById("toggle-reduced-motion").checked = false;
  document.getElementById("toggle-deaf-mode").checked = true;
  document.getElementById("toggle-epileptic").checked = false;
  document.getElementById("toggle-blindness").checked = false;
  document.getElementById("toggle-drunk-camera").checked = false;
  document.getElementById("toggle-tripmine-hell").checked = false;
  document.getElementById("toggle-enable-void").checked = true;
  document.getElementById("toggle-enable-ponderer").checked = true;
  document.getElementById("toggle-accurate-cursor").checked = false;
  document.getElementById("sfx-volume").value = 50;
  document.getElementById("music-volume").value = 30;
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
  checkDiff();

  RENDER_RADIUS = RESPAWN_RADIUS * 1.3;
};

/* ===== CONFIG ===== */
canvas.width = 10000;
canvas.height = 10000;

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
const SUPER_TILE = 9;
let lagDebt = 0;
let lagFactor = 1;

/* ===== EVENTS ===== */
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.key === "?" && e.shiftKey && e.ctrlKey) {
    if (topLeftInput.style.display === "none") {
      if (cheatDetector) disableProgression = true;
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
let disableProgression = false;
let firstDisableProgression = false;
let cheattimer = 0;
const altars = [
  { name: "chance", activate: () => activateChance() },
  { name: "echo", activate: () => activateEcho() },
  { name: "passage", activate: () => activatePassage() },
  { name: "protection", activate: () => activateProtection() },
  { name: "purgatory", activate: () => activatePurgatory() },
  { name: "purification", activate: () => activatePurification() },
];
export let soundStopped = false;
const topLeftInput = document.getElementById("spawn-input");
topLeftInput.addEventListener("input", () => {
  let rawInput = topLeftInput.value.trim().toLowerCase();
  if (rawInput === "\\") topLeftInput.value = "";
  const match = rawInput.match(/^(\d+)(.+)$/);
  let spawnCount = 1;
  let input = rawInput;
  if (match) {
    spawnCount = parseInt(match[1], 10);
    input = match[2];
  }
  if (input === "\\") topLeftInput.value = "";
  const entity =
    ENTITY_POOL.find((e) => e.name.toLowerCase() === input) ||
    input.toLowerCase() === "catalyst" ||
    input.toLowerCase() === "seamine" ||
    input.toLowerCase() === "grindrail";
  if (entity) {
    for (let i = 0; i < spawnCount; i++) {
      if (input.toLowerCase() === "catalyst") {
        spawnCatalyst(entityHost);
        spawnCatalystIntro();
        registerEntitySpawn("Catalyst", "./ASSET/Enemies/CatalystIcon.png");
      } else if (input.toLowerCase() === "seamine") {
        spawnSeamine(entityHost);
      } else if (input.toLowerCase() === "grindrail") {
        spawnGrindrail(entityHost);
      } else if (entity.name === "Random") {
        const randUnlocked = ENTITY_POOL.filter((e) => {
          if (e.name === "Random") return false;
          if (!enablePonderer && e.name === "Ponderer") return false;
          if (collectedCount < e.start) return false;
          if (e.unstackable) return false;
          return true;
        });
        if (randUnlocked.length !== 0) {
          let randPick =
            randUnlocked[(Math.random() * randUnlocked.length) | 0];
          randPick.spawn();
          registerEntitySpawn(entity.name, entity.src);
        }
      } else {
        entity.spawn();
        registerEntitySpawn(entity.name, entity.src);
      }
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
  if (input === "disableknockback") {
    disableKnockback = !disableKnockback;
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
  if (input === "commandlist") {
    document.getElementById("spawn-input-commands").style.opacity = 1;
    topLeftInput.value = "";
    topLeftInput.style.display = "none";
    topLeftInput.blur();
  }
  if (input === "biggerradius") {
    if (HIT_RADIUS === GIFT_SIZE) {
      HIT_RADIUS = GIFT_SIZE * 10;
    } else {
      HIT_RADIUS = GIFT_SIZE;
    }
    topLeftInput.value = "";
    topLeftInput.style.display = "none";
    topLeftInput.blur();
  }
  if (input === "immunebell") {
    immunebell = !immunebell;
    topLeftInput.value = "";
    topLeftInput.style.display = "none";
    topLeftInput.blur();
  }
  if (input === "revive") {
    revive();
    soundStopped = false;
    topLeftInput.value = "";
    topLeftInput.style.display = "none";
    topLeftInput.blur();
  }
  if (input === "cascade") {
    spawnCascade(entityHost);
    topLeftInput.value = "";
    topLeftInput.style.display = "none";
    topLeftInput.blur();
  }
  if (input === "oneofeach") {
    spawnBell(entityHost, hardMode, immunebell);
    spawnMart(entityHost, hardMode);
    spawnBaby(entityHost, hardMode);
    spawnICBM(entityHost, hardMode);
    spawnSkinwalker(entityHost, skinwalkerCount++, hardMode);
    spawnSpringer(entityHost, hardMode);
    spawnFlesh(entityHost, hardMode);
    spawnNIL(entityHost);
    spawnGuardian(entityHost, hardMode);
    spawnDozer(entityHost, hardMode);
    spawnTelefragger(entityHost, hardMode, deafMode);
    spawnKookoo(entityHost);
    spawnVoidImplosions(entityHost);
    spawnSorrow(entityHost);
    spawnDoombringer(entityHost);
    spawnVoidboundBaby(entityHost, hardMode);
    spawnPonderer(entityHost, hardMode);
    spawnVoidboundGuardian(entityHost, hardMode);
    spawnVoidbreaker(entityHost, voidbreakerCount++, hardMode);
    spawnCadence(entityHost, hardMode, deafMode);
    spawnCatalyst(entityHost);
    spawnCatalystIntro();
    registerEntitySpawn("Bell", "./ASSET/Enemies/Bell.png");
    registerEntitySpawn("Mart", "./ASSET/Enemies/Mart.png");
    registerEntitySpawn("Baby", "./ASSET/Enemies/Baby.png");
    registerEntitySpawn("ICBM", "./ASSET/Enemies/ICBM.png");
    registerEntitySpawn("Skinwalker", "./ASSET/Enemies/Skinwalker.png");
    registerEntitySpawn("Springer", "./ASSET/Enemies/Springer.png");
    registerEntitySpawn("Flesh", "./ASSET/Enemies/Flesh.png");
    registerEntitySpawn("NIL", "./ASSET/Enemies/NIL.png");
    registerEntitySpawn("Guardian", "./ASSET/Enemies/Guardian.png");
    registerEntitySpawn("Dozer", "./ASSET/Enemies/Dozer.png");
    registerEntitySpawn("Telefragger", "./ASSET/Enemies/Telefragger.png");
    registerEntitySpawn("Kookoo", "./ASSET/Enemies/Kookoo.png");
    registerEntitySpawn("VoidImplosions", "./ASSET/Curses/VoidImplosions.png");
    registerEntitySpawn("Sorrow", "./ASSET/Curses/Sorrow.png");
    registerEntitySpawn("Doombringer", "./ASSET/Curses/Doombringer.png");
    registerEntitySpawn("VoidboundBaby", "./ASSET/Enemies/VoidboundBaby.png");
    registerEntitySpawn("Ponderer", "./ASSET/Enemies/Ponderer.png");
    registerEntitySpawn(
      "VoidboundGuardian",
      "./ASSET/Enemies/VoidboundGuardian.png",
    );
    registerEntitySpawn("Voidbreaker", "./ASSET/Enemies/Voidbreaker.png");
    registerEntitySpawn("Cadence", "./ASSET/Enemies/Cadence.png");
    registerEntitySpawn("Catalyst", "./ASSET/Enemies/CatalystIcon.png");
    topLeftInput.value = "";
    topLeftInput.style.display = "none";
    topLeftInput.blur();
  }
  if (input === "youwillnotsurvivethis") {
    let i = 0;
    let interval = setInterval(() => {
      i++;
      spawnGlitch(entityHost, true);
      if (i >= 10) clearInterval(interval);
    }, 100);
    topLeftInput.value = "";
    topLeftInput.style.display = "none";
    topLeftInput.blur();
  }
  if (input === "suicide") {
    death();
    topLeftInput.value = "";
    topLeftInput.style.display = "none";
    topLeftInput.blur();
  }
  for (const altar of altars) {
    if (input === altar.name) {
      altar.activate();

      topLeftInput.value = "";
      topLeftInput.style.display = "none";
      topLeftInput.blur();

      break;
    }
  }
  const patternMatch = input.match(/^pattern(\d+)spawn$/);
  if (patternMatch) {
    const index = parseInt(patternMatch[1], 10);
    const base = AllPatterns[index];
    if (!base) return;

    const sx = Math.floor(mouse.x / (SUPER_TILE * TILE));
    const sy = Math.floor(mouse.y / (SUPER_TILE * TILE));

    // find existing pattern at this super tile
    let target = null;
    for (const p of patternsState.values()) {
      if (p.sx === sx && p.sy === sy) {
        target = p;
        break;
      }
    }

    if (target) {
      destroyPattern(target);

      for (let y = 0; y < target.ph; y++) {
        for (let x = 0; x < target.pw; x++) {
          superOccupied[target.sy + y][target.sx + x] = false;
        }
      }
    }

    placeSuper(sx, sy, base);

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
  const value = input.value.toLowerCase();

  const target = [
    {
      text: "shutup",
      activate: () => {
        location.reload();
      },
    },
    {
      text: "football",
      activate: () => {
        img.src = "./ASSET/Misc/Football.png";
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
    },
    {
      text: "pondererisbackforblood",
      activate: () => {
        img.src = "./ASSET/Enemies/Ponderer.png";
        localStorage.setItem("enable-ponderer", "true");
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
    },
    {
      text: "yippee",
      activate: () => {
        img.style.transition = "transform 0.15s cubic-bezier(0, 0, 0.4, 1)";
        img.style.transform = "translate(-50%, -50%) translateY(-200px)";
        setTimeout(() => {
          img.style.transition = "transform 0.15s cubic-bezier(0.4, 0, 1, 1)";
          img.style.transform = "translate(-50%, -50%) translateY(0)";
        }, 150);
        let count = 0;
        let jump = setInterval(() => {
          count++;
          if (count >= 4) {
            clearInterval(jump);
            return;
          }
          img.style.transition = "transform 0.15s cubic-bezier(0, 0, 0.4, 1)";
          img.style.transform = "translate(-50%, -50%) translateY(-200px)";
          setTimeout(() => {
            img.style.transition = "transform 0.15s cubic-bezier(0.4, 0, 1, 1)";
            img.style.transform = "translate(-50%, -50%) translateY(0)";
          }, 150);
        }, 300);
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
    },
    {
      text: "explode",
      activate: () => {
        img.style.transition = "none";
        img.style.transform = "translate(-50%, -50%) rotate(60deg)";
        setTimeout(() => {
          img.style.transition = "transform 0.25s ease-out";
          img.style.transform =
            "translate(-50%, -50%) rotate(60deg) translateY(-100vw)";
        }, 10);
        const clone = img.cloneNode(true);
        clone.src = "./ASSET/Misc/Explode.png";
        clone.style.transition = "none";
        clone.style.transform = "translate(-50%, -50%) rotate(0deg) scale(1.3)";
        clone.style.opacity = "1";
        img.parentNode.insertBefore(clone, img.nextSibling);
        requestAnimationFrame(() => {
          clone.style.transition = "all 0.4s ease-out";
          clone.style.transform =
            "translate(-50%, -50%) rotate(360deg) scale(1.3)";
          clone.style.opacity = "0";
        });
        setTimeout(() => {
          location.reload();
        }, 500);
      },
    },
    {
      text: "minesweeper",
      activate: () => {
        window.open("https://minesweeper.online/start/1", "_blank");
        location.reload();
      },
    },
    {
      text: "mminesweeper",
      activate: () => {
        window.open("https://minesweeper.online/start/2", "_blank");
        location.reload();
      },
    },
    {
      text: "mmminesweeper",
      activate: () => {
        window.open("https://minesweeper.online/start/3", "_blank");
        location.reload();
      },
    },
    {
      text: "telefragger",
      activate: () => {
        img.src = "./ASSET/Misc/Telefragger.gif";
        img.style.transform = "translate(-50%, -50%) scale(1.25)";
        setTimeout(() => {
          location.reload();
        }, 22000);
      },
    },
    {
      text: "boyquiet",
      activate: () => {
        localStorage.setItem("boyquiet", "true");
        location.reload();
      },
    },
  ];

  const match = target.find((t) => t.text.startsWith(value));

  if (match && value.length > 0) {
    input.style.color = "lime";
  } else {
    input.style.color = "";
  }

  const exact = target.find((t) => t.text === value);
  if (exact) {
    exact.activate();
    input.readOnly = true;
  }
});
let clickedRefresh = 0;
img.addEventListener("click", () => {
  clickedRefresh++;

  clearTimeout(wobbleTimer);

  img.style.transition = "none";
  img.style.transform = `translate(-50%, -50%) scale(0.95)`;

  wobbleTimer = setTimeout(() => {
    img.style.transition = "transform 0.5s ease-out";
    img.style.transform = "translate(-50%, -50%) scale(1)";
  }, 10);

  if (clickedRefresh >= 2) setTimeout(location.reload(), 200);
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
let slownessCooldown = false;
let slownessTime = 0;

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
checkDiff();

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
  if (
    soundStopped &&
    soundPath != "./ASSET/Sound/Enemies/Catalyst/ending_1.mp3" &&
    soundPath != "./ASSET/Sound/Enemies/ending_2.mp3"
  )
    return;
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
    audio.play().catch(() => {});

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
  if (
    soundPath != "./ASSET/Sound/Enemies/Catalyst/ending_1.mp3" &&
    soundPath != "./ASSET/Sound/Enemies/ending_2.mp3"
  )
    activeSounds.add(entry);

  return stop;
}
export function stopAllSounds() {
  soundStopped = true;
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
  //Volume 1
  {
    start: 100,
    end: 999,
    src: "./ASSET/Sound/Music/Void_Explorer.ogg",
  },
  {
    start: 100,
    end: 599,
    src: "./ASSET/Sound/Music/Mart.ogg",
  },
  {
    start: 500,
    end: 999,
    src: "./ASSET/Sound/Music/Baby_Face.ogg",
  },
  {
    start: 100,
    end: 999,
    src: "./ASSET/Sound/Music/Seems_you_got_Telefragged.ogg",
  },
  {
    start: 100,
    end: 999,
    src: "./ASSET/Sound/Music/Paradox_Trip.ogg",
  },
  {
    start: 1000,
    end: 2999,
    src: "./ASSET/Sound/Music/Line_of_Fire.ogg",
  },
  {
    start: 2000,
    end: 3099,
    src: "./ASSET/Sound/Music/Conviction_(feat._SPIRIT_GARDEN_).ogg",
  },
  {
    start: 1000,
    end: 1999,
    src: "./ASSET/Sound/Music/Congratulations,_you_beat_the_Tutorial.ogg",
  },
  {
    start: 1000,
    end: 2999,
    src: "./ASSET/Sound/Music/FearOfShadow.ogg",
  },
  {
    start: 2000,
    end: 3999,
    src: "./ASSET/Sound/Music/AudioDetermination.ogg",
  },
  {
    start: 1000,
    end: 2999,
    src: "./ASSET/Sound/Music/AudioInescapable.ogg",
  },
  {
    start: 3000,
    end: 4099,
    src: "./ASSET/Sound/Music/AudioTHISWORLDWILLCOLLAPSE.ogg",
  },
  //Volume 2
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
    end: 2099,
    src: "./ASSET/Sound/Music/Conga-Line.mp3",
  },
  {
    start: 2000,
    end: 3099,
    src: "./ASSET/Sound/Music/Former-Gardens.mp3",
  },
  {
    start: 2000,
    end: 3099,
    src: "./ASSET/Sound/Music/Death-Defiance.mp3",
  },
  {
    start: 2000,
    end: 3999,
    src: "./ASSET/Sound/Music/Void-Breaker.mp3",
  },
  {
    start: 3000,
    end: 4999,
    src: "./ASSET/Sound/Music/IMPERIAL-ENIGMA.mp3",
  },
  {
    start: 3000,
    end: 4999,
    src: "./ASSET/Sound/Music/Temporal-Tenacity.mp3",
  },
  {
    start: 4000,
    end: 5099,
    src: "./ASSET/Sound/Music/DECAY-TRUE.mp3",
  },
  {
    start: 1500,
    end: 2999,
    src: "./ASSET/Sound/Music/Find-your-Flame.mp3",
  },
  //Volume 3
  {
    start: 100,
    end: 999,
    src: "./ASSET/Sound/Music/Checkmate.mp3",
  },
  {
    start: 100,
    end: 999,
    src: "./ASSET/Sound/Music/Domasp's_Gift.mp3",
  },
  {
    start: 100,
    end: 1999,
    src: "./ASSET/Sound/Music/Self_Destruct.mp3",
  },
  {
    start: 100,
    end: 999,
    src: "./ASSET/Sound/Music/Inter-Continental_Ballistic_Missile.mp3",
  },
  {
    start: 1000,
    end: 1999,
    src: "./ASSET/Sound/Music/Disruption_and_Dissonance.mp3",
  },
  {
    start: 1000,
    end: 2999,
    src: "./ASSET/Sound/Music/Vein_Blood.mp3",
  },
  {
    start: 1000,
    end: 2999,
    src: "./ASSET/Sound/Music/Monolith.mp3",
  },
  {
    start: 3000,
    end: 4099,
    src: "./ASSET/Sound/Music/Cognition.mp3",
  },
  {
    start: 3000,
    end: 4099,
    src: "./ASSET/Sound/Music/Won-t-you-hear-my-Symphony.mp3",
  },
  {
    start: 3000,
    end: 4099,
    src: "./ASSET/Sound/Music/Aerodynamics.mp3",
  },
  {
    start: 5000,
    end: 0,
    src: "./ASSET/Sound/Music/Insurmountable_Abyss.mp3",
  },
  {
    start: 3000,
    end: 4099,
    src: "./ASSET/Sound/Music/It_Doesn't_End_Here.mp3",
  },
];
let lobbyMusic = null;
let stopMusic = null;
let lastMusicSrc = null;
let currentMusic = null;
function playNextMusic() {
  const candidates = musicList.filter((m) => {
    if (actualCollectedCount < m.start) return false;
    if (m.end !== 0 && actualCollectedCount > m.end) return false;
    if (m.src === lastMusicSrc) return false; // prevent repeat
    return true;
  });

  // fallback: if only one valid song exists, allow repeat
  const pool = candidates.length
    ? candidates
    : musicList.filter((m) => {
        if (actualCollectedCount < m.start) return false;
        if (m.end !== 0 && actualCollectedCount > m.end) return false;
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
  if (disableCollect || disableKnockback) return;
  if (instant) {
    camX += x;
    camY += y;
  } else {
    camVX += x;
    camVY += y;
  }
}
export function isCursorOnFloor(custom) {
  for (const t of floorTiles) {
    if (custom) {
      if (
        custom.x >= t.x &&
        custom.x < t.x + TILE &&
        custom.y >= t.y &&
        custom.y < t.y + TILE
      ) {
        return true;
      }
    } else {
      if (
        mouse.x >= t.x &&
        mouse.x < t.x + TILE &&
        mouse.y >= t.y &&
        mouse.y < t.y + TILE
      ) {
        if (
          t.wall ||
          (t.deco[0] && t.deco[1] && t.deco[3] >= 0.4 && t.deco[3] <= 0.6)
        )
          wallScale = 0.5;
        if (t.ice) {
          lastTouchedIce = performance.now();
          iceEffect = true;
        }
        return true;
      }
    }
  }
  return false;
}
export function jumppadHit(v) {
  if (v == "get") {
    return jumppadActive;
  } else if (v == "set") {
    jumppadActive = true;
    setTimeout(() => {
      jumppadActive = false;
    }, 200);
  }
}

function registerEntitySpawn(name, imageSrc, temp = false) {
  const map = temp ? tempEntityCounts : entityCounts;

  let data = map.get(name);
  if (!data) {
    data = {
      count: 0,
      img: imageSrc,
      desc: ENTITY_POOL.find((e) => e.name === name)?.desc || "",
    };
    map.set(name, data);
  }

  data.count++;

  let total = 0;
  for (const d of entityCounts.values()) {
    total += d.count;
  }

  let tempTotal = 0;
  for (const d of tempEntityCounts.values()) {
    tempTotal += d.count;
  }

  const el = document.getElementById("entity-panel-count");

  el.textContent =
    tempTotal > 0
      ? `EntityCount: ${total} (+${tempTotal})`
      : `EntityCount: ${total}`;

  if (total >= 100) {
    el.textContent = "EntityCount: 100+";
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
    img.title = data.desc;

    slot.appendChild(img);

    if (data.count >= 2) {
      const badge = document.createElement("div");
      badge.className = "entity-count";
      badge.textContent = data.count;
      slot.appendChild(badge);
    }

    content.appendChild(slot);
  }
  for (const [name, data] of tempEntityCounts) {
    const slot = document.createElement("div");
    slot.className = "entity-slot";

    const img = document.createElement("img");
    img.src = data.img;
    img.alt = name;
    img.style.opacity = 0.6;

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

function trackHighestEntity(unregister, startValue, name) {
  if (typeof unregister !== "function") return;

  highestEntitySpawned.push({ unregister, start: startValue, name });
  highestEntitySpawned.sort((a, b) => b.start - a.start);

  if (highestEntitySpawned.length > 3) {
    highestEntitySpawned.length = 3;
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
  return patterns
    .map((p) => {
      const area = p.length * p[0].length;
      const weight = 1 / area;

      // Generate weighted random key
      // Higher weight => higher chance of larger key
      const key = Math.pow(Math.random(), 1 / weight);

      return { p, key };
    })
    .sort((a, b) => b.key - a.key)
    .map((obj) => obj.p);
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
        if (
          (p[y]?.[pw - 1] === 9 || p[y]?.[pw - 1] === 29) &&
          (pat[y][0] === 9 || pat[y][0] === 29)
        )
          score++;
      }
    }

    if (right) {
      const p = right.pattern;
      for (let y = 0; y < h; y++) {
        if (
          (p[y]?.[0] === 9 || p[y]?.[0] === 29) &&
          (pat[y][w - 1] === 9 || pat[y][w - 1] === 29)
        )
          score++;
      }
    }

    if (top) {
      const p = top.pattern;
      const ph = p.length;
      for (let x = 0; x < w; x++) {
        // if (p[ph - 1]?.[x] === 9 && pat[0][x] === 9) score++;
        if (
          (p[ph - 1]?.[x] === 9 || p[ph - 1]?.[x] === 29) &&
          (pat[0][x] === 9 || pat[0][x] === 29)
        )
          score++;
      }
    }

    if (bot) {
      const p = bot.pattern;
      for (let x = 0; x < w; x++) {
        if (
          (p[0]?.[x] === 9 || p[0]?.[x] === 29) &&
          (pat[h - 1][x] === 9 || pat[h - 1][x] === 29)
        )
          score++;
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
function spawnCatalystIntro() {
  SHAKE = true;
  changePatterns("final");
  ROTATED_PATTERNS = PATTERNS.map((base) => {
    const r0 = base;
    const r1 = rotateMatrix90(r0);
    const r2 = rotateMatrix90(r1);
    const r3 = rotateMatrix90(r2);
    return [r0, r1, r2, r3];
  });

  const base3x3 = PATTERNS.filter(
    (p) => p.length / SUPER_TILE === 3 && p[0].length / SUPER_TILE === 3,
  );
  if (!base3x3.length) return;
  const existing3x3 = [];
  for (const p of patternsState.values()) {
    if (p.pw === 3 && p.ph === 3) {
      existing3x3.push(p);
    }
  }
  for (const target of existing3x3) {
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

      if (!pat) {
        pat = pickRotatedPattern(baseIndex);
      }

      if (canPlaceSuper(target.sx, target.sy, pat)) {
        placeSuper(target.sx, target.sy, pat);
        break;
      }
    }
  }

  setInterval(() => {
    if (Math.random() < 0.5) {
      spawnCatalystHunger(entityHost, 0.82 + Math.random() * 0.2);
    } else {
      spawnCatalystHand(entityHost);
    }
  }, 15000);
}
/* ===== ALTARS ===== */
let lastAltar = null;
function ENTITY_SPAWN(temp = false, exceptEntity = null) {
  let name = null;
  const unlocked = ENTITY_POOL.filter((e) => {
    if (collectedCount < e.start) return false;
    if (e.unstackable && spawnedUnstackables.has(e.name)) return false;
    if (exceptEntity && e.name === exceptEntity) return false;
    return true;
  });

  if (unlocked.length > 0) {
    let pick;
    if (collectedCount >= (hardMode ? 10000 : 5000) && !spawnedCatalyst) {
      spawnedCatalyst = true;
      spawnCatalystIntro();
      pick = {
        name: "Catalyst",
        spawn: () => spawnCatalyst(entityHost),
        start: 5000,
        src: "./ASSET/Enemies/CatalystIcon.png",
        desc: "למה לבזבז את כל הזמן הזה באור? תהיה איתי בחושך.",
      };
    } else if (
      collectedCount >= (hardMode ? 11000 : 5500) &&
      !spawnedBeacon &&
      !disableProgression
    ) {
      spawnedBeacon = true;
      pick = {
        name: "Beacon",
        spawn: () => spawnBeacon(entityHost, deafMode),
        start: 5500,
      };
    } else {
      const weighted = [];
      for (const e of unlocked) {
        const weight = pickedOnce.has(e.name) ? 1 : 3;
        for (let i = 0; i < weight; i++) weighted.push(e);
      }
      while (true) {
        pick = weighted[(Math.random() * weighted.length) | 0];
        if (lastEntityPicked !== pick.name) {
          if (pick.rare) {
            if (Math.random() < 0.25) {
              continue;
            }
          }
          if (!enablePonderer && pick.name === "Ponderer") continue;
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
        if (!enablePonderer && e.name === "Ponderer") return false;
        if (collectedCount < e.start) return false;
        if (e.unstackable) return false;
        return true;
      });
      if (randUnlocked.length !== 0) {
        let randPick = randUnlocked[(Math.random() * randUnlocked.length) | 0];
        const unregister = randPick.spawn();
        if (!temp) trackHighestEntity(unregister, pick.start, pick.name);
        if (temp && typeof unregister === "function") {
          setTimeout(() => {
            unregister();
            spawnedUnstackables.delete(pick.name);

            const data = tempEntityCounts.get(pick.name);
            if (data) {
              data.count--;

              if (data.count <= 0) {
                tempEntityCounts.delete(pick.name);
              }
            }

            let total = 0;
            for (const d of entityCounts.values()) total += d.count;

            let tempTotal = 0;
            for (const d of tempEntityCounts.values()) tempTotal += d.count;

            const el = document.getElementById("entity-panel-count");

            el.textContent =
              tempTotal > 0
                ? `EntityCount: ${total} (+${tempTotal})`
                : `EntityCount: ${total}`;

            if (total >= 100) {
              el.textContent = "EntityCount: 100+";
            }

            renderPanel();
          }, 60000);
        }
      }
    } else if (pick.name === "Catalyst") {
      const unregister = pick.spawn();
      if (!temp) trackHighestEntity(unregister, pick.start, pick.name);
      if (temp && typeof unregister === "function") {
        setTimeout(() => {
          unregister();
          spawnedUnstackables.delete(pick.name);

          const data = tempEntityCounts.get(pick.name);
          if (data) {
            data.count--;

            if (data.count <= 0) {
              tempEntityCounts.delete(pick.name);
            }
          }

          let total = 0;
          for (const d of entityCounts.values()) total += d.count;

          let tempTotal = 0;
          for (const d of tempEntityCounts.values()) tempTotal += d.count;

          const el = document.getElementById("entity-panel-count");

          el.textContent =
            tempTotal > 0
              ? `EntityCount: ${total} (+${tempTotal})`
              : `EntityCount: ${total}`;

          if (total >= 100) {
            el.textContent = "EntityCount: 100+";
          }

          renderPanel();
        }, 60000);
      }
    } else {
      const unregister = pick.spawn();
      if (!temp) trackHighestEntity(unregister, pick.start, pick.name);
      if (temp && typeof unregister === "function") {
        setTimeout(() => {
          unregister();
          spawnedUnstackables.delete(pick.name);

          const data = tempEntityCounts.get(pick.name);
          if (data) {
            data.count--;

            if (data.count <= 0) {
              tempEntityCounts.delete(pick.name);
            }
          }

          let total = 0;
          for (const d of entityCounts.values()) total += d.count;

          let tempTotal = 0;
          for (const d of tempEntityCounts.values()) tempTotal += d.count;

          const el = document.getElementById("entity-panel-count");

          el.textContent =
            tempTotal > 0
              ? `EntityCount: ${total} (+${tempTotal})`
              : `EntityCount: ${total}`;

          if (total >= 100) {
            el.textContent = "EntityCount: 100+";
          }

          renderPanel();
        }, 60000);
      }
    }
    if (pick.src) {
      name = pick.name;
      registerEntitySpawn(pick.name, pick.src, temp);
    }
    if (collectedCount >= 800 && !isIceTileEnabled) {
      isIceTileEnabled = true;
      changePatterns("ice");
      ROTATED_PATTERNS = PATTERNS.map((base) => {
        const r0 = base;
        const r1 = rotateMatrix90(r0);
        const r2 = rotateMatrix90(r1);
        const r3 = rotateMatrix90(r2);
        return [r0, r1, r2, r3];
      });
      setTimeout(() => {
        changePatterns();
        ROTATED_PATTERNS = PATTERNS.map((base) => {
          const r0 = base;
          const r1 = rotateMatrix90(r0);
          const r2 = rotateMatrix90(r1);
          const r3 = rotateMatrix90(r2);
          return [r0, r1, r2, r3];
        });
      }, 6000);
      setInterval(() => {
        changePatterns("ice");
        ROTATED_PATTERNS = PATTERNS.map((base) => {
          const r0 = base;
          const r1 = rotateMatrix90(r0);
          const r2 = rotateMatrix90(r1);
          const r3 = rotateMatrix90(r2);
          return [r0, r1, r2, r3];
        });
        setTimeout(() => {
          changePatterns();
          ROTATED_PATTERNS = PATTERNS.map((base) => {
            const r0 = base;
            const r1 = rotateMatrix90(r0);
            const r2 = rotateMatrix90(r1);
            const r3 = rotateMatrix90(r2);
            return [r0, r1, r2, r3];
          });
        }, 6000);
      }, 60000);
    }
    if (collectedCount >= 1000 && !isSeamineEnabled && !disablespawn) {
      isSeamineEnabled = true;
      spawnJumpPad(entityHost, 3000);
      spawnSeamine(entityHost, casualMode);
      spawnSeamine(entityHost, casualMode);
      spawnSeamine(entityHost, casualMode);
      spawnGrindrail(entityHost);
      spawnGrindrail(entityHost);
      spawnGrindrail(entityHost);
    }
    if (pick.unstackable) {
      spawnedUnstackables.add(pick.name);
    }
  }
  return name;
}
export function activatePurgatory() {
  lastAltar = "Purgatory";
  let beforeCollectedCount = collectedCount;
  let beforeLastEntitySpawnAt = lastEntitySpawnAt;
  if (!disableCollect) actualCollectedCount += 1000;
  if (actualCollectedCount > 10000) actualCollectedCount = 10000;
  collectedCount = hardMode
    ? actualCollectedCount
    : Math.floor(actualCollectedCount / 2);
  if (latestCollectedCount >= (hardMode ? 11000 : 5500)) {
    counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount - 900}`;
    lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50)) - 9}`;
  } else if (latestCollectedCount >= (hardMode ? 10000 : 5000)) {
    counterEl.textContent = `Gift(s) Collected: ${-11000 + Math.floor(Math.random() * 22000)}`;
    lvlEl.textContent = `lvl 100`;
  } else {
    counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount}`;
    lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50))}`;
  }
  lastEntitySpawnAt = collectedCount;
  const totalSpawns = hardMode ? 10 : 5;
  let tempCount = 0;
  for (let i = 0; i < totalSpawns; i++) {
    if (beforeCollectedCount < beforeLastEntitySpawnAt) {
      tempCount++;
      beforeCollectedCount += 100;
    } else {
      break;
    }
  }
  for (let i = 0; i < totalSpawns; i++) {
    ENTITY_SPAWN(true);
    if (i < tempCount == false) ENTITY_SPAWN();
  }
}
let alreadyBenefitChanced = [false, false];
export function activateChance() {
  lastAltar = "Chance";
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
      collectedCount = hardMode
        ? actualCollectedCount
        : Math.floor(actualCollectedCount / 2);
      if (latestCollectedCount >= (hardMode ? 11000 : 5500)) {
        counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount - 900}`;
        lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50)) - 9}`;
      } else if (latestCollectedCount >= (hardMode ? 10000 : 5000)) {
        counterEl.textContent = `Gift(s) Collected: ${-11000 + Math.floor(Math.random() * 22000)}`;
        lvlEl.textContent = `lvl 100`;
      } else {
        counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount}`;
        lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50))}`;
      }
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
  lastAltar = "Protection";
  if (
    actualCollectedCount >= 1000 &&
    (shieldActive[0] === false || shieldActive[1] === false)
  ) {
    actualCollectedCount -= 1000;
    collectedCount = hardMode
      ? actualCollectedCount
      : Math.floor(actualCollectedCount / 2);
    if (latestCollectedCount >= (hardMode ? 11000 : 5500)) {
      counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount - 900}`;
      lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50)) - 9}`;
    } else if (latestCollectedCount >= (hardMode ? 10000 : 5000)) {
      counterEl.textContent = `Gift(s) Collected: ${-11000 + Math.floor(Math.random() * 22000)}`;
      lvlEl.textContent = `lvl 100`;
    } else {
      counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount}`;
      lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50))}`;
    }
    activateShield();
    return true;
  }
  return false;
}
export function activatePassage() {
  lastAltar = "Passage";
  passageGoldPattern += 10;
  changePatterns();
  ROTATED_PATTERNS = PATTERNS.map((base) => {
    const r0 = base;
    const r1 = rotateMatrix90(r0);
    const r2 = rotateMatrix90(r1);
    const r3 = rotateMatrix90(r2);
    return [r0, r1, r2, r3];
  });
}
export function activateEcho() {
  const beforeLastAltar = lastAltar;

  switch (beforeLastAltar) {
    case "Protection":
      activateProtection();
      break;
    case "Chance":
      activateChance();
      break;
    case "Purification":
      activatePurification();
      break;
    case "Passage":
      activatePassage();
      break;
    case "Purgatory":
      activatePurgatory();
      break;
    case "Echo":
      break;
  }

  lastAltar = "Echo";

  switch (beforeLastAltar) {
    case "Protection":
      return "Altar of Protection";
    case "Chance":
      return "Altar of Chance";
    case "Purification":
      return "Altar of Purification";
    case "Passage":
      return "Altar of Passage";
    case "Purgatory":
      return "Altar of Purgatory";
    case "Echo":
      return "Altar of Echo";
    default:
      return "Altar of Echo";
  }
}
export function activatePurification() {
  lastAltar = "Purification";

  if (highestEntitySpawned.length === 0) return false;
  const index = (Math.random() * highestEntitySpawned.length) | 0;
  const chosen = highestEntitySpawned[index];
  const replacedEntity = chosen.name;

  chosen.unregister();
  spawnedUnstackables.delete(chosen.name);

  highestEntitySpawned.splice(index, 1);

  const data = entityCounts.get(chosen.name);
  if (data) {
    data.count--;

    if (data.count <= 0) {
      entityCounts.delete(chosen.name);
    }
  }

  let total = 0;
  for (const d of entityCounts.values()) {
    total += d.count;
  }

  let tempTotal = 0;
  for (const d of tempEntityCounts.values()) {
    tempTotal += d.count;
  }

  const el = document.getElementById("entity-panel-count");

  el.textContent =
    tempTotal > 0
      ? `EntityCount: ${total} (+${tempTotal})`
      : `EntityCount: ${total}`;

  if (total >= 100) {
    el.textContent = "EntityCount: 100+";
  }

  renderPanel();
  const newEntity = ENTITY_SPAWN(false, chosen.name);
  return [replacedEntity, newEntity];
}

/* ===== PRECOMPUTE ROTATED PATTERNS ===== */
let ROTATED_PATTERNS = PATTERNS.map((base) => {
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

  // --- NEW EDGE SAFETY CHECK ---
  for (let ty = 0; ty < pattern.length; ty++) {
    for (let tx = 0; tx < pattern[ty].length; tx++) {
      const value = pattern[ty][tx];
      if (value === 0) continue;

      const worldX = sx * SUPER_TILE + tx;
      const worldY = sy * SUPER_TILE + ty;

      const isEdge =
        worldX === 0 ||
        worldY === 0 ||
        worldX === SUPER_W * SUPER_TILE - 1 ||
        worldY === SUPER_H * SUPER_TILE - 1;

      if (isEdge) return false;
    }
  }

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
        pattern[y][x] === 6 ||
        pattern[y][x] === 9 ||
        pattern[y][x] === 10 ||
        pattern[y][x] === 11 ||
        pattern[y][x] === 12 ||
        pattern[y][x] === 13 ||
        pattern[y][x] === 14 ||
        pattern[y][x] === 15 ||
        pattern[y][x] === 21 ||
        pattern[y][x] === 22 ||
        pattern[y][x] === 25 ||
        pattern[y][x] === 29
      ) {
        floorTiles.push({
          x: wx,
          y: wy,
          sx,
          sy,
          passageGoldPattern: passageGoldPattern > 0,
          diorite: pattern[y][x] === 10 || pattern[y][x] === 14,
          wood:
            pattern[y][x] === 11 ||
            pattern[y][x] === 12 ||
            pattern[y][x] === 15,
          garden: pattern[y][x] === 13,
          wall: pattern[y][x] === 6,
          ice:
            pattern[y][x] === 21 ||
            pattern[y][x] === 22 ||
            pattern[y][x] === 25 ||
            pattern[y][x] === 29,
          deco: [
            pattern[y][x] === 1 || pattern[y][x] === 13,
            Math.random() <
              Math.min(
                0.1,
                Math.max(0.01, Number(graphicsSlider.value) * 0.05),
              ) *
                (pattern[y][x] === 13 ? 5 : 1),
            Math.random(),
            Math.random(),
            Math.random() <
              Math.min(
                0.1,
                Math.max(0.01, Number(graphicsSlider.value) * 0.05),
              ),
          ],
        });
      }

      const isTripmineEnabled =
        !disableTripmine && !casualMode && collectedCount > 500;

      if (
        pattern[y][x] === 2 ||
        pattern[y][x] === 3 ||
        pattern[y][x] === 5 ||
        pattern[y][x] === 9 ||
        pattern[y][x] === 12 ||
        pattern[y][x] === 15 ||
        pattern[y][x] === 22 ||
        pattern[y][x] === 25 ||
        pattern[y][x] === 29
      ) {
        const r = Math.random();
        let type = "gift";
        if (passageGoldPattern > 0) {
          type = "gold";
        } else if (allGold) {
          type =
            !disableTripmine && !casualMode
              ? r < (tripmineHell ? 0.5 : 0.9)
                ? "gold"
                : "tripmine"
              : "gold";
        } else if (isTripmineEnabled) {
          if (
            r <
            (tripmineHell
              ? Math.min(
                  hardMode
                    ? 0.000125 * (collectedCount - 500)
                    : 0.00025 * (collectedCount - 500),
                  0.5, // 0-50%
                )
              : Math.min(
                  hardMode
                    ? 0.00005 * (collectedCount - 500)
                    : 0.0001 * (collectedCount - 500),
                  0.1, // 0-10%
                ))
          )
            type = "tripmine";
          else type = "gift"; // 100-90%
        } else {
          type = "gift"; // original
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

  const coords4or5 = [];
  for (let y = 0; y < pattern.length; y++) {
    for (let x = 0; x < pattern[0].length; x++) {
      const v = pattern[y][x];
      if (v === 4 || v === 5 || v === 14 || v === 15 || v === 25) {
        coords4or5.push({ x, y });
      }
    }
  }

  patternsState.set(`${sx},${sy}`, {
    sx,
    sy,
    pw: spw,
    ph: sph,
    giftsLeft: gifts,
    cleared: gifts === 0,
    pattern,
    has4or5: coords4or5.length > 0,
    coords4or5,
    passageGoldPattern: passageGoldPattern > 0,
  });
  if (passageGoldPattern > 0) passageGoldPattern--;
}

function destroyPattern(p) {
  if (!p) return;

  floorTiles = floorTiles.filter((t) => t.sx !== p.sx || t.sy !== p.sy);
  giftPositions = giftPositions.filter((g) => g.sx !== p.sx || g.sy !== p.sy);

  for (let y = 0; y < p.ph; y++)
    for (let x = 0; x < p.pw; x++) superOccupied[p.sy + y][p.sx + x] = false;

  patternsState.delete(`${p.sx},${p.sy}`);
}

let lastMouseX;
let lastMouseY;
setTimeout(() => {
  lastMouseX = mouse.x;
  lastMouseY = mouse.y;
}, 100);
let headingX = 1; // default direction (right)
let headingY = 0;

export function pickRandomPlaced4or5(minRadius = 0) {
  // --- Update heading ---
  const dxMove = mouse.x - lastMouseX;
  const dyMove = mouse.y - lastMouseY;
  const moveLen = Math.hypot(dxMove, dyMove);

  if (moveLen > 0.001) {
    headingX = dxMove / moveLen;
    headingY = dyMove / moveLen;
  }

  lastMouseX = mouse.x;
  lastMouseY = mouse.y;

  // --- Build candidate list ---
  const candidates = [];
  const maxRadius = minRadius + 1000;

  for (const p of patternsState.values()) {
    if (!p.pattern || !p.has4or5) continue;

    const center = patternCenter(p.sx, p.sy);
    const dx = center.x - mouse.x;
    const dy = center.y - mouse.y;
    const d2 = dx * dx + dy * dy;

    if (d2 < minRadius * minRadius || d2 > maxRadius * maxRadius) continue;

    // 180° forward check
    const dot = dx * headingX + dy * headingY;
    if (dot <= 0) continue;

    candidates.push(p);
  }

  let pool = candidates;

  // --- Fallback ---
  if (pool.length === 0) {
    for (const p of patternsState.values()) {
      if (!p.pattern || !p.has4or5) continue;
      pool.push(p);
    }

    if (pool.length === 0) {
      return { x: mouse.x, y: mouse.y };
    }
  }

  // --- Random pick ---
  const pickedPattern = pool[(Math.random() * pool.length) | 0];
  const coords = pickedPattern.coords4or5;
  const c = coords[(Math.random() * coords.length) | 0];

  const worldX = (pickedPattern.sx * SUPER_TILE + c.x) * TILE + TILE / 2;
  const worldY = (pickedPattern.sy * SUPER_TILE + c.y) * TILE + TILE / 2;

  return { x: worldX, y: worldY };
}

/* ===== DRAW ===== */
function drawGrid() {
  let cursorOnCorruptedTile = false;

  // Clear only visible area (viewport)
  const visibleX = -camX;
  const visibleY = -camY - 5;
  const visibleW = viewport.clientWidth;
  const visibleH = viewport.clientHeight + 10;
  ctx.clearRect(visibleX, visibleY, visibleW, visibleH);
  // entityCtx.clearRect(visibleX, visibleY, visibleW * 0.01, visibleH * 0.01);
  entityCanvas.width = entityCanvas.width;

  // Floors (existing culling is fine, but ensure RENDER_RADIUS isn't too large)
  const key = (x, y) => `${Math.round(x)},${Math.round(y)}`;
  const floorSet = new Set(floorTiles.map((t) => key(t.x, t.y)));
  for (const t of floorTiles) {
    if (
      t.x + TILE < visibleX ||
      t.x > visibleX + visibleW ||
      t.y + TILE < visibleY ||
      t.y > visibleY + visibleH
    )
      continue;

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
        const ddx = cx - f.x;
        const ddy = cy - f.y;
        if (ddx * ddx + ddy * ddy < (TILE * 3) ** 2) {
          corrupted = true;
          break;
        }
      }
    }

    const left = floorSet.has(key(t.x - TILE, t.y));
    const right = floorSet.has(key(t.x + TILE, t.y));
    const up = floorSet.has(key(t.x, t.y - TILE));
    const down = floorSet.has(key(t.x, t.y + TILE));
    const isEdge = !left || !right || !up || !down;
    if (!t.diorite && !t.wood && !t.ice && isEdge) {
      ctx.fillStyle = showFloor
        ? corrupted || t.passageGoldPattern || t.deco[4]
          ? "#800"
          : "#666"
        : "#6661";
      ctx.fillRect(t.x - TILE * 0.1, t.y - TILE * 0.1, TILE * 1.2, TILE * 1.2);
    }
    if (t.ice) {
      const h = TILE / 2;

      // top-left
      // ctx.fillStyle = showFloor ? "#77f" : "#77f1";
      // ctx.fillRect(t.x - h, t.y - h, h, h);
      ctx.fillStyle = showFloor ? "#77f" : "#77f1";
      ctx.fillRect(t.x + h, t.y - h, h, h);
      ctx.fillStyle = showFloor ? "#77f" : "#77f1";
      ctx.fillRect(t.x - h, t.y + h, h, h);
      ctx.fillStyle = showFloor ? "#77f" : "#77f1";
      ctx.fillRect(t.x + h, t.y + h, h, h);

      // top-right
      ctx.fillStyle = showFloor ? "#88f" : "#88f1";
      ctx.fillRect(t.x, t.y - h, h, h);
      // ctx.fillStyle = showFloor ? "#88f" : "#88f1";
      // ctx.fillRect(t.x + 2 * h, t.y - h, h, h);
      ctx.fillStyle = showFloor ? "#88f" : "#88f1";
      ctx.fillRect(t.x, t.y + h, h, h);
      ctx.fillStyle = showFloor ? "#88f" : "#88f1";
      ctx.fillRect(t.x + 2 * h, t.y + h, h, h);

      // bottom-left
      ctx.fillStyle = showFloor ? "#87f" : "#87f1";
      ctx.fillRect(t.x - h, t.y, h, h);
      ctx.fillStyle = showFloor ? "#87f" : "#87f1";
      ctx.fillRect(t.x + h, t.y, h, h);
      // ctx.fillStyle = showFloor ? "#87f" : "#87f1";
      // ctx.fillRect(t.x - h, t.y + 2 * h, h, h);
      ctx.fillStyle = showFloor ? "#87f" : "#87f1";
      ctx.fillRect(t.x + h, t.y + 2 * h, h, h);

      // bottom-right
      ctx.fillStyle = showFloor ? "#98f" : "#98f1";
      ctx.fillRect(t.x, t.y, h, h);
      ctx.fillStyle = showFloor ? "#98f" : "#98f1";
      ctx.fillRect(t.x + 2 * h, t.y, h, h);
      ctx.fillStyle = showFloor ? "#98f" : "#98f1";
      ctx.fillRect(t.x, t.y + 2 * h, h, h);
      // ctx.fillStyle = showFloor ? "#98f" : "#98f1";
      // ctx.fillRect(t.x + 2 * h, t.y + 2 * h, h, h);
    }
  }
  for (const t of floorTiles) {
    if (
      t.x + TILE < visibleX ||
      t.x > visibleX + visibleW ||
      t.y + TILE < visibleY ||
      t.y > visibleY + visibleH
    )
      continue;
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

    // cursor inside this tile and certain distance from flesh?
    if (corrupted) {
      const insideTile =
        mouse.x >= t.x &&
        mouse.x <= t.x + TILE &&
        mouse.y >= t.y &&
        mouse.y <= t.y + TILE;

      if (insideTile) {
        let nearFlesh = false;

        for (const f of fleshPositions) {
          if (!f.fromFlesh) continue;

          const dx = mouse.x - f.x;
          const dy = mouse.y - f.y;
          const radius = 1000;

          if (dx * dx + dy * dy <= radius * radius) {
            nearFlesh = true;
            break;
          }
        }

        if (nearFlesh || Math.random() < 0.1) {
          cursorOnCorruptedTile = true;
        }
      }
    }

    if (corrupted) {
      ctx.fillStyle = showFloor
        ? `rgba(${90 + Math.random() * 60}, 0, 0, 1)`
        : `rgba(120, 0, 0, 0.066)`;
      ctx.fillRect(t.x, t.y, TILE, TILE);
    } else {
      if (t.passageGoldPattern) {
        const h = TILE / 2;

        // top-left
        ctx.fillStyle = showFloor ? "#800" : "#8001";
        ctx.fillRect(t.x, t.y, h, h);

        // top-right
        ctx.fillStyle = showFloor ? "#600" : "#6001";
        ctx.fillRect(t.x + h, t.y, h, h);

        // bottom-left
        ctx.fillStyle = showFloor ? "#600" : "#6001";
        ctx.fillRect(t.x, t.y + h, h, h);

        // bottom-right
        ctx.fillStyle = showFloor ? "#800" : "#8001";
        ctx.fillRect(t.x + h, t.y + h, h, h);
      } else if (t.diorite) {
        const h = TILE / 2;

        // top-left
        ctx.fillStyle = showFloor ? "#778" : "#7781";
        ctx.fillRect(t.x, t.y, h, h);

        // top-right
        ctx.fillStyle = showFloor ? "#658" : "#6581";
        ctx.fillRect(t.x + h, t.y, h, h);

        // bottom-left
        ctx.fillStyle = showFloor ? "#557" : "#5571";
        ctx.fillRect(t.x, t.y + h, h, h);

        // bottom-right
        ctx.fillStyle = showFloor ? "#446" : "#4461";
        ctx.fillRect(t.x + h, t.y + h, h, h);
      } else if (t.wood) {
        const h = TILE / 2;

        // left
        ctx.fillStyle = showFloor ? "#844" : "#8441";
        ctx.fillRect(t.x, t.y, h, TILE);

        // right
        ctx.fillStyle = showFloor ? "#744" : "#7441";
        ctx.fillRect(t.x + h, t.y, h, TILE);
      } else if (t.garden) {
        ctx.fillStyle = showFloor ? "#800" : "#8001";
        ctx.fillRect(t.x, t.y, TILE, TILE);
      } else if (t.wall) {
        ctx.fillStyle = showFloor ? "#aaa" : "#aaa1";
        ctx.fillRect(t.x, t.y, TILE, TILE);
      } else if (t.ice) {
      } else {
        const h = TILE / 2;

        // top-left
        ctx.fillStyle = showFloor ? "#888" : "#8881";
        ctx.fillRect(t.x, t.y, h, h);

        // top-right
        ctx.fillStyle = showFloor ? "#222" : "#2221";
        ctx.fillRect(t.x + h, t.y, h, h);

        // bottom-left
        ctx.fillStyle = showFloor ? "#222" : "#2221";
        ctx.fillRect(t.x, t.y + h, h, h);

        // bottom-right
        ctx.fillStyle = showFloor ? "#888" : "#8881";
        ctx.fillRect(t.x + h, t.y + h, h, h);
      }
    }
  }
  for (const t of floorTiles) {
    if (
      t.x + TILE < visibleX ||
      t.x > visibleX + visibleW ||
      t.y + TILE < visibleY ||
      t.y > visibleY + visibleH
    )
      continue;

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
        const ddx = cx - f.x;
        const ddy = cy - f.y;
        if (ddx * ddx + ddy * ddy < (TILE * 3) ** 2) {
          corrupted = true;
          break;
        }
      }
    }

    if (
      !corrupted &&
      !t.diorite &&
      !t.wood &&
      t.deco[0] &&
      t.deco[1] &&
      showFloor
    ) {
      let variant = 1;
      if (t.deco[2] > 0.667) variant = 3;
      else if (t.deco[2] > 0.333) variant = 2;
      else variant = 1;

      const cx = t.x + TILE / 2;
      const cy = t.y + TILE / 2;
      const s = TILE * 0.5;

      const r = t.garden ? 0.7 : t.deco[3]; // stable random

      if (r < 0.2) {
        const drawVase = (ox, oy) => {
          ctx.fillStyle = "#886655";
          ctx.beginPath();
          ctx.ellipse(ox, oy - s * 0.3, s * 0.5, s * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#664433";
          ctx.beginPath();
          ctx.moveTo(ox - s * 0.5, oy - s * 0.3);
          ctx.lineTo(ox + s * 0.5, oy - s * 0.3);
          ctx.lineTo(ox + s * 0.25, oy + s * 0.5);
          ctx.lineTo(ox - s * 0.25, oy + s * 0.5);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#553322";
          ctx.beginPath();
          ctx.ellipse(ox, oy + s * 0.5, s * 0.25, s * 0.12, 0, 0, Math.PI * 2);
          ctx.fill();
        };

        if (variant === 1) {
          drawVase(cx, cy);
        } else if (variant === 2) {
          drawVase(cx - TILE * 0.15, cy + TILE * 0.08);
          drawVase(cx + TILE * 0.15, cy - TILE * 0.08);
        } else {
          drawVase(cx, cy - TILE * 0.12);
          drawVase(cx - TILE * 0.22, cy + TILE * 0.12);
          drawVase(cx + TILE * 0.22, cy + TILE * 0.06);
        }
      } else if (r < 0.4) {
        const drawBox = (ox, oy) => {
          const size = s;

          ctx.fillStyle = "#775533";
          ctx.fillRect(ox - size / 2, oy - size / 2, size, size);

          ctx.strokeStyle = "#442200";
          ctx.lineWidth = 2;
          ctx.strokeRect(ox - size / 2, oy - size / 2, size, size);

          ctx.beginPath();
          ctx.moveTo(ox - size / 2, oy - size / 2);
          ctx.lineTo(ox + size / 2, oy + size / 2);
          ctx.moveTo(ox + size / 2, oy - size / 2);
          ctx.lineTo(ox - size / 2, oy + size / 2);
          ctx.stroke();
        };

        if (variant === 1) {
          drawBox(cx, cy);
        } else if (variant === 2) {
          drawBox(cx - TILE * 0.17, cy + TILE * 0.09);
          drawBox(cx + TILE * 0.17, cy - TILE * 0.09);
        } else {
          drawBox(cx, cy - TILE * 0.14);
          drawBox(cx - TILE * 0.21, cy + TILE * 0.14);
          drawBox(cx + TILE * 0.21, cy + TILE * 0.07);
        }
      } else if (r < 0.6) {
        const drawPillar = (cx, cy, w, h, d) => {
          ctx.fillStyle = "#aaa";
          ctx.beginPath();
          ctx.moveTo(cx, cy - h); // top peak
          ctx.lineTo(cx + w, cy - h + d);
          ctx.lineTo(cx, cy - h + d * 2);
          ctx.lineTo(cx - w, cy - h + d);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#666";
          ctx.beginPath();
          ctx.moveTo(cx - w, cy - h + d);
          ctx.lineTo(cx, cy - h + d * 2);
          ctx.lineTo(cx, cy + d * 2);
          ctx.lineTo(cx - w, cy + d);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#555";
          ctx.beginPath();
          ctx.moveTo(cx + w, cy - h + d);
          ctx.lineTo(cx, cy - h + d * 2);
          ctx.lineTo(cx, cy + d * 2);
          ctx.lineTo(cx + w, cy + d);
          ctx.closePath();
          ctx.fill();
        };

        drawPillar(cx, cy - TILE * 0.1, TILE * 0.4, TILE * 0.25, TILE * 0.2);
        drawPillar(cx, cy - TILE * 0.25, TILE * 0.2, TILE * 1.7, TILE * 0.1);
        drawPillar(cx, cy - TILE * 2.1, TILE * 0.4, TILE * 0.25, TILE * 0.2);
      } else if (r < 0.8) {
        ctx.fillStyle = "#4a2b1a";
        ctx.fillRect(cx - TILE * 0.1, cy - TILE * 0.45, TILE * 0.2, TILE * 0.5);

        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy + TILE * 0.1,
          TILE * 0.4,
          TILE * 0.2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        const drawLeaves = (topY, w, y) => {
          ctx.fillStyle = "#6a0f2a";
          ctx.beginPath();
          ctx.moveTo(cx, topY);
          ctx.lineTo(cx - w, cy - y);
          ctx.lineTo(cx, cy - y);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#8a2f4a";
          ctx.beginPath();
          ctx.moveTo(cx, topY);
          ctx.lineTo(cx + w, cy - y);
          ctx.lineTo(cx, cy - y);
          ctx.closePath();
          ctx.fill();
        };
        drawLeaves(cy - TILE * 1, TILE * 0.4, TILE * 0.35);
        drawLeaves(cy - TILE * 1.2, TILE * 0.35, TILE * 0.6);
        drawLeaves(cy - TILE * 1.4, TILE * 0.3, TILE * 0.85);
      } else if (r < 0.9) {
        const r = TILE * 0.2;

        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 1.2, r * 1.8, r * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#6a0f2a";

        ctx.beginPath();
        ctx.arc(cx - r * 1.2, cy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx + r * 1.2, cy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.6, r * 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#7a1f3a";

        ctx.beginPath();
        ctx.arc(cx - r * 0.8, cy + r * 0.4, r * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx + r * 0.8, cy + r * 0.4, r * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#6a0f2a";

        ctx.beginPath();
        ctx.arc(cx - r * 0.6, cy - r * 0.6, r * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx + r * 0.7, cy - r * 0.5, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#774433";
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.4, cy + s * 0.2);
        ctx.lineTo(cx + s * 0.4, cy + s * 0.2);
        ctx.lineTo(cx + s * 0.25, cy + s * 0.6);
        ctx.lineTo(cx - s * 0.25, cy + s * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#332211";
        ctx.beginPath();
        ctx.ellipse(cx, cy + s * 0.2, s * 0.35, s * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#5a5";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy + s * 0.2);
        ctx.lineTo(cx, cy - s * 0.2);
        ctx.stroke();

        ctx.fillStyle = "#f55";
        ctx.beginPath();
        ctx.arc(cx, cy - s * 0.3, s * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#faa";
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          ctx.beginPath();
          ctx.arc(
            cx + Math.cos(angle) * s * 0.2,
            cy - s * 0.3 + Math.sin(angle) * s * 0.2,
            s * 0.08,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
    }
  }
  if (cursorOnCorruptedTile && !slowness && !slownessCooldown) {
    slownessTime = 0;
    slowness = true;
  }
  slownessTime++;
  if (slownessTime >= 90 && slowness) {
    slowness = false;
    slownessCooldown = true;
    setTimeout(() => {
      slownessCooldown = false;
    }, 2000);
  }

  // gifts (center inside the tile)
  if (gift.complete) {
    for (const g of giftPositions) {
      if (
        g.x + TILE < visibleX ||
        g.x > visibleX + visibleW ||
        g.y + TILE < visibleY ||
        g.y > visibleY + visibleH
      )
        continue;
      const dx = g.x + TILE / 2 - mouse.x;
      const dy = g.y + TILE / 2 - mouse.y;
      if (dx * dx + dy * dy > RENDER_RADIUS * RENDER_RADIUS) continue;

      const img = g.golden ? goldGift : g.type === "tripmine" ? tripmine : gift;

      if (g.type === "tripmine") {
        const centerX = g.x + GIFT_SIZE / 2;
        const centerY = g.y + GIFT_SIZE / 2;

        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          TILE * 1.5,
        );

        gradient.addColorStop(0, "rgba(255, 0, 255, 0.5)"); // strong purple center
        gradient.addColorStop(1, "rgba(255, 0, 255, 0)"); // fully transparent edge

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, TILE * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
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

  if (lastTouchedIce && performance.now() - lastTouchedIce > 1000) {
    lastTouchedIce = null;
    iceEffect = false;
  }

  const motionScale = reducedMotion ? 0.5 : 1;
  const slowScale = slowness ? 0.25 : 1;
  const settingScale = settingsPanel.style.display === "block" ? 0.1 : 1;
  const disableCollectScale = disableCollect ? 0.01 : 1;
  isCursorOnFloor();
  if (iceEffect) {
    camVX +=
      vx *
      motionScale *
      slowScale *
      settingScale *
      voidScale *
      seamineScale *
      grindrailScale *
      wallScale *
      disableCollectScale *
      0.1;
    camVY +=
      vy *
      motionScale *
      slowScale *
      settingScale *
      voidScale *
      seamineScale *
      grindrailScale *
      wallScale *
      disableCollectScale *
      0.1;
  } else {
    camX +=
      vx *
      motionScale *
      slowScale *
      settingScale *
      voidScale *
      seamineScale *
      grindrailScale *
      wallScale *
      disableCollectScale;
    camY +=
      vy *
      motionScale *
      slowScale *
      settingScale *
      voidScale *
      seamineScale *
      grindrailScale *
      wallScale *
      disableCollectScale;
  }

  const lim = getLimits();
  camX = Math.max(lim.minX, Math.min(lim.maxX, camX));
  camY = Math.max(lim.minY, Math.min(lim.maxY, camY));
  if (drunkCamera) {
    const t = performance.now() * 0.002;
    camX += Math.sin(t * 1.3) * 2;
    camY += Math.cos(t * 1.7) * 2;
  }
  // canvas.style.transform = `translate(${camX}px, ${camY}px)`;
  // entityCanvas.style.transform = `translate(${camX}px, ${camY}px)`;
  // entityCanvas2.style.transform = `translate(${camX}px, ${camY}px)`;
  canvas.style.left = `${camX}px`;
  canvas.style.top = `${camY}px`;
  // entityCanvas.style.left = `${-camX}px`;
  // entityCanvas.style.top = `${-camY}px`;
  // entityCanvas2.style.left = `${-camX}px`;
  // entityCanvas2.style.top = `${-camY}px`;
  if (SHAKE) {
    canvas.style.rotate = `${-0.05 + Math.random() * 0.1}deg`;
    entityCanvas.style.rotate = `${-0.05 + Math.random() * 0.1}deg`;
    entityCanvas2.style.rotate = `${-0.05 + Math.random() * 0.1}deg`;
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
        fromFlesh: false,
      });

      lastCursorInfectAt = now;
    }
  }

  /* collect gifts */
  for (let i = giftPositions.length - 1; i >= 0; i--) {
    const g = giftPositions[i];
    if (!g || !mouse) return;
    const dx = g.x + TILE / 2 - mouse.x;
    const dy = g.y + TILE / 2 - mouse.y;

    const radius = g.type === "tripmine" ? GIFT_SIZE * 0.25 : dynamicHitRadius;

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

      const value = (g.golden ? 4 : 1) * giftMultiplier;
      if (!disableCollect) actualCollectedCount += value;
      collectedCount = hardMode
        ? actualCollectedCount
        : Math.floor(actualCollectedCount / 2);
      if (latestCollectedCount >= (hardMode ? 11000 : 5500)) {
        counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount - 900}`;
        lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50)) - 9}`;
      } else if (latestCollectedCount >= (hardMode ? 10000 : 5000)) {
        counterEl.textContent = `Gift(s) Collected: ${-11000 + Math.floor(Math.random() * 22000)}`;
        lvlEl.textContent = `lvl 100`;
      } else {
        counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount}`;
        lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50))}`;
      }

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
          spawnVoid(entityHost, enableVoid);
          spawnJumpPad(entityHost, 2000);
          if (Math.random() < 0.01) spawnGlitch(entityHost);
          if (Math.random() < 0.01) {
            const pool = ENTITY_POOL.filter((e) => e.name !== "Random");
            const pick = pool[(Math.random() * pool.length) | 0];

            let spawned = 0;

            const interval = setInterval(() => {
              if (spawned >= 50) {
                clearInterval(interval);
                return;
              }

              pick.spawn();
              registerEntitySpawn(pick.name, pick.src);
              spawned++;
            }, 200);
          }
        }
        if (collectedCount >= (hardMode ? 600 : 300) && !spawnedAltar[0]) {
          spawnedAltar[0] = true;
          spawnAltarProtection(entityHost, hardMode);
          spawnAltarChance(entityHost, hardMode);
        }
        if (collectedCount >= (hardMode ? 1200 : 600) && !spawnedAltar[1]) {
          spawnedAltar[1] = true;
          spawnAltarPurgatory(entityHost, hardMode);
          spawnAltarPassage(entityHost, hardMode);
        }
        if (collectedCount >= (hardMode ? 1600 : 800) && !spawnedAltar[2]) {
          spawnedAltar[2] = true;
          spawnAltarEcho(entityHost, hardMode);
        }
        if (collectedCount >= (hardMode ? 2000 : 1000) && !spawnedAltar[3]) {
          spawnedAltar[3] = true;
          spawnAltarPurification(entityHost, hardMode);
        }

        if (
          unlocked.length > 0 &&
          (!disablespawn ||
            (collectedCount >= (hardMode ? 11000 : 5500) &&
              collectedCount <= (hardMode ? 11199 : 5599))) &&
          (spawnedCatalyst ? collectedCount >= (hardMode ? 11000 : 5500) : true)
        ) {
          let pick;
          if (
            collectedCount >= (hardMode ? 10000 : 5000) &&
            !spawnedCatalyst &&
            !disablespawn
          ) {
            spawnedCatalyst = true;
            spawnCatalystIntro();
            pick = {
              name: "Catalyst",
              spawn: () => spawnCatalyst(entityHost),
              start: 5000,
              src: "./ASSET/Enemies/CatalystIcon.png",
              desc: "למה לבזבז את כל הזמן הזה באור? תהיה איתי בחושך.",
            };
          } else if (
            collectedCount >= (hardMode ? 11000 : 5500) &&
            !spawnedBeacon &&
            !disableProgression
          ) {
            spawnedBeacon = true;
            pick = {
              name: "Beacon",
              spawn: () => spawnBeacon(entityHost, deafMode),
              start: 5500,
            };
          } else {
            const weighted = [];
            for (const e of unlocked) {
              const weight = pickedOnce.has(e.name) ? 1 : 3;
              for (let i = 0; i < weight; i++) weighted.push(e);
            }
            while (true) {
              pick = weighted[(Math.random() * weighted.length) | 0];
              if (lastEntityPicked !== pick.name) {
                if (pick.rare) {
                  if (Math.random() < 0.25) {
                    continue;
                  }
                }
                if (!enablePonderer && pick.name === "Ponderer") continue;
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
              if (!enablePonderer && e.name === "Ponderer") return false;
              if (collectedCount < e.start) return false;
              if (e.unstackable) return false;
              return true;
            });
            if (randUnlocked.length !== 0) {
              let randPick =
                randUnlocked[(Math.random() * randUnlocked.length) | 0];
              const unregister = randPick.spawn();
              trackHighestEntity(unregister, pick.start, pick.name);
            }
          } else if (pick.name === "Catalyst") {
            const unregister = pick.spawn();
            trackHighestEntity(unregister, pick.start, pick.name);
          } else {
            const unregister = pick.spawn();
            trackHighestEntity(unregister, pick.start, pick.name);
          }
          if (pick.src) registerEntitySpawn(pick.name, pick.src);
          if (collectedCount >= 800 && !isIceTileEnabled) {
            isIceTileEnabled = true;
            changePatterns("ice");
            ROTATED_PATTERNS = PATTERNS.map((base) => {
              const r0 = base;
              const r1 = rotateMatrix90(r0);
              const r2 = rotateMatrix90(r1);
              const r3 = rotateMatrix90(r2);
              return [r0, r1, r2, r3];
            });
            setTimeout(() => {
              changePatterns();
              ROTATED_PATTERNS = PATTERNS.map((base) => {
                const r0 = base;
                const r1 = rotateMatrix90(r0);
                const r2 = rotateMatrix90(r1);
                const r3 = rotateMatrix90(r2);
                return [r0, r1, r2, r3];
              });
            }, 6000);
            setInterval(() => {
              changePatterns("ice");
              ROTATED_PATTERNS = PATTERNS.map((base) => {
                const r0 = base;
                const r1 = rotateMatrix90(r0);
                const r2 = rotateMatrix90(r1);
                const r3 = rotateMatrix90(r2);
                return [r0, r1, r2, r3];
              });
              setTimeout(() => {
                changePatterns();
                ROTATED_PATTERNS = PATTERNS.map((base) => {
                  const r0 = base;
                  const r1 = rotateMatrix90(r0);
                  const r2 = rotateMatrix90(r1);
                  const r3 = rotateMatrix90(r2);
                  return [r0, r1, r2, r3];
                });
              }, 6000);
            }, 60000);
          }
          if (collectedCount >= 1000 && !isSeamineEnabled && !disablespawn) {
            isSeamineEnabled = true;
            spawnJumpPad(entityHost, 3000);
            spawnSeamine(entityHost, casualMode);
            spawnSeamine(entityHost, casualMode);
            spawnSeamine(entityHost, casualMode);
            spawnGrindrail(entityHost);
            spawnGrindrail(entityHost);
            spawnGrindrail(entityHost);
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
  if (actualCollectedCount >= 100 && settingsEnabled) {
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

  // Clean expired zones
  for (let i = cleanseZones.length - 1; i >= 0; i--) {
    if (cleanseZones[i].expiresAt <= now) {
      cleanseZones.splice(i, 1);
    }
  }

  // Throttle regeneration
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
  // const FRAME_TIME = 1;
  const FRAME_TIME = 33.333;
  if (now - loop.lastTime < FRAME_TIME) {
    requestAnimationFrame(loop);
    return;
  }

  loop.lastTime = now;

  entityCanvas.width = window.innerWidth;
  entityCanvas.height = window.innerHeight;
  entityCanvas2.width = window.innerWidth;
  entityCanvas2.height = window.innerHeight;

  updateCamera();
  updateMouseWorld(canvas, camX, camY);
  drawGrid();

  if (collectedCount > latestCollectedCount)
    latestCollectedCount = collectedCount;

  if (collectedCount < latestCollectedCount && !debtAltar) {
    debtAltar = spawnAltarPurgatory(entityHost, hardMode);
  } else if (collectedCount >= latestCollectedCount && debtAltar) {
    debtAltar();
    debtAltar = null;
  }

  // music
  if (!lobbyMusic) {
    let rand = Math.random();
    lobbyMusic = playSound(
      rand < 0.333
        ? "./ASSET/Sound/Music/Voidbound.mp3"
        : rand < 0.667
          ? "./ASSET/Sound/Music/Your_New_Prision.mp3"
          : "./ASSET/Sound/Music/Nullscape.ogg",
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
    actualCollectedCount > currentMusic.end
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
  if (
    Number.isFinite(mouse.x) &&
    Number.isFinite(mouse.y) &&
    Number.isFinite(dynamicHitRadius)
  ) {
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
  }

  if (shieldBroken[0] || shieldBroken[1]) {
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
  } else if (shieldActive[0] || shieldActive[1]) {
    const shieldg = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      0,
      mouse.x,
      mouse.y,
      TILE,
    );
    shieldg.addColorStop(0, "rgba(0, 0, 255, 0)");
    if (shieldActive[1]) {
      shieldg.addColorStop(1, `rgba(255, 0, 255, 1)`);
    } else if (shieldActive[0]) {
      shieldg.addColorStop(1, `rgba(0, 0, 255, 1)`);
    }
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, TILE - GIFT_SIZE / 2, 0, Math.PI * 2);
    ctx.fillStyle = shieldg;
    ctx.fill();
  }

  // camera smoothing
  camX += camVX;
  camY += camVY;
  camVX *= iceEffect ? 0.96 : 0.88;
  camVY *= iceEffect ? 0.96 : 0.88;

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
  entityCtx.setTransform(1, 0, 0, 1, 0, 0);
  entityCtx2.setTransform(1, 0, 0, 1, 0, 0);
  entityCtx.translate(0.5 * camX, 0.5 * camY);
  entityCtx2.translate(0.5 * camX, 0.5 * camY);
  // entityCtx.fillStyle = "red";
  // entityCtx.fillRect(0, 0, 100, 100);
  entityHost.draw();

  // slowness
  if (slowness || sorrowActive) {
    ctx.save();
    // ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(255, 0, 0, ${slowness ? 0.18 : 0.09})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  seamineScale += 0.025;
  if (seamineScale > 1) seamineScale = 1;
  grindrailScale -= 0.017;
  if (grindrailScale < 1) grindrailScale = 1;
  wallScale += 0.017;
  if (wallScale > 1) wallScale = 1;
  for (const f of [...fleshPositions]) {
    if (f.until <= now) fleshPositions.delete(f);
  }

  //holy beacon
  if (collectedCount >= (hardMode ? 11000 : 5500) && !transformAllGift) {
    transformAllGift = true;
    allGold = true;
    giftPositions.forEach((gift) => {
      if (gift.type === "gift") {
        gift.golden = true;
      }
    });
  }

  const cam = getCameraPos();
  const screenX = cam.x;
  const screenY = cam.y;
  const w = window.innerWidth;
  const h = window.innerHeight;

  //deathglow
  if (deathOpacity > 0) {
    const border = 150;
    ctx.save();
    deathOpacity -= 0.033;
    if (deathOpacity < 0) deathOpacity = 0;
    ctx.globalAlpha = deathOpacity;
    const color = "255,0,0";

    let grad = ctx.createLinearGradient(0, screenY, 0, screenY + border);
    grad.addColorStop(0, `rgba(${color},1)`);
    grad.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(screenX, screenY, w, border);

    grad = ctx.createLinearGradient(0, screenY + h - border, 0, screenY + h);
    grad.addColorStop(0, `rgba(${color},0)`);
    grad.addColorStop(1, `rgba(${color},1)`);
    ctx.fillStyle = grad;
    ctx.fillRect(screenX, screenY + h - border, w, border);

    grad = ctx.createLinearGradient(screenX, 0, screenX + border, 0);
    grad.addColorStop(0, `rgba(${color},1)`);
    grad.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(screenX, screenY, border, h);

    grad = ctx.createLinearGradient(screenX + w - border, 0, screenX + w, 0);
    grad.addColorStop(0, `rgba(${color},0)`);
    grad.addColorStop(1, `rgba(${color},1)`);
    ctx.fillStyle = grad;
    ctx.fillRect(screenX + w - border, screenY, border, h);

    ctx.restore();
  }

  //cheat
  const zoom = window.outerWidth / window.document.documentElement.clientWidth;
  if ((zoom > 1.25 || zoom < 0.75) && cheatDetector) disableProgression = true;
  document.getElementById("spawn-input").style.display === "block"
    ? (document.getElementById("spawn-input-text").style.display = "block")
    : (document.getElementById("spawn-input-text").style.display = "none");
  document.getElementById("spawn-input-commands").style.opacity -= 0.003;
  if (disableProgression) {
    if (!firstDisableProgression) {
      cheattimer = 300;
      firstDisableProgression = true;
    }
    ctx.save();
    if (cheattimer > 0) {
      cheattimer--;

      const boxHeight = 100;

      const boxX = cam.x + w * 0.25;
      const boxY = cam.y + h - boxHeight * 1.5;

      ctx.globalAlpha = cheattimer / 300;

      ctx.fillStyle = "#0a3cff80";
      ctx.fillRect(boxX, boxY, w * 0.5, boxHeight);
      ctx.strokeStyle = "#0a3cff";
      ctx.strokeRect(boxX, boxY, w * 0.5, boxHeight);

      ctx.strokeStyle = "#0a3cff";
      ctx.lineWidth = 2;

      ctx.font = "30px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f00";
      ctx.strokeText("Cheater...", boxX + w * 0.25, boxY + boxHeight / 2 - 15);
      ctx.fillText("Cheater...", boxX + w * 0.25, boxY + boxHeight / 2 - 15);

      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.strokeText(
        "Run will not be submitted and beacon will not appear.",
        boxX + w * 0.25,
        boxY + boxHeight / 2 + 20,
      );
      ctx.fillText(
        "Run will not be submitted and beacon will not appear.",
        boxX + w * 0.25,
        boxY + boxHeight / 2 + 20,
      );
    }

    ctx.restore();
  }

  requestAnimationFrame(loop);
}
// center camera
camX = (viewport.clientWidth - canvas.offsetWidth) / 2;
camY = (viewport.clientHeight - canvas.offsetHeight) / 2;

let windowClicked = false;
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
if (isMobile) {
  document.getElementById("intro-screen").style.display = "none";
  document.getElementById("mobile-screen").style.display = "flex";
}
const unlock = () => {
  if (isMobile) return;
  document.getElementById("intro-screen").style.display = "none";
  if (!panelOpen) {
    panelOpen = !panelOpen;
    panel.classList.toggle("open", panelOpen);
  }
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
  if (windowClicked) return;
  windowClicked = true;
  loop();
};
window.addEventListener("click", unlock);
document.getElementById("intro-screen").addEventListener("click", unlock);

setInterval(() => {
  for (const [key, p] of patternsState) {
    if (p.passageGoldPattern) {
      destroyPattern(p);
      patternsState.delete(key);
      break;
    }
  }
  const first = patternsState.entries().next();
  if (!first.done) {
    const [key, p] = first.value;
    destroyPattern(p);
    patternsState.delete(key);
  }
}, 6000);

let originalVolume = [0, 0];
export function onFinalContact() {
  beaconed = true;
  canvas.style.cursor = "none";
  entityCanvas.style.cursor = "none";
  entityCanvas2.style.cursor = "none";
  playSound(
    "./ASSET/Sound/Enemies/Catalyst/ending_1.mp3",
    1.724,
    undefined,
    undefined,
    undefined,
    "50",
  );
  disableCollect = true;
  setTimeout(() => {
    originalVolume = [musicVolume, sfxVolume];
    changePatterns("normal");
    ROTATED_PATTERNS = PATTERNS.map((base) => {
      const r0 = base;
      const r1 = rotateMatrix90(r0);
      const r2 = rotateMatrix90(r1);
      const r3 = rotateMatrix90(r2);
      return [r0, r1, r2, r3];
    });
    stopAllSounds();
    musicVolume = 0;
    sfxVolume = 0;
    localStorage.setItem("GameBeaten", `${new Date()}`);
    if (!disableProgression) {
      setStars();
      if (casualMode) {
        localStorage.setItem("win-casual", `${new Date()}`);
      } else if (hardMode) {
        localStorage.removeItem("win-casual");
        localStorage.removeItem("win-normal");
        localStorage.setItem("win-hard", `${new Date()}`);
      } else {
        localStorage.removeItem("win-casual");
        localStorage.setItem("win-normal", `${new Date()}`);
      }
    }
    SHAKE = false;
    setTimeout(() => {
      despawnCatalyst = true;
      sfxVolume = originalVolume[1];
      playSound(
        "./ASSET/Sound/Enemies/ending_2.mp3",
        0.626,
        undefined,
        undefined,
        undefined,
        "50",
      );
      sfxVolume = 0;
    }, 1400);
    setTimeout(() => {
      soundStopped = false;
      for (const [key, p] of patternsState) {
        destroyPattern(p);
        patternsState.delete(key);
      }
      musicVolume = originalVolume[0];
      sfxVolume = originalVolume[1];
      allGold = false;
      if (accurateCursor) {
        canvas.style.cursor = "none";
        entityCanvas.style.cursor = "none";
        entityCanvas2.style.cursor = "none";
      } else {
        canvas.style.cursor = "auto";
        entityCanvas.style.cursor = "auto";
        entityCanvas2.style.cursor = "auto";
      }
      document.body.classList.add("player-dead");
      setTimeout(() => {
        document.body.classList.add("fade-out");
        setTimeout(() => {
          document.body.classList.remove("player-dead", "fade-out");
          disableCollect = false;
          toggleImmortality(false);
        }, 500);
      }, 6667);
    }, 33833);
  }, 2000);
}
export function setStars() {
  if (disableProgression) return;
  const level = Math.floor(latestCollectedCount / (hardMode ? 100 : 50));

  if (!casualMode) {
    const highest = localStorage.getItem("highest-level-reached")
      ? parseInt(
          localStorage.getItem("highest-level-reached").split(" ")[0],
          10,
        )
      : 0;
    if (actualCollectedCount > highest)
      localStorage.setItem(
        "highest-level-reached",
        `${actualCollectedCount} ${level}`,
      );
  }

  if (casualMode) {
    if (level >= 50) {
      localStorage.removeItem("lv5-casual");
      localStorage.removeItem("lv12-casual");
      localStorage.removeItem("lv25-casual");
      localStorage.setItem("lv50-casual", `${new Date()}`);
    } else if (level >= 25) {
      localStorage.removeItem("lv5-casual");
      localStorage.removeItem("lv12-casual");
      localStorage.setItem("lv25-casual", `${new Date()}`);
    } else if (level >= 12) {
      localStorage.removeItem("lv5-casual");
      localStorage.setItem("lv12-casual", `${new Date()}`);
    } else if (level >= 5) {
      localStorage.setItem("lv5-casual", `${new Date()}`);
    }
  } else if (hardMode) {
    if (level >= 50) {
      localStorage.removeItem("lv5-casual");
      localStorage.removeItem("lv12-casual");
      localStorage.removeItem("lv25-casual");
      localStorage.removeItem("lv50-casual");

      localStorage.removeItem("lv5-normal");
      localStorage.removeItem("lv12-normal");
      localStorage.removeItem("lv25-normal");
      localStorage.removeItem("lv50-normal");

      localStorage.removeItem("lv5-hard");
      localStorage.removeItem("lv12-hard");
      localStorage.removeItem("lv25-hard");
      localStorage.setItem("lv50-hard", `${new Date()}`);
    } else if (level >= 25) {
      localStorage.removeItem("lv5-casual");
      localStorage.removeItem("lv12-casual");
      localStorage.removeItem("lv25-casual");

      localStorage.removeItem("lv5-normal");
      localStorage.removeItem("lv12-normal");
      localStorage.removeItem("lv25-normal");

      localStorage.removeItem("lv5-hard");
      localStorage.removeItem("lv12-hard");
      localStorage.setItem("lv25-hard", `${new Date()}`);
    } else if (level >= 12) {
      localStorage.removeItem("lv5-casual");
      localStorage.removeItem("lv12-casual");

      localStorage.removeItem("lv5-normal");
      localStorage.removeItem("lv12-normal");

      localStorage.removeItem("lv5-hard");
      localStorage.setItem("lv12-hard", `${new Date()}`);
    } else if (level >= 5) {
      localStorage.removeItem("lv5-casual");

      localStorage.removeItem("lv5-normal");

      localStorage.setItem("lv5-hard", `${new Date()}`);
    }
  } else {
    if (level >= 50) {
      localStorage.removeItem("lv5-casual");
      localStorage.removeItem("lv12-casual");
      localStorage.removeItem("lv25-casual");
      localStorage.removeItem("lv50-casual");

      localStorage.removeItem("lv5-normal");
      localStorage.removeItem("lv12-normal");
      localStorage.removeItem("lv25-normal");
      localStorage.setItem("lv50-normal", `${new Date()}`);
    } else if (level >= 25) {
      localStorage.removeItem("lv5-casual");
      localStorage.removeItem("lv12-casual");
      localStorage.removeItem("lv25-casual");

      localStorage.removeItem("lv5-normal");
      localStorage.removeItem("lv12-normal");
      localStorage.setItem("lv25-normal", `${new Date()}`);
    } else if (level >= 12) {
      localStorage.removeItem("lv5-casual");
      localStorage.removeItem("lv12-casual");

      localStorage.removeItem("lv5-normal");
      localStorage.setItem("lv12-normal", `${new Date()}`);
    } else if (level >= 5) {
      localStorage.removeItem("lv5-casual");

      localStorage.setItem("lv5-normal", `${new Date()}`);
    }
  }
}
