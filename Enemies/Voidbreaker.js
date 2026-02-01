import { death, mouse } from "../entityHost.js";
import {
  voidbreakerActive,
  setVoidbreakerActive,
  voidbreakerCount,
  playSound,
} from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Voidbreaker.png";

const sword = new Image();
sword.src = "./ASSET/Misc/Sword.png";

export function setup(host, stack, hardMode) {
  if (stack == 0) {
    const state = {
      phase: "idle",
      timer: 0,
      delay: 0,

      opacity: 0,
      flashX: 0,
      flashY: 0,
      flashX2: 0,
      flashY2: 0,

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
    };

    const HOVER_Y = -200;
    const DASH_DIST = 500;

    const SWORD_SIZE = 50;
    const KILL_RADIUS = 20;

    const FLASH_OUTER = 27;
    const FLASH_INNER = 6;

    const DIRECTIONS = [
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [1, -1],
    ];

    function resetIdle() {
      state.phase = "idle";
      state.timer = 0;
      state.delay = 9 + Math.random();
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
          playSound("./ASSET/Sound/Enemies/Voidbreaker/VoidBreaker_-_Warn.ogg");
          state.timer = 0;
          state.opacity = 0;
        }
        return;
      }

      if (state.phase === "warning") {
        state.opacity = state.timer <= 0.5 ? state.timer / 0.5 : 1;

        if (state.timer >= 3) {
          const dir = DIRECTIONS[(Math.random() * DIRECTIONS.length) | 0];

          state.sword.active = true;
          state.sword.opacity = 1;
          state.sword.dx = dir[0];
          state.sword.dy = dir[1];
          state.sword.angle = Math.atan2(dir[1], dir[0]);

          if (hardMode) {
            let dir2;
            do {
              dir2 = DIRECTIONS[(Math.random() * DIRECTIONS.length) | 0];
            } while (dir2[0] === dir[0] && dir2[1] === dir[1]);

            state.sword2.active = true;
            state.sword2.opacity = 1;
            state.sword2.dx = dir2[0];
            state.sword2.dy = dir2[1];
            state.sword2.angle = Math.atan2(dir2[1], dir2[0]);
          } else {
            state.sword2.active = false;
          }

          setVoidbreakerActive({
            start: performance.now(),
            count: stack + 1,
            id: (voidbreakerActive?.id || 0) + 1,
          });

          state.phase = "attack";
          playSound(
            "./ASSET/Sound/Enemies/Voidbreaker/VoidBreaker_-_SwordReadyV2.ogg",
          );
          state.timer = 0;
        }
        return;
      }

      if (state.phase === "attack") {
        if (state.timer <= 1.5) {
          state.sword.x = mouse.x + state.sword.dx * 120;
          state.sword.y = mouse.y + state.sword.dy * 120;
        } else {
          if (state.timer - dt <= 1.5) {
            state.sword.lockX = state.sword.x;
            state.sword.lockY = state.sword.y;
            state.sword.flash = 1;
            state.flashX = state.sword.x;
            state.flashY = state.sword.y;
          }

          state.sword.flash = Math.max(0, state.sword.flash - dt);

          const t = state.timer - 1.5;
          const k = Math.min(1, t);

          state.sword.x = state.sword.lockX - state.sword.dx * DASH_DIST * k;
          state.sword.y = state.sword.lockY - state.sword.dy * DASH_DIST * k;

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

        if (hardMode && state.sword2.active) {
          if (state.timer <= 1.5) {
            state.sword2.x = mouse.x + state.sword2.dx * 120;
            state.sword2.y = mouse.y + state.sword2.dy * 120;
          } else {
            if (state.timer - dt <= 1.5) {
              state.sword2.lockX = state.sword2.x;
              state.sword2.lockY = state.sword2.y;
              state.sword2.flash = 1;
              state.flashX2 = state.sword2.x;
              state.flashY2 = state.sword2.y;
            }
            const t = state.timer - 1.5;
            const k = Math.min(1, t);
            state.sword2.x =
              state.sword2.lockX - state.sword2.dx * DASH_DIST * k;
            state.sword2.y =
              state.sword2.lockY - state.sword2.dy * DASH_DIST * k;
            state.sword2.flash = Math.max(0, state.sword2.flash - dt);
            state.sword2.opacity = 1 - k;

            const FLASH_FOLLOW = 0.5;
            state.flashX2 +=
              (state.sword2.x - state.flashX2) * FLASH_FOLLOW * dt;
            state.flashY2 +=
              (state.sword2.y - state.flashY2) * FLASH_FOLLOW * dt;

            const vx = mouse.x - state.sword2.lockX;
            const vy = mouse.y - state.sword2.lockY;
            if (
              t > 0.25 &&
              t <= 0.5 &&
              Math.abs(vx * state.sword2.dy - vy * state.sword2.dx) <=
                KILL_RADIUS
            ) {
              death("Voidbreaker");
            }
          }
        }

        if (state.timer >= 2 * voidbreakerCount + 0.5) {
          state.sword.active = false;
          state.phase = "ending";
          state.timer = 0;
        }
        return;
      }

      if (state.phase === "ending") {
        if (state.timer > 0.5) {
          state.opacity = 1 - (state.timer - 0.5) / 0.5;
        }

        if (state.timer >= 1) {
          resetIdle();
        }
      }
    }

    function draw(ctx) {
      if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      if (state.phase !== "idle") {
        ctx.globalAlpha = state.opacity;
        ctx.drawImage(
          enemy,
          Math.round(mouse.x - 50),
          Math.round(mouse.y + HOVER_Y - 50),
          100,
          100,
        );
      }

      if (state.sword.active) {
        ctx.globalAlpha = state.sword.opacity;

        ctx.save();
        ctx.translate(Math.round(state.sword.x), Math.round(state.sword.y));
        ctx.rotate(state.sword.angle + 0.25 * Math.PI);
        const swordSize = Math.round(SWORD_SIZE);
        ctx.drawImage(
          sword,
          Math.round(-swordSize / 2),
          Math.round(-swordSize / 2),
          swordSize,
          swordSize,
        );
        ctx.restore();

        if (state.sword.flash > 0) {
          ctx.save();
          ctx.translate(Math.round(state.flashX), Math.round(state.flashY));
          ctx.rotate(state.sword.angle + 0.25 * Math.PI);

          const a = 0.5 * state.sword.flash;
          ctx.globalAlpha = a;
          ctx.fillStyle = "#b300ff";

          const rOuter = Math.round(FLASH_OUTER);
          const rInner = Math.round(FLASH_INNER);

          ctx.beginPath();
          ctx.moveTo(0, -rOuter);
          ctx.lineTo(rInner, -rInner);
          ctx.lineTo(rOuter, 0);
          ctx.lineTo(rInner, rInner);
          ctx.lineTo(0, rOuter);
          ctx.lineTo(-rInner, rInner);
          ctx.lineTo(-rOuter, 0);
          ctx.lineTo(-rInner, -rInner);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      }
      if (state.sword2.active) {
        ctx.globalAlpha = state.sword2.opacity;
        ctx.save();
        ctx.translate(Math.round(state.sword2.x), Math.round(state.sword2.y));
        ctx.rotate(state.sword2.angle + 0.25 * Math.PI);
        ctx.drawImage(
          sword,
          Math.round(-SWORD_SIZE / 2),
          Math.round(-SWORD_SIZE / 2),
          SWORD_SIZE,
          SWORD_SIZE,
        );
        ctx.restore();

        if (state.sword2.flash > 0) {
          ctx.save();
          ctx.translate(Math.round(state.flashX2), Math.round(state.flashY2));
          ctx.rotate(state.sword2.angle + 0.25 * Math.PI);
          ctx.globalAlpha = 0.5 * state.sword2.flash;
          ctx.fillStyle = "#b300ff";

          ctx.beginPath();
          ctx.moveTo(0, -FLASH_OUTER);
          ctx.lineTo(FLASH_INNER, -FLASH_INNER);
          ctx.lineTo(FLASH_OUTER, 0);
          ctx.lineTo(FLASH_INNER, FLASH_INNER);
          ctx.lineTo(0, FLASH_OUTER);
          ctx.lineTo(-FLASH_INNER, FLASH_INNER);
          ctx.lineTo(-FLASH_OUTER, 0);
          ctx.lineTo(-FLASH_INNER, -FLASH_INNER);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.restore();
    }

    const unregister = host.register({ update, draw });
    return unregister;
  } else {
    const state = {
      phase: "idle",
      timer: 0,

      lastAttackId: -1,
      triggered: false,

      sword: {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        angle: 0,
        opacity: 0,
        lockX: 0,
        lockY: 0,
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

      flash: 0,
      flashX: 0,
      flashY: 0,
      flash2: 0,
      flashX2: 0,
      flashY2: 0,
    };

    const DASH_DIST = 500;
    const SWORD_SIZE = 50;
    const KILL_RADIUS = 20;

    const DIRECTIONS = [
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [1, -1],
    ];

    function tryTrigger() {
      const v = voidbreakerActive;
      if (!v) return;

      if (state.lastAttackId === v.id) return;

      const slotIndex = stack;
      const slotTime = slotIndex * 2;
      const elapsed = (performance.now() - v.start) / 1000;

      if (elapsed >= slotTime && elapsed < slotTime + 2 && !state.triggered) {
        state.triggered = true;
        state.lastAttackId = v.id;
        beginSlash();
      }
    }

    function beginSlash() {
      const dir = DIRECTIONS[(Math.random() * DIRECTIONS.length) | 0];

      state.sword.dx = dir[0];
      state.sword.dy = dir[1];
      state.sword.angle = Math.atan2(dir[1], dir[0]);

      state.sword.opacity = 1;

      if (hardMode) {
        let dir2;
        do {
          dir2 = DIRECTIONS[(Math.random() * DIRECTIONS.length) | 0];
        } while (dir2[0] === dir[0] && dir2[1] === dir[1]);

        state.sword2.active = true;
        state.sword2.opacity = 1;
        state.sword2.dx = dir2[0];
        state.sword2.dy = dir2[1];
        state.sword2.angle = Math.atan2(dir2[1], dir2[0]);
      } else {
        state.sword2.active = false;
      }

      state.phase = "attack";
      playSound(
        "./ASSET/Sound/Enemies/Voidbreaker/VoidBreaker_-_SwordReadyV2.ogg",
      );
      state.timer = 0;
    }

    function update(dt) {
      if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

      tryTrigger();

      if (state.phase === "idle") return;

      state.timer += dt;

      if (state.phase === "attack") {
        if (state.timer <= 1.5) {
          state.sword.x = mouse.x + state.sword.dx * 120;
          state.sword.y = mouse.y + state.sword.dy * 120;
        } else {
          if (state.timer - dt <= 1.5) {
            state.sword.lockX = state.sword.x;
            state.sword.lockY = state.sword.y;

            state.flash = 1;
            state.flashX = state.sword.x;
            state.flashY = state.sword.y;
          }

          state.flash = Math.max(0, state.flash - dt);

          const t = state.timer - 1.5;
          const k = Math.min(1, t);

          state.sword.x = state.sword.lockX - state.sword.dx * DASH_DIST * k;
          state.sword.y = state.sword.lockY - state.sword.dy * DASH_DIST * k;

          state.sword.opacity = 1 - k;

          const FLASH_FOLLOW = 0.5;
          state.flashX += (state.sword.x - state.flashX) * FLASH_FOLLOW * dt;
          state.flashY += (state.sword.y - state.flashY) * FLASH_FOLLOW * dt;

          const vx = mouse.x - state.sword.lockX;
          const vy = mouse.y - state.sword.lockY;
          const perp = Math.abs(vx * state.sword.dy - vy * state.sword.dx);

          if (t > 0.25 && t <= 0.5 && perp <= KILL_RADIUS) {
            death("Voidbreaker");
          }
        }

        if (hardMode && state.sword2.active) {
          if (state.timer <= 1.5) {
            state.sword2.x = mouse.x + state.sword2.dx * 120;
            state.sword2.y = mouse.y + state.sword2.dy * 120;
          } else {
            if (state.timer - dt <= 1.5) {
              state.sword2.lockX = state.sword2.x;
              state.sword2.lockY = state.sword2.y;
              state.flash2 = 1;
              state.flashX2 = state.sword2.x;
              state.flashY2 = state.sword2.y;
            }
            const t = state.timer - 1.5;
            const k = Math.min(1, t);
            state.sword2.x =
              state.sword2.lockX - state.sword2.dx * DASH_DIST * k;
            state.sword2.y =
              state.sword2.lockY - state.sword2.dy * DASH_DIST * k;
            state.flash2 = Math.max(0, state.flash2 - dt);
            state.sword2.opacity = 1 - k;

            const FLASH_FOLLOW = 0.5;
            state.flashX2 +=
              (state.sword2.x - state.flashX2) * FLASH_FOLLOW * dt;
            state.flashY2 +=
              (state.sword2.y - state.flashY2) * FLASH_FOLLOW * dt;

            const vx = mouse.x - state.sword2.lockX;
            const vy = mouse.y - state.sword2.lockY;
            if (
              t > 0.25 &&
              t <= 0.5 &&
              Math.abs(vx * state.sword2.dy - vy * state.sword2.dx) <=
                KILL_RADIUS
            ) {
              death("Voidbreaker");
            }
          }
        }

        if (state.timer >= 2.5) {
          state.phase = "idle";
          state.timer = 0;
          state.triggered = false;
        }
      }
    }

    function draw(ctx) {
      if (state.phase === "idle") return;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      ctx.globalAlpha = state.sword.opacity;
      ctx.translate(Math.round(state.sword.x), Math.round(state.sword.y));
      ctx.rotate(state.sword.angle + 0.25 * Math.PI);
      const swordSize = Math.round(SWORD_SIZE);
      ctx.drawImage(
        sword,
        Math.round(-swordSize / 2),
        Math.round(-swordSize / 2),
        swordSize,
        swordSize,
      );
      ctx.restore();

      if (state.flash > 0) {
        ctx.save();
        ctx.translate(Math.round(state.flashX), Math.round(state.flashY));
        ctx.rotate(state.sword.angle + 0.25 * Math.PI);

        const a = 0.5 * state.flash;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#b300ff";

        const rOuter = Math.round(27);
        const rInner = Math.round(6);

        ctx.beginPath();
        ctx.moveTo(0, -rOuter);
        ctx.lineTo(rInner, -rInner);
        ctx.lineTo(rOuter, 0);
        ctx.lineTo(rInner, rInner);
        ctx.lineTo(0, rOuter);
        ctx.lineTo(-rInner, rInner);
        ctx.lineTo(-rOuter, 0);
        ctx.lineTo(-rInner, -rInner);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      if (state.sword2.active) {
        ctx.globalAlpha = state.sword2.opacity;
        ctx.save();
        ctx.translate(Math.round(state.sword2.x), Math.round(state.sword2.y));
        ctx.rotate(state.sword2.angle + 0.25 * Math.PI);
        ctx.drawImage(
          sword,
          Math.round(-SWORD_SIZE / 2),
          Math.round(-SWORD_SIZE / 2),
          SWORD_SIZE,
          SWORD_SIZE,
        );
        ctx.restore();

        if (state.flash2 > 0) {
          ctx.save();
          ctx.translate(Math.round(state.flashX2), Math.round(state.flashY2));
          ctx.rotate(state.sword2.angle + 0.25 * Math.PI);
          ctx.globalAlpha = 0.5 * state.flash2;
          ctx.fillStyle = "#b300ff";

          const rOuter = Math.round(27);
          const rInner = Math.round(6);

          ctx.beginPath();
          ctx.moveTo(0, -rOuter);
          ctx.lineTo(rInner, -rInner);
          ctx.lineTo(rOuter, 0);
          ctx.lineTo(rInner, rInner);
          ctx.lineTo(0, rOuter);
          ctx.lineTo(-rInner, rInner);
          ctx.lineTo(-rOuter, 0);
          ctx.lineTo(-rInner, -rInner);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
    }

    return host.register({ update, draw });
  }
}
