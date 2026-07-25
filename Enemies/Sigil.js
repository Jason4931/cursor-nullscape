import { death, mouse } from "../entityHost.js";
import { canvas, playSound, soundStopped, uldm } from "../main.js";

const Sigil = [];
for (let i = 1; i <= 75; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Sigil/Layer ${i}.png`;
  Sigil.push(img);
}

export function setup(host) {
  const state = {
    opacity: 1,
    layers: Sigil,
    enemy: null,
    layer: 0,
    phase: "wander",
    phaseT: 0,

    wanderDirT: 100,
    wanderDuration: 9 + Math.random(),

    w: 100,
    angle: 0,

    targetX: 0,
    targetY: 0,

    angle: 0,
    beamAlpha: 0,
    beamActive: false,
    x: canvas.width / 2,
    y: canvas.height / 2,

    sound: null,
    wanderDirX: 0,
    wanderDirY: 0,
    glyphRings: [],
    glyphRingCanvases: [],
    trailCircles: [],
    trailTimer: 0,
  };
  const glyphs = "ᚠᚢᚦᚨᚱᚲΩΣΨΔΘΛЖҖҜ※✧✦✩☯☸✶✷✹✺";
  for (let i = 0; i < 3; i++) {
    state.glyphRings.push({
      radius: 80 + i * 40,
      angle: Math.random() * Math.PI * 2,
      speed: (Math.random() * 0.5 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
      count: 16 + Math.floor(Math.random() * 8),
      offset: Math.floor(Math.random() * glyphs.length),
    });
  }
  for (const ring of state.glyphRings) {
    const off = document.createElement("canvas");
    off.width = ring.radius * 4;
    off.height = ring.radius * 4;
    const octx = off.getContext("2d");

    octx.translate(off.width / 2, off.height / 2);
    octx.fillStyle = "orange";
    octx.font = "30px serif";
    octx.textAlign = "center";
    octx.textBaseline = "middle";

    for (let i = 0; i < ring.count; i++) {
      const ang = (i * Math.PI * 2) / ring.count;

      const x = Math.cos(ang) * ring.radius;
      const y = Math.sin(ang) * ring.radius;

      const char = glyphs[(i + ring.offset) % glyphs.length];

      octx.save();
      octx.translate(x, y);
      octx.rotate(ang + Math.PI / 2);
      octx.fillText(char, 0, 0);
      octx.restore();
    }

    state.glyphRingCanvases.push(off);
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.phaseT += dt;
    state.layer++;
    if (state.layer > state.layers.length) state.layer = 1;
    state.enemy = state.layers[state.layer - 1];

    for (let i = state.trailCircles.length - 1; i >= 0; i--) {
      const c = state.trailCircles[i];
      c.t += dt;
      const p = c.t / c.life;
      const eased = 1 - (1 - p) * (1 - p);
      c.r = eased * 200;
      if (c.t >= c.life) {
        state.trailCircles.splice(i, 1);
      }
    }

    if (state.phase === "wander") {
      state.wanderDirT += dt;
      if (state.wanderDirT >= 1) {
        state.wanderDirT = 0;

        const dx = mouse.x - state.x;
        const dy = mouse.y - state.y;
        const len = Math.hypot(dx, dy) || 1;

        const nx = dx / len;
        const ny = dy / len;

        let rx = (Math.random() < 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5);
        let ry = (Math.random() < 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5);
        const bias = 0.3;

        state.targetDirX = rx + nx * bias;
        state.targetDirY = ry + ny * bias;
      }

      const follow = 1 - Math.exp(-3 * dt);

      state.wanderDirX += (state.targetDirX - state.wanderDirX) * follow;
      state.wanderDirY += (state.targetDirY - state.wanderDirY) * follow;

      state.x += state.wanderDirX * 300 * dt;
      state.y += state.wanderDirY * 300 * dt;

      if (state.phaseT >= state.wanderDuration) {
        state.phase = "moveToSpot";
        state.phaseT = 0;
        playSound(`./ASSET/Sound/Enemies/Sigil/Sigil_Warning.ogg`);
        playSound(`./ASSET/Sound/Enemies/Sigil/Sigil_Reposition.ogg`);

        const ang = Math.random() * Math.PI * 2;
        state.targetX = mouse.x + Math.cos(ang) * 1000;
        state.targetY = mouse.y + Math.sin(ang) * 1000;

        state.startX = state.x;
        state.startY = state.y;
      }
    }
    if (state.phase === "moveToSpot") {
      const p = Math.min(1, state.phaseT / 1.0);
      const eased = 1 - (1 - p) * (1 - p);

      state.x = state.startX + (state.targetX - state.startX) * eased;
      state.y = state.startY + (state.targetY - state.startY) * eased;

      if (p >= 1) {
        state.phase = "indicator";
        state.phaseT = 0;
        playSound(`./ASSET/Sound/Enemies/Sigil/Sigil_Laser_Charge.ogg`);
      }
    }
    if (state.phase === "indicator") {
      const p = Math.min(1, state.phaseT / 0.5);
      state.beamAlpha = 0.5 * p;

      const dx = mouse.x - state.x;
      const dy = mouse.y - state.y;
      const targetAngle = Math.atan2(dy, dx);

      let diff = targetAngle - state.angle;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;

      state.angle += diff * 0.05;

      if (state.phaseT >= 3) {
        state.phase = "fire";
        state.phaseT = 0;
        playSound(`./ASSET/Sound/Enemies/Sigil/Sigil_Laser_Firing.ogg`);
        state.beamAlpha = 1;
        state.trailTimer = 1;
      }
    }
    if (state.phase === "fire") {
      state.trailTimer += dt;
      if (state.trailTimer >= 0.25) {
        state.trailTimer = 0;

        state.trailCircles.push({
          x: state.x,
          y: state.y,
          t: 0,
          life: 0.5,
          r: 0,
        });
      }

      const dx = mouse.x - state.x;
      const dy = mouse.y - state.y;
      const targetAngle = Math.atan2(dy, dx);

      let diff = targetAngle - state.angle;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;

      state.angle += diff * 0.05;
      state.beamActive = true;

      const cos = Math.cos(-state.angle);
      const sin = Math.sin(-state.angle);

      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;

      const len = 20000;
      const w = 100;

      if (rx > 0 && rx < len && Math.abs(ry) < w / 2) {
        death("Sigil");
      }

      if (state.phaseT >= 2.5) {
        state.phase = "shrink";
        state.phaseT = 0;
      }
    }
    if (state.phase === "shrink") {
      state.w = (state.w || 100) - dt * 200;

      if (state.w <= 0) {
        state.beamActive = false;
        state.beamAlpha = 0;
        state.phase = "wander";
        state.phaseT = 0;
        state.w = 100;
        state.wanderDuration = 9 + Math.random();
      }
    }

    const dx = mouse.x - state.x;
    const dy = mouse.y - state.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= 200) {
      state.opacity = 0.5;
    } else {
      state.opacity = 1;
    }
    if (!soundStopped) {
      if (dist <= 500) {
        if (!state.sound)
          state.sound = playSound(
            `./ASSET/Sound/Enemies/Sigil/Sigil_Ambience.ogg`,
            undefined,
            undefined,
            undefined,
            () => {
              state.sound = null;
            },
          );
      } else {
        if (state.sound) {
          state.sound();
          state.sound = null;
        }
      }
    } else {
      if (state.sound) {
        state.sound();
        state.sound = null;
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();

    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.rotate(state.angle);
    ctx.globalAlpha = state.beamAlpha;

    const len = 20000;
    const w =
      (state.w || 100) *
      (state.beamAlpha <= 0.5 ? 1 : 0.8 + Math.random() * 0.2);

    const forwardOffset = w / 4;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(forwardOffset, -w / 2);
    ctx.lineTo(forwardOffset, w / 2);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
    grad.addColorStop(0, "rgba(255,255,0,0)");
    grad.addColorStop(0.5, "rgba(255,255,0,1)");
    grad.addColorStop(1, "rgba(255,255,0,0)");

    ctx.fillStyle = state.beamAlpha <= 0.5 ? grad : "yellow";
    ctx.fill();

    ctx.beginPath();
    ctx.rect(forwardOffset - 0.25, -w / 2, len, w);
    ctx.fill();

    ctx.restore();

    if (!uldm) {
      ctx.save();
      ctx.translate(state.x, state.y);

      for (let i = 0; i < state.glyphRings.length; i++) {
        const ring = state.glyphRings[i];
        const img = state.glyphRingCanvases[i];

        ring.angle += ring.speed * 0.05;

        ctx.save();
        ctx.rotate(ring.angle);

        ctx.globalAlpha = Math.max(
          0.1,
          state.beamAlpha <= 0.5 ? state.beamAlpha * 1.5 : 0,
        );

        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        ctx.restore();
      }

      ctx.restore();

      ctx.save();
      const glow = ctx.createRadialGradient(
        state.x,
        state.y,
        0,
        state.x,
        state.y,
        200,
      );
      glow.addColorStop(0, "rgba(255,255,0,0.1)");
      glow.addColorStop(1, "rgba(255,255,0,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(state.x, state.y, 200, 0, Math.PI * 2);
      ctx.fill();
      for (const c of state.trailCircles) {
        const p = c.t / c.life;

        ctx.save();

        ctx.globalAlpha = 1 - p;
        ctx.fillStyle = "yellow";

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
      ctx.restore();

      if (state.phase === "indicator") {
        const glow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          50,
        );

        glow.addColorStop(0, "rgba(255,255,0,0.5)");
        glow.addColorStop(1, "rgba(255,255,0,0)");

        ctx.save();
        ctx.globalAlpha = state.beamAlpha;
        ctx.fillStyle = glow;

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.globalAlpha = state.opacity;
    ctx.drawImage(state.enemy, state.x - 200, state.y - 200, 400, 400);

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
