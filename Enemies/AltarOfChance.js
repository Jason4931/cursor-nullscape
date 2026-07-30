import { mouse } from "../entityHost.js";
import {
  pickRandomPlaced4or5,
  activateChance,
  entityCanvas2,
  canvas,
  getCameraPos,
  actualCollectedCount,
  onCelestial,
} from "../main.js";

const altar = new Image();
altar.src = "./ASSET/Misc/AltarOfChance.png";
const altarHigh = new Image();
altarHigh.src = "./ASSET/Misc/AltarOfChanceHigh.png";
const altarTweak = new Image();
altarTweak.src = "./ASSET/Misc/AltarOfChanceTweak.png";

export function setup(host, hardMode) {
  const state = {
    opacity: 1,
    x: 0,
    y: 0,
    size: 200,
    timer: 0,
    nextDelay: 19 + Math.random(),
    result: null,
    resultTweak: null,
    resultTimer: 0,
    resultMode: "normal",
    mode: "normal",
  };

  const RESULT_TEXT = {
    0: "No Tripmines For 1 Minute",
    1: "+0.5x Gift Multiplier Increase",
    2: "+0.75x Gift Multiplier Increase",
    3: "Flesh BEGONE",
    4: "Extra Shield",
    5: "Payment 1000 Gift",
    6: "Martpocalypse",
    7: "2 Random Enemies",
    8: "Mart and Springer",
    9: "It's Here",
    10: "40% Less Jump Pads",
    11: "60% Less Jump Pads",
    12: "40% More Seamines",
    13: "60% More Seamines",
    14: "Oops, all Flesh!",
  };
  const RESULT_TEXT_HIGH = {
    0: "No Tripmines For 1 Minute",
    1: "+0.75x Gift Multiplier Increase",
    2: "+1.25x Gift Multiplier Increase",
    3: "Flesh BEGONE",
    4: "Extra Shield",
    5: "Payment 2000 Gift",
    6: "Martpocalypse",
    7: "4 Random Enemies",
    8: "Mart and Springer",
    9: "It's Here",
    10: "100% Less Jump Pads",
    11: "100% Less Jump Pads",
    12: "100% More Seamines",
    13: "120% More Seamines",
    14: "Oops, all Flesh!",
  };
  const RESULT_TEXT_TWEAK = {
    0: null,
    1: "+0.25x Gift Multiplier Increase",
    2: "+0.5x Gift Multiplier Increase",
    3: "Flesh BEGONE",
    4: "Extra Shield",
    5: "Payment 1000 Gift",
    6: "Martpocalypse",
    7: "2 Random Enemies",
    8: "Mart and Springer",
    9: "It's Here",
    10: "40% Less Jump Pads",
    11: "60% Less Jump Pads",
    12: "40% More Seamines",
    13: "60% More Seamines",
    14: "Oops, all Flesh!",
  };

  const pos = pickRandomPlaced4or5(1000);
  state.x = pos.x;
  state.y = pos.y;

  function teleport() {
    const p = pickRandomPlaced4or5(1000);
    state.x = p.x;
    state.y = p.y;
    state.timer = 0;
    const randMode = Math.random();
    state.mode = randMode < 0.25 ? "high" : randMode < 0.5 ? "tweak" : "normal";
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
      if (state.mode == "tweak") {
        state.result = activateChance(state.mode, "positive");
        state.resultTweak = activateChance(state.mode, "negative");
      } else {
        state.result = activateChance(state.mode);
      }
      state.resultMode = state.mode;
      state.resultTimer = 0;
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
    if (state.result !== null) {
      state.resultTimer += dt;
      if (state.resultTimer >= 4) {
        state.result = null;
        state.resultTweak = null;
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
      state.mode == "high"
        ? altarHigh
        : state.mode == "tweak"
          ? altarTweak
          : altar,
      Math.round(state.x - size * 0.15),
      Math.round(state.y - size),
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
      if (state.resultTweak == null) {
        ctx.strokeText(
          state.resultMode == "high"
            ? RESULT_TEXT_HIGH[state.result]
            : RESULT_TEXT[state.result],
          boxX + screenW * 0.25,
          boxY + boxHeight / 2 + 20,
        );
        ctx.fillText(
          state.resultMode == "high"
            ? RESULT_TEXT_HIGH[state.result]
            : RESULT_TEXT[state.result],
          boxX + screenW * 0.25,
          boxY + boxHeight / 2 + 20,
        );
      } else {
        ctx.strokeText(
          `${RESULT_TEXT_TWEAK[state.result]} and ${RESULT_TEXT_TWEAK[state.resultTweak]}`,
          boxX + screenW * 0.25,
          boxY + boxHeight / 2 + 20,
        );
        ctx.fillText(
          `${RESULT_TEXT_TWEAK[state.result]} and ${RESULT_TEXT_TWEAK[state.resultTweak]}`,
          boxX + screenW * 0.25,
          boxY + boxHeight / 2 + 20,
        );
      }
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });

  return () => {
    entityCanvas2.removeEventListener("click", onClick);
    unregister();
  };
}
