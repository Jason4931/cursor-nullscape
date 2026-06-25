import { death, mouse } from "../entityHost.js";
import { getCameraPos, playSound, ability } from "../main.js";
import { setup as spawnMalfunction } from "./Malfunction.js";

const OperatorIdle = new Image();
OperatorIdle.src = "./ASSET/Enemies/Operator/Operator_Idle.png";
const OperatorWaiting = new Image();
OperatorWaiting.src = "./ASSET/Enemies/Operator/Operator_Waiting.png";
const OperatorDanger = new Image();
OperatorDanger.src = "./ASSET/Enemies/Operator/Operator_Danger.png";
const OperatorKilling = new Image();
OperatorKilling.src = "./ASSET/Enemies/Operator/Operator_Killing.png";

export let malfunctionActive = [false];
export function setup(host, hardMode) {
  const state = {
    opacity: 1,
    enemy: OperatorIdle,

    phase: "idle",
    timer: 0,

    idleDuration: 14 + Math.random(),
    spawnDuration: 0.5,
    disableDuration: 1,
    watchDuration: hardMode ? 2 : 3,
    idleSound: null,

    abilityLongerCooldown: 0,

    x: 0,
    y: 0,
    size: 200,

    lastMouseX: 0,
    lastMouseY: 0,
    stillTimer: 0,

    jitterTimer: 0,
    jitterX: 0,
    jitterY: 0,
    jitterRot: 0,

    death: false,
  };

  function enterIdle(mal = false) {
    state.phase = "idle";
    state.timer = 0;
    state.idleDuration = (mal ? 12.5 : 0) + 14 + Math.random();
    state.death = false;
  }
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function easeIn(t) {
    return t * t * t;
  }

  enterIdle();

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.timer += dt;
    if (ability) {
      state.abilityLongerCooldown = 30;
    } else {
      if (state.abilityLongerCooldown > 0) state.abilityLongerCooldown--;
    }

    if (state.phase === "idle") {
      if (state.timer >= state.idleDuration) {
        if (malfunctionActive[0] && Math.random() < 0.5) {
          spawnMalfunction(host);
          enterIdle(true);
        } else {
          state.phase = "spawn";
          state.timer = 0;
          playSound("./ASSET/Sound/Enemies/Operator/Operator_Spawn.ogg");
        }
      }
    } else if (state.phase === "spawn") {
      const cam = getCameraPos();
      const targetX = cam.x + window.innerWidth / 4;
      const targetY = cam.y + window.innerHeight / 2;

      const t = Math.min(state.timer / state.spawnDuration, 1);
      const e = easeOut(t);

      state.opacity = e;

      const startY = targetY - 150;
      state.x = targetX;
      state.y = startY + (targetY - startY) * e;
      if (state.timer >= state.spawnDuration) {
        state.phase = "watch";
        state.timer = 0;
        state.stillTimer = 0;

        state.lastMouseX = mouse._clientX;
        state.lastMouseY = mouse._clientY;
        state.enemy = OperatorWaiting;
        state.opacity = 1;
        if (hardMode) {
          state.idleSound = playSound(
            "./ASSET/Sound/Enemies/Operator/Operator_Ticking.ogg",
            1,
            { start: 0.333, end: 1 },
          );
        } else {
          state.idleSound = playSound(
            "./ASSET/Sound/Enemies/Operator/Operator_Ticking.ogg",
          );
        }
      }
    } else if (state.phase === "watch") {
      const cam = getCameraPos();
      state.x = cam.x + window.innerWidth / 4;
      state.y = cam.y + window.innerHeight / 2;

      state.jitterTimer += dt;
      if (state.jitterTimer >= 0.25 && !state.death) {
        state.jitterTimer -= 0.25;
        if (state.jitterRot == 0.1) state.jitterRot = -0.1;
        else state.jitterRot = 0.1;
      }

      const dx = mouse._clientX - state.lastMouseX;
      const dy = mouse._clientY - state.lastMouseY;

      if (dx === 0 && dy === 0) {
        state.stillTimer += dt;
        if (
          state.stillTimer >= (hardMode ? 0.5 : 0.25) &&
          state.abilityLongerCooldown == 0 &&
          !state.death
        ) {
          state.phase = "disable";
          state.timer = 0;
          state.jitterRot = 0;
          state.enemy = OperatorIdle;
          if (state.idleSound) state.idleSound();
          playSound("./ASSET/Sound/Enemies/Operator/Operator_Success.ogg");
          return;
        }
      } else {
        state.stillTimer = 0;
        state.lastMouseX = mouse._clientX;
        state.lastMouseY = mouse._clientY;
      }

      if (
        state.timer >= state.watchDuration - 0.25 &&
        state.timer < state.watchDuration
      ) {
        state.jitterRot = 0;
        state.enemy = OperatorDanger;
        state.abilityLongerCooldown -= 30;
        if (state.abilityLongerCooldown < 0) state.abilityLongerCooldown = 0;
      }

      if (state.timer >= state.watchDuration && !state.death) {
        state.death = true;
        state.jitterRot = 0;
        state.enemy = OperatorKilling;
        playSound("./ASSET/Sound/Enemies/Operator/Operator_Fail.ogg");
        death("Operator");
        setTimeout(() => {
          state.phase = "disable";
          state.timer = 0;
          state.jitterRot = 0;
          state.enemy = OperatorIdle;
          if (state.idleSound) state.idleSound();
        }, 500);
      }
    } else if (state.phase === "disable") {
      const cam = getCameraPos();
      const targetX = cam.x + window.innerWidth / 4;
      const targetY = cam.y + window.innerHeight / 2 + 50;

      const t = Math.min(state.timer / state.disableDuration, 1);
      const e = easeIn(t);

      state.opacity = 1 - e;

      const startY = targetY - 50;
      state.x = targetX;
      state.y = startY + (targetY - startY) * e;
      if (state.timer >= state.disableDuration) {
        enterIdle();
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (state.phase == "idle") return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    ctx.translate(Math.round(state.x), Math.round(state.y));
    ctx.rotate(state.jitterRot);

    ctx.drawImage(
      state.enemy,
      Math.round(-state.size / 2),
      Math.round(-state.size),
      Math.round(state.size),
      Math.round(state.size * 2),
    );

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
