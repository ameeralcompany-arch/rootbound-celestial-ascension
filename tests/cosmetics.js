// Cosmetics and earned gear on the server, tested the way a player's game (or a raw client) talks to it. No browser.
//   The odds of a rare find are exactly the advertised ones; a find only comes from a real, counted break of a natural tile near you; the duplicate rule walks down
//   the tiers and ends in gems; the per-minute cap holds; a find is saved at once, numbered, announced (top two tiers), and sent again until the game confirms it;
//   others only ever see cosmetics you own; the store sells cosmetics and refuses weapons, stat gear and finds; earned weapons need the right class and level;
//   the future real-money door is idempotent.   node tests/cosmetics.js
const path=require('path'),fs=require('fs'),os=require('os');const {createServer}=require('../server/server');const COSM=require('../server/cosmetics');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&x!==''?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},240000).unref();
const CAT=new Map(require('../server/catalog.json').items.map(i=>[i.id,i]));
function client(port){return new Promise((res,rej)=>{const w=new WebSocket('ws://127.0.0.1:'+port+'/ws');const c={msgs:[],send:o=>w.send(JSON.stringify(o)),close:()=>w.close(),
  all:t=>c.msgs.filter(m=>m.t==t),last:t=>c.all(t).slice(-1)[0],
  wait:async(t,ms=4000,from=0)=>{const t0=Date.now();while(Date.now()-t0<ms){const m=c.msgs.slice(from).find(x=>x.t==t);if(m)return m;await sleep(20)}return null}};
 w.onmessage=e=>{try{c.msgs.push(JSON.parse(e.data))}catch(_){}};w.onopen=()=>res(c);w.onerror=e=>rej(e)})}
