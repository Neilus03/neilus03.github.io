(() => {
  'use strict';
  const script = document.currentScript;
  const icon = document.querySelector('link[rel="icon"]');
  if (!script || !icon) return;

  // A turntable rendered from the original textured SpaceFlow figurine.
  // Swapping PNG frames also animates the favicon in Chrome and Safari.
  const size = 64;
  const columns = 12;
  const frameCount = 96;
  const frameDuration = 1000 / 12;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const frames = [];
  const image = new Image();
  let timer = 0;
  let startedAt = 0;

  function stop() {
    window.clearInterval(timer);
    timer = 0;
  }

  function sync() {
    stop();
    if (!frames.length) return;
    icon.href = frames[0];
    if (motion.matches) return;
    startedAt = performance.now();
    timer = window.setInterval(() => {
      const frame = Math.floor((performance.now() - startedAt) / frameDuration) % frames.length;
      icon.href = frames[frame];
    }, frameDuration);
  }

  image.addEventListener('load', () => {
    if (image.naturalWidth !== columns * size ||
        image.naturalHeight !== Math.ceil(frameCount / columns) * size) return;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) return;
    try {
      for (let i = 0; i < frameCount; i++) {
        context.clearRect(0, 0, size, size);
        context.drawImage(image, (i % columns) * size,
          Math.floor(i / columns) * size, size, size, 0, 0, size, size);
        frames.push(canvas.toDataURL('image/png'));
      }
      motion.addEventListener('change', sync);
      window.addEventListener('pagehide', stop);
      window.addEventListener('pageshow', sync);
      sync();
    } catch (_) {
      // The linked frontal PNG remains available if animation is unsupported.
    }
  }, { once: true });

  image.src = new URL('figs/spaceflow-figurine-frames.png?v=20261002-figurine', script.src).href;
})();
