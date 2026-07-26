/**
 * sidebar.js
 * Claude-style collapsible sidebar for the locked #hero gateway: lists every
 * project (from PROJECTS in data.js), supports search, a Ctrl/Cmd+B shortcut
 * to collapse/expand, and opens a full-page "project view" (Claude's
 * project-detail layout) when a sidebar item is clicked.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "saif-portfolio-sidebar-collapsed";

  const shell = document.getElementById("claudeShell");
  const sidebar = document.getElementById("claudeSidebar");
  const collapseBtn = document.getElementById("sidebarCollapseBtn");
  const expandBtn = document.getElementById("sidebarExpandBtn");
  const searchBtn = document.getElementById("sidebarSearchBtn");
  const newBtn = document.getElementById("sidebarNewBtn");
  const accordion = document.getElementById("sidebarAccordion");
  const searchInput = document.getElementById("sidebarSearchInput");
  const listEl = document.getElementById("sidebarProjectList");

  const chatGateInner = document.getElementById("chatGateInner");
  const projectView = document.getElementById("projectView");
  const explorerInput = document.getElementById("explorerInput");
  const explorerChips = document.getElementById("explorerChips");
  const explorerResponseWrap = document.getElementById("explorerResponseWrap");

  if (!shell || !sidebar || !accordion || typeof PROJECTS === "undefined") return;

  const isMobile = () => window.innerWidth <= 860;

  /* ---------------- Collapse / expand ---------------- */
  function setCollapsed(collapsed, opts) {
    opts = opts || {};
    shell.classList.toggle("is-collapsed", collapsed);
    collapseBtn.setAttribute("aria-expanded", String(!collapsed));
    expandBtn.hidden = !collapsed;
    if (!opts.skipPersist && !isMobile()) {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    }
  }

  function initialCollapsedState() {
    if (isMobile()) return true;
    return localStorage.getItem(STORAGE_KEY) === "1";
  }

  setCollapsed(initialCollapsedState(), { skipPersist: true });

  collapseBtn.addEventListener("click", () => setCollapsed(true));
  expandBtn.addEventListener("click", () => setCollapsed(false));

  document.addEventListener("keydown", (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && (e.key === "b" || e.key === "B")) {
      e.preventDefault();
      setCollapsed(!shell.classList.contains("is-collapsed"));
    }
    if (e.key === "Escape" && isMobile() && !shell.classList.contains("is-collapsed")) {
      setCollapsed(true);
    }
  });

  // Tapping the dimmed backdrop (mobile drawer mode) closes the sidebar.
  shell.addEventListener("click", (e) => {
    if (isMobile() && e.target === shell) setCollapsed(true);
  });

  let wasMobile = isMobile();
  window.addEventListener("resize", () => {
    const nowMobile = isMobile();
    if (nowMobile === wasMobile) return;
    wasMobile = nowMobile;
    setCollapsed(initialCollapsedState(), { skipPersist: true });
  });

  /* ---------------- Accordion groups (Projects / Open Source / Experience / Resume & Contact) ---------------- */
  function setGroupOpen(header, open) {
    const content = document.getElementById(header.getAttribute("aria-controls"));
    header.setAttribute("aria-expanded", String(open));
    header.classList.toggle("is-open", open);
    if (content) content.hidden = !open;
  }

  accordion.querySelectorAll(".sidebar-group-header").forEach((header) => {
    header.addEventListener("click", () => {
      setGroupOpen(header, header.getAttribute("aria-expanded") !== "true");
    });
  });

  function openGroup(name) {
    const header = accordion.querySelector(`.sidebar-group[data-group="${name}"] .sidebar-group-header`);
    if (header) setGroupOpen(header, true);
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      openGroup("projects");
      searchInput.focus({ preventScroll: true });
    });
  }

  /* ---------------- Project list ---------------- */
  const categoryIcon = { framework: "📦", enterprise: "🏢", web: "🌐", software: "🗂️" };

  function itemMarkup(project) {
    const icon = project.icon || categoryIcon[project.category] || "🗂️";
    return `<li>
      <button type="button" class="sidebar-project-item" data-id="${project.id}">
        <span class="sidebar-project-item-icon" aria-hidden="true">${icon}</span>
        <span class="sidebar-project-item-label">${project.name}</span>
      </button>
    </li>`;
  }

  function renderList(filter) {
    const q = (filter || "").trim().toLowerCase();
    const items = PROJECTS.filter((p) => !q || p.name.toLowerCase().includes(q) || (p.tagline || "").toLowerCase().includes(q));
    listEl.innerHTML = items.length
      ? items.map(itemMarkup).join("")
      : `<li class="sidebar-empty">No projects match "${filter}"</li>`;
  }

  renderList("");

  let searchDebounce = null;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => renderList(searchInput.value), 120);
  });

  function setActiveItem(id) {
    accordion.querySelectorAll(".sidebar-project-item").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.id === id);
    });
  }

  /* ---------------- Full-page project view ---------------- */
  function linksMarkup(project) {
    const links = [];
    if (project.npm) links.push(`<a href="${project.npm}" target="_blank" rel="noopener noreferrer">npm ↗</a>`);
    if (project.github) links.push(`<a href="${project.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`);
    if (project.demo) links.push(`<a href="${project.demo}" target="_blank" rel="noopener noreferrer">Live demo ↗</a>`);
    if (!links.length) links.push(`<span class="placeholder-inline">Private project</span>`);
    return links.join("");
  }

  function thumbMarkup(project) {
    if (project.image) return `<img src="${project.image}" alt="${project.name} screenshot" loading="lazy" />`;
    return `<span aria-hidden="true">${project.icon || categoryIcon[project.category] || "🗂️"}</span>`;
  }

  function featuresMarkup(project) {
    if (!project.features || !project.features.length) return "";
    return `<div class="project-view-section"><h3>Key Features</h3><ul>${project.features
      .map((f) => `<li>${f}</li>`)
      .join("")}</ul></div>`;
  }

  function openProject(id) {
    const project = PROJECTS.find((p) => p.id === id);
    if (!project) return;

    setActiveItem(id);
    if (isMobile()) setCollapsed(true);

    const markup = `
      <div class="project-view-inner">
        <button type="button" class="project-view-back" id="projectViewBack">← Back to chat</button>
        <div class="project-view-hero">
          <div class="project-view-thumb">${thumbMarkup(project)}</div>
          <div class="project-view-headline">
            <span class="project-view-category">${project.categoryLabel || project.category || ""}</span>
            <h2>${project.name}</h2>
            <p class="project-view-tagline">${project.tagline || ""}</p>
            <div class="project-view-badges">${(project.tech || []).map((t) => `<span class="badge badge-sm">${t}</span>`).join("")}</div>
            <div class="project-view-links">${linksMarkup(project)}</div>
          </div>
        </div>
        <p class="project-view-desc" id="projectViewDesc"></p>
        ${featuresMarkup(project)}
        <div class="project-view-section">
          <h3>Architecture Notes</h3>
          <p>${project.architecture || ""}</p>
        </div>
        <div class="project-view-section">
          <h3>Challenges</h3>
          <p>${project.challenges || ""}</p>
        </div>
      </div>`;

    projectView.innerHTML = markup;
    projectView.hidden = false;
    projectView.scrollTop = 0;
    chatGateInner.style.display = "none";

    const backBtn = document.getElementById("projectViewBack");
    if (backBtn) backBtn.addEventListener("click", closeProject);

    const descEl = document.getElementById("projectViewDesc");
    if (descEl && window.streamText) window.streamText(descEl, project.description || "", { minChunk: 1, maxChunk: 4 });
    else if (descEl) descEl.textContent = project.description || "";
  }

  function closeProject() {
    projectView.hidden = true;
    projectView.innerHTML = "";
    chatGateInner.style.display = "";
    setActiveItem(null);
  }

  // Delegated at the accordion level: catches items in the dynamic Projects
  // list AND the static Open Source (ANGUNET) entry.
  accordion.addEventListener("click", (e) => {
    const btn = e.target.closest(".sidebar-project-item");
    if (!btn) return;
    openProject(btn.dataset.id);
  });

  /* ---------------- New conversation ---------------- */
  newBtn.addEventListener("click", () => {
    closeProject();
    if (explorerInput) explorerInput.value = "";
    if (explorerResponseWrap) explorerResponseWrap.classList.remove("is-open");
    if (typeof window.resetExplorerConversation === "function") window.resetExplorerConversation();
    if (isMobile()) setCollapsed(true);
    if (explorerInput) explorerInput.focus({ preventScroll: true });
  });
})();
