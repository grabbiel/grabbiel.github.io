// Add to your existing JS files
function initPhotosLayout() {
  const container = document.querySelector(".photos-container");
  if (!container) return;

  function groupIntoRows() {
    const items = Array.from(
      container.querySelectorAll(".sochee-item:not(.grouped)"),
    );
    const maxWidth = container.clientWidth - 40;
    const targetHeight = 200;

    let currentRow = [];
    let currentWidth = 0;

    items.forEach((item) => {
      const aspect = parseFloat(item.dataset.aspect);
      const itemWidth = targetHeight * aspect;

      if (currentWidth + itemWidth > maxWidth && currentRow.length > 0) {
        createRowFromItems(currentRow, maxWidth);
        currentRow = [item];
        currentWidth = itemWidth;
      } else {
        currentRow.push(item);
        currentWidth += itemWidth + 3;
      }
      item.classList.add("grouped");
    });

    if (currentRow.length > 0) {
      createRowFromItems(currentRow, maxWidth);
    }
  }

  function createRowFromItems(items, maxWidth) {
    const row = document.createElement("div");
    row.className = "photos-row";

    let totalWidth = 0;
    items.forEach((item) => {
      const aspect = parseFloat(item.dataset.aspect);
      totalWidth += 200 * aspect + 3;
    });

    const scale = maxWidth / totalWidth;
    items.forEach((item) => {
      const aspect = parseFloat(item.dataset.aspect);
      item.style.width = 200 * aspect * scale + "px";
      row.appendChild(item);
    });

    container.insertBefore(row, document.getElementById("photos-loader"));
  }

  // Handle sochee clicks
  container.addEventListener("click", (e) => {
    const socheeItem = e.target.closest(".sochee-item");
    const locationEl = e.target.closest(".sochee-location");

    if (locationEl) {
      e.stopPropagation();
      const location = socheeItem.dataset.location
        .replace(/\s+/g, "-")
        .toLowerCase();
      window.open(`https://photos.grabbiel.com/${location}`, "_blank");
    } else if (socheeItem) {
      const id = socheeItem.dataset.id;
      window.open(`https://photos.grabbiel.com/${id}`, "_blank");
    }
  });

  // Handle collection scrolling
  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("nav-btn")) {
      const collection = e.target
        .closest(".collection-row")
        .querySelector(".collection-scroll");
      const direction = e.target.textContent === "‹" ? -160 : 160;
      collection.scrollLeft += direction;
    }
  });

  // Mouse wheel for collections (desktop)
  container.addEventListener("wheel", (e) => {
    const collection = e.target.closest(".collection-scroll");
    if (collection && window.innerWidth > 768) {
      e.preventDefault();
      collection.scrollLeft += e.deltaY;
    }
  });

  groupIntoRows();
}

// Hook into HTMX events
document.addEventListener("htmx:afterSwap", (e) => {
  if (e.detail.xhr.responseURL.includes("photos")) {
    initPhotosLayout();
  }
});
