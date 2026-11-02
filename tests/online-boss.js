// World bosses online, on a real server with real headless browsers: the fight is a private copy (nobody else's world collapses), others see you where you
// stood, what they build meanwhile waits for you, nothing leaks out of the void, a lost connection puts you back in the world, and a win is paid once. node tests/online-boss.js
const path=require('path'),fs=require('fs'),os=require('os');
const {chromium}=require('playwright');const {createServer}=require('../server/server');const {C}=require('./wsclient');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&x!==''?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},280000).unref();
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbonlw-'));const OPT={host:'127.0.0.1',dataDir:dir,scryptN:64,wxCooldownMs:0,maxConnsPerIp:200,ownerName:'Boss',ownerPass:'owner-password-1',wbMinMs:800,client:path.join(__dirname,'..','index.html')};
let S=createServer(Object.assign({csp:false,port:0},OPT));const errs=[];
async function client(b,url,tag){const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(tag+': '+e.message.slice(0,200)));p.on('console',m=>{if(m.type()=='error'&&/WBOSS13/.test(m.text()))errs.push(tag+': '+m.text().slice(0,200))});
 await p.goto(url);await p.waitForTimeout(800);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}});await p.waitForTimeout(400);await p.evaluate(()=>{try{SHOW7.close()}catch(_){}});
 await p.waitForFunction(()=>NET7.online,null,{timeout:15000});return p}
