import { death, mouse, attachMouseListener } from "../entityHost.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Mart.png";

export function setup(host) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    size: 80,
    speed: 40,

    initialized: false,

    mode: "target",
    modeTimer: 0,

    randomDirX: 0,
    randomDirY: 0,

    wobbleTime: 0,
  };

  attachMouseListener(host.canvas);

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (!state.initialized) {
      const cx = host.canvas.width / 2;
      const cy = host.canvas.height / 2;

      const r = Math.random() * 400;
      const a = Math.random() * Math.PI * 2;

      state.x = cx + Math.cos(a) * r;
      state.y = cy + Math.sin(a) * r;

      state.initialized = true;
    }

    state.modeTimer += dt;
    state.wobbleTime += dt;

    if (state.mode === "target" && state.modeTimer >= 10) {
      state.modeTimer = 0;

      if (Math.random() < 0.333) {
        state.mode = "random";

        const a = Math.random() * Math.PI * 2;
        state.randomDirX = Math.cos(a);
        state.randomDirY = Math.sin(a);
      }
    }

    if (state.mode === "random" && state.modeTimer >= 10) {
      state.mode = "target";
      state.modeTimer = 0;
    }

    let dx = 0;
    let dy = 0;

    if (state.mode === "target") {
      dx = mouse.x - state.x;
      dy = mouse.y - state.y;

      const dist = Math.hypot(dx, dy);

      if (dist <= state.size * 0.5) {
        death("Mart", "#43aeff");
        return;
      }

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
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    ctx.drawImage(
      enemy,
      state.x - state.size / 2,
      state.y - state.size / 2,
      state.size,
      state.size
    );

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
