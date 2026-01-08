import { death, mouse, attachMouseListener } from "../entityHost.js";
import { getCameraPos, toggleDozer } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Dozer.png";

export function setup(host) {
  const state = {
    opacity: 0.5,

    phase: "idle",
    timer: 0,

    idleDuration: 9 + Math.random(),
    watchDuration: 3,

    x: 0,
    y: 0,
    size: 200,

    lastMouseX: 0,
    lastMouseY: 0,
    stillTimer: 0,
  };

  attachMouseListener(host.canvas);

  function enterIdle() {
    state.phase = "idle";
    state.timer = 0;
    state.idleDuration = 9 + Math.random();
  }

  enterIdle();

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.timer += dt;

    if (state.phase === "idle") {
      if (state.timer >= state.idleDuration) {
        state.phase = "watch";
        state.timer = 0;
        state.stillTimer = 0;

        state.lastMouseX = mouse.x;
        state.lastMouseY = mouse.y;
      }
    } else if (state.phase === "watch") {
      toggleDozer(true);
      const cam = getCameraPos();
      state.x = cam.x + window.innerWidth / 2;
      state.y = cam.y + window.innerHeight / 2;

      const dx = mouse.x - state.lastMouseX;
      const dy = mouse.y - state.lastMouseY;

      if (dx === 0 && dy === 0) {
        state.stillTimer += dt;
        if (state.stillTimer >= 0.5) {
          toggleDozer(false);
          enterIdle();
          return;
        }
      } else {
        state.stillTimer = 0;
        state.lastMouseX = mouse.x;
        state.lastMouseY = mouse.y;
      }

      if (state.timer >= state.watchDuration) {
        death("Dozer");
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (state.phase !== "watch") return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    ctx.drawImage(
      enemy,
      state.x - state.size / 2,
      state.y - state.size / 2,
      state.size,
      state.size
    );

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
