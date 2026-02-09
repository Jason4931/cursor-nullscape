import { death } from "../entityHost.js";
import { isCursorOnFloor, getCameraPos } from "../main.js";

export function setup(host, enableVoid) {
  const state = {
    offFloorTime: 0,
  };

  function update(dt) {
    if (!isCursorOnFloor()) {
      state.offFloorTime += dt;
      if (state.offFloorTime >= (enableVoid ? 6 : 60)) {
        death("Void");
      }
    } else {
      state.offFloorTime = 0;
    }
  }

  function draw(ctx) {
    const cam = getCameraPos();
    const limit = enableVoid ? 6 : 60;

    const progress = Math.min(state.offFloorTime / limit, 1);
    const alpha = progress * 0.5;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = "black";
    ctx.fillRect(cam.x, cam.y, window.innerWidth, window.innerHeight);

    ctx.restore();
  }
  const unregister = host.register({ update, draw });
  return unregister;
}
