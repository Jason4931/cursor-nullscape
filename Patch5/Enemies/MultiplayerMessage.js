import { death, mouse } from "../entityHost.js";
import { getCameraPos, playSound } from "../main.js";

export function setup(host, value) {
  const state = {
    show: false,
  }
  const floatingText = {
    text: "",
    t: 0,
    duration: 1,
    active: false,
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

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
    if (!state.show) {
      state.show = true;
      showText(value);
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    const cam = getCameraPos();

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
      const lineHeight = textWeight * 0.75;
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
          ctx.scale(scale * stretch, scale * 1.333);

          ctx.fillText(char, charWidth / 2, 0);

          ctx.restore();

          offsetX += charWidth;
          globalIndex++;
        }
      }
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw, name: "CelestialIntro" });
  return unregister;
}
