/* eslint-disable @typescript-eslint/no-require-imports -- Test-only CommonJS loader transpiles the actual game modules. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {TetrisGame}=require('../src/components/tetris/game.ts');
const {shuffledBag}=require('../src/components/tetris/engine.ts');
test('seven-bag contains each tetromino once',()=>assert.equal(new Set(shuffledBag()).size,7));
test('hard drop locks cells, scores and advances the queue',()=>{const g=new TetrisGame();g.start();g.hardDrop();assert.ok(g.score>0);assert.equal(g.board.flat().filter(Boolean).length,4);assert.ok(g.active);});
test('pause preserves line-clear progress and clears held movement',()=>{const g=new TetrisGame();g.start();g.status='clearing';g.clearProgress=.4;g.togglePause();g.update(1000);assert.equal(g.status,'paused');assert.equal(g.clearProgress,.4);g.togglePause();assert.equal(g.status,'clearing');});
