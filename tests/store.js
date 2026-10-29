// Store / item lifecycle tests (browser). Run: node tests/store.js  (CHROMIUM=/path/to/chromium if needed)
const {chromium}=require('playwright');const path=require('path');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x?'  - '+x:''));if(!c)fails++};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},240000).unref();
const FILE='file://'+path.join(__dirname,'..','index.html');
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:1280,height:760}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(FILE);await p.waitForTimeout(1200);await p.getByText('START ADVENTURE',{exact:false}).first().click().catch(()=>{});await p.waitForTimeout(1500);
 await p.evaluate(()=>{for(const it of SHOP7.items){const c=document.createElement('canvas').getContext('2d');STORE7.drawPrev(c,it,300,255,.7,1,true)}});await p.waitForTimeout(600);
 // --- catalog + every item draws a real, non-empty preview and thumbnail
 let r=await p.evaluate(()=>{const bad=[];const RARS=SHOP7.RAR;let n=0;const hashes={};for(const it of SHOP7.items){n++;if(!it.n||!(it.price>0)||!RARS.includes(it.rar)||!it.d)bad.push('meta '+it.id);
   const c=document.createElement('canvas');c.width=300;c.height=255;const x=c.getContext('2d');try{STORE7.drawPrev(x,it,300,255,.7,1,true)}catch(e){bad.push('prev '+it.id+' '+e.message)}
   const d=x.getImageData(0,0,300,255).data;let px=0;for(let i=3;i<d.length;i+=4)if(d[i]>20)px++;if(px<150)bad.push('empty '+it.id+' '+px)}
  return{n,bad}});
 ok('catalog has 100+ items and every item has meta + a non-empty preview',r.n>=100&&r.bad.length==0,JSON.stringify(r.bad.slice(0,6)));
 // --- six featured weapons: distinct models, trail, impact, sound, stats
 r=await p.evaluate(()=>{const ids=['void','solarfang','frostbite','astralkat','crimsonrift','verdant'],out={sig:{},bad:[]};const sigs=new Set();
  for(const id of ids){const w=WPN[id];if(!w||!w.n||!w.d||!(w.md>0))out.bad.push('stats '+id);const c=document.createElement('canvas');c.width=140;c.height=140;const x=c.getContext('2d');x.translate(40,70);try{drawWeapon(x,id,96,1)}catch(e){out.bad.push('model '+id)}
   const d=x.getImageData(0,0,140,140).data;let h=0,px=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>20){px++;h=(h*31+d[i]*3+d[i+1]*5+d[i+2]*7+i)>>>0}if(px<120)out.bad.push('blank '+id);sigs.add(h);
   if(id!='void'&&!WFX7.NEW[id])out.bad.push('reg '+id);if(!WFX7.TRAIL[id]||!WFX7.IMP[id]||!WFX7.SFX[id])out.bad.push('fx '+id)}
  out.distinct=sigs.size;return out});
 ok('6 weapons: stats, own model (distinct pixels), trail + impact + sound registered',r.distinct==6&&r.bad.length==0,JSON.stringify(r));
 // --- shop wings distinct (27 sold for gems: 19 + the 8 v9 ascended wings; level + exclusive wings are never in the catalog)
 r=await p.evaluate(()=>{const hs=new Set(),bad=[];if(SHOP7.items.some(it=>it.cat=='wings'&&(!wingById(it.ref)||wingById(it.ref).src!='shop')))bad.push('catalog sells a non-shop wing');if(WINGS.filter(w=>w.shop).some(w=>!SHOP7.byId.get('wing_'+w.id)))bad.push('shop wing missing from catalog');for(const w of WINGS.filter(w=>w.shop)){const i=WINGS.indexOf(w);const c=document.createElement('canvas');c.width=320;c.height=260;const x=c.getContext('2d');try{WingArt.draw(x,i,160,130,1,1,0,0,0,1)}catch(e){bad.push(w.id)}const d=x.getImageData(0,0,320,260).data;let h=0,px=0;for(let k=0;k<d.length;k+=4)if(d[k+3]>20){px++;h=(h*31+d[k]*3+d[k+1]*5+d[k+2]*7+k)>>>0}if(px<800)bad.push('blank '+w.id);hs.add(h)}return{n:hs.size,bad}});
 ok('27 shop wings render, each visually distinct',r.n==27&&r.bad.length==0,JSON.stringify(r));
 // --- purchase rules (offline/local)
 r=await p.evaluate(async()=>{gems=1000;lvl=1;const o={};const g0=gems;o.noMoney=await SHOP7.buy('wpn_astralkat');o.gemsAfterFail=gems==g0;o.has0=SHOP7.has('wpn_astralkat');
  gems=5000;const a=await SHOP7.buy('wpn_astralkat');o.buy=a.ok;o.gems=gems;const dup=await SHOP7.buy('wpn_astralkat');o.dup=dup.ok;o.gems2=gems;
  o.lvLock=(await SHOP7.buy('wing_moth')).ok;o.nope=(await SHOP7.buy('does_not_exist')).ok;
  const n0=cnt(101);const s=await SHOP7.buy('seed_101',5);o.seed=s.ok&&cnt(101)==n0+5;o.eq=SHOP7.equip('wpn_astralkat')&&wp=='astralkat';SHOP7.unequip('wpn_astralkat');o.un=wp=='fist';return o});
 ok('insufficient gems: refused and not charged',r.noMoney==false||r.noMoney.ok==0,JSON.stringify(r));ok('affordable buy charges exactly the price',r.buy==1&&r.gems==3500);ok('buying twice is refused and not charged',r.dup==0&&r.gems2==3500);
 ok('level-locked and unknown items are refused',r.lvLock==0&&r.nope==0);ok('stackable items add the quantity',r.seed);ok('equip/unequip works',r.eq&&r.un);
 // --- persistence across reload
 await p.evaluate(()=>{gems=9000;lvl=120;return SHOP7.buy('wing_dragon').then(()=>SHOP7.buy('fx_aura_void')).then(()=>{SHOP7.equip('wing_dragon');SHOP7.equip('fx_aura_void');saveP();celSave();try{x6Save()}catch(_){}})});
 const q=await ctx.newPage();q.on('pageerror',e=>errs.push(e.message));await q.goto(FILE);await q.waitForTimeout(2000);
 r=await q.evaluate(()=>({dragon:SHOP7.has('wing_dragon'),aura:SHOP7.has('fx_aura_void'),eqA:SHOP7.equipped('fx_aura_void'),wing:cel.wing,kat:SHOP7.has('wpn_astralkat')}));
 ok('ownership + equipped cosmetics survive a reload',r.dragon&&r.aura&&r.eqA&&r.wing=='dragon'&&r.kat,JSON.stringify(r));await q.close();
 // --- wing equip state: one source of truth; unequipping never brings wings back; buying equips; previews never save
 r=await p.evaluate(async()=>{gems=9000;lvl=60;const o={},id=()=>{const w=curWing(lvl);return w?w.id:null};wingUnequip();cel.wing='auto';o.auto=id();
  const g0=gems;o.buy=(await SHOP7.buy('wing_eagle')).ok;o.charged=g0-gems;o.afterBuy=id();o.dup=(await SHOP7.buy('wing_eagle')).ok;o.charged2=g0-gems;
  SHOP7.unequip('wing_dragon');o.otherUn=id();SHOP7.unequip('wing_eagle');o.afterUn=id();o.on=cel.wingsOn;lvl=61;await new Promise(r=>setTimeout(r,300));o.afterLvl=id();
  o.storeShows=SHOP7.equipped('wing_eagle');cel.wing='dove';o.notOwned=id();cel.wingsOn=0;o.legacyOff=id()+'|'+cel.wing;cel.wingsOn=1;o.legacyOn=id();
  o.eqLevel=wingEquip('frost');o.cur=id();o.lockedEq=wingEquip('cosmic');o.cur2=id();o.exclBuy=(await SHOP7.buy('wing_sovereign')).ok;o.exclEq=wingEquip('sovereign');
  WPREV.id='cosmic';WPREV.until=performance.now()+5000;o.prev=wingShown(lvl).id;o.prevSaved=id();WPREV.id=null;o.dj=maxAir();wingUnequip();o.dj0=maxAir();return o});
 ok('wing equip/unequip: one state, unequip sticks through level-ups, buy equips once, locked/exclusive cannot be forced, preview is not saved',
  r.auto=='aegis'&&r.buy==1&&r.charged==800&&r.afterBuy=='eagle'&&r.dup==0&&r.charged2==800&&r.otherUn=='eagle'&&r.afterUn===null&&r.on==0&&r.afterLvl===null&&!r.storeShows&&r.notOwned===null&&r.legacyOff=='null|none'&&r.legacyOn=='aegis'&&r.eqLevel&&r.cur=='frost'&&!r.lockedEq&&r.cur2=='frost'&&r.exclBuy==0&&!r.exclEq&&r.prev=='cosmic'&&r.prevSaved=='frost'&&r.dj==1&&r.dj0==0,JSON.stringify(r));
 {const q2=await ctx.newPage();q2.on('pageerror',e=>errs.push(e.message));await q2.goto(FILE);await q2.waitForTimeout(1500);r=await q2.evaluate(()=>({w:cel.wing,on:cel.wingsOn,cur:curWing(lvl)}));
  ok('unequipped wings stay unequipped after a reload',r.w=='none'&&r.on==0&&r.cur===null,JSON.stringify(r));await q2.close()}
 // --- store UI
 await p.evaluate(()=>STORE7.open());await p.waitForTimeout(400);
 r=await p.evaluate(()=>{const o={};const cnt=()=>document.querySelectorAll('#store7 .card').length;o.open=STORE7.isOpen;
  for(const c of ['weapons','wings','effects','charms','weather','gear','blocks','seeds','objects']){STORE7.setFilter({cat:c,q:'',rar:'all',owned:false});o[c]=cnt()}
  STORE7.setFilter({cat:'all',q:'void'});o.search=cnt();STORE7.setFilter({q:'zzzzzz'});o.none=cnt()+(document.querySelector('#store7 .empty')?100:0);
  STORE7.setFilter({q:'',cat:'weapons',sort:'pa'});const pr=STORE7.list().map(i=>i.price);o.asc=pr.every((v,i)=>!i||pr[i-1]<=v);
  STORE7.setFilter({sort:'pd'});const pd=STORE7.list().map(i=>i.price);o.desc=pd.every((v,i)=>!i||pd[i-1]>=v);
  STORE7.setFilter({sort:'feat',rar:'legendary'});o.rar=STORE7.list().every(i=>i.rar=='legendary');STORE7.setFilter({rar:'all',owned:true});o.owned=STORE7.list().every(i=>SHOP7.has(i.id));STORE7.setFilter({owned:false,cat:'featured'});
  o.hud=!!document.getElementById('bstore');return o});
 ok('store opens, every category lists items',r.open&&r.weapons>=20&&r.wings==27&&r.effects>=15&&r.charms==15&&r.weather==8&&r.gear>=20&&r.blocks>=10&&r.seeds>=10&&r.objects>=10,JSON.stringify(r));
 ok('search / empty state / sort asc+desc / rarity / owned filters',r.search>=3&&r.none>=100&&r.asc&&r.desc&&r.rar&&r.owned);ok('HUD STORE button exists',r.hud);
 // the Sparkmouse costume: real catalog gear, buyable + equippable, icons and cached worn art render
 r=await p.evaluate(async()=>{const o={};const h=SHOP7.byId.get('wear_sparkhood'),s=SHOP7.byId.get('wear_sparksuit');
  o.items=!!h&&!!s&&h.cat=='gear'&&s.cat=='gear'&&h.rar=='epic'&&s.rar=='legendary'&&WEAR.sparkhood.cost==h.price&&WEAR.sparksuit.cost==s.price&&WEAR.sparkhood.s=='hat'&&WEAR.sparksuit.s=='body';
  const g0=gems;gems=5000;lvl=20;delete ownW.sparkhood;delete ownW.sparksuit;wear.hat='';wear.body='';const a=await SHOP7.buy('wear_sparkhood'),b2=await SHOP7.buy('wear_sparksuit');o.bought=a.ok&&b2.ok;o.charged=5000-gems;
  o.eq=SHOP7.equip('wear_sparkhood')&&SHOP7.equip('wear_sparksuit')&&wear.hat=='sparkhood'&&wear.body=='sparksuit';
  try{iconURL('a:sparkhood');iconURL('a:sparksuit');const c=document.createElement('canvas');c.width=c.height=200;const x=c.getContext('2d'),og=g;g=x;try{for(let i=0;i<4;i++)AC6.draw(100,80,1,0,'T',i*.3,i*60,i==3,'',wp,0,0,wear,false,look,null)}finally{g=og}o.art=GEAR7.size>0}catch(e){o.art='ERR '+e.message}
  wear.hat='';wear.body='';gems=g0;return o});
 ok('Sparkmouse Hood + Suit: epic/legendary catalog gear, buy, equip, icons + cached worn art',r.items&&r.bought&&r.charged==2500&&r.eq&&r.art===true,JSON.stringify(r));
 // buy through the UI with confirm dialog
 await p.evaluate(()=>{gems=5000;lvl=120;STORE7.setFilter({cat:'all',q:'Solar Fang'});STORE7.select('wpn_solarfang')});await p.waitForTimeout(300);
 await p.click('#store7 aside [data-a=buy]');await p.waitForTimeout(400);const dlg=await p.evaluate(()=>!!document.querySelector('#dlg7.on'));await p.click('#dlg7 [data-ok]');await p.waitForTimeout(600);
 r=await p.evaluate(()=>({has:SHOP7.has('wpn_solarfang'),gems}));ok('UI purchase asks to confirm, then buys',dlg&&r.has&&r.gems==3800,JSON.stringify(r));
 await p.evaluate(()=>STORE7.close());
 // --- effects: run every cosmetic for 400 frames, no errors, bounded
 r=await p.evaluate(async()=>{gems=1e6;lvl=150;for(const it of SHOP7.items)if(!it.stack)await SHOP7.buy(it.id);for(const it of SHOP7.items)if(SHOP7.slotOf(it))SHOP7.equip(it.id);const e=[];const t0=performance.now();let frames=0;
  for(let i=0;i<400;i++){try{FX7.tick(.016);dash=i%60<12?.2:0;FX7.victory();FX7.spawn()}catch(x){e.push(x.message)}frames++}
  return{e:e.slice(0,3),ms:(performance.now()-t0)/frames}});
 ok('all cosmetics active together: no errors, cheap per frame',r.e.length==0&&r.ms<4,JSON.stringify(r));
 // --- wing pose: folded at rest, opens calmly on a timer, snaps open in the air; weapon animations draw and expire
 r=await p.evaluate(()=>{const c=document.createElement('canvas').getContext('2d');const i=WINGS.findIndex(w=>w.id=='crystal');let mn=9,mx=-1,t=100;for(let k=0;k<1200;k++){t+=.016;const s=WingArt.draw(c,i,100,100,1,t,0,0,0,1,'tst',0);mn=Math.min(mn,s);mx=Math.max(mx,s)}
  let air=0;for(let k=0;k<40;k++){t+=.016;air=WingArt.draw(c,i,100,100,1,t,2,0,0,1,'tst',-300)}let fold=air;for(let k=0;k<300;k++){t+=.016;fold=WingArt.draw(c,i,100,100,1,t,0,0,0,1,'tst2',0)}
  const o={mn,mx,air};FX7.AN.length=0;let errs=0;for(const id of Object.keys(FX7.WANIM)){FX7.weaponAnim(id)}const n=FX7.AN.length;for(let k=0;k<5;k++){try{FX7.drawAnims(c,0,0)}catch(e){errs++}}o.n=n;o.errs=errs;return o});
 ok('wings: rest folded, open calmly at times, fully open in the air',r.mn<.25&&r.mx>.7&&r.air>.9,JSON.stringify(r));ok('6 weapon animations play and draw without errors',r.n==6&&r.errs==0);
 // --- NPCs only in plaza
 r=await p.evaluate(()=>{const o={};const m=NPCS[0];P.x=m.x*T+T/2;P.y=sh(m.x)*T-P.h-2;cur='plaza';o.plaza=!!nearNPC();cur='garden';o.other=nearNPC()===null;cur='plaza';return o});
 ok('NPCs talkable in plaza only',r.plaza&&r.other,JSON.stringify(r));
 // --- music moods + volume controls
 r=await p.evaluate(async()=>{startBGM();await new Promise(r=>setTimeout(r,300));const o={on:MUS7.on,moods:Object.keys(MUS7.MOODS)};ENV7.set('blossom',{instant:true});MUS7.detect();o.blossom=MUS7.want;ENV7.set('space',{instant:true});MUS7.detect();o.space=MUS7.want;ENV7.set('galaxy',{instant:true});MUS7.detect();o.galaxy=MUS7.want;ENV7.set('default',{instant:true});MUS7.detect();o.plaza=MUS7.want;o.moods2=Object.keys(MUS7.MOODS);o.songs=Object.values(MUS7.MOODS).map(m=>m.songs.length);
  o.slider=!!document.getElementById('oav')&&!!document.getElementById('ov')&&!!document.getElementById('os');return o});
 ok('music starts; every place/weather has its own mood with 2+ songs',r.on&&r.moods.length>=17&&['sunflower','sakura','ocean','neon','aurora'].every(m=>r.moods.includes(m))&&r.moods.includes('mine')&&r.moods.includes('deep')&&r.songs.every(n=>n>=2)&&r.blossom=='blossom'&&r.space=='space'&&r.galaxy=='galaxy'&&['plaza','night','cloud','rain','storm','snow'].includes(r.plaza)&&r.slider,JSON.stringify(r));
 r=await p.evaluate(()=>{const o={};MUS7.force('rain');MUS7.newSong('rain');const a=MUS7.played.slice(-1)[0];MUS7.newSong('rain');MUS7.newSong('rain');const pl=MUS7.played.slice(-3);o.noRepeat=pl[0]!=pl[1]&&pl[1]!=pl[2];return o});
 ok('songs never repeat back-to-back',r.noRepeat,JSON.stringify(r));
 r=await p.evaluate(()=>{const o={};o.blocks=[];for(let b=42;b<=59;b++){const s=spr(b,0,0);const d=s.getContext('2d').getImageData(0,0,48,48).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>200)n++;o.blocks.push(n>2000&&!!BLK[b]&&PRICE[b]>0)}
  o.wear=['angel','fairy','bat','phoenix','crystal'].every(k=>!Object.keys(WEAR).includes(k));o.jump=typeof maxAir=='function';o.sfx=['mobSound','bloop','splash'].every(k=>typeof SFX7[k]=='function');
  const S=sh(DX);o.plaza=NPCS.length==3&&tiles[(S-1)*W+DX]==0&&NPCS.every(n=>tiles[(S-1)*W+n.x]==0&&tiles[S*W+n.x]>0);o.floor=tiles[S*W+DX]==12&&tiles[S*W+DX-12]==44;o.glow=!!GLOW7[52]&&!!GLOW7[53];return o});
 ok('18 new blocks paint, are priced and glow where intended',r.blocks.every(Boolean)&&r.glow,JSON.stringify(r.blocks));
 ok('wearable wings removed, double-jump hook and new sounds exist',r.wear&&r.jump&&r.sfx,JSON.stringify(r));
 ok('plaza town built from new blocks (marble World Gate, slate Gate Square, NPCs kept)',r.floor&&r.plaza,JSON.stringify(r));
 // regression: a save that owns store-added weapons / removed wings must start cleanly and keep the weapons
 {const q=await b.newPage();const qe=[];q.on('pageerror',x=>qe.push(x.message));await q.addInitScript(()=>{if(!localStorage.getItem('s9')){localStorage.setItem('s9','1');localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}));localStorage.setItem('rbp',JSON.stringify({v:1,gems:10,lvl:20,own:{fist:1,solarfang:1},wp:'solarfang',ownW:{angel:1},wear:{wing:'angel'}}))}});
  await q.goto(FILE);await q.waitForTimeout(1500);const o=await q.evaluate(()=>({ready:RBDIAG.ready,wp,own:!!own.solarfang,wing:wear.wing,errs:RBDIAG.errors.length}));await q.close();
  ok('old saves (new weapons, removed wings) start cleanly and keep their weapons',o.ready&&o.wp=='solarfang'&&o.own&&!o.wing&&!o.errs&&!qe.length,JSON.stringify(o)+qe.join('|'))}
 r=await p.evaluate(()=>{const o={};o.items=COMP7.IDS.every(i=>SHOP7.byId.has('charm_'+i));gems=99999;o.eq=COMP7.IDS.map(i=>{SHOP7.buy('charm_'+i);SHOP7.equip('charm_'+i);return SHOP7.eqRef('charm')==i});o.voice=!document.getElementById('ovo')&&typeof SFX7.voice=='undefined';SHOP7.unequip('charm');return o});
 ok('4 companions are in the Store and can be bought and equipped; the character has no voice (no voice slider)',r.items&&r.eq.every(Boolean)&&r.voice,JSON.stringify(r));
 r=await p.evaluate(()=>{const o={};BOOK7.open();o.open=BOOK7.isOpen&&document.querySelectorAll('#book7 .sec').length==9;const st=BOOK7.stats().find(x=>x.c=='charms');gems=99999;for(const i of st.l)SHOP7.buy(i.id);const g0=gems;BOOK7.claim('charms:0.25');o.gain=gems-g0==100;const g1=gems;BOOK7.claim('charms:0.25');o.once=gems==g1;BOOK7.close();return o});
 ok('Collection Book opens, shows every category, pays each milestone once',r.open&&r.gain&&r.once,JSON.stringify(r));
 r=await p.evaluate(()=>{const o={};HUNT7.reset();enterWorld('plaza');o.empty=HUNT7.SPOTS.map((_,i)=>{const q=HUNT7.pos(i);return !tiles[Math.floor(q.y/T)*W+Math.floor(q.x/T)]});gems=0;try{SHOP7.serverMode}catch(_){}const g0=gems;for(let i=0;i<7;i++)HUNT7.take(i);HUNT7.take(0);o.count=HUNT7.count();o.gems=gems-g0;o.title=HUNT7.title;HUNT7.reset();return o});
 ok('Spirit Stone hunt: 7 stones in free spots, each pays once, all-found bonus + title',r.empty.every(Boolean)&&r.count==7&&r.gems==850&&r.title,JSON.stringify(r));
 r=await p.evaluate(async()=>{const o={};RUN7.reset();enterWorld('plaza');const on=k=>{const q=RUN7.PL[k];P.x=(DX+q.x+1)*T;P.y=q.y*T-P.h-.01;P.vx=P.vy=0;P.g=true;RUN7.tick(performance.now())};o.solid=RUN7.PL.every(q=>tiles[q.y*W+DX+q.x]>0);gems=0;try{SHOP7.serverMode}catch(_){}on(0);o.run=RUN7.state;await new Promise(r=>setTimeout(r,60));on(RUN7.N-1);o.done=RUN7.state;o.best=RUN7.best>0;o.title=RUN7.title;RUN7.reset();return o});
 ok('Sky Run parkour: platforms built, start/finish detected, best time + title saved',r.solid&&r.run=='run'&&r.done=='done'&&r.best&&r.title,JSON.stringify(r));
 r=await p.evaluate(async()=>{enterWorld('fxtest');gems=99999;await new Promise(r=>setTimeout(r,2200));while(!P.g)await new Promise(r=>setTimeout(r,50));const out={};
  for(const[id,far]of[['void',60],['crimsonrift',150],['frostbite',150],['solarfang',127],['verdant',150]]){own[id]=1;wp=id;mobs.length=0;P.f=1;mx=cv.width/2+300;my=cv.height/2;const m={k:'golem',x:P.x+(id=='void'?0:far),y:P.y+P.h-54-(id=='void'?30:0),w:46,h:54,vx:0,vy:0,hp:9999,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:0,g:true,wall:0};mobs.push(m);const px=m.x,py=m.y,h0=m.hp,pin=setInterval(()=>{m.x=px;m.y=py;m.vx=m.vy=0},8);wcd=0;useWeapon();await new Promise(r=>setTimeout(r,1000));clearInterval(pin);out[id]=h0-m.hp}wp='fist';mobs.length=0;return out});
 ok('weapon effect animations deal damage beyond sword range (void ring, rift/frost/leaf shards, solar orb)',Object.values(r).every(v=>v>0),JSON.stringify(r));
 r=await p.evaluate(async()=>{const o={};enterWorld('evtest');await new Promise(r=>setTimeout(r,2200));while(!P.g)await new Promise(r=>setTimeout(r,50));gems=1000;mobs.length=0;
  // deterministic schedule: same world + slot => same event for everybody; plaza has none
  const a=WEV7.eventFor(7),b=WEV7.eventFor(7);o.det=JSON.stringify([a&&a.kind,a&&a.tx])==JSON.stringify([b&&b.kind,b&&b.tx]);let n=0;for(let k=0;k<200;k++)if(WEV7.eventFor(k))n++;o.rate=n>80&&n<190;
  // spirit
  WEV7.force('spirit');P.x=WEV7.ev.x;{let y=Math.max(0,sh(WEV7.ev.tx)-3);while(y<H-2&&!solidAt(WEV7.ev.tx,y))y++;P.y=y*T-P.h-1}await new Promise(r=>setTimeout(r,120));P.hp=10;const g0=gems;WEV7.interactEv();o.spirit=gems-g0==80&&P.hp>10;const g1=gems;WEV7.interactEv();o.once=gems==g1;
  // trader
  WEV7.force('trader');P.x=WEV7.ev.x;{let y=Math.max(0,sh(WEV7.ev.tx)-3);while(y<H-2&&!solidAt(WEV7.ev.tx,y))y++;P.y=y*T-P.h-1}await new Promise(r=>setTimeout(r,120));const g2=gems;WEV7.interactEv();o.trader=g2-gems==250;
  // rift: mobs appear; killing 6 closes it and pays
  WEV7.force('rift');await new Promise(r=>setTimeout(r,200));let spawned=0;for(let i=0;i<8;i++){WEV7.tick(5);}spawned=mobs.filter(m=>m.rift).length;o.rift=spawned>0;const g3=gems;for(let i=0;i<40&&gems-g3<150;i++){for(const m of mobs)if(m.rift)m.hp=0;mobs.splice(0,mobs.length,...mobs.filter(m=>!m.rift));WEV7.tick(5)}o.riftPay=gems-g3>=150;
  // meteor: an impact hurts a nearby monster and drops loot
  WEV7.force('meteor');const ev=WEV7.ev;const gy=(()=>{let y=Math.max(0,sh(Math.floor(ev.x/T))-3);while(y<H-2&&!solidAt(Math.floor(ev.x/T),y))y++;return y*T})();const mm={k:'golem',x:ev.x,y:gy-54,w:46,h:54,vx:0,vy:0,hp:500,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:0,g:true,wall:0};mobs.push(mm);drops.length=0;
  const mt=WEV7.meteors[0];mt.x=ev.x;mt.at=Date.now()-mt.dur-10;const hp0=mm.hp;WEV7.tick(.016);o.meteorHurt=mm.hp<hp0;o.meteorLoot=drops.length>0;return o});
 ok('world events: deterministic schedule, spirit heals once, trader sells, rift pays when cleared, meteors hurt monsters and drop loot',r.det&&r.rate&&r.spirit&&r.once&&r.trader&&r.rift&&r.riftPay&&r.meteorHurt&&r.meteorLoot,JSON.stringify(r));
 r=await p.evaluate(()=>{enterWorld('plaza');const o={};o.none=true;for(let k=0;k<400;k++){}WEV7.tick(.1);o.ev=WEV7.ev;return o});
 ok('no world events in the Plaza',r.ev===null,JSON.stringify(r));
 // --- v9 weather machines: in the store, bought, placed, switched on (scene + music mood), saved with the world, survive a reload
 r=await p.evaluate(async()=>{const o={};const ids=[85,86,87,88,89],wx=['sunflower','sakura','ocean','neon','aurora'];enterWorld('wxtest');await new Promise(r=>setTimeout(r,1500));gems=99999;lvl=40;
  o.store=ids.every(id=>{const it=SHOP7.byId.get('obj_'+id);return it&&it.cat=='weather'&&it.price>0&&it.lv>0});o.bought=[];for(const id of ids){const c0=cnt(id);const res=await SHOP7.buy('obj_'+id,1);o.bought.push(!!res.ok&&cnt(id)==c0+1)}
  const px=Math.floor(P.x/T),py=Math.floor((P.y+P.h-1)/T);o.used=[];o.mood=[];o.built=[];startBGM();mobs.length=0;for(let i=0;i<40;i++){mobs.length=0;MUS7.detect();if(MUS7.want!='combat')break;await new Promise(r=>setTimeout(r,250))}
  for(let i=0;i<ids.length;i++){const k=py*W+px+1+i;tiles[k]=ids[i];pushEdit(k);await new Promise(r=>setTimeout(r,1300));WXM7.use(k);o.used.push(ENV7.target==wx[i]&&X6.wx[cur]==wx[i]&&!!OBJ[k]&&ODEF[OBJ[k].t].cat=='wx');mobs.length=0;MUS7.detect();o.mood.push(MUS7.want==wx[i]&&MUS7.MOODS[wx[i]].songs.length>=2);await new Promise(r=>setTimeout(r,200));o.built.push(ENV7.cached.includes(wx[i]));if(wx[i]=='neon')o.rain=WX6.force=='rain'}
  o.names=ids.every((id,i)=>ENV7.names[wx[i]]&&iname(id)==ODEF[id].n);o.cat=ITEM7.cat(88)=='obj';
  const sav=JSON.parse(localStorage.getItem('rbc2')||'{}');o.saved=sav.wx&&sav.wx.wxtest=='aurora';return o});
 ok('5 new weather machines are in the Store and can be bought',r.store&&r.bought.every(Boolean),JSON.stringify(r));
 ok('placing + using each machine switches the world to its animated scene (built into cached layers) with its own music mood',r.used.every(Boolean)&&r.built.every(Boolean)&&r.mood.every(Boolean)&&r.names&&r.cat,JSON.stringify(r));
 ok('the Neon Rain machine brings real rain; the weather is saved with the world',r.saved&&r.rain,JSON.stringify(r));
 {const q=await ctx.newPage();const qe=[];q.on('pageerror',x=>qe.push(x.message));await q.goto(FILE);await q.waitForTimeout(1200);await q.getByText('START ADVENTURE',{exact:false}).first().click().catch(()=>{});await q.waitForTimeout(1200);
  const o=await q.evaluate(async()=>{enterWorld('wxtest');await new Promise(r=>setTimeout(r,800));return{t:ENV7.target,x6:X6.wx.wxtest}});await q.close();
  ok('a v9 weather scene is still on after a reload of the world',o.t=='aurora'&&o.x6=='aurora'&&!qe.length,JSON.stringify(o)+qe.join('|'))}
 ok('no page errors in the whole run',errs.length==0,errs.slice(0,3).join(' | '));
 await b.close();console.log(fails?'FAILURES '+fails:'all store tests passed');process.exit(fails?1:0)})();
