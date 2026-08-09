import { death, mouse } from "../entityHost.js";
import { ESP, playSound, uldm } from "../main.js";

const VoidboundBaby_Idle = [];
const VBbabyLockOnTarget = [];
const Vbabytrans = [];
const VBbabyCharging = [];
function loadAssets() {
  if (VoidboundBaby_Idle.length) return;
  for (let i = 1; i <= 18; i++) {
    const img = new Image();
    img.src = `./ASSET/Enemies/VoidboundBaby/VoidboundBaby_Idle/Layer ${i}.png`;
    VoidboundBaby_Idle.push(img);
  }
  for (let i = 1; i <= 7; i++) {
    const img = new Image();
    img.src = `./ASSET/Enemies/VoidboundBaby/VBbabyLockOnTarget/Layer ${i}.png`;
    VBbabyLockOnTarget.push(img);
  }
  for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `./ASSET/Enemies/VoidboundBaby/Vbabytrans/Layer ${i}.png`;
    Vbabytrans.push(img);
  }
  for (let i = 1; i <= 6; i++) {
    const img = new Image();
    img.src = `./ASSET/Enemies/VoidboundBaby/VBbabyCharging/Layer ${i}.png`;
    VBbabyCharging.push(img);
  }
}

export function setup(host, hardMode, rebirth = null) {
  loadAssets();
  const state = {
    opacity: 1,
    layers: VoidboundBaby_Idle,
    enemy: null,
    layer: 0,
    layerChange: [false, false, false, false, false],

    x: 0,
    y: 0,

    size: 90,

    state: "idle",
    timer: 0,

    dirX: 0,
    dirY: 0,
    dirX2: 0,
    dirY2: 0,
    lineLength: 900,

    chargeTime: 0,
    chargeDuration: 0,
    startX: 0,
    startY: 0,

    chargeTime2: 0,
    chargeDuration2: 0,
    startX2: 0,
    startY2: 0,

    trails: [],
    ballTrails: [],

    initialized: false,
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

    if (!state.initialized) {
      if (!rebirth) {
        randomSpawn();
      } else {
        state.x = rebirth.x;
        state.y = rebirth.y;
        state.size *= rebirth.scale;
        state.lineLength *= rebirth.scale;
      }
      state.initialized = true;
    }

    state.layer++;
    if (state.layer > state.layers.length) state.layer = 1;
    state.enemy = state.layers[state.layer - 1];

    if (state.state === "charging" || state.state === "charging2") {
      state.trails.push({
        x: state.x + Math.random() * 50 - 25,
        y: state.y + Math.random() * 50 - 25,
        age: 0,
        image: state.enemy,
      });
      state.ballTrails.push({
        x: state.x + Math.random() * 100 - 50,
        y: state.y + Math.random() * 100 - 50,
        age: 0,
      });
    }
    for (const trail of state.trails) {
      trail.age += dt;
    }
    for (const trail of state.ballTrails) {
      trail.age += dt;
    }
    state.trails = state.trails.filter((t) => t.age < 0.5);
    state.ballTrails = state.ballTrails.filter((t) => t.age < 0.5);

    state.timer += dt;

    if (state.state === "idle") {
      if (!state.layerChange[0]) {
        state.layers = VoidboundBaby_Idle;
        state.layer = state.layers.length;
        state.layerChange[0] = true;
      }
      if (state.timer >= 0.375) {
        state.timer = 0;
        state.state = "indicator";
        playSound("./ASSET/Sound/Enemies/VoidboundBaby/Shadow_Baby_Alarm.ogg");

        const dx = mouse.x - state.x;
        const dy = mouse.y - state.y;
        const d = Math.hypot(dx, dy) || 1;

        state.dirX = dx / d;
        state.dirY = dy / d;
      }
    } else if (state.state === "indicator") {
      if (!state.layerChange[1]) {
        state.layers = VBbabyLockOnTarget;
        state.layer = state.layers.length;
        state.layerChange[1] = true;
      }
      if (state.timer >= 0.375) {
        state.timer = 0;
        state.state = "charging";
        playSound("./ASSET/Sound/Enemies/VoidboundBaby/Shadow_Baby_Scream.ogg");

        state.startX = state.x;
        state.startY = state.y;

        state.chargeTime = 0;
        state.chargeDuration = hardMode
          ? 0.125 + Math.random() * 0.5
          : 0.25 + Math.random() * 0.5;

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
          state.chargeDuration2 = 0.125 + Math.random() * 0.5;
        }
      }
    } else if (state.state === "charging") {
      if (!state.layerChange[2]) {
        state.layers = Vbabytrans;
        state.layer = state.layers.length;
        state.layerChange[2] = true;
      }
      state.chargeTime += dt;
      if (state.chargeTime >= 0.1 && !state.layerChange[3]) {
        state.layers = VBbabyCharging;
        state.layer = state.layers.length;
        state.layerChange[3] = true;
      }
      if (
        !hardMode &&
        state.chargeTime >= state.chargeDuration - 0.1 &&
        !state.layerChange[4]
      ) {
        state.layers = Vbabytrans;
        state.layer = state.layers.length;
        state.layerChange[4] = true;
      }

      let t = state.chargeTime / state.chargeDuration;
      if (t > 1) t = 1;

      const k = 0.3;
      const easedT = t * (1 - k) + t * t * k;

      state.x = state.startX + state.dirX * state.lineLength * easedT;
      state.y = state.startY + state.dirY * state.lineLength * easedT;

      const dx = mouse.x - state.x;
      const dy = mouse.y - state.y;

      if (Math.hypot(dx, dy) <= state.size * 0.4) {
        death("VoidboundBaby");
        return;
      }

      if (t >= 1) {
        state.state = hardMode ? "charging2" : "idle";
        state.timer = 0;

        if (hardMode) {
          playSound(
            "./ASSET/Sound/Enemies/VoidboundBaby/Shadow_Baby_Scream.ogg",
          );

          state.startX2 = state.startX + state.dirX * state.lineLength;
          state.startY2 = state.startY + state.dirY * state.lineLength;

          state.chargeTime2 = 0;
          state.chargeDuration2 = 0.125 + Math.random() * 0.5;
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
        state.chargeTime2 >= state.chargeDuration2 - 0.1 &&
        !state.layerChange[4]
      ) {
        state.layers = Vbabytrans;
        state.layer = state.layers.length;
        state.layerChange[4] = true;
      }

      let t = state.chargeTime2 / state.chargeDuration2;
      if (t > 1) t = 1;

      const k = 0.3;
      const easedT = t * (1 - k) + t * t * k;

      state.x = state.startX2 + state.dirX2 * state.lineLength * easedT;
      state.y = state.startY2 + state.dirY2 * state.lineLength * easedT;

      const dx = mouse.x - state.x;
      const dy = mouse.y - state.y;

      if (Math.hypot(dx, dy) <= state.size * 0.4) {
        death("VoidboundBaby");
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

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (
      state.state === "indicator" ||
      (hardMode && state.state === "charging")
    ) {
      const alpha = 0.375 - state.timer;
      ctx.fillStyle = `rgba(255,0,255,${Math.min(1, alpha * 4)})`;

      const dashLength = 30 * (rebirth ? rebirth.scale : 1);
      const gapLength = 20 * (rebirth ? rebirth.scale : 1);
      const thickness = 4 * (rebirth ? rebirth.scale : 1);

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

    if (!uldm) {
      for (const trail of state.ballTrails) {
        ctx.save();
        ctx.fillStyle = "black";
        ctx.strokeStyle = "rgb(255,0,192)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(
          Math.round(trail.x),
          Math.round(trail.y),
          Math.round((state.size / 2) * (0.5 * (1 - trail.age / 0.5))),
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      for (const trail of state.trails) {
        ctx.save();
        ctx.globalAlpha = 0.5 * (1 - trail.age / 0.5);
        ctx.translate(Math.round(trail.x), Math.round(trail.y));
        ctx.drawImage(
          trail.image,
          Math.round((-state.size / 2) * 0.9),
          Math.round((-state.size / 2) * 0.9),
          Math.round(state.size * 0.9),
          Math.round(state.size * 0.9),
        );
        ctx.restore();
      }
    }
    ctx.save();
    ctx.translate(Math.round(state.x), Math.round(state.y));
    if (state.enemy) {
      const sizescale = state.layers == VBbabyLockOnTarget ? 1.5 : 1.2;
      ESP(state.x, state.y, state.size, "voidboundbaby");
      ctx.drawImage(
        state.enemy,
        Math.round((-state.size / 2) * sizescale),
        Math.round((-state.size / 2) * sizescale),
        Math.round(state.size * sizescale),
        Math.round(state.size * sizescale),
      );
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
