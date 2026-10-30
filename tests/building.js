// House building + new world generation: the new blocks (78-92) place / break with the right tool and render; background walls sit behind
// blocks, are walk-through, save / load and break; house doors open when you walk up, let you through, close behind you, save / load and
// stop monsters; a NEW world gets 1-3 houses + a campfire on flat ground with its surface in the upper part of the map; a world saved by an
// older version keeps its classic terrain untouched; trees render at every stage and harvest cleanly; no forced layout every frame.
// node tests/building.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()=='error'&&/WALL9|HDOOR9|VILL9|TREE9|BUILD9|BLK9/.test(m.text()))errs.push(m.text())});
 // a world saved by an older version (no generator marker): one brick far from spawn
 await p.addInitScript(()=>{if(!localStorage.getItem('rbw_oldtown'))localStorage.setItem('rbw_oldtown',JSON.stringify({W:256,[6*256+40]:[7,0,0,0]}))});
 await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=20});await p.waitForTimeout(400);
 const E=(f,a)=>p.evaluate(f,a);
 // helpers in the page: aim at a tile, hold an item / tool
 await E(()=>{window.AIM=(tx,ty)=>{mx=tx*T+T/2-cam.x;my=ty*T+T/2-cam.y};window.HOLD=k=>{HOTBAR.set(0,k,{quiet:1});HOTBAR.pick(0,true)};
  window.STAND=(x,y)=>{P.x=x*T+T/2;P.y=y*T-P.h-1;P.vx=P.vy=0;cam.x=P.x-cv.width/ZM/2;cam.y=P.y-cv.height/ZM/2};window.TOOL=b=>({soft:'pip',stone:'pebble',ore:'glimmer',wood:'twiggy'})[TOOLS8.catOf(b)]});
 // ---- 1. a new world: generator, village, campfire, flat ground, upper surface
 const nw=await E(()=>{enterWorld('buildtown');WX6.force='clear';clock=()=>.02;iT=1e9;spawnT=1e9;const v=VILL9.info&&VILL9.info.v,flat=v?(()=>{for(let x=v.x0;x<=v.x1;x++)if(sh(x)!=v.ty)return false;return true})():false;
  let lo=99,hi=0;for(let x=1;x<W-1;x++){lo=Math.min(lo,sh(x));hi=Math.max(hi,sh(x))}const rooms=v?DEPTH8.sites().filter(r=>r.x+r.rw>=v.x0-1&&r.x-r.rw<=v.x1+1).map(r=>r.fy-r.rh):[];
  let doors=0;for(let k=0;k<W*H;k++)if(tiles[k]==95)doors++;let isl=0;if(v)for(let x=v.x0;x<=v.x1;x++)for(let y=Math.max(1,v.ty-12);y<v.ty-9;y++)if(tiles[y*W+x]&&tiles[y*W+x]!=100)isl++;
  return{gv:VILL9.gv,v:!!v,n:v?v.houses.length:0,fire:v?tiles[(v.ty-1)*W+v.fx]==69:false,flat,ty:v&&v.ty,lo,hi,rooms:v?rooms.every(t=>t>v.ty+3):false,doors,walls:WALL9.count,isl,spawnDist:v?Math.min(Math.abs(v.x0-DX),Math.abs(v.x1-DX)):0,trees:trees.size,mark:edits.g}});
 ok('a new world uses the new generator and is marked g:2 in its edits',nw.gv==2&&nw.mark==2,nw);
 ok('the surface stays in the upper part of the map with real hills (range of heights)',nw.lo>=9&&nw.hi<=28&&nw.hi-nw.lo>=4,{lo:nw.lo,hi:nw.hi});
 ok('a village of 1-3 houses with a campfire on flat ground, away from the spawn door',nw.v&&nw.n>=1&&nw.n<=3&&nw.fire&&nw.flat&&nw.spawnDist>=14,nw);
 ok('every house has a door and background walls; nothing overlaps the depth rooms or sky islands',nw.doors==nw.n&&nw.walls>=nw.n*20&&nw.rooms&&nw.isl==0,nw);
 ok('wild trees grow in a new world',nw.trees>=3,nw.trees);
 // ---- 2. every new block places and breaks with the right tool, and renders
 const bl=await E(async()=>{const v=VILL9.info.v,x0=DX+4,y=sh(DX)-1,res=[];STAND(DX+2,y+1);
  for(let x=x0-1;x<x0+4;x++)for(let yy=y-3;yy<=y;yy++){tiles[yy*W+x]=0;WALL9.set(yy*W+x,0);trees.delete(yy*W+x)}
  for(const id of BLK9.IDS){const key=BLK9.KEY(id);addI(key,3);HOLD(key);const tx=x0,k=y*W+tx;tiles[k]=0;AIM(tx,y);rcd=0;placeAction();const placed=tiles[k]==id;
   const s=spr(id,0,0),d=s.getContext('2d').getImageData(0,0,T,T).data;let px=0;for(let i=3;i<d.length;i+=4)if(d[i]>30)px++;const drawn=!!(SOLID6[id]||TDRAW7[id]);
   const tool=TOOL(id);HOTBAR.set(1,'w:'+tool,{quiet:1});HOTBAR.pick(1,true);wcd=0;const nd=drops.length;AIM(tx,y);useWeapon();const broke=!tiles[k],drop=drops.slice(nd).some(q=>q.k===key);
   res.push({id,key,placed,broke,drop,px,drawn,tool,solid:SOLID6[id],used:cnt(key)==2})}return res});
 const badB=bl.filter(r=>!r.placed||!r.broke||!r.drop||r.px<120||!r.drawn||!r.used);ok('all 15 new blocks (tiles 100-114, items 400-414) place, break in one hit with their tool, drop their item back and have a painted sprite',bl.length==15&&!badB.length,badB.length?badB:bl.map(r=>r.id+':'+r.tool).join(' '));
 ok('fences, rugs, lanterns and planters are walk-through; walls, roofs, floors and windows are solid',[108,110,111,113].every(i=>bl.find(r=>r.id==i).solid==0)&&[100,101,102,103,104,105,106,107,109,112,114].every(i=>bl.find(r=>r.id==i).solid==1));
 const cat=await E(()=>({brick:TOOLS8.catOf(100),roof:TOOLS8.catOf(104),floor:TOOLS8.catOf(103),shelf:TOOLS8.catOf(109),thatch:TOOLS8.catOf(106),door:TOOLS8.catOf(95),glow:!!GLOW7[108],store:[400,407,414,95].every(i=>SHOP7.byId.get('blk_'+i))&&SHOP7.byId.get('wall_320'),valid:validEdit({k:5,a:[114,0,0,0]})&&validEdit({k:5,a:[96,0,0,0]})&&!validEdit({k:5,a:[150,0,0,0]}),cat:ITEM7.cat(400)=='block'&&ITEM7.cat(320)=='block'&&ITEM7.cat(95)=='door',name:iname(400)=='Clay Brick',buy:0}));
 ok('mining categories / sounds, lantern light, store entries and save validation for the new blocks',cat.brick=='stone'&&cat.roof=='stone'&&cat.floor=='wood'&&cat.shelf=='wood'&&cat.thatch=='soft'&&cat.door=='wood'&&cat.glow&&!!cat.store&&cat.valid&&cat.cat&&cat.name,cat);
 const ob=await E(async()=>{const g0=gems;gems=10000;const n0=cnt(400),w0=cnt(321);const a=await SHOP7.buy('blk_400',3),w=await SHOP7.buy('wall_321',2);gems=g0;
  const y=sh(DX)-1,tx=DX+5,k=y*W+tx;STAND(DX+2,y+1);tiles[k]=0;HOLD(400);AIM(tx,y);rcd=0;placeAction();const placed=tiles[k]==100;localStorage.setItem('rbw_'+cur,JSON.stringify(edits));enterWorld('oldtown');enterWorld('buildtown');WX6.force='clear';clock=()=>.02;iT=1e9;spawnT=1e9;
  return{bought:a.ok&&cnt(400)==n0+3-1,walls:w.ok&&cnt(321)==w0+2,recipes:['claybrick','housedoor','wall_oak','fence'].every(id=>RECIPES.some(r=>r.id==id)),placed,kept:tiles[k]==100,icon:iconURL(400).length>500&&iconURL(320).length>500&&iconURL(95).length>500}});
 ok('house blocks and walls can be bought in the store and crafted; an extended-range tile (100+) saves and reloads',ob.bought&&ob.walls&&ob.recipes&&ob.placed&&ob.kept&&ob.icon,ob);
 // ---- 3. background walls: behind blocks, walk-through, saved, broken with tools
 const wa=await E(async()=>{const y=sh(DX)-1,tx=DX-4,k=y*W+tx,k2=(y-1)*W+tx;STAND(DX-2,y+1);for(const q of[k,k2,k-1,k2-1]){tiles[q]=0;WALL9.set(q,0)}tiles[k]=3;hp[k]=BLK[3][2];
  addI(320,5);HOLD(320);AIM(tx,y);rcd=0;placeAction();const behind=WALL9.bw[k]==1&&tiles[k]==3;AIM(tx,y-1);wcd=0;useWeapon();const empty=WALL9.bw[k2]==1;const n0=cnt(320);
  const solid=solidAt(tx,y-1)||solidAt(tx-1,y-1);// a wall never blocks
  // walk through a wall tile: P stays free
  STAND(tx,y);P.x=(tx+.5)*T;const free=!boxHit({x:P.x,y:P.y,w:P.w,h:P.h});
  return{behind,empty,used:5-n0,solid,free,saved:edits.bw&&edits.bw[k]==1&&edits.bw[k2]==1,k,k2}});
 ok('walls go behind a block and onto empty tiles (click with a wall held), and use up the item',wa.behind&&wa.empty&&wa.used==2,wa);
 ok('walls are never solid',!wa.solid&&wa.free,wa);
 await E(()=>{localStorage.setItem('rbw_'+cur,JSON.stringify(edits));enterWorld('oldtown');enterWorld('buildtown');WX6.force='clear';clock=()=>.02;iT=1e9;spawnT=1e9});
 const wl2=await E(([k,k2])=>({a:WALL9.bw[k],b:WALL9.bw[k2],gv:VILL9.gv}),[wa.k,wa.k2]);ok('walls survive saving and reloading the world',wl2.a==1&&wl2.b==1&&wl2.gv==2,wl2);
 const wb=await E(([k2])=>{const tx=k2%W,ty=k2/W|0;STAND(tx+2,ty+2);HOTBAR.set(1,'w:pip',{quiet:1});HOTBAR.pick(1,true);wcd=0;const nd=drops.length;AIM(tx,ty);useWeapon();return{gone:WALL9.bw[k2]==0,drop:drops.slice(nd).some(q=>q.k===320),rec:edits.bw[k2]===0}},[wa.k2]);
 ok('a wall breaks with a fitting tool and drops its item',wb.gone&&wb.drop&&wb.rec,wb);
 const wf=await E(([k])=>{const tx=k%W,ty=(k/W|0)-1;WALL9.set(ty*W+tx,2);STAND(tx+2,ty+1);HOTBAR.set(1,null,{quiet:1});HOTBAR.pick(1,true);wp='fist';let n=0;while(WALL9.bw[ty*W+tx]&&n<6){wcd=0;AIM(tx,ty);useWeapon();n++}return n},[wa.k]);
 ok('fists take a few hits to knock a wall down',wf==3,wf);
 // ---- 4. house doors
 const dr=await E(async()=>{const y=sh(DX)-1,tx=DX+6;for(let x=tx-4;x<=tx+6;x++)for(let yy=y-3;yy<=y;yy++){tiles[yy*W+x]=0;WALL9.set(yy*W+x,0);trees.delete(yy*W+x)}for(let x=tx-4;x<=tx+6;x++){tiles[(y+1)*W+x]=3;hp[(y+1)*W+x]=BLK[3][2]}
  STAND(tx-3,y+1);addI(95,2);HOLD(95);AIM(tx,y);rcd=0;placeAction();const k=y*W+tx,placed=tiles[k]==95&&tiles[k-W]==96;await new Promise(r=>setTimeout(r,500));const closed=HDOOR9.open(k);
  STAND(tx-1,y+1);await new Promise(r=>setTimeout(r,500));const open=HDOOR9.open(k);
  // walk right through the doorway
  STAND(tx-2,y+1);K.d=1;await new Promise(r=>setTimeout(r,1100));K.d=0;const through=P.x>(tx+1)*T;const mid=HDOOR9.open(k);
  STAND(tx+5,y+1);await new Promise(r=>setTimeout(r,700));const after=HDOOR9.open(k);return{k,placed,closed,open,through,after,mid}});
 ok('a house door is placed as one 1x2 door',dr.placed,dr);ok('it is closed when nobody is near and swings open as you walk up',dr.closed<.05&&dr.open>.9,dr);
 ok('you walk straight through it',dr.through,dr);ok('it closes behind you',dr.after<.08,dr);
 const ds=await E(async([k])=>{localStorage.setItem('rbw_'+cur,JSON.stringify(edits));enterWorld('oldtown');enterWorld('buildtown');WX6.force='clear';clock=()=>.5;iT=1e9;spawnT=1e9;await new Promise(r=>setTimeout(r,300));
  const kept=tiles[k]==95&&tiles[k-W]==96&&HDOOR9.state.has(k);
  // a walking monster chasing you is stopped by the closed door
  const tx=k%W,y=k/W|0;mobs.length=0;STAND(tx+4,y+1);const d=MK.crab;mobs.push({k:'crab',x:(tx-2.5)*T,y:(y+1)*T-d.h,w:d.w,h:d.h,vx:0,vy:0,hp:d.hp,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:1,g:true,wall:0});
  await new Promise(r=>setTimeout(r,1800));const m=mobs.find(q=>q.k=='crab');const blocked=!!m&&m.x+m.w/2<=tx*T+8;
  // E holds it open, then the monster can pass
  STAND(tx-1,y+1);HDOOR9.toggle();STAND(tx+4,y+1);await new Promise(r=>setTimeout(r,500));const held=HDOOR9.open(k)>.9;HDOOR9.toggle();mobs.length=0;return{kept,blocked,mx:m&&m.x,dx:tx*T,held}},[dr.k]);
 ok('doors survive saving and reloading the world',ds.kept,ds);ok('a closed door stops a walking monster',ds.blocked,ds);ok('E next to a door holds it open',ds.held,ds);
 const db=await E(([k])=>{const tx=k%W,y=k/W|0;STAND(tx-2,y+1);HOTBAR.set(1,'w:twiggy',{quiet:1});HOTBAR.pick(1,true);wcd=0;const nd=drops.length;AIM(tx,y-1);useWeapon();return{gone:!tiles[k]&&!tiles[k-W],drop:drops.slice(nd).filter(q=>q.k===95).length}},[dr.k]);
 ok('breaking either half removes the whole door and drops one door',db.gone&&db.drop==1,db);
 // ---- 5. an older saved world is untouched (classic terrain, its edit, no village / walls / trees)
 const old=await E(()=>{enterWorld('oldtown');const cls=x=>18+Math.round(Math.sin(x*.12+ws)*2+Math.sin(x*.05+ws*1.7)*3);let same=true;for(let x=0;x<W;x++)if(sh(x)!=cls(x)){same=false;break}let doors=0;for(let k=0;k<W*H;k++)if(tiles[k]==95)doors++;
  return{gv:VILL9.gv,same,shn:SHN===null,brick:tiles[6*256+40]==7,walls:WALL9.count,doors,trees:trees.size,mark:edits.g}});
 ok('a world saved by an older version keeps its classic terrain and edits, with no village, walls or wild trees',old.gv==1&&old.same&&old.shn&&old.brick&&old.walls==0&&old.doors==0&&old.trees==0&&old.mark==1,old);
 const old2=await E(()=>{localStorage.setItem('rbw_oldtown',JSON.stringify(edits));enterWorld('buildtown');enterWorld('oldtown');return{gv:VILL9.gv,brick:tiles[6*256+40]==7,g:JSON.parse(localStorage.getItem('rbw_oldtown')).g}});
 ok('once re-saved it carries the classic marker and stays classic',old2.gv==1&&old2.brick&&old2.g==1,old2);
 // ---- 6. trees: every stage and type renders, harvest shrinks the tree away and sheds leaves (no errors)
 const tr=await E(async()=>{enterWorld('buildtown');WX6.force='clear';clock=()=>.02;iT=1e9;const y=sh(DX),x0=DX-8;STAND(DX,y);const now=Date.now();let n=0;
  for(let i=0;i<7;i++){const k=(y-1)*W+x0+i*2;tiles[k]=0;trees.set(k,{s:2,r:2,p:now-[0,.18,.35,.52,.7,.9,1.3][i]*20000})}
  for(const r of[5,50,15,8,3])for(let sg=0;sg<=6;sg++){const s=TREE9.get(r,sg,sg==6);const d=s.c.getContext('2d').getImageData(0,0,s.c.width,s.c.height).data,dt=s.t.getContext('2d').getImageData(0,0,s.t.width,s.t.height).data;let a=0;for(let i=3;i<d.length;i+=16)if(d[i]||dt[i])a++;if(a>30)n++}
  await new Promise(r=>setTimeout(r,500));const rk=(y-1)*W+x0+12;const lf0=TREE9.LF.length;harvest(rk);const fell=TREE9.fell.length,lf=TREE9.LF.length-lf0;await new Promise(r=>setTimeout(r,700));
  return{n,fell,lf,gone:!trees.has(rk),after:TREE9.fell.length,kinds:[5,50,15,8,3].map(TREE9.kind)}});
 ok('trees render at all 7 sizes for oak, cherry, hedge, palm and pine',tr.n==35,tr);
 ok('harvesting: the tree shrinks away (no one-frame pop) and sheds falling leaves',tr.fell==1&&tr.lf>=6&&tr.gone&&tr.after==0,tr);
 // ---- 6b. block art (99-zzzzzzz-blockart.js): every block sprite renders at T x T without errors; the natural and building blocks use the
 // soft-3D BART9 art (opaque, different per block and per variant) and that is what the sprite cache and the tile cache draw
 const ba=await E(()=>{const bad=[],old=[];let n=0;for(const k of Object.keys(BLK)){const b=+k;for(let v=0;v<3;v++){let c;try{c=blockSprite(b,v)}catch(e){bad.push(b+':'+e.message);continue}if(!c||c.width!=T||c.height!=T)bad.push(b+' size');else n++}}
  const need=[1,2,3,4,5,7,8,9,10,11,12,15,42,43,50,55,57,60,61,62,65,68,71,72,73,74,75,76,77,78,94,100,102,103,112];for(const b of need)for(let v=0;v<3;v++)if(!blockSprite(b,v).bart9)old.push(b+'/'+v);
  const sig=c=>{const d=c.getContext('2d').getImageData(0,0,T,T).data;let o=0,h=0;for(let i=0;i<d.length;i+=4){if(d[i+3]>250)o++;h=(h*31+d[i]+d[i+1]*3+d[i+2]*7)>>>0}return{o,h}};
  const s=need.map(b=>sig(spr(b,0,0))),opaque=s.every(q=>q.o==T*T),distinct=new Set(s.map(q=>q.h)).size==need.length;
  const variants=[1,3,5,10,74,75].every(b=>new Set([0,1,2].map(v=>sig(blockSprite(b,v)).h)).size==3);
  TILE7.cache.clear();for(const b of need)for(let v=0;v<3;v++)delete SPR[b*4+v];const y=sh(DX),k=(y+1)*W+DX;tiles[k]=74;g.save();g.setTransform(1,0,0,1,0,0);TILE7.draw(DX-2,DX+2,y-2,y+3,performance.now());g.restore();
  return{n,bad,old,covered:BART9.IDS.length,opaque,distinct,variants,cached:!!(SPR[74*4+(DX*7+(y+1)*13)%3]||{}).bart9,errs:BART9.errs}});
 ok('every block sprite renders at T x T without errors; dirt, grass, stone, wood, sand, gold, gem ores, moss, marble and the stone family use the new soft-3D art',ba.bad.length==0&&ba.old.length==0&&ba.covered>=35&&ba.opaque&&ba.distinct&&ba.variants&&ba.cached&&!ba.errs.length,ba);
 // ---- 7. no forced layout every frame while idle
 const cdp=await ctx.newCDPSession(p);await cdp.send('Performance.enable');await E(()=>{window._fc=0;const f=()=>{window._fc++;requestAnimationFrame(f)};requestAnimationFrame(f)});
 const m0=(await cdp.send('Performance.getMetrics')).metrics.find(m=>m.name=='LayoutCount').value;await sleep(2000);const m1=(await cdp.send('Performance.getMetrics')).metrics.find(m=>m.name=='LayoutCount').value;const fc=await E(()=>window._fc);
 ok('idle in a world: no layout every frame (was 1 per frame from the world-event HUD)',(m1-m0)/fc<.3,{layouts:m1-m0,frames:fc});
 ok('no page errors',errs.length==0,errs.join(' | '));
 await b.close();console.log(fails?fails+' building test(s) FAILED':'all building tests passed');process.exit(fails?1:0)})();
