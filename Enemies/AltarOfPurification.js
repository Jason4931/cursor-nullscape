import { mouse } from "../entityHost.js";
import {
  pickRandomPlaced4or5,
  activatePurification,
  entityCanvas2,
  canvas,
  getCameraPos,
  actualCollectedCount,
  onCelestial,
} from "../main.js";

const altar = new Image();
altar.src = "./ASSET/Misc/AltarOfPurification.png";

export function setup(host, hardMode) {
  const state = {
    opacity: 1,
    x: 0,
    y: 0,
    size: 200,
    timer: 0,
    nextDelay: 19 + Math.random(),
    result: null,
    resultTimer: 0,
    flashTimer: 0,
  };

  const pos = pickRandomPlaced4or5(1000);
  state.x = pos.x;
  state.y = pos.y;

  function teleport() {
    const p = pickRandomPlaced4or5(1000);
    state.x = p.x;
    state.y = p.y;
    state.timer = 0;
    state.nextDelay = 19 + Math.random();
  }

  function onClick(e) {
    if (actualCollectedCount >= 10000 || onCelestial) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX ? e.clientX - rect.left : mouse.x;
    const my = e.clientY ? e.clientY - rect.top : mouse.y;

    const dx = mx - state.x;
    const dy = my - state.y;
    const r = state.size * 0.5;

    if (dx * dx + dy * dy <= r * r) {
      state.result = activatePurification();
      state.resultTimer = 0;
      if (state.result) {
        teleport();
      } else {
        state.result = null;
        state.flashTimer = 1;
      }
    }
  }

  entityCanvas2.addEventListener("click", onClick);
  window.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      onClick(e);
    }
  });

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (actualCollectedCount >= 10000 || onCelestial) return;

    if (state.flashTimer > 0) {
      state.flashTimer -= dt;
      if (state.flashTimer < 0) state.flashTimer = 0;
    }
    state.timer += dt;
    if (state.result !== null) {
      state.resultTimer += dt;
      if (state.resultTimer >= 4) {
        state.result = null;
        state.resultTimer = 0;
      }
    }

    if (state.timer <= 1) {
      state.opacity = 0;
    } else if (state.timer <= state.nextDelay - 1) {
      state.opacity = Math.min(1, state.timer - 1);
    } else {
      state.opacity = Math.max(0, state.nextDelay - state.timer);
    }

    if (state.timer >= state.nextDelay) {
      teleport();
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (actualCollectedCount >= 10000 || onCelestial) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    const size = Math.round(state.size);
    ctx.drawImage(
      altar,
      Math.round(state.x - size * 0.15),
      Math.round(state.y - size * 0.975),
      size * 0.3,
      size,
    );

    if (state.result !== null && state.resultTimer > 0) {
      const cam = getCameraPos();

      const boxHeight = 100;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      const boxX = cam.x + screenW * 0.25;
      const boxY = cam.y + screenH - boxHeight * 1.5;

      let alpha = 1;
      if (state.resultTimer < 0.5) {
        alpha = state.resultTimer / 0.5;
      } else if (state.resultTimer > 3.5) {
        alpha = (4 - state.resultTimer) / 0.5;
      }
      ctx.globalAlpha = alpha;

      ctx.fillStyle = "#0a3cff80";
      ctx.fillRect(boxX, boxY, screenW * 0.5, boxHeight);
      ctx.strokeStyle = "#0a3cff";
      ctx.strokeRect(boxX, boxY, screenW * 0.5, boxHeight);

      ctx.strokeStyle = "#0a3cff";
      ctx.lineWidth = 2;

      ctx.font = "30px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ff0";
      ctx.strokeText(
        "Altar of Purification",
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 - 15,
      );
      ctx.fillText(
        "Altar of Purification",
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 - 15,
      );

      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.strokeText(
        `Removed ${state.result[0]}. Gained ${state.result[1]}.`,
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 + 20,
      );
      ctx.fillText(
        `Removed ${state.result[0]}. Gained ${state.result[1]}.`,
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 + 20,
      );
    }

    if (state.flashTimer > 0) {
      ctx.save();
      const radius = state.size * 0.1;
      const intensity = state.flashTimer;

      const gradient = ctx.createRadialGradient(
        state.x,
        state.y - 5,
        0,
        state.x,
        state.y - 5,
        radius,
      );

      gradient.addColorStop(0, `rgba(255, 0, 0, ${0.7 * intensity})`);
      gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(state.x, state.y - 5, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });

  return () => {
    entityCanvas2.removeEventListener("click", onClick);
    unregister();
  };
}
