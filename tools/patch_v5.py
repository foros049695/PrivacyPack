from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
html=html.replace('PrivacyPack Wiki — Mapa de ferramentas','PrivacyPack Wiki V5 — Mapa e instalações')
html=html.replace(' <div id="mobileShade"',' <div id="mobileShade"')
fragment='''
<section id="installGuide" class="overlay" hidden aria-labelledby="installTitle" role="dialog" aria-modal="true">
 <div class="install-window">
  <header class="drawer-header install-heading">
   <div><small>PRIVACYPACK / INSTALLATION DESK</small><h2 id="installTitle">Instalar ferramenta</h2><p id="installSubtitle">Selecione a plataforma compatível</p></div>
   <button id="installClose" class="round-close" aria-label="Fechar instruções">×</button>
  </header>
  <div id="installPlatformGrid" class="install-platform-grid" role="group" aria-label="Escolher sistema operacional"></div>
  <div id="installMethod" class="install-method" aria-live="polite"></div>
  <div id="installVersions" class="install-versions" role="group" aria-label="Escolher versão ou método de instalação"></div>
  <article id="installInstructions" class="install-instructions" aria-live="polite"></article>
  <footer class="install-footer">Comandos são exibidos apenas nos métodos documentados. Revise os comandos antes de executar; procedimentos gerais podem variar por edição, arquitetura ou fornecedor.</footer>
 </div>
</section>
'''
html=html.replace('<section id="settings"',fragment+'<section id="settings"')
assert 'installGuide' in html
(root/'index.html').write_text(html)

