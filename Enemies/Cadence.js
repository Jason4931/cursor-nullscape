import { death, mouse } from "../entityHost.js";
import {
  pickRandomPlaced4or5,
  moveCamera,
  playSound,
  uldm,
  ESP,
} from "../main.js";

const Cadence_idle_patch_5 = [];
const Cadence_enraged_opening = [];
const CadenceEnragedPatch5 = [];
const violin = new Image();
const harp = new Image();
function loadAssets() {
  if (Cadence_idle_patch_5.length) return;
  for (let i = 1; i <= 12; i++) {
    const img = new Image();
    img.src = `./ASSET/Enemies/Cadence/Cadence_idle_patch_5/Layer ${i}.png`;
    Cadence_idle_patch_5.push(img);
  }
  for (let i = 1; i <= 10; i++) {
    const img = new Image();
    img.src = `./ASSET/Enemies/Cadence/Cadence_enraged_opening/Layer ${i}.png`;
    Cadence_enraged_opening.push(img);
  }
  for (let i = 1; i <= 24; i++) {
    const img = new Image();
    img.src = `./ASSET/Enemies/Cadence/CadenceEnragedPatch5/Layer ${i}.png`;
    CadenceEnragedPatch5.push(img);
  }
  violin.src = "./ASSET/Misc/Violin.png";
  harp.src = "./ASSET/Misc/Harp.png";
}

export function setup(host, hardMode, deafMode) {
  loadAssets();
  const canvas = host.canvas;

  const state = {
    x: canvas.width / 2 + 200,
    y: canvas.height / 2 + 200,
    layers: Cadence_idle_patch_5,
    enemy: null,
    layer: 0,
    layerChange: [false, false],
    layerspeed: 100,

    mode: "idle",
    timer: 0,
    nextDelay: 0,

    instruments: [],
    arrowAngle: 0,

    soundState: 1,
    sound: null,
    instrumentSounds: [null, null, null],
  };

  const SPAWN_MIN = 9.5;
  const SPAWN_MAX = 10.5;
  const AGRO_SPEED = hardMode ? 1350 : 900;
  const PICKUP_RADIUS = 56;

  function rollDelay() {
    state.nextDelay = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
    state.timer = 0;
  }

  function spawnInstrument() {
    playSound(
      "./ASSET/Sound/Enemies/Cadence/Cad_Instrument.wav",
      undefined,
      undefined,
      undefined,
      undefined,
      true,
    );
    const pos = pickRandomPlaced4or5(500);
    state.instruments.push({
      x: pos.x,
      y: pos.y,
      img: Math.random() < 0.5 ? violin : harp,
    });
  }

  function resetToIdle() {
    if (state.mode === "agro") {
      state.mode = "idleWait";
      setTimeout(() => {
        playSound(
          "./ASSET/Sound/Enemies/Cadence/Cadence_ChaseStop.ogg",
          undefined,
          undefined,
          undefined,
          undefined,
          true,
        );
        if (!state.layerChange[1]) {
          state.layers = Cadence_idle_patch_5;
          state.layer = state.layers.length;
          state.layerChange[1] = true;
          state.layerChange[0] = false;
        }
        state.mode = "idle";
      }, 1000);
    }
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
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    state.layerspeed += dt;
    if (
      state.layerspeed >= 1 / Math.pow(state.instruments.length + 1, 2) ||
      state.mode == "agro" ||
      state.mode === "idleWait"
    ) {
      state.layer++;
      if (state.layer > state.layers.length) state.layer = 1;
      state.enemy = state.layers[state.layer - 1];
      state.layerspeed = 0;
    }

    state.timer += dt;
    if (
      state.instruments.length >= 1 &&
      (state.instruments.length == 1 ? !state.instruments[0].pickedUp : true)
    ) {
      const target = getNearestInstrument();
      if (target && mouse) {
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
          if (!state.layerChange[0]) {
            state.layers = Cadence_enraged_opening;
            state.layer = state.layers.length;
            state.layerChange[0] = true;
            state.layerChange[1] = false;
            setTimeout(() => {
              state.layers = CadenceEnragedPatch5;
              state.layer = state.layers.length;
            }, 500);
          }
        }
      }
    }

    if (state.mode === "agro" || state.mode === "idleWait") {
      const dx = mouse.x - state.x;
      const dy = mouse.y - state.y;
      const len = Math.hypot(dx, dy) || 1;

      state.x += (dx / len) * AGRO_SPEED * dt;
      state.y += (dy / len) * AGRO_SPEED * dt;

      if (len < 100) {
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
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy) || 1;

    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(angle);

    const ropeWidth = LINK_R * 2;

    const grad = ctx.createLinearGradient(0, -ropeWidth / 2, 0, ropeWidth / 2);
    grad.addColorStop(0, "#272727");
    grad.addColorStop(0.5, "#5a5a5a");
    grad.addColorStop(1, "#272727");

    ctx.fillStyle = grad;
    ctx.fillRect(0, -ropeWidth / 2, dist, ropeWidth);

    if (!uldm) {
      const twistSpacing = 6;
      const twistWidth = ropeWidth * 0.15;

      for (let d = 0; d < dist; d += twistSpacing) {
        const t = d / dist;

        const offset = Math.sin(d * 0.2) * (ropeWidth * 0.25);

        const twistGrad = ctx.createLinearGradient(
          d,
          offset - twistWidth,
          d,
          offset + twistWidth,
        );
        twistGrad.addColorStop(0, "rgba(255,255,255,0)");
        twistGrad.addColorStop(0.5, "rgba(255,255,255,0.25)");
        twistGrad.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = twistGrad;
        ctx.fillRect(d, offset - twistWidth, twistSpacing, twistWidth * 2);
      }
    }

    ctx.restore();
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
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    ctx.save();

    if (state.mode === "agro" || state.mode === "idleWait") {
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

    if (!uldm) {
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 150);
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(0.6, "rgba(0,0,0,1)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, 150, 0, Math.PI * 2);
      ctx.fill();
    }

    const size = state.layers == CadenceEnragedPatch5 ? 400 : 200;
    ESP(state.x, state.y, size, "cadence");
    ctx.drawImage(state.enemy, sx - size / 2, sy - size / 2, size, size);

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
        if (!uldm) {
          const g = ctx.createRadialGradient(ix, iy, 0, ix, iy, 50);
          g.addColorStop(0, "rgba(0,0,0,1)");
          g.addColorStop(0.4, "rgba(0,0,0,1)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(ix, iy, 50, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.drawImage(it.img, ix - 50, iy - 65, 100, 100);
        ctx.restore();

        if (!uldm) {
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
        }
      } else {
        if (!uldm) {
          const g = ctx.createRadialGradient(ix, iy, 0, ix, iy, 50);
          g.addColorStop(0, "rgba(0,0,0,1)");
          g.addColorStop(0.4, "rgba(0,0,0,1)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(ix, iy, 50, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.drawImage(it.img, ix - 50, iy - 65, 100, 100);
      }
    }

    if (
      state.instruments.length >= 1 &&
      deafMode &&
      (state.instruments.length == 1 ? !state.instruments[0].pickedUp : true)
    ) {
      ctx.save();
      const ox = Math.round(mouse.x + Math.cos(state.arrowAngle) * 48);
      const oy = Math.round(mouse.y + Math.sin(state.arrowAngle) * 48);
      ctx.translate(ox, oy);
      ctx.rotate(state.arrowAngle);
      ctx.fillStyle = `rgba(255,0,0,0.9)`;
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
