// World Locks claim worlds, with a real server and real browsers: /claim is gone, a new world belongs to nobody, any player with an account who places a lock owns the
// world (up to 5) and its realms, nobody else can then lock or build there, and removing or releasing the lock frees the world. node tests/world-lock.js
const path=require('path'),fs=require('fs'),os=require('os');
const {chromium}=require('playwright');const {createServer}=require('../server/server');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&x!==''?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},200000).unref();
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rblock-'));const S=createServer({allowGuests:true,csp:false,port:0,host:'127.0.0.1',dataDir:dir,scryptN:64,maxConnsPerIp:200,client:path.join(__dirname,'..','index.html')});const errs=[];
const ev=(p,f,a)=>p.evaluate(f,a);
const enterGame=async p=>{await p.waitForFunction(()=>typeof NET7!='undefined'&&NET7.online,null,{timeout:15000});await p.waitForTimeout(300);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}try{SHOW7.close()}catch(_){}});await p.waitForTimeout(300)};
async function client(b,url,tag){const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(tag+': '+e.message.slice(0,200)));await p.goto(url);await enterGame(p);return p}
const signup=async(p,n)=>{await ev(p,n=>NET7.send({t:'register',name:n,pass:n+'-password'}),n);await p.waitForFunction(()=>typeof ACCT13!='undefined'&&ACCT13.live,null,{timeout:15000});await enterGame(p)};
const go=async(p,w,c,base)=>{await ev(p,([w,c,b])=>NET7.go(w,c,null,b),[w,c,base]);await p.waitForFunction(w=>NET7.world==w&&cur==w,w,{timeout:8000}).catch(()=>{});await sleep(500)};
// really place one: the lock in your hand, the mouse on an empty spot beside you, the game's own place action
const place=(p)=>ev(p,()=>{const n0=cnt(17);if(n0<1)addI(17,1);if(!bar.includes(17))bar[0]=17;sel=bar.indexOf(17);try{wp='fist'}catch(_){}const tx=(P.x/T|0)+2;let ty=(P.y/T|0);while(ty>0&&tiles[ty*W+tx])ty--;while(ty<H-2&&!tiles[(ty+1)*W+tx])ty++;mx=(tx+.5)*T-cam.x;my=(ty+.5)*T-cam.y;rcd=0;placeAction();return{k:ty*W+tx,t:tiles[ty*W+tx],meta:!!meta,left:cnt(17)}});
const own=p=>ev(p,()=>({own:window.RB_OWN&&RB_OWN.on,meta:meta&&meta.on,edit:canEdit(),mine:ONL10.mine.list.length}));
const srv=id=>{const w=S.worlds.get(id);return w?{o:w.ownerName,u:w.ownerUid,m:!!w.meta}:null};
(async()=>{const port=await S.listen(),url='http://127.0.0.1:'+port+'/';const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
 try{const A=await client(b,url,'Ann'),B=await client(b,url,'Bea');await signup(A,'annie');await signup(B,'beatrix');
  // ---- /claim is gone
  await go(A,'lockland',true);await go(B,'lockland');await sleep(300);
  r=await ev(A,()=>{say('');SOC6.cmd('/claim');return msg});ok('/claim no longer claims anything',!srv('lockland').u,r);
  A0=await ev(A,()=>NET7.send({t:'world_claim'}));await sleep(300);ok('the server ignores the old claim message',!srv('lockland').u,srv('lockland'));
  r=await ev(A,()=>SOC6.HELP+' '+(document.body.innerText.includes('/claim')?'in page':''));
  // ---- a new world belongs to nobody
  r=await own(A);ok('creating a world does not make you its owner',!r.own&&!r.meta&&r.mine==0,r);r=await own(B);ok('anyone can build in it until someone locks it',r.edit,r);
  // ---- any player: here the visitor locks the world that someone else created
  const before=await ev(B,()=>cnt(17));r=await place(B);await sleep(700);ok('a visitor places a World Lock in a world someone else made',r.t==17&&r.meta,r);
  ok('and now owns it, on the server too',srv('lockland').o=='beatrix'&&srv('lockland').m,srv('lockland'));r=await own(B);ok('the world is listed as theirs, under their account name',r.own=='beatrix'&&r.meta=='beatrix'&&r.mine==1,r);
  r=await own(A);ok('the creator cannot build there now, and is told who owns it',!r.edit&&r.own=='beatrix'&&await ev(A,()=>/beatrix/.test(lockMsg())),r);
  // ---- nobody else can lock it
  const k2=await ev(A,()=>{addI(17,1);const n=cnt(17);return n});r=await place(A);await sleep(500);ok('a second player cannot lock an owned world, and keeps their lock',!r.t||r.t!=17||r.k==0?srv('lockland').o=='beatrix'&&(await ev(A,()=>cnt(17)))==k2:false,{r,k2,s:srv('lockland')});
  // ---- guests
  const G=await client(b,url,'Gus');await go(A,'guestland',true);await go(G,'guestland');const n0=await ev(G,()=>{addI(17,1);return cnt(17)});r=await place(G);await sleep(400);ok('a guest is told to make an account, and keeps the lock',!r.meta&&(await ev(G,()=>cnt(17)))==n0&&!srv('guestland').u,{r,msg:await ev(G,()=>msg)});
  // ---- realms follow the lock
  await ev(B,()=>{lvl=30});await go(B,WR='lockland-inf',false,'lockland');r=srv(WR);ok('a realm of a locked world belongs to the same owner',r&&r.o=='beatrix',r);
  const rr=await place(B);await sleep(300);r=await ev(B,()=>msg);ok('a realm cannot be locked separately',/base world/.test(r),r);await go(B,'lockland');
  // ---- freeing it: break the lock
  r=await ev(B,()=>{const m=meta;const c0=cnt(17);breakAt(m.x,m.y);return{c0,t:tiles[m.y*W+m.x]}});await sleep(800);
  ok('breaking your lock frees the world on the server',!srv('lockland').u&&!srv('lockland').m,srv('lockland'));r=await own(B);ok('it is no longer listed as yours',r.mine==0&&!r.own,r);r=await own(A);ok('and others can build again',r.edit&&!r.own,r);ok('its realm is free too',srv('lockland-inf')&&!srv('lockland-inf').o,srv('lockland-inf'));
  // ---- someone else can then take it
  await go(A,'lockland');await ev(A,()=>{addI(17,1)});r=await place(A);await sleep(700);ok('then another player can lock it',srv('lockland').o=='annie',srv('lockland'));
  // ---- releasing from the menu gives the lock back
  const c1=await ev(A,()=>cnt(17)),lk=await ev(A,()=>meta.y*W+meta.x);await ev(A,()=>NET7.send({t:'world_release',w:'lockland'}));await sleep(800);r=await own(A);ok('releasing from the Worlds menu frees it',!srv('lockland').u&&r.mine==0&&!r.own,{r,s:srv('lockland')});ok('removes the lock block for everyone',(await ev(A,k=>tiles[k],lk))!=17&&(await ev(B,k=>tiles[k],lk))!=17);ok('and your World Lock comes back',(await ev(A,()=>cnt(17)))==c1+1,{was:c1,now:await ev(A,()=>cnt(17))});
  // ---- the limit of 5
  // (the server's own refusal of a sixth world is in tests/online-server.js)
  await go(B,'guestland');const c6=await ev(B,()=>{addI(17,1);const q=ONL10.mine;q.list=[1,2,3,4,5];q.max=5;return cnt(17)});r=await place(B);await sleep(500);const m6=await ev(B,()=>msg);ok('with 5 worlds already, a lock is refused before it is used, and you keep it',!srv('guestland').u&&(await ev(B,()=>cnt(17)))==c6&&/already own 5/.test(m6),{s:srv('guestland'),m6});
  ok('no page errors',errs.length==0,errs.slice(0,4).join(' | '));
 }catch(e){ok('world lock harness',false,String(e.stack||e).slice(0,700))}
 await b.close();try{await S.close()}catch(_){}console.log(fails?'FAILURES '+fails:'all world lock tests passed');process.exit(fails?1:0)})();
var r,A0,WR;
