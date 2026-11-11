// ===== Druid evolution cinematic: Elder Wildheart. An old-growth glade at sundown; leaves spiral up; a phyllotaxis seed-spiral grows on the moss; a leaf capelet, branching antlers in bloom, a living moss cloak;
// Rootwake: the staff is driven into the earth, a wave of giant roots erupts across the ground, the greatest one arcs over, and every root bursts into flower. =====
try{(()=>{const F=()=>FILM1,sin=Math.sin,cos=Math.cos,TAU=6.2832,PI=Math.PI;
 const LEAF='#9aff7a',MOSS='#3f7a2a',DEEP='#1a4a1a',WOOD='#6a4626',BARK='#3a2414',ROSE='#ff7aa8',CREAM='#fff4b0',INK='#1a1408';
 const hh=i=>{const v=sin(i*12.9898+7.3)*43758.5453;return v-Math.floor(v)};
 function ease(k){k=k<0?0:k>1?1:k;return 1-Math.pow(1-k,3)}function lerp0(a,b,k){return a+(b-a)*k}const cl0=(v,a,b)=>v<a?a:v>b?b:v;
 // one leaf: base at x,y, pointing along a; two-tone with a midrib
 function leaf(g,x,y,a,len,w,c1,c2,ln){if(len<=1)return;g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.42,-w,len,0);g.quadraticCurveTo(len*.42,w,0,0);g.closePath();g.fillStyle=c1;g.fill();if(ln){g.strokeStyle=ln;g.lineWidth=Math.max(1,w*.14);g.stroke()}g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.42,w*.05,len,0);g.quadraticCurveTo(len*.42,w,0,0);g.closePath();g.fillStyle=c2;g.fill();g.strokeStyle=ln||'rgba(20,40,10,.5)';g.lineWidth=Math.max(.8,w*.08);g.beginPath();g.moveTo(len*.05,0);g.lineTo(len*.9,0);g.stroke();g.restore()}
 // a wild rose: five round petals in two rings, a gold heart. k opens it.
 function flower(g,x,y,r,k,a,pc,pc2){if(k<=0||r<=0)return;r*=k;g.save();g.translate(x,y);g.rotate(a);g.fillStyle=pc;g.strokeStyle='rgba(120,20,60,.55)';g.lineWidth=Math.max(1,r*.06);for(let i=0;i<5;i++){const b=i*TAU/5;g.beginPath();g.ellipse(cos(b)*r*.55,sin(b)*r*.55,r*.56,r*.46,b,0,TAU);g.fill();g.stroke()}g.fillStyle=pc2||'#ffd0e0';for(let i=0;i<5;i++){const b=i*TAU/5+.63;g.beginPath();g.ellipse(cos(b)*r*.26,sin(b)*r*.26,r*.3,r*.24,b,0,TAU);g.fill()}g.fillStyle='#ffe27a';g.beginPath();g.arc(0,0,r*.2,0,TAU);g.fill();g.fillStyle='#b8862a';for(let i=0;i<6;i++){const b=i*1.047;g.beginPath();g.arc(cos(b)*r*.13,sin(b)*r*.13,r*.04,0,TAU);g.fill()}g.restore()}
 // a tapered branch stroke: a list of points, width w0 at the base to w1 at the tip
 function branch(g,pts,w0,w1,col,ln){for(let pass=0;pass<2;pass++){g.strokeStyle=pass?col:ln;g.lineCap='round';for(let i=1;i<pts.length;i++){const u=(i-.5)/(pts.length-1);g.lineWidth=lerp0(w0,w1,u)+(pass?0:5);g.beginPath();g.moveTo(pts[i-1][0],pts[i-1][1]);g.lineTo(pts[i][0],pts[i][1]);g.stroke()}}}
 const qb=(a,b,c,s)=>{const m=1-s;return[m*m*a[0]+2*m*s*b[0]+s*s*c[0],m*m*a[1]+2*m*s*b[1]+s*s*c[1]]};
 // ---------- the outfit
 const dress={
  // p3: the moss cloak. Leaf scales, a hem of big leaves, roses and trailing vines
  back(g,J){const k=J.k.p3||0;if(k<=0)return;const e=ease(k),w=J.wnd,t=J.t,A=J.rot(-128,-388),B=J.rot(98,-388),len=lerp0(220,1080,e),sw=sin(t*1.7)*26+w*520+150*(1-e),bx=A[0]-90-sw,by=A[1]+len,hw=(360*e+90)*(1+.45*(1-e));
   const p=new Path2D();p.moveTo(A[0],A[1]);p.bezierCurveTo(A[0]-70-sw*.2,A[1]+len*.3,bx-40,by-len*.35,bx-70,by);const N=7;for(let i=0;i<N;i++){const u0=i/N,u1=(i+1)/N,xa=bx-70+u0*hw,xb=bx-70+u1*hw,dip=34+(i%2)*22;p.quadraticCurveTo((xa+xb)/2,by+dip*1.9,xb,by-(i%2?6:0))}p.bezierCurveTo(bx-70+hw+40,by-len*.4,B[0]+40-sw*.1,B[1]+len*.3,B[0],B[1]);p.closePath();
   const G=g.createLinearGradient(0,A[1],0,by);G.addColorStop(0,'#4f8a36');G.addColorStop(.45,'#2c5e26');G.addColorStop(1,'#14301a');g.fillStyle=G;g.fill(p);g.strokeStyle='#0c1e0c';g.lineWidth=3;g.stroke(p);
   // deep folds, then moss and leaves gathered in loose drifts (not rows), denser toward the hem
   g.save();g.clip(p);for(let i=0;i<4;i++){const v=(i+.7)/4.4,x0=lerp0(A[0],B[0],v),x1=lerp0(bx-70,bx-70+hw,v);g.strokeStyle='rgba(6,20,8,.45)';g.lineWidth=26;g.beginPath();g.moveTo(x0,A[1]+30);g.bezierCurveTo(x0-sw*.1,A[1]+len*.4,x1-sw*.05+10,by-len*.3,x1,by+30);g.stroke();g.strokeStyle='rgba(154,255,122,.10)';g.lineWidth=10;g.beginPath();g.moveTo(x0+22,A[1]+40);g.bezierCurveTo(x0+22-sw*.1,A[1]+len*.4,x1+30,by-len*.3,x1+24,by+20);g.stroke()}
   g.fillStyle='rgba(110,170,70,.35)';for(let i=0;i<14;i++){const v=hh(i*3+1),u=hh(i*7+2),X=lerp0(lerp0(A[0],B[0],u),lerp0(bx-70,bx-70+hw,u),v),Y=A[1]+len*v;g.beginPath();g.ellipse(X,Y,30+hh(i)*30,12+hh(i+4)*8,hh(i+5)-.5,0,TAU);g.fill()}
   for(let i=0;i<34;i++){const v=Math.pow(hh(i*5+3),.6),u=hh(i*11+7),X=lerp0(lerp0(A[0],B[0],u),lerp0(bx-70,bx-70+hw,u),v),Y=A[1]+len*v,lf=(30+len*.04)*(.7+.6*hh(i+9));const c=i%5;leaf(g,X,Y,PI/2+(hh(i+13)-.5)*1.6+sin(t*1.3+i)*.08,lf,lf*.4,c==0?'#6ab84a':c<3?'#3f7a2a':'#2a5a24',c==0?'#8ad860':c<3?'#5aa03a':'#1e4420','rgba(8,24,8,.55)')}
   g.restore();
   // hem leaves and trailing vines
   for(let i=0;i<9;i++){const u=(i+.5)/9,X=bx-70+u*hw,Y=by+18+(i%2)*14,a=PI/2+.25-u*.2+sin(t*2.1+i)*.12+w*.3;leaf(g,X,Y-10,a,(60+26*hh(i))*e,22*e,i%3?'#3f7a2a':'#6ab84a','#2a5a24','#0c1e0c')}
   g.strokeStyle='#2a4a1a';g.lineWidth=4;for(let i=0;i<3;i++){const X=bx-30+i*hw*.36,Y=by+20,L=(140+i*50)*e,s2=sin(t*1.8+i)*20+w*80;g.beginPath();g.moveTo(X,Y);g.quadraticCurveTo(X-s2*.5,Y+L*.5,X-s2,Y+L);g.stroke();for(let j=1;j<4;j++){const v=j/4;leaf(g,X-s2*v*v,Y+L*v,PI/2+(j%2?.9:-.9),26*e,10*e,'#5aa03a','#3f7a2a')}}
   flower(g,bx+hw*.18,by-40,30,e,t*.2,ROSE);flower(g,bx+hw*.62,by-10,24,e,1+t*.2,'#ffc0d8');flower(g,(A[0]+B[0])/2-60,A[1]+70,22,e,2,ROSE)},
  // p1: a bark vest laced with vine, a heartwood seed at the breast, a capelet of leaves over the shoulders
  torso(g,J){const k=J.k.p1||0;if(k<=0)return;const e=ease(k),t=J.t;g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);g.translate(0,(1-e)*-50);g.globalAlpha=Math.min(1,k*2);
   const V=new Path2D();V.moveTo(-112,-370);V.quadraticCurveTo(-30,-330,-6,-250);V.quadraticCurveTo(20,-330,96,-372);V.lineTo(84,-240);V.quadraticCurveTo(76,-170,66,-128);V.lineTo(-74,-128);V.quadraticCurveTo(-92,-200,-108,-250);V.closePath();
   const G=g.createLinearGradient(-110,0,100,0);G.addColorStop(0,'#3a2414');G.addColorStop(.5,'#6a4626');G.addColorStop(1,'#8a6036');g.fillStyle=G;g.fill(V);g.save();g.clip(V);g.strokeStyle='rgba(26,14,6,.6)';g.lineWidth=3;for(let i=0;i<9;i++){const X=-110+i*24;g.beginPath();g.moveTo(X,-380);g.bezierCurveTo(X+10,-320,X-10,-220,X+6,-120);g.stroke()}g.fillStyle='rgba(120,200,80,.35)';for(let i=0;i<6;i++){g.beginPath();g.ellipse(-90+i*34,-120-(i%2)*14,22,10,0,0,TAU);g.fill()}g.restore();g.strokeStyle=INK;g.lineWidth=3;g.stroke(V);
   // vine lacing up the front
   g.strokeStyle='#4a8a2a';g.lineWidth=5;g.beginPath();for(let i=0;i<=8;i++){const y=-136-i*13,x=-6+(i%2?-18:18)*(1-i/12);g[i?'lineTo':'moveTo'](x,y)}g.stroke();for(let i=0;i<4;i++)leaf(g,-6+(i%2?-18:18),-150-i*26,i%2?PI*.9:.25,24,9,'#6ab84a','#3f7a2a');
   // the heartwood seed
   const sx=-4,sy=-188;g.fillStyle='#2a1a0c';g.beginPath();g.ellipse(sx,sy,22,28,0,0,TAU);g.fill();const RG=g.createRadialGradient(sx-4,sy-6,2,sx,sy,22);RG.addColorStop(0,'#fffbd8');RG.addColorStop(.4,'#d8ff8a');RG.addColorStop(1,'#3a8a2a');g.fillStyle=RG;g.beginPath();g.ellipse(sx,sy,16,21,0,0,TAU);g.fill();g.globalAlpha=Math.min(1,k*2)*(.25+.15*sin(t*3));g.fillStyle=LEAF;g.beginPath();g.ellipse(sx,sy,30,36,0,0,TAU);g.fill();g.globalAlpha=Math.min(1,k*2);
   // the capelet: three tiers of leaves fanning out from the neckline
   for(let r=2;r>=0;r--){const n=9-r,y0=-392+r*30;for(let i=0;i<n;i++){const u=i/(n-1),X=lerp0(-120,104,u),a=PI/2+(u-.5)*1.5+sin(t*2+i+r)*.06,L=(78+r*10)*e;leaf(g,X,y0+Math.abs(u-.5)*30,a,L,L*.36,r?'#2f6a26':'#4a9a34',r?'#22521e':'#6ab84a','#0c1e0c')}}
   g.restore();
   // far shoulder: a small clutch of leaves
   for(let i=0;i<4;i++)leaf(g,J.FS[0]-10,J.FS[1]-10,-.2+i*.42,90*e,30*e,'#3f7a2a','#5aa03a','#0c1e0c')},
  // p1 too: the near shoulder's leaf pauldron with a bark boss and a rose, and a vine bracer winding the forearm
  front(g,J){const k=J.k.p1||0;if(k<=0)return;const e=ease(k),t=J.t,X=J.NS[0],Y=J.NS[1];for(let r=0;r<3;r++)for(let i=0;i<5;i++){const a=PI/2+(i-2)*.5+(r-1)*.1+sin(t*2+i)*.05,L=(150-r*30)*e;leaf(g,X+(i-2)*8,Y-30+r*22,a,L,L*.36,r==2?'#5aa03a':r?'#3f7a2a':'#2a5a24',r==2?'#7ad050':'#4a8a2a','#0c1e0c')}
   g.fillStyle='#5a3a20';g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.ellipse(X,Y-14,40*e,32*e,0,0,TAU);g.fill();g.stroke();g.strokeStyle='#3a2414';g.lineWidth=2;for(let i=1;i<3;i++){g.beginPath();g.ellipse(X,Y-14,40*e*i/3,32*e*i/3,0,0,TAU);g.stroke()}flower(g,X+24,Y-40,26,e,t*.3,ROSE);
   const A=J.nA;if(A){g.strokeStyle='#2a5a1a';g.lineWidth=7;g.beginPath();for(let i=0;i<=16;i++){const u=.15+i/16*.75,x=lerp0(A[0],A[2],u),y=lerp0(A[1],A[3],u),dx=A[2]-A[0],dy=A[3]-A[1],D=Math.hypot(dx,dy)||1,o=sin(u*22)*34*e;g[i?'lineTo':'moveTo'](x-dy/D*o,y+dx/D*o)}g.stroke();g.strokeStyle='#6ab84a';g.lineWidth=3;g.stroke();for(let i=0;i<4;i++){const u=.25+i*.18;leaf(g,lerp0(A[0],A[2],u),lerp0(A[1],A[3],u),-1+i*1.4,40*e,14*e,'#6ab84a','#3f7a2a','#0c1e0c')}}},
  // p2: antlers of living branch from the temples, with leaves and roses at their roots
  head(g,J){const k=J.k.p2||0;if(k<=0)return;const e=ease(k),sy=sin(J.yaw||.26),t=J.t,w=J.wnd;g.save();g.globalAlpha=Math.min(1,k*2.5);
   for(const s of[-1,1]){const bx=s*64+sy*34,by=-120,sc=s>0?.92:1,sw=sin(t*1.4+s)*4+w*10,L=e;
    const P0=[bx,by],C0=[bx+s*90*sc,by-95*L],P1=[bx+s*120*sc+sw,by-220*L*sc];const pts=[];for(let i=0;i<=7;i++)pts.push(qb(P0,C0,P1,i/7));
    // tines: each grows off the main beam, outward then up
    const tines=[[.38,s*1,.85,85],[.62,s*-.3,1,95],[.82,s*.9,.8,62]],tp=[];for(const[u,dir,hk,len]of tines){const b=qb(P0,C0,P1,u),Lt=len*cl0((e-u*.5)/.5,0,1)*sc;if(Lt<4)continue;const m=[b[0]+dir*Lt*.45,b[1]-Lt*.5],tip=[b[0]+dir*Lt*.6+sw,b[1]-Lt];tp.push([b,m,tip])}
    for(const[b,m,tip]of tp)branch(g,[b,m,tip],17,6,'#7a5430',INK);branch(g,pts,30,9,'#7a5430',INK);
    g.strokeStyle='rgba(255,230,180,.45)';g.lineWidth=3;g.beginPath();g.moveTo(pts[0][0]-s*6,pts[0][1]);for(const q of pts)g.lineTo(q[0]-s*6,q[1]);g.stroke();
    for(const[b,m,tip]of tp){leaf(g,tip[0],tip[1],-PI/2+s*.6+sin(t*2+tip[0])*.1,38*e,15*e,'#6ab84a','#3f7a2a','#0c1e0c');leaf(g,m[0],m[1],-PI/2-s*.9,30*e,12*e,'#5aa03a','#2f6a26','#0c1e0c')}
    leaf(g,P1[0],P1[1],-PI/2+s*.2,46*e,17*e,'#7ad050','#4a8a2a','#0c1e0c');
    for(let i=0;i<4;i++)leaf(g,bx,by+6,-PI/2+s*(.6+i*.45),58*e,20*e,i%2?'#3f7a2a':'#5aa03a',i%2?'#2a5a24':'#7ad050','#0c1e0c');
    flower(g,bx+s*8,by+4,s>0?22:28,e,t*.2+s,ROSE);if(s<0)flower(g,bx+s*34,by-12,16,e,1.3,'#fff0f6','#ffe0ea')}
   g.restore()}};
 // ---------- a root bursting from the ground: base x0,gy; full height H; dir (+1 arcs right); hook (0 upright .. 1 arcs over like a breaking wave); base width w; u = how much of it is out of the ground. Returns its outline and tip.
 const cb=(a,b,c,d,s)=>{const m=1-s;return[m*m*m*a[0]+3*m*m*s*b[0]+3*m*s*s*c[0]+s*s*s*d[0],m*m*m*a[1]+3*m*m*s*b[1]+3*m*s*s*c[1]+s*s*s*d[1]]};
 function rootPath(x0,gy,H,dir,hook,w,u,seed){const P0=[x0,gy],C1=[x0-dir*H*.14,gy-H*.5],C2=[x0+dir*H*(.16+hook*.34),gy-H*(1.02+hook*.12)],P3=[x0+dir*H*(.3+hook*.46),gy-H*(.95-hook*.38)],L=[],R=[],C=[];const N=18,sm=Math.max(.02,u);
  for(let i=0;i<=N;i++){const s=i/N*sm,p=cb(P0,C1,C2,P3,s),q=cb(P0,C1,C2,P3,Math.min(1,s+.01)),r0=cb(P0,C1,C2,P3,Math.max(0,s-.01)),dx=q[0]-r0[0],dy=q[1]-r0[1],D=Math.hypot(dx,dy)||1,nx=-dy/D,ny=dx/D,wd=(w*Math.pow(1-s*.9,.85)*(1+.12*sin(s*19+seed))+3)*Math.min(1,(sm-s)/.12*.85+.15);C.push([p[0],p[1],nx,ny,wd,s]);L.push([p[0]+nx*wd,p[1]+ny*wd]);R.push([p[0]-nx*wd,p[1]-ny*wd])}
  const pa=new Path2D();pa.moveTo(L[0][0],L[0][1]);for(const p of L)pa.lineTo(p[0],p[1]);const e=C[N];pa.quadraticCurveTo(e[0]+(e[0]-C[N-1][0])*2.2,e[1]+(e[1]-C[N-1][1])*2.2,R[N][0],R[N][1]);for(let i=R.length-1;i>=0;i--)pa.lineTo(R[i][0],R[i][1]);pa.closePath();return{pa,L,R,C,tip:[e[0],e[1]]}}
 function root(y,x0,gy,H,dir,hook,w,u,lit,dark,seed){if(u<=0)return null;seed=seed||0;const r=rootPath(x0,gy,H,dir,hook,w,u,seed),N=r.C.length-1;
  // rootlets first, so the root covers their bases
  if(!dark)for(const[s0,sd]of[[.3,1],[.52,-1],[.72,1]]){const i=Math.round(s0*N);if(r.C[i][5]<s0*.98)continue;const[cx,cy,nx,ny,wd]=r.C[i],o=sd*dir,L0=wd*2.4,pts=[[cx,cy],[cx+nx*o*L0*.6+dir*10,cy+ny*o*L0*.6-20],[cx+nx*o*L0+dir*30,cy+ny*o*L0+10]];branch(y,pts,wd*.38,4,'#4a2e16','#0a0603');leaf(y,pts[2][0],pts[2][1],Math.atan2(pts[2][1]-pts[1][1],pts[2][0]-pts[1][0]),40,15,'#6ab84a','#3f7a2a','#0c1e0c')}
  const b=r.C[0],G=y.createLinearGradient(b[0]-w,b[1]-w*.4,b[0]+w,b[1]+w*.4);G.addColorStop(0,dark?'#120a05':'#6a4426');G.addColorStop(.4,dark?'#1a1008':'#3e2412');G.addColorStop(1,dark?'#080402':'#1a0e06');y.fillStyle=G;y.fill(r.pa);
  if(!dark){// twisting bark grain, knots, a warm top edge, moss
   y.save();y.clip(r.pa);y.strokeStyle='rgba(12,6,2,.7)';y.lineWidth=5;for(let j=0;j<3;j++){y.beginPath();for(let i=0;i<=N;i++){const[cx,cy,nx,ny,wd,s]=r.C[i],o=sin(s*6+j*2.1+seed)*.75;y[i?'lineTo':'moveTo'](cx+nx*wd*o,cy+ny*wd*o)}y.stroke()}
   y.fillStyle='#140a04';for(const s0 of[.22,.47]){const i=Math.round(s0*N),C0=r.C[i];if(C0[5]<s0*.95)continue;y.beginPath();y.ellipse(C0[0]+C0[2]*C0[4]*.2,C0[1]+C0[3]*C0[4]*.2,C0[4]*.28,C0[4]*.16,Math.atan2(C0[3],C0[2]),0,TAU);y.fill()}
   y.strokeStyle='rgba(255,214,150,.3)';y.lineWidth=6;y.beginPath();for(let i=0;i<=N;i++){const[cx,cy,nx,ny,wd]=r.C[i];y[i?'lineTo':'moveTo'](cx+nx*wd*.78,cy+ny*wd*.78)}y.stroke();
   y.fillStyle='rgba(70,130,44,.9)';for(let i=1;i<N*.5;i+=4){const[cx,cy,nx,ny,wd]=r.C[i];y.beginPath();y.ellipse(cx+nx*wd*.7,cy+ny*wd*.7,wd*.55,wd*.2,Math.atan2(ny,nx)+1.57,0,TAU);y.fill()}y.restore()}
  y.strokeStyle='#0a0603';y.lineWidth=4;y.stroke(r.pa);
  if(lit){y.save();y.globalCompositeOperation='lighter';y.strokeStyle=LEAF;y.globalAlpha=lit;y.lineWidth=6;y.beginPath();for(let i=0;i<r.R.length;i++)y[i?'lineTo':'moveTo'](r.R[i][0],r.R[i][1]);y.stroke();y.restore()}
  return r}
 // earth thrown up where a root breaks through
 function clods(y,R,x0,gy,t,n,sp){if(t<0||t>1.2)return;y.fillStyle='#2a1a0e';y.strokeStyle='#0a0603';y.lineWidth=2;for(let i=0;i<n;i++){const a=-PI/2+(R()-.5)*2.2,v=sp*(.5+R()),s=8+R()*22,sp2=R()*6,X=x0+cos(a)*v*t,Y=gy+sin(a)*v*t+1400*t*t*.5;if(Y>gy+60)continue;y.save();y.translate(X,Y);y.rotate(t*sp2*3);y.beginPath();y.moveTo(-s,-s*.4);y.lineTo(-s*.2,-s);y.lineTo(s,-s*.3);y.lineTo(s*.6,s*.7);y.lineTo(-s*.6,s*.6);y.closePath();y.fill();y.stroke();y.restore()}}
 // ---------- the move: Rootwake
 const X0=470,GY=1000,H0=.42,H1=1.25,H2=1.95;
 const ROOTS=(()=>{const R=MOVIE1.kit.sr(77),o=[];for(let i=0;i<9;i++){const x=690+i*142+R()*50,dir=i%3==1?-1:1;o.push({x,dir,h:240+i*52+R()*120,hook:dir<0?.1+R()*.3:.2+R()*.8,w:38+i*3+R()*16,d:.06+i*.07,ph:R()*TAU})}return o})();
 const ROOTB=(()=>{const R=MOVIE1.kit.sr(78),o=[];for(let i=0;i<7;i++){const x=760+i*170+R()*60,dir=i%2?-1:1;o.push({x,dir,h:200+i*40+R()*100,hook:R()*.6,w:28+R()*12,d:.14+i*.07,ph:R()*TAU})}return o})();
 const BIG={x:1820,h:920,hook:.95,w:118};
 // the two that punch up on the first hit itself, right beside the planted staff
 const ROOT0=[{x:640,dir:1,h:590,hook:.6,w:72,ph:.7},{x:740,dir:1,h:500,hook:.45,w:66,ph:2.9}];
 EVC1.add('druid',{
  pal:['#9aff7a','#1a4a1a','#fff4b0'],eye:'#8af05a',
  C:{coat:'#3c5e2c',dark:'#24401e',trim:'#d6b25a',inner:'#efe2b8',boot:'#5a3c22',glove:'#7a5a36',leg:'#3a3020',scarf:null,coatLen:.5},
  wl:1350,wlClose:1400,dress,pieces:['chest',[260,-1480,1.15],[-160,-840,.64]],
  // the iris: the same seed spiral as the floor sigil, packed around the pupil and slowly turning, inside a fine ring
  glyph(g,cx,cy,rx,ry,k,t){g.globalCompositeOperation='lighter';const sy=ry/rx;g.strokeStyle='#c8ff9a';g.lineWidth=rx*.035;g.globalAlpha=k*.6;g.beginPath();g.ellipse(cx,cy,rx*.84,ry*.84,0,0,TAU);g.stroke();
   for(let i=8;i<44;i++){const a=i*2.39996+t*.4,r=rx*.82*Math.sqrt(i/44),s=rx*(.018+.03*i/44);g.globalAlpha=k*(.35+.6*i/44);g.fillStyle=i%3?'#d8ffb0':'#fff4b0';g.beginPath();g.ellipse(cx+cos(a)*r,cy+sin(a)*r*sy,s*1.5,s,a,0,TAU);g.fill()}},
  sky:[[0,'#06201c'],[.3,'#123a2c'],[.56,'#4a6a3a'],[.7,'#e0b868'],[.8,'#6a6a34'],[1,'#141e0e']],
  plate(x,R,P){const{W,H,glow,rgba}=P;
   // the low sun between the far trunks
   glow(x,420,640,760,'#ffd890',.7);glow(x,420,640,200,'#fff6d8',.95);
   // mist and far forest, three depths
   for(const[d,c,n,y0]of[[0,'#3a5a44',14,600],[1,'#284634',11,640],[2,'#18301f',8,690]]){x.fillStyle=c;for(let i=0;i<n;i++){const X=R()*W,w=18+R()*30+d*20;x.fillRect(X,80,w,y0+220-80);x.beginPath();x.moveTo(X-w*1.4,y0+220);x.quadraticCurveTo(X+w/2,y0+120,X+w*2.4,y0+220);x.fill()}
    for(let i=0;i<30;i++){const X=R()*W,Y=R()*220-40,r=80+R()*140;x.beginPath();x.ellipse(X,Y,r,r*.6,0,0,TAU);x.fill()}
    x.fillStyle='rgba(230,240,200,'+(.12-d*.03)+')';for(let i=0;i<4;i++){x.beginPath();x.ellipse(R()*W,y0+120+R()*80,300+R()*400,24+R()*20,0,0,TAU);x.fill()}}
   // light shafts slanting in from the sun side
   x.save();x.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const X=200+i*120+R()*80,G=x.createLinearGradient(X,0,X+700,900);G.addColorStop(0,'rgba(255,230,160,0)');G.addColorStop(.4,'rgba(255,230,160,.10)');G.addColorStop(1,'rgba(255,230,160,0)');x.fillStyle=G;x.beginPath();x.moveTo(X,80);x.lineTo(X+40+R()*40,80);x.lineTo(X+760,880);x.lineTo(X+640,880);x.closePath();x.fill()}x.restore();
   // the floor of the glade
   const G2=x.createLinearGradient(0,800,0,H);G2.addColorStop(0,'#5a7a3a');G2.addColorStop(.25,'#3a5a28');G2.addColorStop(1,'#132010');x.fillStyle=G2;x.beginPath();x.moveTo(0,H);x.lineTo(0,820);for(let i=0;i<=W;i+=60)x.lineTo(i,812+sin(i*.008)*10+sin(i*.031)*4);x.lineTo(W,H);x.closePath();x.fill();
   const LP=x.createRadialGradient(900,960,20,900,960,620);LP.addColorStop(0,'rgba(220,255,160,.32)');LP.addColorStop(1,'rgba(220,255,160,0)');x.save();x.translate(0,960);x.scale(1,.3);x.translate(0,-960);x.fillStyle=LP;x.fillRect(200,0,1500,2000);x.restore();
   // roots crossing the ground from the two great trees
   x.strokeStyle='#24180c';x.lineCap='round';for(const[sx,dir]of[[180,1],[1760,-1]])for(let i=0;i<4;i++){x.lineWidth=26-i*5;x.beginPath();x.moveTo(sx,840+i*10);x.bezierCurveTo(sx+dir*(160+i*60),850+i*30,sx+dir*(260+i*120),900+i*40,sx+dir*(380+i*150),940+i*50+R()*30);x.stroke()}
   // moss tufts, fallen leaves, small flowers
   for(let i=0;i<160;i++){const X=R()*W,Y=830+Math.pow(R(),1.4)*250,s=(Y-800)/250;x.fillStyle=R()<.5?'#6a9a3a':'#4a7a2a';x.beginPath();x.ellipse(X,Y,(8+R()*14)*(.5+s),(3+R()*4)*(.5+s),R()-.5,0,TAU);x.fill()}
   for(let i=0;i<40;i++){const X=R()*W,Y=840+R()*230;leaf(x,X,Y,R()*TAU,18+R()*16,6,R()<.4?'#c8a040':'#8a6a2a','#a07a30')}
   for(let i=0;i<26;i++){const X=R()*W,Y=850+R()*200;flower(x,X,Y,6+R()*6,1,R()*6,R()<.5?'#ff9ac0':'#fff0f6')}
   // the two great trees framing the glade: trunks, buttress roots, moss, the sun's rim on their inner edges
   for(const[cx,dir]of[[120,1],[1800,-1]]){const tw=230;x.fillStyle='#22160c';x.beginPath();x.moveTo(cx-tw,0);x.lineTo(cx+tw,0);x.bezierCurveTo(cx+tw-20,400,cx+tw*.8,700,cx+tw+180,880);x.lineTo(cx-tw-180,880);x.bezierCurveTo(cx-tw*.8,700,cx-tw+20,400,cx-tw,0);x.closePath();x.fill();
    x.strokeStyle='rgba(8,4,2,.6)';x.lineWidth=5;for(let i=0;i<9;i++){const X=cx-tw+30+i*50;x.beginPath();x.moveTo(X,0);x.bezierCurveTo(X+20,300,X-20,600,X+(X-cx)*.8,870);x.stroke()}
    x.strokeStyle=dir>0?'rgba(255,214,140,.5)':'rgba(255,214,140,.22)';x.lineWidth=8;x.beginPath();x.moveTo(cx+dir*tw,0);x.bezierCurveTo(cx+dir*(tw-20),400,cx+dir*tw*.8,700,cx+dir*(tw+180),880);x.stroke();
    for(let i=0;i<22;i++){const Y=560+R()*320,X=cx+dir*(tw*.2+R()*tw*.9+(Y-560)*.4),r=14+R()*34;x.fillStyle=R()<.5?'#3f7a2a':'#5a9a34';x.beginPath();x.ellipse(X,Y,r,r*(.35+R()*.3),R()-.5,0,TAU);x.fill()}
    // glowing mushrooms at the roots
    for(let i=0;i<5;i++){const X=cx+dir*(tw+40+i*34),Y=880-i*6+R()*10,s=10+R()*12;x.fillStyle='#e8dcb0';x.fillRect(X-2,Y-s,4,s);x.fillStyle='#9affc8';x.beginPath();x.ellipse(X,Y-s,s*.9,s*.5,0,PI,0);x.fill();glow(x,X,Y-s,s*4,'#9affc8',.5)}}
   // the canopy overhead and the vines hanging from it
   x.fillStyle='#0a1a0e';for(let i=0;i<40;i++){const X=R()*W,Y=R()*90-30,r=90+R()*150;x.beginPath();x.ellipse(X,Y,r,r*.55,0,0,TAU);x.fill()}
   for(let i=0;i<12;i++){const X=R()*W,L=120+R()*320;x.strokeStyle='#14301a';x.lineWidth=4;x.beginPath();x.moveTo(X,40);x.quadraticCurveTo(X+20,40+L*.5,X-10,40+L);x.stroke();for(let j=1;j<6;j++)leaf(x,X+5,40+L*j/6,PI/2+(j%2?.8:-.8),26,10,'#1e4a22','#2a5a2a')}
   // ferns in the near corners
   for(const[fx,fy,dir]of[[60,1080,1],[1860,1080,-1],[330,1090,1],[1600,1095,-1]])for(let f=0;f<5;f++){const a=-PI/2+dir*(.2+f*.28),L=200+R()*120;x.strokeStyle='#14321a';x.lineWidth=4;const ex=fx+cos(a)*L,ey=fy+sin(a)*L*.8;x.beginPath();x.moveTo(fx,fy);x.quadraticCurveTo(fx+cos(a)*L*.6,fy+sin(a)*L*.4-60,ex,ey);x.stroke();for(let j=1;j<11;j++){const v=j/11,p=qb([fx,fy],[fx+cos(a)*L*.6,fy+sin(a)*L*.4-60],[ex,ey],v);for(const s of[-1,1])leaf(x,p[0],p[1],a+s*1.1+dir*.2,34*(1-v*.6),9,'#1e4a22','#2a6a2a')}}
   glow(x,960,1000,500,'#c8ff9a',.12)},
  // a spiral of leaves around the hero, roots curling from the moss at the feet, fireflies
  aura(y,X,Y,k,t){if(k<=0)return;
   y.save();y.globalCompositeOperation='lighter';const G=y.createRadialGradient(X,Y,10,X,Y,520);G.addColorStop(0,'rgba(154,255,122,'+(.35*k)+')');G.addColorStop(1,'rgba(154,255,122,0)');y.fillStyle=G;y.save();y.translate(X,Y);y.scale(1,.25);y.beginPath();y.arc(0,0,520,0,TAU);y.fill();y.restore();y.restore();
   // tendrils
   for(let i=0;i<8;i++){const s=i%2?1:-1,bx=X+s*(220+(i>>1)*70),h=(160+(i*37%5)*50)*ease(k*1.3-i*.04),sw=sin(t*1.6+i)*16;if(h<6)continue;y.strokeStyle='#14300e';y.lineWidth=12;y.lineCap='round';y.beginPath();y.moveTo(bx,Y+6);y.bezierCurveTo(bx+s*20,Y-h*.4,bx-s*40+sw,Y-h*.8,bx+s*10+sw,Y-h);y.stroke();y.strokeStyle='#5aa03a';y.lineWidth=5;y.stroke();y.save();y.translate(bx+s*10+sw,Y-h);y.strokeStyle='#5aa03a';y.lineWidth=4;y.beginPath();y.arc(-s*14,0,14,0,PI*1.4*(s>0?1:-1),s<0);y.stroke();y.restore();leaf(y,bx-s*14+sw*.6,Y-h*.55,-PI/2-s*.8,40,14,'#6ab84a','#3f7a2a','#0c1e0c')}
   // the spiral of leaves rising around the body
   for(let i=0;i<28;i++){const q=(t*.22+i/28)%1,a=t*1.4+i*2.4,r=200+90*sin(i*1.3)+q*80,px=X+cos(a)*r,py=Y-40-q*1000*k+sin(a)*40;y.globalAlpha=Math.sin(q*PI)*k*(sin(a)>0?.5:.95);leaf(y,px,py,a*1.7+t,30+(i%3)*10,11,i%4?'#7ad050':'#c8ff8a','#4a9a34')}y.globalAlpha=1;
   y.save();y.globalCompositeOperation='lighter';y.fillStyle='#fff4b0';for(let i=0;i<40;i++){const q=(t*.12+hh(i)*1)%1,px=X+(hh(i+3)-.5)*1000+sin(t*.8+i)*30,py=Y-q*900*k;y.globalAlpha=Math.sin(q*PI)*k*(.5+.5*sin(t*5+i*2));y.beginPath();y.arc(px,py,3.2,0,TAU);y.fill()}y.restore()},
  // the floor sigil: braided roots for a rim, a fringe of leaves, and a seed spiral (the way a sunflower packs its seeds) at the heart
  sigil(y,k,t,R0){y.globalCompositeOperation='lighter';const A0=Math.min(1,k*1.4);y.globalAlpha=A0;y.strokeStyle=LEAF;y.lineCap='round';y.rotate(t*.1);
   for(const ph of[0,PI]){y.lineWidth=7;y.beginPath();for(let i=0;i<=120;i++){const a=i/120*TAU,r=R0*(.96+.03*sin(a*12+ph));y[i?'lineTo':'moveTo'](cos(a)*r,sin(a)*r)}y.stroke()}
   y.lineWidth=3;y.beginPath();y.arc(0,0,R0*.8,0,TAU);y.stroke();y.beginPath();y.arc(0,0,R0*.6,0,TAU);y.stroke();
   y.fillStyle=LEAF;for(let i=0;i<30;i++){const a=i*TAU/30,r=R0*.985;y.save();y.translate(cos(a)*r,sin(a)*r);y.rotate(a+(i%2?.4:-.4));y.beginPath();y.moveTo(0,0);y.quadraticCurveTo(R0*.06,-R0*.025,R0*.13,0);y.quadraticCurveTo(R0*.06,R0*.025,0,0);y.fill();y.restore()}
   // spiralling vines between the rings
   y.lineWidth=4;for(let i=0;i<6;i++){y.beginPath();for(let j=0;j<=20;j++){const v=j/20,a=i*TAU/6+v*1.6,r=R0*(.6+.2*v);y[j?'lineTo':'moveTo'](cos(a)*r,sin(a)*r)}y.stroke()}
   // the seed spiral, grown from the centre out
   const n=Math.floor(130*Math.min(1,k*1.2));for(let i=1;i<n;i++){const a=i*2.39996,r=R0*.56*Math.sqrt(i/130),s=R0*.0042*(1+i/50);y.fillStyle=i%4?LEAF:CREAM;y.globalAlpha=A0*(.3+.5*i/130);y.beginPath();y.ellipse(cos(a)*r,sin(a)*r,s*2,s,a,0,TAU);y.fill()}y.globalAlpha=1},
  pose:{gather:{nh:[300,380],fh:[40,520],wa:-.55,lean:.02},
   hero:{nh:[330,460],fh:[-170,380],wa:-1.38,nf:[-240,0],ff:[250,0],lean:-.08,py:110,hd:{yaw:.18,eye:{open:.95,angry:.2,look:[.15,0]},brow:{angry:.15},mouth:{smile:.35}}},
   piece:{nh:[240,460],fh:[40,520],wa:-.85},
   windup:{nh:[-100,260],fh:[0,340],wa:-2.3,lean:.14,py:70,nf:[-230,0],ff:[240,0]}},
  // the staff buds along its length as the light runs up it, and a rose opens at the top
  spark(x,c,A){const q=A.q,u=c.u,L=q.wl0,a=-.32+u*.06,X=A.lerp(380,300,u),Y=650,run=A.ez(A.cl((c.t-.15)/.9,0,1));let pv=.32;try{pv=MYTH.prof('druid').piv}catch(_){}
   A.view(x,c.C,1,y=>{for(let i=0;i<10;i++){const s=-pv*.85+i*(1-pv*.15)/10,g=A.cl((lerp0(-.1,.95,run)-s)*5,0,1);if(g<=0)continue;const px=X+cos(a)*L*s,py=Y+sin(a)*L*s,sd=i%2?1:-1;leaf(y,px,py+sd*6,a+sd*(1.15-.25*g),(56+i*4)*ease(g),(20+i)*ease(g),'#7ad050','#3f7a2a','#0c1e0c')}
    // the bud at the head unfurls into an uneven clutch of new leaves around the rose
    })},
  // leaves thrown off as each new piece lands
  piece(x,c,A,i){const t=c.t-.5;if(t<0||t>.6)return;const R=A.sr(40+i);for(let j=0;j<26;j++){const sd=j%2?1:-1,a=-.9+R()*1.3,v=500+R()*900,px=960+sd*(420+cos(a)*v*t),py=760+sin(a)*v*t+300*t*t;x.globalAlpha=1-t/.6;leaf(x,px,py,a+t*6*(R()-.5),40+R()*30,14,j%3?'#7ad050':'#c8ff8a','#3f7a2a','#0c1e0c')}x.globalAlpha=1},
  // the wind-up: a gale of leaves streaming past, vines creeping in at the edges
  windup(x,c,A){const t=c.t,R=A.sr(9);for(let i=0;i<34;i++){const sp=1400+R()*1400,y0=R()*1080,ph=R(),X=1980-((t*sp+ph*2400)%2400),Y=y0+sin(t*4+i)*30,s=.6+R()*.9;leaf(x,X,Y,PI+sin(t*6+i)*.4,48*s,16*s,i%3?'#6ab84a':'#c8ff8a','#3f7a2a','#0c1e0c');x.save();x.globalAlpha=.35;x.strokeStyle='#e8ffd0';x.lineWidth=2;x.beginPath();x.moveTo(X+50*s,Y);x.lineTo(X+50*s+160*s,Y);x.stroke();x.restore()}
   const g=A.ez(c.u);for(const[bx,dir]of[[0,1],[1920,-1]]){for(let j=0;j<3;j++){const L=(220+j*120)*g,y0=1080-j*20;x.strokeStyle='#0c1e0c';x.lineWidth=22-j*5;x.lineCap='round';x.beginPath();x.moveTo(bx,y0);x.quadraticCurveTo(bx+dir*L*.6,y0-L*.2,bx+dir*L,y0-L*.7);x.stroke();x.strokeStyle='#3f7a2a';x.lineWidth=8-j*2;x.stroke()}}},
  // at the peak: black roots heave up out of the light on both sides, leaves fly
  burst(y,k,t,A){y.fillStyle='#030a04';for(const[bx,dir]of[[60,1],[1860,-1]])for(let j=0;j<3;j++){const r=rootPath(bx+dir*j*110,1130,520+j*130-j*j*60,dir,.85-j*.25,74-j*14,A.eo(Math.min(1,k*1.3-j*.12)),j+dir);y.fill(r.pa);for(const[s0,sd]of[[.4,1],[.65,-1]]){const i=Math.round(s0*(r.C.length-1)),C=r.C[i];if(!C||C[5]<s0*.98)continue;branch(y,[[C[0],C[1]],[C[0]+C[2]*sd*dir*C[4]*2+dir*20,C[1]+C[3]*sd*dir*C[4]*2-30]],C[4]*.4,4,'#030a04','#030a04')}}
   for(let i=0;i<30;i++){const a=hh(i)*TAU,v=(300+hh(i+7)*900)*k,px=960+cos(a)*v,py=880+sin(a)*v*.6-k*200;leaf(y,px,py,a+t*3,40+hh(i+2)*30,14,'#030a04','#0a160a')}},
  sig:{hits:[H0,H1,H2],draw(x,c,A){const{q}=A,t=c.t,F0=A.F,CP=X0+190;A.bg(x,c,.32-(t>H0?.12:0));
   A.view(x,c.C,1,y=>{
    // the ground breaks: a glowing crack runs from the planted staff to the right, and a ring of leaves blows out
    if(t>H0){const run=A.eo((t-H0)/.8),xr=CP+run*1450;y.save();y.globalCompositeOperation='lighter';const G=y.createLinearGradient(CP,0,xr,0);G.addColorStop(0,'rgba(154,255,122,.15)');G.addColorStop(.9,'rgba(200,255,150,.8)');G.addColorStop(1,'rgba(255,255,220,1)');y.strokeStyle=G;y.lineWidth=10;y.beginPath();y.moveTo(CP,GY+4);const R=A.sr(5);for(let i=1;i<=16;i++){const px=CP+i*(xr-CP)/16;y.lineTo(px,GY+4+(R()-.5)*30)}y.stroke();y.restore();A.glow(y,xr,GY,280,LEAF,.8*(1-run*.6));
     A.painter(y,'ring',CP,GY,900,(t-H0)/1.2,0,3,7);
     if(t<H0+.5){const v=(t-H0)/.5;y.save();y.translate(CP,GY);y.scale(1,.26);y.strokeStyle='rgba(220,255,180,'+(1-v)+')';y.lineWidth=18*(1-v);y.beginPath();y.arc(0,0,120+900*A.eo(v),0,TAU);y.stroke();y.restore()}}
    // the wave of roots: a far row in the haze, then the near row, each erupting as the crack reaches it; they rise taller as the wave runs on
    const tips=[];
    for(let i=0;i<ROOTB.length;i++){const r=ROOTB[i],v=t-H0-r.d;if(v<0)continue;const u=A.eo(Math.min(1,v/.3)),rr=root(y,r.x,GY-46,r.h,r.dir,r.hook+sin(t*1.3+r.ph)*.04,r.w,u,0,0,i*2.3+1);if(rr){y.fillStyle='rgba(14,34,22,.5)';y.fill(rr.pa);if(t>H2)tips.push([rr.tip[0],rr.tip[1],i+20,.6])}}
    if(t>H0){const v=t-H0;for(let i=0;i<ROOT0.length;i++){const r=ROOT0[i],u=A.eo(Math.min(1,v/.12))*(1+.08*sin(v*22)*Math.max(0,1-v*2.5)),rr=root(y,r.x+i*0,GY+24,r.h*(t>H2?1+.06*A.eo((t-H2)/.4):1),r.dir,r.hook+sin(t*1.4+r.ph)*.03,r.w,u,t<H2?.6:.8,0,i*5.7+2);if(rr)tips.push([rr.tip[0],rr.tip[1],i+10,.9])}if(v<.25)A.glow(y,CP+60,GY-60,420,LEAF,1-v/.25);
     clods(y,A.sr(200),CP+40,GY,v,20,1100);
     // a wall of dust thrown out both ways along the ground
     if(v<.7){const k=A.eo(v/.7);y.save();y.globalAlpha=.5*(1-k);y.fillStyle='#7a6a44';for(let j=0;j<14;j++){const s2=j%2?1:-1,dx=s2*(60+k*(260+hh(j)*520)),r0=50+k*(110+hh(j+3)*120);y.beginPath();y.ellipse(CP+40+dx,GY-r0*.35,r0,r0*.5,0,0,TAU);y.fill()}y.restore()}}
    for(let i=0;i<ROOTS.length;i++){const r=ROOTS[i],v=t-H0-r.d;if(v<0)continue;const u=A.eo(Math.min(1,v/.28))*(1+.06*sin(v*18)*Math.max(0,1-v*2));clods(y,A.sr(100+i),r.x,GY,v,7,620);const rr=root(y,r.x,GY+20,r.h*(t>H2?1+.08*A.eo((t-H2)/.4):1),r.dir,r.hook+sin(t*1.5+r.ph)*.03,r.w,u,t<H2?.5:.8,0,i*3.1);if(rr)tips.push([rr.tip[0],rr.tip[1],i,1]);if(v<.2)A.glow(y,r.x,GY,200,LEAF,.8*(1-v/.2))}
    // the great root heaves up at the second hit and arcs over the wave toward the hero
    let bigTip=null;if(t>H1-.12){const v=t-(H1-.12),u=A.eo(Math.min(1,v/.3));clods(y,A.sr(300),BIG.x,GY+60,v,14,900);const rr=root(y,BIG.x,GY+120,BIG.h,-1,BIG.hook+sin(t*1.2)*.02,BIG.w,u,.9,0,7);if(rr)bigTip=rr.tip;if(v<.3)A.glow(y,BIG.x,GY+40,420,LEAF,1-v/.3)}
    // the bloom: every tip opens, the great root last and largest, and the petals go up on the wind
    if(t>H2){const v=t-H2;for(const[tx,ty,i,sc]of tips){if(bigTip&&Math.hypot(tx-bigTip[0],ty-bigTip[1])<170)continue;const k=A.eo(A.cl((v-(i%20)*.025)/.35,0,1));A.glow(y,tx,ty,160*k*sc,'#ffd0e0',.5*(1-v/1)*sc);flower(y,tx,ty,(50+(i%3)*12)*sc,k,i+v*.6,i%3==1?'#fff0f6':ROSE,i%3==1?'#ffe8f0':'#ffd0e0')}
     if(bigTip){const k=A.eo(A.cl(v/.4,0,1));A.glow(y,bigTip[0],bigTip[1],320*k,'#ffc0d8',.7*(1-v/1.2));flower(y,bigTip[0],bigTip[1],170,k,v*.4,ROSE)}
     const R=A.sr(61);for(let i=0;i<140;i++){const src=i%5==0&&bigTip?bigTip:tips[i%Math.max(1,tips.length)];if(!src)continue;const a=R()*TAU,sp2=200+R()*700,tt=Math.max(0,v-R()*.2),px=src[0]+cos(a)*sp2*tt+tt*tt*240,py=src[1]+sin(a)*sp2*tt+tt*tt*180;y.globalAlpha=A.cl(1-tt/1.1,0,1);y.fillStyle=i%3==0?LEAF:i%3==1?ROSE:i%2?'#fff0f6':'#ffc0d8';y.beginPath();y.ellipse(px,py,9,5,a+tt*6,0,TAU);y.fill()}y.globalAlpha=1}
    // the hero: the staff swung back, then driven bloom-first into the earth like a seed, then raised toward the flowers
    const raise={nh:[-250,-40],fh:[-110,-100],wa:-2.85,lean:-.16,py:20,nf:[-170,0],ff:[200,0],hd:{yaw:.3,eye:{open:.75,angry:.75},brow:{angry:.8},mouth:{open:.35,smile:-.2}}},
     plunge={nh:[250,600],fh:[310,560],wa:1.42,lean:.3,py:170,nf:[-290,0],ff:[290,0],hd:{yaw:.32,tilt:.08,eye:{open:.85,angry:.85},brow:{angry:.9},mouth:{open:.55,smile:-.3}}},
     reach={nh:[430,80],fh:[-220,260],wa:-.28,lean:-.06,py:20,nf:[-170,0],ff:[210,0],hd:{yaw:.3,eye:{open:1,angry:.3},brow:{angry:.2},mouth:{open:.3,smile:.35}}};
    let P;if(t<H0-.1)P=F0.lerpPose(Object.assign({},q.pose.windup),raise,A.ez(t/(H0-.1)));else if(t<H0)P=F0.lerpPose(raise,plunge,A.ei((t-H0+.1)/.1));else if(t<H2-.15)P=plunge;else P=F0.lerpPose(plunge,reach,A.ez((t-H2+.15)/.45));
    A.hero(c,y,X0,GY,.5,P,{wind:t<H0?.6:1,act:{rim:[t>H2?'#ffd0e0':LEAF,1,-8,-3]}});
    // where the bloom went in: a mound of torn earth, a glow in the cracks, and new rootlets curling up the shaft
    if(t>H0-.02&&t<H2-.1){const v=A.cl((t-H0)/.15,0,1);y.fillStyle='#24160a';y.strokeStyle='#0a0603';y.lineWidth=3;y.beginPath();y.ellipse(CP,GY+6,70+40*v,26+8*v,0,PI,0);y.closePath();y.fill();y.stroke();y.fillStyle='#4a7a2a';y.beginPath();y.ellipse(CP-20,GY-14,30,8,-.2,0,TAU);y.fill();A.glow(y,CP,GY-4,120,LEAF,.7);
     for(let j=0;j<3;j++){const g=A.cl((t-H0-.1-j*.12)/.4,0,1);if(g<=0)continue;const s=j%2?1:-1,h=(120+j*50)*ease(g),px=CP+s*(14+j*6);y.strokeStyle='#2a1a0c';y.lineWidth=9-j*2;y.beginPath();y.moveTo(px,GY);y.bezierCurveTo(px+s*30,GY-h*.3,px-s*36,GY-h*.7,px+s*6,GY-h);y.stroke();y.strokeStyle='#6ab84a';y.lineWidth=3;y.stroke();leaf(y,px+s*6,GY-h,-PI/2+s*.5,30*g,11*g,'#7ad050','#3f7a2a','#0c1e0c')}}
    if(t<H0){A.speedLines(y,X0,560,23,t,'rgba(220,255,200,.8)',.4,40,320);for(let i=0;i<24;i++){const a=i*TAU/24+t*3,r=500*(1-A.ez(t/H0))+60;leaf(y,X0+cos(a)*r,GY-200+sin(a)*r*.5,a+PI,40,14,'#7ad050','#3f7a2a','#0c1e0c')}}
    if(t>H0&&t<H0+.6)A.sparks(y,7,t-H0,CP,GY,40,900,LEAF,.6,900);
    });
   if(A.lit(t,H0,.07)||A.lit(t,H1,.06)||A.lit(t,H2,.06))A.impact(x);if(t>H2&&t<H2+.3)A.rect(x,'#fff0f6',.45*(1-(t-H2)/.3));if(t>H1&&t<H1+.2)A.rect(x,'#d8ffb0',.3*(1-(t-H1)/.2))}}
 })})()}catch(e){console.error('EVC druid',e)}
