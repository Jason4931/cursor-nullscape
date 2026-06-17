import { death, mouse } from "../entityHost.js";
import { playSound } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Voidbreaker.png";

const sword = new Image();
sword.src = "./ASSET/Misc/Sword.png";

let voidbreakerActive = false;
let voidbreakerCount = 0;
export function setup(host, casualMode, hardMode) {
  voidbreakerCount++;
  if (voidbreakerActive) {
    const unregister = host.register({
      update: () => {},
      draw: () => {},
    });
    return unregister;
  } else {
    voidbreakerActive = true;
  }
  const state = {
    phase: "idle",
    timer: 0,
    delay: 0,

    opacity: 0,
    flashX: 0,
    flashY: 0,
    flashX2: 0,
    flashY2: 0,
    flashHardX: 0,
    flashHardY: 0,
    flashHardX2: 0,
    flashHardY2: 0,

    sword: {
      active: false,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      opacity: 1,
      lockX: 0,
      lockY: 0,
      angle: 0,
    },
    sword2: {
      active: false,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      opacity: 1,
      lockX: 0,
      lockY: 0,
      angle: 0,
    },
    swordHard: {
      active: false,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      opacity: 1,
      lockX: 0,
      lockY: 0,
      angle: 0,
    },
    swordHard2: {
      active: false,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      opacity: 1,
      lockX: 0,
      lockY: 0,
      angle: 0,
    },
  };

  const HOVER_Y = -200;
  const DASH_DIST = 500;

  const SWORD_SIZE = 125;
  const KILL_RADIUS = 60;

  const DIRECTIONS = [
    [1, 0],
    [0.707, 0.707],
    [0, 1],
    [-0.707, 0.707],
    [-1, 0],
    [-0.707, -0.707],
    [0.707, -0.707],
  ];

  function resetIdle() {
    state.phase = "idle";
    state.timer = 0;
    state.delay = (9 + Math.random()) / voidbreakerCount;
    state.opacity = 0;
    state.sword.active = false;
  }

  resetIdle();

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.timer += dt;

    if (state.phase === "idle") {
      if (state.timer >= state.delay) {
        state.phase = "warning";
        playSound(
          "./ASSET/Sound/Enemies/Voidbreaker/Patch5_Voidbreaker_Spawn.ogg",
        );
        state.timer = 0;
        state.opacity = 0;
      }
      return;
    }

    if (state.phase === "warning") {
      state.opacity = state.timer <= 0.5 ? state.timer / 0.5 : 1;

      if (state.timer >= 1) {
        const dir = DIRECTIONS[(Math.random() * DIRECTIONS.length) | 0];

        state.sword.active = true;
        state.sword.dx = dir[0];
        state.sword.dy = dir[1];
        state.sword.targetAngle = Math.atan2(dir[1], dir[0]);
        state.sword.angle = Math.PI / 2;

        if (!casualMode) {
          let dir2;
          do {
            dir2 = DIRECTIONS[(Math.random() * DIRECTIONS.length) | 0];
          } while (dir2[0] === dir[0] && dir2[1] === dir[1]);

          state.sword2.active = true;
          state.sword2.dx = dir2[0];
          state.sword2.dy = dir2[1];
          state.sword2.targetAngle = Math.atan2(dir2[1], dir2[0]);
          state.sword2.angle = Math.PI / 2;
        } else {
          state.sword2.active = false;
        }

        const randSound = Math.random() < 0.5;
        playSound(
          `./ASSET/Sound/Enemies/Voidbreaker/Patch5_Voidbreaker_Sword_Summon${randSound ? "" : "_2"}.ogg`,
          randSound ? 0.857 : 1,
        );
        state.phase = "attack";
        state.timer = 0;
      }
      return;
    }

    if (state.phase === "attack") {
      if (state.timer <= 1.75) {
        const ROT_TIME = 1;
        const rotP = Math.min(1, state.timer / ROT_TIME);
        const rotEased = 1 - Math.pow(1 - rotP, 2);
        function lerpAngle(a, b, t) {
          let d = b - a;
          if (d > Math.PI) d -= Math.PI * 2;
          if (d < -Math.PI) d += Math.PI * 2;
          return a + d * t;
        }
        state.sword.angle = lerpAngle(
          Math.PI / 2,
          state.sword.targetAngle,
          rotEased,
        );
        if (state.sword2.active) {
          state.sword2.angle = lerpAngle(
            Math.PI / 2,
            state.sword2.targetAngle,
            rotEased,
          );
        }

        state.sword.opacity = Math.min(1, state.timer * 4);
        state.sword.x = mouse.x + state.sword.dx * 100;
        state.sword.y = mouse.y + state.sword.dy * 100;
      } else {
        if (state.timer - dt <= 1.75) {
          playSound(
            `./ASSET/Sound/Enemies/Voidbreaker/Patch5_Voidbreaker_SwordLaunch${Math.random() < 0.5 ? "" : "_2"}.ogg`,
          );
          state.sword.lockX = state.sword.x;
          state.sword.lockY = state.sword.y;
          state.sword.flash = 1;
          state.flashX = state.sword.x;
          state.flashY = state.sword.y;
        }

        state.sword.flash = Math.max(0, state.sword.flash - dt);

        const t = state.timer - 1.75;
        const k = Math.min(1, t);

        const baseX = state.sword.lockX - state.sword.dx * DASH_DIST * k;
        const baseY = state.sword.lockY - state.sword.dy * DASH_DIST * k;
        const followStrength = 0.25;
        state.sword.x = baseX + (mouse.x - baseX) * followStrength;
        state.sword.y = baseY + (mouse.y - baseY) * followStrength;

        const FLASH_FOLLOW = 0.5;
        state.flashX += (state.sword.x - state.flashX) * FLASH_FOLLOW * dt;
        state.flashY += (state.sword.y - state.flashY) * FLASH_FOLLOW * dt;

        state.sword.opacity = 1 - k;

        const vx = mouse.x - state.sword.lockX;
        const vy = mouse.y - state.sword.lockY;

        const perp = Math.abs(vx * state.sword.dy - vy * state.sword.dx);

        const dist = perp;

        if (t > 0.25 && t <= 0.5 && dist <= KILL_RADIUS) {
          death("Voidbreaker");
        }
      }

      if (!casualMode && state.sword2.active) {
        if (state.timer <= 1.75) {
          state.sword2.opacity = Math.min(1, state.timer * 4);
          state.sword2.x = mouse.x + state.sword2.dx * 100;
          state.sword2.y = mouse.y + state.sword2.dy * 100;
        } else {
          if (state.timer - dt <= 1.75) {
            state.sword2.lockX = state.sword2.x;
            state.sword2.lockY = state.sword2.y;
            state.sword2.flash = 1;
            state.flashX2 = state.sword2.x;
            state.flashY2 = state.sword2.y;
          }
          const t = state.timer - 1.75;
          const k = Math.min(1, t);
          const baseX2 = state.sword2.lockX - state.sword2.dx * DASH_DIST * k;
          const baseY2 = state.sword2.lockY - state.sword2.dy * DASH_DIST * k;
          const followStrength = 0.25;
          state.sword2.x = baseX2 + (mouse.x - baseX2) * followStrength;
          state.sword2.y = baseY2 + (mouse.y - baseY2) * followStrength;
          state.sword2.flash = Math.max(0, state.sword2.flash - dt);
          state.sword2.opacity = 1 - k;

          const FLASH_FOLLOW = 0.5;
          state.flashX2 += (state.sword2.x - state.flashX2) * FLASH_FOLLOW * dt;
          state.flashY2 += (state.sword2.y - state.flashY2) * FLASH_FOLLOW * dt;

          const vx = mouse.x - state.sword2.lockX;
          const vy = mouse.y - state.sword2.lockY;
          if (
            t > 0.25 &&
            t <= 0.5 &&
            Math.abs(vx * state.sword2.dy - vy * state.sword2.dx) <= KILL_RADIUS
          ) {
            death("Voidbreaker");
          }
        }
      }

      if (hardMode) {
        if (state.timer >= 1.75 && !state.swordHard.active) {
          const dirHard = DIRECTIONS[(Math.random() * DIRECTIONS.length) | 0];

          state.swordHard.active = true;
          state.swordHard.dx = dirHard[0];
          state.swordHard.dy = dirHard[1];
          state.swordHard.targetAngle = Math.atan2(dirHard[1], dirHard[0]);
          state.swordHard.angle = Math.PI / 2;

          let dirHard2;
          do {
            dirHard2 = DIRECTIONS[(Math.random() * DIRECTIONS.length) | 0];
          } while (dirHard2[0] === dirHard[0] && dirHard2[1] === dirHard[1]);

          state.swordHard2.active = true;
          state.swordHard2.dx = dirHard2[0];
          state.swordHard2.dy = dirHard2[1];
          state.swordHard2.targetAngle = Math.atan2(dirHard2[1], dirHard2[0]);
          state.swordHard2.angle = Math.PI / 2;

          const randSound = Math.random() < 0.5;
          playSound(
            `./ASSET/Sound/Enemies/Voidbreaker/Patch5_Voidbreaker_Sword_Summon${randSound ? "" : "_2"}.ogg`,
            randSound ? 0.857 : 1,
          );
        }
        const timerHard = state.timer - 1.75;
        if (timerHard <= 1.75) {
          const ROT_TIME = 1;
          const rotP = Math.min(1, timerHard / ROT_TIME);
          const rotEased = 1 - Math.pow(1 - rotP, 2);
          function lerpAngle(a, b, t) {
            let d = b - a;
            if (d > Math.PI) d -= Math.PI * 2;
            if (d < -Math.PI) d += Math.PI * 2;
            return a + d * t;
          }
          state.swordHard.angle = lerpAngle(
            Math.PI / 2,
            state.swordHard.targetAngle,
            rotEased,
          );
          if (state.swordHard2.active) {
            state.swordHard2.angle = lerpAngle(
              Math.PI / 2,
              state.swordHard2.targetAngle,
              rotEased,
            );
          }

          state.swordHard.opacity = Math.min(1, timerHard * 4);
          state.swordHard.x = mouse.x + state.swordHard.dx * 100;
          state.swordHard.y = mouse.y + state.swordHard.dy * 100;
        } else {
          if (timerHard - dt <= 1.75) {
            playSound(
              `./ASSET/Sound/Enemies/Voidbreaker/Patch5_Voidbreaker_SwordLaunch${Math.random() < 0.5 ? "" : "_2"}.ogg`,
            );
            state.swordHard.lockX = state.swordHard.x;
            state.swordHard.lockY = state.swordHard.y;
            state.swordHard.flashHard = 1;
            state.flashHardX = state.swordHard.x;
            state.flashHardY = state.swordHard.y;
          }

          state.swordHard.flashHard = Math.max(
            0,
            state.swordHard.flashHard - dt,
          );

          const t = timerHard - 1.75;
          const k = Math.min(1, t);

          const baseX =
            state.swordHard.lockX - state.swordHard.dx * DASH_DIST * k;
          const baseY =
            state.swordHard.lockY - state.swordHard.dy * DASH_DIST * k;
          const followStrength = 0.25;
          state.swordHard.x = baseX + (mouse.x - baseX) * followStrength;
          state.swordHard.y = baseY + (mouse.y - baseY) * followStrength;

          const FLASH_FOLLOW = 0.5;
          state.flashHardX +=
            (state.swordHard.x - state.flashHardX) * FLASH_FOLLOW * dt;
          state.flashHardY +=
            (state.swordHard.y - state.flashHardY) * FLASH_FOLLOW * dt;

          state.swordHard.opacity = 1 - k;

          const vx = mouse.x - state.swordHard.lockX;
          const vy = mouse.y - state.swordHard.lockY;

          const perp = Math.abs(
            vx * state.swordHard.dy - vy * state.swordHard.dx,
          );

          const dist = perp;

          if (t > 0.25 && t <= 0.5 && dist <= KILL_RADIUS) {
            death("Voidbreaker");
          }
        }

        if (timerHard <= 1.75) {
          state.swordHard2.opacity = Math.min(1, timerHard * 4);
          state.swordHard2.x = mouse.x + state.swordHard2.dx * 100;
          state.swordHard2.y = mouse.y + state.swordHard2.dy * 100;
        } else {
          if (timerHard - dt <= 1.75) {
            state.swordHard2.lockX = state.swordHard2.x;
            state.swordHard2.lockY = state.swordHard2.y;
            state.swordHard2.flashHard = 1;
            state.flashHardX2 = state.swordHard2.x;
            state.flashHardY2 = state.swordHard2.y;
          }
          const t = timerHard - 1.75;
          const k = Math.min(1, t);
          const baseX2 =
            state.swordHard2.lockX - state.swordHard2.dx * DASH_DIST * k;
          const baseY2 =
            state.swordHard2.lockY - state.swordHard2.dy * DASH_DIST * k;
          const followStrength = 0.25;
          state.swordHard2.x = baseX2 + (mouse.x - baseX2) * followStrength;
          state.swordHard2.y = baseY2 + (mouse.y - baseY2) * followStrength;
          state.swordHard2.flashHard = Math.max(
            0,
            state.swordHard2.flashHard - dt,
          );
          state.swordHard2.opacity = 1 - k;

          const FLASH_FOLLOW = 0.5;
          state.flashHardX2 +=
            (state.swordHard2.x - state.flashHardX2) * FLASH_FOLLOW * dt;
          state.flashHardY2 +=
            (state.swordHard2.y - state.flashHardY2) * FLASH_FOLLOW * dt;

          const vx = mouse.x - state.swordHard2.lockX;
          const vy = mouse.y - state.swordHard2.lockY;
          if (
            t > 0.25 &&
            t <= 0.5 &&
            Math.abs(vx * state.swordHard2.dy - vy * state.swordHard2.dx) <=
              KILL_RADIUS
          ) {
            death("Voidbreaker");
          }
        }
      }

      if (state.timer >= (hardMode ? 4.5 : 2.75)) {
        state.sword.active = false;
        state.sword2.active = false;
        state.swordHard.active = false;
        state.swordHard2.active = false;
        state.phase = "ending";
        state.timer = 0;
        playSound(
          `./ASSET/Sound/Enemies/Voidbreaker/Patch5_Voidbreaker_Despawn.ogg`,
        );
      }
      return;
    }

    if (state.phase === "ending") {
      state.opacity = 1 - state.timer / 0.5;

      if (state.timer >= 0.5) {
        resetIdle();
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();

    if (state.phase !== "idle") {
      ctx.globalAlpha = state.opacity;

      const cx = Math.round(mouse.x);
      const cy = Math.round(mouse.y + HOVER_Y);

      const t = performance.now() * 0.001;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalAlpha *= 0.25;
      ctx.strokeStyle = "#b300ff";
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.arc(0, 0, 68, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 75, 0, Math.PI * 2);
      ctx.stroke();

      function drawHex(radius) {
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * Math.PI * 2;
          const x = Math.cos(ang) * radius;
          const y = Math.sin(ang) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.save();
      ctx.rotate(t);
      drawHex(60);
      ctx.restore();
      ctx.save();
      ctx.rotate(t + Math.PI / 4);
      drawHex(60);
      ctx.restore();

      ctx.restore();

      ctx.drawImage(
        enemy,
        Math.round(mouse.x - 75),
        Math.round(mouse.y + HOVER_Y - 75),
        150,
        150,
      );
    }

    if (state.sword.active) {
      ctx.globalAlpha = state.sword.opacity;

      if (state.sword.flash > 0) {
        ctx.save();
        ctx.translate(Math.round(state.flashX), Math.round(state.flashY));
        ctx.rotate(state.sword.angle + Math.PI);
        ctx.globalAlpha = 0.5 * state.sword.flash;
        const count = 12;
        for (let i = 0; i < count; i++) {
          const ang = Math.random() * Math.PI * 2;
          const dist = Math.random() * 20;

          const px = Math.cos(ang) * dist;
          const py = Math.sin(ang) * dist;

          const size = 4 + Math.random() * 8;

          ctx.save();
          ctx.translate(px, py);

          ctx.globalAlpha = state.sword.flash * (0.3 + Math.random() * 0.7);
          const fadeT = Math.min(1, (1 - state.sword.flash) / 0.25);
          const fade = 1 - fadeT;
          ctx.fillStyle = `rgb(${128 * fade * 0.5}, 0, ${128 * fade})`;

          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        ctx.restore();
      }

      ctx.save();
      ctx.translate(Math.round(state.sword.x), Math.round(state.sword.y));
      ctx.rotate(state.sword.angle + Math.PI);
      const swordSize = Math.round(SWORD_SIZE);
      if (state.phase === "attack" && state.timer <= 0.25) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.ellipse(0, 0, 80, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.drawImage(
        sword,
        Math.round(-swordSize / 2),
        Math.round(-swordSize / 2),
        swordSize,
        swordSize,
      );
      ctx.restore();
    }
    if (state.sword2.active) {
      ctx.globalAlpha = state.sword2.opacity;

      if (state.sword2.flash > 0) {
        ctx.save();
        ctx.translate(Math.round(state.flashX2), Math.round(state.flashY2));
        ctx.rotate(state.sword2.angle + Math.PI);
        ctx.globalAlpha = 0.5 * state.sword2.flash;
        const count = 12;
        for (let i = 0; i < count; i++) {
          const ang = Math.random() * Math.PI * 2;
          const dist = Math.random() * 20;

          const px = Math.cos(ang) * dist;
          const py = Math.sin(ang) * dist;

          const size = 4 + Math.random() * 8;

          ctx.save();
          ctx.translate(px, py);

          ctx.globalAlpha = state.sword2.flash * (0.3 + Math.random() * 0.7);
          const fadeT = Math.min(1, (1 - state.sword2.flash) / 0.25);
          const fade = 1 - fadeT;
          ctx.fillStyle = `rgb(${128 * fade * 0.5}, 0, ${128 * fade})`;

          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
        ctx.restore();
      }

      ctx.save();
      ctx.translate(Math.round(state.sword2.x), Math.round(state.sword2.y));
      ctx.rotate(state.sword2.angle + Math.PI);
      if (state.phase === "attack" && state.timer <= 0.25) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.ellipse(0, 0, 80, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.drawImage(
        sword,
        Math.round(-SWORD_SIZE / 2),
        Math.round(-SWORD_SIZE / 2),
        SWORD_SIZE,
        SWORD_SIZE,
      );
      ctx.restore();
    }
    if (state.swordHard.active) {
      ctx.globalAlpha = state.swordHard.opacity;

      if (state.swordHard.flashHard > 0) {
        ctx.save();
        ctx.translate(
          Math.round(state.flashHardX),
          Math.round(state.flashHardY),
        );
        ctx.rotate(state.swordHard.angle + Math.PI);
        ctx.globalAlpha = 0.5 * state.swordHard.flashHard;
        const count = 12;
        for (let i = 0; i < count; i++) {
          const ang = Math.random() * Math.PI * 2;
          const dist = Math.random() * 20;

          const px = Math.cos(ang) * dist;
          const py = Math.sin(ang) * dist;

          const size = 4 + Math.random() * 8;

          ctx.save();
          ctx.translate(px, py);

          ctx.globalAlpha =
            state.swordHard.flashHard * (0.3 + Math.random() * 0.7);
          const fadeT = Math.min(1, (1 - state.swordHard.flashHard) / 0.25);
          const fade = 1 - fadeT;
          ctx.fillStyle = `rgb(${128 * fade * 0.5}, 0, ${128 * fade})`;

          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        ctx.restore();
      }

      ctx.save();
      ctx.translate(
        Math.round(state.swordHard.x),
        Math.round(state.swordHard.y),
      );
      ctx.rotate(state.swordHard.angle + Math.PI);
      const swordHardSize = Math.round(SWORD_SIZE);
      if (state.phase === "attack" && state.timer <= 2) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.ellipse(0, 0, 80, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.drawImage(
        sword,
        Math.round(-swordHardSize / 2),
        Math.round(-swordHardSize / 2),
        swordHardSize,
        swordHardSize,
      );
      ctx.restore();
    }
    if (state.swordHard2.active) {
      ctx.globalAlpha = state.swordHard2.opacity;

      if (state.swordHard2.flashHard > 0) {
        ctx.save();
        ctx.translate(
          Math.round(state.flashHardX2),
          Math.round(state.flashHardY2),
        );
        ctx.rotate(state.swordHard2.angle + Math.PI);
        ctx.globalAlpha = 0.5 * state.swordHard2.flashHard;
        const count = 12;
        for (let i = 0; i < count; i++) {
          const ang = Math.random() * Math.PI * 2;
          const dist = Math.random() * 20;

          const px = Math.cos(ang) * dist;
          const py = Math.sin(ang) * dist;

          const size = 4 + Math.random() * 8;

          ctx.save();
          ctx.translate(px, py);

          ctx.globalAlpha =
            state.swordHard2.flashHard * (0.3 + Math.random() * 0.7);
          const fadeT = Math.min(1, (1 - state.swordHard2.flashHard) / 0.25);
          const fade = 1 - fadeT;
          ctx.fillStyle = `rgb(${128 * fade * 0.5}, 0, ${128 * fade})`;

          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
        ctx.restore();
      }

      ctx.save();
      ctx.translate(
        Math.round(state.swordHard2.x),
        Math.round(state.swordHard2.y),
      );
      ctx.rotate(state.swordHard2.angle + Math.PI);
      if (state.phase === "attack" && state.timer <= 2) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.ellipse(0, 0, 80, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.drawImage(
        sword,
        Math.round(-SWORD_SIZE / 2),
        Math.round(-SWORD_SIZE / 2),
        SWORD_SIZE,
        SWORD_SIZE,
      );
      ctx.restore();
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
