// ===== V6 Creator console. TRUST MODEL (honest): there is no game server. Authority = the browser that HOSTS the room (and, offline,
// the local player over their own sandbox). Guests can never run these commands: the host never accepts admin ops from guests, and guests only
// obey tp/kick/notice that arrive from the host's own peer id. A real MMO "CEO/Superadmin" needs accounts + roles verified on a backend. =====
const ADMIN6=(()=>{let on=false;const log=[];const L=s=>{log.push(new Date().toISOString().slice(11,19)+' '+s);if(log.length>100)log.shift()};
 const allowed=()=>!rm||rm.isHost;
 const A=a=>a.slice(2);const num=(v,lo,hi)=>{v=+v;return Number.isFinite(v)?Math.max(lo,Math.min(hi,v|0)):null};
 const P2=n=>SOC6.byName(n);
 function toPeer(op,peer,extra){if(rm&&rm.isHost)rm.emit('x',Object.assign({op,to:peer},extra||{}))}
 function cmd(t){const a=t.trim().split(/\s+/),c=a[0].toLowerCase();if(c=='/admin'){if(!allowed()){say('Only the room host can use the creator console');return true}on=a[1]!='off';say('Creator console '+(on?'ON (local trust model, see README)':'off'));L('console '+(on?'on':'off'));return true}
  if(c!='/a')return false;if(!on){say('Type /admin on first (room host / offline sandbox only)');return true}if(!allowed()){say('Only the room host can use this');return true}
  const sub=(a[1]||'help').toLowerCase(),r=A(a);let m='';
  const need=()=>{if(!meta){m='This world has no World Lock/owner data yet';return false}return true};
  switch(sub){
  case 'help':m='/a spawn id [n] · gems n · level n · tp x y · tpw world · bring name · goto name · kick name · ban name · unban name · mute name mins · perm name builder|trusted|visitor · weather state|auto · door · inspect · newworld name · delworld name · log';break;
  case 'spawn':{const i=num(r[0],1,999),n=num(r[1]||1,1,999);if(!i||!(BLK[i]||MAT[i]||BLK[i-100])){m='Unknown item id';break}addI(i,n);m='Spawned '+n+' x '+OBJ6.itemName(i);break}
  case 'gems':{const n=num(r[0],-1e6,1e6);if(n==null){m='gems <n>';break}gems=Math.max(0,gems+n);m='Gems '+gems;break}
  case 'level':{const n=num(r[0],1,999);if(n==null){m='level <1-999>';break}lvl=n;m='Level set to '+n;break}
  case 'tp':{const x=num(r[0],1,W-2),y=num(r[1],1,H-2);if(x==null||y==null){m='tp x y (tiles)';break}P.x=x*T+T/2;P.y=y*T-P.h;P.vx=P.vy=0;m='Teleported';break}
  case 'tpw':{const w=String(r[0]||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16);if(!w){m='tpw <world>';break}enterWorld(w);m='Entering '+w;break}
  case 'bring':{const p=P2(r[0]);if(!p){m='Player not found';break}toPeer('tp',p.peer,{x:P.x|0,y:P.y|0});m='Brought '+p.presence.n;break}
  case 'goto':{const p=P2(r[0]);if(!p){m='Player not found';break}P.x=p.presence.x;P.y=p.presence.y;m='Went to '+p.presence.n;break}
  case 'kick':{const p=P2(r[0]);if(!p){m='Player not found';break}toPeer('kick',p.peer);setTimeout(()=>{try{const c=rm.conns.find(c=>c.peer==p.peer);c&&c.close()}catch(_){}},400);m='Kicked '+p.presence.n;break}
  case 'ban':{if(!need())break;const p=P2(r[0]);if(!p||!p.presence.uid){m='Player not found';break}const b=(meta.b||[]).filter(x=>x!=p.presence.uid);b.push(p.presence.uid);setMeta(Object.assign({},meta,{b:b.slice(-32)}));toPeer('kick',p.peer);setTimeout(()=>{try{const c=rm.conns.find(c=>c.peer==p.peer);c&&c.close()}catch(_){}},400);m='Banned '+p.presence.n;break}
  case 'unban':{if(!need())break;const n=String(r[0]||'').toLowerCase();const hit=(meta.b||[]).filter(x=>x.toLowerCase()==n);if(!hit.length){m='Use the uid shown in /a log or /a unban all';if(n=='all'){setMeta(Object.assign({},meta,{b:[]}));m='All bans cleared'}break}setMeta(Object.assign({},meta,{b:meta.b.filter(x=>x.toLowerCase()!=n)}));m='Unbanned';break}
  case 'mute':{const p=P2(r[0]);const mins=num(r[1]||5,1,1440);if(!p){m='Player not found';break}SOC6.mute[p.presence.uid||p.peer]=Date.now()+mins*60000;m='Muted '+p.presence.n+' for '+mins+' min';break}
  case 'perm':{if(!need())break;const p=P2(r[0]);const lv=(r[1]||'').toLowerCase();if(!p||!p.presence.uid){m='Player not found';break}const u=p.presence.uid;const strip=x=>(x||[]).filter(y=>y!=u);const nm=Object.assign({},meta,{f:strip(meta.f),t:strip(meta.t)});if(lv=='builder')nm.f.push(u);else if(lv=='trusted')nm.t.push(u);else if(lv!='visitor'){m='builder | trusted | visitor';break}setMeta(nm);m=p.presence.n+' is now '+lv;break}
  case 'weather':{const s=(r[0]||'').toLowerCase();if(s=='auto'){WX6.force=null;m='Weather: auto'}else if(WX_STATES.includes(s)){WX6.force=s;m='Weather: '+s}else m='States: '+WX_STATES.join(', ')+', auto';break}
  case 'door':{const n=OBJ6.near();if(!n||ODEF[n.o.t].cat!='door'){m='Stand next to a door';break}OBJ6.setState(n.k,{open:1});OBJ6.feedback(n.o,n.k,true);m='Door test: '+JSON.stringify(n.o.c);break}
  case 'inspect':{const n=OBJ6.near();m=n?ODEF[n.o.t].n+' @'+(n.k%W)+','+(n.k/W|0)+' '+JSON.stringify(n.o.c).slice(0,160):'Nothing nearby';break}
  case 'newworld':{const w=String(r[0]||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16);if(!w){m='newworld <name>';break}enterWorld(w);m='Created/entered '+w;break}
  case 'delworld':{const w=String(r[0]||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16);if(!w||w=='plaza'){m='Cannot delete that';break}if(w==cur){m='Leave the world first';break}try{localStorage.removeItem('rbw_'+w);m='Deleted local data of '+w}catch(_){m='Failed'}break}
  case 'log':m=log.slice(-6).join(' | ')||'(empty)';break;
  default:m='Unknown. /a help'}
  say(m);if(sub!='help'&&sub!='log')L(t.slice(0,60)+' -> '+m.slice(0,50));return true}
 // guests obey ONLY the host peer
 const _r=SOC6.remote;SOC6.remote=function(d,from){if(d&&['tp','kick','notice'].includes(d.op)){if(rm&&!rm.isHost&&rm.hc&&from===rm.hc.peer&&d.to===rm.id){if(d.op=='tp'){P.x=Math.max(0,Math.min(W*T-20,+d.x||0));P.y=Math.max(0,Math.min(H*T,+d.y||0));P.vx=P.vy=0;say('The host teleported you')}else if(d.op=='kick'){say('You were removed by the host');setTimeout(()=>leaveNet(1),300)}}return}return _r(d,from)};
 return{cmd,log,get on(){return on}}})();
