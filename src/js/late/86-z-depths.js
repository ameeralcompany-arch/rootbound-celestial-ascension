// ===== DEPTH8: things to do underground. Three depth bands, measured in tiles below the surface (sh(x)):
//   Glowroot Hollows (8-25 m)  - glowcap groves (walk / jump through the floating spores to harvest; regrows) + Buried Caches (block 93, dig with Pip)
//                                + Mole Rush (E: moles pop out of 5 burrows for 20 s; bonk 12 points' worth by striking them or pressing E)
//   Crystal Caverns  (26-45 m) - Crystal Geodes (block 94, crack with a tool: Glimmer cracks one in 3 taps) + Singing Crystals (E to listen,
//                                then strike the crystal pillars in the same order) + Crystal Gallery (E: hit 15 floating crystals in 25 s)
//   Emberdeep        (46 m +)  - Ember Forges (E: strike when the needle is in the gold, 5 times; the zone shrinks and the needle speeds up)
//                                + Relic Vaults (3 guardians wake; beat them, then open the relic chest)
// There are no shrines underground any more: the Ember Forges sit in the rooms where the Ancient Shrines were (same place, same seed).
// The mini games pay on a short cooldown per site and keep your best score; losing just lets you try again.
// plus depth records (milestones every 15 m) and a first-visit reward per zone. Each band has its own mood: a soft colour vignette, pooled motes
// (spores / crystal glints / embers) and quiet synthesized ambience. Entering a band shows a small animated indicator (name, depth, what is found).
// Sites are placed from the world seed while the world is generated. A room is only carved where the saved world has no edits nearby, and that
// decision is remembered per world, so builds are never cut into and the layout never shifts between loads (old saves keep loading untouched).
// Progress (discoveries, cooldowns, records, blessing) is per profile. Rewards go through REW8 (92-z-rewards.js). =====
const DEPTH8=(()=>{
 const R0=Math.random,rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const RW=()=>typeof REW8!='undefined'?REW8:null,tone=(a,b,d,ty,v,dl)=>{try{SFX7.tone(a,b,d,ty,v,dl)}catch(_){}};
 const hx=h=>{h=String(h).replace('#','');return[parseInt(h.slice(0,2),16)|0,parseInt(h.slice(2,4),16)|0,parseInt(h.slice(4,6),16)|0]};
 const BANDS=[{id:'hollow',n:'Glowroot Hollows',d0:8,d1:26,c:'#3fd8b4',h:'Catch spores at glowcap groves · dig Buried Caches with Pip (4) · bonk moles at Mole Rush'},
  {id:'crystal',n:'Crystal Caverns',d0:26,d1:46,c:'#9a7bff',h:'Crack Crystal Geodes with Glimmer (6) · repeat the Singing Crystals · hit floating crystals at a Crystal Gallery'},
  {id:'magma',n:'Emberdeep',d0:46,d1:999,c:'#ff6a2a',h:'Strike in rhythm at Ember Forges · Relic Vaults are guarded'}];
 // ---- blocks: Buried Cache (93), Crystal Geode (94). Both render through the normal sprite path (TILE7 chunk cache, shadows)
 const CACHE=93,GEODE=94;BLK[CACHE]=['Buried Cache','#c8913a',5];BLK[GEODE]=['Crystal Geode','#9a7bff',14];
 for(const id of[CACHE,GEODE]){PRICE[id]=id==CACHE?40:90;LVREQ[id]=0;SOLID6[id]=1}GLOW7[GEODE]=[170,130,255];
 const PT={[CACHE](x,R){x.fillStyle='#7a5c3c';x.fillRect(0,0,T,T);for(let i=0;i<30;i++){x.fillStyle='rgba(40,25,10,'+(.15+R()*.3)+')';x.fillRect(R()*T,R()*T,2+R()*4,2+R()*3)}
   x.save();x.translate(24,29);x.rotate(-.18);x.lineJoin='round';x.strokeStyle='#1e1006';x.lineWidth=2;x.fillStyle='#5a3418';x.beginPath();x.roundRect(-15,-9,30,19,3);x.fill();x.stroke();x.fillStyle='#8a5428';x.beginPath();x.roundRect(-15,-16,30,9,[5,5,1,1]);x.fill();x.stroke();
   x.fillStyle='#f4c64a';x.fillRect(-15,-8,30,3);x.fillRect(-3,-11,6,8);x.strokeRect(-3,-11,6,8);x.restore();x.fillStyle='#ffe08a';for(let i=0;i<3;i++){x.beginPath();x.ellipse(9+i*13+R()*3,42-R()*3,3,1.8,0,0,6.3);x.fill()}x.fillStyle='#fff';x.fillRect(32,17,2,2)},
  [GEODE](x,R){x.fillStyle='#4a4e5c';x.fillRect(0,0,T,T);for(let i=0;i<26;i++){x.fillStyle='rgba(20,22,30,'+(.15+R()*.3)+')';x.fillRect(R()*T,R()*T,3,3)}
   x.fillStyle='#2c2838';x.beginPath();x.ellipse(24,25,19,17,0,0,6.3);x.fill();x.strokeStyle='#15121e';x.lineWidth=2.5;x.stroke();const g2=x.createRadialGradient(24,25,2,24,25,15);g2.addColorStop(0,'#fff');g2.addColorStop(.35,'#d6c6ff');g2.addColorStop(1,'#5a3aa8');x.fillStyle=g2;x.beginPath();x.ellipse(24,25,13,11,0,0,6.3);x.fill();
   for(let i=0;i<9;i++){const a=i/9*6.28+R()*.4,r=4+R()*6,cx=24+Math.cos(a)*r*.9,cy=25+Math.sin(a)*r*.8,s=3+R()*4;x.fillStyle=i%3?'#b48cff':i%2?'#7fe9ff':'#ff9ad8';x.beginPath();x.moveTo(cx,cy-s);x.lineTo(cx+s*.55,cy);x.lineTo(cx,cy+s);x.lineTo(cx-s*.55,cy);x.closePath();x.fill()}x.fillStyle='rgba(255,255,255,.9)';x.fillRect(19,18,3,3)}};
 {const _bs=blockSprite;blockSprite=function(b,v){if(PT[b]){const c=document.createElement('canvas');c.width=c.height=T;PT[b](c.getContext('2d'),rr(b*733+v*97+29));if(b==CACHE)try{NB7.bevel(c,b)}catch(_){}return c}return _bs(b,v)}}
 // ---- materials found down here (values give the rarity: ITEM7 tiers by price)
 const MATS={260:['Glowspore','#7affd8',12],261:['Ancient Coin','#ffd36a',40],262:['Quartz Shard','#e8f0ff',6],263:['Amethyst','#b48cff',20],264:['Prism Shard','#7fe9ff',55],265:['Starheart Gem','#ff8fd0',150],266:['Dragon Opal','#ffb347',400],267:['Primordial Prism','#f4f0ff',750],268:['Resonant Shard','#9fe0ff',140],269:['Ember Relic','#ff5a2a',450]};
 for(const k in MATS){const m=MATS[k];MAT[k]={n:m[0],c:m[1],p:m[2]};if(m[2]>=100)MAT[k].nochest=1/* epic+ only come from their activity, never from cave chests */}
 {const _mi=matIcon;matIcon=function(x,k,S){const m=MATS[k];if(!m)return _mi.apply(this,arguments);try{burstBG(x,S)}catch(_){}x.save();x.scale(S/48,S/48);x.lineJoin='round';x.strokeStyle='#1b1430';x.lineWidth=2;const c=m[1];
   const gr=x.createLinearGradient(10,6,38,42);if(k==267){['#ff9ad8','#ffd36a','#9dff8a','#7fe9ff','#b48cff'].forEach((q,i)=>gr.addColorStop(i/4,q))}else{gr.addColorStop(0,'#fff');gr.addColorStop(.35,c);gr.addColorStop(1,mixc(c,.55))}x.fillStyle=gr;x.beginPath();
   if(k==260){x.arc(18,28,8,0,6.3);x.arc(28,22,10,0,6.3);x.arc(32,32,7,0,6.3)}else if(k==261){x.arc(24,24,14,0,6.3)}else if(k==262){x.moveTo(24,5);x.lineTo(32,14);x.lineTo(30,42);x.lineTo(18,42);x.lineTo(16,14)}
   else if(k==263){x.moveTo(14,40);x.lineTo(12,18);x.lineTo(18,10);x.lineTo(22,30);x.lineTo(25,6);x.lineTo(31,14);x.lineTo(30,30);x.lineTo(36,16);x.lineTo(40,24);x.lineTo(36,40)}else if(k==265){x.moveTo(24,4);x.lineTo(29,19);x.lineTo(44,24);x.lineTo(29,29);x.lineTo(24,44);x.lineTo(19,29);x.lineTo(4,24);x.lineTo(19,19)}
   else if(k==266){x.ellipse(24,25,15,18,0,0,6.3)}else if(k==269){x.moveTo(24,5);x.lineTo(36,16);x.lineTo(32,40);x.lineTo(16,40);x.lineTo(12,16)}else{x.moveTo(24,6);x.lineTo(40,20);x.lineTo(24,42);x.lineTo(8,20)}
   x.closePath();x.fill();x.stroke();x.fillStyle='rgba(255,255,255,.6)';if(k==261){x.font='700 15px serif';x.textAlign='center';x.fillStyle='#8a5a10';x.fillText('✦',24,29)}else{x.beginPath();x.ellipse(20,17,4,2.5,-.6,0,6.3);x.fill()}
   if(k==268){x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=1.5;x.beginPath();x.arc(24,24,18,-.6,.6);x.stroke();x.beginPath();x.arc(24,24,18,2.5,3.7);x.stroke()}if(k==269){x.fillStyle='#ffe08a';x.beginPath();x.arc(24,24,4,0,6.3);x.fill()}x.restore()}}
 // ---- save (per profile)
 const K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbdepth';let db={};
 function load(){try{db=JSON.parse(localStorage.getItem(K())||'{}')||{}}catch(_){db={}}if(!db.w||typeof db.w!='object')db.w={};db.best=+db.best||0;db.ms=db.ms||{};db.zone=db.zone||{};db.tot=db.tot||{};db.hi=db.hi||{};delete db.buff/* old shrine blessing */}load();
 const save=()=>{try{localStorage.setItem(K(),JSON.stringify(db))}catch(_){}};
 const wr=()=>{const w=db.w[cur]||(db.w[cur]={});w.g=w.g||{};w.gd=w.gd||{};w.cb=w.cb||[];w.gb=w.gb||[];w.p=w.p||{};w.v=w.v||{};w.mg=w.mg||{};delete w.s/* old shrine cooldowns */;return w};
 const tot=k=>{db.tot[k]=(db.tot[k]|0)+1};
 // ---- generation (inside genBase, before the saved edits are applied)
 let S=[],CA=[],GE=[],pendE=null;
 {const _lw=loadWorld;loadWorld=function(n,e){pendE=e||null;try{return _lw.apply(this,arguments)}finally{pendE=null}}}
 function editKeys(){const s=new Set();let e=pendE;if(!e){try{e=JSON.parse(localStorage.getItem('rbw_'+cur)||'null')}catch(_){e=null}}if(!e||typeof e!='object')return s;
  for(const k in e){const n=+k;if(Number.isInteger(n))s.add(n)}if(e.o&&typeof e.o=='object')for(const k in e.o){const n=+k;if(Number.isInteger(n))s.add(n)}if(e.m&&e.m.x!=null)s.add((e.m.y|0)*W+(e.m.x|0));return s}
 // every room id is decided once per world (carve it only where the save has no edits nearby). w.sn lists the ids already decided; worlds
 // saved before the mini games existed decided exactly OLD_IDS, so rooms added later are decided on their first load and the old ones never move
 const OLD_IDS=['g0','g1','g2','g3','g4','p0','p1','s0','s1','v0','v1'];
 function gen(){S=[];CA=[];GE=[];if(cur=='plaza')return;const R=rr((5153+Math.floor(ws*92821))>>>0),w=wr(),fresh=!Array.isArray(w.ok),ok=fresh?[]:w.ok,seen=Array.isArray(w.sn)?w.sn:fresh?[]:OLD_IDS.slice();
  let ek=null,dirty=fresh||!Array.isArray(w.sn);
  const inb=(x,y)=>x>2&&x<W-3&&y>3&&y<H-4;
  // avoid: skip the spot if it would overlap a room already placed (used by the later mini game rooms)
  function room(id,cx,dep,rw,rh,minD,avoid){const s=sh(cx);dep=Math.min(dep,H-6-s);if(dep<minD||cx-rw<3||cx+rw>W-4)return null;const fy=s+dep;if(fy-rh<s+5)return null;
   if(avoid&&S.some(r=>Math.abs(r.x-cx)<r.rw+rw+3&&fy-rh-3<r.fy+2&&r.fy-r.rh-3<fy+2))return null;
   if(!seen.includes(id)){ek=ek||editKeys();let bad=false;for(let y=fy-rh-2;y<=fy+2&&!bad;y++)for(let x=cx-rw-2;x<=cx+rw+2;x++)if(ek.has(y*W+x)){bad=true;break}if(!bad)ok.push(id);seen.push(id);dirty=true}
   if(!ok.includes(id))return null;
   for(let dx=-rw;dx<=rw;dx++){const x=cx+dx,top=fy-Math.max(1,Math.round(rh*Math.sqrt(Math.max(0,1-(dx/(rw+.6))**2))));for(let y=top;y<fy;y++){const k=y*W+x;tiles[k]=0;hp[k]=0;wl[k]=0}
    const kf=fy*W+x;if(!tiles[kf]||!SOLID6[tiles[kf]]){tiles[kf]=dep>44?77:3;hp[kf]=BLK[tiles[kf]][2];wl[kf]=0}}
   return{id,x:cx,fy,rw,rh,dep,lit:[0,0,0,0],st:'idle',bad:0,got:new Set(),gs:[],killed:0}}
  function deco(r,id,n){for(let i=0,t=0;i<n&&t<n*12;t++){const x=r.x-r.rw-1+Math.floor(R()*(r.rw*2+3)),y=r.fy-r.rh-1+Math.floor(R()*(r.rh+3));if(!inb(x,y))continue;const k=y*W+x,b=tiles[k];if(b!=3&&b!=77&&b!=1)continue;if(tiles[k-1]&&tiles[k+1]&&tiles[k-W]&&tiles[k+W])continue;tiles[k]=id;hp[k]=BLK[id][2];i++}}
  const seg=(i,n)=>Math.floor(12+(i+.5)*(W-24)/n+(R()-.5)*((W-24)/n-18));
  for(let i=0;i<5;i++){const cx=seg(i,5),dep=12+Math.floor(R()*9),caps=[];for(let j=0;j<5;j++)caps.push({o:(j-2)*1.75+(R()-.5)*.5,sz:.8+R()*.45,hue:j%3,ph:R()*6});const r=room('g'+i,cx,dep,5,4,10);if(r){r.k='grove';r.caps=caps.map(c=>({x:(r.x+.5+c.o)*T,sz:c.sz,hue:c.hue,ph:c.ph}));S.push(r)}}
  for(let i=0;i<2;i++){const cx=seg(i*2+1,4),dep=29+Math.floor(R()*9),len=4+i,seq=[];for(let j=0;j<len;j++)seq.push(Math.floor(R()*4));const r=room('p'+i,cx,dep,7,4,28);if(r){r.k='reso';r.seq=seq;deco(r,9,6);S.push(r)}}
  for(let i=0;i<2;i++){const cx=seg(i*2,4),dep=50+Math.floor(R()*10),r=room('s'+i,cx,dep,4,3,48);if(r){r.k='forge';deco(r,62,5);S.push(r)}}   // the old shrine rooms (ids s0 / s1): same spots, now forges
  for(let i=0;i<2;i++){const cx=seg(i*2+1,4),dep=55+Math.floor(R()*12),r=room('v'+i,cx,dep,8,4,50);if(r){r.k='vault';deco(r,62,9);S.push(r)}}
  const scatter=(arr,id,n,d0,d1)=>{for(let t=0;t<n*40&&arr.length<n;t++){const x=4+Math.floor(R()*(W-8)),y=sh(x)+d0+Math.floor(R()*(d1-d0));if(!inb(x,y))continue;const k=y*W+x,b=tiles[k];if(b!=3&&b!=1&&b!=77)continue;
   if(!(tiles[k-1]==0||tiles[k+1]==0||tiles[k-W]==0||tiles[k+W]==0))continue;if(arr.some(q=>Math.abs(q%W-x)<7&&Math.abs((q/W|0)-y)<6))continue;tiles[k]=id;hp[k]=BLK[id][2];arr.push(k)}};
  scatter(CA,CACHE,10,9,25);scatter(GE,GEODE,12,27,45);
  // mini game rooms come last, so everything placed before them (and the random numbers it used) stays exactly where it was
  // each one tries 6 spots (drawn up front, so the random sequence never depends on which spot fits) and takes the first that is clear
  const place=(id,i,n,d0,dr,rw,rh,minD)=>{const c=[];for(let t=0;t<6;t++)c.push([seg(i,n)+Math.round((R()-.5)*((W-24)/n*.6)),d0+Math.floor(R()*dr)]);for(const[cx,dep]of c){const r=room(id,cx,dep,rw,rh,minD,true);if(r)return r;if(seen.includes(id)&&!ok.includes(id))return null}return null};
  for(let i=0;i<3;i++){const r=place('m'+i,i,3,13,10,6,3,11);if(r){r.k='mole';r.mo=[0,1,2,3,4].map(()=>({u:0,l:0,gold:0,bonk:0}));S.push(r)}}
  for(let i=0;i<3;i++){const r=place('c'+i,i,3,31,11,7,5,29);if(r){r.k='gal';r.tg=[];deco(r,9,5);S.push(r)}}
  CA=CA.filter(k=>tiles[k]==CACHE);GE=GE.filter(k=>tiles[k]==GEODE);
  if(dirty){w.ok=ok;w.sn=seen;save()}}
 {const _gb=genBase;genBase=function(){const r=_gb.apply(this,arguments);try{gen()}catch(e){console.error('DEPTH8 gen',e)}return r}}
 // ---- sprites (pre-rendered once)
 const mk=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'));return c};
 const GLC={},GL=c=>GLC[c]||(GLC[c]=mk(64,64,x=>{const[r,g2,b]=hx(c),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.22,'rgba('+r+','+g2+','+b+',.7)');gr.addColorStop(1,'rgba('+r+','+g2+','+b+',0)');x.fillStyle=gr;x.fillRect(0,0,64,64)}));
 const CAPC=['#4fe3c1','#6fb8ff','#b48cff'],PC=['#7fe9ff','#b48cff','#ff8fd0','#ffd36a'],NOTE=[523,659,784,988],PENT5=[1047,1175,1319,1568,1760,2093];
 const CAPS=CAPC.map(c=>mk(44,52,x=>{x.lineJoin='round';x.strokeStyle='#14202a';x.lineWidth=2;x.fillStyle='#e8fff6';x.beginPath();x.moveTo(18,50);x.quadraticCurveTo(16,34,19,24);x.lineTo(25,24);x.quadraticCurveTo(28,34,26,50);x.closePath();x.fill();x.stroke();
  const gr=x.createRadialGradient(18,12,2,22,18,22);gr.addColorStop(0,'#ffffff');gr.addColorStop(.35,c);gr.addColorStop(1,mixc(c,.55));x.fillStyle=gr;x.beginPath();x.moveTo(2,26);x.quadraticCurveTo(4,4,22,3);x.quadraticCurveTo(40,4,42,26);x.quadraticCurveTo(22,20,2,26);x.closePath();x.fill();x.stroke();
  x.fillStyle='rgba(255,255,255,.85)';for(const[a,b,r]of[[12,13,2.6],[24,9,2],[32,16,2.4],[19,19,1.6]]){x.beginPath();x.arc(a,b,r,0,6.3);x.fill()}}));
 const PIL=PC.map(c=>mk(36,100,x=>{x.lineJoin='round';x.strokeStyle='#1a1430';x.lineWidth=2;x.fillStyle='#5a5470';x.beginPath();x.roundRect(2,86,32,13,3);x.fill();x.stroke();
  const gr=x.createLinearGradient(6,0,30,0);gr.addColorStop(0,mixc(c,.6));gr.addColorStop(.45,'#ffffff');gr.addColorStop(.6,c);gr.addColorStop(1,mixc(c,.5));x.fillStyle=gr;x.beginPath();x.moveTo(18,4);x.lineTo(29,22);x.lineTo(27,86);x.lineTo(9,86);x.lineTo(7,22);x.closePath();x.fill();x.stroke();
  x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=1.2;x.beginPath();x.moveTo(18,6);x.lineTo(18,84);x.moveTo(7,22);x.lineTo(29,22);x.stroke();x.fillStyle=mixc(c,.8);x.strokeStyle='#1a1430';x.lineWidth=1.6;x.beginPath();x.moveTo(29,86);x.lineTo(34,60);x.lineTo(27,67);x.closePath();x.fill();x.stroke()}));
 // Ember Forge: a brick hearth with glowing coals and an anvil holding a hot ingot (anvil face centre at x 89)
 const FRG=mk(120,84,x=>{x.lineJoin='round';x.strokeStyle='#160c0c';x.lineWidth=2;x.fillStyle='#4e3a3a';x.beginPath();x.moveTo(4,84);x.lineTo(4,30);x.quadraticCurveTo(28,8,52,30);x.lineTo(52,84);x.closePath();x.fill();x.stroke();
  x.fillStyle='#1a0c08';x.beginPath();x.moveTo(14,84);x.lineTo(14,46);x.quadraticCurveTo(28,32,42,46);x.lineTo(42,84);x.closePath();x.fill();
  const gc=x.createLinearGradient(0,66,0,84);gc.addColorStop(0,'#ffd36a');gc.addColorStop(1,'#ff4a1a');x.fillStyle=gc;x.beginPath();x.ellipse(28,79,13,6,0,0,6.3);x.fill();
  x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=1.5;for(let i=0;i<4;i++){x.beginPath();x.moveTo(5,40+i*11);x.lineTo(13,40+i*11);x.moveTo(43,40+i*11);x.lineTo(51,40+i*11);x.stroke()}
  x.strokeStyle='#0c0c12';x.lineWidth=2;x.fillStyle='#3a3c48';x.beginPath();x.roundRect(76,70,30,14,2);x.fill();x.stroke();x.beginPath();x.moveTo(82,70);x.lineTo(86,56);x.lineTo(96,56);x.lineTo(100,70);x.closePath();x.fill();x.stroke();
  const ga=x.createLinearGradient(0,44,0,58);ga.addColorStop(0,'#9a9cac');ga.addColorStop(1,'#4a4c5a');x.fillStyle=ga;x.beginPath();x.moveTo(62,46);x.lineTo(116,44);x.lineTo(112,56);x.lineTo(72,56);x.quadraticCurveTo(64,52,62,46);x.closePath();x.fill();x.stroke();
  x.fillStyle='#ff9a3a';x.strokeStyle='#5a1a08';x.beginPath();x.roundRect(78,38,22,6,2);x.fill();x.stroke();x.fillStyle='#ffe08a';x.fillRect(81,39,10,2)});
 // Mole Rush: a mole (plain or golden with a crown) and the dirt mound it pops out of
 const MOL=gold=>mk(40,44,x=>{x.translate(0,4);x.lineJoin='round';x.strokeStyle='#1a1008';x.lineWidth=2;x.fillStyle=gold?'#e8b83a':'#6a4a36';x.beginPath();x.moveTo(5,40);x.quadraticCurveTo(4,6,20,5);x.quadraticCurveTo(36,6,35,40);x.closePath();x.fill();x.stroke();
  x.fillStyle=gold?'#fff0b0':'#c8a088';x.beginPath();x.ellipse(20,24,9,8,0,0,6.3);x.fill();x.fillStyle='#ff8aa8';x.beginPath();x.ellipse(20,20,4,3,0,0,6.3);x.fill();x.stroke();
  x.fillStyle='#120a06';for(const ex of[13,27]){x.beginPath();x.arc(ex,14,2.4,0,6.3);x.fill()}x.fillStyle='#fff';for(const ex of[13.8,27.8]){x.beginPath();x.arc(ex,13.2,.9,0,6.3);x.fill()}
  x.fillRect(17,27,3,4);x.fillRect(20.5,27,3,4);x.fillStyle=gold?'#c89020':'#4a3020';for(const px of[8,32]){x.beginPath();x.ellipse(px,33,5,3.5,0,0,6.3);x.fill();x.stroke()}
  if(gold){x.fillStyle='#ffd36a';x.strokeStyle='#7a4a08';x.lineWidth=1.5;x.beginPath();x.moveTo(12,7);x.lineTo(12,-2);x.lineTo(16,2);x.lineTo(20,-4);x.lineTo(24,2);x.lineTo(28,-2);x.lineTo(28,7);x.closePath();x.fill();x.stroke()}});
 const MOLS=[MOL(0),MOL(1)];
 const MND=mk(56,22,x=>{x.lineJoin='round';x.fillStyle='#5a3e26';x.strokeStyle='#22140a';x.lineWidth=2;x.beginPath();x.moveTo(1,22);x.quadraticCurveTo(6,8,16,9);x.quadraticCurveTo(28,3,40,9);x.quadraticCurveTo(50,8,55,22);x.closePath();x.fill();x.stroke();
  x.fillStyle='#1a0f08';x.beginPath();x.ellipse(28,15,13,4,0,0,6.3);x.fill();x.fillStyle='#8a6a48';for(const[a,b]of[[10,18],[45,17],[20,20],[37,20]]){x.beginPath();x.arc(a,b,1.8,0,6.3);x.fill()}});
 const chest=op=>mk(70,64,x=>{x.lineJoin='round';x.strokeStyle='#160a08';x.lineWidth=2.5;x.translate(3,14);
  if(op){x.fillStyle='#2a1418';x.beginPath();x.roundRect(4,-12,56,20,[8,8,2,2]);x.fill();x.stroke();x.fillStyle='#e8b83a';x.fillRect(4,-6,56,3)}
  x.fillStyle='#3a2026';x.beginPath();x.roundRect(2,20,60,28,4);x.fill();x.stroke();x.fillStyle='#e8b83a';x.fillRect(2,30,60,4);
  if(op){x.fillStyle='#ffe9a0';x.beginPath();x.ellipse(32,21,26,5,0,0,6.3);x.fill()}else{x.fillStyle='#552c30';x.beginPath();x.roundRect(2,4,60,17,[8,8,2,2]);x.fill();x.stroke();x.fillStyle='#e8b83a';x.fillRect(2,12,60,3)}
  x.fillStyle='#e8b83a';x.fillRect(27,24,10,14);x.strokeRect(27,24,10,14);x.fillStyle='#ff5a2a';x.beginPath();x.arc(32,31,3,0,6.3);x.fill();for(const q of[2,56]){x.fillStyle='#c89a2a';x.fillRect(q,20,6,28)}});
 const CHC=chest(0),CHO=chest(1);
 const COL=mk(44,128,x=>{x.lineJoin='round';x.strokeStyle='#160c0c';x.lineWidth=2;x.fillStyle='#4e3a3a';x.beginPath();x.roundRect(2,112,40,14,3);x.fill();x.stroke();const gr=x.createLinearGradient(8,0,36,0);gr.addColorStop(0,'#3a2a2a');gr.addColorStop(.5,'#7a5e58');gr.addColorStop(1,'#3a2a2a');x.fillStyle=gr;
  x.beginPath();x.moveTo(8,112);x.lineTo(8,22);x.lineTo(14,14);x.lineTo(19,24);x.lineTo(26,10);x.lineTo(30,20);x.lineTo(36,16);x.lineTo(36,112);x.closePath();x.fill();x.stroke();x.strokeStyle='rgba(0,0,0,.35)';for(let i=0;i<3;i++){x.beginPath();x.moveTo(14+i*8,30);x.lineTo(14+i*8,110);x.stroke()}
  x.strokeStyle='#ff7a3a';x.globalAlpha=.7;x.beginPath();x.moveTo(12,60);x.lineTo(20,72);x.lineTo(16,86);x.stroke();x.globalAlpha=1;x.fillStyle='#2a1a1a';x.fillRect(16,40,12,8);x.strokeRect(16,40,12,8)});
 const VIG={},vig=b=>VIG[b.id]||(VIG[b.id]=mk(160,90,x=>{const[r,g2,bb]=hx(b.c),gr=x.createRadialGradient(80,45,16,80,45,96);gr.addColorStop(0,'rgba('+r+','+g2+','+bb+',0)');gr.addColorStop(.62,'rgba('+r+','+g2+','+bb+',.1)');gr.addColorStop(1,'rgba('+r+','+g2+','+bb+',.42)');x.fillStyle=gr;x.fillRect(0,0,160,90)}));
 // ---- helpers
 const pillX=(r,j)=>(r.x+.5+(j-1.5)*3)*T,ctr=r=>(r.x+.5)*T,ready=r=>Date.now()>=(wr().g[r.id]||0);
 const spore=(r,j,t)=>{const c=r.caps[j];return{x:c.x+Math.sin(t*.9+c.ph)*7,y:r.fy*T-58*c.sz-14-Math.sin(t*1.4+c.ph*2)*6}};
 const fmt=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
 const near=(r,dx,dy)=>Math.abs(P.x-ctr(r))<dx&&Math.abs(P.y+P.h/2-(r.fy-1)*T)<dy;
 const pay=(g,xp,kind)=>{if(g>0){gems+=g;try{stat('gems',g)}catch(_){}}if(xp>0)try{xpGain(kind||'mine',xp)}catch(_){}};
 const REGROW=15*60000;
 // mini games: length (s), goal, reward cooldown per site
 const MG={mole:{t:20,goal:12,cd:3*60000,c:'#ffd36a'},gal:{t:25,goal:15,cd:3*60000,c:'#b48cff'},forge:{n:5,goal:5,cd:4*60000,c:'#ff8a3a'}};
 const holeX=(r,j)=>(r.x+.5+(j-2)*2.2)*T,mgs=r=>{const w=wr();return w.mg[r.id]||(w.mg[r.id]={cd:0,won:0})};
 const TBL=[[262,45],[263,28],[264,15],[265,8],[266,3.5],[267,.5]];
 function roll(luck){let tt=0;const wv=TBL.map(([,p],i)=>{const v=p*(i>=2?1+luck*.6:1);tt+=v;return v});let r=R0()*tt;for(let i=0;i<wv.length;i++){if(r<wv[i])return i;r-=wv[i]}return 0}
 const luck=()=>{try{return bonus().luck||0}catch(_){return 0}};
 // ---- activities
 function collect(r,j,p){r.got.add(j);const n=r.got.size;tone(784*Math.pow(1.1225,n*2),784*Math.pow(1.1225,n*2)*1.01,.22,'sine',.04);tone(1568*Math.pow(1.1225,n*2),1600,.12,'triangle',.012,.05);
  pay(1,2);try{const w2=RW();if(w2){w2.sparkle(p.x,p.y,CAPC[r.caps[j].hue],10,140);w2.fly(p.x,p.y,1)}}catch(_){}try{ft(p.x,p.y-10,n+' / '+r.caps.length,'#b6fff0')}catch(_){}
  if(n>=r.caps.length)harvest(r)}
 function harvest(r){const w=wr(),first=!w.gd[r.id];w.gd[r.id]=1;w.g[r.id]=Date.now()+REGROW;tot('grove');save();const n=2+(R0()*3|0),g=25+r.dep,xp=30+r.dep*2,x=ctr(r),y=r.fy*T;r.got.clear();addI(260,n);pay(g,xp);
  const q=RW();if(q){q.celebrate(x,y,'#4fe3c1',{d:1.6,s:1,n:26});q.fly(x,y-40,g);q.fan('discover');q.card({kind:'grove',kick:first?'Grove discovered':'Grove harvested',title:'Glowcap Grove',sub:'It regrows in 15 minutes',gems:g,xp,items:[[260,n]],tier:first?2:1})}}
 function dig(x,y,k){const w=wr();if(!w.cb.includes(k))w.cb.push(k);tot('cache');save();const px=x*T+T/2,py=y*T+T/2,g=30+(R0()*40|0),items=[],pool=[[260,1,3],[261,1,2],[71,2,4],[72,2,3],[263,1,2],[264,1,1]];
  for(let i=0,n=1+(R0()<.5?1:0);i<n;i++){const p=pool[R0()*pool.length|0],q=p[1]+(R0()*(p[2]-p[1]+1)|0);addI(p[0],q);items.push([p[0],q])}pay(g,30);
  const q=RW();if(q){const t=Math.max(1,...items.map(i=>q.tierOf(i[0])));q.celebrate(px,py,q.RC[t],{d:1.2,s:.7,n:16});q.fly(px,py,g);q.fan('reveal',t);q.card({kind:'cache',kick:'Buried cache',title:'Treasure unearthed',gems:g,xp:30,items,tier:t})}}
 function crack(x,y,k){const w=wr();if(!w.gb.includes(k))w.gb.push(k);tot('geode');save();const t=roll(luck()),id=TBL[t][0],n=t<2?1+(R0()*3|0):1,px=x*T+T/2,py=y*T+T/2,g=8+t*14+(R0()*8|0),xp=25+t*15;addI(id,n);pay(g,xp);
  try{VFX.shatter(px,py,['#d6c6ff','#7fe9ff','#ff9ad8','#ffffff'],22)}catch(_){}const q=RW();if(q)q.reveal(id,n,px,py,{kick:'Geode cracked',showTier:true,gems:g,xp})}
 function note(j,v){tone(NOTE[j],NOTE[j]*1.003,.6,'triangle',v||.05);tone(NOTE[j]*2,NOTE[j]*2,.45,'sine',.016,.02)}
 function listen(r){if(wr().p[r.id])return;r.st='show';r.i=0;r.tm=.55;r.step=0;try{say('Listen to the crystals...')}catch(_){}}
 function hit(r,j){r.lit[j]=.38;note(j);try{const w2=RW();if(w2)w2.sparkle(pillX(r,j),r.fy*T-90,PC[j],6,120)}catch(_){}if(wr().p[r.id]||r.st!='input')return;r.idle=0;
  if(r.seq[r.step]==j){r.step++;if(r.step>=r.seq.length){r.st='win';r.tm=.5}}else{r.st='fail';r.tm=1.4;r.bad=.7;tone(220,150,.35,'sawtooth',.03);tone(233,160,.35,'sawtooth',.02,.02);try{say('The song breaks. Press E to listen again')}catch(_){}}}
 function solve(r){const w=wr();w.p[r.id]=1;tot('reso');save();r.st='solved';const g=80+r.seq.length*10,xp=150,x=ctr(r),y=r.fy*T;addI(268,1);pay(g,xp);[523,659,784,988,1319].forEach((f,i)=>tone(f,f,1.2,'triangle',.03,i*.05));
  const q=RW();if(q){q.celebrate(x,y,'#9fe0ff',{d:2,s:1.2,n:36,w:220});q.fly(x,y-60,g);q.card({kind:'reso',kick:'Resonance restored',title:'The crystal song is whole',gems:g,xp,items:[[268,1]],tier:3})}}
 // ---- mini games. A win pays gems / XP / items unless that site paid in the last few minutes (you can always replay for a best score)
 function win(r,kind,kick,title,g,xp,items){const s=mgs(r),now=Date.now(),x=ctr(r),y=r.fy*T,paid=now>=s.cd,first=!s.won;s.won++;
  if(paid){s.cd=now+MG[kind].cd;for(const[i,n]of items)addI(i,n);pay(g,xp,kind=='forge'?'craft':'mine')}save();[523,659,784,1047].forEach((f,i)=>tone(f,f,.5,'triangle',.03,i*.07));
  const q=RW();if(q){q.celebrate(x,y,MG[kind].c,{d:1.6,s:1,n:26});if(paid){q.fly(x,y-40,g);q.fan('discover')}
   q.card(paid?{kind,kick:first?kick+' · first clear':kick,title,gems:g,xp,items,tier:first?3:2}:{kind,kick,title,sub:'Rewards again in '+fmt(s.cd-now),tier:1})}}
 function lose(r,txt){save();tone(392,370,.3,'triangle',.03);tone(330,320,.4,'triangle',.025,.16);try{say(txt+' · press E to try again')}catch(_){}}
 // Mole Rush: moles pop out of 5 burrows; bonk them (strike with any weapon / tool, or press E standing at the burrow). Golden moles are worth 3
 function startMole(r){r.st='play';r.tm=MG.mole.t;r.sc=0;r.nx=.7;for(const m of r.mo){m.u=0;m.l=0;m.bonk=0}tone(523,530,.16,'triangle',.04);tone(784,790,.2,'triangle',.035,.12);try{say('Mole Rush! Bonk '+MG.mole.goal+' points of moles!')}catch(_){}}
 function bonk(r,j){const m=r.mo[j];if(!m||r.st!='play'||m.l<=0||m.bonk>0)return false;m.bonk=.4;m.l=Math.min(m.l,.4);const pts=m.gold?3:1;r.sc+=pts;const x=holeX(r,j),y=r.fy*T-26;
  tone(m.gold?1319:880,m.gold?1330:885,.14,'triangle',.045);tone(m.gold?1976:1319,m.gold?1990:1325,.1,'sine',.015,.03);try{const q=RW();if(q)q.sparkle(x,y,m.gold?'#ffd36a':'#e8c8a0',m.gold?14:8,160)}catch(_){}try{ft(x,y-18,'+'+pts,m.gold?'#ffe08a':'#ffffff')}catch(_){}return true}
 function moleTick(r,dt){for(const m of r.mo){if(r.st=='play'&&m.l>0){m.l-=dt;m.u=Math.min(1,m.u+dt*7)}else m.u=Math.max(0,m.u-dt*6);m.bonk=Math.max(0,m.bonk-dt)}if(r.st!='play')return;
  r.tm-=dt;const pg=1-Math.max(0,r.tm)/MG.mole.t;r.nx-=dt;
  if(r.nx<=0&&r.tm>.6){r.nx=.72-pg*.32+R0()*.25;const free=[];r.mo.forEach((m,j)=>{if(m.l<=0&&m.u<.05)free.push(j)});if(free.length){const m=r.mo[free[R0()*free.length|0]];m.l=1.3-pg*.45;m.gold=R0()<.12?1:0;m.bonk=0;tone(520+R0()*80,540,.06,'sine',.01)}}
  if(r.tm<=0){r.st='idle';const sc=r.sc,best=db.hi.mole|0;if(sc>best)db.hi.mole=sc;tot('mole');
   if(sc<MG.mole.goal)lose(r,'The moles got away · '+sc+' / '+MG.mole.goal);else win(r,'mole','Mole Rush cleared','Bonked '+sc+' points'+(sc>best?' · new best!':''),25+sc*3,60+sc*4,[[260,2]])}}
 // Crystal Gallery: crystals drift through the cave; hit them (aim with the mouse and attack). Rainbow prisms are faster and worth 3
 const tgPos=c=>({x:c.x0+Math.sin(c.t*c.f+c.ph)*c.ax,y:c.y0+Math.cos(c.t*c.f*1.3+c.ph)*c.ay});
 function startGal(r){r.st='play';r.tm=MG.gal.t;r.sc=0;r.nx=.3;r.tg.length=0;[784,988,1175].forEach((f,i)=>tone(f,f,.3,'triangle',.03,i*.08));try{say('Crystal Gallery! Hit '+MG.gal.goal+' floating crystals!')}catch(_){}}
 function shoot(r,wx,wy){if(r.st!='play')return false;for(const c of r.tg){if(c.pop>0)continue;const p=tgPos(c);if(Math.hypot(wx-p.x,wy-p.y)<28){c.pop=.3;const pts=c.pr?3:1;r.sc+=pts;const f=PENT5[(r.sc+c.hue)%PENT5.length];
    tone(f,f*1.002,.4,'triangle',.035);tone(f*2,f*2,.25,'sine',.012,.02);try{VFX.shatter(p.x,p.y,c.pr?['#ff9ad8','#ffd36a','#9dff8a','#7fe9ff']:[PC[c.hue],'#ffffff'],c.pr?14:8)}catch(_){}try{ft(p.x,p.y-16,'+'+pts,c.pr?'#ffe08a':PC[c.hue])}catch(_){}return true}}return false}
 function galTick(r,dt){for(let i=r.tg.length-1;i>=0;i--){const c=r.tg[i];c.t+=dt;if(c.pop>0){c.pop-=dt;if(c.pop<=0)r.tg.splice(i,1)}else if(c.t>=c.life)r.tg.splice(i,1)}if(r.st!='play')return;
  r.tm-=dt;const pg=1-Math.max(0,r.tm)/MG.gal.t;r.nx-=dt;
  if(r.nx<=0&&r.tm>.5&&r.tg.length<5){r.nx=.6-pg*.2+R0()*.2;const pr=R0()<.1,sp=r.rw-2.5;r.tg.push({x0:(r.x+.5+(R0()*2-1)*sp)*T,y0:(r.fy-1.6-R0()*(r.rh-2.6))*T,ax:16+R0()*26,ay:8+R0()*12,f:(pr?2.4:1.2)+R0()*.6,ph:R0()*6,t:0,life:pr?1.9:2.7-pg*.5,pr,pop:0,hue:R0()*4|0})}
  if(r.tm<=0){r.st='idle';r.tg.length=0;const sc=r.sc,best=db.hi.gal|0;if(sc>best)db.hi.gal=sc;tot('gal');
   if(sc<MG.gal.goal)lose(r,'The crystals faded · '+sc+' / '+MG.gal.goal);else{const t=Math.min(3,roll(luck()));win(r,'gal','Crystal Gallery cleared','Hit '+sc+' crystals'+(sc>best?' · new best!':''),30+sc*3,70+sc*4,[[TBL[t][0],1]])}}}
 // Ember Forge: the needle swings across the bar; strike (E or attack) while it is in the gold. 5 strikes, the gold shrinks and the needle speeds up
 const needle=r=>(1-Math.cos(r.ph))/2;
 function zone(r){r.wz=Math.max(.1,.26-r.n*.035);r.zc=.12+r.wz/2+R0()*(.76-r.wz)}
 function startForge(r){r.st='play';r.n=0;r.res=[];r.ph=0;r.sp=.9;r.idle=0;zone(r);tone(196,200,.5,'triangle',.03);tone(294,298,.5,'triangle',.02,.1);try{say('Ember Forge! Strike when the needle is in the gold (E)')}catch(_){}}
 function hammer(r){if(r.st!='play')return false;const now=performance.now();if(now-(r.lh||0)<220)return true;r.lh=now;r.idle=0;const d=Math.abs(needle(r)-r.zc),res=d<r.wz*.18?2:d<r.wz/2?1:0;r.res.push(res);r.n++;r.fl=.3;r.lr=res;const x=ctr(r)+29,y=r.fy*T-44;
  if(res){const f=res==2?1568:1175;tone(f,f*1.001,.6,'triangle',.045);tone(f*1.5,f*1.5,.35,'sine',.015,.015);try{VFX.burst(x,y,['#ffd36a','#ff9a3a','#ffffff'],res==2?18:10,240,0,.6,10)}catch(_){}}
  else{tone(330,320,.3,'triangle',.03);try{VFX.burst(x,y,['#888','#555'],5,120,0,.4,6)}catch(_){}}
  try{ft(x,y-26,res==2?'Perfect!':res?'Good':'Miss',res==2?'#ffe08a':res?'#ffffff':'#ff8080')}catch(_){}
  r.sp=Math.min(2.1,r.sp+.25);zone(r);
  if(r.n>=MG.forge.n){r.st='idle';const sc=r.res.reduce((a,b)=>a+b,0),pf=r.res.filter(v=>v==2).length,best=db.hi.forge|0;if(sc>best)db.hi.forge=sc;tot('forge');
   if(sc<MG.forge.goal)lose(r,'The blade cracked · '+sc+' / 10');else win(r,'forge','Ember Forge',(pf>=5?'A flawless forging':'A fine forging')+' · '+sc+' / 10',40+sc*10,80+sc*12,[[pf>=5?265:sc>=8?264:263,1]])}return true}
 function forgeTick(r,dt){r.fl=Math.max(0,(r.fl||0)-dt);if(r.st!='play')return;r.ph+=dt*r.sp*Math.PI;r.idle+=dt;if(r.idle>12){r.st='idle';try{say('The forge cools down · press E to start again')}catch(_){}}}
 function awaken(r){const kinds=['magma','golem','shade'];for(let i=r.killed;i<3;i++){const k=kinds[i%3],d=MK[k];if(!d)continue;const x=(r.x+.5+(i-1)*4)*T,y=r.fy*T-d.h-2-(d.fly?T*1.5:0),hpv=Math.round(d.hp*(2.4+(lvl|0)*.05));
   const m={k,x,y,w:d.w,h:d.h,vx:0,vy:-140,hp:hpv,mhp:hpv,fl:0,burn:0,slow:0,ph:R0()*6,t:1,dir:1,fade:0,g:false,wall:0,vg:r.id,elite:1};mobs.push(m);r.gs.push(m);try{VFX.burst(x,y+d.h/2,['#ff6a2a','#ffd36a'],14,220,0,.8,14)}catch(_){}}
  try{VFX.wave(ctr(r),r.fy*T,'#ff4a2a',260,.9,.3);shake=Math.max(shake,QM.reduce?0:.12)}catch(_){}tone(70,45,1.2,'sawtooth',.06);tone(140,90,.6,'square',.02,.1);try{say('The vault guardians awaken!')}catch(_){}}
 function unseal(r){r.un=performance.now();const x=ctr(r),y=r.fy*T;try{VFX.shatter(x,y-30,['#d8d8e8','#ffd36a','#ffffff'],26)}catch(_){}tone(1200,600,.25,'triangle',.04);tone(1800,900,.2,'triangle',.03,.08);pay(0,60,'fight');
  const q=RW();if(q){q.celebrate(x,y,'#ff9a4a',{d:1.4,s:.9,n:20});q.card({kind:'vault',kick:'Guardians defeated',title:'The relic vault is unsealed',sub:'Press E at the chest',xp:60,tier:3})}}
 function openVault(r){const w=wr();w.v[r.id]=1;tot('vault');save();r.t0=performance.now();const g=180+(R0()*80|0),xp=250,x=ctr(r),y=r.fy*T,t=Math.max(2,roll(2+luck())),gid=TBL[t][0];addI(269,1);addI(gid,1);pay(g,xp,'fight');
  const q=RW();if(q){q.card({kind:'vault',kick:'Also in the vault',title:iname(gid),items:[[gid,1]],tier:q.tierOf(gid),ms:4200});q.reveal(269,1,x,y-20,{kick:'Relic vault opened',showTier:true,gems:g,xp,ms:4400})}}
 // ---- input: E near a site, or striking a crystal pillar with any weapon / tool
 function use(){for(const r of S){
   if(r.k=='reso'&&near(r,(r.rw+1)*T,T*3)){if(r.st=='input'){let bj=-1,bd=T*.9;for(let j=0;j<4;j++){const d=Math.abs(P.x-pillX(r,j));if(d<bd){bd=d;bj=j}}if(bj>=0)hit(r,bj);else try{say('Stand at a crystal and press E, or strike it')}catch(_){}return true}
    if(wr().p[r.id]){try{say('The crystals hum in harmony.')}catch(_){}return true}if(r.st=='idle'||r.st=='fail'){listen(r);return true}return true}
   if(r.k=='mole'&&near(r,(r.rw+1)*T,T*3)){if(r.st=='play'){let bj=-1,bd=T*1.3;for(let j=0;j<5;j++){const m=r.mo[j],d=Math.abs(P.x-holeX(r,j));if(d<bd&&m.l>0&&!m.bonk){bd=d;bj=j}}if(bj>=0)bonk(r,bj);return true}startMole(r);return true}
   if(r.k=='gal'&&near(r,(r.rw+1)*T,T*4)){if(r.st=='play')try{say('Aim at the floating crystals and attack!')}catch(_){}else startGal(r);return true}
   if(r.k=='forge'&&near(r,T*2.8,T*2.5)){if(r.st=='play')hammer(r);else startForge(r);return true}
   if(r.k=='vault'&&near(r,T*2,T*2.5)){const w=wr();if(w.v[r.id]){try{say('The relic chest is empty.')}catch(_){}return true}if(r.killed>=3){openVault(r);return true}try{say('The vault is sealed. Defeat its guardians ('+r.killed+'/3).')}catch(_){}return true}}
  return false}
 {const _i=interact;interact=function(){if(!dlgOpen&&!creatorOn&&!showInv&&menuEl.style.display=='none'&&entered&&cur!='plaza'){try{if(use())return}catch(e){console.error('DEPTH8',e)}}return _i.apply(this,arguments)}}
 function strike(wx,wy){for(const r of S){
   if(r.k=='mole'){if(r.st=='play'&&near(r,(r.rw+3)*T,T*4))for(let j=0;j<5;j++){if(Math.abs(wx-holeX(r,j))<T*.8&&wy>r.fy*T-T*1.8&&wy<r.fy*T+6&&bonk(r,j))return true}continue}
   if(r.k=='gal'){if(r.st=='play'&&near(r,(r.rw+4)*T,T*6)&&shoot(r,wx,wy))return true;continue}
   if(r.k=='forge'){if(r.st=='play'&&near(r,T*4,T*3)){hammer(r);return true}continue}
   if(r.k!='reso')continue;for(let j=0;j<4;j++){const px=pillX(r,j);if(Math.abs(wx-px)<T*.6&&wy>r.fy*T-T*2.15&&wy<r.fy*T+4&&Math.hypot(px-P.x,r.fy*T-T-(P.y+P.h/2))<REACH+T){hit(r,j);return true}}}return false}
 {const _uw=useWeapon;useWeapon=function(){try{if(entered&&S.length&&typeof mx!='undefined')strike(mx+cam.x,my+cam.y)}catch(_){}return _uw.apply(this,arguments)}}
 // ---- blocks: geodes take several cracks (3 with Glimmer); caches dig out. Only the generated ones pay (placed copies are plain blocks)
 {const _ba=breakAt;breakAt=function(x,y,dmg){const inb=x>=0&&y>=0&&x<W&&y<H,k=y*W+x,b=inb?tiles[k]:0;
   if(b==GEODE&&canEdit()){const mh=BLK[GEODE][2],step=dmg>=100?mh/3+.01:Math.max(1,dmg);if(hp[k]-step>.001){const now=performance.now(),px=x*T+T/2,py=y*T+T/2,pr=1-(hp[k]-step)/mh;hp[k]-=step;hitAt.set(k,now);pop.set(k,now-60);
     tone(820+pr*900,1250+pr*900,.14,'triangle',.04);try{VFX.shatter(px,py,['#d6c6ff','#7fe9ff','#ffffff'],4+(pr*6|0))}catch(_){}shake=Math.max(shake,.03);return true}}
   const nat=inb&&(b==GEODE||b==CACHE)&&!(edits[k]&&edits[k][0]==b)&&(b==GEODE?GE:CA).includes(k),nd=drops.length;const r=_ba.apply(this,arguments);
   if(r&&inb&&(b==GEODE||b==CACHE)&&!tiles[k]){for(let i=drops.length-1;i>=nd;i--)if(drops[i].k===b)drops.splice(i,1);if(nat)try{b==GEODE?crack(x,y,k):dig(x,y,k)}catch(e){console.error('DEPTH8',e)}}return r}}
 // ---- indicator
 let el=null,elT=0,band=null,blend=0,tintB=null,amb=0,ambS=2,uiT=0,hintT=0,depth=0,dropT=0;
 function ui(){if(el&&el.isConnected)return el;el=document.createElement('div');el.id='dz8';el.setAttribute('role','status');el.innerHTML='<i class="dz8i" aria-hidden="true"></i><div><small></small><b></b><em></em><span class="dz8h"></span></div>';document.body.appendChild(el);return el}
 function counts(b){const w=wr();let f=0,n=0;const has=k=>S.some(r=>r.k==k);
  const games=k=>{const a=S.filter(r=>r.k==k);n+=a.length;f+=a.filter(r=>w.mg[r.id]&&w.mg[r.id].won).length};
  if(b.id=='hollow'){const gs=S.filter(r=>r.k=='grove');n=gs.length+CA.length;f=gs.filter(r=>w.gd[r.id]).length+w.cb.filter(k=>CA.includes(k)).length;games('mole')}
  else if(b.id=='crystal'){const ps=S.filter(r=>r.k=='reso');n=ps.length+GE.length;f=ps.filter(r=>w.p[r.id]).length+w.gb.filter(k=>GE.includes(k)).length;games('gal')}
  else{const vs=S.filter(r=>r.k=='vault');n=vs.length;f=vs.filter(r=>w.v[r.id]).length;games('forge')}return{f,n,has}}
 // DOM writes only when a value changed (this runs 5 times a second)
 const tx2=(e,s,v)=>{const q=e.querySelector(s);if(q&&q.textContent!==v)q.textContent=v},cv2=(e,k,v)=>{if(e.style.getPropertyValue(k)!==v)e.style.setProperty(k,v)};
 function render(){const e=ui(),now=performance.now();
  if(band){const c=counts(band);cv2(e,'--dz',band.c);tx2(e,'small','Entering');tx2(e,'b',band.n);tx2(e,'em',(depth|0)+' m deep · '+c.f+'/'+c.n+' found');tx2(e,'.dz8h',band.h);e.classList.toggle('mini',now>elT);e.classList.add('on')}
  else e.classList.remove('on')}
 function enter(b){elT=performance.now()+4200;try{const e=ui();e.classList.remove('mini','on');void e.offsetWidth}catch(_){}tone(392,392*1.5,.5,'sine',.025);tone(588,588,.7,'sine',.015,.12);
  if(!db.zone[b.id]){db.zone[b.id]=1;save();pay(0,40);const q=RW();if(q){q.fan('discover');q.card({kind:'zone',kick:'New zone discovered',title:b.n,xp:40,tier:2,ms:3600})}}render()}
 function ambient(dt,b){if(!b||OPT.q<.3||typeof VFX=='undefined')return;const vw=cv.width/ZM,vh=cv.height/ZM,red=QM.reduce;amb+=dt*(b.id=='magma'?7:b.id=='crystal'?4.5:5)*Math.min(1.2,QM.vfxK)*(red?.3:1);
  while(amb>=1){amb--;const x=cam.x+R0()*vw,y=cam.y+R0()*vh;if(solidAt(Math.floor(x/T),Math.floor(y/T)))continue;
   if(b.id=='hollow')VFX.add(0,R0()<.7?'#7affd8':'#c8ff9a',x,y,(R0()-.5)*16,-8-R0()*14,2.6+R0()*1.6,7,3,{d:.2,g:-2,a:.6});
   else if(b.id=='crystal')VFX.add(1,R0()<.6?'#d8c8ff':'#9fe8ff',x,y,0,-4,1.4+R0(),3,11,{d:.5,r:R0()*6,vr:(R0()-.5)*2,a:.75});
   else VFX.add(0,R0()<.75?'#ff9a4a':'#ffd36a',x,y,(R0()-.5)*30,-40-R0()*50,2+R0()*1.2,6,2,{d:.15,g:-10,a:.8})}
  ambS-=dt;if(ambS>0)return;ambS=3+R0()*4;
  if(b.id=='hollow'){const f=1500+R0()*700;tone(f,f*.55,.07,'sine',.02);tone(f*.8,f*.45,.07,'sine',.008,.28)}
  else if(b.id=='crystal'){const P5=[1047,1175,1319,1568,1760,2093],a=P5[R0()*6|0],c=P5[R0()*6|0];tone(a,a,.9,'triangle',.009);tone(c,c,1.1,'sine',.007,.22)}
  else{tone(58,44,1.6,'sawtooth',.014);if(R0()<.6)tone(190,110,.14,'sine',.016,.5)}}
 // ---- per frame
 function tick(dt){if(!entered||cur=='plaza'||creatorOn){if(el)el.classList.remove('on');band=null;blend=0;return}
  const tx=Math.max(0,Math.min(W-1,P.x/T|0));depth=(P.y+P.h/2)/T-sh(tx);let nb=null;for(const b of BANDS)if(depth>=b.d0&&depth<b.d1){nb=b;break}
  if(band&&nb!==band&&depth>=band.d0-1.5&&depth<band.d1+1.5)nb=band;if(nb!==band){band=nb;if(nb)enter(nb)}
  blend+=((band?1:0)-blend)*Math.min(1,dt*1.6);if(band)tintB=band;ambient(dt,band);
  // depth records
  const d=Math.floor(depth);if(d>db.best){db.best=d;let m=0,g=0;for(const q of[15,30,45,60,75])if(d>=q&&!db.ms[q]){db.ms[q]=1;m=q;g+=q*2}/* a long fall past several marks pays them all in one card */
   if(m){const xp=Math.round(g*1.5),tr=m>=60?3:m>=30?2:1;pay(g,xp);save();const q=RW();if(q){q.celebrate(P.x,P.y+P.h,q.RC[tr],{d:1.4,s:.9,n:20});q.fly(P.x,P.y,g);q.fan('ach');q.card({kind:'depth',kick:'New depth record',title:m+' m below the surface',gems:g,xp,tier:tr})}}else if(!(d%5))save()}
  const t=performance.now()/1000;
  for(const r of S){if(Math.abs(ctr(r)-P.x)>T*30){if(r.st=='play')r.st='idle';continue}   // walking away ends a mini game
   if(r.k=='mole')moleTick(r,dt);else if(r.k=='gal')galTick(r,dt);else if(r.k=='forge')forgeTick(r,dt);
   if(r.k=='grove'&&ready(r)){const cy=P.y+P.h/2;for(let j=0;j<r.caps.length;j++){if(r.got.has(j))continue;const p=spore(r,j,t);if(Math.abs(p.x-P.x)<28&&p.y>P.y-20&&p.y<P.y+P.h+12)collect(r,j,p)}}
   else if(r.k=='reso'){for(let j=0;j<4;j++)r.lit[j]=Math.max(0,r.lit[j]-dt);r.bad=Math.max(0,r.bad-dt);
    if(r.st=='show'){r.tm-=dt;if(r.tm<=0){if(r.i<r.seq.length){const j=r.seq[r.i++];r.lit[j]=.42;note(j);r.tm=.64}else{r.st='input';r.step=0;r.idle=0}}}
    else if(r.st=='input'){r.idle+=dt;if(r.idle>15)r.st='idle'}else if(r.st=='fail'){r.tm-=dt;if(r.tm<=0)r.st='idle'}else if(r.st=='win'){r.tm-=dt;if(r.tm<=0)solve(r)}}
   else if(r.k=='vault'&&!wr().v[r.id]&&r.killed<3){for(let i=r.gs.length-1;i>=0;i--){const m=r.gs[i];if(m.hp<=0||m.dead){r.gs.splice(i,1);r.killed++;try{ft(m.x,m.y-20,'Guardian '+r.killed+'/3','#ffb080');const q=RW();if(q)q.sparkle(m.x,m.y+m.h/2,'#ff9a4a',12,200)}catch(_){}if(r.killed>=3)unseal(r)}else if(!mobs.includes(m))r.gs.splice(i,1)}
    if(r.killed<3&&!r.gs.length&&near(r,(r.rw+1)*T,T*4))awaken(r)}}
  // caches and geodes give themselves away with a faint glint when you are close
  hintT-=dt;if(hintT<=0&&typeof VFX!='undefined'){hintT=.35;for(const arr of[CA,GE])for(const k of arr){const b=tiles[k];if(b!=CACHE&&b!=GEODE)continue;const x=(k%W)*T,y=(k/W|0)*T;if(Math.abs(x-P.x)>T*9||Math.abs(y-P.y)>T*7||R0()<.4)continue;VFX.add(1,b==CACHE?'#ffe08a':'#e2d6ff',x+T*(.15+R0()*.7),y+T*(.15+R0()*.7),0,-10,.7,2,b==CACHE?10:8,{a:.9,r:R0()*3})}}
  dropT-=dt;if(dropT<=0){dropT=.5;for(let i=drops.length-1;i>=0;i--)if(drops[i].k===GEODE||drops[i].k===CACHE)drops.splice(i,1)}
  uiT-=dt;if(uiT<=0){uiT=.2;render()}}
 {const _et=evTick;evTick=function(dt){_et(dt);try{tick(dt)}catch(e){if(!tick.e){tick.e=1;console.error('DEPTH8',e)}}}}
 // ---- drawing: site art behind the characters (lit by the lighting pass), glows / spores / labels after it
 function drawBack(now){if(!S.length||cur=='plaza')return;const vw=cv.width/ZM,vh=cv.height/ZM,t=now/1000,lamps=[],w=wr();
  for(const r of S){const cx=ctr(r)-cam.x,by=r.fy*T-cam.y;if(cx<-(r.rw+3)*T||cx>vw+(r.rw+3)*T||by<-160||by>vh+220)continue;
   if(r.k=='grove'){for(const c of r.caps){const s=c.sz,wd=44*s,h=52*s;g.save();g.translate(c.x-cam.x,by);g.rotate(Math.sin(t*.8+c.ph)*.04);g.drawImage(CAPS[c.hue],-wd/2,-h,wd,h);g.restore()}lamps.push(cx,by-30)}
   else if(r.k=='reso'){for(let j=0;j<4;j++)g.drawImage(PIL[j],pillX(r,j)-cam.x-18,by-100,36,100);lamps.push(cx,by-50)}
   else if(r.k=='forge'){g.drawImage(FRG,cx-60,by-84);lamps.push(cx-32,by-14,cx+29,by-46)}
   else if(r.k=='mole'){for(let j=0;j<5;j++){const x=holeX(r,j)-cam.x,m=r.mo[j],u=m.u;if(u>.02){const sq=m.bonk>0?.7:1,h=44*u*sq;g.drawImage(MOLS[m.gold],0,0,40,44*u,x-20*(2-sq),by-8-h,40*(2-sq),h)}g.drawImage(MND,x-28,by-22)}lamps.push(cx,by-30)}
   else if(r.k=='gal'){for(const s of[-1,1])for(let j=0;j<2;j++)g.drawImage(PIL[(j*2+(s>0?1:0))%4],cx+s*(r.rw-1.2-j*.9)*T-11,by-62+j*16,22,62-j*16);lamps.push(cx,by-80)}
   else if(r.k=='vault'){for(const s of[-5,5])g.drawImage(COL,cx+s*T-22,by-128);g.drawImage(w.v[r.id]?CHO:CHC,cx-35,by-64);lamps.push(cx,by-40,cx-5*T,by-110,cx+5*T,by-110)}}
  if(lamps.length)lampL.unshift(...lamps.slice(0,10))}
 {const _dn=drawNPCs;drawNPCs=function(now){try{drawBack(now)}catch(e){if(!drawBack.e){drawBack.e=1;console.error('DEPTH8 draw',e)}}return _dn(now)}}
 function label(g2,x,y,txt,c){g2.font='700 12px '+(typeof FONT!='undefined'?FONT:'system-ui');g2.textAlign='center';const tw=g2.measureText(txt).width+18;g2.fillStyle='rgba(20,16,32,.8)';g2.beginPath();g2.roundRect(x-tw/2,y-14,tw,20,10);g2.fill();if(c){g2.strokeStyle=c;g2.lineWidth=1.2;g2.stroke()}g2.fillStyle='#fff';g2.fillText(txt,x,y+1)}
 // a floating gallery crystal: a faceted shard (a rainbow prism is bigger), fading in and out, bursting when hit
 function drawCrystal(g2,c,ccx,ccy){const p=tgPos(c),a=c.pop>0?c.pop/.3:Math.min(1,c.t/.25,(c.life-c.t)/.3);if(a<=0)return;const s=(c.pr?15:11)*(c.pop>0?1.5-c.pop:1),col=c.pr?'#ffffff':PC[c.hue];
  g2.save();g2.globalAlpha=a;g2.translate(p.x-ccx,p.y-ccy);g2.rotate(Math.sin(c.t*2+c.ph)*.25);g2.lineJoin='round';g2.strokeStyle='#1a1430';g2.lineWidth=2;
  const gr=g2.createLinearGradient(-s,-s,s,s);if(c.pr){['#ff9ad8','#ffd36a','#9dff8a','#7fe9ff','#b48cff'].forEach((q,i)=>gr.addColorStop(i/4,q))}else{gr.addColorStop(0,'#ffffff');gr.addColorStop(.4,col);gr.addColorStop(1,mixc(col,.55))}
  g2.fillStyle=gr;g2.beginPath();g2.moveTo(0,-s*1.5);g2.lineTo(s*.8,-s*.3);g2.lineTo(s*.5,s*1.1);g2.lineTo(-s*.5,s*1.1);g2.lineTo(-s*.8,-s*.3);g2.closePath();g2.fill();g2.stroke();
  g2.strokeStyle='rgba(255,255,255,.7)';g2.lineWidth=1.2;g2.beginPath();g2.moveTo(0,-s*1.4);g2.lineTo(0,s);g2.moveTo(-s*.75,-s*.3);g2.lineTo(s*.75,-s*.3);g2.stroke();g2.restore()}
 // the forge bar: the gold zone (a brighter perfect strip in its middle), the swinging needle, and one dot per strike
 function forgeBar(g2,r,cx,y){const bw=170,x0=cx-bw/2;g2.save();g2.fillStyle='rgba(20,12,10,.85)';g2.strokeStyle='#ff8a3a';g2.lineWidth=1.5;g2.beginPath();g2.roundRect(x0-8,y-14,bw+16,40,10);g2.fill();g2.stroke();
  g2.fillStyle='#3a2420';g2.fillRect(x0,y-6,bw,12);g2.fillStyle='#e8a83a';g2.fillRect(x0+(r.zc-r.wz/2)*bw,y-6,r.wz*bw,12);g2.fillStyle='#fff3b0';g2.fillRect(x0+(r.zc-r.wz*.18)*bw,y-6,r.wz*.36*bw,12);
  const nx=x0+needle(r)*bw;g2.fillStyle='#ffffff';g2.fillRect(nx-1.5,y-10,3,20);g2.beginPath();g2.moveTo(nx-5,y-12);g2.lineTo(nx+5,y-12);g2.lineTo(nx,y-6);g2.closePath();g2.fill();
  for(let i=0;i<MG.forge.n;i++){const v=r.res[i];g2.fillStyle=v==null?'#5a4a44':v==2?'#ffe08a':v?'#ffffff':'#ff6a6a';g2.beginPath();g2.arc(cx+(i-2)*16,y+17,4,0,6.3);g2.fill()}g2.restore()}
 function drawTop(g2,ccx,ccy){if(!entered||cur=='plaza')return;const now=performance.now(),t=now/1000,vw=cv.width/ZM,vh=cv.height/ZM;
  if(blend>.01&&tintB){g2.save();g2.globalAlpha=Math.min(1,blend)*.8;g2.drawImage(vig(tintB),0,0,vw,vh);g2.restore()}
  if(!S.length)return;const w=wr(),vis=[];for(const r of S){const cx=ctr(r)-ccx,by=r.fy*T-ccy;if(cx>-(r.rw+3)*T&&cx<vw+(r.rw+3)*T&&by>-160&&by<vh+220)vis.push([r,cx,by])}if(!vis.length)return;
  g2.save();g2.globalCompositeOperation='lighter';
  for(const[r,cx,by]of vis){
   if(r.k=='grove'){const rd=ready(r);for(let j=0;j<r.caps.length;j++){const c=r.caps[j],x=c.x-ccx,cc=CAPC[c.hue];g2.globalAlpha=(rd?.4:.18)+.12*Math.sin(t*2+c.ph);g2.drawImage(GL(cc),x-30*c.sz,by-50*c.sz-14,60*c.sz,40*c.sz);
     if(rd&&!r.got.has(j)){const p=spore(r,j,t),s=20+4*Math.sin(t*3+j);g2.globalAlpha=.85;g2.drawImage(GL(cc),p.x-ccx-s,p.y-ccy-s,s*2,s*2);g2.globalAlpha=1;g2.drawImage(GL('#ffffff'),p.x-ccx-6,p.y-ccy-6,12,12)}}}
   else if(r.k=='reso'){const sv=w.p[r.id];for(let j=0;j<4;j++){const x=pillX(r,j)-ccx,l=r.lit[j]>0?Math.min(1,r.lit[j]/.2):0;g2.globalAlpha=sv?.5+.15*Math.sin(t*2+j):.16+l*.84;const s=46+l*44;g2.drawImage(GL(r.bad>0?'#ff4a5a':PC[j]),x-s,by-62-s,s*2,s*2)}}
   else if(r.k=='forge'){const f=.8+.14*Math.sin(t*9)+.06*Math.sin(t*23),hot=r.st=='play'?1:.6;g2.globalAlpha=.9*f*hot;g2.drawImage(GL('#ff6a2a'),cx-62,by-40,60,44);g2.globalAlpha=.7*f*hot;g2.drawImage(GL('#ff9a3a'),cx+10,by-60,38,26);
    if(r.fl>0){g2.globalAlpha=Math.min(1,r.fl/.15);const s=40+(r.lr||0)*30;g2.drawImage(GL(r.lr==2?'#ffe08a':r.lr?'#ffb060':'#a0a0a0'),cx+29-s,by-44-s,s*2,s*2)}}
   else if(r.k=='mole'){for(let j=0;j<5;j++){const m=r.mo[j];if(m.gold&&m.u>.2){g2.globalAlpha=.6*m.u;g2.drawImage(GL('#ffd36a'),holeX(r,j)-ccx-34,by-70,68,64)}}}
   else if(r.k=='gal'){for(const c of r.tg){const p=tgPos(c),a=c.pop>0?c.pop/.3:Math.min(1,c.t/.25,(c.life-c.t)/.3),s=(c.pr?34:26)*(c.pop>0?1.6-c.pop:1);g2.globalAlpha=.7*a;g2.drawImage(GL(c.pr?'#ffffff':PC[c.hue]),p.x-ccx-s,p.y-ccy-s,s*2,s*2)}}
   else if(r.k=='vault'){const f=.8+.2*Math.sin(t*8);for(const s of[-5,5]){g2.globalAlpha=.7*f;g2.drawImage(GL('#ff7a3a'),cx+s*T-30,by-148,60,60)}const op=w.v[r.id];if(!op&&r.killed>=3){g2.globalAlpha=.6+.3*Math.sin(t*4);g2.drawImage(GL('#ffd36a'),cx-60,by-90,120,90)}
    for(const m of r.gs){if(m.hp<=0)continue;g2.globalAlpha=.55+.25*Math.sin(t*6);g2.strokeStyle='#ff5a2a';g2.lineWidth=3;g2.beginPath();g2.ellipse(m.x-ccx,m.y+m.h-ccy,m.w*.75,m.w*.22,0,0,6.3);g2.stroke()}}}
  g2.restore();
  for(const[r,cx,by]of vis){const nr=Math.abs(P.x-ctr(r))<T*(r.rw+4)&&Math.abs(P.y-(r.fy-2)*T)<T*6;
   if(r.k=='vault'&&!w.v[r.id]&&r.killed<3){g2.save();g2.strokeStyle='#c9c6d8';g2.lineWidth=3;g2.setLineDash([6,4]);g2.beginPath();g2.moveTo(cx-30,by-52);g2.lineTo(cx+30,by-14);g2.moveTo(cx+30,by-52);g2.lineTo(cx-30,by-14);g2.stroke();g2.setLineDash([]);g2.fillStyle='#e8b83a';g2.strokeStyle='#160a08';g2.lineWidth=2;g2.beginPath();g2.roundRect(cx-8,by-40,16,14,3);g2.fill();g2.stroke();g2.restore()}
   if(r.k=='gal')for(const c of r.tg)drawCrystal(g2,c,ccx,ccy);
   if(r.st=='play'){const bob=Math.sin(t*4)*2;
    if(r.k=='mole'){label(g2,cx,by-96+bob,'Bonk!  '+r.sc+' / '+MG.mole.goal+'   ·   '+Math.ceil(Math.max(0,r.tm))+' s',MG.mole.c);continue}
    if(r.k=='gal'){label(g2,cx,by-(r.rh+.4)*T+bob,'Crystals  '+r.sc+' / '+MG.gal.goal+'   ·   '+Math.ceil(Math.max(0,r.tm))+' s',MG.gal.c);continue}
    if(r.k=='forge'){forgeBar(g2,r,cx,by-162);continue}}
   if(!nr)continue;const bob=Math.sin(t*4)*2;
   if(r.k=='reso'){const sv=w.p[r.id];label(g2,cx,by-150+bob,sv?'Resonance restored':r.st=='show'?'Listen...':r.st=='input'?'Strike the crystals in order  '+r.step+' / '+r.seq.length:r.st=='fail'?'Wrong note!':'Press E: listen to the crystals',sv?'#9fe0ff':PC[1])}
   else if(r.k=='mole'||r.k=='gal'||r.k=='forge'){const G=MG[r.k],s=w.mg[r.id],hi=db.hi[r.k]|0,cd=s&&s.cd>Date.now()?'   ·   rewards in '+fmt(s.cd-Date.now()):'',
     nm=r.k=='mole'?'Mole Rush: bonk '+G.goal+' points':r.k=='gal'?'Crystal Gallery: hit '+G.goal+' crystals':'Ember Forge: strike in the gold';
     label(g2,cx,by-(r.k=='mole'?96:r.k=='gal'?(r.rh+.4)*T:150)+bob,'Press E: '+nm+(hi?'   ·   best '+hi:'')+cd,G.c)}
   else if(r.k=='vault'){label(g2,cx,by-92+bob,w.v[r.id]?'Relic vault (empty)':r.killed>=3?'Press E: open the relic chest':r.gs.length?'Defeat the guardians  '+r.killed+' / 3':'A sealed relic vault','#ff7a3a')}
   else if(r.k=='grove'&&!ready(r))label(g2,cx,by-108+bob,'Regrowing  '+fmt((w.g[r.id]||0)-Date.now()),CAPC[0])}}
 {const _dp=BOSS6.drawProj;BOSS6.drawProj=function(g2,cx,cy){try{drawTop(g2,cx,cy)}catch(e){if(!drawTop.e){drawTop.e=1;console.error('DEPTH8 top',e)}}return _dp.apply(this,arguments)}}
 return{BANDS,MG,MATS,holeX,bonk,tgPos,shoot,needle,hammer,startMole,startGal,startForge,strike,CACHE,GEODE,sites:()=>S,caches:()=>CA,geodes:()=>GE,get band(){return band&&band.id},get depth(){return depth},get db(){return db},wr,save,reload:load,spore,pillX,hit,listen,use,counts,el:()=>el,
  find:k=>S.find(r=>r.k==k)}})();
