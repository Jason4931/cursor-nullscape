import { death, mouse } from "../entityHost.js";
import {
  playSound,
  soundStopped,
  RedMartStack,
  ESP,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  moveCamera,
} from "../main.js";
import { explodeMart, fasterMart, martSlideActive } from "./Mart.js";

const Martred_idle = [];
const Martred_explode = [];
const RedMartSlideAnimation = [];
const Marthat = new Image();
async function loadAssets() {
  if (Martred_idle.length) return;
  const loadBatch = async (target, folder, count) => {
    const promises = [];
    for (let i = 1; i <= count; i++) {
      const img = new Image();
      target.push(img);
      promises.push(
        new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          img.src = `./ASSET/Enemies/RedMart/${folder}/Layer ${i}.png`;
        }),
      );
    }
    await Promise.all(promises);
  };
  await loadBatch(Martred_idle, "Martred_idle", 80);
  loadBatch(Martred_explode, "Martred_explode", 49);
  loadBatch(RedMartSlideAnimation, "RedMartSlideAnimation", 24);
  Marthat.src = "./ASSET/Enemies/RedMart/Marthat.png";
}

export function setup(host, hardMode, stack = 1, position = null) {
  loadAssets();
  const state = {
    _speedMultiplier: 1 + fasterMart[0],
    opacity: 1,
    layers: Martred_idle,
    enemy: null,
    layer: 0,
    explode: false,
    explosionTriggered: false,
    explodeElapsed: 0,
    cooldownTimer: 0,
    ringTime: 0,
    ringActive: false,
    ringX: 0,
    ringY: 0,
    ringRadius: 0,
    explosionX: 0,
    explosionY: 0,
    explosionSize: 0,
    hatTime: 0,
    hatActive: false,
    hatX: 0,
    hatY: 0,
    hatRotation: 0,

    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    accel: 1000 * (1 + fasterMart[0]),
    friction: 1,
    overshootBrake: 0.99,
    maxSpeed: Infinity,
    martSlided: false,

    size: (0.6 + stack * 0.4) * 75,
    speed: (0.6 + stack * 0.4) * (hardMode ? 80 : 40) * (1 + fasterMart[0]),
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

  function stopAmbience() {
    if (state.sound) {
      state.sound();
      state.sound = null;
    }
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) {
      stopAmbience();
      return;
    }

    const newMultiplier = 1 + fasterMart[0];
    if (newMultiplier !== state._speedMultiplier) {
      const ratio = newMultiplier / state._speedMultiplier;
      state.speed *= ratio;
      state.accel *= ratio;
      state._speedMultiplier = newMultiplier;
    }

    if (!state.initialized) {
      if (position) {
        state.x = position.x;
        state.y = position.y;
      } else {
        const cx = WORLD_WIDTH / 2;
        const cy = WORLD_HEIGHT / 2;

        const r = Math.random() * 400;
        const a = Math.random() * Math.PI * 2;

        state.x = cx + Math.cos(a) * r;
        state.y = cy + Math.sin(a) * r;
      }
      state.initialized = true;
    }
    if (!state.martSlided && martSlideActive[0]) {
      state.martSlided = true;
      state.layers = RedMartSlideAnimation;
      state.layer = state.layers.length;
      stopAmbience();
    }

    state.cooldownTimer = Math.max(0, state.cooldownTimer - dt);
    if (state.ringActive) {
      state.ringTime += dt;
      if (state.ringTime >= 2.25) state.ringActive = false;
    }
    if (state.explode) {
      state.explodeElapsed += dt;
      if (state.explodeElapsed >= 2 && !state.explosionTriggered) {
        state.explosionTriggered = true;
        state.hatActive = true;
        state.hatTime = 0;
        state.layers = martSlideActive[0]
          ? RedMartSlideAnimation
          : Martred_idle;
        state.layer = state.layers.length;
        explodeMart.x = state.x;
        explodeMart.y = state.y;
        explodeMart.radius = state.size * 2;
        setTimeout(() => {
          explodeMart.x = -1000;
          explodeMart.y = -1000;
          explodeMart.radius = 0;
        }, 100);
        if (
          Math.hypot(mouse.x - state.explosionX, mouse.y - state.explosionY) <=
          state.explosionSize
        ) {
          death("RedMart", "#ff0000");
        }
      }
      if (state.hatActive) {
        state.hatTime = Math.min(state.hatTime + dt, 2);
        state.hatRotation += dt * Math.PI * 4;
        const progress = state.hatTime <= 1 ? state.hatTime : state.hatTime - 1;
        const verticalOffset =
          state.hatTime <= 1
            ? -(1 - (1 - progress) ** 2) * state.size
            : -(1 - progress ** 2) * state.size;
        state.hatX = state.x;
        state.hatY = state.y + verticalOffset;
        if (state.hatTime >= 2) state.hatActive = false;
      }
      if (state.explodeElapsed >= 12) {
        state.explode = false;
        state.explosionTriggered = false;
        state.hatActive = false;
        state.explodeElapsed = 0;
        state._stack += 1;
        const multiplier = 0.6 + state._stack * 0.4;
        state.size = multiplier * 75;
        state.speed = multiplier * (hardMode ? 80 : 40) * (1 + fasterMart[0]);
        state.accel = 1000 * (1 + fasterMart[0]);
        state.layers = martSlideActive[0]
          ? RedMartSlideAnimation
          : Martred_idle;
        state.layer = state.layers.length;
        state.modeTimer = 0;
      }
    }

    state.layer++;
    if (state.layers === Martred_explode) {
      state.layer = Math.min(state.layer, state.layers.length);
    } else if (state.layer > state.layers.length) {
      state.layer = 1;
    }
    state.enemy = state.layers[state.layer - 1];

    if (state.explode && !state.explosionTriggered) {
      stopAmbience();
      if (state._stack >= 6) state.ovalRotation += dt * 2;
      state.wobbleTime += dt;
      return;
    }
    if (state.explode) stopAmbience();

    state.modeTimer += dt;
    state.wobbleTime += dt;

    if (state._stack >= 6) {
      state.ovalRotation += dt * 2;
    }

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

    if (dist <= state.size * 0.5) {
      if (martSlideActive[0] && !state.explode && !state.explosionTriggered) {
        moveCamera(-state.vx * dt, -state.vy * dt);
      }
      if (
        !state.explode &&
        state.cooldownTimer <= 0 &&
        !state.explosionTriggered
      ) {
        state.explode = true;
        state.explosionTriggered = false;
        state.explodeElapsed = 0;
        state.cooldownTimer = 0;
        state.ringTime = 0;
        state.ringActive = true;
        state.cooldownTimer = 12;
        state.ringX = state.x;
        state.ringY = state.y;
        state.ringRadius = state.size * 2;
        state.explosionX = state.x;
        state.explosionY = state.y;
        state.explosionSize = state.size * 2;
        state.hatActive = false;
        state.layers = Martred_explode;
        stopAmbience();
        playSound(
          `./ASSET/Sound/Enemies/RedMart/Red_Mart_Explosion.wav`,
          undefined,
          { start: 0.1, end: 1 },
        );
        state.layer = 1;
      }
      if (state.explode || state.cooldownTimer > 0) {
        stopAmbience();
        return;
      }
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

    if (!state.explosionTriggered) {
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
    }

    if (!soundStopped && !state.explode) {
      if (dist <= 500 * (0.6 + state._stack * 0.4)) {
        if (!state.sound)
          state.sound = playSound(
            state.martSlided
              ? `./ASSET/Sound/Enemies/RedMart/Red-Martslide-ambience.ogg`
              : `./ASSET/Sound/Enemies/RedMart/Red_Mart_Ambience.ogg`,
            undefined,
            undefined,
            undefined,
            () => {
              state.sound = null;
            },
          );
      } else {
        stopAmbience();
      }
    } else {
      stopAmbience();
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (state._stack >= 6 && !state.explosionTriggered) {
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

    if (state.ringActive) {
      const grow = Math.max(0, Math.min(state.ringTime / 0.5, 1));
      const easedGrow = 1 - (1 - grow) ** 3;
      const fade =
        state.ringTime <= 2 ? 1 : Math.max(0, 1 - (state.ringTime - 2) / 0.25);
      ctx.save();
      ctx.globalAlpha *= fade * 0.5;
      const grad = ctx.createRadialGradient(
        state.ringX,
        state.ringY,
        0,
        state.ringX,
        state.ringY,
        state.ringRadius * easedGrow,
      );
      grad.addColorStop(0, `rgba(255,0,0,${state.explosionTriggered ? 1 : 0})`);
      grad.addColorStop(
        0.75,
        `rgba(255,0,0,${state.explosionTriggered ? 1 : 0})`,
      );
      grad.addColorStop(1, `rgba(255,0,0,1)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(
        state.ringX,
        state.ringY,
        state.ringRadius * easedGrow,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }

    if (state.enemy && !state.explosionTriggered) {
      ESP(state.x, state.y, state.size, "redmart");
      ctx.drawImage(
        state.enemy,
        Math.round(state.x - state.size / 2),
        Math.round(state.y - state.size / 2),
        Math.round(state.size),
        Math.round(state.size),
      );
    }
    if (state.explode && state.hatActive) {
      const hatAlpha = Math.max(0, 1 - Math.max(0, state.hatTime - 1.5) / 0.5);
      const hatSize = state.size * 0.75;
      ctx.save();
      ctx.translate(state.hatX, state.hatY);
      ctx.rotate(state.hatRotation);
      ctx.globalAlpha *= hatAlpha;
      ctx.drawImage(Marthat, -hatSize / 2, -hatSize / 2, hatSize, hatSize);
      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  entry.unregister = unregister;

  const list = RedMartStack("get");
  list.push(entry);
  RedMartStack("set", list);

  return () => {
    stopAmbience();
    const list = RedMartStack("get").filter((e) => e !== entry);
    RedMartStack("set", list);
    unregister();
  };
}
