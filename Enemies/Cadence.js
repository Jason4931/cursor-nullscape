import { death, mouse } from "../entityHost.js";
import { pickRandomPlaced4or5, moveCamera, playSound } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Cadence.png";

const violin = new Image();
violin.src = "./ASSET/Misc/Violin.png";
const harp = new Image();
harp.src = "./ASSET/Misc/Harp.png";

export function setup(host, hardMode) {
  const canvas = host.canvas;

  const state = {
    x: canvas.width / 2,
    y: canvas.height / 2,

    mode: "idle",
    timer: 0,
    nextDelay: 0,

    instruments: [],
    arrowAngle: 0,

    soundState: 1,
    sound: null,
    instrumentSounds: [null, null, null],
  };

  const SPAWN_MIN = 11.5;
  const SPAWN_MAX = 12.5;
  const AGRO_SPEED = hardMode ? 1350 : 900;
  const PICKUP_RADIUS = 56;

  function rollDelay() {
    state.nextDelay = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
    state.timer = 0;
  }

  function spawnInstrument() {
    playSound("./ASSET/Sound/Enemies/Cadence/Cad_Instrument.wav");
    const pos = pickRandomPlaced4or5(500);
    state.instruments.push({
      x: pos.x,
      y: pos.y,
      img: Math.random() < 0.5 ? violin : harp,
    });
  }

  function resetToIdle() {
    if (state.mode === "agro")
      playSound(
        "./ASSET/Sound/Enemies/Cadence/Cadence_ChaseStop.ogg",
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      );
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
    if (state.instruments.length >= (hardMode ? 2 : 3)) {
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
        if (state.instrumentSounds[i]) {
          state.instrumentSounds[i]();
          state.instrumentSounds[i] = null;
        }
      } else {
        if (dx * dx + dy * dy < PICKUP_RADIUS * PICKUP_RADIUS) {
          it.pickedUp = true;
          it.pickTimer = 0;
          if (it.img === harp)
            playSound("./ASSET/Sound/Enemies/Cadence/CollectHarp.wav");
          else playSound("./ASSET/Sound/Enemies/Cadence/CollectViolin.wav");
          resetToIdle();
        }
        if (!state.instrumentSounds[i])
          state.instrumentSounds[i] = playSound(
            `./ASSET/Sound/Enemies/Cadence/${it.img === harp ? "Harp" : "Violin"}Ambience.wav`,
            undefined,
            undefined,
            undefined,
            () => {
              state.instrumentSounds[i] = null;
            },
            "1000",
          );
      }
    }

    if (state.mode === "idle") {
      if (state.timer >= state.nextDelay) {
        if (state.instruments.length < (hardMode ? 2 : 3)) {
          spawnInstrument();
          rollDelay();
        } else {
          state.mode = "agro";
          playSound(
            "./ASSET/Sound/Enemies/Cadence/Cadence_ChaseImpact.ogg",
            undefined,
            undefined,
            undefined,
            undefined,
            true,
          );
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

    if (state.mode === "idle") {
      if (state.soundState != state.instruments.length && state.sound) {
        state.sound();
        state.sound = null;
      }
      state.soundState = state.instruments.length;
      if (!state.sound)
        state.sound = playSound(
          `./ASSET/Sound/Enemies/Cadence/Cad_lv${state.instruments.length + (hardMode ? 2 : 1)}.wav`,
          undefined,
          undefined,
          undefined,
          () => {
            state.sound = null;
          },
          true,
        );
    } else {
      if (state.soundState != (hardMode ? 3 : 4) && state.sound) {
        state.sound();
        state.sound = null;
      }
      state.soundState = hardMode ? 3 : 4;
      if (!state.sound)
        state.sound = playSound(
          "./ASSET/Sound/Enemies/Cadence/CadenceChase.ogg",
          undefined,
          undefined,
          undefined,
          () => {
            state.sound = null;
          },
          true,
        );
    }
  }

  const LINK_R = 5;
  const DASH_W = 12;
  const DASH_H = 3;
  const STEP = 14;

  function drawChain(ctx, x1, y1, x2, y2) {
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    x2 = Math.round(x2);
    y2 = Math.round(y2);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy) || 1;

    const ux = dx / dist;
    const uy = dy / dist;

    for (let d = 0; d < dist; d += STEP) {
      const cx = Math.round(x1 + ux * d);
      const cy = Math.round(y1 + uy * d);

      const grad = ctx.createRadialGradient(
        cx - Math.round(LINK_R * 0.4),
        cy - Math.round(LINK_R * 0.4),
        1,
        cx,
        cy,
        LINK_R,
      );
      grad.addColorStop(0, "#fff0");
      grad.addColorStop(0.6, "#fff0");
      grad.addColorStop(0.61, "#8a8a8a");
      grad.addColorStop(1, "#8a8a8a");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, LINK_R, 0, Math.PI * 2);
      ctx.fill();

      const dx2 = Math.round(cx + ux * (LINK_R + DASH_W / 2));
      const dy2 = Math.round(cy + uy * (LINK_R + DASH_W / 2));

      ctx.save();
      ctx.translate(dx2, dy2);
      ctx.rotate(Math.atan2(uy, ux));
      ctx.fillStyle = "#8a8a8a";
      ctx.fillRect(
        -Math.round(DASH_W / 2),
        -Math.round(DASH_H / 2),
        DASH_W,
        DASH_H,
      );
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

    if (state.mode === "agro") {
      const strength = 6;
      const sx = (Math.random() * 2 - 1) * strength;
      const sy = (Math.random() * 2 - 1) * strength;
      moveCamera(sx, sy, true);
    }

    const sx = Math.round(state.x);
    const sy = Math.round(state.y);

    for (const it of state.instruments) {
      drawChain(ctx, sx, sy, it.x, it.y);
    }

    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 150);
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(0.6, "rgba(0,0,0,1)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, sy, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(enemy, sx - 100, sy - 100, 200, 200);

    for (const it of state.instruments) {
      const ix = Math.round(it.x);
      const iy = Math.round(it.y - 10);

      if (it.pickedUp) {
        const t = it.pickTimer;
        const rOuter = Math.round(40 - 10 * t);
        const rInner = Math.round(15 - 10 * t);
        const alpha = 1 - t;

        ctx.save();
        ctx.globalAlpha = alpha;
        const g = ctx.createRadialGradient(ix, iy, 0, ix, iy, 50);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.4, "rgba(0,0,0,1)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ix, iy, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(it.img, ix - 50, iy - 65, 100, 100);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha * 0.5;
        ctx.translate(ix, iy);
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
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.restore();
      } else {
        const g = ctx.createRadialGradient(ix, iy, 0, ix, iy, 50);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.4, "rgba(0,0,0,1)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ix, iy, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(it.img, ix - 50, iy - 65, 100, 100);
      }
    }

    if (state.instruments.length >= (hardMode ? 2 : 3)) {
      ctx.save();
      const ox = Math.round(mouse.x + Math.cos(state.arrowAngle) * 48);
      const oy = Math.round(mouse.y + Math.sin(state.arrowAngle) * 48);
      const redness = Math.floor(Math.random() * 256);
      ctx.translate(ox, oy);
      ctx.rotate(state.arrowAngle);
      ctx.fillStyle = `rgba(255,${redness},${redness},0.9)`;
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
