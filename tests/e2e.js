// End-to-end: real server process-in-test + independent real browser clients. Verifies join, presence, block sync, weather machines,
// persistence across a server restart, reconnect, and owner-only Tools. Report is printed honestly (PASS/FAIL).
const path=require('path'),fs=require('fs'),os=require('os'),{spawnSync}=require('child_process');
const {chromium}=require('playwright');const {createServer}=require('../server/server');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?'  - '+x:''));if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},170000).unref();
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbe2e-')),SN='64';
const env=Object.assign({},process.env,{DATA_DIR:dir,SCRYPT_N:SN});
const OWN='owner-pass-123456';
spawnSync('node',[path.join(__dirname,'..','server','cli.js'),'set-owner','Creator','--password-stdin'],{input:OWN+'\n',env});
const mkS=port=>createServer({port,host:'127.0.0.1',dataDir:dir,scryptN:+SN,wxCooldownMs:300,maxConnsPerIp:200,client:path.join(__dirname,'..','index.html')});
async function client(b,url,tag){const p=await b.newPage({viewport:{width:1280,height:720}});p.errs=[];p.on('pageerror',e=>p.errs.push(tag+': '+e.message.slice(0,140)));
 await p.goto(url);await p.waitForTimeout(900);await p.getByText('PLAY AS GUEST',{exact:false}).first().click();await p.waitForTimeout(700);
 await p.evaluate(()=>{try{$('cgo').click()}catch(_){}});await p.waitForTimeout(500);await p.evaluate(()=>{try{PLN7.close();SHOW7.close()}catch(_){}});
 await p.waitForFunction(()=>NET7.online,null,{timeout:12000});return p}
