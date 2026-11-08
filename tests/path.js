// The First Realm road (src/js/late/99-zzzzzzzzzz-k-path.js): land 1 open, lands 2 and 3 locked by every route (typing, enterWorld, loadWorld, a realm built on a locked land),
// questlines count only real things done in that land and in order, finishing one opens the next with its unlock moment, progress survives a restart, the page explains each lock,
// the lands are generated with their own ground, and the player lands standing on it. Run: node tests/path.js   (SHOTS=<dir> saves screenshots)
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file://'+path.resolve(__dirname,'../index.html'),SHOTS=process.env.SHOTS;
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},280000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:20},gems:1000,own:{fist:1,astralkat:1},ownW:{},wear:{},wp:'astralkat',bar:[1],done:{},xp:3,lvl:20,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const errs=[];
 const c=await b.newContext({viewport:{width:1600,height:900}});await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')}},SAVE);
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
 const boot=async()=>{await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});await sleep(1500);await p.evaluate(()=>{try{RPG.guide.stop()}catch(_){}enterWorld('plaza')});await sleep(1000)};
 const go=async n=>{await p.evaluate(n=>enterWorld(n),n);await sleep(1400);return p.evaluate(()=>cur)};
 await p.goto(FILE,{waitUntil:'commit'});await boot();
 // the road page
 const page0=await p.evaluate(async()=>{openMenu('mworlds');await new Promise(r=>setTimeout(r,500));const c=[...document.querySelectorAll('#bpath .bp-c')];return{n:c.length,lock:c.map(e=>e.classList.contains('lock')),names:c.map(e=>e.querySelector('h4').textContent),need:(c[1].querySelector('.bp-need')||{}).textContent,go2:!!c[1].querySelector('.bp-go'),art:c.map(e=>{const d=e.querySelector('canvas').getContext('2d').getImageData(320,150,1,1).data;return d[3]})}});
 ok('the road shows three lands: the first open, the others locked and saying exactly why',page0.n==3&&page0.lock.join()=='false,true,true'&&/Sunroot Vale questline/.test(page0.need)&&!page0.go2&&page0.art.every(a=>a==255),page0);
 if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,'road-locked.png')})}
 await p.evaluate(()=>closeMenu());
 // the locks
 ok('typing a locked land refuses and stays where you are',await go('biome-reach')=='plaza');ok('so does the third land',await go('biome-wastes')=='plaza');
 const rn=await p.evaluate(()=>[WORD9.stName('biome-reach',1),WORD9.stName('biome-wastes',4)]);ok('a realm built on a locked land is locked too',await go(rn[0])=='plaza'&&await go(rn[1])=='plaza',rn);
 await p.evaluate(()=>loadWorld('biome-reach'));await sleep(1200);ok('even the lowest-level load cannot reach it',await p.evaluate(()=>cur)=='plaza');
 ok('a player\'s own typed world is still free',await go('mytestworld')=='mytestworld');
 // land 1: counts only here, and only in order
 await go('plaza');await p.evaluate(()=>{stat('break',50)});ok('breaking blocks elsewhere does not count',await p.evaluate(()=>PATH1.S().q[0].n==0&&PATH1.S().q[0].s==0));
 ok('land 1 opens',await go('rootbound')=='rootbound');await sleep(1400);
 ok('arriving completes the first step',await p.evaluate(()=>PATH1.S().q[0].s==1));
 ok('the quest card shows the next objective',/Break blocks/.test(await p.evaluate(()=>document.getElementById('quest').textContent)),await p.evaluate(()=>document.getElementById('quest').textContent.slice(-60)));
 await p.evaluate(()=>stat('kill',30));ok('a later step does not count early',await p.evaluate(()=>PATH1.S().q[0].s==1&&PATH1.S().q[0].n==0));
 const g0=await p.evaluate(()=>{stat('break',20);stat('plant',3);stat('place',10);stat('kill',9);return gems});ok('nine of ten defeats leaves it unfinished',await p.evaluate(()=>!PATH1.done(0)&&PATH1.locked('biome-reach')));
 await p.evaluate(()=>stat('kill',1));await sleep(500);const u=await p.evaluate(g0=>({done:PATH1.done(0),lock:PATH1.locked('biome-reach'),gem:gems-g0,ov:(document.querySelector('#bpun b')||{}).textContent,pe:document.getElementById('bpun')&&getComputedStyle(document.getElementById('bpun')).pointerEvents}),g0);
 ok('the last step finishes the questline, pays once and opens the next land with its moment',u.done&&!u.lock&&u.gem>0&&u.ov=='Gloamglass Reach'&&u.pe=='none',u);if(SHOTS){await sleep(1200);await p.screenshot({path:path.join(SHOTS,'unlock.png')})}
 ok('the depth trial under the first land is rated for beginners',await p.evaluate(()=>BIOME17.layout('rootbound').diff==1));
 ok('the third land is still locked',await p.evaluate(()=>PATH1.locked('biome-wastes')));
 const g1=await p.evaluate(()=>{stat('kill',999);return gems});await sleep(100);ok('no second payment',await p.evaluate(g1=>gems<g1+500,g1));
 // land 2 is really there
 ok('land 2 now opens',await go('biome-reach')=='biome-reach');await sleep(1800);
 const l2=await p.evaluate(()=>{let soil=0,tree=trees.size,spire=0;for(let x=1;x<W-1;x++){let y=0;while(y<H&&!tiles[y*W+x])y++;if([219,220].includes(tiles[y*W+x]))soil++;if(tiles[(y+2)*W+x]==219&&y<sh(x)-1)spire++}const b=Math.floor((P.y+P.h-1)/T),px=Math.floor(P.x/T);return{soil,tree,spire,W,stuck:solidAt(px,Math.floor((P.y+2)/T)),name:document.getElementById('wname').textContent,step:PATH1.S().q[1].s}});
 ok('its ground is its own, with glass spires and no trees, and you arrive free',l2.soil>l2.W*.6&&l2.tree==0&&l2.spire>5&&!l2.stuck&&l2.step==1,l2);
 ok('the land\'s own name shows',l2.name=='GLOAMGLASS REACH',l2.name);if(SHOTS)await p.screenshot({path:path.join(SHOTS,'land2.png')});
 const mobs=await p.evaluate(()=>{const n={};for(let i=0;i<200;i++){const k=pickMob(2);if(k)n[k]=(n[k]||0)+1}return n});ok('its surface has the land\'s own monsters',await p.evaluate(m=>Object.keys(m).some(k=>BIOME17.BI[3].mob.some(q=>q[0]==k)),mobs),mobs);
 // restart: progress kept, locks kept
 await sleep(200);await p.reload({waitUntil:'commit'});await boot();ok('progress and locks survive a restart',await p.evaluate(()=>PATH1.done(0)&&!PATH1.locked('biome-reach')&&PATH1.locked('biome-wastes')&&PATH1.S().q[1].s==1));
 // land 3
 await p.evaluate(()=>{PATH1.S().q[1]={s:0,n:0,done:Date.now()}});ok('land 3 opens after land 2',await go('biome-wastes')=='biome-wastes');await sleep(1800);if(SHOTS)await p.screenshot({path:path.join(SHOTS,'land3.png')});
 ok('its ground is its own',await p.evaluate(()=>{let n=0;for(let x=1;x<W-1;x++){let y=0;while(y<H&&!tiles[y*W+x])y++;if([225,226].includes(tiles[y*W+x]))n++}return n>W*.6}));
 await p.evaluate(()=>{openMenu('mworlds')});await sleep(500);if(SHOTS)await p.screenshot({path:path.join(SHOTS,'road-open.png')});await p.evaluate(()=>closeMenu());
 ok('no page errors',errs.length==0,errs.slice(0,4));
 await b.close();console.log(fails?('FAILED '+fails):'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.log('ERR',String(e).slice(0,600));process.exit(1)});
