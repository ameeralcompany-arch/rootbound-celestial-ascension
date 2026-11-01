// Shared monsters with a real server and real browsers: everyone in a world sees and fights the same ones, they go for the nearest player, the killer gets the
// reward, personal monsters stay personal, and the monsters carry on when the host leaves or goes into a private fight. node tests/online-mobs.js
const path=require('path'),fs=require('fs'),os=require('os');
const {chromium}=require('playwright');const {createServer}=require('../server/server');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&x!==''?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},200000).unref();
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbmob-'));const S=createServer({port:0,host:'127.0.0.1',dataDir:dir,scryptN:64,maxConnsPerIp:200,client:path.join(__dirname,'..','index.html')});const errs=[];
const ev=(p,f,a)=>p.evaluate(f,a);
const enterGame=async p=>{await p.waitForFunction(()=>typeof NET7!='undefined'&&NET7.online,null,{timeout:15000});await p.waitForTimeout(300);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}try{SHOW7.close()}catch(_){}});await p.waitForTimeout(300)};
async function client(b,url,tag){const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(tag+': '+e.message.slice(0,200)));p.on('console',m=>{if(m.type()=='error'&&/MOB14/.test(m.text()))errs.push(tag+': '+m.text().slice(0,200))});await p.goto(url);await enterGame(p);return p}
const signup=async(p,n)=>{await ev(p,n=>NET7.send({t:'register',name:n,pass:n+'-password'}),n);await p.waitForFunction(()=>typeof ACCT13!='undefined'&&ACCT13.live,null,{timeout:15000});await enterGame(p)};
const go=async(p,w,c)=>{await ev(p,([w,c])=>NET7.go(w,c),[w,c]);await p.waitForFunction(w=>NET7.world==w&&cur==w,w,{timeout:8000}).catch(()=>{});await sleep(500)};
const list=p=>ev(p,()=>mobs.filter(m=>m.sid).map(m=>({id:m.sid,k:m.k,x:Math.round(m.x),y:Math.round(m.y),hp:Math.ceil(m.hp)})));
const noSpawn=p=>ev(p,()=>{night=0;P.y=Math.min(P.y,sh(P.x/T|0)*T-P.h-2);for(const m of mobs.slice())m.dead=true});
(async()=>{const port=await S.listen(),url='http://127.0.0.1:'+port+'/';const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
 try{
  const A=await client(b,url,'Ann'),B=await client(b,url,'Bea');await signup(A,'annie');await signup(B,'beatrix');await go(A,'mobland',true);await go(B,'mobland');await sleep(600);
  let r=await ev(A,()=>({h:MOB14.host,me:rm.id,isHost:MOB14.isHost}));let r2=await ev(B,()=>({h:MOB14.host,me:rm.id,isHost:MOB14.isHost}));ok('one player hosts the world\'s monsters, and both agree who',r.isHost!==r2.isHost&&r.h==r2.h&&r.h,{r,r2});
  const[H,G]=r.isHost?[A,B]:[B,A];await ev(H,()=>{window.__s=()=>WORD9.spawnAt});
  // ---- the same monsters for everyone
  const spawned=await ev(H,()=>{lvl=30;const a=WORD9.spawnAt('bat',P.x+160,P.y-120),c=WORD9.spawnAt('golem',P.x-200,P.y-20);for(const m of[a,c])m.hp=500;return mobs.length});
  ok('(spawned two on the host)',spawned>=2,spawned);await sleep(1000);let a=await list(H),c=await list(G);
  ok('a monster on one screen appears on the other, with the same id',a.length>=2&&a.every(m=>c.some(q=>q.id==m.id&&q.k==m.k)),{a,c});
  const m0=a[0],g0=c.find(q=>q.id==m0.id);ok('in about the same place',g0&&Math.hypot(m0.x-g0.x,m0.y-g0.y)<T48()*4,{m0,g0});
  // the other player never makes their own
  r=await ev(G,()=>({spawn:spawnMob(),own:mobs.filter(m=>!m.sid&&!MOB14.personal(m)).length}));ok('only the host spawns',!r.spawn&&r.own==0,r);
  await ev(G,()=>{WORD9.spawnAt('slime',P.x,P.y)});await sleep(300);r=await ev(G,()=>mobs.filter(m=>!m.sid&&!MOB14.personal(m)).length);ok('a stray local monster on the other player is removed',r==0,r);
  // ---- hitting
  const id0=c[0].id,hp0=c[0].hp;await ev(G,id=>{const m=mobs.find(q=>q.sid==id);hurtMob(m,40,null,0)},id0);await sleep(700);a=await list(H);const ah=a.find(q=>q.id==id0);ok('a hit by the other player lowers the host\'s monster',ah&&ah.hp<hp0,{hp0,now:ah&&ah.hp});
  c=await list(G);r=c.find(q=>q.id==id0);ok('and both show the same health',r&&ah&&Math.abs(r.hp-ah.hp)<50,{g:r&&r.hp,h:ah&&ah.hp});
  const id1=a.find(q=>q.id!=id0).id;await ev(H,id=>{const m=mobs.find(q=>q.sid==id);hurtMob(m,40,null,0)},id1);await sleep(600);c=await list(G);ok('a hit by the host shows on the other screen',c.find(q=>q.id==id1).hp<500,c.find(q=>q.id==id1));
  // ---- killing
  const before=await ev(G,()=>({x:stats.kill|0}));await ev(G,id=>{const m=mobs.find(q=>q.sid==id);m.hp=1;hurtMob(m,999,null,0)},id0);await sleep(800);a=await list(H);c=await list(G);r=await ev(G,()=>stats.kill|0);const hk=await ev(H,()=>stats.kill|0);
  ok('a monster killed by the other player is gone for everyone',!a.some(q=>q.id==id0)&&!c.some(q=>q.id==id0),{a,c});ok('the killer gets the credit, not the host',r>before.x,{g:r,was:before.x,h:hk});
  const hk0=hk;await ev(H,id=>{const m=mobs.find(q=>q.sid==id);m.hp=1;hurtMob(m,999,null,0)},id1);await sleep(800);c=await list(G);ok('a monster killed by the host is gone for everyone',!c.some(q=>q.id==id1),c);ok('host gets that one',(await ev(H,()=>stats.kill|0))>hk0);
  // ---- contact damage + nearest player
  const pos=await ev(G,()=>({x:P.x,y:P.y}));await ev(G,()=>{P.hp=maxHP();iT=0});await ev(H,p=>{const m=WORD9.spawnAt('bat',p.x,p.y+10);m.hp=500;window.__bat=m},pos);await sleep(900);await ev(G,()=>{iT=0});await sleep(900);r=await ev(G,()=>({hp:P.hp,max:maxHP()}));ok('a monster touching the other player hurts them',r.hp<r.max,r);
  const far=await ev(H,()=>{P.x=Math.max(T*5,P.x-T*60);const x=P.x;return x});await sleep(3000);r=await ev(H,()=>window.__bat&&mobs.includes(window.__bat));ok('a monster near another player stays alive, however far the host is',r,r);
  const d1=await ev(H,p=>Math.hypot(window.__bat.x-p.x,window.__bat.y-p.y),pos);ok('and stays near that player, not the host',d1<T48()*16,Math.round(d1));
  // monsters also appear around other players
  await ev(H,()=>{for(const m of mobs)if(m!==window.__bat)m.dead=true;window.__ck=clock;clock=()=>.5});const got=await H.waitForFunction(p=>mobs.filter(m=>m.sid&&m!==window.__bat&&Math.hypot(m.x-p.x,m.y-p.y)<T*40).length>0,pos,{timeout:25000}).then(()=>true).catch(()=>false);ok('monsters spawn around other players too',got);await ev(H,()=>{clock=window.__ck});
  // ---- personal monsters
  await ev(G,()=>{const m=WORD9.spawnAt('golem',P.x+100,P.y);m.elite=1;m.lg=1;m.hp=99});await sleep(600);r=await list(H);const mineG=await ev(G,()=>mobs.filter(m=>m.lg).length);ok('a letter warden stays personal to its player',mineG==1&&!(await ev(H,()=>mobs.some(m=>m.lg))),{mineG});await ev(G,()=>{for(const m of mobs)if(m.lg)m.dead=true});
  // ---- a third player joins, the host leaves
  await ev(H,()=>{for(const m of mobs)if(m!==window.__bat)m.dead=true});await sleep(500);const C=await client(b,url,'Cal');await go(C,'mobland');await sleep(1200);a=await list(H);c=await list(C);ok('someone who joins later sees the same monsters',c.length==a.length&&a.every(m=>c.some(q=>q.id==m.id)),{a:a.length,c:c.length});
  const batId=await ev(H,()=>window.__bat.sid);const gotH=await ev(G,()=>rm.id);await ev(H,()=>NET7.go('plaza'));await sleep(1500);r=await ev(G,()=>MOB14.isHost);const r3=await ev(C,()=>MOB14.isHost);ok('when the host leaves, another player takes over',r!==r3,{g:r,c:r3});
  const[H2,G2]=r?[G,C]:[C,G];ok('and the monsters carry on',(await list(G2)).some(q=>q.id==batId)&&await ev(H2,id=>mobs.some(m=>m.sid==id),batId));
  const y0=(await list(G2)).find(q=>q.id==batId);await sleep(1500);const y1=(await list(G2)).find(q=>q.id==batId);ok('still moving under the new host',y0&&y1&&(y0.x!=y1.x||y0.y!=y1.y),{y0,y1});
  // ---- nothing is sent when alone
  await ev(G2,()=>NET7.go('plaza'));await sleep(1200);await ev(H2,()=>{window.__n=0;const e=rm.emit;rm.emit=(t,x)=>{if(t=='mb')window.__n++;return e(t,x)}});await sleep(1500);r=await ev(H2,()=>window.__n);ok('alone in a world, no monster traffic',r==0,r);
  ok('no page errors',errs.length==0,errs.slice(0,4).join(' | '));
 }catch(e){ok('mobs harness',false,String(e.stack||e).slice(0,700))}
 await b.close();try{await S.close()}catch(_){}console.log(fails?'FAILURES '+fails:'all shared monster tests passed');process.exit(fails?1:0)})();
function T48(){return 48}
