// ================= NAV: highlight active =================
(function () {
    const path = location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-item').forEach(a => {
      const href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
      if (href === path) a.classList.add('active');
    });
  })();
  
  // ================= Element refs (safe if missing) =================
  const coverCards   = Array.from(document.querySelectorAll('.cover-card'));
  const regenBtn     = document.querySelector('.regenerate-btn');
  const applyBtn     = document.querySelector('.apply-btn');
  const downloadBtn  = document.querySelector('.download-btn');
  
  const fontSelectEl = document.querySelector('.right-panel .dropdown'); // "Font Style"
  const titleInputEl = document.querySelector('.text-input');            // "Title Text"
  
  const playlistSelect = document.getElementById('playlistSelect');
  const plTitle = document.querySelector('.playlist-title');
  const plMeta  = document.querySelector('.playlist-meta');
  const songListEl = document.getElementById('songList');
  
  const swatches = Array.from(document.querySelectorAll('.color-swatch'));
  const STORAGE_KEY = 'ai_album_playlist';
  
  // ================= Mock data for playlist songs =================
  const PLAYLIST_PRESETS = {
    'Late Night Vibes': [
      'Midnight City','Electric Feel','Resonance','Sunset Lover','Ribs','Breathe'
    ],
    'Gym Hype': [
      'Titan Mode','Adrenaline Rush','Drop the Bass','Power Set','Heartbeat 140','Last Rep'
    ],
    'Study Flow': [
      'Quiet Focus','Soft Rain','Deep Work','Lo-Fi Bloom','Calm Circuit','Gentle Waves'
    ]
  };
  
  // Render the song list items
  function renderSongList(name) {
    if (!songListEl) return;
    const songs = PLAYLIST_PRESETS[name] || [];
    songListEl.innerHTML = songs.map(s => `<div class="song-item">${s}</div>`).join('');
  }
  
  // ================= Global click handlers (existing UI) =================
  document.addEventListener('click', (e) => {
    if (e.target.matches('.select-btn')) {
      coverCards.forEach(c => c.classList.remove('selected'));
      e.target.closest('.cover-card')?.classList.add('selected');
    }
    if (e.target.matches('.color-swatch')) {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      e.target.classList.add('selected');
    }
  });
  
  // ================= TASK 1: Mock playlist picker + localStorage =================
  (function restorePlaylist() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // default songs for initial page render (optional)
      renderSongList(plTitle?.textContent?.trim() || 'Late Night Vibes');
      return;
    }
    try {
      const data = JSON.parse(raw);
      if (plTitle && data.title) plTitle.textContent = data.title;
      if (plMeta  && data.meta)  plMeta.textContent  = data.meta;
      if (titleInputEl && data.title) titleInputEl.value = data.title;
      renderSongList(data.title);
    } catch {
      renderSongList(plTitle?.textContent?.trim() || 'Late Night Vibes');
    }
  })();
  
  if (playlistSelect) {
    playlistSelect.addEventListener('change', () => {
      if (!playlistSelect.value) return;
      const sel = JSON.parse(playlistSelect.value);
  
      // Update summary
      if (plTitle) plTitle.textContent = sel.title || plTitle.textContent;
      if (plMeta)  plMeta.textContent  = sel.meta  || plMeta.textContent;
  
      // Pre-fill right panel title
      if (titleInputEl && sel.title) titleInputEl.value = sel.title;
  
      // Update songs to match the chosen playlist
      renderSongList(sel.title);
  
      // Persist
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sel));
    });
  }
  
  // ================= Ensure a selected card + initialize palettes =================
  if (coverCards.length && !document.querySelector('.cover-card.selected')) {
    coverCards[0].classList.add('selected');
  }
  coverCards.forEach(card => {
    if (!card.dataset.c1) setCardPalette(card, randomPalette());
  });
  
  // =================  Regenerate + Apply Changes =================
  if (regenBtn) {
    regenBtn.addEventListener('click', () => {
      coverCards.forEach(card => setCardPalette(card, randomPalette()));
    });
  }
  
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const selected = document.querySelector('.cover-card.selected');
      if (!selected) return;
  
      const title = titleInputEl?.value?.trim() || '';
      selected.dataset.title = title;
  
      const fontUi = fontSelectEl?.value || 'Modern Sans';
      selected.dataset.font = fontUi;
  
      const activeSwatch = document.querySelector('.color-swatch.selected');
      if (activeSwatch) {
        const p = shiftPalette(selected.dataset.c1, selected.dataset.c2, activeSwatch);
        setCardPalette(selected, p);
      }
    });
  }
  
  // =================  Download PNG (1024x1024) =================
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      const selected = document.querySelector('.cover-card.selected');
      if (!selected) { alert('Select a cover first'); return; }
  
      const meta = {
        title: selected.dataset.title || (titleInputEl?.value?.trim() || ''),
        fontCss: mapUiFont(selected.dataset.font || (fontSelectEl?.value || 'Modern Sans')),
        c1: selected.dataset.c1 || '#8a5cf6',
        c2: selected.dataset.c2 || '#f06292',
        fg: selected.dataset.fg || '#ffffff'
      };
  
      const blob = await renderCoverPng(meta, 1024);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `cover_${slug(meta.title)}.png`; a.click();
      URL.revokeObjectURL(url);
    });
  }
  
  // ================= Helpers =================
  function mapUiFont(name) {
    switch ((name || '').toLowerCase()) {
      case 'classic serif': return "Georgia, 'Times New Roman', serif";
      case 'bold display':  return "'Impact', 'Haettenschweiler', 'Arial Black', sans-serif";
      case 'elegant script':return "'Brush Script MT', cursive, 'Segoe Script', serif";
      default:              return "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
    }
  }
  
  function setCardPalette(card, p) {
    card.dataset.c1 = p.c1; card.dataset.c2 = p.c2; card.dataset.fg = p.fg;
    const preview = card.querySelector('.cover-preview');
    if (preview) preview.style.background = `linear-gradient(135deg, ${p.c1} 0%, ${p.c2} 100%)`;
  }
  
  function randomPalette() {
    const h = Math.floor(Math.random() * 360);
    const c1 = `hsl(${h} 70% 55%)`;
    const c2 = `hsl(${(h + 35) % 360} 70% 55%)`;
    return withFg(c1, c2);
  }
  
  function shiftPalette(c1, c2, swatchEl) {
    const tint = rgbToHsl(getComputedStyle(swatchEl).backgroundColor).h;
    const n1 = `hsl(${(extractHue(c1) + tint / 6) % 360} 70% 55%)`;
    const n2 = `hsl(${(extractHue(c2) + tint / 6) % 360} 70% 55%)`;
    return withFg(n1, n2);
  }
  
  function withFg(a, b) {
    const mid = mixRgb(a, b, 0.5);
    const fg = relLum(mid) > 0.5 ? '#0b132b' : '#ffffff';
    return { c1: a, c2: b, fg };
  }
  
  // ---- color utils ----
  function extractHue(hsl){ const m = /hsl\(([\d.]+)/.exec(hsl); return m? +m[1] : 0; }

  function cssToRgb(c){
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = c; const s = ctx.fillStyle, m = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(s);
    return { r:+m[1], g:+m[2], b:+m[3] };
  }

  function rgbToHsl(c){
    const { r, g, b } = cssToRgb(c);
    let R = r / 255, G = g / 255, B = b / 255;
  
    const max = Math.max(R, G, B), min = Math.min(R, G, B);
    let h, s, l = (max + min) / 2;
  
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case R: h = (G - B) / d + (G < B ? 6 : 0); break;
        case G: h = (B - R) / d + 2;               break;
        case B: h = (R - G) / d + 4;               break; // <-- fixed (removed extra ')')
      }
      h *= 60;
    }
    return { h, s, l };
  }

  function mixRgb(a,b,t){
    const ca=cssToRgb(a), cb=cssToRgb(b);
    const r=Math.round(ca.r*(1-t)+cb.r*t);
    const g=Math.round(ca.g*(1-t)+cb.g*t);
    const bl=Math.round(ca.b*(1-t)+cb.b*t);
    return `rgb(${r},${g},${bl})`;
  }
  function relLum(rgb){
    const m=/rgb\((\d+),(\d+),(\d+)\)/.exec(rgb); if(!m) return .5;
    const [r,g,b]=[+m[1],+m[2],+m[3]].map(v=>{
      v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);
    });
    return 0.2126*r + 0.7152*g + 0.0722*b;
  }
  
  function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
  
  // ---- Canvas export ----
  async function renderCoverPng(meta, size = 1024) {
    const { title, fontCss, c1, c2, fg } = meta;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
  
    // background gradient
    const grad = ctx.createLinearGradient(0,0,size,size);
    grad.addColorStop(0, c1); grad.addColorStop(1, c2);
    ctx.fillStyle = grad; ctx.fillRect(0,0,size,size);
  
    // title
    const pad = Math.floor(size * 0.085);
    const titlePx = Math.floor(size * 0.10);
    ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.font = `800 ${titlePx}px ${fontCss}`;
  
    const lines = wrapLines(ctx, title || '', size - pad*2);
    let y = size - pad;
    for (let i = lines.length - 1; i >= 0; i--) {
      ctx.fillText(lines[i], pad, y);
      y -= Math.floor(titlePx * 1.05);
    }
  
    return new Promise(res => canvas.toBlob(b => res(b), 'image/png'));
  }
  
  function wrapLines(ctx, text, maxWidth) {
    const words = String(text).split(/\s+/); const out = []; let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width <= maxWidth) line = t;
      else { if (line) out.push(line); line = w; }
    }
    if (line) out.push(line);
    if (out.length > 3) {
      const capped = out.slice(0,3);
      while (ctx.measureText(capped[2] + '…').width > maxWidth) {
        capped[2] = capped[2].slice(0,-1); if (!capped[2]) break;
      }
      capped[2] += '…';
      return capped;
    }
    return out;
  }
  
  // ===== Customize page wiring =====
