import { death, mouse } from "../entityHost.js";
import { pickRandomPlaced4or5 } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Cadence.png";

const violin = new Image();
violin.src = "./ASSET/Misc/Violin.png";
const harp = new Image();
harp.src = "./ASSET/Misc/Harp.png";

export function setup(host) {
  const canvas = host.canvas;

  const state = {
    x: canvas.width / 2,
    y: canvas.height / 2,

    mode: "idle",
    timer: 0,
    nextDelay: 0,

    instruments: [],
    arrowAngle: 0,
  };

  const SPAWN_MIN = 14;
  const SPAWN_MAX = 15;
  const AGRO_SPEED = 900;
  const PICKUP_RADIUS = 28;

  function rollDelay() {
    state.nextDelay = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
    state.timer = 0;
  }

  function spawnInstrument() {
    const pos = pickRandomPlaced4or5(500);
    state.instruments.push({
      x: pos.x,
      y: pos.y,
      img: Math.random() < 0.5 ? violin : harp,
    });
  }

  function resetToIdle() {
    state.mode = "idle";
    enemy.src = "./ASSET/Enemies/Cadence.png";
    rollDelay();
  }

  function getNearestInstrument() {
    let best = null;
    let bestD2 = Infinity;

    for (const it of state.instruments) {
      if (it.pickedUp) continue;
      const dx = it.x - mouse.x;
      const dy = it.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = it;
      }
    }
    return best;
  }

  function update(dt) {
    state.timer += dt;
    if (state.instruments.length >= 2) {
      const target = getNearestInstrument();
      if (target) {
        const dx = target.x - mouse.x;
        const dy = target.y - mouse.y;
        state.arrowAngle = Math.atan2(dy, dx);
      }
    }

    for (let i = state.instruments.length - 1; i >= 0; i--) {
      const it = state.instruments[i];
      const dx = it.x - mouse.x;
      const dy = it.y - mouse.y;
      if (it.pickedUp) {
        it.pickTimer += dt;
        if (it.pickTimer >= 1) {
          const idx = state.instruments.indexOf(it);
          if (idx !== -1) state.instruments.splice(idx, 1);
        }
      } else {
        if (dx * dx + dy * dy < PICKUP_RADIUS * PICKUP_RADIUS) {
          it.pickedUp = true;
          it.pickTimer = 0;
          resetToIdle();
        }
      }
    }

    if (state.mode === "idle") {
      if (state.timer >= state.nextDelay) {
        if (state.instruments.length < 2) {
          spawnInstrument();
          rollDelay();
        } else {
          state.mode = "agro";
          enemy.src = "./ASSET/Enemies/CadenceAgro.png";
        }
      }
    }

    if (state.mode === "agro") {
      const dx = mouse.x - state.x;
      const dy = mouse.y - state.y;
      const len = Math.hypot(dx, dy) || 1;

      state.x += (dx / len) * AGRO_SPEED * dt;
      state.y += (dy / len) * AGRO_SPEED * dt;

      if (len < 24) {
        death("Cadence");
      }
    }
  }

  const LINK_R = 5;
  const DASH_W = 12;
  const DASH_H = 3;
  const STEP = 14;

  function drawChain(ctx, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy) || 1;

    const ux = dx / dist;
    const uy = dy / dist;

    for (let d = 0; d < dist; d += STEP) {
      const cx = x1 + ux * d;
      const cy = y1 + uy * d;

      const grad = ctx.createRadialGradient(
        cx - LINK_R * 0.4,
        cy - LINK_R * 0.4,
        1,
        cx,
        cy,
        LINK_R
      );
      grad.addColorStop(0, "#fff0");
      grad.addColorStop(0.6, "#fff0");
      grad.addColorStop(0.61, "#8a8a8a");
      grad.addColorStop(1, "#8a8a8a");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc((cx + 0.5) | 0, (cy + 0.5) | 0, LINK_R, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#8a8a8a";
      const dx2 = cx + ux * (LINK_R + DASH_W / 2);
      const dy2 = cy + uy * (LINK_R + DASH_W / 2);

      ctx.save();
      ctx.translate((dx2 + 0.5) | 0, (dy2 + 0.5) | 0);
      ctx.rotate(Math.atan2(uy, ux));
      ctx.fillRect(-DASH_W / 2, -DASH_H / 2, DASH_W, DASH_H);
      ctx.restore();
    }
  }

  function drawArrow(ctx) {
    const len = 20;
    const wing = 20;

    ctx.beginPath();
    ctx.moveTo(0, -len);
    ctx.lineTo(wing, 0);
    ctx.lineTo(0, len);
    ctx.lineTo(wing / 2, 0);
    ctx.closePath();
  }

  function draw(ctx) {
    ctx.save();

    for (const it of state.instruments) {
      drawChain(ctx, state.x, state.y, it.x, it.y);
    }
    const grad = ctx.createRadialGradient(
      state.x,
      state.y,
      0,
      state.x,
      state.y,
      150
    );
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(0.6, "rgba(0,0,0,1)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(state.x, state.y, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(
      enemy,
      Math.round(state.x - 100),
      Math.round(state.y - 100),
      200,
      200
    );

    for (const it of state.instruments) {
      if (it.pickedUp) {
        const t = it.pickTimer / 1;
        const rOuter = 40 - 10 * t;
        const rInner = 15 - 10 * t;
        const alpha = 1 - t;

        ctx.save();
        ctx.globalAlpha = alpha;

        const grad = ctx.createRadialGradient(
          it.x,
          it.y - 10,
          0,
          it.x,
          it.y - 10,
          50
        );
        grad.addColorStop(0, "rgba(0,0,0,1)");
        grad.addColorStop(0.4, "rgba(0,0,0,1)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(it.x, it.y - 10, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(
          it.img,
          Math.round(it.x - 50),
          Math.round(it.y - 75),
          100,
          100
        );
        ctx.restore();

        ctx.save();
        ctx.translate(it.x, it.y - 10);
        ctx.beginPath();
        ctx.moveTo(0, -rOuter);
        ctx.lineTo(rInner, -rInner);
        ctx.lineTo(rOuter, 0);
        ctx.lineTo(rInner, rInner);
        ctx.lineTo(0, rOuter);
        ctx.lineTo(-rInner, rInner);
        ctx.lineTo(-rOuter, 0);
        ctx.lineTo(-rInner, -rInner);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
        ctx.fill();
        ctx.restore();
      } else {
        const grad = ctx.createRadialGradient(
          it.x,
          it.y - 10,
          0,
          it.x,
          it.y - 10,
          50
        );
        grad.addColorStop(0, "rgba(0,0,0,1)");
        grad.addColorStop(0.4, "rgba(0,0,0,1)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(it.x, it.y - 10, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(
          it.img,
          Math.round(it.x - 50),
          Math.round(it.y - 75),
          100,
          100
        );
      }
    }

    if (state.instruments.length >= 2) {
      ctx.save();
      const ARROW_OFFSET = 24;
      ctx.translate(
        mouse.x + Math.cos(state.arrowAngle) * ARROW_OFFSET,
        mouse.y + Math.sin(state.arrowAngle) * ARROW_OFFSET
      );
      ctx.rotate(state.arrowAngle);

      ctx.fillStyle = "rgba(255,255,255,0.9)";
      drawArrow(ctx);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  rollDelay();
  const unregister = host.register({ update, draw });
  return unregister;
}
