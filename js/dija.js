/**
 * dija.js
 * DIJA — the desktop greeting alert (typing intro + 3 prompts) and the
 * sliding carousel it opens into (Projects / Experience / Expertise).
 * Independent of the VS Code window system in os.js/ide.js, but reuses
 * PROJECTS from data.js and window.streamText from stream.js.
 */
(function () {
  "use strict";

  const alertEl = document.getElementById("dijaAlert");
  const alertClose = document.getElementById("dijaAlertClose");
  const alertMin = document.getElementById("dijaAlertMin");
  const backdrop = document.getElementById("dijaBackdrop");
  const mini = document.getElementById("dijaMini");
  const greetingText = document.getElementById("dijaGreetingText");
  const prompts = document.getElementById("dijaPrompts");

  const carousel = document.getElementById("dijaCarousel");
  const carouselTitle = document.getElementById("dijaCarouselTitle");
  const carouselBody = document.getElementById("dijaCarouselBody");
  const carouselBack = document.getElementById("dijaCarouselBack");

  const projectDrawer = document.getElementById("projectDrawer");
  const projectDrawerBackdrop = document.getElementById("projectDrawerBackdrop");
  const projectDrawerBody = document.getElementById("projectDrawerBody");
  const projectDrawerClose = document.getElementById("projectDrawerClose");

  if (!alertEl || typeof PROJECTS === "undefined") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  /* ---------------- Greeting typing animation ---------------- */
  const GREETING = "Hi, I am DIJA — Saif's assistant. How can I help you?";
  function startGreeting() {
    if (!greetingText) return;
    if (window.streamText) window.streamText(greetingText, GREETING, { minChunk: 1, maxChunk: 2 });
    else greetingText.textContent = GREETING;
  }
  // Waits out the boot overlay + reveal delay already used elsewhere on the
  // desktop, so the alert appears the same moment the icons do.
  setTimeout(startGreeting, prefersReducedMotion ? 300 : 2050);

  /* ---------------- Open / minimize / close ---------------- */
  function showAlert() {
    alertEl.hidden = false;
    backdrop.hidden = false;
    mini.hidden = true;
  }

  function minimizeAlert() {
    alertEl.hidden = true;
    backdrop.hidden = true;
    mini.hidden = false;
  }

  function dismissAlert() {
    alertEl.hidden = true;
    backdrop.hidden = true;
    mini.hidden = true;
  }

  if (alertMin) alertMin.addEventListener("click", minimizeAlert);
  if (alertClose) alertClose.addEventListener("click", dismissAlert);
  if (backdrop) backdrop.addEventListener("click", minimizeAlert);
  if (mini) mini.addEventListener("click", showAlert);

  /* ---------------- Experience + expertise data ---------------- */
  const EXPERIENCE = [
    { initials: "CF", color: "#2f6f4f", company: "Cedar Financial", role: "Senior Software Engineer", period: "Mar 2026 – Present", desc: "Designing and developing financial technology systems with .NET, Angular, secure APIs, and SQL/NoSQL workflows — enterprise modules, system design, AI-powered application patterns, and MCP server concepts." },
    { initials: "SF", color: "#2b5f8a", company: "Solvefy", role: "Software Engineer", period: "May 2025 – Apr 2026", desc: "Led NokNok, a .NET microservices platform built with ASP.NET Zero and Boilerplate frameworks. Also delivered a PMS management system, a Twilio call center, and an AI interview assistant." },
    { initials: "ET", color: "#8a4f2b", company: "EraTech", role: "Software Engineer", period: "Oct 2022 – May 2025", desc: "Built and optimized a large-scale, subscription-based multi-tenant POS system (BLOCKPOS, ECOM, QSR, DailyBook) — real-time inventory, transaction processing, and multi-database subscription architecture." },
    { initials: "SZ", color: "#5a3a8a", company: "Sizdom Technologies", role: "Frontend Developer", period: "Sep 2021 – Oct 2022", desc: "Hands-on Angular and React work — building and optimizing user interfaces, improving performance and responsiveness, and collaborating with backend teams on API integration." },
  ];

  const EXPERTISE = [
    { label: ".NET / ASP.NET Core", img: "assets/images/tech/dotnet.png" },
    { label: "Angular", img: "assets/images/tech/angular.png" },
    { label: "React", img: "assets/images/tech/react.webp" },
    { label: "TypeScript", img: "assets/images/tech/typescript.png" },
    { label: "JavaScript", img: "assets/images/tech/javascript.png" },
    { label: "HTML5", icon: "🧡" },
    { label: "CSS3", icon: "🎨" },
    { label: "Bootstrap", icon: "🅱️" },
    { label: "SQL Server", img: "assets/images/tech/sql.png" },
    { label: "MongoDB", img: "assets/images/tech/mongo.webp" },
    { label: "ASP.NET Zero", img: "assets/images/tech/aspnetzero.png" },
    { label: "Docker", icon: "🐳" },
    { label: "Redis", icon: "⚡" },
    { label: "Model Context Protocol", icon: "🔌" },
    { label: "Agentic AI / LLM", icon: "🤖" },
    { label: "Microservices", icon: "🧱" },
    { label: "Monolithic Architecture", icon: "🏛️" },
    { label: "System Architecture", icon: "🏗️" },
    { label: "REST APIs", icon: "🔗" },
    { label: "CI/CD", icon: "🚀" },
  ];

  /* ---------------- Panel builders ---------------- */
  function projectRowMarkup(p) {
    const thumb = p.image
      ? `<img src="${p.image}" alt="${esc(p.name)} screenshot" loading="lazy" />`
      : `<div class="dija-project-thumb-fallback">${p.icon || "📦"}</div>`;

    return `<div class="dija-project-row" data-id="${p.id}">
      <div class="dija-project-thumb">${thumb}</div>
      <div class="dija-project-info">
        <div class="dija-project-info-head">
          <div>
            <div class="dija-project-name">${esc(p.name)}</div>
            <div class="dija-project-tagline">${esc(p.tagline || "")}</div>
          </div>
          <svg class="dija-project-chevron" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="dija-project-tags">${(p.tech || []).map((t) => `<span class="dija-project-tag">${esc(t)}</span>`).join("")}</div>
      </div>
    </div>`;
  }

  function buildProjectsPanel() {
    const panel = document.createElement("div");
    panel.className = "dija-panel";
    panel.innerHTML = PROJECTS.map(projectRowMarkup).join("");
    panel.addEventListener("click", (e) => {
      const row = e.target.closest(".dija-project-row");
      if (!row) return;
      openProjectDrawer(row.dataset.id);
    });
    return panel;
  }

  /* ---------------- Project detail drawer ---------------- */
  function projectDrawerMarkup(p) {
    const thumb = p.image
      ? `<div class="project-drawer-thumb-card">
          <div class="project-drawer-thumb-dots">
            <span class="win-dot win-dot-red"></span>
            <span class="win-dot win-dot-yellow"></span>
            <span class="win-dot win-dot-green"></span>
          </div>
          <div class="project-drawer-thumb"><img src="${p.image}" alt="${esc(p.name)} screenshot" loading="lazy" /></div>
        </div>`
      : "";
    const links = [];
    if (p.demo) links.push(`<a href="${p.demo}" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>`);
    if (p.github) links.push(`<a href="${p.github}" target="_blank" rel="noopener noreferrer">Source ↗</a>`);
    if (p.npm) links.push(`<a href="${p.npm}" target="_blank" rel="noopener noreferrer">npm ↗</a>`);

    return `${thumb}
      <div class="project-drawer-scroll">
        <div class="project-drawer-name">${esc(p.name)}</div>
        <div class="project-drawer-tagline">${esc(p.tagline || "")}</div>
        <div class="dija-project-tags">${(p.tech || []).map((t) => `<span class="dija-project-tag">${esc(t)}</span>`).join("")}</div>
        <div class="dija-project-detail-inner">
          <h4>Overview</h4>
          <p>${esc(p.description || "")}</p>
          ${p.features && p.features.length ? `<h4>Key Features</h4><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
          ${links.length ? `<div class="dija-project-detail-links">${links.join("")}</div>` : ""}
        </div>
        <div class="project-drawer-nav">
          <button type="button" class="preview-btn is-primary" id="projectDrawerNext">Next Project →</button>
        </div>
      </div>`;
  }

  function openProjectDrawer(id) {
    if (!projectDrawer) return;
    const idx = PROJECTS.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const p = PROJECTS[idx];

    projectDrawerBody.innerHTML = projectDrawerMarkup(p);
    const nextBtn = document.getElementById("projectDrawerNext");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const next = PROJECTS[(idx + 1) % PROJECTS.length];
        openProjectDrawer(next.id);
      });
    }

    projectDrawer.hidden = false;
    projectDrawerBackdrop.hidden = false;
    void projectDrawer.offsetWidth;
    projectDrawer.classList.add("is-open");
    const scrollArea = projectDrawerBody.querySelector(".project-drawer-scroll");
    if (scrollArea) scrollArea.scrollTop = 0;
  }

  function closeProjectDrawer() {
    projectDrawer.classList.remove("is-open");
    projectDrawerBackdrop.hidden = true;
    setTimeout(() => {
      projectDrawer.hidden = true;
    }, prefersReducedMotion ? 0 : 320);
  }

  if (projectDrawerClose) projectDrawerClose.addEventListener("click", closeProjectDrawer);
  if (projectDrawerBackdrop) projectDrawerBackdrop.addEventListener("click", closeProjectDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && projectDrawer && projectDrawer.classList.contains("is-open")) closeProjectDrawer();
  });

  function buildExperiencePanel() {
    const panel = document.createElement("div");
    panel.className = "dija-panel";
    panel.innerHTML = EXPERIENCE.map(
      (e) => `<div class="dija-exp-row">
        <div class="dija-exp-logo" style="background:${e.color}">${e.initials}</div>
        <div>
          <div class="dija-exp-role">${esc(e.role)}</div>
          <div class="dija-exp-company">${esc(e.company)}</div>
          <div class="dija-exp-period">${esc(e.period)}</div>
          <p class="dija-exp-desc">${esc(e.desc)}</p>
        </div>
      </div>`
    ).join("");
    return panel;
  }

  function buildExpertisePanel() {
    const panel = document.createElement("div");
    panel.className = "dija-panel";
    const grid = document.createElement("div");
    grid.className = "dija-expertise-grid";
    grid.innerHTML = EXPERTISE.map(
      (x) => `<div class="dija-expertise-tile">
        <div class="dija-expertise-icon">${x.img ? `<img src="${x.img}" alt="" />` : x.icon}</div>
        <div class="dija-expertise-label">${esc(x.label)}</div>
      </div>`
    ).join("");
    panel.appendChild(grid);
    return panel;
  }

  const PANELS = {
    projects: { title: "Projects", build: buildProjectsPanel },
    experience: { title: "Experience", build: buildExperiencePanel },
    expertise: { title: "Expertise", build: buildExpertisePanel },
  };

  /* ---------------- Carousel open/close ---------------- */
  function openCarousel(topic) {
    const panel = PANELS[topic];
    if (!panel) return;
    carouselTitle.textContent = panel.title;
    carouselBody.innerHTML = "";
    carouselBody.appendChild(panel.build());

    carousel.hidden = false;
    void carousel.offsetWidth;
    carousel.classList.add("is-open");
    // Moving to "the next step" auto-minimizes DIJA to the corner launcher
    // rather than just hiding it — clicking the robot later reopens it.
    minimizeAlert();
  }

  function closeCarousel() {
    carousel.classList.remove("is-open");
    setTimeout(() => {
      carousel.hidden = true;
    }, prefersReducedMotion ? 0 : 340);
  }

  if (prompts) {
    prompts.addEventListener("click", (e) => {
      const btn = e.target.closest(".dija-prompt");
      if (!btn) return;
      const topic = btn.dataset.topic;
      if (topic === "explore") {
        minimizeAlert();
        if (typeof window.osOpenWindow === "function") window.osOpenWindow();
        if (typeof window.ideOpenFile === "function") window.ideOpenFile("about");
        return;
      }
      openCarousel(topic);
    });
  }

  if (carouselBack) carouselBack.addEventListener("click", closeCarousel);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && carousel.classList.contains("is-open")) closeCarousel();
  });
})();
