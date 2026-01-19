import { death, mouse } from "../entityHost.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Telefragger.png";

export function setup(host) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    size: 100,
    speed: 40,

    teleportTimer: 9 + Math.random(),
    teleportDistance: 600,

    prevMouseX: NaN,
    prevMouseY: NaN,

    dirX: 1,
    dirY: 0,

    facingAngle: 0,
    flipX: 1,

    flashTime: 0,
    flashDuration: 1,
    flashAngle: 0,

    ripplePhase: 0,
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (Number.isFinite(state.prevMouseX)) {
      const dxm = mouse.x - state.prevMouseX;
      const dym = mouse.y - state.prevMouseY;
      const len = Math.hypot(dxm, dym);

      if (len > 0.001) {
        state.dirX = dxm / len;
        state.dirY = dym / len;
      }
    }

    state.prevMouseX = mouse.x;
    state.prevMouseY = mouse.y;

    const dx = mouse.x - state.x;
    const dy = mouse.y - state.y;

    let angle = Math.atan2(dy, dx) + Math.PI;

    if (Math.cos(angle) > 0) {
      state.flipX = -1;
      angle += Math.PI;
    } else {
      state.flipX = 1;
    }

    state.facingAngle = angle;

    state.teleportTimer -= dt;
    if (state.teleportTimer <= 0) {
      state.x = mouse.x + state.dirX * state.teleportDistance;
      state.y = mouse.y + state.dirY * state.teleportDistance;

      state.teleportTimer = 9 + Math.random();

      state.flashTime = state.flashDuration;
      state.flashAngle = Math.random() * Math.PI * 2;
    }

    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      state.x += (dx / dist) * state.speed * dt;
      state.y += (dy / dist) * state.speed * dt;
    }

    if (state.flashTime > 0) {
      state.flashTime -= dt;
      state.flashAngle += dt * 4;
    }

    state.ripplePhase += dt * 3;

    if (dist < state.size * 0.25) {
      death("Telefragger");
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const trailRadius = Math.round(state.size * 0.6 + Math.sin(state.ripplePhase) * 6);
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#9fdfff";
    ctx.beginPath();
    ctx.arc(Math.round(state.x), Math.round(state.y), trailRadius, 0, Math.PI * 2);
    ctx.fill();

    if (state.flashTime > 0) {
      const t = state.flashTime / state.flashDuration;
      const alpha = t * t;

      ctx.translate(Math.round(state.x), Math.round(state.y));
      ctx.rotate(state.flashAngle);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-100, -3, 200, 6);

      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "#ffd200";
      ctx.fillRect(-100, -3, 200, 6);

      ctx.setTransform(1, 0, 0, 1, 0, 0);

      const rippleRadius = Math.round((1 - t) * 80 + 20);
      ctx.globalAlpha = alpha * 0.35;
      ctx.fillStyle = "#9fdfff";
      ctx.beginPath();
      ctx.arc(Math.round(state.x), Math.round(state.y), rippleRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = state.opacity;
    ctx.translate(Math.round(state.x), Math.round(state.y));
    ctx.rotate(state.facingAngle);
    ctx.scale(state.flipX, -1);

    const size = Math.round(state.size);
    ctx.drawImage(
      enemy,
      Math.round(-size / 2),
      Math.round(-size / 2),
      size,
      size
    );

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
