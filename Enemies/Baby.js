import { death, mouse } from "../entityHost.js";
import { playSound } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Baby.png";

export function setup(host, hardMode) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    size: 90,

    state: "idle",
    timer: 0,

    dirX: 0,
    dirY: 0,
    dirX2: 0,
    dirY2: 0,
    lineLength: 900,

    chargeTime: 0,
    chargeDuration: 0,
    startX: 0,
    startY: 0,

    chargeTime2: 0,
    chargeDuration2: 0,
    startX2: 0,
    startY2: 0,

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
      if (state.timer >= 1) {
        state.timer = 0;
        state.state = "indicator";
        playSound("./ASSET/Sound/Enemies/Baby/Baby_Alarm.ogg");

        const dx = mouse.x - state.x;
        const dy = mouse.y - state.y;
        const d = Math.hypot(dx, dy) || 1;

        state.dirX = dx / d;
        state.dirY = dy / d;
      }
    } else if (state.state === "indicator") {
      if (state.timer >= 1) {
        state.timer = 0;
        state.state = "charging";
        playSound("./ASSET/Sound/Enemies/Baby/Baby_Scream.ogg");

        state.startX = state.x;
        state.startY = state.y;

        state.chargeTime = 0;
        state.chargeDuration = hardMode ? 1 + Math.random() : 2 + Math.random();

        if (hardMode) {
          playSound("./ASSET/Sound/Enemies/Baby/Baby_Alarm.ogg");

          const Bx = state.startX + state.dirX * state.lineLength;
          const By = state.startY + state.dirY * state.lineLength;

          const dx2 = mouse.x - Bx;
          const dy2 = mouse.y - By;
          const d2 = Math.hypot(dx2, dy2) || 1;

          state.dirX2 = dx2 / d2;
          state.dirY2 = dy2 / d2;

          state.startX2 = Bx;
          state.startY2 = By;

          state.chargeTime2 = 0;
          state.chargeDuration2 = 1 + Math.random();
        }
      }
    } else if (state.state === "charging") {
      state.chargeTime += dt;

      let t = state.chargeTime / state.chargeDuration;
      if (t > 1) t = 1;

      const ease = 1 - Math.pow(1 - t, 3);

      state.x = state.startX + state.dirX * state.lineLength * ease;
      state.y = state.startY + state.dirY * state.lineLength * ease;

      const dx = mouse.x - state.x;
      const dy = mouse.y - state.y;

      if (Math.hypot(dx, dy) <= state.size * 0.25) {
        death("Baby");
        return;
      }

      if (t >= 1) {
        state.state = hardMode ? "charging2" : "idle";
        state.timer = 0;

        if (hardMode) {
          playSound("./ASSET/Sound/Enemies/Baby/Baby_Scream.ogg");

          state.startX2 = state.startX + state.dirX * state.lineLength;
          state.startY2 = state.startY + state.dirY * state.lineLength;

          state.chargeTime2 = 0;
          state.chargeDuration2 = 1 + Math.random();
        }
      }
    } else if (state.state === "charging2") {
      state.chargeTime2 += dt;

      let t = state.chargeTime2 / state.chargeDuration2;
      if (t > 1) t = 1;

      const ease = 1 - Math.pow(1 - t, 3);

      state.x = state.startX2 + state.dirX2 * state.lineLength * ease;
      state.y = state.startY2 + state.dirY2 * state.lineLength * ease;

      const dx = mouse.x - state.x;
      const dy = mouse.y - state.y;

      if (Math.hypot(dx, dy) <= state.size * 0.25) {
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

    if (
      state.state === "indicator" ||
      (hardMode && state.state === "charging")
    ) {
      const alpha = 1 - state.timer;
      ctx.fillStyle = `rgba(255,0,0,${alpha})`;

      const dashLength = 30;
      const gapLength = 20;
      const thickness = 4;

      const angle =
        hardMode && state.state === "charging"
          ? Math.atan2(state.dirY2, state.dirX2)
          : Math.atan2(state.dirY, state.dirX);

      let dist = 0;
      while (dist < state.lineLength) {
        const baseX =
          hardMode && state.state === "charging" ? state.startX2 : state.x;
        const baseY =
          hardMode && state.state === "charging" ? state.startY2 : state.y;

        const dirX =
          hardMode && state.state === "charging" ? state.dirX2 : state.dirX;
        const dirY =
          hardMode && state.state === "charging" ? state.dirY2 : state.dirY;

        const cx = Math.round(baseX + dirX * dist);
        const cy = Math.round(baseY + dirY * dist);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        ctx.fillRect(
          0,
          Math.round(-thickness / 2),
          Math.round(dashLength),
          Math.round(thickness),
        );

        ctx.restore();

        dist += dashLength + gapLength;
      }
    }

    const jitter =
      state.state === "charging" || state.state === "charging2"
        ? 2
        : state.state === "indicator"
          ? 1
          : 0.5;
    const rotJitter =
      state.state === "charging" || state.state === "charging2"
        ? 0.16
        : state.state === "indicator"
          ? 0.08
          : 0.04;

    const drawX = Math.round(state.x + (Math.random() - 0.5) * jitter * 2);
    const drawY = Math.round(state.y + (Math.random() - 0.5) * jitter * 2);
    const rot = (Math.random() - 0.5) * rotJitter * 2;

    ctx.save();
    ctx.translate(drawX, drawY);
    ctx.rotate(rot);
    ctx.drawImage(
      enemy,
      Math.round(-state.size / 2),
      Math.round(-state.size / 2),
      Math.round(state.size),
      Math.round(state.size),
    );

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
