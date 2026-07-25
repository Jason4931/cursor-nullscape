import { death, mouse } from "../entityHost.js";
import { playSound, soundStopped, uldm } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Skinwalker.png";

export function setup(host, stack, hardMode) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    size: 50,

    initialized: false,
    whiteInit: false,

    delay: 0,
    delayTarget: 0,
    delayTimer: 0,

    history: [],
  };

  function pickDelay() {
    state.delayTarget = hardMode
      ? 0.1 + Math.random() + stack * 0.6
      : 0.7 + Math.random() + stack * 1.2;
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (!state.initialized) {
      state.x = mouse.x;
      state.y = mouse.y;
      pickDelay();
      state.delay = state.delayTarget;
      state.initialized = true;
      if (!soundStopped)
        playSound(
          "./ASSET/Sound/Enemies/Skinwalker/Skinwalker_-_OhNoSkinwalker_v2.ogg",
        );
    }

    state.history.push({
      x: mouse.x,
      y: mouse.y,
      t: performance.now(),
    });

    state.delayTimer += dt;
    if (state.delayTimer >= 1) {
      state.delayTimer = 0;
      pickDelay();
    }

    const followSpeed = 3;
    state.delay +=
      (state.delayTarget - state.delay) * (1 - Math.exp(-followSpeed * dt));

    const targetTime = performance.now() - state.delay * 1000;
    let target = null;

    for (let i = state.history.length - 1; i >= 0; i--) {
      if (state.history[i].t <= targetTime) {
        target = state.history[i];
        break;
      }
    }

    if (!target) return;

    let dx = target.x - state.x;
    let dy = target.y - state.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.001) {
      if (!state.whiteInit) state.whiteInit = true;
      dx /= dist;
      dy /= dist;

      const move = 10000 * dt;

      if (dist <= move) {
        state.x = target.x;
        state.y = target.y;
      } else {
        state.x += dx * move;
        state.y += dy * move;
      }
    }

    const cx = mouse.x - state.x;
    const cy = mouse.y - state.y;
    const cdist = Math.hypot(cx, cy);

    if (cdist <= state.size * 0.2) {
      death("Skinwalker");
      return;
    }

    const sounddist = Math.hypot(mouse.x - state.x, mouse.y - state.y);
    if (!soundStopped) {
      if (sounddist <= 500) {
        if (!state.sound)
          state.sound = playSound(
            `./ASSET/Sound/Enemies/Skinwalker/Skinwalker.ogg`,
            undefined,
            undefined,
            undefined,
            () => {
              state.sound = null;
            },
          );
      } else {
        if (state.sound) {
          state.sound();
          state.sound = null;
        }
      }
    } else {
      if (state.sound) {
        state.sound();
        state.sound = null;
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (!uldm) {
      if (!state.whiteInit) {
        const grad = ctx.createRadialGradient(
          Math.round(state.x),
          Math.round(state.y),
          0,
          Math.round(state.x),
          Math.round(state.y),
          state.size,
        );

        grad.addColorStop(0, "rgba(255,255,255,0.75)");
        grad.addColorStop(1, "rgba(255,255,255,0)");

        ctx.beginPath();
        ctx.arc(
          Math.round(state.x),
          Math.round(state.y),
          state.size,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = grad;
        ctx.fill();
      } else {
        const grad = ctx.createRadialGradient(
          Math.round(state.x),
          Math.round(state.y),
          0,
          Math.round(state.x),
          Math.round(state.y),
          state.size * 0.75,
        );

        grad.addColorStop(0, "rgba(255,255,255,0.1)");
        grad.addColorStop(1, "rgba(255,255,255,0)");

        ctx.beginPath();
        ctx.arc(
          Math.round(state.x),
          Math.round(state.y),
          state.size * 0.75,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }
    ctx.drawImage(
      enemy,
      Math.round(state.x - state.size / 2),
      Math.round(state.y - state.size / 2),
      Math.round(state.size),
      Math.round(state.size),
    );

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
