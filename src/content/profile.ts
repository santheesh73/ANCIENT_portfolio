export const profile = {
  name: "Santheesh S",
  role: "AI Software Engineer · Full-Stack Developer · Generative AI Enthusiast",
  email: "santheesh737@gmail.com",
  github: "https://github.com/santheesh73",
  linkedin: "https://www.linkedin.com/in/santheesh-s-b154b1384/",
  location: "Tiruppur, Tamil Nadu, India",
  degree: "B.Tech — Artificial Intelligence and Data Science",
  institute: "Sri Shakthi Institute of Engineering and Technology",
  graduation: 2029,
  bio: [
    "I'm Santheesh S, an AI Software Engineer and Full-Stack Developer pursuing a B.Tech in Artificial Intelligence and Data Science at Sri Shakthi Institute of Engineering and Technology.",
    "I build AI-powered applications, autonomous agents, intelligent developer tools, and full-stack software products. My work focuses on combining generative AI with deterministic engineering to create reliable, explainable, and practical systems.",
  ],
} as const;

export const skills = {
  Languages: "Python, TypeScript, JavaScript, SQL, HTML, CSS",
  Frontend: "React, Next.js, Tailwind CSS, Vite, PWA",
  Backend: "FastAPI, Django, Node.js, REST APIs, Celery",
  "AI & ML": "LLMs, Generative AI, AI Agents, RAG, Multimodal AI, Google Gemini, WebLLM, WebGPU",
  Databases: "PostgreSQL, Supabase, MongoDB, Redis, SQLite, IndexedDB, pgvector",
  Tools: "Git, GitHub, Docker, Vercel, Render, LangGraph, Playwright, Pytest",
};

export const stages = [
  { name: "Input", description: "Unstructured signals enter the mechanism." },
  {
    name: "Understand",
    description: "The mechanism moves incoming information into a structured form.",
  },
  { name: "Verify", description: "The rings align to represent deterministic validation." },
  { name: "Decide", description: "The central core settles into a stable output." },
] as const;
