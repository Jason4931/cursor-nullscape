import { death } from "../entityHost.js";
import { isCursorOnFloor, getCameraPos, setVoidScale } from "../main.js";

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
    setVoidScale(1 - progress);
    const alpha = progress * 0.5;

    const cx = Math.round(cam.x);
    const cy = Math.round(cam.y);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = "black";
    ctx.fillRect(
      cx,
      cy,
      Math.round(window.innerWidth),
      Math.round(window.innerHeight),
    );

    ctx.restore();
  }
  const unregister = host.register({ update, draw });
  return unregister;
}
