import { death, mouse } from "../entityHost.js";
import { getCameraPos, moveCamera, TILE } from "../main.js";

export function setup(host, casualMode, hardMode) {
  const state = {
    timer: 1,
    cooldown: 1,
    beams: [],
    stompers: [],
    circles: [],
    bombs: [],
    bullets: [],
    saws: [],
    shakeX: 0,
    shakeY: 0,
    shakeStrength: 0,
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    const cam = getCameraPos();
    const mouseX = cam.x + mouse._clientX;
    const mouseY = cam.y + mouse._clientY;

    state.timer += dt;

    if (state.timer >= state.cooldown) {
      state.timer -= state.cooldown;

      const attack = Math.random();
      const attackCount = 5;
      if (attack < 1 / attackCount) {
        state.cooldown = 2;
        const angles = [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4];
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const screenX = (0.1 + Math.random() * 0.8) * window.innerWidth;
            const screenY = (0.1 + Math.random() * 0.8) * window.innerHeight;
            const angle = angles[(Math.random() * angles.length) | 0];
            state.beams.push({
              t: 0,
              angle,
              screenX,
              screenY,
              x: cam.x + screenX,
              y: cam.y + screenY,
            });
          }, i * 500);
        }
      } else if (attack < 2 / attackCount) {
        state.cooldown = 2;
        const vertical = Math.random() < 0.5;
        const screenX = (0.1 + Math.random() * 0.8) * window.innerWidth;
        const screenY = (0.1 + Math.random() * 0.8) * window.innerHeight;
        state.stompers.push({
          t: 0,
          vertical,
          screenX,
          screenY,
          x: cam.x + screenX,
          y: cam.y + screenY,
        });
      } else if (attack < 3 / attackCount) {
        state.cooldown = 2;
        const screenX = (0.1 + Math.random() * 0.8) * window.innerWidth;
        const screenY = (0.1 + Math.random() * 0.8) * window.innerHeight;
        state.circles.push({
          t: 0,
          screenX,
          screenY,
          x: cam.x + screenX,
          y: cam.y + screenY,
          color: 1,
          radius: TILE * 5,
        });
      } else if (attack < 4 / attackCount) {
        state.cooldown = 1;
        const angle = Math.random() * Math.PI * 2;
        const startDist = Math.max(window.innerWidth, window.innerHeight) * 0.8;
        const targetAngle = Math.random() * Math.PI * 2;
        const targetDist =
          Math.min(window.innerWidth, window.innerHeight) * 0.42;
        const screenX = window.innerWidth * 0.5;
        const screenY = window.innerHeight * 0.5;
        state.bombs.push({
          t: 0,
          screenX: screenX + Math.cos(angle) * startDist,
          screenY: screenY + Math.sin(angle) * startDist,
          targetX: screenX + Math.cos(targetAngle) * targetDist,
          targetY: screenY + Math.sin(targetAngle) * targetDist,
          x: 0,
          y: 0,
          color: 1,
          radius: TILE * 0.5,
        });
      } else {
        state.cooldown = 5;
        const side = (Math.random() * 4) | 0;
        const reverse = Math.random() < 0.5;
        const r = TILE * 4;
        const outsideR = r * 1.5;
        let approachX, approachY, edgeX, edgeY;
        let startX, startY, endX, endY;
        let rotation = 0;
        let rotationSpeed = 2;
        switch (side) {
          case 0: {
            // left wall
            edgeX = startX = endX = r * 0.5;
            edgeY = reverse ? window.innerHeight - r * 0.5 : r * 0.5;

            approachX = window.innerWidth + outsideR;
            approachY = edgeY;

            startY = edgeY;
            endY = reverse ? -outsideR : window.innerHeight + outsideR;

            rotation = Math.PI;
            rotationSpeed = reverse ? -4 : 4;
            break;
          }

          case 1: {
            // right wall
            edgeX = startX = endX = window.innerWidth - r * 0.5;
            edgeY = reverse ? r * 0.5 : window.innerHeight - r * 0.5;

            approachX = -outsideR;
            approachY = edgeY;

            startY = edgeY;
            endY = reverse ? window.innerHeight + outsideR : -outsideR;

            rotation = 0;
            rotationSpeed = reverse ? -4 : 4;
            break;
          }

          case 2: {
            // top wall
            edgeY = startY = endY = r * 0.5;
            edgeX = reverse ? window.innerWidth - r * 0.5 : r * 0.5;

            approachX = edgeX;
            approachY = window.innerHeight + outsideR;

            startX = edgeX;
            endX = reverse ? -outsideR : window.innerWidth + outsideR;

            rotation = Math.PI / 2;
            rotationSpeed = reverse ? 4 : -4;
            break;
          }

          default: {
            // bottom wall
            edgeY = startY = endY = window.innerHeight - r * 0.5;
            edgeX = reverse ? r * 0.5 : window.innerWidth - r * 0.5;

            approachX = edgeX;
            approachY = -outsideR;

            startX = edgeX;
            endX = reverse ? window.innerWidth + outsideR : -outsideR;

            rotation = -Math.PI / 2;
            rotationSpeed = reverse ? 4 : -4;
            break;
          }
        }
        const beamCount = 5;
        const spacing = beamCount * 10;
        for (let i = 0; i < beamCount; i++) {
          let beamScreenX, beamScreenY;

          if (side === 0 || side === 1) {
            beamScreenX = ((i + 1) * window.innerWidth) / (beamCount + 1);

            if (side === 0) {
              beamScreenY = reverse
                ? window.innerHeight - i * spacing
                : i * spacing;
            } else {
              beamScreenY = reverse
                ? i * spacing
                : window.innerHeight - i * spacing;
            }
          } else {
            beamScreenY = ((i + 1) * window.innerHeight) / (beamCount + 1);

            if (side === 2) {
              beamScreenX = reverse
                ? window.innerWidth - i * spacing
                : i * spacing;
            } else {
              beamScreenX = reverse
                ? i * spacing
                : window.innerWidth - i * spacing;
            }
          }

          setTimeout(() => {
            state.beams.push({
              t: 0,
              angle: rotation,
              screenX: beamScreenX,
              screenY: beamScreenY,
              x: cam.x + beamScreenX,
              y: cam.y + beamScreenY,
            });
          }, i * 100);
        }
        state.saws.push({
          t: 0,
          startX,
          startY,
          endX,
          endY,
          x: 0,
          y: 0,
          radius: r,
          rotation,
          rotationSpeed,
          side,
          approachX,
          approachY,
          edgeX,
          edgeY,
        });
      }

      state.cooldown += 1;
      state.cooldown *= hardMode ? 0.5 : casualMode ? 1.5 : 1;
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

      beam.x = cam.x + beam.screenX;
      beam.y = cam.y + beam.screenY;

      if (beam.t >= 1.5) {
        beam.dead = true;
        clean = true;
      }
    }
    for (const beam of state.stompers) {
      beam.t += dt;

      beam.x = cam.x + beam.screenX;
      beam.y = cam.y + beam.screenY;

      if (beam.t >= 3) {
        beam.dead = true;
        clean = true;
      }
    }
    for (const circle of state.circles) {
      circle.t += dt;

      circle.x = cam.x + circle.screenX;
      circle.y = cam.y + circle.screenY;

      if (circle.t >= 2.5) {
        circle.dead = true;
        clean = true;
      }
    }
    for (const bomb of state.bombs) {
      bomb.t += dt;

      let sx, sy;
      if (bomb.t < 0.5) {
        const e = 1 - Math.pow(1 - bomb.t / 0.5, 3);

        sx = bomb.screenX + (bomb.targetX - bomb.screenX) * e;

        sy = bomb.screenY + (bomb.targetY - bomb.screenY) * e;
      } else {
        sx = bomb.targetX;
        sy = bomb.targetY;
      }
      bomb.x = cam.x + sx;
      bomb.y = cam.y + sy;

      if (bomb.t >= 1) {
        const rot = Math.random() * Math.PI * 2;

        for (let i = 0; i < 12; i++) {
          const a = rot + (i * Math.PI) / 6;
          const speed = TILE * 18;

          state.bullets.push({
            x: bomb.x,
            y: bomb.y,
            startX: bomb.x,
            startY: bomb.y,
            startCamX: cam.x,
            startCamY: cam.y,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            px: -Math.sin(a),
            py: Math.cos(a),
            wobble: Math.random() * Math.PI * 2,
            radius: TILE * 0.25,
            t: 0,
          });
        }

        bomb.dead = true;
        clean = true;
      }
    }
    for (const bullet of state.bullets) {
      bullet.t += dt;

      const travelX = bullet.vx * bullet.t;
      const travelY = bullet.vy * bullet.t;
      const wobble = Math.sin(bullet.t * 16 + bullet.wobble) * TILE * 0.25;

      bullet.x =
        cam.x +
        (bullet.startX - bullet.startCamX) +
        travelX +
        bullet.px * wobble;

      bullet.y =
        cam.y +
        (bullet.startY - bullet.startCamY) +
        travelY +
        bullet.py * wobble;

      const dx = mouseX - bullet.x;
      const dy = mouseY - bullet.y;

      if (dx * dx + dy * dy <= bullet.radius * bullet.radius) {
        death("Corrupted");
      }

      if (bullet.t > 4) {
        bullet.dead = true;
        clean = true;
      }
    }
    for (const saw of state.saws) {
      saw.t += dt;

      if (saw.t >= 1 && saw.t < 2) {
        let e;

        if (saw.t < 1.5) {
          const t = (saw.t - 1) / 0.5;
          e = t * t;
        } else if (saw.t < 1.833) {
          const t = (saw.t - 1.5) / 0.167;

          const bounce = 0.05;

          e = 1 - bounce * (1 - (1 - t) * (1 - t));
        } else {
          e = 1;
        }

        saw.x = cam.x + saw.approachX + (saw.edgeX - saw.approachX) * e;
        saw.y = cam.y + saw.approachY + (saw.edgeY - saw.approachY) * e;
      } else {
        const p = Math.min((saw.t - 2) / 3, 1);

        saw.x = cam.x + saw.edgeX + (saw.endX - saw.edgeX) * p;
        saw.y = cam.y + saw.edgeY + (saw.endY - saw.edgeY) * p;

        saw.rotation += dt * saw.rotationSpeed;
      }

      const dx = mouseX - saw.x;
      const dy = mouseY - saw.y;

      if (dx * dx + dy * dy <= saw.radius * saw.radius) {
        death("Corrupted");
      }

      if (saw.t >= 5) {
        saw.dead = true;
        clean = true;
      }
    }

    if (clean) {
      state.beams = state.beams.filter((b) => !b.dead);
      state.stompers = state.stompers.filter((b) => !b.dead);
      state.circles = state.circles.filter((b) => !b.dead);
      state.bombs = state.bombs.filter((b) => !b.dead);
      state.bullets = state.bullets.filter((b) => !b.dead);
      state.saws = state.saws.filter((s) => !s.dead);
    }

    for (const beam of state.beams) {
      if (beam.t < 1) continue;

      let width = TILE;

      const shrink = Math.min((beam.t - 1) / 0.5, 1);

      width *= 1 - shrink;

      const nx = -Math.sin(beam.angle);
      const ny = Math.cos(beam.angle);

      const dx = mouseX - beam.x;
      const dy = mouseY - beam.y;

      if (Math.abs(dx * nx + dy * ny) <= width * 0.5) {
        death("Corrupted");
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

      const width = TILE * 6;

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

        if (mouseX >= x0 && mouseX <= x1 && mouseY >= y0 && mouseY <= y1) {
          death("Corrupted");
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

        if (mouseX >= x0 && mouseX <= x1 && mouseY >= y0 && mouseY <= y1) {
          death("Corrupted");
        }
      }
    }
    for (const circle of state.circles) {
      if (circle.t < 2) continue;

      let radius;
      if (circle.t < 2.333) {
        radius = circle.radius;
      } else {
        const t = Math.min((circle.t - 2.333) / 0.167, 1);
        radius = circle.radius * (1 - t * t);
      }

      const dx = mouseX - circle.x;
      const dy = mouseY - circle.y;

      if (dx * dx + dy * dy <= radius * radius) {
        death("Corrupted");
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

      ctx.translate(beam.x, beam.y);
      ctx.rotate(beam.angle);
      const length = Math.max(window.innerWidth, window.innerHeight) * 3;
      ctx.fillRect(-length / 2, -width / 2, length, width);

      ctx.restore();
    }
    for (const beam of state.stompers) {
      let width = TILE * 6;
      let alpha;
      if (beam.t < 1) {
        const e = 1 - Math.pow(1 - beam.t / 1, 3);
        alpha = 0.5 * e;
      } else if (beam.t < 2) {
        alpha = 0.5;
      } else if (beam.t < 2.5) {
        alpha = 1;
      } else {
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
    for (const circle of state.circles) {
      let outlineRadius;
      let fillRadius;
      let fillAlpha;

      if (circle.t < 1) {
        const e = 1 - Math.pow(1 - circle.t / 1, 3);
        fillRadius = circle.radius * (circle.t / 2);
        fillAlpha = 0.5;
        outlineRadius = circle.radius * e;
      } else if (circle.t < 2) {
        fillRadius = circle.radius * (circle.t / 2);
        fillAlpha = 0.5;
        outlineRadius = circle.radius;
      } else if (circle.t < 2.333) {
        const e = 1 - Math.pow(1 - (circle.t - 2) / 0.333, 3);
        fillRadius = circle.radius + TILE * (1 - e);
        fillAlpha = 1;
        outlineRadius = 0;
      } else {
        const t = Math.min((circle.t - 2.333) / 0.167, 1);
        const p = t * t;
        fillRadius = circle.radius * (1 - p);
        fillAlpha = 1;
        outlineRadius = 0;
      }
      circle.color *= -1;

      ctx.save();

      ctx.save();
      ctx.translate(circle.x, circle.y);
      ctx.rotate(circle.t * 0.5);
      ctx.strokeStyle =
        circle.t >= 2
          ? circle.t <= 2.1
            ? "#fff"
            : circle.color > 0
              ? "#ff4f9f"
              : "#fe1f6f"
          : "#fe1f6f";
      ctx.lineWidth = 4;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -circle.rotation * outlineRadius * 2;
      ctx.beginPath();
      ctx.arc(0, 0, outlineRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.setLineDash([]);

      ctx.globalAlpha = fillAlpha;
      ctx.fillStyle =
        circle.t >= 2
          ? circle.t <= 2.1
            ? "#fff"
            : circle.color > 0
              ? "#ff4f9f"
              : "#fe1f6f"
          : "#fe1f6f";
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, fillRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    for (const bomb of state.bombs) {
      let radius = bomb.radius;

      if (bomb.t >= 0.5) {
        const t = Math.min((bomb.t - 0.5) / 0.5, 1);
        radius *= 1 + t * t;
      }

      ctx.save();
      ctx.translate(bomb.x, bomb.y);

      bomb.color *= -1;
      ctx.fillStyle = bomb.color > 0 ? "#fff" : "#fe1f6f";

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.rotate(bomb.t * 6);
      const inner = radius * 0.75;
      const outer = radius * 1.25;
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((Math.PI / 2) * i);
        ctx.beginPath();
        ctx.moveTo(inner, -radius * 0.18);
        ctx.lineTo(outer, 0);
        ctx.lineTo(inner, radius * 0.18);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }
    for (const bullet of state.bullets) {
      ctx.save();

      ctx.fillStyle = bullet.t <= 0.1 ? "#fff" : "#fe1f6f";

      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    for (const saw of state.saws) {
      ctx.save();

      ctx.translate(saw.x, saw.y);
      ctx.rotate(saw.rotation);

      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, saw.radius);

      g.addColorStop(0, "#000");
      g.addColorStop(0.75, "#000");
      g.addColorStop(0.76, "#fe1f6f");
      g.addColorStop(1, "#fe1f6f");

      ctx.fillStyle = "#fe1f6f";
      const inner = saw.radius * 0.5;
      const outer = saw.radius * 1.25;
      const halfWidth = saw.radius * 0.49;
      for (let i = 0; i < 14; i++) {
        ctx.save();
        ctx.rotate((Math.PI * 2 * i) / 14);

        ctx.beginPath();
        const flip = Math.sign(saw.rotationSpeed);
        ctx.moveTo(inner, 0);
        ctx.lineTo(inner, -flip * halfWidth * 2);
        ctx.lineTo(outer, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      ctx.fillStyle = g;

      ctx.beginPath();
      ctx.arc(0, 0, saw.radius, 0, Math.PI * 2);
      ctx.fill();

      const hex = saw.radius * 0.28;

      ctx.fillStyle = "#fe1f6f";
      ctx.beginPath();

      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 + Math.PI / 6;
        const x = Math.cos(a) * hex;
        const y = Math.sin(a) * hex;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