const W=256,TILE=48;
(async()=>{
 // ---- 1. the odds, straight from the server's roll (two million rolls)
 {const C=COSM.createCosmetics({CAT,send(){},sessions:new Map(),saveAccNow(){},store:{audit(){}},acc:()=>({})});const N=2e6,n={ultra:0,mythical:0,extreme:0,veryrare:0,rare:0,none:0};for(let i=0;i<N;i++)n[C.roll()||'none']++;
  const want={ultra:1e-4,mythical:2e-4,extreme:5e-4,veryrare:1e-3,rare:5e-3};let good=true;const seen={};
  for(const t in want){const e=N*want[t],sd=Math.sqrt(e);seen[t]=(n[t]/N*100).toFixed(4)+'%';if(Math.abs(n[t]-e)>5*sd)good=false}
  ok('the five odds match the advertised 0.01% / 0.02% / 0.05% / 0.10% / 0.50% (2,000,000 rolls)',good,seen);
  const shown=require('../server/catalog.json').cosTiers;ok('the odds the game shows (catalog) and the server table are the same numbers',JSON.stringify(C.odds().map(o=>o.p))==JSON.stringify([1e-4,2e-4,5e-4,1e-3,5e-3])&&C.odds().every(o=>shown[o.t]&&shown[o.t].p===o.p),C.odds())}
 // ---- a server whose rolls we choose (tests only), counting every roll it makes
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbcos-'));let force=null,rolls=0;
 const mk=()=>createServer({csp:false,port:0,host:'127.0.0.1',dataDir:dir,scryptN:64,maxConnsPerIp:200,regPerIp:50,cosRoll:()=>{rolls++;return force}});
 let S=mk(),port=await S.listen();
 const account=async(name)=>{const c=await client(port);await c.wait('server',3000);c.send({t:'register',name,pass:'a-good-long-pass-7'});const a=await c.wait('auth');return{c,a}};
 const {c:A,a:aa}=await account('Finder_1');ok('an account can be made',aa&&aa.ok,aa&&aa.m);
 const {c:B}=await account('Watcher_2');
 for(const c of[A,B]){c.send({t:'enter',w:'cosmine',create:true});await c.wait('joined')}
 const at=(c,tx,ty)=>c.send({t:'_p',d:{x:tx*TILE,y:ty*TILE,f:1}});
 at(A,40,20);await sleep(80);
 let tile=0;const brk=async(c,o={})=>{const k=o.k!=null?o.k:(24+(tile/10|0))*W+(41+tile%10);if(o.k==null)tile++;const from=c.msgs.length;c.send({t:'e',d:Object.assign({k,a:[0,0,0,0]},o.br===null?{}:{br:o.br===undefined?1:o.br})});await sleep(o.wait||60);return{k,got:c.msgs.slice(from).filter(m=>m.t=='cosm')}};
 // ---- 2. what never counts
 force='ultra';rolls=0;
 {const r=await brk(A,{br:null});ok('an edit that is not a break (no break mark) never rolls',rolls==0&&!r.got.length,{rolls})}
 {const k=21*W+44;A.send({t:'e',d:{k,a:[3,0,0,0]}});await sleep(60);const r=await brk(A,{k});ok('breaking a tile someone placed (not natural) never rolls',rolls==0&&!r.got.length,{rolls})}
 {const r=await brk(A,{k:20*W+120});ok('breaking far from where you stand never rolls',rolls==0&&!r.got.length,{rolls})}
 {const k=22*W+42;A.send({t:'e',d:{k,a:[5,0,0,0],br:1}});await sleep(60);ok('turning a tile into a block (not air) never rolls',rolls==0,{rolls})}
 // ---- 3. a find: saved, numbered, sent, announced
 rolls=0;const f1=await brk(A,{wait:250});const m1=f1.got[0];
 ok('a counted break rolls exactly once',rolls==1,{rolls});
 {rolls=0;A.send({t:'e',d:{k:f1.k,a:[0,0,0,0],br:1}});await sleep(80);ok('the same tile never counts twice',rolls==0,{rolls})}
 ok('an Ultra-exclusive roll gives the one Ultra-exclusive cosmetic, numbered #1',m1&&m1.id=='cos_nebula_suit'&&m1.tier=='ultra'&&m1.ser==1,m1);
 const ann=await B.wait('cosann',3000);ok('everyone online hears about an Ultra-exclusive find (name and item only)',ann&&ann.d&&ann.d.id=='cos_nebula_suit'&&ann.d.n=='Finder_1'&&Object.keys(ann.d).sort().join()=='id,n,ser,tier',ann&&ann.d);
 await sleep(400);const acc1=JSON.parse(fs.readFileSync(path.join(dir,'accounts.json'),'utf8'));const u1=Object.values(acc1.users||acc1).find(u=>u&&u.name=='Finder_1');
 ok('the find is on disk at once',!!(u1&&u1.cos&&u1.cos.own&&u1.cos.own.cos_nebula_suit),u1&&u1.cos);
 ok('and written in the audit log',S.store.readAudit(80).some(x=>x.ev=='cosmetic'&&x.id=='cos_nebula_suit'));
 // ---- 4. the duplicate rule: down the tiers, then gems
 const got=[m1&&m1.id];let gems=null;for(let i=0;i<16;i++){const r=await brk(A,{wait:90});for(const m of r.got){if(m.all)gems=m;else got.push(m.id)}}
 const drops=[...CAT.values()].filter(i=>i.cat=='cosmetics'&&i.how=='drop').map(i=>i.id);
 ok('Ultra rolls on an owned Ultra walk down: every findable cosmetic once, never a duplicate',new Set(got).size==got.length&&drops.every(id=>got.includes(id))&&got.length==drops.length,{n:got.length,of:drops.length});
 ok('once every findable cosmetic is owned, a find pays gems instead',gems&&gems.gems==3000&&gems.tier=='ultra',gems);
 const tiersInOrder=got.filter(Boolean).map(id=>CAT.get(id).tier);const ordr=COSM.ORDER;ok('and they came rarest tier first',tiersInOrder.every((t,i)=>i==0||ordr.indexOf(t)>=ordr.indexOf(tiersInOrder[i-1])),tiersInOrder.join(' '));
 // ---- 5. the per-minute cap (60 counted breaks a minute for one account)
 {const {c:C}=await account('Capper_3');C.send({t:'enter',w:'cosmine',create:true});await C.wait('joined');at(C,40,60);await sleep(80);force=null;rolls=0;
  for(let i=0;i<75;i++){C.send({t:'e',d:{k:(56+(i/20|0))*W+(30+i%20),a:[0,0,0,0],br:1}});if(i%8==7)await sleep(1100)}await sleep(400);
  ok('an account counts at most 60 breaks a minute',rolls==60,{rolls});C.close()}
 // ---- 6. others see only what you own
 {const ord=id=>CAT.get(id).ord;const {c:D}=await account('Poser_4');D.send({t:'enter',w:'cosmine',create:true});await D.wait('joined');D.send({t:'_p',d:{x:100,y:100,f:1,cx:{cz:[ord('cos_galaxy_cloak'),ord('cos_ribbon_bow')]}}});await sleep(150);
  const seen=B.all('_p').filter(m=>m.d&&m.d.n=='Poser_4').slice(-1)[0];ok('a cosmetic you do not own is removed before others see it',seen&&seen.d.cx&&Array.isArray(seen.d.cx.cz)&&seen.d.cx.cz.length==0,seen&&seen.d.cx);
  A.send({t:'_p',d:{x:40*TILE,y:20*TILE,f:1,cx:{cz:[ord('cos_galaxy_cloak')]}}});await sleep(150);const sa=B.all('_p').filter(m=>m.d&&m.d.n=='Finder_1').slice(-1)[0];
  ok('a cosmetic you found is shown to others',sa&&sa.d.cx&&sa.d.cx.cz&&sa.d.cx.cz[0]==ord('cos_galaxy_cloak'),sa&&sa.d.cx);
  // ---- 7. the store: cosmetics yes; weapons, gear and finds no
  D.send({t:'sync',gems:1500});await D.wait('wallet');let rn=0;const buy=async(id)=>{const from=D.msgs.length;D.send({t:'buy',id,rid:'r'+id+(rn++)});const t0=Date.now();while(Date.now()-t0<3000){const m=D.msgs.slice(from).find(x=>x.t=='buy_res');if(m)return m;await sleep(20)}return null};
  const b1=await buy('cos_ribbon_bow');ok('a store cosmetic can be bought with gems',b1&&b1.ok,b1);
  const b2=await buy('wpn_frost');ok('a weapon cannot be bought: it is earned',b2&&!b2.ok&&/earned/.test(b2.m),b2&&b2.m);
  const b3=await buy('wear_helmet');ok('stat gear cannot be bought: it is earned',b3&&!b3.ok,b3&&b3.m);
  const b4=await buy('cos_galaxy_cloak');ok('a rare find cannot be bought',b4&&!b4.ok,b4&&b4.m);
  D.send({t:'_p',d:{x:100,y:100,f:1,cx:{cz:[ord('cos_ribbon_bow')]}}});await sleep(150);const s2=B.all('_p').filter(m=>m.d&&m.d.n=='Poser_4').slice(-1)[0];ok('once bought, it is shown to others',s2&&s2.d.cx&&s2.d.cx.cz&&s2.d.cx.cz[0]==ord('cos_ribbon_bow'),s2&&s2.d.cx);
  // ---- 8. earned weapons: the right class and level only
  const earn=async(o)=>{const from=D.msgs.length;D.send(Object.assign({t:'earn'},o));const t0=Date.now();while(Date.now()-t0<3000){const m=D.msgs.slice(from).find(x=>x.t=='earned');if(m)return m.ids;await sleep(20)}return null};
  const e1=await earn({ids:['wpn_frost'],cls:'knight',clv:5,lv:30});ok('a weapon is not recorded below its class level',e1&&!e1.includes('wpn_frost'),e1);
  const e2=await earn({ids:['wpn_frost'],cls:'samurai',clv:40,lv:60});ok('another class cannot claim a Knight weapon',e2&&!e2.includes('wpn_frost'),e2);
  const e3=await earn({ids:['wpn_frost','wear_helmet','cos_ribbon_bow'],cls:'knight',clv:11,lv:3});ok('the right class at the right level records it (and gear by player level); a cosmetic is never "earned"',e3&&e3.includes('wpn_frost')&&e3.includes('wear_helmet')&&!e3.includes('cos_ribbon_bow'),e3);
  D.close()}
 // ---- 9. a find the game never confirmed comes again; a confirmed one does not; everything survives a server restart
 {const tok=aa.token;A.close();B.close();await sleep(200);await S.close();S=mk();port=await S.listen();
  const R=await client(port);await R.wait('server',3000);R.send({t:'resume',token:tok});await R.wait('auth');const w=await R.wait('cosw');await sleep(150);const again=R.all('cosm').filter(m=>m.again);
  ok('after a restart the account still owns all its finds',w&&drops.every(id=>w.own.includes(id)),w&&w.own.length);
  ok('finds the game never confirmed are sent again on sign-in',again.length>=10,again.length);
  for(const m of again)R.send({t:'cosack',id:m.id});await sleep(150);R.close();const R2=await client(port);await R2.wait('server',3000);R2.send({t:'resume',token:tok});await R2.wait('auth');await R2.wait('cosw');await sleep(200);
  ok('once confirmed, they are not sent again',R2.all('cosm').length==0,R2.all('cosm').length);R2.close()}
 // ---- 10. the one door for future purchases is idempotent
 {const u={id:'x1',name:'Payer'};const r1=S.cos.grantEnt(u,'cos_moon_cape','steam','TX-1'),r2=S.cos.grantEnt(u,'cos_moon_cape','steam','TX-1'),r3=S.cos.grantEnt(u,'wpn_frost','steam','TX-2');
  ok('a purchase grant with the same transaction id is applied once',r1.ok&&r2.dup&&Object.keys(u.cos.own).length==1,{r1,r2});ok('it cannot grant anything but a cosmetic',!r3.ok)}
 // ---- 11. the Plaza's rewards are paid by the server, once per account, only in the Plaza
 {const {c:E}=await account('Climber_5');const pz=async(o)=>{const from=E.msgs.length;E.send(Object.assign({t:'plz'},o));const t0=Date.now();while(Date.now()-t0<2500){const m=E.msgs.slice(from).find(x=>x.t=='plz');if(m)return m;await sleep(20)}return null};
  E.send({t:'enter',w:'cosmine',create:true});await E.wait('joined');const away=await pz({op:'stone',id:0});ok('Plaza rewards are not paid outside the Plaza',!away,away);
  const from=E.msgs.length;E.send({t:'enter',w:'plaza'});await E.wait('joined',4000,from);
  const g=[];for(let i=0;i<7;i++)g.push((await pz({op:'stone',id:i})).gems);const again=await pz({op:'stone',id:3});
  ok('each Spirit Stone pays 50 once, and the seventh adds 500 for all seven',g.slice(0,6).every(x=>x==50)&&g[6]==550&&again&&again.gems==0&&again.dup==1,{g,again});
  const fast=await pz({op:'sky',ms:4000});ok('a Sky Run faster than anyone can climb pays nothing',fast&&fast.gems==0,fast);
  const sky=await pz({op:'sky',ms:61000}),sky2=await pz({op:'sky',ms:58000});ok('a Sky Run under 90 seconds pays 150 once',sky&&sky.gems==150&&sky2&&sky2.gems==0,{sky,sky2});
  const w=E.last('wallet');ok('the wallet the server holds went up by exactly 1,000',w&&w.gems==1000,w&&w.gems);E.close()}
 await S.close();try{fs.rmSync(dir,{recursive:true,force:true})}catch(_){}
 console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1)});
