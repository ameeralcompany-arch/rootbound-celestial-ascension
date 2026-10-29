// ===== ARENA7: when a boss spawns, a glowing square barrier closes around you and the boss. Nobody leaves until the fight ends.
// Win: the boss flashes, shakes and dissolves upward with a defeat sound, then the barrier flashes gold and fades.
// Lose (you get knocked out): the boss vanishes, the barrier collapses. The barrier is drawn, not built from blocks, so builds are untouched. =====
const ARENA7=(()=>{
 let A=null,G=null;const R=Math.random;
 const tone=(a,b,d,ty,v,dl,vib)=>{try{SFX7.tone(a,b,d,ty,v,dl,vib)}catch(_){}};
 const colOf=m=>{try{return BOSSES.find(b=>'boss_'+b.id==m.k).c}catch(_){return'#b58cff'}};
 const nameOf=m=>{try{return BOSSES.find(b=>'boss_'+b.id==m.k).n}catch(_){return'The boss'}};
 const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
 // ---- open the arena around the player and the boss that just appeared
 // sized to fit the screen when it can, so the camera can frame the whole square for the fight
 function open(m){const vw=cv.width/ZM,vh=cv.height/ZM,pad=5*T,x0=Math.min(P.x,m.x-m.w/2)-pad,x1=Math.max(P.x,m.x+m.w/2)+pad,top=Math.min(P.y,m.y)-4*T,bot=Math.max(P.y+P.h,m.y+m.h)+T;
  let w=Math.max(Math.min(20*T,vw-2*T),x1-x0),h=Math.max(Math.min(12*T,vh-2*T),bot-top),cx=(x0+x1)/2;const L=Math.max(T,Math.min((W-1)*T-w,cx-w/2)),Tp=Math.max(0,Math.min((H-1)*T-h,bot-h));
  A={x0:L,x1:L+Math.min(w,(W-2)*T),y0:Tp,y1:Tp+Math.min(h,(H-1)*T),boss:m,c:colOf(m),t0:performance.now(),end:0,win:false};
  A.fit=A.x1-A.x0<=vw-T&&A.y1-A.y0<=vh-T;if(A.fit)window.CAMT={x:(A.x0+A.x1)/2,y:(A.y0+A.y1)/2};
  tone(55,110,.9,'sawtooth',.035);tone(880,1760,.6,'sine',.018,.3);try{say('A barrier seals you in with '+nameOf(m)+'!')}catch(_){}}
 {const _sp=BOSS6.spawn;BOSS6.spawn=function(id){const ok=_sp.apply(this,arguments);try{if(ok){const m=BOSS6.active();if(m){open(m);try{CINE7.bossIntro(m,A)}catch(e){console.error('CINE7 intro',e)}}}}catch(e){console.error('ARENA7',e)}return ok}}   // the intro card (CINE7) plays while the barrier forms
 // ---- keep the player inside (runs after every physics step)
 function hold(o,w,h){if(!A||A.end)return;let hit=false;const l=A.x0+w/2,r=A.x1-w/2;if(o.x<l){o.x=l;hit=true;if(o.vx<0)o.vx=0}else if(o.x>r){o.x=r;hit=true;if(o.vx>0)o.vx=0}
  if(o.y<A.y0){o.y=A.y0;hit=true;if(o.vy<0)o.vy=0}else if(o.y+h>A.y1){o.y=A.y1-h;if(o.vy>0)o.vy=0}return hit}
 {const _p=physics;physics=function(dt,ax,busy){const r=_p.apply(this,arguments);try{if(A&&!A.end&&hold(P,P.w||24,P.h)&&R()<.25)VFX.burst(P.x,P.y+P.h/2,[A.c,'#fff'],3,90,1,.35,6)}catch(_){}return r}}
 // ---- defeat sound: heavy impact, a sinking groan, crumbling, then a soft victory chime
 function defeatSound(){tone(90,38,.6,'sawtooth',.06);tone(62,30,.9,'sine',.09);tone(260,68,1.5,'sine',.05,.15,1);tone(392,104,1.3,'triangle',.018,.2,1);
  for(let i=0;i<7;i++)tone(110+R()*90,50,.12,'triangle',.028,.35+i*.15+R()*.05);[523,659,784,1047].forEach((f,i)=>tone(f,f,.5,'sine',.028,1.65+i*.09))}
 function loseSound(){tone(330,220,.5,'sine',.035);tone(262,175,.8,'sine',.03,.25);tone(196,147,1,'sine',.025,.5)}
 function finish(win){if(!A||A.end)return;const m=A.boss;A.end=performance.now();A.win=win;
  if(win){// keep a copy of the boss to play its defeat animation after it leaves the fight
   G={m:Object.assign({},m,{hp:m.mhp,fl:0,dead:false,bs:'idle'}),t0:performance.now(),c:A.c};defeatSound()}
  else{loseSound();try{BOSS6.clear()}catch(_){}try{CINE7.bossLose(nameOf(m))}catch(_){try{UI6.say6('DEFEATED',nameOf(m).toUpperCase()+' VANISHED INTO THE DARK',3600)}catch(_){}}}}
 // ---- watch the fight: it ends when the boss falls (win) or disappears because you were knocked out (lose)
 let lastCur='';
 {const _t=BOSS6.tick;BOSS6.tick=function(dt){_t.call(this,dt);try{
   if(lastCur&&cur!==lastCur&&A){A=null;G=null}lastCur=cur;
   if(!A||A.end&&performance.now()-A.end>(A.win?1600:0))window.CAMT=null;   // the camera follows you again once the fight is over
   if(A&&!A.end){const m=A.boss;if(m.rew||m.dead&&m.hp<=0)finish(true);else if(!mobs.includes(m))finish(false);else if(hold(m,m.w,m.h)){m.vx=0}}
   if(A&&A.end&&performance.now()-A.end>(A.win?3200:900))A=null;
   if(G&&performance.now()-G.t0>2100)G=null}catch(e){console.error('ARENA7 tick',e)}}}
 // ---- drawing (world space, after the world)
 function drawArena(g,cx,cy,now){const age=(now-A.t0)/1000,grow=ease(age/.6),fade=A.end?1-Math.min(1,(now-A.end)/(A.win?3200:900)):1;if(fade<=0)return;
  const mx=(A.boss.x||((A.x0+A.x1)/2)),my=(A.boss.y||((A.y0+A.y1)/2)),x0=mx+(A.x0-mx)*grow-cx,x1=mx+(A.x1-mx)*grow-cx,y0=my+(A.y0-my)*grow-cy,y1=my+(A.y1-my)*grow-cy,col=A.end&&A.win?'#ffd86a':A.c;
  g.save();g.globalCompositeOperation='source-over';g.setLineDash([]);
  // dim everything outside the barrier
  if(!A.end||!A.win){g.globalAlpha=.32*fade*grow;g.fillStyle='#0a0614';g.beginPath();g.rect(-cx+cam.x-50,-cy+cam.y-50,cv.width/ZM+100,cv.height/ZM+100);g.rect(x1,y0,x0-x1,y1-y0);g.fill('evenodd')}
  // the barrier: soft outer glow, bright inner line, runes travelling along the edge, spinning corner sigils
  g.globalCompositeOperation='lighter';const pulse=.75+.25*Math.sin(now/240),flash=A.end&&A.win?Math.max(0,1-(now-A.end)/500):0;
  g.globalAlpha=fade*(.22+flash*.5)*pulse;g.strokeStyle=col;g.lineWidth=14;g.strokeRect(x0,y0,x1-x0,y1-y0);
  g.globalAlpha=fade*(.85+flash);g.lineWidth=2.5;g.strokeRect(x0,y0,x1-x0,y1-y0);
  g.globalAlpha=fade*.7;g.lineWidth=3;g.setLineDash([6,22]);g.lineDashOffset=-now/40;g.strokeRect(x0+7,y0+7,x1-x0-14,y1-y0-14);g.setLineDash([]);
  for(const[px,py]of[[x0,y0],[x1,y0],[x0,y1],[x1,y1]]){g.save();g.translate(px,py);g.rotate(now/900);g.globalAlpha=fade*.9;g.lineWidth=2;g.beginPath();g.arc(0,0,13,0,6.3);g.stroke();g.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2;g.moveTo(Math.cos(a)*5,Math.sin(a)*5);g.lineTo(Math.cos(a)*19,Math.sin(a)*19)}g.stroke();g.restore()}
  g.restore()}
 function drawGhost(g,now){const k=(now-G.t0)/2100,m=G.m;if(k>=1)return;
  // 0-0.28: violent shake + rapid white flashes; then it sinks, squashes and dissolves upward into motes of its colour, with a rising ring
  const sh=k<.28?(1-k/.28)*12:0,dis=ease((k-.22)/.6);m.fl=k<.28&&Math.floor(now/55)%2?.15:0;
  // dissolve motes at ~55/s whatever the frame rate (6 per frame was ~860/s at 144 FPS: hundreds of additive glows, half-rate frames)
  const ld=Math.min(.05,(now-(G.lt||now))/1000);G.lt=now;G.acc=(G.acc||0)+ld*55;const nE=k>.18?Math.min(8,Math.floor(G.acc)):0;G.acc-=nE;
  for(let i=0;i<nE;i++)VFX.add(R()<.5?0:1,R()<.65?G.c:'#fff',m.x+(R()-.5)*m.w*1.1,m.y+m.h*(1-dis*.8)*R(),(R()-.5)*70,-90-R()*200,1.1,8+R()*12,2,{a:.9});
  g.save();g.globalCompositeOperation='source-over';g.globalAlpha=Math.max(0,1-dis*1.05);const ox=m.x+(R()-.5)*sh,oy=m.y+m.h;g.translate(ox-cam.x,oy-cam.y);g.scale(1+dis*.35,1-dis*.85);g.translate(-(ox-cam.x),-(oy-cam.y));
  const sx=m.x;m.x=ox;try{drawMob(m,now)}catch(_){}m.x=sx;g.restore();
  g.save();g.globalCompositeOperation='lighter';const cx=m.x-cam.x,cy=m.y+m.h/2-cam.y;
  if(k<.15){g.globalAlpha=(1-k/.15)*.75;g.fillStyle='#fff';g.beginPath();g.arc(cx,cy,m.w*(.8+k*7),0,6.3);g.fill()}
  if(k>.2){const u=(k-.2)/.8;g.globalAlpha=(1-u)*.8;g.strokeStyle=G.c;g.lineWidth=6*(1-u)+1;g.beginPath();g.ellipse(cx,cy-u*m.h*1.2,m.w*(.6+u*.9),m.w*(.2+u*.3),0,0,6.3);g.stroke()}
  g.restore()}
 {const _dp=BOSS6.drawProj;BOSS6.drawProj=function(gc,cx,cy){_dp.call(this,gc,cx,cy);try{const now=performance.now();if(G)drawGhost(gc,now);if(A)drawArena(gc,cx,cy,now)}catch(e){console.error('ARENA7 draw',e)}}}
 return{get arena(){return A},get ghost(){return G}}})();
