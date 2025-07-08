let currentPlayingVideo = null;
let videoQueue = [];

document.addEventListener("htmx:afterRequest", function (event) {
  if (event.detail.target.classList.contains("content-panel") &&
    event.detail.target.dataset.menu === "home") {
    initChifonPlayer();
  }
  if (event.detail.xhr.responseURL.includes("/home/more")) {
    initChifonPlayer();
  }
});

function initChifonPlayer() {
  const videos = document.querySelectorAll(".chifon-block video");

  // Reset state
  currentPlayingVideo = null;
  videoQueue = [];

  // Setup intersection observer for viewport detection
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
        // Video is mostly in view
        if (!videoQueue.includes(video)) {
          videoQueue.push(video);
        }
      } else {
        // Remove from queue if not in view
        const index = videoQueue.indexOf(video);
        if (index > -1) {
          videoQueue.splice(index, 1);
        }

        // Pause video if it's currently playing and out of view
        if (currentPlayingVideo === video && !entry.isIntersecting) {
          pauseVideo(video);
        }
      }
    });

    // Start playing if no video is currently playing
    if (!currentPlayingVideo && videoQueue.length > 0) {
      playNextVideo();
    }
  }, {
    threshold: 0.8 // 80% of video must be visible
  });

  // Observe all chifon videos
  videos.forEach(video => {
    observer.observe(video);

    // Setup ended event listener
    video.addEventListener("ended", function () {
      this.style.opacity = "0.6";

      // Add play icon
      if (!this.parentElement.querySelector('.chifon-play-icon')) {
        const playIcon = document.createElement("div");
        playIcon.className = "chifon-play-icon";
        playIcon.innerHTML = "▶";
        this.parentElement.appendChild(playIcon);
      }

      // Mark as no longer playing
      if (currentPlayingVideo === this) {
        currentPlayingVideo = null;
      }

      // Play next video after a short delay
      setTimeout(() => {
        playNextVideo();
      }, 500);
    });

    // Setup click to play/pause
    video.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (this.paused) {
        // Stop current playing video
        if (currentPlayingVideo && currentPlayingVideo !== this) {
          currentPlayingVideo.pause();
          currentPlayingVideo.style.opacity = "0.6";
        }

        // Play this video
        playVideo(this);
      } else {
        pauseVideo(this);
      }
    });
  });
}

function playNextVideo() {
  if (videoQueue.length === 0) return;

  // Find the best next video (prefer rightward/downward flow)
  let nextVideo = videoQueue[0];

  if (currentPlayingVideo) {
    const currentRect = currentPlayingVideo.getBoundingClientRect();
    let bestVideo = null;
    let bestScore = -1;

    videoQueue.forEach(video => {
      if (video === currentPlayingVideo) return;

      const rect = video.getBoundingClientRect();
      let score = 0;

      // Prefer videos to the right
      if (rect.left > currentRect.left) score += 100;

      // Prefer videos at similar height
      const heightDiff = Math.abs(rect.top - currentRect.top);
      if (heightDiff < 50) score += 50;

      // Prefer closer videos
      const distance = Math.sqrt(
        Math.pow(rect.left - currentRect.right, 2) +
        Math.pow(rect.top - currentRect.top, 2)
      );
      score += Math.max(0, 1000 - distance);

      if (score > bestScore) {
        bestScore = score;
        bestVideo = video;
      }
    });

    if (bestVideo) {
      nextVideo = bestVideo;
    }
  }

  playVideo(nextVideo);
}

function playVideo(video) {
  // Pause current video if different
  if (currentPlayingVideo && currentPlayingVideo !== video) {
    pauseVideo(currentPlayingVideo);
  }

  currentPlayingVideo = video;
  video.style.opacity = "1";
  video.currentTime = 0;
  video.play();

  // Remove play icon
  const playIcon = video.parentElement.querySelector('.chifon-play-icon');
  if (playIcon) {
    playIcon.remove();
  }
}

function pauseVideo(video) {
  video.pause();
  video.style.opacity = "0.6";

  // Add play icon if not present
  if (!video.parentElement.querySelector('.chifon-play-icon')) {
    const playIcon = document.createElement("div");
    playIcon.className = "chifon-play-icon";
    playIcon.innerHTML = "▶";
    video.parentElement.appendChild(playIcon);
  }

  if (currentPlayingVideo === video) {
    currentPlayingVideo = null;
  }
}
