/**
 * data.js
 * Single source of truth for dynamic, JS-rendered content: career timeline,
 * projects, chatbot FAQ, and the "journey" milestones.
 *
 * Sources (in priority order where they conflict):
 *  1. C:\Users\hp\Documents\Projects\saifulrehman.site — Saif's own live site
 *     (about.html, credentials.html, works.html, contact.html, angunet.html,
 *     index.html, service.html) — treated as primary source of truth.
 *  2. Saif Ul Rehman _ LinkedIn.html — LinkedIn profile export, used to fill
 *     gaps the personal site didn't cover (e.g. Simplilearn certificate).
 * Nothing here is invented. Where neither source had a detail, the field is
 * a clearly marked [ADD ...] placeholder instead of a guess.
 */

/* ------------------------------------------------------------------ */
/* Reconciled career timeline. saifulrehman.site/credentials.html has  */
/* explicit month-level dates that LinkedIn didn't fully match — those */
/* are used as the backbone. See PLACEHOLDERS.md for the one date      */
/* conflict (Solvefy) and how it was resolved.                         */
/* ------------------------------------------------------------------ */
const CAREER_EVENTS = [
  {
    date: "2021-11-01",
    label: "Joined Sizdom Technologies as Frontend Developer",
    weight: 3,
    target: "#experience"
  },
  {
    date: "2022-10-01",
    label: "Joined EraTech as Software Engineer",
    weight: 3,
    target: "#experience"
  },
  {
    date: "2025-01-15",
    label: "Started freelance work (Direct Client) — Clinic Management System",
    weight: 3,
    target: "#projects"
  },
  {
    date: "2025-05-01",
    label: "Delivered Stock Management System as freelance work",
    weight: 3,
    target: "#projects"
  },
  {
    date: "2025-09-01",
    label: "Joined Solvefy as Software Engineer",
    weight: 3,
    target: "#experience"
  },
  {
    date: "2025-09-20",
    label: "Led architecture for NokNok microservices platform",
    weight: 5,
    target: "#projects"
  },
  {
    date: "2025-11-05",
    label: "Built Twilio-powered AI interview assistant & call center platform",
    weight: 4,
    target: "#projects"
  },
  {
    date: "2026-05-20",
    label: "Completed \"Introduction to Data Analytics\" — SkillUp by Simplilearn",
    weight: 2,
    target: "#certifications"
  },
  {
    date: "2026-06-01",
    label: "Promoted to Senior Software Engineer at Cedar Financial",
    weight: 5,
    target: "#experience"
  },
  {
    date: "2026-06-20",
    label: "Opened freelance services page — Custom Software & SaaS Development",
    weight: 2,
    target: "#contact"
  },
  {
    date: "2026-06-22",
    label: "Launched ANGUNET v1.0 open-source full-stack framework on npm",
    weight: 5,
    target: "#projects"
  },
  {
    date: "2026-07-06",
    label: "Released ANGUNET v1.0.2 with MCP server integration",
    weight: 5,
    target: "#projects"
  },
  {
    date: "2026-07-07",
    label: "Shipped ANGUNET framework update",
    weight: 3,
    target: "#projects"
  }
];

