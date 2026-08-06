/**
 * heatmap.js
 * Renders a GitHub-style contribution heatmap for the trailing ~12 months.
 * Cells that land on a real CAREER_EVENTS date show that milestone on hover/focus;
 * all other cells show illustrative filler activity (LinkedIn has no daily commit data).
 */
(function () {
  "use strict";

  const grid = document.getElementById("heatmapGrid");
  const tooltip = document.getElementById("heatmapTooltip");
  if (!grid || typeof CAREER_EVENTS === "undefined") return;

  const eventsByDate = new Map(CAREER_EVENTS.map((e) => [e.date, e]));

  function toISODate(d) {
    // Local calendar date, NOT toISOString() (which is UTC and can shift
    // the date by a day in timezones away from UTC+0, breaking exact
    // matches against CAREER_EVENTS dates).
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function buildWeeks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Align end to the coming Saturday so the grid forms full weeks (Sun-Sat).
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const start = new Date(end);
    start.setDate(start.getDate() - 52 * 7 - end.getDay());

    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }

  function levelFor(dateStr, seedIndex) {
    const event = eventsByDate.get(dateStr);
    if (event) return Math.min(event.weight, 4);
    // Deterministic pseudo-random filler so the grid looks alive but is stable across reloads.
    const pseudo = Math.abs(Math.sin(seedIndex * 12.9898) * 43758.5453) % 1;
    if (pseudo > 0.88) return 2;
    if (pseudo > 0.7) return 1;
    return 0;
  }

  const days = buildWeeks();
  const fragment = document.createDocumentFragment();

  days.forEach((date, i) => {
    const dateStr = toISODate(date);
    const level = levelFor(dateStr, i);
    const event = eventsByDate.get(dateStr);

    const cell = document.createElement("div");
    cell.className = `cell level-${level}`;
    cell.tabIndex = 0;
    cell.dataset.date = dateStr;

    const readableDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const label = event ? `${readableDate}: ${event.label}` : `${readableDate}: no major milestone logged`;
    cell.setAttribute("aria-label", label);
    cell.title = label;

    const show = () => {
      tooltip.textContent = label;
    };

    cell.addEventListener("mouseenter", show);
    cell.addEventListener("focus", show);

    fragment.appendChild(cell);
  });

  grid.appendChild(fragment);

  const mostRecentEvent = [...CAREER_EVENTS].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  if (mostRecentEvent) {
    tooltip.textContent = `Hover a cell to explore — latest: ${mostRecentEvent.label}`;
  }
})();
