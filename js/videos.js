let currentVideoIndex = 0;
let totalVideos = 0;
let videos = [];

document.addEventListener("htmx:afterRequest", function (event) {
  const url = event.detail.xhr.responseURL;
  if (url.includes("/videos-more")) {
    videos = document.querySelectorAll(".video-container");
    totalVideos = videos.length;
    window.loadingMoreVideos = false;
    setupCaptionToggle();
  } else if (url.includes("/videos")) {
    videos = document.querySelectorAll(".video-container");
    totalVideos = videos.length;
    if (totalVideos > 0) {
      currentVideoIndex = 0;
      playCurrentVideo();
      setupVideoControls();
      setupCaptionToggle();
    }
  }
});

function setupVideoControls() {
  // Touch/swipe handling
  let touchStartY = 0;
  let touchEndY = 0;

  videos.forEach((video) => {
    const videoElement = video.querySelector("video");
    const muteBtn = video.querySelector(".mute-toggle");
    const progressBar = video.querySelector(".progress-bar");
    const progressFill = video.querySelector(".progress-fill");
    videoElement.addEventListener("click", togglePlayPause);
    videoElement.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (!isSwipeDetected) {
        togglePlayPause();
      }
      isSwipeDetected = false;
    });
    muteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMute();
    });
    videoElement.addEventListener("timeupdate", () => {
      if (progressFill) {
        const progress =
          (videoElement.currentTime / videoElement.duration) * 100;
        progressFill.style.width = progress + "%";
      }
    });
    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      videoElement.currentTime = percentage * videoElement.duration;
    });
    let playbackBarDragging = false;
    progressBar.addEventListener(
      "mousedown",
      () => (playbackBarDragging = true),
    );
    progressBar.addEventListener("mousemove", (e) => {
      if (playbackBarDragging) {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        videoElement.currentTime = percentage * videoElement.duration;
      }
    });
    document.addEventListener("mouseup", () => (playbackBarDragging = false));
  });

  document.addEventListener("touchstart", (e) => {
    touchStartY = e.changedTouches[0].screenY;
  });

  document.addEventListener("touchend", (e) => {
    touchEndY = e.changedTouches[0].screenY;
    const swipeDistance = touchStartY - touchEndY;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      isSwipeDetected = true;
      handleSwipe();
    }
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

function setupCaptionToggle() {
  document.querySelectorAll(".caption").forEach((caption) => {
    const isMobile = window.innerWidth < 768;
    const limit = isMobile ? 95 : 250;
    const fullText = caption.textContent;

    if (fullText.length > limit) {
      const truncated = fullText.substring(0, limit);
      caption.innerHTML =
        truncated + '... <span class="caption-toggle">more</span>';
      caption.dataset.full = fullText; // Store only when needed

      caption.addEventListener("click", function () {
        if (this.classList.contains("expanded")) {
          this.innerHTML =
            truncated + '... <span class="caption-toggle">more</span>';
          this.classList.remove("expanded");
        } else {
          this.innerHTML =
            fullText + ' <span class="caption-toggle">less</span>';
          this.classList.add("expanded");
        }
      });
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

  if (swipeDistance > 0) {
    nextVideo();
  } else {
    previousVideo();
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
  const container = videos[currentVideoIndex];
  const video = container.querySelector("video");
  if (video.paused) {
    video.play();
    video.classList.remove("video-paused");
    const playIcon = container.querySelector(".play-overlay");
    if (playIcon) playIcon.remove();
  } else {
    video.pause();
    video.classList.add("video-paused");
    const playIcon = document.createElement("div");
    playIcon.className = "play-overlay";
    playIcon.innerHTML = "▶";
    container.appendChild(playIcon);
  }
}
