import { death, mouse } from "../entityHost.js";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../main.js";

const layers = [];
function loadAssets() {
  if (layers.length) return;
  for (let i = 1; i <= 5; i++) {
    const img = new Image();
    img.src = `./ASSET/Enemies/Glitch/Layer ${i}.png`;
    layers.push(img);
  }
}

export function setup(host, insanelyFast = false) {
  loadAssets();
  const state = {
    opacity: 1,
    layer: 0,
    enemy: layers[0],
    size: 100,

    x: Math.random() * WORLD_WIDTH,
    y: Math.random() * WORLD_HEIGHT,

    startX: 0,
    startY: 0,
    targetX: 0,
    targetY: 0,

    moveTimer: 0,
    moveDuration: insanelyFast ? 1 : 10,
  };

  state.startX = state.x;
  state.startY = state.y;
  state.targetX = Math.random() * WORLD_WIDTH;
  state.targetY = Math.random() * WORLD_HEIGHT;

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.layer++;
    if (state.layer > 5) state.layer = 1;
    state.enemy = layers[state.layer - 1];

    state.moveTimer += dt;

    let t = state.moveTimer / state.moveDuration;
    if (t > 1) t = 1;

    state.x = state.startX + (state.targetX - state.startX) * t;
    state.y = state.startY + (state.targetY - state.startY) * t;

    if (state.moveTimer >= state.moveDuration) {
      state.moveTimer = 0;

      state.startX = state.x;
      state.startY = state.y;

      state.targetX = Math.random() * WORLD_WIDTH;
      state.targetY = Math.random() * WORLD_HEIGHT;
    }

    const dx = mouse.x - state.x;
    const dy = mouse.y - state.y;
    const r = state.size * (insanelyFast ? 1 : 0.5);

    if (dx * dx + dy * dy <= r * r) {
      death("Glitch");
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    ctx.translate(state.x, state.y);
    ctx.rotate(Math.random() * Math.PI * 2);
    ctx.drawImage(
      state.enemy,
      Math.round(-state.size / 2),
      Math.round(-state.size / 2),
      Math.round(state.size),
      Math.round(state.size),
    );

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
