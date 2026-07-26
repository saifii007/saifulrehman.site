/**
 * scrollReveal.js
 * Generic scroll-triggered reveal using IntersectionObserver.
 * Any element with [data-reveal] fades/slides in once it enters the viewport.
 * Siblings revealed together get a small staggered delay for a smoother feel.
 */
(function () {
  "use strict";

  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const groupCounters = new WeakMap();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const parent = el.parentElement;
        const count = groupCounters.get(parent) || 0;
        el.style.setProperty("--reveal-delay", Math.min(count * 70, 420) + "ms");
        groupCounters.set(parent, count + 1);
        el.classList.add("is-visible");
        observer.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
})();
