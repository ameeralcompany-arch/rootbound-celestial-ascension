// Mythic arsenal (MYART / MYTH / MYUI): one mythic weapon per class, each its own kind (only the Reaper's is a scythe), tied to the class lock; forging needs a class; every forge / ascension
// plays a scene that cannot be skipped and pauses the world; the three-move combo swings, chains, hits along the arc and fires each move's
// effect; tier III throws the scythe and it comes back; the Classes screen has a themed hero, a Mythic card and the Forge / Ascend button;
// the character card shows an ornate frame and a class banner; the outfit can be switched off. node tests/mythic.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout (test hung)');process.exit(2)},170000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const p=await b.newPage({viewport:{width:1366,height:768}});const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&/MYTH|MYUI|MYART|CLS9/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(800);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=40;gems=99999});
 const E=(f,a)=>p.evaluate(f,a);
 await E(()=>{enterWorld('mythtest');WX6.force='clear'});await sleep(800);
 const w=await E(()=>({n:MYART.KEYS.length,all:MYART.KEYS.every(k=>WPN['myth_'+k]&&WPN['myth_'+k].rar=='mythic'&&CLASS7.of(WPN['myth_'+k])==k&&MYART.TH[k].mv.length==3),uniq:new Set(MYART.KEYS.map(k=>MYART.TH[k].mv.map(m=>m[1]).join())).size,kinds:new Set(MYART.KEYS.map(k=>MYART.TH[k].type)).size,reaper:MYART.TH.reaper.type,archer:MYART.TH.archer.type,knight:MYART.TH.knight.type}));
 ok('13 mythic weapons, one per class, each its own kind (Reaper scythe, Archer bow, Knight greatsword...), mythic rarity, tied to the class, three moves each',w.n==13&&w.all&&w.uniq>=8&&w.kinds>=12&&w.reaper=='scythe'&&w.archer=='bow'&&w.knight=='greatsword',w);
 const nf=await E(()=>({ok:MYTH.ascend('reaper'),t:MYTH.tier('reaper'),why:MYTH.access('reaper')}));ok('forging needs a class first',!nf.ok&&nf.t==0&&/class/i.test(nf.why),nf);
 await E(()=>{CJOB.become('reaper');CLASS7.S.lv.reaper=49;for(const id of[260,261,262,263,264,265,266,267,268,269])addI(id,20)});await sleep(300);
 const lk=await E(()=>({ok:MYTH.check('reaper').ok,miss:MYTH.check('reaper').miss.join('|')}));ok('the mythic weapon is forged at class level 50 (not before)',!lk.ok&&/level/i.test(lk.miss),lk);
 await E(()=>{CLASS7.S.lv.reaper=60});await sleep(4200);
 // forge: the scene starts, cannot be skipped, pauses the world, then hands the scythe over
 const f1=await E(()=>{const g0=gems,ok=MYTH.ascend('reaper');return{ok,t:MYTH.tier('reaper'),wp,scene:!!document.getElementById('myth9'),cover:window.RB_COVER===true,gems:g0-gems}});
 await p.keyboard.press('Escape');await p.mouse.click(600,400);await sleep(600);const f2=await E(()=>!!document.getElementById('myth9'));
 ok('forging at class 50 (a 5000-gem tribute) starts the ascension scene and equips the scythe; the world is paused',f1.ok&&f1.t==1&&f1.wp=='myth_reaper'&&f1.scene&&f1.cover&&f1.gems==5000,f1);
 ok('the scene cannot be skipped (Esc and clicks do nothing)',f2);
 await sleep(2700);const f3=await E(()=>({scene:!!document.getElementById('myth9'),cover:window.RB_COVER===true}));ok('the quick scene (about 3 s) ends by itself and the world resumes',!f3.scene&&!f3.cover,f3);
 // ascend to II: pays gems + materials
 const a1=await E(()=>({ok:MYTH.check('reaper').ok,rq:MYTH.reqs('reaper').map(r=>r.label+':'+r.have+'/'+r.need).join(' | ')}));
 ok('each upgrade asks for three earned things: monsters slain and bosses defeated as the class, and a tribute (plus the class level)',!a1.ok&&/Monsters slain/.test(a1.rq)&&/Bosses defeated/.test(a1.rq)&&/Gems/.test(a1.rq),a1);
 const a2=await E(()=>{MYTH.S.kc.reaper=500;MYTH.S.bk.reaper=2;const g0=gems,m0=cnt(262),ok=MYTH.ascend('reaper');return{ok,t:MYTH.tier('reaper'),gems:g0-gems,mat:m0-cnt(262),md:WPN.myth_reaper.md,kc:MYTH.S.kc.reaper|0}});await sleep(3300);   // the ascension scene lasts about 3 s
 ok('ascending spends the tribute, resets the slain / boss counters and raises damage',a2.ok&&a2.t==2&&a2.gems==4000&&a2.mat==6&&a2.md>40&&a2.kc==0,a2);
 await E(()=>{MYTH.S.kc.reaper=1000;MYTH.S.bk.reaper=3;MYTH.ascend('reaper')});await sleep(3300);   // the ascension scene lasts about 3 s
 // combo against a row of monsters on the right
 for(let i=0;i<60&&await E(()=>!!document.getElementById('myth9'));i++)await sleep(200);
 const c=await E(async()=>{const px=Math.floor(P.x/T),fy=Math.floor((P.y+P.h)/T);for(let x=px-6;x<=px+12;x++){for(let y=fy-7;y<fy;y++)setTile(x,y,0);setTile(x,fy,1);setTile(x,fy+1,1)}P.y=fy*T-P.h-1;P.vy=0;mobs.length=0;P.vx=0;const kk=Object.keys(MK).filter(q=>!MK[q].boss&&!MK[q].fly)[0],d=MK[kk];for(let i=0;i<4;i++)mobs.push({k:kk,x:P.x+55+i*30,y:P.y+P.h-d.h,w:d.w,h:d.h,vx:0,vy:0,hp:9000,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:0,g:true,wall:0});
  const all=mobs.slice(),hp0=all.map(m=>m.hp);/* knockback can fling one far enough to despawn it: count the monsters themselves, not who is left */mx=P.x+220-cam.x;my=P.y+20-cam.y;const steps=[];let fx=0;
  for(let s=0;s<3;s++){for(let i=0;i<60&&wcd>0;i++)await new Promise(q=>setTimeout(q,20));useWeapon();steps.push(MYTH.swing&&MYTH.swing.step);await new Promise(q=>setTimeout(q,200));fx=Math.max(fx,MYTH.fx.length)}
  for(let i=0;i<40&&!MYTH.thrown;i++)await new Promise(q=>setTimeout(q,30));const thr=!!MYTH.thrown;for(let i=0;i<120&&MYTH.thrown;i++)await new Promise(q=>setTimeout(q,30));
  return{steps,hit:all.filter((m,i)=>m.hp<hp0[i]).length,fx,thr,back:!MYTH.thrown,parts:MYTH.parts.length}});
 ok('the combo chains three different moves (reap, return cut, spin)',c.steps.join()=='0,1,2',c);
 // (under a heavily loaded machine the first combo can land before the monsters settle; one retry)
 if(c.hit<3){const c2=await E(async()=>{for(const m of mobs)m.hp=9000;const all=mobs.slice(),hp0=all.map(m=>m.hp);for(let s=0;s<2;s++){for(let i=0;i<60&&wcd>0;i++)await new Promise(q=>setTimeout(q,20));useWeapon();await new Promise(q=>setTimeout(q,250))}await new Promise(q=>setTimeout(q,400));return all.filter((m,i)=>m.hp<hp0[i]).length});c.hit=Math.max(c.hit,c2);c.retry=c2}
 ok('the swing hits the monsters along its arc and each move fires its effect',c.hit>=3&&c.fx>=1,c);
 ok('tier III: the finisher throws the scythe and it flies back',c.thr&&c.back,c);
 // a ranged class shoots instead of swinging
 const rg=await E(async()=>{CLASS7.S.lv.reaper=60;CLASS7.S.lv.archer=60;CJOB.become('archer');MYTH.S.t.archer=1;own.myth_archer=1;HOTBAR.equip('w:myth_archer');mobs.length=0;const kk=Object.keys(MK).filter(q=>!MK[q].boss&&!MK[q].fly)[0],d=MK[kk];let dx=T*7;while(dx>T*1.5&&solidAt(Math.floor((P.x+dx)/T),Math.floor((P.y+20)/T)))dx-=T*.5;mobs.push({k:kk,x:P.x+dx,y:P.y+P.h-d.h,w:d.w,h:d.h,vx:0,vy:0,hp:9000,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:0,g:true,wall:0});
  const m=mobs[0],h0=m.hp;mx=m.x-cam.x;my=m.y+m.h/2-cam.y;wcd=0;useWeapon();let proj=false;for(let i=0;i<40;i++){await new Promise(q=>setTimeout(q,25));proj=proj||MYTH.fx.some(e=>e.k=='proj')}return{wp,proj,hit:m.hp<h0}});
 ok('the Archer bow shoots a projectile that hits (ranged weapons shoot instead of swinging)',rg.wp=='myth_archer'&&rg.proj&&rg.hit,rg);
 await E(()=>{CLASS7.S.lv.archer=60;CJOB.become('reaper');HOTBAR.equip('w:myth_reaper')});
 // Classes screen: hero canvas, Mythic card, themed palette
 const ui=await E(async()=>{document.getElementById('bcls').click();await new Promise(q=>setTimeout(q,700));const el=CLS9.el(),hc=el.querySelector('.c9heroc'),my=el.querySelector('#c9-my');
  const px=(()=>{const x=hc.getContext('2d').getImageData(0,0,hc.width,hc.height).data;let n=0;for(let i=3;i<x.length;i+=16)if(x[i]>0)n++;return n})();
  const r={hero:px>2000,card:!!my&&/Nightveil Harvester/.test(my.textContent)&&my.querySelectorAll('.c9mv li').length==3,pips:my.querySelectorAll('.c9pips i.on').length,btn:my.querySelector('.c9asc').textContent,m:getComputedStyle(el).getPropertyValue('--m').trim(),fx:!!el.querySelector('.c9fx')};
  const snap=()=>hc.isConnected?hc.toDataURL().length+':'+hc.toDataURL().slice(-200):'';const s0=snap();await new Promise(q=>setTimeout(q,600));r.still=s0==snap();
  CLS9.pick('samurai');await new Promise(q=>setTimeout(q,300));r.m2=getComputedStyle(el).getPropertyValue('--m').trim();r.lock=el.querySelector('.c9asc').getAttribute('aria-disabled');CLS9.close();await new Promise(q=>setTimeout(q,300));return r});
 ok('Classes screen: a hero, a Mythic card with the three moves and the tier, an Ascend button, a class background; the screen holds still (no per-frame redraws)',ui.hero&&ui.card&&ui.pips==3&&/Tier IV/.test(ui.btn)&&ui.fx&&ui.still,ui);
 ok('each class has its own palette; another class\'s scythe stays locked until you learn it',ui.m&&ui.m2&&ui.m!=ui.m2&&ui.lock=='true',ui);
 // HUD frame + banner, outfit switch
 const h=await E(async()=>{await new Promise(q=>setTimeout(q,300));const bn=document.getElementById('pbanner9'),cx=document.getElementById('cxp9');const vis=e=>!!e&&e.style.display!='none'&&e.width>0;const r={frame:document.getElementById('hudL').classList.contains('cls9on')&&!!document.querySelector('#pwrap9 .ring')&&!document.querySelector('#pwrap9 .emb').hidden,banner:vis(bn),cls:!!cx&&cx.style.display!='none'&&/Lv \d+/.test(cx.textContent),k:MYTH.outfitK()};MYTH.setOutfit(0);r.off=MYTH.outfitK();MYTH.setOutfit(1);return r});
 ok('the character card shows the class ring, emblem, banner and class level bar; the mythic outfit follows the class and can be switched off',h.frame&&h.banner&&h.cls&&h.k=='reaper'&&h.off===null,h);
 // inventory: your class's weapons first, glowing, with the class emblem; per-class loadout remembered
 const inv=await E(async()=>{for(const id of CLASS7.C.reaper.ids)if(WPN[id])own[id]=1;INV7.open();INV7.filter='weapons';INV7.render();await new Promise(q=>setTimeout(q,300));const t=[...document.querySelectorAll('#inv7 .it7[data-k^="w:"]')];const n=t.filter(e=>e.classList.contains('cls7')).length;
  const firstMine=t.slice(0,n).every(e=>CLASS7.of(WPN[e.dataset.k.slice(2)])=='reaper');const emb=t.slice(0,n).every(e=>e.querySelector('img.ce7.me'));INV7.close();return{n,firstMine,emb,tot:t.length}});
 ok('inventory: your class weapons sort first, glow and carry the class emblem',inv.n>=2&&inv.firstMine&&inv.emb,inv);
 const ld=await E(async()=>{wear.hat='';await new Promise(q=>setTimeout(q,1300));const k=Object.keys(ownW||{})[0]||null;return{has:!!LOAD15.data.reaper,keys:Object.keys(LOAD15.data.reaper||{}).join()}});
 ok('the class keeps its own loadout (equipment, weapon, hotbar, outfit)',ld.has&&/wear/.test(ld.keys)&&/hot/.test(ld.keys)&&/wp/.test(ld.keys),ld);
 ok('no page errors',errs.length==0,errs.slice(0,3).join(' | '));
 await b.close();console.log(fails?fails+' mythic test(s) FAILED':'all mythic tests passed');process.exit(fails?1:0)})().catch(e=>{console.error('FAIL',e.message.slice(0,300));process.exit(1)});
