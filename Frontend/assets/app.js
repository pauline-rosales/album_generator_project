// ================= NAV: highlight active =================
(function () {
  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-item').forEach(a => {
    const href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
    if (href === path) a.classList.add('active');
  });
})();

// ================= Element refs (safe if missing) =================
const coverCards   = Array.from(document.querySelectorAll('.cover-card')); // snapshot, may be unused now
const regenBtn     = document.querySelector('.regenerate-btn');
const applyBtn     = document.querySelector('.apply-btn');
const downloadBtn  = document.querySelector('.download-btn');

const fontSelectEl = document.querySelector('.right-panel .dropdown'); // "Font Style"
const titleInputEl = document.querySelector('.text-input');            // "Title Text"

const playlistSelect = document.getElementById('playlistSelect');
const plTitle        = document.querySelector('.playlist-title');

const coverImg       = document.querySelector('.cover-image');
const coverCanvas    = document.querySelector('.cover-canvas');

// Figure out which page we are on
const currentPath = location.pathname.replace(/\/$/, '') || '/';

// ===================================================================
// =============== GENERATE PAGE: pick + save cover ===================
// ===================================================================
if (currentPath === '/generate') {
  let selectedCoverUrl = null;

  // 🔹 Event delegation: works for dynamically generated .cover-card elements
  document.addEventListener('click', (e) => {
    const pathNow = location.pathname.replace(/\/$/, '') || '/';
    if (pathNow !== '/generate') return;

    const card = e.target.closest('.cover-card');
    if (!card) return;

    // Remove previous selection
    document.querySelectorAll('.cover-card.selected').forEach(c =>
      c.classList.remove('selected')
    );
    card.classList.add('selected');

    const img = card.querySelector('img');
    selectedCoverUrl = card.dataset.coverUrl || img?.src || null;

    if (selectedCoverUrl) {
      localStorage.setItem('cgSelectedCoverUrl', selectedCoverUrl);
      console.log('Saved selected cover URL:', selectedCoverUrl);
    }
  });

  // Optional: handle "Regenerate" if you have that wired up elsewhere
  regenBtn?.addEventListener('click', () => {
    console.log('Regenerate button clicked');
    // Your existing regenerate logic (fetch to /api/generate etc.) lives
    // in the inline <script> on generate.html – we don’t touch it here.
  });

  // ✅ Apply button: DO NOT block with an alert anymore
  applyBtn?.addEventListener('click', () => {
    // Light fallback: try to remember a cover URL for Customize,
    // but **never** stop the flow with an alert.

    let selectedUrl = selectedCoverUrl || localStorage.getItem('cgSelectedCoverUrl');

    // Fallback: if nothing was clicked, try to use the first cover
    if (!selectedUrl) {
      const firstCard   = document.querySelector('.cover-card');
      const firstImg    = firstCard?.querySelector('img');
      const previewDiv  = firstCard?.querySelector('.cover-preview');

      if (firstCard && (firstImg || previewDiv)) {
        // If there is an <img>, prefer that
        if (firstImg?.src) {
          selectedUrl = firstCard.dataset.coverUrl || firstImg.src;
        } else if (previewDiv && previewDiv.style.backgroundImage &&
                   previewDiv.style.backgroundImage !== 'none') {
          selectedUrl = previewDiv.style.backgroundImage;
        }

        if (selectedUrl) {
          localStorage.setItem('cgSelectedCoverUrl', selectedUrl);
          firstCard.classList.add('selected');
        }
      }
    }

    // NOTE:
    // - We do NOT show "Please select a cover" any more.
    // - Even if selectedUrl is still empty, we still go to /customize,
    //   and your inline generate.html script will handle selected_cover_config.
    window.location.href = '/customize';
  });

  // Optional: keep playlist title in sync if you’re using this dropdown
  playlistSelect?.addEventListener('change', () => {
    const selectedOption = playlistSelect.options[playlistSelect.selectedIndex];
    if (plTitle && selectedOption) {
      plTitle.textContent = selectedOption.textContent;
    }
  });
}

// ===================================================================
// =============== CUSTOMIZE PAGE: load selected cover ===============
// ===================================================================
if (currentPath === '/customize') {
  document.addEventListener('DOMContentLoaded', () => {
    const savedUrl = localStorage.getItem('cgSelectedCoverUrl');
    console.log('Loaded selected cover URL:', savedUrl);

    if (!savedUrl) return;

    if (coverImg) {
      // If your customize page uses <img class="cover-image">
      coverImg.src = savedUrl;
    } else if (coverCanvas) {
      // If you use a background instead of an <img>
      coverCanvas.style.backgroundImage = `url("${savedUrl}")`;
      coverCanvas.style.backgroundSize = 'cover';
      coverCanvas.style.backgroundPosition = 'center';
    }
  });

  // You can also keep using fontSelectEl, titleInputEl, etc. here
  // for your text customization logic.
}

// ===================================================================
// =============== (Optional) Download button hook ===================
// ===================================================================
downloadBtn?.addEventListener('click', () => {
  console.log('Download button clicked');
  // Add your download/export logic here (html2canvas, etc.)
});
