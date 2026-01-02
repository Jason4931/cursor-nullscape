import { mouse, attachMouseListener } from "../entityHost.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Bell.png";

export function setup(host) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    minRadius: 240,
    maxRadius: 600,

    size: 100,
    bellScale: 0,
    circleScale: 0,
    rotation: 0,
    rotationTime: 0,

    phase: "disappear",
    timer: 0.5,
    waitDuration: { min: 4, max: 6 },

    initialized: false,

    hitTimer: 0,
    hitCooldown: 2,
    hitActive: false,
    wasHovering: false,
  };

  attachMouseListener(host.canvas);

  const easeOut = (t) => 1 - (1 - t) * (1 - t);
  const easeIn = (t) => t * t;

  function teleport() {
    const angle = Math.random() * Math.PI * 2;
    const radius =
      state.minRadius + Math.random() * (state.maxRadius - state.minRadius);

    state.x = mouse.x + Math.cos(angle) * radius;
    state.y = mouse.y + Math.sin(angle) * radius;
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.rotationTime += dt;

    state.rotation = Math.sin(state.rotationTime * 1.2) * 0.15;

    const half = (state.size * state.bellScale) / 2;
    const dx = mouse.x - state.x;
    const dy = mouse.y - state.y;
    const hovering = dx * dx + dy * dy < half * half;

    if (hovering && !state.wasHovering && !state.hitActive) {
      state.hitActive = true;
      state.hitTimer = 0;
    }

    state.wasHovering = hovering;

    if (state.hitActive) {
      state.hitTimer += dt;
      if (state.hitTimer >= state.hitCooldown) {
        state.hitActive = false;
      }
    }

    if (!state.initialized) {
      teleport();
      state.initialized = true;
    }

    state.timer += dt;

    if (state.phase === "appear") {
      if (state.timer <= 0.5) {
        const t = state.timer / 0.5;
        state.circleScale = easeOut(t);
      } else {
        const t = (state.timer - 0.5) / 0.5;
        state.circleScale = 1 - easeIn(t);
      }

      state.bellScale = easeOut(Math.min(state.timer / 1, 1));

      if (state.timer >= 1) {
        state.timer = 0;
        state.circleScale = 0;
        state.phase = "wait";
      }
    } else if (state.phase === "wait") {
      if (!state._waitTarget) {
        state._waitTarget =
          state.waitDuration.min +
          Math.random() * (state.waitDuration.max - state.waitDuration.min);
      }

      if (state.timer >= state._waitTarget) {
        state.timer = 0;
        state._waitTarget = 0;
        state.phase = "disappear";
      }
    } else if (state.phase === "disappear") {
      if (state.timer <= 0.5) {
        const t = state.timer / 0.5;
        state.circleScale = easeOut(t);
      } else {
        const t = (state.timer - 0.5) / 0.5;
        state.circleScale = 1 - easeIn(t);
      }

      state.bellScale = 1 - easeIn(Math.min(state.timer / 1, 1));

      if (state.timer >= 1) {
        state.timer = 0;
        state.circleScale = 0;
        teleport();
        state.phase = "appear";
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    if (state.circleScale > 0) {
      ctx.beginPath();
      ctx.arc(state.x, state.y, 40 * state.circleScale, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() < 0.6 ? "gray" : "white";
      ctx.fill();
    }

    if (state.bellScale > 0) {
      const s = state.size * state.bellScale;
      ctx.save();
      ctx.translate(state.x, state.y);
      ctx.rotate(state.rotation);
      ctx.drawImage(enemy, -s / 2, -s / 2, s, s);
      ctx.restore();
    }

    if (state.hitActive) {
      const fade = 1 - state.hitTimer / state.hitCooldown;

      const strength = 120 * fade;
      const alpha = 0.5 * fade;

      state._wobbleTime = (state._wobbleTime || 0) + 0.08;

      const offsets = [
        [Math.sin(state._wobbleTime) * strength, 0],
        [0, Math.cos(state._wobbleTime * 1.3) * strength],
        [
          Math.sin(state._wobbleTime * 0.7) * strength,
          Math.cos(state._wobbleTime * 0.9) * strength,
        ],
      ];

      ctx.save();
      ctx.globalAlpha = alpha;

      for (const [ox, oy] of offsets) {
        ctx.drawImage(ctx.canvas, ox, oy);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
