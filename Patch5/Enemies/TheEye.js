import { death, mouse } from "../entityHost.js";
import { moveCamera } from "../main.js";

const TheEyeclosed = new Image();
TheEyeclosed.src = "./ASSET/Enemies/TheEye/TheEye-closed.png";
const TheEyehalfopen = new Image();
TheEyehalfopen.src = "./ASSET/Enemies/TheEye/TheEye-halfopen.png";
const TheEyeopen = new Image();
TheEyeopen.src = "./ASSET/Enemies/TheEye/TheEye-open.png";

export function setup(host) {
  const state = {
    opacity: 1,

    active: false,
    x: 0,
    y: 0,
    r: 50,

    spawnTimer: 0,
    fadeT: 0,
    destroyedT: 0,

    stareTime: 0,
    stareLimit: 10,
    respawnTime: 9 + Math.random(),
    destroyed: false,

    frame: 0,
  };

  function spawn() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 400;

    state.x = mouse.x + Math.cos(angle) * dist;
    state.y = mouse.y + Math.sin(angle) * dist;

    state.active = true;
    state.stareTime = 0;
    state.frame = 0;
    state.destroyed = false;
    state.destroyedT = 0;
    state.fadeT = 0;
    state.opacity = 0;
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    const s = state;

    if (!s.active) {
      s.spawnTimer += dt;

      if (s.spawnTimer >= s.respawnTime) {
        s.spawnTimer = 0;
        s.respawnTime = 9 + Math.random();
        spawn();
      }

      return;
    }

    const dx = mouse.x - s.x;
    const dy = mouse.y - s.y;
    const dist = Math.hypot(dx, dy);

    const targetDist = 400;
    if (dist > 0.0001) {
      const nx = dx / dist;
      const ny = dy / dist;

      const tx = mouse.x - nx * targetDist;
      const ty = mouse.y - ny * targetDist;

      const follow = 1 - Math.exp(-0.6 * dt);

      s.x += (tx - s.x) * follow;
      s.y += (ty - s.y) * follow;
    }

    if (s.destroyed) {
      s.destroyedT -= dt;
      if (s.destroyedT <= 0) {
        s.active = false;
        s.destroyed = false;
      }
    }
    if (dist < s.r) {
      s.frame = 0;
      s.destroyed = true;
      s.destroyedT = 0.5;
      s.fadeT = 0;

      moveCamera((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);

      return;
    }

    if (state.active) {
      s.fadeT += dt;
      const fadeDur = 0.25;
      if (!s.destroyed && s.fadeT < fadeDur) {
        const t = s.fadeT / fadeDur;
        s.opacity = 1 - (1 - t) * (1 - t);
      } else if (s.destroyed) {
        const totalDestroy = 0.5;
        if (s.fadeT < totalDestroy - fadeDur) {
          s.opacity = 1;
        } else {
          const t = (s.fadeT - (totalDestroy - fadeDur)) / fadeDur;
          s.opacity = 1 - t * t;
        }
      } else {
        s.opacity = 1;
      }
    }

    if (!s.destroyed && state.active) {
      const t = s.stareTime / s.stareLimit;
      if (t < 0.1) s.frame = 0;
      else if (t < 0.9) s.frame = 1;
      else s.frame = 2;

      s.stareTime += dt;
      if (s.stareTime >= s.stareLimit) {
        death("TheEye");
        s.frame = 0;
        s.destroyed = true;
        s.destroyedT = 0.5;
        s.fadeT = 0;
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    const s = state;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (s.active) {
      const dx = mouse.x - s.x;
      const dy = mouse.y - s.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0.001 && !s.destroyed) {
        const angle = Math.atan2(dy, dx);

        const t = Math.min(s.stareTime / s.stareLimit, 1);
        const alpha = t * 0.6;

        const coneLen = dist * (s.frame == 2 ? 1 + 2 * (s.stareTime - 9) : 1);
        const coneWidth =
          (120 + 200 * t) * (s.frame == 2 ? 1 + 2 * (s.stareTime - 9) : 1);

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(angle);

        const grad = ctx.createLinearGradient(0, 0, coneLen, 0);
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(0.3, `rgba(255,255,255,${alpha * 0.4})`);
        grad.addColorStop(1, `rgba(255,255,255,0)`);

        ctx.fillStyle = grad;
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.moveTo(coneLen, -coneWidth / 2);
        ctx.lineTo(0, 0);
        ctx.lineTo(coneLen, coneWidth / 2);
        ctx.closePath();
        ctx.fill();

        for (let i = 0; i < 3; i++) {
          const offset = (Math.random() - 0.5) * 40;
          const widthJitter = coneWidth * (0.9 + Math.random() * 0.2);

          ctx.globalAlpha = alpha * 0.5;

          ctx.beginPath();
          ctx.moveTo(coneLen, -widthJitter / 2 + offset);
          ctx.lineTo(0, offset);
          ctx.lineTo(coneLen, widthJitter / 2 + offset);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      let img = TheEyeclosed;
      if (s.frame === 1)
        img = Math.random() < 0.01 ? TheEyeclosed : TheEyehalfopen;
      else if (s.frame === 2) img = TheEyeopen;

      const size = s.r * 2;

      const t = Math.min(s.stareTime / s.stareLimit, 1);
      const twitchStrength =
        Math.random() < (t < 0.9 ? 0.25 * t : 1) ? 4 + 12 * t : 0;
      const jitterX = (Math.random() - 0.5) * twitchStrength;
      const jitterY = (Math.random() - 0.5) * twitchStrength;
      let spikeX = 0;
      let spikeY = 0;
      if (Math.random() < 0.1 * t) {
        spikeX = (Math.random() - 0.5) * 20 * t;
        spikeY = (Math.random() - 0.5) * 20 * t;
      }
      const drawX = s.x + jitterX + spikeX;
      const drawY = s.y + jitterY + spikeY;

      ctx.drawImage(img, drawX - s.r, drawY - s.r, size, size);
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
