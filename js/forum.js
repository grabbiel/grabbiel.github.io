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
    if (localStorage.getItem('forumPostingToken')) {
      document.getElementById('replyForm').style.display = 'block';
      document.getElementById('requestAccessBtn').style.display = 'none';
    } else {
      document.getElementById('replyForm').style.display = 'none';
    }
  }
});
