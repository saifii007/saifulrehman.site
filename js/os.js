/**
 * os.js
 * Windows 11 desktop shell: boot overlay, live clock/date widgets, and the
 * VS Code window's open/close/minimize/maximize lifecycle + taskbar wiring.
 * File-content rendering lives in ide.js — this file only owns the "OS" chrome.
 */
(function () {
  "use strict";

  const BOOT_KEY = "saif-os-booted";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Boot overlay (once per session) ---------------- */
  const bootOverlay = document.getElementById("bootOverlay");
  if (bootOverlay) {
    if (sessionStorage.getItem(BOOT_KEY)) {
      bootOverlay.hidden = true;
    } else {
      sessionStorage.setItem(BOOT_KEY, "1");
      const delay = prefersReducedMotion ? 250 : 2300;
      setTimeout(() => {
        bootOverlay.hidden = true;
      }, delay);
    }
  }

  /* ---------------- Fullscreen on load ----------------
     Browsers block requestFullscreen() unless it's called inside a real
     user gesture — a page can never force itself fullscreen with zero
     interaction. So: try once immediately (succeeds only in embedded/kiosk
     contexts that already grant it), and otherwise arm a one-time listener
     that goes fullscreen on the visitor's very first click/key/tap
     anywhere, so it happens as early as possible without extra UI. */
  function goFullscreen() {
    const el = document.documentElement;
    if (document.fullscreenElement || !el.requestFullscreen) return;
    el.requestFullscreen().catch(() => {});
  }
  goFullscreen();
  ["pointerdown", "keydown"].forEach((evt) => {
    document.addEventListener(evt, goFullscreen, { once: true, passive: true });
  });

  /* ---------------- Fullscreen taskbar toggle ---------------- */
  const trayFullscreen = document.getElementById("trayFullscreen");
  const fsExpandIcon = trayFullscreen ? trayFullscreen.querySelector(".tray-fs-expand") : null;
  const fsCompressIcon = trayFullscreen ? trayFullscreen.querySelector(".tray-fs-compress") : null;

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  function syncFullscreenIcon() {
    const isFs = !!document.fullscreenElement;
    if (fsExpandIcon) fsExpandIcon.hidden = isFs;
    if (fsCompressIcon) fsCompressIcon.hidden = !isFs;
  }

  if (trayFullscreen) trayFullscreen.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", () => {
    syncFullscreenIcon();
    checkFsNudge();
  });
  syncFullscreenIcon();

  /* ---------------- Small-screen fullscreen nudge ---------------- */
  const FS_NUDGE_KEY = "saif-os-fs-nudge-dismissed";
  const fsNudge = document.getElementById("fsNudge");
  const fsNudgeBtn = document.getElementById("fsNudgeBtn");
  const fsNudgeDismiss = document.getElementById("fsNudgeDismiss");

  function checkFsNudge() {
    if (!fsNudge) return;
    const shouldShow = window.innerWidth < 900 && !document.fullscreenElement && !sessionStorage.getItem(FS_NUDGE_KEY);
    fsNudge.hidden = !shouldShow;
  }

  function dismissFsNudge() {
    sessionStorage.setItem(FS_NUDGE_KEY, "1");
    if (fsNudge) fsNudge.hidden = true;
  }

  if (fsNudgeBtn) fsNudgeBtn.addEventListener("click", () => { toggleFullscreen(); dismissFsNudge(); });
  if (fsNudgeDismiss) fsNudgeDismiss.addEventListener("click", dismissFsNudge);
  window.addEventListener("resize", checkFsNudge);
  checkFsNudge();

  /* ---------------- Live clock / date (taskbar tray only) ---------------- */
  const trayTime = document.getElementById("trayTime");
  const trayDate = document.getElementById("trayDate");

  function tick() {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const shortDate = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

    if (trayTime) trayTime.textContent = time;
    if (trayDate) trayDate.textContent = shortDate;
  }
  tick();
  setInterval(tick, 1000 * 15);

  /* ---------------- Window management ---------------- */
  const win = document.getElementById("vscodeWindow");
  const taskbarVscode = document.getElementById("taskbarVscode");
  const minimizeBtn = document.getElementById("ideMinimizeBtn");
  const maximizeBtn = document.getElementById("ideMaximizeBtn");
  const closeBtn = document.getElementById("ideCloseBtn");
  const ideSidebar = document.getElementById("ideSidebar");

  function openWindow() {
    win.hidden = false;
    win.classList.remove("is-minimized");
    // Force reflow so the open transition replays even if it was just unhidden.
    void win.offsetWidth;
    win.classList.add("is-open");
    if (taskbarVscode) taskbarVscode.classList.add("is-running");
  }

  function minimizeWindow() {
    win.classList.add("is-minimized");
  }

  function toggleMaximize() {
    win.classList.toggle("is-maximized");
  }

  function closeWindow() {
    win.classList.remove("is-open");
    if (taskbarVscode) taskbarVscode.classList.remove("is-running");
    setTimeout(() => {
      win.hidden = true;
    }, prefersReducedMotion ? 0 : 260);
  }

  window.osOpenWindow = openWindow;

  if (minimizeBtn) minimizeBtn.addEventListener("click", minimizeWindow);
  if (maximizeBtn) maximizeBtn.addEventListener("click", toggleMaximize);
  if (closeBtn) closeBtn.addEventListener("click", closeWindow);

  // Double-click the titlebar to maximize/restore, like a real window.
  const titlebar = document.getElementById("ideTitlebar");
  if (titlebar) {
    titlebar.addEventListener("dblclick", (e) => {
      if (e.target.closest(".ide-win-btn")) return;
      toggleMaximize();
    });
  }

  if (taskbarVscode) {
    taskbarVscode.addEventListener("click", () => {
      if (win.hidden || win.classList.contains("is-minimized")) {
        openWindow();
      } else {
        minimizeWindow();
      }
    });
  }

  /* ---------------- Resume PDF viewer (pdf.js, lazy-loaded from CDN) ---------------- */
  const RESUME_PATH = "assets/resume/Saif-Ul-Rehman-Resume.pdf";
  const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379";
  const pdfModal = document.getElementById("pdfModal");
  const pdfModalBackdrop = document.getElementById("pdfModalBackdrop");
  const pdfModalClose = document.getElementById("pdfModalClose");
  const pdfModalBody = document.getElementById("pdfModalBody");
  const pdfModalLoading = document.getElementById("pdfModalLoading");
  let pdfjsLoadPromise = null;

  function loadPdfJs() {
    if (pdfjsLoadPromise) return pdfjsLoadPromise;
    pdfjsLoadPromise = new Promise((resolve, reject) => {
      if (window.pdfjsLib) return resolve(window.pdfjsLib);
      const script = document.createElement("script");
      script.src = `${PDFJS_CDN}/pdf.min.js`;
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
        resolve(window.pdfjsLib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return pdfjsLoadPromise;
  }

  function closePdfModal() {
    if (pdfModal) pdfModal.hidden = true;
    if (pdfModalBackdrop) pdfModalBackdrop.hidden = true;
  }

  async function openPdfViewer(path) {
    if (!pdfModal) return;
    pdfModal.hidden = false;
    pdfModalBackdrop.hidden = false;
    pdfModalBody.querySelectorAll("canvas").forEach((c) => c.remove());
    if (pdfModalLoading) pdfModalLoading.hidden = false;

    try {
      const pdfjsLib = await loadPdfJs();
      const doc = await pdfjsLib.getDocument(path).promise;
      if (pdfModalLoading) pdfModalLoading.hidden = true;
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        pdfModalBody.appendChild(canvas);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      }
    } catch (err) {
      if (pdfModalLoading) {
        pdfModalLoading.hidden = false;
        pdfModalLoading.textContent = "Couldn't load the PDF preview — use the Download link above.";
      }
    }
  }
  window.openPdfViewer = openPdfViewer;

  if (pdfModalClose) pdfModalClose.addEventListener("click", closePdfModal);
  if (pdfModalBackdrop) pdfModalBackdrop.addEventListener("click", closePdfModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && pdfModal && !pdfModal.hidden) closePdfModal();
  });

  /* ---------------- Desktop icons / taskbar "open a file" shortcuts ---------------- */
  document.querySelectorAll("[data-open]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const fileId = el.getAttribute("data-open");
      if (fileId === "resume") {
        e.preventDefault();
        openPdfViewer(RESUME_PATH);
        return;
      }
      if (fileId === "projects-folder") {
        e.preventDefault();
        openWindow();
        if (typeof window.ideOpenFile === "function") window.ideOpenFile("angunet");
        return;
      }
      e.preventDefault();
      openWindow();
      if (typeof window.ideOpenFile === "function") window.ideOpenFile(fileId);
    });
  });

  /* ---------------- Sidebar toggle (Explorer activity icon on desktop, ☰ on mobile) ---------------- */
  const explorerActivityBtn = document.querySelector(".activity-btn[aria-label='Explorer']");
  const mobileMenuBtn = document.getElementById("ideMobileMenuBtn");
  [explorerActivityBtn, mobileMenuBtn].forEach((btn) => {
    if (btn && ideSidebar) {
      btn.addEventListener("click", () => ideSidebar.classList.toggle("is-open"));
    }
  });

  // Closing a file from the mobile sidebar should also close the drawer.
  if (ideSidebar) {
    ideSidebar.addEventListener("click", (e) => {
      if (e.target.closest(".tree-file") && window.innerWidth <= 760) {
        ideSidebar.classList.remove("is-open");
      }
      const collapsible = e.target.closest(".ide-sidebar-collapsible");
      if (collapsible) collapsible.classList.toggle("is-collapsed");
    });
  }

  /* ---------------- Start Menu ---------------- */
  const startMenu = document.getElementById("startMenu");
  const startBackdrop = document.getElementById("startBackdrop");
  const startBtn = document.getElementById("taskbarStart");
  const searchBtn = document.getElementById("taskbarSearch");
  const startSearchInput = document.getElementById("startSearchInput");
  const startPinnedGrid = document.getElementById("startPinnedGrid");
  const startRecentGrid = document.getElementById("startRecentGrid");
  const startPowerBtn = document.getElementById("startPowerBtn");

  const PINNED_TILES = [
    { id: "about", icon: "📄", label: "About-Me.md" },
    { id: "skills", icon: "🧠", label: "Skills.json" },
    { id: "angunet", icon: "📦", label: "Projects" },
    { id: "experience", icon: "📜", label: "Experience.json" },
    { id: "contact", icon: "✉️", label: "Contact.env" },
    { id: "resume", icon: "📑", label: "Resume.pdf" },
  ];

  function tileMarkup(t) {
    return `<button type="button" class="start-tile" data-file="${t.id}">
      <span class="start-tile-glyph" aria-hidden="true">${t.icon}</span>
      <span class="start-tile-label">${t.label}</span>
    </button>`;
  }

  function recentMarkup(p) {
    const thumb = p.image
      ? `<img src="${p.image}" alt="" loading="lazy" />`
      : `<div class="start-recent-thumb-fallback">${p.icon || "📦"}</div>`;
    return `<button type="button" class="start-recent-item" data-file="${p.id}">
      <div class="start-recent-thumb">${thumb}</div>
      <div class="start-recent-info">
        <div class="start-recent-name">${p.name}</div>
        <div class="start-recent-sub">${p.tagline || "Recently added"}</div>
      </div>
    </button>`;
  }

  if (startPinnedGrid) startPinnedGrid.innerHTML = PINNED_TILES.map(tileMarkup).join("");

  if (startRecentGrid && typeof PROJECTS !== "undefined") {
    startRecentGrid.innerHTML = PROJECTS.filter((p) => p.image)
      .slice(0, 6)
      .map(recentMarkup)
      .join("");
  }

  function openFileFromMenu(id) {
    closeStartMenu();
    if (id === "resume") {
      openPdfViewer(RESUME_PATH);
      return;
    }
    openWindow();
    if (typeof window.ideOpenFile === "function") window.ideOpenFile(id);
  }

  [startPinnedGrid, startRecentGrid].forEach((grid) => {
    if (!grid) return;
    grid.addEventListener("click", (e) => {
      const item = e.target.closest("[data-file]");
      if (item) openFileFromMenu(item.dataset.file);
    });
  });

  function openStartMenu() {
    startMenu.hidden = false;
    startBackdrop.hidden = false;
    void startMenu.offsetWidth;
    startMenu.classList.add("is-open");
    if (startSearchInput) {
      startSearchInput.value = "";
      filterStart("");
      setTimeout(() => startSearchInput.focus(), 60);
    }
  }

  function closeStartMenu() {
    startMenu.classList.remove("is-open");
    startBackdrop.hidden = true;
    setTimeout(() => {
      startMenu.hidden = true;
    }, prefersReducedMotion ? 0 : 190);
  }

  function toggleStartMenu() {
    if (startMenu.classList.contains("is-open")) closeStartMenu();
    else openStartMenu();
  }

  function filterStart(query) {
    const q = query.trim().toLowerCase();
    startPinnedGrid.querySelectorAll(".start-tile").forEach((tile) => {
      const label = tile.querySelector(".start-tile-label").textContent.toLowerCase();
      tile.style.display = !q || label.includes(q) ? "" : "none";
    });
    startRecentGrid.querySelectorAll(".start-recent-item").forEach((item) => {
      const label = item.querySelector(".start-recent-name").textContent.toLowerCase();
      item.style.display = !q || label.includes(q) ? "" : "none";
    });
  }

  const startProfileBtn = document.getElementById("startProfileBtn");
  if (startProfileBtn) startProfileBtn.addEventListener("click", () => openFileFromMenu("about"));

  if (startBtn) startBtn.addEventListener("click", toggleStartMenu);
  if (searchBtn) searchBtn.addEventListener("click", toggleStartMenu);
  if (startBackdrop) startBackdrop.addEventListener("click", closeStartMenu);
  if (startPowerBtn) startPowerBtn.addEventListener("click", closeStartMenu);
  if (startSearchInput) startSearchInput.addEventListener("input", (e) => filterStart(e.target.value));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && startMenu.classList.contains("is-open")) closeStartMenu();
  });

  /* ---------------- Social link confirm modal (GitHub / LinkedIn) ---------------- */
  const SOCIALS = {
    github: {
      url: "https://github.com/saifii007",
      title: "GitHub",
      text: "Check out Saif's open-source work, including ANGUNET and other public repositories.",
      icon: `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" fill="#fff"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
    },
    linkedin: {
      url: "https://www.linkedin.com/in/saif-ul-rehman777/",
      title: "LinkedIn",
      text: "Connect with Saif on LinkedIn to see his full professional background and experience.",
      icon: `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><rect width="24" height="24" rx="4" fill="#0A66C2"/><path fill="#fff" d="M7.12 9.4H4.4V19h2.72V9.4ZM5.76 8.2a1.58 1.58 0 1 0 0-3.16 1.58 1.58 0 0 0 0 3.16ZM19.6 19h-2.72v-5.02c0-1.2-.02-2.74-1.66-2.74-1.67 0-1.93 1.3-1.93 2.65V19H10.6V9.4h2.6v1.31h.04c.36-.68 1.25-1.4 2.58-1.4 2.76 0 3.27 1.82 3.27 4.18V19Z"/></svg>`,
    },
  };

  const socialModal = document.getElementById("socialModal");
  const socialModalBackdrop = document.getElementById("socialModalBackdrop");
  const socialModalClose = document.getElementById("socialModalClose");
  const socialModalIcon = document.getElementById("socialModalIcon");
  const socialModalTitle = document.getElementById("socialModalTitle");
  const socialModalText = document.getElementById("socialModalText");
  const socialModalVisit = document.getElementById("socialModalVisit");

  function openSocialModal(key) {
    const s = SOCIALS[key];
    if (!s || !socialModal) return;
    socialModalIcon.innerHTML = s.icon;
    socialModalTitle.textContent = s.title;
    socialModalText.textContent = s.text;
    socialModalVisit.href = s.url;
    socialModal.hidden = false;
    socialModalBackdrop.hidden = false;
  }

  function closeSocialModal() {
    if (socialModal) socialModal.hidden = true;
    if (socialModalBackdrop) socialModalBackdrop.hidden = true;
  }

  document.querySelectorAll("[data-social]").forEach((btn) => {
    btn.addEventListener("click", () => openSocialModal(btn.dataset.social));
  });
  if (socialModalClose) socialModalClose.addEventListener("click", closeSocialModal);
  if (socialModalBackdrop) socialModalBackdrop.addEventListener("click", closeSocialModal);
  if (socialModalVisit) socialModalVisit.addEventListener("click", closeSocialModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && socialModal && !socialModal.hidden) closeSocialModal();
  });
})();
