import { death, mouse } from "../entityHost.js";
import { playSound } from "../main.js";

const missile = new Image();
missile.src = "./ASSET/Enemies/ICBM.png";
const explode = new Image();
explode.src = "./ASSET/Misc/Explode.png";

export function setup(host, hardMode) {
  const state = {
    opacity: 0,
    explodeOpacity: 0,
    x: 0,
    y: 0,
    size: 100,
    currentSize: 100,
    circleRadius: 40,
    maxCircleRadius: 210,
    rotation: 90,
    startY: 0,

    phase: "lock",
    timer: 0,
    lockDuration: 3,
    deployDuration: 1.5,
    idleDuration: 9 + Math.random(),

    lockPosX: 0,
    lockPosY: 0,

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
        state.timer = 0;
        state.phase = "deploy";
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
      state.rotation = -15 + -90 * (1 - easeOut(missileT));

      if (state.timer >= state.deployDuration) {
        const dx = mouse.x - state.lockPosX;
        const dy = mouse.y - state.lockPosY;
        const dist = Math.hypot(dx, dy);
        if (dist <= state.circleRadius) {
          death("ICBM");
        }
        state.timer = 0;
        state.phase = "idle";
        state.idleDuration = 9 + Math.random();
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
      const grad = ctx.createRadialGradient(
        Math.round(state.lockPosX),
        Math.round(state.lockPosY),
        0,
        Math.round(state.lockPosX),
        Math.round(state.lockPosY),
        Math.round(state.circleRadius),
      );
      grad.addColorStop(
        0,
        state.phase === "idle"
          ? `rgba(255,0,0,${state.circleOpacity})`
          : `rgba(255,0,0,0)`,
      );
      grad.addColorStop(1, `rgba(255,0,0,${state.circleOpacity})`);
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.arc(
        Math.round(state.lockPosX),
        Math.round(state.lockPosY),
        Math.round(state.circleRadius),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    if (state.phase === "deploy" || state.phase === "idle") {
      ctx.save();
      ctx.globalAlpha = state.opacity;
      ctx.translate(Math.round(state.x), Math.round(state.y));
      ctx.rotate((state.rotation * Math.PI) / 180);
      const s = Math.round(state.currentSize);
      ctx.drawImage(missile, -Math.round(s / 2), -Math.round(s / 2), s, s);
      ctx.restore();

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

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
