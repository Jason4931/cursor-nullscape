import { death, mouse } from "../entityHost.js";
import { playSound, uldm } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Scrapmaw.png";

export let blueprintCrossBeamsActive = [false];
export function setup(host, casualMode, hardMode) {
  const state = {
    opacity: 1,
    phase: "idle",
    phaseT: 0,
    idleDuration: 0,

    appearLine: null,
    attackData: null,
    disappearData: null,
    lasers: [],
    ellipseFX: [],

    deathSound: null,
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    for (const lz of state.lasers) {
      lz.t += dt;
      if (lz.t >= lz.life - 0.5 && lz.t <= lz.life - 0.4) {
        const halfLen = 20000;

        const ax = lz.x + lz.nx * halfLen;
        const ay = lz.y + lz.ny * halfLen;

        const bx = lz.x - lz.nx * halfLen;
        const by = lz.y - lz.ny * halfLen;

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

        if (dist < 7 * (lz.bold ? 2 : 1)) {
          if (!state.deathSound) {
            state.deathSound = playSound(
              "./ASSET/Sound/Enemies/Scrapmaw/Scrapmaw_Kill.ogg",
              undefined,
              undefined,
              undefined,
              () => {
                state.deathSound = null;
              },
            );
          }
          death("Scrapmaw");
        }
      }
      if (lz.t >= lz.life) {
        state.lasers = state.lasers.filter((x) => x !== lz);
      }
    }
    for (const e of state.ellipseFX) {
      e.t += dt;
    }

    state.phaseT += dt;
    if (state.phase === "idle") {
      if (state.phaseT >= 1.25 && state.phaseT <= 1.25 + dt) {
        playSound("./ASSET/Sound/Enemies/Scrapmaw/Scrapmaw_PortalLeave.ogg");
      }
      if (state.phaseT >= state.idleDuration) {
        state.phaseT = 0;
        state.phase = "appear";
        playSound("./ASSET/Sound/Enemies/Scrapmaw/Scrapmaw_Portal.ogg");
        playSound("./ASSET/Sound/Enemies/Scrapmaw/Scrapmaw_Spawn.ogg");
      }
    }
    if (state.phase === "appear") {
      const ang = Math.random() * Math.PI * 2;
      const cx = mouse.x + Math.cos(ang) * 2000;
      const cy = mouse.y + Math.sin(ang) * 2000;

      if (!state.appearLine) {
        const ang = Math.random() * Math.PI * 2;
        const tx = mouse.x + Math.cos(ang) * 400;
        const ty = mouse.y + Math.sin(ang) * 400;

        const dx = tx - cx;
        const dy = ty - cy;
        const len = Math.hypot(dx, dy) || 1;

        const nx = dx / len;
        const ny = dy / len;

        const baseLen = Math.hypot(tx - cx, ty - cy);

        state.appearLine = {
          cx,
          cy,
          tx,
          ty,
          nx,
          ny,
          baseLen,
          thickness: 200,
          baseThickness: 200,
        };
      }

      if (state.phaseT >= 1.5) {
        const l = state.appearLine;

        const lasers = [];
        const dx = l.tx - l.cx;
        const dy = l.ty - l.cy;
        const baseAng = Math.atan2(dy, dx);
        const rand = 0.25 + Math.random() * 0.5;
        const ang = baseAng + Math.PI * rand;
        const nx = Math.cos(ang);
        const ny = Math.sin(ang);
        const px = -ny;
        const py = nx;
        const midX = (l.cx + l.tx) * 0.5;
        const midY = (l.cy + l.ty) * 0.5;
        const laserCount = 60;
        const spacing = 150;
        for (let i = 0; i < laserCount; i++) {
          const offset = (i - (laserCount - 1) / 2) * spacing;
          lasers.push({
            x: midX + px * offset,
            y: midY + py * offset,
            ang,
            nx,
            ny,
            t: 0,
            life: 2,
          });
        }
        if (blueprintCrossBeamsActive[0]) {
          const nx2 = Math.cos(ang + Math.PI / 2);
          const ny2 = Math.sin(ang + Math.PI / 2);
          const px2 = -ny2;
          const py2 = nx2;
          for (let i = 0; i < laserCount; i++) {
            const offset = (i - (laserCount - 1) / 2) * spacing;
            lasers.push({
              x: midX + px2 * offset,
              y: midY + py2 * offset,
              ang: ang + Math.PI / 2,
              nx: nx2,
              ny: ny2,
              t: 0,
              life: 2,
            });
          }
        }
        state.lasers = lasers;

        const targetX = midX - l.nx;
        const targetY = midY - l.ny;

        state.attackData = {
          x: l.cx,
          y: l.cy,
          startX: l.cx,
          startY: l.cy,
          targetX,
          targetY,
          t: 0,
          life: 0.5,
        };

        state.phase = "attack";
        state.phaseT = 0;
      }
    }
    if (state.phase === "attack") {
      const a = state.attackData;

      const l = state.appearLine;
      if (l) {
        const dx = l.tx - l.cx;
        const dy = l.ty - l.cy;

        const len2 = dx * dx + dy * dy || 1;

        const t = ((mouse.x - l.cx) * dx + (mouse.y - l.cy) * dy) / len2;

        const px = l.cx + dx * t;
        const py = l.cy + dy * t;

        const dist = Math.hypot(mouse.x - px, mouse.y - py);

        if (dist < l.baseThickness) {
          if (!state.deathSound) {
            state.deathSound = playSound(
              "./ASSET/Sound/Enemies/Scrapmaw/Scrapmaw_Kill.ogg",
              undefined,
              undefined,
              undefined,
              () => {
                state.deathSound = null;
              },
            );
          }
          death("Scrapmaw");
        }
      }

      const reachTime = 0.4;

      a.t += dt;

      const dx = a.targetX - a.startX;
      const dy = a.targetY - a.startY;
      const len = Math.hypot(dx, dy) || 1;

      const nx = dx / len;
      const ny = dy / len;

      if (a.t < reachTime) {
        const p = a.t / reachTime;
        const eased = 1 - Math.pow(1 - p, 2);

        a.x = a.startX + dx * eased;
        a.y = a.startY + dy * eased;
      } else {
        const driftT = a.t - reachTime;

        a.x = a.targetX + nx * 200 * driftT;
        a.y = a.targetY + ny * 200 * driftT;
      }

      if (state.phaseT >= 0.5 && !state.laserAudio) {
        state.laserAudio = true;
        playSound("./ASSET/Sound/Enemies/Scrapmaw/ScrapmawLazerCharging.ogg");
        playSound("./ASSET/Sound/Enemies/Scrapmaw/ScrapmawLazerFire.ogg");
      }

      if (state.phaseT >= 1.5) {
        const l = state.appearLine;

        const dx = l.tx - l.cx;
        const dy = l.ty - l.cy;
        const len = Math.hypot(dx, dy) || 1;

        const nx = dx / len;
        const ny = dy / len;

        const endX = l.tx + nx * 2000;
        const endY = l.ty + ny * 2000;

        state.disappearData = {
          x: l.cx,
          y: l.cy,
          startX: l.cx,
          startY: l.cy,

          targetX: endX,
          targetY: endY,

          nx,
          ny,
          t: 0,
          life: 1,
          fadeTime: 0.5,
        };

        state.attackData = null;
        state.phase = "disappear";
        state.phaseT = 0;

        if (hardMode) {
          const dx = mouse.x - l.cx;
          const dy = mouse.y - l.cy;
          const len = Math.hypot(dx, dy) || 1;

          const nx = dx / len;
          const ny = dy / len;

          state.lasers.push({
            x: l.cx,
            y: l.cy,
            nx,
            ny,
            t: 0,
            life: 1,
            bold: true,
          });
          playSound("./ASSET/Sound/Enemies/Scrapmaw/ScrapmawLazerFire.ogg", 2);
        }

        const cx = (l.cx + l.tx) * 0.5;
        const cy = (l.cy + l.ty) * 0.5;
        state.ellipseFX = [
          { p: 0.8, r: 600, t: 0, life: 0.4 },
          { p: 1.2, r: 450, t: 0, life: 0.4 },
          { p: 1.6, r: 300, t: 0, life: 0.4 },
        ];
        state.ellipseBase = {
          cx,
          cy,
          nx,
          ny,
        };
      }
    }
    if (state.phase === "disappear") {
      const d = state.disappearData;

      const l = state.appearLine;
      if (l) {
        const shrinkP = Math.min(1, state.phaseT / 0.5);
        const eased = 1 - Math.pow(1 - shrinkP, 2);

        l.thickness = l.baseThickness * (1 - eased);
      }
      d.t += dt;

      const moveEnd = Math.max(0, d.life - d.fadeTime);
      const moveP = Math.min(1, d.t / moveEnd);
      const moveEased = 1 - Math.pow(1 - moveP, 2);

      const dx = d.targetX - d.startX;
      const dy = d.targetY - d.startY;

      d.x = d.startX + dx * moveEased;
      d.y = d.startY + dy * moveEased;

      if (d.t >= moveEnd) {
        d.x = d.targetX;
        d.y = d.targetY;
      }

      if (state.phaseT >= 0.25 && state.phaseT <= 0.25 + dt) {
        playSound("./ASSET/Sound/Enemies/Scrapmaw/Scrapmaw_Leave.ogg");
      }

      if (state.phaseT >= 0.5) {
        state.opacity = 1;

        state.phase = "idle";
        state.phaseT = 0;
        state.idleDuration = 20 + Math.random();

        state.appearLine = null;
        state.attackData = null;
        state.disappearData = null;
        state.laserAudio = false;
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (state.appearLine) {
      const l = state.appearLine;

      const thickness = l.thickness;

      const perpX = -l.ny;
      const perpY = l.nx;

      const forward = 20000;
      const backward = 20000;
      const fx = l.tx + l.nx * forward;
      const fy = l.ty + l.ny * forward;
      const bx = l.cx - l.nx * backward;
      const by = l.cy - l.ny * backward;

      const x1 = bx + perpX * thickness;
      const y1 = by + perpY * thickness;

      const x2 = bx - perpX * thickness;
      const y2 = by - perpY * thickness;

      const x3 = fx - perpX * thickness;
      const y3 = fy - perpY * thickness;

      const x4 = fx + perpX * thickness;
      const y4 = fy + perpY * thickness;

      const grad = ctx.createLinearGradient(
        l.cx + perpX * thickness,
        l.cy + perpY * thickness,
        l.cx - perpX * thickness,
        l.cy - perpY * thickness,
      );
      grad.addColorStop(0, "rgba(255,0,0,0)");
      grad.addColorStop(0.25, "rgba(255,0,0,0.75)");
      grad.addColorStop(0.333, "rgba(255,64,0,0.9)");
      grad.addColorStop(0.5, "rgba(255,128,0,1)");
      grad.addColorStop(0.667, "rgba(255,64,0,0.9)");
      grad.addColorStop(0.75, "rgba(255,0,0,0.75)");
      grad.addColorStop(1, "rgba(255,0,0,0)");

      ctx.fillStyle = grad;

      ctx.save();
      ctx.globalAlpha =
        state.phase == "appear" ? Math.min(1, state.phaseT * 4) : 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    for (const lz of state.lasers) {
      let scale = 1;
      if (lz.t > lz.life - 0.5) {
        const sp = Math.min(1, (lz.t - (lz.life - 0.5)) / 0.5);
        scale = 1 - sp;
      }

      if (scale <= 0) continue;

      const perpX = -lz.ny;
      const perpY = lz.nx;

      const thickness =
        7 *
        (lz.bold ? (lz.t > lz.life - 0.5 ? 2 : 1 + Math.random()) : 1) *
        scale;

      const halfLen = 20000;

      const fx = lz.x + lz.nx * halfLen;
      const fy = lz.y + lz.ny * halfLen;

      const bx = lz.x - lz.nx * halfLen;
      const by = lz.y - lz.ny * halfLen;

      const x1 = fx + perpX * thickness;
      const y1 = fy + perpY * thickness;

      const x2 = fx - perpX * thickness;
      const y2 = fy - perpY * thickness;

      const x3 = bx - perpX * thickness;
      const y3 = by - perpY * thickness;

      const x4 = bx + perpX * thickness;
      const y4 = by + perpY * thickness;

      ctx.save();
      ctx.globalAlpha = lz.t < 0.25 ? Math.min(1, state.phaseT * 4) : 1;
      ctx.fillStyle = lz.t > lz.life - 0.5 ? "orange" : "red";

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
    if (state.ellipseFX.length && state.ellipseBase && !uldm) {
      const { cx, cy, nx, ny } = state.ellipseBase;

      const perpX = -ny;
      const perpY = nx;

      for (const e of state.ellipseFX) {
        const p = Math.min(1, e.t / e.life);
        const eased = 1 - Math.pow(1 - p, 2);

        const alpha = 1 - p;
        const scale = eased;

        const px = cx + nx * (e.p * 800);
        const py = cy + ny * (e.p * 800);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "orange";
        ctx.lineWidth = 18;

        ctx.translate(px, py);
        ctx.rotate(Math.atan2(ny, nx));

        ctx.beginPath();
        ctx.ellipse(0, 0, e.r * 0.4 * scale, e.r * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }
    }
    if (state.attackData || state.disappearData) {
      const obj = state.attackData || state.disappearData;

      const dx = obj.targetX - obj.startX;
      const dy = obj.targetY - obj.startY;
      const len = Math.hypot(dx, dy) || 1;

      const nx = dx / len;
      const ny = dy / len;

      const angle = Math.atan2(dy, dx);
      const backwardOffset = 1000;

      const px = obj.x - nx * backwardOffset;
      const py = obj.y - ny * backwardOffset;

      const length = 3000;
      const height = 600;

      ctx.save();
      ctx.globalAlpha =
        state.phase == "disappear"
          ? Math.max(0, 1 - state.phaseT * 4)
          : Math.min(1, state.phaseT * 4);

      ctx.translate(px, py);
      ctx.rotate(angle);

      ctx.drawImage(enemy, 0, -height / 2, length, height);
      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
