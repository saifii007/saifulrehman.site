/**
 * hero.js
 * Mouse-parallax tilt for the hero's 3D architecture cube. The cube itself
 * auto-rotates continuously via a CSS keyframe animation on the inner
 * .cube element (see hero-premium.css) — this adds a separate subtle tilt
 * on the outer .cube-scene wrapper that follows the cursor. Different
 * elements, so the two transforms never fight each other.
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchOnly = window.matchMedia("(hover: none)").matches;

  const scene = document.getElementById("cubeScene");
  const hero = document.getElementById("hero");
  if (!scene || !hero || prefersReducedMotion || isTouchOnly) return;

  const MAX_DEG = 10;

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    scene.style.transform = `rotateX(${(-py * MAX_DEG).toFixed(2)}deg) rotateY(${(px * MAX_DEG).toFixed(2)}deg)`;
  });

  hero.addEventListener("mouseleave", () => {
    scene.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
})();
