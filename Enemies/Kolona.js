import { death, mouse } from "../entityHost.js";
import { ability, getCameraPos, playSound, slowness, uldm } from "../main.js";
import { operatorActive } from "./Operator.js";

const KolonaFont = new FontFace(
  "KolonaFont",
  "url(./ASSET/Misc/KolonaFont.ttf)",
);
await KolonaFont.load();
document.fonts.add(KolonaFont);

const Kolona_Eyes = [];
for (let i = 1; i <= 6; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Kolona/Kolona_Eyes/Layer ${i}.png`;
  Kolona_Eyes.push(img);
}
const Kolona_Fire = [];
for (let i = 1; i <= 6; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Kolona/Kolona_Fire/Layer ${i}.png`;
  Kolona_Fire.push(img);
}
const Kolona_Fleshed = [];
for (let i = 1; i <= 3; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Kolona/Kolona_Fleshed/Layer ${i}.png`;
  Kolona_Fleshed.push(img);
}
const Kolona_Text = [];
for (let i = 1; i <= 3; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Kolona/Kolona_Text/Layer ${i}.png`;
  Kolona_Text.push(img);
}
const KolonaWreath = new Image();
KolonaWreath.src = "./ASSET/Enemies/Kolona/KolonaWreath.png";
const Pillar = new Image();
Pillar.src = "./ASSET/Enemies/Kolona/Pillar.png";

