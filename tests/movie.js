// The evolution cinematics (20 seconds, one for each of the 13 classes), end to end, off-screen: the evolution is paid for once and granted once, however the cinematic ends; skip asks first; replays reward nothing; an interrupted evolution can be finished for free; the player and the world are exactly as they were; every shot of every class draws without an error for very different characters; staying online through a cinematic. node tests/movie.js
const path=require('path'),fs=require('fs'),os=require('os');const {chromium}=require('playwright');const {createServer}=require('../server/server');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&x!==''?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(__dirname,'..','index.html').replace(/\\/g,'/');
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},420000).unref();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const SAVE=JSON.stringify({v:1,inv:{1:20},gems:500000,own:{fist:1},ownW:{},wear:{},wp:'fist',bar:[1],done:{},xp:3,lvl:90,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a',shoes:'#222',hat:0,gd:1,eye:'#222'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio','--autoplay-policy=no-user-gesture-required']});const errs=[];const c=await b.newContext({viewport:{width:1280,height:720}});
 await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')}},SAVE);
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()=='error'&&/MOVIE1|FILM1|EVC|MYART/.test(m.text()))errs.push(m.text().slice(0,240))});
 const start=async()=>{await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});await sleep(1200);await p.evaluate(()=>{try{RPG.guide.stop()}catch(_){}enterWorld('rbtd');iT=1e9;spawnT=1e9;mobs.length=0});await sleep(1400)};
 await start();
 // ---- the cinematics as data
 const ALL=['knight','samurai','archer','mage','demon','elementalist','stormcaller','berserker','ninja','druid','gunslinger','brawler','reaper'];
 const data=await p.evaluate(ALL=>ALL.map(k=>{const d=MOVIE1.REG[k];if(!d)return{k,miss:1};let a=0,sig=0;for(const s of d.shots){if(s.name=='sig')sig=a;a+=s.d}return{k,shots:d.shots.length,dur:+a.toFixed(3),reveal:d.reveal,score:d.score,hits:d.hits,sig,evo:d.kind=='evo'}}),ALL);
 const bad0=data.filter(q=>q.miss||!q.evo||q.shots!=12||Math.abs(q.dur-20)>.01||Math.abs(q.reveal-8.2)>.01);ok('every class has its own 20-second evolution cinematic',bad0.length==0,bad0.length?bad0:data.length+' classes');
 const noScore=data.filter(q=>!q.score||!fs.existsSync(path.join(__dirname,'..',q.score))).map(q=>q.k);ok('every cinematic has its score',noScore.length==0,noScore);
 const badHits=data.filter(q=>!q.hits||!q.hits.length||q.hits.length>3||q.hits.some(h=>h<q.sig||h>q.sig+2.8)).map(q=>q.k+':'+JSON.stringify(q.hits));ok('every signature move has its impacts inside the move',badHits.length==0,badHits);
 // ---- paying once
 const ready=()=>p.evaluate(()=>{CJOB.S.cur='reaper';if(!CJOB.S.learned.includes('reaper'))CJOB.S.learned.push('reaper');CLASS7.S.lv.reaper=75;MYTH.S.t.reaper=3;ARS2.S.kc.reaper=500;ARS2.S.wb.reaper=2;gems=60000;for(const[i,n]of EVO1.REQ.mats)addI(i,n+1);EVO1.S.on={};EVO1.S.paid={};EVO1.S.story={};EVO1.save();saveP();return{g:gems}});
 await ready();
 const pay=await p.evaluate(()=>{const g0=gems,m0=EVO1.REQ.mats.map(([i])=>cnt(i)),r=EVO1.evolve('reaper'),u=MOVIE1.on&&MOVIE1.state.id=='reaper';const once=EVO1.S.paid.reaper===1,g1=gems,m1=EVO1.REQ.mats.map(([i])=>cnt(i));const again=EVO1.evolve('reaper');return{r,u,once,paid:g0-g1,mats:m0.map((v,i)=>v-m1[i]),on:EVO1.on('reaper'),afterAgain:g1-gems,need:EVO1.REQ.gems}});
 ok('evolving is paid for once and starts the cinematic at once, with the evolution not yet granted',pay.r&&pay.u&&pay.once&&pay.paid==pay.need&&!pay.on&&pay.afterAgain==0,pay);
 // ---- interrupted during the cinematic (closed, crashed): come back later
 await p.evaluate(()=>{saveP()});await sleep(200);await start();
 const resume=await p.evaluate(()=>{const e=EVO1.S.paid.reaper,o=EVO1.on('reaper');EVO1.open('reaper');const t=document.getElementById('evo9').textContent;return{e,o,cont:/Evolve now/.test(t)&&/already paid/.test(t)}});
 ok('closing the game during the cinematic keeps the payment: the evolution can be finished',resume.e===1&&!resume.o&&resume.cont,resume);
 const free=await p.evaluate(()=>{window.__n=0;const u0=update;update=function(){window.__n++;return u0.apply(this,arguments)};window.__p={x:P.x,y:P.y,hp:P.hp,cur};const g0=gems;EVO1.close();EVO1.evolve('reaper');return{charged:g0-gems,u:MOVIE1.on,cover:window.RB_COVER,c:!!document.getElementById('movie1')}});ok('finishing it costs nothing, and the cinematic starts',free.charged==0&&free.u&&free.cover&&free.c,free);
 // ---- watching: the world holds still, keys go nowhere
 await sleep(2600);
 await p.keyboard.down('a');await sleep(60);const w1=await p.evaluate(()=>{const n1=window.__n;return{T:MOVIE1.state.T,ka:K.a|0,n1,dx:P.x-window.__p.x,dy:P.y-window.__p.y}});await p.keyboard.up('a');
 await sleep(500);const n2=await p.evaluate(()=>window.__n);
 ok('the cinematic runs while the world stands still and game keys do nothing',w1.T>1.5&&!w1.ka&&n2==w1.n1&&w1.dx==0&&w1.dy==0,Object.assign(w1,{n2}));
 // ---- Esc asks; Esc again keeps watching
 const esc=k=>p.evaluate(k=>window.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true})),k);
 await esc('Escape');await sleep(120);const q1=await p.evaluate(()=>({a:!!document.getElementById('movie1ask'),T:MOVIE1.state.T}));await sleep(500);const q1b=await p.evaluate(()=>MOVIE1.state.T);
 ok('Esc asks before skipping, and the movie waits',q1.a&&Math.abs(q1b-q1.T)<.05,{q1,q1b});
 await esc('Escape');await sleep(500);const q2=await p.evaluate(()=>({a:!!document.getElementById('movie1ask'),T:MOVIE1.state.T,on:MOVIE1.on}));ok('Esc again goes back to the movie',!q2.a&&q2.on&&q2.T>q1.T,q2);
 // ---- reaching the reveal grants it, exactly once
 for(let i=0;i<40;i++){if(await p.evaluate(()=>MOVIE1.state&&MOVIE1.state.T>8.5))break;await sleep(250)}
 const rev=await p.evaluate(()=>({T:MOVIE1.state&&MOVIE1.state.T,on:MOVIE1.on,ev:EVO1.on('reaper'),paid:EVO1.S.paid.reaper}));ok('the evolution is granted as it happens on screen, at the silhouette',rev.on&&rev.ev&&!rev.paid,rev);
 await esc('Escape');await sleep(120);await esc('Enter');await sleep(400);
 const after=await p.evaluate(()=>({on:MOVIE1.on,ev:EVO1.on('reaper'),paid:EVO1.S.paid.reaper,cover:!!window.RB_COVER,c:!!document.getElementById('movie1'),story:EVO1.S.story.reaper,dx:P.x-window.__p.x,cur:cur==window.__p.cur,hp:P.hp==window.__p.hp,t:EVO1.S.on.reaper}));
 ok('skipping after confirming still grants the evolution, and hands back the game exactly as it was',!after.on&&after.ev&&!after.paid&&!after.cover&&!after.c&&after.story==1&&after.dx==0&&after.cur&&after.hp,after);
 await sleep(400);const mv=await p.evaluate(async()=>{const n0=window.__n;await new Promise(r=>setTimeout(r,400));return{n:window.__n-n0}});ok('the game runs again afterwards',mv.n>2,mv);
 // ---- replays reward nothing; the granted time never changes; survives a reload
 const rep=await p.evaluate(async()=>{const t0=EVO1.S.on.reaper,g0=gems;const ok1=EVO1.watch('reaper',false);await new Promise(r=>setTimeout(r,400));MOVIE1.finish('end');return{ok1,same:EVO1.S.on.reaper==t0,g:gems-g0,t0}});ok('watching again rewards nothing and charges nothing',rep.ok1&&rep.same&&rep.g==0,rep);
 const pg=await p.evaluate(()=>{EVO1.open('reaper');const t=document.getElementById('evo9').textContent;EVO1.close();return /Watch the evolution again/.test(t)});ok('the cinematic can be watched again from the Classes screen',pg);
 await p.evaluate(()=>saveP());await sleep(200);await start();const per=await p.evaluate(()=>({on:EVO1.on('reaper'),t:EVO1.S.on.reaper}));ok('the evolution is saved',per.on&&per.t==rep.t0,per);
 // ---- the rest of the rules
 // a signed-in payment the server never heard about is taken again when the server hands the gems back, and the debt clears once the server agrees
 const owe=await p.evaluate(()=>{const g0=gems,p0=SHOP7.pend|0;EVO1.S.owe=25000;SHOP7.net({t:'wallet',gems:(gems|0)+p0+25000,owned:{}});const afterRefund=gems;SHOP7.net({t:'wallet',gems:(gems|0)+(SHOP7.pend|0),owned:{}});const cleared=EVO1.S.owe;SHOP7.net({t:'wallet',guest:1});return{g0,afterRefund,cleared}});ok('a payment the server missed is not refunded',owe.afterRefund==owe.g0&&owe.cleared==0,owe);
 const bad=await p.evaluate(()=>{const was=DG.cine,o=Object.getOwnPropertyDescriptor(DG,'cine');Object.defineProperty(DG,'cine',{value:{on:1},configurable:true,writable:true});const r=EVO1.watch('reaper',false);if(o)Object.defineProperty(DG,'cine',o);else DG.cine=was;return{r,on:MOVIE1.on}});ok('no cinematic during a dungeon run',!bad.r&&!bad.on,bad);
 // ---- every shot, for very different characters, at the start, middle and end of each shot
 const sweep=await p.evaluate(async ALL=>{const looks=[{skin:'#efdcd2',hair:'#f0f0f4',hs:5,es:1,eyeCol:'#e8e8ff',gd:1},{skin:'#7a4a30',hair:'#1a1420',hs:2,es:3,eyeCol:'#ffb347',gd:2},{skin:'#f6d7b8',hair:'#d0342c',hs:9,es:2,eyeCol:'#35c9c0',gd:0}],out={};let slow=0,slowAt='';for(const k of ALL){let n=0;for(const look of looks){MOVIE1.play(k,{rec:1,look});const d=MOVIE1.REG[k];let a=0;for(const s of d.shots){for(const u of[.02,.5,.97]){const t0=performance.now();MOVIE1.seek(a+s.d*u);const ms=performance.now()-t0;if(ms>slow){slow=ms;slowAt=k+' '+s.name}n++}a+=s.d}MOVIE1.finish('end');await new Promise(r=>setTimeout(r,20))}out[k]=n}return{out,slow:Math.round(slow),slowAt}},ALL);
 ok('every shot of all 13 cinematics draws for three very different characters',Object.keys(sweep.out).length==13&&Object.values(sweep.out).every(n=>n==108),sweep);
 const scoreSync=await p.evaluate(async()=>{const r=EVO1.watch('reaper',false);await new Promise(r=>setTimeout(r,2500));const m=MOVIE1.state;const a=[...document.querySelectorAll('canvas#movie1')].length;MOVIE1.finish('end');return{r,T:m&&m.T,a}});ok('a replay plays in real time',scoreSync.r&&scoreSync.T>1.8&&scoreSync.a==1,scoreSync);
 ok('no errors during the cinematic tests',errs.length==0,errs.slice(0,6));
 await c.close();
 // ---- staying online through a movie
 {const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbmv-')),S=createServer({csp:false,port:0,host:'127.0.0.1',dataDir:dir,scryptN:64,wxCooldownMs:0,maxConnsPerIp:200,ownerName:'Boss',ownerPass:'owner-password-1',client:path.join(__dirname,'..','index.html')});const port=await S.listen(),url='http://127.0.0.1:'+port+'/';
  const cl=async tag=>{const ctx=await b.newContext({viewport:{width:1280,height:720}}),q=await ctx.newPage();q.on('pageerror',e=>errs.push(tag+': '+e.message.slice(0,200)));await q.goto(url);await q.waitForTimeout(800);await q.evaluate(()=>{try{$('cgo').click()}catch(_){}});await q.waitForTimeout(400);await q.evaluate(()=>{try{SHOW7.close()}catch(_){}});await q.waitForFunction(()=>NET7.online,null,{timeout:15000});return q};
  const A=await cl('A'),B=await cl('B');await A.evaluate(()=>{iT=1e9});await B.evaluate(()=>{iT=1e9});await sleep(1800);
  const w0=await A.evaluate(()=>NET7.world),vis=()=>B.evaluate(()=>SOC6.peers().length),v0=await vis();
  const a0=await A.evaluate(()=>MOVIE1.play('reaper',{}));await sleep(6500);
  const mid=await A.evaluate(()=>({on:MOVIE1.on,net:!!NET7.online,w:NET7.world})),v1=await vis();ok('still connected and in the same world during a cinematic, and other players still see you',a0&&mid.on&&mid.net&&mid.w==w0&&v1>=1&&v1==v0,Object.assign(mid,{v0,v1}));
  await A.evaluate(()=>MOVIE1.finish('end'));await sleep(1200);const aft=await A.evaluate(()=>({net:!!NET7.online,on:MOVIE1.on,cover:!!window.RB_COVER}));ok('still connected afterwards, with control back',aft.net&&!aft.on&&!aft.cover,aft);
  // a dropped connection in the middle of a movie: the movie carries on, and control comes back cleanly
  const n0=errs.length;await B.close();const st=await A.evaluate(()=>MOVIE1.play('reaper',{}));await sleep(500);try{await Promise.race([S.close(),sleep(2500)])}catch(_){}await sleep(3000);const dr=await A.evaluate(()=>({on:MOVIE1.on,T:MOVIE1.state&&MOVIE1.state.T}));await A.evaluate(()=>MOVIE1.finish('end'));await sleep(500);const ad=await A.evaluate(()=>({on:MOVIE1.on,cover:!!window.RB_COVER}));ok('losing the connection mid-cinematic does not disturb it, and control still returns',st&&dr.on&&dr.T>2&&!ad.on&&!ad.cover&&errs.length==n0,{dr,ad,e:errs.slice(n0,n0+3)});await A.close().catch(()=>{})}
 await b.close();console.log(fails?fails+' cinematic test(s) FAILED':'all cinematic tests passed');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e.message);process.exit(1)});
