import { death, mouse } from "../entityHost.js";

export function setup(host) {
  const loopPattern = [
    {
      duration: 6,
      update: updateFall,
      draw: drawFall,
      enter: enterFall,
    },
    // {
    //   duration: 3,
    //   update: updateImplosion,
    //   draw: drawImplosion,
    //   enter: enterImplosion,
    // },
    {
      duration: 9,
      update: updatePizzaCutter,
      draw: drawPizzaCutter,
      enter: enterPizzaCutter,
    },
    {
      duration: 3,
      update: updateCrumble,
      draw: drawCrumble,
      enter: enterCrumble,
    },
    {
      duration: 3,
      update: updateCease,
      draw: drawCease,
      enter: enterCease,
    },
    {
      duration: 22,
      update: updateDeathInBloom,
      draw: drawDeathInBloom,
      enter: enterDeathInBloom,
    },
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
  };

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
  function spawnCircle() {
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
      targetR: 150,
      active: true,
    };
  }
  let lastPizzaAngle = Math.random() * Math.PI * 2;
  function spawnPizza() {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const rand = Math.random() * 0.7 + 0.3;
    const jitter = ((Math.random() < 0.5 ? rand : -rand) * Math.PI) / 6;
    const base = lastPizzaAngle + jitter;
    lastPizzaAngle = base;

    return {
      x: statePizzaCutter.cx,
      y: statePizzaCutter.cy,
      t: 0,
      dir,
      startAngle: base + (Math.random() < 0.5 ? Math.PI : -Math.PI),
      targetAngle: base,
      active: true,
      offset: 0,
    };
  }

  const stateFall = {
    beams: [],
    timer: 0,
    cycle: 0,
  };
  function enterFall() {
    stateFall.beams = [];
    stateFall.timer = 0;
    stateFall.cycle = 0;
  }
  function updateFall(dt) {
    if (stateFall.timer === 0) {
      if (stateFall.cycle === 3) {
        const base = Math.random() * Math.PI * 2;
        const spread = Math.PI / 6;

        stateFall.beams.push(spawnBeam(mouse.x, mouse.y, base, 1.5));
        stateFall.beams.push(spawnBeam(mouse.x, mouse.y, base - spread, 1.5));
        stateFall.beams.push(spawnBeam(mouse.x, mouse.y, base + spread, 1.5));
      } else if (stateFall.cycle < 3) {
        stateFall.beams.push(spawnBeam(mouse.x, mouse.y, undefined, 1));
      }
    }

    stateFall.timer += dt;

    const durations = [1, 1, 1, 2];

    if (stateFall.timer >= durations[stateFall.cycle]) {
      stateFall.timer = 0;
      stateFall.cycle = stateFall.cycle + 1;
    }

    for (const b of stateFall.beams) {
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

      const cos = Math.cos(-b.angle);
      const sin = Math.sin(-b.angle);

      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;

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

    stateFall.beams = stateFall.beams.filter((b) => b.active);
  }
  function drawFall(ctx) {
    for (const b of stateFall.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);
      let a = b.angle;
      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }
      ctx.rotate(a);

      const alpha = b.t < b.armTime ? 0.5 : 1;

      ctx.globalAlpha = alpha;
      if (b.t < b.armTime) {
        ctx.strokeStyle = "transparent";
      } else {
        ctx.strokeStyle = "magenta";
      }
      ctx.lineWidth = 18;

      ctx.strokeRect(-10000, -b.width / 2, 20000, b.width);

      ctx.restore();
    }
    for (const b of stateFall.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);
      let a = b.angle;
      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }
      ctx.rotate(a);

      const alpha = b.t < b.armTime ? 0.5 : 1;

      ctx.globalAlpha = alpha;
      if (b.t < b.armTime) {
        ctx.fillStyle = "magenta";
      } else {
        ctx.fillStyle = "black";
      }

      ctx.fillRect(-10000, -b.width / 2, 20000, b.width);

      ctx.restore();
    }
  }

  const stateImplosion = {};
  function enterImplosion() {}
  function updateImplosion(dt) {}
  function drawImplosion(ctx) {}

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
    statePizzaCutter.cx = mouse.x + (Math.random() - 0.5) * 1000;
    statePizzaCutter.cy = mouse.y + (Math.random() - 0.5) * 1000;
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
        const w = 100;

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
        s.offset += dt * 5000;
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

        const w = 100;
        const len = 20000;

        if (isLethal) {
          ctx.strokeStyle = "magenta";
          ctx.lineWidth = 18;

          ctx.beginPath();
          ctx.rect(s.offset, -w / 2, len, w);
          ctx.stroke();
        } else if (i < 4) {
          ctx.globalAlpha = s.t < 0.5 ? s.t * 1.5 : 0.75;

          const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
          grad.addColorStop(0, "rgba(255,0,255,0)");
          grad.addColorStop(0.45, "magenta");
          grad.addColorStop(0.55, "magenta");
          grad.addColorStop(1, "rgba(255,0,255,0)");

          ctx.fillStyle = grad;
          ctx.fillRect(-len / 2, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
    for (const s of statePizzaCutter.spokes) {
      ctx.save();

      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      const isLethal = s.t >= 2;

      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);

        const w = 100;
        const len = 20000;

        if (isLethal) {
          ctx.beginPath();
          ctx.fillStyle = "black";
          ctx.fillRect(s.offset, -w / 2, len, w);
        }
      }

      ctx.restore();
    }
  }

  const stateCrumble = {
    circles: [],
    spawnTimer: 0,
  };
  function enterCrumble() {
    stateCrumble.circles = [];
    for (let i = 0; i < 300; i++) {
      stateCrumble.circles.push(spawnCircle());
    }
    stateCrumble.spawnTimer = 0;
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

    stateCrumble.circles = stateCrumble.circles.filter((c) => c.active);
  }
  function drawCrumble(ctx) {
    for (const c of stateCrumble.circles) {
      ctx.save();

      ctx.translate(c.x, c.y);

      const alpha = c.t < 2 ? 0.5 : 1;
      ctx.globalAlpha = alpha;

      if (c.t >= 2) {
        ctx.strokeStyle = "magenta";
        ctx.lineWidth = 18;

        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
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
      } else {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
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
  };
  function enterCease() {
    stateCease.beams = [];
    stateCease.timer = 0;
    stateCease.rapidTimer = 0;
    stateCease.circle = {
      t: 0,
      active: true,
      x: mouse.x,
      y: mouse.y,
    };
  }
  function updateCease(dt) {
    stateCease.timer += dt;
    stateCease.rapidTimer += dt;

    const interval = 0.5 / 40;
    while (stateCease.rapidTimer >= interval && stateCease.timer < 0.5) {
      stateCease.rapidTimer -= interval;

      stateCease.beams.push(
        spawnBeam(
          mouse.x + (Math.random() - 0.5) * 5000,
          mouse.y + (Math.random() - 0.5) * 5000,
          Math.random() * Math.PI * 2,
          2 - stateCease.timer,
        ),
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

      const cos = Math.cos(-b.angle);
      const sin = Math.sin(-b.angle);

      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;

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

    stateCease.beams = stateCease.beams.filter((b) => b.active);
  }
  function drawCease(ctx) {
    for (const b of stateCease.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);
      let a = b.angle;
      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }
      ctx.rotate(a);

      const alpha = b.t < b.armTime ? 0.5 : 1;

      ctx.globalAlpha = alpha;
      if (b.t < b.armTime) {
        ctx.strokeStyle = "transparent";
      } else {
        ctx.strokeStyle = "magenta";
      }
      ctx.lineWidth = 18;

      ctx.strokeRect(-10000, -b.width / 2, 20000, b.width);

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
        ctx.fillStyle = "black";
        ctx.strokeStyle = "magenta";
        ctx.lineWidth = 18;

        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
      }

      ctx.restore();
    }
    for (const b of stateCease.beams) {
      ctx.save();

      ctx.translate(b.x, b.y);
      let a = b.angle;
      if (b.t < 0.5) {
        const p = b.t / 0.5;
        const eased = 1 - (1 - p) * (1 - p);
        a = b.startAngle + (b.angle - b.startAngle) * eased;
      }
      ctx.rotate(a);

      const alpha = b.t < b.armTime ? 0.5 : 1;

      ctx.globalAlpha = alpha;
      if (b.t < b.armTime) {
        ctx.fillStyle = "magenta";
      } else {
        ctx.fillStyle = "black";
      }

      ctx.fillRect(-10000, -b.width / 2, 20000, b.width);

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

    s.cx = mouse.x + (Math.random() - 0.5) * 1000;
    s.cy = mouse.y + (Math.random() - 0.5) * 1000;
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
    s.particles = s.particles.filter((p) => p.active);

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

      ctx.globalAlpha = (s.t > 5 ? 0.8 : 0.2) * (s.t < 0.5 ? s.t * 2 : 1);

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

    const isLethal = s.t >= 5;

    if (!isLethal) {
      ctx.globalAlpha = 0.25 * (s.t < 0.5 ? s.t * 2 : 1);
      ctx.fillStyle = "magenta";
    } else {
      ctx.globalAlpha = 1 * (s.t < 0.5 ? s.t * 2 : 1);

      ctx.strokeStyle = "magenta";
      ctx.lineWidth = 18 * (Math.random() + 2);

      ctx.beginPath();
      ctx.rect(0, -s.w / 2, s.len, s.w);
      ctx.stroke();

      ctx.fillStyle = "black";
    }

    const edgeOffset = s.w / 2;
    const glowSize = 400;

    ctx.save();
    ctx.globalAlpha =
      (isLethal ? Math.random() * 0.25 + 0.5 : 0.05) *
      (s.t < 0.5 ? s.t * 2 : 1);

    let grad = ctx.createLinearGradient(
      0,
      -edgeOffset - glowSize,
      0,
      -edgeOffset,
    );
    grad.addColorStop(0, "rgba(255,0,255,0)");
    grad.addColorStop(1, "magenta");

    ctx.fillStyle = grad;
    ctx.fillRect(0, -edgeOffset - glowSize, s.len, glowSize);

    let grad2 = ctx.createLinearGradient(
      0,
      edgeOffset,
      0,
      edgeOffset + glowSize,
    );
    grad2.addColorStop(0, "magenta");
    grad2.addColorStop(1, "rgba(255,0,255,0)");

    ctx.fillStyle = grad2;
    ctx.fillRect(0, edgeOffset, s.len, glowSize);

    ctx.restore();

    ctx.save();
    ctx.globalAlpha = (isLethal ? 0.25 : 0) * (s.t < 0.5 ? s.t * 2 : 1);
    ctx.fillStyle = "magenta";
    const w = s.w * (Math.random() + 1);
    ctx.fillRect(0, -w / 2, s.len, w);
    ctx.restore();
    ctx.fillRect(0, -s.w / 2, s.len, s.w);
    if (isLethal) {
      ctx.globalAlpha = 0.1 * (s.t < 0.5 ? s.t * 2 : 1);
      ctx.fillStyle = "magenta";
      ctx.rotate(Math.PI);
      ctx.fillRect(0, -s.w / 2, s.len, s.w);
    }

    ctx.restore();
    for (const p of s.particles) {
      ctx.save();

      ctx.globalAlpha =
        (s.t > 5 ? Math.random * 0.8 : 0.2) * (s.t < 0.5 ? s.t * 2 : 1);
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

    state.patternTime += dt;
    if (state.patternTime >= state.currentPattern.duration) {
      state.currentPattern =
        loopPattern[
          (loopPattern.indexOf(state.currentPattern) + 1) % loopPattern.length
        ];
      state.patternTime = 0;
      state.currentPattern.enter?.();
    }

    state.currentPattern.update(dt);
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    state.currentPattern.draw(ctx);

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
