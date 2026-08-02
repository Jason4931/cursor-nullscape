import { death, mouse } from "../entityHost.js";
import { playSound, uldm, getCameraPos } from "../main.js";

const wega = new Image();
wega.src = "./ASSET/Enemies/Wega/Wega.png";
const enragedWega = new Image();
enragedWega.src = "./ASSET/Enemies/Wega/Enragedwega.png";
const bluimWega = new Image();
bluimWega.src = "./ASSET/Enemies/Wega/Bluimwega.png";
const scaryWega = new Image();
scaryWega.src = "./ASSET/Enemies/Wega/Scary_wega.png";

const wegaPositions = [];
export function setup(host) {
  const state = {
    opacity: 1,
    enemy: wega,

    x: 0,
    y: 0,
    size: 100,
    speed: 200,

    initialized: false,

    mode: "normal",
    modeTimer: 0,
    stopTimer: 0,

    bluimTimer: 0,
    bluimPhase: "chase",
    bluimTargetX: 0,
    bluimTargetY: 0,
    bluimStartX: 0,
    bluimStartY: 0,

    scaryDeathTime: null,

    trails: [],
    ballTrails: [],
  };

  const entry = { state, unregister: null };
  wegaPositions.push(state);

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (!state.initialized) {
      playSound("./ASSET/Sound/Enemies/Wega/Weg_alert.ogg");
      const cx = host.canvas.width / 2;
      const cy = host.canvas.height / 2;

      const r = Math.random() * 400;
      const a = Math.random() * Math.PI * 2;

      state.x = cx + Math.cos(a) * r;
      state.y = cy + Math.sin(a) * r;
      state.initialized = true;
    }

    if (state.mode === "normal") {
      state.modeTimer += dt;
      if (state.modeTimer >= 60) {
        state.modeTimer = 0;
        state.stopTimer = 1;
        playSound("./ASSET/Sound/Enemies/Wega/Angry_weg.ogg");
        if (Math.random() < 0.667) {
          state.mode = "enraged";
          state.enemy = enragedWega;
          state.speed *= 2;
        } else {
          state.mode = "bluim";
          state.enemy = bluimWega;
          state.speed *= 1.5;
          state.bluimTimer = 0;
          state.bluimPhase = "chase";
        }
      }
    }

    let dx = mouse.x - state.x;
    let dy = mouse.y - state.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= state.size * 0.5) {
      playSound("./ASSET/Sound/Enemies/Wega/Wega_scream.ogg");
      state.scaryDeathTime = performance.now();
      death("Wega");
      return;
    }
    if (state.stopTimer > 0) {
      state.stopTimer -= dt;
    } else {
      if (state.mode === "bluim") {
        state.bluimTimer += dt;
        if (state.bluimPhase === "chase") {
          if (state.bluimTimer >= 10) {
            state.bluimTimer = 0;
            state.bluimPhase = "indicator";
            const targetDx = mouse.x - state.x;
            const targetDy = mouse.y - state.y;
            const targetDist = Math.hypot(targetDx, targetDy);
            if (targetDist > 0.001) {
              state.bluimTargetX =
                state.x + (targetDx / targetDist) * (targetDist + 200);
              state.bluimTargetY =
                state.y + (targetDy / targetDist) * (targetDist + 200);
            } else {
              state.bluimTargetX = state.x;
              state.bluimTargetY = state.y;
            }
          } else if (dist > 0.001) {
            dx /= dist;
            dy /= dist;
            state.x += dx * state.speed * dt;
            state.y += dy * state.speed * dt;
          }
        } else if (state.bluimPhase === "indicator") {
          if (state.bluimTimer >= 0.5) {
            state.bluimTimer = 0;
            state.bluimPhase = "dash";
            state.bluimStartX = state.x;
            state.bluimStartY = state.y;
          }
        } else if (state.bluimPhase === "dash") {
          const t = Math.min(1, state.bluimTimer / 0.5);
          const eased = 1 - (1 - t) * (1 - t);
          state.x =
            state.bluimStartX +
            (state.bluimTargetX - state.bluimStartX) * eased;
          state.y =
            state.bluimStartY +
            (state.bluimTargetY - state.bluimStartY) * eased;

          if (t >= 1) {
            state.bluimTimer = 0;
            state.bluimPhase = "chase";
          }
        }
      } else {
        if (dist > 0.001) {
          dx /= dist;
          dy /= dist;
        } else {
          dx = dy = 0;
        }
        state.x += dx * state.speed * dt;
        state.y += dy * state.speed * dt;
      }
    }

    for (const other of wegaPositions) {
      if (other === state) continue;
      const dx = state.x - other.x;
      const dy = state.y - other.y;
      const dist = Math.hypot(dx, dy);
      const minDist = state.size * 0.5 + other.size * 0.5;
      if (dist < minDist) {
        if (dist > 0.001) {
          const push = (minDist - dist) * 0.5;
          state.x += (dx / dist) * push;
          state.y += (dy / dist) * push;
        }
      }
    }

    state.trails.push({
      x: state.x,
      y: state.y,
      age: 0,
      image: state.enemy,
    });
    const angle = Math.random() * Math.PI * 2;
    state.ballTrails.push({
      x: 0,
      y: 0,
      vx: Math.cos(angle) * 100,
      vy: Math.sin(angle) * 100,
      age: 0,
    });
    for (const trail of state.trails) {
      trail.age += dt;
    }
    for (const trail of state.ballTrails) {
      trail.age += dt;
      trail.x += trail.vx * dt;
      trail.y += trail.vy * dt;
    }
    state.trails = state.trails.filter((t) => t.age < 1);
    state.ballTrails = state.ballTrails.filter((t) => t.age < 1);
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (!uldm) {
      for (const trail of state.ballTrails) {
        ctx.save();
        ctx.globalAlpha = 0.5 * (1 - trail.age);
        ctx.beginPath();
        ctx.arc(
          Math.round(state.x + trail.x),
          Math.round(state.y + trail.y),
          Math.round(state.size * 0.1),
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = state.mode == "bluim" ? "#0000ff" : "#cc00cc";
        ctx.fill();
        ctx.restore();
      }
      for (const trail of state.trails) {
        ctx.save();
        ctx.globalAlpha = 0.25 * (1 - trail.age);
        ctx.translate(Math.round(trail.x), Math.round(trail.y));
        ctx.drawImage(
          trail.image,
          Math.round(-state.size * 0.375 * (state.mode === "bluim" ? 1.25 : 1)),
          Math.round(-state.size * 0.5 * (state.mode === "bluim" ? 2 : 1)),
          Math.round(state.size * 0.75 * (state.mode === "bluim" ? 1.25 : 1)),
          Math.round(state.size * (state.mode === "bluim" ? 1.5 : 1)),
        );
        ctx.restore();
      }
    }

    if (state.mode === "bluim" && state.bluimPhase === "indicator") {
      const progress = Math.min(1, state.bluimTimer / 0.5);

      ctx.save();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#0000ff";
      ctx.lineWidth = 10 * (1 - progress);
      ctx.beginPath();
      ctx.moveTo(Math.round(state.x), Math.round(state.y));
      ctx.lineTo(
        Math.round(state.bluimTargetX),
        Math.round(state.bluimTargetY),
      );
      ctx.stroke();
      ctx.restore();
    }

    ctx.drawImage(
      state.enemy,
      Math.round(
        state.x - state.size * 0.375 * (state.mode === "bluim" ? 1.25 : 1),
      ),
      Math.round(state.y - state.size * 0.5 * (state.mode === "bluim" ? 2 : 1)),
      Math.round(state.size * 0.75 * (state.mode === "bluim" ? 1.25 : 1)),
      Math.round(state.size * (state.mode === "bluim" ? 1.5 : 1)),
    );

    if (state.scaryDeathTime !== null) {
      const elapsed = (performance.now() - state.scaryDeathTime) / 1000;

      if (elapsed < 1) {
        const cam = getCameraPos();
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        let y;

        if (elapsed < 0.75) {
          const gravity = 10000;
          const bounceVelocity = -1200;

          let t = elapsed;
          let velocity = 0;
          y = cam.y - screenH;

          while (t > 0) {
            const timeToGround =
              (Math.sqrt(velocity * velocity + 2 * gravity * (cam.y - y)) -
                velocity) /
              gravity;

            if (timeToGround >= t) {
              y += velocity * t + 0.5 * gravity * t * t;
              break;
            }

            y = cam.y;
            t -= timeToGround;
            velocity = bounceVelocity;
          }
        } else {
          y = cam.y;
        }

        ctx.drawImage(scaryWega, cam.x, Math.round(y), screenW, screenH);
      } else {
        state.scaryDeathTime = null;
      }
    }

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return () => {
    const index = wegaPositions.indexOf(state);
    if (index !== -1) wegaPositions.splice(index, 1);
    unregister();
  };
}
