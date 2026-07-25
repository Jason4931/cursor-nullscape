import { death, mouse } from "../entityHost.js";
import { playSound, soundStopped, uldm } from "../main.js";

const Huskback = [new Image()];
Huskback[0].src = "./ASSET/Enemies/Husk/Husk-back.png";
const Huskfront = [new Image()];
Huskfront[0].src = "./ASSET/Enemies/Husk/Husk-front.png";
const Huskright = [new Image()];
Huskright[0].src = "./ASSET/Enemies/Husk/Husk-right.png";
const Huskleft = [new Image()];
Huskleft[0].src = "./ASSET/Enemies/Husk/Husk-left.png";
const Huskspawn = [];
for (let i = 1; i <= 2; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Husk/Huskspawn/Layer ${i}.png`;
  Huskspawn.push(img);
}

export let legionActive = [false];
export function setup(host, stack, hardMode) {
  const state = {
    opacity: 1,
    layers: Huskspawn,
    enemy: null,
    layer: 0,
    layerChange: [false, false, false, false],

    x: 0,
    y: 0,

    size: 50,

    initialized: false,
    whiteInit: false,

    delay: 0,
    delayTarget: 0,
    delayTimer: 0,
    deathSound: false,
    spawnTimer: 10,

    history: [],

    pairOffset: 25,
    dirX: 1,
    dirY: 0,
  };

  function pickDelay() {
    state.delayTarget = 0.7 + Math.random() + stack * 1.2;
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (!state.initialized) {
      state.x = mouse.x;
      state.y = mouse.y;
      pickDelay();
      state.delay = state.delayTarget;
      state.initialized = true;
      if (!soundStopped)
        playSound(
          "./ASSET/Sound/Enemies/Husk/Skinwalker_-_OhNoSkinwalker_v2.ogg",
        );
    }

    state.spawnTimer += dt;
    if (state.layers != Huskspawn || state.spawnTimer > 0.2) {
      state.layer++;
      if (state.layer > state.layers.length) state.layer = 1;
      state.enemy = state.layers[state.layer - 1];
      state.spawnTimer = 0;
    }

    state.history.push({
      x: mouse.x,
      y: mouse.y,
      t: performance.now(),
    });

    state.delayTimer += dt;
    if (state.delayTimer >= 1) {
      state.delayTimer = 0;
      pickDelay();
    }

    const followSpeed = 3;
    state.delay +=
      (state.delayTarget - state.delay) * (1 - Math.exp(-followSpeed * dt));

    const targetTime = performance.now() - state.delay * 1000;
    let target = null;

    for (let i = state.history.length - 1; i >= 0; i--) {
      if (state.history[i].t <= targetTime) {
        target = state.history[i];
        break;
      }
    }

    if (!target) return;

    let dx = target.x - state.x;
    let dy = target.y - state.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.001) {
      if (!state.whiteInit) state.whiteInit = true;
      dx /= dist;
      dy /= dist;
      state.dirX = dx;
      state.dirY = dy;

      if (Math.abs(state.dirX) > Math.abs(state.dirY)) {
        if (state.dirX > 0) {
          if (!state.layerChange[1]) {
            state.layers = Huskright;
            state.layer = state.layers.length;
            state.layerChange[0] = false;
            state.layerChange[1] = true;
            state.layerChange[2] = false;
            state.layerChange[3] = false;
          }
        } else {
          if (!state.layerChange[2]) {
            state.layers = Huskleft;
            state.layer = state.layers.length;
            state.layerChange[0] = false;
            state.layerChange[1] = false;
            state.layerChange[2] = true;
            state.layerChange[3] = false;
          }
        }
      } else {
        if (state.dirY > 0) {
          if (!state.layerChange[0]) {
            state.layers = Huskfront;
            state.layer = state.layers.length;
            state.layerChange[0] = true;
            state.layerChange[1] = false;
            state.layerChange[2] = false;
            state.layerChange[3] = false;
          }
        } else {
          if (!state.layerChange[3]) {
            state.layers = Huskback;
            state.layer = state.layers.length;
            state.layerChange[0] = false;
            state.layerChange[1] = false;
            state.layerChange[2] = false;
            state.layerChange[3] = true;
          }
        }
      }
      const move = 10000 * dt;

      if (dist <= move) {
        state.x = target.x;
        state.y = target.y;
      } else {
        state.x += dx * move;
        state.y += dy * move;
      }
    }

    const px = -state.dirY;
    const py = state.dirX;
    let positions = [];
    if (legionActive[0]) {
      const count = 2 * (hardMode ? 20 : 10);
      const start = -(count - 1) / 2;

      for (let i = 0; i < count; i++) {
        const off = (start + i) * state.pairOffset;
        positions.push({
          x: state.x + px * off,
          y: state.y + py * off,
        });
      }
    } else if (hardMode) {
      positions = [
        {
          x: state.x + px * state.pairOffset,
          y: state.y + py * state.pairOffset,
        },
        {
          x: state.x,
          y: state.y,
        },
        {
          x: state.x - px * state.pairOffset,
          y: state.y - py * state.pairOffset,
        },
      ];
    } else {
      positions = [{ x: state.x, y: state.y }];
    }
    for (const p of positions) {
      const cx = mouse.x - p.x;
      const cy = mouse.y - p.y;
      const cdist = Math.hypot(cx, cy);

      if (cdist <= state.size * 0.2) {
        if (!state.deathSound) {
          playSound(`./ASSET/Sound/Enemies/Husk/Husk_Kill.ogg`);
          state.deathSound = true;
        }
        death("Husk");
        return;
      } else {
        state.deathSound = false;
      }
    }

    const sounddist = Math.hypot(mouse.x - state.x, mouse.y - state.y);
    if (!soundStopped) {
      if (sounddist <= 500) {
        if (!state.sound)
          state.sound = playSound(
            `./ASSET/Sound/Enemies/Husk/Skinwalker.ogg`,
            undefined,
            undefined,
            undefined,
            () => {
              state.sound = null;
            },
          );
      } else {
        if (state.sound) {
          state.sound();
          state.sound = null;
        }
      }
    } else {
      if (state.sound) {
        state.sound();
        state.sound = null;
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    const px = -state.dirY;
    const py = state.dirX;
    let positions = [];
    if (legionActive[0]) {
      const count = hardMode ? 20 : 10;
      const start = -(count - 1) / 2;

      for (let i = 0; i < count; i++) {
        const off = (start + i) * state.pairOffset * 2;
        positions.push({
          x: state.x + px * off,
          y: state.y + py * off,
        });
      }
    } else if (hardMode) {
      positions = [
        {
          x: state.x + px * state.pairOffset,
          y: state.y + py * state.pairOffset,
        },
        {
          x: state.x - px * state.pairOffset,
          y: state.y - py * state.pairOffset,
        },
      ];
    } else {
      positions = [{ x: state.x, y: state.y }];
    }
    for (const p of positions) {
      if (!state.whiteInit) {
        if (!uldm) {
          const grad = ctx.createRadialGradient(
            Math.round(p.x),
            Math.round(p.y),
            0,
            Math.round(p.x),
            Math.round(p.y),
            state.size,
          );

          grad.addColorStop(0, "rgba(255,255,255,0.75)");
          grad.addColorStop(1, "rgba(255,255,255,0)");

          ctx.beginPath();
          ctx.arc(Math.round(p.x), Math.round(p.y), state.size, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        const height = state.size;
        const width = state.size;
        ctx.drawImage(
          state.enemy,
          Math.round(p.x - width / 2),
          Math.round(p.y - height / 2),
          width,
          height,
        );
      } else {
        if (!uldm) {
          const grad = ctx.createRadialGradient(
            Math.round(p.x),
            Math.round(p.y),
            0,
            Math.round(p.x),
            Math.round(p.y),
            state.size * 0.75,
          );

          grad.addColorStop(0, "rgba(255,255,255,0.1)");
          grad.addColorStop(1, "rgba(255,255,255,0)");

          ctx.beginPath();
          ctx.arc(
            Math.round(p.x),
            Math.round(p.y),
            state.size * 0.75,
            0,
            Math.PI * 2,
          );
          ctx.fillStyle = grad;
          ctx.fill();
        }

        const height = state.size * 1.25;
        const width = state.size * (2 / 3) * 1.25;
        ctx.drawImage(
          state.enemy,
          Math.round(p.x - width / 2),
          Math.round(p.y - height / 2),
          width,
          height,
        );
      }
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
