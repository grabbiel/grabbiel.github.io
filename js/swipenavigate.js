window.currentActiveMenuIndex = 0;

document.addEventListener("DOMContentLoaded", function () {
  const contentSlider = document.getElementById("content-slider");
  const swipeProgress = document.querySelector(".swipe-progress");

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let startTime = 0;
  let velocityX = 0;
  let lastMoveTime = 0;
  let lastMoveX = 0;

  const minSwipeDistance = 50;
  const velocityThreshold = 0.3;
  const maxPanels = window.menuItemCount || 26;

  // Touch event handlers
  contentSlider.addEventListener("touchstart", handleTouchStart, { passive: false });
  contentSlider.addEventListener("touchmove", handleTouchMove, { passive: false });
  contentSlider.addEventListener("touchend", handleTouchEnd, { passive: false });

  function handleTouchStart(e) {
    if (!isMenuVisible()) return;

    const target = e.target;
    if (target.closest(".video-overlay") || target.closest(".video-progress") ||
      target.closest(".horizontal-tabs") || target.closest(".category-tabs") ||
      target.closest(".game-content-overlay") || target.closest(".caption.expanded") || target.closest(".video-container")) {
      return;
    }

    const touch = e.touches[0];
    startY = touch.clientY;
    isDragging = true;
    startX = e.touches[0].clientX;
    currentX = startX;
    startTime = Date.now();
    lastMoveTime = startTime;
    lastMoveX = startX;

  }

  function handleTouchMove(e) {
    if (!isDragging) return;

    const target = e.target;
    if (target.closest(".video-overlay") || target.closest(".video-progress") ||
      target.closest(".horizontal-tabs") || target.closest(".category-tabs") ||
      target.closest(".game-content-overlay") || target.closest(".caption.expanded") || target.closest(".video-container")) {
      return;
    }

    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      isDragging = false;
      return;
    }

    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
      swipeProgress.classList.add("active");
    }

    const now = Date.now();

    // Calculate velocity
    if (now - lastMoveTime > 0) {
      velocityX = (currentX - lastMoveX) / (now - lastMoveTime);
      lastMoveTime = now;
      lastMoveX = currentX;
    }

    // Update progress bar
    const progress = Math.abs(deltaX) / window.innerWidth;
    swipeProgress.style.transform = `scaleX(${Math.min(progress, 1)})`;
  }

  function handleTouchEnd(e) {
    if (!isDragging) return;

    const target = e.target;
    if (target.closest(".video-overlay") || target.closest(".video-progress") ||
      target.closest(".horizontal-tabs") || target.closest(".category-tabs") ||
      target.closest(".game-content-overlay") || target.closest(".caption.expanded") || target.closest(".video-container")) {
      return;
    }

    isDragging = false;
    const deltaX = currentX - startX;
    const duration = Date.now() - startTime;
    const distance = Math.abs(deltaX);

    swipeProgress.classList.remove("active");
    swipeProgress.style.transform = "scaleX(0)";

    // Determine if we should snap to next/prev panel
    let shouldNavigate = false;
    let direction = 0;

    // Check velocity-based navigation
    if (Math.abs(velocityX) > velocityThreshold) {
      shouldNavigate = true;
      direction = velocityX > 0 ? -1 : 1; // Velocity direction is opposite to panel movement
    }
    // Check distance-based navigation
    else if (distance > minSwipeDistance) {
      shouldNavigate = true;
      direction = deltaX > 0 ? -1 : 1;
    }

    if (shouldNavigate) {
      let newIndex = window.currentActiveMenuIndex + direction;

      // Handle circular navigation
      if (newIndex < 0) {
        newIndex = maxPanels - 1; // Wrap to last panel
      } else if (newIndex >= maxPanels) {
        newIndex = 0; // Wrap to first panel
      }

      navigateToPanel(newIndex);
    }
  }

  function navigateToPanel(newIndex) {
    console.log("navigateToPanel called with:", newIndex);
    window.currentActiveMenuIndex = newIndex;
    updatePanelClasses();

    // Update menu focus
    if (typeof window.focusItem === "function") {
      window.focusItem(newIndex, true);
    }

    // Preload adjacent panels
    preloadAdjacentPanels(newIndex);
  }

  function updatePanelClasses() {
    const current = window.currentActiveMenuIndex;
    const maxPanels = window.menuItemCount || 26;

    const prevIndex = (current - 1 + maxPanels) % maxPanels;
    const nextIndex = (current + 1) % maxPanels;

    // Ensure key panels exist
    const currentPanel = getOrCreatePanel(current);
    const prevPanel = getOrCreatePanel(prevIndex);
    const nextPanel = getOrCreatePanel(nextIndex);

    // Reset all existing panels
    document.querySelectorAll('.content-panel').forEach(panel => {
      panel.className = 'content-panel hidden';
    });

    // Assign correct classes
    currentPanel.className = 'content-panel current';
    prevPanel.className = 'content-panel prev';
    nextPanel.className = 'content-panel next';
  }

  function preloadAdjacentPanels(centerIndex) {
    const maxPanels = window.menuItemCount || 26;
    const indicesToLoad = [
      (centerIndex - 1 + maxPanels) % maxPanels,
      centerIndex,
      (centerIndex + 1) % maxPanels
    ];

    indicesToLoad.forEach(index => {
      const panel = document.querySelector(`.content-panel[data-index="${index}"]`);
      if (panel && !panel.dataset.loaded && !panel.classList.contains("loading")) {
        loadPanelContent(panel, index);
      }
    });
  }

  function loadPanelContent(panel, indexOrEndpoint) {
    panel.classList.add("loading");
    panel.dataset.loaded = "loading";

    // Handle both numeric index and string endpoint
    let endpoint;
    if (typeof indexOrEndpoint === "number") {
      endpoint = window.arr[indexOrEndpoint];
    } else {
      endpoint = indexOrEndpoint;
    }

    console.log("Loading panel:", indexOrEndpoint, "endpoint:", endpoint);

    if (endpoint) {
      htmx.ajax("GET", `https://server.grabbiel.com/${endpoint}`, {
        target: panel,
        swap: "innerHTML"
      }).then(() => {
        panel.classList.remove("loading");
        if (panel.innerHTML.trim()) {
          panel.dataset.loaded = "true";
        } else {
          panel.dataset.loaded = "error";
          panel.innerHTML = '<div class="error">No content available</div>';
        }
      }).catch((error) => {
        console.log("Panel load failed:", endpoint, error);
        panel.classList.remove("loading");
        panel.dataset.loaded = "error";
      });
    }
  }

  function isMenuVisible() {
    const header = document.querySelector(".header");
    const isContentPage = document.body.classList.contains("content-page");
    return isContentPage || (header && header.classList.contains("visible"));
  }

  // Make updatePanelClasses global
  window.updatePanelClasses = updatePanelClasses;

  // Initialize with home panel
  setTimeout(() => {
    preloadAdjacentPanels(0);
    updatePanelClasses();
  }, 100);
});
