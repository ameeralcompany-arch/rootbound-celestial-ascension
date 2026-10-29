// ===== V6 interactive objects: one reusable system for doors, portals, chests, signs, lamps, switches, stations ... =====
// Objects are special tile ids (20-39). Their config/state lives in OBJ (key -> object), is saved inside the world's edits (edits.o),
// synced with the 'o' room message, and validated by the room host. Rendering/animation is data-driven from ODEF.
const ODEF={
 20:{k:'door_wood',n:'Oak Door',cat:'door',c:'#a8743f',hard:4,price:30,th:'#7a4f26',tr:'door'},
 21:{k:'door_stone',n:'Stone Gate',cat:'door',c:'#8a8f98',hard:6,price:60,th:'#5a5f68',tr:'door'},
 22:{k:'door_metal',n:'Steel Hatch',cat:'door',c:'#9fb0c4',hard:7,price:120,th:'#5a6a80',tr:'door'},
 23:{k:'portal',n:'Magic Portal',cat:'door',c:'#a46bff',hard:5,price:300,th:'#a46bff',tr:'portal',light:'#a46bff'},
 24:{k:'door_future',n:'Neon Gate',cat:'door',c:'#4af0ff',hard:6,price:220,th:'#4af0ff',tr:'tech',light:'#4af0ff'},
 25:{k:'door_rare',n:'Starlit Gate',cat:'door',c:'#ffd36a',hard:8,price:900,th:'#ffd36a',tr:'portal',light:'#ffd36a',rare:1},
 26:{k:'door_sealed',n:'Sealed Gate',cat:'door',c:'#6a3aa8',hard:9,price:600,th:'#9a6bff',tr:'door',light:'#9a6bff',special:1},
 27:{k:'chest',n:'Treasure Chest',cat:'cont',c:'#b5763a',hard:4,price:80},
 28:{k:'sign',n:'Signpost',cat:'misc',c:'#c8a060',hard:2,price:12},
 29:{k:'lamp',n:'Lantern',cat:'light',c:'#ffd878',hard:2,price:40,light:'#ffcf6a'},
 30:{k:'switch',n:'Lever',cat:'dev',c:'#c0c8d8',hard:3,price:50},
 31:{k:'plate',n:'Pressure Plate',cat:'dev',c:'#8a8f98',hard:3,price:40},
 32:{k:'tele',n:'Teleport Pad',cat:'tele',c:'#7ff0ff',hard:4,price:250,light:'#7ff0ff'},
 33:{k:'bench',n:'Crafting Table',cat:'station',c:'#9a6a38',hard:5,price:90},
 34:{k:'crate',n:'Storage Crate',cat:'cont',c:'#a07a48',hard:4,price:40},
 35:{k:'dummy',n:'Training Dummy',cat:'misc',c:'#d8c080',hard:5,price:60},
 36:{k:'waystone',n:'Waystone',cat:'misc',c:'#9fd8ff',hard:6,price:200,light:'#9fd8ff'},
 37:{k:'seat',n:'Bench',cat:'deco',c:'#8a5a30',hard:3,price:25},
 38:{k:'banner',n:'Banner',cat:'deco',c:'#b3263a',hard:2,price:20},
 39:{k:'wx_blossom',n:'Blossom Weather Machine',cat:'wx',c:'#f2a1bd',hard:6,price:900,th:'#f6a9c4',light:'#ffb8d2',wx:'blossom',rare:0},
 40:{k:'wx_space',n:'Space Weather Machine',cat:'wx',c:'#5b6ad8',hard:7,price:1600,th:'#7f8cff',light:'#8da0ff',wx:'space'},
 41:{k:'wx_galaxy',n:'Galaxy Weather Machine',cat:'wx',c:'#a55bd8',hard:8,price:3200,th:'#e08cff',light:'#d89bff',wx:'galaxy',rare:1}};
for(const id in ODEF){const d=ODEF[id];BLK[id]=[d.n,d.c,d.hard];PRICE[id]=d.price;SOLID6[id]=0}
MAT[230]={n:'Gate Key',c:'#ffd36a',p:60};MAT[231]={n:'Star Shard',c:'#fff3a8',p:90};
// storage chest colours (CHEST6 settings): [name, body, lid]
const CHCOL=[['Oak','#8a5a28','#a8743f'],['Ruby','#7a2230','#b8404f'],['Sky','#25507e','#4a86c0'],['Moss','#33602a','#5a9644'],['Plum','#4e2678','#8248b8'],['Gold','#80601a','#d0a038']];
const OBJ={};const OBJ_IDS=Object.keys(ODEF).map(Number);
const isObjId=b=>(b>=20&&b<=41||b>=85&&b<=89)&&!!ODEF[b]; // 85-89: the v9 weather machines (94-z-wxmachines.js)
const ROLE={BAN:-1,VIS:0,TRUST:1,BUILD:2,OWN:3};
function roleOf(uid){if(!meta)return ROLE.OWN;if(meta.b&&meta.b.includes(uid))return ROLE.BAN;if(meta.o==uid)return ROLE.OWN;if((meta.f||[]).includes(uid)||meta.pub)return ROLE.BUILD;if((meta.t||[]).includes(uid))return ROLE.TRUST;return ROLE.VIS}
const myRole=()=>roleOf(myId);
function objDefaults(t){const d=ODEF[t];if(!d)return null;const c={};
 if(d.cat=='door'){Object.assign(c,{nm:d.n,dt:'w',d:'plaza',lb:'',ac:0,kr:d.special?1:0,kc:d.special?1:0,lv:0,sw:0})}
 else if(d.cat=='cont'){Object.assign(c,{it:[],ac:2,dp:2,nm:d.n})}
 else if(d.k=='sign')c.tx='Welcome!';else if(d.k=='tele')Object.assign(c,{lb:'A',ac:0});else if(d.k=='waystone')c.nm='Waystone';else if(d.k=='lamp')c.on=1;else if(d.cat=='wx')c.ac=2;
 return{t:t,c:c,s:{}}}
