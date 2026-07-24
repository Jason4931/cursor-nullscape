import { death, mouse } from "../entityHost.js";
import { despawnCatalyst, moveCamera, playSound } from "../main.js";
import { catalystPos } from "./Catalyst.js";

const Catalysthungerpatch5 = [];
for (let i = 1; i <= 16; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Catalyst/Catalysthungerpatch5/Layer ${i}.png`;
  Catalysthungerpatch5.push(img);
}

export function setup(host, overshootBrake) {
  const canvas = host.ctx.canvas;

  const state = {
    x: catalystPos.x,
    y: catalystPos.y,

    layers: Catalysthungerpatch5,
    enemy: null,
    layer: 0,

    vx: 0,
    vy: 0,

    opacity: 1,

    accel: 1000,
    friction: 0.985,
    overshootBrake: overshootBrake,
    maxSpeed: 1800,

    screamTimer: 0,
    nextScream: 19 + Math.random(),
    screaming: false,
    screamDuration: 2,
    camShakeX: 0,
    camShakeY: 0,

    trail: [],
    trailLife: 1,
    extraTrail: [],
  };

  const BODY_RADIUS = 50;

  function update(dt) {
    if (despawnCatalyst) return;
    if (!Number.isFinite(mouse.x)) return;

    state.layer++;
    if (state.layer > state.layers.length) state.layer = 1;
    state.enemy = state.layers[state.layer - 1];

    state.screamTimer += dt;

    if (!state.screaming && state.screamTimer >= state.nextScream) {
      state.screaming = true;
      state.screamTimer = 0;
      playSound(
        Math.random() < 0.5
          ? "./ASSET/Sound/Enemies/Catalyst/CataScream_v1.mp3"
          : "./ASSET/Sound/Enemies/Catalyst/CataScream_v2.mp3",
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      );

      state.accel += 100;
      state.maxSpeed += 100;
    }

    if (state.screaming) {
      const nx = -10 + Math.random() * 20;
      const ny = -10 + Math.random() * 20;

      moveCamera(-state.camShakeX, -state.camShakeY, true);

      moveCamera(nx, ny, true);

      state.camShakeX = nx;
      state.camShakeY = ny;
    }

    if (state.screaming && state.screamTimer >= state.screamDuration) {
      state.screaming = false;
      state.screamTimer = 0;
      state.nextScream = 20 + Math.random() * 5;
    }

    const dx = mouse.x - state.x;
    const dy = mouse.y - state.y;
    const dist = Math.hypot(dx, dy) || 1;

    const ax = dx / dist;
    const ay = dy / dist;

    state.vx += ax * state.accel * dt;
    state.vy += ay * state.accel * dt;

    const dot = state.vx * ax + state.vy * ay;

    state.vx *= state.friction;
    state.vy *= state.friction;

    if (dot < 0) {
      state.vx *= state.overshootBrake;
      state.vy *= state.overshootBrake;
    }

    const speed = Math.hypot(state.vx, state.vy);
    if (speed > state.maxSpeed) {
      const s = state.maxSpeed / speed;
      state.vx *= s;
      state.vy *= s;
    }

    state.x += state.vx * dt;
    state.y += state.vy * dt;

    state.trail.push({
      x: state.x,
      y: state.y,
      life: state.trailLife,
    });
    if (Math.random() < 0.5) {
      state.extraTrail.push({
        x: state.x,
        y: state.y,
        sx: state.x,
        sy: state.y,
        tx: state.x + (Math.random() - 0.5) * 200,
        ty: state.y + (Math.random() - 0.5) * 200,
        t: 0,
      });
    }

    for (let i = state.trail.length - 1; i >= 0; i--) {
      state.trail[i].life -= dt;
      if (state.trail[i].life <= 0) {
        state.trail.splice(i, 1);
      }
    }
    for (let i = state.extraTrail.length - 1; i >= 0; i--) {
      const p = state.extraTrail[i];
      p.t += dt;

      if (p.t < 0.75) {
        const k = p.t / 0.75;
        const eased = 1 - (1 - k) * (1 - k);

        p.x = p.sx + (p.tx - p.sx) * eased;
        p.y = p.sy + (p.ty - p.sy) * eased;
      }

      if (p.t >= 1) {
        state.extraTrail.splice(i, 1);
      }
    }

    if (dist < BODY_RADIUS) death("Catalyst", "#660000");
  }

  function draw(ctx) {
    if (despawnCatalyst) return;
    ctx.save();
    ctx.globalAlpha = state.opacity;

    for (const p of state.extraTrail) {
      let r;

      if (p.t < 0.75) {
        r = 25;
      } else {
        const k = (p.t - 0.75) / 0.25;
        const eased = k * k;
        r = 25 * (1 - eased);
      }

      const glow = 25;
      const grad = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, r + glow);
      grad.addColorStop(0, "rgba(255,0,192,1)");
      grad.addColorStop(1, "rgba(255,0,192,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + glow, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const p of state.extraTrail) {
      let r;

      if (p.t < 0.75) {
        r = 15;
      } else {
        const k = (p.t - 0.75) / 0.25;
        const eased = k * k;
        r = 15 * (1 - eased);
      }

      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(Math.round(p.x), Math.round(p.y), Math.round(r), 0, Math.PI * 2);
      ctx.fill();
    }
    for (const t of state.trail) {
      const a = t.life / state.trailLife;
      const r = (40 + Math.random() * 10) * a;
      const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, r);
      grad.addColorStop(0, "rgba(0,0,255,1)");
      grad.addColorStop(0.5, "rgba(0,0,255,0.75)");
      grad.addColorStop(1, "rgba(255,0,255,0.5)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(Math.round(t.x), Math.round(t.y), Math.round(r), 0, Math.PI * 2);
      ctx.fill();
    }
    for (const t of state.trail) {
      const a = t.life / state.trailLife;
      const r = (40 + Math.random() * 10) * a * a * a;
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(Math.round(t.x), Math.round(t.y), Math.round(r), 0, Math.PI * 2);
      ctx.fill();
    }

    if (state.screaming) {
      for (let i = 0; i < 3; i++) {
        const r = (state.screamTimer * 250 + i * 160) % 500;

        const g = ctx.createRadialGradient(
          Math.round(state.x),
          Math.round(state.y),
          0,
          Math.round(state.x),
          Math.round(state.y),
          Math.round(r),
        );

        g.addColorStop(0, "rgba(0,0,0,0.35)");
        g.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = g;
        ctx.fillRect(0, 0, Math.round(canvas.width), Math.round(canvas.height));
      }

      const maxR = 500;
      const r = (state.screamTimer * 2 * maxR) % maxR;

      if (r > 1) {
        const g = ctx.createRadialGradient(
          Math.round(state.x),
          Math.round(state.y),
          0,
          Math.round(state.x),
          Math.round(state.y),
          Math.round(r),
        );

        g.addColorStop(0.0, "rgba(0,0,0,0)");
        g.addColorStop(0.49, "rgba(0,0,0,0)");
        g.addColorStop(0.5, "rgba(140,255,220,0.32)");
        g.addColorStop(0.675, "rgba(90,210,255,0.22)");
        g.addColorStop(0.8, "rgba(200,150,255,0.15)");
        g.addColorStop(0.925, "rgba(120,255,190,0.07)");
        g.addColorStop(1.0, "rgba(0,0,0,0)");

        ctx.fillStyle = g;
        ctx.fillRect(0, 0, Math.round(canvas.width), Math.round(canvas.height));
      }
    }

    if (state.enemy) {
      ctx.drawImage(
        state.enemy,
        Math.round(state.x - 50),
        Math.round(state.y - 50),
        Math.round(100),
        Math.round(100),
      );
    }

    ctx.restore();
  }

  return host.register({ update, draw, name: "Catalyst" });
}
