import { death, mouse } from "../entityHost.js";

const enemy = new Image();
function loadAssets() {
  enemy.src = "./ASSET/Enemies/Bell.png";
}

export function setup(host) {
  loadAssets();
  const state = {
    opacity: 1,
    //state
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    //process
  }

  function draw(ctx) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;

    ctx.save();
    ctx.globalAlpha = state.opacity;

    //draw

    ctx.restore();
  }

  const unregister = host.register({ update, draw });
  return unregister;
}
