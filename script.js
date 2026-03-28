/**
 * Neil De La Fuente - Site Logic
 * Minimalist Swiss ETH Aesthetic - Theme Toggle & Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ─── Theme Toggle Logic ─────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  
  // Set initial theme from localStorage or system preference
  const savedTheme = localStorage.getItem('theme') || 'light';
  htmlElement.setAttribute('data-theme', savedTheme);
  updateToggleIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateToggleIcon(newTheme);
  });

  function updateToggleIcon(theme) {
    // Swap icon based on theme
    const icon = themeToggle.querySelector('svg');
    if (theme === 'dark') {
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    } else {
      icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    }
  }

  // ─── News Section Auto-Scroll (Subtle) ───────────────────
  // Precaution: Only if the user stays on the page for a while
  const newsContainer = document.querySelector('.news-container');
  if (newsContainer) {
    // Add a subtle hint that it's scrollable if it has content overflow
    if (newsContainer.scrollHeight > newsContainer.clientHeight) {
      newsContainer.style.boxShadow = 'inset 0 -10px 10px -10px rgba(0,0,0,0.1)';
    }
  }

  // ─── Active Link Highlighting (Intersection Observer) ───
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');

  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Trigger when section is in middle of viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

});
