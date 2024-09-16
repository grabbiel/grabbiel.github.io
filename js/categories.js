document
  .querySelector(".category-button:last-child")
  .addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = window.location.origin + "/sections";
  });
