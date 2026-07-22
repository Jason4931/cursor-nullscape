import { death, mouse } from "../entityHost.js";
import { getCameraPos, playSound, spawnCelestialAfterIntro } from "../main.js";

const Celestial_Cocoon = [];
for (let i = 1; i <= 30; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Celestial/Celestial_Cocoon/Layer ${i}.png`;
  Celestial_Cocoon.push(img);
}
const Celestial_CocoonEyesOpening = [];
for (let i = 1; i <= 30 * 1.5; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Celestial/Celestial_CocoonEyesOpening/Layer ${Math.ceil(i / 1.5)}.png`;
  Celestial_CocoonEyesOpening.push(img);
}
const Celestial_CocoonBreakFree = [];
for (let i = 1; i <= 30 * 1.5; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Celestial/Celestial_CocoonBreakFree/Layer ${Math.ceil(i / 1.5)}.png`;
  Celestial_CocoonBreakFree.push(img);
}
const BG = new Image();
BG.src = "./ASSET/Misc/CelestialIntroBG.png";
const Flower = new Image();
Flower.src = "./ASSET/Misc/CelestialFlower.png";
const Title = new Image();
Title.src = "./ASSET/Misc/CelestialTitle.png";

export function setup(host) {
  const state = {
    BGopacity: 1,
    sound: [false, false, false, false, false, false, false],
    timer: 0,
    circles: [],
    layers: Celestial_Cocoon,
    enemy: null,
    layer: 0,
  };
  const floatingText = {
    text: "",
    t: 0,
    duration: 1,
    active: false,
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (state.timer >= 34) return;

    if (state.layers == Celestial_Cocoon) {
      state.layer++;
      if (state.layer > state.layers.length) state.layer = 1;
    } else {
      if (state.layer < state.layers.length) state.layer++;
    }
    state.enemy = state.layers[state.layer - 1];

    function showText(text) {
      floatingText.text = text;
      floatingText.t = 0;
      floatingText.duration = 4.9;
      floatingText.active = true;
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Talking/Celestial_Talk_${Math.floor(1 + Math.random() * 8)}.ogg`,
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

    const cam = getCameraPos();
    if (Math.random() < 0.5 && state.timer >= 2 && state.timer <= 28.5) {
      state.circles.push({
        x: cam.x + 100 + Math.random() * (window.innerWidth - 200),
        y: cam.y + 100 + Math.random() * (window.innerHeight - 200),
        radius: 50 + Math.random() * 150,
        color: Math.random() < 0.5 ? "255,0,255" : "255,0,64",
        t: 0,
      });
    }
    for (let i = state.circles.length - 1; i >= 0; i--) {
      const c = state.circles[i];
      c.t += dt;
      if (c.t >= 2) {
        state.circles.splice(i, 1);
      }
    }

    state.BGopacity = Math.min(state.timer / 2, 1);
    if (state.timer == 0) {
      playSound(
        `./ASSET/Sound/Enemies/Celestial/Celestial_Intro.ogg`,
        undefined,
        undefined,
        undefined,
        undefined,
        "50",
      );
    }
    if (state.timer >= 2 && !state.sound[0]) {
      state.sound[0] = true;
      showText(
        "YOU REMIND ME OF A\nFLOWER THAT HAD\nREACHED FULL BLOOM IN\nTHE GARDENS.",
      );
    }
    if (state.timer >= 6.9 && !state.sound[1]) {
      state.sound[1] = true;
      showText(
        "IT CHASED THE\nIMPOSSIBLE BY\nBLOSSOMING UNDER THE\nHARSHEST CONDITIONS.",
      );
    }
    if (state.timer >= 11.8 && !state.sound[2]) {
      state.sound[2] = true;
      showText(
        "YET IT WAS THAT PRIDE\nTHAT CAUSED IT TO ROT FROM\nTHE INSIDE OUT.",
      );
    }
    if (state.timer >= 16.7 && !state.sound[3]) {
      state.sound[3] = true;
      showText("EVEN IF YOU BELIEVE IN\nYOUR OWN PETALS,");
    }
    if (state.timer >= 21.6 && !state.sound[4]) {
      state.sound[4] = true;
      state.layers = Celestial_CocoonEyesOpening;
      state.layer = 0;
      showText("YOU SHALL WILT IN THIS\nDANCE WITH ME.");
    }
    if (state.timer >= 26.5 && !state.sound[5]) {
      state.sound[5] = true;
      state.layers = Celestial_CocoonBreakFree;
      state.layer = 0;
    }
    if (state.timer >= 30 && !state.sound[6]) {
      state.sound[6] = true;
      spawnCelestialAfterIntro();
    }
    state.timer += dt;
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    if (state.timer >= 34) return;

    ctx.save();
    const cam = getCameraPos();

    const shrinkT = Math.min(Math.max((state.timer - 30.5) / 0.5, 0), 1);
    ctx.globalAlpha = state.BGopacity;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = cam.x + w / 2;
    const cy = cam.y + h / 2;
    const shrinkW = w * (1 - shrinkT);
    const shrinkH = h * (1 - shrinkT);
    if (state.timer >= 30.5) {
      ctx.drawImage(BG, cx - shrinkW / 2, cam.y, shrinkW, h);
      ctx.drawImage(BG, cam.x, cy - shrinkH / 2, w, shrinkH);
    } else {
      const scroll = (state.timer / 30.5) * window.innerWidth;
      {
        const x = cx - shrinkW / 2 - scroll;

        ctx.drawImage(BG, x, cam.y, shrinkW, h);
        ctx.drawImage(BG, x + shrinkW, cam.y, shrinkW, h);
      }
      {
        const x = cam.x - scroll;

        ctx.drawImage(BG, x, cy - shrinkH / 2, w, shrinkH);
        ctx.drawImage(BG, x + w, cy - shrinkH / 2, w, shrinkH);
      }
    }

    if (state.timer >= 2 && state.timer <= 28.5) {
      const x = cam.x + window.innerWidth / 2;
      const y = cam.y + window.innerHeight / 2;
      const flowerSize = 600;

      ctx.globalAlpha =
        state.timer <= 28
          ? Math.min((state.timer - 2) / 0.5, 1)
          : Math.max(1 - (state.timer - 28) / 0.5, 0);

      ctx.save();
      ctx.filter = "brightness(10%)";
      ctx.translate(x, y);
      ctx.rotate(-(state.timer / 28.5) * Math.PI + Math.PI / 8);
      ctx.drawImage(
        Flower,
        -flowerSize,
        -flowerSize,
        flowerSize * 2,
        flowerSize * 2,
      );
      ctx.restore();
      ctx.save();
      ctx.filter = "brightness(50%)";
      ctx.translate(x, y);
      ctx.rotate(-(state.timer / 28.5) * Math.PI);
      ctx.drawImage(
        Flower,
        -flowerSize,
        -flowerSize,
        flowerSize * 2,
        flowerSize * 2,
      );
      ctx.restore();
      ctx.save();
      ctx.filter = "brightness(10%)";
      ctx.translate(x, y);
      ctx.rotate((state.timer / 28.5) * Math.PI + Math.PI / 8);
      ctx.drawImage(
        Flower,
        -flowerSize / 2,
        -flowerSize / 2,
        flowerSize,
        flowerSize,
      );
      ctx.restore();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((state.timer / 28.5) * Math.PI);
      ctx.drawImage(
        Flower,
        -flowerSize / 2,
        -flowerSize / 2,
        flowerSize,
        flowerSize,
      );
      ctx.restore();
    }
    for (const c of state.circles) {
      let scale;

      if (c.t < 0.25) {
        scale = c.t / 0.25;
      } else {
        scale = 1 - (c.t - 0.25) / 1.75;
      }

      scale = Math.max(0, Math.min(scale, 1));
      const alpha = scale + (1 - (1 - scale) * (1 - scale) - scale) * 0.4;

      const r = c.radius * scale;

      if (Math.isFinite(c.x) && Math.isFinite(c.y) && Math.isFinite(r)) {
        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);

        grad.addColorStop(0.0, `rgba(0,0,0,${alpha})`);
        grad.addColorStop(0.75, `rgba(0,0,0,${alpha})`);
        grad.addColorStop(0.76, `rgba(${c.color},${alpha})`);
        grad.addColorStop(1.0, `rgba(${c.color},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (state.timer >= 2 && state.timer <= 28.5) {
      const x = cam.x + window.innerWidth / 2;
      const y = cam.y + window.innerHeight / 2;
      const celestialSize = 800;

      ctx.globalAlpha =
        state.timer <= 28
          ? Math.min((state.timer - 2) / 0.5, 1)
          : Math.max(1 - (state.timer - 28) / 0.5, 0);

      ctx.save();
      ctx.translate(Math.round(x), Math.round(y));
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
      const baseY = cam.y + window.innerHeight * 0.667;

      const lines = floatingText.text.split("\n");
      const lineHeight = textWeight;
      const totalHeight = (lines.length - 1) * lineHeight;

      const stretchPhase = Math.min(floatingText.t / 0.1, 1);
      const stretch = stretchPhase < 1 ? 1 + (1 - stretchPhase) * 12 : 1;

      const flickerStart = floatingText.duration - 0.25;
      if (floatingText.t >= flickerStart) {
        ctx.fillStyle = Math.random() > 0.5 ? "white" : "black";
      } else {
        ctx.fillStyle = "#ff0088";
      }

      let globalIndex = 0;
      for (let line = 0; line < lines.length; line++) {
        const text = lines[line];

        const totalWidth = ctx.measureText(text).width;
        let offsetX = -totalWidth / 2;

        const lineY = baseY + line * lineHeight - totalHeight / 2;

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
              : "black";

          ctx.fillRect(baseX + offsetX - w / 2, lineY + offsetY - h / 2, w, h);

          ctx.restore();
        }
      }
      globalIndex = 0;
      for (let line = 0; line < lines.length; line++) {
        const text = lines[line];

        const totalWidth = ctx.measureText(text).width;
        let offsetX = -totalWidth / 2;

        const lineY = baseY + line * lineHeight - totalHeight / 2;

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

          ctx.translate(baseX + offsetX + wobbleX, lineY + wobbleY);
          ctx.rotate(rot);
          ctx.scale(scale * stretch, scale);

          ctx.fillText(char, charWidth / 2, 0);

          ctx.restore();

          offsetX += charWidth;
          globalIndex++;
        }
      }
    }

    if (state.timer >= 31 && state.timer < 34) {
      const t = state.timer - 31;
      let scale = 0;
      let flowerScale = 0;
      if (t <= 0.5) {
        const p = t / 0.5;
        scale = 1 - (1 - p) * (1 - p);
      } else if (t <= 2.5) {
        scale = 1;
      } else {
        const p = (t - 2.5) / 0.5;
        scale = 1 - p * p;
      }
      if (t <= 0.5) {
        flowerScale = 0;
      } else if (t <= 1) {
        const p = (t - 0.5) / 0.5;
        flowerScale = 1 - (1 - p) * (1 - p);
      } else if (t <= 2.5) {
        flowerScale = 1;
      } else {
        const p = (t - 2.5) / 0.5;
        flowerScale = 1 - p * p;
      }

      const w = 1000 * scale;
      const h = w / 3;
      const flowerSize = 600 * flowerScale;

      const x = cam.x + window.innerWidth / 2;
      const y = cam.y + window.innerHeight / 2;

      ctx.globalAlpha = 1;
      ctx.save();
      ctx.filter = "brightness(15%)";
      ctx.translate(x, y);
      ctx.rotate(state.timer + Math.PI / 8);
      ctx.drawImage(
        Flower,
        -flowerSize / 2,
        -flowerSize / 2,
        flowerSize,
        flowerSize,
      );
      ctx.restore();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(state.timer);
      ctx.drawImage(
        Flower,
        -flowerSize / 2,
        -flowerSize / 2,
        flowerSize,
        flowerSize,
      );
      ctx.rotate(-state.timer);
      ctx.drawImage(Title, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw, name: "CelestialCutscene" });
  return unregister;
}
