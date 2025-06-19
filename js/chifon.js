document.addEventListener("htmx:afterRequest", function (event) {
  if (event.detail.target.id === "content-box") {
    document.querySelectorAll(".chifon-block video").forEach((video) => {
      video.addEventListener("ended", function () {
        this.style.opacity = "0.6";

        const playIcon = document.createElement("div");
        playIcon.className = "chifon-play-icon";
        playIcon.innerHTML = "▶";
        this.parentElement.appendChild(playIcon);
      });
    });
  }
});
