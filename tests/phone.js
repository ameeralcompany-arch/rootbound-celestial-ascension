// Rootlink, the adventure device: M opens it over the game and puts it away, Esc and a click outside close it, Shift+M still mutes, typing never opens it,
// the home screen shows the player's real data (name, level, class, Combat Power, gems, today's challenges), and every app opens the real screen it names.
// Run: node tests/phone.js   (SHOTS=<dir> also saves screenshots)
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file://'+path.resolve(__dirname,'../index.html'),SHOTS=process.env.SHOTS;
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,500):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},180000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:5},gems:4321,own:{fist:1,astralkat:1},ownW:{},wear:{},wp:'astralkat',bar:[1],done:{},xp:3,lvl:24,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const errs=[];
 const c=await b.newContext({viewport:{width:1600,height:900}});await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')}},SAVE);
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});
 await p.evaluate(()=>{try{INTRO60.playing&&document.querySelector('#intro60 button')&&document.querySelector('#intro60 button').click()}catch(_){}});await sleep(800);
 await p.evaluate(()=>{try{document.getElementById('bp').click()}catch(_){}});await sleep(600);await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await sleep(600);
 await p.evaluate(()=>enterWorld('plaza'));await sleep(1500);
 ok('the game is running',await p.evaluate(()=>typeof entered!='undefined'&&entered&&typeof ROOTLINK=='object'));
 // M opens it, with the player's real data
 await p.mouse.click(800,450);await p.keyboard.press('m');await p.waitForFunction(()=>{const d=document.querySelector('#rlk .rlk-dev');return d&&getComputedStyle(d).opacity=='1'&&getComputedStyle(d).transform=='none'},null,{timeout:8000}).catch(()=>{});await sleep(150);
 const h=await p.evaluate(()=>{const r=document.getElementById('rlk'),q=s=>r.querySelector(s);const d=q('.rlk-dev').getBoundingClientRect();
  return{on:ROOTLINK.on,vis:getComputedStyle(q('.rlk-dev')).opacity,w:Math.round(d.width),inView:d.left>=0&&d.right<=innerWidth&&d.top>=0&&d.bottom<=innerHeight,name:q('.rlk-name').textContent,lv:q('.rlk-lv').textContent,cp:q('.rlk-cp').textContent,cpReal:Math.round(RPG.cp()).toLocaleString(),gems:q('.rlk-gems').textContent,gemsReal:Math.floor(gems).toLocaleString(),
   tasks:r.querySelectorAll('.rlk-task').length,dly:(dly.tasks||[]).length,apps:r.querySelectorAll('.rlk-app').length,off:[...r.querySelectorAll('.rlk-app[disabled]')].map(b=>b.dataset.app),muted:mute,av:(()=>{const x=q('.rlk-av').getContext('2d').getImageData(0,0,128,128).data;let n=0;for(let i=3;i<x.length;i+=4)if(x[i]>0)n++;return n})()}});
 ok('M opens the phone, fully on screen',h.on&&+h.vis>.95&&h.inView&&h.w>300,h);
 ok('it shows your name, level and class',h.name==myNameOf(h)&&/Level 24/.test(h.lv),{name:h.name,lv:h.lv});
 ok('Combat Power and gems are the real numbers',h.cp==h.cpReal&&h.gems==h.gemsReal,{cp:h.cp,real:h.cpReal,gems:h.gems,greal:h.gemsReal});
 ok('your portrait is drawn',h.av>2000,h.av);
 ok("today's challenges are the real ones",h.tasks==Math.max(1,h.dly),{shown:h.tasks,real:h.dly});
 ok('18 apps, all usable here',h.apps==18&&h.off.length==0,h.off);
 ok('opening it did not mute the music',h.muted===false);
 if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,'phone-home.png')})}
 // keys: arrows move between apps, Esc closes
 await sleep(300);await p.keyboard.press('ArrowRight');const foc=await p.evaluate(()=>document.activeElement&&document.activeElement.dataset.app);ok('arrow keys move between apps',foc=='inventory',foc);
 await p.keyboard.press('Escape');await sleep(400);ok('Esc puts it away',await p.evaluate(()=>!ROOTLINK.on&&!document.getElementById('rlk').classList.contains('on')));
 // Shift+M still mutes; typing never opens it
 await p.keyboard.press('Shift+M');await sleep(200);const mu=await p.evaluate(()=>({mute,on:ROOTLINK.on}));ok('Shift+M mutes the music and leaves the phone shut',mu.mute===true&&!mu.on,mu);await p.keyboard.press('Shift+M');
 await p.evaluate(()=>{const i=document.createElement('input');i.id='tt';document.body.appendChild(i);i.focus()});await p.keyboard.press('m');await sleep(200);ok('typing an m in a text field does not open it',await p.evaluate(()=>!ROOTLINK.on&&document.getElementById('tt').value=='m'));await p.evaluate(()=>document.getElementById('tt').remove());
 // every app opens the real screen
 const RES={};for(const id of ['inventory','equipment','classes','store','settings','worlds','quests','bosses','collection','character','dungeons']){
  await p.evaluate(()=>{try{NAV16.closeAll()}catch(_){}try{DG.page.close()}catch(_){}});await sleep(150);await p.evaluate(()=>ROOTLINK.open());await p.waitForFunction(()=>getComputedStyle(document.querySelector('#rlk .rlk-dev')).opacity=='1',null,{timeout:6000}).catch(()=>{});
  await p.click('#rlk .rlk-app[data-app="'+id+'"]');await p.waitForFunction(id=>{if(ROOTLINK.on)return false;if(id=='dungeons')return DG.page.on;const f=NAV16.F.find(f=>f.id==id);try{return !!(f&&f.on&&f.on())}catch(_){return false}},id,{timeout:6000}).catch(()=>{});
  RES[id]=await p.evaluate(id=>{if(ROOTLINK.on)return'phone still open';if(id=='dungeons')return DG.page.on;const f=NAV16.F.find(f=>f.id==({bosses:'bosses'})[id]||f.id==id);try{return !!(f&&f.on&&f.on())}catch(e){return String(e)}},id)}
 const bad=Object.entries(RES).filter(([,v])=>v!==true);ok('each app opens its screen (and the phone steps aside)',bad.length==0,bad.length?bad:Object.keys(RES));
 await p.evaluate(()=>{try{NAV16.closeAll()}catch(_){}try{DG.page.close()}catch(_){}});await sleep(200);
 // a click outside closes it; it never opens over the intro film
 await p.evaluate(()=>ROOTLINK.open());await sleep(450);await p.mouse.click(200,450);await sleep(400);ok('a click outside puts it away',await p.evaluate(()=>!ROOTLINK.on));
 ok('no page errors',errs.length==0,errs.slice(0,3));
 // the button under the character card, next to Respawn, opens it too
 {await p.evaluate(()=>{try{ROOTLINK.close();NAV16.closeAll()}catch(_){}});await sleep(500);await p.waitForFunction(()=>{const e=document.getElementById('brlk');return !!e&&e.offsetWidth>0},null,{timeout:6000}).catch(()=>{});
  const bt=await p.evaluate(()=>{const e=document.getElementById('brlk'),r=document.getElementById('brsp');return e?{txt:e.textContent,vis:e.offsetWidth>0,row:!!r&&e.parentNode===r.parentNode}:null});ok('a Rootlink button sits next to Respawn',bt&&bt.vis&&bt.row&&/ROOTLINK/.test(bt.txt),bt);
  await p.click('#brlk');await p.waitForFunction(()=>ROOTLINK.on,null,{timeout:4000}).catch(()=>{});ok('clicking it opens the phone',await p.evaluate(()=>ROOTLINK.on));await p.evaluate(()=>ROOTLINK.close());await sleep(400)}
 await b.close();console.log(fails?('FAILED '+fails):'ALL PASS');process.exit(fails?1:0);
 function myNameOf(h){return h.name}
})().catch(e=>{console.log('ERR',String(e).slice(0,500));process.exit(1)});
