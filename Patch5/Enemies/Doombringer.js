import { death, mouse } from "../entityHost.js";
import { playSound, jumppadHit } from "../main.js";

export function setup(host) {
  const state = {
    phase: "idle",
    timer: 0,
    delay: 0,
    opacity: 0,
    sound: null,
    deathsound: false,
  };

  const WARNING_TIME = 10;

  function resetDelay() {
    state.phase = "idle";
    state.timer = 0;
    state.delay = 14 + Math.random();
  }
  resetDelay();

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.timer += dt;

    if (state.phase === "idle") {
      if (state.timer >= state.delay) {
        state.phase = "warning";
        state.sound = playSound(
          "./ASSET/Sound/Enemies/Doombringer/Joey's_scream.ogg",
          0.625,
          undefined,
          undefined,
          undefined,
          "400",
        );
        state.timer = 0;
        state.opacity = 0;
      }
      return;
    }

    if (state.phase === "warning") {
      state.opacity = Math.min(1, state.timer / WARNING_TIME);

      if (jumppadHit("get")) {
        if (state.sound) state.sound();
        state.opacity = 0;
        resetDelay();
        return;
      }

      if (state.timer >= WARNING_TIME) {
        death("Doombringer");
        if (!state.deathsound) {
          playSound(
            "./ASSET/Sound/Enemies/Doombringer/DoombringerExplosion.ogg",
          );
          state.deathsound = true;
        }
      }
      return;
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();

    if (state.phase === "warning") {
      const blink = (Math.floor(performance.now() / 100) & 1) === 0;
      const color = blink ? "255,255,255" : "255,0,0";

      const g = ctx.createRadialGradient(
        Math.round(mouse.x),
        Math.round(mouse.y),
        0,
        Math.round(mouse.x),
        Math.round(mouse.y),
        140,
      );

      g.addColorStop(0, `rgba(${color},${state.opacity})`);
      g.addColorStop(1, "rgba(0,0,0,0)");

      ctx.globalAlpha = state.opacity;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(Math.round(mouse.x), Math.round(mouse.y), 140, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
