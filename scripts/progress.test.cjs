/* eslint-disable @typescript-eslint/no-require-imports -- Load the actual TypeScript module. */
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file);
const { STAGES, CLEAR_LINE, REARM_GAP, stageStatus, clearStage, armStage, scoreOf } = require('../src/components/arcade/progress.ts');

const VIEW = 900;

test('a stage clears when its edge passes the line and re-arms only well below it', () => {
  assert.equal(stageStatus(-500, VIEW, false), 'cleared');
  assert.equal(stageStatus(CLEAR_LINE, VIEW, false), 'cleared');
  // Just below the line: neither cleared nor re-armed, so it cannot flicker.
  assert.equal(stageStatus(CLEAR_LINE + 1, VIEW, false), 'reading');
  assert.equal(stageStatus(CLEAR_LINE + REARM_GAP, VIEW, false), 'reading');
  assert.equal(stageStatus(CLEAR_LINE + REARM_GAP + 1, VIEW, false), 'armed');
});

test('the closing stage clears at the end of the page, where its edge can never reach the line', () => {
  assert.equal(stageStatus(VIEW - 100, VIEW, false), 'armed');
  assert.equal(stageStatus(VIEW - 100, VIEW, true), 'cleared');
  // Still unread when its edge sits past the bottom of the window.
  assert.equal(stageStatus(VIEW + 400, VIEW, true), 'armed');
});

test('each line scores once until it is re-armed, and every stage is worth points', () => {
  const [first, second] = STAGES;
  assert.equal(clearStage(first.id), true);
  assert.equal(clearStage(first.id), false, 'a cleared line cannot score twice');
  assert.equal(scoreOf([first.id]), first.points);

  armStage(first.id);
  assert.equal(clearStage(first.id), true, 're-arming allows a replay');

  assert.equal(scoreOf([first.id, second.id]), first.points + second.points);
  assert.equal(scoreOf(['not-a-stage']), 0);
  assert.equal(
    scoreOf(STAGES.map((stage) => stage.id)),
    STAGES.reduce((total, stage) => total + stage.points, 0),
  );
  for (const stage of STAGES) {
    assert.ok(stage.points > 0, stage.id);
    assert.ok(stage.label.length > 0, stage.id);
  }
});
