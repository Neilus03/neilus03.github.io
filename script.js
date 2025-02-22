/*
  Smooth Tetris blocks:
  - Blocks fall at a fixed pixel speed (FALL_SPEED).
  - No sound effects.
*/

let canvas, ctx;
const BLOCK_SIZE = 24;  
const COLS = 10;        
const ROWS = 20;        
const FALL_SPEED = 80;  // pixels per second

let lastTime = 0;
let accumulated = 0;  
let grid;
let currentShape;

const SHAPES = [
  { color: '#0ff', cells: [[0,0],[1,0],[2,0],[3,0]] }, // I
  { color: '#ff0', cells: [[0,0],[1,0],[0,1],[1,1]] }, // O
  { color: '#f0f', cells: [[0,0],[1,0],[2,0],[1,1]] }, // T
  { color: '#0f0', cells: [[0,1],[1,1],[1,0],[2,0]] }, // S
  { color: '#f00', cells: [[0,0],[1,0],[1,1],[2,1]] }, // Z
  { color: '#00f', cells: [[0,0],[0,1],[1,0],[2,0]] }, // J
  { color: '#ffa500', cells: [[0,0],[1,0],[2,0],[2,1]] } // L
];

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('tetris-bg');
  ctx = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  grid = createGrid(ROWS, COLS);
  spawnShape();

  requestAnimationFrame(update);

  // Tab switching
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
  let arr = [];
  for(let r=0; r<rows; r++){
    arr[r] = [];
    for(let c=0; c<cols; c++){
      arr[r][c] = null;
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
  let def = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  currentShape = {
    color: def.color,
    cells: def.cells.map(([x,y]) => ({x,y})),
    x: Math.floor(COLS / 2) - 1,
    y: 0
  };
}

// Main update loop
function update(timestamp) {
  let delta = (timestamp - lastTime) / 1000; // in seconds
  lastTime = timestamp;

  accumulated += delta * FALL_SPEED;

  // Move the shape down pixel-by-pixel
  while(accumulated >= 1){
    if(!moveDownOnePixel()){
      placeShape();
      spawnShape();
    }
    accumulated -= 1;
  }

  draw();
  requestAnimationFrame(update);
}

// Move shape down 1 pixel if no collision
function moveDownOnePixel(){
  currentShape.y += 1 / BLOCK_SIZE; // 1 pixel in grid coords
  if(checkCollision()){
    currentShape.y -= 1 / BLOCK_SIZE;
    return false;
  }
  return true;
}

// Check collision with bottom or stacked blocks
function checkCollision(){
  for(const cell of currentShape.cells){
    const gridX = Math.round(cell.x + currentShape.x);
    const gridY = Math.round(cell.y + currentShape.y);

    if(gridX < 0 || gridX >= COLS) return true;
    if(gridY < 0 || gridY >= ROWS) return true;
    if(grid[gridY]?.[gridX]) return true;
  }
  return false;
}

// Place shape in the grid
function placeShape(){
  for(const cell of currentShape.cells){
    const gx = Math.round(cell.x + currentShape.x);
    const gy = Math.round(cell.y + currentShape.y);
    if(gy >= 0 && gy < ROWS){
      grid[gy][gx] = currentShape.color;
    }
  }
}

// Draw the grid and current shape
function draw(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw stacked blocks
  for(let r=0; r<ROWS; r++){
    for(let c=0; c<COLS; c++){
      let color = grid[r][c];
      if(color){
        drawBlock(c, r, color);
      }
    }
  }

  // Draw current shape
  for(const cell of currentShape.cells){
    let px = (cell.x + currentShape.x) * BLOCK_SIZE;
    let py = (cell.y + currentShape.y) * BLOCK_SIZE;
    drawBlockPx(px, py, currentShape.color);
  }
}

// Draw a block in grid coords
function drawBlock(cx, cy, color){
  drawBlockPx(cx * BLOCK_SIZE, cy * BLOCK_SIZE, color);
}

// Draw block by pixel coords
function drawBlockPx(px, py, color){
  ctx.fillStyle = color;
  ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}