/* ------------------------------------------------------------------ */
/* "Journey" milestones — the horizontal walking-character timeline.  */
/* A curated subset of CAREER_EVENTS turned into road-stop markers.   */
/* ------------------------------------------------------------------ */
const JOURNEY_STOPS = [
  {
    icon: "🎓",
    title: "Graduation",
    place: "University of the Punjab",
    period: "BS, Information Technology",
    detail: "Started out building small web projects while finishing a degree in Information Technology.",
    big: false
  },
  {
    icon: "💻",
    title: "First Job",
    place: "Sizdom Technologies",
    period: "Nov 2021 – Aug 2022",
    detail: "Frontend Developer — Angular & React interfaces, API integrations, first taste of shipping to real users.",
    big: false
  },
  {
    icon: "🏢",
    title: "Foundation Years",
    place: "EraTech",
    period: "Oct 2022 – Sep 2025",
    detail: "Software Engineer — built subscription POS/QSR systems (BLOCKPOS, ECOM, QSR, DailyBook) for US clients on .NET + Angular.",
    big: true
  },
  {
    icon: "🧑‍💻",
    title: "Freelance Detour",
    place: "Direct Client",
    period: "Jan 2025 – Aug 2025",
    detail: "Delivered a Clinic Management System and a Stock Management System as independent freelance work.",
    big: false
  },
  {
    icon: "🚀",
    title: "Major Product",
    place: "Solvefy — NokNok",
    period: "Sep 2025 – Jun 2026",
    detail: "Led architecture for NokNok, a .NET microservices platform, plus a Twilio-powered AI interview & call center system.",
    big: true
  },
  {
    icon: "📦",
    title: "Open Source Launch",
    place: "ANGUNET",
    period: "Jun 2026",
    detail: "Founded and shipped ANGUNET — an Angular + .NET full-stack starter with Docker, npm CLI, and an MCP server — live on npm & GitHub.",
    big: true
  },
  {
    icon: "🏆",
    title: "Senior Software Engineer",
    place: "Cedar Financial",
    period: "Jun 2026 – Present",
    detail: "Promoted to Senior Software Engineer, building fintech systems with .NET, Angular, and AI-assisted architecture.",
    big: true
  },
  {
    icon: "🔭",
    title: "Future Goals",
    place: "What's next",
    period: "Ongoing",
    detail: "Growing ANGUNET, going deeper on Agentic AI / MCP tooling, and taking on select freelance & full-time opportunities.",
    big: false
  }
];

