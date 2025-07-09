const menu = document.querySelector(".menu");
const wrapper = document.querySelector(".menu--wrapper");
const fragment = document.createDocumentFragment();
const itemCount = 26;
let items;
let menuWidth = menu.clientWidth;
const itemWidth = Math.max(menu.clientWidth / 8, 100);
let wrapWidth = itemCount * itemWidth;
let scrollY = 0;
let y = 0;
let oldScrollY = 0;
const arr = [
  "home", "photos", "links", "blog", "videos", "read", "github", "food",
  "music", "anime", "renders", "writing", "vynils", "travel", "tierlist",
  "quiz", "wishlist", "donate", "foreign", "leetcode", "pretty", "robots",
  "stats", "assets", "forum", "games"
];

window.menuItemCount = itemCount;
window.currentActiveMenuIndex = 0;
window.arr = arr; // Expose for swipe navigation

// Create menu items
for (let i = 0; i < itemCount; i++) {
  const item = document.createElement("div");
  item.className = "menu--item";
  item.setAttribute("data-endpoint", arr[i]);
  item.setAttribute("data-index", i);
  item.style.minWidth = `${itemWidth}px`;
  item.innerHTML = `<div class="menu--item-content">${arr[i]}</div>`;
  fragment.appendChild(item);
}
wrapper.appendChild(fragment);
items = Array.from(wrapper.children);

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

function dispose(scroll) {
  for (let i = 0; i < itemCount; ++i) {
    let x = (i * itemWidth + scroll) % wrapWidth;
    if (x < 0) x += wrapWidth;
    if (x > wrapWidth - itemWidth) x -= wrapWidth;
    items[i].style.transform = `translateX(${x}px)`;
  }
}

function handleWheel(e) {
  e.preventDefault();
  const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
  scrollY -= delta * 0.9;
}

let touchStart = 0;
let touchX = 0;
let isDragging = false;
let isMouseDragging = false;

function handleTouchStart(e) {
  touchStart = e.clientX || e.touches[0].clientX;
  isDragging = true;
}

function handleTouchMove(e) {
  if (!isDragging) return;
  touchX = e.clientX || e.touches[0].clientX;
  scrollY += (touchX - touchStart) * 2.5;
  touchStart = touchX;
}

function handleTouchEnd() {
  isDragging = false;
}

menu.addEventListener("wheel", handleWheel, { passive: false });
menu.addEventListener("touchstart", handleTouchStart);
menu.addEventListener("touchmove", handleTouchMove);
menu.addEventListener("touchend", handleTouchEnd);
menu.addEventListener("mousedown", (e) => {
  touchStart = e.clientX;
  isMouseDragging = false;
});
menu.addEventListener("mousemove", (e) => {
  if (e.buttons === 1) {
    isMouseDragging = true;
    touchX = e.clientX;
    scrollY += (touchX - touchStart) * 2.5;
    touchStart = touchX;
  }
});
menu.addEventListener("mouseup", () => {
  isMouseDragging = false;
});
menu.addEventListener("mouseleave", () => {
  isDragging = false;
  isMouseDragging = false;
});
menu.addEventListener("selectstart", () => false);

window.addEventListener("resize", () => {
  menuWidth = menu.clientWidth;
  wrapWidth = itemCount * itemWidth;
});

function getOrCreatePanel(index) {
  console.log(`looking for panel[data-index=${index}]`);
  let panel = document.querySelector(`.content-panel[data-index="${index}"]`);
  if (!panel) {
    console.log('panel not found... creating one');
    panel = document.createElement("div");
    panel.className = "content-panel";
    panel.setAttribute("data-index", index);
    panel.setAttribute("data-menu", arr[index]);
    document.getElementById("content-slider").appendChild(panel);
  }
  return panel;
}

