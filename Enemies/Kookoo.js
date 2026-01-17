import { death, mouse } from "../entityHost.js";
import { getCameraPos } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Kookoo.png";
const arrow = new Image();
arrow.src = "./ASSET/Misc/Arrow.png";

export function setup(host) {
  const state = {
    phase: "intro",
    timer: 0,

    target: 0,
    count: 0,

    showEntity: false,
    opacity: 1,

    screenX: 0,
    screenY: 0,
    strikeMouseX: 0,
    strikeMouseY: 0,

    lastSecond: -1,
    arrowSpinStart: -1,
    arrowSpinDuration: 0.18,
  };

  const EYE_TIME = 0.35;
  const RING_RADIUS = 60;
  const INTRO_TIME = 3;
  const STRIKE_TIME = 1;
  const STRIKE_RADIUS = 157;

  function resetIntro() {
    state.phase = "intro";
    state.timer = INTRO_TIME;
    state.target = 8 + Math.floor(Math.random() * 5);
    state.count = state.target;
    state.showEntity = false;
    state.screenX = window.innerWidth / 2;
    state.screenY = window.innerHeight / 2;
  }

  function randomizePosition() {
    state.screenX = 100 + Math.random() * (window.innerWidth - 200);
    state.screenY = 100 + Math.random() * (window.innerHeight - 200);
  }

  resetIntro();

  function update(dt) {
    state.timer -= dt;
    const cam = getCameraPos();
    state.x = cam.x + state.screenX;
    state.y = cam.y + state.screenY;

    switch (state.phase) {
      case "intro":
        if (state.timer <= 0) {
          state.phase = "counting";
          state.timer = state.target;
          state.count = 0;
          randomizePosition();
        }
        break;

      case "counting": {
        const elapsed = state.target - state.timer;
        state.count = Math.min(state.target, Math.floor(elapsed));

        if (Math.floor(elapsed) !== Math.floor(elapsed - dt)) {
          randomizePosition();
        }

        if (state.count >= state.target) {
          randomizePosition();
          state.phase = "strike";
          state.timer = STRIKE_TIME;
          state.showEntity = false;

          state.strikeMouseX = mouse.x;
          state.strikeMouseY = mouse.y;
        }
        break;
      }

      case "strike":
        if (state.timer <= 0.25) {
          state.showEntity = true;
        }

        if (state.timer <= 0) {
          const dx = mouse.x - state.strikeMouseX;
          const dy = mouse.y - state.strikeMouseY;

          if (dx * dx + dy * dy <= STRIKE_RADIUS * STRIKE_RADIUS) {
            death("Kookoo");
          }

          state.phase = "idle";
          state.timer = 19 + Math.random();
          state.showEntity = false;
        }
        break;

      case "idle":
        if (state.timer <= 0) {
          resetIntro();
        }
        break;
    }
  }

  function draw(ctx) {
    if (state.phase === "idle") return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    let arrowAngle = 0;

    if (state.phase === "counting" || state.phase === "strike") {
      const elapsed = state.target - state.timer;
      const sec = Math.floor(elapsed);

      if (sec !== state.lastSecond) {
        state.lastSecond = sec;
        state.arrowSpinStart = elapsed;
      }

      if (state.arrowSpinStart >= 0) {
        const t = (elapsed - state.arrowSpinStart) / state.arrowSpinDuration;
        if (t < 1) arrowAngle = t * Math.PI * 2;
      }
    }

    ctx.save();

    const grad = ctx.createRadialGradient(
      Math.round(state.x),
      Math.round(state.y),
      0,
      Math.round(state.x),
      Math.round(state.y),
      RING_RADIUS + 2
    );
    grad.addColorStop(0, "rgba(0,0,128,1)");
    grad.addColorStop(0.77, "rgba(0,0,0,1)");
    grad.addColorStop(0.78, "rgba(255,255,255,1)");
    grad.addColorStop(0.82, "rgba(255,255,255,1)");
    grad.addColorStop(0.83, "rgba(0,0,255,1)");
    grad.addColorStop(0.95, "rgba(0,0,255,1)");
    grad.addColorStop(0.96, "rgba(255,255,255,1)");
    grad.addColorStop(1, "rgba(255,255,255,1)");

    ctx.beginPath();
    ctx.arc(
      Math.round(state.x),
      Math.round(state.y),
      RING_RADIUS + 2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();

    if (state.phase !== "idle") {
      const size = RING_RADIUS;
      const yOffset = Math.round(size * 0.12);

      ctx.save();
      ctx.translate(Math.round(state.x), Math.round(state.y));
      ctx.rotate(arrowAngle);

      ctx.drawImage(
        arrow,
        Math.round(-size * 0.25),
        Math.round(-size + yOffset),
        Math.round(size * 0.5),
        Math.round(size)
      );

      ctx.restore();
    }

    ctx.save();
    ctx.font = "36px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const text = state.phase === "counting" ? state.count : state.target;

    ctx.fillStyle = "white";
    ctx.fillText(text, Math.round(state.x), Math.round(state.y));
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,255,1)";
    ctx.strokeText(text, Math.round(state.x), Math.round(state.y));

    ctx.restore();

    if (state.phase === "intro") {
      const blinkOn = Math.floor(state.timer / 0.25) % 2 === 0;

      if (blinkOn) {
        const text = "remember!!";
        const tx = Math.round(state.x - 25);
        const ty = Math.round(state.y + RING_RADIUS + 12);

        ctx.save();
        ctx.globalAlpha = 1;
        ctx.font = "bold 22px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        ctx.fillStyle = "white";
        ctx.fillText(text, tx, ty);
        ctx.lineWidth = 0.75;
        ctx.strokeStyle = "rgba(0,0,255,1)";
        ctx.strokeText(text, tx, ty);

        ctx.restore();
      }
    }

    function drawEyeMask(progress, closing) {
      const p = closing ? progress : 1 - progress;
      const h = RING_RADIUS * 2 * p;
      const yTop = state.y - RING_RADIUS;

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        Math.round(state.x),
        Math.round(state.y),
        RING_RADIUS,
        0,
        Math.PI * 2
      );
      ctx.clip();

      ctx.fillStyle = "rgba(0,0,255,1)";
      ctx.fillRect(
        Math.round(state.x - RING_RADIUS),
        Math.round(yTop),
        Math.round(RING_RADIUS * 2),
        Math.round(h)
      );

      ctx.restore();
    }

    if (state.phase === "intro") {
      const t = Math.max(0, INTRO_TIME - 0.25 - state.timer);
      const p = Math.floor((t / EYE_TIME) * 10) / 10;
      if (p > 0) drawEyeMask(p, false);
    }
    if (state.phase === "strike") {
      const t = Math.max(0, STRIKE_TIME - 0.575 - state.timer);
      const dur = EYE_TIME * 0.5;
      const p = Math.floor((t / dur) * 10) / 10;
      if (p > 0 && p <= 1) drawEyeMask(p, true);
    }

    if (
      (state.phase === "intro" && state.timer >= 2.75) ||
      (state.phase === "strike" && state.showEntity)
    ) {
      ctx.drawImage(
        enemy,
        Math.round(state.x - RING_RADIUS * 1.5),
        Math.round(state.y - RING_RADIUS * 1.5),
        Math.round(RING_RADIUS * 3),
        Math.round(RING_RADIUS * 3)
      );
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