(function initCustomize() {
    const root = document.getElementById('customCanvas');
    if (!root) return; 
  
    // Elements
    const canvasBox   = document.getElementById('customCanvas');
    const canvasInner = document.getElementById('canvasInner');
    const canvasTitle = document.getElementById('canvasTitle');
  
    const titleIn   = document.getElementById('custTitle');
    const subIn     = document.getElementById('custSubtitle');
    const sizeIn    = document.getElementById('custSize');
    const posGroup  = document.getElementById('custPos');
    const fontIn    = document.getElementById('custFont');
    const weightGrp = document.getElementById('custWeight');
  
    const textColor = document.getElementById('textColor');
    const textCode  = document.getElementById('textColorCode');
    const bgStart   = document.getElementById('bgStart');
    const bgEnd     = document.getElementById('bgEnd');
    const bgOpacity = document.getElementById('bgOpacity');
  
    const fxShadow  = document.getElementById('fxShadow');
    const fxGlow    = document.getElementById('fxGlow');
    const fxBlur    = document.getElementById('fxBlur');
  
    const download  = document.getElementById('custDownload');
    const resetBtn  = document.getElementById('custReset');
    const saveBtn   = document.getElementById('custSave');
  
    // Load prior selection from /generate if available
    const DESIGN_KEY = 'ai_album_design';
    try {
      const prior = JSON.parse(localStorage.getItem(DESIGN_KEY) || 'null');
      if (prior) {
        titleIn.value = prior.title || titleIn.value;
        canvasTitle.textContent = titleIn.value;
        fontIn.value = prior.fontUi || fontIn.value;
        bgStart.value = prior.c1 || bgStart.value;
        bgEnd.value   = prior.c2 || bgEnd.value;
        textColor.value = prior.fg || textColor.value;
        textCode.textContent = (prior.fg || textColor.value).toUpperCase();
        applyAll();
      } else {
        applyAll(); // apply defaults
      }
    } catch { applyAll(); }
  
    // UI bindings
    [titleIn, subIn].forEach(el => el.addEventListener('input', applyAll));
    sizeIn.addEventListener('input', applyAll);
    fontIn.addEventListener('change', applyAll);
    [bgStart, bgEnd, bgOpacity].forEach(el => el.addEventListener('input', applyAll));
    textColor.addEventListener('input', () => { textCode.textContent = textColor.value.toUpperCase(); applyAll(); });
  
    posGroup?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-pos]'); if (!btn) return;
      posGroup.querySelectorAll('.group-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      applyAll();
    });
  
    weightGrp?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-w]'); if (!btn) return;
      weightGrp.querySelectorAll('.group-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      applyAll();
    });
  
    document.querySelectorAll('.template-card').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        bgStart.value = btn.dataset.c1;
        bgEnd.value   = btn.dataset.c2;
        applyAll();
      });
    });
  
    resetBtn?.addEventListener('click', () => {
      titleIn.value = 'Late Night Vibes';
      subIn.value = '';
      sizeIn.value = 48;
      fontIn.value = 'Modern Sans';
      textColor.value = '#ffffff';
      textCode.textContent = '#FFFFFF';
      bgStart.value = '#a7c7e7';
      bgEnd.value   = '#c9b8f0';
      bgOpacity.value = 100;
      fxShadow.checked = fxGlow.checked = fxBlur.checked = false;
      posGroup.querySelectorAll('.group-btn').forEach(b=>b.classList.remove('active'));
      posGroup.querySelector('[data-pos="center"]').classList.add('active');
      weightGrp.querySelectorAll('.group-btn').forEach(b=>b.classList.remove('active'));
      weightGrp.querySelector('[data-w="600"]').classList.add('active');
      applyAll();
    });
  
    saveBtn?.addEventListener('click', () => {
      const snap = currentMeta();
      localStorage.setItem(DESIGN_KEY, JSON.stringify(snap));
      prependHistory(snap.title || 'Untitled');
    });
  
    download?.addEventListener('click', async () => {
      const m = currentMeta();
      const blob = await renderCoverPng({
        title: m.titleWithSubtitle,
        fontCss: mapUiFont(m.fontUi),
        c1: m.c1, c2: m.c2, fg: m.fg
      }, 1024);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `cover_${slug(m.title || 'playlist')}.png`; a.click();
      URL.revokeObjectURL(url);
    });
  
    // Helpers
    function mapWeightUi() {
      const active = weightGrp.querySelector('.group-btn.active');
      return active ? Number(active.dataset.w) : 600;
    }
    function mapPosUi() {
      const active = posGroup.querySelector('.group-btn.active');
      return active ? active.dataset.pos : 'center';
    }
    function applyAll() {
      // text & font
      canvasTitle.textContent = titleIn.value || '';
      const sub = subIn.value?.trim();
      canvasTitle.style.fontFamily = mapUiFont(fontIn.value);
      canvasTitle.style.fontWeight = mapWeightUi();
      canvasTitle.style.fontSize   = `${sizeIn.value}px`;
      canvasTitle.style.color      = textColor.value;
  
      // optional subtitle line
      if (sub) {
        if (!document.getElementById('canvasSub')) {
          const p = document.createElement('p');
          p.id = 'canvasSub';
          p.style.margin = '8px 0 0';
          p.style.opacity = '0.9';
          p.style.fontSize = Math.max(14, Math.round(sizeIn.value*0.45)) + 'px';
          p.style.color = textColor.value;
          p.textContent = sub;
          canvasInner.appendChild(p);
        } else {
          const p = document.getElementById('canvasSub');
          p.style.fontSize = Math.max(14, Math.round(sizeIn.value*0.45)) + 'px';
          p.style.color = textColor.value;
          p.textContent = sub;
        }
      } else {
        document.getElementById('canvasSub')?.remove();
      }
  
      // gradient + opacity
      const o = Number(bgOpacity.value) / 100;
      canvasBox.style.background = `linear-gradient(135deg, ${withAlpha(bgStart.value,o)} 0%, ${withAlpha(bgEnd.value,o)} 100%)`;
  
      // effects
      const shadow = fxShadow.checked ? '0 4px 24px rgba(0,0,0,0.25)' : 'none';
      const glow   = fxGlow.checked ? `0 0 32px ${textColor.value}55` : 'none';
      canvasTitle.style.textShadow = fxShadow.checked ? '0 2px 10px rgba(0,0,0,.35)' : 'none';
      canvasInner.style.filter = fxBlur.checked ? 'blur(1px)' : 'none';
      canvasBox.style.boxShadow = [shadow, glow].filter(Boolean).join(', ');
  
      // position
      const pos = mapPosUi();
      canvasBox.style.display = 'flex';
      canvasBox.style.flexDirection = 'column';
      canvasBox.style.justifyContent =
        pos === 'top' ? 'flex-start' : (pos === 'bottom' ? 'flex-end' : 'center');
      canvasBox.style.alignItems = 'center';
    }
  
    function withAlpha(hex, a=1) {
      // returns rgba() from hex
      const c = hex.replace('#','');
      const n = c.length===3 ? c.split('').map(x=>x+x).join('') : c;
      const r = parseInt(n.slice(0,2),16), g = parseInt(n.slice(2,4),16), b = parseInt(n.slice(4,6),16);
      return `rgba(${r},${g},${b},${a})`;
    }
  
    function currentMeta() {
      const title = titleIn.value.trim() || '';
      const sub = subIn.value.trim();
      const titleWithSubtitle = sub ? `${title} — ${sub}` : title;
      return {
        title,
        titleWithSubtitle,
        fontUi: fontIn.value,
        c1: bgStart.value,
        c2: bgEnd.value,
        fg: textColor.value
      };
    }
  
    function prependHistory(name) {
      const list = document.getElementById('custHistory');
      if (!list) return;
      const item = document.createElement('div');
      item.className = 'history-item';
      item.textContent = `${name} • ${new Date().toLocaleTimeString()}`;
      item.addEventListener('click', () => {
        // quick restore of last saved design
        const d = JSON.parse(localStorage.getItem(DESIGN_KEY) || 'null');
        if (!d) return;
        titleIn.value = d.title || titleIn.value;
        fontIn.value = d.fontUi || fontIn.value;
        bgStart.value = d.c1 || bgStart.value;
        bgEnd.value   = d.c2 || bgEnd.value;
        textColor.value = d.fg || textColor.value;
        textCode.textContent = (d.fg || textColor.value).toUpperCase();
        applyAll();
      });
      list.prepend(item);
    }
  
  })();
  
  