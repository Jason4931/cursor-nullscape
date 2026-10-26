import { death, mouse, toggleTripmineLeniency } from "../entityHost.js";
import {
  ability,
  moveCamera,
  playSound,
  setSeamineScale,
  uldm,
} from "../main.js";

const enemy = new Image();
function loadAssets() {
  enemy.src = "./ASSET/Curses/Seamine.png";
}

export function setup(host, casualMode, hardMode) {
  loadAssets();
  const state = {
    x: 0,
    y: 0,
    size: 200,
    opacity: 1,
    flashing: false,
    flashTimer: 0,
    exploded: false,
    respawnTimer: 0,
    blastRadius: 0,
    blastAlpha: 0,
    touchCircleGrowthTime: 0,
    explosionCircleFadeTime: 0,
    rotation: 0,
  };

  const SPAWN_RADIUS = 2000;
  const TOUCH_RADIUS = state.size / 2;
  const EXPLODE_RADIUS = state.size * 2;
  const FLASH_TIME = hardMode ? 0.75 : casualMode ? 1.5 : 1;
  const RESPAWN_DELAY = 10;

  function spawnNearCursor() {
    const a = Math.random() * Math.PI * 2;
    state.x = mouse.x + Math.cos(a) * SPAWN_RADIUS;
    state.y = mouse.y + Math.sin(a) * SPAWN_RADIUS;
    state.opacity = 1;
    state.flashing = false;
    state.flashTimer = 0;
    state.exploded = false;
    state.touchCircleGrowthTime = 0;
    state.explosionCircleFadeTime = 0;
  }

  spawnNearCursor();

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.rotation += dt * Math.random() * 0.2;

    if (state.exploded) {
      state.respawnTimer -= dt;

      state.blastRadius += 2400 * dt;
      state.blastAlpha -= 0.6 * dt;
      state.explosionCircleFadeTime = Math.min(
        state.explosionCircleFadeTime + dt,
        0.25,
      );

      if (state.respawnTimer <= 0) spawnNearCursor();
      return;
    }

    const dx = mouse.x - state.x;
    const dy = mouse.y - state.y;
    const dist = Math.hypot(dx, dy);

    if (dist > SPAWN_RADIUS && !state.flashing) {
      spawnNearCursor();
      return;
    }

    if (dist < TOUCH_RADIUS && !state.flashing) {
      state.flashing = true;
      state.flashTimer = FLASH_TIME;
      state.touchCircleGrowthTime = 0;
      playSound("./ASSET/Sound/Enemies/Seamine/Seamine_-_Arm_1.ogg");
      setSeamineScale(0.25);
    }

    if (state.flashing) {
      state.flashTimer -= dt;
      state.touchCircleGrowthTime = Math.min(
        state.touchCircleGrowthTime + dt,
        0.25,
      );
      state.opacity = 1;

      if (
        state.flashTimer <= 0 ||
        (ability && state.flashTimer >= FLASH_TIME - 0.1)
      ) {
        state.exploded = true;
        state.respawnTimer = RESPAWN_DELAY;

        state.blastRadius = state.size / 2;
        state.blastAlpha = 0.8;
        state.explosionCircleFadeTime = 0;

        playSound("./ASSET/Sound/Enemies/Seamine/Seamine_-_Explode_1.ogg");
        if (dist < EXPLODE_RADIUS) {
          death("Seamine", "#FF6A00");
        }
        if (dist < EXPLODE_RADIUS * 2) {
          const nx = dx / dist;
          const ny = dy / dist;
          moveCamera(-nx * 400, -ny * 400);
          toggleTripmineLeniency(true);
          setTimeout(() => {
            toggleTripmineLeniency(false);
          }, 1000);
        }
      }
    }
  }

  function drawTouchCircles(ctx) {
    const growthProgress = Math.min(state.touchCircleGrowthTime / 0.25, 1);
    const fadeProgress = Math.min(state.explosionCircleFadeTime / 0.25, 1);
    const growth = 1 - (1 - growthProgress) ** 3;

    ctx.save();
    ctx.globalAlpha = (state.exploded ? 1 - fadeProgress : 1) * 0.5;

    for (const circle of [
      { radius: EXPLODE_RADIUS, color: "red" },
      { radius: EXPLODE_RADIUS * 2, color: "orange" },
    ]) {
      const radius = circle.radius * growth;
      const gradient = ctx.createRadialGradient(
        state.x,
        state.y,
        radius * 0.75,
        state.x,
        state.y,
        radius,
      );
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(1, circle.color);
      ctx.beginPath();
      ctx.arc(Math.round(state.x), Math.round(state.y), radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.restore();
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (state.exploded && !uldm) {
      if (state.blastAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, state.blastAlpha);
        ctx.beginPath();
        ctx.arc(
          Math.round(state.x),
          Math.round(state.y),
          Math.round(state.blastRadius),
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "orange";
        ctx.fill();
        ctx.restore();
      }

      drawTouchCircles(ctx);
      return;
    }

    if (state.flashing) drawTouchCircles(ctx);

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (state.respawnTimer <= 0) {
      ctx.save();
      ctx.translate(Math.round(state.x), Math.round(state.y));
      ctx.rotate(state.rotation);
      ctx.drawImage(
        enemy,
        Math.round(-state.size / 2),
        Math.round(-state.size / 2),
        Math.round(state.size),
        Math.round(state.size),
      );
      ctx.restore();

      if (state.flashing) {
        const pulse = ((FLASH_TIME - state.flashTimer) * 4) % 1;

        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(
          Math.round(state.x - 3),
          Math.round(state.y - 3),
          Math.round(state.size * pulse),
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "red";
        ctx.fill();
      }
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw, name: "Seamine" });
  return unregister;
}
