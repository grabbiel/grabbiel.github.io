document.addEventListener("htmx:afterRequest", function (event) {
  if (event.detail.target.id === "content-box") {
    document.querySelectorAll(".chifon-block video").forEach((video) => {
      video.addEventListener("ended", function () {
        this.style.opacity = "0.6";
      });
    });
  }
});
