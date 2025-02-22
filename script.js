/*
  Faster Tetris:
  - Wider area.
  - Random x-spawn, random shape, random rotation.
  - After each shape lands, we play a short beep.
  - If stack hits top, reset grid.
*/

const COLS = 16;
const ROWS = 24;
const BLOCK_SIZE = 25;
const DROP_INTERVAL = 200; // ms
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

// We'll generate a beep sound in code when shape lands
let audioCtx;
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('tetris-bg');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  grid = createGrid(ROWS, COLS);

  spawnShape();
  requestAnimationFrame(update);

  // Manage tab switching
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(button.getAttribute('data-tab')).classList.add('active');
    });
  });

  // Prepare a simple audio context for beep
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
});

function resizeCanvas() {
  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;
}

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

function spawnShape() {
  let shapeObj = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  // Copy shape
  currentShape = shapeObj.blocks.map(b => [...b]);
  currentShape.color = shapeObj.color;

  // Possibly rotate randomly
  let times = Math.floor(Math.random() * 4);
  for(let i = 0; i < times; i++){
    rotateClockwise(currentShape);
  }

  // Now random x within board
  let maxX = Math.max(...currentShape.map(b => b[0]));
  let shapeWidth = maxX + 1;
  currentX = Math.floor(Math.random() * (COLS - shapeWidth));
  currentY = 0;

  // If collision at spawn => reset
  if(collision(currentX, currentY, currentShape)){
    grid = createGrid(ROWS, COLS);
  }
}

// Rotate shape clockwise
function rotateClockwise(shape) {
  // shape: array of [x,y]
  for(let i = 0; i < shape.length; i++){
    let x = shape[i][0];
    let y = shape[i][1];
    // Rotation around (0,0): newX = y, newY = -x
    // but we keep them positive => shift if needed
    shape[i][0] = y;
    shape[i][1] = -x;
  }
  // Now shape may be negative y => shift up
  let minY = Math.min(...shape.map(b => b[1]));
  if(minY < 0){
    shape.forEach(b => b[1] -= minY);
  }
}

// Basic collision check
function collision(x, y, shape){
  for(let i = 0; i < shape.length; i++){
    let [dx, dy] = shape[i];
    let nx = x + dx;
    let ny = y + dy;
    if(nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
      return true;
    }
    if(grid[ny][nx]) {
      return true;
    }
  }
  return false;
}

function placeShape(x, y, shape) {
  shape.forEach(([dx, dy]) => {
    grid[y + dy][x + dx] = shape.color;
  });
  // Play beep
  playBeep();
}

function update(time=0) {
  let delta = time - lastDropTime;
  if(delta > DROP_INTERVAL) {
    if(!collision(currentX, currentY + 1, currentShape)){
      currentY++;
    } else {
      placeShape(currentX, currentY, currentShape);
      spawnShape();
    }
    lastDropTime = time;
  }
  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0,0, canvas.width, canvas.height);

  // Draw stacked blocks
  for(let r = 0; r < ROWS; r++){
    for(let c = 0; c < COLS; c++){
      if(grid[r][c]){
        drawBlock(c, r, grid[r][c]);
      }
    }
  }

  // Draw current shape
  for(let i=0; i<currentShape.length; i++){
    let [dx, dy] = currentShape[i];
    drawBlock(currentX + dx, currentY + dy, currentShape.color);
  }
}

function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Simple beep generator
function playBeep(){
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(220, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);

  osc.start();
  // Stop after 0.1s
  osc.stop(audioCtx.currentTime + 0.1);
}
