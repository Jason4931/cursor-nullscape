import { death, mouse } from "../entityHost.js";
import {
  isCursorOnFloor,
  setOblivionActive,
  moveCamera,
  getCameraPos,
  TILE,
  playSound,
} from "../main.js";
const Oblivion_Convergence_Particles = new Image();
Oblivion_Convergence_Particles.src =
  "./ASSET/Curses/Oblivion_Convergence_Particles.png";
export function setup(host) {
  const state = {
    time: 0,
    phase: 3,
    duration: 29 + Math.random(),
    opacity: 1,
    init: true,
    offFloorTime: 0,
    shakeX: 0,
    shakeY: 0,
    sound: null,
    soundTime: 0,
    ambience: null,
    death: false,

    particleOffsetY: 0,
  };
  function update(dt) {
    if (state.phase === 0) {
      const speed = 1000 + state.offFloorTime * 1000;
      state.particleOffsetY += speed * dt;
    } else {
      state.particleOffsetY = 0;
    }
    state.time += dt;
    if (state.init) {
      state.ambience = playSound(
        "./ASSET/Sound/Enemies/Oblivion/Oblivion_Ambience.ogg",
      );
      state.init = false;
    }
    if (state.phase === 0) {
      state.soundTime += dt;
      if (!state.sound) {
        const t = Math.min(state.offFloorTime / 2, 1);
        state.sound = playSound(
          "./ASSET/Sound/Enemies/Oblivion/Oblivion_Active_In-Game.ogg",
          undefined,
          { start: t, end: 1 },
        );
      }
      if (!isCursorOnFloor()) {
        state.offFloorTime += dt;
        if (state.offFloorTime >= 2 && !state.death) {
          state.death = true;
          death("Oblivion");
          state.time = 100;
          playSound("./ASSET/Sound/Enemies/Oblivion/Oblivion_Death.ogg");
        }
      } else {
        state.offFloorTime -= 2 * dt;
        if (state.offFloorTime < 0) state.offFloorTime = 0;
        if (state.sound && state.soundTime >= 0.1) {
          state.sound();
          state.sound = null;
          state.soundTime = 0;
        }
      }
    } else {
      state.offFloorTime -= 2 * dt;
      if (state.offFloorTime < 0) state.offFloorTime = 0;
      if (state.sound) {
        state.sound();
        state.sound = null;
        state.soundTime = 0;
      }
    }
    if (state.phase === 0) {
      state.opacity = 1;
      if (state.time >= 20) {
        setOblivionActive(1);
        playSound("./ASSET/Sound/Enemies/Oblivion/Oblivion_Spawn.ogg");
        if (state.ambience) {
          state.ambience();
          state.ambience = null;
        }
        state.phase = 1;
        state.time = 0;
        state.death = false;
      }
    } else if (state.phase === 1) {
      const t = Math.min(state.time / 3, 1);
      setOblivionActive(1 - t);
      state.opacity = 1 - t;
      if (state.time >= 3) {
        setOblivionActive(0);
        state.phase = 2;
        state.time = 0;
        state.duration = 29 + Math.random();
      }
    } else if (state.phase === 2) {
      state.opacity = 0;
      if (state.time >= state.duration) {
        setOblivionActive(0);
        state.phase = 3;
        state.time = 0;
        state.ambience = playSound(
          "./ASSET/Sound/Enemies/Oblivion/Oblivion_Ambience.ogg",
        );
      }
    } else if (state.phase === 3) {
      const t = Math.min(state.time / 5, 1);
      const eased = 1 - (1 - t) * (1 - t);
      setOblivionActive(eased);
      state.opacity = eased;
      if (state.time >= 5) {
        setOblivionActive(1);
        state.phase = 0;
        state.time = 0;
      }
    }
    moveCamera(-state.shakeX, -state.shakeY, true);
    if (state.phase === 0 && state.offFloorTime > 0) {
      const t = Math.min(state.offFloorTime / 2, 1);
      const strength = t * t * 12;
      state.shakeX = (Math.random() * 2 - 1) * strength;
      state.shakeY = (Math.random() * 2 - 1) * strength;
    } else {
      state.shakeX = 0;
      state.shakeY = 0;
    }
    moveCamera(state.shakeX, state.shakeY, true);
  }
  function draw(ctx) {
    if (state.phase == 2) return;
    ctx.save();
    const cam = getCameraPos();
    if (state.phase === 0) {
      const t = Math.min(state.offFloorTime / 0.5, 1);
      const alpha = t;

      const img = Oblivion_Convergence_Particles;
      const x = cam.x;
      const y = cam.y;
      const w = window.innerWidth;
      const h = (img.height * window.innerWidth) / img.width;

      const offsetY = state.particleOffsetY % h;

      ctx.globalAlpha = alpha * state.opacity;
      for (let i = -1; i <= 1; i++) {
        ctx.drawImage(img, x, y + i * h - offsetY, w, h);
      }

      ctx.globalAlpha = (state.offFloorTime / 2) * 0.333;
      ctx.fillStyle = "magenta";
      ctx.fillRect(cam.x, cam.y, window.innerWidth, window.innerHeight);

      ctx.globalAlpha = state.opacity;
    }
    const progress = Math.min(state.offFloorTime / 2, 1);
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
