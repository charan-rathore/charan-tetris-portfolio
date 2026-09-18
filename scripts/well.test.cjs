/* eslint-disable @typescript-eslint/no-require-imports -- Load the actual TypeScript module. */
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file);
const { depthOf, bandsOf, ghostOf, bandAt } = require('../src/components/arcade/well.ts');

const VIEW = 900;
const PAGE = 4900; // 4000px of travel.
const STAGES = [
  { id: 'top', label: 'ONE', top: 0, height: 1000 },
  { id: 'work', label: 'TWO', top: 1000, height: 2000 },
  { id: 'contact', label: 'THREE', top: 3000, height: 1900 },
];

test('depth runs from the top of the page to the last scrollable pixel', () => {
  assert.equal(depthOf(0, VIEW, PAGE), 0);
  assert.equal(depthOf(2000, VIEW, PAGE), 0.5);
  assert.equal(depthOf(4000, VIEW, PAGE), 1);
  assert.equal(depthOf(9999, VIEW, PAGE), 1, 'overscroll cannot push past the floor');
  assert.equal(depthOf(-50, VIEW, PAGE), 0, 'nor can a rubber-band above the top');
});

test('a page shorter than the window has no depth to report', () => {
  assert.equal(depthOf(0, VIEW, 600), 0);
  assert.equal(depthOf(100, VIEW, VIEW), 0);
});

test('bands cover the track in order and stay inside it', () => {
  const bands = bandsOf(STAGES, VIEW, PAGE);
  assert.deepEqual(bands.map((band) => band.start), [0, 0.25, 0.75]);
  assert.equal(bands[0].end, 0.25);
  assert.equal(bands[2].end, 1, 'the closing stage runs past the floor and is clamped');
  for (const band of bands) {
    assert.ok(band.start >= 0 && band.end <= 1, band.id);
  }
});

test('the ghost shows the next stage down, and the floor once there is none', () => {
  const bands = bandsOf(STAGES, VIEW, PAGE);
  assert.equal(ghostOf(bands, 0), 0.25);
  assert.equal(ghostOf(bands, 0.3), 0.75);
  assert.equal(ghostOf(bands, 0.8), 1);
  // Standing exactly on a band, the ghost points past it rather than at it.
  assert.equal(ghostOf(bands, 0.25), 0.75);
});

test('the reader is inside the last band they have reached', () => {
  const bands = bandsOf(STAGES, VIEW, PAGE);
  assert.equal(bandAt(bands, 0), 0);
  assert.equal(bandAt(bands, 0.24), 0);
  assert.equal(bandAt(bands, 0.25), 1);
  assert.equal(bandAt(bands, 1), 2);
});
