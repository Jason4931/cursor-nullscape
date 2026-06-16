import { death, mouse } from "../entityHost.js";

export let RealityCollapseCount = { count: 2 };
export function setup(host) {
  const state = {
    opacity: 1,
    phase: "idle",
    phaseT: 0,
    idleDuration: 10 - RealityCollapseCount.count / 2,

    lines: [],
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.phaseT += dt;

    if (state.phase === "idle") {
      if (state.phaseT >= state.idleDuration) {
        state.phaseT = 0;
        state.phase = "spawn";

        for (let i = 0; i < RealityCollapseCount.count; i++) {
          const ang = Math.random() * Math.PI * 2;
          const sx = mouse.x + Math.cos(ang) * (Math.random() * 2000);
          const sy = mouse.y + Math.sin(ang) * (Math.random() * 2000);

          const tx = sx + Math.random() * 1000 - 500;
          const ty = sy + Math.random() * 1000 - 500;

          const dx = tx - sx;
          const dy = ty - sy;
          const len = Math.hypot(dx, dy) || 1;
          const angStart = Math.random() * Math.PI * 2;
          const angEnd = angStart + Math.random() - 0.5;

          state.lines.push({
            x: sx,
            y: sy,
            startX: sx,
            startY: sy,
            targetX: tx,
            targetY: ty,

            angStart,
            angEnd,

            lenScale: 1,
            nx: Math.cos(angStart),
            ny: Math.sin(angStart),
          });
        }
      }
    }
    if (state.phase === "spawn") {
      for (const l of state.lines) {
        const duration = 1.5;
        const p = Math.min(1, state.phaseT / duration);
        const eased = 1 - Math.pow(1 - p, 2);

        const dx = l.targetX - l.startX;
        const dy = l.targetY - l.startY;

        l.x = l.startX + dx * eased;
        l.y = l.startY + dy * eased;

        let da = l.angEnd - l.angStart;

        if (da > Math.PI) da -= Math.PI * 2;
        if (da < -Math.PI) da += Math.PI * 2;

        const ang = l.angStart + da * eased;

        l.nx = Math.cos(ang);
        l.ny = Math.sin(ang);
      }
      if (state.phaseT >= 2) {
        state.phase = "collapse";
        state.phaseT = 0;
      }
    }
    if (state.phase === "collapse") {
      for (const l of state.lines) {
        const duration = 1;
        const p = Math.min(1, state.phaseT / duration);
        const eased = 1 - Math.pow(1 - p, 2);

        l.lenScale = 1 - eased;

        const halfLen = 20000 * l.lenScale;

        const ax = l.x + l.nx * halfLen;
        const ay = l.y + l.ny * halfLen;

        const bx = l.x - l.nx * halfLen;
        const by = l.y - l.ny * halfLen;

        const abx = bx - ax;
        const aby = by - ay;

        const apx = mouse.x - ax;
        const apy = mouse.y - ay;

        const abLen2 = abx * abx + aby * aby || 1;

        let t = (apx * abx + apy * aby) / abLen2;
        t = Math.max(0, Math.min(1, t));

        const cx = ax + abx * t;
        const cy = ay + aby * t;

        const dist = Math.hypot(mouse.x - cx, mouse.y - cy);

        if (dist < 100) {
          death("RealityCollapse");
        }
      }
      if (state.phaseT >= 1) {
        state.phase = "idle";
        state.phaseT = 0;
        state.lines = [];
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.phase == "spawn" ? state.phaseT * 4 : 1;

    if (state.lines.length) {
      for (const l of state.lines) {
        const perpX = -l.ny;
        const perpY = l.nx;

        const thickness = 100;
        const halfLen = 20000 * (l.lenScale ?? 1);

        const fx = l.x + l.nx * halfLen;
        const fy = l.y + l.ny * halfLen;

        const bx = l.x - l.nx * halfLen;
        const by = l.y - l.ny * halfLen;

        const x1 = fx + perpX * thickness;
        const y1 = fy + perpY * thickness;

        const x2 = fx - perpX * thickness;
        const y2 = fy - perpY * thickness;

        const x3 = bx - perpX * thickness;
        const y3 = by - perpY * thickness;

        const x4 = bx + perpX * thickness;
        const y4 = by + perpY * thickness;

        if (state.phase === "collapse") {
          const glow = 100;

          const gx1 = fx + perpX * (thickness + glow);
          const gy1 = fy + perpY * (thickness + glow);

          const gx2 = fx - perpX * (thickness + glow);
          const gy2 = fy - perpY * (thickness + glow);

          const gx3 = bx - perpX * (thickness + glow);
          const gy3 = by - perpY * (thickness + glow);

          const gx4 = bx + perpX * (thickness + glow);
          const gy4 = by + perpY * (thickness + glow);

          const grad = ctx.createLinearGradient(
            l.x + perpX * (thickness + glow),
            l.y + perpY * (thickness + glow),
            l.x - perpX * (thickness + glow),
            l.y - perpY * (thickness + glow),
          );
          const edge = thickness / (thickness + glow);
          grad.addColorStop(0, "rgba(255, 0, 255, 0)");
          grad.addColorStop(0.5 - edge * 0.5, "rgba(255, 0, 255, 0.5)");
          grad.addColorStop(0.5 + edge * 0.5, "rgba(255, 0, 255, 0.5)");
          grad.addColorStop(1, "rgba(255, 0, 255, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(gx1, gy1);
          ctx.lineTo(gx2, gy2);
          ctx.lineTo(gx3, gy3);
          ctx.lineTo(gx4, gy4);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x3, y3);
          ctx.lineTo(x4, y4);
          ctx.closePath();

          ctx.strokeStyle = "magenta";
          ctx.lineWidth = 18;
          ctx.stroke();
        }
      }
      for (const l of state.lines) {
        const perpX = -l.ny;
        const perpY = l.nx;

        const thickness = state.phase === "collapse" ? 100 : 125;
        const halfLen = 20000 * (l.lenScale ?? 1);

        const fx = l.x + l.nx * halfLen;
        const fy = l.y + l.ny * halfLen;

        const bx = l.x - l.nx * halfLen;
        const by = l.y - l.ny * halfLen;

        const x1 = fx + perpX * thickness;
        const y1 = fy + perpY * thickness;

        const x2 = fx - perpX * thickness;
        const y2 = fy - perpY * thickness;

        const x3 = bx - perpX * thickness;
        const y3 = by - perpY * thickness;

        const x4 = bx + perpX * thickness;
        const y4 = by + perpY * thickness;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.closePath();

        if (state.phase === "collapse") {
          ctx.fillStyle = "black";
          ctx.fill();
        } else {
          const grad = ctx.createLinearGradient(
            l.x + perpX * thickness,
            l.y + perpY * thickness,
            l.x - perpX * thickness,
            l.y - perpY * thickness,
          );
          grad.addColorStop(0, "rgba(255,0,255,0)");
          grad.addColorStop(0.25, "rgba(255,0,255,0.75)");
          grad.addColorStop(0.333, "rgba(255,0,255,0.9)");
          grad.addColorStop(0.5, "rgba(255,0,255,1)");
          grad.addColorStop(0.667, "rgba(255,0,255,0.9)");
          grad.addColorStop(0.75, "rgba(255,0,255,0.75)");
          grad.addColorStop(1, "rgba(255,0,255,0)");

          ctx.fillStyle = grad;
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
