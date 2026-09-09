/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the real route with the email transport mocked. */
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), ts = require('typescript');
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {POST}=require('../src/app/api/contact/route.ts');
const valid={name:'Browser audit',email:'visitor@example.com',message:'A test of the portfolio contact flow.',elapsed:5000,website:''};
const request=(body=valid,origin='https://portfolio.test')=>new Request('https://portfolio.test/api/contact',{method:'POST',headers:{origin,'content-type':'application/json','x-forwarded-for':'192.0.2.10'},body:JSON.stringify(body)});
test('contact validates input and fails honestly before provider configuration',async()=>{
 delete process.env.RESEND_API_KEY; delete process.env.CONTACT_FROM_EMAIL;
 assert.equal((await POST(request(valid,'https://attacker.test'))).status,403);
 assert.equal((await POST(request({...valid,email:'bad'}))).status,400);
 assert.equal((await POST(request({...valid,name:'Name\nBcc:someone'}))).status,400);
 assert.equal((await POST(request({...valid,message:'x'.repeat(21000)}))).status,413);
 assert.equal((await POST(request())).status,503);
});
test('delivery uses fixed recipient, verified sender, visitor Reply-To; failure never says sent',async()=>{
 process.env.RESEND_API_KEY='test-placeholder';process.env.CONTACT_FROM_EMAIL='Portfolio <hello@example.com>';process.env.CONTACT_TO_EMAIL='owner@example.com';
 const original=global.fetch;let sent;
 try {
 global.fetch=async(_url,options)=>{sent=JSON.parse(options.body);return Response.json({id:'test-delivery'});};
 assert.equal((await POST(request({...valid,to:'attacker@example.com'}))).status,200);
 assert.deepEqual(sent.to,['owner@example.com']);assert.equal(sent.reply_to,'visitor@example.com');assert.equal(sent.from,'Portfolio <hello@example.com>');
 global.fetch=async()=>Response.json({error:'provider rejected'},{status:401});
 assert.equal((await POST(request())).status,502);
 } finally {global.fetch=original;delete process.env.RESEND_API_KEY;delete process.env.CONTACT_FROM_EMAIL;delete process.env.CONTACT_TO_EMAIL;}
});
