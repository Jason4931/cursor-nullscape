import { death, mouse } from "../entityHost.js";
import { getCameraPos, TILE } from "../main.js";

export function setup(host) {
  const state = {
    timer: 1,
    beams: [],
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.timer += dt;

    if (state.timer >= 1) {
      state.timer = 0;

      const cam = getCameraPos();

      const vertical = Math.random() < 0.5;

      const screenX = Math.random() * window.innerWidth;
      const screenY = Math.random() * window.innerHeight;
      state.beams.push({
        t: 0,
        vertical,
        screenX,
        screenY,
        x: cam.x + screenX,
        y: cam.y + screenY,
      });
    }

    let clean = false;

    for (const beam of state.beams) {
      beam.t += dt;

      const cam = getCameraPos();
      beam.x = cam.x + beam.screenX;
      beam.y = cam.y + beam.screenY;

      if (beam.t >= 1.5) {
        beam.dead = true;
        clean = true;
      }
    }

    if (clean) {
      state.beams = state.beams.filter((b) => !b.dead);
    }

    for (const beam of state.beams) {
      if (beam.t < 1) continue;

      let width = TILE;

      const shrink = Math.min((beam.t - 1) / 0.5, 1);

      width *= 1 - shrink;

      if (beam.vertical) {
        if (Math.abs(mouse.x - beam.x) <= width * 0.5) {
          death("Laser");
        }
      } else {
        if (Math.abs(mouse.y - beam.y) <= width * 0.5) {
          death("Laser");
        }
      }
    }
  }

  function draw(ctx) {
    for (const beam of state.beams) {
      let width;
      let alpha;

      if (beam.t < 0.5) {
        const e = 1 - Math.pow(1 - beam.t / 0.5, 3);
        width = TILE * e;
        alpha = 0.5;
      } else if (beam.t < 1) {
        width = TILE;
        alpha = 0.5;
      } else {
        const t = Math.min((beam.t - 1) / 0.5, 1);
        width = TILE * (1 - t);
        alpha = 1;
      }

      ctx.save();

      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#fe1f6f";

      if (beam.vertical) {
        ctx.fillRect(
          beam.x - width / 2,
          beam.y - window.innerHeight,
          width,
          window.innerHeight * 2,
        );
      } else {
        ctx.fillRect(
          beam.x - window.innerWidth,
          beam.y - width / 2,
          window.innerWidth * 2,
          width,
        );
      }

      ctx.restore();
    }
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
