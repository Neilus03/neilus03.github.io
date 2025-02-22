/* 
  MULTI-SHAPE TETRIS BACKGROUND:
  - Spawns multiple shapes at intervals.
  - Each shape falls smoothly from top to bottom.
  - Once off-screen, the shape is removed.
  - No sound effects.
*/

const canvas = document.getElementById('tetris-bg');
const ctx = canvas.getContext('2d');

// Tweak these values as you like:
const BLOCK_SIZE = 24;       // size of each Tetris cell
const FALL_SPEED = 60;       // pixels per second
const SPAWN_INTERVAL = 2000; // ms between spawns (2 seconds)

// Tetris shapes in [x,y] coords plus color
const SHAPES = [
  { color: '#0ff', blocks: [[0,0],[1,0],[2,0],[3,0]] }, // I
  { color: '#ff0', blocks: [[0,0],[1,0],[0,1],[1,1]] }, // O
  { color: '#f0f', blocks: [[0,0],[1,0],[2,0],[1,1]] }, // T
  { color: '#0f0', blocks: [[0,1],[1,1],[1,0],[2,0]] }, // S
  { color: '#f00', blocks: [[0,0],[1,0],[1,1],[2,1]] }, // Z
  { color: '#00f', blocks: [[0,0],[0,1],[1,0],[2,0]] }, // J
  { color: '#ffa500', blocks: [[0,0],[1,0],[2,0],[2,1]] } // L
];

let shapes = [];     // active shapes array
let lastTime = 0;
let spawnTimer = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Spawns a Tetris shape at a random x location
function spawnShape() {
  const def = SHAPES[Math.floor(Math.random()*SHAPES.length)];
  const shape = {
    color: def.color,
    blocks: JSON.parse(JSON.stringify(def.blocks)), // copy
    x: Math.floor(Math.random()*(canvas.width - 4*BLOCK_SIZE)), // random x in px
    y: 0,
    speed: FALL_SPEED // px/sec
  };
  shapes.push(shape);
}

// Rotate shape blocks or not? We’ll skip rotation for multi-block chaos.

// Main animation loop
function update(timestamp) {
  const delta = (timestamp - lastTime) / 1000; // in seconds
  lastTime = timestamp;
  spawnTimer += (timestamp - (timestamp - delta*1000));

  // If enough time has passed, spawn a new shape
  if(spawnTimer >= SPAWN_INTERVAL) {
    spawnShape();
    spawnTimer = 0;
  }

  // Move shapes downward
  shapes.forEach((shape) => {
    shape.y += shape.speed * delta;
  });

  // Remove shapes that are off-screen (y > canvas.height + some margin)
  shapes = shapes.filter(s => s.y < canvas.height + 5*BLOCK_SIZE);

  draw();

  requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0,0, canvas.width, canvas.height);

  // For each shape, draw its blocks
  shapes.forEach((shape) => {
    shape.blocks.forEach(([bx, by]) => {
      const px = shape.x + bx*BLOCK_SIZE;
      const py = shape.y + by*BLOCK_SIZE;
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

/* TAB SWITCHING */
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
