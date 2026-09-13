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
    # Click a real UI control by its exact displayed title.
    js='''(()=>{const el=[...document.querySelectorAll('.well-choices button')].find(el=>el.querySelector('strong').textContent===LABEL);if(!el)throw new Error('Choice missing');el.click()})()'''.replace('LABEL',json.dumps(label))
    ev(js);time.sleep(.2)
run('set','viewport','1440','1100');run('open',url);time.sleep(1)
ev('document.querySelector(".well-console").scrollIntoView({behavior:"instant"})')
assert not ev('!!document.querySelector(".tech-marquee")')
choose('AI with evidence');choose('IntelliRAG');choose('Python')
assert 'context in Agentic Finance Advisor' in ev('document.querySelector(".well-choices").innerText')
choose('Expose confidence')
assert ev('document.querySelector(".well-evidence").href')=='https://github.com/charan-rathore/agentic-finance-advisor'
assert 'LAYER 05' in ev('document.querySelector(".well-depth-label").innerText')
ev('document.querySelector(".well-console").scrollIntoView({behavior:"instant"})');run('screenshot',str(out/'desktop.png'))
run('fill','.well-search input','Redis');time.sleep(.2)
assert 'Redis' in ev('document.querySelector(".well-results").innerText')
run('click','.well-results button');time.sleep(.2)
assert 'Check the evidence' in ev('document.querySelector(".well-choices").innerText')
run('click','.well-toolbar button');time.sleep(.2)
assert ev('getComputedStyle(document.querySelector(".well-visual")).display')=='none'
run('click','.well-toolbar button')
run('set','viewport','390','844')
if ev('location.href')=='about:blank':run('open',url)
time.sleep(.4)
ev('document.querySelector(".well-console").scrollIntoView({behavior:"instant"})')
assert ev('document.documentElement.scrollWidth<=innerWidth')
assert ev('[...document.querySelectorAll(".well-node,.well-choices button,.well-depths button")].every(el=>{const r=el.getBoundingClientRect();return r.width>=44&&r.height>=44})')
run('screenshot',str(out/'mobile.png'))
result={'url':url,'fiveLayerTraversal':True,'sharedToolBranches':True,'evidenceUrl':True,'search':True,'readingView':True,'mobileOverflow':False,'touchTargets':'at least 44px','errors':run('errors').get('errors',[])}
assert not result['errors'];(out/'results.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
