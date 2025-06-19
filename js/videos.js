let currentVideoIndex = 0;
let totalVideos = 0;
let videos = [];

document.addEventListener("htmx:afterRequest", function (event) {
  const url = event.detail.xhr.responseURL;
  if (url.includes("/videos/more")) {
    videos = document.querySelectorAll(".video-container");
    totalVideos = videos.length;
    window.loadingMoreVideos = false;
  } else if (url.includes("/videos")) {
    videos = document.querySelectorAll(".video-container");
    totalVideos = videos.length;
    if (totalVideos > 0) {
      currentVideoIndex = 0;
      playCurrentVideo();
      setupVideoControls();
    }
  }
});

function setupVideoControls() {
  // Touch/swipe handling
  let touchStartY = 0;
  let touchEndY = 0;

  const header = document.querySelector(".header");
  const headerHeight = header.offsetHeight;
  document.documentElement.style.setProperty(
    "--header-height",
    headerHeight + "px",
  );

  videos.forEach((video) => {
    const videoElement = video.querySelector("video");
    videoElement.addEventListener("click", togglePlayPause);
    videoElement.addEventListener("touchend", (e) => {
      e.preventDefault();
      togglePlayPause();
    });
  });

  videos.forEach((video) => {
    const muteBtn = video.querySelector(".mute-toggle");
    muteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMute();
    });
  });

  document.addEventListener("touchstart", (e) => {
    touchStartY = e.changedTouches[0].screenY;
  });

  document.addEventListener("touchend", (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") previousVideo();
    if (e.key === "ArrowDown") nextVideo();
    if (e.key === " ") {
      e.preventDefault();
      togglePlayPause();
    }
  });
}

function toggleMute() {
  const video = videos[currentVideoIndex].querySelector("video");
  const muteBtn = videos[currentVideoIndex].querySelector(".mute-toggle");

  video.muted = !video.muted;
  muteBtn.textContent = video.muted ? "🔇" : "🔊";
}

function handleSwipe() {
  const swipeDistance = touchStartY - touchEndY;
  const minSwipeDistance = 50;

  if (Math.abs(swipeDistance) > minSwipeDistance) {
    if (swipeDistance > 0) {
      nextVideo();
    } else {
      previousVideo();
    }
  }
}

function nextVideo() {
  if (currentVideoIndex < totalVideos - 1) {
    changeVideo(currentVideoIndex + 1);
  }
}

function previousVideo() {
  if (currentVideoIndex > 0) {
    changeVideo(currentVideoIndex - 1);
  }
}

function changeVideo(newIndex) {
  videos[currentVideoIndex].classList.remove("active");
  videos[currentVideoIndex].querySelector("video").pause();

  currentVideoIndex = newIndex;

  videos[currentVideoIndex].classList.add("active");
  playCurrentVideo();
  if (newIndex >= totalVideos - 3 && !window.loadingMoreVideos) {
    loadMoreVideos();
  }
}

function loadMoreVideos() {
  window.loadingMoreVideos = true;
  htmx.ajax(
    "GET",
    `https://server.grabbiel.com/videos-more?offset=${totalVideos}`,
    {
      target: ".videos-player",
      swap: "beforeend",
    },
  );
}

function playCurrentVideo() {
  const video = videos[currentVideoIndex].querySelector("video");
  video.currentTime = 0;
  video.play();
}

function togglePlayPause() {
  const video = videos[currentVideoIndex].querySelector("video");
  video.paused ? video.play() : video.pause();
}
