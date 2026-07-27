import { death, mouse } from "../entityHost.js";
import { canvas, ESP, playSound, uldm } from "../main.js";

const Telefragger = [];
for (let i = 1; i <= 2; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Telefragger/Layer ${i}.png`;
  Telefragger.push(img);
}

export let mutedActive = [false];
export function setup(host, casualMode, hardMode, deafMode) {
  const state = {
    opacity: 1,
    enemy: null,

    x: 0,
    y: 0,

    size: 100,
    speed: casualMode ? 20 : hardMode ? 80 : 40,

    teleportTimer: 1,
    teleportDistance: casualMode ? 600 : 450,

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
    walkSound: false,
    walkSoundTimer: 0,

    teleportSound: false,

    dashDirX: 0,
    dashDirY: 0,
    lineLength: 810,
    dashState: "idle",
    dashTimer: 0,
    dashStartX: 0,
    dashStartY: 0,
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.enemy = Telefragger[0];
    state.walkSoundTimer += dt;

    if (state.walkSoundTimer < 0.6) {
      state.enemy = Telefragger[0];
    } else if (state.walkSoundTimer >= 0.6 && state.walkSoundTimer < 1.2) {
      state.enemy = Telefragger[1];
    } else if (state.walkSoundTimer >= 1.2 && state.walkSoundTimer < 1.8) {
      state.enemy = Telefragger[0];
    } else if (state.walkSoundTimer >= 1.8 && state.walkSoundTimer < 2.4) {
      state.layer = 1;
      state.enemy = Telefragger[1];
    } else if (state.walkSoundTimer >= 2.4) {
      state.walkSoundTimer = 0;
      if (state.walkSound) state.walkSound();
      state.walkSound = false;
    }

    const dx = mouse.x - state.x;
    const dy = mouse.y - state.y;
    const dist = Math.hypot(dx, dy);
    if (!state.walkSound && dist <= 500) {
      state.walkSound = playSound(
        "./ASSET/Sound/Enemies/Telefragger/Telefragger_Walk_Patch5.ogg",
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      );
    } else if (state.walkSound && dist > 500) {
      state.walkSound();
      state.walkSound = false;
    }

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

    let angle = Math.atan2(dy, dx) + Math.PI;

    if (Math.cos(angle) > 0) {
      state.flipX = -1;
      angle += Math.PI;
    } else {
      state.flipX = 1;
    }

    state.facingAngle = angle;

    let overrideMovement = false;
    if (state.dashState !== "idle") {
      state.dashTimer += dt;

      if (state.dashState === "indicator") {
        overrideMovement = true;
        if (state.dashTimer >= 0.5) {
          state.dashState = "dash";
          state.dashTimer = 0;
          playSound(
            "./ASSET/Sound/Enemies/Telefragger/Telefragger_Ambush.ogg",
            undefined,
            undefined,
            undefined,
            undefined,
            true,
          );
        }
      }

      if (state.dashState === "dash") {
        overrideMovement = true;
        let t = state.dashTimer / 0.5;
        if (t > 1) t = 1;

        const ease = 1 - Math.pow(1 - t, 3);

        state.x = state.dashStartX + state.dashDirX * state.lineLength * ease;
        state.y = state.dashStartY + state.dashDirY * state.lineLength * ease;

        const dx = mouse.x - state.x;
        const dy = mouse.y - state.y;

        if (Math.hypot(dx, dy) <= state.size * 0.25) {
          death("Telefragger");
        }

        if (t >= 1) {
          state.dashState = "idle";
        }
      }
    }

    state.teleportTimer -= dt;
    if (state.teleportTimer <= 0) {
      state.x = mouse.x + state.predDirX * state.teleportDistance;
      state.y = mouse.y + state.predDirY * state.teleportDistance;

      state.teleportTimer = hardMode ? 4 + Math.random() : 9 + Math.random();

      state.flashTime = state.flashDuration;
      state.flashAngle = Math.random() * Math.PI * 2;
      state.teleportSound = false;

      if (hardMode) {
        const dx = mouse.x - state.x;
        const dy = mouse.y - state.y;
        const d = Math.hypot(dx, dy) || 1;

        state.dashDirX = dx / d;
        state.dashDirY = dy / d;

        state.dashStartX = state.x;
        state.dashStartY = state.y;

        state.dashTimer = 0;
        state.dashState = "indicator";
      }
    }
    if (
      state.teleportTimer >= 0.9 &&
      state.teleportTimer <= 1 &&
      !state.teleportSound &&
      !mutedActive[0]
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
    if (dist > 1 && !overrideMovement) {
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

    if (state.dashState === "indicator") {
      const alpha = 1 - state.dashTimer * 2;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;

      const dashLength = 30;
      const gapLength = 20;
      const thickness = 4;

      const angle = Math.atan2(state.dashDirY, state.dashDirX);

      let dist = 0;
      while (dist < state.lineLength) {
        const cx = state.x + state.dashDirX * dist;
        const cy = state.y + state.dashDirY * dist;

        ctx.save();
        ctx.translate(Math.round(cx), Math.round(cy));
        ctx.rotate(angle);

        ctx.fillRect(0, -thickness / 2, dashLength, thickness);

        ctx.restore();

        dist += dashLength + gapLength;
      }
    }

    if (
      state.teleportTimer > 0 &&
      state.teleportTimer <= 1 &&
      deafMode &&
      !mutedActive[0]
    ) {
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

    const size = Math.round(state.size * 0.8);
    ESP(state.x, state.y, state.size * 1.2, "telefragger");
    ctx.drawImage(
      state.enemy,
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
