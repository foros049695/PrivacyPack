"""Smoke tests for the V5 static PWA with an inline/offline fixture (localhost blocked)."""
import json, base64
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text();css=(root/'style.css').read_text();js=(root/'app.js').read_text()
data={name:(root/name).read_text() for name in ['catalog.json','categories.json','install-guides.json']}
images={str(p.relative_to(root)):base64.b64encode(p.read_bytes()).decode() for p in (root/'assets').rglob('*.svg')}
prefill='''const resources={RESOURCES}, originalImages={IMAGES};
const oldSrc=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
Object.defineProperty(HTMLImageElement.prototype,'src',{get(){return oldSrc.get.call(this)},set(value){const key=String(value).replace(/^\\.\\//,'');oldSrc.set.call(this,key in originalImages?'data:image/svg+xml;base64,'+originalImages[key]:value)}});
window.fetch=async uri=>{const key=String(uri).replace(/^\\.\\//,'');return key in resources?new Response(resources[key],{status:200}):new Response('',{status:404})};
'''.replace('{RESOURCES}',json.dumps(data)).replace('{IMAGES}',json.dumps(images))
html=html.replace('<link rel="stylesheet" href="./style.css">','<style>'+css+'</style>')
html=html.replace('<script src="./app.js" defer></script>','<script>'+prefill+'</script><script>'+js+'</script>')
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 errors=[]
 desktop=browser.new_page(viewport={'width':1536,'height':864});desktop.on('pageerror',lambda x:errors.append(str(x)))
 desktop.set_content(html);desktop.wait_for_timeout(850)
 assert '104 TOOLS' in desktop.locator('#mapStatus').inner_text(),desktop.locator('#mapStatus').inner_text()
 desktop.locator('#filters').get_by_role('button',name='Linux',exact=True).click();desktop.wait_for_timeout(550)
 desktop.screenshot(path=str(root/'preview-v5-linux.png'))
 desktop.locator('.branch-preview button').first.click();desktop.locator('.branch-preview button').first.click()
 assert desktop.locator('.sheet-install-cta').count()==1
 desktop.locator('.sheet-install-cta').click()
 assert desktop.locator('#installGuide').is_visible()
 assert desktop.locator('#installPlatformGrid button').count()>=1
 assert desktop.locator('#installInstructions li').count()>=1
 desktop.screenshot(path=str(root/'preview-v5-install.png'))
 desktop.locator('#installClose').click()
 desktop.locator('#homeBtn').click()
 desktop.locator('#searchBox').fill('Shizuku');desktop.locator('#searchBox').press('Enter');desktop.locator('.sheet-install-cta').click()
 assert desktop.locator('#installPlatformGrid button').count()==1
 assert desktop.locator('#installVersions button').count()==3
 assert 'Depuração sem fio' in desktop.locator('#installInstructions').inner_text()
 desktop.locator('#installClose').click()
 desktop.locator('#homeBtn').click()
 desktop.locator('#searchBox').fill('KeePassXC');desktop.locator('#searchBox').press('Enter');desktop.locator('.sheet-install-cta').click()
 desktop.locator('#installPlatformGrid').get_by_role('button',name='Linux').click()
 assert 'sudo apt install keepassxc' in desktop.locator('#installInstructions').inner_text()
 assert desktop.locator('.install-codebox button').count()==1
 desktop.locator('#installClose').click()
 desktop.locator('#expandBtn').click();desktop.wait_for_timeout(330)
 assert 'EXPANDED' in desktop.locator('#mapStatus').inner_text()
 desktop.locator('#collapseBtn').click();assert desktop.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
 print('DESKTOP: graph, manual, variants, commands, 104 entries, no overflow: PASS')
 phone=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,has_touch=True,is_mobile=True)
 phone.on('pageerror',lambda x:errors.append(str(x)))
 phone.set_content(html);phone.wait_for_timeout(850)
 phone.locator('#searchBox').fill('Canta');phone.locator('#searchBox').press('Enter')
 phone.locator('.sheet-install-cta').click();assert phone.locator('#installGuide').is_visible()
 phone.screenshot(path=str(root/'preview-v5-mobile-install.png'))
 assert phone.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
 assert phone.evaluate('document.querySelector(".install-window").clientWidth<=window.innerWidth')
 phone.locator('#installClose').click()
 assert phone.locator('#filters').evaluate('(e)=>e.scrollWidth>=e.clientWidth')
 print('MOBILE: Android installation modal, scrollable filters, no document overflow: PASS')
 assert not errors,errors
 browser.close()
