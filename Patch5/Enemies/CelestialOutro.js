import { death, mouse } from "../entityHost.js";
import { getCameraPos, playSound, spawnCelestialAfterEnding } from "../main.js";

const Blossom = new Image();
Blossom.src = "./ASSET/Misc/Blossom.png";

export function setup(host) {
  const state = {
    BGopacity: 1,
    BGcolor: 255,
    sound: [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
    done: false,
    timer: 0,
    enemy: Blossom,
    wobbleStrength: 1,
  };
  const floatingText = {
    text: "",
    t: 0,
    duration: 1,
    active: false,
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (state.timer >= 60) return;

    function showText(text, duration = 5) {
      floatingText.text = text;
      floatingText.t = 0;
      floatingText.duration = duration;
      floatingText.active = true;
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Talking/Celestial_Talk_5.ogg`,
        undefined,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }
    if (floatingText.active) {
      floatingText.t += dt;
      if (floatingText.t >= floatingText.duration) {
        floatingText.active = false;
      }
    }

    state.BGopacity =
      state.timer <= 58
        ? Math.min(state.timer / 2, 1)
        : Math.max(1 - (state.timer - 58) / 2, 0);
    if (state.timer == 0) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Celestial_Cutscene_Music.ogg`,
        undefined,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }
    if (state.timer >= 2 && !state.sound[0]) {
      state.sound[0] = true;
      showText("YOU HOLD WHAT THAT\nFLOWER ROTTED WITHOUT,");
    }
    if (state.timer >= 7 && !state.sound[1]) {
      state.sound[1] = true;
      showText("A LIGHT BRIGHTER\nTHAN BRIGHT.");
    }
    if (state.timer >= 12 && !state.sound[2]) {
      state.sound[2] = true;
      showText("ROOTS THAT RUN DEEPER\nTHAN VOID.");
    }
    if (state.timer >= 17 && !state.sound[3]) {
      state.sound[3] = true;
      showText("BUT YOUR TAINTED\nCHARADE WILL NEVER\nSPROUT.");
    }
    if (state.timer >= 22 && !state.sound[4]) {
      state.sound[4] = true;
      showText("BLINDED BY YOUR OWN\nLUMINESCENCE,");
    }
    if (state.timer >= 27 && !state.sound[5]) {
      state.sound[5] = true;
      showText("IGNORANT OF OUR\nABYSSAL FATE BELOW.");
    }
    if (state.timer >= 32 && !state.sound[6]) {
      state.sound[6] = true;
      showText("WHEN YOUR PETALS GET\nCONSUMED WITHIN,");
    }
    if (state.timer >= 37 && !state.sound[7]) {
      state.sound[7] = true;
      showText("I REMAIN HERE.", 2.5);
    }
    if (state.timer >= 39.5 && !state.sound[8]) {
      state.sound[8] = true;
      showText("WATCHING.", 2.5);
    }
    if (state.timer >= 42 && !state.sound[9]) {
      state.sound[9] = true;
      showText("WAITING.", 2.5);
    }
    if (state.timer >= 58 && !state.done) {
      state.done = true;
      spawnCelestialAfterEnding();
    }

    if (state.timer >= 43 && state.BGcolor > 0) {
      state.BGcolor -= dt * 128;
      if (state.BGcolor < 0) state.BGcolor = 0;
    }
    if (state.timer >= 42 && state.wobbleStrength > 0) {
      state.wobbleStrength -= dt * 0.25;
      if (state.wobbleStrength < 0) state.wobbleStrength = 0;
    }
    state.timer += dt;
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (state.timer >= 60) return;

    ctx.save();
    const cam = getCameraPos();

    ctx.globalAlpha = state.BGopacity;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (state.timer <= 60) {
      ctx.fillStyle = `rgb(${state.BGcolor},${state.BGcolor},${state.BGcolor})`;
      ctx.fillRect(cam.x, cam.y, w, h);
    }

    if (state.timer >= 2 && state.timer <= 48) {
      const x = cam.x + window.innerWidth / 2;
      const y = cam.y + window.innerHeight / 2;
      const celestialSize = 400;

      ctx.globalAlpha = Math.min(1, Math.max(48 - state.timer, 0));

      const t = state.timer;
      const w = state.wobbleStrength;

      const wobbleX = Math.sin(t * 2.5) * 50 * w;
      const wobbleY = Math.cos(t * 2) * 34 * w;
      const wobbleRot = Math.sin(t * 2.25) * 0.1 * w;

      ctx.save();
      ctx.translate(Math.round(x + wobbleX), Math.round(y + wobbleY));
      ctx.rotate(wobbleRot);
      ctx.filter = `invert(${state.BGcolor / 255})`;
      ctx.drawImage(
        state.enemy,
        Math.round(-celestialSize / 2),
        Math.round(-celestialSize / 2),
        celestialSize,
        celestialSize,
      );
      ctx.restore();
    }

    if (floatingText.active) {
      const p = floatingText.t / floatingText.duration;
      const cam = getCameraPos();

      ctx.save();

      const textWeight = 100;
      ctx.font = `${textWeight}px CelestialFont`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const baseX = cam.x + window.innerWidth / 2;
      const baseY = cam.y + window.innerHeight / 2;

      const wt = state.timer;
      const wobbleX = Math.sin(wt * 1.5) * 40 * state.wobbleStrength;
      const wobbleY = Math.cos(wt * 1) * 27 * state.wobbleStrength;
      const wobbleRot = Math.sin(wt * 1.25) * 0.1 * state.wobbleStrength;
      ctx.translate(baseX + wobbleX, baseY + wobbleY);
      ctx.rotate(wobbleRot);

      const lines = floatingText.text.split("\n");
      const lineHeight = textWeight;
      const totalHeight = (lines.length - 1) * lineHeight;

      const stretchPhase = Math.min(floatingText.t / 0.1, 1);
      const stretch = stretchPhase < 1 ? 1 + (1 - stretchPhase) * 12 : 1;

      const flickerStart = floatingText.duration - 0.25;
      if (floatingText.t >= flickerStart) {
        ctx.fillStyle = Math.random() > 0.5 ? "white" : "black";
      } else {
        ctx.fillStyle = "black";
      }

      let globalIndex = 0;
      for (let line = 0; line < lines.length; line++) {
        const text = lines[line];

        const totalWidth = ctx.measureText(text).width;
        let offsetX = -totalWidth / 2;

        // const lineY = baseY + line * lineHeight - totalHeight / 2;
        const lineY = line * lineHeight - totalHeight / 2;

        for (let i = 0; i < 3; i++) {
          const w = 50 + Math.random() * (totalWidth * 0.5);
          const h = 20 + Math.random() * textWeight;

          const offsetX = (Math.random() - 0.5) * totalWidth * 0.5 - 10;
          const offsetY = (Math.random() - 0.5) * textWeight * 0.5;

          ctx.save();

          ctx.globalAlpha = 0.25 + Math.random() * 0.75;
          ctx.fillStyle =
            floatingText.t >= flickerStart
              ? Math.random() < 0.5
                ? "white"
                : "black"
              : "white";

          // ctx.fillRect(baseX + offsetX - w / 2, lineY + offsetY - h / 2, w, h);
          ctx.fillRect(offsetX - w / 2, lineY + offsetY - h / 2, w, h);

          ctx.restore();
        }
      }
      globalIndex = 0;
      for (let line = 0; line < lines.length; line++) {
        const text = lines[line];

        const totalWidth = ctx.measureText(text).width;
        let offsetX = -totalWidth / 2;

        // const lineY = baseY + line * lineHeight - totalHeight / 2;
        const lineY = line * lineHeight - totalHeight / 2;

        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const charWidth = ctx.measureText(char).width;

          const t = floatingText.t * 2;
          const seed = globalIndex * 123.456;

          const wobbleX = Math.sin(t + seed) * 1;
          const wobbleY = Math.cos(t * 1.3 + seed) * 2;

          const rot = Math.sin(t + seed) * ((15 * Math.PI) / 180);
          const scale = 0.9 + (Math.sin(seed) * 0.5 + 0.5) * 0.1;

          ctx.save();

          // ctx.translate(baseX + offsetX + wobbleX, lineY + wobbleY);
          ctx.translate(offsetX + wobbleX, lineY + wobbleY);
          ctx.rotate(rot);
          ctx.scale(scale * stretch, scale);

          ctx.fillText(char, charWidth / 2, 0);

          ctx.restore();

          offsetX += charWidth;
          globalIndex++;
        }
      }
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw, name: "CelestialCutscene" });
  return unregister;
}
