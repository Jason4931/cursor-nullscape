import { death, mouse } from "../entityHost.js";
import { TILE, canvas, getCameraPos, spawnCelestialEnding } from "../main.js";
import { pylonLocations } from "./Pylons.js";
const rawpattern = [
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0,
  ],
  [
    0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 3, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0,
    0, 0,
  ],
  [
    0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0,
    0, 0,
  ],
  [
    0, 0, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3,
    0, 0,
  ],
  [
    0, 0, 0, 3, 3, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 3, 3, 0,
    0, 0,
  ],
  [
    0, 0, 0, 1, 1, 1, 3, 3, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3, 3, 1, 1, 1, 0,
    0, 0,
  ],
  [
    0, 0, 1, 1, 1, 0, 0, 3, 3, 1, 1, 1, 2, 2, 2, 1, 1, 1, 3, 3, 0, 0, 1, 1, 1,
    0, 0,
  ],
  [
    0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 1, 1, 1,
    0, 0,
  ],
  [
    0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 1, 1, 1,
    0, 0,
  ],
  [
    0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 1, 1, 1,
    0, 0,
  ],
  [
    0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 1, 1, 1,
    0, 0,
  ],
  [
    0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 1, 1, 1,
    0, 0,
  ],
  [
    0, 0, 1, 1, 1, 0, 0, 3, 3, 1, 1, 1, 2, 2, 2, 1, 1, 1, 3, 3, 0, 0, 1, 1, 1,
    0, 0,
  ],
  [
    0, 0, 0, 1, 1, 1, 3, 3, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3, 3, 1, 1, 1, 0,
    0, 0,
  ],
  [
    0, 0, 0, 3, 3, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 3, 3, 0,
    0, 0,
  ],
  [
    0, 0, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3,
    0, 0,
  ],
  [
    0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0,
    0, 0,
  ],
  [
    0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 3, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0,
    0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0,
  ],
];
const pattern = rawpattern.map((row, y) =>
  row.map((v, x) => {
    if (v !== 1) return v;

    const neighbors = [
      rawpattern[y - 1]?.[x],
      rawpattern[y + 1]?.[x],
      rawpattern[y]?.[x - 1],
      rawpattern[y]?.[x + 1],
    ];

    return neighbors.includes(0) ? (Math.random() < 0.1 ? 4 : 1) : 1;
  }),
);
let pylonDone = 0;
export function setup(host) {
  const state = {
    opacity: 1,
    pylons: [],
    generated: false,
    charging: false,
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    const s = state;

    if (!s.generated) {
      s.generated = true;

      const margin = 1000;
      const minDist = 2000;

      let count = 3;
      if (pylonDone >= 9) count = 1;
      for (let i = 0; i < count; i++) {
        while (true) {
          const x = Math.random() * (canvas.width - margin * 2) + margin;
          const y = Math.random() * (canvas.height - margin * 2) + margin;

          let ok = true;

          for (const p of s.pylons) {
            const dx = x - p.x;
            const dy = y - p.y;
            if (dx * dx + dy * dy < minDist * minDist) {
              ok = false;
              break;
            }
          }

          if (ok) {
            s.pylons.push({
              x,
              y,
              charge: 0,
              charging: false,
              charged: false,
              shake: 0,
              particles: [],
              pTimer: 0,
              rotate: Math.PI * 2 * Math.random(),
              circleRadius: 500,
            });
            pylonLocations.push([x, y]);
            break;
          }
        }
      }
    }
    for (const p of s.pylons) {
      if (p.circleRadius > 0) {
        p.circleRadius -= dt * 500;
        if (p.circleRadius < 0) p.circleRadius = 0;
      }
    }

    s.charging = false;
    for (const p of s.pylons) {
      p.pTimer += dt;

      if (!p.charged && p.charging && p.pTimer >= 0.01) {
        p.pTimer = 0;

        let i = 0;
        while (i++ <= 4) {
          const ang = Math.random() * Math.PI * 2;
          const dist = TILE * (6 + Math.random() * 8);

          const px = p.x + Math.cos(ang) * dist;
          const py = p.y + Math.sin(ang) * dist;

          const dxp = p.x - px;
          const dyp = p.y - py;
          const len = Math.hypot(dxp, dyp) || 1;

          p.particles.push({
            x: px,
            y: py,
            vx: (dxp / len) * 600,
            vy: (dyp / len) * 600,
            life: 0.4,
            t: 0,
            out: false,
          });
        }
      }

      if (p.charged && p.shake > 0 && p.pTimer >= 0.01) {
        p.pTimer = 0;

        let i = 0;
        while (i++ <= 4) {
          const ang = Math.random() * Math.PI * 2;
          const speed = 800 + Math.random() * 800;

          p.particles.push({
            x: p.x,
            y: p.y,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            life: 0.4,
            t: 0,
            out: true,
          });
        }
      }

      let needsClean = false;
      for (const pt of p.particles) {
        pt.t += dt;

        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;

        if (pt.t >= pt.life) {
          pt.dead = true;
          needsClean = true;
        }
      }
      if (needsClean) {
        p.particles = p.particles.filter((pt) => !pt.dead);
      }

      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (!p.charged) {
        if (dist <= 600) {
          p.charge += dt;
          p.charging = true;
          s.charging = true;
          p.shake = 1;
        } else {
          p.charging = false;
          p.shake = 0;
        }

        if (p.charge >= 10) {
          p.charge = 10;
          p.charged = true;
          p.shake = 2;
          pylonDone++;
          if (pylonDone == 10) {
            spawnCelestialEnding();
          } else if (pylonDone % 3 == 0) {
            s.generated = false;
          }
        }
      } else {
        p.shake -= dt * 0.5;
        if (p.shake < 0) p.shake = 0;
      }
    }

    let nearest = null;
    let bestDist = Infinity;
    for (const p of s.pylons) {
      if (p.charged) continue;

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d = dx * dx + dy * dy;

      if (d < bestDist) {
        bestDist = d;
        nearest = p;
      }
    }
    s.nearest = nearest;
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    const s = state;
    const cam = getCameraPos();
    const viewLeft = cam.x;
    const viewTop = cam.y;
    const viewRight = cam.x + window.innerWidth;
    const viewBottom = cam.y + window.innerHeight;

    const rows = pattern.length;
    const cols = pattern[0].length;

    for (const p of s.pylons) {
      const size = (pattern.length * TILE) / 2 + 200;
      if (
        p.x + size < viewLeft ||
        p.x - size > viewRight ||
        p.y + size < viewTop ||
        p.y - size > viewBottom
      ) {
        continue;
      }
      const cx = p.x;
      const cy = p.y;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotate);
      ctx.translate(-p.x, -p.y);

      const rows = pattern.length;
      const cols = pattern[0].length;
      const width = cols * TILE;
      const height = rows * TILE;
      const radius = Math.hypot(width, height) * 0.5;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(0.75, "rgba(0,0,0,0.5)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      const startX = p.x - (cols * TILE) / 2;
      const startY = p.y - (rows * TILE) / 2;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = pattern[y][x];
          if (v == 0 || v == 2 || v == 3) continue;
          ctx.fillStyle = v === 1 ? "#666" : "#800";
          ctx.fillRect(
            startX + (x - 0.1) * TILE,
            startY + (y - 0.1) * TILE,
            TILE * 1.2,
            TILE * 1.2,
          );
        }
      }
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = pattern[y][x];
          if (v == 0 || v == 1 || v == 2 || v == 3) continue;
          ctx.save();
          ctx.translate(
            startX + x * TILE + TILE / 2,
            startY + y * TILE + TILE / 2,
          );
          ctx.scale(0.5, 0.5);

          const half = TILE * 1.75;
          const step = TILE * 0.8;

          const placements = [];

          for (let i = -1; i <= 1; i++) {
            placements.push([
              i * step,
              -half + 10 * Math.abs(i),
              -Math.PI / 2 + (i * Math.PI) / 6,
            ]);
          }

          for (let i = -1; i <= 1; i++) {
            placements.push([
              i * step,
              half - 10 * Math.abs(i),
              Math.PI / 2 - (i * Math.PI) / 6,
            ]);
          }

          for (let i = -1; i <= 1; i++) {
            placements.push([
              -half + 10 * Math.abs(i),
              i * step,
              Math.PI - (i * Math.PI) / 6,
            ]);
          }

          for (let i = -1; i <= 1; i++) {
            placements.push([
              half - 10 * Math.abs(i),
              i * step,
              0 + (i * Math.PI) / 6,
            ]);
          }

          for (const [ox, oy, rot] of placements) {
            ctx.save();
            ctx.translate(ox, oy);
            ctx.rotate(rot + Math.PI / 2);

            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.bezierCurveTo(15, -10, 20, 10, 0, 25);
            ctx.bezierCurveTo(-20, 10, -15, -10, 0, -20);
            ctx.closePath();

            ctx.fillStyle = "#900";
            ctx.fill();

            ctx.strokeStyle = "#700";
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(0, 25);
            ctx.stroke();

            let last = 0.5;
            for (let i = -2; i <= 2; i++) {
              ctx.beginPath();
              ctx.moveTo(0, i * 8);
              ctx.lineTo(last * 15, i * 8 + 5);
              ctx.stroke();
              last *= -1;
            }

            ctx.restore();
          }

          ctx.restore();
        }
      }
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = pattern[y][x];
          if (v === 0) continue;

          let color = "#666";
          if (v === 2) color = "#900";
          else if (v === 3) color = "#333";

          ctx.fillStyle = color;

          if (v === 1 || v === 4) {
            const h = TILE / 2;

            const baseX = startX + x * TILE;
            const baseY = startY + y * TILE;

            ctx.fillStyle = "#888";
            ctx.fillRect(baseX, baseY, h, h);

            ctx.fillStyle = "#222";
            ctx.fillRect(baseX + h, baseY, h, h);

            ctx.fillStyle = "#222";
            ctx.fillRect(baseX, baseY + h, h, h);

            ctx.fillStyle = "#888";
            ctx.fillRect(baseX + h, baseY + h, h, h);
          } else if (v === 3) {
            const h = TILE / 2;

            const baseX = startX + x * TILE;
            const baseY = startY + y * TILE;

            ctx.fillStyle = "#444";
            ctx.fillRect(baseX, baseY, h, h);

            ctx.fillStyle = "#333";
            ctx.fillRect(baseX + h, baseY, h, h);

            ctx.fillStyle = "#222";
            ctx.fillRect(baseX, baseY + h, h, h);

            ctx.fillStyle = "#111";
            ctx.fillRect(baseX + h, baseY + h, h, h);
          } else {
            ctx.fillRect(startX + x * TILE, startY + y * TILE, TILE, TILE);
          }
        }
      }

      for (const pt of p.particles) {
        const t = pt.t / pt.life;
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = pt.out ? "white" : "magenta";
        ctx.lineWidth = 8;
        const len = 40;
        const nx = pt.vx;
        const ny = pt.vy;
        const l = Math.hypot(nx, ny) || 1;
        const dx = (nx / l) * len;
        const dy = (ny / l) * len;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x - dx, pt.y - dy);
        ctx.stroke();
        ctx.restore();
      }

      const t = p.charging || p.charged ? p.charge / 10 : p.charge / 11;
      const glowradius = Math.hypot(width, height) * 0.25 * t;
      const glowgrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowradius);
      glowgrad.addColorStop(0, "rgba(255,0,255,0.5)");
      glowgrad.addColorStop(0.75, "rgba(255,0,255,0.25)");
      glowgrad.addColorStop(1, "rgba(255,0,255,0)");
      ctx.fillStyle = glowgrad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowradius, 0, Math.PI * 2);
      ctx.fill();

      const time = performance.now() / 1000;
      const rot = time * 0.5;
      const shakeAmp = p.shake * (p.charged ? 20 : 8);
      const sx = (Math.random() - 0.5) * shakeAmp;
      const sy = (Math.random() - 0.5) * shakeAmp;

      ctx.save();
      ctx.translate(p.x + sx, p.y + sy);
      ctx.rotate(rot);
      const r = TILE * 2;
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        pts.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
      const cx0 = 0;
      const cy0 = 0;
      for (let i = 0; i < 6; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % 6];
        ctx.beginPath();
        ctx.moveTo(cx0, cy0);
        ctx.lineTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? "black" : "#111";
        ctx.fill();
      }

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      if (p.charged) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 18;
        ctx.stroke();
      } else if (p.charge > 0) {
        ctx.strokeStyle = "magenta";
        ctx.lineWidth = 18;
        ctx.globalAlpha = p.charging ? 0.5 + p.charge / 20 : 0;
        ctx.stroke();
      }

      ctx.restore();
      ctx.restore();

      if (p.circleRadius > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, p.circleRadius, 0, Math.PI * 2);

        ctx.fillStyle = "black";
        ctx.fill();

        ctx.strokeStyle = "magenta";
        ctx.lineWidth = 18;
        ctx.stroke();

        ctx.restore();
      }
    }

    const target = s.nearest;
    if (target && !s.charging) {
      const dx = target.x - mouse.x;
      const dy = target.y - mouse.y;
      const angle = Math.atan2(dy, dx);

      const offset = 40;
      const ax = mouse.x + Math.cos(angle) * offset;
      const ay = mouse.y + Math.sin(angle) * offset;

      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(angle);

      ctx.fillStyle = "magenta";
      ctx.globalAlpha = 1;

      ctx.font = "40px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText("🡒", 0, 0);

      ctx.restore();
    }

    if (pylonDone >= 1) {
      ctx.save();
      ctx.resetTransform();
      ctx.font = "48px Times New Roman";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const text = `${pylonDone}/10`;
      const x = cam.x + window.innerWidth / 2;
      const y = cam.y + window.innerHeight * 0.9;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255,255,255,0.125)";
      ctx.lineWidth = 9;
      ctx.strokeText(text, x, y);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 6;
      ctx.strokeText(text, x, y);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 3;
      ctx.strokeText(text, x, y);

      ctx.fillStyle = "magenta";
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw, name: "Pylons" });
  return unregister;
}
