import { death, mouse } from "../entityHost.js";
import { ESP, playSound, uldm } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Guardian.png";

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

  const DASH_RADIUS = 640;
  const DASH_TIME = 3;
  const IDLE_SHOOT_TIME = 1;
  const IDLE_TIME = 1;

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
      "./ASSET/Sound/Enemies/Guardian/GuardianMove1.ogg",
      "./ASSET/Sound/Enemies/Guardian/GuardianMove2.ogg",
      "./ASSET/Sound/Enemies/Guardian/GuardianMove3.ogg",
    ];
    playSound(moveSound[Math.floor(Math.random() * 3)], 0.75);
  }

  function startIdleShoot() {
    state.mode = "idleShoot";
    state.timer = 0;
  }

  function startShoot() {
    state.mode = "shoot";
    state.timer = 0;
    state.shotsFired = 0;
    state.shootDuration = 1 + Math.random();
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

    const speed = hardMode ? 945 : 630;

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

    /* ===== MOVE ===== */
    if (state.mode === "move") {
      const t = Math.min(state.timer / DASH_TIME, 1);
      const e = easeOut(t);

      state.x = state.dashStartX + (state.dashTargetX - state.dashStartX) * e;
      state.y = state.dashStartY + (state.dashTargetY - state.dashStartY) * e;

      if (t >= 1) {
        startIdleShoot();
      }
    } else if (state.mode === "idleShoot") {
      /* ===== IDLE SHOOT (SPARK) ===== */
      if (state.timer >= IDLE_SHOOT_TIME) {
        startShoot();
      }
    } else if (state.mode === "shoot") {
      /* ===== SHOOT ===== */
      const interval = state.shootDuration / (hardMode ? 4 : 3);

      if (
        state.shotsFired < (hardMode ? 4 : 3) &&
        state.timer >= interval * state.shotsFired
      ) {
        firePellet();
        playSound("./ASSET/Sound/Enemies/Guardian/GuardianShoot.ogg");
        state.shotsFired++;
      }

      if (state.timer >= state.shootDuration) {
        startIdle();
      }
    } else if (state.mode === "idle") {
      /* ===== IDLE ===== */
      if (state.timer >= IDLE_TIME) {
        startMove();
      }
    }

    /* ===== PELLETS ===== */
    const now = performance.now();
    for (let i = state.pellets.length - 1; i >= 0; i--) {
      const p = state.pellets[i];

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (now - p.born > 10500) {
        state.pellets.splice(i, 1);
        continue;
      }

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      if (dx * dx + dy * dy < 12 * 12) {
        death("Guardian");
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    ESP(state.x, state.y, 100, "guardian");
    ctx.drawImage(
      enemy,
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

      if (!uldm) {
        ctx.beginPath();
        ctx.moveTo(0, -rInner);
        ctx.lineTo(rInner, 0);
        ctx.lineTo(0, rInner);
        ctx.lineTo(-rInner, 0);
        ctx.closePath();
        ctx.fillStyle = `rgba(210,140,255,${alpha})`;
        ctx.fill();
      }
    }

    ctx.fillStyle = `#f${Math.floor(Math.random() * 5)}${Math.floor(Math.random() * 5)}`;
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
