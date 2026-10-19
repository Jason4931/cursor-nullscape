import { mouse } from "../entityHost.js";
import {
  pickRandomPlaced4or5,
  activateChaos,
  entityCanvas2,
  getCameraPos,
  actualCollectedCount,
  onCelestial,
  playSound,
} from "../main.js";

const altar = new Image();
function loadAssets() {
  altar.src = "./ASSET/Misc/AltarOfChaos.png";
}

export function setup(host, hardMode) {
  loadAssets();
  const state = {
    opacity: 1,
    x: 0,
    y: 0,
    size: 200,
    timer: 0,
    nextDelay: 39 + Math.random(),
    resultTimer: 0,
    arrowOpacity: 1,
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
    state.arrowOpacity = 1;
  }

  function onClick(e) {
    if (actualCollectedCount >= 10000 || onCelestial) return;
    const rect = entityCanvas2.getBoundingClientRect();
    const clientX = Number.isFinite(e.clientX) ? e.clientX : mouse._clientX;
    const clientY = Number.isFinite(e.clientY) ? e.clientY : mouse._clientY;
    const cam = getCameraPos();
    const mx =
      (clientX - rect.left) * (entityCanvas2.width / rect.width) + cam.x;
    const my =
      (clientY - rect.top) * (entityCanvas2.height / rect.height) + cam.y;
    const left = state.x - state.size * 0.2;
    const right = state.x + state.size * 0.2;
    const top = state.y - state.size * 0.85;

    if (
      mx >= left &&
      mx <= right &&
      my >= top &&
      my <= state.y + state.size * 0.05
    ) {
      activateChaos();
      playSound("./ASSET/Sound/Global/ChaosAltar_Active.ogg");
      state.resultTimer = 4;
      teleport();
    }
  }

  entityCanvas2.addEventListener("click", onClick);
  window.addEventListener("keydown", (e) => {
    if (e.key == "Enter" || e.key.toLowerCase() == "f") {
      onClick(e);
    }
  });

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (actualCollectedCount >= 10000 || onCelestial) return;

    state.timer += dt;
    state.resultTimer -= dt;
    if (state.resultTimer < 0) state.resultTimer = 0;
    if (state.arrowOpacity > 0) {
      state.arrowOpacity -= dt;
      if (state.arrowOpacity < 0) state.arrowOpacity = 0;
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
      Math.round(state.x - size * 0.2),
      Math.round(state.y - size * 0.85),
      size * 0.4,
      size * 0.9,
    );

    if (state.arrowOpacity > 0) {
      const dx = state.x - mouse.x;
      const dy = state.y - mouse.y;
      const angle = Math.atan2(dy, dx);

      const offset = 30;
      const ax = mouse.x + Math.cos(angle) * offset;
      const ay = mouse.y + Math.sin(angle) * offset;

      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(angle);
      ctx.scale(1.5, 1);
      ctx.fillStyle = "black";
      ctx.globalAlpha = state.arrowOpacity;
      ctx.font = "Bold 30px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🡒", 0, 0);
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
      ctx.fillStyle = "#f00";
      ctx.strokeText(
        "Altar of Chaos",
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 - 15,
      );
      ctx.fillText(
        "Altar of Chaos",
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 - 15,
      );

      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.strokeText(
        `You feel uneasy...`,
        boxX + screenW * 0.25,
        boxY + boxHeight / 2 + 20,
      );
      ctx.fillText(
        `You feel uneasy...`,
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
