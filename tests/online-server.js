// Online rules on the real server over real WebSockets: the owner from env vars, owner commands, world ownership (5 per person), realms, the item ledger,
// trades, drops, bans, presence deltas, the served page, and saves that survive a wiped disk (cloud mirror against a fake Redis REST API). node tests/online-server.js
const path=require('path'),fs=require('fs'),os=require('os'),http=require('http'),zlib=require('zlib');
const {createServer}=require('../server/server');const {Cloud,KEY}=require('../server/cloud');const {C}=require('./wsclient');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&x!==''?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},120000).unref();
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbonl-')),SN=64,OWN={ownerName:'Boss',ownerPass:'owner-password-1',ownerEmail:'boss@example.com'};
const mkS=(o)=>createServer(Object.assign({port:0,host:'127.0.0.1',dataDir:dir,scryptN:SN,wxCooldownMs:0,maxConnsPerIp:500,client:path.join(__dirname,'..','index.html')},OWN,o||{}));
function get(port,p,h){return new Promise(r=>http.get({host:'127.0.0.1',port,path:p,headers:h||{}},res=>{const b=[];res.on('data',d=>b.push(d));res.on('end',()=>r({s:res.statusCode,h:res.headers,b:Buffer.concat(b)}))}).on('error',()=>r({s:0,h:{},b:Buffer.alloc(0)})))}
let port;const mk=async()=>{const c=await new C(port).connect();await c.wait(m=>m.t=='server');return c};
const auth=async(m)=>{const c=await mk();const r=await c.rpc(m,x=>x.t=='auth');return{c,r}};
const reg=(name,pass=name+'-password')=>auth({t:'register',name,pass}),login=(name,pass=name+'-password')=>auth({t:'login',name,pass});
const guest=async(name='G')=>{const{c}=await auth({t:'guest',name});return c};
const enter=(c,w,create,base)=>c.rpc({t:'enter',w,create,base},m=>m.t=='_hello'||m.t=='enter_err');
const adm=(c,op,d)=>c.rpc(Object.assign({t:'admin',op,rid:'r'+Math.random()},d||{}),m=>m.t=='admin_res');
const pres=async(c,x,y)=>{c.send({t:'_p',d:{x,y,f:1}});await sleep(50)};
(async()=>{
 let S=mkS();port=await S.listen();
 const accs=()=>JSON.parse(fs.readFileSync(path.join(dir,'accounts.json'),'utf8')).users;
 // ---- owner from env (no shell on free hosts)
 ok('OWNER_NAME + OWNER_PASSWORD create the owner, password stored only as a hash',accs().boss&&accs().boss.pw.h&&!fs.readFileSync(path.join(dir,'accounts.json'),'utf8').includes(OWN.ownerPass));
 const O=await login('Boss',OWN.ownerPass);ok('the owner signs in and the server flags them',O.r.ok&&O.r.owner===true&&O.r.kind=='owner');
 const OE=await login('boss@example.com',OWN.ownerPass);ok('the owner can sign in with OWNER_EMAIL',OE.r.ok&&OE.r.owner===true);OE.c.close();await sleep(60);
 const O1=await login('Boss',OWN.ownerPass);O.c.close();const oc=O1.c,ouid=O1.r.uid;
 const A=await reg('alice'),B=await reg('bobby');const a=A.c,b=B.c,G=await guest('Gus');
 ok('nobody else can register the owner name',!(await reg('Boss','some-long-password')).r.ok);
 // ---- owner commands are refused for everyone else
 for(const op of['god','pull','summon','give','ban','kick']){const r=await adm(a,op,{who:'bobby',item:1,n:5});ok('non-owner is refused: '+op,!r.ok&&r.m=='Not authorized')}
 a.clear();await adm(G,'give',{who:'Gus',item:0,n:999});await sleep(60);ok('a guest cannot /give themselves anything',!G.has(m=>m.t=='bag'));
 // ---- world ownership and the limit of 5
 const lock=async(c,uid,name,x=10,y=10)=>{c.send({t:'meta',d:{x,y,o:uid,on:name,f:[],pub:0}});c.send({t:'e',d:{k:y*256+x,a:[17,0,0,0]}});await sleep(60)};
 const he=await enter(a,'alice1',true);ok('creating a world does not make you its owner',he.d&&!he.d.own&&he.d.g==2);
 await lock(a,A.r.uid,'Not My Name');const wa=S.worlds.get('alice1');ok('placing a World Lock does, under the real account name',wa.ownerUid==A.r.uid&&wa.ownerName=='alice'&&wa.meta.on=='alice',{u:wa.ownerName,on:wa.meta&&wa.meta.on});
 // (the create limit is 3 a minute per connection: use a fresh connection for each)
 const cA=async()=>(await login('alice')).c;
 for(let i=2;i<=5;i++){const c=await cA();const r=await enter(c,'alice'+i,true);if(r.t!='_hello')ok('world '+i+' created',false,r.m);await lock(c,A.r.uid,'alice');c.close();await sleep(40)}
 const a2=await cA();const six=await enter(a2,'alice6',true);ok('you can still make more worlds than you own',six.t=='_hello',six.m);await lock(a2,A.r.uid,'alice');await sleep(60);ok('a sixth lock is refused: nobody owns more than 5',!S.worlds.get('alice6').ownerUid&&!S.worlds.get('alice6').meta,S.worlds.get('alice6').ownerName);
 const mine=await a2.rpc({t:'myworlds'},m=>m.t=='myworlds');ok('the server lists your owned worlds and the limit',mine.list.length==5&&mine.max==5,mine);
 await a2.rpc({t:'world_release',w:'alice5'},m=>m.t=='myworlds'&&m.list.length==4);await lock(a2,A.r.uid,'alice');await sleep(60);ok('releasing a world frees a slot',S.worlds.get('alice6').ownerName=='alice',S.worlds.get('alice6').ownerName);
 await enter(a2,'alice1');
 const be=await enter(b,'alice1');ok('others can visit and are told who owns it',be.d.own.on=='alice');
 await sleep(50);b.clear();b.send({t:'e',d:{k:2000,a:[3,0,0,0]}});await sleep(100);ok('a non-owner cannot build in a locked world',b.has(m=>m.t=='_rej')&&!S.worlds.get('alice1').edits[2000]);
 b.send({t:'meta',d:{x:5,y:5,o:B.r.uid,on:'bobby',f:[],pub:0,t:[],b:[],pr:0,d:'',sp:null}});await sleep(100);ok('a non-owner cannot lock someone else\'s world',S.worlds.get('alice1').meta.o==A.r.uid&&S.worlds.get('alice1').ownerName=='alice');
 a2.send({t:'e',d:{k:2000,a:[3,0,0,0]}});await sleep(100);ok('the owner builds; a late joiner gets the same generator version',S.worlds.get('alice1').edits[2000]&&S.worlds.get('alice1').g==2);
 ok('hello carries generator version 2 once the world has edits',(await enter(G,'alice1')).d.g==2);
 // new worlds are not limited by ownership any more, so one account has a daily limit (fresh connections: the 3-a-minute limit is per connection)
 {let made=0,last=null;for(let i=0;i<14;i++){const c=(await reg('maker'+(i?'':''),'maker-password')).c;last=await enter(c,'mkw'+i,true);c.close();await sleep(30);if(last.t=='_hello')made++;else break;if(i==0)break}
  const cm=async()=>(await login('maker','maker-password')).c;for(let i=1;i<14;i++){const c=await cm();last=await enter(c,'mkw'+i,true);c.close();await sleep(30);if(last.t=='_hello')made++;else break}ok('one account can make 10 new worlds a day',made==10&&last.t=='enter_err'&&/10 new worlds/.test(last.m),{made,m:last.m})}
 // ---- realms
 const rf=await enter(a2,'alice1-inf',false,'alice2');ok('a realm needs its real base world',rf.t=='enter_err');
 const rok=await enter(a2,'alice1-inf',false,'alice1');ok('a realm opens for free and belongs to the base owner',rok.t=='_hello'&&rok.d.own.o==A.r.uid);
 const m2=await a2.rpc({t:'myworlds'},m=>m.t=='myworlds');ok('a realm does not count toward the 5',m2.list.length==5&&!m2.list.some(x=>x.id=='alice1-inf'),m2.list.map(x=>x.id));
 await enter(a2,'alice1');const wl=await a2.rpc({t:'worlds'},m=>m.t=='worlds');ok('realms are not listed as separate public worlds',wl.list.some(w=>w.id=='alice1')&&!wl.list.some(w=>w.id=='alice1-inf'));
 ok('a world cannot be created with a realm name directly',(await enter(b,'mine-gal',true)).t=='enter_err');
 // ---- god mode
 const g1=await adm(oc,'god',{on:true});const gm=await oc.wait(m=>m.t=='god');ok('/god turns on for the owner',g1.ok&&gm.on==1);
 const wal=await oc.wait(m=>m.t=='wallet'&&m.gems>=999999);ok('god mode tops up the wallet',wal.gems>=999999);
 await enter(oc,'alice1');await sleep(50);oc.send({t:'e',d:{k:2500,a:[3,0,0,0]}});await sleep(100);ok('in god mode the owner can build anywhere',!!S.worlds.get('alice1').edits[2500]);
 const relog=await login('Boss',OWN.ownerPass);const again2=await relog.c.wait(m=>m.t=='god');ok('god mode survives signing in again',again2.on==1);const oc2=relog.c;await enter(oc2,'alice1');
 const g0=await adm(oc2,'god',{on:false});const w0=await oc2.wait(m=>m.t=='wallet'&&m.gems<999999);ok('turning it off restores the real wallet',g0.ok&&w0.gems==0,w0.gems);
 oc2.send({t:'e',d:{k:2501,a:[3,0,0,0]}});await sleep(100);ok('out of god mode the world lock applies to the owner too',!S.worlds.get('alice1').edits[2501]);
 // ---- pull / summon
 await pres(oc2,777,333);b.clear();const pr=await adm(oc2,'pull',{who:'bobby'});const tp=await b.wait(m=>m.t=='sys'&&m.d.op=='tp');ok('/pull teleports a player in this world to you',pr.ok&&tp.d.x==777&&tp.d.y==333,tp.d);
 await enter(b,'plaza');await sleep(30);ok('/pull refuses a player in another world',!(await adm(oc2,'pull',{who:'bobby'})).ok);
 a2.send({t:'meta',d:{x:9,y:9,o:A.r.uid,on:'alice',f:[],pub:0,t:[],b:[],pr:1,d:'',sp:null}});await sleep(100);
 ok('a private world refuses visitors',(await enter(b,'alice1')).t=='enter_err');
 b.clear();const sm=await adm(oc2,'summon',{who:'bobby'});const sw=await b.wait(m=>m.t=='sys'&&m.d.op=='world');ok('/summon sends a player from another world, with your position',sm.ok&&sw.d.w=='alice1'&&sw.d.x==777);
 const sin=await enter(b,'alice1');ok('a summoned player gets into a private world once',sin.t=='_hello');await enter(b,'plaza');ok('the summon pass is used up',(await enter(b,'alice1')).t=='enter_err');
 a2.send({t:'meta',d:{x:9,y:9,o:A.r.uid,on:'alice',f:[],pub:0,t:[],b:[],pr:0,d:'',sp:null}});await sleep(100);await enter(b,'alice1');
 // ---- /give
 b.clear();const gi=await adm(oc2,'give',{who:'bobby',item:5,n:40});const bg=await b.wait(m=>m.t=='bag'&&m.d[5]==40);ok('/give delivers items and the ledger holds them',gi.ok&&bg.why=='gift');
 const gg=await adm(oc2,'give',{who:'bobby',item:0,n:300});const bw=await b.wait(m=>m.t=='wallet'&&m.gems==300);ok('/give gems credits the wallet',gg.ok&&bw.gems==300);
 ok('/give rejects junk',!(await adm(oc2,'give',{who:'bobby',item:5,n:-3})).ok&&!(await adm(oc2,'give',{who:'bobby',item:'x',n:3})).ok);
 const off=await reg('offline1');off.c.close();await sleep(60);const go=await adm(oc2,'give',{who:'offline1',item:7,n:9});const back=await login('offline1');const pend=await back.c.wait(m=>m.t=='bag'&&m.d&&m.d[7]==9);ok('a gift to an offline account arrives at their next sign-in',go.ok&&!!pend);back.c.close();
 // ---- the ledger: bag_sync limits growth and ignores stale reports
 const gr=await reg('grower');const sq=(await gr.c.wait(m=>m.t=='bag')).seq;gr.c.send({t:'bag_sync',inv:{7:99000},seq:sq});gr.c.send({t:'bag_sync',inv:{7:99000,8:1},seq:sq+5});await sleep(1700);const gb0=accs().grower.bag;ok('a client cannot report huge item growth: it is capped, and a stale report is ignored',gb0.i[7]==2000&&!gb0.i[8],gb0.i);gr.c.close();
 const sa=await login('alice');/* signing in again gives the current seq */const seqA=(await sa.c.wait(m=>m.t=='bag')).seq;const ac=sa.c;await enter(ac,'alice1');
 const sb=await login('bobby');const seqB=(await sb.c.wait(m=>m.t=='bag')).seq;const bc=sb.c;await enter(bc,'alice1');
 // ---- trades
 const T=m=>Object.assign({t:'trade'},m);
 ok('a guest cannot trade',(await G.rpc(T({op:'ask',to:'x'}),m=>m.t=='trade'&&m.op=='err')).m.match(/account/));
 const sidA=(await ac.rpc({t:'enter',w:'plaza'},m=>m.t=='joined')).sid;await enter(ac,'alice1');await sleep(40);
 const sidB=(await bc.rpc({t:'enter',w:'plaza'},m=>m.t=='joined')).sid;
 ok('you cannot trade with someone in another world',(await ac.rpc(T({op:'ask',to:sidB}),m=>m.t=='trade'&&m.op=='err')).m.match(/not in this world/));
 await enter(bc,'alice1');await sleep(40);
 ac.send({t:'bag_sync',inv:{6:100},seq:seqA});await sleep(60);
 const big=await ac.rpc(T({op:'ask',to:sidB,give:[6,99999]}),m=>m.t=='trade'&&(m.op=='err'||m.op=='asked'));ok('you cannot open a trade offering more than the ledger holds',big.op=='err');
 bc.clear();ac.clear();ac.send(T({op:'ask',to:sidB,give:[6,10],want:[5,4]}));const ask=await bc.wait(m=>m.t=='trade'&&m.op=='ask');ok('the other player gets the request with the typed terms',ask.name=='alice'&&ask.give[1]==10&&ask.want[1]==4,ask);
 const stB=await bc.rpc(T({op:'accept',id:ask.id}),m=>m.t=='trade'&&m.op=='state');ok('accepting opens the window with both offers filled in',stB.me.it[0][0]==5&&stB.me.it[0][1]==4&&stB.them.it[0][1]==10,stB);
 const nc=await bc.rpc(T({op:'confirm',id:ask.id}),m=>m.t=='trade'&&m.op=='err');ok('confirming before both lock is refused',/lock/i.test(nc.m));
 const over=await bc.rpc(T({op:'set',id:ask.id,it:[[5,99999]]}),m=>m.t=='trade'&&m.op=='err');ok('you cannot offer more than you hold',/do not have/.test(over.m));
 const forged=await bc.rpc(T({op:'set',id:ask.id,it:[[5,-4]]}),m=>m.t=='trade'&&m.op=='err');ok('negative amounts are rejected',/not valid/.test(forged.m));
 ac.send(T({op:'lock',on:1}));await sleep(40);bc.send(T({op:'lock',on:1}));await sleep(40);
 ac.clear();bc.send(T({op:'set',it:[[5,1]]}));const un=await ac.wait(m=>m.t=='trade'&&m.op=='state');ok('changing an offer unlocks both sides',un.me.lock==0&&un.them.lock==0&&un.them.it[0][1]==1,un);
 bc.send(T({op:'set',it:[[5,4]]}));await sleep(40);ac.send(T({op:'lock',on:1}));await sleep(40);bc.send(T({op:'lock',on:1}));await sleep(40);
 ac.clear();bc.clear();ac.send(T({op:'confirm'}));await sleep(60);ok('one confirmation is not enough',!ac.has(m=>m.op=='closed'));bc.send(T({op:'confirm'}));
 const dA=await ac.wait(m=>m.t=='bag'&&m.why=='trade'),dB=await bc.wait(m=>m.t=='bag'&&m.why=='trade');const cl=await ac.wait(m=>m.t=='trade'&&m.op=='closed');
 ok('both confirming swaps exactly, on both clients',dA.d[6]==-10&&dA.d[5]==4&&dB.d[6]==10&&dB.d[5]==-4&&cl.done==1,[dA.d,dB.d]);
 ac.clear();ac.send(T({op:'confirm'}));const nomore=await ac.wait(m=>m.t=='trade'&&m.op=='err');ok('a finished trade cannot be replayed',/over/.test(nomore.m));
 // cancel on leaving
 ac.send(T({op:'ask',to:sidB}));const a3=await bc.wait(m=>m.t=='trade'&&m.op=='ask'&&m.id!=ask.id);bc.send(T({op:'accept',id:a3.id}));await sleep(40);ac.clear();await enter(bc,'plaza');const left=await ac.wait(m=>m.t=='trade'&&m.op=='closed');ok('leaving the world cancels a trade',!left.done);await enter(bc,'alice1');await sleep(40);
 // old peer-to-peer trade messages no longer travel
 bc.clear();ac.send({t:'x',d:{op:'tr_done',to:sidB,id:'zz'}});await sleep(80);ok('the old peer-to-peer trade messages are not relayed',!bc.has(m=>m.t=='x'));
 // ---- drops
 await pres(ac,1000,500);await pres(bc,1000,500);bc.clear();
 ac.send({t:'drop',i:6,n:999999});await sleep(60);ok('you cannot drop more than you hold',!bc.has(m=>m.t=='dr+'));
 ac.clear();ac.send({t:'drop',i:6,n:5});const dp=await bc.wait(m=>m.t=='dr+');const dd=await ac.wait(m=>m.t=='bag'&&m.why=='drop');ok('a drop is debited and everyone in the world sees it',dp.d.i==6&&dp.d.n==5&&dd.d[6]==-5,dp.d);
 await enter(G,'plaza');await enter(G,'alice1');const lg=G.msgs.find(m=>m.t=='_hello'&&m.d.w=='alice1');ok('a late joiner sees the item on the ground',lg&&lg.d.dr.some(x=>x.id==dp.d.id));
 G.clear();G.send({t:'drop',i:6,n:1});await G.wait(m=>m.t=='notice');ok('a guest cannot drop',!S.worlds.get('alice1').drops.some(x=>x.n==1&&x.i==6));
 await pres(bc,5000,5000);bc.clear();bc.send({t:'pick',id:dp.d.id});await sleep(80);ok('a pickup from far away is refused',!bc.has(m=>m.t=='dr-'));
 await pres(bc,1040,505);bc.clear();ac.clear();bc.send({t:'pick',id:dp.d.id});const pk=await bc.wait(m=>m.t=='bag'&&m.why=='pick');const rmv=await ac.wait(m=>m.t=='dr-');ok('the nearest player picks it up and the others see it go',pk.d[6]==5&&rmv.d.id==dp.d.id);
 bc.clear();ac.clear();await pres(ac,1040,505);ac.send({t:'pick',id:dp.d.id});await sleep(80);ok('the same drop cannot be picked up twice',!ac.has(m=>m.t=='bag'&&m.why=='pick'));
 ac.send({t:'drop',i:6,n:2});const kept=await bc.wait(m=>m.t=='dr+');
 // ---- presence deltas (free hosts meter bandwidth)
 bc.clear();await sleep(5);ac.send({t:'_p',d:{x:1,y:2,f:1,lv:3}});const full=await bc.wait(m=>m.t=='_p'&&m.d.x==1);ok('first presence after a change is complete',full.d.uid==A.r.uid&&full.d.n=='alice');
 ac.send({t:'_p',d:{x:9,y:2,f:1,lv:3}});const dl=await bc.wait(m=>m.t=='_p'&&m.d.x==9);ok('movement after that is a small delta',dl.d.dl==1&&dl.d.uid==undefined&&JSON.stringify(dl).length<110,JSON.stringify(dl));
 bc.clear();for(let i=0;i<5;i++)ac.send({t:'_p',d:{x:9,y:2,f:1,lv:3}});await sleep(120);ok('standing still sends nothing',!bc.has(m=>m.t=='_p'));
 // ---- bans
 const v=await reg('villain');const vc=v.c;const banr=await adm(oc2,'ban',{who:'villain',mins:0,reason:'griefing'});await sleep(250);ok('/ban removes an online player',banr.ok&&vc.closed);ok('a banned account cannot sign in',!(await login('villain')).r.ok);
 ok('/ban works on an offline account too',(await adm(oc2,'ban',{who:'offline1'})).ok&&!(await login('offline1')).r.ok);
 ok('/unban lets them back',(await adm(oc2,'unban',{who:'villain'})).ok&&(await login('villain')).r.ok);
 await reg('tempban1');await adm(oc2,'ban',{who:'tempban1',mins:1});await sleep(200);ok('a timed ban is in force',!(await login('tempban1')).r.ok);
 ok('the owner cannot be banned',!(await adm(oc2,'ban',{who:'Boss'})).ok);
 S.cfg.banIps=true;const gb=await guest('Bad');const gbr=await adm(oc2,'ban',{who:'~Bad'});await sleep(200);const gb2=await auth({t:'guest',name:'Again'});ok('where addresses are real, a guest ban holds by address',gbr.ok&&gb.closed&&gb2.r.ok===0,gbr.m);
 const ow3=await login('Boss',OWN.ownerPass);ok('the owner still gets in from a banned address',ow3.r.ok);S.cfg.banIps=false;
 // ---- restart: drops, bag, ownership persist
 await sleep(1700);await S.close();S=mkS();port=await S.listen();
 const r2=await login('alice');const rh=await enter(r2.c,'alice1');ok('ownership and dropped items survive a restart',rh.d.own.o==A.r.uid&&rh.d.dr.some(d=>d.id==kept.d.id),rh.d.own);
 const bagA=accs().alice.bag;ok('the ledger survives a restart with exact totals',bagA.i[6]==100-10-5-2&&bagA.i[5]==4,bagA.i);r2.c.close();
 // ---- the served page
 const raw=await get(port,'/');ok('the served page knows it is hosted (online mode on)',raw.b.toString().includes('RB_HOSTED=true'));
 const gz=await get(port,'/',{'Accept-Encoding':'gzip'});ok('the page is gzipped to save bandwidth',gz.h['content-encoding']=='gzip'&&gz.b.length<raw.b.length/2&&zlib.gunzipSync(gz.b).length==raw.b.length,gz.b.length);
 const c304=await get(port,'/',{'If-None-Match':raw.h.etag});ok('an unchanged page answers 304',c304.s==304&&c304.b.length==0);
 await S.close();
 // ---- saves survive a wiped disk: a fake Redis REST API + a brand new data folder
 const db={};let cmds=0;const fake=http.createServer((q,r)=>{let b='';q.on('data',d=>b+=d);q.on('end',()=>{cmds++;if(q.headers.authorization!='Bearer tok'){r.writeHead(401);return r.end('{}')}const a=JSON.parse(b);let res=null;const h=db[a[1]]||(db[a[1]]={});if(a[0]=='HGETALL')res=Object.entries(h).flat();else if(a[0]=='HSET'){for(let i=2;i+1<a.length;i+=2)h[a[i]]=a[i+1];res=1}else if(a[0]=='HDEL'){for(let i=2;i<a.length;i++)delete h[a[i]];res=1}r.writeHead(200,{'Content-Type':'application/json'});r.end(JSON.stringify({result:res}))})});
 await new Promise(r=>fake.listen(0,'127.0.0.1',r));const cu='http://127.0.0.1:'+fake.address().port;
 const d1=fs.mkdtempSync(path.join(os.tmpdir(),'rbcl1-'));const cl1=new Cloud(cu,'tok',d1,50);S=createServer({csp:false,port:0,host:'127.0.0.1',dataDir:d1,scryptN:SN,cloud:cl1,maxConnsPerIp:500,...OWN});port=await S.listen();
 const cu1=await reg('cloudy');await enter(cu1.c,'cloudworld',true);cu1.c.send({t:'meta',d:{x:9,y:9,o:cu1.r.uid,on:'cloudy',f:[],pub:0}});cu1.c.send({t:'e',d:{k:4242,a:[3,0,0,0]}});await sleep(1800);await S.close();
 ok('saves reach the database',!!db[KEY]&&!!db[KEY]['accounts.json']&&!!db[KEY]['worlds/cloudworld.json'],Object.keys(db[KEY]||{}));
 const d2=fs.mkdtempSync(path.join(os.tmpdir(),'rbcl2-'));const cl2=new Cloud(cu,'tok',d2,50);const nr=await cl2.restore();S=createServer({csp:false,port:0,host:'127.0.0.1',dataDir:d2,scryptN:SN,cloud:cl2,maxConnsPerIp:500,...OWN});port=await S.listen();
 const cu2=await login('cloudy');const ch=await enter(cu2.c,'cloudworld');ok('after a wiped disk: account, world and ownership are back',nr>=2&&cu2.r.ok&&ch.d.edits[4242]&&ch.d.own.on=='cloudy',nr);
 const oc4=await login('Boss',OWN.ownerPass);ok('the owner keeps the same id after a wiped disk',oc4.r.uid==(JSON.parse(db[KEY]['owner.json']).ownerUid));
 await adm(oc4.c,'world_delete',{world:'cloudworld',confirm:'cloudworld'});await sleep(150);await cl2.flush();ok('a deleted world leaves the database too',!db[KEY]['worlds/cloudworld.json']);await S.close();
 let threw=false;try{await new Cloud('http://127.0.0.1:1','tok',fs.mkdtempSync(path.join(os.tmpdir(),'rbcl3-'))).restore()}catch(_){threw=true}ok('an unreachable database stops the start instead of starting empty',threw);
 const bad=new Cloud(cu,'wrong',fs.mkdtempSync(path.join(os.tmpdir(),'rbcl4-')));threw=false;try{await bad.restore()}catch(_){threw=true}ok('a wrong token stops the start too',threw);
 fake.close();
 console.log(fails?'FAILURES '+fails:'all online server tests passed');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL exception',e&&e.stack||e);process.exit(1)});
