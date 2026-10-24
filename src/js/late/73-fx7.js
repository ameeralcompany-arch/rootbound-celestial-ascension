// ===== FX7: cosmetic effect system (auras, dash trails, spawn, victory, weapon trails, charms, wing particles) =====
// Every effect is a small function that emits into the shared pooled VFX system, so the global particle cap and quality presets bound the cost.
// Budget rules: nothing allocates per frame beyond the emitted particles; each emitter is rate-limited by QM.cur.vfx; reduced-effects mode keeps only a faint version.
const FX7=(()=>{
 const R=Math.random,add=(k,c,x,y,vx,vy,l,s0,s1,o)=>{try{VFX.add(k,c,x,y,vx,vy,l,s0,s1,o)}catch(_){}};
 const k=()=>{const q=QM.cur.vfx*(QM.reduce?.25:1);return q};
 const acc={};const gate=(key,dt,rate)=>{acc[key]=(acc[key]||0)+dt*rate*k();let n=0;while(acc[key]>=1&&n<4){acc[key]--;n++}if(acc[key]>4)acc[key]=0;return n};
 const WCOL={wt_rose:['#ff7fb0','#ffd0e4'],wt_azure:['#4fb4ff','#d0ecff'],wt_void:['#8a4cff','#e0c8ff']};
 const SKIN={skin_obsidian:{tint:[40,34,58],glow:'#7a5cff'},skin_pearl:{tint:[240,236,255],glow:'#ffffff'},skin_sakura:{tint:[255,170,200],glow:'#ff8fb8'}};
 // ---- continuous emitters: world coordinates, local player only
 const AUR={
  aura_void(n,x,y){for(let i=0;i<n;i++)add(0,'#6a2cc8',x+(R()-.5)*34,y-4+R()*10,(R()-.5)*14,-26-R()*26,1.4,26,6,{a:.55});if(R()<.1*k())add(0,'#e0c8ff',x+(R()-.5)*22,y-30,0,-20,.9,10,3,{a:.6})},
  aura_solar(n,x,y,t){for(let i=0;i<n;i++){const a=R()*6.28;add(1,'#ffd24a',x+Math.cos(a)*22,y-8+Math.sin(a)*8,Math.cos(a)*10,-24-R()*30,1.1,10,2,{a:.9})}},
  aura_blossom(n,x,y,t){for(let i=0;i<n;i++){const a=t*1.6+i*2.1;add(4,'#ffb0cf',x+Math.cos(a)*26,y+8+Math.sin(a*1.3)*20,Math.cos(a+1.6)*18,10+R()*10,1.6,12,8,{r:R()*6,vr:2})}},
  aura_frost(n,x,y){for(let i=0;i<n;i++)add(1,'#bfe8ff',x+(R()-.5)*50,y-30+R()*60,(R()-.5)*8,14+R()*14,1.7,6,2,{a:.85})},
  aura_astral(n,x,y,t){for(let i=0;i<n;i++){const a=t*2.2+i*3.14;add(1,'#9fe0ff',x+Math.cos(a)*30,y+4+Math.sin(a)*Math.cos(.5)*30*.45-18,0,-6,.7,8,2,{a:.95})}}};

 // ---- timed vector animations (ground bursts, spectral chains, lances, orbs, crow flocks). Drawn on top of the particle pass; capped and self-removing.
 const AN=[],ease=u=>1-(1-u)*(1-u),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function anim(kind,x,y,d,c,o){if(QM.reduce&&kind!='lance')return;if(AN.length>=10)AN.shift();AN.push(Object.assign({k:kind,x,y,d,c,t0:performance.now(),dur:kind=='crows'?800:kind=='chains'?950:kind=='orb'?800:kind=='lance'?650:750,seed:(R()*1e6)|0},o||{}))}
 const rnd=(s,i)=>{const v=Math.sin(s*12.9898+i*78.233)*43758.5453;return v-Math.floor(v)};
 function shardDraw(g,A,u,cx,cy){const n=Math.max(4,Math.round(8*Math.max(.5,QM.cur.vfx)));const gy=A.y-cy;
  g.save();g.globalCompositeOperation='lighter';const rr=ease(u);g.strokeStyle=A.c[0];g.globalAlpha=(1-u)*.7;g.lineWidth=3;g.beginPath();g.ellipse(A.x-cx+A.d*70,gy,16+rr*120,(16+rr*120)*.2,0,0,6.3);g.stroke();g.globalAlpha=(1-u)*.35;g.lineWidth=9;g.stroke();g.restore();
  for(let i=0;i<n;i++){const del=i*.045,lu=clamp((u-del)/(1-del),0,1);if(lu<=0)continue;const up=lu<.28?ease(lu/.28):1-Math.pow((lu-.28)/.72,1.6),h=(30+rnd(A.seed,i)*46)*(1-i*.04)*up;if(h<=1)continue;
   const bx=A.x-cx+A.d*(26+i*24)+(rnd(A.seed,i+9)-.5)*10,w=7+rnd(A.seed,i+3)*6,lean=(rnd(A.seed,i+5)-.5)*.5;
   g.save();g.translate(bx,gy);g.rotate(lean);g.globalAlpha=Math.min(1,(1-lu)*1.6);
   if(A.leaf){g.fillStyle=A.c[0];g.strokeStyle=A.c[1];g.lineWidth=1.5;g.beginPath();g.moveTo(-w*.6,0);g.quadraticCurveTo(-w*1.4,-h*.6,A.d*w*.6,-h);g.quadraticCurveTo(w*1.4,-h*.5,w*.6,0);g.closePath();g.fill();g.stroke()}
   else{const gr=g.createLinearGradient(0,0,0,-h);gr.addColorStop(0,A.c[0]);gr.addColorStop(1,A.c[1]);g.fillStyle=gr;g.shadowColor=A.c[0];g.shadowBlur=10;g.beginPath();g.moveTo(-w,0);g.lineTo(-w*.5,-h*.65);g.lineTo(0,-h);g.lineTo(w*.6,-h*.6);g.lineTo(w,0);g.closePath();g.fill();g.shadowBlur=0;g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1;g.stroke();g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.moveTo(-w,0);g.lineTo(-w*.5,-h*.65);g.lineTo(0,-h);g.lineTo(-w*.1,-h*.3);g.closePath();g.fill()}
   g.restore()}}
 function chainsDraw(g,A,u,cx,cy){const px=A.x-cx,py=A.y-cy-4,N=Math.max(10,Math.round(20*Math.max(.5,QM.cur.vfx))),r=34+ease(clamp(u*1.5,0,1))*62,fade=u<.15?u/.15:1-Math.pow((u-.15)/.85,1.4);
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=fade*.5;const gr=g.createRadialGradient(px,py,4,px,py,r*1.15);gr.addColorStop(0,A.c[0]+'00');gr.addColorStop(.8,A.c[0]+'66');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.ellipse(px,py,r*1.15,r*.34,0,0,6.3);g.fill();
  for(let ring=0;ring<2;ring++){const rr=r*(1-ring*.22),sp=(ring?-1:1)*u*5;for(let i=0;i<N;i++){const a=i/N*6.283+sp,x=px+Math.cos(a)*rr,y=py+Math.sin(a)*rr*.3-ring*8,tg=Math.atan2(Math.cos(a)*rr*.3,-Math.sin(a)*rr);g.save();g.translate(x,y);g.rotate(tg);g.scale(1,Math.abs(Math.sin(a))*.5+.5);g.globalAlpha=fade*(.55+.4*Math.sin(a));g.lineWidth=2.4;g.strokeStyle=i%2?A.c[0]:A.c[1];g.beginPath();g.ellipse(0,0,i%2?7:5,i%2?3.2:4,0,0,6.3);g.stroke();g.restore()}}
  g.globalAlpha=fade*.8;g.strokeStyle=A.c[1];g.lineWidth=1.4;g.beginPath();g.ellipse(px,py,r*1.3,r*.39,u*2,0,6.3);g.setLineDash([4,8]);g.stroke();g.restore()}
 function lanceDraw(g,A,u,cx,cy){const px=A.x-cx,py=A.y-cy-26,L=ease(clamp(u*1.8,0,1))*190,fade=u<.5?1:1-(u-.5)/.5;g.save();g.translate(px,py);g.scale(A.d,1);g.globalCompositeOperation='lighter';g.globalAlpha=fade;
  const gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,A.c[0]+'00');gr.addColorStop(.6,A.c[0]);gr.addColorStop(1,A.c[1]);g.fillStyle=gr;g.shadowColor=A.c[0];g.shadowBlur=14;g.beginPath();g.moveTo(10,-3);g.lineTo(L*.8,-6);g.lineTo(L,0);g.lineTo(L*.8,6);g.lineTo(10,3);g.closePath();g.fill();g.shadowBlur=0;
  g.strokeStyle=A.c[1];g.lineWidth=1.6;for(let i=0;i<3;i++){const rx=L*(.25+i*.22),ru=clamp(u*1.8-.2-i*.12,0,1);if(ru<=0)continue;g.globalAlpha=fade*(1-ru);g.beginPath();g.ellipse(rx,0,5+ru*8,10+ru*30,0,0,6.3);g.stroke()}
  g.globalAlpha=fade*.8;g.fillStyle=A.c[1];for(let i=0;i<6;i++){const q=(i/6+u*1.3)%1;g.fillRect(L*.1+q*L*.9,Math.sin(i*5+u*9)*9,2,2)}g.restore()}
 function orbDraw(g,A,u,cx,cy){const px=A.x-cx+A.d*64,py=A.y-cy-44,r=(10+ease(clamp(u*1.4,0,1))*34)*(u>.7?1-(u-.7)/.3*.4:1),fade=u<.75?1:1-(u-.75)/.25;g.save();g.translate(px,py);g.globalAlpha=fade;
  const gr=g.createRadialGradient(-r*.3,-r*.3,r*.1,0,0,r);gr.addColorStop(0,A.c[1]);gr.addColorStop(1,A.c[0]);g.shadowColor=A.c[0];g.shadowBlur=22;g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,6.3);g.fill();g.shadowBlur=0;
  g.save();g.beginPath();g.arc(0,0,r,0,6.3);g.clip();g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=r*.16;for(let i=0;i<4;i++){g.beginPath();g.arc(Math.sin(u*3+i)*r*.2,(i-1.5)*r*.45,r*1.2,.3+u*2+i,2.4+u*2+i);g.stroke()}g.restore();
  g.globalCompositeOperation='lighter';g.strokeStyle=A.c[1];g.lineWidth=2;for(let i=0;i<2;i++){g.save();g.rotate(i?-.5:.4);g.globalAlpha=fade*.8;g.beginPath();g.ellipse(0,0,r*1.7,r*.38,0,0,6.3);g.stroke();g.restore()}
  if(u>.6){const eu=(u-.6)/.4;g.globalAlpha=(1-eu)*.7;g.lineWidth=3;g.beginPath();g.arc(0,0,r*(1+eu*1.6),0,6.3);g.stroke()}g.restore()}
 function crowsDraw(g,A,u,cx,cy){const n=Math.max(5,Math.round(10*Math.max(.5,QM.cur.vfx))),fade=u<.7?1:1-(u-.7)/.3;g.save();g.globalAlpha=fade;
  for(let i=0;i<n;i++){const off=rnd(A.seed,i),x=A.x-cx+A.d*(u*300-i*16-off*30),y=A.y-cy+14+(rnd(A.seed,i+4)-.5)*70+Math.sin(u*10+i)*6,fl=Math.sin(u*40+i*1.7)*7,sz=.8+off*.6;
   g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(150,80,255,.35)';g.lineWidth=3;g.beginPath();g.moveTo(x,y);g.lineTo(x-A.d*(26+off*22),y);g.stroke();g.restore();
   g.save();g.translate(x,y);g.scale(A.d*sz,sz);g.fillStyle='#120d1c';g.strokeStyle='#8a5cff';g.lineWidth=1;g.beginPath();g.ellipse(0,0,6,3.2,0,0,6.3);g.fill();g.stroke();g.beginPath();g.moveTo(5,-1);g.lineTo(10,.5);g.lineTo(5,1.6);g.closePath();g.fill();g.beginPath();g.moveTo(-1,-1);g.lineTo(-7,-9-fl);g.lineTo(3,-2);g.closePath();g.fill();g.beginPath();g.moveTo(-1,1);g.lineTo(-8,7+fl);g.lineTo(3,2);g.closePath();g.fill();g.restore()}
  g.restore()}
 function drawAnims(g,cx,cy){if(!AN.length)return;const now=performance.now();g.save();
  for(let i=AN.length-1;i>=0;i--){const A=AN[i],u=(now-A.t0)/A.dur;if(u>=1){AN.splice(i,1);continue}try{({shards:shardDraw,chains:chainsDraw,lance:lanceDraw,orb:orbDraw,crows:crowsDraw})[A.k](g,A,u,cx,cy)}catch(_){AN.splice(i,1)}}
  g.restore()}
 // one signature animation per weapon (played on every swing, after the cooldown logic of the weapon itself)
 const WANIM={void:['chains',['#8a4cff','#e0c8ff']],crimsonrift:['shards',['#c01048','#ff9fc0']],frostbite:['shards',['#3f9cff','#e8f8ff']],astralkat:['lance',['#8f9cff','#ffffff']],solarfang:['orb',['#ff8a1f','#fff0b0']],verdant:['shards',['#3fae58','#c8ffd0'],{leaf:1}]};
 function weaponAnim(id){const a=WANIM[id];if(!a)return;anim(a[0],P.x,P.y+P.h,P.f||1,a[1],a[2])}
 const _vd=VFX.draw;VFX.draw=function(g,cx,cy,w,h){_vd.apply(this,arguments);try{drawAnims(g,cx,cy)}catch(_){}};
 let last=0;
 function tick(dt){if(!entered||dt>.2)return;const t=performance.now()/1000;
  const a=SHOP7.eqRef('aura');if(a&&AUR[a]){const n=gate('au',dt,14);if(n)AUR[a](n,P.x,P.y+P.h-6,t)}
  const ch=SHOP7.eqRef('charm');if(ch&&R()<.05*k())charmSpark(ch,t);
  trailTick(dt);spawnTick(dt)}
 function charmSpark(c,t){const p=charmPos(c,t);const col={star:'#ffe9a0',moon:'#d9d4ff',leaf:'#9ff0a8',chain:'#c9b8ff',raven:'#9a7cff'}[c]||'#fff';add(0,col,p.x,p.y,(R()-.5)*8,-8,.7,10,2,{a:.6})}
 function charmPos(c,t){const f=P.f||1;if(c=='raven')return{x:P.x-f*30+Math.sin(t*2)*8,y:P.y-12+Math.sin(t*3.1)*10};return{x:P.x-f*10,y:P.y+20}}
 // ---- dash trail (emitted while dash>0)
 let dashPrev=0;
 const TRL={
  trail_ember(x,y){for(let i=0;i<3;i++)add(0,'#ff8a2a',x+(R()-.5)*10,y+10+R()*30,-P.f*40*R(),-20-R()*30,.6,16,3,{a:.9})},
  trail_neon(x,y){const c=['#3ff3ff','#ff5ae8','#8a6bff'][(performance.now()/90|0)%3];for(let i=0;i<2;i++)add(0,c,x-P.f*i*12,y+26,0,0,.45,34,6,{a:.8})},
  trail_crow(x,y){if(R()<.7)add(4,'#14101e',x,y+10+R()*36,-P.f*(80+R()*80),(R()-.5)*80,.8,16,10,{r:R()*6,vr:6,a:1})}};
 function trailTick(dt){const tr=SHOP7.eqRef('trail');if(dash>0&&tr&&TRL[tr]){TRL[tr](P.x,P.y);if(tr=='trail_crow'&&dashPrev<=0)anim('crows',P.x,P.y+P.h-40,P.f||1,['#8a5cff','#14101e'])}dashPrev=dash}
 // ---- spawn effect (fired once when a world starts / after respawn)
 let spT=0,spK=null;
 function spawn(){const s=SHOP7.eqRef('spawn');if(!s)return;spK=s;spT=1.2;try{VFX.ring&&0}catch(_){}}
 function spawnTick(dt){if(spT<=0)return;spT-=dt;const x=P.x,y=P.y+P.h;
  if(spK=='spawn_chains'){const n=gate('sp',dt,24);for(let i=0;i<n;i++){const a=R()*6.28;add(3,'#c9b8ff',x+Math.cos(a)*30,y-R()*50,Math.cos(a)*-40,-10,.7,14,4,{a:.9})}}
  else if(spK=='spawn_bloom'){const n=gate('sp',dt,26);for(let i=0;i<n;i++){const a=R()*6.28,r=20+R()*40;add(4,'#ffb0cf',x+Math.cos(a)*r,y-R()*60,Math.cos(a)*30,-40-R()*30,1.2,12,8,{r:R()*6,vr:3})}}}
 // ---- victory (boss defeated)
 function victory(x,y){const v=SHOP7.eqRef('victory');if(!v)return;x=x==null?P.x:x;y=y==null?P.y:y;const n=Math.round(28*k());for(let i=0;i<n;i++){const a=i/n*6.28,s=120+R()*120;add(1,i%2?'#ffe9a0':'#9fe0ff',x,y,Math.cos(a)*s,Math.sin(a)*s,1.1,12,3,{a:1,d:1.6})}add(0,'#fff6c8',x,y,0,0,.5,20,160,{a:.9})}
 // ---- weapon trail colour override (cosmetic) and skins
 const wtCol=()=>{const r=SHOP7.eqRef('wtrail');return r&&WCOL[r]||null};
 const wskin=()=>{const r=SHOP7.eqRef('wskin');return r&&SKIN[r]||null};
 // ---- wing particle behaviour; cx,cy in screen space (callers draw in the camera frame)
 function wingFx(W,cx,cy,t){if(!W.fxk)return;const q=k();if(q<=0||R()>.16*q)return;const wx=cx+cam.x+(R()<.5?-1:1)*(18+R()*50),wy=cy+cam.y-10+R()*50;
  switch(W.fxk){
   case'glitter':add(1,'#fff6d8',wx,wy,(R()-.5)*10,16+R()*10,1.4,8,2,{a:.9});break;
   case'petals':add(4,'#ffb0cf',wx,wy,(R()-.5)*24,22+R()*14,2,12,8,{r:R()*6,vr:2});break;
   case'glints':add(1,'#c8f6ff',wx,wy,0,0,.5,16,2,{a:1});break;
   case'sparks':add(1,'#3ff3ff',wx,wy,(R()-.5)*60,-30,.5,8,1,{a:1,g:90});break;
   case'smoke':add(0,'#5b2aa8',wx,wy,(R()-.5)*10,-30,1.4,30,6,{a:.5});break;
   case'stars':add(1,['#fff','#9fe8ff','#ffb3f0'][(R()*3)|0],wx,wy,0,-6,1,10,2,{a:1});break;
   case'embers':add(0,'#ff7a2a',wx,wy,(R()-.5)*20,-34,.9,10,2,{a:.9});break;
   case'omen':add(0,'#ff3a4a',wx,wy,(R()-.5)*10,-14,1.2,14,3,{a:.6});break}}
 // ---- charm drawing (called from the character draw, screen space)
 function charmDraw(g,c,cx,cy,t,f){const sz=7;g.save();g.translate(cx,cy);g.lineJoin='round';
  if(c=='star'){g.translate(-f*14,28+Math.sin(t*2)*2);g.rotate(t*.8);g.fillStyle='#ffe27a';g.strokeStyle='#8a5a10';g.lineWidth=1.5;g.beginPath();for(let i=0;i<10;i++){const r=i%2?sz*.45:sz,a=i*Math.PI/5-Math.PI/2;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.stroke()}
  else if(c=='moon'){g.translate(-f*14,28+Math.sin(t*2)*2);g.fillStyle='#e6e2ff';g.strokeStyle='#4a3f9a';g.lineWidth=1.5;g.beginPath();g.arc(0,0,sz,.5,5.8);g.arc(sz*.45,-sz*.1,sz*.75,5.6,.7,true);g.closePath();g.fill();g.stroke()}
  else if(c=='leaf'){g.translate(-f*14,28);g.rotate(Math.sin(t*2)*.3);g.fillStyle='#6fe08a';g.strokeStyle='#1d6a35';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-sz);g.quadraticCurveTo(sz,-2,0,sz);g.quadraticCurveTo(-sz,-2,0,-sz);g.fill();g.stroke();g.beginPath();g.moveTo(0,-sz);g.lineTo(0,sz);g.stroke()}
  else if(c=='chain'){g.strokeStyle='#cbbcff';g.lineWidth=2;g.shadowColor='#8a6bff';g.shadowBlur=6;for(let i=0;i<5;i++){const a=-.4+i*.3+Math.sin(t*2+i)*.04;g.beginPath();g.ellipse(Math.sin(a)*22,30+i*3-Math.cos(a)*6,4,2.4,a,0,6.3);g.stroke()}}
  else if(c=='raven'){const p=charmPos('raven',t);g.restore();g.save();g.translate(p.x-cam.x,p.y-cam.y);g.scale(f,1);g.fillStyle='#14101e';g.strokeStyle='#6b52c8';g.lineWidth=1;g.beginPath();g.ellipse(0,0,9,6,0,0,6.3);g.fill();g.stroke();g.beginPath();g.moveTo(8,-1);g.lineTo(15,1);g.lineTo(8,3);g.closePath();g.fillStyle='#d8a040';g.fill();g.fillStyle='#14101e';const fl=Math.sin(t*14)*7;g.beginPath();g.moveTo(-2,-2);g.lineTo(-10,-10+fl);g.lineTo(2,-4);g.fill();g.beginPath();g.moveTo(-2,2);g.lineTo(-12,6-fl);g.lineTo(2,3);g.fill();g.fillStyle='#ff4a6a';g.fillRect(5,-3,2,2)}
  g.restore()}
 function onEquip(slot,id){try{if(id){const r=SHOP7.byId.get(id);if(slot=='spawn')spawn();else if(slot=='victory'){victory()}else if(slot=='aura'||slot=='trail'){const x=P.x,y=P.y+P.h;for(let i=0;i<12;i++)add(1,'#fff',x,y-20,(R()-.5)*160,(R()-.5)*160,.7,10,2)}}}catch(_){}}
 return{anim,weaponAnim,drawAnims,AN,WANIM,tick,spawn,victory,wtCol,wskin,wingFx,charmDraw,onEquip,AUR,TRL,WCOL,SKIN}})();
// spawn effect when a world finishes loading
{const _lw7=loadWorld;loadWorld=function(){const r=_lw7.apply(this,arguments);setTimeout(()=>{try{FX7.spawn()}catch(_){}},700);return r}}
