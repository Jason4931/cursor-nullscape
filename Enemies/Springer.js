import { death, mouse, toggleSpringerImmortality } from "../entityHost.js";
import { moveCamera, pickRandomPlaced4or5, playSound, ESP } from "../main.js";

const Springerback = new Image();
Springerback.src = "./ASSET/Enemies/Springer/Springer-back.png";
const Springerfront = new Image();
Springerfront.src = "./ASSET/Enemies/Springer/Springer-front.png";
const Springerright = new Image();
Springerright.src = "./ASSET/Enemies/Springer/Springer-right.png";
const Springerleft = new Image();
Springerleft.src = "./ASSET/Enemies/Springer/Springer-left.png";
const Springerbackglow = new Image();
Springerbackglow.src = "./ASSET/Enemies/Springer/Springer-back-glow.png";
const Springerfrontglow = new Image();
Springerfrontglow.src = "./ASSET/Enemies/Springer/Springer-front-glow.png";
const Springerrightglow = new Image();
Springerrightglow.src = "./ASSET/Enemies/Springer/Springer-right-glow.png";
const Springerleftglow = new Image();
Springerleftglow.src = "./ASSET/Enemies/Springer/Springer-left-glow.png";

export let fasterSpringer = [0];
export let fastSpringerActive = [false];
export function setup(host, hardMode, scale = 1) {
  const state = {
    _speedMultiplier: 1 + fasterSpringer[0],
    opacity: 1,
    enemy: Springerleft,
    enemyGlow: Springerleftglow,

    size: 100 * scale,

    phase: "landing",
    timer: 0,
    leniencyTimer: null,

    landingDuration: 2.3 / (1 + fasterSpringer[0]),

    idleDuration: 5 / (1 + fasterSpringer[0]),
    ringMaxRadius: (hardMode ? 1500 : 1000) * (0.5 + scale * 0.5),
    innerRingDist: 100,
    flashAlpha: 0,

    exitDuration: 2.4 / (1 + fasterSpringer[0]),

    ringCenterX: 0,
    ringCenterY: 0,

    spriteScale: 1,
    spriteAlpha: 0,

    knockbacks: [],
    knockbackGrowTime: 3 * (0.5 + scale * 0.5),

    flashSound: false,
    deathSound: false,
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function pickIdleDuration() {
    state.idleDuration = (4.5 + Math.random()) / (1 + fasterSpringer[0]);
  }

  function applyTripmineLeniency(strength01) {
    const duration = strength01;

    toggleSpringerImmortality(true);

    if (state.leniencyTimer) {
      clearTimeout(state.leniencyTimer);
    }

    state.leniencyTimer = setTimeout(() => {
      toggleSpringerImmortality(false);
      state.leniencyTimer = null;
    }, duration * 1000);
  }

  function spawnKnockback() {
    state.knockbacks.push({
      timer: 0,
      centerX: state.ringCenterX,
      centerY: state.ringCenterY,
      wasInsideRing: false,
    });
  }

  function enterLanding() {
    const p = pickRandomPlaced4or5();
    if (p.x && p.y) {
      state.ringCenterX = p.x;
      state.ringCenterY = p.y;
    }

    state.timer = 0;
    state.spriteScale = 1.6;
    state.spriteAlpha = 0;
    state.phase = "landing";
    const randDir = Math.random();
    if (randDir < 0.2) {
      state.enemy = Springerback;
      state.enemyGlow = Springerbackglow;
    } else if (randDir < 0.4) {
      state.enemy = Springerfront;
      state.enemyGlow = Springerfrontglow;
    } else if (randDir < 0.7) {
      state.enemy = Springerright;
      state.enemyGlow = Springerrightglow;
    } else {
      state.enemy = Springerleft;
      state.enemyGlow = Springerleftglow;
    }

    playSound(
      "./ASSET/Sound/Enemies/Springer/Springer_-_LockOn.ogg",
      1 + fasterSpringer[0],
    );
  }

  enterLanding();

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    const newMultiplier = 1 + fasterSpringer[0];
    if (newMultiplier !== state._speedMultiplier) {
      const ratio = state._speedMultiplier / newMultiplier;
      state.landingDuration *= ratio;
      state.idleDuration *= ratio;
      state.exitDuration *= ratio;
      state._speedMultiplier = newMultiplier;
    }

    state.timer += dt;
    for (let i = state.knockbacks.length - 1; i >= 0; i--) {
      const kb = state.knockbacks[i];

      kb.timer += dt;

      const growT = clamp(kb.timer / state.knockbackGrowTime, 0, 1);
      const ringRadius = state.ringMaxRadius * growT;

      const cx = mouse.x - kb.centerX;
      const cy = mouse.y - kb.centerY;
      const dist = Math.hypot(cx, cy);

      const thickness = 30;
      let insideRing = false;

      if (kb.timer < state.knockbackGrowTime) {
        const inner = ringRadius - thickness;
        const outer = ringRadius;

        insideRing = dist >= inner && dist <= outer;

        if (hardMode) {
          const innerRingRadius = ringRadius - state.innerRingDist;
          const innerInner = innerRingRadius - thickness * 8;
          const innerOuter = innerRingRadius;

          if (dist >= innerInner && dist <= innerOuter) {
            death("Springer");
          }
        }
      } else {
        state.knockbacks.splice(i, 1);
        continue;
      }

      if (insideRing && !kb.wasInsideRing) {
        const power01 = clamp(1 - growT, 0, 1);

        const strength =
          Math.min(host.canvas.width, host.canvas.height) *
          0.03 *
          power01 *
          (hardMode ? 2 : 1);

        const nx = dist ? cx / dist : 0;
        const ny = dist ? cy / dist : 0;

        if (kb.timer > 0.1) {
          moveCamera(-nx * strength, -ny * strength);
          applyTripmineLeniency(power01);
        }
      }

      kb.wasInsideRing = insideRing;
    }

    if (state.phase === "landing") {
      const fadeStart = state.landingDuration - 1;
      if (state.timer < fadeStart) {
        state.spriteAlpha = 0;
      } else {
        const t = clamp((state.timer - fadeStart) / 1, 0, 1);
        state.spriteAlpha = t;
        state.spriteScale = 1.6 - 0.6 * t;
      }

      if (state.timer >= state.landingDuration) {
        const cx = mouse.x - state.ringCenterX;
        const cy = mouse.y - state.ringCenterY;
        const dist = Math.hypot(cx, cy);

        if (dist <= state.size / 2) {
          death("Springer");
          if (!state.deathSound) {
            playSound(
              "./ASSET/Sound/Enemies/Springer/Springer_-_JumpKill_Layer.ogg",
              1 + fasterSpringer[0],
            );
            state.deathSound = true;
          }
        } else {
          state.deathSound = false;
        }

        pickIdleDuration();
        spawnKnockback();
        state.timer = 0;
        state.phase = "idle";
        playSound(
          "./ASSET/Sound/Enemies/Springer/Springer_-_JumpLand1.ogg",
          1 + fasterSpringer[0],
        );
        state.wasInsideRing = false;
      }
    } else if (state.phase === "idle") {
      if (
        state.idleDuration - state.timer >= 0.9 &&
        state.idleDuration - state.timer <= 1 &&
        !state.flashSound
      ) {
        playSound(
          "./ASSET/Sound/Enemies/Springer/Springer_-_Flash.ogg",
          1 + fasterSpringer[0],
        );
        state.flashSound = true;
      }
      if (state.idleDuration - state.timer <= 1) {
        const t = state.idleDuration - state.timer;
        state.flashAlpha = t;
      } else {
        state.flashAlpha = 0;
      }

      if (state.timer >= state.idleDuration) {
        state.timer = 0;
        state.phase = "exit";
        playSound(
          "./ASSET/Sound/Enemies/Springer/Springer_-_Move.ogg",
          1 + fasterSpringer[0],
        );
        state.flashSound = false;
      }
    } else if (state.phase === "exit") {
      const t = clamp(state.timer / state.exitDuration, 0, 1);

      state.spriteScale = 1 + 0.6 * t;
      state.spriteAlpha = 1 - t;

      if (state.timer >= state.exitDuration) {
        enterLanding();
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (state.phase === "landing") {
      const outerR = 28 * scale;
      const innerR = 18 * scale;

      ctx.fillStyle = "rgba(255,40,40,0.9)";
      ctx.beginPath();
      ctx.arc(
        Math.round(state.ringCenterX),
        Math.round(state.ringCenterY),
        Math.round(outerR + 5),
        0,
        Math.PI * 2,
      );
      ctx.arc(
        Math.round(state.ringCenterX),
        Math.round(state.ringCenterY),
        Math.round(innerR + 5),
        0,
        Math.PI * 2,
        true,
      );
      ctx.fill("evenodd");

      const markW = 14 * scale;
      const markH = 40 * scale;
      const rot = state.timer * 1.5;

      ctx.save();
      ctx.translate(
        Math.round(state.ringCenterX),
        Math.round(state.ringCenterY),
      );
      ctx.rotate(rot);
      ctx.fillStyle = "rgba(255,40,40,0.9)";

      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((Math.PI / 2) * i);
        ctx.beginPath();
        ctx.moveTo(0, -markH / 2 - outerR);
        ctx.lineTo(markW / 2, -outerR);
        ctx.lineTo(0, markH / 2 - outerR);
        ctx.lineTo(-markW / 2, -outerR);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }

    for (const kb of state.knockbacks) {
      const growT = clamp(kb.timer / state.knockbackGrowTime, 0, 1);
      const radius = state.ringMaxRadius * growT;
      const thickness = 200;
      const alpha = (1 - growT) * 0.6;

      ctx.save();
      ctx.translate(Math.round(kb.centerX), Math.round(kb.centerY));

      const layers = 5;
      const baseAlpha = (1 - growT) * 0.3;

      for (let l = 0; l < layers; l++) {
        const offset = l * 6;
        const waveAmp = 6 + l * 1.5;
        const waveFreq = 6;

        const r = radius - offset;

        ctx.beginPath();

        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.1) {
          const wave = Math.sin(a * waveFreq + kb.timer * 4 + l) * waveAmp;

          const rr = r + wave;

          const x = Math.cos(a) * rr;
          const y = Math.sin(a) * rr;

          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.closePath();

        ctx.strokeStyle = `rgba(255,255,255,${baseAlpha})`;
        ctx.lineWidth = 20;
        ctx.stroke();
      }

      if (hardMode) {
        const innerRadius = Math.max(0, radius - state.innerRingDist);

        const grad2 = ctx.createRadialGradient(
          0,
          0,
          Math.round(Math.max(0, innerRadius - thickness)),
          0,
          0,
          Math.round(innerRadius),
        );

        grad2.addColorStop(0, `rgba(255,0,0,0)`);
        grad2.addColorStop(0.7, `rgba(255,0,0,0)`);
        grad2.addColorStop(0.71, `rgba(255,0,0,${alpha})`);
        grad2.addColorStop(1, `rgba(255,0,0,${alpha})`);

        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(0, 0, Math.round(innerRadius), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (state.spriteAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(state.spriteAlpha, 0, 1);

      const s = Math.round(state.size * state.spriteScale);

      if (state.flashAlpha > 0 && state.phase === "idle") {
        ctx.save();
        ctx.globalAlpha = state.flashAlpha;

        const cx = Math.round(state.ringCenterX);
        const cy = Math.round(state.ringCenterY - state.size / 3);

        const height = s * 1.5 * 1.05;
        const width = s * 1.05;
        const spriteY =
          state.ringCenterY -
          height / 2 -
          state.size / 3 -
          (state.phase === "landing"
            ? Math.round((state.landingDuration - state.timer) * 20)
            : state.phase === "exit"
              ? Math.round(state.timer * 10)
              : 0) -
          20 -
          (scale - 1) * 10;

        ctx.drawImage(
          state.enemyGlow,
          Math.round(state.ringCenterX - width / 2),
          Math.round(spriteY),
          Math.round(width),
          Math.round(height),
        );

        ctx.restore();
      }

      const height = s * 1.5;
      const width = s;
      const spriteY =
        state.ringCenterY -
        height / 2 -
        state.size / 3 -
        (state.phase === "landing"
          ? Math.round((state.landingDuration - state.timer) * 20)
          : state.phase === "exit"
            ? Math.round(state.timer * 10)
            : 0) -
        20 -
        (scale - 1) * 10;

      ESP(
        state.ringCenterX,
        state.ringCenterY - state.size * 0.5,
        state.size * 1.5,
        "springer",
      );
      ctx.drawImage(
        state.enemy,
        Math.round(state.ringCenterX - width / 2),
        Math.round(spriteY),
        Math.round(width),
        Math.round(height),
      );

      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
