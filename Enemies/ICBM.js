import { death, mouse } from "../entityHost.js";
import { ESP, getCameraPos, playSound, uldm } from "../main.js";

const ICBM = [];
for (let i = 1; i <= 7; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/ICBM/Layer ${i}.png`;
  ICBM.push(img);
}
const marker = new Image();
marker.src = "./ASSET/Misc/ICBMMarker.png";
const nuclearMarker = new Image();
nuclearMarker.src = "./ASSET/Misc/NuclearBombMarker.png";
const explode = new Image();
explode.src = "./ASSET/Misc/Explode.png";

export let nuclearBombActive = [false];
export function setup(host, hardMode) {
  const state = {
    opacity: 0,
    explodeOpacity: 0,
    x: 0,
    y: 0,
    size: 125,
    currentSize: 100,
    circleRadius: 40,
    nuclearRadius: 0,
    maxCircleRadius: 210,
    rotation: 90,
    startY: 0,

    layers: ICBM,
    enemy: null,
    layer: 0,

    phase: "lock",
    timer: 0,
    lockDuration: 3,
    deployDuration: 1.5,
    idleDuration: 9 + Math.random(),

    lockPosX: 0,
    lockPosY: 0,
    markerRotation: 0,

    initialized: false,

    icbmstrikeSound: false,

    prevMouseX: 0,
    prevMouseY: 0,
    velocityX: 0,
    velocityY: 0,
  };

  const easeIn = (t) => t * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 2);

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (nuclearBombActive[0])
      state.nuclearRadius = Math.max(window.innerWidth, window.innerHeight);

    state.layer++;
    if (state.layer > state.layers.length) state.layer = 1;
    state.enemy = state.layers[state.layer - 1];

    if (!state.initialized) {
      state.x = host.canvas.width / 2;
      state.y = host.canvas.height / 2;
      state.prevMouseX = mouse.x;
      state.prevMouseY = mouse.y;
      state.initialized = true;
    }

    state.velocityX = (mouse.x - state.prevMouseX) / dt;
    state.velocityY = (mouse.y - state.prevMouseY) / dt;

    state.prevMouseX = mouse.x;
    state.prevMouseY = mouse.y;

    state.timer += dt;

    if (state.phase === "lock") {
      state.markerRotation -= dt * 4;
      if (hardMode && state.timer >= 0.1) {
        const predictionMultiplier = 1;
        const predictedX = mouse.x + state.velocityX * predictionMultiplier;
        const predictedY = mouse.y + state.velocityY * predictionMultiplier;

        const easeFactor = 0.12;

        state.lockPosX += (predictedX - state.lockPosX) * easeFactor;
        state.lockPosY += (predictedY - state.lockPosY) * easeFactor;
      } else {
        state.lockPosX = mouse.x;
        state.lockPosY = mouse.y;
      }

      const t = Math.min(state.timer, 1);
      state.circleRadius = 80 - easeOut(t) * (80 - 40);
      state.circleOpacity = easeOut(t) * 0.75;
      state.opacity = 0;
      state.currentSize = state.size * 2;

      if (state.timer >= 0.2 && state.timer <= 0.3 && !state.icbmstrikeSound) {
        playSound("./ASSET/Sound/Enemies/ICBM/ICBMStrike.mp3");
        state.icbmstrikeSound = true;
      }

      if (state.timer >= state.lockDuration) {
        const fullTurn = Math.PI * 2;
        state.markerRotation =
          Math.ceil(state.markerRotation / fullTurn) * fullTurn;
        state.timer = 0;
        state.phase = "deploy";
        if (nuclearBombActive[0])
          playSound(
            "./ASSET/Sound/Enemies/ICBM/ICBM_BiggerBlast_Explosion.ogg",
          );
        state.icbmstrikeSound = false;
        state.startY = state.lockPosY - 125;
        state.y = state.startY;
      }
    } else if (state.phase === "deploy") {
      state.x = state.lockPosX;
      state.y = state.lockPosY;

      if (state.timer <= 1) {
        const ct = easeOut(state.timer / 1);
        state.circleRadius = 40 + (state.maxCircleRadius - 40) * ct;
      } else {
        state.circleRadius = state.maxCircleRadius;
      }

      state.circleOpacity = 0.75;

      const delay = 0.5;
      const missileTime = Math.max(state.timer - delay, 0);
      const effectiveDuration = state.deployDuration - delay;
      const missileT = Math.min(missileTime / effectiveDuration, 1);

      const t = Math.min(missileTime / effectiveDuration, 1);
      state.y = state.startY + (state.lockPosY - state.startY) * easeIn(t);
      state.opacity = easeIn(missileT);
      state.currentSize = state.size * (2 - easeIn(missileT));
      state.rotation = -90 * (1 - easeOut(missileT));

      if (state.timer >= state.deployDuration) {
        const dx = mouse.x - state.lockPosX;
        const dy = mouse.y - state.lockPosY;
        const dist = Math.hypot(dx, dy);
        if (
          dist <=
          (nuclearBombActive[0] ? state.nuclearRadius : state.circleRadius)
        ) {
          death("ICBM");
        }
        state.timer = 0;
        state.phase = "idle";
        state.idleDuration = (nuclearBombActive[0] ? 10 : 9) + Math.random();
      }
    } else if (state.phase === "idle") {
      const fadeT = Math.min(state.timer * 4, 1);
      state.opacity = 1 - fadeT;
      state.explodeOpacity = 1 - Math.min(state.timer * 2, 1);
      state.circleOpacity = 0.75 - (fadeT * 3) / 4;

      if (state.timer >= state.idleDuration) {
        state.timer = 0;
        state.phase = "lock";
        state.opacity = 0;
        state.explodeOpacity = 0;
        state.circleOpacity = 0;
        state.currentSize = state.size * 2;
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();

    if (
      (state.phase === "lock" ||
        state.phase === "deploy" ||
        state.phase === "idle") &&
      state.circleOpacity >= 0
    ) {
      ctx.save();
      ctx.globalAlpha = state.circleOpacity;

      ctx.translate(Math.round(state.lockPosX), Math.round(state.lockPosY));

      ctx.rotate(state.markerRotation);

      const size = Math.round(state.circleRadius * 2);
      if (state.phase === "idle" && state.timer <= 3)
        ESP(state.lockPosX, state.lockPosY, state.maxCircleRadius, "icbm");
      ctx.drawImage(marker, -size / 2, -size / 2, size, size);

      if (state.nuclearRadius > 0 && nuclearBombActive[0]) {
        ctx.globalAlpha *= 0.1;
        ctx.rotate(-state.timer * Math.PI * 2);
        const nuclearSize = Math.round(state.nuclearRadius * 2);
        ctx.drawImage(
          nuclearMarker,
          -nuclearSize / 2,
          -nuclearSize / 2,
          nuclearSize,
          nuclearSize,
        );
      }

      ctx.restore();
    }

    if (state.phase === "deploy" || state.phase === "idle") {
      ctx.save();
      ctx.globalAlpha = state.opacity;
      ctx.translate(Math.round(state.x), Math.round(state.y));
      ctx.rotate((state.rotation * Math.PI) / 180);
      const s = Math.round(state.currentSize);
      ctx.drawImage(state.enemy, -Math.round(s / 2), -Math.round(s / 2), s, s);
      ctx.restore();

      if (!uldm) {
        ctx.save();
        ctx.globalAlpha = state.explodeOpacity;
        ctx.translate(Math.round(state.x), Math.round(state.y));
        ctx.scale(1 - state.timer, 1 - state.timer);
        ctx.drawImage(
          explode,
          -Math.round(s * 1.5),
          -Math.round(s * 1.5),
          s * 3,
          s * 3,
        );
        ctx.restore();
      }
    }

    if (
      nuclearBombActive[0] &&
      state.phase === "idle" &&
      state.idleDuration > 10 &&
      !uldm
    ) {
      ctx.save();
      ctx.globalAlpha = 0.5 * Math.max(0, Math.min(1, 8 - state.timer * 2));
      const cam = getCameraPos();
      ctx.fillStyle =
        state.timer < 0.1 ? (Math.random() < 0.5 ? "green" : "blue") : "red";
      ctx.fillRect(
        Math.round(cam.x),
        Math.round(cam.y),
        Math.round(window.innerWidth),
        Math.round(window.innerHeight),
      );
      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
