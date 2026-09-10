"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ThinkingField } from "./hero/ThinkingField";
import { ConversationStarter } from "./ConversationStarter";
import { McpHero } from "./hero/McpHero";
import { GitHubPulse } from "./GitHubPulse";
import { sfx } from "./tetris/audio";
import { ProjectGameplay } from "./ProjectGameplay";
import { ProjectLevel } from "./ProjectLevel";
import { ContactForm } from "./ContactForm";
import { GamePanel } from "./tetris/GamePanel";
import { INTEL, useUnlockedIntel } from "./tetris/intel";
import { PIECES, PieceName } from "./tetris/types";

type TechItem = {
  name: string;
  href: string;
  logo?: string;
};

type Project = {
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

const projects: Project[] = [
  {
    piece: "T",
    label: "FLAGSHIP · RAG PLATFORM",
    title: "IntelliRAG",
    copy: "I wanted to know where RAG actually breaks. Ingestion → chunking → hybrid retrieval → rerank → citations → eval, built to measure failure modes honestly, not to claim production SOTA.",
    image: "/projects/tetris-art/intellirag.png",
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
    image: "/projects/tetris-art/memorable.png",
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
    image: "/projects/tetris-art/thermosense.png",
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
    image: "/projects/tetris-art/kanban.png",
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
    image: "/projects/tetris-art/finance.png",
    imageAlt: "Geometric observers studying a financial signal",
    tech: tech("Python", "LangChain", "Multi-Agent", "NLP"),
    github: "https://github.com/charan-rathore/agentic-finance-advisor",
  },
  {
    piece: "Z",
    label: "COMPUTER VISION",
    title: "Drone Wildlife Detection",
    copy: "YOLOv8 on drone footage for blackbuck detection. Applied vision for conservation, not another toy detector notebook.",
    image: "/projects/tetris-art/wildlife.png",
    imageAlt: "A geometric drone observing a blackbuck in sparse grassland",
    tech: tech("Python", "YOLOv8", "PyTorch"),
    github: "https://github.com/charan-rathore/Object-detection-from-drone-captured-videos",
  },
  {
    piece: "L",
    label: "CAD AUTOMATION",
    title: "3D Bolt Dataset Automation",
    copy: "1,000+ labeled STL bolts via the Fusion 360 API. Parametric generation to classification-ready data, because CAD ML starts with boring, correct labels.",
    image: "/projects/tetris-art/cad.png",
    imageAlt: "An exploded modular bolt drawing with geometric construction lines",
    tech: tech("Python", "Fusion 360 API", "Deep Learning"),
    github: "https://github.com/charan-rathore/Automation-of-3D-Bolt-Dataset",
  },
];

const experience = [
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

const RESUME_URL =
  "https://drive.google.com/file/d/1vjBP8P8sgW30tyGk3gxGDrOI_ZUInl6u/view?usp=drive_link";

const TECH_LOGOS: {
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

function PieceGlyph({ name }: { name: PieceName }) {
  const cells = PIECES[name].rotations[0];
  const minX = Math.min(...cells.map(([x]) => x));
  const minY = Math.min(...cells.map(([, y]) => y));
  const width = Math.max(...cells.map(([x]) => x)) - minX + 1;
  const height = Math.max(...cells.map(([, y]) => y)) - minY + 1;
  const filled = new Set(cells.map(([x, y]) => `${x - minX},${y - minY}`));
  return (
    <div
      className="piece-glyph"
      style={{ gridTemplateColumns: `repeat(${width}, 8px)` }}
      aria-hidden="true"
    >
      {Array.from({ length: width * height }, (_, index) => {
        const x = index % width;
        const y = Math.floor(index / width);
        return (
          <i
            key={index}
            style={
              filled.has(`${x},${y}`)
                ? { background: PIECES[name].color }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

function playUi() {
  sfx.unlock();
  sfx.ui();
}

function TechMarquee() {
  const loop = [...TECH_LOGOS, ...TECH_LOGOS];
  return (
    <div className="tech-marquee" aria-label="Tech stack logos">
      <div className="tech-marquee-track">
        {loop.map((item, index) => (
          <a
            className="tech-chip is-logo"
            key={`${item.name}-${index}`}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            title={`${item.name} docs`}
            style={{ "--piece": PIECES[item.piece].color } as React.CSSProperties}
            onClick={() => playUi()}
          >
            <div className="tech-chip-block" aria-hidden="true">
              <PieceGlyph name={item.piece} />
            </div>
            <Image
              src={`/logos/${item.file}`}
              alt=""
              width={28}
              height={28}
              className={`tech-logo${item.lit ? " is-lit" : ""}`}
              loading="lazy"
            />
            <span className="sr-only">{item.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function scrollToId(id: string) {
  playUi();
  const target = document.getElementById(id);
  const drawer = target?.closest("details");
  if (drawer) drawer.open = true;
  target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

export function Portfolio() {
  const [time, setTime] = useState("");
  const [activeSection, setActiveSection] = useState("");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const line = innerHeight * .35;
      const ids = ["work", "about", "contact"];
      let active = "";
      for (const id of ids) { const node = document.getElementById(id); if (node && node.getBoundingClientRect().top <= line) active = id; }
      const play = document.getElementById("play");
      if (play?.closest("details")?.open) { const bounds = play.getBoundingClientRect(); if (bounds.top <= line && bounds.bottom > line) active = "play"; }
      setActiveSection(active); frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule(); window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);
    return () => {cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);};
  }, []);
  const unlocked = useUnlockedIntel();
  const lockedChannels = INTEL.filter(
    (item) => item.href && !item.href.startsWith("mailto:") && !unlocked.has(item.id),
  ).length;

  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }).format(new Date()),
      );
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main>
      <a className="skip-link" href="#work">Skip to projects</a>
      <div className="scanlines" aria-hidden="true" />

      <header className="site-header">
        <button
          type="button"
          className="wordmark pixel"
          onClick={() => {
            playUi();
            window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
          }}
          aria-label="Back to top"
        >
          CR
        </button>
        <nav aria-label="Primary">
          <button type="button" aria-current={activeSection === "play" ? "location" : undefined} onClick={() => { setActiveSection("play"); scrollToId("play"); }}>
            PLAY
          </button>
          <button type="button" aria-current={activeSection === "work" ? "location" : undefined} onClick={() => { setActiveSection("work"); scrollToId("work"); }}>
            WORK
          </button>
          <button type="button" aria-current={activeSection === "about" ? "location" : undefined} onClick={() => { setActiveSection("about"); scrollToId("about"); }}>
            ABOUT
          </button>
          <button type="button" aria-current={activeSection === "contact" ? "location" : undefined} onClick={() => { setActiveSection("contact"); scrollToId("contact"); }}>
            CONTACT
          </button>
        </nav>
        <div className="header-meta">
          <a
            className="status-chip"
            href="mailto:ra7hore.charan@gmail.com"
            onClick={() => playUi()}
          >
            <i />
            ANALYST @ MiQ · MENA
          </a>
          <span className="clock">{time || "--:--"} IST</span>
        </div>
      </header>

      <section className="hero hero--mcp" id="top">
        <McpHero />
        <div className="hero-content">
          <ThinkingField />
          <span className="pixel-label">
            PLAYER 1 &gt; SYSTRIS : TETRIS WITH SYSTEMS
          </span>
          <h1>
            <span className="sr-only">Charan Rathore · </span>
            I am the MCP between Charan and the world
          </h1>
          <p className="hero-intro">A little context. A lot of curiosity. Connecting ideas to systems, data to decisions, and people to what comes next.</p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => scrollToId("work")}
            >
              ▶ BUILD THE STACK
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => scrollToId("work")}
            >
              EXPLORE PROJECTS ↓
            </button>
          </div>
        </div>

      </section>

      <TechMarquee />

      <section className="work-section" id="work">
        <div className="stage-heading">
          <span className="pixel-label accent-cyan">STAGE 02 · THE PROJECT STACK</span>
          <h2>Watch the work fall into place.</h2>
          <p>Seven projects. Seven pieces. Scroll to build the stack — every project opens automatically.</p>
        </div>

        <div className="campaign-strip"><span className="pixel-label accent-cyan">AUTO PLAY · 7 LEVELS</span><span>Scroll to advance ↓</span><a href="#bonus-game" onClick={() => scrollToId("play")}>PLAY FOR BONUS INTEL ↗</a></div>
        <details className="bonus-game" id="bonus-game">
          <summary><span className="pixel-label">+ BONUS ROUND</span><span>Take the controls. Unlock the personal side quests.</span><b>PLAY ↗</b></summary>
          <GamePanel />
        </details>
        <div className="project-grid">
          {projects.map((project, index) => (
            <ProjectLevel key={project.title} index={index} piece={project.piece} featured={project.featured}>
              <div className="project-media">
                <Image
                  src={project.image}
                  alt={project.imageAlt}
                  fill
                  sizes="(max-width: 820px) 100vw, 50vw"
                  className="project-photo"
                />
                <ProjectGameplay level={index} title={project.title} systems={project.tech} />
              </div>
              <div className="project-top">
                <PieceGlyph name={project.piece} />
                <span className="pixel-label">{project.label}</span>
              </div>
              <h3>{project.title}</h3>
              <p>{project.copy}</p>
              {project.metrics && (
                <ul className="project-metrics">
                  {project.metrics.map((metric) => (
                    <li key={metric}>{metric}</li>
                  ))}
                </ul>
              )}
              <div className="project-tech">
                {project.tech.map((item) => (
                  <a
                    key={item.name}
                    className="project-tech-chip"
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => playUi()}
                    title={`${item.name} docs`}
                  >
                    {item.logo ? (
                      <Image
                        src={`/logos/${item.logo}`}
                        alt=""
                        width={14}
                        height={14}
                        className={`project-tech-logo${
                          item.logo === "langchain.svg" ||
                          item.logo === "mozilla.svg" ||
                          item.logo === "threedotjs.svg"
                            ? " is-lit"
                            : ""
                        }`}
                        loading="lazy"
                      />
                    ) : (
                      <span className="project-tech-dot" aria-hidden="true" />
                    )}
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="project-links">
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => playUi()}
                  >
                    LIVE ↗
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => playUi()}
                  >
                    GITHUB ↗
                  </a>
                )}
              </div>
            </ProjectLevel>
          ))}
          <ConversationStarter compact />
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="stage-heading">
          <span className="pixel-label accent-purple">STAGE 03 · PLAYER STATS</span>
          <h2>One commit. Another block.</h2>
          <p>
            The board keeps growing. Explore the daily stack, language pieces, and the next repositories in the queue.
          </p>
        </div>

        <div className="about-grid about-grid-live">
          <div className="about-copy">
            <p className="about-lead">
              I really love designing systems that love me back :)
            </p>
            <blockquote>
              “Most tutorials show you how to call an API. I want to understand
              how to build the infrastructure that makes AI work reliably at
              scale.”
            </blockquote>
            <p>
              I care about correctness over convenience, documented tradeoffs
              over hand-waving, and systems that fail gracefully when things go
              wrong.
            </p>
          </div>

          <GitHubPulse />
        </div>

        <div className="xp-list">
          {experience.map((item) => (
            <a
              className="xp-row"
              key={item.role}
              href={RESUME_URL}
              target="_blank"
              rel="noreferrer"
              style={
                { "--piece": PIECES[item.piece].color } as React.CSSProperties
              }
              onClick={() => playUi()}
            >
              <div className="xp-meta">
                <PieceGlyph name={item.piece} />
                <span className="pixel-label">{item.period}</span>
              </div>
              <div className="xp-body">
                <h3>
                  {item.role} <em>/ {item.place}</em>
                </h3>
                <p>{item.copy}</p>
                <span className="xp-resume pixel-label">OPEN RESUME ↗</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <span className="pixel-label accent-yellow">STAGE 04 · CONTINUE?</span>
        <h2>
          INSERT COIN.
          <br />
          <span>LET’S BUILD SOMETHING.</span>
        </h2>
        <p>
          Product analytics, AI systems, or any technically interesting
          problem. Usually reply within 24 hours.
        </p>
        <a
          className="contact-cta contact-cta-mail"
          href="mailto:ra7hore.charan@gmail.com"
          onClick={() => playUi()}
        >
          <Image src="/logos/gmail.svg" alt="" width={22} height={22} />
          <span>ra7hore.charan@gmail.com</span>
          <b>↗</b>
        </a>
        <div className="contact-layout"><ConversationStarter /><ContactForm /></div>
        <div className="contact-links">
          <a
            className="contact-icon-link"
            href="https://github.com/charan-rathore"
            target="_blank"
            rel="noreferrer"
            onClick={() => playUi()}
            title="GitHub"
          >
            <Image src="/logos/github.svg" alt="GitHub" width={28} height={28} />
          </a>
          <a
            className="contact-icon-link"
            href="https://linkedin.com/in/charan-rathore"
            target="_blank"
            rel="noreferrer"
            onClick={() => playUi()}
            title="LinkedIn"
          >
            <Image
              src="/logos/linkedin.svg"
              alt="LinkedIn"
              width={28}
              height={28}
            />
          </a>
          {unlocked.has("substack") ? (
            <a
              className="contact-icon-link"
              href="https://substack.com/@charanrathore"
              target="_blank"
              rel="noreferrer"
              onClick={() => playUi()}
              title="Substack"
            >
              <Image
                src="/logos/substack.svg"
                alt="Substack"
                width={28}
                height={28}
              />
            </a>
          ) : (
            <button
              type="button"
              className="contact-locked contact-icon-locked"
              onClick={() => scrollToId("play")}
              title="Substack locked · score 350"
            >
              <Image
                src="/logos/substack.svg"
                alt=""
                width={22}
                height={22}
                className="is-locked-icon"
              />
              <span className="pixel-label">350</span>
            </button>
          )}
          {unlocked.has("x") ? (
            <a
              className="contact-icon-link"
              href="https://x.com/huesofbanter"
              target="_blank"
              rel="noreferrer"
              onClick={() => playUi()}
              title="X"
            >
              <Image src="/logos/x.svg" alt="X" width={28} height={28} />
            </a>
          ) : (
            <button
              type="button"
              className="contact-locked contact-icon-locked"
              onClick={() => scrollToId("play")}
              title="X locked · score 650"
            >
              <Image
                src="/logos/x.svg"
                alt=""
                width={22}
                height={22}
                className="is-locked-icon"
              />
              <span className="pixel-label">650</span>
            </button>
          )}
        </div>
        {lockedChannels > 0 && (
          <p className="contact-hint pixel-label">
            {lockedChannels} CHANNEL{lockedChannels > 1 ? "S" : ""} STILL
            ENCRYPTED · PLAY TO DECRYPT
          </p>
        )}
        <footer className="site-footer">
          <span>© 2026 CHARAN RATHORE</span>
          <span className="pixel-label">NO CONTINUES REQUIRED</span>
          <span>NEXT.JS + THREE.JS</span>
        </footer>
      </section>
    </main>
  );
}
