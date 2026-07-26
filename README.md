# Saif Ul Rehman — Portfolio

A 100% static portfolio site: HTML5, CSS3, and vanilla JavaScript (ES6+). No
frameworks, no build step, no backend. Content is sourced from Saif's real,
already-live site (`saifulrehman.site`) and his LinkedIn profile — see
[PLACEHOLDERS.md](PLACEHOLDERS.md) for the handful of fields still missing.

## What makes this build different from a standard portfolio

- **Chat-driven hero** — the first screen is a fixed, no-scroll `100vh` chat
  interface (not a modal): a headline, a persistent bottom-docked bar with
  quick-option chips ("About Me", "Projects", "Skills", …), and a free-text
  input. Picking a chip swaps the pane in place with a typewriter-revealed
  answer plus an "Explore this section →" action; asking a free-text question
  does the same via keyword matching. The **"Web View"** chip scrolls straight
  into the full scrollable site instead of answering in place, and once
  you're past the hero a floating **"← Back to Chat"** button (bottom-left)
  returns you to it. The top nav bar is hidden while the hero is in view and
  slides in once you scroll past it.
- **Horizontal walking-character Career Journey** — on desktop, this section
  pins itself and translates a road of milestones horizontally as you scroll
  down the page (classic scroll-jacking technique, done with plain
  `transform: translateX()` — no library). A character sprite "walks" in
  place while the road passes underneath; big milestones trigger a small
  confetti burst. On mobile it becomes a native swipeable strip instead —
  scroll-jacking is a poor fit for touch, so it isn't forced there.
- **Light/dark theme toggle** — CSS custom properties swapped via
  `[data-theme]` on `<html>`, persisted in `localStorage`, applied
  pre-paint to avoid a flash of the wrong theme.
- **Mouse-driven 3D tilt** on cards throughout (`js/tilt.js`) — perspective +
  rotateX/rotateY that follows the cursor. Skipped on touch-only devices and
  when `prefers-reduced-motion` is set.
- **17 real projects** rendered dynamically from `js/data.js`, each with a
  real screenshot pulled from Saif's live site, filterable by category.
- **Illustrated avatar** (`assets/images/avatar-illustration.png`) used as a
  small circular "assistant" icon next to hero replies and in the floating
  chatbot header — Saif's real photo is still used in the Profile section.
- **Contribution heatmap**, **skills dashboard**, and the **floating FAQ
  chatbot** carry over from the previous build — the chatbot shares its Q&A
  data (`CHAT_FAQ` in `js/data.js`) with the hero via `js/faqMatch.js`, and
  adds a "Go to section →" button under each answer.

## File structure

```
saif-ortfolio/
├── index.html                 # all sections, hero included (no separate overlay)
├── css/
│   ├── variables.css           # design tokens — dark theme + [data-theme="light"] overrides
│   ├── base.css                 # reset + base styles
│   ├── layout.css               # header/nav (incl. hide-on-hero), theme toggle,
│   │                             back-to-chat button, sections, grids
│   ├── components.css           # cards, timeline, chatbot, projects, skills
│   ├── animations.css           # keyframes + scroll-reveal system
│   ├── chathero.css             # chat-driven hero: stage pane + docked chat bar
│   ├── journey.css              # horizontal walking-character timeline
│   └── responsive.css           # breakpoints (incl. journey's mobile fallback)
├── js/
│   ├── data.js                   # single source of truth: career events, journey
│   │                              stops, all 17 projects, chatbot FAQ, dock chips
│   ├── faqMatch.js               # shared keyword-matcher (hero + chatbot)
│   ├── theme.js                  # light/dark toggle, not deferred (avoids flash)
│   ├── scrollReveal.js           # IntersectionObserver reveal-on-scroll engine
│   ├── hero.js                   # canvas particle field behind the chat hero
│   ├── chatHero.js               # chat-hero behavior: chip/typed answers, Web View
│   ├── journey.js                # scroll-jacked horizontal timeline engine
│   ├── heatmap.js                # contribution heatmap grid + tooltips
│   ├── skills.js                 # animated skill progress bars
│   ├── projects.js               # renders PROJECTS, category filter, expand/collapse
│   ├── chatbot.js                # floating FAQ chatbot
│   ├── tilt.js                   # mouse-driven 3D card tilt
│   └── main.js                   # nav, active-link highlighting, hero-hide/back-to-chat, footer year
├── assets/
│   ├── icons/favicon.svg
│   ├── images/
│   │   ├── avatar.jpeg               # Saif's real photo — used in the Profile section
│   │   ├── avatar-illustration.png   # illustrated avatar — hero replies + chatbot icon
│   │   ├── walker-character.webp     # Journey section's walking sprite
│   │   ├── og-cover.svg
│   │   ├── projects/                  # real project screenshots
│   │   └── tech/                      # real tech-stack icon images
│   └── resume/                    # add Saif-Ul-Rehman-Resume.pdf here
├── robots.txt
├── .nojekyll
├── PLACEHOLDERS.md
└── README.md
```

## Why still no GSAP / Three.js

Everything — particle field, chat-hero transitions, the horizontal
scroll-jacked journey, 3D tilt, scroll reveals — runs on plain Canvas2D, CSS
3D transforms, and `IntersectionObserver`/`requestAnimationFrame`. That
keeps the site dependency-free (nothing to fail to load from a CDN, nothing
to version) while still hitting every animation beat requested. Swapping in
GSAP later is additive, not a rewrite.

## Run locally

```bash
python -m http.server 8000
# or
npx serve .
```

Open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a GitHub repository (this is a **separate** repo from
   `saifii007/saifulrehman.site` — that live site was intentionally left
   untouched).
2. Push this folder's contents to `main`:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. GitHub → **Settings → Pages → Build and deployment → Source** → **Deploy
   from a branch** → branch **main**, folder **/ (root)** → **Save**.
4. Live in ~1 minute at `https://<your-username>.github.io/<repo-name>/`.
5. Update `og:url` / `canonical` in `index.html` and the `Sitemap:` line in
   `robots.txt` to match your real URL — they currently point to a
   placeholder (`https://saifii007.github.io/saif-ortfolio/`).

## Before you publish

Read [PLACEHOLDERS.md](PLACEHOLDERS.md) for the full list of what's still
missing (mainly: resume PDF, a handful of project descriptions the source
site never wrote out, and confirming one date conflict between LinkedIn and
the personal site).
