import { death, mouse, attachMouseListener } from "../entityHost.js";
import { isCursorOnFloor, setSorrowActive, moveCamera, TILE } from "../main.js";

export function setup(host) {
  const state = {
    time: 0,
    phase: 0,
    duration: 9 + Math.random(),
    opacity: 1,
    init: true,
    offFloorTime: 0,
    shakeX: 0,
    shakeY: 0,
  };

  const RAIN_COUNT = 40;
  const RAIN_RADIUS = 1000;

  attachMouseListener(host.canvas);

  function update(dt) {
    state.time += dt;

    if (state.init) {
      setSorrowActive(true);
      state.init = false;
    }

    if (state.phase === 0) {
      if (!isCursorOnFloor()) {
        state.offFloorTime += dt;
        if (state.offFloorTime >= 3) {
          death("Sorrow");
        }
      } else {
        state.offFloorTime = 0;
      }
    } else {
      state.offFloorTime = 0;
    }

    if (state.phase === 0) {
      if (state.time >= state.duration) {
        setSorrowActive(false);
        state.phase = 1;
        state.time = 0;
      }
    }

    else if (state.phase === 1) {
      if (state.time >= 10) {
        setSorrowActive(true);
        state.phase = 0;
        state.time = 0;
        state.duration = 9 + Math.random();
      }
    }

    moveCamera(-state.shakeX, -state.shakeY, true);

    if (state.phase === 0 && state.offFloorTime > 0) {
      const t = Math.min(state.offFloorTime / 3, 1);
      const strength = t * t * 24;

      state.shakeX = (Math.random() * 2 - 1) * strength;
      state.shakeY = (Math.random() * 2 - 1) * strength;
    } else {
      state.shakeX = 0;
      state.shakeY = 0;
    }

    moveCamera(state.shakeX, state.shakeY, true);
  }

  function draw(ctx) {
    if (state.phase !== 0) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    const t = 6;
    ctx.fillStyle = "rgba(255, 0, 0, 1)";

    for (let i = 0; i < RAIN_COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = TILE + Math.random() * (RAIN_RADIUS - TILE);

      const x = mouse.x + Math.cos(a) * r;
      const y =
        mouse.y +
        Math.sin(a) * r +
        ((t + i * 17) % 40);

      const h = 6 + Math.random() * 6;
      ctx.fillRect(x, y, 1.2, h);
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
