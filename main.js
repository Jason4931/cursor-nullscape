import { PATTERNS, TILE_SIZE } from "./patterns.js";

const canvas = document.getElementById("screen");
const viewport = document.getElementById("viewport");
const ctx = canvas.getContext("2d");
const counterEl = document.getElementById("counter");

const gift = new Image();
gift.src = "./ASSET/Misc/Gifts.png";

/* ===== CONFIG ===== */
canvas.width = 10000;
canvas.height = 10000;

const MAX_SPEED = 20;
const GRID_DIVS = 10;
const GIFT_SIZE = 30;
let HIT_RADIUS = GIFT_SIZE * 0.5;
let cheat = 0;
window.addEventListener("keydown", (e) => {
  if (e.key === "/") cheat++;
  if (cheat >= 8) HIT_RADIUS = GIFT_SIZE * 10;
});

const SUPER_TILE = 9;

/* ===== GRID / SUPERGRID CALC ===== */
const SUPER_W = Math.max(
  1,
  Math.floor(canvas.width / (TILE_SIZE * SUPER_TILE))
);
const SUPER_H = Math.max(
  1,
  Math.floor(canvas.height / (TILE_SIZE * SUPER_TILE))
);

const MAP_TILES_X = SUPER_W * SUPER_TILE;
const TILE = canvas.width / MAP_TILES_X;

/* radii use TILE (world units) */
const DESPAWN_RADIUS = SUPER_TILE * TILE * 6;
const RESPAWN_RADIUS = SUPER_TILE * TILE * 4.5;

let collectedCount = 0;

/* ===== MAP OCCUPANCY ===== */
const superOccupied = Array.from({ length: SUPER_H }, () =>
  Array(SUPER_W).fill(false)
);

/* ===== STATE ===== */
let camX = 0;
let camY = 0;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

/* ===== TILE DATA ===== */
let giftPositions = [];
let floorTiles = [];

/* ===== PATTERN STATE ===== */
const patternsState = new Map();

/* ===== HELPERS ===== */
function rotateMatrix90(m) {
  const h = m.length;
  const w = m[0].length;
  const r = Array.from({ length: w }, () => Array(h).fill(0));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) r[x][h - 1 - y] = m[y][x];
  return r;
}

function rotateRandom(m) {
  let r = m;
  const t = Math.floor(Math.random() * 4);
  for (let i = 0; i < t; i++) r = rotateMatrix90(r);
  return r;
}

function getCanvasScale() {
  return {
    x: canvas.width / canvas.offsetWidth,
    y: canvas.height / canvas.offsetHeight,
  };
}

function screenToWorld(mx, my) {
  const s = getCanvasScale();
  return {
    x: (mx - camX) * s.x,
    y: (my - camY) * s.y,
  };
}

function patternCenter(sx, sy) {
  return {
    x: (sx * SUPER_TILE + SUPER_TILE / 2) * TILE,
    y: (sy * SUPER_TILE + SUPER_TILE / 2) * TILE,
  };
}

function pickPatternsBySize(patterns) {
  return [...patterns].sort((a, b) => {
    const areaA = a.length * a[0].length;
    const areaB = b.length * b[0].length;

    // very gentle rarity curve
    const wA = 1 / Math.pow(areaA, 0.25);
    const wB = 1 / Math.pow(areaB, 0.25);

    return Math.random() * wB - Math.random() * wA;
  });
}

function count3x3Patterns() {
  let count = 0;
  for (const p of patternsState.values()) {
    if (p.pw === 3 && p.ph === 3) count++;
  }
  return count;
}

function findReplacementSlot(mouseWorld) {
  for (const p of patternsState.values()) {
    const c = patternCenter(p.sx, p.sy);
    const d = Math.hypot(c.x - mouseWorld.x, c.y - mouseWorld.y);

    if (d > DESPAWN_RADIUS * 1.2) {
      return p;
    }
  }
  return null;
}