function cleanObj(o){if(!o||typeof o!='object')return null;const t=o.t|0;if(!ODEF[t])return null;const d=ODEF[t],i=(v,lo,hi,df)=>{v=+v;return Number.isFinite(v)?Math.max(lo,Math.min(hi,v|0)):df},s=(v,n)=>String(v==null?'':v).slice(0,n).replace(/[<>]/g,''),c=o.c||{},r=objDefaults(t);
 if(d.cat=='door'){const w=String(c.d||'plaza').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16);Object.assign(r.c,{nm:s(c.nm||d.n,16),dt:['w','s','l'].includes(c.dt)?c.dt:'w',d:w||'plaza',lb:s(c.lb,12).replace(/[^A-Za-z0-9_ -]/g,''),ac:i(c.ac,0,3,0),kr:c.kr?1:0,kc:c.kc?1:0,lv:i(c.lv,0,999,0),sw:c.sw?1:0})}
 else if(d.cat=='cont'){r.c.nm=s(c.nm||d.n,16);r.c.ac=i(c.ac,0,3,2);r.c.dp=i(c.dp,0,3,2);r.c.col=i(c.col,0,CHCOL.length-1,0);/* v8: up to 24 slots, one stack per item type (duplicates from old data merge, never dropped) */const m=new Map();for(const x of(Array.isArray(c.it)?c.it:[]).slice(0,60)){if(!Array.isArray(x))continue;const a=i(x[0],1,999,0),b=i(x[1],1,9999,0);if(a&&b)m.set(a,(m.get(a)||0)+b)}r.c.it=[];for(const[a,b]of m){let n=b;while(n>0&&r.c.it.length<24){r.c.it.push([a,Math.min(9999,n)]);n-=9999}}}
 else if(d.k=='sign')r.c.tx=s(c.tx,80);else if(d.k=='tele'){r.c.lb=s(c.lb,12).replace(/[^A-Za-z0-9_ -]/g,'');r.c.ac=i(c.ac,0,3,0)}else if(d.k=='waystone')r.c.nm=s(c.nm,16);else if(d.k=='lamp')r.c.on=c.on?1:0;else if(d.cat=='wx')r.c.ac=i(c.ac,0,3,2);
 const st=o.s||{};r.s={on:st.on?1:0};return r}
