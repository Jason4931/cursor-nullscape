import { death, mouse } from "../entityHost.js";
import { getCameraPos, playSound, ability, wasdMode } from "../main.js";

const OperatorIdle = new Image();
OperatorIdle.src = "./ASSET/Enemies/Malfunction/Voidbound_Operator_Idle.png";
const OperatorDanger = new Image();
OperatorDanger.src =
  "./ASSET/Enemies/Malfunction/Voidbound_Operator_Active.png";
const OperatorKilling = new Image();
OperatorKilling.src =
  "./ASSET/Enemies/Malfunction/Voidbound_Operator_Killing.png";

export function setup(host) {
  const state = {
    opacity: 1,
    enemy: OperatorIdle,

    phase: "idle",
    timer: 0,

    idleDuration: 0,
    spawnDuration: 0.5,
    disableDuration: 1,
    watchDuration: 5.5,
    watch2Duration: 3.5,
    watch3Duration: 3.5,
    idleSound: null,
    attackSound: null,
    despawn: false,

    abilityLongerCooldown: 0,
    safe: true,

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

  function enterIdle() {
    state.phase = "idle";
    state.timer = 0;
    state.idleDuration = 0;
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
    if (state.despawn) return;

    state.timer += dt;
    if (ability) {
      state.abilityLongerCooldown = 30;
    } else {
      if (state.abilityLongerCooldown > 0) state.abilityLongerCooldown--;
    }

    if (state.phase === "idle") {
      if (state.timer >= state.idleDuration) {
        state.phase = "spawn";
        state.timer = 0;
        playSound(
          "./ASSET/Sound/Enemies/Malfunction/Voidbound_Operator_Spawn.ogg",
        );
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

        state.lastMouseX = wasdMode ? mouse.x : mouse._clientX;
        state.lastMouseY = wasdMode ? mouse.y : mouse._clientY;
        state.opacity = 1;
        state.idleSound = playSound(
          "./ASSET/Sound/Enemies/Malfunction/Voidbound_Operator_Ticking.ogg",
        );
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

      const dx = (wasdMode ? mouse.x : mouse._clientX) - state.lastMouseX;
      const dy = (wasdMode ? mouse.y : mouse._clientY) - state.lastMouseY;

      if (dx === 0 && dy === 0) {
        state.stillTimer += dt;
        if (
          state.stillTimer >= 0.1 &&
          state.abilityLongerCooldown == 0 &&
          !state.death
        ) {
          state.safe = true;
        }
      } else {
        state.safe = false;
        state.stillTimer = 0;
        state.lastMouseX = wasdMode ? mouse.x : mouse._clientX;
        state.lastMouseY = wasdMode ? mouse.y : mouse._clientY;
      }

      if (
        state.timer >= state.watchDuration - 0.5 &&
        state.timer < state.watchDuration
      ) {
        const prev = state.enemy;
        state.enemy = OperatorDanger;
        state.abilityLongerCooldown -= 30;
        if (state.abilityLongerCooldown < 0) state.abilityLongerCooldown = 0;
        if (prev != state.enemy) {
          if (state.idleSound) state.idleSound();
          state.attackSound = playSound(
            "./ASSET/Sound/Enemies/Malfunction/Voidbound_Operator_Attacking.ogg",
          );
        }
        if (state.safe && prev == state.enemy) {
          state.phase = "watch2";
          state.timer = 0;
          state.jitterRot = 0;
          state.enemy = OperatorIdle;
          if (state.attackSound) state.attackSound();
          playSound(
            "./ASSET/Sound/Enemies/Malfunction/Voidbound_Operator_Success.ogg",
          );
          state.idleSound = playSound(
            "./ASSET/Sound/Enemies/Malfunction/Voidbound_Operator_Ticking_Short.ogg",
          );
        }
      }

      if (state.timer >= state.watchDuration && !state.death) {
        state.death = true;
        state.jitterRot = 0;
        state.enemy = OperatorKilling;
        playSound(
          "./ASSET/Sound/Enemies/Malfunction/Voidbound_Operator_Fail.ogg",
        );
        death("VoidboundOperator");
        setTimeout(() => {
          state.phase = "disable";
          state.timer = 0;
          state.jitterRot = 0;
          state.enemy = OperatorIdle;
        }, 500);
      }
    } else if (state.phase === "watch2") {
      const cam = getCameraPos();
      state.x = cam.x + window.innerWidth / 4 - state.size / 4;
      state.y = cam.y + window.innerHeight / 2 + state.size / 4;

      state.jitterTimer += dt;
      if (state.jitterTimer >= 0.25 && !state.death) {
        state.jitterTimer -= 0.25;
        if (state.jitterRot == 0.1) state.jitterRot = -0.1;
        else state.jitterRot = 0.1;
      }

      const dx = (wasdMode ? mouse.x : mouse._clientX) - state.lastMouseX;
      const dy = (wasdMode ? mouse.y : mouse._clientY) - state.lastMouseY;

      if (dx === 0 && dy === 0) {
        state.stillTimer += dt;
        if (
          state.stillTimer >= 0.1 &&
          state.abilityLongerCooldown == 0 &&
          !state.death
        ) {
          state.safe = true;
        }
      } else {
        state.safe = false;
        state.stillTimer = 0;
        state.lastMouseX = wasdMode ? mouse.x : mouse._clientX;
        state.lastMouseY = wasdMode ? mouse.y : mouse._clientY;
      }

      if (
        state.timer >= state.watch2Duration - 0.5 &&
        state.timer < state.watch2Duration
      ) {
        const prev = state.enemy;
        state.enemy = OperatorDanger;
        state.abilityLongerCooldown -= 30;
        if (state.abilityLongerCooldown < 0) state.abilityLongerCooldown = 0;
        if (prev != state.enemy) {
          if (state.idleSound) state.idleSound();
          state.attackSound = playSound(
            "./ASSET/Sound/Enemies/Malfunction/Voidbound_Operator_Attacking.ogg",
          );
        }
        if (state.safe && prev == state.enemy) {
          state.phase = "watch3";
          state.timer = 0;
          state.jitterRot = 0;
          state.enemy = OperatorIdle;
          if (state.attackSound) state.attackSound();
          playSound(
            "./ASSET/Sound/Enemies/Malfunction/Voidbound_Operator_Success.ogg",
          );
          state.idleSound = playSound(
            "./ASSET/Sound/Enemies/Malfunction/Voidbound_Operator_Ticking_Short.ogg",
          );
        }
      }

      if (state.timer >= state.watch2Duration && !state.death) {
        state.death = true;
        state.jitterRot = 0;
        state.enemy = OperatorKilling;
        playSound(
          "./ASSET/Sound/Enemies/Malfunction/Voidbound_Operator_Fail.ogg",
        );
        death("VoidboundOperator");
        setTimeout(() => {
          state.phase = "disable";
          state.timer = 0;
          state.jitterRot = 0;
          state.enemy = OperatorIdle;
        }, 500);
      }
    } else if (state.phase === "watch3") {
      const cam = getCameraPos();
      state.x = cam.x + window.innerWidth / 4 + state.size / 4;
      state.y = cam.y + window.innerHeight / 2 + state.size / 4;

      state.jitterTimer += dt;
      if (state.jitterTimer >= 0.25 && !state.death) {
        state.jitterTimer -= 0.25;
        if (state.jitterRot == 0.1) state.jitterRot = -0.1;
        else state.jitterRot = 0.1;
      }

      const dx = (wasdMode ? mouse.x : mouse._clientX) - state.lastMouseX;
      const dy = (wasdMode ? mouse.y : mouse._clientY) - state.lastMouseY;

      if (dx === 0 && dy === 0) {
        state.stillTimer += dt;
        if (
          state.stillTimer >= 0.1 &&
          state.abilityLongerCooldown == 0 &&
          !state.death
        ) {
          state.safe = true;
        }
      } else {
        state.safe = false;
        state.stillTimer = 0;
        state.lastMouseX = wasdMode ? mouse.x : mouse._clientX;
        state.lastMouseY = wasdMode ? mouse.y : mouse._clientY;
      }

      if (
        state.timer >= state.watch3Duration - 0.5 &&
        state.timer < state.watch3Duration
      ) {
        const prev = state.enemy;
        state.enemy = OperatorDanger;
        state.abilityLongerCooldown -= 30;
        if (state.abilityLongerCooldown < 0) state.abilityLongerCooldown = 0;
        if (prev != state.enemy) {
          if (state.idleSound) state.idleSound();
          state.attackSound = playSound(
            "./ASSET/Sound/Enemies/Malfunction/Voidbound_Operator_Attacking.ogg",
          );
        }
        if (state.safe && prev == state.enemy) {
          state.phase = "disable";
          state.timer = 0;
          state.jitterRot = 0;
          state.enemy = OperatorIdle;
          if (state.attackSound) state.attackSound();
          playSound(
            "./ASSET/Sound/Enemies/Malfunction/Voidbound_Operator_Cleared.ogg",
          );
        }
      }

      if (state.timer >= state.watch3Duration && !state.death) {
        state.death = true;
        state.jitterRot = 0;
        state.enemy = OperatorKilling;
        playSound(
          "./ASSET/Sound/Enemies/Malfunction/Voidbound_Operator_Fail.ogg",
        );
        death("VoidboundOperator");
        setTimeout(() => {
          state.phase = "disable";
          state.timer = 0;
          state.jitterRot = 0;
          state.enemy = OperatorIdle;
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
        state.despawn = true;
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (state.phase == "idle" || state.despawn) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    ctx.translate(Math.round(state.x), Math.round(state.y));
    ctx.rotate(state.jitterRot);

    ctx.drawImage(
      state.enemy,
      Math.round(-state.size),
      Math.round(-state.size),
      Math.round(state.size * 2),
      Math.round(state.size * 2),
    );

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
