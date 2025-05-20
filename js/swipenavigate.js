window.currentActiveMenuIndex = 0;

document.addEventListener("DOMContentLoaded", function () {
  // Get the content box where we'll detect swipes
  const contentBox = document.getElementById("content-box");

  // Variables to track touch positions
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  // Minimum swipe distance to register as a navigation (in pixels)
  const minSwipeDistance = 75;

  // Maximum vertical movement allowed for horizontal swipe to be valid (in pixels)
  // This prevents scrolling from triggering swipe navigation
  const maxVerticalMovement = 75;

  // Debounce flag to prevent multiple swipes being processed at once
  let isProcessingSwipe = false;
  // Cooldown period in milliseconds to prevent rapid swipes
  const swipeCooldown = 500;

  // Add touch event listeners to the content area
  contentBox.addEventListener("touchstart", handleTouchStart, false);
  contentBox.addEventListener("touchend", handleTouchEnd, false);

  // Function to check if the menu is visible
  function isMenuVisible() {
    const header = document.querySelector(".header");
    const isContentPage = document.body.classList.contains("content-page");
    return isContentPage || (header && header.classList.contains("visible"));
  }

  // Store the starting touch position
  function handleTouchStart(e) {
    // Only track touch if the menu is visible and we're not processing a previous swipe
    if (!isMenuVisible() || isProcessingSwipe) return;

    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }

  // Calculate the swipe direction and navigate if needed
  function handleTouchEnd(e) {
    // Don't process if the menu isn't visible or we're already handling a swipe
    if (!isMenuVisible() || isProcessingSwipe) return;

    // Check if we have valid starting coordinates (might not if touchstart was ignored)
    if (touchStartX === 0 && touchStartY === 0) return;

    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;

    // Calculate horizontal and vertical movement
    const horizontalDistance = touchEndX - touchStartX;
    const verticalDistance = Math.abs(touchEndY - touchStartY);

    // Only process if it's a horizontal swipe (not a scroll)
    if (verticalDistance <= maxVerticalMovement) {
      // Check if the swipe distance exceeds the minimum threshold
      if (Math.abs(horizontalDistance) >= minSwipeDistance) {
        // Set the flag to prevent multiple swipes
        isProcessingSwipe = true;

        if (horizontalDistance > 0) {
          // Swipe right - go to previous menu item
          addSwipeFeedback("right");
          navigateToPreviousMenuItem();
        } else {
          // Swipe left - go to next menu item
          addSwipeFeedback("left");
          navigateToNextMenuItem();
        }

        // Reset touch coordinates
        touchStartX = 0;
        touchStartY = 0;

        // Reset the processing flag after the cooldown period
        setTimeout(() => {
          isProcessingSwipe = false;
        }, swipeCooldown);
      }
    }
  }

  // Navigate to the previous menu item
  function navigateToPreviousMenuItem() {
    // Get the array length from the horizontalmenu.js
    if (typeof window.menuItemCount !== "number") {
      console.error(
        "menuItemCount not found. Please ensure horizontalmenu.js sets this global variable.",
      );
      isProcessingSwipe = false;
      return;
    }

    // Calculate the previous index (with wrap-around)
    const prevIndex =
      (window.currentActiveMenuIndex - 1 + window.menuItemCount) %
      window.menuItemCount;

    // Use the global focusItem function from horizontalmenu.js
    if (typeof window.focusItem === "function") {
      window.focusItem(prevIndex, true);
    } else {
      console.error(
        "focusItem function not found. Please ensure horizontalmenu.js exposes this function globally.",
      );
      isProcessingSwipe = false;
    }
  }

  // Navigate to the next menu item
  function navigateToNextMenuItem() {
    // Get the array length from the horizontalmenu.js
    if (typeof window.menuItemCount !== "number") {
      console.error(
        "menuItemCount not found. Please ensure horizontalmenu.js sets this global variable.",
      );
      isProcessingSwipe = false;
      return;
    }

    // Calculate the next index (with wrap-around)
    const nextIndex =
      (window.currentActiveMenuIndex + 1) % window.menuItemCount;

    // Use the global focusItem function from horizontalmenu.js
    if (typeof window.focusItem === "function") {
      window.focusItem(nextIndex, true);
    } else {
      console.error(
        "focusItem function not found. Please ensure horizontalmenu.js exposes this function globally.",
      );
      isProcessingSwipe = false;
    }
  }

  // Add visual feedback for swipe
  function addSwipeFeedback(direction) {
    const feedback = document.createElement("div");
    feedback.classList.add("swipe-feedback");
    feedback.classList.add(direction === "left" ? "swipe-left" : "swipe-right");
    document.body.appendChild(feedback);

    // Remove the feedback element after animation completes
    setTimeout(() => {
      feedback.remove();
    }, 500);
  }

  // Add similar swipe functionality for additional containers
  const containers = [
    document.querySelector(".category-container"),
    document.querySelector(".gif-container"),
    document.querySelector(".search-container"),
  ];

  containers.forEach((container) => {
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      container.addEventListener("touchend", handleTouchEnd, { passive: true });
    }
  });

  // Handle swipe on entire document for mobile devices
  // But only activate when touch starts outside of the menu
  // and when the header is visible
  document.addEventListener(
    "touchstart",
    function (e) {
      // Check if the touch is not on the menu
      const menu = document.querySelector(".menu");
      if (menu && !menu.contains(e.target)) {
        handleTouchStart(e);
      }
    },
    { passive: true },
  );

  document.addEventListener(
    "touchend",
    function (e) {
      // Check if the touch is not on the menu
      const menu = document.querySelector(".menu");
      if (menu && !menu.contains(e.target)) {
        handleTouchEnd(e);
      }
    },
    { passive: true },
  );
});
