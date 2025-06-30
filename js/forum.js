function submitReply(group, articleId) {
  const token = localStorage.getItem('forumPostingToken');
  const body = document.getElementById('replyBody').value;

  fetch('https://server.grabbiel.com/forum/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `token=${token}&group=${group}&reply_to=${articleId}&body=${encodeURIComponent(body)}`
  });
}
