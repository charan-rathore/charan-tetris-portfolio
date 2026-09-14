import type { PieceName } from "../components/tetris/types";

export type TechItem = {
  name: string;
  href: string;
  logo?: string;
};

export type Project = {
  piece: PieceName;
  label: string;
  title: string;
  copy: string;
  image: string;
  imageAlt: string;
  metrics?: string[];
  tech: TechItem[];
  github?: string;
  live?: string;
  featured?: boolean;
};

const TECH_DOCS: Record<string, TechItem> = {
  Python: { name: "Python", href: "https://docs.python.org/3/", logo: "python.svg" },
  FastAPI: {
    name: "FastAPI",
    href: "https://fastapi.tiangolo.com/",
    logo: "fastapi.svg",
  },
  Celery: {
    name: "Celery",
    href: "https://docs.celeryq.dev/en/stable/",
    logo: "celery.svg",
  },
  PostgreSQL: {
    name: "PostgreSQL",
    href: "https://www.postgresql.org/docs/",
    logo: "postgresql.svg",
  },
  Redis: { name: "Redis", href: "https://redis.io/docs/", logo: "redis.svg" },
  ChromaDB: {
    name: "ChromaDB",
    href: "https://docs.trychroma.com/",
    logo: "chroma.svg",
  },
  Ollama: {
    name: "Ollama",
    href: "https://github.com/ollama/ollama/tree/main/docs",
    logo: "ollama.svg",
  },
  TypeScript: {
    name: "TypeScript",
    href: "https://www.typescriptlang.org/docs/",
    logo: "typescript.svg",
  },
  "Next.js": {
    name: "Next.js",
    href: "https://nextjs.org/docs",
    logo: "nextdotjs.svg",
  },
  "Unlayer Elements": {
    name: "Unlayer Elements",
    href: "https://docs.unlayer.com/",
  },
  "pdf.js": {
    name: "pdf.js",
    href: "https://mozilla.github.io/pdf.js/",
    logo: "mozilla.svg",
  },
  React: { name: "React", href: "https://react.dev/", logo: "react.svg" },
  MLflow: {
    name: "MLflow",
    href: "https://mlflow.org/docs/latest/index.html",
    logo: "mlflow.svg",
  },
  LightGBM: {
    name: "LightGBM",
    href: "https://lightgbm.readthedocs.io/",
    logo: "lightgbm.svg",
  },
  IoT: {
    name: "IoT",
    href: "https://www.raspberrypi.com/documentation/",
    logo: "raspberrypi.svg",
  },
  Tailwind: {
    name: "Tailwind",
    href: "https://tailwindcss.com/docs",
    logo: "tailwindcss.svg",
  },
  LangChain: {
    name: "LangChain",
    href: "https://python.langchain.com/docs/",
    logo: "langchain.svg",
  },
  "Multi-Agent": {
    name: "Multi-Agent",
    href: "https://langchain-ai.github.io/langgraph/",
    logo: "langchain.svg",
  },
  NLP: {
    name: "NLP",
    href: "https://www.nltk.org/",
  },
  YOLOv8: {
    name: "YOLOv8",
    href: "https://docs.ultralytics.com/",
    logo: "ultralytics.svg",
  },
  PyTorch: {
    name: "PyTorch",
    href: "https://pytorch.org/docs/stable/index.html",
    logo: "pytorch.svg",
  },
  "Fusion 360 API": {
    name: "Fusion 360 API",
    href: "https://help.autodesk.com/view/fusion360/ENU/?guid=GUID-A92A4B10-381C-42F5-8379-4C063B9B9A5A",
  },
  "Deep Learning": {
    name: "Deep Learning",
    href: "https://pytorch.org/tutorials/",
    logo: "pytorch.svg",
  },
};

function tech(...names: string[]): TechItem[] {
  return names.map((name) => TECH_DOCS[name] ?? { name, href: "#" });
}

