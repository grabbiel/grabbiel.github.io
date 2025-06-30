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
  // Check if already requested
  if (localStorage.getItem('forumAccessRequested')) {
    showRequestedMessage();
    return;
  }

  document.body.insertAdjacentHTML('beforeend', `
    <div id="accessModal" class="access-modal">
      <div id="modalContent" class="modal-content">
        <div class="modal-titlebar">
          <div class="traffic-light red" onclick="document.getElementById('accessModal').remove()"></div>
          <div class="traffic-light yellow"></div>
          <div class="traffic-light green"></div>
          <span class="modal-title">Request Forum Access</span>
        </div>
        <div class="modal-body">
          <p class="rate-warning">⚠️ Rate limited - don't spam requests</p>
          <form id="accessForm" class="modal-form">
            <input name="email" type="email" placeholder="Your email" required>
            <textarea name="reason" placeholder="Why do you want access?" required></textarea>
            <button type="submit" class="modal-submit">Submit Request</button>
          </form>
        </div>
      </div>
    </div>
  `);

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
      localStorage.setItem('forumAccessRequested', 'true');
      document.getElementById('accessModal').remove();
      showRequestedMessage();
    });
  };
}

function showRequestedMessage() {
  const btn = document.getElementById('requestAccessBtn');
  if (btn) {
    btn.outerHTML = `
      <div class="access-requested">
        <p>📧 Access request submitted<br>
        <small>Check your email if approved. Don't resubmit.</small></p>
      </div>
    `;
  }
}

function enterPostingToken() {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="tokenModal" class="access-modal">
      <div class="modal-content">
        <div class="modal-titlebar">
          <div class="traffic-light red" onclick="document.getElementById('tokenModal').remove()"></div>
          <div class="traffic-light yellow"></div>
          <div class="traffic-light green"></div>
          <span class="modal-title">Enter Posting Token</span>
        </div>
        <div class="modal-body">
          <form id="tokenForm" class="modal-form">
            <input name="token" type="text" placeholder="Paste your posting token here" required>
            <button type="submit" class="modal-submit">Save Token</button>
          </form>
        </div>
      </div>
    </div>
  `);

  document.getElementById('tokenModal').onclick = function (e) {
    if (e.target === this) this.remove();
  };

  document.getElementById('tokenForm').onsubmit = function (e) {
    e.preventDefault();
    const token = new FormData(this).get('token');

    // Validate token with server
    fetch('https://server.grabbiel.com/forum/validate-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `token=${token}`
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          localStorage.setItem('forumPostingToken', token);
          document.body.classList.add('has-token');
          document.querySelector('.reply-section').style.display = 'none';
          document.getElementById('tokenModal').innerHTML =
            '<div class="modal-body"><p style="color:green; text-align:center;">✅ Token validated successfully!</p></div>';
          setTimeout(() => document.getElementById('tokenModal').remove(), 2000);
        } else {
          document.getElementById('tokenModal').innerHTML =
            '<div class="modal-body"><p style="color:red; text-align:center;">❌ Invalid token. Please check and try again.</p></div>';
        }
      })
      .catch(() => {
        document.getElementById('tokenModal').innerHTML =
          '<div class="modal-body"><p style="color:red; text-align:center;">❌ Validation failed. Try again later.</p></div>';
      });
  };
}

document.addEventListener("htmx:afterSwap", function (event) {
  if (event.detail.xhr.responseURL.includes("/forum/thread")) {
    if (localStorage.getItem('forumPostingToken')) {
      document.body.classList.add('has-token');
    }
    if (localStorage.getItem('forumAccessRequested')) {
      document.body.classList.add('has-requested');
      showRequestedMessage();
    }
  }
});
