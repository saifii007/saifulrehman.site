/**
 * ide.js
 * Renders the VS Code editor's content: file tree (from PROJECTS in
 * data.js), tab bar, and each file's code pane plus an on-demand browser preview. Exposes
 * window.ideOpenFile(id) for os.js (desktop icons / taskbar) to call.
 */
(function () {
  "use strict";

  const tree = document.getElementById("ideTree");
  const projectsTree = document.getElementById("ideProjectsTree");
  const tabbar = document.getElementById("ideTabbar");
  const panes = document.getElementById("idePanes");
  const statusCursor = document.getElementById("statusCursor");
  const breadcrumbs = document.getElementById("ideBreadcrumbs");
  const browserPreview = document.getElementById("browserPreviewWindow");
  const browserPreviewBackdrop = document.getElementById("browserPreviewBackdrop");
  const browserPreviewPage = document.getElementById("browserPreviewPage");
  const browserPreviewAddress = document.getElementById("browserPreviewAddress");
  const browserPreviewTabTitle = document.getElementById("browserPreviewTabTitle");
  const browserPreviewClose = document.getElementById("browserPreviewClose");

  if (!tree || typeof PROJECTS === "undefined") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const openTabs = []; // ordered array of file ids
  let activeId = null;

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  // Flat glyph standing in for a screenshot — derived from the project's
  // real tech stack / category so each preview still reads as distinct
  // without relying on the (heavily branded, off-theme) marketing mockups.
  const TECH_ICONS = {
    "Angular": "🅰️", "React": "⚛️", ".NET": "🟣", "ASP.NET Core": "🟣",
    "ASP.NET Zero": "🟣", "ASP.NET Web API": "🟣", "TypeScript": "🔷",
    "JavaScript": "🟨", "SQL Server": "🗄️", "MongoDB": "🍃", "Docker": "🐳",
    "Microservices": "🧩", "Clean Architecture": "🏛️", "Bootstrap": "🎨",
    "Multi-Tenant SaaS": "🏬", "MCP": "🔌", "npm CLI": "📦",
  };
  const CATEGORY_ICONS = { framework: "🧩", enterprise: "🏢", web: "🌐", software: "💻" };
  function iconFor(p) {
    const fromTech = (p.tech || []).map((t) => TECH_ICONS[t]).find(Boolean);
    return fromTech || CATEGORY_ICONS[p.category] || p.icon || "📦";
  }

  // Browser-tab chrome shown at the top of every "Live Preview" panel, so
  // the preview reads as a persistent embedded tab rather than a floating
  // card.
  function browserChrome(tabLabel, urlPath) {
    return `<div class="preview-browser-tabs">
      <div class="preview-browser-tab"><span class="preview-browser-tab-dot"></span>${esc(tabLabel)}</div>
    </div>
    <div class="preview-browser-bar">
      <span class="preview-browser-nav">‹</span>
      <span class="preview-browser-nav">›</span>
      <span class="preview-browser-nav">⟳</span>
      <div class="preview-browser-url">
        <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true"><rect x="5" y="10" width="14" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
        <span>saifulrehman.site${esc(urlPath)}</span>
      </div>
    </div>`;
  }

  // Small VS-Code-style "file with a colored stripe" icon — same base shape,
  // just a different accent color per file type, so every icon in the
  // sidebar/tabbar reads as a coherent set instead of mixed emoji.
  function fileIconSvg(color) {
    return `<svg class="file-ico" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 1.5h6l4 4v9a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 .5-.5Z" fill="none" stroke="#8a8a8a" stroke-width="1"/><path d="M9 1.5V5h4" fill="none" stroke="#8a8a8a" stroke-width="1"/><rect x="4.5" y="8.6" width="7" height="1.7" rx="0.4" fill="${color}"/></svg>`;
  }
  const PDF_ICON = `<svg class="file-ico" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 1.5h6l4 4v9a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 .5-.5Z" fill="none" stroke="#8a8a8a" stroke-width="1"/><path d="M9 1.5V5h4" fill="none" stroke="#8a8a8a" stroke-width="1"/><rect x="4.5" y="8.6" width="7" height="1.7" rx="0.4" fill="#f44336"/></svg>`;

  /* ---------------- Static content definitions ---------------- */
  const FILES = {
    about: { label: "About-Me.md", icon: fileIconSvg("#519aba") },
    skills: { label: "Skills.json", icon: fileIconSvg("#cbcb41") },
    experience: { label: "Experience.json", icon: fileIconSvg("#cbcb41") },
    contact: { label: "Contact.env", icon: fileIconSvg("#8bc34a") },
    resume: { label: "Resume.pdf", icon: PDF_ICON },
  };

  PROJECTS.forEach((p) => {
    FILES[p.id] = { label: `${p.name.replace(/\s+/g, "")}.tsx`, icon: fileIconSvg("#4fc1ff") };
  });

  const SKILL_GROUPS = [
    {
      category: "Frameworks & Languages",
      items: [
        { name: "Angular", level: "Expert", pct: 95 },
        { name: "React", level: "Advanced", pct: 85 },
        { name: "TypeScript", level: "Advanced", pct: 85 },
        { name: "JavaScript", level: "Advanced", pct: 85 },
      ],
    },
    {
      category: "Backend & Architecture",
      items: [
        { name: ".NET / ASP.NET Core", level: "Expert", pct: 95 },
        { name: "System Architecture", level: "Expert", pct: 95 },
        { name: "Microservices / CQRS", level: "Advanced", pct: 85 },
        { name: "Monolithic Architecture", level: "Advanced", pct: 85 },
      ],
    },
    {
      category: "Data & Infrastructure",
      items: [
        { name: "SQL Server / MongoDB", level: "Advanced", pct: 85 },
        { name: "Docker", level: "Advanced", pct: 85 },
        { name: "Redis", level: "Advanced", pct: 80 },
      ],
    },
    {
      category: "AI & Tooling",
      items: [
        { name: "Model Context Protocol", level: "Expert", pct: 95 },
        { name: "Agentic AI / LLM Integration", level: "Advanced", pct: 85 },
      ],
    },
  ];

  const EXPERIENCE = [
    { hash: "a1e93f0", company: "Cedar Financial", role: "Senior Software Engineer", period: "Mar 2026 – Present", note: "Financial systems, MCP server concepts, AI-powered application patterns." },
    { hash: "7c2d1aa", company: "Solvefy", role: "Software Engineer", period: "May 2025 – Apr 2026", note: "Led NokNok microservices platform, PMS, AI interview assistant." },
    { hash: "f48b6de", company: "Direct Client (Freelance)", role: "Developer", period: "Jan 2025 – Aug 2025", note: "Clinic Management System, Stock Management System." },
    { hash: "0d5aa21", company: "EraTech", role: "Software Engineer", period: "Oct 2022 – May 2025", note: "BLOCKPOS, ECOM, QSR, DailyBook — multi-tenant SaaS POS suite." },
    { hash: "62ffb13", company: "Sizdom Technologies", role: "Frontend Developer", period: "Sep 2021 – Oct 2022", note: "Angular + React interfaces, UI/UX collaboration." },
  ];

  /* ---------------- File tree (Projects folder, built from PROJECTS) ---------------- */
  if (projectsTree) {
    projectsTree.innerHTML = PROJECTS.map(
      (p) => `<li><button type="button" class="tree-file" data-file="${p.id}">${FILES[p.id].icon} ${esc(FILES[p.id].label)}</button></li>`
    ).join("");
  }

  tree.addEventListener("click", (e) => {
    const fileBtn = e.target.closest(".tree-file");
    if (fileBtn) {
      openFile(fileBtn.dataset.file);
      return;
    }
    const folderBtn = e.target.closest(".tree-folder");
    if (folderBtn) {
      folderBtn.classList.toggle("is-collapsed");
      folderBtn.setAttribute("aria-expanded", String(!folderBtn.classList.contains("is-collapsed")));
    }
  });

  /* ---------------- Tab bar ---------------- */
  function renderTabs() {
    tabbar.innerHTML = openTabs
      .map((id) => {
        const f = FILES[id];
        if (!f) return "";
        return `<div class="ide-tab${id === activeId ? " is-active" : ""}" data-file="${id}" role="tab" aria-selected="${id === activeId}">
          <span>${f.icon}</span><span>${esc(f.label)}</span>
          <span class="ide-tab-close" data-close="${id}" aria-label="Close ${esc(f.label)}">×</span>
        </div>`;
      })
      .join("");

    tree.querySelectorAll(".tree-file").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.file === activeId);
    });
  }

  tabbar.addEventListener("click", (e) => {
    const closeBtn = e.target.closest(".ide-tab-close");
    if (closeBtn) {
      closeFile(closeBtn.dataset.close);
      return;
    }
    const tab = e.target.closest(".ide-tab");
    if (tab) openFile(tab.dataset.file);
  });

  function closeFile(id) {
    const idx = openTabs.indexOf(id);
    if (idx === -1) return;
    openTabs.splice(idx, 1);
    const paneEl = document.getElementById(`pane-${id}`);
    if (paneEl) paneEl.remove();

    if (activeId === id) {
      activeId = openTabs[idx] || openTabs[idx - 1] || null;
      if (activeId) showPane(activeId);
    }
    renderTabs();
  }

  function updateBreadcrumbs(id) {
    if (!breadcrumbs || !FILES[id]) return;
    const isProject = !!PROJECTS.find((p) => p.id === id);
    const crumbs = ["Portfolio-Core"];
    if (isProject) crumbs.push("Projects");
    crumbs.push(FILES[id].label);
    breadcrumbs.innerHTML = crumbs
      .map((c, i) => (i === crumbs.length - 1 ? `<span class="crumb-current">${c}</span>` : `<span>${c}</span><span class="crumb-sep">›</span>`))
      .join("");
  }

  function showPane(id) {
    panes.querySelectorAll(".ide-pane").forEach((p) => (p.hidden = p.id !== `pane-${id}`));
    if (statusCursor) statusCursor.textContent = "Ln 1, Col 1";
    updateBreadcrumbs(id);
  }

  panes.addEventListener("click", (e) => {
    const nextBtn = e.target.closest("[data-next-project]");
    if (nextBtn) openFile(nextBtn.dataset.nextProject);
    const resumeBtn = e.target.closest("[data-open-resume-pdf]");
    if (resumeBtn && typeof window.openPdfViewer === "function") window.openPdfViewer(RESUME_PATH);
  });

  /* ---------------- Opening a file ---------------- */
  function bootTerminalMarkup() {
    return `<div class="ide-boot-terminal">
      <div class="ide-boot-line"><span class="terminal-prompt">guest@portfolio</span>:~$ <span class="ide-boot-cmd"></span><span class="ide-boot-cursor">▌</span></div>
      <div class="ide-boot-log" hidden></div>
    </div>`;
  }

  function runBootSequence(pane, id) {
    if (prefersReducedMotion) {
      pane.innerHTML = buildPaneMarkup(id);
      installPreviewControl(pane, id);
      wirePaneStreaming(pane, id);
      return;
    }
    pane.innerHTML = bootTerminalMarkup();
    const cmdEl = pane.querySelector(".ide-boot-cmd");
    const logEl = pane.querySelector(".ide-boot-log");
    window.streamText(cmdEl, "npm run dev", {
      minChunk: 1,
      maxChunk: 2,
      onDone: () => {
        setTimeout(() => {
          if (!logEl) return;
          logEl.hidden = false;
          logEl.textContent = "> portfolio@1.0.0 dev\n> vite\n\n  compiling…";
          setTimeout(() => {
            pane.innerHTML = buildPaneMarkup(id);
            installPreviewControl(pane, id);
            wirePaneStreaming(pane, id);
          }, 900 + Math.random() * 500);
        }, 300);
      },
    });
  }

  function flashReload(pane) {
    if (prefersReducedMotion) return;
    const overlay = document.createElement("div");
    overlay.className = "ide-reload-overlay";
    overlay.innerHTML = '<span class="ide-reload-spinner"></span>';
    pane.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("is-visible"));
    setTimeout(() => overlay.remove(), 380);
  }

  function openFile(id) {
    if (!FILES[id]) return;
    activeId = id;
    if (!openTabs.includes(id)) openTabs.push(id);
    renderTabs();

    let pane = document.getElementById(`pane-${id}`);
    if (!pane) {
      pane = document.createElement("div");
      pane.className = "ide-pane";
      pane.id = `pane-${id}`;
      panes.appendChild(pane);
      showPane(id);
      runBootSequence(pane, id);
      return;
    }
    showPane(id);
    flashReload(pane);
  }
  window.ideOpenFile = openFile;

  /* ---------------- Markup builders ---------------- */
  function buildPaneMarkup(id) {
    if (id === "about") return aboutMarkup();
    if (id === "skills") return skillsMarkup();
    if (id === "experience") return experienceMarkup();
    if (id === "contact") return contactMarkup();
    if (id === "resume") return resumeMarkup();
    const project = PROJECTS.find((p) => p.id === id);
    if (project) return projectMarkup(project);
    return "";
  }

  const RESUME_PATH = "Saif_Ul_Rehman_Resume_eng_2026.pdf";

  const RESUME_ENUMS = [
    {
      name: "TECHNOLOGIES",
      items: [".NET", "ASP.NET Core", "Angular", "React", "TypeScript", "SQL Server", "MongoDB", "Docker", "Redis", "MCP"],
    },
    { name: "LANGUAGES", items: ["C#", "JavaScript", "TypeScript", "HTML5", "CSS"] },
    { name: "TOOLS", items: ["VS Code", "Git / CI-CD", "Postman", "Docker", "SSMS"] },
    {
      name: "LINKS",
      items: ["github.com/saifii007", "linkedin.com/in/saif-ul-rehman777", "npmjs.com/package/angunet"],
      comment: true,
    },
    { name: "CERTIFICATIONS", items: ["Introduction to Data Analytics — SkillUp by Simplilearn (May 2026)"], comment: true },
    { name: "PROFILE", items: ["RELIABLE", "DETAIL_ORIENTED", "COLLABORATIVE", "PRAGMATIC", "ARCHITECTURE_MINDED"] },
  ];

  function resumeEnumMarkup(e) {
    const lines = e.items
      .map((item) =>
        e.comment
          ? `  <span class="tok-comment">// ${esc(item)}</span>`
          : `  ${esc(item.replace(/[^a-zA-Z0-9+#.]/g, "").toUpperCase() ? esc(item) : esc(item))},`
      )
      .join("\n");
    return `<span class="tok-keyword">public</span> <span class="tok-keyword">enum</span> <span class="tok-type">${e.name}</span>
{
${lines}
}`;
  }

  function experienceMethodMarkup(e, methodName) {
    return `    <span class="tok-keyword">public</span> <span class="tok-keyword">void</span> <span class="tok-func">${methodName}</span>()
    {
        <span class="tok-keyword">var</span> _Period = <span class="tok-string">"${esc(e.period)}"</span>;
        <span class="tok-keyword">var</span> _Role = <span class="tok-string">"${esc(e.role)}"</span>;

        <span class="tok-comment">/* ${esc(e.note)} */</span>
    }`;
  }

  function resumeMarkup() {
    const enumsCode = RESUME_ENUMS.map(resumeEnumMarkup).join("\n\n");
    const expMethods = EXPERIENCE.map((e) => experienceMethodMarkup(e, e.company.replace(/[^a-zA-Z0-9]/g, ""))).join("\n\n");

    return `<div class="resume-pane">
      <div class="resume-left">
        <div class="resume-photo"><img src="assets/images/avatar-profile-card.png" alt="Saif Ul Rehman" /></div>
        <pre class="code-block resume-enums">${enumsCode}</pre>
        <button type="button" class="preview-btn" data-open-resume-pdf>📄 Open official PDF</button>
      </div>
      <div class="resume-right">
        <pre class="code-block">
<span class="tok-comment">/// &lt;summary&gt;
/// Senior Software Engineer seeking impact-driven roles in .NET, Angular,
/// and AI-powered application architecture. Founder of ANGUNET. Open to
/// on-site, hybrid, or remote — available now.
/// &lt;/summary&gt;</span>
<span class="tok-keyword">public class</span> <span class="tok-type">INFORMATION</span>
{
    <span class="tok-keyword">public string</span> NAME = <span class="tok-string">"Saif Ul Rehman"</span>;
    <span class="tok-keyword">public string</span> TITLE = <span class="tok-string">"Senior Software Engineer &amp; Founder of ANGUNET"</span>;
    <span class="tok-keyword">public string</span> EMAIL = <span class="tok-string">"saifighourii000@gmail.com"</span>;
    <span class="tok-keyword">public string</span> PHONE = <span class="tok-string">"+92 324 970 5067"</span>;
    <span class="tok-keyword">public string</span>[] LOCATION = { <span class="tok-string">"Lahore"</span>, <span class="tok-string">"Punjab"</span>, <span class="tok-string">"Pakistan"</span> };
    <span class="tok-keyword">public string</span> CURRENTLY = <span class="tok-string">"Cedar Financial"</span>;
    <span class="tok-keyword">public int</span> EXPERIENCE_YEARS = <span class="tok-number">6</span>;
    <span class="tok-keyword">public bool</span> OPEN_TO_WORK = <span class="tok-keyword">true</span>;
}

<span class="tok-keyword">public partial class</span> <span class="tok-type">EDUCATION</span> : <span class="tok-type">HigherEducation</span>
{
    <span class="tok-keyword">private void</span> <span class="tok-func">UniversityOfThePunjab</span>()
    {
        <span class="tok-keyword">var</span> _Degree = <span class="tok-string">"Bachelor's Degree"</span>;
        <span class="tok-keyword">var</span> _Field = <span class="tok-string">"Information Technology"</span>;
    }
}

<span class="tok-keyword">public static class</span> <span class="tok-type">EXPERIENCES</span>
{
${expMethods}
}
        </pre>
      </div>
    </div>`;
  }

  function aboutMarkup() {
    return `<div class="ide-pane-split">
      <div class="code-block">
<span class="ln">1</span><span class="tok-punct">{</span>
<span class="ln">2</span>  <span class="tok-key">"developer"</span><span class="tok-punct">: {</span>
<span class="ln">3</span>    <span class="tok-key">"name"</span><span class="tok-punct">:</span> <span class="tok-string">"Saif Ul Rehman"</span><span class="tok-punct">,</span>
<span class="ln">4</span>    <span class="tok-key">"role"</span><span class="tok-punct">:</span> <span class="tok-string">"Senior Software Engineer &amp; Founder of ANGUNET"</span><span class="tok-punct">,</span>
<span class="ln">5</span>    <span class="tok-key">"location"</span><span class="tok-punct">:</span> <span class="tok-string">"Lahore, Punjab, Pakistan"</span><span class="tok-punct">,</span>
<span class="ln">6</span>    <span class="tok-key">"currently"</span><span class="tok-punct">:</span> <span class="tok-string">"Cedar Financial"</span><span class="tok-punct">,</span>
<span class="ln">7</span>    <span class="tok-key">"specialization"</span><span class="tok-punct">: [</span>
<span class="ln">8</span>      <span class="tok-string">".NET / ASP.NET Core"</span><span class="tok-punct">,</span>
<span class="ln">9</span>      <span class="tok-string">"Angular"</span><span class="tok-punct">,</span>
<span class="ln">10</span>      <span class="tok-string">"React"</span><span class="tok-punct">,</span>
<span class="ln">11</span>      <span class="tok-string">"Model Context Protocol"</span><span class="tok-punct">,</span>
<span class="ln">12</span>      <span class="tok-string">"Agentic AI"</span>
<span class="ln">13</span>    <span class="tok-punct">],</span>
<span class="ln">14</span>    <span class="tok-key">"experience"</span><span class="tok-punct">:</span> <span class="tok-string">"6+ years"</span>
<span class="ln">15</span>  <span class="tok-punct">},</span>
<span class="ln">16</span>  <span class="tok-key">"mission"</span><span class="tok-punct">:</span> <span class="tok-string">"Building scalable architecture with clean code &amp; AI-powered tooling."</span><span class="tok-punct">,</span>
<span class="ln">17</span>  <span class="tok-key">"bio"</span><span class="tok-punct">:</span> <span class="tok-string" id="aboutBioText"></span><span class="tok-punct">,</span>
<span class="ln">18</span>  <span class="tok-key">"status"</span><span class="tok-punct">:</span> <span class="tok-string">"Open to work — On-site · Hybrid · Remote"</span>
<span class="ln">19</span><span class="tok-punct">}</span>
      </div>
      <aside class="preview-card">
        ${browserChrome("about.md", "/about")}
        <div class="preview-card-body profile-page"><section class="profile-hero"><div class="profile-identity"><div class="preview-avatar profile-avatar"><img src="assets/images/avatar-profile-card.png" alt="Portrait of Saif Ul Rehman" /></div><div><div class="profile-eyebrow">SOFTWARE ENGINEERING · PRODUCT DELIVERY</div><div class="preview-name profile-name">Saif Ul Rehman</div><div class="preview-role">Senior Software Engineer &amp; Founder of ANGUNET</div><div class="profile-location">Lahore, Pakistan · Available for selected opportunities</div></div></div><span class="preview-status profile-status">● Open to selected opportunities</span><p class="preview-quote profile-summary">I design and deliver dependable software for real business needs. My work spans scalable .NET systems, modern web applications, thoughtful architecture, and practical AI developer tooling.</p></section><section class="profile-stats" aria-label="Professional summary"><div class="profile-stat"><strong>6+ years</strong><span>Software development</span></div><div class="profile-stat"><strong>Cedar Financial</strong><span>Current focus</span></div><div class="profile-stat"><strong>ANGUNET</strong><span>Creator and founder</span></div></section><section class="profile-section"><div class="profile-section-heading"><span>01</span><h2>Professional profile</h2></div><p class="profile-body-copy">I work across the full product lifecycle, from structuring maintainable backend services to building clear frontend experiences and supporting reliable delivery. I value readable code, sound engineering decisions, and solutions that are practical to operate and extend.</p></section><section class="profile-feature-grid"><article class="profile-feature-card"><span class="profile-feature-icon">⌘</span><h3>Engineering focus</h3><p>.NET and ASP.NET Core, API design, Clean Architecture, microservices, and data-driven business applications.</p></article><article class="profile-feature-card"><span class="profile-feature-icon">✳</span><h3>Product delivery</h3><p>Angular and React interfaces, maintainable component structures, workflow design, and cross-stack integration.</p></article><article class="profile-feature-card"><span class="profile-feature-icon">◇</span><h3>Developer tooling</h3><p>ANGUNET, Docker-based workflows, project scaffolding, and Model Context Protocol integrations for AI-assisted development.</p></article></section><section class="profile-section"><div class="profile-section-heading"><span>02</span><h2>Core technologies</h2></div><div class="preview-tags profile-tags"><span class="preview-tag">C#</span><span class="preview-tag">ASP.NET Core</span><span class="preview-tag">Angular</span><span class="preview-tag">React</span><span class="preview-tag">SQL Server</span><span class="preview-tag">MongoDB</span><span class="preview-tag">Docker</span><span class="preview-tag">MCP</span></div></section><div class="about-actions profile-actions"><a class="about-action about-action-primary" href="Saif_Ul_Rehman_Resume_eng_2026.pdf" target="_blank" rel="noopener">View resume</a><a class="about-action" href="https://www.linkedin.com/in/saif-ul-rehman777" target="_blank" rel="noopener noreferrer">LinkedIn profile</a><a class="about-action" href="mailto:saifighourii000@gmail.com">Contact by email</a></div></div>
      </aside>
    </div>`;
  }

  function skillsMarkup() {
    const groups = SKILL_GROUPS.map(
      (g) => `<div class="skills-group">
        <h4 class="skills-group-title">${esc(g.category)}</h4>
        <div class="skills-grid">
          ${g.items
            .map(
              (s) => `<div class="skill-card">
                <div class="skill-card-head">
                  <span class="skill-card-name">${esc(s.name)}</span>
                  <span class="skill-card-level">${esc(s.level)} · ${s.pct}%</span>
                </div>
                <span class="skill-bar-track"><span class="skill-bar-fill" data-pct="${s.pct}"></span></span>
              </div>`
            )
            .join("")}
        </div>
      </div>`
    ).join("");

    return `<div class="skills-pane">
      <div class="skills-terminal-line"><span class="terminal-prompt">guest@portfolio</span>:~$ <span class="terminal-cmd">npm run list-skills</span></div>
      <div class="skills-terminal-log">&gt; portfolio@1.0.0 list-skills<br />&gt; node scripts/analyze-proficiencies.js<br />Done in 2.43s.</div>
      ${groups}
    </div>`;
  }

  function experienceMarkup() {
    const rows = EXPERIENCE.map(
      (e) => `<div class="commit-row">
        <span class="commit-dot" aria-hidden="true"></span>
        <div>
          <div><span class="commit-hash">${e.hash}</span> <span class="commit-msg">${esc(e.role)} @ ${esc(e.company)}</span></div>
          <div class="commit-meta">${esc(e.period)} — ${esc(e.note)}</div>
        </div>
      </div>`
    ).join("");

    const expRows = EXPERIENCE.map(
      (e) => `<div class="exp-preview-row">
        <div class="exp-preview-row-head">
          <span class="exp-preview-company">${esc(e.company)}</span>
          <span class="exp-preview-period">${esc(e.period)}</span>
        </div>
        <div class="exp-preview-role">${esc(e.role)}</div>
        <div class="exp-preview-note">${esc(e.note)}</div>
      </div>`
    ).join("");

    return `<div class="ide-pane-split">
      <div class="terminal-pane"><div style="margin-bottom:0.5rem;color:var(--vsc-text-muted);">$ git log --oneline --graph --all</div>${rows}</div>
      <aside class="preview-card">
        ${browserChrome("Experience.json", "/experience")}
        <div class="preview-card-body">
          <div class="preview-icon-tile"><span>📜</span></div>
          <div class="preview-name">Career Timeline</div>
          <div class="preview-role">6+ years across enterprise, freelance, and SaaS teams</div>
          <div class="exp-preview-list">${expRows}</div>
        </div>
      </aside>
    </div>`;
  }

  function contactMarkup() {
    return `<div class="ide-pane-split">
      <div class="code-block">
<span class="tok-comment"># Contact.env - reach out any time</span>
<span class="contact-line"><span class="tok-key">EMAIL</span><span class="tok-punct">=</span><a href="mailto:saifighourii000@gmail.com">saifighourii000@gmail.com</a></span>
<span class="contact-line"><span class="tok-key">PHONE</span><span class="tok-punct">=</span><a href="tel:+923249705067">+92 324 970 5067</a></span>
<span class="contact-line"><span class="tok-key">WHATSAPP</span><span class="tok-punct">=</span><a href="https://wa.me/923249705067" target="_blank" rel="noopener noreferrer">wa.me/923249705067</a></span>
<span class="contact-line"><span class="tok-key">LINKEDIN</span><span class="tok-punct">=</span><a href="https://www.linkedin.com/in/saif-ul-rehman777/" target="_blank" rel="noopener noreferrer">linkedin.com/in/saif-ul-rehman777</a></span>
<span class="contact-line"><span class="tok-key">GITHUB</span><span class="tok-punct">=</span><a href="https://github.com/saifii007" target="_blank" rel="noopener noreferrer">github.com/saifii007</a></span>
<span class="contact-line"><span class="tok-key">EMAIL_SERVICE</span><span class="tok-punct">=</span><span class="tok-string">"EmailJS"</span></span>
<span class="contact-line"><span class="tok-key">EMAIL_DELIVERY</span><span class="tok-punct">=</span><span class="tok-string">"Configure service and template IDs"</span></span>
      </div>
      <aside class="preview-card">
        ${browserChrome("CONTACT.FORM", "/contact")}
        <div class="preview-card-body contact-form-page">
          <div class="contact-form-intro"><div class="preview-avatar"><img src="assets/images/avatar-profile-card.png" alt="Saif Ul Rehman" /></div><div class="preview-name">Send me a message</div><div class="preview-role">Your message will be sent to Saif Ul Rehman by email.</div></div>
          <form class="portfolio-email-form" data-email-form>
            <div class="contact-form-row"><label>Your name<input name="from_name" type="text" autocomplete="name" maxlength="100" placeholder="Jane Smith" required /></label></div>
            <div class="contact-form-row"><label>Your email<input name="reply_to" type="email" autocomplete="email" maxlength="254" placeholder="jane@example.com" required /></label></div>
            <div class="contact-form-row"><label>Subject<input name="subject" type="text" maxlength="140" placeholder="Project inquiry" required /></label></div>
            <div class="contact-form-row"><label>Message<textarea name="message" rows="5" maxlength="4000" placeholder="Tell me a little about what you have in mind..." required></textarea></label></div>
            <div class="contact-form-honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" type="text" tabindex="-1" autocomplete="off" /></label></div>
            <button class="contact-send-button" type="submit"><span aria-hidden="true">↗</span> Send message</button>
            <p class="contact-form-status" data-email-status role="status" aria-live="polite">Email delivery is being configured. You can also contact me directly at <a href="mailto:saifighourii000@gmail.com">saifighourii000@gmail.com</a>.</p>
          </form>
          <div class="contact-form-direct"><span>Prefer email?</span><a href="mailto:saifighourii000@gmail.com">Open your email app ↗</a></div>
        </div>
      </aside>
    </div>`;
  }

  function projectMarkup(p) {
    const imports = (p.tech || []).slice(0, 4).map((t) => t.replace(/[^a-zA-Z0-9]/g, "")).filter(Boolean);
    const importLines = imports
      .map((t, i) => `<span class="ln">${i + 1}</span><span class="tok-keyword">import</span> <span class="tok-type">{ ${esc(t)} }</span> <span class="tok-keyword">from</span> <span class="tok-string">'@stack/${esc(t.toLowerCase())}'</span><span class="tok-punct">;</span>`)
      .join("\n");
    const baseLn = imports.length + 2;

    const links = [];
    if (p.demo) links.push(`<a class="preview-btn is-primary" href="${p.demo}" target="_blank" rel="noopener noreferrer">▶ Live Demo</a>`);
    if (p.github) links.push(`<a class="preview-btn" href="${p.github}" target="_blank" rel="noopener noreferrer">&lt;/&gt; Source</a>`);
    if (p.npm) links.push(`<a class="preview-btn" href="${p.npm}" target="_blank" rel="noopener noreferrer">📦 npm</a>`);
    if (!links.length) links.push(`<span class="preview-btn" style="opacity:0.6;">Private project</span>`);
    const nextProject = PROJECTS[(PROJECTS.findIndex((x) => x.id === p.id) + 1) % PROJECTS.length];
    links.push(`<button type="button" class="preview-btn is-primary preview-btn-next" data-next-project="${esc(nextProject.id)}">Next Project →</button>`);

    return `<div class="ide-pane-split">
      <div class="code-block">
${importLines}
<span class="ln">${baseLn}</span>
<span class="ln">${baseLn + 1}</span><span class="tok-comment">// ${esc(p.categoryLabel || "")}</span>
<span class="ln">${baseLn + 2}</span><span class="tok-keyword">export const</span> <span class="tok-func">${esc(p.name.replace(/\s+/g, ""))}</span><span class="tok-punct">: Project =</span> <span class="tok-punct">{</span>
<span class="ln">${baseLn + 3}</span>  <span class="tok-key">id</span><span class="tok-punct">:</span> <span class="tok-string">'${esc(p.id)}'</span><span class="tok-punct">,</span>
<span class="ln">${baseLn + 4}</span>  <span class="tok-key">title</span><span class="tok-punct">:</span> <span class="tok-string">'${esc(p.name)}'</span><span class="tok-punct">,</span>
<span class="ln">${baseLn + 5}</span>  <span class="tok-key">role</span><span class="tok-punct">:</span> <span class="tok-string">'${esc(p.tagline || "")}'</span><span class="tok-punct">,</span>
<span class="ln">${baseLn + 6}</span>  <span class="tok-key">status</span><span class="tok-punct">:</span> <span class="tok-string">'Portfolio case study'</span><span class="tok-punct">,</span>
<span class="ln">${baseLn + 7}</span>
<span class="ln">${baseLn + 8}</span>  <span class="tok-key">technologies</span><span class="tok-punct">: [</span>${(p.tech || []).map((t) => `<span class="tok-string">'${esc(t)}'</span>`).join(", ")}<span class="tok-punct">],</span>
<span class="ln">${baseLn + 9}</span>
<span class="ln">${baseLn + 10}</span>  <span class="tok-comment">/**
<span class="ln"></span>   * Architecture Notes
<span class="ln"></span>   */</span>
<span class="ln">${baseLn + 11}</span>  <span class="tok-key">architecture</span><span class="tok-punct">:</span> <span class="tok-string" id="archText-${esc(p.id)}"></span><span class="tok-punct">,</span>
<span class="ln">${baseLn + 12}</span>
<span class="ln">${baseLn + 13}</span>  <span class="tok-key">description</span><span class="tok-punct">:</span> <span class="tok-string" id="descText-${esc(p.id)}"></span>
<span class="ln">${baseLn + 14}</span><span class="tok-punct">};</span>
      </div>
      <aside class="preview-card">
        ${browserChrome(FILES[p.id] ? FILES[p.id].label : p.name, `/projects/${esc(p.id)}`)}
        <div class="preview-card-body">
          <div class="project-preview-hero">
            ${p.image ? `<img class="project-preview-image" src="${esc(p.image)}" alt="${esc(p.name)} project preview" loading="lazy" onerror="this.hidden=true; this.nextElementSibling.hidden=false;" /><div class="project-preview-fallback" hidden><span>${iconFor(p)}</span><span>Project preview</span></div>` : `<div class="project-preview-fallback"><span>${iconFor(p)}</span><span>Project overview</span></div>`}
            <div class="project-preview-hero-meta"><span>${esc(p.categoryLabel || "Software project")}</span><span class="project-preview-status"><i></i> Portfolio case study</span></div>
          </div>
          <section class="project-profile-heading"><div class="project-profile-kicker">${esc(p.categoryLabel || "Software project")} <span>·</span> PORTFOLIO CASE STUDY</div><div class="preview-name-row project-preview-title"><div class="preview-name">${esc(p.name)}</div>${p.contribution ? `<span class="preview-contribution">${esc(p.contribution)}</span>` : ""}</div><div class="preview-role">${esc(p.tagline || "")}</div><p class="project-preview-description">${esc(p.description || "This portfolio entry has a limited public project record. Contact me for further verified details.")}</p></section><section class="project-profile-section"><div class="project-profile-section-heading"><span>01</span><h3>Project overview</h3></div><p>${esc(p.description || "This portfolio entry has a limited public project record. Contact me for further verified details.")}</p></section><section class="project-profile-section"><div class="project-profile-section-heading"><span>02</span><h3>Technology stack</h3></div>${(p.tech || []).length ? `<div class="preview-tags">${p.tech.map((t) => `<span class="preview-tag">${esc(t)}</span>`).join("")}</div>` : '<p class="project-detail-note">The available project record does not specify the full technology stack.</p>'}</section><section class="project-profile-section"><div class="project-profile-section-heading"><span>03</span><h3>Scope and capabilities</h3></div>${p.features && p.features.length ? `<ul class="project-profile-feature-list">${p.features.filter((f) => !/^\[ADD/i.test(f)).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : '<p class="project-detail-note">Detailed feature documentation is not available in the current portfolio record. This page avoids presenting unverified functionality as fact.</p>'}</section><section class="project-profile-section"><div class="project-profile-section-heading"><span>04</span><h3>Engineering approach</h3></div>${p.architecture && !/^\[ADD/i.test(p.architecture) ? `<p>${esc(p.architecture)}</p>` : '<p class="project-detail-note">Specific architecture details are not documented in the current portfolio record.</p>'}</section><div class="project-profile-footer">${p.contribution ? `<div class="project-role-card"><span>MY ROLE</span><strong>${esc(p.contribution)}</strong></div>` : ""}<div class="preview-links">${links.join("")}</div></div>
        </div>
      </aside>
    </div>`;
  }

  /* ---------------- On-demand browser preview ---------------- */
  const taskbarPinned = document.getElementById("taskbarPinned");
  let browserTaskbarButton = document.getElementById("taskbarBrowserPreview");
  if (!browserTaskbarButton && taskbarPinned) {
    browserTaskbarButton = document.createElement("button");
    browserTaskbarButton.type = "button";
    browserTaskbarButton.id = "taskbarBrowserPreview";
    browserTaskbarButton.className = "taskbar-icon browser-taskbar-app";
    browserTaskbarButton.setAttribute("aria-label", "Chrome portfolio preview");
    browserTaskbarButton.title = "Chrome portfolio preview";
    browserTaskbarButton.innerHTML = '<span class="browser-taskbar-glyph" aria-hidden="true"></span>';
    const social = taskbarPinned.querySelector("[data-social]");
    taskbarPinned.insertBefore(browserTaskbarButton, social || null);
    browserTaskbarButton.addEventListener("click", () => {
      if (browserPreview && !browserPreview.hidden && browserPreview.classList.contains("is-open")) closeBrowserPreview();
      else {
        const id = activeId || "about";
        if (!document.getElementById("pane-" + id)) openFile(id);
        openBrowserPreview(id, document.getElementById("pane-" + id));
      }
    });
  }
  function closeBrowserPreview() {
    if (!browserPreview) return;
    browserPreview.classList.remove("is-open");
    if (browserPreviewBackdrop) browserPreviewBackdrop.hidden = true;
    if (browserTaskbarButton) browserTaskbarButton.classList.remove("is-running");
    setTimeout(() => { browserPreview.hidden = true; }, prefersReducedMotion ? 0 : 180);
  }
  function browserPagePath(id) {
    if (id === "about") return "/";
    if (id === "skills") return "/expertise";
    if (id === "experience") return "/experience";
    if (id === "contact") return "/contact";
    if (id === "resume") return "/Saif_Ul_Rehman_Resume_eng_2026.pdf";
    return PROJECTS.some((project) => project.id === id) ? "/projects/" + id : "/";
  }

  function browserContentFor(id) {
    if (id === "resume") {
      const frame = document.createElement("iframe");
      frame.className = "browser-resume-frame";
      frame.title = "Saif Ul Rehman resume PDF";
      frame.src = RESUME_PATH;
      frame.loading = "lazy";
      return frame;
    }
    const template = document.createElement("template");
    template.innerHTML = buildPaneMarkup(id);
    const source = template.content.querySelector(".preview-card-body")
      || template.content.querySelector(".skills-pane")
      || template.content.querySelector(".dija-project-detail-inner")
      || template.content.querySelector(".preview-card")
      || template.content.querySelector(".resume-pane");
    if (source) {
      const copy = source.cloneNode(true);
      copy.querySelectorAll("button.preview-btn-next, [data-next-project], [data-open-resume-pdf]").forEach((el) => el.remove());
      return copy;
    }
    const fallback = document.createElement("div");
    fallback.className = "browser-preview-fallback";
    fallback.innerHTML = "<div class='browser-preview-eyebrow'>SAIF UL REHMAN · PORTFOLIO</div><h1>Page unavailable</h1><p>This file does not have a browser view yet.</p>";
    return fallback;
  }

  function renderBrowserPreviewPage(id) {
    if (!browserPreviewPage) return;
    const file = FILES[id] || { label: "About-Me.md" };
    browserPreviewTabTitle.textContent = file.label || id;
    browserPreviewAddress.textContent = "saifulrehman.site" + browserPagePath(id);
    browserPreviewPage.replaceChildren();

    const shell = document.createElement("div");
    shell.className = "browser-site-shell";
    const sidebar = document.createElement("aside");
    sidebar.className = "browser-site-sidebar";
    sidebar.setAttribute("aria-label", "Portfolio website navigation");
    sidebar.innerHTML = '<a class="browser-site-brand" href="#" data-browser-page="about"><span class="browser-site-brand-mark">SR</span><span><strong>Saif Ul Rehman</strong><small>Software Engineer</small></span></a><div class="browser-site-nav-label">PORTFOLIO</div><nav class="browser-site-nav"></nav><div class="browser-site-sidebar-footer"><span class="browser-site-online-dot"></span> Open to work</div>';
    const nav = sidebar.querySelector(".browser-site-nav");
    const groups = [
      { title: "PROFILE", items: [["about", "About Me", "⌂"], ["skills", "Expertise", "✳"], ["experience", "Experience", "◷"], ["contact", "Contact", "✉"], ["resume", "Resume", "▤"]] },
      { title: "PROJECTS", items: PROJECTS.map((project) => [project.id, project.name, "◇"]) }
    ];
    groups.forEach((group) => {
      const label = document.createElement("div");
      label.className = "browser-site-nav-label";
      label.textContent = group.title;
      nav.appendChild(label);
      group.items.forEach(([pageId, title, icon]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "browser-site-nav-item";
        button.dataset.browserPage = pageId;
        button.setAttribute("aria-current", pageId === id ? "page" : "false");
        button.innerHTML = '<span class="browser-site-nav-icon" aria-hidden="true"></span><span class="browser-site-nav-text"></span>';
        button.querySelector(".browser-site-nav-icon").textContent = icon;
        button.querySelector(".browser-site-nav-text").textContent = title;
        if (pageId === id) button.classList.add("is-active");
        nav.appendChild(button);
      });
    });
    const main = document.createElement("main");
    main.className = "browser-site-main";
    main.appendChild(browserContentFor(id));
    shell.append(sidebar, main);
    browserPreviewPage.appendChild(shell);
    installEmailForm(browserPreviewPage);

    browserPreviewPage.querySelectorAll("[data-browser-page]").forEach((control) => {
      control.addEventListener("click", (event) => {
        event.preventDefault();
        renderBrowserPreviewPage(control.dataset.browserPage);
      });
    });
  }

  function installEmailForm(root) {
    const form = root.querySelector("[data-email-form]");
    if (!form || form.dataset.emailBound === "true") return;
    form.dataset.emailBound = "true";
    const status = form.querySelector("[data-email-status]");
    const submit = form.querySelector('button[type="submit"]');
    const config = window.PORTFOLIO_EMAIL_CONFIG || {};
    const configured = config.publicKey && config.serviceId && config.templateId &&
      !/YOUR_|REPLACE_ME|CHANGE_ME/i.test([config.publicKey, config.serviceId, config.templateId].join(" "));
    if (!configured || !window.emailjs) {
      status.classList.add("is-setup-pending");
      status.textContent = "Email delivery is not connected yet. Configure the EmailJS public key, service ID, and template ID to activate this form. You can email Saif directly at saifighourii000@gmail.com.";
      return;
    }
    try {
      window.emailjs.init({ publicKey: config.publicKey });
    } catch (error) {
      status.textContent = "Email service could not be initialized. Please use the direct email link below.";
      return;
    }
    status.textContent = "Your message will be sent directly to Saif's inbox. Please do not include passwords or sensitive information.";
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (form.elements.website && form.elements.website.value.trim()) return;
      const lastSent = Number(sessionStorage.getItem("portfolioEmailLastSentAt") || 0);
      if (Date.now() - lastSent < 10000) {
        status.textContent = "Please wait a few seconds before sending another message.";
        return;
      }
      submit.disabled = true;
      submit.textContent = "Sending message...";
      status.textContent = "Sending your message securely through EmailJS...";
      try {
        await window.emailjs.sendForm(config.serviceId, config.templateId, form);
        sessionStorage.setItem("portfolioEmailLastSentAt", String(Date.now()));
        form.reset();
        status.textContent = "Message sent successfully. Thank you for reaching out. Saif will get back to you as soon as possible.";
        status.classList.add("is-success");
      } catch (error) {
        status.textContent = "Your message could not be sent right now. Please try again later or email saifighourii000@gmail.com directly.";
        status.classList.add("is-error");
      } finally {
        submit.disabled = false;
        submit.innerHTML = '<span aria-hidden="true">↗</span> Send message';
      }
    });
  }

  function openBrowserPreview(id, pane) {
    if (!browserPreview || !pane) return;
    renderBrowserPreviewPage(id);
    browserPreview.hidden = false;
    if (browserPreviewBackdrop) browserPreviewBackdrop.hidden = false;
    void browserPreview.offsetWidth;
    browserPreview.classList.add("is-open");
    if (browserTaskbarButton) browserTaskbarButton.classList.add("is-running");
    if (browserPreviewClose) browserPreviewClose.focus();
  }
  function installPreviewControl(pane, id) {
    if (!pane || pane.querySelector(".ide-preview-toolbar")) return;
    const toolbar = document.createElement("div");
    toolbar.className = "ide-preview-toolbar";
    toolbar.innerHTML = '<span class="ide-preview-file-label"></span><button type="button" class="ide-preview-open-btn"><span aria-hidden="true">↗</span> Preview</button>';
    toolbar.querySelector(".ide-preview-file-label").textContent = (FILES[id] && FILES[id].label) || id;
    toolbar.querySelector("button").addEventListener("click", () => openBrowserPreview(id, pane));
    pane.prepend(toolbar);
  }
  if (browserPreviewClose) browserPreviewClose.addEventListener("click", closeBrowserPreview);
  if (browserPreviewBackdrop) browserPreviewBackdrop.addEventListener("click", closeBrowserPreview);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && browserPreview && !browserPreview.hidden) closeBrowserPreview();
  });

  /* ---------------- Streaming reveal + skill-bar animation per pane ---------------- */
  function wirePaneStreaming(pane, id) {
    if (id === "about") {
      const el = pane.querySelector("#aboutBioText");
      const text =
        "Senior Software Engineer with 6 years designing scalable systems, clean architectures, and AI-powered applications with .NET, Angular, and React. Founder of ANGUNET, an open-source Angular + .NET starter with a built-in MCP server.";
      if (el && window.streamText) window.streamText(el, text, { minChunk: 2, maxChunk: 4 });
      else if (el) el.textContent = text;
    }

    if (id === "skills") {
      requestAnimationFrame(() => {
        pane.querySelectorAll(".skill-bar-fill").forEach((bar, i) => {
          setTimeout(() => {
            bar.style.width = bar.dataset.pct + "%";
          }, prefersReducedMotion ? 0 : i * 90);
        });
      });
    }

    const project = PROJECTS.find((p) => p.id === id);
    if (project) {
      const descEl = pane.querySelector(`#descText-${project.id}`);
      const archEl = pane.querySelector(`#archText-${project.id}`);
      if (descEl && window.streamText) window.streamText(descEl, project.description || "", { minChunk: 2, maxChunk: 4 });
      else if (descEl) descEl.textContent = project.description || "";
      if (archEl) archEl.textContent = project.architecture || "";
    }
  }

  /* ---------------- Default: open About on first load ---------------- */
  openFile("about");
})();
