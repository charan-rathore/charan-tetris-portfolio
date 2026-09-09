import subprocess,json,time
from pathlib import Path
B='/Users/charanrathore/.npm/_npx/6de2aa2fded2970c/node_modules/agent-browser/bin/agent-browser-darwin-arm64';out=Path(__file__).parent

def run(*args):
 p=subprocess.run([B,'--session','portfolio-local','--json',*args],capture_output=True,text=True,timeout=40);r=json.loads(p.stdout)
 if not r.get('success'):raise RuntimeError(r)
 return r.get('data',{}).get('result')
def ev(js):return run('eval',js)
results={}
run('find','role','button','click','--name','ANALYZE','--exact');results['miqConnection']=ev('document.querySelector(".mcp-output").innerText.includes("MiQ")')
run('find','role','button','click','--name','PLAY','--exact');time.sleep(1)
run('click','.arcade .start-button');run('press','ArrowLeft');run('press','Space');time.sleep(.5)
results['gameScoresAfterDrop']=ev('Number(document.querySelector(".stat b").textContent)>0')
run('click','.game-pause');results['pauseWorks']=ev('document.querySelector(".board-overlay").innerText.includes("PAUSED")')
run('screenshot',str(out/'arcade-desktop.png'))
run('eval','document.querySelector(".bonus-game").open=false; document.querySelector(".project-grid").scrollIntoView()');time.sleep(1.2)
results['automaticProjectAssembly']=ev('document.querySelectorAll(".project-level.is-landed").length>=1')
results['projectImages']=ev('Array.from(document.querySelectorAll(".project-photo")).every(i=>i.complete && i.naturalWidth>0)')
run('screenshot',str(out/'projects-desktop.png'))
run('eval','document.querySelector(".gh-pulse").scrollIntoView()');time.sleep(.5)
run('click','.gh-refresh');time.sleep(1)
results['githubRuntimeFeed']=ev('document.querySelector(".gh-sync-bar").innerText')
run('click','.gh-chart-bar');results['activityDaySelection']=ev('document.querySelector(".gh-day-detail").innerText')
run('screenshot',str(out/'github-desktop.png'))
run('eval','document.querySelector(".bonus-game").open=true')
# Simulate actual context loss; scene must recover without losing the page/game.
results['contextLossRequested']=ev('(()=>{const c=document.querySelector(".board-live canvas");const gl=c.getContext("webgl2");const ext=gl?.getExtension("WEBGL_lose_context");ext?.loseContext();return !!ext})()')
time.sleep(1)
results['fallbackAfterContextLoss']=ev('!!document.querySelector(".board-canvas-2d")')
run('set','viewport','390','844');run('eval','window.scrollTo(0,0)');time.sleep(.6)
results['mobileNoOverflow']=ev('document.documentElement.scrollWidth<=window.innerWidth')
results['mobileNavigationVisible']=ev('getComputedStyle(document.querySelector(".site-header nav")).display!=="none"')
run('screenshot',str(out/'hero-mobile.png'))
run('find','role','button','click','--name','PLAY','--exact');time.sleep(.7)
results['mobileTouchTargets']=ev('Array.from(document.querySelectorAll(".touch-controls button")).map(b=>({name:b.ariaLabel,w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}))')
run('screenshot',str(out/'arcade-mobile.png'))
(out/'browser-results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
