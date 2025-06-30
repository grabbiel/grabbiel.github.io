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

function requestPostAccess(groupName) {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="accessModal" style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:20px; border:2px solid #ccc; z-index:1000;">
      <h3>Request Forum Access</h3>
      <form id="accessForm">
        <input name="email" type="email" placeholder="Your email" required>
        <textarea name="reason" placeholder="Why do you want access?" required></textarea>
        <button type="submit">Submit Request</button>
        <button type="button" onclick="document.getElementById('accessModal').remove()">Cancel</button>
      </form>
    </div>
  `);

  document.getElementById('accessForm').onsubmit = function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    fetch('https://email.grabbiel.com/request-access', {
      method: 'POST',
      body: new URLSearchParams(formData)
    }).then(() => {
      document.getElementById('accessModal').innerHTML = '<p>Request submitted!</p>';
    });
  };
}

document.addEventListener("htmx:afterSwap", function (event) {
  if (event.detail.xhr.responseURL.includes("/forum/thread")) {
    if (localStorage.getItem('forumPostingToken')) {
      document.body.classList.add('has-token');
    }
  }
});
