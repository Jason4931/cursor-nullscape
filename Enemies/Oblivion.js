import { death, mouse } from "../entityHost.js";
import {
  isCursorOnFloor,
  setOblivionActive,
  moveCamera,
  getCameraPos,
  TILE,
  playSound,
  uldm,
} from "../main.js";
const Oblivion_meter = [];
const Oblivion_misc_particle = [];
export const Oblivion_Rift_Animation = [];
const Oblivion_Convergence_Particles = new Image();
const METER_W = 310;
const METER_H = 1023;
async function loadAssets() {
  if (Oblivion_meter.length) return;
  const loadBatch = async (target, folder, count) => {
    const promises = [];
    for (let i = 1; i <= count; i++) {
      const img = new Image();
      target.push(img);
      promises.push(
        new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          img.src = `./ASSET/Curses/Oblivion/${folder}/Layer ${i}.png`;
        }),
      );
    }
    await Promise.all(promises);
  };
  await loadBatch(Oblivion_meter, "Oblivion_meter", 24);
  loadBatch(Oblivion_misc_particle, "Oblivion_misc_particle", 16);
  loadBatch(Oblivion_Rift_Animation, "Oblivion_Rift_Animation", 28);
  Oblivion_Convergence_Particles.src =
    "./ASSET/Curses/Oblivion/Oblivion_Convergence_Particles.png";
}

