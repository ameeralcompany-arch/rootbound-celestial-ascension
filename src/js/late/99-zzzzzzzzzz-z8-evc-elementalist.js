// ===== Elementalist evolution cinematic: Primal Conduit. A basalt plain where a volcano and a glacier face each other under a wind-torn sky; four elements spiral up the body;
// a coat split ember and deep blue, a circlet of flame and frost, four orbs at the waist; Convergence: fire, ice, wind and earth meet on the spear point and detonate, the ground answers in four pillars, and one sweep of the spear shatters them. =====
try{(()=>{const F=()=>FILM1,sin=Math.sin,cos=Math.cos,TAU=6.2832,PI=Math.PI;
 // the four: fire, ice (water), wind, earth. [main, light, dark]
 const EL=[['#ff7a3a','#ffd88a','#8a2008'],['#6ad0ff','#e8fbff','#0e3a6a'],['#8effb8','#effff4','#1e6a48'],['#d8a860','#fff0c8','#5a3a1a']];
 const EMB='#c2441c',EMB2='#7a200c',DEEP='#1a4e86',DEEP2='#0c2448',BONE='#f0e4c8',GILT='#e8b860';
 const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,ease=k=>{k=cl(k,0,1);return 1-Math.pow(1-k,3)},ez=k=>{k=cl(k,0,1);return k*k*(3-2*k)};
 const KG=(...a)=>MOVIE1.kit.glow(...a);
 // gradients that never change in their own space are made once per canvas
 const GC=new WeakMap(),gc=(g,key,make)=>{let m=GC.get(g);if(!m){m={};GC.set(g,m)}return m[key]||(m[key]=make())};
 const hsr=i=>{const v=sin(i*12.9898+78.233)*43758.5453;return v-Math.floor(v)};
 // a small sign of each element: a flame, two ice shards, a curl of wind, a stone
 function mark(g,i,x,y,s){g.beginPath();if(i==0){g.moveTo(x,y-s);g.bezierCurveTo(x+s*.75,y-s*.2,x+s*.7,y+s*.75,x,y+s*.75);g.bezierCurveTo(x-s*.7,y+s*.75,x-s*.75,y-s*.1,x-s*.12,y-s*.35);g.quadraticCurveTo(x-s*.05,y-s*.6,x,y-s);g.fill()}
  else if(i==1){g.moveTo(x-s*.18,y-s);g.lineTo(x+s*.16,y-s*.1);g.lineTo(x-s*.12,y+s*.8);g.lineTo(x-s*.42,y-s*.05);g.closePath();g.moveTo(x+s*.42,y-s*.45);g.lineTo(x+s*.62,y+s*.08);g.lineTo(x+s*.4,y+s*.6);g.lineTo(x+s*.22,y+s*.1);g.closePath();g.fill()}
  else if(i==2){const L=g.lineWidth;g.lineWidth=s*.22;g.lineCap='round';g.moveTo(x-s*.9,y-s*.2);g.bezierCurveTo(x-s*.2,y-s*.25,x+s*.5,y-s*.7,x+s*.2,y-s*.95);g.moveTo(x-s*.8,y+s*.25);g.bezierCurveTo(x,y+s*.2,x+s*.95,y+s*.1,x+s*.6,y-s*.4);g.moveTo(x-s*.5,y+s*.65);g.quadraticCurveTo(x+s*.3,y+s*.75,x+s*.55,y+s*.45);g.stroke();g.lineWidth=L}
  else{g.moveTo(x-s*.8,y+s*.6);g.lineTo(x-s*.45,y-s*.35);g.lineTo(x+s*.05,y-s*.7);g.lineTo(x+s*.6,y-s*.3);g.lineTo(x+s*.85,y+s*.6);g.closePath();g.fill()}}
 // one orb of an element, body units; spin t
 function orb(g,i,x,y,r,t,a){if(r<=0)return;const e=EL[i];g.save();g.globalAlpha=a==null?1:a;KG(g,x,y,r*2.6,e[0],g.globalAlpha*.9);KG(g,x,y,r*1.1,e[1],g.globalAlpha*.6);
  if(i==0){for(let j=0;j<3;j++){const h=r*(1.3+.4*sin(t*9+j*2)),dx=(j-1)*r*.45;g.fillStyle=j==1?'#ffe8a0':e[0];g.beginPath();g.moveTo(x+dx-r*.4,y);g.quadraticCurveTo(x+dx-r*.3,y-h*.6,x+dx+sin(t*7+j)*r*.2,y-h);g.quadraticCurveTo(x+dx+r*.3,y-h*.6,x+dx+r*.4,y);g.fill()}g.fillStyle='#ffb040';g.beginPath();g.arc(x,y,r*.8,0,TAU);g.fill();g.fillStyle='#fff3c0';g.beginPath();g.arc(x-r*.12,y-r*.14,r*.46,0,TAU);g.fill()}
  else if(i==1){g.translate(x,y);g.rotate(t*.8);const G2=g.createLinearGradient(-r,-r,r,r);G2.addColorStop(0,'#ffffff');G2.addColorStop(.5,e[0]);G2.addColorStop(1,e[2]);g.fillStyle=G2;g.strokeStyle='#ffffff';g.lineWidth=r*.08;g.beginPath();g.moveTo(0,-r*1.15);g.lineTo(r*.75,-r*.2);g.lineTo(r*.5,r*.85);g.lineTo(-r*.5,r*.85);g.lineTo(-r*.75,-r*.2);g.closePath();g.fill();g.stroke();g.globalAlpha*=.6;g.beginPath();g.moveTo(0,-r*1.15);g.lineTo(0,r*.85);g.moveTo(-r*.75,-r*.2);g.lineTo(0,r*.1);g.lineTo(r*.75,-r*.2);g.stroke()}
  else if(i==2){g.translate(x,y);g.rotate(-t*3);g.fillStyle=e[0]+'aa';g.beginPath();g.arc(0,0,r*.85,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(0,0,r*.42,0,TAU);g.fill();g.strokeStyle='#ffffff';g.lineWidth=r*.12;g.lineCap='round';for(let j=0;j<3;j++){g.rotate(TAU/3);g.beginPath();g.arc(r*.25,0,r*.75,-.4,1.3);g.stroke()}}
  else{g.translate(x,y);g.rotate(t*.6);g.beginPath();for(let j=0;j<7;j++){const b=j*TAU/7,q=r*(.82+.22*hsr(j+3));g[j?'lineTo':'moveTo'](cos(b)*q,sin(b)*q)}g.closePath();const G2=g.createLinearGradient(0,-r,0,r);G2.addColorStop(0,'#c89a5a');G2.addColorStop(1,'#4a2e16');g.fillStyle=G2;g.fill();g.strokeStyle='#2a1808';g.lineWidth=r*.08;g.stroke();g.strokeStyle='#ffc060';g.lineWidth=r*.1;g.beginPath();g.moveTo(-r*.5,-r*.3);g.lineTo(-r*.05,r*.05);g.lineTo(r*.15,-r*.45);g.moveTo(-r*.05,r*.05);g.lineTo(r*.2,r*.55);g.stroke()}
  g.restore()}
 // ---------- the outfit
 const sw0=J=>J.gd==1?1.1:J.gd==2?.86:1;
 function torsoPath(J){const s=sw0(J),gd=J.gd,wst=gd==2?62:gd==1?78:70,hipw=gd==2?92:86,T=new Path2D();T.moveTo(-52,-402);T.bezierCurveTo(-92,-392,-128*s,-392,-138*s,-362);T.bezierCurveTo(-120*s,-260,-wst-6,-190,-wst,-126);T.bezierCurveTo(-wst-2,-70,-hipw-6,-30,-hipw,14);T.lineTo(hipw-6,14);T.bezierCurveTo(hipw-2,-30,wst-2,-70,wst,-126);T.bezierCurveTo(wst+6,-190,104*s,-260,112*s,-362);T.bezierCurveTo(100*s,-392,80,-392,52,-402);T.closePath();return T}
 // a coat panel hanging from (x0,y0), with a hem of flame tongues (fire) or icicles (ice)
 function panel(g,X0,Y0,w,len,sw,t,ph,fire,k){g.save();g.translate(X0,Y0);const x0=0,y0=0,bx=x0-sw,by=y0+len,p=new Path2D();p.moveTo(x0,y0);p.bezierCurveTo(x0-sw*.1,y0+len*.4,bx-10,by-len*.3,bx-20,by);const n=fire?4:5;for(let i=0;i<n;i++){const u0=i/n,u1=(i+1)/n,xa=bx-20+u0*(w+40),xb=bx-20+u1*(w+40),xm=(xa+xb)/2;if(fire){const d=(60+40*hsr(i+ph))*k*(1+.15*sin(t*7+i*2));p.quadraticCurveTo(xa+8,by+d*.6,xm+sin(t*6+i)*14,by+d);p.quadraticCurveTo(xm+6,by+d*.3,xb,by)}else{const d=(50+70*hsr(i*3+ph))*k;p.lineTo(xm,by+d);p.lineTo(xb,by-4)}}p.bezierCurveTo(bx+w+10,by-len*.3,x0+w-sw*.1,y0+len*.4,x0+w,y0);p.closePath();
  const lq=Math.round(len/16)*16,G=gc(g,'pn'+fire+lq,()=>{const G=g.createLinearGradient(0,0,0,lq+60);if(fire){G.addColorStop(0,EMB2);G.addColorStop(.55,EMB);G.addColorStop(.92,'#ff8a3a');G.addColorStop(1,'#ffd27a')}else{G.addColorStop(0,DEEP2);G.addColorStop(.6,DEEP);G.addColorStop(.92,'#5ab8f0');G.addColorStop(1,'#dff6ff')}return G});g.fillStyle=G;g.fill(p);g.strokeStyle=fire?'#3a0c04':'#061428';g.lineWidth=3;g.stroke(p);
  g.save();g.clip(p);g.strokeStyle=fire?'rgba(40,6,0,.35)':'rgba(0,10,30,.35)';g.lineWidth=9;for(let i=0;i<3;i++){g.beginPath();g.moveTo(x0+w*(.25+i*.25),y0+20);g.quadraticCurveTo(bx+w*(.2+i*.3),by-len*.4,bx+w*(.1+i*.35),by+10);g.stroke()}g.strokeStyle=BONE;g.lineWidth=7;g.beginPath();g.moveTo(x0,y0+4);g.lineTo(x0+w,y0+4);g.stroke();g.restore();g.restore();return p}
 function pauldronStone(g,X,Y,k,s,t){if(k<=0)return;g.save();g.translate(X,Y);g.scale(s*k,s*k);g.rotate(-.12);
  // two slabs of basalt, cut at an angle, with magma in the seams
  for(let i=1;i>=0;i--){const y=i*58,w=150-i*22,p=new Path2D();p.moveTo(-w,y+34);p.lineTo(-w*.86,y-22);p.lineTo(-w*.3,y-58);p.lineTo(w*.5,y-62);p.lineTo(w*1.02,y-14);p.lineTo(w*.92,y+40);p.lineTo(w*.2,y+56);p.closePath();
   g.fillStyle=gc(g,'ps'+i,()=>{const G=g.createLinearGradient(0,y-62,0,y+56);G.addColorStop(0,'#7a6a6e');G.addColorStop(.3,'#4a3c42');G.addColorStop(1,'#1c1218');return G});g.fill(p);g.strokeStyle='#0c0608';g.lineWidth=3.4;g.stroke(p);
   g.strokeStyle='rgba(255,236,220,.5)';g.lineWidth=3;g.beginPath();g.moveTo(-w*.82,y-22);g.lineTo(-w*.3,y-56);g.lineTo(w*.5,y-60);g.stroke();
   g.save();g.clip(p);g.globalCompositeOperation='lighter';g.globalAlpha=.7+.3*sin(t*5+i*2);g.strokeStyle='#ff5a14';g.lineWidth=9;g.beginPath();g.moveTo(-w*.55,y-40);g.lineTo(-w*.18,y-4);g.lineTo(-w*.3,y+40);g.moveTo(-w*.18,y-4);g.lineTo(w*.3,y+6);g.lineTo(w*.56,y-40);g.stroke();g.strokeStyle='#ffd88a';g.lineWidth=3;g.stroke();g.restore()}
  g.strokeStyle=GILT;g.lineWidth=6;g.beginPath();g.moveTo(-150,36);g.lineTo(-40,58);g.lineTo(140,40);g.stroke();g.restore()}
 function pauldronIce(g,X,Y,k,s,t,rot){if(k<=0)return;g.save();g.translate(X,Y);g.rotate(rot||0);g.scale(s*k*1.12,s*k*.9);
  // an angular plate of ice that sits on the far shoulder: two faceted layers, the lower one lapping over the sleeve, short crystals along the outer edge
  const cr=[[64,-58,-1.05,62,16],[100,-40,-.7,48,13],[24,-66,-1.35,40,12]];
  for(const[x,y,a,l,w]of cr){g.save();g.translate(x,y);g.rotate(a);g.fillStyle=k>.5?'#bfefff':'#8ae0ff';g.strokeStyle='#0a3060';g.lineWidth=2.4;g.beginPath();g.moveTo(0,-w*.6);g.lineTo(l*.75,-w*.45);g.lineTo(l,0);g.lineTo(l*.75,w*.45);g.lineTo(0,w*.6);g.closePath();g.fill();g.stroke();g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.moveTo(2,-w*.5);g.lineTo(l*.75,-w*.4);g.lineTo(l,0);g.closePath();g.fill();g.restore()}
  for(let i=1;i>=0;i--){const y=i*52,w=1-i*.12,P=[[-118*w,y-6],[-62*w,y-56],[44*w,y-62],[132*w,y-26],[146*w,y+30],[104*w,y+72],[-4*w,y+88],[-104*w,y+58]];
   g.beginPath();P.forEach((p,j)=>g[j?'lineTo':'moveTo'](p[0],p[1]));g.closePath();g.fillStyle=i?'#2a6aa8':'#5ab0e0';g.fill();
   // facets: a pale top face, a mid face, a deep lower face
   g.fillStyle='#e8fbff';g.beginPath();g.moveTo(P[0][0],P[0][1]);g.lineTo(P[1][0],P[1][1]);g.lineTo(P[2][0],P[2][1]);g.lineTo(P[3][0],P[3][1]);g.lineTo(10*w,y+4);g.closePath();g.globalAlpha=i?.55:.9;g.fill();g.globalAlpha=1;
   g.fillStyle='#14406e';g.beginPath();g.moveTo(10*w,y+4);g.lineTo(P[4][0],P[4][1]);g.lineTo(P[5][0],P[5][1]);g.lineTo(P[6][0],P[6][1]);g.closePath();g.fill();
   g.fillStyle='#8ad6f6';g.beginPath();g.moveTo(10*w,y+4);g.lineTo(P[3][0],P[3][1]);g.lineTo(P[4][0],P[4][1]);g.closePath();g.fill();
   g.strokeStyle='#0a2a50';g.lineWidth=3.2;g.beginPath();P.forEach((p,j)=>g[j?'lineTo':'moveTo'](p[0],p[1]));g.closePath();g.stroke();
   g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=2.4;g.beginPath();g.moveTo(P[1][0],P[1][1]);g.lineTo(10*w,y+4);g.lineTo(P[3][0],P[3][1]);g.moveTo(10*w,y+4);g.lineTo(P[6][0],P[6][1]);g.stroke();
   g.strokeStyle=BONE;g.lineWidth=6;g.beginPath();g.moveTo(P[7][0],P[7][1]);g.lineTo(P[6][0],P[6][1]);g.lineTo(P[5][0],P[5][1]);g.stroke()}
  // a glint that runs across the top face
  const gx=-140+((t*180)%420);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.5;g.strokeStyle='#ffffff';g.lineWidth=10;g.beginPath();g.moveTo(gx,-60);g.lineTo(gx-30,10);g.stroke();g.restore();
  g.restore()}
 // the green wind sash: two ribbons from the knot at the near hip
 function sash(g,X,Y,k,t,w){if(k<=0)return;for(let r=0;r<2;r++){const L=(380+r*120)*k,sw=w*520+sin(t*2.6+r)*40;g.fillStyle=r?'#5ad890':'#9effc0';g.strokeStyle='#14462e';g.lineWidth=2.4;g.beginPath();g.moveTo(X,Y);const n=8;const pts=[];for(let i=0;i<=n;i++){const u=i/n;pts.push([X-sw*u*u*.9-u*90-r*30,Y+u*L*(1-w*.5)+sin(t*5+u*6+r)*22*u])}pts.forEach(p=>g.lineTo(p[0],p[1]-(18-r*4)*(1-0)));for(let i=n;i>=0;i--){const p=pts[i];g.lineTo(p[0],p[1]+(18-r*4))}g.closePath();g.fill();g.stroke()}
  g.fillStyle='#9effc0';g.strokeStyle='#14462e';g.beginPath();g.ellipse(X,Y,24,18,.3,0,TAU);g.fill();g.stroke()}
 const dress={
  back(g,J){const k=J.k.p3||0;if(k<=0)return;const e=ease(k),w=J.wnd,t=J.t;
   // the long split tails of the coat: ember outside, deep blue within
   const A=J.rot(-80,-170),B=J.rot(10,-170),len=lerp(200,720,e),sw=sin(t*1.9)*30+w*520;
   panel(g,A[0]-40,A[1],120,len,sw*1.05+40,t,3,1,e);panel(g,B[0]-60,B[1],110,len*.92,sw*.9+20,t,7,0,e);
   // the orbs behind the body
   orbs(g,J,e,-1)},
  torso(g,J){const k=J.k.p1||0;if(k<=0)return;const e=ease(k),t=J.t,w=J.wnd;
   // front skirt of the coat: ember near, deep blue far
   g.save();g.beginPath();g.rect(J.hx-600,J.hy-500,1400,lerp(0,1700,e)+500);g.clip();
   panel(g,J.hx+6,J.hy-44,74,lerp(200,520,e),w*140+sin(t*2+1.7)*14,t,1,0,e);panel(g,J.hx-100,J.hy-44,84,lerp(220,560,e),w*150+sin(t*2+3.1)*14,t,5,1,e);g.restore();
   // the far shoulder: a cluster of ice
   
   g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);const T=torsoPath(J),top=lerp(14,-480,e);
   g.save();g.beginPath();g.rect(-260,top,520,600);g.clip();g.clip(T);
   // half ember, half deep blue, crossing over at a curved seam
   const seam=new Path2D();seam.moveTo(-34,-420);seam.bezierCurveTo(10,-330,30,-230,30,-120);seam.lineTo(40,30);seam.lineTo(-260,30);seam.lineTo(-260,-420);seam.closePath();
   g.fillStyle=gc(g,'tb',()=>{const G=g.createLinearGradient(0,-410,0,20);G.addColorStop(0,'#2a6aa8');G.addColorStop(.6,DEEP);G.addColorStop(1,DEEP2);return G});g.fillRect(-260,-430,520,470);
   g.strokeStyle='rgba(220,246,255,.35)';g.lineWidth=3;for(let i=0;i<4;i++){const x=50+i*20,y=-330+i*60;g.beginPath();g.moveTo(x,y);g.lineTo(x+26,y-30);g.moveTo(x+13,y-15);g.lineTo(x+34,y-8);g.moveTo(x+13,y-15);g.lineTo(x+6,y-38);g.stroke()}
   g.fillStyle=gc(g,'te',()=>{const G=g.createLinearGradient(0,-410,0,20);G.addColorStop(0,'#e0622a');G.addColorStop(.55,EMB);G.addColorStop(1,EMB2);return G});g.fill(seam);
   g.save();g.clip(seam);g.fillStyle='rgba(90,14,0,.45)';for(let i=0;i<4;i++){const x=-110+i*36,h=120+70*hsr(i+1)+16*sin(t*4+i);g.beginPath();g.moveTo(x-22,-110);g.quadraticCurveTo(x-18,-110-h*.6,x+6*sin(t*3+i),-110-h);g.quadraticCurveTo(x+18,-110-h*.6,x+22,-110);g.fill()}g.restore();
   g.strokeStyle=BONE;g.lineWidth=12;g.stroke(seam);g.strokeStyle='#5a3a1a';g.lineWidth=2;g.setLineDash([8,10]);g.beginPath();g.moveTo(-34,-420);g.bezierCurveTo(10,-330,30,-230,30,-120);g.lineTo(40,30);g.stroke();g.setLineDash([]);
   // the reveal edge
   if(e<1){g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,240,200,'+(1-e)+')';g.fillRect(-260,top-6,520,12);g.globalCompositeOperation='source-over'}
   g.restore();g.strokeStyle='#1a0c10';g.lineWidth=2.8;g.stroke(T);
   // standing collar: flame points on the ember side, ice points on the blue
   g.save();g.globalAlpha=Math.min(1,e*1.5);for(const s of[-1,1]){g.fillStyle=s<0?EMB:DEEP;g.strokeStyle=s<0?'#3a0c04':'#061428';g.lineWidth=2.6;g.beginPath();g.moveTo(s*8,-396);if(s<0){g.lineTo(-74,-404);g.quadraticCurveTo(-96,-440,-84,-488*e-0);g.quadraticCurveTo(-70,-456,-58,-452);g.quadraticCurveTo(-56,-490,-40,-514*e+20*(1-e));g.quadraticCurveTo(-30,-460,-12,-440)}else{g.lineTo(76,-402);g.lineTo(92,-470*e-(1-e)*400);g.lineTo(62,-440);g.lineTo(50,-500*e-(1-e)*400);g.lineTo(22,-440)}g.closePath();g.fill();g.stroke()}g.restore();
   // the sash at the waist, and a bandolier of four stones
   g.fillStyle='#241a1e';g.beginPath();g.moveTo(-80,-156);g.lineTo(82,-156);g.lineTo(80,-106);g.lineTo(-80,-106);g.closePath();g.fill();g.strokeStyle='#0a0608';g.lineWidth=2.4;g.stroke();g.strokeStyle=GILT;g.lineWidth=4;g.beginPath();g.moveTo(-80,-150);g.lineTo(82,-150);g.moveTo(-80,-112);g.lineTo(80,-112);g.stroke();
   g.save();g.clip(T);if(e>.15){const a=[96*sw0(J),-380],b=[-70,-140];g.strokeStyle='#1a0c08';g.lineWidth=40;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();g.strokeStyle=BONE;g.lineWidth=32;g.stroke();g.strokeStyle='#b8a888';g.lineWidth=3;g.beginPath();g.moveTo(a[0]-12,a[1]+4);g.lineTo(b[0]-12,b[1]+4);g.stroke();
    for(let i=0;i<4;i++){const u=.22+i*.19,x=lerp(a[0],b[0],u),y=lerp(a[1],b[1],u),r=17*cl((e-.15-i*.12)/.3,0,1);if(r<=0)continue;g.fillStyle='#3a2a20';g.beginPath();g.arc(x,y,r+5,0,TAU);g.fill();g.fillStyle=EL[i][0];g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.fillStyle=EL[i][1];g.beginPath();g.arc(x-r*.28,y-r*.28,r*.42,0,TAU);g.fill();KG(g,x,y,r*2.4,EL[i][0],.45+.25*sin(t*4+i))}}
   g.restore();sash(g,-70,-128,e,t,w);g.restore();pauldronIce(g,J.FS[0]+4,J.FS[1]+40,e,.56,t,J.lean+.25);g.save();
   g.restore()},
  front(g,J){const k1=J.k.p1||0,k3=J.k.p3||0,t=J.t;
   if(k1>0){const e=ease(k1),nA=J.nA;
    // an ember bracer on the near forearm
    if(nA){const a=Math.atan2(nA[3]-nA[1],nA[2]-nA[0]),x0=lerp(nA[0],nA[2],.32),y0=lerp(nA[1],nA[3],.32),L=Math.hypot(nA[2]-nA[0],nA[3]-nA[1])*.52*e;g.save();g.translate(x0,y0);g.rotate(a);g.fillStyle=gc(g,'br',()=>{const G=g.createLinearGradient(0,-40,0,40);G.addColorStop(0,'#ff9a50');G.addColorStop(.5,EMB);G.addColorStop(1,EMB2);return G});g.strokeStyle='#3a0c04';g.lineWidth=2.6;g.beginPath();g.moveTo(0,-40);g.lineTo(L,-34);g.lineTo(L+8,0);g.lineTo(L,34);g.lineTo(0,40);g.quadraticCurveTo(-12,0,0,-40);g.closePath();g.fill();g.stroke();g.strokeStyle=GILT;g.lineWidth=5;g.beginPath();g.moveTo(4,-38);g.lineTo(4,38);g.moveTo(L-4,-33);g.lineTo(L-4,33);g.stroke();g.fillStyle='#ffd88a';mark(g,0,L*.5,0,18*e);g.restore()}
    pauldronStone(g,J.NS[0]-8,J.NS[1]+4,e,.74,t)}
   if(k3>0)orbs(g,J,ease(k3),1);
   if(k3>.5&&J.fA){const fx=J.fA[2]-J.FS[0],fy=J.fA[3]-J.FS[1];if(fx>200&&fy<160){const a=ease((k3-.5)*2),X=J.fA[2]+16,Y=J.fA[3]-120;KG(g,X,Y,300*a,'#ffd8a8',.5);KG(g,X,Y,110*a,'#ffffff',.85);for(let i=0;i<4;i++){const b=t*2.4+i*PI/2,z=sin(b);orb(g,i,X+cos(b)*96*a,Y+z*30*a,(24+5*z)*a,t+i,1)}}}},
  head(g,J){const k=J.k.p2||0;if(k<=0)return;const e=ease(k),sy=sin(J.yaw||.26),t=J.t,w=J.wnd;g.save();g.globalAlpha=Math.min(1,k*2);
   // near temple: three separate tongues of flame, flickering, swept back and down, each with a hot yellow core
   for(let i=0;i<3;i++){const fl=1+.18*sin(t*8+i*2.1)+.08*sin(t*13+i),L=(175-i*30)*e*fl,wd=(24-i*3)*e,a=PI+.06-i*.44+sin(t*3+i)*.06-w*.08,x=-110+sy*6,y=-86+i*20;if(L<4)continue;g.save();g.translate(x,y);g.rotate(a);
    const G=gc(g,'hf'+i,()=>{const G=g.createLinearGradient(0,0,175-i*30,0);G.addColorStop(0,'#c2441c');G.addColorStop(.45,'#ff7a3a');G.addColorStop(1,'#ffd27a');return G});g.fillStyle=G;g.strokeStyle='#5a1a08';g.lineWidth=2.4;
    g.beginPath();g.moveTo(0,-wd);for(let j=1;j<=5;j++){const u=j/6;g.lineTo(L*u,-wd*(1-u)-wd*.55*(j%2)*(1-u*.6)+sin(t*14+j*1.7+i)*3)}g.lineTo(L,sin(t*10+i*2)*7);for(let j=5;j>=1;j--){const u=j/6;g.lineTo(L*u*.96,wd*(1-u)*.8+wd*.45*((j+1)%2)*(1-u*.6)+sin(t*12+j*2.3+i)*3)}g.lineTo(0,wd*.8);g.closePath();g.fill();g.stroke();
    g.strokeStyle='#fff3a0';g.lineWidth=5*e;g.lineCap='round';g.beginPath();g.moveTo(4,0);g.quadraticCurveTo(L*.4,sin(t*9+i)*4,L*.72,sin(t*10+i*2)*5);g.stroke();g.restore()}
   // far temple: shards of ice
   for(let i=0;i<3;i++){const L=(78-i*16)*e,a=-1.75-i*.34,x=96+sy*30,y=-84+i*8;g.save();g.translate(x,y);g.rotate(a);g.fillStyle=gc(g,'hi',()=>{const G=g.createLinearGradient(0,-12,0,12);G.addColorStop(0,'#ffffff');G.addColorStop(.5,'#8ae0ff');G.addColorStop(1,'#1a5a9a');return G});g.strokeStyle='#0a3060';g.lineWidth=2.2;g.beginPath();g.moveTo(0,-12);g.lineTo(L*.8,-10);g.lineTo(L,0);g.lineTo(L*.8,10);g.lineTo(0,12);g.closePath();g.fill();g.stroke();g.restore()}
   // the band, and a split stone at the brow
   g.strokeStyle='#2a1a10';g.lineWidth=3;g.fillStyle=GILT;g.beginPath();g.moveTo(-120,-80);g.quadraticCurveTo(sy*40,-122,122,-84);g.lineTo(120,-68);g.quadraticCurveTo(sy*40,-104,-118,-64);g.closePath();g.fill();g.stroke();
   const gx=sy*40,gy=-106;g.save();g.translate(gx,gy);g.scale(e,e);g.beginPath();g.moveTo(0,-26);g.lineTo(15,0);g.lineTo(0,20);g.lineTo(-15,0);g.closePath();g.save();g.clip();g.fillStyle='#ff7a3a';g.fillRect(-20,-30,20,60);g.fillStyle='#6ad0ff';g.fillRect(0,-30,20,60);g.fillStyle='rgba(255,255,255,.7)';g.fillRect(-6,-22,4,16);g.restore();g.strokeStyle='#2a1a10';g.lineWidth=2.4;g.stroke();g.restore();
   g.restore()}};
 // four orbs circling the waist; side -1 draws the ones behind the body, 1 the ones in front
 function orbs(g,J,e,side){const t=J.t,c=J.rot(-14,-150);for(let i=0;i<4;i++){const a=t*1.5+i*PI/2,z=sin(a);if((z<0)!=(side<0))continue;const x=c[0]+cos(a)*330*e,y=c[1]+z*70*e-40*sin(t*2+i)*e,r=44*e*(1+.18*z);orb(g,i,x,y,r,t+i,1)}}
 // the shape the camera sees: where the spear point is, for a pose
 function tipOf(A,X,Y,s,P,f,fr){const gd=A.q.L.gd|0,s0=gd==1?1.1:gd==2?.86:1,ln=P.lean==null?.02:P.lean,hx=P.px||0,hy=-830+(P.py||0),R=(x,y)=>[hx+x*cos(ln)-y*sin(ln),hy+x*sin(ln)+y*cos(ln)],NS=R(-128*s0,-372),H=[NS[0]+P.nh[0],NS[1]+P.nh[1]],d=WL*(fr==null?.66:fr);f=f||1;return[X+s*f*(H[0]+cos(P.wa)*d),Y+s*(H[1]+sin(P.wa)*d),X+s*f*H[0],Y+s*H[1]]}
 const WL=1500;
 // a stream of one element, from S curving to D, drawn up to its head u (0..1)
 function stream(y,i,S,C1,D,u,t,wd,a){if(u<=0)return;const e=EL[i],n=20,P=[];for(let j=0;j<=n;j++){const v=j/n*u,w=1-v;P.push([w*w*S[0]+2*w*v*C1[0]+v*v*D[0],w*w*S[1]+2*w*v*C1[1]+v*v*D[1]])}
  y.save();y.globalCompositeOperation='lighter';y.lineCap='round';y.globalAlpha=a;
  for(let j=1;j<=n;j++){const q=j/n,p0=P[j-1],p1=P[j],ww=wd*(.25+.75*q);y.strokeStyle=e[0];y.lineWidth=ww;y.beginPath();y.moveTo(p0[0],p0[1]);y.lineTo(p1[0],p1[1]);if(j%2==0){const p2=P[j-2]||p0;y.stroke();y.beginPath();y.moveTo(p2[0],p2[1]);y.lineTo(p1[0],p1[1]);y.strokeStyle=e[1];y.lineWidth=ww*.3}y.stroke()}
  // the stream's own matter: flame tongues, ice shards, wind lines, stones
  for(let j=2;j<=n;j+=2){const p=P[j],q=j/n,r=wd*(.3+.5*q);y.fillStyle=e[j%4?0:1];if(i==2){y.strokeStyle=e[1];y.lineWidth=2;y.beginPath();y.arc(p[0],p[1],r*1.4,t*8+j,t*8+j+2);y.stroke()}else{y.save();y.translate(p[0]+sin(j*3.1+t*9)*r*.6,p[1]+cos(j*2.3+t*9)*r*.6);y.rotate(j+t*(i==3?3:0));mark(y,i,0,0,r*.8);y.restore()}}
  y.restore();const h=P[n];KG(y,h[0],h[1],wd*3,e[0],a*.8)}
 let A0=null;
 // blend two pose objects (numbers, arrays, nested face objects)
 function lp(a,b,k){const o={};for(const q in Object.assign({},a,b)){const x=a[q],y=b[q];if(x==null){o[q]=y;continue}if(y==null){o[q]=x;continue}if(typeof x=='number')o[q]=x+(y-x)*k;else if(Array.isArray(x))o[q]=x.map((v,i)=>v+(y[i]-v)*k);else if(typeof x=='object')o[q]=lp(x,y,k);else o[q]=k<.5?x:y}return o}
 // ---------- the place
 function plate(x,R,P){const{W,H,glow}=P;
  // warm on the volcano's side, cold on the glacier's
  let G=x.createLinearGradient(0,0,W,0);G.addColorStop(0,'rgba(255,110,50,.34)');G.addColorStop(.42,'rgba(255,110,50,0)');G.addColorStop(.58,'rgba(90,200,255,0)');G.addColorStop(1,'rgba(90,200,255,.3)');x.fillStyle=G;x.fillRect(0,0,W,H);
  x.fillStyle='#ffffff';for(let i=0;i<120;i++){const X=R()*W,Y=R()*420;x.globalAlpha=.15+R()*.5;x.fillRect(X,Y,R()<.1?3:1.6,R()<.1?3:1.6)}x.globalAlpha=1;
  // wind across the sky
  x.lineCap='round';for(let i=0;i<9;i++){const y0=90+R()*360,x0=-200+R()*600,L=900+R()*900,b=(R()-.5)*160;x.globalAlpha=.08+R()*.12;x.strokeStyle=i%3?'#bfffd8':'#ffffff';x.lineWidth=2+R()*5;x.beginPath();x.moveTo(x0,y0);x.bezierCurveTo(x0+L*.3,y0-b,x0+L*.6,y0+b,x0+L,y0-b*.4);x.stroke()}x.globalAlpha=1;
  // the volcano on the left: lava down its flanks, a glow in its throat, a plume going away from the centre
  glow(x,330,520,520,'#ff5a1a',.55);
  for(let i=11;i>=0;i--){const r=56+i*24,px=330-i*40-R()*26+sin(i*.9)*18,py=446-i*40,lit=1-i/11,G=x.createRadialGradient(px,py+r*.25,0,px,py,r);G.addColorStop(0,'rgba('+(70+120*lit|0)+','+(44+40*lit|0)+','+(52+10*lit|0)+','+(.5+.2*lit)+')');G.addColorStop(.6,'rgba(70,46,62,'+(.32+.12*lit)+')');G.addColorStop(1,'rgba(60,40,60,0)');x.fillStyle=G;x.beginPath();x.arc(px,py,r,0,TAU);x.fill()}
  for(let i=0;i<40;i++){const u=R(),px=330-u*420+(R()-.5)*120*u,py=440-u*440+(R()-.5)*60;x.globalAlpha=.4+R()*.5;x.fillStyle=R()<.5?'#ffb04a':'#ff6a1a';x.fillRect(px,py,2+R()*2,2+R()*2)}x.globalAlpha=1;
  G=x.createLinearGradient(0,470,0,780);G.addColorStop(0,'#3a1a1e');G.addColorStop(1,'#1a0c12');x.fillStyle=G;x.beginPath();x.moveTo(-80,790);x.lineTo(150,610);x.lineTo(270,488);x.lineTo(300,470);x.lineTo(380,474);x.lineTo(410,492);x.lineTo(540,620);x.lineTo(760,760);x.lineTo(800,790);x.closePath();x.fill();
  x.strokeStyle='#ff6a1a';x.lineCap='round';for(let i=0;i<6;i++){let px=300+i*16,py=480;x.lineWidth=5-i*.5;x.globalAlpha=.85;x.beginPath();x.moveTo(px,py);for(let j=0;j<10;j++){px+=(i<3?-1:1)*(10+R()*22);py+=24+R()*10;x.lineTo(px,py)}x.stroke()}x.globalAlpha=1;glow(x,340,476,160,'#ffb04a',.9);glow(x,340,476,60,'#ffffff',.5);
  // the glacier on the right: blades of ice, lit on one face
  for(let i=0;i<8;i++){const bx=1240+i*100+R()*40,h=220+R()*240,w=60+R()*70,top=780-h;x.fillStyle='#1c3a62';x.beginPath();x.moveTo(bx-w,790);x.lineTo(bx-w*.2,top);x.lineTo(bx+w,790);x.closePath();x.fill();x.fillStyle='rgba(170,230,255,.55)';x.beginPath();x.moveTo(bx-w*.2,top);x.lineTo(bx+w,790);x.lineTo(bx+w*.25,790);x.closePath();x.fill();x.strokeStyle='rgba(230,250,255,.7)';x.lineWidth=2;x.beginPath();x.moveTo(bx-w*.2,top);x.lineTo(bx+w*.25,790);x.stroke()}
  glow(x,1620,700,420,'#6ad0ff',.35);
  // stones that float, loosed from the ground
  for(const[X,Y,r]of[[150,250,60],[560,170,34],[1480,300,44],[1760,170,72],[1300,140,24]]){x.save();x.translate(X,Y);x.beginPath();for(let j=0;j<8;j++){const b=j*TAU/8,q=r*(.7+R()*.4)*(j>3&&j<8?1.25:1);x.lineTo(cos(b)*q*1.3,sin(b)*q*(j>0&&j<4?1.4:.55))}x.closePath();G=x.createLinearGradient(0,-r,0,r);G.addColorStop(0,'#8a7060');G.addColorStop(.35,'#4a3830');G.addColorStop(1,'#140c10');x.fillStyle=G;x.fill();x.save();x.clip();x.lineWidth=r*.13;x.strokeStyle='rgba(255,140,60,.6)';x.beginPath();x.arc(r*.25,r*.1,r*1.25,PI*.78,PI*1.32);x.stroke();x.strokeStyle='rgba(130,215,255,.55)';x.beginPath();x.arc(-r*.25,r*.1,r*1.25,-PI*.32,PI*.22);x.stroke();x.restore();x.strokeStyle='rgba(255,200,140,.55)';x.lineWidth=2;x.beginPath();x.moveTo(-r*.9,-r*.25);x.lineTo(r*.9,-r*.3);x.stroke();
   for(let j=0;j<7;j++){const q=j/7,px=(R()-.5)*r*.8+sin(q*3)*6,py=r*(.7+q*2.4),z=(1-q)*3.2+1;x.globalAlpha=.75*(1-q*.8);x.fillStyle=px<0?'#b87a58':'#7a96aa';x.fillRect(px-z/2,py,z,z)}x.globalAlpha=1;x.restore()}
  // the middle distance: a broken field of low basalt columns, steam where the cold meets the heat, embers in a haze
  {G=x.createLinearGradient(0,690,0,790);G.addColorStop(0,'rgba(255,150,120,0)');G.addColorStop(.6,'rgba(200,150,190,.18)');G.addColorStop(1,'rgba(150,170,220,.1)');x.fillStyle=G;x.fillRect(0,690,W,100);
   // clusters of packed columns stepping up to a crest, like a causeway half sunk in the plain
   for(let c=0;c<9;c++){const cx=430+c*135+R()*50,n=5+(R()*5|0),w=7+R()*3,peak=80+R()*100*(1-Math.abs(cx-960)/800),warm=cx<960;for(let i=0;i<n;i++){const X=cx+(i-n/2)*w*2,u=1-Math.abs(i-(n-1)/2)/((n+1)/2),h=14+peak*u*(.75+R()*.35),top=792-h;x.fillStyle=warm?'#33212b':'#202840';x.fillRect(X-w,top+3,w*2,h);x.fillStyle=warm?'rgba(255,160,100,.6)':'rgba(160,220,255,.55)';x.fillRect(X-w,top,w*2,4);x.fillStyle='rgba(0,0,0,.35)';x.fillRect(X+w-2,top+3,2,h);if(R()<.3){x.fillStyle=warm?'rgba(255,110,40,.5)':'rgba(140,220,255,.4)';x.fillRect(X-1,top+8+R()*h*.5,2,6)}}}
   for(let i=0;i<7;i++){const X=560+i*130+R()*60,h=160+R()*160;for(let j=0;j<6;j++){const u=j/6,r=20+u*70,G2=x.createRadialGradient(X+sin(u*4+i)*30*u,770-u*h,0,X+sin(u*4+i)*30*u,770-u*h,r);G2.addColorStop(0,'rgba(225,230,245,'+(.28*(1-u*.8))+')');G2.addColorStop(1,'rgba(225,230,245,0)');x.fillStyle=G2;x.beginPath();x.arc(X+sin(u*4+i)*30*u,770-u*h,r,0,TAU);x.fill()}}
   for(let i=0;i<70;i++){const X=380+R()*1160,Y=700+R()*90;x.globalAlpha=.25+R()*.5;x.fillStyle=X<960?(R()<.5?'#ffb04a':'#ff7a3a'):(R()<.5?'#bfefff':'#7ad8ff');x.fillRect(X,Y,2,2)}x.globalAlpha=1}
  // the far plain and its haze
  G=x.createLinearGradient(0,740,0,840);G.addColorStop(0,'#24182a');G.addColorStop(1,'#1a1422');x.fillStyle=G;x.beginPath();x.moveTo(0,840);for(let i=0;i<=W;i+=48)x.lineTo(i,770+sin(i*.012)*14+R()*10);x.lineTo(W,840);x.closePath();x.fill();
  G=x.createLinearGradient(0,700,0,830);G.addColorStop(0,'rgba(200,180,220,0)');G.addColorStop(1,'rgba(200,170,210,.16)');x.fillStyle=G;x.fillRect(0,700,W,130);
  // the near ground: basalt, cracked; lava seams on the left, frost on the right
  G=x.createLinearGradient(0,820,0,H);G.addColorStop(0,'#3a2c3a');G.addColorStop(.35,'#2a2030');G.addColorStop(1,'#120e16');x.fillStyle=G;x.fillRect(0,820,W,H-820);
  G=x.createLinearGradient(0,0,W,0);G.addColorStop(0,'rgba(120,30,10,.4)');G.addColorStop(.45,'rgba(0,0,0,0)');G.addColorStop(.55,'rgba(0,0,0,0)');G.addColorStop(1,'rgba(60,140,200,.28)');x.fillStyle=G;x.fillRect(0,820,W,H-820);
  x.strokeStyle='rgba(10,6,12,.55)';x.lineWidth=2;for(let i=0;i<8;i++){const y=822+Math.pow(i/7,1.7)*258;x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke()}
  for(let i=0;i<34;i++){const left=i<17,sx=left?R()*820:1100+R()*820,sy=840+R()*230;let px=sx,py=sy;x.strokeStyle=left?'#ff6a1a':'#9ae8ff';x.lineWidth=1.5+R()*2.5;x.globalAlpha=.4+R()*.4;x.beginPath();x.moveTo(px,py);for(let j=0;j<5;j++){px+=(R()-.5)*120;py+=(R()-.3)*26;x.lineTo(px,py)}x.stroke()}x.globalAlpha=1;
  glow(x,200,960,260,'#ff5a1a',.3);glow(x,1760,960,260,'#6ad0ff',.22);
  // near things: ember rocks left, ice crystals right, wind-bent grass
  for(let i=0;i<5;i++){const X=40+i*120+R()*60,Y=1030+R()*40,r=30+R()*40;x.fillStyle='#160c10';x.beginPath();x.ellipse(X,Y,r*1.4,r*.7,0,PI,0);x.fill();x.strokeStyle='rgba(255,110,40,.7)';x.lineWidth=2;x.beginPath();x.moveTo(X-r,Y-r*.2);x.lineTo(X+r*.4,Y-r*.5);x.stroke()}
  for(let i=0;i<6;i++){const X=1450+i*90+R()*50,h=50+R()*110,w=14+R()*16;x.fillStyle='rgba(140,220,255,.7)';x.beginPath();x.moveTo(X-w,1080);x.lineTo(X-w*.2,1080-h);x.lineTo(X+w,1080);x.closePath();x.fill();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.moveTo(X-w*.2,1080-h);x.lineTo(X+w,1080);x.lineTo(X+w*.2,1080);x.closePath();x.fill()}
  x.strokeStyle='#4a8a5a';x.lineWidth=3;for(let i=0;i<40;i++){const X=R()*W,Y=860+R()*200;if(X>700&&X<1220&&Y>930)continue;x.globalAlpha=.5+R()*.4;x.beginPath();x.moveTo(X,Y);x.quadraticCurveTo(X-10,Y-20,X-34-R()*20,Y-26-R()*10);x.stroke()}x.globalAlpha=1}
 EVC1.add('elementalist',{
  pal:['#7ad8ff','#1a2a48','#ffc890'],eye:'#62c8ff',
  C:{coat:DEEP,dark:DEEP2,trim:BONE,inner:'#241a1e',boot:'#3a2a24',glove:'#2a2430',leg:'#1c2232',scarf:null,coatLen:0},
  wl:WL,wlClose:1400,dress,pieces:['chest','head',[-40,-980,.6]],
  glyph(g,cx,cy,rx,ry,k,t){g.save();g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,TAU);g.clip();
   // the lower half of the iris burns: ice above, ember below
   const G=g.createLinearGradient(0,cy-ry*.1,0,cy+ry);G.addColorStop(0,'rgba(255,120,50,0)');G.addColorStop(.35,'rgba(255,120,50,.75)');G.addColorStop(1,'rgba(255,210,120,.95)');g.globalAlpha=k;g.fillStyle=G;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,TAU);g.ellipse(cx,cy,rx*.46,ry*.52,0,0,TAU);g.fill('evenodd');
   g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const a=t*.9+i*PI/2+.6,X=cx+cos(a)*rx*.74,Y=cy+sin(a)*ry*.74;g.globalAlpha=k*.95;g.fillStyle=EL[i][1];g.strokeStyle=EL[i][1];g.lineWidth=rx*.05;mark(g,i,X,Y,rx*.15)}g.restore()},
  sky:[[0,'#080a1e'],[.3,'#161c3e'],[.55,'#2e2a4e'],[.72,'#5a3a4a'],[.78,'#3a2a3a'],[1,'#120e16']],
  plate,
  aura(y,X,Y,k,t){if(k<=0)return;y.globalCompositeOperation='lighter';y.lineCap='round';
   // four ribbons wind up the body, each its own colour, and stop below the shoulders
   for(let i=0;i<4;i++){const e=EL[i],n=14;let px=0,py=0;for(let j=0;j<=n;j++){const v=j/n,a=t*2.2+i*PI/2+v*4.2,r=(250-110*v)*(.6+.4*k),x=X+cos(a)*r,yy=Y-v*560*k+sin(a)*r*.22;if(j){const fr=sin(a)>0?1:.45;y.globalAlpha=k*(1-v)*.85*fr;y.strokeStyle=e[0];y.lineWidth=22*(1-v*.6);y.beginPath();y.moveTo(px,py);y.lineTo(x,yy);y.stroke();y.strokeStyle=e[1];y.lineWidth=6*(1-v*.5);y.stroke()}px=x;py=yy}}
   // what each element sheds: embers rise, frost glints, wind streaks, pebbles lift
   for(let i=0;i<40;i++){const el=i%4,q=(t*(.35+.1*el)+hsr(i)*1)%1,ph=hsr(i+7)*TAU,r=120+hsr(i+3)*260,px=X+cos(ph+t*(el==2?2:.4))*r,py=Y-q*620*k-20;y.globalAlpha=k*Math.sin(q*PI)*.9;y.fillStyle=EL[el][el==3?0:1];if(el==2){y.strokeStyle=EL[2][1];y.lineWidth=2;y.beginPath();y.moveTo(px,py);y.lineTo(px-40,py+6);y.stroke()}else if(el==3){y.globalCompositeOperation='source-over';y.fillStyle='#8a6a48';y.fillRect(px-4,py-4,8,7);y.globalCompositeOperation='lighter'}else if(el==1){y.beginPath();y.moveTo(px,py-6);y.lineTo(px+3,py);y.lineTo(px,py+6);y.lineTo(px-3,py);y.closePath();y.fill()}else y.fillRect(px-2,py-2,4,6)}
   y.globalAlpha=1;KG(y,X-120,Y,260,'#ff7a3a',.25*k);KG(y,X+120,Y,260,'#6ad0ff',.25*k)},
  sigil(y,k,t,R0){y.globalCompositeOperation='lighter';const L=y.lineWidth,a=Math.min(1,k*1.4);y.rotate(t*.12);
   // a soft pool of each colour under its quarter
   for(let i=0;i<4;i++){const b=i*PI/2+PI/4,px=cos(b)*R0*.55,py=sin(b)*R0*.55,G=y.createRadialGradient(px,py,0,px,py,R0*.6);G.addColorStop(0,EL[i][0]+'55');G.addColorStop(1,EL[i][0]+'00');y.globalAlpha=a*.8;y.fillStyle=G;y.beginPath();y.arc(px,py,R0*.6,0,TAU);y.fill()}
   for(let i=0;i<4;i++){const a0=i*PI/2+.09,a1=a0+(PI/2-.18)*cl(k*1.3,0,1);y.strokeStyle=EL[i][0];y.globalAlpha=a;y.lineWidth=20;y.beginPath();y.arc(0,0,R0,a0,a1);y.stroke();y.strokeStyle=EL[i][1];y.lineWidth=4;y.stroke();
    y.lineWidth=3;y.globalAlpha=a*.8;y.beginPath();y.arc(0,0,R0*.86,a0+.1,a1-.1);y.stroke();
    const m=a0+PI/4,mx=cos(m)*R0*.73,my=sin(m)*R0*.73;y.fillStyle=EL[i][0];y.strokeStyle=EL[i][0];y.globalAlpha=a;y.save();y.translate(mx,my);y.rotate(m+PI/2);mark(y,i,0,0,R0*.075);y.restore()}
   y.globalAlpha=a*.6;for(let i=0;i<72;i++){const b=i*TAU/72,l=i%6?.04:.08;y.strokeStyle=EL[((b+.09)/(PI/2))|0&3]?EL[(((b)/(PI/2))|0)&3][0]:'#fff';y.lineWidth=3;y.beginPath();y.moveTo(cos(b)*R0*.9,sin(b)*R0*.9);y.lineTo(cos(b)*R0*(.9-l),sin(b)*R0*(.9-l));y.stroke()}
   // a vortex at the centre, drawn inward
   y.rotate(-t*.42);for(let i=0;i<12;i++){y.strokeStyle=EL[i%4][0];y.globalAlpha=a*.55;y.lineWidth=4;y.beginPath();for(let j=0;j<=14;j++){const v=j/14,b=i*TAU/12+v*1.9,r=R0*(.6-.46*v)*cl(k*1.6-v*.4,0,1);y[j?'lineTo':'moveTo'](cos(b)*r,sin(b)*r)}y.stroke()}
   y.globalAlpha=a;y.strokeStyle='#fff6e0';y.lineWidth=3;y.beginPath();y.arc(0,0,R0*.13,0,TAU);y.stroke();y.lineWidth=L},
  pose:{gather:{nh:[170,470],fh:[150,250],wa:.72,lean:.02},
   hero:{nh:[210,260],fh:[290,160],wa:-.95,lean:-.06,py:16,nf:[-200,0],ff:[230,0]},
   piece:{nh:[160,480],fh:[60,500],wa:.6},
   windup:{nh:[-170,150],fh:[50,170],wa:-.06,lean:-.14,py:50,nf:[-210,0],ff:[240,0]}},
  spark(x,c,A){A0=A;const u=c.u,L=A.q.wl0,a=-.32+u*.06,X=A.lerp(380,300,u),Y=650;
   A.view(x,c.C,1,y=>{for(let i=0;i<4;i++){const ph=c.t*2.4+i*PI/2,v=cl((c.t-.1-i*.12)/1,0,1),d=lerp(-.25,.62,v)*L,px=X+cos(a)*d-sin(a)*sin(ph)*60,py=Y+sin(a)*d+cos(a)*sin(ph)*60;if(v<=0||v>=1)continue;A.glow(y,px,py,110,EL[i][0],.8);A.glow(y,px,py,26,'#ffffff',.8);A.sparks(y,30+i,(c.t*3)%.5,px,py,8,300,EL[i][1],.4,200)}})},
  burst(y,k,t,A){A0=A;y.globalCompositeOperation='lighter';const xs=[300,620,1300,1620];for(let i=0;i<4;i++){const x0=xs[i],h=1150*k*(.85+.15*sin(t*3+i)),w=90+40*sin(t*5+i);const G=y.createLinearGradient(0,1080,0,1080-h);G.addColorStop(0,EL[i][1]);G.addColorStop(.5,EL[i][0]+'aa');G.addColorStop(1,EL[i][0]+'00');y.fillStyle=G;y.beginPath();y.moveTo(x0-w,1080);y.quadraticCurveTo(x0-w*.3,1080-h*.6,x0+sin(t*4+i)*30,1080-h);y.quadraticCurveTo(x0+w*.3,1080-h*.6,x0+w,1080);y.fill()}},
  piece(x,c,A,i){A0=A;if(c.t<.5){const f=1-c.t/.5;A.view(x,c.C,1,y=>{for(let j=0;j<4;j++){const a=c.t*5+j*PI/2,r=lerp(700,120,ez(c.t/.5));A.glow(y,A.W/2+cos(a)*r,A.H/2+sin(a)*r*.5,90,EL[j][0],.7*f)}})}},
  windup(x,c,A){A0=A;const k=A.ez(c.u),P=A.q.pose.windup,s=.95,X=A.W/2+60*s,Y=A.H/2+1150*s;A.view(x,c.C,1,y=>{const T=tipOf(A,X,Y,s,P,1,.42);
   const S=[[A.W*.55,-260],[A.W+260,A.H*.1],[A.W+260,A.H+200],[A.W*.45,A.H+260]];for(let i=0;i<4;i++){const C1=[(S[i][0]+T[0])/2+[260,300,300,-200][i],(S[i][1]+T[1])/2+[-120,-200,200,120][i]];stream(y,i,S[i],C1,T,ez(c.t/.75-i*.06),c.T,46,.9)}
   A.glow(y,T[0],T[1],160+200*k,'#ffffff',.5*k)})},
  // Convergence: the four meet on the point, the thrust detonates, the ground answers with four pillars, and they break
  sig:{hits:[.45,1.3,2.0],draw(x,c,A){A0=A;const{q}=A,t=c.t,sp=q.sp,h0=.45,h1=1.3,h2=2.0;A.bg(x,c,t<h0?.45:.3);
   const X0=520,Pa={nh:[-200,140],fh:[30,170],wa:-.1,lean:-.16,py:70,nf:[-230,0],ff:[250,0],hd:{yaw:.3,eye:{open:.7,angry:.8},brow:{angry:.9},mouth:{open:.2,smile:-.2}}},
    Pb={nh:[360,150],fh:[230,170],wa:-.06,lean:.3,py:120,nf:[-320,0],ff:[330,0],hd:{yaw:.3,eye:{open:.85,angry:.85},brow:{angry:.9},mouth:{open:.5,smile:-.3}}},
    Pc={nh:[330,430],fh:[230,330],wa:.78,lean:.22,py:110,nf:[-260,0],ff:[300,0],hd:{yaw:.3,eye:{open:.8,angry:.9},brow:{angry:.9},mouth:{open:.55,smile:-.35}}},
    Pe={nh:[260,40],fh:[200,80],wa:-1.2,lean:-.1,py:60,nf:[-260,0],ff:[300,0],hd:{yaw:.3,eye:{open:.9,angry:1},brow:{angry:1},mouth:{open:.35,smile:-.35}}},
    Pf={nh:[470,300],fh:[-60,280],wa:.55,lean:.26,py:140,nf:[-330,0],ff:[350,0],hd:{yaw:.32,eye:{open:.95,angry:1},brow:{angry:1},mouth:{open:.7,smile:-.45}}},
    Pd={nh:[220,420],fh:[80,380],wa:.9,lean:.04,py:30,nf:[-190,0],ff:[210,0],hd:{yaw:.12,eye:{open:.85,angry:.4},brow:{angry:.3},mouth:{open:.05,smile:.1}}};
   const s=.52,hx=t<h0?X0-40*ez(t/h0):X0+60,P=t<h0?Pa:t<h1-.12?Pb:t<h2-.14?Pc:t<h2?lp(Pc,Pe,ez((t-h2+.14)/.1)):t<h2+.12?lp(Pe,Pf,A.eo((t-h2)/.12)):t<2.35?Pf:lp(Pf,Pd,ez((t-2.35)/.4)),T=tipOf(A,hx,1000,s,P);
   A.view(x,c.C,1,y=>{
    // the floor sigil under the hero
    A.sigil(y,hx,1000,420,1,c.T,.5);
    // phase A: the four come in from the corners
    if(t<h0+.06){const u=ez(t/h0),S=[[A.W*.62,-300],[A.W+300,A.H*.18],[A.W+300,A.H+220],[A.W*.5,A.H+300]];for(let i=0;i<4;i++){const C1=[(S[i][0]+T[0])/2+[300,260,260,-220][i],(S[i][1]+T[1])/2+[-140,-220,200,160][i]];stream(y,i,S[i],C1,T,cl(u*1.15-i*.05,0,1),c.T,56,1)}A.glow(y,T[0],T[1],120+260*u,'#ffffff',.6*u);for(let i=0;i<4;i++){const a=c.T*9+i*PI/2,r=90*(1-u)+16;orb(y,i,T[0]+cos(a)*r,T[1]+sin(a)*r,22,c.T,u)}}
    // hit 0: the detonation at the point
    if(t>=h0){const v=t-h0,D=tipOf(A,X0+60,1000,s,Pb);const dx=D[0],dy=D[1];
     A.glow(y,dx,dy,650*A.eo(v/.45),'#ffffff',Math.max(0,.6-v*.9));A.glow(y,dx,dy,330*A.eo(v/.25),'#ffd8a0',Math.max(0,.75-v*1.3));A.glow(y,dx,dy,120,'#ffffff',Math.max(0,.9-v*2.2));
     for(let i=0;i<4;i++){const vv=v-i*.05;if(vv<=0)continue;const r=A.eo(vv/.55)*(380+i*70),al=Math.max(0,1-vv/.62);y.save();y.globalCompositeOperation='lighter';y.globalAlpha=al;y.strokeStyle=EL[i][0];y.lineWidth=30*al+4;y.beginPath();y.ellipse(dx+r*.3,dy,r,r*.5,0,0,TAU);y.stroke();y.strokeStyle=EL[i][1];y.lineWidth=8*al+1;y.stroke();y.restore()}
     {const fl=[[-.5,0],[.15,1],[.9,3],[-1.2,2]];y.save();y.globalCompositeOperation='lighter';for(const[a,i]of fl){const L=A.eo(v/.35)*(560+120*(i%3))*(1-cl((v-.3)/.38,0,1)),w=L*.15;if(L<=2)continue;y.save();y.translate(dx,dy);y.rotate(a);y.globalAlpha=.8;const G=y.createLinearGradient(0,0,L,0);G.addColorStop(0,EL[i][1]+'dd');G.addColorStop(.3,EL[i][0]+'aa');G.addColorStop(1,EL[i][0]+'00');y.fillStyle=G;y.beginPath();y.moveTo(0,-w*.3);y.quadraticCurveTo(L*.5,-w,L,0);y.quadraticCurveTo(L*.5,w,0,w*.3);y.closePath();y.fill();y.restore()}y.restore()}
     A.painter(y,'slash',dx-120,dy,620,v/.55,-.1,1.4,7);A.painter(y,'hit',dx,dy,700,v/.55,0,3,7);
     // what flies: flame petals, ice shards, stones, wind
     const R=A.sr(77);y.save();for(let i=0;i<48;i++){const el=i%4,a=R()*TAU,sp2=(500+R()*900)*(el==3?.8:1),tt=v,dd=sp2*tt*(1-tt*.35),px=dx+cos(a)*dd,py=dy+sin(a)*dd*.8+(el==3?520*tt*tt:0),al=cl(1-tt/1.05,0,1);if(al<=0)continue;y.globalAlpha=al;y.save();y.translate(px,py);y.rotate(a+(el==3?tt*6:0));y.scale(1.7,1.7);if(el==1){y.fillStyle='#dff6ff';y.strokeStyle='#2a7ab8';y.lineWidth=2;y.beginPath();y.moveTo(-30,0);y.lineTo(0,-9);y.lineTo(56,0);y.lineTo(0,9);y.closePath();y.fill();y.stroke()}else if(el==3){y.fillStyle='#4a3428';y.strokeStyle='#120804';y.lineWidth=2;y.beginPath();y.moveTo(-20,-6);y.lineTo(-8,-18);y.lineTo(12,-15);y.lineTo(22,2);y.lineTo(10,16);y.lineTo(-14,13);y.closePath();y.fill();y.stroke();y.fillStyle='#9a7a5a';y.beginPath();y.moveTo(-20,-6);y.lineTo(-8,-18);y.lineTo(12,-15);y.lineTo(4,-4);y.closePath();y.fill();y.strokeStyle='#ff9a3a';y.beginPath();y.moveTo(-6,-2);y.lineTo(4,6);y.lineTo(14,2);y.stroke()}else if(el==0){y.globalCompositeOperation='lighter';y.rotate(PI/2);y.fillStyle='#ff6a2a';mark(y,0,0,0,30);y.fillStyle='#ffe0a0';mark(y,0,0,6,14)}else{y.globalCompositeOperation='lighter';y.strokeStyle='#d8ffe8';y.lineWidth=3;y.beginPath();y.arc(0,0,40,-.6,.9);y.stroke()}y.restore()}y.restore();
     // the drill: four strands twisted from the point to the far edge
     if(v<.68){const al=1-v/.68,len=A.eo(v/.3)*1500;y.save();y.globalCompositeOperation='lighter';y.lineCap='round';for(let i=0;i<4;i++){y.strokeStyle=EL[i][0];y.globalAlpha=al;y.lineWidth=16;y.beginPath();for(let j=0;j<=40;j++){const u=j/40,xx=dx+u*len,yy=dy+sin(u*16-c.T*30+i*PI/2)*60*(1-u*.5);y[j?'lineTo':'moveTo'](xx,yy)}y.stroke()}y.restore();A.glow(y,dx+len,dy,200,'#ffffff',al*.7)}}
    // hit 1: the ground answers with four pillars
    if(t>=h1){const v=t-h1,xs=[980,1220,1460,1700];for(let i=0;i<4;i++){const vv=v-i*.06;if(vv<=0)continue;const px=xs[i],gy=1010+i*6,up=A.eo(vv/.22),bt=h2+.02+i*.035,brk=cl((t-bt)/.07,0,1),hgt=(i==1?640:i==3?560:820)*up,al=1-brk;pillar(y,A,i,px,gy,hgt*(1+.06*brk),c.T,al,vv);
      // a crack from the hero to the pillar
      if(brk<1){y.save();y.strokeStyle=EL[i][0];y.globalCompositeOperation='lighter';y.globalAlpha=(1-brk)*.8;y.lineWidth=5;y.beginPath();y.moveTo(hx+60,1006);const n=8;for(let j=1;j<=n;j++){const u=j/n*cl(vv/.15,0,1);y.lineTo(lerp(hx+60,px,u),lerp(1006,gy,u)+((j*37+i*13)%23-11))}y.stroke();y.restore()}
      if(t>=bt)shatter(y,A,i,px,gy,hgt,t-bt,c.T)}
     const G0=tipOf(A,hx,1000,s,Pc,1,.66);A.glow(y,G0[0],1000,420*A.eo(v/.3),'#ffe8c0',Math.max(0,.8-v));A.sparks(y,57,v,G0[0],1000,30,900,'#d8b070',.7,1400);
     if(t<h2)for(let i=0;i<4;i++){const r=A.eo((v-i*.05)/.6)*(500+i*140),al=Math.max(0,1-v/.7);if(r<=0)continue;y.save();y.globalCompositeOperation='lighter';y.globalAlpha=al;y.strokeStyle=EL[i][0];y.lineWidth=12;y.beginPath();y.ellipse(G0[0],1004,r,r*.2,0,0,TAU);y.stroke();y.restore()}}
    if(t>=h2-.02){const v=Math.max(0,t-h2),H0=tipOf(A,hx,1000,s,Pf,1,0),cx=H0[2],cy=H0[3];
     // the spear's own arc, then four crescents of the four flung across the pillars
     A.painter(y,'slash',cx,cy,560,v/.42,.2,1.45,7);
     if(v<.5){const sw=A.eo(v/.12),R0=lerp(420,1250,A.eo(v/.3));for(let i=0;i<4;i++){A.crescent(y,cx,cy,R0-i*46,-1.05,-1.05+1.9*sw,70-i*10,EL[i][0],(1-v/.5)*.85,i==0)}}
     A.glow(y,1340,640,700*A.eo(v/.35),'#cfe8ff',Math.max(0,.34-v*.7));for(let i=0;i<4;i++){const r=A.eo((v-i*.04)/.7)*(900+i*120),al=Math.max(0,1-v/.8);if(r<=0)continue;y.save();y.globalCompositeOperation='lighter';y.globalAlpha=al;y.strokeStyle=EL[i][0];y.lineWidth=14;y.beginPath();y.ellipse(hx+80,1004,r,r*.22,0,0,TAU);y.stroke();y.restore()}}
    A.hero(c,y,hx,1000,s,P,{wind:t<h0?.7:1,act:{rim:[t<h1?'#ffc890':'#7ad8ff',1,-8,-3]}});
    if(t<h0)A.speedLines(y,T[0],T[1],31,c.T,'rgba(255,240,220,.85)',.45*ez(t/h0),36,260)});
   if(A.lit(t,h0,.07)||A.lit(t,h1,.06)||A.lit(t,h2,.06))A.impact(x);if(t>h0&&t<h0+.2)A.rect(x,'#fff4e0',.55*(1-(t-h0)/.2));if(t>h2&&t<h2+.2)A.rect(x,'#e8f8ff',.32*(1-(t-h2)/.2))}}
 });
 // a pillar breaking: pieces of its own element thrown outward with gravity, and sparks
 function shatter(y,A,i,px,gy,h,v,T){if(v>1.2)return;const e=EL[i],Rn=A.sr(300+i*7);y.save();A.glow(y,px,gy-h*.5,h*.7,e[0],Math.max(0,.8-v*2));
  for(let j=0;j<11;j++){const a=-PI*(.05+.9*Rn()),sp=(420+Rn()*760),h0=gy-h*(.1+.85*Rn()),xx=px+(Rn()-.5)*120+cos(a)*sp*v,yy=h0+sin(a)*sp*v+900*v*v,sz=(1+Rn()*1.2)*(1-v*.35),rt=Rn()*6+v*(Rn()-.5)*14,al=cl(1-v/1.1,0,1);if(al<=0)continue;y.save();y.globalAlpha=al;y.translate(xx,yy);y.rotate(rt);y.scale(sz,sz);
   if(i==0){y.globalCompositeOperation='lighter';y.fillStyle='#ff6a2a';mark(y,0,0,0,34);y.fillStyle='#ffe0a0';mark(y,0,0,7,16)}
   else if(i==1){y.fillStyle=j%2?'#dff6ff':'#8ae0ff';y.strokeStyle='#1a5a9a';y.lineWidth=2.4;y.beginPath();y.moveTo(-30,4);y.lineTo(-6,-12);y.lineTo(40,-2);y.lineTo(6,12);y.closePath();y.fill();y.stroke();y.strokeStyle='#ffffff';y.beginPath();y.moveTo(-6,-12);y.lineTo(6,12);y.stroke()}
   else if(i==2){y.globalCompositeOperation='lighter';y.strokeStyle=j%2?e[1]:e[0];y.lineWidth=5;y.lineCap='round';y.beginPath();y.arc(0,0,30,-.4,2.4);y.stroke();y.beginPath();y.arc(10,4,14,2.4,5.6);y.stroke()}
   else{y.fillStyle='#3a2c2c';y.strokeStyle='#0c0606';y.lineWidth=2.4;y.fillRect(-24,-18,48,36);y.strokeRect(-24,-18,48,36);y.fillStyle='#b89a7a';y.fillRect(-24,-18,48,9);y.strokeStyle='#ff7a2a';y.lineWidth=3;y.beginPath();y.moveTo(-18,6);y.lineTo(-2,0);y.lineTo(16,8);y.stroke()}
   y.restore()}
  y.restore();A.sparks(y,90+i,v,px,gy-h*.5,24,1000,e[1],.8,900)}
 // one pillar of an element rising from the ground
 function pillar(y,A,i,px,gy,h,T,al,v){if(h<=4||al<=0)return;y.save();y.globalAlpha=al;const e=EL[i];
  if(i==0){y.globalCompositeOperation='lighter';for(let j=0;j<5;j++){const w=(110-j*18)*(1+.1*sin(T*9+j)),hh=h*(1-j*.12),G=y.createLinearGradient(0,gy,0,gy-hh);G.addColorStop(0,j>2?'#fff0c0':'#ff9a3a');G.addColorStop(.6,j>2?'#ffb04acc':'#ff5a1acc');G.addColorStop(1,'#ff3a0a00');y.fillStyle=G;y.beginPath();y.moveTo(px-w,gy);y.bezierCurveTo(px-w*.9,gy-hh*.5,px-w*.2+sin(T*7+j)*30,gy-hh*.8,px+sin(T*6+j)*24,gy-hh);y.bezierCurveTo(px+w*.2+sin(T*8+j)*30,gy-hh*.8,px+w*.9,gy-hh*.5,px+w,gy);y.fill()}
   for(let j=0;j<14;j++){const q=(T*1.6+hsr(j))%1,xx=px+(hsr(j+9)-.5)*180+sin(T*5+j)*20,yy=gy-h*(.2+q*.95),sz=(26-q*18);y.globalAlpha=al*(1-q);y.fillStyle=j%3?'#ff8a3a':'#ffe0a0';mark(y,0,xx,yy,sz)}}
  else if(i==1){const cr=[[0,1,0,60],[-60,.7,-.25,44],[56,.62,.22,40],[-110,.42,-.45,30],[104,.4,.42,28]];for(const[dx,hk,a,w]of cr){y.save();y.translate(px+dx,gy);y.rotate(a);const hh=h*hk,G=y.createLinearGradient(-w,0,w,0);G.addColorStop(0,'#1a5a9a');G.addColorStop(.45,'#8ae0ff');G.addColorStop(.55,'#ffffff');G.addColorStop(1,'#4aa0e0');y.fillStyle=G;y.strokeStyle='#0a3060';y.lineWidth=3;y.beginPath();y.moveTo(-w,0);y.lineTo(-w*.8,-hh*.85);y.lineTo(0,-hh);y.lineTo(w*.8,-hh*.85);y.lineTo(w,0);y.closePath();y.fill();y.stroke();y.restore()}y.globalCompositeOperation='lighter';A.glow(y,px,gy-h*.5,h*.6,e[0],.5)}
  else if(i==2){y.globalCompositeOperation='lighter';y.lineCap='round';for(let j=0;j<18;j++){const u=j/18,yy=gy-u*h,r=30+u*170,a0=T*12+j*.8;y.globalAlpha=al*(.4+.5*u);y.strokeStyle=j%3?e[0]:e[1];y.lineWidth=5+u*4;y.beginPath();y.ellipse(px+sin(T*3+u*4)*20*u,yy,r,r*.24,0,a0,a0+3.6);y.stroke()}}
  else{// a cluster of basalt columns, lit on top, magma in the joints
   for(const[dx,hk,w]of[[-78,.62,52],[78,.74,50],[0,1,62],[-36,.4,40],[50,.36,40]]){const x0=px+dx,top=gy-h*hk;y.fillStyle='#3a2c2c';y.strokeStyle='#0c0606';y.lineWidth=3;y.beginPath();y.moveTo(x0-w,gy);y.lineTo(x0-w,top+12);y.lineTo(x0-w*.5,top);y.lineTo(x0+w*.5,top);y.lineTo(x0+w,top+12);y.lineTo(x0+w,gy);y.closePath();y.fill();y.stroke();const G=y.createLinearGradient(x0-w,0,x0+w,0);G.addColorStop(0,'rgba(255,190,120,.0)');G.addColorStop(.35,'rgba(255,200,140,.35)');G.addColorStop(.5,'rgba(0,0,0,0)');G.addColorStop(1,'rgba(0,0,0,.35)');y.fillStyle=G;y.fillRect(x0-w,top+12,w*2,gy-top-12);y.fillStyle='#b89a7a';y.beginPath();y.moveTo(x0-w,top+12);y.lineTo(x0-w*.5,top);y.lineTo(x0+w*.5,top);y.lineTo(x0+w,top+12);y.lineTo(x0+w*.5,top+22);y.lineTo(x0-w*.5,top+22);y.closePath();y.fill();y.stroke();y.save();y.globalCompositeOperation='lighter';y.strokeStyle='#ff7a2a';y.lineWidth=4;y.beginPath();for(let j=1;j<4;j++){const yy=top+(gy-top)*j/4;y.moveTo(x0-w,yy);y.lineTo(x0+w,yy+8)}y.stroke();y.restore()}
   const R=A.sr(71);for(let j=0;j<9;j++){const a=-PI/2+(R()-.5)*1.6,sp2=300+R()*500,tt=v,xx=px+cos(a)*sp2*tt,yy=gy-h+sin(a)*sp2*tt+700*tt*tt,r=10+R()*18;y.fillStyle='#5a4434';y.save();y.translate(xx,yy);y.rotate(tt*5+j);y.fillRect(-r,-r*.7,r*2,r*1.4);y.restore()}}
  y.restore()}
})()}catch(e){console.error('EVC elementalist',e)}