export const projects: Project[] = [
  {
    piece: "T",
    label: "FLAGSHIP · RAG PLATFORM",
    title: "IntelliRAG",
    copy: "I wanted to know where RAG actually breaks. Ingestion → chunking → hybrid retrieval → rerank → citations → eval, built to measure failure modes honestly, not to claim production SOTA.",
    image: "/projects/cosmic/intellirag.webp",
    imageAlt: "Scattered documents resolving through a Tetris-shaped knowledge block",
    metrics: [
      "12 PHASES SHIPPED",
      "100+ TESTS",
      "HYBRID MRR 1.0",
      "RERANK +12.5%",
      "E2E P95 12.6MS",
    ],
    tech: tech(
      "Python",
      "FastAPI",
      "Celery",
      "PostgreSQL",
      "Redis",
      "ChromaDB",
      "Ollama",
    ),
    github: "https://github.com/charan-rathore/IntelliRAG",
    live: "https://intellirag-live-own-track.vercel.app/",
    featured: true,
  },
  {
    piece: "I",
    label: "MEMORY ENGINE · LIVE",
    title: "memoRABLE",
    copy: "What if documents became memory? Six source-linked blocks: click one and the original lines light up, then publish to email, web, or doc without rewriting the truth.",
    image: "/projects/cosmic/memorable.webp",
    imageAlt: "An open book connecting to floating Tetris memory tiles",
    tech: tech("TypeScript", "Next.js", "Unlayer Elements", "pdf.js"),
    github: "https://github.com/charan-rathore/memoRABLE",
    live: "https://memo-rable.vercel.app",
  },
  {
    piece: "O",
    label: "IOT + ML · LIVE",
    title: "ThermoSense",
    copy: "Can a forecast know your rooftop? Ground truth, API bias correction, ensemble models, and a public leaderboard. The product is the closed loop, not the model name.",
    image: "/projects/cosmic/thermosense.webp",
    imageAlt: "A weather mast on a small Tetris island",
    tech: tech("Python", "FastAPI", "React", "MLflow", "LightGBM", "IoT"),
    github: "https://github.com/charan-rathore/Time-Series-Temperature-Modelling",
    live: "https://thermosense-black.vercel.app",
  },
  {
    piece: "S",
    label: "FULL-STACK · LIVE",
    title: "Project Management Tool",
    copy: "Kanban with drag-and-drop tasks, team collaboration, and live updates. A small TypeScript stack that still has to feel fast when people fight over the board.",
    image: "/projects/cosmic/kanban.webp",
    imageAlt: "People fitting Tetris pieces into an organized project board",
    tech: tech("TypeScript", "React", "Next.js", "Tailwind"),
    github: "https://github.com/charan-rathore/project-management-tool",
    live: "https://project-management-tool-nine-zeta.vercel.app",
  },
  {
    piece: "J",
    label: "MULTI-AGENT AI",
    title: "Agentic Finance Advisor",
    copy: "Can an AI answer also explain how much it should be trusted? Multi-agent research with freshness, source agreement, and a confidence score you can inspect.",
    image: "/projects/cosmic/finance.webp",
    imageAlt: "Geometric observers studying a financial signal",
    tech: tech("Python", "LangChain", "Multi-Agent", "NLP"),
    github: "https://github.com/charan-rathore/agentic-finance-advisor",
  },
  {
    piece: "Z",
    label: "COMPUTER VISION",
    title: "Drone Wildlife Detection",
    copy: "YOLOv8 on drone footage for blackbuck detection. Applied vision for conservation, not another toy detector notebook.",
    image: "/projects/cosmic/wildlife.webp",
    imageAlt: "A geometric drone observing a blackbuck in sparse grassland",
    tech: tech("Python", "YOLOv8", "PyTorch"),
    github: "https://github.com/charan-rathore/Object-detection-from-drone-captured-videos",
  },
  {
    piece: "L",
    label: "CAD AUTOMATION",
    title: "3D Bolt Dataset Automation",
    copy: "1,000+ labeled STL bolts via the Fusion 360 API. Parametric generation to classification-ready data, because CAD ML starts with boring, correct labels.",
    image: "/projects/cosmic/cad.webp",
    imageAlt: "An exploded modular bolt drawing with geometric construction lines",
    tech: tech("Python", "Fusion 360 API", "Deep Learning"),
    github: "https://github.com/charan-rathore/Automation-of-3D-Bolt-Dataset",
  },
];

export const experience = [
  {
    period: "NOW",
    role: "Analyst",
    place: "MiQ",
    copy: "Working across MENA markets.",
    piece: "T" as PieceName,
  },
  {
    period: "JAN · JUN 2026",
    role: "Product Analyst Intern",
    place: "Flipkart",
    copy: "Seller funnel analytics on the search personalization team. Pipelines and dashboards turning behavior into product decisions across millions of daily searches.",
    piece: "I" as PieceName,
  },
  {
    period: "2024 · NOW",
    role: "Independent AI Systems Builder",
    place: "Personal Projects",
    copy: "Production-grade systems from first principles: RAG, multi-agent AI, computer vision, quantitative finance. Documented tradeoffs, measured failure modes.",
    piece: "O" as PieceName,
  },
];

export const RESUME_URL =
  "https://drive.google.com/file/d/1vjBP8P8sgW30tyGk3gxGDrOI_ZUInl6u/view?usp=drive_link";

export const TECH_LOGOS: {
  name: string;
  file: string;
  piece: PieceName;
  href: string;
  /** Original mark is near-black; lift visibility on dark UI without editing the SVG. */
  lit?: boolean;
}[] = [
  { name: "Python", file: "python.svg", piece: "T", href: TECH_DOCS.Python.href },
  {
    name: "TypeScript",
    file: "typescript.svg",
    piece: "I",
    href: TECH_DOCS.TypeScript.href,
  },
  { name: "Next.js", file: "nextdotjs.svg", piece: "O", href: TECH_DOCS["Next.js"].href },
  { name: "React", file: "react.svg", piece: "S", href: TECH_DOCS.React.href },
  {
    name: "Three.js",
    file: "threedotjs.svg",
    piece: "Z",
    href: "https://threejs.org/docs/",
    lit: true,
  },
  { name: "FastAPI", file: "fastapi.svg", piece: "J", href: TECH_DOCS.FastAPI.href },
  {
    name: "PostgreSQL",
    file: "postgresql.svg",
    piece: "L",
    href: TECH_DOCS.PostgreSQL.href,
  },
  { name: "Redis", file: "redis.svg", piece: "T", href: TECH_DOCS.Redis.href },
  { name: "PyTorch", file: "pytorch.svg", piece: "I", href: TECH_DOCS.PyTorch.href },
  {
    name: "scikit-learn",
    file: "scikitlearn.svg",
    piece: "O",
    href: "https://scikit-learn.org/stable/",
  },
  {
    name: "Jupyter",
    file: "jupyter.svg",
    piece: "S",
    href: "https://docs.jupyter.org/",
  },
  {
    name: "LangChain",
    file: "langchain.svg",
    piece: "Z",
    href: TECH_DOCS.LangChain.href,
    lit: true,
  },
  {
    name: "Tailwind",
    file: "tailwindcss.svg",
    piece: "J",
    href: TECH_DOCS.Tailwind.href,
  },
  {
    name: "Docker",
    file: "docker.svg",
    piece: "L",
    href: "https://docs.docker.com/",
  },
  {
    name: "Vercel",
    file: "vercel.svg",
    piece: "T",
    href: "https://vercel.com/docs",
  },
  { name: "Git", file: "git.svg", piece: "I", href: "https://git-scm.com/doc" },
];

