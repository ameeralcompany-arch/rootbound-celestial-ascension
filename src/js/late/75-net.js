// ===== NET7: persistent shared worlds over WebSocket (replaces the old PeerJS host rooms) =====
// The server (server/server.js) is authoritative for world data, roles and every privileged action. This file never trusts
// local flags for authorization; it only displays what the server tells it. The game works fully offline when no server is reachable.
const say6=(a,b,c)=>{try{UI6.say6(a,b,c)}catch(_){}};
const NET7=(()=>{
 const LOCAL_ID=myId,esc=DLG7.esc;
 let mySid='',st='offline',ws=null,url='',auth=null,info=null,list=[],room=null,want=null,joinedW=null,tries=0,retry=false,rt=0,hbT=0,lastPong=0,err='',manual=false,wantCreate=false,lastEnter=0,saved=null,resyncAt=0;
 const lsGet=k=>{try{return localStorage.getItem(k)}catch(_){return null}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}};
 const D=window.RBDIAG||{stage(){},err(){}};
 // ---- address handling
 function norm(a){a=String(a||'').trim();if(!a)return'';if(/^wss?:\/\//i.test(a))return a.replace(/\/+$/,'').replace(/\/ws$/,'')+'/ws';if(/^https?:\/\//i.test(a))return a.replace(/^http/i,'ws').replace(/\/+$/,'').replace(/\/ws$/,'')+'/ws';
  const local=/^(localhost|127\.|192\.168\.|10\.|\[::1\])/.test(a);return(local||location.protocol=='http:'?'ws://':'wss://')+a.replace(/\/+$/,'')+'/ws'}
 async function discover(){const c=window.RB_CONFIG&&window.RB_CONFIG.server;if(c)return norm(c);const s=lsGet('rbsrv');
  if(/^https?:$/.test(location.protocol)){try{const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),2500);const r=await fetch(location.origin+'/health',{signal:ctl.signal,cache:'no-store'});clearTimeout(t);const j=await r.json();if(j&&j.game=='rootbound')return norm(location.origin)}catch(_){}}
  return s?norm(s):''}
 const send=m=>{try{if(ws&&ws.readyState==1){ws.send(JSON.stringify(m));return true}}catch(_){}return false};
 // ---- connection lifecycle
 function setSt(s,e){st=s;err=e||'';try{if(menuEl.style.display!='none')render()}catch(_){}try{TOOLS7.sync()}catch(_){}}
 function connect(u,isManual){if(ws){try{ws.onclose=null;ws.close()}catch(_){}ws=null}url=u;manual=!!isManual;if(isManual)retry=false;if(!u){setSt('offline');return}setSt(retry?'reconnecting':'connecting',err);D.stage('net-connect',u.replace(/^wss?:\/\//,'').slice(0,60));
  let w,opened=false;try{w=new WebSocket(u)}catch(e){setSt('offline','Could not open a connection: '+e.message);D.err&&0;return}ws=w;
  const to=setTimeout(()=>{if(!opened){try{w.close()}catch(_){}}},7000);
  w.onopen=()=>{opened=true;clearTimeout(to);lastPong=Date.now()};
  w.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(_){return}onMsg(m)};
  w.onerror=()=>{};
  w.onclose=()=>{clearTimeout(to);if(ws!==w)return;ws=null;clearInterval(hbT);const was=st;auth=null;info=null;drop();
   if(was=='online'||was=='reconnecting'||retry){retry=true;setSt('reconnecting','Connection lost');say6&&say6('Connection lost','Your changes are not being saved. Reconnecting…',4000);sched()}
   else{setSt('offline',opened?'The server closed the connection':'Could not reach the server');if(!manual&&0)sched()}}}
 function sched(){clearTimeout(rt);tries++;const d=Math.min(30000,1000*Math.pow(2,Math.min(5,tries-1)))+Math.random()*500;rt=setTimeout(()=>{if(st=='reconnecting')connect(url,false)},d)}
 function drop(){if(room){room.dead=1}if(rm===room){rm=null}room=null;if(joinedW){saved={w:joinedW,x:P.x,y:P.y}}joinedW=null;guest=false;roomCode='';myId=LOCAL_ID;try{OBJ6&&0}catch(_){}}
 function startPing(){clearInterval(hbT);hbT=setInterval(()=>{if(Date.now()-lastPong>40000){try{ws.close()}catch(_){}return}send({t:'ping',n:Date.now()})},12000)}
 // ---- message handling
 function onMsg(m){const t=m.t;
  if(t=='server'){info={max:m.max,ownerConfigured:m.ownerConfigured};lastPong=Date.now();startPing();beginAuth();return}
  if(t=='pong'){lastPong=Date.now();return}
  if(t=='auth'){if(!m.ok){if(m.expired)lsSet('rbtok','');if(st=='online'){say(m.m||'Sign-in failed');return}authDone(null,m.m||'Sign-in failed');return}
   const was=auth;auth={uid:m.uid,name:m.name,kind:m.kind,owner:!!m.owner};if(m.token&&m.kind!='guest')lsSet('rbtok',m.token);tries=0;D.stage('net-auth',m.kind);
   if(st=='online'&&was){render();try{TOOLS7.sync()}catch(_){}if(joinedW){const w=joinedW;send({t:'leave'});joinedW=null;go(w,false)}say('Signed in as '+m.name);return}
   authDone(auth);return}
  if(t=='worlds'){list=m.list||[];try{if(menuEl.style.display!='none')renderWorlds()}catch(_){}return}
  if(t=='enter_err'){want=null;const msg=m.m||'Could not enter';if(/does not exist/i.test(msg)&&lastTry){const n=lastTry;DLG7.confirm('Create “'+n+'”?','That world does not exist yet. You can create it and become its owner.','Create world').then(ok=>{if(ok)go(n,true)})}else say(msg);return}
  if(t=='joined'){mySid=m.sid;myId=m.uid;joinedW=m.w;if(m.owner)say6&&say6('Creator mode','Tools are available in the top bar',2600);return}
  if(t=='wallet'||t=='buy_res'){try{SHOP7.net(m)}catch(e){}return}
  if(t=='_hello'){onHello(m.d);return}
  if(!room)return;
  if(t=='_p'){if(m.f&&m.f!==room.id)room.ps[m.f]=cleanPres(m.d);return}
  if(t=='_x'){delete room.ps[m.f];return}
  if(t=='wx'){try{ENV7.set(m.d.w,{by:m.d.by,quiet:false})}catch(_){}return}
  if(t=='notice'){const d=m.d||{};say6&&say6(String(d.by||'Server'),String(d.text||'').slice(0,160),5200);return}
  if(t=='_kick'||t=='_ban'){const why=t=='_ban'?'You were banned from this server':String(m.m||'You were removed');say6&&say6('Disconnected',why,6000);toOffline();return}
  if(t=='_rej'){if(Date.now()-resyncAt>4000){resyncAt=Date.now();say('That change is not allowed here');if(joinedW){const w=joinedW;setTimeout(()=>{if(joinedW==w){send({t:'leave'});joinedW=null;send({t:'enter',w,create:false})}},200)}}return}
  if(t=='sys'){const d=m.d||{};if(d.op=='tp'){P.x=+d.x||P.x;P.y=+d.y||P.y;P.vx=P.vy=0}else if(d.op=='world'&&d.w){go(d.w,false)}return}
  if(t=='admin_res'){try{TOOLS7.res(m)}catch(_){}return}
  if(typeof t=='string'&&t[0]!='_'){const fn=room.h[t];if(fn)try{fn({data:m.d,isMe:false,peer:m.f})}catch(e){console.error(e)}}}
 function beginAuth(){const tok=lsGet('rbtok');if(tok&&!auth){send({t:'resume',token:tok});return}
  send({t:'guest',name:(window.RB_SESS&&RB_SESS.name&&RB_SESS.id!='guest')?RB_SESS.name:myName})}
 function authDone(a,e){if(!a){if(st=='connecting'||st=='reconnecting'){// fall back to a guest session so the player can still look around
    if(!authDone.g){authDone.g=1;send({t:'guest',name:myName});setSt('connecting',e);return}}setSt('offline',e);return}authDone.g=0;retry=true;setSt('online');refresh();
  // rejoin after a reconnect or enter the plaza on first connect
  const w=saved&&saved.w||want||(entered?cur:null);const keep=saved;saved=null;if(w)go(w,false,keep)}
 function refresh(){send({t:'worlds'})}
 // ---- entering worlds
 let lastTry='';
 function go(n,create,keep){n=String(n||'plaza').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16)||'plaza';lastTry=n;want=n;wantCreate=!!create;if(keep)go.keep=keep;send({t:'enter',w:n,create:!!create})}
 function onHello(d){if(!d||typeof d!='object')return;const w=String(d.w||'plaza');if(want&&want!=w&&joinedW!=w){return}want=null;
  if(room){room.dead=1}const r={h:{},ps:{},isHost:false,id:null,conns:[],pres:{},onHello:null,dead:0,net:1};
  r.id=mySid;r.emit=(t,x)=>{if(!r.dead)send({t,d:x})};r.on=(t,f)=>{r.h[t]=f};r.presence=o=>{r.pres=o;if(!r.dead)send({t:'_p',d:o})};
  r.peers=()=>[{peer:r.id,isMe:true,kind:'viewer',presence:r.pres}].concat(Object.keys(r.ps).map(k=>({peer:k,isMe:false,kind:'viewer',presence:r.ps[k]})));
  r.leave=()=>{r.dead=1;send({t:'leave'});return Promise.resolve()};
  try{if(dbUn){dbUn();dbUn=null}dbRef=null}catch(_){}
  const pl=d.pl&&typeof d.pl=='object'?d.pl:{};for(const k in pl)if(k!=r.id&&k.length<64)r.ps[k]=cleanPres(pl[k]);
  guest=true;room=r;if(rm&&rm!==r){try{rm.dead=1}catch(_){}}rm=null;
  const keep=go.keep;go.keep=null;try{loadWorld(w,cleanEdits(d.edits||{}))}catch(e){console.error(e);say('World data could not be read');return}
  bindRoom(r);joinedW=w;if(keep&&keep.w==w&&Number.isFinite(keep.x)){P.x=keep.x;P.y=keep.y}
  try{ENV7.set(d.wx||'default',{instant:true})}catch(_){}
  try{renderWorlds()}catch(_){}}
 function toOffline(){retry=false;if(ws){const w=ws;ws=null;try{w.onclose=null;w.close()}catch(_){}}auth=null;drop();clearInterval(hbT);clearTimeout(rt);setSt('offline');try{_enterLocal('plaza')}catch(_){}}
 // ---- legacy entry points rebound to the network layer
 const _enterLocal=n=>{leaveNet();loadWorld(n);try{ENV7.set(X6.wx&&X6.wx[cur]||'default',{instant:true})}catch(_){}};
 enterWorld=function(n){n=String(n||'plaza').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16)||'plaza';
  if(st=='online'){if(joinedW==n&&entered){menuEl.style.display='none';return}menuEl.style.display='none';go(n,false);return}
  if(st=='connecting'||st=='reconnecting'){say('Still connecting to the server… playing locally for now')}
  _enterLocal(n)};
 leaveNet=function(){if(room){room.dead=1;send({t:'leave'})}if(rm){rm=null}room=null;joinedW=null;guest=false;roomCode=''};
 // ---- UI: world menu
 function render(){const el=$('wnet');if(!el)return;const online=st=='online';let h='<div class="netcard '+st+'"><div class="nrow"><span class="dot"></span><b>'+({offline:'Offline',connecting:'Connecting…',reconnecting:'Reconnecting…',online:'Online'}[st])+'</b>';
  if(online)h+='<span class="nsub">'+esc(auth.name)+(auth.kind=='guest'?' · guest':auth.owner?' · creator':'')+'</span>';else if(url)h+='<span class="nsub">'+esc(url.replace(/^wss?:\/\//,'').replace(/\/ws$/,''))+'</span>';h+='</div>';
  if(err&&!online)h+='<div class="nerr">'+esc(err)+'</div>';
  if(!online&&st=='offline')h+='<p class="nmsg">Worlds you open now are saved on this device only. Connect to a Rootbound server to play in shared worlds that stay saved for everyone.</p><div class="nrow"><input id="nsrv" placeholder="Server address, e.g. play.example.com" value="'+esc(lsGet('rbsrv')||'')+'" maxlength="120"><button id="nco">Connect</button></div>';
  if(online){h+='<div class="nrow">'+(auth.kind=='guest'?'<button id="nli">Sign in</button><button id="nre">Create account</button>':'<button id="nlo">Sign out</button>')+'<button id="ndc">Disconnect</button></div>'}
  h+='</div>';el.innerHTML=h;const b=id=>el.querySelector('#'+id);
  if(b('nco'))b('nco').onclick=()=>{const v=b('nsrv').value.trim();if(!v)return;lsSet('rbsrv',v);authDone.g=0;connect(norm(v),true)};
  if(b('nsrv'))b('nsrv').onkeydown=e=>{if(e.key=='Enter')b('nco').click()};
  if(b('ndc'))b('ndc').onclick=()=>{toOffline();say('Disconnected. Playing offline.')};
  if(b('nlo'))b('nlo').onclick=()=>{send({t:'logout',token:lsGet('rbtok')});lsSet('rbtok','');if(ws){const w=ws;ws=null;w.onclose=null;try{w.close()}catch(_){}}auth=null;drop();connect(url,true)};
  if(b('nli'))b('nli').onclick=()=>account('login');if(b('nre'))b('nre').onclick=()=>account('register')}
 async function account(mode){const reg=mode=='register';const v=await DLG7.open({title:reg?'Create a server account':'Sign in',text:reg?'Accounts let you create worlds and keep your name. Passwords are hashed on the server.':'Sign in with your server account.',fields:[{k:'n',label:'Account name',ph:'3-16 letters, numbers, _ or -',max:16,val:window.RB_SESS&&RB_SESS.id!='guest'?RB_SESS.name:''},{k:'p',label:'Password',type:'password',ph:reg?'at least 8 characters':'',max:128}],ok:reg?'Create account':'Sign in'});if(!v)return;
  authDone.g=1;send({t:reg?'register':'login',name:v.n,pass:v.p});
  // the answer arrives as an 'auth' message; a failure keeps the guest session
}
 // directory (public worlds)
 const _rw=renderWorlds;renderWorlds=function(){render();const live=$('wlive'),rec=$('wrec');if(!live)return;
  const row=(n,c,sub,tag)=>'<div class="wr" data-w="'+esc(n)+'"><span><b>'+esc(n)+'</b>'+(tag?' <small>'+esc(tag)+'</small>':'')+(sub?'<br><small>'+esc(sub)+'</small>':'')+'</span><span class="'+(c?'on':'')+'">'+(c?c+' online':'')+'</span></div>';
  if(st=='online'){live.innerHTML=list.length?list.map(x=>row(x.id,x.pop,(x.owner?'by '+x.owner+' · ':'')+(x.weather&&x.weather!='default'?x.weather+' · ':'')+'saved on server',x.hub?'hub':'')).join(''):'<div class="rb-empty">No public worlds yet. Type a name above to create the first one.</div>'}
  else live.innerHTML='<div class="rb-empty">Connect to a server to see public worlds.</div>';
  rec.innerHTML=recents().map(n=>row(n,0,st=='online'?'':'on this device',0)).join('')||'<div class="rb-empty">Nothing here yet. Type a world name above.</div>';
  for(const e of menuEl.querySelectorAll('.wr'))e.onclick=()=>enterWorld(e.dataset.w);if(st=='online')refresh()};
 setInterval(()=>{if(st=='online'&&menuEl.style.display!='none')refresh()},6000);
 const _om=openMenu;openMenu=function(s){_om(s);if(s=='mworlds'||!s){try{render()}catch(_){}}};
 // HUD status chip text
 function chip(n){if(st=='online'&&room)return (n||1)+' online · '+(auth&&auth.kind=='guest'?'guest':'server');if(st=='reconnecting')return 'reconnecting…';if(st=='connecting')return 'connecting…';return 'offline'}
 // boot: try to discover a server without ever blocking the game
 async function boot(){try{const u=await discover();if(u){authDone.g=0;connect(u,false)}else render()}catch(_){render()}}
 setTimeout(boot,50);
 return{get state(){return st},get auth(){return auth},get online(){return st=='online'},get owner(){return st=='online'&&!!(auth&&auth.owner)},send,go,chip,connect:u=>connect(norm(u),true),refresh,get room(){return room},get list(){return list},get url(){return url},toOffline,norm,get world(){return joinedW}}})();
