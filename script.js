// script.js
document.addEventListener('DOMContentLoaded', () => {
  // --- Tab Switching Logic (same as before) ---
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

  // --- Tetris Game Logic ---
  const canvas = document.getElementById('tetris');
  const context = canvas.getContext('2d');

  canvas.width = 240;
  canvas.height = 400;
  context.scale(20, 20);

  const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
  ];

  const arena = createMatrix(12, 20);

  // Array to hold multiple falling pieces
  let fallingPieces = [];
  const maxFallingPieces = 15; // Limit the number of simultaneous pieces
  const pieceSpawnInterval = 400; // Spawn a new piece every x milliseconds
  let lastSpawnTime = 0;


  function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  }

  function createPiece(type) {
      if (type === 'T') {
          return [
              [0, 0, 0],
              [1, 1, 1],
              [0, 1, 0],
          ];
      } else if (type === 'O') {
          return [
              [2, 2],
              [2, 2],
          ];
      } else if (type === 'L') {
          return [
              [0, 3, 0],
              [0, 3, 0],
              [0, 3, 3],
          ];
      } else if (type === 'J') {
          return [
              [0, 4, 0],
              [0, 4, 0],
              [4, 4, 0],
          ];
      } else if (type === 'I') {
          return [
              [0, 5, 0, 0],
              [0, 5, 0, 0],
              [0, 5, 0, 0],
              [0, 5, 0, 0],
          ];
      } else if (type === 'S') {
          return [
              [0, 6, 6],
              [6, 6, 0],
              [0, 0, 0],
          ];
      } else if (type === 'Z') {
          return [
              [7, 7, 0],
              [0, 7, 7],
              [0, 0, 0],
          ];
      }
  }


  function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = colors[value];
          context.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }

  function draw() {
    context.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Semi-transparent black
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });

    // Draw all falling pieces
    fallingPieces.forEach(piece => {
        drawMatrix(piece.matrix, piece.pos);
    });
  }

  function merge(arena, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + Math.floor(player.pos.y)][x + Math.floor(player.pos.x)] = value; // Use floor for merging
        }
      });
    });
  }

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            // Check for collision using floored positions
            const arenaX = x + Math.floor(o.x);
            const arenaY = y + Math.floor(o.y);
            if (m[y][x] !== 0 &&
                (arena[arenaY] && arena[arenaY][arenaX]) !== 0) {
                return true;
            }
        }
    }
    return false;
}


  function playerReset() {
      const pieces = 'ILJOTSZ';
      const newPiece = {
          pos: { x: (arena[0].length / 2 | 0) - 1, y: 0 },
          matrix: createPiece(pieces[pieces.length * Math.random() | 0]),
          // Add a random horizontal offset for variety:
          pos: { x: Math.floor(Math.random() * (arena[0].length - 2)), y: 0 }
      };

        if (collide(arena, newPiece)) {
          // Game over - clear the arena
            arena.forEach(row => row.fill(0));
            fallingPieces = []; // Reset falling pieces too
        } else{
            fallingPieces.push(newPiece);
        }
  }

 function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;  // Adjust y since we shifted the rows
    }
}


    function update(time = 0) {
      const deltaTime = time - lastTime;
      lastTime = time;

        // Spawn new pieces
        if (time - lastSpawnTime > pieceSpawnInterval && fallingPieces.length < maxFallingPieces) {
            playerReset();
            lastSpawnTime = time;
        }

      // Update and drop each piece
      fallingPieces.forEach(piece => {
        piece.pos.y += 0.02 * deltaTime;  // Smooth, deltaTime-based falling

        if (collide(arena, piece)) {
          piece.pos.y = Math.floor(piece.pos.y); // Adjust position before merging

          merge(arena, piece);
          arenaSweep();
            // Remove the piece from the array.  Using filter for easy removal.
            fallingPieces = fallingPieces.filter(p => p !== piece);

        }
      });

      draw();
      requestAnimationFrame(update);
    }


  let lastTime = 0;
  // Initial piece spawn
  playerReset(); // Start with one piece
  update();
});
