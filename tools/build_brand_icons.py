#!/usr/bin/env python3
"""Export actual Simple Icons brand geometry into standalone SVG; no fonts are shipped."""
import json,re
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
BASE=Path(__file__).resolve().parents[1]
DATA=json.loads((BASE/'catalog.json').read_text())
FONT='/usr/share/texlive/texmf-dist/fonts/opentype/public/simpleicons/SimpleIcons.otf'
COLORS={'tor-browser':'#AE82E5','firefox':'#FFB55A','proton-drive':'#AC9AFF','proton-mail':'#BFA7FF','tuta':'#FF6E73','simplelogin':'#37D29C','mullvad':'#FFA95E','proton-vpn':'#A993FF','startpage':'#91CBFF','searxng':'#69BFDD','monero':'#FF750C','bitwarden':'#62A5FF','keepassxc':'#D8D98A','cryptomator':'#ED675F','signal':'#79AEFF','threema':'#6FDC86','session':'#58C3A7','openstreetmap':'#8BCE74','tails':'#D0B6F3','have-i-been-pwned':'#EBAE6C','ffmpeg':'#67B970','virustotal':'#84BCED','libretranslate':'#72C7E5','obtainium':'#9DD7D6','f-droid':'#70D8A7','tailscale':'#E9EBF2','aegis-authenticator':'#C6A5E9'}
font=TTFont(FONT); glyphset=font.getGlyphSet(); glyphs={x.removesuffix('icon'):x for x in font.getGlyphOrder()}
count=0
for item in DATA:
  k=re.sub('[^a-z0-9]','',item['name'].lower()); k=k if k in glyphs else item['id'].replace('-','')
  if k not in glyphs: continue
  glyph=glyphset[glyphs[k]];pen=SVGPathPen(glyphset);glyph.draw(pen);bounds=BoundsPen(glyphset);glyph.draw(bounds)
  if not bounds.bounds:continue
  minx,miny,maxx,maxy=bounds.bounds;d=pen.getCommands();fill=COLORS.get(item['id'],'#EAEAEA')
  scale=.88*128/max(maxx-minx,maxy-miny);tx=64-(minx+maxx)*scale/2;ty=64+(miny+maxy)*scale/2
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Marca de {item["name"]}"><title>{item["name"]}</title><path d="{d}" transform="translate({tx:.4f} {ty:.4f}) scale({scale:.6f} {-scale:.6f})" fill="{fill}"/></svg>'
  (BASE/'assets'/'brand'/f"{item['id']}.svg").write_text(svg,encoding='utf8');item['brandIcon']=f"assets/brand/{item['id']}.svg";count+=1
(BASE/'catalog.json').write_text(json.dumps(DATA,ensure_ascii=False,indent=2),encoding='utf8')
print('Authentic included logos:',count)
