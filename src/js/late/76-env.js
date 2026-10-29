// ===== ENV7: persistent world environments (Blossom / Space / Galaxy) =====
// Fully procedural (no image files => nothing can be missing in the HTML or Windows build). Layers are rendered once into offscreen
// canvases, drawn with parallax, cross-faded when the world's weather changes, and released again when unused.
const ENV7=(()=>{
 const LIST=['default','blossom','space','galaxy'],NAMES={default:'Skies',blossom:'Blossom Bloom',space:'Deep Space',galaxy:'Galaxy Bloom'};
 const LW=1600,LH=900;
 let target='default',al={blossom:0,space:0,galaxy:0},order=[],cache={},idle={},lt=0,petals=[],dust=[],shoot=null,sizeKey='';
 const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const grad=(x,y0,y1,stops,h)=>{const g2=x.createLinearGradient(0,y0,0,y1);stops.forEach(s=>g2.addColorStop(s[0],s[1]));return g2};
 const wrapX=(w,x,r,f)=>{f(x);if(x-r<0)f(x+w);if(x+r>w)f(x-w)};
 function blob(x,cx,cy,r,c,a){const g2=x.createRadialGradient(cx,cy,0,cx,cy,r);g2.addColorStop(0,c.replace('A',a));g2.addColorStop(1,c.replace('A',0));x.fillStyle=g2;x.fillRect(cx-r,cy-r,r*2,r*2)}
 // ---------------- BLOSSOM ----------------
 function treeBlossom(x,tx,base,h,R,tone){ // trunk + curved branches + canopy of clustered petals
  const th=h*.42,tw=h*.045;x.save();x.fillStyle=tone.trunk;x.beginPath();x.moveTo(tx-tw,base);x.bezierCurveTo(tx-tw*.8,base-th*.5,tx-tw*.4,base-th*.8,tx-tw*.3,base-th);x.lineTo(tx+tw*.3,base-th);x.bezierCurveTo(tx+tw*.5,base-th*.7,tx+tw*.9,base-th*.4,tx+tw,base);x.closePath();x.fill();
  x.strokeStyle=tone.trunk;x.lineCap='round';const br=[];for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.55+(R()-.5)*.3,L=h*(.28+R()*.18),sx=tx+(R()-.5)*tw,sy=base-th*(.75+R()*.25),ex=sx+Math.cos(a)*L,ey=sy+Math.sin(a)*L;x.lineWidth=tw*.5;x.beginPath();x.moveTo(sx,sy);x.quadraticCurveTo(sx+Math.cos(a)*L*.4+(R()-.5)*20,sy+Math.sin(a)*L*.5,ex,ey);x.stroke();br.push([ex,ey,L])}
  br.push([tx,base-th-h*.12,h*.3]);
  for(const[ex,ey,L]of br){const n=Math.round(L/6);for(let i=0;i<n;i++){const a=R()*6.283,d=Math.sqrt(R())*L*.7,px=ex+Math.cos(a)*d,py=ey+Math.sin(a)*d*.75,r=h*(.035+R()*.045),c=tone.pet[R()*tone.pet.length|0];x.fillStyle=c;x.beginPath();x.arc(px,py,r,0,6.283);x.fill()}}
  // soft top-light on the canopy
  for(const[ex,ey,L]of br){const gl=x.createRadialGradient(ex-L*.12,ey-L*.2,0,ex,ey,L*.7);gl.addColorStop(0,'rgba(255,245,248,.45)');gl.addColorStop(1,'rgba(255,245,248,0)');x.fillStyle=gl;x.beginPath();x.arc(ex,ey,L*.7,0,6.283);x.fill()}
  x.restore()}
 function buildBlossom(){const L={};
  let c=cv(LW,LH),x=c.getContext('2d');x.fillStyle=grad(x,0,LH,[[0,'#f0aecb'],[.3,'#f8cddb'],[.62,'#fde6e3'],[1,'#fff3e6']]);x.fillRect(0,0,LW,LH);
  blob(x,LW*.72,LH*.26,LH*.7,'rgba(255,250,235,A)',.95);blob(x,LW*.2,LH*.5,LH*.6,'rgba(255,200,225,A)',.45);
  x.save();x.globalCompositeOperation='lighter';x.fillStyle='rgba(255,236,214,.06)';for(let i=0;i<7;i++){const a=-.3+i*.19;x.beginPath();x.moveTo(LW*.72,LH*.2);x.lineTo(LW*.72+Math.cos(a+1.2)*1700-90,LH*.2+Math.sin(a+1.2)*1700);x.lineTo(LW*.72+Math.cos(a+1.2)*1700+90,LH*.2+Math.sin(a+1.2)*1700);x.closePath();x.fill()}x.restore();
  // soft clouds
  x.fillStyle='rgba(255,255,255,.55)';const r0=rng(5);for(let i=0;i<9;i++){const cx=r0()*LW,cy=LH*(.1+r0()*.3),w=140+r0()*220;for(let k=0;k<5;k++){x.beginPath();x.ellipse(cx+(k-2)*w*.22,cy+(k%2)*8,w*.3,w*.1,0,0,6.283);x.fill()}}
  L.sky=c;
  // far: mountain + pagoda silhouette + mist (tileable in x)
  c=cv(LW*2,LH);x=c.getContext('2d');const W2=LW*2,r1=rng(11);
  const ridge=(col,base,amp,seed,al2)=>{x.fillStyle=col;x.globalAlpha=al2;x.beginPath();x.moveTo(0,LH);for(let px=0;px<=W2;px+=20){const y=base-(Math.abs(Math.sin(px/W2*6.283*2+seed))*.55+Math.abs(Math.sin(px/W2*6.283*5+seed*2))*.3+Math.sin(px/W2*6.283*11+seed)*.08+.1)*amp;x.lineTo(px,y)}x.lineTo(W2,LH);x.closePath();x.fill();x.globalAlpha=1};
  ridge('#d6b3d3',LH*.62,230,1,.75);ridge('#cf9fc6',LH*.7,170,3,.8);
  // pagoda on a far hill
  x.fillStyle='#bd8fb7';const px0=W2*.34,py0=LH*.58;for(let t=0;t<4;t++){const w=70-t*12,y=py0-t*30;x.beginPath();x.moveTo(px0-w,y);x.quadraticCurveTo(px0,y-18,px0+w,y);x.lineTo(px0+w-8,y+8);x.lineTo(px0-w+8,y+8);x.closePath();x.fill();x.fillRect(px0-w*.45,y+8,w*.9,22)}x.fillRect(px0-3,py0-142,6,28);
  // torii gate
  const tx0=W2*.78,ty0=LH*.62;x.fillRect(tx0-46,ty0-70,9,70);x.fillRect(tx0+37,ty0-70,9,70);x.fillRect(tx0-62,ty0-82,124,10);x.fillRect(tx0-50,ty0-58,100,6);
  x.fillStyle=grad(x,LH*.5,LH,[[0,'rgba(255,240,245,0)'],[1,'rgba(255,240,245,.75)']]);x.fillRect(0,LH*.5,W2,LH*.5);L.far=c;
  // mid: rolling hills + blossom trees
  c=cv(LW*2,LH);x=c.getContext('2d');const R=rng(23);
  x.fillStyle='#eab2c9';x.beginPath();x.moveTo(0,LH);for(let px=0;px<=W2;px+=24)x.lineTo(px,LH*.8-(Math.sin(px/W2*6.283*3)*.5+.5)*70-(Math.sin(px/W2*6.283*7)*.5+.5)*24);x.lineTo(W2,LH);x.closePath();x.fill();
  const tone={trunk:'#7a4660',pet:['#f5a3c1','#f9bfd2','#fcd9e5','#ee8db3','#fbe6ee']};
  for(let i=0;i<7;i++){const tx=(i+.5)*W2/7+(R()-.5)*120,h=300+R()*170;wrapX(W2,tx,h,xx=>treeBlossom(x,xx,LH*.82+R()*20,h,R,tone))}
  x.fillStyle=grad(x,LH*.7,LH,[[0,'rgba(255,230,240,0)'],[1,'rgba(255,232,240,.55)']]);x.fillRect(0,LH*.7,W2,LH*.3);L.mid=c;
  // near: overhanging branches at the top edges (sparse so gameplay stays visible)
  c=cv(LW*2,LH);x=c.getContext('2d');const R2=rng(41);for(const[bx,flip]of[[W2*.08,1],[W2*.52,-1],[W2*.93,1]]){x.save();x.translate(bx,0);x.scale(flip,1);x.strokeStyle='#6a3a52';x.lineCap='round';x.lineWidth=14;x.beginPath();x.moveTo(-80,-20);x.bezierCurveTo(60,70,160,40,300,120);x.stroke();x.lineWidth=7;x.beginPath();x.moveTo(120,56);x.quadraticCurveTo(180,110,230,100);x.stroke();
   for(let i=0;i<110;i++){const t=R2(),px=-40+t*340+(R2()-.5)*80,py=20+t*100+(R2()-.5)*90,r=7+R2()*14;x.fillStyle=tone.pet[R2()*5|0];x.globalAlpha=.9;x.beginPath();x.arc(px,py,r,0,6.283);x.fill()}x.restore()}L.near=c;
  return L}
 // ---------------- SPACE ----------------
 function stars(x,w,h,n,rmin,rmax,r,cols,glow){for(let i=0;i<n;i++){const px=r()*w,py=r()*h,rad=rmin+r()*(rmax-rmin);x.fillStyle=cols[r()*cols.length|0];x.globalAlpha=.45+r()*.55;if(glow&&rad>1.6){const g2=x.createRadialGradient(px,py,0,px,py,rad*5);g2.addColorStop(0,x.fillStyle);g2.addColorStop(1,'rgba(255,255,255,0)');x.save();x.globalAlpha*=.5;x.fillStyle=g2;x.fillRect(px-rad*5,py-rad*5,rad*10,rad*10);x.restore()}x.beginPath();x.arc(px,py,rad,0,6.283);x.fill()}x.globalAlpha=1}
 function planet(x,cx,cy,r,cols,opt){opt=opt||{};x.save();const g2=x.createRadialGradient(cx-r*.4,cy-r*.45,r*.1,cx,cy,r);g2.addColorStop(0,cols[0]);g2.addColorStop(.55,cols[1]);g2.addColorStop(1,cols[2]);
  if(opt.ring){x.save();x.translate(cx,cy);x.rotate(opt.tilt||-.35);x.strokeStyle=opt.ring[0];x.lineWidth=r*.13;x.beginPath();x.ellipse(0,0,r*1.7,r*.42,0,Math.PI,6.283);x.stroke();x.lineWidth=r*.06;x.strokeStyle=opt.ring[1];x.beginPath();x.ellipse(0,0,r*1.95,r*.5,0,Math.PI,6.283);x.stroke();x.restore()}
  x.fillStyle=g2;x.beginPath();x.arc(cx,cy,r,0,6.283);x.fill();x.save();x.beginPath();x.arc(cx,cy,r,0,6.283);x.clip();
  if(opt.bands){for(let i=0;i<opt.bands;i++){x.fillStyle='rgba('+opt.bc+','+(.08+(i%2)*.07)+')';x.fillRect(cx-r,cy-r+i*(2*r/opt.bands)+r*.1,r*2,r*.16)}}
  if(opt.craters){const R=rng(opt.craters);for(let i=0;i<9;i++){const a=R()*6.283,d=R()*r*.75,px=cx+Math.cos(a)*d,py=cy+Math.sin(a)*d,cr=r*(.05+R()*.1);x.fillStyle='rgba(0,0,0,.15)';x.beginPath();x.arc(px,py,cr,0,6.283);x.fill();x.fillStyle='rgba(255,255,255,.1)';x.beginPath();x.arc(px-cr*.2,py-cr*.2,cr*.8,0,6.283);x.fill()}}
  const sh=x.createRadialGradient(cx+r*.6,cy+r*.5,r*.2,cx+r*.5,cy+r*.45,r*1.4);sh.addColorStop(0,'rgba(5,4,25,0)');sh.addColorStop(1,'rgba(5,4,25,.78)');x.fillStyle=sh;x.fillRect(cx-r,cy-r,r*2,r*2);x.restore();
  x.strokeStyle=opt.rim||'rgba(190,210,255,.5)';x.lineWidth=1.5;x.beginPath();x.arc(cx,cy,r-.5,Math.PI*1.05,Math.PI*1.75);x.stroke();
  if(opt.ring){x.save();x.translate(cx,cy);x.rotate(opt.tilt||-.35);x.strokeStyle=opt.ring[0];x.lineWidth=r*.13;x.beginPath();x.ellipse(0,0,r*1.7,r*.42,0,0,Math.PI);x.stroke();x.lineWidth=r*.06;x.strokeStyle=opt.ring[1];x.beginPath();x.ellipse(0,0,r*1.95,r*.5,0,0,Math.PI);x.stroke();x.restore()}
  x.restore()}
 function buildSpace(){const L={};let c=cv(LW,LH),x=c.getContext('2d'),r=rng(7);
  x.fillStyle=grad(x,0,LH,[[0,'#03041a'],[.5,'#0d0f3a'],[1,'#25195e']]);x.fillRect(0,0,LW,LH);x.globalCompositeOperation='lighter';
  blob(x,LW*.25,LH*.35,LH*.75,'rgba(60,70,190,A)',.3);blob(x,LW*.78,LH*.6,LH*.8,'rgba(110,50,170,A)',.3);blob(x,LW*.55,LH*.15,LH*.55,'rgba(40,110,200,A)',.22);blob(x,LW*.1,LH*.85,LH*.5,'rgba(120,60,190,A)',.25);
  x.globalCompositeOperation='source-over';stars(x,LW,LH,260,.5,1,r,['#ffffff','#cfe0ff','#e9d8ff'],false);L.sky=c;
  c=cv(LW*2,LH);x=c.getContext('2d');r=rng(19);stars(x,LW*2,LH,180,.8,1.8,r,['#ffffff','#bcd4ff','#f1ddff','#ffe9c8'],true);
  x.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const px=(i+.5)*LW*2/5+(r()-.5)*160,py=LH*(.2+r()*.6);wrapX(LW*2,px,500,xx=>{blob(x,xx,py,300+r()*160,i%2?'rgba(70,90,220,A)':'rgba(130,70,200,A)',.18)})}x.globalCompositeOperation='source-over';L.far=c;
  c=cv(LW*2,LH);x=c.getContext('2d');r=rng(31);stars(x,LW*2,LH,40,1.6,3.0,r,['#ffffff','#cfe3ff','#ffe3f2'],true);
  wrapX(LW*2,LW*.55,300,xx=>planet(x,xx,LH*.3,110,['#b9a2ff','#6a56c9','#2a2166'],{ring:['rgba(210,190,255,.7)','rgba(150,170,255,.45)'],bands:7,bc:'255,255,255',tilt:-.38}));
  wrapX(LW*2,LW*1.35,200,xx=>planet(x,xx,LH*.58,52,['#d9e3f5','#8c97b8','#363a58'],{craters:3,rim:'rgba(230,240,255,.55)'}));
  wrapX(LW*2,LW*1.82,200,xx=>planet(x,xx,LH*.2,34,['#7fd4ff','#3a74c9','#142a63'],{bands:4,bc:'255,255,255'}));L.mid=c;return L}
 // ---------------- GALAXY ----------------
 function spiral(size,seed,arms,tw,cols){const c=cv(size,size),x=c.getContext('2d'),r=rng(seed),h=size/2;x.globalCompositeOperation='lighter';
  const core=x.createRadialGradient(h,h,0,h,h,h*.5);core.addColorStop(0,'rgba(255,248,225,.95)');core.addColorStop(.25,'rgba(255,205,160,.5)');core.addColorStop(1,'rgba(255,120,200,0)');x.fillStyle=core;x.fillRect(0,0,size,size);
  const halo=x.createRadialGradient(h,h,h*.2,h,h,h);halo.addColorStop(0,'rgba(170,110,255,.28)');halo.addColorStop(1,'rgba(90,70,230,0)');x.fillStyle=halo;x.fillRect(0,0,size,size);
  for(let a=0;a<arms;a++){for(let i=0;i<2600/arms;i++){const t=Math.pow(r(),.8),ang=t*tw+a*6.283/arms+(r()-.5)*.35*(1-t*.5),d=t*h*.92,j=(r()-.5)*(10+t*34),px=h+Math.cos(ang)*d+j,py=h+Math.sin(ang)*d+j*.6,ci=Math.min(cols.length-1,(t*cols.length)|0);x.fillStyle=cols[ci];x.globalAlpha=.25+r()*.6;const s=.7+r()*(1.2+(1-t)*1.6);x.beginPath();x.arc(px,py,s,0,6.283);x.fill()}}
  x.globalAlpha=1;x.globalCompositeOperation='source-over';return c}
 function buildGalaxy(){const L={};let c=cv(LW,LH),x=c.getContext('2d'),r=rng(77);
  x.fillStyle=grad(x,0,LH,[[0,'#060320'],[.45,'#150c48'],[.8,'#321159'],[1,'#5a1a68']]);x.fillRect(0,0,LW,LH);x.globalCompositeOperation='lighter';
  const neb=[[.2,.3,.7,'rgba(255,90,170,A)',.3],[.7,.2,.8,'rgba(120,80,255,A)',.34],[.5,.7,.9,'rgba(60,120,255,A)',.3],[.9,.75,.6,'rgba(255,120,200,A)',.26],[.05,.8,.6,'rgba(90,70,230,A)',.3],[.45,.4,.55,'rgba(80,220,255,A)',.12]];
  for(const[a,b,s,col,al2]of neb){for(let k=0;k<4;k++)blob(x,LW*(a+(r()-.5)*.1),LH*(b+(r()-.5)*.12),LH*s*(.5+r()*.5),col,al2*.7)}
  x.globalCompositeOperation='source-over';stars(x,LW,LH,320,.5,1.1,r,['#ffffff','#ffd9ee','#d3e0ff'],false);L.sky=c;
  c=cv(LW*2,LH);x=c.getContext('2d');r=rng(88);stars(x,LW*2,LH,190,.8,1.9,r,['#ffffff','#ffd0ea','#c6d8ff','#ffe9c8'],true);
  x.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const px=(i+.5)*LW*2/5+(r()-.5)*200,py=LH*(.15+r()*.7);wrapX(LW*2,px,500,xx=>blob(x,xx,py,260+r()*180,['rgba(255,100,190,A)','rgba(110,90,255,A)','rgba(70,160,255,A)'][i%3],.16))}x.globalCompositeOperation='source-over';L.far=c;
  L.gal=spiral(760,5,4,7.2,['rgba(255,240,215,1)','rgba(255,200,230,1)','rgba(245,150,230,1)','rgba(170,130,255,1)','rgba(110,150,255,1)']);
  L.gal2=spiral(420,9,2,5.4,['rgba(255,230,210,1)','rgba(210,160,255,1)','rgba(120,170,255,1)']);
  c=cv(LW*2,LH);x=c.getContext('2d');r=rng(99);stars(x,LW*2,LH,34,1.8,3.4,r,['#ffffff','#ffe3f4','#d6e4ff'],true);
  // 4-point flares on the brightest stars
  x.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const px=r()*LW*2,py=r()*LH*.8,s=18+r()*30;x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1.2;x.beginPath();x.moveTo(px-s,py);x.lineTo(px+s,py);x.moveTo(px,py-s);x.lineTo(px,py+s);x.stroke();blob(x,px,py,s*.7,'rgba(255,230,250,A)',.5)}x.globalCompositeOperation='source-over';
  wrapX(LW*2,LW*.7,300,xx=>planet(x,xx,LH*.86,210,['#6a4aa8','#2e1f66','#0f0a2e'],{bands:6,bc:'255,170,230',rim:'rgba(255,170,230,.7)'}));
  wrapX(LW*2,LW*1.55,260,xx=>planet(x,xx,LH*.28,64,['#ffc2e6','#a45acf','#35185e'],{ring:['rgba(255,210,240,.65)','rgba(190,160,255,.45)'],bands:5,bc:'255,255,255',tilt:.3,rim:'rgba(255,220,250,.6)'}));L.mid=c;return L}
 const BUILD={blossom:buildBlossom,space:buildSpace,galaxy:buildGalaxy},PAINT={},FORCE={};
 // more environments register here (76-z-env2.js): {n:name, build()->layers, paint(g,L,o) custom painter, wx: forced weather state}
 function reg(id,o){if(!LIST.includes(id))LIST.push(id);NAMES[id]=o.n;if(!(id in al))al[id]=0;BUILD[id]=o.build;if(o.paint)PAINT[id]=o.paint;if(o.wx)FORCE[id]=o.wx}
 function ensure(env){if(!cache[env]){try{cache[env]=BUILD[env]()}catch(e){console.error('ENV7 build',e);cache[env]=null;al[env]=0}}idle[env]=0;return cache[env]}
 // ---------------- API ----------------
 function set(wx,o){o=o||{};if(!LIST.includes(wx))wx='default';const ch=wx!=target;target=wx;if(wx!='default'){if(!order.includes(wx))order.push(wx);else{order=order.filter(e=>e!=wx);order.push(wx)}ensure(wx)}
  if(o.instant){for(const e of Object.keys(al))al[e]=e==wx?1:0}
  try{WX6.force=wx=='default'?null:FORCE[wx]||'clear'}catch(_){}
  if(ch&&!o.instant&&!o.quiet){try{say6(NAMES[wx],o.by?'Weather changed by '+o.by:'The world weather changed',3200);UIS.play('rare')}catch(_){}}
  try{if(typeof HUDWX7=='function')HUDWX7()}catch(_){}
  return ch}
 function draw(w,hh,now){const t=now/1000,dt=Math.min(.1,lt?t-lt:.016);lt=t;let cover=0;
  for(const e of Object.keys(al)){const tg=e==target?1:0,d=tg-al[e];al[e]+=Math.abs(d)<.002?d:Math.sign(d)*Math.min(Math.abs(d),dt*.55);if(al[e]>cover)cover=al[e];
   if(al[e]<=0&&e!=target&&cache[e]){idle[e]=(idle[e]||0)+dt;if(idle[e]>14){cache[e]=null;delete idle[e];order=order.filter(x=>x!=e)}}}
  return cover}
 function paint(w,hh,now){const t=now/1000,s=Math.max(w/LW,hh/LH),still=(window.QM&&QM.reduce)||(typeof cel!='undefined'&&cel.opt&&cel.opt.reduce);const par=(window.QM&&QM.cur&&QM.cur.par)||4;
  for(const e of order){const a=al[e];if(a<=.004)continue;const L=cache[e]||ensure(e);if(!L)continue;g.save();g.globalAlpha=a;
   const ox=(w-LW*s)/2,oy=Math.min(0,(hh-LH*s)/2)+Math.max(-30,Math.min(30,(cam.y-(sh(W/2|0)*T))*-.012));
   const tile=(img,k,yo,sc,dx)=>{const iw=img.width*s*(sc||1),px=(-(cam.x*k+(dx||0))%iw+iw)%iw;for(let x0=px-iw;x0<w;x0+=iw)g.drawImage(img,x0,yo||0,iw,img.height*s*(sc||1))};
   if(PAINT[e]){try{PAINT[e](g,L,{w,hh,t,s,a,ox,oy,still,par,tile,gY:Math.max(hh*.25,Math.min(hh*.85,(sh(DX)*T-cam.y)*ZM)),LW,LH})}catch(err){if(!paint.err){paint.err=1;console.error('ENV7 paint',e,err)}}g.restore();continue}
   g.drawImage(L.sky,ox,oy,LW*s,LH*s);
   if(e=='galaxy'){const rot=still?0:t*.012,gs=LH*s*.95;g.save();g.globalAlpha=a*.95;g.translate(w*.74-cam.x*.01,hh*.3);g.rotate(rot);g.drawImage(L.gal,-gs/2,-gs/2,gs,gs);g.restore();g.save();g.globalAlpha=a*.7;g.translate(w*.16-cam.x*.02,hh*.52);g.rotate(-rot*1.4+.5);g.scale(1,.45);g.drawImage(L.gal2,-gs*.2,-gs*.2,gs*.4,gs*.4);g.restore()}
   const gY=Math.max(hh*.25,Math.min(hh*.85,(sh(DX)*T-cam.y)*ZM));
   if(L.far)tile(L.far,e=='blossom'?.05:.03,e=='blossom'?gY-LH*.66*s-12:0);
   if(L.mid)tile(L.mid,e=='blossom'?.12:.07,e=='blossom'?gY-LH*.8*s:e=='galaxy'?gY-LH*.72*s:0);
   if(L.near)tile(L.near,.28,0);
   // live layer
   if(!still){if(e=='blossom'){const N=Math.min(60,10*par);while(petals.length<N)petals.push({x:Math.random(),y:Math.random(),z:.4+Math.random()*.6,p:Math.random()*6,c:Math.random()<.5?'#f7b0c9':'#fde0ea'});petals.length=N;
     for(const p of petals){p.y+=(.018+p.z*.03)*.016;p.x+=Math.sin(t*.8+p.p)*.0006+.0009*p.z;if(p.y>1.05){p.y=-.05;p.x=Math.random()}if(p.x>1.05)p.x-=1.1;g.globalAlpha=a*(.55+p.z*.4);g.fillStyle=p.c;g.save();g.translate(p.x*w,p.y*hh);g.rotate(t*.9+p.p);g.beginPath();g.ellipse(0,0,3+p.z*4,1.8+p.z*2,0,0,6.283);g.fill();g.restore()}}
    else{const N=Math.min(40,7*par);while(dust.length<N)dust.push({x:Math.random(),y:Math.random(),z:Math.random(),p:Math.random()*6});dust.length=N;g.fillStyle=e=='galaxy'?'#ffd7f2':'#cfe0ff';
     for(const d of dust){d.x+=(.0006+d.z*.0012)*.016*10;d.y+=Math.sin(t*.3+d.p)*.00008;if(d.x>1.02)d.x=-.02;g.globalAlpha=a*(.25+.5*Math.abs(Math.sin(t*.9+d.p)));g.beginPath();g.arc(d.x*w,d.y*hh,.8+d.z*1.6,0,6.283);g.fill()}
     if(!shoot&&Math.random()<.002)shoot={x:Math.random()*w*.8,y:Math.random()*hh*.35,l:1};if(shoot){shoot.l-=.02;shoot.x+=14;shoot.y+=6;g.globalAlpha=a*Math.max(0,shoot.l);const gr=g.createLinearGradient(shoot.x,shoot.y,shoot.x-120,shoot.y-52);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(255,255,255,0)');g.strokeStyle=gr;g.lineWidth=2;g.beginPath();g.moveTo(shoot.x,shoot.y);g.lineTo(shoot.x-120,shoot.y-52);g.stroke();if(shoot.l<=0)shoot=null}}}
   // evening dim so blossom scenery matches the world's night
   if(e=='blossom'){const n=typeof night=='number'?night:0;if(n>.05){g.globalAlpha=a*n*.3;g.fillStyle='#4a2250';g.fillRect(0,0,w,hh)}}
   // gentle readability veil behind the playfield
   g.globalAlpha=a*.1;g.fillStyle=e=='blossom'?'#7a3a5a':'#000';g.fillRect(0,hh*.55,w,hh*.45);
   g.restore()}}
 const _ds=drawSky;drawSky=function(w,hh,now){const cover=draw(w,hh,now);if(cover<.995)_ds(w,hh,now);if(cover>.004)paint(w,hh,now)};
 return{set,reg,get target(){return target},get names(){return NAMES},LIST,get cached(){return Object.keys(cache).filter(k=>cache[k])},get alpha(){return al},reset(){set('default',{instant:true})}}})();
