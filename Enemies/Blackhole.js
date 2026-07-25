import { death, mouse } from "../entityHost.js";
import { moveCamera, uldm } from "../main.js";

export function setup(host, casualMode, hardMode) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    radius: 200,
    rotation: 0,

    phase: "grow",
    timer: 0,
    life: 9 + Math.random(),

    scale: 0,
    lineTimer: [0, 0.25, 0.5, 0.75],
    lineDuration: 1,
  };

  relocate();

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    for (let i = 0; i < 4; i++) {
      state.lineTimer[i] += dt;
      if (state.lineTimer[i] >= state.lineDuration) {
        state.lineTimer[i] -= state.lineDuration;
      }
    }
    state.timer += dt;
    state.rotation += dt;

    switch (state.phase) {
      case "grow":
        state.scale = 1 - Math.pow(1 - Math.min(state.timer, 1), 3);

        if (state.timer >= 1) {
          state.phase = "idle";
          state.timer = 0;
          state.life = 9 + Math.random();
          state.scale = 1;
        }
        break;

      case "idle":
        if (state.timer >= state.life) {
          state.phase = "shrink";
          state.timer = 0;
        }
        break;

      case "shrink":
        state.scale = 1 - Math.pow(Math.min(state.timer, 1), 3);

        if (state.timer >= 1) {
          relocate();
          state.phase = "grow";
          state.timer = 0;
          state.scale = 0;
        }
        break;
    }

    const dx = state.x - mouse.x;
    const dy = state.y - mouse.y;
    const dist = Math.hypot(dx, dy);

    const range = 2000;

    if (dist < range) {
      const strength =
        Math.pow(1 - dist / range, 2) *
        10 *
        (hardMode ? 2 : casualMode ? 0.5 : 1);

      moveCamera(-(dx / dist) * strength, -(dy / dist) * strength);
    }

    const dxMouse = mouse.x - state.x;
    const dyMouse = mouse.y - state.y;
    if (Math.hypot(dxMouse, dyMouse) <= state.radius * state.scale) {
      death("Blackhole");
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    ctx.translate(state.x, state.y);
    ctx.scale(state.scale, state.scale);

    for (let i = 0; i < 4; i++) {
      const t = state.lineTimer[i] / state.lineDuration;
      const r = Math.max(0, 2000 * (1 - t * t));
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${1 - r / 2000})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.save();
    ctx.rotate(state.rotation);
    ctx.scale(2, 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, state.radius, 0, Math.PI * 2);
    ctx.lineWidth = state.radius * 0.2;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.restore();

    if (!uldm) {
      const glow = ctx.createRadialGradient(
        0,
        0,
        state.radius,
        0,
        0,
        state.radius * 1.5,
      );
      glow.addColorStop(0, "rgba(255,255,255,0.5)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.arc(0, 0, state.radius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, state.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.lineWidth = state.radius * 0.1;
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, state.radius * 0.82, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(70,70,70,0.5)";
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.restore();
  }

  function relocate() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 2000;

    state.x = mouse.x + Math.cos(angle) * distance;
    state.y = mouse.y + Math.sin(angle) * distance;
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
