document.addEventListener("DOMContentLoaded", function () {
  const homeButton = document.getElementById("home-button");
  const searchInput = document.getElementById("search-input");
  const mainSearchInput = document.querySelector(
    ".main-search-bar .search-input",
  );
  const searchMode = document.getElementById("search-mode");
  const searchModeInput = document.getElementById("search-mode-input");
  const backButton = document.getElementById("back-button");

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
  }
  function enterSearchMode() {
    searchMode.style.display = "block";
    searchModeInput.focus();
    const currentValue = document.activeElement.value;
    searchModeInput.value = currentValue;
  }
});