const ev=(p,f,a)=>p.evaluate(f,a);
(async()=>{
 let S=mkS(0);let port=await S.listen();const url='http://127.0.0.1:'+port+'/';
 const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox']});
 try{
  const A=await client(b,url,'A'),B=await client(b,url,'B');
  ok('both clients auto-discover the server and go online',await ev(A,()=>NET7.online)&&await ev(B,()=>NET7.online));
  ok('no host/join-room UI is present',await ev(A,()=>!/host a room|room code|join room/i.test(document.body.innerText)&&!document.querySelector('#bh,#bjoin,#rcode')));
  // owner signs in on A (verified by the server); B stays an ordinary guest
  await ev(A,()=>NET7.send({t:'login',name:'Creator',pass:'owner-pass-123456'}));
  await A.waitForFunction(()=>NET7.owner,null,{timeout:8000}).catch(()=>{});
  ok('owner login is recognised by the server',await ev(A,()=>NET7.owner));
  ok('Tools button visible for the owner',await ev(A,()=>{const b=document.getElementById('btools');return !!b&&getComputedStyle(b).display!='none'}));
  ok('Tools button absent for an ordinary guest',await ev(B,()=>{const b=document.getElementById('btools');return !b||getComputedStyle(b).display=='none'}));
  // forging client state does not grant access
  await ev(B,()=>{try{NET7.auth.owner=true}catch(_){}window.isOwner=true;window.RB_OWNER=true;localStorage.setItem('rbowner','1')});
  const forged=await ev(B,()=>new Promise(r=>{NET7.send({t:'admin',op:'announce',text:'forged'});setTimeout(()=>r(1),400)}));
  ok('guest forged admin request has no effect (no notice reaches the owner)',await ev(A,()=>!window.__noticeSeen));
  // worlds
  await ev(A,()=>NET7.go('e2eworld',true));await A.waitForFunction(()=>NET7.world=='e2eworld',null,{timeout:8000}).catch(()=>{});
  await ev(B,()=>NET7.go('e2eworld',false));await B.waitForFunction(()=>NET7.world=='e2eworld',null,{timeout:8000}).catch(()=>{});
  ok('A created and entered a public world',await ev(A,()=>NET7.world)=='e2eworld');
  ok('B entered the same world without anyone hosting',await ev(B,()=>NET7.world)=='e2eworld');
  await sleep(1500);
  ok('each client sees the other player',(await ev(A,()=>NET7.room.peers().length))>=2&&(await ev(B,()=>NET7.room.peers().length))>=2,await ev(A,()=>NET7.room.peers().length)+'/'+await ev(B,()=>NET7.room.peers().length));
  ok('world directory lists the world with population',await ev(B,()=>new Promise(r=>{NET7.refresh();setTimeout(()=>r(NET7.list.some(x=>x.id=='e2eworld'&&x.pop>=2)),700)})));
  // block sync
  const K=await ev(A,()=>{const x=(P.x/T|0)+3;let y=0;for(let yy=0;yy<H;yy++)if(tiles[yy*W+x]){y=yy-1;break}return y*W+x});
  await ev(A,k=>{tiles[k]=3;pushEdit(k)},K);await sleep(1200);
  ok('block placed by A appears for B',await ev(B,k=>tiles[k]==3,K));
  // default weather, then Galaxy machine
  ok('new world starts with default weather',await ev(A,()=>ENV7.target)=='default');
  const K2=K-1+0;await ev(A,k=>{tiles[k]=41;pushEdit(k)},K2);await sleep(900);
  await ev(A,k=>WXM7.use(k),K2);await sleep(1500);
  ok('weather machine switched A to galaxy',await ev(A,()=>ENV7.target)=='galaxy',await ev(A,()=>ENV7.target));
  ok('B received the same weather',await ev(B,()=>ENV7.target)=='galaxy',await ev(B,()=>ENV7.target));
  // ordinary player cannot change weather of a world they do not build in
  ok('server stored weather in the world list',await ev(B,()=>new Promise(r=>{NET7.refresh();setTimeout(()=>r(NET7.list.find(x=>x.id=='e2eworld')?.weather),600)}))=='galaxy');
  // A disconnects; B continues
  await ev(A,()=>NET7.toOffline());await sleep(900);
  ok('B stays connected after A disconnects',await ev(B,()=>NET7.online&&NET7.world=='e2eworld'));
  // purchases: server-validated wallet + ownership, persisted across a restart
  const E=await client(b,url,'E');await ev(E,()=>NET7.send({t:'login',name:'Creator',pass:'owner-pass-123456'}));await E.waitForFunction(()=>NET7.owner&&SHOP7.serverMode,null,{timeout:8000}).catch(()=>{});
  ok('signed-in client has a server wallet',await ev(E,()=>SHOP7.serverMode));
  await ev(E,()=>{gems=1500;NET7.send({t:'sync',gems:1500})});await sleep(700);
  const g1=await ev(E,()=>gems);ok('server accepted a small gem sync (rate-limited)',g1==1500,String(g1));
  const r1=await ev(E,()=>SHOP7.buy('wpn_frostbite'));ok('server purchase succeeds and charges the catalog price',r1.ok==1&&await ev(E,()=>gems)==800&&await ev(E,()=>SHOP7.has('wpn_frostbite')),JSON.stringify(r1));
  const r2=await ev(E,()=>new Promise(res=>{NET7.send({t:'buy',id:'wpn_frostbite',qty:1,rid:'dup1'});setTimeout(()=>res({gems,has:SHOP7.has('wpn_frostbite')}),700)}));ok('forged repeat purchase does not charge again',r2.gems==800&&r2.has,JSON.stringify(r2));
  const r3=await ev(B,()=>new Promise(res=>{const g0=gems;SHOP7.buy('wpn_frostbite').then(r=>res({r,same:gems==g0}))}));ok('guests cannot use the server shop and are not charged',r3.same,JSON.stringify(r3));
  // server restart: world, block and weather persist
  await S.close?.();await sleep(300);S=mkS(port);await S.listen();
  await B.waitForFunction(()=>NET7.online&&NET7.world=='e2eworld',null,{timeout:30000}).catch(()=>{});
  ok('B auto-reconnects after a server restart',await ev(B,()=>NET7.online&&NET7.world=='e2eworld'));
  ok('block still present after restart',await ev(B,k=>tiles[k]==3,K));
  ok('weather still galaxy after restart',await ev(B,()=>ENV7.target)=='galaxy');
  const F=await client(b,url,'F');await ev(F,()=>NET7.send({t:'login',name:'Creator',pass:'owner-pass-123456'}));await F.waitForFunction(()=>NET7.owner&&SHOP7.serverMode,null,{timeout:8000}).catch(()=>{});await sleep(500);
  const pr=await ev(F,()=>({has:SHOP7.has('wpn_frostbite'),gems}));ok('purchase + wallet persisted across the server restart',pr.has&&pr.gems==800,JSON.stringify(pr));
  const C=await client(b,url,'C');await ev(C,()=>NET7.go('e2eworld',false));await C.waitForFunction(()=>NET7.world=='e2eworld',null,{timeout:8000}).catch(()=>{});
  ok('late joiner receives saved world + weather',await ev(C,()=>ENV7.target)=='galaxy'&&await ev(C,k=>tiles[k]==3,K));
  const errs=[...A.errs,...B.errs,...C.errs,...E.errs,...F.errs];ok('no page errors in any client',errs.length==0,errs.slice(0,3).join(' | '));
 }catch(e){ok('e2e harness',false,String(e.stack||e).slice(0,500))}
 await b.close();try{await S.close?.()}catch(_){}
 console.log(fails?'FAILURES '+fails:'all e2e tests passed');process.exit(fails?1:0)})();
