import {
  death,
  mouse,
  attachMouseListener,
  toggleTripmineLeniency,
} from "../entityHost.js";
import { moveCamera, pickRandomPlaced4or5 } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Springer.png";

export function setup(host) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    size: 100,

    phase: "landing",
    timer: 0,
    leniencyTimer: null,

    landingDuration: 3,

    idleDuration: 5,
    idleGrowTime: 3,
    ringMaxRadius: 1000,

    exitDuration: 2,

    ringCenterX: 0,
    ringCenterY: 0,

    spriteScale: 1,
    spriteAlpha: 0,

    wasInsideRing: false,
  };

  attachMouseListener(host.canvas);

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function pickIdleDuration() {
    state.idleDuration = 4.5 + Math.random();
  }

  function applyTripmineLeniency(strength01) {
    const duration = Math.min(1, strength01); // seconds, capped at 1s

    toggleTripmineLeniency(true);

    if (state.leniencyTimer) {
      clearTimeout(state.leniencyTimer);
    }

    state.leniencyTimer = setTimeout(() => {
      toggleTripmineLeniency(false);
      state.leniencyTimer = null;
    }, duration * 1000);
  }

  function enterLanding() {
    const p = pickRandomPlaced4or5();
    state.ringCenterX = p.x;
    state.ringCenterY = p.y;

    state.timer = 0;
    state.spriteScale = 1.6;
    state.spriteAlpha = 0;
    state.phase = "landing";
    state.wasInsideRing = false;
  }

  enterLanding();

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.timer += dt;

    if (state.phase === "landing") {
      if (state.timer < 2) {
        state.spriteAlpha = 0;
      } else {
        const t = clamp((state.timer - 2) / 1, 0, 1);

        state.spriteAlpha = t;
        state.spriteScale = 1.6 - 0.6 * t;
      }

      if (state.timer >= state.landingDuration) {
        const cx = mouse.x - state.ringCenterX;
        const cy = mouse.y - state.ringCenterY;
        const dist = Math.hypot(cx, cy);

        if (dist <= state.size / 2) {
          death("Springer");
          return;
        }

        pickIdleDuration();
        state.timer = 0;
        state.phase = "idle";
        state.wasInsideRing = false;
      }
    } else if (state.phase === "idle") {
      const growT = clamp(state.timer / state.idleGrowTime, 0, 1);
      const ringRadius = state.ringMaxRadius * growT;

      const cx = mouse.x - state.ringCenterX;
      const cy = mouse.y - state.ringCenterY;
      const dist = Math.hypot(cx, cy);

      const thickness = 32;
      const insideRing =
        dist >= ringRadius - thickness / 2 &&
        dist <= ringRadius + thickness / 2;

      if (insideRing && !state.wasInsideRing) {
        const power01 = clamp(1 - growT, 0, 1); // stronger earlier
        const strength =
          Math.min(host.canvas.width, host.canvas.height) * 0.03 * power01;

        const nx = dist ? cx / dist : 0;
        const ny = dist ? cy / dist : 0;

        if (state.timer > 0.1) {
          moveCamera(-nx * strength, -ny * strength);
          applyTripmineLeniency(power01);
        }
      }

      state.wasInsideRing = insideRing;

      if (state.timer >= state.idleDuration) {
        state.timer = 0;
        state.phase = "exit";
      }
    } else if (state.phase === "exit") {
      const t = clamp(state.timer / state.exitDuration, 0, 1);

      state.spriteScale = 1 + 0.6 * t;
      state.spriteAlpha = 1 - t;

      if (state.timer >= state.exitDuration) {
        enterLanding();
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    if (state.phase === "landing") {
      const outerR = 28;
      const innerR = 18;

      ctx.fillStyle = "rgba(255,40,40,0.9)";
      ctx.beginPath();
      ctx.arc(state.ringCenterX, state.ringCenterY, outerR + 5, 0, Math.PI * 2);
      ctx.arc(
        state.ringCenterX,
        state.ringCenterY,
        innerR + 5,
        0,
        Math.PI * 2,
        true
      );
      ctx.fill("evenodd");

      const markW = 8;
      const markH = 28;
      const rot = state.timer * 1.5;

      ctx.save();
      ctx.translate(state.ringCenterX, state.ringCenterY);
      ctx.rotate(rot);
      ctx.fillStyle = "rgba(255,40,40,0.9)";

      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((Math.PI / 2) * i);
        ctx.fillRect(-markW / 2, -outerR - markH / 2, markW, markH);
        ctx.restore();
      }

      ctx.restore();
    }

    if (state.phase === "idle" && state.timer < state.idleGrowTime) {
      const growT = clamp(state.timer / state.idleGrowTime, 0, 1);
      const radius = state.ringMaxRadius * growT;
      const alpha = (1 - growT) * 0.6;

      const segments = 1000;
      const segLen = 36;
      const segWidth = 4;

      ctx.save();
      ctx.translate(state.ringCenterX, state.ringCenterY);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;

      for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.fillRect(-segLen / 2, -segWidth / 2, segLen, segWidth);
        ctx.restore();
      }

      ctx.restore();
    }

    if (state.spriteAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(state.spriteAlpha, 0, 1);

      const s = state.size * state.spriteScale;
      ctx.drawImage(
        enemy,
        state.ringCenterX - s / 2,
        state.ringCenterY -
          s / 2 -
          state.size / 3 -
          (state.phase === "landing"
            ? (3 - state.timer) * 20
            : state.phase === "exit"
            ? state.timer * 10
            : 0),
        s,
        s
      );

      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
