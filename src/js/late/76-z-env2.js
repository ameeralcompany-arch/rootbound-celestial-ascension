// ===== ENV9: five more weather-machine environments for ENV7 (Sakura Sunset / Aurora Night / Neon Rain City / Sunflower Fields / Ocean Sunset) =====
// Same rules as ENV7: everything procedural, every layer is rendered ONCE into an offscreen canvas (built lazily when the machine is
// switched on, released by ENV7 after it has been unused for a while). Per frame only drawImage with parallax / time offsets, a few
// alpha changes and small capped particle sets (no gradients, no shadowBlur, no per-frame canvas allocation). Reduced motion freezes
// the live parts. Each scene registers itself with ENV7.reg(id,{n,build,paint,wx}); music moods live in 94-z-wxmachines.js.
const ENV9=(()=>{
 const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const LW=1600,LH=900,W2=LW*2;
 const lin=(x,y0,y1,st)=>{const g2=x.createLinearGradient(0,y0,0,y1);st.forEach(s=>g2.addColorStop(s[0],s[1]));return g2};
 function blob(x,cx,cy,r,rgb,a){const g2=x.createRadialGradient(cx,cy,0,cx,cy,r);g2.addColorStop(0,'rgba('+rgb+','+a+')');g2.addColorStop(1,'rgba('+rgb+',0)');x.fillStyle=g2;x.fillRect(cx-r,cy-r,r*2,r*2)}
 const wrapX=(w,x,r,f)=>{f(x);if(x-r<0)f(x+w);if(x+r>w)f(x-w)};
 function ridge(x,w,col,base,amp,seed,al,f1,f2){x.fillStyle=col;x.globalAlpha=al==null?1:al;x.beginPath();x.moveTo(0,LH);for(let px=0;px<=w;px+=16){const u=px/w*6.2832,y=base-(Math.abs(Math.sin(u*(f1||2)+seed))*.55+Math.abs(Math.sin(u*(f2||5)+seed*2))*.3+Math.sin(u*11+seed)*.07+.1)*amp;x.lineTo(px,y)}x.lineTo(w,LH);x.closePath();x.fill();x.globalAlpha=1}
 function stars(x,w,h,n,r,cols,rmax){for(let i=0;i<n;i++){x.globalAlpha=.35+r()*.65;x.fillStyle=cols[r()*cols.length|0];const s=.5+r()*(rmax||1.2);x.fillRect(r()*w,r()*h,s,s)}x.globalAlpha=1}
 const red=o=>o.still;
 // shared tiny sprites (built once on first use)
 let SP=null;function sprites(){if(SP)return SP;SP={};
  // soft round glow
  let c=cv(64,64),x=c.getContext('2d');blob(x,32,32,32,'255,255,255',1);SP.glow=c;
  // petal
  c=cv(16,10);x=c.getContext('2d');x.fillStyle='#ffc2d6';x.beginPath();x.ellipse(8,5,7,4,0,0,6.283);x.fill();x.fillStyle='#ffe6ee';x.beginPath();x.ellipse(6,4,3,1.6,0,0,6.283);x.fill();SP.petal=c;
  // shooting-star streak (pointing +x, head at the right)
  c=cv(220,12);x=c.getContext('2d');const sg=x.createLinearGradient(0,0,220,0);sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.85,'rgba(220,240,255,.7)');sg.addColorStop(1,'rgba(255,255,255,1)');x.fillStyle=sg;x.beginPath();x.moveTo(0,6);x.lineTo(214,3.5);x.arc(214,6,2.5,-1.57,1.57);x.lineTo(0,6);x.fill();SP.streak=c;
  // bird (two frames)
  SP.bird=[0,1].map(f=>{const c2=cv(28,14),x2=c2.getContext('2d');x2.strokeStyle='#2a2238';x2.lineWidth=2.2;x2.lineCap='round';x2.beginPath();x2.moveTo(2,f?3:9);x2.quadraticCurveTo(8,f?1:4,14,8);x2.quadraticCurveTo(20,f?1:4,26,f?3:9);x2.stroke();return c2});
  return SP}
 // a pooled particle list (fixed objects, recycled)
 function pool(n,mk){const a=[];for(let i=0;i<n;i++)a.push(mk(i));return a}
 // ================= SAKURA SUNSET =================
 function buildSakura(){const L={};let c=cv(LW,LH),x=c.getContext('2d');
  x.fillStyle=lin(x,0,LH,[[0,'#2a1846'],[.3,'#6b2f72'],[.52,'#e0577a'],[.68,'#ff8f6a'],[.82,'#ffc27a'],[1,'#ffe6a8']]);x.fillRect(0,0,LW,LH);
  blob(x,LW*.5,LH*.42,LH*.75,'255,170,120',.55);blob(x,LW*.5,LH*.42,LH*.32,'255,236,190',.7);
  // the big striped anime sun
  const sc=cv(400,400),sx=sc.getContext('2d');sx.fillStyle=lin(sx,0,400,[[0,'#fff7cf'],[.45,'#ffd27a'],[1,'#ff6b6b']]);sx.beginPath();sx.arc(200,200,196,0,6.283);sx.fill();
  sx.globalCompositeOperation='destination-out';for(let i=0;i<7;i++){const y=214+i*26,hgt=3+i*2.2;sx.fillRect(0,y,400,hgt)}x.drawImage(sc,LW*.5-200,LH*.42-200);
  // long wispy clouds lit from below
  const r=rng(3);for(let i=0;i<11;i++){const cy=LH*(.18+r()*.42),cx=r()*LW,w=220+r()*380;x.fillStyle='rgba(120,50,110,.32)';x.beginPath();x.ellipse(cx,cy,w,7+r()*7,0,0,6.283);x.fill();x.fillStyle='rgba(255,190,170,.38)';x.beginPath();x.ellipse(cx+12,cy+4,w*.8,3+r()*3,0,0,6.283);x.fill()}
  stars(x,LW,LH*.25,70,r,['#fff','#ffe0f0'],1);L.sky=c;
  // far: layered violet mountains with a big peak + a pagoda
  c=cv(W2,LH);x=c.getContext('2d');ridge(x,W2,'#8a3f78',LH*.68,170,1,.55,1,4);ridge(x,W2,'#6a2c66',LH*.72,120,4,.8,2,6);
  x.fillStyle='#4e2050';const px0=W2*.62,py0=LH*.66;for(let t=0;t<4;t++){const w=64-t*11,y=py0-t*28;x.beginPath();x.moveTo(px0-w,y);x.quadraticCurveTo(px0,y-17,px0+w,y);x.lineTo(px0+w-8,y+8);x.lineTo(px0-w+8,y+8);x.closePath();x.fill();x.fillRect(px0-w*.45,y+8,w*.9,20)}x.fillRect(px0-3,py0-134,6,26);
  x.fillStyle=lin(x,LH*.55,LH,[[0,'rgba(255,150,140,0)'],[1,'rgba(255,170,150,.55)']]);x.fillRect(0,LH*.55,W2,LH*.45);L.far=c;
  // mid: dark hill with backlit cherry trees (pink rim light on the sun side)
  c=cv(W2,LH);x=c.getContext('2d');const R=rng(17);x.fillStyle='#34163e';x.beginPath();x.moveTo(0,LH);for(let px=0;px<=W2;px+=20)x.lineTo(px,LH*.8-(Math.sin(px/W2*6.283*3)*.5+.5)*60-(Math.sin(px/W2*6.283*8)*.5+.5)*18);x.lineTo(W2,LH);x.closePath();x.fill();
  for(let i=0;i<8;i++){const tx=(i+.5)*W2/8+(R()-.5)*140,h=130+R()*110,base=LH*.8+8;wrapX(W2,tx,h,xx=>{x.strokeStyle='#2a1030';x.lineCap='round';x.lineWidth=h*.055;x.beginPath();x.moveTo(xx,base);x.quadraticCurveTo(xx+(R()-.5)*24,base-h*.3,xx+(R()-.5)*16,base-h*.55);x.stroke();
    for(let b=0;b<3;b++){x.lineWidth=h*.025;x.beginPath();x.moveTo(xx,base-h*.45);x.quadraticCurveTo(xx+(b-1)*h*.25,base-h*.62,xx+(b-1)*h*.42,base-h*.6-R()*h*.12);x.stroke()}
    const pts=[];for(let k=0;k<70;k++){const a=R()*6.283,d=Math.sqrt(R()),cx=xx+Math.cos(a)*d*h*.5,cy=base-h*.68+Math.sin(a)*d*h*.26,rr=h*(.028+R()*.03);pts.push([cx,cy,rr])}
    x.fillStyle='#3e1842';for(const[cx,cy,rr]of pts){x.beginPath();x.arc(cx,cy,rr,0,6.283);x.fill()}
    for(const[cx,cy,rr]of pts){if(cy>base-h*.7)continue;x.fillStyle=R()<.5?'rgba(255,150,185,.55)':'rgba(255,190,170,.45)';x.beginPath();x.arc(cx,cy-rr*.35,rr*.6,0,6.283);x.fill()}})}
  L.mid=c;
  // drifting thin cloud band (scrolls slowly with time)
  c=cv(W2,LH*.5|0);x=c.getContext('2d');const r2=rng(29);for(let i=0;i<9;i++){const cy=60+r2()*260,cx=r2()*W2,w=260+r2()*420;wrapX(W2,cx,w,xx=>{x.fillStyle='rgba(255,170,190,.22)';x.beginPath();x.ellipse(xx,cy,w,10,0,0,6.283);x.fill();x.fillStyle='rgba(255,230,200,.25)';x.beginPath();x.ellipse(xx,cy+5,w*.7,3,0,0,6.283);x.fill()})}L.cl=c;
  L.pt=pool(46,()=>({x:Math.random(),y:Math.random(),z:.4+Math.random()*.6,p:Math.random()*6}));return L}
 function paintSakura(g,L,o){const{w,hh,t,s,a,ox,oy,tile,gY}=o;g.drawImage(L.sky,ox,oy,LW*s,LH*s);
  if(!red(o)){g.globalAlpha=a*(.25+.1*Math.sin(t*.7));const r=LH*s*.42;g.globalCompositeOperation='lighter';g.drawImage(sprites().glow,ox+LW*s*.5-r,oy+LH*s*.42-r,r*2,r*2);g.globalCompositeOperation='source-over';g.globalAlpha=a}
  tile(L.cl,.01,oy+LH*s*.1,1,red(o)?0:t*9);tile(L.far,.04,gY-LH*.72*s);tile(L.mid,.11,gY-LH*.82*s);
  if(!red(o)){const sp=sprites().petal,dt=Math.min(.05,o.dt||.016);for(const p of L.pt){p.y+=(.03+p.z*.04)*dt;p.x+=(Math.sin(t*.7+p.p)*.02+.03*p.z)*dt;if(p.y>1.05){p.y=-.05;p.x=Math.random()}if(p.x>1.05)p.x-=1.1;
    g.globalAlpha=a*(.5+p.z*.45);const sz=.6+p.z*.9;g.save();g.translate(p.x*w,p.y*hh);g.scale(sz,sz);g.rotate(t*1.1+p.p);g.drawImage(sp,-8,-5);g.restore()}}
  g.globalAlpha=a*.12;g.fillStyle='#3a1438';g.fillRect(0,hh*.55,w,hh*.45)}
 // ================= AURORA NIGHT =================
 function ribbon(seed,hue){const c=cv(W2,520),x=c.getContext('2d'),r=rng(seed);
  // one vertical curtain strip, stretched along a wavy baseline
  const st=cv(4,400),sx=st.getContext('2d');sx.fillStyle=lin(sx,0,400,[[0,'rgba(0,0,0,0)'],[.35,hue[2]],[.72,hue[1]],[.9,hue[0]],[1,'rgba(0,0,0,0)']]);sx.fillRect(0,0,4,400);
  x.globalCompositeOperation='lighter';const f1=1+r()*1.5|0,f2=3+r()*3|0,ph=r()*6;for(let px=0;px<W2;px+=3){const u=px/W2*6.2832,base=330+Math.sin(u*f1+ph)*70+Math.sin(u*f2+ph*2)*26,h=170+Math.sin(u*(f2+1)+ph)*60+r()*40;x.globalAlpha=.42+.4*Math.abs(Math.sin(u*7+ph))+r()*.1;x.drawImage(st,px,base-h,4,h)}
  // bright lower hem
  x.globalAlpha=.5;x.strokeStyle=hue[0];x.lineWidth=3;x.beginPath();for(let px=0;px<=W2;px+=6){const u=px/W2*6.2832,base=330+Math.sin(u*f1+ph)*70+Math.sin(u*f2+ph*2)*26;px?x.lineTo(px,base-8):x.moveTo(px,base-8)}x.stroke()
  x.globalAlpha=1;return c}
 function buildAurora(){const L={};let c=cv(LW,LH),x=c.getContext('2d'),r=rng(41);
  x.fillStyle=lin(x,0,LH,[[0,'#01040f'],[.45,'#04132a'],[.75,'#082d40'],[1,'#0f4a52']]);x.fillRect(0,0,LW,LH);
  blob(x,LW*.3,LH*.85,LH*.6,'40,200,170',.18);blob(x,LW*.8,LH*.8,LH*.5,'120,90,220',.14);
  stars(x,LW,LH*.8,420,r,['#ffffff','#cfe8ff','#d8ffef'],1.4);
  // faint milky band
  x.save();x.translate(LW*.5,LH*.3);x.rotate(-.35);for(let i=0;i<260;i++){x.globalAlpha=.08+r()*.18;x.fillStyle='#e8f4ff';x.fillRect((r()-.5)*LW*1.4,(r()-.5)*(r()*120),1.2,1.2)}x.restore();x.globalAlpha=1;L.sky=c;
  L.rb=[ribbon(7,['rgba(80,255,170,.9)','rgba(70,240,190,.55)','rgba(120,110,255,.18)']),ribbon(13,['rgba(140,255,200,.75)','rgba(60,200,255,.45)','rgba(220,90,255,.2)']),ribbon(21,['rgba(255,120,220,.55)','rgba(110,140,255,.35)','rgba(60,255,200,.12)'])];
  // far: snowy peaks
  c=cv(W2,LH);x=c.getContext('2d');ridge(x,W2,'#1d3552',LH*.7,260,2,1,2,5);
  x.fillStyle='rgba(225,240,255,.85)';const R=rng(5);for(let i=0;i<9;i++){const px=R()*W2,py=LH*.7-150-R()*90,sw=60+R()*50;wrapX(W2,px,sw,xx=>{x.beginPath();x.moveTo(xx,py);x.lineTo(xx+sw*.5,py+sw*.55);x.lineTo(xx+sw*.15,py+sw*.45);x.lineTo(xx,py+sw*.6);x.lineTo(xx-sw*.2,py+sw*.42);x.lineTo(xx-sw*.5,py+sw*.55);x.closePath();x.fill()})}
  ridge(x,W2,'#132640',LH*.76,150,6,1,3,7);x.fillStyle=lin(x,LH*.6,LH,[[0,'rgba(60,200,180,0)'],[1,'rgba(60,200,180,.18)']]);x.fillRect(0,LH*.6,W2,LH*.4);L.far=c;
  // mid: pine forest silhouettes
  c=cv(W2,LH);x=c.getContext('2d');const P=rng(9);x.fillStyle='#061220';x.fillRect(0,LH*.82,W2,LH*.18);
  for(let i=0;i<120;i++){const px=P()*W2,h=60+P()*130,base=LH*.84;wrapX(W2,px,h*.3,xx=>{x.fillStyle=i%3?'#071526':'#0a1c30';x.beginPath();x.moveTo(xx,base-h);for(let k=0;k<5;k++){const yy=base-h+(k+1)*h/5.4,ww=h*(.08+k*.055);x.lineTo(xx+ww,yy);x.lineTo(xx+ww*.4,yy)}x.lineTo(xx+h*.06,base);x.lineTo(xx-h*.06,base);for(let k=4;k>=0;k--){const yy=base-h+(k+1)*h/5.4,ww=h*(.08+k*.055);x.lineTo(xx-ww*.4,yy);x.lineTo(xx-ww,yy)}x.closePath();x.fill();
    x.fillStyle='rgba(200,235,255,.5)';x.fillRect(xx-1,base-h+2,2,h*.12)})}
  L.mid=c;L.tw=pool(14,()=>({x:Math.random(),y:Math.random()*.55,p:Math.random()*6,s:.6+Math.random()*.8}));L.sh=[];L.shT=2;return L}
 function paintAurora(g,L,o){const{w,hh,t,s,a,ox,oy,tile,gY}=o;g.drawImage(L.sky,ox,oy,LW*s,LH*s);const st=red(o);
  g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const al=st?.6:.55+.3*Math.sin(t*(.3+i*.13)+i*2),img=L.rb[i],iw=img.width*s*1.1,ih=img.height*s*(1+(st?0:.07*Math.sin(t*.5+i))),px=(-((st?0:t*(6+i*4))+o.camx*(.015+i*.006))%iw+iw)%iw,y=oy+LH*s*(-.1+i*.06);g.globalAlpha=a*al;for(let x0=px-iw;x0<w;x0+=iw)g.drawImage(img,x0,y,iw,ih)}
  // twinkling bright stars
  if(!st){const gl=sprites().glow;for(const q of L.tw){const k=.5+.5*Math.sin(t*2.2+q.p);g.globalAlpha=a*k*.8;const r=6*q.s*(.6+k*.6);g.drawImage(gl,q.x*w-r,q.y*hh-r,r*2,r*2)}
   // shooting stars: max 2, each a pre-rendered streak sprite
   L.shT-=o.dt||.016;if(L.shT<=0&&L.sh.length<2){L.shT=3+Math.random()*5;L.sh.push({x:Math.random()*w*.7,y:Math.random()*hh*.3,a:.35+Math.random()*.3,l:1})}
   for(let i=L.sh.length-1;i>=0;i--){const q=L.sh[i];q.l-=(o.dt||.016)*1.3;const d=(1-q.l)*w*.45;if(q.l<=0){L.sh.splice(i,1);continue}g.globalAlpha=a*Math.min(1,q.l*2);g.save();g.translate(q.x+Math.cos(q.a)*d,q.y+Math.sin(q.a)*d);g.rotate(q.a);g.drawImage(sprites().streak,-210,-6);g.restore()}}
  g.globalCompositeOperation='source-over';g.globalAlpha=a;tile(L.far,.03,gY-LH*.74*s);tile(L.mid,.1,gY-LH*.84*s);g.globalAlpha=a*.12;g.fillStyle='#020814';g.fillRect(0,hh*.55,w,hh*.45)}
 // ================= NEON RAIN CITY =================
 function towers(x,w,base,n,hmin,hmax,col,win,r,signs){const sg=[];for(let i=0;i<n;i++){const bw=50+r()*110,bx=r()*w,bh=hmin+r()*(hmax-hmin);wrapX(w,bx,bw,xx=>{x.fillStyle=col;x.fillRect(xx,base-bh,bw,bh);
   if(r()<.4){x.fillRect(xx+bw*.4,base-bh-30-r()*30,3,40);x.fillStyle='#ff3a5a';x.fillRect(xx+bw*.4-1,base-bh-62,5,5);x.fillStyle=col}
   for(let wy=base-bh+10;wy<base-8;wy+=13)for(let wx=xx+6;wx<xx+bw-8;wx+=11){if(r()<win){x.fillStyle=r()<.7?'rgba(255,214,140,.85)':r()<.5?'rgba(120,230,255,.8)':'rgba(255,120,200,.8)';x.fillRect(wx,wy,5,7)}}
   if(signs&&r()<.55)sg.push([xx+bw*.15,base-bh*(.3+r()*.5),bw*.7,r()])})}return sg}
 function buildNeon(){const L={};let c=cv(LW,LH),x=c.getContext('2d'),r=rng(61);
  x.fillStyle=lin(x,0,LH,[[0,'#0c0620'],[.4,'#22104a'],[.7,'#5a1a68'],[.88,'#c43a7a'],[1,'#ff7a9a']]);x.fillRect(0,0,LW,LH);
  blob(x,LW*.72,LH*.24,170,'255,220,240',.35);x.fillStyle='rgba(255,236,246,.8)';x.beginPath();x.arc(LW*.72,LH*.24,62,0,6.283);x.fill();
  for(let i=0;i<8;i++)blob(x,r()*LW,LH*(.1+r()*.5),200+r()*200,i%2?'120,60,200':'60,40,140',.25);
  x.strokeStyle='rgba(200,180,255,.12)';x.lineWidth=1;for(let i=0;i<180;i++){const px=r()*LW,py=r()*LH;x.beginPath();x.moveTo(px,py);x.lineTo(px-6,py+28);x.stroke()}L.sky=c;
  c=cv(W2,LH);x=c.getContext('2d');towers(x,W2,LH*.8,46,120,360,'#2a1650',.12,rng(3),false);x.fillStyle=lin(x,LH*.5,LH,[[0,'rgba(255,90,160,0)'],[1,'rgba(255,90,160,.28)']]);x.fillRect(0,LH*.5,W2,LH*.5);L.far=c;
  c=cv(W2,LH);x=c.getContext('2d');const sg=towers(x,W2,LH*.86,30,200,520,'#120a26',.28,rng(7),true);x.fillStyle='#0a0618';x.fillRect(0,LH*.86,W2,LH*.14);L.mid=c;
  // neon signs on their own layer so they can flicker
  c=cv(W2,LH);x=c.getContext('2d');const NC=['#ff4fd8','#4ff3ff','#ffe14f','#ff5a6a','#9a7bff'];x.lineCap='round';x.lineJoin='round';
  for(const[sx,sy,sw,k]of sg){const col=NC[(k*NC.length)|0],hgt=Math.max(18,Math.min(46,sw*.35));x.globalAlpha=.35;blob(x,sx+sw/2,sy,sw*.8,col=='#ff4fd8'?'255,80,216':col=='#4ff3ff'?'80,243,255':col=='#ffe14f'?'255,225,80':col=='#ff5a6a'?'255,90,106':'154,123,255',.45);x.globalAlpha=1;
   x.strokeStyle=col;x.lineWidth=3;x.strokeRect(sx,sy-hgt/2,sw,hgt);x.lineWidth=2.4;const n=Math.max(2,sw/22|0);for(let i=0;i<n;i++){const gx=sx+8+i*(sw-16)/n,gw=(sw-16)/n*.7,m=(k*97+i*13)%4;x.beginPath();if(m==0){x.moveTo(gx,sy-hgt*.25);x.lineTo(gx+gw,sy-hgt*.25);x.moveTo(gx+gw/2,sy-hgt*.3);x.lineTo(gx+gw/2,sy+hgt*.3)}else if(m==1){x.arc(gx+gw/2,sy,Math.min(gw,hgt)*.32,0,6.283)}else if(m==2){x.moveTo(gx,sy+hgt*.25);x.lineTo(gx+gw/2,sy-hgt*.25);x.lineTo(gx+gw,sy+hgt*.25)}else{x.moveTo(gx,sy-hgt*.2);x.lineTo(gx+gw,sy-hgt*.2);x.moveTo(gx,sy+hgt*.15);x.lineTo(gx+gw,sy+hgt*.15)}x.stroke()}
   x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=1;x.strokeRect(sx+1.5,sy-hgt/2+1.5,sw-3,hgt-3)}
  L.sg=c;L.car=pool(3,i=>({x:Math.random(),y:.3+i*.12,v:(i%2?-1:1)*(.02+Math.random()*.02)}));L.fl=1;L.flT=0;return L}
 function paintNeon(g,L,o){const{w,hh,t,s,a,ox,oy,tile,gY}=o;g.drawImage(L.sky,ox,oy,LW*s,LH*s);const st=red(o),dt=o.dt||.016;
  // distant rain behind the city: one path of short streaks
  if(!st){g.globalAlpha=a*.25;g.strokeStyle='#c8b8ff';g.lineWidth=1;g.beginPath();for(let i=0;i<70;i++){const px=((i*137.5+t*30)%w+w)%w,py=((i*71.3+t*520)%(hh*.8));g.moveTo(px,py);g.lineTo(px-4,py+18)}g.stroke()}
  g.globalAlpha=a;tile(L.far,.035,gY-LH*.8*s);
  // little flying-car lights crossing the skyline
  if(!st){for(const q of L.car){q.x+=q.v*dt;if(q.x>1.1)q.x=-.1;if(q.x<-.1)q.x=1.1;g.fillStyle=q.v>0?'#ffe8a0':'#ff6a8a';g.globalAlpha=a*.9;g.fillRect(q.x*w,gY-LH*s*q.y-90*s,4,2)}}
  g.globalAlpha=a;tile(L.mid,.09,gY-LH*.86*s);
  if(!st){L.flT-=dt;if(L.flT<=0){L.flT=.05+Math.random()*.25;L.fl=Math.random()<.08?.25:.8+Math.random()*.2}}else L.fl=.9;
  g.globalAlpha=a*L.fl;g.globalCompositeOperation='lighter';tile(L.sg,.09,gY-LH*.86*s);g.globalCompositeOperation='source-over';g.globalAlpha=a*.14;g.fillStyle='#08040f';g.fillRect(0,hh*.55,w,hh*.45)}
 // ================= SUNFLOWER FIELDS =================
 function cloud(x,cx,cy,w,r){const n=6+r()*4|0,pts=[];for(let i=0;i<n;i++){const u=i/(n-1),px=cx-w/2+u*w,rr=w*(.13+Math.sin(u*Math.PI)*.16)*(.8+r()*.4);pts.push([px,cy-Math.sin(u*Math.PI)*w*.08,rr])}
  x.fillStyle='#b9d6f2';for(const[px,py,rr]of pts){x.beginPath();x.arc(px,py+rr*.28,rr,0,6.283);x.fill()}x.fillStyle='#ffffff';for(const[px,py,rr]of pts){x.beginPath();x.arc(px-rr*.1,py,rr*.92,0,6.283);x.fill()}
  x.fillStyle='rgba(255,255,255,.6)';for(const[px,py,rr]of pts){x.beginPath();x.arc(px-rr*.3,py-rr*.35,rr*.45,0,6.283);x.fill()}}
 function buildSunflower(){const L={};let c=cv(LW,LH),x=c.getContext('2d'),r=rng(81);
  x.fillStyle=lin(x,0,LH,[[0,'#2f7fe0'],[.45,'#6cb8ff'],[.8,'#bfe6ff'],[1,'#f1fbff']]);x.fillRect(0,0,LW,LH);blob(x,LW*.18,LH*.16,LH*.55,'255,250,215',.85);blob(x,LW*.18,LH*.16,90,'255,255,240',1);L.sky=c;
  c=cv(W2,LH*.6|0);x=c.getContext('2d');for(let i=0;i<7;i++){const cx=(i+.5)*W2/7+(r()-.5)*160,cy=90+r()*260,cw=220+r()*260;wrapX(W2,cx,cw,xx=>cloud(x,xx,cy,cw,rng(i*7+3)))}L.cl=c;
  // far: soft blue-green hills + a windmill tower
  c=cv(W2,LH);x=c.getContext('2d');ridge(x,W2,'#8fc6c9',LH*.7,120,3,.9,1,3);ridge(x,W2,'#78b48a',LH*.75,90,7,1,2,5);
  x.fillStyle='#e8e0d0';x.beginPath();x.moveTo(W2*.3-18,LH*.7);x.lineTo(W2*.3-10,LH*.7-120);x.lineTo(W2*.3+10,LH*.7-120);x.lineTo(W2*.3+18,LH*.7);x.closePath();x.fill();x.fillStyle='#b05a3a';x.beginPath();x.moveTo(W2*.3-16,LH*.7-118);x.lineTo(W2*.3,LH*.7-140);x.lineTo(W2*.3+16,LH*.7-118);x.fill();L.far=c;L.mill=[W2*.3,LH*.7-128];
  // mid: green hill covered in sunflowers (big in front, tiny on the ridge)
  c=cv(W2,LH);x=c.getContext('2d');const R=rng(91);x.fillStyle='#5fa548';x.beginPath();x.moveTo(0,LH);for(let px=0;px<=W2;px+=20)x.lineTo(px,LH*.7-(Math.sin(px/W2*6.283*2)*.5+.5)*50-(Math.sin(px/W2*6.283*7)*.5+.5)*14);x.lineTo(W2,LH);x.closePath();x.fill();
  const fl=[];for(let i=0;i<520;i++){const d=Math.pow(R(),1.6),y=LH*.72+d*LH*.22,px=R()*W2;fl.push([px,y,3+d*16])}fl.sort((p,q)=>p[1]-q[1]);
  for(const[px,y,sz]of fl)wrapX(W2,px,sz*2,xx=>{x.strokeStyle='#3e7f34';x.lineWidth=Math.max(1,sz*.18);x.beginPath();x.moveTo(xx,y);x.lineTo(xx,y+sz*2.2);x.stroke();
   if(sz>7){x.fillStyle='#4f9a3e';x.beginPath();x.ellipse(xx+sz*.5,y+sz*1.2,sz*.55,sz*.22,.5,0,6.283);x.fill()}
   x.fillStyle='#ffc61a';for(let k=0;k<10;k++){const an=k/10*6.283;x.beginPath();x.ellipse(xx+Math.cos(an)*sz*.72,y+Math.sin(an)*sz*.72,sz*.42,sz*.18,an,0,6.283);x.fill()}
   x.fillStyle='#ffe066';x.beginPath();x.arc(xx-sz*.12,y-sz*.12,sz*.62,0,6.283);x.globalAlpha=.25;x.fill();x.globalAlpha=1;x.fillStyle='#6a3a1a';x.beginPath();x.arc(xx,y,sz*.42,0,6.283);x.fill()});
  L.mid=c;
  const bl=cv(120,120),bx=bl.getContext('2d');bx.translate(60,60);bx.fillStyle='#f4ecdc';bx.strokeStyle='#8a6a4a';bx.lineWidth=2;for(let i=0;i<4;i++){bx.rotate(Math.PI/2);bx.beginPath();bx.moveTo(-3,0);bx.lineTo(-6,-56);bx.lineTo(8,-56);bx.lineTo(3,0);bx.closePath();bx.fill();bx.stroke()}bx.fillStyle='#8a6a4a';bx.beginPath();bx.arc(0,0,6,0,6.283);bx.fill();L.bl=bl;
  L.bd=pool(5,i=>({x:Math.random(),y:.12+Math.random()*.2,v:.015+Math.random()*.02,p:Math.random()*6}));L.po=pool(18,()=>({x:Math.random(),y:.4+Math.random()*.5,p:Math.random()*6}));return L}
 function paintSunflower(g,L,o){const{w,hh,t,s,a,ox,oy,tile,gY}=o;const st=red(o),dt=o.dt||.016;g.drawImage(L.sky,ox,oy,LW*s,LH*s);tile(L.cl,.008,oy,1,st?0:t*6);
  const fy=gY-LH*.76*s;tile(L.far,.035,fy);
  // windmill blades turn (one rotated sprite per visible copy)
  {const iw=W2*s,px=(-(o.camx*.035)%iw+iw)%iw;for(let x0=px-iw;x0<w;x0+=iw){const mx=x0+L.mill[0]*s,my=fy+L.mill[1]*s;if(mx<-80||mx>w+80)continue;g.save();g.translate(mx,my);g.rotate(st?.3:t*.6);g.drawImage(L.bl,-60*s,-60*s,120*s,120*s);g.restore()}}
  tile(L.mid,.1,gY-LH*.8*s);
  if(!st){const B=sprites().bird;for(const q of L.bd){q.x+=q.v*dt;if(q.x>1.1){q.x=-.1;q.y=.1+Math.random()*.22}g.globalAlpha=a*.85;g.drawImage(B[(Math.sin(t*9+q.p)>0)|0],q.x*w,q.y*hh+Math.sin(t*1.3+q.p)*6,22,11)}
   g.fillStyle='#fff6b0';for(const q of L.po){q.x+=(.012+Math.sin(t+q.p)*.006)*dt;q.y+=Math.sin(t*.8+q.p)*.0004;if(q.x>1.02)q.x=-.02;g.globalAlpha=a*(.35+.35*Math.sin(t*2+q.p));g.fillRect(q.x*w,q.y*hh,2.5,2.5)}}
  g.globalAlpha=a*.08;g.fillStyle='#204020';g.fillRect(0,hh*.55,w,hh*.45)}
 // ================= OCEAN SUNSET =================
 function wave(seed,col,hi,amp,len){const c=cv(W2,80),x=c.getContext('2d'),r=rng(seed);x.fillStyle=col;x.beginPath();x.moveTo(0,80);for(let px=0;px<=W2;px+=8){const u=px/W2*6.2832;x.lineTo(px,30+Math.sin(u*len)*amp+Math.sin(u*len*2.3+seed)*amp*.4)}x.lineTo(W2,80);x.closePath();x.fill();
  x.strokeStyle=hi;x.lineWidth=2;for(let i=0;i<70;i++){const px=r()*W2,u=px/W2*6.2832,py=30+Math.sin(u*len)*amp+Math.sin(u*len*2.3+seed)*amp*.4+2;x.globalAlpha=.4+r()*.5;x.beginPath();x.moveTo(px,py);x.lineTo(px+10+r()*26,py);x.stroke()}x.globalAlpha=1;return c}
 function buildOcean(){const L={};let c=cv(LW,LH),x=c.getContext('2d'),r=rng(101);
  x.fillStyle=lin(x,0,LH,[[0,'#1a2366'],[.35,'#5a3c8c'],[.58,'#d7607a'],[.74,'#ff9a62'],[.86,'#ffd27e'],[1,'#fff0c0']]);x.fillRect(0,0,LW,LH);
  blob(x,LW*.42,LH*.82,LH*.7,'255,170,110',.5);blob(x,LW*.42,LH*.82,LH*.25,'255,240,200',.85);
  for(let i=0;i<12;i++){const cy=LH*(.12+r()*.55),cx=r()*LW,w=200+r()*360;x.fillStyle='rgba(70,40,110,.35)';x.beginPath();x.ellipse(cx,cy,w,9+r()*8,0,0,6.283);x.fill();x.fillStyle='rgba(255,160,130,.45)';x.beginPath();x.ellipse(cx+8,cy+6,w*.75,3+r()*3,0,0,6.283);x.fill()}
  stars(x,LW,LH*.3,60,r,['#fff','#e8e0ff'],1);L.sky=c;
  // far: the sea band with a half-set sun, the glitter path and a cliff + lighthouse
  c=cv(W2,LH);x=c.getContext('2d');const hz=LH*.6;
  for(const sx of[LW*.42,LW*1.42]){x.fillStyle=lin(x,hz-150,hz,[[0,'#fff6cf'],[1,'#ff8a5a']]);x.beginPath();x.arc(sx,hz,150,Math.PI,0);x.fill()}
  x.fillStyle=lin(x,hz,LH,[[0,'#ff9a72'],[.15,'#8a4a8a'],[.6,'#2c2a6a'],[1,'#141a44']]);x.fillRect(0,hz,W2,LH-hz);
  for(const sx of[LW*.42,LW*1.42])for(let i=0;i<120;i++){const d=r(),py=hz+4+d*d*(LH-hz-10),wd=(14+r()*50)*(1-d*.5),px=sx+(r()-.5)*(60+d*360);x.fillStyle='rgba(255,220,160,'+(.5-d*.35)+')';x.fillRect(px-wd/2,py,wd,1.5+d*2)}
  x.fillStyle='#2a1838';x.beginPath();x.moveTo(W2*.8,LH);x.lineTo(W2*.8,hz-30);x.quadraticCurveTo(W2*.84,hz-110,W2*.9,hz-120);x.lineTo(W2*.97,hz-60);x.lineTo(W2,hz-40);x.lineTo(W2,LH);x.closePath();x.fill();
  x.fillStyle='#3a2448';x.fillRect(W2*.885,hz-210,22,92);x.fillStyle='#ffe8a0';x.fillRect(W2*.885+4,hz-226,14,16);x.fillStyle='#2a1838';x.beginPath();x.moveTo(W2*.885-4,hz-226);x.lineTo(W2*.885+11,hz-242);x.lineTo(W2*.885+26,hz-226);x.fill();
  L.far=c;L.hz=hz;L.lh=[W2*.885+11,hz-218];
  L.wv=[wave(3,'rgba(60,50,120,.9)','rgba(255,190,150,.8)',5,14),wave(9,'rgba(40,36,96,.95)','rgba(255,170,140,.7)',7,10),wave(15,'rgba(26,26,70,1)','rgba(255,150,130,.6)',9,7)];
  L.gl=pool(16,()=>({x:(Math.random()-.5),y:Math.random(),p:Math.random()*6}));L.gu=pool(3,()=>({x:Math.random(),y:.15+Math.random()*.2,v:.012+Math.random()*.012,p:Math.random()*6}));return L}
 function paintOcean(g,L,o){const{w,hh,t,s,a,ox,oy,tile,gY}=o;const st=red(o),dt=o.dt||.016;g.drawImage(L.sky,ox,oy,LW*s,LH*s);
  const fy=gY-LH*.82*s;tile(L.far,.03,fy);
  // lighthouse beam pulse
  if(!st){const iw=W2*s,px=(-(o.camx*.03)%iw+iw)%iw,k=.5+.5*Math.sin(t*1.6);g.globalCompositeOperation='lighter';g.globalAlpha=a*k*.7;const r=70*s;for(let x0=px-iw;x0<w;x0+=iw){const lx=x0+L.lh[0]*s,ly=fy+L.lh[1]*s;if(lx>-r&&lx<w+r)g.drawImage(sprites().glow,lx-r,ly-r,r*2,r*2)}g.globalCompositeOperation='source-over'}
  // three wave bands scroll at different speeds (cheap animated sea)
  for(let i=0;i<3;i++){const y=fy+(L.hz+20+i*48)*s+(st?0:Math.sin(t*(.8+i*.3)+i)*2*s);g.globalAlpha=a;tile(L.wv[i],.03+i*.012,y,1,st?0:t*(10+i*9)*(i%2?-1:1))}
  if(!st){g.globalCompositeOperation='lighter';g.fillStyle='#fff0c8';for(const q of L.gl){const iw=W2*s,px=((LW*.42*s-(o.camx*.03))%iw+iw)%iw,yy=fy+(L.hz+10+q.y*q.y*220)*s,xx=px+q.x*(80+q.y*320)*s,k=Math.max(0,Math.sin(t*3+q.p));if(k<.4)continue;g.globalAlpha=a*k*.8;g.fillRect(xx,yy,(6+q.y*10)*s,1.5*s)}g.globalCompositeOperation='source-over';
   const B=sprites().bird;for(const q of L.gu){q.x+=q.v*dt;if(q.x>1.1){q.x=-.1;q.y=.12+Math.random()*.2}g.globalAlpha=a*.8;g.drawImage(B[(Math.sin(t*7+q.p)>0)|0],q.x*w,q.y*hh+Math.sin(t+q.p)*8,24,12)}}
  g.globalAlpha=a*.12;g.fillStyle='#140c28';g.fillRect(0,hh*.55,w,hh*.45)}
 // ---- registration (ENV7 builds lazily and frees unused scenes)
 const DEF={sakura:{n:'Sakura Sunset',build:buildSakura,paint:paintSakura},aurora:{n:'Aurora Night',build:buildAurora,paint:paintAurora},neon:{n:'Neon Rain City',build:buildNeon,paint:paintNeon,wx:'rain'},
  sunflower:{n:'Sunflower Fields',build:buildSunflower,paint:paintSunflower},ocean:{n:'Ocean Sunset',build:buildOcean,paint:paintOcean}};
 const wrap=f=>{let lt=0;return(g,L,o)=>{const now=performance.now()/1000;o.dt=Math.min(.05,lt?now-lt:.016);lt=now;o.camx=typeof cam!='undefined'?cam.x:0;f(g,L,o)}};
 for(const id in DEF){const d=DEF[id];ENV7.reg(id,{n:d.n,build:d.build,paint:wrap(d.paint),wx:d.wx})}
 return{IDS:Object.keys(DEF),DEF}})();
