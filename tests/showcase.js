const {chromium}=require('playwright');let fails=0;const HERO12_LINES_OK=h=>typeof h.sub=='string'&&h.sub.length>5;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x?'  - '+x:''));if(!c)fails++};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox']});
// the home page (SHOW7's gallery screen) was removed: nothing opens it, the HUD has no Home button, and SHOW7.open() just starts the game
{const p=await b.newPage({viewport:{width:1280,height:720}});const e=[];p.on('pageerror',x=>e.push(x.message));
await p.goto('file://'+__dirname+'/../index.html');await p.waitForTimeout(900);
ok('no home page after launch and no Home button',await p.evaluate(()=>!SHOW7.isOpen&&!document.getElementById('bhome')&&(!document.getElementById('show')||getComputedStyle(document.getElementById('show')).display=='none')));
await p.evaluate(()=>SHOW7.open());await p.waitForTimeout(600);
ok('SHOW7.open() starts the game instead of showing the home page',await p.evaluate(()=>!SHOW7.isOpen&&(!document.getElementById('show')||getComputedStyle(document.getElementById('show')).display=='none')&&(entered||creatorOn||menuEl.style.display!='none')));
ok('no page errors',e.length==0,e.join('|'));await p.close()}
// ---- migration: a save made with a preset character active (and preset slots / favourites) is cleaned on load; your own look, level,
// gems, inventory and gear stay exactly as they were
{const ctx=await b.newContext({viewport:{width:1280,height:720}});const q=await ctx.newPage();const e=[];q.on('pageerror',x=>e.push(x.message));
 const own={hair:3,eyes:2,outfit:1,acc:1,cape:2,eyeCol:4,hairCol:'#aa3344',skinCol:'#eebb99',outCol:'#224466',trimCol:'#ddcc88'},pre={hair:5,eyes:2,outfit:3,acc:4,cape:0,eyeCol:2,hairCol:'#b3263a',skinCol:'#f1c9a0',outCol:'#2a1c1c',trimCol:'#c9a227',gd:2};
 await q.addInitScript(([own,pre])=>{if(localStorage.getItem('mig9'))return;localStorage.setItem('mig9','1');localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}));
  localStorage.setItem('rbc2',JSON.stringify({sc:{act:2,looks:[own,null,pre,null,null,null],fav:{0:1,2:1,4:1},gal:'chars'},wx:{}}));
  localStorage.setItem('rbp',JSON.stringify({v:1,gems:4321,lvl:37,own:{fist:1,solarfang:1},wp:'solarfang',inv:{3:12,240:2},ownW:{helmet:1},wear:{hat:'helmet'}}));
  const c=JSON.parse(localStorage.getItem('rbc')||'{}');c.ap=Object.assign({},pre);localStorage.setItem('rbc',JSON.stringify(c))},[own,pre]);
 await q.goto('file://'+__dirname+'/../index.html');await q.waitForTimeout(1500);
 const r=await q.evaluate(own=>{const sc=X6.sc,L=sc.looks[0]||{},same=Object.keys(own).every(k=>L[k]===own[k]),live=Object.keys(own).every(k=>cel.ap[k]===own[k]);const saved=JSON.parse(localStorage.getItem('rbc2'));
  return{act:sc.act,n:sc.looks.filter(Boolean).length,len:sc.looks.length,same,live,fav:Object.keys(sc.fav),savedAct:saved.sc.act,savedN:saved.sc.looks.length,lvl,gems,stone:cnt(3),fish:cnt(240),wp,hat:wear.hat,mig:CHARMIG9.did}},own);
 ok('migration: preset character slots are removed from an old save, your own look becomes active again (and is saved)',r.mig&&r.act==0&&r.len==1&&r.same&&r.live&&r.fav.join()=='0'&&r.savedAct==0&&r.savedN==1,JSON.stringify(r));
 ok('migration keeps level, gems, inventory, weapon and gear untouched',r.lvl==37&&r.gems>=4321/* (level achievements may add gems on load) */&&r.stone==12&&r.fish==2&&r.wp=='solarfang'&&r.hat=='helmet',JSON.stringify(r));
 // a second load is a no-op
 await q.reload();await q.waitForTimeout(1200);const r2=await q.evaluate(()=>({mig:CHARMIG9.did,act:X6.sc.act,len:X6.sc.looks.length}));
 ok('migration runs once per save (a clean save is left alone)',!r2.mig&&r2.act==0&&r2.len==1,JSON.stringify(r2));
 ok('migration: no page errors',e.length==0,e.join('|'));await ctx.close()}
await b.close();console.log(fails?'FAILURES '+fails:'all showcase tests passed');process.exit(fails?1:0)})();
