import { death, mouse } from "../entityHost.js";
import { playSound, soundStopped, MartStack } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Mart.png";

export function setup(host, hardMode, stack = 1, position = null) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    size: (0.6 + stack * 0.4) * 75,
    speed: (0.6 + stack * 0.4) * (hardMode ? 80 : 40),
    _stack: stack,

    initialized: false,

    mode: "target",
    modeTimer: 0,

    randomDirX: 0,
    randomDirY: 0,

    sound: null,
    wobbleTime: 0,
    ovalRotation: 0,
    _targetDuration: 9 + Math.random(),
  };

  const entry = { state, unregister: null };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (!state.initialized) {
      if (position) {
        state.x = position.x;
        state.y = position.y;
      } else {
        const cx = host.canvas.width / 2;
        const cy = host.canvas.height / 2;

        const r = Math.random() * 400;
        const a = Math.random() * Math.PI * 2;

        state.x = cx + Math.cos(a) * r;
        state.y = cy + Math.sin(a) * r;
      }
      state.initialized = true;
    }

    if (stack >= 6) {
      state.ovalRotation += dt * 2;
    }
    state.modeTimer += dt;
    state.wobbleTime += dt;

    if (state.mode === "target" && state.modeTimer >= state._targetDuration) {
      state.modeTimer = 0;

      if (Math.random() < 0.333) {
        state.mode = "random";

        const a = Math.random() * Math.PI * 2;
        state.randomDirX = Math.cos(a);
        state.randomDirY = Math.sin(a);
      }
      state._targetDuration = 9 + Math.random();
    }

    if (state.mode === "random" && state.modeTimer >= 10) {
      state.mode = "target";
      state.modeTimer = 0;
    }

    let dx = 0;
    let dy = 0;

    dx = mouse.x - state.x;
    dy = mouse.y - state.y;

    const dist = Math.hypot(dx, dy);

    if (dist <= state.size * 0.5) {
      death("Mart", "#43aeff");
      return;
    }

    if (state.mode === "target") {
      if (dist > 0.001) {
        dx /= dist;
        dy /= dist;
      } else {
        dx = dy = 0;
      }
    } else {
      dx = state.randomDirX;
      dy = state.randomDirY;
    }

    const wobble = Math.sin(state.wobbleTime * 3) * 0.3;
    const wx = -dy * wobble;
    const wy = dx * wobble;

    state.x += (dx + wx) * state.speed * dt;
    state.y += (dy + wy) * state.speed * dt;

    if (!soundStopped) {
      if (dist <= 500 * (0.6 + stack * 0.4)) {
        if (!state.sound)
          state.sound = playSound(
            `./ASSET/Sound/Enemies/Mart/Mart_Ambience.ogg`,
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

    if (stack >= 6) {
      ctx.save();

      ctx.translate(Math.round(state.x), Math.round(state.y));

      ctx.rotate(state.ovalRotation);

      const w = state.size * 0.8;
      const h = state.size;

      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);

      ctx.strokeStyle = "rgba(67,174,255,0.8)";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();
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
  entry.unregister = unregister;

  const list = MartStack("get");
  list.push(entry);
  MartStack("set", list);

  return () => {
    const list = MartStack("get").filter((e) => e !== entry);
    MartStack("set", list);
    unregister();
  };
}
