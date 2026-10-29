// ===== Boss fights (BOSSX): telegraphed hazards, three phases with their own attack lists, wind-ups, vulnerable windows after big attacks,
// shields + stagger, arena hazards in phases II-III, no building in a boss, idle/attack animation. (BOSS10 adds the cinematics, aura and health bar.)
// three more bosses (data + art + mechanics live here so they can share the hazard system)
BOSSES.push(
 {id:'magma',n:'Magma Colossus',depth:34,hp:4200,w:112,h:132,dmg:32,ai:'walk',spm:.8,c:'#ff6a2a',gems:3600,xp:4500,relic:'magma',rn:'Colossus Heart',rd:'+8% damage',fx:{dmg:.08},desc:'A basalt giant whose cracks run with living lava.'},
 {id:'tide',n:'Abyssal Leviathan',depth:46,hp:5200,w:150,h:72,dmg:34,ai:'fly',spm:1.1,c:'#4aa8ff',gems:5200,xp:6200,relic:'tide',rn:'Leviathan Pearl',rd:'+10% gems',fx:{gem:.1},desc:'A deep-sea serpent that drags the tide behind it.'},
 {id:'storm',n:'Tempest Roc',depth:58,hp:6500,w:140,h:100,dmg:38,ai:'fly',spm:1.3,c:'#ffe27a',gems:7600,xp:8800,relic:'tempest',rn:'Roc Feather',rd:'+6% speed, +6% jump',fx:{spd:.06,jump:.06},desc:'A thunderbird that calls lightning down on its prey.'});
