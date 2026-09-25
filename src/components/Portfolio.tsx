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
import { PIECES, PieceName } from "./tetris/types";

import { projects, experience, RESUME_URL, THESIS } from "../data/portfolio";
import { KnowledgeWell } from "./graph/KnowledgeWell";
import { WorkingSystem } from "./WorkingSystem";
import { PaperFold } from "./PaperFold";
import { ContactCoin } from "./ContactCoin";
import { TwoSeconds } from "./TwoSeconds";
import { HuesSignature } from "./HuesSignature";
import { LineClears } from "./arcade/LineClears";
import { ArcadeRail } from "./arcade/ArcadeRail";
import { Controls } from "./arcade/Controls";
import { GhostRail } from "./arcade/GhostRail";
import { HoldButton } from "./arcade/HoldButton";
import { projectSlug } from "./arcade/hold";

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

/**
 * Wraps project-media + the Tetris gameplay canvas.
 * Owns skip/replay state so the SHOW ARTWORK button can be rendered
 * BELOW the media element rather than overlaid on the animation.
 */
function ProjectMedia({ project, index }: { project: (typeof projects)[number]; index: number }) {
  const [skip, setSkip] = useState(false);
  const [replay, setReplay] = useState(0);
  return (
    <>
      <div className="project-media">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes="(max-width: 820px) 100vw, 50vw"
          className="project-photo"
        />
        {<ProjectGameplay
          level={index}
          systems={project.tech}
          skip={skip}
          replay={replay}
        />}
        {/* Replay stays inside the media (appears on hover once animation completes) */}
        {skip && (
          <button
            type="button"
            className="project-replay"
            aria-label={`Replay the automatic Tetris sequence for ${project.title}`}
            onClick={() => { setSkip(false); setReplay(n => n + 1); }}
          >
            ↻ REPLAY BUILD
          </button>
        )}
      </div>
      {/* SHOW ARTWORK lives below the media — never hides the animation */}
      {!skip && (
        <button
          type="button"
          className="project-skip-bar"
          onClick={() => setSkip(true)}
          aria-label={`Show ${project.title} artwork now`}
        >
          SHOW ARTWORK ↓
        </button>
      )}
    </>
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
  const [ambient, setAmbient] = useState(true);
  const [time, setTime] = useState("");
  const [activeSection, setActiveSection] = useState("work");

  // Cursor-beam spotlight — updates CSS vars on the <main> element so the
  // radial glow follows the mouse anywhere on the page.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const main = document.querySelector<HTMLElement>('main[data-ambient]');
      if (!main) return;
      main.style.setProperty('--beam-x', `${e.clientX}px`);
      main.style.setProperty('--beam-y', `${e.clientY}px`);
      main.style.setProperty('--beam-opacity', '1');
    };
    const onLeave = () => {
      const main = document.querySelector<HTMLElement>('main[data-ambient]');
      main?.style.setProperty('--beam-opacity', '0');
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const line = innerHeight * .35;
      const ids = ["work", "about", "contact"];
      let active = "work";
      for (const id of ids) { const node = document.getElementById(id); if (node && node.getBoundingClientRect().top <= line) active = id; }
      setActiveSection(active); frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule(); window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);
    return () => {cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);};
  }, []);
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
    <main data-ambient={ambient ? 'on' : 'paused'}>
      <a className="skip-link" href="#work">Skip to projects</a>
      <div className="scanlines" aria-hidden="true" />
      <LineClears />
      <ArcadeRail />
      <GhostRail />
      <Controls />

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
          <button className="ambient-toggle" type="button" aria-pressed={!ambient} onClick={()=>setAmbient(!ambient)} aria-label={ambient?'Pause ambient motion':'Resume ambient motion'}>{ambient?'Ⅱ':'▷'}</button>
        </div>
      </header>

      <section className="hero hero--mcp" id="top">
        <McpHero />
        <div className="hero-content">
          <ThinkingField />
          <div className="player-identity">
            <a className="player-avatar" href="https://x.com/huesofbanter" target="_blank" rel="noreferrer" aria-label="Charan on X: huesofbanter">
              <Image src="/charan-x-avatar.jpg" alt="Charan’s X profile avatar" width={52} height={52} priority />
            </a>
            <span className="pixel-label">PLAYER 1 &gt; SYSTRIS : TETRIS WITH SYSTEMS<small>@huesofbanter · Charan Rathore</small></span>
          </div>
          <h1>
            <span className="sr-only">Charan Rathore · </span>
            I build systems that make the pieces click.
          </h1>
          <p className="hero-intro hero-identity-line">Analyst at MiQ, ex-Flipkart - I build RAG, memory and eval systems.</p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => scrollToId("context")}
            >
              ↓ EXPLORE MY CONTEXT
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => scrollToId("work")}
            >
              EXPLORE PROJECTS ↓
            </button>
            <a
              className="btn-ghost"
              href={THESIS.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => playUi()}
            >
              READ THE PAPER ↗
            </a>
          </div>
        </div>

      </section>

      <PaperFold />

      <KnowledgeWell />

      <section className="work-section" id="work">
        <div className="stage-heading">
          <span className="pixel-label accent-cyan">STAGE 02 · THE PROJECT STACK</span>
          <h2>Watch the work fall into place.</h2>
          <p>Start with the systems I am building now. Follow the code, try the live work, then explore the rest.</p>
        </div>

        <div className="project-grid">
          {projects.map((project, index) => (
            <ProjectLevel key={project.title} id={projectSlug(project.title)} title={project.title} index={index} piece={project.piece} featured={project.featured}>
              <ProjectMedia project={project} index={index} />
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
                <HoldButton title={project.title} piece={project.piece} />
              </div>
            </ProjectLevel>
          ))}
          <ConversationStarter compact />
        </div>
      </section>

      <PaperFold />

      <section className="about-section" id="about">
        <WorkingSystem />
        <TwoSeconds />
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

        <a
          className="thesis-sheet"
          href={THESIS.href}
          target="_blank"
          rel="noreferrer"
          onClick={() => playUi()}
        >
          <span className="pixel-label">THE PAPER · {THESIS.venue} {THESIS.id}</span>
          <h3>{THESIS.title}</h3>
          <p>{THESIS.copy}</p>
          <span className="thesis-sheet-cta">READ ON ARXIV ↗</span>
        </a>

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
        <ContactCoin />
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
          className="contact-cta contact-cta-mail contact-gmail-icon"
          href="https://mail.google.com/mail/?view=cm&fs=1&to=ra7hore.charan%40gmail.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Write to Charan in Gmail"
          title="Write to Charan in Gmail"
          onClick={() => playUi()}
        >
          <Image src="/logos/gmail.svg" alt="" width={32} height={32} />
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
          <a
            className="contact-icon-link"
            href={THESIS.href}
            target="_blank"
            rel="noreferrer"
            onClick={() => playUi()}
            title="Latest paper on arXiv"
          >
            <span className="contact-arxiv" aria-hidden="true">arXiv</span>
            <span className="sr-only">Latest paper on arXiv</span>
          </a>
          <a className="contact-icon-link" href="https://substack.com/@charanrathore" target="_blank" rel="noreferrer" title="Substack" aria-label="Substack"><Image src="/logos/substack.svg" alt="" width={28} height={28} /></a>
          <a className="contact-icon-link" href="https://x.com/huesofbanter" target="_blank" rel="noreferrer" title="X" aria-label="X"><Image src="/logos/x.svg" alt="" width={28} height={28} /></a>
        </div>
        <footer className="site-footer">
          <span>© 2026 CHARAN RATHORE</span>
          <HuesSignature />
          <span>SYSTRIS / V2 PREVIEW</span>
        </footer>
      </section>
    </main>
  );
}
