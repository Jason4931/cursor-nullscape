import { mouse } from "../entityHost.js";
import { setGrindrailScale } from "../main.js";

function generatePath(canvas) {
  const points = [];
  const MIN_DIST = 1000;

  while (points.length < 5) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;

    let ok = true;
    for (const p of points) {
      const dx = x - p.x;
      const dy = y - p.y;
      if (dx * dx + dy * dy < MIN_DIST * MIN_DIST) {
        ok = false;
        break;
      }
    }

    if (ok) points.push({ x, y });
  }

  return points;
}
export function setup(host) {
  let path = [];
  path = generatePath(host.canvas);

  const state = {
    opacity: 1,
    timer: 0,
    nextDelay: 29 + Math.random(),
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    state.timer += dt;
    if (state.timer >= state.nextDelay) {
      state.timer = 0;
      state.nextDelay = 29 + Math.random();
      path = generatePath(host.canvas);
    }

    const TOUCH_RADIUS = 16;
    const STEPS = 100;

    let touching = false;

    let startX = path[0].x;
    let startY = path[0].y;

    for (let i = 0; i < path.length - 1; i++) {
      const p0 = path[i];
      const p1 = path[i + 1];

      const endX = (p0.x + p1.x) / 2;
      const endY = (p0.y + p1.y) / 2;

      const controlX = p0.x;
      const controlY = p0.y;

      for (let j = 0; j <= STEPS; j++) {
        const t = j / STEPS;

        const x =
          (1 - t) * (1 - t) * startX +
          2 * (1 - t) * t * controlX +
          t * t * endX;

        const y =
          (1 - t) * (1 - t) * startY +
          2 * (1 - t) * t * controlY +
          t * t * endY;

        const dx = mouse.x - x;
        const dy = mouse.y - y;

        if (dx * dx + dy * dy <= TOUCH_RADIUS * TOUCH_RADIUS) {
          touching = true;
          break;
        }
      }

      if (touching) break;

      startX = endX;
      startY = endY;
    }

    if (touching) setGrindrailScale(1.5);
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();

    for (let i = 0; i < path.length - 1; i++) {
      const p0 = path[i];
      const p1 = path[i + 1];

      const mx = (p0.x + p1.x) / 2;
      const my = (p0.y + p1.y) / 2;

      if (i === 0) ctx.moveTo(p0.x, p0.y);

      ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
    }

    ctx.stroke();

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;

    const STEPS = 16;

    let startX = path[0].x;
    let startY = path[0].y;

    for (let i = 0; i < path.length - 1; i++) {
      const p0 = path[i];
      const p1 = path[i + 1];

      const endX = (p0.x + p1.x) / 2;
      const endY = (p0.y + p1.y) / 2;

      const controlX = p0.x;
      const controlY = p0.y;

      for (let j = 0; j <= STEPS; j++) {
        if (j % 2 !== 0) continue;

        const t = j / STEPS;

        const x =
          (1 - t) * (1 - t) * startX +
          2 * (1 - t) * t * controlX +
          t * t * endX;

        const y =
          (1 - t) * (1 - t) * startY +
          2 * (1 - t) * t * controlY +
          t * t * endY;

        const dx =
          2 * (1 - t) * (controlX - startX) + 2 * t * (endX - controlX);

        const dy =
          2 * (1 - t) * (controlY - startY) + 2 * t * (endY - controlY);

        const len = Math.hypot(dx, dy);
        if (!len) continue;

        const px = -dy / len;
        const py = dx / len;

        ctx.beginPath();
        ctx.moveTo(x - px * 6, y - py * 6);
        ctx.lineTo(x + px * 6, y + py * 6);
        ctx.stroke();
      }

      startX = endX;
      startY = endY;
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw, name: "Grindrail" });
  return unregister;
}
