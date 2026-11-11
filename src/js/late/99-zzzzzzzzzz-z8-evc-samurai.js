// ===== Samurai evolution cinematic: Hanakage Ronin. A cherry road at dusk; petals ride the wind; a blossom on the ground and in the eyes; dark shoulder guards and a pale obi, a gold horn crest on a dark headband, a plum haori printed with petals.
// Hanakage Iai: one draw too fast to see, the world holds still, the blade goes home, and on the click every petal on screen falls in two. =====
try{(()=>{const F=()=>FILM1,sin=Math.sin,cos=Math.cos,TAU=6.2832,PI=Math.PI;
 const PINK='#ff9ac0',ROSE='#d8487a',SASH='#f6e8ef',PLUM='#3a1630',LAC='#2a0c22',GOLD='#ffd86a',GOLDD='#7a4e14',INK='#1a0814';
 const WL=1150,SA=2.45,cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,ease=k=>{k=cl(k,0,1);return 1-Math.pow(1-k,3)};
 const piv=()=>{try{return MYTH.prof('samurai').piv}catch(_){return .16}};
 const SR=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 // ---------- a cherry petal: notched tip, lying along +x; half -1/+1 is one side of its long axis (a petal cut in two)
 function petalPath(g,L,W,half){g.beginPath();if(half<=0){g.moveTo(0,0);g.quadraticCurveTo(L*.3,-W*.95,L*.78,-W*.62);g.quadraticCurveTo(L*.98,-W*.5,L,-W*.2);g.lineTo(L*.84,0);if(half<0){g.closePath();return}}else{g.moveTo(0,0);g.lineTo(L*.84,0)}
  g.lineTo(L,W*.2);g.quadraticCurveTo(L*.98,W*.5,L*.78,W*.62);g.quadraticCurveTo(L*.3,W*.95,0,0);g.closePath()}
 function petal(g,x,y,L,a,col,half,sep){g.save();g.translate(x,y);g.rotate(a);if(half)g.translate(0,half*(sep||0));g.translate(-L*.45,0);petalPath(g,L,L*.52,half||0);g.fillStyle=col;g.fill();g.restore()}
 function blossom(g,x,y,r,a,c1,c2,ln){g.save();g.translate(x,y);g.rotate(a);g.fillStyle=c1;for(let i=0;i<5;i++){g.save();g.rotate(i*TAU/5);petalPath(g,r,r*.66,0);g.fill();if(ln){g.strokeStyle=ln;g.lineWidth=r*.06;g.stroke()}g.restore()}g.fillStyle=c2;g.beginPath();g.arc(0,0,r*.2,0,TAU);g.fill();g.restore()}
 // ---------- the scabbard, in the blade's own space (so it fits the Mythic exactly when the blade is home)
 function saya(g,H,wa,J){g.save();g.translate(H[0],H[1]);g.rotate(wa);g.translate(-WL*piv(),0);const s=WL/100;g.scale(s,s);g.lineJoin='round';g.lineCap='round';
  const p=new Path2D();p.moveTo(1.2,-3.8);p.quadraticCurveTo(56,-11,110,-13.9);p.quadraticCurveTo(115.5,-9.5,110,-4.8);p.quadraticCurveTo(56,3.8,1.2,3.8);p.closePath();
  const G=g.createLinearGradient(0,-13,0,6);G.addColorStop(0,'#7a3462');G.addColorStop(.3,'#3e1232');G.addColorStop(.7,LAC);G.addColorStop(1,'#10030c');g.fillStyle=G;g.fill(p);g.strokeStyle=INK;g.lineWidth=.26;g.stroke(p);
  g.strokeStyle='rgba(255,210,232,.6)';g.lineWidth=.7;g.beginPath();g.moveTo(9,-3.4);g.quadraticCurveTo(56,-9.4,100,-11.9);g.stroke();
  for(let i=0;i<5;i++){const x=26+i*17;petal(g,x,-1.6-x*.07,3.6,.5+i*1.1,i%2?PINK:'#ffd0e2')}
  g.fillStyle=GOLD;g.beginPath();g.moveTo(1.2,-4);g.lineTo(5.4,-4.6);g.lineTo(5.4,4.2);g.lineTo(1.2,4);g.closePath();g.fill();g.strokeStyle=GOLDD;g.lineWidth=.3;g.stroke();
  g.beginPath();g.moveTo(104,-13.6);g.quadraticCurveTo(116,-9.5,107,-4.9);g.lineTo(103,-5.4);g.quadraticCurveTo(109,-9.5,104,-13.6);g.closePath();g.fill();g.stroke();
  // the cord, looped from the knob
  const w=J?sin(J.t*2.4)*1.6+J.wnd*5:0;g.fillStyle=LAC;g.fillRect(15,2.2,5,2.4);g.strokeStyle=PINK;g.lineWidth=1.3;g.beginPath();g.moveTo(17.5,4.4);g.bezierCurveTo(14-w,16,30-w*1.4,19,34-w,10);g.stroke();g.strokeStyle=ROSE;g.lineWidth=.6;g.stroke();
  g.restore()}
 // ---------- the shoulder guard: five lacquered lames laced in pink, hung from the shoulder and swinging with the upper arm
 function sode(g,S,arm,e,sc){if(e<=0)return;let d=Math.atan2(arm[1]-S[1],arm[0]-S[0])-PI/2;while(d>PI)d-=TAU;while(d<-PI)d+=TAU;g.save();g.translate(S[0],S[1]-16);g.rotate(d*.72);g.scale(sc*(.4+.6*e),sc*e);g.lineJoin='round';
  const n=5,hh=226,w0=94,w1=116;
  for(let i=n-1;i>=0;i--){const y0=i*hh/n-4,y1=(i+1)*hh/n+4,wa=lerp(w0,w1,i/n),wb=lerp(w0,w1,(i+1)/n);
   g.beginPath();g.moveTo(-wa,y0);g.quadraticCurveTo(0,y0+12,wa,y0);g.lineTo(wb,y1);g.quadraticCurveTo(0,y1+16,-wb,y1);g.closePath();const G=g.createLinearGradient(0,y0,0,y1);G.addColorStop(0,'#6a2856');G.addColorStop(.5,'#3c1234');G.addColorStop(1,'#1e0618');g.fillStyle=G;g.fill();g.strokeStyle=INK;g.lineWidth=2.6;g.stroke();
   g.strokeStyle='rgba(255,196,224,.42)';g.lineWidth=3;g.beginPath();g.moveTo(-wa+10,y0+6);g.quadraticCurveTo(0,y0+17,wa-10,y0+6);g.stroke();
   g.strokeStyle=PINK;g.lineWidth=7;g.beginPath();for(let j=0;j<6;j++){const x=lerp(-wa+18,wa-18,j/5);g.moveTo(x,y0+12+Math.abs(x)*.01);g.lineTo(x*1.02,y1-8)}g.stroke();
   if(i==n-1){g.strokeStyle=GOLD;g.lineWidth=6;g.beginPath();g.moveTo(-wb+4,y1-2);g.quadraticCurveTo(0,y1+14,wb-4,y1-2);g.stroke()}}
  g.beginPath();g.moveTo(-w0-10,-2);g.quadraticCurveTo(0,-42,w0+10,-2);g.lineTo(w0+4,14);g.quadraticCurveTo(0,-22,-w0-4,14);g.closePath();g.fillStyle='#24081c';g.fill();g.strokeStyle=GOLD;g.lineWidth=4;g.stroke();
  g.restore()}
 const nrm=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],D=Math.hypot(dx,dy)||1;return[-dy/D,dx/D]};
 // ---------- the haori's wide sleeve on the near arm
 function sleeve(g,J,k){const e=ease(k),S=J.NS,A=J.nA,E=[A[0],A[1]],Hn=[A[2],A[3]],Fp=[lerp(E[0],Hn[0],.58),lerp(E[1],Hn[1],.58)],t=J.t,sw=sin(t*2.3)*14+J.wnd*130;
  const n1=nrm(S,E),n2=nrm(E,Fp),na=[(n1[0]+n2[0])/2,(n1[1]+n2[1])/2],lo=Math.max(Fp[1],E[1]),M=[lerp(S[0],E[0],.45),lerp(S[1],E[1],.45)];
  const B1=[Fp[0]-sw*.5,lo+lerp(40,230,e)],B2=[M[0]-sw-40,Math.max(lo,M[1])+lerp(60,290,e)];
  const bag=new Path2D();bag.moveTo(Fp[0],Fp[1]);bag.quadraticCurveTo(Fp[0]+20-sw*.2,(Fp[1]+B1[1])/2,B1[0],B1[1]);bag.quadraticCurveTo((B1[0]+B2[0])/2,Math.max(B1[1],B2[1])+30,B2[0],B2[1]);bag.quadraticCurveTo(M[0]-sw*.4-30,(M[1]+B2[1])/2,M[0],M[1]);bag.closePath();
  g.save();g.globalAlpha=Math.min(1,k*2);const G=g.createLinearGradient(0,Math.min(Fp[1],M[1]),0,B2[1]);G.addColorStop(0,'#4a1c40');G.addColorStop(1,'#26091e');g.fillStyle=G;g.fill(bag);g.strokeStyle=INK;g.lineWidth=2.6;g.stroke(bag);
  g.save();g.clip(bag);const R=SR(31);for(let i=0;i<7;i++){const u=R();petal(g,lerp(B2[0],B1[0],u)+(R()-.5)*30,lerp(B2[1],B1[1],u)-20-R()*90,26+R()*16,R()*TAU,i%3?PINK:'#ffe0ec')}g.strokeStyle=ROSE;g.lineWidth=14;g.beginPath();g.moveTo(B2[0],B2[1]);g.quadraticCurveTo((B1[0]+B2[0])/2,Math.max(B1[1],B2[1])+30,B1[0],B1[1]);g.stroke();g.restore();
  const tube=new Path2D(),w0=52,w1=46;tube.moveTo(S[0]+n1[0]*w0,S[1]+n1[1]*w0);tube.lineTo(E[0]+na[0]*w0,E[1]+na[1]*w0);tube.lineTo(Fp[0]+n2[0]*w1,Fp[1]+n2[1]*w1);tube.lineTo(Fp[0]-n2[0]*w1,Fp[1]-n2[1]*w1);tube.lineTo(E[0]-na[0]*w0,E[1]-na[1]*w0);tube.lineTo(S[0]-n1[0]*w0,S[1]-n1[1]*w0);tube.closePath();
  g.fillStyle='#43183a';g.fill(tube);g.strokeStyle=INK;g.lineWidth=2.6;g.stroke(tube);g.strokeStyle=SASH;g.lineWidth=9;g.beginPath();g.moveTo(Fp[0]+n2[0]*w1,Fp[1]+n2[1]*w1);g.lineTo(Fp[0]-n2[0]*w1,Fp[1]-n2[1]*w1);g.stroke();g.restore()}
 // ---------- the haori behind the body: plum, petals on the hem, rose lining where the wind turns it
 function haori(g,J,k){const w=J.wnd,t=J.t,e=ease(k),A=J.rot(-148,-378),B=J.rot(112,-378),len=lerp(180,840,e),sw=sin(t*1.8)*26+w*430,fl=sin(t*3.1)*16*(.4+w);
  const bx=A[0]-80-sw,by=A[1]+len+fl,fx=B[0]+40-sw*.3,fy=B[1]+len*.94;
  const p=new Path2D();p.moveTo(A[0],A[1]);p.bezierCurveTo(A[0]-50-sw*.2,A[1]+len*.3,bx-20,by-len*.42,bx,by);p.quadraticCurveTo((bx+fx)/2,Math.max(by,fy)+26,fx,fy);p.bezierCurveTo(B[0]+50-sw*.1,B[1]+len*.5,B[0]+10,B[1]+len*.2,B[0],B[1]);p.closePath();
  const G=g.createLinearGradient(A[0],A[1],bx,by);G.addColorStop(0,'#55204a');G.addColorStop(.55,PLUM);G.addColorStop(1,'#1c0616');g.fillStyle=G;g.fill(p);g.strokeStyle=INK;g.lineWidth=3;g.stroke(p);
  g.save();g.clip(p);const R=SR(7);for(let i=0;i<16;i++){const u=R(),h=R();petal(g,lerp(bx,fx,u)+sw*.1*h,lerp(by,fy,u)-30-h*h*300*e,30+R()*22,R()*TAU,i%4?PINK:'#ffe2ee')}
  blossom(g,lerp(bx,fx,.3),lerp(by,fy,.3)-150*e,46,t*.1,'#ffb3cf','#ffe0a0');blossom(g,lerp(bx,fx,.72),lerp(by,fy,.72)-90*e,34,1-t*.1,'#ff9ac0','#ffe0a0');
  g.strokeStyle=SASH;g.lineWidth=20;g.beginPath();g.moveTo(bx-10,by);g.quadraticCurveTo((bx+fx)/2,Math.max(by,fy)+26,fx+10,fy);g.stroke();g.strokeStyle=ROSE;g.lineWidth=5;g.beginPath();g.moveTo(bx-10,by-14);g.quadraticCurveTo((bx+fx)/2,Math.max(by,fy)+12,fx+10,fy-14);g.stroke();
  g.strokeStyle='rgba(216,72,122,.85)';g.lineWidth=26;g.beginPath();g.moveTo(A[0]-6,A[1]+40);g.bezierCurveTo(A[0]-56-sw*.2,A[1]+len*.3,bx-26,by-len*.42,bx-6,by);g.stroke();
  g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=12;for(let i=0;i<3;i++){g.beginPath();g.moveTo(lerp(A[0],B[0],.25+i*.22),A[1]+60);g.quadraticCurveTo(lerp(bx,fx,.2+i*.25)+20,by-len*.5,lerp(bx,fx,.2+i*.28),by-10);g.stroke()}g.restore()}
 // ---------- the near hand in its lacquer glove: a rose cuff at the wrist, and (wrapped over the scabbard) the fingers
 function hand(g,J,wrapd){const A=J.nA,hx=A[2],hy=A[3]+4,dx=hx-A[0],dy=hy-A[1],D=Math.hypot(dx,dy)||1,ux=dx/D,uy=dy/D,cx=hx-ux*24,cy=hy-uy*24;g.save();g.lineCap='round';
  if(wrapd){g.fillStyle=J.C.glove;g.strokeStyle=INK;g.lineWidth=2.6;g.beginPath();g.ellipse(hx,hy,30,34,0,0,TAU);g.fill();g.stroke();
   const fa=SA+J.lean+PI/2,fx=cos(fa),fy=sin(fa);g.strokeStyle='#7a5288';g.lineWidth=4;for(let i=0;i<3;i++){const o=-14+i*13,bx=hx+cos(SA+J.lean)*o,by=hy+sin(SA+J.lean)*o;g.beginPath();g.moveTo(bx-fx*22,by-fy*22);g.quadraticCurveTo(bx+fx*2+4,by+fy*2,bx+fx*24,by+fy*24);g.stroke()}}
  g.strokeStyle=PINK;g.lineWidth=7;g.beginPath();g.moveTo(cx-uy*30,cy+ux*30);g.lineTo(cx+uy*30,cy-ux*30);g.stroke();g.restore()}
 const dress={
  back(g,J){const k1=J.k.p1||0,k3=J.k.p3||0;if(k1>0){g.save();g.globalAlpha=Math.min(1,k1*2);saya(g,J.rot(-60,-80),SA+J.lean,J);g.restore()}if(k3>0)haori(g,J,k3)},
  torso(g,J){const k1=J.k.p1||0,k3=J.k.p3||0,w=J.wnd,t=J.t;g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);
   if(k1>0){const e=ease(k1);g.save();g.beginPath();g.rect(-120,-260,lerp(0,250,e),200);g.clip();
    // the pale obi: wide, wrapped, a rose cord through the middle tied in a small knot
    const ob=new Path2D();ob.moveTo(-90,-206);ob.quadraticCurveTo(0,-196,88,-210);ob.lineTo(86,-100);ob.quadraticCurveTo(0,-90,-90,-102);ob.closePath();const G=g.createLinearGradient(0,-210,0,-96);G.addColorStop(0,'#ffffff');G.addColorStop(.5,SASH);G.addColorStop(1,'#cdb6c4');g.fillStyle=G;g.fill(ob);g.strokeStyle=INK;g.lineWidth=2.6;g.stroke(ob);
    g.strokeStyle='rgba(150,110,140,.5)';g.lineWidth=2;g.beginPath();g.moveTo(-88,-176);g.quadraticCurveTo(0,-168,86,-180);g.moveTo(-88,-128);g.quadraticCurveTo(0,-120,86,-132);g.stroke();
    g.strokeStyle=ROSE;g.lineWidth=11;g.beginPath();g.moveTo(-90,-152);g.quadraticCurveTo(0,-142,88,-156);g.stroke();g.fillStyle=ROSE;g.beginPath();g.ellipse(34,-149,17,13,.2,0,TAU);g.fill();g.strokeStyle=INK;g.lineWidth=2;g.stroke();
    g.restore();
    // the obi's long tails, from the back of the waist, riding the wind
    const L=430*e,sw=sin(t*2.6)*20+w*260;for(const[i,o]of[[0,0],[1,26]]){const x0=-86,y0=-150+o,ex=x0-60-sw*(1+i*.3)-L*.35,ey=y0+L*(.95-i*.12);g.fillStyle=i?'#e6d0dc':SASH;g.strokeStyle=INK;g.lineWidth=2.4;g.beginPath();g.moveTo(x0,y0-18);g.bezierCurveTo(x0-40-sw*.2,y0+L*.3,ex+30,ey-L*.3,ex,ey);g.lineTo(ex+36+sin(t*4+i)*8,ey+16);g.bezierCurveTo(ex+60,ey-L*.3,x0-10-sw*.2,y0+L*.32,x0+8,y0+16);g.closePath();g.fill();g.stroke();g.strokeStyle=ROSE;g.lineWidth=4;g.beginPath();g.moveTo(ex+4,ey-10);g.lineTo(ex+34,ey+4);g.stroke()}}
   if(k3>0){const e=ease(k3),fl=sin(t*2.2)*10+w*40;g.globalAlpha=Math.min(1,k3*2);
    // the haori's front edges over the kimono, and its rose cord
    for(const s of[-1,1]){const p=new Path2D(),xo=s<0?-144:118,xi=s<0?-74:62;p.moveTo(xo,-366);p.lineTo(s<0?-44:34,-404);p.lineTo(xi,-300);p.lineTo(xi+s*-6,-140);p.lineTo(xi+s*8-fl*.4,lerp(-120,190,e));p.lineTo(xo+s*36-fl,lerp(-120,200,e));p.quadraticCurveTo(xo+s*10,-150,xo,-366);p.closePath();g.fillStyle=s<0?'#43183a':'#3a1432';g.fill(p);g.strokeStyle=INK;g.lineWidth=2.6;g.stroke(p);
     g.strokeStyle=ROSE;g.lineWidth=6;g.beginPath();g.moveTo(s<0?-44:34,-404);g.lineTo(xi,-300);g.lineTo(xi+s*-6,-140);g.lineTo(xi+s*8-fl*.4,lerp(-120,190,e));g.stroke()}
    g.strokeStyle=PINK;g.lineWidth=6;g.beginPath();g.moveTo(-70,-262);g.quadraticCurveTo(-6,-240,58,-262);g.stroke();g.fillStyle=PINK;g.beginPath();g.ellipse(-6,-246,13,10,0,0,TAU);g.fill();g.strokeStyle=INK;g.lineWidth=2;g.stroke();g.strokeStyle=PINK;g.lineWidth=5;g.beginPath();g.moveTo(-10,-238);g.quadraticCurveTo(-14-fl*.2,-200,-22-fl*.4,-170);g.moveTo(-2,-238);g.quadraticCurveTo(4-fl*.2,-206,0-fl*.4,-176);g.stroke()}
   g.restore();
   if(k1>0)sode(g,J.FS,J.fA,ease(k1),.84)},
  front(g,J){const k1=J.k.p1||0,k3=J.k.p3||0,P=J.rot(-60,-80),home=k1>0&&J.NH&&Math.hypot(J.NH[0]-P[0],J.NH[1]-P[1])<44;
   if(k3>0)sleeve(g,J,k3);
   if(home){saya(g,J.NH,SA+J.lean,J);hand(g,J,1)}else if(k1>0)hand(g,J,0);
   if(k1>0)sode(g,J.NS,J.nA,ease(k1),1)},
  head(g,J){const k=J.k.p2||0;if(k<=0)return;const e=ease(k),y0=J.yaw==null?.26:J.yaw,sy=sin(y0),cy=cos(y0),w=J.wnd,t=J.t,cx=sy*40;
   g.save();g.globalAlpha=Math.min(1,k*2);g.lineJoin='round';
   // the headband's tails, from the knot at the back
   for(const[i,o]of[[0,0],[1,1]]){const x0=-120,y1=-70+o*16,L=lerp(60,330,e),sw=sin(t*3+i*1.4)*24+w*120,ex=x0-L*.8-sw*.4,ey=y1+L*.55-w*60+i*30;g.fillStyle=i?'#3a1a34':'#241426';g.strokeStyle=INK;g.lineWidth=2.2;g.beginPath();g.moveTo(x0,y1-12);g.bezierCurveTo(x0-L*.3,y1-20+sw*.2,ex+40,ey-30,ex,ey);g.lineTo(ex+18,ey+18);g.bezierCurveTo(ex+60,ey-8,x0-L*.3,y1+10+sw*.2,x0+6,y1+12);g.closePath();g.fill();g.stroke();g.fillStyle=PINK;g.beginPath();g.moveTo(ex,ey);g.lineTo(ex+18,ey+18);g.lineTo(ex+30,ey+4);g.closePath();g.fill()}
   // the band across the brow
   const band=new Path2D();band.moveTo(-130,-84);band.quadraticCurveTo(cx,-134,132,-90);band.lineTo(130,-60);band.quadraticCurveTo(cx,-106,-128,-54);band.closePath();const G=g.createLinearGradient(0,-130,0,-56);G.addColorStop(0,'#4a2a48');G.addColorStop(1,'#1c0c1c');g.fillStyle=G;g.fill(band);g.strokeStyle=INK;g.lineWidth=2.6;g.stroke(band);g.strokeStyle=ROSE;g.lineWidth=3;g.beginPath();g.moveTo(-128,-70);g.quadraticCurveTo(cx,-120,130,-76);g.stroke();
   // the crest: two short, straight lacquer blades raked BACK by the wind (never a ring or crescent round the head), gold only on the edges, a notch cut in each
   for(const s of[-1,1]){const sc=(1-s*sy*.35)*cy*.25+.75,H=lerp(14,s>0?72:58,e),Wd=lerp(30,s>0?44:112,e),bx=cx+s*20*sc,by=-118,tx=bx-Wd*sc,ty=by-H,dx=tx-bx,dy=ty-by,D=Math.hypot(dx,dy)||1,px=-dy/D,py=dx/D,hw=12,
     a1=[bx+px*hw,by+py*hw],a2=[bx-px*hw,by-py*hw],q=(P,u)=>[lerp(P[0],tx,u),lerp(P[1],ty,u)],k1=q(a1,.42),m1=q(a2,.5),m3=q(a2,.6),m2=[m1[0]+px*9,m1[1]+py*9];
    const p=new Path2D();p.moveTo(a1[0],a1[1]);p.lineTo(k1[0]+px*3,k1[1]+py*3);p.lineTo(tx,ty);p.lineTo(m3[0],m3[1]);p.lineTo(m2[0],m2[1]);p.lineTo(m1[0],m1[1]);p.lineTo(a2[0],a2[1]);p.closePath();
    const Gh=g.createLinearGradient(bx,by,tx,ty);Gh.addColorStop(0,'#1e0818');Gh.addColorStop(.6,PLUM);Gh.addColorStop(1,'#5a2448');g.fillStyle=Gh;g.fill(p);g.strokeStyle=GOLD;g.lineWidth=3;g.stroke(p);g.strokeStyle='rgba(255,154,192,.55)';g.lineWidth=2;g.beginPath();g.moveTo(a1[0]-px*4,a1[1]-py*4);g.lineTo(k1[0]-px,k1[1]-py);g.lineTo(lerp(k1[0],tx,.7),lerp(k1[1],ty,.7));g.stroke()}
   g.fillStyle=PLUM;g.strokeStyle=GOLD;g.lineWidth=2.6;g.beginPath();g.ellipse(cx,-110,26*cy+4,23,0,0,TAU);g.fill();g.stroke();blossom(g,cx,-110,20,t*.3,PINK,'#fff4c0',ROSE);
   g.restore()}};
 // poses: a stance with the blade home at the hip, near hand on the scabbard, far hand on the hilt
 function sheath(lean,py,ex){const hy=-830+py,c=cos(lean),s=sin(lean),rot=(x,y)=>[x*c-y*s,hy+x*s+y*c],NS=rot(-128,-372),FS=rot(100,-372),P=rot(-60,-80),wa=SA+lean,d=[cos(wa),sin(wa)],hl=[P[0]-d[0]*.31*WL,P[1]-d[1]*.31*WL];return Object.assign({lean,py,nh:[P[0]-NS[0],P[1]-NS[1]],fh:[hl[0]-FS[0],hl[1]-FS[1]],wa,_P:P},ex||{})}
 // a two-handed grip with the blade drawn: near hand at the guard (H, body space), far hand behind it on the hilt
 function grip(lean,py,H,wa,ex){const hy=-830+py,c=cos(lean),s=sin(lean),rot=(x,y)=>[x*c-y*s,hy+x*s+y*c],NS=rot(-128,-372),FS=rot(100,-372),d=[cos(wa),sin(wa)],F2=[H[0]-d[0]*110,H[1]-d[1]*110];return Object.assign({lean,py,nh:[H[0]-NS[0],H[1]-NS[1]],fh:[F2[0]-FS[0],F2[1]-FS[1]],wa},ex||{})}
 const IAI=sheath(.24,90,{nf:[-250,0],ff:[260,0]}),WIND=sheath(.2,70,{nf:[-240,0],ff:[250,0]}),REST=sheath(.16,120,{nf:[-280,0],ff:[260,0]});
 // the close-ups: blade drawn and held low to the front, so the obi and haori are clear; the hero: wide and low, the blade raised forward, tip high
 const PIECE=grip(.03,10,[130,-740],.8,{nf:[-70,0],ff:[80,0],nb:-1}),HERO=grip(.1,70,[250,-1110],-.5,{nf:[-270,0],ff:[250,0],hd:{yaw:.32,tilt:.03,eye:{open:1,angry:.6},brow:{angry:.6},mouth:{smile:.1}}});
 const FOLLOW={py:150,lean:.34,nf:[-380,0],ff:[300,0],nh:[430,60],fh:[-240,220],wa:-.08};
 // the cut across the screen
 const LA=[-60,566],LB=[1980,474],lineY=x=>LA[1]+(LB[1]-LA[1])*(x-LA[0])/(LB[0]-LA[0]);
 // the field of petals the move stops and then cuts
 const PF=(()=>{const R=SR(77),a=[];for(let i=0;i<104;i++)a.push({x:R()*2120-100,y:R()*1260-90,s:20+R()*30,vx:-60-R()*90,vy:60+R()*70,r:R()*TAU,vr:(R()-.5)*3,ph:R()*TAU,c:R()<.4?'#ffb3cf':R()<.6?PINK:'#ffe2ee',f:i%4==0,b:R()});return a})();
 const wrap=(v,a,n)=>((v-a)%n+n)%n+a;
 EVC1.add('samurai',{
  pal:['#ff9ac0','#4a1430','#fff0f6'],eye:'#ff6a9e',
  C:{coat:'#2e1a34',dark:'#3a1630',trim:'#ff9ac0',inner:'#f6e8ef',boot:'#24121e',glove:'#3a2242',leg:'#5a3a66',scarf:null,coatLen:.84},
  wl:WL,dress,pieces:['chest','head',[-240,-990,.72]],
  glyph(g,cx,cy,rx,ry,k,t){g.globalCompositeOperation='lighter';g.globalAlpha=k*.95;g.save();g.translate(cx,cy+ry*.04);g.scale(1,ry/rx);blossom(g,0,0,rx*.6,t*.6,'rgba(255,190,220,.95)','#ffffff');g.restore();g.globalAlpha=k*.7;g.fillStyle='#ffe6f0';for(let i=0;i<5;i++){const a=i*TAU/5+t*.6+.63;g.beginPath();g.arc(cx+cos(a)*rx*.8,cy+sin(a)*ry*.8,rx*.05,0,TAU);g.fill()}},
  sky:[[0,'#140a22'],[.3,'#3e1a4a'],[.52,'#9a3e6e'],[.64,'#f0907e'],[.7,'#ffc49a'],[.74,'#7a3a5e'],[1,'#1a0a18']],
  plate(x,R,P){const{W,H,glow}=P;
   glow(x,420,690,1000,'#ff6a86',.45);glow(x,420,690,420,'#ffb898',.7);glow(x,420,690,130,'#fff2dc',.95);
   for(let i=0;i<18;i++){const y=110+R()*540,X=R()*W,w=200+R()*560,h=7+R()*15,lo=y>430;x.globalAlpha=.3+R()*.4;x.fillStyle=lo?'#c8607e':'#4e2252';x.beginPath();x.ellipse(X,y,w,h,0,0,TAU);x.fill();x.fillStyle=lo?'#ffc4b4':'#a2507e';x.globalAlpha*=.8;x.beginPath();x.ellipse(X+w*.1,y+h*.55,w*.7,h*.42,0,0,TAU);x.fill()}x.globalAlpha=1;
   const rh=(X,y0,amp,f,sd)=>{const v=sin(X*f+sd)*.55+sin(X*f*2.3+sd*1.7)*.3+sin(X*f*5.1+sd*3)*.15;return y0-amp*(.5+.5*v)};
   const ridge=(y0,amp,f,col,sd)=>{x.fillStyle=col;x.beginPath();x.moveTo(0,H);for(let X=0;X<=W;X+=12)x.lineTo(X,rh(X,y0,amp,f,sd));x.lineTo(W,H);x.closePath();x.fill()};
   const mist=(y0,y1,a)=>{const G=x.createLinearGradient(0,y0,0,y1);G.addColorStop(0,'rgba(255,170,190,0)');G.addColorStop(.6,'rgba(255,170,190,'+a+')');G.addColorStop(1,'rgba(255,170,190,0)');x.fillStyle=G;x.fillRect(0,y0,W,y1-y0)};
   ridge(650,220,.0019,'#9a6094',1);mist(560,720,.32);ridge(712,130,.0031,'#6a3a70',4);mist(640,760,.26);
   // distant blossoming trees along the last ridge
   for(let i=0;i<90;i++){const X=R()*W,y=rh(X,770,74,.0047,7);x.fillStyle=i%3?'#c8709e':'#e894b8';x.globalAlpha=.55+R()*.3;x.beginPath();x.arc(X,y+4,8+R()*12,0,TAU);x.fill()}x.globalAlpha=1;
   ridge(770,74,.0047,'#43224e',7);mist(740,820,.2);
   // the field and the road toward the low sun
   const G=x.createLinearGradient(0,790,0,H);G.addColorStop(0,'#5e3254');G.addColorStop(.3,'#3a1c38');G.addColorStop(1,'#120612');x.fillStyle=G;x.fillRect(0,790,W,H-790);
   const RG=x.createLinearGradient(0,800,0,H);RG.addColorStop(0,'#b88896');RG.addColorStop(.4,'#7a5266');RG.addColorStop(1,'#3a2032');x.fillStyle=RG;x.beginPath();x.moveTo(992,806);x.bezierCurveTo(940,880,820,960,560,H+10);x.lineTo(1440,H+10);x.bezierCurveTo(1160,980,1040,880,1012,806);x.closePath();x.fill();
   x.fillStyle='rgba(255,200,190,.12)';x.beginPath();x.moveTo(992,806);x.bezierCurveTo(940,880,820,960,560,H+10);x.lineTo(760,H+10);x.bezierCurveTo(900,960,970,880,1000,806);x.closePath();x.fill();
   for(let i=0;i<40;i++){const v=R(),y=810+v*v*270,hw=lerp(10,440,v*v),X=1000+(R()-.5)*hw*1.6-v*v*60;x.fillStyle=R()<.5?'rgba(40,16,36,.5)':'rgba(220,180,190,.35)';x.beginPath();x.ellipse(X,y,4+v*16,2+v*6,0,0,TAU);x.fill()}
   // grass
   x.lineCap='round';for(let i=0;i<260;i++){const v=R(),y=800+v*290,X=R()*W,onRoad=Math.abs(X-1000+v*v*60)<lerp(10,440,v*v)*.8;if(onRoad&&R()<.85)continue;const h=(10+R()*30)*(.4+v*1.6),b=(R()-.4)*h*.6;x.strokeStyle=R()<.5?'#2a1230':'#5a2e52';x.lineWidth=1+v*3;x.beginPath();x.moveTo(X,y);x.quadraticCurveTo(X+b*.3,y-h*.6,X+b,y-h);x.stroke()}
   // fallen petals everywhere
   for(let i=0;i<420;i++){const v=R(),y=806+v*v*280,X=R()*W,s=(2+R()*5)*(.5+v*2);x.globalAlpha=.35+R()*.5;x.fillStyle=R()<.5?'#ffb3cf':'#ff8ab4';x.beginPath();x.ellipse(X,y,s,s*.45,R()*.6-.3,0,TAU);x.fill()}x.globalAlpha=1;
   // the cherry trees: one on the right, one at the far left edge
   const tree=(x0,y0,a0,len,w,dep,sc)=>{const ends=[];const br=(xa,ya,a,l,wd,d)=>{const xb=xa+cos(a)*l,yb=ya+sin(a)*l;x.strokeStyle='#241020';x.lineWidth=wd;x.beginPath();x.moveTo(xa,ya);x.quadraticCurveTo((xa+xb)/2+(R()-.5)*l*.3,(ya+yb)/2+(R()-.5)*l*.3,xb,yb);x.stroke();if(d<=2)ends.push([xb,yb,d]);if(d>0){br(xb,yb,a-.28-R()*.45,l*(.64+R()*.18),wd*.64,d-1);br(xb,yb,a+.22+R()*.45,l*(.6+R()*.2),wd*.64,d-1)}};br(x0,y0,a0,len,w,dep);
    for(const pass of[0,1,2,3])for(const[ex,ey,d]of ends){const n=d==0?16:d==1?10:6,rr=(d==0?44:34)*sc;for(let i=0;i<n;i++){const px=ex+(R()-.5)*rr*2.8,py=ey+(R()-.5)*rr*1.8-rr*.2,r=rr*(.3+R()*.42);if(pass==3&&R()<.55)continue;x.fillStyle=pass==0?'#6a1c48':pass==1?'#b0487e':pass==2?(R()<.5?'#f08ab4':'#ff9ec4'):'#ffe0ec';x.globalAlpha=pass==3?.85:1;x.beginPath();x.arc(px+(pass==0?10:pass==1?5:pass==3?-r*.35:0),py+(pass==0?14:pass==1?6:pass==3?-r*.35:0),pass==3?r*.38:pass==2?r*.82:r,0,TAU);x.fill()}}x.globalAlpha=1};
   tree(1790,900,-1.42,250,64,5,1.1);tree(70,880,-1.68,230,52,5,.95);
   // falling petals caught in the air
   for(let i=0;i<70;i++){const X=R()*W,y=R()*780,s=4+R()*7;x.globalAlpha=.5+R()*.5;x.fillStyle=R()<.5?'#ffc4da':'#ff9ac0';x.beginPath();x.ellipse(X,y,s,s*.5,R()*3,0,TAU);x.fill()}x.globalAlpha=1;
   // dark grass close to the lens
   for(let i=0;i<70;i++){const side=i%2,X=side?W-R()*360:R()*360,h=60+R()*160,b=(R()-.5)*90;x.strokeStyle='#0c040c';x.lineWidth=3+R()*5;x.beginPath();x.moveTo(X,H+10);x.quadraticCurveTo(X+b*.3,H-h*.6,X+b,H-h);x.stroke()}},
  aura(y,X,Y,k,t){y.globalCompositeOperation='lighter';const gl=MOVIE1.kit.glow;gl(y,X,Y-20,460*k,'#ff6a9e',.3*k);
   // wind ribbons coiling round the legs and waist
   y.lineCap='round';for(let i=0;i<4;i++){const cy=Y-40-i*120*k,rx=(300-i*36)*(.7+.3*k),ry=46-i*5,a0=t*(2.2+i*.5)+i*1.7;y.globalAlpha=k*(.55-i*.08);y.strokeStyle=i%2?'#ffd0e2':'#ff8ab8';y.lineWidth=5-i*.6;y.beginPath();y.ellipse(X,cy,rx,ry,0,a0,a0+2.4);y.stroke()}
   // petals rising in a spiral
   y.globalCompositeOperation='source-over';for(let i=0;i<64;i++){const u=(t*.22+i/64)%1,a=i*2.4+t*(1.6+(i%3)*.3),r=(320-u*170)*(.7+.3*sin(i))+40,h=u*1150*k,px=X+cos(a)*r,py=Y-h+sin(a)*r*.22;y.globalAlpha=k*Math.sin(u*PI)*(sin(a)>0?1:.6);petal(y,px,py,14+(i%5)*4,a*1.3+t*3,i%3?'#ffb3cf':'#ffe6f0')}},
  sigil(y,k,t,R0){y.globalCompositeOperation='lighter';const a=Math.min(1,k*1.4);y.strokeStyle=PINK;y.fillStyle=PINK;y.globalAlpha=a;
   for(const[f,w]of[[1,10],[.95,3],[.56,5],[.5,2]]){y.lineWidth=w;y.beginPath();y.arc(0,0,R0*f,0,TAU);y.stroke()}
   // petals ringing the edge, turning slowly
   for(let i=0;i<30;i++){const b=i*TAU/30+t*.12;petal(y,cos(b)*R0*.86,sin(b)*R0*.86,R0*.075,b,i%2?'#ffb3cf':'#ffe0ec')}
   // sword cuts circling: tapered slivers along the middle ring
   for(let i=0;i<9;i++){const b0=i*TAU/9-t*.2,b1=b0+.5,r0=R0*.72;y.beginPath();for(let j=0;j<=10;j++){const u=j/10,b=lerp(b0,b1,u),r=r0+R0*.05*sin(u*PI);y[j?'lineTo':'moveTo'](cos(b)*r,sin(b)*r)}for(let j=10;j>=0;j--){const u=j/10,b=lerp(b0,b1,u),r=r0-R0*.012*sin(u*PI);y.lineTo(cos(b)*r,sin(b)*r)}y.closePath();y.globalAlpha=a*.9;y.fillStyle='#ffe6f0';y.fill()}
   y.globalAlpha=a*.7;y.fillStyle=PINK;for(let i=0;i<40;i++){const b=i*TAU/40-t*.08;y.beginPath();y.arc(cos(b)*R0*.4,sin(b)*R0*.4,R0*.008+1,0,TAU);y.fill()}
   y.globalAlpha=a*.85;blossom(y,0,0,R0*.26,t*.15,'rgba(255,150,196,.45)','#ffffff');y.globalAlpha=1},
  pose:{gather:{nh:[90,500],fh:[40,480],wa:.55,lean:.02,nf:[-80,0],ff:[90,0]},hero:HERO,piece:PIECE,windup:WIND},
  // the Mythic wakes: a petal falls onto the edge and parts in two
  spark(x,c,A){const q=A.q,u=c.u,t=c.t,L=q.wl0,a=-.32+u*.06,X=lerp(380,300,u),Y=650,pv=piv(),lx=(.6-pv)*L,ly=-.092*L,ex=X+cos(a)*lx-sin(a)*ly,ey=Y+sin(a)*lx+cos(a)*ly,tc=.8;
   A.view(x,c.C,1,y=>{const R=SR(5);for(let i=0;i<22;i++){const px=wrap(R()*2000-t*(60+R()*80),-40,2000),py=wrap(R()*1100+t*(70+R()*60),-40,1160);y.globalAlpha=.25+R()*.35;petal(y,px,py,14+R()*18,R()*TAU+t*(R()-.5)*3,'#ff9ac0')}y.globalAlpha=1;
    if(t<tc){const k=t/tc;petal(y,ex+200*(1-k)+sin(k*7)*40,ey-480*(1-k)*(1-k*.2),130,a+(1-k)*4,'#ffc0d8')}
    else{const d=t-tc;for(const h of[-1,1])petal(y,ex-50*d+h*50*d,ey+50*d+300*d*d,130,a+h*d*(3.2+d*2),h<0?'#ffc0d8':'#ffadc9',h,6+260*d);
     if(d<.15){const f=1-d/.15;A.glow(y,ex,ey,200,'#ff9ac0',.9*f);A.glow(y,ex,ey,50,'#ffffff',f);y.save();y.globalCompositeOperation='lighter';y.lineCap='round';for(const[w,al]of[[16,.35],[7,.8],[2.5,1]]){y.strokeStyle='rgba(255,255,255,'+(al*f)+')';y.lineWidth=w;y.beginPath();y.moveTo(ex-cos(a)*(520-300*d),ey-sin(a)*(520-300*d));y.lineTo(ex+cos(a)*300,ey+sin(a)*300);y.stroke()}y.restore()}A.sparks(y,9,d,ex,ey,18,520,'#ffd0e2',.45,300)}})},
  // the close-ups: big petals sweep past the lens, never over the face
  piece(x,c,A,i){const t=c.t,R=SR(50+i);for(let j=0;j<16;j++){const sp=900+R()*700,px=wrap(R()*2400-t*sp,-200,2400),py=R()*1200-60+t*sp*.34,s=60+R()*90;if(Math.abs(px-960)<380&&Math.abs(py-470)<330)continue;x.globalAlpha=.55+R()*.35;petal(x,px,py,s,R()*TAU+t*(R()-.5)*6,j%3?'#ffb3cf':'#ffe2ee')}x.globalAlpha=1},
  // the wind-up: the thumb eases the guard out, a sliver of steel shows; the petals stream past
  windup(x,c,A){const t=c.t,s=.95,X=960+60*s,Y=540+1150*s,P=WIND._P,wa=WIND.wa,d=[cos(wa),sin(wa)],pv=piv(),tb=[P[0]-d[0]*(pv+.01)*WL,P[1]-d[1]*(pv+.01)*WL];
   A.view(x,c.C,1,y=>{const R=SR(12);y.save();y.globalCompositeOperation='lighter';for(let j=0;j<40;j++){const sp=1800+R()*1400,py=R()*1080,px=wrap(R()*2400-t*sp,-300,2500),l=80+R()*220;y.globalAlpha=.25+R()*.45;y.strokeStyle=j%3?'#ff9ac0':'#ffffff';y.lineWidth=2+R()*3;y.beginPath();y.moveTo(px,py);y.lineTo(px+l,py-l*.08);y.stroke()}y.restore();
    if(t>.4){const k=A.ez((t-.4)/.25),sx=X+tb[0]*s,sy=Y+tb[1]*s,gx=sx+d[0]*24*k,gy=sy+d[1]*24*k;A.glow(y,gx,gy,220*k,'#ff9ac0',.6);A.glow(y,gx,gy,60,'#ffffff',.9*k);y.save();y.globalCompositeOperation='lighter';y.strokeStyle='#ffffff';y.lineWidth=5;y.beginPath();y.moveTo(sx,sy);y.lineTo(gx+d[0]*30,gy+d[1]*30);y.stroke();y.restore()}})},
  // the moment of change: petals blown out from behind the black figure
  burst(y,k,t,A){const R=SR(41);for(let i=0;i<70;i++){const a=R()*TAU,dd=(.12+R()*.95)*1500*k,s=30+R()*70;petal(y,960+cos(a)*dd,600+sin(a)*dd*.7,s,a+t*2*(R()-.5),i%3?'#ffffff':'#c8306a')}},
  // Hanakage Iai: the draw, the still world, the blade sent home, and every petal falls in two
  sig:{hits:[.4,1.35],draw(x,c,A){const{q}=A,t=c.t,sp=q.sp,h0=.4,h1=1.35,X0=560,X1=1150,W=A.W,H=A.H,FL=F().lerpPose;
   const tau=t<h0?t-t*t/1.6:h0-h0*h0/1.6,cf={T:c.T-Math.max(0,Math.min(t,h1)-h0)*.92};
   // the world: before, the colour drains; while it is held, grey; on the cut, the land above the line slides
   if(t<h1){A.bg(x,c,.3+.25*cl(t/h0,0,1));const gr=t<h0?.55*t/h0:.92;x.save();x.globalCompositeOperation='saturation';x.globalAlpha=gr;x.fillStyle='#808080';x.fillRect(0,0,W,H);x.globalCompositeOperation='source-over';x.globalAlpha=t<h0?.2*t/h0:.4;x.fillStyle='#0a0412';x.fillRect(0,0,W,H);x.restore()}
   else{const d=t-h1,sl=A.eo(d/.3)*64,clipPoly=(up)=>{x.beginPath();x.moveTo(LA[0],LA[1]);x.lineTo(LB[0],LB[1]);x.lineTo(LB[0],up?-100:H+100);x.lineTo(LA[0],up?-100:H+100);x.closePath()};
    x.save();clipPoly(0);x.clip();A.bg(x,c,0);x.restore();x.save();clipPoly(1);x.clip();x.translate(-sl,sl*.045-sl*.12);A.bg(x,c,0);x.restore();A.rect(x,'#05030c',.2);
    x.save();x.globalCompositeOperation='lighter';x.strokeStyle=PINK;x.globalAlpha=Math.max(0,1-d/1.2);x.lineWidth=16;x.beginPath();x.moveTo(LA[0],LA[1]);x.lineTo(LB[0],LB[1]);x.stroke();x.strokeStyle='#ffffff';x.lineWidth=4;x.stroke();x.restore()}
   const field=(front)=>A.view(x,c.C,1,y=>{for(const p of PF){if(p.f!=front)continue;const px=wrap(p.x+p.vx*tau+sin(tau*1.3+p.ph)*30,-100,2120),py=wrap(p.y+p.vy*tau,-90,1260),a=p.r+p.vr*tau,L=p.s*(front?1.5:1);
     if(t<h1){y.globalAlpha=front?.95:.85;petal(y,px,py,L,a,p.c);if(t>h1-.1){y.globalAlpha=(t-h1+.1)/.1;y.save();y.globalCompositeOperation='lighter';y.strokeStyle='#ffffff';y.lineWidth=2;y.beginPath();y.moveTo(px-cos(a)*L*.6,py-sin(a)*L*.6);y.lineTo(px+cos(a)*L*.6,py+sin(a)*L*.6);y.stroke();y.restore()}}
     else{const d=t-h1,al=1-cl((d-.8)/.6,0,1);if(al<=0)continue;y.globalAlpha=al;for(const h of[-1,1])petal(y,px+p.vx*d*.5-d*60,py+90*d+260*d*d*(.6+p.b),L,a+h*d*(1.4+p.b*2),p.c,h,2+(80+p.b*120)*A.eo(d/.7))}}y.globalAlpha=1});
   field(false);
   A.view(x,c.C,1,y=>{
    if(t<h0){const k=t/h0;A.speedLines(y,X0+80,600,31,t,'rgba(255,220,236,.7)',.12+.5*k*k,40,360);
     A.sigil(y,X0,1004,lerp(220,420,A.ez(k)),k,c.T);
     A.hero(c,y,X0+30*k,1000,.5,Object.assign({},IAI,{hd:{yaw:.32,tilt:.04,eye:t<.25?{open:.08}:{open:1,angry:.9,pupil:.55},brow:{angry:t<.25?.3:1},mouth:{open:0,smile:t<.25?.05:-.25}}}),{wind:.5+k*.4,act:{rim:[PINK,.9,-8,-3]}});
     if(t>.26){const P=IAI._P,wa=IAI.wa,dd=[cos(wa),sin(wa)],pv=piv(),sx=X0+30*k+(P[0]-dd[0]*(pv+.01)*WL)*.5,sy=1000+(P[1]-dd[1]*(pv+.01)*WL)*.5,g=A.ez((t-.26)/.12);A.glow(y,sx,sy,150*g,'#ff9ac0',.8);A.glow(y,sx,sy,34,'#ffffff',g)}}
    else{
     // the line of the draw, and what is left where the hero was
     const d0=t-h0;
     if(t<h1){const bw=d0<.14?lerp(220,6,A.eo(d0/.14)):6;y.save();y.globalCompositeOperation='lighter';const G=y.createLinearGradient(0,lineY(960)-bw,0,lineY(960)+bw);G.addColorStop(0,'rgba(255,154,192,0)');G.addColorStop(.5,'rgba(255,240,248,1)');G.addColorStop(1,'rgba(255,154,192,0)');y.fillStyle=G;y.beginPath();y.moveTo(LA[0],LA[1]-bw);y.lineTo(LB[0],LB[1]-bw);y.lineTo(LB[0],LB[1]+bw);y.lineTo(LA[0],LA[1]+bw);y.closePath();y.fill();y.strokeStyle='rgba(255,140,190,.55)';y.lineWidth=12;y.beginPath();y.moveTo(LA[0],LA[1]);y.lineTo(LB[0],LB[1]);y.stroke();y.strokeStyle='#ffffff';y.lineWidth=2.5;y.stroke();y.restore()}
     if(d0<.5){const f=1-d0/.5;y.save();y.globalCompositeOperation='lighter';const R=SR(3);for(let i=0;i<26;i++){const yy=1000-(250+R()*900)*.5,xa=X0-60+R()*120,xb=X1-40+R()*100;y.globalAlpha=f*(.25+R()*.5);y.strokeStyle=i%3?'#ff9ac0':'#ffffff';y.lineWidth=2+R()*8;y.beginPath();y.moveTo(xa+(xb-xa)*(1-f)*.8,yy);y.lineTo(xb,yy-(xb-xa)*.02);y.stroke()}y.restore();
      A.hero(c,y,X0+30,1000,.5,IAI,{wind:.9,act:{sil:1,silC:PINK,a:.55*f}})}
     if(d0<.9){const th=Math.atan2(LB[1]-LA[1],LB[0]-LA[0]),nx=-sin(th),ny=cos(th);A.painter(y,'slash',960+nx*12000,lineY(960)+ny*12000,12000,d0/.9,th-PI/2,.1,8)}
     // the hero: still, then the blade turned and sent home, then the storm
     let pose,X=X1,hd;
     if(t<.95){pose=FOLLOW;hd={yaw:.36,eye:{open:.75,angry:.85,pupil:.6},brow:{angry:.9},mouth:{open:.06,smile:-.2}}}
     else if(t<h1){const k=A.ez((t-.95)/(h1-.05-.95));pose=FL(FOLLOW,REST,k);X=lerp(X1,X1-40,k);hd={yaw:.36-k*.08,eye:{open:lerp(.75,.3,k),angry:.6},brow:{angry:.5},mouth:{open:0,smile:0}}}
     else{const d=t-h1,sl=A.ez(d/.2);pose=Object.assign({},REST,{nf:[REST.nf[0]-20*sl,0]});X=X1-40;hd={yaw:.28,tilt:-.08,eye:{open:d<.25?.08:lerp(.3,.95,A.ez((d-.25)/.2)),angry:.45},brow:{angry:.35},mouth:{open:0,smile:.08}}}
     if(t>=h1){const d=t-h1;A.sigil(y,X,1004,lerp(300,900,A.eo(d/.8)),1-cl((d-.9)/.6,0,1),c.T);A.painter(y,'ring',X,980,1100,d/1.3,0,3,8);A.aura(y,X,1000,cl(1-d*.4,.5,1),c.T)}
     A.hero(t<h1?cf:c,y,X,1000,.5,Object.assign({},pose,{hd}),{wind:t<h1?.85:1.15,act:{rim:[t<h1?'#ffffff':PINK,1,-8,-3],grade:t<h1?['#1a0a22',.18]:null}});
     if(t>h1-.05&&t<h1+.35){const g=1-Math.abs(t-h1)/(t<h1?.05:.35),P=REST._P,dd=[cos(REST.wa),sin(REST.wa)],pv=piv(),mx=X+(P[0]-dd[0]*(pv+.01)*WL)*.5,my=1000+(P[1]-dd[1]*(pv+.01)*WL)*.5;A.glow(y,mx,my,260*g,'#ff9ac0',.9*g);A.glow(y,mx,my,70*g,'#ffffff',g);y.save();y.globalCompositeOperation='lighter';y.strokeStyle='rgba(255,255,255,'+g+')';y.lineWidth=4;y.beginPath();y.moveTo(mx-dd[1]*60,my+dd[0]*60);y.lineTo(mx+dd[1]*60,my-dd[0]*60);y.stroke();y.restore()}}});
   field(true);
   // the storm the cut lets loose: fresh petals flung out from the whole length of the line
   if(t>=h1){const d=t-h1;A.view(x,c.C,1,y=>{const R=SR(91);for(let i=0;i<70;i++){const u=R(),px0=lerp(LA[0],LB[0],u),py0=lineY(px0),a=-PI/2+(R()<.5?0:PI)+(R()-.5)*1.2,v=500+R()*1100,dd=d*(1-d*.15),px=px0+cos(a)*v*dd*.7-200*d,py=py0+sin(a)*v*dd*.5+300*d*d;y.globalAlpha=Math.max(0,1-d/1.4)*(.6+R()*.4);petal(y,px,py,24+R()*40,a+d*(R()-.5)*10,R()<.6?'#ffb3cf':'#ffffff')}y.globalAlpha=1;A.sparks(y,7,d,960,lineY(960),40,1400,'#ffd0e2',.7,200);if(d<.6)A.glow(y,960,lineY(960),900*A.eo(d/.3),'#ff9ac0',.5*(1-d/.6))})}
   if(A.lit(t,h0,.07)||A.lit(t,h1,.06))A.impact(x);
   if(t>h0&&t<h0+.18)A.rect(x,'#ffffff',.55*(1-(t-h0)/.18));if(t>h1&&t<h1+.22)A.rect(x,'#fff0f6',.6*(1-(t-h1)/.22))}}
 })})()}catch(e){console.error('EVC samurai',e)}
