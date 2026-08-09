import { death, mouse } from "../entityHost.js";
import { despawnCatalyst, playSound } from "../main.js";

const enemy = new Image();
let _loaded = false;
function loadAssets() {
  if (_loaded) return;
  _loaded = true;
  enemy.src = "./ASSET/Enemies/CatalystHand.png";
}

export function setup(host) {
  loadAssets();
  const state = {
    phase: "circleGrow",

    lx: 0,
    ly: 0,

    timer: 0,

    radius: 0,
    maxRadius: 100,

    x: 0,
    y: 0,
    startY: 0,
    opacity: 0,
    idleTime: 0,

    didKillCheck: false,
  };

  const KILL_RADIUS = 120;

  function update(dt) {
    if (despawnCatalyst) return;
    if (!Number.isFinite(mouse.x)) return;

    state.timer += dt;

    if (state.phase === "circleGrow") {
      state.lx = mouse.x;
      state.ly = mouse.y;

      const t = Math.min(state.timer / 0.6, 1);
      const easeOut = 1 - Math.pow(1 - t, 3);

      state.radius = state.maxRadius * easeOut;

      if (state.timer >= 0.6) {
        state.timer = 0;
        state.phase = "circleShrink";
      }
      return;
    }

    if (state.phase === "circleShrink") {
      state.lx = mouse.x;
      state.ly = mouse.y;

      const t = Math.min(state.timer / 0.4, 1);
      const easeIn = t * t * t;

      state.radius = state.maxRadius * (1 - easeIn);

      if (state.timer >= 0.4) {
        state.timer = 0;
        state.phase = "spawn";
        playSound(
          "./ASSET/Sound/Enemies/Catalyst/CataTeleport.mp3",
          undefined,
          undefined,
          undefined,
          undefined,
          true,
        );
        setTimeout(() => {
          playSound(
            "./ASSET/Sound/Enemies/Catalyst/CataHandPop.mp3",
            undefined,
            undefined,
            undefined,
            undefined,
            true,
          );
        }, 500);

        state.x = state.lx;
        state.startY = state.ly - 120;
        state.y = state.startY;
        state.opacity = 0;
        state.didKillCheck = false;
      }
      return;
    }

    if (state.phase === "spawn") {
      const t = Math.min(state.timer / 0.4, 1);

      state.opacity = t;
      state.y = state.startY + 80 * t;

      if (state.timer >= 0.4) {
        if (!state.didKillCheck) {
          const dx = mouse.x - state.lx;
          const dy = mouse.y - state.ly;
          if (dx * dx + dy * dy <= KILL_RADIUS * KILL_RADIUS) {
            death("Catalyst", "#660000");
          }
          state.didKillCheck = true;
        }

        state.timer = 0;
        state.phase = "despawn";
      }
      return;
    }

    if (state.phase === "despawn") {
      const t = Math.min(state.timer / 0.5, 1);
      state.opacity = 1 - t;

      if (state.timer >= 0.5) {
        state.timer = 0;
        state.idleTime = 4.5 + Math.random();
        state.phase = "idle";
      }
      return;
    }

    if (state.phase === "idle") {
      if (state.timer >= state.idleTime) {
        state.timer = 0;
        state.phase = "circleGrow";
      }
    }
  }

  function draw(ctx) {
    if (despawnCatalyst) return;
    if (!Number.isFinite(mouse.x)) return;

    ctx.save();

    if (state.phase === "circleGrow" || state.phase === "circleShrink") {
      const g = ctx.createRadialGradient(
        Math.round(state.lx),
        Math.round(state.ly),
        0,
        Math.round(state.lx),
        Math.round(state.ly),
        Math.round(Math.max(0, state.radius)),
      );

      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.9)");

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(
        Math.round(state.lx),
        Math.round(state.ly),
        Math.round(Math.max(0, state.radius)),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    if (state.phase === "spawn" || state.phase === "despawn") {
      ctx.globalAlpha = state.opacity;
      ctx.drawImage(
        enemy,
        Math.round(state.x - 60),
        Math.round(state.y - 360),
        Math.round(120),
        Math.round(360),
      );
    }

    ctx.restore();
  }

  return host.register({ update, draw, name: "Catalyst" });
}
