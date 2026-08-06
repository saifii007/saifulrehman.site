/**
 * theme.js
 * Light/dark theme toggle. Persists choice in localStorage; falls back to
 * the OS-level prefers-color-scheme on first visit. Runs inline in <head>
 * (not deferred) so the correct theme applies before first paint — avoids
 * a flash of the wrong theme.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "saif-portfolio-theme";

  function getInitialTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("themeToggle");
    if (btn) {
      btn.setAttribute("aria-pressed", String(theme === "light"));
      btn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
  }

  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;

    applyTheme(document.documentElement.getAttribute("data-theme") || initialTheme);

    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  });
})();
