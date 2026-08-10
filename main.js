import { getAsset, preloadAssets, cancelPreloadAssets } from "./assets.js";
const introScreen = document.getElementById("intro-screen");
const skipLoading = document.getElementById("skip-loading");
let introClicks = 0;
introScreen.addEventListener("click", () => {
  introClicks++;
  if (introClicks == 2) {
    skipLoading.style.display = "block";
  }
});
skipLoading.addEventListener("click", (e) => {
  e.stopPropagation();
  cancelPreloadAssets();
  skipLoading.style.display = "none";
});
await preloadAssets((loaded, total) => {
  const progress = loaded / total;
  const displayed = Math.floor(total * (1 - (1 - progress) ** 2));
  document.getElementById("intro-start").innerHTML =
    `Loading... (${displayed}/${total})`;
  if (progress >= 0.9) {
    skipLoading.style.display = "none";
  }
});
window.addEventListener("error", (e) => {
  document.getElementById("error-log").innerHTML =
    `${e.message}<br>${e.filename}:${e.lineno}:${e.colno}`;
});

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
  dies,
  shieldLostMsg,
} from "./entityHost.js";
import { setup as spawnAltarPurgatory } from "./Enemies/AltarOfPurgatory.js";
import { setup as spawnAltarChaos } from "./Enemies/AltarOfChaos.js";
import { setup as spawnAltarChance } from "./Enemies/AltarOfChance.js";
import { setup as spawnAltarProtection } from "./Enemies/AltarOfProtection.js";
import { setup as spawnAltarPurification } from "./Enemies/AltarOfPurification.js";
import { setup as spawnAltarEcho } from "./Enemies/AltarOfEcho.js";
import { setup as spawnAltarPassage } from "./Enemies/AltarOfPassage.js";
import { setup as spawnJumpPad } from "./Enemies/JumpPad.js";
import { setup as spawnTriaOrb } from "./Enemies/TriaOrb.js";
import { dontTouchMeActive, setup as spawnBell } from "./Enemies/Bell.js";
import {
  fasterMart,
  martSlideActive,
  setup as spawnMart,
} from "./Enemies/Mart.js";
import { rebirthActive, setup as spawnBaby } from "./Enemies/Baby.js";
import { nuclearBombActive, setup as spawnICBM } from "./Enemies/ICBM.js";
import { legionActive, setup as spawnHusk } from "./Enemies/Husk.js";
import {
  fasterSpringer,
  fastSpringerActive,
  setup as spawnSpringer,
} from "./Enemies/Springer.js";
import { setup as spawnVoidboundBaby } from "./Enemies/VoidboundBaby.js";
import { setup as spawnFlesh } from "./Enemies/Flesh.js";
import { redactedActive, setup as spawnNIL } from "./Enemies/NIL.js";
import {
  shotgunGuardianActive,
  setup as spawnGuardian,
} from "./Enemies/Guardian.js";
import {
  malfunctionActive,
  setup as spawnOperator,
} from "./Enemies/Operator.js";
import {
  mutedActive,
  setup as spawnTelefragger,
} from "./Enemies/Telefragger.js";
import { setup as spawnSeamine } from "./Enemies/Seamine.js";
import { setup as spawnRealityCollapse } from "./Enemies/RealityCollapse.js";
import { setup as spawnGrindrail } from "./Enemies/Grindrail.js";
import { lostEmbersActive, setup as spawnKolona } from "./Enemies/Kolona.js";
import { setup as spawnVoidImplosions } from "./Enemies/VoidImplosions.js";
import { setup as spawnOblivion } from "./Enemies/Oblivion.js";
import { setup as spawnRazorbloom } from "./Enemies/Razorbloom.js";
import { setup as spawnPonderer } from "./Enemies/Ponderer.js";
import {
  balletOfBladesActive,
  bladeBombardmentActive,
  setup as spawnVoidbreaker,
} from "./Enemies/Voidbreaker.js";
import { setup as spawnCadence } from "./Enemies/Cadence.js";
import { setup as spawnEvilCadence } from "./Enemies/EvilCadence.js";
import { setup as spawnWega } from "./Enemies/Wega.js";
import { setup as spawnSigil } from "./Enemies/Sigil.js";
import { setup as spawnQuartz } from "./Enemies/Quartz.js";
import { setup as spawnVisage } from "./Enemies/Visage.js";
import {
  shotgunVBGuardianActive,
  setup as spawnVoidboundGuardian,
} from "./Enemies/VoidboundGuardian.js";
import {
  blueprintCrossBeamsActive,
  setup as spawnScrapmaw,
} from "./Enemies/Scrapmaw.js";
import { setup as spawnCatalyst } from "./Enemies/Catalyst.js";
import { setup as spawnCatalystHunger } from "./Enemies/CatalystHunger.js";
import { setup as spawnCatalystHand } from "./Enemies/CatalystHand.js";
import { setup as spawnCelestial } from "./Enemies/Celestial.js";
import { setup as startCelestialIntro } from "./Enemies/CelestialIntro.js";
import { setup as startCelestialOutro } from "./Enemies/CelestialOutro.js";
import { pylonLocations, setup as spawnPylons } from "./Enemies/Pylons.js";
import { setup as spawnTruePylons } from "./Enemies/TruePylons.js";
import { setup as spawnGlitch } from "./Enemies/Glitch.js";
import { setup as spawnVoid } from "./Enemies/Void.js";
import { setup as spawnBeacon } from "./Enemies/Beacon.js";
import { setup as spawnCascade } from "./Enemies/Cascade.js";
import { setup as spawnCorrupted } from "./Enemies/Corrupted.js";
import { setup as spawnBlackhole } from "./Enemies/Blackhole.js";
import { setup as spawnTheEye } from "./Enemies/TheEye.js";
import { setup as spawnRealmweaver } from "./Enemies/Realmweaver.js";
import { setup as spawnLocust } from "./Enemies/Locust.js";
import { setup as multiplayerMessage } from "./Enemies/MultiplayerMessage.js";

document.getElementById("intro-start").innerHTML = "Click anywhere to begin";

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
let cheatDetector = true;

/* ===== DIFFICULTY ===== */
const beaten =
  localStorage.getItem("lv50-casual") != null ||
  localStorage.getItem("lv50-normal") != null ||
  localStorage.getItem("lv50-hard") != null;
const difficulties = beaten
  ? ["Casual", "Standard", "Extreme"]
  : ["Casual", "Standard"];
let difficultyIndex = localStorage.getItem("difficulty") ?? 1; // default = Normal
let casualMode = difficultyIndex === 0;
export let hardMode = difficultyIndex === 2;
let chaosMode = JSON.parse(localStorage.getItem("chaos")) ?? false;
const diffLabel = document.getElementById("diff-label");
const diffLeft = document.getElementById("diff-left");
const diffRight = document.getElementById("diff-right");
function applyDifficulty(firstLoad = false, direction = 0) {
  const diff = difficulties[difficultyIndex];
  if (direction !== 0) {
    diffLabel.style.transform =
      direction > 0 ? "translateX(-100%)" : "translateX(100%)";
    diffLabel.style.opacity = "0";

    setTimeout(() => {
      diffLabel.textContent = diff;

      diffLabel.style.transition = "none";
      diffLabel.style.transform =
        direction > 0 ? "translateX(100%)" : "translateX(-100%)";

      diffLabel.offsetWidth;

      diffLabel.style.transition =
        "transform 0.25s ease, opacity 0.2s ease, color 0.2s ease";
      diffLabel.style.transform = "translateX(0)";
      diffLabel.style.opacity = "1";
    }, 200);
  } else {
    diffLabel.textContent = diff;
  }
  casualMode = diff === "Casual";
  hardMode = diff === "Extreme";
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
let disableIceTile = false;
let highriseEnabled = false;
let spawnedVoid = false;
let voidScale = 1;
let seamineScale = 1;
let grindrailScale = 1;
let wallScale = 1;
let speedBoostScale = 1;
let iceEffect = false;
let lastTouchedIce;
let scorched = false;
let scorchedTime = 0;
let scorchedTimeout = null;
let debtAltar = null;
let spawnedAltar = [false, false, false, false];
let spawnedPylon = false;
let spawnedCatalyst = false;
let jumppadActive = false;
let SHAKE = false;
let transformAllGift = false;
let allGold = false;
export let passageGoldPattern = 0;
let stopCollect = false;
let disableTripmine = false;
let disableCollect = false;
let disablespawn = false;
let disableKnockback = false;
let immunebell = false;
let deathOpacity = 0;
let lastCursorInfectAt = 0;
let huskCount = 0;
let highestEntitySpawned = [];
let OblivionActive = 0;
let scrollOblivion = 0;
let celestialBG = false;
let scrollCelestial = 0;
export let stopAllEntity = false;
export let onCelestial = false;
export let onCelestialIntro = false;
const pickedOnce = new Set();
const spawnedUnstackables = new Set();
const spawnedCurses = new Set();
let jumppadSpawns = [];
let fleshSpawns = [];
export let spaceHeld = false;
export const keysPressed = {};
export let shiftlockEase = 1;
export let ability = false;
export let usedAbility = null;
export let slowmode = false;
export let ultrafastmode = false;
let abilityCooldown = 0;
let parried = false;
let soundParry = false;
export let beaconed = false;
export let despawnCatalyst = false;
export let despawnCelestial = false;
export let bellHit = { count: 0 };
let martStack = [];
export function MartStack(act, v) {
  if (act == "get") {
    return martStack;
  } else if (act == "set") {
    martStack = v;
  }
}
export function setOblivionActive(v) {
  OblivionActive = v;
}
export function setVoidScale(v) {
  voidScale = v;
}
export function setParried(v) {
  parried = v;
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
    desc: "A mostly harmless bell; rings on contact and cleanses flesh.",
  },
  {
    name: "Mart",
    spawn: () => spawnMart(entityHost, hardMode, 1),
    start: 0,
    src: "./ASSET/Enemies/Mart.png",
    desc: "I am Mart. The waterimp!",
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
    src: "./ASSET/Enemies/ICBMIcon.png",
    desc: "Highly explosive, stay out of the blast.",
  },
  {
    name: "Husk",
    spawn: () => spawnHusk(entityHost, huskCount++, hardMode),
    start: 0,
    src: "./ASSET/Enemies/Husk.png",
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
    spawn: () => {
      const unregister = spawnFlesh(entityHost, hardMode);
      fleshSpawns.push(unregister);
      return unregister;
    },
    start: 500,
    src: "./ASSET/Enemies/FleshIcon.png",
    desc: "Infects nearby tiles, hinders ability usage for a short duration.",
  },
  {
    name: "NIL",
    spawn: () => spawnNIL(entityHost, deafMode),
    start: 500,
    src: "./ASSET/Enemies/NILIcon.png",
    rare: true,
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
    name: "Operator",
    spawn: () => spawnOperator(entityHost, hardMode),
    start: 500,
    src: "./ASSET/Enemies/Operator.png",
    unstackable: true,
    desc: "Stand still briefly, before it wakes.",
  },
  {
    name: "Malfunction",
    altName: "Malf",
    spawn: () => {
      malfunctionActive[0] = true;
    },
    start: 2000,
    src: "./ASSET/Enemies/Malfunction.png",
    unstackable: true,
    desc: "Operator have 50% chance to become Voidbound. Stay still 3 times to survive.",
    curseType: true,
  },
  {
    name: "Telefragger",
    altName: "Tele",
    spawn: () => spawnTelefragger(entityHost, casualMode, hardMode, deafMode),
    start: 800,
    src: "./ASSET/Enemies/Telefragger.png",
    desc: "Teleports in front of you.",
  },
  {
    name: "Random",
    altName: "???",
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
    name: "Kolona",
    spawn: () => spawnKolona(entityHost, casualMode),
    start: 800,
    src: "./ASSET/Enemies/Kolona.png",
    desc: "Use your ability right after it hits the number that was shown at the start.",
  },
  {
    name: "VoidImplosions",
    altName: "Vimps",
    spawn: () => spawnVoidImplosions(entityHost),
    start: 1000,
    src: "./ASSET/Curses/VoidImplosions.png",
    unstackable: true,
    desc: "Void Implosions will start spawning. Destroy all shield.",
  },
  {
    name: "Oblivion",
    spawn: () => spawnOblivion(entityHost, showFloor),
    start: 2000,
    src: "./ASSET/Curses/Oblivion.png",
    unstackable: true,
    desc: "When the convergence starts, get above something, those in the air will quickly be obliterated.",
  },
  {
    name: "Razorbloom",
    altName: "Razor",
    spawn: () => spawnRazorbloom(entityHost, hardMode),
    start: 1000,
    src: "./ASSET/Curses/Razorbloom.png",
    unstackable: true,
    desc: "Razorbloom will land on your head, get rid of it by touching a Jump Pad.",
  },
  {
    name: "VoidboundBaby",
    altName: "VBB",
    spawn: () => spawnVoidboundBaby(entityHost, hardMode),
    start: 1200,
    src: "./ASSET/Enemies/VoidboundBaby.png",
    desc: "Much quicker dash. Much deadlier.",
  },
  {
    name: "Ponderer",
    spawn: () => spawnPonderer(entityHost, hardMode),
    start: 1200,
    src: "./ASSET/Enemies/PondererIcon.png",
    unstackable: true,
    rare: true,
    desc: "Focus on it. Don't let the clock tick down.",
  },
  {
    name: "VoidboundGuardian",
    altName: "VBG",
    spawn: () => spawnVoidboundGuardian(entityHost, casualMode, hardMode),
    start: 1500,
    src: "./ASSET/Enemies/VoidboundGuardian.png",
    desc: "Bullets are much larger, and leave behind beams.",
  },
  {
    name: "Voidbreaker",
    altName: "VB",
    spawn: () => spawnVoidbreaker(entityHost, casualMode, hardMode),
    start: 1200,
    src: "./ASSET/Enemies/VoidbreakerIcon.png",
    desc: "Materializes swords around you, firing them shortly after.",
  },
  {
    name: "Cadence",
    altName: "Cad",
    spawn: () => spawnCadence(entityHost, hardMode, deafMode),
    start: 1500,
    src: "./ASSET/Enemies/Cadence.png",
    desc: "Collect the instruments, keep it at bay.",
    unstackable: true,
  },
  {
    name: "Sigil",
    spawn: () => spawnSigil(entityHost),
    start: 1500,
    src: "./ASSET/Enemies/Sigil.png",
    desc: "Fires a tracking and long lasting beam.",
  },
  {
    name: "Scrapmaw",
    altName: "Scrap",
    spawn: () => spawnScrapmaw(entityHost, casualMode, hardMode),
    start: 1500,
    src: "./ASSET/Enemies/ScrapmawIcon.png",
    desc: "Blitzes toward the player, shooting beams.",
    unstackable: true,
  },
  {
    name: "Quartz",
    spawn: () => spawnQuartz(entityHost),
    start: 0,
    src: "./ASSET/Enemies/Quartz.png",
    desc: "shiny rock",
    chaosOnly: true,
  },
  {
    name: "Visage",
    altName: "Fear",
    spawn: () => spawnVisage(entityHost),
    start: 0,
    src: "./ASSET/Enemies/Visage.png",
    desc: "a horrible visage. dont let it touch you",
    chaosOnly: true,
  },
  {
    name: "BigBaby",
    spawn: () => spawnBaby(entityHost, hardMode, 3),
    start: 0,
    src: "./ASSET/Enemies/BigBaby.png",
    desc: "Big baby. Dashes in a straight line towards you.",
    chaosOnly: true,
  },
  {
    name: "BigSpringer",
    spawn: () => spawnSpringer(entityHost, hardMode, 3),
    start: 0,
    src: "./ASSET/Enemies/BigSpringer.png",
    desc: "Big springer. Jumps around the map, creating shockwaves that fling you.",
    chaosOnly: true,
  },
  {
    name: "TheEye",
    spawn: () => spawnTheEye(entityHost),
    start: 0,
    src: "./ASSET/Enemies/TheEye.png",
    desc: "Would you quit staring? it's rude.",
    chaosOnly: true,
  },
  {
    name: "Realmweaver",
    spawn: () => spawnRealmweaver(entityHost),
    start: 0,
    src: "./ASSET/Enemies/RealmweaverIcon.png",
    desc: "A colossal serpent. Don't let it touch you.",
    chaosOnly: true,
  },
  {
    name: "EvilCadence",
    altName: "EvilCad",
    spawn: () => spawnEvilCadence(entityHost, hardMode),
    start: 0,
    src: "./ASSET/Enemies/EvilCadence.png",
    desc: "Don't collect the instruments, keep it at bay.",
    chaosOnly: true,
  },
  {
    name: "Wega",
    spawn: () => spawnWega(entityHost),
    start: 0,
    src: "./ASSET/Enemies/Placeholder.png",
    rare: true,
    desc: "chases the nearest player",
    chaosOnly: true,
  },
  {
    name: "Locust",
    altName: "Belchboy",
    spawn: () => spawnLocust(entityHost),
    start: 0,
    chaosOnly: true,
  },
  {
    name: "RealityBreak",
    spawn: () => spawnRealityCollapse(entityHost, true),
    start: 0,
    chaosOnly: true,
  },
  {
    name: "NuclearBomb",
    spawn: () => {
      nuclearBombActive[0] = true;
    },
    start: 0,
    src: "./ASSET/Enemies/NuclearBomb.png",
    rare: true,
    desc: "Due to popular demand, the ICBM will now raze the entire map.",
    chaosOnly: true,
    curseType: true,
  },
  {
    name: "Legion",
    spawn: () => {
      legionActive[0] = true;
    },
    start: 0,
    src: "./ASSET/Enemies/Legion.png",
    desc: "You and what... army... oh...",
    chaosOnly: true,
    curseType: true,
  },
  {
    name: "Don'tTouchMe",
    altName: "DontTouchMe",
    spawn: () => {
      dontTouchMeActive[0] = true;
    },
    start: 0,
    src: "./ASSET/Enemies/Placeholder.png",
    desc: "Don't ring Bell..",
    chaosOnly: true,
    curseType: true,
  },
  {
    name: "MartSlide",
    spawn: () => {
      martSlideActive[0] = true;
    },
    start: 0,
    src: "./ASSET/Enemies/MartSlide.png",
    desc: "He's building up momentum!",
    chaosOnly: true,
    curseType: true,
  },
  {
    name: "Shotgun",
    spawn: () => {
      shotgunGuardianActive[0] = true;
      shotgunVBGuardianActive[0] = true;
    },
    start: 0,
    src: "./ASSET/Enemies/Shotgun.png",
    desc: "Guardian will fire a spread of bullets rather than a volley.",
    chaosOnly: true,
    curseType: true,
  },
  {
    name: "Blueprint:CrossBeams",
    altName: "BlueprintCrossBeams",
    spawn: () => {
      blueprintCrossBeamsActive[0] = true;
    },
    start: 0,
    src: "./ASSET/Enemies/Placeholder.png",
    desc: "Lasers now cross.",
    chaosOnly: true,
    curseType: true,
  },
  {
    name: "BalletOfBlades",
    altName: "Ballet",
    spawn: () => {
      balletOfBladesActive[0] = true;
    },
    start: 0,
    src: "./ASSET/Enemies/BalletofBlades.png",
    desc: "Voidbreaker summons more swords around you before striking, be mindful of the order as the swords launch at an extreme rate.",
    chaosOnly: true,
    curseType: true,
  },
  {
    name: "BladeBombardment",
    altName: "Bombard",
    spawn: () => {
      bladeBombardmentActive[0] = true;
    },
    start: 0,
    src: "./ASSET/Enemies/BladeBombardment.png",
    desc: "Voidbreaker fires more swords at once, the swords themselves are faster, but the summoning is much slower and increases the cooldown.",
    chaosOnly: true,
    curseType: true,
  },
  {
    name: "LostEmbers",
    spawn: () => {
      lostEmbersActive[0] = true;
    },
    start: 0,
    src: "./ASSET/Enemies/LostEmbers.png",
    desc: "Kolóna will no longer show a number while counting. Pay attention.",
    chaosOnly: true,
    curseType: true,
  },
  {
    name: "[REDACTED]",
    altName: "REDACTED",
    spawn: () => {
      redactedActive[0] = true;
    },
    start: 0,
    src: "./ASSET/Enemies/REDACTED.png",
    desc: "<0> --> ... <0> --> ... <0> !!!",
    chaosOnly: true,
    curseType: true,
  },
  {
    name: "Muted",
    spawn: () => {
      mutedActive[0] = true;
    },
    start: 0,
    src: "./ASSET/Enemies/Muted.png",
    desc: "Removes Telefragger's indicator.",
    chaosOnly: true,
    curseType: true,
  },
  {
    name: "Rebirth",
    spawn: () => {
      rebirthActive[0] = true;
    },
    start: 0,
    src: "./ASSET/Enemies/Rebirth.png",
    desc: "All babies will turn into Voidbound Babies.",
    chaosOnly: true,
    curseType: true,
  },
  {
    name: "FastSpringer",
    spawn: () => {
      if (!fastSpringerActive[0]) {
        fastSpringerActive[0] = true;
        fasterSpringer[0] += 10;
      }
    },
    start: 0,
    src: "./ASSET/Enemies/Placeholder.png",
    desc: "All Springers now move significantly faster when jumping, and jump cooldown is reduced.",
    chaosOnly: true,
    curseType: true,
  },
  {
    name: "Cascade",
    spawn: () => spawnCascade(entityHost, casualMode, hardMode),
    start: 0,
    src: "./ASSET/Enemies/Cascade.png",
    rare: true,
    desc: "Alternates between two spiraling bullet patterns.",
    chaosOnly: true,
  },
  {
    name: "Corrupted",
    spawn: () => spawnCorrupted(entityHost, casualMode, hardMode),
    start: 0,
    src: "./ASSET/Enemies/Corrupted.png",
    rare: true,
    desc: "Unleashes a barrage of unpredictable attacks.",
    chaosOnly: true,
  },
  {
    name: "Blackhole",
    spawn: () => spawnBlackhole(entityHost, casualMode, hardMode),
    start: 0,
    src: "./ASSET/Enemies/Blackhole.png",
    rare: true,
    desc: "Pulls you in. Don't get too close.",
    chaosOnly: true,
  },
  {
    name: "Catalyst",
    spawn: () => spawnCatalyst(entityHost),
    start: 1000000000,
    src: "./ASSET/Enemies/CatalystIcon.png",
    desc: "למה לבזבז את כל הזמן הזה באור? תהיה איתי בחושך.",
  },
  {
    name: "Celestial",
    spawn: () => spawnCelestial(entityHost, hardMode),
    start: 1000000000,
    src: "./ASSET/Enemies/Celestial.png",
    desc: "TO MAKE THINGS EVEN.",
  },
];
const ProgressionEvents = [
  {
    level: 5,
    title: "You feel a sense of dread...",
    desc: "Tripmines begin to appear.",
    title2: "The air around you begins to freeze...",
    desc2: "Ice tiles can now appear.",
    mode: [
      [false, true, true],
      [false, false, true],
    ],
  },
  {
    level: 6,
    title: "The humidity rises...",
    desc: "All Marts have their default size increased.",
    activate: () => {}, //all mart 2x size (default size = 2)
  },
  {
    level: 8,
    title: "The air around you begins to freeze...",
    desc: "Ice tiles can now appear.",
    mode: [
      [true, true, false],
      [false, false, false],
    ],
  },
  {
    level: 10,
    title: "Steel fills the air...",
    desc: "Grindrails begin to appear.",
    title2: "More familiar remnants make their way here...",
    desc2: "Seamines begin to appear.",
  },
  {
    level: 14,
    title: "A sickly sweet odor fills the air, the hivemind grows stronger...",
    desc: "Flesh has further range.",
    activate: () => {}, //flesh range 2x ((TILE * 6) ** 2)
  },
  {
    level: 16,
    title: "The sound of sirens blaring pierce your ears...",
    desc: "More ICBMs now appear.",
    activate: () => {}, //spawn 5 icbm (timed separately)
  },
  {
    level: 18,
    title: "The smell of metal and smoke lingers...",
    desc: "Highrise towers begin to appear.",
    title2: "The humidity rises...",
    desc2: "Marts will grow in size.",
    activate: () => {}, //all mart +1 size per 60s (and first activate)
  },
  {
    level: 20,
    title: "The ground beneath you rumbles...",
    desc: "More Springers now appear.",
    activate: () => {}, //spawn 5 springer (timed separately)
  },
  {
    level: 25,
    title: "The sound of footsteps echoes behind you...",
    desc: "More Husks join the congaline.",
    activate: () => {}, //spawn 5 husk (timed little separately)
  },
  {
    level: 50,
    title: "Your body tenses up, the end is nearing...",
    desc: "Enemies appear more often...", //(1), |0, 1, 1|, ...
  },
];

