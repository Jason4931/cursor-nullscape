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

const DEATH_MESSAGES = {
  Mart: [
    "You something Mart something dead.",
    "You are Dead (probably.)",
    "You are not friends with Mart.",
    "Mart just had it out for you, sorry.",
    "You are no longer with us courtesy of Mart.",
    "Mart just... wait really..? uh.. You are dead.",
    "Mart destroyed your overconfidence.",
    "Mart seized your living license.",
    "Mart killed you in cold blood.",
    "You were killed by Mart.",
  ],
  Unknown: ["You died.", "Skill issue.", "That wasn’t supposed to happen."],
};
function getDeathMessage(name) {
  const list = DEATH_MESSAGES[name] || DEATH_MESSAGES.Unknown;
  return list[(Math.random() * list.length) | 0];
}

let dies = false;
export function death(name = "Unknown", color = "#f70000") {
  if (dies) return;
  dies = true;
  document.body.classList.add("player-dead");
  setTimeout(() => {
    document.body.classList.remove("player-dead");
    const canvas = document.getElementById("screen");
    const screen = document.getElementById("death-screen");
    const text = document.getElementById("death-text");
    const input = document.getElementById("death-input");
    const retry = document.getElementById("retry-btn");

    canvas.style.display = "none";
    text.textContent = getDeathMessage(name);
    text.style.color = color;
    screen.style.display = "block";
    input.focus();
    input.select();

    setTimeout(() => {
      retry.style.opacity = "1";
      retry.style.pointerEvents = "auto";
      retry.onclick = () => location.reload();
    }, 5000);
  }, 500);
}