const OBJ6=(()=>{
 const now=()=>performance.now();let sweepT=0;
 function emit(m){if(rm){try{rm.emit('o',m)}catch(_){}}}
 function persist(){edits.o=OBJ;dirty=1}
 function load(e,only){if(!e||typeof e!='object')return;for(const k of Object.keys(e)){const kk=+k;if(!(kk>=0&&kk<W*H))continue;if(only&&OBJ[kk])continue;const o=cleanObj(e[k]);if(o)OBJ[kk]=o}edits.o=OBJ}
 function clean(e){const out={};if(!e||typeof e!='object')return out;let n=0;for(const k of Object.keys(e)){if(++n>1500)break;const kk=+k;if(!Number.isInteger(kk)||kk<0||kk>=W*H)continue;const o=cleanObj(e[k]);if(o)out[kk]=o}return out}
 function reset(){for(const k in OBJ)delete OBJ[k];edits.o=OBJ}
 // tile<->object consistency (placement from any peer, breaking, undo)
 function sync(k){const b=tiles[k];if(isObjId(b)){if(!OBJ[k]||OBJ[k].t!=b){OBJ[k]=objDefaults(b);persist();emit({op:'cfg',k,v:OBJ[k]});return true}}else if(OBJ[k]){delete OBJ[k];persist()}return false}
 function sweep(){for(const k of Object.keys(OBJ)){const b=tiles[+k];if(!isObjId(b)||b!=OBJ[k].t)delete OBJ[k]}if(entered)for(let k=0;k<W*H;k++){} }
 const _pe=pushEdit;pushEdit=function(k){_pe(k);try{const ch=sync(k);if(ch&&isObjId(tiles[k]))VFX.wave(k%W*T+T/2,(k/W|0)*T+T,ODEF[tiles[k]].c,60,.4,.3)}catch(_){}};
 const _ae=applyEdit;applyEdit=function(k,a){_ae(k,a);try{const b=tiles[k];if(isObjId(b)){if(!OBJ[k]||OBJ[k].t!=b)OBJ[k]=objDefaults(b)}else if(OBJ[k])delete OBJ[k]}catch(_){}};
 const _lw=loadWorld;loadWorld=function(n,e){reset();try{DOORS6&&DOORS6.cancel()}catch(_){}_lw(n,e);try{sweepLate()}catch(_){}};
 function sweepLate(){const m=Object.keys(OBJ);for(const k of m)if(!isObjId(tiles[+k])||tiles[+k]!=OBJ[k].t)delete OBJ[k];for(let k=0;k<W*H;k++){const b=tiles[k];if(b>=20&&isObjId(b)&&!OBJ[k])OBJ[k]=objDefaults(b)}edits.o=OBJ;
  // world spawn: Waystone / meta spawn
  const sp=spawnPoint();if(sp&&cur!='plaza'){P.x=sp.x;P.y=sp.y}}
 function spawnPoint(){if(meta&&meta.sp){const x=meta.sp.x,y=meta.sp.y;return{x:x*T+T/2,y:y*T+T-P.h-1}}for(const k in OBJ)if(OBJ[k].t==36){const x=k%W,y=k/W|0;return{x:x*T+T/2,y:y*T+T-P.h-1}}return null}
 // ---- permissions
 const need=o=>{const d=ODEF[o.t];return d.cat=='door'||d.cat=='tele'||d.cat=='wx'?o.c.ac|0:d.cat=='cont'?o.c.ac|0:d.k=='lamp'||d.k=='switch'?ROLE.TRUST:ROLE.VIS};
 const canUse=(o,uid)=>{const r=roleOf(uid);return r>ROLE.BAN&&r>=need(o)||!meta};
 const canConfig=uid=>{const r=roleOf(uid);return r>=ROLE.BUILD||!meta};
 // ---- network
 const pend={};
 function remote(d,from){if(!d||typeof d.op!='string')return;const k=d.k|0;if(!(k>=0&&k<W*H))return;
  if(d.op=='cfg'){const v=cleanObj(d.v);if(v&&tiles[k]==v.t){OBJ[k]=v;persist()}return}
  if(d.op=='st'){const o=OBJ[k];if(!o)return;o.s.on=d.s&&d.s.on?1:0;if(ODEF[o.t].k=='lamp')o.c.on=o.s.on;if(d.s&&d.s.open)o._op=now();persist();feedback(o,k,false);return}
  if(d.op=='res'){const rid=String(d.rid||'');if(d.v){const v=cleanObj(d.v);if(v&&tiles[k]==v.t){OBJ[k]=v;persist()}}const p=pend[rid];if(!p||d.by!=myId)return;delete pend[rid];if(!d.ok){say(d.m||'Could not do that');return}if(d.mode=='take'){addI(d.i,d.n);say('Took '+d.n+' x '+itemName(d.i));sfx('pick')}else{addI(d.i,-d.n);sfx('put')}try{UI6.chestRefresh&&UI6.chestRefresh()}catch(_){}}}
 // ---- chest operations (host/solo apply directly, guests ask the host and only receive items when it confirms)
 function chestOp(k,op,it,n){const o=OBJ[k];if(!o)return;n=Math.max(1,n|0);
  if(op=='put'&&cnt(it)<n){say('You do not have that');return}
  if(!rm||rm.isHost){const uid=myId;if(op=='take'){if(!canUse(o,uid)){say('You are not allowed to take from this');return}const slot=o.c.it.find(x=>x[0]==it);if(!slot||slot[1]<n){say('Not there anymore');return}slot[1]-=n;o.c.it=o.c.it.filter(x=>x[1]>0);addI(it,n);say('Took '+n+' x '+itemName(it));sfx('pick')}
   else{if(meta&&roleOf(uid)<(o.c.dp|0)){say('You may not store items here');return}const slot=o.c.it.find(x=>x[0]==it);if(!slot&&o.c.it.length>=12){say('Chest is full');return}addI(it,-n);if(slot)slot[1]=Math.min(9999,slot[1]+n);else o.c.it.push([it,n]);sfx('put')}
   persist();if(rm)emit({op:'cfg',k,v:{t:o.t,c:o.c,s:o.s}});try{UI6.chestRefresh&&UI6.chestRefresh()}catch(_){}return}
  const rid=Math.random().toString(36).slice(2,10);pend[rid]=now();setTimeout(()=>delete pend[rid],6000);emit({op,k,i:it,n,rid})}
 const itemName=i=>MAT[i]?MAT[i].n:BLK[i%100]?BLK[i%100][0]+(i>=100&&i<200?' Seed':''):'Item '+i;
 // ---- state changes (lamp/switch/door animation)
 function setState(k,s){const o=OBJ[k];if(!o)return;if(!rm||rm.isHost){if(ODEF[o.t].k=='lamp'||ODEF[o.t].k=='switch'){o.s.on=s.on?1:0;if(ODEF[o.t].k=='lamp')o.c.on=o.s.on}if(s.open)o._op=now();persist();if(rm)emit({op:'st',k,s:{on:o.s.on,open:s.open?1:0},by:myId})}else emit({op:'st',k,s})}
 function configure(k,v){const o=OBJ[k];if(!o)return false;if(!canConfig(myId)){say('Only the owner and builders can configure this');return false}const c=cleanObj({t:o.t,c:v,s:o.s});if(!c)return false;if(ODEF[o.t].cat=='cont')c.c.it=o.c.it;OBJ[k]=c;persist();if(!rm||rm.isHost){if(rm)emit({op:'cfg',k,v:c})}else emit({op:'cfg',k,v:c});return true}
 // ---- feedback
 let lastSfx={};function sfx(n){const t=now();if(t-(lastSfx[n]||0)<90)return;lastSfx[n]=t;try{({open:()=>{noise(.16,500,.12);snd(180,.18,'triangle',.06,1.6)},close:()=>{snd(150,.1,'square',.05,.6)},stone:()=>{noise(.35,200,.18);snd(70,.35,'sawtooth',.08,.7)},metal:()=>{snd(500,.12,'square',.05,.5);snd(260,.3,'sawtooth',.05,.7)},portal:()=>{snd(300,.6,'sine',.08,3);snd(450,.7,'triangle',.05,2.2)},tech:()=>{snd(900,.12,'square',.04,1.8);snd(1300,.2,'sine',.04,.6)},star:()=>{snd(880,.5,'triangle',.07,1.5);snd(1320,.6,'sine',.05,1.3)},lock:()=>{snd(120,.2,'square',.07,.5);snd(220,.1,'square',.05)},click:()=>{snd(700,.05,'square',.05,.6)},pick:()=>{snd(660,.08,'triangle',.05,1.4)},put:()=>{snd(300,.08,'triangle',.05,.7)},craft:()=>{snd(420,.1,'square',.05,1.3);noise(.08,1800,.07)},ok:()=>{snd(660,.14,'triangle',.07);snd(990,.2,'triangle',.06)},bad:()=>{snd(160,.2,'sawtooth',.06,.6)}})[n]()}catch(_){}}
 function feedback(o,k,local){const d=ODEF[o.t],x=k%W*T+T/2,y=(k/W|0)*T+T;if(d.cat=='door'){o._op=now();sfx(d.k=='door_stone'?'stone':d.k=='door_metal'?'metal':d.tr=='portal'?(d.rare?'star':'portal'):d.tr=='tech'?'tech':'open');VFX.burst(x,y-28,[d.th,'#fff'],d.tr=='portal'?14:6,d.tr=='portal'?180:90,d.tr=='portal'?1:0,.6,d.tr=='portal'?12:8)}else if(d.cat=='cont'){o._op=now();sfx('open');VFX.mote(x,y-30,'#ffd24a')}else if(d.k=='lamp'||d.k=='switch'){sfx('click');VFX.wave(x,y-20,d.c,40,.3,.5)}}
 // ---- queries
 function near(){if(!entered)return null;const px=P.x,py=P.y+P.h/2;let best=null,bd=1e9;for(const k in OBJ){const o=OBJ[k],x=k%W*T+T/2,y=(k/W|0)*T+T/2,dx=Math.abs(px-x),dy=Math.abs(py-y);if(dx<T*1.7&&dy<T*1.9){const d=dx+dy*.5;if(d<bd){bd=d;best={k:+k,o}}}}return best}
 function dummyHit(){/* training dummy: reacts to weapon swings (client-side feedback) */for(const k in OBJ){const o=OBJ[k];if(o.t!=35)continue;const x=k%W*T+T/2,y=(k/W|0)*T;if(Math.abs(P.x-x)<T*2.2&&Math.abs(P.y+P.h/2-y)<T*1.5&&((P.f>0&&x>P.x-10)||(P.f<0&&x<P.x+10))){o._hit=now();const dmg=Math.round(8+Math.random()*10+(bonus().dmg||0)*10);ft(x,y-30,String(dmg),'#fff');VFX.hit(x,y+10,'#ffe08a',Math.random()<.15);sfx('click');try{xpGain('fight',1)}catch(_){}}}}
 let lastSw=0;
 function tick(dt){if(!entered)return;if(swing>0.18&&lastSw<=.18)dummyHit();lastSw=swing;sweepT-=dt;if(sweepT<=0){sweepT=3;for(const k of Object.keys(OBJ)){const b=tiles[+k];if(!isObjId(b)||b!=OBJ[k].t)delete OBJ[k]}}
  // plates: pressed while any player stands on them
  for(const k in OBJ){const o=OBJ[k];if(o.t!=31)continue;const x=k%W*T+T/2,y=(k/W|0)*T;let on=Math.abs(P.x-x)<T*.6&&Math.abs(P.y+P.h-(y+T))<T*.5;if(!on&&rm)for(const pe of rm.peers()){const q=pe.presence;if(pe.isMe||!q)continue;if(Math.abs(q.x-x)<T*.6&&Math.abs(q.y+54-(y+T))<T*.5)on=true}if(!!o.s.on!=on){o.s.on=on?1:0;o._op=now();sfx('click')}}}
 // ---- drawing (called after NPCs, before characters, so players walk in front of doors and signs)
 const rnd2=(a,b)=>a+Math.random()*(b-a);
 function draw(nowT){if(!entered)return;const t=nowT/1000,vw=cv.width/ZM,vh=cv.height/ZM,x0=cam.x-80,x1=cam.x+vw+80,y0=cam.y-120,y1=cam.y+vh+80;const near0=near();
  for(const k in OBJ){const o=OBJ[k],d=ODEF[o.t];if(!d)continue;const bx=k%W*T,by=(k/W|0)*T;if(bx<x0||bx>x1||by<y0||by>y1)continue;const px=bx-cam.x,py=by-cam.y;
   const open=o._op?Math.max(0,Math.min(1,1-(nowT-o._op-1100)/450,(nowT-o._op)/380)):0,sel=near0&&near0.k==+k;
   g.save();g.translate(px,py+T);try{ART[d.k]?ART[d.k](g,o,d,t,open,sel):0}catch(_){}g.restore();
   if(d.light&&(o.t!=29||o.s.on||o.c.on)&&lampL.length<70){lampL.push(px+T/2,py+T/2)}
   if(d.light&&QM.cur.wfx>=1&&Math.random()<.02*QM.vfxK&&(o.t!=29||o.c.on))VFX.mote(bx+T/2+rnd2(-12,12),by+T-rnd2(10,40),d.light)}
 }
 function beatsNpc(n,npc){if(!npc)return true;const ox=Math.abs(P.x-(n.k%W*T+T/2)),nx=Math.abs(P.x-(npc.x*T+T/2));return ox<=nx+4}
 function promptText(npc){const n=near();if(!n||!beatsNpc(n,npc))return '';const o=n.o,d=ODEF[o.t];const nm=(o.c&&o.c.nm)||d.n;let a='use';if(d.cat=='door')a='enter '+nm+(o.c.dt=='w'?' → '+(o.c.d||'?'):o.c.dt=='s'?' → spawn':' → '+(o.c.lb||'?'));else if(d.cat=='cont')a='open '+nm;else if(d.cat=='tele')a='teleport ('+(o.c.lb||'?')+')';else if(d.k=='sign')a='read sign';else if(d.k=='lamp'||d.k=='switch')a='toggle '+nm;else if(d.cat=='station')a='craft';else if(d.k=='waystone')a='bind spawn';else if(d.k=='seat')a='rest';else if(d.k=='dummy')a='';else return '';return a?'Press E to '+a+(canConfig(myId)&&(d.cat=='door'||d.cat=='tele'||d.cat=='cont'||d.k=='sign')?'  ·  G to configure':''):''}
 return{beatsNpc,promptText,load,clean,reset,sync,remote,setState,configure,chestOp,near,tick,draw,roleOf,canUse,canConfig,sfx,feedback,itemName,spawnPoint,need,get OBJ(){return OBJ}}})();
