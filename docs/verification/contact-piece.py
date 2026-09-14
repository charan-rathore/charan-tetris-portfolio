"""Verify conversation selection, rotation and actual form prefill in Brave."""
import json, os, subprocess, time
from pathlib import Path
B='/Users/charanrathore/.npm/_npx/6de2aa2fded2970c/node_modules/agent-browser/bin/agent-browser-darwin-arm64'
session=os.environ.get('BROWSER_SESSION','revised-openings')
url=os.environ.get('PORTFOLIO_URL','http://localhost:3005')
def run(*args):
    p=subprocess.run([B,'--session',session,'--json',*args],capture_output=True,text=True,timeout=45)
    r=json.loads(p.stdout);assert r.get('success'),r
    d=r.get('data',{});return d.get('result',d)
def ev(s):return run('eval',s)
run('set','viewport','1440','1000');run('open',url)
ev('document.querySelector("#contact").scrollIntoView({behavior:"instant"});document.querySelector("textarea[name=message]").value=""')
time.sleep(.3)
# Use the actual controls, and inspect the actual form value. Nothing is sent.
for i,expected in enumerate(['product idea','analytics challenge','opportunity']):
    ev(f'document.querySelectorAll("#contact .conversation-options button")[{i}].click()')
    before=ev('document.querySelector("#contact .conversation-falling").innerHTML')
    ev('document.querySelector("#contact .conversation-actions button").click()')
    assert before!=ev('document.querySelector("#contact .conversation-falling").innerHTML')
    ev('document.querySelector("#contact .conversation-actions button:last-child").click()')
    time.sleep(.8)
    assert expected in ev('document.querySelector("textarea[name=message]").value')
    assert ev('!!document.querySelector("#contact .conversation-falling.is-landed")')
ev('document.querySelector("textarea[name=message]").value="My own carefully written draft";document.querySelector("#contact .conversation-options button").click()')
ev('document.querySelector("#contact .conversation-actions button:last-child").click()')
time.sleep(.8)
assert ev('document.querySelector("textarea[name=message]").value')=='My own carefully written draft'
ev('document.querySelector("#contact .conversation-game").scrollIntoView({behavior:"instant",block:"center"})')
run('screenshot','/private/tmp/contact-piece-desktop.png')
run('set','viewport','390','844')
if ev('location.href')=='about:blank':run('open',url)
ev('document.querySelector("#contact .conversation-game").scrollIntoView({behavior:"instant"})')
assert ev('document.documentElement.scrollWidth<=innerWidth')
assert ev('[...document.querySelectorAll(".conversation-game button")].every(e=>e.getBoundingClientRect().height>=44)')
run('screenshot','/private/tmp/contact-piece-mobile.png')
errors=run('errors').get('errors',[]);assert not errors,errors
result={'url':url,'selectionRotationAndActualPrefill':'all three conversations pass','mobileOverflow':False,'touchTargets':'44px minimum','errors':errors}
Path('/private/tmp/contact-piece-results.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
