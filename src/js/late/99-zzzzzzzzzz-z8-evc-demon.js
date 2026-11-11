// ===== Demon evolution cinematic: Sanguine Regent. A crimson dusk over an obsidian waste of broken chains and blood crystals; the old pact's chains snap on the floor;
// a high crimson collar, dark horns and bat wings; Crimson Verdict: one dash cuts a blood-red crescent across the sky, it bursts into a storm of drops, and the storm comes home. =====
try{(()=>{const F=()=>FILM1,sin=Math.sin,cos=Math.cos,TAU=6.2832,PI=Math.PI;
 const RED='#ff3048',CRIM='#b0142c',WINE='#5a0818',INK='#12040a',PINK='#ffc0c8';
 const ease=k=>{k=k<0?0:k>1?1:k;return 1-Math.pow(1-k,3)},L0=(a,b,k)=>a+(b-a)*k,cl=(v,a,b)=>v<a?a:v>b?b:v;
 // ---------- small shared shapes
 // a teardrop: round end at (x,y), tail pointing back along angle a
 function dropPath(p,x,y,r,a,st){const c=cos(a),s=sin(a),L=r*(2.2+(st||0));p.moveTo(x+s*r,y-c*r);p.arc(x,y,r,a-PI/2,a+PI/2);p.lineTo(x-c*L,y-s*L);p.closePath()}
 function drops(y,list,col,hi){const p=new Path2D();for(const d of list)dropPath(p,d[0],d[1],d[2],d[3],d[4]);y.fillStyle=col;y.fill(p);if(hi){y.fillStyle=hi;for(const d of list){if(d[2]<5)continue;y.beginPath();y.arc(d[0]+cos(d[3]-2.2)*d[2]*.38,d[1]+sin(d[3]-2.2)*d[2]*.38,d[2]*.28,0,TAU);y.fill()}}}
 // a bat in flight, wings keyed to phase
 function bat(y,X,Y,s,ph,c){const w=sin(ph);y.save();y.translate(X,Y);y.scale(s,s);y.fillStyle=c||INK;y.beginPath();y.ellipse(0,0,9,13,0,0,TAU);y.fill();y.beginPath();y.moveTo(-5,-11);y.lineTo(-7,-20);y.lineTo(-1,-13);y.lineTo(1,-13);y.lineTo(7,-20);y.lineTo(5,-11);y.fill();
  for(const q of[-1,1]){y.beginPath();y.moveTo(q*6,-4);y.quadraticCurveTo(q*30,-26*w-8,q*62,-34*w);y.quadraticCurveTo(q*54,-14*w+6,q*46,-6*w+10);y.quadraticCurveTo(q*38,2,q*30,-2*w+12);y.quadraticCurveTo(q*20,6,q*8,8);y.closePath();y.fill()}y.restore()}
 // a chain of links along a line: rings and edge-on bars in turn
 function chain(x,x0,y0,x1,y1,sag,lk,c,hi,broken){const n=Math.max(2,Math.round(Math.hypot(x1-x0,y1-y0)/lk));x.lineCap='round';for(let i=0;i<n;i++){const u=i/n,u2=(i+1)/n,P=v=>[L0(x0,x1,v),L0(y0,y1,v)+sag*4*v*(1-v)],a=P(u),b=P(u2),mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
   x.save();x.translate(mx,my);x.rotate(ang);if(i%2==0){x.strokeStyle=c;x.lineWidth=lk*.2;x.beginPath();if(broken&&i>=n-2)x.ellipse(0,0,lk*.62,lk*.3,0,.6,TAU-.3);else x.ellipse(0,0,lk*.62,lk*.3,0,0,TAU);x.stroke();if(hi){x.strokeStyle=hi;x.lineWidth=lk*.06;x.beginPath();x.ellipse(0,0,lk*.62,lk*.3,0,PI*1.1,PI*1.7);x.stroke()}}
   else{x.fillStyle=c;x.fillRect(-lk*.62,-lk*.11,lk*1.24,lk*.22);if(hi){x.fillStyle=hi;x.fillRect(-lk*.5,-lk*.11,lk,lk*.06)}}x.restore()}}
 // a tapered horn along a cubic: root (0,0) to tip; ridged
 function horn(g,P,w0,k,c0,c1,tipC,rim){const N=16,pt=u=>{const v=1-u;return[v*v*v*P[0][0]+3*v*v*u*P[1][0]+3*v*u*u*P[2][0]+u*u*u*P[3][0],v*v*v*P[0][1]+3*v*v*u*P[1][1]+3*v*u*u*P[2][1]+u*u*u*P[3][1]]};
  const L=[],R=[];for(let i=0;i<=N;i++){const u=i/N*k,a=pt(u),b=pt(Math.min(1,u+.01)),d=Math.atan2(b[1]-a[1],b[0]-a[0])+PI/2,w=w0*(1-u)*(1-u*.15)+1;L.push([a[0]+cos(d)*w,a[1]+sin(d)*w]);R.push([a[0]-cos(d)*w,a[1]-sin(d)*w])}
  const p=new Path2D();p.moveTo(L[0][0],L[0][1]);for(const q of L)p.lineTo(q[0],q[1]);for(let i=R.length-1;i>=0;i--)p.lineTo(R[i][0],R[i][1]);p.closePath();const e=pt(k),G=g.createLinearGradient(0,0,e[0],e[1]);G.addColorStop(0,c0);G.addColorStop(.6,c1);G.addColorStop(1,tipC);g.fillStyle=G;g.fill(p);g.strokeStyle='#050104';g.lineWidth=3;g.stroke(p);if(rim){g.strokeStyle=rim;g.lineWidth=4;g.lineCap='round';g.beginPath();for(let i=0;i<L.length-1;i++)g[i?'lineTo':'moveTo'](L[i][0],L[i][1]);g.stroke()}
  g.save();g.clip(p);g.strokeStyle='rgba(255,90,110,.28)';g.lineWidth=3;for(let i=1;i<9;i++){const u=i/10*k,a=L[Math.round(u/k*N)],b=R[Math.round(u/k*N)];if(!a)continue;g.beginPath();g.moveTo(a[0],a[1]);g.quadraticCurveTo((a[0]+b[0])/2+4,(a[1]+b[1])/2+6,b[0],b[1]);g.stroke()}
  g.strokeStyle='rgba(255,170,180,.5)';g.lineWidth=4;g.beginPath();for(let i=1;i<N-2;i++){const q=L[i];g[i>1?'lineTo':'moveTo'](L0(q[0],R[i][0],.25),L0(q[1],R[i][1],.25))}g.stroke();g.restore()}
 // one bat wing in body space, root at S, spreading toward side s (-1 back, +1 front)
 function wing(g,S,s,k,t,wnd,sc,dark,up){if(k<=0)return;const e=ease(k),fl=sin(t*2.4)*.08-wnd*.12,fold=(1-e)*1.1;g.save();g.translate(S[0],S[1]);g.scale(s*sc*(.2+.8*e),sc*(.2+.8*e));g.rotate(-fold-fl+.15+(up||0));
  const Wr=[-300,-250],T=[[-640,-300],[-690,-90],[-580,120],[-380,240]],B=[-40,250],sag=v=>v*.24;
  const p=new Path2D();p.moveTo(0,0);p.lineTo(Wr[0],Wr[1]);p.lineTo(T[0][0],T[0][1]);let prev=T[0];for(const q of[...T.slice(1),B]){const mx=(prev[0]+q[0])/2,my=(prev[1]+q[1])/2,cx=mx+(0-mx)*sag(1),cy=my+(0-my)*sag(1);p.quadraticCurveTo(cx+30,cy+20,q[0],q[1]);prev=q}p.closePath();
  const G=g.createRadialGradient(-120,-60,40,-300,-60,720);G.addColorStop(0,dark?'#0a0206':'#1a050c');G.addColorStop(.55,dark?'#2a0610':'#4a0a18');G.addColorStop(1,dark?'#4a0a16':'#8a1428');g.fillStyle=G;g.fill(p);
  g.save();g.clip(p);g.strokeStyle=dark?'rgba(150,20,40,.35)':'rgba(255,60,80,.38)';g.lineWidth=3;for(const q of T){g.beginPath();g.moveTo(Wr[0],Wr[1]);g.quadraticCurveTo((Wr[0]+q[0])/2+30,(Wr[1]+q[1])/2+40,q[0]+20,q[1]+40);g.stroke()}g.restore();
  g.strokeStyle='#060103';g.lineWidth=3;g.stroke(p);
  // bones
  g.strokeStyle=dark?'#0a0205':'#140409';g.lineCap='round';g.lineWidth=20;g.beginPath();g.moveTo(0,0);g.lineTo(Wr[0],Wr[1]);g.stroke();g.lineWidth=9;for(const q of T){g.beginPath();g.moveTo(Wr[0],Wr[1]);g.lineTo(q[0],q[1]);g.stroke()}
  g.strokeStyle=dark?'rgba(140,30,50,.4)':'rgba(255,110,130,.5)';g.lineWidth=4;g.beginPath();g.moveTo(-10,-14);g.lineTo(Wr[0]+6,Wr[1]-10);g.stroke();
  // the thumb claw
  g.fillStyle='#e8d0d4';g.strokeStyle='#060103';g.lineWidth=2.5;g.beginPath();g.moveTo(Wr[0]-12,Wr[1]-4);g.quadraticCurveTo(Wr[0]-10,Wr[1]-60,Wr[0]+22,Wr[1]-76);g.quadraticCurveTo(Wr[0]+2,Wr[1]-46,Wr[0]+12,Wr[1]-4);g.closePath();g.fillStyle='#1a060c';g.fill();g.stroke();g.restore()}
 // ---------- the Regent's outfit: p1 the high crimson collar and the pact vest, p2 the horns, p3 the wings
 const dress={
  back(g,J){const k=J.k.p3||0;if(k<=0)return;const S=J.rot(-24,-330),w=J.wnd,fl=g.getTransform().a<0;wing(g,J.rot(10,-336),1,k,J.t+1.3,w,.78,1);wing(g,S,-1,k,J.t,w,fl?.78:.85,0,fl?.3:0)},
  torso(g,J){const k=J.k.p1||0;if(k<=0)return;const e=ease(k);g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);g.globalAlpha=Math.min(1,k*2);
   // the vest: near-black with crimson panels and lacing, a ruby at the throat
   const V=new Path2D();V.moveTo(-96,-380);V.lineTo(-30,-396);V.lineTo(8,-250);V.lineTo(48,-396);V.lineTo(98,-376);V.bezierCurveTo(86,-280,72,-190,66,-112);V.lineTo(-74,-112);V.bezierCurveTo(-84,-200,-98,-290,-96,-380);V.closePath();
   const G=g.createLinearGradient(-100,0,100,0);G.addColorStop(0,'#14040a');G.addColorStop(.5,'#3a0814');G.addColorStop(1,'#20060e');g.fillStyle=G;g.fill(V);g.strokeStyle='#050103';g.lineWidth=3;g.stroke(V);
   g.save();g.clip(V);g.fillStyle=CRIM;g.beginPath();g.moveTo(-30,-396);g.lineTo(8,-250);g.lineTo(48,-396);g.lineTo(30,-396);g.lineTo(8,-300);g.lineTo(-12,-396);g.closePath();g.fill();
    g.strokeStyle=RED;g.lineWidth=5;for(let i=0;i<4;i++){const yy=-236+i*32;g.beginPath();g.moveTo(-40,yy);g.lineTo(40,yy+18);g.moveTo(40,yy);g.lineTo(-40,yy+18);g.stroke()}
    g.fillStyle='rgba(255,255,255,.18)';const gx=-200+((J.t*220)%560);g.beginPath();g.moveTo(gx,-400);g.lineTo(gx+30,-400);g.lineTo(gx-50,-100);g.lineTo(gx-80,-100);g.closePath();g.fill();g.restore();
   g.strokeStyle='#8a1428';g.lineWidth=6;g.beginPath();g.moveTo(-74,-114);g.lineTo(66,-114);g.stroke();
   // the high collar, standing behind the head: dark outside, crimson within, flaring into points
   g.translate(0,(1-e)*40);const cs=.3+.7*e;
   // each side: a stiff fan, black outside, crimson within, stitched at the edge, three points at the top
   for(const[s,h,x0,wd]of[[-1,230,-50,190],[1,170,36,150]]){const by=-388,P=new Path2D(),pt=(u,v)=>[x0+s*wd*u*cs,by-h*v*cs];const Q=[pt(0,0),pt(.55,.06),pt(1,.3),pt(1.1,1),pt(.86,.8),pt(.7,1.08),pt(.5,.82),pt(.3,.98),pt(.18,.55),pt(.06,.2)];
    P.moveTo(Q[0][0],Q[0][1]);P.quadraticCurveTo(Q[1][0],Q[1][1]+10,Q[2][0],Q[2][1]);P.quadraticCurveTo(Q[2][0]+s*30*cs,(Q[2][1]+Q[3][1])/2,Q[3][0],Q[3][1]);for(let i=4;i<8;i++)P.lineTo(Q[i][0],Q[i][1]);P.quadraticCurveTo(Q[8][0],Q[8][1],Q[9][0],Q[9][1]);P.closePath();
    const G2=g.createLinearGradient(x0,by,x0+s*wd,by-h);G2.addColorStop(0,'#24040c');G2.addColorStop(.45,'#6a0a1a');G2.addColorStop(1,'#a8142a');g.fillStyle=G2;g.fill(P);
    // the dark outer face shows along the rim
    g.save();g.clip(P);g.strokeStyle='#14030a';g.lineWidth=26;g.stroke(P);g.restore();g.strokeStyle='#050103';g.lineWidth=3;g.stroke(P);
    g.strokeStyle='rgba(255,90,110,.75)';g.lineWidth=2.5;g.setLineDash([10,8]);g.beginPath();const I=[pt(.12,.12),pt(.9,.34),pt(.98,.9)];g.moveTo(I[0][0],I[0][1]);g.quadraticCurveTo(pt(.7,.12)[0],pt(.7,.12)[1],I[1][0],I[1][1]);g.lineTo(I[2][0],I[2][1]);g.stroke();g.setLineDash([]);
    g.strokeStyle='rgba(10,2,6,.55)';g.lineWidth=3;for(const u of[.35,.6,.85]){const a=pt(u*.4,.1),b=pt(u,.9);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}}
   // shoulder mantle points
   for(const[sx,sy0,s,sc]of[[-130,-376,-1,1],[104,-376,1,.8]]){g.save();g.translate(sx,sy0);g.scale(s*sc*e,sc*e);g.fillStyle='#1a050c';g.strokeStyle='#050103';g.lineWidth=3;g.beginPath();g.moveTo(-40,-20);g.quadraticCurveTo(30,-50,80,-10);g.lineTo(70,40);g.lineTo(50,20);g.lineTo(34,56);g.lineTo(14,28);g.lineTo(-6,60);g.lineTo(-30,20);g.closePath();g.fill();g.stroke();g.strokeStyle=CRIM;g.lineWidth=5;g.beginPath();g.moveTo(-34,-14);g.quadraticCurveTo(30,-42,76,-8);g.stroke();g.restore()}
   g.restore()},
  front(g,J){const k=J.k.p1||0;if(k<=0)return;const e=ease(k);const n=J.rot(-2,-410);g.save();g.translate(n[0],n[1]);g.rotate(J.lean);g.globalAlpha=Math.min(1,k*2);
   // the band of the collar at the throat and the ruby that closes it
   g.fillStyle='#2a0610';g.strokeStyle='#0a0205';g.lineWidth=3;g.beginPath();g.moveTo(-56,6);g.quadraticCurveTo(0,26,52,4);g.lineTo(48,-26);g.quadraticCurveTo(0,-8,-52,-24);g.closePath();g.fill();g.stroke();g.strokeStyle=CRIM;g.lineWidth=4;g.beginPath();g.moveTo(-54,-20);g.quadraticCurveTo(0,-2,50,-22);g.stroke();
   const r=22*e;g.fillStyle='#3a0610';g.beginPath();g.moveTo(0,-r*.2);g.lineTo(r*.9,r*.5);g.lineTo(0,r*1.9);g.lineTo(-r*.9,r*.5);g.closePath();g.fill();g.stroke();g.fillStyle=RED;g.beginPath();g.moveTo(0,r*.1);g.lineTo(r*.6,r*.55);g.lineTo(0,r*1.5);g.lineTo(-r*.6,r*.55);g.closePath();g.fill();g.fillStyle='#ffd0d8';g.beginPath();g.ellipse(-r*.18,r*.45,r*.14,r*.24,-.5,0,TAU);g.fill();
   g.globalCompositeOperation='lighter';g.globalAlpha=.4*e*(.7+.3*sin(J.t*4));const RG=g.createRadialGradient(0,r*.7,0,0,r*.7,r*2.6);RG.addColorStop(0,'rgba(255,48,72,.9)');RG.addColorStop(1,'rgba(255,48,72,0)');g.fillStyle=RG;g.fillRect(-r*3,-r*2,r*6,r*6);g.restore()},
  head(g,J){const k=J.k.p2||0;if(k<=0)return;const e=ease(k),yw=J.yaw==null?.34:J.yaw,X=th=>100*sin(th+yw);g.save();
   // two dark horns, sweeping up and back, crimson at the tips
   for(const[th,sc,dk]of[[-.95,.82,1],[.72,1,0]]){const x0=X(th),y0=-112-(dk?4:0);g.save();g.translate(x0,y0);g.scale(sc,sc);horn(g,[[0,0],[24,-90],[-24,-180],[-150,-196]],58,e,dk?'#08020a':'#14040c',dk?'#220610':'#3a0a16',dk?'#6a0c1c':'#c01a30',dk?0:RED);g.restore()}
   // the eyes glow
   g.globalCompositeOperation='lighter';for(const th of[-.44,.44]){const ex=X(th),RG=g.createRadialGradient(ex,18,0,ex,18,44);RG.addColorStop(0,'rgba(255,40,64,'+(.38*e)+')');RG.addColorStop(1,'rgba(255,40,64,0)');g.fillStyle=RG;g.fillRect(ex-44,-26,88,88)}g.restore()}};
 EVC1.add('demon',{
  pal:[RED,'#2a0410',PINK],eye:'#ff2a40',
  C:{coat:'#2c1019',dark:'#1a070e',trim:'#c0182e',inner:'#4a0814',boot:'#1a080c',glove:'#2a0a12',leg:'#22101a',scarf:null,coatLen:.92},
  wl:860,dress,pieces:['chest',[-190,-1630,.95],[-40,-1120,.64]],
  // the iris: a slit pupil and a thin burning ring with inward fangs
  glyph(g,cx,cy,rx,ry,k,t){g.globalAlpha=k;g.fillStyle='#b8102a';g.beginPath();g.ellipse(cx,cy,rx*.5,ry*.56,0,0,TAU);g.fill();g.fillStyle='#120206';g.beginPath();g.moveTo(cx,cy-ry*.86);g.quadraticCurveTo(cx+rx*.2,cy,cx,cy+ry*.86);g.quadraticCurveTo(cx-rx*.2,cy,cx,cy-ry*.86);g.fill();
   g.globalCompositeOperation='lighter';g.strokeStyle='#ff6a7a';g.lineWidth=rx*.05;g.globalAlpha=k*(.6+.3*sin(t*5));g.beginPath();g.ellipse(cx,cy,rx*.72,ry*.72,0,0,TAU);g.stroke();g.fillStyle='#ff8a96';for(let i=0;i<10;i++){const a=i*TAU/10+t*.3,c=cos(a),s=sin(a);g.beginPath();g.moveTo(cx+c*rx*.72-s*rx*.05,cy+s*ry*.72+c*ry*.05);g.lineTo(cx+c*rx*.56,cy+s*ry*.56);g.lineTo(cx+c*rx*.72+s*rx*.05,cy+s*ry*.72-c*ry*.05);g.closePath();g.fill()}},
  sky:[[0,'#07030f'],[.3,'#170614'],[.56,'#3a0712'],[.69,'#8a1020'],[.735,'#ff7a52'],[.76,'#5a0c14'],[.8,'#1c050b'],[1,'#060104']],
  plate(x,R,P){const{W,H,glow}=P;
   // the light: a low crimson dusk on the left horizon, a fainter one far right
   glow(x,420,770,1000,'#ff2a30',.5);glow(x,420,780,340,'#ffb090',.55);glow(x,1620,760,620,'#a01028',.35);
   // heavy cloud banks with broken, lumpy edges, lit from beneath
   for(let i=0;i<7;i++){const cy=100+i*82+R()*50,cx=(i*.37%1)*W+(R()-.5)*240,w=200+R()*340,h=22+R()*44,B=[];for(let j=0;j<3;j++)B.push([cx+(j-1)*w*.6+(R()-.5)*80,cy+(R()-.5)*h*.7,w*(.4+R()*.3),h*(.55+R()*.7)]);
    x.globalAlpha=.55+R()*.3;x.fillStyle=i%3?'#1c050b':'#2e0711';for(const b of B){x.beginPath();x.ellipse(b[0],b[1],b[2],b[3],0,0,TAU);x.fill()}for(let j=0;j<7;j++){x.beginPath();x.arc(cx+(R()-.5)*w*1.5,cy-h*.35+R()*h*.3,h*(.45+R()*.6),0,TAU);x.fill()}
    x.globalAlpha=.18+(cy/700)*.4;x.strokeStyle='#ff6a5a';x.lineWidth=3;x.lineCap='round';for(const b of B){x.beginPath();x.ellipse(b[0],b[1],b[2]*.9,b[3],0,.45,PI-.45);x.stroke()}}x.globalAlpha=1;
   // far: the broken chains of the old pact, hanging from nowhere
   for(const[x0,y0,x1,y1,sag,lk,al]of[[150,-40,330,470,40,52,.95],[300,-40,250,320,-20,40,.75],[1620,-40,1760,520,-50,54,.95],[1840,-40,1700,300,30,38,.7],[600,-40,640,180,10,32,.6],[1350,-40,1310,200,-12,32,.6]]){x.globalAlpha=al;chain(x,x0,y0,x1,y1,sag,lk,'#24070e','rgba(255,96,96,.7)',1)}x.globalAlpha=1;
   // the far crags
   x.fillStyle='#2a0810';x.beginPath();x.moveTo(0,800);for(let X=0;X<=W;X+=30){const h=60+R()*90+(X<700?40*sin(X*.01):0);x.lineTo(X,780-h*(R()<.15?2:1))}x.lineTo(W,800);x.closePath();x.fill();
   // the Regent's distant seat on the far right ridge: a broken high-backed throne
   {const o=-340,T=[[1500,760],[1520,560],[1540,600],[1556,520],[1574,600],[1596,548],[1610,640],[1640,640],[1650,700],[1490,700],[1470,760]].map(q=>[q[0]+o,q[1]]);glow(x,1225,640,260,'#ff2a30',.3);x.fillStyle='#14040a';x.beginPath();T.forEach((q,i)=>x[i?'lineTo':'moveTo'](q[0],q[1]));x.closePath();x.fill();
    x.lineJoin='round';x.strokeStyle='rgba(255,64,80,.85)';x.lineWidth=3;x.beginPath();for(let i=1;i<9;i++)x[i>1?'lineTo':'moveTo'](T[i][0],T[i][1]);x.stroke();x.strokeStyle='rgba(255,170,160,.6)';x.lineWidth=1.5;x.beginPath();x.moveTo(T[1][0],T[1][1]);x.lineTo(T[2][0],T[2][1]);x.lineTo(T[3][0],T[3][1]);x.stroke()}
   // near crags, taller, at the edges
   x.fillStyle='#14040a';for(const[a,b,hm]of[[-40,520,1],[1460,1980,1.1]]){x.beginPath();x.moveTo(a,840);let X=a;while(X<b){X+=24+R()*40;const edge=Math.min(X-a,b-X)/(b-a),h=(80+R()*120+edge*420)*hm;x.lineTo(X,840-h)}x.lineTo(b,840);x.closePath();x.fill()}
   x.strokeStyle='rgba(255,70,70,.3)';x.lineWidth=2;
   // blood crystals breaking out of the ground, glowing at the edges
   const crystal=(X,Y,h,w,a)=>{x.save();x.translate(X,Y);x.rotate(a);const G=x.createLinearGradient(-w,0,w,0);G.addColorStop(0,'#1a040a');G.addColorStop(.45,'#5a0a18');G.addColorStop(.52,'#ff5a6a');G.addColorStop(.6,'#7a0e1e');G.addColorStop(1,'#24050c');x.fillStyle=G;x.beginPath();x.moveTo(-w,0);x.lineTo(-w*.8,-h*.8);x.lineTo(0,-h);x.lineTo(w*.8,-h*.78);x.lineTo(w,0);x.closePath();x.fill();x.strokeStyle='rgba(255,190,200,.7)';x.lineWidth=2;x.beginPath();x.moveTo(0,-h);x.lineTo(w*.1,0);x.stroke();x.restore()};
   for(const[cx,n,sz]of[[260,7,1],[1700,8,1.15],[760,3,.45],[1240,3,.5]]){glow(x,cx,840,260*sz,'#ff2a40',.22);for(let i=0;i<n;i++){const o=(i-(n-1)/2),h=(140+R()*200)*sz*(1-Math.abs(o)/n),w=(22+R()*20)*sz;crystal(cx+o*44*sz+R()*20,860,h,w,o*.16+(R()-.5)*.2)}}
   // the obsidian floor, glossy, a shallow crimson pool catching the dusk
   const G2=x.createLinearGradient(0,830,0,H);G2.addColorStop(0,'#2a0810');G2.addColorStop(.25,'#14050c');G2.addColorStop(1,'#050104');x.fillStyle=G2;x.fillRect(0,836,W,H-836);
   x.fillStyle='rgba(255,60,60,.08)';x.beginPath();x.ellipse(520,872,620,26,0,0,TAU);x.fill();x.fillStyle='rgba(255,140,120,.14)';for(let i=0;i<14;i++){x.fillRect(200+R()*700,850+R()*60,60+R()*240,2)}
   x.fillStyle='rgba(120,10,30,.4)';x.beginPath();x.ellipse(960,1010,760,70,0,0,TAU);x.fill();
   // glowing seams in the stone, running toward the viewer
   x.lineCap='round';for(let i=0;i<12;i++){let X=200+R()*1520,Y=850+R()*20;x.strokeStyle='rgba(255,48,72,.55)';x.lineWidth=2+R()*2;x.beginPath();x.moveTo(X,Y);for(let j=0;j<6;j++){X+=(X-960)*.25+(R()-.5)*80;Y+=20+j*14;x.lineTo(X,Y)}x.stroke()}
   // crimson mist along the horizon
   for(let i=0;i<10;i++){x.globalAlpha=.08+R()*.1;x.fillStyle='#ff4050';x.beginPath();x.ellipse(R()*W,800+R()*60,300+R()*400,18+R()*20,0,0,TAU);x.fill()}x.globalAlpha=1},
  aura(y,X,Y,k,t){if(k<=0)return;y.globalCompositeOperation='lighter';
   // crimson wisps curling up from the feet
   for(let i=0;i<10;i++){const s=(i%2?1:-1)*(110+((i*71)%6)*55),h=(300+((i*53)%5)*90)*k*(.8+.2*sin(t*2.6+i)),x0=X+s,wv=sin(t*1.7+i*1.3)*50+s*.25,w=10+(i%3)*5,G=y.createLinearGradient(0,Y,0,Y-h);G.addColorStop(0,'rgba(255,48,72,0)');G.addColorStop(.12,'rgba(255,48,72,.34)');G.addColorStop(.5,'rgba(176,20,44,.14)');G.addColorStop(1,'rgba(176,20,44,0)');y.fillStyle=G;y.beginPath();y.moveTo(x0-w,Y);y.bezierCurveTo(x0-w+wv*.3,Y-h*.4,x0+wv*1.1-w*.5,Y-h*.7,x0+wv*.9,Y-h);y.bezierCurveTo(x0+wv*1.1+w*.3,Y-h*.66,x0+wv*.3+w,Y-h*.35,x0+w,Y);y.closePath();y.fill()}
   y.globalCompositeOperation='source-over';
   // drops falling upward, and a slow ring of drops circling the waist
   const L=[],B=[];for(let i=0;i<46;i++){const q=(t*.45+i/46)%1,px=X+sin(i*5.7)*(220+i*6),py=Y-q*760*k;if(q<.92)L.push([px,py,4+(i%3)*1.6,PI/2,1.5])}
   for(let i=0;i<22;i++){const a=t*.9+i*TAU/22,px=X+cos(a)*340*k,py=Y-420+sin(a)*70;(sin(a)<0?B:L).push([px,py,6+(i%3)*2,a+PI/2,.6])}
   y.globalAlpha=Math.min(1,k*1.3)*.85;drops(y,B,'#7a0c1e');drops(y,L,'#e0203a','rgba(255,220,225,.85)');y.globalAlpha=1},
  sigil(y,k,t,R0){const base=y.globalAlpha,a0=base*Math.min(1,k*1.4);y.globalCompositeOperation='lighter';y.rotate(-t*.12);y.strokeStyle=RED;y.fillStyle=RED;
   for(const[f,w]of[[1,10],[.9,3],[.6,6],[.52,2]]){y.lineWidth=w;y.globalAlpha=a0;y.beginPath();y.arc(0,0,R0*f,0,TAU);y.stroke()}
   // a ring of chain links, snapped in three places
   const n=40;for(let i=0;i<n;i++){if(i%13==0||i%13==1)continue;const a=i*TAU/n,c=cos(a),s=sin(a),r=R0*.95;y.save();y.translate(c*r,s*r);y.rotate(a+PI/2);y.lineWidth=R0*.012+2;y.globalAlpha=a0*.85;y.beginPath();y.ellipse(0,0,R0*.052,i%2?R0*.024:R0*.009,0,0,TAU);y.stroke();y.restore()}
   // fangs pointing inward
   for(let i=0;i<24;i++){const a=i*TAU/24,c=cos(a),s=sin(a),n1=-s,m1=c,l=i%2?.12:.2;y.globalAlpha=a0*.9;y.beginPath();y.moveTo(c*R0*.9+n1*R0*.028,s*R0*.9+m1*R0*.028);y.lineTo(c*R0*(.9-l),s*R0*(.9-l));y.lineTo(c*R0*.9-n1*R0*.028,s*R0*.9-m1*R0*.028);y.closePath();y.fill()}
   // a whirl of crescents, like claw marks turning around a drop
   for(let i=0;i<6;i++){const a=i*TAU/6+t*.5;y.globalAlpha=a0*.85;y.beginPath();y.arc(cos(a)*R0*.2,sin(a)*R0*.2,R0*.26,a+.6,a+2.2);y.arc(cos(a)*R0*.24,sin(a)*R0*.24,R0*.24,a+2.1,a+.75,true);y.closePath();y.fill()}
   y.globalAlpha=a0;y.beginPath();y.arc(0,0,R0*.07,0,TAU);y.fill()},
  pose:{gather:{nh:[90,500],fh:[20,520],wa:.9,lean:.02},
   piece:{nh:[140,420],fh:[20,520],wa:1.0},
   hero:{nh:[240,160],fh:[60,230],wa:-.75,lean:-.06,nf:[-170,0],ff:[190,0]},
   windup:{nh:[-120,320],fh:[200,140],wa:2.6,lean:.22,py:80,nf:[-230,0],ff:[250,0]}},
  // the change: a fountain of blood flung up from the floor in spikes, around the feet
  burst(y,k,t,A){const R=A.sr(77);y.fillStyle='#2a0208';for(let i=0;i<16;i++){const s=i%2?1:-1,o=180+R()*560,h=(180+R()*300)*k*(1-o/900),x0=960+s*o,w=18+R()*16,lean=s*(.2+R()*.3);y.beginPath();y.moveTo(x0-w,1010);y.lineTo(x0+lean*h,1010-h);y.lineTo(x0+w,1010);y.closePath();y.fill()}
   const L=[];for(let i=0;i<80;i++){const a=-PI/2+(R()-.5)*2.6,v=(600+R()*900)*k,px=960+cos(a)*v,py=1000+sin(a)*v+600*k*k;L.push([px,py,4+R()*6,a,1])}drops(y,L,'#2a0208')},
  spark(x,c,A){const t=c.t,u=c.u,a=-.32+u*.06,X=L0(380,300,u),Y=650,L=c.m.ctx.wl0;A.view(x,c.C,1,y=>{const R=A.sr(5),D=[];for(let i=0;i<9;i++){const f=.25+i*.08,t0=.25+i*.09;if(t<t0)continue;const v=t-t0,px=X+cos(a)*L*f,py=Y+sin(a)*L*f+12+v*v*1400;D.push([px,py,5+R()*4,PI/2,.8+v*3])}drops(y,D,'#e0203a','rgba(255,220,225,.8)');
    for(let i=0;i<5;i++){const q=(t*.8+i*.2)%1;bat(y,1200+i*140+q*500,260+i*60-q*160,.7+i*.1,t*18+i,'#0a0206')}})},
  piece(x,c,A,i){const t=c.t;if(i==2){A.view(x,c.C,1,y=>{for(let j=0;j<12;j++){const q=(t*.9+j*.083)%1,px=L0(-120,2040,q)+((j*137)%300)-150,py=360+((j*211)%420)-q*160;if(Math.abs(px-960)<340&&py<620)continue;bat(y,px,py,.7+(j%3)*.25,t*20+j,'#0a0206')}})}
   else if(i==0&&t>.1&&t<.7){A.view(x,c.C,1,y=>{const R=A.sr(31),D=[];for(let j=0;j<40;j++){const a=R()*TAU,r=(1-(t-.1)/.6)*560+200,px=960+cos(a+t*2)*r,py=660+sin(a+t*2)*r*.3;D.push([px,py,5+R()*5,a+t*2+PI,2])}drops(y,D,'#e0203a')})}},
  windup(x,c,A){const t=c.t,k=A.ez(c.u);A.view(x,c.C,1,y=>{const R=A.sr(41),D=[],cx=780,cy=820;for(let j=0;j<70;j++){const a=R()*TAU,r=(1-((t*1.2+R())%1))*900+30,px=cx+cos(a)*r,py=cy+sin(a)*r*.7,sz=4+R()*5;if(Math.hypot(px-1120,py-400)<230)continue;D.push([px,py,sz,a+PI,3])}y.globalAlpha=.85;drops(y,D,'#ff3048');y.globalAlpha=1;A.glow(y,cx,cy,300*k,RED,.5*k)});A.rect(x,'#3a0010',.12)},
  // Crimson Verdict: a dash cuts a blood-red crescent; it bursts into a storm of drops; the storm comes home as spikes, then into the hero
  sig:{hits:[.4,1.25,2.0],draw(x,c,A){const{q}=A,t=c.t,h0=.4,h1=1.25,h2=2.0,R=A.sr(9);A.bg(x,c,t<h0?.45:.32);A.rect(x,'#2a0010',.2);if(t>h1)A.rect(x,'#000000',.22);
   // the crescent is a low arch across the whole land, cut left to right; the storm turns about a point above it
   const CX=760,CY=1250,CR=760,ca0=-2.62,ca1=-.72,SX=820,SY=640,TX=1162,TY=982;
   A.view(x,c.C,1,y=>{
    if(t>h0&&t<h1+.06){const draw=A.eo((t-h0)/.12),a1=L0(ca0,ca1,draw),fade=t>h1?1-(t-h1)/.06:1,pul=1+.04*sin(t*30);
     A.glow(y,CX+cos(-1.57)*CR,CY-CR+120,700,RED,.4*fade);
     const tb=.98;A.crescent(y,CX,CY,CR,ca0,a1,240*pul,'#6a0616',fade,0);A.crescent(y,CX,CY,CR+30,ca0,a1,150*pul,RED,fade,1);A.crescent(y,CX,CY,CR+54,ca0+.08,a1,46,'#ffd0d8',fade*.85,0);if(t>tb){const g=A.ez((t-tb)/(h1-tb)),n=7;for(let i=1;i<n;i++){const a=L0(ca0,ca1,i/n)+(i%2?.012:-.012),w=.004+g*.014,hw=sin(i/n*PI)*96+8,r1=CR+16-hw,r2=CR+16+hw;const rm=CR+16,P=(r,b)=>[CX+cos(b)*r,CY+sin(b)*r],e1=P(r1+6,a),e2=P(r2-6,a),m1=P(rm,a-w*1.6),m2=P(rm,a+w*1.6),mc=P(rm,a);y.save();y.globalCompositeOperation='lighter';const G=y.createLinearGradient(m1[0],m1[1],m2[0],m2[1]);G.addColorStop(0,'rgba(255,48,72,0)');G.addColorStop(.3,'rgba(255,150,170,.85)');G.addColorStop(.5,'rgba(255,255,255,1)');G.addColorStop(.7,'rgba(255,150,170,.85)');G.addColorStop(1,'rgba(255,48,72,0)');y.fillStyle=G;y.beginPath();y.moveTo(e1[0],e1[1]);y.lineTo(m1[0],m1[1]);y.lineTo(e2[0],e2[1]);y.lineTo(m2[0],m2[1]);y.closePath();y.fill();y.strokeStyle='rgba(255,235,240,'+(.9*g)+')';y.lineWidth=2+3*g;y.beginPath();y.moveTo(e1[0],e1[1]);y.lineTo(e2[0],e2[1]);y.stroke();y.restore();A.glow(y,mc[0],mc[1],90+70*g,PINK,.6*g);A.sparks(y,60+i,t-tb,mc[0],mc[1],9,700,'#ffd0d8',.35,500)}}
     if(draw<1){const e=[CX+cos(a1)*(CR+30),CY+sin(a1)*(CR+30)];A.glow(y,e[0],e[1],260,PINK,.9);A.glow(y,e[0],e[1],70,'#ffffff',1)}
     // it bleeds: drops run off its lower edge
     const Dr=[];for(let i=0;i<34;i++){const u=(i+.5)/34,a=L0(ca0,ca1,u),t0=h0+.1+u*.12;if(t<t0||u>draw)continue;const v=t-t0,px=CX+cos(a)*(CR-70)+((i*37)%11-5),py=CY+sin(a)*(CR-70)+v*v*1100+v*80;Dr.push([px,py,5+(i%4)*2.4,PI/2,1+v*5])}drops(y,Dr,'#d01a32','rgba(255,220,225,.7)');
     // then it splits into shards, light leaking between them
     }
    // the storm: the crescent bursts into drops that turn about the sky, then all fall to the dagger
    if(t>=h1){const v=t-h1,conv=t>h2?A.ei(cl((t-h2)/.28,0,1)):0,L=[],L2=[];
     for(let i=0;i<300;i++){const u=R(),a=L0(ca0,ca1,u),rr=CR+30+(R()-.5)*200,p0x=CX+cos(a)*rr,p0y=CY+sin(a)*rr,dx=p0x-SX,dy=(p0y-SY)/.7,a0=Math.atan2(dy,dx),r0=Math.hypot(dx,dy),sw=.9+R()*1.1,out=R()*700,sz=4+R()*R()*14,
       ang=a0-sw*(1-Math.exp(-v*1.3))*1.9,r=r0*(.62+.5*(1-Math.exp(-v*2.4)))+out*(1-Math.exp(-v*3))*.5,px=SX+cos(ang)*r,py=SY+sin(ang)*r*.7,lag=R()*.12,cv=cl((conv-lag)/(1-lag),0,1),
       fx=L0(px,TX+(R()-.5)*30,cv*cv),fy=L0(py,TY,cv*cv),dir=cv>0?Math.atan2(TY-py,TX-px):ang-PI/2;
      if(cv>=1)continue;(sz>9?L2:L).push([fx,fy,sz*(1-cv*.5),dir,1.2+Math.min(3,v*2)+cv*6])}
     drops(y,L2,'#a8102a','rgba(255,200,210,.9)');drops(y,L,'#ff2a44','rgba(255,220,225,.8)');
     if(t<h1+.32){const k=(t-h1)/.32;A.glow(y,SX,SY+120,1100*A.eo(k)+100,PINK,.75*(1-k))}A.sparks(y,91,v,SX,SY+300,60,1500,'#ff6a7a',.8,300)}
    // the last hit: spikes of blood out of the floor, running both ways from the dagger
    if(t>h2){const v=t-h2,R2=A.sr(23);for(let i=0;i<18;i++){const s=i%2?1:-1,o=90+(i>>1)*92,td=o/2200,k2=A.eo(cl((v-td-.04)/.1,0,1))*(1-A.ei(cl((v-.45-td)/.3,0,1))),h=(430-o*.42+R2()*80)*k2,x0=TX+s*o,w=22+R2()*14,ln=s*(.18+R2()*.2);if(h<=2)continue;
      const G=y.createLinearGradient(0,1008,0,1008-h);G.addColorStop(0,'#2a0410');G.addColorStop(.6,'#a8102a');G.addColorStop(1,'#ff6a7a');y.fillStyle=G;y.beginPath();y.moveTo(x0-w,1008);y.quadraticCurveTo(x0-w*.3+ln*h*.5,1008-h*.6,x0+ln*h,1008-h);y.quadraticCurveTo(x0+w*.4+ln*h*.5,1008-h*.5,x0+w,1008);y.closePath();y.fill();y.strokeStyle='rgba(255,60,84,.9)';y.lineWidth=3;y.beginPath();y.moveTo(x0+ln*h,1008-h);y.quadraticCurveTo(x0+w*.4+ln*h*.5,1008-h*.5,x0+w,1008);y.stroke()}
     A.sparks(y,57,v,TX,995,50,1300,'#ff5a6a',.7,1600);A.glow(y,TX,990,520*(1-v*.8),RED,.7*(1-v/.8))}
    // the hero
    const hd={yaw:.3,eye:{open:.72,angry:.75},brow:{angry:.85},mouth:{open:.2,smile:-.2}};
    if(t<h0){const u=A.ez(t/h0);A.hero(c,y,560,1000,.5,{nh:[-180,300],fh:[160,160],wa:2.7,lean:.24+u*.06,py:90+u*40,nf:[-250,0],ff:[260,0],hd},{wind:.9,act:{rim:[RED,1,-8,-3]}});A.speedLines(y,560,640,23,t,'rgba(255,120,130,.8)',.45,40,300);
     // drops race in to the blade
     const Dc=[],hx=560-48,hy=1000-(1000-300)*.5*.2;for(let i=0;i<50;i++){const a=R()*TAU,r=(1-((t*1.6+R())%1))*600+20;Dc.push([hx+cos(a)*r,hy+sin(a)*r*.7,3+R()*4,a+PI,2.5])}drops(y,Dc,'#ff3048')}
    else if(t<h1){const d=A.eo((t-h0)/.12),X=L0(560,1300,d);if(d<1){for(let j=1;j<=3;j++)A.hero(c,y,X-j*130*(1-d*.6),1000,.5,{nh:[440,140],fh:[-240,240],wa:-.35,lean:.34,py:120,nf:[-330,0],ff:[320,0],hd},{wind:1,act:{sil:1,silC:RED,a:.4/j}})}
     const u=A.ez((t-h0-.12)/.5);A.hero(c,y,X,1000,.5,{nh:[L0(440,480,u),L0(140,240,u)],fh:[-260,220],wa:L0(-.35,.2,u),lean:.32,py:L0(130,110,u),nf:[-330,0],ff:[320,0],hd:Object.assign({},hd,{mouth:{open:.45,smile:-.3}})},{wind:1,act:{rim:[PINK,1,-8,-3]}})}
    else if(t<h2){const u=A.ez((t-h1)/.35);A.hero(c,y,1300-u*80,1000,.5,{nh:[L0(200,360,u),L0(100,40,u)],fh:[L0(-200,-120,u),L0(260,330,u)],wa:L0(.8,-.15,u),lean:L0(.2,.06,u),py:L0(80,30,u),nf:[-200,0],ff:[230,0],hd:{yaw:.18,eye:{open:.85,angry:.55},brow:{angry:.6},mouth:{open:.05,smile:.3}}},{f:-1,wind:.8,act:{rim:[RED,1,8,-3]}})}
    else{const u=A.eo((t-h2+.08)/.14),k3=t>2.25?A.ez((t-2.25)/.5):0;A.hero(c,y,1200,1000,.5,{nh:[L0(160,360,u),L0(200,500,u)],fh:[L0(-200,-260,u),L0(160,120,u)],wa:L0(1,.85,u),lean:L0(.1,.3,u),py:L0(40,200,u),nf:[-300,0],ff:[230,-10],hd:{yaw:.24,eye:{open:.9,angry:.6},brow:{angry:.7},mouth:{open:.08,smile:.15+.2*k3}}},{f:-1,wind:.9,act:{rim:[k3>0?PINK:RED,1,8,-3]}});if(k3>0)A.glow(y,TX,990,260,RED,.5*(1-k3*.6))}
   });
   if(A.lit(t,h0,.07)||A.lit(t,h1,.06)||A.lit(t,h2,.06))A.impact(x);if(t>h1&&t<h1+.2)A.rect(x,PINK,.45*(1-(t-h1)/.2))}}
 })})()}catch(e){console.error('EVC demon',e)}
