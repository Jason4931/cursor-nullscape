import { mouse, toggleBellLeniency } from "../entityHost.js";
import {
  playSound,
  cleanseZones,
  setSlowness,
  TILE,
  moveCamera,
  uldm,
  getCameraPos,
  ESP,
} from "../main.js";

const enemy = new Image();
function loadAssets() {
  enemy.src = "./ASSET/Enemies/Bell.png";
}

export function setup(host, hardMode, immunebell) {
  loadAssets();
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    minRadius: 240,
    maxRadius: 600,

    size: 100,
    bellScale: 0,
    circleScale: 0,
    rotation: 0,
    rotationTime: 0,

    phase: "appear",
    timer: 0,

    initialized: false,

    hitTimer: 0,
    hitCooldown: 2,
    hitActive: false,
    wasHovering: false,

    bellteleportstartsoundSound: false,
    bellteleportendsoundSound: false,
  };

  const easeOut = (t) => 1 - (1 - t) * (1 - t);
  const easeIn = (t) => t * t;

  function teleport() {
    const angle = Math.random() * Math.PI * 2;
    const radius =
      state.minRadius + Math.random() * (state.maxRadius - state.minRadius);

    state.x = mouse.x + Math.cos(angle) * radius;
    state.y = mouse.y + Math.sin(angle) * radius;
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.rotationTime += dt;

    state.rotation = Math.sin(state.rotationTime * 1.2) * 0.15;

    const half = (state.size * state.bellScale) / 2;
    const dx = mouse.x - state.x;
    const dy = mouse.y - state.y;
    const hovering = dx * dx + dy * dy < half * half;

    if (hovering && !state.wasHovering && !state.hitActive) {
      state.hitActive = true;
      playSound("./ASSET/Sound/Enemies/Bell/Bell_Player_Contact_Sound.wav");
      moveCamera(0, 50);
      toggleBellLeniency(true);
      state.hitTimer = 0;
      cleanseZones.push({
        x: state.x,
        y: state.y,
        r: TILE * 18,
        expiresAt: performance.now() + 10000,
      });
      setSlowness(false);
    }

    state.wasHovering = hovering;

    if (state.hitActive) {
      state.hitTimer += dt;
      if (state.hitTimer >= state.hitCooldown) {
        state.hitActive = false;
        setTimeout(() => {
          toggleBellLeniency(false);
        }, 1000);
      }
    }

    if (!state.initialized) {
      setTimeout(() => {
        teleport();
      }, 100);
      state.initialized = true;
      playSound("./ASSET/Sound/Enemies/Bell/Bell_Teleport_Start_Sound.wav");
    }

    state.timer += dt;

    if (state.phase === "appear") {
      if (state.timer <= 0.5) {
        const t = state.timer / 0.5;
        state.circleScale = easeOut(t);
      } else {
        const t = (state.timer - 0.5) / 0.5;
        state.circleScale = 1 * (1 - easeIn(t));
      }

      state.bellScale = easeOut(Math.min(state.timer / 1, 1));

      if (state.timer >= 1) {
        state.timer = 0;
        state.circleScale = 0;
        state.phase = "wait";
      }
    } else if (state.phase === "wait") {
      if (!state._waitTarget) {
        state._waitTarget = 4.5 + Math.random();
      }

      if (state.timer >= state._waitTarget) {
        state.timer = 0;
        state._waitTarget = 0;
        state.phase = "disappear";
      }
    } else if (state.phase === "disappear") {
      if (state.timer <= 0.5) {
        const t = state.timer / 0.5;
        state.circleScale = easeOut(t);
      } else {
        const t = (state.timer - 0.5) / 0.5;
        state.circleScale = 1 * (1 - easeIn(t));
      }

      state.bellScale = 1 - easeIn(Math.min(state.timer / 1), 1);

      if (
        state.timer >= 0.2 &&
        state.timer <= 0.3 &&
        !state.bellteleportstartsoundSound
      ) {
        playSound("./ASSET/Sound/Enemies/Bell/Bell_Teleport_Start_Sound.wav");
        state.bellteleportstartsoundSound = true;
      }
      if (
        hardMode &&
        state.timer >= 0.4 &&
        state.timer <= 0.5 &&
        !state.bellteleportendsoundSound
      ) {
        playSound("./ASSET/Sound/Enemies/Bell/Bell_Teleport_End_Sound.wav");
        state.bellteleportendsoundSound = true;
      }
      if (state.timer >= 1) {
        state.timer = 0;
        state.circleScale = 0;
        teleport();
        state.phase = hardMode ? "appear" : "delay";
        state.bellteleportstartsoundSound = false;
        state.bellteleportendsoundSound = false;
      }
    } else if (state.phase === "delay") {
      if (
        state.timer >= 0.4 &&
        state.timer <= 0.5 &&
        !state.bellteleportendsoundSound
      ) {
        playSound("./ASSET/Sound/Enemies/Bell/Bell_Teleport_End_Sound.wav");
        state.bellteleportendsoundSound = true;
      }
      if (state.timer >= 1) {
        state.timer = 0;
        state.phase = "appear";
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (state.circleScale > 0 && !uldm) {
      ctx.beginPath();
      ctx.arc(
        Math.round(state.x),
        Math.round(state.y),
        Math.round(40 * state.circleScale),
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = Math.random() < 0.6 ? "gray" : "white";
      ctx.fill();
    }

    if (state.bellScale > 0) {
      const s = Math.round(state.size * state.bellScale);
      ctx.save();
      ctx.translate(Math.round(state.x), Math.round(state.y));
      ctx.rotate(state.rotation);
      ESP(state.x, state.y, state.size, "bell");
      ctx.drawImage(enemy, Math.round(-s / 2), Math.round(-s / 2), s, s);
      ctx.restore();
    }

    if (state.hitActive && !immunebell) {
      const cam = getCameraPos();
      const fade = 1 - state.hitTimer / state.hitCooldown;

      const strength = 120 * fade;
      const alpha = 0.5 * fade;

      state._wobbleTime = (state._wobbleTime || 0) + 0.08;

      const offsets = [
        [Math.round(Math.sin(state._wobbleTime) * strength), 0],
        [0, Math.round(Math.cos(state._wobbleTime * 1.3) * strength)],
        [
          Math.round(Math.sin(state._wobbleTime * 0.7) * strength),
          Math.round(Math.cos(state._wobbleTime * 0.9) * strength),
        ],
      ];

      ctx.save();
      ctx.globalAlpha = alpha;

      if (!uldm) {
        for (const [ox, oy] of offsets) {
          ctx.drawImage(ctx.canvas, ox, oy);
        }
      } else {
        ctx.globalAlpha *= 2;
        ctx.fillStyle = "black";
        ctx.fillRect(
          cam.x,
          cam.y,
          Math.round(window.innerWidth),
          Math.round(window.innerHeight),
        );
      }

      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw, name: "Bell" });
  return unregister;
}
