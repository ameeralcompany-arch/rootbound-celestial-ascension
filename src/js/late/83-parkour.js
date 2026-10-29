// ===== Sky Run: a parkour course of floating platforms high in the sky above the Plaza (PLZ7.COURSE: rows 40 -> 13, at least
// 25 rows above every roof, so it never crowds the town). Way up: the Sky Beam on the dais in Gate Square - stand still on the glowing
// pad (or press E) and the beam lifts you to START. Climb east to the Sky Shrine (FINISH); its RETURN pad glides you back down.
// The timer runs while you stay on the course; touching the town ground stops it. Best time is saved. First finish under 90 s pays
// gems (offline/guest play only) and unlocks the "Sky Runner" title. PL keeps DX-relative x (PL[k].x + DX = first tile column).
const RUN7=(()=>{
 const S=PLZ7.S,C=PLZ7.COURSE,N=C.length,PL=C.map(p=>({x:p.x0-DX,y:p.row,w:p.w})),B=PLZ7.BEAM,RT=PLZ7.RET;
 let state='idle',t0=0,best=null,title=false,hudEl=null,toast=0,charge=0,ride=null;try{const o=JSON.parse(localStorage.getItem('rbrun')||'{}');best=o.b||null;title=!!o.t}catch(_){}
 const save=()=>{try{localStorage.setItem('rbrun',JSON.stringify({b:best,t:title}))}catch(_){}},srv=()=>{try{return SHOP7.serverMode}catch(_){return false}};
 function ensureHud(){if(hudEl)return;hudEl=document.createElement('div');hudEl.style.cssText='position:fixed;top:78px;left:50%;transform:translateX(-50%);padding:6px 16px;border-radius:12px;background:rgba(20,18,40,.72);color:#fff;font:700 18px system-ui,sans-serif;letter-spacing:.06em;z-index:40;pointer-events:none;display:none';document.body.appendChild(hudEl)}
 const fmt=ms=>(ms/1000).toFixed(2)+'s';
 function platAt(){if(!P.g)return-1;const fy=Math.round((P.y+P.h)/T);for(let k=0;k<N;k++){const p=PL[k];if(fy==p.y&&P.x>=(DX+p.x)*T-8&&P.x<=(DX+p.x+p.w)*T+8)return k}return-1}
 // pads: the Sky Beam (street level) and the Sky Shrine's RETURN pad
 const feet=()=>Math.round((P.y+P.h)/T);
 function pad(){if(cur!='plaza'||!P.g||ride)return null;const f=feet();if(f==S&&P.x>=B.x0*T&&P.x<=(B.x1+1)*T)return'up';if(f==RT.row&&P.x>=RT.x0*T&&P.x<=(RT.x1+1)*T)return'down';return null}
 function launch(kind){if(ride)return;const up=kind=='up',x=up?(B.x0+B.x1+1)/2*T:(RT.x0+RT.x1+1)/2*T,y0=P.y,y1=up?C[0].row*T-P.h-1:S*T-P.h-1;ride={x,x1:up?(C[0].x0+1.5)*T:x,y0,y1,t:0,dur:up?1.25:1.6,up};charge=0;
  try{flash=Math.max(flash||0,.25)}catch(_){}try{VFX.wave(P.x,P.y+P.h/2,'#9ff3ff',70,.5,.5)}catch(_){}try{burst(P.x,P.y+P.h,'#bff8ff',22,220,5,'p')}catch(_){}try{SFX7.tone(up?420:880,up?1260:300,.5,'sine',.06)}catch(_){}say(up?'The Sky Beam lifts you to the Sky Run!':'Gliding back down to town...')}
 function rideTick(dt){const r=ride;r.t+=dt;const u=Math.min(1,r.t/r.dur),e=r.up?1-Math.pow(1-Math.min(1,u/.8),3):u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,s=r.up&&u>.8?(u-.8)/.2:0;/* up: rise beside START, then hop onto it */P.x=r.x+(r.x1-r.x)*s*s*(3-2*s);P.y=r.y0+(r.y1-r.y0)*e-(r.up?Math.sin(s*Math.PI)*18:0);P.vx=0;P.vy=0;P.g=false;try{iT=Math.max(iT,.3)}catch(_){}
  if(Math.random()<dt*40)try{parts.length<480&&parts.push({x:P.x+rnd(-14,14),y:P.y+rnd(10,P.h),vx:rnd(-20,20),vy:r.up?rnd(80,160):rnd(-160,-80),l:rnd(.4,.8),c:r.up?'#bff8ff':'#ffe9a8',s:rnd(2,4),r:0,k:'p'})}catch(_){}
  if(u>=1){P.y=r.y1;P.vy=r.up?0:120;ride=null}}
 function tick(now,dt){if(!entered)return;ensureHud();
  const inPlaza=cur=='plaza';if(!inPlaza){hudEl.style.display='none';state='idle';ride=null;charge=0;return}
  if(ride){rideTick(dt);return}
  const pd=pad();if(pd&&Math.abs(P.vx)<30&&!dlgOpen){charge+=dt;if(charge>=1)launch(pd)}else charge=Math.max(0,charge-dt*2);
  // the legacy HUD refreshes the E-prompt on a 120 ms timer; on a pad we overwrite it every frame (before paint, so no flicker)
  if(pd&&!dlgOpen&&!creatorOn&&menuEl.style.display=='none'){const pr=document.getElementById('prompt');if(pr){pr.style.display='block';const s=pd=='up'?'Stand still on the Sky Beam (or press E) to fly up to the Sky Run':'Stand still (or press E) to glide back down to town';if(pr.textContent!=s)pr.textContent=s}}
  const k=platAt(),onGround=P.g&&(P.y+P.h)>=(S*T-4);
  if(k==0&&state!='run'){state='run';t0=now;toast=now+1200;try{SFX7.tone(520,780,.15,'sine',.05)}catch(_){}}
  else if(k==0&&state=='run'){t0=now}
  else if(state=='run'&&k==N-1){const ms=now-t0;state='done';let msg='Sky Run finished: '+fmt(ms);if(best==null||ms<best){best=ms;msg+=' (new best!)'}
   if(ms<90000&&!title){title=true;if(!srv())gems+=150;msg+='  Title: Sky Runner'+(srv()?'':'  +150 gems')}save();try{say(msg);saveP();burst(P.x,P.y,'#ffd24a',30,220,6,'p');SFX7.tone(660,1320,.35,'sine',.07)}catch(_){}toast=now+3500}
  else if(state=='run'&&onGround){state='idle';toast=now+1500;hudEl.textContent='Fell! Ride the Sky Beam to try again';}
  else if(state=='done'&&onGround){state='idle'}
  if(state=='run'){hudEl.style.display='block';hudEl.textContent='Sky Run  '+fmt(now-t0)+(best?'   best '+fmt(best):'')}
  else if(now<toast){hudEl.style.display='block';if(state=='done')hudEl.textContent='Finished!  best '+fmt(best)}
  else hudEl.style.display='none'}
 function draw(now){if(cur!='plaza')return;const t=now/1000;for(const[k,txt,col]of[[0,'START','#7ff5e8'],[N-1,'FINISH','#ffd24a']]){const p=PL[k],sx=(DX+p.x+p.w/2)*T-cam.x,sy=p.y*T-cam.y-(k?236:150)-Math.sin(t*2)*3;if(sx<-80||sx>cv.width/ZM+80)continue;g.save();g.font='800 15px system-ui,sans-serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.6)';g.fillStyle=col;g.strokeText(txt,sx,sy);g.fillText(txt,sx,sy);g.restore()}
  if(charge>0&&!ride){const a=Math.min(1,charge);g.save();g.strokeStyle='rgba(160,255,245,.9)';g.lineWidth=4;g.beginPath();g.arc(P.x-cam.x,P.y+P.h/2-cam.y,34,-Math.PI/2,-Math.PI/2+a*Math.PI*2);g.stroke();g.restore()}}
 // E on a pad launches right away
 {const _i=interact;interact=function(){if(!dlgOpen&&cur=='plaza'&&!creatorOn&&menuEl.style.display=='none'){const pd=pad();if(pd){launch(pd);return}}return _i.apply(this,arguments)}}
 {const _dn=drawNPCs;drawNPCs=function(now){try{draw(now)}catch(_){}return _dn(now)}}
 {const _u=update;update=function(dt){_u(dt);try{tick(performance.now(),Math.min(.1,dt||0))}catch(e){if(!tick.e){tick.e=1;console.error('RUN7',e)}}}}
 return{PL,N,tick,pad,launch,get riding(){return!!ride},get charge(){return charge},get state(){return state},get best(){return best},get title(){return title},reset(){best=null;title=false;state='idle';ride=null;charge=0;save()}}})();
