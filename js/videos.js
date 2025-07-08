let currentVideoIndex = 0;
let totalVideos = 0;
let videos = [];
let isSwipeDetected = false;
let videoTouchStartY = 0;
let videoTouchStartX = 0;
let videoTouchEndY = 0;
let isScrubbing = false;
let wasPlaying = false;
let progressBarTouchStartX = 0;
let progressBarTouchStartY = 0;
let videoMouseStartX = 0;
let videoMouseStartY = 0;
let videoMouseIsDragging = false;
let keyboardListenersAdded = false;

let videoEventListeners = {
  keydown: null
};

// Only keep keydown as global, make touch handlers container-specific
function videos_handler_keydown(e) {
  if (!window.videoMenuActive) return;
  if (e.key === "ArrowUp") previousVideo();
  if (e.key === "ArrowDown") nextVideo();
  if (e.key === " ") {
    e.preventDefault();
    togglePlayPause();
  }
}

function setup_video_listeners() {
  if (videoEventListeners.keydown) return;
  window.videoMenuActive = true;

  // Only add global keydown listener
  videoEventListeners.keydown = videos_handler_keydown;
  document.addEventListener("keydown", videoEventListeners.keydown);
}

function cleanup_video_listeners() {
  window.videoMenuActive = false;

  if (videoEventListeners.keydown) {
    document.removeEventListener("keydown", videoEventListeners.keydown);
    videoEventListeners.keydown = null;
  }

  // Pause all videos and reset state
  if (videos && videos.length > 0) {
    videos.forEach(container => {
      const video = container.querySelector('video');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }

  currentVideoIndex = 0;
  isScrubbing = false;
  isSwipeDetected = false;
  videoTouchStartY = 0;
  videoTouchEndY = 0;
  wasPlaying = false;
}

window.cleanup_video_listeners = cleanup_video_listeners;

document.addEventListener("htmx:afterRequest", function (event) {
  const url = event.detail.xhr.responseURL;
  if (url.includes("/videos-more")) {
    videos = document.querySelectorAll(".video-container");
    totalVideos = videos.length;
    window.loadingMoreVideos = false;
    setupVideoControls();
    setupCaptionToggle();
  } else if (url.includes("/videos")) {
    videos = document.querySelectorAll(".video-container");
    totalVideos = videos.length;
    if (totalVideos > 0) {
      currentVideoIndex = 0;
      setupVideoControls();
      setupCaptionToggle();
    }
  }
});

function activateVideosPage() {
  if (videos.length > 0) {
    setup_video_listeners();
    playCurrentVideo();
  }
}

window.activateVideosPage = activateVideosPage;

function setupVideoControls() {
  videos.forEach((video) => {
    if (video.dataset.listenersAdded) return;
    video.dataset.listenersAdded = 1;

    const videoElement = video.querySelector("video");
    const muteBtn = video.querySelector(".mute-toggle");
    const progressBar = video.querySelector(".progress-bar");
    const progressFill = video.querySelector(".progress-fill");
    const videoProgress = video.querySelector(".video-progress");

    // Container-specific touch handlers for video swipe gestures
    const containerTouchStart = (e) => {
      if (!window.videoMenuActive) return;
      videoTouchStartY = e.changedTouches[0].screenY;
      videoTouchStartX = e.changedTouches[0].screenX;
    };

    const containerTouchMove = (e) => {
      if (!window.videoMenuActive) return;
      if (e.target.closest(".caption.expanded")) return;
      if (e.target.closest(".video-progress")) return;

      // Only prevent default for significant vertical movement in video containers
      const currentY = e.changedTouches[0].screenY;
      const deltaY = Math.abs(currentY - videoTouchStartY);
      const deltaX = Math.abs(e.changedTouches[0].screenX - videoTouchStartX);

      if (deltaY > 10 && deltaY > deltaX) {
        e.preventDefault();
      }
    };

    const containerTouchEnd = (e) => {
      if (!window.videoMenuActive) return;

      videoTouchEndY = e.changedTouches[0].screenY;
      const swipeDistance = videoTouchStartY - videoTouchEndY;
      const minSwipeDistance = 50;

      if (e.target.closest(".caption.expanded")) return;

      if (Math.abs(swipeDistance) > minSwipeDistance) {
        isSwipeDetected = true;
        if (swipeDistance > 0) {
          nextVideo();
        } else {
          previousVideo();
        }
      } else if (!isSwipeDetected) {
        e.preventDefault();
        togglePlayPause();
      }
      isSwipeDetected = false;
    };

    // Add container-specific touch listeners
    video.addEventListener("touchstart", containerTouchStart, { passive: true });
    video.addEventListener("touchmove", containerTouchMove, { passive: false });
    video.addEventListener("touchend", containerTouchEnd, { passive: false });

    // Video-specific handlers
    const clickHandler = () => togglePlayPause();
    const muteClickHandler = (e) => {
      e.stopPropagation();
      toggleMute();
    };
    const timeUpdateHandler = () => {
      if (progressFill) {
        const progress = (videoElement.currentTime / videoElement.duration) * 100;
        progressFill.style.width = progress + "%";
      }
    };

    // Progress bar handlers
    const progressTouchStart = (e) => {
      progressBarTouchStartX = e.touches[0].clientX;
      progressBarTouchStartY = e.touches[0].clientY;
    };

    const progressTouchMove = (e) => {
      e.preventDefault();
      const distanceX = Math.abs(e.touches[0].clientX - progressBarTouchStartX);

      if (distanceX > 10) {
        if (!isScrubbing) {
          isScrubbing = true;
          wasPlaying = !videoElement.paused;
          videoElement.pause();
          progressBar.classList.add("scrubbing");
          video.classList.add("scrubbing");
        }

        const rect = videoProgress.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, touchX / rect.width));
        videoElement.currentTime = percentage * videoElement.duration;
      }
    };

    const progressTouchEnd = (e) => {
      const rect = videoProgress.getBoundingClientRect();

      if (!isScrubbing) {
        const touchX = e.changedTouches[0].clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, touchX / rect.width));
        videoElement.currentTime = percentage * videoElement.duration;
      } else {
        isScrubbing = false;
        progressBar.classList.remove("scrubbing");
        video.classList.remove("scrubbing");
        if (wasPlaying) videoElement.play();
      }
    };

    const progressMouseDown = (e) => {
      videoMouseStartX = e.clientX;
      videoMouseStartY = e.clientY;
      videoMouseIsDragging = false;
    };

    const progressMouseMove = (e) => {
      if (e.buttons == 1) {
        const distanceX = Math.abs(e.clientX - videoMouseStartX);
        const distanceY = Math.abs(e.clientY - videoMouseStartY);

        if (distanceX > 5 || distanceY > 5) {
          if (!videoMouseIsDragging) {
            videoMouseIsDragging = true;
            isScrubbing = true;
            wasPlaying = !videoElement.paused;
            videoElement.pause();
            progressBar.classList.add("scrubbing");
            video.classList.add("scrubbing");
          }
        }

        if (isScrubbing) {
          const rect = videoProgress.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const percentage = Math.max(0, Math.min(1, clickX / rect.width));
          videoElement.currentTime = percentage * videoElement.duration;
        }
      }
    };

    const progressMouseUp = (e) => {
      if (!videoMouseIsDragging) {
        const rect = videoProgress.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        videoElement.currentTime = percentage * videoElement.duration;
      } else if (isScrubbing) {
        isScrubbing = false;
        progressBar.classList.remove("scrubbing");
        video.classList.remove("scrubbing");
        if (wasPlaying) videoElement.play();
      }
    };

    // Add all event listeners
    videoElement.addEventListener("click", clickHandler);
    muteBtn.addEventListener("click", muteClickHandler);
    videoElement.addEventListener("timeupdate", timeUpdateHandler);
    videoProgress.addEventListener("touchstart", progressTouchStart);
    videoProgress.addEventListener("touchmove", progressTouchMove);
    videoProgress.addEventListener("touchend", progressTouchEnd);
    videoProgress.addEventListener("mousedown", progressMouseDown);
    videoProgress.addEventListener("mousemove", progressMouseMove);
    videoProgress.addEventListener("mouseup", progressMouseUp);
  });
}

