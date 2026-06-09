import { death, mouse } from "../entityHost.js";
import { getCameraPos, canvas } from "../main.js";

const Celestial = [];
for (let i = 1; i <= 25; i++) {
  const img = new Image();
  img.src = `./ASSET/Enemies/Celestial/Layer ${i}.png`;
  Celestial.push(img);
}

export let phase = { phase: 1 };
export function setup(host) {
  const patternFall = [
    {
      duration: 5.5,
      update: updateFall,
      draw: drawFall,
      drawFront: drawFallFront,
      enter: enterFall,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
    {
      duration: 9,
      update: updatePizzaCutter,
      draw: drawPizzaCutter,
      drawFront: drawPizzaCutterFront,
      enter: enterPizzaCutter,
    },
  ];
  const patternFutile = [
    {
      duration: 13,
      update: updateFutile,
      draw: drawFutile,
      drawFront: drawFutileFront,
      enter: enterFutile,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
    {
      duration: 5.5,
      update: updateFall,
      draw: drawFall,
      drawFront: drawFallFront,
      enter: enterFall,
    },
  ];
  const patternCrumble = [
    {
      duration: 3,
      update: updateCrumble,
      draw: drawCrumble,
      drawFront: drawCrumbleFront,
      enter: enterCrumble,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
    {
      duration: 9,
      update: updatePizzaCutter,
      draw: drawPizzaCutter,
      drawFront: drawPizzaCutterFront,
      enter: enterPizzaCutter,
    },
  ];
  const patternBitter = [
    {
      duration: 9,
      update: updateBitter,
      draw: drawBitter,
      drawFront: drawBitterFront,
      enter: enterBitter,
    },
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
  ];
  const patternCease = [
    {
      duration: 3,
      update: updateCease,
      draw: drawCease,
      drawFront: drawCeaseFront,
      enter: enterCease,
    },
    {
      duration: 9,
      update: updatePizzaCutterCrumble,
      draw: drawPizzaCutterCrumble,
      drawFront: drawPizzaCutterCrumbleFront,
      enter: enterPizzaCutterCrumble,
    },
  ];
  const patternBoom = [
    {
      duration: 3,
      update: updateImplosion,
      draw: drawImplosion,
      drawFront: drawImplosionFront,
      enter: enterImplosion,
    },
  ];
  const patternDeathInBloom = [
    {
      duration: 22,
      update: updateDeathInBloom,
      draw: drawDeathInBloom,
      drawFront: drawDeathInBloomFront,
      enter: enterDeathInBloom,
    },
  ];
  const loopPatternPhase1 = [...patternFall, ...patternCrumble];
  const loopPatternPhase2 = [
    ...patternFutile,
    ...patternCrumble,
    ...patternBitter,
    ...patternCease,
  ];
  const loopPatternPhase3 = [
    ...patternDeathInBloom,
    ...patternFutile,
    ...patternCease,
    ...patternBitter,
    ...patternFutile,
    ...patternCease,
    ...patternBoom,
  ];
  const state = {
    opacity: 1,

    currentPattern: {
      duration: 0,
      update: () => {},
      draw: () => {},
      enter: () => {},
    },
    patternTime: 0,
    patternIndex: -1,
    loopPattern: loopPatternPhase1,

    layers: Celestial,
    enemy: null,
    layer: 0,

    enemyX: mouse.x + 600,
    enemyY: mouse.y,
    lastAng: 0,
    ang: 0,
    enemyMode: "orbit",
    enemyT: 0,
    enemyOrbitTarget: { x: 0, y: 0 },
    enemyFixed: { x: 0, y: 0 },
    enemyScale: 1,
    enemyTransition: "none",
    enemyTransitionT: 0,
    enemyTrail: [],
  };

  function enterFixed(x, y, transition = true) {
    state.enemyMode = "fixed";
    state.enemyFixed.x = x;
    state.enemyFixed.y = y;

    if (transition == true) {
      state.enemyTransition = "shrink";
      state.enemyTransitionT = 0;
    } else {
      state.enemyX = state.enemyFixed.x;
      state.enemyY = state.enemyFixed.y;
    }
  }
  function enterOrbit() {
    if (state.enemyMode == "fixed") {
      state.enemyMode = "orbit";
      state.enemyTransition = "shrink";
      state.enemyTransitionT = 0;
    }
  }

  function compact(arr) {
    let j = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].active) arr[j++] = arr[i];
    }
    arr.length = j;
  }
  const BEAM_RADIUS = 7000;
  function spawnBeam(x, y, baseAngle, armTime = 1) {
    const base = baseAngle ?? Math.random() * Math.PI * 2;
    return {
      x,
      y,
      angle: base,
      startAngle: base + ((Math.random() < 0.5 ? 1 : -1) * Math.PI) / 8,
      t: 0,
      width: 0,
      targetWidth: 150,
      active: true,
      armTime,
    };
  }
  function spawnImplosionCircle() {
    const angle = Math.random() * Math.PI * 2;

    const x = mouse.x + Math.cos(angle) * 800;
    const y = mouse.y + Math.sin(angle) * 800;

    return {
      x,
      y,
      t: 0,
      r: 0,
      targetR: 300,
      active: true,
      phase: 0,
      opacity: 0,
    };
  }
  function spawnCircle(targetR = 150) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 1000;

    const sx = mouse.x + (Math.random() - 0.5) * 5000;
    const sy = mouse.y + (Math.random() - 0.5) * 5000;

    return {
      x: sx,
      y: sy,

      sx,
      sy,
      tx: sx + Math.cos(angle) * dist,
      ty: sy + Math.sin(angle) * dist,

      t: 0,
      r: 0,
      targetR: targetR,
      active: true,
    };
  }
  let lastPizzaAngle = Math.random() * Math.PI * 2;
  let lastPizzaDir = Math.random() < 0.5 ? 1 : -1;
  function spawnPizza() {
    const dir =
      lastPizzaDir >= 0
        ? Math.random() < 0.333
          ? 1
          : -1
        : Math.random() < 0.333
          ? -1
          : 1;
    lastPizzaDir = dir;
    const rand = Math.random() * 0.7 + 0.3;
    const jitter = ((Math.random() < 0.5 ? rand : -rand) * Math.PI) / 6;
    const base = lastPizzaAngle + jitter;
    lastPizzaAngle = base;

    return {
      x: statePizzaCutter.cx,
      y: statePizzaCutter.cy,
      t: 0,
      dir,
      startAngle: base + (Math.random() < 0.5 ? Math.PI : -Math.PI) * 2,
      targetAngle: base,
      active: true,
      offset: 0,
    };
  }
  let lastBitterDir = Math.random() < 0.5 ? 1 : -1;
  function spawnBitter(count) {
    const base = Math.random() * Math.PI * 2;
    const dir =
      lastBitterDir >= 0
        ? Math.random() < 0.333
          ? 1
          : -1
        : Math.random() < 0.333
          ? -1
          : 1;
    lastBitterDir = dir;

    return {
      x: stateBitter.cx,
      y: stateBitter.cy,
      t: 0,
      baseAngle: base,
      angle: base,
      count,
      active: true,
      dirAngle: lastBitterDir,
      dirX: 0,
      dirY: 0,
      shot: false,
    };
  }
  function spawnFutileRift() {
    const dist = 2000;
    const ang = Math.random() * Math.PI * 2;

    const x = mouse.x + Math.cos(ang) * dist;
    const y = mouse.y + Math.sin(ang) * dist;

    const dx = mouse.x - x;
    const dy = mouse.y - y;

    const points = [];
    const segments = 7;
    const h = 400;
    const maxW = 60;
    let randspike = 1;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const py = -h / 2 + t * h;

      const centerFalloff = Math.sin(t * Math.PI);
      const w = maxW * centerFalloff;

      const spike = randspike * Math.random() * 40;
      randspike *= -1;

      const curve = Math.sin(t * Math.PI * 2) * 20;

      points.push({
        y: py,
        lx: -w + spike + curve,
        rx: w + spike + curve,
      });
    }

    return {
      x,
      y,
      angle: Math.atan2(dy, dx),
      t: 0,
      points,
      scale: 0,
      indicatorT: 0,
    };
  }
  function spawnSnake(rift) {
    const speed = 2500;

    return {
      x: rift.x,
      y: rift.y,
      vx: Math.cos(rift.angle) * speed,
      vy: Math.sin(rift.angle) * speed,
      active: true,
    };
  }

  const stateFall = {
    beams: [],
    timer: 0,
    cycle: 0,
    prevMx: 0,
    prevMy: 0,
  };
  function enterFall() {
    enterOrbit();
    stateFall.beams = [];
    stateFall.timer = 0;
    stateFall.cycle = 0;
    stateFall.prevMx = mouse.x;
    stateFall.prevMy = mouse.y;
  }
  const HALF_LEN = 2000;
  const GROW_TIME = 0.5;
  const SHRINK_SPEED = 200;
  const DURATIONS = [1, 1, 1, 2];
  function updateFall(dt) {
    const mx = mouse.x;
    const my = mouse.y;

    const mvx = mx - stateFall.prevMx;
    const mvy = my - stateFall.prevMy;

    stateFall.prevMx = mx;
    stateFall.prevMy = my;

    const px = mx + mvx;
    const py = my + mvy;

    const cycle = stateFall.cycle;

    if (stateFall.timer === 0) {
      if (cycle === 3) {
        const base = Math.random() * Math.PI * 2;
        const spread = Math.PI / 6;

        stateFall.beams.push(spawnBeam(px, py, base, 1.5));
        stateFall.beams.push(spawnBeam(px, py, base - spread, 1.5));
        stateFall.beams.push(spawnBeam(px, py, base + spread, 1.5));
      } else if (cycle < 3) {
        stateFall.beams.push(spawnBeam(px, py, undefined, 1));
      }
    }

    stateFall.timer += dt;

    if (stateFall.timer >= DURATIONS[cycle]) {
      stateFall.timer = 0;
      stateFall.cycle = cycle + 1;
    }

    for (const b of stateFall.beams) {
      let t = (b.t += dt);

      if (t < GROW_TIME) {
        const p = t / GROW_TIME;
        const eased = 1 - (1 - p) * (1 - p);
        b.width = b.targetWidth * eased;
      } else if (t < b.armTime) {
        b.width = b.targetWidth;
      } else {
        const w = b.width - dt * SHRINK_SPEED;
        b.width = w;
        if (w <= 0) b.active = false;
      }

      const dx = mx - b.x;
      const dy = my - b.y;

      const angle = b.angle;
      const cos = Math.cos(-angle);
      const sin = Math.sin(-angle);

      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;

      const halfW = b.width * 0.5;

      if (
        b.active &&
        t >= b.armTime &&
        Math.abs(rx) < HALF_LEN &&
        Math.abs(ry) < halfW
      ) {
        death("Celestial");
      }

      b._rx = rx;
    }

    compact(stateFall.beams);
  }
  function drawFall(ctx) {
    for (const b of stateFall.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);

      let a = b.angle;
      if (b.t < GROW_TIME) {
        const p = b.t / GROW_TIME;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }

      ctx.rotate(a);

      const armed = b.t >= b.armTime;
      const alpha = armed ? 1 : 0.5;

      ctx.globalAlpha = alpha;
      ctx.lineWidth = 18;

      if (!armed) {
        ctx.strokeStyle = "transparent";
      } else {
        ctx.strokeStyle = "magenta";
      }

      const x = b._rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      if (armed && b.width > 1) {
        const glow = 100;

        const gradTop = ctx.createLinearGradient(
          0,
          -b.width / 2 - glow,
          0,
          -b.width / 2,
        );
        gradTop.addColorStop(0, "rgba(255,0,255,0)");
        gradTop.addColorStop(1, "rgba(255,0,255,0.5)");

        ctx.fillStyle = gradTop;
        ctx.fillRect(x, -b.width / 2 - glow, len, glow);

        const gradBot = ctx.createLinearGradient(
          0,
          b.width / 2,
          0,
          b.width / 2 + glow,
        );
        gradBot.addColorStop(0, "rgba(255,0,255,0.5)");
        gradBot.addColorStop(1, "rgba(255,0,255,0)");

        ctx.fillStyle = gradBot;
        ctx.fillRect(x, b.width / 2, len, glow);
      }

      ctx.strokeRect(x, -b.width * 0.5, len, b.width);

      ctx.restore();
    }
  }
  function drawFallFront(ctx) {
    for (const b of stateFall.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);

      let a = b.angle;
      if (b.t < GROW_TIME) {
        const p = b.t / GROW_TIME;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }

      ctx.rotate(a);

      const armed = b.t >= b.armTime;
      const alpha = armed ? 1 : 0.5;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = armed ? "black" : "magenta";

      const x = b._rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      ctx.fillRect(x, -b.width * 0.5, len, b.width);

      ctx.restore();
    }
  }

  const stateImplosion = {
    circles: [],
    spawnTimer: 0,
    spawned: 0,
  };
  function enterImplosion() {
    enterOrbit();
    stateImplosion.circles = [];
    stateImplosion.spawnTimer = 0;
    stateImplosion.spawned = 0;
  }
  function updateImplosion(dt) {
    const s = stateImplosion;

    s.spawnTimer += dt;

    const interval = 1 / 15;
    while (s.spawnTimer >= interval && s.spawned < 15) {
      s.spawnTimer -= interval;
      s.spawned++;
      s.circles.push(spawnImplosionCircle());
    }

    for (const c of s.circles) {
      c.t += dt;
      c.opacity += dt * 4;

      if (c.t < 0.25) {
        c.r = 5;
      } else if (c.t < 1.5) {
        const p = (c.t - 0.25) / 1.25;
        const eased = p * p * (3 - 2 * p);
        c.r = c.targetR * eased;
        c.phase = 1;
      } else {
        c.phase = 2;
        c.r -= dt * 600;
        if (c.r <= 0) c.active = false;
      }

      if (c.phase === 2) {
        const dx = mouse.x - c.x;
        const dy = mouse.y - c.y;

        const hitR = c.r * 1.1;

        if (dx * dx + dy * dy <= hitR * hitR) {
          death("Celestial");
        }
      }
    }

    compact(s.circles);
  }
  function drawImplosion(ctx) {
    const s = stateImplosion;

    for (const c of s.circles) {
      ctx.save();
      ctx.globalAlpha = c.opacity;
      ctx.translate(c.x, c.y);

      if (c.phase < 2) {
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.strokeStyle = "magenta";
        ctx.lineWidth = 18;
        ctx.stroke();
        const glow = 200;
        const grad = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,255,0.5)");
        grad.addColorStop(1, "rgba(255,0,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "transparent";
      } else {
        const spikes = 6;

        ctx.strokeStyle = "magenta";
        ctx.lineWidth = 18;

        ctx.rotate(c.r);
        const glow = 200;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,255,0.5)");
        grad.addColorStop(1, "rgba(255,0,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
          const a = (i / spikes) * Math.PI * 2;
          const r1 = c.r * 0.5;
          const r2 = c.r * 1.5;

          const x1 = Math.cos(a) * r1;
          const y1 = Math.sin(a) * r1;

          const x2 = Math.cos(a + Math.PI / spikes) * r2;
          const y2 = Math.sin(a + Math.PI / spikes) * r2;

          if (i === 0) ctx.moveTo(x1, y1);
          else ctx.lineTo(x1, y1);

          ctx.lineTo(x2, y2);
        }
        ctx.closePath();

        ctx.stroke();

        ctx.strokeStyle = "transparent";
      }

      ctx.restore();
    }
  }
  function drawImplosionFront(ctx) {
    const s = stateImplosion;

    for (const c of s.circles) {
      ctx.save();
      ctx.globalAlpha = c.opacity;
      ctx.translate(c.x, c.y);

      if (c.phase < 2) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const spikes = 6;

        ctx.fillStyle = "black";

        ctx.rotate(c.r);
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
          const a = (i / spikes) * Math.PI * 2;
          const r1 = c.r * 0.5;
          const r2 = c.r * 1.5;

          const x1 = Math.cos(a) * r1;
          const y1 = Math.sin(a) * r1;

          const x2 = Math.cos(a + Math.PI / spikes) * r2;
          const y2 = Math.sin(a + Math.PI / spikes) * r2;

          if (i === 0) ctx.moveTo(x1, y1);
          else ctx.lineTo(x1, y1);

          ctx.lineTo(x2, y2);
        }
        ctx.closePath();

        ctx.fill();
      }

      ctx.restore();
    }
  }

  const statePizzaCutter = {
    spokes: [],
    t: 0,
    cycle: 0,
    spawned: false,
    cx: 0,
    cy: 0,
    initialized: false,
  };
  function enterPizzaCutter() {
    statePizzaCutter.spokes = [];
    statePizzaCutter.t = 0;
    statePizzaCutter.cycle = 0;
    statePizzaCutter.spawned = false;
    const cx = mouse.x + (Math.random() - 0.5) * 2000;
    const cy = mouse.y + (Math.random() - 0.5) * 2000;
    statePizzaCutter.cx = cx;
    statePizzaCutter.cy = cy;
    enterFixed(cx, cy);
    statePizzaCutter.initialized = true;
  }
  function updatePizzaCutter(dt) {
    statePizzaCutter.t += dt;

    if (!statePizzaCutter.spawned) {
      statePizzaCutter.spokes.push(spawnPizza());
      statePizzaCutter.spawned = true;
    }

    for (const s of statePizzaCutter.spokes) {
      s.t += dt;

      const p = Math.min(s.t / 2, 1);
      const eased = 1 - (1 - p) * (1 - p);
      s.angle = s.startAngle + (s.targetAngle - s.startAngle) * eased;

      if (s.t >= 2 && s.t < 2.5) {
        const len = 20000;
        const w = 90;

        for (let i = 0; i < 8; i++) {
          const angle = s.angle + i * (Math.PI / 4);

          const dx = mouse.x - s.x;
          const dy = mouse.y - s.y;

          const cos = Math.cos(-angle);
          const sin = Math.sin(-angle);

          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;

          const halfLen = len;
          const halfW = w / 2;

          if (Math.abs(rx) < halfLen && Math.abs(ry) < halfW) {
            death("Celestial");
            break;
          }
        }
      }
      if (s.t >= 2.5) {
        s.offset += dt * 10000;
      }
      if (s.t > 3) {
        s.active = false;
      }
    }

    if (statePizzaCutter.t >= 2) {
      statePizzaCutter.t = 0;
      statePizzaCutter.cycle++;
      if (statePizzaCutter.cycle < 4) {
        statePizzaCutter.spawned = false;
      }
    }
  }
  function drawPizzaCutter(ctx) {
    for (const s of statePizzaCutter.spokes) {
      ctx.save();

      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      const isLethal = s.t >= 2;

      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);

        const w = isLethal ? 90 : 100;
        const dx = mouse.x - s.x;
        const dy = mouse.y - s.y;

        const cos = Math.cos(-(s.angle + i * (Math.PI / 4)));
        const sin = Math.sin(-(s.angle + i * (Math.PI / 4)));

        const rx = dx * cos - dy * sin;
        const x = rx - BEAM_RADIUS;
        const len = BEAM_RADIUS * 2;

        if (isLethal) {
          ctx.globalAlpha = s.t >= 2.75 ? (3 - s.t) * 4 : 1;
          ctx.strokeStyle = "magenta";
          ctx.lineWidth = 18;

          const drawX = Math.max(x, s.offset);
          const glow = 100;

          const gradTop = ctx.createLinearGradient(0, -w / 2 - glow, 0, -w / 2);
          gradTop.addColorStop(0, "rgba(255,0,255,0)");
          gradTop.addColorStop(1, "rgba(255,0,255,0.5)");

          ctx.fillStyle = gradTop;
          ctx.fillRect(drawX, -w / 2 - glow, len, glow);

          const gradBot = ctx.createLinearGradient(0, w / 2, 0, w / 2 + glow);
          gradBot.addColorStop(0, "rgba(255,0,255,0.5)");
          gradBot.addColorStop(1, "rgba(255,0,255,0)");

          ctx.fillStyle = gradBot;
          ctx.fillRect(drawX, w / 2, len, glow);

          ctx.beginPath();
          ctx.rect(Math.max(x, s.offset), -w / 2, len, w);
          ctx.stroke();

          ctx.strokeStyle = "transparent";
        } else if (i < 4) {
          ctx.globalAlpha =
            s.t < 0.25 && statePizzaCutter.cycle == 0 ? s.t * 3 : 0.75;

          const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
          grad.addColorStop(0, "rgba(255,0,255,0)");
          grad.addColorStop(0.45, "magenta");
          grad.addColorStop(0.55, "magenta");
          grad.addColorStop(1, "rgba(255,0,255,0)");

          ctx.fillStyle = grad;
          ctx.fillRect(x, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
  }
  function drawPizzaCutterFront(ctx) {
    for (const s of statePizzaCutter.spokes) {
      ctx.save();

      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      const isLethal = s.t >= 2;

      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);

        const w = 90;
        const dx = mouse.x - s.x;
        const dy = mouse.y - s.y;

        const cos = Math.cos(-(s.angle + i * (Math.PI / 4)));
        const sin = Math.sin(-(s.angle + i * (Math.PI / 4)));

        const rx = dx * cos - dy * sin;
        const x = rx - BEAM_RADIUS;
        const len = BEAM_RADIUS * 2;

        if (isLethal) {
          ctx.globalAlpha = s.t >= 2.75 ? (3 - s.t) * 4 : 1;
          ctx.beginPath();
          ctx.fillStyle = "black";
          ctx.fillRect(Math.max(x, s.offset), -w / 2, len, w);
        }
      }

      ctx.restore();
    }
  }

  const statePizzaCutterCrumble = {
    spokes: [],
    t: 0,
    cycle: 0,
    spawned: false,
    cx: 0,
    cy: 0,
    initialized: false,

    circles: [],
  };
  function enterPizzaCutterCrumble() {
    statePizzaCutter.spokes = [];
    statePizzaCutter.t = 0;
    statePizzaCutter.cycle = 0;
    statePizzaCutter.spawned = false;
    const cx = mouse.x + (Math.random() - 0.5) * 2000;
    const cy = mouse.y + (Math.random() - 0.5) * 2000;
    statePizzaCutter.cx = cx;
    statePizzaCutter.cy = cy;
    enterFixed(cx, cy);
    statePizzaCutter.initialized = true;

    statePizzaCutter.circles = [];
  }
  function updatePizzaCutterCrumble(dt) {
    statePizzaCutter.t += dt;

    if (!statePizzaCutter.spawned) {
      statePizzaCutter.spokes.push(spawnPizza());
      for (let i = 0; i < 300; i++) {
        statePizzaCutter.circles.push(spawnCircle(75));
      }
      statePizzaCutter.spawned = true;
    }

    for (const s of statePizzaCutter.spokes) {
      s.t += dt;

      const p = Math.min(s.t / 2, 1);
      const eased = 1 - (1 - p) * (1 - p);
      s.angle = s.startAngle + (s.targetAngle - s.startAngle) * eased;

      if (s.t >= 2 && s.t < 2.5) {
        const len = 20000;
        const w = 90;

        for (let i = 0; i < 8; i++) {
          const angle = s.angle + i * (Math.PI / 4);

          const dx = mouse.x - s.x;
          const dy = mouse.y - s.y;

          const cos = Math.cos(-angle);
          const sin = Math.sin(-angle);

          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;

          const halfLen = len;
          const halfW = w / 2;

          if (Math.abs(rx) < halfLen && Math.abs(ry) < halfW) {
            death("Celestial");
            break;
          }
        }
      }
      if (s.t >= 2.5) {
        s.offset += dt * 10000;
      }
      if (s.t > 3) {
        s.active = false;
      }
    }

    if (statePizzaCutter.t >= 2) {
      statePizzaCutter.t = 0;
      statePizzaCutter.cycle++;
      if (statePizzaCutter.cycle < 4) {
        statePizzaCutter.spawned = false;
      }
    }

    for (const c of statePizzaCutter.circles) {
      c.t += dt;

      if (c.t < 2) {
        const p = c.t / 2;

        const eased = 1 - (1 - p) * (1 - p);

        c.x = c.sx + (c.tx - c.sx) * eased;
        c.y = c.sy + (c.ty - c.sy) * eased;
      }

      if (c.t < 0.5) {
        const p = c.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        c.r = c.targetR * eased;
      } else if (c.t < 2) {
        c.r = c.targetR;
      } else {
        c.r -= dt * 100;
        if (c.r <= 0) c.active = false;
      }

      if (c.t >= 2 && c.r >= 0) {
        const dx = mouse.x - c.x;
        const dy = mouse.y - c.y;
        if (dx * dx + dy * dy <= c.r * c.r) {
          death("Celestial");
        }
      }
    }
    compact(stateCrumble.circles);
  }
  function drawPizzaCutterCrumble(ctx) {
    for (const s of statePizzaCutter.spokes) {
      ctx.save();

      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      const isLethal = s.t >= 2;

      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);

        const w = isLethal ? 90 : 100;
        const dx = mouse.x - s.x;
        const dy = mouse.y - s.y;

        const cos = Math.cos(-(s.angle + i * (Math.PI / 4)));
        const sin = Math.sin(-(s.angle + i * (Math.PI / 4)));

        const rx = dx * cos - dy * sin;
        const x = rx - BEAM_RADIUS;
        const len = BEAM_RADIUS * 2;

        if (isLethal) {
          ctx.globalAlpha = s.t >= 2.75 ? (3 - s.t) * 4 : 1;
          ctx.strokeStyle = "magenta";
          ctx.lineWidth = 18;

          const drawX = Math.max(x, s.offset);
          const glow = 100;

          const gradTop = ctx.createLinearGradient(0, -w / 2 - glow, 0, -w / 2);
          gradTop.addColorStop(0, "rgba(255,0,255,0)");
          gradTop.addColorStop(1, "rgba(255,0,255,0.5)");

          ctx.fillStyle = gradTop;
          ctx.fillRect(drawX, -w / 2 - glow, len, glow);

          const gradBot = ctx.createLinearGradient(0, w / 2, 0, w / 2 + glow);
          gradBot.addColorStop(0, "rgba(255,0,255,0.5)");
          gradBot.addColorStop(1, "rgba(255,0,255,0)");

          ctx.fillStyle = gradBot;
          ctx.fillRect(drawX, w / 2, len, glow);

          ctx.beginPath();
          ctx.rect(Math.max(x, s.offset), -w / 2, len, w);
          ctx.stroke();

          ctx.strokeStyle = "transparent";
        } else if (i < 4) {
          ctx.globalAlpha =
            s.t < 0.25 && statePizzaCutter.cycle == 0 ? s.t * 3 : 0.75;

          const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
          grad.addColorStop(0, "rgba(255,0,255,0)");
          grad.addColorStop(0.45, "magenta");
          grad.addColorStop(0.55, "magenta");
          grad.addColorStop(1, "rgba(255,0,255,0)");

          ctx.fillStyle = grad;
          ctx.fillRect(x, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
    for (const c of statePizzaCutter.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t >= 2 && c.r >= 0) {
        const glow = 100;

        const grad = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,255,0.5)");
        grad.addColorStop(1, "rgba(255,0,255,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "magenta";
        ctx.lineWidth = 18;

        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "transparent";
      }

      ctx.restore();
    }
  }
  function drawPizzaCutterCrumbleFront(ctx) {
    for (const s of statePizzaCutter.spokes) {
      ctx.save();

      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      const isLethal = s.t >= 2;

      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);

        const w = 90;
        const dx = mouse.x - s.x;
        const dy = mouse.y - s.y;

        const cos = Math.cos(-(s.angle + i * (Math.PI / 4)));
        const sin = Math.sin(-(s.angle + i * (Math.PI / 4)));

        const rx = dx * cos - dy * sin;
        const x = rx - BEAM_RADIUS;
        const len = BEAM_RADIUS * 2;

        if (isLethal) {
          ctx.globalAlpha = s.t >= 2.75 ? (3 - s.t) * 4 : 1;
          ctx.beginPath();
          ctx.fillStyle = "black";
          ctx.fillRect(Math.max(x, s.offset), -w / 2, len, w);
        }
      }

      ctx.restore();
    }
    for (const c of statePizzaCutter.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t < 2) {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r);
        grad.addColorStop(0, "black");
        grad.addColorStop(1, "magenta");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.r >= 0) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  const stateFutile = {
    t: 0,
    cycle: 0,

    rift: null,
    snake: null,
    trail: [],
  };
  function enterFutile() {
    const s = stateFutile;

    s.t = 0;
    s.cycle = 0;
    s.snake = null;

    s.rift = spawnFutileRift();
    s.trail = [];
    enterFixed(-1000, -1000);
  }
  function updateFutile(dt) {
    const s = stateFutile;

    s.t += dt;
    s.rift.t += dt;

    const r = s.rift;
    if (r.t < 0.25) {
      const p = r.t / 0.25;
      r.scale = 1 - (1 - p) * (1 - p);
    } else if (r.t < 1) {
      r.scale = 1;
    } else {
      const p = (r.t - 1) * 2;
      r.scale = Math.max(0, 1 - p * p);
    }

    if (s.rift.t >= 1 && s.rift.t < 3 && !s.snake) {
      s.snake = spawnSnake(s.rift);
    }

    const sn = s.snake;
    if (sn) {
      const dx = mouse.x - sn.x;
      const dy = mouse.y - sn.y;

      const vLen = Math.hypot(sn.vx, sn.vy) || 1;
      const vx = sn.vx / vLen;
      const vy = sn.vy / vLen;

      const px = -vy;
      const py = vx;

      const side = dx * px + dy * py;
      const forward = dx * vx + dy * vy;
      const TURN_STRENGTH = 12 * (forward < 0 ? 0.5 : 1);

      sn.vx += px * side * TURN_STRENGTH * dt;
      sn.vy += py * side * TURN_STRENGTH * dt;

      const newLen = Math.hypot(sn.vx, sn.vy) || 1;
      const speed = 2500;

      sn.vx = (sn.vx / newLen) * speed;
      sn.vy = (sn.vy / newLen) * speed;

      sn.x += sn.vx * dt;
      sn.y += sn.vy * dt;

      const off = 100;
      if (s.rift.t < 3) {
        s.trail.push({
          x: sn.x + (Math.random() - 0.5) * off,
          y: sn.y + (Math.random() - 0.5) * off,
          r: 200,
          a: Math.random() * Math.PI * 2,
        });
      }

      if (s.rift.t >= 3) {
        sn.vx *= 0.85;
        sn.vy *= 0.85;
      }
    }

    for (const p of s.trail) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      if (dx * dx + dy * dy < p.r * p.r) {
        death("Celestial");
      }
      p.r -=
        dt * Math.max(50, p.r) * 1.25 * (s.t >= 12 ? (s.t - 11) * 1.25 : 1);
    }
    s.trail = s.trail.filter((p) => p.r > 0);

    if (s.rift.t >= 3) {
      s.cycle++;

      if (s.cycle < 4) {
        s.rift = spawnFutileRift();
      }

      s.snake = null;
    }
  }
  function drawFutile(ctx) {
    const s = stateFutile;

    if (s.rift) {
      const pts = s.rift.points;

      ctx.save();
      ctx.translate(s.rift.x, s.rift.y);
      ctx.rotate(s.rift.angle);
      ctx.scale(s.rift.scale, s.rift.scale);

      const glowSize = 300;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
      glow.addColorStop(0, "rgba(255,0,255,0.5)");
      glow.addColorStop(1, "rgba(255,0,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (i === 0) ctx.moveTo(p.lx, p.y);
        else ctx.lineTo(p.lx, p.y);
      }

      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        ctx.lineTo(p.rx, p.y);
      }

      ctx.closePath();

      ctx.strokeStyle = "magenta";
      ctx.lineWidth = 18;
      ctx.stroke();

      ctx.restore();
    }

    for (const p of s.trail) {
      ctx.save();

      ctx.translate(p.x, p.y);

      const glowSize = 100;
      const glow = ctx.createRadialGradient(0, 0, p.r, 0, 0, p.r + glowSize);
      glow.addColorStop(0, "rgba(255,0,255,0.5)");
      glow.addColorStop(1, "rgba(255,0,255,0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, p.r + glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = "magenta";
      ctx.lineWidth = 18;
      ctx.stroke();

      ctx.rotate(p.a);

      const len = Math.max(0, Math.min(30, p.r * 0.6 - 30));
      const w = 1000;

      if (len > 0) {
        const grad = ctx.createLinearGradient(
          -len / 2 - glowSize,
          0,
          -len / 2,
          0,
        );
        grad.addColorStop(0, "rgba(255,0,255,0)");
        grad.addColorStop(1, `rgba(255,0,255,0.5)`);

        ctx.fillStyle = grad;
        ctx.fillRect(-len / 2 - glowSize, -w / 2, glowSize, w);

        const grad2 = ctx.createLinearGradient(
          len / 2,
          0,
          len / 2 + glowSize,
          0,
        );
        grad2.addColorStop(0, `rgba(255,0,255,0.5)`);
        grad2.addColorStop(1, "rgba(255,0,255,0)");

        ctx.fillStyle = grad2;
        ctx.fillRect(len / 2, -w / 2, glowSize, w);

        ctx.strokeStyle = "magenta";
        ctx.lineWidth = 18;
        ctx.strokeRect(-len / 2, -w / 2, len, w);
      }

      ctx.restore();
    }
  }
  function drawFutileFront(ctx) {
    const s = stateFutile;

    if (s.rift) {
      const pts = s.rift.points;

      ctx.save();
      ctx.translate(s.rift.x, s.rift.y);
      ctx.rotate(s.rift.angle);
      ctx.scale(s.rift.scale, s.rift.scale);

      ctx.beginPath();

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (i === 0) ctx.moveTo(p.lx, p.y);
        else ctx.lineTo(p.lx, p.y);
      }

      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        ctx.lineTo(p.rx, p.y);
      }

      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.fill();

      ctx.restore();
    }

    for (const p of s.trail) {
      ctx.save();

      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);

      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();

      const len = Math.max(0, Math.min(30, p.r * 0.6 - 30));
      const w = 1000;

      if (len > 0) {
        ctx.fillStyle = "black";
        ctx.fillRect(-len / 2, -w / 2, len, w);
      }

      ctx.restore();
    }

    const r = stateFutile.rift;
    if (s.rift && s.rift.t <= 2 && r) {
      const cam = getCameraPos();

      const cx = cam.x + window.innerWidth / 2;
      const cy = cam.y + window.innerHeight / 2;

      const dx = r.x - cx;
      const dy = r.y - cy;
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

      const pts = r.points;

      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(ang);

      ctx.scale(s.rift.scale * 0.5, s.rift.scale * 0.5);

      const glowSize = 200;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
      glow.addColorStop(0, "rgba(255,0,255,0.5)");
      glow.addColorStop(1, "rgba(255,0,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (i === 0) ctx.moveTo(p.lx, p.y);
        else ctx.lineTo(p.lx, p.y);
      }

      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        ctx.lineTo(p.rx, p.y);
      }

      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.fill();

      ctx.strokeStyle = "magenta";
      ctx.lineWidth = 18;
      ctx.stroke();

      ctx.restore();

      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(ang);

      ctx.fillStyle = "magenta";
      ctx.font = `${s.rift.scale * 100}px monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      ctx.fillText("➤", s.rift.scale * 100, 0);

      ctx.restore();
    }
  }

  const stateCrumble = {
    circles: [],
  };
  function enterCrumble() {
    enterOrbit();
    stateCrumble.circles = [];
    for (let i = 0; i < 300; i++) {
      stateCrumble.circles.push(spawnCircle());
    }
  }
  function updateCrumble(dt) {
    for (const c of stateCrumble.circles) {
      c.t += dt;

      if (c.t < 2) {
        const p = c.t / 2;

        const eased = 1 - (1 - p) * (1 - p);

        c.x = c.sx + (c.tx - c.sx) * eased;
        c.y = c.sy + (c.ty - c.sy) * eased;
      }

      if (c.t < 0.5) {
        const p = c.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        c.r = c.targetR * eased;
      } else if (c.t < 2) {
        c.r = c.targetR;
      } else {
        c.r -= dt * 200;
        if (c.r <= 0) c.active = false;
      }

      if (c.t >= 2) {
        const dx = mouse.x - c.x;
        const dy = mouse.y - c.y;
        if (dx * dx + dy * dy <= c.r * c.r) {
          death("Celestial");
        }
      }
    }

    compact(stateCrumble.circles);
  }
  function drawCrumble(ctx) {
    for (const c of stateCrumble.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t >= 2 && c.r >= 0) {
        const glow = 100;

        const grad = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,255,0.5)");
        grad.addColorStop(1, "rgba(255,0,255,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "magenta";
        ctx.lineWidth = 18;

        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "transparent";
      }

      ctx.restore();
    }
  }
  function drawCrumbleFront(ctx) {
    for (const c of stateCrumble.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t < 2) {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r);
        grad.addColorStop(0, "black");
        grad.addColorStop(1, "magenta");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.r >= 0) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  const stateBitter = {
    spokes: [],
    t: 0,
    cycle: 0,
    spawned: false,
    cx: 0,
    cy: 0,
  };
  function enterBitter() {
    stateBitter.spokes = [];
    stateBitter.t = 0;
    stateBitter.cycle = 0;
    stateBitter.spawned = false;

    const cx = mouse.x + (Math.random() - 0.5) * 2000;
    const cy = mouse.y + (Math.random() - 0.5) * 2000;
    stateBitter.cx = cx;
    stateBitter.cy = cy;
    enterFixed(cx, cy);
  }
  function updateBitter(dt) {
    const s = stateBitter;
    s.t += dt;

    const dx = mouse.x - s.cx;
    const dy = mouse.y - s.cy;
    const dist = Math.hypot(dx, dy);
    const maxDist = 2000;
    if (dist > maxDist) {
      const nx = dx / dist;
      const ny = dy / dist;

      s.cx = mouse.x - nx * maxDist;
      s.cy = mouse.y - ny * maxDist;
    }

    if (!s.spawned) {
      const counts = [4, 5, 6];
      s.spokes.push(spawnBitter(counts[s.cycle]));
      s.spawned = true;
    }

    for (const b of s.spokes) {
      b.t += dt;

      const p = Math.min(b.t / 2, 1);
      const eased = 1 - (1 - p) * (1 - p);
      let angle = b.baseAngle + eased * Math.PI * 2 * b.dirAngle;
      angle += (b.t - 2) * Math.PI * b.dirAngle;
      b.angle = angle;

      if (b.t >= 2 && !b.shot) {
        const dx = mouse.x - b.x;
        const dy = mouse.y - b.y;
        const len = Math.hypot(dx, dy) || 1;

        b.dirX = dx / len;
        b.dirY = dy / len;

        b.shot = true;
      }
      if (b.t >= 2) {
        const speed = 1500;

        b.x += b.dirX * speed * dt;
        b.y += b.dirY * speed * dt;
      }

      if (b.t >= 2 && b.t <= 5) {
        for (let i = 0; i < b.count; i++) {
          const ang = b.angle + (i * Math.PI * 2) / b.count;

          const dx = mouse.x - b.x;
          const dy = mouse.y - b.y;

          const cos = Math.cos(-ang);
          const sin = Math.sin(-ang);

          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;

          const len = 1000;
          const w = 25;

          if (rx > 0 && rx < len && Math.abs(ry) < w / 2) {
            death("Celestial");
            break;
          }
        }
      }

      if (b.t > 5) b.active = false;
    }

    s.spokes = s.spokes.filter((b) => b.active);

    if (s.t >= 2) {
      s.t = 0;
      s.cycle++;
      if (s.cycle <= 2) enterFixed(s.cx, s.cy, false);
      s.spawned = false;
    }
  }
  function drawBitter(ctx) {
    for (const b of stateBitter.spokes) {
      ctx.save();

      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      const isLethal = b.t >= 2;

      for (let i = 0; i < b.count; i++) {
        ctx.rotate((Math.PI * 2) / b.count);

        const len = 1000;
        const w = isLethal ? 25 : 50;

        if (isLethal) {
          ctx.globalAlpha = b.t >= 4.75 ? (5 - b.t) * 4 : 1;
          const drawX = 0;

          const glow = 100;

          const gradTop = ctx.createLinearGradient(0, -w / 2 - glow, 0, -w / 2);
          gradTop.addColorStop(0, "rgba(255,0,255,0)");
          gradTop.addColorStop(1, "rgba(255,0,255,0.5)");

          ctx.fillStyle = gradTop;
          ctx.fillRect(drawX, -w / 2 - glow, len, glow);

          const gradBot = ctx.createLinearGradient(0, w / 2, 0, w / 2 + glow);
          gradBot.addColorStop(0, "rgba(255,0,255,0.5)");
          gradBot.addColorStop(1, "rgba(255,0,255,0)");

          ctx.fillStyle = gradBot;
          ctx.fillRect(drawX, w / 2, len, glow);

          ctx.strokeStyle = "magenta";
          ctx.lineWidth = 18;

          ctx.beginPath();
          ctx.rect(drawX, -w / 2, len, w);
          ctx.stroke();
        } else {
          ctx.globalAlpha =
            stateBitter.t < 0.25 && stateBitter.cycle == 0
              ? stateBitter.t * 3
              : 0.75;

          const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
          grad.addColorStop(0, "rgba(255,0,255,0)");
          grad.addColorStop(0.45, "magenta");
          grad.addColorStop(0.55, "magenta");
          grad.addColorStop(1, "rgba(255,0,255,0)");

          ctx.fillStyle = grad;
          ctx.fillRect(0, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
  }
  function drawBitterFront(ctx) {
    for (const b of stateBitter.spokes) {
      ctx.save();

      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      const isLethal = b.t >= 2;

      for (let i = 0; i < b.count; i++) {
        ctx.rotate((Math.PI * 2) / b.count);

        const len = 1000;
        const w = isLethal ? 25 : 50;

        if (isLethal) {
          ctx.globalAlpha = b.t >= 4.75 ? (5 - b.t) * 4 : 1;
          const drawX = 0;

          ctx.fillStyle = "black";
          ctx.fillRect(drawX, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
  }

  const stateCease = {
    beams: [],
    timer: 0,
    rapidTimer: 0,
    circle: {
      t: 0,
      active: false,
      x: 0,
      y: 0,
    },
    positions: [],
  };
  function enterCease() {
    enterOrbit();
    stateCease.beams = [];
    stateCease.timer = 0;
    stateCease.rapidTimer = 0;
    stateCease.circle = {
      t: 0,
      active: true,
      x: mouse.x,
      y: mouse.y,
    };
    stateCease.positions = [];
  }
  function updateCease(dt) {
    stateCease.timer += dt;
    stateCease.rapidTimer += dt;

    const interval = 0.5 / 40;
    while (
      stateCease.rapidTimer >= interval &&
      stateCease.beams.length < 40 &&
      stateCease.timer <= 1
    ) {
      stateCease.rapidTimer -= interval;

      let x, y;
      const minDist = 500;

      do {
        x = mouse.x + (Math.random() - 0.5) * 5000;
        y = mouse.y + (Math.random() - 0.5) * 5000;
      } while (
        stateCease.positions.some((p) => {
          const dx = x - p.x;
          const dy = y - p.y;
          return dx * dx + dy * dy < minDist * minDist;
        })
      );

      stateCease.positions.push({ x, y });

      stateCease.beams.push(
        spawnBeam(x, y, Math.random() * Math.PI * 2, 2 - stateCease.timer),
      );
    }

    if (stateCease.circle.active) {
      const c = stateCease.circle;

      c.t += dt;

      if (c.t < 0.5) {
        const p = c.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        c.r = 600 * eased;
      } else if (c.t < 2) {
        c.r = 600;
      } else {
        c.r -= dt * 800;
        if (c.r <= 0) {
          c.active = false;
        }
      }

      if (c.t >= 2) {
        const dx = mouse.x - c.x;
        const dy = mouse.y - c.y;
        const distSq = dx * dx + dy * dy;

        if (distSq <= c.r * c.r) {
          death("Celestial");
        }
      }
    }

    for (const b of stateCease.beams) {
      let a = b.angle;

      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }

      b.renderAngle = a;
      b.cos = Math.cos(-a);
      b.sin = Math.sin(-a);

      b.t += dt;

      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        b.width = b.targetWidth * eased;
      } else if (b.t < b.armTime) {
        b.width = b.targetWidth;
      } else {
        b.width -= dt * 200;
        if (b.width <= 0) b.active = false;
      }

      const dx = mouse.x - b.x;
      const dy = mouse.y - b.y;

      b.rx = dx * b.cos - dy * b.sin;
      b.ry = dx * b.sin + dy * b.cos;

      const rx = b.rx;
      const ry = b.ry;

      const halfLen = 2000;
      const halfW = b.width / 2;

      if (
        b.active &&
        b.t >= b.armTime &&
        Math.abs(rx) < halfLen &&
        Math.abs(ry) < halfW
      ) {
        death("Celestial");
      }
    }

    compact(stateCease.beams);
  }
  function drawCease(ctx) {
    for (const b of stateCease.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);
      ctx.rotate(b.renderAngle);

      const alpha = b.t < b.armTime ? 0.5 : 1;

      ctx.globalAlpha = alpha;
      if (b.t < b.armTime) {
        ctx.strokeStyle = "transparent";
      } else {
        ctx.strokeStyle = "magenta";
      }
      ctx.lineWidth = 18;

      const dx = mouse.x - b.x;
      const dy = mouse.y - b.y;

      const x = b.rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      if (b.t >= b.armTime) {
        const glow = 100;
        const drawX = x;

        const gradTop = ctx.createLinearGradient(
          0,
          -b.width / 2 - glow,
          0,
          -b.width / 2,
        );
        gradTop.addColorStop(0, "rgba(255,0,255,0)");
        gradTop.addColorStop(1, "rgba(255,0,255,0.5)");

        ctx.fillStyle = gradTop;
        ctx.fillRect(drawX, -b.width / 2 - glow, len, glow);

        const gradBot = ctx.createLinearGradient(
          0,
          b.width / 2,
          0,
          b.width / 2 + glow,
        );
        gradBot.addColorStop(0, "rgba(255,0,255,0.5)");
        gradBot.addColorStop(1, "rgba(255,0,255,0)");

        ctx.fillStyle = gradBot;
        ctx.fillRect(drawX, b.width / 2, len, glow);
      }
      ctx.strokeRect(x, -b.width / 2, len, b.width);

      ctx.strokeStyle = "transparent";

      ctx.restore();
    }
    if (stateCease.circle.active) {
      const c = stateCease.circle;

      ctx.save();
      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t < 2) {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r);
        grad.addColorStop(0, "black");
        grad.addColorStop(1, "magenta");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const glow = 100;

        const grad = ctx.createRadialGradient(0, 0, c.r, 0, 0, c.r + glow);
        grad.addColorStop(0, "rgba(255,0,255,0.5)");
        grad.addColorStop(1, "rgba(255,0,255,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, c.r + glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "magenta";
        ctx.lineWidth = 18;

        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "transparent";
      }

      ctx.restore();
    }
  }
  function drawCeaseFront(ctx) {
    if (stateCease.circle.active) {
      const c = stateCease.circle;

      ctx.save();
      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t >= 2) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
    for (const b of stateCease.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);
      ctx.rotate(b.renderAngle);

      const alpha = b.t < b.armTime ? 0.5 : 1;

      ctx.globalAlpha = alpha;
      if (b.t < b.armTime) {
        ctx.fillStyle = "magenta";
      } else {
        ctx.fillStyle = "black";
      }

      const dx = mouse.x - b.x;
      const dy = mouse.y - b.y;

      const x = b.rx - BEAM_RADIUS;
      const len = BEAM_RADIUS * 2;

      ctx.fillRect(x, -b.width / 2, len, b.width);

      ctx.restore();
    }
  }

  const stateDeathInBloom = {
    t: 0,
    cx: 0,
    cy: 0,
    ex: 0,
    ey: 0,
    prevMx: 0,
    prevMy: 0,
    len: 20000,
    w: 625,
    active: false,
    particles: [],
    pTimer: 0,
  };
  function enterDeathInBloom() {
    const s = stateDeathInBloom;

    s.t = 0;
    s.active = true;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const ang = Math.random() * Math.PI * 2;
    s.cx = cx + Math.cos(ang) * 2000;
    s.cy = cy + Math.sin(ang) * 2000;
    enterFixed(s.cx, s.cy);
    s.w = 625;

    s.ex = mouse.x;
    s.ey = mouse.y;
    s.particles = [];
    s.pTimer = 0;
  }
  function updateDeathInBloom(dt) {
    const s = stateDeathInBloom;
    if (!s.active) return;

    s.t += dt;
    s.pTimer += dt;

    const follow = 1 - Math.exp(-1 * dt);

    s.ex += (mouse.x - s.ex) * follow;
    s.ey += (mouse.y - s.ey) * follow;

    const dx = s.ex - s.cx;
    const dy = s.ey - s.cy;

    s.angle = Math.atan2(dy, dx);

    const mvx = mouse.x - s.prevMx;
    const mvy = mouse.y - s.prevMy;
    s.prevMx = mouse.x;
    s.prevMy = mouse.y;
    const bx = Math.cos(s.angle);
    const by = Math.sin(s.angle);
    const dir = mvx * bx + mvy * by;

    if (s.t < 21 && s.pTimer >= 0.02) {
      s.pTimer = 0;

      const spawnCount = 200;

      for (let i = 0; i < spawnCount; i++) {
        const angle = s.angle;
        const len = s.len;

        const t = Math.random();
        const along = t * len;

        const bx = Math.cos(s.angle);
        const by = Math.sin(s.angle);
        const nx = Math.cos(s.angle + Math.PI / 2);
        const ny = Math.sin(s.angle + Math.PI / 2);

        const forward = dir >= 0 ? 1 : -1;
        const edgeSide = Math.random() < 0.5 ? -1 : 1;
        const trailingOffset = (s.w / 2) * forward * edgeSide;
        const leadingOffset = (s.w / 1.5) * forward * edgeSide;
        const isLeading = Math.random() < 0.35;
        const spread = isLeading ? leadingOffset : trailingOffset;

        const px = s.cx + bx * along + nx * spread;
        const py = s.cy + by * along + ny * spread;

        s.particles.push({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * (s.t > 5 ? 1000 : 100),
          vy: (Math.random() - 0.5) * (s.t > 5 ? 1000 : 100),
          r: Math.random() * 40,
          t: 0,
          life: 0.25 + Math.random() * 0.25,
          active: true,
        });
      }
    }

    if (s.t >= 5) {
      const cos = Math.cos(-s.angle);
      const sin = Math.sin(-s.angle);

      const mx = mouse.x - s.cx;
      const my = mouse.y - s.cy;

      const rx = mx * cos - my * sin;
      const ry = mx * sin + my * cos;

      if (Math.abs(rx) < s.len && Math.abs(ry) < s.w / 2) {
        death("Celestial");
      }
    }

    for (const p of s.particles) {
      p.t += dt;

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += dt * 5;

      if (p.t > p.life) {
        p.active = false;
      }

      const dx = p.x - s.cx;
      const dy = p.y - s.cy;

      const cos = Math.cos(-s.angle);
      const sin = Math.sin(-s.angle);
      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;

      const halfLen = s.len;
      const halfW = s.w / 2 + 100;

      if (Math.abs(rx) > halfLen || Math.abs(ry) > halfW) {
        p.active = false;
      }
    }
    compact(s.particles);

    if (s.t >= 5 && s.t < 21) {
      s.w = Math.random() * 50 + 575;
    }
    if (s.t >= 21) {
      s.w -= dt * 1000;
      if (s.w <= 0) s.active = false;
    }
  }
  function drawDeathInBloom(ctx) {
    const s = stateDeathInBloom;
    if (!s.active) return;

    for (const p of s.particles) {
      ctx.save();

      ctx.globalAlpha = (s.t > 5 ? 1 : 0.2) * (s.t < 0.25 ? s.t * 4 : 1);

      ctx.strokeStyle = "magenta";
      ctx.lineWidth = 18;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    ctx.save();

    ctx.translate(s.cx, s.cy);
    ctx.rotate(s.angle);

    const dx = mouse.x - s.cx;
    const dy = mouse.y - s.cy;

    const cos = Math.cos(-s.angle);
    const sin = Math.sin(-s.angle);

    const rx = dx * cos - dy * sin;
    const x = rx - BEAM_RADIUS;
    const len = BEAM_RADIUS * 2;

    const isLethal = s.t >= 5;

    if (!isLethal) {
      ctx.globalAlpha = 0.25 * (s.t < 0.25 ? s.t * 4 : 1);
      ctx.fillStyle = "magenta";
    } else {
      ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);

      ctx.strokeStyle = "magenta";
      ctx.lineWidth = 18 * (Math.random() + 2);

      ctx.beginPath();
      ctx.rect(Math.max(x, 0), -s.w / 2, len, s.w);
      ctx.stroke();

      ctx.fillStyle = "black";
    }

    const edgeOffset = s.w / 2;
    const glowSize = 400;

    ctx.save();
    ctx.globalAlpha =
      (isLethal ? Math.random() * 0.25 + 0.5 : 0.05) *
      (s.t < 0.25 ? s.t * 4 : 1);

    let grad = ctx.createLinearGradient(
      0,
      -edgeOffset - glowSize,
      0,
      -edgeOffset,
    );
    grad.addColorStop(0, "rgba(255,0,255,0)");
    grad.addColorStop(1, "magenta");

    ctx.fillStyle = grad;
    ctx.fillRect(Math.max(x, 0), -edgeOffset - glowSize, len, glowSize);

    let grad2 = ctx.createLinearGradient(
      0,
      edgeOffset,
      0,
      edgeOffset + glowSize,
    );
    grad2.addColorStop(0, "magenta");
    grad2.addColorStop(1, "rgba(255,0,255,0)");

    ctx.fillStyle = grad2;
    ctx.fillRect(Math.max(x, 0), edgeOffset, len, glowSize);

    ctx.restore();

    ctx.restore();
  }
  function drawDeathInBloomFront(ctx) {
    const s = stateDeathInBloom;
    if (!s.active) return;

    ctx.save();

    ctx.translate(s.cx, s.cy);
    ctx.rotate(s.angle);

    const dx = mouse.x - s.cx;
    const dy = mouse.y - s.cy;

    const cos = Math.cos(-s.angle);
    const sin = Math.sin(-s.angle);

    const rx = dx * cos - dy * sin;
    const x = rx - BEAM_RADIUS;
    const len = BEAM_RADIUS * 2;

    const isLethal = s.t >= 5;

    if (!isLethal) {
      ctx.globalAlpha = 0.25 * (s.t < 0.25 ? s.t * 4 : 1);
      ctx.fillStyle = "magenta";
    } else {
      ctx.globalAlpha = 1 * (s.t < 0.25 ? s.t * 4 : 1);
      ctx.fillStyle = "black";
    }

    const edgeOffset = s.w / 2;
    const glowSize = 400;

    ctx.save();
    ctx.globalAlpha = (isLethal ? 0.25 : 0) * (s.t < 0.25 ? s.t * 4 : 1);
    ctx.fillStyle = "magenta";
    const w = s.w * (Math.random() + 1);
    ctx.fillRect(Math.max(x, 0), -w / 2, len, w);
    ctx.restore();
    ctx.fillRect(Math.max(x, 0), -s.w / 2, len, s.w);
    if (isLethal) {
      ctx.globalAlpha = 0.1 * (s.t < 0.25 ? s.t * 4 : 1);
      ctx.fillStyle = "magenta";
      ctx.rotate(Math.PI);
      ctx.fillRect(Math.max(x, 0), -s.w / 2, len, s.w);
    }

    ctx.restore();
    for (const p of s.particles) {
      ctx.save();

      ctx.globalAlpha = (s.t > 5 ? 1 : 0.2) * (s.t < 0.25 ? s.t * 4 : 1);
      ctx.fillStyle = "black";

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    if (state.enemyTransition == "none") state.patternTime += dt;
    if (state.patternTime >= state.currentPattern.duration) {
      state.patternIndex++;

      if (state.patternIndex >= state.loopPattern.length) {
        state.patternIndex = 0;

        if (phase.phase === 1) {
          phase.phase = 2;
          state.loopPattern = loopPatternPhase2;
        } else if (phase.phase === 2) {
          phase.phase = 3;
          state.loopPattern = loopPatternPhase3;
        }
      }

      state.currentPattern = state.loopPattern[state.patternIndex];
      state.patternTime = 0;
      state.currentPattern.enter?.();
    }

    state.layer++;
    if (state.layer > state.layers.length) state.layer = 1;
    state.enemy = state.layers[state.layer - 1];

    if (state.enemyTransition == "none") {
      state.enemyT += dt;
      if (state.enemyMode === "orbit") {
        state.enemyT += dt;

        if (state.enemyT >= 1) {
          state.enemyT = 0;
          const angDir =
            state.lastAng >= 0
              ? Math.random() <= 0.9
                ? 0.5
                : -0.5
              : Math.random() <= 0.9
                ? -0.5
                : 0.5;
          state.ang += angDir;
          state.lastAng = angDir;
        }

        const dist = 600;

        const targetX = mouse.x + Math.cos(state.ang) * dist;
        const targetY = mouse.y + Math.sin(state.ang) * dist;

        const dx = targetX - state.enemyX;
        const dy = targetY - state.enemyY;

        const ease = 1;

        state.enemyX += dx * ease * dt;
        state.enemyY += dy * ease * dt;

        const px = state.enemyX - mouse.x;
        const py = state.enemyY - mouse.y;

        const len = Math.hypot(px, py) || 1;

        state.enemyX = mouse.x + (px / len) * dist;
        state.enemyY = mouse.y + (py / len) * dist;
      }
      if (state.enemyMode === "fixed") {
        const dx = state.enemyFixed.x - state.enemyX;
        const dy = state.enemyFixed.y - state.enemyY;
      }
    }

    if (state.enemyTransition != "none") state.enemyTransitionT += dt;
    if (state.enemyTransition == "shrink") {
      const p = state.enemyTransitionT * 2;
      const eased = p * p;

      state.enemyScale = 1 - eased;

      if (p >= 1) {
        if (state.enemyMode === "fixed") {
          state.enemyX = state.enemyFixed.x;
          state.enemyY = state.enemyFixed.y;
        } else if (state.enemyMode === "orbit") {
          state.enemyX = mouse.x + 600;
          state.enemyY = mouse.y;
        }
        state.enemyTransitionT = 0;
        state.enemyTransition = "grow";
      }
    } else if (state.enemyTransition == "grow") {
      const p = state.enemyTransitionT * 2;
      const eased = 1 - (1 - p) * (1 - p);

      state.enemyScale = eased;

      if (p >= 1) {
        state.enemyTransition = "none";
        state.enemyScale = 1;
      }
    }

    for (let i = 0; i < 2; i++) {
      state.enemyTrail.push({
        x: state.enemyX + (Math.random() - 0.5) * 350,
        y: state.enemyY + (Math.random() - 0.5) * 350,
        r: 100,
      });
    }
    for (const t of state.enemyTrail) {
      t.r -= 3.333;
    }
    state.enemyTrail = state.enemyTrail.filter((t) => t.r > 0);

    if (state.enemyTransition == "none") state.currentPattern.update(dt);
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    if (state.enemyTransition == "none") state.currentPattern.draw(ctx);

    for (const t of state.enemyTrail) {
      ctx.save();
      ctx.translate(t.x, t.y);

      const glowSize = 100;
      const glow = ctx.createRadialGradient(0, 0, t.r, 0, 0, t.r + glowSize);
      glow.addColorStop(0, "rgba(255,0,255,0.5)");
      glow.addColorStop(1, "rgba(255,0,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, t.r + glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, t.r, 0, Math.PI * 2);
      ctx.strokeStyle = "magenta";
      ctx.lineWidth = 18;
      ctx.stroke();

      ctx.restore();
    }
    for (const t of state.enemyTrail) {
      ctx.save();
      ctx.translate(t.x, t.y);

      ctx.beginPath();
      ctx.arc(0, 0, t.r, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();

      ctx.restore();
    }

    if (state.enemyTransition == "none") state.currentPattern.drawFront(ctx);

    ctx.save();
    ctx.translate(state.enemyX, state.enemyY);
    const size = 700 * state.enemyScale;
    ctx.drawImage(state.enemy, -size / 2, -size / 2, size, size);
    ctx.restore();

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
