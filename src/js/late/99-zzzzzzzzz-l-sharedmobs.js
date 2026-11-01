// ===== MOB14: monsters are shared online. Everyone in a world sees and fights the same ones. The server picks one player's computer as the host of the world's
// monsters: it spawns them around every player, moves each one toward whichever player is nearest, and sends their positions 5 times a second. The others
// draw those, feel their contact damage themselves and tell the host what they hit. Whoever lands the killing blow gets the reward. If the host leaves or goes
// into a private world boss fight, the server picks the next player and the monsters carry on. Personal ones stay personal: bosses, letter wardens, totem waves,
// rifts and vault guards. Monster projectiles only hurt the player they were fired at. Nothing changes offline, or for someone alone in a world (no messages). =====
const MOB14=(()=>{
 const base=window.UPD0,push=Array.prototype.push,R=Math.random,SEND=.2;
 let host='',seq=Date.now()%1e9,nospawn=false,sendT=0,away=false;const pt={};
 const on=()=>!!(rm&&rm.net&&cur!='plaza'),isHost=()=>on()&&host===rm.id,inVoid=()=>{try{return !!WBOSS13.void}catch(_){return false}};
 const personal=m=>!!(m.boss||m.wv!=null||m.rift||m.elite||m.lg||m.vg);
 const others=()=>{const L=[];for(const p of rm.peers()){const q=p.presence;if(!p.isMe&&q&&Number.isFinite(+q.x)&&Number.isFinite(+q.y)&&(q.x||q.y))L.push({id:p.peer,x:+q.x,y:+q.y})}return L};
 const canSpawnAt=(x,y)=>{try{const dp=depthAt(x,y+P.h/2);return dp>=6||night>.62}catch(_){return false}};
 // run something as if you stood where another player stands, with no effect on you
 function asPlayer(q,f){const s={x:P.x,y:P.y,vx:P.vx,vy:P.vy,hp:P.hp,g:P.g},a=iT,b=hurtF,c=shake,d=spawnT;try{iT=9;P.x=q.x;P.y=q.y;P.vx=P.vy=0;f()}finally{Object.assign(P,s);iT=a;hurtF=b;shake=c;spawnT=d}}
 function hostStep(_u,self,dt){const peers=inVoid()?[]:others();if(!peers.length){const r=_u.apply(self,[dt]);return r}
  // monsters also appear around the other players
  for(const q of peers){pt[q.id]=(pt[q.id]==null?rnd(2,5):pt[q.id])-dt;if(pt[q.id]>0)continue;let made=false;if(mobs.filter(m=>!personal(m)&&Math.hypot(m.x-q.x,m.y-q.y)<T*30).length<8&&canSpawnAt(q.x,q.y))asPlayer(q,()=>{try{made=!!spawnMob()}catch(_){}});pt[q.id]=made?rnd(7,13):rnd(1.5,3)}
  // each monster acts for the player nearest to it
  const groups=new Map(),mine=[];for(const m of mobs){if(personal(m)){mine.push(m);continue}let best=null,bd=Math.hypot(P.x-m.x,P.y-m.y);for(const q of peers){const dd=Math.hypot(q.x-m.x,q.y-m.y);if(dd<bd){bd=dd;best=q}}if(best){if(!groups.has(best))groups.set(best,[]);groups.get(best).push(m)}else mine.push(m)}
  mobs.length=0;push.apply(mobs,mine);const r=_u.apply(self,[dt]);let all=mobs.slice();
  nospawn=true;try{for(const[q,L]of groups){mobs.length=0;push.apply(mobs,L);asPlayer(q,()=>{try{base(dt)}catch(e){if(!hostStep.e){hostStep.e=1;console.error('MOB14',e)}}});all=all.concat(mobs)}}finally{nospawn=false}
  mobs.length=0;push.apply(mobs,all);
  sendT-=dt;if(sendT<=0){sendT=SEND;const rows=[];for(const m of mobs){if(personal(m)||m.dead)continue;if(!m.sid)m.sid=++seq;rows.push([m.sid,m.k,Math.round(m.x),Math.round(m.y),Math.round(m.vx||0),Math.round(m.vy||0),Math.ceil(m.hp),m.dir>0?1:-1,m.g?1:0,m.dmg|0]);if(rows.length>=70)break}rm.emit('mb',rows)}
  return r}
 function guestStep(_u,self,dt){const nets=[],keep=[];for(const m of mobs){if(m.sid)nets.push(m);else if(personal(m))keep.push(m)}mobs.length=0;push.apply(mobs,keep);nospawn=true;let r;try{r=_u.apply(self,[dt])}finally{nospawn=false}
  const k=Math.min(1,dt*12);for(const m of nets){const q=m._t,d=MK[m.k];if(q){m.x+=(q.x-m.x)*k;m.y+=(q.y-m.y)*k;m.vx=q.vx;m.vy=q.vy;m.dir=q.dir;m.g=q.g}m.ph+=dt;m.fl-=dt;m.fade=Math.min(1,m.fade+dt*2);if(m.dead)continue;
   if(!inVoid()&&d&&Math.abs(P.x-m.x)<(P.w+m.w)/2&&P.y<m.y+m.h&&P.y+P.h>m.y){if(P.vy>150&&P.y+P.h<m.y+m.h*.7){P.vy=-560;hurtMob(m,12,null,-1.57);try{snd(420,.15,'triangle',.07,1.8)}catch(_){}}else if(iT<=0){P.hp-=(m.dmg||d.dmg||6)*(1-Math.min(.8,bonus().arm+(guard>0?.5:0)));iT=1.1;P.vx=Math.sign(P.x-m.x||1)*260;P.vy=-300;hurtF=.4;shake=Math.max(shake,.1);try{snd(200,.25,'sine',.04,.6)}catch(_){}}}}
  push.apply(mobs,nets.filter(m=>!m.dead));return r}
 function onRows(rows){if(!on()||isHost()||inVoid()||!Array.isArray(rows))return;const seen=new Set();for(const a of rows){if(!Array.isArray(a))continue;const id=+a[0],kk=String(a[1]),d=MK[kk],x=+a[2],y=+a[3];if(!d||!Number.isFinite(id)||!Number.isFinite(x)||!Number.isFinite(y))continue;seen.add(id);let m=mobs.find(q=>q.sid===id);
   if(!m){m={k:kk,x,y,w:d.w,h:d.h,vx:0,vy:0,hp:+a[6]||d.hp,fl:0,burn:0,slow:0,ph:R()*6,t:1,dir:a[7],fade:0,g:!!a[8],wall:0,sid:id};if(a[9])m.dmg=+a[9];push.call(mobs,m)}
   m._t={x,y,vx:+a[4]||0,vy:+a[5]||0,dir:a[7]>0?1:-1,g:!!a[8]};const h=+a[6];if(Number.isFinite(h)&&h<m.hp)m.hp=h}
  for(let i=mobs.length-1;i>=0;i--){const m=mobs[i];if(m.sid&&!seen.has(m.sid)){try{burst(m.x,m.y+m.h/2,MK[m.k].c,10,90,4,'p')}catch(_){}mobs.splice(i,1)}}}
 function onHit(d,from){if(!isHost()||!d)return;const m=mobs.find(q=>q.sid===+d.id);if(!m||m.dead)return;m.hp-=+d.n||0;m.fl=.15;if(m.hp<=0||d.k)m.dead=true}
 {const _u=updMobs;updMobs=function(dt){if(!on())return _u.apply(this,arguments);const v=inVoid();if(v!==away){away=v;NET7.send({t:'mb_away',d:v})}return isHost()?hostStep(_u,this,dt):host?guestStep(_u,this,dt):_u.apply(this,arguments)}}
 // while someone else hosts, nothing spawns here; while you host, spawns around other players go through asPlayer
 {const _sm=spawnMob;spawnMob=function(){if(on()&&host&&(!isHost()||nospawn))return false;return _sm.apply(this,arguments)}}
 {const _h=hurtMob;hurtMob=function(m,d,w,ang){if(!m||!m.sid||!on()||isHost())return _h.apply(this,arguments);const h0=m.hp,was=m.dead,r=_h.apply(this,arguments),n=Math.max(0,h0-(m.hp||0));if(n>0||(m.dead&&!was))rm.emit('mh',{id:m.sid,n,k:(m.dead||m.hp<=0)?1:0});return r}}
 {const _br=bindRoom;bindRoom=function(r){if(r&&r.net){host='';away=false;r.on('mb',x=>onRows(x.data));r.on('mh',x=>onHit(x.data,x.peer));r.on('mhost',x=>{const was=host;host=String(x.data&&x.data.sid||'');if(host===r.id&&was!==host)for(const m of mobs)delete m._t})}return _br.apply(this,arguments)}}
 return{get host(){return host},get isHost(){return isHost()},personal}})();
