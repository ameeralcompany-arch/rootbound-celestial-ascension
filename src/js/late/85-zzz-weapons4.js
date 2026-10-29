// ===== WFX10: the 32 weapons that still shared the generic swing now each have their own move, VFX and sound.
// Evolution lines keep one move that grows with every stage (more projectiles, bigger radius, a finisher at stage 4).
// Weapons still harvest trees, but they never break blocks: only the tiny tools (TOOLS8) do. Fists still open Tackle Boxes. =====
const WFX10=(()=>{
 const R=Math.random,Q=[];
 const pos=()=>({x:P.x,y:P.y+23});
 const rad=m=>Math.max(m.w,m.h)*.5,live=m=>!m.dead&&m.hp>0,cy0=m=>m.y+m.h/2;
 const dist=(m,x,y)=>Math.hypot(m.x-x,cy0(m)-y);
 const near=(x,y,r)=>mobs.filter(m=>live(m)&&dist(m,x,y)<r+rad(m));
 const dmg=(w,k)=>Math.max(1,Math.round(dmgM(w)*(k||1)));
 const hit=(m,w,k,ang)=>{try{hurtMob(m,dmg(w,k),w,ang==null?Math.atan2(cy0(m)-P.y,m.x-P.x):ang)}catch(e){console.error(e)}};
 const facing=(m,o,a,arc)=>{let d=Math.abs(Math.atan2(cy0(m)-o.y,m.x-o.x)-a);if(d>Math.PI)d=2*Math.PI-d;return d<arc};
 const segDist=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy||1;let t=((px-ax)*dx+(py-ay)*dy)/l;t=Math.max(0,Math.min(1,t));return Math.hypot(px-(ax+dx*t),py-(ay+dy*t))};
 const solid=(x,y)=>solidAt(Math.floor(x/T),Math.floor(y/T));
 const gyAt=(x,y0)=>{const tx=Math.max(1,Math.min(W-2,Math.floor(x/T)));let ty=Math.max(0,Math.floor(y0/T));for(let i=0;i<20&&ty<H-1;i++,ty++)if(solidAt(tx,ty))return ty*T;return y0};
 const red=()=>typeof QM!='undefined'&&QM&&QM.reduce;
 const spark=(x,y,c,n,sp,l)=>{if(red())n=Math.ceil(n/3);for(let i=0;i<n;i++){const a=R()*6.28,v=(.3+R())*(sp||120);VFX.add(1,c,x,y,Math.cos(a)*v,Math.sin(a)*v,l||.45,9,2,{a:1})}};
 const mote=(x,y,c,s,l)=>{if(!red()||R()<.3)VFX.add(0,c,x,y,0,0,l||.3,s||12,2,{a:.7})};
 const bdOf=w=>w.bd+bonus().pow+(wUp[wp]|0)+Math.floor(prof.mine.l/6);
 const brk=(tx,ty,w)=>false; // moves, projectiles and explosions no longer dig (only tools break blocks)
 const tone=(a,b,d,ty,v,dl,vib)=>{try{SFX7.tone(a,b,d,ty,v,dl,vib)}catch(_){}};
 const shk=v=>{shake=Math.max(shake,red()?0:v)};
 const st=w=>w.st||1;
 const clampTo=(o,c,max)=>{const d=Math.hypot(c.x-o.x,c.y-o.y);if(d<=max)return c;const k=max/d;return{x:o.x+(c.x-o.x)*k,y:o.y+(c.y-o.y)*k}};
 const rayLen=(o,a,max)=>{for(let d=T*.5;d<=max;d+=T*.4)if(solid(o.x+Math.cos(a)*d,o.y+Math.sin(a)*d))return d;return max};
 let cmb=0,lastF=0;
 // ---- one move per family
 const BEH={
  // Fists: a 3-hit combo, the third punch is an uppercut that launches
  combo(w,a,o){const t=performance.now();cmb=t-lastF<900?cmb+1:1;lastF=t;const up=cmb%3==0;
   for(const m of near(o.x,o.y,T*1.7))if(facing(m,o,a,1.2)){hit(m,w,up?2.2:1,a);if(up){m.vy=-560;spark(m.x,cy0(m),'#ffe2c0',10,200)}}
   Q.push({k:'pow',x:o.x+Math.cos(a)*T,y:o.y+Math.sin(a)*T,t:.25,t0:.25,big:up});if(up)shk(.08);tone(up?200:170,up?560:120,up?.2:.08,'triangle',.06)},
  // Frying Pan: huge knockback BONK, dizzy stars circle the stunned monster
  bonk(w,a,o){let any=0;for(const m of near(o.x,o.y,T*1.8))if(facing(m,o,a,1.1)){hit(m,w,1,a);m.vx+=Math.cos(a)*560;m.vy=-300;m.stun=Math.max(m.stun||0,2);m.bonk=2;any=1;try{ft(m.x,m.y-28,'BONK!','#fff3a0')}catch(_){}}
   Q.push({k:'pow',x:o.x+Math.cos(a)*T,y:o.y+Math.sin(a)*T,t:.22,t0:.22,ring:'#e8e8f4'});tone(any?320:260,any?640:300,.22,'sine',.06,0,1)},
  // Emberbrand: the slash leaves burning patches on the ground
  firetrail(w,a,o){for(const m of near(o.x,o.y,T*1.9))if(facing(m,o,a,1.1))hit(m,w,1,a);const d=Math.cos(a)>=0?1:-1;
   for(let i=1;i<=3;i++){const x=o.x+d*T*i*1.1;Q.push({k:'flame',x,gy:gyAt(x,o.y-T),t:2.4,t0:2.4,w,tk:.2*i})}tone(300,180,.25,'sawtooth',.03);tone(520,260,.2,'sine',.03,.03)},
  // Glacial Edge: a frost cone freezes monsters solid, hitting a frozen one shatters it for big damage
  freeze(w,a,o){for(const m of near(o.x,o.y,T*2.6))if(facing(m,o,a,.8)){if(m.frz>0){hit(m,w,1.9,a);m.frz=0;spark(m.x,cy0(m),'#e8fbff',16,220);tone(1800,1200,.18,'sine',.04)}else{hit(m,w,1,a);m.frz=1.4;m.stun=Math.max(m.stun||0,1.4)}}
   Q.push({k:'cone',a,t:.32,t0:.32});tone(1400,900,.25,'sine',.035);tone(2100,1600,.2,'sine',.015,.04)},
  // Viper Reed: lobs a bubble that bursts into a poison cloud (each tick heals you a little)
  cloud(w,a,o){Q.push({k:'bub',x:o.x,y:o.y,vx:Math.cos(a)*520,vy:Math.sin(a)*520-160,l:1.4,w});tone(420,700,.14,'sine',.04)},
  // Crimson Fang: life orbs fly back to you from every hit, deals more damage while you are hurt
  drain(w,a,o){const lowHp=P.hp<maxHP()*.35,k=lowHp?1.6:1;for(const m of near(o.x,o.y,T*2))if(facing(m,o,a,1.1)){hit(m,w,k,a);for(let i=0;i<2;i++)Q.push({k:'orb',x:m.x,y:cy0(m),vx:(R()-.5)*260,vy:-120-R()*160,t:0})}
   Q.push({k:'pow',x:o.x+Math.cos(a)*T,y:o.y+Math.sin(a)*T,t:.2,t0:.2,ring:'#ff3c50'});tone(lowHp?160:220,lowHp?90:130,.25,'sawtooth',.035)},
  // Arcane Lash: three homing arcane missiles that chip through blocks
  missiles(w,a,o){for(let i=-1;i<=1;i++){const q=a+i*.5;Q.push({k:'mis',x:o.x,y:o.y,vx:Math.cos(q)*420,vy:Math.sin(q)*420,l:2,w,b:2})}for(let i=0;i<3;i++)tone(700+i*180,1100+i*180,.12,'sine',.025,i*.04)},
  // Void Reaper: opens a small black hole that drags monsters in, then collapses
  vortex(w,a,o,c){const p=clampTo(o,c,T*6);Q.push({k:'hole',x:p.x,y:p.y,t:1.1,t0:1.1,w,tk:0});tone(120,60,1,'sine',.06,0,1);tone(300,90,.9,'triangle',.02)},
  // Twin Glaives: you spin like a top with both blades out, hitting everything around you
  spin(w,a,o){Q.push({k:'spin',t:.5,t0:.5,w,cd:new Map()});tone(500,900,.3,'sine',.035,0,1);tone(900,500,.3,'sine',.02,.15)},
  // Thunder Hammer: calls a lightning bolt onto the cursor that stuns and smashes 3x3 blocks
  thunder(w,a,o,c){const p=clampTo(o,c,T*7),gy=gyAt(p.x,p.y-T);Q.push({k:'bolt',x:p.x,y:gy,t:.35,t0:.35,seed:R()*99});
   for(const m of near(p.x,gy-T,T*1.8)){hit(m,w,1.3);m.stun=Math.max(m.stun||0,2)}const tx=Math.floor(p.x/T),ty=Math.floor(gy/T);for(let dx=-1;dx<=1;dx++)for(let dy=0;dy<=2;dy++)brk(tx+dx,ty+dy-1,w);
   shk(.2);VFX.wave(p.x,gy,'#fff07a',T*2,.4,.3);spark(p.x,gy,'#fff6b0',14,240);snd(70,.4,'sawtooth',.07,.4);tone(1200,200,.3,'triangle',.03)},
  // Harvest Sickle: throws a green crescent that cuts through monsters and harvests trees it passes
  crescent(w,a,o){Q.push({k:'cres',x:o.x,y:o.y,vx:Math.cos(a)*640,vy:Math.sin(a)*640,a,l:.75,w,hit:new Set(),tr:new Set()});tone(800,1300,.18,'sine',.035)},
  // Ember Line: fireballs that explode, more of them every stage; Sunfall Solaris also drops a meteor
  fireball(w,a,o,c){const s=st(w),n=[1,1,2,3][s-1]||1;for(let i=0;i<n;i++){const q=a+(i-(n-1)/2)*.2;Q.push({k:'fb',x:o.x,y:o.y,vx:Math.cos(q)*600,vy:Math.sin(q)*600,l:1.6,w,r:T*(1+.35*s),s})}
   if(s>=4){const p=clampTo(o,c,T*8);Q.push({k:'fb',met:1,x:p.x+T*2*(R()-.5),y:cam.y-T,vx:0,vy:950,l:3,w,r:T*3,s})}tone(260,520,.25,'sawtooth',.03);tone(180,90,.3,'sine',.04)},
  // Frost Line: a frost nova ring around you, bigger every stage; Absolute Zero freezes everything it touches
  nova(w,a,o){const s=st(w);Q.push({k:'nova',x:o.x,y:o.y,t:.45,t0:.45,Rr:T*(1.8+.6*s),w,s,hit:new Set()});for(let i=0;i<3;i++)tone(1300+i*300,2000+i*300,.4,'sine',.02,i*.05)},
  // Storm Line: chain lightning that jumps between monsters, more jumps every stage
  chain(w,a,o,c){const s=st(w),jumps=1+s;let from=null,bd=T*3.5;for(const m of mobs)if(live(m)){const d=dist(m,c.x,c.y);if(d<bd&&Math.hypot(m.x-o.x,cy0(m)-o.y)<T*9){bd=d;from=m}}
   if(!from){const p=clampTo(o,c,T*6);Q.push({k:'zap',pts:[[o.x,o.y],[p.x,p.y]],t:.25,t0:.25});tone(1500,700,.12,'square',.012);return}
   const pts=[[o.x,o.y]],done=new Set();let cur=from,k=1;for(let j=0;j<jumps&&cur;j++){done.add(cur);pts.push([cur.x,cy0(cur)]);hit(cur,w,k);cur.stun=Math.max(cur.stun||0,.6);spark(cur.x,cy0(cur),'#fff6a0',8,180);k*=.85;
    let nx=null,nd=T*4.5;for(const m of mobs)if(live(m)&&!done.has(m)){const d=dist(m,cur.x,cy0(cur));if(d<nd){nd=d;nx=m}}cur=nx}
   if(s>=4)Q.push({k:'bolt',x:from.x,y:from.y+from.h,t:.35,t0:.35,seed:R()*99});Q.push({k:'zap',pts,t:.3,t0:.3});shk(.06);for(let i=0;i<pts.length-1;i++)tone(1800-i*120,900,.1,'triangle',.02,i*.04)},
  // Shadow Line: a shadow dash that slices through everything in your path, longer every stage
  blink(w,a,o){const s=st(w),D=T*(2.6+s),ca=Math.cos(a),sa=Math.sin(a)*.35,x0=P.x,y0=P.y;let d=0;
   for(;d<D;d+=T*.25){const nx=x0+ca*(d+T*.25),ny=y0+sa*(d+T*.25);if(solid(nx,ny+6)||solid(nx,ny+P.h*.5)||solid(nx,ny+P.h-6))break}
   const x1=x0+ca*d,y1=y0+sa*d;for(const m of mobs)if(live(m)&&segDist(m.x,cy0(m),x0,y0+23,x1,y1+23)<rad(m)+22){hit(m,w,1.1,a);spark(m.x,cy0(m),'#b690ff',10,180)}
   for(let i=0;i<5;i++)Q.push({k:'ghost',x:x0+(x1-x0)*i/5,y:y0+(y1-y0)*i/5,f:P.f,t:.35+i*.05,t0:.6});P.x=x1;P.y=y1;P.vy=Math.min(P.vy,0)*.3;tone(600,140,.25,'sine',.04);tone(1200,300,.2,'triangle',.015)},
  // Solarfang: a beam of sunlight that burns along its whole length
  beam(w,a,o){const L=rayLen(o,a,T*7);Q.push({k:'beam',a,L,t:.4,t0:.4,w,tk:0});brk(Math.floor((o.x+Math.cos(a)*(L+4))/T),Math.floor((o.y+Math.sin(a)*(L+4))/T),w);tone(880,1320,.4,'sine',.035,0,1);tone(440,660,.4,'triangle',.015)},
  // Frostbite: a row of ice spikes erupts from the ground towards the cursor
  spikes(w,a,o){const d=Math.cos(a)>=0?1:-1;for(let i=0;i<6;i++){const x=o.x+d*T*(1+i*.9);Q.push({k:'spike',x,gy:gyAt(x,o.y-T),dl:i*.06,t:.7,t0:.7,w,on:0})}},
  // Astral Katana: stars rain down around the cursor
  starfall(w,a,o,c){const p=clampTo(o,c,T*8);for(let i=0;i<5;i++)Q.push({k:'star',x:p.x+(R()-.5)*T*4,y:cam.y-T-i*T*.8,vx:(R()-.5)*60,vy:780+R()*240,l:3,w,rot:R()*6});for(let i=0;i<5;i++)tone(1600+R()*900,2400,.2,'sine',.015,i*.08)},
  // Crimson Rift: tears a rift open at the cursor that keeps cutting whatever is inside
  rift(w,a,o,c){const p=clampTo(o,c,T*5);Q.push({k:'rift',x:p.x,y:p.y,a,t:1.2,t0:1.2,w,tk:0});tone(200,90,.6,'sawtooth',.03);tone(90,60,1,'sine',.05)},
  // Verdant Bloom: roots burst up under monsters near the cursor and hold them; each squeeze heals you
  roots(w,a,o,c){const p=clampTo(o,c,T*7),ms=near(p.x,p.y,T*4).sort((m1,m2)=>dist(m1,p.x,p.y)-dist(m2,p.x,p.y)).slice(0,4);
   if(!ms.length){const gy=gyAt(p.x,p.y-T);Q.push({k:'root',x:p.x,gy,t:.8,t0:.8});brk(Math.floor(p.x/T),Math.floor(gy/T),w)}
   for(const m of ms){m.stun=Math.max(m.stun||0,1.6);Q.push({k:'root',m,x:m.x,gy:m.y+m.h,t:1.6,t0:1.6,w,tk:0})}tone(180,260,.35,'triangle',.03);tone(520,780,.25,'sine',.02,.1)}
 };
 const KIND={fist:'combo',pan:'bonk',ember:'firetrail',frost:'freeze',venom:'cloud',blood:'drain',arcane:'missiles',void:'vortex',glaive:'spin',hammer:'thunder',sickle:'crescent',
  solarfang:'beam',frostbite:'spikes',astralkat:'starfall',crimsonrift:'rift',verdant:'roots'};
 for(const[id0,fam]of[['cinder','fireball'],['rime','nova'],['spark','chain'],['umbra','blink']])for(let i=0;i<4;i++)KIND[i?id0+i:id0]=fam;
 const MOVE={combo:'3-hit combo, the 3rd punch launches',bonk:'BONK! huge knockback and dizzy stars',firetrail:'Leaves burning patches on the ground',freeze:'Freezes monsters; hit a frozen one to shatter it',cloud:'Lobs a poison cloud that heals you',drain:'Life orbs fly back to you; stronger when hurt',missiles:'Three homing arcane missiles',vortex:'Opens a black hole that drags monsters in',spin:'Spin attack that hits all around you',thunder:'Calls lightning on the cursor',crescent:'Thrown crescent that also harvests trees',fireball:'Exploding fireballs (more each stage)',nova:'Frost nova ring (bigger each stage)',chain:'Chain lightning (more jumps each stage)',blink:'Shadow dash through enemies',beam:'Sunlight beam',spikes:'Ice spikes erupt from the ground',starfall:'Stars rain on the cursor',rift:'A rift that keeps cutting',roots:'Roots hold monsters and heal you'};
 for(const id in KIND)if(WPN[id])WPN[id].move=MOVE[KIND[id]];
 function use(w){const cdm=over>0?.5:1;wcd=w.cd*cdm/(1+bonus().atk);swing=.22;const c={x:mx+cam.x,y:my+cam.y},o=pos(),a=Math.atan2(c.y-o.y,c.x-o.x);P.f=Math.cos(a)>=0?1:-1;
  slashes.push({x:o.x,y:o.y,a,t:performance.now(),w});try{FX7.weaponAnim(w.id)}catch(_){}
  const tk=pickTree(c.x,c.y);if(tk>=0&&Math.hypot((tk%W)*T+T/2-P.x,(tk/W|0)*T+T/2-(P.y+P.h/2))<REACH+T){harvest(tk);return}
  const tx=Math.floor(c.x/T),ty=Math.floor(c.y/T);if(Math.hypot(tx*T+T/2-P.x,ty*T+T/2-(P.y+P.h/2))<REACH)try{wTryBreak(tx,ty,w)}catch(_){}
  BEH[KIND[w.id]](w,a,o,c)}
 {const _uw=useWeapon;useWeapon=function(){const w=WPN[wp];if(w&&KIND[w.id]&&(own[w.id]||!w.cost)){use(w);return}return _uw.apply(this,arguments)}}
 function boom(x,y,r,w,k,col){for(const m of near(x,y,r))hit(m,w,k,Math.atan2(cy0(m)-y,m.x-x));Q.push({k:'blast',x,y,r,t:.4,t0:.4,c:col});spark(x,y,'rgb('+col+')',16,240);
  const bx=Math.floor(x/T),by=Math.floor(y/T);for(const[dx,dy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])brk(bx+dx,by+dy,w)}
 function tick(dt){const o=pos();
  for(const m of mobs){if(m.frz>0)m.frz-=dt;if(m.bonk>0)m.bonk-=dt}
  for(let i=Q.length-1;i>=0;i--){const p=Q[i];let dead=false;
   if(p.k=='flame'){p.t-=dt;p.tk-=dt;if(R()<.5)mote(p.x+(R()-.5)*T*.6,p.gy-4-R()*10,R()<.5?'#ffb040':'#ff6a20',10,.35);
    if(p.tk<=0){p.tk=.4;const tn=performance.now();for(const m of mobs)if(live(m)&&!(m.flT>tn)&&Math.abs(m.x-p.x)<T*.8+m.w/2&&Math.abs(m.y+m.h-p.gy)<T){m.flT=tn+380;hit(m,p.w,.35);m.burn=Math.max(m.burn||0,1.5)}}dead=p.t<=0}   // overlapping patches burn a monster once per tick (they used to stack)
   else if(p.k=='bub'){p.l-=dt;p.vy+=800*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;let pop=p.l<=0||solid(p.x,p.y);for(const m of mobs)if(live(m)&&dist(m,p.x,p.y)<rad(m)+10){pop=true;break}
    if(pop){dead=true;Q.push({k:'cloud',x:p.x,y:p.y,t:3,t0:3,r:T*1.8,w:p.w,tk:0});SFX7.bloop&&SFX7.bloop(.8);spark(p.x,p.y,'#8aff9a',10,140)}}
   else if(p.k=='cloud'){p.t-=dt;p.tk-=dt;if(R()<.4)mote(p.x+(R()-.5)*p.r*1.4,p.y+(R()-.5)*p.r,'rgba(120,255,140,.8)',22,.6);
    if(p.tk<=0){p.tk=.5;let any=0;for(const m of near(p.x,p.y,p.r)){hit(m,p.w,.3);any=1}if(any)P.hp=Math.min(maxHP(),P.hp+1)}dead=p.t<=0}
   else if(p.k=='orb'){p.t+=dt;const dx=P.x-p.x,dy=P.y+20-p.y,d=Math.hypot(dx,dy)||1,pull=Math.min(1,p.t*1.6);p.vx+=(dx/d*900*pull-p.vx*1.5)*dt;p.vy+=(dy/d*900*pull-p.vy*1.5)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    if(d<16||p.t>2){dead=true;P.hp=Math.min(maxHP(),P.hp+2);tone(900,1300,.08,'sine',.02)}}
   else if(p.k=='mis'){p.l-=dt;let tg=null,bd=T*8;for(const m of mobs)if(live(m)){const d=dist(m,p.x,p.y);if(d<bd){bd=d;tg=m}}
    const sp=Math.min(760,Math.hypot(p.vx,p.vy)+dt*500);let a0=Math.atan2(p.vy,p.vx);if(tg){let da=Math.atan2(cy0(tg)-p.y,tg.x-p.x)-a0;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;a0+=Math.max(-6*dt,Math.min(6*dt,da))}
    p.vx=Math.cos(a0)*sp;p.vy=Math.sin(a0)*sp;p.x+=p.vx*dt;p.y+=p.vy*dt;mote(p.x,p.y,'#ff8ae8',10,.3);
    if(solid(p.x,p.y)){brk(Math.floor(p.x/T),Math.floor(p.y/T),p.w);spark(p.x,p.y,'#ffb0f0',6,120);if(--p.b<=0)dead=true;else{p.vx*=-.6;p.vy*=-.6}}
    for(const m of mobs)if(live(m)&&dist(m,p.x,p.y)<rad(m)+8){hit(m,p.w,.6,a0);spark(p.x,p.y,'#ff9af0',8,150);tone(1300,1800,.06,'sine',.015);dead=true;break}if(p.l<=0)dead=true}
   else if(p.k=='hole'){p.t-=dt;p.tk-=dt;for(const m of near(p.x,p.y,T*4)){if(m.boss)continue;m.vx+=(p.x-m.x)*5*dt*60*.05;m.vy+=(p.y-cy0(m))*5*dt*60*.05}
    if(R()<.7){const an=R()*6.28,r=T*(1.5+R()*2);VFX.add(0,'#b07aff',p.x+Math.cos(an)*r,p.y+Math.sin(an)*r,-Math.cos(an)*r*2.2,-Math.sin(an)*r*2.2,.45,8,2,{a:.8})}
    if(p.tk<=0){p.tk=.25;for(const m of near(p.x,p.y,T*1.4))hit(m,p.w,.25)}if(p.t<=0){dead=true;boom(p.x,p.y,T*2.5,p.w,1.5,'170,90,255');shk(.15);snd(80,.35,'sawtooth',.07,.4)}}
   else if(p.k=='spin'){p.t-=dt;const el=p.t0-p.t;for(const m of near(o.x,o.y,T*2.1))if((p.cd.get(m)||0)<=el){p.cd.set(m,el+.15);hit(m,p.w,.55);spark(m.x,cy0(m),'#8ad0ff',5,140)}
    if(R()<.8)mote(o.x+Math.cos(el*30)*T*1.8,o.y+Math.sin(el*30)*T*1.2,'#9ad8ff',11,.25);dead=p.t<=0}
   else if(p.k=='cres'){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(R()<.7)mote(p.x,p.y,'#c8ff9a',11,.3);
    try{const tk=pickTree(p.x,p.y);if(tk>=0&&!p.tr.has(tk)){p.tr.add(tk);harvest(tk)}}catch(_){}
    if(solid(p.x,p.y)){brk(Math.floor(p.x/T),Math.floor(p.y/T),p.w);spark(p.x,p.y,'#d8ffb0',6,110);dead=true}
    for(const m of mobs)if(live(m)&&!p.hit.has(m)&&dist(m,p.x,p.y)<rad(m)+16){p.hit.add(m);hit(m,p.w,1,p.a);spark(p.x,p.y,'#d8ffb0',7,150)}if(p.l<=0)dead=true}
   else if(p.k=='fb'){p.l-=dt;if(!p.met)p.vy+=120*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;mote(p.x,p.y,R()<.5?'#ffb040':'#ff5a20',p.met?22:13,.35);
    let ex=p.l<=0||(p.met?p.y>cam.y&&solid(p.x,p.y):solid(p.x,p.y));if(!ex)for(const m of mobs)if(live(m)&&dist(m,p.x,p.y)<rad(m)+(p.met?18:10)){ex=true;break}
    if(ex){dead=true;boom(p.x,p.y,p.r,p.w,p.met?2:1,'255,140,40');shk(p.met?.25:.06);snd(p.met?55:110,p.met?.5:.25,'sawtooth',p.met?.09:.05,.4);if(p.met)VFX.wave(p.x,p.y,'#ff9a3a',p.r*1.4,.5,.3)}}
   else if(p.k=='nova'){p.t-=dt;const r=p.Rr*(1-p.t/p.t0);for(const m of mobs)if(live(m)&&!p.hit.has(m)&&dist(m,p.x,p.y)<r+rad(m)){p.hit.add(m);hit(m,p.w,1);m.slow=3;m.frz=p.s>=4?2.5:.4+.25*p.s;m.stun=Math.max(m.stun||0,m.frz);spark(m.x,cy0(m),'#d8f6ff',8,160)}
    if(p.s>=3&&!p.sp&&p.t<p.t0*.5){p.sp=1;const n=p.s>=4?10:6;for(let j=0;j<n;j++){const x=p.x+(j-(n-1)/2)*T*.9;Q.push({k:'spike',x,gy:gyAt(x,p.y-T),dl:Math.abs(j-(n-1)/2)*.04,t:.7,t0:.7,w:p.w,on:0,quiet:1})}}dead=p.t<=0}
   else if(p.k=='zap'||p.k=='pow'||p.k=='cone'||p.k=='blast'||p.k=='bolt'||p.k=='ghost'){p.t-=dt;dead=p.t<=0}
   else if(p.k=='beam'){p.t-=dt;p.tk-=dt;const ex=o.x+Math.cos(p.a)*p.L,ey=o.y+Math.sin(p.a)*p.L;if(p.tk<=0){p.tk=.08;for(const m of mobs)if(live(m)&&segDist(m.x,cy0(m),o.x,o.y,ex,ey)<rad(m)+10){hit(m,p.w,.3,p.a);m.burn=Math.max(m.burn||0,1)}}
    if(R()<.8)mote(ex,ey,'#fff0a0',16,.3);dead=p.t<=0}
   else if(p.k=='spike'){if(p.dl>0){p.dl-=dt}else{if(!p.on){p.on=1;if(!p.quiet)tone(1500+R()*400,900,.15,'sine',.025);spark(p.x,p.gy,'#e0f8ff',5,140);for(const m of mobs)if(live(m)&&Math.abs(m.x-p.x)<T*.7+m.w/2&&Math.abs(m.y+m.h-p.gy)<T*1.3){hit(m,p.w,.9,-Math.PI/2);m.vy=-380;m.slow=2}}p.t-=dt;dead=p.t<=0}}
   else if(p.k=='star'){p.l-=dt;p.rot+=dt*8;p.x+=p.vx*dt;p.y+=p.vy*dt;mote(p.x,p.y,'#fff6c0',10,.35);let ex=p.l<=0||(p.y>cam.y&&solid(p.x,p.y));if(!ex)for(const m of mobs)if(live(m)&&dist(m,p.x,p.y)<rad(m)+10){ex=true;break}
    if(ex){dead=true;boom(p.x,p.y,T*1.1,p.w,.7,'255,240,170');tone(2000,1200,.12,'sine',.02)}}
   else if(p.k=='rift'){p.t-=dt;p.tk-=dt;if(p.tk<=0){p.tk=.15;for(const m of near(p.x,p.y,T*1.6)){hit(m,p.w,.35,p.a);spark(m.x,cy0(m),'#ff4060',4,120)}tone(400+R()*200,200,.06,'sawtooth',.012)}dead=p.t<=0}
   else if(p.k=='root'){p.t-=dt;if(p.m){if(!live(p.m))dead=true;else{p.x=p.m.x;p.gy=p.m.y+p.m.h;p.m.vx*=.5;p.tk-=dt;if(p.tk<=0){p.tk=.4;hit(p.m,p.w,.4);P.hp=Math.min(maxHP(),P.hp+1)}}}if(p.t<=0)dead=true}
   if(dead)Q.splice(i,1)}}
 // ---- drawing
 function draw(g,cx,cy){const o=pos(),t=performance.now()/1000;g.save();g.lineCap='round';g.lineJoin='round';
  for(const m of mobs){if(!live(m))continue;
   if(m.frz>0){const a=Math.min(1,m.frz*2);g.fillStyle='rgba(190,235,255,'+(.35*a)+')';g.strokeStyle='rgba(235,250,255,'+(.9*a)+')';g.lineWidth=2;g.beginPath();g.rect(m.x-m.w/2-5-cx,m.y-5-cy,m.w+10,m.h+10);g.fill();g.stroke();g.strokeStyle='rgba(255,255,255,'+(.7*a)+')';g.beginPath();g.moveTo(m.x-m.w/2-cx,m.y-cy+4);g.lineTo(m.x-m.w/2+8-cx,m.y-cy);g.stroke()}
   if(m.bonk>0){g.fillStyle='#fff3a0';for(let i=0;i<3;i++){const an=t*5+i*2.09,x=m.x-cx+Math.cos(an)*14,y=m.y-cy-10+Math.sin(an)*4;g.beginPath();for(let j=0;j<10;j++){const r=j%2?2:5,b=j*Math.PI/5;g.lineTo(x+Math.cos(b)*r,y+Math.sin(b)*r)}g.closePath();g.fill()}}}
  for(const p of Q){const k=p.t0?Math.max(0,p.t/p.t0):1;
   if(p.k=='pow'){const e=1-k,x=p.x-cx,y=p.y-cy;g.strokeStyle=p.ring||(p.big?'#ffd8a0':'#fff2e0');g.globalAlpha=k;g.lineWidth=p.big?5:3;g.beginPath();g.arc(x,y,(p.big?26:14)*(.4+e),0,6.3);g.stroke();
    if(p.big){for(let j=0;j<6;j++){const an=j*1.047;g.beginPath();g.moveTo(x+Math.cos(an)*20*e,y+Math.sin(an)*20*e);g.lineTo(x+Math.cos(an)*34*e,y+Math.sin(an)*34*e);g.stroke()}}g.globalAlpha=1}
   else if(p.k=='flame'){const a=Math.min(1,p.t/.4);for(let j=0;j<3;j++){const x=p.x-cx+(j-1)*T*.28,h=(14+Math.sin(t*14+j*2+p.x)*5)*a,y=p.gy-cy;const gr=g.createLinearGradient(x,y,x,y-h);gr.addColorStop(0,'rgba(255,90,20,'+(.85*a)+')');gr.addColorStop(1,'rgba(255,220,90,0)');g.fillStyle=gr;g.beginPath();g.moveTo(x-6,y);g.quadraticCurveTo(x-4,y-h*.6,x,y-h);g.quadraticCurveTo(x+4,y-h*.6,x+6,y);g.closePath();g.fill()}}
   else if(p.k=='cone'){const e=1-k;g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(o.x-cx,o.y-cy,4,o.x-cx,o.y-cy,T*2.6);gr.addColorStop(0,'rgba(220,245,255,'+(.6*k)+')');gr.addColorStop(1,'rgba(150,220,255,0)');g.fillStyle=gr;g.beginPath();g.moveTo(o.x-cx,o.y-cy);g.arc(o.x-cx,o.y-cy,T*2.6*(.5+e*.5),p.a-.8,p.a+.8);g.closePath();g.fill();g.globalCompositeOperation='source-over'}
   else if(p.k=='bub'){const x=p.x-cx,y=p.y-cy;g.fillStyle='rgba(120,255,140,.55)';g.strokeStyle='#d8ffe0';g.lineWidth=2;g.beginPath();g.arc(x,y,9,0,6.3);g.fill();g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(x-3,y-3,2,0,6.3);g.fill()}
   else if(p.k=='cloud'){const a=Math.min(1,p.t/.5,(p.t0-p.t)/.3);g.globalAlpha=.45*a;g.fillStyle='#6ad87a';for(let j=0;j<6;j++){const an=j*1.047+t*.6;g.beginPath();g.arc(p.x-cx+Math.cos(an)*p.r*.45,p.y-cy+Math.sin(an)*p.r*.3,p.r*.5,0,6.3);g.fill()}g.globalAlpha=1}
   else if(p.k=='orb'){const x=p.x-cx,y=p.y-cy;g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(x,y,1,x,y,10);gr.addColorStop(0,'#fff');gr.addColorStop(.4,'rgba(255,60,80,.9)');gr.addColorStop(1,'rgba(255,0,40,0)');g.fillStyle=gr;g.fillRect(x-10,y-10,20,20);g.globalCompositeOperation='source-over'}
   else if(p.k=='mis'){const x=p.x-cx,y=p.y-cy;g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(x,y,1,x,y,12);gr.addColorStop(0,'#fff');gr.addColorStop(.4,'rgba(255,90,230,.9)');gr.addColorStop(1,'rgba(200,40,200,0)');g.fillStyle=gr;g.fillRect(x-12,y-12,24,24);g.globalCompositeOperation='source-over'}
   else if(p.k=='hole'){const x=p.x-cx,y=p.y-cy,gr0=Math.min(1,(p.t0-p.t)/.2),r=T*.9*gr0*(p.t<.15?p.t/.15:1);g.fillStyle='#0a0414';g.beginPath();g.arc(x,y,r,0,6.3);g.fill();g.strokeStyle='rgba(190,120,255,.9)';g.lineWidth=3;for(let j=0;j<3;j++){g.beginPath();g.arc(x,y,r+4+j*5,t*4+j,t*4+j+3.6);g.stroke()}}
   else if(p.k=='spin'){g.save();g.translate(o.x-cx,o.y-cy);const el=p.t0-p.t;for(let j=0;j<2;j++){g.save();g.rotate(el*30+j*Math.PI);g.translate(T*1.6,0);g.rotate(el*40);g.fillStyle='#d8f0ff';g.strokeStyle='#1d3d5a';g.lineWidth=2;g.beginPath();g.moveTo(-12,0);g.quadraticCurveTo(0,-12,12,0);g.quadraticCurveTo(0,-4,-12,0);g.fill();g.stroke();g.restore()}
    g.strokeStyle='rgba(140,210,255,'+(.5*k)+')';g.lineWidth=4;g.beginPath();g.arc(0,0,T*1.6,0,6.3);g.stroke();g.restore()}
   else if(p.k=='bolt'){const x=p.x-cx,y=p.y-cy,top=-cy+cam.y-20;let s=p.seed;const rr=()=>{s=(s*9301+49297)%233280;return s/233280};g.globalCompositeOperation='lighter';
    for(const[c,wd]of[['rgba(255,240,120,'+(.5*k)+')',10],['rgba(255,255,230,'+k+')',3]]){g.strokeStyle=c;g.lineWidth=wd;g.beginPath();g.moveTo(x+(rr()-.5)*40,top);let s2=s;for(let j=1;j<=8;j++){g.lineTo(x+(j<8?(rr()-.5)*36:0),top+(y-top)*j/8)}s=s2;g.stroke()}g.globalCompositeOperation='source-over'}
   else if(p.k=='cres'){g.save();g.translate(p.x-cx,p.y-cy);g.rotate(p.a);g.fillStyle='#d8ffb0';g.strokeStyle='#2a5a1a';g.lineWidth=2;g.beginPath();g.arc(0,0,16,-1.3,1.3);g.arc(-7,0,13,1.2,-1.2,true);g.closePath();g.fill();g.stroke();g.restore()}
   else if(p.k=='fb'){const x=p.x-cx,y=p.y-cy,r=p.met?24:10;g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(x,y,1,x,y,r*1.8);gr.addColorStop(0,'#fff6d0');gr.addColorStop(.35,'rgba(255,150,40,.95)');gr.addColorStop(1,'rgba(255,60,0,0)');g.fillStyle=gr;g.fillRect(x-r*1.8,y-r*1.8,r*3.6,r*3.6);g.globalCompositeOperation='source-over'}
   else if(p.k=='nova'){const r=p.Rr*(1-k),x=p.x-cx,y=p.y-cy;g.globalCompositeOperation='lighter';g.strokeStyle='rgba(200,240,255,'+k+')';g.lineWidth=8*k+2;g.beginPath();g.arc(x,y,r,0,6.3);g.stroke();g.fillStyle='rgba(170,225,255,'+(.18*k)+')';g.beginPath();g.arc(x,y,r,0,6.3);g.fill();
    g.fillStyle='rgba(255,255,255,'+k+')';for(let j=0;j<10;j++){const an=j*.628+t;g.beginPath();g.arc(x+Math.cos(an)*r,y+Math.sin(an)*r,2.5,0,6.3);g.fill()}g.globalCompositeOperation='source-over'}
   else if(p.k=='zap'){g.globalCompositeOperation='lighter';for(const[c,wd]of[['rgba(255,240,120,'+(.45*k)+')',9],['rgba(255,255,240,'+k+')',2.5]]){g.strokeStyle=c;g.lineWidth=wd;g.beginPath();for(let j=0;j<p.pts.length-1;j++){const[a1,b1]=p.pts[j],[a2,b2]=p.pts[j+1];if(!j)g.moveTo(a1-cx,b1-cy);for(let s=1;s<=5;s++){const u=s/5,jit=s<5?(Math.sin(t*60+j*7+s*3)*9):0;g.lineTo(a1+(a2-a1)*u-cx+jit,b1+(b2-b1)*u-cy-jit)}}g.stroke()}g.globalCompositeOperation='source-over'}
   else if(p.k=='ghost'){if(p.t>p.t0)continue;g.globalAlpha=.4*k;g.fillStyle='#8a5aff';g.beginPath();g.ellipse(p.x-cx,p.y-cy+22,11,22,0,0,6.3);g.fill();g.globalAlpha=1}
   else if(p.k=='beam'){const ca=Math.cos(p.a),sa=Math.sin(p.a),x0=o.x-cx,y0=o.y-cy,x1=x0+ca*p.L,y1=y0+sa*p.L,a=Math.min(1,p.t/.12),wd=1+Math.sin(t*50)*.15;g.globalCompositeOperation='lighter';
    for(const[c,lw]of[['rgba(255,190,60,'+(.35*a)+')',22],['rgba(255,230,120,'+(.7*a)+')',10],['rgba(255,255,240,'+a+')',3.5]]){g.strokeStyle=c;g.lineWidth=lw*wd;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke()}g.globalCompositeOperation='source-over'}
   else if(p.k=='spike'){if(p.dl>0)continue;const e=Math.min(1,(p.t0-p.t)/.08),a=Math.min(1,p.t/.2),h=T*1.3*e,x=p.x-cx,y=p.gy-cy;g.globalAlpha=a;g.fillStyle='#d8f4ff';g.strokeStyle='#5a9ac0';g.lineWidth=2;g.beginPath();g.moveTo(x-9,y);g.lineTo(x-2,y-h);g.lineTo(x+1,y-h*.7);g.lineTo(x+9,y);g.closePath();g.fill();g.stroke();g.globalAlpha=1}
   else if(p.k=='star'){g.save();g.translate(p.x-cx,p.y-cy);g.rotate(p.rot);g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,240,170,.4)';g.beginPath();g.arc(0,0,14,0,6.3);g.fill();g.globalCompositeOperation='source-over';g.fillStyle='#fff6c8';g.strokeStyle='#8a6a1a';g.lineWidth=1.5;g.beginPath();for(let j=0;j<10;j++){const r=j%2?4:10,b=j*Math.PI/5;g.lineTo(Math.cos(b)*r,Math.sin(b)*r)}g.closePath();g.fill();g.stroke();g.restore()}
   else if(p.k=='rift'){const a=Math.min(1,(p.t0-p.t)/.12,p.t/.2),x=p.x-cx,y=p.y-cy;g.save();g.translate(x,y);g.rotate(p.a+Math.PI/2);g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,40,70,'+(.25*a)+')';g.beginPath();g.ellipse(0,0,T*1.6,T*.6,0,0,6.3);g.fill();g.globalCompositeOperation='source-over';
    g.fillStyle='rgba(20,0,8,'+a+')';g.strokeStyle='rgba(255,90,110,'+a+')';g.lineWidth=2.5;g.beginPath();g.moveTo(-T*1.4,0);for(let j=1;j<8;j++){const u=j/8;g.lineTo(-T*1.4+T*2.8*u,(j%2?-1:1)*(4+Math.sin(t*20+j)*3)*Math.sin(u*Math.PI)*a*2)}g.lineTo(T*1.4,0);for(let j=7;j>0;j--){const u=j/8;g.lineTo(-T*1.4+T*2.8*u,(j%2?1:-1)*(3+Math.cos(t*18+j)*2)*Math.sin(u*Math.PI)*a)}g.closePath();g.fill();g.stroke();g.restore()}
   else if(p.k=='root'){const e=Math.min(1,(p.t0-p.t)/.15),a=Math.min(1,p.t/.25),x=p.x-cx,y=p.gy-cy,h=(p.m?p.m.h*.8:T*1.2)*e;g.globalAlpha=a;g.strokeStyle='#2f6a22';g.lineWidth=5;for(let j=-1;j<=1;j++){g.beginPath();g.moveTo(x+j*8,y);g.bezierCurveTo(x+j*14+Math.sin(t*3+j)*4,y-h*.4,x-j*10,y-h*.7,x+j*4,y-h);g.stroke()}g.strokeStyle='#8ae070';g.lineWidth=2;for(let j=-1;j<=1;j++){g.beginPath();g.moveTo(x+j*8,y);g.bezierCurveTo(x+j*14+Math.sin(t*3+j)*4,y-h*.4,x-j*10,y-h*.7,x+j*4,y-h);g.stroke()}g.globalAlpha=1}
   else if(p.k=='blast'){const e=1-k,x=p.x-cx,y=p.y-cy;g.globalCompositeOperation='lighter';g.strokeStyle='rgba('+p.c+','+k+')';g.lineWidth=6*k+1;g.beginPath();g.arc(x,y,p.r*e,0,6.3);g.stroke();g.fillStyle='rgba('+p.c+','+(.3*k)+')';g.beginPath();g.arc(x,y,p.r*e,0,6.3);g.fill();g.globalCompositeOperation='source-over'}}
  g.restore()}
 {const _t=BOSS6.tick,_dp=BOSS6.drawProj;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){console.error('WFX10',e)}};BOSS6.drawProj=function(gc,cx,cy){_dp.call(this,gc,cx,cy);try{draw(gc,cx,cy)}catch(e){console.error('WFX10d',e)}}}
 return{Q,BEH,KIND,MOVE}})();
