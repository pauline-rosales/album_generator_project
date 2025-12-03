// ================= NAV: highlight active =================
(function () {
  const path = location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".nav-item").forEach((a) => {
    const href = (a.getAttribute("href") || "").replace(/\/$/, "") || "/";
    if (href === path) a.classList.add("active");
  });
})();

// ================= Shared Helpers (Generate + Customize) =================

function mapUiFont(name) {
  switch ((name || "").toLowerCase()) {
    case "classic serif":
      return "Georgia, 'Times New Roman', serif";
    case "bold display":
      return "'Impact', 'Haettenschweiler', 'Arial Black', sans-serif";
    case "elegant script":
      return "'Brush Script MT', cursive, 'Segoe Script', serif";
    default:
      return "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
  }
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---- small color helpers used by renderCoverPng ----
function cssToRgb(c) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = c;
  const s = ctx.fillStyle;
  const m = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(s);
  return { r: +m[1], g: +m[2], b: +m[3] };
}

function mixRgb(a, b, t) {
  const ca = cssToRgb(a),
    cb = cssToRgb(b);
  const r = Math.round(ca.r * (1 - t) + cb.r * t);
  const g = Math.round(ca.g * (1 - t) + cb.g * t);
  const bl = Math.round(ca.b * (1 - t) + cb.b * t);
  return `rgb(${r},${g},${bl})`;
}

function relLum(rgb) {
  const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(rgb);
  if (!m) return 0.5;
  const [r, g, b] = [+m[1], +m[2], +m[3]].map((v) => {
    v /= 255;
    return v <= 0.03928
      ? v / 12.92
      : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const out = [];
  let line = "";

  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width <= maxWidth) {
      line = t;
    } else {
      if (line) out.push(line);
      line = w;
    }
  }
  if (line) out.push(line);

  if (out.length > 3) {
    const capped = out.slice(0, 3);
    while (ctx.measureText(capped[2] + "…").width > maxWidth) {
      capped[2] = capped[2].slice(0, -1);
      if (!capped[2]) break;
    }
    capped[2] += "…";
    return capped;
  }
  return out;
}

// ---- Canvas export (used by BOTH pages) ----
async function renderCoverPng(meta, size = 1024) {
  const { title, fontCss, c1, c2, fg } = meta;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // title
  const pad = Math.floor(size * 0.085);
  const titlePx = Math.floor(size * 0.1);
  ctx.fillStyle = fg;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.font = `800 ${titlePx}px ${fontCss}`;

  const lines = wrapLines(ctx, title || "", size - pad * 2);
  let y = size - pad;
  for (let i = lines.length - 1; i >= 0; i--) {
    ctx.fillText(lines[i], pad, y);
    y -= Math.floor(titlePx * 1.05);
  }

  return new Promise((res) =>
    canvas.toBlob((b) => res(b), "image/png")
  );
}

// expose helpers globally so inline pages can call them if needed
window.mapUiFont = mapUiFont;
window.slug = slug;
window.renderCoverPng = renderCoverPng;

