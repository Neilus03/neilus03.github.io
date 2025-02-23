/*
  MULTI-SHAPE TETRIS + LOGS + MANUAL SPAWN 
  - Spawns shapes every SPAWN_INTERVAL ms at random x, falling at FALL_SPEED px/sec.
  - Click "Spawn a Tetris Shape" in the About tab to see if you can force a shape.
  - Check dev console for "Spawning shape" logs every time a shape is created.
*/

////////////////////////////////////////////////////////////////////////////////
// CANVAS
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
const BLOCK_SIZE = 24;
const FALL_SPEED = 60;       // px/sec
const SPAWN_INTERVAL = 2000; // spawn a shape every 2s

// Tetris shapes
const SHAPES = [
  { color: '#0ff', blocks: [[0,0],[1,0],[2,0],[3,0]] },
  { color: '#ff0', blocks: [[0,0],[1,0],[0,1],[1,1]] },
  { color: '#f0f', blocks: [[0,0],[1,0],[2,0],[1,1]] },
  { color: '#0f0', blocks: [[0,1],[1,1],[1,0],[2,0]] },
  { color: '#f00', blocks: [[0,0],[1,0],[1,1],[2,1]] },
  { color: '#00f', blocks: [[0,0],[0,1],[1,0],[2,0]] },
  { color: '#ffa500', blocks: [[0,0],[1,0],[2,0],[2,1]] }
];

let shapes = [];             // active shapes array

////////////////////////////////////////////////////////////////////////////////
// SPAWN
////////////////////////////////////////////////////////////////////////////////
function spawnShape() {
  const def = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const shape = {
    color: def.color,
    blocks: JSON.parse(JSON.stringify(def.blocks)), // deep copy
    x: Math.random() * (canvas.width - BLOCK_SIZE * 4),
    y: -BLOCK_SIZE * 4, // appear above screen
    speed: FALL_SPEED
  };
  shapes.push(shape);
  console.log(`Spawning shape: color=${shape.color}, shapeCount=${shapes.length}`);
}

////////////////////////////////////////////////////////////////////////////////
// MAIN LOOP
////////////////////////////////////////////////////////////////////////////////
let lastFrameTime = 0;
let spawnAccumulator = 0;

function update(timestamp) {
  if(!lastFrameTime) lastFrameTime = timestamp;
  const deltaMs = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  spawnAccumulator += deltaMs;
  if(spawnAccumulator >= SPAWN_INTERVAL) {
    spawnShape();
    spawnAccumulator = 0;
  }

  // movement
  const deltaSec = deltaMs / 1000;
  shapes.forEach(s => {
    s.y += s.speed * deltaSec;
  });

  // remove off-screen
  shapes = shapes.filter(s => s.y < canvas.height + BLOCK_SIZE * 4);

  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // draw shapes
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

requestAnimationFrame(update);

////////////////////////////////////////////////////////////////////////////////
// TAB SWITCHING & MANUAL SPAWN
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

  // Manual spawn
  const spawnBtn = document.getElementById('spawnButton');
  if(spawnBtn) {
    spawnBtn.addEventListener('click', () => {
      spawnShape();
    });
  }
});
