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

  // ─── Pi5 Explains: Gaussian cloud interaction ──────────
  const splatStage = document.querySelector('.splat-stage');
  const splatButton = document.querySelector('.splat-button');

  if (splatStage) {
    splatStage.addEventListener('pointermove', (event) => {
      const bounds = splatStage.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 24;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 24;
      splatStage.style.setProperty('--pointer-x', `${x}px`);
      splatStage.style.setProperty('--pointer-y', `${y}px`);
    });

    splatStage.addEventListener('pointerleave', () => {
      splatStage.style.setProperty('--pointer-x', '0px');
      splatStage.style.setProperty('--pointer-y', '0px');
    });
  }

  if (splatButton && splatStage) {
    splatButton.addEventListener('click', () => {
      const shuffled = splatStage.classList.toggle('is-shuffled');
      splatButton.setAttribute('aria-pressed', String(shuffled));
      splatButton.textContent = shuffled ? 'Reassemble the cloud' : 'Shuffle the cloud';
    });
  }

  // ─── Pi5 Explains: interactive Gaussian lessons ────────
  const gaussianCanvas = document.getElementById('gaussianCanvas');
  const sceneCanvas = document.getElementById('sceneCanvas');

  const readThemeColours = () => {
    const styles = getComputedStyle(document.documentElement);
    return {
      bg: styles.getPropertyValue('--bg').trim(),
      offset: styles.getPropertyValue('--bg-offset').trim(),
      border: styles.getPropertyValue('--border').trim(),
      text: styles.getPropertyValue('--text').trim(),
      dim: styles.getPropertyValue('--text-dim').trim(),
      accent: styles.getPropertyValue('--accent').trim()
    };
  };

  const prepareCanvas = (canvas) => {
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));

    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }

    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { context, width, height };
  };

  const drawGrid = (context, width, height, colours, spacing = 36) => {
    context.save();
    context.strokeStyle = colours.border;
    context.globalAlpha = 0.45;
    context.lineWidth = 1;
    for (let x = spacing / 2; x < width; x += spacing) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = spacing / 2; y < height; y += spacing) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.restore();
  };

  const paintGaussian = (context, x, y, radiusX, radiusY, rotation, hue, opacity, options = {}) => {
    const { outline = false, centre = false } = options;
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.scale(radiusX, radiusY);
    const gradient = context.createRadialGradient(-0.25, -0.28, 0.04, 0, 0, 1);
    gradient.addColorStop(0, `hsla(${hue}, 100%, 90%, ${Math.min(1, opacity + 0.18)})`);
    gradient.addColorStop(0.42, `hsla(${hue}, 85%, 60%, ${opacity})`);
    gradient.addColorStop(0.78, `hsla(${hue}, 82%, 47%, ${opacity * 0.2})`);
    gradient.addColorStop(1, `hsla(${hue}, 75%, 42%, 0)`);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(0, 0, 1, 0, Math.PI * 2);
    context.fill();

    if (outline) {
      context.strokeStyle = `hsla(${hue}, 70%, 42%, 0.78)`;
      context.lineWidth = 1 / Math.max(radiusX, radiusY);
      context.setLineDash([0.08, 0.06]);
      context.beginPath();
      context.arc(0, 0, 0.74, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();

    if (centre) {
      context.save();
      context.fillStyle = `hsl(${hue}, 75%, 42%)`;
      context.beginPath();
      context.arc(x, y, 4, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = '#ffffff';
      context.lineWidth = 1.5;
      context.stroke();
      context.restore();
    }
  };

  if (gaussianCanvas) {
    const gaussianInputs = {
      scale: document.getElementById('gaussianScale'),
      stretch: document.getElementById('gaussianStretch'),
      rotation: document.getElementById('gaussianRotation'),
      opacity: document.getElementById('gaussianOpacity')
    };
    const gaussianOutputs = {
      scale: document.getElementById('gaussianScaleOutput'),
      stretch: document.getElementById('gaussianStretchOutput'),
      rotation: document.getElementById('gaussianRotationOutput'),
      opacity: document.getElementById('gaussianOpacityOutput'),
      position: document.getElementById('gaussianPositionReadout')
    };
    const gaussianState = { x: 0.5, y: 0.5, dragging: false };

    const drawGaussianLesson = () => {
      const { context, width, height } = prepareCanvas(gaussianCanvas);
      const colours = readThemeColours();
      const scale = Number(gaussianInputs.scale.value);
      const stretch = Number(gaussianInputs.stretch.value) / 100;
      const rotation = Number(gaussianInputs.rotation.value);
      const opacity = Number(gaussianInputs.opacity.value) / 100;
      const x = gaussianState.x * width;
      const y = gaussianState.y * height;

      context.clearRect(0, 0, width, height);
      context.fillStyle = colours.offset;
      context.fillRect(0, 0, width, height);
      drawGrid(context, width, height, colours, Math.max(28, Math.round(width / 14)));

      context.save();
      context.strokeStyle = colours.border;
      context.setLineDash([4, 5]);
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
      context.restore();

      paintGaussian(context, x, y, scale * stretch, scale, rotation * Math.PI / 180, 211, opacity, { outline: true, centre: true });

      context.save();
      context.fillStyle = colours.dim;
      context.font = `500 ${Math.max(10, width / 48)}px JetBrains Mono, monospace`;
      context.fillText('μ · centre', Math.min(width - 110, x + 12), Math.max(18, y - 12));
      context.fillText('Σ · scale + orientation', 18, height - 18);
      context.restore();

      gaussianOutputs.scale.value = scale;
      gaussianOutputs.stretch.value = `${stretch.toFixed(2)}×`;
      gaussianOutputs.rotation.value = `${rotation}°`;
      gaussianOutputs.opacity.value = `${Math.round(opacity * 100)}%`;
      gaussianOutputs.position.textContent = `μ = (${((gaussianState.x - 0.5) * 2).toFixed(2)}, ${((0.5 - gaussianState.y) * 2).toFixed(2)})`;
    };

    Object.values(gaussianInputs).forEach((input) => input.addEventListener('input', drawGaussianLesson));

    const updateGaussianCentre = (event) => {
      const bounds = gaussianCanvas.getBoundingClientRect();
      gaussianState.x = Math.min(0.82, Math.max(0.18, (event.clientX - bounds.left) / bounds.width));
      gaussianState.y = Math.min(0.78, Math.max(0.22, (event.clientY - bounds.top) / bounds.height));
      drawGaussianLesson();
    };

    gaussianCanvas.addEventListener('pointerdown', (event) => {
      gaussianState.dragging = true;
      gaussianCanvas.setPointerCapture(event.pointerId);
      updateGaussianCentre(event);
    });
    gaussianCanvas.addEventListener('pointermove', (event) => {
      if (gaussianState.dragging) updateGaussianCentre(event);
    });
    gaussianCanvas.addEventListener('pointerup', () => { gaussianState.dragging = false; });
    gaussianCanvas.addEventListener('pointercancel', () => { gaussianState.dragging = false; });

    drawGaussianLesson();
    window.addEventListener('resize', drawGaussianLesson);
    themeToggle.addEventListener('click', () => requestAnimationFrame(drawGaussianLesson));
  }

  if (sceneCanvas) {
    const angleInput = document.getElementById('sceneAngle');
    const angleOutput = document.getElementById('sceneAngleReadout');
    const caption = document.getElementById('sceneCaption');
    const resetButton = document.querySelector('.reset-scene');
    const modeButtons = document.querySelectorAll('.mode-button');
    const sceneState = { angle: 0, mode: 'geometry' };
    const cloud = [
      { x: -1.05, y: 0.72, z: 0.26, r: 0.84, stretch: 1.65, rotation: -0.22, hue: 203, opacity: 0.82 },
      { x: -0.45, y: 0.42, z: -0.48, r: 0.72, stretch: 1.3, rotation: 0.5, hue: 188, opacity: 0.78 },
      { x: 0.36, y: 0.68, z: 0.36, r: 0.76, stretch: 1.72, rotation: 0.1, hue: 230, opacity: 0.82 },
      { x: 1.00, y: 0.32, z: -0.14, r: 0.68, stretch: 1.34, rotation: -0.56, hue: 289, opacity: 0.76 },
      { x: -0.73, y: -0.34, z: 0.42, r: 0.64, stretch: 1.72, rotation: 0.26, hue: 168, opacity: 0.73 },
      { x: 0.04, y: -0.18, z: -0.36, r: 0.91, stretch: 1.42, rotation: -0.12, hue: 322, opacity: 0.78 },
      { x: 0.76, y: -0.50, z: 0.38, r: 0.61, stretch: 1.58, rotation: 0.44, hue: 16, opacity: 0.73 },
      { x: -0.18, y: 0.98, z: -0.2, r: 0.43, stretch: 1.28, rotation: 0.9, hue: 52, opacity: 0.72 }
    ];

    const drawSceneLesson = () => {
      const { context, width, height } = prepareCanvas(sceneCanvas);
      const colours = readThemeColours();
      const split = width * 0.47;
      const angle = sceneState.angle * Math.PI / 180;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const fontSize = Math.max(9, Math.min(13, width / 82));
      const projected = cloud.map((gaussian) => {
        const cameraX = gaussian.x * cosine - gaussian.z * sine;
        const depth = gaussian.x * sine + gaussian.z * cosine;
        return { ...gaussian, cameraX, depth };
      });

      context.clearRect(0, 0, width, height);
      context.fillStyle = colours.offset;
      context.fillRect(0, 0, width, height);
      drawGrid(context, split, height, colours, Math.max(25, Math.round(width / 26)));
      context.save();
      context.translate(split, 0);
      drawGrid(context, width - split, height, colours, Math.max(25, Math.round(width / 26)));
      context.restore();

      context.save();
      context.strokeStyle = colours.border;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(split, 0);
      context.lineTo(split, height);
      context.stroke();
      context.fillStyle = colours.dim;
      context.font = `500 ${fontSize}px JetBrains Mono, monospace`;
      context.fillText('3D GAUSSIAN CLOUD', 18, 25);
      context.fillText(sceneState.mode === 'geometry' ? 'PROJECTED FOOTPRINTS' : 'ALPHA-BLENDED RENDER', split + 18, 25);
      context.restore();

      const leftCentreX = split * 0.5;
      const leftCentreY = height * 0.56;
      context.save();
      context.strokeStyle = colours.dim;
      context.globalAlpha = 0.35;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(leftCentreX - 120, leftCentreY + 52);
      context.lineTo(leftCentreX + 120, leftCentreY + 52);
      context.moveTo(leftCentreX, leftCentreY + 92);
      context.lineTo(leftCentreX, leftCentreY - 110);
      context.moveTo(leftCentreX - 84, leftCentreY + 90);
      context.lineTo(leftCentreX + 84, leftCentreY + 8);
      context.stroke();
      context.restore();

      projected.slice().sort((a, b) => b.depth - a.depth).forEach((gaussian) => {
        const x = leftCentreX + gaussian.cameraX * split * 0.2 + gaussian.depth * 22;
        const y = leftCentreY - gaussian.y * height * 0.27 + gaussian.depth * 22;
        const scale = 1 / (1.55 + gaussian.depth * 0.14);
        paintGaussian(context, x, y, gaussian.r * 28 * gaussian.stretch * scale, gaussian.r * 28 * scale, gaussian.rotation + angle * 0.22, gaussian.hue, gaussian.opacity * 0.6, { outline: true, centre: true });
      });

      context.save();
      context.fillStyle = colours.accent;
      context.font = `500 ${fontSize}px JetBrains Mono, monospace`;
      context.fillText(`CAMERA ${sceneState.angle >= 0 ? '+' : ''}${sceneState.angle}°`, 18, height - 18);
      context.restore();

      const renderCentreX = split + (width - split) * 0.5;
      const renderCentreY = height * 0.55;
      projected.slice().sort((a, b) => b.depth - a.depth).forEach((gaussian) => {
        const scale = 1 / (1.35 + gaussian.depth * 0.18);
        const x = renderCentreX + gaussian.cameraX * (width - split) * 0.21 * scale;
        const y = renderCentreY - gaussian.y * height * 0.32 * scale;
        const alpha = sceneState.mode === 'geometry' ? gaussian.opacity * 0.34 : gaussian.opacity * 0.78;
        paintGaussian(context, x, y, gaussian.r * 62 * gaussian.stretch * scale, gaussian.r * 62 * scale, gaussian.rotation + angle * 0.18, gaussian.hue, alpha, { outline: sceneState.mode === 'geometry', centre: sceneState.mode === 'geometry' });
      });
    };

    const syncScene = () => {
      angleOutput.value = `${sceneState.angle}°`;
      caption.innerHTML = sceneState.mode === 'geometry'
        ? '<strong>Geometry view:</strong> the left panel is the 3D cloud; the right panel shows the projected ellipses before they are blended.'
        : '<strong>Blend render:</strong> draw the farthest translucent footprint first, then blend nearer Gaussians over it to form a view.';
      drawSceneLesson();
    };

    angleInput.addEventListener('input', () => {
      sceneState.angle = Number(angleInput.value);
      syncScene();
    });

    modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        sceneState.mode = button.dataset.renderMode;
        modeButtons.forEach((candidate) => {
          const isActive = candidate === button;
          candidate.classList.toggle('active', isActive);
          candidate.setAttribute('aria-pressed', String(isActive));
        });
        syncScene();
      });
    });

    resetButton.addEventListener('click', () => {
      sceneState.angle = 0;
      sceneState.mode = 'geometry';
      angleInput.value = '0';
      modeButtons.forEach((button) => {
        const isActive = button.dataset.renderMode === 'geometry';
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
      syncScene();
    });

    syncScene();
    window.addEventListener('resize', drawSceneLesson);
    themeToggle.addEventListener('click', () => requestAnimationFrame(drawSceneLesson));
  }

});
