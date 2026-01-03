let mouseListenerAttached = false;
export const mouse = {
  x: 0,
  y: 0,
  _clientX: 0,
  _clientY: 0,
};
export function updateMouseWorld(canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  mouse.x = (mouse._clientX - rect.left) * scaleX;
  mouse.y = (mouse._clientY - rect.top) * scaleY;
}
export function attachMouseListener(canvas, onMove) {
  if (mouseListenerAttached) return;
  mouseListenerAttached = true;

  canvas.addEventListener("mousemove", (e) => {
    mouse._clientX = e.clientX;
    mouse._clientY = e.clientY;

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

let dies = false;
export function death(name = "Unknown") {
  if (dies) return;
  dies = true;
  document.body.classList.add("player-dead");
  setTimeout(() => {
    document.body.classList.remove("player-dead");
    const canvas = document.getElementById("screen");
    const screen = document.getElementById("death-screen");
    const text = document.getElementById("death-text");
    const retry = document.getElementById("retry-btn");

    canvas.style.display = "none";
    text.textContent = `You died to ${name}`;
    screen.style.display = "block";

    setTimeout(() => {
      retry.style.opacity = "1";
      retry.style.pointerEvents = "auto";
      retry.onclick = () => location.reload();
    }, 5000);
  }, 500);
}
