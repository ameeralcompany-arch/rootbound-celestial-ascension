// ===== Stormcaller evolution cinematic: Tempest Herald. A basalt plateau under a living thunderhead; a cyclone sigil on the stones; storm plate with a bolt on the chest, a jagged five-spike crown, a storm-cloud mantle with a zigzag hem;
// Skyfall Verdict: the hammer is raised, the sky strikes it, the charged hammer slams the ground and the discharge runs the whole plain before erupting back up into the clouds. =====
try{(()=>{const F=()=>FILM1,sin=Math.sin,cos=Math.cos,TAU=6.2832,PI=Math.PI;
 const YEL='#fff07a',NAVY='#1a2a70',DEEP='#0a1030',INK='#070a22',SLATE='#5a6aaa',ICE='#bfe8ff';
 // a seeded generator (deterministic) and a hash
 const rng=s=>{let a=(s|0)+0x9e3779b9;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
 const hh=i=>{const v=sin(i*12.9898+78.233)*43758.5453;return v-Math.floor(v)};
 const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,ease=k=>{k=cl(k,0,1);return 1-Math.pow(1-k,3)},eo=k=>ease(k);
 // ---------- lightning: a jagged main channel with forks, stroked glow / body / white core
 function boltPath(x0,y0,x1,y1,R,o,P){const n=o.n||12,jag=o.jag==null?40:o.jag,dx=x1-x0,dy=y1-y0,D=Math.hypot(dx,dy)||1,nx=-dy/D,ny=dx/D,pts=[[x0,y0]];let off=0;
  for(let i=1;i<n;i++){const u=i/n;off=off*.45+(R()-.5)*2*jag;const tp=Math.pow(sin(u*PI),.6);pts.push([x0+dx*u+nx*off*tp,y0+dy*u+ny*off*tp])}pts.push([x1,y1]);
  P.moveTo(x0,y0);for(let i=1;i<pts.length;i++)P.lineTo(pts[i][0],pts[i][1]);return pts}
 function bolt(g,x0,y0,x1,y1,seed,o){o=o||{};const R=rng(seed),M=new Path2D(),B=new Path2D(),pts=boltPath(x0,y0,x1,y1,R,o,M),D=Math.hypot(x1-x0,y1-y0),base=Math.atan2(y1-y0,x1-x0);
  const nb=o.br||0;for(let b=0;b<nb;b++){const j=1+Math.floor(R()*(pts.length-3)),p=pts[j],a=base+(R()<.5?-1:1)*(.35+R()*.6),L=D*(o.bl||.28)*(.4+R()*.6);boltPath(p[0],p[1],p[0]+cos(a)*L,p[1]+sin(a)*L,R,{n:6,jag:(o.jag==null?40:o.jag)*.6},B)}
  const w=o.w||4,a=o.a==null?1:o.a,c=o.col||YEL;g.save();g.lineJoin='round';g.lineCap='round';
  if(o.dark){g.strokeStyle=o.col||DEEP;g.globalAlpha=a;g.lineWidth=w*2.2;g.stroke(M);g.lineWidth=w*1.2;g.stroke(B);g.restore();return pts}
  g.globalCompositeOperation='lighter';g.strokeStyle=c;g.globalAlpha=a*.26;g.lineWidth=w*4.5;g.stroke(M);g.lineWidth=w*2.6;g.stroke(B);g.globalAlpha=a*.75;g.lineWidth=w*2;g.stroke(M);g.lineWidth=w;g.stroke(B);g.strokeStyle='#ffffff';g.globalAlpha=a;g.lineWidth=w*.8;g.stroke(M);g.lineWidth=w*.45;g.stroke(B);g.restore();return pts}
 // where the hammer head is, in body units, for a pose (the weapon is drawn from the hand target nh)
 const WL=1150;
 function headAt(L,P,len,f){const gd=L.gd|0,sw=gd==1?1.1:gd==2?.86:1,ln=P.lean||0,hx=P.px||0,hy=-830+(P.py||0),c=cos(ln),s=sin(ln),x=-128*sw,y=-372,NS=[hx+x*c-y*s,hy+x*s+y*c],NH=[NS[0]+P.nh[0],NS[1]+P.nh[1]],r=(len||WL)*(f||.74);return[NH[0]+cos(P.wa)*r,NH[1]+sin(P.wa)*r,NH[0],NH[1]]}
 // ---------- the outfit
 const steel=(g,y0,y1)=>{const G=g.createLinearGradient(0,y0,0,y1);G.addColorStop(0,'#8a9ae8');G.addColorStop(.3,'#3e50a8');G.addColorStop(.75,'#1c286e');G.addColorStop(1,'#2a2a5a');return G};
 const gold=(g,y0,y1)=>{const G=g.createLinearGradient(0,y0,0,y1);G.addColorStop(0,YEL);G.addColorStop(.35,'#f2c83a');G.addColorStop(.7,'#c89a1e');G.addColorStop(1,'#8a6410');return G};
 function poly(g,pts,fill,ln,lw){g.beginPath();pts.forEach((p,i)=>g[i?'lineTo':'moveTo'](p[0],p[1]));g.closePath();g.fillStyle=fill;g.fill();if(ln){g.strokeStyle=ln;g.lineWidth=lw||3;g.stroke()}}
 // a cumulus of overlapping puffs with a toon outline
 function cloud(g,P,c0,c1,ln,lw){const p=new Path2D();for(const[x,y,r]of P){p.moveTo(x+r,y);p.arc(x,y,r,0,TAU)}g.strokeStyle=ln;g.lineWidth=lw*2;g.stroke(p);let mnY=1e9,mxY=-1e9;for(const[,y,r]of P){mnY=Math.min(mnY,y-r);mxY=Math.max(mxY,y+r)}const G=g.createLinearGradient(0,mnY,0,mxY);G.addColorStop(0,c0);G.addColorStop(1,c1);g.fillStyle=G;g.fill(p);g.save();g.clip(p);g.fillStyle='rgba(255,255,255,.18)';for(const[x,y,r]of P){g.beginPath();g.ellipse(x-r*.25,y-r*.35,r*.55,r*.32,-.3,0,TAU);g.fill()}g.restore()}
 function pauldron(g,X,Y,k,s,flip,t){if(k<=0)return;g.save();g.translate(X,Y);g.scale(s*(flip?-1:1)*k,s*k);
  for(let i=1;i>=0;i--){const y=i*50,w=150-i*20,P=[[-w,y+30],[-w*.86,y-58],[w*.15,y-82],[w*.92,y-46],[w*1.04,y+28]],Z=[[w*1.04,y+28],[w*.62,y+56],[w*.4,y+30],[w*.02,y+66],[-w*.3,y+36],[-w*.62,y+62],[-w,y+30]];
   g.beginPath();P.forEach((p,j)=>g[j?'lineTo':'moveTo'](p[0],p[1]));Z.forEach(p=>g.lineTo(p[0],p[1]));g.closePath();g.fillStyle=steel(g,y-82,y+66);g.fill();g.strokeStyle=INK;g.lineWidth=3;g.stroke();
   g.save();g.clip();g.fillStyle='rgba(190,210,255,.28)';g.beginPath();g.moveTo(w*.15,y-82);g.lineTo(w*.92,y-46);g.lineTo(w*.6,y+10);g.lineTo(w*.05,y-30);g.closePath();g.fill();g.restore();
   g.strokeStyle=YEL;g.lineWidth=6;g.beginPath();Z.forEach((p,j)=>g[j?'lineTo':'moveTo'](p[0],p[1]-6));g.stroke()}
  // a yellow bolt stud
  g.fillStyle=YEL;g.strokeStyle='#5a4210';g.lineWidth=2;g.beginPath();g.moveTo(6,-40);g.lineTo(-14,-6);g.lineTo(0,-6);g.lineTo(-8,22);g.lineTo(16,-14);g.lineTo(2,-14);g.closePath();g.fill();g.stroke();g.restore()}
 // the chest bolt: a solid three-segment zigzag (torso space)
 const CHB=[[-40,-380],[30,-380],[0,-300],[50,-300],[-30,-150],[-5,-260],[-55,-260]];
 const dress={
  back(g,J){const k=J.k.p3||0;if(k<=0)return;const e=ease(k),w=J.wnd,t=J.t,A=J.rot(-128,-384),B=J.rot(104,-384),len=lerp(220,930,e),sw=sin(t*1.7)*34+w*440,bx=A[0]-100-sw,by=A[1]+len,spread=330*e+90;
   const p=new Path2D(),Z=[];p.moveTo(A[0],A[1]);p.bezierCurveTo(A[0]-90-sw*.2,A[1]+len*.3,bx-40,by-len*.35,bx-60,by);
   // the zigzag hem: lightning teeth, long and short
   const n=7;for(let i=1;i<=n;i++){const u=i/n,X=bx-60+u*spread,dep=(i%2?70:-14)+(i==4?30:0)+sin(t*3+i)*6;Z.push([X-spread/n*.5,by+dep*e]);Z.push([X,by-(i%2?0:24)*e])}
   Z.forEach(q=>p.lineTo(q[0],q[1]));p.bezierCurveTo(bx-60+spread+40,by-len*.4,B[0]+40-sw*.1,B[1]+len*.3,B[0],B[1]);p.closePath();
   const G=g.createLinearGradient(0,A[1],0,by+60);G.addColorStop(0,'#4a5cc0');G.addColorStop(.45,'#2a3a92');G.addColorStop(1,'#141c58');g.fillStyle=G;g.fill(p);g.strokeStyle=INK;g.lineWidth=3;g.stroke(p);
   g.save();g.clip(p);
   // the pale storm lining, turned out along the trailing edge where the wind flips it: the value break against the dark sky
   {const Lp=new Path2D();Lp.moveTo(A[0],A[1]+40);Lp.bezierCurveTo(A[0]-90-sw*.2,A[1]+len*.3,bx-40,by-len*.35,bx-60,by+40);const LG=g.createLinearGradient(0,A[1],0,by);LG.addColorStop(0,'#8a98d0');LG.addColorStop(.5,ICE);LG.addColorStop(1,'#d8ecff');g.strokeStyle=LG;g.lineWidth=110*e;g.stroke(Lp);
    g.strokeStyle='rgba(10,16,52,.55)';g.lineWidth=4;g.save();g.translate(52*e,0);g.stroke(Lp);g.restore()}
   // folds, a sheen of storm light down the middle, and a vein of lightning that flickers
   {const S=g.createLinearGradient(A[0],0,bx+spread,0);S.addColorStop(0,'rgba(140,160,255,0)');S.addColorStop(.5,'rgba(140,160,255,.16)');S.addColorStop(1,'rgba(140,160,255,0)');g.fillStyle=S;g.fillRect(bx-200,A[1],spread+500,len+120)}
   g.strokeStyle='rgba(4,6,24,.42)';g.lineWidth=9;for(let i=0;i<4;i++){g.beginPath();g.moveTo(A[0]+i*46,A[1]+60);g.quadraticCurveTo(bx-20+i*70,by-len*.5,bx-30+i*spread/4,by+10);g.stroke()}
   const fl=Math.floor(t*9);if(hh(fl)>.45&&e>.5){bolt(g,A[0]+40+hh(fl+1)*80,A[1]+60,bx+spread*(.2+hh(fl+2)*.5),by-20,fl*7+3,{n:9,jag:34,w:3,br:2,a:.75})}
   g.restore();
   g.strokeStyle=YEL;g.lineWidth=12;g.lineJoin='miter';g.beginPath();g.moveTo(bx-60,by);Z.forEach(q=>g.lineTo(q[0],q[1]-8));g.stroke();g.strokeStyle='#fffbe0';g.lineWidth=3;g.stroke();g.lineJoin='round';
   // the storm-cloud collar at the shoulders
   const s=e,C=[[-150,-380,74],[-96,-420,66],[-40,-436,58],[30,-432,60],[86,-414,64],[130,-380,58],[-176,-330,56],[156,-336,50]].map(([x,y,r],i)=>{const q=J.rot(x+sin(t*1.3+i)*5,y+cos(t*1.1+i)*4);return[q[0],q[1],r*s]});
   cloud(g,C,'#8a98d0','#2a3672',INK,3)},
  torso(g,J){const k=J.k.p1||0;if(k<=0)return;const e=ease(k);g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);g.translate(0,(1-e)*-60);g.globalAlpha=Math.min(1,k*2);
   poly(g,[[-114,-394],[-48,-414],[52,-414],[104,-394],[96,-264],[70,-162],[24,-118],[-30,-118],[-84,-162],[-106,-264]],steel(g,-414,-110),INK,3);
   g.save();g.beginPath();g.moveTo(-114,-394);g.lineTo(104,-394);g.lineTo(70,-162);g.lineTo(-84,-162);g.closePath();g.clip();
   g.fillStyle='rgba(200,215,255,.26)';g.beginPath();g.moveTo(40,-414);g.lineTo(104,-394);g.lineTo(80,-200);g.lineTo(44,-250);g.closePath();g.fill();
   g.fillStyle='rgba(255,255,255,.45)';const gx=-220+(J.t*300%560);g.beginPath();g.moveTo(gx,-420);g.lineTo(gx+34,-420);g.lineTo(gx-46,-100);g.lineTo(gx-80,-100);g.closePath();g.fill();g.restore();
   // the bolt on the chest, the class's mark: it hums
   const fl=.6+.4*sin(J.t*23)*sin(J.t*7.3),CP=new Path2D();CHB.forEach((p,i)=>CP[i?'lineTo':'moveTo'](p[0],p[1]));CP.closePath();
   g.save();g.lineJoin='miter';g.globalCompositeOperation='lighter';g.globalAlpha=.5*fl*e;g.strokeStyle=YEL;g.lineWidth=26;g.stroke(CP);g.restore();
   g.save();g.lineJoin='miter';g.fillStyle=YEL;g.fill(CP);g.strokeStyle='#3a2a06';g.lineWidth=5;g.stroke(CP);
   // the lit facet: a white sliver down the upper-left of each segment
   g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.moveTo(-32,-372);g.lineTo(14,-372);g.lineTo(-10,-308);g.lineTo(-20,-308);g.closePath();g.fill();g.beginPath();g.moveTo(32,-292);g.lineTo(40,-292);g.lineTo(-10,-196);g.closePath();g.fill();g.restore();
   g.strokeStyle=YEL;g.lineWidth=7;g.beginPath();g.moveTo(-84,-162);g.lineTo(-30,-118);g.lineTo(24,-118);g.lineTo(70,-162);g.stroke();
   g.fillStyle='#c8d4ff';for(const[x,y]of[[-90,-370],[82,-370],[-78,-200],[58,-200]]){g.beginPath();g.arc(x,y,6,0,TAU);g.fill()}
   g.restore();pauldron(g,J.FS[0]+6,J.FS[1]+30,e,.5,1,J.t)},
  front(g,J){const k=J.k.p1||0;if(k>0)pauldron(g,J.NS[0]-8,J.NS[1]+6,ease(k),.78,0,J.t);
   const k3=J.k.p3||0;if(k3>0){const e=ease(k3),t=J.t,c=J.NS;cloud(g,[[c[0]-56,c[1]-40,40*e],[c[0]-14,c[1]-58,34*e],[c[0]+24,c[1]-46,26*e],[c[0]-86,c[1]-8,30*e]].map(([x,y,r],i)=>[x+sin(t*1.4+i)*4,y,r]),'#9aa8de','#33407e',INK,3)}},
  head(g,J){const k=J.k.p2||0;if(k<=0)return;const e=ease(k),sy=sin(J.yaw||.26),t=J.t,cx=sy*40;
   g.save();g.globalAlpha=Math.min(1,k*2);g.lineJoin='miter';
   // five jagged spikes, each a bolt pointing up, swept back a little by the wind
   const SP=[[-2,72,-.42],[-1,112,-.2],[0,158,0],[1,112,.2],[2,72,.42]];
   for(const[i,h0,lean]of SP){const bx=cx+i*48-Math.abs(i)*sy*6,by=-96+Math.abs(i)*10,h=h0*e,a=lean-J.wnd*.05,ca=cos(a),sa=sin(a);
    const L=[[-17,0],[-7,-h*.42],[-19,-h*.42],[0,-h],[9,-h*.5],[21,-h*.5],[15,0]].map(([x,y])=>[bx+x*ca-y*sa,by+x*sa+y*ca]);
    poly(g,L,gold(g,by-h,by),'#2a2008',3)}
   // the band across the brow
   g.beginPath();g.moveTo(-124,-84);g.quadraticCurveTo(cx,-124,124,-88);g.lineTo(122,-64);g.quadraticCurveTo(cx,-102,-122,-60);g.closePath();g.fillStyle=steel(g,-124,-60);g.fill();g.strokeStyle='#2a2008';g.lineWidth=3;g.stroke();
   g.strokeStyle=YEL;g.lineWidth=5;g.beginPath();g.moveTo(-118,-70);g.quadraticCurveTo(cx,-108,118,-74);g.stroke();
   // a bolt-shaped inlay at the front
   poly(g,[[cx-4,-122],[cx+12,-122],[cx+2,-102],[cx+14,-102],[cx-8,-76],[cx-2,-96],[cx-14,-96]],YEL,'#2a2008',2);
   // one thin yellow arc, now and then, between the two back spikes (plain metal crown otherwise: no glow around the head)
   if(e>.85){const fl=Math.floor(t*14);if(hh(fl*3)>.55){const x0=cx-96+16,y0=-96-72*e+40,x1=cx-48+8,y1=-96-112*e+50,Q=rng(fl*5);g.strokeStyle=YEL;g.lineWidth=1.2;g.beginPath();g.moveTo(x0,y0);for(let i=1;i<4;i++){const u=i/4;g.lineTo(lerp(x0,x1,u)+(Q()-.5)*10,lerp(y0,y1,u)+(Q()-.5)*10)}g.lineTo(x1,y1);g.stroke()}}
   g.restore()}};
 // ---------- the cyclone sigil: rings, a zigzag ring of lightning, four storm arms spiralling in
 function sigil(y,k,t,R0){y.globalCompositeOperation='lighter';const A=Math.min(1,k*1.4);y.lineJoin='round';
  y.save();y.rotate(t*.12);y.strokeStyle=YEL;y.globalAlpha=A;for(const[f,w]of[[1,10],[.93,3],[.6,5],[.16,6]]){y.lineWidth=w;y.beginPath();y.arc(0,0,R0*f,0,TAU);y.stroke()}
  for(let i=0;i<60;i++){const a=i*TAU/60,l=i%5?.03:.07;y.lineWidth=i%5?3:6;y.beginPath();y.moveTo(cos(a)*R0*(.93-l),sin(a)*R0*(.93-l));y.lineTo(cos(a)*R0*.93,sin(a)*R0*.93);y.stroke()}y.restore();
  // the zigzag ring, turning the other way
  y.save();y.rotate(-t*.3);y.strokeStyle='#ffffff';y.globalAlpha=A*.9;y.lineWidth=5;y.beginPath();const n=40;for(let i=0;i<=n;i++){const a=i*TAU/n,r=R0*(i%2?.7:.8);y[i?'lineTo':'moveTo'](cos(a)*r,sin(a)*r)}y.stroke();
  y.strokeStyle=YEL;y.lineWidth=14;y.globalAlpha=A*.3;y.stroke();y.restore();
  // seven arms of the storm, spiralling in
  y.save();y.rotate(t*.55);y.lineCap='round';for(let j=0;j<7;j++){y.globalAlpha=A*.9;const G=[];for(let i=0;i<=22;i++){const u=i/22,r=R0*lerp(.18,.6,u),a=j*TAU/7+u*1.9;G.push([cos(a)*r,sin(a)*r])}y.strokeStyle=YEL;y.lineWidth=8;y.beginPath();G.forEach((p,i)=>y[i?'lineTo':'moveTo'](p[0],p[1]));y.stroke();y.strokeStyle='#ffffff';y.lineWidth=2.5;y.stroke()}y.restore();
  y.globalAlpha=A*.8;y.fillStyle=YEL;y.beginPath();y.arc(0,0,R0*.07,0,TAU);y.fill()}
 // ---------- the far strikes on the horizon: they flash on for a frame or two and are gone (ox,oy shift them with the view)
 function farStrikes(y,ox,oy,t,k){const fl=Math.floor(t*12);y.save();
  if(hh(fl)>.8)bolt(y,ox+300,oy+330,ox+430,oy+770,91+fl%5,{n:16,jag:60,w:5,br:5,bl:.35,a:.9*k});
  if(hh(fl*3+1)>.84)bolt(y,ox+1700,oy+370,ox+1640,oy+740,57+fl%3,{n:12,jag:20,w:2.4,br:2,a:.5*k});y.restore()}
 // ---------- the aura: lightning crawling on the stones and climbing beside the hero, charged motes, driven rain
 function aura(y,X,Y,k,t){if(k<=0)return;farStrikes(y,X-960,Y-1000,t,k);y.globalCompositeOperation='lighter';
  const G=y.createRadialGradient(X,Y,0,X,Y,420);G.addColorStop(0,'rgba(255,240,122,'+(.42*k)+')');G.addColorStop(1,'rgba(255,240,122,0)');y.save();y.translate(X,Y);y.scale(1,.22);y.translate(-X,-Y);y.fillStyle=G;y.fillRect(X-420,Y-420,840,840);y.restore();
  const fl=Math.floor(t*15);
  for(let i=0;i<8;i++){const a=i/8*TAU+t*.6,b=a+.55+hh(i+fl)*.3,r0=260+hh(i*3)*140;if(hh(i*7+fl)<.3)continue;bolt(y,X+cos(a)*r0,Y+sin(a)*r0*.2,X+cos(b)*r0*1.08,Y+sin(b)*r0*.22,fl*13+i,{n:6,jag:12,w:2,a:.85*k})}
  for(let i=0;i<6;i++){const s=i%2?1:-1,x0=X+s*(170+(i>>1)*90)+sin(t*2+i)*12,h=(220+hh(i+fl*2)*320)*k;if(hh(i*5+fl)<.42)continue;bolt(y,x0,Y,x0+s*(30+hh(i+fl)*60),Y-h,fl*17+i,{n:9,jag:22,w:2.4,br:1,a:.9*k})}
  y.fillStyle=YEL;for(let i=0;i<46;i++){const q=(t*.55+hh(i)*1)%1,px=X+(hh(i+3)-.5)*900+sin(t*3+i)*10,py=Y-q*620*k;y.globalAlpha=(1-q)*k*.9;const s=i%4?3:5;y.fillRect(px-s/2,py-s/2,s,s)}
  y.globalAlpha=.32*k;y.strokeStyle=ICE;y.lineWidth=2;y.beginPath();for(let i=0;i<40;i++){const q=(t*1.6+hh(i*1.7))%1,px=X-700+hh(i+9)*1400+q*-160,py=Y-900+q*900;y.moveTo(px,py);y.lineTo(px-22,py+70)}y.stroke()}
 // ---------- the place: a basalt plateau under a thunderhead, the strike far to the left
 function plate(x,R,P){const{W,H,glow,rgba}=P;
  // the lightning-lit air on the left, the storm's light source
  glow(x,360,470,640,'#a8b8ff',.42);glow(x,360,560,260,'#fff7c0',.35);glow(x,1650,560,380,'#6a7ad0',.25);
  // the storm light under the cloud: a pale band low in the sky, so the hero's dark shape reads against it
  {const G=x.createLinearGradient(0,380,0,800);G.addColorStop(0,'rgba(120,140,220,0)');G.addColorStop(.55,'rgba(150,170,240,.42)');G.addColorStop(.85,'rgba(200,210,255,.5)');G.addColorStop(1,'rgba(120,140,220,0)');x.fillStyle=G;x.fillRect(0,380,W,420)}
  // soft cloud masses, lit from the strike on the left
  // the thunderhead, painted small and soft and then laid over the sky (painted once)
  const CW=320,CH=80,cc=MOVIE1.kit.mk(CW,CH),g2=cc.getContext('2d');g2.scale(CW/W,CH/480);const rims=[];
  const bank=(y0,y1,n,r0,r1,c0,c1,s,lit)=>{const Q=rng(s),P0=[];for(let i=0;i<n;i++){const X=Q()*W*1.1-W*.05,Y=lerp(y0,y1,Q()),r=lerp(r0,r1,Q());P0.push([X,Y,r])}P0.sort((a,b)=>a[1]-b[1]);for(const[X,Y,r]of P0){const near=Math.max(0,1-Math.abs(X-380)/760)*lit,G=g2.createRadialGradient(X-r*.2,Y+r*.35,r*.05,X,Y,r);G.addColorStop(0,near>.05?P.mixC(c0,'#e4dcff',near*.7):c0);G.addColorStop(.62,c1);G.addColorStop(1,rgba(c1,0));g2.fillStyle=G;g2.beginPath();g2.arc(X,Y,r,0,TAU);g2.fill();if(near>.25&&Q()<.6)rims.push([X,Y,r,near])}};
  bank(-60,160,40,130,240,'#2a3478','#0c1238',3,.5);
  bank(100,290,54,110,210,'#323c88','#10163e',5,.8);
  bank(250,380,64,60,140,'#3a4290','#0a1030',7,1);
  // the hanging underside, lit from below
  x.save();x.imageSmoothingQuality='high';x.drawImage(cc,0,0,W,480);x.restore();
  // the hard, ragged base of the thunderhead (a cel edge), its lower lip catching the strike's light
  {const Q=rng(9),base=new Path2D(),lip=new Path2D();base.moveTo(-40,200);base.lineTo(-40,372);lip.moveTo(-40,372);let X=-40,Y=372;while(X<W+40){const w=50+Q()*110,d=14+Q()*40,nx=X+w,ny=356+Q()*42+sin(nx*.004)*14;base.quadraticCurveTo(X+w*.5,Math.max(Y,ny)+d,nx,ny);lip.quadraticCurveTo(X+w*.5,Math.max(Y,ny)+d,nx,ny);X=nx;Y=ny}base.lineTo(W+40,200);base.closePath();
   const G=x.createLinearGradient(0,220,0,420);G.addColorStop(0,'rgba(14,20,60,0)');G.addColorStop(.6,'rgba(18,26,72,.85)');G.addColorStop(1,'#1c2660');x.fillStyle=G;x.fill(base);
   const L=x.createLinearGradient(0,0,W,0);L.addColorStop(0,'rgba(226,220,255,.75)');L.addColorStop(.3,'rgba(226,220,255,.55)');L.addColorStop(.55,'rgba(170,180,240,.25)');L.addColorStop(1,'rgba(150,160,230,.35)');x.strokeStyle=L;x.lineWidth=4;x.stroke(lip);x.lineWidth=12;x.globalAlpha=.25;x.stroke(lip);x.globalAlpha=1}
  // rain curtains falling out of the cloud base
  x.save();for(const[c0,c1,a]of[[120,560,.16],[700,980,.08],[1380,1900,.13]]){x.strokeStyle='rgba(150,170,230,'+a+')';x.lineWidth=1.4;x.beginPath();for(let i=0;i<110;i++){const X=lerp(c0,c1,R()),Y=390+R()*80;x.moveTo(X,Y);x.lineTo(X-40,Y+300+R()*120)}x.stroke()}x.restore();
  // where the far strikes land (the bolts themselves are drawn live in aura(), flickering)
  glow(x,430,770,240,'#fff3a0',.55);glow(x,1640,740,140,'#c8d0ff',.25);
  // a far ridge
  x.fillStyle='#141c48';x.beginPath();x.moveTo(0,800);for(let i=0;i<=W;i+=30)x.lineTo(i,700+sin(i*.006)*30+sin(i*.023)*14+R()*8);x.lineTo(W,800);x.closePath();x.fill();
  x.strokeStyle='rgba(150,170,255,.35)';x.lineWidth=2;x.beginPath();for(let i=0;i<=760;i+=30)x[i?'lineTo':'moveTo'](i,700+sin(i*.006)*30+sin(i*.023)*14+2);x.stroke();
  // mist on the plain
  for(let i=0;i<10;i++){x.fillStyle='rgba(140,160,230,'+(.05+R()*.06)+')';x.beginPath();x.ellipse(R()*W,770+R()*50,300+R()*300,16+R()*14,0,0,TAU);x.fill()}
  // basalt spires, scarred with fulgurite veins that still glow
  const spire=(X,w,top,s)=>{const Q=rng(s),pts=[[X-w,830],[X-w*.8,lerp(830,top,.5)],[X-w*.5,top+30],[X-w*.15,top],[X+w*.25,top+40],[X+w*.6,lerp(830,top,.4)],[X+w,830]];x.fillStyle='#0b1030';x.beginPath();pts.forEach((p,i)=>x[i?'lineTo':'moveTo'](p[0],p[1]));x.closePath();x.fill();
   x.strokeStyle='rgba(150,170,255,.45)';x.lineWidth=3;x.beginPath();x.moveTo(pts[0][0],pts[0][1]);x.lineTo(pts[1][0],pts[1][1]);x.lineTo(pts[2][0],pts[2][1]);x.lineTo(pts[3][0],pts[3][1]);x.stroke();
   x.save();x.globalCompositeOperation='lighter';for(let j=0;j<3;j++){let px=X-w*.3+Q()*w*.6,py=top+60+Q()*80;x.strokeStyle='rgba(255,230,110,.55)';x.lineWidth=2;x.beginPath();x.moveTo(px,py);for(let i=0;i<7;i++){px+=(Q()-.5)*30;py+=30+Q()*30;x.lineTo(px,py)}x.stroke()}x.restore()};
  spire(170,110,450,11);spire(330,70,560,12);spire(60,60,600,13);spire(1640,90,540,14);spire(1820,120,430,15);spire(1520,50,640,16);
  // the plateau: basalt column tops in perspective, wet
  const G2=x.createLinearGradient(0,820,0,H);G2.addColorStop(0,'#2a3672');G2.addColorStop(.25,'#182050');G2.addColorStop(1,'#060920');x.fillStyle=G2;x.fillRect(0,820,W,H-820);
  x.strokeStyle='rgba(4,6,20,.75)';x.lineWidth=2;for(let r=0;r<9;r++){const y0=830+Math.pow(r/9,1.7)*260,y1=830+Math.pow((r+1)/9,1.7)*260,hgt=y1-y0,sz=40+r*26;x.beginPath();for(let X=-sz+(r%2)*sz*.75;X<W+sz;X+=sz*1.5){const cx=960+(X-960)*(1+r*.08);x.moveTo(cx-sz*.5,y0);x.lineTo(cx+sz*.5,y0);x.lineTo(cx+sz*.75,y0+hgt*.5);x.lineTo(cx+sz*.5,y1);x.lineTo(cx-sz*.5,y1);x.lineTo(cx-sz*.75,y0+hgt*.5);x.closePath()}x.stroke()}
  // puddles holding the strike's light
  for(const[X,Y,w,c]of[[420,880,180,'#fff3a0'],[250,960,240,'#c8d4ff'],[1500,900,200,'#8a9ae0'],[1180,1040,260,'#6a7ac0'],[700,990,140,'#a8b4f0']]){const G=x.createLinearGradient(X-w,Y,X+w,Y);G.addColorStop(0,rgba(c,0));G.addColorStop(.5,rgba(c,.45));G.addColorStop(1,rgba(c,0));x.fillStyle=G;x.beginPath();x.ellipse(X,Y,w,w*.07,0,0,TAU);x.fill()}
  // old scorch lines on the stone
  x.save();x.globalCompositeOperation='lighter';x.strokeStyle='rgba(255,220,100,.22)';x.lineWidth=2;for(let j=0;j<6;j++){let px=R()*W,py=850+R()*200;x.beginPath();x.moveTo(px,py);for(let i=0;i<8;i++){px+=(R()-.3)*60;py+=(R()-.5)*14;x.lineTo(px,py)}x.stroke()}x.restore();
  // the left of the plain catches the strike
  const G3=x.createLinearGradient(0,0,W,0);G3.addColorStop(0,'rgba(255,240,170,.12)');G3.addColorStop(.4,'rgba(255,240,170,0)');x.fillStyle=G3;x.fillRect(0,820,W,H-820)}
 // ---------- the signature: Skyfall Verdict
 const H0=.38,H1=.95,H2=1.6;
 const SK=[
  [0,{nh:[-160,260],fh:[-80,300],wa:2.6,lean:.18,py:80,nf:[-220,0],ff:[230,0],hd:{yaw:.3,eye:{open:.6,angry:.8},brow:{angry:.8},mouth:{open:.1}}}],
  // the hammer raised high in front, to the sky, to catch the strike
  [.3,{nh:[380,-200],fh:[300,-160],wa:-1.1,lean:-.15,py:10,nf:[-150,0],ff:[170,0],hd:{yaw:.36,tilt:-.14,eye:{open:1,angry:.6,look:[.4,-.9]},brow:{angry:.7},mouth:{open:.55,smile:-.2}}},'o'],
  [.62,{nh:[370,-180],fh:[290,-140],wa:-1.06,lean:-.12,py:40,nf:[-160,0],ff:[180,0],hd:{yaw:.34,tilt:-.1,eye:{open:.9,angry:.8,look:[.4,-.7]},brow:{angry:.9},mouth:{open:.3,smile:-.3}}}],
  // the slam (head lands about y 930)
  [.95,{nh:[330,400],fh:[200,450],wa:.62,lean:.36,py:150,nf:[-280,0],ff:[300,0],hd:{yaw:.3,eye:{open:.8,angry:.9},brow:{angry:1},mouth:{open:.6,smile:-.4}}},'i'],
  [1.25,{nh:[330,390],fh:[200,440],wa:.64,lean:.33,py:140,nf:[-280,0],ff:[300,0],hd:{yaw:.3,eye:{open:.85,angry:.8},brow:{angry:.9},mouth:{open:.2,smile:-.2}}}],
  // it pulls the hammer up out of the stone...
  [1.45,{nh:[320,250],fh:[200,300],wa:.42,lean:.24,py:100,nf:[-280,0],ff:[300,0],hd:{yaw:.3,eye:{open:.8,angry:.9},brow:{angry:1},mouth:{open:0,smile:-.3}}},'o'],
  // ...and drives it down again, roaring up at the sky as the plain erupts
  [1.6,{nh:[340,410],fh:[210,460],wa:.64,lean:.42,py:170,nf:[-290,0],ff:[310,0],hd:{yaw:.32,tilt:-.28,eye:{open:.95,angry:1,look:[.3,-.85]},brow:{angry:1},mouth:{open:.75,smile:-.4}}},'i'],
  [1.95,{nh:[335,400],fh:[205,450],wa:.66,lean:.38,py:160,nf:[-290,0],ff:[310,0],hd:{yaw:.32,tilt:-.24,eye:{open:.9,angry:.9,look:[.3,-.7]},brow:{angry:.9},mouth:{open:.6,smile:-.3}}}],
  // rises to a proud stance, the hammer planted head-down at its side
  [2.45,{nh:[230,250],fh:[-40,380],wa:1.12,lean:-.04,py:10,nf:[-170,0],ff:[190,0],hd:{yaw:.26,eye:{open:.9,angry:.45},brow:{angry:.4},mouth:{open:0,smile:.15}}},'o']];
 function sigDraw(x,c,A){const{q}=A,t=c.t,sp=q.sp,L=q.L;
  // the hero starts a little further off (so the hammer raised to the sky stays in frame) and leaps at the camera into the slam
  const P=A.F.track(SK,t);const jump=t>.62&&t<H1?(t-.62)/(H1-.62):t>=H1?1:0,jz=A.ez(jump),s=lerp(.4,.5,jz),X=lerp(640,800,jz),Y=lerp(1010,990,jz)-150*sin(cl(jump,0,1)*PI);
  const hd=headAt(L,P,WL),HX=X+hd[0]*s,HY=Y+hd[1]*s;
  const flash=t>H2&&t<H2+.5?1-(t-H2)/.5:0,dark=t<H0?.42:t<H1?.3:t<H2?.22:.25;
  A.bg(x,c,dark);
  // the sky answers: the cloud base lights from inside before each strike
  // (kept well away from the head: the cloud lights at the bolt's origin far to the right, and the H2 flash sits on the far eruption columns at both edges)
  A.view(x,c.C,.3,y=>{if(t>H1)farStrikes(y,0,0,c.T,1);const fl=hh(Math.floor(t*20));if(t<H0&&fl>.5)A.glow(y,Math.max(X+520,HX+420),-40,420,'#c8d0ff',.35*(t/H0));if(flash){A.glow(y,1700,260,760,'#fff7c0',.55*flash);A.glow(y,180,260,620,'#fff7c0',.45*flash)}});
  A.view(x,c.C,1,y=>{
   // the floor discharge: arcs run out both ways along the ground from the slam
   if(t>H1){const u=t-H1,run=A.eo(u/.5),fade=cl(1-(t-2.2)/.6,0,1),SH=headAt(L,SK[3][1],WL),P1x=800+SH[0]*s,P1y=Math.min(1060,990+SH[1]*s+10);
    A.sigil(y,P1x,P1y,lerp(200,1500,A.eo(u/.7)),1,c.T,.7*fade);
    y.save();y.globalCompositeOperation='lighter';const G=y.createLinearGradient(0,P1y-60,0,P1y+80);G.addColorStop(0,'rgba(255,240,122,0)');G.addColorStop(.5,'rgba(255,240,122,'+(.5*fade)+')');G.addColorStop(1,'rgba(255,240,122,0)');y.fillStyle=G;const xl=P1x-run*1700,xr=P1x+run*1700;y.fillRect(xl,P1y-60,xr-xl,140);y.restore();
    const fl=Math.floor(t*18);for(const sd of[-1,1])for(let l=0;l<3;l++){const yy=P1y-14+l*34,xe=P1x+sd*run*(1500+l*200);bolt(y,P1x,P1y,xe,yy+sin(l+fl)*8,fl*31+l*7+(sd>0?3:0),{n:16,jag:18+l*8,w:5.5-l*1.2,br:4,bl:.14,a:fade*(1-l*.15)})}
    A.glow(y,P1x,P1y,420,'#fff07a',.8*fade);A.glow(y,P1x,P1y,110,'#ffffff',fade);
    A.painter(y,'ring',P1x,P1y,1000,u/1.1,0,3,7);
    // the stone breaks and the chips fly
    const R=A.sr(77);for(let i=0;i<26;i++){const a=-PI*(.08+.84*R()),v=500+R()*900,gx=P1x+cos(a)*v*u,gy=P1y+sin(a)*v*u+1500*u*u,r=6+R()*16;if(gy>1100)continue;y.fillStyle=i%3?'#141a40':'#2a3470';y.save();y.translate(gx,gy);y.rotate(u*8*(R()-.5)*3);y.beginPath();y.moveTo(-r,-r*.6);y.lineTo(r*.8,-r);y.lineTo(r,r*.5);y.lineTo(-r*.4,r);y.closePath();y.fill();y.strokeStyle='rgba(255,240,122,.6)';y.lineWidth=2;y.stroke();y.restore()}
    A.sparks(y,61,u,P1x,P1y,40,1100,'#fff07a',.8,1200);
    // the cracks in the stone, glowing
    y.save();y.globalCompositeOperation='lighter';y.strokeStyle='rgba(255,240,122,'+(.8*fade)+')';y.lineWidth=4;y.beginPath();const Q=A.sr(19);for(let j=0;j<10;j++){let px=P1x,py=P1y;const dir=j%2?1:-1,len=run*(300+Q()*900);y.moveTo(px,py);for(let i=0;i<8;i++){px+=dir*len/8;py+=(Q()-.5)*22+(j%5-2)*3;y.lineTo(px,py)}}y.stroke();y.restore()}
   // the eruption: the discharge goes back up into the sky
   if(t>H2&&t<H2+.9){const u=t-H2,fl=Math.floor(t*20);const XS=[130,340,520,1280,1580,1810];XS.forEach((bx,i)=>{const d=hh(i*3+1)*.12;if(u<d)return;const v=(u-d)/.75;if(v>1)return;const a=(1-v)*(v<.15?1:.6+.4*hh(fl+i));const top=-60-hh(i)*80,gx=bx+(hh(i+7)-.5)*120;const by=1000+hh(i)*50;bolt(y,bx,by,gx,lerp(by,top,A.eo(v*4)),fl*7+i*13,{n:14,jag:50,w:8,br:4,bl:.25,a});A.glow(y,bx,by,200,'#fff07a',.7*a)})}
   if(t>.62&&t<H1)A.speedLines(y,HX,HY,29,t,'rgba(255,245,180,.9)',.5,40,260);
   // the hero
   A.hero(c,y,X,Y,s,P,{wind:.95,act:{rim:[sp.pal[2],.95,-8,-3]}});
   // the hammer receives the strike
   if(t>H0-.05&&t<H0+.36){const u=t-H0,a=u<0?.5:u<.18?1:1-(u-.18)/.18,fl=Math.floor(t*30);const sx=HX+120;bolt(y,sx,-140,HX+30,HY-20,fl*11+5,{n:18,jag:70,w:u<0?2:12,br:u<0?1:6,bl:.3,a});if(u>=0){A.glow(y,HX,HY,260,'#fff07a',.8*a);A.glow(y,HX,HY,120,'#ffffff',a);const GX=X+hd[2]*s,GY=Y+hd[3]*s;for(let i=0;i<2;i++)bolt(y,HX,HY,GX,GY,fl*3+i,{n:8,jag:22,w:3,a:a*.9})}}
   if(t>=H0&&t<H1+.05){const fl=Math.floor(t*24);for(let i=0;i<5;i++){if(hh(fl+i*3)<.35)continue;const a=hh(i+fl)*TAU,r=120+hh(fl+i*5)*160;bolt(y,HX,HY,HX+cos(a)*r,HY+sin(a)*r,fl*9+i,{n:6,jag:16,w:2.4,a:.9})}A.glow(y,HX,HY,200,'#fff07a',.5);A.sparks(y,33,t-H0,HX,HY,30,700,'#fff7c0',.6,600)}
   if(t>H1&&t<H1+.6)A.painter(y,'hit',HX,HY,360,(t-H1)/.6,0,3,6)
  });
  if(A.lit(t,H0,.07)||A.lit(t,H1,.07)||A.lit(t,H2,.06))A.impact(x);
  if(t>H1&&t<H1+.12)A.rect(x,'#fff7c0',.5*(1-(t-H1)/.12));if(flash)A.rect(x,'#fffbe0',.4*flash*flash)}
 EVC1.add('stormcaller',{
  pal:['#fff07a','#1a2a70','#ffffff'],eye:'#ffe94a',
  C:{coat:'#2c3ea0',dark:'#111940',trim:YEL,inner:'#d8e2ff',boot:'#161c4a',glove:'#2a3678',leg:'#151c48',scarf:null,coatLen:.55},
  wl:WL,wlClose:1250,dress,pieces:['chest','head','back'],
  // a bolt in each iris
  glyph(g,cx,cy,rx,ry,k,t){if(k<=0)return;const B=[[.18,-.8],[-.34,.06],[-.02,.06],[-.2,.82],[.38,-.14],[.06,-.14]];g.globalCompositeOperation='lighter';g.globalAlpha=k*(.75+.25*sin(t*31));g.fillStyle='#fffbd0';g.beginPath();B.forEach(([x,y],i)=>g[i?'lineTo':'moveTo'](cx+x*rx*.9,cy+y*ry*.9));g.closePath();g.fill();g.globalAlpha=k*.4;g.strokeStyle=YEL;g.lineWidth=rx*.1;g.stroke()},
  sky:[[0,'#03051a'],[.22,'#0a1240'],[.42,'#1c2a66'],[.6,'#46569e'],[.7,'#5a68ac'],[.76,'#26326a'],[1,'#080c22']],
  plate,aura,sigil,
  pose:{
   gather:{nh:[150,300],fh:[40,330],wa:1.5,lean:.02},
   piece:{nh:[320,330],fh:[-40,420],wa:1.5},
   hero:{nh:[60,40],fh:[-40,380],wa:-3.0,lean:-.03,nf:[-130,0],ff:[150,0],hd:{yaw:.28}},
   windup:{nh:[-170,270],fh:[-90,300],wa:2.6,lean:.18,py:80,nf:[-220,0],ff:[240,0]}},
  // the evolution moment: dark bolts thrown out across the light, along the ground and up the sides
  burst(y,k,t,A){const fl=Math.floor(t*16);for(let i=0;i<10;i++){const s=i%2?1:-1,a=s>0?-(.04+(i>>1)*.16):-PI+(.04+(i>>1)*.16),L=1300*A.eo(k);bolt(y,960,1010,960+cos(a)*L,1010+sin(a)*L*.8,fl*3+i*17,{n:12,jag:40,w:5-(i>>1)*.5,br:2,dark:1,col:'#0a1238'})}},
  spark(x,c,A){const q=A.q,u=c.u,L=q.wl0,a=-.32+u*.06,X=lerp(380,300,u),Yg=650,fl=Math.floor(c.T*18);A.view(x,c.C,1,y=>{const hx=X+cos(a)*L*.76,hy=Yg+sin(a)*L*.76;for(let i=0;i<4;i++){if(hh(fl+i*5)<.45)continue;const b=hh(fl*2+i)*TAU,r=110+hh(fl+i)*120;bolt(y,hx,hy,hx+cos(b)*r,hy+sin(b)*r,fl*7+i,{n:7,jag:16,w:2,a:.8*cl(c.t/.4,0,1)})}
   if(c.t>.85){const v=(c.t-.85)/.45;bolt(y,hx+60,-40,hx,hy,99,{n:14,jag:50,w:6,br:4,a:v<.3?1:1-(v-.3)/.7});A.glow(y,hx,hy,260,YEL,.7*(1-v))}});
   x.save();x.strokeStyle='rgba(180,200,255,.28)';x.lineWidth=2;x.beginPath();for(let i=0;i<50;i++){const q2=(c.T*1.8+hh(i))%1,px=hh(i+3)*2200-100-q2*200,py=-80+q2*1240;x.moveTo(px,py);x.lineTo(px-30,py+90)}x.stroke();x.restore();if(A.lit(c.t,.85,.06))A.impact(x)},
  piece(x,c,A,i){if(c.t<.5||c.t>.9)return;const v=(c.t-.5)/.4,fl=Math.floor(c.T*20);A.view(x,c.C,1,y=>{for(let j=0;j<3;j++){if(hh(fl+j)<.3)continue;const sd=j%2?1:-1,x0=960+sd*(980),y0=700+j*140,x1=960+sd*(330+hh(fl+j*3)*120),y1=760+hh(j+fl)*240;bolt(y,x0,y0,x1,y1,fl*5+j+i*31,{n:10,jag:34,w:3,br:2,a:1-v})}})},
  windup(x,c,A){const q=A.q,s=.95,X=960+60*s,Y=540+1150*s,P=q.pose.windup,hd=headAt(q.L,P,WL),HX=X+hd[0]*s,HY=Y+hd[1]*s,fl=Math.floor(c.T*20),k=A.ez(c.u);
   const GX=X+hd[2]*s,GY=Y+hd[3]*s;
   A.view(x,c.C,1,y=>{A.glow(y,HX,HY,300*k+80,YEL,.5*k);
    // the charge runs up the haft toward the hand
    for(let i=0;i<4;i++){if(hh(fl+i*7)<.3)continue;const u0=.35+hh(i+fl*3)*.4,u1=Math.min(.98,u0+.2+hh(i*5+fl)*.25);bolt(y,lerp(HX,GX,u0),lerp(HY,GY,u0),lerp(HX,GX,u1),lerp(HY,GY,u1),fl*3+i*11,{n:8,jag:26,w:2.4+k*2,br:2,bl:.4,a:.6+.4*k})}
    // and arcs leap from the stones up to it
    for(let i=0;i<3;i++){if(hh(fl*2+i)<.4)continue;const bx=HX+(hh(i+fl)-.3)*500;bolt(y,bx,1180,lerp(HX,GX,.4+hh(i*3+fl)*.4),lerp(HY,GY,.4+hh(i*3+fl)*.4),fl*5+i,{n:10,jag:30,w:2+k*2,a:.8*k})}})},
  sig:{hits:[H0,H1,H2],draw:sigDraw},
  evo:null
 })})()}catch(e){console.error('EVC stormcaller',e)}
