/* eslint-disable @typescript-eslint/no-require-imports -- Exercise real route with failed upstream transport. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
test('GitHub upstream outage returns dated data instead of errors or zeroed charts',async()=>{
 const original=global.fetch;let calls=0;
 global.fetch=async()=>{calls++;throw new Error('network down');};
 try {const {GET}=require('../src/app/api/github/route.ts');const response=await GET();const body=await response.json();assert.equal(response.status,200);assert.equal(body.stale,true);assert.ok(body.recent.length>0);assert.ok(body.month.length>0);assert.ok(body.calendarUpdatedAt);assert.match(response.headers.get('cache-control'),/stale-while-revalidate/);await GET();assert.equal(calls,3,'warm requests share the cached result');}finally{global.fetch=original;}
});

test('initial GitHub rendering is identical across server and visitor time zones',()=>{
 require.extensions['.tsx']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
 const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');
 const {GitHubPulse}=require('../src/components/GitHubPulse.tsx');
 const previous=process.env.TZ;
 try {
   process.env.TZ='UTC';const server=renderToStaticMarkup(React.createElement(GitHubPulse));
   for(const zone of ['Asia/Kolkata','America/Los_Angeles','Pacific/Kiritimati']){
     process.env.TZ=zone;assert.equal(renderToStaticMarkup(React.createElement(GitHubPulse)),server,zone);
   }
 } finally {if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous;}
});
