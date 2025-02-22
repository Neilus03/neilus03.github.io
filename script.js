/* Starfield + Tab Switching */

// Number of stars
const STAR_COUNT = 100;

let canvas, ctx;
let stars = [];

document.addEventListener('DOMContentLoaded', () => {
  // Canvas init
  canvas = document.getElementById('starfield');
  ctx = canvas.getContext('2d');
  resizeCanvas();

  // Create star objects
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.5 + Math.random() * 1.5,
      size: Math.random() * 1.5,
    });
  }

  // Start animation
  requestAnimationFrame(animateStars);

  // Handle tab switching
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Remove active from all
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));

      // Activate clicked tab
      button.classList.add('active');
      document.getElementById(button.getAttribute('data-tab')).classList.add('active');
    });
  });
});

// Keep canvas full screen on resize
window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Animate starfield
function animateStars() {
  // Clear
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Move & draw each star
  ctx.fillStyle = '#fff';
  stars.forEach((star) => {
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });

  requestAnimationFrame(animateStars);
}
