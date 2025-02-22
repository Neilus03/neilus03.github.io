/*
  MULTI-SHAPE TETRIS BACKGROUND + STARFIELD
  - Spawns multiple Tetris shapes at intervals (SPAWN_INTERVAL).
  - Each shape falls smoothly at FALL_SPEED (pixels/sec).
  - Once off-screen, shape is removed.
  - Also draws a small starfield in the background for extra flair.
  - No sound effects.
*/

/* --------------------------------- SETUP --------------------------------- */

// The canvas is already in your HTML: <canvas id="tetris-bg"></canvas>
const canvas = document.getElementById('tetris-bg');
const ctx = canvas.getContext('2d');

// Tweak these values as you like:
const BLOCK_SIZE = 24;       // Tetris block cell size in px
const FALL_SPEED = 60;       // Tetris shapes fall at 60 px/sec
const SPAWN_INTERVAL = 2000; // Spawn a new shape every 2000 ms (2 seconds)
const STAR_COUNT = 80;       // Number of stars in the starfield
const STAR_SPEED = 20;       // Speed at which stars move downward

// Tetris shapes definition (array of block coords + color)
const SHAPES = [
  { color: '#0ff', blocks: [[0,0],[1,0],[2,0],[3,0]] }, // I
  { color: '#ff0', blocks: [[0,0],[1,0],[0,1],[1,1]] }, // O
  { color: '#f0f', blocks: [[0,0],[1,0],[2,0],[1,1]] }, // T
  { color: '#0f0', blocks: [[0,1],[1,1],[1,0],[2,0]] }, // S
  { color: '#f00', blocks: [[0,0],[1,0],[1,1],[2,1]] }, // Z
  { color: '#00f', blocks: [[0,0],[0,1],[1,0],[2,0]] }, // J
  { color: '#ffa500', blocks: [[0,0],[1,0],[2,0],[2,1]] } // L
];

// Active Tetris shapes
let shapes = [];
// Starfield array
let stars = [];

// Time tracking
let lastTime = 0;         // last frame time (ms)
let spawnTimer = 0;       // accumulates time for shape spawns (ms)

/* -------------------------- INIT & EVENT LISTENERS ------------------------ */

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Set up starfield
function initStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: STAR_SPEED + Math.random() * 20, // random speed
      size: 1 + Math.random() * 2            // star size in px
    });
  }
}

initStars();

/* --------------------------- TETRIS SPAWN/UPDATE -------------------------- */

// Spawns a single Tetris shape at a random x
function spawnShape() {
  const def = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  shapes.push({
    color: def.color,
    blocks: JSON.parse(JSON.stringify(def.blocks)), // copy block coords
    x: Math.floor(Math.random() * (canvas.width - 4*BLOCK_SIZE)), // random px
    y: 0,         // start at top
    speed: FALL_SPEED
  });
}

/* ------------------------------ GAME LOOP --------------------------------- */

function update(timestamp) {
  // On first call, lastTime is 0, so set it to current
  if (!lastTime) lastTime = timestamp;
  let delta = timestamp - lastTime; // ms elapsed since last frame
  lastTime = timestamp;

  // Update spawn timer
  spawnTimer += delta;
  if (spawnTimer >= SPAWN_INTERVAL) {
    spawnShape();
    spawnTimer = 0;
  }

  // Move existing shapes downward
  shapes.forEach(shape => {
    shape.y += (shape.speed * (delta / 1000));  // px = speed * sec
  });

  // Remove shapes that have fallen past bottom
  shapes = shapes.filter(s => s.y < canvas.height + 5*BLOCK_SIZE);

  // Update stars
  stars.forEach(star => {
    star.y += star.speed * (delta / 1000);
    // If star goes off bottom, wrap to top
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });

  draw();
  requestAnimationFrame(update);
}

/* ------------------------------- RENDER ----------------------------------- */

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1) Draw starfield
  ctx.fillStyle = '#fff';
  stars.forEach(star => {
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });

  // 2) Draw Tetris shapes
  shapes.forEach(shape => {
    shape.blocks.forEach(([bx, by]) => {
      const px = shape.x + bx * BLOCK_SIZE;
      const py = shape.y + by * BLOCK_SIZE;
      drawBlock(px, py, shape.color);
    });
  });
}

function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
}

/* --------------------------- START THE LOOP ------------------------------- */
requestAnimationFrame(update);

/* ------------------------------ TABS LOGIC -------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
    });
  });
});
