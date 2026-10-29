// Fishing mini-game (FISHGAME9): a bite + click starts the reel game; holding / releasing moves the catch zone; keeping the fish in the
// zone lands exactly that fish (rewards, XP); letting the tension max out snaps the line (no fish, bait lost); rarer fish are harder;
// Bubbles perks and bait make it easier; the bobber never reports "The water is gone" while you reel. node tests/fishing.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',SHOTS=process.env.RB_SHOTS||'';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()=='error')errs.push('console: '+m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=20});await p.waitForTimeout(400);
 await p.evaluate(()=>{enterWorld('fishtest')});await p.waitForTimeout(900);
 const E=(f,a)=>p.evaluate(f,a);const shot=async n=>{if(SHOTS)await p.screenshot({path:path.join(SHOTS,n+'.png')})};
 await E(()=>{WX6.force='clear';mobs.length=0;ENV7.set('default',{instant:true});TOOLLV.set('bubbles',1,0);HOTBAR.pick(HOTBAR.slotOf('w:bubbles'),true)});
 // a pond right next to the player (full water tiles, surface on a tile edge)
 const pond=await E(()=>{const px=Math.floor(P.x/T),gx=px+2,gy=sh(gx);for(let x=gx;x<gx+8;x++)for(let y=gy-4;y<gy+3;y++){const k=y*W+x;tiles[k]=0;wl[k]=y>=gy?8:0}
  for(let x=gx-1;x<gx+9;x++){const k=(gy+3)*W+x;tiles[k]=2}for(const x of[gx-1,gx+8])for(let y=gy;y<gy+3;y++)tiles[y*W+x]=2;for(let x=px-2;x<gx;x++){tiles[gy*W+x]=2;for(let y=gy-4;y<gy;y++)tiles[y*W+x]=0}
  P.x=(gx-1)*T+T/2;P.y=gy*T-P.h-1;P.vx=P.vy=0;P.sw=false;return{gx,gy}});
 // helper (in page): cast into the pond and get a bite
 await E(()=>{window.__bite=async function(bait){const F=TOOLS8.FISH,{gx,gy}=window.__pond;wp='bubbles';F.S.st='idle';msg='';window.__said=[];if(bait){addI(bait,3)}
   F.click({x:(gx+3.5)*T,y:(gy+.5)*T});const t0=performance.now();while(F.S.st=='cast'&&performance.now()-t0<4000)await new Promise(r=>setTimeout(r,30));if(F.S.st!='wait')return F.S.st;F.S.t=.05;
   const t1=performance.now();while(F.S.st!='bite'&&performance.now()-t1<2000)await new Promise(r=>setTimeout(r,20));return F.S.st};
  window.__watch=()=>{if(msg&&window.__said[window.__said.length-1]!==msg)window.__said.push(String(msg))};
  window.__fish=()=>Object.keys(TOOLS8.FISHES).reduce((s,k)=>s+cnt(+k),0)});
 await E(o=>{window.__pond=o},pond);
 // ---- a bite + click starts the mini-game
 const st=await E(async()=>{const F=TOOLS8.FISH,o={};o.bite=await __bite();const n0=__fish();F.click({x:F.S.x,y:F.S.y});o.st=F.S.st;o.on=FISHGAME.G.on;o.noFishYet=__fish()==n0;o.fid=F.S.fid;return o});
 ok('a bite + click starts the reel mini-game (no fish yet, the fish is already chosen)',st.bite=='bite'&&st.st=='reel'&&st.on==1&&st.noFishYet&&st.fid>=240&&st.fid<=249,st);
 // ---- holding pushes the zone right, releasing lets it drift left; Space counts as holding
 const mv=await E(async()=>{const G=FISHGAME.G,o={};G.force=true;const a=G.zp;await new Promise(r=>setTimeout(r,450));G.fp=G.zp+G.zw/2;o.right=G.zp-a;G.force=false;let pk=G.zp;for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,16));pk=Math.max(pk,G.zp);G.fp=G.zp+G.zw/2}o.left=G.zp-pk;G.fp=G.zp+G.zw/2;
  G.force=null;K[' ']=1;await new Promise(r=>setTimeout(r,60));o.space=G.hold;K[' ']=0;G.force=false;return o});
 ok('holding moves the catch zone right, releasing lets it drift left, Space also reels',mv.right>.05&&mv.left<-.05&&mv.space,mv);
 await E(()=>{const G=FISHGAME.G;G.fp=G.zp+G.zw/2;G.ft=G.fp;G.pr=.55;G.ten=.35});await p.waitForTimeout(120);await shot('fish_reel');
 // ---- keep the fish in the zone -> it is landed (exactly one fish, XP, preview popup)
 const ld=await E(async()=>{const F=TOOLS8.FISH,G=FISHGAME.G,n0=__fish(),x0=TOOLLV.S.bubbles.x+TOOLLV.S.bubbles.l*1e4,fid=F.S.fid,t0=performance.now();
  while(F.S.st=='reel'&&performance.now()-t0<12000){G.fp=G.zp+G.zw/2;G.ft=G.fp;__watch();await new Promise(r=>setTimeout(r,16))}
  return{after:F.S.st,gained:__fish()-n0,right:cnt(fid)>0,xp:TOOLLV.S.bubbles.x+TOOLLV.S.bubbles.l*1e4-x0,preview:!!(FISHGAME.G.res&&FISHGAME.G.res.ok),said:__said.slice(),t:Math.round(performance.now()-t0)}});
 await p.waitForTimeout(150);await shot('fish_catch');
 ok('keeping the fish in the zone lands exactly that fish (+Bubbles XP, fish preview)',ld.after=='idle'&&ld.gained==1&&ld.right&&ld.xp>0&&ld.preview,ld);
 ok('a well played reel is short (under 8 s)',ld.t<8000,ld.t);
 ok('never "The water is gone" while reeling',!ld.said.some(m=>/water is gone/i.test(m)),ld.said);
 // ---- let the tension max out -> the line snaps: no fish, bait lost
 const sn=await E(async()=>{const F=TOOLS8.FISH,G=FISHGAME.G,o={};o.bite=await __bite(250);const bait0=cnt(250);F.click({x:F.S.x,y:F.S.y});o.reel=F.S.st;const n0=__fish(),t0=performance.now();
  while(F.S.st=='reel'&&performance.now()-t0<12000){G.fp=G.zp>.5?.01:.99;G.ft=G.fp;G.force=false;__watch();await new Promise(r=>setTimeout(r,16))}G.force=null;__watch();
  o.after=F.S.st;o.gained=__fish()-n0;o.baitLost=bait0-cnt(250);o.said=__said.slice();o.snapPopup=!!(FISHGAME.G.res&&!FISHGAME.G.res.ok);return o});
 ok('letting the tension max out snaps the line: no fish, the bait is lost, a snap message',sn.reel=='reel'&&sn.after=='idle'&&sn.gained==0&&sn.baitLost==1&&sn.said.some(m=>/snapped/i.test(m))&&sn.snapPopup,sn);
 // ---- difficulty: rarer fish are harder; Bubbles perks and bait make it easier
 const df=await E(()=>{const D=FISHGAME.diff,mn=D(240,1,0),gc=D(247,1,0),gc8=D(247,8,0),gcB=D(247,1,252),boot=D(249,1,0);return{mn,gc,gc8,gcB,boot}});
 ok('rarer fish are harder (Golden Carp: faster, smaller zone, faster tension than a Minnow; the Old Boot just drags)',df.gc.d>df.mn.d&&df.gc.zw<df.mn.zw&&df.gc.fv>df.mn.fv&&df.gc.tup>df.mn.tup&&df.boot.junk&&df.boot.fv<df.mn.fv,df);
 ok('Bubbles perks make it easier: level 8 = bigger zone, slower fish, slower tension',df.gc8.zw>df.gc.zw&&df.gc8.fv<df.gc.fv&&df.gc8.tup<df.gc.tup,{l1:df.gc,l8:df.gc8});
 ok('better bait helps the reel too (Golden Bait: bigger zone, slower tension)',df.gcB.zw>df.gc.zw&&df.gcB.tup<df.gc.tup,{none:df.gc,gold:df.gcB});
 // the perk level is applied when a reel starts
 const lv=await E(async()=>{TOOLLV.set('bubbles',8,0);const F=TOOLS8.FISH;await __bite();F.click({x:F.S.x,y:F.S.y});const o={zw:FISHGAME.G.zw,want:FISHGAME.diff(F.S.fid,8,F.S.bait).zw,l1:FISHGAME.diff(F.S.fid,1,F.S.bait).zw,lvl:FISHGAME.G.lvl};F.land();TOOLLV.set('bubbles',1,0);return o});
 ok('a reel started with a level 8 Bubbles uses the level 8 zone (its lent rare-fish luck widens it a little more)',lv.lvl==8&&lv.zw>=lv.want-1e-9&&lv.zw>lv.l1,lv);
 // bait still matters for the bite itself: golden bait bites sooner than worm bait
 const bt=await E(async()=>{const F=TOOLS8.FISH,{gx,gy}=window.__pond,r={};for(const k of[250,252]){addI(k,2);for(const o of[250,251,252])if(o!=k)while(cnt(o)>0)addI(o,-1);F.S.st='idle';F.click({x:(gx+3.5)*T,y:(gy+.5)*T});const t0=performance.now();while(F.S.st=='cast'&&performance.now()-t0<4000)await new Promise(q=>setTimeout(q,30));await new Promise(q=>setTimeout(q,60));r[k]={st:F.S.st,t:F.S.t,bait:F.S.bait}}F.S.st='idle';return r});
 ok('bait still matters: the best bait is used and Golden Bait bites sooner than Worm Bait',bt[250].bait==250&&bt[252].bait==252&&bt[252].t<=3.05&&bt[250].t>=2.2,bt);
 // ---- reduced motion still plays; the rod bends while reeling
 const rm=await E(async()=>{cel.opt.reduce=1;const F=TOOLS8.FISH,G=FISHGAME.G;await __bite();F.click({x:F.S.x,y:F.S.y});const o={st:F.S.st};const n0=__fish(),t0=performance.now();while(F.S.st=='reel'&&performance.now()-t0<12000){G.fp=G.zp+G.zw/2;G.ft=G.fp;await new Promise(r=>setTimeout(r,16))}o.gained=__fish()-n0;cel.opt.reduce=0;return o});
 ok('reduced motion: the reel still works',rm.st=='reel'&&rm.gained>=1,rm);
 ok('no page errors',errs.length==0,errs.slice(0,5).join(' | '));
 await b.close();console.log(fails?fails+' fishing test(s) FAILED':'all fishing tests passed');process.exit(fails?1:0)})();