let kolonaExisted = false;
let kolonaCount = 0;
export let kolonaActive = false;
export let lostEmbersActive = [false];
export function setup(host, casualMode) {
  kolonaCount++;
  if (kolonaExisted) {
    const unregister = host.register({
      update: () => {},
      draw: () => {},
    });
    return unregister;
  } else {
    kolonaExisted = true;
  }
  const state = {
    phase: "intro",
    timer: 0,
    Eyeslayers: Kolona_Eyes,
    Eyeslayer: 0,
    Eyesdraw: null,
    Firelayers: Kolona_Fire,
    Firelayer: 0,
    Firedraw: null,
    Fleshedlayers: Kolona_Fleshed,
    Fleshedlayer: 0,
    Flesheddraw: null,
    Textlayers: Kolona_Text,
    Textlayer: 0,
    Textdraw: null,

    target: 0,
    count: 0,

    showEntity: false,
    opacity: 1,

    screenX: 0,
    screenY: 0,
    deathStrike: false,

    lastSecond: -1,
    arrowSpinStart: -1,
    arrowSpinDuration: 0.18,
    tickProgress: 0,

    tickingsound: null,
    strikesound: false,
    deathsound: false,
  };

  const EYE_TIME = 0.35;
  const RING_RADIUS = 125;
  const INTRO_TIME = 3.5;
  const STRIKE_TIME = 1;

  function resetIntro() {
    state.phase = "intro";
    state.timer = INTRO_TIME;
    state.target = casualMode
      ? 8 + Math.floor(Math.random() * 3)
      : 5 + Math.floor(Math.random() * 11);
    state.count = state.target;
    state.showEntity = false;
    state.screenX = window.innerWidth / 4;
    state.screenY = window.innerHeight / 2;
    state.strikesound = false;
    state.deathStrike = false;
    state.deathsound = false;
    kolonaActive = true;
    playSound("./ASSET/Sound/Enemies/Kolona/Kolona_Warning.ogg");
  }

  resetIntro();

  function update(dt) {
    if (state.phase == "strike" && state.showEntity) {
      state.Eyeslayer++;
      if (state.Eyeslayer > state.Eyeslayers.length) state.Eyeslayer = 1;
      state.Eyesdraw = state.Eyeslayers[state.Eyeslayer - 1];
    } else {
      state.Eyeslayer = 0;
      state.Eyesdraw = null;
    }
    state.Firelayer++;
    if (state.Firelayer > state.Firelayers.length) state.Firelayer = 1;
    state.Firedraw = state.Firelayers[state.Firelayer - 1];
    state.Fleshedlayer++;
    if (state.Fleshedlayer > state.Fleshedlayers.length) state.Fleshedlayer = 1;
    state.Flesheddraw = state.Fleshedlayers[state.Fleshedlayer - 1];
    state.Textlayer++;
    if (state.Textlayer > state.Textlayers.length) state.Textlayer = 1;
    state.Textdraw = state.Textlayers[state.Textlayer - 1];

    if (!slowness) state.timer -= dt;
    if (slowness && state.tickingsound) {
      state.tickingsound();
      state.tickingsound = null;
    }
    if (!slowness && state.phase === "counting" && !state.tickingsound) {
      state.tickingsound = playSound(
        "./ASSET/Sound/Enemies/Kolona/Kolona_Counting.ogg",
        undefined,
        { start: state.tickProgress, end: 1 },
      );
    }
    const cam = getCameraPos();
    state.x = cam.x + state.screenX;
    state.y = cam.y + state.screenY;

    switch (state.phase) {
      case "intro":
        if (state.timer <= 0) {
          state.phase = "counting";
          state.timer = state.target;
          state.count = 1;
          state.tickingsound = playSound(
            "./ASSET/Sound/Enemies/Kolona/Kolona_Counting.ogg",
            undefined,
            { start: 0.01, end: 1 },
          );
        }
        break;

      case "counting": {
        const elapsed = (state.target - state.timer) * 1;
        state.tickProgress = Math.min(1, elapsed / 16.75); //length of counting audio
        state.count = 1 + Math.min(state.target, Math.floor(elapsed));

        if (state.count >= state.target) {
          state.phase = "strike";
          state.deathStrike = true;
          state.timer = STRIKE_TIME;
          state.showEntity = false;
        }
        break;
      }

      case "strike":
        if (state.timer <= 0.5 && state.tickingsound) state.tickingsound();
        if (state.timer <= 0.25) {
          state.showEntity = true;
          if (!state.strikesound) {
            playSound("./ASSET/Sound/Enemies/Kolona/Kolona_Attack.ogg");
            state.strikesound = true;
          }
        }

        if (ability) {
          state.deathStrike = false;
        }

        if (state.timer <= 0) {
          if (state.deathStrike) {
            death("Kolona");
            if (!state.deathsound) {
              playSound("./ASSET/Sound/Enemies/Kolona/Kolona_Kill.ogg");
              state.deathsound = true;
            }
          }

          state.phase = "idle";
          state.timer = (19 + Math.random()) / kolonaCount;
          state.showEntity = false;
          kolonaActive = false;
        }
        break;

      case "idle":
        if (state.timer <= 0 && !operatorActive) {
          resetIntro();
        }
        break;
    }
  }

  function draw(ctx) {
    if (state.phase === "idle") return;

    ctx.save();

    let introRot = 0;
    let introAlpha = 1;
    if (state.phase === "intro") {
      const t = Math.max(0, INTRO_TIME - state.timer);
      const eased = Math.min(1, t / 0.25);
      introRot =
        Math.PI * (1 - Math.pow(eased, 2)) +
        (state.timer <= INTRO_TIME - 0.25
          ? Math.max(0, state.timer - INTRO_TIME + 0.5) * (Math.random() - 0.5)
          : 1);
      introAlpha = Math.pow(eased, 2);
    }
    ctx.translate(Math.round(state.x), Math.round(state.y));
    ctx.rotate(-introRot);
    ctx.globalAlpha *= introAlpha;
    ctx.translate(-Math.round(state.x), -Math.round(state.y));

    let arrowAngle = 0;
    if (state.phase === "intro") {
      const t = Math.max(0, -state.timer + 0.25);
      const eased = Math.min(1, t / 0.25);
      arrowAngle = Math.pow(eased, 2.5) * (Math.PI / 8);
    }
    if (state.phase === "counting") {
      const elapsed = state.target - state.timer;
      const spinElapsed = elapsed + 0.25;
      const completed = Math.floor(spinElapsed);
      const progress = spinElapsed - completed;
      arrowAngle = completed * (Math.PI / 8);
      const eased = Math.min(1, progress / 0.25);
      arrowAngle += Math.pow(eased, 2.5) * (Math.PI / 8);
    }
    if (state.phase === "strike") {
      arrowAngle = state.target * (Math.PI / 8);
      if (state.timer <= 0.5) {
        const t = 1 - state.timer / 0.5;
        const eased = t * t;
        arrowAngle += eased * ((360 * Math.PI) / 180);
      }
    }

    if (slowness && !uldm) {
      ctx.save();
      ctx.translate(Math.round(state.x), Math.round(state.y));
      ctx.drawImage(
        state.Flesheddraw,
        Math.round(-RING_RADIUS * 1.3),
        Math.round(-RING_RADIUS * 1.3),
        Math.round(RING_RADIUS * 2.6),
        Math.round(RING_RADIUS * 2.6),
      );
      ctx.restore();
    }
    ctx.save();
    ctx.translate(Math.round(state.x), Math.round(state.y));
    ctx.rotate(
      -arrowAngle * 2 -
        (!(state.phase === "intro") ? (state.target - state.timer) * 0.1 : 0),
    );
    if (state.deathStrike && state.timer <= 0.1) {
      ctx.filter = "sepia(100%) saturate(5000%) hue-rotate(-5deg)";
    }
    ctx.drawImage(
      KolonaWreath,
      Math.round(-RING_RADIUS * 0.9),
      Math.round(-RING_RADIUS * 0.9),
      Math.round(RING_RADIUS * 1.8),
      Math.round(RING_RADIUS * 1.8),
    );
    ctx.restore();
    ctx.save();
    ctx.translate(Math.round(state.x), Math.round(state.y));
    ctx.rotate(arrowAngle);
    ctx.drawImage(
      Pillar,
      Math.round(-RING_RADIUS * 0.389),
      Math.round(-RING_RADIUS),
      Math.round(RING_RADIUS * 0.779),
      Math.round(RING_RADIUS * 2),
    );
    ctx.restore();
    ctx.save();
    ctx.translate(Math.round(state.x), Math.round(state.y));
    ctx.drawImage(
      state.Firedraw,
      Math.round(-RING_RADIUS * 0.667),
      Math.round(-RING_RADIUS * 0.75),
      Math.round(RING_RADIUS * 1.333),
      Math.round(RING_RADIUS * 1.333),
    );
    ctx.restore();

    if (!state.showEntity) {
      ctx.save();
      ctx.font = `900 ${RING_RADIUS / 3}px KolonaFont`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const text =
        state.phase === "counting"
          ? lostEmbersActive[0]
            ? "?"
            : state.count
          : state.phase === "strike" && lostEmbersActive[0]
            ? "?"
            : state.target;
      ctx.strokeStyle = "rgba(192,64,0,1)";
      ctx.lineWidth = RING_RADIUS / 20;
      ctx.strokeText(text, Math.round(state.x), Math.round(state.y));
      ctx.fillStyle = "white";
      ctx.fillText(text, Math.round(state.x), Math.round(state.y));
      ctx.restore();
    }

    if (
      state.phase === "intro" &&
      state.timer >= 0.25 &&
      state.timer <= INTRO_TIME - 0.25 &&
      !uldm
    ) {
      ctx.save();
      ctx.translate(
        Math.round(state.x),
        Math.round(state.y + RING_RADIUS * 1.25),
      );
      ctx.scale(1, Math.max(0, Math.min(1, (state.timer - 0.25) * 4)));
      ctx.drawImage(
        state.Textdraw,
        Math.round(-RING_RADIUS * 1.5),
        Math.round(-RING_RADIUS * 0.233),
        Math.round(RING_RADIUS * 3),
        Math.round(RING_RADIUS * 0.466),
      );
      ctx.restore();
    }

    if (state.phase === "strike" && state.showEntity && state.Eyesdraw) {
      ctx.drawImage(
        state.Eyesdraw,
        Math.round(state.x - RING_RADIUS * 0.5),
        Math.round(state.y - RING_RADIUS * 0.5),
        Math.round(RING_RADIUS),
        Math.round(RING_RADIUS),
      );
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
