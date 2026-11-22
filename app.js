/* PrivacyPack Atlas v3 — dependency-free PWA, 3D perspective graph and local notes. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PLATFORM={Android:'android',Linux:'linux',Windows:'windows',macOS:'macos',Web:'web','Live USB':'live-usb',Servidor:'servidor',Hardware:'hardware'};
const PURL=p=>'./assets/icons/platforms/'+(PLATFORM[p]||'web')+'.svg';
const OSLIST=['Todos','Android','Linux','Windows','Só Windows','macOS','Web','Servidor','Live USB'];
const NODE_PALETTE=['#61e3c2','#9ccbf4','#c5aef4','#efbc8e','#8bdcb4','#88cee5','#e1baed'];
let all=[],cats=[],byId=new Map(),chosenCategory='',chosenApp=null,os='Todos',query='',favsOnly=false,showCount=24,cmpFirst='',cmpSecond='';
const STATE_KEY='privacypack-atlas-v3';
let state={favorites:[],notes:{},settings:{motion:true,officialIcons:false}};
try{const d=JSON.parse(localStorage.getItem(STATE_KEY));if(d&&typeof d==='object'){
 state.favorites=Array.isArray(d.favorites)?d.favorites.filter(v=>typeof v==='string'):[];
 state.notes=(d.notes&&typeof d.notes==='object'&&!Array.isArray(d.notes))?d.notes:{};
 state.settings={...state.settings,...(d.settings||{})};
}}catch(e){console.info('Local storage unavailable',e)}
function persist(){try{localStorage.setItem(STATE_KEY,JSON.stringify(state))}catch(e){toast('Armazenamento local indisponível: exporte seus dados.') }}
function migrateLegacyData(){try{if(localStorage.getItem(STATE_KEY))return;const raw=JSON.parse(localStorage.getItem('privacy-pack-state-v1'));if(!raw)return;state.favorites=(raw.favorites||[]).map(id=>all.find(a=>a.legacyId===Number(id))?.id).filter(Boolean);state.notes={};for(const [key,value] of Object.entries(raw.notes||{})){const app=all.find(a=>a.legacyId===Number(key));if(app&&typeof value==='string')state.notes[app.id]=value}persist();}catch(e){console.warn('Legacy import skipped',e)}}
let toastTimeout=0;function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').classList.remove('show'),3300)}
function logo(item,cls='app-icon'){
 const el=document.createElement('span');el.className=cls;
 const im=document.createElement('img');im.src='./'+item.icon;im.alt='Ícone de '+item.name;im.loading='lazy';
 if(state.settings.officialIcons){try{const hostname=new URL(item.url).hostname;im.src='https://www.google.com/s2/favicons?domain='+encodeURIComponent(hostname)+'&sz=128';im.addEventListener('error',()=>im.src='./'+item.icon,{once:true})}catch{im.src='./'+item.icon}}
 el.append(im);return el;
}
function osMarkup(platforms,mini=false){
 if(mini)return `<span class="os-mini">${platforms.slice(0,5).map(p=>`<img src="${PURL(p)}" title="${h(p)}" alt="${h(p)}">`).join('')}</span>`;
 return platforms.map(p=>`<span class="os-badge"><img src="${PURL(p)}" alt="">${h(p)}</span>`).join('');
}
function matchesOS(a){return os==='Todos'||(os==='Só Windows'?a.platforms.includes('Windows')&&!a.platforms.some(p=>['Android','Linux','macOS'].includes(p)):a.platforms.includes(os))}
function visible(){return all.filter(a=>(!chosenCategory||a.cat===chosenCategory)&&matchesOS(a)&&(!favsOnly||state.favorites.includes(a.id))&&(!query||[a.name,a.cat,a.kind,a.summary,a.features,a.cautions,a.platforms.join(' '),(a.aliases||[]).join(' ')].join(' ').toLocaleLowerCase('pt-BR').includes(query)))}
function setOS(newOs){os=newOs;showCount=24;renderPlatformNav();renderCatalog();renderSystemCards();graph.resetViewForPlatform()}
function renderPlatformNav(){const nav=$('platformNav');nav.replaceChildren();OSLIST.forEach(p=>{
 const b=document.createElement('button');b.className='plat-btn'+(os===p?' active':'');b.setAttribute('aria-pressed',String(os===p));
 if(p==='Todos'){b.innerHTML='<span>◈</span><span>Todas as plataformas</span>'}
 else{const image=document.createElement('img');image.src=PURL(p==='Só Windows'?'Windows':p);image.alt='';b.append(image,document.createTextNode(p))}
 const amount=all.filter(a=>p==='Todos'||(p==='Só Windows'?a.platforms.includes('Windows')&&!a.platforms.some(t=>['Android','Linux','macOS'].includes(t)):a.platforms.includes(p))).length;
 const count=document.createElement('span');count.className='plat-count';count.textContent=amount;b.append(count);b.onclick=()=>setOS(p);nav.append(b);
})}
function renderCategorySelect(){const s=$('categorySelect');s.replaceChildren(new Option('Todas as categorias',''));for(const c of cats)s.add(new Option(c.name+' ('+c.count+')',c.name));s.value=chosenCategory}
function renderCategoryChips(){const box=$('categoryChips');box.replaceChildren();for(const [name,label] of [['','◈ Todas'],...cats.map(c=>[c.name,c.glyph+' '+c.name])]){
 const b=document.createElement('button');b.className='cat-chip'+(chosenCategory===name?' sel':'');b.textContent=label;b.setAttribute('aria-pressed',String(chosenCategory===name));b.onclick=()=>{chooseCategory(name||null);$('catalogo').scrollIntoView({block:'start',behavior:'smooth'})};box.append(b)
}}
function renderCatalog(){renderCategorySelect();renderCategoryChips();const items=visible();$('resultCount').textContent=items.length+' / '+all.length+' RESULTADOS';const grid=$('toolsGrid');grid.replaceChildren();
 for(const item of items.slice(0,showCount)){
 const card=document.createElement('article');card.className='tool-card';const head=document.createElement('div');head.className='tool-card-head';head.append(logo(item));
 const name=document.createElement('div');name.className='appname';name.textContent=item.name;head.append(name);const category=document.createElement('div');category.className='card-category';category.textContent=item.cat+' · '+item.kind;
 const p=document.createElement('p');p.textContent=item.summary;
 const platform=document.createElement('div');platform.innerHTML=osMarkup(item.platforms);
 const foot=document.createElement('div');foot.className='card-footer';foot.innerHTML=osMarkup(item.platforms,true);
 const actions=document.createElement('div');actions.className='card-actions';const open=document.createElement('button');open.textContent='Ficha ↗';open.setAttribute('aria-label','Abrir ficha de '+item.name);open.onclick=()=>selectApp(item.id,true);
 const compare=document.createElement('button');compare.textContent='⚖';compare.title='Comparar '+item.name;compare.setAttribute('aria-label',compare.title);compare.onclick=()=>openCompare(item.id);
 const fav=document.createElement('button');fav.className='fav-star';fav.textContent=state.favorites.includes(item.id)?'★':'☆';fav.title='Favorito';fav.setAttribute('aria-label',(state.favorites.includes(item.id)?'Remover favorito: ':'Favoritar: ')+item.name);fav.onclick=()=>toggleFav(item.id);
 actions.append(open,compare,fav);foot.append(actions);card.append(head,category,p,foot);grid.append(card)
 }
 if(!items.length){grid.innerHTML='<div class="no-results"><h3>Nenhum resultado encontrado</h3><p>Tente remover um filtro ou pesquisar outro termo.</p></div>'}
 $('showMore').hidden=items.length<=showCount;
 $('favOnlyBtn').textContent=favsOnly?'★ Favoritos':'☆ Favoritos';$('favOnlyBtn').classList.toggle('active',favsOnly);
 $('compareNum').textContent=cmpFirst?(cmpSecond?'2':'1'):'0';
}
function toggleFav(id){const pos=state.favorites.indexOf(id);if(pos<0)state.favorites.push(id);else state.favorites.splice(pos,1);persist();renderCatalog();if(chosenApp===id)renderInspector()}
function chooseCategory(name){chosenCategory=name||'';chosenApp=null;showCount=24;renderInspector();renderCatalog();graph.expand(chosenCategory);$('activePath').textContent='PRIVACYPACK / '+(chosenCategory||'TODOS OS SETORES').toLocaleUpperCase('pt-BR');}
function selectApp(id,scroll=true){const a=byId.get(id);if(!a)return;
 chosenCategory=a.cat;chosenApp=id;showCount=24;renderInspector();renderCatalog();graph.expand(a.cat,id);$('activePath').textContent='PRIVACYPACK / '+a.cat.toUpperCase()+' / '+a.name.toUpperCase();
 if(scroll){$('atlas').scrollIntoView({block:'start',behavior:'smooth'})}
 history.replaceState(null,'','#app='+encodeURIComponent(id));
}
function renderInspector(){const panel=$('inspectorContent');panel.replaceChildren();
 if(chosenApp){const a=byId.get(chosenApp);if(!a)return;const root=document.createElement('div');root.innerHTML=`<div class="inspector-intro"><div class="eyebrow">TOOL INTELLIGENCE / ${h(a.cat.toUpperCase())}</div><div class="app-hero"><div id="insLogo"></div><div><h3>${h(a.name)}</h3><small>${h(a.kind)}</small></div></div><div class="tagline">${h(a.summary)}</div><div class="platform-badges">${osMarkup(a.platforms)}</div></div><div class="info-group"><h4>◈ RECURSOS E POSSIBILIDADES</h4><p>${h(a.features)}</p></div><div class="info-group warning"><h4>△ LIMITAÇÕES E CUIDADOS</h4><p>${h(a.cautions)}</p></div><div class="inspector-buttons" id="detailBtns"></div><div class="info-group"><h4>✎ NOTAS LOCAIS</h4><textarea id="toolNotes" class="note-input" placeholder="Suas anotações ficam neste aparelho. Não coloque senhas ou chaves privadas."></textarea><small style="font-size:10px;color:#819daa">Salvo automaticamente · exportável como JSON</small></div>`;
 root.querySelector('#insLogo').append(logo(a,'app-icon large'));const btns=root.querySelector('#detailBtns');const l=document.createElement('a');l.className='button primary';l.href=a.url;l.target='_blank';l.rel='noopener noreferrer';l.textContent='Abrir página oficial ↗';btns.append(l);
 const comp=document.createElement('button');comp.className='button';comp.textContent='⚖ Comparar';comp.onclick=()=>openCompare(a.id);
 const fav=document.createElement('button');fav.className='button';fav.textContent=state.favorites.includes(a.id)?'★ Favorito':'☆ Favoritar';fav.onclick=()=>toggleFav(a.id);btns.append(comp,fav);
 const nt=root.querySelector('#toolNotes');nt.value=state.notes[a.id]||'';nt.addEventListener('input',()=>{state.notes[a.id]=nt.value;persist()});panel.append(root);return;
 }
 if(chosenCategory){const c=cats.find(x=>x.name===chosenCategory);const apps=all.filter(a=>a.cat===chosenCategory&&matchesOS(a));const root=document.createElement('div');root.innerHTML=`<div class="cat-hero"><div class="eyebrow">EXPANDED CONSTELLATION / CATEGORY</div><div class="cat-icon">${h(c?.glyph||'◈')}</div><h3>${h(chosenCategory)}</h3><p>${apps.length} ferramentas nesta categoria para a plataforma selecionada. Escolha um ícone para acessar a ficha completa e comparar alternativas.</p><div class="category-actions"><button class="button primary" id="compareGroup">⚖ Comparar categoria</button><button class="button" id="browseGroup">↓ Ver fichas</button></div></div><div class="branch-list" id="branchList"></div>`;
 root.querySelector('#compareGroup').disabled=apps.length<2;root.querySelector('#compareGroup').onclick=()=>openCompare(apps[0]?.id);root.querySelector('#browseGroup').onclick=()=>$('catalogo').scrollIntoView({behavior:'smooth'});
 const list=root.querySelector('#branchList');for(const a of apps){const b=document.createElement('button');b.className='branch-entry';const l=logo(a);b.append(l);const n=document.createElement('span');n.textContent=a.name;b.append(n);const right=document.createElement('small');right.textContent='↗';b.append(right);b.onclick=()=>selectApp(a.id,false);list.append(b)}
 panel.append(root);return;
 }
 panel.innerHTML='<div class="empty-detail"><span class="empty-symbol">⬡</span><span class="eyebrow">EXPLORAR / INTERAGIR</span><h3>Selecione um nó</h3><p>Clique em uma categoria para abrir suas ramificações. Depois selecione o ícone de um app para visualizar ficha, limitações, links e comparador.</p><div class="detail-hint">↗ TOQUE EM UM NÓ LUMINOSO NO MAPA</div></div>';
}
function openCompare(id){let start=byId.get(id||chosenApp);if(!start){start=visible()[0]||all[0]}if(!start)return;const peers=all.filter(a=>a.cat===start.cat&&a.id!==start.id);if(!peers.length){toast('Esta categoria só tem uma ferramenta; a comparação exige pelo menos duas.');return}
 cmpFirst=start.id;cmpSecond=peers[0].id;renderCatalog();$('modalOverlay').classList.remove('hidden');renderCompare();$('modalClose').focus();document.body.style.overflow='hidden';}
function closeCompare(){$('modalOverlay').classList.add('hidden');document.body.style.overflow='';cmpFirst='';cmpSecond='';renderCatalog()}
function compareRow(label,build){return `<tr><td>${label}</td><td>${build(byId.get(cmpFirst))}</td><td>${build(byId.get(cmpSecond))}</td></tr>`}
function renderCompare(){const container=$('modalContent');const a=byId.get(cmpFirst),b=byId.get(cmpSecond);if(!a||!b)return;
 const peers=all.filter(x=>x.cat===a.cat);const pickers=document.createElement('div');pickers.className='compare-pickers';
 for(const [ix,caption,sel] of [[0,'PRIMEIRA FERRAMENTA',cmpFirst],[1,'SEGUNDA FERRAMENTA',cmpSecond]]){
 const label=document.createElement('label');label.textContent=caption;const select=document.createElement('select');for(const item of peers){const opt=new Option(item.name,item.id);if(item.id===sel)opt.selected=true;select.append(opt)}
 select.addEventListener('change',()=>{if(ix===0){cmpFirst=select.value;if(cmpSecond===cmpFirst)cmpSecond=peers.find(x=>x.id!==cmpFirst)?.id||cmpFirst}else{cmpSecond=select.value;if(cmpFirst===cmpSecond)cmpFirst=peers.find(x=>x.id!==cmpSecond)?.id||cmpSecond}renderCompare()});label.append(select);pickers.append(label)}
 const table=document.createElement('table');table.className='compare-table';table.innerHTML=`<thead><tr><th>${h(a.cat.toUpperCase())}</th><th><span class="compare-head"><img src="./${a.icon}" alt="">${h(a.name)}</span></th><th><span class="compare-head"><img src="./${b.icon}" alt="">${h(b.name)}</span></th></tr></thead><tbody>
 ${compareRow('Plataformas',d=>osMarkup(d.platforms))}
 ${compareRow('Tipo de software',d=>h(d.kind))}
 ${compareRow('O que faz',d=>h(d.summary))}
 ${compareRow('Recursos',d=>h(d.features))}
 ${compareRow('Limites e riscos',d=>h(d.cautions))}
 ${compareRow('Página',d=>`<a href="${h(d.url)}" target="_blank" rel="noopener noreferrer">Abrir fonte ↗</a>`)}
 </tbody>`;
 container.replaceChildren(pickers,table);const note=document.createElement('p');note.className='settings-note';note.textContent='Comparação descritiva: não é ranking, auditoria independente nem nota de segurança. As duas ferramentas pertencem à mesma categoria.';container.append(note);
 const actions=document.createElement('div');actions.className='compare-actions';const one=document.createElement('button');one.className='button';one.textContent='Abrir ficha: '+a.name;one.onclick=()=>{closeCompare();selectApp(a.id,true)};const two=document.createElement('button');two.className='button';two.textContent='Abrir ficha: '+b.name;two.onclick=()=>{closeCompare();selectApp(b.id,true)};actions.append(one,two);container.append(actions)
}
function renderSystemCards(){const el=$('systemCards');el.replaceChildren();for(const p of ['Android','Linux','Windows','Só Windows','Web','Servidor','Live USB','macOS']){
 const n=all.filter(a=>p==='Só Windows'?a.platforms.includes('Windows')&&!a.platforms.some(x=>['Android','Linux','macOS'].includes(x)):a.platforms.includes(p)).length;
 const btn=document.createElement('button');btn.className='system-card';const image=document.createElement('img');image.src=PURL(p==='Só Windows'?'Windows':p);image.alt='';const txt=document.createElement('span');txt.innerHTML=`<strong>${h(p)}</strong><small>${n} itens compatíveis</small>`;btn.append(image,txt);btn.onclick=()=>{setOS(p);$('catalogo').scrollIntoView({behavior:'smooth'})};el.append(btn)}
}
function registerHandlers(){
 $('searchInput').addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase('pt-BR');showCount=24;renderCatalog()});
 $('categorySelect').addEventListener('change',e=>chooseCategory(e.target.value||null));
 $('favOnlyBtn').onclick=()=>{favsOnly=!favsOnly;renderCatalog()};$('showMore').onclick=()=>{showCount+=24;renderCatalog()};$('compareTrayBtn').onclick=()=>openCompare(chosenApp||visible()[0]?.id);
 $('modalClose').onclick=closeCompare;$('modalOverlay').addEventListener('click',e=>{if(e.target===$('modalOverlay'))closeCompare()});
 $('settingsBtn').onclick=()=>{$('settingsOverlay').classList.remove('hidden');$('settingsClose').focus()};const closeSettings=()=>$('settingsOverlay').classList.add('hidden');$('settingsClose').onclick=closeSettings;$('settingsOverlay').addEventListener('click',e=>{if(e.target===$('settingsOverlay'))closeSettings()});
 $('officialIconToggle').checked=Boolean(state.settings.officialIcons);$('officialIconToggle').onchange=e=>{state.settings.officialIcons=e.target.checked;persist();renderInspector();renderCatalog();graph.clearImages();toast(e.target.checked?'Favicons externos ativados: o serviço receberá solicitações.':'Ícones locais ativados: nenhuma solicitação externa de favicon.')};
 $('motionToggle').checked=Boolean(state.settings.motion);$('motionToggle').onchange=e=>{state.settings.motion=e.target.checked;persist();graph.setMotion(e.target.checked)};
 $('motionBtn').onclick=()=>{$('motionToggle').checked=!$('motionToggle').checked;$('motionToggle').dispatchEvent(new Event('change'))};
 $('resetCam').onclick=()=>graph.resetCamera();$('zoomIn').onclick=()=>graph.setZoom(graph.zoom*1.18);$('zoomOut').onclick=()=>graph.setZoom(graph.zoom/1.18);
 $('collapseGraph').onclick=()=>chooseCategory(null);
 $('clearDataBtn').onclick=()=>{if(!confirm('Apagar todos os favoritos, notas e preferências locais deste PrivacyPack?'))return;state={favorites:[],notes:{},settings:{motion:true,officialIcons:false}};persist();$('motionToggle').checked=true;$('officialIconToggle').checked=false;graph.setMotion(true);closeSettings();renderInspector();renderCatalog();toast('Dados locais apagados.')};
 $('backupBtn').onclick=()=>{const blob=new Blob([JSON.stringify({format:'privacypack-v3',createdAt:new Date().toISOString(),state},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='privacypack-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2500)};
 $('restoreBtn').onclick=()=>$('restoreInput').click();$('restoreInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>1e6)throw Error('Arquivo muito grande');let d=JSON.parse(await f.text());let v=d.state||d;if(!Array.isArray(v.favorites)||typeof v.notes!=='object'||!v.notes)throw Error('Estrutura inválida');state.favorites=v.favorites.map(id=>typeof id==='number'?all.find(a=>a.legacyId===id)?.id:id).filter(id=>typeof id==='string'&&byId.has(id));state.notes=Object.fromEntries(Object.entries(v.notes).map(([k,val])=>[byId.has(k)?k:all.find(a=>a.legacyId===Number(k))?.id,val]).filter(([k,val])=>byId.has(k)&&typeof val==='string').map(([k,val])=>[k,val.slice(0,8000)]));state.settings={motion:true,officialIcons:false,...v.settings};persist();renderCatalog();renderInspector();toast('Backup importado com sucesso.')}catch(err){toast('Não foi possível importar: '+err.message)}finally{e.target.value=''}};
 $('refreshBtn').onclick=async()=>{try{if('serviceWorker'in navigator){const r=await navigator.serviceWorker.getRegistration();if(r)await r.update()}const r=await fetch('./catalog.json',{cache:'no-store'});if(!r.ok)throw Error('sem conexão');toast('Verificação realizada. Recarregue o aplicativo para ver mudanças publicadas.')}catch{toast('Sem acesso ao servidor. O catálogo offline continua disponível.')}};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('modalOverlay').classList.contains('hidden'))closeCompare();closeSettings()}});
 window.addEventListener('online',setOnline);window.addEventListener('offline',setOnline);setOnline();
}
function setOnline(){const ok=navigator.onLine;$('onlineChip').classList.toggle('offline',!ok);$('onlineText').textContent=ok?'ONLINE · CATÁLOGO ATIVO':'OFFLINE · CATÁLOGO LOCAL'}
let deferredInstall=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installBtn').hidden=false});$('installBtn').onclick=async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('installBtn').hidden=true}else toast('No navegador Android, use o menu ⋮ → Instalar aplicativo.')} ;window.addEventListener('appinstalled',()=>{$('installBtn').hidden=true;toast('PrivacyPack instalado!')});

/* Projected 3D universe: 3D Cartesian nodes + camera yaw/pitch + perspective + depth ordering. */
class Graph{
 constructor(){this.canvas=$('universe');this.wrap=$('canvasWrap');this.ctx=this.canvas.getContext('2d',{alpha:false});this.w=800;this.he=500;this.dpr=1;this.yaw=-.52;this.pitch=.16;this.zoom=1;this.motion=Boolean(state.settings.motion)&&!matchMedia('(prefers-reduced-motion: reduce)').matches;this.selected='';this.selectedApp='';this.nodes=[];this.hit=[];this.images=new Map();this.pointers=new Map();this.dragging=false;this.pointerStart=null;this.inertia={x:0,y:0};this.lastFrame=0;this.t=0;this.stars=Array.from({length:140},(_,i)=>({p:this.vecOnSphere(i,140,9.5),tw:.3+.7*Math.random(),phase:Math.random()*6}));this.positions=this.calculateCategoryPositions();this.resize();new ResizeObserver(()=>this.resize()).observe(this.wrap);this.bind();requestAnimationFrame(t=>this.loop(t));}
 vecOnSphere(i,n,r=1){const yy=1-(i/(n-1))*2;const phi=i*2.39996323;const rr=Math.sqrt(Math.max(0,1-yy*yy));return{x:Math.cos(phi)*rr*r,y:yy*r,z:Math.sin(phi)*rr*r}}
 calculateCategoryPositions(){let points=[];const n=cats.length;for(let i=0;i<n;i++){const ring=i%3;const a=(i*.61803398875*2*Math.PI)+.4;const lat=Math.asin(1-2*(i+.5)/n);const radius=3.15+.33*(ring-1);points.push({x:Math.cos(a)*Math.cos(lat)*radius,y:Math.sin(lat)*radius*.90,z:Math.sin(a)*Math.cos(lat)*radius})}return points}
 resize(){const box=this.wrap.getBoundingClientRect();this.w=Math.max(100,box.width);this.he=Math.max(100,box.height);this.dpr=Math.min(window.devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.he*this.dpr);this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0)}
 clearImages(){this.images.clear()}
 imageFor(item){if(!this.images.has(item.id)){const img=new Image();img.src='./'+item.icon;if(state.settings.officialIcons){try{img.src='https://www.google.com/s2/favicons?domain='+encodeURIComponent(new URL(item.url).hostname)+'&sz=128';img.onerror=()=>{img.onerror=null;img.src='./'+item.icon}}catch{img.src='./'+item.icon}}img.onload=()=>{};this.images.set(item.id,img)}return this.images.get(item.id)}
 setMotion(v){this.motion=Boolean(v)&&!matchMedia('(prefers-reduced-motion: reduce)').matches;$('motionBtn').textContent='◉ Motion: '+(this.motion?'ON':'OFF')}
 resetCamera(){this.yaw=-.52;this.pitch=.16;this.zoom=1;this.inertia={x:0,y:0}}
 resetViewForPlatform(){/* Platform filtering does not destroy the current graph selection. */}
 setZoom(v){this.zoom=Math.max(.53,Math.min(2.05,v))}
 expand(cat,app){this.selected=cat||'';this.selectedApp=app||''}
 projection(pos){const cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),cp=Math.cos(this.pitch),sp=Math.sin(this.pitch);let xx=pos.x*cy+pos.z*sy;let zz=-pos.x*sy+pos.z*cy;let yy=pos.y*cp-zz*sp;zz=pos.y*sp+zz*cp;const d=11.3-zz;const fac=Math.min(this.w*.99,this.he*1.5)*this.zoom/d;return{x:this.w/2+xx*fac,y:this.he/2+yy*fac,z:zz,fac,visible:d>1}}
 blend(hex,alpha){const v=hex.replace('#','');return `rgba(${parseInt(v.slice(0,2),16)},${parseInt(v.slice(2,4),16)},${parseInt(v.slice(4,6),16)},${alpha})`}
 line3(a,b,col,alpha,width=1){const A=this.projection(a),B=this.projection(b),ctx=this.ctx;ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.strokeStyle=this.blend(col,alpha);ctx.lineWidth=width;ctx.stroke()}
 particle(a,b,color,progress,size){const p={x:a.x+(b.x-a.x)*progress,y:a.y+(b.y-a.y)*progress,z:a.z+(b.z-a.z)*progress};const v=this.projection(p),ctx=this.ctx;ctx.save();ctx.shadowBlur=size*5;ctx.shadowColor=color;ctx.beginPath();ctx.arc(v.x,v.y,size,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.restore()}
 drawRing(radius,axis,color,phase){const ctx=this.ctx;ctx.beginPath();for(let i=0;i<=100;i++){const a=i/100*Math.PI*2+phase;let p;if(axis===0)p={x:radius*Math.cos(a),y:radius*Math.sin(a),z:0};else if(axis===1)p={x:radius*Math.cos(a),y:0,z:radius*Math.sin(a)};else p={x:0,y:radius*Math.cos(a),z:radius*Math.sin(a)};const q=this.projection(p);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)}ctx.strokeStyle=this.blend(color,.10);ctx.lineWidth=1;ctx.stroke()}
 background(){const ctx=this.ctx;ctx.clearRect(0,0,this.w,this.he);const g=ctx.createRadialGradient(this.w*.47,this.he*.44,12,this.w*.5,this.he*.5,Math.max(this.w,this.he)*.73);g.addColorStop(0,'#16333c');g.addColorStop(.4,'#0a1d2b');g.addColorStop(1,'#06101c');ctx.fillStyle=g;ctx.fillRect(0,0,this.w,this.he);for(let i=0;i<this.stars.length;i++){const s=this.stars[i],p=this.projection(s.p);if(p.x<0||p.x>this.w||p.y<0||p.y>this.he)continue;const alpha=(.1+.25*s.tw)*(.86+.14*Math.sin(this.t*1.7+s.phase));ctx.fillStyle=`rgba(138,211,226,${alpha})`;ctx.fillRect(p.x,p.y,i%8===0?1.7:1, i%8===0?1.7:1)}this.drawRing(4.25,0,'#51b9b2',this.t*.06);this.drawRing(4.85,1,'#65a6d0',this.t*.025);this.drawRing(5.3,2,'#ad99df',-this.t*.04)}
 makeNodes(){const nodes=[],n=cats.length;cats.forEach((c,i)=>{const p=this.positions[i];nodes.push({id:c.name,type:'category',pos:p,label:c.name,glyph:c.glyph,color:c.color,selected:this.selected===c.name});});
 if(this.selected){const c=cats.find(z=>z.name===this.selected);const catIdx=cats.findIndex(z=>z.name===this.selected);const origin=this.positions[catIdx];let apps=all.filter(a=>a.cat===this.selected&&matchesOS(a));
 apps.forEach((a,i)=>{const t=(i+.5)/Math.max(1,apps.length);const phi=i*2.39996;const r=1.18+.4*(i%3)/2;const p={x:origin.x+Math.cos(phi)*Math.sqrt(t)*r*1.25,y:origin.y+(t-.5)*2.2,z:origin.z+Math.sin(phi)*Math.sqrt(t)*r*1.25};nodes.push({id:a.id,type:'app',pos:p,label:a.name,color:c.color,selected:this.selectedApp===a.id,item:a,origin});})}
 return nodes;}
 drawNode(node){const p=this.projection(node.pos);if(!p.visible)return;const ctx=this.ctx;const app=node.type==='app';const rad=(app?12:15)*Math.max(.63,Math.min(1.5,p.fac/55));const selected=node.selected;const glow=selected?20:8;const alpha=Math.max(.36,Math.min(1, .68+(p.z/10)));ctx.save();ctx.globalAlpha=alpha;ctx.shadowBlur=glow;ctx.shadowColor=node.color;ctx.beginPath();ctx.arc(p.x,p.y,rad+2,0,2*Math.PI);ctx.fillStyle=selected?'#265c57':'#122c3d';ctx.fill();ctx.lineWidth=selected?2.2:1.2;ctx.strokeStyle=this.blend(node.color,selected?1:.72);ctx.stroke();ctx.shadowBlur=0;
 if(app){const image=this.imageFor(node.item);if(image.complete&&image.naturalWidth){ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,rad-1,0,2*Math.PI);ctx.clip();ctx.drawImage(image,p.x-rad+1,p.y-rad+1,(rad-1)*2,(rad-1)*2);ctx.restore()}else{ctx.fillStyle='#edfbfa';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`700 ${Math.max(9,rad*.82)}px sans-serif`;ctx.fillText(node.item.name.slice(0,2).toUpperCase(),p.x,p.y+1)}}
 else{ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.round(rad*1.1)}px system-ui`;ctx.fillStyle='#eafff8';ctx.fillText(node.glyph,p.x,p.y+1)}
 const showLabel=app||selected||(this.w>600?p.z>0.8:p.z>2.15); if(showLabel){const label=node.label.length>23?node.label.slice(0,21)+'…':node.label;ctx.font=`${selected?'700':'600'} ${Math.max(9,Math.min(12,8.7*rad/13))}px system-ui`;ctx.textAlign='left';ctx.textBaseline='middle';const tx=p.x+rad+6,ty=p.y;const w=ctx.measureText(label).width;ctx.fillStyle='rgba(6,18,28,.75)';ctx.fillRect(tx-3,ty-10,w+6,20);ctx.fillStyle=selected?'#d4ffed':'#accdd1';ctx.fillText(label,tx,ty+1)}ctx.restore();
 this.hit.push({id:node.id,type:node.type,x:p.x,y:p.y,r:Math.max(rad+9,17),z:p.z,label:node.label})
 }
 drawCore(){const ctx=this.ctx,p=this.projection({x:0,y:0,z:0});const r=39*Math.max(.75,Math.min(1.4,this.zoom));ctx.save();ctx.shadowBlur=25;ctx.shadowColor='#44eac09a';ctx.beginPath();ctx.arc(p.x,p.y,r,0,2*Math.PI);const g=ctx.createRadialGradient(p.x,p.y,5,p.x,p.y,r);g.addColorStop(0,'#1e6571');g.addColorStop(.6,'#123845');g.addColorStop(1,'#0a1c2d');ctx.fillStyle=g;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#7bf0c4';ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#c1ffec';ctx.font='700 19px monospace';ctx.textAlign='center';ctx.fillText('⬡',p.x,p.y-5);ctx.font='700 10px ui-monospace,monospace';ctx.fillText('PRIVACY',p.x,p.y+13);ctx.restore()}
 render(){if(!this.ctx)return;this.background();this.hit=[];const nodes=this.makeNodes();const ctx=this.ctx;
 // spatial beams: all category connections, selected app branches with realtime motion
 for(let i=0;i<cats.length;i++){const p=this.positions[i],c=cats[i];const sel=c.name===this.selected;this.line3({x:0,y:0,z:0},p,c.color,sel?.55:.13,sel?1.7:.7);if(this.motion&&(sel||i%3===0)){const u=(this.t*.14+i*.071)%1;this.particle({x:0,y:0,z:0},p,c.color,u,sel?2.1:1.2)}}
 if(this.selected){for(const node of nodes.filter(n=>n.type==='app')){this.line3(node.origin,node.pos,node.color,.35,.9);if(this.motion)this.particle(node.origin,node.pos,node.color,(this.t*.18+node.id.length*.073)%1,1.7)}}
 this.drawCore();nodes.sort((a,b)=>this.projection(a.pos).z-this.projection(b.pos).z).forEach(node=>this.drawNode(node));
 }
 bind(){const element=this.canvas;const ptr=(e)=>{const r=element.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
 element.addEventListener('pointerdown',e=>{element.setPointerCapture(e.pointerId);const p=ptr(e);this.pointers.set(e.pointerId,p);this.pointerStart={...p,time:performance.now(),yaw:this.yaw,pitch:this.pitch,zoom:this.zoom};this.dragging=false});
 element.addEventListener('pointermove',e=>{const p=ptr(e),prev=this.pointers.get(e.pointerId);if(!prev){const nearest=this.nearest(p);$('tooltip').hidden=!nearest;if(nearest){$('tooltip').textContent=nearest.label;$('tooltip').style.left=Math.min(this.w-190,p.x+16)+'px';$('tooltip').style.top=Math.max(10,p.y-32)+'px'}return}this.pointers.set(e.pointerId,p);
 if(this.pointers.size===1){const dx=p.x-prev.x,dy=p.y-prev.y;if(Math.abs(p.x-this.pointerStart.x)+Math.abs(p.y-this.pointerStart.y)>7)this.dragging=true;this.yaw+=dx*.008;this.pitch=Math.min(1.33,Math.max(-1.33,this.pitch+dy*.006));this.inertia={x:dx*.008,y:dy*.006}}
 if(this.pointers.size===2){const vals=[...this.pointers.values()];const newDist=Math.hypot(vals[0].x-vals[1].x,vals[0].y-vals[1].y);if(this.lastPinch&&newDist>0)this.setZoom(this.zoom*newDist/this.lastPinch);this.lastPinch=newDist;this.dragging=true}});
 element.addEventListener('pointerup',e=>{const p=ptr(e);if(!this.dragging&&this.pointerStart&&Math.hypot(p.x-this.pointerStart.x,p.y-this.pointerStart.y)<12){const hit=this.nearest(p);if(hit){if(hit.type==='category')chooseCategory(hit.id===chosenCategory?null:hit.id);else selectApp(hit.id,false)}else if(Math.hypot(p.x-this.w/2,p.y-this.he/2)<37*this.zoom){chooseCategory(null)}}this.pointers.delete(e.pointerId);if(this.pointers.size<2)this.lastPinch=0});
 element.addEventListener('pointercancel',e=>{this.pointers.delete(e.pointerId);this.lastPinch=0});element.addEventListener('pointerleave',()=>{$('tooltip').hidden=true});
 element.addEventListener('wheel',e=>{e.preventDefault();this.setZoom(this.zoom*(e.deltaY>0?.92:1.09))},{passive:false});element.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')this.yaw-=.16;if(e.key==='ArrowRight')this.yaw+=.16;if(e.key==='ArrowUp')this.pitch-=.12;if(e.key==='ArrowDown')this.pitch+=.12;if(e.key==='+')this.setZoom(this.zoom*1.12);if(e.key==='-')this.setZoom(this.zoom/1.12)}})
 }
 nearest(p){const list=this.hit.filter(n=>Math.hypot(n.x-p.x,n.y-p.y)<n.r).sort((a,b)=>b.z-a.z);return list[0]||null}
 loop(now){requestAnimationFrame(t=>this.loop(t));if(document.hidden)return;const interval=this.motion?32:80;if(now-this.lastFrame<interval)return;const dt=this.lastFrame?Math.min((now-this.lastFrame)/1000,.15):.033;this.lastFrame=now;if(this.motion){this.t+=dt;this.yaw+=this.pointers.size?0:dt*.028;this.inertia.x*=.93;this.inertia.y*=.93}else this.t=0;this.render()}
}
let graph;
async function start(){try{const [r,c]=await Promise.all([fetch('./catalog.json'),fetch('./categories.json')]);if(!r.ok||!c.ok)throw Error('Dados do catálogo não disponíveis');all=await r.json();cats=await c.json();byId=new Map(all.map(a=>[a.id,a]));migrateLegacyData();if(!all.length)throw Error('Catálogo vazio');$('statTools').textContent=all.length;$('statGroups').textContent=cats.length;renderPlatformNav();registerHandlers();renderInspector();renderCatalog();renderSystemCards();graph=new Graph();graph.setMotion(state.settings.motion);$('graphState').textContent=cats.length+' SETORES · '+all.length+' NÓS';if(location.hash.startsWith('#app=')){const slug=decodeURIComponent(location.hash.slice(5));if(byId.has(slug))selectApp(slug,false)}if('serviceWorker' in navigator&&location.protocol.startsWith('http')){navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('SW registration:',err))}}catch(err){console.error(err);$('inspectorContent').innerHTML='<div class="empty-detail"><h3>Catálogo indisponível</h3><p>Abra o aplicativo por um servidor local ou por HTTPS no GitHub Pages. Não use file://.</p></div>';$('resultCount').textContent='ERRO AO CARREGAR';toast(err.message)}}
start();
})();