// ---------------- art (origin = bottom-left of the object's tile; y up is negative) ----------------
const ART=(()=>{const A={};const O='#140c1c';
 const ol=g=>{g.strokeStyle=O;g.lineWidth=1.6;g.lineJoin='round'};
 const door=(g,o,d,t,op,sel,body)=>{ // shared frame + glow
  g.save();if(sel){g.shadowColor=d.th;g.shadowBlur=14}body(g,op,t);g.restore();
  if(sel||op>0){g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(T/2,-30,4,T/2,-30,48);gr.addColorStop(0,d.th+(op>0?'aa':'55'));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(-20,-90,T+40,100);g.restore()}};
 A.door_wood=(g,o,d,t,op,sel)=>door(g,o,d,t,op,sel,(g,op)=>{ol(g);g.fillStyle='#3a2410';g.fillRect(4,-78,40,78);g.strokeRect(4,-78,40,78);
  g.fillStyle='#ffcf7a';g.globalAlpha=op;g.fillRect(8,-74,32,74);g.globalAlpha=1; // light spilling from inside
  const w=Math.max(4,32*(1-op*.88));g.fillStyle='#a8743f';g.fillRect(8,-74,w,74);g.strokeRect(8,-74,w,74);g.strokeStyle='#6e4a24';g.lineWidth=1;for(let i=1;i<4;i++){g.beginPath();g.moveTo(8+w*i/4,-74);g.lineTo(8+w*i/4,0);g.stroke()}g.fillStyle='#ffd24a';g.beginPath();g.arc(8+w-5,-36,2.2,0,6.3);g.fill();g.fillStyle='#5a3a1c';g.fillRect(2,-82,44,6);g.strokeStyle=O;g.strokeRect(2,-82,44,6)});
 A.door_stone=(g,o,d,t,op,sel)=>door(g,o,d,t,op,sel,(g,op)=>{ol(g);g.fillStyle='#1a1c24';g.fillRect(4,-78,40,78);g.save();g.beginPath();g.rect(6,-76,36,76);g.clip();const y=-74*op;g.fillStyle='#8a8f98';g.fillRect(6,-76+(-y*-1)*-1+0,36,74);g.restore();
  g.save();g.beginPath();g.rect(6,-76,36,76);g.clip();g.translate(0,-72*op);g.fillStyle='#8a8f98';g.fillRect(6,-76,36,76);g.strokeStyle='#5a5f68';g.lineWidth=1;for(let r=0;r<6;r++){g.beginPath();g.moveTo(6,-76+r*13);g.lineTo(42,-76+r*13);g.stroke();for(let c=0;c<2;c++){g.beginPath();g.moveTo(14+c*14+(r%2)*6,-76+r*13);g.lineTo(14+c*14+(r%2)*6,-76+r*13+13);g.stroke()}}g.fillStyle='#c8ccd4';g.fillRect(6,-76,36,3);g.restore();
  g.fillStyle='#6a6f78';g.fillRect(0,-84,48,9);g.strokeRect(0,-84,48,9);g.fillRect(0,-78,7,78);g.fillRect(41,-78,7,78);g.strokeRect(0,-78,7,78);g.strokeRect(41,-78,7,78)});
 A.door_metal=(g,o,d,t,op,sel)=>door(g,o,d,t,op,sel,(g,op,t)=>{ol(g);g.fillStyle='#10141c';g.fillRect(4,-78,40,78);const gap=18*op;g.fillStyle='#9fb0c4';g.fillRect(4,-78,20-gap,78);g.fillRect(24+gap,-78,20-gap,78);g.strokeRect(4,-78,20-gap,78);g.strokeRect(24+gap,-78,20-gap,78);
  g.fillStyle='#5a6a80';for(let i=0;i<5;i++){g.fillRect(6,-74+i*16,3,3);g.fillRect(39,-74+i*16,3,3)}g.fillStyle='#ffcf3a';for(let i=0;i<4;i++){g.fillRect(4,-8+i*0-i*0,0,0)}g.fillStyle=op>.1?'#4aff7a':'#ff4a4a';g.shadowColor=g.fillStyle;g.shadowBlur=6;g.fillRect(21,-84,6,4);g.shadowBlur=0;g.fillStyle='#4a5a70';g.fillRect(0,-82,48,6)});
 A.portal=(g,o,d,t,op,sel)=>{const c=d.th,cx=T/2,cy=-38,R=30+op*6;g.save();g.translate(cx,cy);g.scale(.78,1.25);g.fillStyle='#0a0614';g.beginPath();g.arc(0,0,R,0,6.3);g.fill();g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){g.save();g.rotate(t*(i%2?-1.4:1.1)+i);const gr=g.createRadialGradient(0,0,2,0,0,R*(.95-i*.2));gr.addColorStop(0,'rgba(255,255,255,.85)');gr.addColorStop(.4,c+'cc');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.moveTo(0,0);for(let a=0;a<6.3;a+=.2){const rr=R*(.4+.6*Math.abs(Math.sin(a*2+t*2+i)))*(.9-i*.15);g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}g.closePath();g.fill();g.restore()}
  g.globalCompositeOperation='source-over';g.strokeStyle=c;g.lineWidth=4;g.shadowColor=c;g.shadowBlur=12+op*14;g.beginPath();g.arc(0,0,R,0,6.3);g.stroke();g.shadowBlur=0;g.lineWidth=1.5;g.strokeStyle='#fff';g.setLineDash([3,6]);g.lineDashOffset=-t*16;g.beginPath();g.arc(0,0,R+5,0,6.3);g.stroke();g.restore();if(sel){g.strokeStyle='#fff6';g.strokeRect(2,-80,44,80)}};
 A.door_future=(g,o,d,t,op,sel)=>door(g,o,d,t,op,sel,(g,op,t)=>{g.fillStyle='#071418';g.fillRect(4,-78,40,78);g.strokeStyle='#4af0ff';g.lineWidth=2;g.shadowColor='#4af0ff';g.shadowBlur=8;g.strokeRect(4,-78,40,78);g.shadowBlur=0;const gap=19*op;g.fillStyle='rgba(120,240,255,.28)';g.fillRect(5,-77,19-gap,76);g.fillRect(24+gap,-77,19-gap,76);g.strokeStyle='rgba(180,250,255,.8)';g.lineWidth=1;g.strokeRect(5,-77,19-gap,76);g.strokeRect(24+gap,-77,19-gap,76);
  const sy=-77+((t*60)%76);g.fillStyle='rgba(120,255,255,.5)';g.fillRect(5,sy,38,2);g.fillStyle='#4af0ff';g.beginPath();g.moveTo(24,-40);g.lineTo(18,-30);g.lineTo(30,-30);g.fill();g.fillStyle='#0a2a30';g.fillRect(0,-84,48,6);g.strokeStyle='#4af0ff';g.strokeRect(0,-84,48,6)});
 A.door_rare=(g,o,d,t,op,sel)=>{const c='#ffd36a';g.save();g.translate(T/2,-40);g.fillStyle='#0a0618';g.beginPath();g.moveTo(-22,40);g.lineTo(-22,-14);g.quadraticCurveTo(-22,-44,0,-44);g.quadraticCurveTo(22,-44,22,-14);g.lineTo(22,40);g.closePath();g.fill();g.save();g.clip();g.fillStyle='#fff';for(let i=0;i<26;i++){const a=((i*37)%100)/100,b=((i*61)%100)/100,tw=.5+.5*Math.sin(t*3+i);g.globalAlpha=tw;g.fillRect(-22+a*44,-44+((b*90+t*(8+i%5*4))%88),1.6,1.6)}g.restore();g.globalAlpha=1;
  g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(0,-44,0,40);gr.addColorStop(0,'rgba(255,200,120,'+(.2+op*.5)+')');gr.addColorStop(1,'rgba(120,60,200,'+(.3+op*.4)+')');g.fillStyle=gr;g.fillRect(-22,-44,44,84);g.globalCompositeOperation='source-over';
  g.strokeStyle=c;g.lineWidth=3.5;g.shadowColor=c;g.shadowBlur=10+op*16;g.beginPath();g.moveTo(-24,42);g.lineTo(-24,-14);g.quadraticCurveTo(-24,-47,0,-47);g.quadraticCurveTo(24,-47,24,-14);g.lineTo(24,42);g.stroke();g.shadowBlur=0;g.fillStyle=c;for(const s of[-1,1]){for(let i=0;i<4;i++){g.beginPath();g.moveTo(s*24,-20+i*4);g.quadraticCurveTo(s*(32+i*6),-30+i*2,s*(38+i*7),-24+i*5);g.quadraticCurveTo(s*(30+i*5),-18+i*4,s*24,-16+i*4);g.globalAlpha=.9-i*.15;g.fill()}}g.globalAlpha=1;
  g.globalCompositeOperation='lighter';g.fillStyle='#fff';for(let i=0;i<4;i++){const a=t*1.6+i*1.57;g.beginPath();g.arc(Math.cos(a)*30,Math.sin(a)*30-10,2,0,6.3);g.fill()}g.restore()};
 A.door_sealed=(g,o,d,t,op,sel)=>door(g,o,d,t,op,sel,(g,op,t)=>{ol(g);g.fillStyle='#0c0814';g.fillRect(4,-78,40,78);g.fillStyle='#2a1f40';g.fillRect(6,-76,36,76);g.strokeRect(4,-78,40,78);g.save();g.globalCompositeOperation='lighter';g.strokeStyle='#9a6bff';g.shadowColor='#9a6bff';g.shadowBlur=8;g.lineWidth=1.4;for(let i=0;i<4;i++){g.beginPath();g.moveTo(14,-68+i*16);g.lineTo(34,-68+i*16);g.moveTo(24,-68+i*16);g.lineTo(24,-58+i*16);g.stroke()}g.restore();
  g.strokeStyle='#6a6f78';g.lineWidth=3;const br=op*20;g.beginPath();g.moveTo(4-br,-60);g.lineTo(44+br,-30);g.moveTo(4-br,-30);g.lineTo(44+br,-60);g.stroke();if(op<.3){g.fillStyle='#ffd36a';g.strokeStyle=O;g.lineWidth=1.4;g.beginPath();g.arc(24,-44,7,0,6.3);g.fill();g.stroke();g.fillStyle=O;g.fillRect(23,-46,2,6)}});
 A.chest=(g,o,d,t,op)=>{ol(g);const lid=Math.max(op,(o._open||0))*1.1,C=CHCOL[(o.c&&o.c.col)|0]||CHCOL[0];g.fillStyle=C[1];g.fillRect(6,-22,36,22);g.strokeRect(6,-22,36,22);g.fillStyle='#ffd24a';g.fillRect(6,-14,36,3);g.save();g.translate(6,-22);g.rotate(-lid);g.fillStyle=C[2];g.beginPath();g.moveTo(0,0);g.lineTo(36,0);g.lineTo(36,-10);g.quadraticCurveTo(18,-18,0,-10);g.closePath();g.fill();g.stroke();g.restore();if(lid>.2){g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,220,120,'+lid*.7+')';g.fillRect(8,-30,32,8);g.restore()}g.fillStyle='#ffd24a';g.fillRect(21,-17,6,6);g.strokeRect(21,-17,6,6)};
 A.crate=(g,o)=>{ol(g);g.fillStyle=o&&o.c&&o.c.col?CHCOL[o.c.col][2]:'#a07a48';g.fillRect(7,-34,34,34);g.strokeRect(7,-34,34,34);g.strokeStyle='#6a4a28';g.lineWidth=2;g.beginPath();g.moveTo(7,-34);g.lineTo(41,0);g.moveTo(41,-34);g.lineTo(7,0);g.stroke()};
 A.sign=(g,o)=>{ol(g);g.fillStyle='#6a4a28';g.fillRect(22,-26,5,26);g.fillStyle='#c8a060';g.fillRect(6,-44,36,22);g.strokeRect(6,-44,36,22);g.fillStyle='#3a2410';g.font='700 7px sans-serif';g.textAlign='center';const tx=(o.c.tx||'').slice(0,14);g.fillText(tx.slice(0,7),24,-34);g.fillText(tx.slice(7,14),24,-26);g.textAlign='left'};
 A.lamp=(g,o,d,t)=>{ol(g);g.fillStyle='#3a3a44';g.fillRect(22,-44,4,44);g.fillRect(16,-4,16,4);const on=o.c.on,fl=on?.85+.15*Math.sin(t*9+o.t)+.05*Math.sin(t*23):0;g.fillStyle=on?'#ffe08a':'#6a6a58';g.fillRect(15,-62,18,18);g.strokeRect(15,-62,18,18);g.fillStyle='#2a2a34';g.fillRect(13,-66,22,5);if(on){g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(24,-53,2,24,-53,52*fl);gr.addColorStop(0,'rgba(255,220,120,.7)');gr.addColorStop(1,'rgba(255,200,100,0)');g.fillStyle=gr;g.fillRect(-30,-110,108,110);g.restore()}};
 A.switch=(g,o,d,t,op)=>{ol(g);g.fillStyle='#4a4a58';g.fillRect(10,-12,28,12);g.strokeRect(10,-12,28,12);const a=o.s.on?.8:-.8,k=o._ang==null?a:(o._ang+=(a-o._ang)*.25);o._ang=k;g.save();g.translate(24,-10);g.rotate(k);g.strokeStyle='#c0c8d8';g.lineWidth=4;g.beginPath();g.moveTo(0,0);g.lineTo(0,-22);g.stroke();g.fillStyle=o.s.on?'#4aff7a':'#ff4a5a';g.shadowColor=g.fillStyle;g.shadowBlur=6;g.beginPath();g.arc(0,-24,4,0,6.3);g.fill();g.restore()};
 A.plate=(g,o)=>{ol(g);const p=o.s.on?3:0;g.fillStyle='#6a6f78';g.fillRect(4,-6+p,40,6-p);g.strokeRect(4,-6+p,40,6-p);g.fillStyle=o.s.on?'#4aff7a':'#aa4a4a';g.fillRect(14,-5+p,20,2)};
 A.tele=(g,o,d,t)=>{const c='#7ff0ff';g.save();g.translate(T/2,-4);g.scale(1,.3);g.fillStyle='#07181c';g.beginPath();g.arc(0,0,22,0,6.3);g.fill();g.strokeStyle=c;g.lineWidth=3;g.shadowColor=c;g.shadowBlur=10;g.beginPath();g.arc(0,0,22,0,6.3);g.stroke();g.rotate(t);g.lineWidth=1.5;g.beginPath();for(let i=0;i<=5;i++){const a=i/5*6.28;g[i?'lineTo':'moveTo'](Math.cos(a)*15,Math.sin(a)*15)}g.stroke();g.restore();g.save();g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(0,-4,0,-60);gr.addColorStop(0,'rgba(127,240,255,.55)');gr.addColorStop(1,'rgba(127,240,255,0)');g.fillStyle=gr;g.fillRect(T/2-16,-60,32,56);g.restore();g.fillStyle='#fff';g.font='700 8px sans-serif';g.textAlign='center';g.fillText(o.c.lb||'',T/2,-26);g.textAlign='left'};
 A.bench=(g)=>{ol(g);g.fillStyle='#7a4f26';g.fillRect(2,-24,44,6);g.strokeRect(2,-24,44,6);g.fillRect(6,-18,6,18);g.fillRect(36,-18,6,18);g.strokeRect(6,-18,6,18);g.strokeRect(36,-18,6,18);g.fillStyle='#c0c8d8';g.fillRect(14,-34,4,10);g.fillRect(28,-32,8,2);g.fillStyle='#ffd24a';g.fillRect(20,-28,6,4)};
 A.dummy=(g,o,d,t)=>{ol(g);const h=o._hit?Math.max(0,1-(performance.now()-o._hit)/500):0,w=Math.sin(performance.now()/60)*h*.35;g.fillStyle='#6a4a28';g.fillRect(22,-14,5,14);g.save();g.translate(24,-14);g.rotate(w);g.fillStyle='#d8c080';g.fillRect(-9,-34,18,30);g.strokeRect(-9,-34,18,30);g.beginPath();g.arc(0,-40,8,0,6.3);g.fill();g.stroke();g.fillRect(-18,-30,36,5);g.strokeRect(-18,-30,36,5);g.fillStyle='#b3263a';g.fillRect(-9,-22,18,3);g.restore()};
 A.waystone=(g,o,d,t)=>{ol(g);g.fillStyle='#6a7080';g.beginPath();g.moveTo(10,0);g.lineTo(14,-52);g.lineTo(24,-62);g.lineTo(34,-52);g.lineTo(38,0);g.closePath();g.fill();g.stroke();g.save();g.globalCompositeOperation='lighter';g.strokeStyle='#9fd8ff';g.shadowColor='#9fd8ff';g.shadowBlur=8;g.lineWidth=1.6;g.globalAlpha=.6+.4*Math.sin(t*2);g.beginPath();g.moveTo(24,-48);g.lineTo(24,-14);g.moveTo(18,-36);g.lineTo(30,-36);g.moveTo(18,-24);g.lineTo(30,-24);g.stroke();g.restore()};
 A.seat=A.bench;
 A.banner=(g,o,d,t)=>{ol(g);g.fillStyle='#4a3a28';g.fillRect(6,-70,36,4);g.fillStyle='#b3263a';g.beginPath();g.moveTo(10,-66);const sw=Math.sin(t*1.6)*3;g.lineTo(38,-66);g.lineTo(38+sw,-22);g.lineTo(24+sw*.5,-14);g.lineTo(10+sw,-22);g.closePath();g.fill();g.stroke();g.fillStyle='#ffd24a';g.beginPath();g.arc(24+sw*.5,-44,6,0,6.3);g.fill();g.fillStyle='#fff';g.fillRect(23+sw*.5,-52,2,16)};
 // ---- weather machines (distinct silhouettes: flower bloom / armillary ring / crystal galaxy sphere) ----
 const act=(o)=>{const a=o&&o._act?Math.max(0,1-(performance.now()-o._act)/1400):0;return a};
 const on=(d)=>{try{return ENV7.target==d.wx?1:0}catch(_){return 0}};
 A.wx_blossom=(g,o,d,t,op,sel)=>{const a=act(o),ac=on(d),cx=T/2;ol(g);
  // pedestal
  g.fillStyle='#f3dfe6';g.fillRect(8,-10,32,10);g.strokeRect(8,-10,32,10);g.fillStyle='#e3b6c6';g.fillRect(12,-16,24,6);g.strokeRect(12,-16,24,6);
  // vines + leaves
  g.strokeStyle='#5a8a5a';g.lineWidth=2.2;g.beginPath();g.moveTo(cx,-16);g.bezierCurveTo(cx-10,-34,cx+10,-44,cx,-62);g.stroke();g.fillStyle='#78b078';for(const[lx,ly,r]of[[-9,-30,-.6],[9,-42,.6],[-7,-50,-.5]]){g.save();g.translate(cx+lx,ly);g.rotate(r);g.beginPath();g.ellipse(0,0,7,3,0,0,6.3);g.fill();g.restore()}
  // glow
  g.save();g.globalCompositeOperation='lighter';const R=34+ac*10+a*16,gr=g.createRadialGradient(cx,-70,2,cx,-70,R);gr.addColorStop(0,'rgba(255,190,215,'+(.45+ac*.25+a*.3)+')');gr.addColorStop(1,'rgba(255,160,200,0)');g.fillStyle=gr;g.fillRect(cx-R,-70-R,R*2,R*2);g.restore();
  // bloom
  g.save();g.translate(cx,-70);g.rotate(t*.25+a*3);const sc=1+Math.sin(t*1.4)*.04+a*.25;g.scale(sc,sc);
  for(let i=0;i<5;i++){g.save();g.rotate(i*1.2566);const pg=g.createLinearGradient(0,0,0,-24);pg.addColorStop(0,'#e9779f');pg.addColorStop(.6,'#f7b3cb');pg.addColorStop(1,'#fff0f5');g.fillStyle=pg;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-13,-6,-12,-26,0,-26);g.bezierCurveTo(12,-26,13,-6,0,0);g.fill();g.stroke();g.restore()}
  g.fillStyle='#ffe38a';g.beginPath();g.arc(0,0,5,0,6.3);g.fill();g.stroke();g.fillStyle='#fff';for(let i=0;i<6;i++){g.beginPath();g.arc(Math.cos(i)*8*.7,Math.sin(i)*8*.7,1.1,0,6.3);g.fill()}g.restore();
  // drifting petals
  g.fillStyle='#ffd0e0';g.globalAlpha=.8;for(let i=0;i<4;i++){const ph=(t*.35+i*.25)%1;g.beginPath();g.ellipse(cx+Math.sin(ph*6+i)*18,-70+ph*62,2.6,1.4,ph*6,0,6.3);g.fill()}g.globalAlpha=1};
 A.wx_space=(g,o,d,t,op,sel)=>{const a=act(o),ac=on(d),cx=T/2;ol(g);
  g.fillStyle='#262b42';g.fillRect(6,-12,36,12);g.strokeRect(6,-12,36,12);g.fillStyle='#3a4266';g.fillRect(14,-26,20,14);g.strokeRect(14,-26,20,14);
  g.fillStyle='#7f8cff';g.shadowColor='#7f8cff';g.shadowBlur=6;for(let i=0;i<3;i++)g.fillRect(10+i*12,-6,8,2);g.shadowBlur=0;
  // pylon + antenna
  g.fillStyle='#1c2036';g.fillRect(21,-48,6,24);g.strokeRect(21,-48,6,24);g.strokeStyle='#8da0ff';g.lineWidth=1.4;g.beginPath();g.moveTo(24,-48);g.lineTo(24,-56);g.stroke();g.strokeStyle=O;g.lineWidth=1.6;
  // glow + armillary rings with a planet
  g.save();g.globalCompositeOperation='lighter';const R=32+ac*10+a*18,gr=g.createRadialGradient(cx,-70,2,cx,-70,R);gr.addColorStop(0,'rgba(120,140,255,'+(.4+ac*.25+a*.3)+')');gr.addColorStop(1,'rgba(90,70,220,0)');g.fillStyle=gr;g.fillRect(cx-R,-70-R,R*2,R*2);g.restore();
  g.save();g.translate(cx,-70);
  const pl=g.createRadialGradient(-4,-4,1,0,0,11);pl.addColorStop(0,'#bfe0ff');pl.addColorStop(.6,'#5a78e0');pl.addColorStop(1,'#1a1f6a');g.fillStyle=pl;g.beginPath();g.arc(0,0,10,0,6.3);g.fill();g.stroke();
  g.lineWidth=1.8;for(let i=0;i<3;i++){g.save();g.rotate(i*1.05+t*(.5+i*.2)*(1+a*3));g.scale(1,.34+.12*i);g.strokeStyle=i==1?'#c6a0ff':'#8da0ff';g.shadowColor=g.strokeStyle;g.shadowBlur=6;g.beginPath();g.arc(0,0,20+i*3,0,6.3);g.stroke();g.restore()}
  g.shadowBlur=0;g.fillStyle='#fff';const oa=t*1.4;g.beginPath();g.arc(Math.cos(oa)*23,Math.sin(oa)*8,2,0,6.3);g.fill();g.restore()};
 A.wx_galaxy=(g,o,d,t,op,sel)=>{const a=act(o),ac=on(d),cx=T/2;ol(g);
  // ornate gold/violet base
  g.fillStyle='#2b1d4a';g.fillRect(4,-12,40,12);g.strokeRect(4,-12,40,12);g.fillStyle='#d9b46a';g.fillRect(4,-14,40,3);g.fillRect(14,-24,20,5);g.strokeRect(14,-24,20,5);
  g.fillStyle='#e9d08a';for(const s of[-1,1]){g.beginPath();g.moveTo(cx+s*8,-24);g.quadraticCurveTo(cx+s*22,-30,cx+s*20,-50);g.quadraticCurveTo(cx+s*14,-34,cx+s*8,-30);g.closePath();g.fill();g.stroke()}
  // aura
  g.save();g.globalCompositeOperation='lighter';const R=40+ac*12+a*22,gr=g.createRadialGradient(cx,-70,2,cx,-70,R);gr.addColorStop(0,'rgba(255,150,230,'+(.5+ac*.25+a*.3)+')');gr.addColorStop(.5,'rgba(130,90,255,.25)');gr.addColorStop(1,'rgba(90,70,255,0)');g.fillStyle=gr;g.fillRect(cx-R,-70-R,R*2,R*2);g.restore();
  // crystal sphere with a swirling mini galaxy
  g.save();g.translate(cx,-70);const sp=g.createRadialGradient(-5,-6,2,0,0,17);sp.addColorStop(0,'#2a1a6a');sp.addColorStop(1,'#080420');g.fillStyle=sp;g.beginPath();g.arc(0,0,17,0,6.3);g.fill();
  g.save();g.beginPath();g.arc(0,0,16,0,6.3);g.clip();g.globalCompositeOperation='lighter';g.rotate(t*(.7+a*3));
  for(let arm=0;arm<3;arm++)for(let i=0;i<16;i++){const u=i/16,an=u*4.6+arm*2.09,r=u*15;g.fillStyle=u<.3?'rgba(255,240,210,.9)':u<.6?'rgba(255,150,230,.8)':'rgba(140,150,255,.8)';g.beginPath();g.arc(Math.cos(an)*r,Math.sin(an)*r*.8,1.3-u*.4,0,6.3);g.fill()}
  const cg=g.createRadialGradient(0,0,0,0,0,6);cg.addColorStop(0,'rgba(255,250,230,.95)');cg.addColorStop(1,'rgba(255,200,240,0)');g.fillStyle=cg;g.fillRect(-7,-7,14,14);g.restore();
  g.strokeStyle='#e9d08a';g.lineWidth=2;g.beginPath();g.arc(0,0,17,0,6.3);g.stroke();g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.2;g.beginPath();g.arc(0,0,13,3.5,4.6);g.stroke();
  // orbiting stars
  g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const an=t*(.9+i*.3)+i*2.1;g.fillStyle=['#fff','#ffb8ec','#a8b8ff'][i];g.beginPath();g.arc(Math.cos(an)*26,Math.sin(an)*10-2,2.2,0,6.3);g.fill()}g.restore()};

 return A})();
