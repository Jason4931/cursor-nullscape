import { mouse } from "../entityHost.js";
import {
  pickRandomPlaced4or5,
  activateChance,
  entityCanvas2,
  canvas,
  getCameraPos,
  collectedCount,
} from "../main.js";

const altar = new Image();
altar.src = "./ASSET/Misc/AltarOfChance.png";

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
  };

  const RESULT_TEXT = {
    0: "Payment 1000.",
    1: "Random enemy 4.",
    2: "Gift multiplier x2.",
    3: "No tripmines.",
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
    const mx = e.clientX ? e.clientX - rect.left : mouse.x;
    const my = e.clientY ? e.clientY - rect.top : mouse.y;

    const dx = mx - state.x;
    const dy = my - state.y;
    const r = state.size * 0.5;

    if (dx * dx + dy * dy <= r * r) {
      state.result = activateChance();
      state.resultTimer = 0;
      teleport();
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
    if (collectedCount >= (hardMode ? 10000 : 5000)) return;

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
    if (collectedCount >= (hardMode ? 10000 : 5000)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    const size = Math.round(state.size);
    const drawY = state.y - size * 0.3;
    ctx.drawImage(
      altar,
      Math.round(state.x - size * 0.5),
      Math.round(drawY - size * 0.6),
      size,
      size * 1.2,
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
        "Altar of Chance",
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 - 15,
      );
      ctx.fillText(
        "Altar of Chance",
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 - 15,
      );

      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.strokeText(
        RESULT_TEXT[state.result],
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 + 20,
      );
      ctx.fillText(
        RESULT_TEXT[state.result],
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
