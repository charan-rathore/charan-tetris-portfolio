import json, subprocess, time, os
from pathlib import Path
B='/Users/charanrathore/.npm/_npx/6de2aa2fded2970c/node_modules/agent-browser/bin/agent-browser-darwin-arm64'
session=os.environ.get('PORTFOLIO_BROWSER_SESSION','portfolio-review')
def run(*args):
 p=subprocess.run([B,'--session',session,'--json',*args],capture_output=True,text=True,timeout=45)
 r=json.loads(p.stdout)
 if not r.get('success'):raise RuntimeError(r)
 d=r.get('data',{});return d.get('result',d)
def ev(js):return run('eval',js)
run('set','viewport','1440','1000');ev('window.scrollTo({top:0,behavior:"instant"})');time.sleep(.5)
r={'canvas':ev('!!document.querySelector(".thought-scene canvas")'),'avatarLoaded':ev('document.querySelector(".player-avatar img")?.naturalWidth>0')}
run('find','role','button','click','--name','Pause the thinking engine','--exact');time.sleep(.3)
before=ev('document.querySelector(".thought-score").innerText');time.sleep(2)
r['pauseStopsScoring']=before==ev('document.querySelector(".thought-score").innerText')
run('find','role','button','click','--name','DROP IDEA ↓','--exact');time.sleep(.3)
r['manualDropScores']=before!=ev('document.querySelector(".thought-score").innerText')
run('screenshot',str(Path(__file__).parent/(session+'-thought-desktop.png')))
run('set','viewport','390','844');ev('window.scrollTo({top:0,behavior:"instant"})');time.sleep(.3)
r['noMobileOverflow']=ev('document.documentElement.scrollWidth<=innerWidth')
r['nextPieceInsideControls']=ev('(()=>{const a=document.querySelector(".thought-next").getBoundingClientRect(),b=document.querySelector(".thought-controls").getBoundingClientRect();return a.top>=b.top&&a.bottom<=b.bottom})()')
r['buttonTargets']=ev('[...document.querySelectorAll(".thought-controls button")].map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))')
run('screenshot',str(Path(__file__).parent/(session+'-thought-mobile.png')))
ev('document.querySelector(".thought-scene canvas").dispatchEvent(new Event("webglcontextlost",{cancelable:true}))');time.sleep(.2)
r['staticFallback']=ev('getComputedStyle(document.querySelector(".thought-fallback")).display!=="none"&&getComputedStyle(document.querySelector(".thought-scene canvas")).visibility==="hidden"')
r['browserErrors']=run('errors').get('errors',[])
Path(__file__).with_name(session+'-thought-results.json').write_text(json.dumps(r,indent=2));print(json.dumps(r,indent=2))
assert all(r[k] for k in ['canvas','avatarLoaded','pauseStopsScoring','manualDropScores','noMobileOverflow','nextPieceInsideControls','staticFallback']) and not r['browserErrors']
assert all(b['height']>=44 and b['width']>=44 for b in r['buttonTargets'])
