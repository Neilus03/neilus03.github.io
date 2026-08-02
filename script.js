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

  // ─── Pi5 Explains: instance segmentation lessons ──────
  const segTaskCanvas = document.getElementById('segTaskCanvas');
  const awarenessCanvas = document.getElementById('awarenessCanvas');
  const methodCanvas = document.getElementById('methodCanvas');

  const readSegColours = () => {
    const rootStyles = getComputedStyle(document.documentElement);
    const pageStyles = document.querySelector('.segmentation-page')
      ? getComputedStyle(document.querySelector('.segmentation-page'))
      : rootStyles;
    return {
      ...readThemeColours(),
      violet: pageStyles.getPropertyValue('--seg-violet').trim() || '#7064f6',
      coral: pageStyles.getPropertyValue('--seg-coral').trim() || '#ff5f78',
      mint: pageStyles.getPropertyValue('--seg-mint').trim() || '#18b98f',
      yellow: pageStyles.getPropertyValue('--seg-yellow').trim() || '#e4a917',
      dark: document.documentElement.getAttribute('data-theme') === 'dark'
    };
  };

  const roundedRect = (context, x, y, width, height, radius) => {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.arcTo(x + width, y, x + width, y + height, safeRadius);
    context.arcTo(x + width, y + height, x, y + height, safeRadius);
    context.arcTo(x, y + height, x, y, safeRadius);
    context.arcTo(x, y, x + width, y, safeRadius);
    context.closePath();
  };

  const drawCanvasTag = (context, text, x, y, colour, options = {}) => {
    const { align = 'left', darkText = false } = options;
    context.save();
    context.font = '600 12px JetBrains Mono, monospace';
    const width = context.measureText(text).width + 20;
    const left = align === 'right' ? x - width : x;
    roundedRect(context, left, y - 19, width, 25, 5);
    context.fillStyle = colour;
    context.fill();
    context.fillStyle = darkText ? '#141414' : '#ffffff';
    context.fillText(text, left + 10, y - 2);
    context.restore();
  };

  const carPath = (context, object) => {
    const { x, y, scale = 1 } = object;
    context.beginPath();
    context.moveTo(x, y + 43 * scale);
    context.lineTo(x + 18 * scale, y + 17 * scale);
    context.quadraticCurveTo(x + 25 * scale, y + 8 * scale, x + 43 * scale, y + 8 * scale);
    context.lineTo(x + 95 * scale, y + 8 * scale);
    context.quadraticCurveTo(x + 112 * scale, y + 10 * scale, x + 126 * scale, y + 31 * scale);
    context.lineTo(x + 153 * scale, y + 37 * scale);
    context.quadraticCurveTo(x + 162 * scale, y + 40 * scale, x + 162 * scale, y + 52 * scale);
    context.lineTo(x + 162 * scale, y + 66 * scale);
    context.lineTo(x, y + 66 * scale);
    context.closePath();
    context.moveTo(x + 35 * scale, y + 66 * scale);
    context.arc(x + 35 * scale, y + 66 * scale, 15 * scale, 0, Math.PI * 2);
    context.moveTo(x + 129 * scale, y + 66 * scale);
    context.arc(x + 129 * scale, y + 66 * scale, 15 * scale, 0, Math.PI * 2);
  };

  const personPath = (context, object) => {
    const { x, y, scale = 1 } = object;
    context.beginPath();
    context.arc(x + 18 * scale, y + 14 * scale, 13 * scale, 0, Math.PI * 2);
    context.moveTo(x + 8 * scale, y + 31 * scale);
    context.quadraticCurveTo(x + 18 * scale, y + 24 * scale, x + 29 * scale, y + 31 * scale);
    context.lineTo(x + 37 * scale, y + 82 * scale);
    context.lineTo(x + 27 * scale, y + 82 * scale);
    context.lineTo(x + 24 * scale, y + 128 * scale);
    context.lineTo(x + 12 * scale, y + 128 * scale);
    context.lineTo(x + 9 * scale, y + 82 * scale);
    context.lineTo(x, y + 82 * scale);
    context.closePath();
  };

  const dogPath = (context, object) => {
    const { x, y, scale = 1 } = object;
    context.beginPath();
    context.ellipse(x + 43 * scale, y + 33 * scale, 39 * scale, 23 * scale, -0.08, 0, Math.PI * 2);
    context.moveTo(x + 78 * scale, y + 27 * scale);
    context.arc(x + 82 * scale, y + 25 * scale, 18 * scale, 0, Math.PI * 2);
    context.moveTo(x + 82 * scale, y + 40 * scale);
    context.lineTo(x + 91 * scale, y + 78 * scale);
    context.lineTo(x + 80 * scale, y + 78 * scale);
    context.lineTo(x + 69 * scale, y + 46 * scale);
    context.moveTo(x + 26 * scale, y + 48 * scale);
    context.lineTo(x + 20 * scale, y + 78 * scale);
    context.lineTo(x + 9 * scale, y + 78 * scale);
    context.lineTo(x + 10 * scale, y + 39 * scale);
    context.moveTo(x + 7 * scale, y + 28 * scale);
    context.quadraticCurveTo(x - 12 * scale, y + 5 * scale, x - 4 * scale, y - 6 * scale);
  };

  const robotPath = (context, object) => {
    const { x, y, scale = 1 } = object;
    context.beginPath();
    context.moveTo(x + 10 * scale, y + 22 * scale);
    context.quadraticCurveTo(x + 12 * scale, y + 7 * scale, x + 27 * scale, y + 7 * scale);
    context.lineTo(x + 78 * scale, y + 7 * scale);
    context.quadraticCurveTo(x + 92 * scale, y + 8 * scale, x + 94 * scale, y + 23 * scale);
    context.lineTo(x + 88 * scale, y + 66 * scale);
    context.lineTo(x + 16 * scale, y + 66 * scale);
    context.closePath();
    context.moveTo(x + 28 * scale, y + 69 * scale);
    context.arc(x + 28 * scale, y + 69 * scale, 12 * scale, 0, Math.PI * 2);
    context.moveTo(x + 76 * scale, y + 69 * scale);
    context.arc(x + 76 * scale, y + 69 * scale, 12 * scale, 0, Math.PI * 2);
    context.moveTo(x + 52 * scale, y + 7 * scale);
    context.lineTo(x + 52 * scale, y - 9 * scale);
    context.arc(x + 52 * scale, y - 13 * scale, 5 * scale, 0, Math.PI * 2);
  };

  const sceneObjects = [
    { id: '01', className: 'car', x: 105, y: 331, scale: 1.08, path: carPath },
    { id: '02', className: 'car', x: 595, y: 345, scale: 0.82, path: carPath },
    { id: '03', className: 'person', x: 422, y: 258, scale: 0.9, path: personPath },
    { id: '04', className: 'person', x: 505, y: 288, scale: 0.72, path: personPath },
    { id: '05', className: 'dog', x: 790, y: 363, scale: 0.72, path: dogPath },
    { id: '06', className: 'delivery robot', x: 300, y: 370, scale: 0.74, path: robotPath, novel: true }
  ];

  const maskPalette = ['#ff5f78', '#7064f6', '#18b98f', '#e4a917', '#2d8ce8', '#d85fb3'];
  const classPalette = { car: '#7064f6', person: '#ff5f78', dog: '#e4a917', 'delivery robot': '#18b98f' };

  const paintSceneObjects = (context, options = {}) => {
    const { mode = 'image', alpha = 1, includeRobot = true, labels = true } = options;
    const visibleObjects = sceneObjects.filter((object) => includeRobot || !object.novel);
    visibleObjects.forEach((object, index) => {
      const maskColour = mode === 'semantic' ? classPalette[object.className] : maskPalette[index];
      context.save();
      object.path(context, object);
      if (mode === 'image') {
        const baseColours = { car: '#426a82', person: '#bc674a', dog: '#936d35', 'delivery robot': '#5c6574' };
        context.fillStyle = baseColours[object.className];
        context.strokeStyle = '#20252b';
        context.lineWidth = 2;
        context.fill();
        context.stroke();
      } else {
        context.globalAlpha = alpha;
        context.fillStyle = maskColour;
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.fill();
        context.stroke();
      }
      context.restore();

      if (mode === 'image') {
        context.save();
        if (object.className === 'car') {
          context.fillStyle = '#a8d2dc';
          context.fillRect(object.x + 39 * object.scale, object.y + 17 * object.scale, 58 * object.scale, 20 * object.scale);
        }
        if (object.className === 'delivery robot') {
          context.fillStyle = '#bce7ed';
          roundedRect(context, object.x + 25 * object.scale, object.y + 20 * object.scale, 54 * object.scale, 24 * object.scale, 5 * object.scale);
          context.fill();
        }
        context.restore();
      }

      if (mode !== 'image' && labels) {
        const label = mode === 'semantic' ? object.className : `${object.className} ${object.id}`;
        const labelX = object.x + (object.className === 'person' ? 15 : 4) * object.scale;
        const labelY = object.y - 2;
        drawCanvasTag(context, label.toUpperCase(), labelX, labelY, maskColour);
      }
    });
  };

  const drawStreetBase = (context, colours) => {
    context.fillStyle = colours.dark ? '#202a36' : '#d9edf2';
    context.fillRect(0, 0, 1000, 250);
    context.fillStyle = colours.dark ? '#2d3540' : '#c8c3b8';
    context.fillRect(0, 250, 1000, 78);
    context.fillStyle = colours.dark ? '#171b22' : '#62666b';
    context.fillRect(0, 328, 1000, 172);

    const buildings = [
      { x: 35, y: 70, w: 190, h: 180, c: '#8da1ae' },
      { x: 245, y: 105, w: 140, h: 145, c: '#b27868' },
      { x: 635, y: 55, w: 160, h: 195, c: '#7895a1' },
      { x: 812, y: 90, w: 150, h: 160, c: '#b9976f' }
    ];
    buildings.forEach((building) => {
      context.fillStyle = colours.dark ? '#3c4650' : building.c;
      context.fillRect(building.x, building.y, building.w, building.h);
      context.fillStyle = colours.dark ? '#80909b' : '#dce9e7';
      for (let x = building.x + 22; x < building.x + building.w - 15; x += 45) {
        for (let y = building.y + 25; y < building.y + building.h - 22; y += 48) {
          context.fillRect(x, y, 22, 27);
        }
      }
    });

    context.fillStyle = colours.dark ? '#4a5562' : '#f3efe6';
    context.fillRect(0, 310, 1000, 18);
    context.strokeStyle = colours.dark ? '#8b8e75' : '#f4df77';
    context.lineWidth = 5;
    context.setLineDash([48, 35]);
    context.beginPath();
    context.moveTo(0, 448);
    context.lineTo(1000, 448);
    context.stroke();
    context.setLineDash([]);

    context.fillStyle = colours.dark ? '#315b4c' : '#4e8c65';
    context.beginPath();
    context.arc(917, 230, 72, 0, Math.PI * 2);
    context.arc(852, 245, 47, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = colours.dark ? '#584938' : '#765943';
    context.fillRect(890, 244, 20, 78);
  };

  const withLogicalScene = (canvas, callback) => {
    const { context, width, height } = prepareCanvas(canvas);
    const colours = readSegColours();
    context.clearRect(0, 0, width, height);
    context.fillStyle = colours.offset;
    context.fillRect(0, 0, width, height);
    const scale = Math.min(width / 1000, height / 500);
    const offsetX = (width - 1000 * scale) / 2;
    const offsetY = (height - 500 * scale) / 2;
    context.save();
    context.translate(offsetX, offsetY);
    context.scale(scale, scale);
    callback(context, colours);
    context.restore();
  };

  if (segTaskCanvas) {
    const taskButtons = document.querySelectorAll('[data-seg-task]');
    const taskCaption = document.getElementById('segTaskCaption');
    const classStatus = document.getElementById('segClassStatus');
    const identityStatus = document.getElementById('segIdentityStatus');
    const coverageStatus = document.getElementById('segCoverageStatus');
    const taskState = { mode: 'image' };
    const taskCopy = {
      image: {
        caption: '<strong>Image:</strong> humans see objects immediately, but the computer only receives a grid of colour values.',
        classes: '—', identities: '—', coverage: 'pixels'
      },
      semantic: {
        caption: '<strong>Semantic segmentation:</strong> every car shares violet and every person shares coral. The classes are known, but same-class individuals are not separated.',
        classes: 'yes', identities: 'no', coverage: 'all pixels'
      },
      instance: {
        caption: '<strong>Instance segmentation:</strong> each countable object gets its own colour and ID. Background “stuff” can remain outside the output.',
        classes: 'often', identities: 'yes', coverage: 'things'
      },
      panoptic: {
        caption: '<strong>Panoptic segmentation:</strong> stuff such as sky and road receives a class, while every countable thing also keeps a separate identity.',
        classes: 'yes', identities: 'things', coverage: 'all pixels'
      }
    };

    const drawTaskScene = () => withLogicalScene(segTaskCanvas, (context, colours) => {
      drawStreetBase(context, colours);
      if (taskState.mode === 'image') {
        paintSceneObjects(context, { mode: 'image' });
      } else {
        context.save();
        context.globalAlpha = 0.16;
        paintSceneObjects(context, { mode: 'image' });
        context.restore();

        if (taskState.mode === 'semantic' || taskState.mode === 'panoptic') {
          context.save();
          context.globalAlpha = taskState.mode === 'panoptic' ? 0.4 : 0.58;
          context.fillStyle = '#4faecc';
          context.fillRect(0, 0, 1000, 250);
          context.fillStyle = '#d59a36';
          context.fillRect(0, 328, 1000, 172);
          context.fillStyle = '#86929b';
          context.fillRect(0, 250, 1000, 78);
          context.restore();
          drawCanvasTag(context, 'SKY · STUFF', 24, 40, '#3188a8');
          drawCanvasTag(context, 'ROAD · STUFF', 24, 475, '#af7618');
        }

        paintSceneObjects(context, {
          mode: taskState.mode === 'semantic' ? 'semantic' : 'instance',
          alpha: 0.82,
          labels: true
        });
      }

      context.save();
      context.fillStyle = colours.text;
      context.font = '700 17px Syne, sans-serif';
      context.fillText(taskState.mode === 'image' ? 'INPUT IMAGE' : `${taskState.mode.toUpperCase()} OUTPUT`, 24, 30);
      context.restore();
    });

    const syncTaskScene = () => {
      const copy = taskCopy[taskState.mode];
      taskCaption.innerHTML = copy.caption;
      classStatus.textContent = copy.classes;
      identityStatus.textContent = copy.identities;
      coverageStatus.textContent = copy.coverage;
      drawTaskScene();
    };

    taskButtons.forEach((button) => {
      button.addEventListener('click', () => {
        taskState.mode = button.dataset.segTask;
        taskButtons.forEach((candidate) => {
          const active = candidate === button;
          candidate.classList.toggle('active', active);
          candidate.setAttribute('aria-pressed', String(active));
        });
        syncTaskScene();
      });
    });

    syncTaskScene();
    window.addEventListener('resize', drawTaskScene);
    themeToggle.addEventListener('click', () => requestAnimationFrame(drawTaskScene));
  }

  if (awarenessCanvas) {
    const awarenessButtons = document.querySelectorAll('[data-awareness-mode]');
    const awarenessTitle = document.getElementById('awarenessModeTitle');
    const awarenessCaption = document.getElementById('awarenessCaption');
    const awarenessSchema = document.getElementById('awarenessSchema');
    const awarenessNovel = document.getElementById('awarenessNovel');
    const awarenessSemantics = document.getElementById('awarenessSemantics');
    const awarenessState = { mode: 'aware' };
    const awarenessCopy = {
      aware: {
        title: 'Closed-set class-aware',
        caption: '<strong>Known vocabulary:</strong> masks carry labels from a fixed training set. The unfamiliar delivery robot may be missed or forced into the wrong class.',
        schema: 'mask + class + score', novel: 'may be missed', semantics: 'fixed vocabulary'
      },
      agnostic: {
        title: 'Class-agnostic instances',
        caption: '<strong>Separate without naming:</strong> every candidate object can receive an identity such as mask 1 or mask 2. A later stage may attach semantics.',
        schema: 'mask + score', novel: 'mask candidate', semantics: 'none required'
      },
      open: {
        title: 'Open-vocabulary class-aware',
        caption: '<strong>Flexible names:</strong> a text-conditioned system can use a runtime concept such as “delivery robot.” It is open-vocabulary, but still class-aware because it names the mask.',
        schema: 'mask + text class', novel: 'queried by name', semantics: 'flexible vocabulary'
      }
    };

    const drawAwarenessScene = () => withLogicalScene(awarenessCanvas, (context, colours) => {
      drawStreetBase(context, colours);
      context.save();
      context.globalAlpha = 0.18;
      paintSceneObjects(context, { mode: 'image' });
      context.restore();

      const known = sceneObjects.filter((object) => !object.novel);
      const objects = awarenessState.mode === 'aware' ? known : sceneObjects;
      objects.forEach((object, index) => {
        const colour = awarenessState.mode === 'aware'
          ? classPalette[object.className]
          : maskPalette[index];
        context.save();
        object.path(context, object);
        context.globalAlpha = 0.82;
        context.fillStyle = colour;
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.fill();
        context.stroke();
        context.restore();
        let label;
        if (awarenessState.mode === 'agnostic') label = `MASK ${String(index + 1).padStart(2, '0')}`;
        else label = object.className.toUpperCase();
        drawCanvasTag(context, label, object.x, object.y - 3, colour);
      });

      const novel = sceneObjects.find((object) => object.novel);
      if (awarenessState.mode === 'aware') {
        context.save();
        novel.path(context, novel);
        context.strokeStyle = colours.coral;
        context.lineWidth = 3;
        context.setLineDash([9, 7]);
        context.stroke();
        context.restore();
        drawCanvasTag(context, 'UNKNOWN → BACKGROUND?', novel.x - 22, novel.y - 4, colours.coral);
      }

      if (awarenessState.mode === 'open') {
        drawCanvasTag(context, 'TEXT: “DELIVERY ROBOT”', 690, 62, colours.mint, { darkText: true });
        context.save();
        context.strokeStyle = colours.mint;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(797, 67);
        context.quadraticCurveTo(590, 105, novel.x + 55, novel.y - 16);
        context.stroke();
        context.restore();
      }

      context.fillStyle = colours.text;
      context.font = '700 17px Syne, sans-serif';
      context.fillText(awarenessCopy[awarenessState.mode].title.toUpperCase(), 24, 30);
    });

    const syncAwareness = () => {
      const copy = awarenessCopy[awarenessState.mode];
      awarenessTitle.textContent = copy.title;
      awarenessCaption.innerHTML = copy.caption;
      awarenessSchema.textContent = copy.schema;
      awarenessNovel.textContent = copy.novel;
      awarenessSemantics.textContent = copy.semantics;
      drawAwarenessScene();
    };

    awarenessButtons.forEach((button) => {
      button.addEventListener('click', () => {
        awarenessState.mode = button.dataset.awarenessMode;
        awarenessButtons.forEach((candidate) => {
          const active = candidate === button;
          candidate.classList.toggle('active', active);
          candidate.setAttribute('aria-pressed', String(active));
        });
        syncAwareness();
      });
    });

    syncAwareness();
    window.addEventListener('resize', drawAwarenessScene);
    themeToggle.addEventListener('click', () => requestAnimationFrame(drawAwarenessScene));
  }

  if (methodCanvas) {
    const methodTabs = document.querySelectorAll('[data-method]');
    const methodEyebrow = document.getElementById('methodEyebrow');
    const methodTitle = document.getElementById('methodTitle');
    const methodDescription = document.getElementById('methodDescription');
    const methodFootnote = document.getElementById('methodFootnote');
    const methodSteps = [
      document.getElementById('methodStepOne'),
      document.getElementById('methodStepTwo'),
      document.getElementById('methodStepThree')
    ];
    const methodState = { method: 'topdown' };
    const methodCopy = {
      topdown: {
        eyebrow: 'DETECT → CROP → MASK',
        title: 'Top-down: find objects, then trace them.',
        description: 'A detector proposes a box for each likely object. A mask head predicts foreground pixels inside every proposal. Mask R-CNN is the classic example.',
        steps: ['image features', 'object boxes', 'masks + labels'],
        footnote: '<strong>Class relation:</strong> often class-aware, although a shared class-agnostic mask head is also possible.'
      },
      bottomup: {
        eyebrow: 'PIXELS → CUES → GROUPS',
        title: 'Bottom-up: let pixels vote for their group.',
        description: 'The network predicts dense cues such as centres, offsets, boundaries, or embeddings. A grouping step joins pixels that point to the same object.',
        steps: ['pixel features', 'centres / affinity', 'grouped masks'],
        footnote: '<strong>Class relation:</strong> grouping can be class-agnostic; a semantic head can name the resulting groups.'
      },
      query: {
        eyebrow: 'QUERIES → MATCH → MASK SET',
        title: 'Query-based: one slot competes for one object.',
        description: 'A set of learned queries attends to the image. Each useful query predicts a mask and usually a class; unused queries predict “no object.” Mask2Former follows this set-prediction view.',
        steps: ['learned queries', 'image attention', 'mask set'],
        footnote: '<strong>Class relation:</strong> the query can output a closed-set class, an open-vocabulary label, or a category-free mask score.'
      },
      prompt: {
        eyebrow: 'PROMPT → REGION → MASK',
        title: 'Promptable: tell the model where to look.',
        description: 'A point, box, or prior mask identifies the intended region. The model returns one or more plausible masks, which is useful when “the object” is ambiguous.',
        steps: ['point / box', 'prompt encoding', 'class-free masks'],
        footnote: '<strong>Class relation:</strong> Segment Anything predicts masks without names; another model is needed if the application also needs semantics.'
      }
    };

    const drawMethodScene = () => {
      const { context, width, height } = prepareCanvas(methodCanvas);
      const colours = readSegColours();
      context.clearRect(0, 0, width, height);
      context.fillStyle = colours.bg;
      context.fillRect(0, 0, width, height);
      drawGrid(context, width, height, colours, Math.max(28, width / 16));

      const scale = Math.min(width / 1000, height / 620);
      const offsetX = (width - 1000 * scale) / 2;
      const offsetY = (height - 620 * scale) / 2;
      context.save();
      context.translate(offsetX, offsetY);
      context.scale(scale, scale);

      context.fillStyle = colours.offset;
      roundedRect(context, 65, 115, 360, 390, 18);
      context.fill();
      context.strokeStyle = colours.border;
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = colours.dim;
      context.font = '500 12px JetBrains Mono, monospace';
      context.fillText('IMAGE FEATURES', 88, 146);

      const miniCar = { x: 110, y: 320, scale: 1.25 };
      const miniPerson = { x: 300, y: 210, scale: 1.2 };
      context.save();
      carPath(context, miniCar);
      context.fillStyle = colours.violet;
      context.globalAlpha = 0.75;
      context.fill();
      context.restore();
      context.save();
      personPath(context, miniPerson);
      context.fillStyle = colours.coral;
      context.globalAlpha = 0.78;
      context.fill();
      context.restore();

      context.strokeStyle = colours.accent;
      context.fillStyle = colours.accent;
      context.lineWidth = 2;

      if (methodState.method === 'topdown') {
        context.save();
        context.setLineDash([9, 6]);
        context.strokeRect(96, 318, 217, 112);
        context.strokeRect(291, 204, 58, 164);
        context.restore();
        drawCanvasTag(context, 'BOX 01', 98, 309, colours.violet);
        drawCanvasTag(context, 'BOX 02', 291, 195, colours.coral);
        context.beginPath();
        context.moveTo(450, 310);
        context.lineTo(560, 310);
        context.stroke();
        drawCanvasTag(context, 'MASK HEAD', 476, 295, colours.accent);
        context.save();
        context.translate(575, 0);
        const carCopy = { ...miniCar, x: 40 };
        const personCopy = { ...miniPerson, x: 245 };
        carPath(context, carCopy);
        context.fillStyle = colours.violet;
        context.fill();
        personPath(context, personCopy);
        context.fillStyle = colours.coral;
        context.fill();
        context.restore();
      } else if (methodState.method === 'bottomup') {
        for (let y = 185; y < 450; y += 20) {
          for (let x = 95; x < 400; x += 20) {
            const carZone = x > 105 && x < 315 && y > 315 && y < 435;
            const personZone = x > 290 && x < 355 && y > 205 && y < 375;
            context.beginPath();
            context.arc(x, y, carZone || personZone ? 4.2 : 2.4, 0, Math.PI * 2);
            context.fillStyle = carZone ? colours.violet : personZone ? colours.coral : colours.border;
            context.fill();
          }
        }
        [[208, 370, colours.violet], [323, 286, colours.coral]].forEach(([x, y, colour]) => {
          context.strokeStyle = colour;
          context.lineWidth = 3;
          context.beginPath();
          context.arc(x, y, 17, 0, Math.PI * 2);
          context.stroke();
          drawCanvasTag(context, 'CENTRE', x - 36, y - 27, colour);
        });
        drawCanvasTag(context, 'GROUP PIXELS BY VOTE', 555, 315, colours.accent);
        context.beginPath();
        context.moveTo(430, 330);
        context.lineTo(545, 330);
        context.stroke();
      } else if (methodState.method === 'query') {
        const queries = [
          { y: 185, colour: colours.violet, label: 'Q1 → car mask' },
          { y: 270, colour: colours.coral, label: 'Q2 → person mask' },
          { y: 355, colour: colours.dim, label: 'Q3 → no object' }
        ];
        queries.forEach((query, index) => {
          drawCanvasTag(context, `Q${index + 1}`, 520, query.y, query.colour);
          context.strokeStyle = query.colour;
          context.beginPath();
          context.moveTo(565, query.y - 7);
          context.bezierCurveTo(625, query.y - 80, 690, query.y + 65, 760, query.y - 5);
          context.stroke();
          context.fillStyle = query.colour;
          context.font = '600 13px JetBrains Mono, monospace';
          context.fillText(query.label, 780, query.y - 2);
        });
        drawCanvasTag(context, 'SET PREDICTION', 655, 465, colours.accent);
      } else {
        context.strokeStyle = colours.yellow;
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(323, 270);
        context.lineTo(323, 306);
        context.moveTo(305, 288);
        context.lineTo(341, 288);
        context.stroke();
        drawCanvasTag(context, 'POINT PROMPT', 270, 190, colours.yellow, { darkText: true });
        context.beginPath();
        context.moveTo(324, 205);
        context.lineTo(324, 266);
        context.stroke();
        context.beginPath();
        context.moveTo(450, 310);
        context.lineTo(565, 310);
        context.strokeStyle = colours.accent;
        context.stroke();
        context.save();
        context.translate(575, 0);
        const promptedPerson = { ...miniPerson, x: 155 };
        personPath(context, promptedPerson);
        context.fillStyle = colours.coral;
        context.globalAlpha = 0.85;
        context.fill();
        context.restore();
        drawCanvasTag(context, 'MASK · NO CLASS NAME', 670, 430, colours.coral);
      }

      context.restore();
    };

    const syncMethod = () => {
      const copy = methodCopy[methodState.method];
      methodEyebrow.textContent = copy.eyebrow;
      methodTitle.textContent = copy.title;
      methodDescription.textContent = copy.description;
      methodFootnote.innerHTML = copy.footnote;
      methodSteps.forEach((step, index) => { step.textContent = copy.steps[index]; });
      drawMethodScene();
    };

    methodTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        methodState.method = tab.dataset.method;
        methodTabs.forEach((candidate) => {
          const active = candidate === tab;
          candidate.classList.toggle('active', active);
          candidate.setAttribute('aria-selected', String(active));
        });
        syncMethod();
      });
    });

    syncMethod();
    window.addEventListener('resize', drawMethodScene);
    themeToggle.addEventListener('click', () => requestAnimationFrame(drawMethodScene));
  }

  const scenarioButtons = document.querySelectorAll('[data-scenario]');
  if (scenarioButtons.length) {
    const scenarioRecommendation = document.getElementById('scenarioRecommendation');
    const scenarioReason = document.getElementById('scenarioReason');
    const scenarioIdentity = document.getElementById('scenarioIdentity');
    const scenarioClass = document.getElementById('scenarioClass');
    const scenarioCoverage = document.getElementById('scenarioCoverage');
    const scenarios = {
      traffic: {
        recommendation: 'Class-aware instance segmentation',
        reason: 'You need a separate mask for every vehicle and a category such as car, van, or bicycle for the count.',
        identity: '<b>IDENTITY</b> required', className: '<b>CLASS</b> required', coverage: '<b>ALL PIXELS</b> not required'
      },
      click: {
        recommendation: 'Promptable class-agnostic segmentation',
        reason: 'The user already indicates the object with a click. You need its boundary, not a predefined semantic taxonomy.',
        identity: '<b>IDENTITY</b> prompted', className: '<b>CLASS</b> optional', coverage: '<b>ALL PIXELS</b> not required'
      },
      scene: {
        recommendation: 'Panoptic segmentation',
        reason: 'The road, sky, and buildings need semantic regions, while each person and vehicle must remain a distinct thing.',
        identity: '<b>IDENTITY</b> for things', className: '<b>CLASS</b> required', coverage: '<b>ALL PIXELS</b> required'
      },
      warehouse: {
        recommendation: 'Class-agnostic instances + classifier',
        reason: 'First discover and separate product-shaped regions without assuming a stable catalogue. Name or embed each crop in a second stage.',
        identity: '<b>IDENTITY</b> required', className: '<b>CLASS</b> later', coverage: '<b>ALL PIXELS</b> not required'
      }
    };

    scenarioButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const scenario = scenarios[button.dataset.scenario];
        scenarioRecommendation.textContent = scenario.recommendation;
        scenarioReason.textContent = scenario.reason;
        scenarioIdentity.innerHTML = scenario.identity;
        scenarioClass.innerHTML = scenario.className;
        scenarioCoverage.innerHTML = scenario.coverage;
        scenarioButtons.forEach((candidate) => {
          const active = candidate === button;
          candidate.classList.toggle('active', active);
          candidate.setAttribute('aria-pressed', String(active));
        });
      });
    });
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
