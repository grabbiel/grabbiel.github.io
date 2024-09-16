document.addEventListener("DOMContentLoaded", function () {
  const infoButton = document.getElementById("info-button");
  const overlay = document.getElementById("overlay");
  const closePopup = document.getElementById("close-popup");
  const pageInfo = document.getElementById("page-info");

  infoButton.addEventListener("click", function () {
    showPopup();
  });

  closePopup.addEventListener("click", function () {
    hidePopup();
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      hidePopup();
    }
  });
  function showPopup() {
    const currentDate = new Date().toLocaleDateString();
    const pageName = "Home Page"; // Change this to your actual page name
    const author = "John Doe"; // Change this to the actual author name

    pageInfo.innerHTML = `
      <strong>Date:</strong> ${currentDate}<br>
      <strong>Page:</strong> ${pageName}<br>
      <strong>Author:</strong> ${author}
    `;

    overlay.style.display = "flex";
  }
  function hidePopup() {
    overlay.style.display = "none";
  }
});
