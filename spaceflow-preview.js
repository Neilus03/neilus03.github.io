// The Iron Man image-conditioning example, rebuilt from the original teaser assets.
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const previews = document.querySelectorAll('[data-spaceflow-preview]');

async function mountPreview(link) {
  const [THREE, { GLTFLoader }, { RoomEnvironment }] = await Promise.all([
    import('./vendor/three-r180/three.module.js'),
    import('./vendor/three-r180/GLTFLoader.js'),
    import('./vendor/three-r180/RoomEnvironment.js')
  ]);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.autoClear = false;
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const room = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromScene(room, 0.04);
  room.dispose();
  generator.dispose();

  const pitch = 0.29;
  const loader = new GLTFLoader();
  const layout = [[46, 12.6, 106, 211.7], [214, 14, 126, 205]];
  const annotations = [
    { part: 5, start: [159, 15], path: link.querySelector('[data-spaceflow-leader="head"]') },
    { part: 4, start: [51, 116], path: link.querySelector('[data-spaceflow-leader="body"]') }
  ];
  let views;
  try {
    views = await Promise.all(['input', 'output'].map(async (role, index) => {
      const scene = new THREE.Scene();
      scene.environment = environment.texture;
      scene.add(new THREE.HemisphereLight(0xffffff, 0xa7a4a0, 0.8));
      const light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(-3, 5, 4);
      scene.add(light);
      const url = new URL(`figs/spaceflow/figurine-${role}.glb`, import.meta.url);
      const object = (await loader.loadAsync(url.href)).scene;

      // The input GLB stores sRGB vertex colors; Three.js expects linear values.
      if (role === 'input') object.traverse((mesh) => {
        const colors = mesh.geometry?.getAttribute('color');
        if (!colors) return;
        const linear = new Float32Array(colors.count * 3);
        const color = new THREE.Color();
        for (let i = 0; i < colors.count; i++) {
          color.setRGB(colors.getX(i), colors.getY(i), colors.getZ(i), THREE.SRGBColorSpace);
          color.toArray(linear, i * 3);
        }
        mesh.geometry.setAttribute('color', new THREE.BufferAttribute(linear, 3));
      });

      object.rotation.x = -Math.PI / 2;
      object.updateMatrixWorld(true);
      object.position.sub(new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3()));
      scene.add(object);
      object.updateMatrixWorld(true);
      let horizontalHalf = 0;
      let verticalHalf = 0;
      const vertex = new THREE.Vector3();
      const meshes = [];
      object.traverse((mesh) => {
        if (!mesh.isMesh) return;
        meshes.push(mesh);
        const positions = mesh.geometry.getAttribute('position');
        for (let i = 0; i < positions.count; i++) {
          vertex.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
          const radius = Math.hypot(vertex.x, vertex.z);
          horizontalHalf = Math.max(horizontalHalf, radius);
          verticalHalf = Math.max(verticalHalf,
            Math.abs(vertex.y) * Math.cos(pitch) + radius * Math.sin(pitch));
        }
      });
      const targets = role === 'input' ? annotations.map((spec) => {
        const mesh = meshes.find((mesh) => mesh.name === `superquadric_${spec.part}`);
        if (!mesh) throw new Error(`Missing input part ${spec.part}`);
        return { ...spec, mesh, center: new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3()) };
      }) : [];
      return { scene, camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 50),
        horizontalHalf, verticalHalf, meshes, targets, rect: layout[index] };
    }));
  } catch (error) {
    environment.dispose();
    renderer.dispose();
    throw error;
  }

  let width = 160;
  let height = 112;
  let angle = -0.65;
  let visible = false;
  let frame = 0;
  let previousTime = 0;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector3();

  function updateLeaders(view) {
    const [left, top, w, h] = view.rect;
    for (const target of view.targets) {
      ndc.copy(target.center).project(view.camera);
      raycaster.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), view.camera);
      const hit = raycaster.intersectObjects(view.meshes, false)[0];
      const shown = hit?.object === target.mesh;
      target.path.style.visibility = shown ? 'visible' : 'hidden';
      if (!shown) continue;
      const ex = left + (ndc.x + 1) * w / 2;
      const ey = top + (1 - ndc.y) * h / 2;
      const [sx, sy] = target.start;
      const dx = ex - sx;
      const dy = ey - sy;
      const distance = Math.hypot(dx, dy);
      const bend = Math.min(13, distance * 0.2);
      const cx = (sx + ex) / 2 - dy / (distance || 1) * bend;
      const cy = (sy + ey) / 2 + dx / (distance || 1) * bend;
      target.path.setAttribute('d', `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`);
    }
  }

  function render() {
    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);
    views.forEach((view) => {
      const [left, top, rw, rh] = view.rect;
      const x = left / 333 * width;
      const y = height - (top + rh) / 234 * height;
      const w = rw / 333 * width;
      const h = rh / 234 * height;
      const aspect = w / h;
      const extent = Math.max(view.verticalHalf, view.horizontalHalf / aspect) * 1.04;
      const camera = view.camera;
      camera.left = -extent * aspect;
      camera.right = extent * aspect;
      camera.top = extent;
      camera.bottom = -extent;
      camera.position.set(5 * Math.sin(angle) * Math.cos(pitch), 5 * Math.sin(pitch),
        5 * Math.cos(angle) * Math.cos(pitch));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      renderer.setViewport(x, y, w, h);
      renderer.setScissor(x, y, w, h);
      renderer.render(view.scene, camera);
      updateLeaders(view);
    });
    renderer.setScissorTest(false);
  }

  function resize() {
    const bounds = link.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    width = bounds.width;
    height = bounds.height;
    renderer.setSize(width, height, false);
    render();
  }

  function animate(time) {
    frame = window.requestAnimationFrame(animate);
    if (previousTime && time - previousTime < 1000 / 30) return;
    if (previousTime) angle += Math.min((time - previousTime) / 1000, 0.1) * 0.6;
    previousTime = time;
    render();
  }

  function sync() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    if (motion.matches) {
      angle = -0.65;
      render();
    } else if (visible && !document.hidden) {
      frame = window.requestAnimationFrame(animate);
    }
  }

  link.append(renderer.domElement);
  resize();
  link.dataset.ready = 'true';
  const sizing = new ResizeObserver(resize);
  sizing.observe(link);
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  visibility.observe(link);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  window.addEventListener('pagehide', () => {
    window.cancelAnimationFrame(frame);
    frame = 0;
  });
  window.addEventListener('pageshow', sync);
}

for (const link of previews) {
  let pending = false;
  let nearViewport = false;
  async function load() {
    if (pending || !nearViewport || motion.matches) return;
    pending = true;
    try {
      await mountPreview(link);
      observer.disconnect();
      motion.removeEventListener('change', load);
    } catch (error) {
      // The complete conditioning example remains clickable if WebGL is unavailable.
      console.warn('SpaceFlow preview could not start:', error);
    }
  }
  const observer = new IntersectionObserver(([entry]) => {
    nearViewport = entry.isIntersecting;
    load();
  }, { rootMargin: '200px' });
  observer.observe(link);
  motion.addEventListener('change', load);
}
