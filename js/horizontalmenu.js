const menu = document.querySelector(".menu");
const wrapper = document.querySelector(".menu--wrapper");
const fragment = document.createDocumentFragment();
const itemCount = 20;
let items;
let menuWidth = menu.clientWidth;
let itemWidth = 100; // Fixed width for each item
let wrapWidth = itemCount * itemWidth;
let scrollY = 0;
let y = 0;
let oldScrollY = 0;
const arr = [
  "photos",
  "links",
  "news",
  "videos",
  "read",
  "github",
  "food",
  "music",
  "anime",
  "renders",
  "writing",
  "vynils",
  "travel",
  "fishing",
  "scuba",
  "foreign",
  "leetcode",
  "pretty",
  "robots",
  "stats",
];

// Create menu items
for (let i = 0; i < itemCount; i++) {
  const item = document.createElement("div");
  item.className = "menu--item";
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

function focusItem(item) {
  // Reset all items
  for (let i = 0; i < itemCount; ++i) {
    items[i].querySelector(".menu--item-content").style.color = "";
    items[i].style.zIndex = "1";
  }

  // Focus the clicked item
  const content = item.querySelector(".menu--item-content");
  content.style.color = "white";
  // item.style.zIndex = "2";

  // Center the focused item
  const itemRect = item.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const centerOffset = (menuRect.width - itemRect.width) >> 1;
  scrollY -= itemRect.left - menuRect.left - centerOffset;
}

for (let i = 0; i < itemCount; ++i) {
  items[i].addEventListener("click", () => focusItem(items[i]));
  items[i].addEventListener("touchend", (e) => {
    if (!isDragging) {
      e.preventDefault();
      focusItem(items[i]);
    }
  });
}

function focusMiddleItem() {
  const middleIndex = ((itemCount - 1) / 2) | 0;
  const middleItem = items[middleIndex];
  focusItem(middleItem);

  // Adjust scrollY to center the middle item
  scrollY = -middleIndex * itemWidth + menuWidth / 2 - itemWidth / 2;
}

function render() {
  y = lerp(y, scrollY, 0.1);
  dispose(y);

  requestAnimationFrame(render);
}
window.addEventListener("load", focusMiddleItem);
render();
