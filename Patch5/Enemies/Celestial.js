import { death, mouse } from "../entityHost.js";
import {
  getCameraPos,
  canvas,
  moveCamera,
  playSound,
  soundStopped,
  actualCollectedCount,
  startCelestialPhase4,
  setGiftMultiplier,
} from "../main.js";

const CelestialFont = new FontFace(
  "CelestialFont",
  "url(./ASSET/Misc/CelestialFont.ttf)",
);
await CelestialFont.load();
document.fonts.add(CelestialFont);

const CelestialDeathFont = new FontFace(
  "CelestialDeathFont",
  "url(./ASSET/Misc/CelestialDeathFont.ttf)",
);
await CelestialDeathFont.load();
document.fonts.add(CelestialDeathFont);

const Celestial_Idle = [];
for (let i = 1; i <= 25; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Celestial/Celestial_Idle/Layer ${i}.png`;
  Celestial_Idle.push(img);
}
const Celestial_CutterStart = [];
for (let i = 1; i <= 60; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Celestial/Celestial_CutterStart/Layer ${i}.png`;
  Celestial_CutterStart.push(img);
}
const Celestial_CutterLoop = [];
for (let i = 1; i <= 60; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Celestial/Celestial_CutterLoop/Layer ${i}.png`;
  Celestial_CutterLoop.push(img);
}
const Celestial_CutterEnd = [];
for (let i = 1; i <= 60; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Celestial/Celestial_CutterEnd/Layer ${i}.png`;
  Celestial_CutterEnd.push(img);
}
const Celestial_Swing = [];
for (let i = 1; i <= 25; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Celestial/Celestial_Swing/Layer ${i}.png`;
  Celestial_Swing.push(img);
}
const Celestial_SwingFlipped = [];
for (let i = 1; i <= 25; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Celestial/Celestial_SwingFlipped/Layer ${i}.png`;
  Celestial_SwingFlipped.push(img);
}
const Celestial_FinalSwing = [];
for (let i = 1; i <= 25; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Celestial/Celestial_FinalSwing/Layer ${i}.png`;
  Celestial_FinalSwing.push(img);
}

let phase = 1;
export function setup(
  host,
  hardMode,
  truePattern = false,
  silenceOnly = false,
) {
  const patternFall = [
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("FALL.");
      },
    },
    {
      duration: 5.5,
      update: updateSlash,
      draw: drawSlash,
      drawFront: drawSlashFront,
      enter: enterSlash,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
    {
      duration: 9,
      update: updatePizzaCutter,
      draw: drawPizzaCutter,
      drawFront: drawPizzaCutterFront,
      enter: enterPizzaCutter,
    },
  ];
  const patternFutile = [
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("FUTILE.");
      },
    },
    {
      duration: 13,
      update: updateFutile,
      draw: drawFutile,
      drawFront: drawFutileFront,
      enter: enterFutile,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
    {
      duration: 5.5,
      update: updateSlash,
      draw: drawSlash,
      drawFront: drawSlashFront,
      enter: enterSlash,
    },
  ];
  const patternFutilePhase3 = [
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("FUTILE.");
      },
    },
    {
      duration: 13,
      update: updateFutile,
      draw: drawFutile,
      drawFront: drawFutileFront,
      enter: enterFutile,
    },
  ];
  const patternCrumble = [
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("CRUMBLE.");
      },
    },
    {
      duration: 3,
      update: updateCrumble,
      draw: drawCrumble,
      drawFront: drawCrumbleFront,
      enter: enterCrumble,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
    {
      duration: 9,
      update: updatePizzaCutter,
      draw: drawPizzaCutter,
      drawFront: drawPizzaCutterFront,
      enter: enterPizzaCutter,
    },
  ];
  const patternBitter = [
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("BITTER.");
      },
    },
    {
      duration: 9,
      update: updateBitter,
      draw: drawBitter,
      drawFront: drawBitterFront,
      enter: enterBitter,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
  ];
  const patternBitterPhase3 = [
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("BITTER.");
      },
    },
    {
      duration: 9,
      update: updateBitter,
      draw: drawBitter,
      drawFront: drawBitterFront,
      enter: enterBitter,
    },
    {
      duration: 5.5,
      update: updateSlash,
      draw: drawSlash,
      drawFront: drawSlashFront,
      enter: enterSlash,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
  ];
  const patternCease = [
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("CEASE.");
      },
    },
    {
      duration: 3,
      update: updateCease,
      draw: drawCease,
      drawFront: drawCeaseFront,
      enter: enterCease,
    },
  ];
  const patternCeasePhase3 = [
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("CEASE.");
      },
    },
    {
      duration: 3,
      update: updateCease,
      draw: drawCease,
      drawFront: drawCeaseFront,
      enter: enterCease,
    },
    {
      duration: 9,
      update: updatePizzaCutterCrumble,
      draw: drawPizzaCutterCrumble,
      drawFront: drawPizzaCutterCrumbleFront,
      enter: enterPizzaCutterCrumble,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
  ];
  const patternSecondCeasePhase3 = [
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("CEASE.");
      },
    },
    {
      duration: 3,
      update: updateCease,
      draw: drawCease,
      drawFront: drawCeaseFront,
      enter: enterCease,
    },
    {
      duration: 9,
      update: updatePizzaCutterCrumble,
      draw: drawPizzaCutterCrumble,
      drawFront: drawPizzaCutterCrumbleFront,
      enter: enterPizzaCutterCrumble,
    },
    {
      duration: 9,
      update: updateBitter,
      draw: drawBitter,
      drawFront: drawBitterFront,
      enter: enterBitter,
    },
  ];
  const patternBoom = [
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("BOOM.");
      },
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
  ];
  const patternDeathInBloom = [
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("DEATH IN BLOOM.");
      },
    },
    {
      duration: 23,
      update: updateDeathInBloom,
      draw: drawDeathInBloom,
      drawFront: drawDeathInBloomFront,
      enter: enterDeathInBloom,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
  ];
  const loopPatternPhase1 = [...patternFall, ...patternCrumble];
  const loopPatternPhase2 = [
    ...patternFutile,
    ...patternCrumble,
    ...patternBitter,
    ...patternCease,
  ];
  const loopPatternPhase3 = [
    ...patternDeathInBloom,
    ...patternFutilePhase3,
    ...patternCeasePhase3,
    ...patternBitterPhase3,
    ...patternFutilePhase3,
    ...patternSecondCeasePhase3,
    ...patternBoom,
  ];
  const loopPatternPhase4 = [
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("NO ESCAPE.");
      },
    },
    {
      duration: 13,
      update: updateFutile,
      draw: drawFutile,
      drawFront: drawFutileFront,
      enter: enterFutile,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
    {
      duration: 8,
      update: updateSuperPizzaCutter,
      draw: drawSuperPizzaCutter,
      drawFront: drawSuperPizzaCutterFront,
      enter: enterSuperPizzaCutter,
    },
    {
      duration: 3,
      update: updateCease,
      draw: drawCease,
      drawFront: drawCeaseFront,
      enter: enterCease,
    },
    {
      duration: 9,
      update: updateBitter,
      draw: drawBitter,
      drawFront: drawBitterFront,
      enter: enterBitter,
    },
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("SILENCE.");
      },
    },
    {
      duration: 9,
      update: updateFirstSilence,
      draw: drawFirstSilence,
      drawFront: drawFirstSilenceFront,
      enter: enterFirstSilence,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
    {
      duration: 13,
      update: updateFutile,
      draw: drawFutile,
      drawFront: drawFutileFront,
      enter: enterFutile,
    },
    {
      duration: 3,
      update: updateCease,
      draw: drawCease,
      drawFront: drawCeaseFront,
      enter: enterCease,
    },
    {
      duration: 8,
      update: updateSuperPizzaCutter,
      draw: drawSuperPizzaCutter,
      drawFront: drawSuperPizzaCutterFront,
      enter: enterSuperPizzaCutter,
    },
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("BITTER.");
      },
    },
    {
      duration: 9,
      update: updateBitter3Stars,
      draw: drawBitter3Stars,
      drawFront: drawBitter3StarsFront,
      enter: enterBitter3Stars,
    },
    {
      duration: 13,
      update: updateFutile,
      draw: drawFutile,
      drawFront: drawFutileFront,
      enter: enterFutile,
    },
    {
      duration: 3,
      update: updateCease,
      draw: drawCease,
      drawFront: drawCeaseFront,
      enter: enterCease,
    },
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("DEATH IN BLOOM.");
      },
    },
    {
      duration: 23,
      update: updateDeathInBloomCrumble,
      draw: drawDeathInBloomCrumble,
      drawFront: drawDeathInBloomCrumbleFront,
      enter: enterDeathInBloomCrumble,
    },
    {
      duration: 13,
      update: updateFutile,
      draw: drawFutile,
      drawFront: drawFutileFront,
      enter: enterFutile,
    },
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("CRUMBLE.");
      },
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
    {
      duration: 8,
      update: updateSuperPizzaCutter,
      draw: drawSuperPizzaCutter,
      drawFront: drawSuperPizzaCutterFront,
      enter: enterSuperPizzaCutter,
    },
    {
      duration: 3,
      update: updateCease,
      draw: drawCease,
      drawFront: drawCeaseFront,
      enter: enterCease,
    },
    {
      duration: 9,
      update: updateBitter,
      draw: drawBitter,
      drawFront: drawBitterFront,
      enter: enterBitter,
    },
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("SILENCE.");
      },
    },
    {
      duration: 3,
      update: updateImplosionBreaker,
      draw: drawImplosionBreaker,
      drawFront: drawImplosionBreakerFront,
      enter: enterImplosionBreaker,
    },
    {
      duration: 18,
      update: updateSecondSilence,
      draw: drawSecondSilence,
      drawFront: drawSecondSilenceFront,
      enter: enterSecondSilence,
    },
    {
      duration: 3,
      update: updateCease,
      draw: drawCease,
      drawFront: drawCeaseFront,
      enter: enterCease,
    },
    {
      duration: 9,
      update: updateBitter,
      draw: drawBitter,
      drawFront: drawBitterFront,
      enter: enterBitter,
    },
    {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {
        showText("DEATH IN BLOOM.");
      },
    },
    {
      duration: 23,
      update: updateDeathInBloomCrumble,
      draw: drawDeathInBloomCrumble,
      drawFront: drawDeathInBloomCrumbleFront,
      enter: enterDeathInBloomCrumble,
    },
  ];
  const silenceOnlyPattern = [
    {
      duration: 9,
      update: updateFirstSilence,
      draw: drawFirstSilence,
      drawFront: drawFirstSilenceFront,
      enter: enterFirstSilence,
    },
    {
      duration: 18,
      update: updateSecondSilence,
      draw: drawSecondSilence,
      drawFront: drawSecondSilenceFront,
      enter: enterSecondSilence,
    },
  ];
  const specificDevOnly = [
    {
      duration: 5.5,
      update: updateSlash,
      draw: drawSlash,
      drawFront: drawSlashFront,
      enter: enterSlash,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
    {
      duration: 9,
      update: updatePizzaCutter,
      draw: drawPizzaCutter,
      drawFront: drawPizzaCutterFront,
      enter: enterPizzaCutter,
    },
    {
      duration: 13,
      update: updateFutile,
      draw: drawFutile,
      drawFront: drawFutileFront,
      enter: enterFutile,
    },
    {
      duration: 3,
      update: updateCrumble,
      draw: drawCrumble,
      drawFront: drawCrumbleFront,
      enter: enterCrumble,
    },
    {
      duration: 9,
      update: updateBitter,
      draw: drawBitter,
      drawFront: drawBitterFront,
      enter: enterBitter,
    },
    {
      duration: 3,
      update: updateCease,
      draw: drawCease,
      drawFront: drawCeaseFront,
      enter: enterCease,
    },
    {
      duration: 9,
      update: updatePizzaCutterCrumble,
      draw: drawPizzaCutterCrumble,
      drawFront: drawPizzaCutterCrumbleFront,
      enter: enterPizzaCutterCrumble,
    },
    {
      duration: 23,
      update: updateDeathInBloom,
      draw: drawDeathInBloom,
      drawFront: drawDeathInBloomFront,
      enter: enterDeathInBloom,
    },
    {
      duration: 8,
      update: updateSuperPizzaCutter,
      draw: drawSuperPizzaCutter,
      drawFront: drawSuperPizzaCutterFront,
      enter: enterSuperPizzaCutter,
    },
    {
      duration: 9,
      update: updateFirstSilence,
      draw: drawFirstSilence,
      drawFront: drawFirstSilenceFront,
      enter: enterFirstSilence,
    },
    {
      duration: 9,
      update: updateBitter3Stars,
      draw: drawBitter3Stars,
      drawFront: drawBitter3StarsFront,
      enter: enterBitter3Stars,
    },
    {
      duration: 23,
      update: updateDeathInBloomCrumble,
      draw: drawDeathInBloomCrumble,
      drawFront: drawDeathInBloomCrumbleFront,
      enter: enterDeathInBloomCrumble,
    },
    {
      duration: 3,
      update: updateImplosionBreaker,
      draw: drawImplosionBreaker,
      drawFront: drawImplosionBreakerFront,
      enter: enterImplosionBreaker,
    },
    {
      duration: 18,
      update: updateSecondSilence,
      draw: drawSecondSilence,
      drawFront: drawSecondSilenceFront,
      enter: enterSecondSilence,
    },
  ];
  const celestialDevOnly = true;
  const floatingText = {
    text: "",
    t: 0,
    duration: 1,
    active: false,
  };
  const state = {
    opacity: 1,
    sound: null,
    deathSound: false,
    lastPhase: 0,
    scream: false,
    screamT: 0,

    currentPattern: {
      duration: 0,
      update: () => {},
      draw: () => {},
      drawFront: () => {},
      enter: () => {},
    },
    patternTime: 0,
    patternIndex: -1,
    loopPattern: !truePattern
      ? silenceOnly
        ? silenceOnlyPattern
        : specificDevOnly
      : loopPatternPhase1,

    layers: Celestial_Idle,
    enemy: null,
    layer: 0,
    returnLayer: false,
    nextLayer: null,

    enemyX: mouse.x + 600,
    enemyY: mouse.y,
    lastAng: 0,
    ang: 0,
    enemyMode: "orbit",
    enemyT: 0,
    enemyOrbitTarget: { x: 0, y: 0 },
    enemyFixed: { x: 0, y: 0 },
    enemyScale: 1,
    enemyTransition: "none",
    enemyTransitionT: 0,
    enemyTrail: [],

    shakeX: 0,
    shakeY: 0,
    shakeStrength: 0,
  };

  function changeEnemy(layer, loop = false, nextLayer) {
    state.layers = layer;
    state.layer = 0;
    state.returnLayer = !loop;
    state.nextLayer = nextLayer;
  }
  function checkDeath(text = "Celestial") {
    if (!state.deathSound) {
      playSound(
        Math.random() < 0.5
          ? `./ASSET/Sound/Enemies/Celestial/Celestial_Kill_Sound.ogg`
          : `./ASSET/Sound/Enemies/Celestial/Kill_Variation_2.ogg`,
        undefined,
        undefined,
        undefined,
        undefined,
        "50",
      );
      state.deathSound = true;
      setTimeout(() => {
        state.deathSound = false;
      }, 1000);
    }
    death(text);
  }
  function showText(text) {
    floatingText.text = text;
    floatingText.t = 0;
    floatingText.duration = 2;
    floatingText.active = true;
    playSound(
      `./ASSET/Sound/Enemies/Celestial/Talking/Celestial_Talk_${Math.floor(1 + Math.random() * 8)}.ogg`,
      undefined,
      undefined,
      undefined,
      undefined,
      "50",
    );
  }
  function shakeScreen(strength = 1) {
    state.shakeStrength += strength;
    if (state.shakeStrength > 1) state.shakeStrength = 1;
  }
  function enterFixed(x, y, transition = true) {
    state.enemyMode = "fixed";
    state.enemyFixed.x = x;
    state.enemyFixed.y = y;

    if (transition == true) {
      state.enemyTransition = "shrink";
      state.enemyTransitionT = 0;
    } else {
      state.enemyX = state.enemyFixed.x;
      state.enemyY = state.enemyFixed.y;
    }
  }
  function enterOrbit() {
    if (state.enemyMode == "fixed") {
      state.enemyMode = "orbit";
      state.enemyTransition = "shrink";
      state.enemyTransitionT = 0;
    }
  }

  function compact(arr) {
    let j = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].active) arr[j++] = arr[i];
    }
    arr.length = j;
  }
  const BEAM_RADIUS = 7000;
  function spawnBeam(x, y, baseAngle, armTime = 1) {
    const base = baseAngle ?? Math.random() * Math.PI * 2;
    return {
      x,
      y,
      angle: base,
      startAngle: base + ((Math.random() < 0.5 ? 1 : -1) * Math.PI) / 8,
      t: 0,
      width: 0,
      targetWidth: 150,
      active: true,
      armTime,
    };
  }
  function spawnImplosionCircle() {
    const angle = Math.random() * Math.PI * 2;
    const x =
      mouse.x +
      Math.cos(angle) *
        ((hardMode ? 0.5 : 0.667) +
          Math.random() * (hardMode ? 0.667 : 0.333)) *
        800;
    const y =
      mouse.y +
      Math.sin(angle) *
        ((hardMode ? 0.5 : 0.667) +
          Math.random() * (hardMode ? 0.667 : 0.333)) *
        800;

    return {
      x,
      y,
      t: 0,
      r: 0,
      targetR: 300,
      active: true,
      phase: 0,
      opacity: 0,
    };
  }
  function spawnCircle(targetR = 1, maxdist = 1000) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * maxdist;

    const sx = mouse.x + (Math.random() - 0.5) * 5000;
    const sy = mouse.y + (Math.random() - 0.5) * 5000;

    return {
      x: sx,
      y: sy,

      sx,
      sy,
      tx: sx + Math.cos(angle) * dist,
      ty: sy + Math.sin(angle) * dist,

      t: 0,
      r: 0,
      targetR: (hardMode ? 200 : 150) / targetR,
      active: true,
    };
  }
  let lastPizzaAngle = Math.random() * Math.PI * 2;
  let lastPizzaDir = Math.random() < 0.5 ? 1 : -1;
  function spawnPizza(
    state = statePizzaCutter,
    startAngle = (Math.random() < 0.5 ? Math.PI : -Math.PI) * 2,
  ) {
    const dir =
      lastPizzaDir >= 0
        ? Math.random() < 0.333
          ? 1
          : -1
        : Math.random() < 0.333
          ? -1
          : 1;
    lastPizzaDir = dir;
    const rand = Math.random() * 0.7 + 0.3;
    const jitter = ((Math.random() < 0.5 ? rand : -rand) * Math.PI) / 6;
    const base = lastPizzaAngle + jitter;
    lastPizzaAngle = base;

    return {
      x: state.cx,
      y: state.cy,
      t: 0,
      dir,
      startAngle: base + startAngle,
      targetAngle: base,
      active: true,
      offset: 0,
    };
  }
  let lastBitterDir = Math.random() < 0.5 ? 1 : -1;
  function spawnBitter(count, state = stateBitter) {
    const base = Math.random() * Math.PI * 2;
    const dir =
      lastBitterDir >= 0
        ? Math.random() < 0.333
          ? 1
          : -1
        : Math.random() < 0.333
          ? -1
          : 1;
    lastBitterDir = dir;

    return {
      x: state.cx,
      y: state.cy,
      t: 0,
      baseAngle: base,
      angle: base,
      count,
      active: true,
      dirAngle: lastBitterDir,
      dirX: 0,
      dirY: 0,
      shot: false,
    };
  }
  function spawnFutileRift() {
    const dist = 2000;
    const ang = Math.random() * Math.PI * 2;

    const x = mouse.x + Math.cos(ang) * dist;
    const y = mouse.y + Math.sin(ang) * dist;

    const dx = mouse.x - x;
    const dy = mouse.y - y;

    const points = [];
    const segments = 7;
    const h = 400;
    const maxW = 60;
    let randspike = 1;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const py = -h / 2 + t * h;

      const centerFalloff = Math.sin(t * Math.PI);
      const w = maxW * centerFalloff;

      const spike = randspike * Math.random() * 40;
      randspike *= -1;

      const curve = Math.sin(t * Math.PI * 2) * 20;

      points.push({
        y: py,
        lx: -w + spike + curve,
        rx: w + spike + curve,
      });
    }

    return {
      x,
      y,
      angle: Math.atan2(dy, dx),
      t: 0,
      points,
      scale: 0,
      indicatorT: 0,
    };
  }
  function spawnSnake(rift) {
    const speed = 2500;

    return {
      x: rift.x,
      y: rift.y,
      vx: Math.cos(rift.angle) * speed,
      vy: Math.sin(rift.angle) * speed,
      active: true,
    };
  }

  const stateSlash = {
    beams: [],
    timer: 0,
    cycle: 0,
    prevMx: 0,
    prevMy: 0,
    flipped: 1,
  };
  function enterSlash() {
    enterOrbit();
    stateSlash.beams = [];
    stateSlash.timer = 0;
    stateSlash.cycle = 0;
    stateSlash.prevMx = mouse.x;
    stateSlash.prevMy = mouse.y;

    if (truePattern == false) showText("FALL.");
  }
  function updateSlash(dt) {
    const mx = mouse.x;
    const my = mouse.y;

    const mvx = mx - stateSlash.prevMx;
    const mvy = my - stateSlash.prevMy;

    stateSlash.prevMx = mx;
    stateSlash.prevMy = my;

    const px = mx + mvx;
    const py = my + mvy;

    const cycle = stateSlash.cycle;

    if (stateSlash.timer === 0) {
      stateSlash.change = false;
      if (cycle === 3) {
        playSound(
          `./ASSET/Sound/Enemies/Celestial/Slash/Fall_Final.ogg`,
          0.75,
          undefined,
          undefined,
          undefined,
          "50",
        );
        if (!hardMode) {
          const base = Math.random() * Math.PI * 2;
          const spread = Math.PI / 12 + (Math.PI / 2.667) * Math.random();
          const spread2 = Math.PI / 12 + (Math.PI / 2.667) * Math.random();

          stateSlash.beams.push(spawnBeam(px, py, base, 1.5));
          stateSlash.beams.push(spawnBeam(px, py, base + spread, 1.5));
          stateSlash.beams.push(spawnBeam(px, py, base - spread2, 1.5));
        } else {
          const base = Math.random() * Math.PI * 2;
          const spread = Math.PI / 12 + (Math.PI / 4.5) * Math.random();
          const spread2 = Math.PI / 12 + (Math.PI / 4.5) * Math.random();
          const spread3 = Math.PI / 2.571 + (Math.PI / 4.5) * Math.random();

          stateSlash.beams.push(spawnBeam(px, py, base, 1.5));
          stateSlash.beams.push(spawnBeam(px, py, base + spread, 1.5));
          stateSlash.beams.push(spawnBeam(px, py, base - spread2, 1.5));
          stateSlash.beams.push(spawnBeam(px, py, base + spread3, 1.5));
        }
      } else if (cycle < 3) {
        if (!hardMode) {
          stateSlash.beams.push(spawnBeam(px, py, undefined, 1));
        } else {
          const base = Math.random() * Math.PI * 2;
          const spread = Math.PI / 12 + (Math.PI / 1.2) * Math.random();

          stateSlash.beams.push(spawnBeam(px, py, base));
          stateSlash.beams.push(spawnBeam(px, py, base + spread));
        }
      }
    }

    stateSlash.timer += dt;
    if (stateSlash.timer >= (cycle < 3 ? 0.25 : 0.75) && !stateSlash.change) {
      stateSlash.change = true;
      if (cycle === 3) {
        changeEnemy(Celestial_FinalSwing);
      } else if (cycle < 3) {
        stateSlash.flipped *= -1;
        changeEnemy(
          stateSlash.flipped < 0 ? Celestial_Swing : Celestial_SwingFlipped,
        );
        playSound(
          `./ASSET/Sound/Enemies/Celestial/Slash/Fall_Variation_${Math.random() < 0.5 ? "1" : "2"}.ogg`,
          0.75,
          undefined,
          undefined,
          undefined,
          "50",
        );
      }
    }

    const DURATIONS = [1, 1, 1, 1.5];
    if (stateSlash.timer >= DURATIONS[cycle]) {
      stateSlash.timer = 0;
      stateSlash.cycle = cycle + 1;
      shakeScreen();
    }

    let needsCompact = false;
    for (const b of stateSlash.beams) {
      let t = (b.t += dt);

      if (t < 0.5) {
        const p = t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        b.width = b.targetWidth * eased;
      } else if (t < b.armTime) {
        b.width = b.targetWidth;
      } else {
        const w = b.width - dt * 200;
        b.width = w;
        if (w <= 0) {
          b.active = false;
          needsCompact = true;
        }
      }

      const dx = mx - b.x;
      const dy = my - b.y;

      const angle = b.angle;
      const cos = Math.cos(-angle);
      const sin = Math.sin(-angle);

      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;

      const halfW = b.width * 0.5;

      if (
        b.active &&
        t >= b.armTime &&
        Math.abs(rx) < 20000 &&
        Math.abs(ry) < halfW
      ) {
        checkDeath("Celestial");
      }

      b._rx = rx;
    }
    if (needsCompact) compact(stateSlash.beams);
  }
  function drawSlash(ctx) {
    for (const b of stateSlash.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);

      let a = b.angle;
      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }

      ctx.rotate(a);

      const armed = b.t >= b.armTime;
      const alpha = armed ? 1 : 0.5;

      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1;

      if (!armed) {
        ctx.strokeStyle = "transparent";
      } else {
        ctx.strokeStyle = "#ff00cc";
      }

      const x = b._rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      if (armed && b.width > 1) {
        const glow = 100;

        const gradTop = ctx.createLinearGradient(
          0,
          -b.width / 2 - glow,
          0,
          -b.width / 2,
        );
        gradTop.addColorStop(0, "rgba(255,0,192,0)");
        gradTop.addColorStop(1, "rgba(255,0,192,1)");

        ctx.fillStyle = gradTop;
        ctx.fillRect(x, -b.width / 2 - glow, len, glow);

        const gradBot = ctx.createLinearGradient(
          0,
          b.width / 2,
          0,
          b.width / 2 + glow,
        );
        gradBot.addColorStop(0, "rgba(255,0,192,1)");
        gradBot.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = gradBot;
        ctx.fillRect(x, b.width / 2, len, glow);
      }

      ctx.strokeRect(x, -b.width * 0.5, len, b.width);

      ctx.restore();
    }
  }
  function drawSlashFront(ctx) {
    for (const b of stateSlash.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);

      let a = b.angle;
      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }

      ctx.rotate(a);

      const armed = b.t >= b.armTime;
      const alpha = armed ? 1 : 0.5;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = armed ? "black" : "#ff00cc";

      const x = b._rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      ctx.fillRect(x, -b.width * 0.5, len, b.width);

      ctx.restore();
    }
  }

  const stateImplosion = {
    circles: [],
    spawnTimer: 0,
    spawned: 0,
  };
  function enterImplosion() {
    enterOrbit();
    stateImplosion.circles = [];
    stateImplosion.spawnTimer = 0;
    stateImplosion.spawned = 0;

    if (truePattern == false) showText("BOOM.");
  }
  function updateImplosion(dt) {
    const mx = mouse.x;
    const my = mouse.y;
    const s = stateImplosion;

    s.spawnTimer += dt;

    const interval = 1 / 15;
    while (s.spawnTimer >= interval && s.spawned < 15) {
      s.spawnTimer -= interval;
      s.spawned++;
      s.circles.push(spawnImplosionCircle());
    }

    let needsCompact = false;
    for (const c of s.circles) {
      c.t += dt;
      c.opacity += dt * 4;

      if (c.t < 0.25) {
        c.r = 5;
      } else if (c.t < 1.5) {
        const p = (c.t - 0.25) / 1.25;
        const eased = p * p * (3 - 2 * p);
        c.r = c.targetR * eased;
        c.phase = 1;
      } else {
        if (!c.shake) {
          c.shake = true;
          shakeScreen();
          playSound(
            `./ASSET/Sound/Enemies/Celestial/Cease/Cease_Impact.ogg`,
            3,
          );
        }
        c.phase = 2;
        c.r -= dt * 600;
        if (c.r <= 0) {
          c.active = false;
          needsCompact = true;
        }
      }

      if (c.phase === 2) {
        const dx = mx - c.x;
        const dy = my - c.y;

        const hitR = c.r * 1.1;

        if (dx * dx + dy * dy <= hitR * hitR) {
          checkDeath("Celestial");
        }
      }
    }
    if (needsCompact) compact(s.circles);
  }
  function drawImplosion(ctx) {
    const s = stateImplosion;

    for (const c of s.circles) {
      ctx.save();
      ctx.globalAlpha = c.opacity;
      ctx.translate(c.x, c.y);

      if (c.phase < 2) {
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;
        ctx.stroke();
        const glow = 200;
        const grad = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,192,1)");
        grad.addColorStop(1, "rgba(255,0,192,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "transparent";
      } else {
        const spikes = 6;

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.rotate(c.r);
        const glow = 200;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,192,1)");
        grad.addColorStop(1, "rgba(255,0,192,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
          const a = (i / spikes) * Math.PI * 2;
          const r1 = c.r * 0.5;
          const r2 = c.r * 1.5;

          const x1 = Math.cos(a) * r1;
          const y1 = Math.sin(a) * r1;

          const x2 = Math.cos(a + Math.PI / spikes) * r2;
          const y2 = Math.sin(a + Math.PI / spikes) * r2;

          if (i === 0) ctx.moveTo(x1, y1);
          else ctx.lineTo(x1, y1);

          ctx.lineTo(x2, y2);
        }
        ctx.closePath();

        ctx.stroke();

        ctx.strokeStyle = "transparent";
      }

      ctx.restore();
    }
  }
  function drawImplosionFront(ctx) {
    const s = stateImplosion;

    for (const c of s.circles) {
      ctx.save();
      ctx.globalAlpha = c.opacity;
      ctx.translate(c.x, c.y);

      if (c.phase < 2) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const spikes = 6;

        ctx.fillStyle = "black";

        ctx.rotate(c.r);
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
          const a = (i / spikes) * Math.PI * 2;
          const r1 = c.r * 0.5;
          const r2 = c.r * 1.5;

          const x1 = Math.cos(a) * r1;
          const y1 = Math.sin(a) * r1;

          const x2 = Math.cos(a + Math.PI / spikes) * r2;
          const y2 = Math.sin(a + Math.PI / spikes) * r2;

          if (i === 0) ctx.moveTo(x1, y1);
          else ctx.lineTo(x1, y1);

          ctx.lineTo(x2, y2);
        }
        ctx.closePath();

        ctx.fill();
      }

      ctx.restore();
    }
  }

  const statePizzaCutter = {
    spokes: [],
    t: 0,
    cycle: 0,
    spawned: false,
    cx: 0,
    cy: 0,
  };
  function enterPizzaCutter() {
    statePizzaCutter.spokes = [];
    statePizzaCutter.t = 0;
    statePizzaCutter.cycle = 0;
    statePizzaCutter.spawned = false;
    const cx = mouse.x + (Math.random() - 0.5) * 2000;
    const cy = mouse.y + (Math.random() - 0.5) * 2000;
    statePizzaCutter.cx = cx;
    statePizzaCutter.cy = cy;
    changeEnemy(Celestial_CutterStart, false, () => {
      changeEnemy(Celestial_CutterLoop, true);
    });
    enterFixed(cx, cy);
  }
  function updatePizzaCutter(dt) {
    const mx = mouse.x;
    const my = mouse.y;
    statePizzaCutter.t += dt;

    if (!statePizzaCutter.spawned) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/PizzaCutter/Cutter_Charge.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
      statePizzaCutter.spokes.push(spawnPizza());
      statePizzaCutter.spawned = true;
    }

    for (const s of statePizzaCutter.spokes) {
      s.t += dt;

      const p = Math.min(s.t / 2, 1);
      const eased = 1 - (1 - p) * (1 - p);
      s.angle = s.startAngle + (s.targetAngle - s.startAngle) * eased;

      if (s.t >= 2 && s.t < 2.5) {
        const len = 20000;
        const w = 90;

        const dx = mx - s.x;
        const dy = my - s.y;

        for (let i = 0; i < (hardMode ? 10 : 8); i++) {
          const angle = s.angle + i * (Math.PI / (hardMode ? 5 : 4));

          const cos = Math.cos(-angle);
          const sin = Math.sin(-angle);

          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;

          const halfLen = len;
          const halfW = w / 2;

          if (Math.abs(rx) < halfLen && Math.abs(ry) < halfW) {
            checkDeath("Celestial");
            break;
          }
        }
      }
      if (s.t >= 2.5) {
        s.offset += dt * 10000;
      }
      if (s.t > 3) {
        s.active = false;
      }
    }

    if (
      statePizzaCutter.t >= 1.75 &&
      statePizzaCutter.cycle == 3 &&
      !statePizzaCutter.change
    ) {
      statePizzaCutter.change = true;
      changeEnemy(Celestial_CutterEnd);
    }
    if (statePizzaCutter.t >= 2) {
      statePizzaCutter.t = 0;
      statePizzaCutter.cycle++;
      shakeScreen();
      if (statePizzaCutter.cycle < 4) {
        statePizzaCutter.spawned = false;
        statePizzaCutter.change = false;
        playSound(
          `./ASSET/Sound/Enemies/Celestial/PizzaCutter/Cutter_Impact.ogg`,
          0.9,
          undefined,
          undefined,
          undefined,
          "50",
        );
      } else {
        playSound(
          `./ASSET/Sound/Enemies/Celestial/PizzaCutter/Cutter_Final.ogg`,
          0.9,
          undefined,
          undefined,
          undefined,
          "50",
        );
      }
    }
  }
  function drawPizzaCutter(ctx) {
    for (const s of statePizzaCutter.spokes) {
      ctx.save();

      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      const isLethal = s.t >= 2;

      for (let i = 0; i < (hardMode ? 10 : 8); i++) {
        ctx.rotate(Math.PI / (hardMode ? 5 : 4));

        const w = isLethal ? 90 : 100;
        const dx = mouse.x - s.x;
        const dy = mouse.y - s.y;

        const cos = Math.cos(-(s.angle + i * (Math.PI / (hardMode ? 5 : 4))));
        const sin = Math.sin(-(s.angle + i * (Math.PI / (hardMode ? 5 : 4))));

        const rx = dx * cos - dy * sin;
        const x = rx - BEAM_RADIUS;
        const len = BEAM_RADIUS * 2;

        if (isLethal) {
          ctx.globalAlpha = s.t >= 2.75 ? Math.min(0, (3 - s.t) * 4) : 1;

          const drawX = Math.max(x, s.offset);
          const glow = 100;

          const gradTop = ctx.createLinearGradient(0, -w / 2 - glow, 0, -w / 2);
          gradTop.addColorStop(0, "rgba(255,0,192,0)");
          gradTop.addColorStop(1, "rgba(255,0,192,1)");

          ctx.fillStyle = gradTop;
          ctx.fillRect(drawX, -w / 2 - glow, len, glow);

          const gradBot = ctx.createLinearGradient(0, w / 2, 0, w / 2 + glow);
          gradBot.addColorStop(0, "rgba(255,0,192,1)");
          gradBot.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = gradBot;
          ctx.fillRect(drawX, w / 2, len, glow);

          const leftGrad = ctx.createLinearGradient(drawX - glow, 0, drawX, 0);
          leftGrad.addColorStop(0, "rgba(255,0,192,0)");
          leftGrad.addColorStop(1, "#ff00cc");

          ctx.fillStyle = leftGrad;
          ctx.fillRect(drawX - glow, -w / 2 - 1, glow, w + 2);

          const rightGrad = ctx.createLinearGradient(
            drawX + len,
            0,
            drawX + len + glow,
            0,
          );
          rightGrad.addColorStop(0, "#ff00cc");
          rightGrad.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = rightGrad;
          ctx.fillRect(drawX + len, -w / 2 - 1, glow, w + 2);

          const points = [
            [drawX, -w / 2, -0.9983, -1.0083],
            [drawX + len, -w / 2, -0.0017, -1.0083],
            [drawX, w / 2, -0.9983, 0.0083],
            [drawX + len, w / 2, -0.0017, 0.0083],
          ];

          for (const [px, py, ox, oy] of points) {
            const grad = ctx.createRadialGradient(px, py, 0, px, py, glow);

            grad.addColorStop(0, "#ff00cc");
            grad.addColorStop(1, "rgba(255,0,192,0)");

            ctx.fillStyle = grad;
            ctx.fillRect(px + ox * glow, py + oy * glow, glow, glow);
          }

          ctx.strokeStyle = "#ff00cc";
          ctx.lineWidth = 1;
          ctx.strokeRect(drawX, -w / 2, len, w);
        } else if (i < (hardMode ? 5 : 4)) {
          ctx.globalAlpha =
            s.t < 0.25 && statePizzaCutter.cycle == 0 ? s.t * 3 : 0.75;

          const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
          grad.addColorStop(0, "rgba(255,0,192,0)");
          grad.addColorStop(0.45, "#ff00cc");
          grad.addColorStop(0.55, "#ff00cc");
          grad.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = grad;
          ctx.fillRect(x, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
  }
  function drawPizzaCutterFront(ctx) {
    for (const s of statePizzaCutter.spokes) {
      ctx.save();

      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      const isLethal = s.t >= 2;

      for (let i = 0; i < (hardMode ? 10 : 8); i++) {
        ctx.rotate(Math.PI / (hardMode ? 5 : 4));

        const w = 90;
        const dx = mouse.x - s.x;
        const dy = mouse.y - s.y;

        const cos = Math.cos(-(s.angle + i * (Math.PI / (hardMode ? 5 : 4))));
        const sin = Math.sin(-(s.angle + i * (Math.PI / (hardMode ? 5 : 4))));

        const rx = dx * cos - dy * sin;
        const x = rx - BEAM_RADIUS;
        const len = BEAM_RADIUS * 2;

        if (isLethal) {
          ctx.globalAlpha = s.t >= 2.75 ? (3 - s.t) * 4 : 1;
          ctx.beginPath();
          ctx.fillStyle = "black";
          ctx.fillRect(Math.max(x, s.offset), -w / 2, len, w);
        }
      }

      ctx.restore();
    }
  }

  const statePizzaCutterCrumble = {
    spokes: [],
    t: 0,
    cycle: 0,
    spawned: false,
    cx: 0,
    cy: 0,

    circles: [],
  };
  function enterPizzaCutterCrumble() {
    statePizzaCutterCrumble.spokes = [];
    statePizzaCutterCrumble.t = 0;
    statePizzaCutterCrumble.cycle = 0;
    statePizzaCutterCrumble.spawned = false;
    const cx = mouse.x + (Math.random() - 0.5) * 2000;
    const cy = mouse.y + (Math.random() - 0.5) * 2000;
    statePizzaCutterCrumble.cx = cx;
    statePizzaCutterCrumble.cy = cy;
    enterFixed(cx, cy);
    changeEnemy(Celestial_CutterStart, false, () => {
      changeEnemy(Celestial_CutterLoop, true);
    });
    statePizzaCutterCrumble.circles = [];
  }
  function updatePizzaCutterCrumble(dt) {
    const mx = mouse.x;
    const my = mouse.y;
    statePizzaCutterCrumble.t += dt;

    if (!statePizzaCutterCrumble.spawned) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/PizzaCutter/Cutter_Charge.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
      statePizzaCutterCrumble.spokes.push(spawnPizza(statePizzaCutterCrumble));
      for (let i = 0; i < 300; i++) {
        statePizzaCutterCrumble.circles.push(spawnCircle(2));
      }
      statePizzaCutterCrumble.spawned = true;
    }

    for (const s of statePizzaCutterCrumble.spokes) {
      s.t += dt;

      const p = Math.min(s.t / 2, 1);
      const eased = 1 - (1 - p) * (1 - p);
      s.angle = s.startAngle + (s.targetAngle - s.startAngle) * eased;

      if (s.t >= 2 && s.t < 2.5) {
        const len = 20000;
        const w = 90;

        const dx = mx - s.x;
        const dy = my - s.y;

        for (let i = 0; i < (hardMode ? 10 : 8); i++) {
          const angle = s.angle + i * (Math.PI / (hardMode ? 5 : 4));

          const cos = Math.cos(-angle);
          const sin = Math.sin(-angle);

          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;

          const halfLen = len;
          const halfW = w / 2;

          if (Math.abs(rx) < halfLen && Math.abs(ry) < halfW) {
            checkDeath("Celestial");
            break;
          }
        }
      }
      if (s.t >= 2.5) {
        s.offset += dt * 10000;
      }
      if (s.t > 3) {
        s.active = false;
      }
    }

    if (
      statePizzaCutterCrumble.t >= 1.75 &&
      statePizzaCutterCrumble.cycle == 3 &&
      !statePizzaCutterCrumble.change
    ) {
      statePizzaCutterCrumble.change = true;
      changeEnemy(Celestial_CutterEnd);
    }
    if (statePizzaCutterCrumble.t >= 2) {
      statePizzaCutterCrumble.t = 0;
      statePizzaCutterCrumble.cycle++;
      shakeScreen(2);
      if (statePizzaCutterCrumble.cycle < 4) {
        statePizzaCutterCrumble.spawned = false;
        statePizzaCutterCrumble.change = false;
        playSound(
          `./ASSET/Sound/Enemies/Celestial/PizzaCutter/Cutter_Impact.ogg`,
          0.9,
          undefined,
          undefined,
          undefined,
          "50",
        );
      } else {
        playSound(
          `./ASSET/Sound/Enemies/Celestial/PizzaCutter/Cutter_Final.ogg`,
          0.9,
          undefined,
          undefined,
          undefined,
          "50",
        );
      }
    }

    let needsCompact = false;
    for (const c of statePizzaCutterCrumble.circles) {
      c.t += dt;

      if (c.t < 2) {
        const p = c.t / 2;

        const eased = 1 - (1 - p) * (1 - p);

        c.x = c.sx + (c.tx - c.sx) * eased;
        c.y = c.sy + (c.ty - c.sy) * eased;
      }

      if (c.t < 0.5) {
        const p = c.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        c.r = c.targetR * eased;
      } else if (c.t < 2) {
        c.r = c.targetR;
      } else {
        c.r -= dt * 100;
        if (c.r <= 0) {
          c.active = false;
          needsCompact = true;
        }
      }

      if (c.t >= 2 && c.r >= 0) {
        const dx = mx - c.x;
        const dy = my - c.y;
        if (dx * dx + dy * dy <= c.r * c.r) {
          checkDeath("Celestial");
        }
      }
    }
    if (needsCompact) compact(statePizzaCutterCrumble.circles);
  }
  function drawPizzaCutterCrumble(ctx) {
    for (const s of statePizzaCutterCrumble.spokes) {
      ctx.save();

      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      const isLethal = s.t >= 2;

      for (let i = 0; i < (hardMode ? 10 : 8); i++) {
        ctx.rotate(Math.PI / (hardMode ? 5 : 4));

        const w = isLethal ? 90 : 100;
        const dx = mouse.x - s.x;
        const dy = mouse.y - s.y;

        const cos = Math.cos(-(s.angle + i * (Math.PI / (hardMode ? 5 : 4))));
        const sin = Math.sin(-(s.angle + i * (Math.PI / (hardMode ? 5 : 4))));

        const rx = dx * cos - dy * sin;
        const x = rx - BEAM_RADIUS;
        const len = BEAM_RADIUS * 2;

        if (isLethal) {
          ctx.globalAlpha = s.t >= 2.75 ? Math.min(0, (3 - s.t) * 4) : 1;

          const drawX = Math.max(x, s.offset);
          const glow = 100;

          const gradTop = ctx.createLinearGradient(0, -w / 2 - glow, 0, -w / 2);
          gradTop.addColorStop(0, "rgba(255,0,192,0)");
          gradTop.addColorStop(1, "rgba(255,0,192,1)");

          ctx.fillStyle = gradTop;
          ctx.fillRect(drawX, -w / 2 - glow, len, glow);

          const gradBot = ctx.createLinearGradient(0, w / 2, 0, w / 2 + glow);
          gradBot.addColorStop(0, "rgba(255,0,192,1)");
          gradBot.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = gradBot;
          ctx.fillRect(drawX, w / 2, len, glow);

          const leftGrad = ctx.createLinearGradient(drawX - glow, 0, drawX, 0);
          leftGrad.addColorStop(0, "rgba(255,0,192,0)");
          leftGrad.addColorStop(1, "#ff00cc");

          ctx.fillStyle = leftGrad;
          ctx.fillRect(drawX - glow, -w / 2 - 1, glow, w + 2);

          const rightGrad = ctx.createLinearGradient(
            drawX + len,
            0,
            drawX + len + glow,
            0,
          );
          rightGrad.addColorStop(0, "#ff00cc");
          rightGrad.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = rightGrad;
          ctx.fillRect(drawX + len, -w / 2 - 1, glow, w + 2);

          const points = [
            [drawX, -w / 2, -0.9983, -1.0083],
            [drawX + len, -w / 2, -0.0017, -1.0083],
            [drawX, w / 2, -0.9983, 0.0083],
            [drawX + len, w / 2, -0.0017, 0.0083],
          ];

          for (const [px, py, ox, oy] of points) {
            const grad = ctx.createRadialGradient(px, py, 0, px, py, glow);

            grad.addColorStop(0, "#ff00cc");
            grad.addColorStop(1, "rgba(255,0,192,0)");

            ctx.fillStyle = grad;
            ctx.fillRect(px + ox * glow, py + oy * glow, glow, glow);
          }

          ctx.strokeStyle = "#ff00cc";
          ctx.lineWidth = 1;
          ctx.strokeRect(drawX, -w / 2, len, w);
        } else if (i < (hardMode ? 5 : 4)) {
          ctx.globalAlpha =
            s.t < 0.25 && statePizzaCutterCrumble.cycle == 0 ? s.t * 3 : 0.75;

          const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
          grad.addColorStop(0, "rgba(255,0,192,0)");
          grad.addColorStop(0.45, "#ff00cc");
          grad.addColorStop(0.55, "#ff00cc");
          grad.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = grad;
          ctx.fillRect(x, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
    for (const c of statePizzaCutterCrumble.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t >= 2 && c.r >= 0) {
        const glow = 100;

        const grad = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,192,1)");
        grad.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "transparent";
      }

      ctx.restore();
    }
  }
  function drawPizzaCutterCrumbleFront(ctx) {
    for (const s of statePizzaCutterCrumble.spokes) {
      ctx.save();

      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      const isLethal = s.t >= 2;

      for (let i = 0; i < (hardMode ? 10 : 8); i++) {
        ctx.rotate(Math.PI / (hardMode ? 5 : 4));

        const w = 90;
        const dx = mouse.x - s.x;
        const dy = mouse.y - s.y;

        const cos = Math.cos(-(s.angle + i * (Math.PI / (hardMode ? 5 : 4))));
        const sin = Math.sin(-(s.angle + i * (Math.PI / (hardMode ? 5 : 4))));

        const rx = dx * cos - dy * sin;
        const x = rx - BEAM_RADIUS;
        const len = BEAM_RADIUS * 2;

        if (isLethal) {
          ctx.globalAlpha = s.t >= 2.75 ? (3 - s.t) * 4 : 1;
          ctx.beginPath();
          ctx.fillStyle = "black";
          ctx.fillRect(Math.max(x, s.offset), -w / 2, len, w);
        }
      }

      ctx.restore();
    }
    for (const c of statePizzaCutterCrumble.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t < 2) {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r);
        grad.addColorStop(0, "black");
        grad.addColorStop(1, "#ff00cc");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.r >= 0) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  const stateFutile = {
    t: 0,
    cycle: 0,

    rift: null,
    snake: null,
    trail: [],
  };
  function enterFutile() {
    const s = stateFutile;

    s.t = 0;
    s.cycle = 0;
    s.snake = null;

    s.rift = spawnFutileRift();
    s.trail = [];
    enterFixed(-1000, -1000);

    if (truePattern == false) showText("FUTILE.");
  }
  function updateFutile(dt) {
    const mx = mouse.x;
    const my = mouse.y;
    const s = stateFutile;

    s.t += dt;
    s.rift.t += dt;

    const r = s.rift;
    if (r.t <= dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Futile/Futile_Start.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
    } else if (r.t >= 1 && r.t <= 1 + dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Futile/Futile_Variation_${Math.floor(1 + Math.random() * 3)}.ogg`,
        undefined,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }
    if (r.t < 0.25) {
      const p = r.t / 0.25;
      r.scale = 1 - (1 - p) * (1 - p);
    } else if (r.t < 1) {
      r.scale = 1;
    } else {
      const p = (r.t - 1) * 2;
      r.scale = Math.max(0, 1 - p * p);
    }

    if (s.rift.t >= 1 && s.rift.t < 3 && !s.snake) {
      s.snake = spawnSnake(s.rift);
    }

    const sn = s.snake;
    if (sn) {
      const dx = mx - sn.x;
      const dy = my - sn.y;

      const vLen = Math.sqrt(sn.vx * sn.vx + sn.vy * sn.vy) || 1;
      const vx = sn.vx / vLen;
      const vy = sn.vy / vLen;

      const px = -vy;
      const py = vx;

      const side = dx * px + dy * py;
      const forward = dx * vx + dy * vy;
      const TURN_STRENGTH = 12 * (forward < 0 ? 0.5 : 1) * (hardMode ? 2 : 1);

      sn.vx += px * side * TURN_STRENGTH * dt;
      sn.vy += py * side * TURN_STRENGTH * dt;

      const newLen = Math.sqrt(sn.vx * sn.vx + sn.vy * sn.vy) || 1;
      const speed = 2500;

      sn.vx = (sn.vx / newLen) * speed;
      sn.vy = (sn.vy / newLen) * speed;

      sn.x += sn.vx * dt;
      sn.y += sn.vy * dt;

      const off = 100;
      if (s.rift.t < 3) {
        s.trail.push({
          x: sn.x + (Math.random() - 0.5) * off,
          y: sn.y + (Math.random() - 0.5) * off,
          r: 200,
          a: Math.random() * Math.PI * 2,
        });
        shakeScreen();
      }

      if (s.rift.t >= 3) {
        sn.vx *= 0.85;
        sn.vy *= 0.85;
      }
    }

    for (const p of s.trail) {
      const dx = p.x - mx;
      const dy = p.y - my;
      if (dx * dx + dy * dy < p.r * p.r) {
        checkDeath("Celestial");
      }
      p.r -=
        dt * Math.max(50, p.r) * 1.25 * (s.t >= 12 ? (s.t - 11) * 1.25 : 1);
    }
    s.trail = s.trail.filter((p) => p.r > 0);

    if (s.rift.t >= 3) {
      s.cycle++;

      if (s.cycle < 4) {
        s.rift = spawnFutileRift();
      }

      s.snake = null;
    }
  }
  function drawFutile(ctx) {
    const s = stateFutile;

    if (s.rift) {
      const pts = s.rift.points;

      ctx.save();
      ctx.translate(s.rift.x, s.rift.y);
      ctx.rotate(s.rift.angle);
      ctx.scale(s.rift.scale, s.rift.scale);

      const glowSize = 300;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
      glow.addColorStop(0, "rgba(255,0,192,1)");
      glow.addColorStop(1, "rgba(255,0,192,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (i === 0) ctx.moveTo(p.lx, p.y);
        else ctx.lineTo(p.lx, p.y);
      }

      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        ctx.lineTo(p.rx, p.y);
      }

      ctx.closePath();

      ctx.strokeStyle = "#ff00cc";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }

    for (const p of s.trail) {
      ctx.save();

      ctx.translate(p.x, p.y);

      const glowSize = 100;
      const glow = ctx.createRadialGradient(0, 0, p.r, 0, 0, p.r + glowSize);
      glow.addColorStop(0, "rgba(255,0,192,1)");
      glow.addColorStop(1, "rgba(255,0,192,0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, p.r + glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = "#ff00cc";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.rotate(p.a);

      const len = Math.max(0, Math.min(30, p.r * 0.6 - 30));
      const w = 1000;

      if (len > 0) {
        const grad = ctx.createLinearGradient(
          -len / 2 - glowSize,
          0,
          -len / 2,
          0,
        );
        grad.addColorStop(0, "rgba(255,0,192,0)");
        grad.addColorStop(1, `rgba(255,0,192,1)`);

        ctx.fillStyle = grad;
        ctx.fillRect(-len / 2 - glowSize, -w / 2, glowSize, w);

        const grad2 = ctx.createLinearGradient(
          len / 2,
          0,
          len / 2 + glowSize,
          0,
        );
        grad2.addColorStop(0, `rgba(255,0,192,1)`);
        grad2.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = grad2;
        ctx.fillRect(len / 2, -w / 2, glowSize, w);

        const topGrad = ctx.createLinearGradient(
          0,
          -w / 2 - glowSize,
          0,
          -w / 2,
        );
        topGrad.addColorStop(0, "rgba(255,0,192,0)");
        topGrad.addColorStop(1, "#ff00cc");

        ctx.fillStyle = topGrad;
        ctx.fillRect(-len / 2 - 1, -w / 2 - glowSize, len + 2, glowSize);

        const bottomGrad = ctx.createLinearGradient(
          0,
          w / 2,
          0,
          w / 2 + glowSize,
        );
        bottomGrad.addColorStop(0, "#ff00cc");
        bottomGrad.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = bottomGrad;
        ctx.fillRect(-len / 2 - 1, w / 2, len + 2, glowSize);

        const points = [
          [-len / 2, -w / 2, -1.0083, -0.9983],
          [len / 2, -w / 2, 0.0083, -0.9983],
          [-len / 2, w / 2, -1.0083, -0.0017],
          [len / 2, w / 2, 0.0083, -0.0017],
        ];
        for (const [x, y, ox, oy] of points) {
          const grad = ctx.createRadialGradient(x, y, 0, x, y, glowSize);

          grad.addColorStop(0, "#ff00cc");
          grad.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = grad;
          ctx.fillRect(
            x + ox * glowSize,
            y + oy * glowSize,
            glowSize,
            glowSize,
          );
        }

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;
        ctx.strokeRect(-len / 2, -w / 2, len, w);
      }

      ctx.restore();
    }
  }
  function drawFutileFront(ctx) {
    const s = stateFutile;

    if (s.rift) {
      const pts = s.rift.points;

      ctx.save();
      ctx.translate(s.rift.x, s.rift.y);
      ctx.rotate(s.rift.angle);
      ctx.scale(s.rift.scale, s.rift.scale);

      ctx.beginPath();

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (i === 0) ctx.moveTo(p.lx, p.y);
        else ctx.lineTo(p.lx, p.y);
      }

      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        ctx.lineTo(p.rx, p.y);
      }

      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.fill();

      ctx.restore();
    }

    for (const p of s.trail) {
      ctx.save();

      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);

      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();

      const len = Math.max(0, Math.min(30, p.r * 0.6 - 30));
      const w = 1000;

      if (len > 0) {
        ctx.fillStyle = "black";
        ctx.fillRect(-len / 2, -w / 2, len, w);
      }

      ctx.restore();
    }

    const r = stateFutile.rift;
    if (s.rift && s.rift.t <= 2 && r) {
      const cam = getCameraPos();

      const cx = cam.x + window.innerWidth / 2;
      const cy = cam.y + window.innerHeight / 2;

      const dx = r.x - cx;
      const dy = r.y - cy;
      const ang = Math.atan2(dy, dx);

      const halfW = window.innerWidth / 2 - 60;
      const halfH = window.innerHeight / 2 - 60;

      const scale =
        Math.min(
          halfW / (Math.abs(Math.cos(ang)) || 0.0001),
          halfH / (Math.abs(Math.sin(ang)) || 0.0001),
        ) * 0.7;

      const ex = cx + Math.cos(ang) * scale;
      const ey = cy + Math.sin(ang) * scale;

      const pts = r.points;

      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(ang);

      ctx.scale(s.rift.scale * 0.5, s.rift.scale * 0.5);

      const glowSize = 300;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
      glow.addColorStop(0, "rgba(255,0,192,1)");
      glow.addColorStop(0.5, "rgba(255,0,192,0.75)");
      glow.addColorStop(1, "rgba(255,0,192,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (i === 0) ctx.moveTo(p.lx, p.y);
        else ctx.lineTo(p.lx, p.y);
      }

      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        ctx.lineTo(p.rx, p.y);
      }

      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.fill();

      ctx.strokeStyle = "#ff00cc";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(ang);

      ctx.fillStyle = "#ff00cc";
      ctx.font = `${s.rift.scale * 100}px monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      ctx.fillText("➤", s.rift.scale * 100, 0);

      ctx.restore();
    }
  }

  const stateCrumble = {
    circles: [],
    t: 0,
  };
  function enterCrumble() {
    enterOrbit();
    stateCrumble.circles = [];
    for (let i = 0; i < 400; i++) {
      stateCrumble.circles.push(spawnCircle());
    }

    if (truePattern == false) showText("CRUMBLE.");
  }
  function updateCrumble(dt) {
    const mx = mouse.x;
    const my = mouse.y;
    let needsCompact = false;
    stateCrumble.t += dt;
    if (stateCrumble.t >= 2 && stateCrumble.t <= 2 + dt) {
      playSound(`./ASSET/Sound/Enemies/Celestial/Cease/Cease_Impact.ogg`);
    }
    for (const c of stateCrumble.circles) {
      c.t += dt;

      if (c.t < 2) {
        const p = c.t / 2;

        const eased = 1 - (1 - p) * (1 - p);

        c.x = c.sx + (c.tx - c.sx) * eased;
        c.y = c.sy + (c.ty - c.sy) * eased;
      }

      if (c.t < 0.5) {
        const p = c.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        c.r = c.targetR * eased;
      } else if (c.t < 2) {
        c.r = c.targetR;
      } else {
        if (!c.shake) {
          c.shake = true;
          shakeScreen();
        }
        c.r -= dt * 200;
        if (c.r <= 0) {
          c.active = false;
          needsCompact = true;
        }
      }

      if (c.t >= 2) {
        const dx = mx - c.x;
        const dy = my - c.y;
        if (dx * dx + dy * dy <= c.r * c.r) {
          checkDeath("Celestial");
        }
      }
    }
    if (needsCompact) compact(stateCrumble.circles);
  }
  function drawCrumble(ctx) {
    for (const c of stateCrumble.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t >= 2 && c.r >= 0) {
        const glow = 100;

        const grad = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,192,1)");
        grad.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "transparent";
      }

      ctx.restore();
    }
  }
  function drawCrumbleFront(ctx) {
    for (const c of stateCrumble.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t < 2) {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r);
        grad.addColorStop(0, "black");
        grad.addColorStop(1, "#ff00cc");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.r >= 0) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  const stateBitter = {
    spokes: [],
    t: 0,
    cycle: 0,
    spawned: false,
    cx: 0,
    cy: 0,
  };
  function enterBitter() {
    stateBitter.spokes = [];
    stateBitter.t = 0;
    stateBitter.cycle = 0;
    stateBitter.spawned = false;

    const cx = mouse.x + (Math.random() - 0.5) * 2000;
    const cy = mouse.y + (Math.random() - 0.5) * 2000;
    stateBitter.cx = cx;
    stateBitter.cy = cy;
    enterFixed(cx, cy);

    if (truePattern == false) showText("BITTER.");
  }
  function updateBitter(dt) {
    const mx = mouse.x;
    const my = mouse.y;
    const s = stateBitter;
    s.t += dt;

    const dx = mx - s.cx;
    const dy = my - s.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 1800;
    if (dist > maxDist) {
      const nx = dx / dist;
      const ny = dy / dist;

      s.cx = mx - nx * maxDist;
      s.cy = my - ny * maxDist;

      enterFixed(s.cx, s.cy, false);
      for (const b of s.spokes) {
        if (b.t <= 2) {
          b.x = s.cx;
          b.y = s.cy;
        }
      }
    }

    if (!s.spawned) {
      const counts = hardMode ? [6, 7, 8] : [4, 5, 6];
      s.spokes.push(spawnBitter(counts[s.cycle]));
      s.spawned = true;
    }

    for (const b of s.spokes) {
      b.t += dt;

      const p = Math.min(b.t / 2, 1);
      const eased = 1 - (1 - p) * (1 - p);
      let angle = b.baseAngle + eased * Math.PI * 2 * b.dirAngle;
      angle += (b.t - 2) * Math.PI * b.dirAngle;
      b.angle = angle;

      const dx = mx - b.x;
      const dy = my - b.y;
      if (b.t >= 2 && !b.shot) {
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        b.dirX = dx / len;
        b.dirY = dy / len;

        b.shot = true;
      }
      if (b.t >= 2) {
        const speed = 1500;

        b.x += b.dirX * speed * dt;
        b.y += b.dirY * speed * dt;
      }

      if (b.t >= 2 && b.t <= 5) {
        for (let i = 0; i < b.count; i++) {
          const ang = b.angle + (i * Math.PI * 2) / b.count;

          const cos = Math.cos(-ang);
          const sin = Math.sin(-ang);

          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;

          const len = 1000;
          const w = 25;

          if (rx > 0 && rx < len && Math.abs(ry) < w / 2) {
            checkDeath("Celestial");
            break;
          }
        }
      }

      if (b.t > 5) b.active = false;
    }

    s.spokes = s.spokes.filter((b) => b.active);

    if (s.t >= 0.5 && s.t <= 0.5 + dt && s.cycle <= 2) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Bitter/Bitter_Charge.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }
    if (s.t >= 2) {
      s.t = 0;
      s.cycle++;
      if (s.cycle <= 3) {
        shakeScreen();
        playSound(
          `./ASSET/Sound/Enemies/Celestial/Bitter/Bitter_Shoot.ogg`,
          0.9,
          undefined,
          undefined,
          undefined,
          "50",
        );
      }
      s.spawned = false;
    }
  }
  function drawBitter(ctx) {
    for (const b of stateBitter.spokes) {
      ctx.save();

      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      const isLethal = b.t >= 2;

      for (let i = 0; i < b.count; i++) {
        ctx.rotate((Math.PI * 2) / b.count);

        const len = 1000;
        const w = isLethal ? 25 : 50;

        if (isLethal) {
          ctx.globalAlpha = b.t >= 4.75 ? (5 - b.t) * 4 : 1;
          const drawX = 0;

          const glow = 100;

          const gradTop = ctx.createLinearGradient(0, -w / 2 - glow, 0, -w / 2);
          gradTop.addColorStop(0, "rgba(255,0,192,0)");
          gradTop.addColorStop(1, "rgba(255,0,192,1)");

          ctx.fillStyle = gradTop;
          ctx.fillRect(drawX, -w / 2 - glow, len, glow);

          const gradBot = ctx.createLinearGradient(0, w / 2, 0, w / 2 + glow);
          gradBot.addColorStop(0, "rgba(255,0,192,1)");
          gradBot.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = gradBot;
          ctx.fillRect(drawX, w / 2, len, glow);

          const leftGrad = ctx.createLinearGradient(-glow, 0, 0, 0);
          leftGrad.addColorStop(0, "rgba(255,0,192,0)");
          leftGrad.addColorStop(1, "#ff00cc");

          ctx.fillStyle = leftGrad;
          ctx.fillRect(-glow, -w / 2 - 1, glow, w + 2);

          const rightGrad = ctx.createLinearGradient(len, 0, len + glow, 0);
          rightGrad.addColorStop(0, "#ff00cc");
          rightGrad.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = rightGrad;
          ctx.fillRect(len, -w / 2 - 1, glow, w + 2);

          const points = [
            [0, -w / 2, -0.9983, -1.0083],
            [len, -w / 2, -0.0017, -1.0083],
            [0, w / 2, -0.9983, 0.0083],
            [len, w / 2, -0.0017, 0.0083],
          ];
          for (const [x, y, ox, oy] of points) {
            const grad = ctx.createRadialGradient(x, y, 0, x, y, glow);

            grad.addColorStop(0, "#ff00cc");
            grad.addColorStop(1, "rgba(255,0,192,0)");

            ctx.fillStyle = grad;
            ctx.fillRect(x + ox * glow, y + oy * glow, glow, glow);
          }

          ctx.strokeStyle = "#ff00cc";
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.rect(drawX, -w / 2, len, w);
          ctx.stroke();
        } else {
          ctx.globalAlpha =
            stateBitter.t < 0.25 && stateBitter.cycle == 0
              ? stateBitter.t * 3
              : 0.75;

          const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
          grad.addColorStop(0, "rgba(255,0,192,0)");
          grad.addColorStop(0.45, "#ff00cc");
          grad.addColorStop(0.55, "#ff00cc");
          grad.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = grad;
          ctx.fillRect(0, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
  }
  function drawBitterFront(ctx) {
    for (const b of stateBitter.spokes) {
      ctx.save();

      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      const isLethal = b.t >= 2;

      for (let i = 0; i < b.count; i++) {
        ctx.rotate((Math.PI * 2) / b.count);

        const len = 1000;
        const w = isLethal ? 25 : 50;

        if (isLethal) {
          ctx.globalAlpha = b.t >= 4.75 ? (5 - b.t) * 4 : 1;
          const drawX = 0;

          ctx.fillStyle = "black";
          ctx.fillRect(drawX, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
  }

  const stateCease = {
    beams: [],
    timer: 0,
    rapidTimer: 0,
    circle: {
      t: 0,
      active: false,
      x: 0,
      y: 0,
    },
    positions: [],
  };
  function enterCease() {
    enterOrbit();
    stateCease.beams = [];
    stateCease.timer = 0;
    stateCease.rapidTimer = 0;
    stateCease.circle = {
      t: 0,
      active: true,
      x: mouse.x,
      y: mouse.y,
    };
    stateCease.positions = [];
    stateCease.change = false;

    if (truePattern == false) showText("CEASE.");
  }
  function updateCease(dt) {
    const mx = mouse.x;
    const my = mouse.y;
    stateCease.timer += dt;
    stateCease.rapidTimer += dt;

    if (stateCease.timer <= dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Cease/Cease_Charge.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }

    const interval = 0.5 / (hardMode ? 60 : 40);
    while (
      stateCease.rapidTimer >= interval &&
      stateCease.beams.length < (hardMode ? 60 : 40) &&
      stateCease.timer <= 1
    ) {
      stateCease.rapidTimer -= interval;

      let x, y;
      const minDist = 500;

      do {
        x = mx + (Math.random() - 0.5) * 5000;
        y = my + (Math.random() - 0.5) * 5000;
      } while (
        stateCease.positions.some((p) => {
          const dx = x - p.x;
          const dy = y - p.y;
          return dx * dx + dy * dy < minDist * minDist;
        })
      );

      stateCease.positions.push({ x, y });

      stateCease.beams.push(
        spawnBeam(x, y, Math.random() * Math.PI * 2, 2 - stateCease.timer),
      );
    }

    if (stateCease.circle.active) {
      const c = stateCease.circle;

      c.t += dt;
      if (c.t >= 1.25 && !c.change) {
        c.change = true;
        changeEnemy(Celestial_FinalSwing);
      }

      if (c.t < 0.5) {
        const p = c.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        c.r = 600 * eased;
      } else if (c.t < 2) {
        c.r = 600;
      } else {
        if (!c.shake) {
          c.shake = true;
          shakeScreen();
          playSound(
            `./ASSET/Sound/Enemies/Celestial/Cease/Cease_Impact.ogg`,
            0.9,
            undefined,
            undefined,
            undefined,
            "50",
          );
        }
        c.r -= dt * 800;
        if (c.r <= 0) {
          c.active = false;
        }
      }

      if (c.t >= 2) {
        const dx = mx - c.x;
        const dy = my - c.y;
        const distSq = dx * dx + dy * dy;

        if (distSq <= c.r * c.r) {
          checkDeath("Celestial");
        }
      }
    }

    let needsCompact = false;
    for (const b of stateCease.beams) {
      let a = b.angle;

      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }

      b.renderAngle = a;
      b.cos = Math.cos(-a);
      b.sin = Math.sin(-a);

      b.t += dt;

      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        b.width = b.targetWidth * eased;
      } else if (b.t < b.armTime) {
        b.width = b.targetWidth;
      } else {
        b.width -= dt * 200;
        if (b.width <= 0) {
          b.active = false;
          needsCompact = true;
        }
      }

      const dx = mouse.x - b.x;
      const dy = mouse.y - b.y;

      b.rx = dx * b.cos - dy * b.sin;
      b.ry = dx * b.sin + dy * b.cos;

      const rx = b.rx;
      const ry = b.ry;

      const halfLen = 2000;
      const halfW = b.width / 2;

      if (
        b.active &&
        b.t >= b.armTime &&
        Math.abs(rx) < halfLen &&
        Math.abs(ry) < halfW
      ) {
        checkDeath("Celestial");
      }
    }
    if (needsCompact) compact(stateCease.beams);
  }
  function drawCease(ctx) {
    for (const b of stateCease.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);
      ctx.rotate(b.renderAngle);

      const alpha = b.t < b.armTime ? 0.5 : 1;

      ctx.globalAlpha = alpha;
      if (b.t < b.armTime) {
        ctx.strokeStyle = "transparent";
      } else {
        ctx.strokeStyle = "#ff00cc";
      }
      ctx.lineWidth = 1;

      const dx = mouse.x - b.x;
      const dy = mouse.y - b.y;

      const x = b.rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      if (b.t >= b.armTime) {
        const glow = 100;
        const drawX = x;

        const gradTop = ctx.createLinearGradient(
          0,
          -b.width / 2 - glow,
          0,
          -b.width / 2,
        );
        gradTop.addColorStop(0, "rgba(255,0,192,0)");
        gradTop.addColorStop(1, "rgba(255,0,192,1)");

        ctx.fillStyle = gradTop;
        ctx.fillRect(drawX, -b.width / 2 - glow, len, glow);

        const gradBot = ctx.createLinearGradient(
          0,
          b.width / 2,
          0,
          b.width / 2 + glow,
        );
        gradBot.addColorStop(0, "rgba(255,0,192,1)");
        gradBot.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = gradBot;
        ctx.fillRect(drawX, b.width / 2, len, glow);
      }
      ctx.strokeRect(x, -b.width / 2, len, b.width);

      ctx.strokeStyle = "transparent";

      ctx.restore();
    }
    if (stateCease.circle.active) {
      const c = stateCease.circle;

      ctx.save();
      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t < 2) {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r);
        grad.addColorStop(0, "black");
        grad.addColorStop(1, "#ff00cc");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const glow = 100;

        const grad = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,192,1)");
        grad.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "transparent";
      }

      ctx.restore();
    }
  }
  function drawCeaseFront(ctx) {
    if (stateCease.circle.active) {
      const c = stateCease.circle;

      ctx.save();
      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t >= 2) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
    for (const b of stateCease.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);
      ctx.rotate(b.renderAngle);

      const alpha = b.t < b.armTime ? 0.5 : 1;

      ctx.globalAlpha = alpha;
      if (b.t < b.armTime) {
        ctx.fillStyle = "#ff00cc";
      } else {
        ctx.fillStyle = "black";
      }

      const dx = mouse.x - b.x;
      const dy = mouse.y - b.y;

      const x = b.rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      ctx.fillRect(x, -b.width / 2, len, b.width);

      ctx.restore();
    }
  }

  const stateDeathInBloom = {
    t: 0,
    cx: 0,
    cy: 0,
    ex: 0,
    ey: 0,
    prevMx: 0,
    prevMy: 0,
    len: 20000,
    w: hardMode ? 800 : 625,
    active: false,
    particles: [],
    pTimer: 0,
  };
  function enterDeathInBloom() {
    const s = stateDeathInBloom;

    s.t = 0;
    s.active = true;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const ang = Math.atan2(cy - mouse.y, cx - mouse.x);
    s.cx = mouse.x + Math.cos(ang) * 2000;
    s.cy = mouse.y + Math.sin(ang) * 2000;
    enterFixed(s.cx, s.cy);
    s.w = hardMode ? 800 : 625;
    s.angle = 0;
    s.prevAngle = 0;

    s.ex = mouse.x;
    s.ey = mouse.y;
    s.particles = [];
    s.pTimer = 0;
    setGiftMultiplier(0.5);

    if (truePattern == false) showText("DEATH IN BLOOM.");
  }
  function updateDeathInBloom(dt) {
    const mx = mouse.x;
    const my = mouse.y;
    const s = stateDeathInBloom;

    s.t += dt;
    s.pTimer += dt;

    const follow = 1 - Math.exp(-0.8 * dt);

    s.ex += (mx - s.ex) * follow;
    s.ey += (my - s.ey) * follow;

    const dx = s.ex - s.cx;
    const dy = s.ey - s.cy;

    s.angle += Math.atan2(dy, dx) - s.angle;
    const angleDelta = s.angle - s.prevAngle;
    s.prevAngle = s.angle;

    const mvx = mx - s.prevMx;
    const mvy = my - s.prevMy;
    s.prevMx = mx;
    s.prevMy = my;
    const bx = Math.cos(s.angle);
    const by = Math.sin(s.angle);
    const dir = mvx * bx + mvy * by;

    if (s.t < 22 && s.pTimer >= 0.02) {
      s.pTimer = 0;

      const spawnCount = 200;

      const nx = Math.cos(s.angle + Math.PI / 2);
      const ny = Math.sin(s.angle + Math.PI / 2);

      for (let i = 0; i < spawnCount; i++) {
        const angle = s.angle;
        const len = s.len;

        const t = Math.random();
        const along = t * len + 125;

        const forward = dir >= 0 ? 1 : -1;
        const edgeSide = Math.random() < 0.5 ? -1 : 1;
        const trailingOffset = (s.w / 2) * forward * edgeSide;
        const leadingOffset = (s.w / 1.5) * forward * edgeSide;
        const isLeading = Math.random() < 0.35;
        const spread = isLeading ? leadingOffset : trailingOffset;

        const px = s.cx + bx * along + nx * spread;
        const py = s.cy + by * along + ny * spread;

        if (s.t >= 5) {
          s.particles.push({
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * (s.t > 5 ? 1000 : 100),
            vy: (Math.random() - 0.5) * (s.t > 5 ? 1000 : 100),
            r: Math.random() * 40,
            t: 0,
            life: 0.25 + Math.random() * 0.25,
            active: true,
          });
        }

        if (s.t < 5 && Math.random() < 0.05) {
          const innerSpread = (Math.random() - 0.5) * s.w * 0.8;

          const px2 = s.cx + bx * along + nx * innerSpread;
          const py2 = s.cy + by * along + ny * innerSpread;

          const speed = 200 * (0.5 + Math.random() * 0.5);
          s.particles.push({
            x: px2,
            y: py2,
            vx: bx * speed,
            vy: by * speed,
            r: Math.random() * 40 + 40,
            t: 0,
            life: 0.5 + Math.random() * 0.5,
            active: true,
            ellipse: true,
          });
        }
      }
    }

    const cos = Math.cos(-s.angle);
    const sin = Math.sin(-s.angle);

    if (s.t >= 5) {
      if (s.t <= 22) shakeScreen();
      const mmx = mx - s.cx;
      const mmy = my - s.cy;

      const rx = mmx * cos - mmy * sin;
      const ry = mmx * sin + mmy * cos;

      if (rx > 0 && rx < s.len && Math.abs(ry) < s.w / 2 && s.active) {
        checkDeath("Celestial");
      }
    }

    let needsCompact = false;
    for (const p of s.particles) {
      p.t += dt;

      if (p.ellipse) {
        const c = Math.cos(angleDelta);
        const sA = Math.sin(angleDelta);

        const rx = p.x - s.cx;
        const ry = p.y - s.cy;

        p.x = s.cx + rx * c - ry * sA;
        p.y = s.cy + rx * sA + ry * c;

        const rvx = p.vx;
        const rvy = p.vy;

        p.vx = rvx * c - rvy * sA;
        p.vy = rvx * sA + rvy * c;

        const accel = 200 * dt;
        p.vx += Math.cos(s.angle) * accel;
        p.vy += Math.sin(s.angle) * accel;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += dt * 5;

      if (p.t > p.life) {
        p.active = false;
        needsCompact = true;
      }

      const dx = p.x - s.cx;
      const dy = p.y - s.cy;

      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;

      const halfLen = s.len;
      const halfW = s.w / 2 + 100;

      if (Math.abs(rx) > halfLen || Math.abs(ry) > halfW) {
        p.active = false;
        needsCompact = true;
      }
    }
    if (needsCompact) compact(s.particles);

    if (s.t <= dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/DeathInBloom/Death_in_Bloom_Charge.ogg`,
        1.1,
        undefined,
        undefined,
        undefined,
        "50",
      );
    } else if (s.t >= 5 && s.t <= 5 + dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/DeathInBloom/Death_in_Bloom_Firing.ogg`,
        0.706,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }

    if (s.t >= 5 && s.t < 22) {
      s.w = Math.random() * 50 + (hardMode ? 750 : 575);
    }
    if (s.t >= 22) {
      s.w -= dt * 1000;
      if (s.w <= 0 && s.active) {
        s.w = 0;
        setGiftMultiplier(2);
        s.active = false;
      }
    }
  }
  function drawDeathInBloom(ctx) {
    const s = stateDeathInBloom;

    if (s.active) {
      for (const p of s.particles) {
        ctx.save();

        ctx.globalAlpha = (s.t > 5 ? 1 : 0.2) * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.beginPath();
        if (!p.ellipse) {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

          ctx.strokeStyle = "#ff00cc";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      }

      ctx.save();

      const forwardOffset = 125;
      const ox = s.cx + Math.cos(s.angle) * forwardOffset;
      const oy = s.cy + Math.sin(s.angle) * forwardOffset;
      ctx.translate(ox, oy);
      ctx.rotate(s.angle);

      const dx = mouse.x - s.cx;
      const dy = mouse.y - s.cy;

      const cos = Math.cos(-s.angle);
      const sin = Math.sin(-s.angle);

      const rx = dx * cos - dy * sin;
      const x = rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;
      const randLineWidth = 18 * (Math.random() + 2);

      const isLethal = s.t >= 5;

      ctx.save();
      if (isLethal) {
        const alpha = s.t < 0.25 ? s.t * 4 : 1;

        const glowLen = 1500;
        const glowWidth = s.w * 1.1;

        ctx.scale(1, glowWidth / glowLen);

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowLen);
        grad.addColorStop(0, "#ff00cc");
        grad.addColorStop(0.5, "#ff00cc");
        grad.addColorStop(1, "rgba(255,0,192,0)");

        ctx.globalAlpha = (Math.random() * 0.25 + 0.75) * alpha;
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.arc(0, 0, glowLen, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.save();

      ctx.beginPath();
      ctx.moveTo(-randLineWidth / 2, -s.w / 2 - randLineWidth / 2);
      ctx.lineTo(-randLineWidth / 2, s.w / 2 + randLineWidth / 2);
      ctx.lineTo(-forwardOffset - randLineWidth / 2, 0);
      ctx.closePath();

      if (isLethal) {
        ctx.fillStyle = "#ff00cc";
        ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.fill();
      }

      ctx.restore();

      if (!isLethal) {
        ctx.globalAlpha = 0.25 * (s.t < 0.25 ? s.t * 4 : 1);
        ctx.fillStyle = "#ff00cc";
      } else {
        ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.rect(Math.max(x, 0), -s.w / 2, len, s.w);
        ctx.stroke();

        ctx.fillStyle = "black";
      }

      const edgeOffset = s.w / 2;
      const glowSize = 400;

      ctx.save();
      ctx.globalAlpha =
        (isLethal ? Math.random() * 0.25 + 0.75 : 0.05) *
        (s.t < 0.25 ? s.t * 4 : 1);

      let grad = ctx.createLinearGradient(
        0,
        -edgeOffset - glowSize,
        0,
        -edgeOffset,
      );
      grad.addColorStop(0, "rgba(255,0,192,0)");
      grad.addColorStop(1, "#ff00cc");

      ctx.fillStyle = grad;
      ctx.fillRect(Math.max(x, 0), -edgeOffset - glowSize, len, glowSize);

      let grad2 = ctx.createLinearGradient(
        0,
        edgeOffset,
        0,
        edgeOffset + glowSize,
      );
      grad2.addColorStop(0, "#ff00cc");
      grad2.addColorStop(1, "rgba(255,0,192,0)");

      ctx.fillStyle = grad2;
      ctx.fillRect(Math.max(x, 0), edgeOffset, len, glowSize);

      ctx.restore();

      ctx.restore();
    }
  }
  function drawDeathInBloomFront(ctx) {
    const s = stateDeathInBloom;

    if (s.active) {
      ctx.save();

      const forwardOffset = 125;
      const ox = s.cx + Math.cos(s.angle) * forwardOffset;
      const oy = s.cy + Math.sin(s.angle) * forwardOffset;
      ctx.translate(ox, oy);
      ctx.rotate(s.angle);

      const dx = mouse.x - s.cx;
      const dy = mouse.y - s.cy;

      const cos = Math.cos(-s.angle);
      const sin = Math.sin(-s.angle);

      const rx = dx * cos - dy * sin;
      const x = rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      const isLethal = s.t >= 5;

      ctx.save();

      ctx.beginPath();
      ctx.moveTo(0.25, -s.w / 2);
      ctx.lineTo(0.25, s.w / 2);
      ctx.lineTo(-forwardOffset, 0);
      ctx.closePath();

      if (isLethal) {
        ctx.fillStyle = "black";
        ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.fill();
      } else {
        ctx.fillStyle = "#ff00cc";
        ctx.globalAlpha = 0.25 * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.fill();
      }

      ctx.restore();

      if (!isLethal) {
        ctx.globalAlpha = 0.25 * (s.t < 0.25 ? s.t * 4 : 1);
        ctx.fillStyle = "#ff00cc";
      } else {
        ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);
        ctx.fillStyle = "black";
      }

      const edgeOffset = s.w / 2;
      const glowSize = 400;

      ctx.save();
      ctx.globalAlpha = (isLethal ? 0.25 : 0) * (s.t < 0.25 ? s.t * 4 : 1);
      ctx.fillStyle = "#ff00cc";
      const w = s.w * (Math.random() + 1);
      ctx.fillRect(Math.max(x, 0), -w / 2, len, w);
      ctx.restore();
      ctx.fillRect(Math.max(x, 0), -s.w / 2, len, s.w);

      ctx.restore();
      for (const p of s.particles) {
        ctx.save();

        ctx.globalAlpha = (s.t > 5 ? 1 : 0.2) * (s.t < 0.25 ? s.t * 4 : 1);
        ctx.fillStyle = "black";

        // if (s.t < 5 && p.ellipse) {
        //   ctx.save();
        //   ctx.globalAlpha = s.t < 0.25 ? s.t * 4 : 1;
        //   const angle = s.angle;
        //   const long = p.r * 0.5;
        //   const short = p.r * 0.1;

        //   ctx.ellipse(p.x, p.y, long, short, angle, 0, Math.PI * 2);

        //   ctx.strokeStyle = "#ff00cc";
        //   ctx.lineWidth = 1;
        //   ctx.stroke();

        //   ctx.fillStyle = "black";
        //   ctx.fill();
        //   ctx.restore();
        // } else {
        //   ctx.beginPath();
        //   ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        //   ctx.fill();
        // }
        if (s.t < 5 && p.ellipse) {
          ctx.save();
          ctx.globalAlpha = 0.5 * (s.t < 0.25 ? s.t * 4 : 1);
          const angle = s.angle;
          const long = p.r * 0.5;
          const short = p.r * 0.1;

          ctx.beginPath();
          ctx.ellipse(p.x, p.y, long, short, angle, 0, Math.PI * 2);

          ctx.strokeStyle = "#ff00cc";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "black";
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();
    }
  }

  const stateSuperPizzaCutter = {
    blades: [],
    t: 0,
    spawned: false,
    circles: [],

    cutters: [
      {
        spokes: [],
        t: 0,
        spawned: false,
        cx: 0,
        cy: 0,
      },
      {
        spokes: [],
        t: 0,
        spawned: false,
        cx: 0,
        cy: 0,
      },
      {
        spokes: [],
        t: 0,
        spawned: false,
        cx: 0,
        cy: 0,
      },
    ],
    lastStartAng: 1,

    crumbles: [],
  };
  function enterSuperPizzaCutter() {
    const s = stateSuperPizzaCutter;

    s.t = 0;
    s.spawned = false;
    s.blades = [];
    s.startChange = false;
    s.change = false;

    const cx = mouse.x + (Math.random() - 0.5) * 2000;
    const cy = mouse.y + (Math.random() - 0.5) * 2000;
    s.cx = cx;
    s.cy = cy;
    enterFixed(cx, cy);

    const baseAngles = [
      Math.PI / 2,
      Math.PI / 2 + (Math.PI * 2) / 3,
      Math.PI / 2 + (Math.PI * 4) / 3,
    ];
    const offsetAng = Math.random() * Math.PI * 2;

    for (let i = 0; i < 3; i++) {
      s.blades.push({
        x: cx,
        y: cy,
        cx,
        cy,
        dirX: Math.cos(baseAngles[i] + offsetAng),
        dirY: Math.sin(baseAngles[i] + offsetAng),
        baseAngle: baseAngles[i] + offsetAng,
        angle: 0,
        scale: 0,
        startDelay: i * 0.1,
        rotDur: 0.75 - i * 0.1,
        upOffset: -1000,
      });

      stateSuperPizzaCutter.cutters[i].spokes = [];
      stateSuperPizzaCutter.cutters[i].t = 0;
      stateSuperPizzaCutter.cutters[i].cycle = 0;
      stateSuperPizzaCutter.cutters[i].spawned = false;
      stateSuperPizzaCutter.cutters[i].cx = 0;
      stateSuperPizzaCutter.cutters[i].cy = 0;
    }

    stateSuperPizzaCutter.circles = [];
  }
  function updateSuperPizzaCutter(dt) {
    const s = stateSuperPizzaCutter;

    s.t += dt;
    if (s.t >= 3 && !s.startChange) {
      s.startChange = true;
      changeEnemy(Celestial_CutterStart, false, () => {
        changeEnemy(Celestial_CutterLoop, true);
      });
    }
    if (s.t >= 6.75 && !s.change) {
      s.change = true;
      changeEnemy(Celestial_CutterEnd);
    }

    if (s.t <= dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/SuperPizzaCutter/Sword_Summons.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
    } else if (s.t >= 2 && s.t <= 2 + dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/SuperPizzaCutter/Swordprep.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
    } else if (s.t >= 3 && s.t <= 3 + dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/SuperPizzaCutter/Sword_Impact.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
      playSound(
        `./ASSET/Sound/Enemies/Celestial/PizzaCutter/Cutter_Charge.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
    } else if (s.t >= 7 && s.t <= 7 + dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/PizzaCutter/Cutter_Final.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }

    const p = Math.min(1, s.t / 2);
    const eased = 1 - (1 - p) * (1 - p);
    const maxDist = 700;

    for (const [i, b] of s.blades.entries()) {
      b.scale = eased;
      b.dist = eased * maxDist;

      let baseX = b.cx + b.dirX * b.dist;
      let baseY = b.cy + b.dirY * b.dist;

      let finalAngle = b.baseAngle;
      let offsetY = 0;

      if (s.t >= 2) {
        const t2 = s.t - 2;

        const localT = t2 - b.startDelay;

        if (localT > 0) {
          const p = Math.min(1, localT / b.rotDur);
          const easedRot = 1 - (1 - p) * (1 - p);

          const target = Math.PI / 2;
          finalAngle = b.baseAngle + (target - b.baseAngle) * easedRot;

          offsetY = b.upOffset * easedRot;
        }

        if (t2 >= 0.75) {
          const p = Math.min(1, (t2 - 0.75) / 0.25);
          const easedDown = p * p;

          offsetY = b.upOffset * (1 - easedDown);
        }
      }

      b.angle = finalAngle;

      const tipX = 1000;
      const tipY = 0;

      const cos = Math.cos(finalAngle);
      const sin = Math.sin(finalAngle);

      const worldTipX = tipX * cos - tipY * sin;
      const worldTipY = tipX * sin + tipY * cos;

      const finalTipX = baseX;
      const finalTipY = baseY + offsetY;

      let blend = 0;

      if (s.t >= 2) {
        blend = Math.min(1, s.t - 2);
      }

      const tipXPos = finalTipX - worldTipX;
      const tipYPos = finalTipY - worldTipY;

      b.x = baseX * (1 - blend) + tipXPos * blend;
      b.y = baseY * (1 - blend) + tipYPos * blend;

      if (s.t >= 3) {
        const t3 = s.t - 3;
        const p = Math.min(1, t3 * 3);
        const eased = p * p;

        b.scale = 1 - eased;

        const tipX = 1000;
        const tipY = 0;

        const cos = Math.cos(b.angle);
        const sin = Math.sin(b.angle);

        const worldTipX = tipX * cos - tipY * sin;
        const worldTipY = tipX * sin + tipY * cos;

        const tipPosX = b.x + worldTipX;
        const tipPosY = b.y + worldTipY;

        b.x = tipPosX - worldTipX * b.scale;
        b.y = tipPosY - worldTipY * b.scale;

        if (!b.spawnedCircle) {
          const dx = mouse.x - tipPosX;
          const dy = mouse.y - tipPosY;

          if (dx * dx + dy * dy <= 300 * 300) {
            checkDeath("Celestial");
          }

          s.circles.push({
            x: tipPosX,
            y: tipPosY,
            r: 300,
            t: 0,
          });
          shakeScreen();

          s.cutters[i].cx = tipPosX;
          s.cutters[i].cy = tipPosY;

          b.spawnedCircle = true;
        }
      }
    }

    for (const c of s.circles) {
      c.t += dt;
      const p = Math.min(1, c.t / 1);
      const eased = p * p;
      c.r = 300 * (1 - eased);
    }
    s.circles = s.circles.filter((c) => c.r > 0);

    if (s.t >= 3) {
      const mx = mouse.x;
      const my = mouse.y;
      for (let i = 0; i < 3; i++) {
        stateSuperPizzaCutter.cutters[i].t += dt;

        if (!stateSuperPizzaCutter.cutters[i].spawned) {
          stateSuperPizzaCutter.cutters[i].spokes.push(
            spawnPizza(
              stateSuperPizzaCutter.cutters[i],
              s.lastStartAng * Math.PI * 4,
            ),
          );
          s.lastStartAng *= -1;
          if (i == 0) {
            for (let i = 0; i < 300; i++) {
              stateSuperPizzaCutter.crumbles.push(
                spawnCircle(Math.random() < 0.5 ? 1.5 : 1, 2000),
              );
            }
          }
          stateSuperPizzaCutter.cutters[i].spawned = true;
        }

        for (const s of stateSuperPizzaCutter.cutters[i].spokes) {
          s.t += dt;

          const p = Math.min(s.t / 4, 1);
          const eased = 1 - (1 - p) * (1 - p);
          s.angle = s.startAngle + (s.targetAngle - s.startAngle) * eased;

          if (s.t >= 4 && s.t < 4.5) {
            const len = 20000;
            const w = 90;

            const dx = mx - s.x;
            const dy = my - s.y;

            for (let i = 0; i < (hardMode ? 10 : 8); i++) {
              const angle = s.angle + i * (Math.PI / (hardMode ? 5 : 4));

              const cos = Math.cos(-angle);
              const sin = Math.sin(-angle);

              const rx = dx * cos - dy * sin;
              const ry = dx * sin + dy * cos;

              const halfLen = len;
              const halfW = w / 2;

              if (Math.abs(rx) < halfLen && Math.abs(ry) < halfW) {
                checkDeath("Celestial");
                break;
              }
            }
          }
          if (s.t >= 4.5) {
            s.offset += dt * 10000;
          }
          if (s.t > 5) {
            s.active = false;
          }
        }
      }

      let needsCompact = false;
      for (const c of stateSuperPizzaCutter.crumbles) {
        c.t += dt;

        if (c.t < 4) {
          const p = c.t / 4;

          const eased = 1 - (1 - p) * (1 - p);

          c.x = c.sx + (c.tx - c.sx) * eased;
          c.y = c.sy + (c.ty - c.sy) * eased;
        }

        if (c.t < 0.5) {
          const p = c.t / 0.5;
          const eased = 1 - (1 - p) * (1 - p);
          c.r = c.targetR * eased;
        } else if (c.t < 4) {
          c.r = c.targetR;
        } else {
          if (!c.shake) {
            c.shake = true;
            shakeScreen();
          }
          c.r -= dt * (c.targetR == 150 ? 200 : 133.333);
          if (c.r <= 0) {
            c.active = false;
            needsCompact = true;
          }
        }

        if (c.t >= 4 && c.r >= 0) {
          const dx = mx - c.x;
          const dy = my - c.y;
          if (dx * dx + dy * dy <= c.r * c.r) {
            checkDeath("Celestial");
          }
        }
      }
      if (needsCompact) compact(stateSuperPizzaCutter.crumbles);
    }
  }
  function drawSuperPizzaCutter(ctx) {
    const s = stateSuperPizzaCutter;

    for (const b of s.blades) {
      ctx.save();

      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.scale(b.scale, b.scale);

      const glowLen = 1000;
      const glowWidth = 200;
      ctx.save();
      ctx.scale(1, glowWidth / glowLen);

      ctx.translate(b.x * 0.05, 0);

      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowLen);
      glow.addColorStop(0, "rgba(255,0,192,1)");
      glow.addColorStop(1, "rgba(255,0,192,0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowLen, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.beginPath();

      ctx.moveTo(-500, 0);

      ctx.lineTo(-280, -40);
      ctx.lineTo(-240, -240);
      ctx.lineTo(-200, -40);
      ctx.lineTo(-160, -30);

      ctx.lineTo(-80, -40);
      ctx.lineTo(30, -100);
      ctx.lineTo(15, -65);
      ctx.lineTo(80, -40);

      ctx.lineTo(1000, 0);

      ctx.lineTo(80, 40);
      ctx.lineTo(15, 65);
      ctx.lineTo(30, 100);
      ctx.lineTo(-80, 40);

      ctx.lineTo(-160, 30);
      ctx.lineTo(-200, 40);
      ctx.lineTo(-240, 240);
      ctx.lineTo(-280, 40);

      ctx.closePath();

      ctx.strokeStyle = "#ff00cc";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
    for (const c of s.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const glowSize = 100;
      const glow = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glowSize);
      glow.addColorStop(0, "rgba(255,0,192,1)");
      glow.addColorStop(1, "rgba(255,0,192,0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, c.r + glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, c.r, 0, Math.PI * 2);
      ctx.strokeStyle = "#ff00cc";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }

    if (s.t > 3) {
      for (let i = 0; i < 3; i++) {
        for (const sp of s.cutters[i].spokes) {
          ctx.save();

          ctx.translate(sp.x, sp.y);
          ctx.rotate(sp.angle);

          const isLethal = sp.t >= 4;

          for (let i = 0; i < (hardMode ? 10 : 8); i++) {
            ctx.rotate(Math.PI / (hardMode ? 5 : 4));

            const w = isLethal ? 90 : 100;
            const dx = mouse.x - sp.x;
            const dy = mouse.y - sp.y;

            const cos = Math.cos(
              -(sp.angle + i * (Math.PI / (hardMode ? 5 : 4))),
            );
            const sin = Math.sin(
              -(sp.angle + i * (Math.PI / (hardMode ? 5 : 4))),
            );

            const rx = dx * cos - dy * sin;
            const x = rx - BEAM_RADIUS;
            const len = BEAM_RADIUS * 2;

            if (isLethal) {
              ctx.globalAlpha = sp.t >= 4.75 ? Math.min(0, (5 - sp.t) * 4) : 1;

              const drawX = Math.max(x, sp.offset);
              const glow = 100;

              const gradTop = ctx.createLinearGradient(
                0,
                -w / 2 - glow,
                0,
                -w / 2,
              );
              gradTop.addColorStop(0, "rgba(255,0,192,0)");
              gradTop.addColorStop(1, "rgba(255,0,192,1)");

              ctx.fillStyle = gradTop;
              ctx.fillRect(drawX, -w / 2 - glow, len, glow);

              const gradBot = ctx.createLinearGradient(
                0,
                w / 2,
                0,
                w / 2 + glow,
              );
              gradBot.addColorStop(0, "rgba(255,0,192,1)");
              gradBot.addColorStop(1, "rgba(255,0,192,0)");

              ctx.fillStyle = gradBot;
              ctx.fillRect(drawX, w / 2, len, glow);

              const leftGrad = ctx.createLinearGradient(
                drawX - glow,
                0,
                drawX,
                0,
              );
              leftGrad.addColorStop(0, "rgba(255,0,192,0)");
              leftGrad.addColorStop(1, "#ff00cc");

              ctx.fillStyle = leftGrad;
              ctx.fillRect(drawX - glow, -w / 2 - 1, glow, w + 2);

              const rightGrad = ctx.createLinearGradient(
                drawX + len,
                0,
                drawX + len + glow,
                0,
              );
              rightGrad.addColorStop(0, "#ff00cc");
              rightGrad.addColorStop(1, "rgba(255,0,192,0)");

              ctx.fillStyle = rightGrad;
              ctx.fillRect(drawX + len, -w / 2 - 1, glow, w + 2);

              const points = [
                [drawX, -w / 2, -0.9983, -1.0083],
                [drawX + len, -w / 2, -0.0017, -1.0083],
                [drawX, w / 2, -0.9983, 0.0083],
                [drawX + len, w / 2, -0.0017, 0.0083],
              ];

              for (const [px, py, ox, oy] of points) {
                const grad = ctx.createRadialGradient(px, py, 0, px, py, glow);

                grad.addColorStop(0, "#ff00cc");
                grad.addColorStop(1, "rgba(255,0,192,0)");

                ctx.fillStyle = grad;
                ctx.fillRect(px + ox * glow, py + oy * glow, glow, glow);
              }

              ctx.strokeStyle = "#ff00cc";
              ctx.lineWidth = 1;
              ctx.strokeRect(drawX, -w / 2, len, w);
            } else if (i < (hardMode ? 5 : 4)) {
              ctx.globalAlpha =
                sp.t < 0.25 && statePizzaCutterCrumble.cycle == 0
                  ? sp.t * 3
                  : 0.75;

              const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
              grad.addColorStop(0, "rgba(255,0,192,0)");
              grad.addColorStop(0.45, "#ff00cc");
              grad.addColorStop(0.55, "#ff00cc");
              grad.addColorStop(1, "rgba(255,0,192,0)");

              ctx.fillStyle = grad;
              ctx.fillRect(x, -w / 2, len, w);
            }
          }

          ctx.restore();
        }
      }
      for (const c of s.crumbles) {
        ctx.save();

        ctx.translate(c.x, c.y);

        const alpha = c.t < 4 ? 0.5 : 1;
        ctx.globalAlpha = alpha;

        if (c.t >= 4 && c.r >= 0) {
          const glow = 100;

          const grad = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glow);
          grad.addColorStop(0, "rgba(255,0,192,1)");
          grad.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#ff00cc";
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.arc(0, 0, c.r, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = "transparent";
        }

        ctx.restore();
      }
    }
  }
  function drawSuperPizzaCutterFront(ctx) {
    const s = stateSuperPizzaCutter;

    for (const b of s.blades) {
      ctx.save();

      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.scale(b.scale, b.scale);

      ctx.beginPath();

      ctx.moveTo(-500, 0);

      ctx.lineTo(-280, -40);
      ctx.lineTo(-240, -240);
      ctx.lineTo(-200, -40);
      ctx.lineTo(-160, -30);

      ctx.lineTo(-80, -40);
      ctx.lineTo(30, -100);
      ctx.lineTo(15, -65);
      ctx.lineTo(80, -40);

      ctx.lineTo(1000, 0);

      ctx.lineTo(80, 40);
      ctx.lineTo(15, 65);
      ctx.lineTo(30, 100);
      ctx.lineTo(-80, 40);

      ctx.lineTo(-160, 30);
      ctx.lineTo(-200, 40);
      ctx.lineTo(-240, 240);
      ctx.lineTo(-280, 40);

      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.fill();

      ctx.restore();
    }
    for (const c of s.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      ctx.beginPath();
      ctx.arc(0, 0, c.r, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();

      ctx.restore();
    }

    if (s.t > 3) {
      for (let i = 0; i < 3; i++) {
        for (const sp of s.cutters[i].spokes) {
          ctx.save();

          ctx.translate(sp.x, sp.y);
          ctx.rotate(sp.angle);

          const isLethal = sp.t >= 4;

          for (let i = 0; i < (hardMode ? 10 : 8); i++) {
            ctx.rotate(Math.PI / (hardMode ? 5 : 4));

            const w = 90;
            const dx = mouse.x - sp.x;
            const dy = mouse.y - sp.y;

            const cos = Math.cos(
              -(sp.angle + i * (Math.PI / (hardMode ? 5 : 4))),
            );
            const sin = Math.sin(
              -(sp.angle + i * (Math.PI / (hardMode ? 5 : 4))),
            );

            const rx = dx * cos - dy * sin;
            const x = rx - BEAM_RADIUS;
            const len = BEAM_RADIUS * 2;

            if (isLethal) {
              ctx.globalAlpha = sp.t >= 4.75 ? (5 - sp.t) * 4 : 1;
              ctx.beginPath();
              ctx.fillStyle = "black";
              ctx.fillRect(Math.max(x, sp.offset), -w / 2, len, w);
            }
          }

          ctx.restore();
        }
      }
      for (const c of s.crumbles) {
        ctx.save();

        ctx.translate(c.x, c.y);

        const alpha = c.t < 4 ? 0.5 : 1;
        ctx.globalAlpha = alpha;

        if (c.t < 4) {
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r);
          grad.addColorStop(0, "black");
          grad.addColorStop(1, "#ff00cc");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, c.r, 0, Math.PI * 2);
          ctx.fill();
        } else if (c.r >= 0) {
          ctx.fillStyle = "black";
          ctx.beginPath();
          ctx.arc(0, 0, c.r, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }
  }

  const stateBitter3Stars = {
    spokes: [],
    t: 0,
    cycle: 0,
    spawned: false,
    cx: 0,
    cy: 0,

    extraStars: [],
    extraT: 0,
    extraSpawned: 0,
    lastAng: Math.random() * Math.PI * 2,
  };
  function enterBitter3Stars() {
    stateBitter3Stars.spokes = [];
    stateBitter3Stars.t = 0;
    stateBitter3Stars.cycle = 0;
    stateBitter3Stars.spawned = false;

    const cx = mouse.x + (Math.random() - 0.5) * 2000;
    const cy = mouse.y + (Math.random() - 0.5) * 2000;
    stateBitter3Stars.cx = cx;
    stateBitter3Stars.cy = cy;
    enterFixed(cx, cy);

    stateBitter3Stars.extraStars = [];
    stateBitter3Stars.extraT = 0;
    stateBitter3Stars.extraSpawned = 0;

    if (truePattern == false) showText("BITTER.");
  }
  function updateBitter3Stars(dt) {
    const mx = mouse.x;
    const my = mouse.y;
    const s = stateBitter3Stars;
    s.t += dt;
    s.extraT += dt;

    if (s.extraSpawned < 3 && s.extraT >= s.extraSpawned * 2.333) {
      s.extraStars.push({
        x: mouse.x,
        y: mouse.y,
        t: 0,
        locked: false,
        angle: s.lastAng,
        count: hardMode ? 8 : 6,
      });
      playSound(
        `./ASSET/Sound/Enemies/Celestial/3Stars/Memory_Slash_Fire.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
      s.lastAng += Math.random() * 0.2 + 0.2;
      s.extraSpawned++;
    }

    const dx = mx - s.cx;
    const dy = my - s.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 1800;
    if (dist > maxDist) {
      const nx = dx / dist;
      const ny = dy / dist;

      s.cx = mx - nx * maxDist;
      s.cy = my - ny * maxDist;

      enterFixed(s.cx, s.cy, false);
      for (const b of s.spokes) {
        if (b.t <= 2) {
          b.x = s.cx;
          b.y = s.cy;
        }
      }
    }

    if (!s.spawned) {
      const counts = hardMode ? [6, 7, 8] : [4, 5, 6];
      s.spokes.push(spawnBitter(counts[s.cycle], stateBitter3Stars));
      s.spawned = true;
    }

    for (const b of s.spokes) {
      b.t += dt;

      const p = Math.min(b.t / 2, 1);
      const eased = 1 - (1 - p) * (1 - p);
      let angle = b.baseAngle + eased * Math.PI * 2 * b.dirAngle;
      angle += (b.t - 2) * Math.PI * b.dirAngle;
      b.angle = angle;

      const dx = mx - b.x;
      const dy = my - b.y;
      if (b.t >= 2 && !b.shot) {
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        b.dirX = dx / len;
        b.dirY = dy / len;

        b.shot = true;
      }
      if (b.t >= 2) {
        const speed = 1500;

        b.x += b.dirX * speed * dt;
        b.y += b.dirY * speed * dt;
      }

      if (b.t >= 2 && b.t <= 5) {
        for (let i = 0; i < b.count; i++) {
          const ang = b.angle + (i * Math.PI * 2) / b.count;

          const cos = Math.cos(-ang);
          const sin = Math.sin(-ang);

          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;

          const len = 1000;
          const w = 25;

          if (rx > 0 && rx < len && Math.abs(ry) < w / 2) {
            checkDeath("Celestial");
            break;
          }
        }
      }

      if (b.t > 5) b.active = false;
    }
    s.spokes = s.spokes.filter((b) => b.active);

    for (const star of s.extraStars) {
      star.t += dt;

      if (!star.locked) {
        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;

        star.x = mouse.x;
        star.y = mouse.y;

        const duration = 2.333;
        const p = Math.min(star.t / duration, 1);
        const ease = 1 - (1 - p) * (1 - p);
        if (star.startAngle === undefined) {
          star.startAngle = star.angle;
          star.targetAngle =
            star.startAngle + Math.PI * 2 * (Math.random() < 0.5 ? 1 : -1);
        }
        star.angle =
          star.startAngle + (star.targetAngle - star.startAngle) * ease;

        if (star.t >= 2.333) {
          star.locked = true;
        }
      }

      if (s.extraT >= 8) {
        star.fireT = (star.fireT || 0) + dt;
      }

      if (star.fireT && star.fireT <= 3) {
        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;

        for (let i = 0; i < star.count; i++) {
          const ang = star.angle + (i * Math.PI * 2) / star.count;

          const cos = Math.cos(-ang);
          const sin = Math.sin(-ang);

          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;

          const len = 20000;
          const w = 25;

          if (rx > 0 && rx < len && Math.abs(ry) < w / 2) {
            checkDeath("Celestial");
            break;
          }
        }
      }
    }
    if (s.t >= 0.5 && s.t <= 0.5 + dt && s.cycle <= 2) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Bitter/Bitter_Charge.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
    } else if (s.t >= 1.5 && s.t <= 1.5 + dt && s.cycle == 3) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/3Stars/Memory_Slash_Impact.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }
    if (s.t >= 2) {
      s.t = 0;
      s.cycle++;
      shakeScreen();
      if (s.cycle <= 3) {
        playSound(
          `./ASSET/Sound/Enemies/Celestial/Bitter/Bitter_Shoot.ogg`,
          0.9,
          undefined,
          undefined,
          undefined,
          "50",
        );
      }
      s.spawned = false;
    }
  }
  function drawBitter3Stars(ctx) {
    for (const star of stateBitter3Stars.extraStars) {
      ctx.save();

      ctx.translate(star.x, star.y);
      ctx.rotate(star.angle);

      const isLethal = star.fireT !== undefined;

      const offset = isLethal
        ? star.fireT >= 0.5
          ? (star.fireT - 0.5) * 10000
          : 0
        : 0;

      const alpha =
        isLethal && star.fireT >= 0.75
          ? Math.max(0, (1 - star.fireT) / 0.25)
          : stateBitter3Stars.extraT >= 7 && stateBitter3Stars.extraT <= 8
            ? Math.max(0, (7.75 - stateBitter3Stars.extraT) / 0.75)
            : stateBitter3Stars.extraT <= 0.25
              ? stateBitter3Stars.extraT * 4
              : 1;

      ctx.globalAlpha = alpha;

      for (let i = 0; i < star.count; i++) {
        ctx.rotate((Math.PI * 2) / star.count);

        const len = 20000;
        const w = 25;

        const drawX = offset;

        if (isLethal) {
          const glow = 100;

          ctx.strokeStyle = "#ff00cc";
          ctx.lineWidth = 1;

          const gradTop = ctx.createLinearGradient(
            drawX,
            -w / 2 - glow,
            drawX,
            -w / 2,
          );
          gradTop.addColorStop(0, "rgba(255,0,192,0)");
          gradTop.addColorStop(1, "rgba(255,0,192,1)");

          ctx.fillStyle = gradTop;
          ctx.fillRect(drawX, -w / 2 - glow, len, glow);

          const gradBot = ctx.createLinearGradient(
            drawX,
            w / 2,
            drawX,
            w / 2 + glow,
          );
          gradBot.addColorStop(0, "rgba(255,0,192,1)");
          gradBot.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = gradBot;
          ctx.fillRect(drawX, w / 2, len, glow);

          ctx.beginPath();
          ctx.rect(drawX, -w / 2, len, w);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
    for (const b of stateBitter3Stars.spokes) {
      ctx.save();

      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      const isLethal = b.t >= 2;

      for (let i = 0; i < b.count; i++) {
        ctx.rotate((Math.PI * 2) / b.count);

        const len = 1000;
        const w = isLethal ? 25 : 50;

        if (isLethal) {
          ctx.globalAlpha = b.t >= 4.75 ? (5 - b.t) * 4 : 1;
          const drawX = 0;

          const glow = 100;

          const gradTop = ctx.createLinearGradient(0, -w / 2 - glow, 0, -w / 2);
          gradTop.addColorStop(0, "rgba(255,0,192,0)");
          gradTop.addColorStop(1, "rgba(255,0,192,1)");

          ctx.fillStyle = gradTop;
          ctx.fillRect(drawX, -w / 2 - glow, len, glow);

          const gradBot = ctx.createLinearGradient(0, w / 2, 0, w / 2 + glow);
          gradBot.addColorStop(0, "rgba(255,0,192,1)");
          gradBot.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = gradBot;
          ctx.fillRect(drawX, w / 2, len, glow);

          const leftGrad = ctx.createLinearGradient(-glow, 0, 0, 0);
          leftGrad.addColorStop(0, "rgba(255,0,192,0)");
          leftGrad.addColorStop(1, "#ff00cc");

          ctx.fillStyle = leftGrad;
          ctx.fillRect(-glow, -w / 2 - 1, glow, w + 2);

          const rightGrad = ctx.createLinearGradient(len, 0, len + glow, 0);
          rightGrad.addColorStop(0, "#ff00cc");
          rightGrad.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = rightGrad;
          ctx.fillRect(len, -w / 2 - 1, glow, w + 2);

          const points = [
            [0, -w / 2, -0.9983, -1.0083],
            [len, -w / 2, -0.0017, -1.0083],
            [0, w / 2, -0.9983, 0.0083],
            [len, w / 2, -0.0017, 0.0083],
          ];
          for (const [x, y, ox, oy] of points) {
            const grad = ctx.createRadialGradient(x, y, 0, x, y, glow);

            grad.addColorStop(0, "#ff00cc");
            grad.addColorStop(1, "rgba(255,0,192,0)");

            ctx.fillStyle = grad;
            ctx.fillRect(x + ox * glow, y + oy * glow, glow, glow);
          }

          ctx.strokeStyle = "#ff00cc";
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.rect(drawX, -w / 2, len, w);
          ctx.stroke();
        } else {
          ctx.globalAlpha =
            stateBitter3Stars.t < 0.25 && stateBitter3Stars.cycle == 0
              ? stateBitter3Stars.t * 3
              : 0.75;

          const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
          grad.addColorStop(0, "rgba(255,0,192,0)");
          grad.addColorStop(0.45, "#ff00cc");
          grad.addColorStop(0.55, "#ff00cc");
          grad.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = grad;
          ctx.fillRect(0, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
  }
  function drawBitter3StarsFront(ctx) {
    for (const star of stateBitter3Stars.extraStars) {
      ctx.save();

      ctx.translate(star.x, star.y);
      ctx.rotate(star.angle);

      const isLethal = star.fireT !== undefined;

      const offset = isLethal
        ? star.fireT >= 0.5
          ? (star.fireT - 0.5) * 10000
          : 0
        : 0;

      const alpha =
        isLethal && star.fireT >= 0.75
          ? Math.max(0, (1 - star.fireT) / 0.25)
          : stateBitter3Stars.extraT >= 7 && stateBitter3Stars.extraT <= 8
            ? Math.max(0, (7.75 - stateBitter3Stars.extraT) / 0.75)
            : stateBitter3Stars.extraT <= 0.25
              ? stateBitter3Stars.extraT * 4
              : 1;

      ctx.globalAlpha = alpha;

      for (let i = 0; i < star.count; i++) {
        ctx.rotate((Math.PI * 2) / star.count);

        const len = 20000;
        const w = 25;

        const drawX = offset;

        if (isLethal) {
          ctx.fillStyle = "black";
          ctx.fillRect(drawX, -w / 2, len, w);
        } else {
          ctx.fillStyle = "#ff00cc";
          ctx.fillRect(0, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
    for (const b of stateBitter3Stars.spokes) {
      ctx.save();

      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      const isLethal = b.t >= 2;

      for (let i = 0; i < b.count; i++) {
        ctx.rotate((Math.PI * 2) / b.count);

        const len = 1000;
        const w = isLethal ? 25 : 50;

        if (isLethal) {
          ctx.globalAlpha = b.t >= 4.75 ? (5 - b.t) * 4 : 1;
          const drawX = 0;

          ctx.fillStyle = "black";
          ctx.fillRect(drawX, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
  }

  const stateDeathInBloomCrumble = {
    t: 0,
    cx: 0,
    cy: 0,
    ex: 0,
    ey: 0,
    prevMx: 0,
    prevMy: 0,
    len: 20000,
    w: hardMode ? 800 : 625,
    active: false,
    particles: [],
    pTimer: 0,

    crumbleT: 0,
    circles: [],
  };
  function enterDeathInBloomCrumble() {
    const s = stateDeathInBloomCrumble;

    s.t = 0;
    s.active = true;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const ang = Math.atan2(cy - mouse.y, cx - mouse.x);
    s.cx = mouse.x + Math.cos(ang) * 2000;
    s.cy = mouse.y + Math.sin(ang) * 2000;
    enterFixed(s.cx, s.cy);
    s.w = hardMode ? 800 : 625;
    s.angle = 0;
    s.prevAngle = 0;

    s.ex = mouse.x;
    s.ey = mouse.y;
    s.particles = [];
    s.pTimer = 0;

    s.crumbleT = 0;
    s.circles = [];
    setGiftMultiplier(0.5);

    if (truePattern == false) showText("DEATH IN BLOOM.");
  }
  function updateDeathInBloomCrumble(dt) {
    const mx = mouse.x;
    const my = mouse.y;
    const s = stateDeathInBloomCrumble;

    s.t += dt;
    s.pTimer += dt;

    const follow = 1 - Math.exp(-0.8 * dt);

    s.ex += (mx - s.ex) * follow;
    s.ey += (my - s.ey) * follow;

    const dx = s.ex - s.cx;
    const dy = s.ey - s.cy;

    s.angle += Math.atan2(dy, dx) - s.angle;
    const angleDelta = s.angle - s.prevAngle;
    s.prevAngle = s.angle;

    const mvx = mx - s.prevMx;
    const mvy = my - s.prevMy;
    s.prevMx = mx;
    s.prevMy = my;
    const bx = Math.cos(s.angle);
    const by = Math.sin(s.angle);
    const dir = mvx * bx + mvy * by;

    if (s.t < 22 && s.pTimer >= 0.02) {
      s.pTimer = 0;

      const spawnCount = 200;

      const nx = Math.cos(s.angle + Math.PI / 2);
      const ny = Math.sin(s.angle + Math.PI / 2);

      for (let i = 0; i < spawnCount; i++) {
        const angle = s.angle;
        const len = s.len;

        const t = Math.random();
        const along = t * len + 125;

        const forward = dir >= 0 ? 1 : -1;
        const edgeSide = Math.random() < 0.5 ? -1 : 1;
        const trailingOffset = (s.w / 2) * forward * edgeSide;
        const leadingOffset = (s.w / 1.5) * forward * edgeSide;
        const isLeading = Math.random() < 0.35;
        const spread = isLeading ? leadingOffset : trailingOffset;

        const px = s.cx + bx * along + nx * spread;
        const py = s.cy + by * along + ny * spread;

        if (s.t >= 5) {
          s.particles.push({
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * (s.t > 5 ? 1000 : 100),
            vy: (Math.random() - 0.5) * (s.t > 5 ? 1000 : 100),
            r: Math.random() * 40,
            t: 0,
            life: 0.25 + Math.random() * 0.25,
            active: true,
          });
        }

        if (s.t < 5 && Math.random() < 0.05) {
          const innerSpread = (Math.random() - 0.5) * s.w * 0.8;

          const px2 = s.cx + bx * along + nx * innerSpread;
          const py2 = s.cy + by * along + ny * innerSpread;

          const speed = 200 * (0.5 + Math.random() * 0.5);
          s.particles.push({
            x: px2,
            y: py2,
            vx: bx * speed,
            vy: by * speed,
            r: Math.random() * 40 + 40,
            t: 0,
            life: 0.5 + Math.random() * 0.5,
            active: true,
            ellipse: true,
          });
        }
      }
    }

    const cos = Math.cos(-s.angle);
    const sin = Math.sin(-s.angle);

    if (s.t >= 5) {
      if (s.t <= 22) shakeScreen();
      const mmx = mx - s.cx;
      const mmy = my - s.cy;

      const rx = mmx * cos - mmy * sin;
      const ry = mmx * sin + mmy * cos;

      if (rx > 0 && rx < s.len && Math.abs(ry) < s.w / 2 && s.active) {
        checkDeath("Celestial");
      }
    }

    s.crumbleT += dt;
    if (s.t >= 6 && s.crumbleT >= 2 && s.t < 22) {
      for (let i = 0; i < 300; i++) {
        s.circles.push(spawnCircle(2));
      }
      s.crumbleT = 0;
    }

    let needsCompact = false;
    for (const p of s.particles) {
      p.t += dt;

      if (p.ellipse) {
        const c = Math.cos(angleDelta);
        const sA = Math.sin(angleDelta);

        const rx = p.x - s.cx;
        const ry = p.y - s.cy;

        p.x = s.cx + rx * c - ry * sA;
        p.y = s.cy + rx * sA + ry * c;

        const rvx = p.vx;
        const rvy = p.vy;

        p.vx = rvx * c - rvy * sA;
        p.vy = rvx * sA + rvy * c;

        const accel = 200 * dt;
        p.vx += Math.cos(s.angle) * accel;
        p.vy += Math.sin(s.angle) * accel;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += dt * 5;

      if (p.t > p.life) {
        p.active = false;
        needsCompact = true;
      }

      const dx = p.x - s.cx;
      const dy = p.y - s.cy;

      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;

      const halfLen = s.len;
      const halfW = s.w / 2 + 100;

      if (Math.abs(rx) > halfLen || Math.abs(ry) > halfW) {
        p.active = false;
        needsCompact = true;
      }
    }
    if (needsCompact) compact(s.particles);

    if (s.t <= dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/DeathInBloom/Death_in_Bloom_Charge.ogg`,
        1.1,
        undefined,
        undefined,
        undefined,
        "50",
      );
    } else if (s.t >= 5 && s.t <= 5 + dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/DeathInBloom/Death_in_Bloom_Firing.ogg`,
        0.706,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }

    if (s.t >= 5 && s.t < 22) {
      s.w = Math.random() * 50 + (hardMode ? 750 : 575);
    }
    if (s.t >= 22) {
      s.w -= dt * 1000;
      if (s.w <= 0 && s.active) {
        s.w = 0;
        setGiftMultiplier(2);
        s.active = false;
      }
    }

    let needsCompactCrumble = false;
    for (const c of s.circles) {
      c.t += dt;

      if (c.t < 2) {
        const p = c.t / 2;

        const eased = 1 - (1 - p) * (1 - p);

        c.x = c.sx + (c.tx - c.sx) * eased;
        c.y = c.sy + (c.ty - c.sy) * eased;
      }

      if (c.t < 0.5) {
        const p = c.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        c.r = c.targetR * eased;
      } else if (c.t < 2) {
        c.r = c.targetR;
      } else {
        if (!c.shake) {
          c.shake = true;
          shakeScreen();
        }
        c.r -= dt * 200;
        if (c.r <= 0) {
          c.active = false;
          needsCompactCrumble = true;
        }
      }

      if (c.t >= 2) {
        const dx = mx - c.x;
        const dy = my - c.y;
        if (dx * dx + dy * dy <= c.r * c.r) {
          checkDeath("Celestial");
        }
      }
    }
    if (needsCompactCrumble) compact(s.circles);
  }
  function drawDeathInBloomCrumble(ctx) {
    const s = stateDeathInBloomCrumble;

    if (s.active) {
      for (const p of s.particles) {
        ctx.save();

        ctx.globalAlpha = (s.t > 5 ? 1 : 0.2) * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.beginPath();
        if (!p.ellipse) {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

          ctx.strokeStyle = "#ff00cc";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      }

      ctx.save();

      const forwardOffset = 125;
      const ox = s.cx + Math.cos(s.angle) * forwardOffset;
      const oy = s.cy + Math.sin(s.angle) * forwardOffset;
      ctx.translate(ox, oy);
      ctx.rotate(s.angle);

      const dx = mouse.x - s.cx;
      const dy = mouse.y - s.cy;

      const cos = Math.cos(-s.angle);
      const sin = Math.sin(-s.angle);

      const rx = dx * cos - dy * sin;
      const x = rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;
      const randLineWidth = 18 * (Math.random() + 2);

      const isLethal = s.t >= 5;

      ctx.save();
      if (isLethal) {
        const alpha = s.t < 0.25 ? s.t * 4 : 1;

        const glowLen = 1500;
        const glowWidth = s.w * 1.1;

        ctx.scale(1, glowWidth / glowLen);

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowLen);
        grad.addColorStop(0, "#ff00cc");
        grad.addColorStop(0.5, "#ff00cc");
        grad.addColorStop(1, "rgba(255,0,192,0)");

        ctx.globalAlpha = (Math.random() * 0.25 + 0.75) * alpha;
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.arc(0, 0, glowLen, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.save();

      ctx.beginPath();
      ctx.moveTo(-randLineWidth / 2, -s.w / 2 - randLineWidth / 2);
      ctx.lineTo(-randLineWidth / 2, s.w / 2 + randLineWidth / 2);
      ctx.lineTo(-forwardOffset - randLineWidth / 2, 0);
      ctx.closePath();

      if (isLethal) {
        ctx.fillStyle = "#ff00cc";
        ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.fill();
      }

      ctx.restore();

      if (!isLethal) {
        ctx.globalAlpha = 0.25 * (s.t < 0.25 ? s.t * 4 : 1);
        ctx.fillStyle = "#ff00cc";
      } else {
        ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.rect(Math.max(x, 0), -s.w / 2, len, s.w);
        ctx.stroke();

        ctx.fillStyle = "black";
      }

      const edgeOffset = s.w / 2;
      const glowSize = 400;

      ctx.save();
      ctx.globalAlpha =
        (isLethal ? Math.random() * 0.25 + 0.5 : 0.05) *
        (s.t < 0.25 ? s.t * 4 : 1);

      let grad = ctx.createLinearGradient(
        0,
        -edgeOffset - glowSize,
        0,
        -edgeOffset,
      );
      grad.addColorStop(0, "rgba(255,0,192,0)");
      grad.addColorStop(1, "#ff00cc");

      ctx.fillStyle = grad;
      ctx.fillRect(Math.max(x, 0), -edgeOffset - glowSize, len, glowSize);

      let grad2 = ctx.createLinearGradient(
        0,
        edgeOffset,
        0,
        edgeOffset + glowSize,
      );
      grad2.addColorStop(0, "#ff00cc");
      grad2.addColorStop(1, "rgba(255,0,192,0)");

      ctx.fillStyle = grad2;
      ctx.fillRect(Math.max(x, 0), edgeOffset, len, glowSize);

      ctx.restore();

      ctx.restore();
    }

    for (const c of s.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t >= 2 && c.r >= 0) {
        const glow = 100;

        const grad = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,192,1)");
        grad.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "transparent";
      }

      ctx.restore();
    }
  }
  function drawDeathInBloomCrumbleFront(ctx) {
    const s = stateDeathInBloomCrumble;

    if (s.active) {
      ctx.save();

      const forwardOffset = 125;
      const ox = s.cx + Math.cos(s.angle) * forwardOffset;
      const oy = s.cy + Math.sin(s.angle) * forwardOffset;
      ctx.translate(ox, oy);
      ctx.rotate(s.angle);

      const dx = mouse.x - s.cx;
      const dy = mouse.y - s.cy;

      const cos = Math.cos(-s.angle);
      const sin = Math.sin(-s.angle);

      const rx = dx * cos - dy * sin;
      const x = rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      const isLethal = s.t >= 5;

      ctx.save();

      ctx.beginPath();
      ctx.moveTo(0.25, -s.w / 2);
      ctx.lineTo(0.25, s.w / 2);
      ctx.lineTo(-forwardOffset, 0);
      ctx.closePath();

      if (isLethal) {
        ctx.fillStyle = "black";
        ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.fill();
      } else {
        ctx.fillStyle = "#ff00cc";
        ctx.globalAlpha = 0.25 * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.fill();
      }

      ctx.restore();

      if (!isLethal) {
        ctx.globalAlpha = 0.25 * (s.t < 0.25 ? s.t * 4 : 1);
        ctx.fillStyle = "#ff00cc";
      } else {
        ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);
        ctx.fillStyle = "black";
      }

      const edgeOffset = s.w / 2;
      const glowSize = 400;

      ctx.save();
      ctx.globalAlpha = (isLethal ? 0.25 : 0) * (s.t < 0.25 ? s.t * 4 : 1);
      ctx.fillStyle = "#ff00cc";
      const w = s.w * (Math.random() + 1);
      ctx.fillRect(Math.max(x, 0), -w / 2, len, w);
      ctx.restore();
      ctx.fillRect(Math.max(x, 0), -s.w / 2, len, s.w);

      ctx.restore();
      for (const p of s.particles) {
        ctx.save();

        ctx.globalAlpha = (s.t > 5 ? 1 : 0.2) * (s.t < 0.25 ? s.t * 4 : 1);
        ctx.fillStyle = "black";

        if (s.t < 5 && p.ellipse) {
          ctx.save();
          ctx.globalAlpha = 0.5 * (s.t < 0.25 ? s.t * 4 : 1);
          const angle = s.angle;
          const long = p.r * 0.5;
          const short = p.r * 0.1;

          ctx.beginPath();
          ctx.ellipse(p.x, p.y, long, short, angle, 0, Math.PI * 2);

          ctx.strokeStyle = "#ff00cc";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "black";
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();
    }

    for (const c of s.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t < 2) {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r);
        grad.addColorStop(0, "black");
        grad.addColorStop(1, "#ff00cc");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.r >= 0) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  const stateImplosionBreaker = {
    circles: [],
    spawnTimer: 0,
    spawned: 0,

    daggers: [],
  };
  function enterImplosionBreaker() {
    enterOrbit();
    stateImplosionBreaker.circles = [];
    stateImplosionBreaker.spawnTimer = 0;
    stateImplosionBreaker.spawned = 0;

    const dir = Math.random() < 0.5 ? 1 : -1;
    stateImplosionBreaker.daggers = [];
    for (let i = 0; i < 4; i++) {
      const baseAngle = (i / 4) * Math.PI * 2;
      stateImplosionBreaker.daggers.push({
        t: 0,
        baseAngle,
        startAngle: baseAngle,
        targetAngle: baseAngle + Math.PI * 2 * dir,

        delay: 0,
        slashT: 0,
        slashing: false,
      });
    }
  }
  function updateImplosionBreaker(dt) {
    const mx = mouse.x;
    const my = mouse.y;
    const s = stateImplosionBreaker;

    if (!s.prevMouse) {
      s.prevMouse = { x: mx, y: my };
    }
    const vx = mx - s.prevMouse.x;
    const vy = my - s.prevMouse.y;
    s.prevMouse.x = mx;
    s.prevMouse.y = my;
    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      s.lastDirX = vx / len;
      s.lastDirY = vy / len;
    }

    s.spawnTimer += dt;

    const interval = 1 / 15;
    while (s.spawnTimer >= interval && s.spawned < 15) {
      s.spawnTimer -= interval;
      s.spawned++;
      s.circles.push(spawnImplosionCircle());
    }

    let needsCompact = false;
    for (const c of s.circles) {
      c.t += dt;
      c.opacity += dt * 4;

      if (c.t < 0.25) {
        c.r = 5;
      } else if (c.t < 1.5) {
        const p = (c.t - 0.25) / 1.25;
        const eased = p * p * (3 - 2 * p);
        c.r = c.targetR * eased;
        c.phase = 1;
      } else {
        if (!c.shake) {
          c.shake = true;
          shakeScreen();
          playSound(
            `./ASSET/Sound/Enemies/Celestial/Cease/Cease_Impact.ogg`,
            3,
          );
        }
        c.phase = 2;
        c.r -= dt * 600;
        if (c.r <= 0) {
          c.active = false;
          needsCompact = true;
        }
      }

      if (c.phase === 2) {
        const dx = mx - c.x;
        const dy = my - c.y;

        const hitR = c.r * 1.1;

        if (dx * dx + dy * dy <= hitR * hitR) {
          checkDeath("Celestial");
        }
      }
    }
    if (needsCompact) compact(s.circles);

    for (const d of s.daggers) {
      d.t += dt;

      const spinDuration = 1.5;
      const moveDuration = 0.5;

      if (d.t <= spinDuration) {
        const p = d.t / spinDuration;
        d.angle = d.startAngle + (d.targetAngle - d.startAngle) * p;

        d.cx = mx;
        d.cy = my;
        d.radius = 200;

        d.worldX = d.cx + Math.cos(d.angle) * d.radius;
        d.worldY = d.cy + Math.sin(d.angle) * d.radius;
      } else {
        if (!d.transitionInit) {
          d.transitionInit = true;

          const predictScale = 20;
          const px = mx + vx * predictScale;
          const py = my + vy * predictScale;

          const dirX = s.lastDirX ?? 0;
          const dirY = s.lastDirY ?? -1;

          const backDist = 150;
          d.targetCX = mx - dirX * backDist;
          d.targetCY = my - dirY * backDist;

          const baseAngle = Math.atan2(py - d.targetCY, px - d.targetCX);

          const spread = ((hardMode ? 20 : 10) * Math.PI) / 180;
          const index = s.daggers.indexOf(d);
          const offset = (index - 1.5) * spread;

          d.targetAngle = baseAngle + offset;

          d.startCX = d.worldX;
          d.startCY = d.worldY;
          d.startAngle = d.angle;
        }

        const p = Math.min((d.t - spinDuration) / moveDuration, 1);

        const ease = 1 - (1 - p) * (1 - p);

        d.cx = d.startCX + (d.targetCX - d.startCX) * ease;
        d.cy = d.startCY + (d.targetCY - d.startCY) * ease;

        d.angle = d.startAngle + (d.targetAngle - d.startAngle) * ease;

        d.radius = 0;

        const slashStart = 2 + d.delay;

        if (d.t >= slashStart && !d.slashing) {
          d.slashing = true;
          d.slashT = 0;
          d.slashInit = false;
        }

        if (d.slashing) {
          d.slashT += dt;

          const slashDuration = 1;

          const p = Math.min(d.slashT / slashDuration, 1);

          const ease = 1 - (1 - p) * (1 - p);

          const slashDist = 1000;

          if (!d.slashInit) {
            d.slashInit = true;
            shakeScreen();

            d.slashStartX = d.cx;
            d.slashStartY = d.cy;

            d.slashAngle = d.angle;
          }

          d.cx = d.slashStartX + Math.cos(d.slashAngle) * slashDist * ease;
          d.cy = d.slashStartY + Math.sin(d.slashAngle) * slashDist * ease;

          const dx = mx - d.cx;
          const dy = my - d.cy;

          const cos = Math.cos(-d.angle);
          const sin = Math.sin(-d.angle);

          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;

          const len = 140;
          const w = 60;

          if (rx > -40 && rx < len && Math.abs(ry) < w / 2) {
            checkDeath("Celestial");
          }
        }
      }
    }
  }
  function drawImplosionBreaker(ctx) {
    const s = stateImplosionBreaker;

    for (const c of s.circles) {
      ctx.save();
      ctx.globalAlpha = c.opacity;
      ctx.translate(c.x, c.y);

      if (c.phase < 2) {
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;
        ctx.stroke();
        const glow = 200;
        const grad = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,192,1)");
        grad.addColorStop(1, "rgba(255,0,192,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "transparent";
      } else {
        const spikes = 6;

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.rotate(c.r);
        const glow = 200;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,192,1)");
        grad.addColorStop(1, "rgba(255,0,192,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
          const a = (i / spikes) * Math.PI * 2;
          const r1 = c.r * 0.5;
          const r2 = c.r * 1.5;

          const x1 = Math.cos(a) * r1;
          const y1 = Math.sin(a) * r1;

          const x2 = Math.cos(a + Math.PI / spikes) * r2;
          const y2 = Math.sin(a + Math.PI / spikes) * r2;

          if (i === 0) ctx.moveTo(x1, y1);
          else ctx.lineTo(x1, y1);

          ctx.lineTo(x2, y2);
        }
        ctx.closePath();

        ctx.stroke();

        ctx.strokeStyle = "transparent";
      }

      ctx.restore();
    }
    for (const d of stateImplosionBreaker.daggers) {
      const cx = d.cx ?? mouse.x;
      const cy = d.cy ?? mouse.y;

      let x, y;

      const tipOffset = 100;
      if (d.slashing) {
        x = cx - Math.cos(d.angle) * tipOffset;
        y = cy - Math.sin(d.angle) * tipOffset;
      } else {
        const radius = d.radius ?? 200;

        const baseX = cx + Math.cos(d.angle) * radius;
        const baseY = cy + Math.sin(d.angle) * radius;

        x = baseX - Math.cos(d.angle) * tipOffset;
        y = baseY - Math.sin(d.angle) * tipOffset;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(d.angle);

      let alpha = 1;
      if (d.t < 0.25) {
        alpha = d.t / 0.25;
      }
      if (d.slashing) {
        const slashDuration = 1;
        const p = Math.min((d.t - 2) / slashDuration, 1);
        if (p > 0.75) {
          const fadeOut = (1 - p) / 0.25;
          alpha = Math.min(alpha, fadeOut);
        }
      }
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      const glowLen = 100;
      const glowWidth = 20;
      ctx.save();
      ctx.scale(1, glowWidth / glowLen);
      ctx.translate(tipOffset * 0.25, 0);

      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowLen);
      glow.addColorStop(0, "rgba(255,0,192,1)");
      glow.addColorStop(1, "rgba(255,0,192,0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowLen, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.scale(0.1, 0.1);
      ctx.beginPath();

      ctx.moveTo(-500, 0);

      ctx.lineTo(-280, -40);
      ctx.lineTo(-240, -240);
      ctx.lineTo(-200, -40);
      ctx.lineTo(-160, -30);

      ctx.lineTo(-80, -40);
      ctx.lineTo(30, -100);
      ctx.lineTo(15, -65);
      ctx.lineTo(80, -40);

      ctx.lineTo(1000, 0);

      ctx.lineTo(80, 40);
      ctx.lineTo(15, 65);
      ctx.lineTo(30, 100);
      ctx.lineTo(-80, 40);

      ctx.lineTo(-160, 30);
      ctx.lineTo(-200, 40);
      ctx.lineTo(-240, 240);
      ctx.lineTo(-280, 40);

      ctx.closePath();

      ctx.strokeStyle = "#ff00cc";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }
  function drawImplosionBreakerFront(ctx) {
    const s = stateImplosionBreaker;

    for (const c of s.circles) {
      ctx.save();
      ctx.globalAlpha = c.opacity;
      ctx.translate(c.x, c.y);

      if (c.phase < 2) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const spikes = 6;

        ctx.fillStyle = "black";

        ctx.rotate(c.r);
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
          const a = (i / spikes) * Math.PI * 2;
          const r1 = c.r * 0.5;
          const r2 = c.r * 1.5;

          const x1 = Math.cos(a) * r1;
          const y1 = Math.sin(a) * r1;

          const x2 = Math.cos(a + Math.PI / spikes) * r2;
          const y2 = Math.sin(a + Math.PI / spikes) * r2;

          if (i === 0) ctx.moveTo(x1, y1);
          else ctx.lineTo(x1, y1);

          ctx.lineTo(x2, y2);
        }
        ctx.closePath();

        ctx.fill();
      }

      ctx.restore();
    }
    for (const d of stateImplosionBreaker.daggers) {
      const spinDuration = 1.5;
      const moveDuration = 0.5;

      const indicatorAlpha =
        d.t >= spinDuration ? (d.t - spinDuration) / moveDuration : 0;

      const cx = d.cx ?? mouse.x;
      const cy = d.cy ?? mouse.y;

      let x, y;

      const tipOffset = 100;
      if (d.slashing) {
        x = cx - Math.cos(d.angle) * tipOffset;
        y = cy - Math.sin(d.angle) * tipOffset;
      } else {
        const radius = d.radius ?? 200;

        const baseX = cx + Math.cos(d.angle) * radius;
        const baseY = cy + Math.sin(d.angle) * radius;

        x = baseX - Math.cos(d.angle) * tipOffset;
        y = baseY - Math.sin(d.angle) * tipOffset;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(d.angle);

      let alpha = 1;
      if (d.t < 0.25) {
        alpha = d.t / 0.25;
      }
      if (d.slashing) {
        const slashDuration = 1;
        const p = Math.min((d.t - 2) / slashDuration, 1);
        if (p > 0.75) {
          const fadeOut = (1 - p) / 0.25;
          alpha = Math.min(alpha, fadeOut);
        }
      }
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      if (indicatorAlpha > 0) {
        ctx.save();

        ctx.globalAlpha = indicatorAlpha;

        const len = 20000;
        const w = 1;
        const glow = 100;

        const drawX = 0;

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 9;

        ctx.beginPath();
        ctx.rect(drawX, -w / 2, len, w);
        ctx.stroke();

        ctx.restore();
      }

      ctx.scale(0.1, 0.1);
      ctx.beginPath();

      ctx.moveTo(-500, 0);

      ctx.lineTo(-280, -40);
      ctx.lineTo(-240, -240);
      ctx.lineTo(-200, -40);
      ctx.lineTo(-160, -30);

      ctx.lineTo(-80, -40);
      ctx.lineTo(30, -100);
      ctx.lineTo(15, -65);
      ctx.lineTo(80, -40);

      ctx.lineTo(1000, 0);

      ctx.lineTo(80, 40);
      ctx.lineTo(15, 65);
      ctx.lineTo(30, 100);
      ctx.lineTo(-80, 40);

      ctx.lineTo(-160, 30);
      ctx.lineTo(-200, 40);
      ctx.lineTo(-240, 240);
      ctx.lineTo(-280, 40);

      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.fill();

      ctx.restore();
    }
  }

  const stateFirstSilence = {
    spokes: [],
    t: 0,
    cycle: 0,
    spawned: false,
    cx: 0,
    cy: 0,

    circles: [],

    daggers: [],

    beams: [],
    timer: 0,
    prevMx: 0,
    prevMy: 0,
  };
  function enterFirstSilence() {
    stateFirstSilence.spokes = [];
    stateFirstSilence.t = 0;
    stateFirstSilence.cycle = 0;
    stateFirstSilence.spawned = false;
    const cx = mouse.x + (Math.random() - 0.5) * 2000;
    const cy = mouse.y + (Math.random() - 0.5) * 2000;
    stateFirstSilence.cx = cx;
    stateFirstSilence.cy = cy;
    enterFixed(cx, cy);
    changeEnemy(Celestial_CutterStart, false, () => {
      changeEnemy(Celestial_CutterLoop, true);
    });

    stateFirstSilence.circles = [];

    const dir = Math.random() < 0.5 ? 1 : -1;
    stateFirstSilence.daggers = [];
    for (let i = 0; i < 4; i++) {
      const baseAngle = (i / 4) * Math.PI * 2;
      stateFirstSilence.daggers.push({
        t: 0,
        baseAngle,
        startAngle: baseAngle,
        targetAngle: baseAngle + Math.PI * 2 * dir,

        delay: 0,
        slashT: 0,
        slashing: false,
      });
    }

    stateFirstSilence.beams = [];
    stateFirstSilence.timer = 0;
    stateFirstSilence.prevMx = mouse.x;
    stateFirstSilence.prevMy = mouse.y;

    if (truePattern == false) showText("SILENCE.");
  }
  function updateFirstSilence(dt) {
    const mx = mouse.x;
    const my = mouse.y;
    stateFirstSilence.t += dt;

    if (!stateFirstSilence.spawned) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/PizzaCutter/Cutter_Charge.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
      stateFirstSilence.spokes.push(spawnPizza(stateFirstSilence));
      for (let i = 0; i < 300; i++) {
        stateFirstSilence.circles.push(spawnCircle(2));
      }
      stateFirstSilence.spawned = true;
    }

    if (!stateFirstSilence.prevMouse) {
      stateFirstSilence.prevMouse = { x: mx, y: my };
    }
    const vx = mx - stateFirstSilence.prevMouse.x;
    const vy = my - stateFirstSilence.prevMouse.y;
    stateFirstSilence.prevMouse.x = mx;
    stateFirstSilence.prevMouse.y = my;
    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      stateFirstSilence.lastDirX = vx / len;
      stateFirstSilence.lastDirY = vy / len;
    }

    for (const s of stateFirstSilence.spokes) {
      s.t += dt;

      const p = Math.min(s.t / 2, 1);
      const eased = 1 - (1 - p) * (1 - p);
      s.angle = s.startAngle + (s.targetAngle - s.startAngle) * eased;

      if (s.t >= 2 && s.t < 2.5) {
        const len = 20000;
        const w = 90;

        const dx = mx - s.x;
        const dy = my - s.y;

        for (let i = 0; i < (hardMode ? 10 : 8); i++) {
          const angle = s.angle + i * (Math.PI / (hardMode ? 5 : 4));

          const cos = Math.cos(-angle);
          const sin = Math.sin(-angle);

          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;

          const halfLen = len;
          const halfW = w / 2;

          if (Math.abs(rx) < halfLen && Math.abs(ry) < halfW) {
            checkDeath("Celestial");
            break;
          }
        }
      }
      if (s.t >= 2.5) {
        s.offset += dt * 10000;
      }
      if (s.t > 3) {
        s.active = false;
      }
    }

    if (
      stateFirstSilence.t >= 1.75 &&
      stateFirstSilence.cycle == 3 &&
      !stateFirstSilence.change
    ) {
      stateFirstSilence.change = true;
      changeEnemy(Celestial_CutterEnd);
    }
    if (stateFirstSilence.t >= 2) {
      stateFirstSilence.t = 0;
      stateFirstSilence.cycle++;
      shakeScreen(stateFirstSilence.cycle % 2 == 0 ? 2 : 3);
      if (stateFirstSilence.cycle < 4) {
        stateFirstSilence.spawned = false;
        stateFirstSilence.change = false;
        playSound(
          `./ASSET/Sound/Enemies/Celestial/PizzaCutter/Cutter_Impact.ogg`,
          0.9,
          undefined,
          undefined,
          undefined,
          "50",
        );
      } else {
        playSound(
          `./ASSET/Sound/Enemies/Celestial/PizzaCutter/Cutter_Final.ogg`,
          0.9,
          undefined,
          undefined,
          undefined,
          "50",
        );
      }
    }

    let needsCompact = false;
    for (const c of stateFirstSilence.circles) {
      c.t += dt;

      if (c.t < 2) {
        const p = c.t / 2;

        const eased = 1 - (1 - p) * (1 - p);

        c.x = c.sx + (c.tx - c.sx) * eased;
        c.y = c.sy + (c.ty - c.sy) * eased;
      }

      if (c.t < 0.5) {
        const p = c.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        c.r = c.targetR * eased;
      } else if (c.t < 2) {
        c.r = c.targetR;
      } else {
        c.r -= dt * 100;
        if (c.r <= 0) {
          c.active = false;
          needsCompact = true;
        }
      }

      if (c.t >= 2 && c.r >= 0) {
        const dx = mx - c.x;
        const dy = my - c.y;
        if (dx * dx + dy * dy <= c.r * c.r) {
          checkDeath("Celestial");
        }
      }
    }
    if (needsCompact) compact(stateFirstSilence.circles);

    for (const d of stateFirstSilence.daggers) {
      d.t += dt;

      const spinDuration = 1.5;
      const moveDuration = 0.5;

      if (d.t <= spinDuration) {
        const p = d.t / spinDuration;
        d.angle = d.startAngle + (d.targetAngle - d.startAngle) * p;

        d.cx = mx;
        d.cy = my;
        d.radius = 200;

        d.worldX = d.cx + Math.cos(d.angle) * d.radius;
        d.worldY = d.cy + Math.sin(d.angle) * d.radius;
      } else {
        if (!d.transitionInit) {
          d.transitionInit = true;

          const predictScale = 20;
          const px = mx + vx * predictScale;
          const py = my + vy * predictScale;

          const dirX = stateFirstSilence.lastDirX ?? 0;
          const dirY = stateFirstSilence.lastDirY ?? -1;

          const backDist = 150;
          d.targetCX = mx - dirX * backDist;
          d.targetCY = my - dirY * backDist;

          const baseAngle = Math.atan2(py - d.targetCY, px - d.targetCX);

          const spread = ((hardMode ? 20 : 10) * Math.PI) / 180;
          const index = stateFirstSilence.daggers.indexOf(d);
          const offset = (index - 1.5) * spread;

          d.targetAngle = baseAngle + offset;

          d.startCX = d.worldX;
          d.startCY = d.worldY;
          d.startAngle = d.angle;
        }

        const p = Math.min((d.t - spinDuration) / moveDuration, 1);

        const ease = 1 - (1 - p) * (1 - p);

        d.cx = d.startCX + (d.targetCX - d.startCX) * ease;
        d.cy = d.startCY + (d.targetCY - d.startCY) * ease;

        d.angle = d.startAngle + (d.targetAngle - d.startAngle) * ease;

        d.radius = 0;

        const slashStart = 2 + d.delay;

        if (d.t >= slashStart && !d.slashing) {
          d.slashing = true;
          d.slashT = 0;
          d.slashInit = false;
        }

        if (d.slashing) {
          d.slashT += dt;

          const slashDuration = 1;

          const p = Math.min(d.slashT / slashDuration, 1);

          const ease = 1 - (1 - p) * (1 - p);

          const slashDist = 1000;

          if (!d.slashInit) {
            d.slashInit = true;

            d.slashStartX = d.cx;
            d.slashStartY = d.cy;

            d.slashAngle = d.angle;
          }

          d.cx = d.slashStartX + Math.cos(d.slashAngle) * slashDist * ease;
          d.cy = d.slashStartY + Math.sin(d.slashAngle) * slashDist * ease;

          const dx = mx - d.cx;
          const dy = my - d.cy;

          const cos = Math.cos(-d.angle);
          const sin = Math.sin(-d.angle);

          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;

          const len = 140;
          const w = 60;

          if (rx > -40 && rx < len && Math.abs(ry) < w / 2 && d.t <= 3) {
            checkDeath("Celestial");
          }
        }
      }
    }

    const mvx = mx - stateFirstSilence.prevMx;
    const mvy = my - stateFirstSilence.prevMy;

    stateFirstSilence.prevMx = mx;
    stateFirstSilence.prevMy = my;

    const px = mx + mvx;
    const py = my + mvy;

    if (
      stateFirstSilence.timer >= 4.5 &&
      stateFirstSilence.timer <= 5.5 &&
      stateFirstSilence.beams.length == 0
    ) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Slash/Fall_Final.ogg`,
        0.75,
        undefined,
        undefined,
        undefined,
        "50",
      );
      if (!hardMode) {
        const base = Math.random() * Math.PI * 2;
        const spread = Math.PI / 12 + (Math.PI / 4.5) * Math.random();
        const spread2 = Math.PI / 12 + (Math.PI / 4.5) * Math.random();
        const spread3 = Math.PI / 2.571 + (Math.PI / 4.5) * Math.random();

        stateFirstSilence.beams.push(spawnBeam(px, py, base, 1.5));
        stateFirstSilence.beams.push(spawnBeam(px, py, base + spread, 1.5));
        stateFirstSilence.beams.push(spawnBeam(px, py, base - spread2, 1.5));
        stateFirstSilence.beams.push(spawnBeam(px, py, base + spread3, 1.5));
      } else {
        const base = Math.random() * Math.PI * 2;
        const spread = Math.PI / 12 + (Math.PI / 6.857) * Math.random();
        const spread2 = Math.PI / 12 + (Math.PI / 6.857) * Math.random();
        const spread3 = Math.PI / 3.2 + (Math.PI / 6.857) * Math.random();
        const spread4 = Math.PI / 3.2 + (Math.PI / 6.857) * Math.random();

        stateFirstSilence.beams.push(spawnBeam(px, py, base, 1.5));
        stateFirstSilence.beams.push(spawnBeam(px, py, base + spread, 1.5));
        stateFirstSilence.beams.push(spawnBeam(px, py, base - spread2, 1.5));
        stateFirstSilence.beams.push(spawnBeam(px, py, base + spread3, 1.5));
        stateFirstSilence.beams.push(spawnBeam(px, py, base - spread4, 1.5));
      }
    }

    stateFirstSilence.timer += dt;

    let needsCompactSlash = false;
    for (const b of stateFirstSilence.beams) {
      let t = (b.t += dt);

      if (t < 0.5) {
        const p = t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        b.width = b.targetWidth * eased;
      } else if (t < b.armTime) {
        b.width = b.targetWidth;
      } else {
        const w = b.width - dt * 200;
        b.width = w;
        if (w <= 0) {
          b.active = false;
          needsCompactSlash = true;
        }
      }

      const dx = mx - b.x;
      const dy = my - b.y;

      const angle = b.angle;
      const cos = Math.cos(-angle);
      const sin = Math.sin(-angle);

      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;

      const halfW = b.width * 0.5;

      if (
        b.active &&
        t >= b.armTime &&
        Math.abs(rx) < 20000 &&
        Math.abs(ry) < halfW
      ) {
        checkDeath("Celestial");
      }

      b._rx = rx;
    }
    if (needsCompactSlash) compact(stateFirstSilence.beams);
  }
  function drawFirstSilence(ctx) {
    for (const s of stateFirstSilence.spokes) {
      ctx.save();

      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      const isLethal = s.t >= 2;

      for (let i = 0; i < (hardMode ? 10 : 8); i++) {
        ctx.rotate(Math.PI / (hardMode ? 5 : 4));

        const w = isLethal ? 90 : 100;
        const dx = mouse.x - s.x;
        const dy = mouse.y - s.y;

        const cos = Math.cos(-(s.angle + i * (Math.PI / (hardMode ? 5 : 4))));
        const sin = Math.sin(-(s.angle + i * (Math.PI / (hardMode ? 5 : 4))));

        const rx = dx * cos - dy * sin;
        const x = rx - BEAM_RADIUS;
        const len = BEAM_RADIUS * 2;

        if (isLethal) {
          ctx.globalAlpha = s.t >= 2.75 ? Math.min(0, (3 - s.t) * 4) : 1;

          const drawX = Math.max(x, s.offset);
          const glow = 100;

          const gradTop = ctx.createLinearGradient(0, -w / 2 - glow, 0, -w / 2);
          gradTop.addColorStop(0, "rgba(255,0,192,0)");
          gradTop.addColorStop(1, "rgba(255,0,192,1)");

          ctx.fillStyle = gradTop;
          ctx.fillRect(drawX, -w / 2 - glow, len, glow);

          const gradBot = ctx.createLinearGradient(0, w / 2, 0, w / 2 + glow);
          gradBot.addColorStop(0, "rgba(255,0,192,1)");
          gradBot.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = gradBot;
          ctx.fillRect(drawX, w / 2, len, glow);

          const leftGrad = ctx.createLinearGradient(drawX - glow, 0, drawX, 0);
          leftGrad.addColorStop(0, "rgba(255,0,192,0)");
          leftGrad.addColorStop(1, "#ff00cc");

          ctx.fillStyle = leftGrad;
          ctx.fillRect(drawX - glow, -w / 2 - 1, glow, w + 2);

          const rightGrad = ctx.createLinearGradient(
            drawX + len,
            0,
            drawX + len + glow,
            0,
          );
          rightGrad.addColorStop(0, "#ff00cc");
          rightGrad.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = rightGrad;
          ctx.fillRect(drawX + len, -w / 2 - 1, glow, w + 2);

          const points = [
            [drawX, -w / 2, -0.9983, -1.0083],
            [drawX + len, -w / 2, -0.0017, -1.0083],
            [drawX, w / 2, -0.9983, 0.0083],
            [drawX + len, w / 2, -0.0017, 0.0083],
          ];

          for (const [px, py, ox, oy] of points) {
            const grad = ctx.createRadialGradient(px, py, 0, px, py, glow);

            grad.addColorStop(0, "#ff00cc");
            grad.addColorStop(1, "rgba(255,0,192,0)");

            ctx.fillStyle = grad;
            ctx.fillRect(px + ox * glow, py + oy * glow, glow, glow);
          }

          ctx.strokeStyle = "#ff00cc";
          ctx.lineWidth = 1;
          ctx.strokeRect(drawX, -w / 2, len, w);
        } else if (i < (hardMode ? 5 : 4)) {
          ctx.globalAlpha =
            s.t < 0.25 && stateFirstSilence.cycle == 0 ? s.t * 3 : 0.75;

          const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
          grad.addColorStop(0, "rgba(255,0,192,0)");
          grad.addColorStop(0.45, "#ff00cc");
          grad.addColorStop(0.55, "#ff00cc");
          grad.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = grad;
          ctx.fillRect(x, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
    for (const c of stateFirstSilence.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t >= 2 && c.r >= 0) {
        const glow = 100;

        const grad = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,192,1)");
        grad.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "transparent";
      }

      ctx.restore();
    }
    for (const d of stateFirstSilence.daggers) {
      const cx = d.cx ?? mouse.x;
      const cy = d.cy ?? mouse.y;

      let x, y;

      const tipOffset = 100;
      if (d.slashing) {
        x = cx - Math.cos(d.angle) * tipOffset;
        y = cy - Math.sin(d.angle) * tipOffset;
      } else {
        const radius = d.radius ?? 200;

        const baseX = cx + Math.cos(d.angle) * radius;
        const baseY = cy + Math.sin(d.angle) * radius;

        x = baseX - Math.cos(d.angle) * tipOffset;
        y = baseY - Math.sin(d.angle) * tipOffset;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(d.angle);

      let alpha = 1;
      if (d.t < 0.25) {
        alpha = d.t / 0.25;
      }
      if (d.slashing) {
        const slashDuration = 1;
        const p = Math.min((d.t - 2) / slashDuration, 1);
        if (p > 0.75) {
          const fadeOut = (1 - p) / 0.25;
          alpha = Math.min(alpha, fadeOut);
        }
      }
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      const glowLen = 100;
      const glowWidth = 20;
      ctx.save();
      ctx.scale(1, glowWidth / glowLen);
      ctx.translate(tipOffset * 0.25, 0);

      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowLen);
      glow.addColorStop(0, "rgba(255,0,192,1)");
      glow.addColorStop(1, "rgba(255,0,192,0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowLen, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.scale(0.1, 0.1);
      ctx.beginPath();

      ctx.moveTo(-500, 0);

      ctx.lineTo(-280, -40);
      ctx.lineTo(-240, -240);
      ctx.lineTo(-200, -40);
      ctx.lineTo(-160, -30);

      ctx.lineTo(-80, -40);
      ctx.lineTo(30, -100);
      ctx.lineTo(15, -65);
      ctx.lineTo(80, -40);

      ctx.lineTo(1000, 0);

      ctx.lineTo(80, 40);
      ctx.lineTo(15, 65);
      ctx.lineTo(30, 100);
      ctx.lineTo(-80, 40);

      ctx.lineTo(-160, 30);
      ctx.lineTo(-200, 40);
      ctx.lineTo(-240, 240);
      ctx.lineTo(-280, 40);

      ctx.closePath();

      ctx.strokeStyle = "#ff00cc";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
    for (const b of stateFirstSilence.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);

      let a = b.angle;
      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }

      ctx.rotate(a);

      const armed = b.t >= b.armTime;
      const alpha = armed ? 1 : 0.5;

      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1;

      if (!armed) {
        ctx.strokeStyle = "transparent";
      } else {
        ctx.strokeStyle = "#ff00cc";
      }

      const x = b._rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      if (armed && b.width > 1) {
        const glow = 100;

        const gradTop = ctx.createLinearGradient(
          0,
          -b.width / 2 - glow,
          0,
          -b.width / 2,
        );
        gradTop.addColorStop(0, "rgba(255,0,192,0)");
        gradTop.addColorStop(1, "rgba(255,0,192,1)");

        ctx.fillStyle = gradTop;
        ctx.fillRect(x, -b.width / 2 - glow, len, glow);

        const gradBot = ctx.createLinearGradient(
          0,
          b.width / 2,
          0,
          b.width / 2 + glow,
        );
        gradBot.addColorStop(0, "rgba(255,0,192,1)");
        gradBot.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = gradBot;
        ctx.fillRect(x, b.width / 2, len, glow);
      }

      ctx.strokeRect(x, -b.width * 0.5, len, b.width);

      ctx.restore();
    }
  }
  function drawFirstSilenceFront(ctx) {
    for (const s of stateFirstSilence.spokes) {
      ctx.save();

      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      const isLethal = s.t >= 2;

      for (let i = 0; i < (hardMode ? 10 : 8); i++) {
        ctx.rotate(Math.PI / (hardMode ? 5 : 4));

        const w = 90;
        const dx = mouse.x - s.x;
        const dy = mouse.y - s.y;

        const cos = Math.cos(-(s.angle + i * (Math.PI / (hardMode ? 5 : 4))));
        const sin = Math.sin(-(s.angle + i * (Math.PI / (hardMode ? 5 : 4))));

        const rx = dx * cos - dy * sin;
        const x = rx - BEAM_RADIUS;
        const len = BEAM_RADIUS * 2;

        if (isLethal) {
          ctx.globalAlpha = s.t >= 2.75 ? (3 - s.t) * 4 : 1;
          ctx.beginPath();
          ctx.fillStyle = "black";
          ctx.fillRect(Math.max(x, s.offset), -w / 2, len, w);
        }
      }

      ctx.restore();
    }
    for (const b of stateFirstSilence.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);

      let a = b.angle;
      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }

      ctx.rotate(a);

      const armed = b.t >= b.armTime;
      const alpha = armed ? 1 : 0.5;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = armed ? "black" : "#ff00cc";

      const x = b._rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      ctx.fillRect(x, -b.width * 0.5, len, b.width);

      ctx.restore();
    }
    for (const c of stateFirstSilence.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t < 2) {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r);
        grad.addColorStop(0, "black");
        grad.addColorStop(1, "#ff00cc");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.r >= 0) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
    for (const d of stateFirstSilence.daggers) {
      const spinDuration = 1.5;
      const moveDuration = 0.5;

      const indicatorAlpha =
        d.t >= spinDuration ? (d.t - spinDuration) / moveDuration : 0;

      const cx = d.cx ?? mouse.x;
      const cy = d.cy ?? mouse.y;

      let x, y;

      const tipOffset = 100;
      if (d.slashing) {
        x = cx - Math.cos(d.angle) * tipOffset;
        y = cy - Math.sin(d.angle) * tipOffset;
      } else {
        const radius = d.radius ?? 200;

        const baseX = cx + Math.cos(d.angle) * radius;
        const baseY = cy + Math.sin(d.angle) * radius;

        x = baseX - Math.cos(d.angle) * tipOffset;
        y = baseY - Math.sin(d.angle) * tipOffset;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(d.angle);

      let alpha = 1;
      if (d.t < 0.25) {
        alpha = d.t / 0.25;
      }
      if (d.slashing) {
        const slashDuration = 1;
        const p = Math.min((d.t - 2) / slashDuration, 1);
        if (p > 0.75) {
          const fadeOut = (1 - p) / 0.25;
          alpha = Math.min(alpha, fadeOut);
        }
      }
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      if (indicatorAlpha > 0) {
        ctx.save();

        ctx.globalAlpha = indicatorAlpha;

        const len = 20000;
        const w = 1;
        const glow = 100;

        const drawX = 0;

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 9;

        ctx.beginPath();
        ctx.rect(drawX, -w / 2, len, w);
        ctx.stroke();

        ctx.restore();
      }

      ctx.scale(0.1, 0.1);
      ctx.beginPath();

      ctx.moveTo(-500, 0);

      ctx.lineTo(-280, -40);
      ctx.lineTo(-240, -240);
      ctx.lineTo(-200, -40);
      ctx.lineTo(-160, -30);

      ctx.lineTo(-80, -40);
      ctx.lineTo(30, -100);
      ctx.lineTo(15, -65);
      ctx.lineTo(80, -40);

      ctx.lineTo(1000, 0);

      ctx.lineTo(80, 40);
      ctx.lineTo(15, 65);
      ctx.lineTo(30, 100);
      ctx.lineTo(-80, 40);

      ctx.lineTo(-160, 30);
      ctx.lineTo(-200, 40);
      ctx.lineTo(-240, 240);
      ctx.lineTo(-280, 40);

      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.fill();

      ctx.restore();
    }
  }

  const stateSecondSilence = {
    t: 0,
    cx: 0,
    cy: 0,
    ex: 0,
    ey: 0,
    prevMx: 0,
    prevMy: 0,
    len: 20000,
    w: hardMode ? 500 : 417,
    active: false,
    particles: [],
    pTimer: 0,

    crumbleT: 0,
    circles: [],

    beams: [],
    timer: 0,

    cycle: 0,
    futileT: 0,
    rift: null,
    snake: null,
    trail: [],
  };
  function enterSecondSilence() {
    const s = stateSecondSilence;

    s.t = 0;
    s.active = true;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const ang = Math.atan2(cy - mouse.y, cx - mouse.x);
    s.cx = mouse.x + Math.cos(ang) * 1000;
    s.cy = mouse.y + Math.sin(ang) * 1000;
    enterFixed(s.cx, s.cy);
    s.w = hardMode ? 500 : 417;
    s.angle = 0;
    s.baseAngle = Math.random() * Math.PI * 2;
    s.prevAngle = 0;
    s.dir = Math.random() < 0.5;

    s.ex = mouse.x;
    s.ey = mouse.y;
    s.particles = [];
    s.pTimer = 0;

    s.crumbleT = 0;
    s.circles = [];

    s.beams = [];
    s.timer = 0;
    s.prevMx = mouse.x;
    s.prevMy = mouse.y;

    s.cycle = 0;
    s.futileT = 0;
    s.snake = null;
    s.rift = spawnFutileRift();
    s.trail = [];
    s.change = false;
    setGiftMultiplier(0.5);

    if (truePattern == false) showText("SILENCE.");
  }
  function updateSecondSilence(dt) {
    const mx = mouse.x;
    const my = mouse.y;
    const s = stateSecondSilence;

    s.t += dt;
    if (s.t >= 1.75 && !s.change) {
      s.change = true;
      changeEnemy(Celestial_FinalSwing);
    }
    s.pTimer += dt;

    const follow = 1 - Math.exp(-0.8 * dt);

    s.ex += (mx - s.ex) * follow;
    s.ey += (my - s.ey) * follow;

    const dirSign = s.dir ? 1 : -1;
    if (s.t < 5) {
      const rotSpeed = (Math.PI * 2) / 5;
      s.angle = s.baseAngle + rotSpeed * s.t * dirSign;
    } else {
      const rotSpeed1 = (Math.PI * 2) / 5;
      const rotSpeed2 = (Math.PI * 2) / 9;

      const angleAt5 = s.baseAngle + rotSpeed1 * 5 * dirSign;
      const t2 = s.t - 5;

      s.angle = angleAt5 + rotSpeed2 * t2 * dirSign;
    }
    const angleDelta = s.angle - s.prevAngle;
    s.prevAngle = s.angle;

    const mvx = mx - s.prevMx;
    const mvy = my - s.prevMy;
    s.prevMx = mx;
    s.prevMy = my;
    const bx = Math.cos(s.angle);
    const by = Math.sin(s.angle);
    const dir = mvx * bx + mvy * by;

    if (s.t < 14 && s.pTimer >= 0.02) {
      s.pTimer = 0;

      const spawnCount = 200;

      const nx = Math.cos(s.angle + Math.PI / 2);
      const ny = Math.sin(s.angle + Math.PI / 2);

      for (let i = 0; i < spawnCount; i++) {
        const angle = s.angle;
        const len = s.len;

        const t = Math.random();
        const along = t * len + 125;

        const forward = dir >= 0 ? 1 : -1;
        const edgeSide = Math.random() < 0.5 ? -1 : 1;
        const trailingOffset = (s.w / 2) * forward * edgeSide;
        const leadingOffset = (s.w / 1.5) * forward * edgeSide;
        const isLeading = Math.random() < 0.35;
        const spread = isLeading ? leadingOffset : trailingOffset;

        const px = s.cx + bx * along + nx * spread;
        const py = s.cy + by * along + ny * spread;

        if (s.t >= 5) {
          s.particles.push({
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * (s.t > 5 ? 1000 : 100),
            vy: (Math.random() - 0.5) * (s.t > 5 ? 1000 : 100),
            r: Math.random() * 40,
            t: 0,
            life: 0.25 + Math.random() * 0.25,
            active: true,
          });
        }

        if (s.t < 5 && Math.random() < 0.05) {
          const innerSpread = (Math.random() - 0.5) * s.w * 0.8;

          const px2 = s.cx + bx * along + nx * innerSpread;
          const py2 = s.cy + by * along + ny * innerSpread;

          const speed = 200 * (0.5 + Math.random() * 0.5);
          s.particles.push({
            x: px2,
            y: py2,
            vx: bx * speed,
            vy: by * speed,
            r: Math.random() * 40 + 40,
            t: 0,
            life: 0.5 + Math.random() * 0.5,
            active: true,
            ellipse: true,
          });
        }
      }
    }

    const cos = Math.cos(-s.angle);
    const sin = Math.sin(-s.angle);

    if (s.t >= 5) {
      if (s.t <= 14) shakeScreen();
      enterFixed(-1000, -1000, false);

      const mmx = mx - s.cx;
      const mmy = my - s.cy;

      const rx = mmx * cos - mmy * sin;
      const ry = mmx * sin + mmy * cos;

      if (rx > 0 && rx < s.len && Math.abs(ry) < s.w / 2 && s.active) {
        checkDeath("Celestial");
      }
    }

    s.crumbleT += dt;
    if (s.t >= 6 && s.crumbleT >= 2 && s.t < 14) {
      for (let i = 0; i < 300; i++) {
        s.circles.push(spawnCircle(2));
      }
      s.crumbleT = 0;
    }

    let needsCompact = false;
    for (const p of s.particles) {
      p.t += dt;

      if (p.ellipse) {
        const c = Math.cos(angleDelta);
        const sA = Math.sin(angleDelta);

        const rx = p.x - s.cx;
        const ry = p.y - s.cy;

        p.x = s.cx + rx * c - ry * sA;
        p.y = s.cy + rx * sA + ry * c;

        const rvx = p.vx;
        const rvy = p.vy;

        p.vx = rvx * c - rvy * sA;
        p.vy = rvx * sA + rvy * c;

        const accel = 200 * dt;
        p.vx += Math.cos(s.angle) * accel;
        p.vy += Math.sin(s.angle) * accel;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += dt * 5;

      if (p.t > p.life) {
        p.active = false;
        needsCompact = true;
      }

      const dx = p.x - s.cx;
      const dy = p.y - s.cy;

      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;

      const halfLen = s.len;
      const halfW = s.w / 2 + 100;

      if (Math.abs(rx) > halfLen || Math.abs(ry) > halfW) {
        p.active = false;
        needsCompact = true;
      }
    }
    if (needsCompact) compact(s.particles);

    if (s.t <= dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/DeathInBloom/Silence_Charge.ogg`,
        1.25,
        undefined,
        undefined,
        undefined,
        "50",
      );
    } else if (s.t >= 5 && s.t <= 5 + dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/DeathInBloom/Silence_Firing.ogg`,
        0.667,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }

    if (s.t >= 5 && s.t < 14) {
      s.w = Math.random() * 50 + (hardMode ? 450 : 367);
    }
    if (s.t >= 14) {
      s.w -= dt * 1000;
      if (s.w <= 0 && s.active) {
        s.w = 0;
        setGiftMultiplier(2);
        s.active = false;
      }
    }

    let needsCompactCrumble = false;
    for (const c of s.circles) {
      c.t += dt;

      if (c.t < 2) {
        const p = c.t / 2;

        const eased = 1 - (1 - p) * (1 - p);

        c.x = c.sx + (c.tx - c.sx) * eased;
        c.y = c.sy + (c.ty - c.sy) * eased;
      }

      if (c.t < 0.5) {
        const p = c.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        c.r = c.targetR * eased;
      } else if (c.t < 2) {
        c.r = c.targetR;
      } else {
        if (!c.shake) {
          c.shake = true;
          shakeScreen();
        }
        c.r -= dt * 200;
        if (c.r <= 0) {
          c.active = false;
          needsCompactCrumble = true;
        }
      }

      if (c.t >= 2) {
        const dx = mx - c.x;
        const dy = my - c.y;
        if (dx * dx + dy * dy <= c.r * c.r) {
          checkDeath("Celestial");
        }
      }
    }
    if (needsCompactCrumble) compact(s.circles);

    const px = mx + mvx;
    const py = my + mvy;

    if (s.timer >= 1 && s.timer <= 2 && s.beams.length == 0) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Slash/Fall_Final.ogg`,
        0.75,
        undefined,
        undefined,
        undefined,
        "50",
      );
      if (!hardMode) {
        const base = Math.random() * Math.PI * 2;
        const spread = Math.PI / 12 + (Math.PI / 4.5) * Math.random();
        const spread2 = Math.PI / 12 + (Math.PI / 4.5) * Math.random();
        const spread3 = Math.PI / 2.571 + (Math.PI / 4.5) * Math.random();

        s.beams.push(spawnBeam(px, py, base, 1.5));
        s.beams.push(spawnBeam(px, py, base + spread, 1.5));
        s.beams.push(spawnBeam(px, py, base - spread2, 1.5));
        s.beams.push(spawnBeam(px, py, base + spread3, 1.5));
      } else {
        const base = Math.random() * Math.PI * 2;
        const spread = Math.PI / 12 + (Math.PI / 6.857) * Math.random();
        const spread2 = Math.PI / 12 + (Math.PI / 6.857) * Math.random();
        const spread3 = Math.PI / 3.2 + (Math.PI / 6.857) * Math.random();
        const spread4 = Math.PI / 3.2 + (Math.PI / 6.857) * Math.random();

        s.beams.push(spawnBeam(px, py, base, 1.5));
        s.beams.push(spawnBeam(px, py, base + spread, 1.5));
        s.beams.push(spawnBeam(px, py, base - spread2, 1.5));
        s.beams.push(spawnBeam(px, py, base + spread3, 1.5));
        s.beams.push(spawnBeam(px, py, base - spread4, 1.5));
      }
    }

    s.timer += dt;

    let needsCompactSlash = false;
    for (const b of s.beams) {
      let t = (b.t += dt);

      if (t < 0.5) {
        const p = t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        b.width = b.targetWidth * eased;
      } else if (t < b.armTime) {
        b.width = b.targetWidth;
      } else {
        if (!b.shake) {
          b.shake = true;
          shakeScreen();
        }
        const w = b.width - dt * 200;
        b.width = w;
        if (w <= 0) {
          b.active = false;
          needsCompactSlash = true;
        }
      }

      const dx = mx - b.x;
      const dy = my - b.y;

      const angle = b.angle;
      const cos = Math.cos(-angle);
      const sin = Math.sin(-angle);

      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;

      const halfW = b.width * 0.5;

      if (
        b.active &&
        t >= b.armTime &&
        Math.abs(rx) < 20000 &&
        Math.abs(ry) < halfW
      ) {
        checkDeath("Celestial");
      }

      b._rx = rx;
    }
    if (needsCompactSlash) compact(s.beams);

    if (s.t >= 5) {
      s.futileT += dt;
      s.rift.t += dt;
    }

    const r = s.rift;
    if (r.t >= 0.01 && r.t <= 0.01 + dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Futile/Futile_Start.ogg`,
        0.9,
        undefined,
        undefined,
        undefined,
        "50",
      );
    } else if (r.t >= 1 && r.t <= 1 + dt) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Futile/Futile_Variation_${Math.floor(1 + Math.random() * 3)}.ogg`,
        undefined,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }
    if (r.t < 0.25) {
      const p = r.t / 0.25;
      r.scale = 1 - (1 - p) * (1 - p);
    } else if (r.t < 1) {
      r.scale = 1;
    } else {
      const p = (r.t - 1) * 2;
      r.scale = Math.max(0, 1 - p * p);
    }

    if (s.rift.t >= 1 && s.rift.t < 3 && !s.snake) {
      s.snake = spawnSnake(s.rift);
    }

    const sn = s.snake;
    if (sn) {
      const dx = mx - sn.x;
      const dy = my - sn.y;

      const vLen = Math.sqrt(sn.vx * sn.vx + sn.vy * sn.vy) || 1;
      const vx = sn.vx / vLen;
      const vy = sn.vy / vLen;

      const px = -vy;
      const py = vx;

      const side = dx * px + dy * py;
      const forward = dx * vx + dy * vy;
      const TURN_STRENGTH = 12 * (forward < 0 ? 0.5 : 1) * (hardMode ? 2 : 1);

      sn.vx += px * side * TURN_STRENGTH * dt;
      sn.vy += py * side * TURN_STRENGTH * dt;

      const newLen = Math.sqrt(sn.vx * sn.vx + sn.vy * sn.vy) || 1;
      const speed = 2500;

      sn.vx = (sn.vx / newLen) * speed;
      sn.vy = (sn.vy / newLen) * speed;

      sn.x += sn.vx * dt;
      sn.y += sn.vy * dt;

      const off = 100;
      if (s.rift.t < 3) {
        s.trail.push({
          x: sn.x + (Math.random() - 0.5) * off,
          y: sn.y + (Math.random() - 0.5) * off,
          r: 200,
          a: Math.random() * Math.PI * 2,
        });
        shakeScreen();
      }

      if (s.rift.t >= 3) {
        sn.vx *= 0.85;
        sn.vy *= 0.85;
      }
    }

    for (const p of s.trail) {
      const dx = p.x - mx;
      const dy = p.y - my;
      if (dx * dx + dy * dy < p.r * p.r) {
        checkDeath("Celestial");
      }
      p.r -=
        dt *
        Math.max(50, p.r) *
        1.25 *
        (s.futileT >= 12 ? (s.futileT - 11) * 1.25 : 1);
    }
    s.trail = s.trail.filter((p) => p.r > 0);

    if (s.rift.t >= 3) {
      s.cycle++;

      if (s.cycle < 4) {
        s.rift = spawnFutileRift();
      }

      s.snake = null;
    }
  }
  function drawSecondSilence(ctx) {
    const s = stateSecondSilence;

    if (s.active) {
      for (const p of s.particles) {
        ctx.save();

        ctx.globalAlpha = (s.t > 5 ? 1 : 0.2) * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.beginPath();
        if (!p.ellipse) {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

          ctx.strokeStyle = "#ff00cc";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      }

      ctx.save();

      const forwardOffset = 125;
      const ox = s.cx + Math.cos(s.angle) * forwardOffset;
      const oy = s.cy + Math.sin(s.angle) * forwardOffset;
      ctx.translate(ox, oy);
      ctx.rotate(s.angle);

      const dx = mouse.x - s.cx;
      const dy = mouse.y - s.cy;

      const cos = Math.cos(-s.angle);
      const sin = Math.sin(-s.angle);

      const rx = dx * cos - dy * sin;
      const x = rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;
      const randLineWidth = 18 * (Math.random() + 2);

      const isLethal = s.t >= 5;

      ctx.save();
      if (isLethal) {
        const alpha = s.t < 0.25 ? s.t * 4 : 1;

        const glowLen = 1500;
        const glowWidth = s.w * 1.1;

        ctx.scale(1, glowWidth / glowLen);

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowLen);
        grad.addColorStop(0, "#ff00cc");
        grad.addColorStop(0.5, "#ff00cc");
        grad.addColorStop(1, "rgba(255,0,192,0)");

        ctx.globalAlpha = (Math.random() * 0.25 + 0.75) * alpha;
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.arc(0, 0, glowLen, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.save();

      ctx.beginPath();
      ctx.moveTo(-randLineWidth / 2, -s.w / 2 - randLineWidth / 2);
      ctx.lineTo(-randLineWidth / 2, s.w / 2 + randLineWidth / 2);
      ctx.lineTo(-forwardOffset - randLineWidth / 2, 0);
      ctx.closePath();

      if (isLethal) {
        ctx.fillStyle = "#ff00cc";
        ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.fill();
      }

      ctx.restore();

      if (!isLethal) {
        ctx.globalAlpha = 0.25 * (s.t < 0.25 ? s.t * 4 : 1);
        ctx.fillStyle = "#ff00cc";
      } else {
        ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.rect(Math.max(x, 0), -s.w / 2, len, s.w);
        ctx.stroke();

        ctx.fillStyle = "black";
      }

      const edgeOffset = s.w / 2;
      const glowSize = 400;

      ctx.save();
      ctx.globalAlpha =
        (isLethal ? Math.random() * 0.25 + 0.5 : 0.05) *
        (s.t < 0.25 ? s.t * 4 : 1);

      let grad = ctx.createLinearGradient(
        0,
        -edgeOffset - glowSize,
        0,
        -edgeOffset,
      );
      grad.addColorStop(0, "rgba(255,0,192,0)");
      grad.addColorStop(1, "#ff00cc");

      ctx.fillStyle = grad;
      ctx.fillRect(Math.max(x, 0), -edgeOffset - glowSize, len, glowSize);

      let grad2 = ctx.createLinearGradient(
        0,
        edgeOffset,
        0,
        edgeOffset + glowSize,
      );
      grad2.addColorStop(0, "#ff00cc");
      grad2.addColorStop(1, "rgba(255,0,192,0)");

      ctx.fillStyle = grad2;
      ctx.fillRect(Math.max(x, 0), edgeOffset, len, glowSize);

      ctx.restore();

      ctx.restore();
    }

    if (s.rift) {
      const pts = s.rift.points;

      ctx.save();
      ctx.translate(s.rift.x, s.rift.y);
      ctx.rotate(s.rift.angle);
      ctx.scale(s.rift.scale, s.rift.scale);

      const glowSize = 300;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
      glow.addColorStop(0, "rgba(255,0,192,1)");
      glow.addColorStop(1, "rgba(255,0,192,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (i === 0) ctx.moveTo(p.lx, p.y);
        else ctx.lineTo(p.lx, p.y);
      }

      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        ctx.lineTo(p.rx, p.y);
      }

      ctx.closePath();

      ctx.strokeStyle = "#ff00cc";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }

    for (const p of s.trail) {
      ctx.save();

      ctx.translate(p.x, p.y);

      const glowSize = 100;
      const glow = ctx.createRadialGradient(0, 0, p.r, 0, 0, p.r + glowSize);
      glow.addColorStop(0, "rgba(255,0,192,1)");
      glow.addColorStop(1, "rgba(255,0,192,0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, p.r + glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = "#ff00cc";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.rotate(p.a);

      const len = Math.max(0, Math.min(30, p.r * 0.6 - 30));
      const w = 1000;

      if (len > 0) {
        const grad = ctx.createLinearGradient(
          -len / 2 - glowSize,
          0,
          -len / 2,
          0,
        );
        grad.addColorStop(0, "rgba(255,0,192,0)");
        grad.addColorStop(1, `rgba(255,0,192,1)`);

        ctx.fillStyle = grad;
        ctx.fillRect(-len / 2 - glowSize, -w / 2, glowSize, w);

        const grad2 = ctx.createLinearGradient(
          len / 2,
          0,
          len / 2 + glowSize,
          0,
        );
        grad2.addColorStop(0, `rgba(255,0,192,1)`);
        grad2.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = grad2;
        ctx.fillRect(len / 2, -w / 2, glowSize, w);

        const topGrad = ctx.createLinearGradient(
          0,
          -w / 2 - glowSize,
          0,
          -w / 2,
        );
        topGrad.addColorStop(0, "rgba(255,0,192,0)");
        topGrad.addColorStop(1, "#ff00cc");

        ctx.fillStyle = topGrad;
        ctx.fillRect(-len / 2 - 1, -w / 2 - glowSize, len + 2, glowSize);

        const bottomGrad = ctx.createLinearGradient(
          0,
          w / 2,
          0,
          w / 2 + glowSize,
        );
        bottomGrad.addColorStop(0, "#ff00cc");
        bottomGrad.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = bottomGrad;
        ctx.fillRect(-len / 2 - 1, w / 2, len + 2, glowSize);

        const points = [
          [-len / 2, -w / 2, -1.0083, -0.9983],
          [len / 2, -w / 2, 0.0083, -0.9983],
          [-len / 2, w / 2, -1.0083, -0.0017],
          [len / 2, w / 2, 0.0083, -0.0017],
        ];
        for (const [x, y, ox, oy] of points) {
          const grad = ctx.createRadialGradient(x, y, 0, x, y, glowSize);

          grad.addColorStop(0, "#ff00cc");
          grad.addColorStop(1, "rgba(255,0,192,0)");

          ctx.fillStyle = grad;
          ctx.fillRect(
            x + ox * glowSize,
            y + oy * glowSize,
            glowSize,
            glowSize,
          );
        }

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;
        ctx.strokeRect(-len / 2, -w / 2, len, w);
      }

      ctx.restore();
    }

    for (const c of s.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t >= 2 && c.r >= 0) {
        const glow = 100;

        const grad = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,192,1)");
        grad.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "transparent";
      }

      ctx.restore();
    }

    for (const b of s.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);

      let a = b.angle;
      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }

      ctx.rotate(a);

      const armed = b.t >= b.armTime;
      const alpha = armed ? 1 : 0.5;

      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1;

      if (!armed) {
        ctx.strokeStyle = "transparent";
      } else {
        ctx.strokeStyle = "#ff00cc";
      }

      const x = b._rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      if (armed && b.width > 1) {
        const glow = 100;

        const gradTop = ctx.createLinearGradient(
          0,
          -b.width / 2 - glow,
          0,
          -b.width / 2,
        );
        gradTop.addColorStop(0, "rgba(255,0,192,0)");
        gradTop.addColorStop(1, "rgba(255,0,192,1)");

        ctx.fillStyle = gradTop;
        ctx.fillRect(x, -b.width / 2 - glow, len, glow);

        const gradBot = ctx.createLinearGradient(
          0,
          b.width / 2,
          0,
          b.width / 2 + glow,
        );
        gradBot.addColorStop(0, "rgba(255,0,192,1)");
        gradBot.addColorStop(1, "rgba(255,0,192,0)");

        ctx.fillStyle = gradBot;
        ctx.fillRect(x, b.width / 2, len, glow);
      }

      ctx.strokeRect(x, -b.width * 0.5, len, b.width);

      ctx.restore();
    }
  }
  function drawSecondSilenceFront(ctx) {
    const s = stateSecondSilence;

    if (s.active) {
      ctx.save();

      const forwardOffset = 125;
      const ox = s.cx + Math.cos(s.angle) * forwardOffset;
      const oy = s.cy + Math.sin(s.angle) * forwardOffset;
      ctx.translate(ox, oy);
      ctx.rotate(s.angle);

      const dx = mouse.x - s.cx;
      const dy = mouse.y - s.cy;

      const cos = Math.cos(-s.angle);
      const sin = Math.sin(-s.angle);

      const rx = dx * cos - dy * sin;
      const x = rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      const isLethal = s.t >= 5;

      ctx.save();

      ctx.beginPath();
      ctx.moveTo(0.25, -s.w / 2);
      ctx.lineTo(0.25, s.w / 2);
      ctx.lineTo(-forwardOffset, 0);
      ctx.closePath();

      if (isLethal) {
        ctx.fillStyle = "black";
        ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.fill();
      } else {
        ctx.fillStyle = "#ff00cc";
        ctx.globalAlpha = 0.25 * (s.t < 0.25 ? s.t * 4 : 1);

        ctx.fill();
      }

      ctx.restore();

      if (!isLethal) {
        ctx.globalAlpha = 0.25 * (s.t < 0.25 ? s.t * 4 : 1);
        ctx.fillStyle = "#ff00cc";
      } else {
        ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);
        ctx.fillStyle = "black";
      }

      const edgeOffset = s.w / 2;
      const glowSize = 400;

      ctx.save();
      ctx.globalAlpha = (isLethal ? 0.25 : 0) * (s.t < 0.25 ? s.t * 4 : 1);
      ctx.fillStyle = "#ff00cc";
      const w = s.w * (Math.random() + 1);
      ctx.fillRect(Math.max(x, 0), -w / 2, len, w);
      ctx.restore();
      ctx.fillRect(Math.max(x, 0), -s.w / 2, len, s.w);

      ctx.restore();
      for (const p of s.particles) {
        ctx.save();

        ctx.globalAlpha = (s.t > 5 ? 1 : 0.2) * (s.t < 0.25 ? s.t * 4 : 1);
        ctx.fillStyle = "black";

        if (s.t < 5 && p.ellipse) {
          ctx.save();
          ctx.globalAlpha = 0.5 * (s.t < 0.25 ? s.t * 4 : 1);
          const angle = s.angle;
          const long = p.r * 0.5;
          const short = p.r * 0.1;

          ctx.beginPath();
          ctx.ellipse(p.x, p.y, long, short, angle, 0, Math.PI * 2);

          ctx.strokeStyle = "#ff00cc";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "black";
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();
    }

    if (s.rift) {
      const pts = s.rift.points;

      ctx.save();
      ctx.translate(s.rift.x, s.rift.y);
      ctx.rotate(s.rift.angle);
      ctx.scale(s.rift.scale, s.rift.scale);

      ctx.beginPath();

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (i === 0) ctx.moveTo(p.lx, p.y);
        else ctx.lineTo(p.lx, p.y);
      }

      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        ctx.lineTo(p.rx, p.y);
      }

      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.fill();

      ctx.restore();
    }

    for (const p of s.trail) {
      ctx.save();

      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);

      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();

      const len = Math.max(0, Math.min(30, p.r * 0.6 - 30));
      const w = 1000;

      if (len > 0) {
        ctx.fillStyle = "black";
        ctx.fillRect(-len / 2, -w / 2, len, w);
      }

      ctx.restore();
    }

    for (const b of s.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);

      let a = b.angle;
      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }

      ctx.rotate(a);

      const armed = b.t >= b.armTime;
      const alpha = armed ? 1 : 0.5;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = armed ? "black" : "#ff00cc";

      const x = b._rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      ctx.fillRect(x, -b.width * 0.5, len, b.width);

      ctx.restore();
    }

    for (const c of s.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t < 2) {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r);
        grad.addColorStop(0, "black");
        grad.addColorStop(1, "#ff00cc");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.r >= 0) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    const r = s.rift;
    if (s.rift && s.rift.t <= 2 && r) {
      const cam = getCameraPos();

      const cx = cam.x + window.innerWidth / 2;
      const cy = cam.y + window.innerHeight / 2;

      const dx = r.x - cx;
      const dy = r.y - cy;
      const ang = Math.atan2(dy, dx);

      const halfW = window.innerWidth / 2 - 60;
      const halfH = window.innerHeight / 2 - 60;

      const scale =
        Math.min(
          halfW / (Math.abs(Math.cos(ang)) || 0.0001),
          halfH / (Math.abs(Math.sin(ang)) || 0.0001),
        ) * 0.7;

      const ex = cx + Math.cos(ang) * scale;
      const ey = cy + Math.sin(ang) * scale;

      const pts = r.points;

      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(ang);

      ctx.scale(s.rift.scale * 0.5, s.rift.scale * 0.5);

      const glowSize = 300;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
      glow.addColorStop(0, "rgba(255,0,192,1)");
      glow.addColorStop(0.5, "rgba(255,0,192,0.75)");
      glow.addColorStop(1, "rgba(255,0,192,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (i === 0) ctx.moveTo(p.lx, p.y);
        else ctx.lineTo(p.lx, p.y);
      }

      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        ctx.lineTo(p.rx, p.y);
      }

      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.fill();

      ctx.strokeStyle = "#ff00cc";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(ang);

      ctx.fillStyle = "#ff00cc";
      ctx.font = `${s.rift.scale * 100}px monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      ctx.fillText("➤", s.rift.scale * 100, 0);

      ctx.restore();
    }
  }

  function update(dtOrigin) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (actualCollectedCount >= 10000) {
      phase = 4;
    } else if (actualCollectedCount >= 8000) {
      phase = 3;
    } else if (actualCollectedCount >= 6000) {
      phase = 2;
    } else {
      phase = 1;
    }

    const dt = dtOrigin * (hardMode ? 1.016949153 : 1);
    const mx = mouse.x;
    const my = mouse.y;

    if (!soundStopped) {
      if (!state.sound)
        state.sound = playSound(
          `./ASSET/Sound/Enemies/Celestial/Celestial_Radius1.ogg`,
          undefined,
          undefined,
          undefined,
          () => {
            state.sound = null;
          },
          "50",
        );
    } else {
      if (state.sound) {
        state.sound();
        state.sound = null;
      }
    }
    if (state.enemyTransition == "none") state.patternTime += dt;
    if (truePattern) {
      let scream = false;
      if (state.lastPhase === 0 && phase === 1) {
        scream = true;
        changeEnemy(Celestial_Idle);
        setTimeout(() => {
          changeEnemy(Celestial_Idle);
        }, 1000);
        playSound(
          `./ASSET/Sound/Enemies/Celestial/Screams/Celestial_screams_really_loudly.ogg`,
          undefined,
          undefined,
          undefined,
          undefined,
          "50",
        );
        state.loopPattern = loopPatternPhase1;
        state.patternIndex = state.loopPattern.length;
      } else if (state.lastPhase === 1 && phase === 2) {
        scream = true;
        changeEnemy(Celestial_Idle);
        setTimeout(() => {
          changeEnemy(Celestial_Idle);
        }, 1000);
        playSound(
          `./ASSET/Sound/Enemies/Celestial/Screams/Scream_Variation_1.ogg`,
          undefined,
          undefined,
          undefined,
          undefined,
          "50",
        );
        state.loopPattern = loopPatternPhase2;
        state.patternIndex = state.loopPattern.length;
      } else if (state.lastPhase === 2 && phase === 3) {
        scream = true;
        changeEnemy(Celestial_Idle);
        setTimeout(() => {
          changeEnemy(Celestial_Idle);
        }, 1000);
        playSound(
          `./ASSET/Sound/Enemies/Celestial/Screams/Scream_Variation_2.ogg`,
          undefined,
          undefined,
          undefined,
          undefined,
          "50",
        );
        state.loopPattern = loopPatternPhase3;
        state.patternIndex = state.loopPattern.length;
      } else if (state.lastPhase === 3 && phase === 4) {
        scream = true;
        changeEnemy(Celestial_Idle);
        setTimeout(() => {
          changeEnemy(Celestial_Idle);
        }, 1000);
        playSound(
          `./ASSET/Sound/Enemies/Celestial/Screams/Roar_Phase2.ogg`,
          undefined,
          undefined,
          undefined,
          undefined,
          "50",
        );
        playSound(
          `./ASSET/Sound/Enemies/Celestial/Celestial_Beacon_Fakeout.ogg`,
          undefined,
          undefined,
          undefined,
          undefined,
          "50",
        );
        startCelestialPhase4();
        state.loopPattern = loopPatternPhase4;
        state.patternIndex = state.loopPattern.length;
      }
      if (scream) {
        state.lastPhase = phase;
        state.scream = true;
        state.screamT = 0;
        state.enemyMode = "fixed";
        const cx = mouse.x + (Math.random() - 0.5) * 600;
        const cy = mouse.y + (Math.random() - 0.5) * 600;
        state.enemyFixed.x = cx;
        state.enemyFixed.y = cy;
      }
    }
    if (state.patternTime >= state.currentPattern.duration && !state.scream) {
      state.patternIndex++;

      if (state.patternIndex >= state.loopPattern.length) {
        state.patternIndex = 0;
      }

      state.currentPattern = state.loopPattern[state.patternIndex];
      state.patternTime = 0;
      state.currentPattern.enter?.();
    }

    state.layer++;
    if (state.layer > state.layers.length) {
      state.layer = 1;
      if (state.returnLayer) {
        state.returnLayer = false;
        if (state.nextLayer) {
          state.nextLayer();
          state.nextLayer = null;
        } else {
          state.layers = Celestial_Idle;
        }
      }
    }
    state.enemy = state.layers[Math.max(0, state.layer - 1)];

    state.enemyTrail.push({
      x: state.enemyX + (Math.random() - 0.5) * 300,
      y: state.enemyY + (Math.random() - 0.5) * 300,
      r: 100,
      speed: 1,
    });
    if (state.scream) {
      shakeScreen();
      for (let i = 0; i < 3; i++) {
        state.enemyTrail.push({
          x: state.enemyX + (Math.random() - 0.5) * 1500,
          y: state.enemyY + (Math.random() - 0.5) * 1500,
          r: 100,
          speed: 4,
        });
      }
    }
    for (const t of state.enemyTrail) {
      t.r -= 3.333 * t.speed;
    }
    state.enemyTrail = state.enemyTrail.filter((t) => t.r > 0);

    if (floatingText.active) {
      floatingText.t += dt;
      if (floatingText.t >= floatingText.duration) {
        floatingText.active = false;
      }
    }

    state.shakeStrength -= 2 * dt;
    if (state.shakeStrength > 0) {
      if (state.shakeX && state.shakeY) {
        moveCamera(-state.shakeX, -state.shakeY, true);
        state.shakeX = 0;
        state.shakeY = 0;
      } else {
        const x =
          (Math.random() < 0.5 ? 1 : -1) *
          Math.min(state.shakeStrength, 1) *
          10;
        const y =
          (Math.random() < 0.5 ? 1 : -1) *
          Math.min(state.shakeStrength, 1) *
          10;
        moveCamera(x, y, true);
        state.shakeX = x;
        state.shakeY = y;
      }
    } else {
      state.shakeStrength = 0;
      if (state.shakeX && state.shakeY) {
        moveCamera(-state.shakeX, -state.shakeY, true);
        state.shakeX = 0;
        state.shakeY = 0;
      }
    }

    if (state.scream) {
      state.screamT += dt;
      if (state.screamT >= 3) {
        state.scream = false;
        state.patternTime = 100;
        state.enemyMode = "orbit";
      }
      return;
    }

    if (state.enemyTransition == "none" && !state.scream) {
      state.enemyT += dt;
      if (state.enemyMode === "orbit") {
        state.enemyT += dt;

        if (state.enemyT >= 1) {
          state.enemyT = 0;
          const angDir =
            state.lastAng >= 0
              ? Math.random() <= 0.9
                ? 0.5
                : -0.5
              : Math.random() <= 0.9
                ? -0.5
                : 0.5;
          state.ang += angDir;
          state.lastAng = angDir;
        }

        const dist = 600;

        const targetX = mx + Math.cos(state.ang) * dist;
        const targetY = my + Math.sin(state.ang) * dist;

        const dx = targetX - state.enemyX;
        const dy = targetY - state.enemyY;

        const ease = 1;

        state.enemyX += dx * ease * dt;
        state.enemyY += dy * ease * dt;

        const px = state.enemyX - mx;
        const py = state.enemyY - my;

        const len = Math.sqrt(px * px + py * py) || 1;

        state.enemyX = mx + (px / len) * dist;
        state.enemyY = my + (py / len) * dist;
      }
      if (state.enemyMode === "fixed") {
        const dx = state.enemyFixed.x - state.enemyX;
        const dy = state.enemyFixed.y - state.enemyY;
      }
    }

    if (state.enemyTransition != "none") state.enemyTransitionT += dt;
    if (state.enemyTransition == "shrink") {
      const p = state.enemyTransitionT * 2;
      const eased = p * p;

      state.enemyScale = 1 - eased;

      if (p >= 1) {
        if (state.enemyMode === "fixed") {
          state.enemyX = state.enemyFixed.x;
          state.enemyY = state.enemyFixed.y;
        } else if (state.enemyMode === "orbit") {
          state.enemyX = mx + 600;
          state.enemyY = my;
        }
        state.enemyTransitionT = 0;
        state.enemyTransition = "grow";
      }
    } else if (state.enemyTransition == "grow") {
      const p = state.enemyTransitionT * 2;
      const eased = 1 - (1 - p) * (1 - p);

      state.enemyScale = eased;

      if (p >= 1) {
        state.enemyTransition = "none";
        state.enemyScale = 1;
      }
    }

    if (state.enemyTransition == "none" && !state.scream)
      state.currentPattern.update(dt);
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (state.enemyTransition == "none" && !state.scream)
      state.currentPattern.draw(ctx);

    if (celestialDevOnly) {
      for (const t of state.enemyTrail) {
        ctx.save();
        ctx.translate(t.x, t.y);

        const glowSize = 100;
        const glow = ctx.createRadialGradient(0, 0, t.r, 0, 0, t.r + glowSize);
        glow.addColorStop(0, "rgba(255,0,192,1)");
        glow.addColorStop(1, "rgba(255,0,192,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, t.r + glowSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, t.r, 0, Math.PI * 2);
        ctx.strokeStyle = "#ff00cc";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }
      for (const t of state.enemyTrail) {
        ctx.save();
        ctx.translate(t.x, t.y);

        ctx.beginPath();
        ctx.arc(0, 0, t.r, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();

        ctx.restore();
      }
    }

    if (state.enemyTransition == "none" && !state.scream)
      state.currentPattern.drawFront(ctx);

    if (state.scream) {
      const t = state.screamT;

      const baseR = 1000 * (0.75 + Math.random() * 0.25);

      ctx.save();
      ctx.translate(state.enemyX, state.enemyY);

      function randomBrightColor(alpha) {
        const r = Math.floor(Math.random() * 128) + 128;
        const g = Math.floor(Math.random() * 128);
        const b = Math.floor(Math.random() * 128) + 128;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      const grad = ctx.createRadialGradient(0, 0, baseR * 0.2, 0, 0, baseR);
      let point = 0;
      while (point <= 1) {
        grad.addColorStop(point, randomBrightColor(Math.random()));
        point += Math.random() * 0.1;
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, baseR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    if (celestialDevOnly) {
      ctx.save();
      ctx.translate(state.enemyX, state.enemyY);
      const size = 700 * state.enemyScale;
      ctx.drawImage(state.enemy, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    if (floatingText.active) {
      const p = floatingText.t / floatingText.duration;
      const cam = getCameraPos();

      ctx.save();

      const textWeight = 100;
      ctx.font = `${textWeight}px CelestialFont`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const baseX = cam.x + window.innerWidth / 2;
      const baseY = cam.y + window.innerHeight * 0.667;

      const text = floatingText.text;

      const totalWidth = ctx.measureText(text).width;
      let offsetX = -totalWidth / 2;

      const stretchPhase = Math.min(floatingText.t / 0.1, 1);
      const stretch = stretchPhase < 1 ? 1 + (1 - stretchPhase) * 12 : 1;

      const flickerStart = floatingText.duration - 0.25;
      if (floatingText.t >= flickerStart) {
        ctx.fillStyle = Math.random() > 0.5 ? "white" : "black";
      } else {
        ctx.fillStyle = "#ff0088";
      }

      for (let i = 0; i < 3; i++) {
        const w = 50 + Math.random() * (totalWidth * 0.5);
        const h = 20 + Math.random() * textWeight;

        const offsetX = (Math.random() - 0.5) * totalWidth * 0.5 - 10;
        const offsetY = (Math.random() - 0.5) * textWeight * 0.5;

        ctx.save();

        ctx.globalAlpha = 0.25 + Math.random() * 0.75;
        ctx.fillStyle =
          floatingText.t >= flickerStart
            ? Math.random() < 0.5
              ? "white"
              : "black"
            : "black";

        ctx.fillRect(baseX + offsetX - w / 2, baseY + offsetY - h / 2, w, h);

        ctx.restore();
      }
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        const t = floatingText.t * 2;

        const seed = i * 123.456;

        const wobbleX = Math.sin(t + seed) * 1;
        const wobbleY = Math.cos(t * 1.3 + seed) * 2;

        const rot = Math.sin(t + seed) * ((15 * Math.PI) / 180);
        const scale = 0.9 + (Math.sin(seed) * 0.5 + 0.5) * 0.1;

        ctx.save();

        ctx.translate(baseX + offsetX + wobbleX, baseY + wobbleY);

        ctx.rotate(rot);
        ctx.scale(scale * stretch, scale * 1.333);

        ctx.fillText(char, charWidth / 2, 0);

        ctx.restore();

        offsetX += charWidth;
      }

      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw, name: "Celestial" });
  return unregister;
}
