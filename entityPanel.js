const panel = document.getElementById("entity-panel");
const content = document.getElementById("entity-panel-content");

const entityCounts = new Map();

let panelOpen = false;

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.key.toLowerCase() === "m") {
    panelOpen = !panelOpen;
    panel.classList.toggle("open", panelOpen);
  }
});

export function registerEntitySpawn(name, imageSrc) {
  let data = entityCounts.get(name);
  if (!data) {
    data = { count: 0, img: imageSrc };
    entityCounts.set(name, data);
  }
  data.count++;
  renderPanel();
}

function renderPanel() {
  content.innerHTML = "";

  for (const [name, data] of entityCounts) {
    const slot = document.createElement("div");
    slot.className = "entity-slot";

    const img = document.createElement("img");
    img.src = data.img;
    img.alt = name;

    slot.appendChild(img);

    if (data.count >= 2) {
      const badge = document.createElement("div");
      badge.className = "entity-count";
      badge.textContent = data.count;
      slot.appendChild(badge);
    }

    content.appendChild(slot);
  }
}