js=(root/'app.js').read_text()
js=js.replace("const VERSION='4.0.0'","const VERSION='5.0.0'")
js=js.replace("const STATE_KEY='privacypack-wiki-v4'","const STATE_KEY='privacypack-wiki-v4'") # preserve user data!
js=js.replace('let all=[],cats=[],byId=new Map(),os=', 'let installGuides={},installCurrent="",installPlatform="",installVariant=0;\nlet all=[],cats=[],byId=new Map(),os=')
js=js.replace("buttons.append(link,comp,fav);block.append(buttons);", "buttons.append(link,comp,fav);block.append(buttons);const installButton=asButton('↓ Instruções de instalação',()=>openInstallation(a.id),'sheet-install-cta');installButton.setAttribute('aria-label','Abrir instruções de instalação do '+a.name);block.append(installButton);")
js=js.replace("closeOverlay('library');$('searchBox').value='';search='';setSelection({a:a.id})", "closeOverlay('library');$('searchBox').value='';search='';setSelection({a:a.id})")
js=js.replace("['library','settings','comparison'].every", "['library','settings','comparison','installGuide'].every")
installjs=r'''
/* Installation Desk: platform/version chooser, offline guides and copyable verified commands. */
function openInstallation(id){
 const app=byId.get(id);if(!app)return;
 installCurrent=id;installPlatform=app.platforms.includes(platform)?platform:app.platforms[0];installVariant=0;
 const title=$('installTitle');title.textContent='Instalar '+app.name;
 $('installSubtitle').textContent=app.cat+' · '+app.platforms.length+' ambiente(s) compatível(is) no catálogo';
 openOverlay('installGuide');renderInstallation();
}
function renderInstallation(){
 const app=byId.get(installCurrent);if(!app)return;
 const data=installGuides[app.id]||{};
 const variants=data.platforms||{};
 const platforms=$('installPlatformGrid');platforms.replaceChildren();
 for(const p of app.platforms){
  const b=document.createElement('button');b.type='button';b.className='install-os-option'+(p===installPlatform?' selected':'');b.setAttribute('aria-pressed',String(p===installPlatform));
  const img=document.createElement('img');img.src=osIcon(p);img.alt='';b.append(img,document.createTextNode(p));
  b.onclick=()=>{installPlatform=p;installVariant=0;renderInstallation()};platforms.append(b);
 }
 const guide=variants[installPlatform];
 if(!guide){$('installMethod').textContent='Ainda não há informações verificadas para esta plataforma.';$('installVersions').replaceChildren();$('installInstructions').replaceChildren();return}
 $('installMethod').innerHTML='<span class="install-method-label">'+escape(guide.method)+'</span><span class="guide-status '+(guide.status==='verificado'?'verified':'')+'">'+(guide.status==='verificado'?'Método documentado':guide.status==='web'?'Acesso pela web':'Orientação geral · confirme no site')+'</span>';
 const panel=$('installVersions');panel.replaceChildren();const versions=guide.versions||[];
 for(let i=0;i<versions.length;i++){
  const v=versions[i],b=document.createElement('button');b.type='button';b.className='install-version'+(installVariant===i?' active':'');b.setAttribute('aria-pressed',String(installVariant===i));b.textContent=v.name;
  b.onclick=()=>{installVariant=i;renderInstallation()};panel.append(b);
 }
 const version=versions[installVariant]||{},steps=version.steps||guide.steps||[];
 const dest=$('installInstructions');dest.replaceChildren();
 const topline=document.createElement('div');topline.className='install-step-head';topline.innerHTML='<span>INSTRUÇÕES · '+escape(installPlatform.toUpperCase())+'</span><span>'+escape(version.name||guide.method)+'</span>';dest.append(topline);
 const status=document.createElement('div');status.className='install-status-note';status.textContent=(version.status==='verificado'||(!version.status&&guide.status==='verificado'))?'Procedimento com fonte de referência específica. Confira se a versão continua disponível.':'Procedimento de instalação geral: não há comando de pacote validado para esta variante.';dest.append(status);
 const list=document.createElement('ol');list.className='install-steps';for(const step of steps){const li=document.createElement('li');li.textContent=step;list.append(li)}dest.append(list);
 if(version.command){
  const codebox=document.createElement('div');codebox.className='install-codebox';
  const topl=document.createElement('div');topl.className='install-code-head';const label=document.createElement('strong');label.textContent='COMANDOS · REVISE ANTES DE EXECUTAR';
  const copy=asButton('Copiar comandos',async()=>{try{await navigator.clipboard.writeText(version.command);showToast('Comandos copiados. Revise-os antes de executar.')}catch{const area=document.createElement('textarea');area.value=version.command;document.body.append(area);area.select();document.execCommand('copy');area.remove();showToast('Comandos copiados.')}});
  copy.type='button';topl.append(label,copy);codebox.append(topl);const pre=document.createElement('pre');const code=document.createElement('code');code.textContent=version.command;pre.append(code);codebox.append(pre);dest.append(codebox);
 }
 if(guide.warning){const warn=document.createElement('div');warn.className='install-warning';const b=document.createElement('b');b.textContent='ATENÇÃO';const t=document.createElement('p');t.textContent=guide.warning;warn.append(b,t);dest.append(warn)}
 const links=document.createElement('div');links.className='install-links';
 const src=version.source||guide.url||app.url;for(const [text,url] of [['Documentação / download oficial ↗',src],...(src!==app.url?[['Página da ferramenta ↗',app.url]]:[])]){
  if(!/^https:\/\//.test(url))continue;const l=document.createElement('a');l.href=url;l.target='_blank';l.rel='noopener noreferrer';l.textContent=text;links.append(l)
 }dest.append(links);
}
'''
js=js.replace('function openComparison(id){',installjs+'\nfunction openComparison(id){')
js=js.replace("$('compareClose').onclick=()=>closeOverlay('comparison');", "$('installClose').onclick=()=>closeOverlay('installGuide');\n $('compareClose').onclick=()=>closeOverlay('comparison');")
js=js.replace("['library','comparison','settings'])$(id)","['library','comparison','settings','installGuide'])$(id)")
js=js.replace("['library','comparison','settings'])if(!$(id).hidden)","['library','comparison','settings','installGuide'])if(!$(id).hidden)")
js=js.replace("let [a,b]=await Promise.all([fetch('./catalog.json'),fetch('./categories.json')]);", "let [a,b,g]=await Promise.all([fetch('./catalog.json'),fetch('./categories.json'),fetch('./install-guides.json')]);")
js=js.replace('all=await a.json();cats=await b.json();','all=await a.json();cats=await b.json();installGuides=g.ok?await g.json():{};')
assert 'function openInstallation' in js and 'let [a,b,g]' in js and 'install-guides.json' in js
(root/'app.js').write_text(js)
css=(root/'style.css').read_text()
css+='''\n
/* V5: installation desk, responsive control rails and graph-safe labels. */
.install-window{background:#191818;border:1px solid #53504b;border-radius:18px;box-shadow:0 34px 110px #000d;width:min(960px,100%);max-height:min(94dvh,950px);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:24px}
.install-heading{margin-bottom:17px}.install-heading p{color:#a8a39e;margin:8px 0 0;font-size:12px}
.sheet-install-cta{display:block;width:100%;border:1px solid #548a99;background:#203540;color:#d8f3fc;text-align:center;padding:12px 8px;border-radius:11px;margin:14px 0 5px;cursor:pointer;font-weight:700;letter-spacing:.2px}.sheet-install-cta:hover,.sheet-install-cta:focus-visible{background:#2b4a55;outline:2px solid #7db5ca}
.install-platform-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(115px,1fr));gap:9px;margin-bottom:17px}.install-os-option{background:#242220;border:1px solid #514d48;border-radius:11px;padding:14px 8px;display:flex;gap:8px;justify-content:center;align-items:center;color:#c9c4bd;font-size:12px;cursor:pointer;min-height:57px}.install-os-option img{width:25px;height:25px;object-fit:contain}.install-os-option.selected{background:#343d47;color:#e9f8ff;border-color:#78b9e3;box-shadow:inset 0 0 0 1px #78b9e380}
.install-method{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:12px 0 14px;border-top:1px solid #383532}.install-method-label{font-size:13px;font-weight:700}.guide-status{font-size:10px;border:1px solid #746748;color:#efd9a3;background:#2c271c;border-radius:7px;padding:6px 9px}.guide-status.verified{color:#a3e5c4;border-color:#47795c;background:#1e362a}
.install-versions{display:flex;gap:8px;max-width:100%;overflow-x:auto;scrollbar-width:thin;padding:3px 0 13px}.install-version{flex:0 0 auto;max-width:250px;white-space:normal;background:#282624;color:#c6c1bb;border:1px solid #49443f;border-radius:7px;padding:9px 12px;font-size:11px;cursor:pointer}.install-version.active{color:#fff;border-color:#7db4d7;background:#334552}
.install-instructions{border:1px solid #3f3c39;background:#1e1c1b;border-radius:13px;padding:17px;overflow-wrap:anywhere}.install-step-head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;font:10px monospace;letter-spacing:.5px;color:#c0dfec}.install-status-note{padding:10px 0;font-size:11px;color:#b7b0a9;line-height:1.6}.install-steps{margin:12px 0 18px;padding-left:23px;color:#ded9d2;font-size:13px;line-height:1.75}.install-steps li{padding-left:6px;margin-bottom:8px}.install-codebox{border:1px solid #51606b;border-radius:10px;background:#101a22;overflow:hidden;margin:14px 0}.install-code-head{padding:10px 12px;border-bottom:1px solid #43505d;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}.install-code-head strong{font:10px monospace;color:#9bbdd2}.install-code-head button{border:1px solid #6b8294;background:#243844;color:#f1faff;border-radius:7px;padding:7px 12px;cursor:pointer}.install-codebox pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:0;padding:15px;font:12px/1.75 ui-monospace,monospace;color:#cfebdc;overflow-x:auto}.install-warning{margin:15px 0;padding:12px;background:#31271e;border-left:3px solid #d6a473;border-radius:5px}.install-warning b{font:10px monospace;color:#efc39a}.install-warning p{font-size:12px;line-height:1.65;color:#e0c7af;margin:5px 0 0}.install-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.install-links a{color:#c0e8fa;border:1px solid #496475;border-radius:8px;padding:10px 13px;text-decoration:none;font-size:12px;overflow-wrap:anywhere}.install-footer{margin-top:13px;color:#928e88;font-size:10px;line-height:1.6}
/* Avoid filter/button clipping at the right and on narrow/short screens. */
.graph-head{right:16px;left:16px;align-items:flex-end;max-width:calc(100% - 32px)}.filters,.topic-filters{max-width:min(100%,780px);width:min(100%,780px);justify-content:flex-start;scrollbar-width:thin;overflow-x:auto;overscroll-behavior-inline:contain;scroll-padding-inline:12px;padding:3px 2px 8px}.filters::-webkit-scrollbar,.topic-filters::-webkit-scrollbar{display:block;height:3px}.filters::-webkit-scrollbar-thumb,.topic-filters::-webkit-scrollbar-thumb{background:#69635e;border-radius:5px}
.search-shell{max-width:100%}.filter,.topic{white-space:nowrap;flex-shrink:0}.map-stamp{z-index:2}.graph-head{z-index:5}.map-bottom{z-index:5}.map-bottom .helper{max-width:min(270px,30vw)}.control-group{max-width:min(100%,520px);overflow-x:auto;scrollbar-width:thin}.tooltip{pointer-events:none;max-width:min(210px,40vw)}
@media(max-width:900px){.graph-head{left:10px;right:10px;max-width:calc(100% - 20px)}.filters,.topic-filters{width:100%;max-width:100%}.install-window{padding:15px;max-height:96dvh}.map-stamp{top:165px!important}.map-bottom .helper{display:none}}
@media(max-width:600px){.install-platform-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.install-window{padding:13px;border-radius:10px}.install-instructions{padding:12px}.install-steps{font-size:12px}.graph-head{top:6px}.search-shell{width:100%}.map-stamp{top:158px!important}.install-os-option{min-height:49px}.control-group{max-width:calc(100vw - 24px)}.control-group button{flex-shrink:0}.drawer-header h2{font-size:21px}}
@media(max-height:580px){.graph-head{gap:4px}.filters,.topic-filters{padding-bottom:3px}.map-stamp{top:137px!important}.control-group{bottom:0}}
'''
(root/'style.css').write_text(css)

sw=(root/'sw.js').read_text().replace('privacypack-wiki-v4-r1','privacypack-wiki-v5-r1').replace('privacypack-remote-icons-v4','privacypack-remote-icons-v5')
sw=sw.replace("'./categories.json','./manifest.webmanifest'", "'./categories.json','./install-guides.json','./manifest.webmanifest'")
sw=sw.replace("k.startsWith('privacypack-wiki-v4-')", "(k.startsWith('privacypack-wiki-v4-')||k.startsWith('privacypack-wiki-v5-'))")
sw=sw.replace("u.pathname.endsWith('/categories.json'))", "u.pathname.endsWith('/categories.json')||u.pathname.endsWith('/install-guides.json'))")
(root/'sw.js').write_text(sw)
print('V5 UI injected: installation grid and method chooser.')
