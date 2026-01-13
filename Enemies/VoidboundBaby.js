import { death, mouse } from "../entityHost.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/VoidboundBaby.png";

export function setup(host) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    size: 90,

    state: "idle",
    timer: 0,

    dirX: 0,
    dirY: 0,
    lineLength: 1125,

    chargeTime: 0,
    chargeDuration: 0,
    startX: 0,
    startY: 0,

    initialized: false,
  };

  function randomSpawn() {
    const cx = host.canvas.width / 2;
    const cy = host.canvas.height / 2;

    const radius = Math.min(cx, cy) * 0.4;
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;

    state.x = cx + Math.cos(a) * r;
    state.y = cy + Math.sin(a) * r;
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (!state.initialized) {
      randomSpawn();
      state.initialized = true;
    }

    state.timer += dt;

    if (state.state === "idle") {
      if (state.timer >= 0.5) {
        state.timer = 0;
        state.state = "indicator";

        const dx = mouse.x - state.x;
        const dy = mouse.y - state.y;
        const d = Math.hypot(dx, dy) || 1;

        state.dirX = dx / d;
        state.dirY = dy / d;
      }
    } else if (state.state === "indicator") {
      if (state.timer >= 0.5) {
        state.timer = 0;
        state.state = "charging";

        state.startX = state.x;
        state.startY = state.y;

        state.chargeTime = 0;
        state.chargeDuration = 0.5 + Math.random();
      }
    } else if (state.state === "charging") {
      state.chargeTime += dt;

      let t = state.chargeTime / state.chargeDuration;
      if (t > 1) t = 1;

      const k = 0.3;
      const easedT = t * (1 - k) + t * t * k;

      state.x = state.startX + state.dirX * state.lineLength * easedT;
      state.y = state.startY + state.dirY * state.lineLength * easedT;

      const dx = mouse.x - state.x;
      const dy = mouse.y - state.y;

      if (Math.hypot(dx, dy) <= state.size * 0.5) {
        death("Baby");
        return;
      }

      if (t >= 1) {
        state.state = "idle";
        state.timer = 0;
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    if (state.state === "indicator") {
      const alpha = 0.5 - state.timer;
      ctx.fillStyle = `rgba(255,0,255,${alpha})`;

      const dashLength = 30;
      const gapLength = 20;
      const thickness = 4;

      const angle = Math.atan2(state.dirY, state.dirX);

      let dist = 0;
      while (dist < state.lineLength) {
        const cx = Math.round(state.x + state.dirX * dist);
        const cy = Math.round(state.y + state.dirY * dist);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        ctx.fillRect(0, Math.round(-thickness / 2), Math.round(dashLength), Math.round(thickness));

        ctx.restore();

        dist += dashLength + gapLength;
      }
    }

    const jitter = state.state === "charging" ? 4 : state.state === "indicator" ? 2 : 1;
    const rotJitter = state.state === "charging" ? 0.32 : state.state === "indicator" ? 0.16 : 0.08;

    const drawX = Math.round(state.x + (Math.random() - 0.5) * jitter * 2);
    const drawY = Math.round(state.y + (Math.random() - 0.5) * jitter * 2);
    const rot = (Math.random() - 0.5) * rotJitter * 2;

    ctx.save();
    ctx.translate(drawX, drawY);
    ctx.rotate(rot);
    const size = Math.round(state.size);
    ctx.drawImage(enemy, Math.round(-size / 2), Math.round(-size / 2), size, size);

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
