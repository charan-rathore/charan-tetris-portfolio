import { projects, experience, RESUME_URL, THESIS } from './portfolio';
import type { PieceName } from '../components/tetris/types';

export type ContextNode = { id: string; label: string; depth: number; detail: string; piece: PieceName; source_file: string; href?: string; tools?: string[] };
export type ContextLink = { source: string; target: string; relation: string; importance: 1 | 2 | 3; confidence: 'CURATED' };
const source = 'https://github.com/charan-rathore/charan-tetris-portfolio/blob/main/src/data/portfolio.ts';
const nodes: ContextNode[] = [];
const links: ContextLink[] = [];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const add = (n: Omit<ContextNode, 'source_file'> & { source_file?: string }) => { nodes.push({ source_file: source, ...n }); return n.id; };
const link = (a: string, b: string, relation: string, importance: 1 | 2 | 3 = 3) => links.push({ source: a, target: b, relation, importance, confidence: 'CURATED' });
[
  ['intelligence', 'Trust the answer', 'I build ways to question an answer, trace its sources and keep useful context.', 'T'],
  ['signals', 'Find the signal', 'I turn observations into something a person can act on, from sensor readings to product behavior.', 'O'],
  ['interfaces', 'Make it click', 'A system becomes useful when people can understand it and get something done.', 'I'],
].forEach(([id, label, detail, piece]) => add({ id, label, detail, piece: piece as PieceName, depth: 0 }));

