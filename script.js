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

  const arenaWidth = 12;  // Keep track of arena dimensions
  const arenaHeight = 20;
  const arena = createMatrix(arenaWidth, arenaHeight);

  let fallingPieces = [];
  const fallSpeed = 0.015;

  // --- Deterministic Filling Logic ---
  let fillSequence = []; // Array to hold the sequence of blocks
  let fillSequenceIndex = 0;
  let fillMode = true;  // Start in fill mode
  let pauseTime = 5000; // 5 seconds in milliseconds
  let lastPauseEndTime = 0;


    function createMatrix(w, h) {
        return Array.from({ length: h }, () => Array(w).fill(0));
    }

  // We only need 'I' and 'O' pieces (and single blocks) to fill.
function createPiece(type) {
    if (type === 'I') {
        return [[0, 1, 0, 0],[0, 1, 0, 0],[0, 1, 0, 0],[0, 1, 0, 0]];
    } else if (type === 'O') {
        return [[2, 2],[2, 2]];
    } else if (type === 'S') { // Single block
        return [[3]];
    }
    return null; // Should not happen in fill mode.
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
    fallingPieces.forEach(piece => {
        drawMatrix(piece.matrix, piece.pos);
    });
  }

    function merge(arena, piece) {
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const arenaX = x + Math.floor(piece.pos.x);
                    const arenaY = y + Math.floor(piece.pos.y);

                    if (arenaY >= 0 && arenaY < arena.length && arenaX >= 0 && arenaX < arena[0].length) {
                        arena[arenaY][arenaX] = value;
                    }
                }
            });
        });
    }

    function collide(arena, piece) {
        const m = piece.matrix;
        const o = piece.pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0) {
                    const arenaX = x + Math.floor(o.x);
                    const arenaY = y + Math.floor(o.y);

                    if (arenaY >= arena.length || arenaX < 0 || arenaX >= arena[0].length || (arena[arenaY] && arena[arenaY][arenaX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

  function generateFillSequence() {
        fillSequence = []; // Clear previous sequence
        for (let y = 0; y < arenaHeight; y++) {
            for (let x = 0; x < arenaWidth; x += 2) {
                // Use 'O' blocks to fill two columns at a time
                fillSequence.push({ type: 'O', x: x, y: -2 }); // Start above the screen
              if (x + 2 >= arenaWidth) {
                // Use 'I' blocks to fill one column
                fillSequence.push({ type: 'I', x: x, y: -4 });
                }

            }
        }
    }


    function spawnNextFillPiece() {
        if (fillSequenceIndex < fillSequence.length) {
            const nextPieceData = fillSequence[fillSequenceIndex];
            const newPiece = {
                pos: { x: nextPieceData.x, y: nextPieceData.y },
                matrix: createPiece(nextPieceData.type),
            };
            fallingPieces.push(newPiece);
            fillSequenceIndex++;
        } else {
            // Sequence is complete, switch to pause mode
            fillMode = false;
            lastPauseEndTime = performance.now() + pauseTime; // Set when the pause should end
            fallingPieces = []; // Ensure no pieces are left falling
        }
    }


function arenaSweep() {
        //No need to sweep in the fill-up mode.
    }

  let lastTime = 0;

    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;

        if (fillMode) {
            // Fill mode: spawn pieces from the sequence
            if (fallingPieces.length === 0) { // Only spawn if no pieces are falling
                spawnNextFillPiece();
            }

            fallingPieces.forEach(piece => {
                piece.pos.y += fallSpeed * deltaTime;
                if (collide(arena, piece)) {
                  piece.pos.y = Math.floor(piece.pos.y); // Adjust position before merging.
                    merge(arena, piece);
                    fallingPieces = fallingPieces.filter(p => p !== piece);
                }
            });
        } else {
            // Pause mode: wait for the pause to end
            if (time >= lastPauseEndTime) {
                // Pause is over, reset for the next fill
                fillMode = true;
                fillSequenceIndex = 0;
                arena.forEach(row => row.fill(0)); // Clear the arena
                generateFillSequence();  // Regenerate for next cycle
            }
        }
        draw();
        requestAnimationFrame(update);
    }



  // Initial setup
  generateFillSequence(); // Generate the sequence at the start
  update();
});
