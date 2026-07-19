import { death, mouse } from "../entityHost.js";
import { playSound, soundStopped, MartStack } from "../main.js";

const Probably_Improper_Speeded_Mart = [];
for (let i = 1; i <= 24; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Mart/Probably_Improper_Speeded_Mart/Layer ${i}.png`;
  Probably_Improper_Speeded_Mart.push(img);
}
const MartSlideAnimation = [];
for (let i = 1; i <= 24; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Mart/MartSlideAnimation/Layer ${i}.png`;
  MartSlideAnimation.push(img);
}

export let martSlideActive = [false];
export function setup(host, hardMode, stack = 1, position = null) {
  const state = {
    opacity: 1,
    layers: Probably_Improper_Speeded_Mart,
    enemy: null,
    layer: 0,

    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    accel: 1000,
    friction: 1,
    overshootBrake: 0.99,
    maxSpeed: Infinity,
    martSlided: false,

    size: (0.6 + stack * 0.4) * 75,
    speed: (0.6 + stack * 0.4) * (hardMode ? 80 : 40),
    _stack: stack,

    initialized: false,

    mode: "target",
    modeTimer: 0,

    randomDirX: 0,
    randomDirY: 0,

    sound: null,
    deathSound: false,
    wobbleTime: 0,
    ovalRotation: 0,
    _targetDuration: 9 + Math.random(),
  };

  const entry = { state, unregister: null };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (!state.initialized) {
      if (position) {
        state.x = position.x;
        state.y = position.y;
      } else {
        const cx = host.canvas.width / 2;
        const cy = host.canvas.height / 2;

        const r = Math.random() * 400;
        const a = Math.random() * Math.PI * 2;

        state.x = cx + Math.cos(a) * r;
        state.y = cy + Math.sin(a) * r;
      }
      state.initialized = true;
    }
    if (!state.martSlided && martSlideActive[0]) {
      state.martSlided = true;
      state.layers = MartSlideAnimation;
      state.layer = state.layers.length;
      if (state.sound) {
        state.sound();
        state.sound = null;
      }
    }

    state.layer++;
    if (state.layer > state.layers.length) state.layer = 1;
    state.enemy = state.layers[state.layer - 1];

    if (stack >= 6) {
      state.ovalRotation += dt * 2;
    }
    state.modeTimer += dt;
    state.wobbleTime += dt;

    if (state.mode === "target" && state.modeTimer >= state._targetDuration) {
      state.modeTimer = 0;

      if (Math.random() < 0.333 && !martSlideActive[0]) {
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

    dx = mouse.x - state.x;
    dy = mouse.y - state.y;

    const dist = Math.hypot(dx, dy);

    if (
      dist <= state.size * 0.5 &&
      (martSlideActive[0] ? Math.random() < 0.5 : true)
    ) {
      death("Mart", "#43aeff");
      if (!state.deathSound) {
        playSound(`./ASSET/Sound/Enemies/Mart/MartKill.mp3`);
        state.deathSound = true;
      }
      return;
    } else {
      state.deathSound = false;
    }

    if (state.mode === "target") {
      if (dist > 0.001) {
        dx /= dist;
        dy /= dist;
      } else {
        dx = dy = 0;
      }
    } else {
      dx = state.randomDirX;
      dy = state.randomDirY;
    }

    const wobble = Math.sin(state.wobbleTime * 3) * 0.3;
    const wx = -dy * wobble;
    const wy = dx * wobble;

    if (martSlideActive[0]) {
      const mx = dx + wx;
      const my = dy + wy;

      const len = Math.hypot(mx, my) || 1;
      const ax = mx / len;
      const ay = my / len;

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
      state.vx = 0;
      state.vy = 0;

      state.x += (dx + wx) * state.speed * dt;
      state.y += (dy + wy) * state.speed * dt;
    }

    if (!soundStopped) {
      if (dist <= 500 * (0.6 + stack * 0.4)) {
        if (!state.sound)
          state.sound = playSound(
            state.martSlided
              ? `./ASSET/Sound/Enemies/Mart/Mart_-_Slide_(loop).ogg`
              : `./ASSET/Sound/Enemies/Mart/MartLoop.mp3`,
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
    ctx.globalAlpha = state.opacity;

    if (stack >= 6) {
      ctx.save();

      ctx.translate(Math.round(state.x), Math.round(state.y));
      ctx.rotate(state.ovalRotation);

      const w = state.size * 0.8;
      const h = state.size;

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(w, h) / 2);

      grad.addColorStop(0, "rgba(67,174,255,0)");
      grad.addColorStop(0.5, "rgba(67,174,255,0)");
      grad.addColorStop(1, "rgba(67,174,255,0.75)");

      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);

      ctx.fillStyle = grad;
      ctx.fill();

      ctx.restore();
    }

    ctx.drawImage(
      state.enemy,
      Math.round(state.x - state.size / 2),
      Math.round(state.y - state.size / 2),
      Math.round(state.size),
      Math.round(state.size),
    );

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  entry.unregister = unregister;

  const list = MartStack("get");
  list.push(entry);
  MartStack("set", list);

  return () => {
    const list = MartStack("get").filter((e) => e !== entry);
    MartStack("set", list);
    unregister();
  };
}
