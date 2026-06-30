import { death, mouse } from "../entityHost.js";

export function setup(host) {
  const state = {
    opacity: 1,

    currentPattern: {
      name: "Init",
    },
    patternTime: 0,
  };
  const burst = {
    x: 0,
    y: 0,
    timer: 0,
    ringRot: 0,
    ringSpeed: 0.8,
    particles: [],
  };

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  let p1 = {
    origin: { x: 0, y: 0 },
    bullets: [],
    rotationDir: 1,
  };
  function enterPattern1() {
    p1.bullets.length = 0;

    p1.origin.x = burst.x;
    p1.origin.y = burst.y;

    p1.rotationDir = Math.random() < 0.5 ? -1 : 1;

    const speed = 440;
    const count = 20;

    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      p1.bullets.push({
        x: p1.origin.x,
        y: p1.origin.y,
        baseAngle: a,
        angle: a,
        speed,
        radius: 20,
        life: 0,
        maxLife: 3,
        trail: [],
      });
    }
  }
  function updatePattern1(dt) {
    const turnRate = 2.5;

    for (let b of p1.bullets) {
      b.life += dt;
      b.speed += 40;

      b.angle = b.baseAngle + p1.rotationDir * b.life * 1.5;

      b.x += Math.cos(b.angle) * b.speed * dt;
      b.y += Math.sin(b.angle) * b.speed * dt;

      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 12) b.trail.shift();

      if (dist(b, mouse) < b.radius) {
        death();
      }
    }

    p1.bullets = p1.bullets.filter((b) => b.life < b.maxLife);
  }
  function drawPattern1(ctx) {
    for (let b of p1.bullets) {
      if (b.trail) {
        for (let i = 0; i < b.trail.length; i++) {
          const t = b.trail[i];
          const alpha = i / b.trail.length;

          ctx.beginPath();
          ctx.arc(t.x, t.y, b.radius * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,154,0,${alpha * 0.5})`;
          ctx.fill();
        }
      }

      ctx.beginPath();
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
      grad.addColorStop(0, "#ff9a00");
      grad.addColorStop(1, "#ffff00");
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  let p2 = {
    origin: { x: 0, y: 0 },
    bullets: [],
    rotationDir: 1,
  };
  function enterPattern2() {
    p2.bullets.length = 0;

    p2.origin.x = burst.x;
    p2.origin.y = burst.y;

    p2.rotationDir = Math.random() < 0.5 ? -1 : 1;

    const speed = 440;
    const count = 20;
    const quadrantRotation = (Math.floor(Math.random() * 8) * Math.PI) / 4;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const rotated = (a + quadrantRotation) % (Math.PI * 2);

      const quadrant =
        (rotated >= 0 && rotated < Math.PI / 2) ||
        (rotated >= Math.PI && rotated < Math.PI * 1.5)
          ? 1
          : -1;

      const nearestCardinal =
        Math.round(rotated / (Math.PI / 2)) * (Math.PI / 2);
      const offset = Math.abs(rotated - nearestCardinal);

      const strength = Math.sin(offset * 2);

      const curve = quadrant * strength;

      p2.bullets.push({
        x: p2.origin.x,
        y: p2.origin.y,
        angle: a,
        speed,
        curve,
        radius: 20,
        life: 0,
        maxLife: 3,
        trail: [],
      });
    }
  }
  function updatePattern2(dt) {
    for (const b of p2.bullets) {
      b.life += dt;
      b.speed += 40;

      b.angle += b.curve * 1.5 * dt;

      b.x += Math.cos(b.angle) * b.speed * dt;
      b.y += Math.sin(b.angle) * b.speed * dt;

      b.trail.push({ x: b.x, y: b.y });
      while (b.trail.length > 12) b.trail.shift();

      if (dist(b, mouse) < b.radius) {
        death();
      }
    }

    p2.bullets = p2.bullets.filter((b) => b.life < b.maxLife);
  }
  function drawPattern2(ctx) {
    for (let b of p2.bullets) {
      if (b.trail) {
        for (let i = 0; i < b.trail.length; i++) {
          const t = b.trail[i];
          const alpha = i / b.trail.length;

          ctx.beginPath();
          ctx.arc(t.x, t.y, b.radius * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(39,167,216,${alpha * 0.5})`;
          ctx.fill();
        }
      }

      ctx.beginPath();
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
      grad.addColorStop(0, "#27a7d8");
      grad.addColorStop(1, "#27ffff");
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  function resetPattern() {
    state.patternTime = 0;

    if (state.currentPattern.name == "Init") {
      state.currentPattern =
        Math.random() < 0.5
          ? {
              duration: 3,
              name: "Blue",
              update: updatePattern2,
              draw: drawPattern2,
              enter: enterPattern2,
            }
          : {
              duration: 3,
              name: "Yellow",
              update: updatePattern1,
              draw: drawPattern1,
              enter: enterPattern1,
            };
    } else if (state.currentPattern.name == "Yellow") {
      state.currentPattern = {
        duration: 3,
        name: "Blue",
        update: updatePattern2,
        draw: drawPattern2,
        enter: enterPattern2,
      };
    } else {
      state.currentPattern = {
        duration: 3,
        name: "Yellow",
        update: updatePattern1,
        draw: drawPattern1,
        enter: enterPattern1,
      };
    }

    const angle = Math.random() * Math.PI * 2;
    burst.x = mouse.x + Math.cos(angle) * 600;
    burst.y = mouse.y + Math.sin(angle) * 600;

    burst.timer = 0;
    burst.ringRot = 0;
    burst.ringSpeed = 0.8;
    burst.particles.length = 0;

    state.currentPattern.enter?.();
  }

  resetPattern();

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.patternTime += dt;

    if (state.patternTime >= state.currentPattern.duration + 2) {
      resetPattern();
    }

    burst.timer += dt;
    burst.ringSpeed += dt * 4;
    burst.ringRot += burst.ringSpeed * dt;
    const a = Math.random() * Math.PI * 2;
    const r = 260 + Math.random() * 120;
    burst.particles.push({
      x: burst.x + Math.cos(a) * r,
      y: burst.y + Math.sin(a) * r,
      color: Math.random() < 0.5 ? "#ffff00" : "#27ffff",
      alpha: 0,
    });
    for (const p of burst.particles) {
      const dx = burst.x - p.x;
      const dy = burst.y - p.y;
      const d = Math.hypot(dx, dy);

      const speed = 480;

      p.x += (dx / d) * speed * dt;
      p.y += (dy / d) * speed * dt;

      p.alpha = 1 - d / 380;

      if (d < 10) {
        const a = Math.random() * Math.PI * 2;
        const r = 260 + Math.random() * 120;

        p.x = burst.x + Math.cos(a) * r;
        p.y = burst.y + Math.sin(a) * r;
        p.color =
          Math.random() < (state.currentPattern.name == "Yellow" ? 0.9 : 0.1)
            ? "#ffff00"
            : "#27ffff";
      }
    }

    if (state.patternTime >= 2) state.currentPattern.update(dt);
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();

    ctx.save();
    const grow =
      burst.timer < 2
        ? Math.min(burst.timer / 2, 1)
        : Math.max(0, (2.5 - burst.timer) * 2);
    const scale = 1 - Math.pow(1 - grow, 3);
    ctx.translate(burst.x, burst.y);
    ctx.scale(scale, scale);
    ctx.save();
    ctx.rotate(burst.ringRot);
    ctx.scale(0.25, 1);
    ctx.beginPath();
    ctx.arc(0, 0, 100, 0, Math.PI * 2);
    ctx.strokeStyle = "#27ffff";
    ctx.lineWidth = 14;
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.rotate(-burst.ringRot * 1.2);
    ctx.scale(1, 0.25);
    ctx.beginPath();
    ctx.arc(0, 0, 100, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 14;
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(30, 30 + (burst.timer - 2) * 100), 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    for (const p of burst.particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.beginPath();
      ctx.arc(p.x - burst.x, p.y - burst.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.globalAlpha =
      state.patternTime >= 4.75 ? (5 - state.patternTime) * 4 : 1;

    if (state.patternTime >= 2) state.currentPattern.draw(ctx);

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
