function submitReply(group, articleId) {
  const token = localStorage.getItem('forumPostingToken');
  const body = document.getElementById('replyBody').value;
  const subject = document.getElementById('replySubject').value;

  fetch('https://server.grabbiel.com/forum/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `token=${token}&group=${group}&reply_to=${articleId}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  });
}


document.addEventListener("htmx:afterSwap", function (event) {
  const url = event.detail.xhr.responseURL;
  if (url.includes("/forum/thread")) {
    console.log("Called to /forum/thread");

    const replyForm = document.getElementById('replyForm');
    const requestBtn = document.getElementById('requestAccessBtn');

    console.log("replyForm found:", !!replyForm);
    console.log("requestBtn found:", !!requestBtn);

    if (localStorage.getItem('forumPostingToken')) {
      if (replyForm) replyForm.style.display = 'block';
      if (requestBtn) requestBtn.style.display = 'none';
    } else {
      if (replyForm) replyForm.style.display = 'none';
    }
  }
});
