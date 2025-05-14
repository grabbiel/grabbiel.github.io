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

  // Add touch event listeners to the content area
  contentBox.addEventListener("touchstart", handleTouchStart, false);
  contentBox.addEventListener("touchend", handleTouchEnd, false);

  // Store the starting touch position
  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }

  // Calculate the swipe direction and navigate if needed
  function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;

    // Calculate horizontal and vertical movement
    const horizontalDistance = touchEndX - touchStartX;
    const verticalDistance = Math.abs(touchEndY - touchStartY);

    // Only process if it's a horizontal swipe (not a scroll)
    if (verticalDistance <= maxVerticalMovement) {
      // Check if the swipe distance exceeds the minimum threshold
      if (Math.abs(horizontalDistance) >= minSwipeDistance) {
        if (horizontalDistance > 0) {
          // Swipe right - go to previous menu item
          addSwipeFeedback("right");
          navigateToPreviousMenuItem();
        } else {
          // Swipe left - go to next menu item
          addSwipeFeedback("left");
          navigateToNextMenuItem();
        }
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
    }
  }

  // Navigate to the next menu item
  function navigateToNextMenuItem() {
    // Get the array length from the horizontalmenu.js
    if (typeof window.menuItemCount !== "number") {
      console.error(
        "menuItemCount not found. Please ensure horizontalmenu.js sets this global variable.",
      );
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
      container.addEventListener("touchstart", handleTouchStart, false);
      container.addEventListener("touchend", handleTouchEnd, false);
    }
  });

  // Handle swipe on entire document for mobile devices
  // But only activate when touch starts outside of the menu
  document.addEventListener(
    "touchstart",
    function (e) {
      // Check if the touch is not on the menu
      const menu = document.querySelector(".menu");
      if (menu && !menu.contains(e.target)) {
        handleTouchStart(e);
      }
    },
    false,
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
    false,
  );
});
