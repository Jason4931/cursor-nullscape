import { death, mouse } from "../entityHost.js";
import { ESP, playSound } from "../main.js";
import { setup as spawnVoidboundBaby } from "./VoidboundBaby.js";

const Babyidle = [];
const BabyLockOnTarget = [];
const Babytransition = [];
const Babycharge = [];
async function loadAssets() {
  if (Babyidle.length) return;
  const loadBatch = async (target, folder, count) => {
    const promises = [];
    for (let i = 1; i <= count; i++) {
      const img = new Image();
      target.push(img);
      promises.push(
        new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          img.src = `./ASSET/Enemies/Baby/${folder}/Layer ${i}.png`;
        }),
      );
    }
    await Promise.all(promises);
  };
  await loadBatch(Babyidle, "Babyidle", 8);
  loadBatch(BabyLockOnTarget, "BabyLockOnTarget", 15);
  loadBatch(Babytransition, "Babytransition", 4);
  loadBatch(Babycharge, "Babycharge", 13);
}

export let rebirthActive = [false];
export function setup(host, hardMode, scale = 1) {
  loadAssets();
  const state = {
    opacity: 1,
    layers: Babyidle,
    enemy: null,
    layer: 0,
    layerChange: [false, false, false, false, false],

    x: 0,
    y: 0,

    size: 90 * scale,

    state: "idle",
    timer: 0,

    dirX: 0,
    dirY: 0,
    dirX2: 0,
    dirY2: 0,
    lineLength: 810 * scale,

    chargeTime: 0,
    chargeDuration: 0,
    startX: 0,
    startY: 0,

    chargeTime2: 0,
    chargeDuration2: 0,
    startX2: 0,
    startY2: 0,

    initialized: false,
    rebirth: false,
  };

  function randomSpawn() {
    const cx = host.canvas.width / 2;
    const cy = host.canvas.height / 2;

    const radius = Math.min(cx, cy) * 0.4;
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;

    state.x = cx + Math.cos(a) * r;
    state.y = cy + Math.sin(a) * r;
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (state.rebirth) return;

    if (!state.rebirth && rebirthActive[0]) {
      state.rebirth = true;
      spawnVoidboundBaby(host, hardMode, {
        x: state.x,
        y: state.y,
        scale: scale,
      });
    }

    if (!state.initialized) {
      randomSpawn();
      state.initialized = true;
    }

    state.layer++;
    if (state.layer > state.layers.length) state.layer = 1;
    state.enemy = state.layers[state.layer - 1];

    state.timer += dt;

    if (state.state === "idle") {
      if (!state.layerChange[0]) {
        state.layers = Babyidle;
        state.layer = state.layers.length;
        state.layerChange[0] = true;
      }
      if (state.timer >= 0.75) {
        state.timer = 0;
        state.state = "indicator";
        playSound("./ASSET/Sound/Enemies/Baby/Baby_Alarm.ogg");

        const dx = mouse.x - state.x;
        const dy = mouse.y - state.y;
        const d = Math.hypot(dx, dy) || 1;

        state.dirX = dx / d;
        state.dirY = dy / d;
      }
    } else if (state.state === "indicator") {
      if (!state.layerChange[1]) {
        state.layers = BabyLockOnTarget;
        state.layer = state.layers.length;
        state.layerChange[1] = true;
      }
      if (state.timer >= 0.75) {
        state.timer = 0;
        state.state = "charging";
        playSound("./ASSET/Sound/Enemies/Baby/Baby_Scream.ogg");

        state.startX = state.x;
        state.startY = state.y;

        state.chargeTime = 0;
        state.chargeDuration = hardMode
          ? 0.75 + Math.random()
          : 1.5 + Math.random();

        if (hardMode) {
          const Bx = state.startX + state.dirX * state.lineLength;
          const By = state.startY + state.dirY * state.lineLength;

          const dx2 = mouse.x - Bx;
          const dy2 = mouse.y - By;
          const d2 = Math.hypot(dx2, dy2) || 1;

          state.dirX2 = dx2 / d2;
          state.dirY2 = dy2 / d2;

          state.startX2 = Bx;
          state.startY2 = By;

          state.chargeTime2 = 0;
          state.chargeDuration2 = 0.75 + Math.random();
        }
      }
    } else if (state.state === "charging") {
      if (!state.layerChange[2]) {
        state.layers = Babytransition;
        state.layer = state.layers.length;
        state.layerChange[2] = true;
      }
      state.chargeTime += dt;
      if (state.chargeTime >= 0.2 && !state.layerChange[3]) {
        state.layers = Babycharge;
        state.layer = state.layers.length;
        state.layerChange[3] = true;
      }
      if (
        !hardMode &&
        state.chargeTime >= state.chargeDuration - 0.2 &&
        !state.layerChange[4]
      ) {
        state.layers = Babytransition;
        state.layer = state.layers.length;
        state.layerChange[4] = true;
      }

      let t = state.chargeTime / state.chargeDuration;
      if (t > 1) t = 1;

      const ease = 1 - Math.pow(1 - t, 3);

      state.x = state.startX + state.dirX * state.lineLength * ease;
      state.y = state.startY + state.dirY * state.lineLength * ease;

      const dx = mouse.x - state.x;
      const dy = mouse.y - state.y;

      if (Math.hypot(dx, dy) <= state.size * 0.25) {
        death("Baby");
        return;
      }

      if (t >= 1) {
        state.state = hardMode ? "charging2" : "idle";
        state.timer = 0;

        if (hardMode) {
          playSound("./ASSET/Sound/Enemies/Baby/Baby_Scream.ogg");

          state.startX2 = state.startX + state.dirX * state.lineLength;
          state.startY2 = state.startY + state.dirY * state.lineLength;

          state.chargeTime2 = 0;
          state.chargeDuration2 = 0.75 + Math.random();
        } else {
          state.layerChange[0] = false;
          state.layerChange[1] = false;
          state.layerChange[2] = false;
          state.layerChange[3] = false;
          state.layerChange[4] = false;
        }
      }
    } else if (state.state === "charging2") {
      state.chargeTime2 += dt;
      if (
        state.chargeTime2 >= state.chargeDuration2 - 0.2 &&
        !state.layerChange[4]
      ) {
        state.layers = Babytransition;
        state.layer = state.layers.length;
        state.layerChange[4] = true;
      }

      let t = state.chargeTime2 / state.chargeDuration2;
      if (t > 1) t = 1;

      const ease = 1 - Math.pow(1 - t, 3);

      state.x = state.startX2 + state.dirX2 * state.lineLength * ease;
      state.y = state.startY2 + state.dirY2 * state.lineLength * ease;

      const dx = mouse.x - state.x;
      const dy = mouse.y - state.y;

      if (Math.hypot(dx, dy) <= state.size * 0.25) {
        death("Baby");
        return;
      }

      if (t >= 1) {
        state.state = "idle";
        state.timer = 0;
        state.layerChange[0] = false;
        state.layerChange[1] = false;
        state.layerChange[2] = false;
        state.layerChange[3] = false;
        state.layerChange[4] = false;
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (state.rebirth) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (
      state.state === "indicator" ||
      (hardMode && state.state === "charging")
    ) {
      const alpha = 0.75 - state.timer;
      ctx.fillStyle = `rgba(255,0,0,${Math.min(1, alpha * 4)})`;

      const dashLength = 30 * scale;
      const gapLength = 20 * scale;
      const thickness = 4 * scale;

      const angle =
        hardMode && state.state === "charging"
          ? Math.atan2(state.dirY2, state.dirX2)
          : Math.atan2(state.dirY, state.dirX);

      let dist = 0;
      while (dist < state.lineLength) {
        const baseX =
          hardMode && state.state === "charging" ? state.startX2 : state.x;
        const baseY =
          hardMode && state.state === "charging" ? state.startY2 : state.y;

        const dirX =
          hardMode && state.state === "charging" ? state.dirX2 : state.dirX;
        const dirY =
          hardMode && state.state === "charging" ? state.dirY2 : state.dirY;

        const cx = Math.round(baseX + dirX * dist);
        const cy = Math.round(baseY + dirY * dist);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        ctx.fillRect(
          0,
          Math.round(-thickness / 2),
          Math.round(dashLength),
          Math.round(thickness),
        );

        ctx.restore();

        dist += dashLength + gapLength;
      }
    }

    ctx.save();
    ctx.translate(Math.round(state.x), Math.round(state.y));
    ESP(state.x, state.y, state.size, "baby");
    if (state.enemy) {
      ctx.drawImage(
        state.enemy,
        Math.round(-state.size / 2),
        Math.round(-state.size / 2),
        Math.round(state.size),
        Math.round(state.size),
      );
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
