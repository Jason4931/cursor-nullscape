import { death, mouse } from "../entityHost.js";
import { TILE, moveCamera } from "../main.js";

export function setup(host) {
  const state = {
    activated: false,
    pads: [],
  };

  const PAD_SIZE = TILE * 2;
  const PAD_DISTANCE = 2000;
  const RADIUS = PAD_SIZE * 3;
  const ANIM_TIME = 0.25;

  function spawnPads(cursorX, cursorY) {
    const a = Math.random() * Math.PI * 2;

    const cx = cursorX + Math.cos(a) * PAD_DISTANCE;
    const cy = cursorY + Math.sin(a) * PAD_DISTANCE;

    state.pads = [
      {
        x: cx - PAD_SIZE / 2,
        y: cy - PAD_SIZE / 2,
        opacity: 0.5,
        active: false,
        shrinking: false,
        radiusT: 0,
      },
    ];
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (state.pads.length === 0) {
      spawnPads(mouse.x, mouse.y);
    } else {
      const p = state.pads[0];

      const dx = mouse.x - (p.x + PAD_SIZE / 2);
      const dy = mouse.y - (p.y + PAD_SIZE / 2);

      if (Math.hypot(dx, dy) > PAD_DISTANCE && !p.active && !p.shrinking) {
        spawnPads(mouse.x, mouse.y);
      }
    }

    for (const p of state.pads) {
      const cx = p.x + PAD_SIZE / 2;
      const cy = p.y + PAD_SIZE / 2;

      if (p.active) {
        p.radiusT = Math.min(p.radiusT + dt, 0.25);

        const dx = mouse.x - cx;
        const dy = mouse.y - cy;
        const dist = Math.hypot(dx, dy);

        if (dist > PAD_SIZE * 3) {
          const len = dist || 1;

          moveCamera((dx / len) * TILE * -1.25, (dy / len) * TILE * -1.25);

          p.active = false;
          p.shrinking = true;
          p.radiusT = 0;
        }

        continue;
      }

      if (p.shrinking) {
        p.radiusT += dt;

        if (p.radiusT >= 0.25) {
          p.shrinking = false;
          state.activated = false;
        }

        continue;
      }

      if (
        mouse.x >= p.x &&
        mouse.x <= p.x + PAD_SIZE &&
        mouse.y >= p.y &&
        mouse.y <= p.y + PAD_SIZE &&
        !state.activated
      ) {
        state.activated = true;

        p.active = true;
        p.shrinking = false;
        p.radiusT = 0;
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();

    for (const p of state.pads) {
      if (p.opacity <= 0) continue;

      const cx = p.x + PAD_SIZE / 2;
      const cy = p.y + PAD_SIZE / 2;

      if (p.active || p.shrinking) {
        const t = Math.min(p.radiusT / 0.25, 1);
        const eased = 1 - (1 - t) * (1 - t);

        const scale = p.active ? eased : 1 - eased;
        const radius = PAD_SIZE * 3 * scale;

        if (radius > 0) {
          ctx.save();

          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          grad.addColorStop(0, "rgba(255,255,255,0)");
          grad.addColorStop(1, "rgba(255,255,255,0.1)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        if (p.active) {
          const dx = mouse.x - cx;
          const dy = mouse.y - cy;

          if (Math.hypot(dx, dy) <= PAD_SIZE * 3) {
            ctx.save();
            ctx.strokeStyle = "#fff4";
            ctx.lineWidth = 1;

            const dx = mouse.x - cx;
            const dy = mouse.y - cy;
            const len = Math.hypot(dx, dy) || 1;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + (dx / len) * radius, cy + (dy / len) * radius);
            ctx.stroke();

            const angle = Math.atan2(dy, dx);
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            const arrowSize = 12;
            const positions = [];
            const count = 5;
            for (let i = 1; i <= count; i++) {
              positions.push(radius * (0.25 + (0.75 * i) / (count + 1)));
            }
            for (const x of positions) {
              ctx.beginPath();
              ctx.moveTo(x - arrowSize, -arrowSize);
              ctx.lineTo(x, 0);
              ctx.lineTo(x - arrowSize, arrowSize);
              ctx.stroke();
            }

            ctx.restore();
          }
        }
      }

      ctx.globalAlpha = p.opacity;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, PAD_SIZE / 2);
      grad.addColorStop(0, "#fff");
      grad.addColorStop(0.33, "#fff");
      grad.addColorStop(0.34, "#fff4");
      grad.addColorStop(0.94, "#fff4");
      grad.addColorStop(0.95, "#fff");
      grad.addColorStop(1, "#fff");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, PAD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw, name: "Jumppad" });
  return unregister;
}
