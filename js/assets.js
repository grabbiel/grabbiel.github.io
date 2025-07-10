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
  console.log('🚀 Initializing asset viewer...');
  console.log('📦 Current asset URL:', window.currentAssetUrl);

  isViewerOpen = true; // Fix: Set this immediately

  const container = document.getElementById('three-container');
  if (!container) {
    console.error('❌ three-container not found!');
    return;
  }
  if (!window.currentAssetUrl) {
    console.error('❌ No asset URL provided!');
    return;
  }

  container.innerHTML = '<div class="loading-indicator">Loading 3D model...</div>';

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff); // White background as requested
  console.log('✅ Scene created');

  // Camera
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(5, 5, 5);
  console.log('✅ Camera positioned at:', camera.position);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  console.log('✅ Renderer created, size:', container.clientWidth, 'x', container.clientHeight);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
  console.log('✅ Lighting added');

  // Ground plane
  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x999999 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  console.log('✅ Ground plane added');

  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  container.insertAdjacentHTML('beforeend',
    '<div class="viewer-controls">🖱️ Left click + drag to rotate<br>📱 Touch + drag to rotate<br>🔴 Red cube = renderer working</div>'
  );

  setupCameraControls(container);
  loadModel();
  window.addEventListener('resize', onWindowResize);
  animate();

  console.log('✅ Viewer initialization complete');
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
  console.log('✅ Camera controls setup complete');
}

function loadModel() {
  const url = window.currentAssetUrl;
  const extension = url.split('.').pop().toLowerCase();

  console.log('📥 Loading model:', url);
  console.log('🔍 Detected format:', extension);

  if (extension === 'fbx') {
    console.log('🔄 Importing FBXLoader...');
    // Import and use FBXLoader
    import('three/addons/loaders/FBXLoader.js').then(({ FBXLoader }) => {
      console.log('✅ FBXLoader imported successfully');
      const loader = new FBXLoader();
      loader.load(url, handleModelLoad, handleProgress, handleError);
    }).catch(error => {
      console.error('❌ Failed to load FBXLoader:', error);
      handleError(error);
    });
  } else if (extension === 'glb' || extension === 'gltf') {
    console.log('🔄 Using GLTFLoader...');
    // Use GLTFLoader for .glb/.gltf
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      console.log('✅ GLTF loaded successfully:', gltf);
      handleModelLoad(gltf.scene, gltf.animations);
    }, handleProgress, handleError);
  } else {
    const error = new Error(`Unsupported file format: ${extension}`);
    console.error('❌', error.message);
    handleError(error);
  }
}

function handleModelLoad(loadedModel, animations = null) {
  console.log('🎯 Model loaded:', loadedModel);
  model = loadedModel;

  // Center and scale model
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);
  const scale = 3 / maxSize; // Target size of 3 units max

  console.log('📐 Model bounds:', {
    size: size,
    maxSize: maxSize,
    scale: scale
  });

  model.scale.setScalar(scale);
  const center = box.getCenter(new THREE.Vector3());
  model.position.copy(center).multiplyScalar(-scale);
  model.position.y = 0; // Place on ground

  console.log('📍 Model positioned at:', model.position);
  console.log('📏 Model scale:', model.scale);

  // Count meshes and materials
  let meshCount = 0;
  let materialCount = 0;
  model.traverse((child) => {
    if (child.isMesh) {
      meshCount++;
      if (child.material) materialCount++;
      child.castShadow = true;
      child.receiveShadow = true;
      console.log('🔍 Found mesh:', child.name || 'unnamed', 'material:', !!child.material);
    }
  });

  console.log(`📊 Model stats: ${meshCount} meshes, ${materialCount} materials`);

  scene.add(model);
  console.log('✅ Model added to scene');

  // Setup animations (works for both GLTF and FBX)
  if (animations && animations.length > 0) {
    mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(animations[0]).play();
    console.log(`🎬 Started ${animations.length} animations`);
  } else if (model.animations && model.animations.length > 0) {
    // FBX animations are typically stored on the model itself
    mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(model.animations[0]).play();
    console.log(`🎬 Started ${model.animations.length} FBX animations`);
  } else {
    console.log('ℹ️ No animations found');
  }

  // Hide loading indicator
  const container = document.getElementById('three-container');
  const loadingIndicator = container.querySelector('.loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
}

function handleProgress(progress) {
  if (progress.lengthComputable) {
    const percentComplete = (progress.loaded / progress.total) * 100;
    console.log('📈 Loading progress:', Math.round(percentComplete) + '%');
  } else {
    console.log('📈 Loading progress:', progress.loaded, 'bytes loaded');
  }
}

function handleError(error) {
  console.error('❌ Error loading model:', error);
  console.error('🔍 Error details:', {
    message: error.message,
    stack: error.stack,
    url: window.currentAssetUrl
  });

  const container = document.getElementById('three-container');
  if (container) {
    container.innerHTML = `
      <div class="loading-indicator" style="color: red;">
        Error loading 3D model<br>
        <small>${error.message}</small><br>
        <small>Check console for details</small>
      </div>`;
  }
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
    console.log('🔄 Renderer resized to:', container.clientWidth, 'x', container.clientHeight);
  }
}
