/*
  Smoother Tetris animation approach:
  - Blocks fall continuously at a certain speed (pixels per second).
  - Each block is placed once it hits bottom or a stacked block.
  - A new shape spawns afterward.
*/

let canvas, ctx;
const BLOCK_SIZE = 24;   // Pixel size of each block cell 
const COLS = 10;         // Grid columns
const ROWS = 20;         // Grid rows
const FALL_SPEED = 80;   // Pixels per second (adjust for smoothness)

let lastTime = 0;
let accumulated = 0;     // Accumulated time since last update
let grid;
let currentShape;

// Tetris shapes (each shape: list of [x, y] cells + color)
const SHAPES = [
  {
    color: '#0ff', // I
    cells: [[0,0],[1,0],[2,0],[3,0]]
  },
  {
    color: '#ff0', // O
    cells: [[0,0],[1,0],[0,1],[1,1]]
  },
  {
    color: '#f0f', // T
    cells: [[0,0],[1,0],[2,0],[1,1]]
  },
  {
    color: '#0f0', // S
    cells: [[0,1],[1,1],[1,0],[2,0]]
  },
  {
    color: '#f00', // Z
    cells: [[0,0],[1,0],[1,1],[2,1]]
  },
  {
    color: '#00f', // J
    cells: [[0,0],[0,1],[1,0],[2,0]]
  },
  {
    color: '#ffa500', // L
    cells: [[0,0],[1,0],[2,0],[2,1]]
  }
];

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('tetris-bg');
  ctx = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  grid = createGrid(ROWS, COLS);
  spawnShape();

  requestAnimationFrame(update);

  // Handle tab switching
  const buttons = document.querySelectorAll('.tab-button');
  const contents = document.querySelectorAll('.tab-content');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
    });
  });
});

// Create an empty grid
function createGrid(rows, cols) {
  const arr = [];
  for(let r=0; r<rows; r++){
    arr[r] = [];
    for(let c=0; c<cols; c++){
      arr[r][c] = null; // empty
    }
  }
  return arr;
}

function resizeCanvas() {
  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;
}

// Spawn a random shape at the top
function spawnShape(){
  const index = Math.floor(Math.random() * SHAPES.length);
  const shapeDef = SHAPES[index];
  // Copy the shape definition
  currentShape = {
    color: shapeDef.color,
    cells: shapeDef.cells.map(([x,y]) => ({x,y})),
    x: Math.floor(COLS/2) - 1, // spawn near center
    y: 0
  };
}

// Animation loop
function update(timestamp) {
  const delta = (timestamp - lastTime) / 1000; // seconds
  lastTime = timestamp;

  accumulated += delta * FALL_SPEED;

  // If we've accumulated >= 1 pixel's worth of motion
  while(accumulated >= 1){
    if(!tryMoveDown()){
      placeShape();
      spawnShape();
    }
    accumulated -= 1;
  }

  draw();
  requestAnimationFrame(update);
}

// Move the shape down by 1 pixel if no collision
function tryMoveDown() {
  // Temporarily shift
  currentShape.y += 1/ BLOCK_SIZE; 
  if(collision()){
    // revert
    currentShape.y -= 1 / BLOCK_SIZE;
    return false;
  }
  return true;
}

// Check collisions with bottom or existing grid cells
function collision(){
  for(const cell of currentShape.cells){
    const px = cell.x + currentShape.x;
    const py = cell.y + currentShape.y;
    // px, py are in grid coordinates => py is float if partial cell
    const gridX = Math.round(px);
    const gridY = Math.round(py);

    // If the bottom (or sides)
    if(gridX < 0 || gridX >= COLS) return true;
    if(gridY < 0 || gridY >= ROWS) return true; 
    if(grid[gridY]?.[gridX]) return true;
  }
  return false;
}

// Place shape into the grid
function placeShape(){
  for(const cell of currentShape.cells){
    const gridX = Math.round(cell.x + currentShape.x);
    const gridY = Math.round(cell.y + currentShape.y);
    if(gridY >= 0 && gridY < ROWS){
      grid[gridY][gridX] = currentShape.color;
    }
  }
}

// Render the grid and current shape
function draw(){
  ctx.clearRect(0,0, canvas.width, canvas.height);

  // Draw stacked blocks
  for(let r=0; r<ROWS; r++){
    for(let c=0; c<COLS; c++){
      const color = grid[r][c];
      if(color){
        drawBlock(c, r, color);
      }
    }
  }

  // Draw current falling shape (with partial y if needed)
  for(const cell of currentShape.cells){
    const x = (cell.x + currentShape.x) * BLOCK_SIZE;
    const y = (cell.y + currentShape.y) * BLOCK_SIZE;
    drawBlockPx(x, y, currentShape.color);
  }
}

// Draw a single block in grid coords
function drawBlock(cx, cy, color){
  const px = cx * BLOCK_SIZE;
  const py = cy * BLOCK_SIZE;
  drawBlockPx(px, py, color);
}

// Draw a block by pixel coords
function drawBlockPx(px, py, color){
  ctx.fillStyle = color;
  ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}
