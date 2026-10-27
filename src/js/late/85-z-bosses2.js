// ===== Boss overhaul: telegraphed hazards, shields + stagger windows, no building in a boss, HP bar fix, nicer idle/attack animation =====
const BOSSX=(()=>{
 const HZ=[],ORB=[];let nb=0;const rn=(a,b)=>a+Math.random()*(b-a);
 const cols={warden:'#6fe08a',sovereign:'#7fd8ff',eclipse:'#b58cff'};
 const boss=()=>{const a=BOSS6.active();return a&&!a.dead&&mobs.includes(a)?a:null};
 const id=m=>m.k.slice(5);
 function hit(a,kb){if(iT>0)return;P.hp-=a*(1-Math.min(.8,bonus().arm+(guard>0?.5:0)));iT=.9;P.vx=kb||0;P.vy=-320;hurtF=.45;shake=Math.max(shake,QM.reduce?0:.14);snd(130,.22,'sawtooth',.07)}
 const gyAt=(x,fromY)=>{const tx=Math.max(1,Math.min(W-2,Math.floor(x/T)));let ty=Math.floor(fromY/T);for(let i=0;i<16&&ty<H-2;i++,ty++)if(solidAt(tx,ty))return ty*T;return fromY};
 const hitsP=(z)=>P.x+P.w/2>z.x0&&P.x-P.w/2<z.x1&&P.y+P.h>z.y0&&P.y<z.y1;
 // hazard: rectangle that warns (tel seconds), then hurts (act seconds)
 const addZ=(x0,y0,x1,y1,tel,act,c,dmg,kind,kb)=>HZ.push({x0,y0,x1,y1,tel,tel0:tel,act,c,dmg,kind,kb:kb||260,hit:0});
 function col(x,m,tel,up,c){const gy=gyAt(x,P.y+P.h-8);const h=up?T*5:T*13;addZ(x-T*.7,gy-h,x+T*.7,gy+2,tel,.35,c,m.dmg*1.1,up?'up':'down')}
 function beam(m,y,tel,c){const x0=Math.max(T,m.x-T*16),x1=Math.min((W-1)*T,m.x+T*16);addZ(x0,y-15,x1,y+15,tel,.3,c,m.dmg*1.1,'beam')}
 function orb(m,sp){ORB.push({x:m.x,y:m.y+m.h*.4,vx:Math.cos(sp)*120,vy:Math.sin(sp)*120,l:6,c:'#b58cff'})}
 const ATK={
  warden:{thorns(m,p2){const n=p2?5:3;for(let i=0;i<n;i++)col(P.x+rn(-T*4,T*4)+(i==0?0:0),m,1.0+i*.28,1,'#6fe08a');UI6.say6('THORNS','',700)},
          wave(m,p2){const d=Math.sign(P.x-m.x)||1,n=p2?11:8;for(let k=1;k<=n;k++)col(m.x+d*k*T*1.5,m,.75+k*.12,1,'#6fe08a')}},
  sovereign:{rain(m,p2){const n=p2?8:6;for(let i=0;i<n;i++)col(P.x+(i-(n-1)/2)*T*1.7+rn(-8,8),m,1.0+Math.abs(i-n/2)*.1+rn(0,.4),0,'#7fd8ff')},
          beam(m,p2){const y=P.y+P.h*.55;beam(m,y,1.15,'#7fd8ff');if(p2)beam(m,y-T*2.6,1.5,'#7fd8ff')}},
  eclipse:{orbs(m,p2){const n=p2?5:3,a0=Math.atan2(P.y-m.y,P.x-m.x);for(let i=0;i<n;i++)orb(m,a0+(i-(n-1)/2)*.9);snd(300,.3,'sine',.07,.5)},
          dash(m,p2){const dir=P.x>m.x?1:-1,tx=Math.max(3*T,Math.min((W-3)*T,P.x+dir*T*9)),y=P.y+P.h*.4;m.dash={tx,y,t:0,tel:.9};addZ(Math.min(m.x,tx)-8,y-18,Math.max(m.x,tx)+8,y+18,.9,.45,'#b58cff',m.dmg*1.3,'beam',380)},
          pull(m,p2){if(!p2)return ATK.eclipse.orbs(m,p2);m.pull=3.4;UI6.say6('VOID PULL','',900)}}};
 const LIST={warden:['thorns','wave'],sovereign:['rain','beam'],eclipse:['orbs','dash','pull']};
 function tick(dt){const m=boss();
  const hb=document.getElementById('bossbar');if(hb&&!m)hb.style.display='none';
  if(!m){if(HZ.length||ORB.length){HZ.length=0;ORB.length=0}return}
  const b=id(m),p2=m.phase==2;
  if(m.born==null)m.born=performance.now();
  if(m.xt==null){m.xt=3.2;m.xc=0;m.stag=0;m.shieldAt=[.66,.33];m.shield=0}
  if(m.stag>0){m.stag-=dt;m.xt=Math.max(m.xt,1.2)}
  // shield: Sovereign + Eclipse raise a barrier at set health marks; breaking it staggers the boss
  if(b!='warden'&&m.shieldAt.length&&m.hp/m.mhp<m.shieldAt[0]){m.shieldAt.shift();m.shield=m.mhp*.12;m.shieldMax=m.shield;UI6.say6('SHIELD UP','Burst it down to break it',1800);VFX.wave(m.x,m.y+m.h/2,cols[b],260,.8,.4);snd(520,.4,'sine',.08,.6)}
  m.xt-=dt;if(m.xt<=0&&m.stag<=0&&performance.now()-m.born>1600){const l=LIST[b],pick=l[Math.random()*l.length|0];try{ATK[b][pick](m,p2)}catch(e){console.error(e)}m.xc++;m.xt=p2?3.0:4.4;
   if(m.xc%4==0){m.stag=3.4;m.xt=3.6;UI6.say6('EXHAUSTED','Hit it now',1400);VFX.wave(m.x,m.y+m.h/2,'#ffd24a',200,.7,.3)}}
  // dash / pull state
  if(m.dash){m.dash.t+=dt;if(m.dash.t>m.dash.tel){const k=Math.min(1,(m.dash.t-m.dash.tel)/.35);m.x+=(m.dash.tx-m.x)*Math.min(1,dt*9);m.y+=(m.dash.y-m.h*.4-m.y)*Math.min(1,dt*7);if(k>=1)m.dash=null}}
  if(m.pull>0){m.pull-=dt;const dx=m.x-P.x,d=Math.abs(dx);if(m.pull<2.4&&d<T*16){P.x+=Math.sign(dx)*Math.min(150,60+ (T*16-d)*.1)*dt}if(Math.hypot(dx,m.y+m.h/2-(P.y+P.h/2))<T*2.4&&m.pull<2.4)hit(m.dmg*.9,Math.sign(-dx||1)*300)}
  // hazards
  for(let i=HZ.length-1;i>=0;i--){const z=HZ[i];if(z.tel>0){z.tel-=dt;if(z.tel<=0)try{shake=Math.max(shake,QM.reduce?0:.1);snd(z.kind=='beam'?200:90,.18,'sawtooth',.08,.4)}catch(_){}}else{z.act-=dt;if(!z.hit&&hitsP(z)){z.hit=1;hit(z.dmg,Math.sign(P.x-(z.x0+z.x1)/2||1)*z.kb)}if(z.act<=0)HZ.splice(i,1)}}
  // homing void orbs
  for(let i=ORB.length-1;i>=0;i--){const o=ORB[i];o.l-=dt;const dx=P.x-o.x,dy=P.y+P.h/2-o.y,d=Math.hypot(dx,dy)||1,sp=p2?190:140;o.vx+=dx/d*260*dt;o.vy+=dy/d*260*dt;const v=Math.hypot(o.vx,o.vy);if(v>sp){o.vx*=sp/v;o.vy*=sp/v}o.x+=o.vx*dt;o.y+=o.vy*dt;
   if(Math.random()<.4)VFX.add(0,'#b58cff',o.x,o.y,0,0,.3,12,2,{a:.7});
   if(d<P.w/2+12){hit(m.dmg*.8,Math.sign(o.vx||1)*200);o.l=0}if(o.l<=0){VFX.burst(o.x,o.y,['#b58cff','#fff'],6,120,1,.4,9);ORB.splice(i,1)}}}
 // damage shaping: shield absorbs, exhausted bosses take extra
 {const _h=hurtMob;hurtMob=function(m,d,w,ang){if(m.boss&&m.k&&m.k.startsWith('boss_')){if(m.shield>0){const ab=Math.min(d,m.shield);m.shield-=ab;d-=ab;if(m.shield<=0){m.shield=0;m.stag=4.2;m.xt=4.4;UI6.say6('SHIELD BROKEN','Strike now!',1500);try{VFX.shatter(m.x,m.y+m.h/2,['#fff',cols[id(m)]],30)}catch(_){}snd(900,.2,'triangle',.08,1.2)}if(d<=0)d=.01}else if(m.stag>0)d*=1.45}return _h.call(this,m,d,w,ang)}}
 // no building inside a boss (or right beside it)
 {const _pa=placeAction;placeAction=function(){try{const tx=Math.floor((mx+cam.x)/T),ty=Math.floor((my+cam.y)/T);for(const m of mobs){if(!m.boss||m.dead)continue;if(tx*T<m.x+m.w/2+T&&(tx+1)*T>m.x-m.w/2-T&&ty*T<m.y+m.h+T&&(ty+1)*T>m.y-T){if(performance.now()-nb>1200){nb=performance.now();say("You can't build inside a boss");try{UIS.play('error')}catch(_){}}return}}}catch(_){}return _pa.apply(this,arguments)}}
 // animation wrapper: spawn rise, wind-up crouch, recoil, shadow, shield bubble, exhaustion stars
 {const _dm=drawMob;drawMob=function(m,now){if(!(m.boss&&m.k&&m.k.startsWith('boss_')))return _dm(m,now);
  if(m.born==null)m.born=now;const sp=Math.min(1,(now-m.born)/1300),e=1-Math.pow(1-sp,3),fx=m.x-cam.x,fy=m.y+m.h-cam.y,b=id(m),c=cols[b]||'#fff',t=now/1000;
  g.save();
  // ground shadow
  try{const gy=b=='eclipse'?gyAt(m.x,m.y+m.h)-cam.y:fy;const hgt=Math.max(0,Math.min(1,(gy-fy)/260));g.globalAlpha=(.35-.2*hgt)*e;g.fillStyle='#000';g.beginPath();g.ellipse(fx,gy-2,m.w*.5*(1-.3*hgt),7,0,0,6.3);g.fill();g.globalAlpha=1}catch(_){}
  let sx=1,sy=1;if(m.bs=='tele'){const k=1-Math.max(0,Math.min(1,m.bt/.95));sy=1-.09*k;sx=1+.06*k}else if(m.bt>2.2){const k=(m.bt-2.2)/.4;sy=1+.05*Math.max(0,k);sx=1-.03*Math.max(0,k)}
  if(m.stag>0){sy*=.96;g.rotate(0)}
  sy*=.35+.65*e;g.globalAlpha=Math.min(1,e*1.4);
  g.translate(fx,fy);g.scale(sx,sy);g.translate(-fx,-fy);
  _dm(m,now);g.restore();
  g.save();
  if(m.shield>0){const r=Math.max(m.w,m.h)*.78,cx=fx,cy=m.y+m.h/2-cam.y;g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(cx,cy,r*.6,cx,cy,r);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,c);g.globalAlpha=.35+.25*Math.sin(t*5);g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r,0,6.3);g.fill();g.globalAlpha=.9;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(cx,cy,r,0,6.3);g.stroke();g.globalCompositeOperation='source-over';g.globalAlpha=1;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(cx-m.w/2,m.y-cam.y-26,m.w,5);g.fillStyle='#fff';g.fillRect(cx-m.w/2+1,m.y-cam.y-25,(m.w-2)*Math.max(0,m.shield/(m.shieldMax||1)),3)}
  if(m.stag>0){g.fillStyle='#ffd24a';for(let i=0;i<3;i++){const a=t*4+i*2.1,sx2=fx+Math.cos(a)*22,sy2=m.y-cam.y-10+Math.sin(a)*6;g.beginPath();for(let k=0;k<10;k++){const r=k%2?3:7,aa=k*Math.PI/5;g.lineTo(sx2+Math.cos(aa)*r,sy2+Math.sin(aa)*r)}g.closePath();g.fill()}}
  if(m.phase==2&&!QM.reduce&&Math.random()<.5)VFX.mote(m.x+rn(-m.w/2,m.w/2),m.y+m.h*Math.random(),'#ff5a6a');
  g.restore()}}
 // draw hazards + orbs (called by the game loop through BOSS6.drawProj)
 {const _dp=BOSS6.drawProj;BOSS6.drawProj=function(gc,cx,cy){try{_dp.call(this,gc,cx,cy)}catch(_){}if(!HZ.length&&!ORB.length)return;const t=performance.now()/1000;gc.save();
  for(const z of HZ){const x=z.x0-cx,y=z.y0-cy,w=z.x1-z.x0,h=z.y1-z.y0;
   if(z.tel>0){const k=1-z.tel/z.tel0,fl=.5+.5*Math.sin(t*22);gc.globalAlpha=.16+.14*fl;gc.fillStyle='#ff3a4a';gc.fillRect(x,y,w,h);gc.globalAlpha=.55+.3*fl;gc.strokeStyle='#ff6a7a';gc.lineWidth=2;gc.strokeRect(x+1,y+1,w-2,h-2);gc.globalAlpha=.45;gc.fillStyle='#ff3a4a';if(z.kind=='beam')gc.fillRect(x,y,w*k,h);else if(z.kind=='up')gc.fillRect(x,y+h*(1-k),w,h*k);else gc.fillRect(x,y,w,h*k)}
   else{gc.globalCompositeOperation='lighter';const a=Math.max(0,z.act/.35);gc.globalAlpha=Math.min(1,.5+a);const gr=z.kind=='beam'?gc.createLinearGradient(0,y,0,y+h):gc.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'#fff');gr.addColorStop(1,'rgba(255,255,255,0)');gc.fillStyle=z.c;gc.fillRect(x,y,w,h);gc.fillStyle=gr;gc.fillRect(x,y,w,h);gc.globalCompositeOperation='source-over'}}
  gc.globalCompositeOperation='lighter';for(const o of ORB){const gr=gc.createRadialGradient(o.x-cx,o.y-cy,0,o.x-cx,o.y-cy,18);gr.addColorStop(0,'#fff');gr.addColorStop(.35,o.c);gr.addColorStop(1,'rgba(0,0,0,0)');gc.globalAlpha=1;gc.fillStyle=gr;gc.fillRect(o.x-cx-18,o.y-cy-18,36,36)}
  gc.restore()}}
 {const _t=BOSS6.tick,_c=BOSS6.clear;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){console.error('BOSSX',e)}};BOSS6.clear=function(){_c.call(this);HZ.length=0;ORB.length=0;const hb=document.getElementById('bossbar');if(hb)hb.style.display='none'}}
 return{HZ,ORB,tick}})();
