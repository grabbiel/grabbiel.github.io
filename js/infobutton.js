document.addEventListener("DOMContentLoaded", function () {
  const infoButton = document.getElementById("info-button");
  const overlay = document.getElementById("overlay");
  const closePopup = document.getElementById("close-popup");
  const pageInfo = document.getElementById("page-info");

  infoButton.addEventListener("click", showPopup);
  closePopup.addEventListener("click", hidePopup);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hidePopup();
  });

  function showPopup() {
    const info = window.siteInfo || { latest: "Unknown", loc: "Unknown" };

    pageInfo.innerHTML = `
      <strong>Latest:</strong> ${info.latest}<br>
      <strong>LOC:</strong> ${info.loc}<br>
      <strong>More:</strong> <a href="https://franciscoc.com" target="_blank">portfolio</a>, 
      <a href="https://www.sponsorchecker.com/" target="_blank">project</a>
    `;

    overlay.style.display = "flex";
  }

  function hidePopup() {
    overlay.style.display = "none";
  }
});
