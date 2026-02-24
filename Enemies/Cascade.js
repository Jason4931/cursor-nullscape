import { death, mouse } from "../entityHost.js";

export function setup(host) {
  const state = {
    opacity: 1,

    currentPattern: {
      duration: 3,
      update: updatePattern1,
      draw: drawPattern1,
      enter: enterPattern1,
    },
    patternTime: 0,

    ellipseTimer: 0,
    ellipses: [],
  };

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  let p1 = {
    origin: { x: 0, y: 0 },
    bullets: [],
    cyanSpawnTimer: 0,
    cyanSpawned: 0,
    rotationDir: 1,
  };
  function enterPattern1() {
    p1.bullets.length = 0;
    p1.cyanSpawnTimer = 0;
    p1.cyanSpawned = 0;

    const angle = Math.random() * Math.PI * 2;
    p1.origin.x = mouse.x + Math.cos(angle) * 600;
    p1.origin.y = mouse.y + Math.sin(angle) * 600;

    p1.rotationDir = Math.random() < 0.5 ? -1 : 1;

    const speed = 440;
    const count = 20;

    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      p1.bullets.push({
        type: "yellow",
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
    const cyanSpeed = 880;
    const turnRate = 2.5;

    if (p1.cyanSpawned < 20) {
      p1.cyanSpawnTimer += dt;
      const spawnInterval = 1 / 20;

      while (p1.cyanSpawnTimer >= spawnInterval && p1.cyanSpawned < 20) {
        p1.cyanSpawnTimer -= spawnInterval;
        p1.cyanSpawned++;

        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetDist = Math.random() * 80;

        const x = p1.origin.x + Math.cos(offsetAngle) * offsetDist;
        const y = p1.origin.y + Math.sin(offsetAngle) * offsetDist;

        const dx = mouse.x - x;
        const dy = mouse.y - y;
        const len = Math.hypot(dx, dy) || 1;

        p1.bullets.push({
          type: "cyan",
          x,
          y,
          vx: (dx / len) * cyanSpeed,
          vy: (dy / len) * cyanSpeed,
          speed: cyanSpeed,
          radius: 10,
          life: 0,
          maxLife: 3,
          trail: [],
        });
      }
    }

    for (let b of p1.bullets) {
      b.life += dt;
      b.speed += 40;

      if (b.type === "yellow") {
        b.angle = b.baseAngle + p1.rotationDir * b.life * 1.5;

        b.x += Math.cos(b.angle) * b.speed * dt;
        b.y += Math.sin(b.angle) * b.speed * dt;
      } else {
        const dx = mouse.x - b.x;
        const dy = mouse.y - b.y;

        const targetAngle = Math.atan2(dy, dx);
        const currentAngle = Math.atan2(b.vy, b.vx);

        let diff = targetAngle - currentAngle;

        diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;

        const maxTurn = turnRate * dt;
        const newAngle =
          currentAngle + Math.max(-maxTurn, Math.min(maxTurn, diff));

        b.vx = Math.cos(newAngle) * b.speed;
        b.vy = Math.sin(newAngle) * b.speed;

        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 12) b.trail.shift();

      if (dist(b, mouse) < b.radius) {
        death();
      }
    }

    const cyan = p1.bullets.filter((b) => b.type === "cyan");

    for (let i = 0; i < cyan.length; i++) {
      for (let j = i + 1; j < cyan.length; j++) {
        const a = cyan[i];
        const b = cyan[j];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;

        if (d > 0 && d < minDist) {
          const overlap = (minDist - d) / 2;
          const nx = dx / d;
          const ny = dy / d;

          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
        }
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
          ctx.fillStyle =
            b.type === "yellow"
              ? `rgba(255,255,120,${alpha * 0.6})`
              : `rgba(120,255,255,${alpha * 0.6})`;
          ctx.fill();
        }
      }

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

      if (b.type === "yellow") {
        ctx.fillStyle = "#fff7aa";
      } else {
        ctx.fillStyle = "#ccffff";
      }

      ctx.fill();
    }
  }

  function resetPattern() {
    state.patternTime = 0;
    state.currentPattern.enter?.();
  }

  resetPattern();

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    state.patternTime += dt;

    if (state.patternTime >= state.currentPattern.duration) {
      resetPattern();
    }

    state.ellipseTimer += dt;

    const spawnInterval = 0.333;
    const speed = 1800;

    while (state.ellipseTimer >= spawnInterval) {
      state.ellipseTimer -= spawnInterval;

      const angle = Math.random() * Math.PI * 2;
      const x = mouse.x + Math.cos(angle) * 2500;
      const y = mouse.y + Math.sin(angle) * 2500;

      const dx = mouse.x - x;
      const dy = mouse.y - y;
      const len = Math.hypot(dx, dy) || 1;

      const dirX = dx / len;
      const dirY = dy / len;

      state.ellipses.push({
        x,
        y,
        vx: dirX * speed,
        vy: dirY * speed,
        angle: Math.atan2(dirY, dirX),
        life: 0,
        maxLife: 3,
        width: 80,
        height: 6,
      });
    }

    for (let e of state.ellipses) {
      e.life += dt;
      e.x += e.vx * dt;
      e.y += e.vy * dt;

      const dx = mouse.x - e.x;
      const dy = mouse.y - e.y;
      if (Math.hypot(dx, dy) < e.height) {
        death();
      }
    }

    state.ellipses = state.ellipses.filter((e) => e.life < e.maxLife);

    state.currentPattern.update(dt);
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    for (let e of state.ellipses) {
      ctx.save();

      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);

      ctx.beginPath();
      ctx.ellipse(0, 0, e.width, e.height, 0, 0, Math.PI * 2);

      ctx.fillStyle = "#ffffff";
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#aeefff";
      ctx.stroke();

      ctx.restore();
    }

    state.currentPattern.draw(ctx);

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
