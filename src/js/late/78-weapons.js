// ===== WFX7: shop weapons. Each new weapon has its own model (drawn here), swing trail, impact effect, swing sound, and stats in WPN. =====
// Hooks: legacy slash drawing calls WFX7.trail, drawWeapon is wrapped for the models, hurtMob/useWeapon are wrapped for impact and sound.
const WFX7=(()=>{
 const R=Math.random;
 const NEW={
  solarfang:{n:'Solar Fang',g:[255,190,60],bd:2,md:17,cd:.38,k:'sword',cost:1200,fx:'burn',d:'A curved golden fang that sets enemies alight and leaves a blazing crescent.'},
  frostbite:{n:'Frostbite Edge',g:[130,215,255],bd:2,md:13,cd:.3,k:'sword',cost:700,fx:'slow',d:'A shard of living ice. Slows enemies and sheds snow on every swing.'},
  astralkat:{n:'Astral Katana',g:[140,150,255],bd:2,md:16,cd:.36,k:'sword',cost:1500,fx:'wave',d:'A slim star-lit blade that throws a piercing wave of light.'},
  crimsonrift:{n:'Crimson Rift',g:[255,40,80],bd:3,md:30,cd:.8,k:'scythe',cost:2800,fx:'area',d:'Tears the air open. Wide sweeps pull enemies into the rift.'},
  verdant:{n:'Verdant Breaker',g:[110,230,120],bd:4,md:15,cd:.55,k:'hammer',cost:450,fx:'harvest',d:'A vine-wrapped maul. Breaks blocks hard and doubles tree harvests.'}};
 for(const id in NEW)WPN[id]=NEW[id];for(const id in WPN)WPN[id].id=id;
 const rgb=a=>a.join(',');
 // ---- models: origin at the hand, blade towards +x, L ~ 44 in-game length. skin (local player only) may replace the palette.
 function pal(id,w){const sk=FX7.ld&&id==wp?FX7.wskin():null;return sk?{c:rgb(sk.tint),glow:sk.glow,sk:1}:{c:rgb(w.g),glow:'rgb('+rgb(w.g)+')',sk:0}}
 const MODEL={
  solarfang(x,L,t,P){x.strokeStyle='#000';x.lineWidth=2;x.fillStyle='#5a2a10';x.fillRect(-L*.2,-3,L*.25,6);x.strokeRect(-L*.2,-3,L*.25,6);
   x.fillStyle='#ffd24a';x.beginPath();x.moveTo(L*.02,-9);x.lineTo(L*.1,0);x.lineTo(L*.02,9);x.lineTo(-L*.04,0);x.closePath();x.fill();x.stroke();
   const g=x.createLinearGradient(0,-L*.3,L,0);g.addColorStop(0,'#fff6c8');g.addColorStop(.5,P.sk?'rgb('+P.c+')':'#ffb23a');g.addColorStop(1,P.sk?'#fff':'#ff6a1a');x.fillStyle=g;x.shadowColor=P.glow;x.shadowBlur=8;
   x.beginPath();x.moveTo(L*.08,-4);x.bezierCurveTo(L*.5,-L*.34,L*.95,-L*.22,L*1.05,L*.16);x.bezierCurveTo(L*.7,-L*.02,L*.4,L*.05,L*.08,5);x.closePath();x.fill();x.shadowBlur=0;x.stroke();
   x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=1;x.beginPath();x.moveTo(L*.12,-1);x.bezierCurveTo(L*.5,-L*.2,L*.85,-L*.12,L*.98,L*.1);x.stroke();
   x.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const u=.25+i*.2,py=-L*.2+Math.sin(t*8+i)*3-u*8;x.fillStyle='rgba(255,170,60,.7)';x.beginPath();x.arc(L*u,py,2.4,0,6.3);x.fill()}x.globalCompositeOperation='source-over'},
  frostbite(x,L,t,P){x.strokeStyle='#000';x.lineWidth=2;x.fillStyle='#23405c';x.fillRect(-L*.2,-3,L*.25,6);x.strokeRect(-L*.2,-3,L*.25,6);x.fillStyle='#9fd8ff';x.fillRect(L*.04,-8,5,16);x.strokeRect(L*.04,-8,5,16);
   x.shadowColor=P.glow;x.shadowBlur=9;const g=x.createLinearGradient(0,-6,L,6);g.addColorStop(0,'#fff');g.addColorStop(.5,P.sk?'rgb('+P.c+')':'#a9e6ff');g.addColorStop(1,'#4fa8ff');x.fillStyle=g;
   x.beginPath();x.moveTo(L*.09,-5);x.lineTo(L*.38,-7);x.lineTo(L*.5,-13);x.lineTo(L*.58,-5);x.lineTo(L*.8,-6);x.lineTo(L*.92,-10);x.lineTo(L*1.06,0);x.lineTo(L*.9,6);x.lineTo(L*.6,5);x.lineTo(L*.45,10);x.lineTo(L*.35,5);x.lineTo(L*.09,5);x.closePath();x.fill();x.shadowBlur=0;x.stroke();
   x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=1;x.beginPath();x.moveTo(L*.1,0);x.lineTo(L*1.0,0);x.moveTo(L*.5,-12);x.lineTo(L*.45,9);x.stroke();
   x.fillStyle='#fff';x.globalCompositeOperation='lighter';for(let i=0;i<4;i++){x.globalAlpha=.5+.5*Math.sin(t*5+i*2);x.fillRect(L*(.2+i*.2),-9+((i*7)%11),2,2)}x.globalAlpha=1;x.globalCompositeOperation='source-over'},
  astralkat(x,L,t,P){x.strokeStyle='#000';x.lineWidth=2;x.fillStyle='#1b1840';x.fillRect(-L*.3,-2.5,L*.3,5);x.strokeRect(-L*.3,-2.5,L*.3,5);x.strokeStyle='#8a8aff';x.lineWidth=1;for(let i=0;i<4;i++){x.beginPath();x.moveTo(-L*.26+i*L*.07,-2.5);x.lineTo(-L*.2+i*L*.07,2.5);x.stroke()}
   x.strokeStyle='#000';x.lineWidth=2;x.fillStyle='#d9c36a';x.beginPath();x.ellipse(L*.02,0,3,9,0,0,6.3);x.fill();x.stroke();
   x.shadowColor=P.glow;x.shadowBlur=8;const g=x.createLinearGradient(0,-3,0,3);g.addColorStop(0,'#fff');g.addColorStop(.6,P.sk?'rgb('+P.c+')':'#c9d0ff');g.addColorStop(1,'#6a70e8');x.fillStyle=g;
   x.beginPath();x.moveTo(L*.06,-3);x.quadraticCurveTo(L*.6,-7,L*1.12,-1);x.quadraticCurveTo(L*.6,3,L*.06,3);x.closePath();x.fill();x.shadowBlur=0;x.stroke();
   x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=.8;x.beginPath();x.moveTo(L*.1,1.2);x.quadraticCurveTo(L*.6,-1.8,L*1.08,-.4);x.stroke();
   x.globalCompositeOperation='lighter';x.fillStyle='#fff';for(let i=0;i<6;i++){x.globalAlpha=.4+.6*Math.abs(Math.sin(t*4+i*1.7));x.beginPath();x.arc(L*(.15+i*.15),-1+Math.sin(i*3)*1.5,1.3,0,6.3);x.fill()}x.globalAlpha=1;x.globalCompositeOperation='source-over'},
  crimsonrift(x,L,t,P){x.strokeStyle='#000';x.lineWidth=7;x.beginPath();x.moveTo(-L*.35,0);x.lineTo(L*.7,0);x.stroke();x.strokeStyle='#2a0a14';x.lineWidth=4;x.stroke();x.strokeStyle='#ff3a5a';x.lineWidth=1.2;for(let i=0;i<5;i++){x.beginPath();x.moveTo(-L*.3+i*L*.2,-2);x.lineTo(-L*.26+i*L*.2,2);x.stroke()}
   x.shadowColor=P.glow;x.shadowBlur=12;const g=x.createLinearGradient(L*.6,0,L,-L*.8);g.addColorStop(0,'#1a0610');g.addColorStop(.6,P.sk?'rgb('+P.c+')':'#b0123a');g.addColorStop(1,'#ff5a7a');x.fillStyle=g;x.strokeStyle='#000';x.lineWidth=2;
   x.beginPath();x.moveTo(L*.66,5);x.bezierCurveTo(L*1.2,L*.0,L*1.15,-L*.7,L*.5,-L*.9);x.bezierCurveTo(L*.95,-L*.55,L*.98,-L*.2,L*.7,-5);x.closePath();x.fill();x.stroke();x.shadowBlur=0;
   x.strokeStyle='#05010a';x.lineWidth=2;x.beginPath();x.moveTo(L*.85,-L*.05);x.lineTo(L*.8,-L*.25);x.lineTo(L*.92,-L*.4);x.lineTo(L*.84,-L*.6);x.stroke();
   x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,70,110,'+(.5+.3*Math.sin(t*6))+')';x.lineWidth=1.5;x.beginPath();x.moveTo(L*.85,-L*.05);x.lineTo(L*.8,-L*.25);x.lineTo(L*.92,-L*.4);x.lineTo(L*.84,-L*.6);x.stroke();x.globalCompositeOperation='source-over'},
  verdant(x,L,t,P){x.strokeStyle='#000';x.lineWidth=2;x.fillStyle='#6a4a2a';x.fillRect(-L*.2,-3,L*1.0,6);x.strokeRect(-L*.2,-3,L*1.0,6);
   x.strokeStyle='#3fae58';x.lineWidth=2;x.beginPath();for(let s=-L*.2;s<=L*.8;s+=3){const y=Math.sin(s*.3+t*2)*3.2;s==-L*.2?x.moveTo(s,y):x.lineTo(s,y)}x.stroke();
   x.fillStyle='#6fe08a';for(let i=0;i<4;i++){x.save();x.translate(L*(.05+i*.2),Math.sin(i*2+t*2)*3);x.rotate(i%2?1:-1);x.beginPath();x.ellipse(4,0,5,2.4,0,0,6.3);x.fill();x.restore()}
   const hx=L*.82;x.fillStyle='#6b6f78';x.strokeStyle='#000';x.lineWidth=2;x.beginPath();x.moveTo(hx,-15);x.lineTo(hx+L*.28,-11);x.lineTo(hx+L*.3,11);x.lineTo(hx,15);x.closePath();x.fill();x.stroke();
   x.fillStyle=P.sk?'rgb('+P.c+')':'#4aa86a';x.fillRect(hx+3,-12,L*.2,24);x.strokeRect(hx+3,-12,L*.2,24);x.strokeStyle='#d6ffdc';x.lineWidth=1;x.beginPath();x.moveTo(hx+L*.1,-9);x.lineTo(hx+L*.1,9);x.stroke();
   x.fillStyle='#ff9fc8';for(let i=0;i<3;i++){x.beginPath();x.arc(hx+4+i*L*.08,-14+i*2,2.2,0,6.3);x.fill()}}};
 // ---- slash trails. draw in screen space using s (x,y,a=angle,w), a=0..1 progress. return true if handled.
 const arc=(g,s,a,rg,half,widths,cols,e)=>{g.lineCap='round';for(let k=0;k<widths.length;k++){g.strokeStyle=cols[k];g.lineWidth=widths[k]*(1-a);g.beginPath();g.arc(s.x-cam.x,s.y-cam.y,rg*(1+k*.05),s.a-half,s.a-half+2*half*e);g.stroke()}g.lineCap='butt'};
 const burstOnce=(s,n,f)=>{if(s.fxd)return;s.fxd=1;if(QM.reduce)n=Math.ceil(n/4);for(let i=0;i<Math.ceil(n*QM.cur.vfx);i++)f(i)};
 const TRAIL={
  solarfang(g,s,a){const e=Math.min(1,a*2.4);g.globalCompositeOperation='lighter';arc(g,s,a,T*1.75,1.15,[22,12,5],['rgba(255,110,30,'+(.55*(1-a))+')','rgba(255,190,70,'+(.8*(1-a))+')','rgba(255,250,210,'+(1-a)+')'],e);g.globalCompositeOperation='source-over';
   burstOnce(s,10,i=>{const q=s.a+(R()-.5)*1.6;VFX.add(0,'#ff9a2a',s.x+Math.cos(q)*T*1.7,s.y+Math.sin(q)*T*1.7,Math.cos(q)*50,Math.sin(q)*50-20,.6,14,2,{a:.9})})},
  frostbite(g,s,a){const e=Math.min(1,a*2.6);arc(g,s,a,T*1.6,1.1,[8,4,2],['rgba(120,200,255,'+(.6*(1-a))+')','rgba(200,240,255,'+(.8*(1-a))+')','rgba(255,255,255,'+(1-a)+')'],e);
   burstOnce(s,12,i=>{const q=s.a+(R()-.5)*1.8;VFX.add(1,'#d8f4ff',s.x+Math.cos(q)*T*1.6,s.y+Math.sin(q)*T*1.6,(R()-.5)*30,20+R()*20,1.1,9,2,{a:1})})},
  astralkat(g,s,a){const e=Math.min(1,a*3.2);g.globalCompositeOperation='lighter';arc(g,s,a,T*2.0,.9,[6,2.5],['rgba(150,160,255,'+(.8*(1-a))+')','rgba(255,255,255,'+(1-a)+')'],e);g.globalCompositeOperation='source-over';
   burstOnce(s,9,i=>{const q=s.a-.9+R()*1.8;VFX.add(1,'#fff',s.x+Math.cos(q)*T*2,s.y+Math.sin(q)*T*2,0,-6,.9,10,2,{a:1})})},
  crimsonrift(g,s,a){const e=Math.min(1,a*2.2);arc(g,s,a,T*2.3,1.9,[20,10],['rgba(10,0,10,'+(.85*(1-a))+')','rgba(255,50,90,'+(.9*(1-a))+')'],e);g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,120,150,'+(.8*(1-a))+')';g.lineWidth=2;for(let i=0;i<6;i++){const q=s.a-1.9+i*.6*e;g.beginPath();g.moveTo(s.x-cam.x+Math.cos(q)*T*1.7,s.y-cam.y+Math.sin(q)*T*1.7);g.lineTo(s.x-cam.x+Math.cos(q)*T*2.7,s.y-cam.y+Math.sin(q)*T*2.7);g.stroke()}g.globalCompositeOperation='source-over';
   burstOnce(s,14,i=>{const q=s.a-1.9+R()*3.8;VFX.add(0,'#d01040',s.x+Math.cos(q)*T*2.3,s.y+Math.sin(q)*T*2.3,-Math.cos(q)*60,-Math.sin(q)*60,.6,16,2,{a:.9})})},
  verdant(g,s,a){const e=Math.min(1,a*2.2);arc(g,s,a,T*1.5,1.0,[14,6],['rgba(60,150,80,'+(.6*(1-a))+')','rgba(160,255,170,'+(.8*(1-a))+')'],e);
   burstOnce(s,8,i=>{const q=s.a+(R()-.5)*1.6;VFX.add(4,'#6fe08a',s.x+Math.cos(q)*T*1.5,s.y+Math.sin(q)*T*1.5,Math.cos(q)*40,Math.sin(q)*40-10,1,12,8,{r:R()*6,vr:4})})},
  void(g,s,a){const e=Math.min(1,a*2.3);arc(g,s,a,T*2.1,1.8,[18,9,3],['rgba(20,0,40,'+(.7*(1-a))+')','rgba(140,70,255,'+(.8*(1-a))+')','rgba(230,200,255,'+(1-a)+')'],e);
   burstOnce(s,10,i=>{const q=s.a-1.8+R()*3.6;VFX.add(0,'#8a4cff',s.x+Math.cos(q)*T*2.1,s.y+Math.sin(q)*T*2.1,-Math.cos(q)*45,-Math.sin(q)*45,.7,20,3,{a:.8})})}};
 // cosmetic weapon trail for weapons without a custom trail (colours picked from FX7)
 function plainTrail(g,s,a,c){const e=Math.min(1,a*2.5),rg=s.w.k=='scythe'?T*2.2:s.w.k=='fist'?T*.9:T*1.6,half=s.w.k=='scythe'?1.9:1.1;g.globalCompositeOperation='lighter';arc(g,s,a,rg,half,[14,7,3],['rgba(0,0,0,0)',c[0],c[1]].map((v,i)=>i?alpha(v,1-a):v),e);g.globalCompositeOperation='source-over'}
 const alpha=(hex,a)=>{const n=parseInt(hex.slice(1),16);return'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'};
 function trail(g,s,a){const id=s.w&&s.w.id,ct=FX7.wtCol();if(ct){plainTrail(g,s,a,ct);return true}
  if(id&&TRAIL[id]&&own[id]){TRAIL[id](g,s,a);return true}return false}
 // ---- impact (on hit) + swing sound
 const IMP={
  solarfang(m){for(let i=0;i<8;i++){const a=R()*6.28;VFX.add(1,'#ffb23a',m.x,m.y,Math.cos(a)*120,Math.sin(a)*120,.5,10,2,{a:1,d:2})}},
  frostbite(m){for(let i=0;i<8;i++){const a=R()*6.28;VFX.add(2,'#bfe8ff',m.x,m.y,Math.cos(a)*100,Math.sin(a)*100-30,.6,12,3,{r:a,vr:3,g:200})}},
  astralkat(m){for(let i=0;i<7;i++)VFX.add(1,'#fff',m.x+(R()-.5)*20,m.y+(R()-.5)*20,(R()-.5)*60,-30,.7,12,2,{a:1})},
  crimsonrift(m){VFX.add(3,'#ff2a5a',m.x,m.y,0,0,.5,10,70,{a:.9});for(let i=0;i<6;i++){const a=R()*6.28;VFX.add(0,'#a00a30',m.x,m.y,-Math.cos(a)*70,-Math.sin(a)*70,.5,16,2,{a:.9})}},
  verdant(m){for(let i=0;i<7;i++)VFX.add(4,'#6fe08a',m.x,m.y,(R()-.5)*160,-60-R()*80,1,12,8,{r:R()*6,vr:4,g:160})},
  void(m){for(let i=0;i<8;i++){const a=R()*6.28;VFX.add(0,'#7a3cff',m.x+Math.cos(a)*30,m.y+Math.sin(a)*30,-Math.cos(a)*90,-Math.sin(a)*90,.5,18,3,{a:.9})}}};
 const SFX={ // [freq, dur, type, vol, slide]
  solarfang:[[520,.12,'sawtooth',.05,.5],[900,.08,'triangle',.03,.6]],frostbite:[[1300,.1,'triangle',.05,.5],[2100,.06,'sine',.03,.7]],astralkat:[[1500,.14,'sine',.05,.4],[2400,.1,'sine',.025,.5]],
  crimsonrift:[[110,.3,'sawtooth',.07,.4],[70,.35,'square',.04,.5]],verdant:[[200,.16,'triangle',.07,.6],[150,.12,'square',.04,.7]],void:[[140,.28,'sawtooth',.05,.5],[420,.2,'sine',.03,.3]]};
 function swing(id){const a=SFX[id];if(a&&own[id])for(const s of a)snd(s[0],s[1],s[2],s[3],s[4])}
 const _dw=drawWeapon;drawWeapon=function(x,id,L,t){const w=WPN[id];if(w&&MODEL[id]){x.save();x.lineJoin='round';x.lineCap='round';try{MODEL[id](x,L,t||0,pal(id,w))}finally{x.restore()}return}
  const sk=FX7.ld&&id==wp&&id!='fist'&&FX7.wskin();if(sk&&w){const g0=w.g;w.g=sk.tint;try{_dw(x,id,L,t)}finally{w.g=g0}return}_dw(x,id,L,t)};
 const _hm=hurtMob;hurtMob=function(m,d,w,ang){const r=_hm.apply(this,arguments);try{if(w&&w.id&&IMP[w.id]&&d>0&&own[w.id])IMP[w.id](m)}catch(_){}return r};
 const _uw=useWeapon;useWeapon=function(){const r=_uw.apply(this,arguments);try{swing(wp)}catch(_){}return r};
 // the stand-alone list (used by the store preview and by tests)
 return{NEW,MODEL,TRAIL,IMP,SFX,trail,swing,ids:Object.keys(NEW).concat(['void'])}})();
