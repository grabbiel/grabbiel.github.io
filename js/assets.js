import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, model, mixer;
let isViewerOpen = false;

// Initialize when assets content loads
document.addEventListener("htmx:afterRequest", function (event) {
  const url = event.detail.xhr.responseURL;
  if (url.includes("/assets") && !url.includes("asset-viewer")) {
    initAssetsPage();
  }
});

function initAssetsPage() {
  setupAssetClickHandlers();
}

function setupAssetClickHandlers() {
  const assetCards = document.querySelectorAll('.asset-card');
  assetCards.forEach(card => {
    if (card.dataset.listenersAdded) return;
    card.dataset.listenersAdded = "true";

    card.addEventListener('click', () => {
      const assetId = card.getAttribute('data-asset-id');
      openAssetViewer(assetId);
    });
  });
}

function openAssetViewer(assetId) {
  if (isViewerOpen) return;

  htmx.ajax('GET', `https://server.grabbiel.com/asset-viewer?id=${assetId}`, {
    target: 'body',
    swap: 'beforeend'
  }).then(() => {
    isViewerOpen = true;
    setupCloseHandler();
  });
}

function setupCloseHandler() {
  const closeBtn = document.getElementById('close-viewer');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeViewer);
  }

  // Close on escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isViewerOpen) {
      closeViewer();
    }
  });
}

function closeViewer() {
  const viewer = document.getElementById('asset-viewer');
  if (viewer) {
    // Cleanup Three.js
    if (renderer) {
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }
    if (scene) {
      scene.clear();
    }

    viewer.remove();
    isViewerOpen = false;
    renderer = null;
    scene = null;
    camera = null;
    model = null;
  }
}

// Initialize 3D viewer (called from server response)
window.initAssetViewer = function () {
  const container = document.getElementById('three-container');
  if (!container || !window.currentAssetUrl) return;

  container.innerHTML = '<div class="loading-indicator">Loading 3D model...</div>';

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x808080);

  // Camera
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(5, 5, 5);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // Ground plane
  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x999999 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  container.insertAdjacentHTML('beforeend',
    '<div class="viewer-controls">🖱️ Left click + drag to rotate<br>📱 Touch + drag to rotate</div>'
  );

  setupCameraControls(container);
  loadModel();
  window.addEventListener('resize', onWindowResize);
  animate();
};

function setupCameraControls(container) {
  let isMouseDown = false;
  let mouseX = 0, mouseY = 0;
  let phi = 0, theta = 0;
  const radius = 8;

  function updateCamera() {
    camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = radius * Math.sin(theta);
    camera.position.z = radius * Math.cos(phi) * Math.cos(theta);
    camera.lookAt(0, 0, 0);
  }

  // Mouse events
  container.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;

    const deltaX = e.clientX - mouseX;
    const deltaY = e.clientY - mouseY;

    phi += deltaX * 0.01;
    theta = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, theta + deltaY * 0.01));

    updateCamera();

    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  // Touch events
  let lastTouchX = 0, lastTouchY = 0;

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - lastTouchX;
      const deltaY = e.touches[0].clientY - lastTouchY;

      phi += deltaX * 0.01;
      theta = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, theta + deltaY * 0.01));

      updateCamera();

      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  });

  updateCamera();
}

function loadModel() {
  const loader = new THREE.GLTFLoader();

  loader.load(
    window.currentAssetUrl,
    function (gltf) {
      model = gltf.scene;

      // Center and scale model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxSize;

      model.scale.setScalar(scale);
      model.position.copy(center).multiplyScalar(-scale);
      model.position.y += (size.y * scale) / 2;

      // Enable shadows
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });

      scene.add(model);

      // Setup animations
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
      }
    },
    function (progress) {
      console.log('Loading progress:', progress);
    },
    function (error) {
      console.error('Error loading model:', error);
      const container = document.getElementById('three-container');
      container.innerHTML = '<div class="loading-indicator">Error loading 3D model</div>';
    }
  );
}

function animate() {
  if (!isViewerOpen || !renderer) return;

  requestAnimationFrame(animate);

  if (mixer) {
    mixer.update(0.016);
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  if (!camera || !renderer) return;

  const container = document.getElementById('three-container');
  if (container) {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
}
