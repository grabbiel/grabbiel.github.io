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
    searchMode.style.display = "block";
    searchModeInput.focus();
    const currentValue = document.activeElement.value;
    searchModeInput.value = currentValue;
  }

  let lastTriggeredLength = 0;
  searchModeInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length >= 2 && query.length > lastTriggeredLength) {
      searchTimeout = setTimeout(() => {
        htmx.ajax(
          "GET",
          `https://server.grabbiel.com/search-preview?q=${encodeURIComponent(query)}`,
          {
            target: "#search-results",
            swap: "afterbegin",
          },
        );
        lastTriggeredLength = query.length;
      }, 300);
    }
  });

  searchModeInput.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      lastTriggeredLength = Math.max(0, e.target.value.trim().length - 1);
    }
  });

  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
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
