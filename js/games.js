// Show the game content overlay when HTMX loads content
document.addEventListener('htmx:afterSwap', function (evt) {
  if (evt.target.id === 'game-content') {
    document.getElementById('game-content').style.display = 'block';
  }
  document.getElementById('game-content').addEventListener('click', function (e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  });
});