function forceSpawn3x3(mouseWorld) {
  const base3x3 = PATTERNS.filter(
    (p) => p.length / SUPER_TILE === 3 && p[0].length / SUPER_TILE === 3
  );

  if (!base3x3.length) return;

  const target = findReplacementSlot(mouseWorld);
  if (!target) return;

  destroyPattern(target);

  const shuffled = pickPatternsBySize(base3x3);
  for (const base of shuffled) {
    const pat = rotateRandom(base);
    if (canPlaceSuper(target.sx, target.sy, pat)) {
      placeSuper(target.sx, target.sy, pat);
      break;
    }
  }
}

/* ===== PATTERN PLACEMENT ===== */
function canPlaceSuper(sx, sy, pattern) {
  const ph = pattern.length / SUPER_TILE;
  const pw = pattern[0].length / SUPER_TILE;

  if (sx + pw > SUPER_W || sy + ph > SUPER_H) return false;

  for (let y = 0; y < ph; y++)
    for (let x = 0; x < pw; x++)
      if (superOccupied[sy + y][sx + x]) return false;

  return true;
}

function placeSuper(sx, sy, pattern) {
  const ph = pattern.length;
  const pw = pattern[0].length;

  let gifts = 0;

  // mark super-tile occupancy
  for (let y = 0; y < ph / SUPER_TILE; y++)
    for (let x = 0; x < pw / SUPER_TILE; x++)
      superOccupied[sy + y][sx + x] = true;

  // stamp tiles (use TILE for positions so rendering grid lines up)
  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      const wx = (sx * SUPER_TILE + x) * TILE;
      const wy = (sy * SUPER_TILE + y) * TILE;

      if (pattern[y][x] === 1 || pattern[y][x] === 2) {
        floorTiles.push({ x: wx, y: wy, sx, sy });
      }

      if (pattern[y][x] === 2 || pattern[y][x] === 3) {
        giftPositions.push({ x: wx, y: wy, sx, sy });
        gifts++;
      }
    }
  }

  const spw = pw / SUPER_TILE;
  const sph = ph / SUPER_TILE;

  patternsState.set(`${sx},${sy}`, {
    sx,
    sy,
    pw: spw,
    ph: sph,
    sizeKey: `${spw}x${sph}`,
    giftsLeft: gifts,
    cleared: gifts === 0,
  });
}

function destroyPattern(p) {
  floorTiles = floorTiles.filter((t) => t.sx !== p.sx || t.sy !== p.sy);
  giftPositions = giftPositions.filter((g) => g.sx !== p.sx || g.sy !== p.sy);

  for (let y = 0; y < p.ph; y++)
    for (let x = 0; x < p.pw; x++) superOccupied[p.sy + y][p.sx + x] = false;

  patternsState.delete(`${p.sx},${p.sy}`);
}

/* ===== INITIAL MAP ===== */
for (let sy = 0; sy < SUPER_H; sy++) {
  for (let sx = 0; sx < SUPER_W; sx++) {
    if (superOccupied[sy][sx]) continue;

    const shuffled = pickPatternsBySize(PATTERNS);
    for (const base of shuffled) {
      const pat = rotateRandom(base);
      if (pat.length % SUPER_TILE !== 0 || pat[0].length % SUPER_TILE !== 0)
        continue;

      if (canPlaceSuper(sx, sy, pat)) {
        placeSuper(sx, sy, pat);
        break;
      }
    }
  }
}

/* ===== DRAW ===== */
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // floors
  ctx.fillStyle = "#333";
  for (const t of floorTiles) ctx.fillRect(t.x, t.y, TILE, TILE);

  // gifts (center inside the tile)
  if (gift.complete) {
    for (const g of giftPositions) {
      ctx.drawImage(
        gift,
        g.x + (TILE - GIFT_SIZE) / 2,
        g.y + (TILE - GIFT_SIZE) / 2,
        GIFT_SIZE,
        GIFT_SIZE
      );
    }
  }

  // optional grid overlay (kept)
  ctx.strokeStyle = "#fff1";
  ctx.lineWidth = 1;
  const stepX = canvas.width / GRID_DIVS;
  const stepY = canvas.height / GRID_DIVS;
  for (let i = 1; i < GRID_DIVS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * stepX, 0);
    ctx.lineTo(i * stepX, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * stepY);
    ctx.lineTo(canvas.width, i * stepY);
    ctx.stroke();
  }
}

