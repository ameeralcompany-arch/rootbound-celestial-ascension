// ===== ARENA7: when a boss spawns, a glowing square barrier closes around you and the boss. Nobody leaves until the fight ends.
// The barrier forms when the intro cinematic (BOSS10) hands the camera back (A.t0 in the future = not formed yet; you are still kept inside).
// Win: the barrier turns gold, waits for the outro's camera return, then fades. Lose (you get knocked out): the boss vanishes, the barrier collapses.
// Camera: while no cinematic owns it (BOSS10.cam), CAMT frames the arena when the whole square fits on screen. Drawn, not built from blocks. =====
const ARENA7=(()=>{
 let A=null;const R=Math.random;
 const tone=(a,b,d,ty,v,dl,vib)=>{try{SFX7.tone(a,b,d,ty,v,dl,vib)}catch(_){}};
 const colOf=m=>{try{return BOSSES.find(b=>'boss_'+b.id==m.k).c}catch(_){return'#b58cff'}};
 const nameOf=m=>{try{return BOSSES.find(b=>'boss_'+b.id==m.k).n}catch(_){return'The boss'}};
 const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
 const cine=()=>{try{return BOSS10.cam}catch(_){return false}};
 // ---- open the arena around the player and the boss that just appeared
 // sized to fit the screen when it can, so the camera can frame the whole square for the fight
 function open(m){const vw=cv.width/ZM,vh=cv.height/ZM,pad=5*T,x0=Math.min(P.x,m.x-m.w/2)-pad,x1=Math.max(P.x,m.x+m.w/2)+pad,top=Math.min(P.y,m.y)-4*T,bot=Math.max(P.y+P.h,m.y+m.h)+T;
  let w=Math.max(Math.min(20*T,vw-2*T),x1-x0),h=Math.max(Math.min(12*T,vh-2*T),bot-top),cx=(x0+x1)/2;const L=Math.max(T,Math.min((W-1)*T-w,cx-w/2)),Tp=Math.max(0,Math.min((H-1)*T-h,bot-h));
  A={x0:L,x1:L+Math.min(w,(W-2)*T),y0:Tp,y1:Tp+Math.min(h,(H-1)*T),boss:m,c:colOf(m),t0:performance.now(),end:0,win:false,pend:1,fz:0,fd:900};
  A.fit=A.x1-A.x0<=vw-T&&A.y1-A.y0<=vh-T}
 {const _sp=BOSS6.spawn;BOSS6.spawn=function(id){const ok=_sp.apply(this,arguments);try{if(ok){const m=BOSS6.active();if(m){open(m);try{BOSS10.intro(m,A)}catch(e){console.error('BOSS10 intro',e);A.t0=performance.now()}}}}catch(e){console.error('ARENA7',e)}return ok}}   // the intro cinematic plays, then the barrier forms
 // ---- keep the player inside (runs after every physics step)
 function hold(o,w,h){if(!A||A.end)return;let hit=false;const l=A.x0+w/2,r=A.x1-w/2;if(o.x<l){o.x=l;hit=true;if(o.vx<0)o.vx=0}else if(o.x>r){o.x=r;hit=true;if(o.vx>0)o.vx=0}
  if(o.y<A.y0){o.y=A.y0;hit=true;if(o.vy<0)o.vy=0}else if(o.y+h>A.y1){o.y=A.y1-h;if(o.vy>0)o.vy=0}return hit}
 {const _p=physics;physics=function(dt,ax,busy){const r=_p.apply(this,arguments);try{if(A&&!A.end&&hold(P,P.w||24,P.h)&&!A.pend&&R()<.25)VFX.burst(P.x,P.y+P.h/2,[A.c,'#fff'],3,90,1,.35,6)}catch(_){}return r}}
 function loseSound(){tone(330,220,.5,'sine',.035);tone(262,175,.8,'sine',.03,.25);tone(196,147,1,'sine',.025,.5)}
 function finish(win){if(!A||A.end)return;const m=A.boss;A.end=performance.now();A.win=win;A.pend=0;
  if(win){let left=0;try{left=BOSS10.left()}catch(_){}A.fz=A.end+left;A.fd=1300}   // the outro (BOSS10) plays the collapse; the barrier fades when its camera returns
  else{A.fz=A.end;A.fd=900;loseSound();try{BOSS6.clear()}catch(_){}try{CINE7.bossLose(nameOf(m))}catch(_){try{UI6.say6('DEFEATED',nameOf(m).toUpperCase()+' VANISHED INTO THE DARK',3600)}catch(_){}}}}
 // ---- watch the fight: it ends when the boss falls (win) or disappears because you were knocked out (lose)
 let lastCur='';
 function cam(){if(cine())return;const c=A&&!A.end&&A.fit&&!A.pend?A:null;
  if(c){const x=(c.x0+c.x1)/2,y=(c.y0+c.y1)/2;if(!window.CAMT||CAMT.x!==x||CAMT.y!==y)window.CAMT={x,y}}else if(window.CAMT)window.CAMT=null}
 {const _t=BOSS6.tick;BOSS6.tick=function(dt){_t.call(this,dt);try{const now=performance.now();
   if(lastCur&&cur!==lastCur&&A)A=null;lastCur=cur;
   if(A&&A.pend&&now>=A.t0){A.pend=0;tone(55,110,.9,'sawtooth',.035);tone(880,1760,.6,'sine',.018,.3)}   // the barrier forms
   if(A&&!A.end){const m=A.boss;if(m.rew||m.dead&&m.hp<=0)finish(true);else if(!mobs.includes(m))finish(false);else if(hold(m,m.w,m.h)){m.vx=0}}
   if(A&&A.end&&now>A.fz+A.fd)A=null;cam()}catch(e){console.error('ARENA7 tick',e)}}}
 // ---- drawing (world space, after the world)
 function drawArena(g,cx,cy,now){const age=(now-A.t0)/1000;if(age<0)return;const grow=ease(age/.6),fade=A.end?1-Math.max(0,Math.min(1,(now-A.fz)/A.fd)):1;if(fade<=0)return;
  const mx=(A.boss.x||((A.x0+A.x1)/2)),my=(A.boss.y||((A.y0+A.y1)/2)),x0=mx+(A.x0-mx)*grow-cx,x1=mx+(A.x1-mx)*grow-cx,y0=my+(A.y0-my)*grow-cy,y1=my+(A.y1-my)*grow-cy,col=A.end&&A.win?'#ffd86a':A.c;
  g.save();g.globalCompositeOperation='source-over';g.setLineDash([]);
  // dim everything outside the barrier
  if(!A.end||!A.win){g.globalAlpha=.32*fade*grow;g.fillStyle='#0a0614';g.beginPath();g.rect(-cx+cam.x-50,-cy+cam.y-50,cv.width/ZM+100,cv.height/ZM+100);g.rect(x1,y0,x0-x1,y1-y0);g.fill('evenodd')}
  // the barrier: soft outer glow, bright inner line, runes travelling along the edge, spinning corner sigils
  g.globalCompositeOperation='lighter';const pulse=.75+.25*Math.sin(now/240),flash=A.end&&A.win&&now>=A.fz?Math.max(0,1-(now-A.fz)/500):0;
  g.globalAlpha=fade*(.22+flash*.5)*pulse;g.strokeStyle=col;g.lineWidth=14;g.strokeRect(x0,y0,x1-x0,y1-y0);
  g.globalAlpha=Math.min(1,fade*(.85+flash));g.lineWidth=2.5;g.strokeRect(x0,y0,x1-x0,y1-y0);
  g.globalAlpha=fade*.7;g.lineWidth=3;g.setLineDash([6,22]);g.lineDashOffset=-now/40;g.strokeRect(x0+7,y0+7,x1-x0-14,y1-y0-14);g.setLineDash([]);
  for(const[px,py]of[[x0,y0],[x1,y0],[x0,y1],[x1,y1]]){g.save();g.translate(px,py);g.rotate(now/900);g.globalAlpha=fade*.9;g.lineWidth=2;g.beginPath();g.arc(0,0,13,0,6.3);g.stroke();g.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2;g.moveTo(Math.cos(a)*5,Math.sin(a)*5);g.lineTo(Math.cos(a)*19,Math.sin(a)*19)}g.stroke();g.restore()}
  g.restore()}
 {const _dp=BOSS6.drawProj;BOSS6.drawProj=function(gc,cx,cy){_dp.call(this,gc,cx,cy);try{if(A)drawArena(gc,cx,cy,performance.now())}catch(e){console.error('ARENA7 draw',e)}}}
 // leaving (or reloading) the world drops the arena without a defeat card
 {const _lw=loadWorld;loadWorld=function(){A=null;return _lw.apply(this,arguments)}}
 return{get arena(){return A},nameOf,colOf}})();