function loadPanelContent(panel, endpoint) {
  if (panel.dataset.loaded === "true") return;

  panel.classList.add("loading");
  panel.dataset.loaded = "loading";

  htmx.ajax("GET", `https://server.grabbiel.com/${endpoint}`, {
    target: panel,
    swap: "innerHTML"
  }).then(() => {
    panel.classList.remove("loading");
    panel.dataset.loaded = "true";
  }).catch(() => {
    panel.classList.remove("loading");
    panel.dataset.loaded = "error";
    panel.innerHTML = '<div class="error">Failed to load content</div>';
  });
}

// TODO: Collect all menu-specific listeners
function cleanupMenuListeners(menuName) {
  switch (menuName) {
    case 'videos':
      window.cleanup_video_listeners();
      break;

    default:
      break;
  }
}

function focusItem(itemIndex, triggerRequest = true, endpoint = null) {
  console.log("inside focusItem()");
  if (endpoint != null) {
    itemIndex = arr.findIndex(item => item === endpoint);
    if (itemIndex === -1) return;
  }

  // Reset all menu items
  items.forEach(item => {
    item.querySelector(".menu--item-content").style.color = "";
  });

  // Focus the selected item
  const item = items[itemIndex];
  const content = item.querySelector(".menu--item-content");
  content.style.color = "rgb(156, 9, 255)";

  // menu-specific listener: cleanup 
  const previousMenu = arr[window.currentActiveMenuIndex];
  const newMenu = arr[itemIndex];
  if (previousMenu !== newMenu) {
    cleanupMenuListeners(previousMenu);
  }
  if (arr[itemIndex] === 'videos' && window.activateVideosPage) {
    window.activateVideosPage();
  }
  window.currentActiveMenuIndex = itemIndex;


  if (itemIndex === 0) {
    document.body.classList.remove("content-page");
  } else {
    document.body.classList.add("content-page");
  }

  // Center the focused item in menu
  const itemRect = item.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const centerOffset = (menuRect.width - itemRect.width) >> 1;
  scrollY -= itemRect.left - menuRect.left - centerOffset;

  if (typeof window.updatePanelClasses === "function") {
    window.updatePanelClasses();
  }

  if (triggerRequest) {
    console.log("focusItem() -> loadPanels");
    const currentPanel = getOrCreatePanel(itemIndex);
    loadPanelContent(currentPanel, arr[itemIndex]);

    const prevIndex = (itemIndex - 1) % window.menuItemCount;
    const prevPanel = getOrCreatePanel(prevIndex);
    if (prevPanel.dataset.loaded !== "true") {
      loadPanelContent(prevPanel, arr[prevIndex]);
    }
    const nextIndex = (itemIndex + 1) % window.menuItemCount;
    const nextPanel = getOrCreatePanel(nextIndex);
    if (nextPanel.dataset.loaded !== "true") {
      loadPanelContent(nextPanel, arr[nextIndex]);
    }
  }

  // Scroll to top if not home
  if (itemIndex !== 0) {
    const slider = document.getElementById("content-slider");
    if (slider) slider.scrollIntoView();
  }
}

window.focusItem = focusItem;

window.focusItemByEndpoint = function (endpoint) {
  const index = arr.findIndex(item => item === endpoint);
  if (index !== -1) {
    focusItem(index, true);
  }
};

// Menu item click handlers
items.forEach((item, i) => {
  item.addEventListener("touchend", (e) => {
    if (!isDragging) {
      e.preventDefault();
      focusItem(i, true);
    }
  });

  item.addEventListener("click", (e) => {
    if (isMouseDragging) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      focusItem(i, true);
    }
  });
});

function render() {
  y = lerp(y, scrollY, 0.1);
  dispose(y);
  requestAnimationFrame(render);
}

// Initialize
window.addEventListener("load", () => {
  const pendingEndpoint = sessionStorage.getItem("pendingEndpoint");
  if (pendingEndpoint) {
    sessionStorage.removeItem("pendingEndpoint");
    window.focusItemByEndpoint(pendingEndpoint);
  } else {
    console.log("/home endpoint called");
    focusItem(0, true);
  }
});

render();

