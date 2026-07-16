import { death, mouse } from "../entityHost.js";
import { TILE, moveCamera, jumppadHit } from "../main.js";

const jumppad = new Image();
jumppad.src = "./ASSET/Misc/Jumppad.png";

export function setup(host) {
  const state = {
    activated: false,
    pads: [],
  };

  const PAD_SIZE = TILE * 2.5;
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

        moveCamera(dx * TILE * 0.75, dy * TILE * 0.75);
        jumppadHit("set");
        state.activated = true;
        setTimeout(() => {
          state.activated = false;
        }, 200);
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
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
