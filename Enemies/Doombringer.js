import { death, mouse } from "../entityHost.js";
import { TILE, moveCamera } from "../main.js";

const jumppad = new Image();
jumppad.src = "./ASSET/Misc/Jumppad.png";

export function setup(host) {
  const state = {
    phase: "idle",
    timer: 0,
    delay: 0,
    opacity: 0,
    pads: [],
  };

  const PAD_COUNT = 100;
  const PAD_SIZE = TILE * 2.5;
  const PAD_DISTANCE = 1000;
  const PAD_MIN_SEP = PAD_SIZE * 5;
  const WARNING_TIME = 10;

  function resetDelay() {
    state.phase = "idle";
    state.timer = 0;
    state.delay = 9 + Math.random();
    state.pads.length = 0;
  }

  function spawnPads(cursorX, cursorY) {
    state.pads.length = 0;

    let safety = 0;
    while (state.pads.length < PAD_COUNT && safety < 100) {
      safety++;

      const a = Math.random() * Math.PI * 2;
      const d = PAD_DISTANCE * (0.6 + Math.random() * 0.6);

      const x = cursorX + Math.cos(a) * d;
      const y = cursorY + Math.sin(a) * d;

      let ok = true;
      for (const p of state.pads) {
        const dx = x - p.x;
        const dy = y - p.y;
        if (dx * dx + dy * dy < PAD_MIN_SEP * PAD_MIN_SEP) {
          ok = false;
          break;
        }
      }

      if (ok) {
        state.pads.push({
          x,
          y,
          opacity: 0,
        });
      }
    }
  }

  resetDelay();

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.timer += dt;

    if (state.phase === "idle") {
      if (state.timer >= state.delay) {
        state.phase = "warning";
        state.timer = 0;
        state.opacity = 0;
        spawnPads(mouse.x, mouse.y);
      }
      return;
    }

    if (state.phase === "warning") {
      if (state.timer <= 0.75) {
        for (const p of state.pads) {
          p.opacity = state.timer;
        }
      }

      state.opacity = Math.min(1, state.timer / WARNING_TIME);

      for (const p of state.pads) {
        if (
          mouse.x >= p.x &&
          mouse.x <= p.x + PAD_SIZE &&
          mouse.y >= p.y &&
          mouse.y <= p.y + PAD_SIZE
        ) {
          const px = p.x + PAD_SIZE / 2;
          const py = p.y + PAD_SIZE / 2;

          let dx = mouse.x - px;
          let dy = mouse.y - py;

          const len = Math.hypot(dx, dy) || 1;
          dx /= len;
          dy /= len;

          moveCamera(dx * TILE * 0.75, dy * TILE * 0.75);

          state.phase = "success";
          state.timer = 0;
          state.opacity = 0;
          return;
        }
      }

      if (state.timer >= WARNING_TIME) {
        death("Doombringer");
      }
      return;
    }

    if (state.phase === "success") {
      if (state.timer <= 0.75) {
        for (const p of state.pads) {
          p.opacity -= dt;
          if (p.opacity < 0) p.opacity = 0;
        }
      }

      if (state.timer >= 1) {
        resetDelay();
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (state.phase === "warning") {
      const blink = (Math.floor(performance.now() / 100) & 1) === 0;
      const color = blink ? "255,255,255" : "255,0,0";

      const g = ctx.createRadialGradient(
        Math.round(mouse.x),
        Math.round(mouse.y),
        0,
        Math.round(mouse.x),
        Math.round(mouse.y),
        140
      );

      g.addColorStop(0, `rgba(${color},${state.opacity})`);
      g.addColorStop(1, "rgba(0,0,0,0)");

      ctx.globalAlpha = state.opacity;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(Math.round(mouse.x), Math.round(mouse.y), 140, 0, Math.PI * 2);
      ctx.fill();
    }

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
        jpSize
      );

      ctx.save();
      ctx.globalAlpha = p.opacity * 0.5;
      const angle = (Math.random() - 0.5) * 0.2;
      ctx.translate(Math.round(p.x + PAD_SIZE / 2), Math.round(p.y + PAD_SIZE / 2));
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