// Editorial importance ranks paths in this story; it is not a measured business impact.
const stories = [
  { areas: ['intelligence'], question: 'Where did that answer come from?', choice: 'Keep evidence in reach', how: 'IntelliRAG separates ingestion, retrieval and citations. Python and FastAPI expose the pipeline; its stores and workers support the retrieval stages. The live lab makes source inspection visible.', impact: 'An answer you can check', result: 'Inspect the passage behind an answer, distinguish used evidence from other matches, and see when the documents cannot support a reply.' },
  { areas: ['intelligence', 'interfaces'], question: 'Can useful context survive a rewrite?', choice: 'Carry the original lines', how: 'memoRABLE uses pdf.js to read PDFs and Unlayer Elements for publishing. The TypeScript and Next.js interface keeps the source beside the six memory blocks.', impact: 'Reuse without losing the source', result: 'Turn one document into email, web or document output while keeping the original context close enough to verify.' },
  { areas: ['signals'], question: 'How far off is the forecast?', choice: 'Bring the rooftop into the loop', how: 'ThermoSense combines IoT ground truth with Python forecasting, LightGBM and MLflow experiments. A React interface exposes the forecasts and leaderboard.', impact: 'Compare prediction with reality', result: 'Bias correction and ensembles are judged against rooftop measurements. The leaderboard makes model comparison inspectable.' },
  { areas: ['interfaces'], question: 'What is moving, and who owns it?', choice: 'Make progress tangible', how: 'React and TypeScript power the draggable task board, with Next.js and Tailwind behind the interface. Tasks are shown where teammates can move and discuss them.', impact: 'A shared view of the work', result: 'Drag-and-drop tasks, team collaboration and live updates turn an abstract project into a board people can act on.' },
  { areas: ['intelligence', 'signals'], question: 'Do the sources agree?', choice: 'Make confidence inspectable', how: 'The Python and LangChain research workflow coordinates agents around financial information. Freshness and source agreement stay part of the result.', impact: 'Research with context attached', result: 'The advisor exposes confidence and freshness so a reader can judge the research instead of receiving an unexplained conclusion.' },
  { areas: ['signals', 'intelligence'], question: 'Can we spot wildlife from above?', choice: 'Give vision a conservation job', how: 'YOLOv8 and PyTorch process drone imagery in Python. The detector is applied to blackbuck sightings rather than an abstract benchmark alone.', impact: 'Footage becomes detections', result: 'The project turns drone video into inspectable blackbuck detections for a conservation use case.' },
  { areas: ['signals'], question: 'Where do the training labels come from?', choice: 'Generate the shape and its label', how: 'Python drives the Fusion 360 API to create parametric bolts. The geometry is generated alongside its known class, preparing examples for deep learning.', impact: '1,000+ labeled bolt models', result: 'The automation produces labeled STL models for classification-ready training data, replacing a hand-built dataset with a reproducible process.' },
];
projects.forEach((project, i) => {
  const key = slug(project.title), s = stories[i], provenance = project.github || source;
  const p = add({ id: `project:${key}`, label: project.title, detail: s.question, depth: 1, piece: project.piece, source_file: provenance });
  s.areas.forEach((area, j) => link(area, p, j ? 'another connection' : 'in practice', j ? 1 : 3));
  const choice = add({ id: `choice:${key}`, label: s.choice, detail: s.how, tools: project.tech.map(t => t.name), depth: 2, piece: project.piece, source_file: provenance });
  link(p, choice, 'the approach');
  const impact = add({ id: `impact:${key}`, label: s.impact, detail: s.result, depth: 3, piece: project.piece, source_file: provenance });
  link(choice, impact, 'what it enables');
  if (project.github) link(impact, add({ id: `repo:${key}`, label: 'Inspect the code', detail: `Follow the implementation of ${project.title} on GitHub.`, depth: 4, piece: project.piece, source_file: project.github, href: project.github }), 'check the work', 2);
  if (project.live) link(impact, add({ id: `live:${key}`, label: 'Try it yourself', detail: `Open ${project.title} and put this story to the test.`, depth: 4, piece: project.piece, source_file: project.live, href: project.live }), 'see it working', 3);
});
experience.slice(0, 2).forEach((job, i) => {
  const p = add({ id: `work:${i}`, label: job.place, detail: `${job.role}. ${job.copy}`, depth: 1, piece: job.piece });
  const c = add({ id: `practice:${i}`, label: i ? 'Follow the seller journey' : 'Read the market context', detail: job.copy, depth: 2, piece: job.piece });
  const r = add({ id: `work-result:${i}`, label: i ? 'Behavior into decisions' : 'Analytics across MENA', detail: i ? 'Pipelines and dashboards translate seller-funnel behavior into product decisions on the search personalization team.' : 'My current analyst role at MiQ focuses on MENA markets. The résumé gives the professional context.', depth: 3, piece: job.piece });
  const e = add({ id: `resume:${i}`, label: 'Read the experience', detail: `${job.period} · ${job.role} at ${job.place}.`, href: RESUME_URL, depth: 4, piece: job.piece });
  link('signals', p, 'at work', 2); link(p, c, 'the focus'); link(c, r, 'why it matters'); link(r, e, 'read more', 2);
});
const paper = add({
  id: 'paper:zsee',
  label: 'Read the paper',
  detail: `${THESIS.title}. ${THESIS.venue} ${THESIS.id}.`,
  href: THESIS.href,
  depth: 4,
  piece: 'T',
});
link('intelligence', add({
  id: 'work:paper',
  label: 'Scientific extraction',
  detail: 'How far can a general-purpose model go on zeolite synthesis procedures before it needs the domain?',
  depth: 1,
  piece: 'T',
}), 'in research', 2);
link('work:paper', add({
  id: 'choice:paper',
  label: 'Measure the prompting, not the hype',
  detail: 'Zero-shot, few-shot, event-specific, and reflection — six models, four subtasks, the same 1,530 sentences.',
  depth: 2,
  piece: 'T',
}), 'the approach');
link('choice:paper', add({
  id: 'impact:paper',
  label: 'A benchmark you can cite',
  detail: 'High-level classification holds. Fine-grained argument extraction still needs the domain. The numbers are in the paper.',
  depth: 3,
  piece: 'T',
}), 'what it enables');
link('impact:paper', paper, 'read more', 3);
const systris = [
  ['project:systris', 'Systris · you are here', 'A portfolio you can play, then explore at your own pace.'],
  ['choice:systris', 'Let curiosity choose the route', 'React and TypeScript connect a real Tetris engine to the project stories. Isometric SVG keeps the opening consistent across browser graphics settings; Three.js powers the game.'],
  ['impact:systris', 'Play first. Find the evidence.', 'Each connection leads to a project, the thinking behind it and an implementation you can inspect.'],
  ['repo:systris', 'Open this portfolio’s code', 'Follow the source and the commits behind this page.'],
];
systris.forEach(([id, label, detail], i) => { add({ id, label, detail, depth: i + 1, piece: 'S', ...(i === 3 ? { href: 'https://github.com/charan-rathore/charan-tetris-portfolio' } : {}) }); link(i ? systris[i - 1][0] : 'interfaces', id, ['you are here', 'the approach', 'what it enables', 'check the work'][i], i === 3 ? 2 : 3); });

export const contextGraph = { directed: true, multigraph: false, graph: { generator: 'systris-context', provenance: 'Curated project stories; edge width is editorial importance, not measured impact' }, nodes, links };
export const nodeById = new Map(nodes.map(n => [n.id, n]));
export const childrenOf = (id: string) => links.filter(e => e.source === id).map(e => ({ node: nodeById.get(e.target)!, relation: e.relation, importance: e.importance }));
export const parentsOf = (id: string) => links.filter(e => e.target === id).map(e => ({ node: nodeById.get(e.source)!, relation: e.relation }));
export function pathTo(id: string): string[] { const parent = parentsOf(id)[0]; return parent ? [...pathTo(parent.node.id), id] : [id]; }
