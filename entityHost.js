let mouseListenerAttached = false;
export const mouse = { x: 0, y: 0 };
export function attachMouseListener(canvas, onMove) {
  if (mouseListenerAttached) return;
  mouseListenerAttached = true;

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;

    if (typeof onMove === "function") {
      onMove(mouse);
    }
  });
}

export function createEntityHost(canvas, ctx) {
  const entities = new Set();

  function register({ update, draw }) {
    const entity = { update, draw };
    entities.add(entity);

    return () => {
      entities.delete(entity);
    };
  }

  function update(dt) {
    for (const e of [...entities]) {
      e.update?.(dt);
    }
  }

  function draw() {
    for (const e of entities) {
      e.draw?.(ctx);
    }
  }

  return {
    canvas,
    ctx,
    register,
    update,
    draw,
  };
}
