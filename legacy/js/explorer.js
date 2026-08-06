/**
 * explorer.js
 * The AI Portfolio Explorer — a single component that combines the command
 * input and its response. Never a chat log: submitting a query morphs the
 * SAME panel into an information view (title, explanation, metrics, real
 * project cards, follow-up topics), with the input staying put at the top.
 */
(function () {
  "use strict";

  // Claude-homepage-style greeting: "Happy {Day}" in the morning/afternoon,
  // switches to a time-of-day line in the evening/night. Independent of the
  // rest of this file so it still runs even if the explorer topics data
  // isn't available for some reason.
  const greetingEl = document.getElementById("explorerGreetingText");
  if (greetingEl) {
    const now = new Date();
    const hour = now.getHours();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
    const timeGreeting = hour < 5 ? "Up late" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night";
    const line = hour >= 5 && hour < 18 ? `Happy ${dayName}` : timeGreeting;
    greetingEl.textContent = `${line} - Ask me anything about my work!`;
  }

  const panel = document.getElementById("explorerPanel");
  const chatGateInner = document.getElementById("chatGateInner");
  const form = document.getElementById("explorerForm");
  const input = document.getElementById("explorerInput");
  const chipsEl = document.getElementById("explorerChips");
  const responseWrap = document.getElementById("explorerResponseWrap");
  const responseEl = document.getElementById("explorerResponse");

  if (!panel || typeof EXPLORER_TOPICS === "undefined") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function typeText(el, text, opts) {
    if (window.streamText) window.streamText(el, text, opts);
    else {
      el.textContent = text;
      if (opts && opts.onDone) opts.onDone();
    }
  }

  /* Once the first message is sent, the composer relocates to a sticky
     footer and the greeting hides — same shape as a real chat thread. */
  function markConversationStarted() {
    if (chatGateInner.classList.contains("has-conversation")) return;
    chatGateInner.classList.add("has-conversation");
  }

  function resetConversation() {
    chatGateInner.classList.remove("has-conversation");
    responseEl.innerHTML = "";
    renderChips(null);
  }
  window.resetExplorerConversation = resetConversation;

  /* ---------------- Rotating placeholder ---------------- */
  if (!prefersReducedMotion && Array.isArray(EXPLORER_EXAMPLES) && EXPLORER_EXAMPLES.length) {
    let exampleIndex = 0;
    setInterval(() => {
      if (document.activeElement === input || input.value) return;
      exampleIndex = (exampleIndex + 1) % EXPLORER_EXAMPLES.length;
      input.setAttribute("placeholder", EXPLORER_EXAMPLES[exampleIndex]);
    }, 2600);
  }

  /* ---------------- Chips ---------------- */
  function chipMarkup(id, isActive) {
    const topic = EXPLORER_TOPICS[id];
    return `<button type="button" class="explorer-chip${isActive ? " is-active" : ""}" data-topic="${id}" style="--chip-color:${topic.color}"><span class="explorer-chip-icon">${topic.icon}</span>${topic.title}</button>`;
  }

  function renderChips(activeId) {
    chipsEl.innerHTML = EXPLORER_TOPIC_ORDER.map((id) => chipMarkup(id, id === activeId)).join("");
  }
  renderChips(null);

  /* ---------------- Matching free text to a topic ---------------- */
  function matchTopic(text) {
    const lower = text.toLowerCase();
    let best = null;
    let bestScore = 0;
    EXPLORER_TOPIC_ORDER.forEach((id) => {
      const score = EXPLORER_TOPICS[id].keywords.reduce((acc, kw) => (lower.includes(kw) ? acc + 1 : acc), 0);
      if (score > bestScore) {
        bestScore = score;
        best = id;
      }
    });
    return best;
  }

  /* ---------------- Leaving chat mode (unlock scroll + navigate) ---------------- */
  function leaveChatMode(target) {
    document.documentElement.classList.remove("chat-locked");
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  /* ---------------- Rendering a response ---------------- */
  function projectCardMarkup(project) {
    const thumb = project.image
      ? `<div class="explorer-card-thumb"><img src="${project.image}" alt="${project.name} screenshot" loading="lazy" /></div>`
      : "";
    const links = [];
    if (project.npm) links.push(`<a href="${project.npm}" target="_blank" rel="noopener noreferrer">npm ↗</a>`);
    if (project.github) links.push(`<a href="${project.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`);
    if (project.demo) links.push(`<a href="${project.demo}" target="_blank" rel="noopener noreferrer">Live demo ↗</a>`);
    if (!links.length) links.push(`<span class="placeholder-inline" style="font-size:0.7rem;">Private project</span>`);

    return `
      <article class="explorer-card" data-project-id="${project.id}" tabindex="0">
        ${thumb}
        <h4>${project.name}</h4>
        <p>${project.tagline}</p>
        <div class="explorer-card-links">${links.join("")}</div>
      </article>`;
  }

  // Keeps the LATEST content visible, right above the composer — scrolls
  // .claude-scroll to its bottom when a new turn lands, and again as the
  // response streams in and grows taller (never scrollIntoView, which
  // walks every scrollable ancestor including the locked <body> and can
  // bleed the page past the #hero gateway).
  const scrollContainer = document.querySelector(".claude-scroll");

  function scrollToBottom() {
    if (!scrollContainer) return;
    scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  function appendTurn(queryLabel, innerHtml) {
    markConversationStarted();

    const turn = document.createElement("div");
    turn.className = "explorer-turn";
    turn.innerHTML =
      (queryLabel ? `<div class="explorer-turn-query-row"><div class="explorer-turn-query">${queryLabel}</div></div>` : "") +
      `<div class="explorer-response-inner">${innerHtml}</div>`;
    responseEl.appendChild(turn);
    responseWrap.classList.add("is-open");
    scrollToBottom();
    return turn;
  }

  function renderResponse(topicId, queryLabel) {
    const topic = EXPLORER_TOPICS[topicId];
    if (!topic) return;

    if (topic.action === "webview") {
      leaveChatMode(topic.target);
      return;
    }

    const projects = (topic.projectIds || [])
      .map((id) => PROJECTS.find((p) => p.id === id))
      .filter(Boolean);

    const blocks = [];
    blocks.push(`<h3 class="explorer-response-title">${topic.title}</h3>`);
    blocks.push(`<p class="explorer-response-text"></p>`);

    if (topic.metrics && topic.metrics.length) {
      blocks.push(
        `<div class="explorer-metrics">${topic.metrics
          .map((m) => `<div class="explorer-metric"><strong>${m.value}</strong><span>${m.label}</span></div>`)
          .join("")}</div>`
      );
    }

    if (projects.length) {
      blocks.push(`<div class="explorer-cards">${projects.map(projectCardMarkup).join("")}</div>`);
    }

    if (topic.target) {
      const ctaLabel = topic.action === "resume" ? "View Contact & Resume →" : `Explore ${topic.title} →`;
      blocks.push(`<div class="explorer-cta"><a href="${topic.target}" class="btn btn-secondary explorer-cta-link">${ctaLabel}</a></div>`);
    }

    if (topic.followups && topic.followups.length) {
      blocks.push(
        `<div class="explorer-followups"><span class="explorer-followups-label">Related</span>${topic.followups
          .map((id) => chipMarkup(id, false))
          .join("")}</div>`
      );
    }

    const turn = appendTurn(queryLabel || topic.title, blocks.join(""));
    renderChips(topicId);

    const textEl = turn.querySelector(".explorer-response-text");
    if (textEl) typeText(textEl, topic.explanation, { onDone: scrollToBottom });

    // Wire the CTA link + dynamically-inserted project cards.
    const ctaLink = turn.querySelector(".explorer-cta-link");
    if (ctaLink) {
      ctaLink.addEventListener("click", (e) => {
        e.preventDefault();
        leaveChatMode(topic.target);
      });
    }

    if (typeof window.applyTilt === "function") {
      window.applyTilt(turn.querySelectorAll(".explorer-card"));
    }

    if (topic.action === "resume") {
      const resumeLink = document.querySelector('a[href$="Saif-Ul-Rehman-Resume.pdf"]');
      if (resumeLink) resumeLink.click();
    }
  }

  /* ---------------- Event wiring ---------------- */
  chipsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".explorer-chip");
    if (!btn) return;
    renderResponse(btn.dataset.topic);
  });

  responseEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".explorer-chip");
    if (!btn) return;
    renderResponse(btn.dataset.topic);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    input.value = "";

    const topicId = matchTopic(value);
    if (topicId) {
      renderResponse(topicId, value);
    } else {
      const turn = appendTurn(
        value,
        `<h3 class="explorer-response-title">Not sure about that one</h3>
        <p class="explorer-response-text"></p>
        <div class="explorer-followups"><span class="explorer-followups-label">Try a topic</span>${EXPLORER_TOPIC_ORDER.map(
          (id) => chipMarkup(id, false)
        ).join("")}</div>`
      );
      renderChips(null);
      const fallbackTextEl = turn.querySelector(".explorer-response-text");
      if (fallbackTextEl) typeText(fallbackTextEl, CHAT_FALLBACK, { onDone: scrollToBottom });
    }
  });
})();
