import json,base64,re,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
base=Path(__file__).resolve().parents[1]
html=(base/'index.html').read_text()
css=(base/'style.css').read_text();js=(base/'app.js').read_text()
cat=(base/'catalog.json').read_text();cats=(base/'categories.json').read_text()
resources={str(p.relative_to(base)):base64.b64encode(p.read_bytes()).decode('ascii') for p in (base/'assets').rglob('*.svg')}
script=f"""const __FILES={json.dumps(resources)};
const __proto=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{{get(){{return __proto.get.call(this)}},set(v){{let path=String(v).replace(/^\\.\\//,'');if(path in __FILES){{__proto.set.call(this,'data:image/svg+xml;base64,'+__FILES[path]);return}}__proto.set.call(this,v)}}}});
window.fetch=async function(url){{if(String(url).includes('catalog.json'))return new Response({json.dumps(cat)},{ {'status':200} });if(String(url).includes('categories.json'))return new Response({json.dumps(cats)},{{status:200}});return new Response('',{{status:404}})}};
"""
html=html.replace('<link rel="stylesheet" href="./style.css">','<style>'+css+'</style>')
html=html.replace('<script src="./app.js" defer></script>','<script>'+script+'</script><script>'+js+'</script>')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for size,name in [({'width':1440,'height':900},'desktop'),({'width':390,'height':844},'mobile')]:
  page=browser.new_page(viewport=size)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded');page.wait_for_timeout(1800)
  print(name,'errors=',errors[:4]);print(name,'sheet=',page.locator('#sheet').inner_text()[:190])
  print(name,'filters',page.locator('#filters button').count(),'canvas',page.locator('canvas').evaluate('(e)=>[e.width,e.height]'))
  page.screenshot(path=str(base/f'preview-v4-{name}.png'))
  if name=='desktop':
   page.get_by_role('button',name='Android',exact=True).first.click();page.wait_for_timeout(600)
   print('android sheet',page.locator('#sheet').inner_text()[:200]);print('errors after platform',errors[:4]);page.screenshot(path=str(base/'preview-v4-android.png'))
   page.locator('#libraryBtn').click();page.wait_for_timeout(300);print('library entries',page.locator('.library-entry').count());page.screenshot(path=str(base/'preview-v4-library.png'))
   page.locator('.library-entry').first.click();page.wait_for_timeout(500);print('tool sheet',page.locator('#sheet').inner_text()[:220]);page.screenshot(path=str(base/'preview-v4-sheet.png'))
   page.locator('.sheet-buttons button').first.click();page.wait_for_timeout(400);print('compare hidden',page.locator('#comparison').evaluate('(el)=>el.hidden'))
   page.screenshot(path=str(base/'preview-v4-compare.png'))
  else:
   page.get_by_role('button',name='Android',exact=True).first.click();page.wait_for_timeout(500)
   print('mobile sheet open',page.locator('#inspector').get_attribute('class'))
   page.screenshot(path=str(base/'preview-v4-mobile-sheet.png'))
  page.close()
 browser.close()
