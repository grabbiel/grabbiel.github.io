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
    <div id="accessModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; display:flex; align-items:center; justify-content:center;">
      <div id="modalContent" style="background:white; border-radius:10px; overflow:hidden; min-width:400px; box-shadow:0 10px 30px rgba(0,0,0,0.3);">
        <div style="background:#f6f6f6; padding:12px; display:flex; align-items:center; border-bottom:1px solid #ddd;">
          <div style="width:12px; height:12px; background:#ff5f57; border-radius:50%; cursor:pointer; margin-right:8px;" onclick="document.getElementById('accessModal').remove()"></div>
          <div style="width:12px; height:12px; background:#ffbd2e; border-radius:50%; margin-right:8px;"></div>
          <div style="width:12px; height:12px; background:#28ca42; border-radius:50%;"></div>
          <span style="flex:1; text-align:center; font-weight:bold; color:#333;">Request Forum Access</span>
        </div>
        <div style="padding:20px;">
          <form id="accessForm">
            <input name="email" type="email" placeholder="Your email" required style="width:100%; padding:10px; margin:10px 0; border:1px solid #ddd; border-radius:5px; box-sizing:border-box;">
            <textarea name="reason" placeholder="Why do you want access?" required style="width:100%; padding:10px; margin:10px 0; border:1px solid #ddd; border-radius:5px; min-height:80px; resize:vertical; box-sizing:border-box;"></textarea>
            <button type="submit" style="background:#007cba; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; width:100%;">Submit Request</button>
          </form>
        </div>
      </div>
    </div>
  `);

  // Close on outside click
  document.getElementById('accessModal').onclick = function (e) {
    if (e.target === this) this.remove();
  };

  document.getElementById('accessForm').onsubmit = function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    fetch('https://email.grabbiel.com/request-access', {
      method: 'POST',
      body: new URLSearchParams(formData)
    }).then(() => {
      document.getElementById('modalContent').innerHTML = '<div style="padding:40px; text-align:center;"><h3>Request Submitted!</h3><p>Check your email for approval.</p></div>';
      setTimeout(() => document.getElementById('accessModal').remove(), 2000);
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
