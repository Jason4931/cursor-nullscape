import { death, mouse } from "../entityHost.js";
import { getCameraPos, moveCamera, TILE } from "../main.js";

export function setup(host, casualMode, hardMode) {
  const state = {
    timer: 1,
    cooldown: 1,
    beams: [],
    stompers: [],
    shakeX: 0,
    shakeY: 0,
    shakeStrength: 0,
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.timer += dt;

    if (state.timer >= state.cooldown) {
      state.timer -= state.cooldown;

      const cam = getCameraPos();

      const vertical = Math.random() < 0.5;

      const screenX = Math.random() * window.innerWidth;
      const screenY = Math.random() * window.innerHeight;

      if (Math.random() < (hardMode ? 0 : casualMode ? 1 : 0.5)) {
        state.cooldown = 1;
        state.beams.push({
          t: 0,
          vertical,
          screenX,
          screenY,
          x: cam.x + screenX,
          y: cam.y + screenY,
        });
      } else {
        state.cooldown = 2;
        state.stompers.push({
          t: 0,
          vertical,
          screenX,
          screenY,
          x: cam.x + screenX,
          y: cam.y + screenY,
        });
      }
    }

    state.shakeStrength -= 2 * dt;
    if (state.shakeStrength > 0) {
      if (state.shakeX && state.shakeY) {
        moveCamera(-state.shakeX, -state.shakeY, true);
        state.shakeX = 0;
        state.shakeY = 0;
      } else {
        const x =
          (Math.random() < 0.5 ? 1 : -1) *
          Math.min(state.shakeStrength, 1) *
          10;
        const y =
          (Math.random() < 0.5 ? 1 : -1) *
          Math.min(state.shakeStrength, 1) *
          10;
        moveCamera(x, y, true);
        state.shakeX = x;
        state.shakeY = y;
      }
    } else {
      state.shakeStrength = 0;
      if (state.shakeX && state.shakeY) {
        moveCamera(-state.shakeX, -state.shakeY, true);
        state.shakeX = 0;
        state.shakeY = 0;
      }
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
    for (const beam of state.stompers) {
      beam.t += dt;

      const cam = getCameraPos();
      beam.x = cam.x + beam.screenX;
      beam.y = cam.y + beam.screenY;

      if (beam.t >= 3) {
        beam.dead = true;
        clean = true;
      }
    }

    if (clean) {
      state.beams = state.beams.filter((b) => !b.dead);
      state.stompers = state.stompers.filter((b) => !b.dead);
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
    for (const beam of state.stompers) {
      if (beam.t < 2) continue;
      if (beam.t >= 2 && beam.t <= 2 + dt) {
        state.shakeStrength = 1;
        const push = 5;
        if (beam.vertical) {
          if (beam.screenY < window.innerHeight / 2) {
            moveCamera(0, -push);
          } else {
            moveCamera(0, push);
          }
        } else {
          if (beam.screenX < window.innerWidth / 2) {
            moveCamera(-push, 0);
          } else {
            moveCamera(push, 0);
          }
        }
      }

      const left = beam.x - beam.screenX;
      const top = beam.y - beam.screenY;
      const right = left + window.innerWidth;
      const bottom = top + window.innerHeight;

      const width = TILE * 5;

      let length;
      if (beam.t < 2.5) {
        length = beam.vertical ? window.innerHeight : window.innerWidth;
      } else {
        const t = Math.min(Math.max((beam.t - 2.5) / 0.5, 0), 1);
        const p = t * t;
        length =
          (beam.vertical ? window.innerHeight : window.innerWidth) * (1 - p);
      }

      if (beam.vertical) {
        const x0 = beam.x - width / 2;
        const x1 = beam.x + width / 2;

        let y0, y1;
        if (beam.screenY < window.innerHeight / 2) {
          y0 = top;
          y1 = top + length;
        } else {
          y0 = bottom - length;
          y1 = bottom;
        }

        if (mouse.x >= x0 && mouse.x <= x1 && mouse.y >= y0 && mouse.y <= y1) {
          death("Laser");
        }
      } else {
        const y0 = beam.y - width / 2;
        const y1 = beam.y + width / 2;

        let x0, x1;
        if (beam.screenX < window.innerWidth / 2) {
          x0 = left;
          x1 = left + length;
        } else {
          x0 = right - length;
          x1 = right;
        }

        if (mouse.x >= x0 && mouse.x <= x1 && mouse.y >= y0 && mouse.y <= y1) {
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
      ctx.fillStyle = beam.t >= 1 && beam.t <= 1.1 ? "#fff" : "#fe1f6f";

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
    for (const beam of state.stompers) {
      let width;
      let alpha;

      if (beam.t < 1) {
        const e = 1 - Math.pow(1 - beam.t / 1, 3);
        width = TILE * 5;
        alpha = 0.5 * e;
      } else if (beam.t < 2) {
        width = TILE * 5;
        alpha = 0.5;
      } else if (beam.t < 2.5) {
        width = TILE * 5;
        alpha = 1;
      } else {
        width = TILE * 5;
        alpha = 0;
      }

      ctx.save();

      ctx.globalAlpha = alpha;
      ctx.fillStyle = beam.t >= 2 && beam.t <= 2.1 ? "#fff" : "#fe1f6f";

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

      const left = beam.x - beam.screenX;
      const top = beam.y - beam.screenY;
      const right = left + window.innerWidth;
      const bottom = top + window.innerHeight;

      if (beam.t < 2) {
        const p = beam.t / 2;
        const length = TILE * 5 * p;

        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = beam.t >= 2 && beam.t <= 2.1 ? "#fff" : "#fe1f6f";

        if (beam.vertical) {
          if (beam.screenY < window.innerHeight / 2) {
            ctx.fillRect(beam.x - width / 2, top, width, length);
          } else {
            ctx.fillRect(beam.x - width / 2, bottom - length, width, length);
          }
        } else {
          if (beam.screenX < window.innerWidth / 2) {
            ctx.fillRect(left, beam.y - width / 2, length, width);
          } else {
            ctx.fillRect(right - length, beam.y - width / 2, length, width);
          }
        }

        ctx.restore();
      } else {
        const t = Math.min(Math.max((beam.t - 2.5) / 0.5, 0), 1);
        const p = t * t;
        const length =
          (beam.vertical ? window.innerHeight : window.innerWidth) * (1 - p);

        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = beam.t >= 2 && beam.t <= 2.1 ? "#fff" : "#fe1f6f";

        if (beam.vertical) {
          if (beam.screenY < window.innerHeight / 2) {
            ctx.fillRect(beam.x - width / 2, top, width, length);
          } else {
            ctx.fillRect(beam.x - width / 2, bottom - length, width, length);
          }
        } else {
          if (beam.screenX < window.innerWidth / 2) {
            ctx.fillRect(left, beam.y - width / 2, length, width);
          } else {
            ctx.fillRect(right - length, beam.y - width / 2, length, width);
          }
        }

        ctx.restore();
      }
    }
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
