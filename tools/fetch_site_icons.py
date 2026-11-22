#!/usr/bin/env python3
"""Fetch genuine publisher/site marks as images for PrivacyPack Wiki's PWA.

Network is required only at BUILD TIME (GitHub Actions). This tool uses official
project repositories/Android app listing art where available, then first-party
site favicons; some missing entries use a publisher avatar or favicon fallback.
These marks remain property of their respective trademark owners.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
from urllib.parse import urlparse,urljoin,quote
from html.parser import HTMLParser
from xml.etree import ElementTree as ET
import urllib.request,urllib.error,os,json,re,threading
BASE=Path(__file__).resolve().parents[1]
CAT=json.loads((BASE/'catalog.json').read_text())
OUT=BASE/'assets'/'site';OUT.mkdir(parents=True,exist_ok=True)
TOKEN=os.environ.get('GITHUB_TOKEN','')
HEADERS={'User-Agent':'PrivacyPackWiki/4 (IconIndexer; GitHub Pages build)','Accept':'image/png,image/webp,image/jpeg,image/svg+xml,image/x-icon,*/*;q=.5'}
PKG={
 'atak-civ':'com.atakmap.app.civ',
 'aegis-authenticator':'com.beemdevelopment.aegis','rethinkdns':'com.celzero.bravedns',
 'shelter':'net.typeblog.shelter','insular-island':'com.oasisfeng.island.fdroid',
 'shizuku':'moe.shizuku.privileged.api','ytdlnis':'com.deniscerri.ytdl',
 'sd-maid-2-se':'eu.darken.sdmse','libretorrent':'org.proninyaroslav.libretorrent',
 'orbot':'org.torproject.android','canta':'org.samo_lego.canta',
 'f-droid':'org.fdroid.fdroid','ente-photos':'io.ente.photos',
 'ente-auth':'io.ente.auth','obtainium':'dev.imranr.obtainium',
 'osmand':'net.osmand.plus',
}
class Icons(HTMLParser):
 def __init__(self):super().__init__();self.icons=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);url=a.get('content','') or a.get('href','') or a.get('src','')
  if tag=='meta' and a.get('property','').lower() in {'og:image','twitter:image'} and url:self.icons.append(url)
  if tag=='link' and 'icon' in a.get('rel','').lower() and url:self.icons.append(url)
  if tag=='img' and ('icon' in a.get('class','').lower() or 'logo' in a.get('class','').lower()) and url:self.icons.insert(0,url)
def fetch(url,timeout=6,limit=900_000,api=False):
 try:
  headers=HEADERS.copy()
  if api and TOKEN:headers['Authorization']='Bearer '+TOKEN
  with urllib.request.urlopen(urllib.request.Request(url,headers=headers),timeout=timeout) as r:
   if r.status!=200:return None
   d=r.read(limit+1)
   return d if len(d)<=limit else None
 except Exception:return None
def detect(b):
 if not b or len(b)<100:return None
 if b[:8]==b'\x89PNG\r\n\x1a\n':return 'png'
 if b[:4]==b'RIFF' and b[8:12]==b'WEBP':return 'webp'
 if b[:3]==b'\xff\xd8\xff':return 'jpg'
 if b[:4]==b'\x00\x00\x01\x00':return 'ico'
 if b'<svg' in b[:800] and b.find(b'<script')==-1:
  try:
   root=ET.fromstring(b)
   for e in root.iter():
    tag=e.tag.rsplit('}',1)[-1].lower()
    if tag in ('script','foreignobject','iframe','image','animate','set'):return None
    for k,v in e.attrib.items():
     if k.lower().startswith('on') or k.rsplit('}',1)[-1].lower()=='href' and re.match(r'https?:|//|data:',v,re.I):return None
   return 'svg'
  except Exception:return None
 return None
def github_candidates(item):
 """Look for app logo assets in the actual repository, not GitHub's generic favicon."""
 u=urlparse(item['url'])
 if u.hostname!='github.com':return []
 parts=u.path.strip('/').split('/')
 if len(parts)<2:return []
 owner,repo=parts[:2]
 info=fetch(f'https://api.github.com/repos/{quote(owner)}/{quote(repo)}',api=True)
 if not info:return []
 try:branch=json.loads(info).get('default_branch','main')
 except:return []
 tree=fetch(f'https://api.github.com/repos/{quote(owner)}/{quote(repo)}/git/trees/{quote(branch)}?recursive=1',timeout=8,limit=3_500_000,api=True)
 if not tree:return []
 try:paths=[x for x in json.loads(tree).get('tree',[]) if x.get('type')=='blob' and (x.get('size') or 0)<=700000]
 except:return []
 found=[]
 for o in paths:
  name=o['path'];fn=name.split('/')[-1].lower();low=name.lower()
  if not fn.endswith(('.png','.svg','.webp','.jpg','.jpeg')):continue
  if any(y in low for y in ['screenshot','screencap','test/','preview','badge','mockup','banner','cover','splash','src/test','sample/','resized/','press-kit']):continue
  if not any(y in fn for y in ['logo','icon','launcher','brand']):continue
  score=0
  if fn in ('icon.png','icon.svg','logo.png','logo.svg','app-icon.png','app_icon.png'):score+=50
  if 'mipmap-xxxhdpi' in low:score+=43
  if 'fastlane/metadata' in low or 'metadata/android' in low:score+=40
  if 'ic_launcher' in low:score+=34
  if 'assets' in low:score+=11
  if 'web' in low and '/favicon' in fn:score-=20
  if 'foreground' in low:score-=10
  score-=len(name)*.03
  found.append((score,name))
 found.sort(reverse=True)
 return [f'https://raw.githubusercontent.com/{quote(owner)}/{quote(repo)}/{quote(branch)}/{"/".join(quote(part) for part in path.split("/"))}' for _,path in found[:5]]
