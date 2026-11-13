// ===== DG instance: a dungeon is a private world on your own computer. You leave the room you were in (nobody else's world is touched, nothing is written to any world save), the
// world is replaced by the dungeon's own map, and when you leave you go back to exactly where you stood. Everything that moves lives here:
//   the map builder (DG.B: rooms, trials, gates, boss arena), the parkour gadgets (they keep real collision, with checkpoints), the hazards every monster and boss uses (DG.fx: each dangerous thing
//   warns with a bright rim and a filling shape first), the player's dungeon moves (Shift dash, wall jump, ice), the cinematic camera (DG.cam) and the flow of a run.
// Cost: gadgets and hazards only touch what exists, pre-rendered glows, at most 90 ambient particles, nothing is O(world) per frame. =====
try{(()=>{
 const DG=window.DG,R=Math.random,TAU=Math.PI*2,rn=(a,b)=>a+R()*(b-a),cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,ez=x=>{x=cl(x,0,1);return x*x*(3-2*x)},eo=x=>1-Math.pow(1-cl(x,0,1),3);
 DG.keyName=a=>{try{const k=RB_KB[a];return k=='shift'?'Shift':KB1.label(k)}catch(_){return a=='dash'?'Shift':'F'}};
 // dashing: the old dash timer (still set by some class skills) or the class dash on Shift (STY1); a dash that ended a moment ago still counts, so a
 // dash started a little short of a gate carries you through instead of bouncing you back on its last frame
 window.DASHING=()=>{if(dash>0||(window.STY1&&STY1.DS&&STY1.DS.on)){DASHING.t=performance.now();return true}return performance.now()-(DASHING.t||0)<140};
 const reduced=()=>{try{return !!(cel.opt.reduce||QM.reduce)||!DG.S.opt.fx}catch(_){return false}};
 const tone=(a,b,d,ty,v,dl,vib)=>{try{SFX7.tone(a,b,d,ty,v,dl,vib)}catch(_){}};
 const shk=v=>{try{if(DG.S.opt.shake&&!QM.reduce&&OPT.sh!==0)shake=Math.max(shake,v)}catch(_){}};
 const glo=c=>BOSS6.glo(c);
 const BR=180,TOP=181,DK=182,CRY=183,ICE=184,ACC=185,DGT=[BR,TOP,DK,CRY,ICE,ACC];
 for(const b of DGT){try{BLK[b]=['Dungeon Stone','#3a3a44',99];SOLID6[b]=1;PRICE[b]=0;LVREQ[b]=0}catch(_){}}
 const isDGW=n=>typeof n=='string'&&n.startsWith('dg_');
 let run=null,L=null,B0=null;
 DG.BP={};DG.isDGW=isDGW;DG.reduced=reduced;DG.shk=shk;DG.tone=tone;DG.TID={BR,TOP,DK,CRY,ICE,ACC};
 Object.defineProperty(DG,'run',{get(){return run}});Object.defineProperty(DG,'L',{get(){return L}});
 // ---- the blocks of the current dungeon. Same six tile ids in every dungeon, painted for whichever one you are in; the caches are emptied on the way in
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const hexA=(h,a)=>{h=String(h).replace('#','');return'rgba('+parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16)+','+a+')'};
 const mix=(h,k)=>{h=String(h).replace('#','');const f=i=>cl(Math.round(parseInt(h.slice(i,i+2),16)*k),0,255).toString(16).padStart(2,'0');return'#'+f(0)+f(2)+f(4)};
 DG.mix=mix;DG.hexA=hexA;
 const STYLE={ruins:{brick:1,top:'#5f9a48',topd:'#3a6a30',crack:0,speck:'rgba(120,200,120,.16)',seam:'rgba(10,20,14,.55)'},crimson:{brick:0,top:'#6a2a1a',topd:'#ff5a1e',crack:1,speck:'rgba(255,120,40,.1)',seam:'rgba(10,2,2,.7)'},frozen:{brick:1,top:'#e8f8ff',topd:'#9ad8f0',crack:0,speck:'rgba(200,240,255,.18)',seam:'rgba(8,24,44,.5)'},hollow:{brick:1,top:'#5a3a80',topd:'#e8d8a0',crack:1,speck:'rgba(180,120,255,.12)',seam:'rgba(8,2,16,.65)'},dragon:{brick:0,top:'#6a6050',topd:'#2a2420',crack:0,speck:'rgba(230,220,190,.12)',seam:'rgba(8,6,4,.6)'},abyss:{brick:0,top:'#3a2a60',topd:'#9a5aff',crack:1,speck:'rgba(255,255,255,.4)',seam:'rgba(4,0,12,.7)'},star:{brick:0,top:'#4a3a50',topd:'#ffd86a',crack:1,speck:'rgba(255,230,160,.35)',seam:'rgba(6,2,10,.7)'},night:{brick:1,top:'#20283c',topd:'#a8c8ff',crack:0,speck:'rgba(170,200,255,.12)',seam:'rgba(0,2,10,.75)'},king:{brick:1,top:'#3a3648',topd:'#c0a8ff',crack:0,speck:'rgba(216,220,232,.1)',seam:'rgba(4,2,10,.7)'},eater:{brick:0,top:'#3a1218',topd:'#ff2a3a',crack:1,speck:'rgba(255,120,120,.2)',seam:'rgba(6,0,2,.8)'}};
 function paint(b,v){const d=(run&&run.d)||(B0&&B0.d)||DG.LIST[0],p=d.p,st=STYLE[d.id]||STYLE.ruins,c=document.createElement('canvas');c.width=c.height=T;const x=c.getContext('2d'),Rb=rr(b*7919+v*131+d.id.length*17+d.id.charCodeAt(0));
  const base=b==DK?mix(p.rock,.32):b==ACC?mix(p.accent,.5):b==ICE?'#8ad4f0':b==CRY?mix(p.rock,.5):p.rock,gr=x.createLinearGradient(0,0,T,T);gr.addColorStop(0,mix(base,1.14));gr.addColorStop(1,mix(base,.78));x.fillStyle=gr;x.fillRect(0,0,T,T);
  if(b==ICE){x.fillStyle='rgba(255,255,255,.5)';x.fillRect(0,0,T,7);x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=1.4;for(let i=0;i<3;i++){x.beginPath();const px=Rb()*T;x.moveTo(px,8);x.lineTo(px+Rb()*12-6,T-2);x.stroke()}x.fillStyle='rgba(20,90,150,.25)';x.fillRect(0,T-8,T,8);return c}
  if(st.brick&&b!=DK){x.strokeStyle=st.seam;x.lineWidth=2;const off=(v%2)*T/2;x.beginPath();x.moveTo(0,T/2);x.lineTo(T,T/2);x.moveTo(off+T/4,0);x.lineTo(off+T/4,T/2);x.moveTo((off+T*.75)%T,T/2);x.lineTo((off+T*.75)%T,T);x.stroke();x.strokeStyle='rgba(255,255,255,.07)';x.lineWidth=1;x.beginPath();x.moveTo(0,T/2+2);x.lineTo(T,T/2+2);x.stroke()}
  for(let i=0;i<(b==DK?10:26);i++){x.fillStyle=Rb()<.5?st.speck:'rgba(0,0,0,.16)';const s=1+Rb()*2.6;x.fillRect(Rb()*T,Rb()*T,s,s)}
  if(!st.brick&&b!=DK){x.strokeStyle=st.seam;x.lineWidth=1.6;for(let i=0;i<3;i++){x.beginPath();let px=Rb()*T,py=Rb()*T;x.moveTo(px,py);for(let k=0;k<3;k++){px+=(Rb()-.5)*22;py+=(Rb()-.5)*22;x.lineTo(px,py)}x.stroke()}}
  if(st.crack&&b!=DK&&v!=1){x.globalCompositeOperation='lighter';x.strokeStyle=hexA(p.glow,.75);x.lineWidth=1.5;x.beginPath();let px=Rb()*T,py=T;x.moveTo(px,py);for(let k=0;k<4;k++){px+=(Rb()-.5)*16;py-=T*.24;x.lineTo(px,py)}x.stroke();x.globalCompositeOperation='source-over'}
  if(b==CRY){x.globalCompositeOperation='lighter';const gg=x.createRadialGradient(T/2,T*.6,2,T/2,T*.6,T*.6);gg.addColorStop(0,hexA(p.glow,.7));gg.addColorStop(1,hexA(p.glow,0));x.fillStyle=gg;x.fillRect(0,0,T,T);x.globalCompositeOperation='source-over';for(const[cx,w,h]of[[.3,6,.55],[.58,9,.85],[.82,5,.42]]){x.fillStyle=mix(p.glow,1.1);x.beginPath();x.moveTo(T*cx,T-T*h);x.lineTo(T*cx+w,T*.72);x.lineTo(T*cx+w*.6,T);x.lineTo(T*cx,T);x.closePath();x.fill();x.fillStyle=mix(p.glow,.6);x.beginPath();x.moveTo(T*cx,T-T*h);x.lineTo(T*cx-w,T*.72);x.lineTo(T*cx-w*.6,T);x.lineTo(T*cx,T);x.closePath();x.fill()}}
  if(b==TOP){x.fillStyle=st.top;x.fillRect(0,0,T,9);x.fillStyle=st.topd;for(let i=0;i<8;i++){const px=Rb()*T,h=3+Rb()*9;x.fillRect(px,6,3,h)}x.fillStyle='rgba(255,255,255,.22)';x.fillRect(0,0,T,2)}
  x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=1.5;x.strokeRect(.75,.75,T-1.5,T-1.5);return c}
 {const _bs=blockSprite;blockSprite=function(b,v){if(b>=BR&&b<=ACC)return paint(b,v);return _bs.apply(this,arguments)}}
 function flushArt(){try{for(const b of DGT)for(let v=0;v<3;v++)delete SPR[b*4+v];TILE7.cache.clear()}catch(_){}}
 DG.sprite=(b,x,y)=>{try{return spr(b,x,y)}catch(_){return null}};

 // ================= the map builder =================
 function Builder(d){const B={d,x:6,fy:72,rooms:[],gad:[],deco:[],lights:[],solids:[],illus:[],chests:[],portals:[],gates:[],pits:[],checks:[],notes:[]};B0=B;
  const inb=(x,y)=>x>1&&x<W-2&&y>1&&y<H-2,air=(x,y)=>{if(inb(x,y))tiles[y*W+x]=0},put=(x,y,b)=>{if(inb(x,y)){tiles[y*W+x]=b;hp[y*W+x]=99}};
  const Rm=rr(d.id.charCodeAt(0)*7919+d.id.length*131);B.R=Rm;B.put=put;B.air=air;
  // an opening of w x h with rough edges where the style wants them. x,y top-left in tiles
  B.carve=(x0,y0,w,h,o={})=>{const j=o.rough==null?1:o.rough;for(let x=x0;x<x0+w;x++){const e=Math.min(x-x0,x0+w-1-x),arch=o.arch?Math.round(Math.pow(1-Math.min(1,e/(w*.28)),2)*o.arch):0,t=(j&&e>1&&Rm()<.22?1:0)+arch;for(let y=y0+t;y<y0+h;y++)air(x,y)}};
  B.light=(x,y,c,r,a)=>{B.lights.push({x:x*T,y:y*T,c:c||d.p.glow,r:r||T*6,a:a==null?.5:a,ph:Rm()*6});return B};
  B.dc=(k,x,y,s,o)=>{B.deco.push(Object.assign({k,x:x*T,y:y*T,s:s||1,fl:Rm()<.5?-1:1,ph:Rm()*6},o||{}));return B};
  // the entrance hall: the way out, a first checkpoint and room to breathe
  B.start=(w=16,h=9)=>{B.carve(B.x,B.fy-h,w,h,{arch:2});B.spawn={x:(B.x+5)*T,y:(B.fy-2)*T};B.portals.push({x:(B.x+2.5)*T,y:B.fy*T,kind:'exit'});B.checks.push({x:(B.x+5)*T,y:B.fy*T,on:1,first:1});B.light(B.x+2.5,B.fy-2,d.p.glow,T*5,.6);B.rooms.push({kind:'hall',x0:B.x,x1:B.x+w,y0:B.fy-h,fy:B.fy});B.x+=w;return B};
  // a connecting passage; dy moves the floor up (negative) or down in steps you can walk
  B.link=(w=5,h=4,dy=0)=>{const n=Math.abs(dy),step=dy?Math.sign(dy):0;for(let i=0;i<w;i++){const f=B.fy+Math.round(dy*Math.min(1,i/Math.max(1,w-1)));for(let y=f-h;y<f;y++)air(B.x+i,y)}B.fy+=dy;B.x+=w;return B};
  // a fight room: its doors shut until every wave is down
  B.room=(o)=>{const w=o.w||30,h=o.h||13,x=B.x,fy=B.fy;B.carve(x,fy-h,w,h,{arch:o.arch==null?3:o.arch});const r={kind:'fight',x0:x,x1:x+w,y0:fy-h,fy,waves:o.waves||[],survive:o.survive||null,title:o.title||'',elite:!!o.elite,state:'wait',ledges:[]};
   if(o.ledges)for(const[lx,up,lw]of o.ledges)for(let i=0;i<lw;i++)put(x+lx+i,fy-up,ACC),r.ledges.push([x+lx+i,fy-up]);
   for(const[lx,c]of(o.crystals||[]))put(x+lx,fy-1,CRY),B.light(x+lx+.5,fy-1,d.p.glow,T*5,.7);
   B.rooms.push(r);B.x+=w;return r};
  B.gate=(key=true)=>{const x=B.x;B.carve(x,B.fy-6,8,6,{rough:0});B.gates.push({x:(x+4)*T,y:B.fy*T,h:T*6,key:key?d.skey:0,open:false,t:0});B.solids.push(B.gates[B.gates.length-1].sol={x0:(x+3.4)*T,y0:(B.fy-6)*T,x1:(x+4.6)*T,y1:B.fy*T,on:1,gate:1});B.x+=8;return B};
  // the boss arena. Its entrance closes behind you
  B.arena=(w=46,h=22,o={})=>{const x=B.x,fy=B.fy;B.carve(x,fy-h,w,h,{arch:o.arch==null?4:o.arch,rough:0});const r={kind:'boss',x0:x,x1:x+w,y0:fy-h,fy,state:'wait',boss:d.boss};for(const[lx,up,lw]of(o.ledges||[]))for(let i=0;i<lw;i++)put(x+lx+i,fy-up,ACC);B.rooms.push(r);B.x+=w;B.light(x+w/2,fy-h/2,d.p.glow,T*16,.35);return r};
  // a hidden pocket behind a wall that is not really there. side up (above the current cursor) or down
  B.secret=(sx,up,w=9,h=5,o={})=>{const y1=B.fy-up;B.carve(sx,y1-h,w,h,{rough:0});B.illus.push({x0:sx-3,y0:y1-Math.min(h,3),x1:sx,y1});for(let x=sx-3;x<sx;x++)for(let y=y1-Math.min(h,3);y<y1;y++)air(x,y);B.chests.push({x:(sx+w-2.5)*T,y:y1*T,kind:'secret',id:o.id||'s1',open:false});B.light(sx+w-2.5,y1-1,d.p.accent,T*4,.6);return B};
  B.chest=(x,y,kind)=>{B.chests.push({x:x*T,y:y*T,kind,id:kind,open:false,hid:kind=='final'});return B};
  // ---- a trial: a chamber over a deadly pit. Author with T.* in tiles: x from the left wall of the chamber, up = rows above the entry floor (negative is below it)
  B.trial=(o,fn)=>{const w=o.w||50,up=o.up||10,dn=o.dn||6,x0=B.x,fy=B.fy,pitY=fy+dn-1;B.carve(x0,fy-up,w,up+dn,{rough:o.rough==null?1:o.rough,arch:o.arch||0});for(let x=x0;x<x0+w;x++)put(x,pitY,DK);
   B.pits.push({x0:x0*T,x1:(x0+w)*T,y:pitY*T,kind:o.pit||'void',name:o.name||''});const rm={kind:'trial',x0,x1:x0+w,y0:fy-up,fy,name:o.name||'Parkour trial',state:'wait'};B.rooms.push(rm);
   const XY=(x,up2)=>[(x0+x)*T,(fy-up2)*T],G=(k,o2)=>{const g=Object.assign({k,rm},o2);B.gad.push(g);return g};
   const Tn={w,fy,x0,
    ledge(x,up2,lw,b){for(let i=0;i<lw;i++)put(x0+x+i,fy-up2,b||ACC);return Tn},
    pillar(x,up2,hh=4){for(let y=0;y<hh;y++)put(x0+x,fy-up2+y,y?BR:ACC);return Tn},
    wall(x,up2,hh,lw=1){for(let i=0;i<lw;i++)for(let y=0;y<hh;y++)put(x0+x+i,fy-up2+y,BR);return Tn},
    ice(x,up2,lw){for(let i=0;i<lw;i++)put(x0+x+i,fy-up2,ICE);return Tn},
    mover(x,up2,lw,dx,dy,per,ph){const[a,b]=XY(x,up2);return G('mover',{bx:a,by:b,w:lw*T,dx:dx*T,dy:dy*T,per:per||4,ph:ph||0})},
    vanish(x,up2,lw,on,off,ph){const[a,b]=XY(x,up2);return G('vanish',{x:a,y:b,w:lw*T,on:Math.max(on||0,2.2),off:Math.min(off||.9,1),ph:ph||0})},
    rotor(x,up2,r,n,per,lw){const[a,b]=XY(x,up2);return G('rotor',{cx:a,cy:b,r:r*T,n:n||3,per:per||7,w:(lw||2)*T})},
    fall(x,up2,lw,delay){const[a,b]=XY(x,up2);return G('fall',{x:a,y:b,y0:b,w:lw*T,delay:delay||.55,st:0,t:0,vy:0})},
    bridge(x,up2,n,iv){const[a,b]=XY(x,up2);return G('bridge',{x:a,y:b,n,sw:T*1.5,iv:iv||.34,st:0,t:0,segs:Array.from({length:n},()=>({f:0,y:0,vy:0}))})},
    dashgate(x,up2,hh){const[a,b]=XY(x,up2);return G('dashgate',{x:a,y0:b,y1:b+hh*T,fl:0})},
    blade(x,up2,r,dx,dy,per,ph){const[a,b]=XY(x,up2);return G('blade',{bx:a,by:b,r:r*T,dx:(dx||0)*T,dy:(dy||0)*T,per:per||3,ph:ph||0,a:0})},
    jet(x,up2,hh,on,off,ph,dir){const[a,b]=XY(x,up2);return G('jet',{x:a,y:b,h:hh*T,on:on||1.1,off:off||1.6,ph:ph||0,dir:dir||-1})},
    laser(x,up2,hh,dx,per,ph){const[a,b]=XY(x,up2);return G('laser',{bx:a,y0:b,y1:b+hh*T,dx:(dx||0)*T,per:per||4,ph:ph||0})},
    door(x,up2,hh,on,off,ph){const[a,b]=XY(x,up2);const s={x0:a,y0:b,x1:a+T*.6,y1:b+hh*T,on:1};B.solids.push(s);return G('door',{x:a,y:b,h:hh*T,on:on||2,off:off||2,ph:ph||0,sol:s,o:0})},
    plate(x,up2,o3){const[a,b]=XY(x,up2);return G('plate',Object.assign({x:a,y:b,w:T*2,on:0,t:0},o3))},
    path(x,up2,lw,grp,o3){const[a,b]=XY(x,up2);return G('path',Object.assign({x:a,y:b,w:lw*T,grp,a:0},o3||{}))},
    seq(arr,grp,o3){return G('seq',Object.assign({pads:arr.map(([x,up2],i)=>{const[a,b]=XY(x,up2);return{x:a,y:b,w:T*2,n:i}}),grp,st:0,i:0,t:0,order:null},o3||{}))},
    grav(x1,x2,o3){return G('grav',Object.assign({x0:(x0+x1)*T,x1:(x0+x2)*T,lo:.38,hi:1.55,per:5,mode:1},o3||{}))},
    wind(x1,x2,up2,hh,sp){const[a,b]=XY(x1,up2);return G('wind',{x0:a,x1:(x0+x2)*T,y0:b,y1:b+hh*T,sp:sp||-900})},
    check(x,up2){const[a,b]=XY(x,up2);B.checks.push({x:a,y:b,on:0});return Tn},
    key(x,up2){const[a,b]=XY(x,up2);B.keyAt={x:a,y:b,got:false};return Tn},
    light(x,up2,c,r,al){B.light(x0+x,fy-up2,c,r,al);return Tn},dc(k,x,up2,s,o3){B.dc(k,x0+x,fy-up2,s,o3);return Tn}};
   for(let x=0;x<3;x++)for(let y=0;y<dn-1;y++)put(x0+x,fy+y,BR);for(let x=w-3;x<w;x++)for(let y=0;y<dn-1;y++)put(x0+x,fy+y,BR);
   fn(Tn);B.x+=w;return B};
  B.finish=()=>{for(let i=0;i<B.solids.length;i++){}
   for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){const k=y*W+x,b=tiles[k];if(!b)continue;if(b==DK){const near=(dx,dy)=>!tiles[(y+dy)*W+x+dx];if(near(0,-1))tiles[k]=TOP;else if(near(0,1)||near(1,0)||near(-1,0))tiles[k]=BR;else if(y>3&&!tiles[(y-2)*W+x])tiles[k]=BR}else if(b==BR&&!tiles[k-W])tiles[k]=TOP}
   return B};
  if(DG.duoB)DG.duoB(B);
  return B}
 DG.Builder=Builder;
 function buildMap(d){tiles.fill(DK);hp.fill(99);wl.fill(0);trees.clear();pop.clear();hitAt.clear();try{WALL9.clear()}catch(_){}drops.length=0;
  flushArt();const B=Builder(d);(DG.BP[d.id]||DG.BP.fallback)(B);B.finish();L=B;for(const g of B.gad)initG(g);for(const c of B.checks)c.on=c.first?1:0;
  try{SHN=new Int16Array(W).fill(H-2)}catch(_){}return B}

 // ================= hazards =================
 const HZ=[],WV=[],PR=[],BM=[],GR=[],RG=[],WL=[],MK=[],SD=[],Q=[];let queueN=0;
 const later=(t,f)=>{Q.push({t,f})};
 const dtele=(t)=>t*((run&&run.df&&run.df.tel)||1);
 function hurtP(a,kb,o){if(!(a>0)||iT>0||!run||DG.god||DG.aimed||(DG.coop&&DG.coop.down))return false;if(dash>0)return false;try{if(DG.creative())return false}catch(_){}const arm=Math.min(.8,(bonus().arm||0)+(guard>0?.5:0)),d=a*(1-arm);P.hp-=d;run.taken+=d;run.hits++;iT=.7;if(kb!=null)P.vx=kb;P.vy=Math.min(P.vy,o&&o.up?o.up:-260);hurtF=.42;shk(.1);if(DG.coop&&DG.coop.C)DG.coop.C.rev=0;try{snd(150,.2,'sawtooth',.06)}catch(_){}if(o&&o.fn)try{o.fn()}catch(_){}return true}
 const hitsRect=(z)=>P.x+P.w/2>z.x0&&P.x-P.w/2<z.x1&&P.y+P.h>z.y0&&P.y<z.y1;
 const pcx=()=>P.x,pcy=()=>P.y+P.h/2;
 const fx={
  // a rectangle: warns for tel seconds, then hurts for act seconds. o: {c,dmg,kb,kind('slam','up','down','fire','ice','void','bolt'),rep(seconds between hits),fn}
  z(x0,y0,x1,y1,tel,act,o={}){const z=Object.assign({x0,y0,x1,y1,tel:dtele(tel),tel0:dtele(tel),act,act0:act,c:'#ff5a4a',dmg:0,kb:260,kind:'slam',rep:0,rt:0,hit:0},o);HZ.push(z);return z},
  // a circle
  c(cx,cy,r,tel,act,o={}){const z=fx.z(cx-r,cy-r,cx+r,cy+r,tel,act,o);z.circ=1;z.cx=cx;z.cy=cy;z.r=r;return z},
  // a column up from the floor at x (or down from the ceiling with o.kind='down')
  col(x,floorY,hh,w,tel,o={}){return fx.z(x-w/2,floorY-hh,x+w/2,floorY+2,tel,o.act||.35,Object.assign({kind:'up'},o))},
  // a shock wave running along the floor: jump it. o:{sp,h,life,c,dmg,kind}
  wave(x,floorY,dir,o={}){const v=Object.assign({x,fy:floorY,d:dir,sp:420,h:T*1.4,w:T,life:3,c:'#ffd86a',dmg:0,hit:0,kind:'shock',tel:0},o);v.tel=dtele(v.tel);WV.push(v);return v},
  // a projectile. o:{r,c,dmg,kind,home,msp,g,l,land(q),kb,trail}
  shot(x,y,vx,vy,o={}){const q=Object.assign({x,y,vx,vy,r:10,c:'#ff5a4a',dmg:0,kind:'orb',home:0,msp:0,g:0,l:5,a:0},o);q.sp0=Math.hypot(vx,vy);if(PR.length<70)PR.push(q);return q},
  // a beam from x,y at angle a. o:{w,tel,act,va,c,dmg,src,ox,oy}
  beam(x,y,a,len,o={}){const b=Object.assign({x,y,a,len,w:22,tel:.8,act:.5,va:0,c:'#ff5a4a',dmg:0,rt:0},o);b.tel=dtele(b.tel);b.tel0=b.tel;BM.push(b);return b},
  // something left on the floor: fire, ice, darkness. o:{life,c,dmg,rate,slip,kind,h}
  ground(x0,x1,floorY,o={}){const g=Object.assign({x0,x1,y:floorY,h:T*.8,life:4,life0:o.life||4,c:'#ff7a2a',dmg:0,rate:.6,rt:0,slip:0,kind:'fire',tel:o.tel||0},o);GR.push(g);return g},
  // a ring that grows: stand in its gap or leave its path. o:{sp,max,w,gap,gw,c,dmg}
  ring(x,y,o={}){const q=Object.assign({x,y,r:o.r0||T,sp:320,max:T*22,w:18,gap:R()*TAU,gw:.8,c:'#b070ff',dmg:0,hit:0},o);RG.push(q);return q},
  // a well that drags you in. o:{reach,r,str,life,c,dmg,tel}
  well(x,y,o={}){const q=Object.assign({x,y,reach:T*9,r:T*1.3,str:1500,life:4,life0:o.life||4,c:'#9a5aff',dmg:0,rt:0,tel:dtele(o.tel||.8),tel0:dtele(o.tel||.8)},o);WL.push(q);return q},
  // a mark on you: it follows you, freezes where you stand for its last half second, then bursts. Move away. o:{t,r,c,dmg}
  mark(o={}){const q=Object.assign({t:3,t0:o.t||3,r:T*3,c:'#ff4ae0',dmg:0,x:P.x,y:P.y+P.h/2},o);q.t0=q.t;MK.push(q);return q},
  // a temporary wall you cannot walk through. o:{life,c,kind,hit:damage on rising}
  wall(x0,y0,x1,y1,o={}){const s=Object.assign({x0,y0,x1,y1,on:1,life:5,life0:o.life||5,c:'#9aa88e',kind:'stone',temp:1,rise:0},o);SD.push(s);L&&L.solids.push(s);return s},
  later,hurt:hurtP,
  clear(){HZ.length=WV.length=PR.length=BM.length=GR.length=RG.length=WL.length=MK.length=Q.length=0;if(L)L.solids=L.solids.filter(s=>!s.temp);SD.length=0},
  get count(){return HZ.length+WV.length+PR.length+BM.length+GR.length+RG.length+WL.length+MK.length}};
 DG.fx=fx;
 function segD(px,py,x0,y0,x1,y1){const dx=x1-x0,dy=y1-y0,l2=dx*dx+dy*dy||1,k=cl(((px-x0)*dx+(py-y0)*dy)/l2,0,1);return Math.hypot(px-x0-dx*k,py-y0-dy*k)}
 function tickFx(dt){for(let i=Q.length-1;i>=0;i--){const q=Q[i];q.t-=dt;if(q.t<=0){Q.splice(i,1);try{q.f()}catch(e){console.error('DG later',e)}}}
  const cx=pcx(),cy=pcy();
  for(let i=HZ.length-1;i>=0;i--){const z=HZ[i];if(z.tel>0){z.tel-=dt;if(z.tel<=0){if(z.boom!==0){shk(z.kind=='slam'?.14:.06);if(!reduced())try{VFX.burst((z.x0+z.x1)/2,z.y1-4,[z.c,'#fff'],8,180,1,.5,10)}catch(_){}}if(z.snd!==0)tone(z.kind=='slam'?80:180,50,.3,'sawtooth',.05);if(z.on)try{z.on(z)}catch(_){}}continue}
   z.act-=dt;z.rt-=dt;const h=z.circ?Math.hypot(cx-z.cx,cy-z.cy)<z.r+P.w*.35:hitsRect(z);if(h&&(z.rep?z.rt<=0:!z.hit)){z.hit=1;z.rt=z.rep;hurtP(z.dmg,Math.sign(P.x-(z.x0+z.x1)/2||1)*z.kb,{fn:z.fn})}if(z.act<=0)HZ.splice(i,1)}
  for(let i=WV.length-1;i>=0;i--){const v=WV[i];if(v.tel>0){v.tel-=dt;continue}v.x+=v.d*v.sp*dt;v.life-=dt;if(!v.hit&&Math.abs(P.x-v.x)<v.w/2+P.w*.4&&P.y+P.h>v.fy-v.h){v.hit=1;hurtP(v.dmg,v.d*420)}if(!reduced()&&R()<dt*24)try{VFX.add(0,v.c,v.x+rn(-v.w/2,v.w/2),v.fy-rn(0,v.h),-v.d*rn(20,70),-rn(20,110),.5,9,3,{a:.8})}catch(_){}if(v.life<=0||solidAt(Math.floor((v.x+v.d*T*.5)/T),Math.floor((v.fy-8)/T)))WV.splice(i,1)}
  for(let i=PR.length-1;i>=0;i--){const q=PR[i];q.l-=dt;q.a+=dt;if(q.home&&q.a>(q.hd||0)){const dx=cx-q.x,dy=cy-q.y,d=Math.hypot(dx,dy)||1;q.vx+=dx/d*q.home*dt;q.vy+=dy/d*q.home*dt;const v=Math.hypot(q.vx,q.vy),mx=q.msp||q.sp0;if(v>mx){q.vx*=mx/v;q.vy*=mx/v}}q.vy+=q.g*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
   let dead=q.l<=0;if(Math.hypot(cx-q.x,cy-q.y)<q.r+P.w*.42){hurtP(q.dmg,Math.sign(q.vx||1)*(q.kb||220));dead=true;if(q.hitfn)try{q.hitfn(q)}catch(_){}}if(!dead&&!q.ghost&&solidAt(Math.floor(q.x/T),Math.floor(q.y/T))){dead=true;if(q.land)try{q.land(q)}catch(e){console.error(e)}}if(dead){if(!reduced())try{VFX.burst(q.x,q.y,[q.c,'#fff'],5,130,1,.4,9)}catch(_){}PR.splice(i,1)}}
  for(let i=BM.length-1;i>=0;i--){const b=BM[i];if(b.src){b.x=b.src.x+(b.ox||0);b.y=b.src.y+(b.oy||0)}if(b.tel>0){b.tel-=dt;if(b.tel<=0){tone(220,180,.5,'sawtooth',.04);shk(.08)}continue}b.act-=dt;b.a+=b.va*dt;b.rt-=dt;const ex=b.x+Math.cos(b.a)*b.len,ey=b.y+Math.sin(b.a)*b.len;if(b.rt<=0&&segD(cx,cy,b.x,b.y,ex,ey)<b.w/2+P.w*.35){b.rt=.5;hurtP(b.dmg,Math.sign(cx-b.x||1)*240)}if(b.act<=0)BM.splice(i,1)}
  for(let i=GR.length-1;i>=0;i--){const q=GR[i];q.life-=dt;q.rt-=dt;if(q.tel>0){q.tel-=dt}else if(P.x>q.x0&&P.x<q.x1&&Math.abs(P.y+P.h-q.y)<q.h+6){if(q.dmg>0&&q.rt<=0){q.rt=q.rate;hurtP(q.dmg,null)}if(q.slip)P.dgSlip=.1}if(!reduced()&&R()<dt*(q.x1-q.x0)/T*1.4)try{VFX.add(0,q.c,rn(q.x0,q.x1),q.y-rn(0,q.h),rn(-14,14),-rn(20,90),.6,8,3,{a:.7})}catch(_){}if(q.life<=0)GR.splice(i,1)}
  for(let i=RG.length-1;i>=0;i--){const g=RG[i];g.r+=g.sp*dt;const dx=cx-g.x,dy=cy-g.y,d=Math.hypot(dx,dy);let da=Math.atan2(dy,dx)-g.gap;da=Math.atan2(Math.sin(da),Math.cos(da));if(!g.hit&&Math.abs(d-g.r)<g.w/2+P.w*.35&&Math.abs(da)>g.gw/2){g.hit=1;hurtP(g.dmg,Math.sign(dx||1)*380)}if(g.r>g.max)RG.splice(i,1)}
  for(let i=WL.length-1;i>=0;i--){const q=WL[i];if(q.tel>0){q.tel-=dt;continue}q.life-=dt;q.rt-=dt;const dx=q.x-cx,dy=q.y-cy,d=Math.hypot(dx,dy)||1;if(d<q.reach){const k=1-d/q.reach,s=q.str*(.35+.65*k);P.vx+=dx/d*s*dt*(P.g?1.6:1);P.vy+=dy/d*s*dt*.8}if(d<q.r*1.1&&q.rt<=0){q.rt=.5;hurtP(q.dmg,Math.sign(-dx||1)*300)}if(q.life<=0){if(q.boom){fx.c(q.x,q.y,q.r*2.6,.05,.3,{c:q.c,dmg:q.dmg*1.3,kind:'void'});shk(.18)}WL.splice(i,1)}}
  for(let i=MK.length-1;i>=0;i--){const q=MK[i];q.t-=dt;if(q.t>.5){q.x=cx;q.y=cy}if(q.t<=0){fx.c(q.x,q.y,q.r,.02,.28,{c:q.c,dmg:q.dmg,kind:'void'});shk(.2);tone(120,40,.5,'sawtooth',.07);if(!reduced())try{VFX.shatter(q.x,q.y,[q.c,'#fff'],18)}catch(_){}MK.splice(i,1)}}
  for(let i=SD.length-1;i>=0;i--){const s=SD[i];s.life-=dt;s.rise=Math.min(1,s.rise+dt*3);if(s.life<=0){s.on=0;SD.splice(i,1);if(L){const j=L.solids.indexOf(s);if(j>=0)L.solids.splice(j,1)}if(!reduced())try{VFX.burst((s.x0+s.x1)/2,(s.y0+s.y1)/2,[s.c,'#fff'],10,160,1,.5,10)}catch(_){}}}}
 function drawFx(c,cx,cy,now){const t=now/1000,op='source-over';c.save();
  // walls raised by monsters
  for(const s of SD){const k=s.rise,x=s.x0-cx,y1=s.y1-cy,hh=(s.y1-s.y0)*k,w=s.x1-s.x0;const gr=c.createLinearGradient(0,y1-hh,0,y1);gr.addColorStop(0,mix(s.c,1.2));gr.addColorStop(1,mix(s.c,.55));c.fillStyle=gr;c.fillRect(x,y1-hh,w,hh);c.strokeStyle='#0e0818';c.lineWidth=2.5;c.strokeRect(x,y1-hh,w,hh);c.strokeStyle=hexA('#ffffff',.25);c.lineWidth=1.5;for(let yy=y1-hh+14;yy<y1;yy+=22){c.beginPath();c.moveTo(x+3,yy);c.lineTo(x+w-3,yy);c.stroke()}}
  // ground left behind
  for(const q of GR){const a=Math.min(1,q.life/.5)*(q.tel>0?.4:1),x=q.x0-cx,w=q.x1-q.x0,y=q.y-cy;c.globalAlpha=a*.55;c.globalCompositeOperation='lighter';const gr=c.createLinearGradient(0,y-q.h,0,y);gr.addColorStop(0,hexA(q.c,0));gr.addColorStop(1,hexA(q.c,.85));c.fillStyle=gr;c.fillRect(x,y-q.h,w,q.h);c.globalCompositeOperation=op;c.globalAlpha=a;c.fillStyle=q.c;c.fillRect(x,y-3,w,3)}c.globalAlpha=1;
  // warnings: bright rim, filling shape. Every enemy attack in every dungeon looks like this, so you always know what to dodge
  for(const z of HZ){const w=z.x1-z.x0,hh=z.y1-z.y0,x=z.x0-cx,y=z.y0-cy;if(z.tel>0){const u=1-z.tel/z.tel0,pu=.5+.5*Math.sin(t*(10+u*16));if(z.circ){const X=z.cx-cx,Y=z.cy-cy;c.globalAlpha=.16+.14*u;c.fillStyle=z.c;c.beginPath();c.arc(X,Y,z.r*u,0,TAU);c.fill();c.globalAlpha=.6+.4*pu;c.strokeStyle='#fff';c.lineWidth=2;c.setLineDash([10,8]);c.lineDashOffset=-t*40;c.beginPath();c.arc(X,Y,z.r,0,TAU);c.stroke();c.setLineDash([]);c.strokeStyle=z.c;c.lineWidth=3;c.beginPath();c.arc(X,Y,z.r+3,0,TAU);c.stroke()}
    else{c.globalAlpha=.14+.2*u;c.fillStyle=z.c;const fh=z.kind=='down'?hh*u:hh*u;if(z.kind=='down')c.fillRect(x,y,w,fh);else c.fillRect(x,y+hh-fh,w,fh);c.globalAlpha=.55+.45*pu;c.strokeStyle='#fff';c.lineWidth=2;c.setLineDash([10,8]);c.lineDashOffset=-t*40;c.strokeRect(x,y,w,hh);c.setLineDash([]);c.strokeStyle=z.c;c.lineWidth=3;c.strokeRect(x-2,y-2,w+4,hh+4)}c.globalAlpha=1;continue}
   const u=Math.max(0,z.act/Math.max(.01,z.act0));c.globalCompositeOperation='lighter';if(z.kind=='slash'){const gr=c.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,hexA(z.c,0));gr.addColorStop(.5,hexA(z.c,.5*u));gr.addColorStop(1,hexA(z.c,0));c.fillStyle=gr;c.fillRect(x,y,w,hh);c.globalCompositeOperation=op;c.globalAlpha=1;continue}c.globalAlpha=.25+.6*u;if(z.circ){c.drawImage(glo(z.c),z.cx-cx-z.r*1.4,z.cy-cy-z.r*1.4,z.r*2.8,z.r*2.8);c.fillStyle='#fff';c.globalAlpha=.3*u;c.beginPath();c.arc(z.cx-cx,z.cy-cy,z.r*.7,0,TAU);c.fill()}else{const gr=c.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,hexA(z.c,0));gr.addColorStop(.5,hexA(z.c,1));gr.addColorStop(1,hexA(z.c,0));c.fillStyle=gr;c.fillRect(x,y,w,hh);c.globalAlpha=.8*u;c.fillStyle='#fff';c.fillRect(x+w*.35,y,w*.3,hh)}c.globalCompositeOperation=op;c.globalAlpha=1}
  // waves
  for(const v of WV){const x=v.x-cx,f=v.fy-cy;if(v.tel>0){c.globalAlpha=.4+.4*Math.sin(t*14);c.fillStyle=v.c;c.fillRect(x-T*.3,f-v.h,T*.6,v.h);c.globalAlpha=1;continue}c.globalCompositeOperation='lighter';c.fillStyle=hexA(v.c,.75);c.beginPath();c.moveTo(x-v.d*v.w,f);c.quadraticCurveTo(x-v.d*v.w*.4,f-v.h*.9,x+v.d*v.w*.2,f-v.h);c.quadraticCurveTo(x+v.d*v.w*.7,f-v.h*.6,x+v.d*v.w*.5,f);c.closePath();c.fill();c.globalCompositeOperation=op;c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(x-v.d*v.w*.4,f-v.h*.72);c.quadraticCurveTo(x,f-v.h*1.02,x+v.d*v.w*.5,f-v.h*.5);c.stroke()}
  // rings
  for(const q of RG){const x=q.x-cx,y=q.y-cy;c.globalCompositeOperation='lighter';c.strokeStyle=q.c;c.lineWidth=q.w;c.globalAlpha=.35;c.beginPath();c.arc(x,y,q.r,q.gap+q.gw/2,q.gap-q.gw/2+TAU);c.stroke();c.globalAlpha=1;c.lineWidth=3;c.strokeStyle='#fff';c.stroke();c.globalCompositeOperation=op}
  // wells
  for(const q of WL){const x=q.x-cx,y=q.y-cy,k=q.tel>0?.45:Math.min(1,q.life/.4+.2);c.globalAlpha=k;c.globalCompositeOperation='lighter';c.drawImage(glo(q.c),x-q.reach*.42,y-q.reach*.42,q.reach*.84,q.reach*.84);c.globalCompositeOperation=op;c.fillStyle='#000';c.beginPath();c.arc(x,y,q.r,0,TAU);c.fill();c.strokeStyle=mix(q.c,1.3);c.lineWidth=2.5;for(let i=0;i<3;i++){c.beginPath();c.ellipse(x,y,q.r*(1.6+i*.6),q.r*(.5+i*.2),t*(1.5+i*.4),0,4.4);c.stroke()}c.globalAlpha=1}
  // marks on you
  for(const q of MK){const x=q.x-cx,y=q.y-cy,u=q.t/q.t0,pu=.6+.4*Math.sin(t*(8+(1-u)*22));c.strokeStyle=q.c;c.lineWidth=3;c.globalAlpha=pu;c.setLineDash([12,8]);c.lineDashOffset=t*50;c.beginPath();c.arc(x,y,q.r,0,TAU);c.stroke();c.setLineDash([]);c.lineWidth=4;c.strokeStyle='#fff';c.beginPath();c.arc(x,y,q.r*.28,-Math.PI/2,-Math.PI/2+TAU*(1-u));c.stroke();c.globalAlpha=1}
  // beams
  for(const b of BM){const x=b.x-cx,y=b.y-cy,ex=x+Math.cos(b.a)*b.len,ey=y+Math.sin(b.a)*b.len;if(b.tel>0){const u=1-b.tel/b.tel0;c.globalAlpha=.35+.45*Math.abs(Math.sin(t*14));c.strokeStyle=b.c;c.lineWidth=2+b.w*.25*u;c.setLineDash([12,10]);c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();c.setLineDash([]);c.globalAlpha=1;continue}c.globalCompositeOperation='lighter';c.strokeStyle=b.c;c.globalAlpha=.3;c.lineWidth=b.w*1.8;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();c.globalAlpha=.9;c.lineWidth=b.w*.75;c.stroke();c.strokeStyle='#fff';c.lineWidth=b.w*.3;c.stroke();c.globalAlpha=1;c.globalCompositeOperation=op}
  // projectiles
  c.globalCompositeOperation='lighter';for(const q of PR){const x=q.x-cx,y=q.y-cy,r=q.r;c.drawImage(glo(q.c),x-r*2.2,y-r*2.2,r*4.4,r*4.4);if(q.kind=='shard'||q.kind=='arrow'){const a=Math.atan2(q.vy,q.vx);c.save();c.translate(x,y);c.rotate(a);c.fillStyle='#fff';c.beginPath();c.moveTo(r*1.6,0);c.lineTo(0,r*.45);c.lineTo(-r*1.9,0);c.lineTo(0,-r*.45);c.closePath();c.fill();c.restore()}else if(q.kind=='rock'){c.globalCompositeOperation=op;c.fillStyle=mix(q.c,.7);c.save();c.translate(x,y);c.rotate(q.a*5);c.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU,rr2=r*(i%2?.8:1.1);c.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2)}c.closePath();c.fill();c.strokeStyle='#0e0818';c.lineWidth=2;c.stroke();c.restore();c.globalCompositeOperation='lighter'}else{c.fillStyle='#fff';c.beginPath();c.arc(x,y,r*.5,0,TAU);c.fill()}}c.globalCompositeOperation=op;c.restore()}

 // ================= gadgets =================
 const groups={};
 function initG(g){g.t=0;if(g.k=='path')groups[g.grp]=groups[g.grp]||{on:0,t:0}}
 const standOn=(x,y,w)=>P.g&&Math.abs(P.y+P.h-y)<5&&P.x>x-P.w*.4&&P.x<x+w+P.w*.4;
 function resetGad(){for(const g of L.gad){if(g.k=='fall'){g.st=0;g.y=g.y0;g.vy=0;g.t=0}if(g.k=='bridge'){g.st=0;g.t=0;for(const s of g.segs){s.f=0;s.y=0;s.vy=0}}if(g.k=='seq'&&g.st!=3){g.st=0;g.i=0}}}
 // what the player can stand on this frame, filled while the gadgets tick
 const PL=[];
 function tickGad(dt,t){PL.length=0;DASHING();const lim=(g)=>g.rm&&(P.x<(g.rm.x0-30)*T||P.x>(g.rm.x1+30)*T);
  for(const k in groups){const q=groups[k];if(q.t>0){q.t-=dt;if(q.t<=0){q.on=0;tone(300,120,.3,'sine',.03)}}}
  for(const g of L.gad){if(lim(g))continue;g.t+=dt;switch(g.k){
   case'mover':{const s=(Math.sin((g.t/g.per+g.ph)*TAU)+1)/2,x=g.bx+g.dx*s,y=g.by+g.dy*s;const dx=g.x==null?0:x-g.x,dy=g.y==null?0:y-g.y;g.x=x;g.y=y;PL.push({x,y,w:g.w,dx,dy});break}
   case'vanish':{const per=g.on+g.off,u=((g.t+g.ph*per)%per);g.vis=u<g.on;g.warn=g.vis&&g.on-u<.55;if(g.vis)PL.push({x:g.x,y:g.y,w:g.w,dx:0,dy:0});break}
   case'rotor':{g.pts=g.pts||[];for(let i=0;i<g.n;i++){const a=(g.t/g.per+i/g.n)*TAU,x=g.cx+Math.cos(a)*g.r-g.w/2,y=g.cy+Math.sin(a)*g.r,o=g.pts[i],dx=o?x-o.x:0,dy=o?y-o.y:0;g.pts[i]={x,y};PL.push({x,y,w:g.w,dx,dy})}break}
   case'fall':{if(g.st==0&&standOn(g.x,g.y,g.w)){g.st=1;g.tt=g.delay;tone(120,60,.3,'sine',.04)}if(g.st==1){g.tt-=dt;if(g.tt<=0){g.st=2;g.vy=0;tone(90,40,.4,'sawtooth',.04)}}if(g.st==2){g.vy+=1500*dt;g.y+=g.vy*dt;if(g.y>g.y0+T*14){g.st=3;g.tt=2.2}}if(g.st==3){g.tt-=dt;if(g.tt<=0){g.st=0;g.y=g.y0;g.vy=0}}if(g.st<3)PL.push({x:g.x+(g.st==1?Math.sin(g.t*60)*1.5:0),y:g.y,w:g.w,dx:0,dy:g.st==2?g.vy*dt:0});break}
   case'bridge':{if(g.st==0&&standOn(g.x,g.y,g.n*g.sw)){g.st=1;g.tt=0;g.ni=0;tone(180,90,.5,'sawtooth',.03)}if(g.st==1){g.tt+=dt;while(g.ni<g.n&&g.tt>g.ni*g.iv+.25){g.segs[g.ni].f=1;g.ni++;tone(90,50,.2,'square',.02);shk(.03)}if(g.ni>=g.n&&g.tt>g.n*g.iv+5){g.st=0;for(const s of g.segs){s.f=0;s.y=0;s.vy=0}}}g.segs.forEach((s,i)=>{if(s.f){s.vy+=1500*dt;s.y+=s.vy*dt}else PL.push({x:g.x+i*g.sw,y:g.y,w:g.sw,dx:0,dy:0})});break}
   case'dashgate':{g.fl=Math.max(0,g.fl-dt*3);if(P.x+P.w/2>g.x-6&&P.x-P.w/2<g.x+6&&P.y+P.h>g.y0&&P.y<g.y1){if(DASHING()){if(g.fl<=0){g.fl=1;tone(900,1800,.2,'sine',.05);try{VFX.burst(g.x,P.y+P.h/2,[L.d.p.glow,'#fff'],16,260,1,.5,10)}catch(_){}}}else{P.x=g.x+(P.vx>0?-1:1)*(P.w/2+8);P.vx=(P.vx>0?-1:1)*420;P.vy=-160;if(g.fl<=0){g.fl=1;say('Dash through it! (Shift)');tone(180,90,.2,'square',.04)}}}break}
   case'blade':{const s=(Math.sin((g.t/g.per+g.ph)*TAU)+1)/2;g.x=g.bx+g.dx*s;g.y=g.by+g.dy*s;g.a+=dt*10;if(Math.hypot(P.x-g.x,P.y+P.h/2-g.y)<g.r+P.w*.32)hurtP(DG.mobDmg(run.d,'regular',.14,run.df),Math.sign(P.x-g.x||1)*340);break}
   case'jet':{const per=g.on+g.off,u=(g.t+g.ph*per)%per;g.fire=u<g.on;g.warn=!g.fire&&per-u<.55;if(g.fire&&Math.abs(P.x-g.x)<T*.55+P.w/2){const y0=g.dir<0?g.y-g.h:g.y,y1=g.dir<0?g.y:g.y+g.h;if(P.y+P.h>y0&&P.y<y1)hurtP(DG.mobDmg(run.d,'regular',.13,run.df),Math.sign(P.x-g.x||1)*260)}break}
   case'laser':{g.x=g.bx+g.dx*((Math.sin((g.t/g.per+g.ph)*TAU)+1)/2);if(Math.abs(P.x-g.x)<4+P.w/2&&P.y+P.h>g.y0&&P.y<g.y1&&!DASHING())hurtP(DG.mobDmg(run.d,'regular',.13,run.df),Math.sign(P.x-g.x||P.vx||1)*300);break}
   case'door':{const per=g.on+g.off,u=(g.t+g.ph*per)%per,open=u<g.on;g.o+=((open?1:0)-g.o)*Math.min(1,dt*9);g.warn=open&&g.on-u<.6;g.sol.on=g.o<.55?1:0;g.sol.y1=g.y+g.h*(1-g.o);break}
   case'plate':{const onit=standOn(g.x,g.y,g.w);if(onit&&!g.on){g.on=1;g.t2=.2;if(g.grp&&groups[g.grp]){groups[g.grp].on=1;groups[g.grp].t=g.dur||4.5;groups[g.grp].t0=g.dur||4.5}if(g.seq){const s=L.gad.find(q=>q.k=='seq'&&q.grp==g.seq);if(s&&s.st==0){s.st=1;s.i=0;s.tt=0}}tone(520,1040,.25,'sine',.05)}if(!onit&&g.on){g.t2-=dt;if(g.t2<=0)g.on=0}PL.push({x:g.x,y:g.y,w:g.w,dx:0,dy:0});break}
   case'path':{const q=groups[g.grp],vis=q&&q.on,warn=vis&&q.t<1.1;g.a+=((vis?1:0)-g.a)*Math.min(1,dt*10);g.warn=warn;if(vis)PL.push({x:g.x,y:g.y,w:g.w,dx:0,dy:0});break}
   case'seq':{for(const p of g.pads)PL.push({x:p.x,y:p.y,w:p.w,dx:0,dy:0});if(!g.order){const a=g.pads.map(p=>p.n);for(let i=a.length-1;i>0;i--){const j=(R()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}g.order=a}
     if(g.st==1){g.tt+=dt;const n=g.order.length;g.show=Math.floor(g.tt/.75);if(g.show>=n+1){g.st=2;g.i=0;say('Now step on them in that order')}}
     else if(g.st==2){for(const p of g.pads){if(standOn(p.x,p.y,p.w)){if(g.last===p.n)break;g.last=p.n;if(p.n==g.order[g.i]){g.i++;tone(500+g.i*140,900+g.i*140,.2,'sine',.05);if(g.i>=g.order.length){g.st=3;if(groups[g.grp]){groups[g.grp].on=1;groups[g.grp].t=1e9}tone(660,1320,.5,'triangle',.06);say('The way is open')}}else{g.st=1;g.tt=0;g.i=0;g.last=null;hurtP(DG.mobDmg(run.d,'regular',.08,run.df),null);tone(160,80,.4,'sawtooth',.06);say('Wrong crystal. Watch again')}break}}if(!P.g)g.last=g.last}break}
   case'grav':{const inz=P.x>g.x0&&P.x<g.x1;g.ph2=((g.t%g.per)/g.per);const mode=g.ph2<.5?g.lo:g.hi;g.cur=mode;g.warn=(g.ph2>.4&&g.ph2<.5)||g.ph2>.9;if(inz)P.dgGrav=mode;break}
   case'wind':{if(P.x>g.x0&&P.x<g.x1&&P.y+P.h>g.y0&&P.y<g.y1)P.vy=Math.max(P.vy+g.sp*dt,-520);break}
  }}
  if(L.keyAt&&!L.keyAt.got&&Math.hypot(P.x-L.keyAt.x,P.y+P.h/2-(L.keyAt.y-T))<T*1.3)gotKey();
  for(const c of L.checks)if(!c.on&&Math.abs(P.x-c.x)<T*1.1&&Math.abs(P.y+P.h-c.y)<T*1.6){for(const o of L.checks)o.cur=0;c.on=1;c.cur=1;run.check={x:c.x,y:c.y-P.h-2};tone(660,990,.25,'sine',.05);try{VFX.wave(c.x,c.y-20,L.d.p.glow,110,.6,.5)}catch(_){}DG.ui&&DG.ui.toast('Checkpoint');try{P.hp=Math.min(maxHP(),P.hp+maxHP()*.25)}catch(_){}}
  for(const p of L.pits)if(P.x>p.x0&&P.x<p.x1&&P.y+P.h>p.y-4&&!flyingNow()&&!(DG.duoInside&&DG.duoInside())){fell(p);break}}
 const flyingNow=()=>{try{return !!window.OWN_STEADY}catch(_){return false}};
 function gotKey(){const k=L.keyAt;k.got=true;const id=run.d.skey;if(cnt(id)<=0)addI(id,1);markFound(id);try{saveP()}catch(_){}run.gotKey=1;tone(660,1320,.6,'triangle',.07);tone(990,1760,.5,'sine',.05,.15);try{VFX.levelUp(P.x,P.y,run.d.p.glow)}catch(_){}DG.ui&&DG.ui.banner(DG.ITEMS[id].n,'The sealed gate will open for you');run.check={x:k.x,y:k.y-P.h-2};DG.flow.objective();if(DG.coop)DG.coop.key()}
 function markFound(id){const S=DG.S;if(!S.found[id]){S.found[id]=1;DG.save()}}DG.markFound=markFound;
 function fell(p){run.falls=(run.falls|0)+1;try{hurtF=.3}catch(_){}P.x=run.check.x;P.y=run.check.y;P.vx=P.vy=0;iT=Math.max(iT,1);resetGad();try{const a=Math.min(P.hp-1,maxHP()*.06);if(a>0&&!DG.god)P.hp-=a}catch(_){}tone(200,80,.35,'sine',.05);DG.ui&&DG.ui.toast('Back to the checkpoint');try{VFX.burst(P.x,P.y+P.h/2,[run.d.p.glow,'#fff'],18,220,1,.6,10)}catch(_){}}
 DG.resetGad=()=>resetGad();
 // ---- collision against what moves: land on top of platforms, ride them, and be stopped by doors and walls
 {const _m=moveE;moveE=function(e,dt){if(e!==P||!run)return _m.apply(this,arguments);const pf=P.y+P.h;_m.apply(this,arguments);if(dash>0)P.vy=0;
   for(const q of PL){if(P.x+P.w*.4<q.x||P.x-P.w*.4>q.x+q.w)continue;const f=P.y+P.h,top=q.y;if(P.vy>=-1&&pf<=top+Math.max(7,Math.abs(q.dy)+6)&&f>=top-Math.max(2,-q.dy)){P.y=top-P.h-.01;P.vy=0;P.g=true;P.x+=q.dx;P.dgPlat=q;break}}
   for(const s of L.solids){if(!s.on)continue;if(P.x+P.w/2>s.x0&&P.x-P.w/2<s.x1&&P.y+P.h>s.y0+2&&P.y<s.y1-2){if(pf<=s.y0+8&&P.vy>=0&&!s.gate&&s.temp){P.y=s.y0-P.h-.01;P.vy=0;P.g=true;continue}const cx=(s.x0+s.x1)/2,my=Math.floor((P.y+P.h/2)/T),lx=s.x0-P.w/2-.01,rx=s.x1+P.w/2+.01,free=(nx)=>!solidAt(Math.floor((nx-P.w/2)/T),my)&&!solidAt(Math.floor((nx+P.w/2)/T),my);let toR=P.x>=cx;if(toR&&!free(rx))toR=false;else if(!toR&&!free(lx))toR=true;const nx=toR?rx:lx;if(!free(nx)&&s.temp){P.y=s.y0-P.h-.01;P.vy=Math.min(P.vy,0)}else{P.x=nx;if(toR?P.vx<0:P.vx>0)P.vx=0}P.wall=1}}}}
 // ---- the moves every dungeon needs: wall jump, Shift dash, ice underfoot, shifting gravity. In a trial wings cannot fly or glide (the trial has to mean something), and only one air jump counts.
 let wallT=0,wallD=0,wallLock=0,dashCD=0;
 const inTrial=()=>!!(run&&run.room&&run.room.kind=='trial');
 {const _p=physics;physics=function(dt,ax,busy){if(!run)return _p.apply(this,arguments);
   if(wallLock>0){wallLock-=dt;ax=0}
   const pvx=P.vx,pvy=P.vy;if(P.wall&&!P.g&&Math.abs(P.vy)<900){wallT=.13;wallD=ax||wallD||(P.f||1)}else wallT-=dt;
   if(!busy&&!P.g&&wallT>0&&buf>0&&!P.sw){P.vy=-660;P.vx=-wallD*360;buf=0;wallT=0;wallLock=.15;P.f=-wallD;try{dustFx(5);snd(420,.1,'sine',.04,1.4)}catch(_){}}
   const trial=inTrial();const r=_p.apply(this,arguments);
   if(trial&&!flyingNow()){try{const F=FLY7.F;F.on=false;F.sta=0;WingArt.FL.on=false}catch(_){}if(P.vy>0&&P.vy>pvy-1e-3&&!P.g&&pvy>=0){const gv=1900*(Math.abs(pvy)<130?.55:1.2);P.vy=Math.min(1100,pvy+gv*dt)}try{P.jumps=Math.max(P.jumps,maxAir()-1)}catch(_){}}
   if(P.wall&&!P.g&&P.vy>130&&ax)P.vy=130;
   // ice: little grip, long slides
   const slip=P.dgSlip>0||(P.g&&(()=>{const b=tiles[Math.floor((P.y+P.h+2)/T)*W+Math.floor(P.x/T)];return b==ICE})());if(P.dgSlip>0)P.dgSlip-=dt;if(slip&&P.g){P.vx=ax?pvx+(P.vx-pvx)*.22:pvx*(1-1.1*dt)}
   if(P.dgGrav!=null&&P.dgGrav!==1){P.vy+=(P.dgGrav-1)*1900*dt}P.dgGrav=null;
   return r}}
 addEventListener('keydown',e=>{if(!run||e.key!='Shift'||e.repeat||DG.locked||window.STY1)return;try{if(dlgOpen||document.activeElement==chatEl)return}catch(_){}if(dashCD>0||dash>0)return;const ax=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0);dash=.2;dashDir=ax||P.f||1;dashCD=.7;iT=Math.max(iT,.24);tone(420,900,.14,'sine',.04);try{VFX.burst(P.x,P.y+P.h/2,[run.d.p.glow,'#fff'],6,120,1,.3,8)}catch(_){}});
 Object.defineProperty(DG,'dashCD',{get(){return dashCD}});

 // ================= drawing the gadgets and the room furniture =================
 function slab(c,x,y,w,cx,cy,al,warn){const d=L.d,X=x-cx,Y=y-cy;c.globalAlpha=al*(warn?.55+.45*Math.sin(performance.now()/55):1);const s=DG.sprite(ACC,3,3);if(s){const n=Math.max(1,Math.round(w/T)),u=w/n;for(let i=0;i<n;i++)c.drawImage(s,X+i*u,Y,u,T*.62)}else{c.fillStyle=d.p.rock;c.fillRect(X,Y,w,T*.62)}c.strokeStyle='#0e0818';c.lineWidth=2;c.strokeRect(X,Y,w,T*.62);c.globalCompositeOperation='lighter';c.fillStyle=hexA(d.p.glow,.8);c.fillRect(X+2,Y,w-4,2.5);c.globalCompositeOperation='source-over';c.globalAlpha=1}
 function drawGad(c,cx,cy,now){const t=now/1000,vw=cv.width/ZM,d=L.d,gl=d.p.glow;c.save();
  for(const g of L.gad){const x0=g.x==null?(g.bx==null?(g.cx==null?(g.x0||0):g.cx):g.bx):g.x;if(x0-cx<-T*14||x0-cx>vw+T*14)continue;switch(g.k){
   case'mover':if(g.x!=null)slab(c,g.x,g.y,g.w,cx,cy,1);break;
   case'vanish':if(g.vis)slab(c,g.x,g.y,g.w,cx,cy,1,g.warn);else{c.globalAlpha=.16;c.strokeStyle=gl;c.setLineDash([6,6]);c.strokeRect(g.x-cx,g.y-cy,g.w,T*.62);c.setLineDash([]);c.globalAlpha=1}break;
   case'rotor':if(g.pts){c.strokeStyle=hexA(gl,.35);c.lineWidth=2;c.beginPath();c.arc(g.cx-cx,g.cy-cy,g.r,0,TAU);c.stroke();c.globalCompositeOperation='lighter';c.drawImage(glo(gl),g.cx-cx-18,g.cy-cy-18,36,36);c.globalCompositeOperation='source-over';for(const p of g.pts)slab(c,p.x,p.y,g.w,cx,cy,1)}break;
   case'fall':if(g.st<3)slab(c,g.x+(g.st==1?Math.sin(t*60)*2:0),g.y,g.w,cx,cy,g.st==2?.8:1,g.st==1);break;
   case'bridge':g.segs.forEach((s,i)=>{if(s.y<T*16)slab(c,g.x+i*g.sw,g.y+s.y,g.sw-2,cx,cy,s.f?Math.max(0,1-s.y/(T*16)):1)});break;
   case'dashgate':{const X=g.x-cx,a=.55+.25*Math.sin(t*7)+g.fl*.4;c.globalCompositeOperation='lighter';c.fillStyle=hexA(gl,a*.4);c.fillRect(X-8,g.y0-cy,16,g.y1-g.y0);c.fillStyle=hexA('#ffffff',a);c.fillRect(X-1.5,g.y0-cy,3,g.y1-g.y0);c.strokeStyle=hexA(gl,a);c.lineWidth=2;for(let y=g.y0;y<g.y1;y+=24){const k=((y+t*80)%24);c.beginPath();c.moveTo(X-8,y-cy+k);c.lineTo(X,y-cy+k-8);c.lineTo(X+8,y-cy+k);c.stroke()}c.globalCompositeOperation='source-over';break}
   case'blade':{const X=g.x-cx,Y=g.y-cy;c.save();c.translate(X,Y);c.rotate(g.a);c.fillStyle='#d8dce8';c.strokeStyle='#0e0818';c.lineWidth=2;c.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU,a2=(i+.55)/8*TAU;c.lineTo(Math.cos(a)*g.r,Math.sin(a)*g.r);c.lineTo(Math.cos(a2)*g.r*.55,Math.sin(a2)*g.r*.55)}c.closePath();c.fill();c.stroke();c.fillStyle='#3a2a2a';c.beginPath();c.arc(0,0,g.r*.28,0,TAU);c.fill();c.stroke();c.restore();break}
   case'jet':{const X=g.x-cx,Y=g.y-cy,up=g.dir<0;c.fillStyle=mix(d.p.rock,.6);c.fillRect(X-T*.45,Y-(up?6:0),T*.9,6);if(g.warn){c.globalAlpha=.4+.4*Math.sin(t*30);c.fillStyle=gl;c.fillRect(X-T*.4,up?Y-g.h:Y,T*.8,g.h);c.globalAlpha=1}if(g.fire){c.globalCompositeOperation='lighter';const gr=c.createLinearGradient(0,Y,0,up?Y-g.h:Y+g.h);gr.addColorStop(0,'#fff');gr.addColorStop(.25,gl);gr.addColorStop(1,hexA(gl,0));c.fillStyle=gr;const f=Math.sin(t*38)*5;c.beginPath();c.moveTo(X-T*.42,Y);c.quadraticCurveTo(X-T*.6+f,Y+(up?-g.h*.5:g.h*.5),X+f,up?Y-g.h:Y+g.h);c.quadraticCurveTo(X+T*.6-f,Y+(up?-g.h*.5:g.h*.5),X+T*.42,Y);c.closePath();c.fill();c.globalCompositeOperation='source-over'}break}
   case'laser':{const X=g.x-cx;c.globalCompositeOperation='lighter';c.fillStyle=hexA(gl,.35);c.fillRect(X-7,g.y0-cy,14,g.y1-g.y0);c.fillStyle='#fff';c.fillRect(X-1.5,g.y0-cy,3,g.y1-g.y0);c.globalCompositeOperation='source-over';c.fillStyle='#22202a';c.fillRect(X-9,g.y0-cy-6,18,8);c.fillRect(X-9,g.y1-cy-2,18,8);break}
   case'door':{const X=g.x-cx,Y=g.y-cy,hh=g.h*(1-g.o);const gr=c.createLinearGradient(X,0,X+T*.6,0);gr.addColorStop(0,mix(d.p.rock,1.2));gr.addColorStop(1,mix(d.p.rock,.6));c.fillStyle=gr;c.fillRect(X,Y,T*.6,hh);c.strokeStyle='#0e0818';c.lineWidth=2;c.strokeRect(X,Y,T*.6,hh);c.fillStyle=g.warn?'#ff5a4a':gl;c.fillRect(X+T*.2,Y+hh-10,T*.2,6);break}
   case'plate':{const X=g.x-cx,Y=g.y-cy;slab(c,g.x,g.y,g.w,cx,cy,1);c.globalCompositeOperation='lighter';c.drawImage(glo(g.on?'#ffffff':gl),X+g.w/2-26,Y-26,52,52);c.globalCompositeOperation='source-over';break}
   case'path':if(g.a>.03)slab(c,g.x,g.y,g.w,cx,cy,g.a,g.warn);else{c.globalAlpha=.1;c.strokeStyle=gl;c.setLineDash([4,8]);c.strokeRect(g.x-cx,g.y-cy,g.w,T*.62);c.setLineDash([]);c.globalAlpha=1}break;
   case'seq':for(const p of g.pads){const lit=g.st==1&&g.order[g.show]===p.n||g.st==3,done=g.st==2&&g.order.indexOf(p.n)<g.i;slab(c,p.x,p.y,p.w,cx,cy,1);c.globalCompositeOperation='lighter';const col=lit?'#ffffff':done?'#7affd0':gl;c.globalAlpha=lit?1:done?.9:.35;c.drawImage(glo(col),p.x-cx+p.w/2-34,p.y-cy-34,68,68);c.globalAlpha=1;c.globalCompositeOperation='source-over'}break;
   case'grav':{const inz=P.x>g.x0&&P.x<g.x1;c.globalAlpha=inz?.16+(g.warn?.14*Math.sin(t*16):0):.06;c.fillStyle=g.cur<1?'#7aa8ff':'#ff7a5a';const Y0=g.rm.y0*T-cy,Y1=g.rm.fy*T+T*5-cy;c.fillRect(g.x0-cx,Y0,g.x1-g.x0,Y1-Y0);c.globalAlpha=inz?.7:.3;c.fillStyle='#fff';c.font='700 13px system-ui';c.textAlign='center';const dir=g.cur<1?'▲':'▼';for(let x=g.x0+T*2;x<g.x1;x+=T*5)for(let y=Y0+T;y<Y1;y+=T*5)c.fillText(dir,x-cx,y+((t*(g.cur<1?-30:60))%T));c.textAlign='left';c.globalAlpha=1;break}
   case'wind':{c.globalAlpha=.3;c.strokeStyle='#fff';c.lineWidth=1.4;for(let i=0;i<8;i++){const x=lerp(g.x0,g.x1,(i+.5)/8)-cx,yy=g.y1-cy-((t*280+i*53)%(g.y1-g.y0));c.beginPath();c.moveTo(x,yy);c.lineTo(x,yy-22);c.stroke()}c.globalAlpha=1;break}
  }}
  // pits: lava, frozen water, the void. Not attacks, so they never wear the warning rim
  for(const p of L.pits){const X0=Math.max(p.x0,cx-10),X1=Math.min(p.x1,cx+vw+10);if(X1<=X0)continue;const Y=p.y-cy;if(p.kind=='lava'){const gr=c.createLinearGradient(0,Y-T*.9,0,Y+T);gr.addColorStop(0,'rgba(255,120,30,0)');gr.addColorStop(.45,'#ff7a1e');gr.addColorStop(1,'#a01806');c.fillStyle=gr;c.fillRect(X0-cx,Y-T*.9,X1-X0,T*1.9);c.fillStyle='#ffe08a';c.beginPath();c.moveTo(X0-cx,Y-T*.1);for(let x=X0;x<=X1+24;x+=24)c.lineTo(x-cx,Y-T*.1+Math.sin(x*.04+t*2.4)*5);c.lineTo(X1-cx,Y);c.lineTo(X0-cx,Y);c.closePath();c.fill()}
    else if(p.kind=='water'){const gr=c.createLinearGradient(0,Y-T*.5,0,Y+T);gr.addColorStop(0,'rgba(150,230,255,.7)');gr.addColorStop(1,'#0a3a5a');c.fillStyle=gr;c.fillRect(X0-cx,Y-T*.5,X1-X0,T*1.5);c.strokeStyle='#dff8ff';c.lineWidth=2;c.beginPath();for(let x=X0;x<=X1;x+=24){const yy=Y-T*.5+Math.sin(x*.05+t*1.4)*2;x==X0?c.moveTo(x-cx,yy):c.lineTo(x-cx,yy)}c.stroke()}
    else if(p.kind=='spikes'){c.fillStyle=mix(d.p.rock,1.3);c.strokeStyle='#0e0818';c.lineWidth=1.5;for(let x=X0-(X0%T);x<X1;x+=T/2){c.beginPath();c.moveTo(x-cx,Y+4);c.lineTo(x-cx+T/4,Y-T*.8);c.lineTo(x-cx+T/2,Y+4);c.closePath();c.fill();c.stroke()}}
    else{const gr=c.createLinearGradient(0,Y-T*3,0,Y+T);gr.addColorStop(0,hexA(d.p.glow,0));gr.addColorStop(1,hexA(d.p.glow,.45));c.globalCompositeOperation='lighter';c.fillStyle=gr;c.fillRect(X0-cx,Y-T*3,X1-X0,T*4);c.globalCompositeOperation='source-over';c.fillStyle='#02010a';c.fillRect(X0-cx,Y-4,X1-X0,T*2)}}
  // checkpoints, the key, chests, gates, the way out
  for(const q of L.checks){const X=q.x-cx,Y=q.y-cy;if(X<-60||X>vw+60)continue;c.fillStyle=mix(d.p.rock,.8);c.strokeStyle='#0e0818';c.lineWidth=2;c.beginPath();c.moveTo(X-12,Y);c.lineTo(X-6,Y-30);c.lineTo(X+6,Y-30);c.lineTo(X+12,Y);c.closePath();c.fill();c.stroke();c.globalCompositeOperation='lighter';c.globalAlpha=q.on?1:.25;c.drawImage(glo(q.on?gl:'#8a8a9a'),X-22,Y-56,44,44);c.fillStyle=q.on?'#fff':'#9a9aa8';c.beginPath();c.moveTo(X,Y-44-Math.sin(t*2)*2);c.lineTo(X+6,Y-34);c.lineTo(X,Y-24);c.lineTo(X-6,Y-34);c.closePath();c.fill();c.globalAlpha=1;c.globalCompositeOperation='source-over'}
  if(L.keyAt&&!L.keyAt.got){const q=L.keyAt,X=q.x-cx,Y=q.y-cy-T*.9+Math.sin(t*2.2)*7;c.globalCompositeOperation='lighter';c.drawImage(glo(gl),X-46,Y-46,92,92);c.globalCompositeOperation='source-over';try{const ic=DG.iconImg(run.d.skey);if(ic&&ic.complete)c.drawImage(ic,X-24,Y-24,48,48)}catch(_){}}
  for(const q of L.chests){if(q.hid)continue;DG.art.chest(c,q,cx,cy,t)}
  for(const q of L.gates){if(q.open&&q.t>1.4)continue;const k=q.open?1-ez(q.t/1.3):1,X=q.x-cx,Y=q.y-cy;DG.art.gate(c,X,Y,q.h,k,d,t,q)}
  for(const q of L.rooms)if(q.doors)for(const s of q.doors){if(s.o>=1)continue;const hh=(s.y1-s.y0)*(1-s.o);c.fillStyle=mix(d.p.rock,.85);c.fillRect(s.x0-cx,s.y0-cy,s.x1-s.x0,hh);c.strokeStyle='#0e0818';c.lineWidth=2.5;c.strokeRect(s.x0-cx,s.y0-cy,s.x1-s.x0,hh);c.globalCompositeOperation='lighter';c.fillStyle=hexA(gl,.8);c.fillRect(s.x0-cx+2,s.y0-cy+hh-5,s.x1-s.x0-4,3);c.globalCompositeOperation='source-over'}
  for(const q of L.portals){const X=q.x-cx,Y=q.y-cy;if(X<-160||X>vw+160)continue;c.globalCompositeOperation='lighter';c.save();c.translate(X,Y-T*1.4);c.scale(.6,1);c.rotate(t*.6);c.drawImage(glo(gl),-T*1.6,-T*1.6,T*3.2,T*3.2);c.strokeStyle=gl;c.lineWidth=4;c.beginPath();c.arc(0,0,T*1.15,0,4.6);c.stroke();c.lineWidth=2;c.beginPath();c.arc(0,0,T*.8,2,6.4);c.stroke();c.restore();c.globalCompositeOperation='source-over'}
  c.restore()}
 function drawIllus(c,cx,cy){for(const q of L.illus){if(q.a==null)q.a=1;const inside=P.x>(q.x0-.5)*T&&P.x<(q.x1+1)*T&&P.y+P.h>q.y0*T&&P.y<q.y1*T;q.a+=((inside?0:1)-q.a)*.12;if(q.a<.02)continue;c.globalAlpha=q.a;for(let x=q.x0;x<q.x1;x++)for(let y=q.y0;y<q.y1;y++){const s=DG.sprite(BR,x,y);if(s)c.drawImage(s,x*T-cx,y*T-cy,T,T)}if(!q.seen&&inside){q.seen=1;DG.flow.foundSecret()}c.globalAlpha=1}}

 // ================= the cinematic camera: pans, tracking, zooms, focus changes and a clean return =================
 const Cam={on:false,keys:[],t:0,z0:null,track:null,bars:false,free:null};
 function barsEl(){let e=document.getElementById('dgbars');if(!e){e=document.createElement('div');e.id='dgbars';e.innerHTML='<i></i><i></i>';document.body.appendChild(e)}return e}
 const DGCAM={
  // shots: [{x,y,z,dur}] in world pixels. z is relative to the player's own zoom. Ends by itself unless hold is set
  play(shots,o={}){if(Cam.z0==null)Cam.z0=ZM;Cam.zr=null;Cam.on=true;Cam.keys=shots;Cam.i=0;Cam.t=0;Cam.from={x:cam.x+cv.width/ZM/2,y:cam.y+cv.height/ZM/2,z:ZM/Cam.z0};Cam.hold=!!o.hold;Cam.done=o.done||null;window.OWN_CAM=1;DG.locked=!!o.lock;if(o.bars!==false){Cam.bars=true;barsEl().classList.add('on')}},
  follow(fn){Cam.track=fn},
  zoomTo(z,dur){if(Cam.z0==null)Cam.z0=ZM;Cam.zf={from:ZM/(Cam.z0||ZM),to:z,t:0,dur:dur||1}},
  shake:shk,
  // the fixed frame for a boss arena: as much of the arena as fits, never closer than the player's own zoom
  frame(x0,x1,y0,y1){if(Cam.z0==null)Cam.z0=ZM;const sc=cv.height/Math.max(1,innerHeight),fz=Math.min(cv.width/(x1-x0+T),(cv.height-200*sc)/(y1-y0));Cam.arena={x0,x1,y0,y1,fz}},
  release(){Cam.on=false;Cam.keys=[];Cam.hold=false;Cam.track=null;DG.locked=false;window.OWN_CAM=0;window.CAMT=null;barsEl().classList.remove('on');Cam.bars=false;if(Cam.arena)return;if(Cam.z0&&ZM!==Cam.z0){const z0=Cam.z0;Cam.zr={from:ZM,to:z0,t:0,dur:.7}}},
  reset(){Cam.on=false;Cam.keys=[];Cam.track=null;Cam.arena=null;Cam.hold=false;Cam.zf=null;Cam.zr=null;DG.locked=false;window.OWN_CAM=0;window.CAMT=null;barsEl().classList.remove('on');if(Cam.z0&&ZM!==Cam.z0)setZ(Cam.z0);Cam.z0=null},
  get on(){return Cam.on},get arena(){return Cam.arena},set arena(v){Cam.arena=v}};
 DG.cam=DGCAM;
 function setZ(z){if(z===ZM)return;const k=ZM/z;ZM=z;try{mx*=k;my*=k}catch(_){}}
 function tickCam(dt){if(Cam.zr){Cam.zr.t+=dt;const u=ez(Cam.zr.t/Cam.zr.dur);setZ(lerp(Cam.zr.from,Cam.zr.to,u));if(u>=1){Cam.zr=null;if(!Cam.arena)Cam.z0=null}}
  if(Cam.on&&Cam.keys.length){const s=Cam.keys[Cam.i],u=ez(Cam.t/(s.dur||1)),f=Cam.from;const x=lerp(f.x,s.x,u),y=lerp(f.y,s.y,u),z=lerp(f.z,s.z||1,u);window.CAMT={x,y};setZ(Cam.z0*z);Cam.t+=dt;if(Cam.t>=(s.dur||1)+(s.hold||0)){Cam.from={x:s.x,y:s.y,z:s.z||1};Cam.i++;Cam.t=0;if(Cam.i>=Cam.keys.length){Cam.i=Cam.keys.length-1;if(!Cam.hold){const dn=Cam.done;DGCAM.release();if(dn)try{dn()}catch(e){console.error(e)}}else if(Cam.done){const dn=Cam.done;Cam.done=null;try{dn()}catch(e){console.error(e)}}}}}
  else if(Cam.on&&Cam.track){const q=Cam.track();if(q)window.CAMT={x:q.x,y:q.y}}
  else if(!Cam.on&&Cam.arena&&run&&run.room&&run.room.kind=='boss'){const A=Cam.arena,tz=Math.max(.7,Math.min(Cam.z0||ZM,Math.floor(A.fz*20)/20));if(ZM>tz){setZ(Math.max(tz,ZM-dt*.8))}const sc=cv.height/Math.max(1,innerHeight),vw=cv.width/ZM,vh=cv.height/ZM,hb=(125*sc)/ZM,ht=(85*sc)/ZM,ww=A.x1-A.x0,m=DG.boss&&DG.boss.act,tx=P.x*.62+(m?m.x:P.x)*.38;const x=ww<=vw?(A.x0+A.x1)/2:cl(tx,A.x0+vw/2,A.x1-vw/2);const yb=A.y1+hb-vh/2,yt=A.y0-ht+vh/2;const y=yt>=yb?yb:cl(P.y+P.h/2-vh*.08,yt,yb);window.CAMT={x,y};window.OWN_CAM=1}
  if(Cam.zf){Cam.zf.t+=dt;const u=ez(Cam.zf.t/Cam.zf.dur);setZ(Cam.z0*lerp(Cam.zf.from,Cam.zf.to,u));if(u>=1)Cam.zf=null}}

 // ================= ambient particles and light =================
 const AM=[];const AK={ruins:['dust','#cfe8c0'],crimson:['ember','#ff8a3a'],frozen:['snow','#eaf8ff'],hollow:['spore','#b070ff'],dragon:['ash','#c8b8a0'],abyss:['mote','#b89aff'],star:['ember','#ffd86a'],night:['mote','#a8c8ff'],king:['ash','#9a90b0'],eater:['ember','#ff3a4a']};
 function tickAmb(dt){if(!run)return;const cap=reduced()?22:90,k=AK[run.d.id]||AK.ruins,vw=cv.width/ZM,vh=cv.height/ZM;while(AM.length<cap){AM.push({x:cam.x+R()*vw,y:cam.y+R()*vh,z:rn(.4,1.2),p:R()*6,s:rn(1,2.6)})}for(const a of AM){a.p+=dt;if(k[0]=='snow'){a.y+=dt*(30+a.z*40);a.x+=dt*(Math.sin(a.p)*14-10)}else if(k[0]=='ember'){a.y-=dt*(30+a.z*50);a.x+=dt*Math.sin(a.p*2)*20}else if(k[0]=='ash'){a.y+=dt*(14+a.z*18);a.x+=dt*(26*a.z)}else{a.x+=dt*Math.cos(a.p*.7)*10;a.y+=dt*Math.sin(a.p)*10}if(a.x<cam.x-20)a.x+=vw+40;if(a.x>cam.x+vw+20)a.x-=vw+40;if(a.y<cam.y-20)a.y+=vh+40;if(a.y>cam.y+vh+20)a.y-=vh+40}}
 function drawAmb(c,cx,cy,now){const k=AK[run.d.id]||AK.ruins,t=now/1000;c.save();c.globalCompositeOperation=k[0]=='snow'||k[0]=='ash'?'source-over':'lighter';c.fillStyle=k[1];for(const a of AM){c.globalAlpha=k[0]=='ember'||k[0]=='mote'||k[0]=='spore'?.45+.45*Math.sin(a.p*3):.55;c.beginPath();c.arc(a.x-cx,a.y-cy,a.s*a.z,0,TAU);c.fill()}c.restore()}
 function drawLight(c,cx,cy,now,vw,vh){const t=now/1000,d=run.d;c.save();const dark=(d.tier=='abyssal'?.34:.24)*(run.lightK==null?1:run.lightK);if(dark>0){c.fillStyle=hexA(d.p.bg,dark);c.fillRect(0,0,vw,vh)}c.globalCompositeOperation='lighter';for(const l of L.lights){const X=l.x-cx,Y=l.y-cy;if(X<-l.r||X>vw+l.r||Y<-l.r||Y>vh+l.r)continue;c.globalAlpha=l.a*(.82+.18*Math.sin(t*1.6+l.ph));c.drawImage(glo(l.c),X-l.r,Y-l.r,l.r*2,l.r*2)}c.globalAlpha=.16;c.drawImage(glo('#ffffff'),P.x-cx-T*4,P.y+P.h/2-cy-T*4,T*8,T*8);c.globalAlpha=1;c.restore();
  // vignette
  const w=vw,h=vh;let v=drawLight.v;if(!v||v.width!==256){v=drawLight.v=document.createElement('canvas');v.width=v.height=256;const x=v.getContext('2d'),gr=x.createRadialGradient(128,128,70,128,128,180);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.62)');x.fillStyle=gr;x.fillRect(0,0,256,256)}c.drawImage(v,0,0,w,h)}

 // ================= keeping everything else out: no weather, no townsfolk, no building, nothing saved =================
 {const _g=gen;gen=function(){if(DG.loading){buildMap(DG.loading);return}return _g.apply(this,arguments)}}
 {const _sm=spawnMob;spawnMob=function(){if(run)return false;return _sm.apply(this,arguments)}}
 {const _dn=drawNPCs;drawNPCs=function(now){if(run)return;return _dn.apply(this,arguments)}}
 {const _pe=pushEdit;pushEdit=function(){if(run)return;return _pe.apply(this,arguments)}}
 {const _ba=breakAt;breakAt=function(){if(run)return false;return _ba.apply(this,arguments)}}
 {const _pa=placeAction;placeAction=function(){if(run){if(!placeAction.t||performance.now()-placeAction.t>1800){placeAction.t=performance.now();say('Nothing can be built in a dungeon')}return}return _pa.apply(this,arguments)}}
 {const _dp=drawPrecip;drawPrecip=function(){if(run)return;return _dp.apply(this,arguments)}}
 {const _da=drawAmbient;drawAmbient=function(){if(run)return;return _da.apply(this,arguments)}}
 {const _ds=drawSky;drawSky=function(w,hh,now){if(!run)return _ds.apply(this,arguments);try{DG.art.sky(run.d,w,hh,now);g.save();g.scale(ZM,ZM);DG.art.back(L,g,cam.x,cam.y,now);g.restore()}catch(e){if(!drawSky.e){drawSky.e=1;console.error('DG sky',e)}_ds.apply(this,arguments)}}}
 {const _dr=BOSS6.drawProj;BOSS6.drawProj=function(c,cx,cy){_dr.apply(this,arguments);if(!run||!L)return;try{const now=performance.now(),vw=cv.width/ZM,vh=cv.height/ZM;drawGad(c,cx,cy,now);DG.art.front&&DG.art.front(L,c,cx,cy,now);drawIllus(c,cx,cy);DG.clim&&DG.clim.back(c,cx,cy,now,vw,vh);drawFx(c,cx,cy,now);drawAmb(c,cx,cy,now);drawLight(c,cx,cy,now,vw,vh);DG.clim&&DG.clim.front(c,cx,cy,now,vw,vh);DG.boss&&DG.boss.draw&&DG.boss.draw(c,cx,cy,now);if(DG.coop)DG.coop.draw(c,cx,cy,now)}catch(e){if(!drawFx.e){drawFx.e=1;console.error('DG draw',e)}}}}
 // the world-boss guards, world events, biomes, drops and trades already step aside for the void; a dungeon asks for the same treatment
 DG.voidNow=()=>!!run;
 // ---- leaving by any other road (summoned, world changed): the run ends quietly
 {const _lw=loadWorld;loadWorld=function(n,e){if(run&&!DG.loading){const was=run;endRun(true)}return _lw.apply(this,arguments)}}
 // ---- E: what is in front of you
 {const _i=interact;interact=function(){if(run&&!dlgOpen&&!DG.locked){const a=nearby();if(a){a.go();return}return}return _i.apply(this,arguments)}}
 function nearby(){if(!L)return null;if(DG.coop&&DG.coop.on){const a=DG.coop.near();if(a)return a}for(const q of L.portals)if(Math.hypot(P.x-q.x,P.y+P.h-q.y)<T*2.2)return{t:'Leave the dungeon ('+DG.keyName('use')+')',go:()=>DG.ui.askLeave()};for(const q of L.gates)if(!q.open&&Math.abs(P.x-q.x)<T*2.2&&Math.abs(P.y+P.h-q.y)<T*3)return{t:q.key?(cnt(q.key)>0?'Open the sealed gate ('+DG.keyName('use')+')':'Sealed. It needs the '+DG.ITEMS[q.key].n):'Open ('+DG.keyName('use')+')',go:()=>tryGate(q)};for(const q of L.chests)if(!q.open&&!q.hid&&Math.hypot(P.x-q.x,P.y+P.h-q.y)<T*2)return{t:'Open the chest ('+DG.keyName('use')+')',go:()=>DG.rew.open(q)};return null}
 function tryGate(q){if(DG.coop&&DG.coop.gateBlock(q))return;if(q.key&&cnt(q.key)<=0&&!DG.unlockAll&&!(DG.coop&&DG.coop.C&&DG.coop.C.quiet)){say('You need the '+DG.ITEMS[q.key].n+'. It waits at the end of the trial');try{UIS.play('error')}catch(_){}return}q.open=true;q.t=0;q.sol.on=0;tone(60,30,1.4,'sawtooth',.08);tone(140,220,1,'sine',.04,.2);shk(.25);DG.ui&&DG.ui.banner('The gate opens','');DG.flow.objective();if(DG.coop)DG.coop.gate(q)}
 // ---- saving a run's place in the world you came from
 function currentRet(){return{w:cur,x:P.x,y:P.y,net:(()=>{try{return !!NET7.world}catch(_){return false}})()}}
 let RET=null;
 function enter(id,di,o={}){const d=DG.BY[id];if(!d)return false;di=di||DG.diffsOf(d)[0];if(run){say('You are already in a dungeon');return false}if(!entered)return false;
  if(!o.force){const why=DG.lockReason(id);if(why){say(why);return false}if(!DG.diffOpen(d,di)){say('Finish the difficulty before this one first');return false}}
  try{if(BOSS6.active()||WBOSS13.fight){say('Finish the fight you are in first');return false}}catch(_){}
  const go=()=>beginRun(d,di,o);
  // the first time plays the full film; later on you can replay it from the dungeon's page
  if(o.skipCine||DG.S.opt.auto&&DG.S.seen[id]){go();return true}
  const seen=!!DG.S.seen[id];
  if(DG.cine&&DG.cine.has(id)){DG.cine.play(id,{skip:seen,done(){DG.S.seen[id]=1;DG.save();go()}});return true}go();return true}
 function beginRun(d,di,o){RET=currentRet();try{DG.ui&&DG.ui.closeAll()}catch(_){}const df=DG.DIFF[di]||DG.DIFF.normal;
  fx.clear();for(const k in groups)delete groups[k];AM.length=0;
  DG.loading=d;try{leaveNet()}catch(_){}try{DG.preRun=true;run={d,df,id:d.id,t0:0,check:null,dealt:0,taken:0,hits:0,kills:0,elites:0,bosses:0,deaths:0,rev:df.revives,mats:{},rare:[],room:null,gotKey:0,sec:0,obj:'',started:performance.now(),paused:0,corr:0};
    loadWorld('dg_'+d.id,{})}finally{DG.loading=null;DG.preRun=false}
  try{if(cnt(d.skey)>0)run.hadKey=1}catch(_){}
  const B=L;run.check={x:B.spawn.x,y:B.spawn.y};P.x=B.spawn.x;P.y=B.spawn.y-P.h;P.vx=P.vy=0;P.hp=maxHP();
  document.body.classList.add('dgon');
  const vw=cv.width/ZM,vh=cv.height/ZM;cam.x=cl(P.x-vw/2,0,W*T-vw);cam.y=cl(P.y-vh/2,-200,H*T-vh);
  // doors of the fight rooms: stand in the passages either side
  for(const r of L.rooms)if(r.kind=='fight'||r.kind=='boss'){r.doors=[{x0:(r.x0-.6)*T,x1:(r.x0+.2)*T,y0:(r.fy-5)*T,y1:r.fy*T,on:0,o:1,temp0:1},{x0:(r.x1-.2)*T,x1:(r.x1+.6)*T,y0:(r.fy-5)*T,y1:r.fy*T,on:r.kind=='fight'?1:0,o:r.kind=='fight'?0:1}];if(r.kind=='boss')r.doors.pop();for(const s of r.doors)L.solids.push(s)}
  run.t0=performance.now();DG.flow.begin();DG.music&&DG.music.enter(d);DG.ui&&DG.ui.runOn(run);say('');if(DG.coop)DG.coop.begun();return true}
 function endRun(quiet){if(DG.coop)DG.coop.ended();const r=run;run=null;L=null;B0=null;fx.clear();DGCAM.reset();PL.length=0;AM.length=0;document.body.classList.remove('dgon');try{DG.boss&&DG.boss.stop()}catch(_){}try{DG.mobs&&DG.mobs.clear()}catch(_){}try{DG.ui&&DG.ui.runOff()}catch(_){}try{DG.music&&DG.music.leave()}catch(_){}flushArt();mobs.length=0;P.dgGrav=null;P.dgSlip=0;window.OWN_CAM=0;window.CAMT=null;try{iT=Math.max(iT,1)}catch(_){}return r}
 // leave: back to where you came from
 function leave(){if(!run)return;if(DG.coop)DG.coop.left();endRun();const ret=RET;RET=null;try{P.hp=maxHP()}catch(_){}const w=ret?ret.w:'plaza';try{enterWorld(w)}catch(e){console.error('DG leave',e);try{loadWorld('plaza')}catch(_){}}
  if(ret){let n=0;const tryPos=()=>{if(++n>40)return;if(cur===w&&entered&&!isDGW(cur)){P.x=ret.x;P.y=ret.y;P.vx=P.vy=0;return}setTimeout(tryPos,150)};tryPos()}}
 // what ticks: wrapped around the monster update so the game's own knock-out rule never sees a dungeon death
 {const _um=updMobs;updMobs=function(dt){if(!run||!L)return _um.apply(this,arguments);
   // the game's own monster loop must not move our monsters
   const keep=[];for(let i=mobs.length-1;i>=0;i--)if(mobs[i].dgx){keep.push(mobs[i]);mobs.splice(i,1)}_um.apply(this,arguments);for(let i=keep.length-1;i>=0;i--)mobs.push(keep[i]);
   const now=performance.now()/1000;dashCD-=dt;if(!flyingNow()&&!DG.locked){const tx=Math.floor(P.x/T),my=Math.floor((P.y+P.h*.5)/T),inRock=solidAt(tx,my)&&solidAt(tx,my-1);if(P.g&&!inRock&&Number.isFinite(P.x)&&Number.isFinite(P.y))run.safe={x:P.x,y:P.y};if(inRock||!Number.isFinite(P.y)||!Number.isFinite(P.x)||P.y<T*3){const q=run.safe||run.check;P.x=q.x;P.y=q.y;P.vx=P.vy=0;run.unstuck=(run.unstuck|0)+1}}try{tickGad(dt,now);tickFx(dt);tickAmb(dt);tickCam(dt);if(DG.coop)DG.coop.tick(dt);DG.mobs&&DG.mobs.tick(dt);DG.boss&&DG.boss.tick(dt);DG.clim&&DG.clim.tick(dt);DG.flow.tick(dt);for(const q of L.gates)if(q.open)q.t+=dt;for(const r of L.rooms)if(r.doors)for(const s of r.doors){const want=s.on?0:1;s.o+=(want-s.o)*Math.min(1,dt*7)}}catch(e){if(!updMobs.e){updMobs.e=1;console.error('DG tick',e)}}
   if(P.hp<=0&&run)DG.flow.died();}}
 // ---- a safety net: never left inside rock (a stray teleport, the old respawn button), never stuck with a dead run
 setInterval(()=>{try{if(!run||!L||flyingNow()||DG.locked)return;const tx=Math.floor(P.x/T),ty=Math.floor((P.y+P.h/2)/T);if(solidAt(tx,ty)&&solidAt(tx,ty-1)&&solidAt(tx,ty+1)){P.x=run.check.x;P.y=run.check.y;P.vx=P.vy=0;say('Back to the checkpoint')}}catch(_){}},900);
 setInterval(()=>{try{if(run&&!DG.locked){const pr=document.getElementById('prompt');const a=nearby();if(pr){if(a&&menuEl.style.display=='none'){pr.style.display='block';if(pr.textContent!=a.t)pr.textContent=a.t}else if(pr.dataset.dg){pr.style.display='none'}pr.dataset.dg=a?'1':''}}}catch(_){}},150);
 Object.assign(DG,{enter,leave,beginRun,endRun,currentRet,hurtP,nearby,tryGate,setZ,PL,get RET(){return RET},groups,TAU,rn,cl,lerp,ez,eo,R,gotKey});
})()}catch(e){console.error('DG world',e)}
