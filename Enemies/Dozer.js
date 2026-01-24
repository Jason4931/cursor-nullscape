import { death, mouse } from "../entityHost.js";
import { getCameraPos, playSound } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Dozer.png";

export function setup(host) {
  const state = {
    opacity: 1,

    phase: "idle",
    timer: 0,

    idleDuration: 9 + Math.random(),
    watchDuration: 6,

    x: 0,
    y: 0,
    size: 200,

    lastMouseX: 0,
    lastMouseY: 0,
    stillTimer: 0,

    jitterTimer: 0,
    jitterX: 0,
    jitterY: 0,
    jitterRot: 0,
  };

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

        state.lastMouseX = mouse._clientX;
        state.lastMouseY = mouse._clientY;
      }
    } else if (state.phase === "watch") {
      const cam = getCameraPos();
      state.x = cam.x + window.innerWidth / 2;
      state.y = cam.y + window.innerHeight / 2;

      state.jitterTimer += dt;
      if (state.jitterTimer >= 0.25) {
        state.jitterTimer = 0;
        playSound("./ASSET/Sound/Enemies/Dozer/DozerTick.wav");

        state.jitterX = (Math.random() - 0.5) * 7.5;
        state.jitterY = (Math.random() - 0.5) * 7.5;
        state.jitterRot = (Math.random() - 0.5) * 0.2;
      }

      const dx = mouse._clientX - state.lastMouseX;
      const dy = mouse._clientY - state.lastMouseY;

      if (dx === 0 && dy === 0) {
        state.stillTimer += dt;
        if (state.stillTimer >= 0.25) {
          enterIdle();
          return;
        }
      } else {
        state.stillTimer = 0;
        state.lastMouseX = mouse._clientX;
        state.lastMouseY = mouse._clientY;
      }

      if (state.timer >= state.watchDuration) {
        death("Dozer");
        playSound("./ASSET/Sound/Enemies/Dozer/DozerJumpTextFull.wav");
        playSound("./ASSET/Sound/Enemies/Dozer/DozerDeathEffect.wav");
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (state.phase !== "watch") return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    ctx.translate(Math.round(state.x), Math.round(state.y));
    ctx.rotate(state.jitterRot);

    ctx.drawImage(
      enemy,
      Math.round(-state.size / 2 + state.jitterX),
      Math.round(-state.size / 2 + state.jitterY),
      Math.round(state.size),
      Math.round(state.size),
    );

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
