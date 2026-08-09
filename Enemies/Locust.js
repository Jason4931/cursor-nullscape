import { death, mouse } from "../entityHost.js";
import { getCameraPos, canvas } from "../main.js";

const idle = new Image();
const agro = new Image();
function loadAssets() {
  idle.src = "./ASSET/Enemies/Locust/Locust1.png";
  agro.src = "./ASSET/Enemies/Locust/Locust2.png";
}

export function setup(host) {
  loadAssets();
  const SPEED = 3000;
  const TRIGGER_TIME = 0.4;
  const BLACK_TIME = 0.5;
  const SIZE = 200;

  const state = {
    x: 0,
    y: 0,

    opacity: 1,
    enemy: idle,

    visibleTime: 0,
    agro: false,

    blackTimer: 0,
  };

  function randomize() {
    const cam = getCameraPos();
    do {
      state.x = Math.random() * canvas.width;
      state.y = Math.random() * canvas.height;
    } while (
      state.x >= cam.x &&
      state.x <= cam.x + window.innerWidth &&
      state.y >= cam.y &&
      state.y <= cam.y + window.innerHeight
    );

    state.enemy = idle;
    state.agro = false;
    state.visibleTime = 0;
  }

  randomize();

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    const cam = getCameraPos();

    if (!state.agro) {
      if (
        state.x >= cam.x &&
        state.x <= cam.x + window.innerWidth &&
        state.y >= cam.y &&
        state.y <= cam.y + window.innerHeight
      ) {
        state.visibleTime += dt;

        if (state.visibleTime >= TRIGGER_TIME) {
          state.agro = true;
          state.enemy = agro;
        }
      } else {
        state.visibleTime = 0;
      }
    } else {
      const dx = mouse.x - state.x;
      const dy = mouse.y - state.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0) {
        state.x += (dx / dist) * SPEED * dt;
        state.y += (dy / dist) * SPEED * dt;
      }

      if (dist <= SIZE * 0.5) {
        state.blackTimer = BLACK_TIME;
        randomize();
      }
    }

    if (state.blackTimer > 0) {
      state.blackTimer -= dt;
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (state.agro) {
      const angle =
        Math.atan2(mouse.y - state.y, mouse.x - state.x) +
        Math.PI / 2 +
        (Math.random() - 0.5) * 0.5;

      ctx.translate(state.x, state.y);
      ctx.rotate(angle);

      ctx.drawImage(state.enemy, -SIZE / 2, -SIZE, SIZE, SIZE * 2);
    } else {
      ctx.drawImage(
        state.enemy,
        state.x - SIZE / 2,
        state.y - SIZE,
        SIZE,
        SIZE * 2,
      );
    }

    ctx.restore();

    if (state.blackTimer > 0) {
      const cam = getCameraPos();
      ctx.save();
      ctx.fillStyle = "#000";
      ctx.fillRect(cam.x, cam.y, window.innerWidth, window.innerHeight);
      ctx.restore();
    }
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
