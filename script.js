/**
 * Neil De La Fuente - Site Logic
 * Minimalist Swiss ETH Aesthetic - Theme Toggle & Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ─── Theme Toggle Logic ─────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  const siteNav = document.querySelector('.site-nav');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

  if (siteNav && mobileMenuToggle) {
    const setMenuOpen = (open) => {
      siteNav.classList.toggle('menu-open', open);
      mobileMenuToggle.setAttribute('aria-expanded', String(open));
      mobileMenuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    };

    mobileMenuToggle.addEventListener('click', () => {
      setMenuOpen(!siteNav.classList.contains('menu-open'));
    });

    siteNav.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    });
  }
  
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
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
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
  const trainingCanvas = document.getElementById('trainingCanvas');

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

  if (trainingCanvas) {
    const stepButton = document.getElementById('trainingStepButton');
    const resetButton = document.getElementById('trainingResetButton');
    const stepLabel = document.getElementById('trainingStepLabel');
    const lossLabel = document.getElementById('trainingLoss');
    const trainingCaption = document.getElementById('trainingCaption');
    const losses = [0.842, 0.531, 0.294, 0.137, 0.061, 0.024];
    const captions = [
      '<strong>Initial cloud:</strong> splats are misplaced and misshapen, so the current render disagrees strongly with the target.',
      '<strong>Step 1:</strong> large position errors shrink; the rough composition begins to align.',
      '<strong>Step 2:</strong> scales and rotations adapt to cover the same regions as the reference.',
      '<strong>Step 3:</strong> opacity and colour improve, reducing the remaining pixel error.',
      '<strong>Step 4:</strong> fine adjustments recover sharper boundaries and better visibility.',
      '<strong>Converged:</strong> the render now closely matches this training view. Other camera views constrain the same cloud.'
    ];
    const targetCloud = [
      { x: -0.72, y: 0.33, r: 0.62, stretch: 1.68, rotation: -0.28, hue: 203, opacity: 0.82 },
      { x: -0.18, y: 0.02, r: 0.72, stretch: 1.34, rotation: 0.42, hue: 187, opacity: 0.76 },
      { x: 0.46, y: 0.36, r: 0.63, stretch: 1.55, rotation: 0.12, hue: 231, opacity: 0.8 },
      { x: 0.70, y: -0.25, r: 0.52, stretch: 1.42, rotation: -0.58, hue: 303, opacity: 0.73 },
      { x: -0.42, y: -0.44, r: 0.49, stretch: 1.72, rotation: 0.22, hue: 163, opacity: 0.7 },
      { x: 0.08, y: -0.38, r: 0.58, stretch: 1.43, rotation: -0.08, hue: 18, opacity: 0.72 },
      { x: 0.02, y: 0.67, r: 0.31, stretch: 1.26, rotation: 0.76, hue: 53, opacity: 0.68 }
    ];
    const initialOffsets = [
      { x: -0.29, y: 0.22, r: 1.28, stretch: 0.7, rotation: 0.72, hue: 24, opacity: 0.62 },
      { x: 0.18, y: -0.31, r: 0.72, stretch: 1.38, rotation: -0.64, hue: -28, opacity: 1.2 },
      { x: -0.22, y: -0.18, r: 1.36, stretch: 0.75, rotation: 0.48, hue: 37, opacity: 0.64 },
      { x: 0.28, y: 0.29, r: 0.76, stretch: 1.35, rotation: 0.68, hue: -35, opacity: 1.1 },
      { x: -0.18, y: 0.26, r: 1.42, stretch: 0.68, rotation: -0.48, hue: 32, opacity: 0.7 },
      { x: 0.24, y: 0.19, r: 0.7, stretch: 1.3, rotation: 0.51, hue: -24, opacity: 1.24 },
      { x: -0.36, y: -0.2, r: 1.45, stretch: 0.72, rotation: -0.65, hue: 42, opacity: 0.66 }
    ];
    const trainingState = { step: 0 };

    const interpolate = (start, end, amount) => start + (end - start) * amount;

    const currentCloudAt = (amount) => targetCloud.map((target, index) => {
      const offset = initialOffsets[index];
      return {
        x: target.x + offset.x * (1 - amount),
        y: target.y + offset.y * (1 - amount),
        r: target.r * interpolate(offset.r, 1, amount),
        stretch: target.stretch * interpolate(offset.stretch, 1, amount),
        rotation: target.rotation + offset.rotation * (1 - amount),
        hue: target.hue + offset.hue * (1 - amount),
        opacity: Math.min(0.94, target.opacity * interpolate(offset.opacity, 1, amount))
      };
    });

    const drawTrainingPanel = (context, cloud, panel, height, options = {}) => {
      const { error = false, amount = 0 } = options;
      const centreX = panel.left + panel.width * 0.5;
      const centreY = height * 0.53;
      const scale = Math.min(panel.width, height) * 0.23;

      cloud.forEach((gaussian, index) => {
        const target = targetCloud[index];
        if (error) {
          paintGaussian(context, centreX + target.x * scale, centreY - target.y * scale, target.r * scale * 0.55 * target.stretch, target.r * scale * 0.55, target.rotation, 350, (1 - amount) * 0.42, { outline: true });
          paintGaussian(context, centreX + gaussian.x * scale, centreY - gaussian.y * scale, gaussian.r * scale * 0.55 * gaussian.stretch, gaussian.r * scale * 0.55, gaussian.rotation, 205, (1 - amount) * 0.42, { outline: true });
        } else {
          paintGaussian(context, centreX + gaussian.x * scale, centreY - gaussian.y * scale, gaussian.r * scale * 0.55 * gaussian.stretch, gaussian.r * scale * 0.55, gaussian.rotation, gaussian.hue, gaussian.opacity * 0.8);
        }
      });
    };

    const drawTrainingLesson = () => {
      const { context, width, height } = prepareCanvas(trainingCanvas);
      const colours = readThemeColours();
      const panelWidth = width / 3;
      const amount = trainingState.step / 5;
      const easedAmount = 1 - Math.pow(1 - amount, 2);
      const currentCloud = currentCloudAt(easedAmount);
      const panels = [
        { left: 0, width: panelWidth, label: 'TARGET PHOTO' },
        { left: panelWidth, width: panelWidth, label: 'CURRENT RENDER' },
        { left: panelWidth * 2, width: panelWidth, label: 'PIXEL ERROR' }
      ];

      context.clearRect(0, 0, width, height);
      context.fillStyle = colours.offset;
      context.fillRect(0, 0, width, height);

      panels.forEach((panel, index) => {
        context.save();
        context.beginPath();
        context.rect(panel.left, 0, panel.width, height);
        context.clip();
        drawGrid(context, panel.width, height, colours, Math.max(24, width / 34));
        context.restore();

        if (index > 0) {
          context.strokeStyle = colours.border;
          context.beginPath();
          context.moveTo(panel.left, 0);
          context.lineTo(panel.left, height);
          context.stroke();
        }

        context.fillStyle = colours.dim;
        context.font = `500 ${Math.max(9, Math.min(12, width / 95))}px JetBrains Mono, monospace`;
        context.fillText(panel.label, panel.left + 16, 24);
      });

      drawTrainingPanel(context, targetCloud, panels[0], height);
      drawTrainingPanel(context, currentCloud, panels[1], height);
      drawTrainingPanel(context, currentCloud, panels[2], height, { error: true, amount: easedAmount });

      const graphLeft = panels[2].left + 18;
      const graphTop = height - 74;
      const graphWidth = panels[2].width - 36;
      const graphHeight = 42;
      context.save();
      context.strokeStyle = colours.border;
      context.beginPath();
      context.moveTo(graphLeft, graphTop + graphHeight);
      context.lineTo(graphLeft + graphWidth, graphTop + graphHeight);
      context.stroke();
      context.strokeStyle = colours.accent;
      context.lineWidth = 2;
      context.beginPath();
      losses.forEach((loss, index) => {
        const x = graphLeft + (index / (losses.length - 1)) * graphWidth;
        const y = graphTop + (loss / losses[0]) * graphHeight;
        if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
      });
      context.stroke();
      const currentX = graphLeft + (trainingState.step / 5) * graphWidth;
      const currentY = graphTop + (losses[trainingState.step] / losses[0]) * graphHeight;
      context.fillStyle = colours.accent;
      context.beginPath();
      context.arc(currentX, currentY, 4, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const syncTrainingLesson = () => {
      stepLabel.textContent = `Step ${trainingState.step} / 5`;
      lossLabel.textContent = losses[trainingState.step].toFixed(3);
      trainingCaption.innerHTML = captions[trainingState.step];
      stepButton.textContent = trainingState.step === 5 ? 'Replay training' : 'Run one step';
      drawTrainingLesson();
    };

    stepButton.addEventListener('click', () => {
      trainingState.step = trainingState.step === 5 ? 0 : trainingState.step + 1;
      syncTrainingLesson();
    });

    resetButton.addEventListener('click', () => {
      trainingState.step = 0;
      syncTrainingLesson();
    });

    syncTrainingLesson();
    window.addEventListener('resize', drawTrainingLesson);
    themeToggle.addEventListener('click', () => requestAnimationFrame(drawTrainingLesson));
  }

  const explainerPage = document.querySelector('.explainer-page');
  const progressFill = document.getElementById('explainProgressFill');
  const chapterLinks = document.querySelectorAll('.chapter-map a');
  const progressSections = document.querySelectorAll('.explainer-lesson[id]');

  if (explainerPage && progressFill) {
    const updateExplainerProgress = () => {
      const pageTop = explainerPage.offsetTop;
      const available = Math.max(1, explainerPage.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, (window.scrollY - pageTop) / available));
      progressFill.style.width = `${progress * 100}%`;

      let activeId = progressSections[0]?.id;
      progressSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.38) activeId = section.id;
      });
      chapterLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`));
    };

    updateExplainerProgress();
    window.addEventListener('scroll', updateExplainerProgress, { passive: true });
    window.addEventListener('resize', updateExplainerProgress);
  }

});
