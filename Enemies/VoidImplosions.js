import { death, mouse, attachMouseListener } from "../entityHost.js";

export function setup(host) {
  const state = {
    time: 0,
    phase: 0,
    waitTime: 0,
    opacity: 0.25,
    scale: 0,
    circles: [],
    minRadius: 480,
    maxRadius: 1000,
    outlineTime: 0.5,
    outlineScale: 1,
    flashTime: 0,
  };

  const CIRCLE_COUNT = 4;
  const BASE_RADIUS = 210;

  attachMouseListener(host.canvas);

  function respawnCircles() {
    state.circles.length = 0;
    for (let i = 0; i < CIRCLE_COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const r =
        state.minRadius + Math.random() * (state.maxRadius - state.minRadius);
      state.circles.push({
        x: mouse.x + Math.cos(a) * r,
        y: mouse.y + Math.sin(a) * r,
      });
    }
  }

  function checkDeathAtStrike() {
    const r = BASE_RADIUS * state.scale;
    const r2 = r * r;

    for (const c of state.circles) {
      const dx = mouse.x - c.x;
      const dy = mouse.y - c.y;
      if (dx * dx + dy * dy <= r2) {
        death("VoidImplosions", "#800080");
        return;
      }
    }
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.time += dt;

    // accelerating shrink outline
    state.outlineTime += dt;
    state.outlineScale -= state.outlineTime * 4.545;
    if (state.outlineScale <= 0) {
      state.outlineScale = BASE_RADIUS * state.scale;
    }

    if (state.flashTime >= 0) {
      state.flashTime += dt;
      if (state.flashTime > 0.5) {
        state.flashTime = -1;
      }
    }

    // PHASE 0: grow 0–3s
    // 0–2s: grow only
    // 2–3s: grow + opacity up
    if (state.phase === 0) {
      const t = Math.min(state.time / 3, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      state.scale = ease;

      if (state.time < 2) {
        state.opacity = 0.25;
      } else {
        const ot = Math.min((state.time - 2) / 1, 1);
        state.opacity = 0.25 + 0.25 * ot;
      }

      if (t === 1) {
        state.phase = 1;
        state.time = 0;
        state.flashTime = 0;
        checkDeathAtStrike();
      }
    }

    // PHASE 1: instant 100%, then fade out (1s)
    else if (state.phase === 1) {
      const t = Math.min(state.time / 1, 1);
      state.scale = 1;
      state.opacity = 1 - t;
      if (t === 1) {
        state.phase = 2;
        state.time = 0;
        state.waitTime = 4.5 + Math.random();
      }
    }

    // PHASE 2: wait
    else if (state.phase === 2) {
      state.opacity = 0;
      if (state.time >= state.waitTime) {
        state.phase = 0;
        state.time = 0;
        state.scale = 0;
        state.outlineTime = 0.5;
        respawnCircles();
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (!state.circles.length) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    for (const c of state.circles) {
      const r = BASE_RADIUS * state.scale;

      const grad = ctx.createRadialGradient(c.x, c.y, r * 0.1, c.x, c.y, r);
      grad.addColorStop(0, "rgba(128, 80, 128, 0.5)");
      grad.addColorStop(1, "rgba(128, 0, 128, 1)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(Math.random() * Math.PI * 2);
      ctx.fillStyle = "rgba(128, 0, 128, 1)";
      ctx.fillRect(-r, -2, r * 2, 1);
      ctx.restore();

      if (state.outlineScale > 0) {
        const outlineR = Math.min(state.outlineScale, r);
        const g = ctx.createRadialGradient(
          c.x,
          c.y,
          outlineR * 0.1,
          c.x,
          c.y,
          outlineR
        );
        g.addColorStop(0.95, "rgba(255,255,255,0)");
        g.addColorStop(1, "rgba(255,255,255,0.5)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, outlineR, 0, Math.PI * 2);
        ctx.fill();
      }

      if (state.flashTime >= 0) {
        ctx.save();
        const t = state.flashTime / 0.5;
        const flashR = r * (1 + 0.16 * (1 - Math.pow(1 - t, 2)));
        ctx.globalAlpha = (1 - t) * 0.25 * state.opacity;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(c.x, c.y, flashR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  respawnCircles();
  const unregister = host.register({ update, draw });
  return unregister;
}
