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
  "photos", // 0 
  "links", // 1 
  "news", // 2 
  "videos", // 3 
  "read", // 4 
  "github", // 5 
  "food", // 6 
  "music", // 7
  "anime", // 8 
  "renders", // 9 
  "writing", // 10 
  "vynils", // 11 
  "travel", // 12 
  "fishing", // 13 
  "scuba", // 14 
  "wishlist", // 15   
  "donate", // 16 
  "foreign", // 17 
  "leetcode", // 18 
  "pretty", // 19 
  "robots", // 20
  "stats", // 21
  "assets", // 22 
  "forum", // 23 
  "updates", // 24
  "me" // 25 
];

// Create menu items
for (let i = 0; i < itemCount; i++) {
  const item = document.createElement("div");
  item.className = "menu--item";
  item.setAttribute("hx-get", "https://server.grabbiel.com/" + arr[i]);
  item.setAttribute("hx-trigger", "click");
  item.setAttribute("hx-target", "#content-box");
  item.setAttribute("hx-swap", "innerHTML");
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

let touchStart = 0;
let touchX = 0;
let isDragging = false;

function handleTouchStart(e) {
  touchStart = e.clientX || e.touches[0].clientX;
  isDragging = true;
  menu.classList.add("is-dragging");
}

function handleTouchMove(e) {
  if (!isDragging) return;
  touchX = e.clientX || e.touches[0].clientX;
  scrollY += (touchX - touchStart) * 2.5;
  touchStart = touchX;
}

function handleTouchEnd() {
  isDragging = false;
  menu.classList.remove("is-dragging");
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
});

const middleIndex = ((itemCount - 1) / 2) | 0;
const content_box = document.getElementById("content-box");

function triggerHtmxRequest(item) {
  const url = item.getAttribute("hx-get");
  const target = item.getAttribute("hx-target");

  htmx.ajax('GET', url, {
    target: target,
    swap: 'innerHTML'
  });
}
content_box.addEventListener('htmx:beforeRequest', function () {
  this.classList.add('loading');
});

content_box.addEventListener('htmx:afterRequest', function () {
  this.classList.remove('loading');
});

function findMenuIndexByEndpoint(endpoint) {
  return arr.findIndex(item => item == endpoint);
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

  // Center the focused item
  const itemRect = item.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const centerOffset = (menuRect.width - itemRect.width) >> 1;
  scrollY -= itemRect.left - menuRect.left - centerOffset;

  if (itemIndex != middleIndex) {
    content_box.scrollIntoView();
  }

  if (triggerRequest) {
    triggerHtmxRequest(item);
  }
}

window.focusItemByEndpoint = function (endpoint) {
  const index = findMenuIndexByEndpoint(endpoint);
  if (index !== -1) {
    focusItem(index, true);
  }
};

for (let i = 0; i < itemCount; ++i) {
  items[i].addEventListener("click", () => focusItem(i, true));
  items[i].addEventListener("touchend", (e) => {
    if (!isDragging) {
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
window.addEventListener("load", () => {
  const pendingEndpoint = sessionStorage.getItem('pendingEndpoint');
  if (pendingEndpoint) {
    sessionStorage.removeItem('pendingEndpoint');
    window.focusItemByEndpoint(pendingEndpoint);
  } else {
    focusMiddleItem();
  }
});
render();
