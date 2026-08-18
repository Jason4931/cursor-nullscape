import { death, mouse } from "../entityHost.js";
import { playSound, passageGoldPattern, uldm, ESP } from "../main.js";

const Guardian_Idle_Animation = [];
const GuardianSHOOT = [];
const GuardianEnragedIdle = [];
const GuardianEnragedSHOOT = [];
const GuardianEnraging = [];
async function loadAssets() {
  if (Guardian_Idle_Animation.length) return;
  const loadBatch = async (target, folder, count) => {
    const promises = [];
    for (let i = 1; i <= count; i++) {
      const img = new Image();
      target.push(img);
      promises.push(
        new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          img.src = `./ASSET/Enemies/VoidboundGuardian/${folder}/Layer ${i}.png`;
        }),
      );
    }
    await Promise.all(promises);
  };
  await loadBatch(Guardian_Idle_Animation, "VoidboundGuardian_Idle", 40);
  loadBatch(GuardianSHOOT, "VoidboundGuardian_Shoot", 30);
  loadBatch(GuardianEnragedIdle, "VoidboundGuardian_EnragedIdle", 40);
  loadBatch(GuardianEnragedSHOOT, "VoidboundGuardian_EnragedShoot", 25);
  loadBatch(GuardianEnraging, "VoidboundGuardian_Enraging", 75);
}

