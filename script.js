// Tetris-like background
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24; // Size of each cell in pixels

// Tetris shapes (in 4x4 grids)
// Each shape is a 2D array with 1's representing blocks
const SHAPES = [
  // I
  {
    matrix: [
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#ff0000',
  },
  // O
  {
    matrix: [
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00ff00',
  },
  // T
  {
    matrix: [
      [1, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#ffff00',
  },
  // S
  {
    matrix: [
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00ffff',
  },
  // Z
  {
    matrix: [
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#ff00ff',
  },
  // J
  {
    matrix: [
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#ffa500',
  },
  // L
  {
    matrix: [
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#dddd00',
  },
];

let canvas, ctx;
let grid; // 2D array for the stacked blocks
let currentShape;
let currentX = 0;
let currentY = 0;
let dropCounter = 0;
let dropInterval = 600; // ms
let lastTime = 0;

document.addEventListener('DOMContentLoaded', init);

function init() {
  canvas = document.getElementById('tetris-bg');
  ctx = canvas.getContext('2d');
  resizeCanvas();

  grid = createMatrix(ROWS, COLS);
  spawnNewShape();

  // Listen for tab switching
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));

      button.classList.add('active');
      document
        .getElementById(button.getAttribute('data-tab'))
        .classList.add('active');
    });
  });

  // Start the animation
  requestAnimationFrame(update);
}

// Create a 2D array of zeros
function createMatrix(rows, cols) {
  const matrix = [];
  for (let r = 0; r < rows; r++) {
    matrix[r] = new Array(cols).fill(0);
  }
  return matrix;
}

// Resize canvas to fill window
window.addEventListener('resize', resizeCanvas);
function resizeCanvas() {
  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;
}

// Game loop for the falling blocks
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    dropBlock();
  }

  draw();
  requestAnimationFrame(update);
}

// Drop the current shape by one row
function dropBlock() {
  currentY++;
  if (collides(grid, currentShape.matrix, currentX, currentY)) {
    currentY--;
    merge(grid, currentShape.matrix, currentX, currentY);
    spawnNewShape();
  }
  dropCounter = 0;
}

// Merge the shape into the grid
function merge(grid, shape, offsetX, offsetY) {
  shape.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value) {
        grid[offsetY + r][offsetX + c] = currentShape.color;
      }
    });
  });
  // Check if we've stacked to the top -> reset
  if (checkOverflow()) {
    grid.forEach((row, r) => {
      grid[r].fill(0);
    });
  }
}

// Check if shapes fill the top row
function checkOverflow() {
  for (let c = 0; c < COLS; c++) {
    if (grid[0][c] !== 0) {
      return true;
    }
  }
  return false;
}

// Spawn a new random shape at top
function spawnNewShape() {
  const shapeObj = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  currentShape = {
    matrix: shapeObj.matrix.map((row) => row.slice()),
    color: shapeObj.color,
  };
  currentX = (COLS / 2) | 0;
  currentX -= 2; // Center the shape
  currentY = 0;

  // If it collides right away, reset grid
  if (collides(grid, currentShape.matrix, currentX, currentY)) {
    grid.forEach((row, r) => {
      grid[r].fill(0);
    });
  }
}

// Check for collision
function collides(grid, shape, offsetX, offsetY) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const newY = offsetY + r;
        const newX = offsetX + c;
        if (
          newY < 0 ||
          newY >= ROWS ||
          newX < 0 ||
          newX >= COLS ||
          grid[newY][newX] !== 0
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw stacked blocks
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== 0) {
        ctx.fillStyle = grid[r][c];
        ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }

  // Draw current falling shape
  drawShape(currentShape.matrix, currentX, currentY, currentShape.color);
}

function drawShape(shape, offsetX, offsetY, color) {
  ctx.fillStyle = color;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        ctx.fillRect(
          (offsetX + c) * BLOCK_SIZE,
          (offsetY + r) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      }
    }
  }
}