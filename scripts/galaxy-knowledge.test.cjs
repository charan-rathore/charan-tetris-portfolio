/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const galaxy=fs.readFileSync('src/data/galaxy.ts','utf8');const graph=fs.readFileSync('src/data/galaxy-knowledge.ts','utf8');
test('every knowledge edge references a curated project node',()=>{const ids=new Set([...galaxy.matchAll(/\{id:'([^']+)',label:/g)].map(m=>m[1]));const edges=[...graph.matchAll(/\{ from:"([^"]+)",to:"([^"]+)",relation:"([^"]+)",why:"([^"]+)",weight:([\d.]+) \}/g)];assert.equal(ids.size,17);assert.ok(edges.length>=17);for(const [,a,b,relation,why,weight] of edges){assert.ok(ids.has(a),a);assert.ok(ids.has(b),b);assert.ok(relation.length>5);assert.ok(why.length>15);assert.ok(Number(weight)>0)}});