// ================= Customize page wiring =================
(function initCustomize() {
  const root = document.getElementById("customCanvas");
  if (!root) return; // not on Customize page

  const canvasBox = document.getElementById("customCanvas");
  const canvasInner = document.getElementById("canvasInner");
  const canvasTitle = document.getElementById("canvasTitle");

  const titleIn = document.getElementById("custTitle");
  const subIn = document.getElementById("custSubtitleInput");
  const sizeIn = document.getElementById("custSize");
  const posGroup = document.getElementById("custPos");
  const fontIn = document.getElementById("custFont");
  const weightGrp = document.getElementById("custWeight");

  const textColor = document.getElementById("textColor");
  const textCode = document.getElementById("textColorCode");
  const bgStart = document.getElementById("bgStart");
  const bgEnd = document.getElementById("bgEnd");
  const bgOpacity = document.getElementById("bgOpacity");

  const fxShadow = document.getElementById("fxShadow");
  const fxGlow = document.getElementById("fxGlow");
  const fxBlur = document.getElementById("fxBlur");

  const download = document.getElementById("custDownload");
  const resetBtn = document.getElementById("custReset");
  const saveBtn = document.getElementById("custSave");
  const shareBtn = document.getElementById("custShare"); // make sure Share button has this id

  const DESIGN_KEY = "ai_album_design";

  function safeVal(el, fallback = "") {
    return el && "value" in el ? el.value : fallback;
  }

  function safeChecked(el) {
    return el && "checked" in el ? el.checked : false;
  }

  function mapWeightUi() {
    if (!weightGrp) return 600;
    const active = weightGrp.querySelector(".group-btn.active");
    return active ? Number(active.dataset.w) : 600;
  }

  function mapPosUi() {
    if (!posGroup) return "center";
    const active = posGroup.querySelector(".group-btn.active");
    return active ? active.dataset.pos : "center";
  }

  function withAlpha(hex, a = 1) {
    if (!hex) hex = "#000000";
    const c = hex.replace("#", "");
    const n = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
    const r = parseInt(n.slice(0, 2), 16) || 0;
    const g = parseInt(n.slice(2, 4), 16) || 0;
    const b = parseInt(n.slice(4, 6), 16) || 0;
    return `rgba(${r},${g},${b},${a})`;
  }

  // 🔥 Bring back your selected_cover_config so the AI image stays
  function loadFromSelectedCover() {
    try {
      let raw = null;

      try {
        raw = window.localStorage.getItem("selected_cover_config");
      } catch (_) {}

      if (!raw) {
        try {
          raw = window.sessionStorage.getItem("selected_cover_config");
        } catch (_) {}
      }

      if (!raw) return;

      const cfg = JSON.parse(raw);

      if (cfg.title && titleIn) {
        titleIn.value = cfg.title;
      }
      if (cfg.font && fontIn) {
        const opts = Array.from(fontIn.options).map((o) => o.value);
        if (opts.includes(cfg.font)) {
          fontIn.value = cfg.font;
        }
      }

      // If we have an AI image, use it as backgroundImage
      if (cfg.backgroundImage && cfg.backgroundImage !== "none") {
        canvasBox.style.backgroundImage = cfg.backgroundImage;
        canvasBox.style.backgroundSize = "cover";
        canvasBox.style.backgroundPosition = "center";
        canvasBox.style.backgroundRepeat = "no-repeat";
      } else if (cfg.color) {
        // fallback: use a flat color as gradient start/end
        if (bgStart) bgStart.value = cfg.color;
        if (bgEnd) bgEnd.value = cfg.color;
      }
    } catch (e) {
      console.warn("Failed to load selected_cover_config:", e);
    }
  }

  function currentMeta() {
    const title = (safeVal(titleIn) || "").trim();
    const sub = (safeVal(subIn) || "").trim();
    const titleWithSubtitle = sub ? `${title} — ${sub}` : title || "playlist";
    return {
      title: title || "playlist",
      titleWithSubtitle,
      fontUi: safeVal(fontIn) || "Modern Sans",
      c1: safeVal(bgStart) || "#a7c7e7",
      c2: safeVal(bgEnd) || "#c9b8f0",
      fg: safeVal(textColor) || "#ffffff",
    };
  }

  function applyAll() {
    if (!canvasBox || !canvasInner || !canvasTitle) return;

    const meta = currentMeta();

    // text & font
    canvasTitle.textContent = meta.title || "";
    const subText = (safeVal(subIn) || "").trim();
    canvasTitle.style.fontFamily = mapUiFont(meta.fontUi);
    canvasTitle.style.fontWeight = mapWeightUi();
    if (sizeIn) {
      canvasTitle.style.fontSize = `${safeVal(sizeIn) || 48}px`;
    }
    canvasTitle.style.color = meta.fg;

    // subtitle
    if (subText) {
      let p = document.getElementById("canvasSub");
      if (!p) {
        p = document.createElement("p");
        p.id = "canvasSub";
        p.style.margin = "8px 0 0";
        p.style.opacity = "0.9";
        canvasInner.appendChild(p);
      }
      const baseSize = sizeIn ? Number(safeVal(sizeIn) || 48) : 48;
      p.style.fontSize = Math.max(14, Math.round(baseSize * 0.45)) + "px";
      p.style.color = meta.fg;
      p.textContent = subText;
    } else {
      document.getElementById("canvasSub")?.remove();
    }

    // gradient + opacity
    const o = bgOpacity ? Number(safeVal(bgOpacity) || 100) / 100 : 1;

    // ⚠️ only apply gradient if there is NO AI background image
    const hasImageBg =
      canvasBox.style.backgroundImage &&
      canvasBox.style.backgroundImage !== "none";

    if (!hasImageBg) {
      canvasBox.style.background = `linear-gradient(135deg, ${withAlpha(
        meta.c1,
        o
      )} 0%, ${withAlpha(meta.c2, o)} 100%)`;
    }
    canvasBox.style.opacity = o;

    // effects
    const shadowOn = safeChecked(fxShadow);
    const glowOn = safeChecked(fxGlow);
    const blurOn = safeChecked(fxBlur);

    const shadow = shadowOn ? "0 4px 24px rgba(0,0,0,0.25)" : "none";
    const glow = glowOn ? `0 0 32px ${meta.fg}55` : "none";
    canvasTitle.style.textShadow = shadowOn
      ? "0 2px 10px rgba(0,0,0,.35)"
      : "none";
    canvasInner.style.filter = blurOn ? "blur(1px)" : "none";
    canvasBox.style.boxShadow = [shadow, glow].filter(Boolean).join(", ");

    // position
    const pos = mapPosUi();
    canvasBox.style.display = "flex";
    canvasBox.style.flexDirection = "column";
    canvasBox.style.justifyContent =
      pos === "top" ? "flex-start" : pos === "bottom" ? "flex-end" : "center";
    canvasBox.style.alignItems = "center";
  }

  // ===== init from saved design / selected cover =====
  loadFromSelectedCover(); // bring back AI cover first

  try {
    const prior = JSON.parse(localStorage.getItem(DESIGN_KEY) || "null");
    if (prior) {
      if (titleIn) titleIn.value = prior.title || titleIn.value;
      if (canvasTitle)
        canvasTitle.textContent = titleIn ? titleIn.value : prior.title;
      if (fontIn) fontIn.value = prior.fontUi || fontIn.value;
      if (bgStart) bgStart.value = prior.c1 || bgStart.value;
      if (bgEnd) bgEnd.value = prior.c2 || bgEnd.value;
      if (textColor) textColor.value = prior.fg || textColor.value;
      if (textCode)
        textCode.textContent = (prior.fg || textColor.value || "#ffffff").toUpperCase();
    }
  } catch (e) {
    console.warn("Could not load DESIGN_KEY from localStorage:", e);
  }

  // ===== bind controls safely =====
  [titleIn, subIn].forEach(
    (el) => el && el.addEventListener("input", applyAll)
  );
  sizeIn && sizeIn.addEventListener("input", applyAll);
  fontIn && fontIn.addEventListener("change", applyAll);
  [bgStart, bgEnd, bgOpacity].forEach(
    (el) => el && el.addEventListener("input", applyAll)
  );
  textColor &&
    textColor.addEventListener("input", () => {
      if (textCode)
        textCode.textContent = (textColor.value || "#ffffff").toUpperCase();
      applyAll();
    });

  posGroup &&
    posGroup.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-pos]");
      if (!btn) return;
      posGroup
        .querySelectorAll(".group-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyAll();
    });

  weightGrp &&
    weightGrp.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-w]");
      if (!btn) return;
      weightGrp
        .querySelectorAll(".group-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyAll();
    });

  document.querySelectorAll(".template-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (bgStart) bgStart.value = btn.dataset.c1 || bgStart.value;
      if (bgEnd) bgEnd.value = btn.dataset.c2 || bgEnd.value;

      // if user clicks a template, we intentionally drop AI image
      canvasBox.style.backgroundImage = "none";

      applyAll();
    });
  });

  resetBtn &&
    resetBtn.addEventListener("click", () => {
      if (titleIn) titleIn.value = "Late Night Vibes";
      if (subIn) subIn.value = "";
      if (sizeIn) sizeIn.value = 48;
      if (fontIn) fontIn.value = "Modern Sans";
      if (textColor) textColor.value = "#ffffff";
      if (textCode) textCode.textContent = "#FFFFFF";
      if (bgStart) bgStart.value = "#a7c7e7";
      if (bgEnd) bgEnd.value = "#c9b8f0";
      if (bgOpacity) bgOpacity.value = 100;
      if (fxShadow) fxShadow.checked = false;
      if (fxGlow) fxGlow.checked = false;
      if (fxBlur) fxBlur.checked = false;

      // clear AI image on reset
      canvasBox.style.backgroundImage = "none";

      if (posGroup) {
        posGroup
          .querySelectorAll(".group-btn")
          .forEach((b) => b.classList.remove("active"));
        const centerBtn = posGroup.querySelector('[data-pos="center"]');
        centerBtn && centerBtn.classList.add("active");
      }

      if (weightGrp) {
        weightGrp
          .querySelectorAll(".group-btn")
          .forEach((b) => b.classList.remove("active"));
        const w600 = weightGrp.querySelector('[data-w="600"]');
        w600 && w600.classList.add("active");
      }

      applyAll();
    });

  saveBtn &&
    saveBtn.addEventListener("click", () => {
      const snap = currentMeta();
      try {
        localStorage.setItem(DESIGN_KEY, JSON.stringify(snap));
      } catch (e) {
        console.warn("Could not save DESIGN_KEY to localStorage:", e);
      }
    });

  // ✅ Download button on Customize
  download &&
    download.addEventListener("click", async () => {
      const m = currentMeta();
      const blob = await renderCoverPng(
        {
          title: m.titleWithSubtitle,
          fontCss: mapUiFont(m.fontUi),
          c1: m.c1,
          c2: m.c2,
          fg: m.fg,
        },
        1024
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cover_${slug(m.title || "playlist")}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });

  // ✅ Share button on Customize
  shareBtn &&
    shareBtn.addEventListener("click", async () => {
      const m = currentMeta();
      const blob = await renderCoverPng(
        {
          title: m.titleWithSubtitle,
          fontCss: mapUiFont(m.fontUi),
          c1: m.c1,
          c2: m.c2,
          fg: m.fg,
        },
        1024
      );

      try {
        const file = new File(
          [blob],
          `cover_${slug(m.title || "playlist")}.png`,
          { type: "image/png" }
        );

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: m.title,
            files: [file],
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `cover_${slug(m.title || "playlist")}.png`;
          a.click();
          URL.revokeObjectURL(url);
          alert(
            "Sharing is not fully supported in this browser, so the cover was downloaded instead."
          );
        }
      } catch (err) {
        console.error("Error sharing cover:", err);
        alert("Could not share cover on this browser.");
      }
    });

  // initial paint
  applyAll();
})();
