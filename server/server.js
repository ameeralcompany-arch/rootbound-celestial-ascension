'use strict';
// Rootbound persistent multiplayer server. Zero dependencies (Node 18+). See server/README.md.
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {upgrade}=require('./ws'),R=require('./rules'),{Store}=require('./store');
const ENV=process.env;
function createServer(opts={}){
 const cfg=Object.assign({port:+ENV.PORT||8787,host:ENV.HOST||'0.0.0.0',dataDir:ENV.DATA_DIR||path.join(__dirname,'data'),client:ENV.CLIENT_FILE||path.join(__dirname,'..','index.html'),
  maxPlayers:+ENV.MAX_PLAYERS_PER_WORLD||24,maxWorlds:+ENV.MAX_WORLDS||500,maxWorldsPerAccount:+ENV.MAX_WORLDS_PER_ACCOUNT||8,maxConns:+ENV.MAX_CONNECTIONS||400,maxConnsPerIp:+ENV.MAX_CONNS_PER_IP||12,
  wxCooldownMs:+ENV.WEATHER_COOLDOWN_MS||20000,origins:ENV.ALLOWED_ORIGINS?ENV.ALLOWED_ORIGINS.split(','):null,scryptN:+ENV.SCRYPT_N||16384},opts);
 const store=new Store(cfg.dataDir);const t0=Date.now();
 // ---------- accounts / owner / bans
 let accounts=store.readJSON(store.p('accounts.json'),{users:{}}),owner=store.readJSON(store.p('owner.json'),null),bans=store.readJSON(store.p('bans.json'),{bans:{},mutes:{}}),sess=store.readJSON(store.p('sessions.json'),{});
 const saveAcc=()=>store.later('acc',()=>store.writeJSON(store.p('accounts.json'),accounts)),saveBans=()=>store.later('bans',()=>store.writeJSON(store.p('bans.json'),bans)),saveSess=()=>store.later('sess',()=>store.writeJSON(store.p('sessions.json'),sess));
 const hashTok=t=>crypto.createHash('sha256').update(t).digest('hex');
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
 // ---------- worlds
 const worlds=new Map(); // id -> world
 const wname=n=>String(n||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16);
 const wfile=id=>store.p('worlds',id+'.json');
 function loadWorld(id,create,ownerUid){let w=worlds.get(id);if(w)return w;const j=store.readJSON(wfile(id),null);
  if(j&&j.id==id){w={id,name:j.name||id,created:j.created||Date.now(),ownerUid:j.ownerUid||'',edits:{},meta:R.cleanMeta(j.meta)||null,objs:R.cleanObjMap(j.objs),weather:R.WEATHERS.includes(j.weather)?j.weather:'default',rev:j.rev|0,updated:j.updated||0,lastWx:0};
   for(const k of Object.keys(j.edits||{})){if(R.validEdit({k:+k,a:j.edits[k]}))w.edits[k]=j.edits[k]}}
  else if(create){if(countWorlds()>=cfg.maxWorlds)return null;w={id,name:id,created:Date.now(),ownerUid:ownerUid||'',edits:{},meta:null,objs:{},weather:'default',rev:0,updated:Date.now(),lastWx:0};}
  else return null;
  w.members=new Set();w.dirty=false;w.emptySince=Date.now();worlds.set(id,w);if(create&&!j){saveWorld(w,true);store.audit({ev:'world-created',w:id,by:ownerUid})}return w}
 function countWorlds(){try{return fs.readdirSync(store.p('worlds')).filter(f=>f.endsWith('.json')).length}catch(_){return worlds.size}}
 function saveWorld(w,now){w.dirty=true;const doSave=()=>{w.dirty=false;w.rev++;w.updated=Date.now();store.writeJSON(wfile(w.id),{v:1,id:w.id,name:w.name,created:w.created,ownerUid:w.ownerUid,weather:w.weather,rev:w.rev,updated:w.updated,meta:w.meta,objs:w.objs,edits:w.edits})};if(now)doSave();else store.later('w:'+w.id,doSave)}
 const worldExists=id=>worlds.has(id)||fs.existsSync(wfile(id));
 function listWorlds(){const out=[];let files=[];try{files=fs.readdirSync(store.p('worlds')).filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5))}catch(_){}
  for(const id of files){const w=worlds.get(id);let info;if(w)info={id,pop:w.members.size,owner:w.meta?w.meta.on:'',weather:w.weather,rev:w.rev,updated:w.updated,priv:!!(w.meta&&w.meta.pr)};else{try{const st=fs.statSync(wfile(id));info={id,pop:0,owner:'',weather:'default',rev:0,updated:st.mtimeMs,priv:false,cold:1}}catch(_){continue}}out.push(info)}
  if(!out.find(x=>x.id=='plaza'))out.push({id:'plaza',pop:plaza.size,owner:'',weather:'default',rev:0,updated:0,priv:false,hub:1});return out}
 // ---------- sessions
 const sessions=new Map(),plaza=new Set(),ipCount=new Map();let sidN=0;
 const send=(s,m)=>{if(s.conn&&!s.conn.closed&&s.conn.backlog<2e6)s.conn.send(JSON.stringify(m))};
 const members=id=>id=='plaza'?plaza:(worlds.get(id)?worlds.get(id).members:new Set());
 const relay=(wid,m,exceptSid)=>{const raw=JSON.stringify(m);for(const sid of members(wid)){if(sid===exceptSid)continue;const s=sessions.get(sid);if(s&&s.conn&&!s.conn.closed&&s.conn.backlog<2e6)s.conn.send(raw)}};
 function bucket(s,k,cap,ms){const now=Date.now(),a=(s.rate[k]=(s.rate[k]||[]).filter(x=>now-x<ms));if(a.length>=cap)return false;a.push(now);return true}
 const isMuted=uid=>{const u=bans.mutes[uid];if(!u)return false;if(u<Date.now()){delete bans.mutes[uid];return false}return true};
 function leaveWorld(s){if(!s.world)return;const id=s.world;const set=members(id);set.delete(s.sid);relay(id,{t:'_x',f:s.sid});s.world=null;const w=worlds.get(id);if(w){if(!w.members.size){w.emptySince=Date.now();if(w.dirty)saveWorld(w,true)}}}
 function helloFor(s,id){const pl={};for(const sid of members(id)){if(sid==s.sid)continue;const o=sessions.get(sid);if(o)pl[sid]=o.pres}pl[s.sid]=s.pres;
  if(id=='plaza')return{w:'plaza',edits:{},pl,wx:'default'};const w=worlds.get(id);const e=Object.assign({},w.edits);if(w.meta)e.m=w.meta;if(Object.keys(w.objs).length)e.o=w.objs;return{w:id,edits:e,pl,wx:w.weather,rev:w.rev}}
 function enter(s,idRaw,create){const id=wname(idRaw);if(!id)return send(s,{t:'enter_err',m:'Invalid world name'});
  if(s.world==id)return;
  if(bans.bans[s.uid])return send(s,{t:'enter_err',m:'You are banned from this server'});
  let w=null;if(id!='plaza'){if(!worldExists(id)){if(!create)return send(s,{t:'enter_err',m:'That world does not exist yet. Use Create to make it.'});if(s.kind!='user'&&s.kind!='owner')return send(s,{t:'enter_err',m:'Create an account to make new worlds (guests can join existing ones).'});
    const u=userById(s.uid);if(u&&!isOwnerUid(s.uid)&&(u.worlds||[]).length>=cfg.maxWorldsPerAccount)return send(s,{t:'enter_err',m:'World limit reached ('+cfg.maxWorldsPerAccount+' per account)'});
    if(!bucket(s,'create',3,60000))return send(s,{t:'enter_err',m:'Slow down: too many worlds created'});
    w=loadWorld(id,true,s.uid);if(!w)return send(s,{t:'enter_err',m:'The server has reached its world limit'});if(u){u.worlds=(u.worlds||[]).concat(id);saveAcc()}}
   else{w=loadWorld(id,false);if(!w)return send(s,{t:'enter_err',m:'World data could not be loaded'})}
   if(w.meta&&w.meta.b&&w.meta.b.includes(s.uid))return send(s,{t:'enter_err',m:'You are banned from this world'});
   if(w.meta&&w.meta.pr&&!(w.meta.o==s.uid||(w.meta.f||[]).includes(s.uid)||(w.meta.t||[]).includes(s.uid))&&!s.owner)return send(s,{t:'enter_err',m:'This world is private'})}
  if(members(id).size>=cfg.maxPlayers&&!s.owner)return send(s,{t:'enter_err',m:'World is full ('+cfg.maxPlayers+' players)'});
  leaveWorld(s);s.world=id;members(id).add(s.sid);s.pres={n:s.name,uid:s.uid,x:0,y:0,f:1};
  send(s,{t:'joined',sid:s.sid,w:id,uid:s.uid,name:s.name,owner:!!s.owner,kind:s.kind});send(s,{t:'_hello',d:helloFor(s,id)});relay(id,{t:'_p',d:s.pres,f:s.sid},s.sid)}
 // ---------- admin (OWNER ONLY, verified server-side on every call)
 function adminOp(s,m){const rid=m.rid,ok=(msg,data)=>send(s,{t:'admin_res',rid,ok:1,m:msg,data}),no=msg=>send(s,{t:'admin_res',rid,ok:0,m:msg});
  if(!s.owner||!isOwnerUid(s.uid)||s.kind!='owner'){store.audit({ev:'admin-denied',uid:s.uid,op:String(m.op).slice(0,24),ip:s.ip});return no('Not authorized')}
  const op=String(m.op||'');const find=q=>{q=String(q||'').toLowerCase();for(const o of sessions.values())if(o.sid==q||o.uid==q||o.name.toLowerCase()==q)return o;return null};const A=(o)=>store.audit(Object.assign({ev:'admin',op,by:s.name},o||{}));
  switch(op){
  case 'players':return ok('ok',[...sessions.values()].map(o=>({sid:o.sid,uid:o.uid,name:o.name,kind:o.kind,world:o.world})));
  case 'stats':return ok('ok',{players:sessions.size,worlds:listWorlds().length,loaded:worlds.size,uptime:Math.round((Date.now()-t0)/1000),mem:Math.round(process.memoryUsage().rss/1e6)});
  case 'kick':{const o=find(m.who);if(!o||isOwnerUid(o.uid))return no('Player not found');send(o,{t:'_kick',m:String(m.reason||'Removed by the server owner').slice(0,80)});A({who:o.name});setTimeout(()=>o.conn.close(1000),150);return ok('Kicked '+o.name)}
  case 'mute':{const o=find(m.who);const mins=Math.max(1,Math.min(1440,m.mins|0||5));if(!o||isOwnerUid(o.uid))return no('Player not found');bans.mutes[o.uid]=Date.now()+mins*60000;saveBans();A({who:o.name,mins});return ok('Muted '+o.name+' for '+mins+' min')}
  case 'unmute':{const o=find(m.who);const u=o?o.uid:String(m.who);delete bans.mutes[u];saveBans();A({who:u});return ok('Unmuted')}
  case 'ban':{const o=find(m.who);if(!o||isOwnerUid(o.uid))return no('Player not found (must be online to ban by name)');if(o.kind=='guest')return no('Guests have temporary ids; kick them or ban their account');bans.bans[o.uid]={name:o.name,ts:Date.now(),reason:String(m.reason||'').slice(0,80)};saveBans();send(o,{t:'_ban'});setTimeout(()=>o.conn.close(1000),150);A({who:o.name,uid:o.uid});return ok('Banned '+o.name)}
  case 'unban':{const q=String(m.who||'').toLowerCase();const k=Object.keys(bans.bans).find(u=>u==q||String(bans.bans[u].name).toLowerCase()==q);if(!k)return no('Not banned');delete bans.bans[k];saveBans();A({who:k});return ok('Unbanned')}
  case 'bans':return ok('ok',Object.keys(bans.bans).map(u=>Object.assign({uid:u},bans.bans[u])));
  case 'announce':{const text=String(m.text||'').slice(0,160).replace(/[<>]/g,'');if(!text)return no('Empty message');const scope=m.scope=='world'?'world':'all';if(scope=='all'){for(const o of sessions.values())send(o,{t:'notice',d:{text,by:'Server'}})}else relay(wname(m.world),{t:'notice',d:{text,by:'Server'}});A({scope,text:text.slice(0,60)});return ok('Sent')}
  case 'weather':{const id=wname(m.world);const wx=String(m.weather||'');if(!R.WEATHERS.includes(wx))return no('Unknown weather');const w=id=='plaza'?null:loadWorld(id,false);if(!w)return no('World not found');setWeather(w,wx,'Server owner');A({w:id,wx});return ok('Weather set to '+wx)}
  case 'worlds':return ok('ok',listWorlds());
  case 'world_delete':{const id=wname(m.world);if(id=='plaza'||m.confirm!==id)return no('Type the world name to confirm');const w=worlds.get(id);if(w){for(const sid of [...w.members]){const o=sessions.get(sid);if(o){send(o,{t:'_kick',m:'This world was deleted'});leaveWorld(o)}}worlds.delete(id)}try{fs.renameSync(wfile(id),wfile(id)+'.deleted-'+Date.now())}catch(_){return no('World not found')}A({w:id});return ok('Deleted '+id+' (file kept as .deleted for recovery)')}
  case 'world_reset':{const id=wname(m.world);if(id=='plaza'||m.confirm!==id)return no('Type the world name to confirm');const w=loadWorld(id,false);if(!w)return no('World not found');try{fs.copyFileSync(wfile(id),wfile(id)+'.pre-reset-'+Date.now())}catch(_){}w.edits={};w.meta=null;w.objs={};saveWorld(w,true);for(const sid of w.members){const o=sessions.get(sid);if(o)send(o,{t:'_hello',d:helloFor(o,id)})}A({w:id});return ok('World reset (backup kept)')}
  case 'world_restore':{const id=wname(m.world);if(!fs.existsSync(wfile(id)+'.bak'))return no('No backup for that world');const w=worlds.get(id);if(w&&w.members.size)return no('Empty the world first');worlds.delete(id);fs.copyFileSync(wfile(id)+'.bak',wfile(id));A({w:id});return ok('Restored last backup')}
  case 'config_get':return ok('ok',{maxPlayers:cfg.maxPlayers,maxWorlds:cfg.maxWorlds,maxWorldsPerAccount:cfg.maxWorldsPerAccount,wxCooldownMs:cfg.wxCooldownMs});
  case 'config_set':{const lim={maxPlayers:[1,100],maxWorlds:[1,5000],maxWorldsPerAccount:[1,100],wxCooldownMs:[0,600000]};const k=String(m.key);if(!lim[k])return no('Unknown setting');const v=+m.value;if(!Number.isFinite(v)||v<lim[k][0]||v>lim[k][1])return no('Out of range');cfg[k]=v|0;A({k,v});return ok(k+' = '+cfg[k]+' (until restart)')}
  case 'audit':return ok('ok',store.readAudit(Math.max(1,Math.min(200,m.n|0||50))));
  case 'tp':{const o=find(m.who);if(!o)return no('Player not found');send(o,{t:'sys',d:{op:'tp',x:+m.x||0,y:+m.y||0}});A({who:o.name});return ok('Teleported '+o.name)}
  case 'goto_world':{const o=find(m.who);const id=wname(m.world);if(!o)return no('Player not found');send(o,{t:'sys',d:{op:'world',w:id}});A({who:o.name,w:id});return ok('Sent '+o.name+' to '+id)}
  default:return no('Unknown operation')}}
 function setWeather(w,wx,by){w.weather=wx;w.lastWx=Date.now();saveWorld(w);relay(w.id,{t:'wx',d:{w:wx,by:String(by||'').slice(0,14),rev:w.rev}})}
 // ---------- message handling
 const NAMECHK=/^[A-Za-z0-9_-]{3,16}$/;
 const authFail={};
 function loginThrottle(key,lim){const a=authFail[key];if(a&&a.until&&Date.now()>a.until){delete authFail[key];return false}return !!a&&a.n>=lim}
 function failed(key,lim){const a=authFail[key]||(authFail[key]={n:0,until:0});a.n++;if(a.n>=lim)a.until=Date.now()+60000}
 function setAuth(s,u,tokenTtl){s.uid=u.id;s.name=u.name;s.kind=isOwnerUid(u.id)?'owner':'user';s.owner=s.kind=='owner';const token=newToken(u.id,s.owner?12*3600e3:tokenTtl||30*86400e3);send(s,{t:'auth',ok:1,uid:s.uid,name:s.name,kind:s.kind,owner:s.owner,token});store.audit({ev:s.owner?'owner-login':'login',uid:s.uid,ip:s.ip})}
 function onMsg(s,raw){let m;if(raw.length>20000&&!/^\{"t":"(e|o|meta|_p)"/.test(raw.slice(0,12)))return;try{m=JSON.parse(raw)}catch(_){if(++s.strikes>8)s.conn.close(1008);return}
  if(!m||typeof m.t!='string')return;
  if(!bucket(s,'all',300,5000)){if(++s.strikes>20)s.conn.close(1008);return}
  const t=m.t;
  switch(t){
  case 'guest':{if(s.uid)return;if(!bucket(s,'auth',10,60000))return;const base=String(m.name||'Player').replace(/[^A-Za-z0-9_-]/g,'').slice(0,8)||'Player';s.uid='g'+crypto.randomBytes(4).toString('hex');s.name='~'+base;s.kind='guest';s.owner=false;send(s,{t:'auth',ok:1,uid:s.uid,name:s.name,kind:'guest',owner:false});return}
  case 'register':{if(s.uid&&s.kind!='guest')return;if(!bucket(s,'auth',10,60000))return send(s,{t:'auth',ok:0,m:'Too many attempts. Wait a minute.'});const name=String(m.name||''),pw=String(m.pass||'');
   if(!nameOk(name))return send(s,{t:'auth',ok:0,m:'Name: 3-16 letters, numbers, _ or -'});if(pw.length<8||pw.length>128)return send(s,{t:'auth',ok:0,m:'Password must be 8-128 characters'});
   if(RESERVED.includes(nameKey(name))||(owner&&nameKey(owner.name)==nameKey(name))||accounts.users[nameKey(name)])return send(s,{t:'auth',ok:0,m:'That name is not available'});
   if(Object.keys(accounts.users).length>=20000)return send(s,{t:'auth',ok:0,m:'Registration closed'});
   const u=createAccount(name,pw,'player');setAuth(s,u);return}
  case 'login':{if(!bucket(s,'auth',10,60000))return send(s,{t:'auth',ok:0,m:'Too many attempts. Wait a minute.'});const name=String(m.name||''),pw=String(m.pass||'');const key=nameKey(name)+'|'+s.ip,ik='ip:'+s.ip,uk=nameKey(name);
   if(loginThrottle(key,5)||loginThrottle(ik,40))return send(s,{t:'auth',ok:0,m:'Too many failed attempts. Try again in a minute.'});
   const u=accounts.users[uk];if(!u||!checkPw(pw,u.pw)){failed(key,5);failed(ik,40);store.audit({ev:'login-failed',name:name.slice(0,16),ip:s.ip});return send(s,{t:'auth',ok:0,m:'Wrong name or password'})}
   if(bans.bans[u.id])return send(s,{t:'auth',ok:0,m:'This account is banned'});
   for(const o of sessions.values())if(o.uid==u.id&&o!==s){send(o,{t:'_kick',m:'Signed in from another place'});o.conn.close(1000)}
   setAuth(s,u);return}
  case 'resume':{if(!bucket(s,'auth',10,60000))return;const rec=sess[hashTok(String(m.token||''))];if(!rec||rec.exp<Date.now())return send(s,{t:'auth',ok:0,m:'Session expired',expired:1});const u=userById(rec.uid);if(!u||bans.bans[u.id])return send(s,{t:'auth',ok:0,m:'Account unavailable'});
   for(const o of sessions.values())if(o.uid==u.id&&o!==s){send(o,{t:'_kick',m:'Signed in from another place'});o.conn.close(1000)}
   s.uid=u.id;s.name=u.name;s.kind=isOwnerUid(u.id)?'owner':'user';s.owner=s.kind=='owner';send(s,{t:'auth',ok:1,uid:s.uid,name:s.name,kind:s.kind,owner:s.owner,token:m.token,resumed:1});return}
  case 'logout':{const h=hashTok(String(m.token||''));if(sess[h]){delete sess[h];saveSess()}return}
  }
  if(!s.uid)return;// everything below requires an identity (account or guest)
  switch(t){
  case 'ping':return send(s,{t:'pong',n:m.n});
  case 'worlds':{if(!bucket(s,'wl',10,10000))return;return send(s,{t:'worlds',list:listWorlds().filter(x=>!x.priv).sort((a,b)=>b.pop-a.pop||(b.updated||0)-(a.updated||0)).slice(0,200),max:cfg.maxPlayers})}
  case 'enter':if(!bucket(s,'enter',12,30000))return send(s,{t:'enter_err',m:'Slow down'});return enter(s,m.w,!!m.create);
  case 'leave':return leaveWorld(s);
  case 'admin':{if(!bucket(s,'admin',30,10000))return;return adminOp(s,m)}
  }
  const wid=s.world;if(!wid)return;const w=wid=='plaza'?null:worlds.get(wid);
  if(t=='_p'){if(!bucket(s,'p',40,1000))return;s.pres=R.cleanPres(m.d);s.pres.uid=s.uid;s.pres.n=s.name.slice(0,14);relay(wid,{t:'_p',d:s.pres,f:s.sid},s.sid);return}
  if(t=='chat'){if(!bucket(s,'chat',6,8000))return;if(isMuted(s.uid))return send(s,{t:'notice',d:{text:'You are muted',by:'Server'}});const d=m.d;if(!d||typeof d.t!='string')return;const out={n:s.name.slice(0,14),t:d.t.slice(0,80).replace(/[<>]/g,'')};if(!out.t.trim())return;if(Number.isInteger(d.e)&&d.e>=0&&d.e<64)out.e=d.e;relay(wid,{t:'chat',d:out,f:s.sid},s.sid);return}
  if(t=='x'){if(!bucket(s,'x',10,8000))return;if(isMuted(s.uid))return;const v=R.checkX(m.d,s.sid,sid=>members(wid).has(sid));if(!v)return;const o=sessions.get(v.to);if(o)send(o,{t:'x',d:v,f:s.sid});return}
  if(!w)return;// plaza: no persistent edits
  if(w.meta&&w.meta.b&&w.meta.b.includes(s.uid))return;
  if(t=='e'){if(!bucket(s,'e',70,8000))return;if(!R.checkEdit(w,m.d,s.uid)){if(bucket(s,'rej',3,5000))send(s,{t:'_rej',op:'e',k:m.d&&m.d.k});return}R.applyEdit(w,m.d.k,m.d.a);saveWorld(w);relay(wid,{t:'e',d:{k:m.d.k,a:m.d.a},f:s.sid},s.sid);return}
  if(t=='meta'){if(!bucket(s,'meta',6,8000))return;if(s.kind=='guest')return;const r=R.checkMeta(w,m.d,s.uid);if(!r){send(s,{t:'_rej',op:'meta'});return}w.meta=r.v;saveWorld(w);relay(wid,{t:'meta',d:r.v,f:s.sid},s.sid);return}
  if(t=='o'){if(!bucket(s,'o',40,8000))return;const r=R.objOp(w,m.d,s.uid);if(!r){send(s,{t:'_rej',op:'o'});return}
   if(r.weather){if(Date.now()-w.lastWx<cfg.wxCooldownMs){send(s,{t:'notice',d:{text:'The weather machines are recharging ('+Math.ceil((cfg.wxCooldownMs-(Date.now()-w.lastWx))/1000)+'s)',by:'Server'}});return}if(w.weather==r.weather)return;setWeather(w,r.weather,s.name);store.audit({ev:'weather',w:wid,by:s.uid,wx:r.weather});return}
   if(r.changed)saveWorld(w);for(const b of r.bcast||[])relay(wid,{t:'o',d:b,f:s.sid});for(const b of r.reply||[])send(s,{t:'o',d:b,f:s.sid});return}
 }
 // ---------- http + ws plumbing
 let clientHtml=null;const html=()=>{try{const st=fs.statSync(cfg.client);if(!clientHtml||clientHtml.m!=st.mtimeMs)clientHtml={m:st.mtimeMs,b:fs.readFileSync(cfg.client)};return clientHtml.b}catch(_){return null}};
 const server=http.createServer((q,r)=>{const u=(q.url||'/').split('?')[0];const h={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store'};
  if(u=='/'||u=='/index.html'){const b=html();if(!b){r.writeHead(404,h);return r.end('client file missing')}r.writeHead(200,Object.assign({'Content-Type':'text/html; charset=utf-8'},h));return r.end(b)}
  if(u=='/health'){r.writeHead(200,Object.assign({'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},h));return r.end(JSON.stringify({ok:true,game:'rootbound',players:sessions.size,uptime:Math.round((Date.now()-t0)/1000),ownerConfigured:!!owner}))}
  if(u=='/api/worlds'){r.writeHead(200,Object.assign({'Content-Type':'application/json','Access-Control-Allow-Origin':'*'},h));return r.end(JSON.stringify(listWorlds().filter(x=>!x.priv)))}
  r.writeHead(404,h);r.end('not found')});
 server.on('upgrade',(req,sock,head)=>{if((req.url||'').split('?')[0]!='/ws'){sock.end('HTTP/1.1 404 Not Found\r\n\r\n');return}
  const ip=String(req.socket.remoteAddress||'');if(sessions.size>=cfg.maxConns||(ipCount.get(ip)||0)>=cfg.maxConnsPerIp){sock.end('HTTP/1.1 503 Service Unavailable\r\n\r\n');return}
  const conn=upgrade(req,sock,head,{maxPayload:65536,originOk:o=>!cfg.origins||cfg.origins.includes(o)});if(!conn)return;
  const s={sid:'p'+(++sidN).toString(36)+crypto.randomBytes(2).toString('hex'),conn,ip,uid:'',name:'',kind:'',owner:false,world:null,pres:{},rate:{},strikes:0,last:Date.now()};sessions.set(s.sid,s);ipCount.set(ip,(ipCount.get(ip)||0)+1);
  conn.onmessage=raw=>{s.last=Date.now();onMsg(s,raw)};conn.onclose=()=>{leaveWorld(s);sessions.delete(s.sid);const n=(ipCount.get(ip)||1)-1;if(n<=0)ipCount.delete(ip);else ipCount.set(ip,n)};
  send(s,{t:'server',v:1,max:cfg.maxPlayers,ownerConfigured:!!owner,time:Date.now()})});
 const hb=setInterval(()=>{const now=Date.now();for(const s of sessions.values()){if(now-s.last>45000){s.conn.close(1001);continue}s.conn.ping()}
  for(const[id,w]of worlds){if(!w.members.size&&now-w.emptySince>300000){if(w.dirty)saveWorld(w,true);worlds.delete(id)}}},15000);hb.unref&&hb.unref();
 function listen(){return new Promise(res=>server.listen(cfg.port,cfg.host,()=>res(server.address().port)))}
 function close(){clearInterval(hb);for(const w of worlds.values())if(w.dirty)saveWorld(w,true);for(const k of store.flush());try{store.writeJSON(store.p('accounts.json'),accounts);store.writeJSON(store.p('bans.json'),bans);store.writeJSON(store.p('sessions.json'),sess)}catch(_){}
  for(const s of sessions.values())try{s.conn.close(1001)}catch(_){}return new Promise(r=>server.close(()=>r()))}
 return{server,listen,close,cfg,store,worlds,sessions}}
module.exports={createServer};
if(require.main===module){const s=createServer();s.listen().then(p=>{console.log('Rootbound server on http://localhost:'+p+'  (data: '+s.cfg.dataDir+')');const ow=s.store.readJSON(s.store.p('owner.json'),null);console.log(ow?'Owner account configured: '+ow.name:'WARNING: no owner configured. Run: node server/cli.js set-owner <AccountName>')});
 const stop=()=>{s.close().then(()=>process.exit(0))};process.on('SIGINT',stop);process.on('SIGTERM',stop)}
