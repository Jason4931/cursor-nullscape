import { mouse } from "../entityHost.js";
import {
  pickRandomPlaced4or5,
  activateProtection,
  entityCanvas2,
  canvas,
  getCameraPos,
  collectedCount,
} from "../main.js";

const altar = new Image();
altar.src = "./ASSET/Misc/AltarOfProtection.png";

export function setup(host, hardMode) {
  const state = {
    opacity: 1,
    x: 0,
    y: 0,
    size: 200,
    timer: 0,
    nextDelay: 19 + Math.random(),
    flashTimer: 0,
    resultTimer: 0,
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
    if (collectedCount >= (hardMode ? 10000 : 5000)) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const dx = mx - state.x;
    const dy = my - state.y;
    const r = state.size * 0.5;

    if (dx * dx + dy * dy <= r * r) {
      const result = activateProtection();

      if (result) {
        teleport();
        state.resultTimer = 4;
      } else {
        state.flashTimer = 1;
      }
    }
  }

  entityCanvas2.addEventListener("click", onClick);

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (collectedCount >= (hardMode ? 10000 : 5000)) return;

    if (state.flashTimer > 0) {
      state.flashTimer -= dt;
      if (state.flashTimer < 0) state.flashTimer = 0;
    }
    state.timer += dt;
    state.resultTimer -= dt;
    if (state.resultTimer < 0) state.resultTimer = 0;

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
    if (collectedCount >= (hardMode ? 10000 : 5000)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    const size = Math.round(state.size);
    const drawX = state.x - size * 0.02;
    const drawY = state.y - size * 0.37;
    ctx.drawImage(
      altar,
      Math.round(drawX - size * 0.5),
      Math.round(drawY - size * 0.5),
      size,
      size,
    );

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
      ctx.arc(state.x, state.y - 5, radius - 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (state.resultTimer > 0) {
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
        "Altar of Protection",
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 - 15,
      );
      ctx.fillText(
        "Altar of Protection",
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 - 15,
      );

      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.strokeText(
        `-1000 Gifts in exchange for Shield.`,
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 + 20,
      );
      ctx.fillText(
        `-1000 Gifts in exchange for Shield.`,
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 + 20,
      );
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });

  return () => {
    entityCanvas2.removeEventListener("click", onClick);
    unregister();
  };
}
