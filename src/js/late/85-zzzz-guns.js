// ===== GUN9: guns (Pip-Pop Blaster, Sakura Revolver, Bubblebuss, Neko Rapid Blaster, Moonbeam Pistol, Starpiercer Rifle, Fireworks Launcher,
// Prism Arcana Cannon) plus six more weapons (Blazing Knuckles, Sakura Dancer, Tidecaller, Lumina Staff, Raijin Bow, Dragonfang Axe).
// Each has cached held art + icon, its own projectile, muzzle flash, hit effect and synthesized sound. Every weapon has a level requirement
// and a rarity (WPN[id].lv / .rar): sold in the store and the inventory, bosses can drop them. Shots stop at blocks and never break them.
// Projectiles and effects live in fixed pools (no per-shot objects), particles go through the capped VFX pool, art is drawn once to canvases. =====
const GUN9=(()=>{
 const R=Math.random,TAU=Math.PI*2,PI=Math.PI;
 // ---- data: name, kind, damage, cooldown, level, price, rarity, colour, description, move
 const D={
  popgun:['Pip-Pop Blaster','gun',6,.24,1,120,'common',[255,150,200],'A bubble-pink starter blaster that pops out little heart shots. Fast and friendly.','Rapid heart shots'],
  emberfist:['Blazing Knuckles','knuckle',7,.24,5,380,'uncommon',[255,120,60],'Fiery gauntlets. Quick jabs, and every 4th punch is a flaming Dragon Uppercut.','Every 4th punch: Dragon Uppercut'],
  revolver:['Sakura Revolver','gun',15,.4,8,650,'uncommon',[255,180,210],'A six-shooter with a blossom grip. The 6th shot is a Blossom Shot that bursts into petals, then it reloads.','6th shot bursts into petals'],
  sakurakat:['Sakura Dancer','sword',15,.34,11,950,'rare',[255,170,200],'A pink katana. Hits build Bloom; at full Bloom the next swing releases a piercing petal wave.','Bloom stacks unleash a petal wave'],
  shotgun:['Bubblebuss','gun',7,.9,14,1150,'rare',[110,220,210],'A flared bubble blunderbuss. Six pellets in a wide spread with big knockback. Best up close.','Six-pellet spread, knockback'],
  tidecaller:['Tidecaller','spear',18,.5,17,1400,'rare',[90,200,255],'A coral trident. Its thrust sends a rolling wave along the ground that sweeps monsters away.','Thrust + rolling tidal wave'],
  smg:['Neko Rapid Blaster','gun',5,.09,20,1700,'epic',[130,225,255],'A cat-eared rapid blaster. Hold the mouse to spray a stream of paw-print shots.','Hold to spray'],
  moonpistol:['Moonbeam Pistol','gun',14,.42,24,2100,'epic',[255,230,140],'A magic pistol. Homing moon shots split into three seeking star shards when they hit.','Homing moons split into stars'],
  sniper:['Starpiercer Rifle','gun',34,.65,28,2500,'epic',[150,190,255],'Hold to charge, release to fire a beam that pierces every monster in a line. Full charge deals 2.6x.','Hold to charge a piercing beam'],
  lumistaff:['Lumina Staff','staff',10,.5,31,2800,'epic',[255,245,180],'Summons three light wisps that orbit you and shoot nearby monsters. Click again for a volley.','Orbiting wisps that shoot'],
  rocket:['Fireworks Launcher','gun',36,1.05,35,3200,'legendary',[255,120,110],'Fires a firework rocket that explodes in a shower of colours. Splash damage, never breaks blocks.','Splash firework rockets'],
  raijinbow:['Raijin Bow','bow',26,.55,39,3600,'legendary',[200,160,255],'Thunder arrows. Each one calls a lightning strike where it lands that chains to nearby monsters.','Arrows call chain lightning'],
  prismcannon:['Prism Arcana Cannon','gun',24,.6,43,4200,'legendary',[230,200,255],'A floating prism focuses a rainbow bolt that ricochets off walls and arcs to nearby monsters.','Ricochet rainbow bolt + arcs'],
  dragonaxe:['Dragonfang Axe','maul',48,.95,47,5200,'mythic',[255,90,60],'A huge dragon-scale axe. Cleaves in front of you and hurls a spinning fire axe that comes back.','Cleave + returning fire axe']};
 const IDS=Object.keys(D),GUNS=new Set(IDS.filter(id=>D[id][1]=='gun')),AIM=new Set([...GUNS,'raijinbow']);
 for(const id of IDS){const d=D[id];WPN[id]={id,n:d[0],k:d[1],bd:1,md:d[2],cd:d[3],lv:d[4],cost:d[5],rar:d[6],g:d[7],fx:'',d:d[8],move:d[9],gun:GUNS.has(id)?1:0}}
 const lvOk=w=>!w||(w.lv|0)<=(lvl|0);
 let warnT=0;const warnLv=w=>{const n=performance.now();if(n-warnT<1200)return;warnT=n;try{say('Reach level '+w.lv+' to use '+w.n)}catch(_){}try{UIS.play('error')}catch(_){}};
 // ---- store: the new weapons join the catalog as local items (ownership lives in `own`, like the legacy weapons)
 try{for(const id of IDS){const w=WPN[id],cid='wpn_'+id;if(SHOP7.byId.has(cid))continue;const it={id:cid,cat:'weapons',n:w.n,price:w.cost,rar:w.rar,stack:0,ref:id,lv:w.lv,d:w.d,how:'store',legacy:1,new:1,feat:id=='popgun'||id=='sniper'||id=='rocket'?1:0,local:1};SHOP7.items.push(it);SHOP7.byId.set(cid,it)}
  const _b=SHOP7.buy;SHOP7.buy=async function(id,qty){const it=SHOP7.byId.get(id);if(!it||!it.local)return _b.apply(this,arguments);const sf=n=>{try{UIS.play(n)}catch(_){}};
   if(!SHOP7.lvOk(it)){sf('error');return{ok:0,m:'Requires level '+it.lv}}if(own[it.ref]){sf('error');return{ok:0,m:'You already own this'}}if(gems<it.price){sf('error');return{ok:0,m:'Not enough gems ('+it.price+' needed)'}}
   gems-=it.price;SHOP7.grantLocal(it,1);sf(it.rar=='epic'||it.rar=='legendary'||it.rar=='mythic'?'rare':'buy');return{ok:1,qty:1,m:'Purchased '+it.n}}}catch(e){console.error('GUN9 store',e)}
 // ---- helpers
 const live=m=>!m.dead&&m.hp>0,rad=m=>Math.max(m.w,m.h)*.5,cy0=m=>m.y+m.h/2;
 const solid=(x,y)=>solidAt(Math.floor(x/T),Math.floor(y/T));
 const red=()=>typeof QM!='undefined'&&QM&&QM.reduce;
 const vok=()=>VFX.count<((QM.cur&&QM.cur.cap)||3000)*.8;
 const hit=(m,w,k,ang)=>{try{hurtMob(m,Math.max(1,Math.round(dmgM(w)*(k||1))),w,ang)}catch(e){console.error(e)}};
 const segDist=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy||1;let t=((px-ax)*dx+(py-ay)*dy)/l;t=t<0?0:t>1?1:t;const qx=ax+dx*t-px,qy=ay+dy*t-py;return Math.sqrt(qx*qx+qy*qy)};
 const facing=(m,ox,oy,a,arc)=>{let d=Math.abs(Math.atan2(cy0(m)-oy,m.x-ox)-a);if(d>PI)d=TAU-d;return d<arc};
 const gyAt=(x,y0)=>{const tx=Math.max(1,Math.min(W-2,Math.floor(x/T)));let ty=Math.max(0,Math.floor(y0/T));for(let i=0;i<20&&ty<H-1;i++,ty++)if(solidAt(tx,ty))return ty*T;return y0};
 const rayLen=(ox,oy,a,max)=>{const c=Math.cos(a),s=Math.sin(a);for(let d=T*.4;d<=max;d+=T*.3)if(solid(ox+c*d,oy+s*d))return d;return max};
 const shk=v=>{shake=Math.max(shake,red()?0:v*(OPT.sh==null?1:OPT.sh))};
 const O1={a:1},O9={a:.9,g:260,d:1},OF={a:.85,g:-20,d:1.2},OP={a:.9,g:60,d:.8,r:0,vr:3},OS={a:.6,add:0,d:2,g:-30};
 const spark=(x,y,c,n,sp,l,kind)=>{if(!vok())return;if(red())n=Math.ceil(n/3);for(let i=0;i<n;i++){const a=R()*TAU,v=(.3+R())*(sp||140);VFX.add(kind==null?1:kind,c,x,y,Math.cos(a)*v,Math.sin(a)*v,l||.4,9,2,O9)}};
 const petals=(x,y,n,sp)=>{if(!vok())return;if(red())n=Math.ceil(n/3);for(let i=0;i<n;i++){const a=R()*TAU,v=(.3+R())*(sp||120);OP.r=a;VFX.add(4,i%3?'#ffb6d2':'#fff0f6',x,y,Math.cos(a)*v,Math.sin(a)*v-40,.9+R()*.5,10,7,OP)}};
 // ---- sound: WebAudio only (tones through SFX7, short filtered noise bursts for the shots)
 const tone=(a,b,d,ty,v,dl,vib)=>{try{SFX7.tone(a,b,d,ty,v,dl,vib)}catch(_){}};
 let NB=null;
 function nz(d,f0,f1,v,ty,q,dl){try{ac()}catch(_){}if(!AC||AC.state=='closed')return;const vol=OPT.sv==null?1:OPT.sv;if(!(vol>0))return;
  try{if(!NB){NB=AC.createBuffer(1,AC.sampleRate*.6|0,AC.sampleRate);const a=NB.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=R()*2-1}
   const t=AC.currentTime+(dl||0)+.003,s=AC.createBufferSource(),f=AC.createBiquadFilter(),gn=AC.createGain();s.buffer=NB;f.type=ty||'lowpass';f.Q.value=q||.8;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+d);
   gn.gain.setValueAtTime(v*vol,t);gn.gain.exponentialRampToValueAtTime(.0005,t+d);s.connect(f);f.connect(gn);gn.connect(AC.destination);s.start(t,R()*.05);s.stop(t+d+.03)}catch(_){}}
 const SFXT={
  popgun(){tone(1500,620,.08,'square',.022);tone(2400,1800,.05,'sine',.02);nz(.04,6000,2500,.035,'highpass')},
  revolver(){nz(.12,3200,600,.12);tone(240,90,.12,'triangle',.06);tone(1800,900,.05,'square',.012)},
  revolverBig(){nz(.2,2600,300,.15);tone(180,60,.22,'sawtooth',.05);for(let i=0;i<3;i++)tone(1300+i*400,1900+i*400,.12,'sine',.02,.06+i*.05)},
  reload(){tone(900,850,.03,'square',.02,.28);tone(1100,1050,.03,'square',.02,.42);tone(700,600,.05,'square',.025,.66)},
  shotgun(){nz(.28,2400,200,.2);tone(110,45,.3,'sawtooth',.06);tone(80,40,.25,'sine',.08);tone(600,560,.04,'square',.02,.34);tone(520,480,.05,'square',.02,.46)},
  smg(){nz(.05,5000,1400,.05,'bandpass',1.2);tone(820,420,.045,'square',.013)},
  moon(){tone(1200,1800,.18,'sine',.035);tone(2400,3000,.14,'sine',.015,.03);nz(.1,8000,3000,.02,'highpass')},
  charge(){tone(300,900,1.1,'sine',.022,0,1)},
  full(){tone(1800,1800,.12,'sine',.03);tone(2700,2700,.18,'sine',.02,.06)},
  sniper(ch){nz(.35,4000,180,.17+.08*(ch||0));tone(2600,300,.18,'sawtooth',.03);tone(120,40,.4,'sine',.09)},
  rocket(){nz(.5,400,3000,.08,'bandpass',.7);tone(260,620,.35,'triangle',.04)},
  boom(){nz(.6,1800,90,.22);tone(90,35,.5,'sine',.1);for(let i=0;i<6;i++)tone(2000+R()*1600,1400,.05,'square',.011,.12+i*.06+R()*.04)},
  prism(){tone(1046,1060,.16,'sine',.025);tone(1318,1330,.16,'sine',.025,.035);tone(1568,1580,.18,'sine',.025,.07);nz(.15,6000,2000,.03,'highpass')},
  arc(){tone(2200,800,.08,'square',.011)},
  bounce(){tone(1400,1900,.05,'sine',.02)},
  bow(){tone(320,170,.12,'triangle',.06);tone(1300,1100,.03,'square',.02)},
  thunder(){nz(.5,1400,80,.17);tone(1600,200,.12,'sawtooth',.025);tone(70,40,.45,'sine',.08)},
  punch(){tone(170,80,.09,'triangle',.07);nz(.06,1500,300,.06)},
  uppercut(){nz(.4,600,2400,.08,'bandpass',.8);tone(140,420,.25,'sawtooth',.04);tone(90,50,.3,'sine',.07)},
  slash(){tone(2400,1500,.1,'sine',.03);nz(.08,7000,3000,.03,'highpass')},
  hanami(){tone(880,890,.22,'sine',.025);tone(1109,1120,.22,'sine',.025,.05);tone(1319,1330,.22,'sine',.025,.1);tone(1760,1770,.26,'sine',.022,.15);nz(.3,5000,1200,.04,'bandpass',.6)},
  tide(){nz(.45,2600,300,.08,'bandpass',.6);try{SFX7.bloop(1)}catch(_){}tone(500,300,.2,'sine',.03)},
  summon(){tone(660,990,.25,'sine',.025);tone(880,1320,.25,'sine',.025,.06);tone(1320,1980,.3,'sine',.02,.12)},
  wisp(){tone(1800+R()*400,2600,.06,'sine',.011)},
  cleave(){nz(.25,900,150,.12);tone(600,500,.35,'triangle',.03,0,1);tone(100,50,.25,'sawtooth',.05)},
  throwAxe(){nz(.3,800,2400,.05,'bandpass',.7);tone(220,330,.25,'sawtooth',.02)},
  denied(){tone(300,200,.12,'triangle',.03)}};
 const SL={};function S(n,a){const now=performance.now();if(now-(SL[n]||0)<35)return;SL[n]=now;try{SFXT[n](a)}catch(_){}}
 // ---- pools: projectiles + short effects (fixed objects, reused)
 const NP=160,NF=64,POOL=[],FXP=[];
 for(let i=0;i<NP;i++)POOL.push({on:0,k:'',x:0,y:0,vx:0,vy:0,l:0,t:0,w:null,dm:1,r:4,prc:0,bnc:0,home:0,gr:0,acc:0,spl:0,kb:0,bolt:0,rot:0,a:0,u:0,D:0,TT:0,half:0,d:1,gy:0,hits:new Array(10),nh:0});
 for(let i=0;i<NF;i++)FXP.push({on:0,k:'',x:0,y:0,x2:0,y2:0,a:0,t:0,t0:1,r:0,c:'',s:1,seed:0,sp:null,px:new Float32Array(5),py:new Float32Array(5),np:0});
 let pi=0,fi=0,nAlive=0;
 function shoot(k,x,y,a,sp,l,w,dm,r){for(let n=0;n<NP;n++){pi=(pi+1)%NP;const p=POOL[pi];if(p.on)continue;p.on=1;p.k=k;p.x=x;p.y=y;p.vx=Math.cos(a)*sp;p.vy=Math.sin(a)*sp;p.l=l;p.t=0;p.w=w;p.dm=dm;p.r=r;
   p.prc=0;p.bnc=0;p.home=0;p.gr=0;p.acc=0;p.spl=0;p.kb=0;p.bolt=0;p.rot=a;p.a=a;p.u=0;p.nh=0;p.half=0;nAlive++;return p}return null}
 function fx(k,x,y,a,t,r,c){for(let n=0;n<NF;n++){fi=(fi+1)%NF;const f=FXP[fi];if(f.on&&n<NF-1)continue;f.on=1;f.k=k;f.x=x;f.y=y;f.a=a;f.t=f.t0=t;f.r=r;f.c=c||'#fff';f.s=1;f.np=0;f.seed=R()*99;return f}return FXP[0]}
 const hasHit=(p,m)=>{for(let i=0;i<p.nh;i++)if(p.hits[i]===m)return true;return false};
 const addHit=(p,m)=>{if(p.nh<p.hits.length)p.hits[p.nh++]=m};
 const nearest=(x,y,maxD,p)=>{let best=null,bd=maxD*maxD;for(let i=0;i<mobs.length;i++){const m=mobs[i];if(!live(m)||(p&&hasHit(p,m)))continue;const dx=m.x-x,dy=cy0(m)-y,d=dx*dx+dy*dy;if(d<bd){bd=d;best=m}}return best};
 // ---- state
 const SH={kick:0,last:0,rv:0,ef:0,bl:0,blT:0,sn:0,ch:0,full:0,snW:null,axe:0};
 const WS={t:0,ang:0,w:null,cd:[0,.2,.4]};
 let HX=0,HY=0,MX=0,MY=0;
 const handAt=()=>{HX=P.x+8*P.f;HY=P.y+33};
 const muzzle=(a,len)=>{MX=HX+Math.cos(a)*len;MY=HY+Math.sin(a)*len};
 const kickB=v=>{SH.kick=Math.min(2,SH.kick+v)};
 const flash=(a,c,s)=>{const f=fx('flash',MX,MY,a,.07,0,c);f.s=s||1;f.sp=spr('flash:'+c);if(vok())VFX.add(0,c,MX,MY,Math.cos(a)*40,Math.sin(a)*40,.12,18*(s||1),4,O1)};
 const MUZ={popgun:27,revolver:31,shotgun:34,smg:28,moonpistol:31,sniper:44,rocket:31,prismcannon:34,raijinbow:12};
 // ---- moves
 const BEH={
  popgun(w,a){muzzle(a,MUZ.popgun);shoot('heart',MX,MY,a+(R()-.5)*.05,980,.9,w,1,6);flash(a,'#ff9ac8',.8);kickB(.5);S('popgun')},
  revolver(w,a){SH.rv=(SH.rv+1)%6;const big=SH.rv==0;muzzle(a,MUZ.revolver);const p=shoot(big?'bloss':'tracer',MX,MY,a,big?1100:1500,1,w,big?2.4:1,big?8:4);if(p&&big)p.spl=T*1.4;
   flash(a,big?'#ffb0d0':'#fff0c0',big?1.5:1);kickB(big?1.5:.9);S(big?'revolverBig':'revolver');if(big){wcd*=2.4;try{ft(P.x,P.y-30,'Reload!','#ffd0e4')}catch(_){}S('reload')}},
  shotgun(w,a){muzzle(a,MUZ.shotgun);for(let i=0;i<6;i++){const p=shoot('pellet',MX,MY,a+(i-2.5)*.085+(R()-.5)*.06,900+R()*260,.36+R()*.06,w,1,4.5);if(p)p.kb=1}
   flash(a,'#c8fff6',1.7);kickB(1.7);if(P.g)P.vx-=Math.cos(a)*160;shk(.06);S('shotgun')},
  smg(w,a){muzzle(a,MUZ.smg);shoot('paw',MX,MY,a+(R()-.5)*.14,1250,.8,w,1,4);flash(a,'#9ae6ff',.6);kickB(.35);S('smg')},
  moonpistol(w,a){muzzle(a,MUZ.moonpistol);const p=shoot('moon',MX,MY,a,720,1.7,w,1,8);if(p)p.home=4.5;flash(a,'#fff3b0',1);kickB(.7);S('moon')},
  sniper(w,a){if(SH.sn)return;SH.sn=1;SH.ch=0;SH.full=0;SH.snW=w;wcd=.05;S('charge')},
  rocket(w,a){muzzle(a,MUZ.rocket);const p=shoot('rkt',MX,MY,a,480,2.2,w,1,8);if(p){p.spl=T*2.4;p.acc=1}flash(a,'#ffb08a',1.6);kickB(1.8);shk(.05);S('rocket')},
  prismcannon(w,a){muzzle(a,MUZ.prismcannon);const p=shoot('prism',MX,MY,a,860,2,w,1,8);if(p){p.bnc=3;p.prc=2}flash(a,'#e8c8ff',1.3);kickB(1.1);S('prism')},
  raijinbow(w,a){muzzle(a,MUZ.raijinbow);const p=shoot('arrow',MX,MY,a,1250,2,w,1,6);if(p){p.gr=300;p.bolt=1}kickB(.6);S('bow')},
  lumistaff(w,a){if(WS.t>0)volley(w,a);else{S('summon');spark(P.x,P.y+20,'#fff6b0',14,160)}WS.t=6;WS.w=w},
  emberfist(w,a){SH.ef=(SH.ef+1)%4;const ox=P.x,oy=P.y+23;
   if(SH.ef==0){const px=ox+P.f*T*.9;fx('pillar',px,gyAt(px,P.y+P.h-6),0,.55,T*.8,'#ff8a3a');
    for(let i=0;i<mobs.length;i++){const m=mobs[i];if(live(m)&&Math.abs(m.x-px)<T*1.1+m.w/2&&cy0(m)>oy-T*2.6&&cy0(m)<oy+T*1.2){hit(m,w,2.2,-PI/2);if(!m.boss)m.vy=-640;m.burn=Math.max(m.burn||0,2.5);spark(m.x,cy0(m),'#ffb040',10,220)}}
    P.vy=Math.min(P.vy,-240);shk(.1);S('uppercut');try{ft(px,oy-T,'Dragon Uppercut!','#ffb070')}catch(_){}}
   else{for(let i=0;i<mobs.length;i++){const m=mobs[i];if(live(m)&&Math.hypot(m.x-ox,cy0(m)-oy)<T*1.7+rad(m)*.5&&facing(m,ox,oy,a,1.1)){hit(m,w,1,a);m.burn=Math.max(m.burn||0,1)}}
    fx('pow',ox+Math.cos(a)*T,oy+Math.sin(a)*T,a,.2,14,'#ffb070');S('punch')}},
  sakurakat(w,a){const ox=P.x,oy=P.y+23;
   if(SH.bl>=5){SH.bl=0;const p=shoot('petalw',ox,oy,a,760,.75,w,1.8,26);if(p)p.prc=99;petals(ox+Math.cos(a)*T,oy+Math.sin(a)*T,16,200);S('hanami');shk(.06)}
   let any=0;for(let i=0;i<mobs.length;i++){const m=mobs[i];if(live(m)&&Math.hypot(m.x-ox,cy0(m)-oy)<T*2.1+rad(m)*.5&&facing(m,ox,oy,a,1.2)){hit(m,w,1,a);any=1;petals(m.x,cy0(m),5,140)}}
   if(any){SH.bl=Math.min(5,SH.bl+1);SH.blT=2.6}fx('slash',ox,oy,a,.2,T*1.9,'#ffb0cf');S('slash')},
  tidecaller(w,a){const ox=P.x,oy=P.y+23,L=Math.min(T*3.3,rayLen(ox,oy,a,T*3.3));fx('thrust',ox,oy,a,.22,L,'#bff4ff');
   for(let i=0;i<mobs.length;i++){const m=mobs[i];if(live(m)&&segDist(m.x,cy0(m),ox,oy,ox+Math.cos(a)*L,oy+Math.sin(a)*L)<rad(m)+8){hit(m,w,1,a);spark(m.x,cy0(m),'#bff4ff',6,150)}}
   const d=Math.cos(a)>=0?1:-1,x0=P.x+d*T*.8,p=shoot('wave',x0,P.y+P.h,0,0,1.1,w,.8,T*.7);if(p){p.d=d;p.gy=gyAt(x0,P.y+P.h-6);p.prc=99}S('tide')},
  dragonaxe(w,a){const ox=P.x,oy=P.y+23;for(let i=0;i<mobs.length;i++){const m=mobs[i];if(live(m)&&Math.hypot(m.x-ox,cy0(m)-oy)<T*2.4+rad(m)*.5&&facing(m,ox,oy,a,1.4)){hit(m,w,1.2,a);m.burn=Math.max(m.burn||0,2);spark(m.x,cy0(m),'#ff8a3a',8,200)}}
   fx('slash',ox,oy,a,.26,T*2.3,'#ff8a3a');shk(.1);S('cleave');
   if(!SH.axe){const p=shoot('axe',ox,oy,a,0,1.15,w,.7,16);if(p){p.D=T*6.2;p.TT=1.15;p.d=P.f||1;SH.axe=1;S('throwAxe')}}}};
 function volley(w,a){for(let i=0;i<3;i++){const an=WS.ang+i*TAU/3,x=P.x+Math.cos(an)*T*1.1,y=P.y+20+Math.sin(an)*T*.5,m=nearest(x,y,T*8),q=m?Math.atan2(cy0(m)-y,m.x-x):a,p=shoot('wbolt',x,y,q,640,1.2,w,.55,6);if(p)p.home=7;WS.cd[i]=.5}S('wisp')}
 function fireSniper(){const w=SH.snW||WPN.sniper,ch=SH.ch;SH.sn=0;handAt();const a=Math.atan2(my+cam.y-HY,mx+cam.x-HX);P.f=Math.cos(a)>=0?1:-1;handAt();muzzle(a,MUZ.sniper);
  const L=rayLen(MX,MY,a,T*18),ex=MX+Math.cos(a)*L,ey=MY+Math.sin(a)*L,k=1+1.6*ch;
  for(let i=0;i<mobs.length;i++){const m=mobs[i];if(live(m)&&segDist(m.x,cy0(m),MX,MY,ex,ey)<rad(m)+6+ch*6){hit(m,w,k,a);spark(m.x,cy0(m),'#d8e8ff',8+ch*8,220)}}
  const f=fx('beam',MX,MY,a,.3,2+6*ch,'#9fc8ff');f.x2=ex;f.y2=ey;spark(ex,ey,'#cfe0ff',6,160);flash(a,'#cfe0ff',1+ch);kickB(1.2+ch);shk(.04+ch*.08);S('sniper',ch);
  SH.last=performance.now();wcd=w.cd*(over>0?.5:1)/(1+bonus().atk)}
 function boom(x,y,r,w,k,cols){for(let i=0;i<mobs.length;i++){const m=mobs[i];if(!live(m))continue;const d=Math.hypot(m.x-x,cy0(m)-y);if(d<r+rad(m))hit(m,w,k*(1-.45*Math.min(1,d/r)),Math.atan2(cy0(m)-y,m.x-x))}
  fx('boom',x,y,0,.45,r,cols[0]).sp=gsp(cols[0]);if(vok()){const n=red()?8:24;for(let i=0;i<n;i++){const a=R()*TAU,v=(.4+R())*r*2.2;VFX.add(1,cols[i%cols.length],x,y,Math.cos(a)*v,Math.sin(a)*v,.7+R()*.4,12,2,O9)}VFX.wave(x,y,cols[1]||cols[0],r*1.2,.45,.6)}}
 function strike(x,y,w){const gy=y;fx('bolt',x,gy,0,.35,0,'#e0c8ff');
  let first=null;for(let i=0;i<mobs.length;i++){const m=mobs[i];if(live(m)&&Math.hypot(m.x-x,cy0(m)-gy)<T*1.5+rad(m)){hit(m,w,.9,-PI/2);m.stun=Math.max(m.stun||0,.8);if(!first)first=m}}
  if(first){const z=fx('zap',0,0,0,.3,0,'#f0e0ff');z.px[0]=first.x;z.py[0]=cy0(first);z.np=1;let cur=first;const done=[first];
   for(let j=0;j<2;j++){let nx=null,nd=T*4.5;for(let i=0;i<mobs.length;i++){const m=mobs[i];if(!live(m)||done.indexOf(m)>=0)continue;const d=Math.hypot(m.x-cur.x,cy0(m)-cy0(cur));if(d<nd){nd=d;nx=m}}if(!nx)break;done.push(nx);hit(nx,w,.5);nx.stun=Math.max(nx.stun||0,.5);z.px[z.np]=nx.x;z.py[z.np]=cy0(nx);z.np++;cur=nx}}
  spark(x,gy,'#f0e0ff',12,220);VFX.wave(x,gy,'#c8a8ff',T*1.6,.35,.3);shk(.08);S('thunder')}
 function arcs(p,m0){const z=fx('zap',0,0,0,.25,0,'#fff');z.px[0]=m0.x;z.py[0]=cy0(m0);z.np=1;let n=0;
  for(let i=0;i<mobs.length&&n<2;i++){const m=mobs[i];if(!live(m)||m===m0)continue;if(Math.hypot(m.x-m0.x,cy0(m)-cy0(m0))<T*4){hit(m,p.w,.5);z.px[z.np]=m.x;z.py[z.np]=cy0(m);z.np++;n++;z.px[z.np]=m0.x;z.py[z.np]=cy0(m0);if(z.np<4)z.np++}}if(n)S('arc')}
 // ---- impact: what each projectile does when it hits a monster
 const RB=['#ff9ad0','#ffe89a','#9affd8','#9ac8ff'];
 const HITC={heart:'#ff9ac8',tracer:'#fff0c0',bloss:'#ffc0d8',pellet:'#c8fff6',paw:'#9ae6ff',moon:'#fff3b0',shard:'#fff6c8',rkt:'#ffb08a',prism:'#e8c8ff',arrow:'#e0c8ff',petalw:'#ffb6d2',wbolt:'#fff6b0',axe:'#ff9a4a',wave:'#bff4ff'};
 function onHit(p,m){const ang=Math.atan2(p.vy,p.vx)||p.a;hit(m,p.w,p.dm,ang);if(p.kb&&!m.boss){m.vx+=Math.cos(ang)*240;m.vy=Math.min(m.vy,-170)}spark(p.x,p.y,HITC[p.k]||'#fff',p.k=='paw'?3:6,150);
  if(p.k=='moon'){for(let i=0;i<3;i++){const q=ang+PI+(i-1)*1.1+(R()-.5)*.3,s=shoot('shard',m.x,cy0(m),q,520,.9,p.w,.4,5);if(s){s.home=7;addHit(s,m)}}}
  else if(p.k=='prism')arcs(p,m);
  else if(p.k=='heart'||p.k=='bloss'||p.k=='petalw')petals(p.x,p.y,p.k=='heart'?2:4,120);
  else if(p.k=='axe'||p.k=='wave'){if(p.k=='axe')m.burn=Math.max(m.burn||0,2);else if(!m.boss){m.vx+=p.d*520;m.vy=-280}}}
 function burst(p){if(p.k=='rkt'){boom(p.x,p.y,p.spl,p.w,1,['#ff7ab8','#ffe07a','#7ad8ff','#b8ff8a']);shk(.12);S('boom')}
  else if(p.k=='bloss'){boom(p.x,p.y,p.spl,p.w,.8,['#ffb6d2','#fff0f6']);petals(p.x,p.y,14,220)}
  if(p.bolt)strike(p.x,p.y,p.w)}
 const kill=p=>{p.on=0;nAlive--;if(p.k=='axe')SH.axe=0};
 // ---- per-frame update
 function tick(dt){if(!entered)return;SH.kick=Math.max(0,SH.kick-dt*8);
  const now=performance.now(),cur=WPN[wp];
  if(cur&&AIM.has(wp)&&now-SH.last<3000&&swing<-.5)swing=-.5; // keep the gun drawn while you are shooting
  if(SH.blT>0){SH.blT-=dt;if(SH.blT<=0)SH.bl=0}
  // sniper charge: hold to charge, release to fire
  if(SH.sn){if(wp!='sniper'){SH.sn=0}else if(mdL&&!showInv){SH.ch=Math.min(1,SH.ch+dt/1.1);wcd=Math.max(wcd,.05);if(SH.ch>=1&&!SH.full){SH.full=1;S('full')}
    handAt();const a=Math.atan2(my+cam.y-HY,mx+cam.x-HX);muzzle(a,MUZ.sniper);if(vok()&&R()<.5+SH.ch*.4){const an=R()*TAU,rr=18+R()*14;VFX.add(1,SH.full?'#ffffff':'#9fc8ff',MX+Math.cos(an)*rr,MY+Math.sin(an)*rr,-Math.cos(an)*rr*3,-Math.sin(an)*rr*3,.3,8,2,O1)}SH.last=now}
   else fireSniper()}
  // lumina wisps
  if(WS.t>0){if(wp!='lumistaff')WS.t=0;else{WS.t-=dt;WS.ang+=dt*2.4;for(let i=0;i<3;i++){WS.cd[i]-=dt;const an=WS.ang+i*TAU/3,x=P.x+Math.cos(an)*T*1.1,y=P.y+20+Math.sin(an)*T*.5;
     if(vok()&&R()<.25)VFX.add(0,'#fff6b0',x,y,0,-10,.35,12,3,OF);
     if(WS.cd[i]<=0){const m=nearest(x,y,T*7);WS.cd[i]=m?.6:.2;if(m){const p=shoot('wbolt',x,y,Math.atan2(cy0(m)-y,m.x-x),600,1.2,WS.w||WPN.lumistaff,.55,6);if(p)p.home=7;S('wisp')}}}}}
  // effects (beams, bolts, flashes) fade even when no projectile is flying (the sniper beam is an effect, not a projectile)
  for(let i=0;i<NF;i++){const f=FXP[i];if(f.on){f.t-=dt;if(f.t<=0)f.on=0}}
  if(!nAlive)return;
  for(let i=0;i<NP;i++){const p=POOL[i];if(!p.on)continue;p.l-=dt;p.t+=dt;
   if(p.k=='axe'){p.u+=dt/p.TT;if(p.u>=1){kill(p);continue}if(p.u>.5&&!p.half){p.half=1;p.nh=0}const s=p.u,al=p.D*(1-Math.cos(TAU*s))/2,pe=T*.9*p.d*Math.sin(TAU*s),ca=Math.cos(p.a),sa=Math.sin(p.a),ox=P.x,oy=P.y+23;
    const nx=ox+ca*al-sa*pe,ny=oy+sa*al+ca*pe;p.vx=(nx-p.x)/Math.max(dt,.001);p.vy=(ny-p.y)/Math.max(dt,.001);p.x=nx;p.y=ny;p.rot+=dt*22;
    if(s<.5&&solid(p.x,p.y)){p.u=1-s;p.half=1;p.nh=0;spark(p.x,p.y,'#ffb070',6,140)}if(vok()&&R()<.6)VFX.add(0,R()<.5?'#ff9a3a':'#ffd070',p.x,p.y,0,-20,.35,14,3,OF)}
   else if(p.k=='wave'){p.x+=p.d*460*dt;const gy=gyAt(p.x,p.gy-T*2);if(Math.abs(gy-p.gy)>T*1.6||p.x<T||p.x>(W-1)*T){kill(p);continue}p.gy=gy;p.y=gy-T*.5;
    if(vok()&&R()<.7)VFX.add(0,R()<.5?'#bff4ff':'#5ac8e8',p.x-p.d*T*.3,gy-R()*T,(R()-.5)*60,-60-R()*60,.5,10,3,O9)}
   else{if(p.home){let tg=null,bd=T*8*T*8;for(let j=0;j<mobs.length;j++){const m=mobs[j];if(!live(m)||hasHit(p,m))continue;const dx=m.x-p.x,dy=cy0(m)-p.y,d=dx*dx+dy*dy;if(d<bd){bd=d;tg=m}}
     if(tg){const sp=Math.hypot(p.vx,p.vy);let a0=Math.atan2(p.vy,p.vx),da=Math.atan2(cy0(tg)-p.y,tg.x-p.x)-a0;while(da>PI)da-=TAU;while(da<-PI)da+=TAU;a0+=Math.max(-p.home*dt,Math.min(p.home*dt,da));p.vx=Math.cos(a0)*sp;p.vy=Math.sin(a0)*sp}}
    if(p.gr)p.vy+=p.gr*dt;if(p.acc){const sp=Math.hypot(p.vx,p.vy),k2=Math.min(980,sp+dt*900)/(sp||1);p.vx*=k2;p.vy*=k2}
    const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;
    if(solid(nx,ny)){if(p.bnc>0){const hx=solid(nx,p.y),hy=solid(p.x,ny);if(hx||!hy)p.vx=-p.vx;if(hy||!hx)p.vy=-p.vy;p.bnc--;p.nh=0;spark(p.x,p.y,'#f0d8ff',5,120);S('bounce')}
     else{spark(p.x,p.y,HITC[p.k]||'#fff',4,110);burst(p);kill(p);continue}}else{p.x=nx;p.y=ny}
    p.rot=Math.atan2(p.vy,p.vx);
    if(vok()){if(p.k=='rkt'&&R()<.9){VFX.add(5,'#d8d0e0',p.x-p.vx*.02,p.y-p.vy*.02,(R()-.5)*30,(R()-.5)*30,.6,8,22,OS);if(R()<.6)VFX.add(1,R()<.5?'#ffe07a':'#ff9a6a',p.x,p.y,(R()-.5)*80,(R()-.5)*80,.25,8,2,O1)}
     else if((p.k=='moon'||p.k=='prism'||p.k=='petalw')&&R()<.5)VFX.add(1,p.k=='prism'?RB[(p.t*20|0)&3]:HITC[p.k],p.x,p.y,(R()-.5)*30,(R()-.5)*30,.35,8,2,O1)
     else if(p.k=='arrow'&&R()<.4)VFX.add(1,'#e0c8ff',p.x,p.y,(R()-.5)*40,(R()-.5)*40,.2,7,2,O1)}}
   // monsters
   for(let j=0;j<mobs.length;j++){const m=mobs[j];if(!live(m)||hasHit(p,m))continue;const dx=m.x-p.x,dy=(p.k=='wave'?m.y+m.h-p.gy:cy0(m)-p.y),rr=rad(m)+p.r;
    if(p.k=='wave'?(Math.abs(dx)<T*.8+m.w/2&&Math.abs(dy)<T*1.3):dx*dx+dy*dy<rr*rr){addHit(p,m);onHit(p,m);if(p.prc>0||p.k=='axe'){if(p.k!='axe')p.prc--}else{burst(p);kill(p);break}}}
   if(p.on&&p.l<=0){if(p.spl||p.bolt)burst(p);kill(p)}}}
 // ---- sprites (drawn once, then blitted)
 const SPR={};
 const OL='#2a1830';
 const rr=(x,a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
 const fs=(x,f)=>{x.fillStyle=f;x.fill();x.stroke()};
 const poly=(x,p)=>{x.beginPath();x.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)x.lineTo(p[i],p[i+1]);x.closePath()};
 const hl=(x,a,b,c,d)=>{x.save();x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=1.2;x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();x.restore()};
 const heart=(x,cx,cy,s,f)=>{x.beginPath();x.moveTo(cx,cy+s*.9);x.bezierCurveTo(cx-s*1.5,cy-s*.1,cx-s*.65,cy-s*1.25,cx,cy-s*.35);x.bezierCurveTo(cx+s*.65,cy-s*1.25,cx+s*1.5,cy-s*.1,cx,cy+s*.9);x.closePath();x.fillStyle=f;x.fill()};
 const star=(x,cx,cy,r1,r2,n,f)=>{x.beginPath();for(let i=0;i<n*2;i++){const r=i%2?r2:r1,a=i*PI/n-PI/2;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}x.closePath();if(f){x.fillStyle=f;x.fill()}};
 const flower=(x,cx,cy,r,f,c)=>{x.fillStyle=f;for(let i=0;i<5;i++){const a=i*TAU/5-PI/2;x.beginPath();x.ellipse(cx+Math.cos(a)*r*.6,cy+Math.sin(a)*r*.6,r*.55,r*.38,a,0,TAU);x.fill()}x.fillStyle=c;x.beginPath();x.arc(cx,cy,r*.3,0,TAU);x.fill()};
 const lg=(x,x0,y0,x1,y1,st)=>{const g2=x.createLinearGradient(x0,y0,x1,y1);for(let i=0;i<st.length;i++)g2.addColorStop(i/(st.length-1),st[i]);return g2};
 function spr(k){let c=SPR[k];if(c)return c;const big=k=='rkt'||k=='axe'||k=='petalw'||k=='arrow'||k.startsWith('flash:');const S2=big?64:32;c=document.createElement('canvas');c.width=c.height=S2;const x=c.getContext('2d');x.translate(S2/2,S2/2);x.lineJoin='round';x.lineCap='round';x.strokeStyle=OL;x.lineWidth=1.5;
  if(k.startsWith('glow:')){const gr=x.createRadialGradient(0,0,0,0,0,S2/2);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,k.slice(5));gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(-S2/2,-S2/2,S2,S2)}
  else if(k.startsWith('flash:')){const col=k.slice(6),gr=x.createRadialGradient(0,0,0,0,0,30);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,col);gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;
   x.beginPath();x.moveTo(30,0);x.lineTo(6,-7);x.lineTo(2,-20);x.lineTo(-4,-6);x.lineTo(-12,0);x.lineTo(-4,6);x.lineTo(2,20);x.lineTo(6,7);x.closePath();x.fill();x.fillStyle='#fff';x.beginPath();x.ellipse(4,0,9,4,0,0,TAU);x.fill()}
  else if(k=='heart'){heart(x,0,1,7,'#ff7ab8');x.strokeStyle='#fff';x.lineWidth=2;x.stroke();x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(-3,-2,1.6,0,TAU);x.fill()}
  else if(k=='bloss'){flower(x,0,0,12,'#ffc0d8','#ffd24a');x.strokeStyle='#fff';x.lineWidth=1;x.beginPath();x.arc(0,0,11,0,TAU);x.stroke()}
  else if(k=='pellet'){x.beginPath();x.arc(0,0,5.5,0,TAU);fs(x,'#c8fff6');x.fillStyle='#fff';x.beginPath();x.arc(-2,-2,1.8,0,TAU);x.fill()}
  else if(k=='paw'){x.strokeStyle='#fff';x.beginPath();x.arc(0,1.5,4.2,0,TAU);fs(x,'#7ad8ff');for(const a of[-1.9,-1.2,-.5,.2]){x.beginPath();x.arc(Math.cos(a-.6)*6.5,Math.sin(a-.6)*6.5+1,1.9,0,TAU);fs(x,'#7ad8ff')}}
  else if(k=='moon'){x.beginPath();x.arc(0,0,9,0,TAU);x.moveTo(11.5,-2);x.arc(4,-2,7.5,0,TAU,true);x.fillStyle='#fff3b0';x.fill('evenodd');x.strokeStyle='#fff';x.stroke()}
  else if(k=='shard'){star(x,0,0,9,3,4,'#fffbe0');x.strokeStyle='#ffd86a';x.stroke()}
  else if(k=='rkt'){poly(x,[-16,-5,-22,-10,-12,-5]);fs(x,'#7ad8ff');poly(x,[-16,5,-22,10,-12,5]);fs(x,'#7ad8ff');rr(x,-16,-6,24,12,5);fs(x,lg(x,0,-6,0,6,['#ff9a8a','#e04a5a']));x.fillStyle='#ffd24a';x.fillRect(-6,-5.5,3,11);poly(x,[8,-6,20,0,8,6]);fs(x,'#ffe07a');star(x,-11,0,2.6,1,5,'#fff')}
  else if(k=='prism'){poly(x,[0,-11,8,0,0,11,-8,0]);fs(x,lg(x,-8,-11,8,11,['#ff9ad0','#ffe89a','#9affd8','#9ac8ff','#d8a0ff']));x.strokeStyle='#fff';x.lineWidth=1;x.beginPath();x.moveTo(0,-11);x.lineTo(-2,4);x.stroke()}
  else if(k=='arrow'){x.strokeStyle='#4a2a8a';x.lineWidth=3.4;x.beginPath();x.moveTo(-24,0);x.lineTo(12,0);x.stroke();x.strokeStyle='#e8d8ff';x.lineWidth=1.4;x.stroke();x.strokeStyle=OL;x.lineWidth=1.5;poly(x,[22,0,10,-6,13,0,10,6]);fs(x,'#ffd24a');poly(x,[-24,0,-30,-6,-19,0,-30,6]);fs(x,'#b88aff')}
  else if(k=='petalw'){x.beginPath();x.arc(-6,0,24,-1.15,1.15);x.arc(-16,0,20,1.05,-1.05,true);x.closePath();x.fillStyle='rgba(255,182,210,.9)';x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();for(let i=0;i<4;i++)flower(x,6+Math.cos(-.8+i*.55)*8-6,Math.sin(-.8+i*.55)*20,4,'#fff0f6','#ffd24a')}
  else if(k=='axe'){rr(x,-3,-3,6,6,2);fs(x,'#7a3020');for(const s of[-1,1]){x.beginPath();x.moveTo(0,s*3);x.quadraticCurveTo(s*4,s*16,s*20,s*14);x.quadraticCurveTo(s*14,s*4,s*3,0);x.closePath();fs(x,lg(x,0,0,s*20,s*14,['#ffd27a','#ff5a2a']))}}
  return SPR[k]=c}
 const GSP={};const gsp=c=>GSP[c]||(GSP[c]=spr('glow:'+c)); // glow sprite by colour, no string building per frame
 // ---- held models: origin at the hand / grip, pointing +x, designed at L=40 (scaled for other sizes). Bounds [x0,y0,x1,y1] in design units.
 const B={popgun:[-8,-18,31,11],revolver:[-11,-15,36,13],shotgun:[-16,-17,39,9],smg:[-8,-17,32,11],moonpistol:[-9,-18,37,11],sniper:[-19,-18,53,9],rocket:[-14,-18,34,10],prismcannon:[-12,-21,38,10],
  emberfist:[-7,-12,18,9],sakurakat:[-15,-8,48,8],tidecaller:[-23,-9,51,9],lumistaff:[-21,-10,46,10],raijinbow:[-1,-25,21,25],dragonaxe:[-17,-21,43,19]};
 const MODEL={
  popgun(x){poly(x,[-4,-2,4,-2,2,10,-6,10]);fs(x,'#d76aa6');x.beginPath();x.arc(4,0,4.5,0,PI);x.stroke();
   rr(x,-7,-11,27,11,5);fs(x,lg(x,0,-11,0,0,['#ffd6ea','#ff8cc4']));rr(x,19,-9,9,7,2.5);fs(x,'#fff4fa');rr(x,26,-10,4,9,2);fs(x,'#7ad8ff');
   x.beginPath();x.arc(5,-13,4.2,0,TAU);fs(x,'rgba(190,244,255,.95)');x.fillStyle='#fff';x.beginPath();x.arc(3.6,-14.4,1.3,0,TAU);x.fill();heart(x,7,-5.5,2.6,'#fff');hl(x,-3,-9.4,15,-9.4)},
  revolver(x){poly(x,[-3,-3,4,-3,1,4,-4,12,-10,10,-7,2]);fs(x,lg(x,-8,0,2,10,['#e286ac','#a24a72']));flower(x,-4.5,5,3.4,'#ffe0ec','#ffd24a');x.beginPath();x.arc(3,-1,3.6,0,PI);x.stroke();
   rr(x,6,-9,28,5,2);fs(x,lg(x,0,-9,0,-4,['#ffffff','#c8bedc']));rr(x,6,-11.4,26,2.6,1.2);fs(x,'#e6dcf2');
   rr(x,-1,-12,12,10,3.5);fs(x,lg(x,0,-12,0,-2,['#ffc6da','#f08ab0']));x.fillStyle=OL;for(const[a,b]of[[2.5,-9],[7.5,-9],[5,-5]]){x.beginPath();x.arc(a,b,1.1,0,TAU);x.fill()}
   poly(x,[-4,-12,0,-14.5,1,-10]);fs(x,'#c8bedc');rr(x,32,-12.5,3,3,1);fs(x,'#ffd24a');hl(x,8,-8,32,-8)},
  shotgun(x){poly(x,[-15,-6,-2,-9,0,-3,-3,0,-13,2]);fs(x,lg(x,0,-9,0,2,['#eab07c','#b9733f']));poly(x,[-2,-3,4,-3,2,8,-4,8]);fs(x,'#9a5a30');x.beginPath();x.arc(4,-1,3.5,0,PI);x.stroke();
   rr(x,0,-11,28,8,3);fs(x,lg(x,0,-11,0,-3,['#b0f8ee','#4fbcb0']));poly(x,[27,-12,37,-16,37,4,27,-2]);fs(x,lg(x,27,-16,37,4,['#d0fff8','#5ac8bc']));x.beginPath();x.ellipse(37,-6,2,10,0,0,TAU);fs(x,'#2f6a66');
   rr(x,6,-3,14,4,2);fs(x,'#356e72');x.fillStyle='rgba(255,255,255,.9)';for(const[a,b,r]of[[10,-8,1.8],[15,-6.5,1.1],[19.5,-8.2,1.4]]){x.beginPath();x.arc(a,b,r,0,TAU);x.fill()}hl(x,2,-9.5,26,-9.5)},
  smg(x){poly(x,[-4,-2,3,-2,1,9,-6,9]);fs(x,'#5a7ab0');rr(x,7,-1,6,11,2);fs(x,'#ff9ac8');x.fillStyle='#fff';x.beginPath();x.arc(10,6,1.6,0,TAU);x.fill();for(const a of[-1.5,0,1.5]){x.beginPath();x.arc(10+a,3.2,.75,0,TAU);x.fill()}
   poly(x,[0,-10,2,-16,6,-10]);fs(x,'#9ae6ff');poly(x,[9,-10,12,-16,15,-10]);fs(x,'#9ae6ff');x.fillStyle='#ffb0d0';poly(x,[1.9,-11,2.4,-14,4.4,-11]);x.fill();poly(x,[10.6,-11,12,-14,13.4,-11]);x.fill();
   rr(x,-6,-11,26,10,4.5);fs(x,lg(x,0,-11,0,-1,['#ecfcff','#8ad8f4']));rr(x,19,-8,10,5,2);fs(x,'#5a7ab0');rr(x,28,-9,3,7,1.2);fs(x,'#ff9ac8');
   x.fillStyle=OL;x.beginPath();x.arc(3,-6.5,1.2,0,TAU);x.fill();x.beginPath();x.arc(10,-6.5,1.2,0,TAU);x.fill();x.fillStyle='rgba(255,140,180,.6)';x.beginPath();x.arc(1,-4,1.5,0,TAU);x.fill();x.beginPath();x.arc(12,-4,1.5,0,TAU);x.fill();
   x.lineWidth=1;x.beginPath();x.arc(5.3,-4.8,1.2,0,PI);x.stroke();x.beginPath();x.arc(7.7,-4.8,1.2,0,PI);x.stroke()},
  moonpistol(x){poly(x,[-4,-2,4,-2,2,10,-7,10]);fs(x,lg(x,0,0,0,10,['#3a3f88','#22265a']));x.fillStyle='#ffd86a';x.fillRect(-5,7,6,1.6);x.beginPath();x.arc(4,0,3.6,0,PI);x.stroke();
   rr(x,-7,-11,26,10,4);fs(x,lg(x,0,-11,0,-1,['#6a72d8','#2a2f6a']));x.strokeStyle='#ffd86a';x.lineWidth=1.2;x.beginPath();x.moveTo(-4,-3.5);x.lineTo(17,-3.5);x.stroke();x.strokeStyle=OL;x.lineWidth=1.6;
   rr(x,18,-9,8,6,2);fs(x,'#ffd86a');x.beginPath();x.arc(29,-6,7,-PI*.62,PI*.62);x.arc(25.8,-6,5.6,PI*.42,-PI*.42,true);x.closePath();fs(x,'#fff3b0');
   star(x,5,-6.5,3.2,1.3,5,'#ffe9a0');x.fillStyle='#fff';x.beginPath();x.arc(-1,-15,1,0,TAU);x.fill();x.beginPath();x.arc(9,-15.5,.8,0,TAU);x.fill()},
  sniper(x){poly(x,[-18,-7,-4,-8,-2,-2,-6,1,-17,3]);fs(x,lg(x,0,-8,0,3,['#f6f8ff','#b8c4e8']));x.fillStyle='#5a8aff';x.fillRect(-15,-4,8,2);poly(x,[-3,-3,3,-3,1,8,-5,8]);fs(x,'#4a5a9a');x.beginPath();x.arc(3,-1,3.4,0,PI);x.stroke();
   rr(x,-4,-10,22,8,3);fs(x,lg(x,0,-10,0,-2,['#ffffff','#c8d4f4']));rr(x,17,-8,30,4,1.5);fs(x,lg(x,0,-8,0,-4,['#eef2ff','#8aa4e8']));rr(x,44,-9.5,5,7,1.5);fs(x,'#5a8aff');
   rr(x,2,-17,16,5.5,2.5);fs(x,'#3a4a8a');x.beginPath();x.arc(2.5,-14.2,2.6,0,TAU);fs(x,'#9fe0ff');x.beginPath();x.arc(17.5,-14.2,2.6,0,TAU);fs(x,'#9fe0ff');poly(x,[8,-11.5,9,-10,11,-10,12,-11.5]);fs(x,'#3a4a8a');
   star(x,50,-6,3.4,1.4,4,'#fff6c0');x.stroke();hl(x,0,-8.6,16,-8.6)},
  rocket(x){poly(x,[-3,-4,4,-4,2,9,-5,9]);fs(x,'#7a3a5a');rr(x,-13,-17,40,13,6);fs(x,lg(x,0,-17,0,-4,['#ffa898','#e04a5a']));x.fillStyle='#ffd24a';for(const a of[-4,6,16])x.fillRect(a,-16.3,3,11.6);rr(x,-13,-17,40,13,6);x.stroke();
   x.beginPath();x.ellipse(27,-10.5,3,6.5,0,0,TAU);fs(x,'#3a1a2a');poly(x,[27,-14,33,-10.5,27,-7]);fs(x,'#7ad8ff');star(x,-7.5,-10.5,3.2,1.3,5,'#fff');x.fillStyle='#fff';x.beginPath();x.arc(11,-8,1,0,TAU);x.fill();x.beginPath();x.arc(21,-14,1,0,TAU);x.fill()},
  prismcannon(x){poly(x,[-3,-3,4,-3,2,9,-5,9]);fs(x,'#c8a04a');x.beginPath();x.arc(4,-1,3.4,0,PI);x.stroke();rr(x,-11,-13,26,11,5);fs(x,lg(x,0,-13,0,-2,['#ffffff','#e4dcf4']));
   x.strokeStyle='#e0b84a';x.lineWidth=1.4;x.beginPath();x.moveTo(-8,-7.5);x.lineTo(12,-7.5);x.stroke();x.strokeStyle=OL;x.lineWidth=1.6;rr(x,14,-11,8,7,2.5);fs(x,'#f0d27a');x.beginPath();x.arc(24,-7.5,6,-1.1,1.1);x.stroke();
   poly(x,[30,-17,37,-3,23,-3]);fs(x,lg(x,23,-17,37,-3,['#ff9ad0','#ffe89a','#9affd8','#9ac8ff','#d8a0ff']));x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=1;x.beginPath();x.moveTo(30,-14.5);x.lineTo(27,-5);x.stroke();x.strokeStyle=OL;x.lineWidth=1.6;
   star(x,-4,-18,2.4,.9,4,'#d8a0ff');star(x,6,-19,1.8,.7,4,'#9ac8ff')},
  emberfist(x){poly(x,[-6,-9,4,-8,4,7,-6,8]);fs(x,'#c84a2a');x.fillStyle='#ffd24a';x.fillRect(-5,-7.4,8,2);x.strokeRect(-5,-7.4,8,2);rr(x,2,-10,13,17,5);fs(x,lg(x,0,-10,0,7,['#ffa66a','#e0482a']));
   x.fillStyle='#ffe08a';for(let i=0;i<4;i++){rr(x,12.5,-8.6+i*3.9,4.2,3.2,1.4);x.fill();x.stroke()}x.strokeStyle='rgba(120,30,10,.6)';x.lineWidth=1;for(let i=1;i<4;i++){x.beginPath();x.moveTo(6,-10+i*4.2);x.lineTo(12,-10+i*4.2);x.stroke()}},
  sakurakat(x){rr(x,-14,-2.6,14,5.2,2);fs(x,'#ff8ab8');x.strokeStyle='#fff0f6';x.lineWidth=1;for(let i=0;i<4;i++){x.beginPath();x.moveTo(-12+i*3.2,-2.4);x.lineTo(-10+i*3.2,2.4);x.stroke()}x.strokeStyle=OL;x.lineWidth=1.6;
   flower(x,0,0,7,'#ffd24a','#ff6a9a');x.beginPath();x.arc(0,0,2,0,TAU);x.stroke();x.beginPath();x.moveTo(3,-2.2);x.quadraticCurveTo(26,-5.5,47,-2.6);x.lineTo(44,.4);x.quadraticCurveTo(24,1.4,3,2.2);x.closePath();fs(x,lg(x,0,-4,0,2,['#ffffff','#ffd6e8','#f7a6c8']));
   x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=.9;x.beginPath();x.moveTo(5,-.9);x.quadraticCurveTo(25,-3.4,44,-1.6);x.stroke();x.fillStyle='#ff8ab8';x.beginPath();x.arc(15,.1,.9,0,TAU);x.fill();x.beginPath();x.arc(22,-.5,.8,0,TAU);x.fill()},
  tidecaller(x){rr(x,-22,-2,58,4,2);fs(x,lg(x,0,-2,0,2,['#7ad8d0','#2f8a96']));x.fillStyle='#ffd86a';for(const a of[-12,6,24])x.fillRect(a,-2.6,2.4,5.2);
   x.beginPath();x.moveTo(34,-6);x.quadraticCurveTo(38,-1,34,6);x.quadraticCurveTo(42,2,42,0);x.quadraticCurveTo(42,-2,34,-6);x.closePath();fs(x,'#5ac8e8');
   poly(x,[38,-1.3,50,0,38,1.3]);fs(x,'#e8fbff');poly(x,[36,-5,47,-8,40,-3]);fs(x,'#e8fbff');poly(x,[36,5,47,8,40,3]);fs(x,'#e8fbff');x.beginPath();x.arc(35.5,0,2.4,0,TAU);fs(x,'#fff6fa')},
  lumistaff(x){rr(x,-20,-2,52,4,2);fs(x,lg(x,0,-2,0,2,['#fff8ec','#d8c8a8']));x.fillStyle='#ffd24a';for(const a of[-16,4,26])x.fillRect(a,-2.8,2.4,5.6);
   x.beginPath();x.arc(37,0,8.5,PI*.35,PI*1.65);x.arc(37,0,5.6,PI*1.6,PI*.4,true);x.closePath();fs(x,'#ffd86a');x.beginPath();x.arc(38.5,0,4.6,0,TAU);fs(x,'#fffbe0');x.fillStyle='#fff';x.beginPath();x.arc(37,-1.6,1.3,0,TAU);x.fill()},
  raijinbow(x){x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=1;x.beginPath();x.moveTo(9,-22);x.lineTo(1,0);x.lineTo(9,22);x.stroke();x.strokeStyle=OL;x.lineWidth=1.6;
   for(const s of[-1,1]){x.beginPath();x.moveTo(4,s*3);x.quadraticCurveTo(20,s*9,10,s*23.5);x.lineTo(7.5,s*21.5);x.quadraticCurveTo(14,s*9,3,s*4.5);x.closePath();fs(x,s<0?'#a07aff':'#7a54d8');
    x.strokeStyle='#ffd24a';x.lineWidth=1.2;x.beginPath();x.moveTo(11.5,s*7.5);x.lineTo(14.5,s*10.5);x.lineTo(12,s*12);x.lineTo(15,s*15.5);x.stroke();x.strokeStyle=OL;x.lineWidth=1.6}
   x.beginPath();x.arc(5,0,4.4,0,TAU);fs(x,'#ffd24a');x.fillStyle=OL;for(let i=0;i<3;i++){const a=i*TAU/3;x.beginPath();x.arc(5+Math.cos(a)*1.8,Math.sin(a)*1.8,1,0,TAU);x.fill()}},
  dragonaxe(x){rr(x,-16,-2.4,46,4.8,2);fs(x,lg(x,0,-2,0,2,['#a8503a','#5a2418']));x.fillStyle='#ffd24a';x.fillRect(-14,-3,3,6);x.fillRect(20,-3,3,6);
   x.beginPath();x.moveTo(24,-4);x.quadraticCurveTo(30,-12,28,-20);x.quadraticCurveTo(42,-14,42,0);x.quadraticCurveTo(42,14,28,18);x.quadraticCurveTo(31,10,24,4);x.closePath();fs(x,lg(x,26,-20,42,18,['#ffd27a','#ff6a3a','#b82a2a']));
   x.strokeStyle='rgba(120,20,10,.5)';x.lineWidth=1;for(let i=0;i<4;i++){x.beginPath();x.arc(32,-9+i*6,3,.3,PI-.3);x.stroke()}x.strokeStyle=OL;x.lineWidth=1.6;
   poly(x,[24,-4,18,-9,21,-3]);fs(x,'#f0e0d0');poly(x,[24,4,18,9,21,3]);fs(x,'#f0e0d0');x.beginPath();x.arc(26,0,2.6,0,TAU);fs(x,'#7affd0');x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=1;x.beginPath();x.moveTo(40,-6);x.quadraticCurveTo(41.5,0,40,6);x.stroke()}};
 // small live touches drawn on top of the cached art (glows, flames): additive sprites only
 const glowAt=(x,c,px,py,s)=>{x.globalCompositeOperation='lighter';x.drawImage(gsp(c),px-s/2,py-s/2,s,s);x.globalCompositeOperation='source-over'};
 const LIVE={
  moonpistol(x,t){glowAt(x,'#fff0a0',29,-6,16+Math.sin(t*4)*3)},
  lumistaff(x,t){glowAt(x,'#fff6b0',38.5,0,22+Math.sin(t*3)*4)},
  prismcannon(x,t){glowAt(x,RB[(t*3|0)&3],30,-9,18+Math.sin(t*5)*3)},
  emberfist(x,t){glowAt(x,'#ff6a20',1,-11,11+Math.sin(t*9)*3);glowAt(x,'#ffb040',9,-12,8+Math.cos(t*11)*2)},
  raijinbow(x,t){if((t*4|0)%3==0)glowAt(x,'#d8b8ff',13,0,18)},
  dragonaxe(x,t){glowAt(x,'#7affd0',26,0,10+Math.sin(t*3)*2)},
  sniper(x){if(SH.sn&&FX7.ld)glowAt(x,SH.full?'#ffffff':'#9fc8ff',50,-6,10+SH.ch*22)}};
 const ART=new Map();
 function art(id,L){const key=id+'|'+(L|0);let c=ART.get(key);if(c)return c;if(ART.size>96)ART.clear();const b=B[id],s=L/40,res=L<60?2:1,pad=3;c=document.createElement('canvas');
  c.width=Math.ceil(((b[2]-b[0])*s+pad*2)*res);c.height=Math.ceil(((b[3]-b[1])*s+pad*2)*res);const x=c.getContext('2d');x.scale(res*s,res*s);x.translate(-b[0]+pad/s,-b[1]+pad/s);x.lineJoin='round';x.lineCap='round';x.strokeStyle=OL;x.lineWidth=1.6;
  try{MODEL[id](x)}catch(e){console.error('GUN9 art',id,e)}c.ox=b[0]*s-pad;c.oy=b[1]*s-pad;c.dw=c.width/res;c.dh=c.height/res;ART.set(key,c);return c}
 // the local player's gun (and bow) points at the cursor while drawn in the hand
 function aimLocal(x,id){const dx=mx+cam.x-P.x;if(Math.abs(dx)>10&&Math.sign(dx)!=P.f)return;const hx=P.x+8*P.f,hy=P.y+33,a=Math.atan2(my+cam.y-hy,mx+cam.x-hx),m=x.getTransform(),cur=Math.atan2(m.b,m.a),det=m.a*m.d-m.b*m.c;
  x.rotate((det<0?cur-a:a-cur)-SH.kick*.22);if(SH.kick>0)x.translate(-SH.kick*3,0)}
 {const _dw=drawWeapon;drawWeapon=function(x,id,L,t){if(!MODEL[id])return _dw.apply(this,arguments);x.save();try{if(t&&L<60&&AIM.has(id)&&typeof FX7!='undefined'&&FX7.ld&&x.canvas===cv)aimLocal(x,id); // in the hand only (the back holster passes t=0)
   const c=art(id,L);x.drawImage(c,c.ox,c.oy,c.dw,c.dh);if(LIVE[id]){const s=L/40;x.scale(s,s);LIVE[id](x,t||0)}}finally{x.restore()}}}
 // icons: drawn level (guns) or diagonal (melee) on the weapon plate, once
 {const _iu=iconURL;iconURL=function(k){if(ICON[k])return ICON[k];const id=typeof k=='string'&&k.startsWith('w:')?k.slice(2):'';if(!MODEL[id])return _iu.apply(this,arguments);
   const S2=48,c=document.createElement('canvas');c.width=c.height=S2;const x=c.getContext('2d');try{burstBG(x,S2)}catch(_){}
   const b=B[id],w=b[2]-b[0],h=b[3]-b[1],tl=GUNS.has(id)?-.24:id=='raijinbow'?.5:-.72,cs=Math.abs(Math.cos(tl)),sn=Math.abs(Math.sin(tl)),sc=Math.min(39/(w*cs+h*sn),39/(w*sn+h*cs));
   x.save();x.translate(S2/2,S2/2+1);x.rotate(tl);x.scale(sc,sc);x.translate(-(b[0]+w/2),-(b[1]+h/2));x.lineJoin='round';x.lineCap='round';x.strokeStyle=OL;x.lineWidth=1.6/Math.max(.6,sc)*.85;try{MODEL[id](x);if(LIVE[id]&&id!='sniper'&&id!='raijinbow')LIVE[id](x,0)}catch(e){console.error('GUN9 icon',id,e)}x.restore();
   ICONC[k]=c;return ICON[k]=c.toDataURL()}}
 // ---- weapon use (wraps the existing chain: these weapons never reach the legacy swing, so they never dig)
 function use(w){if(!lvOk(w)){warnLv(w);S('denied');wcd=.35;return}const cdm=over>0?.5:1;wcd=w.cd*cdm/(1+bonus().atk);
  const cxw=mx+cam.x,cyw=my+cam.y;P.f=cxw>=P.x?1:-1;handAt();const ranged=AIM.has(w.id)||w.id=='lumistaff',a=ranged?Math.atan2(cyw-HY,cxw-HX):Math.atan2(cyw-(P.y+23),cxw-P.x);
  if(ranged){if(swing<=0)swing=0;SH.last=performance.now()} // 0 = weapon out in the hand, no melee swing arc
  else{swing=.22;slashes.push({x:P.x,y:P.y+23,a,t:performance.now(),w});try{FX7.weaponAnim(w.id)}catch(_){}
   const tk=pickTree(cxw,cyw);if(tk>=0&&Math.hypot((tk%W)*T+T/2-P.x,(tk/W|0)*T+T/2-(P.y+P.h/2))<REACH+T){harvest(tk);return}
   const tx=Math.floor(cxw/T),ty=Math.floor(cyw/T);if(Math.hypot(tx*T+T/2-P.x,ty*T+T/2-(P.y+P.h/2))<REACH)try{wTryBreak(tx,ty,w)}catch(_){}}
  BEH[w.id](w,a)}
 {const _uw=useWeapon;useWeapon=function(){const w=WPN[wp];if(w&&D[w.id]&&own[w.id]){use(w);return}return _uw.apply(this,arguments)}}
 // ---- drops: bosses have a 40% chance (other monsters 0.25%) to drop a weapon you do not own yet and are high enough level for
 function drop(m){const pool=IDS.filter(id=>!own[id]&&WPN[id].lv<=(lvl|0));if(!pool.length)return;pool.sort((a,b)=>WPN[b].lv-WPN[a].lv);const id=pool[Math.min(pool.length-1,R()*Math.min(3,pool.length)|0)],w=WPN[id];
  own[id]=1;try{saveP()}catch(_){}try{UI6.say6('Weapon drop: '+w.n,w.move+' · equip it from your inventory',3200)}catch(_){try{say('Weapon drop: '+w.n)}catch(__){}}spark(m.x,cy0(m),'rgb('+w.g+')',20,240);try{renderBar()}catch(_){}}
 {const _hm=hurtMob;hurtMob=function(m,d,w,ang){const was=m.hp>0,r=_hm.apply(this,arguments);try{if(was&&m.hp<=0&&!m._gd&&w){m._gd=1;if(R()<(m.boss?.4:.0025))drop(m)}}catch(_){}return r}}
 // ---- drawing (world space, after the boss projectiles)
 let SD=0;const rn=()=>{SD=(SD*9301+49297)%233280;return SD/233280-.5}; // seeded jitter so a bolt keeps its shape while it fades
 const SOLID={heart:1,bloss:1,pellet:1,paw:1,moon:1,shard:1,rkt:1,prism:1,arrow:1,petalw:1,axe:1};
 const GLW={heart:'#ff9ac8',tracer:'#fff0c0',bloss:'#ffc0d8',pellet:'#9af0e8',paw:'#9ae6ff',moon:'#fff0a0',shard:'#fff6c8',rkt:'#ffb08a',prism:'#e8c8ff',arrow:'#c8a8ff',petalw:'#ffb6d2',wbolt:'#fff6b0',axe:'#ff9a4a'};
 const GLS={heart:26,tracer:22,bloss:40,pellet:18,paw:20,moon:40,shard:22,rkt:34,prism:40,arrow:26,petalw:56,wbolt:22,axe:46};
 function draw(g,cx,cy){const t=performance.now()/1000;let anyF=0;for(let i=0;i<NF;i++)if(FXP[i].on){anyF=1;break}
  const wisps=WS.t>0,bloom=SH.bl>0&&wp=='sakurakat';if(!nAlive&&!anyF&&!wisps&&!bloom)return;g.save();g.lineCap='round';g.lineJoin='round';
  // glows (additive)
  g.globalCompositeOperation='lighter';
  if(nAlive)for(let i=0;i<NP;i++){const p=POOL[i];if(!p.on||p.k=='wave')continue;const s=GLS[p.k]||20,x=p.x-cx,y=p.y-cy;g.drawImage(gsp(GLW[p.k]),x-s/2,y-s/2,s,s);
   if(p.k=='tracer'||p.k=='paw'||p.k=='pellet'||p.k=='wbolt'||p.k=='shard'){const ln=p.k=='tracer'?.03:.018;g.strokeStyle=p.k=='tracer'?'rgba(255,240,190,.9)':'rgba(220,250,255,.6)';g.lineWidth=p.k=='tracer'?3:2;g.beginPath();g.moveTo(x-p.vx*ln,y-p.vy*ln);g.lineTo(x,y);g.stroke()}}
  if(wisps){const a0=Math.min(1,WS.t/.4),s=26+Math.sin(t*6)*4;g.globalAlpha=a0;for(let i=0;i<3;i++){const an=WS.ang+i*TAU/3,x=P.x+Math.cos(an)*T*1.1-cx,y=P.y+20+Math.sin(an)*T*.5-cy;g.drawImage(spr('glow:#fff2a0'),x-s/2,y-s/2,s,s);g.drawImage(spr('glow:#ffffff'),x-5,y-5,10,10)}g.globalAlpha=1}
  for(let i=0;i<NF;i++){const f=FXP[i];if(!f.on)continue;const k=f.t/f.t0,e=1-k,x=f.x-cx,y=f.y-cy;
   if(f.k=='flash'){g.save();g.translate(x,y);g.rotate(f.a);const s=f.s*(.8+e*.6);g.globalAlpha=k;g.drawImage(f.sp,-20*s,-32*s,64*s,64*s);g.restore()}
   else if(f.k=='beam'){const x2=f.x2-cx,y2=f.y2-cy;g.globalAlpha=k;g.strokeStyle=f.c;g.lineWidth=f.r*2.4*k+1;g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();g.strokeStyle='#fff';g.lineWidth=f.r*.7*k+1;g.stroke();g.globalAlpha=1}
   else if(f.k=='zap'&&f.np>0){g.globalAlpha=k;for(let pass=0;pass<2;pass++){SD=f.seed;g.strokeStyle=pass?'#fff':f.c=='#fff'?'#d8a0ff':f.c;g.lineWidth=pass?1.6:5;g.beginPath();
     let px=f.np>1?f.px[0]-cx:x,py=f.np>1?f.py[0]-cy:y;g.moveTo(px,py);for(let j=1;j<f.np;j++){const qx=f.px[j]-cx,qy=f.py[j]-cy;for(let u=1;u<=4;u++){const v=u/4;g.lineTo(px+(qx-px)*v+(u<4?rn()*16:0),py+(qy-py)*v+(u<4?rn()*16:0))}px=qx;py=qy}g.stroke()}g.globalAlpha=1}
   else if(f.k=='bolt'){const top=cam.y-20-cy;g.globalAlpha=k;for(let pass=0;pass<2;pass++){SD=f.seed;g.strokeStyle=pass?'#fff':'#c8a0ff';g.lineWidth=pass?2.5:9;g.beginPath();g.moveTo(x+rn()*30,top);for(let j=1;j<=8;j++)g.lineTo(x+(j<8?rn()*34:0),top+(y-top)*j/8);g.stroke()}g.globalAlpha=1}
   else if(f.k=='boom'){g.globalAlpha=k;g.strokeStyle=f.c;g.lineWidth=7*k+1;g.beginPath();g.arc(x,y,f.r*(.3+e*.8),0,TAU);g.stroke();const s=f.r*2*(.4+e);g.drawImage(f.sp,x-s/2,y-s/2,s,s);g.globalAlpha=1}
   else if(f.k=='pillar'){const h=T*3.4*Math.min(1,e*4),wd=f.r*(.6+.4*k);g.globalAlpha=k;for(let j=0;j<4;j++){const yy=y-h*(j/4)-((t*300+j*40)%(h/4||1));g.drawImage(gsp(j%2?'#ffd070':'#ff7a2a'),x-wd,yy-wd,wd*2,wd*2)}
    g.strokeStyle='#ffdc8c';g.lineWidth=4;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-h);g.stroke();g.globalAlpha=1}
   else if(f.k=='slash'){g.globalAlpha=k;g.strokeStyle=f.c;g.lineWidth=12*k+2;g.beginPath();g.arc(x,y,f.r,f.a-1.1,f.a-1.1+2.2*Math.min(1,e*3));g.stroke();g.strokeStyle='rgba(255,255,255,'+k+')';g.lineWidth=3;g.stroke();g.globalAlpha=1}
   else if(f.k=='thrust'){const ca=Math.cos(f.a),sa=Math.sin(f.a),L=f.r*Math.min(1,e*3.5);g.globalAlpha=k;g.strokeStyle=f.c;g.lineWidth=12*k+2;g.beginPath();g.moveTo(x,y);g.lineTo(x+ca*L,y+sa*L);g.stroke();g.strokeStyle='#fff';g.lineWidth=3;g.stroke();g.globalAlpha=1}
   else if(f.k=='pow'){g.globalAlpha=k;g.strokeStyle=f.c;g.lineWidth=3;g.beginPath();g.arc(x,y,f.r*(.4+e),0,TAU);g.stroke();g.globalAlpha=1}}
  g.globalCompositeOperation='source-over';
  // solid sprites + ground waves
  if(nAlive)for(let i=0;i<NP;i++){const p=POOL[i];if(!p.on)continue;const x=p.x-cx,y=p.y-cy;
   if(p.k=='wave'){const gy=p.gy-cy,h=T*1.25*Math.min(1,p.t*6,p.l*3),d=p.d;g.fillStyle='rgba(90,200,232,.82)';g.beginPath();g.moveTo(x-d*T*.9,gy);g.quadraticCurveTo(x-d*T*.2,gy-h*1.05,x+d*T*.35,gy-h*.8);g.quadraticCurveTo(x+d*T*.05,gy-h*.55,x+d*T*.55,gy);g.closePath();g.fill();
    g.strokeStyle='#effdff';g.lineWidth=3;g.beginPath();g.moveTo(x-d*T*.55,gy-h*.7);g.quadraticCurveTo(x-d*T*.1,gy-h*1.05,x+d*T*.35,gy-h*.8);g.stroke();continue}
   if(!SOLID[p.k])continue;const c=spr(p.k),s=c.width*(p.k=='bloss'?1:p.k=='rkt'||p.k=='axe'||p.k=='arrow'||p.k=='petalw'?.75:.85);
   if(p.k=='rkt'||p.k=='arrow'||p.k=='petalw'||p.k=='axe'||p.k=='prism'){g.save();g.translate(x,y);g.rotate(p.k=='prism'?t*6:p.rot);g.drawImage(c,-s/2,-s/2,s,s);g.restore()}else g.drawImage(c,x-s/2,y-s/2,s,s)}
  // sakura bloom pips over your head
  if(bloom){const x=P.x-cx,y=P.y-cy-16;g.fillStyle='rgba(60,20,40,.35)';for(let i=0;i<5;i++){const xx=x+(i-2)*9;g.beginPath();g.arc(xx,y,3.4,0,TAU);g.fill()}g.fillStyle=SH.bl>=5?'#ffffff':'#ff9ac8';for(let i=0;i<SH.bl;i++){const xx=x+(i-2)*9;g.beginPath();g.arc(xx,y,3,0,TAU);g.fill()}}
  g.restore()}
 {const _t=BOSS6.tick,_dp=BOSS6.drawProj;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){console.error('GUN9',e)}};BOSS6.drawProj=function(gc,cx,cy){_dp.call(this,gc,cx,cy);try{draw(gc,cx,cy)}catch(e){console.error('GUN9d',e)}}}
 return{D,IDS,GUNS,AIM,MODEL,B,BEH,POOL,FXP,S,art,lvOk,get alive(){return nAlive},SH,WS,spr}})();
