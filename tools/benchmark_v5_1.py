from pathlib import Path
import json,base64,time
from playwright.sync_api import sync_playwright
base=Path('/mnt/data/PrivacyPack_Wiki_v5_1')
html=(base/'index.html').read_text().replace('<link rel="stylesheet" href="./style.css">','<style>'+(base/'style.css').read_text()+'</style>')
resources={key:(base/key).read_text() for key in ['catalog.json','categories.json','install-guides.json']}
images={str(p.relative_to(base)):base64.b64encode(p.read_bytes()).decode() for p in (base/'assets').rglob('*.svg')}
pre=f"const resources={json.dumps(resources)}, originalImages={json.dumps(images)}; const oldSrc=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{{get(){{return oldSrc.get.call(this)}},set(v){{const k=String(v).replace(/^\\.\\//,'');oldSrc.set.call(this,k in originalImages?'data:image/svg+xml;base64,'+originalImages[k]:v)}}}});window.fetch=async uri=>{{const k=String(uri).replace(/^\\.\\//,'');return k in resources?new Response(resources[k],{{status:200}}):new Response('',{{status:404}})}};"
html=html.replace('<script src="./app.js" defer></script>',f'<script>{pre}</script><script>'+(base/'app.js').read_text()+'</script>')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-background-timer-throttling'])
 page=browser.new_page(viewport={'width':1600,'height':900},device_scale_factor=1)
 errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html);page.wait_for_timeout(2400)
 print('Auto FPS initial:',page.locator('#fpsMeter').inner_text())
 page.locator('#expandBtn').click();page.wait_for_timeout(2200)
 print('Auto FPS expanded:',page.locator('#fpsMeter').inner_text())
 page.locator('#settingsBtn').click();page.locator('#performanceSelect').select_option('eco');page.locator('#settingsClose').click();page.wait_for_timeout(2400)
 print('Eco FPS expanded:',page.locator('#fpsMeter').inner_text())
 page.locator('#settingsBtn').click();page.locator('#motionSwitch').uncheck();page.locator('#settingsClose').click();page.wait_for_timeout(200)
 print('Motion off canvas draw indicator:',page.locator('#fpsMeter').inner_text())
 print('Canvas resolution:',page.locator('#graphCanvas').evaluate('(c)=>[c.width,c.height,c.clientWidth,c.clientHeight]'))
 print('Errors:',errors)
 page.screenshot(path=str(base/'preview-v5-1-performance.png'))
 browser.close()
