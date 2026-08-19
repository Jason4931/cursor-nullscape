import { mouse } from "../entityHost.js";
import {
  pickRandomPlaced4or5,
  activateChance,
  entityCanvas2,
  canvas,
  getCameraPos,
  actualCollectedCount,
  onCelestial,
  playSound,
} from "../main.js";

const altar = new Image();
const altarHigh = new Image();
const altarTweak = new Image();
function loadAssets() {
  altar.src = "./ASSET/Misc/AltarOfChance.png";
  altarHigh.src = "./ASSET/Misc/AltarOfChanceHigh.png";
  altarTweak.src = "./ASSET/Misc/AltarOfChanceTweak.png";
}

export function setup(host, hardMode) {
  loadAssets();
  const state = {
    opacity: 1,
    x: 0,
    y: 0,
    size: 200,
    timer: 0,
    nextDelay: 19 + Math.random(),
    result: null,
    resultTweak: null,
    resultDet: null,
    resultDetTweak: null,
    resultTimer: 0,
    resultMode: "normal",
    mode: "normal",
    arrowOpacity: 1,
  };

  const RESULT_TEXT = {
    0: "No Tripmines For 1 Minute",
    1: `+{}x Gift Multiplier Increase`,
    2: "Flesh BEGONE",
    3: "Extra Shield",
    4: "Payment 1000 Gift",
    5: "Martpocalypse",
    6: "2 Random Enemies",
    7: "Mart and Springer",
    8: "It's Here",
    9: "{}% Less Jump Pads",
    10: "{}% More Seamines",
    11: "Oops, all Flesh!",
  };
  const RESULT_TEXT_HIGH = {
    0: "No Tripmines For 1 Minute",
    1: "+{}x Gift Multiplier Increase",
    2: "Flesh BEGONE",
    3: "Extra Shield",
    4: "Payment 2000 Gift",
    5: "Martpocalypse",
    6: "4 Random Enemies",
    7: "Mart and Springer",
    8: "It's Here",
    9: "{}% Less Jump Pads",
    10: "{}% More Seamines",
    11: "Oops, all Flesh!",
  };
  const RESULT_TEXT_TWEAK = {
    0: null,
    1: "+{}x Gift Multiplier Increase",
    2: "Flesh BEGONE",
    3: "Extra Shield",
    4: "Payment 1000 Gift",
    5: "Martpocalypse",
    6: "2 Random Enemies",
    7: "Mart and Springer",
    8: "It's Here",
    9: "{}% Less Jump Pads",
    10: "{}% More Seamines",
    11: "Oops, all Flesh!",
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
    state.arrowOpacity = 1;
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
        const resPos = activateChance(state.mode, "positive");
        const resNeg = activateChance(state.mode, "negative");
        state.result = resPos[0];
        state.resultTweak = resNeg[0];
        if (resPos[1] != null) {
          state.resultDet = resPos[1];
        }
        if (resNeg[1] != null) {
          state.resultDetTweak = resNeg[1];
        }
      } else {
        const res = activateChance(state.mode);
        state.result = res[0];
        if (res[1] != null) {
          state.resultDet = res[1];
        }
      }
      playSound("./ASSET/Sound/Global/Main_Altar_sfx.ogg");
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
      ctx.fillStyle = "white";
      ctx.globalAlpha = state.arrowOpacity;
      ctx.font = "Bold 30px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🡒", 0, 0);
      ctx.restore();
    }

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
        let text =
          state.resultMode == "high"
            ? RESULT_TEXT_HIGH[state.result]
            : RESULT_TEXT[state.result];
        if (text.includes("{}")) {
          text = text.replace("{}", state.resultDet);
        }
        ctx.strokeText(text, boxX + screenW * 0.25, boxY + boxHeight / 2 + 20);
        ctx.fillText(text, boxX + screenW * 0.25, boxY + boxHeight / 2 + 20);
      } else {
        let text1 = RESULT_TEXT_TWEAK[state.result];
        let text2 = RESULT_TEXT_TWEAK[state.resultTweak];
        if (text1.includes("{}")) {
          text1 = text1.replace("{}", state.resultDet);
        }
        if (text2.includes("{}")) {
          text2 = text2.replace("{}", state.resultDetTweak);
        }
        ctx.strokeText(
          `${text1} and ${text2}`,
          boxX + screenW * 0.25,
          boxY + boxHeight / 2 + 20,
        );
        ctx.fillText(
          `${text1} and ${text2}`,
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
