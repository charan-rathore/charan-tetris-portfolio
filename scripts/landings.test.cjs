/* eslint-disable @typescript-eslint/no-require-imports -- Load the actual TypeScript module. */
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file);
const { landingTarget, currentLanding, shortLabel, LANDING_EPSILON } = require('../src/components/arcade/landings.ts');

// Sitting on the third row: two rows are behind the line, two ahead.
const BOARD = [-1400, -700, 0, 620, 1500];

test('a soft drop steps to the next row down and a lift steps back up', () => {
  assert.equal(landingTarget(BOARD, 1), 3);
  assert.equal(landingTarget(BOARD, -1), 1);
});

test('the board ends rather than wrapping, so the browser keeps the keypress', () => {
  assert.equal(landingTarget([-900, -300, 0], 1), null);
  assert.equal(landingTarget([0, 400, 900], -1), null);
  assert.equal(landingTarget([], 1), null);
  assert.equal(landingTarget([], -1), null);
});

test('a row a hair off the line is the row you are on, not a step away', () => {
  const jitter = [-LANDING_EPSILON, LANDING_EPSILON];
  assert.equal(landingTarget(jitter, 1), null, 'a hair below the line is not a step down');
  assert.equal(landingTarget(jitter, -1), null, 'a hair above the line is not a step up');
  assert.equal(landingTarget([-LANDING_EPSILON - 1], -1), 0);
  assert.equal(landingTarget([LANDING_EPSILON + 1], 1), 0);
});

test('the current row is the last one at or above the line', () => {
  assert.equal(currentLanding(BOARD), 2);
  assert.equal(currentLanding([400, 900]), 0, 'above the first row, the first row is current');
  assert.equal(currentLanding([-900, -400]), 1);
});

test('labels are trimmed to a length the HUD can show', () => {
  assert.equal(shortLabel('  THE   PROJECT\n STACK '), 'THE PROJECT STACK');
  assert.equal(shortLabel('x'.repeat(80)).length, 42);
  assert.ok(shortLabel('x'.repeat(80)).endsWith('…'));
});
