/*
  SIMPLE STARFIELD BACKGROUND + TAB LOGIC
  - Draws pixel stars falling slowly in the background.
  - No Tetris, no shapes, just a subtle starfield.
  - 2D array of star objects, each with x, y, speed, size.
*/

/* GRAB CANVAS */
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

/* RESIZE & INIT */
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* STARFIELD PARAMS */
const STAR_COUNT = 80;    // number of stars
const STAR_MIN_SPEED = 10; // minimal star speed
const STAR_MAX_SPEED = 40; // max star speed

let stars = [];

/* CREATE STARS */
function initStars() {
  stars = [];
  for(let i=0; i<STAR_COUNT; i++){
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: STAR_MIN_SPEED + Math.random() * (STAR_MAX_SPEED - STAR_MIN_SPEED),
      size: 1 + Math.random() * 2
    });
  }
}
initStars();

/* ANIMATION LOOP */
let lastTime = 0;
function animate(time){
  if(!lastTime) lastTime = time;
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  updateStars(delta);
  drawStars();

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

/* UPDATE STARS */
function updateStars(delta) {
  stars.forEach(star => {
    // move star downward
    star.y += star.speed * delta;
    // if star goes off screen, wrap to top
    if(star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });
}

/* DRAW STARS */
function drawStars() {
  ctx.clearRect(0,0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  stars.forEach(star => {
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
}

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
