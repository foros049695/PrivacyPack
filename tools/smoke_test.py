"""Smoke tests by inlining files into a browser page when localhost is blocked."""
import json,base64
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
css=(root/'style.css').read_text()
script=(root/'app.js').read_text()
data=(root/'catalog.json').read_text()
cat=(root/'categories.json').read_text()
svg={str(p.relative_to(root)):base64.b64encode(p.read_bytes()).decode('ascii') for p in (root/'assets').rglob('*.svg')}
pre=f'''const originals={json.dumps(svg)};
const desc=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
Object.defineProperty(HTMLImageElement.prototype,'src',{{get(){{return desc.get.call(this)}},set(v){{let k=String(v).replace(/^\\.\\//,'');desc.set.call(this,k in originals?'data:image/svg+xml;base64,'+originals[k]:v)}}}});
window.fetch=async (u)=>{{if(String(u).includes('catalog.json'))return new Response({json.dumps(data)},{{status:200}});if(String(u).includes('categories.json'))return new Response({json.dumps(cat)},{{status:200}});return new Response('',{{status:404}})}};
'''
html=html.replace('<link rel="stylesheet" href="./style.css">','<style>'+css+'</style>').replace('<script src="./app.js" defer></script>','<script>'+pre+'</script><script>'+script+'</script>')
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1400,'height':850});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html);page.wait_for_timeout(700)
 assert '104' in page.locator('#mapStatus').inner_text()
 assert len(json.loads(data))==104
 page.locator('#filters').get_by_role('button',name='Android').click()
 assert 'Android' in page.locator('#sheet').inner_text()
 page.locator('.branch-preview button').first.click()
 assert page.locator('#sheet').locator('.branch-preview button').count()>0
 page.locator('#sheet').locator('.branch-preview button').first.click()
 assert page.locator('.sheet-buttons .primary').count()==1
 page.locator('.sheet-buttons button').first.click()
 assert page.locator('#comparison').evaluate('(x)=>!x.hidden')
 assert page.locator('table.compare-table tr').count()>=7
 page.locator('#compareClose').click()
 page.locator('#searchBox').fill('Canta')
 page.locator('#searchBox').press('Enter')
 assert 'Canta' in page.locator('#sheet .sheet-title').inner_text()
 page.locator('#expandBtn').click();page.wait_for_timeout(150)
 assert 'EXPANDED' in page.locator('#mapStatus').inner_text()
 page.locator('#collapseBtn').click();page.wait_for_timeout(150)
 assert page.locator('#sheet').inner_text().find('Um universo de ferramentas.')>=0
 page.locator('#libraryBtn').click();assert page.locator('.library-entry').count()==104
 page.locator('#libraryOS').select_option('Só Windows');assert page.locator('.library-entry').count()>=1
 page.locator('#libraryClose').click()
 assert not errors,errors
 print('DESKTOP smoke: PASS / cards, categories, comparison, search, expand, collapse, Windows-only')
 page.close()
 phone=b.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 phone.on('pageerror',lambda e:errors.append(str(e)))
 phone.set_content(html);phone.wait_for_timeout(700)
 phone.locator('#filters').get_by_role('button',name='Android').click()
 assert 'open' in phone.locator('#inspector').get_attribute('class')
 assert phone.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
 phone.locator('#mobileClose').click();assert 'open' not in phone.locator('#inspector').get_attribute('class')
 print('MOBILE smoke: PASS / bottom sheet, close, no page overflow')
 assert not errors,errors
 b.close()
