// ================= NAV: highlight active =================
(function () {
  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-item').forEach(a => {
    const href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
    if (href === path) a.classList.add('active');
  });
})();

//  Defensive cleanup: delete legacy key from older versions
try {
  localStorage.removeItem('cgSelectedCoverUrl');
} catch (e) {
  console.warn('Could not clear legacy cgSelectedCoverUrl:', e);
}

// ================= Element refs (safe if missing) =================
const coverCards   = Array.from(document.querySelectorAll('.cover-card')); // snapshot, may be unused now
const regenBtn     = document.querySelector('.regenerate-btn');
const applyBtn     = document.querySelector('.apply-btn');                 // left here in case you need it later
const downloadBtn  = document.querySelector('.download-btn');

const fontSelectEl = document.querySelector('.right-panel .dropdown');     // "Font Style" (may be unused here)
const titleInputEl = document.querySelector('.text-input');                // "Title Text" (may be unused here)

const playlistSelect = document.getElementById('playlistSelect');
const plTitle        = document.querySelector('.playlist-title');

const coverImg       = document.querySelector('.cover-image');
const coverCanvas    = document.querySelector('.cover-canvas');

// Figure out which page we are on
const currentPath = location.pathname.replace(/\/$/, '') || '/';

// ===================================================================
// =============== GENERATE PAGE: lightweight helpers =================
// ===================================================================
if (currentPath === '/generate') {
  // Optional: log regenerate clicks (real logic lives in generate.html)
  regenBtn?.addEventListener('click', () => {
    console.log('Regenerate button clicked');
  });

  // Keep playlist title label in sync with dropdown
  playlistSelect?.addEventListener('change', () => {
    const selectedOption = playlistSelect.options[playlistSelect.selectedIndex];
    if (plTitle && selectedOption) {
      plTitle.textContent = selectedOption.textContent;
    }
  });

}

// ===================================================================
// =============== Download button hook ====================
// ===================================================================
downloadBtn?.addEventListener('click', () => {
  console.log('Download button clicked');
});

// ===================================================================
// =============== LIGHT / DARK THEME TOGGLE ==========================
// ===================================================================
(function () {
  const THEME_KEY = 'cg-theme';
  const btn = document.getElementById('themeToggle');

  function applyTheme(theme) {
    const isLight = theme === 'light';
    document.body.classList.toggle('light-theme', isLight);

    // Only touch the button text if it exists on this page
    if (btn) {
      btn.textContent = isLight ? '☀️' : '🌙';
    }
  }

  // Load saved theme (default dark)
  let initial = 'dark';
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      initial = saved;
    }
  } catch (e) {
    console.warn('Could not read theme from localStorage:', e);
  }

  // Always apply the theme, even if there's no toggle button on this page
  applyTheme(initial);

  // Only wire up click handler if the button actually exists
  if (btn) {
    btn.addEventListener('click', () => {
      const isLight = document.body.classList.contains('light-theme');
      const next = isLight ? 'dark' : 'light';

      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        console.warn('Could not save theme to localStorage:', e);
      }
    });
  }
})();
