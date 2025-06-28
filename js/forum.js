function requestPostAccess(groupName) {
  // Show request form
  const form = `
        <div class="access-form">
            <h3>Request posting access to ${groupName}</h3>
            <input type="email" id="userEmail" placeholder="Your email" required>
            <textarea id="accessReason" placeholder="Why do you need posting access?" required></textarea>
            <button onclick="submitAccessRequest('${groupName}')">Submit Request</button>
        </div>
    `;
  document.getElementById('forum-content').innerHTML = form;
}

function submitAccessRequest(groupName) {
  const email = document.getElementById('userEmail').value;
  const reason = document.getElementById('accessReason').value;

  fetch('http://your-email-service:8080/request-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `email=${email}&reason=Posting access for ${groupName}: ${reason}`
  }).then(() => {
    document.getElementById('forum-content').innerHTML =
      '<div class="success">Access request submitted for review.</div>';
  });
}