let vineBoom = null;
const jesusImg = new Image();
jesusImg.src = "./ASSET/Misc/Jesus.png";
const oblivionBGimg = new Image();
oblivionBGimg.src = "./ASSET/Misc/OblivionBG.png";
const celestialBGimg = new Image();
celestialBGimg.src = "./ASSET/Misc/CelestialBG.png";
const skybox = new Image();
skybox.src = "./ASSET/Misc/Skybox.png";
let scrollSkybox = 0;
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
let showSkybox = JSON.parse(localStorage.getItem("skybox")) ?? true;
let showTimer = JSON.parse(localStorage.getItem("timer")) ?? false;
export let uldm = JSON.parse(localStorage.getItem("uldm")) ?? false;
let showPlayers = JSON.parse(localStorage.getItem("players")) ?? false;
let reducedMotion = JSON.parse(localStorage.getItem("reduced-motion")) ?? false;
let epilepticMode = JSON.parse(localStorage.getItem("epileptic")) ?? false;
let blindnessMode = JSON.parse(localStorage.getItem("blindness")) ?? false;
let drunkCamera = JSON.parse(localStorage.getItem("drunk-camera")) ?? false;
let tripmineHell = JSON.parse(localStorage.getItem("tripmine-hell")) ?? false;
let enableVoid = JSON.parse(localStorage.getItem("enable-void")) ?? true;
export let wasdMode = JSON.parse(localStorage.getItem("wasd")) ?? false;
let esp = JSON.parse(localStorage.getItem("esp")) ?? false;
let jesus = JSON.parse(localStorage.getItem("jesus")) ?? false;
let parry = JSON.parse(localStorage.getItem("parry")) ?? false;
let accurateCursor =
  JSON.parse(localStorage.getItem("accurate-cursor")) ?? false;
let sfxVolume = localStorage.getItem("sfxVolume")
  ? Number(localStorage.getItem("sfxVolume"))
  : 50;
let musicVolume = localStorage.getItem("musicVolume")
  ? Number(localStorage.getItem("musicVolume"))
  : 30;
graphicsSlider.value = Number(localStorage.getItem("graphicsLevel")) || 0;

document.getElementById("toggle-chaos").checked = chaosMode;
document.getElementById("toggle-grids").checked = showGrids;
document.getElementById("toggle-skybox").checked = showSkybox;
document.getElementById("toggle-timer").checked = showTimer;
document.getElementById("toggle-uldm").checked = uldm;
document.getElementById("toggle-players").checked = showPlayers;
document.getElementById("toggle-floor").checked = showFloor;
document.getElementById("toggle-border").checked = showBorder;
document.getElementById("toggle-epileptic").checked = epilepticMode;
document.getElementById("toggle-blindness").checked = blindnessMode;
document.getElementById("toggle-reduced-motion").checked = reducedMotion;
document.getElementById("toggle-deaf-mode").checked = deafMode;
document.getElementById("toggle-drunk-camera").checked = drunkCamera;
document.getElementById("toggle-tripmine-hell").checked = tripmineHell;
document.getElementById("toggle-enable-void").checked = enableVoid;
document.getElementById("toggle-wasd").checked = wasdMode;
document.getElementById("toggle-esp").checked = esp;
document.getElementById("toggle-jesus").checked = jesus;
document.getElementById("toggle-parry").checked = parry;
document.getElementById("toggle-accurate-cursor").checked = accurateCursor;
document.getElementById("sfx-volume").value = sfxVolume;
document.getElementById("music-volume").value = musicVolume;
graphicsSlider.dispatchEvent(new Event("input"));

