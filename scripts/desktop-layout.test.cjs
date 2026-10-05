const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const css = fs.readFileSync('src/app/globals.css', 'utf8');
const timeline = fs.readFileSync('src/components/ActivityTimeline.tsx', 'utf8');
test('single-child stats grid does not reserve a vacant dashboard column', () => {
  assert.match(css, /\.about-grid-live:has\(> :only-child\)\s*\{\s*grid-template-columns: minmax\(0, 1fr\)/);
});
test('HUD score and line count have explicit readable line boxes', () => {
  assert.match(css, /\.rail-score b\s*\{[^}]*line-height: 1\.3/);
  assert.match(css, /\.rail-score small\s*\{[^}]*line-height: 1\.5/);
});
test('activity finale count is below, not behind, the heading', () => {
  assert.match(timeline, /Math\.max\(27,w\*\.055\)/);
  assert.match(timeline, /fillText\(String\(events.length\),left,h\*\.27\)/);
});
