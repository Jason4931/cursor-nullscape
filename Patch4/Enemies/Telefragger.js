import { death, mouse } from "../entityHost.js";
import { canvas, ESP, playSound, uldm } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Telefragger.png";

export function setup(host, hardMode, deafMode) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    size: 100,
    speed: hardMode ? 80 : 40,

    teleportTimer: 1,
    teleportDistance: 450,

    prevMouseX: NaN,
    prevMouseY: NaN,

    predDirX: 1,
    predDirY: 0,

    facingAngle: 0,
    flipX: 1,

    flashTime: 0,
    flashDuration: 1,
    flashAngle: 0,

    ripplePhase: 0,

    teleportSound: false,
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (Number.isFinite(state.prevMouseX)) {
      const dxm = mouse.x - state.prevMouseX;
      const dym = mouse.y - state.prevMouseY;
      const len = Math.hypot(dxm, dym);

      if (len > 0.001) {
        const tx = dxm / len;
        const ty = dym / len;

        const turnSpeed = 4;
        state.predDirX += (tx - state.predDirX) * Math.min(1, dt * turnSpeed);
        state.predDirY += (ty - state.predDirY) * Math.min(1, dt * turnSpeed);

        const d = Math.hypot(state.predDirX, state.predDirY) || 1;
        state.predDirX /= d;
        state.predDirY /= d;
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
      state.x = mouse.x + state.predDirX * state.teleportDistance;
      state.y = mouse.y + state.predDirY * state.teleportDistance;

      state.teleportTimer = hardMode ? 4 + Math.random() : 9 + Math.random();

      state.flashTime = state.flashDuration;
      state.flashAngle = Math.random() * Math.PI * 2;
      state.teleportSound = false;
    }
    if (
      state.teleportTimer >= 0.9 &&
      state.teleportTimer <= 1 &&
      !state.teleportSound
    ) {
      playSound(
        "./ASSET/Sound/Enemies/Telefragger/Teleport.mp3",
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      );
      state.teleportSound = true;
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

    if (dist < state.size * 0.15) {
      death("Telefragger");
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();

    if (state.teleportTimer > 0 && state.teleportTimer <= 1 && deafMode) {
      const t = 1 - state.teleportTimer;

      const cx = Math.round(mouse.x);
      const cy = Math.round(mouse.y);

      const angle = Math.atan2(-state.predDirY, -state.predDirX) + Math.PI;

      const outerR = Math.round(40 + t * 12);
      const thickness = 6;
      const innerR = outerR - thickness;

      const a0 = -Math.PI * 0.175;
      const a1 = Math.PI * 0.175;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.globalAlpha = 0.3 + t * 0.5;
      const redness = Math.floor(Math.random() * 128) + 128;
      ctx.fillStyle = `rgb(255,${redness},${redness})`;

      ctx.beginPath();

      ctx.arc(0, 0, outerR, a0, a1, false);
      ctx.arc(0, 0, innerR, a1, a0, true);

      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    if (!uldm) {
      function bulge(ctx, sourceCanvas, cx, cy, radius, strength = 0.25) {
        const rings = 32;

        for (let i = rings; i > 0; i--) {
          const r1 = ((i - 1) / rings) * radius;
          const r2 = (i / rings) * radius;

          const t = r2 / radius;
          const srcR = r2 * (1 - strength * (1 - t * t));

          ctx.save();

          ctx.beginPath();
          ctx.arc(cx, cy, r2, 0, Math.PI * 2);
          ctx.arc(cx, cy, r1, 0, Math.PI * 2, true);
          ctx.fillStyle = "#000";
          ctx.fill();
          ctx.clip("evenodd");

          const size = srcR * 2;

          ctx.drawImage(
            sourceCanvas,
            cx - srcR,
            cy - srcR,
            size,
            size,
            cx - r2,
            cy - r2,
            r2 * 2,
            r2 * 2,
          );

          ctx.restore();
        }
      }
      bulge(ctx, canvas, state.x, state.y, state.size * 0.6, 1);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(
        Math.round(state.x),
        Math.round(state.y),
        state.size * 0.6,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      if (state.flashTime > 0) {
        const t = state.flashTime / state.flashDuration;
        const alpha = t * t;

        ctx.save();

        ctx.translate(Math.round(state.x), Math.round(state.y));
        ctx.rotate(state.flashAngle);

        ctx.globalAlpha = alpha;

        const armLength = 100;
        const armWidth = 50;
        const curve = 0.01;

        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI) / 2);

          const grad = ctx.createLinearGradient(0, 0, armLength, 0);

          if (i % 2 === 0) {
            grad.addColorStop(0, "#ffffff");
            grad.addColorStop(1, "#ffffff");
          } else {
            grad.addColorStop(0, "#ffffff");
            grad.addColorStop(1, "#ffd200");
          }

          ctx.fillStyle = grad;

          ctx.beginPath();
          ctx.moveTo(0, -armWidth / 2);
          ctx.quadraticCurveTo(armLength * 0.28, -curve, armLength, 0);
          ctx.quadraticCurveTo(armLength * 0.28, curve, 0, armWidth / 2);
          ctx.quadraticCurveTo(curve * 0.25, 0, 0, -armWidth / 2);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }

        ctx.restore();

        const rippleRadius = Math.round((1 - t) * 80 + 20);
        ctx.globalAlpha = alpha * 0.35;
        ctx.fillStyle = "#9fdfff";
        ctx.beginPath();
        ctx.arc(
          Math.round(state.x),
          Math.round(state.y),
          rippleRadius,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    ctx.globalAlpha = state.opacity;
    ctx.translate(Math.round(state.x), Math.round(state.y));
    ctx.rotate(state.facingAngle);
    ctx.scale(state.flipX, -1);

    const size = Math.round(state.size);
    ESP(state.x, state.y, state.size * 1.2, "telefragger");
    ctx.drawImage(
      enemy,
      Math.round(-size / 2),
      Math.round(-size / 2),
      size,
      size,
    );

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
