// The brand and design system (docs/brand.md): the logo reveal at launch (after the intro film, removed afterwards, never blocking), the design tokens on the default
// look only (serif titles, cream ink, gold lines) while the other looks keep theirs, the rarity ladder (legendary items get a light sweep), and Weapon Mastery (defeats
// with a weapon count, the first level pays gems once and puts a star on the weapon's inventory tile, Rootlink opens the Mastery page, progress is kept).
// Run: node tests/brand.js   (SHOTS=<dir> saves screenshots)
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file://'+path.resolve(__dirname,'../index.html'),SHOTS=process.env.SHOTS;
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},200000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:20},gems:1000,own:{fist:1,astralkat:1,sakurakat:1,titanmaul:1},ownW:{},wear:{},wp:'astralkat',bar:[1],done:{},xp:3,lvl:30,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio','--autoplay-policy=no-user-gesture-required']});const errs=[];
 // the launch: intro film, then the logo reveal over the starting game
 {const c=await b.newContext({viewport:{width:1600,height:900}});await c.addInitScript(()=>{localStorage.setItem('rb_force_launch','1');localStorage.setItem('rbg_seen','1')});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.goto(FILE);await p.waitForFunction(()=>typeof INTRO60!='undefined'&&INTRO60.playing,null,{timeout:90000});await sleep(1200);await p.evaluate(()=>INTRO60.seek(43.2));
  await p.waitForFunction(()=>!!document.getElementById('brandrev'),null,{timeout:15000}).catch(()=>{});const r=await p.evaluate(()=>{const o=document.getElementById('brandrev');return o?{pe:getComputedStyle(o).pointerEvents,word:o.querySelector('.br-word').textContent,sym:!!o.querySelector('.br-sym .br-ring')}:null});
  ok('after the intro film the logo reveals itself over the game, never blocking it',r&&r.pe=='none'&&r.word=='ROOTBOUND'&&r.sym,r);await sleep(2200);if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,'reveal.png')})}
  await sleep(3200);ok('then it is gone',await p.evaluate(()=>!document.getElementById('brandrev')));await c.close()}
 const c=await b.newContext({viewport:{width:1600,height:900}});await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')}},SAVE);
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
 const boot=async()=>{await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});await sleep(1500);await p.evaluate(()=>{try{RPG.guide.stop()}catch(_){}enterWorld('plaza')});await sleep(1200)};
 await p.goto(FILE,{waitUntil:'commit'});await boot();
 // design tokens on the default look
 const ds=await p.evaluate(async()=>{NAV16.act('character');await new Promise(r=>setTimeout(r,600));const t=document.querySelector('#hubhead b'),h=document.getElementById('hubc');const o={skin:document.documentElement.dataset.skin,ff:getComputedStyle(t).fontFamily,bg:getComputedStyle(h).backgroundImage,ink:getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()};NAV16.closeAll();return o});
 ok('the default look uses the brand: serif titles, cream ink, deep-violet glass',ds.skin=='night'&&/Cormorant/.test(ds.ff)&&ds.ink.toUpperCase()=='#F6F1E7'&&/36, 26, 66/.test(ds.bg),ds);
 const cl=await p.evaluate(async()=>{const d=document.documentElement,s0=d.getAttribute('data-skin');d.setAttribute('data-skin','clean');NAV16.act('character');await new Promise(r=>setTimeout(r,500));const ff=getComputedStyle(document.querySelector('#hubhead b')).fontFamily;NAV16.closeAll();d.setAttribute('data-skin',s0);return ff});
 ok('the other looks keep their own styles',!/Cormorant/.test(cl),cl);
 // Weapon Mastery: defeats with the weapon in hand
 const g0=await p.evaluate(()=>{MASTERY1.reset();wp='astralkat';return gems});await p.evaluate(()=>{for(let i=0;i<10;i++)stat('kill',1)});
 const m=await p.evaluate(()=>({e:MASTERY1.S.w.astralkat,gems}));ok('ten defeats with the Astral Katana reach mastery I and pay its 50 gems',m.e&&m.e.k==10&&m.e.l==1&&m.gems>=g0+50,{m,g0});
 await p.evaluate(()=>{for(let i=0;i<5;i++)stat('kill',1);wp='fist';stat('kill',1)});ok('no extra payment for more defeats at the same level, and bare fists do not count',await p.evaluate(()=>MASTERY1.S.w.astralkat.l==1&&!MASTERY1.S.w.fist));
 await p.evaluate(()=>NAV16.act('inventory'));await sleep(900);const star=await p.evaluate(()=>{const t=document.querySelector('#inv7 .it7[data-k="w:astralkat"]');return t?(t.querySelector('.wm1')||{}).textContent:null});
 ok('the weapon\'s inventory tile shows its star',star=='★',star);
 const leg=await p.evaluate(()=>{const t=document.querySelector('#inv7 .it7[data-rar=legendary],#inv7 .it7[data-rar=mythic]');if(!t)return null;return{r:t.dataset.rar,after:getComputedStyle(t,'::after').animationName,before:getComputedStyle(t,'::before').animationName}});
 ok('a legendary or mythic item is animated, a common one calm',leg&&(leg.after!='none'||leg.before!='none')&&await p.evaluate(()=>{const t=document.querySelector('#inv7 .it7[data-rar=common]');return !t||getComputedStyle(t,'::after').animationName=='none'}),leg);
 if(SHOTS)await p.screenshot({path:path.join(SHOTS,'inventory.png')});
 await p.evaluate(()=>{NAV16.closeAll();ROOTLINK.open()});await p.waitForFunction(()=>getComputedStyle(document.querySelector('#rlk .rlk-dev')).opacity=='1',null,{timeout:6000}).catch(()=>{});
 await p.click('#rlk .rlk-app[data-app=mastery]');await p.waitForFunction(()=>MASTERY1.on,null,{timeout:5000}).catch(()=>{});await sleep(300);
 const pg=await p.evaluate(()=>({on:MASTERY1.on,rows:document.querySelectorAll('#wm1 .wm-row').length,top:(document.querySelector('#wm1 .wm-row b')||{}).textContent,stars:document.querySelectorAll('#wm1 .wm-row:first-child .wm-stars i.on').length}));
 ok('Rootlink opens the Mastery page, every owned weapon listed, the most used first',pg.on&&pg.rows>=3&&/Astral/.test(pg.top)&&pg.stars==1,pg);if(SHOTS)await p.screenshot({path:path.join(SHOTS,'mastery.png')});
 await p.keyboard.press('Escape');await sleep(200);ok('Esc closes it',await p.evaluate(()=>!MASTERY1.on));
 await sleep(5500);await p.reload({waitUntil:'commit'});await boot();ok('mastery is kept after a reload',await p.evaluate(()=>MASTERY1.S.w.astralkat&&MASTERY1.S.w.astralkat.k==15));
 ok('no page errors',errs.length==0,errs.slice(0,3));
 await b.close();console.log(fails?('FAILED '+fails):'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.log('ERR',String(e).slice(0,500));process.exit(1)});
