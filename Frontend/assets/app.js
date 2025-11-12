// Highlight the active nav item based on URL path
(function () {
    const path = location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-item').forEach(a => {
      const href = a.getAttribute('href').replace(/\/$/, '') || '/';
      if (href === path) a.classList.add('active');
    });
  })();
  
  // Generate page interactions (safe to run everywhere)
  document.addEventListener('click', (e) => {
    if (e.target.matches('.select-btn')) {
      document.querySelectorAll('.cover-card').forEach(c => c.classList.remove('selected'));
      e.target.closest('.cover-card')?.classList.add('selected');
    }
    if (e.target.matches('.color-swatch')) {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      e.target.classList.add('selected');
    }
  });
  