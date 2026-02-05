import { death, mouse } from "../entityHost.js";
import { fleshPositions, playSound, isCursorOnFloor } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Flesh.png";

export function setup(host, hardMode) {
  const state = {
    opacity: 1,

    x: 0,
    y: 0,

    size: 100,
    speed: 80,

    initialized: false,

    mode: "random",

    randomDirX: 0,
    randomDirY: 0,

    randomTimer: 0,
    randomDuration: 9 + Math.random(),

    sound: null,
    soundTimer: 0,

    pelletActive: false,
    pelletX: 0,
    pelletY: 0,
    pelletAlreadyOnFloor: false,
    pelletDirX: 0,
    pelletDirY: 0,
    pelletTimer: 0,
    pelletDuration: 0,
    pelletSpeed: 200,
  };

  function pickRandomDir() {
    const a = Math.random() * Math.PI * 2;
    state.randomDirX = Math.cos(a);
    state.randomDirY = Math.sin(a);
    state.randomTimer = 0;
    state.randomDuration = 9 + Math.random();
  }

  function spawnPellet() {
    const angle = Math.random() * Math.PI * 2;
    state.pelletX = state.x;
    state.pelletY = state.y;
    state.pelletAlreadyOnFloor = isCursorOnFloor({
      x: state.pelletX,
      y: state.pelletY,
    });
    state.pelletDirX = Math.cos(angle);
    state.pelletDirY = Math.sin(angle);
    state.pelletTimer = 0;
    state.pelletDuration = 9 + Math.random();
    state.pelletActive = true;
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    const now = performance.now();

    if (!state.initialized) {
      const cx = host.canvas.width / 2;
      const cy = host.canvas.height / 2;

      const r = Math.random() * 400;
      const a = Math.random() * Math.PI * 2;

      state.x = cx + Math.cos(a) * r;
      state.y = cy + Math.sin(a) * r;

      pickRandomDir();
      state.initialized = true;
    }

    const mx = mouse.x - state.x;
    const my = mouse.y - state.y;
    const dist = Math.hypot(mx, my);

    const aggroRadius = 1000;

    if (dist <= aggroRadius) {
      state.mode = "target";
      if (!state.sound)
        state.sound = playSound(
          "./ASSET/Sound/Enemies/Flesh/Flesh_-_terror3.ogg",
          undefined,
          undefined,
          undefined,
          () => {
            state.sound = null;
          },
        );
    } else {
      if (state.mode !== "random") {
        pickRandomDir();
      }
      state.mode = "random";
      if (state.sound) {
        state.sound();
        state.sound = null;
      }
    }

    let dx = 0;
    let dy = 0;

    if (state.mode === "target") {
      if (dist <= state.size * 0.5) {
        death("Flesh");
        return;
      }

      if (dist > 0.001) {
        dx = mx / dist;
        dy = my / dist;
      }

      state.soundTimer += dt;
      if (state.soundTimer >= 1) {
        state.soundTimer = 0;
        let infectSound = [
          "./ASSET/Sound/Enemies/Flesh/Flesh_-_ice1.ogg",
          "./ASSET/Sound/Enemies/Flesh/Flesh_-_ice2.ogg",
          "./ASSET/Sound/Enemies/Flesh/Flesh_-_ice3.ogg",
        ];
        playSound(infectSound[Math.floor(Math.random() * 3)]);
      }
    } else {
      state.randomTimer += dt;

      if (state.randomTimer >= state.randomDuration) {
        pickRandomDir();
      }

      dx = state.randomDirX;
      dy = state.randomDirY;
    }

    state.x += dx * state.speed * dt;
    state.y += dy * state.speed * dt;
    const half = state.size / 2;
    state.x = Math.max(half, Math.min(host.canvas.width - half, state.x));
    state.y = Math.max(half, Math.min(host.canvas.height - half, state.y));

    fleshPositions.add({
      x: state.x,
      y: state.y,
      until: now + 25000,
    });

    if (hardMode) {
      if (!state.pelletActive) {
        spawnPellet();
      }

      if (state.pelletActive) {
        state.pelletTimer += dt;
        state.pelletX += state.pelletDirX * state.pelletSpeed * dt;
        state.pelletY += state.pelletDirY * state.pelletSpeed * dt;

        if (state.pelletAlreadyOnFloor) {
          if (!isCursorOnFloor({ x: state.pelletX, y: state.pelletY })) {
            state.pelletAlreadyOnFloor = false;
            return;
          }
        } else {
          if (
            state.pelletTimer >= 1 &&
            isCursorOnFloor({ x: state.pelletX, y: state.pelletY })
          ) {
            state.pelletActive = false;
            fleshPositions.add({
              x: state.pelletX,
              y: state.pelletY,
              until: now + 50000,
            });
            return;
          }
        }

        if (state.pelletTimer >= state.pelletDuration) {
          state.pelletActive = false;
        }
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    ctx.drawImage(
      enemy,
      Math.round(state.x - state.size / 2),
      Math.round(state.y - state.size / 2),
      Math.round(state.size),
      Math.round(state.size),
    );

    if (state.pelletActive) {
      const jitterX = (Math.random() - 0.5) * 6;
      const jitterY = (Math.random() - 0.5) * 6;

      const size = 10;

      ctx.fillStyle = `rgba(${128 + Math.floor(Math.random() * 128)}, 0, 0, 1)`;

      ctx.fillRect(
        Math.round(state.pelletX + jitterX - size / 2),
        Math.round(state.pelletY + jitterY - size / 2),
        size,
        size,
      );

      ctx.fillRect(
        Math.round(state.pelletX - jitterX - size / 2),
        Math.round(state.pelletY - jitterY - size / 2),
        size,
        size,
      );
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
