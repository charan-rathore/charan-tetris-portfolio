import { projects, experience, RESUME_URL, TECH_LOGOS } from './portfolio';
import type { PieceName } from '../components/tetris/types';

export type ContextNode = {
  id: string; label: string; depth: number; detail: string; piece: PieceName;
  source_file: string; href?: string;
};
export type ContextLink = { source: string; target: string; relation: string; confidence: 'CURATED' };
const source = 'https://github.com/charan-rathore/charan-tetris-portfolio/blob/main/src/data/portfolio.ts';
const nodes: ContextNode[] = [];
const links: ContextLink[] = [];
const id = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const add = (node: Omit<ContextNode, 'source_file'> & { source_file?: string }) => {
  if (!nodes.some(n => n.id === node.id)) nodes.push({ source_file: source, ...node });
  return node.id;
};
const link = (a: string, b: string, relation: string) => {
  if (!links.some(l => l.source === a && l.target === b)) links.push({ source: a, target: b, relation, confidence: 'CURATED' });
};

const interests = [
  ['intelligence', 'AI with evidence', 'Answers, memory and agents that let you inspect where the information came from.', 'T'],
  ['signals', 'Signals → decisions', 'From a rooftop sensor to product analytics: make observations useful.', 'O'],
  ['interfaces', 'Systems people use', 'Interfaces, collaboration and a little play. The last mile matters.', 'I'],
] as const;
interests.forEach(([key, label, detail, piece]) => add({ id: key, label, detail, piece, depth: 0 }));

const context = [
  { areas: ['intelligence'], title: 'Check the evidence', detail: 'IntelliRAG breaks retrieval into ingestion, chunks, retrieval, reranking, citations and evaluation. Each stage can be inspected.' },
  { areas: ['intelligence', 'interfaces'], title: 'Keep the source attached', detail: 'memoRABLE turns documents into six memory blocks. A block points back to the original lines before it is republished.' },
  { areas: ['signals'], title: 'Close the feedback loop', detail: 'ThermoSense connects rooftop ground truth, forecast bias correction, ensembles and a public leaderboard.' },
  { areas: ['interfaces'], title: 'Make collaboration feel fast', detail: 'The project board combines drag-and-drop tasks, team collaboration and live updates.' },
  { areas: ['intelligence', 'signals'], title: 'Expose confidence', detail: 'The finance advisor makes freshness, source agreement and research confidence inspectable.' },
  { areas: ['signals', 'intelligence'], title: 'Give vision a purpose', detail: 'Drone footage becomes blackbuck detections: an applied computer-vision project for conservation.' },
  { areas: ['signals'], title: 'Start with correct labels', detail: 'Parametric Fusion 360 generation produces 1,000+ labeled STL bolts for classification-ready training data.' },
];

projects.forEach((project, index) => {
  const p = add({ id: `project:${id(project.title)}`, label: project.title, detail: project.copy, piece: project.piece, depth: 1 });
  const c = context[index];
  c.areas.forEach(area => link(area, p, 'explored through'));
  const decision = add({ id: `decision:${id(project.title)}`, label: c.title, detail: c.detail, piece: project.piece, depth: 3, source_file: project.github || source });
  project.tech.forEach(tool => {
    const t = add({ id: `tool:${id(tool.name)}`, label: tool.name, detail: `Follow ${tool.name} across the projects below. The connections describe portfolio context; they do not claim every tool implements every feature.`, piece: project.piece, depth: 2, href: tool.href });
    link(p, t, 'stack includes');
    link(t, decision, `context in ${project.title}`);
  });
  if (project.github) link(decision, add({ id: `repo:${id(project.title)}`, label: `${project.title} · code`, detail: 'Inspect the repository, implementation and documentation for this project.', piece: project.piece, depth: 4, href: project.github, source_file: project.github }), 'inspect implementation');
  if (project.live) link(decision, add({ id: `live:${id(project.title)}`, label: `${project.title} · live`, detail: 'Open the working project and try the interaction yourself.', piece: project.piece, depth: 4, href: project.live, source_file: project.live }), 'try the result');
});

