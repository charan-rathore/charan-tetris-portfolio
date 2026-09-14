"""Verify an open, real Brave session; BROWSER_SESSION defaults to brave-local."""
import json, os, subprocess, time
from pathlib import Path

browser = os.environ.get('AGENT_BROWSER', '/Users/charanrathore/.npm/_npx/6de2aa2fded2970c/node_modules/agent-browser/bin/agent-browser-darwin-arm64')
session = os.environ.get('BROWSER_SESSION', 'brave-local')
output = Path(os.environ.get('VERIFICATION_OUTPUT', '/private/tmp/portfolio-brave-scenes'))
output.mkdir(parents=True, exist_ok=True)

def run(*args):
    proc = subprocess.run([browser, '--session', session, '--json', *args], capture_output=True, text=True, timeout=45)
    response = json.loads(proc.stdout)
    assert response.get('success'), response
    data = response.get('data', {})
    return data.get('result', data)

def ev(script): return run('eval', script)

run('set', 'viewport', '1440', '1000')
run('open', os.environ.get('PORTFOLIO_URL', 'http://localhost:3005'))
ev('window.scrollTo({top:0,behavior:"instant"})')
assert ev('!!navigator.brave')
time.sleep(2)
result = {'url': ev('location.href'), 'browser': 'Brave'}
result['graphics'] = ev('[...document.querySelectorAll(".vector-opening")].map(el=>({renderer:el.dataset.renderer,svg:!!el.querySelector("svg"),canvas:!!el.querySelector("canvas")}))')
assert len(result['graphics']) == 2
assert all(row['renderer'] == 'isometric-svg' and row['svg'] and not row['canvas'] for row in result['graphics'])
for mode in ['ANALYZE', 'CONNECT', 'BUILD']:
    run('find', 'role', 'button', 'click', '--name', mode, '--exact')
    time.sleep(.4)
    assert ev('document.querySelector(".bridge-render").dataset.ready==="true"')
run('find', 'role', 'button', 'click', '--name', 'Pause the thinking engine', '--exact')
before = ev('document.querySelector(".thought-score").innerText')
time.sleep(1.8)
assert before == ev('document.querySelector(".thought-score").innerText')
run('find', 'role', 'button', 'click', '--name', 'DROP IDEA ↓', '--exact')
time.sleep(.3)
assert before != ev('document.querySelector(".thought-score").innerText')
result['controls'] = 'mode changes, pause, manual drop pass'
run('screenshot', str(output/'desktop.png'))
run('set', 'viewport', '390', '844')
if ev('location.href') == 'about:blank': run('open', result['url'])
ev('window.scrollTo({top:0,behavior:"instant"})')
time.sleep(.3)
assert ev('document.documentElement.scrollWidth<=innerWidth')
assert ev('[...document.querySelectorAll(".thought-controls button")].every(el=>{const r=el.getBoundingClientRect();return r.width>=44&&r.height>=44})')
result['mobile'] = 'no overflow; targets at least 44px'
run('screenshot', str(output/'mobile.png'))
result['errors'] = run('errors').get('errors', [])
assert not result['errors']
(output/'results.json').write_text(json.dumps(result, indent=2))
print(json.dumps(result, indent=2))