/* ------------------------------------------------------------------ */
/* Projects — sourced from saifulrehman.site/works.html (real names,  */
/* categories, and screenshots) merged with fuller descriptions from  */
/* LinkedIn where the same project was mentioned there. Projects with */
/* no description on either source are marked with a placeholder.     */
/* ------------------------------------------------------------------ */
const PROJECTS = [
  {
    id: "angunet",
    name: "ANGUNET",
    category: "framework",
    categoryLabel: "Open Source Framework",
    image: "assets/images/projects/angunet.png",
    icon: "📦",
    tagline: "Angular + .NET full-stack starter with an MCP server",
    description:
      "Founded and built ANGUNET — a reusable full-stack starter for Angular, ASP.NET Core, SQL/MongoDB, Docker, npm CLI scaffolding, and an MCP server for AI-assisted workflows. One command (npx angunet my-app) generates a production-ready project with Clean Architecture, Repository Pattern + Unit of Work, and a dedicated ANGUNET intro page.",
    tech: ["Angular", ".NET", "SQL Server", "MongoDB", "Docker", "MCP", "npm CLI"],
    features: [
      "Clean Architecture out of the box (API, Application, Domain, Infrastructure layers)",
      "npm CLI scaffolding — npx angunet myapp",
      "MCP server (node mcp-server/server.js) exposing project context to AI tooling",
      "Environment configs aligned across Angular UI, Dev API, HTTPS API, and Docker"
    ],
    architecture:
      "Layered backend (API/Application/Domain/Infrastructure) paired with a modular Angular frontend (core, interceptors, layouts, data/models, data/services, features, shared, directives, pipes, validators).",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Creator & Founder",
    github: "https://github.com/saifii007/angunet",
    npm: "https://www.npmjs.com/package/angunet",
    demo: null,
    real: true
  },
  {
    id: "noknok",
    name: "NokNok",
    category: "enterprise",
    categoryLabel: "Enterprise Development",
    image: "assets/images/projects/noknok.png",
    tagline: ".NET microservices platform — Solvefy",
    description:
      "A .NET microservices-based platform focused on Clean Architecture, distributed systems, secure API integrations, and performance optimization. Led development while at Solvefy.",
    tech: [".NET", "Microservices", "Clean Architecture", "Angular", "ASP.NET Zero"],
    features: ["Sales, purchase, and inventory management", "Delivery workflow tracking", "Multi-database architecture (SQL Server + MongoDB)"],
    architecture: "Clean Architecture + distributed systems patterns, with secure service-to-service API integrations.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Lead Full-Stack Developer",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "blockpos",
    name: "BLOCKPOS",
    category: "enterprise",
    categoryLabel: "Enterprise Designing",
    image: "assets/images/projects/blockpos.png",
    tagline: "Subscription-based multi-tenant POS — EraTech",
    description:
      "Large-scale, subscription-based POS system for USA clients: multi-tenant SaaS architecture, real-time inventory, transaction processing, third-party API integrations, and analytics/reporting.",
    tech: [".NET", "ASP.NET Web API", "Angular", "Multi-Tenant SaaS"],
    features: ["Multi-tenant subscription billing", "Real-time inventory sync", "Transaction processing", "Analytics & reporting"],
    architecture: "Multi-tenant SaaS architecture with multi-database subscription isolation per client, built with .NET and Clean Architecture.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Lead Full-Stack Developer",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "ecom",
    name: "ECOM",
    category: "web",
    categoryLabel: "Web Designing",
    image: "assets/images/projects/ecom.png",
    tagline: "E-commerce integrated with POS — EraTech",
    description:
      "POS system with integrated e-commerce features, allowing centralized management of online orders, inventory, and customer data.",
    tech: ["Angular", "Bootstrap", ".NET"],
    features: ["Online order management", "Inventory synchronization", "Customer data management"],
    architecture: ".NET backend with an Angular frontend, integrated with the BLOCKPOS platform for centralized order and inventory data.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Contributor",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "qsr",
    name: "QSR",
    category: "software",
    categoryLabel: "Software Development",
    image: "assets/images/projects/qsr.png",
    tagline: "Quick-service restaurant ordering system — EraTech",
    description: "Quick-service-restaurant ordering flow, part of the EraTech subscription product suite.",
    tech: [".NET", "Angular", "Multi-Tenant SaaS"],
    features: ["Order management", "Restaurant workflow streamlining", "Shared multi-tenant subscription platform"],
    architecture: "Built with .NET and Clean Architecture, sharing the multi-tenant subscription platform with BLOCKPOS and DailyBook.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Lead Full-Stack Developer",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "dailybook",
    name: "DailyBook",
    category: "web",
    categoryLabel: "Web Designing",
    image: "assets/images/projects/dailybook.png",
    tagline: "Day-to-day business management — EraTech",
    description: "Expense tracking, invoicing, customer management, and day-to-day business operations module.",
    tech: [".NET", "Angular"],
    features: ["Expense tracking", "Invoicing", "Customer management"],
    architecture: "Built with .NET and Clean Architecture, handling SQL Server data for day-to-day bookkeeping — part of the same EraTech multi-tenant SaaS suite as BLOCKPOS and BLOCK-QSR.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Lead Full-Stack Developer",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "clinic",
    name: "Clinic Management System",
    category: "web",
    categoryLabel: "Web Designing",
    image: "assets/images/projects/clinicmanagement.png",
    tagline: "Freelance / Direct Client project",
    description:
      "Clinic management solution handling patient records, appointments, billing, and doctor schedules. Improved operational efficiency through centralized data management and streamlined clinical workflows.",
    tech: ["Angular", "ASP.NET", "SQL Server"],
    features: ["Centralized patient records", "Appointment scheduling", "Billing", "Doctor schedule management"],
    architecture: "ASP.NET backend with SQL Server persistence and an Angular frontend, covering patient records, scheduling, and billing in one system.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Freelance Full-Stack Developer",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "stock",
    name: "Stock Management System",
    category: "software",
    categoryLabel: "Software Development",
    image: "assets/images/projects/stock.jfif",
    tagline: "Freelance / Direct Client project",
    description: "Full-stack inventory management system for stock tracking, purchase orders, and real-time reporting — independent freelance project.",
    tech: [".NET", "SQL Server", "Angular"],
    features: ["Stock/inventory tracking", "Purchase order management", "Real-time reporting"],
    architecture: "ASP.NET backend with SQL Server persistence and an Angular frontend for real-time stock tracking and reporting.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Freelance Full-Stack Developer",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "inventory",
    name: "Inventory Management System",
    category: "software",
    categoryLabel: "Software Development",
    image: "assets/images/projects/react-dashboard1.jpg",
    tagline: "React dashboard project",
    description: "[ADD PROJECT DESCRIPTION — real project, named on saifulrehman.site, no written description supplied yet]",
    tech: ["React"],
    features: ["[ADD KEY FEATURES]"],
    architecture: "[ADD ARCHITECTURE NOTES]",
    challenges: "[ADD PROJECT CHALLENGES]",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "collectco",
    name: "CollectCo",
    category: "enterprise",
    categoryLabel: "Enterprise Development",
    image: "assets/images/projects/collectco.png",
    tagline: "Internal debt-collection system — Cedar Financial",
    description: "An internal debt collection system used by Cedar Financial's collections team to manage and track recovery workflows, as part of Cedar's debt-recovery ecosystem.",
    tech: [".NET", "Angular"],
    features: ["Recovery workflow tracking", "Case/account management for the collections team", "Internal reporting for debt collection"],
    architecture: "Built at Cedar Financial as an internal tool for the collections team, integrated with the broader debt-recovery platform.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Senior Software Engineer",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "pms",
    name: "PMS",
    category: "software",
    categoryLabel: "Software Development",
    image: "assets/images/projects/pms.png",
    tagline: "HR management system — Solvefy",
    description:
      "An HR management system built at Solvefy on ASP.NET Zero (ABP framework) with Angular and .NET, improving employee management processes across a scalable, multi-tenant architecture.",
    tech: [".NET", "Angular", "ASP.NET Zero"],
    features: ["Employee management workflows", "Multi-tenant architecture via ASP.NET Zero", "Built on the ABP framework"],
    architecture: "Multi-tenant architecture via ASP.NET Zero / Boilerplate frameworks.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Contributor",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "fastlane",
    name: "Fastlane",
    category: "web",
    categoryLabel: "Web Designing",
    image: "assets/images/projects/fastlane.png",
    tagline: "E-commerce platform (Spain) — Solvefy",
    description: "An e-commerce system built with ASP.NET Zero (ABP), supporting multiple clients and 500+ customers in Spain.",
    tech: [".NET", "ASP.NET Zero", "Angular"],
    features: ["Multi-client e-commerce support", "Serves 500+ customers", "Built on ASP.NET Zero (ABP)"],
    architecture: "Built on ASP.NET Zero (ABP framework), supporting multiple clients from a shared multi-tenant e-commerce platform.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Lead Developer",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "hr",
    name: "HR Management System",
    category: "software",
    categoryLabel: "Software Development",
    image: "assets/images/projects/hr.png",
    tagline: "Freelance / Direct Client project",
    description: "An HR management application for onboarding, attendance tracking, and payroll — independent freelance project.",
    tech: [".NET", "SQL Server", "Angular"],
    features: ["Employee onboarding", "Attendance tracking", "Payroll management"],
    architecture: "ASP.NET backend with SQL Server persistence and an Angular frontend, covering onboarding, attendance, and payroll.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Freelance Full-Stack Developer",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "crm",
    name: "CRM Dashboard",
    category: "software",
    categoryLabel: "Software Development",
    image: "assets/images/projects/crm-dashboard.png",
    tagline: "Software development project",
    description: "[ADD PROJECT DESCRIPTION — real project, named on saifulrehman.site, no written description supplied yet]",
    tech: ["[ADD TECH STACK]"],
    features: ["[ADD KEY FEATURES]"],
    architecture: "[ADD ARCHITECTURE NOTES]",
    challenges: "[ADD PROJECT CHALLENGES]",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "autoapply",
    name: "AutoApply",
    category: "web",
    categoryLabel: "Web Designing",
    image: "assets/images/projects/autoapply.png",
    tagline: "Automated job-application tool — Solvefy",
    description: "An automated job-application tool that generates CSV-driven application workflows to increase hiring rates.",
    tech: [".NET", "React"],
    features: ["CSV-driven application workflows", "Automated job application generation", "Built to increase hiring rates"],
    architecture: ".NET backend driving automated application workflows, paired with a React frontend for managing CSV-based job application data.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Full-Stack Developer",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "cedarrps",
    name: "CedarRPS",
    category: "enterprise",
    categoryLabel: "Enterprise Development",
    image: "assets/images/projects/cedar-rps.png",
    tagline: "Role Permission System — Cedar Financial",
    description: "Cedar Financial's first company-level Role Permission System, designed and built using ANGUNET, the full-stack framework I created.",
    tech: [".NET", "Angular"],
    features: ["Company-level role & permission management", "Scaffolded and delivered using ANGUNET", "Cedar Financial's first Role Permission System"],
    architecture: "Built using ANGUNET's Clean Architecture (API/Application/Domain/Infrastructure) for Cedar Financial's internal role and permission management.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Lead Full-Stack Developer",
    github: null,
    demo: null,
    real: true
  },
  {
    id: "consumerportal",
    name: "ConsumerPortal",
    category: "software",
    categoryLabel: "Software Development",
    image: "assets/images/projects/consumerportal.png",
    tagline: "Consumer debt-resolution portal — Cedar Financial",
    description: "A digital portal enabling consumers to manage and resolve their accounts, as part of Cedar Financial's debt-recovery ecosystem.",
    tech: ["React"],
    features: ["Account management for consumers", "Debt resolution workflows", "Part of Cedar's debt-recovery ecosystem"],
    architecture: "React frontend integrated with Cedar Financial's debt-recovery backend systems.",
    challenges: "[ADD PROJECT CHALLENGES]",
    contribution: "Senior Software Engineer",
    github: null,
    demo: null,
    real: true
  }
];

