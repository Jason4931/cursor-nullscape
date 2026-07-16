import { death, mouse } from "../entityHost.js";
import { playSound } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/VoidboundGuardian.png";
const enemy2 = new Image();
enemy2.src = "./ASSET/Enemies/Skull.png";

export function setup(host, hardMode) {
  const state = {
    x: 0,
    y: 0,
    opacity: 1,

    mode: "move",
    timer: 0,

    dashStartX: 0,
    dashStartY: 0,
    dashTargetX: 0,
    dashTargetY: 0,

    pellets: [],
    shotsFired: 0,
    shootDuration: 0,
  };

  const Enemy = Math.random() < 0.9 ? enemy : enemy2;
  const DASH_RADIUS = hardMode ? 320 : 640;
  const DASH_TIME = 1.5;
  const IDLE_SHOOT_TIME = 0.5;
  const IDLE_TIME = 0.5;
  const HOMING_STRENGTH = 1;

  function startMove() {
    state.mode = "move";
    state.timer = 0;

    state.dashStartX = state.x;
    state.dashStartY = state.y;

    const a = Math.random() * Math.PI * 2;
    const r = DASH_RADIUS * (0.4 + Math.random() * 0.6);

    state.dashTargetX = mouse.x + Math.cos(a) * r;
    state.dashTargetY = mouse.y + Math.sin(a) * r;
    let moveSound = [
      "./ASSET/Sound/Enemies/VoidboundGuardian/VoidboundGuardianMove1.ogg",
      "./ASSET/Sound/Enemies/VoidboundGuardian/VoidboundGuardianMove2.ogg",
      "./ASSET/Sound/Enemies/VoidboundGuardian/VoidboundGuardianMove3.ogg",
    ];
    playSound(moveSound[Math.floor(Math.random() * 3)]);
  }

  function startIdleShoot() {
    state.mode = "idleShoot";
    state.timer = 0;
  }

  function startShoot() {
    state.mode = "shoot";
    state.timer = 0;
    state.shotsFired = 0;
    state.shootDuration = 0.5 + Math.random();
  }

  function startIdle() {
    state.mode = "idle";
    state.timer = 0;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function firePellet() {
    const dx = mouse.x - state.x;
    const dy = mouse.y - state.y - 20;
    const len = Math.hypot(dx, dy) || 1;

    const speed = hardMode ? 1418 : 945;

    state.pellets.push({
      x: state.x,
      y: state.y + 20,
      vx: (dx / len) * speed,
      vy: (dy / len) * speed,
      born: performance.now(),
    });
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.timer += dt;

    if (state.mode === "move") {
      const t = Math.min(state.timer / DASH_TIME, 1);
      const e = easeOut(t);

      state.x = state.dashStartX + (state.dashTargetX - state.dashStartX) * e;
      state.y = state.dashStartY + (state.dashTargetY - state.dashStartY) * e;

      if (t >= 1) {
        startIdleShoot();
      }
    } else if (state.mode === "idleShoot") {
      if (state.timer >= IDLE_SHOOT_TIME) {
        startShoot();
      }
    } else if (state.mode === "shoot") {
      const interval = state.shootDuration / (hardMode ? 4 : 3);

      if (
        state.shotsFired < (hardMode ? 4 : 3) &&
        state.timer >= interval * state.shotsFired
      ) {
        firePellet();
        playSound(
          "./ASSET/Sound/Enemies/VoidboundGuardian/VoidboundGuardianShoot.ogg",
        );
        state.shotsFired++;
      }

      if (state.timer >= state.shootDuration) {
        startIdle();
      }
    } else if (state.mode === "idle") {
      if (state.timer >= IDLE_TIME) {
        startMove();
      }
    }

    const now = performance.now();
    for (let i = state.pellets.length - 1; i >= 0; i--) {
      const p = state.pellets[i];

      const ddx = mouse.x - p.x;
      const ddy = mouse.y - p.y;
      const vLen = Math.hypot(p.vx, p.vy) || 1;
      const vx = p.vx / vLen;
      const vy = p.vy / vLen;
      const px = -vy;
      const py = vx;
      const side = ddx * px + ddy * py;
      p.vx += px * side * HOMING_STRENGTH * dt;
      p.vy += py * side * HOMING_STRENGTH * dt;
      const newLen = Math.hypot(p.vx, p.vy) || 1;
      const speed = 630;
      p.vx = (p.vx / newLen) * speed;
      p.vy = (p.vy / newLen) * speed;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (now - p.born > 4500) {
        state.pellets.splice(i, 1);
        continue;
      }

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      if (dx * dx + dy * dy < 12 * 12) {
        death("VoidboundGuardian");
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    ctx.drawImage(
      Enemy,
      Math.round(state.x - 50),
      Math.round(state.y - 50),
      100,
      100,
    );

    if (state.mode === "idleShoot") {
      const t = Math.min(state.timer / IDLE_SHOOT_TIME, 1);
      const alpha = (1 - t) * 0.5;

      const rOuter = 36;
      const rInner = 10;

      ctx.translate(Math.round(state.x + 12), Math.round(state.y - 5));

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
      ctx.fillStyle = `rgba(255,130,220,${alpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, -rInner);
      ctx.lineTo(rInner, 0);
      ctx.lineTo(0, rInner);
      ctx.lineTo(-rInner, 0);
      ctx.closePath();
      ctx.fillStyle = `rgba(210,140,255,${alpha})`;
      ctx.fill();
    }

    ctx.fillStyle = `#f${Math.floor(Math.random() * 5)}f`;
    for (const p of state.pellets) {
      ctx.beginPath();
      ctx.arc(Math.round(p.x), Math.round(p.y), 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  startMove();

  const unregister = host.register({ update, draw });
  return unregister;
}
