"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { GamePanel } from "./tetris/GamePanel";
import { INTEL, useUnlockedIntel } from "./tetris/intel";
import { PIECES, PieceName } from "./tetris/types";

const HeroScene = dynamic(
  () => import("./hero/HeroScene").then((module) => module.HeroScene),
  { ssr: false },
);

type Project = {
  piece: PieceName;
  label: string;
  title: string;
  copy: string;
  image: string;
  imageAlt: string;
  metrics?: string[];
  tech: string[];
  github?: string;
  live?: string;
  featured?: boolean;
};

const projects: Project[] = [
  {
    piece: "T",
    label: "FLAGSHIP · RAG PLATFORM",
    title: "IntelliRAG",
    copy: "Production-grade RAG platform built from first principles, not a vector-search demo. Async Celery ingestion with dead-letter queues, five benchmark-driven chunking strategies, hybrid retrieval (dense + BM25 + RRF), cross-encoder reranking, citation-aware generation, and a CI-gated evaluation platform with span-attached metrics.",
    image: "/projects/intellirag.jpg",
    imageAlt: "Rows of illuminated servers in a data center",
    metrics: [
      "12 PHASES SHIPPED",
      "100+ TESTS",
      "HYBRID MRR 1.0",
      "RERANK +12.5%",
      "E2E P95 12.6MS",
    ],
    tech: ["Python", "FastAPI", "Celery", "PostgreSQL", "Redis", "ChromaDB", "Ollama"],
    github: "https://github.com/charan-rathore/IntelliRAG",
    featured: true,
  },
  {
    piece: "I",
    label: "MEMORY ENGINE · LIVE",
    title: "memoRABLE",
    copy: "Turn information into memory. Reads one document into six source-linked memory blocks. Click any memory and the exact source lines highlight, then publish to Email, Web, and Document without rewriting. Local-first, AI optional.",
    image: "/projects/memorable.jpg",
    imageAlt: "Open books and notes on a desk",
    tech: ["TypeScript", "Next.js", "Unlayer Elements", "pdf.js"],
    github: "https://github.com/charan-rathore/memoRABLE",
    live: "https://memo-rable.vercel.app",
  },
  {
    piece: "O",
    label: "IOT + ML · LIVE",
    title: "ThermoSense",
    copy: "End-to-end temperature intelligence: Raspberry Pi + DHT22 sensor deployment, bias correction against commercial weather APIs, and a SARIMAX / LightGBM / TFT ensemble with a live accuracy leaderboard, proving microclimate beats generic forecasts.",
    image: "/projects/thermosense.jpg",
    imageAlt: "Storm clouds over a weather horizon",
    tech: ["Python", "FastAPI", "React", "MLflow", "LightGBM", "IoT"],
    github: "https://github.com/charan-rathore/Time-Series-Temperature-Modelling",
    live: "https://thermosense-black.vercel.app",
  },
  {
    piece: "S",
    label: "FULL-STACK · LIVE",
    title: "Project Management Tool",
    copy: "Full-stack Kanban board with drag-and-drop task management, team collaboration, and real-time updates. TypeScript end-to-end.",
    image: "/projects/kanban.jpg",
    imageAlt: "Team collaborating around a planning board",
    tech: ["TypeScript", "React", "Next.js", "Tailwind"],
    github: "https://github.com/charan-rathore/project-management-tool",
    live: "https://project-management-tool-nine-zeta.vercel.app",
  },
  {
    piece: "J",
    label: "MULTI-AGENT AI",
    title: "Agentic Finance Advisor",
    copy: "Multi-agent LLM system that monitors stocks, reads market sentiment from news and social media, and generates actionable investment recommendations.",
    image: "/projects/finance.jpg",
    imageAlt: "Financial charts on a trading screen",
    tech: ["Python", "LangChain", "Multi-Agent", "NLP"],
    github: "https://github.com/charan-rathore/agentic-finance-advisor",
  },
  {
    piece: "Z",
    label: "COMPUTER VISION",
    title: "Drone Wildlife Detection",
    copy: "YOLOv8 detection pipeline identifying blackbuck from drone-captured footage, applied machine learning for ecological conservation.",
    image: "/projects/wildlife.jpg",
    imageAlt: "Drone flying above open landscape",
    tech: ["Python", "YOLOv8", "PyTorch"],
    github: "https://github.com/charan-rathore/Object-detection-from-drone-captured-videos",
  },
  {
    piece: "L",
    label: "CAD AUTOMATION",
    title: "3D Bolt Dataset Automation",
    copy: "Automated generation of 1,000+ labeled STL datasets through the Fusion 360 API for ML-based CAD classification, from parametric generation to labeling.",
    image: "/projects/cad.jpg",
    imageAlt: "Metal bolts and machining tools on a workbench",
    tech: ["Python", "Fusion 360 API", "Deep Learning"],
    github: "https://github.com/charan-rathore/Automation-of-3D-Bolt-Dataset",
  },
];

