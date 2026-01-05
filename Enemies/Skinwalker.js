import { death, mouse, attachMouseListener } from "../entityHost.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Skinwalker.png";

export function setup(host, stack) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    size: 50,

    initialized: false,

    delay: 0,
    delayTarget: 0,
    delayTimer: 0,

    history: [],
    historyLimit: 20 * 60,
  };

  attachMouseListener(host.canvas);

  function pickDelay() {
    state.delayTarget = 2 + Math.random() + stack * 2.5;
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (!state.initialized) {
      state.x = mouse.x;
      state.y = mouse.y;
      pickDelay();
      state.delay = state.delayTarget;
      state.initialized = true;
    }

    state.history.push({
      x: mouse.x,
      y: mouse.y,
      t: performance.now(),
    });

    while (state.history.length > state.historyLimit) {
      state.history.shift();
    }

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

    if (cdist <= state.size * 0.45) {
      death("Skinwalker");
      return;
    }
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
