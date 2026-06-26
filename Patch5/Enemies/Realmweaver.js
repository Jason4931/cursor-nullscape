import { death, mouse } from "../entityHost.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Realmweaver.png";

export function setup(host) {
  const state = {
    opacity: 1,
    w: 2000,
    h: 600,
    x: Math.random() * host.canvas.width,
    y: Math.random() * host.canvas.width,
    timer: 0,
    angle: Math.random() * Math.PI * 2,
    targetAngle: null,
    speed: 5,
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    state.timer += dt;
    if (state.targetAngle == null) state.targetAngle = state.angle;
    if (state.timer >= 1) {
      state.timer = 0;
      state.targetAngle += Math.random() - 0.5;
    }
    const diff = Math.atan2(
      Math.sin(state.targetAngle - state.angle),
      Math.cos(state.targetAngle - state.angle),
    );
    state.angle += diff * 0.01;
    state.x += Math.cos(state.angle) * state.speed;
    state.y += Math.sin(state.angle) * state.speed;
    const halfW = state.w / 2;
    const halfH = state.h / 2;
    state.x = Math.max(halfW, Math.min(host.canvas.width - halfW, state.x));
    state.y = Math.max(halfH, Math.min(host.canvas.height - halfH, state.y));

    const dx = mouse.x - state.x;
    const dy = mouse.y - state.y;
    const cos = Math.cos(-state.angle);
    const sin = Math.sin(-state.angle);
    let localX = dx * cos - dy * sin;
    let localY = dx * sin + dy * cos;
    if (Math.cos(state.angle) < 0) {
      localY = -localY;
    }
    if (Math.abs(localX) <= halfW && Math.abs(localY) <= halfH * 0.5) {
      death("Realmweaver");
    }
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    ctx.translate(state.x, state.y);
    const facingLeft = Math.cos(state.angle) < 0;
    if (facingLeft) {
      ctx.scale(-1, 1);
    }
    ctx.rotate(facingLeft ? Math.PI - state.angle : state.angle);
    ctx.drawImage(enemy, -state.w / 2, -state.h / 2, state.w, state.h);

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