const experience = [
  {
    period: "2026 · NOW",
    role: "AI Infrastructure & Product",
    place: "AI Research Startup",
    copy: "Building the systems layer behind Claude, ChatGPT, and next-generation foundation-model applications, where deep tech meets product.",
  },
  {
    period: "JAN · JUN 2026",
    role: "Product Analyst Intern",
    place: "Flipkart",
    copy: "Seller funnel analytics on the search personalization team. Pipelines and dashboards turning behavior into product decisions across millions of daily searches.",
  },
  {
    period: "2024 · NOW",
    role: "Independent AI Systems Builder",
    place: "Personal Projects",
    copy: "Production-grade systems from first principles: RAG, multi-agent AI, computer vision, quantitative finance. Documented tradeoffs, measured failure modes.",
  },
];

const playerStats = [
  { value: "10+", label: "SYSTEMS SHIPPED" },
  { value: "5", label: "AI/ML DOMAINS" },
  { value: "3", label: "LIVE APPS" },
  { value: "∞", label: "SYSTEMS LOOPS" },
];

const TECH_STACK: { name: string; piece: PieceName }[] = [
  { name: "Python", piece: "T" },
  { name: "TypeScript", piece: "I" },
  { name: "Next.js", piece: "O" },
  { name: "React", piece: "S" },
  { name: "Three.js", piece: "Z" },
  { name: "FastAPI", piece: "J" },
  { name: "Celery", piece: "L" },
  { name: "PostgreSQL", piece: "T" },
  { name: "Redis", piece: "I" },
  { name: "ChromaDB", piece: "O" },
  { name: "Ollama", piece: "S" },
  { name: "LangChain", piece: "Z" },
  { name: "PyTorch", piece: "J" },
  { name: "YOLOv8", piece: "L" },
  { name: "MLflow", piece: "T" },
  { name: "LightGBM", piece: "I" },
  { name: "Tailwind", piece: "O" },
  { name: "pdf.js", piece: "S" },
  { name: "Fusion 360", piece: "Z" },
  { name: "IoT", piece: "J" },
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

function TechMarquee() {
  const loop = [...TECH_STACK, ...TECH_STACK];
  return (
    <div className="tech-marquee" aria-label="Tech stack">
      <div className="tech-marquee-track">
        {loop.map((item, index) => (
          <div
            className="tech-chip"
            key={`${item.name}-${index}`}
            style={{ "--piece": PIECES[item.piece].color } as React.CSSProperties}
          >
            <PieceGlyph name={item.piece} />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function Portfolio() {
  const [time, setTime] = useState("");
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
      <div className="scanlines" aria-hidden="true" />

      <header className="site-header">
        <button
          type="button"
          className="wordmark pixel"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          CR
        </button>
        <nav aria-label="Primary">
          <button type="button" onClick={() => scrollToId("play")}>PLAY</button>
          <button type="button" onClick={() => scrollToId("work")}>WORK</button>
          <button type="button" onClick={() => scrollToId("about")}>ABOUT</button>
          <button type="button" onClick={() => scrollToId("contact")}>CONTACT</button>
        </nav>
        <div className="header-meta">
          <span className="status-chip">
            <i />
            OPEN TO OPPORTUNITIES
          </span>
          <span className="clock">{time || "--:--"} IST</span>
        </div>
      </header>

      <section className="hero" id="top">
        <HeroScene />
        <div className="hero-content">
          <span className="pixel-label">PLAYER 1 · PRODUCT ANALYST &amp; AI SYSTEMS BUILDER</span>
          <h1>
            <span className="sr-only">Charan Rathore · </span>
            I build AI systems that think.
          </h1>
          <p>
            BITS Pilani ’26 · ex-Flipkart product analyst · now building AI
            infrastructure at a research startup. This site is a playable
            Tetris, because a portfolio should prove the feel, not claim it.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => scrollToId("play")}
            >
              ▶ PRESS START
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => scrollToId("work")}
            >
              SKIP TO WORK ↓
            </button>
          </div>
        </div>
        <div className="hero-hint pixel-label" aria-hidden="true">
          CLICK THE NAME TO REPLAY ↺
        </div>
      </section>

      <TechMarquee />

      <div className="stage-band" id="play-band">
        <div className="stage-heading">
          <span className="pixel-label accent-yellow">STAGE 01 · PLAY</span>
          <h2>First, a vibe check.</h2>
          <p>
            Guideline mechanics, hand-tuned juice, zero mercy. Score decrypts
            intel about me this page won&apos;t show you otherwise.
          </p>
        </div>
        <GamePanel />
      </div>

      <section className="work-section" id="work">
        <div className="stage-heading">
          <span className="pixel-label accent-cyan">STAGE 02 · WORK</span>
          <h2>Projects that define me.</h2>
          <p>Not demos. Not tutorials. Systems built with production thinking.</p>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <article
              key={project.title}
              className={`project-card ${project.featured ? "is-featured" : ""}`}
              style={{ "--piece": PIECES[project.piece].color } as React.CSSProperties}
            >
              <div className="project-media">
                <Image
                  src={project.image}
                  alt={project.imageAlt}
                  fill
                  sizes="(max-width: 820px) 100vw, 50vw"
                  className="project-photo"
                />
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
                  <span key={item}>{item}</span>
                ))}
              </div>
              <div className="project-links">
                {project.live && (
                  <a href={project.live} target="_blank" rel="noreferrer">
                    LIVE ↗
                  </a>
                )}
                {project.github && (
                  <a href={project.github} target="_blank" rel="noreferrer">
                    GITHUB ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="stage-heading">
          <span className="pixel-label accent-purple">STAGE 03 · PLAYER STATS</span>
          <h2>The method behind the madness.</h2>
        </div>

        <div className="about-grid">
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

          <div className="stat-blocks">
            {playerStats.map((stat) => (
              <div className="stat-block" key={stat.label}>
                <b>{stat.value}</b>
                <span className="pixel-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xp-list">
          {experience.map((item) => (
            <article className="xp-row" key={item.role}>
              <span className="pixel-label">{item.period}</span>
              <div>
                <h3>
                  {item.role} <em>/ {item.place}</em>
                </h3>
                <p>{item.copy}</p>
              </div>
            </article>
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
        <a className="contact-cta" href="mailto:ra7hore.charan@gmail.com">
          ra7hore.charan@gmail.com <b>↗</b>
        </a>
        <div className="contact-links">
          <a href="https://github.com/charan-rathore" target="_blank" rel="noreferrer">
            GITHUB
          </a>
          <a
            href="https://linkedin.com/in/charan-rathore"
            target="_blank"
            rel="noreferrer"
          >
            LINKEDIN
          </a>
          {unlocked.has("x") ? (
            <a href="https://x.com/huesofbanter" target="_blank" rel="noreferrer">
              X · MEMES &amp; BANTER
            </a>
          ) : (
            <button
              type="button"
              className="contact-locked"
              onClick={() => scrollToId("play")}
            >
              X · LOCKED · SCORE 1,200
            </button>
          )}
          {unlocked.has("substack") ? (
            <a
              href="https://substack.com/@charanrathore"
              target="_blank"
              rel="noreferrer"
            >
              SUBSTACK
            </a>
          ) : (
            <button
              type="button"
              className="contact-locked"
              onClick={() => scrollToId("play")}
            >
              SUBSTACK · LOCKED · SCORE 3,000
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
