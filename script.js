/*
  MULTI-SHAPE TETRIS BACKGROUND + STARFIELD + LOGS
  1) Spawns shapes automatically every SPAWN_INTERVAL ms, each falling at FALL_SPEED px/sec.
  2) Also has a "Spawn a Tetris Shape" button for manual spawn debugging.
  3) Includes a basic starfield behind the Tetris blocks.
  4) Console logs each shape spawn and shape array length so we know it's working.
*/

////////////////////////////////////////////////////////////////////////////////
// CANVAS SETUP
////////////////////////////////////////////////////////////////////////////////
const canvas = document.getElementById('tetris-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

////////////////////////////////////////////////////////////////////////////////
// PARAMETERS
////////////////////////////////////////////////////////////////////////////////
const BLOCK_SIZE = 24;        // size of a Tetris cell in px
const FALL_SPEED = 60;        // Tetris shapes fall at 60 px/sec
const SPAWN_INTERVAL = 2000;  // spawn a shape every 2 seconds
const STAR_COUNT = 60;        // how many stars
const STAR_SPEED = 30;        // star fall speed

// Tetris definitions
const SHAPES = [
  { color: '#0ff', blocks: [[0,0],[1,0],[2,0],[3,0]] }, // I
  { color: '#ff0', blocks: [[0,0],[1,0],[0,1],[1,1]] }, // O
  { color: '#f0f', blocks: [[0,0],[1,0],[2,0],[1,1]] }, // T
  { color: '#0f0', blocks: [[0,1],[1,1],[1,0],[2,0]] }, // S
  { color: '#f00', blocks: [[0,0],[1,0],[1,1],[2,1]] }, // Z
  { color: '#00f', blocks: [[0,0],[0,1],[1,0],[2,0]] }, // J
  { color: '#ffa500', blocks: [[0,0],[1,0],[2,0],[2,1]] } // L
];

// Arrays for shapes & stars
let shapes = [];
let stars = [];

// Timers
let lastFrameTime = 0;
let spawnAccumulator = 0; // how long since last shape spawn

////////////////////////////////////////////////////////////////////////////////
// INIT STARS
////////////////////////////////////////////////////////////////////////////////
function initStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: STAR_SPEED + Math.random() * 20,
      size: 1 + Math.random() * 2
    });
  }
}
initStars();

////////////////////////////////////////////////////////////////////////////////
// SPAWN ONE SHAPE
////////////////////////////////////////////////////////////////////////////////
function spawnShape() {
  const def = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const shape = {
    color: def.color,
    blocks: JSON.parse(JSON.stringify(def.blocks)), // deep copy
    x: Math.random() * (canvas.width - BLOCK_SIZE*4),
    y: -BLOCK_SIZE * 4,  // start above screen
    speed: FALL_SPEED
  };
  shapes.push(shape);
  console.log(`Spawning shape: color=${shape.color}, shapeCount=${shapes.length}`);
}

////////////////////////////////////////////////////////////////////////////////
// MAIN UPDATE LOOP
////////////////////////////////////////////////////////////////////////////////
function update(timestamp) {
  if (!lastFrameTime) lastFrameTime = timestamp;
  const deltaMs = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  // spawn logic
  spawnAccumulator += deltaMs;
  if (spawnAccumulator >= SPAWN_INTERVAL) {
    spawnShape();
    spawnAccumulator = 0;
  }

  const deltaSec = deltaMs / 1000;

  // move shapes
  shapes.forEach(s => {
    s.y += s.speed * deltaSec;
  });
  // remove shapes that go beyond bottom
  shapes = shapes.filter(s => s.y < canvas.height + BLOCK_SIZE*4);

  // move stars
  stars.forEach(star => {
    star.y += star.speed * deltaSec;
    // wrap star if it goes past bottom
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });

  draw();
  requestAnimationFrame(update);
}

////////////////////////////////////////////////////////////////////////////////
// RENDER
////////////////////////////////////////////////////////////////////////////////
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw starfield first
  ctx.fillStyle = '#fff';
  stars.forEach(star => {
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });

  // 2. Draw Tetris shapes
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

// Start animation
requestAnimationFrame(update);

////////////////////////////////////////////////////////////////////////////////
// TAB SWITCHING
////////////////////////////////////////////////////////////////////////////////
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

  // Debug button to spawn a shape on demand
  const spawnBtn = document.getElementById('spawnButton');
  if (spawnBtn) {
    spawnBtn.addEventListener('click', () => {
      spawnShape();
    });
  }
});
