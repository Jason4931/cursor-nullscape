import { death, mouse } from "../entityHost.js";
import { getCameraPos, playSound } from "../main.js";

const video = document.createElement("video");
video.src = "./ASSET/Misc/CelestialIntro.mp4";
video.autoplay = true;
video.loop = false;
video.muted = true;
const BG = new Image();
BG.src = "./ASSET/Misc/CelestialBG.png";

export function setup(host) {
  const state = {
    VIDopacity: 0,
    BGopacity: 1,
    VidStart: false,
    VidEnd: false,
    sound: [false, false, false, false, false],
    timer: 0,
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (state.timer >= 30) return;
    state.BGopacity = Math.min(state.timer, 1);
    if (state.timer == 0) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Celestial_Intro.ogg`,
        1.1,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }
    if (state.timer >= 1 && !state.VidStart) {
      state.VidStart = true;
      state.VIDopacity = 1;
      video.play();
    } else if (state.timer >= 29.5 && !state.VidEnd) {
      state.VidEnd = true;
      state.VIDopacity = 0;
    }
    if (state.timer >= 1.033 && !state.sound[0]) {
      state.sound[0] = true;
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Celestial_Talk_${Math.floor(1 + Math.random() * 8)}.ogg`,
        undefined,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }
    if (state.timer >= 6 && !state.sound[1]) {
      state.sound[1] = true;
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Celestial_Talk_${Math.floor(1 + Math.random() * 8)}.ogg`,
        undefined,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }
    if (state.timer >= 10.9 && !state.sound[2]) {
      state.sound[2] = true;
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Celestial_Talk_${Math.floor(1 + Math.random() * 8)}.ogg`,
        undefined,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }
    if (state.timer >= 16.033 && !state.sound[3]) {
      state.sound[3] = true;
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Celestial_Talk_${Math.floor(1 + Math.random() * 8)}.ogg`,
        undefined,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }
    if (state.timer >= 20.033 && !state.sound[4]) {
      state.sound[4] = true;
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Celestial_Talk_${Math.floor(1 + Math.random() * 8)}.ogg`,
        undefined,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }
    state.timer += dt;
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (state.timer >= 30) return;

    ctx.save();
    const cam = getCameraPos();

    const shrinkT = Math.min(Math.max((state.timer - 29.5) / 0.5, 0), 1);
    ctx.globalAlpha = state.BGopacity;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = cam.x + w / 2;
    const cy = cam.y + h / 2;
    const shrinkW = w * (1 - shrinkT);
    const shrinkH = h * (1 - shrinkT);
    ctx.drawImage(BG, cx - shrinkW / 2, cam.y, shrinkW, h);
    ctx.drawImage(BG, cam.x, cy - shrinkH / 2, w, shrinkH);

    ctx.globalAlpha = state.VIDopacity;
    ctx.drawImage(video, cam.x, cam.y, window.innerWidth, window.innerHeight);

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
