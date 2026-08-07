/**
 * ide.js
 * Renders the VS Code editor's content: file tree (from PROJECTS in
 * data.js), tab bar, and each file's code + live-preview pane. Exposes
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

  if (!tree || typeof PROJECTS === "undefined") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const openTabs = []; // ordered array of file ids
  let activeId = null;

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

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
        <span>localhost:4200${esc(urlPath)}</span>
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
        <div class="preview-card-body">
          <div class="preview-avatar"><img src="assets/images/avatar-profile-card.png" alt="Saif Ul Rehman" /></div>
          <div class="preview-name">Saif Ul Rehman</div>
          <div class="preview-role">Senior Software Engineer &middot; Founder of ANGUNET</div>
          <div class="preview-status">● Available for hire</div>
          <p class="preview-quote">Bridging the gap between robust backend systems and intuitive user interfaces — I specialize in enterprise-grade applications that demand high performance and reliability.</p>
          <div class="preview-tags">
            <span class="preview-tag">.NET</span><span class="preview-tag">Angular</span>
            <span class="preview-tag">React</span><span class="preview-tag">MCP</span><span class="preview-tag">Agentic AI</span>
          </div>
          <div class="preview-stats">
            <div class="preview-stat"><strong>6+</strong><span>Years Exp</span></div>
            <div class="preview-stat"><strong>17</strong><span>Projects</span></div>
            <div class="preview-stat"><strong>20+</strong><span>Clients</span></div>
          </div>
        </div>
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
    return `<div class="terminal-pane"><div style="margin-bottom:0.5rem;color:var(--vsc-text-muted);">$ git log --oneline --graph --all</div>${rows}</div>`;
  }

  function contactMarkup() {
    return `<div class="ide-pane-split">
      <div class="code-block">
<span class="tok-comment"># Contact.env — reach out any time</span>
<span class="contact-line"><span class="tok-key">EMAIL</span><span class="tok-punct">=</span><a href="mailto:saifighourii000@gmail.com">saifighourii000@gmail.com</a></span>
<span class="contact-line"><span class="tok-key">PHONE</span><span class="tok-punct">=</span><a href="tel:+923249705067">+92 324 970 5067</a></span>
<span class="contact-line"><span class="tok-key">WHATSAPP</span><span class="tok-punct">=</span><a href="https://wa.me/923249705067" target="_blank" rel="noopener noreferrer">wa.me/923249705067</a></span>
<span class="contact-line"><span class="tok-key">LINKEDIN</span><span class="tok-punct">=</span><a href="https://www.linkedin.com/in/saif-ul-rehman777/" target="_blank" rel="noopener noreferrer">linkedin.com/in/saif-ul-rehman777</a></span>
<span class="contact-line"><span class="tok-key">GITHUB</span><span class="tok-punct">=</span><a href="https://github.com/saifii007" target="_blank" rel="noopener noreferrer">github.com/saifii007</a></span>
<span class="contact-line"><span class="tok-key">LOCATION</span><span class="tok-punct">=</span><span class="tok-string">"Lahore, Punjab, Pakistan"</span></span>
<span class="contact-line"><span class="tok-key">STATUS</span><span class="tok-punct">=</span><span class="tok-string">"open_to_work"</span></span>
      </div>
      <aside class="preview-card">
        ${browserChrome("CONTACT.ENV", "/contact")}
        <div class="preview-card-body">
          <div class="preview-avatar"><img src="assets/images/avatar-profile-card.png" alt="Saif Ul Rehman" /></div>
          <div class="preview-name">Get in touch</div>
          <div class="preview-role">Saif Ul Rehman &middot; Lahore, Pakistan</div>
          <div class="preview-status">● Open to work</div>
          <p class="preview-quote">Always happy to talk about SaaS platforms, enterprise architecture, or AI-powered tooling — reach out any way that's easiest for you.</p>
          <div class="preview-links" style="flex-direction:column;">
            <a class="preview-btn is-primary" href="mailto:saifighourii000@gmail.com">✉️ Email</a>
            <a class="preview-btn" href="tel:+923249705067">📞 Call</a>
            <a class="preview-btn" href="https://wa.me/923249705067" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
            <a class="preview-btn" href="https://www.linkedin.com/in/saif-ul-rehman777/" target="_blank" rel="noopener noreferrer">💼 LinkedIn</a>
            <a class="preview-btn" href="https://github.com/saifii007" target="_blank" rel="noopener noreferrer">🐙 GitHub</a>
          </div>
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

    const thumb = p.image
      ? `<div class="preview-thumb"><img src="${p.image}" alt="${esc(p.name)} screenshot" loading="lazy" /></div>`
      : "";

    return `<div class="ide-pane-split">
      <div class="code-block">
${importLines}
<span class="ln">${baseLn}</span>
<span class="ln">${baseLn + 1}</span><span class="tok-comment">// ${esc(p.categoryLabel || "")}</span>
<span class="ln">${baseLn + 2}</span><span class="tok-keyword">export const</span> <span class="tok-func">${esc(p.name.replace(/\s+/g, ""))}</span><span class="tok-punct">: Project =</span> <span class="tok-punct">{</span>
<span class="ln">${baseLn + 3}</span>  <span class="tok-key">id</span><span class="tok-punct">:</span> <span class="tok-string">'${esc(p.id)}'</span><span class="tok-punct">,</span>
<span class="ln">${baseLn + 4}</span>  <span class="tok-key">title</span><span class="tok-punct">:</span> <span class="tok-string">'${esc(p.name)}'</span><span class="tok-punct">,</span>
<span class="ln">${baseLn + 5}</span>  <span class="tok-key">role</span><span class="tok-punct">:</span> <span class="tok-string">'${esc(p.tagline || "")}'</span><span class="tok-punct">,</span>
<span class="ln">${baseLn + 6}</span>  <span class="tok-key">status</span><span class="tok-punct">:</span> <span class="tok-string">'Deployed'</span><span class="tok-punct">,</span>
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
        ${thumb}
        <div class="preview-card-body">
          <div class="preview-name">${esc(p.name)}</div>
          <div class="preview-role">${esc(p.tagline || "")}</div>
          <div class="preview-tags">${(p.tech || []).map((t) => `<span class="preview-tag">${esc(t)}</span>`).join("")}</div>
          ${p.features && p.features.length ? `<p class="preview-quote"><strong>Key features:</strong> ${p.features.map(esc).join(" · ")}</p>` : ""}
          <div class="preview-links">${links.join("")}</div>
        </div>
      </aside>
    </div>`;
  }

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