export let shotgunVBGuardianActive = [false];
export function setup(host, casualMode, hardMode) {
  loadAssets();
  const state = {
    x: 0,
    y: 0,
    opacity: 1,
    layers: Guardian_Idle_Animation,
    enemy: null,
    layer: 0,
    layerChange: [false, false],
    enrage: false,

    DASH_TIME: 1.5,
    IDLE_SHOOT_TIME: 0.5,
    IDLE_TIME: 0.5,

    mode: "move",
    timer: 0,

    dashStartX: 0,
    dashStartY: 0,
    dashTargetX: 0,
    dashTargetY: 0,

    shootCirc: 60,
    pellets: [],
    shotsFired: 0,
    shootDuration: 0,

    trails: [],
    blackAsh: [],
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
      "./ASSET/Sound/Enemies/VoidboundGuardian/Patch5_VoidboundGuardianMove1.ogg",
      "./ASSET/Sound/Enemies/VoidboundGuardian/Patch5_VoidboundGuardianMove2.ogg",
      "./ASSET/Sound/Enemies/VoidboundGuardian/Patch5_VoidboundGuardianMove3.ogg",
    ];
    playSound(moveSound[Math.floor(Math.random() * 3)]);
    if (Math.random() < 0.1) {
      playSound(
        `./ASSET/Sound/Enemies/VoidboundGuardian/VoidboundGuardian_ShoopDaWhoop.ogg`,
      );
    }
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
      ? 0.25 + Math.random()
      : 0.5 + Math.random();
  }

  function startIdle() {
    state.mode = "idle";
    state.timer = 0;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function firePellet(rand = false, offsetAngle = null) {
    const dx = mouse.x - state.x;
    const dy = mouse.y - state.y - 40;
    const angle =
      Math.atan2(dy, dx) +
      (rand ? (Math.random() < 0.5 ? 30 : -30) * (Math.PI / 180) : 0);

    const speed = hardMode ? 1120 : casualMode ? 630 : 840;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;

    if (offsetAngle !== null) {
      vx += Math.cos(offsetAngle) * 300;
      vy += Math.sin(offsetAngle) * 300;
    }

    state.pellets.push({
      x: state.x,
      y: state.y + 40,
      vx,
      vy,
      born: performance.now(),
      trail: [],

      phase: "fly",
      phaseTimer: 0,
      beamAngle: Math.random() * Math.PI * 2,
      beamScale: 0,
      bulletScale: 1,
    });
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.timer += dt;
    state.layer++;
    if (state.layer > state.layers.length) state.layer = 1;
    state.enemy = state.layers[state.layer - 1];
    if (state.shootCirc < 60) state.shootCirc += 8;

    if (state.enrage) {
      for (let i = 0; i < 10; i++) {
        state.blackAsh.push({
          x: state.x + Math.random() * 100 - 50,
          y: state.y + Math.random() * 150 - 75,
          age: 0,
        });
      }
    }
    if (state.mode === "move") {
      state.trails.push({
        x: state.x + Math.random() * 50 - 25,
        y: state.y + Math.random() * 50 - 25,
        age: 0,
        image: state.enemy,
      });
    }
    for (const trail of state.trails) {
      trail.age += dt;
    }
    for (const trail of state.blackAsh) {
      trail.age += dt;
    }
    state.trails = state.trails.filter((t) => t.age < 0.5);
    state.blackAsh = state.blackAsh.filter((t) => t.age < 0.5);

    if (passageGoldPattern > 0 && !state.enrage) {
      state.enrage = true;
      state.DASH_TIME = 1.5;
      state.IDLE_SHOOT_TIME = 0.5;
      state.IDLE_TIME = 0.5;
      state.layers = GuardianEnraging;
      state.layer = state.layers.length;
      playSound(
        `./ASSET/Sound/Enemies/VoidboundGuardian/VBG_Enrage_Cry_${Math.floor(1 + Math.random() * 2)}.ogg`,
      );
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
        playSound(
          "./ASSET/Sound/Enemies/VoidboundGuardian/Patch5_VoidboundGuardian_Warning.ogg",
        );
      }
    } else if (state.mode === "idleShoot") {
      /* ===== IDLE SHOOT (SPARK) ===== */
      if (state.timer >= state.IDLE_SHOOT_TIME) {
        startShoot();
      }
    } else if (state.mode === "shoot") {
      /* ===== SHOOT ===== */
      const interval =
        state.shootDuration / (shotgunVBGuardianActive[0] ? 1 : 2);

      if (
        state.shotsFired < (shotgunVBGuardianActive[0] ? 1 : 2) &&
        state.timer >= interval * state.shotsFired
      ) {
        state.opacity = 1;
        if (shotgunVBGuardianActive[0]) {
          const randRot = Math.random() * Math.PI * 2;
          for (let i = 0; i < 8; i++) {
            firePellet(false, (i * Math.PI * 2) / 8 + randRot);
          }
        } else {
          firePellet();
          firePellet(true);
        }
        state.shootCirc = 0;
        if (!state.layerChange[0]) {
          state.layers = state.enrage ? GuardianEnragedSHOOT : GuardianSHOOT;
          state.layer = state.layers.length;
          if (state.shotsFired == 2) state.layerChange[0] = true;
        }
        if (shotgunVBGuardianActive[0]) {
          playSound(
            `./ASSET/Sound/Enemies/VoidboundGuardian/VoidboundGuardianShotgun.ogg`,
          );
        } else {
          playSound(
            `./ASSET/Sound/Enemies/VoidboundGuardian/Patch5_VoidboundGuardian_Firing${state.shotsFired + (shotgunVBGuardianActive[0] ? 2 : 1)}.ogg`,
          );
        }
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

      for (let i = p.trail.length - 1; i >= 0; i--) {
        const t = p.trail[i];
        t.life -= dt * 2;

        if (t.life <= 0) {
          p.trail.splice(i, 1);
        }
      }

      p.phaseTimer += dt;
      if (p.phase === "fly") {
        p.trail.push({
          x: p.x,
          y: p.y,
          life: 1,
        });

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        if (dx * dx + dy * dy < 40 * 40) {
          death("VoidboundGuardian");
        }

        if (p.phaseTimer >= 1) {
          p.phase = "charge";
          p.phaseTimer = 0;
          playSound(
            `./ASSET/Sound/Enemies/VoidboundGuardian/Patch5_VoidboundGuardian_Projectile_Impact.ogg`,
          );

          p.vx = 0;
          p.vy = 0;
        }
      } else if (p.phase === "charge") {
        const t = Math.min(p.phaseTimer / 0.5, 1);

        p.bulletScale = 1 - t * t;
        p.beamScale = 1 - Math.pow(1 - t, 3);

        if (p.phaseTimer >= 1) {
          p.phase = "disappear";
          p.phaseTimer = 0;
          playSound(
            `./ASSET/Sound/Enemies/VoidboundGuardian/VoidboundGuardian_Beam${Math.floor(
              1 + Math.random() * 3,
            )}.ogg`,
          );

          const beamCount = hardMode ? 3 : casualMode ? 1 : 2;
          const beamHalfWidth = 45;

          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;

          for (let b = 0; b < beamCount; b++) {
            const angle = p.beamAngle + (Math.PI * b) / beamCount;

            const c = Math.cos(-angle);
            const s = Math.sin(-angle);

            const rx = dx * c - dy * s;
            const ry = dx * s + dy * c;

            if (Math.abs(ry) <= beamHalfWidth) {
              death("VoidboundGuardian");
              break;
            }
          }
        }
      } else if (p.phase === "disappear") {
        const t = Math.min(p.phaseTimer / 0.5, 1);

        p.beamScale = 1 - t;

        if (t >= 1) {
          state.pellets.splice(i, 1);
          continue;
        }
      }
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (!uldm) {
      for (const trail of state.blackAsh) {
        ctx.save();
        ctx.globalAlpha = 0.5 * (1 - trail.age / 0.5);
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(
          Math.round(trail.x),
          Math.round(trail.y),
          Math.round(50 * (0.5 * (1 - trail.age / 0.5))),
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.restore();
      }
    }

    if (state.mode === "idleShoot") {
      ctx.save();
      const t = Math.min(state.timer / state.IDLE_SHOOT_TIME, 1);
      const alpha = Math.max(0, Math.min(1, 4 - t * 4));

      const rOuter = 200 * (1 - state.timer * 2);
      const rInner = 20;

      ctx.translate(Math.round(state.x), Math.round(state.y));
      ctx.scale(1 - state.timer, 1 - state.timer);
      ctx.rotate(Math.PI / 2);

      if (!uldm) {
        const glow = 25;
        const grad = ctx.createRadialGradient(0, 0, 100, 0, 0, 100 + glow);
        grad.addColorStop(0, `rgba(255,0,192,${alpha})`);
        grad.addColorStop(1, "rgba(255,0,192,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 100 + glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -rOuter * 2);
        ctx.lineTo(rInner, 0);
        ctx.lineTo(0, rOuter * 2);
        ctx.lineTo(-rInner, 0);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,128,240,${alpha})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(0, 0, 100, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,128,240,${alpha})`;
      ctx.lineWidth = 8;
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    if (!uldm) {
      for (const trail of state.trails) {
        ctx.save();
        ctx.globalAlpha = 0.5 * (1 - trail.age / 0.5);
        ctx.translate(Math.round(trail.x), Math.round(trail.y));
        if (trail.image) {
          ctx.drawImage(
            trail.image,
            Math.round(-100 * 0.9),
            Math.round(-100 * 0.9),
            Math.round(200 * 0.9),
            Math.round(200 * 0.9),
          );
        }
        ctx.restore();
      }
    }
    ESP(state.x, state.y, 200, "voidboundguardian");
    if (state.enemy) {
      ctx.drawImage(
        state.enemy,
        Math.round(state.x - 100),
        Math.round(state.y - 100),
        200,
        200,
      );
    }

    if (state.shootCirc < 60 && !uldm) {
      ctx.beginPath();
      ctx.arc(
        Math.round(state.x - 5),
        Math.round(state.y + 40),
        state.shootCirc,
        0,
        Math.PI * 2,
      );
      ctx.strokeStyle = `rgba(255,255,255,${(60 - state.shootCirc) / 60})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    ctx.fillStyle = `#000`;
    if (!uldm) {
      for (const p of state.pellets) {
        ctx.globalAlpha = 1;
        if (p.phase !== "fly" && p.phase != "charge") {
          const beamLength = 20000;
          const beamWidth = 90 * p.beamScale;

          ctx.save();
          ctx.translate(p.x, p.y);

          if (!p.beamAngle) p.beamAngle = Math.random() * Math.PI * 2;

          ctx.rotate(p.beamAngle);

          const glow = 25;
          const beamCount = hardMode ? 3 : casualMode ? 1 : 2;
          for (let b = 0; b < beamCount; b++) {
            ctx.save();
            ctx.rotate((Math.PI * b) / beamCount);

            ctx.fillRect(
              -beamLength / 2,
              -beamWidth / 2,
              beamLength,
              beamWidth,
            );
            let grad = ctx.createLinearGradient(
              0,
              -beamWidth / 2 - glow,
              0,
              -beamWidth / 2,
            );
            grad.addColorStop(0, "rgba(255,0,192,0)");
            grad.addColorStop(1, "rgba(255,0,192,1)");
            ctx.fillStyle = grad;
            ctx.fillRect(
              -beamLength / 2,
              -beamWidth / 2 - glow,
              beamLength,
              glow,
            );
            grad = ctx.createLinearGradient(
              0,
              beamWidth / 2,
              0,
              beamWidth / 2 + glow,
            );
            grad.addColorStop(0, "rgba(255,0,192,1)");
            grad.addColorStop(1, "rgba(255,0,192,0)");
            ctx.fillStyle = grad;
            ctx.fillRect(-beamLength / 2, beamWidth / 2, beamLength, glow);

            ctx.restore();
          }

          ctx.restore();
        }
      }
    }
    for (const p of state.pellets) {
      ctx.globalAlpha = 1;
      if (p.phase !== "fly" && p.phase != "charge") {
        const beamLength = 20000;
        const beamWidth = 90 * p.beamScale;

        ctx.save();
        ctx.translate(p.x, p.y);

        if (!p.beamAngle) p.beamAngle = Math.random() * Math.PI * 2;

        ctx.rotate(p.beamAngle);

        const beamCount = hardMode ? 3 : casualMode ? 1 : 2;
        for (let b = 0; b < beamCount; b++) {
          ctx.save();
          ctx.rotate((Math.PI * b) / beamCount);
          ctx.beginPath();
          ctx.rect(-beamLength / 2, -beamWidth / 2, beamLength, beamWidth);
          ctx.strokeStyle = `#f8e`;
          ctx.lineWidth = 12;
          ctx.stroke();

          ctx.restore();
        }

        ctx.restore();
      }
    }
    for (const p of state.pellets) {
      ctx.globalAlpha = 1;
      if (!uldm) {
        for (const t of p.trail) {
          ctx.beginPath();
          ctx.arc(
            Math.round(t.x),
            Math.round(t.y),
            (1.25 - t.life / 2) * 40,
            0,
            Math.PI * 2,
          );
          ctx.strokeStyle = `rgba(255,255,255,${t.life / 2})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      if (p.phase !== "disappear") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.bulletScale, p.bulletScale);

        if (!uldm) {
          const glow = 25;
          const grad = ctx.createRadialGradient(0, 0, 40, 0, 0, 40 + glow);
          grad.addColorStop(0, "rgba(255,0,192,1)");
          grad.addColorStop(1, "rgba(255,0,192,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, 40 + glow, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = "#000";
        ctx.strokeStyle = "#f8e";
        ctx.lineWidth = 6;

        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
      if (p.phase !== "fly") {
        const beamLength = 20000;
        const beamWidth = 90 * p.beamScale;

        ctx.save();

        if (p.phase === "charge") {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = "#f0c";
        } else {
          ctx.globalAlpha = 1;
          ctx.fillStyle = "black";
        }

        ctx.save();
        ctx.translate(p.x, p.y);

        if (!p.beamAngle) p.beamAngle = Math.random() * Math.PI * 2;

        ctx.rotate(p.beamAngle);

        const beamCount = hardMode ? 3 : casualMode ? 1 : 2;
        for (let b = 0; b < beamCount; b++) {
          ctx.save();
          ctx.rotate((Math.PI * b) / beamCount);
          ctx.fillRect(-beamLength / 2, -beamWidth / 2, beamLength, beamWidth);
          ctx.restore();
        }

        ctx.restore();
      }
    }

    ctx.restore();
  }

  startMove();

  const unregister = host.register({ update, draw });
  return unregister;
}
