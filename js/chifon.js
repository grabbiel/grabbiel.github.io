document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".chifon-block video").forEach((video) => {
    video.addEventListener("ended", function () {
      this.style.opacity = "0.6";
    });
  });
});