/* ===== CAMERA + GAME LOGIC ===== */
function getLimits() {
  return {
    maxX: 0,
    maxY: 0,
    minX: viewport.clientWidth - canvas.offsetWidth,
    minY: viewport.clientHeight - canvas.offsetHeight,
  };
}

function centerCamera() {
  camX = (viewport.clientWidth - canvas.offsetWidth) / 2;
  camY = (viewport.clientHeight - canvas.offsetHeight) / 2;
}

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function updateCamera() {
  const w = viewport.clientWidth;
  const h = viewport.clientHeight;

  let vx = 0,
    vy = 0;

  if (mouseX < w * 0.4) vx = MAX_SPEED * (1 - mouseX / (w * 0.4));
  else if (mouseX > w * 0.6) vx = -MAX_SPEED * ((mouseX - w * 0.6) / (w * 0.4));

  if (mouseY < h * 0.4) vy = MAX_SPEED * (1 - mouseY / (h * 0.4));
  else if (mouseY > h * 0.6) vy = -MAX_SPEED * ((mouseY - h * 0.6) / (h * 0.4));

  camX += vx;
  camY += vy;

  const lim = getLimits();
  camX = Math.max(lim.minX, Math.min(lim.maxX, camX));
  camY = Math.max(lim.minY, Math.min(lim.maxY, camY));
  canvas.style.transform = `translate(${camX}px, ${camY}px)`;

  const mouseWorld = screenToWorld(mouseX, mouseY);

  /* collect gifts */
  for (let i = giftPositions.length - 1; i >= 0; i--) {
    const g = giftPositions[i];
    const dx = g.x + TILE / 2 - mouseWorld.x;
    const dy = g.y + TILE / 2 - mouseWorld.y;

    if (dx * dx + dy * dy < HIT_RADIUS * HIT_RADIUS) {
      giftPositions.splice(i, 1);
      collectedCount++;
      counterEl.textContent = `Collected: ${collectedCount}`;

      const p = patternsState.get(`${g.sx},${g.sy}`);
      if (p && --p.giftsLeft === 0) p.cleared = true;
    }
  }

  /* despawn cleared patterns */
  for (const p of [...patternsState.values()]) {
    if (!p.cleared) continue;
    const c = patternCenter(p.sx, p.sy);
    if (Math.hypot(c.x - mouseWorld.x, c.y - mouseWorld.y) > DESPAWN_RADIUS)
      destroyPattern(p);
  }

  const current3x3 = count3x3Patterns();
  if (current3x3 < 5) {
    forceSpawn3x3(mouseWorld);
  }

  /* regenerate empty slots */
  for (let sy = 0; sy < SUPER_H; sy++) {
    for (let sx = 0; sx < SUPER_W; sx++) {
      if (superOccupied[sy][sx]) continue;

      const c = patternCenter(sx, sy);
      if (Math.hypot(c.x - mouseWorld.x, c.y - mouseWorld.y) > RESPAWN_RADIUS)
        continue;

      const shuffled = [...PATTERNS].sort(() => Math.random() - 0.5);
      for (const base of shuffled) {
        const pat = rotateRandom(base);
        if (pat.length % SUPER_TILE !== 0 || pat[0].length % SUPER_TILE !== 0)
          continue;

        if (canPlaceSuper(sx, sy, pat)) {
          placeSuper(sx, sy, pat);
          break;
        }
      }
    }
  }
}

/* ===== LOOP ===== */
function loop() {
  updateCamera();
  drawGrid();
  requestAnimationFrame(loop);
}

requestAnimationFrame(centerCamera);
loop();