// static icon for inventory/hotbar
const OBJICON={};
function objIcon(id){if(OBJICON[id])return OBJICON[id];const d=ODEF[id],c=document.createElement('canvas');c.width=c.height=T;const x=c.getContext('2d');x.fillStyle='rgba(20,16,32,.6)';x.fillRect(0,0,T,T);x.save();x.translate(0,T-2);const o=objDefaults(id);const k=d.cat=='door'?.58:.9;x.translate(T/2*(1-k),0);x.scale(k,k);const og=g;g=x;try{ART[d.k](x,o,d,0.3,0,false)}catch(_){}finally{g=og}x.restore();return OBJICON[id]=c}
const _bs6=blockSprite;blockSprite=function(b,v){if(isObjId(b))return objIcon(b);return _bs6(b,v)};
const _dnp6=drawNPCs;drawNPCs=function(now){_dnp6(now);try{OBJ6.draw(now)}catch(e){if(!OBJ6.err){OBJ6.err=1;console.error(e)}}};
Object.assign(LVREQ,{39:8,40:16,41:28,20:2,21:6,22:10,23:8,24:12,25:25,26:15,27:3,29:2,30:4,31:4,32:9,33:3,35:3,36:5});
// breaking a chest spills everything inside it as drops (it used to vanish with the chest). v8: whatever does not fit in the
// drop list (spawnDrop silently ignores drops past 140) goes straight into the breaker's backpack, so nothing is ever lost
{const _ba=breakAt;breakAt=function(x,y,dmg){let items=null;try{const o=OBJ[y*W+x];if(o&&o.c&&Array.isArray(o.c.it)&&o.c.it.length)items=o.c.it.map(a=>[a[0],a[1]])}catch(_){}
 const r=_ba(x,y,dmg);try{if(items&&r&&!tiles[y*W+x]){const px=x*T+T/2,py=y*T+T/2;let back=0;for(const[it,n]of items){let left=n;while(left>0){const c=Math.min(left,Math.max(1,Math.ceil(n/6))),L=drops.length;if(L<136)spawnDrop(px,py,it,c);if(drops.length==L){addI(it,left);back+=left;break}left-=c}}if(back)say(back+' items from the chest went straight into your backpack')}}catch(_){}return r}}
