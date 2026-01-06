import { death, mouse, attachMouseListener } from "../entityHost.js";

const missile = new Image();
missile.src = "./ASSET/Enemies/ICBM.png";

export function setup(host) {
  const state = {
    opacity: 0,
    x: 0,
    y: 0,
    size: 100,
    currentSize: 100,
    circleRadius: 40,
    maxCircleRadius: 210,
    rotation: 90,
    startY: 0,

    phase: "lock",
    timer: 0,
    lockDuration: 3,
    deployDuration: 0,
    idleDuration: 10,

    lockPosX: 0,
    lockPosY: 0,

    initialized: false,
  };

  attachMouseListener(host.canvas);

  const easeIn = (t) => t * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 2);

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (!state.initialized) {
      state.x = host.canvas.width / 2;
      state.y = host.canvas.height / 2;
      state.initialized = true;
    }

    state.timer += dt;

    if (state.phase === "lock") {
      state.lockPosX = mouse.x;
      state.lockPosY = mouse.y;

      const t = Math.min(state.timer, 1);
      state.circleRadius = 80 - easeOut(t) * (80 - 40);
      state.circleOpacity = easeOut(t) * 0.75;
      state.opacity = 0;
      state.currentSize = state.size * 2;

      if (state.timer >= state.lockDuration) {
        state.timer = 0;
        state.deployDuration = 2 + Math.random();
        state.phase = "deploy";
        state.startY = state.lockPosY - 100;
        state.y = state.startY;
      }
    } else if (state.phase === "deploy") {
      state.x = state.lockPosX;
      state.y = state.lockPosY;

      if (state.timer <= 1) {
        const ct = easeOut(state.timer / 1);
        state.circleRadius = 40 + (state.maxCircleRadius - 40) * ct;
      } else {
        state.circleRadius = state.maxCircleRadius;
      }

      state.circleOpacity = 0.75;

      const delay = 1;
      const missileTime = Math.max(state.timer - delay, 0);
      const effectiveDuration = state.deployDuration - delay;
      const missileT = Math.min(missileTime / effectiveDuration, 1);

      const t = Math.min(missileTime / effectiveDuration, 1);
      state.y = state.startY + (state.lockPosY - state.startY) * easeIn(t);
      state.opacity = easeIn(missileT);
      state.currentSize = state.size * (2 - easeIn(missileT));
      state.rotation = -15 + -90 * (1 - easeOut(missileT));

      if (state.timer >= state.deployDuration) {
        const dx = mouse.x - state.lockPosX;
        const dy = mouse.y - state.lockPosY;
        const dist = Math.hypot(dx, dy);
        if (dist <= state.circleRadius) {
          death("ICBM");
        }
        state.timer = 0;
        state.phase = "idle";
      }
    } else if (state.phase === "idle") {
      const fadeT = Math.min(state.timer * 4, 1);
      state.opacity = 1 - fadeT;
      state.circleOpacity = 0.75 - (fadeT * 3) / 4;

      if (state.timer >= state.idleDuration) {
        state.timer = 0;
        state.phase = "lock";
        state.opacity = 0;
        state.circleOpacity = 0;
        state.currentSize = state.size * 2;
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (
      (state.phase === "lock" ||
        state.phase === "deploy" ||
        state.phase === "idle") &&
      state.circleOpacity >= 0
    ) {
      const grad = ctx.createRadialGradient(
        state.lockPosX,
        state.lockPosY,
        0,
        state.lockPosX,
        state.lockPosY,
        state.circleRadius
      );
      grad.addColorStop(
        0,
        state.phase === "idle"
          ? `rgba(255,0,0,${state.circleOpacity})`
          : `rgba(255,0,0,0)`
      );
      grad.addColorStop(1, `rgba(255,0,0,${state.circleOpacity})`);
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.arc(
        state.lockPosX,
        state.lockPosY,
        state.circleRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    if (state.phase === "deploy" || state.phase === "idle") {
      ctx.save();
      ctx.globalAlpha = state.opacity;
      ctx.translate(state.x, state.y);
      ctx.rotate((state.rotation * Math.PI) / 180);
      const s = state.currentSize;
      ctx.drawImage(missile, -s / 2, -s / 2, s, s);
      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
