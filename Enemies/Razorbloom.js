import { death, mouse } from "../entityHost.js";
import { playSound, jumppadHit, getCameraPos } from "../main.js";

const Razorbloom_closedright = new Image();
const Razorbloom_closedleft = new Image();
const Razorbloom_closed = new Image();
const Razorbloom_open = new Image();
const Razorbloom_open2 = new Image();
function loadAssets() {
  Razorbloom_closedright.src =
    "./ASSET/Curses/Razorbloom/Razorbloom_closed-right.png";
  Razorbloom_closedleft.src =
    "./ASSET/Curses/Razorbloom/Razorbloom_closed-left.png";
  Razorbloom_closed.src = "./ASSET/Curses/Razorbloom/Razorbloom_closed.png";
  Razorbloom_open.src = "./ASSET/Curses/Razorbloom/Razorbloom_open.png";
  Razorbloom_open2.src = "./ASSET/Curses/Razorbloom/Razorbloom_open2.png";
}

export function setup(host, hardMode) {
  loadAssets();
  const state = {
    phase: "idle",
    timer: 0,
    delay: 0,
    opacity: 0,
    sound: null,
    death: false,
    open: 1,
    openT: 0,

    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    t: 0,
  };

  const size = 40;
  const WARNING_TIME = hardMode ? 10 : 15;

  function resetDelay() {
    state.phase = "idle";
    state.timer = 0;
    state.opacity = 0;
    state.delay = 14 + Math.random();
    state.death = false;
  }
  resetDelay();

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.timer += dt;

    state.openT += dt;
    if (state.openT >= 0.1) {
      state.openT = 0;
      state.open *= -1;
    }

    if (state.phase === "idle") {
      if (state.timer >= state.delay) {
        state.phase = "wait";
        state.sound = playSound(
          `./ASSET/Sound/Enemies/Razorbloom/Razorbloom_Warning.ogg`,
          undefined,
          undefined,
          undefined,
          undefined,
          true,
        );
        state.timer = 0;
        state.opacity = 1;
        state.t = 0;

        const cam = getCameraPos();
        state.startX = cam.x + window.innerWidth + size;
        state.startY = cam.y - size;

        state.x = state.startX;
        state.y = state.startY;
      }
      return;
    }

    if (state.phase === "wait") {
      state.t += dt;
      const p = Math.min(1, state.t / 2);
      const ease = 1 - (1 - p) * (1 - p);
      state.x = state.startX + (mouse.x - state.startX) * ease;
      state.y = state.startY + (mouse.y - size / 3 - state.startY) * ease;
      if (state.timer >= 10) {
        state.phase = "warning";
        state.sound = playSound(
          `./ASSET/Sound/Enemies/Razorbloom/Razorbloom_Yell${hardMode ? "_Short" : ""}.ogg`,
          undefined,
          undefined,
          undefined,
          undefined,
          true,
        );
        state.timer = 0;
        state.opacity = 1;
      }
      return;
    }

    if (state.phase === "warning") {
      state.x = mouse.x;
      state.y = mouse.y - size / 3;
      state.opacity = Math.min(1, state.timer / WARNING_TIME);

      if (jumppadHit("get") || state.death) {
        if (state.sound) state.sound();
        state.phase = "done";
        playSound(
          "./ASSET/Sound/Enemies/Razorbloom/Razorbloom_Success.ogg",
          undefined,
          undefined,
          undefined,
          undefined,
          true,
        );
        state.timer = 0;
        state.opacity = 1;
        state.t = 0;
        return;
      }

      if (state.timer >= WARNING_TIME && !state.death) {
        state.death = true;
        death("Razorbloom");
      }
      return;
    }

    if (state.phase === "done") {
      state.t += dt;
      const p = Math.min(1, state.t / 1);

      const cam = getCameraPos();
      state.x = mouse.x + (cam.x + window.innerWidth + size - mouse.x) * p;
      state.y = mouse.y - size / 3 + (cam.y - size - mouse.y) * p;

      if (state.timer >= 1) {
        resetDelay();
      }
      return;
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();

    let img;
    if (state.phase === "wait") {
      img = state.timer <= 2 ? Razorbloom_closedleft : Razorbloom_closed;
    } else if (state.phase === "warning") {
      if (state.open >= 0) {
        img = Razorbloom_open;
      } else {
        img = Razorbloom_open2;
      }
    } else if (state.phase === "done") {
      img = Razorbloom_closedright;
    } else {
      return;
    }
    ctx.drawImage(img, state.x - size / 2, state.y - size / 2, size, size);

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
