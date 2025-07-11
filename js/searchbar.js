document.addEventListener("DOMContentLoaded", function () {
  const homeButton = document.getElementById("home-button");
  const searchInput = document.getElementById("search-input");
  const mainSearchInput = document.querySelector(
    ".main-search-bar .search-input",
  );
  const searchMode = document.getElementById("search-mode");
  const searchModeInput = document.getElementById("search-mode-input");
  const backButton = document.getElementById("back-button");
  const searchButton = document.getElementById("search-button");
  let searchTimeout;
  let isDeleting = false;

  homeButton.addEventListener("click", function () {
    window.location.reload();
  });
  [searchInput, mainSearchInput].forEach((input) => {
    input.addEventListener("click", enterSearchMode);
    input.addEventListener("focus", enterSearchMode);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        enterSearchMode();
      }
    });
  });

  backButton.addEventListener("click", exitSearchMode);

  function exitSearchMode() {
    searchMode.style.display = "none";
    searchInput.value = searchModeInput.value;
    mainSearchInput.value = searchModeInput.value;
    document.getElementById("search-results").innerHTML = "";
  }
  function enterSearchMode() {
    searchMode.style.display = "flex";
    searchModeInput.focus();
    const currentValue = document.activeElement.value;
    searchModeInput.value = currentValue;
  }

  searchModeInput.addEventListener("keydown", (e) => {
    isDeleting = e.key === "Backspace" || e.key === "Delete";
  });

  searchModeInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length >= 2) {
      searchTimeout = setTimeout(() => {
        htmx.ajax(
          "GET",
          `https://server.grabbiel.com/search-preview?q=${encodeURIComponent(query)}`,
          {
            target: "#search-results",
            swap: "afterbegin",
          },
        );
      }, 300);
    }
    isDeleting = false;
  });

  searchButton.addEventListener("click", () => {
    const query = searchModeInput.value.trim();
    if (query) {
      htmx.ajax(
        "GET",
        `https://server.grabbiel.com/search?q=${encodeURIComponent(query)}`,
        {
          target: "#search-results",
        },
      );
    }
  });
});
