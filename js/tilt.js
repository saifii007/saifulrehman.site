/**
 * tilt.js
 * Subtle mouse-driven 3D tilt on card surfaces — perspective + rotateX/Y
 * that follows the cursor, plus a small lift and scale. Also sets --mx/--my
 * CSS custom properties (percentage position within the element) so cards
 * like .explorer-card can drive a cursor-following "mouse light" glow purely
 * in CSS. Pure transforms, no dependency. Skipped on touch-only devices and
 * when prefers-reduced-motion is set.
 *
 * Exposes window.applyTilt(elements) so dynamically-inserted cards (e.g. the
 * AI Portfolio Explorer's response cards) can opt in after the fact — the
 * initial page-load pass only sees elements that exist at DOMContentLoaded.
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchOnly = window.matchMedia("(hover: none)").matches;

  const MAX_DEG = 5;

  function applyTilt(elements) {
    if (prefersReducedMotion || isTouchOnly) return;

    elements.forEach((el) => {
      if (el.dataset.tiltBound) return;
      el.dataset.tiltBound = "true";
      el.classList.add("js-tilt");

      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateY = px * MAX_DEG * 2;
        const rotateX = -py * MAX_DEG * 2;
        el.style.transform = `perspective(900px) translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.008)`;
        el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
        el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  window.applyTilt = applyTilt;

  const selector = ".project-card, .skill-category, .cert-badge, .contact-card, .profile-card, .timeline-card";
  applyTilt(document.querySelectorAll(selector));
})();
