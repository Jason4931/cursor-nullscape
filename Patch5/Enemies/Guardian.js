import { death, mouse } from "../entityHost.js";
import { playSound, passageGoldPattern } from "../main.js";

const Guardian_Idle_Animation = [];
for (let i = 1; i <= 16; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Guardian/Guardian_Idle_Animation/Layer ${i}.png`;
  Guardian_Idle_Animation.push(img);
}
const GuardianSHOOT = [];
for (let i = 1; i <= 23; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Guardian/GuardianSHOOT/Layer ${i}.png`;
  GuardianSHOOT.push(img);
}
const GuardianEnragedIdle = [];
for (let i = 1; i <= 16; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Guardian/GuardianEnragedIdle/Layer ${i}.png`;
  GuardianEnragedIdle.push(img);
}

export function setup(host, hardMode) {
  const state = {
    x: 0,
    y: 0,
    opacity: 1,
    layers: Guardian_Idle_Animation,
    enemy: null,
    layer: 0,
    layerChange: [false, false],
    enrage: false,

    DASH_TIME: 3,
    IDLE_SHOOT_TIME: 1,
    IDLE_TIME: 1,

    mode: "move",
    timer: 0,

    dashStartX: 0,
    dashStartY: 0,
    dashTargetX: 0,
    dashTargetY: 0,

    shootCirc: 30,
    pellets: [],
    shotsFired: 0,
    shootDuration: 0,
  };

  const DASH_RADIUS = 640;

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
    state.shootDuration = state.enrage
      ? 0.5 + Math.random()
      : 1 + Math.random();
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
      trail: [],
    });
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.timer += dt;
    if (hardMode) {
      state.opacity -= dt;
      if (state.opacity < 0) state.opacity = 0;
    }
    state.layer++;
    if (state.layer > state.layers.length) state.layer = 1;
    state.enemy = state.layers[state.layer - 1];
    if (state.shootCirc < 30) state.shootCirc += 4;

    if (passageGoldPattern > 0 && !state.enrage) {
      state.enrage = true;
      state.DASH_TIME = 1.5;
      state.IDLE_SHOOT_TIME = 0.5;
      state.IDLE_TIME = 0.5;
      playSound("./ASSET/Sound/Enemies/Guardian/Guardian_Enrage.ogg");
    }

    /* ===== MOVE ===== */
    if (state.mode === "move") {
      state.opacity += dt * 4;
      if (state.opacity > 1) state.opacity = 1;
      const t = Math.min(state.timer / state.DASH_TIME, 1);
      const e = easeOut(t);

      state.x = state.dashStartX + (state.dashTargetX - state.dashStartX) * e;
      state.y = state.dashStartY + (state.dashTargetY - state.dashStartY) * e;

      if (t >= 1) {
        startIdleShoot();
        playSound("./ASSET/Sound/Enemies/Guardian/Guardian_Indicator.ogg");
      }
    } else if (state.mode === "idleShoot") {
      /* ===== IDLE SHOOT (SPARK) ===== */
      if (state.timer >= state.IDLE_SHOOT_TIME) {
        startShoot();
      }
    } else if (state.mode === "shoot") {
      /* ===== SHOOT ===== */
      const interval = state.shootDuration / (hardMode ? 4 : 3);

      if (
        state.shotsFired < (hardMode ? 4 : 3) &&
        state.timer >= interval * state.shotsFired
      ) {
        state.opacity = 1;
        firePellet();
        state.shootCirc = 0;
        if (!state.layerChange[0]) {
          state.layers = GuardianSHOOT;
          state.layer = state.layers.length;
          if (state.shotsFired == (hardMode ? 4 : 3))
            state.layerChange[0] = true;
        }
        playSound("./ASSET/Sound/Enemies/Guardian/GuardianShoot.ogg");
        state.shotsFired++;
      }

      if (state.timer >= state.shootDuration) {
        startIdle();
        if (!state.layerChange[1]) {
          state.layers = state.enrage
            ? GuardianEnragedIdle
            : Guardian_Idle_Animation;
          state.layer = state.layers.length;
          state.layerChange[1] = true;
        }
      }
    } else if (state.mode === "idle") {
      /* ===== IDLE ===== */
      if (state.timer >= state.IDLE_TIME) {
        state.layerChange[0] = false;
        state.layerChange[1] = false;
        startMove();
      }
    }

    /* ===== PELLETS ===== */
    const now = performance.now();
    for (let i = state.pellets.length - 1; i >= 0; i--) {
      const p = state.pellets[i];

      p.trail.push({
        x: p.x,
        y: p.y,
        life: 1,
      });

      for (let i = p.trail.length - 1; i >= 0; i--) {
        const t = p.trail[i];
        t.life -= dt * 2;

        if (t.life <= 0) {
          p.trail.splice(i, 1);
        }
      }

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

    if (state.mode === "idleShoot") {
      ctx.save();
      const t = Math.min(state.timer / state.IDLE_SHOOT_TIME, 1);
      const alpha = (1 - t) * 0.5;

      const rOuter = 36;
      const rInner = 10;

      ctx.translate(Math.round(state.x), Math.round(state.y));

      ctx.beginPath();
      ctx.moveTo(0, -rOuter * 2);
      ctx.lineTo(rInner, -rInner);
      ctx.lineTo(rOuter, 0);
      ctx.lineTo(rInner, rInner);
      ctx.lineTo(0, rOuter * 2);
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

      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,130,220,${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    }

    ctx.drawImage(
      state.enemy,
      Math.round(state.x - 50),
      Math.round(state.y - 50),
      100,
      100,
    );

    if (state.shootCirc < 30) {
      ctx.beginPath();
      ctx.arc(
        Math.round(state.x - 5),
        Math.round(state.y + 20),
        state.shootCirc,
        0,
        Math.PI * 2,
      );
      ctx.strokeStyle = `rgba(255,255,255,${(30 - state.shootCirc) / 30})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = `#f${Math.floor(Math.random() * 5)}${Math.floor(Math.random() * 5)}`;
    for (const p of state.pellets) {
      ctx.globalAlpha = 1;
      for (const t of p.trail) {
        ctx.beginPath();
        ctx.arc(Math.round(t.x), Math.round(t.y), 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${t.life / 2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

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
