import subprocess,json,time
from pathlib import Path
B='/Users/charanrathore/.npm/_npx/6de2aa2fded2970c/node_modules/agent-browser/bin/agent-browser-darwin-arm64'
def run(*args):
 p=subprocess.run([B,'--session','portfolio-production','--json',*args],capture_output=True,text=True,timeout=40);r=json.loads(p.stdout)
 if not r.get('success'):raise RuntimeError(r)
 return r.get('data',{}).get('result')
run('eval','document.querySelector(".contact-form").scrollIntoView({block:"center",behavior:"instant"})')
run('fill','.contact-form input[name=name]','Portfolio verification')
run('fill','.contact-form input[name=email]','ra7hore.charan@gmail.com')
run('fill','.contact-form textarea','Charan, this is the requested portfolio contact-delivery verification. Please ignore this test message. No reply needed.')
time.sleep(2)
run('click','.contact-form button[type=submit]')
for _ in range(30):
 time.sleep(.5)
 pending=run('eval','document.querySelector(".contact-form button[type=submit]").disabled')
 if not pending:break
result=run('eval','({url:location.href,status:document.querySelector(".contact-form-status").textContent,draftPreserved:document.querySelector(".contact-form textarea").value.length>0})')
Path('docs/verification/contact-production-result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
run('screenshot',str(Path('docs/verification/contact-production-status.png').resolve()))
