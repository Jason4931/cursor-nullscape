import { death, mouse } from "../entityHost.js";
import { TILE, moveCamera, jumppadHit } from "../main.js";

const jumppad = new Image();
jumppad.src = "./ASSET/Misc/Jumppad.png";

export function setup(host, red = false) {
  const state = {
    activated: false,
    pads: [],
  };

  const PAD_SIZE = TILE * (red ? 1.5 : 2.5);
  const PAD_DISTANCE = 2000;

  function spawnPads(cursorX, cursorY) {
    const a = Math.random() * Math.PI * 2;

    const cx = cursorX + Math.cos(a) * PAD_DISTANCE;
    const cy = cursorY + Math.sin(a) * PAD_DISTANCE;

    state.pads = [
      {
        x: cx - PAD_SIZE / 2,
        y: cy - PAD_SIZE / 2,
        opacity: 0.5,
      },
    ];
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (state.pads.length === 0) {
      spawnPads(mouse.x, mouse.y);
    } else {
      const p = state.pads[0];

      const dx = mouse.x - (p.x + PAD_SIZE / 2);
      const dy = mouse.y - (p.y + PAD_SIZE / 2);

      if (Math.hypot(dx, dy) > PAD_DISTANCE) {
        spawnPads(mouse.x, mouse.y);
      }
    }

    for (const p of state.pads) {
      if (
        mouse.x >= p.x &&
        mouse.x <= p.x + PAD_SIZE &&
        mouse.y >= p.y &&
        mouse.y <= p.y + PAD_SIZE &&
        !state.activated
      ) {
        const px = p.x + PAD_SIZE / 2;
        const py = p.y + PAD_SIZE / 2;

        let dx = mouse.x - px;
        let dy = mouse.y - py;

        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;

        moveCamera(
          dx * TILE * (red ? 1.25 : 0.75),
          dy * TILE * (red ? 1.25 : 0.75),
        );
        jumppadHit("set");
        state.activated = true;
        setTimeout(() => {
          state.activated = false;
        }, 1000);
        break;
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();

    for (const p of state.pads) {
      if (p.opacity <= 0) continue;

      ctx.globalAlpha = p.opacity;
      if (!red) {
        const jpSize = Math.round(PAD_SIZE * 1.25);
        const offset = Math.round((jpSize - PAD_SIZE) * 0.5);

        ctx.drawImage(
          jumppad,
          Math.round(p.x - offset),
          Math.round(p.y - offset),
          jpSize,
          jpSize,
        );

        ctx.save();
        ctx.globalAlpha = p.opacity * 0.5;
        const angle = (Math.random() - 0.5) * 0.2;
        ctx.translate(
          Math.round(p.x + PAD_SIZE / 2),
          Math.round(p.y + PAD_SIZE / 2),
        );
        ctx.rotate(angle);
        ctx.translate(-Math.round(PAD_SIZE / 2), -Math.round(PAD_SIZE / 2));
        ctx.fillStyle = Math.random() > 0.5 ? "#00f" : "#3aa9ff";
        ctx.fillRect(0, 0, PAD_SIZE, PAD_SIZE);
        ctx.restore();
      } else {
        const grad = ctx.createRadialGradient(
          p.x + PAD_SIZE / 2,
          p.y + PAD_SIZE / 2,
          0,
          p.x + PAD_SIZE / 2,
          p.y + PAD_SIZE / 2,
          PAD_SIZE / 2,
        );
        grad.addColorStop(0, "#f44");
        grad.addColorStop(1, "#f00");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(
          p.x + PAD_SIZE / 2,
          p.y + PAD_SIZE / 2,
          PAD_SIZE / 2,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        ctx.translate(p.x + PAD_SIZE / 2, p.y + PAD_SIZE / 2);
        const r = PAD_SIZE / 4;
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
          pts.push([Math.cos(a) * r, Math.sin(a) * r]);
        }
        const cx0 = 0;
        const cy0 = 0;
        for (let i = 0; i < 6; i++) {
          const p1 = pts[i];
          const p2 = pts[(i + 1) % 6];
          ctx.beginPath();
          ctx.moveTo(cx0, cy0);
          ctx.lineTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.closePath();
          ctx.fillStyle = "#f44";
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw, name: "Jumppad" });
  return unregister;
}