const PROJECT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "framework", label: "Framework" },
  { id: "enterprise", label: "Enterprise" },
  { id: "web", label: "Web Design" },
  { id: "software", label: "Software Dev" }
];

/* ------------------------------------------------------------------ */
/* Scripted FAQ chatbot. Keyword-matched, NOT AI-powered. Shared by    */
/* the chat-gate landing screen and the floating chatbot. Each entry's */
/* `target` is the section the UI scrolls to after answering.         */
/* ------------------------------------------------------------------ */
const CHAT_FAQ = [
  {
    id: "background",
    keywords: ["background", "who are you", "who is saif", "about you", "introduce", "yourself"],
    question: "Who is Saif?",
    answer:
      "I'm Saif Ul Rehman, a Senior Software Engineer at Cedar Financial and the founder of ANGUNET. Over the past 6 years I've built SaaS products, enterprise applications, and AI-powered automation, working mainly in .NET, Angular, and React, with SQL Server and MongoDB on the data side. Lately I've been spending most of my time on Agentic AI, MCP servers, and LLM integration.",
    target: "#profile"
  },
  {
    id: "companies",
    keywords: ["compan", "employer", "work for", "worked at", "eratech", "solvefy", "cedar", "sizdom"],
    question: "Companies I've worked with",
    answer:
      "I'm currently at Cedar Financial as a Senior Software Engineer. Before that I was at Solvefy, and before that EraTech, where I spent almost three years building POS and QSR systems. I started out at Sizdom Technologies as a frontend developer, and I've done some freelance work on the side too — a clinic management system and a stock management system for a direct client.",
    target: "#experience"
  },
  {
    id: "projects",
    keywords: ["project", "portfolio", "built", "angunet", "noknok", "blockpos", "show my project"],
    question: "Show my projects",
    answer:
      "I've got 17 projects on here, each with a real screenshot. The flagship is ANGUNET, an open-source Angular + .NET starter I founded. Beyond that there's NokNok, a microservices platform; the BLOCKPOS/ECOM/QSR/DailyBook suite I built at EraTech; a clinic management system; and a handful of others. You can filter them by category below if you're looking for something specific.",
    target: "#projects"
  },
  {
    id: "techstack",
    keywords: ["tech stack", "technical skill", "technolog", "language", "framework", "stack"],
    question: "Technical Skills",
    answer:
      "On the backend I mostly work in .NET — ASP.NET Core, ABP Framework, EF Core, gRPC and REST APIs. For frontend it's Angular and React with TypeScript. SQL Server and MongoDB cover the database side, Docker and CI/CD handle deployment, and more recently I've been building out AI engineering skills: Agentic AI, MCP servers, LLM integration, RAG, and prompt engineering.",
    target: "#skills"
  },
  {
    id: "experience",
    keywords: ["experience", "years", "how long", "senior", "work experience"],
    question: "Work experience",
    answer:
      "I've been working professionally for about 6 years now. I'm currently a Senior Software Engineer at Cedar Financial, based in Lahore, Pakistan.",
    target: "#experience"
  },
  {
    id: "resume",
    keywords: ["resume", "cv", "download"],
    question: "Download Resume",
    answer: "Sure, I'll start the download for you now. You can also grab it anytime from the Contact section below.",
    target: "#contact",
    action: "resume"
  },
  {
    id: "contact",
    keywords: ["contact", "email", "reach", "hire you", "get in touch", "whatsapp", "phone"],
    question: "Contact Me",
    answer:
      "You can reach me at saifighourii000@gmail.com, or call/WhatsApp me at +92 324 970 5067. I'm also on LinkedIn (saif-ul-rehman777) and GitHub (saifii007) if you'd rather connect there.",
    target: "#contact"
  },
  {
    id: "strongest",
    keywords: ["strongest skill", "best at", "expert", "specialize", "specialty"],
    question: "What's your strongest skill?",
    answer:
      "Probably system architecture and the broader .NET ecosystem — that's where I've spent the most time and it shows in how LinkedIn ranks my skills too. Angular is right up there as well, and lately Model Context Protocol and AI-driven engineering have become a real strength.",
    target: "#skills"
  },
  {
    id: "azure-devops",
    keywords: ["azure", "devops", "cloud", "docker", "ci/cd", "cicd"],
    question: "Azure & DevOps Experience",
    answer:
      "My DevOps toolkit is mostly Docker, Redis, Git, and CI/CD pipelines. I haven't worked with Azure directly yet, so I'd rather be upfront about that than oversell it.",
    target: "#skills"
  },
  {
    id: "backend-filter",
    keywords: ["backend project", "backend work", ".net project"],
    question: "Backend-focused projects",
    answer:
      "NokNok and BLOCKPOS are probably the best examples — both are .NET-based, multi-tenant SaaS systems with a lot of backend depth. Filter the Projects grid by \"Enterprise\" and you'll find them.",
    target: "#projects"
  },
  {
    id: "frontend-filter",
    keywords: ["frontend project", "frontend work", "angular project", "react project", "ui project"],
    question: "Frontend-focused projects",
    answer:
      "My early work at Sizdom Technologies was frontend-first, using Angular and React. The Inventory Management System and ConsumerPortal are both React dashboards if you want to see more recent examples — the \"Web Design\" filter on Projects will surface a few more too.",
    target: "#projects"
  },
  {
    id: "microservices",
    keywords: ["microservice", "architecture project", "clean architecture", "cqrs"],
    question: "Architecture Projects",
    answer:
      "NokNok is my main architecture-focused project — a .NET microservices platform built with Clean Architecture, distributed systems patterns, and secure API integrations. Depending on what a project needs, I also work with CQRS, multi-tenant SaaS designs, and plain old monoliths — whatever actually fits the problem.",
    target: "#projects"
  },
  {
    id: "location",
    keywords: ["location", "based", "where are you", "city", "country"],
    question: "Where are you located?",
    answer: "I'm based in Lahore, Punjab, Pakistan.",
    target: "#contact"
  },
  {
    id: "availability",
    keywords: ["available", "freelance", "full-time", "full time", "hire", "open to work"],
    question: "Freelance or full-time availability",
    answer:
      "Yes to both, actually. I'm open to full-time roles — on-site, hybrid, or remote — and I also take on select freelance work like custom software development, SaaS builds, database work, and general web development.",
    target: "#profile"
  },
  {
    id: "certifications",
    keywords: ["certificat", "certified", "credential"],
    question: "Certifications",
    answer:
      "I completed \"Introduction to Data Analytics\" through SkillUp by Simplilearn. I'm planning to add a few more certifications soon, so check back if that matters to you.",
    target: "#certifications"
  },
  {
    id: "education",
    keywords: ["education", "degree", "university", "college", "graduat"],
    question: "Education",
    answer: "I have a Bachelor's degree in Information Technology from the University of the Punjab.",
    target: "#education"
  },
  {
    id: "links",
    keywords: ["github", "linkedin", "link", "profile url", "social"],
    question: "GitHub / LinkedIn shortcuts",
    answer:
      "I'm at github.com/saifii007 on GitHub — the ANGUNET repo lives at github.com/saifii007/angunet specifically. On LinkedIn I'm saif-ul-rehman777.",
    target: "#contact"
  }
];

