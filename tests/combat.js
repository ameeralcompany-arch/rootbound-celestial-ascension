// Combat: guns + the new weapons (GUN9), level-gated weapons and level power (LVL9). Every new weapon equips when your level allows,
// fires and hurts a monster, guns never break blocks, under-level weapons cannot be bought / equipped / used, damage and HP grow
// with your level, bosses scale. Optional screenshots: set SHOTS=<folder>. node tests/combat.js
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',SHOTS=process.env.SHOTS||'';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},300000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
 const cerr=[];p.on('console',m=>{if(m.type()=='error')cerr.push(m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=1});await p.waitForTimeout(400);
 await p.evaluate(()=>{enterWorld('combattest')});await p.waitForTimeout(900);
 const E=(f,a)=>p.evaluate(f,a);
 await E(()=>{WX6.force='clear';mobs.length=0;gems=99999});await p.waitForTimeout(200);
 const IDS=await E(()=>GUN9.IDS);
 // --- data, store items, icons and held art
 const meta=await E(()=>{const bad=[];for(const id of GUN9.IDS){const w=WPN[id],it=SHOP7.byId.get('wpn_'+id);if(!w||!w.n||!w.d||!(w.md>0)||!(w.cd>0)||!(w.lv>=1)||!w.rar)bad.push('wpn '+id);if(!it||it.lv!==w.lv||it.price!==w.cost||!SHOP7.RAR.includes(it.rar))bad.push('store '+id);
   if(!(iconURL('w:'+id)||'').startsWith('data:image'))bad.push('icon '+id);const c=GUN9.art(id,40),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let px=0;for(let i=3;i<d.length;i+=4)if(d[i]>40)px++;if(px<120)bad.push('art '+id+' '+px);
   const k=CLASS7.of(w);if(!k)bad.push('class '+id)}
  const lv=GUN9.IDS.map(id=>WPN[id].lv),guns=GUN9.IDS.filter(id=>WPN[id].gun).length;return{bad,n:GUN9.IDS.length,guns,rising:lv.every((v,i)=>!i||lv[i-1]<=v),gs:CLASS7.of(WPN.sniper),rar:ITEM7.rar('w:sniper')}});
 ok('14 new weapons (8 guns): stats, level + rarity, store items, icons, cached held art, a class each',meta.n==14&&meta.guns==8&&meta.bad.length==0&&meta.rising&&meta.gs=='gunslinger',meta);
 // --- level gating
 const gate=await E(async()=>{lvl=1;const o={};o.buy=(await SHOP7.buy('wpn_sniper')).ok;o.has=SHOP7.has('wpn_sniper');own.sniper=1;o.eq=SHOP7.equip('wpn_sniper');o.wpEq=wp;
  wp='sniper';await new Promise(r=>setTimeout(r,150));o.reverted=wp!='sniper';o.msg=String(msg);
  const a0=GUN9.alive;wp='sniper';wcd=0;useWeapon();o.fired=GUN9.alive!=a0||GUN9.SH.sn;o.wp2=wp;
  INV7.open('weapons');await new Promise(r=>setTimeout(r,120));const t=document.querySelector('#inv7 [data-k="w:sniper"]');if(t)t.click();await new Promise(r=>setTimeout(r,80));o.lockBtn=/Reach level 28/.test(document.querySelector('#inv7 aside').textContent);o.tip=t&&/Lv 28/.test(t.title);INV7.close();
  o.storeLv=SHOP7.byId.get('wpn_sniper').lv==28&&!SHOP7.lvOk(SHOP7.byId.get('wpn_sniper'));delete own.sniper;wp='fist';return o});
 ok('under-level weapons: store refuses, equip refuses, a forced equip reverts with a message, cannot fire',gate.buy==0&&!gate.has&&gate.eq===false&&gate.reverted&&/level 28/i.test(gate.msg)&&!gate.fired&&gate.wp2!='sniper',gate);
 ok('inventory + store show the level requirement (tooltip, locked button)',gate.lockBtn&&gate.tip&&gate.storeLv,gate);
 const buy=await E(async()=>{lvl=30;gems=5000;const r=await SHOP7.buy('wpn_sniper');const o={ok:r.ok,gems,has:SHOP7.has('wpn_sniper')};o.eq=SHOP7.equip('wpn_sniper')&&wp=='sniper';delete own.sniper;wp='fist';gems=99999;return o});
 ok('at the right level a new weapon can be bought (gems charged) and equipped',buy.ok&&buy.gems==2500&&buy.has&&buy.eq,buy);
 // --- every new weapon fires and hurts a monster (no page errors)
 await E(()=>{lvl=60;for(const id of GUN9.IDS)own[id]=1;// a flat, open strip so nothing blocks the shots
  const px=Math.floor(P.x/T),fy=Math.floor((P.y+P.h-2)/T);for(let x=px-3;x<=px+10;x++){for(let y=fy-5;y<=fy;y++){const k=y*W+x;tiles[k]=0;wl[k]=0}const k=(fy+1)*W+x;tiles[k]=1;hp[k]=BLK[1][2]}P.vx=0});await p.waitForTimeout(400);
 const spawn=`(dx,dy)=>{mobs.length=0;const d=MK.slime,m={k:'slime',x:P.x+P.f*dx,y:P.y+P.h-d.h-(dy||0),w:d.w,h:d.h,vx:0,vy:0,hp:99999,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:0,g:false,wall:0,stun:99};mobs.push(m);mx=m.x-cam.x;my=m.y+m.h/2-cam.y;return m}`;
 const res={};
 for(const id of IDS){const r=await E(async([id,sp])=>{const mk=eval(sp);P.f=1;P.vx=0;wp=id;const melee=['emberfist','sakurakat','tidecaller','dragonaxe'].includes(id);const m=mk(melee?62:150,0);const h0=m.hp;
   for(let i=0;i<3;i++){m.stun=99;m.x=P.x+(melee?62:150);wcd=0;useWeapon();await new Promise(r=>setTimeout(r,id=='lumistaff'?700:260))}
   await new Promise(r=>setTimeout(r,500));return{d:Math.round(h0-m.hp),wp}},[id,spawn]);res[id]=r}
 const miss=IDS.filter(id=>!(res[id].d>0)||res[id].wp!=id);
 ok('every new weapon equips at level 60, fires and damages a monster',miss.length==0,miss.length?miss.map(id=>id+':'+JSON.stringify(res[id])).join(' '):IDS.map(id=>id+' '+res[id].d).join(', '));
 // --- special mechanics
 const spec=await E(async()=>{const o={};mobs.length=0;
  // sniper: charged shot pierces two monsters in a line, full charge hits harder than a tap
  const mk=(dx)=>{const d=MK.slime,m={k:'slime',x:P.x+dx,y:P.y+P.h-d.h,w:d.w,h:d.h,vx:0,vy:0,hp:99999,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:0,g:false,wall:0,stun:99};mobs.push(m);return m};
  const rnd=Math.random;Math.random=()=>.99;try{P.f=1;wp='sniper';const a=mk(120),b2=mk(200);mx=a.x-cam.x;my=a.y+a.h/2-cam.y;wcd=0;useWeapon();await new Promise(r=>setTimeout(r,120));const tap=99999-a.hp;o.pierce=a.hp<99999&&b2.hp<99999;
   a.hp=99999;mdL=true;wcd=0;useWeapon();await new Promise(r=>setTimeout(r,1300));mdL=false;await new Promise(r=>setTimeout(r,120));o.full=99999-a.hp;o.tap=tap;o.charged=o.full>tap*2}finally{Math.random=rnd;mdL=false}
  // shotgun: six pellets per shot
  mobs.length=0;wp='shotgun';wcd=0;const n0=GUN9.alive;useWeapon();o.pellets=GUN9.alive-n0;
  // revolver: the 6th shot is the blossom shot (longer reload)
  wp='revolver';GUN9.SH.rv=4;wcd=0;useWeapon();const w1=wcd;wcd=0;useWeapon();o.reload=wcd>w1*2;
  // pools stay bounded
  wp='smg';for(let i=0;i<400;i++){wcd=0;useWeapon()}o.pool=GUN9.alive<=GUN9.POOL.length;await new Promise(r=>setTimeout(r,1200));o.drained=GUN9.alive<20;wp='fist';return o});
 ok('Starpiercer: hold to charge (full charge > 2x a tap) and the beam pierces a line',spec.pierce&&spec.charged,spec);
 ok('Bubblebuss fires 6 pellets, revolver reloads after the 6th (blossom) shot, projectile pool stays bounded',spec.pellets==6&&spec.reload&&spec.pool&&spec.drained,spec);
 // --- guns never break blocks (bullets, pellets, rockets, beams, bolts)
 const blk=await E(async()=>{mobs.length=0;P.f=1;const px=Math.floor(P.x/T),py=Math.floor((P.y+P.h/2)/T),ks=[];for(let dx=3;dx<=4;dx++)for(let dy=-1;dy<=0;dy++){const k=(py+dy)*W+px+dx;tiles[k]=1;hp[k]=BLK[1][2];ks.push(k)}
  const tx=px+3,ty=py;const out={};for(const id of GUN9.IDS){wp=id;mx=tx*T+T/2-cam.x;my=ty*T+T/2-cam.y;for(let i=0;i<2;i++){wcd=0;useWeapon();await new Promise(r=>setTimeout(r,140))}}
  await new Promise(r=>setTimeout(r,900));out.intact=ks.every(k=>tiles[k]==1);out.n=ks.filter(k=>tiles[k]==1).length;for(const k of ks)tiles[k]=0;wp='fist';return out});
 ok('guns and the new weapons never break blocks',blk.intact,blk);
 // --- level power: damage + max HP grow with level, bosses scale up too
 const lp=await E(()=>{const rnd=Math.random;Math.random=()=>.99;const o={};try{const w=WPN.popgun;wp='popgun';const mk=()=>{const d=MK.slime;const m={k:'slime',x:P.x+400,y:P.y,w:d.w,h:d.h,vx:0,vy:0,hp:99999,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:0,g:false,wall:0};mobs.push(m);return m};
   lvl=1;let m=mk();hurtMob(m,dmgM(w),w,0);o.d1=99999-m.hp;o.hp1=maxHP();o.arm1=bonus().arm;
   lvl=50;m=mk();hurtMob(m,dmgM(w),w,0);o.d50=99999-m.hp;o.hp50=maxHP();o.arm50=bonus().arm;
   lvl=200;m=mk();hurtMob(m,dmgM(w),w,0);o.d200=99999-m.hp;o.info=LVL9.info();
   Math.random=rnd;const boss=L=>{lvl=L;for(let i=0;i<20;i++){mobs.length=0;BOSS6.clear();if(BOSS6.spawn('warden'))break}const m=BOSS6.active(),v=m?m.mhp/MK.boss_warden.hp:0;mobs.length=0;BOSS6.clear();return v};o.b1=boss(1);o.b50=boss(50);lvl=50}finally{Math.random=rnd}return o});
 ok('damage at level 50 > level 1 (and keeps growing, softly capped), max HP + armor grow too',lp.d50>lp.d1*1.6&&lp.d200>lp.d50&&lp.d200<lp.d1*2.6&&lp.hp50>lp.hp1&&lp.arm50>lp.arm1,lp);
 ok('bosses get tougher with your level, but slower than your damage',lp.b50>lp.b1&&lp.b50/lp.b1<lp.d50/lp.d1,lp);
 // --- profile shows level power; stats tab too
 const ui=await E(async()=>{lvl=40;UI6.open('profile');await new Promise(r=>setTimeout(r,200));const t=document.getElementById('hubbody').textContent;UI6.close&&UI6.close();try{document.getElementById('hubx').click()}catch(_){}
  INV7.open('stats');await new Promise(r=>setTimeout(r,150));const s=document.querySelector('#inv7').textContent;INV7.close();return{prof:/Level power/.test(t)&&/Damage\+\d+%/.test(t.replace(/\s/g,'')),stats:/Level power/.test(s)}});
 ok('Profile and inventory Stats show the level power bonus',ui.prof&&ui.stats,ui);
 // --- screenshots (headless): each gun held + firing, plus the icon sheet
 if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await E(()=>{lvl=60;mobs.length=0;setZoom(2);const s=document.createElement('style');s.textContent='#banner,[id^=cine7]{display:none!important}';document.head.appendChild(s)});await p.waitForTimeout(500);
  for(const id of IDS){const melee=['emberfist','sakurakat','tidecaller','dragonaxe'].includes(id);await E(([id,sp,melee])=>{const mk=eval(sp);wp=id;P.f=1;P.vx=0;const m=mk(melee?70:300,20);m.stun=99;wcd=0;useWeapon();if(id=='lumistaff'){setTimeout(()=>{wcd=0;useWeapon()},300)}GUN9.SH.last=performance.now()},[id,spawn,melee]);await p.waitForTimeout(id=='lumistaff'?560:id=='rocket'?200:melee?90:60);
   const c=await E(()=>({x:((P.x-cam.x)*ZM)*innerWidth/cv.width,y:((P.y+P.h/2-cam.y)*ZM)*innerHeight/cv.height}));
   await p.screenshot({path:path.join(SHOTS,'held-'+id+'.png'),clip:{x:Math.max(0,c.x-260),y:Math.max(0,c.y-200),width:560,height:340}})}
  await E(()=>{setZoom(1);const d=document.createElement('div');d.id='icsheet';d.style.cssText='position:fixed;left:0;top:0;z-index:9999;background:#fff;padding:10px;display:flex;flex-wrap:wrap;gap:8px;width:620px';
   for(const id of GUN9.IDS){const im=new Image();im.src=iconURL('w:'+id);im.width=im.height=96;im.style.imageRendering='auto';d.appendChild(im)}for(const id of GUN9.IDS){const c=document.createElement('canvas');c.width=196;c.height=120;c.style.cssText='background:#f4f0fa;width:196px;height:120px';const x=c.getContext('2d');const bb=GUN9.B[id];x.translate(98-(bb[0]+bb[2])/2*1.5,60-(bb[1]+bb[3])/2*1.5);x.scale(.625,.625);drawWeapon(x,id,96,0);d.appendChild(c)}document.body.appendChild(d)});
  await p.setViewportSize({width:1280,height:1000});await p.waitForTimeout(300);await p.screenshot({path:path.join(SHOTS,'icons.png'),clip:{x:0,y:0,width:640,height:1000}});await E(()=>document.getElementById('icsheet').remove());await p.setViewportSize({width:1280,height:720});
  await E(()=>{STORE7.open({cat:'weapons'});STORE7.setFilter({cat:'weapons',q:'',sort:'pa'});STORE7.select('wpn_rocket')});await p.waitForTimeout(500);await p.screenshot({path:path.join(SHOTS,'store.png')});await E(()=>STORE7.close())}
 ok('no page errors',errs.length==0,errs.join('|'));
 ok('no GUN9 / LVL9 console errors',!cerr.some(t=>/GUN9|LVL9/.test(t)),cerr.filter(t=>/GUN9|LVL9/.test(t)).join('|'));
 await b.close();console.log(fails?fails+' combat test(s) FAILED':'all combat tests passed');process.exit(fails?1:0)})();
