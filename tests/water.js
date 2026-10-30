// Smooth flowing water (71-zz-water.js WATER9) + summer decor and seats at the water (92-zz-summer.js SUMMER9): water draws without
// errors in several worlds, the surface moves over time, a lake has no grid seams between tiles, waterfalls are found and drawn with a
// splash, swimming in / out leaves ripples, every world gets deterministic summer decor + seats beside its pools (not stacked, not inside
// blocks, floaties on the water, only the pond in the Plaza), E sits down / movement or E stands up (also on the dock and on the placeable
// Sun Lounger object), the summer objects are in the store, fishing still finds and casts into the water, no page errors.
// node tests/water.js   (RB_SHOTS=<dir> saves screenshots)
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',SHOTS=process.env.RB_SHOTS||'';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:1366,height:768}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
 p.on('console',m=>{if(m.type()=='error')errs.push('console: '+m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=20;window.clock=()=>.03});await p.waitForTimeout(300);
 const E=(f,a)=>p.evaluate(f,a),wait=ms=>p.waitForTimeout(ms),shot=async n=>{if(SHOTS)await p.screenshot({path:path.join(SHOTS,'water_'+n+'.png')})};
 const look=()=>E(()=>{const vw=cv.width/ZM,vh=cv.height/ZM,tx=P.x,ty=P.y+P.h/2;cam.x=Math.max(0,Math.min(W*T-vw,tx-vw/2));cam.y=Math.max(-200,Math.min(H*T-vh,ty-vh/2))});
 // ---- water draws in several worlds, the surface is linked into bodies and moves
 const worlds=['summer','lakes','beach','oasis'],wres={};
 for(const wn of worlds){await E(n=>{enterWorld(n)},wn);await wait(500);
  wres[wn]=await E(async()=>{WX6.force='clear';mobs.length=0;const pl=SUMMER9.POOLS.slice().sort((a,b)=>b.w-a.w)[0];if(!pl)return{pools:0};P.x=((pl.xa+pl.xb)/2)*T;P.y=(pl.r-6)*T;P.vx=P.vy=0;
   await new Promise(r=>setTimeout(r,350));return{pools:SUMMER9.POOLS.length,drawn:WATER9.stats.pools,surf:WATER9.stats.surf,segs:WATER9.stats.segs,ms:+WATER9.stats.ms.toFixed(2)}})}
 ok('water draws as linked bodies in '+worlds.length+' worlds',worlds.every(w=>wres[w].pools>0&&wres[w].drawn>0&&wres[w].surf>0&&wres[w].segs>0),wres);
 ok('water drawing stays cheap (< 4 ms per frame headless)',worlds.every(w=>wres[w].ms<4),worlds.map(w=>wres[w].ms));
 const wv=await E(()=>{const h=WATER9.hgt,a=[0,1,2,3].map(i=>h(500+i*37,10,0)),b2=[0,1,2,3].map(i=>h(500+i*37,10.4,0));return{a,b:b2,diff:a.some((v,i)=>Math.abs(v-b2[i])>.05),cont:Math.abs(h(500,10,0)-h(501,10,0))<.3}});
 ok('the surface wave changes over time and is continuous in x',wv.diff&&wv.cont,wv);
 // a big flat lake in view: pixels near the surface change between frames; deep rows have no seams at tile edges
 await E(()=>{enterWorld('waterlab')});await wait(400);
 const lake=await E(()=>{WX6.force='clear';mobs.length=0;trees.clear();const px=80,gy=sh(px);for(let x=px-34;x<=px+30;x++){for(let y=gy-12;y<gy+14;y++){const k=y*W+x;tiles[k]=0;wl[k]=y>=gy-1&&x>=px-30?8:0}tiles[(gy+14)*W+x]=3}
  for(const x of[px-31,px+31])for(let y=gy-1;y<gy+14;y++)tiles[y*W+x]=3;for(let x=px-34;x<px-31;x++)for(let y=gy-1;y<gy+14;y++)tiles[y*W+x]=3;P.x=(px-33)*T;P.y=(gy-2)*T-P.h-1;P.vx=P.vy=0;
  if(!window.__pinW){const u=update;update=function(dt){const r=u.apply(this,arguments);if(window.__pin){P.x=__pin.x;P.y=__pin.y;P.vx=P.vy=0}return r};window.__pinW=1}window.__pin={x:(px+8)*T,y:(gy+3)*T};return{px,gy}});// the camera follows the pinned player
 await wait(400);await look();await wait(150);
 const pix=await E(async o=>{const m=g.getTransform(),toS=(wx,wy)=>[Math.round((wx-cam.x)*ZM),Math.round((wy-cam.y)*ZM)];const ctx=cv.getContext('2d');
  const col=()=>{const[sx,sy]=toS(o.px*T+T/2,(o.gy-1)*T);return Array.from(ctx.getImageData(sx,sy-10,1,24).data)};const a=col();await new Promise(r=>setTimeout(r,450));const c2=col();let d=0;for(let i=0;i<a.length;i++)d+=Math.abs(a[i]-c2[i]);
  // deep row: compare each tile edge with the pixels 3 px either side (old tile-by-tile water drew darker 1 px lines on every edge)
  const[,ry]=toS(0,(o.gy+7.5)*T),[x0]=toS((o.px-12)*T,0),[x1]=toS((o.px+12)*T,0),row=ctx.getImageData(x0,ry,x1-x0,1).data;let bad=0,n=0;
  for(let x=o.px-11;x<=o.px+11;x++){const[ex]=toS(x*T,0),i=(ex-x0)*4,l=i-12,r=i+12;if(l<0||r+2>=row.length)continue;n++;const lum=j=>row[j]*.3+row[j+1]*.59+row[j+2]*.11,e=lum(i),avg=(lum(l)+lum(r))/2;if(Math.abs(e-avg)>6)bad++}
  return{moved:d,bad,n}},lake);
 ok("the lake surface moves between frames",pix.moved>60,pix.moved);
 ok('no grid seams at tile edges inside a lake',pix.n>15&&pix.bad<=Math.ceil(pix.n*.1),pix);
 await shot('lake');
 const qs=await E(async()=>{const o={};for(const q of['potato','med','ultra','high']){QM.apply(q,true);window.clock=()=>q=='ultra'?.5:.03;await new Promise(r=>setTimeout(r,220));o[q]=WATER9.stats.surf}window.clock=()=>.03;return o});
 ok('water draws on every quality preset and at night',Object.values(qs).every(v=>v>0),qs);
 // ---- waterfall: a ledge of water over air (kept topped up) falling into a pool
 const fall=await E(async o=>{const{px,gy}=o;for(let x=px-6;x<=px+3;x++){tiles[(gy-6)*W+x]=3;for(let y=gy-9;y<gy-6;y++){tiles[y*W+x]=0;wl[y*W+x]=0}}tiles[(gy-7)*W+px-7]=3;tiles[(gy-8)*W+px-7]=3;
  window.__src=setInterval(()=>{for(let x=px-6;x<=px+1;x++){wl[(gy-7)*W+x]=8}},50);window.__pin={x:(px+4)*T,y:(gy+1)*T};await new Promise(r=>setTimeout(r,1500));
  return{streams:WATER9.stats.streams,splash:WATER9.stats.splash,imp:WATER9.IMP.length}},lake);
 await look();await wait(120);await shot('fall');
 ok('waterfalls are detected and drawn with a splash + surface impact',fall.streams>0&&fall.splash>0&&fall.imp>0,fall);
 await E(()=>{clearInterval(window.__src);window.__pin=null});
 // ---- ripples when the player drops into the water and climbs out
 const rip=await E(async o=>{WATER9.RIP.length=0;P.x=(o.px+8)*T;P.y=(o.gy-4)*T;P.vx=0;P.vy=600;await new Promise(r=>setTimeout(r,600));const a=WATER9.RIP.length;P.y=(o.gy-3)*T;P.vy=-700;await new Promise(r=>setTimeout(r,500));return{inn:a,all:WATER9.RIP.length}},lake);
 ok('jumping into / out of the water leaves surface ripples',rip.inn>0&&rip.all>=rip.inn,rip);
 // ---- summer decor: deterministic, beside the water, not stacked, not inside blocks, floaties on water
 const deco={};for(const wn of worlds){await E(n=>enterWorld(n),wn);await wait(300);deco[wn]=await E(()=>{const L=SUMMER9.LAND,F=SUMMER9.FLOAT,P2=SUMMER9.POOLS,cols=new Map();let over=0,inside=0,far=0,dry=0;
   for(const it of L){if(!SUMMER9.ok(it))inside++;if(!P2.some(pl=>it.c0>=pl.xa-9&&it.c1<=pl.xb+9))far++;if(it.k=='dock')continue;for(let c=it.c0;c<=it.c1;c++){if(cols.has(c))over++;cols.set(c,it.k)}}
   for(const f of F)if(WATER9.surfAt(f.x0,(f.r-2)*T)==null)dry++;
   return{sig:JSON.stringify([L.map(i=>[i.k,i.c0,i.c1,i.gy,i.f,i.v]),F.map(f=>[f.k,f.x0,f.r])]),n:L.length,fl:F.length,seats:SUMMER9.SEATS.length,kinds:[...new Set(L.map(i=>i.k).concat(F.map(f=>f.k)))],over,inside,far,dry}})}
 const again=await E(async()=>{enterWorld('lakes');await new Promise(r=>setTimeout(r,300));return JSON.stringify([SUMMER9.LAND.map(i=>[i.k,i.c0,i.c1,i.gy,i.f,i.v]),SUMMER9.FLOAT.map(f=>[f.k,f.x0,f.r])])});
 ok('every world gets summer decor, seats and floaties at its pools',worlds.every(w=>deco[w].n>=3&&deco[w].fl>=2&&deco[w].seats>=2),worlds.map(w=>w+':'+deco[w].n+'/'+deco[w].fl+'/'+deco[w].seats));
 const kinds=new Set(worlds.flatMap(w=>deco[w].kinds));
 ok('umbrellas, loungers, deck chairs / benches, sandcastles, beach balls, rings, duck rings, air mattresses and docks all appear',['umbrella','lounger','chair','bench','castle','ball','ring','duck','lilo','dock'].every(k=>kinds.has(k)),[...kinds]);
 ok('decor is deterministic per world (same layout on reload)',again==deco.lakes.sig);
 ok('decor never stacks, never sits inside blocks and stays beside the water',worlds.every(w=>!deco[w].over&&!deco[w].inside&&!deco[w].far),worlds.map(w=>[deco[w].over,deco[w].inside,deco[w].far]));
 ok('floaties start on water',worlds.every(w=>!deco[w].dry),worlds.map(w=>deco[w].dry));
 // a block placed into a decor spot hides that item
 const hide=await E(()=>{const it=SUMMER9.LAND.find(i=>i.k=='lounger'||i.k=='chair');if(!it)return null;const k=(it.gy/T-1)*W+it.c0,a=SUMMER9.ok(it);tiles[k]=1;const b2=SUMMER9.ok(it);tiles[k]=0;return{a,b:b2,c:SUMMER9.ok(it)}});
 ok('a block built into a decor spot hides it (and it comes back)',hide&&hide.a&&!hide.b&&hide.c,hide);
 // ---- sitting: E near a lounger sits (pose + locked position), a movement key stands up
 const s1=await E(async()=>{const s=SUMMER9.SEATS.find(s=>s.n=='Sun Lounger')||SUMMER9.SEATS.find(s=>!s.dock);P.x=s.ex+20;P.y=s.ey-P.h-1;P.vx=P.vy=0;await new Promise(r=>setTimeout(r,250));const pr=document.getElementById('prompt').textContent;
  return{n:s.n,pr,sx:s.sx,fy:s.fy}});
 ok('standing by a seat shows "Press E to sit"',/Press E to sit on the/.test(s1.pr),s1.pr);
 await p.keyboard.press('e');await wait(350);
 const s2=await E(o=>({sit:!!SUMMER9.SIT,n:SUMMER9.SIT&&SUMMER9.SIT.n,pose:AC6.SIT(),x:P.x,feet:P.y+P.h,vy:P.vy,g:P.g,pr:document.getElementById('prompt').textContent,ox:o.sx,of:o.fy}),s1);
 ok('E sits down: the player is locked on the seat in the sitting pose',s2.sit&&Math.abs(s2.x-s2.ox)<.5&&Math.abs(s2.feet-s2.of)<.5&&s2.vy==0&&s2.g&&s2.pose&&s2.pose.h>10,s2);
 ok('the lounger reclines',s2.n!='Sun Lounger'||s2.pose.lean>.3,s2.pose);
 await look();await wait(100);await shot('sit');
 await p.keyboard.down('d');await wait(160);const s3=await E(()=>({sit:!!SUMMER9.SIT,pose:AC6.SIT()}));await p.keyboard.up('d');
 ok('a movement key stands up',!s3.sit&&!s3.pose,s3);
 await E(()=>{P.vx=0});await wait(200);
 const s4=await E(async()=>{const s=SUMMER9.SEATS.find(s=>!s.dock);P.x=s.ex;P.y=s.ey-P.h-1;P.vx=P.vy=0;await new Promise(r=>setTimeout(r,150));interact();const a=!!SUMMER9.SIT;interact();return{a,b:!!SUMMER9.SIT}});
 ok('E toggles: sit, then stand',s4.a&&!s4.b,s4);
 // dock: sit from the bank, dangle over the water, stand back onto the bank
 const dk=await E(async()=>{for(const w of['oasis','lakes','beach','summer','pool','isle','bay']){enterWorld(w);await new Promise(r=>setTimeout(r,250));const s=SUMMER9.SEATS.find(s=>s.dock);if(!s)continue;
   P.x=s.ex;P.y=s.ey-P.h-1;P.vx=P.vy=0;await new Promise(r=>setTimeout(r,150));interact();await new Promise(r=>setTimeout(r,300));let ow=false;for(let y=Math.floor(s.fy/T);y<=Math.floor(s.fy/T)+2;y++)if(wl[y*W+Math.floor(s.sx/T)]>0)ow=true;const o={w,sit:!!SUMMER9.SIT,x:P.x,sx:s.sx,overWater:ow};
   SUMMER9.stand();await new Promise(r=>setTimeout(r,100));o.back=Math.abs(P.x-s.ex)<1;return o}return null});
 ok('the dock seat: sit from the bank (over the water) and stand back onto the bank',dk&&dk.sit&&Math.abs(dk.x-dk.sx)<.5&&dk.overWater&&dk.back,dk);
 // ---- placeable summer objects: in the store, buying adds the item, a placed Sun Lounger can be sat on
 const st=await E(async()=>{const ids=['obj_90','obj_91','obj_92','obj_97','obj_98'],items=ids.map(i=>SHOP7.items.find(x=>x.id==i)).filter(Boolean);gems=100000;const c0=cnt(91);const r=await SHOP7.buy('obj_91');
  const px=Math.floor(P.x/T)+1,py=Math.floor((P.y+P.h)/T)-1,k=py*W+px;tiles[k]=90;try{pushEdit(k)}catch(_){}OBJ6.sync(k);P.x=px*T+T/2-6;P.vx=P.vy=0;await new Promise(r=>setTimeout(r,150));
  const n=OBJ6.near(),pr=OBJ6.promptText(null);interact();const o={n:items.length,cats:items.map(i=>i.cat),bought:r&&r.ok,got:cnt(91)-c0,obj:n&&n.o.t,pr,sit:SUMMER9.SIT&&SUMMER9.SIT.n,icon:!!objIcon(90)};SUMMER9.stand();return o});
 ok('the 5 summer objects are in the store and buying one gives the item',st.n==5&&st.cats.every(c=>c=='objects')&&st.bought&&st.got==1,st);
 ok('a placed Sun Lounger object can be sat on',st.obj==90&&/Sun Lounger/.test(st.pr)&&st.sit=='Sun Lounger'&&st.icon,st);
 // ---- Plaza: only the pond gets decor (a ring + a deck chair on the pier)
 const pz=await E(async()=>{enterWorld('plaza');await new Promise(r=>setTimeout(r,500));return{land:SUMMER9.LAND.map(i=>i.k+'@'+i.c0),fl:SUMMER9.FLOAT.map(f=>f.k+'@'+(f.x0/T|0)),pier:SUMMER9.LAND.every(i=>tiles[(i.gy/T)*W+i.c0]==47)}});
 ok('Plaza: decor only at the pond (deck chair on the pier, a swim ring)',pz.land.length>=1&&pz.land.length<=2&&pz.pier&&pz.fl.length==1&&SUMMER9_ok(pz),pz);
 function SUMMER9_ok(o){return o.land.every(s=>+s.split('@')[1]<20)&&o.fl.every(s=>+s.split('@')[1]<20)}
 // ---- fishing still finds the water and casts into it
 const fish=await E(async()=>{enterWorld('lakes');await new Promise(r=>setTimeout(r,400));const pl=SUMMER9.POOLS.slice().sort((a,b)=>b.w-a.w)[0],F=TOOLS8.FISH;mobs.length=0;
  P.x=(pl.xa-1)*T+T/2;P.y=pl.r*T-P.h-T;P.vx=P.vy=0;await new Promise(r=>setTimeout(r,300));TOOLLV.set('bubbles',1,0);HOTBAR.pick(HOTBAR.slotOf('w:bubbles'),true);wp='bubbles';F.S.st='idle';
  const tx=(pl.xa+2.5)*T,ty=(pl.r+.5)*T,k=F.waterAt(tx,ty);F.click({x:tx,y:ty});const t0=performance.now();while(F.S.st=='cast'&&performance.now()-t0<4000)await new Promise(r=>setTimeout(r,30));return{k,st:F.S.st}});
 ok('fishing still finds the water (waterAt) and the cast lands in it',fish.k>=0&&fish.st=='wait',fish);
 ok('no page errors',errs.length==0,errs.slice(0,4));
 console.log(fails?fails+' FAILED':'all water tests passed');await b.close();process.exit(fails?1:0)})().catch(e=>{console.error(e);process.exit(1)});
