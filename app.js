/* PrivacyPack Wiki v4 — dependency-free spatial graph PWA. */
(()=>{'use strict';
const $=id=>document.getElementById(id),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TITLE='PrivacyPack Wiki';const VERSION='5.0.0';const STATE_KEY='privacypack-wiki-v4';
const SYSTEMS=['Android','Linux','Windows','Multiplataforma','Web','Servidor','Live USB','Hardware'];
const SYSICON={Android:'assets/platform/android.svg',Linux:'assets/platform/linux.svg',Windows:'assets/platform/windows.svg',Multiplataforma:'assets/icon.svg',Web:'assets/platform/web.svg',Servidor:'assets/platform/server.svg','Live USB':'assets/platform/live-usb.svg',macOS:'assets/platform/macos.svg',Hardware:'assets/platform/hardware.svg'};
const COLOR={Android:'#85ba76',Linux:'#e2b961',Windows:'#67a9eb',Multiplataforma:'#c5a3e8',Web:'#e6b48b',Servidor:'#80ced2','Live USB':'#bfabda',Hardware:'#c3ca96'};
let installGuides={},installCurrent="",installPlatform="",installVariant=0;
let all=[],cats=[],byId=new Map(),os='Todos',platform='',category='',itemId='',search='',expandedAll=false,cmpA='',cmpB='',toastTimer=0,deferredPrompt=null;
let state={favorites:[],notes:{},settings:{motion:true,onlineIcons:true},hideTip:false};
try{let old=JSON.parse(localStorage.getItem(STATE_KEY));if(old){state={...state,...old,settings:{...state.settings,...old.settings}}}}catch{}
const storage=()=>{try{localStorage.setItem(STATE_KEY,JSON.stringify(state))}catch{showToast('Não foi possível salvar localmente. Exporte seu backup.')}};
function showToast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3500)}
function localLogo(item){return item.brandIcon||item.localSiteIcon||`assets/site/${item.id}.png`}
function siteDomain(item){let url;try{url=new URL(item.url)}catch{return ''}return url.hostname}
function externalLogo(item){const host=siteDomain(item);if(!host)return '';if(host==='github.com'){const parts=new URL(item.url).pathname.split('/').filter(Boolean);if(parts.length>=2)return `https://github.com/${encodeURIComponent(parts[0])}.png?size=128`}
 return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`}
function iconEl(item,size=42){const img=document.createElement('img');img.className='tool-logo';img.alt='Ícone de '+item.name;img.width=size;img.height=size;img.decoding='async';img.loading='lazy';img.src='./'+localLogo(item);
 img.onerror=()=>{if(state.settings.onlineIcons&&navigator.onLine&&!img.dataset.external){img.dataset.external='yes';img.src=externalLogo(item);return}const span=document.createElement('span');span.className='empty-icon';span.textContent=item.emoji||'◈';img.replaceWith(span)};return img}
function osIcon(p){return './'+(SYSICON[p]||SYSICON.Web)}
function systemsFor(a){return [...a.platforms].map(p=>`<span class="pill-platform"><img alt="" src="${osIcon(p)}"> ${escape(p)}</span>`).join('')}
function primarySystem(a){if(a.platforms.includes('Hardware'))return 'Hardware';if(a.platforms.includes('Servidor'))return 'Servidor';if(a.platforms.includes('Live USB'))return 'Live USB';const native=['Android','Linux','Windows','macOS'].filter(p=>a.platforms.includes(p));if(native.length>1)return 'Multiplataforma';if(native.length===1)return native[0]==='macOS'?'Multiplataforma':native[0];if(a.platforms.includes('Web'))return 'Web';return 'Web'}
const appsBySystem=p=>all.filter(a=>a.primary===p);
const catsBySystem=p=>[...new Set(appsBySystem(p).map(a=>a.cat))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
function searchMatch(a,q){if(!q)return true;const hay=[a.name,a.cat,a.summary,a.features,a.cautions,a.kind,...(a.aliases||[]),...a.platforms].join(' ').toLocaleLowerCase('pt-BR');return hay.includes(q.toLocaleLowerCase('pt-BR'))}
function updateCrumbs(){let words=['PRIVACYPACK'];if(platform)words.push(platform);if(category)words.push(category);if(itemId)words.push(byId.get(itemId)?.name||'');$('breadcrumb').innerHTML='SYSTEM <span>›</span> '+words.map(escape).join(' <span>›</span> ')}
function setSelection({p='',c='',a='',animate=true}={}){if(a){const obj=byId.get(a);if(!obj)return;p=obj.primary;c=obj.cat}platform=p;category=c;itemId=a;os=p||'Todos';expandedAll=false;const icon=$('graphCanvas');graph?.refresh();renderSheet();renderFilters();updateCrumbs();if(animate)graph?.focusOnSelection();$('inspector').classList.toggle('open',!!(p||c||a));$('mobileShade').classList.toggle('open',!!(p||c||a));$('mobileShade').hidden=!(p||c||a);if(location.protocol==='http:'||location.protocol==='https:'){if(a)history.replaceState(null,'','#app='+encodeURIComponent(a));else if(location.hash.startsWith('#app='))history.replaceState(null,'',location.pathname+location.search)}}
function renderFilters(){const box=$('filters');box.replaceChildren();for(const p of ['Todos',...SYSTEMS,'Só Windows']){const el=document.createElement('button');el.className='filter'+(os===p?' active':'');el.setAttribute('aria-pressed',String(os===p));if(p==='Todos')el.textContent='All';else{const i=document.createElement('img');i.alt='';i.src=osIcon(p==='Só Windows'?'Windows':p);el.append(i,document.createTextNode(' '+p))}el.onclick=()=>{os=p;search='';$('searchBox').value='';if(p==='Todos')setSelection();else if(p==='Só Windows'){setSelection();showToast('Exibindo ferramentas exclusivas do Windows no catálogo.');openLibrary();$('libraryOS').value='Só Windows';renderLibrary()}else setSelection({p});};box.append(el)}
 const topics=$('categoryTags');topics.replaceChildren();for(const [label,c] of [['Todas as funções',''],['Navegadores','Navegadores'],['VPN','VPN'],['Criptografia','Criptografia'],['Mensagens','Mensagens'],['Autenticação','Autenticação'],['Mapas e GPS','Mapas'],['OSINT e exposição','OSINT e exposição'],['Gerenciamento Android','Administração Android']]){const el=document.createElement('button');el.className='topic'+(category===c&&!!c?' active':'');el.textContent=label;el.onclick=()=>{if(!c)setSelection(platform?{p:platform}:{});else{const first=all.find(a=>a.cat===c);if(first)setSelection({p:first.primary,c:first.cat});else showToast('Nenhuma ferramenta nesta categoria')}};topics.append(el)} }
function chooseSystem(p){os=p;setSelection({p})}
function asButton(text,callback,cls=''){let b=document.createElement('button');b.className=cls;b.textContent=text;b.onclick=callback;return b}
function renderSheet(){const out=$('sheet');out.replaceChildren();const block=document.createElement('div');if(itemId){const a=byId.get(itemId);if(!a)return;const title=document.createElement('h1');title.className='sheet-title';title.textContent=a.name;const mark=document.createElement('div');mark.className='sheet-icon';mark.append(iconEl(a,50));const path=document.createElement('div');path.className='sheet-path';path.textContent='SYSTEM › '+a.primary+' › '+a.cat;
 const tags=document.createElement('div');tags.className='sheet-tags';for(const t of [a.kind,a.cat]){const tag=document.createElement('span');tag.className='sheet-tag';tag.textContent=t;tags.append(tag)}
 const about=document.createElement('p');about.className='sheet-summary';about.textContent=a.summary;
 block.append(path,mark,title,tags,about);const logoType=a.brandIcon?'Marca vetorial do projeto (Simple Icons)':a.iconSource==='android-listing'?'Ícone da listagem Android':a.iconSource==='repository'?'Ícone extraído do repositório do projeto':a.iconSource==='official-site'?'Ícone do site oficial':a.iconSource==='site-favicon'?'Favicon do site':a.iconSource==='publisher-avatar'?'Avatar do editor do projeto':'Ícone online, quando disponível';const provenance=document.createElement('div');provenance.className='site-offline-notice';provenance.textContent='Fonte visual: '+logoType;block.append(provenance);block.insertAdjacentHTML('beforeend','<div class="sheet-subhead">PLATAFORMAS</div><div class="pill-platforms">'+systemsFor(a)+'</div><div class="sheet-subhead">RECURSOS</div><div class="sheet-text">'+escape(a.features)+'</div><div class="sheet-subhead">LIMITAÇÕES E CUIDADOS</div><div class="sheet-text">'+escape(a.cautions)+'</div>');
 const buttons=document.createElement('div');buttons.className='sheet-buttons';const link=document.createElement('a');link.href=a.url;link.target='_blank';link.rel='noopener noreferrer';link.className='primary';link.textContent='Abrir site oficial ↗';const comp=asButton('⇄ Comparar',()=>openComparison(a.id));const fav=asButton(state.favorites.includes(a.id)?'★ Favoritado':'☆ Favoritar',()=>{toggleFav(a.id);renderSheet()});buttons.append(link,comp,fav);block.append(buttons);const installButton=asButton('↓ Instruções de instalação',()=>openInstallation(a.id),'sheet-install-cta');installButton.setAttribute('aria-label','Abrir instruções de instalação do '+a.name);block.append(installButton);
 const notes=document.createElement('div');notes.innerHTML='<div class="sheet-subhead">SUAS NOTAS · APENAS NESTE APARELHO</div>';const area=document.createElement('textarea');area.className='sheet-notes';area.placeholder='Adicione anotações de uso, pontos fortes, configurações...';area.value=state.notes[a.id]||'';area.addEventListener('input',()=>{state.notes[a.id]=area.value;storage()});notes.append(area);const small=document.createElement('div');small.className='sheet-note-hint';small.textContent='Salvas automaticamente · não armazene credenciais';notes.append(small);block.append(notes);
 }else if(category){const members=all.filter(a=>a.cat===category&&a.primary===platform);block.innerHTML=`<div class="sheet-path">SYSTEM › ${escape(platform)} › CATEGORIA</div><div class="sheet-icon category">${escape(cats.find(c=>c.name===category)?.glyph||'◈')}</div><h1 class="sheet-title">${escape(category)}</h1><p class="sheet-meta">${members.length} ferramentas nesta ramificação</p><p class="sheet-summary">Explore os aplicativos conectados a esta área. Toque em um deles para abrir a ficha completa com características, cautelas e plataformas.</p>`;if(members.length>1){const buttons=document.createElement('div');buttons.className='sheet-buttons';buttons.append(asButton('⇄ Comparar ferramentas desta categoria',()=>openComparison(members[0].id)));block.append(buttons)}const sub=document.createElement('div');sub.className='sheet-subhead';sub.textContent='FERRAMENTAS CONECTADAS';block.append(sub);const preview=document.createElement('div');preview.className='branch-preview';members.forEach(a=>{const b=document.createElement('button');b.append(iconEl(a,30),document.createElement('span'));b.lastChild.textContent=a.name;b.onclick=()=>setSelection({a:a.id});preview.append(b)});block.append(preview)
 }else if(platform){const members=appsBySystem(platform),types=catsBySystem(platform);const icon=document.createElement('div');icon.className='sheet-icon';const im=document.createElement('img');im.src=osIcon(platform);im.alt='Ícone '+platform;icon.append(im);block.innerHTML=`<div class="sheet-path">SYSTEM › PLATAFORMA</div><h1 class="sheet-title">${escape(platform)}</h1><p class="sheet-meta">${members.length} ferramentas · ${types.length} categorias</p><p class="sheet-summary">Selecione uma categoria na árvore para visualizar seus aplicativos, conhecer requisitos e abrir fichas detalhadas.</p>`;block.insertBefore(icon,block.children[1]);const buttons=document.createElement('div');buttons.className='branch-preview';types.forEach(c=>{const b=asButton((cats.find(x=>x.name===c)?.glyph||'◈')+'  '+c,()=>setSelection({p:platform,c}));buttons.append(b)});block.append(buttons)
 }else{block.className='welcome';block.innerHTML=`<div class="welcome-mark">⬡</div><div class="sheet-path">PRIVACYPACK / INTERACTIVE WIKI</div><h2>Um universo de ferramentas.</h2><p>Explore o mapa e clique em uma plataforma. Abra uma categoria para revelar seus aplicativos. Clique em cada ícone para ver sua ficha, comparar opções e consultar links oficiais.</p><div class="welcome-stats"><div><b>${all.length}</b><small>ferramentas</small></div><div><b>${cats.length}</b><small>categorias</small></div><div><b>${SYSTEMS.length}</b><small>plataformas</small></div></div>`;block.append(asButton('Explorar Android',()=>chooseSystem('Android')));}
 out.append(block);out.scrollTop=0;}
function toggleFav(id){const i=state.favorites.indexOf(id);if(i>=0)state.favorites.splice(i,1);else state.favorites.push(id);storage();}
function openOverlay(id){$(id).hidden=false;document.body.classList.add('modal-open')}
function closeOverlay(id){$(id).hidden=true;if(['library','settings','comparison','installGuide'].every(x=>$(x).hidden))document.body.classList.remove('modal-open')}
function openLibrary(){openOverlay('library');$('libraryCategory').replaceChildren(new Option('Todas as categorias',''));for(const c of cats)$('libraryCategory').add(new Option(c.name,c.name));renderLibrary()}
function libraryVisible(){let q=$('librarySearch').value.trim().toLocaleLowerCase('pt-BR');const c=$('libraryCategory').value;const p=$('libraryOS').value;return all.filter(a=>(!c||a.cat===c)&&(p==='Todos'||(p==='Só Windows'?a.platforms.includes('Windows')&&!a.platforms.some(p=>['Linux','Android','macOS'].includes(p)):p==='Multiplataforma'?a.primary===p:a.platforms.includes(p)))&&(!$('libraryFaves').checked||state.favorites.includes(a.id))&&searchMatch(a,q))}
function renderLibrary(){const entries=libraryVisible();$('libraryCount').textContent=`${entries.length} de ${all.length} ferramentas`;const grid=$('libraryGrid');grid.replaceChildren();if(!entries.length){const p=document.createElement('p');p.textContent='Nenhuma ferramenta encontrada com esses filtros.';grid.append(p);return}for(const a of entries){const b=document.createElement('button');b.className='library-entry';b.append(iconEl(a,35));const span=document.createElement('span');span.innerHTML='<strong>'+escape(a.name)+'</strong><small>'+escape(a.cat)+' · '+escape(a.platforms.join(', '))+'</small>';b.append(span);b.onclick=()=>{closeOverlay('library');$('searchBox').value='';search='';setSelection({a:a.id})};grid.append(b)}}

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

function openComparison(id){const a=byId.get(id);if(!a)return;const peers=all.filter(t=>t.cat===a.cat&&t.id!==a.id);if(!peers.length){showToast('A categoria só tem uma ferramenta.');return}cmpA=id;cmpB=peers[0].id;const selects=[$('compareA'),$('compareB')];for(const s of selects){s.replaceChildren();for(const tool of all.filter(x=>x.cat===a.cat))s.add(new Option(tool.name,tool.id))}selects[0].value=cmpA;selects[1].value=cmpB;openOverlay('comparison');renderComparison()}
function renderComparison(){const a=byId.get(cmpA),b=byId.get(cmpB);if(!a||!b)return;const root=$('compareBody');root.innerHTML=`<table class="compare-table"><thead><tr><th>CRITÉRIO</th><th id="compareThA"></th><th id="compareThB"></th></tr></thead><tbody><tr><td>Categoria</td><td>${escape(a.cat)}</td><td>${escape(b.cat)}</td></tr><tr><td>Finalidade</td><td>${escape(a.summary)}</td><td>${escape(b.summary)}</td></tr><tr><td>Plataformas</td><td>${escape(a.platforms.join(', '))}</td><td>${escape(b.platforms.join(', '))}</td></tr><tr><td>Modelo</td><td>${escape(a.kind)}</td><td>${escape(b.kind)}</td></tr><tr><td>Principais recursos</td><td>${escape(a.features)}</td><td>${escape(b.features)}</td></tr><tr><td>Limitações e riscos</td><td>${escape(a.cautions)}</td><td>${escape(b.cautions)}</td></tr><tr><td>Site / código</td><td><a href="${escape(a.url)}" target="_blank" rel="noopener noreferrer">Página oficial ↗</a></td><td><a href="${escape(b.url)}" target="_blank" rel="noopener noreferrer">Página oficial ↗</a></td></tr></tbody></table>`;for(const [id,x] of [['compareThA',a],['compareThB',b]]){const el=$(id);el.append(iconEl(x,32),document.createTextNode(x.name))}}
function loadBackup(){let f=$('backupFile').files[0];if(!f)return;f.text().then(t=>{let d=JSON.parse(t);if(!d||typeof d!=='object'||!Array.isArray(d.favorites)||typeof d.notes!=='object'||!d.notes)throw Error('JSON inválido');state.favorites=d.favorites.filter(k=>typeof k==='string'&&byId.has(k));state.notes={};for(const [k,v]of Object.entries(d.notes))if(byId.has(k)&&typeof v==='string')state.notes[k]=v;storage();showToast('Backup restaurado.');renderSheet();renderLibrary()}).catch(()=>showToast('Arquivo inválido. Revise o backup.'));$('backupFile').value=''}
function exportBackup(){const d={version:VERSION,generated:new Date().toISOString(),favorites:state.favorites,notes:state.notes};const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));link.download='privacypack-backup.json';document.body.append(link);link.click();setTimeout(()=>{URL.revokeObjectURL(link.href);link.remove()},500)}
function registerUI(){
 $('homeBtn').onclick=()=>{os='Todos';search='';$('searchBox').value='';setSelection();graph.reset()};$('mobileClose').onclick=()=>{$('inspector').classList.remove('open');$('mobileShade').classList.remove('open');$('mobileShade').hidden=true};$('mobileShade').onclick=$('mobileClose').onclick;
 $('libraryBtn').onclick=openLibrary;$('libraryClose').onclick=()=>closeOverlay('library');$('librarySearch').oninput=renderLibrary;$('libraryOS').onchange=renderLibrary;$('libraryCategory').onchange=renderLibrary;$('libraryFaves').onchange=renderLibrary;
 $('installClose').onclick=()=>closeOverlay('installGuide');
 $('compareClose').onclick=()=>closeOverlay('comparison');$('compareA').onchange=()=>{cmpA=$('compareA').value;renderComparison()};$('compareB').onchange=()=>{cmpB=$('compareB').value;renderComparison()};
 $('settingsBtn').onclick=()=>openOverlay('settings');$('settingsClose').onclick=()=>closeOverlay('settings');$('motionSwitch').checked=!!state.settings.motion;$('onlineIconsSwitch').checked=!!state.settings.onlineIcons;
 $('motionSwitch').onchange=e=>{state.settings.motion=e.target.checked;storage();graph?.setMotion(e.target.checked)};
 $('onlineIconsSwitch').onchange=e=>{state.settings.onlineIcons=e.target.checked;storage();graph?.images.clear();graph?.render();renderSheet();showToast('Preferência de ícones atualizada')};
 $('prefetchBtn').onclick=async()=>{if(!navigator.onLine){showToast('Conecte-se à internet antes de salvar ícones.');return}const btn=$('prefetchBtn');btn.disabled=true;btn.textContent='Baixando…';let n=0;for(const a of all){if(a.brandIcon)continue;try{const im=new Image();im.src=externalLogo(a);await new Promise(resolve=>{im.onload=()=>{n++;resolve()};im.onerror=resolve;setTimeout(resolve,5000)})}catch{}}btn.disabled=false;btn.textContent='Baixar ícones';showToast(n+' ícones carregados. O navegador pode mantê-los no cache para uso offline.');};
 $('backupBtn').onclick=exportBackup;$('restoreBtn').onclick=()=>$('backupFile').click();$('backupFile').onchange=loadBackup;
 $('refreshBtn').onclick=async()=>{try{const reg=await navigator.serviceWorker?.getRegistration();if(reg)await reg.update();showToast('Atualização verificada. Recarregue para consultar novidades.')}catch{showToast('Sem conexão. O catálogo permanece disponível localmente.')}};
 $('searchBox').oninput=e=>{search=e.target.value.trim().toLocaleLowerCase('pt-BR');graph.refresh();if(search.length>1){platform='';category='';itemId='';renderSheet()}};
 $('searchBox').onkeydown=e=>{if(e.key==='Escape'){e.target.value='';search='';graph.refresh()}if(e.key==='Enter'&&search){const q=search.toLocaleLowerCase('pt-BR');const exact=all.find(a=>a.name.toLocaleLowerCase('pt-BR')===q||a.id===q||(a.aliases||[]).some(alias=>alias.toLocaleLowerCase('pt-BR')===q));const starts=all.find(a=>a.name.toLocaleLowerCase('pt-BR').startsWith(q));const item=exact||starts||all.find(a=>searchMatch(a,q));if(item){search='';e.target.value='';setSelection({a:item.id})}}};$('clearSearch').onclick=()=>{$('searchBox').value='';search='';graph.refresh()};
 $('zoomIn').onclick=()=>graph.zoomBy(1.17);$('zoomOut').onclick=()=>graph.zoomBy(1/1.17);$('centerBtn').onclick=()=>graph.reset();$('collapseBtn').onclick=()=>{expandedAll=false;setSelection();graph.reset()};$('expandBtn').onclick=()=>{expandedAll=true;os='Todos';platform='';category='';itemId='';renderFilters();renderSheet();updateCrumbs();graph.refresh();graph.focusOnSelection()};
 $('hideTip').onclick=()=>{$('hideTip').parentNode.hidden=true;state.hideTip=true;storage()};if(state.hideTip)$('hideTip').parentNode.hidden=true;
 for(const id of ['library','comparison','settings','installGuide'])$(id).addEventListener('click',e=>{if(e.target===$(id))closeOverlay(id)});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'){for(const id of ['library','comparison','settings','installGuide'])if(!$(id).hidden){closeOverlay(id);return}if(search){search='';$('searchBox').value='';graph.refresh()}}});
 window.addEventListener('online',()=>showToast('Conectado · logos online disponíveis'));window.addEventListener('offline',()=>showToast('Modo offline · catálogo preservado'));
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false});$('installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installBtn').hidden=true};}
const interpolate=(a,b,t)=>a+(b-a)*t;const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
class SpatialGraph{
 constructor(){this.canvas=$('graphCanvas');this.wrap=$('graphScene');this.ctx=this.canvas.getContext('2d',{alpha:false});this.w=1000;this.h=650;this.dpr=1;this.pan={x:0,y:0};this.targetPan={x:0,y:0};this.zoom=1;this.targetZoom=1;this.yaw=.05;this.pitch=.10;this.motion=Boolean(state.settings.motion)&&!matchMedia('(prefers-reduced-motion: reduce)').matches;this.t=0;this.last=0;this.hit=[];this.images=new Map();this.pointers=new Map();this.coords=new Map();this.dragged=false;this.loopBound=t=>this.loop(t);this.resize();new ResizeObserver(()=>this.resize()).observe(this.wrap);this.attach();requestAnimationFrame(this.loopBound)}
 setMotion(v){this.motion=Boolean(v)&&!matchMedia('(prefers-reduced-motion: reduce)').matches}
 refresh(){this.coords.clear();this.build()}
 reset(){this.yaw=.05;this.pitch=.10;this.targetZoom=1;this.targetPan={x:0,y:0};this.refresh()}
 zoomBy(r){this.targetZoom=clamp(this.targetZoom*r,.24,3.4)}
 focusOnSelection(){
 let pos={x:0,y:0};
 if(itemId)pos=this.coords.get('app:'+itemId)||pos;
 else if(category)pos=this.coords.get('cat:'+platform+':'+category)||pos;
 else if(platform)pos=this.coords.get('sys:'+platform)||pos;
 this.targetPan=category?{x:-pos.x-1.0,y:-pos.y}:{x:platform?2.3:0,y:0};
 this.targetZoom=expandedAll?.30:itemId?.70:category?.68:platform?.63:1;
 }
 resize(){const rect=this.canvas.getBoundingClientRect();this.w=Math.max(280,rect.width);this.h=Math.max(280,rect.height);this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0)}
 project(pos){const u=this.yaw+(this.motion?Math.sin(this.t*.16)*.018:0),v=this.pitch;const cy=Math.cos(u),sy=Math.sin(u),cp=Math.cos(v),sp=Math.sin(v);const x=pos.x+this.pan.x,y=pos.y+this.pan.y,z=pos.z||0;const rx=x*cy+z*sy,rz=-x*sy+z*cy;const ry=y*cp-rz*sp,zz=y*sp+rz*cp;const depth=16-zz;const fac=this.zoom*Math.min(this.w/13.8,this.h/9.6)*16/depth;return{x:this.w*.49+rx*fac,y:this.h*.54+ry*fac,scale:clamp(16/depth,.65,1.5),depth:zz,visible:depth>1,fac}}
 build(){
 this.coords.clear();
 const root={key:'root',type:'root',name:'PRIVACYPACK',p:{x:-7.3,y:0,z:0},color:'#94c9ff'};
 const nodes=[root],edges=[];
 // Selected system: an orderly left-to-right family tree with consistent minimum spacing.
 if(platform&&!expandedAll&&search.length<2){
  const sp={x:-4.8,y:0,z:.2},sys={key:'sys:'+platform,type:'system',name:platform,p:sp,color:COLOR[platform],system:platform};
  nodes.push(sys);edges.push([root,sys]);this.coords.set(sys.key,sp);
  const names=catsBySystem(platform),cols=names.length>11?2:1,rows=Math.ceil(names.length/cols);
  const idxActive=Math.max(0,names.indexOf(category));
  for(let j=0;j<names.length;j++){
   const col=cols===1?0:Math.floor(j/rows),row=cols===1?j:j%rows;
   const rowSpacing=names.length<=3?2.0:1.5;
   const cp={x:-1.9+col*2.5,y:(row-(rows-1)/2)*rowSpacing,z:(j%3-1)*.16};
   const name=names[j];
   const cn={key:'cat:'+platform+':'+name,type:'category',name,p:cp,color:COLOR[platform],system:platform,cat:name,glyph:cats.find(c=>c.name===name)?.glyph||'⬡'};
   nodes.push(cn);edges.push([sys,cn]);this.coords.set(cn.key,cp);
   if(category===name){
    const apps=all.filter(a=>a.cat===name&&a.primary===platform);
    const count=apps.length,appCols=count>8?2:1,perColumn=Math.ceil(count/appCols);
    for(let i=0;i<count;i++){
     const c=Math.floor(i/perColumn),row2=i%perColumn;
     const ap={x:2.8+c*2.75,y:cp.y+(row2-(Math.min(perColumn,count-c*perColumn)-1)/2)*1.36,z:.3+(i%3)*.13};
     const a=apps[i],an={key:'app:'+a.id,type:'app',name:a.name,p:ap,color:COLOR[platform],item:a};
     nodes.push(an);edges.push([cn,an]);this.coords.set(an.key,ap);
    }
   }
  }
  return{nodes,edges};
 }
 // Neutral view: platform constellation, with optional full expansion on an extended canvas.
 root.p={x:0,y:0,z:0};
 const list=SYSTEMS;
 for(let i=0;i<list.length;i++){
  const s=list[i],angle=2*Math.PI*i/list.length-Math.PI/2;
  const pos={x:3.8*Math.cos(angle),y:3.3*Math.sin(angle),z:.25*Math.sin(i*2.4)};
  const sn={key:'sys:'+s,type:'system',name:s,p:pos,color:COLOR[s],system:s};nodes.push(sn);edges.push([root,sn]);this.coords.set(sn.key,pos);
  if(expandedAll){
   const names=catsBySystem(s);
   for(let j=0;j<names.length;j++){
    const radial=angle+(j-(names.length-1)/2)*.12;
    const outer=6.3+Math.floor(j/7)*2.0;
    const cp={x:pos.x+outer*Math.cos(radial),y:pos.y+outer*Math.sin(radial),z:.1};
    const cn={key:'cat:'+s+':'+names[j],type:'category',name:names[j],p:cp,color:COLOR[s],system:s,cat:names[j],glyph:cats.find(c=>c.name===names[j])?.glyph||'⬡'};
    nodes.push(cn);edges.push([sn,cn]);this.coords.set(cn.key,cp);
    const apps=all.filter(a=>a.primary===s&&a.cat===names[j]);
    for(let k=0;k<apps.length;k++){
     const a=apps[k],spread=(k-(apps.length-1)/2)*.75;
     const ap={x:cp.x+2.7*Math.cos(radial)-Math.sin(radial)*spread,y:cp.y+2.7*Math.sin(radial)+Math.cos(radial)*spread,z:.3};
     const an={key:'app:'+a.id,type:'app',name:a.name,p:ap,color:COLOR[s],item:a};nodes.push(an);edges.push([cn,an]);this.coords.set(an.key,ap)
    }
   }
  }
 }
 if(search.length>1){
  const matches=all.filter(a=>searchMatch(a,search)).slice(0,48);
  const found=matches.map((a,i)=>{const theta=i*2.3999632297-Math.PI/2,rad=1.6+1.4*Math.sqrt(i);return{key:'app:'+a.id,type:'app',item:a,name:a.name,p:{x:Math.cos(theta)*rad,y:Math.sin(theta)*rad*.90,z:.08*(i%4)},color:COLOR[a.primary]}});
  return {nodes:[{...root,p:{x:0,y:0,z:0}},...found],edges:[]}
 }
 return {nodes,edges}
 }
 imageFor(node){const key=node.type==='app'?node.item.id:node.system;if(this.images.has(key))return this.images.get(key);const img=new Image();let tried=0;const srcs=node.type==='app'?[`./${localLogo(node.item)}`,...(state.settings.onlineIcons?[externalLogo(node.item)]:[])]:[osIcon(node.system)];img.onerror=()=>{tried++;if(tried<srcs.length)img.src=srcs[tried]};img.src=srcs[0];this.images.set(key,img);return img}
 bg(){const ctx=this.ctx;ctx.fillStyle='#151413';ctx.fillRect(0,0,this.w,this.h);const rg=ctx.createRadialGradient(this.w*.45,this.h*.49,10,this.w*.49,this.h*.51,Math.max(this.w,this.h)*.72);rg.addColorStop(0,'#292725');rg.addColorStop(.6,'#181716');rg.addColorStop(1,'#111110');ctx.fillStyle=rg;ctx.fillRect(0,0,this.w,this.h);const grid=73;ctx.strokeStyle='#ffffff08';ctx.lineWidth=.7;for(let x=(this.pan.x*5)%grid;x<this.w;x+=grid){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,this.h);ctx.stroke()}for(let y=(this.pan.y*5)%grid;y<this.h;y+=grid){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(this.w,y);ctx.stroke()}}
 drawEdge(a,b,i){const ctx=this.ctx,A=this.screen.get(a.key)||this.project(a.p),B=this.screen.get(b.key)||this.project(b.p);if(!A.visible||!B.visible)return;const sx=A.x,sy=A.y,ex=B.x,ey=B.y;ctx.save();ctx.lineWidth=.72;ctx.strokeStyle='#a7a19b68';ctx.setLineDash([2.4,4.5]);ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();ctx.setLineDash([]);if(this.motion){const t=(this.t*.12+i*.137)%1;const x=interpolate(sx,ex,t),y=interpolate(sy,ey,t);ctx.beginPath();ctx.arc(x,y,1.6,0,2*Math.PI);ctx.fillStyle=a.color||'#d0d0cc';ctx.shadowColor=a.color||'#a0caff';ctx.shadowBlur=8;ctx.fill()}ctx.restore()}
 renderNode(n){const q=this.screen.get(n.key)||this.project(n.p);if(!q.visible)return;const ctx=this.ctx;const selected=(n.type==='app'&&itemId===n.item.id)||(n.type==='category'&&category===n.cat&&platform===n.system)||(n.type==='system'&&platform===n.system);const radius=(n.type==='root'?33:n.type==='system'?29:n.type==='category'?23:18)*q.scale*clamp(this.zoom,.72,1.5);ctx.save();const rad=Math.max(12,radius),x=q.x,y=q.y;if(x<-rad*3||x>this.w+rad*3||y<-rad*3||y>this.h+rad*3){ctx.restore();return}
 ctx.shadowColor=selected?n.color:'#000000';ctx.shadowBlur=selected?23:15;const grad=ctx.createRadialGradient(x-rad*.33,y-rad*.48,rad*.1,x,y,rad);grad.addColorStop(0,selected?'#4b4e50':'#393837');grad.addColorStop(.42,'#262524');grad.addColorStop(1,'#0d0d0d');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(x,y,rad,0,2*Math.PI);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=selected?n.color:'#3b3937';ctx.lineWidth=selected?1.5:.9;ctx.stroke();ctx.fillStyle='#ffffff24';ctx.beginPath();ctx.arc(x-rad*.4,y-rad*.65,rad*.075,0,Math.PI*2);ctx.fill();
 if(n.type==='system'||n.type==='app'){const im=this.imageFor(n);if(im.complete&&im.naturalWidth){ctx.save();ctx.beginPath();ctx.arc(x,y,rad*.72,0,Math.PI*2);ctx.clip();const dim=rad*1.27;ctx.drawImage(im,x-dim/2,y-dim/2,dim,dim);ctx.restore()}else{ctx.font=`${Math.floor(rad*.92)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n.type==='system'?'▣':(n.item.emoji||'◈'),x,y)}}
 else{ctx.fillStyle=n.type==='root'?'#a1c7ff':'#e7e1d7';ctx.font=`${Math.floor(rad*.86)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n.type==='root'?'⬡':n.glyph,x,y+1)}
 if(n.type==='root'||n.type!=='app'||this.zoom>.6){
  let label=n.type==='root'?'PRIVACY PACK':n.name;if(label.length>23)label=label.slice(0,22)+'…';
  const fs=clamp(10*q.scale*this.zoom,9,13),font=`${selected?650:500} ${fs}px system-ui`;
  ctx.font=font;ctx.textAlign='center';ctx.textBaseline='top';
  const width=ctx.measureText(label).width+10;
  const candidates=[{x:x-width/2,y:y+rad+5},{x:x-width/2,y:y-rad-fs-8},{x:x+rad+5,y:y-fs/2},{x:x-rad-width-5,y:y-fs/2}];
  let place=null;
  for(const c of candidates){const box={x:c.x,y:c.y,w:width,h:fs+5};
   if(box.x<6||box.x+box.w>this.w-6||box.y<165||box.y+box.h>this.h-55)continue;
   if(this.labelBoxes.some(b=>box.x<b.x+b.w+5&&box.x+box.w+5>b.x&&box.y<b.y+b.h+4&&box.y+box.h+4>b.y))continue;
   if(this.circleBoxes.some(b=>b.key!==n.key&&box.x<b.x+b.r+7&&box.x+box.w>b.x-b.r-7&&box.y<b.y+b.r+7&&box.y+box.h>b.y-b.r-7))continue;
   place={...box};break;
  }
  if(place){this.labelBoxes.push(place);ctx.fillStyle=selected?'#f3f1ee':'#d8d4ce';ctx.shadowColor='#0a0a0a';ctx.shadowBlur=5;ctx.fillText(label,place.x+place.w/2,place.y)}
 }ctx.restore();this.hit.push({n,x,y,r:Math.max(rad+7,20),depth:q.depth})}
 render(){
 const ctx=this.ctx;this.bg();const {nodes,edges}=this.build();this.hit=[];this.labelBoxes=[];this.screen=new Map();
 const screenNodes=nodes.map(n=>({node:n,q:this.project(n.p)}));
 // Iterative 2D separation prevents node circles from occupying the same hit target.
 for(let pass=0;pass<10;pass++){
  for(let i=0;i<screenNodes.length;i++)for(let j=i+1;j<screenNodes.length;j++){
   const a=screenNodes[i],b=screenNodes[j];if(!a.q.visible||!b.q.visible)continue;
   const ra=(a.node.type==='root'?29:a.node.type==='system'?27:a.node.type==='category'?22:17)*a.q.scale*clamp(this.zoom,.72,1.5),rb=(b.node.type==='root'?29:b.node.type==='system'?27:b.node.type==='category'?22:17)*b.q.scale*clamp(this.zoom,.72,1.5);
   let dx=b.q.x-a.q.x,dy=b.q.y-a.q.y,dist=Math.hypot(dx,dy),minimum=Math.max(22,ra)+Math.max(22,rb)+14;
   if(dist<minimum){if(dist<.01){dx=(j%2?1:-1);dy=(i%2?1:-1);dist=Math.hypot(dx,dy)}
    const push=(minimum-dist)*.37,ux=dx/dist,uy=dy/dist;
    const wa=a.node.type==='root'?.15:a.node.type==='system'?.35:1;
    const wb=b.node.type==='root'?.15:b.node.type==='system'?.35:1;
    a.q.x-=ux*push*wa;b.q.x+=ux*push*wb;a.q.y-=uy*push*wa;b.q.y+=uy*push*wb;
   }
  }
 }
 this.circleBoxes=screenNodes.map(({node,q})=>({key:node.key,x:q.x,y:q.y,r:Math.max(12,(node.type==='root'?33:node.type==='system'?29:node.type==='category'?23:18)*q.scale*clamp(this.zoom,.72,1.5))}));
 for(const {node,q} of screenNodes)this.screen.set(node.key,q);
 edges.forEach(([a,b],i)=>this.drawEdge(a,b,i));
 nodes.sort((a,b)=>this.project(a.p).depth-this.project(b.p).depth).forEach(n=>this.renderNode(n));
 $('mapStatus').textContent=`${expandedAll?'EXPANDED':platform?platform.toUpperCase():'ALL SYSTEMS'} · ${nodes.length} NODES · ${all.length} TOOLS`;
 }
 nearest(p){return this.hit.filter(h=>Math.hypot(h.x-p.x,h.y-p.y)<h.r).sort((a,b)=>b.depth-a.depth)[0]}
 attach(){const el=this.canvas;const point=e=>{const r=el.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);const p=point(e);this.pointers.set(e.pointerId,p);this.start={p,time:performance.now(),yaw:this.yaw,pitch:this.pitch};this.dragged=false});
 el.addEventListener('pointermove',e=>{const p=point(e),prev=this.pointers.get(e.pointerId);if(!prev){const near=this.nearest(p);$('tooltip').hidden=!near;if(near){$('tooltip').textContent=near.n.name;$('tooltip').style.left=Math.min(this.w-180,p.x+15)+'px';$('tooltip').style.top=Math.max(10,p.y-40)+'px'}return}this.pointers.set(e.pointerId,p);if(this.pointers.size===1){const dx=p.x-prev.x,dy=p.y-prev.y;if(Math.hypot(p.x-this.start.p.x,p.y-this.start.p.y)>5)this.dragged=true;if(e.shiftKey||e.buttons===2){this.yaw+=dx*.004;this.pitch=clamp(this.pitch+dy*.003,-.65,.65)}else{const factor=this.zoom*Math.min(this.w/13.8,this.h/9.6);this.targetPan.x+=dx/Math.max(30,factor);this.targetPan.y+=dy/Math.max(30,factor);}}else if(this.pointers.size===2){const v=[...this.pointers.values()];let d=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y);if(this.pinch&&d>0)this.zoomBy(d/this.pinch);this.pinch=d;this.dragged=true}});
 el.addEventListener('pointerup',e=>{const p=point(e);if(!this.dragged){const n=this.nearest(p)?.n;if(n){if(n.type==='root')setSelection();else if(n.type==='system')setSelection({p:n.system});else if(n.type==='category')setSelection({p:n.system,c:n.cat});else if(n.type==='app')setSelection({a:n.item.id})}}this.pointers.delete(e.pointerId);if(this.pointers.size<2)this.pinch=0});el.addEventListener('pointercancel',e=>{this.pointers.delete(e.pointerId);this.pinch=0});el.addEventListener('pointerleave',()=>$('tooltip').hidden=true);el.addEventListener('contextmenu',e=>e.preventDefault());el.addEventListener('wheel',e=>{e.preventDefault();this.zoomBy(Math.exp(-e.deltaY*.0013))},{passive:false});el.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='='){this.zoomBy(1.12);e.preventDefault()}if(e.key==='-'){this.zoomBy(1/1.12);e.preventDefault()}if(e.key==='ArrowLeft'){this.targetPan.x+=.25;e.preventDefault()}if(e.key==='ArrowRight'){this.targetPan.x-=.25;e.preventDefault()}if(e.key==='ArrowUp'){this.targetPan.y+=.25;e.preventDefault()}if(e.key==='ArrowDown'){this.targetPan.y-=.25;e.preventDefault()}})}
 loop(time){requestAnimationFrame(this.loopBound);if(document.hidden)return;const minFrame=this.motion?32:95;if(time-this.last<minFrame)return;const dt=this.last?Math.min((time-this.last)/1000,.06):.03;this.last=time;this.t+=this.motion?dt:0;this.zoom=interpolate(this.zoom,this.targetZoom,.16);this.pan.x=interpolate(this.pan.x,this.targetPan.x,.13);this.pan.y=interpolate(this.pan.y,this.targetPan.y,.13);this.render()}
}
let graph=null;
async function init(){try{let [a,b,g]=await Promise.all([fetch('./catalog.json'),fetch('./categories.json'),fetch('./install-guides.json')]);if(!a.ok||!b.ok)throw Error('catálogo ausente');all=await a.json();cats=await b.json();installGuides=g.ok?await g.json():{};all.forEach(x=>x.primary=primarySystem(x));byId=new Map(all.map(x=>[x.id,x]));
 try{if(!localStorage.getItem(STATE_KEY)){const old=JSON.parse(localStorage.getItem('privacypack-atlas-v3'));if(old){state.favorites=old.favorites||[];state.notes=old.notes||{};state.settings={...state.settings,...old.settings,onlineIcons:true};storage()}}}catch{}
 registerUI();graph=new SpatialGraph();renderFilters();renderSheet();updateCrumbs();if(location.hash.startsWith('#app=')){let id=decodeURIComponent(location.hash.slice(5));if(byId.has(id))setSelection({a:id})}else if(location.hash==='#catalogo')openLibrary();if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(console.warn);
 }catch(e){console.error(e);$('sheet').innerHTML='<div class="welcome"><h2>Não foi possível abrir o catálogo</h2><p>Execute a aplicação em HTTPS ou em http://localhost com um servidor local, nunca como arquivo file://.</p></div>';showToast('Erro: '+e.message)}}
init();})();
