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
    const menuItems = document.querySelectorAll(".menu--item");
    if (!menuItems.length) return;

    // Find the currently active item and its index
    let currentIndex = -1;
    for (let i = 0; i < menuItems.length; i++) {
      const content = menuItems[i].querySelector(".menu--item-content");
      if (content && content.style.color === "rgb(156, 9, 255)") {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex === -1) currentIndex = 0;

    // Calculate the previous index (with wrap-around)
    const prevIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;

    // Trigger a click on the previous item
    menuItems[prevIndex].click();
  }

  // Navigate to the next menu item
  function navigateToNextMenuItem() {
    const menuItems = document.querySelectorAll(".menu--item");
    if (!menuItems.length) return;

    // Find the currently active item and its index
    let currentIndex = -1;
    for (let i = 0; i < menuItems.length; i++) {
      const content = menuItems[i].querySelector(".menu--item-content");
      if (content && content.style.color === "rgb(156, 9, 255)") {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex === -1) currentIndex = 0;

    // Calculate the next index (with wrap-around)
    const nextIndex = (currentIndex + 1) % menuItems.length;

    // Trigger a click on the next item
    menuItems[nextIndex].click();
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
