import { death, mouse } from "../entityHost.js";
import { playSound, uldm } from "../main.js";
import { operatorActive } from "./Operator.js";

const enemy = new Image();
const swordImg = new Image();
function loadAssets() {
  enemy.src = "./ASSET/Enemies/Voidbreaker.png";
  swordImg.src = "./ASSET/Misc/Sword.png";
}

let voidbreakerActive = false;
let voidbreakerCount = 0;
export let balletOfBladesActive = [false];
export let bladeBombardmentActive = [false];
export function setup(host, casualMode, hardMode) {
  loadAssets();
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

    swords: [],
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
  const BALLETDIRECTIONS = [
    [1, 0],
    [0.924, 0.383],
    [0.707, 0.707],
    [0.383, 0.924],
    [0, 1],
    [-0.383, 0.924],
    [-0.707, 0.707],
    [-0.924, 0.383],
    [-1, 0],
    [-0.924, -0.383],
    [-0.707, -0.707],
    [-0.383, -0.924],
    [0.383, -0.924],
    [0.707, -0.707],
    [0.924, -0.383],
  ];

  function resetIdle() {
    state.phase = "idle";
    state.timer = 0;
    state.delay =
      (9 + Math.random()) / voidbreakerCount +
      (bladeBombardmentActive[0] ? 1 : 0) +
      (balletOfBladesActive[0] ? 1 : 0);
    state.opacity = 0;
  }
  resetIdle();

  function spawnSword(dir, lastBallet = false) {
    const targetAngle = Math.atan2(dir[1], dir[0]);

    const sword = {
      phase: "spawn",
      timer: 0,

      active: true,

      x: 0,
      y: 0,

      dx: dir[0],
      dy: dir[1],

      opacity: 1,

      lockX: 0,
      lockY: 0,

      angle: Math.PI / 2,
      targetAngle,

      flash: 0,
      flashX: 0,
      flashY: 0,

      lastBallet,
    };

    state.swords.push(sword);

    const randSound = Math.random() < 0.5;
    if (balletOfBladesActive[0]) {
      playSound(
        `./ASSET/Sound/Enemies/Voidbreaker/Voidbreaker_BalletBlades_Spawn.ogg`,
        bladeBombardmentActive[0] ? 0.5 : 0.75,
      );
    } else {
      playSound(
        `./ASSET/Sound/Enemies/Voidbreaker/Patch5_Voidbreaker_Sword_Summon${randSound ? "" : "_2"}.ogg`,
        (randSound ? 0.857 : 1) * (bladeBombardmentActive[0] ? 0.75 : 1),
      );
    }
  }
  function updateSword(sword, dt) {
    sword.timer += dt;

    if (sword.phase === "spawn") {
      const ROT_TIME = 1;

      const rotP = Math.min(1, sword.timer / ROT_TIME);
      const rotEased = 1 - Math.pow(1 - rotP, 2);

      let d = sword.targetAngle - Math.PI / 2;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;

      sword.angle = Math.PI / 2 + d * rotEased;

      sword.opacity = Math.min(1, sword.timer * 4);

      sword.x = mouse.x + sword.dx * 100;
      sword.y = mouse.y + sword.dy * 100;

      if (sword.timer >= 1.75 * (bladeBombardmentActive[0] ? 1.333 : 1)) {
        sword.phase = "dash";
        sword.timer = 0;

        sword.lockX = sword.x;
        sword.lockY = sword.y;

        sword.flash = 1;
        sword.flashX = sword.x;
        sword.flashY = sword.y;

        if (bladeBombardmentActive[0]) {
          playSound(
            `./ASSET/Sound/Enemies/Voidbreaker/Voidbreaker_Bombardment_Fire.ogg`,
          );
          if (balletOfBladesActive[0] && sword.lastBallet) {
            playSound(
              `./ASSET/Sound/Enemies/Voidbreaker/Voidbreaker_BalletBlades_FireLast.ogg`,
            );
          }
        } else if (balletOfBladesActive[0]) {
          playSound(
            `./ASSET/Sound/Enemies/Voidbreaker/Voidbreaker_BalletBlades_Fire${1 + Math.floor(Math.random() * 4)}.ogg`,
          );
          if (sword.lastBallet) {
            playSound(
              `./ASSET/Sound/Enemies/Voidbreaker/Voidbreaker_BalletBlades_FireLast.ogg`,
            );
          }
        } else {
          playSound(
            `./ASSET/Sound/Enemies/Voidbreaker/Patch5_Voidbreaker_SwordLaunch${Math.random() < 0.5 ? "" : "_2"}.ogg`,
          );
        }
      }

      return;
    }

    if (sword.phase === "dash") {
      sword.flash = Math.max(0, sword.flash - dt);

      const k = Math.min(
        1,
        sword.timer * (bladeBombardmentActive[0] ? 1.333 : 1),
      );

      const baseX = sword.lockX - sword.dx * DASH_DIST * k;
      const baseY = sword.lockY - sword.dy * DASH_DIST * k;

      sword.x = baseX + (mouse.x - baseX) * 0.25;
      sword.y = baseY + (mouse.y - baseY) * 0.25;

      sword.flashX += (sword.x - sword.flashX) * 0.5 * dt;
      sword.flashY += (sword.y - sword.flashY) * 0.5 * dt;

      sword.opacity = 1 - k;

      const vx = mouse.x - sword.lockX;
      const vy = mouse.y - sword.lockY;

      const perp = Math.abs(vx * sword.dy - vy * sword.dx);
      const along = -(vx * sword.dx + vy * sword.dy);
      if (
        sword.timer > 0.25 &&
        sword.timer <= 0.5 &&
        perp <=
          KILL_RADIUS *
            (balletOfBladesActive[0] ? 0.75 : 1) *
            (bladeBombardmentActive[0] ? 0.75 : 1) &&
        along >= -Infinity &&
        along <= (bladeBombardmentActive[0] ? Infinity : 200)
      ) {
        death("Voidbreaker");
      }

      if (sword.timer >= 1) {
        sword.active = false;
      }
    }
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.timer += dt;

    for (let i = state.swords.length - 1; i >= 0; i--) {
      updateSword(state.swords[i], dt);

      if (!state.swords[i].active) state.swords.splice(i, 1);
    }

    if (state.phase === "idle") {
      if (state.timer >= state.delay && !operatorActive) {
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
        const SWORD_COUNT =
          1 +
          (casualMode ? 0 : 1) +
          (bladeBombardmentActive[0] ? 2 : 0) +
          (balletOfBladesActive[0] ? 1 : 0);
        const availableDirections = balletOfBladesActive[0]
          ? [...BALLETDIRECTIONS]
          : [...DIRECTIONS];
        for (
          let i = 0;
          i < Math.min(SWORD_COUNT, availableDirections.length);
          i++
        ) {
          const index = (Math.random() * availableDirections.length) | 0;
          const dir = availableDirections.splice(index, 1)[0];
          spawnSword(dir);
        }

        state.phase = "attack";
        state.swordHard = false;
        state.swordBallet1 = false;
        state.swordBallet2 = false;
        state.swordBallet3 = false;
        state.swordHardBallet = false;
        state.timer = 0;
      }
      return;
    }

    if (state.phase === "attack") {
      if (balletOfBladesActive[0]) {
        if (
          state.timer >= 0.5 * (bladeBombardmentActive[0] ? 2 : 1) &&
          !state.swordBallet1
        ) {
          state.swordBallet1 = true;
          const SWORD_COUNT =
            2 + (casualMode ? 0 : 1) + (bladeBombardmentActive[0] ? 2 : 0);
          const availableDirections = [...BALLETDIRECTIONS];
          for (
            let i = 0;
            i < Math.min(SWORD_COUNT, availableDirections.length);
            i++
          ) {
            const index = (Math.random() * availableDirections.length) | 0;
            const dir = availableDirections.splice(index, 1)[0];
            spawnSword(dir);
          }
        } else if (
          state.timer >= 1 * (bladeBombardmentActive[0] ? 2 : 1) &&
          !state.swordBallet2
        ) {
          state.swordBallet2 = true;
          const SWORD_COUNT =
            2 + (casualMode ? 0 : 1) + (bladeBombardmentActive[0] ? 2 : 0);
          const availableDirections = [...BALLETDIRECTIONS];
          for (
            let i = 0;
            i < Math.min(SWORD_COUNT, availableDirections.length);
            i++
          ) {
            const index = (Math.random() * availableDirections.length) | 0;
            const dir = availableDirections.splice(index, 1)[0];
            spawnSword(dir);
          }
        } else if (
          state.timer >= 1.5 * (bladeBombardmentActive[0] ? 2 : 1) &&
          !state.swordBallet3
        ) {
          state.swordBallet3 = true;
          const SWORD_COUNT =
            2 + (casualMode ? 0 : 1) + (bladeBombardmentActive[0] ? 2 : 0);
          const availableDirections = [...BALLETDIRECTIONS];
          for (
            let i = 0;
            i < Math.min(SWORD_COUNT, availableDirections.length);
            i++
          ) {
            const index = (Math.random() * availableDirections.length) | 0;
            const dir = availableDirections.splice(index, 1)[0];
            spawnSword(dir, !hardMode);
          }
        } else if (
          hardMode &&
          state.timer >= 2 * (bladeBombardmentActive[0] ? 2 : 1) &&
          !state.swordHardBallet
        ) {
          state.swordHardBallet = true;
          const SWORD_COUNT =
            2 + (casualMode ? 0 : 1) + (bladeBombardmentActive[0] ? 2 : 0);
          const availableDirections = [...BALLETDIRECTIONS];
          for (
            let i = 0;
            i < Math.min(SWORD_COUNT, availableDirections.length);
            i++
          ) {
            const index = (Math.random() * availableDirections.length) | 0;
            const dir = availableDirections.splice(index, 1)[0];
            spawnSword(dir, true);
          }
        }
      }

      if (
        hardMode &&
        state.timer >= 1.75 * (bladeBombardmentActive[0] ? 1.333 : 1) &&
        !state.swordHard &&
        !balletOfBladesActive[0]
      ) {
        state.swordHard = true;
        const SWORD_COUNT =
          2 +
          (bladeBombardmentActive[0] ? 2 : 0) +
          (balletOfBladesActive[0] ? 1 : 0);
        const availableDirections = [...DIRECTIONS];
        for (
          let i = 0;
          i < Math.min(SWORD_COUNT, availableDirections.length);
          i++
        ) {
          const index = (Math.random() * availableDirections.length) | 0;
          const dir = availableDirections.splice(index, 1)[0];
          spawnSword(dir);
        }
      }

      if (
        state.timer >=
        ((hardMode ? 3.5 : 1.75) +
          (balletOfBladesActive[0]
            ? (bladeBombardmentActive[0] ? 1.5 : 1) * 1.5
            : 0) -
          (hardMode && balletOfBladesActive[0]
            ? bladeBombardmentActive[0]
              ? 1
              : 1.25
            : 0)) *
          (bladeBombardmentActive[0] ? 1.333 : 1) +
          1
      ) {
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

  function drawSword(ctx, sword) {
    ctx.globalAlpha = sword.opacity;

    if (sword.flash > 0 && !uldm) {
      ctx.save();
      ctx.translate(Math.round(sword.flashX), Math.round(sword.flashY));
      ctx.rotate(sword.angle + Math.PI);
      ctx.globalAlpha = 0.5 * sword.flash;

      const count = 12;

      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.random() * 20;

        const px = Math.cos(ang) * dist;
        const py = Math.sin(ang) * dist;

        const size = 4 + Math.random() * 8;

        ctx.save();
        ctx.translate(px, py);

        ctx.globalAlpha = sword.flash * (0.3 + Math.random() * 0.7);

        const fadeT = Math.min(1, (1 - sword.flash) / 0.25);
        const fade = 1 - fadeT;

        ctx.fillStyle = `rgb(${128 * fade * 0.5},0,${128 * fade})`;

        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();
    }

    ctx.save();
    ctx.translate(Math.round(sword.x), Math.round(sword.y));
    ctx.rotate(sword.angle + Math.PI);

    if (sword.phase === "spawn" && sword.timer <= 0.25 && !uldm) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.ellipse(0, 0, 80, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.drawImage(
      swordImg,
      (-SWORD_SIZE / 2) *
        (balletOfBladesActive[0] ? 1.1 : 1) *
        (bladeBombardmentActive[0] ? 1.1 : 1),
      (-SWORD_SIZE / 2) *
        (balletOfBladesActive[0] ? 0.9 : 1) *
        (bladeBombardmentActive[0] ? 1.1 : 1),
      SWORD_SIZE *
        (balletOfBladesActive[0] ? 1.1 : 1) *
        (bladeBombardmentActive[0] ? 1.1 : 1),
      SWORD_SIZE *
        (balletOfBladesActive[0] ? 0.9 : 1) *
        (bladeBombardmentActive[0] ? 1.1 : 1),
    );

    ctx.restore();
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();

    if (state.phase !== "idle") {
      ctx.globalAlpha = state.opacity;

      const cx = Math.round(mouse.x);
      const cy = Math.round(mouse.y + HOVER_Y);

      const t = performance.now() * 0.001;

      if (!uldm) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalAlpha *= 0.25;
        ctx.strokeStyle = "#b300ff";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(0, 0, 55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
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
        drawHex(50);
        ctx.restore();
        ctx.save();
        ctx.rotate(t + Math.PI / 4);
        drawHex(50);
        ctx.restore();

        ctx.restore();
      }

      ctx.drawImage(
        enemy,
        Math.round(mouse.x - 75),
        Math.round(mouse.y + HOVER_Y - 75),
        150,
        150,
      );
    }

    for (const sword of state.swords) {
      drawSword(ctx, sword);
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