function checkDiff() {
  if (chaosMode) {
    diffLabel.style.color = "#600";
  } else if (casualMode) {
    diffLabel.style.color = "#0f0";
  } else if (hardMode) {
    diffLabel.style.color = "#f00";
  } else {
    diffLabel.style.color = "#fff";
  }
  if (casualMode) {
    document.getElementById("entity-panel-diff").textContent =
      `Casual${chaosMode ? " (CHAOS)" : ""}`;
  } else if (hardMode) {
    document.getElementById("entity-panel-diff").textContent =
      `Extreme${chaosMode ? " (CHAOS)" : ""}`;
  } else {
    document.getElementById("entity-panel-diff").textContent =
      `Standard${chaosMode ? " (CHAOS)" : ""}`;
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
toggle("toggle-chaos", (v) => {
  chaosMode = v;
  checkDiff();
});
toggle("toggle-grids", (v) => {
  showGrids = v;
});
toggle("toggle-skybox", (v) => {
  showSkybox = v;
});
toggle("toggle-timer", (v) => {
  showTimer = v;
  document.getElementById("timer").style.opacity = showTimer ? "100%" : "0%";
});
toggle("toggle-uldm", (v) => {
  uldm = v;
});
toggle("toggle-players", (v) => {
  showPlayers = v;
});
toggle("toggle-floor", (v) => {
  showFloor = v;
});
toggle("toggle-border", (v) => {
  showBorder = v;
  canvas.style.boxShadow = showBorder
    ? "0 0 240px rgba(255, 0, 0, 1), 0 0 240px rgba(255, 0, 0, 1), inset 0 0 240px rgba(255, 0, 0, 1)"
    : "0 0 0px rgba(255, 0, 0, 0), 0 0 0px rgba(255, 0, 0, 0), inset 0 0 0px rgba(255, 0, 0, 0)";
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
toggle("toggle-wasd", (v) => {
  wasdMode = v;
});
toggle("toggle-esp", (v) => {
  esp = v;
});
toggle("toggle-jesus", (v) => {
  jesus = v;
});
toggle("toggle-parry", (v) => {
  parry = v;
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
  localStorage.removeItem("skybox");
  localStorage.removeItem("timer");
  localStorage.removeItem("uldm");
  localStorage.removeItem("players");
  localStorage.removeItem("reduced-motion");
  localStorage.removeItem("deaf-mode");
  localStorage.removeItem("epileptic");
  localStorage.removeItem("blindness");
  localStorage.removeItem("drunk-camera");
  localStorage.removeItem("tripmine-hell");
  localStorage.removeItem("enable-void");
  localStorage.removeItem("wasd");
  localStorage.removeItem("enable-esp");
  localStorage.removeItem("enable-jesus");
  localStorage.removeItem("parry");
  localStorage.removeItem("accurate-cursor");
  localStorage.removeItem("graphicsLevel");
  localStorage.setItem("sfxVolume", "50");
  localStorage.setItem("musicVolume", "30");
  showBorder = true;
  showFloor = true;
  showGrids = false;
  showSkybox = true;
  showTimer = false;
  uldm = false;
  showPlayers = false;
  reducedMotion = false;
  deafMode = true;
  epilepticMode = false;
  blindnessMode = false;
  drunkCamera = false;
  tripmineHell = false;
  enableVoid = true;
  wasdMode = false;
  esp = false;
  jesus = false;
  parry = false;
  accurateCursor = false;
  sfxVolume = 50;
  musicVolume = 30;
  document.getElementById("toggle-border").checked = true;
  document.getElementById("toggle-floor").checked = true;
  document.getElementById("toggle-grids").checked = false;
  document.getElementById("toggle-skybox").checked = true;
  document.getElementById("toggle-timer").checked = false;
  document.getElementById("toggle-uldm").checked = false;
  document.getElementById("toggle-players").checked = false;
  document.getElementById("toggle-reduced-motion").checked = false;
  document.getElementById("toggle-deaf-mode").checked = true;
  document.getElementById("toggle-epileptic").checked = false;
  document.getElementById("toggle-blindness").checked = false;
  document.getElementById("toggle-drunk-camera").checked = false;
  document.getElementById("toggle-tripmine-hell").checked = false;
  document.getElementById("toggle-enable-void").checked = true;
  document.getElementById("toggle-wasd").checked = false;
  document.getElementById("toggle-esp").checked = false;
  document.getElementById("toggle-jesus").checked = false;
  document.getElementById("toggle-parry").checked = false;
  document.getElementById("toggle-accurate-cursor").checked = false;
  document.getElementById("sfx-volume").value = 50;
  document.getElementById("music-volume").value = 30;
  graphicsSlider.value = 0;
  graphicsSlider.dispatchEvent(new Event("input"));
  canvas.style.animation = "bg 60s infinite";
  document.getElementById("timer").style.opacity = showTimer ? "100%" : "0%";
  canvas.style.boxShadow =
    "0 0 240px rgba(255, 0, 0, 1), 0 0 240px rgba(255, 0, 0, 1), inset 0 0 240px rgba(255, 0, 0, 1)";
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

/* ===== MULTIPLAYER ===== */
const API_BASE = "https://api.keyval.org";
async function set(key, value) {
  const response = await fetch(`${API_BASE}/set`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, val: value }),
  });
  return response.json();
}
async function get(key) {
  const response = await fetch(`${API_BASE}/get`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  return response.json();
}
let lastValue = "ce5f87fe-78ea-4779-9530-6c842ca30da6";
let lastValueEntity = "ce5f87fe-78ea-4779-9530-6c842ca30da6";
set("crnsc-message", "ce5f87fe-78ea-4779-9530-6c842ca30da6");
set("crnsc-spawnentity", "ce5f87fe-78ea-4779-9530-6c842ca30da6");
setInterval(async () => {
  //message
  let value = await get("crnsc-message");
  value = value.val;
  const match = value.match(/^\[([^\]]+)\]([\s\S]*)$/);
  const color = match ? match[1] : "#ff0088";
  const text = match ? match[2] : value;
  if (value !== lastValue && value !== "ce5f87fe-78ea-4779-9530-6c842ca30da6") {
    lastValue = value;
    multiplayerMessage(entityHost, text, color);
  } else if (value === "ce5f87fe-78ea-4779-9530-6c842ca30da6") {
    lastValue = "ce5f87fe-78ea-4779-9530-6c842ca30da6";
  }
  //spawnentity
  let valueEntity = await get("crnsc-spawnentity");
  valueEntity = valueEntity.val;
  if (
    valueEntity !== lastValueEntity &&
    valueEntity !== "ce5f87fe-78ea-4779-9530-6c842ca30da6"
  ) {
    lastValueEntity = valueEntity;
    const entity = ENTITY_POOL.find(
      (e) => e.name.toLowerCase() === valueEntity,
    );
    entity.spawn();
    registerEntitySpawn(entity.name, entity.src);
  } else if (valueEntity === "ce5f87fe-78ea-4779-9530-6c842ca30da6") {
    lastValueEntity = "ce5f87fe-78ea-4779-9530-6c842ca30da6";
  }
}, 1000);
//players
const id = `${Math.floor(Math.random() * 1000)}`;
const col = `rgb(${192 + Math.floor(Math.random() * 64)},${192 + Math.floor(Math.random() * 64)},${192 + Math.floor(Math.random() * 64)})`;
let multiPlayers = true;
let playersToDraw = [];
if (showPlayers) {
  multiPlayers = true;

  (async function playerLoop() {
    while (multiPlayers) {
      try {
        let ids = [];

        let value = await get("crnsc-players");
        value = value.val;

        if (value) {
          ids = typeof value === "string" ? JSON.parse(value) : value;
        }

        if (!ids.includes(id)) {
          ids.push(id);
        }

        const now = Date.now();

        await set(
          `crnsc-p${id}`,
          JSON.stringify({
            pos: {
              x: Math.round(mouse.x),
              y: Math.round(mouse.y),
            },
            col,
            upd: now,
          }),
        );

        const aliveIds = [];
        const newPlayersToDraw = [];

        for (const pid of ids) {
          try {
            let player = await get(`crnsc-p${pid}`);
            player = player.val;

            if (!player) continue;

            player = typeof player === "string" ? JSON.parse(player) : player;

            if (now - player.upd > 60000) continue;

            aliveIds.push(pid);

            const old = playersToDraw.find((p) => p.id === pid);
            newPlayersToDraw.push({
              id: pid,
              ...player,
              drawPos: old?.drawPos ?? {
                x: player.pos.x,
                y: player.pos.y,
              },
            });
          } catch {}
        }

        playersToDraw = newPlayersToDraw;

        await set("crnsc-players", JSON.stringify(aliveIds));
      } catch (err) {
        console.error(err);
        playersToDraw = [];
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  })();
} else {
  multiPlayers = false;
}

/* ===== CONFIG ===== */
canvas.width = 10000;
canvas.height = 10000;

export let latestCollectedCount = 0;
export let collectedCount = 0;
export let actualCollectedCount = 0;
let collectedCountBeforeCelestial = 0;
let lastGiftCollectSound = 0;
let giftMultiplier = 1;
export function setGiftMultiplier(v) {
  giftMultiplier = v;
}
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
let bypassCheatCount = 0;
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && ["w", "s", "d"].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
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
  if (e.key === "|" && e.shiftKey && e.ctrlKey) {
    bypassCheatCount++;
    if (bypassCheatCount >= 10) {
      cheatDetector = false;
    }
  }
  if (e.key.toLowerCase() === "m") {
    panelOpen = !panelOpen;
    panel.classList.toggle("open", panelOpen);
  }
  if (e.key === " " && !e.repeat) {
    spaceHeld = true;
    shiftlockEase = 0;
  }
  keysPressed[e.key.toLowerCase()] = true;
  if (abilityCooldown == 0 && !slowness) {
    if (e.key.toLowerCase() === "e") {
      abilityCooldown = 45;
      ability = true;
      setTimeout(() => {
        ability = false;
      }, 500);
      usedAbility = "e";
      speedBoostScale = 2;
    } else if (e.key.toLowerCase() === "r") {
      abilityCooldown = 45;
      ability = true;
      setTimeout(() => {
        ability = false;
      }, 500);
      if (!parry) {
        usedAbility = "e";
        speedBoostScale = 2;
      } else {
        usedAbility = "r";
      }
    }
  }
});
let spawnEntityRate = 200;
let disableProgression = false;
let firstDisableProgression = false;
let cheattimer = 0;
let tipstimer = 0;
const altars = [
  { name: "chance", activate: () => activateChance(), spawn: spawnAltarChance },
  { name: "echo", activate: () => activateEcho(), spawn: spawnAltarEcho },
  {
    name: "passage",
    activate: () => activatePassage(),
    spawn: spawnAltarPassage,
  },
  {
    name: "protection",
    activate: () => activateProtection(),
    spawn: spawnAltarProtection,
  },
  {
    name: "purgatory",
    activate: () => activatePurgatory(),
    spawn: spawnAltarPurgatory,
  },
  { name: "chaos", activate: () => activateChaos(), spawn: spawnAltarChaos },
  {
    name: "purification",
    activate: () => activatePurification(),
    spawn: spawnAltarPurification,
  },
];
export let soundStopped = false;
const topLeftInput = document.getElementById("spawn-input");
topLeftInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
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
      ENTITY_POOL.find((e) => e.altName?.toLowerCase() === input) ||
      input.toLowerCase() === "catalyst" ||
      input.toLowerCase() === "pylons" ||
      input.toLowerCase() === "truepylons" ||
      input.toLowerCase() === "seamine" ||
      input.toLowerCase() === "jumppad" ||
      input.toLowerCase() === "realitycollapse" ||
      input.toLowerCase() === "grindrail" ||
      input.toLowerCase().startsWith("altar");
    if (entity) {
      let spawned = 0;
      const interval = setInterval(() => {
        if (spawned >= spawnCount) {
          clearInterval(interval);
          return;
        }
        spawned++;
        if (input.toLowerCase() === "catalyst") {
          spawnCatalyst(entityHost);
          spawnCatalystIntro();
          registerEntitySpawn("Catalyst", "./ASSET/Enemies/CatalystIcon.png");
        } else if (input.toLowerCase() === "pylons") {
          spawnPylons(entityHost);
        } else if (input.toLowerCase() === "truepylons") {
          spawnTruePylons(entityHost);
        } else if (input.toLowerCase() === "seamine") {
          spawnSeamine(entityHost, casualMode, hardMode);
        } else if (input.toLowerCase() === "grindrail") {
          spawnGrindrail(entityHost);
        } else if (input.toLowerCase() === "jumppad") {
          for (let i = 1; i <= 10; i++) {
            if (i <= 5) {
              jumppadSpawns.push(spawnJumpPad(entityHost));
            } else if (i <= 8) {
              spawnJumpPad(entityHost, true);
            } else {
              spawnTriaOrb(entityHost);
            }
          }
        } else if (input.toLowerCase() === "realitycollapse") {
          spawnRealityCollapse(entityHost, true);
          spawnRealityCollapse(entityHost);
        } else if (input.toLowerCase().startsWith("altar")) {
          const name = input.slice(5).trim().toLowerCase();
          if (!name) {
            altars.forEach((altar) => altar.spawn(entityHost, hardMode));
          } else {
            const altar = altars.find((a) => a.name === name);
            if (altar) {
              altar.spawn(entityHost, hardMode);
            }
          }
        } else if (entity.name === "Random") {
          const randUnlocked = chaosMode
            ? ENTITY_POOL.filter((e) => {
                if (e.name === "Celestial" || e.name === "Catalyst")
                  return false;
                if (e.name === "Random") return false;
                if (e.curseType) return false;
                return true;
              })
            : ENTITY_POOL.filter((e) => {
                if (e.chaosOnly) return false;
                if (e.name === "Random") return false;
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
      }, spawnEntityRate);
      topLeftInput.value = "";
    }
    const msgMatch = topLeftInput.value.trim().match(/^msg\(([\s\S]*)\)$/i);
    if (msgMatch) {
      const value = msgMatch[1];
      set("crnsc-message", value);
      setTimeout(() => {
        set("crnsc-message", "ce5f87fe-78ea-4779-9530-6c842ca30da6");
        lastValue = "ce5f87fe-78ea-4779-9530-6c842ca30da6";
      }, 1000);
      topLeftInput.value = "";
    }
    if (input.toLowerCase().startsWith("globalspawn")) {
      const entity = ENTITY_POOL.find(
        (e) =>
          e.name.toLowerCase() ===
          input.slice("globalspawn".length).toLowerCase(),
      );
      if (entity) {
        set("crnsc-spawnentity", entity.name.toLowerCase());
        setTimeout(() => {
          set("crnsc-spawnentity", "ce5f87fe-78ea-4779-9530-6c842ca30da6");
          lastValueEntity = "ce5f87fe-78ea-4779-9530-6c842ca30da6";
        }, 1000);
        topLeftInput.value = "";
      }
    }
    //DELETE AFTER RELEASE
    if (input === "silencecelestial") {
      spawnCelestial(entityHost, hardMode, false, true);
      topLeftInput.value = "";
    }
    if (input === "truecelestial" || input === "spawncelestialintro") {
      spawnCelestialIntro();
      topLeftInput.value = "";
    }
    if (input === "celestialending") {
      startCelestialOutro(entityHost);
      topLeftInput.value = "";
    }
    if (input === "toggledeath" || input === "noclip") {
      toggleToggleDeath();
      topLeftInput.value = "";
    }
    if (input === "disablespawn" || input === "togglespawn") {
      disablespawn = !disablespawn;
      topLeftInput.value = "";
    }
    if (input === "disableknockback" || input === "toggleknockback") {
      disableKnockback = !disableKnockback;
      topLeftInput.value = "";
    }
    if (input === "shield") {
      activateShield();
      topLeftInput.value = "";
    }
    if (input === "highrise") {
      highriseEnabled = !highriseEnabled;
      topLeftInput.value = "";
    }
    if (input === "icetile") {
      isIceTileEnabled = true;
      if (!disableIceTile && passageGoldPattern == 0) {
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
      }
      setInterval(() => {
        if (!disableIceTile && passageGoldPattern == 0) {
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
        }
      }, 60000);
      topLeftInput.value = "";
    }
    if (input === "commandlist") {
      document.getElementById("spawn-input-commands").style.opacity = 1;
      topLeftInput.value = "";
    }
    if (input === "biggerradius") {
      if (HIT_RADIUS === GIFT_SIZE) {
        HIT_RADIUS = GIFT_SIZE * 10;
      } else {
        HIT_RADIUS = GIFT_SIZE;
      }
      topLeftInput.value = "";
    }
    if (input === "immunebell") {
      immunebell = !immunebell;
      topLeftInput.value = "";
    }
    if (input === "revive" || input === "rev") {
      revive();
      soundStopped = false;
      topLeftInput.value = "";
    }
    if (input === "oneofeach") {
      spawnBell(entityHost, hardMode, immunebell);
      spawnMart(entityHost, hardMode, 1);
      spawnBaby(entityHost, hardMode);
      spawnICBM(entityHost, hardMode);
      spawnHusk(entityHost, huskCount++, hardMode);
      spawnSpringer(entityHost, hardMode);
      spawnFlesh(entityHost, hardMode);
      spawnNIL(entityHost);
      spawnGuardian(entityHost, hardMode);
      spawnOperator(entityHost, hardMode);
      malfunctionActive[0] = true;
      spawnTelefragger(entityHost, casualMode, hardMode, deafMode);
      spawnKolona(entityHost, casualMode);
      spawnVoidImplosions(entityHost);
      spawnOblivion(entityHost, showFloor);
      spawnRazorbloom(entityHost, hardMode);
      spawnVoidboundBaby(entityHost, hardMode);
      spawnPonderer(entityHost, hardMode);
      spawnVoidboundGuardian(entityHost, casualMode, hardMode);
      spawnVoidbreaker(entityHost, casualMode, hardMode);
      spawnCadence(entityHost, hardMode, deafMode);
      spawnSigil(entityHost);
      spawnScrapmaw(entityHost, casualMode, hardMode);
      spawnCatalyst(entityHost);
      spawnCatalystIntro();
      spawnCelestial(entityHost, hardMode);
      registerEntitySpawn("Bell", "./ASSET/Enemies/Bell.png");
      registerEntitySpawn("Mart", "./ASSET/Enemies/Mart.png");
      registerEntitySpawn("Baby", "./ASSET/Enemies/Baby.png");
      registerEntitySpawn("ICBM", "./ASSET/Enemies/ICBMIcon.png");
      registerEntitySpawn("Husk", "./ASSET/Enemies/Husk.png");
      registerEntitySpawn("Springer", "./ASSET/Enemies/Springer.png");
      registerEntitySpawn("Flesh", "./ASSET/Enemies/FleshIcon.png");
      registerEntitySpawn("NIL", "./ASSET/Enemies/NILIcon.png");
      registerEntitySpawn("Guardian", "./ASSET/Enemies/Guardian.png");
      registerEntitySpawn("Operator", "./ASSET/Enemies/Operator.png");
      registerEntitySpawn("Malfunction", "./ASSET/Enemies/Malfunction.png");
      registerEntitySpawn("Telefragger", "./ASSET/Enemies/Telefragger.png");
      registerEntitySpawn("Kolona", "./ASSET/Enemies/Kolona.png");
      registerEntitySpawn(
        "VoidImplosions",
        "./ASSET/Curses/VoidImplosions.png",
      );
      registerEntitySpawn("Oblivion", "./ASSET/Curses/Oblivion.png");
      registerEntitySpawn("Razorbloom", "./ASSET/Curses/Razorbloom.png");
      registerEntitySpawn("VoidboundBaby", "./ASSET/Enemies/VoidboundBaby.png");
      registerEntitySpawn("Ponderer", "./ASSET/Enemies/PondererIcon.png");
      registerEntitySpawn(
        "VoidboundGuardian",
        "./ASSET/Enemies/VoidboundGuardian.png",
      );
      registerEntitySpawn("Voidbreaker", "./ASSET/Enemies/VoidbreakerIcon.png");
      registerEntitySpawn("Cadence", "./ASSET/Enemies/Cadence.png");
      registerEntitySpawn("Sigil", "./ASSET/Enemies/Sigil.png");
      registerEntitySpawn("Scrapmaw", "./ASSET/Enemies/ScrapmawIcon.png");
      registerEntitySpawn("Catalyst", "./ASSET/Enemies/CatalystIcon.png");
      registerEntitySpawn("Celestial", "./ASSET/Enemies/Celestial.png");
      topLeftInput.value = "";
    }
    if (input === "youwillnotsurvivethis") {
      let i = 0;
      let interval = setInterval(() => {
        i++;
        spawnGlitch(entityHost, true);
        if (i >= 10) clearInterval(interval);
      }, 100);
      topLeftInput.value = "";
    }
    if (input === "suicide") {
      death("Suicide");
      topLeftInput.value = "";
    }
    if (input === "slowmode") {
      slowmode = !slowmode;
      topLeftInput.value = "";
    }
    if (input === "ultrafastmode" || input === "fastmode") {
      ultrafastmode = !ultrafastmode;
      topLeftInput.value = "";
    }
    for (const altar of altars) {
      if (input === altar.name) {
        altar.activate();
        topLeftInput.value = "";
        break;
      }
    }
    const setgiftmultiplierMatch = input.match(
      /^setgiftmultiplier\(([\d.]+)\)$/,
    );
    if (setgiftmultiplierMatch) {
      setGiftMultiplier(parseFloat(setgiftmultiplierMatch[1]));
      topLeftInput.value = "";
    }
    const entityspawndelayMatch = input.match(/^entityspawndelay\((\d+)\)$/);
    if (entityspawndelayMatch) {
      spawnEntityRate = parseInt(entityspawndelayMatch[1], 10);
      topLeftInput.value = "";
    }
    const patternMatch = input.match(/^patternspawn\((\d+)\)$/);
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
    }
  }
});
let reducedMotionHoldActive = false;
let reducedMotionBeforeHold = reducedMotion;
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && ["w", "s", "d"].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
  if (e.repeat) return;
  if (reducedMotionHoldActive) return;
  if (e.key !== "Shift" && e.key !== "Control") return;

  reducedMotionHoldActive = true;
  reducedMotionBeforeHold = reducedMotion;
  reducedMotion = !reducedMotionBeforeHold;
});
window.addEventListener("keyup", (e) => {
  if (e.key === " ") {
    spaceHeld = false;
    shiftlockEase = 0;
  }
  keysPressed[e.key.toLowerCase()] = false;

  if (!reducedMotionHoldActive) return;
  if (e.key !== "Shift" && e.key !== "Control") return;

  reducedMotion = reducedMotionBeforeHold;
  reducedMotionHoldActive = false;
});
const input = document.getElementById("death-input");
const img = document.getElementById("death-image");
let wobbleTimer;
input.addEventListener("input", () => {
  playSound("./ASSET/Sound/Domasp/Domasp_CodeType.ogg");
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
        img.src = "./ASSET/Enemies/PondererIcon.png";
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
document.getElementById("timer").style.opacity = showTimer ? "100%" : "0%";
canvas.style.boxShadow = showBorder
  ? "0 0 240px rgba(255, 0, 0, 1), 0 0 240px rgba(255, 0, 0, 1), inset 0 0 240px rgba(255, 0, 0, 1)"
  : "0 0 0px rgba(255, 0, 0, 0), 0 0 0px rgba(255, 0, 0, 0), inset 0 0 0px rgba(255, 0, 0, 0)";
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
    soundPath != "./ASSET/Sound/Enemies/Catalyst/CataOnCollapse.mp3" &&
    soundPath != "./ASSET/Sound/Enemies/Catalyst/CataScream_v3.mp3" &&
    soundPath != "./ASSET/Sound/Enemies/Catalyst/CataCutsceneOnBeacon.mp3" &&
    soundPath != "./ASSET/Sound/Enemies/ending_2.mp3" &&
    soundPath !=
      "./ASSET/Sound/Enemies/Celestial/Celestial_Cutscene_Music.ogg" &&
    soundPath != "./ASSET/Sound/Enemies/Celestial/Celestial_Intro.ogg" &&
    soundPath !=
      "./ASSET/Sound/Enemies/Celestial/Talking/Celestial_Talk_5.ogg" &&
    soundPath != "./ASSET/Sound/Enemies/BeaconSpawn.ogg" &&
    !soundPath.startsWith("./ASSET/Sound/Domasp/")
  )
    return;
  rate = Math.min(16, rate);
  const cachedAudio = getAsset(soundPath);
  const audio = cachedAudio ? cachedAudio.cloneNode() : new Audio(soundPath);
  audio.playbackRate = rate * (ultrafastmode ? 3 : slowmode ? 0.5 : 1);
  if (typeof important === "string") {
    if (
      soundPath ==
        "./ASSET/Sound/Enemies/Celestial/Talking/Celestial_Talk_5.ogg" &&
      originalVolume[1]
    ) {
      audio.volume = Math.max(
        0,
        Math.min(1, originalVolume[1] / Number(important)),
      );
    } else {
      audio.volume = Math.max(0, Math.min(1, sfxVolume / Number(important)));
    }
  } else {
    audio.volume = Math.max(
      0,
      Math.min(
        1,
        important ? sfxVolume / 100 : (music ? musicVolume : sfxVolume) / 200,
      ),
    );
  }

  audio.addEventListener("loadedmetadata", () => {
    const startTime = clip.start * audio.duration;
    const endTime = clip.end * audio.duration;

    audio.currentTime = startTime;
    audio.play().catch(() => {});

    const stopAt = () => {
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
    audio.pause();
    audio.src = "";
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = clip.start * audio.duration;
    } else {
      audio.currentTime = 0;
    }
    activeSounds.delete(entry);
  }
  const entry = { stop, audio };
  if (
    soundPath != "./ASSET/Sound/Enemies/Catalyst/CataOnCollapse.mp3" &&
    soundPath != "./ASSET/Sound/Enemies/Catalyst/CataScream_v3.mp3" &&
    soundPath != "./ASSET/Sound/Enemies/Catalyst/CataCutsceneOnBeacon.mp3" &&
    soundPath != "./ASSET/Sound/Enemies/ending_2.mp3" &&
    soundPath !=
      "./ASSET/Sound/Enemies/Celestial/Celestial_Cutscene_Music.ogg" &&
    soundPath != "./ASSET/Sound/Enemies/Celestial/Celestial_Intro.ogg" &&
    soundPath !=
      "./ASSET/Sound/Enemies/Celestial/Talking/Celestial_Talk_5.ogg" &&
    soundPath != "./ASSET/Sound/Enemies/BeaconSpawn.ogg" &&
    !soundPath.startsWith("./ASSET/Sound/Domasp/")
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

  setTimeout(() => {
    for (const { audio } of activeSounds) {
      audio.pause();
      audio.src = "";
    }
    activeSounds.clear();
  }, fadeDuration);
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
    end: 10000,
    src: "./ASSET/Sound/Music/Insurmountable_Abyss.mp3",
  },
  {
    start: 3000,
    end: 4099,
    src: "./ASSET/Sound/Music/It_Doesn't_End_Here.mp3",
  },
  {
    start: 10000,
    end: 0,
    src: "./ASSET/Sound/Music/AudioTHISWORLDWILLCOLLAPSE.ogg",
  },
];
let lobbyMusic = null;
let celestialMusic = null;
let forceCelestialMusic = false;
let startCelestialMusic = false;
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

  if (!forceCelestialMusic) {
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
}

/* ===== ESP ===== */
const espQueue = [];
export function ESP(x, y, size, text = "") {
  espQueue.push({ x, y, size, text });
}
export function drawESP(ctx) {
  ctx.save();

  ctx.strokeStyle = "#00ff00";
  ctx.fillStyle = "#00ff00";
  ctx.lineWidth = 2;
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  for (const e of espQueue) {
    ctx.strokeRect(
      Math.round(e.x - e.size / 2),
      Math.round(e.y - e.size / 2),
      Math.round(e.size),
      Math.round(e.size),
    );

    if (e.text) {
      ctx.textBaseline = "bottom";
      ctx.fillText(
        e.text,
        Math.round(e.x - e.size / 2 + 4),
        Math.round(e.y + e.size / 2 - 2),
      );
    }
  }

  ctx.restore();

  espQueue.length = 0;
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
  for (const py of pylonLocations) {
    if (
      mouse.x >= py[0] - (27 * TILE) / 2 &&
      mouse.x < py[0] + (27 * TILE) / 2 &&
      mouse.y >= py[1] - (27 * TILE) / 2 &&
      mouse.y < py[1] + (27 * TILE) / 2
    ) {
      return true;
    }
  }
  if (onCelestialIntro) return true;
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
          t.wall[0] ||
          (t.deco[0] && t.deco[1] && t.deco[3] >= 0.4 && t.deco[3] <= 0.6)
        )
          if (t.wall[1] == 6 || t.wall[1] == 66) {
            wallScale = 0.5;
          } else if (t.wall[1] == 36) {
            wallScale = 0.01;
          }
        if (t.highrise[0] && t.highrise[1] == 38) {
          scorched = true;
          scorchedTime++;
          if (scorchedTime >= 30) {
            death("Hazards");
          }
          clearTimeout(scorchedTimeout);
          scorchedTimeout = setTimeout(() => {
            scorched = false;
            scorchedTime = 0;
          }, 10000);
        }
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
  if (imageSrc) {
    if (!data) {
      data = {
        count: 0,
        img: imageSrc,
        desc: ENTITY_POOL.find((e) => e.name === name)?.desc || "",
      };
      map.set(name, data);
    }

    data.count++;
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
}

function renderPanel() {
  content.innerHTML = "";

  const sorted = [...entityCounts.entries()].sort((a, b) => {
    const curseA = ENTITY_POOL.find((e) => e.name === a[0])?.curseType ?? false;
    const curseB = ENTITY_POOL.find((e) => e.name === b[0])?.curseType ?? false;
    if (curseA === curseB) return 0;
    return curseA ? 1 : -1;
  });
  for (const [name, data] of sorted) {
    const slot = document.createElement("div");
    slot.className = "entity-slot";

    const img = document.createElement("img");
    img.src = data.img;
    img.alt = name;
    img.title = `${name}: ${data.desc}`;

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

function countPatterns(length) {
  let count = 0;
  for (const p of patternsState.values()) {
    if (p.pw === length && p.ph === length) count++;
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
function forceSpawn5x5(mouseWorld) {
  const base5x5 = PATTERNS.filter(
    (p) => p.length / SUPER_TILE === 5 && p[0].length / SUPER_TILE === 5,
  );

  if (!base5x5.length) return;

  const target = findReplacementSlot(mouseWorld);
  if (!target) return;

  destroyPattern(target);

  const shuffled = pickPatternsBySize(base5x5);
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
    const connectors = [8, 9, 29, 39];

    if (left) {
      const p = left.pattern;
      const pw = p[0].length;
      for (let y = 0; y < h; y++) {
        if (
          connectors.includes(p[y]?.[pw - 1]) &&
          connectors.includes(pat[y][0])
        )
          score++;
      }
    }

    if (right) {
      const p = right.pattern;
      for (let y = 0; y < h; y++) {
        if (
          connectors.includes(p[y]?.[0]) &&
          connectors.includes(pat[y][w - 1])
        )
          score++;
      }
    }

    if (top) {
      const p = top.pattern;
      const ph = p.length;
      for (let x = 0; x < w; x++) {
        if (
          connectors.includes(p[ph - 1]?.[x]) &&
          connectors.includes(pat[0][x])
        )
          score++;
      }
    }

    if (bot) {
      const p = bot.pattern;
      for (let x = 0; x < w; x++) {
        if (
          connectors.includes(p[0]?.[x]) &&
          connectors.includes(pat[h - 1][x])
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
  setGiftMultiplier(1);
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
export function spawnCelestialIntro() {
  stopAllSounds();
  soundStopped = false;
  setGiftMultiplier(1);
  onCelestial = true;
  onCelestialIntro = true;
  disableCollect = true;
  if (!shieldActive[0]) {
    activateShield();
  }
  if (!shieldActive[1]) {
    activateShield();
  }
  startCelestialIntro(entityHost);
  stopAllEntity = true;
  disablespawn = true;
  disableIceTile = true;
  highriseEnabled = false;
  collectedCountBeforeCelestial = actualCollectedCount;
  actualCollectedCount = 5000;
  collectedCount = hardMode
    ? actualCollectedCount
    : Math.floor(actualCollectedCount / 2);
  counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount}`;
  lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50))}`;
  forceCelestialMusic = true;
  if (stopMusic) {
    stopMusic();
    stopMusic = null;
  }
}
export function spawnCelestialAfterIntro() {
  celestialBG = true;
  startCelestialMusic = true;
  for (const [key, p] of patternsState) {
    destroyPattern(p);
    patternsState.delete(key);
  }
  setTimeout(() => {
    onCelestialIntro = false;
    disableCollect = false;
    if (chaosMode) {
      spawnCatalyst(entityHost);
      spawnCatalystIntro();
      registerEntitySpawn("Catalyst", "./ASSET/Enemies/CatalystIcon.png");
    }
    spawnCelestial(entityHost, hardMode, true);
    registerEntitySpawn("Celestial", "./ASSET/Enemies/Celestial.png");
  }, 1000);
}
export function startCelestialPhase4() {
  spawnTruePylons(entityHost);
  stopCollect = true;
  allGold = true;
  giftPositions.forEach((gift) => {
    if (gift.type === "gift") {
      gift.golden = true;
    }
  });
}
export function spawnCelestialEnding() {
  if (disableProgression) return;
  stopCollect = false;
  onCelestial = false;
  disableIceTile = false;
  highriseEnabled = true;
  forceCelestialMusic = false;
  startCelestialMusic = false;
  startCelestialOutro(entityHost);
  toggleImmortality(true);
  canvas.style.cursor = "none";
  entityCanvas.style.cursor = "none";
  entityCanvas2.style.cursor = "none";
  disableCollect = true;
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
  localStorage.setItem("Blossom", "true");
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
  SHAKE = false;
  sfxVolume = originalVolume[1];
  playSound(`./ASSET/Sound/Enemies/BeaconSpawn.ogg`);
  playSound(
    `./ASSET/Sound/Enemies/Celestial/Celestial_Cutscene_Music.ogg`,
    undefined,
    undefined,
    undefined,
    undefined,
    "50",
  );
  sfxVolume = 0;
  setTimeout(() => {
    if (chaosMode) {
      despawnCatalyst = true;
    }
    despawnCelestial = true;
    actualCollectedCount = collectedCountBeforeCelestial;
    latestCollectedCount = collectedCountBeforeCelestial;
    collectedCount = hardMode
      ? actualCollectedCount
      : Math.floor(actualCollectedCount / 2);
    counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount}`;
    lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50))}`;
    lastEntitySpawnAt = collectedCount;
  }, 2000);
  console.log(onCelestial);
}
export function spawnCelestialAfterEnding() {
  stopAllEntity = false;
  soundStopped = false;
  for (const [key, p] of patternsState) {
    destroyPattern(p);
    patternsState.delete(key);
  }
  celestialBG = false;
  musicVolume = originalVolume[0];
  sfxVolume = originalVolume[1];
  allGold = false;
  disablespawn = false;
  if (accurateCursor) {
    canvas.style.cursor = "none";
    entityCanvas.style.cursor = "none";
    entityCanvas2.style.cursor = "none";
  } else {
    canvas.style.cursor = "auto";
    entityCanvas.style.cursor = "auto";
    entityCanvas2.style.cursor = "auto";
  }
  setTimeout(() => {
    disableCollect = false;
    toggleImmortality(false);
  }, 2000);
}
/* ===== ALTARS ===== */
let lastAltar = null;
function ENTITY_SPAWN(
  temp = false,
  exceptEntity = null,
  chaosIncluded = false,
) {
  let name = null;
  let unlocked =
    chaosMode || chaosIncluded
      ? ENTITY_POOL.filter((e) => {
          if (e.name === "Celestial" || e.name === "Catalyst") return false;
          if (exceptEntity && e.name === exceptEntity) return false;
          if (e.curseType && spawnedCurses.has(e.name)) return false;
          return true;
        })
      : ENTITY_POOL.filter((e) => {
          if (e.chaosOnly) return false;
          if (collectedCount < e.start) return false;
          if (e.unstackable && spawnedUnstackables.has(e.name)) return false;
          if (exceptEntity && e.name === exceptEntity) return false;
          return true;
        });
  if (unlocked.length == 0) {
    unlocked = ENTITY_POOL.filter((e) => {
      if (e.chaosOnly) return false;
      if (e.start != 0) return false;
      return true;
    });
  }
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
          lastEntityPicked = pick.name;
          pickedOnce.add(pick.name);
          break;
        }
      }
    }
    if (pick.name === "Random") {
      const randUnlocked = chaosMode
        ? ENTITY_POOL.filter((e) => {
            if (e.name === "Celestial" || e.name === "Catalyst") return false;
            if (e.name === "Random") return false;
            if (e.curseType) return false;
            return true;
          })
        : ENTITY_POOL.filter((e) => {
            if (e.chaosOnly) return false;
            if (e.name === "Random") return false;
            if (collectedCount < e.start) return false;
            if (e.unstackable) return false;
            return true;
          });
      if (randUnlocked.length !== 0) {
        let randPick = randUnlocked[(Math.random() * randUnlocked.length) | 0];
        const unregister = randPick.spawn();
        if (!temp && typeof unregister === "function")
          trackHighestEntity(unregister, pick.start, pick.name);
        if (temp && typeof unregister === "function") {
          setTimeout(() => {
            unregister();
            spawnedUnstackables.delete(pick.name);
            spawnedCurses.delete(pick.name);

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
      if (!temp && typeof unregister === "function")
        trackHighestEntity(unregister, pick.start, pick.name);
      if (temp && typeof unregister === "function") {
        setTimeout(() => {
          unregister();
          spawnedUnstackables.delete(pick.name);
          spawnedCurses.delete(pick.name);

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
      if (!temp && typeof unregister === "function")
        trackHighestEntity(unregister, pick.start, pick.name);
      if (temp && typeof unregister === "function") {
        setTimeout(() => {
          unregister();
          spawnedUnstackables.delete(pick.name);
          spawnedCurses.delete(pick.name);

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
    if (collectedCount >= 1800 && !highriseEnabled) {
      highriseEnabled = true;
    }
    if (collectedCount >= 800 && !isIceTileEnabled) {
      isIceTileEnabled = true;
      if (!disableIceTile && passageGoldPattern == 0) {
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
      }
      setInterval(() => {
        if (!disableIceTile && passageGoldPattern == 0) {
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
        }
      }, 60000);
    }
    if (collectedCount >= 1000 && !isSeamineEnabled && !disablespawn) {
      isSeamineEnabled = true;
      for (let i = 1; i <= 10; i++) {
        if (i <= 5) {
          jumppadSpawns.push(spawnJumpPad(entityHost));
        } else if (i <= 8) {
          spawnJumpPad(entityHost, true);
        } else {
          spawnTriaOrb(entityHost);
        }
      }
      spawnSeamine(entityHost, casualMode, hardMode);
      spawnSeamine(entityHost, casualMode, hardMode);
      spawnSeamine(entityHost, casualMode, hardMode);
      spawnGrindrail(entityHost);
      spawnGrindrail(entityHost);
      spawnGrindrail(entityHost);
    }
    if (actualCollectedCount >= 3500 && !spawnedPylon && !disablespawn) {
      spawnedPylon = true;
      spawnPylons(entityHost);
    }
    if (pick.unstackable) {
      spawnedUnstackables.add(pick.name);
    }
    if (pick.curseType) {
      spawnedCurses.add(pick.name);
    }
  }
  return name;
}
export function activatePurgatory() {
  lastAltar = "Purgatory";
  const spawnCount =
    giftMultiplier < 3.4
      ? 5
      : giftMultiplier < 3.8
        ? 4
        : giftMultiplier < 4.2
          ? 3
          : giftMultiplier < 4.6
            ? 2
            : 1;
  giftMultiplier += 2;
  for (let i = 0; i < spawnCount; i++) {
    ENTITY_SPAWN(true);
  }
}
export function activateChaos() {
  giftMultiplier += 1;
  ENTITY_SPAWN(undefined, undefined, true);
}
export function activateChance(mode = "normal", outcome = null) {
  lastAltar = "Chance";
  let chance;
  if (outcome) {
    if (outcome == "positive") {
      chance = 1 + Math.floor(Math.random() * 4);
    } else if (outcome == "negative") {
      chance = 5 + Math.floor(Math.random() * 10);
    }
  } else {
    chance = Math.floor(Math.random() * 15);
  }
  switch (chance) {
    case 0:
      // No Tripmines For 1 Minute
      disableTripmine = true;
      giftPositions.forEach((gift) => {
        if (gift.type === "tripmine") {
          gift.type = "gift";
        }
      });
      setTimeout(() => {
        disableTripmine = false;
      }, 60000);
      break;
    case 1:
      // +0.5x Gift Multiplier Increase
      giftMultiplier += mode == "high" ? 0.75 : mode == "tweak" ? 0.25 : 0.5;
      break;
    case 2:
      // +0.75x Gift Multiplier Increase
      giftMultiplier += mode == "high" ? 1.25 : mode == "tweak" ? 0.5 : 0.75;
      break;
    case 3:
      // Flesh BEGONE
      fleshPositions.clear();
      slowness = false;
      if (fleshSpawns.length != 0) {
        const removeCount = mode == "high" ? 2 : 1;
        const indices = [...Array(fleshSpawns.length).keys()];
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const removed = [];
        indices
          .slice(0, removeCount)
          .sort((a, b) => b - a)
          .forEach((index) => {
            fleshSpawns[index]();
            fleshSpawns.splice(index, 1);
            removed.push(index);
          });
        setTimeout(() => {
          for (const index of removed) {
            fleshSpawns.push(spawnFlesh(entityHost, hardMode));
          }
        }, 60000);
      }
      break;
    case 4:
      // Extra Shield
      activateShield();
      break;
    case 5:
      // Payment 1000 Gift
      actualCollectedCount -= mode == "high" ? 2000 : 1000;
      collectedCount = hardMode
        ? actualCollectedCount
        : Math.floor(actualCollectedCount / 2);
      if (
        latestCollectedCount >= (hardMode ? 10000 : 5000) &&
        latestCollectedCount <= (hardMode ? 12500 : 6250)
      ) {
        counterEl.textContent = `Gift(s) Collected: ${-12500 + Math.floor(Math.random() * 25000)}`;
        lvlEl.textContent = `lvl 100`;
      } else {
        counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount}`;
        lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50))}`;
      }
      break;
    case 6:
      // Martpocalypse
      for (let i = 0; i < 6; i++) {
        const unregister = spawnMart(
          entityHost,
          hardMode,
          mode == "high" ? 2 : 1,
        );
        setTimeout(() => {
          unregister();
        }, 60000);
      }
      break;
    case 7:
      // 2 Random Enemies
      for (let i = 0; i < (mode == "high" ? 4 : 2); i++) ENTITY_SPAWN(true);
      break;
    case 8:
      // Mart and Springer
      fasterMart[0]++;
      fasterSpringer[0]++;
      break;
    case 9:
      // It's Here
      for (let i = 0; i < (mode == "high" ? 3 : 1); i++) {
        const unregister = spawnSpringer(entityHost, hardMode, 3);
        setTimeout(() => {
          unregister();
        }, 60000);
      }
      break;
    case 10:
      // 40% Less Jump Pads
      if (jumppadSpawns.length != 0) {
        const removeCount = Math.max(
          1,
          Math.floor(jumppadSpawns.length * (mode == "high" ? 1 : 0.4)),
        );
        const indices = [...Array(jumppadSpawns.length).keys()];
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const removed = [];
        indices
          .slice(0, removeCount)
          .sort((a, b) => b - a)
          .forEach((index) => {
            jumppadSpawns[index]();
            jumppadSpawns.splice(index, 1);
            removed.push(index);
          });
        setTimeout(() => {
          for (const index of removed) {
            jumppadSpawns.push(spawnJumpPad(entityHost));
          }
        }, 60000);
      }
      break;
    case 11:
      // 60% Less Jump Pads
      if (jumppadSpawns.length != 0) {
        const removeCount = Math.max(
          1,
          Math.floor(jumppadSpawns.length * (mode == "high" ? 1 : 0.6)),
        );
        const indices = [...Array(jumppadSpawns.length).keys()];
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const removed = [];
        indices
          .slice(0, removeCount)
          .sort((a, b) => b - a)
          .forEach((index) => {
            jumppadSpawns[index]();
            jumppadSpawns.splice(index, 1);
            removed.push(index);
          });
        setTimeout(() => {
          for (const index of removed) {
            jumppadSpawns.push(spawnJumpPad(entityHost));
          }
        }, 60000);
      }
      break;
    case 12:
      // 40% More Seamines
      for (let i = 0; i < (mode == "high" ? 3 : 1); i++) {
        const unregister = spawnSeamine(entityHost, casualMode, hardMode);
        setTimeout(() => {
          unregister();
        }, 60000);
      }
      break;
    case 13:
      // 60% More Seamines
      for (let i = 0; i < (mode == "high" ? 4 : 2); i++) {
        const unregister = spawnSeamine(entityHost, casualMode, hardMode);
        setTimeout(() => {
          unregister();
        }, 60000);
      }
      break;
    case 14:
      // Oops, all Flesh!
      fleshPositions.add({
        x: 0,
        y: 0,
        until: performance.now() + 25000,
        oopsAllFlesh: true,
      });
      for (let i = 0; i < (mode == "high" ? 3 : 1); i++) {
        const unregister = spawnFlesh(entityHost, hardMode);
        setTimeout(() => {
          unregister();
        }, 60000);
      }
      break;
  }
  return chance;
}
export function activateProtection(echo = false) {
  if (echo) {
    activateShield();
    return;
  }
  lastAltar = "Protection";
  if (
    actualCollectedCount >= 1000 &&
    (shieldActive[0] === false ||
      shieldActive[1] === false ||
      shieldActive[2] === false ||
      shieldActive[3] === false ||
      shieldActive[4] === false)
  ) {
    actualCollectedCount -= 1000;
    collectedCount = hardMode
      ? actualCollectedCount
      : Math.floor(actualCollectedCount / 2);
    if (
      latestCollectedCount >= (hardMode ? 10000 : 5000) &&
      latestCollectedCount <= (hardMode ? 12500 : 6250)
    ) {
      counterEl.textContent = `Gift(s) Collected: ${-12500 + Math.floor(Math.random() * 25000)}`;
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
export function activatePassage(echo = false) {
  if (echo) {
    if (!disableCollect)
      actualCollectedCount += 100 + Math.floor(Math.random() * 5) * 100;
    if (actualCollectedCount > 10000) actualCollectedCount = 10000;
    collectedCount = hardMode
      ? actualCollectedCount
      : Math.floor(actualCollectedCount / 2);
    if (
      latestCollectedCount >= (hardMode ? 10000 : 5000) &&
      latestCollectedCount <= (hardMode ? 12500 : 6250)
    ) {
      counterEl.textContent = `Gift(s) Collected: ${-12500 + Math.floor(Math.random() * 25000)}`;
      lvlEl.textContent = `lvl 100`;
    } else {
      counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount}`;
      lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50))}`;
    }
    lastEntitySpawnAt = collectedCount;
    return;
  }
  lastAltar = "Passage";
  passageGoldPattern += 10;
  setTimeout(() => {
    passageGoldPattern += 5;
  }, 6000);
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
      activateProtection(true);
      break;
    case "Chance":
      activateChance();
      break;
    case "Passage":
      activatePassage(true);
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
  if (highestEntitySpawned.length === 0) return false;
  const index = (Math.random() * highestEntitySpawned.length) | 0;
  const chosen = highestEntitySpawned[index];
  const replacedEntity = chosen.name;

  chosen.unregister();
  spawnedUnstackables.delete(chosen.name);
  spawnedCurses.delete(chosen.name);

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
  actualCollectedCount -= chosen.start / 2;
  collectedCount = hardMode
    ? actualCollectedCount
    : Math.floor(actualCollectedCount / 2);
  if (
    latestCollectedCount >= (hardMode ? 10000 : 5000) &&
    latestCollectedCount <= (hardMode ? 12500 : 6250)
  ) {
    counterEl.textContent = `Gift(s) Collected: ${-12500 + Math.floor(Math.random() * 25000)}`;
    lvlEl.textContent = `lvl 100`;
  } else {
    counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount}`;
    lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50))}`;
  }
  return [replacedEntity, newEntity, chosen.start / 2];
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
        pattern[y][x] === 8 ||
        pattern[y][x] === 9 ||
        pattern[y][x] === 10 ||
        pattern[y][x] === 11 ||
        pattern[y][x] === 12 ||
        pattern[y][x] === 13 ||
        pattern[y][x] === 14 ||
        pattern[y][x] === 15 ||
        pattern[y][x] === 16 ||
        pattern[y][x] === 21 ||
        pattern[y][x] === 22 ||
        pattern[y][x] === 25 ||
        pattern[y][x] === 29 ||
        pattern[y][x] === 31 ||
        pattern[y][x] === 32 ||
        pattern[y][x] === 33 ||
        pattern[y][x] === 34 ||
        pattern[y][x] === 35 ||
        pattern[y][x] === 36 ||
        pattern[y][x] === 37 ||
        pattern[y][x] === 38 ||
        pattern[y][x] === 39 ||
        pattern[y][x] === 41 ||
        pattern[y][x] === 42 ||
        pattern[y][x] === 66
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
            pattern[y][x] === 15 ||
            pattern[y][x] === 16,
          garden: pattern[y][x] === 13,
          wall: [
            pattern[y][x] === 6 || pattern[y][x] === 36 || pattern[y][x] === 66,
            pattern[y][x],
          ],
          ice:
            pattern[y][x] === 21 ||
            pattern[y][x] === 22 ||
            pattern[y][x] === 25 ||
            pattern[y][x] === 29,
          highrise: [
            pattern[y][x] === 31 ||
              pattern[y][x] === 32 ||
              pattern[y][x] === 33 ||
              pattern[y][x] === 34 ||
              pattern[y][x] === 35 ||
              pattern[y][x] === 37 ||
              pattern[y][x] === 38 ||
              pattern[y][x] === 39 ||
              pattern[y][x] === 41 ||
              pattern[y][x] === 42,
            pattern[y][x],
          ],
          deco: [
            pattern[y][x] === 1 || pattern[y][x] === 13,
            Math.random() <
              Math.min(
                0.05,
                Math.max(0.01, Number(graphicsSlider.value) * 0.025),
              ) *
                (pattern[y][x] === 13 ? 5 : 1),
            Math.random(),
            Math.random(),
            Math.random() <
              Math.min(
                0.05,
                Math.max(0.01, Number(graphicsSlider.value) * 0.025),
              ),
            Math.random() < 0.5,
          ],
          collapsing: [false, false],
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
        pattern[y][x] === 29 ||
        pattern[y][x] === 32 ||
        pattern[y][x] === 35 ||
        pattern[y][x] === 39 ||
        pattern[y][x] === 42
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
                  0.05, // 0-5%
                ))
          )
            type = "tripmine";
          else type = "gift"; // 100-95%
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
      if (v === 4 || v === 5 || v === 14 || v === 15 || v === 16 || v === 25) {
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

let lastPicked4or5 = { x: 0, y: 0 };
export function pickRandomPlaced4or5(minRadius = 0) {
  while (true) {
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

    if (lastPicked4or5.x != worldX || lastPicked4or5.y != worldY) {
      lastPicked4or5 = { x: worldX, y: worldY };
      return { x: worldX, y: worldY };
    }
  }
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

  if (showSkybox && !epilepticMode) {
    scrollSkybox -= 5;
    if (scrollSkybox <= -window.innerWidth) {
      scrollSkybox += window.innerWidth;
    }
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.drawImage(
      skybox,
      -camX + scrollSkybox,
      -camY,
      window.innerWidth,
      window.innerHeight,
    );
    ctx.drawImage(
      skybox,
      -camX + scrollSkybox + window.innerWidth,
      -camY,
      window.innerWidth,
      window.innerHeight,
    );
    ctx.restore();
  }
  if (OblivionActive) {
    scrollOblivion -= 20;
    if (scrollOblivion <= -window.innerHeight) {
      scrollOblivion += window.innerHeight;
    }
    ctx.save();
    ctx.globalAlpha = OblivionActive * 0.5;
    ctx.drawImage(
      oblivionBGimg,
      -camX,
      -camY + scrollOblivion,
      window.innerWidth,
      window.innerHeight,
    );
    ctx.drawImage(
      oblivionBGimg,
      -camX,
      -camY + scrollOblivion + window.innerHeight,
      window.innerWidth,
      window.innerHeight,
    );
    ctx.restore();
  }
  if (celestialBG) {
    scrollCelestial -= 5;
    if (scrollCelestial <= -window.innerWidth) {
      scrollCelestial += window.innerWidth;
    }
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.drawImage(
      celestialBGimg,
      -camX + scrollCelestial,
      -camY,
      window.innerWidth,
      window.innerHeight,
    );
    ctx.drawImage(
      celestialBGimg,
      -camX + scrollCelestial + window.innerWidth,
      -camY,
      window.innerWidth,
      window.innerHeight,
    );

    const centerX = -camX + window.innerWidth / 2;
    const centerY = -camY + window.innerHeight / 2;
    const lookStrength = -0.05;
    const cx = centerX + (mouse.x - centerX) * lookStrength;
    const cy = centerY + (mouse.y - centerY) * lookStrength;
    if (Number.isFinite(cx) && Number.isFinite(cy)) {
      const grad = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        Math.min(window.innerWidth, window.innerHeight) * 0.5,
      );
      grad.addColorStop(0, "rgba(0, 0, 0, 1)");
      grad.addColorStop(0.1, "rgba(0, 0, 0, 1)");
      grad.addColorStop(0.101, "rgba(255, 0, 192, 0.5)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        Math.min(window.innerWidth, window.innerHeight) * 0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  }

  // Floors (existing culling is fine, but ensure RENDER_RADIUS isn't too large)
  if (showFloor) {
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
          if (
            ddx * ddx + ddy * ddy <
            (f.oopsAllFlesh ? Infinity : (TILE * 3) ** 2)
          ) {
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
      if (!t.diorite && !t.wood && !t.ice && isEdge && !t.collapsing[1]) {
        ctx.fillStyle =
          t.wall[0] || t.highrise[0]
            ? "#222"
            : corrupted || t.passageGoldPattern || t.deco[4]
              ? "#800"
              : "#666";
        ctx.fillRect(
          t.x - TILE * 0.1,
          t.y - TILE * 0.1,
          TILE * 1.2,
          TILE * 1.2,
        );
      }
      if (t.ice) {
        const h = TILE / 2;

        // top-left
        ctx.fillStyle = corrupted
          ? `rgba(${90 + Math.random() * 60}, 0, 0, 1)`
          : "#77f";
        ctx.fillRect(t.x + h, t.y - h, h, h);
        ctx.fillRect(t.x - h, t.y + h, h, h);
        ctx.fillRect(t.x + h, t.y + h, h, h);

        // top-right
        ctx.fillStyle = corrupted
          ? `rgba(${90 + Math.random() * 60}, 0, 0, 1)`
          : "#88f";
        ctx.fillRect(t.x, t.y - h, h, h);
        ctx.fillRect(t.x, t.y + h, h, h);
        ctx.fillRect(t.x + 2 * h, t.y + h, h, h);

        // bottom-left
        ctx.fillStyle = corrupted
          ? `rgba(${90 + Math.random() * 60}, 0, 0, 1)`
          : "#87f";
        ctx.fillRect(t.x - h, t.y, h, h);
        ctx.fillRect(t.x + h, t.y, h, h);
        ctx.fillRect(t.x + h, t.y + 2 * h, h, h);

        // bottom-right
        ctx.fillStyle = corrupted
          ? `rgba(${90 + Math.random() * 60}, 0, 0, 1)`
          : "#98f";
        ctx.fillRect(t.x, t.y, h, h);
        ctx.fillRect(t.x + 2 * h, t.y, h, h);
        ctx.fillRect(t.x, t.y + 2 * h, h, h);
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
          if (
            ddx * ddx + ddy * ddy <
            (f.oopsAllFlesh ? Infinity : (TILE * 3) ** 2)
          ) {
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
      if (
        !t.diorite &&
        !t.wood &&
        !t.ice &&
        isEdge &&
        t.deco[4] &&
        !t.wall[0] &&
        !t.highrise[0] &&
        !t.collapsing[1]
      ) {
        ctx.save();

        // center of tile (IMPORTANT)
        ctx.translate(t.x + TILE / 2, t.y + TILE / 2);
        ctx.scale(0.5, 0.5);

        const half = TILE * 1.75;
        const step = TILE * 0.8; // evenly spaced across edge

        const placements = [];

        // top edge (facing up)
        for (let i = -1; i <= 1; i++) {
          placements.push([
            i * step,
            -half + 10 * Math.abs(i),
            -Math.PI / 2 + (i * Math.PI) / 6,
          ]);
        }

        // bottom edge (facing down)
        for (let i = -1; i <= 1; i++) {
          placements.push([
            i * step,
            half - 10 * Math.abs(i),
            Math.PI / 2 - (i * Math.PI) / 6,
          ]);
        }

        // left edge (facing left)
        for (let i = -1; i <= 1; i++) {
          placements.push([
            -half + 10 * Math.abs(i),
            i * step,
            Math.PI - (i * Math.PI) / 6,
          ]);
        }

        // right edge (facing right)
        for (let i = -1; i <= 1; i++) {
          placements.push([
            half - 10 * Math.abs(i),
            i * step,
            0 + (i * Math.PI) / 6,
          ]);
        }

        for (const [ox, oy, rot] of placements) {
          ctx.save();
          ctx.translate(ox, oy);
          ctx.rotate(rot + Math.PI / 2);

          // leaf shape
          ctx.beginPath();
          ctx.moveTo(0, -20);
          ctx.bezierCurveTo(15, -10, 20, 10, 0, 25);
          ctx.bezierCurveTo(-20, 10, -15, -10, 0, -20);
          ctx.closePath();

          ctx.fillStyle = "#900";
          ctx.fill();

          ctx.strokeStyle = "#700";
          ctx.lineWidth = 4;
          ctx.stroke();

          // center vein
          ctx.beginPath();
          ctx.moveTo(0, -20);
          ctx.lineTo(0, 25);
          ctx.stroke();

          // side veins
          ctx.beginPath();
          ctx.moveTo(0, 3);
          ctx.lineTo(10, -5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, 10);
          ctx.lineTo(-12, 2);
          ctx.stroke();

          ctx.restore();
        }

        ctx.restore();
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

          if (
            ddx * ddx + ddy * ddy <
            (f.oopsAllFlesh ? Infinity : (TILE * 3) ** 2)
          ) {
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

      if (t.collapsing[1]) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(
          t.x + (Math.random() - 0.5) * 5,
          t.y + (Math.random() - 0.5) * 5,
          TILE,
          TILE,
        );
      } else if (corrupted) {
        ctx.fillStyle = `rgba(${90 + Math.random() * 60}, 0, 0, 1)`;
        ctx.fillRect(t.x, t.y, TILE, TILE);
      } else {
        if (t.passageGoldPattern) {
          const h = TILE / 2;

          // top-left
          ctx.fillStyle = "#800";
          ctx.fillRect(t.x, t.y, h, h);

          // top-right
          ctx.fillStyle = "#600";
          ctx.fillRect(t.x + h, t.y, h, h);

          // bottom-left
          ctx.fillStyle = "#600";
          ctx.fillRect(t.x, t.y + h, h, h);

          // bottom-right
          ctx.fillStyle = "#800";
          ctx.fillRect(t.x + h, t.y + h, h, h);
        } else if (t.diorite) {
          const h = TILE / 2;

          // top-left
          ctx.fillStyle = "#778";
          ctx.fillRect(t.x, t.y, h, h);

          // top-right
          ctx.fillStyle = "#658";
          ctx.fillRect(t.x + h, t.y, h, h);

          // bottom-left
          ctx.fillStyle = "#557";
          ctx.fillRect(t.x, t.y + h, h, h);

          // bottom-right
          ctx.fillStyle = "#446";
          ctx.fillRect(t.x + h, t.y + h, h, h);
        } else if (t.wood) {
          const h = TILE / 2;

          // left
          ctx.fillStyle = "#844";
          ctx.fillRect(t.x, t.y, h, TILE);

          // right
          ctx.fillStyle = "#744";
          ctx.fillRect(t.x + h, t.y, h, TILE);
        } else if (t.garden) {
          ctx.fillStyle = "#800";
          ctx.fillRect(t.x, t.y, TILE, TILE);
        } else if (t.wall[0]) {
          if (t.wall[1] == 6 || t.wall[1] == 66) {
            ctx.fillStyle = "#aaa";
          } else if (t.wall[1] == 36) {
            ctx.fillStyle = "#444";
          }
          ctx.fillRect(t.x, t.y, TILE, TILE);
        } else if (t.ice) {
        } else if (t.highrise[0]) {
          if (
            t.highrise[1] == 31 ||
            t.highrise[1] == 32 ||
            t.highrise[1] == 39
          ) {
            ctx.fillStyle = "#888";
            ctx.fillRect(t.x, t.y, TILE, TILE);
            ctx.fillStyle = "#222";
            ctx.fillRect(
              t.x - TILE * 0.01,
              t.y + TILE * 0.05,
              TILE * 0.46,
              TILE * 0.4,
            );
            ctx.fillRect(
              t.x + TILE * 0.55,
              t.y + TILE * 0.05,
              TILE * 0.46,
              TILE * 0.4,
            );
            ctx.fillRect(
              t.x + TILE * 0.05,
              t.y + TILE * 0.55,
              TILE * 0.9,
              TILE * 0.4,
            );
          }
          if (t.highrise[1] == 33) {
            ctx.fillStyle = "#444";
            ctx.fillRect(t.x, t.y, TILE, TILE);
            ctx.fillStyle = "#222";
            ctx.fillRect(
              t.x + TILE * 0.125,
              t.y + TILE * 0.125,
              TILE * 0.75,
              TILE * 0.75,
            );
          }
          if (t.highrise[1] == 34 || t.highrise[1] == 35) {
            const h = TILE / 2;
            ctx.fillStyle = "#800";
            ctx.fillRect(t.x, t.y, h, h);
            ctx.fillStyle = "#700";
            ctx.fillRect(t.x + h, t.y, h, h);
            ctx.fillStyle = "#700";
            ctx.fillRect(t.x, t.y + h, h, h);
            ctx.fillStyle = "#800";
            ctx.fillRect(t.x + h, t.y + h, h, h);
          }
          if (t.highrise[1] == 37) {
            const h = TILE / 2;
            ctx.fillStyle = "#999";
            ctx.fillRect(t.x, t.y, h, h);
            ctx.fillStyle = "#888";
            ctx.fillRect(t.x + h, t.y, h, h);
            ctx.fillStyle = "#777";
            ctx.fillRect(t.x, t.y + h, h, h);
            ctx.fillStyle = "#666";
            ctx.fillRect(t.x + h, t.y + h, h, h);
          }
          if (t.highrise[1] == 38) {
            const h = TILE / 2;
            const rand1 = Math.floor(4 + Math.random() * 5);
            const rand2 = Math.floor(4 + Math.random() * 5);
            ctx.fillStyle = `#f${rand1}0`;
            ctx.fillRect(t.x, t.y, h, h);
            ctx.fillStyle = `#f${rand2}0`;
            ctx.fillRect(t.x + h, t.y, h, h);
            ctx.fillStyle = `#f${rand2}0`;
            ctx.fillRect(t.x, t.y + h, h, h);
            ctx.fillStyle = `#f${rand1}0`;
            ctx.fillRect(t.x + h, t.y + h, h, h);
          }
          if (t.highrise[1] == 41 || t.highrise[1] == 42) {
            const h = TILE / 2;
            ctx.fillStyle = "#444";
            ctx.fillRect(t.x, t.y, h, h);
            ctx.fillStyle = "#222";
            ctx.fillRect(t.x + h, t.y, h, h);
            ctx.fillStyle = "#222";
            ctx.fillRect(t.x, t.y + h, h, h);
            ctx.fillStyle = "#444";
            ctx.fillRect(t.x + h, t.y + h, h, h);
          }
        } else {
          const h = TILE / 2;

          // top-left
          ctx.fillStyle = "#888";
          ctx.fillRect(t.x, t.y, h, h);

          // top-right
          ctx.fillStyle = "#222";
          ctx.fillRect(t.x + h, t.y, h, h);

          // bottom-left
          ctx.fillStyle = "#222";
          ctx.fillRect(t.x, t.y + h, h, h);

          // bottom-right
          ctx.fillStyle = "#888";
          ctx.fillRect(t.x + h, t.y + h, h, h);
        }
      }

      if (t.collapsing[0]) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = Math.max(1, TILE * 0.05);

        const rand = (n) => {
          const x = Math.sin(Math.random() * 1000 + n * 91.73) * 43758.5453;
          return x - Math.floor(x);
        };

        const side = Math.floor(rand(0) * 4);

        let x, y, dx, dy;

        if (side === 0) {
          x = t.x;
          y = t.y + rand(1) * TILE;
          dx = 1;
          dy = 0;
        } else if (side === 1) {
          x = t.x + TILE;
          y = t.y + rand(1) * TILE;
          dx = -1;
          dy = 0;
        } else if (side === 2) {
          x = t.x + rand(1) * TILE;
          y = t.y;
          dx = 0;
          dy = 1;
        } else {
          x = t.x + rand(1) * TILE;
          y = t.y + TILE;
          dx = 0;
          dy = -1;
        }

        ctx.beginPath();
        ctx.moveTo(x, y);

        for (let i = 0; i < 6; i++) {
          x += dx * TILE * 0.15 + (rand(i + 2) - 0.5) * TILE * 0.2;
          y += dy * TILE * 0.15 + (rand(i + 20) - 0.5) * TILE * 0.2;
          ctx.lineTo(x, y);

          if (rand(i + 40) < 0.35) {
            ctx.moveTo(x, y);
            ctx.lineTo(
              x + (rand(i + 60) - 0.5) * TILE * 0.3,
              y + (rand(i + 80) - 0.5) * TILE * 0.3,
            );
            ctx.moveTo(x, y);
          }
        }

        ctx.stroke();
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
          if (
            ddx * ddx + ddy * ddy <
            (f.oopsAllFlesh ? Infinity : (TILE * 3) ** 2)
          ) {
            corrupted = true;
            break;
          }
        }
      }

      if (
        !corrupted &&
        !t.diorite &&
        !t.wood &&
        !t.collapsing[1] &&
        t.deco[0] &&
        t.deco[1]
      ) {
        let variant = 1;
        if (t.deco[2] > 0.667) variant = 3;
        else if (t.deco[2] > 0.333) variant = 2;
        else variant = 1;

        const cx = t.x + TILE / 2;
        const cy = t.y + TILE / 2;
        const s = TILE * 0.5;

        const r = t.garden ? (t.deco[5] ? 0.6 : 0.8) : t.deco[3]; // stable random

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
            ctx.ellipse(
              ox,
              oy + s * 0.5,
              s * 0.25,
              s * 0.12,
              0,
              0,
              Math.PI * 2,
            );
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
          ctx.fillRect(
            cx - TILE * 0.1,
            cy - TILE * 0.45,
            TILE * 0.2,
            TILE * 0.5,
          );

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
            ctx.fillStyle = "#700";
            ctx.beginPath();
            ctx.moveTo(cx, topY);
            ctx.lineTo(cx - w, cy - y);
            ctx.lineTo(cx, cy - y);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#900";
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
          const r = TILE * 0.5;

          ctx.save();
          ctx.translate(cx, cy + 5);

          ctx.beginPath();
          ctx.rect(-r * 2, -r, r * 4, r * 1.2);
          ctx.clip();

          function drawSpikeShape(scale) {
            ctx.save();
            ctx.scale(scale, scale);

            ctx.beginPath();
            const spikes = 10;
            for (let i = 0; i < spikes * 2; i++) {
              const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
              const rr = i & 1 ? r * 0.75 : r;

              const x = Math.cos(a) * rr;
              const y = Math.sin(a) * rr;

              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            ctx.restore();
          }

          ctx.fillStyle = "#900";
          drawSpikeShape(1);

          ctx.fillStyle = "#700";
          drawSpikeShape(0.667);

          ctx.restore();
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
      if (t.wall[0] && t.wall[1] == 66) {
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.moveTo(t.x + TILE * 0.5, t.y - TILE * 0.75);
        ctx.lineTo(t.x + TILE * 1.75, t.y + TILE * 0.5);
        ctx.lineTo(t.x + TILE * 0.5, t.y + TILE * 1.75);
        ctx.lineTo(t.x - TILE * 0.75, t.y + TILE * 0.5);
        ctx.closePath();
        ctx.fill();
        function roundRect(cx, cy, w, h, r, rot) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rot);
          ctx.beginPath();
          ctx.moveTo(-w / 2 + r, -h / 2);
          ctx.lineTo(w / 2 - r, -h / 2);
          ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
          ctx.lineTo(w / 2, h / 2 - r);
          ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
          ctx.lineTo(-w / 2 + r, h / 2);
          ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
          ctx.lineTo(-w / 2, -h / 2 + r);
          ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
          ctx.closePath();
          ctx.fill();
          const grad = ctx.createRadialGradient(
            0,
            0,
            0,
            0,
            0,
            Math.max(w, h) * 0.5,
          );
          grad.addColorStop(0, "rgba(255,255,255,0)");
          grad.addColorStop(0.65, "rgba(0,0,0,0)");
          grad.addColorStop(1, "rgba(0,0,0,0.25)");
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.restore();
        }
        function rect(cx, cy, w, h, rot) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rot);
          ctx.fillRect(-w / 2, -h / 2, w, h);
          const grad = ctx.createRadialGradient(
            0,
            0,
            0,
            0,
            0,
            Math.max(w, h) * 0.5,
          );
          grad.addColorStop(0, "rgba(255,255,255,0)");
          grad.addColorStop(0.65, "rgba(0,0,0,0)");
          grad.addColorStop(1, "rgba(0,0,0,0.25)");
          ctx.fillStyle = grad;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.restore();
        }
        // right leg
        ctx.fillStyle = "#555";
        rect(t.x + TILE * 0.9, t.y + TILE * 0, TILE * 0.5, TILE * 1.25, -0.3);
        // left arm
        ctx.fillStyle = "#555";
        rect(t.x - TILE * 0.1, t.y - TILE * 2.2, TILE * 0.5, TILE * 1.25, -0.2);
        // body
        ctx.fillStyle = "#666";
        rect(t.x + TILE * 0.5, t.y - TILE * 1.2, TILE * 1, TILE * 1.25, 0.1);
        // left leg
        ctx.fillStyle = "#777";
        rect(t.x + TILE * 0, t.y - TILE * 0.3, TILE * 0.5, TILE * 1.25, 0.05);
        // right arm
        ctx.fillStyle = "#777";
        rect(t.x + TILE * 1.3, t.y - TILE * 1, TILE * 0.5, TILE * 1.25, -0.1);
        // head
        ctx.fillStyle = "#777";
        roundRect(
          t.x + TILE * 0.7,
          t.y - TILE * 2.05,
          TILE * 0.6,
          TILE * 0.6,
          TILE * 0.2,
          0.5,
        );
        // gift
        ctx.fillStyle = "#505";
        rect(t.x - TILE * 0.3, t.y - TILE * 3.2, TILE * 0.75, TILE * 0.75, 0.2);
        ctx.fillStyle = "#606";
        rect(t.x - TILE * 0.25, t.y - TILE * 3.5, TILE * 0.85, TILE * 0.2, 0.2);
        // left bow loop
        ctx.strokeStyle = "#707";
        ctx.lineWidth = TILE * 0.05;
        ctx.save();
        ctx.translate(t.x - TILE * 0.35, t.y - TILE * 3.65);
        ctx.rotate(0.8);
        ctx.beginPath();
        ctx.ellipse(0, 0, TILE * 0.16, TILE * 0.08, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        // right bow loop
        ctx.save();
        ctx.translate(t.x - TILE * 0.1, t.y - TILE * 3.6);
        ctx.rotate(-0.3);
        ctx.beginPath();
        ctx.ellipse(0, 0, TILE * 0.16, TILE * 0.08, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
  if (cursorOnCorruptedTile && !slowness && !slownessCooldown) {
    slownessTime = 0;
    slowness = true;
    playSound("./ASSET/Sound/Enemies/Flesh/Flesh_Effect_Apply.ogg");
  }
  slownessTime++;
  if (slownessTime >= 90 && slowness) {
    slowness = false;
    playSound("./ASSET/Sound/Enemies/Flesh/Flesh_Effect_End.ogg");
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
  if (showGrids) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
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

  if (scorched) {
    const cx = mouse._clientX - w * 0.5;
    const cy = mouse._clientY - h * 0.5;

    const len = Math.hypot(cx, cy) || 1;

    vx = -(cx / len) * MAX_SPEED;
    vy = -(cy / len) * MAX_SPEED;

    edgeFactorX = 1;
    edgeFactorY = 1;
  } else {
    if (!wasdMode) {
      cameraRadius = spaceHeld ? 0.49 : 0.4;
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
    } else {
      if (keysPressed["w"] || keysPressed["arrowup"]) {
        vy = MAX_SPEED * 0.667;
        edgeFactorY = 1;
      }
      if (keysPressed["s"] || keysPressed["arrowdown"]) {
        vy = -MAX_SPEED * 0.667;
        edgeFactorY = 1;
      }
      if (keysPressed["a"] || keysPressed["arrowleft"]) {
        vx = MAX_SPEED * 0.667;
        edgeFactorX = 1;
      }
      if (keysPressed["d"] || keysPressed["arrowright"]) {
        vx = -MAX_SPEED * 0.667;
        edgeFactorX = 1;
      }
      if (
        (keysPressed["w"] || keysPressed["arrowup"]) &&
        (keysPressed["s"] || keysPressed["arrowdown"])
      ) {
        vy = 0;
        edgeFactorY = 0;
      }
      if (
        (keysPressed["a"] || keysPressed["arrowleft"]) &&
        (keysPressed["d"] || keysPressed["arrowright"])
      ) {
        vx = 0;
        edgeFactorX = 0;
      }
    }
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
  const slowScale = slowness ? 0.333 : 1;
  const settingScale = settingsPanel.style.display === "block" ? 0.01 : 1;
  const disableCollectScale = disableCollect ? 0.01 : 1;
  const extremeScale = hardMode ? 0.667 : 1;
  const ultrafastScale = ultrafastmode ? 3 : 1;
  const spaceHeldScale = spaceHeld || wasdMode ? 1.5 : 1;
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
      speedBoostScale *
      extremeScale *
      ultrafastScale *
      spaceHeldScale *
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
      speedBoostScale *
      extremeScale *
      ultrafastScale *
      spaceHeldScale *
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
      disableCollectScale *
      speedBoostScale *
      extremeScale *
      ultrafastScale *
      spaceHeldScale;
    camY +=
      vy *
      motionScale *
      slowScale *
      settingScale *
      voidScale *
      seamineScale *
      grindrailScale *
      wallScale *
      disableCollectScale *
      speedBoostScale *
      extremeScale *
      ultrafastScale *
      spaceHeldScale;
  }
  // camera smoothing
  camX += camVX;
  camY += camVY;
  camVX *= iceEffect ? 0.96 : 0.88;
  camVY *= iceEffect ? 0.96 : 0.88;

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

      let insidePylon = false;
      for (const py of pylonLocations) {
        if (
          mouse.x >= py[0] - (27 * TILE) / 2 &&
          mouse.x < py[0] + (27 * TILE) / 2 &&
          mouse.y >= py[1] - (27 * TILE) / 2 &&
          mouse.y < py[1] + (27 * TILE) / 2
        ) {
          insidePylon = true;
        }
      }

      if (g.type === "tripmine" && !insidePylon) {
        tripmineExplosion = {
          x: g.x + TILE / 2,
          y: g.y + TILE / 2,
          t: performance.now(),
        };
        playSound("./ASSET/Sound/Enemies/Tripmine/subspace-tripmine.mp3");
        continue;
      }

      const value =
        (g.golden ? 4 : 1) *
        (Math.floor(giftMultiplier) +
          (Math.random() < giftMultiplier % 1 ? 1 : 0));
      if (!disableCollect && !insidePylon && !stopCollect) {
        actualCollectedCount += value;
        if (performance.now() - lastGiftCollectSound >= 100) {
          lastGiftCollectSound = performance.now();
          if (g.golden) {
            if (Math.random() > 0.00001) {
              playSound("./ASSET/Sound/Global/GoldGiftCollect.ogg");
            } else {
              playSound("./ASSET/Sound/Global/RareGoldGiftCollect.ogg");
            }
          } else {
            playSound("./ASSET/Sound/Global/GiftCollect.ogg");
          }
        }
      }
      collectedCount = hardMode
        ? actualCollectedCount
        : Math.floor(actualCollectedCount / 2);
      if (
        latestCollectedCount >= (hardMode ? 10000 : 5000) &&
        latestCollectedCount <= (hardMode ? 12500 : 6250)
      ) {
        counterEl.textContent = `Gift(s) Collected: ${-12500 + Math.floor(Math.random() * 25000)}`;
        lvlEl.textContent = `lvl 100`;
      } else {
        counterEl.textContent = `Gift(s) Collected: ${actualCollectedCount}`;
        lvlEl.textContent = `Lvl ${Math.floor(latestCollectedCount / (hardMode ? 100 : 50))}`;
      }

      if (actualCollectedCount >= 3500 && !spawnedPylon && !disablespawn) {
        spawnedPylon = true;
        spawnPylons(entityHost);
      }
      if (
        Math.floor(collectedCount / 100) >
          Math.floor(lastEntitySpawnAt / 100) ||
        (!hardMode && collectedCount >= 50 && lastEntitySpawnAt < 50)
      ) {
        lastEntitySpawnAt = collectedCount;

        const unlocked = chaosMode
          ? ENTITY_POOL.filter((e) => {
              if (e.name === "Celestial" || e.name === "Catalyst") return false;
              if (e.curseType && spawnedCurses.has(e.name)) return false;
              return true;
            })
          : ENTITY_POOL.filter((e) => {
              if (e.chaosOnly) return false;
              if (collectedCount < e.start) return false;
              if (e.unstackable && spawnedUnstackables.has(e.name))
                return false;
              return true;
            });

        if (actualCollectedCount >= 100 && !spawnedVoid) {
          spawnedVoid = true;
          spawnVoid(entityHost, enableVoid, showFloor);
          if (chaosMode) {
            activateShield();
            activateShield();
            activateShield();
            activateShield();
            activateShield();
          }
          for (let i = 1; i <= 10; i++) {
            if (i <= 5) {
              jumppadSpawns.push(spawnJumpPad(entityHost));
            } else if (i <= 8) {
              spawnJumpPad(entityHost, true);
            } else {
              spawnTriaOrb(entityHost);
            }
          }
          if (Math.random() < 0.01) spawnGlitch(entityHost);
          if (Math.random() < 0.01) {
            const pool = chaosMode
              ? ENTITY_POOL.filter((e) => e.name !== "Random")
              : ENTITY_POOL.filter((e) => e.name !== "Random" && !e.chaosOnly);
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
        if (actualCollectedCount >= 300 && !spawnedAltar[0]) {
          spawnedAltar[0] = true;
          spawnAltarChance(entityHost, hardMode);
          spawnAltarChaos(entityHost, hardMode);
          if (chaosMode) {
            spawnAltarChance(entityHost, hardMode);
            spawnAltarChance(entityHost, hardMode);
            spawnAltarChance(entityHost, hardMode);
            spawnAltarChance(entityHost, hardMode);
          }
        }
        if (actualCollectedCount >= 800 && !spawnedAltar[1]) {
          spawnedAltar[1] = true;
          spawnAltarEcho(entityHost, hardMode);
          spawnAltarPassage(entityHost, hardMode);
          spawnAltarProtection(entityHost, hardMode);
          spawnAltarPurgatory(entityHost, hardMode);
        }
        if (actualCollectedCount >= 1400 && !spawnedAltar[2]) {
          spawnedAltar[2] = true;
          spawnAltarPurification(entityHost, hardMode);
        }

        if (
          unlocked.length > 0 &&
          (!disablespawn ||
            (collectedCount >= (hardMode ? 12500 : 6250) &&
              collectedCount <= (hardMode ? 12699 : 6349))) &&
          (spawnedCatalyst ? collectedCount >= (hardMode ? 12500 : 6250) : true)
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
                lastEntityPicked = pick.name;
                pickedOnce.add(pick.name);
                break;
              }
            }
          }
          if (pick.name === "Random") {
            const randUnlocked = chaosMode
              ? ENTITY_POOL.filter((e) => {
                  if (e.name === "Celestial" || e.name === "Catalyst")
                    return false;
                  if (e.name === "Random") return false;
                  if (e.curseType) return false;
                  return true;
                })
              : ENTITY_POOL.filter((e) => {
                  if (e.chaosOnly) return false;
                  if (e.name === "Random") return false;
                  if (collectedCount < e.start) return false;
                  if (e.unstackable) return false;
                  return true;
                });
            if (randUnlocked.length !== 0) {
              let randPick =
                randUnlocked[(Math.random() * randUnlocked.length) | 0];
              const unregister = randPick.spawn();
              if (typeof unregister === "function")
                trackHighestEntity(unregister, pick.start, pick.name);
            }
          } else if (pick.name === "Catalyst") {
            const unregister = pick.spawn();
            if (typeof unregister === "function")
              trackHighestEntity(unregister, pick.start, pick.name);
          } else {
            const unregister = pick.spawn();
            if (typeof unregister === "function")
              trackHighestEntity(unregister, pick.start, pick.name);
          }
          if (pick.src) registerEntitySpawn(pick.name, pick.src);
          if (collectedCount >= 1800 && !highriseEnabled) {
            highriseEnabled = true;
          }
          if (collectedCount >= 800 && !isIceTileEnabled) {
            isIceTileEnabled = true;
            if (!disableIceTile && passageGoldPattern == 0) {
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
            }
            setInterval(() => {
              if (!disableIceTile && passageGoldPattern == 0) {
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
              }
            }, 60000);
          }
          if (collectedCount >= 1000 && !isSeamineEnabled && !disablespawn) {
            isSeamineEnabled = true;
            for (let i = 1; i <= 10; i++) {
              if (i <= 5) {
                jumppadSpawns.push(spawnJumpPad(entityHost));
              } else if (i <= 8) {
                spawnJumpPad(entityHost, true);
              } else {
                spawnTriaOrb(entityHost);
              }
            }
            spawnSeamine(entityHost, casualMode, hardMode);
            spawnSeamine(entityHost, casualMode, hardMode);
            spawnSeamine(entityHost, casualMode, hardMode);
            spawnGrindrail(entityHost);
            spawnGrindrail(entityHost);
            spawnGrindrail(entityHost);
          }
          if (pick.unstackable) {
            spawnedUnstackables.add(pick.name);
          }
          if (pick.curseType) {
            spawnedCurses.add(pick.name);
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

  const current3x3 = countPatterns(3);
  if (current3x3 < 5) {
    forceSpawn3x3(mouse);
  }
  if (highriseEnabled) {
    forceSpawn5x5(mouse);
  } else {
    for (const p of [...patternsState.values()]) {
      if (p.pattern[0].length == 45 && p.pattern.length == 45) {
        destroyPattern(p);
        break;
      }
    }
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

  if (dies) {
    requestAnimationFrame(loop);
    return;
  }

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

  const cam = getCameraPos();
  const screenX = cam.x;
  const screenY = cam.y;
  const w = window.innerWidth;
  const h = window.innerHeight;

  const displayMultiplier =
    giftMultiplier >= 1
      ? Math.ceil(giftMultiplier * 10) / 10
      : Math.floor(giftMultiplier * 10) / 10;
  document.getElementById("entity-panel-multiplier").innerHTML =
    `${displayMultiplier}x`;

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
  if (forceCelestialMusic && startCelestialMusic && !celestialMusic) {
    celestialMusic = playSound(
      "./ASSET/Sound/Music/It_Doesn't_End_Here.mp3",
      1,
      { start: 0, end: 1 },
      true,
      () => {
        celestialMusic = null;
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

  //shiftlock
  shiftlockEase += 0.133;
  if (shiftlockEase > 1) shiftlockEase = 1;
  if (spaceHeld || wasdMode || shiftlockEase < 1) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 12, 0, Math.PI * 2);
    ctx.stroke();
    const tInner = 12;
    const tOuter = 18;
    const tX = [0, 0, -1, 1];
    const tY = [-1, 1, 0, 0];
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(mouse.x + tX[i] * tInner, mouse.y + tY[i] * tInner);
      ctx.lineTo(mouse.x + tX[i] * tOuter, mouse.y + tY[i] * tOuter);
      ctx.stroke();
    }
    if (!wasdMode) {
      const dotX = mouse._clientX - camX;
      const dotY = mouse._clientY - camY;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(mouse.x, mouse.y);
      ctx.lineTo(dotX, dotY);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // simple cursor
  if (accurateCursor || spaceHeld || wasdMode || shiftlockEase < 1) {
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

  // shield
  if (
    shieldBroken[0] ||
    shieldBroken[1] ||
    shieldBroken[2] ||
    shieldBroken[3] ||
    shieldBroken[4]
  ) {
    const size = TILE * (1 + Math.random());
    const shieldg = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      0,
      mouse.x,
      mouse.y,
      size,
    );
    shieldg.addColorStop(0, "rgba(255, 0, 0, 0)");
    shieldg.addColorStop(
      1,
      `rgba(${128 + Math.floor(Math.random() * 128)}, 0, 0, ${Math.random() * 0.5})`,
    );
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, size - GIFT_SIZE / 2, 0, Math.PI * 2);
    ctx.fillStyle = shieldg;
    ctx.fill();
  } else if (
    shieldActive[0] ||
    shieldActive[1] ||
    shieldActive[2] ||
    shieldActive[3] ||
    shieldActive[4]
  ) {
    const shieldg = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      0,
      mouse.x,
      mouse.y,
      TILE,
    );
    if (shieldActive[4]) {
      shieldg.addColorStop(0, "#ffffff00");
      shieldg.addColorStop(1, `#ffffff`);
    } else if (shieldActive[3]) {
      shieldg.addColorStop(0, "#ffff0000");
      shieldg.addColorStop(1, `#ffff00`);
    } else if (shieldActive[2]) {
      shieldg.addColorStop(0, "#00ff0000");
      shieldg.addColorStop(1, `#00ff00`);
    } else if (shieldActive[1]) {
      shieldg.addColorStop(0, "#a834eb00");
      shieldg.addColorStop(1, `#a834eb`);
    } else if (shieldActive[0]) {
      shieldg.addColorStop(0, "#00ffff00");
      shieldg.addColorStop(1, `#00ffff`);
    }
    ctx.fillStyle = shieldg;
    ctx.beginPath();
    ctx.arc(
      mouse.x,
      mouse.y,
      (TILE - GIFT_SIZE / 2) * (1 - (now % 1000) / 1000),
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      mouse.x,
      mouse.y,
      (TILE - GIFT_SIZE / 2) * (1 - ((now + 500) % 1000) / 1000),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  if (shieldLostMsg[1] > 0) {
    shieldLostMsg[1]--;
    // jesus
    if (jesus) {
      if (shieldLostMsg[1] - 177 > 0 && !vineBoom) {
        vineBoom = playSound(
          "./ASSET/Sound/Global/vine-boom.mp3",
          undefined,
          undefined,
          undefined,
          () => {
            vineBoom = null;
          },
        );
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, (shieldLostMsg[1] - 150) / 30);
      ctx.drawImage(
        jesusImg,
        -camX,
        -camY,
        window.innerWidth,
        window.innerHeight,
      );
      ctx.restore();
    } else {
      if (shieldLostMsg[1] - 177 > 0 && !vineBoom) {
        vineBoom = playSound(
          "./ASSET/Sound/Global/Shield_Break.ogg",
          undefined,
          undefined,
          undefined,
          () => {
            vineBoom = null;
          },
        );
      }
    }
    ctx.save();
    const boxHeight = 100;
    const boxX = cam.x + w * 0.25;
    const boxY = cam.y + h - boxHeight * 1.5;
    const shieldCount = shieldActive.filter(
      (_, i) => shieldActive[i] && !shieldBroken[i],
    ).length;
    let text = `Shield lost to ${shieldLostMsg[0]}`;
    let text2 =
      shieldCount > 0
        ? `${shieldCount} Shield remaining.`
        : `No shields remaining.`;

    ctx.globalAlpha = Math.min(1, shieldLostMsg[1] / 30);
    ctx.fillStyle = `#0a3cff80`;
    ctx.fillRect(boxX, boxY, w * 0.5, boxHeight);
    ctx.strokeStyle = `#0a3cff`;
    ctx.strokeRect(boxX, boxY, w * 0.5, boxHeight);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 2;
    ctx.font = "30px sans-serif";
    ctx.fillStyle = "#f00";
    ctx.strokeText(text, boxX + w * 0.25, boxY + boxHeight / 2 - 15);
    ctx.fillText(text, boxX + w * 0.25, boxY + boxHeight / 2 - 15);
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "#0ff";
    ctx.strokeText(text2, boxX + w * 0.25, boxY + boxHeight / 2 + 20);
    ctx.fillText(text2, boxX + w * 0.25, boxY + boxHeight / 2 + 20);
    ctx.restore();
  }

  // scorched
  if (Number.isFinite(mouse.x) && Number.isFinite(mouse.y) && scorched) {
    const g = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      0,
      mouse.x,
      mouse.y,
      50,
    );
    g.addColorStop(0, `rgba(255, 128, 0, ${0.25 + Math.random() * 0.25})`);
    g.addColorStop(1, `rgba(255, 128, 0, 0)`);
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 50, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

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
  if (esp) drawESP(ctx);

  // slowness
  if (slowness) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 0, 0, ${slowness ? 0.18 : 0.09})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  seamineScale += 0.025;
  if (seamineScale > 1) seamineScale = 1;
  abilityCooldown--;
  if (abilityCooldown < 0) abilityCooldown = 0;
  speedBoostScale -= 0.033;
  if (speedBoostScale < 1) speedBoostScale = 1;
  const change = 1 / (30 * 30);
  giftMultiplier +=
    giftMultiplier < 1 ? change : giftMultiplier > 1 ? -change : 0;
  if (Math.abs(giftMultiplier - 1) < change) giftMultiplier = 1;
  if (giftMultiplier > 5)
    giftMultiplier -= Math.min(Math.abs(giftMultiplier - 5), 1);
  grindrailScale -= 0.017;
  if (grindrailScale < 1) grindrailScale = 1;
  wallScale += 0.017;
  if (wallScale > 1) wallScale = 1;
  for (const f of [...fleshPositions]) {
    if (f.until <= now) fleshPositions.delete(f);
  }

  function drawCooldownBar(x, y, width, height, cooldown) {
    ctx.save();
    const percent = Math.max(0, Math.min(cooldown / 45, 1));
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    const fillWidth = width * percent;
    const centerX = x + width / 2;
    ctx.fillStyle = "white";
    ctx.fillRect(
      centerX - fillWidth / 2,
      y + height * 0.125,
      fillWidth,
      height * 0.75,
    );
    ctx.restore();
  }
  if (abilityCooldown > 0)
    drawCooldownBar(
      screenX + w * 0.25,
      screenY + h - 40,
      w * 0.5,
      20,
      45 - abilityCooldown,
    );
  if (parried && parry) {
    if (!soundParry) {
      soundParry = true;
      speedBoostScale = 2;
      playSound("./ASSET/Sound/Global/parry-ultrakill.mp3");
      setTimeout(() => {
        parried = false;
        soundParry = false;
      }, 500);
    }
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "white";
    ctx.fillRect(screenX, screenY, w, h);
    ctx.restore();
  }

  //holy beacon
  if (collectedCount >= (hardMode ? 12500 : 6250) && !transformAllGift) {
    transformAllGift = true;
    allGold = true;
    giftPositions.forEach((gift) => {
      if (gift.type === "gift") {
        gift.golden = true;
      }
    });
    if (!disableProgression) {
      spawnBeacon(entityHost, deafMode);
      playSound(`./ASSET/Sound/Enemies/BeaconSpawn.ogg`);
    }
  }

  //mart merge
  const toRemove = new Set();
  const toSpawn = [];

  for (let i = 0; i < martStack.length; i++) {
    for (let j = i + 1; j < martStack.length; j++) {
      const a = martStack[i];
      const b = martStack[j];

      if (toRemove.has(a) || toRemove.has(b)) continue;

      const dx = a.state.x - b.state.x;
      const dy = a.state.y - b.state.y;
      const dist = Math.hypot(dx, dy);

      const maxStack = Math.max(a.state._stack, b.state._stack);
      const mergeDist = (0.6 + Math.sqrt(maxStack) * 0.4) * 75;
      const newStack = (a.state._stack || 1) + (b.state._stack || 1);
      if (dist <= mergeDist && newStack <= 10) {
        toRemove.add(a);
        toRemove.add(b);

        toSpawn.push([newStack, { x: a.state.x, y: a.state.y }]);
      }
    }
  }
  toRemove.forEach((e) => {
    e.unregister();
    martStack = martStack.filter((e) => !toRemove.has(e));
  });
  toSpawn.forEach(([stack, pos]) => {
    playSound(`./ASSET/Sound/Enemies/Mart/Mart_Merge.ogg`);
    spawnMart(entityHost, hardMode, stack, pos);
  });

  //players
  if (showPlayers) {
    for (const player of playersToDraw) {
      if (player.id === id) continue;

      if (!player.drawPos) {
        player.drawPos = {
          x: player.pos.x,
          y: player.pos.y,
        };
      }

      player.drawPos.x += (player.pos.x - player.drawPos.x) * 0.05;
      player.drawPos.y += (player.pos.y - player.drawPos.y) * 0.05;

      ctx.fillStyle = player.col;
      ctx.beginPath();

      let x = player.drawPos.x;
      let y = player.drawPos.y - 2.5;

      ctx.moveTo(x, y);
      ctx.lineTo(x + 0, y + 18);
      ctx.lineTo(x + 5, y + 14);
      ctx.lineTo(x + 9, y + 21);
      ctx.lineTo(x + 10, y + 20);
      ctx.lineTo(x + 7, y + 13);
      ctx.lineTo(x + 13, y + 13);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();
    }
  }

  //deathglow
  if (
    deathOpacity > 0 &&
    Number.isFinite(screenX) &&
    Number.isFinite(screenY)
  ) {
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
  if (bellHit.count >= 3) {
    const tilerand = TILE * (0.5 + Math.random() * 0.5);
    const bellg = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      0,
      mouse.x,
      mouse.y,
      tilerand,
    );
    bellg.addColorStop(0, "#fff0");
    bellg.addColorStop(0.99, "#fff0");
    bellg.addColorStop(1, "#fff");
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, tilerand, 0, Math.PI * 2);
    ctx.fillStyle = bellg;
    ctx.fill();
    const border = 200;
    ctx.save();
    ctx.globalAlpha = 0.5;
    const color = "0,0,0";
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

  //tips
  if (
    tipstimer > 0 &&
    (localStorage.getItem("highest-level-reached")
      ? parseInt(
          localStorage.getItem("highest-level-reached").split(" ")[1],
          10,
        ) < 25
      : true) &&
    !disableProgression
  ) {
    tipstimer--;
    ctx.save();

    const boxHeight = 100;

    const boxX = cam.x + w * 0.25;
    const boxY = cam.y + h - boxHeight * 1.5;

    let text;
    let text2;
    let color = "#0a3cff";
    if (tipstimer > 726) {
      text = "Use your cursor to move around.";
      if (tipstimer > 898) color = "#ff0a0a";
      if (tipstimer < 897 && tipstimer > 895) color = "#ff0a0a";
    } else if (tipstimer > 552) {
      text = "Hold SHIFT or CTRL to slow down movement.";
      text2 = "Alternatively use Reduced motion option.";
      if (tipstimer > 724) color = "#ff0a0a";
      if (tipstimer < 723 && tipstimer > 721) color = "#ff0a0a";
    } else if (tipstimer > 378) {
      text = "Collect the gifts you see scattered across the map.";
      text2 = "Enemies will appear soon.";
      if (tipstimer > 550) color = "#ff0a0a";
      if (tipstimer < 549 && tipstimer > 547) color = "#ff0a0a";
    } else if (tipstimer > 204) {
      text = "Press E or R to boost movement.";
      text2 = "Hold Space for centered movement.";
      if (tipstimer > 376) color = "#ff0a0a";
      if (tipstimer < 375 && tipstimer > 373) color = "#ff0a0a";
    } else if (tipstimer > 30) {
      text = "Hover to the enemy icon above to avoid death.";
      text2 = "Press M to open/close the topbar.";
      if (tipstimer > 202) color = "#ff0a0a";
      if (tipstimer < 201 && tipstimer > 199) color = "#ff0a0a";
    } else {
      text = "Goodluck.";
      if (tipstimer > 28) color = "#ff0a0a";
      if (tipstimer < 27 && tipstimer > 25) color = "#ff0a0a";
    }

    ctx.globalAlpha = tipstimer > 30 ? 1 : tipstimer / 30;

    ctx.fillStyle = `${color}80`;
    ctx.fillRect(boxX, boxY, w * 0.5, boxHeight);
    ctx.strokeStyle = color;
    ctx.strokeRect(boxX, boxY, w * 0.5, boxHeight);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    if (!text2) {
      ctx.strokeText(text, boxX + w * 0.25, boxY + boxHeight / 2);
      ctx.fillText(text, boxX + w * 0.25, boxY + boxHeight / 2);
    } else {
      ctx.strokeText(text, boxX + w * 0.25, boxY + boxHeight / 2 - 10);
      ctx.fillText(text, boxX + w * 0.25, boxY + boxHeight / 2 - 10);
      ctx.strokeText(text2, boxX + w * 0.25, boxY + boxHeight / 2 + 20);
      ctx.fillText(text2, boxX + w * 0.25, boxY + boxHeight / 2 + 20);
    }

    ctx.restore();
  }

  //cheat
  const zoom = window.outerWidth / window.document.documentElement.clientWidth;
  if ((zoom > 1.25 || zoom < 0.75) && cheatDetector) disableProgression = true;
  document.getElementById("spawn-input").style.display === "block"
    ? (document.getElementById("spawn-input-text").style.display = "block")
    : (document.getElementById("spawn-input-text").style.display = "none");
  document.getElementById("spawn-input-commands").style.opacity -= 0.001;
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
let timerInterval = null;
let startTime = 0;
function startTimer() {
  if (timerInterval) return;
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    document.getElementById("timer").innerHTML = `${minutes}:${seconds}`;
  }, 100);
}
export function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
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
  tipstimer = 900;
  panel.classList.toggle("init");
  setInterval(() => {
    const basicEnemies = ENTITY_POOL.filter((e) => {
      if (e.chaosOnly) return false;
      if (e.start != 0) return false;
      return true;
    });
    if (
      basicEnemies.length > 0 &&
      !disablespawn &&
      actualCollectedCount > 100
    ) {
      const pick = basicEnemies[(Math.random() * basicEnemies.length) | 0];
      pick.spawn();
    }
    if (bellHit.count <= 2) {
      bellHit.count -= 1;
      if (bellHit.count < 0) bellHit.count = 0;
    }
  }, 60000);
  startTimer();
  loop();
};
window.addEventListener("click", unlock);
document.getElementById("intro-screen").addEventListener("click", unlock);

setInterval(() => {
  for (const [key, p] of patternsState) {
    if (p.passageGoldPattern) {
      for (const tile of floorTiles) {
        if (tile.sx === p.sx && tile.sy === p.sy) {
          tile.collapsing = [true, false];
        }
      }
      setTimeout(() => {
        for (const tile of floorTiles) {
          if (tile.sx === p.sx && tile.sy === p.sy) {
            tile.collapsing = [false, true];
          }
        }
        setTimeout(() => {
          destroyPattern(p);
        }, 1000);
      }, 2000);
      break;
    }
  }
  const viewX = -camX;
  const viewY = -camY;
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;
  function isOutside(x, y) {
    return x < viewX || x > viewX + viewW || y < viewY || y > viewY + viewH;
  }
  for (const [key, p] of patternsState) {
    const c = patternCenter(p.sx, p.sy);
    if (isOutside(c.x, c.y)) {
      for (const tile of floorTiles) {
        if (tile.sx === p.sx && tile.sy === p.sy) {
          tile.collapsing = [true, false];
        }
      }
      setTimeout(() => {
        for (const tile of floorTiles) {
          if (tile.sx === p.sx && tile.sy === p.sy) {
            tile.collapsing = [false, true];
          }
        }
        setTimeout(() => {
          destroyPattern(p);
        }, 1000);
      }, 2000);
      break;
    }
  }
}, 6000);

let originalVolume = [0, 0];
export function onFinalContact() {
  if (disableProgression) return;
  beaconed = true;
  toggleImmortality(true);
  canvas.style.cursor = "none";
  entityCanvas.style.cursor = "none";
  entityCanvas2.style.cursor = "none";
  playSound(
    "./ASSET/Sound/Enemies/Catalyst/CataOnCollapse.mp3",
    1,
    undefined,
    undefined,
    undefined,
    "50",
  );
  playSound(
    "./ASSET/Sound/Enemies/Catalyst/CataScream_v3.mp3",
    1,
    undefined,
    undefined,
    undefined,
    "50",
  );
  setTimeout(() => {
    playSound(
      "./ASSET/Sound/Enemies/Catalyst/CataCutsceneOnBeacon.mp3",
      1,
      undefined,
      undefined,
      undefined,
      "50",
    );
  }, 1500);
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
