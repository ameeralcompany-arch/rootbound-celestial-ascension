// ===== BOSS10: boss cinematics + fight presentation.
// Intro (every spawn, ~4.6 s; reduced motion ~2.7 s): letterbox, the camera pans from you to the boss, a boss-specific entrance - the Verdant
// Warden bursts up through the ground on a nest of roots, the Crystal Sovereign assembles out of a storm of shards, the Eclipse Lord descends out
// of a black sun, the Magma Colossus rises from an erupting lava pool, the Abyssal Leviathan surges out of a water pillar, the Tempest Roc dives out
// of a lightning cloud - then a roar (screen shake, shock waves, its own synthesized roar) under the name card; the camera returns and the arena
// barrier (ARENA7) forms. You can't be hurt and the boss holds still meanwhile. Repeat encounters: hold any key 0.6 s to skip (the first
// encounter with each boss always plays in full; seen intros are kept in localStorage rbb10).
// Fight: phase beats at 66% / 33% health (hold, flash, roar, a shock wave that pushes you back, new aura colour), warning marks over wind-ups,
// slam radius / aim lines for the base attacks, a gold ring while the boss is open (vulnerable window: +35% damage), and a top health bar with
// the boss name, phase ticks, shield and status.
// Outro (~4.6 s): slow motion, the camera locks on the boss, it staggers and cracks with light, collapses into a final burst, then the defeat card
// with REW8's reward reveal; the camera returns and the barrier dissolves.
// Budget: sprites are pre-rendered once, particles are emitted per second with small caps, nothing builds gradients or uses shadowBlur per
// frame, overlays animate transform/opacity only, and everything is torn down on world change, knock-out, despawn or a new boss. =====
const BOSS10=(()=>{
 const R=Math.random,PI=Math.PI,TAU=PI*2,cl=(v,a,b)=>v<a?a:v>b?b:v,ez=x=>{x=cl(x,0,1);return x*x*(3-2*x)},eo=x=>1-Math.pow(1-cl(x,0,1),3),ei=x=>{x=cl(x,0,1);return x*x*x},lerp=(a,b,k)=>a+(b-a)*k;
 const red=()=>{try{return !!(cel.opt.reduce||QM.reduce)}catch(_){return false}};
 const vk=()=>{try{return Math.max(.25,QM.vfxK)}catch(_){return 1}};
 const bid=m=>String(m&&m.k||'').replace('boss_','');
 const bdef=id=>{try{return BOSSES.find(b=>b.id==id)||null}catch(_){return null}};
 const sfx=(k,id,v)=>{try{CINE7.bossSfx(k,id,v)}catch(_){}};
 const shk=v=>{if(!red())shake=Math.max(shake,v)};
 const now=()=>performance.now();
 const EPI={warden:'Thorn-Crowned King of the Deep Grove',sovereign:'The Walking Cathedral of Crystal',eclipse:'Tyrant of the Swallowed Sun',magma:'Heart of the Burning Mountain',tide:'Serpent of the Drowned Stars',storm:'Herald of the Thousand Storms'};
 const AURA={warden:['#6fe08a','#d8ff5a','#ff5a4a'],sovereign:['#7fd8ff','#c9a0ff','#ff4a8a'],eclipse:['#b58cff','#ff6ad8','#ff3a3a'],magma:['#ff6a2a','#ffb02a','#ff2a2a'],tide:['#4aa8ff','#4affd8','#9a5aff'],storm:['#ffe27a','#ffffff','#ff5a3a']};
 const PHS={warden:['','The thorns run wild','The grove itself turns on you'],sovereign:['','Its facets split the light','The cathedral shatters into blades'],eclipse:['','The void opens','The last light is swallowed'],
  magma:['','The mountain wakes','The heart erupts'],tide:['','The tide rises','The deep drags you down'],storm:['','The sky darkens','A thousand storms break']};
 const RN=['','I','II','III'];
 // timelines (seconds at normal speed; reduced motion runs them F times faster)
 const IN={pan:1.0,roar:2.3,card:2.45,cardOut:3.9,ret0:3.6,ret1:4.3,form:3.95,end:4.6};
 const OUT={coll0:1.5,coll1:1.85,burst:1.75,card:1.95,ret:3.5,end:4.6};
 // ---- pre-rendered sprites
 const SP=new Map(),mkc=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c},memo=(k,f)=>{let s=SP.get(k);if(!s){s=f();SP.set(k,s)}return s};
 const hx=h=>{const n=parseInt(String(h).slice(1),16)||0;return[n>>16,n>>8&255,n&255]},rgba=(h,a)=>{const c=hx(h);return'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'};
 const glow=c=>BOSS6.glo(c);
 const rays=c=>memo('r'+c,()=>{const s=mkc(256,256),x=s.getContext('2d');x.translate(128,128);const gr=x.createRadialGradient(0,0,4,0,0,128);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.25,rgba(c,.55));gr.addColorStop(1,rgba(c,0));x.fillStyle=gr;
  for(let i=0;i<12;i++){const a=i/12*TAU+(i%3)*.08,w=i%2?.06:.11;x.beginPath();x.moveTo(0,0);x.arc(0,0,128,a-w,a+w);x.closePath();x.fill()}return s});
 const column=(c,k)=>memo('c'+c+k,()=>{const s=mkc(64,256),x=s.getContext('2d'),gr=x.createLinearGradient(0,0,64,0);gr.addColorStop(0,rgba(c,0));gr.addColorStop(.25,rgba(c,.8));gr.addColorStop(.5,k||'rgba(255,255,255,.95)');gr.addColorStop(.75,rgba(c,.8));gr.addColorStop(1,rgba(c,0));x.fillStyle=gr;x.fillRect(0,0,64,256);
  x.globalCompositeOperation='destination-in';const v=x.createLinearGradient(0,0,0,256);v.addColorStop(0,'rgba(0,0,0,.2)');v.addColorStop(.12,'#000');v.addColorStop(1,'#000');x.fillStyle=v;x.fillRect(0,0,64,256);return s});
 const corona=()=>memo('co',()=>{const s=mkc(160,160),x=s.getContext('2d'),gr=x.createRadialGradient(80,80,22,80,80,80);gr.addColorStop(0,'rgba(255,230,150,1)');gr.addColorStop(.3,'rgba(255,190,90,.75)');gr.addColorStop(.6,'rgba(190,110,255,.3)');gr.addColorStop(1,'rgba(120,60,255,0)');x.fillStyle=gr;x.fillRect(0,0,160,160);
  x.strokeStyle='rgba(255,240,200,.8)';x.lineWidth=2;for(let i=0;i<18;i++){const a=i/18*TAU;x.beginPath();x.moveTo(80+Math.cos(a)*30,80+Math.sin(a)*30);x.lineTo(80+Math.cos(a)*(54+(i%3)*10),80+Math.sin(a)*(54+(i%3)*10));x.stroke()}return s});
 const cloud=()=>memo('cl',()=>{const s=mkc(320,150),x=s.getContext('2d'),r=(()=>{let v=7;return()=>(v=v*16807%2147483647)/2147483647})();
  for(let p=0;p<3;p++)for(let i=0;i<16;i++){const cx=40+r()*240,cy=60+r()*50-p*6,rr=24+r()*30;x.fillStyle=p==0?'#1a1830':p==1?'#2c2a48':'#4a4870';x.beginPath();x.arc(cx,cy-p*8,rr*(1-p*.18),0,TAU);x.fill()}
  x.globalCompositeOperation='source-atop';const v=x.createLinearGradient(0,0,0,150);v.addColorStop(0,'rgba(140,140,200,.35)');v.addColorStop(1,'rgba(0,0,10,.4)');x.fillStyle=v;x.fillRect(0,0,320,150);return s});
 // ---- state
 let S=null,G=null;const acc={},keys=new Set();let seen={};try{seen=JSON.parse(localStorage.getItem('rbb10')||'{}')||{}}catch(_){}
 const saveSeen=()=>{try{localStorage.setItem('rbb10',JSON.stringify(seen))}catch(_){}};
 const tt=()=>S?(now()-S.t0)/1000*S.F:0;
 const once=(k,t)=>{if(!S||S.ev[k]||tt()<t)return false;S.ev[k]=1;return !(S.skipped&&t<IN.ret0)};
 function emit(k,rate,dt,f){if(red())rate*=.35;acc[k]=(acc[k]||0)+rate*vk()*dt;let n=Math.min(8,acc[k]|0);acc[k]-=n;while(n-->0)f()}
 const gyAt=(x,y)=>{try{return BOSSX.gyAt(x,y)}catch(_){return y}};
 // ---- the hold: the boss stays where it is and does not attack (intro + phase beats)
 function freeze(m,o,pin){if(o.lx==null){o.lx=m.x;o.ly=m.y}m.x=o.lx;m.vx=0;if(pin||MK[m.k]&&MK[m.k].fly){m.y=o.ly;m.vy=0}else{if(m.vy<0)m.vy=0;m.t=Math.max(m.t||0,.4)}m.bs='idle';m.bt=Math.max(m.bt||0,.6);if(m.xt!=null)m.xt=Math.max(m.xt,.8);m.wind=0;m.dash=null;m.pull=0;m.vq=0}
 // ---- entrance pieces generated once per intro
 function prep(id,m){const p={f:P.x>m.x?-1:1};
  if(id=='warden'){p.roots=[];for(let i=0;i<9;i++){const s=i<4?-1:i>4?1:0,x=(i-4)/4*m.w*.75;p.roots.push({x,a:-PI/2+s*(.35+R()*.55)+(R()-.5)*.25,len:T*(2+R()*1.8),cv:(R()-.5)*40,w:5+R()*4,d:R()*.25})}
   p.cr=[];for(let i=0;i<5;i++){const d=i<2?-1:1;let x=0,y=0;const pts=[[0,0]];for(let k=0;k<4;k++){x+=d*(10+R()*18);y+=(R()-.5)*5;pts.push([x,y])}p.cr.push(pts)}}
  else if(id=='sovereign'){p.sh=[];for(let i=0;i<18;i++)p.sh.push({a:R()*TAU,r0:T*(3+R()*2.8),sz:7+R()*8,rot:R()*TAU,sp:(R()-.5)*8,d:R()*.4})}
  else if(id=='eclipse'){p.sy=m.y+m.h/2-T*3.6}
  else if(id=='tide'){p.gy=gyAt(m.x,m.y+m.h);p.top=m.y-T*1.4}
  else if(id=='storm'){p.cy=m.y-T*4.6;p.gy=gyAt(m.x,m.y+m.h);p.strike=-9;p.bolt=null}
  return p}
 function boltPts(x0,y0,x1,y1){const pts=[[x0,y0]],n=9;for(let i=1;i<n;i++){const k=i/n;pts.push([lerp(x0,x1,k)+(R()-.5)*34,lerp(y0,y1,k)])}pts.push([x1,y1]);return pts}
 // ---- intro
 function intro(m,A){stop();const id=bid(m),b=bdef(id)||{n:'Boss',c:'#b58cff'},F=red()?1.7:1,vw=cv.width/ZM,vh=cv.height/ZM;
  S={kind:'in',m,b,id,A,F,t0:now(),cur,ev:{},cam:{x:cam.x+vw/2,y:cam.y+vh/2},sx:cam.x+vw/2,sy:cam.y+vh/2,skip:!!seen[id],kd:0,kk:null,skipped:0,p:prep(id,m),o:{}};
  m.born=now()-9000;m.ent=1;window.CAMT=S.cam;cineUI(1);
  if(A){A.t0=now()+IN.form*1000/F;A.pend=1}
  try{CINE7.bossIntro(m,A,{card:IN.card*1000/F,out:IN.cardOut*1000/F,end:IN.end*1000/F})}catch(e){console.error('BOSS10 card',e)}
  iT=Math.max(iT,IN.end/F+.4);try{BOSSX.clearFx()}catch(_){}hint(S.skip)}
 function tickIn(dt){const m=S.m,t=tt(),id=S.id,p=S.p,c=S.b.c||'#fff';
  if(m.dead||m.hp<=0)return;if(!mobs.includes(m)){stop();return}
  freeze(m,S.o,1);iT=Math.max(iT,(IN.end-t)/S.F+.35);
  // camera: player -> boss (eased), hold, then back to the arena / you
  const bx=S.o.lx,by=S.o.ly+m.h/2-((id=='eclipse'||id=='storm')?T*1.6*(1-ez((t-1.6)/.7)):0);
  if(t<IN.ret0){const k=ez(t/IN.pan);S.cam.x=lerp(S.sx,bx,k);S.cam.y=lerp(S.sy,by,k)}
  else{const A=S.A,fit=A&&A.fit&&!A.end,rx=fit?(A.x0+A.x1)/2:P.x,ry=fit?(A.y0+A.y1)/2:P.y+P.h/2,k=ez((t-IN.ret0)/(IN.ret1-IN.ret0));S.cam.x=lerp(bx,rx,k);S.cam.y=lerp(by,ry,k)}
  window.CAMT=S.cam;
  // entrance events + particles (per second, capped)
  const fy=m.y+m.h,cx=m.x,cy=m.y+m.h/2;
  if(id=='warden'){if(once('a',.1))sfx('rumble',id);if(t>.15&&t<1)emit('w1',30,dt,()=>VFX.add(5,'#8a7350',cx+(R()-.5)*m.w*1.4,fy-2,(R()-.5)*60,-R()*40,.6,8,20,{add:0,a:.6,d:1.5}));if(once('b',.55))sfx('roots',id);
   if(t>1.15&&t<2.2)emit('w2',36,dt,()=>VFX.add(2,R()<.5?'#6b5638':'#3e7a3a',cx+(R()-.5)*m.w,fy-4,(R()-.5)*260,-160-R()*260,.9,9,5,{g:900,r:R()*6,vr:(R()-.5)*12,add:0}));
   if(once('c',2.2)){VFX.wave(cx,fy,c,m.w*2.2,.6,.3);sfx('land',id);shk(.22)}}
  else if(id=='sovereign'){if(once('a',.3))sfx('shards',id);if(t>.3&&t<1.9)emit('s1',26,dt,()=>{const a=R()*TAU,r=T*(1+R()*3.5)*(1-ez((t-.3)/1.6));VFX.add(1,'#dff6ff',cx+Math.cos(a)*r,cy+Math.sin(a)*r,0,0,.4,9,2,{a:.9})});
   if(once('c',2.15)){VFX.wave(cx,cy,'#fff',m.w*1.6,.45,1);VFX.wave(cx,fy,c,m.w*2.4,.7,.3);VFX.shatter(cx,cy,['#dff6ff',c,'#fff'],14)}}
  else if(id=='eclipse'){if(once('a',.15))sfx('sun',id);if(t>.2&&t<2.4)emit('e1',22,dt,()=>{const a=R()*TAU,r=T*(1.4+R()*.8);VFX.add(0,R()<.5?'#b58cff':'#ffd36a',cx+Math.cos(a)*r,p.sy+Math.sin(a)*r,-Math.cos(a)*30,-Math.sin(a)*30,.7,10,3,{a:.7})});
   if(once('c',2.2)){VFX.wave(cx,cy,'#ffd36a',m.w*2,.6,1);VFX.wave(cx,cy,c,m.w*2.8,.8,.5)}}
  else if(id=='magma'){if(once('a',.1))sfx('rumble',id);if(t>.3&&t<1)emit('m0',18,dt,()=>VFX.add(0,'#ff8a3a',cx+(R()-.5)*m.w*1.2,fy-4,0,-30-R()*40,.5,8,3,{a:.8}));
   if(once('b',1.0)){sfx('erupt',id);shk(.25);VFX.wave(cx,fy,'#ffb04a',m.w*1.8,.5,.3)}
   if(t>1&&t<2.3)emit('m1',55,dt,()=>VFX.add(0,R()<.6?'#ff7a2a':'#ffd24a',cx+(R()-.5)*m.w*.6,fy-T*(1+R()*4),(R()-.5)*220,-200-R()*260,.9,10,3,{g:520,a:.9}));
   if(once('c',2.2)){VFX.wave(cx,fy,c,m.w*2.2,.6,.3);sfx('land',id)}}
  else if(id=='tide'){if(once('a',.2))sfx('surge',id);if(t>.4&&t<2.1)emit('t1',28,dt,()=>{const top=lerp(p.gy,p.top,eo((t-.2)/1.1));VFX.add(0,'#bfe6ff',cx+(R()-.5)*60,top,(R()-.5)*160,-60-R()*120,.7,9,3,{g:420,a:.8})});
   if(once('c',2.1)){VFX.wave(cx,cy,'#bfe6ff',m.w*1.6,.6,.5);for(let i=0;i<Math.round(20*vk());i++)VFX.add(0,R()<.5?'#bfe6ff':'#4aa8ff',cx+(R()-.5)*50,cy,(R()-.5)*420,-120-R()*320,1,10,3,{g:700,a:.85})}}
  else if(id=='storm'){if(once('a',.05))sfx('rumble',id,.6);for(const[k,st]of[['b',.9],['b2',1.35]])if(once(k,st)){p.strike=t;p.bolt=boltPts(cx+(R()-.5)*40,p.cy+30,cx+(R()-.5)*20,p.gy);sfx('thunder',id);shk(.15);VFX.wave(p.bolt[p.bolt.length-1][0],p.gy,'#fff6b0',90,.4,.3)}
   if(once('d',1.45))sfx('dive',id);if(once('c',2.1)){VFX.wave(cx,cy,c,m.w*2.2,.6,.6);sfx('land',id);shk(.2);for(let i=0;i<Math.round(14*vk());i++)VFX.add(0,'#eef6ff',cx,cy,(R()<.5?-1:1)*(200+R()*300),(R()-.5)*120,.5,10,3,{a:.6,d:2})}}
  // the roar: shake + three shock waves + the roar itself
  if(once('roar',IN.roar)){sfx('roar',id);shk(.4);VFX.wave(cx,cy,'#fff',m.w*1.8,.5,.8)}
  if(once('w1',IN.roar+.18))VFX.wave(cx,cy,c,m.w*3,.8,.55);if(t>IN.roar+.03)warm(S,2);if(t>IN.roar+.15)warm(S,0);if(t>IN.roar+.3)warm(S,1);if(once('w2',IN.roar+.4))VFX.wave(cx,fy,c,m.w*3.6,.9,.25);
  if(t>IN.roar&&t<IN.roar+.6)emit('rd',32,dt,()=>VFX.add(5,'#9a8a70',cx+(R()<.5?-1:1)*(m.w*.5+R()*m.w),fy-2,(R()-.5)*120,-R()*70,.6,8,22,{add:0,a:.5,d:1.4}));
  // skip (repeat encounters): hold any key pressed after the intro began
  if(S.skip&&!S.skipped&&t<IN.ret0){const held=S.kd&&keys.has(S.kk)?(now()-S.kd)/600:0;hintP(held);if(held>=1)doSkip()}
  if(t>=IN.end)finishIn()}
 function doSkip(){if(!S||S.kind!='in')return;S.skipped=1;S.t0=now()-IN.ret0*1000/S.F;for(const k in acc)acc[k]=0;try{CINE7.bossSkip()}catch(_){}if(S.A&&S.A.pend)S.A.t0=now()+(IN.form-IN.ret0)*1000/S.F;S.m.fl=.2;hint(false)}
 function finishIn(){const m=S.m;seen[S.id]=1;saveSeen();warm(S,0);warm(S,1);m.ent=0;m.bt=Math.max(m.bt||0,1.2);if(m.xt!=null)m.xt=Math.max(m.xt,2.2);m.born=now()-600;if(S.A&&S.A.pend)S.A.t0=Math.min(S.A.t0,now());S=null;hint(false);cineUI(0);iT=Math.max(iT,.5)}
 // build the outro's sprites (and REW8's reward sprites for this colour, via a pillar parked far off-screen) before the boss can fall, not on the kill frame
 // (done during the roar, where the screen is shaking anyway; Number#toLocaleString's one-time ICU set-up, ~7 ms, is paid at load)
 function warm(s,k){if(s.wm&1<<k)return;s.wm=(s.wm|0)|1<<k;const c=s.b.c||'#fff';try{if(k==0){rays(c);glow(c);glow('#ffffff')}else if(k==1)REW8.pillar(-1e6,-1e6,c,.05,.1);else{const q=MOBMAT[s.m.k];if(q!=null&&!ICONC[q])iconURL(q)}}catch(_){}}   // k 2: the icon of the material every boss drops (~10 ms the first time: it encodes a PNG)
 setTimeout(()=>{try{(1234.5).toLocaleString()}catch(_){}},1200);
 // ---- outro
 function cracks(m){const out=[],L=Math.max(m.w,m.h);for(let i=0;i<7;i++){const a=i/7*TAU+R()*.6;let x=0,y=0,aa=a;const pts=[[0,0]];for(let k=0;k<3;k++){const l=L*(.12+R()*.1);aa+=(R()-.5)*.9;x+=Math.cos(aa)*l;y+=Math.sin(aa)*l*.9;pts.push([x,y])}out.push(pts)}return out}
 function outro(m,b,first){if(!m||!mobs.includes(m))return false;stop();const id=bid(m),F=red()?1.5:1;
  G=Object.assign({},m,{hp:m.mhp,fl:.25,dead:false,bs:'idle',shield:0,stag:0,wind:0,vul:0,vq:0,pb:0,born:now()-9000,dash:null,pull:0,ent:0});
  S={kind:'out',m:G,real:m,b,id,first,F,t0:now(),cur,ev:{},cam:{x:m.x,y:m.y+m.h/2},cr:cracks(m),free:0};window.CAMT=S.cam;
  try{CINE7.slow(red()?900:1900,.22)}catch(_){}try{CINE7.bossBars(b.c)}catch(_){}try{BOSS6.clear()}catch(_){}
  iT=Math.max(iT,OUT.end/F+.3);cineUI(1);sfx('fall',id);VFX.wave(m.x,m.y+m.h/2,'#fff',m.w*1.3,.4,1);shk(.2);bar&&barOff();return true}
 function tickOut(dt){const t=tt(),m=S.m,c=S.b.c||'#fff',cx=m.x,cy=m.y+m.h/2;iT=Math.max(iT,.3);
  if(!S.free){S.cam.x=cx;S.cam.y=cy;window.CAMT=S.cam}
  if(once('k',.45))sfx('crack',S.id);
  if(t>.3&&t<OUT.coll1)emit('o1',26,dt,()=>{const cr=S.cr[R()*S.cr.length|0],e=cr[cr.length-1],k=ez((t-.25)/.8);VFX.add(1,R()<.6?c:'#fff',cx+e[0]*k,cy+e[1]*k,(R()-.5)*50,-40-R()*90,.7,9,2,{a:.9,g:-20})});
  if(t>OUT.coll0&&t<OUT.coll1)emit('o2',40,dt,()=>VFX.add(2,R()<.5?c:'#fff',cx+(R()-.5)*m.w,m.y+m.h-6,(R()-.5)*220,-80-R()*160,.7,8,4,{g:700,r:R()*6,vr:(R()-.5)*10}));
  if(once('b',OUT.burst)){VFX.wave(cx,cy,'#fff',m.w*2,.55,1);VFX.wave(cx,cy,c,m.w*3.2,1,.5);VFX.wave(cx,m.y+m.h,c,m.w*3,1.1,.25);VFX.shatter(cx,cy,[c,'#fff','#ffd24a'],22);VFX.burst(cx,cy,[c,'#fff'],16,360,1,.9,14);
   try{FX7.victory(cx,cy)}catch(_){}shk(.32);sfx('burst',S.id)}
  if(once('card',OUT.card)){try{CINE7.bossWin(S.real,S.b,S.first,{cine:1})}catch(e){console.error('BOSS10 win card',e)}}
  if(once('ret',OUT.ret)){S.free=1;window.CAMT=null;cineUI(0)}
  if(t>=OUT.end){S=null;G=null}}
 // ---- phase beats + vulnerable windows (called by BOSS6 / BOSSX)
 function phase(m,p){const id=bid(m),c=(AURA[id]||[])[p-1]||'#ff5a6a',cx=m.x,cy=m.y+m.h/2;m.pb=1.35;m.pbT=now();m._pho={};m.fl=.3;freeze(m,m._pho);
  try{BOSSX.clearFx()}catch(_){}sfx('phase',id);shk(.3);VFX.wave(cx,cy,'#fff',m.w*1.8,.45,1);VFX.wave(cx,cy,c,m.w*3.6,1,.6);VFX.burst(cx,cy,[c,'#fff'],18,320,1,.8,14);
  const dx=P.x-m.x;if(Math.abs(dx)<T*7&&Math.abs(P.y+P.h/2-cy)<T*6){P.vx=Math.sign(dx||1)*560;P.vy=-380}iT=Math.max(iT,.8);   // the shock wave throws you back (no damage)
  try{UI6.say6('Phase '+RN[p],(PHS[id]||[])[p-1]||'',1600)}catch(_){}}
 function vuln(m){sfx('vuln');try{VFX.wave(m.x,m.y+m.h,'#ffd24a',m.w*1.2,.45,.3);ft(m.x,m.y-18,'OPEN!','#ffd24a')}catch(_){}}
 // ---- health bar (DOM, transform-only updates, written only when something changed)
 let bar=null;
 function barEl(){if(bar&&bar.el.isConnected)return bar;const el=document.createElement('div');el.id='bb10';el.setAttribute('aria-hidden','true');
  el.innerHTML='<div class="bb10-h"><b></b><em></em></div><div class="bb10-bar"><i class="bb10-tr"></i><i class="bb10-f"></i><i class="bb10-sh"></i><i class="bb10-tk" style="left:66%"></i><i class="bb10-tk" style="left:33%"></i></div><div class="bb10-s"><span class="bb10-ph"></span><span class="bb10-st"></span></div>';
  document.body.appendChild(el);bar={el,n:el.querySelector('.bb10-h b'),e:el.querySelector('.bb10-h em'),f:el.querySelector('.bb10-f'),tr:el.querySelector('.bb10-tr'),sh:el.querySelector('.bb10-sh'),tk:el.querySelectorAll('.bb10-tk'),ph:el.querySelector('.bb10-ph'),st:el.querySelector('.bb10-st'),m:null,hr:-1,s:-1,p:0,txt:'',on:0};return bar}
 function barOff(){if(bar&&bar.on){bar.el.classList.remove('on');bar.on=0;bar.m=null}}
 function barTick(){const m=BOSS6.active(),show=m&&!m.dead&&mobs.includes(m)&&!(S&&S.kind=='in'&&tt()<IN.form)&&!G;if(!show){barOff();return}
  const B=barEl(),id=bid(m),ph=Math.max(1,Math.min(3,m.phase|0));
  if(B.m!==m){B.m=m;const b=bdef(id)||{n:'Boss'};B.n.textContent=b.n;B.e.textContent=EPI[id]||'';B.hr=-1;B.s=-1;B.p=0;B.txt=null}
  if(!B.on){B.el.classList.add('on');B.on=1}
  if(B.p!==ph){B.p=ph;const a=AURA[id]||['#ff5a6a','#ff5a6a','#ff5a6a'];B.el.style.setProperty('--c',a[ph-1]);B.el.dataset.ph=ph;B.ph.textContent='Phase '+RN[ph];B.tk[0].classList.toggle('done',ph>=2);B.tk[1].classList.toggle('done',ph>=3)}
  const hr=cl(m.hp/m.mhp,0,1);if(Math.abs(hr-B.hr)>.0004){B.hr=hr;const s='scaleX('+hr.toFixed(4)+')';B.f.style.transform=s;B.tr.style.transform=s}
  const sv=m.shield>0?cl(m.shield/(m.shieldMax||1),0,1):0;if(Math.abs(sv-B.s)>.002){B.s=sv;B.sh.style.transform='scaleX('+sv.toFixed(3)+')'}
  const st=m.pb>0?'Phase change':m.stag>0?'Staggered':m.vul>0?'Vulnerable':m.shield>0?'Shielded':'';if(st!==B.txt){B.txt=st;B.st.textContent=st;B.st.className='bb10-st'+(st?' on '+st.toLowerCase().replace(' ',''):'')}}
 // ---- skip hint (repeat encounters)
 let hk=null;
 function hint(on){if(!on){if(hk){hk.remove();hk=null}return}if(hk)return;hk=document.createElement('div');hk.id='bb10k';hk.setAttribute('aria-hidden','true');hk.innerHTML='<span>Hold any key to skip</span><i></i>';document.body.appendChild(hk);requestAnimationFrame(()=>{if(hk)hk.classList.add('on')})}
 let hpV=-1;function hintP(v){if(!hk)return;v=Math.round(cl(v,0,1)*40)/40;if(v!==hpV){hpV=v;hk.lastChild.style.transform='scaleX('+v+')'}}
 addEventListener('keydown',e=>{keys.add(e.key);if(S&&S.kind=='in'&&S.skip&&!e.repeat&&!S.kd){S.kd=now();S.kk=e.key}},true);
 addEventListener('keyup',e=>{keys.delete(e.key);if(S&&S.kk===e.key){S.kd=0;S.kk=null}},true);
 addEventListener('blur',()=>{keys.clear();if(S){S.kd=0;S.kk=null}});
 // ---- tear-down (world change, knock-out, despawn, a new boss)
 function stop(){if(S){if(S.kind=='in'){S.m.ent=0;if(S.A&&S.A.pend)S.A.t0=Math.min(S.A.t0,now());try{CINE7.bossSkip()}catch(_){}}else{try{CINE7.slow(0)}catch(_){}}S=null}G=null;window.CAMT=null;hint(false);cineUI(0)}
 // the HUD steps aside while a cinematic plays (one class on <body>; the panels fade by opacity)
 function cineUI(on){try{document.body.classList.toggle('bb10c',!!on)}catch(_){}}
 // ---- per tick: hold first (so the boss AI never reaches an attack), then the fight systems, then the director
 {const _t=BOSS6.tick;BOSS6.tick=function(dt){
  try{if(S&&S.kind=='in'&&mobs.includes(S.m)&&!S.m.dead)freeze(S.m,S.o,1);const a=BOSS6.active();if(a&&a.pb>0&&!a.dead){a.pb-=dt;freeze(a,a._pho||(a._pho={}));if(a.pb>.5&&Math.floor(now()/90)%2)a.fl=.12}}catch(e){console.error('BOSS10 hold',e)}
  _t.call(this,dt);
  try{const en=typeof entered!='undefined'&&entered;if(S&&(!en||S.cur!==cur)){stop()}
   if(S&&S.kind=='in')tickIn(dt);else if(S&&S.kind=='out')tickOut(dt);
   const a=BOSS6.active();if(a&&!a.dead&&!(S&&S.kind=='in')){const ph=a.phase|0;if(ph>=2){const c=(AURA[bid(a)]||[])[ph-1]||'#ff5a6a';emit('au',ph>=3?22:11,dt,()=>VFX.mote(a.x+(R()-.5)*a.w,a.y+a.h*R(),c))}}
   barTick()}catch(e){console.error('BOSS10',e)}}}
 // ---- drawing: the intro boss (entrance), aura behind every boss
 function body(m,now2,dm,fx,fy,sx,sy,dx,dy,clipY,clipX){g.save();if(clipY!=null||clipX!=null){g.beginPath();const w=clipX!=null?clipX*2:m.w*8,top=fy-m.h*5;g.rect(fx-w/2,top,w,(clipY!=null?clipY:fy+m.h*2)-top);g.clip()}g.translate(fx+dx,fy+dy);g.scale(sx,sy);g.translate(-fx,-fy);dm(m,now2);g.restore()}
 function drawIn(m,now2,dm){const t=tt(),id=S.id,p=S.p,c=S.b.c||'#fff',fx=m.x-cam.x,fy=m.y+m.h-cam.y,cy=fy-m.h/2;
  // roar: stretch up + jitter
  let rs=1,rj=0;if(t>IN.roar){const k=cl((t-IN.roar)/.9,0,1),bu=Math.sin(PI*k)*(1-k*.3);rs=bu;rj=bu*(R()-.5)*4}
  const sx=1+.05*rs,sy=1+.1*rs;
  if(id=='warden'){const kr=ez((t-.55)/.8)*(t>3?1-ez((t-3)/.6):1),k=eo((t-1.15)/1.05);
   if(t>.3&&t<3.8){g.save();g.globalAlpha=Math.min(1,(t-.3)*3)*(t>3?1-ez((t-3)/.8):1);g.strokeStyle='#1a120a';g.lineWidth=3;for(const cr of p.cr){g.beginPath();for(let i=0;i<cr.length;i++){const q=cr[i];i?g.lineTo(fx+q[0]*Math.min(1,(t-.3)*2),fy+q[1]):g.moveTo(fx+q[0],fy+q[1])}g.stroke()}g.restore()}
   if(k>0)body(m,now2,dm,fx,fy,sx,sy,rj,(1-k)*m.h*1.08,fy+3);
   if(kr>0){g.save();g.lineCap='round';for(const r of p.roots){const gk=ez((kr-r.d)/(1-r.d));if(gk<=0)continue;const bx=fx+r.x,ex=bx+Math.cos(r.a)*r.len*gk,ey=fy+Math.sin(r.a)*r.len*gk,qx=(bx+ex)/2+r.cv*gk,qy=(fy+ey)/2;
     g.strokeStyle='#0e0818';g.lineWidth=r.w+3;g.beginPath();g.moveTo(bx,fy);g.quadraticCurveTo(qx,qy,ex,ey);g.stroke();g.strokeStyle='#3e7a3a';g.lineWidth=r.w;g.stroke();g.strokeStyle='#8fdc5a';g.lineWidth=r.w*.35;g.stroke();g.fillStyle='#2f6a30';for(let j=1;j<4;j++){const u=j/4;if(u>gk)break;const px=(1-u)*(1-u)*bx+2*(1-u)*u*qx+u*u*ex,py=(1-u)*(1-u)*fy+2*(1-u)*u*qy+u*u*ey,s=(j%2?1:-1)*r.w;g.beginPath();g.moveTo(px-2,py);g.lineTo(px+s*1.3,py-r.w*.8);g.lineTo(px+2,py+1);g.closePath();g.fill()}}g.restore()}}
  else if(id=='sovereign'){const gk=ez((t-.3)/1.6);if(gk>0&&t<2.4){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=gk*(t>2.15?1-(t-2.15)/.25:1)*.8;const s=m.w*(.6+gk*.9);g.drawImage(glow('#9fe6ff'),fx-s,cy-s,s*2,s*2);g.restore()}
   if(t>=1.55){const k=eo((t-1.55)/.65);if(t<2.15)m.fl=.2;body(m,now2,dm,fx,fy,sx*(.2+.8*k),sy*(.2+.8*k),rj,-(1-k)*m.h*.4)}
   if(t<2.25){g.save();g.lineJoin='round';for(const s of p.sh){const k=ei((t-.3-s.d)/1.35);if(k>=1)continue;const a=s.a+k*1.6,r=s.r0*(1-k),x=fx+Math.cos(a)*r,y=cy+Math.sin(a)*r,z=s.sz*(1-k*.4);g.globalAlpha=Math.min(1,(t-.3-s.d)*4+.001);if(g.globalAlpha<=0)continue;
     g.save();g.translate(x,y);g.rotate(s.rot+t*s.sp*(1-k));g.fillStyle='#bfeaff';g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-z);g.lineTo(z*.45,0);g.lineTo(0,z*.8);g.lineTo(-z*.45,0);g.closePath();g.fill();g.stroke();g.restore()}g.restore()}}
  else if(id=='eclipse'){const sy0=p.sy-cam.y,r=58*eo((t-.15)/.8)*(t>2.1?1-ez((t-2.1)/.7):1);
   if(r>1){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.9;g.translate(fx,sy0);g.rotate(t*.4);const s=r*1.9;g.drawImage(corona(),-s,-s,s*2,s*2);g.restore()}
   if(t>=.95){const k=eo((t-.95)/1.25),dy=(p.sy-(m.y+m.h/2))*(1-k),sc=.35+.65*k;body(m,now2,dm,fx,fy,sx*sc,sy*sc,rj,dy+(1-sc)*m.h*.5)}
   if(r>1){g.save();g.fillStyle='#050208';g.beginPath();g.arc(fx,sy0,r,0,TAU);g.fill();g.strokeStyle='#ffd36a';g.lineWidth=2.5;g.stroke();g.restore()}}
  else if(id=='magma'){const pr=m.w*.85*eo((t-.15)/.6)*(t>2.6?1-ez((t-2.6)/.8):1);
   if(pr>1){g.save();g.fillStyle='#2a0800';g.beginPath();g.ellipse(fx,fy-1,pr,pr*.17,0,0,TAU);g.fill();g.globalCompositeOperation='lighter';g.globalAlpha=.75+.2*Math.sin(t*9);g.drawImage(glow('#ff7a2a'),fx-pr*1.2,fy-pr*.5,pr*2.4,pr*.9);g.globalAlpha=1;g.strokeStyle='#ffb24a';g.lineWidth=2;g.beginPath();g.ellipse(fx,fy-1,pr,pr*.17,0,0,TAU);g.stroke();g.restore()}
   const k=eo((t-1.2)/.95);if(k>0)body(m,now2,dm,fx,fy,sx,sy,rj,(1-k)*m.h*1.05,fy+2);
   if(t>1&&t<2.6){const h=T*7*eo((t-1)/.35)*(t>1.9?1-ez((t-1.9)/.6):1),w=m.w*.62*(t>1.9?1-.6*ez((t-1.9)/.6):1);g.save();g.globalAlpha=.92;g.drawImage(column('#ff5a10','rgba(255,214,110,1)'),fx-w/2,fy-h,w,h);g.globalCompositeOperation='lighter';g.globalAlpha=.35;g.drawImage(column('#ff5a10','rgba(255,214,110,1)'),fx-w*.3,fy-h,w*.6,h);g.restore()}}
  else if(id=='tide'){const gy=p.gy-cam.y,top=p.top-cam.y,H=(gy-top)*eo((t-.2)/1.1),col=t<2.1?H:H*(1-ez((t-2.1)/.5)),w=70;
   if(col>1){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.85;g.drawImage(column('#4aa8ff'),fx-w/2,gy-col,w,col);g.globalAlpha=.7;g.strokeStyle='#e6f6ff';g.lineWidth=3;g.beginPath();g.ellipse(fx,gy-2,w*.8+Math.sin(t*8)*4,8,0,0,TAU);g.stroke();g.restore()}
   if(t>=1.25){const k=eo((t-1.25)/.85),sc=.6+.4*k;body(m,now2,dm,fx,fy,sx*sc,sy*sc,rj,0,null,m.w*.7*k+8)}}
  else if(id=='storm'){const a=ez((t-.05)/.7)*(t>2.6?1-ez((t-2.6)/.7):1),cyy=p.cy-cam.y;
   if(a>0){g.save();g.globalAlpha=a*.95;const s=.7+.3*a;g.drawImage(cloud(),fx-160*s,cyy-75*s,320*s,150*s);g.restore()}
   if(p.bolt&&t-p.strike<.18){g.save();g.globalCompositeOperation='lighter';g.lineJoin='round';g.globalAlpha=1-(t-p.strike)/.18;g.beginPath();for(let i=0;i<p.bolt.length;i++){const q=p.bolt[i];i?g.lineTo(q[0]-cam.x,q[1]-cam.y):g.moveTo(q[0]-cam.x,q[1]-cam.y)}g.strokeStyle='rgba(255,240,150,.45)';g.lineWidth=9;g.stroke();g.strokeStyle='#fff';g.lineWidth=2.5;g.stroke();g.restore()}
   if(t>=1.45){const k=cl((t-1.45)/.65,0,1),x0=fx-p.f*T*7,y0=cyy+10,ex=fx,ey=fy-m.h/2,x=lerp(x0,ex,eo(k)),y=lerp(y0,ey,k*k*(3-2*k));
    if(k<1){g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,236,150,.5)';g.lineWidth=3;for(let i=0;i<4;i++){const o=(i-1.5)*14;g.beginPath();g.moveTo(x-(x-x0)*.25,y+o-(y-y0)*.25);g.lineTo(x,y+o);g.stroke()}g.restore()}
    body(m,now2,dm,fx,fy,sx,sy,x-fx+rj,y+m.h/2-fy)}}
  else dm(m,now2)}
 {const _dm=drawMob;drawMob=function(m,now2){if(!m.boss)return _dm(m,now2);
  if(S&&S.kind=='in'&&S.m===m){try{drawIn(m,now2,_dm)}catch(e){if(!drawMob.e){drawMob.e=1;console.error('BOSS10 entrance',e)}_dm(m,now2)}return}
  const ph=m.phase|0;if(ph>=2||m.pb>0){const id=bid(m),c=(AURA[id]||[])[Math.max(0,ph-1)]||'#ff5a6a',t=now2/1000,s=Math.max(m.w,m.h)*(1.15+.06*Math.sin(t*3))*(m.pb>0?1+.5*cl((m.pb-.6)/.7,0,1):1);
   g.save();g.globalCompositeOperation='lighter';g.globalAlpha=(ph>=3?.42:.3)+(m.pb>0?.3:0);g.drawImage(glow(c),m.x-cam.x-s,m.y+m.h/2-cam.y-s,s*2,s*2);g.restore()}
  _dm(m,now2)}}
 // the flashing player sprite is kept solid while a cinematic makes you invulnerable
 {const _dc=drawChar;drawChar=function(){if(S&&arguments[15]==='me')g.globalAlpha=1;return _dc.apply(this,arguments)}}
 // no attacking and no walking off during the intro (you are watching it)
 {const _uw=useWeapon;useWeapon=function(){if(S&&S.kind=='in')return;return _uw.apply(this,arguments)}}
 {const _p=physics;physics=function(dt,ax,busy){if(S&&S.kind=='in')ax=0;return _p.call(this,dt,ax,busy)}}
 // ---- world-space overlay: outro ghost, telegraph marks, vulnerable ring
 function drawOut(gc,now2){const t=tt(),m=G,c=S.b.c||'#fff',fx=m.x-cam.x,fy=m.y+m.h-cam.y,cy=fy-m.h/2,L=Math.max(m.w,m.h);
  const ra=t<OUT.coll1?ez((t-.45)/1.3)*.8:(1-ez((t-OUT.coll1)/.6))*.85;
  if(ra>0){gc.save();gc.globalCompositeOperation='lighter';gc.globalAlpha=ra;gc.translate(fx,cy);gc.rotate(t*.45);const s=L*(1.1+Math.min(t,OUT.coll1)*.35+(t>OUT.coll1?(t-OUT.coll1)*1.6:0));gc.drawImage(rays(c),-s,-s,s*2,s*2);gc.restore()}
  if(t<OUT.coll1){const k=cl(t/OUT.coll0,0,1),c2=cl((t-OUT.coll0)/(OUT.coll1-OUT.coll0),0,1),sh=(2+8*k)*(1-c2),tilt=Math.sin(t*11)*.05*(1+k)*(1-c2);
   m.fl=c2>0||(t>.8&&Math.floor(now2/(170-90*k))%3==0)?.2:0;
   gc.save();gc.translate(fx+(R()-.5)*sh,fy);gc.rotate(tilt);gc.scale(1+.3*ez(c2),1-.85*ez(c2));gc.translate(-fx,-fy);try{drawMob(m,now2)}catch(_){}
   gc.globalCompositeOperation='lighter';gc.lineCap='round';gc.lineJoin='round';for(let i=0;i<S.cr.length;i++){const pk=ez((t-.25-i*.13)/.55);if(pk<=0)continue;const cr=S.cr[i],n=(cr.length-1)*pk;
    gc.beginPath();gc.moveTo(fx,cy);for(let j=1;j<cr.length&&j-1<n;j++){const f=Math.min(1,n-(j-1)),a=cr[j-1],b=cr[j];gc.lineTo(fx+a[0]+(b[0]-a[0])*f,cy+a[1]+(b[1]-a[1])*f)}
    gc.globalAlpha=.6;gc.strokeStyle=c;gc.lineWidth=9;gc.stroke();gc.globalAlpha=1;gc.strokeStyle='#fff';gc.lineWidth=3;gc.stroke()}gc.restore()}
  if(t>=OUT.burst&&t<OUT.burst+.45){const u=(t-OUT.burst)/.45,s=m.w*(.6+u*1.7);gc.save();gc.globalCompositeOperation='lighter';gc.globalAlpha=(1-u)*.9;gc.drawImage(glow('#ffffff'),fx-s,cy-s,s*2,s*2);gc.restore()}}
 function drawMarks(gc,now2,cx,cy){const m=BOSS6.active();if(!m||m.dead||!mobs.includes(m)||(S&&S.kind=='in'))return;const t=now2/1000,fx=m.x-cx,top=m.y-cy,fy=m.y+m.h-cy;
  // warning mark over every wind-up
  if(m.bs=='tele'||m.wind>0){const k=m.bs=='tele'?1-cl(m.bt/(m.bt0||.95),0,1):1-cl(m.wind/(m.wind0||.6),0,1),y=top-30-Math.abs(Math.sin(t*12))*5;
   gc.save();gc.fillStyle=k>.7&&Math.floor(t*16)%2?'#fff':'#ff3a4a';gc.strokeStyle='#0e0818';gc.lineWidth=2.5;gc.beginPath();gc.moveTo(fx,y-16);gc.lineTo(fx+13,y+8);gc.lineTo(fx-13,y+8);gc.closePath();gc.fill();gc.stroke();
   gc.fillStyle='#0e0818';gc.fillRect(fx-1.5,y-8,3,9);gc.fillRect(fx-1.5,y+3,3,3);
   if(m.bs=='tele'&&m.at==0){const r=m.w*1.1;gc.globalAlpha=.12+.1*k;gc.fillStyle='#ff3a4a';gc.beginPath();gc.ellipse(fx,fy-2,r,12,0,0,TAU);gc.fill();gc.globalAlpha=.75;gc.strokeStyle='#ff3a4a';gc.lineWidth=2;gc.setLineDash([8,6]);gc.stroke();gc.setLineDash([]);gc.beginPath();gc.ellipse(fx,fy-2,r*k,12*k,0,0,TAU);gc.stroke()}
   if(m.bs=='tele'&&m.at==1){const ph=Math.max(1,Math.min(3,m.phase|0)),n=[6,8,10][ph-1],y0=m.y+m.h*.4-cy,a0=Math.atan2(P.y+P.h/2-(m.y+m.h*.4),P.x-m.x);gc.globalAlpha=.25+.45*k;gc.strokeStyle='#ff5a6a';gc.lineWidth=1.5;gc.setLineDash([6,7]);
    for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*.17;gc.beginPath();gc.moveTo(fx,y0);gc.lineTo(fx+Math.cos(a)*T*7,y0+Math.sin(a)*T*7);gc.stroke()}gc.setLineDash([])}
   gc.restore()}
  // open: a gold ring at the feet + label
  if(m.vul>0||m.stag>0){const v=m.stag>0?1:cl(m.vul/1.6,0,1);gc.save();gc.globalCompositeOperation='lighter';gc.globalAlpha=.5+.35*Math.sin(t*14);gc.strokeStyle='#ffd24a';gc.lineWidth=3;gc.beginPath();gc.ellipse(fx,fy-2,m.w*.62+Math.sin(t*8)*3,10,0,0,TAU);gc.stroke();gc.globalCompositeOperation='source-over';
   gc.globalAlpha=Math.min(1,v*3);gc.font='800 12px Montserrat,system-ui,sans-serif';gc.textAlign='center';gc.lineWidth=3;gc.strokeStyle='rgba(20,10,30,.85)';const tx=m.stag>0?'STAGGERED':'OPEN  +35%';gc.strokeText(tx,fx,top-(m.shield>0?34:22));gc.fillStyle='#ffd24a';gc.fillText(tx,fx,top-(m.shield>0?34:22));gc.restore()}}
 {const _dp=BOSS6.drawProj;BOSS6.drawProj=function(gc,cx,cy){_dp.call(this,gc,cx,cy);try{const n2=performance.now();if(G&&S&&S.kind=='out')drawOut(gc,n2);drawMarks(gc,n2,cx,cy)}catch(e){if(!BOSS6.drawProj.e){BOSS6.drawProj.e=1;console.error('BOSS10 draw',e)}}}}
 {const _lw=loadWorld;loadWorld=function(){stop();barOff();return _lw.apply(this,arguments)}}
 const left=()=>S&&S.kind=='out'?Math.max(0,(OUT.ret-tt())*1000/S.F):0;
 return{intro,outro,phase,vuln,stop,left,skip:doSkip,IN,OUT,AURA,
  get cam(){return !!S&&!S.free},get kind(){return S?S.kind:null},get t(){return tt()},get ghost(){return G},get canSkip(){return !!(S&&S.kind=='in'&&S.skip&&!S.skipped)},
  get state(){return S?{kind:S.kind,id:S.id,t:tt(),skip:S.skip,skipped:S.skipped,free:S.free}:null},seen:()=>Object.assign({},seen),forget(){seen={};saveSeen()}}})();
