import { death, mouse, attachMouseListener } from "../entityHost.js";
import { fleshPositions } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Flesh.png";

export function setup(host) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    size: 100,
    speed: 80,

    initialized: false,

    mode: "random",

    randomDirX: 0,
    randomDirY: 0,

    randomTimer: 0,
    randomDuration: 9 + Math.random(),
  };
  const pos = { x: 0, y: 0 };

  attachMouseListener(host.canvas);

  function pickRandomDir() {
    const a = Math.random() * Math.PI * 2;
    state.randomDirX = Math.cos(a);
    state.randomDirY = Math.sin(a);
    state.randomTimer = 0;
    state.randomDuration = 9 + Math.random();
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (!state.initialized) {
      const cx = host.canvas.width / 2;
      const cy = host.canvas.height / 2;

      const r = Math.random() * 400;
      const a = Math.random() * Math.PI * 2;

      pos.x = cx + Math.cos(a) * r;
      pos.y = cy + Math.sin(a) * r;
      state.x = pos.x;
      state.y = pos.y;

      fleshPositions.add(pos);

      pickRandomDir();
      state.initialized = true;
    }

    const mx = mouse.x - state.x;
    const my = mouse.y - state.y;
    const dist = Math.hypot(mx, my);

    const aggroRadius = 1000;

    // MODE SWITCHING
    if (dist <= aggroRadius) {
      state.mode = "target";
    } else {
      if (state.mode !== "random") {
        pickRandomDir();
      }
      state.mode = "random";
    }

    let dx = 0;
    let dy = 0;

    if (state.mode === "target") {
      if (dist <= state.size * 0.5) {
        death("Flesh");
        return;
      }

      if (dist > 0.001) {
        dx = mx / dist;
        dy = my / dist;
      }
    } else {
      state.randomTimer += dt;

      if (state.randomTimer >= state.randomDuration) {
        pickRandomDir();
      }

      dx = state.randomDirX;
      dy = state.randomDirY;
    }

    state.x += dx * state.speed * dt;
    state.y += dy * state.speed * dt;
    pos.x = state.x;
    pos.y = state.y;
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
