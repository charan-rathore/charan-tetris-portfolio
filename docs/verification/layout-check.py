import subprocess,json,time,os
from pathlib import Path
B='/Users/charanrathore/.npm/_npx/6de2aa2fded2970c/node_modules/agent-browser/bin/agent-browser-darwin-arm64'
session=os.environ.get('PORTFOLIO_BROWSER_SESSION','portfolio-local');out=Path(__file__).parent

def run(*args):
 p=subprocess.run([B,'--session',session,'--json',*args],capture_output=True,text=True,timeout=40);r=json.loads(p.stdout)
 if not r.get('success'):raise RuntimeError(r)
 return r.get('data',{}).get('result')
def ev(js):return run('eval',js)
def scroll(selector):ev('document.querySelector('+json.dumps(selector)+').scrollIntoView({block:"center",behavior:"instant"})');time.sleep(.3)
r={}
run('set','viewport','1440','1000');ev('window.scrollTo({top:0,behavior:"instant"})');time.sleep(.5)
r['thinkingVisual']=ev('!!document.querySelector(".thinking-field svg")')
r['twoAdditionalCharts']=ev('document.querySelectorAll(".activity-extras figure").length===2')
r['projectCount']=ev('document.querySelectorAll(".project-level").length')
r['lastCellUseful']=ev('!!document.querySelector(".project-grid>.conversation-starter")')
run('screenshot',str(out/(session+'-hero.png')))
run('find','role','button','click','--name','ABOUT','--exact')
for _ in range(20):
 time.sleep(.2)
 if ev('document.getElementById("about").getBoundingClientRect().top < innerHeight*.35'):break
r['activeNavigation']=ev('document.querySelector(".site-header nav [aria-current=location]")?.textContent')
scroll('.activity-extras');run('screenshot',str(out/(session+'-stats.png')))
scroll('.gh-chart-bar');run('click','.gh-chart-bar');r['selectedDateAboveBars']=ev('document.querySelector(".gh-selection").innerText')
scroll('.contact-layout');run('click','.contact-layout .conversation-starter button');time.sleep(.5)
r['starterPrefillsDraft']=ev('document.querySelector("textarea[name=message]")?.value || document.querySelector(".contact-form textarea")?.value')
run('click','.contact-layout .conversation-starter button:nth-child(2)');r['existingDraftPreserved']=ev('document.querySelector(".contact-form textarea").value')==r['starterPrefillsDraft']
run('screenshot',str(out/(session+'-contact.png')))
r['githubResponse']=ev('fetch("/api/github").then(async r=>({status:r.status,body:await r.json()})).then(({status,body})=>({status,stale:body.stale,checkedAt:body.checkedAt,repos:body.publicRepos,calendar:body.month?.length}))')
run('set','viewport','390','844');ev('window.scrollTo({top:0,behavior:"instant"})');time.sleep(.5)
r['mobileNoOverflow']=ev('document.documentElement.scrollWidth<=innerWidth');run('screenshot',str(out/(session+'-hero-mobile.png')))
scroll('.contact-layout');r['mobileContactNoOverflow']=ev('document.documentElement.scrollWidth<=innerWidth');run('screenshot',str(out/(session+'-contact-mobile.png')))
r['mobilePromptTargets']=ev('Array.from(document.querySelectorAll(".contact-layout .conversation-starter button")).map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}))')
r['browserErrors']=run('errors')
(out/(session+'-layout-results.json')).write_text(json.dumps(r,indent=2));print(json.dumps(r,indent=2))
assert r['thinkingVisual'] and r['twoAdditionalCharts'] and r['projectCount']==7 and r['lastCellUseful'] and r['activeNavigation']=='ABOUT' and r['starterPrefillsDraft'] and r['existingDraftPreserved'] and r['mobileNoOverflow'] and r['mobileContactNoOverflow']