const portfolio = add({ id: 'project:systris', label: 'Systris · this portfolio', depth: 1, piece: 'S', detail: 'A playable Tetris portfolio with two 3D opening scenes, automatic project levels and this explorable context map.' });
link('interfaces', portfolio, 'you are here');
const design = add({ id: 'decision:systris', label: 'Play, then go deeper', depth: 3, piece: 'S', detail: 'Use Tetris as a way to reveal context. Keep a readable fallback, keyboard controls and reduced-motion support.' });
const portfolioRepo = add({ id: 'repo:systris', label: 'Systris · code', depth: 4, piece: 'S', detail: 'The code behind this page, including the context graph and scene recovery.', href: 'https://github.com/charan-rathore/charan-tetris-portfolio' });
link(design, portfolioRepo, 'inspect implementation');
['TypeScript', 'React', 'Next.js', 'Three.js', 'Tailwind', 'Vercel', 'Git'].forEach(name => {
  const t = add({ id: `tool:${id(name)}`, label: name, depth: 2, piece: 'S', detail: `${name} appears in the stack behind this portfolio.`, href: TECH_LOGOS.find(t => t.name === name)?.href });
  link(portfolio, t, 'built and shipped with'); link(t, design, 'context in Systris');
});

experience.slice(0, 2).forEach((job, i) => {
  const p = add({ id: `work:${id(job.place)}`, label: `${job.place} · ${job.role}`, depth: 1, piece: job.piece, detail: `${job.period}. ${job.copy}` });
  link('signals', p, 'applied at');
  const t = add({ id: `practice:${i}`, label: i ? 'Seller funnel analytics' : 'MENA markets', depth: 2, piece: job.piece, detail: job.copy });
  const d = add({ id: `work-context:${i}`, label: i ? 'Behavior → product decisions' : 'Understand the market context', depth: 3, piece: job.piece, detail: job.copy });
  const e = add({ id: `resume:${i}`, label: `${job.place} · résumé`, depth: 4, piece: job.piece, detail: 'Read the experience section of the résumé. Employer projects are described at a high level.', href: RESUME_URL });
  link(p, t, 'focus'); link(t, d, 'working context'); link(d, e, 'read experience');
});

// Preserve tools from the previous strip without inventing employer/project usage.
const workbench = add({ id: 'project:workbench', label: 'The builder’s workbench', depth: 1, piece: 'L', detail: 'Additional tools from my portfolio stack. Explore the documentation and my public work; no employer-specific technology claims are implied.' });
link('signals', workbench, 'supporting toolkit'); link('interfaces', workbench, 'supporting toolkit');
const practice = add({ id: 'decision:workbench', label: 'Explore, reproduce, ship', depth: 3, piece: 'L', detail: 'Notebooks, machine-learning utilities and containers support experimentation. This is a toolkit connection, not a claim about a specific employer’s stack.' });
link(practice, add({ id: 'repo:workbench', label: 'Explore public repositories', depth: 4, piece: 'L', detail: 'Browse the public implementation history on GitHub.', href: 'https://github.com/charan-rathore?tab=repositories' }), 'browse work');
TECH_LOGOS.filter(tool => !nodes.some(n => n.id === `tool:${id(tool.name)}`)).forEach(tool => {
  const t = add({ id: `tool:${id(tool.name)}`, label: tool.name, depth: 2, piece: tool.piece, detail: `${tool.name} is part of the portfolio toolkit. Open its documentation or follow the experimentation context.`, href: tool.href });
  link(workbench, t, 'toolkit includes'); link(t, practice, 'supports experimentation');
});

/** Graphify-compatible NetworkX node-link export; all relationships are curated. */
export const contextGraph = { directed: true, multigraph: false, graph: { generator: 'systris-context', provenance: 'Curated from portfolio project descriptions and stack lists' }, nodes, links };
export const nodeById = new Map(nodes.map(node => [node.id, node]));
export const childrenOf = (key: string) => links.filter(edge => edge.source === key).map(edge => ({ node: nodeById.get(edge.target)!, relation: edge.relation }));
export const parentsOf = (key: string) => links.filter(edge => edge.target === key).map(edge => ({ node: nodeById.get(edge.source)!, relation: edge.relation }));
export function pathTo(key: string): string[] {
  const parent = parentsOf(key)[0];
  return parent ? [...pathTo(parent.node.id), key] : [key];
}
