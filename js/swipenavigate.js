window.currentActiveMenuIndex = 0;

document.addEventListener("DOMContentLoaded", function () {
  const contentSlider = document.getElementById("content-slider");
  const swipeProgress = document.querySelector(".swipe-progress");

  let isDragging = false;
  let startX = 0;
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
      target.closest(".game-content-overlay") || target.closest(".caption.expanded")) {
      return;
    }

    isDragging = true;
    startX = e.touches[0].clientX;
    currentX = startX;
    startTime = Date.now();
    lastMoveTime = startTime;
    lastMoveX = startX;

    contentSlider.classList.add("dragging");
    swipeProgress.classList.add("active");
  }

  function handleTouchMove(e) {
    if (!isDragging) return;

    e.preventDefault();

    currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    const now = Date.now();

    // Calculate velocity
    if (now - lastMoveTime > 0) {
      velocityX = (currentX - lastMoveX) / (now - lastMoveTime);
      lastMoveTime = now;
      lastMoveX = currentX;
    }

    // Update slider position
    updateSliderPosition(deltaX);

    // Update progress bar
    const progress = Math.abs(deltaX) / window.innerWidth;
    swipeProgress.style.transform = `scaleX(${Math.min(progress, 1)})`;
  }

  function handleTouchEnd(e) {
    if (!isDragging) return;

    isDragging = false;
    const deltaX = currentX - startX;
    const duration = Date.now() - startTime;
    const distance = Math.abs(deltaX);

    contentSlider.classList.remove("dragging");
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
    } else {
      // Snap back to current panel
      resetSliderPosition();
    }
  }

  function updateSliderPosition(deltaX) {
    const currentOffset = -window.currentActiveMenuIndex * window.innerWidth;
    const newOffset = currentOffset + deltaX;

    // Add resistance at boundaries
    const maxOffset = 0;
    const minOffset = -(maxPanels - 1) * window.innerWidth;

    let finalOffset = newOffset;
    if (newOffset > maxOffset) {
      finalOffset = maxOffset + (newOffset - maxOffset) * 0.3;
    } else if (newOffset < minOffset) {
      finalOffset = minOffset + (newOffset - minOffset) * 0.3;
    }

    contentSlider.style.transform = `translateX(${finalOffset}px)`;
  }

  function resetSliderPosition() {
    const targetOffset = -window.currentActiveMenuIndex * window.innerWidth;
    contentSlider.style.transform = `translateX(${targetOffset}px)`;
  }
  function updatePanelClasses() {
    console.log("updatePanelClasses called, currentActiveMenuIndex:", window.currentActiveMenuIndex);

    const panels = document.querySelectorAll('.content-panel');
    console.log("Found panels:", panels.length);

    const current = window.currentActiveMenuIndex;

    panels.forEach(panel => {
      const index = parseInt(panel.dataset.index);
      console.log(`Panel ${index}: before classes:`, panel.className);

      panel.className = 'content-panel';

      if (index === current) panel.classList.add('current');
      else if (index === current - 1) panel.classList.add('prev');
      else if (index === current + 1) panel.classList.add('next');
      else panel.classList.add('hidden');

      console.log(`Panel ${index}: after classes:`, panel.className);
    });
  }

  function navigateToPanel(newIndex) {
    console.log("navigateToPanel called with:", newIndex);
    window.currentActiveMenuIndex = newIndex;
    updatePanelClasses();

    if (typeof window.focusItem === "function") {
      window.focusItem(newIndex, true);
    }
    preloadAdjacentPanels(newIndex);
  }

  function preloadAdjacentPanels(centerIndex) {
    const indicesToLoad = [
      centerIndex - 1,
      centerIndex,
      centerIndex + 1
    ].filter(i => i >= 0 && i < maxPanels);

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
        console.log("Panel loaded successfully:", endpoint);
        panel.classList.remove("loading");
        panel.dataset.loaded = "true";
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

  // Initialize with home panel
  setTimeout(() => {
    preloadAdjacentPanels(0);
  }, 100);
});


console.log("swipenavigate.js loaded");
console.log("window.arr available:", window.arr);
console.log("Current active index:", window.currentActiveMenuIndex);
