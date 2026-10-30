const {chromium}=require('playwright');let fails=0;const HERO12_LINES_OK=h=>typeof h.sub=='string'&&h.sub.length>5;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x?'  - '+x:''));if(!c)fails++};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox']});
for(const vp of [[1280,720],[390,800],[1920,1080]]){const p=await b.newPage({viewport:{width:vp[0],height:vp[1]}});const e=[];p.on('pageerror',x=>e.push(x.message));
await p.goto('file://'+__dirname+'/../index.html');await p.waitForTimeout(700);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}});await p.evaluate(()=>SHOW7.open());await p.waitForTimeout(800);
const tag=' @'+vp[0];
ok('showcase opens after launch'+tag,await p.evaluate(()=>SHOW7.isOpen));
const nm=()=>p.evaluate(()=>document.querySelector('#show .name').innerText.replace(/\n/g,' '));
const n0=await nm();await p.keyboard.press('ArrowRight');await p.waitForTimeout(900);const n1=await nm();
ok('only your own character is in the gallery (old presets removed); arrow keys stay on it'+tag,n0==n1&&await p.evaluate(()=>SHOW7.CHARS.length==1&&SHOW7.CHARS[0].id=='you'&&!document.body.innerText.match(/Yuzuki|Kaede|Hoarfrost|Emberleaf|Skyward/)),n0+' -> '+n1);
const c=await p.evaluate(()=>({cur:SHOW7.cur,name:document.querySelector('#show .name').innerText.replace(/\n/g,' ').toLowerCase(),want:(SHOW7.CHARS[SHOW7.cur].first||'').toLowerCase()}));
ok('info matches selected character'+tag,!c.want||c.name.startsWith(c.want),JSON.stringify(c));
ok('no horizontal overflow'+tag,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
ok('canvas has pixels'+tag,await p.evaluate(()=>{const c=document.getElementById('showCv'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4*50)if(d[i])n++;return n>50}));
if(vp[0]==1280){
 ok('your character can always Play; the gallery has one tile and no preset arrows',await p.evaluate(()=>{SHOW7.cur=0;SHOW7.render();return !document.querySelector('[data-a=play]').disabled&&document.querySelectorAll('#show .gal .gt').length==1&&getComputedStyle(document.querySelector('#show .idx .arrows')).visibility=='hidden'}));
 await p.evaluate(()=>{SHOW7.cur=0;SHOW7.render()});
 await p.click('[data-a=fav]');ok('favorite toggles + persists',await p.evaluate(()=>X6.sc.fav[0]==1&&document.querySelector('[data-a=fav]').classList.contains('on')));
 await p.click('[data-a=gmenu]');await p.click('[data-g=wings]');ok('gallery switches to wings',await p.evaluate(()=>X6.sc.gal=='wings'));
 await p.click('#show nav a[data-n=inv]');await p.waitForTimeout(700);ok('Inventory nav opens inventory + closes showcase',await p.evaluate(()=>!SHOW7.isOpen&&!!document.querySelector('#inv7')&&getComputedStyle(document.querySelector('#inv7')).display!='none'));
 await p.keyboard.press('Escape');await p.waitForTimeout(300);
 await p.evaluate(()=>SHOW7.open());await p.waitForTimeout(400);
 await p.click('#show nav a[data-n=store]');await p.waitForTimeout(500);ok('Store nav opens the full store',await p.evaluate(()=>STORE7.isOpen));await p.evaluate(()=>STORE7.close());await p.waitForTimeout(300);
 ok('UIS volume/mute state exists',await p.evaluate(()=>typeof UIS.play=='function'));
 await p.evaluate(()=>{cel.opt.theme='dark';celSave();SHOW7.open()});await p.waitForTimeout(500);
 ok('showcase follows the dark theme',await p.evaluate(()=>getComputedStyle(document.getElementById('show')).backgroundImage.includes('29, 22, 49')&&getComputedStyle(document.querySelector('#show .name')).color!='rgb(20, 18, 26)'));
 await p.evaluate(()=>{cel.opt.theme='light';celSave()});
}
// hero reveal (HERO12): plays once on the first open, shows a line as a subtitle (silent), the full-screen veil goes away, clicking the portrait speaks again
if(vp[0]==1280){const h=await p.evaluate(async()=>{const a={rv:HERO12.S.rv>0,sub1:HERO12.sub,veil:!!document.getElementById('h12veil')};await new Promise(r=>setTimeout(r,4200));
  a.sub=HERO12.sub;a.veilGone=!document.getElementById('h12veil');a.panel=!document.getElementById('show').classList.contains('h12rev');const s0=HERO12.sub;await new Promise(r=>setTimeout(r,3200));document.getElementById('showCv').click();a.click=HERO12.sub&&HERO12.LINES.includes(HERO12.sub);return a});
 ok('hero reveal plays on open, shows a line (subtitle), veil + hidden panel are gone after; clicking the portrait speaks again'+tag,h.rv&&h.sub&&HERO12_LINES_OK(h)&&h.veilGone&&h.panel&&h.click,JSON.stringify(h))}
ok('no page errors'+tag,e.length==0,e.join('|'));await p.close()}
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
