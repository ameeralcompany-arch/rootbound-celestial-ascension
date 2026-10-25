// ===== World events: happen in the world you are in (never in the Plaza) =====
// A shared clock decides them: every 4-minute slot, each world rolls (from its name + the slot number) whether an event happens, which one, where, and when.
// Everyone standing in the same world sees the same event at the same time without any host. Kinds:
//   meteor  - a shower of meteors: dodge the telegraphed impact rings, loot the gems they leave, they also hurt monsters
//   rift    - a cosmic rift opens and sends monsters; close it by defeating them all for a reward
//   spirit  - a blossom spirit appears; talk to it (E) for a full heal, gems and seeds
//   trader  - a mysterious merchant sells a bundle of blocks (offline/guest play; spends your own gems)
// Rewards given by events (gems, items) only apply in offline / guest play, because a signed-in online account's wallet belongs to the server.
const WEV7=(()=>{
 const SLOT=240000,KINDS=['meteor','rift','spirit','trader'],NAMES={meteor:'Meteor shower',rift:'Cosmic rift',spirit:'Blossom spirit',trader:'Mysterious merchant'},DUR={meteor:50000,rift:80000,spirit:100000,trader:110000};
 const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
 const mk=seed=>()=>(seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;
 const srv=()=>{try{return SHOP7.serverMode}catch(_){return false}};
 let ev=null,hud=null,claimed=new Set(),lastAnn='',riftMobs=[],riftT=0,riftDone=false,meteors=[],mDone=new Set(),traded=0,lastCheck=0;
 const groundY=x=>{let y=0;while(y<H-2&&!solidAt(x,y))y++;return y*T};
 function eventFor(n){const R=mk(hash(cur+'|'+n));if(R()>.75)return null;const kind=KINDS[(R()*KINDS.length)|0],off=15000+R()*(SLOT-DUR[kind]-30000),tx=8+Math.floor(R()*(W-16)),R2=mk(hash(cur+'#'+n));
  return{id:cur+':'+n,kind,t0:n*SLOT+off,t1:n*SLOT+off+DUR[kind],x:tx*T+T/2,tx,seed:hash(cur+'~'+n),R2}}
 function current(now){const n=Math.floor(now/SLOT);for(const k of[n-1,n]){const e=eventFor(k);if(e&&now>=e.t0&&now<e.t1)return e}return null}
 const fmt=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
 function ensureHud(){if(hud)return;hud=document.createElement('div');hud.style.cssText='position:fixed;top:128px;left:50%;transform:translateX(-50%);padding:6px 14px;border-radius:12px;background:rgba(30,20,60,.78);color:#fff;font:700 14px system-ui,sans-serif;z-index:40;pointer-events:none;display:none;white-space:nowrap';document.body.appendChild(hud)}
 function start(e){claimed.delete(e.id);riftMobs=[];riftT=0;riftDone=false;meteors=[];mDone=new Set();traded=0;
  if(e.kind=='meteor'){const R=mk(e.seed);for(let i=0;i<14;i++)meteors.push({id:i,at:e.t0+2500+i*3000+R()*1500,x:Math.max(2*T,Math.min((W-2)*T,e.x+(R()-.5)*T*28)),dur:1500})}
  try{say(NAMES[e.kind]+' has appeared in this world!');SFX7.tone(520,880,.4,'sine',.06);SFX7.tone(780,1320,.4,'sine',.05,.18)}catch(_){}}
 function reward(g,msg){if(!srv()&&g)gems+=g;try{say(msg+(g&&!srv()?'  +'+g+' gems':''));saveP()}catch(_){}}
 // ---- per frame
 function tick(dt){if(!entered||cur=='plaza'||creatorOn){ev=null;if(hud)hud.style.display='none';return}ensureHud();const now=Date.now();
  if(now-lastCheck>500){lastCheck=now;const e=current(now);if((e&&e.id)!==(ev&&ev.id)){ev=e;if(e)start(e);else{riftMobs=[];meteors=[]}}}
  if(ev&&now>ev.t1){ev=null;riftMobs=[];meteors=[]}if(!ev){hud.style.display='none';return}
  const left=ev.t1-now,dxp=ev.x-P.x,dir=Math.abs(dxp)<T*6?'here':dxp>0?'east →':'← west';
  hud.style.display='block';hud.textContent=NAMES[ev.kind]+'  ·  '+fmt(left)+'  ·  '+(dir=='here'?'you are close':Math.round(Math.abs(dxp)/T)+' blocks '+dir);
  if(ev.kind=='meteor')tickMeteor(now);else if(ev.kind=='rift')tickRift(dt,now)}
 function tickMeteor(now){for(const m of meteors){if(mDone.has(m.id)||now<m.at+m.dur)continue;mDone.add(m.id);const gy=groundY(Math.floor(m.x/T));
   try{burst(m.x,gy,'#ffb25a',26,260,6);burst(m.x,gy,'#fff',10,180,4,'p');rings.push({x:m.x,y:gy,c:'#ff9a3a',t:performance.now()});shake=Math.max(shake,.12);snd(70,.35,'sawtooth',.1,.4)}catch(_){}
   for(const q of mobs){if(q.hp>0&&Math.hypot(q.x-m.x,q.y+q.h/2-gy)<T*2.6){try{hurtMob(q,40,null,Math.atan2(q.y-gy,q.x-m.x))}catch(_){}}}
   if(Math.hypot(P.x-m.x,P.y+P.h/2-gy)<T*1.8&&iT<=0){P.hp-=10*(1-Math.min(.8,bonus().arm));iT=1;P.vx=(P.x>m.x?1:-1)*320;P.vy=-380;hurtF=.4}
   if(!srv()&&!claimed.has(ev.id+':'+m.id)){claimed.add(ev.id+':'+m.id);spawnDrop(m.x,gy-20,'gem',4+(m.id%4)*2);if(m.id%3==0)spawnDrop(m.x+10,gy-20,9,1)}}}
 function spawnRift(){const alive=riftMobs.filter(m=>m.hp>0&&mobs.includes(m)).length;if(alive>=4)return;const kinds=['bat','wraith','moth'],k=kinds[(Math.random()*3)|0],d=MK[k];if(!d)return;const x=ev.x+(Math.random()-.5)*T*4,y=groundY(ev.tx)-T*2.5-(d.fly?T:0);
  const m={k,x,y,w:d.w,h:d.h,vx:0,vy:0,hp:d.hp,fl:0,burn:0,slow:0,ph:Math.random()*6,t:1,dir:1,fade:0,g:false,wall:0,rift:1};mobs.push(m);riftMobs.push(m);try{burst(x,y+d.h/2,'#b88cff',12,160,5,'p')}catch(_){}}
 function tickRift(dt,now){if(riftDone)return;riftT+=dt;if(riftT>4.5&&riftMobs.length<8){riftT=0;spawnRift()}
  const dead=riftMobs.filter(m=>m.hp<=0||!mobs.includes(m)).length;if(dead>=6){riftDone=true;claimed.add(ev.id);reward(150,'The cosmic rift is closed!');try{const gy=groundY(ev.tx);for(let i=0;i<6;i++)spawnDrop(ev.x+(i-2.5)*14,gy-30,'gem',6);burst(ev.x,gy-70,'#d7c2ff',40,300,7,'p');SFX7.tone(660,1320,.4,'sine',.07)}catch(_){}}}
 // ---- drawing (behind characters)
 function draw(now){if(!ev||cur=='plaza')return;const t=now/1000,sx=ev.x-cam.x,gy=groundY(ev.tx)-cam.y;if(sx<-200||sx>cv.width/ZM+200)return;
  if(ev.kind=='rift'&&!riftDone){const py=gy-T*1.9,pu=.85+.15*Math.sin(t*3);g.save();g.translate(sx,py);g.globalCompositeOperation='lighter';
   let gr=g.createRadialGradient(0,0,6,0,0,90);gr.addColorStop(0,'rgba(210,180,255,.6)');gr.addColorStop(.5,'rgba(110,70,230,.35)');gr.addColorStop(1,'rgba(60,30,160,0)');g.fillStyle=gr;g.fillRect(-100,-100,200,200);
   for(let i=0;i<3;i++){g.save();g.rotate(t*(i%2?-1.4:1.1)+i);g.strokeStyle=['#b78cff','#7fe9ff','#ff8fd0'][i];g.globalAlpha=.8*pu;g.lineWidth=3;g.beginPath();g.ellipse(0,0,46-i*8,17+i*6,0,0,6.3);g.stroke();g.restore()}
   g.fillStyle='#fff';for(let i=0;i<10;i++){const a=t*2+i*.63,r=(1-((t*.7+i*.1)%1))*70;g.globalAlpha=.7;g.fillRect(Math.cos(a)*r,Math.sin(a)*r*.6,2.4,2.4)}g.restore()}
  if(ev.kind=='meteor'){const d=Date.now();for(const m of meteors){if(mDone.has(m.id))continue;const u=(d-(m.at))/m.dur;if(u<0)continue;const gx=m.x-cam.x,gyy=groundY(Math.floor(m.x/T))-cam.y;
    g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,120,60,'+(.35+.4*u)+')';g.lineWidth=3;g.beginPath();g.ellipse(gx,gyy,T*(.8+1.8*(1-u)),T*.28,0,0,6.3);g.stroke();
    const mx2=gx+(1-u)*220,my2=gyy-(1-u)*760;let gr=g.createRadialGradient(mx2,my2,2,mx2,my2,26);gr.addColorStop(0,'#fff4c8');gr.addColorStop(.4,'#ff9a3a');gr.addColorStop(1,'rgba(255,60,20,0)');g.fillStyle=gr;g.fillRect(mx2-30,my2-30,60,60);g.strokeStyle='rgba(255,170,80,.5)';g.lineWidth=8;g.beginPath();g.moveTo(mx2,my2);g.lineTo(mx2+70,my2-230);g.stroke();g.restore()}}
  if(ev.kind=='spirit'&&!claimed.has(ev.id)){const py=gy-T*1.7+Math.sin(t*1.6)*8;g.save();g.translate(sx,py);g.globalCompositeOperation='lighter';let gr=g.createRadialGradient(0,0,4,0,0,60);gr.addColorStop(0,'rgba(255,200,225,.7)');gr.addColorStop(1,'rgba(255,150,200,0)');g.fillStyle=gr;g.fillRect(-60,-60,120,120);g.globalCompositeOperation='source-over';
   g.fillStyle='#ffe9f2';g.strokeStyle='#f08fb4';g.lineWidth=2;g.beginPath();g.moveTo(-14,10);g.quadraticCurveTo(-18,-18,0,-20);g.quadraticCurveTo(18,-18,14,10);g.quadraticCurveTo(7,4,0,12);g.quadraticCurveTo(-7,4,-14,10);g.fill();g.stroke();g.fillStyle='#4a2a45';g.beginPath();g.ellipse(-5,-6,2,3,0,0,6.3);g.ellipse(5,-6,2,3,0,0,6.3);g.fill();g.fillStyle='rgba(255,120,160,.5)';g.beginPath();g.ellipse(-9,-1,3,2,0,0,6.3);g.ellipse(9,-1,3,2,0,0,6.3);g.fill();
   for(let i=0;i<6;i++){const a=t*1.3+i*1.05;g.fillStyle='#ffc9db';g.beginPath();g.ellipse(Math.cos(a)*28,Math.sin(a)*14+4,3,1.8,a,0,6.3);g.fill()}g.restore();label(sx,py-34,'Press E')}
  if(ev.kind=='trader'&&traded<3){const py=gy;g.save();g.translate(sx,py);g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(0,0,24,6,0,0,6.3);g.fill();g.fillStyle='#3b2d5e';g.strokeStyle='#1a1230';g.lineWidth=2;g.beginPath();g.moveTo(-17,0);g.quadraticCurveTo(-20,-34,-6,-52);g.quadraticCurveTo(0,-58,6,-52);g.quadraticCurveTo(20,-34,17,0);g.closePath();g.fill();g.stroke();g.fillStyle='#f4d68a';g.beginPath();g.ellipse(0,-40,6,5,0,0,6.3);g.fill();g.fillStyle='#1a1230';g.beginPath();g.arc(-2,-40,1.2,0,6.3);g.arc(3,-40,1.2,0,6.3);g.fill();
   g.strokeStyle='#8a6a3a';g.lineWidth=2;g.beginPath();g.moveTo(20,-30);g.lineTo(20,-2);g.stroke();g.globalCompositeOperation='lighter';const fl=.7+.3*Math.sin(t*6);let gr=g.createRadialGradient(20,-34,2,20,-34,34);gr.addColorStop(0,'rgba(255,210,120,'+.8*fl+')');gr.addColorStop(1,'rgba(255,170,60,0)');g.fillStyle=gr;g.fillRect(-14,-70,70,70);g.restore();label(sx,py-70,'E: bundle 250 gems ('+(3-traded)+' left)')}}
 function label(x,y,txt){g.save();g.font='700 12px system-ui,sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.65)';g.fillStyle='#fff';g.strokeText(txt,x,y);g.fillText(txt,x,y);g.restore()}
 // ---- E interaction
 function interactEv(){if(!ev||cur=='plaza'||creatorOn)return false;const gy=groundY(ev.tx);if(Math.hypot(P.x-ev.x,P.y+P.h/2-(gy-T))>T*3.2)return false;
  if(ev.kind=='spirit'&&!claimed.has(ev.id)){claimed.add(ev.id);P.hp=maxHP();reward(80,'The blossom spirit smiles. You feel fully restored.');if(!srv())addI(101,2);try{burst(ev.x,gy-T*1.7,'#ffc9db',34,240,6,'p');SFX7.tone(700,1400,.4,'sine',.06)}catch(_){}return true}
  if(ev.kind=='trader'&&traded<3){if(srv()){try{say('The merchant only trades in offline / guest play.')}catch(_){}return true}if(gems<250){try{say('The merchant wants 250 gems.')}catch(_){}return true}gems-=250;traded++;const pool=[1,3,7,8,11,12,13,14,16,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59],k=pool[(Math.random()*pool.length)|0],n=8+((Math.random()*8)|0);addI(k,n);try{say('Bought a bundle: '+n+' x '+BLK[k][0]);saveP();SFX7.tone(500,900,.2,'triangle',.06)}catch(_){}return true}
  return false}
 {const _i=interact;interact=function(){if(!dlgOpen&&interactEv())return;return _i.apply(this,arguments)}}
 {const _et=evTick;evTick=function(dt){_et(dt);try{tick(dt)}catch(_){}}}
 {const _dn=drawNPCs;drawNPCs=function(now){try{draw(now)}catch(_){}return _dn(now)}}
 return{get meteors(){return meteors},SLOT,eventFor,current,get ev(){return ev},names:NAMES,force(kind){const e=eventFor(0)||{};const now=Date.now();ev={id:cur+':force:'+now,kind,t0:now,t1:now+DUR[kind],x:Math.max(5*T,Math.min((W-5)*T,P.x+T*8)),tx:0,seed:now&0xffff};ev.tx=Math.floor(ev.x/T);start(ev);lastCheck=now+1e9;return ev},tick,interactEv,claimed}})();
