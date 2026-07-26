/**
 * stream.js
 * Shared "AI is generating" text-reveal used by both the explorer panel and
 * the sidebar project view — reveals text in small word chunks with a
 * variable cadence + blinking cursor, so responses look generated rather
 * than pasted in. Exposes window.streamText(el, text, opts).
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * @param {HTMLElement} el - target element; its textContent is streamed in.
   * @param {string} text
   * @param {{onDone?: Function, minChunk?: number, maxChunk?: number}} [opts]
   * @returns {Function} cancel function
   */
  function streamText(el, text, opts) {
    opts = opts || {};
    const minChunk = opts.minChunk || 1;
    const maxChunk = opts.maxChunk || 3;

    if (el._streamTimer) {
      clearTimeout(el._streamTimer);
      el._streamTimer = null;
    }

    if (prefersReducedMotion) {
      el.textContent = text;
      el.classList.remove("is-streaming");
      if (opts.onDone) opts.onDone();
      return function cancel() {};
    }

    const words = text.split(/(\s+)/); // keep whitespace tokens so spacing survives
    let i = 0;
    let cancelled = false;

    el.textContent = "";
    el.classList.add("is-streaming");

    function tick() {
      if (cancelled) return;
      const chunk = minChunk + Math.floor(Math.random() * (maxChunk - minChunk + 1));
      let taken = 0;
      let out = "";
      while (i < words.length && taken < chunk) {
        out += words[i];
        if (words[i].trim() !== "") taken++;
        i++;
      }
      el.textContent += out;

      if (i < words.length) {
        // Natural cadence: quick within a burst, tiny pause after punctuation.
        const lastChar = out.trim().slice(-1);
        const pause = /[.,!?]/.test(lastChar) ? 90 + Math.random() * 90 : 18 + Math.random() * 34;
        el._streamTimer = setTimeout(tick, pause);
      } else {
        el.classList.remove("is-streaming");
        if (opts.onDone) opts.onDone();
      }
    }

    tick();

    return function cancel() {
      cancelled = true;
      if (el._streamTimer) clearTimeout(el._streamTimer);
      el.textContent = text;
      el.classList.remove("is-streaming");
    };
  }

  window.streamText = streamText;
})();