const CHAT_FALLBACK =
  "I don't have an answer for that yet. Try asking about Projects, Experience, Skills, Resume, or Contact.";

const CHAT_SUGGESTIONS = [
  "What projects have you built?",
  "What's your tech stack?",
  "Are you available for freelance?",
  "How can I contact you?"
];

/* ------------------------------------------------------------------ */
/* AI Portfolio Explorer — the morphing input+response component that  */
/* replaces a traditional chat UI. Each topic pairs a natural-language */
/* explanation with real metrics and (where relevant) real project     */
/* cards pulled from PROJECTS. Order here is chip/render order.        */
/* ------------------------------------------------------------------ */
const EXPLORER_TOPIC_ORDER = ["projects", "experience", "skills", "architecture", "ai", "resume", "contact", "webview"];

const EXPLORER_EXAMPLES = [
  "Show enterprise projects…",
  "Tell me about ANGUNET…",
  "Open resume…",
  "What AI projects have you built?",
  "Show .NET experience…"
];

const EXPLORER_TOPICS = {
  projects: {
    title: "Projects",
    icon: "🚀",
    color: "#f59e0b",
    keywords: ["project", "portfolio", "built", "angunet", "noknok", "blockpos", "enterprise project", "show project"],
    explanation:
      "17 real projects, each with a real screenshot. The flagship is ANGUNET, my open-source Angular + .NET starter with an MCP server. Beyond that there's NokNok (microservices), the BLOCKPOS/ECOM/QSR/DailyBook suite from EraTech, a clinic management system, and a handful of others across enterprise, web, and software-development categories.",
    metrics: [
      { value: "17", label: "Real Projects" },
      { value: "4", label: "Categories" },
      { value: "1", label: "Open Source" }
    ],
    projectIds: ["angunet", "noknok", "blockpos", "clinic", "ecom", "autoapply"],
    target: "#projects",
    followups: ["architecture", "experience", "contact"]
  },
  experience: {
    title: "Experience",
    icon: "💼",
    color: "#4f7cff",
    keywords: ["experience", "years", "how long", "senior", "compan", "employer", "work for", "worked at", "eratech", "solvefy", "cedar", "sizdom"],
    explanation:
      "6 years of professional experience. I'm currently a Senior Software Engineer at Cedar Financial. Before that: Solvefy, then EraTech for almost three years building POS and QSR systems, and I started out at Sizdom Technologies as a frontend developer. I've also done freelance work on the side — a clinic management system and a stock management system for a direct client.",
    metrics: [
      { value: "6+", label: "Years" },
      { value: "4", label: "Companies" },
      { value: "1", label: "Freelance Stint" }
    ],
    projectIds: [],
    target: "#experience",
    followups: ["projects", "skills", "resume"]
  },
  skills: {
    title: "Skills",
    icon: "⚡",
    color: "#22c55e",
    keywords: ["tech stack", "technical skill", "technolog", "language", "framework", "stack", "strongest skill", "best at"],
    explanation:
      "On the backend I mostly work in .NET — ASP.NET Core, ABP Framework, EF Core, gRPC and REST APIs. For frontend it's Angular and React with TypeScript. SQL Server and MongoDB cover the database side, Docker and CI/CD handle deployment, and more recently I've been building out AI engineering skills: Agentic AI, MCP servers, LLM integration, RAG, and prompt engineering.",
    metrics: [
      { value: "6", label: "Skill Categories" },
      { value: "25+", label: "Technologies" },
      { value: "3", label: "Proficiency Tiers" }
    ],
    projectIds: [],
    target: "#skills",
    followups: ["architecture", "ai", "projects"]
  },
  architecture: {
    title: "Architecture",
    icon: "🏗️",
    color: "#a855f7",
    keywords: ["architecture", "microservice", "clean architecture", "cqrs", "system design", "design pattern"],
    explanation:
      "NokNok is my main architecture-focused project — a .NET microservices platform built with Clean Architecture, distributed systems patterns, and secure API integrations. BLOCKPOS is the other deep example, running a multi-tenant SaaS architecture at scale. Depending on what a project needs, I also work with CQRS and plain monoliths — whatever actually fits the problem.",
    metrics: [
      { value: "3", label: "Architecture Styles" },
      { value: "2", label: "Deep-Dive Projects" },
      { value: "6+", label: "Years Applying Them" }
    ],
    projectIds: ["noknok", "blockpos"],
    target: "#projects",
    followups: ["projects", "ai", "skills"]
  },
  ai: {
    title: "AI Engineering",
    icon: "🤖",
    color: "#ec4899",
    keywords: ["ai", "agentic", "mcp", "model context protocol", "llm", "rag", "prompt engineering", "azure", "devops"],
    explanation:
      "This is where most of my recent energy has gone. ANGUNET ships with a real MCP server that exposes project context to AI tooling — that's the clearest example of my AI engineering work in production. Beyond that, I work with Agentic AI patterns, LLM integration, RAG, and prompt/token optimization, layered on top of the same .NET and Angular systems I already build.",
    metrics: [
      { value: "1", label: "MCP Server Shipped" },
      { value: "5", label: "AI Skill Areas" },
      { value: "2026", label: "Focus Started" }
    ],
    projectIds: ["angunet"],
    target: "#skills",
    followups: ["architecture", "projects", "skills"]
  },
  resume: {
    title: "Resume",
    icon: "📄",
    color: "#06b6d4",
    keywords: ["resume", "cv", "download"],
    explanation:
      "Here's a snapshot of what's on it: 6 years of experience, 17 shipped projects, and a core stack of .NET, Angular, React, SQL Server, and MongoDB. I'll start the download for you now — you can also grab it anytime from the Contact section.",
    metrics: [
      { value: "6+", label: "Years Experience" },
      { value: "17", label: "Projects" },
      { value: "PDF", label: "Format" }
    ],
    projectIds: [],
    target: "#contact",
    action: "resume",
    followups: ["contact", "experience", "projects"]
  },
  contact: {
    title: "Contact",
    icon: "📬",
    color: "#f43f5e",
    keywords: ["contact", "email", "reach", "hire you", "get in touch", "whatsapp", "phone", "location", "based", "where are you", "available", "freelance", "full-time", "hire"],
    explanation:
      "I'm based in Lahore, Punjab, Pakistan, and open to work — on-site, hybrid, or remote — plus select freelance projects. You can reach me at saifighourii000@gmail.com, call or WhatsApp +92 324 970 5067, or find me on LinkedIn (saif-ul-rehman777) and GitHub (saifii007).",
    metrics: [
      { value: "Lahore", label: "Based In" },
      { value: "Remote", label: "Open To" },
      { value: "Freelance", label: "Also Available" }
    ],
    projectIds: [],
    target: "#contact",
    followups: ["resume", "projects", "experience"]
  },
  webview: {
    title: "Web View",
    icon: "🌐",
    color: "#14b8a6",
    keywords: ["web view", "full site", "browse site", "see everything", "show site"],
    action: "webview",
    target: "#intro"
  }
};