function setupCaptionToggle() {
  document.querySelectorAll(".caption").forEach((caption) => {
    if (caption.dataset.full) return;
    const isMobile = window.innerWidth < 768;
    const limit = isMobile ? 95 : 250;
    const fullText = caption.textContent;

    if (fullText.length > limit) {
      const truncated = fullText.substring(0, limit);
      caption.innerHTML = truncated + '... <span class="caption-toggle">more</span>';
      caption.dataset.full = fullText;

      caption.addEventListener("click", function () {
        if (this.classList.contains("expanded")) {
          this.innerHTML = truncated + '... <span class="caption-toggle">more</span>';
          this.classList.remove("expanded");
        } else {
          this.innerHTML = fullText + ' <span class="caption-toggle">less</span>';
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
  isScrubbing = false;
  progressBarTouchStartX = 0;
  progressBarTouchStartY = 0;
  wasPlaying = false;
  videoMouseIsDragging = false;
  videoMouseStartX = 0;
  videoMouseStartY = 0;

  const prevContainer = videos[currentVideoIndex];
  const prevVideo = prevContainer.querySelector("video");
  const prevCaption = prevContainer.querySelector(".caption");
  const prevProgress = prevContainer.querySelector(".progress-bar");

  prevProgress.classList.remove("scrubbing");
  prevContainer.classList.remove("scrubbing");

  if (prevCaption && prevCaption.classList.contains("expanded")) {
    const fullText = prevCaption.dataset.full;
    const isMobile = window.innerWidth < 768;
    const limit = isMobile ? 95 : 250;
    const truncated = fullText.substring(0, limit);
    prevCaption.innerHTML = truncated + '... <span class="caption-toggle">more</span>';
    prevCaption.classList.remove("expanded");
  }

  prevContainer.classList.remove("active");
  prevVideo.pause();
  prevVideo.classList.add("video-paused");

  if (!prevContainer.querySelector(".play-overlay")) {
    const playIcon = document.createElement("div");
    playIcon.className = "play-overlay";
    playIcon.innerHTML = "▶";
    prevContainer.appendChild(playIcon);
  }

  currentVideoIndex = newIndex;
  videos[currentVideoIndex].classList.add("active");
  playCurrentVideo();

  if (newIndex >= totalVideos - 3 && !window.loadingMoreVideos) {
    loadMoreVideos();
  }
}

function loadMoreVideos() {
  window.loadingMoreVideos = true;
  htmx.ajax("GET", `https://server.grabbiel.com/videos-more?offset=${totalVideos}`, {
    target: ".videos-player",
    swap: "beforeend",
  });
}

function playCurrentVideo() {
  const container = videos[currentVideoIndex];
  const video = container.querySelector("video");

  video.classList.remove("video-paused");
  const playIcon = container.querySelector(".play-overlay");
  if (playIcon) playIcon.remove();

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
