'use strict';
// Rootbound persistent multiplayer server. Zero dependencies (Node 18+). See server/README.md.
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {upgrade}=require('./ws'),R=require('./rules'),{Store}=require('./store'),SHOP=require('./shop'),ECON=require('./economy'),zlib=require('zlib');
const ENV=process.env;
const WORLDS_A_DAY=10;   // new worlds one account may make in a day (claiming them is limited separately, to 5 at a time)
const ACCOUNT_GEN=1;   // raise this by one to reset every account again when the server next starts
const WB_GEMS=[3000,7000,12000,18000,28000],WB_DAY=10;   // what each realm's world boss pays (src/js/late/99-zzzzzzzzz-i-worldboss.js)
function createServer(opts={}){
 const cfg=Object.assign({port:+ENV.PORT||8787,host:ENV.HOST||'0.0.0.0',dataDir:ENV.DATA_DIR||path.join(__dirname,'data'),client:ENV.CLIENT_FILE||path.join(__dirname,'..','index.html'),
  maxPlayers:+ENV.MAX_PLAYERS_PER_WORLD||24,maxWorlds:+ENV.MAX_WORLDS||500,maxWorldsPerAccount:+ENV.MAX_WORLDS_PER_ACCOUNT||5,maxConns:+ENV.MAX_CONNECTIONS||400,maxConnsPerIp:+ENV.MAX_CONNS_PER_IP||12,
  wxCooldownMs:+ENV.WEATHER_COOLDOWN_MS||20000,wbMinMs:ENV.WB_MIN_MS!=null?+ENV.WB_MIN_MS:45000,origins:ENV.ALLOWED_ORIGINS?ENV.ALLOWED_ORIGINS.split(','):null,scryptN:+ENV.SCRYPT_N||16384,trustProxy:ENV.TRUST_PROXY=='1',banIps:ENV.TRUST_PROXY=='1',regPerIp:+ENV.REG_PER_IP||10,authPerIp:+ENV.AUTH_PER_IP||60,profBudget:+ENV.PROFILE_BUDGET||180e6,limitLoopback:false,csp:true,ownerName:ENV.OWNER_NAME||'',ownerPass:ENV.OWNER_PASSWORD||'',ownerEmail:String(ENV.OWNER_EMAIL||'').toLowerCase(),cloud:null},opts);
 const store=new Store(cfg.dataDir);store.cloud=cfg.cloud;const t0=Date.now();const CAT=SHOP.loadCatalog();
 // ---------- accounts / owner / bans
 let accounts=store.readJSON(store.p('accounts.json'),{users:{}}),owner=store.readJSON(store.p('owner.json'),null),bans=store.readJSON(store.p('bans.json'),{bans:{},mutes:{}}),sess=store.readJSON(store.p('sessions.json'),{});if(!bans.ips)bans.ips={};
 const saveAcc=()=>store.later('acc',()=>store.writeJSON(store.p('accounts.json'),accounts)),saveBans=()=>store.later('bans',()=>store.writeJSON(store.p('bans.json'),bans)),saveSess=()=>store.later('sess',()=>store.writeJSON(store.p('sessions.json'),sess));
 const hashTok=t=>crypto.createHash('sha256').update(t).digest('hex');
 // limits that follow an address rather than a connection, so reconnecting does not reset them (this machine itself is exempt unless asked)
 const ipHits=new Map();function ipBucket(ip,k,cap,ms){if(!cfg.limitLoopback&&/^(::ffff:)?127\.|^::1$/.test(ip))return true;const key=k+'|'+ip,now=Date.now(),a=(ipHits.get(key)||[]).filter(x=>now-x<ms);if(a.length>=cap){ipHits.set(key,a);return false}a.push(now);ipHits.set(key,a);return true}
 // passwords anyone would guess first
 const WEAK=new Set(['password','password1','password123','12345678','123456789','1234567890','qwertyui','qwerty123','11111111','00000000','iloveyou','rootbound','rootbound1','minecraft','growtopia','letmein1','abcd1234','admin123']);
 const pwProblem=(pw,name)=>{if(pw.length<8||pw.length>128)return 'Password must be 8-128 characters';const l=pw.toLowerCase();if(WEAK.has(l)||l==String(name).toLowerCase()||/^(.)\1+$/.test(pw))return 'That password is too easy to guess. Pick another one';return ''};
 const nameKey=n=>String(n).toLowerCase();
 function hashPw(pw){const salt=crypto.randomBytes(16);const h=crypto.scryptSync(pw,salt,32,{N:cfg.scryptN,r:8,p:1});return{s:salt.toString('hex'),h:h.toString('hex'),N:cfg.scryptN}}
 function checkPw(pw,rec){try{const h=crypto.scryptSync(pw,Buffer.from(rec.s,'hex'),32,{N:rec.N||16384,r:8,p:1});return crypto.timingSafeEqual(h,Buffer.from(rec.h,'hex'))}catch(_){return false}}
 const RESERVED=['admin','administrator','ceo','owner','system','server','rootbound','moderator','mod','staff','guest'];
 const nameOk=n=>/^[A-Za-z0-9_-]{3,16}$/.test(n);
 function createAccount(name,pw,role){const id='a'+crypto.randomBytes(4).toString('hex');accounts.users[nameKey(name)]={id,name,pw:hashPw(pw),role:role||'player',created:Date.now(),worlds:[]};saveAcc();return accounts.users[nameKey(name)]}
 function newToken(uid,ttl){const t=crypto.randomBytes(32).toString('base64url');sess[hashTok(t)]={uid,exp:Date.now()+ttl};saveSess();return t}
 for(const k of Object.keys(sess))if(sess[k].exp<Date.now())delete sess[k];
 const userById=id=>Object.values(accounts.users).find(u=>u.id==id);
 const isOwnerUid=uid=>!!(owner&&owner.ownerUid&&uid===owner.ownerUid);
 // Free hosts have no shell for cli.js: OWNER_NAME + OWNER_PASSWORD (set in the host's dashboard, never in the repo) create or claim the single owner account at boot. Only a scrypt hash is stored; the id comes from the name, so it survives a lost disk.
 // one-time reset, run once per resetGen: every account and session goes (the owner is recreated just below), worlds stay but belong to nobody.
 (function resetAccounts(){const g=cfg.resetGen|0;if(!g||(accounts.gen|0)>=g)return;accounts.users={};accounts.gen=g;sess={};owner=null;
  for(const f of fs.readdirSync(store.p('worlds')).filter(x=>x.endsWith('.json'))){const p=store.p('worlds',f),j=store.readJSON(p,null);if(j&&(j.ownerUid||j.ownerName||j.meta)){j.ownerUid='';j.ownerName='';j.meta=null;store.writeJSON(p,j)}}
  for(const f of fs.readdirSync(store.p('profiles')).filter(x=>x.endsWith('.json'))){const p=store.p('profiles',f);try{fs.rmSync(p,{force:true});fs.rmSync(p+'.bak',{force:true})}catch(_){}try{if(cfg.cloud)cfg.cloud.forget(p)}catch(_){}}
  store.writeJSON(store.p('accounts.json'),accounts);store.writeJSON(store.p('sessions.json'),sess);store.writeJSON(store.p('owner.json'),null);store.audit({ev:'accounts-reset',gen:g});console.log('All accounts were reset (generation '+g+')')})();
 (function ownerFromEnv(){const n=cfg.ownerName,pw=cfg.ownerPass;if(!n&&!pw)return;if(!nameOk(n)||String(pw).length<12){console.error('OWNER_NAME must be 3-16 letters, numbers, _ or - and OWNER_PASSWORD at least 12 characters: owner not set');return}const k=nameKey(n);let u=accounts.users[k];
  if(!u)u=accounts.users[k]={id:'a'+crypto.createHash('sha256').update('rb-owner:'+k).digest('hex').slice(0,8),name:n,pw:hashPw(pw),role:'owner',created:Date.now(),worlds:[]};else if(!checkPw(pw,u.pw))u.pw=hashPw(pw);u.role='owner';
  owner={ownerUid:u.id,name:u.name,set:new Date().toISOString()};store.writeJSON(store.p('accounts.json'),accounts);store.writeJSON(store.p('owner.json'),owner)})();
 const banned=uid=>{const b=bans.bans[uid];if(!b)return false;if(b.until&&b.until<Date.now()){delete bans.bans[uid];saveBans();return false}return true};
 const ipBanned=ip=>{if(!cfg.banIps)return false;const u=bans.ips[ip];if(!u)return false;if(u<Date.now()){delete bans.ips[ip];saveBans();return false}return true};
 // ---------- worlds
 const worlds=new Map(); // id -> world
 const wname=n=>String(n||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16);
 const wfile=id=>store.p('worlds',id+'.json');
 // worlds saved before the world grew were 100 tiles wide: move each tile key to its new index (x,y unchanged)
 function migrateWorld(j){const ow=j.W||100,re=k=>Math.floor(k/ow)*R.W+(k%ow),mv=o=>{const r={};if(o&&typeof o=='object')for(const k of Object.keys(o)){const n=+k;if(Number.isInteger(n)&&n>=0)r[re(n)]=o[k]}return r};j.edits=mv(j.edits);j.objs=mv(j.objs);j.W=R.W}
 function loadWorld(id,create,ownerUid){let w=worlds.get(id);if(w)return w;const j=store.readJSON(wfile(id),null);
  if(j&&j.id==id){if(j.W!==R.W)migrateWorld(j);w={id,name:j.name||id,lockPaid:j.lockPaid==null?(j.meta?1:0):(j.lockPaid?1:0),created:j.created||Date.now(),ownerUid:j.ownerUid||'',ownerName:j.ownerName||(j.ownerUid&&(userById(j.ownerUid)||{}).name)||'',base:j.base||'',g:j.g===1||j.g===2?j.g:Object.keys(j.edits||{}).length?1:2,drops:ECON.cleanDrops(j.drops),edits:{},meta:R.cleanMeta(j.meta)||null,objs:R.cleanObjMap(j.objs),weather:R.WEATHERS.includes(j.weather)?j.weather:'default',rev:j.rev|0,updated:j.updated||0,lastWx:0};
   for(const k of Object.keys(j.edits||{})){if(R.validEdit({k:+k,a:j.edits[k]}))w.edits[k]=j.edits[k]}}
  else if(create){if(countWorlds()>=cfg.maxWorlds)return null;w={id,name:id,created:Date.now(),ownerUid:ownerUid||'',ownerName:ownerUid?(userById(ownerUid)||{}).name||'':'',base:'',g:2,drops:[],edits:{},meta:null,objs:{},weather:'default',rev:0,updated:Date.now(),lastWx:0};}
  else return null;
  w.members=new Set();w.dirty=false;w.emptySince=Date.now();worlds.set(id,w);if(create&&!j){saveWorld(w,true);store.audit({ev:'world-created',w:id,by:ownerUid})}return w}
 function countWorlds(){try{return fs.readdirSync(store.p('worlds')).filter(f=>f.endsWith('.json')).length}catch(_){return worlds.size}}
 function saveWorld(w,now){w.dirty=true;const doSave=()=>{w.dirty=false;w.rev++;w.updated=Date.now();store.writeJSON(wfile(w.id),{v:1,W:R.W,id:w.id,lockPaid:w.lockPaid?1:0,name:w.name,created:w.created,ownerUid:w.ownerUid,ownerName:w.ownerName,base:w.base,g:w.g,drops:w.drops,weather:w.weather,rev:w.rev,updated:w.updated,meta:w.meta,objs:w.objs,edits:w.edits})};if(now)doSave();else store.later('w:'+w.id,doSave)}
 const worldExists=id=>worlds.has(id)||fs.existsSync(wfile(id));
 function listWorlds(){const out=[];let files=[];try{files=fs.readdirSync(store.p('worlds')).filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5))}catch(_){}
  for(const id of files){if(R.realmStage(id))continue;const w=worlds.get(id);let info;if(w)info={id,pop:w.members.size,owner:w.ownerName||(w.meta?w.meta.on:''),weather:w.weather,rev:w.rev,updated:w.updated,priv:!!(w.meta&&w.meta.pr)};else{try{const st=fs.statSync(wfile(id));info={id,pop:0,owner:'',weather:'default',rev:0,updated:st.mtimeMs,priv:false,cold:1}}catch(_){continue}}out.push(info)}
  if(!out.find(x=>x.id=='plaza'))out.push({id:'plaza',pop:plaza.size,owner:'',weather:'default',rev:0,updated:0,priv:false,hub:1});return out}
 // ---------- sessions
 const sessions=new Map(),plaza=new Set(),plazaDrops=[],ipCount=new Map();let sidN=0;
 const send=(s,m)=>{if(s.conn&&!s.conn.closed&&s.conn.backlog<2e6)s.conn.send(JSON.stringify(m))};
 const members=id=>id=='plaza'?plaza:(worlds.get(id)?worlds.get(id).members:new Set());
 const relay=(wid,m,exceptSid)=>{const raw=JSON.stringify(m);for(const sid of members(wid)){if(sid===exceptSid)continue;const s=sessions.get(sid);if(s&&s.conn&&!s.conn.closed&&s.conn.backlog<2e6)s.conn.send(raw)}};
 function bucket(s,k,cap,ms){const now=Date.now(),a=(s.rate[k]=(s.rate[k]||[]).filter(x=>now-x<ms));if(a.length>=cap)return false;a.push(now);return true}
 const isMuted=uid=>{const u=bans.mutes[uid];if(!u)return false;if(u<Date.now()){delete bans.mutes[uid];return false}return true};
 function leaveWorld(s){if(!s.world)return;eco.leaving(s);const id=s.world;const set=members(id);set.delete(s.sid);relay(id,{t:'_x',f:s.sid});s.mbAway=false;s.world=null;const w=worlds.get(id);if(w){if(!w.members.size){w.emptySince=Date.now();if(w.dirty)saveWorld(w,true)}}mbElect(id)}
 // who runs this world's monsters: the current host if still here, else the first player who is not in a private fight
 function mbElect(id){const w=id=='plaza'?null:worlds.get(id);if(!w)return;const c=w.mobHost&&sessions.get(w.mobHost);if(c&&c.world===id&&!c.mbAway)return;let pick='';for(const sid of w.members){const o=sessions.get(sid);if(o&&o.world===id&&!o.mbAway){pick=sid;break}}if(pick!==(w.mobHost||'')){w.mobHost=pick;relay(id,{t:'mhost',d:{sid:pick}})}}
 function helloFor(s,id){const pl={};for(const sid of members(id)){if(sid==s.sid)continue;const o=sessions.get(sid);if(o)pl[sid]=o.pres}pl[s.sid]=s.pres;
  if(id=='plaza')return{w:'plaza',edits:{},pl,wx:'default',dr:plazaDrops};const w=worlds.get(id);const e=Object.assign({},w.edits);if(w.meta)e.m=w.meta;if(Object.keys(w.objs).length)e.o=w.objs;return{w:id,edits:e,pl,wx:w.weather,rev:w.rev,g:w.g,own:w.ownerUid?{o:w.ownerUid,on:w.ownerName}:null,dr:w.drops}}
 function enter(s,idRaw,create,baseRaw){const id=wname(idRaw);if(!id)return send(s,{t:'enter_err',m:'Invalid world name'});
  if(s.world==id)return;
  if(banned(s.uid))return send(s,{t:'enter_err',m:'You are banned from this server'});const pass=s.owner||s.summon===id;
  let w=null;if(id!='plaza'){const sg=R.realmStage(id);if(sg&&!worldExists(id)){const b=wname(baseRaw),bw=b&&R.stName(b,sg)==id&&!R.realmStage(b)&&worldExists(b)?loadWorld(b,false):null;if(!bw)return send(s,{t:'enter_err',m:'Enter the base world of this realm first'});if(!bucket(s,'realm',8,60000))return send(s,{t:'enter_err',m:'Slow down'});w=loadWorld(id,true,bw.ownerUid);if(!w)return send(s,{t:'enter_err',m:'The server has reached its world limit'});w.ownerName=bw.ownerName;w.base=b;saveWorld(w,true)}else if(!worldExists(id)){if(!create)return send(s,{t:'enter_err',m:'That world does not exist yet. Use Create to make it.'});if(s.kind!='user'&&s.kind!='owner')return send(s,{t:'enter_err',m:'Create an account to make new worlds (guests can join existing ones).'});if(sg)return send(s,{t:'enter_err',m:'World names cannot end in a realm suffix'});
    const u=userById(s.uid);
    if(!bucket(s,'create',3,60000))return send(s,{t:'enter_err',m:'Slow down: too many worlds created'});
    if(u&&!isOwnerUid(u.id)){const day=Math.floor(Date.now()/864e5),d=u.mkDay&&u.mkDay.d==day?u.mkDay:(u.mkDay={d:day,n:0});if(d.n>=WORLDS_A_DAY)return send(s,{t:'enter_err',m:'You have made '+WORLDS_A_DAY+' new worlds today. Try again tomorrow.'});d.n++;saveAcc()}
    w=loadWorld(id,true);if(!w)return send(s,{t:'enter_err',m:'The server has reached its world limit'})}   // a new world belongs to nobody: a World Lock is what claims it
   else{w=loadWorld(id,false);if(!w)return send(s,{t:'enter_err',m:'World data could not be loaded'})}
   const gate=w.base&&loadWorld(w.base,false)||w;if(gate.meta&&gate.meta.b&&gate.meta.b.includes(s.uid)&&!pass)return send(s,{t:'enter_err',m:'You are banned from this world'});
   if(gate.meta&&gate.meta.pr&&!(gate.meta.o==s.uid||(gate.meta.f||[]).includes(s.uid)||(gate.meta.t||[]).includes(s.uid))&&!pass)return send(s,{t:'enter_err',m:'This world is private'})}
  if(members(id).size>=cfg.maxPlayers&&!pass)return send(s,{t:'enter_err',m:'World is full ('+cfg.maxPlayers+' players)'});
  leaveWorld(s);s.summon='';s.world=id;members(id).add(s.sid);s.pres={n:s.name,uid:s.uid,x:0,y:0,f:1};s.presLook=s.presKey='';
  send(s,{t:'joined',sid:s.sid,w:id,uid:s.uid,name:s.name,owner:!!s.owner,kind:s.kind});send(s,{t:'_hello',d:helloFor(s,id)});relay(id,{t:'_p',d:s.pres,f:s.sid},s.sid);if(id!='plaza'){mbElect(id);const wm=worlds.get(id);if(wm)send(s,{t:'mhost',d:{sid:wm.mobHost||''}})}}
 // ---------- world ownership: up to cfg.maxWorldsPerAccount per person (the server owner has no cap); a world's realms belong to its owner and do not count
 const canOwn=u=>isOwnerUid(u.id)||(u.worlds||[]).length<cfg.maxWorldsPerAccount;
 function setOwner(id,uid,name){const ids=[id];for(let i=1;i<R.REALM.length;i++)if(worldExists(R.stName(id,i)))ids.push(R.stName(id,i));for(const x of ids){const w=loadWorld(x,false);if(!w)continue;w.ownerUid=uid;w.ownerName=name;if(!uid&&w.meta){const k=w.meta.y*R.W+w.meta.x;if(w.edits[k]&&w.edits[k][0]==17){R.applyEdit(w,k,[0,0,0,0]);relay(x,{t:'e',d:{k,a:[0,0,0,0]}})}w.meta=null}saveWorld(w);relay(x,{t:'own',d:{o:uid,on:name,clearLock:uid?0:1}})}}
 function sendMine(s){const u=userById(s.uid);if(!u)return;send(s,{t:'myworlds',list:(u.worlds||[]).map(id=>({id,pop:members(id).size})),max:isOwnerUid(u.id)?0:cfg.maxWorldsPerAccount})}
 const notify=(s,text)=>send(s,{t:'notice',d:{text,by:'Server'}});
 function setGod(s,u,on){const sh=SHOP.ensure(u);if(on&&!u.god){sh.realG=sh.g;sh.g=Math.max(sh.g,999999)}else if(!on&&u.god){sh.g=Number.isFinite(sh.realG)?sh.realG:sh.g;delete sh.realG}u.god=on?1:0;s.god=!!on;saveAcc();send(s,{t:'god',on:on?1:0});sendWallet(s,u)}
 const eco=ECON.createEconomy({send,sessions,userById,saveAcc:()=>saveAcc(),relay:(w,m)=>relay(w,m),dropsOf:id=>id=='plaza'?plazaDrops:(worlds.get(id)||{drops:[]}).drops,touchWorld:id=>{const w=worlds.get(id);if(w)saveWorld(w)},bucket:(s,k,c,ms)=>bucket(s,k,c,ms),audit:o=>store.audit(o),rid:()=>crypto.randomBytes(2).toString('hex')});
 // ---------- admin (OWNER ONLY, verified server-side on every call)
 function adminOp(s,m){const rid=m.rid,ok=(msg,data)=>send(s,{t:'admin_res',rid,ok:1,m:msg,data}),no=msg=>send(s,{t:'admin_res',rid,ok:0,m:msg});
  if(!s.owner||!isOwnerUid(s.uid)||s.kind!='owner'){store.audit({ev:'admin-denied',uid:s.uid,op:String(m.op).slice(0,24),ip:s.ip});return no('Not authorized')}
  const op=String(m.op||'');const find=q=>{q=String(q||'').toLowerCase();for(const o of sessions.values())if(o.sid==q||o.uid==q||o.name.toLowerCase()==q)return o;return null};const A=(o)=>store.audit(Object.assign({ev:'admin',op,by:s.name},o||{}));const acc=q=>accounts.users[nameKey(String(q||''))];
  switch(op){
  case 'players':return ok('ok',[...sessions.values()].map(o=>({sid:o.sid,uid:o.uid,name:o.name,kind:o.kind,world:o.world})));
  case 'stats':return ok('ok',{players:sessions.size,worlds:listWorlds().length,loaded:worlds.size,uptime:Math.round((Date.now()-t0)/1000),mem:Math.round(process.memoryUsage().rss/1e6)});
  case 'kick':{const o=find(m.who);if(!o||isOwnerUid(o.uid))return no('Player not found');send(o,{t:'_kick',m:String(m.reason||'Removed by the server owner').slice(0,80)});A({who:o.name});setTimeout(()=>o.conn.close(1000),150);return ok('Kicked '+o.name)}
  case 'mute':{const o=find(m.who);const mins=Math.max(1,Math.min(1440,m.mins|0||5));if(!o||isOwnerUid(o.uid))return no('Player not found');bans.mutes[o.uid]=Date.now()+mins*60000;saveBans();A({who:o.name,mins});return ok('Muted '+o.name+' for '+mins+' min')}
  case 'unmute':{const o=find(m.who);const u=o?o.uid:String(m.who);delete bans.mutes[u];saveBans();A({who:u});return ok('Unmuted')}
  case 'ban':{const o=find(m.who),a=o?(o.kind=='guest'?null:userById(o.uid)):acc(m.who);if((!o&&!a)||isOwnerUid((o||a).uid||(a&&a.id)))return no('Player not found');const mins=Math.max(0,Math.min(525600,m.mins|0)),until=mins?Date.now()+mins*60000:0,name=o?o.name:a.name;
   // a guest id dies with the connection, so guests are held by address (only where the host reports real addresses); so is an account, for a week, to slow a new sign-up
   const ip=o&&o.ip;if(ip&&cfg.banIps){bans.ips[ip]=until||Date.now()+(o.kind=='guest'?86400e3:7*86400e3)}if(a)bans.bans[a.id]=Object.assign({name,ts:Date.now(),reason:String(m.reason||'').slice(0,80)},until?{until}:{},ip?{ip}:{});else if(!cfg.banIps)return no('Guests have temporary ids here; kick them or ban their account');saveBans();if(o){send(o,{t:'_ban',m:until?'You are banned for '+mins+' minutes':''});setTimeout(()=>o.conn.close(1000),150)}A({who:name,uid:a&&a.id,mins});return ok('Banned '+name+(mins?' for '+mins+' minutes':''))}
  case 'unban':{const q=String(m.who||'').toLowerCase();const k=Object.keys(bans.bans).find(u=>u==q||String(bans.bans[u].name).toLowerCase()==q);if(!k)return no('Not banned');if(bans.bans[k].ip)delete bans.ips[bans.bans[k].ip];delete bans.bans[k];saveBans();A({who:k});return ok('Unbanned')}
  case 'bans':return ok('ok',Object.keys(bans.bans).map(u=>Object.assign({uid:u},bans.bans[u])));
  case 'announce':{const text=String(m.text||'').slice(0,160).replace(/[<>]/g,'');if(!text)return no('Empty message');const scope=m.scope=='world'?'world':'all';if(scope=='all'){for(const o of sessions.values())send(o,{t:'notice',d:{text,by:'Server'}})}else relay(wname(m.world),{t:'notice',d:{text,by:'Server'}});A({scope,text:text.slice(0,60)});return ok('Sent')}
  case 'weather':{const id=wname(m.world);const wx=String(m.weather||'');if(!R.WEATHERS.includes(wx))return no('Unknown weather');const w=id=='plaza'?null:loadWorld(id,false);if(!w)return no('World not found');setWeather(w,wx,'Server owner');A({w:id,wx});return ok('Weather set to '+wx)}
  case 'worlds':return ok('ok',listWorlds());
  case 'world_delete':{const id=wname(m.world);if(id=='plaza'||m.confirm!==id)return no('Type the world name to confirm');const w=loadWorld(id,false);if(w){for(const sid of [...w.members]){const o=sessions.get(sid);if(o){send(o,{t:'_kick',m:'This world was deleted'});leaveWorld(o)}}const ou=userById(w.ownerUid);if(ou&&ou.worlds){ou.worlds=ou.worlds.filter(x=>x!=id);saveAcc()}worlds.delete(id)}try{fs.renameSync(wfile(id),wfile(id)+'.deleted-'+Date.now());if(store.cloud)store.cloud.forget(wfile(id))}catch(_){return no('World not found')}A({w:id});return ok('Deleted '+id+' (file kept as .deleted for recovery)')}
  case 'world_reset':{const id=wname(m.world);if(id=='plaza'||m.confirm!==id)return no('Type the world name to confirm');const w=loadWorld(id,false);if(!w)return no('World not found');try{fs.copyFileSync(wfile(id),wfile(id)+'.pre-reset-'+Date.now())}catch(_){}w.edits={};w.meta=null;w.objs={};saveWorld(w,true);for(const sid of w.members){const o=sessions.get(sid);if(o)send(o,{t:'_hello',d:helloFor(o,id)})}A({w:id});return ok('World reset (backup kept)')}
  case 'world_restore':{const id=wname(m.world);if(!fs.existsSync(wfile(id)+'.bak'))return no('No backup for that world');const w=worlds.get(id);if(w&&w.members.size)return no('Empty the world first');worlds.delete(id);fs.copyFileSync(wfile(id)+'.bak',wfile(id));A({w:id});return ok('Restored last backup')}
  case 'config_get':return ok('ok',{maxPlayers:cfg.maxPlayers,maxWorlds:cfg.maxWorlds,maxWorldsPerAccount:cfg.maxWorldsPerAccount,wxCooldownMs:cfg.wxCooldownMs});
  case 'config_set':{const lim={maxPlayers:[1,100],maxWorlds:[1,5000],maxWorldsPerAccount:[1,100],wxCooldownMs:[0,600000]};const k=String(m.key);if(!lim[k])return no('Unknown setting');const v=+m.value;if(!Number.isFinite(v)||v<lim[k][0]||v>lim[k][1])return no('Out of range');cfg[k]=v|0;A({k,v});return ok(k+' = '+cfg[k]+' (until restart)')}
  case 'audit':return ok('ok',store.readAudit(Math.max(1,Math.min(200,m.n|0||50))));
  case 'tp':{const o=find(m.who);if(!o)return no('Player not found');send(o,{t:'sys',d:{op:'tp',x:+m.x||0,y:+m.y||0}});A({who:o.name});return ok('Teleported '+o.name)}
  case 'goto_world':{const o=find(m.who);const id=wname(m.world);if(!o)return no('Player not found');send(o,{t:'sys',d:{op:'world',w:id}});A({who:o.name,w:id});return ok('Sent '+o.name+' to '+id)}
  case 'god':{const u=userById(s.uid);if(!u)return no('No account');const on=m.on==null?!u.god:!!m.on;setGod(s,u,on);A({on});return ok(on?'God mode on':'God mode off',{on:on?1:0})}
  case 'pull':{const o=find(m.who);if(!o)return no('Player not found');if(o===s)return no('That is you');if(!s.world||o.world!==s.world)return no(o.name+' is in another world. Use /summon');send(o,{t:'sys',d:{op:'tp',x:+s.pres.x||0,y:+s.pres.y||0,by:s.name}});A({who:o.name});return ok('Pulled '+o.name)}
  case 'summon':{const o=find(m.who);if(!o)return no('Player not found');if(o===s)return no('That is you');if(!s.world)return no('Enter a world first');const x=+s.pres.x||0,y=+s.pres.y||0;if(o.world===s.world)send(o,{t:'sys',d:{op:'tp',x,y,by:s.name}});else{o.summon=s.world;const cw=worlds.get(s.world);send(o,{t:'sys',d:{op:'world',w:s.world,x,y,base:cw&&cw.base||'',by:s.name}})}A({who:o.name,w:s.world});return ok('Summoned '+o.name)}
  case 'give':{const i=m.item,n=m.n;if(!ECON.okItem(i)||!ECON.okN(n))return no('Usage: /give name item amount');const o=find(m.who),u=o?(o.kind=='guest'?null:userById(o.uid)):acc(m.who);if(!o&&!u)return no('Player not found');eco.give(o,u,i,n);A({who:o?o.name:u.name,i,n});return ok('Gave '+n+' to '+(o?o.name:u.name))}
  default:return no('Unknown operation')}}
 function setWeather(w,wx,by){w.weather=wx;w.lastWx=Date.now();saveWorld(w);relay(w.id,{t:'wx',d:{w:wx,by:String(by||'').slice(0,14),rev:w.rev}})}
 // ---------- message handling
 const NAMECHK=/^[A-Za-z0-9_-]{3,16}$/;
 const authFail={};
 function loginThrottle(key,lim){const a=authFail[key];if(a&&a.until&&Date.now()>a.until){delete authFail[key];return false}return !!a&&a.n>=lim}
 function failed(key,lim){const a=authFail[key]||(authFail[key]={n:0,until:0,first:Date.now()});a.n++;if(a.n>=lim)a.until=Date.now()+60000}
 function setAuth(s,u,tokenTtl){s.uid=u.id;s.name=u.name;s.kind=isOwnerUid(u.id)?'owner':'user';s.owner=s.kind=='owner';const token=newToken(u.id,s.owner?12*3600e3:tokenTtl||30*86400e3);send(s,{t:'auth',ok:1,uid:s.uid,name:s.name,kind:s.kind,owner:s.owner,token,gen:accounts.gen|0,prev:(u.prof&&u.prof.rev)|0});signedIn(s,u);store.audit({ev:s.owner?'owner-login':'login',uid:s.uid,ip:s.ip})}
 // what every sign-in gets: wallet, bag, the owner's god mode if it was left on, the owned-world list
 function signedIn(s,u){sendWallet(s,u);eco.signedIn(s,u);s.god=!!(s.owner&&u.god);if(s.god)send(s,{t:'god',on:1});sendMine(s)}
 function sendWallet(s,u){if(!u)return;send(s,Object.assign({t:'wallet'},SHOP.view(u)))}
 const watched=new Map();function watch(s,u,what,over){if(!(over>300))return;const k=u.id+what,now=Date.now();if(now-(watched.get(k)||0)<300000)return;watched.set(k,now);if(watched.size>5000)watched.clear();store.audit({ev:'cheat-watch',what,over,uid:u.id,name:u.name,ip:s.ip})}
 function onMsg(s,raw){let m;if(raw.length>20000&&!/^\{"t":"(e|o|meta|_p)"/.test(raw.slice(0,12)))return;try{m=JSON.parse(raw)}catch(_){if(++s.strikes>8)s.conn.close(1008);return}
  if(!m||typeof m.t!='string')return;
  if(!bucket(s,'all',300,5000)){if(++s.strikes>20)s.conn.close(1008);return}
  const t=m.t;
  switch(t){
  case 'guest':{if(s.uid)return;if(!bucket(s,'auth',10,60000))return;if(ipBanned(s.ip))return send(s,{t:'auth',ok:0,m:'You are banned from this server'});const base=String(m.name||'Player').replace(/[^A-Za-z0-9_-]/g,'').slice(0,8)||'Player';s.uid='g'+crypto.randomBytes(4).toString('hex');s.name='~'+base;s.kind='guest';s.owner=false;send(s,{t:'auth',ok:1,uid:s.uid,name:s.name,kind:'guest',owner:false});return}
  case 'register':{if(s.uid&&s.kind!='guest')return;if(!bucket(s,'auth',10,60000))return send(s,{t:'auth',ok:0,m:'Too many attempts. Wait a minute.'});const name=String(m.name||''),pw=String(m.pass||'');
   if(ipBanned(s.ip))return send(s,{t:'auth',ok:0,m:'You are banned from this server'});if(!nameOk(name))return send(s,{t:'auth',ok:0,m:'Name: 3-16 letters, numbers, _ or -'});{const bad=pwProblem(pw,name);if(bad)return send(s,{t:'auth',ok:0,m:bad})}
   if(RESERVED.includes(nameKey(name))||(owner&&nameKey(owner.name)==nameKey(name))||accounts.users[nameKey(name)])return send(s,{t:'auth',ok:0,m:'That name is not available'});
   if(Object.keys(accounts.users).length>=20000)return send(s,{t:'auth',ok:0,m:'Registration closed'});
   if(!ipBucket(s.ip,'reg',cfg.regPerIp,3600e3)){store.audit({ev:'reg-limited',ip:s.ip});return send(s,{t:'auth',ok:0,m:'Too many new accounts from this connection. Try again later.'})}
   const u=createAccount(name,pw,'player');setAuth(s,u);return}
  case 'login':{if(!bucket(s,'auth',10,60000))return send(s,{t:'auth',ok:0,m:'Too many attempts. Wait a minute.'});const name=String(m.name||'').slice(0,80),pw=String(m.pass||'').slice(0,256);const key=nameKey(name)+'|'+s.ip,ik='ip:'+s.ip,uk=nameKey(name),ak='acct:'+uk;if(!ipBucket(s.ip,'auth',cfg.authPerIp,60000))return send(s,{t:'auth',ok:0,m:'Too many attempts. Wait a minute.'});
   if(loginThrottle(key,5)||loginThrottle(ik,40)||loginThrottle(ak,30))return send(s,{t:'auth',ok:0,m:'Too many failed attempts. Try again in a minute.'});
   // the owner may sign in with OWNER_EMAIL instead of the account name
   const u=accounts.users[cfg.ownerEmail&&uk==cfg.ownerEmail&&owner?nameKey(owner.name):uk];if(!u||!checkPw(pw,u.pw)){failed(key,5);failed(ik,40);failed(ak,30);store.audit({ev:'login-failed',name:name.slice(0,16),ip:s.ip});return send(s,{t:'auth',ok:0,m:'Wrong name or password'})}
   if(banned(u.id)||(ipBanned(s.ip)&&!isOwnerUid(u.id)))return send(s,{t:'auth',ok:0,m:'This account is banned'});
   for(const o of sessions.values())if(o.uid==u.id&&o!==s){send(o,{t:'_kick',m:'Signed in from another place'});o.conn.close(1000)}
   setAuth(s,u);return}
  case 'resume':{if(!bucket(s,'auth',10,60000))return;const rec=sess[hashTok(String(m.token||''))];if(!rec||rec.exp<Date.now())return send(s,{t:'auth',ok:0,m:'Session expired',expired:1});const u=userById(rec.uid);if(!u||banned(u.id)||(ipBanned(s.ip)&&!isOwnerUid(u.id)))return send(s,{t:'auth',ok:0,m:'Account unavailable'});
   for(const o of sessions.values())if(o.uid==u.id&&o!==s){send(o,{t:'_kick',m:'Signed in from another place'});o.conn.close(1000)}
   s.uid=u.id;s.name=u.name;s.kind=isOwnerUid(u.id)?'owner':'user';s.owner=s.kind=='owner';send(s,{t:'auth',ok:1,uid:s.uid,name:s.name,kind:s.kind,owner:s.owner,token:m.token,resumed:1,gen:accounts.gen|0,prev:(u.prof&&u.prof.rev)|0});signedIn(s,u);return}
  case 'logout':{const h=hashTok(String(m.token||''));if(sess[h]){delete sess[h];saveSess()}return}
  case 'chpass':{const no=x=>send(s,{t:'chpass',ok:0,m:x});if(s.kind!='user'&&s.kind!='owner')return no('Sign in first');if(!bucket(s,'auth',10,60000)||!ipBucket(s.ip,'auth',cfg.authPerIp,60000))return no('Too many attempts. Wait a minute.');if(s.owner)return no('The owner password is set on the host (OWNER_PASSWORD)');const u=userById(s.uid);if(!u)return;const ak='pw:'+s.uid;if(loginThrottle(ak,5))return no('Too many failed attempts. Try again in a minute.');if(!checkPw(String(m.old||'').slice(0,256),u.pw)){failed(ak,5);store.audit({ev:'chpass-failed',uid:s.uid,ip:s.ip});return no('Your current password is not right')}const np=String(m.pass||''),bad=pwProblem(np,u.name);if(bad)return no(bad);u.pw=hashPw(np);for(const k of Object.keys(sess))if(sess[k].uid===u.id)delete sess[k];for(const o of sessions.values())if(o.uid===u.id&&o!==s){send(o,{t:'_kick',m:'Your password was changed'});o.conn.close(1000)}saveAcc();saveSess();store.audit({ev:'chpass',uid:s.uid,ip:s.ip});return send(s,{t:'chpass',ok:1,token:newToken(u.id,30*86400e3)})}
  }
  if(!s.uid)return;// everything below requires an identity (account or guest)
  switch(t){
  case 'ping':return send(s,{t:'pong',n:m.n});
  case 'worlds':{if(!bucket(s,'wl',10,10000))return;return send(s,{t:'worlds',list:listWorlds().filter(x=>!x.priv).sort((a,b)=>b.pop-a.pop||(b.updated||0)-(a.updated||0)).slice(0,200),max:cfg.maxPlayers})}
  case 'enter':if(!bucket(s,'enter',12,30000))return send(s,{t:'enter_err',m:'Slow down'});return enter(s,m.w,!!m.create,m.base);
  case 'leave':return leaveWorld(s);
  case 'sync':{if(s.kind=='guest'||!bucket(s,'sync',12,60000))return;const u=userById(s.uid);if(!u)return;SHOP.sync(u,m.gems);watch(s,u,'gems',Math.floor(+m.gems)-SHOP.view(u).gems);sendWallet(s,u);saveAcc();return}
  case 'wallet':{if(s.kind=='guest')return send(s,{t:'wallet',gems:0,owned:{},guest:1});const u=userById(s.uid);return sendWallet(s,u)}
  case 'buy':{if(!bucket(s,'buy',10,10000))return send(s,{t:'buy_res',ok:0,m:'Slow down',rid:String(m.rid||'')});
   if(s.kind=='guest')return send(s,{t:'buy_res',ok:0,m:'Sign in to buy items in shared worlds',rid:String(m.rid||'')});
   const u=userById(s.uid);if(!u)return;const r=SHOP.buy(u,CAT,m);if(r.ok&&!r.dup){saveAcc();store.audit({ev:'buy',uid:s.uid,id:r.id,qty:r.qty,spent:r.spent})}send(s,Object.assign({t:'buy_res'},r));return}
  case 'admin':{if(!bucket(s,'admin',30,10000))return;return adminOp(s,m)}
  // each account's save: the game's own keys, sent in pieces when they change. A copy based on an older version than the server's is refused (another computer saved since).
  case 'prof_put':{if(s.kind=='guest'||!bucket(s,'prof',120,60000))return;const u=userById(s.uid),i=m.i|0,n=m.n|0;if(!u||n<1||n>80||i<0||i>=n||typeof m.d!='string')return;let q=s.pput;if(!q||q.id!==m.id||q.n!==n)q=s.pput={id:m.id,n,parts:[],got:0};if(q.parts[i]==null){q.parts[i]=m.d;q.got++;q.size=(q.size||0)+m.d.length;if(q.size>1.5e6){s.pput=null;return}}if(q.got<n)return;s.pput=null;
   const txt=q.parts.join('');if(txt.length>1.5e6)return;let keys;try{keys=JSON.parse(txt)}catch(_){return}if(!keys||typeof keys!='object'||Array.isArray(keys))return;for(const k in keys)if(!/^[A-Za-z0-9_.:-]{1,64}$/.test(k)||typeof keys[k]!='string')return;
   const rev=(u.prof&&u.prof.rev)|0;if((m.base|0)!==rev)return send(s,{t:'prof_stale',rev});const pf=store.p('profiles',u.id+'.json');let was=0;try{was=fs.statSync(pf).size}catch(_){}if(profBytes()-was+txt.length>cfg.profBudget){store.audit({ev:'profile-budget-full',uid:s.uid});return send(s,{t:'notice',d:{text:'The server is out of room for saves right now. Your progress is safe on this computer.',by:'Server'}})}u.prof={rev:rev+1};store.writeJSON(pf,{rev:rev+1,keys,t:Date.now()});profTotal+=txt.length-was;saveAcc();return send(s,{t:'prof_ok',rev:rev+1})}
  case 'prof_get':{if(s.kind=='guest'||!bucket(s,'profg',12,60000))return;const u=userById(s.uid);if(!u)return;const j=store.readJSON(store.p('profiles',u.id+'.json'),null);if(j&&j.keys)send(s,{t:'prof',rev:j.rev|0,gen:accounts.gen|0,keys:j.keys});return}
  // world boss wins: the fight runs on the player's computer, so the server can only limit what a win is worth: once per world, at most WB_DAY a day, not
  // sooner than wbMinMs after the fight began. Too fast or over the limit just means the gems arrive at the normal rate instead.
  case 'wb':{if(s.kind=='guest'||!bucket(s,'wb',10,60000))return;const u=userById(s.uid),id=s.world;if(!u||!id||id=='plaza')return;if(m.op=='start'){s.wbT={w:id,t:Date.now()};return}if(m.op!='win')return;const st=s.wbT;s.wbT=null;if(!st||st.w!==id||Date.now()-st.t<cfg.wbMinMs)return;
   const wins=u.wbWins||(u.wbWins={});if(wins[id])return;const day=Math.floor(Date.now()/864e5),d=u.wbDay&&u.wbDay.d==day?u.wbDay:(u.wbDay={d:day,n:0});if(d.n>=WB_DAY)return;d.n++;wins[id]=1;SHOP.bonus(u,WB_GEMS[R.realmStage(id)]||0);saveAcc();return}
  case 'bag_sync':{if(s.kind=='guest'||!bucket(s,'bag',12,30000))return;const u=userById(s.uid);if(u&&eco.sync(u,m)){watch(s,u,'items',u.bag.over|0);saveAcc()}return}
  case 'trade':return eco.tradeMsg(s,m);
  case 'drop':return eco.dropMsg(s,m);
  case 'pick':return eco.pickMsg(s,m);
  case 'myworlds':return sendMine(s);
  case 'world_release':{const u=userById(s.uid),id=wname(m.w);if(!u||!(u.worlds||[]).includes(id))return notify(s,'You do not own that world');const rw=loadWorld(id,false),hadLock=!!(rw&&rw.meta&&rw.lockPaid);u.worlds=u.worlds.filter(x=>x!=id);saveAcc();setOwner(id,'','');if(hadLock)eco.give(s,u,17,1);store.audit({ev:'world-released',w:id,by:s.uid});notify(s,'Released '+id+': it no longer counts as yours');return sendMine(s)}
  }
  const wid=s.world;if(!wid)return;const w=wid=='plaza'?null:worlds.get(wid);
  if(t=='_p'){if(!bucket(s,'p',40,1000))return;const pr=R.cleanPres(m.d);pr.uid=s.uid;pr.n=s.name.slice(0,14);s.pres=pr;
   // free hosts meter outbound traffic: the full look goes out when it changes (and every 5s for late joiners), movement goes out as a small delta and not at all while standing still
   const now=Date.now(),look=JSON.stringify([pr.hat,pr.body,pr.wing,pr.boot,pr.glove,pr.lk,pr.cx,pr.lv]);if(look!==s.presLook||now-(s.presFull||0)>5000){s.presLook=look;s.presFull=now;relay(wid,{t:'_p',d:pr,f:s.sid},s.sid);return}
   const d={dl:1,x:pr.x,y:pr.y,f:pr.f,h:pr.h,vx:pr.vx,wp:pr.wp,sw:pr.sw,fm:pr.fm,wo:pr.wo},key=JSON.stringify(d);if(key===s.presKey&&now-(s.presAt||0)<2000)return;s.presKey=key;s.presAt=now;relay(wid,{t:'_p',d,f:s.sid},s.sid);return}
  if(t=='chat'){if(!bucket(s,'chat',6,8000))return;if(isMuted(s.uid))return send(s,{t:'notice',d:{text:'You are muted',by:'Server'}});const d=m.d;if(!d||typeof d.t!='string')return;const out={n:s.name.slice(0,14),t:d.t.slice(0,80).replace(/[<>]/g,'')};if(!out.t.trim())return;if(Number.isInteger(d.e)&&d.e>=0&&d.e<64)out.e=d.e;relay(wid,{t:'chat',d:out,f:s.sid},s.sid);return}
  if(t=='x'){if(!bucket(s,'x',10,8000))return;if(isMuted(s.uid))return;const v=R.checkX(m.d,s.sid,sid=>members(wid).has(sid));if(!v)return;v.n=s.name.slice(0,14);const o=sessions.get(v.to);if(o)send(o,{t:'x',d:v,f:s.sid});return}
  if(!w)return;// plaza: no persistent edits
  if(w.meta&&w.meta.b&&w.meta.b.includes(s.uid))return;
  // shared monsters: one player's computer runs them (see MOB14). Only that player may send positions; hits from the others go to it alone.
  if(w&&t=='mb'){if(w.mobHost!==s.sid||!bucket(s,'mb',80,10000)||!Array.isArray(m.d)||m.d.length>80)return;relay(wid,{t:'mb',d:m.d,f:s.sid},s.sid);return}
  if(w&&t=='mh'){if(!bucket(s,'mh',150,10000))return;const h=w.mobHost&&sessions.get(w.mobHost),d=m.d;if(h&&h!==s&&d&&Number.isFinite(+d.id)&&Number.isFinite(+d.n))send(h,{t:'mh',d:{id:+d.id,n:Math.max(0,Math.min(1e7,+d.n)),k:d.k?1:0},f:s.sid});return}
  if(w&&t=='mb_away'){s.mbAway=!!m.d;mbElect(wid);return}
  if(t=='e'){if(!bucket(s,'e',70,8000))return;if(!R.checkEdit(w,m.d,s.uid,s.god)){if(bucket(s,'rej',3,5000))send(s,{t:'_rej',op:'e',k:m.d&&m.d.k});return}R.applyEdit(w,m.d.k,m.d.a);saveWorld(w);relay(wid,{t:'e',d:{k:m.d.k,a:m.d.a},f:s.sid},s.sid);return}
  if(t=='meta'){if(!bucket(s,'meta',6,8000))return;if(s.kind=='guest')return;const r=R.checkMeta(w,m.d,s.uid);if(!r){send(s,{t:'_rej',op:'meta'});return}if(r.v)r.v.on=s.name;
   // placing a World Lock in an unowned world claims it, within the same limit
   if(!w.ownerUid&&r.v){const u=userById(s.uid);if(!u||R.realmStage(wid)||!canOwn(u)){send(s,{t:'_rej',op:'meta'});return notify(s,'You already own '+cfg.maxWorldsPerAccount+' worlds. Release one first')}u.worlds=(u.worlds||[]).concat(wid);saveAcc();setOwner(wid,u.id,u.name);sendMine(s)}
   // taking the lock away frees the world (and its realms) again
   if(r.v===null&&w.ownerUid){const o=userById(w.ownerUid);if(o){o.worlds=(o.worlds||[]).filter(x=>x!=wid);saveAcc()}w.meta=null;setOwner(wid,'','');sendMine(s)}
   // a lock put down comes out of the server's own ledger (the client took it from its inventory too), so only a lock really paid for is handed back on release
   if(r.v&&!w.meta){const u=userById(s.uid);if(s.god)w.lockPaid=1;else if(u&&ECON.count(u,17)>=1){ECON.add(u,17,-1);saveAcc();w.lockPaid=1}else{w.lockPaid=0;store.audit({ev:'lock-unpaid',uid:s.uid,w:wid})}}else if(r.v===null)w.lockPaid=0;
   w.meta=r.v;saveWorld(w);relay(wid,{t:'meta',d:r.v,f:s.sid},s.sid);return}
  if(t=='o'){if(!bucket(s,'o',40,8000))return;const r=R.objOp(w,m.d,s.uid,s.god);if(!r){send(s,{t:'_rej',op:'o'});return}
   if(r.weather){if(Date.now()-w.lastWx<cfg.wxCooldownMs){send(s,{t:'notice',d:{text:'The weather machines are recharging ('+Math.ceil((cfg.wxCooldownMs-(Date.now()-w.lastWx))/1000)+'s)',by:'Server'}});return}if(w.weather==r.weather)return;setWeather(w,r.weather,s.name);store.audit({ev:'weather',w:wid,by:s.uid,wx:r.weather});return}
   if(r.changed)saveWorld(w);for(const b of r.bcast||[])relay(wid,{t:'o',d:b,f:s.sid});for(const b of r.reply||[])send(s,{t:'o',d:b,f:s.sid});return}
 }
 // ---------- http + ws plumbing
 let profTotal=null;const profBytes=()=>{if(profTotal==null){profTotal=0;try{for(const f of fs.readdirSync(store.p('profiles')))if(f.endsWith('.json'))profTotal+=fs.statSync(store.p('profiles',f)).size}catch(_){}}return profTotal};
 // sent with the game page. Scripts: only the exact inline scripts of this build (their hashes); other sites can't frame it; it can only talk to itself.
 const pageHeaders=b=>{const hs=[];const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;let m;const txt=b.toString('utf8');while((m=re.exec(txt)))hs.push("'sha256-"+crypto.createHash('sha256').update(m[1].replace(/\r\n?/g,'\n'),'utf8').digest('base64')+"'");return{'Content-Security-Policy':"default-src 'self'; script-src "+hs.join(' ')+"; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; worker-src 'self' blob:; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",'X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=(), usb=()','Cross-Origin-Opener-Policy':'same-origin','Strict-Transport-Security':'max-age=15552000'}};
 let wlCache=null;const publicWorlds=()=>{const now=Date.now();if(!wlCache||now-wlCache.t>5000)wlCache={t:now,j:JSON.stringify(listWorlds().filter(x=>!x.priv))};return wlCache.j};
 let clientHtml=null;const html=()=>{try{const st=fs.statSync(cfg.client);if(!clientHtml||clientHtml.m!=st.mtimeMs){const b=Buffer.from(fs.readFileSync(cfg.client,'utf8').replace('RB_HOSTED=false','RB_HOSTED=true').replace('</head>','<link rel="manifest" href="/manifest.webmanifest"></head>'));clientHtml={m:st.mtimeMs,b,z:zlib.gzipSync(b),sec:cfg.csp?pageHeaders(b):{},tag:'"'+Math.round(st.mtimeMs).toString(36)+'"'}}return clientHtml}catch(_){return null}};
 const server=http.createServer((q,r)=>{const u=(q.url||'/').split('?')[0];const h={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store'};
  if(u=='/'||u=='/index.html'){const c=html();if(!c){r.writeHead(404,h);return r.end('client file missing')}const hh=Object.assign({},h,c.sec,{'Cache-Control':'no-cache',ETag:c.tag,Vary:'Accept-Encoding'});if(q.headers['if-none-match']==c.tag){r.writeHead(304,hh);return r.end()}const gz=/\bgzip\b/.test(q.headers['accept-encoding']||'');r.writeHead(200,Object.assign({'Content-Type':'text/html; charset=utf-8'},hh,gz?{'Content-Encoding':'gzip'}:{}));return r.end(gz?c.z:c.b)}
  if(u=='/audio/intro-song.mp3'||u=='/audio/rootbound-voice.mp3'||u=='/audio/intro-cinematic.mp4'){const f=path.join(path.dirname(cfg.client),u.slice(1));let st=null;try{st=fs.statSync(f)}catch(_){}if(!st){r.writeHead(404,h);return r.end('not found')}
   const tag='"'+Math.round(st.mtimeMs).toString(36)+'-'+st.size.toString(36)+'"',hh=Object.assign({},h,{'Content-Type':u.endsWith('.mp4')?'video/mp4':'audio/mpeg','Accept-Ranges':'bytes','Cache-Control':'public, max-age=86400',ETag:tag});if(q.headers['if-none-match']==tag){r.writeHead(304,hh);return r.end()}
   const m=/^bytes=(\d*)-(\d*)$/.exec(q.headers.range||'');let a=0,b=st.size-1;if(m&&(m[1]||m[2])){if(m[1]){a=+m[1];if(m[2])b=Math.min(b,+m[2])}else a=Math.max(0,st.size-(+m[2]));if(a>b){r.writeHead(416,Object.assign({},hh,{'Content-Range':'bytes */'+st.size}));return r.end()}hh['Content-Range']='bytes '+a+'-'+b+'/'+st.size;r.writeHead(206,Object.assign(hh,{'Content-Length':b-a+1}))}else r.writeHead(200,Object.assign(hh,{'Content-Length':st.size}));
   if(q.method=='HEAD')return r.end();return fs.createReadStream(f,{start:a,end:b}).on('error',()=>r.destroy()).pipe(r)}
  // art made in Blender (docs/blender.md): one flat folder of named PNGs, nothing else
  if(/^\/assets\/sprites\/[a-z0-9_-]{1,40}\.png$/.test(u)){let d=null;try{d=fs.readFileSync(path.join(path.dirname(cfg.client),u.slice(1)))}catch(_){}if(!d){r.writeHead(404,h);return r.end('not found')}r.writeHead(200,Object.assign({},h,{'Content-Type':'image/png','Cache-Control':'public, max-age=86400'}));return r.end(d)}
  if(u=='/manifest.webmanifest'){r.writeHead(200,Object.assign({},h,{'Content-Type':'application/manifest+json','Cache-Control':'public, max-age=3600'}));return r.end(JSON.stringify({name:'Rootbound',short_name:'Rootbound',description:'A 2D anime block sandbox: every world has a story.',id:'/',start_url:'/',scope:'/',display:'fullscreen',display_override:['fullscreen','standalone'],background_color:'#050816',theme_color:'#050816',icons:[{src:'/icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'}]}))}
  if(u=='/icons/icon-192.png'||u=='/icons/icon-512.png'){let d=null;try{d=fs.readFileSync(path.join(path.dirname(cfg.client),u.slice(1)))}catch(_){}if(!d){r.writeHead(404,h);return r.end('not found')}r.writeHead(200,Object.assign({},h,{'Content-Type':'image/png','Cache-Control':'public, max-age=86400'}));return r.end(d)}
  if(u=='/health'){r.writeHead(200,Object.assign({'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},h));return r.end(JSON.stringify({ok:true,game:'rootbound',players:sessions.size,uptime:Math.round((Date.now()-t0)/1000),ownerConfigured:!!owner}))}
  if(u=='/api/worlds'){r.writeHead(200,Object.assign({'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},h));return r.end(publicWorlds())}
  r.writeHead(404,h);r.end('not found')});
 server.on('upgrade',(req,sock,head)=>{if((req.url||'').split('?')[0]!='/ws'){sock.end('HTTP/1.1 404 Not Found\r\n\r\n');return}
  // behind a host's proxy every socket comes from the proxy: use the address it reports, or one visitor's limit would hit everyone
  const hd=req.headers,ip=String(cfg.trustProxy&&(hd['cf-connecting-ip']||hd['true-client-ip']||String(hd['x-forwarded-for']||'').split(',').pop().trim())||req.socket.remoteAddress||'');if(sessions.size>=cfg.maxConns||(ipCount.get(ip)||0)>=cfg.maxConnsPerIp){sock.end('HTTP/1.1 503 Service Unavailable\r\n\r\n');return}
  const conn=upgrade(req,sock,head,{maxPayload:65536,originOk:o=>!cfg.origins||cfg.origins.includes(o)});if(!conn)return;
  const s={sid:'p'+(++sidN).toString(36)+crypto.randomBytes(2).toString('hex'),conn,ip,uid:'',name:'',kind:'',owner:false,world:null,pres:{},rate:{},strikes:0,last:Date.now(),born:Date.now()};sessions.set(s.sid,s);ipCount.set(ip,(ipCount.get(ip)||0)+1);
  conn.onmessage=raw=>{s.last=Date.now();onMsg(s,raw)};conn.onclose=()=>{leaveWorld(s);sessions.delete(s.sid);const n=(ipCount.get(ip)||1)-1;if(n<=0)ipCount.delete(ip);else ipCount.set(ip,n)};
  send(s,{t:'server',v:1,max:cfg.maxPlayers,ownerConfigured:!!owner,time:Date.now()})});
 const hb=setInterval(()=>{const now=Date.now();for(const s of sessions.values()){if(now-s.last>45000||(!s.uid&&now-s.born>60000)){s.conn.close(1001);continue}s.conn.ping()}
  for(const k of Object.keys(authFail))if(!authFail[k].until&&authFail[k].first&&now-authFail[k].first>3600e3||authFail[k].until&&now>authFail[k].until)delete authFail[k];for(const[k,a]of ipHits)if(!a.length||now-a[a.length-1]>3600e3)ipHits.delete(k);{let ch=false;for(const k of Object.keys(sess))if(sess[k].exp<now){delete sess[k];ch=true}if(ch)saveSess()}
  for(const[id,w]of worlds){if(!w.members.size&&now-w.emptySince>300000){if(w.dirty)saveWorld(w,true);worlds.delete(id)}}},15000);hb.unref&&hb.unref();
 function listen(){return new Promise(res=>server.listen(cfg.port,cfg.host,()=>res(server.address().port)))}
 function close(){clearInterval(hb);for(const w of worlds.values())if(w.dirty)saveWorld(w,true);for(const k of store.flush());try{store.writeJSON(store.p('accounts.json'),accounts);store.writeJSON(store.p('bans.json'),bans);store.writeJSON(store.p('sessions.json'),sess)}catch(_){}
  for(const s of sessions.values())try{s.conn.close(1001)}catch(_){}const flushed=cfg.cloud?cfg.cloud.flush().catch(e=>console.error('cloud save failed:',e.message)):Promise.resolve();return Promise.all([flushed,new Promise(r=>server.close(()=>r()))]).then(()=>{})}
 return{server,listen,close,cfg,store,worlds,sessions}}
module.exports={createServer};
if(require.main===module)process.on('uncaughtException',e=>console.error('uncaught:',e&&e.stack||e)),process.on('unhandledRejection',e=>console.error('unhandled:',e&&e.stack||e));
if(require.main===module)(async()=>{const dir=ENV.DATA_DIR||path.join(__dirname,'data'),cloud=require('./cloud').fromEnv(dir);
 // the saves must be back on disk before anything reads them; if the database cannot be reached, stop (the host restarts us) rather than start empty and overwrite it
 if(cloud){const n=await cloud.restore();console.log('Cloud saves restored: '+n+' files')}else console.log('No cloud store set: saves live only in '+dir);
 const s=createServer({cloud,resetGen:ACCOUNT_GEN});const p=await s.listen();console.log('Rootbound server on http://localhost:'+p+'  (data: '+s.cfg.dataDir+')');const ow=s.store.readJSON(s.store.p('owner.json'),null);console.log(ow?'Owner account configured: '+ow.name:'WARNING: no owner configured. Set OWNER_NAME + OWNER_PASSWORD or run: node server/cli.js set-owner <AccountName>');
 const stop=()=>{s.close().then(()=>process.exit(0))};process.on('SIGINT',stop);process.on('SIGTERM',stop)})().catch(e=>{console.error('Server failed to start:',e.message);process.exit(1)});
