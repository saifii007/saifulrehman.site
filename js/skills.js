/**
 * skills.js
 * Animates skill progress bars from 0 to their target width when scrolled into view.
 */
(function () {
  "use strict";

  const bars = document.querySelectorAll(".skill-bar-fill");
  if (!bars.length) return;

  function animateBar(bar) {
    const level = bar.dataset.level || "0";
    requestAnimationFrame(() => {
      bar.style.width = level + "%";
    });
  }

  if (!("IntersectionObserver" in window)) {
    bars.forEach(animateBar);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateBar(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  bars.forEach((bar) => observer.observe(bar));
})();
