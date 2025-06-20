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
  "home", // 0
  "photos", // 1
  "links", // 2
  "news", // 3
  "videos", // 4
  "read", // 5
  "github", // 6
  "food", // 7
  "music", // 8
  "anime", // 9
  "renders", // 10
  "writing", // 11
  "vynils", // 12
  "travel", // 13
  "fishing", // 14
  "scuba", // 15
  "wishlist", // 16
  "donate", // 17
  "foreign", // 18
  "leetcode", // 19
  "pretty", // 20
  "robots", // 21
  "stats", // 22
  "assets", // 23
  "forum", // 24
  "updates", // 25
];

window.menuItemCount = itemCount;
window.currentActiveMenuIndex = 0;

// Create menu items
for (let i = 0; i < itemCount; i++) {
  const item = document.createElement("div");
  item.className = "menu--item";
  item.setAttribute("hx-get", "https://server.grabbiel.com/" + arr[i]);
  item.setAttribute("hx-trigger", "click");
  item.setAttribute("hx-swap", "innerHTML");
  item.setAttribute("hx-target", "#content-box");

  item.style.minWidth = `${itemWidth}px`;
  item.innerHTML = `<div 
    class="menu--item-content" 
  >${arr[i]}</div>`;
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
  // Use deltaX for horizontal scrolling, fall back to deltaY if deltaX is 0
  const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
  scrollY -= delta * 0.9;
}

// pc
let dragThreshold = 5;
let startX = 0;
let clickStartTime = 0;
let hasMovedEnough = false;

// phone
let touchStart = 0;
let touchX = 0;
let isDragging = false;

function handleTouchStart(e) {
  touchStart = e.clientX || e.touches[0].clientX;
  startX = touchStart;
  isDragging = true;
  hasMovedEnough = false;
  clickStartTime = Date.now();
}

function handleTouchMove(e) {
  if (!isDragging) return;
  touchX = e.clientX || e.touches[0].clientX;
  if (Math.abs(touchX - startX) > dragThreshold) {
    hasMovedEnough = true;
  }
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
menu.addEventListener("mousedown", handleTouchStart);
menu.addEventListener("mousemove", handleTouchMove);
menu.addEventListener("mouseleave", handleTouchEnd);
menu.addEventListener("mouseup", handleTouchEnd);
menu.addEventListener("selectstart", () => false);

window.addEventListener("resize", () => {
  menuWidth = menu.clientWidth;
  wrapWidth = itemCount * itemWidth;
  updateHeaderHeight();
});

const middleIndex = ((itemCount - 1) / 2) | 0;
const content_box = document.getElementById("content-box");

function triggerHtmxRequest(item) {
  const url = item.getAttribute("hx-get");
  const target = item.getAttribute("hx-target");

  htmx.ajax("GET", url, {
    target: target,
    swap: "innerHTML",
  });
}
content_box.addEventListener("htmx:beforeRequest", function () {
  this.classList.add("loading");
});

content_box.addEventListener("htmx:afterRequest", function () {
  this.classList.remove("loading");
});

function findMenuIndexByEndpoint(endpoint) {
  return arr.findIndex((item) => item == endpoint);
}

function focusItem(itemIndex, triggerRequest = true, endpoint = null) {
  if (endpoint != null) {
    itemIndex = findMenuIndexByEndpoint(endpoint);
    if (itemIndex == 1) return;
  }

  // Reset all items
  const item = items[itemIndex];
  for (let i = 0; i < itemCount; ++i) {
    items[i].querySelector(".menu--item-content").style.color = "";
  }
  // Focus the clicked item
  const content = item.querySelector(".menu--item-content");
  content.style.color = "rgb(156, 9, 255)";

  window.currentActiveMenuIndex = itemIndex;

  if (itemIndex == 0) {
    document.body.classList.remove("content-page");
  } else {
    document.body.classList.add("content-page");
  }

  // Center the focused item
  const itemRect = item.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const centerOffset = (menuRect.width - itemRect.width) >> 1;
  scrollY -= itemRect.left - menuRect.left - centerOffset;

  if (itemIndex !== 0 && itemIndex !== middleIndex) {
    content_box.scrollIntoView();
  }

  if (triggerRequest) {
    triggerHtmxRequest(item);
  }
}

window.focusItem = focusItem;

window.focusItemByEndpoint = function (endpoint) {
  const index = findMenuIndexByEndpoint(endpoint);
  if (index !== -1) {
    focusItem(index, true);
  }
};

for (let i = 0; i < itemCount; ++i) {
  items[i].addEventListener("click", (e) => {
    const clickDuration = Date.now() - clickStartTime;
    if (hasMovedEnough || clickDuration > 200) {
      e.preventDefault();
      e.stopPropagation();
      hasMovedEnough = false;
      return;
    }
    focusItem(i, true);
    hasMovedEnough = false;
  });

  items[i].addEventListener("touchend", (e) => {
    if (!isDragging && !hasMovedEnough) {
      e.preventDefault();
      focusItem(i, true);
    }
  });
}

function focusMiddleItem() {
  focusItem(middleIndex);
  // Adjust scrollY to center the middle item
  scrollY = -middleIndex * itemWidth + menuWidth / 2 - itemWidth / 2;
}

function render() {
  y = lerp(y, scrollY, 0.1);
  dispose(y);

  requestAnimationFrame(render);
}

function updateHeaderHeight() {
  const header = document.querySelector(".header");
  const headerHeight = header.offsetHeight;
  document.documentElement.style.setProperty(
    "--header-height",
    headerHeight + "px",
  );
}

window.addEventListener("load", () => {
  const pendingEndpoint = sessionStorage.getItem("pendingEndpoint");
  if (pendingEndpoint) {
    sessionStorage.removeItem("pendingEndpoint");
    window.focusItemByEndpoint(pendingEndpoint);
  } else {
    const homeIndex = 0;

    // Reset all items
    const homeItem = items[homeIndex];
    for (let i = 0; i < itemCount; ++i) {
      items[i].querySelector(".menu--item-content").style.color = "";
    }

    // Focus the home item
    const content = homeItem.querySelector(".menu--item-content");
    content.style.color = "rgb(156, 9, 255)";

    // Update the global current active menu index
    window.currentActiveMenuIndex = homeIndex;

    // Center the focused item
    const itemRect = homeItem.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const centerOffset = (menuRect.width - itemRect.width) >> 1;
    scrollY -= itemRect.left - menuRect.left - centerOffset;

    // Load the home content
    triggerHtmxRequest(homeItem);
  }
  if (window.currentActiveMenuIndex !== 0) {
    document.body.classList.add("content-page");
  }
  updateHeaderHeight();
});

render();
