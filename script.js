/*
  Enhanced Tetris-like animation:
  - Larger board so blocks can appear anywhere (not just the right side).
  - Faster drop interval for quicker stacking.
  - No line clears; once it fills up, it resets.
*/

const COLS = 12;
const ROWS = 22;
const BLOCK_SIZE = 30;
const DROP_INTERVAL = 250; // ms between moves (faster)

const SHAPES = [
  // I
  { blocks: [[0,0],[1,0],[2,0],[3,0]], color: '#0ff' },
  // O
  { blocks: [[0,0],[1,0],[0,1],[1,1]], color: '#ff0' },
  // T
  { blocks: [[0,0],[1,0],[2,0],[1,1]], color: '#f0f' },
  // S
  { blocks: [[0,1],[1,1],[1,0],[2,0]], color: '#0f0' },
  // Z
  { blocks: [[0,0],[1,0],[1,1],[2,1]], color: '#f00' },
  // J
  { blocks: [[0,0],[0,1],[1,0],[2,0]], color: '#00f' },
  // L
  { blocks: [[0,0],[1,0],[2,0],[2,1]], color: '#ffa500' },
];

let canvas, ctx;
let grid;
let currentShape;
let currentX, currentY;
let lastDropTime = 0;

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('tetris-bg');
  ctx = canvas.getContext('2d');

  // Set canvas size
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Create empty grid
  grid = createGrid(ROWS, COLS);

  spawnShape();
  requestAnimationFrame(update);

  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(button.getAttribute('data-tab')).classList.add('active');
    });
  });
});

function createGrid(rows, cols) {
  let arr = [];
  for (let r = 0; r < rows; r++) {
    arr[r] = [];
    for (let c = 0; c < cols; c++) {
      arr[r][c] = null;
    }
  }
  return arr;
}

function resizeCanvas() {
  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;
}

function spawnShape() {
  let shapeObj = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  // Copy blocks so we don't mutate the original
  currentShape = shapeObj.blocks.map((b) => [...b]);
  currentShape.color = shapeObj.color;

  // Figure out shape's width to avoid out-of-bounds spawn
  let maxX = Math.max(...currentShape.map((b) => b[0]));
  let shapeWidth = maxX + 1;
  currentX = Math.floor(Math.random() * (COLS - shapeWidth));
  currentY = 0;

  // If collision at spawn, reset grid
  if (collision(currentX, currentY, currentShape)) {
    grid = createGrid(ROWS, COLS);
  }
}

function collision(x, y, shape) {
  for (let i = 0; i < shape.length; i++) {
    let [dx, dy] = shape[i];
    let nx = x + dx;
    let ny = y + dy;
    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
      return true;
    }
    if (grid[ny][nx]) {
      return true;
    }
  }
  return false;
}

function placeShape(x, y, shape) {
  shape.forEach(([dx, dy]) => {
    grid[y + dy][x + dx] = shape.color;
  });
}

function update(time = 0) {
  let delta = time - lastDropTime;
  if (delta > DROP_INTERVAL) {
    // Move shape down
    if (!collision(currentX, currentY + 1, currentShape)) {
      currentY++;
    } else {
      // Place shape
      placeShape(currentX, currentY, currentShape);
      // Spawn a new one
      spawnShape();
    }
    lastDropTime = time;
  }
  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw stacked blocks
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) {
        drawBlock(c, r, grid[r][c]);
      }
    }
  }

  // Draw current shape
  currentShape.forEach(([dx, dy]) => {
    drawBlock(currentX + dx, currentY + dy, currentShape.color);
  });
}

function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}