export function setup(host, showFloor, casualMode, hardMode) {
  loadAssets();
  const state = {
    time: 0,
    phase: 3,
    duration: 60 + Math.random(),
    opacity: 1,
    offFloorTime: 0,
    shakeX: 0,
    shakeY: 0,
    meterShake: 0,
    sound: null,
    soundTime: 0,
    ambience: null,
    death: false,
    deathVfxTime: -1,

    meterLayers: Oblivion_meter,
    meter: null,
    meterLayer: 0,
    miscParticleLayers: Oblivion_misc_particle,
    miscParticle: null,
    miscParticleLayer: 0,
    miscParticleX: 0,
    miscParticleY: 0,
    miscParticleRot: 0,

    particleOffsetY: 0,
  };
  function randomizeMiscParticlePosition() {
    const cam = getCameraPos();
    state.miscParticleX = cam.x + Math.random() * window.innerWidth - 128;
    state.miscParticleY = cam.y + Math.random() * window.innerHeight - 128;
    state.miscParticleRot = Math.PI * 2 * Math.random();
  }
  randomizeMiscParticlePosition();
  function update(dt) {
    if (state.phase === 0) {
      const speed = 1000 + state.offFloorTime * 1000;
      state.particleOffsetY += speed * dt;
    } else {
      state.particleOffsetY = 0;
    }
    state.miscParticleLayer++;
    if (state.miscParticleLayer > state.miscParticleLayers.length) {
      state.miscParticleLayer = 1;
      randomizeMiscParticlePosition();
    }
    state.miscParticle = state.miscParticleLayers[state.miscParticleLayer - 1];
    state.time += dt;
    if (state.deathVfxTime >= 0) {
      state.deathVfxTime += dt;
      if (state.deathVfxTime > 1.5) state.deathVfxTime = -1;
    }
    if (state.phase === 0) {
      state.soundTime += dt;
      if (!state.sound) {
        const t = Math.min(state.offFloorTime / 2, 1);
        state.sound = playSound(
          "./ASSET/Sound/Enemies/Oblivion/Oblivion_Active_In-Game.ogg",
          (showFloor ? 1 : 0.667) *
            1.25 *
            (casualMode ? 0.667 : hardMode ? 1 : 0.8),
          { start: t, end: 1 },
        );
      }
      if (!isCursorOnFloor()) {
        state.offFloorTime += (showFloor ? 1 : 0.667) * dt;
        if (
          state.offFloorTime >= (casualMode ? 3 : hardMode ? 2 : 2.5) &&
          !state.death
        ) {
          state.death = true;
          state.deathVfxTime = 0;
          setTimeout(() => {
            death("Oblivion");
            playSound("./ASSET/Sound/Enemies/Oblivion/Oblivion_Death.ogg");
          }, 1000);
          state.time = 100;
          playSound(
            "./ASSET/Sound/Enemies/Oblivion/Oblivion_death_sound_new.ogg",
            3,
          );
        }
      } else {
        if (!state.death)
          state.offFloorTime -= (showFloor ? 1 : 0.667) * 2 * dt;
        if (state.offFloorTime < 0) state.offFloorTime = 0;
        if (state.sound && state.soundTime >= 0.1) {
          state.sound();
          state.sound = null;
          state.soundTime = 0;
        }
      }
    } else {
      if (!state.death) state.offFloorTime -= (showFloor ? 1 : 0.667) * 2 * dt;
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
        setOblivionActive(1, true);
        playSound("./ASSET/Sound/Enemies/Oblivion/Oblivion_Spawn.ogg");
        if (state.ambience) {
          state.ambience();
          state.ambience = null;
        }
        state.phase = 1;
        state.time = 0;
      }
    } else if (state.phase === 1) {
      const t = Math.min(state.time / 3, 1);
      setOblivionActive(1 - t, true);
      state.opacity = 1 - t;
      if (state.time >= 3) {
        setOblivionActive(0);
        state.phase = 2;
        state.time = 0;
        state.duration = 60 + Math.random();
        state.death = false;
      }
    } else if (state.phase === 2) {
      state.opacity = 0;
      if (state.time >= state.duration) {
        setOblivionActive(0);
        state.phase = 3;
        state.time = 0;
      }
    } else if (state.phase === 3) {
      state.opacity = 0;
      setOblivionActive(0);
      if (state.time <= dt)
        playSound("./ASSET/Sound/Enemies/Oblivion/Oblivion_Meter_Active.wav");
      if (state.time >= 2) {
        state.phase = 4;
        state.time = 0;
        state.ambience = playSound(
          "./ASSET/Sound/Enemies/Oblivion/Oblivion_Ambience.ogg",
        );
      }
    } else if (state.phase === 4) {
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
    const progress = Math.min(
      state.offFloorTime / (casualMode ? 3 : hardMode ? 2 : 2.5),
      1,
    );
    state.meterLayer = Math.min(
      state.meterLayers.length,
      Math.floor(progress * state.meterLayers.length) + 1,
    );
    state.meter = state.meterLayers[state.meterLayer - 1];
    if (state.phase === 3) {
      if (state.time < 1) state.meterShake = 6 * Math.max(0, 1 - state.time);
      else state.meterShake = 12 * Math.max(0, 2 - state.time);
    } else if (state.phase === 4) {
      state.meterShake = state.time < 2 ? 18 * (1 - state.time / 2) : 0;
    } else if (state.phase === 0) {
      const t = Math.min(state.offFloorTime / 2, 1);
      state.meterShake = t * t * 12;
    } else {
      state.meterShake = 0;
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
    if (state.phase === 0 && !uldm) {
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
    let miscAlpha = 0;
    if (state.phase === 4 || state.phase === 0) miscAlpha = 0.5;
    else if (state.phase === 1) miscAlpha = 0.5 * Math.max(0, 1 - state.time);
    if (miscAlpha > 0 && !uldm) {
      ctx.save();
      ctx.globalAlpha = miscAlpha;
      ctx.translate(state.miscParticleX, state.miscParticleY);
      ctx.rotate(state.miscParticleRot);
      ctx.drawImage(state.miscParticle, 0, 0);
      ctx.restore();
    }
    let meterAlpha = 0;
    if (state.phase === 3 || state.phase === 4 || state.phase === 0)
      meterAlpha = 1;
    else if (state.phase === 1) meterAlpha = Math.max(0, 1 - state.time);
    if (meterAlpha > 0) {
      const meterHeight = window.innerHeight * 0.75;
      const meterWidth = (meterHeight * METER_W) / METER_H;
      const shake = state.meterShake;
      const meterX = cam.x + (Math.random() * 2 - 1) * shake;
      const meterY =
        cam.y +
        (window.innerHeight - meterHeight) / 2 +
        (Math.random() * 2 - 1) * shake;
      ctx.save();
      ctx.globalAlpha = meterAlpha;
      ctx.translate(meterX + meterWidth / 2, meterY + meterHeight / 2);
      ctx.rotate((Math.random() * 2 - 1) * shake * 0.003);
      ctx.drawImage(
        state.meter,
        -meterWidth / 2,
        -meterHeight / 2,
        meterWidth,
        meterHeight,
      );
      ctx.restore();
    }
    if (state.deathVfxTime >= 0) {
      const t = state.deathVfxTime;
      ctx.save();
      if (t < 1) {
        const p = Math.min(1, t / 0.25);
        const eased = 1 - (1 - p) * (1 - p);
        const radius = Math.max(0.01, 100 * eased);
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          radius,
        );
        gradient.addColorStop(0, "rgba(255, 0, 255, 0)");
        gradient.addColorStop(0.8, "rgba(255, 0, 255, 0)");
        gradient.addColorStop(
          0.9,
          `rgba(${192 + Math.floor(64 * Math.random())}, 0, ${192 + Math.floor(64 * Math.random())}, 1)`,
        );
        gradient.addColorStop(1, "rgba(255, 0, 255, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const p = Math.min(1, (t - 1) / 0.5);
        ctx.globalAlpha = 1 - p;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 100 + 100 * p, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }
  const unregister = host.register({ update, draw });
  return unregister;
}
