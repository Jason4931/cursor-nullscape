import { death, mouse } from "../entityHost.js";
import { getCameraPos, setPillarGazeScale } from "../main.js";

let terminusGazeActive = false;
let terminusGazeCount = 0;
export function setup(host) {
  terminusGazeCount++;
  if (terminusGazeActive) {
    const unregister = host.register({
      update: () => {},
      draw: () => {},
      name: "TerminusGaze",
    });
    return unregister;
  } else {
    terminusGazeActive = true;
  }

  const state = {
    opacity: 1,

    starDistance: 600,
    starSize: 150,
    starGrowDuration: 0.5,

    pillarSize: 100,
    pillarMinDistance: 600,
    pillarMaxDistance: 1200,
    pillarMinSeparation: 400,
    pillarFadeInDuration: 0.5,
    pillarFadeOutDuration: 0.5,

    lightningStartAlpha: 0.125,
    lightningEndAlpha: 0.25,
    lightningFadeInDuration: 1,
    lightningChargeDuration: 3,
    lightningIncreaseDuration: 1,

    flashStartAlpha: 1,
    flashDuration: 0.5,
    idleDuration: 10,

    timer: 0,
    phase: "idle",
    attackCount: 0,

    star: null,
    pillars: [],

    lightningAlpha: 0,
    lightningPath: null,

    lightningCameraX: null,
    lightningCameraY: null,

    flashAlpha: 0,
  };

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeIn(t) {
    return t * t * t;
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomAngle() {
    return Math.random() * Math.PI * 2;
  }

  function getRayDistanceToRect(
    originX,
    originY,
    dx,
    dy,
    left,
    top,
    right,
    bottom,
  ) {
    let tMin = -Infinity;
    let tMax = Infinity;

    if (Math.abs(dx) < 0.000001) {
      if (originX < left || originX > right) {
        return Infinity;
      }
    } else {
      const tx1 = (left - originX) / dx;
      const tx2 = (right - originX) / dx;

      tMin = Math.max(tMin, Math.min(tx1, tx2));

      tMax = Math.min(tMax, Math.max(tx1, tx2));
    }

    if (Math.abs(dy) < 0.000001) {
      if (originY < top || originY > bottom) {
        return Infinity;
      }
    } else {
      const ty1 = (top - originY) / dy;
      const ty2 = (bottom - originY) / dy;

      tMin = Math.max(tMin, Math.min(ty1, ty2));

      tMax = Math.min(tMax, Math.max(ty1, ty2));
    }

    if (tMax < 0 || tMin > tMax) {
      return Infinity;
    }

    if (tMin >= 0) {
      return tMin;
    }

    if (tMax >= 0) {
      return tMax;
    }

    return Infinity;
  }

  function getRayDistanceToViewport(
    originX,
    originY,
    dx,
    dy,
    left,
    top,
    right,
    bottom,
  ) {
    let distance = Infinity;

    if (dx > 0) {
      distance = Math.min(distance, (right - originX) / dx);
    } else if (dx < 0) {
      distance = Math.min(distance, (left - originX) / dx);
    }

    if (dy > 0) {
      distance = Math.min(distance, (bottom - originY) / dy);
    } else if (dy < 0) {
      distance = Math.min(distance, (top - originY) / dy);
    }

    return distance;
  }

  function buildLightningPath() {
    if (!state.star) {
      state.lightningPath = null;
      return;
    }

    const camera = getCameraPos();

    const left = camera.x;
    const top = camera.y;
    const right = camera.x + window.innerWidth;
    const bottom = camera.y + window.innerHeight;

    const starX = state.star.x;
    const starY = state.star.y;

    const path = new Path2D();

    const rayCount = 360;

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;

      const nextAngle = ((i + 1) / rayCount) * Math.PI * 2;

      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      const nextDx = Math.cos(nextAngle);
      const nextDy = Math.sin(nextAngle);

      let distance = getRayDistanceToViewport(
        starX,
        starY,
        dx,
        dy,
        left,
        top,
        right,
        bottom,
      );

      let nextDistance = getRayDistanceToViewport(
        starX,
        starY,
        nextDx,
        nextDy,
        left,
        top,
        right,
        bottom,
      );

      for (const pillar of state.pillars) {
        const half = state.pillarSize / 2;

        const pillarLeft = pillar.x - half;

        const pillarTop = pillar.y - half;

        const pillarRight = pillar.x + half;

        const pillarBottom = pillar.y + half;

        const pillarDistance = getRayDistanceToRect(
          starX,
          starY,
          dx,
          dy,
          pillarLeft,
          pillarTop,
          pillarRight,
          pillarBottom,
        );

        if (pillarDistance < distance) {
          distance = pillarDistance;
        }

        const nextPillarDistance = getRayDistanceToRect(
          starX,
          starY,
          nextDx,
          nextDy,
          pillarLeft,
          pillarTop,
          pillarRight,
          pillarBottom,
        );

        if (nextPillarDistance < nextDistance) {
          nextDistance = nextPillarDistance;
        }
      }

      const x1 = starX + dx * distance;

      const y1 = starY + dy * distance;

      const x2 = starX + nextDx * nextDistance;

      const y2 = starY + nextDy * nextDistance;

      path.moveTo(starX, starY);
      path.lineTo(x1, y1);
      path.lineTo(x2, y2);
      path.closePath();
    }

    state.lightningPath = path;

    state.lightningCameraX = camera.x;
    state.lightningCameraY = camera.y;
  }

  function updateLightningCamera() {
    if (!state.star) return;

    const camera = getCameraPos();

    if (
      state.lightningCameraX !== camera.x ||
      state.lightningCameraY !== camera.y
    ) {
      buildLightningPath();
    }
  }

  function isPlayerInLightning() {
    if (!state.lightningPath) {
      return false;
    }

    return state.lightningContext.isPointInPath(
      state.lightningPath,
      mouse.x,
      mouse.y,
    );
  }

  function spawnAttack() {
    if (state.attackCount <= 0) {
      state.attackCount = terminusGazeCount;
    }

    const angle = randomAngle();

    state.star = {
      x: mouse.x + Math.cos(angle) * state.starDistance,

      y: mouse.y + Math.sin(angle) * state.starDistance,

      scale: 0,
    };

    state.pillars = [];

    while (true) {
      let x;
      let y;
      let tryCount = 0;
      let valid = false;

      while (!valid && tryCount < 100) {
        const pillarAngle = randomAngle();

        const distance = random(
          state.pillarMinDistance,
          state.pillarMaxDistance,
        );

        x = state.star.x + Math.cos(pillarAngle) * distance;
        y = state.star.y + Math.sin(pillarAngle) * distance;

        valid = true;
        tryCount++;

        for (const pillar of state.pillars) {
          const dx = x - pillar.x;
          const dy = y - pillar.y;

          if (Math.sqrt(dx * dx + dy * dy) < state.pillarMinSeparation) {
            valid = false;
            break;
          }
        }
      }

      if (!valid) {
        break;
      }

      state.pillars.push({
        x,
        y,
        alpha: 0,
      });
    }

    state.lightningCameraX = null;
    state.lightningCameraY = null;

    buildLightningPath();

    state.timer = 0;
    state.lightningAlpha = 0;
    state.flashAlpha = 0;
    state.phase = "spawn";
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) {
      return;
    }

    state.timer += dt;

    if (state.phase !== "idle" && state.star) {
      updateLightningCamera();
    }

    const touchingPillar = state.pillars.some((pillar) => {
      const half = state.pillarSize / 2;
      return (
        mouse.x >= pillar.x - half &&
        mouse.x <= pillar.x + half &&
        mouse.y >= pillar.y - half &&
        mouse.y <= pillar.y + half
      );
    });
    if (touchingPillar) setPillarGazeScale(0.5);

    if (state.phase === "idle") {
      if (state.timer >= state.idleDuration) {
        spawnAttack();
      }

      return;
    }

    if (state.phase === "spawn") {
      const starProgress = Math.min(state.timer / state.starGrowDuration, 1);

      state.star.scale = easeOut(starProgress);

      const pillarProgress = Math.min(
        state.timer / state.pillarFadeInDuration,
        1,
      );

      for (const pillar of state.pillars) {
        pillar.alpha = pillarProgress;
      }

      const lightningProgress = Math.min(
        state.timer /
          (state.lightningFadeInDuration + state.lightningChargeDuration),
        1,
      );
      state.lightningAlpha = state.lightningStartAlpha * lightningProgress;

      if (state.timer >= state.lightningFadeInDuration) {
        state.phase = "charge";
        state.timer = 0;
      }

      return;
    }

    if (state.phase === "charge") {
      const lightningProgress = Math.min(
        (state.timer + state.lightningFadeInDuration) /
          (state.lightningFadeInDuration + state.lightningChargeDuration),
        1,
      );
      state.lightningAlpha = state.lightningStartAlpha * lightningProgress;

      if (state.timer >= state.lightningChargeDuration) {
        state.phase = "strike";
        state.timer = 0;
      }

      return;
    }

    if (state.phase === "strike") {
      const progress = Math.min(
        state.timer / state.lightningIncreaseDuration,
        1,
      );

      state.lightningAlpha =
        state.lightningStartAlpha +
        (state.lightningEndAlpha - state.lightningStartAlpha) * progress;

      if (state.timer >= state.lightningIncreaseDuration) {
        if (isPlayerInLightning()) {
          death("TerminusGaze");
        }

        state.phase = "impact";
        state.timer = 0;
      }

      return;
    }

    if (state.phase === "impact") {
      const duration = 0.1;
      if (state.timer <= duration) {
        document.body.classList.add("full-bnr");
      } else if (state.timer <= duration * 2) {
        document.body.classList.remove("full-bnr");
        document.body.classList.add("full-bnw");
      } else if (state.timer <= duration * 3) {
        document.body.classList.remove("full-bnr");
        document.body.classList.remove("full-bnw");
        document.body.classList.add("full-invert");
      } else {
        document.body.classList.remove("full-bnr");
        document.body.classList.remove("full-bnw");
        document.body.classList.remove("full-invert");
        state.phase = "flash";
        state.timer = 0;

        state.flashAlpha = state.flashStartAlpha;
        state.star = null;

        for (const pillar of state.pillars) {
          pillar.fadeTimer = 0;
        }
      }
    }

    if (state.phase === "flash") {
      const progress = Math.min(state.timer / state.flashDuration, 1);

      state.flashAlpha = state.flashStartAlpha * (1 - progress);

      for (const pillar of state.pillars) {
        const pillarProgress = Math.min(
          state.timer / state.pillarFadeOutDuration,
          1,
        );

        pillar.alpha = 1 - easeIn(pillarProgress);
      }

      if (state.timer >= state.flashDuration) {
        state.attackCount--;

        state.pillars = [];
        state.lightningPath = null;

        state.lightningCameraX = null;
        state.lightningCameraY = null;

        state.lightningAlpha = 0;
        state.flashAlpha = 0;

        if (state.attackCount > 0) {
          spawnAttack();
        } else {
          state.phase = "idle";
          state.timer = 0;
        }
      }
    }
  }

  function drawLightning(ctx) {
    if (
      !state.lightningPath ||
      state.lightningAlpha <= 0 ||
      state.phase === "flash"
    ) {
      return;
    }

    const camera = getCameraPos();

    ctx.save();

    ctx.beginPath();

    ctx.rect(camera.x, camera.y, window.innerWidth, window.innerHeight);

    ctx.clip();

    const shadowPath = new Path2D();
    shadowPath.rect(camera.x, camera.y, window.innerWidth, window.innerHeight);
    shadowPath.addPath(state.lightningPath);
    ctx.fillStyle = `rgba(0, 0, 0, ${state.lightningAlpha * 2})`;
    ctx.fill(shadowPath, "evenodd");

    ctx.fillStyle = `rgba(255, 0, 0, ${state.lightningAlpha})`;
    ctx.fill(state.lightningPath);

    ctx.restore();
  }

  function drawPillars(ctx) {
    for (const pillar of state.pillars) {
      if (pillar.alpha <= 0) {
        continue;
      }

      ctx.save();

      ctx.globalAlpha = pillar.alpha;

      ctx.fillStyle = "#888";
      ctx.fillRect(
        pillar.x - state.pillarSize / 2,
        pillar.y - state.pillarSize / 2,
        state.pillarSize,
        state.pillarSize,
      );

      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 8;
      ctx.strokeRect(
        pillar.x - state.pillarSize / 3,
        pillar.y - state.pillarSize / 3,
        (state.pillarSize * 2) / 3,
        (state.pillarSize * 2) / 3,
      );

      ctx.restore();
    }
  }

  function drawStar(ctx) {
    if (!state.star || state.star.scale <= 0) {
      return;
    }

    const size = state.starSize * state.star.scale;

    ctx.save();

    ctx.translate(state.star.x, state.star.y);

    ctx.globalAlpha = state.star.scale;

    const time = performance.now() / 1000;

    for (let i = 0; i < 3; i++) {
      ctx.save();

      ctx.rotate(
        time * (1.5 - i * 0.4) +
          Math.sin(time * (0.73 + i * 0.19)) * 2.7 +
          Math.sin(time * (1.37 + i * 0.31)) * 1.4 +
          Math.sin(time * (2.11 + i * 0.47)) * 0.8,
      );

      ctx.scale(1, 0.35 + Math.sin(time * (1.5 + i * 0.3) + i) * 0.25);

      ctx.strokeStyle = `rgba(255, ${255 * (0.5 - i * 0.25)}, ${255 * (0.5 - i * 0.25)}, 1)`;
      ctx.lineWidth = 5 + i * 7.5;

      ctx.beginPath();
      ctx.arc(0, 0, size * (0.5 + i * 0.2), 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    const lSize = size * 0.2;
    const lDistance = size * 0.5;

    const drawL = (x, y, rotation) => {
      ctx.save();

      ctx.translate(x, y);
      ctx.rotate(rotation);

      ctx.fillStyle = "#ff0000";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;

      ctx.beginPath();

      ctx.moveTo(-lSize, -lSize);
      ctx.lineTo(-lSize * 0.45, -lSize);
      ctx.lineTo(-lSize * 0.45, lSize * 0.45);
      ctx.lineTo(lSize, lSize * 0.45);
      ctx.lineTo(lSize, lSize);
      ctx.lineTo(-lSize, lSize);
      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    drawL(-lDistance, -lDistance, Math.PI / 2);
    drawL(lDistance, -lDistance, Math.PI);
    drawL(-lDistance, lDistance, 0);
    drawL(lDistance, lDistance, -Math.PI / 2);

    ctx.fillStyle = "#ff0000";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;

    ctx.beginPath();

    for (let i = 0; i < 5; i++) {
      const outerAngle = -Math.PI / 2 + i * ((Math.PI * 2) / 5);
      const innerAngle = outerAngle + Math.PI / 5;

      const outerRadius = size * 0.5;
      const innerRadius = size * 0.2;

      const outerX = Math.cos(outerAngle) * outerRadius;
      const outerY = Math.sin(outerAngle) * outerRadius;

      const innerX = Math.cos(innerAngle) * innerRadius;
      const innerY = Math.sin(innerAngle) * innerRadius;

      if (i === 0) {
        ctx.moveTo(outerX, outerY);
      } else {
        ctx.lineTo(outerX, outerY);
      }

      ctx.lineTo(innerX, innerY);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function drawFlash(ctx) {
    if (state.flashAlpha <= 0) {
      return;
    }

    ctx.save();

    ctx.fillStyle = `rgba(255, 255, 255, ${state.flashAlpha})`;

    const camera = getCameraPos();
    ctx.fillRect(camera.x, camera.y, window.innerWidth, window.innerHeight);

    ctx.restore();
  }

  function drawEnemyIndicator(ctx) {
    if (!state.star || state.phase === "flash") {
      return;
    }

    const camera = getCameraPos();

    const left = camera.x;
    const top = camera.y;
    const right = camera.x + window.innerWidth;
    const bottom = camera.y + window.innerHeight;

    const starX = state.star.x;
    const starY = state.star.y;

    const offset = 100;
    if (
      starX >= left - offset &&
      starX <= right + offset &&
      starY >= top - offset &&
      starY <= bottom + offset
    ) {
      return;
    }

    const cx = left + window.innerWidth / 2;
    const cy = top + window.innerHeight / 2;

    const dx = starX - cx;
    const dy = starY - cy;

    const ang = Math.atan2(dy, dx);

    const halfW = window.innerWidth / 2 - 60;
    const halfH = window.innerHeight / 2 - 60;

    const scale =
      Math.min(
        halfW / (Math.abs(Math.cos(ang)) || 0.0001),
        halfH / (Math.abs(Math.sin(ang)) || 0.0001),
      ) * 0.7;

    const ex = cx + Math.cos(ang) * scale;
    const ey = cy + Math.sin(ang) * scale;

    ctx.save();

    ctx.translate(ex, ey);
    ctx.rotate(ang);

    const size = 100 * state.star.scale;

    const time = performance.now() / 1000;

    for (let i = 0; i < 3; i++) {
      ctx.save();

      ctx.rotate(
        time * (1.5 - i * 0.4) +
          Math.sin(time * (0.73 + i * 0.19)) * 2.7 +
          Math.sin(time * (1.37 + i * 0.31)) * 1.4 +
          Math.sin(time * (2.11 + i * 0.47)) * 0.8,
      );

      ctx.scale(1, 0.35 + Math.sin(time * (1.5 + i * 0.3) + i) * 0.25);

      ctx.strokeStyle = `rgba(255, ${255 * (0.5 - i * 0.25)}, ${255 * (0.5 - i * 0.25)}, 1)`;
      ctx.lineWidth = 5 + i * 7.5;

      ctx.beginPath();
      ctx.arc(0, 0, size * (0.5 + i * 0.2), 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    ctx.save();
    ctx.rotate(-ang);
    const lSize = size * 0.2;
    const lDistance = size * 0.5;

    const drawL = (x, y, rotation) => {
      ctx.save();

      ctx.translate(x, y);
      ctx.rotate(rotation);

      ctx.fillStyle = "#ff0000";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;

      ctx.beginPath();

      ctx.moveTo(-lSize, -lSize);
      ctx.lineTo(-lSize * 0.45, -lSize);
      ctx.lineTo(-lSize * 0.45, lSize * 0.45);
      ctx.lineTo(lSize, lSize * 0.45);
      ctx.lineTo(lSize, lSize);
      ctx.lineTo(-lSize, lSize);
      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    drawL(-lDistance, -lDistance, Math.PI / 2);
    drawL(lDistance, -lDistance, Math.PI);
    drawL(-lDistance, lDistance, 0);
    drawL(lDistance, lDistance, -Math.PI / 2);
    ctx.restore();

    ctx.fillStyle = "#ff0000";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;

    ctx.beginPath();

    for (let i = 0; i < 5; i++) {
      const outerAngle = -Math.PI / 2 + i * ((Math.PI * 2) / 5);
      const innerAngle = outerAngle + Math.PI / 5;

      const outerRadius = size * 0.5;
      const innerRadius = size * 0.2;

      const outerX = Math.cos(outerAngle) * outerRadius;
      const outerY = Math.sin(outerAngle) * outerRadius;

      const innerX = Math.cos(innerAngle) * innerRadius;
      const innerY = Math.sin(innerAngle) * innerRadius;

      if (i === 0) {
        ctx.moveTo(outerX, outerY);
      } else {
        ctx.lineTo(outerX, outerY);
      }

      ctx.lineTo(innerX, innerY);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ff0000";
    ctx.font = `${size / 2}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    ctx.fillText("➤", size, 0);

    ctx.restore();
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) {
      return;
    }

    state.lightningContext = ctx;

    ctx.save();

    ctx.globalAlpha = state.opacity;

    drawLightning(ctx);
    drawPillars(ctx);
    drawStar(ctx);
    drawEnemyIndicator(ctx);
    drawFlash(ctx);

    ctx.restore();
  }

  state.timer = state.idleDuration;

  const unregister = host.register({
    update,
    draw,
    name: "TerminusGaze",
  });

  return unregister;
}
