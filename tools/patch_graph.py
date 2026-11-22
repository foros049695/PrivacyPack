from pathlib import Path
root=Path(__file__).resolve().parents[1]
s=(root/'app.js').read_text()
start=s.index(' build(){const nodes=')
end=s.index(' imageFor(node)',start)
new=r''' build(){
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
'''
s=s[:start]+new+s[end:]
old='focusOnSelection(){let pos={x:0,y:0};if(itemId)pos=this.coords.get(\'app:\'+itemId)||pos;else if(category)pos=this.coords.get(\'cat:\'+platform+\':\'+category)||pos;else if(platform)pos=this.coords.get(\'sys:\'+platform)||pos;this.targetPan={x:-pos.x*.65,y:-pos.y*.65};this.targetZoom=expandedAll?.40:itemId?.70:category?.69:platform?.71:1}'
new_focus='''focusOnSelection(){
 let pos={x:0,y:0};
 if(itemId)pos=this.coords.get('app:'+itemId)||pos;
 else if(category)pos=this.coords.get('cat:'+platform+':'+category)||pos;
 else if(platform)pos=this.coords.get('sys:'+platform)||pos;
 this.targetPan=category?{x:-pos.x-1.0,y:-pos.y}:{x:platform?2.3:0,y:0};
 this.targetZoom=expandedAll?.30:itemId?.70:category?.68:platform?.63:1;
 }'''
assert old in s
s=s.replace(old,new_focus)
# Resolve screen-circle collisions and label-box collisions; a screen-space priority pass preserves click targets.
s=s.replace("drawEdge(a,b,i){const ctx=this.ctx,A=this.project(a.p),B=this.project(b.p);", "drawEdge(a,b,i){const ctx=this.ctx,A=this.screen.get(a.key)||this.project(a.p),B=this.screen.get(b.key)||this.project(b.p);")
s=s.replace("renderNode(n){const q=this.project(n.p);", "renderNode(n){const q=this.screen.get(n.key)||this.project(n.p);")
needle=''' if(n.type==='root'||n.type!=='app'||this.zoom>.6'){'''
# actual quote differs without '. check
old_label="if(n.type==='root'||n.type!=='app'||this.zoom>.6){let label=n.type==='root'?'PRIVACY PACK':n.name;if(label.length>21)label=label.slice(0,20)+'…';ctx.font=`${selected?650:500} ${clamp(10*q.scale*this.zoom,9,13)}px system-ui`;ctx.fillStyle=selected?'#f3f1ee':'#d8d4ce';ctx.textAlign='center';ctx.textBaseline='top';ctx.shadowColor='#0a0a0a';ctx.shadowBlur=5;ctx.fillText(label,x,y+rad+5)}"
new_label="""if(n.type==='root'||n.type!=='app'||this.zoom>.6){
  let label=n.type==='root'?'PRIVACY PACK':n.name;if(label.length>23)label=label.slice(0,22)+'…';
  const fs=clamp(10*q.scale*this.zoom,9,13),font=`${selected?650:500} ${fs}px system-ui`;
  ctx.font=font;ctx.textAlign='center';ctx.textBaseline='top';
  const width=ctx.measureText(label).width+10;
  const candidates=[{x:x-width/2,y:y+rad+5},{x:x-width/2,y:y-rad-fs-8},{x:x+rad+5,y:y-fs/2},{x:x-rad-width-5,y:y-fs/2}];
  let place=null;
  for(const c of candidates){const box={x:c.x,y:c.y,w:width,h:fs+5};
   if(box.x<6||box.x+box.w>this.w-6||box.y<165||box.y+box.h>this.h-55)continue;
   if(this.labelBoxes.some(b=>box.x<b.x+b.w+5&&box.x+box.w+5>b.x&&box.y<b.y+b.h+4&&box.y+box.h+4>b.y))continue;
   place={...box};break;
  }
  if(place){this.labelBoxes.push(place);ctx.fillStyle=selected?'#f3f1ee':'#d8d4ce';ctx.shadowColor='#0a0a0a';ctx.shadowBlur=5;ctx.fillText(label,place.x+place.w/2,place.y)}
 }"""
assert old_label in s
s=s.replace(old_label,new_label)
start=s.index(' render(){const ctx=this.ctx;this.bg();const {nodes,edges}=this.build();')
end=s.index(' nearest(p)',start)
new_render=''' render(){
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
 for(const {node,q} of screenNodes)this.screen.set(node.key,q);
 edges.forEach(([a,b],i)=>this.drawEdge(a,b,i));
 nodes.sort((a,b)=>this.project(a.p).depth-this.project(b.p).depth).forEach(n=>this.renderNode(n));
 $('mapStatus').textContent=`${expandedAll?'EXPANDED':platform?platform.toUpperCase():'ALL SYSTEMS'} · ${nodes.length} NODES · ${all.length} TOOLS`;
 }
'''
s=s[:start]+new_render+s[end:]
# n labelBoxes was null until render; initialize if graph? yes.
# fixes: graph build call during search currently still depends on platform selection, but search branch handles only neutral root.
# moved sorted labels closer first? screen hit labels may skip some acceptable.
(root/'app.js').write_text(s)
print('Layout upgraded: compact hierarchical flow + screen-space avoidance')
