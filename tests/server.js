// Server tests: auth, owner-only admin, world rules, sync, weather, persistence, rate limits. Zero external deps.
const path=require('path'),fs=require('fs'),os=require('os'),{spawnSync}=require('child_process'),http=require('http');
const {createServer}=require('../server/server');const {C}=require('./wsclient');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x?'  - '+x:''));if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},120000).unref();
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbsrv-'));const SN='64';
const env=Object.assign({},process.env,{DATA_DIR:dir,SCRYPT_N:SN});
function get(port,p){return new Promise(r=>http.get({host:'127.0.0.1',port,path:p},res=>{let b='';res.on('data',d=>b+=d);res.on('end',()=>r({s:res.statusCode,b}))}).on('error',()=>r({s:0,b:''})))}
async function mk(port,hdr){const c=await new C(port).connect();await c.wait(m=>m.t=='server');return c}
async function guest(port,name='Guest'){const c=await mk(port);await c.rpc({t:'guest',name},m=>m.t=='auth');return c}
async function login(port,name,pass){const c=await mk(port);const r=await c.rpc({t:'login',name,pass},m=>m.t=='auth');return{c,r}}
async function reg(port,name,pass){const c=await mk(port);const r=await c.rpc({t:'register',name,pass},m=>m.t=='auth');return{c,r}}
(async()=>{
 // --- owner setup via CLI
 let r=spawnSync('node',[path.join(__dirname,'..','server','cli.js'),'set-owner','Creator','--password-stdin'],{input:'a-long-owner-pass\n',env});ok('CLI sets the single owner account',r.status==0&&/configured/.test(r.stdout.toString()),(r.stderr||'').toString().slice(0,80));
 r=spawnSync('node',[path.join(__dirname,'..','server','cli.js'),'set-owner','Other','--password-stdin'],{input:'another-long-pass\n',env});ok('CLI refuses to replace owner without --force',r.status!=0);
 r=spawnSync('node',[path.join(__dirname,'..','server','cli.js'),'set-owner','Creator','--password-stdin'],{input:'short\n',env});ok('CLI rejects weak owner password',r.status!=0);
 const accRaw=fs.readFileSync(path.join(dir,'accounts.json'),'utf8');ok('owner password is stored only as a scrypt hash',!accRaw.includes('a-long-owner-pass')&&accRaw.includes('"h"'));
 process.env.DATA_DIR=dir;let S=createServer({port:0,host:'127.0.0.1',dataDir:dir,scryptN:+SN,wxCooldownMs:300,maxConnsPerIp:200,client:path.join(__dirname,'..','index.html')});let port=await S.listen();
 const h=await get(port,'/health');ok('/health reports ownerConfigured',h.s==200&&JSON.parse(h.b).ownerConfigured===true);
 const idx=await get(port,'/');ok('server serves the game client at /',idx.s==200&&idx.b.includes('Rootbound'));
 ok('unknown http path 404',(await get(port,'/data/accounts.json')).s==404);
 let bad=null;try{bad=await new C(port,'/nope').connect()}catch(e){bad=null}ok('websocket upgrade on wrong path refused',bad===null);
 // --- accounts
 let A=await reg(port,'alice','alice-password');ok('register account',A.r.ok&&A.r.kind=='user'&&!A.r.owner&&A.r.token);
 ok('cannot register the owner name',!(await reg(port,'Creator','whatever-pass1')).r.ok);
 ok('cannot register reserved names',!(await reg(port,'admin','whatever-pass1')).r.ok&&!(await reg(port,'CEO','whatever-pass1')).r.ok);
 ok('weak password rejected',!(await reg(port,'weakling','123')).r.ok);
 let B=await reg(port,'bob','bob-password!');
 let bad1=await login(port,'alice','wrong-pass');ok('wrong password rejected',!bad1.r.ok);
 let thr=null;for(let i=0;i<7;i++){thr=await login(port,'alice','wrong'+i)}ok('repeated failures are throttled',!thr.r.ok&&/Too many/.test(thr.r.m||''));
 const G=await guest(port,'Visitor');
 // --- ordinary players and guests are never owner
 for(const[nm,c]of[['guest',G],['alice',A.c],['bob',B.c]]){const x=await c.rpc({t:'admin',op:'players',rid:1},m=>m.t=='admin_res');ok('admin op denied for '+nm,!x.ok&&x.m=='Not authorized')}
 A.c.send({t:'auth',ok:1,owner:true,kind:'owner'});A.c.send({t:'setOwner',uid:A.r.uid});const x2=await A.c.rpc({t:'admin',op:'kick',who:'bob',rid:2,owner:true},m=>m.t=='admin_res');ok('forged owner flags in messages are ignored',!x2.ok);
 // --- owner
 const O=await login(port,'Creator','a-long-owner-pass');ok('owner logs in with password and is flagged owner by the server',O.r.ok&&O.r.owner===true&&O.r.kind=='owner');
 const st=await O.c.rpc({t:'admin',op:'stats',rid:3},m=>m.t=='admin_res');ok('owner can run admin ops',st.ok&&st.data.players>=4);
 ok('owner op audit trail records denied attempts',S.store.readAudit(100).some(e=>e.ev=='admin-denied'));
 // --- worlds
 const gc=await G.rpc({t:'enter',w:'blossomtown',create:true},m=>m.t=='enter_err'||m.t=='joined');ok('guests cannot create worlds',gc.t=='enter_err');
 const en=await A.c.rpc({t:'enter',w:'AliceLand',create:true},m=>m.t=='joined'||m.t=='enter_err');ok('account can create a world',en.t=='joined'&&en.w=='aliceland');
 const hello=await A.c.wait(m=>m.t=='_hello');ok('new world has default weather',hello.d.wx=='default'&&Object.keys(hello.d.edits).length==0);
 const ex=await G.rpc({t:'enter',w:'aliceland'},m=>m.t=='joined'||m.t=='enter_err');ok('guest can enter an existing public world',ex.t=='joined');
 const b1=await B.c.rpc({t:'enter',w:'aliceland'},m=>m.t=='joined');await sleep(80);
 A.c.clear();A.c.send({t:'_p',d:{x:100,y:200,f:1,uid:'zzzspoof',n:'FakeOwner',lv:5}});const pp=await B.c.wait(m=>m.t=='_p'&&m.d.x==100);ok('clients see each other; server overrides spoofed uid/name in presence',pp.d.uid==A.r.uid&&pp.d.n=='alice'&&pp.f==en.sid,JSON.stringify(pp.d).slice(0,80));
 // plaza is shared but not persistent/editable
 const pz=await mk(port);await pz.rpc({t:'guest',name:'P'},m=>m.t=='auth');await pz.rpc({t:'enter',w:'plaza'},m=>m.t=='joined');pz.send({t:'e',d:{k:50,a:[3,0,0,0]}});await sleep(100);ok('plaza edits are not accepted',!fs.existsSync(path.join(dir,'worlds','plaza.json')));
 // --- sync + permissions (no meta yet = open sandbox like the old plaza rules)
 A.c.clear();B.c.clear();A.c.send({t:'meta',d:{x:10,y:20,o:A.r.uid,on:'alice',f:[],pub:0,t:[],b:[],pr:0,d:'',sp:null}});await B.c.wait(m=>m.t=='meta');ok('world lock (meta) is relayed to others',true);
 A.c.send({t:'e',d:{k:2000,a:[3,0,0,0]}});const eb=await B.c.wait(m=>m.t=='e'&&m.d.k==2000);ok('owner edit reaches Client B',eb.d.a[0]==3);
 B.c.clear();B.c.send({t:'e',d:{k:2001,a:[3,0,0,0]}});await sleep(150);ok('non-builder edit is rejected after lock',!A.c.has(m=>m.t=='e'&&m.d.k==2001)&&B.c.has(m=>m.t=='_rej'));
 B.c.send({t:'e',d:{k:99999,a:[3,0,0,0]}});B.c.send({t:'e',d:{k:5,a:[999,0,0,0]}});B.c.send({t:'e',d:{k:'x',a:'y'}});B.c.send('{bad json');await sleep(100);ok('malformed/forged edits do not crash the server',(await get(port,'/health')).s==200);
 B.c.send({t:'meta',d:{x:5,y:5,o:B.r.uid,on:'bob',f:[],pub:0,t:[],b:[],pr:0,d:'',sp:null}});await sleep(100);ok('non-owner cannot take over an owned world lock',S.worlds.get('aliceland').meta.o==A.r.uid);
 const meta=S.worlds.get('aliceland').meta;ok('lock owner unchanged',meta.o==A.r.uid);
 A.c.send({t:'meta',d:Object.assign({},meta,{f:[B.r.uid]})});await sleep(100);B.c.clear();B.c.send({t:'e',d:{k:2002,a:[3,0,0,0]}});await sleep(120);ok('owner can grant builder role; then B edits sync',A.c.has(m=>m.t=='e'&&m.d.k==2002));
 // objects: weather machine requires the object tile first
 A.c.send({t:'e',d:{k:2100,a:[40,0,0,0]}});await sleep(80);
 A.c.clear();B.c.clear();A.c.send({t:'o',d:{op:'wx',k:2100}});const wx1=await B.c.wait(m=>m.t=='wx');ok('Space machine sets world weather and B receives it',wx1.d.w=='space');
 A.c.send({t:'e',d:{k:2101,a:[41,0,0,0]}});await sleep(60);A.c.clear();A.c.send({t:'o',d:{op:'wx',k:2101}});await sleep(100);ok('weather machine cooldown blocks rapid switching',!A.c.has(m=>m.t=='wx')&&A.c.has(m=>m.t=='notice'));
 await sleep(350);A.c.clear();A.c.send({t:'o',d:{op:'wx',k:2101}});const wx2=await A.c.wait(m=>m.t=='wx');ok('after cooldown Galaxy machine works',wx2.d.w=='galaxy');
 await sleep(150);G.clear();G.send({t:'o',d:{op:'wx',k:2100}});await sleep(150);ok('visitor without permission cannot trigger a machine',!G.has(m=>m.t=='wx')&&S.worlds.get('aliceland').weather=='galaxy',S.worlds.get('aliceland').weather+' '+G.has(m=>m.t=='wx'));
 A.c.send({t:'o',d:{op:'wx',k:12345}});A.c.send({t:'o',d:{op:'cfg',k:2100,v:{t:41}}});await sleep(80);ok('forged object ops are rejected',S.worlds.get('aliceland').objs[2100].t==40);
 // chest ops
 A.c.send({t:'e',d:{k:2200,a:[27,0,0,0]}});await sleep(60);A.c.clear();A.c.send({t:'o',d:{op:'put',k:2200,i:5,n:7,rid:'r1'}});const put=await A.c.wait(m=>m.t=='o'&&m.d.op=='res'&&m.d.rid=='r1');ok('chest put validated by server',put.d.ok==1);
 A.c.clear();A.c.send({t:'o',d:{op:'take',k:2200,i:5,n:99,rid:'r2'}});const tk=await A.c.wait(m=>m.t=='o'&&m.d.op=='res'&&m.d.rid=='r2');ok('chest cannot be over-withdrawn',tk.d.ok==0);
 // --- admin actions
 const wlist=await O.c.rpc({t:'admin',op:'worlds',rid:4},m=>m.t=='admin_res');ok('owner lists worlds',wlist.ok&&wlist.data.some(w=>w.id=='aliceland'));
 const sw=await O.c.rpc({t:'admin',op:'weather',world:'aliceland',weather:'blossom',rid:5},m=>m.t=='admin_res');await sleep(100);ok('owner can set world weather',sw.ok&&S.worlds.get('aliceland').weather=='blossom');
 const mu=await O.c.rpc({t:'admin',op:'mute',who:'bob',mins:1,rid:6},m=>m.t=='admin_res');B.c.clear();A.c.clear();B.c.send({t:'chat',d:{t:'hello',n:'bob'}});await sleep(100);ok('muted player chat is dropped',mu.ok&&!A.c.has(m=>m.t=='chat'));
 const an=await O.c.rpc({t:'admin',op:'announce',text:'hi all',scope:'all',rid:7},m=>m.t=='admin_res');await sleep(50);ok('announcement delivered',an.ok&&A.c.has(m=>m.t=='notice'&&m.d.text=='hi all'));
 const kk=await O.c.rpc({t:'admin',op:'kick',who:'bob',rid:8},m=>m.t=='admin_res');await sleep(400);ok('owner can kick',kk.ok&&B.c.closed);
 const nd=await O.c.rpc({t:'admin',op:'world_delete',world:'aliceland',confirm:'wrong',rid:9},m=>m.t=='admin_res');ok('destructive op needs typed confirmation',!nd.ok);
 // --- persistence across restart
 await sleep(2000);await S.close();
 S=createServer({port:0,host:'127.0.0.1',dataDir:dir,scryptN:+SN,wxCooldownMs:300,maxConnsPerIp:200});port=await S.listen();
 const A2=await login(port,'alice','alice-password');ok('account survives server restart',A2.r.ok);
 const j=await A2.c.rpc({t:'enter',w:'aliceland'},m=>m.t=='_hello');ok('world edits persisted across restart',j.d.edits[2000]&&j.d.edits[2000][0]==3&&j.d.edits.m&&j.d.edits.m.o==A2.r.uid);
 ok('weather persisted across restart',j.d.wx=='blossom',j.d.wx);ok('objects (chest contents) persisted',j.d.edits.o&&j.d.edits.o[2200]&&j.d.edits.o[2200].c.it[0][1]==7);
 const tok=A2.r.token;A2.c.close();await sleep(100);const rs=await mk(port);const rr=await rs.rpc({t:'resume',token:tok},m=>m.t=='auth');ok('session token resume works (reconnect)',rr.ok&&rr.name=='alice');
 const j2=await rs.rpc({t:'enter',w:'aliceland'},m=>m.t=='_hello');ok('reconnected client receives current world state',j2.d.edits[2000]!=null);
 const badTok=await mk(port);const bt=await badTok.rpc({t:'resume',token:'nope'},m=>m.t=='auth');ok('invalid token rejected',!bt.ok);
 // owner token after restart is still owner only for the owner uid
 const O2=await login(port,'Creator','a-long-owner-pass');ok('owner still owner after restart',O2.r.owner===true);
 // --- corrupted world recovery
 await sleep(1700);
 const A3=await login(port,'alice','alice-password');await A3.c.rpc({t:'enter',w:'aliceland'},m=>m.t=='_hello');A3.c.send({t:'e',d:{k:3999,a:[3,0,0,0]}});await sleep(1800);A3.c.send({t:'leave'});await sleep(100);const wf=path.join(dir,'worlds','aliceland.json');fs.writeFileSync(wf,'{corrupt');S.worlds.delete('aliceland');const rec=await A3.c.rpc({t:'enter',w:'aliceland'},m=>m.t=='_hello'||m.t=='enter_err');ok('corrupted world file is quarantined and the previous backup is loaded',rec.t=='_hello'&&rec.d.edits[2000]!=null&&fs.readdirSync(path.join(dir,'worlds')).some(f=>f.includes('.corrupt-'))&&S.store.readAudit(50).some(e=>e.ev=='recovered-from-backup'||e.ev=='corrupt-file-quarantined'),rec.t+' '+(rec.d&&Object.keys(rec.d.edits).slice(0,5))+' '+fs.readdirSync(path.join(dir,'worlds')).join(','));
 // --- rate limit
 A3.c.clear();for(let i=0;i<200;i++)A3.c.send({t:'e',d:{k:3000+i,a:[3,0,0,0]}});await sleep(300);const w3=S.worlds.get('aliceland');const applied=Object.keys(w3.edits).filter(k=>+k>=3000).length;ok('edit flood is rate-limited',applied<=75,applied+' of 200 applied');
 // --- capacity
 S.cfg.maxPlayers=1;const f1=await guest(port,'F1');const fe=await f1.rpc({t:'enter',w:'aliceland'},m=>m.t=='joined'||m.t=='enter_err');ok('world capacity enforced',fe.t=='enter_err'&&/full/.test(fe.m));
 // --- store: wallet, purchases, idempotency, persistence (server is the authority on prices + ownership)
 {const cat=require('../server/shop').loadCatalog();const P=id=>cat.get(id).price;
  const SH=await reg(port,'shopper','shopper-pass-1');const sc=SH.c;const buy=(o,ms)=>sc.rpc(Object.assign({t:'buy'},o),m=>m.t=='buy_res',ms);
  const g0=await guest(port,'Gst');const gb=await g0.rpc({t:'buy',id:'wing_dove',rid:'g1'},m=>m.t=='buy_res');ok('guests cannot buy',!gb.ok);
  let r=await buy({id:'wing_dove',rid:'r0'});ok('purchase with an empty wallet fails and charges nothing',!r.ok&&r.gems===0,r.m);
  const w1=await sc.rpc({t:'sync',gems:100000},m=>m.t=='wallet');ok('gem growth is rate-limited (cannot sync an arbitrary balance)',w1.gems<=1500&&w1.gems>0,w1.gems);
  r=await buy({id:'nope_item',rid:'r1'});ok('unknown item rejected',!r.ok);
  r=await buy({id:'wing_dove',rid:'r2',price:1,gems:99999});const after=r.gems;ok('client-sent price/balance is ignored: charged the catalog price',r.ok&&r.spent===P('wing_dove')&&after===w1.gems-P('wing_dove'),JSON.stringify(r));
  const r2=await buy({id:'wing_dove',rid:'r2'});ok('repeating the same request id does not charge twice',r2.ok&&r2.dup&&r2.gems===after,JSON.stringify(r2));
  const r3=await buy({id:'wing_dove',rid:'r3'});ok('owning a non-stackable item blocks a second purchase',!r3.ok&&r3.gems===after,r3.m);
  const r4=await buy({id:'blk_1',qty:5,rid:'r4'});ok('stackable items buy by quantity at catalog price',r4.ok&&r4.spent===P('blk_1')*5&&r4.owned===5);
  const r5=await buy({id:'blk_1',qty:-3,rid:'r5'});const r6=await buy({id:'blk_1',qty:1000,rid:'r6'});ok('negative / huge quantities rejected',!r5.ok&&!r6.ok);
  const r7=await buy({id:'wing_dragon',rid:'r7'});ok('too-expensive purchase rejected without charge',!r7.ok&&r7.gems===r4.gems,r7.m);
  const wl=await sc.rpc({t:'wallet'},m=>m.t=='wallet');ok('wallet view shows ownership',wl.owned.wing_dove===1&&wl.owned.blk_1===5&&wl.gems===r4.gems);
  await sleep(1700);await S.close();S=createServer({port,host:'127.0.0.1',dataDir:dir,scryptN:+SN,wxCooldownMs:300,maxConnsPerIp:200,client:path.join(__dirname,'..','index.html')});await S.listen();
  const SH2=await login(port,'shopper','shopper-pass-1');const wl2=await SH2.c.wait(m=>m.t=='wallet');ok('wallet and ownership survive a server restart',wl2.owned.wing_dove===1&&wl2.gems===r4.gems,JSON.stringify(wl2));
  ok('every catalog item has a valid price, rarity and unique id',[...cat.values()].every(i=>i.price>0&&['common','uncommon','rare','epic','legendary','mythic','exclusive'].includes(i.rar)&&i.n&&i.d&&i.cat));}
 await S.close();console.log(fails?'FAILURES '+fails:'all server tests passed');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL exception',e&&e.stack||e);process.exit(1)});
