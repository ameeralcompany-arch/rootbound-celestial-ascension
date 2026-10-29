// ===== ARENA7: when a boss spawns, a glowing barrier closes around you and the boss. Nobody leaves until the fight ends.
// The barrier forms when the intro cinematic (BOSS10) hands the camera back (A.t0 in the future = not formed yet; you are still kept inside).
// Win: the barrier turns gold, waits for the outro's camera return, then fades. Lose (you get knocked out): the boss vanishes, the barrier collapses.
// Built for aerial fights: 32 x 18 tiles (higher than any boss attack reaches), so you can fly. The top is a soft ceiling: the last 2.5 tiles
// slow your climb to a stop with a ripple on the barrier (no hard bump), and only the very edge is solid. Wings tire about half as fast inside.
// Camera: while no cinematic owns it (BOSS10.cam), CAMT frames the whole arena; if it does not fit the screen the zoom eases out (once, in
// steps of 5%, never below 70% and never closer than your own zoom, so the tile cache repaints once), and if it still does not fit the camera
// follows the point between you and the boss inside the arena. Your zoom comes back when the arena is gone. Drawn, not built from blocks. =====
const ARENA7=(()=>{
 let A=null;const R=Math.random,AW=32,AH=18,CZ=2.5;
 const sc=()=>cv.height/Math.max(1,innerHeight),hudW=()=>110*sc()/ZM,hudB=()=>Math.max(0,110*sc()/ZM-T);   // the boss bar covers the top ~110 px of the screen and the hotbar the bottom ~110 px (the arena's bottom tile is ground): the arena is framed between them
 const tone=(a,b,d,ty,v,dl,vib)=>{try{SFX7.tone(a,b,d,ty,v,dl,vib)}catch(_){}};
 const colOf=m=>{try{return BOSSES.find(b=>'boss_'+b.id==m.k).c}catch(_){return'#b58cff'}};
 const nameOf=m=>{try{return BOSSES.find(b=>'boss_'+b.id==m.k).n}catch(_){return'The boss'}};
 const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
 const cine=()=>{try{return BOSS10.cam}catch(_){return false}};
 // ---- zoom: ease out just enough to frame the arena, give the player's zoom back afterwards
 function setZ(z){if(z===ZM)return;const k=ZM/z;ZM=z;try{mx*=k;my*=k}catch(_){}}
 function zoomFor(w,h){const fz=Math.min(cv.width/(w+T),(cv.height-220*sc())/(h-T*.5));if(fz>=ZM)return ZM;return Math.max(.7,Math.floor(fz*20)/20)}
 function drop(){if(A&&A.zs!=null&&ZM===A.zs)setZ(A.z0);A=null}
 // ---- open the arena around the player and the boss that just appeared: the floor under you, AH tiles of air above it
 function open(m){if(A)drop();const pad=5*T,x0=Math.min(P.x,m.x-m.w/2)-pad,x1=Math.max(P.x,m.x+m.w/2)+pad,bot=Math.max(P.y+P.h,m.y+m.h)+T,top=Math.min(P.y,m.y)-4*T;
  let w=Math.max(AW*T,x1-x0),h=Math.max(AH*T,bot-top),cx=(x0+x1)/2;w=Math.min(w,(W-2)*T);h=Math.min(h,(H-1)*T);const L=Math.max(T,Math.min((W-1)*T-w,cx-w/2)),Tp=Math.max(0,Math.min((H-1)*T-h,bot-h));
  A={x0:L,x1:L+w,y0:Tp,y1:Tp+h,boss:m,c:colOf(m),t0:performance.now(),end:0,win:false,pend:1,fz:0,fd:900,rip:[],ck:0,cs:0,z0:ZM,zs:null};
  const z=zoomFor(w,h);if(z<ZM){setZ(z);A.zs=z}
  A.fit=w<=cv.width/ZM-T*.5&&h<=cv.height/ZM-hudW()-hudB()}
 {const _sp=BOSS6.spawn;BOSS6.spawn=function(id){const ok=_sp.apply(this,arguments);try{if(ok){const m=BOSS6.active();if(m){open(m);try{BOSS10.intro(m,A)}catch(e){console.error('BOSS10 intro',e);A.t0=performance.now()}}}}catch(e){console.error('ARENA7',e)}return ok}}   // the intro cinematic plays, then the barrier forms
 // ---- keep a body inside (runs after every physics step)
 function hold(o,w,h){if(!A||A.end)return;let hit=false;const l=A.x0+w/2,r=A.x1-w/2;if(o.x<l){o.x=l;hit=true;if(o.vx<0)o.vx=0}else if(o.x>r){o.x=r;hit=true;if(o.vx>0)o.vx=0}
  if(o.y<A.y0){o.y=A.y0;hit=true;if(o.vy<0)o.vy=0}else if(o.y+h>A.y1){o.y=A.y1-h;if(o.vy>0)o.vy=0}return hit}
 // soft ceiling: inside the top CZ tiles the climb speed is capped smoothly down to zero, then a gentle push back down; a ripple shows where you touched
 // the barrier's aura: wings tire about half as fast inside it, so a full climb reaches the soft ceiling
 function ceil(dt){try{const F=FLY7.F;if(F.on&&!A.pend)F.sta=Math.min(1,F.sta+dt/(3.2+.14*F.tier)*.55)}catch(_){}const zt=A.y0+CZ*T;if(P.y>=zt){A.ck=Math.max(0,A.ck-dt*3);return}const k=Math.min(1,(zt-P.y)/(CZ*T)),cap=-380*Math.pow(1-k,1.5);
  if(P.vy<cap)P.vy=cap;if(k>.82&&P.vy<90*(k-.82)/.18)P.vy=90*(k-.82)/.18;A.ck=Math.max(A.ck,k);
  const n=performance.now();if(k>.55&&n-A.cs>420){A.cs=n;A.rip.push({x:P.x,t:n});if(A.rip.length>4)A.rip.shift();if(!A.pend)tone(660,990,.18,'sine',.012)}}
 {const _p=physics;physics=function(dt,ax,busy){const r=_p.apply(this,arguments);try{if(A&&!A.end){ceil(dt);if(hold(P,P.w||24,P.h)&&!A.pend&&R()<.25)VFX.burst(P.x,P.y+P.h/2,[A.c,'#fff'],3,90,1,.35,6)}}catch(_){}return r}}
 function loseSound(){tone(330,220,.5,'sine',.035);tone(262,175,.8,'sine',.03,.25);tone(196,147,1,'sine',.025,.5)}
 function finish(win){if(!A||A.end)return;const m=A.boss;A.end=performance.now();A.win=win;A.pend=0;
  if(win){let left=0;try{left=BOSS10.left()}catch(_){}A.fz=A.end+left;A.fd=1300}   // the outro (BOSS10) plays the collapse; the barrier fades when its camera returns
  else{A.fz=A.end;A.fd=900;loseSound();try{BOSS6.clear()}catch(_){}try{CINE7.bossLose(nameOf(m))}catch(_){try{UI6.say6('DEFEATED',nameOf(m).toUpperCase()+' VANISHED INTO THE DARK',3600)}catch(_){}}}}
 // ---- camera: the whole arena when it fits, else the point between you and the boss, kept inside the arena
 let lastCur='';
 function cam(){if(cine())return;const c=A&&!A.end&&!A.pend?A:null;if(!c){if(window.CAMT)window.CAMT=null;return}
  const vw=cv.width/ZM,vh=cv.height/ZM,hw=hudW(),hb=hudB(),xl=c.x0-T*.5+vw/2,xr=c.x1+T*.5-vw/2,yt=c.y0-hw-T*.25+vh/2,yb=c.y1+hb-vh/2;let x,y;
  if(c.fit){x=(c.x0+c.x1)/2;y=(c.y0-hw+c.y1+hb)/2}
  else{const m=c.boss,on=m&&mobs.includes(m),px=P.x,py=P.y+P.h/2,tx=px*.6+(on?m.x:px)*.4,ty=py*.6+(on?m.y+m.h/2:py)*.4;x=xl<=xr?Math.max(xl,Math.min(xr,tx)):(xl+xr)/2;y=yt<=yb?Math.max(yt,Math.min(yb,ty)):(yt+yb)/2}
  if(!window.CAMT||CAMT.x!==x||CAMT.y!==y)window.CAMT={x,y}}
 {const _t=BOSS6.tick;BOSS6.tick=function(dt){_t.call(this,dt);try{const now=performance.now();
   if(lastCur&&cur!==lastCur&&A)drop();lastCur=cur;
   if(A&&A.pend&&now>=A.t0){A.pend=0;tone(55,110,.9,'sawtooth',.035);tone(880,1760,.6,'sine',.018,.3)}   // the barrier forms
   if(A&&!A.end){const m=A.boss;if(m.rew||m.dead&&m.hp<=0)finish(true);else if(!mobs.includes(m))finish(false);else if(hold(m,m.w,m.h)){m.vx=0}}
   if(A&&A.end&&now>A.fz+A.fd)drop();cam()}catch(e){console.error('ARENA7 tick',e)}}}
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
  // soft ceiling: a faint band that brightens as you climb into it, ripples where you touched it
  if(grow>=1&&!A.end){const bh=CZ*T;g.globalAlpha=.05+.2*A.ck;g.fillStyle=col;g.fillRect(x0,y0,x1-x0,bh*.35);g.globalAlpha=.03+.1*A.ck;g.fillRect(x0,y0+bh*.35,x1-x0,bh*.4);
   g.lineWidth=2;g.strokeStyle='#fff';for(const r of A.rip){const a=(now-r.t)/700;if(a>=1)continue;g.globalAlpha=(1-a)*.8;g.beginPath();g.ellipse(r.x-cx,y0+2,18+a*90,6+a*18,0,0,Math.PI);g.stroke()}}
  g.strokeStyle=col;for(const[px,py]of[[x0,y0],[x1,y0],[x0,y1],[x1,y1]]){g.save();g.translate(px,py);g.rotate(now/900);g.globalAlpha=fade*.9;g.lineWidth=2;g.beginPath();g.arc(0,0,13,0,6.3);g.stroke();g.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2;g.moveTo(Math.cos(a)*5,Math.sin(a)*5);g.lineTo(Math.cos(a)*19,Math.sin(a)*19)}g.stroke();g.restore()}
  g.restore()}
 {const _dp=BOSS6.drawProj;BOSS6.drawProj=function(gc,cx,cy){_dp.call(this,gc,cx,cy);try{if(A)drawArena(gc,cx,cy,performance.now())}catch(e){console.error('ARENA7 draw',e)}}}
 // leaving (or reloading) the world drops the arena without a defeat card
 {const _lw=loadWorld;loadWorld=function(){drop();return _lw.apply(this,arguments)}}
 return{get arena(){return A},nameOf,colOf,AW,AH,CZ}})();
