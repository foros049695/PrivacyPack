#!/usr/bin/env python3
"""Use verified, locally present official/app/site icons in published catalog."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
items=json.loads((root/'catalog.json').read_text())
try:origins=json.loads((root/'logo-sources.json').read_text())
except:origins={}
for item in items:
 for ext in ('png','webp','svg','jpg','ico'):
  target=root/'assets'/'site'/f"{item['id']}.{ext}"
  if target.is_file() and target.stat().st_size>100:
   item['localSiteIcon']='assets/site/'+target.name
   item['iconSource']=origins.get(item['id'],{}).get('sourceType','website')
   break
(root/'catalog.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
