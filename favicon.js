(() => {
  'use strict';

  const script = document.currentScript;
  const icon = document.querySelector('link[rel="icon"]');
  if (!script || !icon) return;

  // Chrome displays only the first frame of animated image favicons. Swap
  // pre-rendered PNG frames instead; the favicon needs no 3D renderer.
  const size = 64;
  const columns = 8;
  const frameCount = 32;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const image = new Image();
  const frames = [];
  let frame = 0;
  let timer = 0;

  function stop() {
    window.clearInterval(timer);
    timer = 0;
  }

  function sync() {
    stop();
    if (!frames.length) return;
    if (motion.matches) {
      frame = 0;
      icon.href = frames[0];
      return;
    }
    if (document.hidden) return;
    timer = window.setInterval(() => {
      frame = (frame + 1) % frames.length;
      icon.href = frames[frame];
    }, 125);
  }

  image.addEventListener('load', () => {
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
      icon.href = frames[0];
      document.addEventListener('visibilitychange', sync);
      motion.addEventListener('change', sync);
      window.addEventListener('pagehide', stop);
      window.addEventListener('pageshow', sync);
      sync();
    } catch (_) {
      // Keep the linked static PNG if frame decoding is unavailable.
    }
  }, { once: true });

  image.src = new URL('figs/spaceflow-favicon-frames.png?v=20260930', script.src).href;
})();
