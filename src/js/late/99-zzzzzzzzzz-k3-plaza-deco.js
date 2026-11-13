// ===== PLZD: the Plaza as a place to spend time. Cherry trees in the gaps between the houses, with petals drifting down the street; paper lantern posts
// that glow warm at dusk; benches to sit on (others see you sitting: EMO2); Mochi, a sleepy cat on the bench by the World Gate who reads you a fortune
// (one a day, different for everyone); and golden petals that now and then fall from the trees: catch them (walk through one) for a little chime and a
// count of today's catch. Everything is drawn by code from cached sprites, the same for everyone, never saved, and costs a few drawImage calls a frame.
// Decor is not solid and never blocks the street or a door. =====
try{window.PLZD=(()=>{
 const O='#2c1b33',TAU=6.2832,S=64;
 // where things stand (tile columns; the street's ground row is S): gaps between the houses (76-plaza3.js), clear of lamps and signs
 const TREES=[[66.6,1.55],[158,1.4],[208.5,1.45],[238.5,1.4]],LANTS=[[67.4],[157]],BENCH=[[64,65],[48,49],[174,175]],CAT={x:64.7,bench:0};
 const sprites={};
 function spr(k,w,h,fn){if(sprites[k])return sprites[k];const c=document.createElement('canvas');c.width=w*2;c.height=h*2;const x=c.getContext('2d');x.scale(2,2);x.lineJoin='round';x.lineCap='round';fn(x,w,h);return sprites[k]={c,w,h}}
 const celf=(x,path,fill,lw)=>{path();x.fillStyle=fill;x.fill();x.lineWidth=lw||2;x.strokeStyle=O;x.stroke()};
 // ---- a cherry tree: a dark trunk with two branches and a crown of blossom clouds, lit from the upper left
 function tree(){return spr('tree',150,170,(x,w,h)=>{const bx=w/2,by=h-2;
  celf(x,()=>{x.beginPath();x.moveTo(bx-9,by);x.quadraticCurveTo(bx-6,by-40,bx-3,by-70);x.quadraticCurveTo(bx-22,by-92,bx-38,by-104);x.lineTo(bx-33,by-108);x.quadraticCurveTo(bx-16,by-98,bx+1,by-82);x.quadraticCurveTo(bx+12,by-100,bx+30,by-110);x.lineTo(bx+34,by-105);x.quadraticCurveTo(bx+14,by-90,bx+7,by-66);x.quadraticCurveTo(bx+6,by-36,bx+10,by);x.closePath()},'#6b3f45',2);
  x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=2;x.beginPath();x.moveTo(bx-4,by-6);x.quadraticCurveTo(bx-2,by-40,bx,by-66);x.stroke();
  const puff=[[-44,-108,26],[-18,-124,30],[14,-128,30],[42,-112,26],[-34,-86,22],[0,-100,28],[34,-88,22],[-8,-76,18],[18,-74,16]];
  x.save();for(const[px,py,r]of puff){x.beginPath();x.arc(bx+px,by+py,r+2,0,TAU);x.fillStyle=O;x.fill()}for(const[px,py,r]of puff){x.beginPath();x.arc(bx+px,by+py,r,0,TAU);x.fillStyle='#f6a9c6';x.fill()}
  for(const[px,py,r]of puff){x.beginPath();x.arc(bx+px-r*.28,by+py-r*.3,r*.62,0,TAU);x.fillStyle='#ffcfe0';x.fill()}for(const[px,py,r]of puff){x.beginPath();x.arc(bx+px-r*.42,by+py-r*.45,r*.26,0,TAU);x.fillStyle='#fff0f6';x.fill()}x.restore();
  // a few dark-pink blossoms and fallen petals at the root
  x.fillStyle='#e0779f';for(let i=0;i<14;i++){const a=i*2.4,rr=18+(i*13)%38;x.beginPath();x.arc(bx+Math.cos(a)*rr*1.3,by-100+Math.sin(a)*rr*.6,2.2,0,TAU);x.fill()}
  x.fillStyle='#f7b8cf';for(let i=0;i<9;i++){x.beginPath();x.ellipse(bx-30+i*7.5,by-1-(i%2),3,1.4,i,0,TAU);x.fill()}})}
 // ---- a paper lantern post: a wooden post, a little roof, a red paper lantern with dark ribs
 function post(){return spr('post',34,96,(x,w,h)=>{const cx=w/2,b=h-1;
  celf(x,()=>{x.beginPath();x.rect(cx-3,b-80,6,80)},'#7a5236',1.6);celf(x,()=>{x.beginPath();x.moveTo(cx-14,b-80);x.lineTo(cx+14,b-80);x.lineTo(cx+9,b-86);x.lineTo(cx-9,b-86);x.closePath()},'#4a3346',1.6);
  celf(x,()=>{x.beginPath();x.moveTo(cx+1,b-78);x.lineTo(cx+12,b-78);x.stroke()},'#000',1.4);
  celf(x,()=>{x.beginPath();x.ellipse(cx+12,b-62,8,11,0,0,TAU)},'#e2485a',1.6);x.strokeStyle='rgba(60,20,30,.45)';x.lineWidth=1;for(const k of[-6,-2,2,6]){x.beginPath();x.moveTo(cx+4,b-62+k);x.quadraticCurveTo(cx+12,b-62+k*1.3,cx+20,b-62+k);x.stroke()}
  x.fillStyle='#2c1b33';x.fillRect(cx+8,b-74,8,3);x.fillRect(cx+8,b-52,8,3);x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(cx+9,b-66,2,4,0,0,TAU);x.fill()})}
 // ---- Mochi: a round white-and-ginger cat asleep on the bench, breathing; she opens one eye when you come close
 function cat(open){return spr('cat'+open,40,30,(x,w,h)=>{const b=h-2;celf(x,()=>{x.beginPath();x.ellipse(20,b-10,15,10,0,0,TAU)},'#fff7ef',1.8);
  x.fillStyle='#f2a65a';x.beginPath();x.ellipse(26,b-14,7,5,.3,0,TAU);x.fill();celf(x,()=>{x.beginPath();x.moveTo(33,b-6);x.quadraticCurveTo(40,b-6,38,b-14)},'rgba(0,0,0,0)',3);
  celf(x,()=>{x.beginPath();x.ellipse(10,b-12,8.5,7.5,0,0,TAU)},'#fff7ef',1.8);celf(x,()=>{x.beginPath();x.moveTo(4,b-17);x.lineTo(5,b-24);x.lineTo(9,b-19);x.closePath();x.moveTo(12,b-19);x.lineTo(16,b-24);x.lineTo(16,b-16);x.closePath()},'#f2a65a',1.4);
  x.strokeStyle=O;x.lineWidth=1.3;if(open){x.beginPath();x.moveTo(6,b-12);x.quadraticCurveTo(7.5,b-14,9,b-12);x.stroke();x.fillStyle='#4aa86a';x.beginPath();x.arc(13.5,b-12.5,1.7,0,TAU);x.fill()}else{x.beginPath();x.moveTo(6,b-12);x.quadraticCurveTo(7.5,b-10.6,9,b-12);x.moveTo(12,b-12);x.quadraticCurveTo(13.5,b-10.6,15,b-12);x.stroke()}
  x.fillStyle='#ff9eb8';x.beginPath();x.arc(10.5,b-9.6,1,0,TAU);x.fill()})}
 const ground=c=>{try{for(let y=S-6;y<S+4;y++)if(tiles[y*W+c])return y}catch(_){}return S};
 const nightK=()=>{try{return typeof night=='number'?night:0}catch(_){return 0}};
 // ---- benches join the seats (SUMMER9 rebuilds its lists when a world loads, so they are added after each build)
 function addSeats(){try{if(cur!='plaza'||typeof SUMMER9=='undefined')return;addSeats.done=1;const L=SUMMER9.LAND,Se=SUMMER9.SEATS;for(const[c0,c1]of BENCH){const gy=ground(c0);if(L.some(i=>i.plzd&&i.c0==c0))continue;const it={k:'bench',c0,c1,gy:gy*T,x:(c0+c1+1)*T/2,f:1,v:0,z:1,plzd:1};L.push(it);Se.push({it,n:'Bench',sx:it.x+(c0==BENCH[CAT.bench][0]?14:0),fy:it.gy,hy:it.gy-15,f:1,ex:it.x,ey:it.gy,lean:0})}}catch(e){console.error('PLZD seats',e)}}
 /* SUMMER9 builds its decor inside genBase; this wraps genBase after it, so the benches are added to every fresh Plaza */
 if(typeof genBase=='function'){const _gb=genBase;genBase=function(){const r=_gb.apply(this,arguments);addSeats.done=0;try{addSeats()}catch(_){}return r}}
 // ---- petals: a light drift over the street near the camera, and now and then a golden one you can catch
 const PET=[],GOLD=[];let lastMsg='',caught=0,day='',catT=0,fortune=null,fortT=0;
 try{const o=JSON.parse(localStorage.getItem('rbplzd')||'{}');if(o.d===new Date().toDateString()){day=o.d;caught=o.n|0}fortune=o.f&&o.fd===new Date().toDateString()?o.f:null}catch(_){}
 const save=()=>{try{localStorage.setItem('rbplzd',JSON.stringify({d:new Date().toDateString(),n:caught,f:fortune,fd:fortune?new Date().toDateString():''}))}catch(_){}};
 function tick(dt){if(cur!='plaza'||!entered)return;const vw=cv.width/ZM,vh=cv.height/ZM,red=(()=>{try{return !!(cel.opt.reduce||QM.reduce)}catch(_){return false}})(),cap=red?10:26;
  while(PET.length<cap)PET.push({x:cam.x+Math.random()*vw,y:cam.y-20-Math.random()*vh*.6,vx:-14-Math.random()*16,vy:22+Math.random()*18,a:Math.random()*TAU,s:.7+Math.random()*.6,ph:Math.random()*6});
  for(const p of PET){p.ph+=dt;p.x+=(p.vx+Math.sin(p.ph*1.3)*14)*dt;p.y+=p.vy*dt;p.a+=dt*1.6;if(p.y>cam.y+vh+20||p.x<cam.x-40){p.x=cam.x+Math.random()*(vw+80);p.y=cam.y-20}}
  // a golden petal: about one a minute from a tree on screen
  if(GOLD.length<1&&Math.random()<dt/55){const on=TREES.filter(([c])=>c*T>cam.x&&c*T<cam.x+vw);if(on.length){const[c]=on[Math.random()*on.length|0];GOLD.push({x:c*T+(Math.random()-.5)*T*2,y:(ground(c)-3.2)*T,t:0,ph:Math.random()*6})}}
  for(let i=GOLD.length-1;i>=0;i--){const q=GOLD[i];q.t+=dt;q.ph+=dt;q.x+=Math.sin(q.ph*1.6)*22*dt-6*dt;q.y+=26*dt;const gy=(ground(Math.floor(q.x/T))-.2)*T;if(q.y>gy){q.y=gy}
   if(Math.hypot(P.x-q.x,P.y+P.h/2-q.y)<T*.8){GOLD.splice(i,1);const today=new Date().toDateString();if(day!==today){day=today;caught=0}caught++;save();try{VFX.burst(q.x,q.y,['#ffe08a','#fff6d0'],14,120,1,.6,6);SFX7.tone(880,1320,.18,'sine',.05);SFX7.tone(1320,1760,.22,'sine',.035,.08)}catch(_){}try{say('Golden petal! '+caught+' caught today')}catch(_){}continue}
   if(q.t>22)GOLD.splice(i,1)}}
 // ---- Mochi's fortunes: one a day, the same all day, different for each player (seeded by name and date)
 const FORT=['A small kindness today comes back to you twice.','The next block you break hides something nice. Or the one after.','Someone in the Plaza wants to wave at you. Wave first.','Rest on a bench. Good things find people who sit still.','Your next dungeon goes better than you fear.','Today is a lucky day for the colour pink.','A friend you have not met yet is one emote away.','Try the Sky Run once more. Your feet know the way now.','The quiet corners of the world are hiding treasure.','Mochi dreamed of fish. That is a good sign for you.','You will laugh at something silly before the day ends.','Wear something new today. The world notices.'];
 function readFortune(){const today=new Date().toDateString();if(!fortune){let h=0;const s=(typeof myName=='string'?myName:'')+today;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;fortune=FORT[h%FORT.length];save()}
  fortT=performance.now()+6500;lastMsg='Mochi opens one eye: "'+fortune+'"';try{say(lastMsg);SFX7.tone(520,640,.25,'sine',.04);SFX7.tone(780,700,.3,'sine',.03,.18)}catch(_){}}
 const catPos=()=>({x:CAT.x*T+T*.3,y:ground(Math.floor(CAT.x))*T-20});
 const nearCat=()=>{if(cur!='plaza')return false;const p=catPos();return Math.abs(P.x-p.x)<T*1.6&&Math.abs(P.y+P.h-p.y-20)<T*1.6};
 if(typeof interact=='function'){const _i=interact;interact=function(){try{if(nearCat()&&!dlgOpen&&menuEl.style.display=='none'){readFortune();return}}catch(_){}return _i.apply(this,arguments)}}
 // ---- drawing, behind the players (the same layer as the Spirit Stones)
 function draw(now){if(cur!='plaza')return;const t=now/1000,vw=cv.width/ZM,vh=cv.height/ZM,x0=cam.x-200,x1=cam.x+vw+200,n=Math.max(0,Math.min(1,nightK()));
  const tr=tree();for(const[c,s]of TREES){const X=c*T+T/2;if(X<x0||X>x1)continue;const gy=ground(c)*T,w=tr.w*s,h=tr.h*s,sw=Math.sin(t*.7+c)*.012;g.save();g.translate(X-cam.x,gy-cam.y);g.transform(1,0,sw,1,0,0);g.drawImage(tr.c,-w/2,-h,w,h);g.restore()}
  const ps=post(),pk=1.35;for(const[c]of LANTS){const X=c*T+T/2;if(X<x0||X>x1)continue;const gy=ground(c)*T;g.drawImage(ps.c,X-cam.x-ps.w*pk/2,gy-cam.y-ps.h*pk,ps.w*pk,ps.h*pk);
   if(n>.15){g.save();g.globalCompositeOperation='lighter';const lx=X-cam.x+12*pk,ly=gy-cam.y-62*pk,gr=g.createRadialGradient(lx,ly,2,lx,ly,46);const a=(n-.15)*.55*(.9+.1*Math.sin(t*3+c));gr.addColorStop(0,'rgba(255,170,110,'+a+')');gr.addColorStop(1,'rgba(255,120,80,0)');g.fillStyle=gr;g.fillRect(lx-46,ly-46,92,92);g.restore()}}
  if(typeof SUMMER9!='undefined'&&now-(addSeats.t||0)>1000){addSeats.t=now;if(!SUMMER9.LAND.some(i=>i.plzd))addSeats()}
  // Mochi, breathing on her bench; one eye open when you are close
  {const p=catPos();if(p.x>x0&&p.x<x1){const close=nearCat(),ct=cat(close?1:0),br=1+Math.sin(t*1.8)*.03;g.save();g.translate(p.x-cam.x,p.y-cam.y+16);g.scale(1,br);g.drawImage(ct.c,-ct.w/2,-ct.h,ct.w,ct.h);g.restore();
   if(!close&&Math.sin(t*.9)>.2){g.save();g.fillStyle='rgba(255,255,255,.85)';g.font='bold 11px system-ui,sans-serif';g.fillText('z',p.x-cam.x-6+Math.sin(t*2)*2,p.y-cam.y-22-(t%2)*6);g.restore()}
}}
  // petals and golden petals
  g.save();for(const p of PET){const X=p.x-cam.x,Y=p.y-cam.y;g.save();g.translate(X,Y);g.rotate(p.a);g.scale(p.s,p.s*(.55+.45*Math.cos(p.ph*2)));g.fillStyle='#ffc1d8';g.beginPath();g.ellipse(0,0,4,2.4,0,0,TAU);g.fill();g.restore()}
  for(const q of GOLD){const X=q.x-cam.x,Y=q.y-cam.y,pl=.7+.3*Math.sin(q.ph*5);g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(X,Y,1,X,Y,18);gr.addColorStop(0,'rgba(255,220,120,'+(.55*pl)+')');gr.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=gr;g.fillRect(X-18,Y-18,36,36);g.restore();
   g.save();g.translate(X,Y);g.rotate(q.ph*2);g.fillStyle='#ffd46a';g.strokeStyle='#a8741c';g.lineWidth=1;g.beginPath();g.ellipse(0,0,5,3,0,0,TAU);g.fill();g.stroke();g.restore()}g.restore()}
 setInterval(()=>{try{const pr=document.getElementById('prompt');if(!pr)return;const on=cur=='plaza'&&entered&&nearCat()&&menuEl.style.display=='none'&&!dlgOpen&&performance.now()>fortT;if(on){const t='Press '+(window.DG&&DG.keyName?DG.keyName('use'):'F')+' to hear Mochi’s fortune';pr.style.display='block';if(pr.textContent!=t)pr.textContent=t;pr.dataset.plzd='1'}else if(pr.dataset.plzd){pr.dataset.plzd='';pr.style.display='none'}}catch(_){}},200);
 if(typeof drawNPCs=='function'){const _dn=drawNPCs;drawNPCs=function(now){try{draw(now)}catch(e){if(!draw.e){draw.e=1;console.error('PLZD',e)}}return _dn.apply(this,arguments)}}
 if(typeof evTick=='function'){const _et=evTick;evTick=function(dt){_et(dt);try{tick(dt)}catch(e){if(!tick.e){tick.e=1;console.error('PLZD tick',e)}}}}
 return{TREES,BENCH,LANTS,readFortune,get lastMsg(){return lastMsg},get caught(){return caught},get gold(){return GOLD},addSeats,nearCat}})()}catch(e){console.error('PLZD',e)}
