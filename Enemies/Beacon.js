import { mouse, toggleImmortality } from "../entityHost.js";
import { onFinalContact, TILE, getCameraPos } from "../main.js";

export function setup(host) {
  const TEXT_DELAY = 6.667;
  const HOLD_AFTER_LAST = 6.6667;

  const messages = [
    { text: "Do you hear it?", y: -140 },
    { text: "Our hearts beat as one.", y: 0 },
    { text: "We will meet again.", y: 140 },
  ];

  const SIZE = 3 * TILE;
  const START_SCALE = 0.3;

  const INIT_HOLD = 1.0;
  const INIT_GROW = 0.5;
  const BURST_TIME = 2.4;

  const FADE_IN = 1.0;
  const FADE_OUT = 1.0;

  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    touched: false,

    phase: "initHold",
    timer: 0,
    scale: START_SCALE,
  };

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 2);
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.x = Math.round(host.canvas.width * 0.5);
    state.y = Math.round(host.canvas.height * 0.5);

    state.timer += dt;

    if (state.phase === "initHold") {
      state.scale = START_SCALE;
      if (state.timer >= INIT_HOLD) {
        state.timer = 0;
        state.phase = "initGrow";
      }
      return;
    }

    if (state.phase === "initGrow") {
      const t = Math.min(1, state.timer / INIT_GROW);
      state.scale = START_SCALE + (1 - START_SCALE) * easeOut(t);
      if (t >= 1) {
        state.phase = "active";
        state.timer = 0;
      }
      return;
    }

    if (state.phase === "active") {
      const half = (SIZE * state.scale) / 2;

      const inside =
        mouse.x >= state.x - half &&
        mouse.x <= state.x + half &&
        mouse.y >= state.y - half &&
        mouse.y <= state.y + half;

      if (inside && !state.touched) {
        state.touched = true;
        state.phase = "finalBurst";
        state.timer = 0;
        document.getElementById("counter").style.color = "#000";
        toggleImmortality(true);
        onFinalContact();
      }
    }

    if (
      state.phase === "finalBurst" &&
      state.timer >= 28.667 &&
      state.opacity > 0
    ) {
      document.getElementById("counter").style.color = "#fff";
      state.opacity -= dt;
      if (state.opacity <= 0) state.opacity = 0;
    }
  }

  function drawArrow(ctx) {
    const dx = state.x - mouse.x;
    const dy = state.y - mouse.y;
    const ang = Math.atan2(dy, dx);

    const OFFSET = 28;

    ctx.save();

    ctx.translate(
      Math.round(mouse.x + Math.cos(ang) * OFFSET),
      Math.round(mouse.y + Math.sin(ang) * OFFSET),
    );

    ctx.rotate(ang);

    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-10, -6);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-10, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawSnakeText(ctx, msg, baseY, time, alpha) {
    const cam = getCameraPos();
    const cx = Math.round(cam.x + window.innerWidth * 0.5);
    const cy = Math.round(cam.y + window.innerHeight * 0.5 + baseY);

    ctx.font = "32px serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;

    const chars = msg.split("");
    const spacing = 20;
    const startX = Math.round(cx - ((chars.length - 1) * spacing) / 2);

    for (let i = 0; i < chars.length; i++) {
      const wave = Math.sin(time * 2 + i * 0.6) * 9;

      ctx.fillText(
        chars[i],
        Math.round(startX + i * spacing),
        Math.round(cy + wave),
      );
    }
  }

  function drawFinalBurst(ctx) {
    const t = Math.min(1, state.timer / BURST_TIME);
    const r = Math.round(
      easeOut(t) * Math.hypot(host.canvas.width, host.canvas.height),
    );

    const cx = Math.round(state.x);
    const cy = Math.round(state.y);

    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);

    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, `rgba(255,255,255,${state.timer})`);

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    const globalFadeOutStart = TEXT_DELAY * messages.length + HOLD_AFTER_LAST;

    for (let i = 0; i < messages.length; i++) {
      const appearAt = TEXT_DELAY * (i + 1);
      const localTime = state.timer - appearAt;

      if (localTime < 0) continue;

      let alpha = Math.min(1, localTime / FADE_IN);

      if (state.timer >= globalFadeOutStart) {
        const outT = state.timer - globalFadeOutStart;
        alpha *= Math.max(0, 1 - outT / FADE_OUT);
      }

      if (alpha > 0) {
        drawSnakeText(ctx, messages[i].text, messages[i].y, localTime, alpha);
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    const size = Math.round(SIZE * state.scale);
    const half = Math.round(size / 2);

    const cx = Math.round(state.x);
    const cy = Math.round(state.y);

    if (state.phase === "finalBurst") {
      drawFinalBurst(ctx);
      ctx.restore();
      return;
    }

    const glowR = Math.round(size * TILE * 0.667);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    g.addColorStop(0, "rgba(255,255,0,0.5)");
    g.addColorStop(1, "rgba(255,255,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - half, cy - half, size, size);

    if (state.phase === "active") {
      drawArrow(ctx);
    }

    ctx.restore();
  }

  return host.register({ update, draw, name: "Beacon" });
}
