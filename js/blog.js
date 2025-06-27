// Blog page tab functionality
document.addEventListener('DOMContentLoaded', function () {

  // Category tabs (Gamedev, Webcomics, etc.)
  document.addEventListener('click', function (e) {
    if (e.target.matches('.category-tabs .tab-btn')) {
      const category = e.target.getAttribute('data-category');
      const content = document.querySelector('.category-content');

      // Update active tab
      document.querySelectorAll('.category-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      // Load content
      htmx.ajax('GET', `https://server.grabbiel.com/blog/category?tag=${category}`, {
        target: content,
        swap: 'innerHTML'
      });
    }
  });

  // Review tabs
  document.addEventListener('click', function (e) {
    if (e.target.matches('.review-tabs .tab-btn')) {
      const reviewType = e.target.getAttribute('data-review');
      const content = document.querySelector('.review-content');

      document.querySelectorAll('.review-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      htmx.ajax('GET', `https://server.grabbiel.com/blog/reviews?type=${reviewType}`, {
        target: content,
        swap: 'innerHTML'
      });
    }
  });

  // Trick tabs
  document.addEventListener('click', function (e) {
    if (e.target.matches('.trick-tabs .tab-btn')) {
      const trickType = e.target.getAttribute('data-trick');
      const content = document.querySelector('.trick-content');

      document.querySelectorAll('.trick-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      htmx.ajax('GET', `https://server.grabbiel.com/blog/tricks?type=${trickType}`, {
        target: content,
        swap: 'innerHTML'
      });
    }
  });

  // Concept tabs
  document.addEventListener('click', function (e) {
    if (e.target.matches('.concept-tabs .tab-btn')) {
      const conceptType = e.target.getAttribute('data-concept');
      const content = document.querySelector('.concept-content');

      document.querySelectorAll('.concept-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      htmx.ajax('GET', `https://server.grabbiel.com/blog/concepts?type=${conceptType}`, {
        target: content,
        swap: 'innerHTML'
      });
    }
  });

  // OS tabs
  document.addEventListener('click', function (e) {
    if (e.target.matches('.os-tabs .tab-btn')) {
      const osType = e.target.getAttribute('data-os');
      const content = document.querySelector('.os-content');

      document.querySelectorAll('.os-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      htmx.ajax('GET', `https://server.grabbiel.com/blog/os?type=${osType}`, {
        target: content,
        swap: 'innerHTML'
      });
    }
  });

});
