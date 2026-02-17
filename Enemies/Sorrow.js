import { death, mouse } from "../entityHost.js";
import {
  isCursorOnFloor,
  setSorrowActive,
  moveCamera,
  getCameraPos,
  TILE,
  playSound,
} from "../main.js";

export function setup(host) {
  const state = {
    time: 0,
    phase: 0,
    duration: 9 + Math.random(),
    opacity: 1,
    init: true,
    offFloorTime: 0,
    shakeX: 0,
    shakeY: 0,
    sound: null,
    soundTime: 0,
    deathsound: false,
  };

  const RAIN_COUNT = 40;
  const RAIN_RADIUS = 1000;

  function update(dt) {
    state.time += dt;

    if (state.init) {
      setSorrowActive(true);
      state.init = false;
    }

    if (state.phase === 0) {
      state.soundTime += dt;
      if (!state.sound)
        state.sound = playSound(
          "./ASSET/Sound/Enemies/Sorrow/SorrowNewSound.wav",
          2.6,
        );
      if (!isCursorOnFloor()) {
        state.offFloorTime += dt;
        if (state.offFloorTime >= 3) {
          death("Sorrow");
          if (!state.deathsound) {
            state.deathsound = true;
            playSound(
              "./ASSET/Sound/Enemies/Sorrow/SorrowDeathEffect.mp3.mpeg",
            );
          }
        }
      } else {
        state.offFloorTime -= dt;
        if (state.offFloorTime < 0) state.offFloorTime = 0;
        if (state.sound && state.soundTime >= 1) {
          state.sound();
          state.sound = null;
          state.soundTime = 0;
        }
      }
    } else {
      state.offFloorTime = 0;
    }

    if (state.phase === 0) {
      if (state.time >= state.duration) {
        setSorrowActive(false);
        playSound("./ASSET/Sound/Enemies/Sorrow/SorrowGone.mp3.mpeg");
        if (state.sound) {
          state.sound();
          state.sound = null;
        }
        state.phase = 1;
        state.time = 0;
      }
    } else if (state.phase === 1) {
      if (state.time >= 10) {
        setSorrowActive(true);
        state.phase = 0;
        state.soundTime = 0;
        state.time = 0;
        state.duration = 9 + Math.random();
      }
    }

    moveCamera(-state.shakeX, -state.shakeY, true);

    if (state.phase === 0 && state.offFloorTime > 0) {
      const t = Math.min(state.offFloorTime / 3, 1);
      const strength = t * t * 24;

      state.shakeX = (Math.random() * 2 - 1) * strength;
      state.shakeY = (Math.random() * 2 - 1) * strength;
    } else {
      state.shakeX = 0;
      state.shakeY = 0;
    }

    moveCamera(state.shakeX, state.shakeY, true);
  }

  function draw(ctx) {
    if (state.phase !== 0) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    const t = 6;
    ctx.fillStyle = "rgba(255, 0, 0, 1)";

    for (let i = 0; i < RAIN_COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = TILE + Math.random() * (RAIN_RADIUS - TILE);

      const x = Math.round(mouse.x + Math.cos(a) * r);
      const y = Math.round(mouse.y + Math.sin(a) * r + ((t + i * 17) % 40));
      const h = Math.round(6 + Math.random() * 6);

      ctx.fillRect(x, y, 1, h);
    }

    const cam = getCameraPos();

    const limit = 3;
    const progress = Math.min(state.offFloorTime / limit, 1);

    const barWidth = 20;
    const barHeight = window.innerHeight * 0.8;
    const marginLeft = 20;

    const centerY = cam.y + window.innerHeight / 2;
    const topY = centerY - barHeight / 2;
    const x = cam.x + marginLeft;

    ctx.globalAlpha = state.opacity * 0.6;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";
    ctx.strokeRect(x, topY, barWidth, barHeight);

    if (progress > 0) {
      const halfHeight = (barHeight / 2) * progress;

      const innerWidth = barWidth * 0.75;
      const innerHalfHeight = halfHeight * 0.99;

      const offsetX = x + (barWidth - innerWidth) / 2;

      ctx.fillStyle = "white";

      ctx.fillRect(
        offsetX,
        centerY - innerHalfHeight,
        innerWidth,
        innerHalfHeight,
      );

      ctx.fillRect(offsetX, centerY, innerWidth, innerHalfHeight);
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
