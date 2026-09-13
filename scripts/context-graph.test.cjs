/* eslint-disable @typescript-eslint/no-require-imports -- Load the actual TypeScript data model. */
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file);
const { contextGraph, childrenOf, parentsOf, pathTo } = require('../src/data/context-graph.ts');
const { projects, TECH_LOGOS } = require('../src/data/portfolio.ts');

test('every context node has an unbroken, labeled path through all five layers to evidence', () => {
  const byId = new Map(contextGraph.nodes.map(n => [n.id, n]));
  assert.equal(byId.size, contextGraph.nodes.length);
  const unique = new Set();
  for (const link of contextGraph.links) {
    assert.equal(byId.get(link.target).depth, byId.get(link.source).depth + 1);
    assert.ok(link.relation); assert.equal(link.confidence, 'CURATED');
    unique.add(`${link.source}:${link.target}`);
  }
  assert.equal(unique.size, contextGraph.links.length);
  for (const node of contextGraph.nodes) {
    assert.equal(pathTo(node.id).length, node.depth + 1);
    assert.ok(node.source_file.startsWith('https://'));
    if (node.depth < 4) assert.ok(childrenOf(node.id).length, node.id);
    else assert.ok(node.href?.startsWith('https://'), node.id);
    if (node.depth > 0) assert.ok(parentsOf(node.id).length, node.id);
  }
});

test('the graph retains every project and technology from the portfolio, with shared nodes', () => {
  for (const p of projects) {
    const node = contextGraph.nodes.find(n => n.label === p.title && n.depth === 1);
    assert.ok(node);
    assert.deepEqual(childrenOf(node.id).map(n => n.node.label).sort(), p.tech.map(t => t.name).sort());
  }
  for (const t of TECH_LOGOS) assert.ok(contextGraph.nodes.some(n => n.depth === 2 && n.label === t.name), t.name);
  const python = contextGraph.nodes.filter(n => n.depth === 2 && n.label === 'Python');
  assert.equal(python.length, 1); assert.ok(parentsOf(python[0].id).length >= 5);
});
