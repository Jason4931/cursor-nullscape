import { death, mouse } from "../entityHost.js";
import { playSound } from "../main.js";

export function setup(host) {
  const state = {
    time: 0,
    phase: 0,
    waitTime: 0,
    opacity: 0.25,
    spikeOpacity: 0,
    circle2opacity: 0,
    circle2scale: 0,
    scale: 0,
    circles: [],
    minRadius: 480,
    maxRadius: 1000,
    outlineTime: 0.5,
    outlineScale: 0,
    flashTime: 0,
  };

  const CIRCLE_COUNT = 6;
  const BASE_RADIUS = 260;

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
    playSound("./ASSET/Sound/Enemies/VoidImplosions/VoidImplosion_Spawn.ogg");
    playSound("./ASSET/Sound/Enemies/VoidImplosions/VoidImplosion_Charge.ogg");
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

    state.outlineTime += dt;
    state.outlineScale += state.outlineTime * 5;
    if (
      state.outlineScale >=
        Math.max(BASE_RADIUS / 2, BASE_RADIUS * state.scale) ||
      state.phase == 1
    ) {
      state.outlineScale = 0;
    }

    if (state.flashTime >= 0) {
      state.flashTime += dt;
      if (state.flashTime > 0.5) {
        state.flashTime = -1;
      }
    }

    if (state.phase === 0) {
      let t;
      if (state.time < 1) {
        t = 0;
      } else {
        t = Math.min((state.time - 1) / 1, 1);
      }
      const ease = 1 - Math.pow(1 - t, 3);
      state.scale = ease;

      if (state.time < 1.75) {
        state.opacity += dt;
        if (state.opacity > 0.25) state.opacity = 0.25;
        state.spikeOpacity += dt * 4;
        if (state.spikeOpacity > 1) state.spikeOpacity = 1;
      } else {
        const ot = Math.min((state.time - 1.75) / 1, 1);
        state.opacity = 0.25 + 0.25 * ot;
        const ease = ot * ot;
        state.circle2opacity = ot;
        state.circle2scale = 1 - ease;
      }

      if (state.time >= 2.75) {
        state.phase = 1;
        state.time = 0;
        state.flashTime = 0;
        state.circle2scale = 0;
        state.circle2opacity = 0;
        checkDeathAtStrike();
        playSound(
          "./ASSET/Sound/Enemies/VoidImplosions/VoidImplosion_Explode.ogg",
        );
      }
    } else if (state.phase === 1) {
      const t = Math.min(state.time / 1, 1);
      state.scale = 1;
      state.opacity = 1 - t;
      state.spikeOpacity = 1 - t;
      if (t === 1) {
        state.phase = 2;
        state.time = 0;
        state.waitTime = 4.5 + Math.random();
      }
    } else if (state.phase === 2) {
      state.opacity = 0;
      state.spikeOpacity = 0;
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
    ctx.globalAlpha = state.opacity;

    for (const c of state.circles) {
      const r = Math.round(BASE_RADIUS * state.scale);
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.beginPath();
      ctx.arc(Math.round(c.x), Math.round(c.y), r, 0, Math.PI * 2);
      ctx.fill();
      const grad = ctx.createRadialGradient(
        Math.round(c.x),
        Math.round(c.y),
        Math.round(r * 0.1),
        Math.round(c.x),
        Math.round(c.y),
        r,
      );
      grad.addColorStop(0, "rgba(128, 0, 128, 0.25)");
      grad.addColorStop(0.95, "rgba(128, 0, 128, 0.5)");
      grad.addColorStop(1, "rgba(128, 0, 128, 1)");
      ctx.save();
      ctx.globalAlpha = Math.min(1, ctx.globalAlpha * 2);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(Math.round(c.x), Math.round(c.y), r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      const circle2r = Math.round(BASE_RADIUS * state.circle2scale);
      ctx.globalAlpha = state.circle2opacity;
      const circle2grad = ctx.createRadialGradient(
        Math.round(c.x),
        Math.round(c.y),
        Math.round(circle2r * 0.1),
        Math.round(c.x),
        Math.round(c.y),
        circle2r,
      );
      circle2grad.addColorStop(0, "rgba(128, 0, 128, 0.5)");
      circle2grad.addColorStop(1, "rgba(128, 0, 128, 1)");
      ctx.fillStyle = circle2grad;
      ctx.beginPath();
      ctx.arc(Math.round(c.x), Math.round(c.y), circle2r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(Math.round(c.x), Math.round(c.y));
      const spikes = state.phase == 1 ? 10 : 4 + ((Math.random() * 4) | 0);
      const innerR =
        state.phase == 1
          ? BASE_RADIUS * 0.05 * Math.max(0, 1 - state.time * 2)
          : BASE_RADIUS * 0.05;
      const outerR =
        state.phase == 1
          ? BASE_RADIUS * 0.05 * Math.max(0, 1 - state.time * 2)
          : BASE_RADIUS * (0.15 + Math.random() * 0.1);
      const rot = Math.random() * Math.PI * 2;
      ctx.globalAlpha = state.spikeOpacity;
      ctx.fillStyle = "black";
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const t = i / (spikes * 2);
        const ang = t * Math.PI * 2 + rot;

        const isOuter = i % 2 === 0;
        const rad = isOuter ? outerR : innerR;

        const x = Math.cos(ang) * rad;
        const y = Math.sin(ang) * rad;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(Math.round(c.x), Math.round(c.y));
      ctx.rotate(Math.random() * Math.PI * 2);
      ctx.fillStyle = "rgba(128, 0, 128, 0.5)";
      ctx.fillRect(-r, -2, r * 2, 1);
      ctx.restore();

      if (state.outlineScale > 0) {
        const outlineR = Math.round(state.outlineScale);
        const g = ctx.createRadialGradient(
          Math.round(c.x),
          Math.round(c.y),
          Math.round(outlineR * 0.1),
          Math.round(c.x),
          Math.round(c.y),
          outlineR,
        );
        g.addColorStop(0.94, "rgba(255,255,255,0)");
        g.addColorStop(0.95, "rgba(255,255,255,0.5)");
        g.addColorStop(1, "rgba(255,255,255,0.5)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(Math.round(c.x), Math.round(c.y), outlineR, 0, Math.PI * 2);
        ctx.fill();
      }

      if (state.flashTime >= 0) {
        ctx.save();
        const t = state.flashTime / 0.5;
        const flashR = Math.round(r * (1 + 0.16 * (1 - Math.pow(1 - t, 2))));
        ctx.globalAlpha = (1 - t) * 0.25 * state.opacity;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(Math.round(c.x), Math.round(c.y), flashR, 0, Math.PI * 2);
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
