export const projects = [
  {
    slug: "pulse",
    name: "PULSE",
    title: "Pulse — Incident Management & On-Call Orchestration",
    category: "Backend Engineering / Reliability Systems",
    repository: "https://github.com/santheesh73/PagerDuty",
    demo: null,
    description: [
      "Pulse is an incident management platform designed to handle alerts, automate on-call escalation, and coordinate incident response reliably.",
      "It combines database-enforced consistency, fault-tolerant background processing, and automated verification to support dependable incident operations.",
    ],
    features: [
      "Intelligent alert routing and deduplication.",
      "Automated escalation and on-call schedules.",
      "Reliable notification delivery.",
      "Incident acknowledgment and resolution.",
      "19 documented system invariants.",
      "Property-based and fault-injection testing.",
    ],
    stack: ["Python", "Django", "PostgreSQL", "Redis", "Celery", "React", "TypeScript", "Docker"],
    artwork:
      "A bronze signal-routing mechanism with synchronized concentric components. Multiple signals converge into one event.",
    problem:
      "Responders need a single incident record when repeated alerts, retries, and concurrent requests reach the system.",
    architecture: [
      "Alert ingestion",
      "Database consistency",
      "Escalation workers",
      "On-call workflow",
    ],
    detail:
      "The project documents 19 system invariants. Its testing strategy includes Hypothesis for on-call scheduling and seeded fault injection for recovery scenarios.",
  },
  {
    slug: "minchal",
    name: "MINCHAL",
    title: "MINCHAL — AI-Powered Energy Intelligence",
    category: "Generative AI / Sustainability",
    repository: "https://github.com/santheesh73/Minchal-deploy",
    demo: "https://minchal-deploy.vercel.app/",
    description: [
      "MINCHAL converts electricity bill photographs into personalized household energy audits without requiring additional monitoring hardware.",
      "The application uses Gemini Vision to extract bill information and a deterministic calculation engine to estimate appliance consumption and recommend energy-saving actions.",
    ],
    features: [
      "AI-powered electricity bill analysis.",
      "Appliance-level energy estimation.",
      "Explainable energy calculations.",
      "Personalized savings recommendations.",
      "Budget-aware efficiency planning.",
      "English and Tamil language support.",
      "Installable progressive web application.",
    ],
    stack: ["React", "TypeScript", "Vite", "Python", "FastAPI", "Google Gemini", "PWA"],
    artwork:
      "A bronze astronomical measuring instrument that represents energy analysis through calibrated rings and illuminated pathways.",
    problem:
      "Households receive aggregate energy bills with limited insight into which appliances drive consumption.",
    architecture: [
      "Bill photograph",
      "Gemini extraction",
      "Deterministic estimates",
      "Savings plan",
    ],
    detail:
      "Gemini extracts the bill fields. A deterministic calculation engine estimates appliance consumption.",
  },
  {
    slug: "orion",
    name: "ORION",
    title: "Orion — Privacy-First On-Device AI",
    category: "On-Device AI / Privacy Engineering",
    repository: "https://github.com/santheesh73/Orion",
    demo: null,
    description: [
      "Orion is an offline-first AI assistant that runs language models directly inside the browser.",
      "It eliminates the need for cloud inference by using WebLLM and WebGPU, allowing conversations and document analysis to remain local to the user's device.",
    ],
    features: [
      "Browser-native AI inference.",
      "Offline AI conversations.",
      "Private document intelligence.",
      "Local document search.",
      "IndexedDB-based storage.",
      "Background Web Worker processing.",
      "Zero cloud inference and telemetry.",
    ],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "WebLLM", "WebGPU", "IndexedDB"],
    artwork: "An enclosed geometric intelligence core within a protected observatory structure.",
    problem:
      "Cloud inference can expose private conversation and document data, and requires a network connection.",
    architecture: ["Browser interface", "Web Worker", "WebLLM and WebGPU", "IndexedDB"],
    detail:
      "The assistant uses WebGPU for browser-based inference and IndexedDB for local persistence.",
  },
  {
    slug: "claimpilot",
    name: "CLAIMPILOT",
    title: "ClaimPilot — AI-Powered Insurance Appeal Agent",
    category: "Agentic AI / InsurTech",
    repository: "https://github.com/santheesh73/Agentic-AI-hack-ClaimPilot",
    demo: null,
    description: [
      "ClaimPilot helps users understand rejected health insurance claims and prepare evidence-backed appeal letters.",
      "The system analyzes rejection documents, retrieves relevant insurance policy clauses, evaluates appeal strength, and verifies generated citations using deterministic checks.",
    ],
    features: [
      "Insurance claim rejection analysis.",
      "Policy document retrieval.",
      "Six-check evaluation framework.",
      "Deterministic appeal verdict generation.",
      "Evidence-backed appeal drafting.",
      "Automated citation verification.",
      "Escalation deadline guidance.",
    ],
    stack: ["Next.js", "TypeScript", "Google Gemini", "Supabase", "PostgreSQL"],
    artwork:
      "An ancient document archive with layered evidence surfaces and illuminated connections.",
    problem:
      "Users need to connect a claim rejection to the relevant policy clauses before drafting an appeal.",
    architecture: [
      "Rejection document",
      "Policy retrieval",
      "Six-check evaluation",
      "Cited appeal",
    ],
    detail: "The appeal workflow checks generated citations against retrieved policy evidence.",
  },
  {
    slug: "ignition",
    name: "IGNITION",
    title: "Ignition — Multi-Agent AI Code Review",
    category: "Agentic AI / Developer Tools",
    repository: "https://github.com/santheesh73/Ignition",
    demo: null,
    description: [
      "Ignition is a multi-agent pull request review system that uses specialized AI agents to inspect software changes.",
      "It coordinates architecture, logic, and security analysis while independently verifying findings against the actual codebase.",
    ],
    features: [
      "Multi-agent pull request analysis.",
      "Architecture and logic inspection.",
      "Security and dependency auditing.",
      "Deterministic pre-review checks.",
      "Evidence-based finding verification.",
      "Human-in-the-loop approval.",
      "Suggested code patches.",
    ],
    stack: [
      "Python",
      "FastAPI",
      "LangGraph",
      "TypeScript",
      "Bun",
      "ts-morph",
      "Supabase",
      "pgvector",
    ],
    artwork:
      "Three interconnected precision instruments converging around a central verification artifact.",
    problem:
      "Reviewers need to distinguish actionable findings from speculative or unsupported comments.",
    architecture: [
      "Pull request",
      "Pre-review checks",
      "Specialist reviewers",
      "Source verification",
    ],
    detail:
      "Specialist agents inspect architecture, logic, and security. Findings go through a separate verification step.",
  },
  {
    slug: "codesentra",
    name: "CODESENTRA",
    title: "CodeSentra — Software Intelligence & Health Monitoring",
    category: "Developer Tools / DevOps",
    repository: "https://github.com/santheesh73/Code-Sentra",
    demo: null,
    description: [
      "CodeSentra is a software intelligence platform that combines source-code analysis, deployment monitoring, and evidence-backed issue diagnosis.",
      "It helps developers understand project health, identify failures, and trace problems to actionable code-level fixes.",
    ],
    features: [
      "Repository architecture analysis.",
      "Automated codebase and build checks.",
      "Deployment availability monitoring.",
      "Dependency and security analysis.",
      "Source-level issue tracing.",
      "Evidence-backed technical reports.",
      "GitHub pull request integration.",
      "Automated monitoring and alerts.",
    ],
    stack: ["TypeScript", "Node.js", "Docker", "GitHub Integrations", "CLI Tooling"],
    artwork:
      "An architectural blueprint becomes a spatial engineering network with animated diagnostic connections.",
    problem:
      "Deployment signals and source-code findings often live in different tools, making it harder to trace failures.",
    architecture: [
      "Repository intake",
      "Build and deployment checks",
      "Source tracing",
      "Technical report",
    ],
    detail:
      "The platform links diagnostic evidence to source locations and integrates with GitHub pull requests.",
  },
  {
    slug: "frontend-craft",
    name: "FRONTEND CRAFT",
    title: "Frontend Craft — AI Frontend Engineering Toolkit",
    category: "Open Source / AI Developer Tools",
    repository: "https://github.com/santheesh73/CraftLyst",
    demo: null,
    description: [
      "Frontend Craft is an open-source engineering toolkit that helps AI coding agents produce consistent, accessible, and verifiable frontend interfaces.",
      "It combines persistent design contracts, automated design-quality checks, and evidence-based evaluation workflows.",
    ],
    features: [
      "Repository-level design contracts.",
      "AI coding-agent integration.",
      "20 automated Slop Lint rules.",
      "Accessibility checks.",
      "Responsive interface validation.",
      "Design token verification.",
      "Automated UI evaluation.",
      "Multi-agent installation support.",
    ],
    stack: ["TypeScript", "JavaScript", "Node.js", "Playwright", "axe-core"],
    artwork:
      "Rough geometric fragments align into a refined architectural interface through visible structural guides.",
    problem:
      "AI-assisted frontend changes need repeatable checks for accessibility, design consistency, and layout.",
    architecture: ["Design contract", "Agent implementation", "Quality checks", "Browser evidence"],
    detail:
      "The Craft command-line toolkit ships 20 Slop Lint rules and uses Playwright and axe-core for browser and accessibility audits.",
  },
] as const;

export type Project = (typeof projects)[number];
