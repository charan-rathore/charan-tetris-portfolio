"""Exercise the live DOM, graph branches, search, evidence and mobile layout in Brave."""
import json, os, subprocess, time
from pathlib import Path
B=os.environ.get('AGENT_BROWSER','/Users/charanrathore/.npm/_npx/6de2aa2fded2970c/node_modules/agent-browser/bin/agent-browser-darwin-arm64')
session=os.environ.get('BROWSER_SESSION','graph-review')
url=os.environ.get('PORTFOLIO_URL','http://localhost:3005')
out=Path(os.environ.get('VERIFICATION_OUTPUT','/private/tmp/context-verification'));out.mkdir(parents=True,exist_ok=True)
def run(*args):
    p=subprocess.run([B,'--session',session,'--json',*args],capture_output=True,text=True,timeout=45)
    r=json.loads(p.stdout);assert r.get('success'),r
    d=r.get('data',{});return d.get('result',d)
def ev(js):return run('eval',js)
def choose(label):
    ev("(()=>{const el=[...document.querySelectorAll('.dial-node')].find(el=>el.querySelector('strong').textContent==="+json.dumps(label)+");if(!el)throw new Error('Choice missing');el.click()})()")
    time.sleep(.15)
run('set','viewport','1440','1000');run('open',url);time.sleep(.5)
assert ev('!!navigator.brave')
assert ev('document.querySelectorAll(".dial-node").length')==3
assert not ev('!!document.querySelector(".well-plane,.tech-marquee")')
choose('Trust the answer');choose('IntelliRAG');choose('Keep evidence in reach')
assert 'FastAPI' in ev('document.querySelector(".dial-story").innerText')
choose('An answer you can check')
assert ev('new Set([...document.querySelectorAll("[data-story-edge]")].map(e=>e.getAttribute("stroke-width"))).size')==2
choose('Inspect the code')
assert ev('document.querySelector(".dial-open").href')=='https://github.com/charan-rathore/IntelliRAG'
assert ev('document.querySelectorAll(".dial-trail [aria-current]").length')==1
assert ev('document.querySelectorAll(".dial-node").length')==0
run('click','.dial-trail button');choose('Find the signal')
first=ev('[...document.querySelectorAll(".dial-node")].map(e=>e.textContent)')
run('click','.dial-legend button')
assert first!=ev('[...document.querySelectorAll(".dial-node")].map(e=>e.textContent)')
ev('document.querySelector(".dial-layout").scrollIntoView({behavior:"instant",block:"center"})')
run('screenshot',str(out/'desktop.png'))
run('click','.dial-heading button')
assert ev('!!document.querySelector(".is-reading")')
run('click','.dial-heading button')
run('set','viewport','390','844')
if ev('location.href')=='about:blank':run('open',url)
run('click','.dial-trail button')
ev('document.querySelector(".dial-layout").scrollIntoView({behavior:"instant",block:"start"})')
assert ev('document.documentElement.scrollWidth<=innerWidth')
assert ev('[...document.querySelectorAll(".dial-node")].every(el=>{const r=el.getBoundingClientRect();return r.width>=44&&r.height>=44})')
assert ev('''(()=>{const r=[...document.querySelectorAll('.dial-node')].map(e=>e.getBoundingClientRect());return r.every((a,i)=>r.every((b,j)=>i===j||a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top))})()''')
run('screenshot',str(out/'mobile.png'))
result={'url':url,'progressiveStoryTraversal':True,'evidenceUrl':True,'weightedEdges':True,'pagination':True,'readingView':True,'mobileOverflow':False,'nodeOverlap':False,'touchTargets':'at least 44px','errors':run('errors').get('errors',[])}
assert not result['errors'];(out/'results.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
