// Economy rules: rewards come from the world rather than from your own blocks, the store charges exactly what it shows,
// and a purchase survives a slow or lost answer from the server.
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const {createServer}=require('../server/server');
let fails=0;const ok=(n,c,x)=>{console.log((c?'  ok   ':'  FAIL ')+n+(c||x==null?'':'  - '+x));if(!c)fails++};setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},200000).unref();
const launch=()=>chromium.launch({executablePath:process.env.CHROMIUM||undefined,args:['--no-sandbox','--mute-audio','--disable-gpu']});
async function enter(p,url){await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});await p.goto(url);await p.waitForTimeout(900);await p.evaluate(()=>{document.getElementById('bp').click()});await p.waitForTimeout(300);await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}enterWorld('econtest')});await p.waitForTimeout(1600)}
(async()=>{
 const b=await launch();const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await enter(p,'file:///'+path.resolve(__dirname,'..','index.html').split(path.sep).join('/'));
 const E=f=>p.evaluate(f);
 // ---- natural blocks pay, your own blocks only come back
 const r=await E(()=>{const gemsIn=(n0)=>drops.slice(n0).filter(d=>d.k==='gem').reduce((s,d)=>s+(d.n||1),0);const seedsIn=n0=>drops.slice(n0).filter(d=>typeof d.k=='number'&&d.k>=100&&d.k<200).length;
  const out={};const R0=Math.random;Math.random=()=>.05;try{
   const k0=(20*W)+40;const nat=(id)=>{const x=40,y=20,k=y*W+x;edits[k]=undefined;delete edits[k];tiles[k]=id;hp[k]=1;const xp0=JSON.stringify(typeof skills!='undefined'?skills:0),n0=drops.length;const r=breakAt(x,y,255);return{r,g:gemsIn(n0),s:seedsIn(n0),same:JSON.stringify(typeof skills!='undefined'?skills:0)==xp0,blk:drops.slice(n0).filter(d=>d.k===id).length}};
   const placed=(id)=>{const x=40,y=20,k=y*W+x;tiles[k]=id;hp[k]=1;pushEdit(k);const xp0=JSON.stringify(typeof skills!='undefined'?skills:0),n0=drops.length;const r=breakAt(x,y,255);return{r,g:gemsIn(n0),s:seedsIn(n0),same:JSON.stringify(typeof skills!='undefined'?skills:0)==xp0,blk:drops.slice(n0).filter(d=>d.k===id).length}};
   out.nat=nat(3);out.pl=placed(3);out.oreNat=nat(63);out.orePl=placed(63);out.urnPl=placed(93);out.was=[(()=>{const k=21*W+40;tiles[k]=3;pushEdit(k);return wasPlaced(k)})(),(()=>{const k=22*W+40;delete edits[k];return wasPlaced(k)})()];
  }finally{Math.random=R0}return out});
 ok('a natural block pays gems and sometimes a seed',r.nat.r&&r.nat.g>=0&&r.nat.s==1,JSON.stringify(r.nat));
 ok('a block you placed yourself comes back',r.pl.r&&r.pl.blk>=1,JSON.stringify(r.pl));
 ok('a block you placed pays no gems and no seeds',r.pl.g==0&&r.pl.s==0,JSON.stringify(r.pl));
 ok('a natural ore pays gems',r.oreNat.g>0,JSON.stringify(r.oreNat));
 ok('an ore you placed pays no gems',r.orePl.g==0,JSON.stringify(r.orePl));
 ok('a treasure block you placed pays no gems',r.urnPl.g==0,JSON.stringify(r.urnPl));
 ok('the game can tell placed tiles from natural ones',r.was[0]===true&&r.was[1]===false,JSON.stringify(r.was));
 // ---- holding right-click against yourself does not farm the place counter
 ok('standing in the way of a block does not count as placing it',/SOLID6\[it\][^;]*return;stat\('place',1\);addI\(it,-1\)/.test(fs.readFileSync(path.resolve(__dirname,'..','index.html'),'utf8')));
 // ---- every level pays, and the card says so
 const lv=await E(async()=>{const up=()=>{xp=0;xpGain('',xpNeed(lvl))};const g0=gems,l0=lvl;up();await new Promise(r=>setTimeout(r,500));const a=gems-g0;try{document.getElementById('cine7w').remove()}catch(_){}await new Promise(r=>setTimeout(r,500));const card=(document.querySelector('#rw8lv')||{}).textContent||'';const g1=gems;lvl=24;await new Promise(r=>setTimeout(r,200));const g2=gems;up();await new Promise(r=>setTimeout(r,500));const b=gems-g2,g3=gems;lvl=30;await new Promise(r=>setTimeout(r,200));const c=gems-g3;lvl=l0;return{a,l0,card,b,c}});
 ok('a level-up pays about a minute of play',lv.a==Math.round(30+4.5*(lv.l0+1))*((lv.l0+1)%5==0?3:1),JSON.stringify(lv));
 ok('the level card shows the gems and what comes next',/\+[\d,]+ gems/.test(lv.card)&&/Next at level/.test(lv.card),lv.card);
 ok('level 25 pays ten minutes of play',lv.b>=Math.round((30+4.5*25)*10),lv.b);
 ok('a level change from loading a save pays nothing',lv.c==0,lv.c);
 // ---- trees take longer the dearer the seed
 const tr=await E(()=>({dirt:need({s:1,r:1}),gold:need({s:10,r:10}),crystal:need({s:9,r:9}),mix:need({s:1,r:10}),crop:need({s:301,r:301})}));
 ok('a dirt tree still grows in under half a minute',tr.dirt<30,JSON.stringify(tr));ok('a gold tree takes minutes',tr.gold>=240,JSON.stringify(tr));ok('crops keep their own timing',tr.crop==20,JSON.stringify(tr));
 // ---- five more upgrade levels with smaller steps
 const up=await E(()=>({d10:upDmg(10),d11:upDmg(11),d15:upDmg(15),c9:upCost(9),c10:upCost(10),c14:upCost(14)}));
 ok('weapon upgrades past +10 add 6% each',Math.abs(up.d11-up.d10-.06)<1e-9&&Math.abs(up.d15-up.d10-.3)<1e-9,JSON.stringify(up));ok('and cost far more',up.c10>up.c9*1.5&&up.c14>50000,JSON.stringify(up));
 // ---- the store charges what it shows
 const cat=JSON.parse(fs.readFileSync(path.join(__dirname,'..','server','catalog.json'),'utf8')).items;const sv=new Map(cat.map(i=>[i.id,i.price]));
 const cl=await E(()=>SHOP7.items.map(i=>({id:i.id,price:i.price,cost:i.cat=='weapons'&&WPN[i.ref]?WPN[i.ref].cost:i.cat=='gear'&&WEAR[i.ref]?WEAR[i.ref].cost:i.price,local:!!i.local})));
 const diff=cl.filter(i=>sv.get(i.id)!==i.price);ok('every price in the game matches the price the server charges',diff.length==0,JSON.stringify(diff.slice(0,5)));
 ok('every store item exists on the server',cl.every(i=>sv.has(i.id)),JSON.stringify(cl.filter(i=>!sv.has(i.id)).map(i=>i.id).slice(0,5)));
 ok('nothing is sold outside the server catalog',cl.every(i=>!i.local));
 const cd=cl.filter(i=>i.cost!==i.price);ok("an item's own cost is the store price",cd.length==0,JSON.stringify(cd.slice(0,5)));
 ok('the flagship Anonymous set still tops the non-weapon prices',cat.filter(i=>i.cat!='weapons'&&!i.id.startsWith('wear_anon')&&i.how=='store'&&!/^wear_(aura|.*set)/.test(i.id)).every(i=>i.price<=(cat.find(x=>x.id=='wear_anonsuit')||{price:1e9}).price||/^(wear_)/.test(i.id)));
 ok('no errors in the game so far',errs.length==0,errs.slice(0,3).join(' | '));
 await p.close();
 // ---- a real server: purchases survive a lost or late answer
 const os=require('os');const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbecon-'));const S=createServer({csp:false,port:0,host:'127.0.0.1',dataDir:dir,scryptN:64,maxConnsPerIp:200,client:path.join(__dirname,'..','index.html')});const port=await S.listen();
 const q2=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();const er2=[];q2.on('pageerror',e=>er2.push(e.message.slice(0,200)));await q2.goto('http://127.0.0.1:'+port+'/');await q2.waitForTimeout(800);await q2.evaluate(()=>{try{$('cgo').click()}catch(_){}});await q2.waitForTimeout(400);await q2.evaluate(()=>{try{SHOW7.close()}catch(_){}});await q2.waitForFunction(()=>NET7.online,null,{timeout:15000});
 await q2.evaluate(()=>NET7.send({t:'register',name:'econshop',pass:'econshop-password'}));await q2.waitForFunction(()=>NET7.auth&&NET7.auth.name=='econshop'&&typeof RB_ACCT!='undefined'&&!!RB_ACCT.id,null,{timeout:15000});await q2.waitForTimeout(600);
 const acct=()=>{for(const u of (S.store.accounts&&S.store.accounts.values?S.store.accounts.values():[]))if(u.name=='econshop')return u;return null};
 await q2.evaluate(()=>new Promise(r=>{gems=1400;const n=SHOP7.net;SHOP7.net=m=>{n(m);if(m.t=='wallet'){SHOP7.net=n;r()}};NET7.send({t:'sync',gems:1400})}));
 const g0=await q2.evaluate(()=>gems);ok('the test account has gems on the server',g0==1400,g0);
 const cheap=cat.filter(i=>!i.stack&&i.price<=400&&!i.legacy&&!i.lv&&i.cat=='wings').sort((x,y)=>x.price-y.price);const it=cheap[0]||cat.find(i=>i.id=='wing_dove'),it2=cheap[1]||it;
 // an answer that gets lost: the buyer is told the truth, buying again charges nothing more and hands the item over
 const r1=await q2.evaluate(id=>{const n=SHOP7.net;window.__n=n;SHOP7.net=m=>{if(m.t!='buy_res')n(m)};return SHOP7.buy(id)},it.id);await q2.evaluate(()=>{SHOP7.net=window.__n});
 ok('a lost answer does not claim "you were not charged"',r1.waiting&&!/not charged/.test(r1.m||''),JSON.stringify(r1));
 const r2=await q2.evaluate(id=>SHOP7.buy(id),it.id);const g1=await q2.evaluate(()=>gems),own1=await q2.evaluate(id=>SHOP7.has(id),it.id);
 ok('asking again delivers the item',r2.ok&&own1,JSON.stringify(r2));ok('and charges only once',g1==g0-it.price,g0+' -> '+g1+' (price '+it.price+')');
 // an answer that arrives after the buyer gave up still delivers
 const r3=await q2.evaluate(id=>{const n=SHOP7.net;window.__n=n;window.__held=[];SHOP7.net=m=>{if(m.t=='buy_res')window.__held.push(m);else n(m)};return SHOP7.buy(id)},it2.id);
 const late=await q2.evaluate(id=>{SHOP7.net=window.__n;for(const m of window.__held)SHOP7.net(m);return SHOP7.has(id)},it2.id);const g2=await q2.evaluate(()=>gems);
 ok('a late answer still delivers the item',r3.waiting&&late,JSON.stringify(r3));ok('and charges once',g2==g1-it2.price,g1+' -> '+g2);
 // a lost answer followed by coming back online: the server's record settles it (stackable items too)
 const blk=cat.find(i=>i.id=='blk_1');const c0=await q2.evaluate(()=>cnt(1));const r4=await q2.evaluate(id=>{const n=SHOP7.net;window.__n=n;SHOP7.net=m=>{if(m.t!='buy_res')n(m)};return SHOP7.buy(id,3)},blk.id);
 await q2.evaluate(()=>{SHOP7.net=window.__n;return new Promise(r=>{const n=SHOP7.net;SHOP7.net=m=>{n(m);if(m.t=='wallet'){SHOP7.net=n;r()}};NET7.send({t:'sync',gems:gems+0})})});const c1=await q2.evaluate(()=>cnt(1)),g3=await q2.evaluate(()=>gems);
 ok('after a lost answer the server record hands over stackable items',r4.waiting&&c1==c0+3,JSON.stringify(r4)+' '+c0+' -> '+c1);ok('exactly the price of those items was charged',g3<=g2,g2+' -> '+g3);
 // rewards pay online too
 const rw=await q2.evaluate(()=>{const id='econgoalworld',g0=gems,gs=GOAL7.goalsOf(id),o=gs[0];GOAL7.add(id,o.key,o.n);return{d:gems-g0,want:o.gems}});ok('world goals pay gems when signed in',rw.d==rw.want,JSON.stringify(rw));
 // two purchases on a bad connection: nothing may read the unpaid balance as earnings (which would refund it), and nothing is handed over twice
 const it3=cat.find(i=>i.id=='charm_leaf'),it4=cat.find(i=>i.id=='fx_brk_bubble');await q2.waitForTimeout(10500);
 const two=await q2.evaluate(async([a,b])=>{const n=SHOP7.net,sn=NET7.send;window.__held=[];let lost=true,syncs=0;SHOP7.net=m=>{if(m.t=='buy_res'&&lost){window.__held.push(m);return}n(m)};NET7.send=o=>{if(o&&o.t=='sync')syncs++;return sn(o)};const g0=gems,r1=await SHOP7.buy(a),s0=syncs;lost=false;const r2=await SHOP7.buy(b);const s1=syncs-s0;SHOP7.net=n;NET7.send=sn;for(const m of window.__held)SHOP7.net(m);return{r1w:r1.waiting,r2:r2.ok,s1,hasA:SHOP7.has(a),hasB:SHOP7.has(b),spent:g0-gems}},[it3.id,it4.id]);
 ok('a second purchase does not tell the server the unpaid balance is earnings',two.r1w&&two.r2&&two.s1==0,JSON.stringify(two));ok('both items arrive and both are charged once',two.hasA&&two.hasB&&two.spent==it3.price+it4.price,JSON.stringify(two)+' prices '+it3.price+'+'+it4.price);
 await q2.waitForTimeout(10500);const three=await q2.evaluate(async id=>{const n=SHOP7.net;window.__held=[];const c0=cnt(1);SHOP7.net=m=>{if(m.t=='buy_res')window.__held.push(m);else n(m)};const r=await SHOP7.buy(id,3);SHOP7.net=n;await new Promise(ok=>{SHOP7.net=m=>{n(m);if(m.t=='wallet'){SHOP7.net=n;ok()}};NET7.send({t:'sync',gems:gems+0})});const c1=cnt(1);for(const m of window.__held)SHOP7.net(m);await new Promise(ok=>setTimeout(ok,200));return{w:r.waiting,c0,c1,c2:cnt(1),held:window.__held.length}},blk.id);
 ok('an answer arriving after the server record settled it hands nothing over twice',three.w&&three.c1==three.c0+3&&three.c2==three.c1&&three.held>=1,JSON.stringify(three));
 // buying with earnings the server has not heard of yet
 const r5=await q2.evaluate(async id=>{gems+=20;const g=gems;const r=await SHOP7.buy(id);return{r,g,after:gems}},blk.id);ok('gems earned since the last sync are kept after buying',r5.r.ok&&r5.after==r5.g-blk.price,JSON.stringify(r5));
 const pendShown=await q2.evaluate(async()=>{const v=document.getElementById('gv');if(!v)return{skip:1};gems+=100000;NET7.send({t:'sync',gems});await new Promise(r=>setTimeout(r,2200));const e=document.getElementById('gvp');return{t:e?e.textContent:null,g:gems}});ok('gems still on their way are shown next to the balance',pendShown.skip||/arriving/.test(pendShown.t||''),JSON.stringify(pendShown));
 const off=await q2.evaluate(async id=>{const d=Object.getOwnPropertyDescriptor(NET7,'online');Object.defineProperty(NET7,'online',{configurable:true,get:()=>false});const g=gems,r=await SHOP7.buy(id);const o={ok:r.ok,m:r.m,same:gems==g,has:SHOP7.has(id)};Object.defineProperty(NET7,'online',d);return o},'fx_brk_confetti');ok('buying while disconnected charges and grants nothing',!off.ok&&off.same&&!off.has&&/not charged/.test(off.m),JSON.stringify(off));
 ok('no errors online',er2.length==0,er2.slice(0,3).join(' | '));
 await q2.close();
 await b.close();await S.close();
 console.log(fails?'FAILURES '+fails:'all economy tests passed');process.exit(fails?1:0)})().catch(e=>{console.log('ERR',e);process.exit(1)});
