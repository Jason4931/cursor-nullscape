import { death, mouse } from "../entityHost.js";
import { moveCamera } from "../main.js";

export function setup(host) {
  const state = {
    opacity: 1,
    timer: 0,
  };

  function update(dt) {
    if (!Number.isFinite(mouse.x) || !Number.isFinite(mouse.y)) return;
    state.timer += dt;
    if (state.timer >= 1) {
      state.timer = 0;
      moveCamera(
        (Math.random() - 0.5) * 2 * (Math.random() < 0.01 ? 1000 : 1),
        (Math.random() - 0.5) * 2 * (Math.random() < 0.01 ? 1000 : 1),
      );
    }
  }

  function draw(ctx) {}

  const unregister = host.register({ update, draw });
  return unregister;
}
