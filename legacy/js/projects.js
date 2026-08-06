/**
 * projects.js
 * Renders project repo-cards from PROJECTS (data.js), wires up the category
 * filter bar, and handles expand/collapse (click or Enter/Space) on each card.
 */
(function () {
  "use strict";

  const grid = document.getElementById("projectsGrid");
  const filterBar = document.getElementById("projectFilters");
  if (!grid || typeof PROJECTS === "undefined") return;

  function linksMarkup(project) {
    const links = [];
    if (project.npm) links.push(`<a href="${project.npm}" target="_blank" rel="noopener noreferrer">npm: ${project.name.toLowerCase()} ↗</a>`);
    if (project.github) links.push(`<a href="${project.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`);
    if (project.demo) links.push(`<a href="${project.demo}" target="_blank" rel="noopener noreferrer">Live demo ↗</a>`);
    if (!project.github && !project.npm && !project.demo) {
      links.push(`<span class="placeholder-inline">[ADD GITHUB / DEMO LINK]</span>`);
    }
    return links.join("");
  }

  function thumbMarkup(project) {
    if (project.image) {
      return `<div class="project-thumb"><img src="${project.image}" alt="${project.name} screenshot" loading="lazy" /></div>`;
    }
    return `<div class="project-thumb placeholder-thumb"><span>${project.name}</span><small class="placeholder-inline">[ADD SCREENSHOT]</small></div>`;
  }

  function featuresMarkup(project) {
    if (!project.features || !project.features.length) return "";
    return `<ul>${project.features.map((f) => `<li>${f}</li>`).join("")}</ul>`;
  }

  function cardMarkup(project) {
    return `
      <article class="project-card glass" data-reveal data-category="${project.category}" tabindex="0" data-id="${project.id}">
        <div class="project-card-header">
          <div class="project-icon">${project.icon || "🗂️"}</div>
          <div>
            <h3 class="project-name">${project.name}</h3>
            <p class="project-tagline">${project.tagline}</p>
          </div>
          <span class="expand-indicator" aria-hidden="true">＋</span>
        </div>
        ${thumbMarkup(project)}
        <p class="project-desc">${project.description}</p>
        <div class="tech-badges">${project.tech.map((t) => `<span class="badge badge-sm">${t}</span>`).join("")}</div>
        <div class="project-links">${linksMarkup(project)}</div>
        <div class="project-expand">
          <h4>Key Features</h4>
          ${featuresMarkup(project)}
          <h4>Architecture Notes</h4>
          <p>${project.architecture}</p>
          <h4>Challenges</h4>
          <p>${project.challenges}</p>
        </div>
      </article>`;
  }

  grid.innerHTML = PROJECTS.map(cardMarkup).join("");

  function wireCard(card) {
    card.setAttribute("role", "button");
    card.setAttribute("aria-expanded", "false");

    const toggle = () => {
      const isExpanded = card.classList.toggle("is-expanded");
      card.setAttribute("aria-expanded", String(isExpanded));
    };

    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      toggle();
    });

    card.addEventListener("keydown", (e) => {
      if (e.target.closest("a")) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  }

  grid.querySelectorAll(".project-card").forEach(wireCard);

  // Re-run scroll-reveal for the cards we just injected (scrollReveal.js
  // already ran on DOMContentLoaded before this script populated the grid).
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    grid.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));
  } else {
    grid.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
  }

  // Category filter bar
  if (filterBar && typeof PROJECT_CATEGORIES !== "undefined") {
    filterBar.innerHTML = PROJECT_CATEGORIES.map(
      (cat, i) => `<button class="filter-chip${i === 0 ? " is-active" : ""}" type="button" data-filter="${cat.id}">${cat.label}</button>`
    ).join("");

    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-chip");
      if (!btn) return;

      filterBar.querySelectorAll(".filter-chip").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const filter = btn.dataset.filter;
      grid.querySelectorAll(".project-card").forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !match);
      });
    });
  }
})();
