// Store / item lifecycle tests (browser). Run: node tests/store.js  (CHROMIUM=/path/to/chromium if needed)
const {chromium}=require('playwright');const path=require('path');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x?'  - '+x:''));if(!c)fails++};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},240000).unref();
const FILE='file://'+path.join(__dirname,'..','index.html');
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:1280,height:760}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(FILE);await p.waitForTimeout(1200);await p.getByText('PLAY AS GUEST',{exact:false}).first().click();await p.waitForTimeout(1200);await p.getByText('START ADVENTURE',{exact:false}).first().click().catch(()=>{});await p.waitForTimeout(1500);
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
 // --- 8 shop wings distinct
 r=await p.evaluate(()=>{const hs=new Set(),bad=[];for(const w of WINGS.filter(w=>w.shop)){const i=WINGS.indexOf(w);const c=document.createElement('canvas');c.width=320;c.height=260;const x=c.getContext('2d');try{WingArt.draw(x,i,160,130,1,1,0,0,0,1)}catch(e){bad.push(w.id)}const d=x.getImageData(0,0,320,260).data;let h=0,px=0;for(let k=0;k<d.length;k+=4)if(d[k+3]>20){px++;h=(h*31+d[k]*3+d[k+1]*5+d[k+2]*7+k)>>>0}if(px<800)bad.push('blank '+w.id);hs.add(h)}return{n:hs.size,bad}});
 ok('8 shop wings render, each visually distinct',r.n==8&&r.bad.length==0,JSON.stringify(r));
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
 // --- store UI
 await p.evaluate(()=>STORE7.open());await p.waitForTimeout(400);
 r=await p.evaluate(()=>{const o={};const cnt=()=>document.querySelectorAll('#store7 .card').length;o.open=STORE7.isOpen;
  for(const c of ['weapons','wings','effects','charms','weather','gear','blocks','seeds','objects']){STORE7.setFilter({cat:c,q:'',rar:'all',owned:false});o[c]=cnt()}
  STORE7.setFilter({cat:'all',q:'void'});o.search=cnt();STORE7.setFilter({q:'zzzzzz'});o.none=cnt()+(document.querySelector('#store7 .empty')?100:0);
  STORE7.setFilter({q:'',cat:'weapons',sort:'pa'});const pr=STORE7.list().map(i=>i.price);o.asc=pr.every((v,i)=>!i||pr[i-1]<=v);
  STORE7.setFilter({sort:'pd'});const pd=STORE7.list().map(i=>i.price);o.desc=pd.every((v,i)=>!i||pd[i-1]>=v);
  STORE7.setFilter({sort:'feat',rar:'legendary'});o.rar=STORE7.list().every(i=>i.rar=='legendary');STORE7.setFilter({rar:'all',owned:true});o.owned=STORE7.list().every(i=>SHOP7.has(i.id));STORE7.setFilter({owned:false,cat:'featured'});
  o.hud=!!document.getElementById('bstore');return o});
 ok('store opens, every category lists items',r.open&&r.weapons>=15&&r.wings==8&&r.effects>=15&&r.charms==5&&r.weather==3&&r.gear>=20&&r.blocks>=10&&r.seeds>=10&&r.objects>=10,JSON.stringify(r));
 ok('search / empty state / sort asc+desc / rarity / owned filters',r.search>=3&&r.none>=100&&r.asc&&r.desc&&r.rar&&r.owned);ok('HUD STORE button exists',r.hud);
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
 ok('music starts; every place/weather has its own mood with 2+ songs',r.on&&r.moods.length==10&&r.songs.every(n=>n>=2)&&r.blossom=='blossom'&&r.space=='space'&&r.galaxy=='galaxy'&&['plaza','night','cloud','rain','storm','snow'].includes(r.plaza)&&r.slider,JSON.stringify(r));
 r=await p.evaluate(()=>{const o={};MUS7.force('rain');MUS7.newSong('rain');const a=MUS7.played.slice(-1)[0];MUS7.newSong('rain');MUS7.newSong('rain');const pl=MUS7.played.slice(-3);o.noRepeat=pl[0]!=pl[1]&&pl[1]!=pl[2];return o});
 ok('songs never repeat back-to-back',r.noRepeat,JSON.stringify(r));
 r=await p.evaluate(()=>{const o={};o.blocks=[];for(let b=42;b<=59;b++){const s=spr(b,0,0);const d=s.getContext('2d').getImageData(0,0,48,48).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>200)n++;o.blocks.push(n>2000&&!!BLK[b]&&PRICE[b]>0)}
  o.wear=['angel','fairy','bat','phoenix','crystal'].every(k=>!Object.keys(WEAR).includes(k));o.jump=typeof maxAir=='function';o.sfx=['voice','mobSound','bloop','splash'].every(k=>typeof SFX7[k]=='function');
  o.plaza=NPCS.length==3&&tiles[21*W+DX]==0&&NPCS.every(n=>tiles[21*W+n.x]==0&&tiles[22*W+n.x]>0);o.floor=tiles[22*W+DX]==44;o.glow=!!GLOW7[52]&&!!GLOW7[53];return o});
 ok('18 new blocks paint, are priced and glow where intended',r.blocks.every(Boolean)&&r.glow,JSON.stringify(r.blocks));
 ok('wearable wings removed, double-jump hook and new sounds exist',r.wear&&r.jump&&r.sfx,JSON.stringify(r));
 ok('plaza rebuilt from new blocks (slate promenade, NPCs kept)',r.floor&&r.plaza,JSON.stringify(r));
 // regression: a save that owns store-added weapons / removed wings must start cleanly and keep the weapons
 {const q=await b.newPage();const qe=[];q.on('pageerror',x=>qe.push(x.message));await q.addInitScript(()=>{if(!localStorage.getItem('s9')){localStorage.setItem('s9','1');localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}));localStorage.setItem('rbp',JSON.stringify({v:1,gems:10,lvl:20,own:{fist:1,solarfang:1},wp:'solarfang',ownW:{angel:1},wear:{wing:'angel'}}))}});
  await q.goto(FILE);await q.waitForTimeout(1500);const o=await q.evaluate(()=>({ready:RBDIAG.ready,wp,own:!!own.solarfang,wing:wear.wing,errs:RBDIAG.errors.length}));await q.close();
  ok('old saves (new weapons, removed wings) start cleanly and keep their weapons',o.ready&&o.wp=='solarfang'&&o.own&&!o.wing&&!o.errs&&!qe.length,JSON.stringify(o)+qe.join('|'))}
 ok('no page errors in the whole run',errs.length==0,errs.slice(0,3).join(' | '));
 await b.close();console.log(fails?'FAILURES '+fails:'all store tests passed');process.exit(fails?1:0)})();
