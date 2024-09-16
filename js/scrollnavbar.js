// New script for navbar functionality
const navbar = document.querySelector(".header");
const triggerHeight = window.innerHeight * 0.3; // 40% of the initial viewport height
let lastKnownScrollPosition = 0;
let ticking = false;

function updateNavbar(scrollPos) {
  if (scrollPos > triggerHeight) {
    navbar.classList.add("visible");
  } else {
    navbar.classList.remove("visible");
  }
}

function onScroll() {
  lastKnownScrollPosition = window.scrollY;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateNavbar(lastKnownScrollPosition);
      ticking = false;
    });

    ticking = true;
  }
}

// Add scroll event listener
window.addEventListener("scroll", onScroll, { passive: true });

// Initial check in case the page is loaded scrolled down
updateNavbar(window.scrollY);
