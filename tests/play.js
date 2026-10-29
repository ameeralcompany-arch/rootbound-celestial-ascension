// Gameplay controls: only tools break blocks (weapons never dig, fists still open Tackle Boxes), hotbar wheel / number keys / X switching,
// walking while the inventory is open, and the sky + weather layers render for every state. node tests/play.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=20});await p.waitForTimeout(400);
 await p.evaluate(()=>{enterWorld('playtest')});await p.waitForTimeout(900);
 const E=(f,a)=>p.evaluate(f,a);
 await E(()=>{WX6.force='clear';mobs.length=0;own.cinder=1;own.solarfang=1});await p.waitForTimeout(300);
 const scr=k=>E(k=>{const x=k%W,y=k/W|0;return{x:((x*T+T/2-cam.x)*ZM)*innerWidth/cv.width,y:((y*T+T/2-cam.y)*ZM)*innerHeight/cv.height}},k);
 const soft=await E(()=>{const px=Math.floor(P.x/T),py=Math.floor((P.y+P.h+2)/T);for(const[dx,dy]of[[1,0],[-1,0],[1,1],[0,1],[2,0]]){const k=(py+dy)*W+px+dx;if(tiles[k]==1||tiles[k]==2)return k}const k=py*W+px+1;tiles[k]=1;hp[k]=BLK[1][2];return k});
 let s=await scr(soft);await p.mouse.move(s.x,s.y);
 // every weapon path leaves the block alone
 const res=await E(k=>{const x=k%W,y=k/W|0,b0=tiles[k],out={};for(const id of['fist','cinder','solarfang']){wp=id;wcd=0;for(let i=0;i<4;i++){wcd=0;useWeapon()}out[id]=tiles[k]==b0}
  out.direct=(()=>{wp='cinder';let r;PLAY8.G.wpn++;try{r=breakAt(x,y,99)}finally{PLAY8.G.wpn--}return r===false&&tiles[k]==b0})();return out},soft);
 ok('weapons never break blocks (fists, Cinder, Solarfang, direct breakAt inside a weapon use)',res.fist&&res.cinder&&res.solarfang&&res.direct,res);
 await p.mouse.down();await p.waitForTimeout(600);await p.mouse.up();ok('holding the mouse with a weapon on dirt leaves it',await E(k=>tiles[k]==1||tiles[k]==2,soft));
 ok('a gentle hint explains tools break blocks',await E(()=>/tool/i.test(msg)));
 await p.keyboard.press('2');await p.waitForTimeout(150);ok('key 2 (hotbar slot 2 by default) picks Pip the shovel',await E(()=>wp=='pip'&&HOTBAR.cur==1));
 s=await scr(soft);await p.mouse.move(s.x,s.y);await p.mouse.down();await p.waitForTimeout(600);await p.mouse.up();ok('a tool breaks the block',await E(k=>!tiles[k],soft));
 ok('non-weapon systems can still break blocks (breakAt outside a weapon use)',await E(()=>{const x=Math.floor(P.x/T)+3,y=Math.floor((P.y+P.h+2)/T)+1,k=y*W+x;tiles[k]=1;hp[k]=1;breakAt(x,y,50);return!tiles[k]}));
 // fists still open Tackle Boxes (bait)
 const tb=await E(()=>{const px=Math.floor(P.x/T),py=Math.floor((P.y+P.h/2)/T);for(const dx of[-1,1,-2,2]){const k=py*W+px+dx;if(!tiles[k]){tiles[k]=70;hp[k]=99;return k}}return -1});
 const bait=await E(k=>{wp='fist';const x=k%W,y=k/W|0;mx=(x*T+T/2-cam.x);my=(y*T+T/2-cam.y);const n0=drops.filter(d=>d.k>=250&&d.k<=252).length;wcd=0;useWeapon();return{n0,n1:drops.filter(d=>d.k>=250&&d.k<=252).length,box:tiles[k]==70}},tb);
 ok('punching a Tackle Box with fists still gives bait (and the box stays)',bait.n1>bait.n0&&bait.box,bait);
 // switching: X swap, 9, wheel both ways
 await E(()=>{wp='pebble'});await p.waitForTimeout(80);await E(()=>{wp='cinder'});await p.waitForTimeout(80);
 await p.keyboard.press('x');await p.waitForTimeout(120);const a=await E(()=>wp);await p.keyboard.press('x');await p.waitForTimeout(120);const c=await E(()=>wp);
 ok('X swaps between the last weapon and the last tool',a=='pebble'&&c=='cinder',[a,c]);
 await p.keyboard.press('6');await p.waitForTimeout(80);await p.keyboard.press('9');await p.waitForTimeout(80);ok('6 picks hotbar slot 6 (Bubbles); 9 does not switch',await E(()=>wp=='bubbles'&&HOTBAR.cur==5));await p.keyboard.press('7');await p.waitForTimeout(80);ok('7 picks hotbar slot 7 (Twiggy)',await E(()=>wp=='twiggy'&&HOTBAR.cur==6));await p.keyboard.press('6');await p.waitForTimeout(80);
 await p.mouse.move(640,200);const w0=await E(()=>[wp,HOTBAR.cur]);await p.mouse.wheel(0,120);await p.waitForTimeout(200);const w1=await E(()=>[wp,HOTBAR.cur]);await p.mouse.wheel(0,-120);await p.waitForTimeout(200);const w2=await E(()=>[wp,HOTBAR.cur]);
 ok('mouse wheel cycles the hotbar slots both ways',w1[1]==6&&w1[0]!=w0[0]&&w2[1]==w0[1]&&w2[0]==w0[0],[w0,w1,w2]);
 ok('switching shows the hotbar name pill',await E(()=>{const e=document.querySelector('#bar .pill6');return !!e&&e.classList.contains('on')&&e.textContent.length>3}));
 // inventory open: walking and jumping still work, wheel over the panel does not switch, focus is released on close
 await p.keyboard.press('i');await p.waitForTimeout(300);const x0=await E(()=>P.x);await p.keyboard.down('d');await p.waitForTimeout(600);await p.keyboard.up('d');const x1=await E(()=>P.x);
 ok('walking works with the inventory open',await E(()=>showInv)&&x1-x0>30,[x0,x1]);await p.waitForTimeout(400);
 const y0=await E(()=>P.y);await p.keyboard.down(' ');await p.waitForTimeout(150);const y1=await E(()=>P.y);await p.keyboard.up(' ');ok('jumping works with the inventory open',y1<y0-8,[y0,y1]);
 const wb=await E(()=>wp);await p.mouse.move(640,360);await p.mouse.wheel(0,120);await p.waitForTimeout(150);ok('wheel over the inventory panel does not switch items',await E(()=>wp)==wb);
 await E(()=>{const b=document.querySelector('#inv7 nav button');b.focus();b.click()});const x2=await E(()=>P.x);await p.keyboard.down('a');await p.waitForTimeout(500);await p.keyboard.up('a');ok('a focused panel button gives the movement keys back',x2-(await E(()=>P.x))>30);
 await p.waitForTimeout(600);/* let the walk from the previous check slide to a stop */await E(()=>document.getElementById('inq7').focus());const x3=await E(()=>P.x);await p.keyboard.type('dad');await p.waitForTimeout(200);ok('typing in the inventory search does not move the player',Math.abs((await E(()=>P.x))-x3)<3);
 await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.waitForTimeout(300);ok('closing the inventory releases focus',await E(()=>!showInv&&!document.getElementById('inv7').contains(document.activeElement)));
 // hat skills (Q) that queue a delayed ring effect must not break the frame: a mid-draw throw used to leave the world zoom stacked up
 const cerr=[];p.on('console',m=>{if(m.type()=='error')cerr.push(m.text())});
 for(const id of['sparkhood','crown']){await E(id=>{own[id]=1;wear.hat=id;cdT.hat=0},id);await p.keyboard.press('q');await p.waitForTimeout(450);
  const z=await E(()=>{const m=g.getTransform();return{a:m.a,d:m.d,cd:cdT.hat>0}});ok('Q skill ('+id+') keeps the camera zoom steady',z.a==1&&z.d==1&&z.cd&&!cerr.length,{z,cerr})}
 // fishing: cast into a dug-out pool of full water tiles (surface exactly on a tile edge), the bobber floats and a fish bites
 const wp0=await E(()=>wp);const fish=await E(async()=>{const FISH=TOOLS8.FISH;const said=[],res={},watch=()=>{if(msg&&said[said.length-1]!==msg)said.push(String(msg))};
  for(const tries of[0,1,2,3,4,5]){const px=Math.floor(P.x/T),gx=px+3+tries%2,gy=sh(gx);
   for(let x=gx;x<gx+7;x++)for(let y=gy;y<gy+3;y++){const k=y*W+x;tiles[k]=0;wl[k]=8}for(let x=gx-1;x<gx+8;x++){const k=(gy+3)*W+x;if(!tiles[k])tiles[k]=2}for(const x of[gx-1,gx+7])for(let y=gy;y<gy+3;y++)tiles[y*W+x]=2;
   P.sw=false;wp='bubbles';FISH.S.st='idle';said.length=0;msg='';FISH.click({x:(gx+3.5)*T,y:(gy+.5)*T});
   const until=performance.now()+4000;while(performance.now()<until&&FISH.S.st=='cast'){watch();await new Promise(r=>setTimeout(r,30))}
   for(let i=0;i<16;i++){watch();await new Promise(r=>setTimeout(r,30))}res[tries]={st:FISH.S.st,said:said.slice()};if(FISH.S.st!='wait'&&FISH.S.st!='bite')break}
  return res});
 const fishOk=Object.values(fish).every(r=>(r.st=='wait'||r.st=='bite')&&!r.said.some(m=>/water is gone/i.test(m)));ok('fishing: the bobber floats in a lake and waits for a bite (never "The water is gone")',fishOk,fish);
 const caught=await E(async()=>{const F=TOOLS8.FISH,n0=Object.keys(F.FISHES).reduce((s,k)=>s+cnt(+k),0);F.S.t=.05;await new Promise(r=>setTimeout(r,300));const bit=F.S.st;try{TOOLLV.set('bubbles',1,0)}catch(_){}F.click({x:F.S.x,y:F.S.y});const reel=F.S.st;const G=FISHGAME.G,t0=performance.now();while(F.S.st=='reel'&&performance.now()-t0<9000){G.fp=G.zp+G.zw/2;G.ft=G.fp;await new Promise(r=>setTimeout(r,16))}
  return{bit,reel,after:F.S.st,gained:Object.keys(F.FISHES).reduce((s,k)=>s+cnt(+k),0)-n0}});
 ok('fishing: a fish bites, clicking starts the reel mini-game and keeping it in the zone lands exactly one fish',caught.bit=='bite'&&caught.reel=='reel'&&caught.after=='idle'&&caught.gained==1,caught);
 await E(w=>{TOOLS8.FISH.S.st='idle';wp=w},wp0);
 // pets: flight draws the player a few px up/down each wingbeat; the pet must keep following (it used to snap to a fixed offset)
 const pet=await E(()=>{const o=document.createElement('canvas').getContext('2d'),r=[];for(const dy of[0,3,-3,6,-6]){COMP7.st.last=0;FX7.charmDraw(o,'mochi',P.x-cam.x,P.y-cam.y+dy,1,1);r.push(COMP7.st.last>0)}return r});
 ok('pets keep following you while the flight bob moves your sprite',pet.every(Boolean),pet);
 // underground music: 20 m+ = Echo Caves, 46 m+ = Ember Depths, back on the surface = the normal moods (fights still win)
 const mus=await E(()=>{const o={},x0=P.x,y0=P.y,tx=Math.floor(P.x/T);mobs.length=0;try{BOSS6.clear()}catch(_){}MUS7.calm();
  for(const [k,d] of [['surface',0],['d25',25],['d50',50]]){const ty=sh(tx)+d;P.y=ty*T-P.h;MUS7.detect();o[k]=MUS7.want}
  P.x=x0;P.y=y0;MUS7.detect();o.back=MUS7.want;o.songs=['mine','deep'].map(m=>MUS7.MOODS[m].songs.length);return o});
 ok('underground music: Echo Caves below 20 m, Ember Depths below 46 m, normal music on the surface',mus.surface!='mine'&&mus.surface!='deep'&&mus.d25=='mine'&&mus.d50=='deep'&&mus.back!='mine'&&mus.back!='deep'&&mus.songs[0]==3&&mus.songs[1]==2,mus);
 // every weather state renders sky (cached) + weather layers, day and night, and the pooled counts stay capped
 const wx=await E(async()=>{const bad=[];let mx2=0;for(const st of WX_STATES)for(const d of[.08,.5]){WX6.force=st;for(const s of WX_STATES)WX6.I[s]=s==st?1:0;clock=()=>d;await new Promise(r=>setTimeout(r,120));try{const c=document.createElement('canvas');c.width=640;c.height=360;const o=g;g=c.getContext('2d');try{SKY6.draw(640,360,performance.now());WX6.draw(640,360,performance.now())}finally{g=o}}catch(e){bad.push(st+':'+e.message)}mx2=Math.max(mx2,VFX.count)}
  WX6.force=null;return{bad,lc:LIFE8.counts}});ok('all weather states render (sky + precipitation + fog + leaves + meteors), day and night',wx.bad.length==0,wx);
 ok('no page errors',errs.length==0,errs.join('|'));
 await b.close();console.log(fails?fails+' play test(s) FAILED':'all play tests passed');process.exit(fails?1:0)})();
