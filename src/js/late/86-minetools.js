// ===== TOOLS8: five tiny, cute breaking tools (never break, never fight). Each one is great at one job and slow at everything else.
// Bubbles the Fishing Rod casts into any water; bait from Tackle Boxes makes fish bite sooner and rarer. Fish sell to the shop. =====
const TOOLS8=(()=>{
 const R=Math.random;
 const TL={
  pip:{n:'Pip the Pocket Shovel',g:[255,190,120],tool:'soft',d:'A tiny shovel with a smiley face. Scoops dirt, grass, sand, wood, glass and leaves in one go.'},
  pebble:{n:'Pebble the Rock Tapper',g:[255,150,200],tool:'stone',d:'A little pink hammer. Cracks stone, cobble, brick, marble and deepslate in one tap.'},
  glimmer:{n:'Glimmer the Ore Pick',g:[150,240,255],tool:'ore',d:'A sparkly mini pickaxe made for ores. Mines the whole vein, finds bonus ore and makes nearby ores twinkle.'},
  twiggy:{n:'Twiggy the Tree Axe',g:[150,230,110],tool:'tree',d:'A leafy little axe. Chops trees for extra wood and splits wooden blocks.'},
  bubbles:{n:'Bubbles the Fishing Rod',g:[120,200,255],tool:'rod',d:'A cute rod with a duck bobber. Click water to cast, click again when it bites! Bait from Tackle Boxes helps.'}};
 for(const id in TL){const t=TL[id];WPN[id]={n:t.n,g:t.g,bd:1,md:0,cd:t.tool=='rod'?.25:.18,k:'tool',cost:0,fx:'',d:t.d,tool:t.tool,id};own[id]=1}
 // ---- what kind of block is it?
 const ORE=new Set([9,10,60,61,62,65,71,72,73,74,75,76]);
 const catOf=b=>{if(!b)return'';const n=(BLK[b]||[''])[0];if(ORE.has(b)||/Ore|Crystal|Gold|Geode|Fossil|Vein|Ruby|Sapphire|Emerald|Diamond/.test(n))return'ore';
  if(/Wood|Plank|Log|Bamboo|Crate/.test(n))return'wood';if(/Stone|Cobble|Marble|Brick|Deepslate|Basalt|Granite|Slate|Obsidian|Rock|Roof Tile/.test(n))return'stone';return'soft'};
 const fits=(tool,cat)=>tool==cat||(tool=='soft'&&cat=='wood')||(tool=='tree'&&cat=='wood');
 const tone=(a,b,d,ty,v,dl)=>{try{SFX7.tone(a,b,d,ty,v,dl)}catch(_){}};
 const inReach=(x,y)=>Math.hypot(x-P.x,y-(P.y+P.h/2))<REACH;
 function vein(tx,ty,id,n){const seen=new Set([ty*W+tx]),q=[[tx,ty]],out=[];while(q.length&&out.length<n){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=ny*W+nx;if(nx<1||ny<1||nx>=W-1||ny>=H-1||seen.has(k))continue;seen.add(k);if(tiles[k]==id){out.push([nx,ny]);q.push([nx,ny])}}}return out}
 function use(w){wcd=w.cd/(1+bonus().atk*.5);swing=.15;const c={x:mx+cam.x,y:my+cam.y};P.f=c.x>=P.x?1:-1;
  if(w.tool=='rod'){FISH.click(c);return}
  const tk=pickTree(c.x,c.y);if(tk>=0&&Math.hypot((tk%W)*T+T/2-P.x,(tk/W|0)*T+T/2-(P.y+P.h/2))<REACH+T){harvest(tk);if(w.tool=='tree'){const px=(tk%W)*T+T/2,py=(tk/W|0)*T;spawnDrop(px,py,5,2);ft(px,py-10,'+2 Wood','#d8ffb0')}tone(500,700,.08,'triangle',.04);return}
  const tx=Math.floor(c.x/T),ty=Math.floor(c.y/T),k=ty*W+tx;if(!inReach(tx*T+T/2,ty*T+T/2)||tx<1||ty<1||tx>=W-1||ty>=H-1)return;const b=tiles[k];if(!b)return;
  const cat=catOf(b),good=fits(w.tool,cat),dmg=good?255:1;
  const r=breakAt(tx,ty,dmg),broken=r&&!tiles[k];const px=tx*T+T/2,py=ty*T+T/2;
  if(good){for(let i=0;i<5;i++)VFX.add(1,'rgb('+w.g+')',px,py,(R()-.5)*160,-60-R()*120,.4,8,2,{a:1});tone(900+R()*200,1300,.08,'sine',.035)}else{tone(240,200,.06,'triangle',.03);if(r&&R()<.25)try{ft(px,py-14,'Try another tool','#ffd0d0')}catch(_){}}
  if(broken){try{G('break')}catch(_){}
   if(w.tool=='ore'&&cat=='ore'){if(R()<.5){spawnDrop(px,py,b,1);ft(px,py-24,'Bonus ore!','#bff6ff')}
    vein(tx,ty,b,8).forEach(([vx,vy],i)=>setTimeout(()=>{try{if(tiles[vy*W+vx]==b)breakAt(vx,vy,255)}catch(_){}},70*(i+1)))}}}
 {const _uw=useWeapon;useWeapon=function(){const w=WPN[wp];if(w&&w.k=='tool'&&own[w.id]){use(w);return}return _uw.apply(this,arguments)}}
 // ores twinkle around you while you hold Glimmer
 let tw=0;function twinkle(dt){if(wp!='glimmer'||!entered)return;tw-=dt;if(tw>0)return;tw=.25;const cx=Math.floor(P.x/T),cy=Math.floor((P.y+P.h/2)/T);
  for(let i=0;i<14;i++){const x=cx+Math.round((R()-.5)*18),y=cy+Math.round((R()-.5)*18);if(x<1||y<1||x>=W-1||y>=H-1)continue;const b=tiles[y*W+x];if(catOf(b)=='ore'){const c=(BLK[b]||['','#fff'])[1];VFX.add(0,c,x*T+T*(.2+R()*.6),y*T+T*(.2+R()*.6),0,-12,.7,10,2,{a:.9})}}}
 // ---- cute held models (origin at the hand, pointing +x)
 const MODEL={
  pip(x,L){x.fillStyle='#b07a44';x.fillRect(-2,-2,L*.55,4);x.strokeRect(-2,-2,L*.55,4);x.fillStyle='#ffd08a';x.beginPath();x.moveTo(L*.52,-7);x.quadraticCurveTo(L*.82,-8,L*.86,0);x.quadraticCurveTo(L*.82,8,L*.52,7);x.closePath();x.fill();x.stroke();
   x.fillStyle='#000';x.beginPath();x.arc(L*.64,-2,1.3,0,6.3);x.arc(L*.72,-2,1.3,0,6.3);x.fill();x.beginPath();x.arc(L*.68,1,2.4,.2,Math.PI-.2);x.stroke()},
  pebble(x,L){x.fillStyle='#c89a6a';x.fillRect(-2,-2,L*.6,4);x.strokeRect(-2,-2,L*.6,4);x.fillStyle='#ff9ac8';x.beginPath();x.roundRect?x.roundRect(L*.48,-9,L*.3,18,5):x.rect(L*.48,-9,L*.3,18);x.fill();x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(L*.56,-4,2,0,6.3);x.fill();
   x.fillStyle='#000';x.beginPath();x.arc(L*.6,1,1.2,0,6.3);x.arc(L*.68,1,1.2,0,6.3);x.fill()},
  glimmer(x,L,t){x.fillStyle='#a07850';x.fillRect(-2,-2,L*.62,4);x.strokeRect(-2,-2,L*.62,4);x.fillStyle='#bff6ff';x.beginPath();x.moveTo(L*.6,0);x.quadraticCurveTo(L*.66,-12,L*.48,-14);x.lineTo(L*.6,-4);x.quadraticCurveTo(L*.68,10,L*.52,13);x.lineTo(L*.64,4);x.closePath();x.fill();x.stroke();
   x.globalCompositeOperation='lighter';x.fillStyle='rgba(200,250,255,'+(.5+.5*Math.sin(t*6))+')';x.beginPath();for(let i=0;i<8;i++){const r=i%2?1.2:4,a=i*Math.PI/4;x.lineTo(L*.5+Math.cos(a)*r,-13+Math.sin(a)*r)}x.fill();x.globalCompositeOperation='source-over'},
  twiggy(x,L){x.fillStyle='#8a5a30';x.fillRect(-2,-2,L*.6,4);x.strokeRect(-2,-2,L*.6,4);x.fillStyle='#d8e0e8';x.beginPath();x.moveTo(L*.5,-2);x.quadraticCurveTo(L*.72,-12,L*.74,-2);x.lineTo(L*.74,4);x.quadraticCurveTo(L*.66,8,L*.5,4);x.closePath();x.fill();x.stroke();
   x.fillStyle='#7ad850';x.beginPath();x.ellipse(L*.46,-7,4,2.4,-.6,0,6.3);x.fill();x.stroke()},
  bubbles(x,L,t){x.strokeStyle='#5a3a1a';x.lineWidth=3;x.beginPath();x.moveTo(-2,0);x.lineTo(L*.95,-L*.35);x.stroke();x.strokeStyle='#ffd34a';x.lineWidth=1.5;x.beginPath();x.moveTo(L*.1,-L*.04);x.lineTo(L*.22,-L*.08);x.stroke();
   x.fillStyle='#9ad8ff';x.strokeStyle='#000';x.lineWidth=1.5;x.beginPath();x.arc(L*.12,1,3.5,0,6.3);x.fill();x.stroke();if(FISH.S.st=='idle'){x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=1;x.beginPath();x.moveTo(L*.95,-L*.35);x.lineTo(L*.95,-L*.35+8+Math.sin(t*3)*2);x.stroke()}}};
 {const _dw=drawWeapon;drawWeapon=function(x,id,L,t){if(TL[id]&&MODEL[id]){x.save();x.lineJoin='round';x.lineCap='round';x.strokeStyle='#000';x.lineWidth=1.6;try{MODEL[id](x,L,t||0)}finally{x.restore()}return}return _dw.apply(this,arguments)}}
 // ======================= FISHING =======================
 // fish 240-249, bait 250-252 (materials: they stack, sell, trade)
 const FISHES={240:{n:'Minnow',c:'#b8c8d0',p:4,w:30},241:{n:'Bluegill',c:'#5aa0d8',p:7,w:24},242:{n:'Rainbow Trout',c:'#ff9ac8',p:12,w:16},243:{n:'Koi',c:'#ff8a3a',p:25,w:9},244:{n:'Pufferfish',c:'#ffe07a',p:30,w:7},
  245:{n:'Glowfin',c:'#6affd8',p:40,w:0,cave:8},246:{n:'Moonfish',c:'#c8d0ff',p:60,w:0,night:6},247:{n:'Golden Carp',c:'#ffd34a',p:120,w:2},248:{n:'Void Eel',c:'#9a6aff',p:150,w:0,cave:2,deep:1},249:{n:'Old Boot',c:'#7a5a3a',p:1,w:10,junk:1}};
 const BAIT={250:{n:'Worm Bait',c:'#e88a7a',p:3,luck:1,wait:[2.5,5]},251:{n:'Glow Bait',c:'#7affe0',p:12,luck:2,wait:[2,4]},252:{n:'Golden Bait',c:'#ffd34a',p:40,luck:3,wait:[1.4,3]}};
 for(const id in FISHES){const f=FISHES[id];MAT[id]={n:f.n,c:f.c,p:f.p}}for(const id in BAIT){const b=BAIT[id];MAT[id]={n:b.n,c:b.c,p:b.p}}
 const FISH=(()=>{const S={st:'idle',x:0,y:0,vx:0,vy:0,t:0,bait:0,dip:0,tip:{x:0,y:0}};
  const best=()=>[252,251,250].find(k=>cnt(k)>0)||0;
  const tipPos=()=>({x:P.x+P.f*40,y:P.y+4});
  function reset(msg){S.st='idle';S.dip=0;if(msg)try{say(msg)}catch(_){}}
  function cast(c){const o=tipPos(),dx=Math.max(-T*7,Math.min(T*7,c.x-o.x)),flight=.55+Math.abs(dx)/(T*14);S.x=o.x;S.y=o.y;S.vx=dx/flight;S.vy=(c.y-o.y)/flight-.5*900*flight;S.vy=Math.max(-900,Math.min(200,S.vy));S.st='cast';S.t=2.5;S.bait=best();tone(700,400,.18,'sine',.03);try{SFX7.tone(1200,600,.12,'sine',.015,.05)}catch(_){}}
  function roll(){const b=BAIT[S.bait],luck=b?b.luck:0,ty=Math.floor(S.y/T),tx=Math.floor(S.x/T),dep=ty-sh(Math.max(0,Math.min(W-1,tx))),cave=dep>10,isNight=typeof night!='undefined'&&night>.5;
   const pool=[];for(const id in FISHES){const f=FISHES[id];let w=f.w;if(f.cave)w=cave?f.cave*(f.deep&&dep<35?0:1):0;if(f.night&&isNight)w+=f.night;if(f.junk)w=Math.max(1,w-luck*3);else if(f.p>=25)w*=1+luck*.8;if(w>0)pool.push([+id,w])}
   let tot=pool.reduce((s,q)=>s+q[1],0),r=R()*tot;for(const[id,w]of pool){if(r<w)return id;r-=w}return 240}
  function catchIt(){const id=roll(),f=FISHES[id];if(S.bait&&cnt(S.bait)>0)addI(S.bait,-1);addI(id,1);
   try{ft(P.x,P.y-30,(f.junk?'':'Caught ')+f.n+'!',f.c)}catch(_){}try{xpGain('farm',f.junk?1:4+Math.round(f.p/3))}catch(_){}try{stat('fish',1)}catch(_){}
   Q.push({x:S.x,y:S.y,vx:(P.x-S.x)*1.6,vy:-520,t:0,c:f.c});try{SFX7.splash(380)}catch(_){}tone(660,990,.14,'sine',.04,.05);tone(990,1320,.18,'sine',.035,.15);if(f.p>=60){tone(1320,1760,.3,'triangle',.03,.3);try{UI6.say6('Rare catch!',f.n,2200)}catch(_){}}
   reset()}
  function click(c){if(S.st=='idle'){if(P.sw)return say('Get out of the water to fish');cast(c);return}
   if(S.st=='bite'){catchIt();return}
   if(S.st=='wait'){tone(500,300,.1,'sine',.025);reset('Reeled in too early');return}
   reset()}
  function tick(dt){if(wp!='bubbles'){if(S.st!='idle')reset();return}
   if(S.st=='cast'){S.t-=dt;S.vy+=900*dt;S.x+=S.vx*dt;S.y+=S.vy*dt;
    if(inWater(S.x,S.y+4)){S.st='wait';const b=BAIT[S.bait];const wr=b?b.wait:[4,9];S.t=wr[0]+R()*(wr[1]-wr[0]);S.vx=S.vy=0;try{SFX7.bloop(.6)}catch(_){}if(S.bait)try{ft(S.x,S.y-16,MAT[S.bait].n,MAT[S.bait].c)}catch(_){}}
    else if(solidAt(Math.floor(S.x/T),Math.floor(S.y/T))||S.t<=0||S.y>H*T)reset('Missed the water - aim for a lake or pool')}
   else if(S.st=='wait'||S.st=='bite'){// keep the bobber floating on the surface
    const tx=Math.floor(S.x/T);let ty=Math.floor(S.y/T);while(ty>0&&wl[(ty-1)*W+tx]>0&&!tiles[(ty-1)*W+tx])ty--;const k=ty*W+tx,lvlW=wl[k]||0;if(!lvlW){reset('The water is gone');return}
    S.y+=((ty+1)*T-lvlW/8*T+2-S.y)*Math.min(1,dt*6);
    if(Math.hypot(S.x-P.x,S.y-P.y)>T*10||P.sw){reset('The line snapped');return}
    S.t-=dt;if(S.st=='wait'){if(S.t<=0){S.st='bite';S.t=S.bait==252?1.2:.9;S.dip=1;tone(1400,1700,.06,'sine',.04);tone(1400,1700,.06,'sine',.04,.12);try{SFX7.splash(160)}catch(_){}}else if(R()<dt*.6){S.dip=.3;try{SFX7.plip()}catch(_){}}}
    else if(S.t<=0)reset('It got away...');S.dip=Math.max(0,S.dip-dt*2)}}
  // caught fish arc back to you
  const Q=[];function tickQ(dt){for(let i=Q.length-1;i>=0;i--){const q=Q[i];q.t+=dt;q.vy+=1200*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.t>.6)Q.splice(i,1)}}
  function draw(g,cx,cy){const t=performance.now()/1000;
   for(const q of Q){g.save();g.translate(q.x-cx,q.y-cy);g.rotate(q.t*12);g.fillStyle=q.c;g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.ellipse(0,0,10,5,0,0,6.3);g.fill();g.stroke();g.beginPath();g.moveTo(-9,0);g.lineTo(-15,-5);g.lineTo(-15,5);g.closePath();g.fill();g.stroke();g.restore()}
   if(S.st=='idle'||wp!='bubbles')return;const o=tipPos(),bx=S.x-cx,by=S.y-cy+(S.dip*6)+(S.st=='wait'?Math.sin(t*2.4)*1.5:0);
   g.save();g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1.2;g.beginPath();g.moveTo(o.x-cx,o.y-cy);g.quadraticCurveTo((o.x+S.x)/2-cx,Math.max(o.y,S.y)-cy+(S.st=='cast'?0:22),bx,by-4);g.stroke();
   // duck bobber
   g.fillStyle='#ffe04a';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.ellipse(bx,by,7,5,0,0,6.3);g.fill();g.stroke();g.beginPath();g.arc(bx+4,by-6,3.6,0,6.3);g.fill();g.stroke();g.fillStyle='#ff8a2a';g.beginPath();g.moveTo(bx+7,by-6);g.lineTo(bx+11,by-5);g.lineTo(bx+7,by-4);g.fill();g.fillStyle='#000';g.beginPath();g.arc(bx+5,by-7,.9,0,6.3);g.fill();
   if(S.st=='bite'){const px=P.x-cx,py=P.y-cy-34-Math.abs(Math.sin(t*10))*4;g.fillStyle='#fff';g.beginPath();g.arc(px,py,10,0,6.3);g.fill();g.stroke();g.fillStyle='#ff3a3a';g.font='bold 15px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText('!',px,py+1);
    g.strokeStyle='rgba(255,255,255,.8)';for(let i=0;i<2;i++){g.beginPath();g.arc(bx,by+3,8+((t*30+i*8)%16),0,6.3);g.stroke()}}
   g.restore()}
  return{S,click,tick,tickQ,draw,FISHES,BAIT}})();
 // icons for fish and bait
 {const _mi=matIcon;matIcon=function(x,k,S){const f=FISHES[k],b=BAIT[k];if(!f&&!b)return _mi.apply(this,arguments);try{burstBG(x,S)}catch(_){}x.save();x.scale(S/48,S/48);x.strokeStyle='#000';x.lineWidth=2;
   if(f&&k==249){x.fillStyle=f.c;x.beginPath();x.moveTo(14,12);x.lineTo(26,12);x.lineTo(26,28);x.lineTo(36,30);x.quadraticCurveTo(40,38,34,38);x.lineTo(14,38);x.closePath();x.fill();x.stroke()}
   else if(f){x.fillStyle=f.c;x.beginPath();x.ellipse(26,24,13,8,0,0,6.3);x.fill();x.stroke();x.beginPath();x.moveTo(13,24);x.lineTo(5,16);x.lineTo(5,32);x.closePath();x.fill();x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(32,22,3,0,6.3);x.fill();x.fillStyle='#000';x.beginPath();x.arc(33,22,1.4,0,6.3);x.fill();
    if(k==245||k==248){x.globalCompositeOperation='lighter';x.fillStyle=f.c+'66';x.beginPath();x.arc(26,24,18,0,6.3);x.fill()}}
   else{x.fillStyle='#8a6a4a';x.beginPath();x.roundRect?x.roundRect(10,22,28,16,4):x.rect(10,22,28,16);x.fill();x.stroke();x.fillStyle=b.c;x.lineWidth=5;x.strokeStyle=b.c;x.beginPath();x.moveTo(16,20);x.bezierCurveTo(20,6,30,20,32,10);x.stroke();x.lineWidth=2;x.strokeStyle='#000'}
   x.restore()}}
 {const _t=BOSS6.tick,_dp=BOSS6.drawProj;BOSS6.tick=function(dt){_t.call(this,dt);try{FISH.tick(dt);FISH.tickQ(dt);twinkle(dt)}catch(e){console.error('TOOLS8',e)}};BOSS6.drawProj=function(g,cx,cy){_dp.call(this,g,cx,cy);try{FISH.draw(g,cx,cy)}catch(e){console.error('TOOLS8d',e)}}}
 // say hello once
 setTimeout(()=>{try{if(entered&&!localStorage.getItem('rbc5')){localStorage.setItem('rbc5','1');UI6.say6('New tiny tools!','Press 3 to cycle: Pip, Pebble, Glimmer, Twiggy and Bubbles the Fishing Rod',5200)}}catch(_){}},4000);
 return{TL,catOf,FISH,FISHES,BAIT}})();
