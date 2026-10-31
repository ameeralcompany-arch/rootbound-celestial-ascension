// ===== MYTH: the mythic arsenal. Every class has its own mythic weapon of its own kind (MYART.TH / MYART.WT; only the Reaper's is a scythe): forge it in the Classes screen, then ascend it through
// five tiers with gems, class levels and materials from the depths. Each ascension plays a scene you cannot skip: the old blade shatters
// and the new one is revealed ("You have been ascended to a new level of <weapon>").
// Combat: a real swing instead of an instant hit. Three moves chain into a combo (a downward reap, a rising return cut, a full spin), each
// swept along an eased arc (wind-up, fast cut, follow-through) that hits whatever the blade passes through, knocks it along the swing and
// fires that move's own effect: crescent waves, light pillars, black holes, spectral chains, crow / petal / leaf / star / shuriken flocks,
// blood or ink splashes, chain lightning, starfall, ground shards or shock rings, all in the class palette with its motif particles.
// Tiers add damage and reach; II fires a crescent on the first cut, III throws the scythe on the finisher (it flies out and swings back),
// IV makes hits echo with small bursts, V doubles the finisher and heals on hit. The class passives (CLASS7) apply as usual.
// The mythic outfit (cape with cloth physics, shoulder guards, a crown piece for each class and drifting motif sparks) shows while you
// use that class with its scythe forged; it can be turned off in the Classes screen. State: RB_PREFIX + 'rbmyth'. =====
const MYTH=(()=>{
 const A=MYART,TH=A.TH,KEYS=A.KEYS,TAU=Math.PI*2,R=Math.random;
 const red=()=>{try{return !!(cel.opt.reduce||(typeof QM!='undefined'&&QM.reduce))}catch(_){return false}};
 const free=()=>typeof RB_CREATIVE!='undefined'&&!!RB_CREATIVE;
 const ID=k=>'myth_'+k,KOF={};
 // ---- the weapons (one per class, mythic). Damage grows 22% per tier.
 const BASE=40,CD=.34;
 // each kind of weapon (MYART.WT): its game category, length, hand pivot, reach, whether it shoots instead of swinging, whether the tier III
 // finisher throws it, the three swing arcs (duration, start / end angle for facing right, damage) and how it sits in the hand (scale, offset)
 const KN={scythe:'scythe',greatsword:'sword',katana:'sword',blade:'sword',spear:'spear',hammer:'hammer',axe:'maul',gauntlet:'knuckle',chakram:'chakram',bow:'bow',gun:'gun',staff:'staff',branch:'staff'};
 const SWING3=(d,s,m)=>[[d,-s,s*.6,1],[d*.94,s*.6,-s*.95,1.1],[d*1.5,-1.3,-1.3+TAU,m]];
 const PROF={scythe:{len:96,piv:.3,rad:2.3,thr:1,mv:[[.30,-2.05,1.25,1],[.28,1.25,-2,1.12],[.46,-1.3,-1.3+TAU,1.7]],hs:1.9,ho:.62},
  greatsword:{len:84,piv:.14,rad:2.05,mv:SWING3(.32,2.0,1.8),hs:1.7,ho:.18},katana:{len:78,piv:.16,rad:1.9,mv:SWING3(.21,1.7,1.6),hs:1.6,ho:.2},blade:{len:76,piv:.14,rad:1.9,mv:SWING3(.25,1.8,1.7),hs:1.6,ho:.18},
  spear:{len:100,piv:.34,rad:2.6,mv:[[.22,-.3,.12,1],[.24,.25,-.22,1.08],[.44,-1.3,-1.3+TAU,1.6]],hs:1.9,ho:.5},hammer:{len:80,piv:.16,rad:2.05,thr:1,mv:[[.34,-2.2,1.0,1.15],[.32,1.0,-2.0,1.2],[.5,-2.6,1.45,2.0]],hs:1.6,ho:.2},
  axe:{len:84,piv:.16,rad:2.05,thr:1,mv:SWING3(.32,2.1,1.9),hs:1.6,ho:.2},gauntlet:{len:44,piv:0,rad:1.65,mv:[[.17,-.6,.35,.85],[.17,.45,-.45,.9],[.32,-1.7,1.2,1.5]],hs:1,ho:0},
  chakram:{len:60,piv:0,rad:1.8,thr:1,mv:SWING3(.21,1.8,1.6),hs:1.1,ho:0},bow:{len:66,piv:0,ranged:'arrow',hs:1.15,ho:.05},gun:{len:60,piv:0,ranged:'bullet',hs:1.05,ho:.1},
  staff:{len:96,piv:.32,ranged:'orb',hs:1.9,ho:.45},branch:{len:96,piv:.32,ranged:'orb',hs:1.9,ho:.45}};
 const RMV=[[.22,1],[.24,1.1],[.36,1.6]];   // shots: duration, damage
 const prof=k=>PROF[(TH[k]&&TH[k].type)||'scythe'];
 for(const k of KEYS){const th=TH[k],id=ID(k);KOF[id]=k;WPN[id]={id,n:th.n,g:A.hex(th.pal[0]),bd:3,md:BASE,cd:CD,k:KN[th.type]||'scythe',cost:0,fx:'',rar:'mythic',lv:0,
  d:th.ep+'. A mythic '+th.noun+' that ascends through five tiers.',move:'Combo: '+th.mv.map(m=>m[0]).join(' → '),myth:k}}
 // ---- state
 const SK=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbmyth';let S={t:{},out:1};
 function load(){try{const o=JSON.parse(localStorage.getItem(SK())||'null');if(o&&typeof o=='object'){S.t={};for(const k of KEYS){const v=+((o.t||{})[k]);if(v>=1&&v<=5)S.t[k]=v|0}S.out=o.out==0?0:1}}catch(_){}}
 const save=()=>{try{localStorage.setItem(SK(),JSON.stringify(S))}catch(_){}};
 load();
 const tier=k=>S.t[k]|0;
 function apply(k){const w=WPN[ID(k)];if(w)w.md=Math.round(BASE*(1+.22*(Math.max(1,tier(k))-1)))}
 for(const k of KEYS)apply(k);
 // ---- forging and ascension costs (tier n needs class level LV[n], GEMS[n] and the depth materials MATS[n])
 const LV=[0,1,5,15,30,50],GEMS=[0,0,800,2500,6000,15000],MATS=[[],[],[[260,5],[261,3]],[[262,3],[263,2]],[[264,2],[265,1]],[[266,1],[267,1],[269,1]]];
 const RN=['','I','II','III','IV','V'];
 function access(k){if(free())return null;let cj=null,ln=[];try{cj=CJOB.cur;ln=CJOB.learned}catch(_){}if(!cj)return'Choose a class first: talk to a class master in the Plaza';
  if(cj!==k&&!ln.includes(k))return'Learn '+CLASS7.C[k].n+' from its master first';return null}
 function next(k){const t=tier(k);if(t>=5)return null;const n=t+1;return{n,lv:LV[n],gems:GEMS[n],mats:MATS[n]}}
 function check(k){const q=next(k);if(!q)return{ok:false,max:true,miss:[]};const miss=[],ac=access(k);if(ac)miss.push(ac);
  if(!free()){if(CLASS7.lv(k)<q.lv)miss.push(CLASS7.C[k].n+' level '+q.lv);if((gems|0)<q.gems)miss.push(q.gems+' gems');for(const[id,n]of q.mats)if(cnt(id)<n)miss.push(n+' × '+iname(id))}
  return{ok:!miss.length,miss,q}}
 function ascend(k){const c=check(k);if(!c.ok)return false;const q=c.q;if(!free()){gems-=q.gems;for(const[id,n]of q.mats)addI(id,-n)}const prev=tier(k);S.t[k]=q.n;save();apply(k);own[ID(k)]=1;
  if(q.n==1)try{if(typeof HOTBAR!='undefined'&&HOTBAR.equip)HOTBAR.equip('w:'+ID(k));else wp=ID(k);renderW();renderBar()}catch(_){wp=ID(k)}
  try{saveP()}catch(_){}scene(k,prev,q.n);return true}
 // ---- combat
 const PIV=28;let SW=null,lastEnd=-9,step=-1,THR=null,HIDE=false;const FX=[],PT=[];
 const pivot=()=>({x:P.x,y:P.y+PIV});
 const live=m=>m&&!m.dead&&m.hp>0;
 const ease=u=>u<.16?-.07*Math.sin(u/.16*Math.PI):1-Math.pow(1-(u-.16)/.84,3);   // a small wind-up, then a fast cut easing out
 const angAt=s=>{const u=Math.min(1,s.t/s.dur);return s.a0+(s.a1-s.a0)*ease(u)};
 const near=(x,y,r,ex)=>mobs.filter(m=>live(m)&&!(ex&&ex.has(m))&&Math.hypot(m.x-x,m.y+m.h/2-y)<r+Math.max(m.w,m.h)*.5);
 function gyAt(x,y0){const tx=Math.max(1,Math.min(W-2,Math.floor(x/T)));let ty=Math.max(0,Math.floor(y0/T));for(let i=0;i<20&&ty<H-1;i++,ty++)if(solidAt(tx,ty))return ty*T;return y0+T*2}
 function onHit(k,m,ang,mul,w,kn){if(!live(m))return;let d=Math.max(1,Math.round(dmgM(w)*mul));
  if((k=='samurai'&&R()<.2)||(k=='gunslinger'&&R()<.15))d=Math.round(d*1.65);
  try{hurtMob(m,d,w,ang)}catch(e){console.error('MYTH hit',e)}
  const kb=(kn==null?1:kn)*(k=='knight'?1.5:1);if(!m.boss){m.vx+=Math.cos(ang)*230*kb;m.vy-=110*kb}
  if(k=='demon'||tier(k)>=5)try{P.hp=Math.min(maxHP(),P.hp+d*(k=='demon'?.05:.03))}catch(_){}
  if(k=='druid')try{P.hp=Math.min(maxHP(),P.hp+1)}catch(_){}
  if(k=='elementalist'){if(R()<.5)m.burn=Math.max(m.burn||0,2);else m.slow=Math.max(m.slow||0,2)}
  if((k=='stormcaller'||k=='brawler')&&R()<.15&&!m.boss)m.stun=Math.max(m.stun||0,.6);
  if(tier(k)>=4&&R()<.2)FX.push({k:'ring',x:m.x,y:m.y+m.h/2,t:0,life:.35,r:T*1.4,th:k,w,mul:.35,hit:new Set([m]),small:1});
  sparks(m.x,m.y+m.h/2,k,red()?3:8,220);try{shake=Math.max(shake,QM&&QM.reduce?0:.05)}catch(_){}}
 // a swing or the thrown scythe: is m inside the angular band swept between a and b at a distance the blade covers?
 function swept(m,o,a,b,rmax){const dx=m.x-o.x,dy=m.y+m.h/2-o.y,d=Math.hypot(dx,dy),rr=Math.max(m.w,m.h)*.5;if(d>rmax+rr||d<10)return false;let an=Math.atan2(dy,dx);const lo=Math.min(a,b)-.18-rr/Math.max(30,d),hi=Math.max(a,b)+.18+rr/Math.max(30,d);
  an+=TAU*Math.round(((lo+hi)/2-an)/TAU);return an>=lo&&an<=hi}
 // the combo chains while a swing is still finishing, or within 0.75 s of the last one
 function attack(w){const k=w.myth,now=performance.now()/1000;if(THR)return;
  try{if(CJOB.blocks(w.id)){say(CJOB.why(w.id));return}}catch(_){}
  step=(SW||now-lastEnd<.75)&&step<2&&step>=0?step+1:0;const pf=prof(k),o=pivot(),wx=mx+cam.x,wy=my+cam.y,aim=Math.atan2(wy-o.y,wx-o.x);P.f=Math.cos(aim)>=0?1:-1;
  const f=P.f,base=f>0?aim:Math.PI-aim,tr=tier(k)||1;
  if(pf.ranged){const r=RMV[step];SW={k,w,step,t:0,dur:r[0],a0:aim,a1:aim,mul:r[1]*(tr>=5&&step==2?1.25:1),hit:new Set(),fx:false,aim,f,tr,tail:[],pf,shot:false}}
  else{// angles are built for facing right and mirrored for facing left
   const mv=pf.mv[step],mir=a=>f>0?a:Math.PI-a,a0=mir(base+mv[1]),a1=mir(base+mv[2]);
   SW={k,w,step,t:0,dur:mv[0]*(k=='ninja'?.85:1),a0,a1,mul:mv[3]*(tr>=5&&step==2?1.25:1),hit:new Set(),fx:false,aim,f,tr,tail:[],pf}}
  let cdv=(SW.dur+.04)/(1+bonus().atk);try{const cl=CLASS7.cur();if(cl){const bo=CLASS7.bon(cl,CLASS7.lv(cl));if(bo.spd>0)cdv/=1+bo.spd}}catch(_){}wcd=cdv;swing=.22;
  try{DEPTH8.strike(wx,wy)}catch(_){}
  try{if(pf.ranged){const f0=pf.ranged=='arrow'?620:pf.ranged=='bullet'?260:900;SFX7.tone(f0,f0*.6,.16,'triangle',.04);noise(.08,pf.ranged=='bullet'?700:2400,.06)}else{noise(step==2?.32:.16,step==2?900:1500,.08);snd(step==2?160:220+R()*40,.12,'triangle',.035,.6)}}catch(_){}}
 {const _uw=useWeapon;useWeapon=function(){const w=WPN[wp];if(w&&w.myth&&own[w.id]){try{attack(w)}catch(e){console.error('MYTH',e)}return}return _uw.apply(this,arguments)}}
 // ---- the effect of each move
 function cast(name,k,w,o,aim,f,mul,sc){sc=sc||1;const th=TH[k],tx=Math.max(o.x-T*7,Math.min(o.x+T*7,mx+cam.x)),ty=Math.max(o.y-T*5,Math.min(o.y+T*4,my+cam.y)),base={th:k,w,mul,t:0,hit:new Set(),sc};
  switch(name){
   case'crescent':FX.push(Object.assign({k:'cres',x:o.x+Math.cos(aim)*30,y:o.y+Math.sin(aim)*30,vx:Math.cos(aim)*640,vy:Math.sin(aim)*640,a:aim,life:k=='archer'?1:.7,r:44*sc},base,{mul:mul*.8}));break;
   case'pillar':{const x=o.x+f*T*2.6,gy=gyAt(x,o.y-T);FX.push(Object.assign({k:'pil',x,y:gy,life:.85,h:T*5.5*sc,done:0},base));break}
   case'vortex':FX.push(Object.assign({k:'vor',x:tx,y:ty,life:1.35,r:T*2.6*sc,tick:0},base,{mul:mul*.3}));break;
   case'chains':FX.push(Object.assign({k:'chn',x:o.x,y:o.y,life:1,r:T*3.2*sc,done:0},base));break;
   case'flock':{const n=red()?4:7,items=[];for(let i=0;i<n;i++)items.push({x:o.x,y:o.y,a:aim+(i-(n-1)/2)*.09,sp:540+R()*140,ph:R()*6,sw:(i-(n-1)/2)*.8,del:i*.04,hit:new Set()});FX.push(Object.assign({k:'flk',items,life:1.6},base,{mul:mul*.45}));break}
   case'splash':FX.push(Object.assign({k:'spl',x:o.x,y:o.y,a:aim,life:.7,done:0,seed:(R()*1e6)|0,r:T*3.6*sc},base));break;
   case'bolts':{const tg=near(o.x,o.y,T*7).sort((p,q)=>Math.hypot(p.x-o.x,p.y-o.y)-Math.hypot(q.x-o.x,q.y-o.y)).slice(0,5),pts=tg.length?tg.map(m=>({x:m.x,y:m.y+m.h/2,m})):[0,1,2].map(i=>({x:o.x+f*T*(2+i*1.6),y:gyAt(o.x+f*T*(2+i*1.6),o.y-T)-T*.5}));
    pts.forEach((p,i)=>FX.push(Object.assign({k:'blt',x:p.x,y:p.y,m:p.m,life:.42,del:i*.06,done:0,seed:(R()*1e6)|0},base,{hit:new Set()})));break}
   case'stars':for(let i=0;i<(red()?5:9);i++){const x=tx+(R()-.5)*T*5,gy=gyAt(x,ty-T*2);FX.push(Object.assign({k:'str',x:x-T*3,y:gy-T*9,x1:x,y1:gy,life:.55,del:i*.07,done:0},base,{mul:mul*.5,hit:new Set()}))}break;
   case'shards':for(let i=0;i<6;i++){const x=o.x+f*(T*1.2+i*T*.95),gy=gyAt(x,o.y-T);FX.push(Object.assign({k:'shd',x,y:gy,life:.9,del:i*.06,h:T*(1.2+R()*.9)*sc,done:0,rot:(R()-.5)*.5},base,{mul:mul*.6,hit:new Set()}))}break;
   case'ring':FX.push(Object.assign({k:'ring',x:o.x,y:o.y,life:.5,r:T*4*sc},base));break}
  try{const tn=th.pal&&{crescent:[700,1200],pillar:[180,520],vortex:[90,300],chains:[200,900],flock:[600,900],splash:[260,420],bolts:[1200,2400],stars:[1300,1900],shards:[1500,2200],ring:[140,380]}[name];if(tn){SFX7.tone(tn[0],tn[1],.35,'triangle',.035);SFX7.tone(tn[0]*1.5,tn[1]*1.5,.25,'sine',.015,.03)}}catch(_){}}
 // ---- particles (own pool; motif sprites + glow dots)
 const GLOW={};function glow(c){if(GLOW[c])return GLOW[c];const s=document.createElement('canvas');s.width=s.height=32;const x=s.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.3,A.rgba(c,.75));gr.addColorStop(1,A.rgba(c,0));x.fillStyle=gr;x.fillRect(0,0,32,32);return GLOW[c]=s}
 function part(x,y,vx,vy,l,s,c,mo,k){if(PT.length>520)PT.shift();PT.push({x,y,vx,vy,l,ml:l,s,c,mo,k,a:R()*TAU,va:(R()-.5)*6})}
 function sparks(x,y,k,n,sp){const p=TH[k].pal;for(let i=0;i<n;i++){const a=R()*TAU,v=(.3+R())*(sp||160);part(x,y,Math.cos(a)*v,Math.sin(a)*v,.35+R()*.3,3+R()*3,i%3?p[0]:p[1],false,k)}if(!red())for(let i=0;i<Math.ceil(n/4);i++){const a=R()*TAU,v=(.2+R())*(sp||160)*.6;part(x,y,Math.cos(a)*v,Math.sin(a)*v-40,.7+R()*.4,5+R()*3,p[0],true,k)}}
 // ---- per frame
 function tick(dt){
  if(SW){const s=SW,pf=s.pf,o=pivot(),pa=angAt(s);s.t+=dt;const ca=angAt(s);
   if(pf.ranged){if(!s.shot&&s.t>=s.dur*.18){s.shot=true;const n=s.tr>=3&&s.step==2?3:1;for(let i=0;i<n;i++)shoot(s.k,s.w,o,s.aim+(i-(n-1)/2)*.12,pf.ranged,s.mul)}}
   else{for(const m of mobs)if(live(m)&&!s.hit.has(m)&&swept(m,o,pa,ca,T*pf.rad*(1+.06*(s.tr-1)))){s.hit.add(m);onHit(s.k,m,ca+(s.a1>s.a0?1:-1)*Math.PI/2,s.mul,s.w)}
    s.tail.push(ca);if(s.tail.length>9)s.tail.shift();if(!red()&&R()<.7){const L=pf.len*.7;part(o.x+Math.cos(ca)*L,o.y+Math.sin(ca)*L,(R()-.5)*40,(R()-.5)*40,.3,3,TH[s.k].pal[1],false,s.k)}}
   if(!s.fx&&s.t>=s.dur*.42){s.fx=true;const mv=TH[s.k].mv[s.step][1];cast(mv,s.k,s.w,o,s.aim,s.f,s.mul,(s.tr>=5&&s.step==2?1.4:1)*(1+.05*(s.tr-1)));
    if(s.tr>=2&&s.step==0&&mv!='crescent')cast('crescent',s.k,s.w,o,s.aim,s.f,s.mul*.6,.7);
    if(s.tr>=3&&s.step==2&&!pf.thr&&!pf.ranged)cast('crescent',s.k,s.w,o,s.aim,s.f,s.mul*.8,1);
    if(s.tr>=5&&s.step==2)cast(mv,s.k,s.w,o,s.aim+(s.f>0?-.4:.4),s.f,s.mul*.6,1)}
   if(s.t>=s.dur){lastEnd=performance.now()/1000;if(s.step==2&&s.tr>=3&&pf.thr)throwIt(s.k,s.w);SW=null}}
  if(THR)thrTick(dt);
  for(let i=FX.length-1;i>=0;i--){const e=FX[i];if(fxTick(e,dt))FX.splice(i,1)}
  for(let i=PT.length-1;i>=0;i--){const p=PT[i];p.l-=dt;if(p.l<=0){PT.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-dt*2.2;p.vy=p.vy*(1-dt*2.2)+(p.mo?30:60)*dt;p.a+=p.va*dt}
  outfitTick(dt);
  for(const k of KEYS)if(tier(k)>=1&&!own[ID(k)])own[ID(k)]=1}
 // a shot from a bow (light arrow), the pistol (tracer round) or a staff (glowing orb): fast, pierces up to two foes
 function shoot(k,w,o,a,kind,mul){const sp=kind=='bullet'?1250:kind=='arrow'?1050:720;FX.push({k:'proj',kind,th:k,w,mul,t:0,life:kind=='orb'?1.1:.9,x:o.x+Math.cos(a)*24,y:o.y+Math.sin(a)*24,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,a,hit:new Set(),pierce:2})}
 function throwIt(k,w){const o=pivot(),wx=mx+cam.x,wy=my+cam.y,a=Math.atan2(wy-o.y,wx-o.x);THR={k,w,x:o.x,y:o.y,vx:Math.cos(a)*940,vy:Math.sin(a)*940,t:0,rot:0,back:false,hit:new Set()};try{SFX7.tone(500,900,.3,'triangle',.03)}catch(_){}}
 function thrTick(dt){const q=THR,o=pivot();q.t+=dt;q.rot+=dt*16*(P.f||1);const dx=o.x-q.x,dy=o.y-q.y,d=Math.hypot(dx,dy)||1,acc=q.t<.22?600:2600;q.vx+=dx/d*acc*dt;q.vy+=dy/d*acc*dt;
  const sp=Math.hypot(q.vx,q.vy),mx2=1100;if(sp>mx2){q.vx*=mx2/sp;q.vy*=mx2/sp}q.x+=q.vx*dt;q.y+=q.vy*dt;
  const back=q.vx*dx+q.vy*dy>0;if(back&&!q.back){q.back=true;q.hit=new Set()}
  for(const m of mobs)if(live(m)&&!q.hit.has(m)&&Math.hypot(m.x-q.x,m.y+m.h/2-q.y)<44+Math.max(m.w,m.h)*.5){q.hit.add(m);onHit(q.k,m,Math.atan2(q.vy,q.vx),.9,q.w,.6)}
  if(!red()&&R()<.8)part(q.x,q.y,(R()-.5)*50,(R()-.5)*50,.35,4,TH[q.k].pal[0],false,q.k);
  if((q.back&&d<34)||q.t>2.4){THR=null;try{SFX7.tone(900,600,.15,'triangle',.025)}catch(_){}}}
 function hitArea(e,x,y,r,mul,kn,once){let n=0;for(const m of mobs)if(live(m)&&!(once&&e.hit.has(m))&&Math.hypot(m.x-x,m.y+m.h/2-y)<r+Math.max(m.w,m.h)*.5){e.hit.add(m);onHit(e.th,m,Math.atan2(m.y+m.h/2-y,m.x-x),mul,e.w,kn);n++}return n}
 function fxTick(e,dt){if(e.del>0){e.del-=dt;return false}e.t+=dt;const p=TH[e.th].pal;
  switch(e.k){
   case'proj':{e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.kind=='arrow')e.vy+=120*dt;e.a=Math.atan2(e.vy,e.vx);for(const m of mobs)if(live(m)&&!e.hit.has(m)&&Math.hypot(m.x-e.x,m.y+m.h/2-e.y)<16+Math.max(m.w,m.h)*.5){e.hit.add(m);onHit(e.th,m,e.a,e.mul,e.w,.5);if(--e.pierce<=0){e.t=e.life;break}}
    if(!red()&&R()<.8)part(e.x,e.y,(R()-.5)*30,(R()-.5)*30,.3,e.kind=='orb'?5:3,p[R()<.6?0:1],e.kind=='orb'&&R()<.3,e.th);if(solidAt(Math.floor(e.x/T),Math.floor(e.y/T))){sparks(e.x,e.y,e.th,4,140);e.t=e.life}break}
   case'cres':e.x+=e.vx*dt;e.y+=e.vy*dt;hitArea(e,e.x,e.y,e.r*.7,e.mul,.8,true);if(!red()&&R()<.9)part(e.x-Math.cos(e.a)*e.r*.3,e.y-Math.sin(e.a)*e.r*.3,(R()-.5)*30,(R()-.5)*30,.4,R()<.3?6:3,p[R()<.5?0:1],R()<.25,e.th);if(solidAt(Math.floor(e.x/T),Math.floor(e.y/T)))e.t=Math.max(e.t,e.life-.08);break;
   case'pil':if(!e.done&&e.t>.1){e.done=1;hitArea(e,e.x,e.y-T*1.2,T*1.7*e.sc,e.mul,1.6,true);for(const m of e.hit)if(!m.boss)m.vy=-420;sparks(e.x,e.y,e.th,red()?6:18,320);try{shake=Math.max(shake,QM.reduce?0:.12)}catch(_){}}
    if(!red()&&e.t<.6&&R()<.9)part(e.x+(R()-.5)*T*1.2,e.y,(R()-.5)*60,-200-R()*260,.6,R()<.4?7:3,p[R()<.5?0:1],R()<.3,e.th);break;
   case'vor':{e.tick-=dt;const pull=e.t<e.life-.2;for(const m of mobs)if(live(m)&&!m.boss){const dx=e.x-m.x,dy=e.y-(m.y+m.h/2),d=Math.hypot(dx,dy);if(d<e.r*1.6&&pull){m.vx+=dx/d*900*dt;m.vy+=dy/d*900*dt}}
    if(e.tick<=0&&pull){e.tick=.22;e.hit=new Set();hitArea(e,e.x,e.y,e.r*.6,e.mul,0,false)}
    if(e.t>=e.life-.2&&!e.burst){e.burst=1;e.hit=new Set();hitArea(e,e.x,e.y,e.r,e.mul*4,1.4,true);sparks(e.x,e.y,e.th,red()?8:24,360)}
    if(!red()&&R()<.9){const a=R()*TAU,r=e.r*(.8+R()*.5);part(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,-Math.cos(a)*r*1.4+Math.sin(a)*120,-Math.sin(a)*r*1.4-Math.cos(a)*120,.5,3,p[R()<.6?0:3],false,e.th)}break}
   case'chn':if(!e.done&&e.t>.12){e.done=1;hitArea(e,e.x,e.y,e.r,e.mul,0,true);for(const m of e.hit)if(!m.boss){const dx=e.x-m.x,d=Math.abs(dx)||1;m.vx+=dx/d*360}}break;
   case'flk':{let alive=0;for(const it of e.items){if(it.del>0){it.del-=dt;alive++;continue}if(it.done)continue;alive++;it.ph+=dt*8;const a=it.a+Math.sin(it.ph*.6)*.25*it.sw*.3;it.x+=Math.cos(a)*it.sp*dt;it.y+=Math.sin(a)*it.sp*dt+Math.sin(it.ph)*30*dt;
     for(const m of mobs)if(live(m)&&!it.hit.has(m)&&Math.hypot(m.x-it.x,m.y+m.h/2-it.y)<26+Math.max(m.w,m.h)*.5){it.hit.add(m);onHit(e.th,m,a,e.mul,e.w,.4)}
     if(solidAt(Math.floor(it.x/T),Math.floor(it.y/T))){it.done=1;sparks(it.x,it.y,e.th,4,120)}}if(!alive)return true;break}
   case'spl':if(!e.done&&e.t>.07){e.done=1;for(const m of mobs)if(live(m)){const dx=m.x-e.x,dy=m.y+m.h/2-e.y,d=Math.hypot(dx,dy);let da=Math.abs(Math.atan2(dy,dx)-e.a);if(da>Math.PI)da=TAU-da;if(d<e.r+Math.max(m.w,m.h)*.5&&da<1){e.hit.add(m);onHit(e.th,m,Math.atan2(dy,dx),e.mul,e.w,1)}}}break;
   case'blt':if(!e.done){e.done=1;if(e.m&&live(e.m)){onHit(e.th,e.m,-Math.PI/2,e.mul,e.w,.5);if(!e.m.boss)e.m.stun=Math.max(e.m.stun||0,.4)}else hitArea(e,e.x,e.y,T*1.1,e.mul,.5,true);sparks(e.x,e.y,e.th,red()?4:12,260)}break;
   case'str':{const u=Math.min(1,e.t/(e.life*.6));e.cx=e.x+(e.x1-e.x)*u;e.cy=e.y+(e.y1-e.y)*u;if(!e.done&&u>=1){e.done=1;hitArea(e,e.x1,e.y1-T*.3,T*1.3,e.mul,.7,true);sparks(e.x1,e.y1,e.th,red()?4:10,240)}break}
   case'shd':if(!e.done&&e.t>.08){e.done=1;hitArea(e,e.x,e.y-T*.6,T*.95,e.mul,1.2,true);for(const m of e.hit)if(!m.boss)m.vy=-300;sparks(e.x,e.y,e.th,red()?3:8,200)}break;
   case'ring':{const rr=e.r*Math.min(1,e.t/(e.life*.8));for(const m of mobs)if(live(m)&&!e.hit.has(m)&&Math.abs(Math.hypot(m.x-e.x,m.y+m.h/2-e.y)-rr)<T*.7){e.hit.add(m);onHit(e.th,m,Math.atan2(m.y+m.h/2-e.y,m.x-e.x),e.mul,e.w,1.2)}break}}
  return e.t>=e.life}
 // ---- drawing (world space, on top of the characters)
 function draw(g2,cx,cy){const t=performance.now()/1000;g2.save();
  // the swing: an anime smear along the blade tip, then the scythe itself
  if(SW){const s=SW,o=pivot(),ox=o.x-cx,oy=o.y-cy,p=TH[s.k].pal,ca=angAt(s),tl=s.tail,rr=s.pf.len*.75;
   if(s.pf.ranged){const kick=Math.max(0,1-Math.abs(s.t/s.dur-.2)*5)*6;g2.save();g2.translate(ox-Math.cos(s.aim)*kick,oy-Math.sin(s.aim)*kick);g2.rotate(s.aim);if(Math.cos(s.aim)<0)g2.scale(1,-1);g2.translate(-s.pf.len*s.pf.piv,0);A.weapon(g2,s.k,s.tr,s.pf.len,t);g2.restore()}
   else{if(tl.length>1){g2.globalCompositeOperation='lighter';for(let i=1;i<tl.length;i++){const a0=tl[i-1],a1=tl[i],al=i/tl.length;g2.beginPath();g2.arc(ox,oy,rr,Math.min(a0,a1),Math.max(a0,a1));g2.arc(ox,oy,rr*.35,Math.max(a0,a1),Math.min(a0,a1),true);g2.closePath();g2.fillStyle=A.rgba(p[0],.28*al);g2.fill()}
    g2.beginPath();g2.arc(ox,oy,rr*1.02,Math.min(tl[0],ca),Math.max(tl[0],ca));g2.strokeStyle=A.rgba(p[1],.85);g2.lineWidth=3;g2.stroke();g2.globalCompositeOperation='source-over'}
   drawHeld(g2,s.k,s.tr,ox,oy,ca,s.a1>s.a0,t)}}
  if(THR){const q=THR,L=prof(q.k).len;g2.save();g2.translate(q.x-cx,q.y-cy);g2.rotate(q.rot);g2.globalCompositeOperation='lighter';g2.globalAlpha=.4;g2.drawImage(glow(TH[q.k].pal[0]),-50,-50,100,100);g2.globalAlpha=1;g2.globalCompositeOperation='source-over';g2.translate(-L*.5,0);A.weapon(g2,q.k,tier(q.k),L,t);g2.restore()}
  for(const e of FX)if(!(e.del>0))fxDraw(g2,e,cx,cy,t);
  // particles
  g2.globalCompositeOperation='lighter';for(const p of PT)if(!p.mo){g2.globalAlpha=Math.min(1,p.l/p.ml*1.5);const s=p.s*2.4;g2.drawImage(glow(p.c),p.x-cx-s,p.y-cy-s,s*2,s*2)}
  g2.globalCompositeOperation='source-over';for(const p of PT)if(p.mo){g2.globalAlpha=Math.min(1,p.l/p.ml*1.5);A.motif(g2,p.k,p.x-cx,p.y-cy,p.s,p.a,t)}
  g2.globalAlpha=1;g2.restore()}
 function drawHeld(g2,k,tr,ox,oy,a,cw,t){const pf=prof(k);g2.save();g2.translate(ox,oy);g2.rotate(a);if(cw)g2.scale(1,-1);g2.translate(-pf.len*pf.piv,0);A.weapon(g2,k,tr,pf.len,t);g2.restore()}
 function fxDraw(g,e,cx,cy,t){const p=TH[e.th].pal,u=e.t/e.life,fade=Math.max(0,1-Math.max(0,u-.6)/.4);g.save();
  switch(e.k){
   case'proj':{g.translate(e.x-cx,e.y-cy);g.rotate(e.a);g.globalAlpha=fade;g.globalCompositeOperation='lighter';
    if(e.kind=='orb'){g.drawImage(glow(p[0]),-18,-18,36,36);g.drawImage(glow('#ffffff'),-6,-6,12,12)}
    else{const L=e.kind=='bullet'?44:34,gr=g.createLinearGradient(-L,0,0,0);gr.addColorStop(0,A.rgba(p[0],0));gr.addColorStop(1,A.rgba(p[1],1));g.strokeStyle=gr;g.lineWidth=e.kind=='bullet'?3:2.4;g.beginPath();g.moveTo(-L,0);g.lineTo(0,0);g.stroke();
     g.globalCompositeOperation='source-over';if(e.kind=='arrow')A.star4(g,0,0,6,'#ffffff',t*6);else{g.fillStyle='#fff6d8';g.beginPath();g.ellipse(0,0,4,2,0,0,TAU);g.fill()}}break}
   case'cres':{g.translate(e.x-cx,e.y-cy);g.rotate(e.a);g.globalAlpha=fade;g.globalCompositeOperation='lighter';const r=e.r;g.beginPath();g.arc(0,0,r,-1.25,1.25);g.arc(-r*.32,0,r*.92,1.2,-1.2,true);g.closePath();const gr=g.createLinearGradient(-r,0,r,0);gr.addColorStop(0,A.rgba(p[0],0));gr.addColorStop(.6,A.rgba(p[0],.7));gr.addColorStop(1,A.rgba(p[1],1));g.fillStyle=gr;g.fill();
    g.beginPath();g.arc(0,0,r,-1.1,1.1);g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=2.2;g.stroke();break}
   case'pil':{const x=e.x-cx,y=e.y-cy,a=e.t<.12?e.t/.12:fade,w=T*1.1*e.sc*(e.t<.12?.4+e.t/.12*.6:1);g.globalCompositeOperation='lighter';g.globalAlpha=a;const gr=g.createLinearGradient(x-w,0,x+w,0);gr.addColorStop(0,A.rgba(p[0],0));gr.addColorStop(.35,A.rgba(p[0],.6));gr.addColorStop(.5,'rgba(255,255,255,.95)');gr.addColorStop(.65,A.rgba(p[0],.6));gr.addColorStop(1,A.rgba(p[0],0));
    g.fillStyle=gr;g.fillRect(x-w,y-e.h,w*2,e.h);g.beginPath();g.ellipse(x,y,w*1.9,w*.45,0,0,TAU);g.strokeStyle=A.rgba(p[1],.9);g.lineWidth=3;g.stroke();g.beginPath();g.ellipse(x,y,w*1.25*(1+u),w*.3*(1+u),0,0,TAU);g.strokeStyle=A.rgba(p[0],.7);g.lineWidth=2;g.stroke();
    g.globalCompositeOperation='source-over';for(let i=0;i<5;i++){const q=i*1.3+e.x,hh=T*(.6+((i*37)%10)/10)*(e.t<.15?e.t/.15:1);A.crystal(g,x+(i-2)*w*.55,y+2,hh,(i-2)*.25,i%2?p[1]:p[0])}break}
   case'vor':{const x=e.x-cx,y=e.y-cy,gr0=Math.min(1,e.t/.2),r=e.r*.42*gr0*(e.burst?1+(e.t-(e.life-.2))*4:1);g.globalAlpha=e.burst?fade:1;g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(x,y,r*.6,x,y,r*2.2);gr.addColorStop(0,A.rgba(p[0],.9));gr.addColorStop(.4,A.rgba(p[3],.4));gr.addColorStop(1,A.rgba(p[0],0));g.fillStyle=gr;g.fillRect(x-r*2.3,y-r*2.3,r*4.6,r*4.6);
    g.save();g.translate(x,y);g.rotate(-.35);g.beginPath();g.ellipse(0,0,r*2,r*.42,0,0,TAU);g.strokeStyle=A.rgba(p[1],.9);g.lineWidth=3;g.stroke();g.restore();g.globalCompositeOperation='source-over';g.beginPath();g.arc(x,y,r*.82,0,TAU);g.fillStyle='#050208';g.fill();g.strokeStyle=A.rgba(p[1],.95);g.lineWidth=2.5;g.stroke();
    g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const q=t*2+i*2.1;A.bolt(g,x+Math.cos(q)*r*1.1,y+Math.sin(q)*r*1.1,r*.9,q,p[0],((t*20)|0)+i)}break}
   case'chn':{const x=e.x-cx,y=e.y-cy,rr=e.r*Math.min(1,e.t/.15);g.globalAlpha=fade;g.globalCompositeOperation='lighter';g.beginPath();g.ellipse(x,y+T*.9,rr,rr*.28,0,0,TAU);g.strokeStyle=A.rgba(p[0],.7);g.lineWidth=2;g.stroke();
    for(let i=0;i<5;i++)A.rune(g,x+Math.cos(t*1.5+i*1.26)*rr*.8,y+T*.9+Math.sin(t*1.5+i*1.26)*rr*.22,5,A.rgba(p[1],.9),0,i);
    for(let i=0;i<22;i++){const q=i/22*TAU+t*3,lx=x+Math.cos(q)*rr,ly=y+Math.sin(q)*rr*.55;g.beginPath();g.ellipse(lx,ly,6,3.4,q+Math.PI/2+(i%2?1.57:0),0,TAU);g.strokeStyle=A.rgba(i%2?p[1]:p[0],.95);g.lineWidth=2;g.stroke()}break}
   case'flk':for(const it of e.items){if(it.del>0||it.done)continue;const x=it.x-cx,y=it.y-cy,a=it.a;g.globalCompositeOperation='lighter';g.globalAlpha=.45;g.drawImage(glow(p[0]),x-20,y-20,40,40);g.globalAlpha=1;g.globalCompositeOperation='source-over';
    if(TH[e.th].mot=='crow')A.crow(g,x,y,13,a,'#140a1e',it.ph*1.6);else if(e.th=='ninja')A.shuriken(g,x,y,8,it.ph*2,'#cfe8f8');else A.motif(g,e.th,x,y,8,a+it.ph,t)}break;
   case'spl':{const x=e.x-cx,y=e.y-cy,gr=Math.min(1,e.t/.12),ink=TH[e.th].mot=='ink'||e.th=='samurai',c1=ink?'#0c0a10':p[2],c2=ink?p[0]:p[0];let s=e.seed;const rn=()=>(s=(s*16807)%2147483647)/2147483647;g.globalAlpha=fade;
    for(let i=0;i<7;i++){const a=e.a+(rn()-.5)*1.8,L=e.r*(.5+rn()*.6)*gr,wd=8+rn()*10;g.beginPath();g.moveTo(x,y);const c1x=x+Math.cos(a-.3)*L*.5,c1y=y+Math.sin(a-.3)*L*.5,ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L;g.quadraticCurveTo(c1x,c1y,ex,ey);g.strokeStyle=i%2?c1:c2;g.lineWidth=wd*(1-u*.5);g.lineCap='round';g.stroke();
     g.fillStyle=i%2?c1:c2;g.beginPath();g.arc(ex+Math.cos(a)*8,ey+Math.sin(a)*8,wd*.35,0,TAU);g.fill();A.drop(g,ex+Math.cos(a+.4)*16*gr,ey+Math.sin(a+.4)*16*gr,4,i%2?c1:c2)}break}
   case'blt':{const x=e.x-cx,y=e.y-cy;g.globalCompositeOperation='lighter';g.globalAlpha=fade;let s=e.seed;const rn=()=>(s=(s*16807)%2147483647)/2147483647;g.beginPath();let px=x+(rn()-.5)*60,py=y-T*8;g.moveTo(px,py);for(let i=1;i<=8;i++){px=x+(rn()-.5)*30*(1-i/8);py=y-T*8+T*8*i/8;g.lineTo(px,py)}
    g.strokeStyle=A.rgba(p[0],.6);g.lineWidth=8;g.stroke();g.strokeStyle='#ffffff';g.lineWidth=2.5;g.stroke();g.drawImage(glow(p[0]),x-36,y-36,72,72);break}
   case'str':{if(e.cx==null)break;const x=e.cx-cx,y=e.cy-cy;g.globalCompositeOperation='lighter';g.globalAlpha=fade;g.beginPath();g.moveTo(x,y);g.lineTo(x-(e.x1-e.x)*.25,y-(e.y1-e.y)*.25);g.strokeStyle=A.rgba(p[1],.7);g.lineWidth=3;g.stroke();A.star4(g,x,y,10,'#ffffff',t*4);g.drawImage(glow(p[0]),x-18,y-18,36,36);
    if(e.done){g.beginPath();g.ellipse(e.x1-cx,e.y1-cy,T*.9*(1+u),T*.22*(1+u),0,0,TAU);g.strokeStyle=A.rgba(p[0],.7);g.lineWidth=2;g.stroke()}break}
   case'shd':{const x=e.x-cx,y=e.y-cy,gr=Math.min(1,e.t/.1);g.globalAlpha=fade;const th=TH[e.th],col=th.mot=='leaf'?'#3a7a2a':th.mot=='rock'?'#7a5a4a':e.th=='knight'?p[0]:p[1];
    if(th.mot=='leaf'){g.strokeStyle='#2a5a1a';g.lineWidth=5;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+10*e.rot,y-e.h*.5*gr,x+e.rot*20,y-e.h*gr);g.stroke();A.rose(g,x+e.rot*20,y-e.h*gr,7,p[3])}
    else{A.crystal(g,x,y+2,e.h*gr,e.rot,col);A.crystal(g,x-8,y+2,e.h*.6*gr,e.rot-.4,col);A.crystal(g,x+8,y+2,e.h*.5*gr,e.rot+.4,col)}g.globalCompositeOperation='lighter';g.globalAlpha=fade*.6;g.drawImage(glow(p[0]),x-30,y-40,60,60);break}
   case'ring':{const x=e.x-cx,y=e.y-cy,rr=e.r*Math.min(1,e.t/(e.life*.8));g.globalCompositeOperation='lighter';g.globalAlpha=fade;g.beginPath();g.arc(x,y,rr,0,TAU);g.strokeStyle=A.rgba(p[0],.8);g.lineWidth=e.small?3:6;g.stroke();g.beginPath();g.arc(x,y,rr*.9,0,TAU);g.strokeStyle=A.rgba(p[1],.9);g.lineWidth=2;g.stroke();
    if(!e.small)for(let i=0;i<12;i++){const q=i/12*TAU+e.t;g.beginPath();g.moveTo(x+Math.cos(q)*rr*.7,y+Math.sin(q)*rr*.7);g.lineTo(x+Math.cos(q)*rr*1.05,y+Math.sin(q)*rr*1.05);g.strokeStyle=A.rgba(p[1],.6);g.lineWidth=2;g.stroke()}break}}
  g.restore()}
 // ---- the scythe in the hand (the default holder pose) and on the back; hidden while our own swing or throw draws it
 {const _dw=drawWeapon;drawWeapon=function(x,id,L,t){const k=KOF[id];if(!k)return _dw.apply(this,arguments);if(HIDE)return;x.save();try{const big=L>=100,pf=prof(k),s=big?Math.min(1.25,pf.hs*.62):pf.hs;x.translate(big?-L*s*pf.piv:-L*pf.ho,0);A.weapon(x,k,tier(k)||1,L*s,t||0)}finally{x.restore()}}}
 // ---- the mythic outfit
 const cape=[];let capeK=null;
 function outfitK(){if(!S.out)return null;try{const w=WPN[wp];if(w&&w.myth&&tier(w.myth)>=1)return w.myth;const c=CLASS7.cur();if(c&&tier(c)>=1)return c}catch(_){}return null}
 function outfitTick(dt){const k=outfitK();if(k!==capeK){capeK=k;cape.length=0}if(!k||!entered)return;const ax=P.x-(P.f||1)*5,ay=P.y+22;
  if(!cape.length)for(let i=0;i<7;i++)cape.push({x:ax,y:ay+i*6,px:ax,py:ay+i*6});cape[0].x=cape[0].px=ax;cape[0].y=cape[0].py=ay;
  const wind=-(P.vx||0)*.9-(P.f||1)*18;for(let i=1;i<cape.length;i++){const c=cape[i],vx=(c.x-c.px)*.94,vy=(c.y-c.py)*.94;c.px=c.x;c.py=c.y;c.x+=vx+wind*dt*dt*12+Math.sin(performance.now()/300+i)*.15;c.y+=vy+900*dt*dt}
  for(let n=0;n<3;n++)for(let i=1;i<cape.length;i++){const a=cape[i-1],b=cape[i],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,df=(d-6)/d;b.x-=dx*df;b.y-=dy*df;
    const tx=Math.floor(b.x/T),ty=Math.floor(b.y/T);if(solidAt(tx,ty)){b.y=Math.min(b.y,ty*T-1)}}
  if(!red()&&R()<dt*3)part(P.x+(R()-.5)*30,P.y+R()*50,(R()-.5)*20,-30-R()*30,1.2,5,TH[k].pal[0],R()<.5,k)}
 function drawCape(g2,k,cx,cy){if(cape.length<2)return;const p=TH[k].pal,ox=cx-P.x,oy=cy-P.y,f=P.f||1;g2.save();g2.lineJoin='round';const L=[],Rt=[];
  for(let i=0;i<cape.length;i++){const c=cape[i],w=10+i*2,n=cape[Math.min(cape.length-1,i+1)],m2=cape[Math.max(0,i-1)],dx=n.x-m2.x,dy=n.y-m2.y,d=Math.hypot(dx,dy)||1;L.push([c.x+ox-dy/d*w,c.y+oy+dx/d*w]);Rt.push([c.x+ox+dy/d*w,c.y+oy-dx/d*w])}
  g2.beginPath();g2.moveTo(L[0][0],L[0][1]);for(const q of L)g2.lineTo(q[0],q[1]);const tat=k=='reaper'||k=='demon'||k=='ninja';const end=cape[cape.length-1];
  if(tat){for(let i=0;i<4;i++){const u=i/3,bx=L[L.length-1][0]+(Rt[Rt.length-1][0]-L[L.length-1][0])*u,by=L[L.length-1][1]+(Rt[Rt.length-1][1]-L[L.length-1][1])*u;g2.lineTo(bx,by+(i%2?0:9))}}
  for(let i=Rt.length-1;i>=0;i--)g2.lineTo(Rt[i][0],Rt[i][1]);g2.closePath();const gr=g2.createLinearGradient(cx,cy+20,end.x+ox,end.y+oy);gr.addColorStop(0,A.mix(TH[k].out.cape,p[0],.25));gr.addColorStop(1,TH[k].out.cape);g2.fillStyle=gr;g2.fill();
  g2.strokeStyle=A.OL;g2.lineWidth=1.2;g2.stroke();g2.strokeStyle=A.rgba(p[3],.9);g2.lineWidth=1.2;g2.beginPath();for(const q of Rt)g2.lineTo(q[0],q[1]);g2.stroke();g2.restore()}
 function drawCrown(g2,k,cx,cy,f,t){const p=TH[k].pal,c=TH[k].out.crown,hx=cx,hy=cy+2;g2.save();g2.lineJoin='round';const bob=Math.sin(t*2)*1.2;
  if(c=='halo'){g2.translate(hx,hy-10+bob);g2.globalCompositeOperation='lighter';g2.beginPath();g2.ellipse(0,0,13,4,0,0,TAU);g2.strokeStyle=A.rgba(p[0],.95);g2.lineWidth=2.5;g2.stroke();for(let i=0;i<8;i++){const q=i/8*TAU+t;const sx=Math.cos(q)*13,sy=Math.sin(q)*4;g2.beginPath();g2.moveTo(sx,sy);g2.lineTo(sx*1.35,sy*1.35-4);g2.strokeStyle=A.rgba(p[1],.9);g2.lineWidth=1.2;g2.stroke()}}
  else if(c=='horns'||c=='horns2'){const big=c=='horns2'?1.35:1;for(const sd of[-1,1]){g2.beginPath();g2.moveTo(hx+sd*6,hy+4);g2.quadraticCurveTo(hx+sd*14*big,hy-2,hx+sd*10*big,hy-13*big);g2.quadraticCurveTo(hx+sd*9*big,hy-3,hx+sd*2,hy+5);g2.closePath();g2.fillStyle=A.metal(g2,hx,hy-12,hx+sd*12,hy+4,k,.5);g2.fill();g2.strokeStyle=A.OL;g2.lineWidth=1;g2.stroke()}}
  else if(c=='crest'){g2.translate(hx,hy-1);g2.beginPath();g2.moveTo(-12,-2);g2.quadraticCurveTo(0,-20,12,-2);g2.quadraticCurveTo(0,-12,-12,-2);g2.fillStyle=A.metal(g2,-12,-14,12,0,k,0);g2.fill();g2.strokeStyle=A.OL;g2.lineWidth=1;g2.stroke();A.gem(g2,0,-4,2.4,p[0])}
  else if(c=='tiara'||c=='circlet'){g2.translate(hx,hy+3);g2.beginPath();g2.moveTo(-10,0);g2.quadraticCurveTo(0,-3,10,0);g2.strokeStyle=A.metal(g2,-10,-2,10,2,k,.1);g2.lineWidth=2;g2.stroke();A.gem(g2,0,-2,c=='tiara'?2.4:3,p[3]);if(c=='tiara')for(const sx of[-6,6])A.star4(g2,sx,-3,3.2,p[1],t)}
  else if(c=='thorn'){g2.translate(hx,hy+1);g2.strokeStyle='#1a1024';g2.lineWidth=2;g2.beginPath();g2.ellipse(0,0,11,3.2,0,0,TAU);g2.stroke();for(let i=0;i<7;i++){const q=i/7*Math.PI+Math.PI;g2.beginPath();g2.moveTo(Math.cos(q)*11,Math.sin(q)*3.2);g2.lineTo(Math.cos(q)*14,Math.sin(q)*3.2-6);g2.stroke()}A.gem(g2,0,-3,2.2,p[3])}
  else if(c=='flame'){g2.translate(hx,hy-6+bob);for(let i=-2;i<=2;i++)A.flame(g2,i*4.5,0,4+(2-Math.abs(i))*1.4,i%2?p[3]:p[0],t+i)}
  else if(c=='bolt'){g2.translate(hx,hy-2);g2.globalCompositeOperation='lighter';for(let i=-2;i<=2;i++)A.bolt(g2,i*4,0,9+(2-Math.abs(i))*3,-Math.PI/2+i*.25,p[0],((t*12)|0)+i+9)}
  else if(c=='flowers'){g2.translate(hx,hy+1);for(let i=0;i<5;i++){const q=Math.PI+i/4*Math.PI;A.rose(g2,Math.cos(q)*11,Math.sin(q)*3.4,2.8,i%2?p[3]:'#ffffff')}for(let i=0;i<4;i++)A.leaf(g2,Math.cos(Math.PI+.4+i*.75)*12,-1,5,-1.2+i*.8,p[0])}
  else if(c=='band'){g2.translate(hx,hy);g2.fillStyle=p[0];g2.fillRect(-10,-1.3,20,2.6);g2.strokeStyle=A.OL;g2.lineWidth=.7;g2.strokeRect(-10,-1.3,20,2.6);const sw=Math.sin(t*6)*3;g2.strokeStyle=p[0];g2.lineWidth=1.6;g2.lineCap='round';for(const o of[0,3]){g2.beginPath();g2.moveTo(-f*9,0);g2.quadraticCurveTo(-f*18,4+o+sw,-f*27,2+o*2+sw*1.5);g2.stroke()}}
  else if(c=='hat'){g2.translate(hx+9,hy-8+bob*.3);for(let i=0;i<2;i++)A.gear(g2,i*-7,i*3,6-i*2,i?A.mix(p[3],'#ffffff',.25):p[3],t*(i%2?-1:1))}
  g2.restore()}
 function drawPauldrons(g2,k,cx,cy){const p=TH[k].pal;for(const sd of[-1,1]){g2.save();g2.translate(cx+sd*10,cy+22);g2.scale(sd,1);g2.beginPath();g2.moveTo(-4,-2);g2.quadraticCurveTo(4,-8,9,-1);g2.quadraticCurveTo(8,5,1,6);g2.closePath();g2.fillStyle=A.metal(g2,-4,-8,9,6,k,.35);g2.fill();g2.strokeStyle=A.OL;g2.lineWidth=1;g2.stroke();A.gem(g2,3,-1,1.6,p[3]);g2.restore()}}
 {const _dc=drawChar;drawChar=function(cx,cy){const me=arguments[15]==='me';if(!me)return _dc.apply(this,arguments);const k=outfitK(),t=performance.now()/1000,f=arguments[2]||1;
   if(k)try{drawCape(g,k,cx,cy)}catch(e){if(!drawChar.e1){drawChar.e1=1;console.error('MYTH cape',e)}}
   HIDE=!!(SW||THR);let r;try{r=_dc.apply(this,arguments)}finally{HIDE=false}
   if(k)try{drawPauldrons(g,k,cx,cy);drawCrown(g,k,cx,cy,f,t)}catch(e){if(!drawChar.e2){drawChar.e2=1;console.error('MYTH outfit',e)}}return r}}
 {const _t=BOSS6.tick,_d=BOSS6.drawProj;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){if(!tick.e){tick.e=1;console.error('MYTH',e)}}};BOSS6.drawProj=function(g2,cx,cy){_d.call(this,g2,cx,cy);try{draw(g2,cx,cy)}catch(e){if(!draw.e){draw.e=1;console.error('MYTH draw',e)}}}}
 // ---- the ascension scene: cannot be skipped (input is swallowed and the world is paused until it ends)
 let SC=null;
 function scene(k,from,to){if(SC)return;const th=TH[k],p=th.pal,red2=red(),dur=red2?4.2:6.6,cv2=document.createElement('canvas');cv2.id='myth9';cv2.setAttribute('role','img');cv2.setAttribute('aria-label',th.n+' ascended to tier '+RN[to]);
  cv2.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483300;cursor:default';document.body.appendChild(cv2);
  const block=e=>{e.preventDefault();e.stopImmediatePropagation()};const evs=['keydown','keyup','mousedown','mouseup','click','contextmenu','wheel','touchstart','pointerdown'];
  for(const ev of evs)addEventListener(ev,block,{capture:true,passive:false});
  const cover0=window.RB_COVER;window.RB_COVER=true;try{for(const q in K)K[q]=0}catch(_){}
  SC={k,from,to,t0:performance.now(),dur,cv:cv2,shards:[],motes:[]};
  for(let i=0;i<26;i++)SC.shards.push({a:R()*TAU,v:200+R()*500,r:R()*TAU,vr:(R()-.5)*10,s:6+R()*14});for(let i=0;i<70;i++)SC.motes.push({a:R()*TAU,d:300+R()*500,s:2+R()*3,o:R()});
  const tn=(f,d,v,dl)=>{try{SFX7.tone(f,f,d,'triangle',v,dl)}catch(_){}};try{SFX7.tone(55,48,2.4,'sine',.07)}catch(_){}
  setTimeout(()=>{[523,659,784,1047,1319].forEach((f,i)=>tn(f,1.6,.035,i*.09));tn(2093,2.4,.02,.5)},(red2?1.4:2.5)*1000);
  const fr=()=>{const w=innerWidth,h=innerHeight,dpr=Math.min(2,devicePixelRatio||1);if(cv2.width!=w*dpr){cv2.width=w*dpr;cv2.height=h*dpr}const g2=cv2.getContext('2d');g2.setTransform(dpr,0,0,dpr,0,0);
   const t=(performance.now()-SC.t0)/1000,u=t/dur,cxs=w/2,cys=h*.46,sc=Math.min(w,h)/700,tt=t,flashT=red2?1.4:2.5;
   // backdrop
   g2.fillStyle='rgba(6,4,10,'+Math.min(1,t/.6)+')';g2.fillRect(0,0,w,h);
   const bg=g2.createRadialGradient(cxs,cys,10,cxs,cys,Math.max(w,h)*.7);bg.addColorStop(0,A.rgba(p[0],Math.min(.45,t*.25)));bg.addColorStop(1,'rgba(0,0,0,0)');g2.fillStyle=bg;g2.fillRect(0,0,w,h);
   // converging motes and light lines before the flash, radiating after
   g2.globalCompositeOperation='lighter';for(const m of SC.motes){const pre=t<flashT,k2=pre?Math.max(0,1-t/flashT):Math.min(1,(t-flashT)/2.5),d=pre?m.d*k2*sc:m.d*k2*sc*1.2,x=cxs+Math.cos(m.a+t*.3)*d,y=cys+Math.sin(m.a+t*.3)*d;g2.globalAlpha=pre?.4+.6*(1-k2):Math.max(0,1-k2);g2.drawImage(glow(p[m.o<.5?0:1]),x-m.s*4,y-m.s*4,m.s*8,m.s*8)}
   if(t>flashT){for(let i=0;i<16;i++){const q=i/16*TAU+t*.15;g2.globalAlpha=Math.max(0,.35-(t-flashT)*.05);g2.beginPath();g2.moveTo(cxs,cys);g2.lineTo(cxs+Math.cos(q-.04)*w,cys+Math.sin(q-.04)*w);g2.lineTo(cxs+Math.cos(q+.04)*w,cys+Math.sin(q+.04)*w);g2.closePath();g2.fillStyle=A.rgba(p[1],1);g2.fill()}}
   g2.globalAlpha=1;g2.globalCompositeOperation='source-over';
   // the scythe: the old tier spins in, flashes, shatters; the new tier is revealed inside a turning halo
   const L=(th.type=='gauntlet'||th.type=='chakram'?220:th.type=='gun'||th.type=='bow'?300:380)*sc;if(t<flashT){const k2=Math.min(1,t/(flashT*.8)),rot=-1.1+(1-k2)*2.2+Math.sin(t*3)*.03;g2.save();g2.translate(cxs,cys+(1-k2)*80*sc);g2.rotate(rot);g2.globalAlpha=Math.min(1,t*1.5);g2.translate(-L*.45,0);A.weapon(g2,k,Math.max(1,from),L,t,{aura:1});g2.restore();
    if(!red2)for(let i=0;i<3;i++){g2.globalCompositeOperation='lighter';g2.globalAlpha=(t/flashT)*.25;g2.beginPath();g2.arc(cxs,cys,(60+i*40)*sc*(1-t/flashT*.5),0,TAU);g2.strokeStyle=p[1];g2.lineWidth=2;g2.stroke();g2.globalCompositeOperation='source-over'}}
   else{const k3=Math.min(1,(t-flashT)/.6);
    if(!red2)for(const s of SC.shards){const d=s.v*(t-flashT)*sc;if(d>Math.max(w,h))continue;g2.save();g2.translate(cxs+Math.cos(s.a)*d,cys+Math.sin(s.a)*d);g2.rotate(s.r+s.vr*(t-flashT));g2.globalAlpha=Math.max(0,1-(t-flashT)/1.6);g2.fillStyle=A.metal(g2,-s.s,-s.s,s.s,s.s,k,.2);g2.beginPath();g2.moveTo(0,-s.s);g2.lineTo(s.s*.5,s.s*.6);g2.lineTo(-s.s*.4,s.s*.4);g2.closePath();g2.fill();g2.restore()}
    g2.save();g2.translate(cxs,cys);g2.globalAlpha=k3;g2.rotate(tt*.25);g2.strokeStyle=A.rgba(p[1],.85);g2.lineWidth=2;g2.beginPath();g2.arc(0,0,250*sc,0,TAU);g2.stroke();g2.lineWidth=1;g2.beginPath();g2.arc(0,0,268*sc,0,TAU);g2.stroke();
    for(let i=0;i<12;i++){const q=i/12*TAU;A.rune(g2,Math.cos(q)*259*sc,Math.sin(q)*259*sc,7*sc,A.rgba(p[1],.9),q+Math.PI/2,i)}for(let i=0;i<4;i++){const q=i/4*TAU+tt*.4;A.star4(g2,Math.cos(q)*250*sc,Math.sin(q)*250*sc,12*sc,'#ffffff',q)}g2.restore();
    g2.save();g2.translate(cxs,cys+Math.sin(tt*1.6)*6*sc);g2.rotate(-1.05+Math.sin(tt*1.1)*.03);g2.globalAlpha=k3;g2.translate(-L*.45,0);A.weapon(g2,k,to,L,t,{aura:1});g2.restore();
    for(let i=0;i<10;i++){const q=i*.63+tt*.8,r=(150+60*Math.sin(tt+i))*sc;g2.globalAlpha=k3*(.5+.5*Math.sin(tt*3+i));A.motif(g2,k,cxs+Math.cos(q)*r,cys+Math.sin(q)*r*.7,9*sc,q,tt)}g2.globalAlpha=1;
    // words
    const tw=Math.min(1,(t-flashT-.4)/.8);if(tw>0){g2.globalAlpha=tw;g2.textAlign='center';g2.fillStyle=A.rgba(p[1],.9);g2.font='600 '+Math.round(12*sc+4)+"px Montserrat,'Segoe UI',sans-serif";g2.fillText((from?'ASCENSION':'AWAKENING').split('').join(' '),cxs,h*.12+10);
     const big=Math.round(64*sc+18);g2.font='900 italic '+big+"px Montserrat,'Segoe UI',sans-serif";const gr=g2.createLinearGradient(0,h*.8-big,0,h*.8);gr.addColorStop(0,'#ffffff');gr.addColorStop(.5,A.mix(p[1],'#ffffff',.3));gr.addColorStop(.55,p[0]);gr.addColorStop(1,'#ffffff');g2.fillStyle=gr;
     g2.fillText('TIER '+RN[to],cxs,h*.82);g2.font='700 '+Math.round(18*sc+6)+"px Montserrat,'Segoe UI',sans-serif";g2.fillStyle='#ffffff';g2.fillText(th.n,cxs,h*.82+Math.round(30*sc+10));
     g2.font='500 italic '+Math.round(13*sc+5)+"px 'Cormorant Garamond',Georgia,serif";g2.fillStyle=A.rgba('#ffffff',.85);g2.fillText(from?'You have been ascended to a new level of '+th.noun+'.':'The scythe has chosen you.',cxs,h*.82+Math.round(56*sc+18))}}
   // the flash
   const fl=Math.max(0,1-Math.abs(t-flashT)/.35);if(fl>0){g2.globalAlpha=fl*(red2?.5:1);g2.fillStyle='#ffffff';g2.fillRect(0,0,w,h);g2.globalAlpha=1}
   // fade out at the end
   if(t>dur-.6){g2.globalAlpha=Math.min(1,(t-(dur-.6))/.6);g2.fillStyle='#06040a';g2.fillRect(0,0,w,h);g2.globalAlpha=1}
   if(t<dur)requestAnimationFrame(fr);else{for(const ev of evs)removeEventListener(ev,block,{capture:true});cv2.remove();window.RB_COVER=cover0;SC=null;
    try{UI6.say6(th.n+' · Tier '+RN[to],to==1?'Forged. Your mythic scythe is in your hand.':'Damage +'+Math.round(22*(to-1))+'%'+(to==2?' · the first cut fires a crescent':to==3?' · the finisher throws the scythe':to==4?' · hits echo with bursts':' · a doubled finisher that heals'),3200)}catch(_){}
    try{if(typeof CLS9!='undefined'&&CLS9.isOpen())CLS9.refresh&&CLS9.refresh()}catch(_){}}};
  requestAnimationFrame(fr)}
 return{prof,drawCrown,ID,KOF,TH,tier,next,check,ascend,access,scene,LV,GEMS,MATS,RN,get S(){return S},save,setOutfit(v){S.out=v?1:0;save()},get outfit(){return S.out},outfitK,attack,get swing(){return SW},get thrown(){return THR},fx:FX,parts:PT,PROF}})();
