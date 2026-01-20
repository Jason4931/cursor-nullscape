import { death, mouse } from "../entityHost.js";
import { pondererPositions } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Ponderer.png";

export function setup(host) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    radius: 1200,

    timer: 8,
    maxTimer: 8,

    decayRate: 1,
    recoverRate: 0.9,

    agro: false,

    speed: 840,
    size: 150,

    wobbleTime: 0,
    wasNear: true,
  };

  const canvas = host.ctx.canvas;
  state.x = canvas.width * 0.5;
  state.y = canvas.height * 0.5;

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.wobbleTime += dt;

    const dx = mouse.x - state.x;
    const dy = mouse.y - state.y;
    const dist = Math.hypot(dx, dy);

    const near = dist <= state.radius;

    if (state.agro) {
      if (near) {
        state.timer += state.recoverRate * dt;
        if (state.timer >= 1) {
          state.timer = 1;
          state.agro = false;
        }
      }
    } else {
      if (near) state.timer += state.recoverRate * dt;
      else state.timer -= state.decayRate * dt;

      state.timer = Math.max(0, Math.min(state.maxTimer, state.timer));

      if (state.timer === 0) state.agro = true;
    }

    state.wasNear = near;

    if (state.agro && dist > 0.0001) {
      const nx = dx / dist;
      const ny = dy / dist;

      let moveX = nx * state.speed * dt;
      let moveY = ny * state.speed * dt;

      const REPULSION_RADIUS = 60;
      const REPULSION_STRENGTH = 120;

      for (const pos of pondererPositions) {
        if (pos === state.posRef) continue;
        const dx2 = state.x - pos.x;
        const dy2 = state.y - pos.y;
        const dist2 = Math.hypot(dx2, dy2);
        if (dist2 < REPULSION_RADIUS && dist2 > 0.0001) {
          moveX += (dx2 / dist2) * REPULSION_STRENGTH * dt;
          moveY += (dy2 / dist2) * REPULSION_STRENGTH * dt;
        }
      }

      state.x += moveX;
      state.y += moveY;

      if (dist < state.size * 0.15) {
        death("Ponderer");
      }
    }

    if (!state.posRef) {
      state.posRef = { x: state.x, y: state.y };
      pondererPositions.add(state.posRef);
    } else {
      state.posRef.x = state.x;
      state.posRef.y = state.y;
    }
  }

  function draw(ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const decreasing = !state.wasNear && !state.agro;
    const darken = decreasing || state.agro;

    const wobbleAmp = state.agro ? 1 : darken ? 0.6 : 0.3;

    const wobbleRot = Math.sin(state.wobbleTime * 6) * 0.04 * wobbleAmp;
    const wobbleX = Math.sin(state.wobbleTime * 8) * 6 * wobbleAmp;
    const wobbleY = Math.cos(state.wobbleTime * 7) * 6 * wobbleAmp;

    ctx.translate(Math.round(state.x + wobbleX), Math.round(state.y + wobbleY));
    ctx.rotate(wobbleRot);

    ctx.globalAlpha = state.opacity * (darken ? 0.7 : 1);

    const size = Math.round(state.size);
    ctx.drawImage(
      enemy,
      Math.round(-size * 0.5),
      Math.round(-size * 0.5),
      size,
      size,
    );

    ctx.restore();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#fff";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      state.timer.toFixed(2),
      Math.round(state.x - 5),
      Math.round(state.y),
    );

    ctx.restore();
  }

  return host.register({ update, draw });
}
