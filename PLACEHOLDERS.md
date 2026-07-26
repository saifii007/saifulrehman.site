# Placeholder audit

This build now pulls real content from **two** sources: Saif's live site
(`C:\Users\hp\Documents\Projects\saifulrehman.site`, treated as primary
source of truth) and the LinkedIn profile export used in the first pass.
Most placeholders from the original build are now resolved. What's below is
what's still genuinely missing or needs a decision.

## Resolved in this pass (no longer placeholders)

- **Profile photo** — real photo copied from `saifulrehman.site`
  (`assets/images/avatar.jpeg`).
- **Email** — saifighourii000@gmail.com (confirmed against your account).
- **Phone / WhatsApp** — +92 324 970 5067 (a second number,
  +92 315 049 5406, exists on the site too — not yet used anywhere; add it
  if you want a second contact card).
- **GitHub** — github.com/saifii007, with the real ANGUNET repo at
  github.com/saifii007/angunet.
- **16 real project screenshots** — copied into `assets/images/projects/`
  and wired into the Projects grid.
- **Real tech-stack icon images** — copied into `assets/images/tech/`, used
  in the Skills dashboard.
- **Real homepage stats** — 6+ years experience, 20+ clients worldwide,
  40+ total projects (his own homepage counters).
- **Education** — "Bachelor's Degree, Information Technology, University of
  the Punjab" (corrected from the LinkedIn-derived "BS Computer Science" —
  his own site's wording was used as more authoritative).
- **A freelance stint** (Jan–Aug 2025, Direct Client: Clinic Management
  System + Stock Management System) that wasn't visible on LinkedIn at all —
  added to the Experience timeline and the Journey.

## Still missing / needs your input

- **Resume PDF** — still not supplied. Add it at
  `assets/resume/Saif-Ul-Rehman-Resume.pdf` (exact filename — linked from
  the header, hero CTA, Contact card, and both chatbots' "Download Resume"
  answer). Placeholder note at `assets/resume/PLACEHOLDER-README.txt`.
- **8 of the 16 projects have no written description anywhere** — Stock
  Management System, Inventory Management System, CollectCo, Fastlane, HR
  Management System, CRM Dashboard, CedarRPS, ConsumerPortal. Their names,
  categories, and screenshots are real (from `works.html`); descriptions,
  features, architecture notes, and challenges are marked
  `[ADD PROJECT DESCRIPTION]` in `js/data.js` → `PROJECTS`.
- **"PMS" full name unconfirmed** — Property/Practice/Patient Management
  System? Still unclear from either source.
- **Per-role "+N more skills" tags** in the Experience section — LinkedIn
  truncates these behind "and +N skills"; open each role there for the full
  list if you want it complete.
- **Certifications** — only one verifiable credential found across both
  sources: "Introduction to Data Analytics" (SkillUp by Simplilearn, ~May
  2026). Two empty badge slots are left for you to fill in.
- **GitHub/live-demo links per project** — only ANGUNET has real links (npm
  + GitHub). The rest are marked private/no-link since they're client work;
  update any that should link somewhere.

## One date conflict, and how it was resolved

Saif's own site (`credentials.html`) and LinkedIn disagree on the Solvefy
start date: LinkedIn says Jan 2025, the personal site says Sep 2025 (and
separately lists a Jan–Aug 2025 freelance stint that LinkedIn doesn't
mention at all). Since the personal site is more detailed and was named as
the primary source of truth, this build uses:

- Sizdom Technologies: Nov 2021 – Aug 2022 (personal site's dates, not
  LinkedIn's Sep 2021 – Oct 2022)
- EraTech: Oct 2022 – Sep 2025 (personal site; LinkedIn says Jul 2025)
- Direct Client (freelance): Jan 2025 – Aug 2025 (personal site only)
- Solvefy: Sep 2025 – Jun 2026 (personal site's start date; end date
  inferred as when Cedar Financial began, since the personal site still
  says "Present" for Solvefy — likely just not updated after the move)
- Cedar Financial: Jun 2026 – Present (LinkedIn's more precise date; the
  personal site just says "Present" with no start date)

This makes an internally consistent timeline, but it's a synthesis, not a
verbatim copy of either source — please sanity-check the Experience section
and Journey stops against your actual history.

## Design decisions worth knowing about

- **Skill proficiency bars** — still the same transparent 3-tier heuristic
  from the first pass (Expert = LinkedIn Top Skills, Advanced = Core
  Expertise bullets, Working = single mention), documented on the page
  itself.
- **Contribution heatmap** — milestone tooltips are real dates; day-to-day
  activity density is illustrative filler, as noted in the section.
- **Journey "big" milestones** (the ones that get a bigger icon + confetti)
  were picked editorially: EraTech, the Solvefy/NokNok era, the ANGUNET
  launch, and the Cedar Financial promotion. Adjust the `big: true/false`
  flags in `js/data.js` → `JOURNEY_STOPS` if you'd weight these differently.
- **OG/social preview image and favicon** are still simple generated
  placeholders, not designed assets.
- **`og:url` / canonical / sitemap URL** use a placeholder GitHub Pages URL
  (`https://saifii007.github.io/saif-ortfolio/`) — update once you know the
  real deploy URL.
- **saifulrehman.site was not modified** — this is a separate project, per
  instruction. Nothing was pushed or deployed anywhere.

Everything else (About text, all 5 timeline roles, the ANGUNET story, the
BLOCK-suite/EraTech projects, top skills, services list, contact details,
followers/connections counts) is taken verbatim or near-verbatim from your
real sources — nothing was invented.
