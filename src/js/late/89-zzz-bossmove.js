// ===== BMOVE12: bosses move. Each boss gets its own movement on top of its attacks (the old shared hop / walk / drift AI no longer drives them):
// Verdant Warden stomps in short hops and leaps across the arena (big landings shake the ground); Crystal Sovereign glides at casting range and
// teleports between crystal points along the floor; Eclipse Lord floats above you in a slow figure-eight and blinks to your other side;
// Magma Colossus strides at you with heavy steps and charges across the arena after a stomping wind-up; Abyssal Leviathan swims low in waves
// from wall to wall and surges up at you in an arc; Tempest Roc circles high and swoops through you, then climbs back to the top.
// They stand still while winding up, staggered or held by a cinematic, face you, lean into their speed, bob as they stride and squash on
// landing. Walkers collide with blocks like any monster (and hop up steps); flyers slide along walls; everyone stays inside the arena.
// Cost: simple steering, a few tile checks per frame for one boss, no pathfinding; telegraph marks are drawn with plain strokes. =====
const BMOVE12=(()=>{
 const R=Math.random,rn=(a,b)=>a+R()*(b-a),cl=(v,a,b)=>v<a?a:v>b?b:v,TAU=Math.PI*2;
 const ar=()=>{try{const A=ARENA7.arena;return A&&!A.end?A:null}catch(_){return null}};
 const bid=m=>String(m.k).slice(5);
 const live=m=>m&&!m.dead&&m.hp>0&&mobs.includes(m);
 const cine=()=>{try{return BOSS10.kind=='in'}catch(_){return false}};
 const shk=v=>{try{if(!QM.reduce)shake=Math.max(shake,v)}catch(_){}};
 const tone=(a,b,d,ty,v,dl)=>{try{SFX7.tone(a,b,d,ty,v,dl)}catch(_){}};
 const gy=(x,y)=>{try{return BOSSX.gyAt(x,y)}catch(_){return y}};
 // where the boss may be: x of its centre, y of its top
 function box(m){const A=ar();if(A)return{l:A.x0+m.w/2+6,r:A.x1-m.w/2-6,t:A.y0+T*1.1,b:A.y1-m.h-2};return{l:Math.max(T*2,P.x-T*15),r:Math.min((W-2)*T,P.x+T*15),t:Math.max(0,P.y-T*12),b:P.y+T*6}}
 const blocked=m=>{try{return !!boxHit(m)}catch(_){return false}};
 const SPD=[1,1.15,1.3];
 // ---- movement primitives
 function walk(m,v,dir,sp,acc,dt){const tv=dir*sp;v.vx+=(tv-v.vx)*Math.min(1,acc*dt);step(m,v,dt)}
 function step(m,v,dt){const was=m.g;v.vy=Math.min(v.vy+1800*dt,1100);m.vx=v.vx;m.vy=v.vy;moveE(m,dt);v.vx=m.vx;v.vy=m.vy;
  if(m.wall&&m.g&&Math.abs(v.vx)>20){v.vy=-640;m.g=false}   // hop up steps and ledges
  const b=box(m);if(m.x<b.l){m.x=b.l;if(v.vx<0)v.vx=0}else if(m.x>b.r){m.x=b.r;if(v.vx>0)v.vx=0}
  if(!was&&m.g&&v.fall>420){land(m,v,v.fall)}v.fall=m.g?0:Math.max(v.fall||0,v.vy)}
 function land(m,v,f){v.sq=Math.min(1,f/900);if(f>650){shk(Math.min(.22,f/5000));try{VFX.wave(m.x,m.y+m.h,'#fff',m.w*1.4,.4,.3)}catch(_){}tone(70,45,.3,'sawtooth',.05)}
  try{burst(m.x,m.y+m.h,'#d8cfc0',f>650?14:6,160,5,'p')}catch(_){}}
 function fly(m,v,tx,ty,sp,acc,dt){const b=box(m);tx=cl(tx,b.l,b.r);ty=cl(ty,b.t,b.b);const dx=tx-m.x,dy=ty-m.y,d=Math.hypot(dx,dy)||1,s=Math.min(sp,d*2.4);
  v.vx+=(dx/d*s-v.vx)*Math.min(1,acc*dt);v.vy+=(dy/d*s-v.vy)*Math.min(1,acc*dt);glide(m,v,dt)}
 function glide(m,v,dt){const st=blocked(m);m.x+=v.vx*dt;if(!st&&blocked(m)){m.x-=v.vx*dt;v.vx*=-.3}m.y+=v.vy*dt;if(!st&&blocked(m)){m.y-=v.vy*dt;v.vy*=-.3}if(st)m.y-=90*dt;   // stuck in rock: drift out
  const b=box(m);m.x=cl(m.x,b.l,b.r);m.y=cl(m.y,b.t,b.b);m.vx=v.vx;m.vy=v.vy}
 // a free spot for a teleport (centre x, top y) or null
 function spot(m,x,y){const ox=m.x,oy=m.y;m.x=x;m.y=y;const bad=blocked(m);m.x=ox;m.y=oy;return bad?null:{x,y}}
 const floorTop=(m,x)=>{const A=ar(),from=A?Math.max(A.y0,m.y-T*2):m.y-T*2;return Math.min(gy(x,from),A?A.y1:1e9)-m.h-1};
 // ---- per boss
 const AI={
  warden(m,v,dt,s){m.dir=Math.sign(P.x-m.x)||m.dir||1;
   if(m.g&&!v.air){v.vx*=Math.max(0,1-dt*10);v.t-=dt*s;if(v.t<=0&&!(m.wind>0)){const dx=P.x-m.x,far=Math.abs(dx)>T*9,big=far||(++v.n%4==0);
     if(big){const tx=cl(P.x+(Math.sign(dx)||1)*rn(1.5,4)*T,box(m).l,box(m).r);v.vy=-900;v.vx=cl((tx-m.x)/1.0,-720,720);v.big=1;tone(110,220,.25,'triangle',.04)}
     else{const away=Math.abs(dx)<T*2.5;v.vy=-520;v.vx=(away?-1:1)*(Math.sign(dx)||1)*Math.min(Math.abs(dx)/.6+60,300)*(away?.6:1);v.big=0}
     v.t=rn(.75,1.25);m.g=false}}
   step(m,v,dt)},
  sovereign(m,v,dt,s){m.dir=Math.sign(P.x-m.x)||1;
   if(v.tp){v.tp.t-=dt;if(R()<dt*40)try{VFX.mote(v.tp.x+rn(-30,30),v.tp.y+m.h*R(),'#bfeaff')}catch(_){}v.fade=Math.max(.15,v.tp.t/.6);
    if(v.tp.t<=0){try{VFX.shatter(m.x,m.y+m.h/2,['#dff6ff','#7fd8ff','#fff'],14)}catch(_){}m.x=v.tp.x;m.y=v.tp.y;v.vx=v.vy=0;v.tp=null;v.fade=1;try{VFX.wave(m.x,m.y+m.h,'#bfeaff',m.w*1.6,.45,.3)}catch(_){}tone(1200,1800,.2,'triangle',.03)}return}
   v.t-=dt*s;if(v.t<=0&&!(m.wind>0)&&m.g){v.t=rn(5.5,7.5);const A=ar(),b=box(m),n=5,c=[];for(let i=0;i<n;i++){const x=b.l+(b.r-b.l)*(i+.5)/n;if(Math.abs(x-m.x)<T*4)continue;const y=floorTop(m,x),p=spot(m,x,y);if(p)c.push(p)}
    c.sort((a,b2)=>Math.abs(Math.abs(a.x-P.x)-T*8)-Math.abs(Math.abs(b2.x-P.x)-T*8));if(c.length){v.tp={x:c[0].x,y:c[0].y,t:.6};tone(900,1400,.4,'sine',.025);return}}
   const dx=P.x-m.x,want=T*8,dir=Math.abs(dx)>want+T*1.5?Math.sign(dx):Math.abs(dx)<want-T*1.5?-Math.sign(dx):0;walk(m,v,m.wind>0?0:dir,95*s,3,dt)},
  eclipse(m,v,dt,s){v.ph+=dt;
   if(v.bl){v.bl.t-=dt;v.fade=Math.max(.1,v.bl.t/.45);if(R()<dt*40)try{VFX.mote(v.bl.x+rn(-34,34),v.bl.y+m.h*R(),'#b58cff')}catch(_){}
    if(v.bl.t<=0){try{VFX.burst(m.x,m.y+m.h/2,['#b58cff','#1a0f2e'],14,220,1,.5,10)}catch(_){}m.x=v.bl.x;m.y=v.bl.y;v.vx=v.vy=0;v.bl=null;v.fade=1;try{VFX.wave(m.x,m.y+m.h/2,'#b58cff',m.w*1.4,.4,1)}catch(_){}tone(300,90,.3,'sine',.04)}return}
   v.t-=dt*s;if(v.t<=0&&!(m.wind>0)){v.t=rn(5,7);const side=m.x<P.x?1:-1;for(let i=0;i<6;i++){const x=P.x+side*rn(5,8)*T,y=P.y-rn(2,6)*T,b=box(m),p=spot(m,cl(x,b.l,b.r),cl(y,b.t,b.b));if(p){v.bl={x:p.x,y:p.y,t:.45};tone(200,500,.3,'sine',.025);return}}}
   if(m.wind>0){v.vx*=1-Math.min(1,dt*4);v.vy*=1-Math.min(1,dt*4);glide(m,v,dt);return}
   const side=m.x<P.x?-1:1;fly(m,v,P.x+side*T*6+Math.sin(v.ph*.6)*T*2,P.y-T*3.2-m.h*.3+Math.sin(v.ph*1.2)*T*1.2,200*s,1.6,dt)},
  magma(m,v,dt,s){m.dir=Math.sign(P.x-m.x)||1;
   if(v.ch){const c=v.ch;c.t+=dt;if(c.t<c.tel){v.vx*=1-Math.min(1,dt*8);if(R()<dt*30)try{VFX.add(0,'#cfc6c0',m.x+rn(-m.w/2,m.w/2),m.y+m.h-4,rn(-40,40),-60,.6,10,5,{a:.5})}catch(_){}if(c.t%.28<dt)shk(.05);step(m,v,dt);return}
    if(!c.go){c.go=1;tone(80,140,.4,'sawtooth',.06)}v.vx=c.d*560*s;step(m,v,dt);c.run+=Math.abs(v.vx)*dt;if(R()<dt*40)try{burst(m.x-c.d*m.w*.4,m.y+m.h,'#ff8a3a',1,90,4,'p')}catch(_){}
    const b=box(m);if(m.wall||c.run>c.len||c.t>c.tel+1.6||m.x<=b.l+2||m.x>=b.r-2){v.ch=null;v.vx*=.2;v.t=rn(6,8);shk(.16);try{VFX.wave(m.x+c.d*m.w*.5,m.y+m.h,'#ff8a3a',m.w*1.6,.45,.3)}catch(_){}tone(60,40,.35,'sawtooth',.07)}return}
   v.t-=dt*s;const dx=P.x-m.x;
   if(v.t<=0&&!(m.wind>0)&&m.g){v.ch={t:0,tel:.8,d:Math.sign(dx)||m.dir||1,run:0,len:Math.max(T*6,Math.abs(dx)+T*4)};return}   // charges through you to the other side
   const dir=Math.abs(dx)>T*3?Math.sign(dx):0;walk(m,v,m.wind>0?0:dir,72*s,2.5,dt);
   if(m.g&&Math.abs(v.vx)>30){v.sp=(v.sp||0)+Math.abs(v.vx)*dt;if(v.sp>T*1.15){v.sp=0;shk(.035);try{burst(m.x+rn(-m.w*.3,m.w*.3),m.y+m.h,'#bfb4aa',4,80,4,'p')}catch(_){}tone(55,40,.14,'sine',.04)}}},
  tide(m,v,dt,s){v.ph+=dt;const b=box(m),fl=Math.min(b.b,floorTop(m,m.x));
   if(v.su){const u=v.su;u.t+=dt;const k=Math.min(1,u.t/u.d),e=k*k*(3-2*k),x=u.x0+(u.x1-u.x0)*e,y=u.y0+(u.y1-u.y0)*e-Math.sin(Math.PI*k)*T*3.2;v.vx=(x-m.x)/Math.max(dt,1e-3);v.vy=(y-m.y)/Math.max(dt,1e-3);
    glide(m,v,dt);if(R()<dt*30)try{VFX.add(0,'#bfe6ff',m.x+rn(-m.w/2,m.w/2),m.y+m.h*R(),0,-40,.6,10,4,{a:.6})}catch(_){}if(k>=1){v.su=null;v.t=rn(5,6.5)}return}
   v.t-=dt*s;if(v.t<=0&&!(m.wind>0)){const d=Math.sign(P.x-m.x)||1;v.su={t:0,d:1.35,x0:m.x,y0:m.y,x1:cl(P.x+d*T*5,b.l,b.r),y1:cl(P.y-T*.5,b.t,b.b)};tone(200,420,.4,'sine',.04);return}
   if(v.dir==null)v.dir=P.x>m.x?1:-1;if(m.x<b.l+T*2.5)v.dir=1;else if(m.x>b.r-T*2.5)v.dir=-1;
   const sp=(m.wind>0?60:230)*s;fly(m,v,m.x+v.dir*T*4,fl-T*(1.4+.9*Math.sin(v.ph*1.1))+Math.sin(v.ph*2.4)*T*.6,sp,2.2,dt)},
  storm(m,v,dt,s){v.ph+=dt;const b=box(m);
   if(v.sw){const w=v.sw;w.t+=dt;if(w.t<w.tel){v.vx*=1-Math.min(1,dt*5);v.vy*=1-Math.min(1,dt*5);glide(m,v,dt);m.x+=Math.sin(w.t*60)*1.5;return}
    const k=Math.min(1,(w.t-w.tel)/w.d),e=k*k*(3-2*k),q=1-e,x=q*q*w.x0+2*q*e*w.cx+e*e*w.x1,y=q*q*w.y0+2*q*e*w.cy+e*e*w.y1;v.vx=(x-m.x)/Math.max(dt,1e-3);v.vy=(y-m.y)/Math.max(dt,1e-3);
    glide(m,v,dt);if(R()<dt*50)try{VFX.add(0,'#fff6b0',m.x+rn(-m.w/3,m.w/3),m.y+m.h*R(),-v.vx*.1,-v.vy*.1,.4,10,3,{a:.7})}catch(_){}
    if(k>=1){v.sw=null;v.t=rn(4,5.5);v.vx*=.3;v.vy=-200}return}
   v.t-=dt*s;if(v.t<=0&&!(m.wind>0)){const d=Math.sign(P.x-m.x)||1,x1=cl(P.x+d*T*9,b.l,b.r),ty=P.y+P.h*.5-m.h*.5;const y1=b.t+T*2;v.sw={t:0,tel:.55,d:1.15,x0:m.x,y0:m.y,cx:2*P.x-(m.x+x1)/2,cy:2*cl(ty,b.t,b.b)-(m.y+y1)/2,x1,y1};tone(1400,2200,.3,'square',.02);return}
   fly(m,v,P.x+Math.cos(v.ph*.55)*T*8,b.t+T*1.5+Math.sin(v.ph*1.3)*T*1.2,(m.wind>0?80:300)*s,1.8,dt)}};
 // ---- the boss is moved here, after the old monster AI ran (its result is undone for the active boss)
 function tick(m,dt){const id=bid(m),f=AI[id];if(!f)return false;const v=m.mv||(m.mv={vx:0,vy:0,t:rn(.8,1.6),n:0,ph:R()*6,fade:1,sq:0,fall:0,st:0,lean:0});
  if(m.ent||m.pb>0||cine()){v.vx=v.vy=0;v.tp=v.bl=v.ch=v.su=v.sw=null;v.fade=1;return true}
  if(m.dash)return true;   // the Eclipse / Leviathan dive attack (BOSSX) owns the position
  if(m.vy<-600&&!v.air&&!v.lp){v.vx=m.vx;v.vy=m.vy;v.lp=1}if(m.g)v.lp=0;   // an attack launched it (the Warden's quake)
  const s=SPD[cl((m.phase|0)-1,0,2)]*(m.stun>0?.5:1)*(m.slow>0?.75:1);
  if(m.stag>0){v.ch=v.sw=v.su=null;if(MK[m.k].fly){v.vx*=1-Math.min(1,dt*3);v.vy+=(40-v.vy)*Math.min(1,dt*3);glide(m,v,dt)}else{v.vx*=1-Math.min(1,dt*8);step(m,v,dt)}}
  else f(m,v,dt,s);
  v.sq=Math.max(0,v.sq-dt*3);v.st+=Math.abs(m.vx||0)*dt;v.lean+=(cl((m.vx||0)/900,-.16,.16)-v.lean)*Math.min(1,dt*8);return true}
 {const _u=updMobs;updMobs=function(dt){const m=BOSS6.active(),ok=live(m)&&AI[bid(m)];let s=null;if(ok)s={x:m.x,y:m.y,vx:m.vx,vy:m.vy,g:m.g,dir:m.dir,t:m.t};
   _u.apply(this,arguments);
   if(ok&&live(m)){Object.assign(m,s);try{tick(m,dt)}catch(e){if(!tick.e){tick.e=1;console.error('BMOVE12',e)}}}}}
 // ---- drawing: lean, stride bob, landing squash, teleport fade (around whatever draws the boss), plus marks for charges / swoops / teleports
 {const _dm=drawMob;drawMob=function(m,now){const v=m.boss&&m.mv;if(!v||(typeof BOSS10!='undefined'&&BOSS10.kind=='in'))return _dm(m,now);
   const fx=m.x-cam.x,fy=m.y+m.h-cam.y,fl=MK[m.k]&&MK[m.k].fly,a0=g.globalAlpha,bob=!fl&&m.g&&Math.abs(m.vx)>25?-Math.abs(Math.sin(v.st/(T*.6)*Math.PI))*5:0,sq=v.sq;
   g.save();if(v.fade<1)g.globalAlpha=a0*v.fade;g.translate(fx,fy+bob);if(fl){g.translate(0,-m.h/2);g.rotate(v.lean*.8);g.translate(0,m.h/2)}else g.rotate(v.lean);
   if(sq>0)g.scale(1+.12*sq,1-.15*sq);g.translate(-fx,-fy);try{_dm(m,now)}finally{g.restore();g.globalAlpha=a0}}}
 function marks(gc,cx,cy){const m=BOSS6.active();if(!live(m)||!m.mv)return;const v=m.mv,t=performance.now()/1000;gc.save();gc.lineWidth=2.5;gc.setLineDash([10,8]);gc.lineDashOffset=-t*60;
  if(v.ch&&v.ch.t<v.ch.tel){const k=v.ch.t/v.ch.tel,y=m.y+m.h-6-cy,x=m.x-cx,len=Math.min(v.ch.len,T*12)*(.4+.6*k);gc.globalAlpha=.4+.5*k;gc.strokeStyle='#ff5a3a';gc.beginPath();gc.moveTo(x,y);gc.lineTo(x+v.ch.d*len,y);gc.stroke();gc.setLineDash([]);gc.fillStyle='#ff5a3a';gc.beginPath();gc.moveTo(x+v.ch.d*(len+16),y);gc.lineTo(x+v.ch.d*len,y-10);gc.lineTo(x+v.ch.d*len,y+10);gc.closePath();gc.fill()}
  if(v.sw&&v.sw.t<v.sw.tel){const w=v.sw,k=w.t/w.tel;gc.globalAlpha=.35+.5*k;gc.strokeStyle='#ffe27a';gc.beginPath();gc.moveTo(w.x0-cx,w.y0+m.h/2-cy);gc.quadraticCurveTo(w.cx-cx,w.cy+m.h/2-cy,w.x1-cx,w.y1+m.h/2-cy);gc.stroke()}
  if(v.su&&v.su.t<.25){gc.globalAlpha=.6;gc.strokeStyle='#8fd0ff';gc.beginPath();gc.arc(v.su.x1-cx,v.su.y1+m.h/2-cy,30,0,TAU);gc.stroke()}
  const tp=v.tp||v.bl;if(tp){const k=1-tp.t/(v.tp?.6:.45),c=v.tp?'#bfeaff':'#b58cff';gc.setLineDash([]);gc.globalAlpha=.4+.5*k;gc.strokeStyle=c;gc.beginPath();gc.ellipse(tp.x-cx,tp.y+m.h-cy-2,m.w*.6*k+8,10*k+3,0,0,TAU);gc.stroke();gc.globalAlpha=.25*k;gc.fillStyle=c;gc.fillRect(tp.x-cx-m.w*.3,tp.y-cy,m.w*.6,m.h)}
  gc.restore()}
 {const _dp=BOSS6.drawProj;BOSS6.drawProj=function(gc,cx,cy){_dp.call(this,gc,cx,cy);try{marks(gc,cx,cy)}catch(e){if(!marks.e){marks.e=1;console.error('BMOVE12 marks',e)}}}}
 return{AI,tick,box,state:()=>{const m=BOSS6.active();return m&&m.mv?{x:m.x,y:m.y,vx:m.vx,vy:m.vy,g:m.g,tp:!!m.mv.tp,bl:!!m.mv.bl,ch:!!m.mv.ch,su:!!m.mv.su,sw:!!m.mv.sw}:null}}})();
