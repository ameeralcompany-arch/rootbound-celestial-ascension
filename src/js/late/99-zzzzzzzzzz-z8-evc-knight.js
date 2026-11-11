// ===== Knight evolution cinematic: Aurelian Vanguard. Dawn over a broken rampart; light rises in columns; a sword-compass on the stones; steel and a gold crest; a red cape; Dawnbreak, a slam that splits the ground with a running wall of light. =====
try{(()=>{const F=()=>FILM1,sin=Math.sin,cos=Math.cos,TAU=6.2832;
 const GOLD='#ffd86a',STEEL='#e8ecf4',RED='#a8202c';
 // steel with a cold top and a warm dawn bounce from below
 const steel=(g,y0,y1)=>{const G=g.createLinearGradient(0,y0,0,y1);G.addColorStop(0,'#ffffff');G.addColorStop(.35,'#dfe5ef');G.addColorStop(.7,'#9aa6bc');G.addColorStop(1,'#e8c890');return G};
 function plateShape(g,pts,fill,ln){g.beginPath();pts.forEach((p,i)=>g[i?'lineTo':'moveTo'](p[0],p[1]));g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=ln||'#2a3048';g.lineWidth=3;g.stroke()}
 function pauldron(g,X,Y,k,s,flip){if(k<=0)return;g.save();g.translate(X,Y);g.scale(s*(flip?-1:1)*k,s*k);for(let i=2;i>=0;i--){const y=i*46,w=150-i*16;g.beginPath();g.moveTo(-w,y+40);g.bezierCurveTo(-w*1.05,y-70,w*1.05,y-70,w,y+40);g.quadraticCurveTo(0,y+70,-w,y+40);g.closePath();g.fillStyle=steel(g,y-70,y+60);g.fill();g.strokeStyle='#2a3048';g.lineWidth=3;g.stroke();g.strokeStyle=GOLD;g.lineWidth=5;g.beginPath();g.moveTo(-w*.9,y+38);g.quadraticCurveTo(0,y+64,w*.9,y+38);g.stroke()}g.fillStyle=GOLD;g.beginPath();g.arc(0,-6,16,0,TAU);g.fill();g.strokeStyle='#6a5018';g.lineWidth=2;g.stroke();g.restore()}
 const dress={
  back(g,J){const k=J.k.p3||0;if(k<=0)return;const w=J.wnd,t=J.t,A=J.rot(-120,-386),B=J.rot(96,-386),len=lerp0(260,1180,k),sw=sin(t*1.9)*30+w*560,bx=A[0]-120-sw,by=A[1]+len;
   const p=new Path2D();p.moveTo(A[0],A[1]);p.bezierCurveTo(A[0]-80-sw*.2,A[1]+len*.3,bx-60,by-len*.35,bx-90,by);for(let i=0;i<4;i++){const u=(i+1)/4;p.quadraticCurveTo(bx-90+u*120*k-60,by+24+(i%2)*18,bx-90+u*(360*k+60),by-(i%2?10:0))}p.bezierCurveTo(bx+300*k,by-len*.4,B[0]+40-sw*.1,B[1]+len*.3,B[0],B[1]);p.closePath();
   const G=g.createLinearGradient(A[0],A[1],bx,by);G.addColorStop(0,'#c8303c');G.addColorStop(.5,RED);G.addColorStop(1,'#5a0c18');g.fillStyle=G;g.fill(p);g.strokeStyle='#3a0610';g.lineWidth=3;g.stroke(p);
   g.save();g.clip(p);g.strokeStyle='rgba(40,4,12,.45)';g.lineWidth=10;for(let i=0;i<4;i++){g.beginPath();g.moveTo(A[0]+i*40,A[1]+40);g.quadraticCurveTo(bx-40+i*60,by-len*.5,bx-60+i*110*k,by+20);g.stroke()}g.strokeStyle=GOLD;g.lineWidth=16;g.beginPath();g.moveTo(bx-110,by+6);g.lineTo(bx-90+(360*k+60),by+6);g.stroke();g.restore()},
  torso(g,J){const k=J.k.p1||0;if(k<=0)return;const e=ease(k);g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);g.translate(0,(1-e)*-60);g.globalAlpha=Math.min(1,k*2);
   plateShape(g,[[-120,-392],[-60,-410],[60,-410],[108,-392],[96,-250],[74,-150],[24,-104],[-28,-104],[-84,-150],[-108,-250]],steel(g,-410,-100));
   g.save();g.beginPath();g.moveTo(-120,-392);g.lineTo(108,-392);g.lineTo(74,-150);g.lineTo(-84,-150);g.closePath();g.clip();g.fillStyle='rgba(255,255,255,.55)';const gx=-200+(J.t*260%520);g.beginPath();g.moveTo(gx,-420);g.lineTo(gx+40,-420);g.lineTo(gx-40,-90);g.lineTo(gx-80,-90);g.closePath();g.fill();g.restore();
   // the dawn emblem: a rising sun over a line
   g.fillStyle=GOLD;g.strokeStyle='#6a5018';g.lineWidth=2.4;g.beginPath();g.arc(-8,-276,34,Math.PI,0);g.closePath();g.fill();g.stroke();for(let i=0;i<7;i++){const a=Math.PI+(i+.5)/7*Math.PI;g.beginPath();g.moveTo(-8+cos(a)*42,-276+sin(a)*42);g.lineTo(-8+cos(a)*64,-276+sin(a)*64);g.lineWidth=6;g.strokeStyle=GOLD;g.stroke()}g.fillRect(-64,-272,112,8);
   g.strokeStyle=GOLD;g.lineWidth=7;g.beginPath();g.moveTo(-84,-150);g.lineTo(-28,-104);g.lineTo(24,-104);g.lineTo(74,-150);g.stroke();
   g.restore();pauldron(g,J.FS[0]+10,J.FS[1]+10,e,.62,1)},
  front(g,J){const k=J.k.p1||0;if(k<=0)return;pauldron(g,J.NS[0]-6,J.NS[1]+4,ease(k),.78,0)},
  head(g,J){const k=J.k.p2||0;if(k<=0)return;const e=ease(k),sy=sin(J.yaw||.26),w=J.wnd;
   // a gold circlet across the brow, small wings at the temples, a crest of gold plumes swept back
   g.save();g.globalAlpha=Math.min(1,k*2);g.strokeStyle='#6a5018';g.lineWidth=3;g.fillStyle=GOLD;g.beginPath();g.moveTo(-122,-82);g.quadraticCurveTo(sy*40,-128,124,-86);g.lineTo(122,-64);g.quadraticCurveTo(sy*40,-106,-120,-60);g.closePath();g.fill();g.stroke();
   g.fillStyle='#ffffff';g.beginPath();g.moveTo(sy*40-14,-112);g.lineTo(sy*40,-136);g.lineTo(sy*40+14,-112);g.lineTo(sy*40,-92);g.closePath();g.fill();g.stroke();
   for(const s of[-1,1]){const X=s*118+sy*10;for(let i=0;i<3;i++){F().feather(g,X,-74,(s<0?Math.PI+.5:-.5)-i*.28*s+(s<0?-1:1)*0,(70-i*12)*e,15*e,'#fff4c0',GOLD,'#6a5018')}}
   for(let i=0;i<5;i++){const a=Math.PI+.62+i*.13+sin(J.t*2+i)*.03-w*.12;F().feather(g,-30+i*8,-150,a,(250-i*26)*e,34*e,'#fffbe8',GOLD,'#6a5018')}g.restore()}};
 function ease(k){k=Math.max(0,Math.min(1,k));return 1-Math.pow(1-k,3)}function lerp0(a,b,k){return a+(b-a)*k}
 EVC1.add('knight',{
  pal:['#ffd86a','#3a2a60','#fff4d0'],eye:'#ffcf4a',
  C:{coat:'#2c3a6a',dark:'#1c2648',trim:GOLD,inner:STEEL,boot:'#aab4c6',glove:'#c8d0dc',leg:'#28325a',scarf:null,coatLen:.72},
  wl:1120,dress,pieces:['chest','head','back'],
  glyph(g,cx,cy,rx,ry,k,t){g.globalCompositeOperation='lighter';g.fillStyle='#fff2b0';for(let i=0;i<8;i++){const a=i*TAU/8+t*.4,r=rx*.62;g.globalAlpha=k*(.5+.5*sin(t*4+i));g.beginPath();g.moveTo(cx+cos(a)*r,cy+sin(a)*r*ry/rx-ry*.06);g.lineTo(cx+cos(a+.12)*r*1.18,cy+sin(a+.12)*r*1.18*ry/rx);g.lineTo(cx+cos(a)*r*1.3,cy+sin(a)*r*1.3*ry/rx+ry*.06);g.lineTo(cx+cos(a-.12)*r*1.18,cy+sin(a-.12)*r*1.18*ry/rx);g.closePath();g.fill()}},
  sky:[[0,'#141a44'],[.34,'#4a3c7a'],[.6,'#d88a78'],[.74,'#ffcf8a'],[1,'#2a2030']],
  plate(x,R,P){const{W,H,glow}=P;glow(x,1500,700,520,'#ffe2a0',.75);glow(x,1500,700,140,'#ffffff',.9);
   x.fillStyle='rgba(255,236,200,.5)';for(let i=0;i<9;i++){const y=200+R()*360,w=200+R()*400,X=R()*W;x.globalAlpha=.12+R()*.2;x.beginPath();x.ellipse(X,y,w,14+R()*18,0,0,TAU);x.fill()}x.globalAlpha=1;
   // the far towers
   x.fillStyle='#4a3a5e';for(let i=0;i<9;i++){const X=60+i*230+R()*60,w=50+R()*50,h=120+R()*160,y=720;x.fillRect(X,y-h,w,h);for(let j=0;j<3;j++)x.fillRect(X-6+j*(w/2.5+4),y-h-18,w/5,18);x.beginPath();x.moveTo(X-8,y-h);x.lineTo(X+w/2,y-h-50-R()*40);x.lineTo(X+w+8,y-h);x.fill()}
   x.fillStyle='#3a2c4c';x.beginPath();x.moveTo(0,H);x.lineTo(0,730);for(let i=0;i<=W;i+=40)x.lineTo(i,722+sin(i*.01)*10);x.lineTo(W,H);x.fill();
   // the rampart: a broken wall with merlons, and banners
   x.fillStyle='#2a2238';x.fillRect(0,760,W,80);for(let i=0;i<W;i+=96){if(R()<.18)continue;x.fillRect(i,724,58,40)}
   for(const X of[300,1640]){x.fillStyle='#5a4a3a';x.fillRect(X,420,10,350);const G=x.createLinearGradient(X,430,X+120,430);G.addColorStop(0,'#2c3a6a');G.addColorStop(1,'#3a4a80');x.fillStyle=G;x.beginPath();x.moveTo(X+10,430);x.lineTo(X+130,440);x.lineTo(X+120,560);x.lineTo(X+70,530);x.lineTo(X+10,570);x.closePath();x.fill();x.fillStyle='#ffd86a';x.beginPath();x.arc(X+68,480,18,Math.PI,0);x.fill()}
   // the flagstones, in perspective, lit by dawn from the right
   const G2=x.createLinearGradient(0,830,0,H);G2.addColorStop(0,'#6a5468');G2.addColorStop(.3,'#4a3a52');G2.addColorStop(1,'#1e1828');x.fillStyle=G2;x.fillRect(0,830,W,H-830);
   x.strokeStyle='rgba(20,14,28,.6)';x.lineWidth=2;for(let i=0;i<9;i++){const y=830+Math.pow(i/8,1.8)*250;x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke()}for(let i=-12;i<=12;i++){x.beginPath();x.moveTo(960+i*60,830);x.lineTo(960+i*260,H);x.stroke()}
   x.fillStyle='rgba(255,210,150,.16)';x.beginPath();x.moveTo(W,830);x.lineTo(W,H);x.lineTo(900,H);x.closePath();x.fill()},
  aura(y,X,Y,k,t){y.globalCompositeOperation='lighter';const R=EVC1.mixC;for(let i=0;i<12;i++){const s=(i%2?1:-1)*(150+((i*97)%5)*90),h=(500+((i*53)%4)*160)*k*(.85+.15*sin(t*3+i)),w=26+(i%3)*14,x0=X+s+sin(t*.7+i)*14,G=y.createLinearGradient(0,Y,0,Y-h);G.addColorStop(0,'rgba(255,230,150,.75)');G.addColorStop(.6,'rgba(255,216,106,.25)');G.addColorStop(1,'rgba(255,216,106,0)');y.fillStyle=G;y.fillRect(x0-w/2,Y-h,w,h)}
   for(let i=0;i<60;i++){const q=(t*.5+i/60)%1,px=X+sin(i*5.7)*(240+i*4),py=Y-q*700*k;y.globalAlpha=(1-q)*k;y.fillStyle=i%5?'#ffe7a0':'#ffffff';y.fillRect(px,py,3,7)}
   for(let i=0;i<8;i++){const q=(t*.18+i/8)%1,px=X-420+((i*311)%840),py=Y-760*q*k+40;y.globalAlpha=k*Math.sin(q*3.14)*.9;F().feather(y,px+sin(t+i)*40,py,1.2+sin(t*1.5+i)*.6,70,16,'#ffffff','#ffe9a8','rgba(120,90,30,.6)')}},
  sigil(y,k,t,R0){y.globalCompositeOperation='lighter';y.strokeStyle='#ffd86a';y.fillStyle='#ffd86a';const L=y.lineWidth;y.rotate(t*.15);for(const[f,w]of[[1,9],[.84,4],[.62,6],[.3,4]]){y.lineWidth=w;y.globalAlpha=Math.min(1,k*1.4);y.beginPath();y.arc(0,0,R0*f,0,TAU);y.stroke()}
   for(let i=0;i<48;i++){const a=i*TAU/48,l=i%4?.05:.1;y.lineWidth=4;y.beginPath();y.moveTo(cos(a)*R0*(1-l),sin(a)*R0*(1-l));y.lineTo(cos(a)*R0,sin(a)*R0);y.stroke()}
   for(let i=0;i<8;i++){const a=i*TAU/8+.39,c=cos(a),s=sin(a),n=-s,m=c;y.globalAlpha=Math.min(1,k*1.4)*.9;y.beginPath();y.moveTo(c*R0*.36+n*R0*.03,s*R0*.36+m*R0*.03);y.lineTo(c*R0*.8,s*R0*.8);y.lineTo(c*R0*.36-n*R0*.03,s*R0*.36-m*R0*.03);y.closePath();y.fill()}
   y.beginPath();for(let i=0;i<4;i++){const a=i*TAU/4;y[i?'lineTo':'moveTo'](cos(a)*R0*.62,sin(a)*R0*.62)}y.closePath();y.lineWidth=5;y.stroke();y.lineWidth=L},
  pose:{gather:{nh:[150,300],fh:[40,330],wa:1.57,lean:.02},hero:{nh:[300,330],fh:[200,360],wa:1.5,nf:[-120,0],ff:[130,0]},piece:{nh:[150,300],fh:[40,330],wa:1.57},windup:{nh:[-240,330],fh:[-120,380],wa:2.55,lean:.16,py:70,nf:[-220,0],ff:[240,0]}},
  burst(y,k,t,A){y.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const x0=960+(i-4)*190,h=1100*k;const G=y.createLinearGradient(0,1060,0,1060-h);G.addColorStop(0,'rgba(255,255,255,.8)');G.addColorStop(1,'rgba(255,255,255,0)');y.fillStyle=G;y.fillRect(x0-14,1060-h,28,h)}},
  // Dawnbreak: up, down, and a wall of light runs across the ground
  sig:{hits:[.4,1.55],draw(x,c,A){const{q}=A,t=c.t,sp=q.sp,h0=.4,h1=1.55;A.bg(x,c,.25-(t>h0?.15:0));
   A.view(x,c.C,1,y=>{const X0=640;
    if(t>h0){const run=A.eo((t-h0)/1.2),xr=X0+120+run*1500;y.save();y.globalCompositeOperation='lighter';const G=y.createLinearGradient(X0,0,xr,0);G.addColorStop(0,'rgba(255,216,106,0)');G.addColorStop(.85,'rgba(255,230,160,.8)');G.addColorStop(1,'rgba(255,255,255,1)');y.fillStyle=G;y.fillRect(X0,972,xr-X0,52);y.globalAlpha=.5;y.fillRect(X0,900,xr-X0,200);y.restore();A.glow(y,xr,1000,320,'#ffe7a0',.9);A.glow(y,xr,1000,90,'#ffffff',1);
     for(let i=0;i<8;i++){const px=X0+220+i*170,ta=h0+(px-X0-120)/1500*1.2;if(t<ta)continue;const v=(t-ta)/.9;if(v>1)continue;const hgt=1300*A.eo(v*2.4)*(1-v*.2),w=110*(1-v)+20;y.save();y.globalCompositeOperation='lighter';const G2=y.createLinearGradient(0,1000,0,1000-hgt);G2.addColorStop(0,'rgba(255,255,255,'+(1-v)+')');G2.addColorStop(.4,'rgba(255,216,106,'+(.8*(1-v))+')');G2.addColorStop(1,'rgba(255,216,106,0)');y.fillStyle=G2;y.fillRect(px-w/2,1000-hgt,w,hgt);y.restore();A.sparks(y,60+i,t-ta,px,990,16,700,'#ffe7a0',.6,900)}
     A.painter(y,'ring',X0+120,1000,900,(t-h0)/1.3,0,3,7);
     y.strokeStyle='#120c1a';y.lineWidth=7;y.beginPath();y.moveTo(X0+60,1004);for(let i=1;i<14;i++)y.lineTo(X0+60+i*110*run,1004+((i*37)%17-8));y.stroke()}
    if(t>h1){const v=(t-h1)/1.2;A.glow(y,1700,700,900*A.eo(v),'#ffe7a0',.7*(1-v))}
    if(t<h0){const u=A.ez(t/h0);A.hero(c,y,X0,1000-260*sin(u*Math.PI*.9),.5,{nh:[-40,-320],fh:[-100,-280],wa:-1.9+u*.4,lean:-.1,py:-40,nf:[-60,-60],ff:[120,-40],hd:{yaw:.3,eye:{open:.7,angry:.7},brow:{angry:.8},mouth:{open:.3}}},{wind:.9,act:{rim:[sp.pal[2],1,-8,-3]}});A.speedLines(y,X0,600,23,t,'rgba(255,240,200,.9)',.5,40,300)}
    else A.hero(c,y,X0,1000,.5,{py:150,lean:.32,nf:[-280,0],ff:[300,0],nh:[320,520],fh:[180,560],wa:1.42,hd:{yaw:.3,eye:{open:.8,angry:.8},brow:{angry:.9},mouth:{open:.45,smile:-.3}}},{wind:1,act:{rim:[sp.pal[2],1,-8,-3]}})});
   if(A.lit(t,h0,.07)||A.lit(t,h1,.06))A.impact(x);if(t>h1&&t<h1+.25)A.rect(x,'#fff4d0',.5*(1-(t-h1)/.25))}}
 })})()}catch(e){console.error('EVC knight',e)}