for(const b of BOSSES.slice(3)){MK['boss_'+b.id]={c:b.c,hp:b.hp,w:b.w,h:b.h,gem:40,dmg:b.dmg,ai:b.ai,jp:b.jp,sx:b.sx,cd:b.cd,spm:b.spm,fly:b.ai=='fly'?1:0,ph:b.ai=='fly'?1:0,min:9999,max:9999,boss:1};MOBMAT['boss_'+b.id]=10}
const BOSSX=(()=>{
 const HZ=[],ORB=[],Q=[],AL=[];let nb=0;const rn=(a,b)=>a+Math.random()*(b-a);
 const cols={warden:'#6fe08a',sovereign:'#7fd8ff',eclipse:'#b58cff',magma:'#ff6a2a',tide:'#4aa8ff',storm:'#ffe27a'},MOV=[];let gust=null;
 const boss=()=>{const a=BOSS6.active();return a&&!a.dead&&mobs.includes(a)?a:null};
 const id=m=>m.k.slice(5);
 function hit(a,kb){if(iT>0)return;P.hp-=a*(1-Math.min(.8,bonus().arm+(guard>0?.5:0)));iT=.9;P.vx=kb||0;P.vy=-320;hurtF=.45;shake=Math.max(shake,QM.reduce?0:.14);snd(130,.22,'sawtooth',.07)}
 const gyAt=(x,fromY)=>{const tx=Math.max(1,Math.min(W-2,Math.floor(x/T)));let ty=Math.floor(fromY/T);for(let i=0;i<40&&ty<H-2;i++,ty++)if(solidAt(tx,ty))return ty*T;return fromY};   // 40 rows: the arena is tall enough to fly 20 tiles up
 const hitsP=z=>z.circ?Math.hypot(P.x-z.cx,P.y+P.h/2-z.cy)<z.r+P.w*.4:P.x+P.w/2>z.x0&&P.x-P.w/2<z.x1&&P.y+P.h>z.y0&&P.y<z.y1;
 // hazard: rectangle (or circle) that warns for tel seconds, then hurts for act seconds
 const addZ=(x0,y0,x1,y1,tel,act,c,dmg,kind,kb,rep)=>{const z={x0,y0,x1,y1,tel,tel0:tel,act,act0:act,c,dmg,kind,kb:kb||260,hit:0,rep:rep||0,rt:0,fx:0};HZ.push(z);return z};
 const addC=(cx,cy,r,tel,act,c,dmg,kb)=>{const z=addZ(cx-r,cy-r,cx+r,cy+r,tel,act,c,dmg,'nova',kb||340);z.circ=1;z.cx=cx;z.cy=cy;z.r=r;return z};
 const later=(t,f)=>Q.push({t,f});
 const aim=(x,y,a,len,t,c)=>AL.push({x,y,a,len,t,t0:t,c});
 // the fight area: the arena barrier when there is one, else around the player
 const area=()=>{try{const A=ARENA7.arena;if(A&&!A.end)return[A.x0+T,A.x1-T]}catch(_){}return[P.x-T*9,P.x+T*9]};
 const clampX=x=>{const a=area();return Math.max(a[0],Math.min(a[1],x))};
 function col(x,m,tel,up,c,dm){const gy=gyAt(x,P.y+P.h-8);const h=up?T*5:T*13;return addZ(x-T*.7,gy-h,x+T*.7,gy+2,tel,.35,c,m.dmg*(dm||1.1),up?'up':'down')}
 function beam(m,y,tel,c){const x0=Math.max(T,m.x-T*16),x1=Math.min((W-1)*T,m.x+T*16);addZ(x0,y-15,x1,y+15,tel,.3,c,m.dmg*1.1,'beam')}
 function orb(m,sp){ORB.push({x:m.x,y:m.y+m.h*.4,vx:Math.cos(sp)*120,vy:Math.sin(sp)*120,l:6,c:'#b58cff'})}
 function slamAt(m,x,tel,c){const gy=gyAt(x,m.y+m.h-T);addZ(x-T*4.2,gy-T*2.4,x+T*4.2,gy+2,tel,.4,c,m.dmg*1.3,'slam',420)}
 const ATK={
  warden:{thorns(m,p2){const n=p2?5:3;for(let i=0;i<n;i++)col(P.x+rn(-T*4,T*4),m,1.0+i*.28,1,'#6fe08a');UI6.say6('THORNS','',700)},
          wave(m,p2){const d=Math.sign(P.x-m.x)||1,n=p2?11:8;for(let k=1;k<=n;k++)col(m.x+d*k*T*1.5,m,.75+k*.12,1,'#6fe08a')},
          // II: roots tear through the floor both ways from the Warden
          rootline(m,p2,p3){const n=p3?9:7;for(const d of[-1,1])for(let k=1;k<=n;k++)col(m.x+d*k*T*1.5,m,.85+k*.11,1,'#8fdc5a')},
          // III: a huge leap that lands where you stand, shock waves to both sides
          quake(m,p2,p3){const tx=clampX(P.x),gy=gyAt(tx,P.y+P.h-8);m.vy=-1050;m.vx=(tx-m.x)/1.15;m.g=false;addZ(tx-T*3.2,gy-T*2.4,tx+T*3.2,gy+2,1.25,.4,'#6fe08a',m.dmg*1.35,'slam',420);
           addZ(tx-T*6.6,gy-T*1.2,tx-T*3.2,gy+2,1.55,.35,'#8fdc5a',m.dmg*.9,'slam',360);addZ(tx+T*3.2,gy-T*1.2,tx+T*6.6,gy+2,1.55,.35,'#8fdc5a',m.dmg*.9,'slam',360);UI6.say6('QUAKE','Get clear!',800)}},
  sovereign:{rain(m,p2){const n=p2?8:6;for(let i=0;i<n;i++)col(P.x+(i-(n-1)/2)*T*1.7+rn(-8,8),m,1.0+Math.abs(i-n/2)*.1+rn(0,.4),0,'#7fd8ff')},
          beam(m,p2){const y=P.y+P.h*.55;beam(m,y,1.15,'#7fd8ff');if(p2)beam(m,y-T*2.6,1.5,'#7fd8ff')},
          // II: a ring of crystal shards, aim lines first, then they fly
          prism(m,p2,p3){const n=p3?12:8,a0=Math.random()*6.283,x=m.x,y=m.y+m.h*.45;for(let i=0;i<n;i++)aim(x,y,a0+i*6.283/n,T*9,.85,'#bfeaff');
           later(.85,()=>{const b=boss();if(!b)return;for(let i=0;i<n;i++){const a=a0+i*6.283/n;ORB.push({x,y,vx:Math.cos(a)*270,vy:Math.sin(a)*270,l:3.4,c:'#bfeaff',straight:1,r:10})}snd(900,.25,'triangle',.07,.8)})},
          // III: a beam across and a crystal pillar down on you at once
          cross(m,p2,p3){const y=P.y+P.h*.55;beam(m,y,1.2,'#7fd8ff');col(P.x,m,1.2,0,'#bfeaff',1.2);if(p3)col(P.x+(Math.random()<.5?-1:1)*T*3,m,1.6,0,'#bfeaff')}},
  magma:{lava(m,p2){const d=Math.sign(P.x-m.x)||1,n=p2?9:6;for(let k=0;k<n;k++){const x=m.x+d*(T*1.6+k*T*1.7);col(x,m,.7+k*.1,1,'#ff8a3a');if(p2&&k%2==0)col(x-d*T*.85,m,.9+k*.1,1,'#ff8a3a')}},
         meteors(m,p2){const n=p2?7:5;for(let i=0;i<n;i++){const x=P.x+rn(-T*6,T*6),gy=gyAt(x,P.y+P.h-8),tel=1.0+i*.25;addZ(x-T*.8,gy-T*14,x+T*.8,gy+2,tel,.3,'#ff6a2a',m.dmg*1.2,'down',280);addZ(x-T*1.4,gy-T*.8,x+T*1.4,gy+2,tel+.3,3.2,'#ff5a1a',m.dmg*.22,'fire',120,.55)}},
         slam(m,p2){slamAt(m,m.x,1.1,'#ff8a3a');if(p2){const gy=gyAt(m.x,m.y+m.h-T);addZ(m.x-T*8,gy-T*1.6,m.x-T*4.2,gy+2,1.5,.4,'#ff8a3a',m.dmg,'slam',380);addZ(m.x+T*4.2,gy-T*1.6,m.x+T*8,gy+2,1.5,.4,'#ff8a3a',m.dmg,'slam',380)}},
         // III: geysers burst up across the arena and leave burning pools
         eruption(m,p2,p3){const a=area();for(let i=0;i<4;i++){const x=a[0]+(a[1]-a[0])*(i+.2+Math.random()*.6)/4,gy=gyAt(x,P.y+P.h-8),tel=1.05+i*.2;addZ(x-T*.85,gy-T*8,x+T*.85,gy+2,tel,.45,'#ff8a3a',m.dmg*1.2,'up',320);addZ(x-T*1.3,gy-T*.7,x+T*1.3,gy+2,tel+.4,2.6,'#ff5a1a',m.dmg*.2,'fire',120,.55)}UI6.say6('ERUPTION','',800)},
         // III: two slams in a row
         rage(m,p2,p3){slamAt(m,m.x,1.0,'#ff8a3a');later(1.25,()=>{const b=boss();if(b)slamAt(b,b.x,.85,'#ffb04a')})}},
  tide:{wave(m,p2){const side=m.x<P.x?-1:1,x=Math.max(T,Math.min((W-2)*T,P.x+side*T*17)),gy=gyAt(P.x,P.y+P.h-8),h=T*(p2?2.8:2.2);MOV.push({x,d:-side,sp:380,l:6,tel:1.2,tel0:1.2,gy,h,c:'#4aa8ff',dmg:m.dmg*1.2,hit:0});UI6.say6('TIDAL WAVE','',800)},
        bubbles(m,p2){const n=p2?8:5,a0=Math.atan2(P.y-m.y,P.x-m.x);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*.5;ORB.push({x:m.x,y:m.y+m.h*.4,vx:Math.cos(a)*190,vy:Math.sin(a)*190,l:5,c:'#8fd0ff',straight:1,r:14})}snd(420,.25,'sine',.06,.7)},
        dive(m,p2){ATK.eclipse.dash(m,p2)},
        // III: waves from both sides at once (jump or fly over)
        twin(m,p2,p3){const gy=gyAt(P.x,P.y+P.h-8),h=T*2.4;for(const s of[-1,1]){const x=Math.max(T,Math.min((W-2)*T,P.x+s*T*16));MOV.push({x,d:-s,sp:340,l:6,tel:1.3,tel0:1.3,gy,h,c:'#4aa8ff',dmg:m.dmg*1.1,hit:0})}UI6.say6('TWIN TIDES','Jump!',900)},
        // III: a whirlpool drags you in while bubbles burst outward
        whirl(m,p2,p3){m.pull=3.4;later(.7,()=>{const b=boss();if(!b)return;for(let i=0;i<8;i++){const a=i*.785;ORB.push({x:b.x,y:b.y+b.h*.4,vx:Math.cos(a)*170,vy:Math.sin(a)*170,l:4,c:'#8fd0ff',straight:1,r:13})}});UI6.say6('WHIRLPOOL','',900)}},
  storm:{bolts(m,p2){const n=p2?6:4;for(let i=0;i<n;i++){const x=P.x+(i==0?0:rn(-T*7,T*7)),gy=gyAt(x,P.y+P.h-8),tel=.8+i*.3;addZ(x-T*.45,gy-T*16,x+T*.45,gy+2,tel,.22,'#fff6b0',m.dmg*1.3,'bolt',300)}},
         gale(m,p2){gust={t:2.8,d:Math.sign(m.x-P.x)||1,wait:.9};UI6.say6('GALE','Brace!',900)},
         volley(m,p2){const n=p2?9:6,a0=Math.atan2(P.y-m.y,P.x-m.x);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*.2;ORB.push({x:m.x,y:m.y+m.h*.4,vx:Math.cos(a)*340,vy:Math.sin(a)*340,l:3.2,c:'#ffe27a',straight:1,r:9})}snd(700,.25,'triangle',.07,.6)},
         // III: lightning sweeps the arena wall to wall; stand in the gap
         sweep(m,p2,p3){const a=area(),n=Math.max(6,Math.round((a[1]-a[0])/(T*1.8))),d=Math.random()<.5?1:-1,gap=1+(Math.random()*(n-3)|0);
          for(let i=0;i<n;i++){if(i==gap||i==gap+1)continue;const x=d>0?a[0]+i*(a[1]-a[0])/(n-1):a[1]-i*(a[1]-a[0])/(n-1),gy=gyAt(x,P.y+P.h-8);addZ(x-T*.5,gy-T*16,x+T*.5,gy+2,.8+i*.13,.22,'#fff6b0',m.dmg*1.2,'bolt',300)}UI6.say6('THUNDER SWEEP','Find the gap',900)},
         nova(m,p2,p3){addC(m.x,m.y+m.h/2,T*3.8,1.25,.35,'#ffe27a',m.dmg*1.3)}},
  eclipse:{orbs(m,p2){const n=p2?5:3,a0=Math.atan2(P.y-m.y,P.x-m.x);for(let i=0;i<n;i++)orb(m,a0+(i-(n-1)/2)*.9);snd(300,.3,'sine',.07,.5)},
          dash(m,p2){const dir=P.x>m.x?1:-1,tx=Math.max(3*T,Math.min((W-3)*T,P.x+dir*T*9)),y=P.y+P.h*.4;m.dash={tx,y,t:0,tel:.9};addZ(Math.min(m.x,tx)-8,y-18,Math.max(m.x,tx)+8,y+18,.9,.45,'#b58cff',m.dmg*1.3,'beam',380)},
          pull(m,p2){if(!p2)return ATK.eclipse.orbs(m,p2);m.pull=3.4;UI6.say6('VOID PULL','',900)},
          // II: a void nova around the Eclipse Lord; get out of the circle
          nova(m,p2,p3){addC(m.x,m.y+m.h/2,T*4.3,1.3,.35,'#b58cff',m.dmg*1.3)},
          // III: void pillars rain down around you
          voidfall(m,p2,p3){for(let i=0;i<5;i++)col(P.x+(i-2)*T*2.2+rn(-10,10),m,1.0+Math.abs(i-2)*.22,0,'#9a6bff')}}};
 // attack lists per phase (I / II / III); big attacks leave the boss open for a moment afterwards
 const LIST={warden:[['thorns','wave'],['thorns','wave','rootline'],['wave','rootline','quake','thorns']],
  sovereign:[['rain','beam'],['rain','beam','prism'],['beam','prism','cross','rain']],
  eclipse:[['orbs','dash'],['orbs','dash','pull','nova'],['dash','pull','nova','voidfall']],
  magma:[['lava','slam'],['lava','meteors','slam'],['meteors','eruption','rage','lava']],
  tide:[['bubbles','dive'],['bubbles','dive','wave'],['wave','twin','whirl','dive']],
  storm:[['volley','bolts'],['volley','bolts','gale'],['gale','sweep','nova','bolts']]};
 const BIG={wave:1,rootline:1,quake:1,beam:1,cross:1,dash:1,dive:1,nova:1,slam:1,meteors:1,eruption:1,rage:1,twin:1,gale:1,sweep:1};
 const CAD=[4.4,3.4,2.7],WIND=[.6,.55,.42];
 // arena hazards (phases II-III): the arena itself turns on you, in the boss's element
 function arenaHz(m,n){const a=area(),b=id(m),xs=[];for(let i=0;i<n*4&&xs.length<n;i++){const x=rn(a[0],a[1]);if(xs.every(v=>Math.abs(v-x)>T*2.2))xs.push(x)}
  for(let i=0;i<xs.length;i++){const x=xs[i],gy=gyAt(x,P.y+P.h-8),tel=1.25+i*.2,d=m.dmg*.8;let z;
   if(b=='warden')z=addZ(x-T*.6,gy-T*4,x+T*.6,gy+2,tel,.35,'#8fdc5a',d,'up');else if(b=='sovereign')z=addZ(x-T*.6,gy-T*13,x+T*.6,gy+2,tel,.3,'#bfeaff',d,'down');
   else if(b=='eclipse')z=addZ(x-T*.6,gy-T*13,x+T*.6,gy+2,tel,.3,'#9a6bff',d,'down');else if(b=='magma'){z=addZ(x-T*.7,gy-T*6,x+T*.7,gy+2,tel,.4,'#ff8a3a',d,'up');addZ(x-T*1.1,gy-T*.6,x+T*1.1,gy+2,tel+.4,1.8,'#ff5a1a',m.dmg*.18,'fire',120,.55).ah=1}
   else if(b=='tide')z=addZ(x-T*.7,gy-T*5,x+T*.7,gy+2,tel,.4,'#6ac8ff',d,'up');else z=addZ(x-T*.4,gy-T*16,x+T*.4,gy+2,tel,.22,'#fff6b0',d,'bolt',300);z.ah=1}}
 function zoneFx(z){try{shake=Math.max(shake,QM.reduce?0:(z.kind=='bolt'?.14:.08));const x=(z.x0+z.x1)/2,cn=QM.reduce?3:z.ah?5:9;snd(z.kind=='bolt'?1400:z.kind=='beam'?240:100,.2,z.kind=='bolt'?'square':'sawtooth',.07,.4);
  if(z.kind=='beam'){for(let i=0;i<cn;i++)VFX.add(1,z.c,z.x0+Math.random()*(z.x1-z.x0),(z.y0+z.y1)/2,0,(Math.random()-.5)*80,.4,9,2,{a:1});return}
  if(z.kind=='fire')return;if(z.circ){VFX.wave(z.cx,z.cy,z.c,z.r*1.1,.45,1);VFX.wave(z.cx,z.cy,'#fff',z.r*.8,.3,1);for(let i=0;i<cn;i++){const a=Math.random()*6.283;VFX.add(1,z.c,z.cx+Math.cos(a)*z.r*.8,z.cy+Math.sin(a)*z.r*.8,Math.cos(a)*160,Math.sin(a)*160,.45,10,2,{a:.9})}return}
  const up=z.kind!='down'&&z.kind!='bolt';const yb=z.y1-2;for(let i=0;i<cn;i++)VFX.add(0,i%3?z.c:'#fff',x+(Math.random()-.5)*(z.x1-z.x0),yb,(Math.random()-.5)*160,-(80+Math.random()*260)*(up?1:.5),.5,12,3,{a:.9,g:260});VFX.wave(x,yb,z.c,Math.min(160,(z.x1-z.x0)*.9),.4,.3);if(z.kind=='bolt')VFX.wave(x,z.y0+(z.y1-z.y0)*.5,'#fff',60,.25,.4)}catch(_){}}
 // how long an attack keeps the boss busy (its hazards resolving), for the vulnerable window that follows a big one
 function busyFor(m,h0,v0,q0){let d=.6;for(let i=h0;i<HZ.length;i++){const z=HZ[i];if(!z.rep)d=Math.max(d,z.tel0+z.act0)}for(let i=v0;i<MOV.length;i++)d=Math.max(d,MOV[i].tel0+1.3);for(let i=q0;i<Q.length;i++)d=Math.max(d,Q[i].t+.9);if(m.dash)d=Math.max(d,m.dash.tel+.45);if(gust)d=Math.max(d,gust.wait+.8);return d}
 function fire(m,b,pick,ph){const h0=HZ.length,v0=MOV.length,q0=Q.length;try{ATK[b][pick](m,ph>=2,ph>=3)}catch(e){console.error(e)}m.last=pick;if(BIG[pick]){m.vq=busyFor(m,h0,v0,q0)+.1}}
 function tick(dt){const m=boss();
  if(!m){if(HZ.length||ORB.length||MOV.length||Q.length||AL.length||gust)clearFx();return}
  const b=id(m),ph=Math.max(1,Math.min(3,m.phase|0)),p2=ph>=2;if(!ATK[b])return;
  if(m.born==null)m.born=performance.now();
  if(m.xt==null){m.xt=3.2;m.xc=0;m.stag=0;m.shieldAt=[.66,.33];m.shield=0;m.wind=0;m.vul=0;m.vq=0;m.ah=5}
  if(m.stag>0){m.stag-=dt;m.xt=Math.max(m.xt,1.2);m.wind=0}
  // vulnerable window: opens when a big attack has played out
  if(m.vq>0){m.vq-=dt;if(m.vq<=0&&m.stag<=0){m.vul=1.6;try{BOSS10.vuln(m)}catch(_){}}}if(m.vul>0)m.vul-=dt;
  // shield: Sovereign + Eclipse + the newer bosses raise a barrier at the phase marks (after the transition beat); breaking it staggers the boss
  if(b!='warden'&&m.shieldAt.length&&m.hp/m.mhp<m.shieldAt[0]&&!(m.pb>0)){m.shieldAt.shift();m.shield=m.mhp*.12;m.shieldMax=m.shield;UI6.say6('SHIELD UP','Burst it down to break it',1800);VFX.wave(m.x,m.y+m.h/2,cols[b],260,.8,.4);snd(520,.4,'sine',.08,.6)}
  // wind-up (crouch + warning mark), then the attack
  if(m.wind>0){m.wind-=dt;if(m.wind<=0){m.wind=0;fire(m,b,m.wpick,ph);m.xc++;
    if(m.xc%4==0){m.stag=3.4;m.xt=3.6;m.vq=0;UI6.say6('EXHAUSTED','Hit it now',1400);VFX.wave(m.x,m.y+m.h/2,'#ffd24a',200,.7,.3)}}}
  else{m.xt-=dt;if(m.xt<=0&&m.stag<=0&&!(m.pb>0)&&performance.now()-m.born>1600){const l=LIST[b][ph-1].filter(k=>k!=m.last),pick=l[Math.random()*l.length|0];m.wpick=pick;m.wind=m.wind0=WIND[ph-1];
    m.xt=ph>=3&&!m.cmb&&Math.random()<.35?(m.cmb=1,1.25):(m.cmb=0,CAD[ph-1])}}   // phase III sometimes chains a second attack
  // arena hazards
  if(p2&&!(m.pb>0)){m.ah-=dt;if(m.ah<=0){m.ah=ph>=3?4.6:7;arenaHz(m,ph>=3?3:2)}}
  // delayed halves of attacks + aim lines
  for(let i=Q.length-1;i>=0;i--){const q=Q[i];q.t-=dt;if(q.t<=0){Q.splice(i,1);try{q.f()}catch(e){console.error(e)}}}
  for(let i=AL.length-1;i>=0;i--){AL[i].t-=dt;if(AL[i].t<=0)AL.splice(i,1)}
  // dash / pull state
  if(m.dash){m.dash.t+=dt;if(m.dash.t>m.dash.tel){const k=Math.min(1,(m.dash.t-m.dash.tel)/.35);m.x+=(m.dash.tx-m.x)*Math.min(1,dt*9);m.y+=(m.dash.y-m.h*.4-m.y)*Math.min(1,dt*7);if(k>=1)m.dash=null}}
  if(m.pull>0){m.pull-=dt;const dx=m.x-P.x,d=Math.abs(dx);if(m.pull<2.4&&d<T*16){P.x+=Math.sign(dx)*Math.min(150,60+ (T*16-d)*.1)*dt}if(Math.hypot(dx,m.y+m.h/2-(P.y+P.h/2))<T*2.4&&m.pull<2.4)hit(m.dmg*.9,Math.sign(-dx||1)*300)}
  // hazards (a short burst of particles marks the moment a zone goes live)
  for(let i=HZ.length-1;i>=0;i--){const z=HZ[i];if(z.tel>0){z.tel-=dt;if(z.tel<=0)zoneFx(z)}else{z.act-=dt;
    if(z.rep){z.rt-=dt;if(z.rt<=0&&hitsP(z)){z.rt=z.rep;hit(z.dmg,Math.sign(P.x-(z.x0+z.x1)/2||1)*z.kb)}if(z.kind=='fire'&&!QM.reduce&&Math.random()<dt*14)VFX.add(0,Math.random()<.5?'#ff8a3a':'#ffd24a',z.x0+Math.random()*(z.x1-z.x0),z.y1-4,0,-50-Math.random()*60,.5,10,3,{a:.8})}
    else if(!z.hit&&hitsP(z)){z.hit=1;hit(z.dmg,Math.sign(P.x-(z.circ?z.cx:(z.x0+z.x1)/2)||1)*z.kb)}if(z.act<=0)HZ.splice(i,1)}}
  // moving tidal waves
  for(let i=MOV.length-1;i>=0;i--){const v=MOV[i];if(v.tel>0){v.tel-=dt;continue}v.x+=v.d*v.sp*dt;v.l-=dt;const r={x0:v.x-T*.9,x1:v.x+T*.9,y0:v.gy-v.h,y1:v.gy};
   if(!QM.reduce&&Math.random()<dt*30)VFX.add(0,'#bfe6ff',v.x+(Math.random()-.5)*T,v.gy-Math.random()*v.h,0,-30,.5,10,3,{a:.7});
   if(!v.hit&&hitsP(r)){v.hit=1;hit(v.dmg,v.d*380)}if(v.l<=0||v.x<0||v.x>W*T)MOV.splice(i,1)}
  // gale: pushes you toward the boss unless you push back
  if(gust){if(gust.wait>0)gust.wait-=dt;else{gust.t-=dt;P.vx+=gust.d*(P.g?700:1000)*dt;if(!QM.reduce&&Math.random()<dt*70)VFX.add(0,'#eef6ff',cam.x+Math.random()*cv.width/ZM,cam.y+Math.random()*cv.height/ZM,gust.d*420,0,.4,10,2,{a:.5});if(gust.t<=0)gust=null}}
  // homing void orbs
  for(let i=ORB.length-1;i>=0;i--){const o=ORB[i];o.l-=dt;const dx=P.x-o.x,dy=P.y+P.h/2-o.y,d=Math.hypot(dx,dy)||1,sp=p2?190:140;if(!o.straight){o.vx+=dx/d*260*dt;o.vy+=dy/d*260*dt;const v=Math.hypot(o.vx,o.vy);if(v>sp){o.vx*=sp/v;o.vy*=sp/v}}o.x+=o.vx*dt;o.y+=o.vy*dt;if(o.straight&&solidAt(Math.floor(o.x/T),Math.floor(o.y/T)))o.l=0;
   if(Math.random()<dt*50)VFX.add(0,o.c,o.x,o.y,0,0,.3,12,2,{a:.7});
   if(d<P.w/2+(o.r||12)){hit(m.dmg*.8,Math.sign(o.vx||1)*200);o.l=0}if(o.l<=0){VFX.burst(o.x,o.y,[o.c,'#fff'],6,120,1,.4,9);ORB.splice(i,1)}}}
 function clearFx(){HZ.length=0;ORB.length=0;MOV.length=0;Q.length=0;AL.length=0;gust=null}
 // damage shaping: shield absorbs, staggered bosses take +45%, a vulnerable window +35%
 {const _h=hurtMob;hurtMob=function(m,d,w,ang){if(m.boss&&m.k&&m.k.startsWith('boss_')){if(m.shield>0){const ab=Math.min(d,m.shield);m.shield-=ab;d-=ab;if(m.shield<=0){m.shield=0;m.stag=4.2;m.xt=4.4;m.wind=0;UI6.say6('SHIELD BROKEN','Strike now!',1500);try{VFX.shatter(m.x,m.y+m.h/2,['#fff',cols[id(m)]],30)}catch(_){}snd(900,.2,'triangle',.08,1.2)}if(d<=0)d=.01}else if(m.stag>0)d*=1.45;else if(m.vul>0)d*=1.35}return _h.call(this,m,d,w,ang)}}
 // no building inside a boss (or right beside it)
 {const _pa=placeAction;placeAction=function(){try{const tx=Math.floor((mx+cam.x)/T),ty=Math.floor((my+cam.y)/T);for(const m of mobs){if(!m.boss||m.dead)continue;if(tx*T<m.x+m.w/2+T&&(tx+1)*T>m.x-m.w/2-T&&ty*T<m.y+m.h+T&&(ty+1)*T>m.y-T){if(performance.now()-nb>1200){nb=performance.now();say("You can't build inside a boss");try{UIS.play('error')}catch(_){}}return}}}catch(_){}return _pa.apply(this,arguments)}}

 // ---- art for the three new bosses (feet at the origin after translate)
 const NEWART={magma:1,tide:1,storm:1},OL='#0e0818';
 function artNew(m,now,b){const px=m.x-cam.x,py=m.y-cam.y+m.h,t=now/1000,fl=m.fl>0,enr=m.phase==2,f=(P.x>m.x)?1:-1,w=m.w,h=m.h;g.save();g.translate(px,py);g.lineJoin='round';g.lineCap='round';
  if(b=='magma'){const mv=Math.abs(m.vx)>10?1:.15,sw=Math.sin(t*4)*mv,pulse=.55+.45*Math.sin(t*3),rock=fl?'#fff':'#3a2e3c',rock2=fl?'#ddd':'#1d1624';g.scale(f,1);
   // legs
   for(const s of[-1,1]){g.fillStyle=rock2;g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.roundRect(s*w*.2-14+s*sw*8,-h*.38,28,h*.38,6);g.fill();g.stroke()}
   // far arm, torso, near arm
   const arm=(s,ph)=>{const a=Math.sin(t*4+ph)*mv*.5,sx=s*w*.46,sy=-h*.78;g.strokeStyle=OL;g.lineWidth=17;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+s*10+a*14,sy+h*.34);g.stroke();g.strokeStyle=rock;g.lineWidth=12;g.stroke();g.fillStyle=rock;g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.arc(sx+s*10+a*14,sy+h*.4,16,0,6.3);g.fill();g.stroke();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,110,30,'+(.35+.3*pulse)+')';g.beginPath();g.arc(sx+s*10+a*14,sy+h*.4,9,0,6.3);g.fill();g.globalCompositeOperation='source-over'};arm(-1,0);
   const gr=g.createLinearGradient(0,-h*.9,0,-h*.3);gr.addColorStop(0,fl?'#fff':'#4a3c4e');gr.addColorStop(1,rock2);g.fillStyle=gr;g.strokeStyle=OL;g.lineWidth=3.5;g.beginPath();g.moveTo(-w*.42,-h*.4);g.lineTo(-w*.5,-h*.7);g.lineTo(-w*.3,-h*.9);g.lineTo(w*.3,-h*.9);g.lineTo(w*.5,-h*.7);g.lineTo(w*.42,-h*.4);g.lineTo(w*.2,-h*.3);g.lineTo(-w*.2,-h*.3);g.closePath();g.fill();g.stroke();
   // lava cracks
   g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,'+(enr?70:120)+',30,'+(.55+.4*pulse)+')';g.lineWidth=3;for(const c of[[-.2,-.85,-.05,-.6,-.2,-.4],[.25,-.82,.1,-.62,.28,-.45],[0,-.62,.02,-.4]]){g.beginPath();c.length==6?(g.moveTo(c[0]*w,c[1]*h),g.lineTo(c[2]*w,c[3]*h),g.lineTo(c[4]*w,c[5]*h)):(g.moveTo(c[0]*w,c[1]*h),g.lineTo(c[2]*w,c[3]*h));g.stroke()}
   const ga=g.globalAlpha;g.globalAlpha=ga*(.45+.3*pulse);g.drawImage(BOSS6.glo('#ff8a2a'),-w*.42,-h*.6-w*.42,w*.84,w*.84);g.globalAlpha=ga;g.globalCompositeOperation='source-over';
   // head + shoulder spikes
   g.fillStyle=rock;g.strokeStyle=OL;g.lineWidth=3;for(const s of[-1,1]){g.beginPath();g.moveTo(s*w*.36,-h*.86);g.lineTo(s*w*.5,-h*1.02);g.lineTo(s*w*.22,-h*.9);g.closePath();g.fill();g.stroke()}
   g.beginPath();g.roundRect(-w*.17,-h*1.04,w*.34,h*.2,8);g.fill();g.stroke();g.fillStyle=enr?'#ff3a2a':'#ffb24a';g.fillRect(w*.02,-h*.97,w*.1,5);g.fillRect(-w*.1,-h*.97,w*.08,5);arm(1,2);
   if(!QM.reduce&&Math.random()<(window.FDT||.016)*30)VFX.add(0,'#ff8a3a',m.x+(Math.random()-.5)*w*.6,m.y+h*(.2+Math.random()*.5),0,40,.7,10,3,{a:.8,g:200})}
  else if(b=='tide'){g.scale(f,1);const n=15,seg=w/n,hy=-h*.55,wob=(i)=>Math.sin(t*3-i*.55)*(8+i*.7);const gx=i=>-i*seg*.92+w*.38,gy=i=>hy+wob(i);
   const col1=fl?'#fff':'#2a6fb8',col2=fl?'#ddd':'#8fd8ff';
   for(let i=n-1;i>=1;i--){const r=Math.max(6,(h*.48)*(1-i/(n+3)));g.fillStyle=col1;g.strokeStyle=OL;g.lineWidth=2.5;g.beginPath();g.arc(gx(i),gy(i),r,0,6.3);g.fill();g.stroke();g.fillStyle=col2;g.globalAlpha*=.55;g.beginPath();g.arc(gx(i)-r*.25,gy(i)-r*.3,r*.55,0,6.3);g.fill();g.globalAlpha/=.55;
    if(i%2==0){g.fillStyle=enr?'#ff5a6a':'#4ae8ff';g.beginPath();g.moveTo(gx(i)-4,gy(i)-r+1);g.lineTo(gx(i)+2,gy(i)-r-9-(i%4));g.lineTo(gx(i)+7,gy(i)-r+2);g.closePath();g.fill();g.stroke()}}
   const hx=gx(0),hy2=gy(0),r0=h*.5;const gr=g.createRadialGradient(hx-r0*.3,hy2-r0*.4,2,hx,hy2,r0*1.2);gr.addColorStop(0,col2);gr.addColorStop(1,col1);g.fillStyle=gr;g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.ellipse(hx+6,hy2,r0*1.05,r0*.8,0,0,6.3);g.fill();g.stroke();
   g.fillStyle='#10304a';g.beginPath();g.moveTo(hx+r0*.3,hy2+r0*.15);g.quadraticCurveTo(hx+r0,hy2+r0*.55,hx+r0*1.0,hy2+r0*.25);g.quadraticCurveTo(hx+r0*.7,hy2+r0*.3,hx+r0*.3,hy2+r0*.15);g.fill();g.fillStyle='#fff';for(let i=0;i<4;i++){g.beginPath();g.moveTo(hx+r0*(.45+i*.14),hy2+r0*.3);g.lineTo(hx+r0*(.5+i*.14),hy2+r0*.45);g.lineTo(hx+r0*(.55+i*.14),hy2+r0*.3);g.fill()}
   g.fillStyle='#fff6c8';g.beginPath();g.arc(hx+r0*.35,hy2-r0*.15,r0*.24,0,6.3);g.fill();g.stroke();g.fillStyle=enr?'#ff2a3a':'#06222f';g.beginPath();g.ellipse(hx+r0*.4,hy2-r0*.15,r0*.07,r0*.2,0,0,6.3);g.fill();
   g.globalCompositeOperation='lighter';g.drawImage(BOSS6.glo('#6ae8ff'),hx+r0*.2-16,hy2-r0*1.15-16,32,32);g.strokeStyle='rgba(120,220,255,.6)';g.lineWidth=2;g.beginPath();g.moveTo(hx+r0*.1,hy2-r0*.7);g.quadraticCurveTo(hx+r0*.1,hy2-r0*1.1,hx+r0*.2,hy2-r0*1.15);g.stroke();g.globalCompositeOperation='source-over';
   if(!QM.reduce&&Math.random()<(window.FDT||.016)*24)VFX.add(0,'#bfe6ff',m.x+(Math.random()-.5)*w,m.y+h*Math.random(),0,-30,.9,12,4,{a:.5})}
  else{g.scale(f,1);const bob=Math.sin(t*2.2)*5,fl2=Math.sin(t*(m.bs=='tele'?14:6)),cy=-h*.5+bob;g.translate(0,cy);
   const feather=(a0,len,wid,c1,c2)=>{g.save();g.rotate(a0);const gr=g.createLinearGradient(0,0,len,0);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.5,-wid,len,-wid*.15);g.quadraticCurveTo(len*.55,wid*.7,0,0);g.fill();g.stroke();g.restore()};
   const c1=fl?'#fff':'#e8c438',c2=fl?'#eee':'#fff4b0';
   // far wing, tail, body, near wing
   for(const side of[0,1]){if(side==1){g.fillStyle=fl?'#fff':'#f7d84a';g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.ellipse(0,0,w*.3,h*.3,0,0,6.3);g.fill();g.stroke();g.fillStyle=fl?'#fff':'#fff8d0';g.beginPath();g.ellipse(w*.02,h*.1,w*.2,h*.18,0,0,6.3);g.fill();
     for(let i=0;i<4;i++)feather(Math.PI-.5+i*.28,w*.3,10,c1,c2);
     g.fillStyle=fl?'#fff':'#f7d84a';g.beginPath();g.arc(w*.3,-h*.12,h*.2,0,6.3);g.fill();g.stroke();g.fillStyle='#ff9a2a';g.beginPath();g.moveTo(w*.45,-h*.16);g.lineTo(w*.6,-h*.08);g.lineTo(w*.45,-h*.02);g.closePath();g.fill();g.stroke();
     g.fillStyle='#fff';g.beginPath();g.arc(w*.34,-h*.16,5,0,6.3);g.fill();g.stroke();g.fillStyle=enr?'#ff2a3a':'#241a06';g.beginPath();g.arc(w*.35,-h*.16,2.4,0,6.3);g.fill();for(let i=0;i<3;i++)feather(-Math.PI/2-.4+i*.35,h*.28,6,'#ffb030','#fff0a0')}
    const flap=fl2*.7*(side?1:.85)+(side?0:.2),root=[ -w*.04,-h*.12];g.save();g.translate(root[0],root[1]);g.scale(1,side?1:.9);g.globalAlpha=side?1:.8;for(let i=0;i<8;i++)feather(-Math.PI/2.1+flap*(.4+i*.1)-i*.16-(side?0:.1),w*(.6-i*.02),14-i*.8,c1,c2);g.restore();if(side==0){}}
   if(Math.random()<(window.FDT||.016)*(enr?60:30)){g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,250,170,.9)';g.lineWidth=2;g.beginPath();let x0=-w*.5,y0=-h*.3;g.moveTo(x0,y0);for(let i=0;i<6;i++){x0+=w*.17;y0+=(Math.random()-.5)*h*.5;g.lineTo(x0,y0)}g.stroke();g.globalCompositeOperation='source-over'}}
  g.restore();
  const hr=m.hp/m.mhp;if(hr<1){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(px-m.w/2,m.y-cam.y-14,m.w,6);g.fillStyle='#ff5a6a';g.fillRect(px-m.w/2+1,m.y-cam.y-13,(m.w-2)*Math.max(0,hr),4)}}
 // animation wrapper: spawn rise, wind-up crouch, recoil, shadow, shield bubble, exhaustion stars
 {const _dm=drawMob;drawMob=function(m,now){if(!(m.boss&&m.k&&m.k.startsWith('boss_')))return _dm(m,now);
  if(m.born==null)m.born=now;const sp=Math.min(1,(now-m.born)/1300),e=1-Math.pow(1-sp,3),fx=m.x-cam.x,fy=m.y+m.h-cam.y,b=id(m),c=cols[b]||'#fff',t=now/1000,a0=g.globalAlpha;
  g.save();
  // ground shadow
  try{const gy=b=='eclipse'?gyAt(m.x,m.y+m.h)-cam.y:fy;const hgt=Math.max(0,Math.min(1,(gy-fy)/260));g.globalAlpha=a0*(.35-.2*hgt)*e;g.fillStyle='#000';g.beginPath();g.ellipse(fx,gy-2,m.w*.5*(1-.3*hgt),7,0,0,6.3);g.fill();g.globalAlpha=a0}catch(_){}
  let sx=1,sy=1;if(m.bs=='tele'){const k=1-Math.max(0,Math.min(1,m.bt/(m.bt0||.95)));sy=1-.09*k;sx=1+.06*k}else if(m.wind>0){const k=1-m.wind/(m.wind0||.6);sy=1-.11*k;sx=1+.07*k}else if(m.bt>2.2){const k=(m.bt-2.2)/.4;sy=1+.05*Math.max(0,k);sx=1-.03*Math.max(0,k)}
  if(m.stag>0)sy*=.96;
  sy*=.35+.65*e;g.globalAlpha=a0*Math.min(1,e*1.4);
  g.translate(fx,fy);g.scale(sx,sy);g.translate(-fx,-fy);
  (NEWART[b]?artNew(m,now,b):_dm(m,now));g.restore();
  g.save();
  if(m.shield>0){const r=Math.max(m.w,m.h)*.78,cx=fx,cy=m.y+m.h/2-cam.y;g.globalCompositeOperation='lighter';g.globalAlpha=.3+.2*Math.sin(t*5);g.drawImage(ring(c),cx-r,cy-r,r*2,r*2);g.globalAlpha=.9;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(cx,cy,r,0,6.3);g.stroke();g.globalCompositeOperation='source-over';g.globalAlpha=1;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(cx-m.w/2,m.y-cam.y-26,m.w,5);g.fillStyle='#fff';g.fillRect(cx-m.w/2+1,m.y-cam.y-25,(m.w-2)*Math.max(0,m.shield/(m.shieldMax||1)),3)}
  if(m.stag>0){g.fillStyle='#ffd24a';for(let i=0;i<3;i++){const a=t*4+i*2.1,sx2=fx+Math.cos(a)*22,sy2=m.y-cam.y-10+Math.sin(a)*6;g.beginPath();for(let k=0;k<10;k++){const r=k%2?3:7,aa=k*Math.PI/5;g.lineTo(sx2+Math.cos(aa)*r,sy2+Math.sin(aa)*r)}g.closePath();g.fill()}}
  g.restore()}}
 // ---- pre-rendered hazard sprites (no gradients built per frame)
 const SP={};const mkc=(w,h)=>{const s=document.createElement('canvas');s.width=w;s.height=h;return s};
 const vgr=c=>SP['v'+c]||(SP['v'+c]=(()=>{const s=mkc(4,64),x=s.getContext('2d'),gr=x.createLinearGradient(0,0,0,64);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,c);x.fillStyle=gr;x.fillRect(0,0,4,64);return s})());
 const band=()=>SP.band||(SP.band=(()=>{const s=mkc(64,4),x=s.getContext('2d'),gr=x.createLinearGradient(0,0,64,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.85)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,4);return s})());
 const ring=c=>SP['r'+c]||(SP['r'+c]=(()=>{const s=mkc(128,128),x=s.getContext('2d'),gr=x.createRadialGradient(64,64,38,64,64,64);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,c);x.fillStyle=gr;x.beginPath();x.arc(64,64,64,0,6.3);x.fill();return s})());
 // draw hazards + orbs + aim lines (called by the game loop through BOSS6.drawProj)
 {const _dp=BOSS6.drawProj;BOSS6.drawProj=function(gc,cx,cy){try{_dp.call(this,gc,cx,cy)}catch(_){}if(!HZ.length&&!ORB.length&&!MOV.length&&!AL.length&&!(gust&&gust.wait>0))return;const t=performance.now()/1000;gc.save();
  for(const z of HZ){const x=z.x0-cx,y=z.y0-cy,w=z.x1-z.x0,h=z.y1-z.y0;
   if(z.circ){const ccx=z.cx-cx,ccy=z.cy-cy;if(z.tel>0){const k=1-z.tel/z.tel0,fl=.5+.5*Math.sin(t*20);gc.globalAlpha=.08+.06*fl;gc.fillStyle='#ff5a6a';gc.beginPath();gc.arc(ccx,ccy,z.r,0,6.3);gc.fill();gc.globalAlpha=.45+.4*k;gc.strokeStyle='#ff5a6a';gc.lineWidth=2;gc.setLineDash([9,7]);gc.lineDashOffset=-t*30;gc.stroke();gc.setLineDash([]);
     gc.globalAlpha=.55;gc.lineWidth=3;gc.beginPath();gc.arc(ccx,ccy,z.r*k,0,6.3);gc.stroke()}
    else{const a=Math.max(0,Math.min(1,z.act/(z.act0||.35)));gc.globalCompositeOperation='lighter';gc.globalAlpha=.5*a;gc.drawImage(ring(z.c),ccx-z.r,ccy-z.r,z.r*2,z.r*2);gc.globalAlpha=.25*a;gc.fillStyle=z.c;gc.beginPath();gc.arc(ccx,ccy,z.r,0,6.3);gc.fill();gc.globalCompositeOperation='source-over'}continue}
   if(z.tel>0){const k=1-z.tel/z.tel0,fl=.5+.5*Math.sin(t*20),warn=z.kind=='fire'?'#ff9a3a':z.ah?'#ffb03a':'#ff5a6a';gc.globalAlpha=.07+.06*fl;gc.fillStyle=warn;gc.fillRect(x,y,w,h);
    gc.globalAlpha=.35+.35*k;gc.strokeStyle=warn;gc.lineWidth=1.5;gc.setLineDash([7,6]);gc.strokeRect(x+.5,y+.5,w-1,h-1);gc.setLineDash([]);
    gc.globalAlpha=.85;gc.fillStyle=warn;if(z.kind=='beam'){gc.fillRect(x,y+h/2-1.5,w*k,3)}else{gc.fillRect(x,y+h-4,w*k,4)}
    if(k>.55){gc.globalAlpha=(k-.55)*1.5*(.5+.5*fl);gc.fillStyle='#fff';gc.fillRect(x+w/2-1,y+(z.kind=='beam'?0:h*.2),2,z.kind=='beam'?h:h*.8)}}
   else if(z.kind=='fire'){const f=.5+.5*Math.sin(t*14+z.x0);gc.globalCompositeOperation='lighter';gc.globalAlpha=.3+.2*f;gc.drawImage(vgr('#ff7a1e'),x,y,w,h);gc.globalCompositeOperation='source-over'}
   else{const a=Math.max(0,Math.min(1,z.act/(z.act0||.35)));gc.globalCompositeOperation='lighter';
    gc.globalAlpha=.42*a;gc.fillStyle=z.c;gc.fillRect(x,y,w,h);gc.globalAlpha=.8*a;if(z.kind=='beam'){gc.save();gc.translate(x,y+h);gc.rotate(-Math.PI/2);gc.drawImage(band(),0,0,h,w);gc.restore()}else gc.drawImage(band(),x,y,w,h);gc.globalCompositeOperation='source-over'}}
  gc.globalAlpha=1;
  for(const v of MOV){const x=v.x-cx,y=v.gy-cy,hh=v.h;if(v.tel>0){gc.globalAlpha=.5+.4*Math.sin(t*18);gc.fillStyle='#ff5a6a';const ax=x,dir=v.d;gc.beginPath();gc.moveTo(ax+dir*30,y-hh/2);gc.lineTo(ax,y-hh/2-16);gc.lineTo(ax,y-hh/2+16);gc.closePath();gc.fill();gc.globalAlpha=.12;gc.fillRect(Math.min(x,x+dir*T*30),y-hh,Math.abs(T*30),hh);gc.globalAlpha=1;continue}
   gc.globalCompositeOperation='lighter';gc.globalAlpha=.75;gc.drawImage(band(),x-T*.9,y-hh,T*1.8,hh);gc.globalAlpha=.35;gc.fillStyle='#78c8ff';gc.fillRect(x-T*.6,y-hh,T*1.2,hh);gc.globalAlpha=1;gc.strokeStyle='rgba(255,255,255,.8)';gc.lineWidth=3;gc.beginPath();for(let i=0;i<=8;i++){const px=x-T*.9+i*T*.225,py=y-hh+Math.sin(t*10+i)*5;i?gc.lineTo(px,py):gc.moveTo(px,py)}gc.stroke();gc.globalCompositeOperation='source-over'}
  // aim lines: where shards are about to fly
  if(AL.length){gc.lineWidth=2;gc.setLineDash([10,8]);gc.lineDashOffset=-t*60;for(const l of AL){const k=1-l.t/l.t0;gc.globalAlpha=.3+.5*k;gc.strokeStyle=k>.7&&Math.sin(t*30)>0?'#fff':'#ff5a6a';gc.beginPath();gc.moveTo(l.x-cx,l.y-cy);gc.lineTo(l.x-cx+Math.cos(l.a)*l.len*(.4+.6*k),l.y-cy+Math.sin(l.a)*l.len*(.4+.6*k));gc.stroke()}gc.setLineDash([]);gc.globalAlpha=1}
  if(gust&&gust.wait>0){gc.globalAlpha=.35;gc.strokeStyle='#fff';gc.lineWidth=1.5;for(let i=0;i<7;i++){const yy=((t*60+i*97)%260)+20,xx=((t*500*gust.d+i*190)%600+600)%600;gc.beginPath();gc.moveTo(xx,yy);gc.lineTo(xx+gust.d*60,yy);gc.stroke()}gc.globalAlpha=1}
  if(ORB.length){gc.globalCompositeOperation='lighter';gc.globalAlpha=1;for(const o of ORB){const R2=(o.r||12)+6;gc.drawImage(BOSS6.glo(o.c),o.x-cx-R2,o.y-cy-R2,R2*2,R2*2)}}
  gc.restore()}}
 {const _t=BOSS6.tick,_c=BOSS6.clear;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){console.error('BOSSX',e)}};BOSS6.clear=function(){_c.call(this);clearFx()}}
 return{HZ,ORB,MOV,Q,AL,tick,addZ,addC,gyAt,clearFx,LIST,BIG,ATK,arenaHz,get gust(){return gust}}})();