def site_candidates(item):
 url=item['url'];u=urlparse(url);host=u.hostname or '';sources=[]
 pkg=PKG.get(item['id'])
 if pkg:
  src='https://f-droid.org/packages/'+quote(pkg)+'/' if item['id']!='atak-civ' else 'https://play.google.com/store/apps/details?id=com.atakmap.app.civ&hl=en'
  doc=fetch(src,limit=600_000)
  if doc:
   parser=Icons();parser.feed(doc.decode('utf8','ignore'))
   sources.extend(('android-listing',urljoin(src,i)) for i in parser.icons if i)
 if host=='github.com':
  sources.extend(('repository',u) for u in github_candidates(item))
 else:
  doc=fetch(url,limit=600_000)
  if doc:
   parser=Icons();parser.feed(doc.decode('utf8','ignore'))
   sources.extend(('official-site',urljoin(url,i)) for i in parser.icons if i)
  sources.append(('official-site',f'{u.scheme}://{host}/favicon.ico'))
  sources.append(('site-favicon',f'https://www.google.com/s2/favicons?domain={quote(host)}&sz=128'))
 if host=='github.com':
  parts=u.path.strip('/').split('/')
  if len(parts)>=2:sources.append(('publisher-avatar',f'https://github.com/{quote(parts[0])}.png?size=128'))
 return list(dict.fromkeys(sources))
def work(item):
 if item.get('brandIcon'):return (item['id'],'brand-vector',None)
 existing=list(OUT.glob(item['id']+'.*'))
 if any(p.stat().st_size>=250 for p in existing):return (item['id'],'previous-build',None)
 for kind,url in site_candidates(item):
  if not url.startswith('https://'):continue
  data=fetch(url)
  ext=detect(data)
  if not ext:continue
  # Discard generic or tiny favicon placeholders (< 200 B) before caching.
  if ext not in ('svg',) and len(data)<220:continue
  dest=OUT/f"{item['id']}.{ext}";dest.write_bytes(data)
  return (item['id'],kind,url)
 return (item['id'],'missing',None)
results={}
with ThreadPoolExecutor(max_workers=9) as executor:
 futures={executor.submit(work,a):a['name'] for a in CAT}
 for future in as_completed(futures):
  try:key,kind,url=future.result()
  except Exception as ex:
   print(futures[future],ex,flush=True);continue
  results[key]={'sourceType':kind,'sourceURL':url}
  print(f'{key}: {kind}',flush=True)
(BASE/'logo-sources.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print('Local images:',len(list(OUT.iterdir())),'of',len(CAT),'tools')
