/**
 * journey.js
 * Horizontal walking-character career timeline.
 * Desktop (>900px): pins the section and translates the road horizontally
 * based on vertical scroll progress through the pinned range — the classic
 * scroll-jacked horizontal-scroll technique, done with plain transforms.
 * Mobile (<=900px): CSS handles it as a native swipeable strip (see
 * journey.css) — this script just wires up reveal-on-scroll there instead.
 */
(function () {
  "use strict";

  const pin = document.getElementById("journeyPin");
  const track = document.getElementById("journeyTrack");
  const road = document.getElementById("journeyRoad");
  const stopsContainer = document.getElementById("journeyStops");
  if (!pin || !track || !road || !stopsContainer || typeof JOURNEY_STOPS === "undefined") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = () => window.matchMedia("(min-width: 901px)").matches;

  /* ---------------- Render stops ---------------- */
  stopsContainer.innerHTML = JOURNEY_STOPS.map(
    (stop, i) => `
      <div class="journey-stop${stop.big ? " is-big" : ""}" data-index="${i}">
        <div class="journey-stop-icon">${stop.icon}</div>
        <div class="journey-stop-card">
          <h3>${stop.title}</h3>
          <p class="journey-stop-place">${stop.place}</p>
          <p class="journey-stop-period">${stop.period}</p>
          <p class="journey-stop-detail">${stop.detail}</p>
        </div>
      </div>`
  ).join("");

  const progressWrap = document.createElement("div");
  progressWrap.className = "journey-progress";
  progressWrap.innerHTML = JOURNEY_STOPS.map(() => "<span></span>").join("");
  track.appendChild(progressWrap);

  const stopEls = [...stopsContainer.querySelectorAll(".journey-stop")];
  const progressDots = [...progressWrap.querySelectorAll("span")];
  const celebrated = new Set();

  function spawnConfetti(iconEl) {
    const colors = ["var(--accent-1)", "var(--accent-2)", "var(--accent-3)"];
    for (let i = 0; i < 10; i++) {
      const dot = document.createElement("span");
      dot.className = "confetti-dot";
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 30;
      dot.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      dot.style.setProperty("--dy", `${Math.sin(angle) * dist - 20}px`);
      dot.style.setProperty("--rot", `${Math.random() * 360}deg`);
      dot.style.background = colors[i % colors.length];
      iconEl.appendChild(dot);
      setTimeout(() => dot.remove(), 950);
    }
  }

  function setActiveStop(index) {
    stopEls.forEach((el, i) => {
      const active = i === index;
      el.classList.toggle("is-active", active);
      if (progressDots[i]) progressDots[i].classList.toggle("is-active", active);
      if (active && JOURNEY_STOPS[i].big && !celebrated.has(i)) {
        celebrated.add(i);
        spawnConfetti(el.querySelector(".journey-stop-icon"));
      }
    });
  }

  /* ---------------- Desktop: scroll-jacked horizontal pin ---------------- */
  let rafId = null;
  let maxTranslate = 0;

  function measure() {
    if (!isDesktop()) return;
    const roadWidth = road.scrollWidth;
    const viewportWidth = track.clientWidth;
    maxTranslate = Math.max(roadWidth - viewportWidth, 0);
    const viewportHeight = window.innerHeight;
    pin.style.height = `${viewportHeight + maxTranslate}px`;
  }

  function onScroll() {
    if (!isDesktop()) return;
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const rect = pin.getBoundingClientRect();
      const scrollable = pin.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);

      road.style.transform = `translateX(-${progress * maxTranslate}px)`;

      const stopIndex = Math.min(Math.round(progress * (JOURNEY_STOPS.length - 1)), JOURNEY_STOPS.length - 1);
      setActiveStop(stopIndex);
    });
  }

  function initDesktop() {
    measure();
    setActiveStop(0);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      if (isDesktop()) measure();
    });
    onScroll();
  }

  /* ---------------- Mobile: reveal-on-horizontal-scroll ---------------- */
  function initMobile() {
    stopEls.forEach((el) => el.classList.add("is-active"));
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number(entry.target.dataset.index);
          if (JOURNEY_STOPS[idx].big && !celebrated.has(idx)) {
            celebrated.add(idx);
            spawnConfetti(entry.target.querySelector(".journey-stop-icon"));
          }
        });
      },
      { root: track, threshold: 0.6 }
    );
    stopEls.forEach((el) => observer.observe(el));
  }

  if (prefersReducedMotion) {
    // Skip scroll-jacking and confetti entirely; just show everything settled.
    stopEls.forEach((el) => el.classList.add("is-active"));
    pin.style.height = "auto";
    track.style.position = "static";
    track.style.height = "auto";
    track.style.overflowX = "auto";
  } else if (isDesktop()) {
    initDesktop();
  } else {
    initMobile();
  }
})();
