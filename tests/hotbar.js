// 7-slot hotbar: keys 1-7 + wheel, assign anything (click flow, slot buttons, drag & drop), each slot's use does the right thing,
// clear, used-up stacks stay greyed, under-level weapons locked, layout persists, old saves get the default layout,
// 6-slot saves migrate to 7 slots (items stay put, slot 7 = Twiggy unless it is already on the bar). node tests/hotbar.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const guest=()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))};
async function enter(p,world){await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await p.waitForTimeout(300);await p.evaluate(w=>enterWorld(w),world||'hbtest');await p.waitForTimeout(900)}
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
 await p.addInitScript(guest);await enter(p);const E=(f,a)=>p.evaluate(f,a);
 const env=await E(()=>{lvl=20;WX6.force='clear';mobs.length=0;own.cinder=1;own.solarfang=1;const gun=GUN9.IDS.filter(id=>GUN9.GUNS.has(id)&&(WPN[id].lv|0)<=20&&id!='rocket')[0];own[gun]=1;own.sniper=1;
  const stone=+Object.keys(BLK).find(k=>BLK[k]&&BLK[k][0]=='Stone');inv[1]=40;inv[stone]=5;renderBar();return{gun,stone,sniperLv:WPN.sniper.lv}});
 await p.waitForTimeout(200);
 // ---- structure + default layout
 const st=await E(()=>({n:document.querySelectorAll('#bar .s6').length,slots:HOTBAR.slots,keys:[...document.querySelectorAll('#bar .s6 .k6')].map(e=>e.textContent).join('')}));
 ok('seven hotbar slots labelled 1-7',st.n==7&&st.keys=='1234567',st);
 ok('default layout: 1 weapon, 2 Pip, 3 Pebble, 4 Glimmer, 5 a block, 6 Bubbles, 7 Twiggy',/^w:/.test(st.slots[0])&&st.slots[1]=='w:pip'&&st.slots[2]=='w:pebble'&&st.slots[3]=='w:glimmer'&&typeof st.slots[4]=='number'&&st.slots[5]=='w:bubbles'&&st.slots[6]=='w:twiggy',st.slots);
 // ---- keys 1-7 select
 const keys=[];for(let i=0;i<7;i++){await p.keyboard.press(String(i+1));await p.waitForTimeout(60);keys.push(await E(()=>({c:HOTBAR.cur,on:[...document.querySelectorAll('#bar .s6')].findIndex(e=>e.classList.contains('on')),wp})))}
 ok('keys 1-7 select their slot (and highlight it)',keys.every((k,i)=>k.c==i&&k.on==i),keys);
 ok('key 2 holds Pip, key 6 Bubbles, key 7 Twiggy, key 5 (block) empties the hand',keys[1].wp=='pip'&&keys[5].wp=='bubbles'&&keys[6].wp=='twiggy'&&keys[4].wp=='fist',keys.map(k=>k.wp));
 await p.keyboard.press('8');await p.waitForTimeout(60);await p.keyboard.press('9');await p.waitForTimeout(60);ok('keys 8-9 do not switch anything',await E(()=>HOTBAR.cur)==6);
 ok('selecting a slot shows the name pill',await E(()=>{const e=document.querySelector('#bar .pill6');return e.classList.contains('on')&&/Twiggy/.test(e.textContent)}));
 // ---- wheel
 await p.mouse.move(640,200);await p.keyboard.press('3');const c0=await E(()=>HOTBAR.cur);await p.mouse.wheel(0,120);await p.waitForTimeout(160);const c1=await E(()=>HOTBAR.cur);await p.mouse.wheel(0,-120);await p.waitForTimeout(160);const c2=await E(()=>HOTBAR.cur);
 await p.keyboard.press('1');await p.mouse.wheel(0,-120);await p.waitForTimeout(160);const c3=await E(()=>HOTBAR.cur);
 ok('mouse wheel cycles the seven slots both ways (and wraps)',c0==2&&c1==3&&c2==2&&c3==6,[c0,c1,c2,c3]);
 // ---- assign: select an item in the inventory, press a number
 await p.keyboard.press('i');await p.waitForTimeout(350);
 await E(()=>INV7.filter='weapons');await E(()=>INV7.render());await p.click('#inv7 [data-k="w:cinder"]');await p.waitForTimeout(80);await p.keyboard.press('1');await p.waitForTimeout(80);
 ok('click flow: select Cinder, press 1 → slot 1',await E(()=>HOTBAR.slots[0]=='w:cinder'),await E(()=>HOTBAR.slots));
 ok('the inventory tile shows which slot it sits in',await E(()=>{const t=document.querySelector('#inv7 [data-k="w:cinder"] .hbn7');return!!t&&t.textContent=='1'}));
 // slot buttons in the details
 await E(()=>{INV7.filter='all';INV7.render()});await p.click('#inv7 [data-k="'+env.stone+'"]');await p.waitForTimeout(80);await p.click('#inv7 aside [data-a="hb4"]');await p.waitForTimeout(80);
 ok('details "Hotbar slot" buttons put Stone in slot 5',await E(s=>HOTBAR.slots[4]===s,env.stone),await E(()=>HOTBAR.slots));
 await p.click('#inv7 aside [data-a="hb4"]');await p.waitForTimeout(80);ok('clicking its own slot button again takes it off the bar',await E(()=>HOTBAR.slots[4]===null));
 await p.click('#inv7 [data-k="1"]');await p.waitForTimeout(80);await p.click('#inv7 aside [data-a="hb4"]');await p.waitForTimeout(80);ok('Dirt → slot 5',await E(()=>HOTBAR.slots[4]===1));
 // select an item, then click a hotbar slot
 await E(()=>{INV7.filter='tools';INV7.render()});await p.click('#inv7 [data-k="w:twiggy"]');await p.waitForTimeout(60);await p.click('#bar .s6[data-i="2"]');await p.waitForTimeout(80);
 ok('select Twiggy, click hotbar slot 3 → slot 3',await E(()=>HOTBAR.slots[2]=='w:twiggy'),await E(()=>HOTBAR.slots));
 // assign mode: click a hotbar slot with nothing selected, then pick an item
 await E(()=>{INV7.selK=null;INV7.filter='tools';INV7.render()});await p.click('#bar .s6[data-i="2"]');await p.waitForTimeout(120);const asg=await E(()=>INV7.assign);await p.click('#inv7 [data-k="w:pebble"]');await p.waitForTimeout(80);
 ok('assign mode: click a slot, then an item (Pebble back to slot 3)',asg==2&&await E(()=>HOTBAR.slots[2]=='w:pebble'),[asg,await E(()=>HOTBAR.slots)]);
 // drag & drop a gun from the inventory onto slot 4
 await E(()=>{INV7.selK=null;INV7.filter='weapons';INV7.render()});await p.dragAndDrop('#inv7 [data-k="w:'+env.gun+'"]','#bar .s6[data-i="3"]');await p.waitForTimeout(120);
 ok('drag & drop: '+env.gun+' from the inventory onto slot 4',await E(g=>HOTBAR.slots[3]=='w:'+g,env.gun),await E(()=>HOTBAR.slots));
 ok('drag state is cleaned up after the drop',await E(()=>!document.documentElement.classList.contains('hbdrag')&&!document.querySelector('#bar .s6.over')));
 // drag a slot onto another slot swaps them
 await p.dragAndDrop('#bar .s6[data-i="3"]','#bar .s6[data-i="5"]');await p.waitForTimeout(100);const sw=await E(()=>HOTBAR.slots);
 ok('drag slot 4 onto slot 6 swaps them',sw[5]=='w:'+env.gun&&sw[3]=='w:bubbles',sw);
 await p.dragAndDrop('#bar .s6[data-i="5"]','#bar .s6[data-i="3"]');await p.waitForTimeout(100);
 // typing in the inventory search never triggers slot keys (even with an item selected)
 await E(()=>{INV7.selK='w:solarfang';INV7.render()});const before=await E(()=>JSON.stringify([HOTBAR.slots,HOTBAR.cur]));await E(()=>document.getElementById('inq7').focus());await p.keyboard.type('2345');await p.waitForTimeout(120);
 ok('typing digits in the inventory search does not select or assign slots',await E(()=>JSON.stringify([HOTBAR.slots,HOTBAR.cur]))==before);
 await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.waitForTimeout(300);ok('inventory closed',await E(()=>!showInv));
 // wheel over the open inventory never switches slots
 await p.keyboard.press('i');await p.waitForTimeout(300);const cw=await E(()=>HOTBAR.cur);await p.mouse.move(640,360);await p.mouse.wheel(0,120);await p.waitForTimeout(150);ok('wheel over the inventory panel does not switch slots',await E(()=>HOTBAR.cur)==cw);
 await p.keyboard.press('Escape');await p.waitForTimeout(300);
 // ---- using each slot (real mouse input through the game loop)
 const scr=k=>E(k=>{const x=k%W,y=k/W|0;return{x:((x*T+T/2-cam.x)*ZM)*innerWidth/cv.width,y:((y*T+T/2-cam.y)*ZM)*innerHeight/cv.height}},k);
 const spot=await E(()=>{P.vx=0;const px=Math.floor(P.x/T),py=Math.floor((P.y+P.h-1)/T);for(const dx of[2,-2,3,-3]){const k=py*W+px+dx,u=(py-1)*W+px+dx;if(!tiles[k]&&!tiles[u]&&!trees.has(k)){return k}}const k=py*W+px+2;tiles[k]=0;return k});
 // block: left click places it and uses one
 await p.keyboard.press('5');await p.waitForTimeout(80);let s=await scr(spot);await p.mouse.move(s.x,s.y);const n0=await E(()=>cnt(1));await p.mouse.down();await p.waitForTimeout(120);await p.mouse.up();await p.waitForTimeout(60);
 const pl=await E(k=>({t:tiles[k],n:cnt(1)}),spot);ok('block slot: left click places the block (and uses one)',pl.t==1&&pl.n==n0-1,[pl,n0]);
 // tool: Pebble breaks stone in one hit
 await E(([k,st])=>{tiles[k]=st;hp[k]=BLK[st][2]},[spot,env.stone]);await p.keyboard.press('3');await p.waitForTimeout(80);await E(()=>{wcd=0});await p.mouse.down();await p.waitForTimeout(150);await p.mouse.up();
 ok('tool slot (Pebble): left click breaks stone',await E(k=>!tiles[k],spot),await E(k=>[tiles[k],wp],spot));
 // weapon: Cinder (slot 1) damages a monster, never the block
 await E(k=>{tiles[k]=1;hp[k]=BLK[1][2]},spot);
 // a sturdy, stunned slime right in front of the player (the side of the test block), the cursor on it
 const mob=k=>E(k=>{mobs.length=0;P.vx=0;const d=MK.slime,f=(k%W)*T+T/2>=P.x?1:-1;const m={k:'slime',x:P.x+f*44,y:P.y+P.h-d.h,w:d.w,h:d.h,vx:0,vy:0,hp:99999,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:0,g:true,wall:0,stun:99};mobs.push(m);window._hm=m;
  return{x:((m.x-cam.x)*ZM)*innerWidth/cv.width,y:((m.y+m.h/2-cam.y)*ZM)*innerHeight/cv.height}},k);
 let ms=await mob(spot);await p.mouse.move(ms.x,ms.y);await p.keyboard.press('1');await p.waitForTimeout(80);
 for(let a=0;a<3&&await E(()=>_hm.hp>=99999);a++){if(a){ms=await mob(spot);await p.mouse.move(ms.x,ms.y)}await E(()=>{wcd=0});await p.mouse.down();await p.waitForTimeout(400);await p.mouse.up();await p.waitForTimeout(60)}
 const hit=await E(k=>({hp:_hm.hp,blk:tiles[k],wp}),spot);ok('weapon slot (Cinder): left click damages a monster and leaves the block',hit.wp=='cinder'&&hit.hp<99999&&hit.blk==1,hit);
 // gun: aims and fires
 ms=await mob(spot);await p.mouse.move(ms.x,ms.y);await p.keyboard.press('4');await p.waitForTimeout(80);const g0=await E(()=>({a:GUN9.alive,hp:_hm.hp}));await E(()=>{wcd=0});await p.mouse.down();await p.waitForTimeout(350);await p.mouse.up();await p.waitForTimeout(200);
 const g1=await E(()=>({a:GUN9.alive,hp:_hm.hp,wp}));ok('gun slot ('+env.gun+'): left click fires',g1.wp==env.gun&&(g1.hp<g0.hp||g1.a!=g0.a),[g0,g1]);
 await E(()=>{mobs.length=0});
 // rod: Bubbles casts into water
 const pool=await E(()=>{const px=Math.floor(P.x/T),gx=px+3,gy=sh(gx);for(let x=gx;x<gx+7;x++)for(let y=gy;y<gy+3;y++){const k=y*W+x;tiles[k]=0;wl[k]=8}for(let x=gx-1;x<gx+8;x++){const k=(gy+3)*W+x;if(!tiles[k])tiles[k]=2}for(const x of[gx-1,gx+7])for(let y=gy;y<gy+3;y++)tiles[y*W+x]=2;P.sw=false;TOOLS8.FISH.S.st='idle';return(gy+1)*W+gx+3});
 const bi=await E(()=>HOTBAR.slotOf('w:bubbles'));await p.keyboard.press(String(bi+1));await p.waitForTimeout(80);s=await scr(pool);await p.mouse.move(s.x,s.y);await E(()=>{wcd=0});await p.mouse.down();await p.waitForTimeout(60);await p.mouse.up();await p.waitForTimeout(60);
 ok('rod slot (Bubbles): left click casts the line',await E(()=>wp=='bubbles'&&TOOLS8.FISH.S.st!='idle'),await E(()=>[wp,TOOLS8.FISH.S.st]));await E(()=>{TOOLS8.FISH.S.st='idle'});
 // ---- clear: right-click a slot
 await p.click('#bar .s6[data-i="2"]',{button:'right'});await p.waitForTimeout(80);
 ok('right-click clears a slot (and it shows as empty)',await E(()=>HOTBAR.slots[2]===null&&document.querySelector('#bar .s6[data-i="2"]').classList.contains('st-empty')));
 await p.keyboard.press('3');await p.waitForTimeout(60);ok('an empty slot holds fists',await E(()=>wp=='fist'&&HOTBAR.cur==2));
 // inventory "Equip" puts a weapon that is not on the bar into the first empty slot and holds it
 await E(()=>{HOTBAR.pick(0,1);INV7.open('weapons')});await p.waitForTimeout(300);await p.click('#inv7 [data-k="w:solarfang"]');await p.waitForTimeout(80);
 const eqL=await E(()=>document.querySelector('#inv7 aside [data-a="equip"]').textContent);await p.click('#inv7 aside [data-a="equip"]');await p.waitForTimeout(80);
 const eq=await E(()=>({i:HOTBAR.slotOf('w:solarfang'),c:HOTBAR.cur,wp,lbl:document.querySelector('#inv7 aside [data-a="equip"]').textContent}));
 ok('inventory Equip ("'+eqL+'") fills the empty slot 3 and holds it',/slot 3/.test(eqL)&&eq.i==2&&eq.c==2&&eq.wp=='solarfang'&&eq.lbl=='Equipped',eq);
 await E(()=>{INV7.close();HOTBAR.clear(2)});await p.waitForTimeout(300);
 // ---- a stack that runs out stays in its slot, greyed, and does nothing
 const out=await E(async([k,st])=>{inv[st]=1;HOTBAR.set(2,st,{quiet:1});HOTBAR.pick(2,1);tiles[k]=0;return 1},[spot,env.stone]);
 s=await scr(spot);await p.mouse.move(s.x,s.y);await p.mouse.down();await p.waitForTimeout(100);await p.mouse.up();await p.waitForTimeout(350);
 const o1=await E(([k,st])=>({t:tiles[k],n:cnt(st),slot:HOTBAR.slots[2],cls:document.querySelector('#bar .s6[data-i="2"]').className,cnt:document.querySelector('#bar .s6[data-i="2"] .n6').textContent}),[spot,env.stone]);
 await E(k=>{tiles[k]=0},spot);await p.mouse.down();await p.waitForTimeout(100);await p.mouse.up();await p.waitForTimeout(60);
 const o2=await E(k=>({t:tiles[k],msg:String(msg),wp}),spot);
 ok('last block placed: the slot keeps it, greyed with 0 (not swapped)',o1.t==env.stone&&o1.n==0&&o1.slot==env.stone&&/st-out/.test(o1.cls)&&o1.cnt=='0',o1);
 ok('clicking with a used-up slot places nothing and says why',!o2.t&&/Out of/.test(o2.msg)&&o2.wp=='fist',o2);
 await E(st=>{addI(st,3)},env.stone);await p.waitForTimeout(350);/* the HUD refreshes on a 120 ms tick */ok('getting more of it lights the slot up again',await E(()=>/st-ok/.test(document.querySelector('#bar .s6[data-i="2"]').className)));
 // ---- under-level weapon: locked, cannot be used
 const lk=await E(lv=>{HOTBAR.set(2,'w:sniper',{quiet:1});HOTBAR.pick(2,1);const e=document.querySelector('#bar .s6[data-i="2"]');return{cls:e.className,txt:e.querySelector('.n6').textContent,wp,lock:getComputedStyle(e.querySelector('.lk6')).display}},env.sniperLv);
 ok('under-level weapon shows locked (Lv '+env.sniperLv+', lock badge) and is not held',/st-lock/.test(lk.cls)&&lk.txt=='Lv '+env.sniperLv&&lk.lock!='none'&&lk.wp!='sniper',lk);
 const a0=await E(()=>{msg='';return GUN9.alive});await p.mouse.down();await p.waitForTimeout(200);await p.mouse.up();await p.waitForTimeout(100);
 const lu=await E(()=>({a:GUN9.alive,msg:String(msg),wp}));ok('using a locked slot shows the level gate message and fires nothing',lu.a==a0&&/Reach level/.test(lu.msg)&&lu.wp!='sniper',[a0,lu]);
 await E(()=>{lvl=40});await p.waitForTimeout(150);ok('reaching the level unlocks the held slot',await E(()=>wp=='sniper'&&/st-ok/.test(document.querySelector('#bar .s6[data-i="2"]').className)));await E(()=>{lvl=20});await p.waitForTimeout(150);
 ok('dropping below the level again locks it (hand falls back)',await E(()=>wp!='sniper'));
 // ---- wearable slot toggles it on / off
 const wr=await E(()=>{const id=Object.keys(WEAR).find(k=>WEAR[k].s=='hat');ownW[id]=1;wear.hat='';HOTBAR.set(2,'a:'+id,{quiet:1});const c=HOTBAR.cur;HOTBAR.pick(2,1);const on=wear.hat==id;HOTBAR.pick(2,1);return{on,off:wear.hat=='',c,c2:HOTBAR.cur}});
 ok('a wearable slot puts it on / takes it off without changing the held slot',wr.on&&wr.off&&wr.c==wr.c2,wr);
 // ---- external equip (store) follows the bar, perf: no rebuild of the bar on inventory change
 const ex=await E(async()=>{wp='solarfang';await new Promise(r=>setTimeout(r,80));const off=HOTBAR.cur;wp='cinder';await new Promise(r=>setTimeout(r,80));return{off,on:HOTBAR.cur,i:HOTBAR.slotOf('w:cinder')}});
 ok('equipping from elsewhere selects its slot, or no slot when it is not on the bar',ex.off==-1&&ex.on==ex.i,ex);
 const pf=await E(async()=>{const el=document.querySelector('#bar .s6[data-i="0"]');let m=0;const ob=new MutationObserver(r=>{m+=r.length});ob.observe(document.getElementById('bar'),{childList:true,subtree:true,attributes:true,characterData:true});for(let i=0;i<30;i++){barDirty=1;await new Promise(r=>requestAnimationFrame(r))}ob.disconnect();return{same:el===document.querySelector('#bar .s6[data-i="0"]'),m}});
 ok('the bar is patched, not rebuilt (no DOM changes while nothing changes)',pf.same&&pf.m==0,pf);
 // ---- persists across a reload of the saved data
 const lay=await E(()=>{HOTBAR.set(0,'w:solarfang',{quiet:1});HOTBAR.set(5,1,{quiet:1});HOTBAR.pick(3,1);saveP();return{s:HOTBAR.slots,c:HOTBAR.cur}});
 await enter(p);const lay2=await E(()=>({s:HOTBAR.slots,c:HOTBAR.cur,wp}));
 ok('layout and selected slot persist across a reload',JSON.stringify(lay.s)==JSON.stringify(lay2.s)&&lay.c==lay2.c,[lay,lay2]);
 ok('no page errors',errs.length==0,errs.join('|'));await ctx.close();
 // ---- an old save (before the hotbar) gets the default layout and loses nothing
 {const c2=await b.newContext({viewport:{width:1280,height:720}});const q=await c2.newPage();const qe=[];q.on('pageerror',x=>qe.push(x.message));
  const OLD={v:3,gems:1234,lvl:30,xp:5,inv:{1:20,3:42,8:7,101:4,205:2},own:{fist:1,cinder:1,solarfang:1,blood:1,hammer:1,popgun:1},ownW:{helmet:1},wear:{hat:'helmet',body:'',wing:'',boot:'',glove:''},wp:'hammer',bar:[3,8,0,0,0,0,0,0,0]};
  await q.addInitScript(o=>{if(!localStorage.getItem('hbseed')){localStorage.setItem('hbseed','1');localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}));localStorage.setItem('rbp',JSON.stringify(o));localStorage.setItem('rbpsw',JSON.stringify({w:'hammer',t:'glimmer'}))}},OLD);
  await enter(q,'hbold');
  const r=await q.evaluate(o=>({s:HOTBAR.slots,c:HOTBAR.cur,wp,own:Object.keys(o.own).every(k=>own[k]),inv:Object.keys(o.inv).every(k=>cnt(+k)>=o.inv[k]),gems,wear:wear.hat,stored:!!localStorage.getItem('rbphb')}),OLD);
  ok('old save: default layout (its weapon, Pip, Pebble, Glimmer, its selected block, Bubbles, Twiggy)',JSON.stringify(r.s)==JSON.stringify(['w:hammer','w:pip','w:pebble','w:glimmer',3,'w:bubbles','w:twiggy'])&&r.c==0&&r.wp=='hammer',r);
  ok('old save: every weapon, item, gem and worn item is kept',r.own&&r.inv&&r.gems>=1234&&r.wear=='helmet',r);
  ok('old save: the new layout is stored for next time',r.stored);
  ok('old save: no page errors',qe.length==0,qe.join('|'));await c2.close()}
 // ---- a 6-slot layout (v1) migrates to 7 slots: every slot stays where it was, slot 7 gets Twiggy (or stays empty if Twiggy is on the bar)
 for(const[name,six,want7]of[['without Twiggy',['w:cinder',1,'w:pip',null,'w:bubbles','w:pebble'],'w:twiggy'],['with Twiggy',['w:twiggy',1,'w:pip','w:glimmer','w:bubbles','w:pebble'],null]]){
  const c3=await b.newContext({viewport:{width:1280,height:720}});const q=await c3.newPage();const qe=[];q.on('pageerror',x=>qe.push(x.message));
  const SAVE={v:3,gems:50,lvl:10,inv:{1:20,3:5},own:{fist:1,cinder:1},ownW:{},wear:{hat:'',body:'',wing:'',boot:'',glove:''},wp:'pip',bar:[1,0,0,0,0,0,0,0,0]};
  await q.addInitScript(([o,s])=>{if(!localStorage.getItem('hbseed')){localStorage.setItem('hbseed','1');localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}));localStorage.setItem('rbp',JSON.stringify(o));localStorage.setItem('rbphb',JSON.stringify({v:1,s,c:2}))}},[SAVE,six]);
  await enter(q,'hbmig');
  const r=await q.evaluate(()=>({s:HOTBAR.slots,c:HOTBAR.cur,n:document.querySelectorAll('#bar .s6').length,st:JSON.parse(localStorage.getItem('rbphb'))}));
  ok('6-slot save '+name+': slots 1-6 unchanged, slot 7 = '+want7,JSON.stringify(r.s.slice(0,6))==JSON.stringify(six)&&r.s[6]===want7&&r.c==2&&r.n==7,r);
  ok('6-slot save '+name+': stored again as a 7-slot (v2) layout',r.st&&r.st.v==2&&r.st.s.length==7&&r.st.s[6]===want7,r.st);
  await q.keyboard.press('7');await q.waitForTimeout(80);const k7=await q.evaluate(()=>({c:HOTBAR.cur,wp}));ok('6-slot save '+name+': key 7 selects slot 7',k7.c==6&&(want7?k7.wp=='twiggy':k7.wp=='fist'),k7);
  ok('6-slot save '+name+': no page errors',qe.length==0,qe.join('|'));await c3.close()}
 await b.close();console.log(fails?fails+' hotbar test(s) FAILED':'all hotbar tests passed');process.exit(fails?1:0)})();
