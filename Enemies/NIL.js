import { death, mouse } from "../entityHost.js";
import { playSound, getCameraPos, soundStopped, uldm } from "../main.js";

const NIL = [];
function loadAssets() {
  if (NIL.length) return;
  for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `./ASSET/Enemies/NIL/Layer ${i}.png`;
    NIL.push(img);
  }
}

export let redactedActive = [false];
export function setup(host, deafMode) {
  loadAssets();
  const state = {
    opacity: 0.1,
    layers: NIL,
    enemy: null,
    layer: 0,

    x: 0,
    y: 0,

    size: 90,
    speed: 50,

    initialized: false,

    mode: "target",
    modeTimer: 0,

    randomDirX: 0,
    randomDirY: 0,

    attacking: false,
    attackTimer: 0,
    dashDirX: 0,
    dashDirY: 0,
    dashStartX: 0,
    dashStartY: 0,
    dashDistance: 600,
    vx: 0,
    vy: 0,
    dashSlideTimer: 0,
    dashSlideDuration: 27,
    accel: 2500,
    friction: 1,
    overshootBrake: 0.75,
    maxSpeed: Infinity,

    _targetDuration: 9 + Math.random(),

    sound: null,
    soundState: 0,
  };

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function easeIn(t) {
    return t * t * t;
  }

  function teleportFarFromCursor() {
    const cx = mouse.x;
    const cy = mouse.y;

    const minR = 1000;
    const maxR = 1600;

    const a = Math.random() * Math.PI * 2;
    const r = minR + Math.random() * (maxR - minR);

    state.x = cx + Math.cos(a) * r;
    state.y = cy + Math.sin(a) * r;
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.layer++;
    if (state.layer > state.layers.length) state.layer = 1;
    state.enemy = state.layers[state.layer - 1];

    if (!state.initialized) {
      teleportFarFromCursor();
      state.initialized = true;
    }

    if (state.attacking) {
      state.attackTimer += dt;

      if (state.attackTimer < 0.5) {
        const t = state.attackTimer / 0.5;
        state.opacity = 0.1 + (0.9 - 0.1) * easeOut(t);
        return;
      }

      if (
        state.attackTimer < (redactedActive[0] ? state.dashSlideDuration : 1.5)
      ) {
        const t = (state.attackTimer - 0.5) / 1.0;
        const easedT = easeOut(t);

        state.opacity = 0.9;
        if (redactedActive[0] && state.dashSlideDuration > 0) {
          state.dashSlideTimer -= dt;

          const dx = mouse.x - state.x;
          const dy = mouse.y - state.y;
          const len = Math.hypot(dx, dy) || 1;

          const ax = dx / len;
          const ay = dy / len;

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
        } else {
          state.x =
            state.dashStartX + state.dashDirX * state.dashDistance * easedT;
          state.y =
            state.dashStartY + state.dashDirY * state.dashDistance * easedT;
        }

        const dx0 = mouse.x - state.x;
        const dy0 = mouse.y - state.y;
        if (Math.hypot(dx0, dy0) <= state.size * 0.4) {
          if (!soundStopped)
            playSound("./ASSET/Sound/Enemies/NIL/Nil-kill.mp3");
          death("NIL");
          return;
        }

        return;
      }

      if (
        state.attackTimer <
        (redactedActive[0] ? state.dashSlideDuration : 1.5) + 0.5
      ) {
        const t =
          (state.attackTimer -
            (redactedActive[0] ? state.dashSlideDuration : 1.5)) /
          0.5;
        state.opacity = 0.9 * (1 - easeIn(t));
        return;
      }

      teleportFarFromCursor();
      state.opacity = 0.1;
      state.attacking = false;
      state.attackTimer = 0;
      state.modeTimer = 0;
      return;
    }

    state.modeTimer += dt;

    if (state.mode === "target" && state.modeTimer >= state._targetDuration) {
      state.modeTimer = 0;

      if (Math.random() < 0.333) {
        state.mode = "random";
        const a = Math.random() * Math.PI * 2;
        state.randomDirX = Math.cos(a);
        state.randomDirY = Math.sin(a);
      }

      state._targetDuration = 9 + Math.random();
    }

    if (state.mode === "random" && state.modeTimer >= 10) {
      state.mode = "target";
      state.modeTimer = 0;
    }

    let dx = 0;
    let dy = 0;

    if (state.mode === "target") {
      dx = mouse.x - state.x;
      dy = mouse.y - state.y;
    } else {
      dx = state.randomDirX;
      dy = state.randomDirY;
    }

    const dist = Math.hypot(mouse.x - state.x, mouse.y - state.y);

    if (!soundStopped) {
      if (dist <= 220) {
        if (state.soundState == 1) {
          if (state.sound) state.sound();
          state.sound = null;
        }
        state.soundState = 2;
        if (!state.sound)
          state.sound = playSound(
            `./ASSET/Sound/Enemies/NIL/Nil_-_loop_v3.ogg?t=${Math.floor(Date.now() / 60000)}`,
            undefined,
            undefined,
            undefined,
            () => {
              state.sound = null;
            },
          );
      } else if (dist <= 500) {
        if (state.soundState == 2) {
          if (state.sound) state.sound();
          state.sound = null;
        }
        state.soundState = 1;
        if (!state.sound)
          state.sound = playSound(
            "./ASSET/Sound/Enemies/NIL/Nil-actual_loop.mp3",
            undefined,
            undefined,
            undefined,
            () => {
              state.sound = null;
            },
          );
      } else {
        state.soundState = 0;
        if (state.sound) {
          state.sound();
          state.sound = null;
        }
      }
    } else {
      state.soundState = 0;
      if (state.sound) {
        state.sound();
        state.sound = null;
      }
    }

    if (!state.attacking) {
      if (dist <= 500) {
        const t = 1 - dist / 500;
        state.opacity = 0.1 + t * (0.4 - 0.1);
      } else {
        state.opacity = 0.1;
      }
    }

    if (dist <= 220) {
      state.attacking = true;
      if (!soundStopped) {
        playSound(
          `./ASSET/Sound/Enemies/NIL/${redactedActive[0] ? "Nil-Dash-Enrage.ogg" : "Nil_-_dash.mp3"}?t=${Math.floor(Date.now() / 60000)}`,
        );
        if (redactedActive[0]) {
          playSound(`./ASSET/Sound/Enemies/NIL/Nil-Loop-Enrage.ogg`);
        }
      }
      state.attackTimer = 0;
      if (redactedActive[0]) {
        state.dashSlideTimer = state.dashSlideDuration;
        state.vx = 0;
        state.vy = 0;
      }

      const adx = mouse.x - state.x;
      const ady = mouse.y - state.y;
      const d = Math.hypot(adx, ady) || 1;

      state.dashDirX = adx / d;
      state.dashDirY = ady / d;

      state.dashStartX = state.x;
      state.dashStartY = state.y;

      return;
    }

    const moveLen = Math.hypot(dx, dy);
    if (moveLen > 0.001) {
      dx /= moveLen;
      dy /= moveLen;
    }

    state.x += dx * state.speed * dt;
    state.y += dy * state.speed * dt;
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    ctx.drawImage(
      state.enemy,
      Math.round(state.x - state.size / 2),
      Math.round(state.y - state.size / 2),
      Math.round(state.size),
      Math.round(state.size),
    );

    const dist = Math.hypot(mouse.x - state.x, mouse.y - state.y);

    const maxRadius = 500;

    if (dist <= maxRadius && deafMode && !uldm) {
      const t = 1 - dist / maxRadius; // 0 → 1 as closer
      const opacity = t * 0.6; // max intensity (adjust if too strong)

      const cam = getCameraPos();

      const screenX = cam.x;
      const screenY = cam.y;

      const w = window.innerWidth;
      const h = window.innerHeight;

      const border = 150; // thickness

      ctx.save();
      ctx.globalAlpha = opacity;
      const color = "255,0,255"; // rgb for #ff00ff

      // TOP (fade downward)
      let grad = ctx.createLinearGradient(0, screenY, 0, screenY + border);
      grad.addColorStop(0, `rgba(${color},1)`);
      grad.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(screenX, screenY, w, border);

      // BOTTOM (fade upward)
      grad = ctx.createLinearGradient(0, screenY + h - border, 0, screenY + h);
      grad.addColorStop(0, `rgba(${color},0)`);
      grad.addColorStop(1, `rgba(${color},1)`);
      ctx.fillStyle = grad;
      ctx.fillRect(screenX, screenY + h - border, w, border);

      // LEFT (fade rightward)
      grad = ctx.createLinearGradient(screenX, 0, screenX + border, 0);
      grad.addColorStop(0, `rgba(${color},1)`);
      grad.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(screenX, screenY, border, h);

      // RIGHT (fade leftward)
      grad = ctx.createLinearGradient(screenX + w - border, 0, screenX + w, 0);
      grad.addColorStop(0, `rgba(${color},0)`);
      grad.addColorStop(1, `rgba(${color},1)`);
      ctx.fillStyle = grad;
      ctx.fillRect(screenX + w - border, screenY, border, h);

      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
