import { death, mouse } from "../entityHost.js";
import { canvas, ESP, getCameraPos } from "../main.js";

const VisageFont = new FontFace(
  "VisageFont",
  "url(./ASSET/Misc/VisageFont.ttf)",
);
await VisageFont.load();
document.fonts.add(VisageFont);

const Visage = [];
for (let i = 1; i <= 10; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Visage/Layer ${i}.png`;
  Visage.push(img);
}

export function setup(host) {
  const state = {
    opacity: 1,
    layers: Visage,
    enemy: null,
    layer: 0,

    x: 0,
    y: 0,

    size: 400,
    speed: 100,

    initialized: false,

    mode: "target",
    modeTimer: 0,

    randomDirX: 0,
    randomDirY: 0,

    sound: null,
    wobbleTime: 0,
    _targetDuration: 9 + Math.random(),

    dying: false,
    deathTimer: 0,
    deathScreen: new Image(),
  };

  const entry = { state, unregister: null };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    const cam = getCameraPos();
    if (!state.initialized) {
      const cx = host.canvas.width / 2;
      const cy = host.canvas.height / 2;

      const r = Math.random() * 400;
      const a = Math.random() * Math.PI * 2;

      state.x = cx + Math.cos(a) * r;
      state.y = cy + Math.sin(a) * r;
      state.deathScreen.src = "./ASSET/Misc/VisageDeathScreen.png";
      state.initialized = true;
    }

    state.layer++;
    if (state.layer > state.layers.length) state.layer = 1;
    state.enemy = state.layers[state.layer - 1];

    state.modeTimer += dt;
    state.wobbleTime += dt;

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

    dx = cam.x + window.innerWidth / 2 - state.x;
    dy = cam.y + window.innerHeight / 2 - state.y;

    const dist = Math.hypot(dx, dy);

    const baseSize = 400;
    const maxSize = 900;
    const dangerDist = 600;
    const p = Math.max(0, Math.min(1, 1 - dist / dangerDist));
    state.size = baseSize + (maxSize - baseSize) * p;
    if (!state.dying && dist <= state.size * 0.5) {
      state.dying = true;
      state.deathTimer = 0;
    }
    if (state.dying) {
      state.deathTimer += dt;
      if (state.deathTimer >= 1.75) {
        state.deathTimer = 0;
        state.dying = false;
      }
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

    state.x += (dx + wx) * state.speed * dt;
    state.y += (dy + wy) * state.speed * dt;
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;
    const cam = getCameraPos();

    ESP(state.x, state.y, state.size, "visage");
    ctx.drawImage(
      state.enemy,
      Math.round(state.x - state.size / 2),
      Math.round(state.y - state.size / 2),
      Math.round(state.size),
      Math.round(state.size),
    );

    if (state.dying) {
      const t = state.deathTimer;

      if (t <= 0.5) {
        document.body.classList.add("full-bnw");
      }

      if (t > 0.5) {
        document.body.classList.remove("full-bnw");
        ctx.drawImage(
          state.deathScreen,
          cam.x,
          cam.y,
          window.innerWidth,
          window.innerHeight,
        );
      }

      if (t >= 1.5) {
        death("Visage");
      }
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
