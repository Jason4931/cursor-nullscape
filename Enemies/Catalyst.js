import { death, mouse } from "../entityHost.js";
import { moveCamera } from "../main.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Catalyst/Layer 1.png";

export function setup(host) {
  const state = {
    phase: "initDarken",

    x: 0,
    y: 0,

    layer: 1,
    timer: 0,
    totalTimer: 0,

    cycleTime: 0,
    cycleDuration: 1,

    auraTimer: 0,
    screaming: false,

    dashFromX: 0,
    dashFromY: 0,
    dashToX: 0,
    dashToY: 0,
    dashStarted: false,
    camShakeX: 0,
    camShakeY: 0,

    pellets: [],
  };

  const BODY_RADIUS = 80;
  const PELLET_RADIUS = 8;

  /* ---------------- HELPERS ---------------- */

  function randNearCursor(r = 750) {
    const a = Math.random() * Math.PI * 2;
    const d = r * 0.75 + Math.random() * r * 0.25;
    return {
      x: mouse.x + Math.cos(a) * d,
      y: mouse.y + Math.sin(a) * d,
    };
  }

  function spawnPellet(x, y, vx, vy) {
    state.pellets.push({
      x,
      y,
      vx,
      vy,
      life: 10,
    });
  }

  function pelletToCursor(random = false) {
    let dx = mouse.x - state.x;
    let dy = mouse.y - state.y;
    let d = Math.hypot(dx, dy) || 1;

    if (random) {
      const a = Math.random() * Math.PI * 2;
      dx = Math.cos(a);
      dy = Math.sin(a);
      d = 1;
    }

    spawnPellet(
      state.x,
      state.y,
      (dx / d - 0.1 + Math.random() * 0.2) * 220,
      (dy / d - 0.1 + Math.random() * 0.2) * 220
    );
  }

  function checkDeath(x, y, r) {
    const dx = mouse.x - x;
    const dy = mouse.y - y;
    if (dx * dx + dy * dy <= r * r) death("Catalyst", "#660000");
  }

  /* ---------------- UPDATE ---------------- */

  function update(dt) {
    if (!Number.isFinite(mouse.x)) return;

    state.layer++;
    if (state.layer > 8) state.layer = 1;
    enemy.src = `./ASSET/Enemies/Catalyst/Layer ${state.layer}.png`;

    for (let i = state.pellets.length - 1; i >= 0; i--) {
      const p = state.pellets[i];

      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const d = Math.hypot(dx, dy) || 1;

      p.vx += (dx / d) * 18 * dt;
      p.vy += (dy / d) * 18 * dt;

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      checkDeath(p.x, p.y, PELLET_RADIUS);

      if (p.life <= 0) state.pellets.splice(i, 1);
    }

    state.timer += dt;
    if (state.phase === "chase") state.totalTimer += dt;

    /* ---------- INIT DARKEN ---------- */

    if (state.phase === "initDarken") {
      if (state.timer >= 3) {
        state.timer = 0;
        state.phase = "waitSpawn";
      }
      return;
    }

    if (state.phase === "waitSpawn") {
      if (state.timer >= 7) {
        const p = randNearCursor();
        state.x = p.x;
        state.y = p.y;
        state.timer = 0;
        state.phase = "scream";
        state.screaming = true;
      }
      return;
    }

    /* ---------- SCREAM ---------- */

    if (state.phase === "scream") {
      state.auraTimer += dt * 6;

      const nx = -20 + Math.random() * 40;
      const ny = -20 + Math.random() * 40;

      // remove previous shake
      moveCamera(-state.camShakeX, -state.camShakeY, true);

      // apply new shake
      moveCamera(nx, ny, true);

      // store applied offset
      state.camShakeX = nx;
      state.camShakeY = ny;

      if (state.timer >= 3) {
        state.timer = 0;
        state.phase = "chase";
        state.screaming = false;
        state.cycleTime = 0;
        state.dashStarted = false;
      }
      return;
    }

    /* ---------- CHASE ---------- */

    state.cycleTime += dt;

    const t0 = 0.25 * state.cycleDuration;
    const t1 = t0 + 0.25 * state.cycleDuration;
    const t2 = t1 + 0.125 * state.cycleDuration;
    const t3 = t2 + 0.125 * state.cycleDuration;
    const t4 = t3 + 0.25 * state.cycleDuration;

    // DASH
    if (state.cycleTime < t0) {
      if (!state.dashStarted) {
        const p = randNearCursor();
        state.dashFromX = state.x;
        state.dashFromY = state.y;
        state.dashToX = p.x;
        state.dashToY = p.y;
        state.dashStarted = true;
      }

      const k = state.cycleTime / t0;
      const e = k * (2 - k); // easeOut

      state.x = state.dashFromX + (state.dashToX - state.dashFromX) * e;
      state.y = state.dashFromY + (state.dashToY - state.dashFromY) * e;
    }

    // 1 pellet → cursor
    else if (state.cycleTime < t1 && !state.fired1) {
      pelletToCursor(false);
      state.fired1 = true;
    }

    // random pellet 1
    else if (state.cycleTime < t2 && !state.fired2) {
      pelletToCursor(true);
      state.fired2 = true;
    }

    // random pellet 2
    else if (state.cycleTime < t3 && !state.fired3) {
      pelletToCursor(true);
      state.fired3 = true;
    }

    // final pellet → cursor
    else if (state.cycleTime < t4 && !state.fired4) {
      pelletToCursor(false);
      state.fired4 = true;
    }

    // RESET CYCLE
    if (state.cycleTime >= state.cycleDuration) {
      state.cycleTime = 0;
      state.dashStarted = false;
      state.fired1 = state.fired2 = state.fired3 = state.fired4 = false;
    }

    // ESCALATING SCREAM
    if (state.totalTimer >= 15) {
      state.totalTimer = 0;
      state.phase = "scream";
      state.timer = 0;
      state.screaming = true;
      state.cycleDuration *= 0.9;
    }

    /* ---------- DEATH ---------- */

    checkDeath(state.x, state.y, BODY_RADIUS);
  }

  /* ---------------- DRAW ---------------- */

  function draw(ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // INIT DARKEN
    if (state.phase === "initDarken") {
      const t = state.timer;
      let a = t < 1 ? t : t > 2 ? 3 - t : 1;

      const g = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        800
      );
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(0,0,0,${a})`);

      ctx.fillStyle = g;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // AURA
    if (state.screaming) {
      for (let i = 0; i < 4; i++) {
        const r = (state.auraTimer * 250 + i * 200) % 2200;
        const g = ctx.createRadialGradient(
          state.x,
          state.y,
          0,
          state.x,
          state.y,
          r
        );
        g.addColorStop(0, "rgba(0,0,0,0.35)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }

      // AURORA PULSE (0 -> max -> 0)
      const speed = 0.25; // grow speed
      const maxR = 2600;

      const r = (state.auraTimer * speed * maxR) % maxR; // hard reset to 0

      if (r > 1) {
        const g = ctx.createRadialGradient(
          state.x,
          state.y,
          0,
          state.x,
          state.y,
          r
        );

        g.addColorStop(0.0, "rgba(0,0,0,0)");
        g.addColorStop(0.49, "rgba(0,0,0,0)");
        g.addColorStop(0.5, "rgba(140,255,220,0.32)");
        g.addColorStop(0.675, "rgba(90,210,255,0.22)");
        g.addColorStop(0.8, "rgba(200,150,255,0.15)");
        g.addColorStop(0.925, "rgba(120,255,190,0.07)");
        g.addColorStop(1.0, "rgba(0,0,0,0)");

        ctx.fillStyle = g;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    }

    // ENTITY
    ctx.drawImage(enemy, state.x - 100, state.y - 100, 200, 200);

    // PELLETS
    for (const p of state.pellets) {
      ctx.save();
      ctx.translate(
        p.x + (-5 + Math.random() * 10),
        p.y + (-5 + Math.random() * 10)
      );
      ctx.fillStyle = Math.random() < 0.5 ? "#111" : "#000";
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  return host.register({ update, draw });
}
