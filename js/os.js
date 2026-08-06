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

  /* ---------------- Desktop icons / taskbar "open a file" shortcuts ---------------- */
  document.querySelectorAll("[data-open]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const fileId = el.getAttribute("data-open");
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
})();
