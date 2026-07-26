/**
 * main.js
 * Site-wide wiring: mobile nav toggle, active nav-link highlighting, footer year.
 */
(function () {
  "use strict";

  /* ---- Footer year ---- */
  const yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Header emphasis on scroll ---- */
  const header = document.getElementById("siteHeader");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Hide the floating nav while the locked chat gateway (#hero) is in
     view — there's nowhere to navigate to until "Web View" unlocks scroll —
     and reveal it once past that screen. ---- */
  const heroSection = document.getElementById("hero");
  if (header && heroSection && "IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          header.classList.toggle("is-hidden", entry.isIntersecting);
        });
      },
      { threshold: 0.6 }
    );
    heroObserver.observe(heroSection);
  }

  /* ---- Active nav link on scroll ---- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const linkFor = (id) => document.querySelector(`.nav-link[href="#${id}"]`);

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkFor(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => navObserver.observe(section));
  }
})();