const ev=(p,f,a)=>p.evaluate(f,a);
const signup=async(p,name)=>{await ev(p,([n,w])=>NET7.send({t:'register',name:n,pass:w}),[name,name+'-password']);await p.waitForFunction(n=>typeof NET7!='undefined'&&NET7.auth&&NET7.auth.name==n,name,{timeout:15000});await p.waitForFunction(()=>typeof RB_ACCT!='undefined'&&!!RB_ACCT.id&&NET7.online&&NET7.auth&&NET7.auth.uid==RB_ACCT.id,null,{timeout:15000});await p.waitForTimeout(400);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}try{SHOW7.close()}catch(_){}});await p.waitForTimeout(300)};
const go=async(p,w,c)=>{await ev(p,([w,c])=>NET7.go(w,c),[w,c]);await p.waitForFunction(w=>NET7.world==w&&cur==w,w,{timeout:8000}).catch(()=>{});await p.waitForTimeout(400)};
const until=async(p,f,ms,a)=>{const t0=Date.now();while(Date.now()-t0<(ms||15000)){if(await ev(p,f,a))return true;await sleep(120)}return false};
const tilesOn=p=>ev(p,()=>{let n=0;for(let i=0;i<tiles.length;i++)if(tiles[i])n++;return n});
const letters=p=>ev(p,()=>{lvl=30;try{GUARD16.blocks=()=>false}catch(_){}try{BIOME17.locks=()=>false}catch(_){}for(const q of WORD9.letters)WORD9.collect(q.i)});
const toFight=async p=>{await until(p,()=>WBOSS13.CIN.on,12000);await ev(p,()=>WBOSS13.CIN.seek(39.95));return until(p,()=>WBOSS13.fight&&WBOSS13.fight.st=='fight',4000)};
const kill=p=>ev(p,()=>{const m=BOSS6.active();iT=99;m.shield=0;m.hp=1;P.hp=maxHP();hurtMob(m,99999,null,0)});
(async()=>{let port=await S.listen();const url='http://127.0.0.1:'+port+'/';const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
 try{
  // ---- the server's side of a win, with plain sockets
  const mk=async()=>{const c=await new C(port).connect();await c.wait(m=>m.t=='server');return c};
  const reg=async n=>{const c=await mk();await c.rpc({t:'register',name:n,pass:n+'-password'},x=>x.t=='auth');return c};
  const enter=(c,w,create,base)=>c.rpc({t:'enter',w,create,base},m=>m.t=='_hello'||m.t=='enter_err');
  const wallet=async c=>(await c.rpc({t:'wallet'},m=>m.t=='wallet')).gems;
  const sync=async(c,g)=>{c.clear();c.send({t:'sync',gems:g});return (await c.wait(m=>m.t=='wallet')).gems};
  const c1=await reg('solver');await enter(c1,'solveland',true);await sleep(60);
  let w=await sync(c1,20000);ok('without a win, gems still grow only at the normal limit',w<=1500,w);
  c1.send({t:'wb',op:'win'});await sleep(80);w=await sync(c1,20000);ok('a win with no fight behind it unlocks nothing',w<=1600,w);
  c1.send({t:'wb',op:'start'});await sleep(80);c1.send({t:'wb',op:'win'});await sleep(80);w=await sync(c1,20000);ok('a win right after the fight began unlocks nothing',w<=1700,w);
  c1.send({t:'wb',op:'start'});await sleep(900);c1.send({t:'wb',op:'win'});await sleep(80);const w1=await sync(c1,20000);ok('a real win unlocks that realm\'s reward at once',w1>=3000&&w1<=4800,w1);
  c1.send({t:'wb',op:'start'});await sleep(900);c1.send({t:'wb',op:'win'});await sleep(80);const w2=await sync(c1,20000);ok('the same world pays only once',w2<w1+200,{w1,w2});
  const g=await new C(port).connect();await g.wait(m=>m.t=='server');await g.rpc({t:'guest',name:'Gus'},x=>x.t=='auth');await enter(g,'solveland');g.send({t:'wb',op:'start'});await sleep(900);g.send({t:'wb',op:'win'});await sleep(100);ok('a guest has no wallet to pay',true);g.close();c1.close();await sleep(60);
  // ---- two players in one world
  const A=await client(b,url,'Ann'),B=await client(b,url,'Bea');await signup(A,'annie');await signup(B,'beatrix');await go(B,'bossland',true);await ev(B,()=>(()=>{const x=(P.x/T|0)+3;let y=0;for(let yy=0;yy<H;yy++)if(tiles[yy*W+x]){y=yy-1;break}const k=y*W+x;tiles[k]=17;hp[k]=99;setMeta({x,y,o:myId,on:(NET7.auth&&NET7.auth.name)||myName,f:[],pub:0});pushEdit(k)})());await sleep(400);await go(A,'bossland');await sleep(500);
  ok('world bosses are on in online worlds',await ev(A,()=>!!rm&&rm.net&&WBOSS13.need(cur)));
  // Bea owns the world and builds; Ann is a visitor and fights
  ok('the fighter is a visitor who cannot edit this world',await ev(A,()=>!canEdit())&&await ev(B,()=>canEdit()));await ev(A,()=>{window.__rl=0;const _l=loadWorld;loadWorld=function(){window.__rl++;return _l.apply(this,arguments)}});
  const n0=await tilesOn(B),home=await ev(A,()=>({x:P.x,y:P.y}));
  await letters(A);ok('the last letter starts it for that player only',await until(A,()=>WBOSS13.fight,4000));ok('a visitor picks up letters without the server refusing and reloading the world',(await ev(A,()=>window.__rl))==0);
  ok('the collapse reaches the private copy',await until(A,()=>WBOSS13.void,9000));await sleep(600);
  const n1=await tilesOn(B);ok('the other player\'s world does not collapse',n1>1000&&Math.abs(n1-n0)<20&&await ev(B,()=>!WBOSS13.void&&!WBOSS13.fight&&!BOSS6.active()),{n0,n1});
  ok('the fighter sees nobody else in the void',await ev(A,()=>rm.peers().filter(p=>!p.isMe).length==0));
  ok('toFight',await toFight(A));await sleep(1200);
  r=await ev(A,()=>({mhp:BOSS6.active().mhp,base:MK.boss_wb_root.hp,bb:LVL9.bossB(lvl|0)}));ok('boss health is not raised by players outside the private fight',Math.abs(r.mhp-r.base*r.bb)<2,r);
  // what leaks out of the void: nothing
  const K=await ev(B,()=>{const x=(P.x/T|0)+4;let y=0;for(let yy=0;yy<H;yy++)if(tiles[yy*W+x]){y=yy-1;break}return y*W+x});
  const A0=await ev(B,k=>tiles[k],K);await ev(A,k=>{tiles[k]=3;pushEdit(k);tiles[k]=0;try{rm.emit('x',{op:'noise'});rm.emit('e',{k,a:[3,0,0,0]})}catch(_){}},K);await sleep(600);
  ok('no block leaves the void',await ev(B,([k,a])=>tiles[k]==a,[K,A0]));
  const seen=await ev(B,()=>{const p=rm.peers().find(q=>!q.isMe);const r=p&&(p.presence||{});return r&&{x:r.x,y:r.y}});ok('the others see you standing where you were, not in the arena',seen&&Math.abs(seen.x-home.x)<T48()*3&&Math.abs(seen.y-home.y)<T48()*3,{seen,home});
  r=await ev(B,()=>Object.values(bub).some(q=>/fighting Thornmaw/.test(q.t)));ok('a bubble over you says what you are fighting',r);
  // what Bea builds meanwhile
  await ev(B,k=>{tiles[k]=7;pushEdit(k)},K);await sleep(600);
  r=await ev(A,k=>({t:tiles[k],held:WBOSS13.held,e:edits[k]}),K);ok('a block built meanwhile waits: not in the void, not lost',r.t==0&&r.held>=1,r);
  // a trade request cannot pop up mid-fight
  await ev(B,()=>NET7.send({t:'trade',op:'ask',who:'annie'}));await sleep(500);ok('a trade request is turned down during the fight',await ev(A,()=>!ONL10.trade));
  // win
  const g0=await ev(A,()=>gems|0);await sleep(900);await kill(A);ok('the win brings the world back',await until(A,()=>!WBOSS13.fight&&!WBOSS13.void,12000));
  r=await ev(A,k=>({t:tiles[k],held:WBOSS13.held,x:P.x,y:P.y,others:rm.peers().filter(p=>!p.isMe).length}),K);ok('the block built meanwhile is there now, and the other player is back in view',r.t==7&&r.held==0&&r.others==1,r);
  ok('you stand where you stood',Math.abs(r.x-home.x)<T48()*2,{x:r.x,hx:home.x});
  const ta=await ev(A,()=>Array.from(tiles)),tb=await ev(B,()=>Array.from(tiles));let dif=0;for(let i=0;i<ta.length;i++)if(ta[i]!=tb[i]&&ta[i]!=18&&tb[i]!=18)dif++;ok('both players have the same world afterwards (apart from their own hidden letters)',dif==0,dif);
  await sleep(1200);r=await ev(A,()=>({g:gems|0,pend:SHOP7.pend|0}));ok('the boss gems reach the server at once, no slow trickle',r.g>=g0&&r.pend==0&&r.g>=3000,{g0,r});
  await ev(A,()=>{try{WORD9.close()}catch(_){}});
  r=await ev(B,()=>Object.values(bub).some(q=>/defeated Thornmaw/.test(q.t)));ok('the others are told you won',r);
  ok('the other player still has their own boss waiting',await ev(B,()=>WBOSS13.need(cur)));
  // ---- losing online
  await letters(B);ok('Bea starts hers',await until(B,()=>WBOSS13.fight,4000));ok('fight',await toFight(B));await sleep(400);await ev(B,()=>{iT=0;P.hp=-1});ok('a knock-out brings Bea\'s world back',await until(B,()=>!WBOSS13.fight&&!WBOSS13.void,5000));
  r=await tilesOn(B);ok('and it is whole, with the boss still waiting',r>1000&&await ev(B,()=>WBOSS13.need(cur)),r);
  // ---- the server goes away mid-fight (a free host going to sleep, say)
  await go(B,'bossland2',true);await sleep(300);const hb=await ev(B,()=>({x:P.x,y:P.y}));await letters(B);await until(B,()=>WBOSS13.fight,4000);await until(B,()=>WBOSS13.void,9000);ok('fight before the drop',await toFight(B));await sleep(300);
  await S.close();await sleep(800);S=createServer(Object.assign({csp:false,port},OPT));await S.listen();
  ok('after reconnecting, the world is back',await until(B,()=>NET7.online&&cur=='bossland2'&&!WBOSS13.void&&!WBOSS13.fight&&!BOSS6.active(),25000));await sleep(600);
  r=await ev(B,()=>{let n=0;for(let i=0;i<tiles.length;i++)if(tiles[i])n++;return{n,x:P.x,cover:window.RB_COVER,zm:ZM,body:document.body.classList.contains('wb13v')}});ok('whole, with you back where you stood',r.n>1000&&Math.abs(r.x-hb.x)<T48()*2&&!r.cover&&!r.body,{r,hb});
  ok('no page errors in any client',errs.length==0,errs.slice(0,4).join(' | '));
 }catch(e){ok('online boss harness',false,String(e.stack||e).slice(0,600))}
 await b.close();try{await S.close()}catch(_){}
 console.log(fails?'FAILURES '+fails:'all online boss tests passed');process.exit(fails?1:0)})();
var r;function T48(){return 48}
