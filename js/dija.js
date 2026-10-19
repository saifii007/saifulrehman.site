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


  /* ---------------- DIJA chat: public free AI with local fallback ---------------- */
  function installQuestionBox() {
    const form = document.getElementById("dijaChatForm");
    const input = document.getElementById("dijaChatInput");
    const messages = document.getElementById("dijaChatMessages");
    if (!form || !input || !messages || form.dataset.ready) return;
    form.dataset.ready = "true";
    const history = [];
    const addMessage = (role, text) => {
      const node = document.createElement("div");
      node.className = "dija-chat-message " + role;
      node.textContent = text;
      messages.appendChild(node);
      messages.scrollTop = messages.scrollHeight;
      return node;
    };
    const systemContext = () => {
      const projects = (typeof PROJECTS !== "undefined" ? PROJECTS : []).map(p =>
        p.name + " — " + (p.tagline || "") + "; stack: " + (p.tech || []).join(", ") + "; " + (p.description || "")
      ).join("\\n");
      return "You are DIJA, a friendly portfolio assistant for Saif Ul Rehman, a software engineer. Answer accurately and concisely from this context. Never invent missing facts; say when something is not listed. Experience includes Cedar Financial, Solvefy, EraTech, and Sizdom Technologies. Skills include .NET, ASP.NET Core, Angular, React, TypeScript, JavaScript, SQL Server, MongoDB, Docker, and MCP. Contact links are in the portfolio Contact item and LinkedIn icon. Projects:\\n" + projects;
    };
    async function askAI(question) {
      const prompt = systemContext() + "\\n\\n" + history.map(m => (m.role === "user" ? "Visitor: " : "DIJA: ") + m.content).join("\\n") + "\\nVisitor: " + question + "\\nDIJA:";
      const response = await fetch("https://text.pollinations.ai/" + encodeURIComponent(prompt), { method: "GET", headers: { Accept: "text/plain" }, cache: "no-store" });
      if (!response.ok) throw new Error("AI endpoint unavailable");
      const answer = (await response.text()).trim();
      if (!answer || answer.length > 12000) throw new Error("Invalid AI response");
      return answer;
    }
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const question = input.value.trim();
      if (!question) return;
      addMessage("user", question);
      input.value = "";
      input.style.height = "auto";
      history.push({ role: "user", content: question });
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = "…";
      const pending = addMessage("assistant", "Thinking…");
      try {
        const answer = await askAI(question);
        pending.textContent = answer;
        history.push({ role: "assistant", content: answer });
        if (history.length > 12) history.splice(0, 2);
      } catch (error) {
        const answer = answerFromPortfolio(question);
        pending.textContent = answer + "\\n\\n(The free AI service is unavailable right now, so this is the local portfolio answer.)";
        history.push({ role: "assistant", content: answer });
      } finally {
        button.disabled = false;
        button.textContent = "➤";
        messages.scrollTop = messages.scrollHeight;
        input.focus();
      }
    });
    input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 120) + "px"; });
    input.addEventListener("keydown", event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });
  }

  function answerFromPortfolio(question) {
    const q = question.toLowerCase();
    const projects = (typeof PROJECTS !== "undefined" ? PROJECTS : []);
    const techTerms = [...new Set(projects.flatMap((p) => p.tech || []))];
    const matchingTech = techTerms.filter((tech) => q.includes(tech.toLowerCase()));
    const matches = projects.filter((p) => {
      const haystack = [p.name, p.tagline, p.description, p.categoryLabel, ...(p.tech || []), ...(p.features || [])]
        .join(" ").toLowerCase();
      const words = q.split(/[^a-z0-9+#.]+/).filter((word) => word.length > 2);
      return words.some((word) => haystack.includes(word)) ||
        matchingTech.some((tech) => (p.tech || []).some((t) => t.toLowerCase() === tech.toLowerCase()));
    }).slice(0, 3);

    if (/contact|email|hire|reach|linkedin|resume|cv/.test(q)) {
      return "You can use the Contact.env item in the portfolio explorer, or the LinkedIn and GitHub icons in the taskbar. Open Resume.pdf to view or download the résumé.";
    }
    if (/experience|career|work history|company|cedar|solvefy|eratech|sizdom/.test(q)) {
      return "The experience section covers Cedar Financial, Solvefy, EraTech, and Sizdom Technologies. Choose “Show his Experiences?” to browse roles, dates, and summaries.";
    }
    if (/skill|expertise|technology|tech stack/.test(q) && !matchingTech.length) {
      return "The portfolio highlights .NET / ASP.NET Core, Angular, React, TypeScript, JavaScript, SQL Server, MongoDB, Docker, MCP, and AI tooling. Choose “Show his Expertise?” to browse the full skills panel.";
    }
    if (matches.length) {
      return "Here are relevant projects: " + matches.map((p) => {
        const stack = (p.tech || []).slice(0, 5).join(", ");
        return p.name + (p.tagline ? " — " + p.tagline : "") + (stack ? " ( " + stack + " )" : "");
      }).join("; ") + ". Choose “Show you his projects?” to open project details.";
    }
    if (/project|portfolio|angunet|mcp|angular|\.net|dotnet|microservice|saas|pos|ai/.test(q)) {
      return "ANGUNET is Saif's Angular + .NET starter with an MCP server. Other projects include NokNok, BLOCKPOS, ECOM, QSR, DailyBook, and client systems. Choose “Show you his projects?” to explore them.";
    }
    return "I can help you explore Saif's projects, skills, and experience. Try asking about Angular, .NET, MCP, microservices, a specific project, or how to contact him.";
  }

  installQuestionBox();

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
  function projectAppMarkup(p) {
    const image = p.image
      ? `<img src="${esc(p.image)}" alt="" loading="lazy" onerror="this.hidden=true; this.parentElement.classList.add('is-fallback'); this.nextElementSibling.hidden=false;" />`
      : "";
    return `<button class="dija-project-app-card" type="button" data-id="${esc(p.id)}" aria-label="Open ${esc(p.name)} project">
      <span class="dija-project-app-icon">
        ${image}
        <span class="dija-project-app-fallback" ${p.image ? "hidden" : ""}>${esc(p.icon || "📦")}</span>
      </span>
      <span class="dija-project-app-name">${esc(p.name)}</span>
      <span class="dija-project-app-tagline">${esc(p.tagline || p.categoryLabel || "Software project")}</span>
      <span class="dija-project-app-tags">${(p.tech || []).slice(0, 4).map((t) => `<span>${esc(t)}</span>`).join("")}</span>
      <span class="dija-project-app-open">Open project <span aria-hidden="true">↗</span></span>
    </button>`;
  }

  function buildProjectsPanel() {
    const panel = document.createElement("div");
    panel.className = "dija-panel dija-project-app-grid";
    panel.innerHTML = `<p class="dija-project-app-hint">Choose a project application to open its workspace on the desktop.</p>` + PROJECTS.map(projectAppMarkup).join("");
    panel.addEventListener("click", (e) => {
      const app = e.target.closest(".dija-project-app-card");
      if (!app) return;
      const id = app.dataset.id;
      closeCarousel();
      if (typeof window.osOpenWindow === "function") window.osOpenWindow();
      if (typeof window.ideOpenFile === "function") window.ideOpenFile(id);
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

  const navApps = document.getElementById("taskbarPinned");
  if (navApps) navApps.addEventListener("click", event => {
    const app = event.target.closest("[data-nav-action]");
    if (!app) return;
    const action = app.dataset.navAction;
    if (window.dijaOpenSection) window.dijaOpenSection(action);
  });

  if (carouselBack) carouselBack.addEventListener("click", closeCarousel);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && carousel.classList.contains("is-open")) closeCarousel();
  });
})();
