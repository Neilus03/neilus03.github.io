/*
  MULTI-SHAPE TETRIS BACKGROUND + BASIC LOGS
  ------------------------------------------
  1) Spawns multiple Tetris shapes (one every SPAWN_INTERVAL ms).
  2) Each shape falls smoothly at FALL_SPEED (pixels/sec).
  3) Once off-screen, shapes are removed from the array.
  4) Includes console.log statements for debugging.
  5) No sound effects, no rotation, minimal starfield removed for clarity.
*/

/* ------------------------- Canvas & Basic Setup ------------------------- */
const canvas = document.getElementById('tetris-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ------------------------- Tweakable Parameters ------------------------- */
const BLOCK_SIZE = 24;       // Tetris block cell size in px
const FALL_SPEED = 60;       // Tetris shapes fall at 60 px/sec
const SPAWN_INTERVAL = 2000; // Spawn a new shape every 2 seconds

/* ------------------------- Tetris Shapes Setup -------------------------- */
const SHAPES = [
  { color: '#0ff', blocks: [[0,0],[1,0],[2,0],[3,0]] }, // I
  { color: '#ff0', blocks: [[0,0],[1,0],[0,1],[1,1]] }, // O
  { color: '#f0f', blocks: [[0,0],[1,0],[2,0],[1,1]] }, // T
  { color: '#0f0', blocks: [[0,1],[1,1],[1,0],[2,0]] }, // S
  { color: '#f00', blocks: [[0,0],[1,0],[1,1],[2,1]] }, // Z
  { color: '#00f', blocks: [[0,0],[0,1],[1,0],[2,0]] }, // J
  { color: '#ffa500', blocks: [[0,0],[1,0],[2,0],[2,1]] } // L
];

// This array holds every shape currently falling
let shapes = [];

/* ----------------------- Time & Spawn Management ------------------------ */
let lastFrameTime = 0;
let spawnAccumulator = 0; // tracks time for next spawn

// Spawn a single Tetris shape at a random x position
function spawnShape() {
  const def = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const shape = {
    color: def.color,
    blocks: JSON.parse(JSON.stringify(def.blocks)), // copy coords
    x: Math.random() * (canvas.width - BLOCK_SIZE*4), // random px in canvas
    y: -BLOCK_SIZE * 4, // start just above top, so it's visible falling in
    speed: FALL_SPEED
  };
  console.log('Spawning shape:', shape); // LOG for debugging
  shapes.push(shape);
}

/* -------------------------- Animation Loop ----------------------------- */
function update(timestamp) {
  // If it's the first frame, set lastFrameTime
  if (!lastFrameTime) lastFrameTime = timestamp;
  // Calculate elapsed time in ms
  const deltaMs = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  // Accumulate time for shape spawning
  spawnAccumulator += deltaMs;
  if (spawnAccumulator >= SPAWN_INTERVAL) {
    spawnShape();
    spawnAccumulator = 0;
  }

  // Convert to seconds for movement
  const deltaSec = deltaMs / 1000;

  // Move shapes down
  shapes.forEach(shape => {
    shape.y += shape.speed * deltaSec;
  });

  // Remove shapes that passed bottom
  shapes = shapes.filter(s => s.y < canvas.height + BLOCK_SIZE*4);

  // Render
  draw();
  // Next frame
  requestAnimationFrame(update);
}

/* ----------------------------- Rendering ------------------------------- */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw all shapes
  shapes.forEach(shape => {
    shape.blocks.forEach(([bx, by]) => {
      // Pixel coords of each block
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

/* -------------------------- Start the Loop ----------------------------- */
requestAnimationFrame(update);

/* --------------------- TAB Switching (Unchanged) ---------------------- */
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
