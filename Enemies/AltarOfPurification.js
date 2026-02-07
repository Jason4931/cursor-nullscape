import { mouse } from "../entityHost.js";
import {
  pickRandomPlaced4or5,
  activatePurification,
  entityCanvas2,
  getCameraPos,
  collectedCount,
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
    const rect = entityCanvas2.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

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
      }
    }
  }

  entityCanvas2.addEventListener("click", onClick);

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (collectedCount >= hardMode ? 10000 : 5000) return;

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
    if (collectedCount >= hardMode ? 10000 : 5000) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    const size = Math.round(state.size);
    const drawX = state.x - size * 0.025;
    const drawY = state.y - size * 0.3;
    ctx.drawImage(
      altar,
      Math.round(drawX - size * 0.4),
      Math.round(drawY - size * 0.5),
      size * 0.8,
      size,
    );

    if (state.result !== null && state.resultTimer > 0) {
      const cam = getCameraPos();

      const boxHeight = 70;

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

      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#0a3cff";
      ctx.lineWidth = 2;

      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const part1 = "Changed ";
      const part2 = `${state.result[0]}`;
      const part3 = " for ";
      const part4 = `${state.result[1]}`;

      const fullText = part1 + part2 + part3 + part4;
      const centerX = boxX + screenW * 0.25;
      const centerY = boxY + boxHeight / 2;

      const totalWidth = ctx.measureText(fullText).width;
      let drawX = centerX - totalWidth / 2;
      ctx.strokeStyle = "#0a3cff";

      ctx.fillStyle = "#fff";
      ctx.strokeText(part1, drawX + ctx.measureText(part1).width / 2, centerY);
      ctx.fillText(part1, drawX + ctx.measureText(part1).width / 2, centerY);
      drawX += ctx.measureText(part1).width;

      ctx.fillStyle = "#ff3b3b";
      ctx.strokeText(part2, drawX + ctx.measureText(part2).width / 2, centerY);
      ctx.fillText(part2, drawX + ctx.measureText(part2).width / 2, centerY);
      drawX += ctx.measureText(part2).width;

      ctx.fillStyle = "#fff";
      ctx.strokeText(part3, drawX + ctx.measureText(part3).width / 2, centerY);
      ctx.fillText(part3, drawX + ctx.measureText(part3).width / 2, centerY);
      drawX += ctx.measureText(part3).width;

      ctx.fillStyle = "#ff3b3b";
      ctx.strokeText(part4, drawX + ctx.measureText(part4).width / 2, centerY);
      ctx.fillText(part4, drawX + ctx.measureText(part4).width / 2, centerY);
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });

  return () => {
    entityCanvas2.removeEventListener("click", onClick);
    unregister();
  };
}
