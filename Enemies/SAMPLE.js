import { mouse, attachMouseListener } from "../entityHost.js";

const enemy = new Image();
enemy.src = "./ASSET/Enemies/Bell.png";

export function setup(host) {
  const state = {
    opacity: 1,
    //state
  };

  attachMouseListener(host.canvas);

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    //process
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = state.opacity;

    //draw

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
