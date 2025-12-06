// ================= NAV: highlight active =================
(function () {
  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-item').forEach(a => {
    const href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
    if (href === path) a.classList.add('active');
  });
})();

// 🔹 Defensive cleanup: delete legacy key from older versions
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

  // ⚠️ IMPORTANT:
  // No more:
  // - click listeners on .cover-card
  // - saving cgSelectedCoverUrl
  // - Apply button navigation
  // Those are all handled by the inline <script> in generate.html now
}

// ===================================================================
// =============== (Optional) Download button hook ====================
// ===================================================================
downloadBtn?.addEventListener('click', () => {
  console.log('Download button clicked');
  // Add your download/export logic here (html2canvas, etc.) if you decide
});
