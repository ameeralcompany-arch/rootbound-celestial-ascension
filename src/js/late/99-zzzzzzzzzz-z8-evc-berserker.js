// ===== Berserker evolution cinematic: Ashen Warlord. An ash field under a burning mountain; rage that became weather. Fur and black iron, a horned war-helm, war paint, magma in the cracks;
// Cinderfall, a leaping overhead axe slam that splits the ground into magma fissures, a wrench and a stamp make the fissures erupt, and a dragging upward cleave throws a wall of magma across the field. =====
try{(()=>{const F=()=>FILM1,K=MOVIE1.kit,sin=Math.sin,cos=Math.cos,TAU=6.2832,PI=Math.PI;
 const EMB='#ff8a4a',LAVA='#ff5a1a',HOT='#ffd060',PAINT='#c8281a',FUR1='#4a3020',FUR2='#8a6644',INK='#1a0c08';
 const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,ease=k=>{k=cl(k,0,1);return 1-Math.pow(1-k,3)},eo=k=>ease(k);
 const pulse=t=>.78+.22*sin(t*7.3)*sin(t*3.1+1);
 // black iron, cold on top, lit from below by the magma
 const iron=(g,y0,y1)=>{const G=g.createLinearGradient(0,y0,0,y1);G.addColorStop(0,'#8a7c78');G.addColorStop(.3,'#4e4240');G.addColorStop(.75,'#2a2022');G.addColorStop(1,'#b0502a');return G};
 const bone=(g,x0,y0,x1,y1)=>{const G=g.createLinearGradient(x0,y0,x1,y1);G.addColorStop(0,'#5a4a3c');G.addColorStop(.25,'#e8dcc4');G.addColorStop(.7,'#c8b498');G.addColorStop(1,'#2a1a14');return G};
 // a jagged crack as points, made once from a seed
 function jag(R,x0,y0,a,len,n,amp){const p=[[x0,y0]];let x=x0,y=y0;for(let i=1;i<=n;i++){const s=len/n,b=a+(R()-.5)*amp;x+=cos(b)*s;y+=sin(b)*s;p.push([x,y])}return p}
 // a line of magma: a dark groove with a hot core; f draws only the first part
 function magma(g,P,w,a,f,t){const n=Math.max(1,Math.ceil((P.length-1)*(f==null?1:f)));if(a<=0)return;g.save();g.lineJoin='round';g.lineCap='round';const path=()=>{g.beginPath();for(let i=0;i<=n&&i<P.length;i++)g[i?'lineTo':'moveTo'](P[i][0],P[i][1])};
  path();g.strokeStyle='rgba(20,6,4,'+(.9*a)+')';g.lineWidth=w*1.9;g.stroke();g.globalCompositeOperation='lighter';g.globalAlpha=a*.55*pulse(t||0);g.strokeStyle=LAVA;g.lineWidth=w*1.6;g.stroke();g.globalAlpha=a;g.strokeStyle=EMB;g.lineWidth=w*.9;g.stroke();g.strokeStyle=HOT;g.lineWidth=Math.max(1,w*.35);g.stroke();g.restore()}
 // a fur tuft ring: soft points all round
 function fur(g,cx,cy,rx,ry,n,ph,c1,c2,t,wnd){const p=new Path2D();for(let i=0;i<n;i++){const a=i/n*TAU,a2=(i+.5)/n*TAU,a3=(i+1)/n*TAU,fl=sin(t*3+i*1.7+ph)*.05+(wnd||0)*.06,r=1.1+.08*sin(i*2.7+ph);const ix=cx+cos(a)*rx*.84,iy=cy+sin(a)*ry*.84;if(!i)p.moveTo(ix,iy);p.quadraticCurveTo(cx+cos(a2-.12)*rx*1.02,cy+sin(a2-.12)*ry*1.02,cx+cos(a2+fl)*rx*r,cy+sin(a2+fl)*ry*r);p.quadraticCurveTo(cx+cos(a2+.18)*rx*.95,cy+sin(a2+.18)*ry*.95,cx+cos(a3)*rx*.84,cy+sin(a3)*ry*.84)}p.closePath();
  const G=g.createLinearGradient(cx,cy-ry,cx,cy+ry);G.addColorStop(0,c2);G.addColorStop(1,c1);g.fillStyle=G;g.fill(p);g.strokeStyle=INK;g.lineWidth=2.6;g.stroke(p);g.save();g.clip(p);g.strokeStyle='rgba(20,10,6,.4)';g.lineWidth=3;g.beginPath();for(let i=0;i<n;i++){const a=(i+.3)/n*TAU;g.moveTo(cx+cos(a)*rx*.35,cy+sin(a)*ry*.35);g.quadraticCurveTo(cx+cos(a+.2)*rx*.7,cy+sin(a+.2)*ry*.7,cx+cos(a+.1)*rx*.95,cy+sin(a+.1)*ry*.95)}g.stroke();g.restore();return p}
 // a curved spike: base centre, base width, tip offset, bend
 function spike(g,bx,by,w,dx,dy,bend,fill,hot){const L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;g.beginPath();g.moveTo(bx+nx*w/2,by+ny*w/2);g.quadraticCurveTo(bx+dx*.55+nx*(w*.3+bend),by+dy*.55+ny*(w*.3+bend),bx+dx,by+dy);g.quadraticCurveTo(bx+dx*.5+nx*(bend-w*.25),by+dy*.5+ny*(bend-w*.25),bx-nx*w/2,by-ny*w/2);g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=INK;g.lineWidth=2.6;g.stroke();if(hot>0){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=hot;g.fillStyle=EMB;g.beginPath();g.arc(bx+dx*.92,by+dy*.92,w*.18,0,TAU);g.fill();g.restore()}}
 // cracks for the chest, the pauldron and the vambrace, made once
 const R0=K.sr(4242),CH=[jag(R0,0,-270,-2.5,170,6,1.2),jag(R0,0,-270,-.5,160,6,1.2),jag(R0,0,-270,1.6,150,5,1.1),jag(R0,-30,-200,2.4,120,5,1.3),jag(R0,40,-190,.9,110,4,1.2)],PC=[jag(R0,-60,0,-.3,130,5,1.1),jag(R0,30,20,-2.8,90,4,1.1)];
 // the war-helm's growth, shared so the face paint and horns grow together
 function pauldron(g,X,Y,k,s,flip,hot,t){if(k<=0)return;g.save();g.translate(X,Y);g.scale(s*(flip?-1:1)*k,s*k);
  fur(g,10,46,150,70,17,flip?1:0,FUR1,FUR2,t,0);
  // three curved spikes, outward and up
  const sf='#3a302e';spike(g,-70,-28,46,-120,-110,-18,sf,hot);spike(g,-10,-50,52,-60,-170,-14,sf,hot);spike(g,50,-46,40,10,-130,-10,sf,hot);
  // the plate: a hard shell over the fur
  g.beginPath();g.moveTo(-140,34);g.bezierCurveTo(-150,-70,90,-96,140,10);g.lineTo(118,40);g.quadraticCurveTo(0,8,-140,34);g.closePath();g.fillStyle=iron(g,-80,40);g.fill();g.strokeStyle=INK;g.lineWidth=3;g.stroke();
  g.strokeStyle='rgba(255,220,190,.35)';g.lineWidth=4;g.beginPath();g.moveTo(-110,-6);g.bezierCurveTo(-90,-50,30,-70,90,-30);g.stroke();
  g.fillStyle='#c8b8a8';for(let i=0;i<4;i++){g.beginPath();g.arc(-100+i*64,24-Math.abs(i-1.5)*6,7,0,TAU);g.fill()}
  if(hot>0){g.save();g.translate(0,-10);for(const P of PC)magma(g,P,6,hot,1,t);g.restore()}
  g.restore()}
 const dress={
  back(g,J){const k=J.k.p1||0;if(k<=0)return;const e=ease(k),w=J.wnd,t=J.t,A=J.rot(-170,-430),B=J.rot(150,-430),sw=sin(t*1.7)*16+w*120,len=lerp(80,380,e);
   // the war mantle: a heavy pelt behind the shoulders, ragged, ember-singed
   const p=new Path2D();p.moveTo(A[0],A[1]);p.bezierCurveTo(A[0]-50-sw*.3,A[1]+len*.4,A[0]-70-sw*.7,A[1]+len*.8,A[0]-50-sw,A[1]+len);const n=8;for(let i=0;i<n;i++){const u=(i+1)/n,bx=lerp(A[0]-50-sw,B[0]+30-sw*.4,u),by=lerp(A[1]+len,B[1]+len*.8,u);p.quadraticCurveTo(bx-20,by+46+sin(t*3+i)*8,bx,by)}p.bezierCurveTo(B[0]+60-sw*.2,B[1]+len*.5,B[0]+40,B[1]+60,B[0],B[1]);p.quadraticCurveTo(lerp(A[0],B[0],.5),A[1]-90*e,A[0],A[1]);p.closePath();
   const G=g.createLinearGradient(0,A[1]-80,0,A[1]+len+40);G.addColorStop(0,FUR2);G.addColorStop(.5,FUR1);G.addColorStop(1,'#1e120c');g.fillStyle=G;g.fill(p);g.strokeStyle=INK;g.lineWidth=3;g.stroke(p);
   g.save();g.clip(p);g.strokeStyle='rgba(18,8,4,.45)';g.lineWidth=5;g.beginPath();for(let i=0;i<9;i++){const u=i/8,x0=lerp(A[0],B[0],u);g.moveTo(x0,A[1]+20);g.quadraticCurveTo(x0-30-sw*.5,A[1]+len*.5,x0-50-sw*.9+u*60,A[1]+len+20)}g.stroke();
   const h=J.k.p3||0;if(h>0){g.globalCompositeOperation='lighter';g.globalAlpha=h*.8*pulse(t);const G2=g.createLinearGradient(0,A[1]+len-90,0,A[1]+len+50);G2.addColorStop(0,'rgba(255,90,26,0)');G2.addColorStop(1,'rgba(255,140,60,.9)');g.fillStyle=G2;g.fillRect(A[0]-300,A[1]+len-90,800,160)}g.restore()},
  torso(g,J){const k=J.k.p1||0,h=J.k.p3||0,t=J.t;if(k<=0&&h<=0)return;const e=ease(k);
   if(k>0){g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);g.globalAlpha=Math.min(1,k*2);
    // a bandolier from the near shoulder to the far hip, with iron studs
    g.save();g.translate(0,(1-e)*-40);g.beginPath();g.moveTo(-132,-360);g.lineTo(-92,-386);g.lineTo(92,-118);g.lineTo(52,-104);g.closePath();g.fillStyle='#3a2416';g.fill();g.strokeStyle=INK;g.lineWidth=2.6;g.stroke();g.fillStyle='#b8a898';for(let i=0;i<6;i++){const u=(i+.5)/6;g.beginPath();g.arc(lerp(-112,72,u),lerp(-373,-111,u),6,0,TAU);g.fill()}
    // the round iron boss on the chest
    g.beginPath();g.arc(-6,-262,40,0,TAU);g.fillStyle=iron(g,-302,-222);g.fill();g.strokeStyle=INK;g.lineWidth=3;g.stroke();g.strokeStyle='rgba(255,220,190,.4)';g.lineWidth=3;g.beginPath();g.arc(-6,-262,28,3.6,5.2);g.stroke();
    // the war-belt: iron plates and a horned buckle
    g.beginPath();g.moveTo(-84,-160);g.lineTo(86,-160);g.lineTo(84,-100);g.lineTo(-84,-100);g.closePath();g.fillStyle='#2a1a12';g.fill();g.strokeStyle=INK;g.stroke();for(let i=0;i<4;i++){g.fillStyle=iron(g,-158,-102);g.fillRect(-78+i*42,-154,30,48);g.strokeRect(-78+i*42,-154,30,48)}
    g.beginPath();g.moveTo(-36,-166);g.lineTo(40,-166);g.lineTo(30,-92);g.lineTo(2,-80);g.lineTo(-26,-92);g.closePath();g.fillStyle=iron(g,-166,-80);g.fill();g.stroke();for(const s of[-1,1])spike(g,2+s*30,-160,16,s*36,-38,s*-6,'#d8c8b0',0);
    // hide flaps hanging from the belt
    for(let i=0;i<4;i++){const x0=-70+i*46,sw=sin(t*2.4+i)*6+J.wnd*30,L=150+(i%2)*40;g.beginPath();g.moveTo(x0-18,-100);g.lineTo(x0+18,-100);g.quadraticCurveTo(x0+20-sw*.4,-100+L*.6,x0+14-sw,-100+L);g.lineTo(x0-sw,-100+L-22);g.lineTo(x0-16-sw,-100+L);g.quadraticCurveTo(x0-20-sw*.4,-100+L*.6,x0-18,-100);g.closePath();g.fillStyle=i%2?'#4a2c1a':'#5e3a22';g.fill();g.strokeStyle=INK;g.lineWidth=2.4;g.stroke()}
    g.restore();g.restore();
    g.save();pauldron(g,J.FS[0]+16,J.FS[1]+2,e,.6,1,h*pulse(t),t);g.restore();
    // the fur ruff across the shoulders, under the chin
    g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);g.globalAlpha=Math.min(1,k*2);fur(g,-14,-402,150*e+30,48*e+8,19,2,FUR1,'#a07a52',t,J.wnd);g.restore()}
   // the magma wakes in the cracks of the body
   if(h>0){g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);K.glow(g,-6,-262,230,LAVA,.5*h*pulse(t));for(let i=0;i<CH.length;i++)magma(g,CH[i],11,h,cl(h*1.6-i*.12,0,1),t);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=h*pulse(t);g.fillStyle=HOT;g.beginPath();g.arc(-6,-262,17,0,TAU);g.fill();g.restore();g.restore()}},
  front(g,J){const k=J.k.p1||0,h=J.k.p3||0,t=J.t;if(k>0)pauldron(g,J.NS[0]-4,J.NS[1]+2,ease(k),.82,0,h*pulse(t),t);
   if(h>0&&J.nA){// the magma vambrace on the axe arm
    const A=J.nA,a=Math.atan2(A[3]-A[1],A[2]-A[0]),L=Math.hypot(A[2]-A[0],A[3]-A[1]),e=ease(h);g.save();g.translate(A[0],A[1]);g.rotate(a);
    fur(g,L*.18,0,40*e+6,48*e+6,8,3,FUR1,FUR2,t,0);
    g.beginPath();g.moveTo(L*.22,-44*e);g.lineTo(L*.86,-34*e);g.quadraticCurveTo(L*.92,0,L*.86,34*e);g.lineTo(L*.22,44*e);g.quadraticCurveTo(L*.16,0,L*.22,-44*e);g.closePath();g.fillStyle=iron(g,-44,44);g.fill();g.strokeStyle=INK;g.lineWidth=3;g.stroke();
    for(let i=0;i<3;i++)spike(g,L*(.34+i*.2),-38*e,34,-16,-88*e,-7,'#3a302e',h*pulse(t+i));
    const V=[];for(let i=0;i<=6;i++)V.push([L*(.26+i*.095),sin(i*2.1)*14*e]);magma(g,V,8,h,1,t);
    // a line of magma across the knuckles of the axe hand
    magma(g,[[L*.98,-30*e],[L*1.05,-10*e],[L*1.06,10*e],[L*.99,30*e]],7,h,1,t);K.glow(g,L*1.02,0,90,LAVA,.55*h*pulse(t));g.restore()}},
  head(g,J){const k=J.k.p2||0,h=J.k.p3||0;if(k<=0)return;const e=ease(k),sy=sin(J.yaw==null?.26:J.yaw),cy=cos(J.yaw==null?.26:J.yaw),t=J.t,cx=sy*44;g.save();g.globalAlpha=Math.min(1,k*2);
   // war paint: three claw stripes under each eye, and one down the chin
   for(const s of[-1,1]){const th=s*.44+(J.yaw==null?.26:J.yaw),ex=100*sin(th),ew=cos(th);if(ew<.15)continue;g.fillStyle=PAINT;g.globalAlpha=Math.min(1,k*2)*.9;for(let i=0;i<3;i++){const x0=ex+(i-1)*14*ew;g.beginPath();g.moveTo(x0-5*ew,40);g.lineTo(x0+5*ew,40);g.lineTo(x0+1*ew-4,40+38*e-i*4);g.closePath();g.fill()}}
   g.globalAlpha=Math.min(1,k*2);
   // the iron skull cap: a dark dome from the band over the crown, so the war-helm is a helm and not a crown on the hair
   {const top=lerp(-104,-212,e),cap=new Path2D();cap.moveTo(-142,-62);cap.bezierCurveTo(-158,-126,-100,top,cx*.5,top);cap.bezierCurveTo(100+cx*.3,top,160,-128,142,-66);cap.quadraticCurveTo(cx,-112,-142,-62);cap.closePath();
    const G=g.createLinearGradient(0,top,0,-60);G.addColorStop(0,'#6e605c');G.addColorStop(.35,'#3a2e2c');G.addColorStop(1,'#1c1416');g.fillStyle=G;g.fill(cap);g.strokeStyle=INK;g.lineWidth=3;g.stroke(cap);
    g.save();g.clip(cap);g.strokeStyle='rgba(10,4,4,.6)';g.lineWidth=4;for(const u of[-.5,.5]){g.beginPath();g.moveTo(cx*.5+u*150,-70);g.quadraticCurveTo(cx*.5+u*130,top+30,cx*.5+u*40,top+6);g.stroke()}
    g.strokeStyle='#2a2022';g.lineWidth=16;g.beginPath();g.moveTo(cx,-96);g.quadraticCurveTo(cx*.7,top+10,cx*.5,top+2);g.stroke();g.strokeStyle='rgba(255,220,190,.35)';g.lineWidth=3;g.beginPath();g.moveTo(cx-5,-98);g.quadraticCurveTo(cx*.7-5,top+12,cx*.5-4,top+4);g.stroke();
    g.strokeStyle='rgba(255,220,190,.28)';g.lineWidth=5;g.beginPath();g.moveTo(-104,-104);g.bezierCurveTo(-96,top+40,-40,top+14,cx*.2,top+10);g.stroke();
    if(h>0){g.strokeStyle='rgba(255,110,40,'+(.45*h)+')';g.lineWidth=6;g.beginPath();g.moveTo(-140,-72);g.quadraticCurveTo(cx,-124,140,-76);g.stroke()}
    g.fillStyle='#c8b8a8';for(let i=0;i<4;i++){const u=(i+.5)/4;g.beginPath();g.arc(cx*.6+lerp(-30,-6,u),lerp(-104,top+18,u),4.5,0,TAU);g.fill()}g.restore()}
   // the horns: thick, swept out and up, with an iron ring at the root
   for(const s of[-1,1]){const far=s>0,sc=far?cy*.9:1,bx=s*118*sc+cx*.3,by=-80,L=e;g.save();g.translate(bx,by);g.scale(s*sc,1);
    const p=new Path2D();p.moveTo(-6,-26);p.bezierCurveTo(70*L,-40*L,120*L,-60*L,128*L,-170*L);p.bezierCurveTo(130*L,-210*L,112*L,-250*L,96*L,-262*L);p.bezierCurveTo(104*L,-200*L,90*L,-110*L,40*L,-80*L);p.bezierCurveTo(20,-70*L,6,-40,-6,26);p.closePath();g.fillStyle=bone(g,0,0,100*L,-260*L);g.fill(p);g.strokeStyle=INK;g.lineWidth=3;g.stroke(p);
    g.save();g.clip(p);g.strokeStyle='rgba(60,36,24,.5)';g.lineWidth=3;for(let i=1;i<6;i++){const u=i/6;g.beginPath();g.moveTo(lerp(-6,124,u)*L-20,lerp(-30,-170,u)*L-20);g.lineTo(lerp(-6,124,u)*L+30,lerp(-30,-170,u)*L+20);g.stroke()}
    if(h>0)magma(g,[[20,-40],[50*L,-60*L],[86*L,-100*L],[104*L,-160*L],[100*L,-220*L]],5,h,1,t);g.restore();
    g.beginPath();g.moveTo(-14,22);g.lineTo(-10,-30);g.lineTo(34,-40);g.lineTo(40,14);g.closePath();g.fillStyle=iron(g,-40,22);g.fill();g.strokeStyle=INK;g.lineWidth=2.6;g.stroke();g.fillStyle='#c8b8a8';g.beginPath();g.arc(13,-8,5,0,TAU);g.fill();g.restore()}
   // the iron brow band with a row of short spikes and a point over the brow
   const band=new Path2D();band.moveTo(-134,-72);band.quadraticCurveTo(cx,-130,134,-76);band.lineTo(128,-40);band.quadraticCurveTo(cx,-90,-128,-36);band.closePath();
   for(let i=0;i<5;i++){const u=(i+.5)/5,x0=lerp(-108,108,u),y0=lerp(-62,-66,u)-46*(1-Math.pow(2*u-1,2))-8,hh=(i==2?78:i%2?56:44)*e;spike(g,x0+cx*(1-Math.pow(2*u-1,2))*.6,y0,22,-4,-hh,-4,'#3a302e',h*pulse(t+i))}
   g.fillStyle=iron(g,-122,-40);g.fill(band);g.strokeStyle=INK;g.lineWidth=3;g.stroke(band);g.strokeStyle='rgba(255,220,190,.45)';g.lineWidth=3;g.beginPath();g.moveTo(-110,-64);g.quadraticCurveTo(cx,-112,110,-68);g.stroke();
   g.fillStyle='#c8b8a8';for(let i=0;i<6;i++){const u=(i+.5)/6,xx=lerp(-112,112,u),q=1-Math.pow(2*u-1,2);g.beginPath();g.arc(xx+cx*q*.7,lerp(-50,-54,u)-40*q,4.5,0,TAU);g.fill()}
   g.beginPath();g.moveTo(cx-20,-90);g.lineTo(cx+20,-90);g.lineTo(cx,-34);g.closePath();g.fillStyle=iron(g,-90,-34);g.fill();g.strokeStyle=INK;g.stroke();
   g.save();g.globalCompositeOperation='lighter';g.globalAlpha=(.4+h*.6)*pulse(t);g.fillStyle=h>0?HOT:EMB;g.beginPath();g.arc(cx,-74,8,0,TAU);g.fill();g.restore();
   if(h>0){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=h*.5*pulse(t);for(const s of[-1,1]){const th=s*.44+(J.yaw==null?.26:J.yaw),ex=100*sin(th),ew=cos(th);if(ew<.15)continue;g.fillStyle=EMB;for(let i=0;i<3;i++){const x0=ex+(i-1)*14*ew;g.fillRect(x0-2,42,4,30-i*4)}}g.restore()}
   g.restore()}};
 // where a pose puts the hand and the axe head (body units), for effects that follow the weapon
 let PIV=null;const piv=()=>{if(PIV==null){try{PIV=MYTH.prof('berserker').piv||.3}catch(_){PIV=.3}}return PIV};
 function grip(P,len){const py=P.py||0,ln=P.lean==null?.02:P.lean,hx=P.px||0,hy=-830+py,NS=[hx+-128*cos(ln)+372*sin(ln),hy-128*sin(ln)-372*cos(ln)],H=[NS[0]+P.nh[0],NS[1]+P.nh[1]],a=P.wa||0,r=len*(1-piv())*.86;return{H,T:[H[0]+cos(a)*r,H[1]+sin(a)*r]}}
 const WL=1260;
 // the sig fissures, made once: angle, length and shape (y squashed for the ground plane)
 const R1=K.sr(777),FIS=[];for(let i=0;i<11;i++){const a=-PI+i/10*TAU*.98+(R1()-.5)*.3,L=420+R1()*620;FIS.push({a,L,P:jag(R1,0,0,a,L,9,.7).map(p=>[p[0],p[1]*.3])})}
 const SC=[];{const R=K.sr(55);for(let i=0;i<9;i++){const b=i/9*TAU+.2+(R()-.5)*.2;SC.push(jag(R,cos(b)*.3,sin(b)*.3,b,.4+R()*.12,6,.9))}}
 const ROCK=[];{const R=K.sr(91);for(let i=0;i<26;i++){const n=5+(R()*3|0),pts=[];for(let j=0;j<n;j++){const a=j/n*TAU,r=.7+R()*.5;pts.push([cos(a)*r,sin(a)*r])}ROCK.push({pts,vx:(R()-.35)*900,vy:-(500+R()*900),s:14+R()*30,sp:(R()-.5)*12,d:R()*.08})}}
 function rocks(y,X,Y,t,a,sc,vm){vm=vm||1;if(t<0)return;for(const r of ROCK){const u=t-r.d;if(u<0)continue;const px=X+r.vx*u*sc*vm,py=Y+(r.vy*u+1400*u*u)*sc;if(py>Y+40)continue;y.save();y.translate(px,py);y.rotate(r.sp*u);y.scale(r.s*sc,r.s*sc);y.beginPath();r.pts.forEach((p,i)=>y[i?'lineTo':'moveTo'](p[0],p[1]));y.closePath();y.fillStyle='#1e1210';y.globalAlpha=a;y.fill();y.strokeStyle=EMB;y.lineWidth=.12;y.stroke();y.restore()}}
 // a column of erupting magma
 function geyser(y,X,Y,h,w,a,t,i){if(h<=0||a<=0)return;y.save();y.globalCompositeOperation='lighter';y.globalAlpha=a;const G=y.createLinearGradient(0,Y,0,Y-h);G.addColorStop(0,'#fff4d0');G.addColorStop(.25,HOT);G.addColorStop(.6,LAVA);G.addColorStop(1,'rgba(255,90,26,0)');y.fillStyle=G;y.beginPath();y.moveTo(X-w*.5,Y);for(let j=0;j<=6;j++){const u=j/6;y.lineTo(X-w*.5*(1-u*.4)+sin(t*20+j*2+i)*w*.12,Y-h*u)}y.quadraticCurveTo(X,Y-h*1.12,X+w*.3,Y-h);for(let j=6;j>=0;j--){const u=j/6;y.lineTo(X+w*.5*(1-u*.4)+sin(t*17+j*2.4+i)*w*.12,Y-h*u)}y.closePath();y.fill();y.restore()}
 // a lava droplet fan
 function drops(y,seed,t,X,Y,n,v,a){if(t<0||a<=0)return;const R=K.sr(seed);y.save();y.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const b=-PI/2+(R()-.5)*1.6,s=v*(.4+R()*.8),l=.7+R()*.6,u=t/l;if(u>=1){R();continue}const r=4+R()*7,px=X+cos(b)*s*t,py=Y+sin(b)*s*t+1300*t*t;if(py>Y+20)continue;y.globalAlpha=a*(1-u*.6);y.fillStyle=LAVA;y.beginPath();y.arc(px,py,r*1.8,0,TAU);y.fill();y.fillStyle=HOT;y.beginPath();y.arc(px,py,r*.8,0,TAU);y.fill()}y.restore()}
 // falling ash, dark flakes
 function ash(x,seed,t,n,a,vy){const R=K.sr(seed);x.save();x.fillStyle='#2a1c18';for(let i=0;i<n;i++){const px=R()*1920,py0=R()*1080,s=3+R()*6,ph=R()*TAU,y=((py0+t*(vy||60)*(.6+R()*.6))%1180)-60,X=px+sin(t*.8+ph)*40;x.globalAlpha=a*(.4+.6*R());x.save();x.translate(X,y);x.rotate(t*1.4+ph);x.fillRect(-s,-s*.4,s*2,s*.8);x.restore()}x.restore()}
 // rising embers: little hot streaks
 function embers(y,seed,t,X,Y,w,h,n,a){const R=K.sr(seed);y.save();y.globalCompositeOperation='lighter';y.lineCap='round';for(let i=0;i<n;i++){const px=R(),ph=R(),sp=.35+R()*.6,q=(t*sp*.5+ph)%1,x0=X+(px-.5)*w+sin(t*2+i)*30*q,y0=Y-q*h;y.globalAlpha=a*Math.sin(q*PI);y.strokeStyle=i%3?EMB:HOT;y.lineWidth=2+R()*3;y.beginPath();y.moveTo(x0,y0);y.lineTo(x0-sin(t*2+i)*6,y0+14+R()*10);y.stroke()}y.restore()}
 const HDS={yaw:.3,tilt:.05,eye:{open:.85,angry:.95},brow:{angry:1},mouth:{open:.5,smile:-.3}};
 const SLAMP={py:170,lean:.36,nf:[-300,0],ff:[290,0],nh:[330,310],fh:[220,350],wa:.72,hd:HDS};
 const LEAP={nb:-1,py:-20,lean:-.16,nh:[-230,-80],fh:[-170,-110],wa:-2.6,nf:[-90,-110],ff:[120,-60],hd:{yaw:.3,eye:{open:.8,angry:.8},brow:{angry:.9},mouth:{open:.55,smile:-.2}}};
 // the wrench: she leans back and hauls on the buried axe, the front knee comes up; then the foot stamps down on the second blow
 const WRENCH={py:190,lean:-.16,nf:[-320,0],ff:[250,-120],nh:[300,300],fh:[210,330],wa:.62,hd:{yaw:.3,tilt:.08,eye:{open:.7,angry:1,pupil:.7},brow:{angry:1},mouth:{open:.3,smile:-.6}}};
 const STAMP=Object.assign({},WRENCH,{ff:[330,0],py:250,lean:.12,nh:[300,340],fh:[210,370]});
 // the roar: up and back, the axe torn free and held low in front, the head thrown back
 const ROAR={py:60,lean:-.18,nf:[-280,0],ff:[320,0],nh:[230,250],fh:[120,300],wa:.28,hd:{yaw:.34,tilt:-.22,eye:{open:.72,angry:1},brow:{angry:1},mouth:{open:1,smile:-.2}}};
 // the drag: low, the blade trailing on the ground behind her
 // over: the torn-free axe swings up over the shoulder on its way down behind her
 const OVER={py:110,lean:-.1,nf:[-240,0],ff:[280,0],nh:[-150,-40],fh:[-90,-70],wa:-2.8,hd:{yaw:.32,tilt:-.1,eye:{open:.8,angry:1},brow:{angry:1},mouth:{open:.6,smile:-.3}}};
 const LOW={py:200,lean:.32,nf:[-260,0],ff:[290,0],nh:[-240,340],fh:[-150,360],wa:2.72,hd:{yaw:.32,eye:{open:.7,angry:1,pupil:.7},brow:{angry:1},mouth:{open:.2,smile:-.4}}};
 const CLEAVE={py:30,lean:-.18,nf:[-200,0],ff:[250,0],nh:[320,-120],fh:[220,-90],wa:-.85,hd:{yaw:.28,tilt:-.08,eye:{open:.9,angry:.9},brow:{angry:1},mouth:{open:.75,smile:-.1}}};
 EVC1.add('berserker',{
  pal:['#ff8a4a','#3a1408','#ffe0a0'],eye:'#ff7a2a',
  C:{coat:'#3e2a22',dark:'#24160f',trim:'#ff8a4a',inner:'#5a3424',boot:'#2e1e16',glove:'#4a3024',leg:'#2a1c16',scarf:null,coatLen:.5},
  wl:WL,dress,pieces:['shoulders',[0,-1450,1.36],[-20,-1090,.9]],
  // the iris: a ring of flame tongues round the pupil
  glyph(g,cx,cy,rx,ry,k,t){g.globalCompositeOperation='lighter';for(let i=0;i<11;i++){const a=i*TAU/11+t*.3,f=.8+.2*sin(t*9+i*2.3),r0=rx*.42,r1=rx*(.78+.12*f);g.globalAlpha=k*(.55+.4*f);g.fillStyle=i%2?'#ffb060':HOT;g.beginPath();g.moveTo(cx+cos(a-.2)*r0,cy+sin(a-.2)*r0*ry/rx);g.quadraticCurveTo(cx+cos(a+.1)*r1*.8,cy+sin(a+.1)*r1*.8*ry/rx,cx+cos(a+.16)*r1,cy+sin(a+.16)*r1*ry/rx);g.quadraticCurveTo(cx+cos(a+.05)*r0*1.2,cy+sin(a+.05)*r0*1.2*ry/rx,cx+cos(a+.2)*r0,cy+sin(a+.2)*r0*ry/rx);g.closePath();g.fill()}
   g.globalAlpha=k*.7;g.strokeStyle='#fff0c8';g.lineWidth=rx*.05;g.beginPath();g.ellipse(cx,cy,rx*.4,ry*.4,0,0,TAU);g.stroke()},
  sky:[[0,'#0a0505'],[.28,'#1e0c0a'],[.5,'#3e160c'],[.66,'#8a3014'],[.74,'#d8622a'],[.78,'#5a200e'],[1,'#120806']],
  plate(x,R,P){const{W,H,glow}=P;
   // ash clouds, lit from below
   for(let L=0;L<3;L++){for(let i=0;i<16;i++){const X=R()*W*1.1-60,Y=60+L*120+R()*80,rw=160+R()*220,rh=60+R()*50;const G=x.createLinearGradient(0,Y-rh,0,Y+rh);G.addColorStop(0,'#120808');G.addColorStop(.7,L==2?'#4a1c10':'#2a120c');G.addColorStop(1,L==2?'#8a3414':'#4a1c10');x.globalAlpha=.55+L*.12;x.fillStyle=G;x.beginPath();x.ellipse(X,Y,rw,rh,0,0,TAU);x.fill()}}x.globalAlpha=1;
   // the burning mountain, far left, and a smaller one far right
   const mtn=(cx,top,w,base,col,cr,dir)=>{
    // the ash plume, lit from the crater below
    for(let i=0;i<18;i++){const u=i/17,X=cx+dir*(u*u*340+sin(i*1.7)*26),Y=top-20-u*(top-10),r=(50+u*170)*(cr/70);const G=x.createRadialGradient(X,Y+r*.5,r*.1,X,Y,r);G.addColorStop(0,u<.4?'#7a3014':'#3a1810');G.addColorStop(1,'rgba(20,8,6,0)');x.globalAlpha=.9;x.fillStyle=G;x.beginPath();x.arc(X,Y,r,0,TAU);x.fill()}x.globalAlpha=1;
    const cone=new Path2D();cone.moveTo(cx-w,base);cone.quadraticCurveTo(cx-w*.45,base-(base-top)*.35,cx-cr,top+6);cone.lineTo(cx-cr*.4,top+18);cone.lineTo(cx+cr*.3,top+12);cone.lineTo(cx+cr,top);cone.quadraticCurveTo(cx+w*.42,base-(base-top)*.4,cx+w,base);cone.closePath();
    const G=x.createLinearGradient(0,top,0,base);G.addColorStop(0,'#3a180e');G.addColorStop(1,col);x.fillStyle=G;x.fill(cone);
    glow(x,cx,top+10,cr*2.6,'#ff6a20',.8);glow(x,cx,top+8,cr*.9,'#ffd060',.7);
    x.save();x.clip(cone);x.globalCompositeOperation='lighter';x.lineJoin='round';x.lineCap='round';for(let i=0;i<4;i++){const sx=cx+(i-1.5)*cr*.45,tx=cx+(i-1.5)/1.5*w*.7,an=Math.atan2(base-top,tx-sx),d=Math.hypot(tx-sx,base-top)*(.45+R()*.35),p=jag(R,sx,top+12,an,d,10,.35);x.strokeStyle='rgba(255,90,26,.35)';x.lineWidth=7*cr/70;x.beginPath();p.forEach((q,j)=>x[j?'lineTo':'moveTo'](q[0],q[1]));x.stroke();x.strokeStyle='rgba(255,200,90,.75)';x.lineWidth=2*cr/70;x.stroke()}
    const G2=x.createLinearGradient(cx,0,cx+w,0);G2.addColorStop(0,'rgba(255,110,40,0)');G2.addColorStop(1,'rgba(255,110,40,.18)');x.fillStyle=G2;x.fillRect(cx,top,w,base-top);x.restore();
    x.strokeStyle='rgba(255,140,70,.35)';x.lineWidth=2;x.stroke(cone)};
   mtn(330,430,560,800,'#1a0a08',70,-1);mtn(1770,580,300,800,'#1e0c08',38,1);
   // far ridges with a hot rim
   for(const[y0,c,a]of[[690,'#24100a',.5],[740,'#180a08',.35]]){x.fillStyle=c;x.beginPath();x.moveTo(0,H);x.lineTo(0,y0);for(let X=0;X<=W;X+=36)x.lineTo(X,y0-R()*50-30*sin(X*.004+y0));x.lineTo(W,H);x.closePath();x.fill();x.strokeStyle='rgba(255,138,74,'+a+')';x.lineWidth=2;x.stroke()}
   // the lava river across the middle distance
   x.save();const rv=new Path2D();rv.moveTo(-20,800);rv.bezierCurveTo(400,770,700,830,1000,800);rv.bezierCurveTo(1300,772,1600,820,1940,790);rv.lineTo(1940,808);rv.bezierCurveTo(1600,840,1300,792,1000,820);rv.bezierCurveTo(700,850,400,792,-20,822);rv.closePath();x.globalCompositeOperation='lighter';for(let i=0;i<12;i++)glow(x,80+i*160,806,160,'#ff5a1a',.35);x.fillStyle='#ff6a20';x.fill(rv);x.lineWidth=4;x.strokeStyle='#ffd060';x.stroke(rv);x.restore();
   // basalt spires on the flanks
   for(const[X,h,w]of[[120,420,90],[560,260,60],[1290,220,50],[1850,460,100]]){x.fillStyle='#120807';x.beginPath();x.moveTo(X-w,830);x.lineTo(X-w*.6,830-h*.6);x.lineTo(X-w*.2,830-h);x.lineTo(X+w*.15,830-h*.82);x.lineTo(X+w*.5,830-h*.5);x.lineTo(X+w,830);x.closePath();x.fill();x.strokeStyle='rgba(255,120,50,.45)';x.lineWidth=3;x.beginPath();x.moveTo(X+w*.15,830-h*.82);x.lineTo(X+w*.5,830-h*.5);x.lineTo(X+w,830);x.stroke()}
   // the ground: cracked basalt, lit by the river and by its own fissures
   const G2=x.createLinearGradient(0,826,0,H);G2.addColorStop(0,'#4a2416');G2.addColorStop(.25,'#2e1810');G2.addColorStop(1,'#140a08');x.fillStyle=G2;x.fillRect(0,826,W,H-826);
   x.strokeStyle='rgba(10,4,2,.7)';x.lineWidth=3;for(let i=-14;i<=14;i++){const p=jag(R,960+i*70,830,Math.atan2(250,i*200),280,6,.5);x.beginPath();p.forEach((q,j)=>x[j?'lineTo':'moveTo'](q[0],q[1]));x.stroke()}
   for(let i=0;i<8;i++){const y=850+Math.pow(i/7,1.7)*220;const p=jag(R,-20,y,0,W+40,24,.25);x.beginPath();p.forEach((q,j)=>x[j?'lineTo':'moveTo'](q[0],q[1]));x.stroke()}
   x.save();x.globalCompositeOperation='lighter';x.lineJoin='round';for(let i=0;i<9;i++){const sx=R()<.5?R()*600:1320+R()*600,sy=860+R()*200,p=jag(R,sx,sy,(R()-.5)*.6+(R()<.5?0:PI),120+R()*260,7,1).map(q=>[q[0],sy+(q[1]-sy)*.5]);x.strokeStyle='rgba(255,90,26,.4)';x.lineWidth=9;x.beginPath();p.forEach((q,j)=>x[j?'lineTo':'moveTo'](q[0],q[1]));x.stroke();x.strokeStyle='rgba(255,200,90,.8)';x.lineWidth=2.4;x.stroke()}x.restore();
   x.fillStyle='rgba(255,110,40,.12)';x.fillRect(0,826,W,40);
   // rocks and old axe hafts at the edges
   for(let i=0;i<14;i++){const X=R()<.5?R()*520:1400+R()*520,Y=880+R()*180,r=14+R()*34*(Y-800)/200;x.fillStyle='#1a0e0a';x.beginPath();x.ellipse(X,Y,r*1.4,r*.7,0,PI,0);x.fill();x.strokeStyle='rgba(255,130,60,.4)';x.lineWidth=2;x.beginPath();x.ellipse(X,Y,r*1.4,r*.7,0,PI*1.1,PI*1.6);x.stroke()}
   for(const[X,Y,a,s]of[[210,1000,-.35,1],[1700,960,.4,.8],[1560,1040,-.2,1.1]]){x.save();x.translate(X,Y);x.rotate(a);x.scale(s,s);x.fillStyle='#2a1a12';x.fillRect(-6,-230,12,240);x.fillStyle='#3a302e';x.beginPath();x.moveTo(4,-220);x.quadraticCurveTo(70,-240,80,-180);x.quadraticCurveTo(60,-170,4,-176);x.closePath();x.fill();x.strokeStyle='rgba(255,140,70,.5)';x.lineWidth=2;x.stroke();x.restore()}
   // heat haze and a dark top for the title
   const G3=x.createLinearGradient(0,0,0,300);G3.addColorStop(0,'rgba(6,2,2,.6)');G3.addColorStop(1,'rgba(6,2,2,0)');x.fillStyle=G3;x.fillRect(0,0,W,300);
   x.globalCompositeOperation='lighter';for(let i=0;i<90;i++){x.globalAlpha=.3+R()*.6;x.fillStyle=R()<.3?'#ffd060':'#ff7a3a';const X=R()*W,Y=300+R()*700;x.fillRect(X,Y,2+R()*2,2+R()*3)}x.globalAlpha=1;x.globalCompositeOperation='source-over'},
  // the aura: heat. Flames lick up round the legs, the ground cracks and glows, embers rise, ash falls
  aura(y,X,Y,k,t){if(k<=0)return;y.save();y.translate(X,Y);y.scale(1,.3);y.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const a=i/9*TAU+.3,L=(200+(i*71%5)*60)*k;const p=[[0,0]];let px=0,py=0;for(let j=1;j<6;j++){const b=a+sin(i*3+j*1.7)*.5;px+=cos(b)*L/5;py+=sin(b)*L/5;p.push([px,py])}y.globalAlpha=k*.6*pulse(t+i);y.strokeStyle=LAVA;y.lineWidth=14;y.beginPath();p.forEach((q,j)=>y[j?'lineTo':'moveTo'](q[0],q[1]));y.stroke();y.globalAlpha=k*.9;y.strokeStyle=HOT;y.lineWidth=4;y.stroke()}y.restore();
   K.glow(y,X,Y,420*k,'#ff5a1a',.55*k);
   y.save();y.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const s=i%2?1:-1,ox=s*(170+((i*53)%7)*34),f=sin(t*9+i*2.1)*.5+.5,h=(120+((i*37)%5)*66)*k*(.7+.3*f)*(1+Math.abs(ox)/700),w=26+(i%3)*12,x0=X+ox,tx=x0+sin(t*5+i)*w*.8;const G=y.createLinearGradient(0,Y,0,Y-h);G.addColorStop(0,'rgba(255,224,140,.8)');G.addColorStop(.35,'rgba(255,120,40,.5)');G.addColorStop(1,'rgba(255,60,20,0)');y.fillStyle=G;y.beginPath();y.moveTo(x0-w*.5,Y);y.bezierCurveTo(x0-w*1.1,Y-h*.3,tx-w*.3,Y-h*.6,tx,Y-h);y.bezierCurveTo(tx+w*.3,Y-h*.6,x0+w*1.1,Y-h*.3,x0+w*.5,Y);y.closePath();y.fill()}y.restore();
   embers(y,33,t,X,Y,760,620*k+120,40,k);ash(y,34,t,22,.8*k,70)},
  // the floor mark: a war-drum of cracked magma, saw-teeth biting inward, fissures running out
  sigil(y,k,t,R0){const B=y.globalAlpha;y.globalCompositeOperation='lighter';const a=B*Math.min(1,k*1.4),L=y.lineWidth;y.rotate(t*.1);
   y.globalAlpha=a*.35;y.fillStyle=LAVA;y.beginPath();y.arc(0,0,R0*.98,0,TAU);y.arc(0,0,R0*.86,0,TAU,true);y.fill();
   y.globalAlpha=a;y.strokeStyle=EMB;y.lineWidth=10;y.beginPath();y.arc(0,0,R0,0,TAU);y.stroke();y.lineWidth=4;y.strokeStyle=HOT;y.beginPath();y.arc(0,0,R0*.86,0,TAU);y.stroke();
   y.fillStyle=EMB;const n=28;y.beginPath();for(let i=0;i<n;i++){const b=i/n*TAU,b2=(i+.5)/n*TAU,b3=(i+1)/n*TAU;y.moveTo(cos(b)*R0*.86,sin(b)*R0*.86);y.lineTo(cos(b2)*R0*(.72-(i%2)*.06),sin(b2)*R0*(.72-(i%2)*.06));y.lineTo(cos(b3)*R0*.86,sin(b3)*R0*.86)}y.fill();
   y.lineJoin='round';for(let i=0;i<SC.length;i++){const p=SC[i];y.globalAlpha=a*.9;y.beginPath();p.forEach((q,j)=>y[j?'lineTo':'moveTo'](q[0]*R0,q[1]*R0));y.strokeStyle=LAVA;y.lineWidth=12;y.stroke();y.strokeStyle=HOT;y.lineWidth=4;y.stroke()}
   for(let i=0;i<9;i++){const b=i/9*TAU+.55;y.save();y.rotate(b);y.translate(R0*.52,0);y.globalAlpha=a*.85;y.strokeStyle=HOT;y.lineWidth=6;y.beginPath();y.moveTo(-R0*.05,-R0*.06);y.lineTo(R0*.05,0);y.lineTo(-R0*.05,R0*.06);y.stroke();y.restore()}
   y.globalAlpha=a*.7;y.strokeStyle=LAVA;y.lineWidth=6;y.beginPath();y.arc(0,0,R0*.3,0,TAU);y.stroke();y.lineWidth=L},
  pose:{gather:{nh:[150,300],fh:[40,330],wa:1.5,lean:.04},hero:{nh:[150,70],fh:[120,320],wa:-2.55,nf:[-240,0],ff:[260,0],py:70,lean:-.06,hd:{yaw:.26,tilt:-.08,eye:{open:.88,angry:.5},brow:{angry:.55},mouth:{open:.12,smile:.35}}},piece:{nh:[280,300],fh:[200,330],wa:1.85},windup:{nh:[40,240],fh:[-320,70],wa:-2.35,lean:-.12,py:40,nf:[-170,0],ff:[190,0]}},
  spark(x,c,A){const t=c.t;ash(x,7,c.T,40,.9,50);embers(x,8,c.T,960,1100,1900,1100,46,.9);A.glow(x,960,1140,700,'#ff5a1a',.35)},
  piece(x,c,A,i){const t=c.t;embers(x,40+i,c.T,960,1120,1700,1100,34,.8);if(t>.5&&t<.9){const f=1-(t-.5)/.4;A.glow(x,960,1180,800,'#ff6a20',.4*f)}ash(x,50+i,c.T,18,.7,60)},
  windup(x,c,A){const t=c.t,k=A.ez(c.u),s=.95,X=960+60*s,Y=540+1150*s,g=grip(EVC1.SPEC.berserker.pose.windup,WL);A.view(x,c.C,1,y=>{const tx=X+g.T[0]*s,ty=Y+g.T[1]*s;A.glow(y,tx,ty,260+200*k,'#ff5a1a',.6*k);A.glow(y,tx,ty,90,HOT,.7*k);drops(y,5,(t%.4),tx,ty,10,300,.5*k)});const G=x.createLinearGradient(0,1080,0,500);G.addColorStop(0,'rgba(255,90,26,.55)');G.addColorStop(1,'rgba(255,90,26,0)');x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.4+.6*k;x.fillStyle=G;x.fillRect(0,500,1920,580);x.restore();embers(x,70,c.T*1.6,960,1150,1900,1100,50,.9)},
  // at the peak: black spires of rock burst from the ground, fountains of white-hot magma between them
  burst(y,k,t,A){y.save();for(let i=0;i<9;i++){const X=960+(i-4)*230+(i%2)*40,h=(260+(i*97%4)*90)*A.eo(cl(k*1.3-Math.abs(i-4)*.06,0,1)),w=70+(i%3)*30,lean=(i-4)*.06;if(Math.abs(i-4)<1)continue;y.fillStyle='#000';y.beginPath();y.moveTo(X-w,1100);y.lineTo(X-w*.3+lean*h,1100-h);y.lineTo(X+w*.2+lean*h,1100-h*.86);y.lineTo(X+w,1100);y.closePath();y.fill()}
   y.globalCompositeOperation='lighter';for(let i=0;i<8;i++){const X=960+(i-3.5)*240,h=900*k*(.6+(i*37%5)*.1);const G=y.createLinearGradient(0,1100,0,1100-h);G.addColorStop(0,'rgba(255,255,255,.9)');G.addColorStop(1,'rgba(255,240,200,0)');y.fillStyle=G;y.fillRect(X-10,1100-h,20,h)}y.restore();
   y.save();for(let i=0;i<18;i++){const R=K.sr(300+i),px=960+(R()-.5)*1600,v=300+R()*500,ty=k*1.2,py=1080-v*ty+600*ty*ty,s=10+R()*24;if(py>1100)continue;y.fillStyle='#000';y.save();y.translate(px,py);y.rotate(i+k*4);y.fillRect(-s,-s*.6,s*2,s*1.2);y.restore()}y.restore()},
  // Cinderfall: a leap, the axe falls, the ground splits into magma; the cracks erupt; an upward cleave throws a wall of magma
  sig:{hits:[.42,1.18,1.92],draw(x,c,A){const{q}=A,t=c.t,sp=q.sp,H0=.42,H1=1.18,H2=1.92,X0=700,s=.5,rim={rim:[sp.pal[2],1,-8,-3]},LP=F().lerpPose;
   const gS=grip(SLAMP,WL),PX=X0+gS.T[0]*s,PY=1000+Math.min(0,gS.T[1]*s)+6,GX=PX+180;
   // the hero's pose for this moment: leap, slam, wrench and stamp, roar, drag, cleave
   let P,hy=1000,hx=X0;
   if(t<H0){if(t<.33){const u=t/.33;P=LP(LOW,LEAP,A.ez(cl(u*1.6,0,1)));hy=1000-40*Math.sin(u*PI*.55);hx=X0-60+30*u}else{const u=(t-.33)/(H0-.33);P=LP(LEAP,SLAMP,A.ez(u));hy=1000-40*Math.sin(.55*PI)*(1-u*u);hx=X0-30+30*u}}
   else if(t<H1-.14)P=SLAMP;
   else if(t<H1-.03)P=LP(SLAMP,WRENCH,A.ez((t-(H1-.14))/.11));
   else if(t<H1)P=LP(WRENCH,STAMP,((t-(H1-.03))/.03)**2);
   else if(t<H1+.18)P=LP(STAMP,ROAR,A.eo((t-H1)/.18));
   else if(t<1.40)P=ROAR;
   else if(t<1.54)P=LP(ROAR,OVER,A.ez((t-1.40)/.14));
   else if(t<1.68)P=LP(OVER,Object.assign({},LOW,{wa:LOW.wa-TAU}),A.ez((t-1.54)/.14));
   else if(t<H2-.14)P=LOW;
   else if(t<H2)P=LP(LOW,CLEAVE,((t-(H2-.14))/.14)**1.6);
   else P=CLEAVE;
   // the drag carries her forward so the blade scrapes the ground behind her
   const DR=110,dr=u=>DR*A.ez(cl((u-1.6)/(H2-1.6),0,1));if(t>=1.6)hx=X0+dr(t);
   const gT=grip(P,WL),TX=hx+gT.T[0]*s,TY=hy+gT.T[1]*s;
   A.bg(x,c,.3+(t>H0?-.12:0));
   if(t>H0){const f=Math.max(0,1-(t-H0)/1.2);x.save();x.globalCompositeOperation='lighter';const G=x.createLinearGradient(0,1080,0,400);G.addColorStop(0,'rgba(255,90,26,'+(.5*f+.2)+')');G.addColorStop(1,'rgba(255,90,26,0)');x.fillStyle=G;x.fillRect(0,400,1920,680);x.restore()}
   A.view(x,c.C,1,y=>{
    const Z=t<H0?.92-.14*A.ez(cl(t/.3,0,1)):.92,ZY=t<H0?1000:560;y.save();y.translate(960,ZY);y.scale(Z,Z);y.translate(-960,-ZY);
    // the fissures run out from the blow
    if(t>H0){const g=eo((t-H0)/.32),hot=t>H1?1:.75;for(let i=0;i<FIS.length;i++)magma(y,FIS[i].P.map(p=>[PX+p[0],PY+p[1]]),lerp(9,5,i/FIS.length)*(1+.4*(t>H1?1:0)),hot,g,c.T);A.glow(y,PX,PY,420,'#ff5a1a',.8*Math.max(.3,1-(t-H0)));A.painter(y,'ring',PX,PY,1000,(t-H0)/1.0,0,3,7);if(t<H0+.4)A.painter(y,'hit',PX,PY,240,.55+.45*(t-H0)/.4,-.31,3,5)}
    // the fissures erupt
    if(t>H1){for(let i=0;i<FIS.length;i++){const P=FIS[i].P,e=P[P.length-1],m=P[(P.length/2)|0];for(const[j,pt,sc]of[[0,e,1],[1,m,.7]]){const d=(i%3)*.05+j*.08,v=(t-H1-d);if(v<0)continue;const hh=1.6*(380+(i*53%4)*110)*sc*A.eo(v*5)*Math.max(0,1-v*.9),gx=PX+pt[0],gy=PY+pt[1];if(gy<840)continue;geyser(y,gx,gy,hh*(gy-820)/180,1.3*(50+(i%3)*20)*sc*(gy-780)/220,Math.max(0,1-v*.8),c.T,i);drops(y,100+i*3+j,v,gx,gy,8,800*sc,1-v*.6)}}}
    // the second blow: the stamp tears the main crack open beside the axe
    if(t>H1){const v=t-H1;geyser(y,GX,PY+10,860*A.eo(v*5)*Math.max(0,1-v*.8),200*(1-v*.3),Math.max(0,1-v*.75),c.T,7);drops(y,77,v,GX,PY-40,26,1150,Math.max(0,1-v*.6));A.glow(y,GX,PY-220,520,'#ff8a3a',.75*Math.max(0,1-v));
     if(v<.35){const f=1-v/.35;A.glow(y,GX,PY-60,640*(.6+.4*v/.35),'#fff2c8',.9*f);A.glow(y,GX,PY-60,200,'#ffffff',f)}
     if(v<.45)A.painter(y,'hit',GX,PY-40,300,.5+.5*v/.45,.31,3,5)}
    // the wall of magma from the upward cleave: every pillar first, then every shard of black rock in front
    if(t>H2){const v=t-H2,x0=X0+260,n=15;
     // a bright seam runs ahead along the ground, and the magma follows it up in a line of pillars
     const run=A.eo(v/.5),xf=x0+run*1250;magma(y,[[x0-60,1004],[x0+300,1010],[x0+650,1002],[x0+1000,1012],[x0+1300,1004]],8,Math.max(0,1-v/1.4),run,c.T);
     for(let i=0;i<n;i++){const X=x0+i*80+(i%2)*16,u=v-i*.032;if(u<0)continue;const f=Math.max(0,1-u/.95),hh=(760-i*26)*A.eo(u*5)*(.55+.45*f)*(1+.1*sin(i*2.7));geyser(y,X+14,1010,hh,(110-i*3)*(.7+.3*f),f,c.T,i);if(i%3==0)drops(y,400+i,u,X,1000-hh*.6,10,900,f)}
     y.save();y.fillStyle='#140806';y.strokeStyle=EMB;y.lineWidth=2.5;y.lineJoin='round';
     for(let i=0;i<n;i++){const X=x0+i*80+(i%2)*16,u=v-i*.032;if(u<0)continue;const sh=(150+(i*41%5)*30)*A.eo(u*6)*(i%2?1:.8),lw=40+(i%3)*14,ln=(i%2?.18:-.14);y.beginPath();y.moveTo(X-lw,1012);y.lineTo(X-lw*.2+ln*sh,1012-sh);y.lineTo(X+lw*.35+ln*sh,1012-sh*.8);y.lineTo(X+lw,1012);y.closePath();y.fill();y.stroke()}
     y.restore();
     A.glow(y,xf,980,380,'#ffd060',Math.max(0,1-v/1.2));rocks(y,x0+500,1000,v,Math.max(0,1-v/1.6),.9,2.2)}
    // debris from the first blow
    rocks(y,PX,PY,t-H0,1,.8);
    // the drag: the blade bites a line of magma into the ground behind her, throwing sparks
    if(t>1.6&&t<H2+.5){const gL=grip(LOW,WL),sx=X0+gL.T[0]*s,sy=1000+gL.T[1]*s+182,ex=X0+dr(Math.min(t,H2-.08))+gL.T[0]*s,fa=t<H2?1:Math.max(0,1-(t-H2)/.5);
     magma(y,[[sx-160,sy+2],[sx-60,sy-4],[lerp(sx,ex,.5),sy+4],[ex+30,sy]],9,fa*cl((t-1.6)/.06,0,1),1,c.T);
     if(t<H2-.06){A.glow(y,ex+40,sy-10,220,LAVA,.9);A.glow(y,ex+40,sy-6,70,HOT,.9);A.sparks(y,61,(t-1.6)%.2,ex+40,sy-8,26,800,HOT,.25,1400);A.sparks(y,62,(t-1.7)%.2,ex+30,sy-8,18,600,'#ffffff',.2,1400)}}
    if(t<H0){A.speedLines(y,hx,hy-500,23,c.T,'rgba(255,200,150,.8)',.4,30,320);if(t>.33){const u=(t-.33)/(H0-.33);A.crescent(y,hx-40,hy-480,560,-2.4,lerp(-2.4,.9,A.ez(u)),110,'rgba(255,170,90,.9)',.9*u,1)}}
    // the hero
    A.hero(c,y,hx,hy,s,P,{wind:1,act:rim});
    // the cleave's crescent starts where the blade was lying on the ground
    if(t>H2-.12&&t<H2+.3){const cx=X0+DR+40,cy=1000-560,gL=grip(LOW,WL),lx=X0+DR+gL.T[0]*s,ly=1000+gL.T[1]*s,a0=Math.atan2(ly-cy,lx-cx),r=Math.hypot(lx-cx,ly-cy),u=cl((t-H2+.12)/.24,0,1);A.crescent(y,cx,cy,r,a0,lerp(a0,-1.2,A.ez(u)),130,'rgba(255,150,70,.95)',(1-Math.max(0,(t-H2-.1)/.2)),1)}
    y.restore();embers(y,90,c.T,960,1060,1900,900,50,1)});
   ash(x,95,c.T,26,.8,80);
   if(A.lit(t,H0,.07)||A.lit(t,H1,.06)||A.lit(t,H2,.07))A.impact(x);if(t>H2&&t<H2+.25)A.rect(x,'#ffd8a0',.45*(1-(t-H2)/.25));if(t>H1&&t<H1+.18)A.rect(x,'#fff0c8',.3*(1-(t-H1)/.18))}}
 })})()}catch(e){console.error('EVC berserker',e)}
