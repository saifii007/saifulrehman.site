/**
 * chatbot.js
 * Scripted FAQ chatbot — keyword-matched against CHAT_FAQ (data.js).
 * Not AI-powered: purely a predefined Q&A lookup with a fallback message.
 */
(function () {
  "use strict";

  const toggleBtn = document.getElementById("chatbotToggle");
  const closeBtn = document.getElementById("chatbotClose");
  const panel = document.getElementById("chatbotPanel");
  const messagesEl = document.getElementById("chatbotMessages");
  const suggestionsEl = document.getElementById("chatbotSuggestions");
  const form = document.getElementById("chatbotForm");
  const input = document.getElementById("chatbotInput");

  if (!toggleBtn || !panel || typeof CHAT_FAQ === "undefined") return;

  let hasGreeted = false;

  function openPanel() {
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add("is-open"));
    toggleBtn.setAttribute("aria-expanded", "true");
    if (!hasGreeted) {
      greet();
      hasGreeted = true;
    }
    input.focus();
  }

  function closePanel() {
    panel.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
    setTimeout(() => {
      panel.hidden = true;
    }, 250);
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = panel.classList.contains("is-open");
    isOpen ? closePanel() : openPanel();
  });

  closeBtn.addEventListener("click", closePanel);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) closePanel();
  });

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(text, from, target) {
    const bubble = document.createElement("div");
    bubble.className = `chat-msg chat-msg-${from}`;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);

    if (target) {
      const goBtn = document.createElement("button");
      goBtn.type = "button";
      goBtn.className = "chat-goto-btn";
      goBtn.textContent = "Go to section →";
      goBtn.addEventListener("click", () => {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        closePanel();
      });
      messagesEl.appendChild(goBtn);
    }

    scrollToBottom();
  }

  function showTyping() {
    const typing = document.createElement("div");
    typing.className = "chat-typing";
    typing.id = "chatTypingIndicator";
    typing.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(typing);
    scrollToBottom();
  }

  function hideTyping() {
    const typing = document.getElementById("chatTypingIndicator");
    if (typing) typing.remove();
  }

  function respondTo(userText) {
    addMessage(userText, "user");
    showTyping();

    const delay = 500 + Math.random() * 500;
    setTimeout(() => {
      hideTyping();
      const match = matchFaq(userText);
      if (match) {
        addMessage(match.answer, "bot", match.target);
        if (match.action === "resume") {
          const resumeLink = document.querySelector('a[href$="Saif-Ul-Rehman-Resume.pdf"]');
          if (resumeLink) resumeLink.click();
        }
      } else {
        addMessage(CHAT_FALLBACK, "bot");
      }
    }, delay);
  }

  function greet() {
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMessage(
        "Hi! I'm a scripted FAQ bot (not AI-powered) — ask me about Saif's projects, skills, experience, or how to get in touch.",
        "bot"
      );
      renderSuggestions();
    }, 500);
  }

  function renderSuggestions() {
    suggestionsEl.innerHTML = "";
    const list = typeof CHAT_SUGGESTIONS !== "undefined" ? CHAT_SUGGESTIONS : [];
    list.forEach((text) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "suggestion-chip";
      chip.textContent = text;
      chip.addEventListener("click", () => respondTo(text));
      suggestionsEl.appendChild(chip);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    respondTo(value);
    input.value = "";
  });
})();
