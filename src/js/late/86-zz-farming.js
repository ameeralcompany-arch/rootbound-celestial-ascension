// ===== FARM9: crops you plant, water, watch grow and harvest at the right moment. Five crops (Carrot / Strawberry / Wheat / Pumpkin /
// Moon Melon) live in the same `trees` map as the old saplings (seed ids 80-84, items 180-184, produce materials 280-284), so they save,
// sync (5th edit field = watered-until) and get removed exactly like saplings, and every old sapling keeps working unchanged.
//  - planting tills the soil (dirt / grass / turf only) · 5 visible growth stages with a pop + sparkle when a stage is reached
//  - click a growing crop with anything to WATER it: 2x growth for 45 s (wet soil, drip sparkles); rain and the Neon Rain machine water
//    every crop for you · thirsty crops show a little water drop
//  - ripe crops bob and a golden timing ring closes in on them every 2.4 s: harvest while the ring glows = PERFECT. Quality stars:
//    1 base, +1 if it was ever watered, +1 perfect timing (yield x1 / x1.5 / x2); left ripe for 5 minutes it wilts (half yield)
//  - harvest: produce + seeds fly to you, gems, Farming XP, quests / daily tasks (stats.harvest / plant), milestones with reward cards
// Sprites are pre-rendered once per crop/stage at 2x; per frame a crop is two drawImage calls plus a tiny transform. =====
const FARM9=(()=>{
 const R=Math.random,WD=45000,PER=2400,PW=520,OVER=300000;
 const CROPS={80:{n:'Carrot',c:'#ff8a3a',grow:40,y:[2,3],xp:6,gem:[3,5],sp:12,lv:1},81:{n:'Strawberry',c:'#ff3a5a',grow:60,y:[3,4],xp:8,gem:[4,7],sp:20,lv:2},82:{n:'Wheat',c:'#e8c35a',grow:30,y:[3,5],xp:5,gem:[2,4],sp:8,lv:1},
  83:{n:'Pumpkin',c:'#ff8a1a',grow:150,y:[1,2],xp:22,gem:[12,18],sp:45,lv:4},84:{n:'Moon Melon',c:'#9adfff',grow:240,y:[1,2],xp:36,gem:[22,32],sp:90,lv:8}};
 const PROD={80:[280,6],81:[281,9],82:[282,5],83:[283,32],84:[284,60]};
 for(const id in CROPS){const c=CROPS[id];BLK[id]=[c.n,c.c,1];PRICE[id]=Math.max(1,Math.ceil(c.sp/5));LVREQ[id]=c.lv;const p=PROD[id];MAT[p[0]]={n:c.n,c:c.c,p:p[1]}}
 const isCrop=t=>!!t&&!!CROPS[t.s];
 const isSeed=it=>typeof it=='number'&&it>=180&&it<=184;
 const tone=(a,b,d,ty,v,dl)=>{try{SFX7.tone(a,b,d,ty,v,dl)}catch(_){}};
 const red=()=>{try{return !!(cel.opt.reduce||QM.reduce)}catch(_){return false}};
 const SOIL=new Set([1,2]);const soilOk=b=>!!b&&(SOIL.has(b)||/Dirt|Grass|Turf|Soil|Moss|Mud|Farm/.test((BLK[b]||[''])[0]));
 // ---- growth: progress = (now - planted + time spent watered) / grow time; watering bakes the bonus into p and opens a new window
 const GT=t=>CROPS[t.s].grow*1000;
 const ov=(t,now)=>t.w>0?Math.max(0,Math.min(now,t.w)-Math.max(t.p,t.w-WD)):0;
 const cp=(t,now)=>Math.min(1,Math.max(0,((now||Date.now())-t.p+ov(t,now||Date.now()))/GT(t)));
 function ripeAt(t){const g=GT(t);if(!(t.w>0))return t.p+g;const ws=Math.max(t.p,t.w-WD),we=Math.max(ws,t.w);if(t.p+g<=ws)return t.p+g;const x=ws+(g-(ws-t.p))/2;return x<=we?x:t.p+g-(we-ws)}
 const stageOf=p=>p>=1?4:p>=.7?3:p>=.38?2:p>=.12?1:0;
 const wet=(t,now)=>t.w>(now||Date.now());
 function bake(t,now){const o=ov(t,now);t.p-=o;t.w=now+WD}
 const phase=(t,now)=>((now-ripeAt(t))%PER+PER)%PER;
 const perfectNow=(t,now)=>phase(t,now)>PER-PW;
 const wilted=(t,now)=>now-ripeAt(t)>OVER;
 // ---- saved profile stats + milestones (per profile)
 const K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpfarm';let S={h:0,p:0,w:0,c:{},m:[],g:0};
 try{const o=JSON.parse(localStorage.getItem(K())||'null');if(o&&typeof o=='object'){S.h=o.h|0;S.p=o.p|0;S.w=o.w|0;S.g=o.g|0;S.m=Array.isArray(o.m)?o.m.filter(x=>typeof x=='string').slice(0,30):[];if(o.c&&typeof o.c=='object')for(const k in CROPS)S.c[k]=o.c[k]|0}}catch(_){}
 const save=()=>{try{localStorage.setItem(K(),JSON.stringify(S))}catch(_){}};
 const MILE=[['h5','First Harvests','Harvest 5 crops',s=>s.h>=5,60],['h25','Growing Green','Harvest 25 crops',s=>s.h>=25,180],['h100','Master Farmer','Harvest 100 crops',s=>s.h>=100,600],['p10','Perfect Timing','10 perfect harvests',s=>s.p>=10,250],['w30','Rain Maker','Water 30 crops',s=>s.w>=30,120]];
 function miles(){for(const[id,ti,sub,f,g]of MILE){if(S.m.includes(id)||!f(S))continue;S.m.push(id);gems+=g;try{stat('gems',g)}catch(_){}try{REW8.fly(P.x,P.y-20,g);REW8.card({kind:'ach',kick:'Farming milestone',title:ti,sub,gems:g,tier:g>=500?4:g>=200?3:2})}catch(_){try{say(ti+' +'+g+' gems')}catch(_){}}}save()}
 // ================= art =================
 const ART={},cvs=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const SW=56,SH=72; // logical sprite box; base centre at (28,68)
 function leaf(x,cx,cy,rx,ry,a,col){x.save();x.translate(cx,cy);x.rotate(a);x.fillStyle=col;x.beginPath();x.ellipse(0,0,rx,ry,0,0,6.283);x.fill();x.stroke();x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=.8;x.beginPath();x.moveTo(-rx*.8,0);x.lineTo(rx*.8,0);x.stroke();x.restore()}
 function frond(x,len,a,col){x.save();x.rotate(a);x.strokeStyle=col;x.lineWidth=2;x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(2,-len*.5,0,-len);x.stroke();x.fillStyle=col;for(let i=1;i<5;i++){const y=-len*i/5;x.beginPath();x.ellipse(-3,y,3.2,1.5,.6,0,6.283);x.ellipse(3,y-1,3.2,1.5,-.6,0,6.283);x.fill()}x.restore()}
 function sprout(x,s){x.strokeStyle='#3e8a34';x.lineWidth=2;x.beginPath();x.moveTo(0,0);x.lineTo(0,-6*s);x.stroke();x.lineWidth=1.4;x.strokeStyle='#1b3a14';leaf(x,-4*s,-7*s,4.5*s,2.4*s,-.5,'#7ad35a');leaf(x,4*s,-8*s,4.5*s,2.4*s,.5,'#8be06a')}
 function berry(x,cx,cy,r,col){x.fillStyle=col;x.beginPath();x.moveTo(cx,cy+r*1.2);x.quadraticCurveTo(cx-r*1.3,cy+r*.1,cx-r*.7,cy-r*.6);x.quadraticCurveTo(cx,cy-r*1.1,cx+r*.7,cy-r*.6);x.quadraticCurveTo(cx+r*1.3,cy+r*.1,cx,cy+r*1.2);x.fill();x.stroke();
  if(col!='#9ad86a'){x.fillStyle='#ffe58a';for(let i=0;i<4;i++)x.fillRect(cx-r*.5+(i%2)*r*.6,cy-r*.2+(i>>1)*r*.5,1,1)}x.fillStyle='#3e8a34';x.beginPath();x.moveTo(cx-r*.7,cy-r*.6);x.lineTo(cx,cy-r*.2);x.lineTo(cx+r*.7,cy-r*.6);x.lineTo(cx,cy-r*1.1);x.closePath();x.fill()}
 function gourd(x,cx,cy,rw,rh,col,rib,stem){x.fillStyle=col;x.beginPath();x.ellipse(cx,cy,rw,rh,0,0,6.283);x.fill();x.stroke();x.strokeStyle=rib;x.lineWidth=1.2;for(const k of[-.5,0,.5]){x.beginPath();x.ellipse(cx+k*rw*.9,cy,rw*.32,rh*.95,0,0,6.283);x.stroke()}x.strokeStyle='#1b1410';x.lineWidth=1.4;
  x.fillStyle='rgba(255,255,255,.3)';x.beginPath();x.ellipse(cx-rw*.4,cy-rh*.4,rw*.25,rh*.18,-.4,0,6.283);x.fill();if(stem){x.fillStyle=stem;x.fillRect(cx-1.5,cy-rh-4,3,5);x.strokeRect(cx-1.5,cy-rh-4,3,5)}}
 const DRAW={
  80(x,st){if(st==1)return sprout(x,1);const L=st==2?14:st==3?20:24,col=st==4?'#4fb83a':'#5cc444';if(st>=3){x.fillStyle='#ff8a3a';x.strokeStyle='#1b1410';x.lineWidth=1.4;const w=st==4?10:5;x.beginPath();x.moveTo(-w,0);x.quadraticCurveTo(-w,-w*1.1,0,-w*1.2);x.quadraticCurveTo(w,-w*1.1,w,0);x.closePath();x.fill();x.stroke();x.strokeStyle='#c85a1a';x.lineWidth=1;x.beginPath();x.moveTo(-w*.5,-w*.5);x.lineTo(w*.2,-w*.5);x.stroke()}
   for(const a of(st==2?[-.35,.1,.45]:[-.55,-.2,.15,.5]))frond(x,L*(1-Math.abs(a)*.3),a,col)},
  81(x,st){if(st==1)return sprout(x,1);x.strokeStyle='#1b3a14';x.lineWidth=1.3;const s=st==2?.75:1,lc=st==4?'#3fa83a':'#4cb844';
   for(const[a,d]of[[-1.1,12],[-.35,15],[.35,15],[1.1,12],[0,18]]){x.save();x.rotate(a*.6);for(const q of[-.5,0,.5])leaf(x,q*6*s,-d*s-Math.abs(q)*-3,4.2*s,3.2*s,q,lc);x.restore()}
   if(st==3){x.fillStyle='#fff';for(const[fx,fy]of[[-8,-16],[7,-19]]){for(let i=0;i<5;i++){x.beginPath();x.arc(fx+Math.cos(i*1.256)*2.2,fy+Math.sin(i*1.256)*2.2,1.6,0,6.283);x.fill()}x.fillStyle='#ffd34a';x.beginPath();x.arc(fx,fy,1.2,0,6.283);x.fill();x.fillStyle='#fff'}x.strokeStyle='#1b1410';berry(x,0,-9,3.4,'#9ad86a')}
   if(st==4){x.strokeStyle='#1b1410';x.lineWidth=1.2;berry(x,-10,-8,5.2,'#ff3a5a');berry(x,9,-10,5.4,'#ff3a5a');berry(x,0,-18,5,'#ff4a64');berry(x,-2,-4,4.4,'#e8304e')}},
  82(x,st){const H=st==1?8:st==2?18:st==3?30:34,col=st==4?'#d9a93a':'#5cc444',hd=st==4?'#f2cf5a':'#a8dc6a';x.lineCap='round';
   for(let i=0;i<(st==1?2:6);i++){const a=(i-(st==1?.5:2.5))*.14+(st==4?.12:0),h=H*(.82+((i*37)%5)/25);x.save();x.rotate(a);x.strokeStyle=col;x.lineWidth=1.8;x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(st==4?3:1,-h*.6,st==4?h*.12:0,-h);x.stroke();
    if(st>=3){x.fillStyle=hd;x.strokeStyle='#5a4010';x.lineWidth=.8;for(let k=0;k<5;k++){const yy=-h+k*2.8+1,xx=(st==4?h*.12:0)-k*.2;x.beginPath();x.ellipse(xx-1.6,yy,1.8,2.6,-.5,0,6.283);x.ellipse(xx+1.6,yy+.5,1.8,2.6,.5,0,6.283);x.fill();x.stroke()}}
    else if(st==2){x.strokeStyle='#4cb844';x.lineWidth=1.4;x.beginPath();x.moveTo(0,-h*.4);x.quadraticCurveTo(5,-h*.55,7,-h*.4);x.stroke()}x.restore()}},
  83(x,st){if(st==1)return sprout(x,1);x.strokeStyle='#1b3a14';x.lineWidth=1.4;x.strokeStyle='#3e8a34';x.lineWidth=2;x.beginPath();x.moveTo(-20,-2);x.quadraticCurveTo(0,-6,20,-2);x.stroke();x.beginPath();x.arc(14,-9,3,0,5);x.stroke();x.strokeStyle='#1b3a14';x.lineWidth=1.3;
   const lv=st==2?[[-12,-8,7],[6,-10,8],[-2,-14,6]]:[[-16,-9,8],[16,-10,8],[-6,-17,7],[8,-19,7]];for(const[lx,ly,r]of lv){x.fillStyle='#4fae3e';x.beginPath();for(let i=0;i<5;i++){const a=i*1.256-1.57;x.arc(lx+Math.cos(a)*r*.45,ly+Math.sin(a)*r*.45,r*.55,0,6.283)}x.fill();x.stroke()}
   x.strokeStyle='#1b1410';if(st==3)gourd(x,2,-6,7,5.5,'#8fc85a','#5a8a3a','#5a7a2a');if(st==4)gourd(x,0,-11,16,11.5,'#ff8a1a','#c8540a','#6a8a2a')},
  84(x,st){if(st==1)return sprout(x,1);x.strokeStyle='#2a5a6a';x.lineWidth=2;x.beginPath();x.moveTo(-20,-2);x.quadraticCurveTo(0,-7,20,-2);x.stroke();x.lineWidth=1.3;x.strokeStyle='#14303a';
   const lv=st==2?[[-12,-8,7],[6,-10,8]]:[[-16,-9,8],[16,-10,8],[-4,-18,7]];for(const[lx,ly,r]of lv){x.fillStyle='#6ac8b0';x.beginPath();x.arc(lx,ly,r*.8,0,6.283);x.fill();x.stroke();x.strokeStyle='rgba(255,255,255,.4)';x.beginPath();x.moveTo(lx-r*.5,ly);x.lineTo(lx+r*.5,ly);x.stroke();x.strokeStyle='#14303a'}
   if(st==3)gourd(x,2,-6,7,5.5,'#a8e0d8','#6ab0b8',0);if(st==4){gourd(x,0,-11,15,11,'#bff4ff','#5ab8d8',0);x.fillStyle='#fffbd0';x.beginPath();for(let i=0;i<8;i++){const r=i%2?1.4:4,a=i*.785;x.lineTo(5+Math.cos(a)*r,-15+Math.sin(a)*r)}x.fill()}}};
 function sprite(c,st,wl){const key=c+'|'+st+'|'+(wl?1:0);if(ART[key])return ART[key];const s=cvs(SW*2,SH*2),x=s.getContext('2d');x.scale(2,2);x.translate(SW/2,SH-4);x.lineJoin='round';x.lineCap='round';x.strokeStyle='#1b1410';x.lineWidth=1.4;
  if(st==0){x.fillStyle='#5a3a1e';x.beginPath();x.ellipse(0,-1,9,3.4,0,Math.PI,0);x.fill();x.fillStyle='#e8d0a0';x.beginPath();x.ellipse(1,-3,2,1.4,.4,0,6.283);x.fill();x.stroke()}else try{DRAW[c](x,st)}catch(e){console.error('FARM9 art',e)}
  if(wl){x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(120,80,40,.55)';x.fillRect(0,0,s.width,s.height)}return ART[key]=s}
 // tilled soil strip (dry / wet), drawn over the top of the block under the crop
 function soil(w){const key='soil'+(w?1:0);if(ART[key])return ART[key];const s=cvs(T*2,24),x=s.getContext('2d');x.scale(2,2);x.fillStyle=w?'#3a2414':'#5e3c1e';x.beginPath();x.moveTo(2,4);x.quadraticCurveTo(T/2,0,T-2,4);x.lineTo(T-1,10);x.lineTo(1,10);x.closePath();x.fill();
  x.strokeStyle=w?'#24160a':'#3e2610';x.lineWidth=1.2;for(let i=0;i<4;i++){const xx=7+i*(T-14)/3;x.beginPath();x.moveTo(xx-4,5);x.quadraticCurveTo(xx,3,xx+4,5);x.stroke()}if(w){x.fillStyle='rgba(140,200,255,.45)';for(let i=0;i<5;i++)x.fillRect(5+i*9,6+(i%2)*2,3,1)}return ART[key]=s}
 // produce / seed icons (inventory, hotbar, store, flying pickups)
 function prodArt(x,c){x.save();x.translate(24,30);x.lineJoin='round';x.lineCap='round';x.strokeStyle='#1b1410';x.lineWidth=2;
  if(c==80){x.fillStyle='#ff8a3a';x.beginPath();x.moveTo(-9,-8);x.quadraticCurveTo(0,-14,9,-8);x.lineTo(1,16);x.quadraticCurveTo(0,18,-1,16);x.closePath();x.fill();x.stroke();x.strokeStyle='#c85a1a';x.lineWidth=1.4;for(const y of[-3,3,9]){x.beginPath();x.moveTo(-5+y*.25,y);x.lineTo(1,y);x.stroke()}x.strokeStyle='#1b1410';x.lineWidth=2;for(const a of[-.5,0,.5])frond(x,14,a,'#4fb83a')}
  else if(c==81){x.lineWidth=1.8;berry(x,0,2,11,'#ff3a5a')}
  else if(c==82){x.lineWidth=1.4;for(let i=-2;i<=2;i++){x.save();x.rotate(i*.16);x.strokeStyle='#b8862a';x.beginPath();x.moveTo(0,16);x.lineTo(0,-12);x.stroke();x.fillStyle='#f2cf5a';x.strokeStyle='#5a4010';for(let k=0;k<4;k++){x.beginPath();x.ellipse(-2,-14+k*4,2.2,3,-.5,0,6.283);x.ellipse(2,-13+k*4,2.2,3,.5,0,6.283);x.fill();x.stroke()}x.restore()}x.fillStyle='#d84a4a';x.fillRect(-7,6,14,4);x.strokeRect(-7,6,14,4)}
  else if(c==83){gourd(x,0,4,17,13,'#ff8a1a','#c8540a','#6a8a2a')}
  else{gourd(x,0,4,16,12,'#bff4ff','#5ab8d8',0);x.fillStyle='#fffbd0';x.beginPath();for(let i=0;i<8;i++){const r=i%2?1.8:5,a=i*.785;x.lineTo(6+Math.cos(a)*r,-1+Math.sin(a)*r)}x.fill()}x.restore()}
 const PI={};function prodImg(c){if(PI[c])return PI[c];const s=cvs(48,48);prodArt(s.getContext('2d'),c);return PI[c]=s}
 {const _mi=matIcon;matIcon=function(x,k,S){const c=k-200;if(!(k>=280&&k<=284))return _mi.apply(this,arguments);try{burstBG(x,S)}catch(_){}x.save();x.scale(S/48,S/48);prodArt(x,c);x.restore()}}
 {const _iu=iconURL;iconURL=function(k){if(!isSeed(k)||ICON[k])return _iu.apply(this,arguments);const c=k-100,cr=CROPS[c],s=cvs(64,64),x=s.getContext('2d');x.lineJoin='round';x.strokeStyle='#1b1410';x.lineWidth=2.5;
   x.fillStyle='#f4e6c8';x.beginPath();x.moveTo(14,8);x.lineTo(50,8);x.lineTo(52,58);x.lineTo(12,58);x.closePath();x.fill();x.stroke();x.fillStyle=cr.c;x.fillRect(13,8,38,9);x.strokeRect(13,8,38,9);x.fillStyle='#fff';x.globalAlpha=.5;x.fillRect(15,10,10,2);x.globalAlpha=1;
   x.save();x.translate(8,13);x.scale(1,1);prodArt(x,c);x.restore();x.fillStyle='#7a5a2a';for(let i=0;i<3;i++){x.beginPath();x.ellipse(22+i*10,52,2.2,1.5,.4,0,6.283);x.fill()}return ICON[k]=s.toDataURL()}}
 // ================= planting =================
 let tipT=0;const tip=m=>{const n=performance.now();if(n-tipT<1600)return;tipT=n;try{say(m)}catch(_){}};
 function plant(it){const tx=Math.floor((mx+cam.x)/T),ty=Math.floor((my+cam.y)/T);if(tx<1||ty<1||tx>=W-1||ty>=H-2)return;if(Math.hypot(tx*T+T/2-P.x,ty*T+T/2-(P.y+P.h/2))>REACH)return;const k=ty*W+tx;
  const tk=pickTree(mx+cam.x,my+cam.y);if(tk>=0&&isCrop(trees.get(tk))){harvest(tk);rcd=.3;return}
  if(cnt(it)<1)return;if(tiles[k]||trees.has(k))return;
  if(!soilOk(tiles[k+W]))return tip(tiles[k+W]?'Crops grow in soil — plant on dirt or grass':'Plant crops on top of dirt or grass');
  if(!canEdit()){if(performance.now()-lockWarned>1500){lockWarned=performance.now();say(lockMsg())}return}
  const c=it-100;addI(it,-1);if(tiles[k+W]==2){tiles[k+W]=1;hp[k+W]=BLK[1][2];pushEdit(k+W)}/* planting tills grass into soil */trees.set(k,{s:c,r:c,p:Date.now(),w:0});pushEdit(k);const px=tx*T+T/2,py=(ty+1)*T;
  burst(px,py-4,'#6a4422',7,80,3);burst(px,py-8,'#8be06a',4,60,2,'p');rings.push({x:px,y:py-6,c:'#bfffa8',t:performance.now()});tone(260,180,.08,'triangle',.05);tone(660,990,.12,'sine',.025,.06);
  try{G('plant')}catch(_){}try{xpGain('farm',3)}catch(_){}try{stat('plant',1)}catch(_){}try{qProgress('plant',1)}catch(_){}
  if(!S.tip1){S.tip1=1;save();try{UI6.say6('Planted '+CROPS[c].n,'Click it to water it (2× growth) · harvest when the golden ring glows for a perfect harvest',4200)}catch(_){}}}
 {const _pa=placeAction;placeAction=function(){try{if(typeof wrench=='function'&&wrench())return;const it=bar[sel];
   if(isSeed(it)){plant(it);return}
   if(typeof it=='number'&&it>=100&&it<200){const tk=pickTree(mx+cam.x,my+cam.y);if(tk>=0&&isCrop(trees.get(tk)))return}}catch(e){console.error('FARM9 plant',e)}return _pa.apply(this,arguments)}}
 // ================= watering =================
 function water(k,t,quiet){const now=Date.now();if(wet(t,now)&&t.w-now>WD*.5){if(!quiet)tip(CROPS[t.s].n+' is still nicely watered');return false}bake(t,now);pushEdit(k);S.w++;save();miles();
  if(quiet)return true;const px=(k%W)*T+T/2,py=(k/W|0)*T+T;burst(px,py-26,'#8fd8ff',9,110,3);burst(px,py-10,'#cfefff',5,70,2,'p');try{VFX.wave(px,py-4,'#8fd8ff',46,.35,.4)}catch(_){}
  try{SFX7.bloop(.7);SFX7.plip(.08);SFX7.plip(.16)}catch(_){}ft(px,py-56,'Watered! 2× growth','#9fdcff');
  if(!S.tip2){S.tip2=1;save();try{UI6.say6('Watered','Watered crops grow twice as fast for a while. Rain (and the Neon Rain machine) waters every crop for you.',3800)}catch(_){}}return true}
 // ================= harvest =================
 const Q=[];let lastCrop=-1;
 function reap(k,t){const now=Date.now(),c=t.s,cr=CROPS[c],px=(k%W)*T+T/2,py=(k/W|0)*T+T,wl=wilted(t,now),pf=!wl&&perfectNow(t,now),st=wl?0:1+(t.w>0?1:0)+(pf?1:0);
  lastCrop=k;trees.delete(k);pushEdit(k);
  const base=cr.y[0]+(R()*(cr.y[1]-cr.y[0]+1)|0),n=Math.max(1,Math.round(base*[.5,1,1.5,2][st])),mat=PROD[c][0];addI(mat,n);
  let sd=pf?1+(R()<.3?1:0):R()<.6?1:0;if(sd)addI(100+c,sd);
  const g=Math.round((cr.gem[0]+R()*(cr.gem[1]-cr.gem[0]))*(.5+st*.5));try{gain(g,px,py-60)}catch(_){gems+=g}
  try{xpGain('farm',Math.round(cr.xp*(.6+st*.4)))}catch(_){}try{qProgress('harvest',1)}catch(_){}try{stat('harvest',1)}catch(_){}try{G('harvest')}catch(_){}
  S.h++;if(pf)S.p++;S.c[c]=(S.c[c]|0)+1;save();
  // juice: bursts, produce flying to you, stars, sounds
  const col=cr.c;burst(px,py-22,col,14,200,5);burst(px,py-22,'#8be06a',8,160,4);burst(px,py-26,'#fff3c0',8,130,3,'p');rings.push({x:px,y:py-20,c:pf?'#ffd84a':col,t:performance.now()});try{shake=Math.max(shake,pf?.1:.05)}catch(_){}
  for(let i=0;i<Math.min(6,n+sd);i++)Q.push({x:px+(R()-.5)*14,y:py-24,vx:(R()-.5)*160,vy:-260-R()*160,t:-i*.06,c:i<n?c:-c,d:.62+R()*.15});
  const stars='★'.repeat(st)+(st<3?'☆'.repeat(3-st):'');ft(px,py-74,'+'+n+' '+cr.n+'  '+stars,pf?'#ffe066':wl?'#c8a888':'#ffffff');
  if(pf){ft(px,py-96,'PERFECT HARVEST!','#ffd84a');try{REW8.confetti(px,py-30,12,['#ffd84a','#fff3c0','#8be06a',col]);REW8.sparkle(px,py-30,'#ffd84a',10,170);VFX.wave(px,py-10,'#ffd84a',90,.5,.35);REW8.fly(px,py-50,g)}catch(_){}[784,988,1175,1568].forEach((f,i)=>tone(f,f*1.01,.22,'triangle',.04,i*.05));tone(2093,2100,.5,'sine',.02,.22)}
  else if(wl){ft(px,py-96,'Wilted… harvest sooner next time','#d8b8a0');tone(330,220,.2,'triangle',.04)}
  else{tone(523,659,.12,'triangle',.05);tone(784,990,.16,'triangle',.04,.07)}
  miles();setTimeout(()=>{if(lastCrop===k)lastCrop=-1},0)}
 {const _h=harvest;harvest=function(k){const t=trees.get(k);if(!isCrop(t))return _h.apply(this,arguments);
   if(!canEdit()){if(performance.now()-lockWarned>1500){lockWarned=performance.now();say(lockMsg())}return}
   const now=Date.now();if(cp(t,now)<1){water(k,t);return}reap(k,t)}}
 // hit box: the crop's own cell (plus a little above for tall crops) instead of the big tree canopy
 {const _tb=treeBox;treeBox=function(k,t){if(!isCrop(t))return _tb.apply(this,arguments);const x=k%W,y=k/W|0;return{x0:x*T+2,x1:(x+1)*T-2,y0:y*T-10,y1:(y+1)*T}}}
 // ================= drawing =================
 const near=(k,r)=>Math.abs((k%W)*T+T/2-P.x)<r*T&&Math.abs((k/W|0)*T-P.y)<r*T*.8;
 let dropS=null;function dropIcon(){if(dropS)return dropS;const s=cvs(28,32),x=s.getContext('2d');x.fillStyle='#fff';x.strokeStyle='#1b1410';x.lineWidth=2;x.beginPath();x.arc(14,14,11,0,6.283);x.fill();x.stroke();x.fillStyle='#4fb4ff';x.beginPath();x.moveTo(14,6);x.quadraticCurveTo(20,14,18,17);x.arc(14,17,4,0,Math.PI);x.quadraticCurveTo(8,14,14,6);x.fill();return dropS=s}
 let glowS=null;function glowSpr(){if(glowS)return glowS;const s=cvs(64,64),x=s.getContext('2d'),g2=x.createRadialGradient(32,32,0,32,32,32);g2.addColorStop(0,'rgba(190,240,255,.9)');g2.addColorStop(.4,'rgba(150,220,255,.35)');g2.addColorStop(1,'rgba(150,220,255,0)');x.fillStyle=g2;x.fillRect(0,0,64,64);return glowS=s}
 function drawCrop(k,t,now){const tn=Date.now(),x=k%W,y=k/W|0,bx=x*T+T/2-cam.x,by=(y+1)*T-cam.y,p=cp(t,tn),st=stageOf(p),wl=st==4&&wilted(t,tn),w=wet(t,tn),rd=red();
  if(t._st!==st){if(t._st!=null&&st>t._st){t._pop=now;if(near(k,9)){burst(x*T+T/2,(y+1)*T-18,'#c8ff9a',6,90,2,'p');tone(880+st*120,1100+st*140,.08,'sine',.02)}}t._st=st}
  g.drawImage(soil(w),bx-T/2,by-5,T,12);
  const sp=sprite(t.s,st,wl),pop=t._pop&&!rd?Math.max(0,1-(now-t._pop)/420):0,sc=1+Math.sin(pop*Math.PI)*.22,sway=rd?0:Math.sin(now/850+x*1.7)*(.03+(st>=3?.02:0))+(typeof ptype!='undefined'&&ptype=='storm'?Math.sin(now/240+x)*.05*wxI:0),bob=st==4&&!wl&&!rd?Math.sin(now/300+x)*1.2:0;
  g.save();g.translate(bx,by-2+bob);g.rotate(sway);g.scale(sc,sc*(wl?.9:1));g.drawImage(sp,-SW*.6,-SH*1.2+5,SW*1.2,SH*1.2);g.restore();
  if(t.s==84&&st==4&&!wl){const n=typeof night=='number'?night:0;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.35+n*.4+(rd?0:Math.sin(now/500+x)*.1);g.drawImage(glowSpr(),bx-30,by-44,60,60);g.restore()}
  const nb=near(k,7);
  if(st<4&&!w&&nb){const b=rd?0:Math.sin(now/260+x)*2;g.drawImage(dropIcon(),bx+6,by-T-14+b,16,18)}
  if(w&&st<4&&!rd&&R()<.012)VFX.add(1,'#9fdcff',x*T+T/2+(R()-.5)*20,(y+1)*T-6,0,-20,.6,8,2,{a:.8});
  // the harvest timing ring: closes in every PER ms; glows gold during the perfect window
  if(st==4&&!wl&&nb){const ph=phase(t,tn)/PER,pfN=ph>1-PW/PER,r=pfN?15:15+(1-ph)*16,cy2=by-18;g.save();g.lineWidth=pfN?3:1.6;g.strokeStyle=pfN?'rgba(255,216,74,.95)':'rgba(255,255,255,'+(.12+ph*.45)+')';g.beginPath();g.arc(bx,cy2,r,0,6.283);g.stroke();if(!pfN){g.strokeStyle='rgba(255,216,74,.25)';g.lineWidth=1;g.beginPath();g.arc(bx,cy2,15,0,6.283);g.stroke()}
   if(pfN){g.globalCompositeOperation='lighter';g.globalAlpha=.6;g.drawImage(glowSpr(),bx-26,by-44,52,52)}g.restore()}}
 {const _dt=drawTree;drawTree=function(k,t,now){if(!isCrop(t))return _dt.apply(this,arguments);try{drawCrop(k,t,now)}catch(e){if(!drawTree.e){drawTree.e=1;console.error('FARM9 draw',e)}}}}
 // hover: progress ring + status for the crop under the cursor; a ghost sprout where a held crop seed would go
 {const _dg=drawTarget;drawTarget=function(now){try{if(menuEl.style.display=='none'&&typeof mx!='undefined'&&!showInv){const wx=mx+cam.x,wy=my+cam.y,tk=pickTree(wx,wy),t=tk>=0?trees.get(tk):null;
    if(isCrop(t)&&Math.hypot((tk%W)*T+T/2-P.x,(tk/W|0)*T+T/2-(P.y+P.h/2))<REACH+T){const tn=Date.now(),p=cp(t,tn),bx=(tk%W)*T+T/2-cam.x,by=(tk/W|0)*T+T-cam.y,w=wet(t,tn);g.save();
     g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(bx,by-T-6,9,0,6.283);g.stroke();g.strokeStyle=p>=1?'#ffd84a':w?'#6fc8ff':'#8be06a';g.beginPath();g.arc(bx,by-T-6,9,-1.571,-1.571+p*6.283);g.stroke();
     const lab=p>=1?(wilted(t,tn)?'Wilted · click to harvest':'Ripe! click when the ring glows'):(w?'Watered · ':'Thirsty · click to water · ')+Math.floor(p*100)+'%';g.font='600 11px '+FONT;g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(10,10,20,.75)';g.strokeText(lab,bx,by-T-22);g.fillStyle='#fff';g.fillText(lab,bx,by-T-22);g.restore();return}
    const it=bar[sel];if(isSeed(it)&&cnt(it)>0){const tx=Math.floor(wx/T),ty=Math.floor(wy/T),k=ty*W+tx,inR=Math.hypot(tx*T+T/2-P.x,ty*T+T/2-(P.y+P.h/2))<REACH;if(inR&&tx>0&&ty>0&&tx<W-1&&ty<H-2&&!tiles[k]&&!trees.has(k)){const ok=soilOk(tiles[k+W]),px=tx*T-cam.x,py=ty*T-cam.y,pl=.5+.5*Math.sin(now/260);g.save();
      if(ok){g.globalAlpha=.55+.2*pl;g.drawImage(sprite(it-100,1,0),px+T/2-SW/2,py+T-SH+2,SW,SH);g.globalAlpha=1;g.strokeStyle='rgba(190,255,150,'+(.5+.3*pl)+')'}else g.strokeStyle='rgba(255,150,130,.6)';g.lineWidth=2;g.setLineDash([5,4]);g.strokeRect(px+2,py+2,T-4,T-4);g.restore();return}}}}catch(e){if(!drawTarget.e){drawTarget.e=1;console.error('FARM9 hover',e)}}return _dg.apply(this,arguments)}}
 // flying pickups (world space, drawn with the projectiles)
 function tickQ(dt){for(let i=Q.length-1;i>=0;i--){const q=Q[i];q.t+=dt;if(q.t<0)continue;if(q.t<.28){q.vy+=900*dt;q.x+=q.vx*dt;q.y+=q.vy*dt}else{const u=Math.min(1,(q.t-.28)/(q.d-.28)),tx=P.x,ty=P.y+P.h*.4;q.x+=(tx-q.x)*Math.min(1,u*u*.6+dt*6);q.y+=(ty-q.y)*Math.min(1,u*u*.6+dt*6)}
  if(q.t>=q.d){Q.splice(i,1);if(!tickQ.s||performance.now()-tickQ.s>60){tickQ.s=performance.now();tone(1200,1600,.05,'sine',.018)}}}}
 function drawQ(g2,cx,cy){for(const q of Q){if(q.t<0)continue;const s=q.c>0?22:18,img=q.c>0?prodImg(q.c):null;g2.save();g2.translate(q.x-cx,q.y-cy);g2.rotate(q.t*4);if(img)g2.drawImage(img,-s/2,-s/2,s,s);else{g2.fillStyle='#e8d0a0';g2.strokeStyle='#1b1410';g2.lineWidth=1.4;g2.beginPath();g2.ellipse(0,0,4,2.6,.5,0,6.283);g2.fill();g2.stroke()}g2.restore()}}
 // rain (and forced rain from the Neon Rain machine) waters every growing crop in the loaded world
 let rainT=0;function tick(dt){tickQ(dt);rainT-=dt;if(rainT>0||!entered)return;rainT=2;const raining=typeof wxN!='undefined'&&(wxN=='rain'||wxN=='storm');if(!raining)return;const now=Date.now();
  for(const[k,t]of trees){if(!isCrop(t)||cp(t,now)>=1)continue;if(!(t.w>now+WD*.4)){bake(t,now);pushEdit(k);if(near(k,10)&&R()<.5)burst((k%W)*T+T/2,(k/W|0)*T+T-20,'#9fdcff',3,50,2,'p')}}}
 {const _t=BOSS6.tick,_dp=BOSS6.drawProj;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){console.error('FARM9',e)}};BOSS6.drawProj=function(g2,cx,cy){_dp.call(this,g2,cx,cy);try{drawQ(g2,cx,cy)}catch(e){console.error('FARM9d',e)}}}
 // ---- the 5th edit field (watered-until) is saved / synced with the crop; old 4-field edits load as "never watered"
 {const _pe=pushEdit;pushEdit=function(k){_pe.apply(this,arguments);try{const t=trees.get(k);if(isCrop(t)&&edits[k])edits[k][4]=Math.round(t.w||0)}catch(_){}}}
 {const _ae=applyEdit;applyEdit=function(k,a){_ae.apply(this,arguments);try{const t=trees.get(k);if(isCrop(t))t.w=Array.isArray(a)&&+a[4]>0?+a[4]:0}catch(_){}}}
 // ---- a few starter seeds for every profile, once
 setTimeout(function starter(){try{if(!entered){setTimeout(starter,3000);return}if(S.g)return;S.g=1;save();addI(180,4);addI(182,4);try{barDirty=1}catch(_){}try{UI6.say6('Farming!','You got 4 Carrot Seeds + 4 Wheat Seeds · put them on the hotbar and click dirt or grass to plant',4600)}catch(_){}}catch(_){}},6000);
 return{CROPS,PROD,isCrop,isSeed,cp,ripeAt,stageOf,wet,perfectNow,wilted,water,reap,sprite,soilOk,S,WD,PER,PW,OVER,get lastCrop(){return lastCrop},save,miles,prodImg}})();
