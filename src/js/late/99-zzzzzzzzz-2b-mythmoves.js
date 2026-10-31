// ===== MYMV: every class's mythic combo is its own: 39 moves, no two classes share one, each built around the class's playstyle.
//  Brawler  rush:      Ember Flurry (rapid jabs) · Comet Dash (dash through foes) · Meteor Uppercut (launch + fire pillar)
//  Knight   guardian:  Oath Cleave (huge slow piercing wave) · Aegis (2.5 s shield, half damage) · Judgement (three falling light columns)
//  Samurai  precision: Iaido Flash (blink-dash, marked foes burst) · Petal Storm (drifting cyclone) · Thousand Cuts (slashes rain on an area)
//  Archer   range:     Starpiercer (arrow that pierces everything) · Fan of Light (five arrows) · Starfall (a volley from the sky)
//  Mage     control:   Arcane Missiles (homing) · Spectral Chains (pull + bind) · Event Horizon (black hole)
//  Demon    risk:      Blood Rend (draining tendrils) · Blood Pact (spend HP: +40% damage + lifesteal) · Crimson Moon (a moon crashes down)
//  Reaper   souls:     Crow Flock · Soul Harvest (executes the weak, souls heal you) · Grave Rupture (a line of grave eruptions)
//  Elementalist dual:  Glacier Line (freezing spikes) · Flame Geyser (burning) · Prism Nova (fire + frost ring)
//  Stormcaller chain:  Chain Lightning (jumps foe to foe) · Thunder Slam (twin ground shockwaves, stun) · Tempest (a storm cloud strikes)
//  Berserker momentum: Whirlwind (spin while moving) · Earthbreaker Leap (leap + crater) · Blood Rage (roar: +30% damage and speed)
//  Ninja    trickery:  Shadow Step (teleport behind, backstab) · Shuriken Orbit (orbit then scatter) · Ink Clones (two clones cut an X)
//  Druid    nature:    Strangling Roots (root + poison) · Thorn Whip (lash and pull) · Healing Bloom (heal + flower ring)
//  Gunslinger tricks:  Triple Tap (burst) · Ricochet (bounces foe to foe) · Clockwork Grenade (lobbed, explodes)
// The engine (hits, particles, the effect list) is MYTH's; these are the moves, the class buffs and their drawings. =====
const MYMV=(()=>{
 const A=MYART,TH=A.TH,TAU=Math.PI*2,R=Math.random,M=MYTH.api;
 const red=()=>{try{return !!(cel.opt.reduce||(typeof QM!='undefined'&&QM.reduce))}catch(_){return false}};
 // the move list per class: [name, kind, what it does]
 const MV={
  brawler:[['Ember Flurry','flurry','Four lightning-fast jabs burst with embers'],['Comet Dash','dash','You dash through enemies in a trail of fire'],['Meteor Uppercut','uppercut','An uppercut launches foes into a pillar of fire']],
  knight:[['Oath Cleave','cleave','A huge, slow wave of light that cuts through everything'],['Aegis','aegis','A golden shield: half damage for 2.5 seconds'],['Judgement','judgement','Three columns of holy light fall one after another']],
  samurai:[['Iaido Flash','iaido','A blinding blink-dash; every foe you pass bursts into cuts'],['Petal Storm','petalstorm','A cyclone of petals drifts forward, slicing again and again'],['Thousand Cuts','cuts','Slashes rain across the area in front of you']],
  archer:[['Starpiercer','pierce','An arrow of starlight that pierces everything in a line'],['Fan of Light','fan','Five arrows fan out at once'],['Starfall','stars','A volley of falling stars from the sky']],
  mage:[['Arcane Missiles','missiles','Five missiles seek out enemies'],['Spectral Chains','chains','Ghostly chains pull enemies in and bind them'],['Event Horizon','vortex','A black hole that swallows foes, then bursts']],
  demon:[['Blood Rend','splash','Crimson tendrils tear foes apart and drain them'],['Blood Pact','pact','Spend a little health: +40% damage and lifesteal for 4 seconds'],['Crimson Moon','moon','A blood moon crashes down; every foe it hits heals you']],
  reaper:[['Crow Flock','flock','A murder of spectral crows tears forward'],['Soul Harvest','harvest','A wide reap that executes the weak; their souls heal you'],['Grave Rupture','rupture','A line of grave eruptions splits the ground']],
  elementalist:[['Glacier Line','shards','Ice spikes rupture along the ground and freeze'],['Flame Geyser','geyser','A geyser of fire erupts where you aim and burns'],['Prism Nova','prism','A ring of fire and frost: burns and chills']],
  stormcaller:[['Chain Lightning','chain','Lightning leaps from foe to foe'],['Thunder Slam','slam','Twin shockwaves race along the ground and stun'],['Tempest','tempest','A storm cloud hangs over the field and strikes']],
  berserker:[['Whirlwind','whirl','A spinning storm of blades you can steer'],['Earthbreaker Leap','leap','Leap forward and crash down into a crater'],['Blood Rage','rage','A roar: +30% damage and attack speed for 5 seconds']],
  ninja:[['Shadow Step','blink','Teleport behind the nearest foe and backstab'],['Shuriken Orbit','orbit','Shuriken orbit you, then scatter outward'],['Ink Clones','clones','Two shadow clones cut an X through the field']],
  druid:[['Strangling Roots','roots','Vines root nearby foes in place and poison them'],['Thorn Whip','whip','A thorned lash that drags enemies to you'],['Healing Bloom','bloom','A ring of flowers heals you and cuts foes']],
  gunslinger:[['Triple Tap','burst','Three rounds fired in a heartbeat'],['Ricochet','ricochet','A round that bounces from foe to foe'],['Clockwork Grenade','grenade','A lobbed gear bomb that explodes']]};
 for(const k in MV){TH[k].mv=MV[k];const w=WPN['myth_'+k];if(w)w.move='Combo: '+MV[k].map(m=>m[0]).join(' → ')}
 const OWN=new Set(['flurry','dash','uppercut','cleave','aegis','judgement','iaido','petalstorm','cuts','pierce','fan','missiles','pact','moon','harvest','rupture','geyser','prism','chain','slam','tempest','whirl','leap','rage','blink','orbit','clones','roots','whip','bloom','burst','ricochet','grenade','echo']);
 // ---- class buffs (Aegis, Blood Pact, Blood Rage)
 const BUFF={};const buff=(k,kind,dur)=>{BUFF[k]={kind,until:performance.now()+dur*1000}};const on=(k,kind)=>{const b=BUFF[k];return b&&b.kind==kind&&performance.now()<b.until};
 {const _b=bonus;bonus=function(){const r=_b.apply(this,arguments);try{if(on('knight','aegis'))r.arm=Math.min(.85,(r.arm||0)+.5);if(on('berserker','rage'))r.atk=(r.atk||0)+.25}catch(_){}return r}}
 function mod(k,m,d){if(on('demon','pact')){d=Math.round(d*1.4);try{P.hp=Math.min(maxHP(),P.hp+d*.08)}catch(_){}}if(on('berserker','rage'))d=Math.round(d*1.3);return d}
 // ---- helpers
 const pt=(e,x,y,vx,vy,l,s,c,mo)=>M.part(x,y,vx,vy,l,s,c,mo,e.th);
 const pal=k=>TH[k].pal;
 const solidBody=(x,y)=>solidAt(Math.floor(x/T),Math.floor((y+P.h*.5)/T))||solidAt(Math.floor(x/T),Math.floor((y+P.h-4)/T));
 function moveP(dx){let left=Math.abs(dx);while(left>0){const s=Math.min(4,left)*Math.sign(dx);if(solidBody(P.x+s+Math.sign(dx)*P.w*.5,P.y))return false;P.x+=s;left-=4}return true}
 const segDist=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1;let u=((px-ax)*dx+(py-ay)*dy)/l2;u=Math.max(0,Math.min(1,u));return Math.hypot(px-ax-dx*u,py-ay-dy*u)};
 const push=e=>{e.mm=1;e.t=e.t||0;if(!e.hit)e.hit=new Set();M.FX.push(e);return e};
 const tone=(a,b,d,ty,v,dl)=>{try{SFX7.tone(a,b,d,ty,v,dl)}catch(_){}};
 // ---- casting a move (c: {k,w,o,aim,f,mul,sc,tx,ty})
 function cast(name,c){const{k,w,o,aim,f,mul,sc}=c,p=pal(k),base={th:k,w,mul,sc};
  switch(name){
   case'flurry':push(Object.assign({k:'flur',life:.42,n:4,i:0,next:0,pts:[]},base,{mul:mul*.42,f,aim}));tone(300,420,.08,'triangle',.03);break;
   case'dash':push(Object.assign({k:'dash',life:.24,f,x0:P.x,dist:T*3.6,done:0,trail:[]},base,{mul:mul*.9}));try{iT=Math.max(iT||0,.4)}catch(_){}tone(180,520,.25,'sawtooth',.03);break;
   case'uppercut':{M.hitArea(Object.assign({hit:new Set()},base),o.x+f*T*1.1,o.y,T*1.4,mul*1.1,0,true);for(const m of M.near(o.x+f*T*1.1,o.y,T*1.5))if(!m.boss)m.vy=-640;
    const x=o.x+f*T*1.4,gy=M.gyAt(x,o.y-T);M.FX.push(Object.assign({k:'pil',look:'flame',x,y:gy,t:0,life:.8,h:T*5*sc,done:0,hit:new Set()},base));tone(160,700,.35,'sawtooth',.035);break}
   case'cleave':M.FX.push(Object.assign({k:'cres',x:o.x+Math.cos(aim)*30,y:o.y+Math.sin(aim)*30,vx:Math.cos(aim)*430,vy:Math.sin(aim)*430,a:aim,t:0,life:1.05,r:74*sc,hit:new Set(),big:1},base,{mul:mul*1.05}));tone(520,880,.5,'triangle',.035);break;
   case'aegis':buff(k,'aegis',2.5);for(const m of M.near(P.x,P.y+P.h/2,T*2))if(!m.boss){m.vx+=Math.sign(m.x-P.x||1)*420;m.vy-=160}push(Object.assign({k:'aura',kind:'aegis',life:2.5},base));tone(660,990,.6,'sine',.04);tone(880,1320,.5,'triangle',.02,.08);break;
   case'judgement':for(let i=0;i<3;i++){const x=o.x+f*T*(1.8+i*1.5),gy=M.gyAt(x,o.y-T);M.FX.push(Object.assign({k:'pil',look:'light',x,y:gy,t:0,del:i*.16,life:.8,h:T*7*sc,done:0,hit:new Set()},base,{mul:mul*.75}))}tone(990,1480,.6,'sine',.035);break;
   case'iaido':{const x0=P.x,y0=P.y+P.h/2;moveP(f*T*4);const x1=P.x;try{iT=Math.max(iT||0,.35)}catch(_){}const lo=Math.min(x0,x1)-T*.5,hi=Math.max(x0,x1)+T*.5;
    for(const m of mobs)if(M.live(m)&&m.x>lo&&m.x<hi&&Math.abs(m.y+m.h/2-y0)<T*1.4)push(Object.assign({k:'mark',m,del:.32,life:.3,x:m.x,y:m.y+m.h/2},base,{mul:mul*1.6}));
    push(Object.assign({k:'ghost',x0,x1,y:P.y,life:.4},base));tone(1400,700,.2,'triangle',.04);break}
   case'petalstorm':push(Object.assign({k:'cyc',x:o.x+f*T,y:o.y,vx:f*190,life:1.5,tick:0,r:T*1.4*sc},base,{mul:mul*.3}));break;
   case'cuts':{const cx=o.x+f*T*2.6,cy=o.y,ls=[];for(let i=0;i<8;i++){const a=R()*Math.PI,L=T*(1.4+R()*.8),x=cx+(R()-.5)*T*3,y=cy+(R()-.5)*T*1.6;ls.push({x0:x-Math.cos(a)*L,y0:y-Math.sin(a)*L,x1:x+Math.cos(a)*L,y1:y+Math.sin(a)*L,d:i*.08,done:0})}
    push(Object.assign({k:'cuts',ls,life:1.05},base,{mul:mul*.42}));break}
   case'pierce':M.FX.push({k:'proj',kind:'arrow',th:k,w,mul:mul*1.15,t:0,life:1.2,x:o.x+Math.cos(aim)*24,y:o.y+Math.sin(aim)*24,vx:Math.cos(aim)*1400,vy:Math.sin(aim)*1400,a:aim,hit:new Set(),pierce:99,big:1});tone(900,500,.2,'triangle',.04);break;
   case'fan':for(let i=0;i<5;i++){const a=aim+(i-2)*.13;M.FX.push({k:'proj',kind:'arrow',th:k,w,mul:mul*.55,t:0,life:.9,x:o.x+Math.cos(a)*24,y:o.y+Math.sin(a)*24,vx:Math.cos(a)*1050,vy:Math.sin(a)*1050,a,hit:new Set(),pierce:1})}tone(700,420,.16,'triangle',.04);break;
   case'missiles':for(let i=0;i<5;i++){const a=aim+(i-2)*.45;push(Object.assign({k:'pj',look:'missile',x:o.x,y:o.y,vx:Math.cos(a)*420,vy:Math.sin(a)*420-120,life:1.6,home:1,pierce:1,del:i*.05,trail:[]},base,{mul:mul*.42}))}tone(1100,1600,.3,'sine',.03);break;
   case'pact':{try{const c2=Math.max(0,Math.min(P.hp-1,Math.round(P.hp*.08)));P.hp-=c2}catch(_){}buff(k,'pact',4);push(Object.assign({k:'aura',kind:'pact',life:4},base));
    M.FX.push(Object.assign({k:'ring',x:o.x,y:o.y,t:0,life:.45,r:T*2.4,hit:new Set()},base,{mul:mul*.6}));tone(110,70,.6,'sawtooth',.05);break}
   case'moon':{const x=c.tx,gy=M.gyAt(x,c.ty-T*2);push(Object.assign({k:'moon',x,y:gy-T*9,y0:gy-T*9,y1:gy-T*.6,life:.9,r:T*2.5*sc,done:0},base,{mul:mul*2}));tone(80,50,1,'sine',.06);break}
   case'harvest':{let n=0;for(const m of mobs)if(M.live(m)){const dx=m.x-o.x,dy=m.y+m.h/2-o.y,d=Math.hypot(dx,dy);let da=Math.abs(Math.atan2(dy,dx)-aim);if(da>Math.PI)da=TAU-da;if(d<T*2.9+Math.max(m.w,m.h)*.5&&da<1.25){const low=m.hp<(m.mhp||m.hp*3)*.4;M.onHit(k,m,Math.atan2(dy,dx),mul*(low?2.2:1),w,.6);n++;
      push(Object.assign({k:'soul',x:m.x,y:m.y+m.h/2,vx:(R()-.5)*200,vy:-200,life:1.6},base))}}
    push(Object.assign({k:'reap',x:o.x,y:o.y,aim,life:.35},base));tone(240,120,.4,'sawtooth',.04);break}
   case'rupture':for(let i=0;i<5;i++){const x=o.x+f*T*(1.2+i*.95),gy=M.gyAt(x,o.y-T);M.FX.push(Object.assign({k:'pil',look:'grave',x,y:gy,t:0,del:i*.08,life:.7,h:T*(2.4+i*.4)*sc,done:0,hit:new Set()},base,{mul:mul*.55}))}tone(120,60,.6,'sawtooth',.045);break;
   case'geyser':{const x=c.tx,gy=M.gyAt(x,c.ty-T*2);M.FX.push(Object.assign({k:'pil',look:'flame',x,y:gy,t:0,life:.95,h:T*6*sc,done:0,hit:new Set(),burn:1},base,{mul:mul*1.1}));tone(200,600,.4,'sawtooth',.035);break}
   case'prism':M.FX.push(Object.assign({k:'ring',x:o.x,y:o.y,t:0,life:.6,r:T*4*sc,hit:new Set(),prism:1},base));tone(500,1500,.5,'triangle',.035);break;
   case'chain':{const pts=[{x:o.x,y:o.y}],hit=new Set();let cur={x:o.x,y:o.y},rng=T*6.5;for(let i=0;i<5;i++){const m=M.near(cur.x,cur.y,rng,hit).sort((a,b)=>Math.hypot(a.x-cur.x,a.y-cur.y)-Math.hypot(b.x-cur.x,b.y-cur.y))[0];if(!m)break;hit.add(m);
      M.onHit(k,m,Math.atan2(m.y-cur.y,m.x-cur.x),mul*(1-i*.1),w,.3);if(!m.boss)m.stun=Math.max(m.stun||0,.35);cur={x:m.x,y:m.y+m.h/2};pts.push(cur);rng=T*3.6}
    if(pts.length==1)pts.push({x:o.x+f*T*4,y:o.y+(R()-.5)*T});push(Object.assign({k:'chainlt',pts,life:.4,seed:(R()*1e6)|0},base));tone(1600,2600,.25,'square',.02);break}
   case'slam':{const gy=M.gyAt(o.x,o.y-T);for(const d of[-1,1])push(Object.assign({k:'wave',x:o.x,dir:d,y:gy,life:.7,sp:560},base,{mul:mul*.8}));try{shake=Math.max(shake,QM.reduce?0:.12)}catch(_){}tone(90,60,.5,'sawtooth',.06);tone(2000,1200,.2,'square',.02,.05);break}
   case'tempest':push(Object.assign({k:'storm',x:c.tx,y:c.ty-T*3.2,life:1.9,tick:.1,r:T*2.8,bolts:[]},base,{mul:mul*.5}));tone(70,50,1.5,'sine',.05);break;
   case'whirl':push(Object.assign({k:'whirl',life:.7,tick:0},base,{mul:mul*.36}));tone(300,200,.6,'sawtooth',.03);break;
   case'leap':P.vy=-660;P.vx=f*420;push(Object.assign({k:'leap',life:1.4,done:0,f},base,{mul:mul*1.7}));tone(200,500,.3,'triangle',.03);break;
   case'rage':buff(k,'rage',5);push(Object.assign({k:'aura',kind:'rage',life:5},base));M.FX.push(Object.assign({k:'ring',x:o.x,y:o.y,t:0,life:.4,r:T*2.2,hit:new Set(),small:1},base,{mul:mul*.5}));tone(90,180,.7,'sawtooth',.06);break;
   case'blink':{const m=M.near(o.x,o.y,T*6).sort((a,b)=>Math.hypot(a.x-o.x,a.y-o.y)-Math.hypot(b.x-o.x,b.y-o.y))[0];push(Object.assign({k:'smoke',x:P.x,y:P.y+P.h/2,life:.5},base));
    if(m){const side=Math.sign(m.x-P.x)||f,tx=m.x+side*(m.w*.5+18);if(!solidBody(tx,m.y+m.h-P.h)){P.x=tx;P.y=Math.min(P.y,m.y+m.h-P.h);P.f=-side}try{iT=Math.max(iT||0,.3)}catch(_){}M.onHit(k,m,Math.atan2(m.y-P.y,m.x-P.x),mul*2,w,.5)}else moveP(f*T*3);
    push(Object.assign({k:'smoke',x:P.x,y:P.y+P.h/2,life:.5},base));tone(1800,600,.18,'triangle',.035);break}
   case'orbit':{const its=[];for(let i=0;i<6;i++)its.push({a:i/6*TAU,cd:new Map()});push(Object.assign({k:'orbit',its,life:1.25,rel:0},base,{mul:mul*.35}));tone(1200,1500,.2,'triangle',.03);break}
   case'clones':{const y=o.y;push(Object.assign({k:'clones',cl:[{x0:o.x-T*2.6,y0:y-T*1.2,x1:o.x+T*2.6,y1:y+T*.8},{x0:o.x+T*2.6,y0:y-T*1.2,x1:o.x-T*2.6,y1:y+T*.8}],life:.55},base,{mul:mul*.9}));tone(700,300,.3,'sawtooth',.03);break}
   case'roots':{const tg=M.near(o.x+f*T*2,o.y,T*3.4).slice(0,6);for(const m of tg){if(!m.boss)m.root=1.8;push(Object.assign({k:'root',m,life:1.8,tick:0},base,{mul:mul*.22}))}if(!tg.length)push(Object.assign({k:'root',x:o.x+f*T*2,y:M.gyAt(o.x+f*T*2,o.y-T),life:.8,tick:9},base));tone(220,140,.4,'triangle',.035);break}
   case'whip':{const tx=c.tx,ty=c.ty,a=Math.atan2(ty-o.y,tx-o.x),L=Math.min(T*4.6,Math.hypot(tx-o.x,ty-o.y)+T);push(Object.assign({k:'whip',a,L,life:.42,ox:o.x,oy:o.y},base,{mul:mul*1.05}));tone(900,300,.18,'triangle',.035);break}
   case'bloom':{try{P.hp=Math.min(maxHP(),P.hp+maxHP()*.06)}catch(_){}M.FX.push(Object.assign({k:'ring',x:o.x,y:o.y,t:0,life:.6,r:T*3*sc,hit:new Set(),bloom:1},base));push(Object.assign({k:'bloomfx',x:o.x,y:o.y,life:.9},base));tone(660,990,.5,'sine',.035);break}
   case'burst':push(Object.assign({k:'tap',n:3,i:0,next:0,life:.3,aim},base,{mul:mul*.5}));break;
   case'ricochet':push(Object.assign({k:'pj',look:'bullet',x:o.x+Math.cos(aim)*24,y:o.y+Math.sin(aim)*24,vx:Math.cos(aim)*1100,vy:Math.sin(aim)*1100,life:1.6,bounce:5,pierce:1},base,{mul:mul*.8}));tone(300,200,.12,'square',.03);break;
   case'grenade':push(Object.assign({k:'pj',look:'grenade',x:o.x,y:o.y,vx:Math.cos(aim)*520+f*80,vy:Math.sin(aim)*520-300,grav:900,life:2,explode:T*2.3,pierce:1},base,{mul:mul*1.9}));tone(400,250,.2,'triangle',.03);break;
   case'echo':if(c.name&&c.name!='echo')push(Object.assign({k:'echo',del:.32,life:.01,name:c.name,c},base));break;
   default:return false}
  return true}
 // ---- per frame: buffs, moves that move the player, rooted foes
 function frame(dt){for(const m of mobs)if(m.root>0){m.root-=dt;m.vx=0;if(m.vy<0)m.vy=0}}
 // ---- effects
 function tick(e,dt){if(e.del>0){e.del-=dt;return false}e.t+=dt;const p=pal(e.th),u=e.t/e.life;
  switch(e.k){
   case'flur':e.next-=dt;if(e.i<e.n&&e.next<=0){e.next=.08;e.i++;const x=P.x+e.f*T*1.15+(R()-.5)*14,y=P.y+P.h*.45+(R()-.5)*18;e.pts.push({x,y,t:0});M.hitArea(e,x,y,T*1,e.mul,.5,false);e.hit=new Set();M.sparks(x,y,e.th,red()?2:6,200);tone(260+e.i*40,180,.06,'triangle',.03)}for(const q of e.pts)q.t+=dt;break;
   case'dash':{const prev=e.done,tgt=Math.min(1,u/.9);const want=e.x0+e.f*e.dist*(1-Math.pow(1-tgt,2)),dx=want-P.x;if(Math.abs(dx)>.5)moveP(dx);P.vy=Math.min(P.vy,0);e.trail.push({x:P.x,y:P.y+P.h/2,t:0});if(e.trail.length>14)e.trail.shift();for(const q of e.trail)q.t+=dt;
    M.hitArea(e,P.x,P.y+P.h/2,T*.9,e.mul,1.2,true);if(!red())pt(e,P.x-e.f*10,P.y+P.h*.6,-e.f*120,-40-R()*60,.4,4,R()<.5?p[0]:p[3],false);break}
   case'aura':break;
   case'mark':if(!e.done){e.done=1;if(M.live(e.m))M.onHit(e.th,e.m,0,e.mul,e.w,.4);e.x=e.m.x;e.y=e.m.y+e.m.h/2;M.sparks(e.x,e.y,e.th,red()?4:12,260);tone(1700,900,.12,'triangle',.03)}break;
   case'ghost':break;
   case'cyc':e.x+=e.vx*dt;e.tick-=dt;if(e.tick<=0){e.tick=.2;e.hit=new Set();M.hitArea(e,e.x,e.y,e.r,e.mul,.25,false)}if(!red()&&R()<.9){const a=R()*TAU;pt(e,e.x+Math.cos(a)*e.r,e.y+Math.sin(a)*e.r*.6,-Math.sin(a)*160,Math.cos(a)*100-30,.5,6,p[0],true)}if(solidAt(Math.floor(e.x/T),Math.floor(e.y/T)))e.vx*=.5;break;
   case'cuts':for(const l of e.ls)if(!l.done&&e.t>=l.d){l.done=1;for(const m of mobs)if(M.live(m)&&segDist(m.x,m.y+m.h/2,l.x0,l.y0,l.x1,l.y1)<16+Math.max(m.w,m.h)*.4)M.onHit(e.th,m,Math.atan2(l.y1-l.y0,l.x1-l.x0),e.mul,e.w,.3);tone(1500+R()*500,900,.06,'triangle',.02)}break;
   case'pj':{if(e.home){const tg=M.near(e.x,e.y,T*8,e.hit).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];if(tg){const a=Math.atan2(tg.y+tg.h/2-e.y,tg.x-e.x),sp=Math.min(900,Math.hypot(e.vx,e.vy)+900*dt);const ca=Math.atan2(e.vy,e.vx);let da=a-ca;da=Math.atan2(Math.sin(da),Math.cos(da));const na=ca+Math.max(-6*dt,Math.min(6*dt,da));e.vx=Math.cos(na)*sp;e.vy=Math.sin(na)*sp}}
    if(e.grav)e.vy+=e.grav*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.trail){e.trail.push({x:e.x,y:e.y});if(e.trail.length>8)e.trail.shift()}
    const boom=()=>{e.t=e.life;M.hitArea(e,e.x,e.y,e.explode,e.mul,1.4,true);M.sparks(e.x,e.y,e.th,red()?8:24,380);push(Object.assign({k:'blast',x:e.x,y:e.y,life:.45,r:e.explode,th:e.th,w:e.w,mul:0}));try{shake=Math.max(shake,QM.reduce?0:.14)}catch(_){}tone(70,40,.6,'sawtooth',.07)};
    for(const m of mobs)if(M.live(m)&&!e.hit.has(m)&&Math.hypot(m.x-e.x,m.y+m.h/2-e.y)<14+Math.max(m.w,m.h)*.5){if(e.explode){boom();break}e.hit.add(m);M.onHit(e.th,m,Math.atan2(e.vy,e.vx),e.mul,e.w,.5);
     if(e.bounce>0){e.bounce--;const n=M.near(e.x,e.y,T*4.5,e.hit).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];if(n){const a=Math.atan2(n.y+n.h/2-e.y,n.x-e.x),sp=Math.hypot(e.vx,e.vy);e.vx=Math.cos(a)*sp;e.vy=Math.sin(a)*sp;M.sparks(e.x,e.y,e.th,4,160);tone(1800,1200,.05,'square',.02)}else e.t=e.life}
     else if(--e.pierce<=0){e.t=e.life;M.sparks(e.x,e.y,e.th,5,160)}break}
    if(e.t<e.life&&solidAt(Math.floor(e.x/T),Math.floor(e.y/T))){if(e.explode)boom();else{e.t=e.life;M.sparks(e.x,e.y,e.th,4,140)}}
    if(!red()&&R()<.7)pt(e,e.x,e.y,(R()-.5)*30,(R()-.5)*30,.3,e.look=='missile'?5:3,p[R()<.6?0:1],false);break}
   case'blast':break;
   case'moon':{const k2=Math.min(1,u/.55);e.y=e.y0+(e.y1-e.y0)*k2*k2;if(!e.done&&k2>=1){e.done=1;const n=M.hitArea(e,e.x,e.y1,e.r,e.mul,1.6,true);try{P.hp=Math.min(maxHP(),P.hp+maxHP()*.02*Math.min(6,e.hit.size))}catch(_){}M.sparks(e.x,e.y1,e.th,red()?10:30,420);try{shake=Math.max(shake,QM.reduce?0:.18)}catch(_){}tone(60,35,.8,'sawtooth',.08)}break}
   case'soul':{const dx=P.x-e.x,dy=P.y+P.h/2-e.y,d=Math.hypot(dx,dy)||1;e.vx+=dx/d*1400*dt;e.vy+=dy/d*1400*dt;e.vx*=.96;e.vy*=.96;e.x+=e.vx*dt;e.y+=e.vy*dt;if(d<22&&e.t>.15){e.t=e.life;try{P.hp=Math.min(maxHP(),P.hp+maxHP()*.015)}catch(_){}tone(1200,1600,.1,'sine',.02)}break}
   case'reap':break;
   case'chainlt':break;
   case'wave':{const fx=e.x+e.dir*e.sp*e.t;e.fx=fx;for(const m of mobs)if(M.live(m)&&!e.hit.has(m)&&Math.abs(m.x-fx)<T*.7&&Math.abs(m.y+m.h-e.y)<T*1.2){e.hit.add(m);M.onHit(e.th,m,e.dir>0?0:Math.PI,e.mul,e.w,.9);if(!m.boss)m.stun=Math.max(m.stun||0,.9)}
    if(!red()&&R()<.9)pt(e,fx,e.y-4,(R()-.5)*60,-120-R()*120,.35,3,R()<.5?p[0]:'#ffffff',false);if(solidAt(Math.floor((fx+e.dir*T*.5)/T),Math.floor((e.y-T*.5)/T)))e.t=Math.max(e.t,e.life-.05);break}
   case'storm':{e.tick-=dt;if(e.tick<=0&&e.t<e.life-.2){e.tick=.24;const tg=M.near(e.x,e.y+T*3,e.r+T*2).filter(m=>Math.abs(m.x-e.x)<e.r);const m=tg[(R()*tg.length)|0];const x=m?m.x:e.x+(R()-.5)*e.r*2,y=m?m.y+m.h/2:M.gyAt(x,e.y+T);
     e.bolts.push({x,y,t:0,seed:(R()*1e6)|0});if(m){M.onHit(e.th,m,Math.PI/2,e.mul,e.w,.3);if(!m.boss)m.stun=Math.max(m.stun||0,.3)}else{const hs={hit:new Set(),th:e.th,w:e.w};M.hitArea(hs,x,y,T*.9,e.mul,.4,true)}M.sparks(x,y,e.th,red()?3:8,220);tone(2400,800,.15,'square',.025)}
    for(const b of e.bolts)b.t+=dt;e.bolts=e.bolts.filter(b=>b.t<.25);break}
   case'whirl':e.tick-=dt;if(e.tick<=0){e.tick=.12;e.hit=new Set();M.hitArea(e,P.x,P.y+P.h/2,T*1.7,e.mul,.6,false)}if(!red()&&R()<.9){const a=R()*TAU;pt(e,P.x+Math.cos(a)*T*1.5,P.y+P.h/2+Math.sin(a)*T*.8,-Math.sin(a)*200,Math.cos(a)*120,.3,3,p[0],false)}break;
   case'leap':if(!e.done&&e.t>.18&&(P.g||e.t>1.3)){e.done=1;e.t=e.life-.45;const x=P.x,y=P.y+P.h;M.hitArea(e,x,y-T*.5,T*2.3,e.mul,1.4,true);for(const m of e.hit)if(!m.boss)m.vy=-480;M.sparks(x,y,e.th,red()?10:28,360);
     push(Object.assign({k:'crater',x,y,life:.6,th:e.th,w:e.w,mul:0}));try{shake=Math.max(shake,QM.reduce?0:.2)}catch(_){}tone(55,35,.8,'sawtooth',.08)}break;
   case'crater':break;
   case'smoke':break;
   case'orbit':{const r=T*1.5;for(const it of e.its){it.a+=dt*7;if(!e.rel){const x=P.x+Math.cos(it.a)*r,y=P.y+P.h/2+Math.sin(it.a)*r*.8;it.x=x;it.y=y;for(const m of mobs)if(M.live(m)&&Math.hypot(m.x-x,m.y+m.h/2-y)<20+Math.max(m.w,m.h)*.5){const c=it.cd.get(m)||0;if(performance.now()-c>260){it.cd.set(m,performance.now());M.onHit(e.th,m,it.a,e.mul,e.w,.3)}}}}
    if(!e.rel&&e.t>e.life-.35){e.rel=1;for(const it of e.its)M.FX.push({k:'proj',kind:'shur',th:e.th,w:e.w,mul:e.mul*1.3,t:0,life:.6,x:it.x,y:it.y,vx:Math.cos(it.a)*900,vy:Math.sin(it.a)*900,a:it.a,hit:new Set(),pierce:2})}break}
   case'clones':for(const c of e.cl){const k2=Math.min(1,u/.7),x=c.x0+(c.x1-c.x0)*k2,y=c.y0+(c.y1-c.y0)*k2;c.x=x;c.y=y;for(const m of mobs)if(M.live(m)&&!e.hit.has(m)&&Math.hypot(m.x-x,m.y+m.h/2-y)<26+Math.max(m.w,m.h)*.5){e.hit.add(m);M.onHit(e.th,m,Math.atan2(c.y1-c.y0,c.x1-c.x0),e.mul,e.w,.6)}}break;
   case'root':if(e.m){if(!M.live(e.m))return true;e.x=e.m.x;e.y=e.m.y+e.m.h;e.tick-=dt;if(e.tick<=0){e.tick=.3;M.onHit(e.th,e.m,-Math.PI/2,e.mul,e.w,0)}}break;
   case'whip':{const ext=u<.5?u/.5:1-(u-.5)/.5,L=e.L*ext,x1=e.ox+Math.cos(e.a)*L,y1=e.oy+Math.sin(e.a)*L;e.x1=x1;e.y1=y1;e.ox=P.x;e.oy=P.y+28;
    for(const m of mobs)if(M.live(m)&&!e.hit.has(m)&&segDist(m.x,m.y+m.h/2,e.ox,e.oy,x1,y1)<14+Math.max(m.w,m.h)*.45){e.hit.add(m);M.onHit(e.th,m,e.a+Math.PI,e.mul,e.w,0);if(!m.boss){m.vx=(P.x-m.x)*3;m.vy=-140}}break}
   case'bloomfx':break;
   case'tap':e.next-=dt;if(e.i<e.n&&e.next<=0){e.next=.08;e.i++;const o=M.pivot(),a=e.aim+(R()-.5)*.05;M.FX.push({k:'proj',kind:'bullet',th:e.th,w:e.w,mul:e.mul,t:0,life:.9,x:o.x+Math.cos(a)*24,y:o.y+Math.sin(a)*24,vx:Math.cos(a)*1300,vy:Math.sin(a)*1300,a,hit:new Set(),pierce:1});tone(320,180,.07,'square',.03);try{noise(.05,900,.05)}catch(_){}}break;
   case'echo':if(!e.done){e.done=1;const c=Object.assign({},e.c,{o:M.pivot(),mul:e.c.mul*.6});if(OWN.has(e.name))cast(e.name,c);else M.cast(e.name,c.k,c.w,c.o,c.aim,c.f,c.mul,1)}break}
  return e.t>=e.life}
 // ---- drawings
 const glow=M.glow;
 function draw(g,e,cx,cy,t){if(e.del>0)return;const p=pal(e.th),u=e.t/e.life,fade=Math.max(0,1-Math.max(0,u-.6)/.4);g.save();
  switch(e.k){
   case'flur':g.globalCompositeOperation='lighter';for(const q of e.pts){const a=Math.max(0,1-q.t/.25);if(a<=0)continue;g.globalAlpha=a;g.beginPath();g.arc(q.x-cx,q.y-cy,8+q.t*90,0,TAU);g.strokeStyle=A.rgba(p[0],.9);g.lineWidth=3;g.stroke();g.drawImage(glow(p[3]),q.x-cx-16,q.y-cy-16,32,32);A.star4(g,q.x-cx,q.y-cy,10*a,'#ffffff',q.t*8)}break;
   case'dash':g.globalCompositeOperation='lighter';for(let i=1;i<e.trail.length;i++){const a=e.trail[i-1],b=e.trail[i],al=i/e.trail.length;g.globalAlpha=al*fade;g.beginPath();g.moveTo(a.x-cx,a.y-cy);g.lineTo(b.x-cx,b.y-cy);g.strokeStyle=A.rgba(p[0],.8);g.lineWidth=18*al;g.lineCap='round';g.stroke();g.strokeStyle='#fff3c0';g.lineWidth=5*al;g.stroke()}break;
   case'aura':{const x=P.x-cx,y=P.y+P.h/2-cy,b=Math.min(1,e.t/.2)*fade;g.globalAlpha=b;if(e.kind=='aegis'){g.globalCompositeOperation='lighter';g.beginPath();g.ellipse(x,y,34,40,0,0,TAU);g.fillStyle=A.rgba(p[0],.12);g.fill();g.strokeStyle=A.rgba(p[1],.8);g.lineWidth=2;g.stroke();
     for(let i=0;i<6;i++){const q=i/6*TAU+t*.8;g.save();g.translate(x+Math.cos(q)*34,y+Math.sin(q)*40);g.rotate(q);g.strokeStyle=A.rgba(p[0],.9);g.lineWidth=1.4;g.beginPath();for(let j=0;j<6;j++){const r2=j/6*TAU;g.lineTo(Math.cos(r2)*6,Math.sin(r2)*6)}g.closePath();g.stroke();g.restore()}}
    else{const col=e.kind=='pact'?p[0]:'#ff4a2a';g.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const q=i/7*TAU+t*2;g.save();g.translate(x+Math.cos(q)*16,y+20);g.globalAlpha=b*(.5+.5*Math.sin(t*6+i));A.flame(g,0,0,7+3*Math.sin(t*5+i),col,t+i);g.restore()}g.globalAlpha=b*.4;g.drawImage(glow(col),x-40,y-40,80,80)}break}
   case'mark':{const x=e.x-cx,y=e.y-cy;if(!e.done){g.globalAlpha=.8;g.strokeStyle=A.rgba(p[1],.9);g.lineWidth=1.5;g.beginPath();g.arc(x,y,16,0,TAU);g.stroke();break}g.globalAlpha=fade;g.globalCompositeOperation='lighter';g.strokeStyle='#ffffff';g.lineWidth=3;for(const s of[-1,1]){g.beginPath();g.moveTo(x-22,y-22*s);g.lineTo(x+22,y+22*s);g.stroke()}g.strokeStyle=A.rgba(p[0],.8);g.lineWidth=8;g.globalAlpha=fade*.5;for(const s of[-1,1]){g.beginPath();g.moveTo(x-22,y-22*s);g.lineTo(x+22,y+22*s);g.stroke()}break}
   case'ghost':{g.globalAlpha=(1-u)*.6;g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const x=e.x0+(e.x1-e.x0)*i/4;g.fillStyle=A.rgba(p[0],.35);g.beginPath();g.ellipse(x-cx,e.y-cy+P.h/2,10,P.h/2,0,0,TAU);g.fill()}g.strokeStyle='#ffffff';g.lineWidth=2;g.beginPath();g.moveTo(e.x0-cx,e.y-cy+P.h/2);g.lineTo(e.x1-cx,e.y-cy+P.h/2);g.stroke();break}
   case'cyc':{const x=e.x-cx,y=e.y-cy;g.globalAlpha=fade;g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){g.save();g.translate(x,y);g.rotate(t*6+i*2);g.beginPath();g.ellipse(0,0,e.r*(1-i*.2),e.r*.5*(1-i*.2),0,0,Math.PI*1.4);g.strokeStyle=A.rgba(i?p[1]:p[0],.7);g.lineWidth=3;g.stroke();g.restore()}
    g.globalCompositeOperation='source-over';for(let i=0;i<8;i++){const q=i/8*TAU+t*5;A.petal(g,x+Math.cos(q)*e.r*.8,y+Math.sin(q)*e.r*.4,5,q+t*4,p[0])}break}
   case'cuts':g.globalCompositeOperation='lighter';for(const l of e.ls){if(!l.done)continue;const a=Math.max(0,1-(e.t-l.d)/.35);if(a<=0)continue;g.globalAlpha=a;g.beginPath();g.moveTo(l.x0-cx,l.y0-cy);g.lineTo(l.x1-cx,l.y1-cy);g.strokeStyle=A.rgba(p[0],.7);g.lineWidth=7;g.stroke();g.strokeStyle='#ffffff';g.lineWidth=2;g.stroke()}break;
   case'pj':{const x=e.x-cx,y=e.y-cy,a=Math.atan2(e.vy,e.vx);g.globalAlpha=fade;
    if(e.look=='missile'){g.globalCompositeOperation='lighter';if(e.trail)for(let i=1;i<e.trail.length;i++){g.globalAlpha=i/e.trail.length*.6;g.drawImage(glow(p[0]),e.trail[i].x-cx-8,e.trail[i].y-cy-8,16,16)}g.globalAlpha=1;g.drawImage(glow(p[3]),x-14,y-14,28,28);A.rune(g,x,y,5,'#ffffff',t*6,3)}
    else if(e.look=='grenade'){g.translate(x,y);A.gear(g,0,0,9,p[3],t*12);g.fillStyle='#1a1a22';g.beginPath();g.arc(0,0,4,0,TAU);g.fill();g.globalCompositeOperation='lighter';g.globalAlpha=.6+.4*Math.sin(t*20);g.drawImage(glow('#ff6a2a'),-8,-18,16,16)}
    else{g.translate(x,y);g.rotate(a);g.globalCompositeOperation='lighter';g.strokeStyle=A.rgba(p[1],.9);g.lineWidth=3;g.beginPath();g.moveTo(-40,0);g.lineTo(0,0);g.stroke();g.fillStyle='#fff6d8';g.beginPath();g.ellipse(0,0,5,2.4,0,0,TAU);g.fill()}break}
   case'blast':{const x=e.x-cx,y=e.y-cy;g.globalAlpha=fade;g.globalCompositeOperation='lighter';const r=e.r*Math.min(1,u*2.2);const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.4,A.rgba(p[3],.6));gr.addColorStop(1,A.rgba(p[0],0));g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
    for(let i=0;i<6;i++){const q=i/6*TAU;A.gear(g,x+Math.cos(q)*r*.8,y+Math.sin(q)*r*.8,5,p[3],t*8+i)}break}
   case'moon':{const x=e.x-cx,y=e.y-cy,r=e.r*.42;g.globalCompositeOperation='lighter';g.globalAlpha=e.done?fade:1;g.drawImage(glow(p[0]),x-r*2.4,y-r*2.4,r*4.8,r*4.8);g.globalCompositeOperation='source-over';g.beginPath();g.arc(x,y,r,0,TAU);const gr=g.createRadialGradient(x-r*.3,y-r*.3,2,x,y,r);gr.addColorStop(0,'#ffd0d8');gr.addColorStop(.5,p[0]);gr.addColorStop(1,p[2]);g.fillStyle=gr;g.fill();g.strokeStyle=A.OL;g.lineWidth=2;g.stroke();
    g.fillStyle=A.rgba(p[2],.5);for(const[a,b,rr]of[[-.3,-.2,.18],[.25,.15,.22],[-.1,.35,.12]]){g.beginPath();g.arc(x+a*r,y+b*r,rr*r,0,TAU);g.fill()}if(e.done){g.globalCompositeOperation='lighter';g.beginPath();g.ellipse(x,e.y1-cy+T*.6,e.r*u*1.4,e.r*u*.35,0,0,TAU);g.strokeStyle=A.rgba(p[1],.8);g.lineWidth=4;g.stroke()}break}
   case'soul':{const x=e.x-cx,y=e.y-cy;g.globalCompositeOperation='lighter';g.globalAlpha=.9;g.drawImage(glow(p[1]),x-12,y-12,24,24);g.fillStyle='#ffffff';g.beginPath();g.arc(x,y,3,0,TAU);g.fill();break}
   case'reap':{const x=e.x-cx,y=e.y-cy;g.globalAlpha=fade;g.globalCompositeOperation='lighter';g.beginPath();g.arc(x,y,T*2.8,e.aim-1.25,e.aim+1.25);g.arc(x,y,T*1.6,e.aim+1.25,e.aim-1.25,true);g.closePath();g.fillStyle=A.rgba(p[0],.35);g.fill();g.beginPath();g.arc(x,y,T*2.85,e.aim-1.25,e.aim+1.25);g.strokeStyle='#ffffff';g.lineWidth=2;g.stroke();break}
   case'chainlt':{g.globalAlpha=fade;g.globalCompositeOperation='lighter';let s=e.seed;const rn=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=1;i<e.pts.length;i++){const a=e.pts[i-1],b=e.pts[i];g.beginPath();g.moveTo(a.x-cx,a.y-cy);for(let j=1;j<6;j++){const k2=j/6;g.lineTo(a.x+(b.x-a.x)*k2-cx+(rn()-.5)*24,a.y+(b.y-a.y)*k2-cy+(rn()-.5)*24)}g.lineTo(b.x-cx,b.y-cy);
     g.strokeStyle=A.rgba(p[0],.6);g.lineWidth=8;g.stroke();g.strokeStyle='#ffffff';g.lineWidth=2.4;g.stroke();g.drawImage(glow(p[0]),b.x-cx-26,b.y-cy-26,52,52)}break}
   case'wave':{if(e.fx==null)break;const x=e.fx-cx,y=e.y-cy;g.globalAlpha=fade;g.globalCompositeOperation='lighter';g.beginPath();g.moveTo(x-e.dir*T*1.6,y);g.quadraticCurveTo(x-e.dir*T*.4,y-T*1.1,x,y-T*1.3);g.lineTo(x,y);g.closePath();const gr=g.createLinearGradient(x-e.dir*T*1.6,0,x,0);gr.addColorStop(0,A.rgba(p[0],0));gr.addColorStop(1,A.rgba(p[0],.8));g.fillStyle=gr;g.fill();
    A.bolt(g,x,y-T*1.2,T*1.1,Math.PI/2,p[3],((t*30)|0)+(e.dir>0?1:5));break}
   case'storm':{const x=e.x-cx,y=e.y-cy,a=Math.min(1,e.t/.25)*fade;g.globalAlpha=a*.95;for(let i=0;i<7;i++){const ox=(i-3)*e.r*.3,oy=Math.sin(i*1.7)*8;g.fillStyle=i%2?'#2a2c3a':'#3a3c4c';g.beginPath();g.arc(x+ox,y+oy,e.r*.28,0,TAU);g.fill()}g.globalCompositeOperation='lighter';g.globalAlpha=a*(.3+.3*Math.sin(t*14));g.drawImage(glow(p[0]),x-e.r,y-e.r*.6,e.r*2,e.r*1.2);
    g.globalAlpha=1;for(const b of e.bolts){let s=b.seed;const rn=()=>(s=(s*16807)%2147483647)/2147483647;g.beginPath();g.moveTo(b.x-cx+(rn()-.5)*20,y);for(let j=1;j<=6;j++)g.lineTo(b.x-cx+(rn()-.5)*24*(1-j/6),y+(b.y-cy-y)*j/6);g.strokeStyle=A.rgba(p[0],.6);g.lineWidth=7;g.stroke();g.strokeStyle='#ffffff';g.lineWidth=2;g.stroke()}break}
   case'whirl':{const x=P.x-cx,y=P.y+P.h/2-cy;g.globalAlpha=fade;g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){g.beginPath();g.arc(x,y,T*(1.1+i*.3),t*14+i*2,t*14+i*2+Math.PI*1.2);g.strokeStyle=A.rgba(i?p[1]:p[0],.75-i*.2);g.lineWidth=8-i*2;g.stroke()}break}
   case'crater':{const x=e.x-cx,y=e.y-cy;g.globalAlpha=fade;g.globalCompositeOperation='lighter';g.beginPath();g.ellipse(x,y,T*2.3*Math.min(1,u*2),T*.5*Math.min(1,u*2),0,0,TAU);g.strokeStyle=A.rgba(p[0],.85);g.lineWidth=5;g.stroke();g.globalCompositeOperation='source-over';for(let i=0;i<6;i++){const q=i/6*Math.PI;A.crystal(g,x+Math.cos(q)*T*1.4*(i%2?1:-1),y+2,T*(.5+u*.4),(i-3)*.2,A.mix(p[2],'#8a6a5a',.5))}break}
   case'smoke':{const x=e.x-cx,y=e.y-cy;g.globalAlpha=(1-u)*.85;for(let i=0;i<6;i++){const q=i/6*TAU;A.ink(g,x+Math.cos(q)*u*30,y+Math.sin(q)*u*22,10+u*10,'#0c0e16',i*7)}break}
   case'orbit':for(const it of e.its){if(e.rel||it.x==null)continue;A.shuriken(g,it.x-cx,it.y-cy,8,t*20,'#cfe8f8')}break;
   case'clones':for(const c of e.cl){if(c.x==null)continue;const x=c.x-cx,y=c.y-cy;g.globalAlpha=fade*.85;g.fillStyle='#0a0c14';g.beginPath();g.ellipse(x,y,9,24,0,0,TAU);g.fill();g.beginPath();g.arc(x,y-26,8,0,TAU);g.fill();g.fillStyle=p[0];g.fillRect(x-6,y-28,12,2.4);
    g.globalCompositeOperation='lighter';g.strokeStyle=A.rgba(p[0],.7);g.lineWidth=5;g.beginPath();g.moveTo(c.x0-cx,c.y0-cy);g.lineTo(x,y);g.stroke();g.globalCompositeOperation='source-over'}break;
   case'root':{const x=e.x-cx,y=e.y-cy,gr=Math.min(1,e.t/.2);g.globalAlpha=fade;g.strokeStyle='#2a5a1a';g.lineWidth=4;g.lineCap='round';for(let i=0;i<3;i++){const s=i-1;g.beginPath();g.moveTo(x+s*10,y);g.bezierCurveTo(x+s*22,y-20*gr,x-s*14,y-34*gr,x+s*6,y-48*gr);g.stroke()}A.rose(g,x,y-48*gr,5,p[3]);for(let i=0;i<3;i++)A.leaf(g,x+(i-1)*12,y-22*gr,7,(i-1)*.9-1.57,p[0]);break}
   case'whip':{if(e.x1==null)break;const x0=e.ox-cx,y0=e.oy-cy,x1=e.x1-cx,y1=e.y1-cy,mxp=(x0+x1)/2,myp=(y0+y1)/2-18;g.strokeStyle='#2a5a1a';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(mxp,myp,x1,y1);g.stroke();g.strokeStyle=p[0];g.lineWidth=1.6;g.stroke();
    for(let i=1;i<6;i++){const k2=i/6,x=(1-k2)*(1-k2)*x0+2*(1-k2)*k2*mxp+k2*k2*x1,y=(1-k2)*(1-k2)*y0+2*(1-k2)*k2*myp+k2*k2*y1;A.leaf(g,x,y,6,i,p[0])}A.rose(g,x1,y1,6,p[3]);break}
   case'bloomfx':{const x=e.x-cx,y=e.y-cy;g.globalAlpha=fade;for(let i=0;i<10;i++){const q=i/10*TAU,r=T*3*Math.min(1,u*1.6);A.rose(g,x+Math.cos(q)*r,y+Math.sin(q)*r*.5,5,i%2?p[3]:'#ffffff')}g.globalCompositeOperation='lighter';g.globalAlpha=fade*.5;g.drawImage(glow(p[0]),x-50,y-50,100,100);break}
  }g.restore()}
 return{cast,tick,draw,frame,mod,on,buff,MV,has:n=>OWN.has(n)}})();
