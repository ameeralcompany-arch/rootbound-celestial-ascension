// ===== Gunslinger evolution cinematic: Last Light Marshal. A frontier ghost town in the last minute of sunset; brass and clock gears in the dust; a revolver-cylinder clock on the ground; a sunburst badge, a wide-brimmed hat and a long split duster.
// Six Bells: time stops, six shots fan out and hang in the air inside turning gears, then everything lands at once and the last light rings across the ground. =====
try{(()=>{const F=()=>FILM1,sin=Math.sin,cos=Math.cos,TAU=6.2832,PI=Math.PI;
 const GOLD='#ffd88a',BRASS='#d9a248',LEA='#7a4e2c',LEAD='#45291a',LEAL='#b07a4c',CY='#6adfff',TEAL='#1f3a42',RUST='#a8402a',INK='#24140c';
 const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,ease=k=>{k=cl(k,0,1);return 1-Math.pow(1-k,3)};
 // ---------- gears: a unit outline made once per tooth count
 const GP={};function gearP(n){if(GP[n])return GP[n];const p=new Path2D(),st=TAU/n;for(let i=0;i<n;i++){const a=i*st;const P=[[1,a],[1.2,a+st*.14],[1.2,a+st*.42],[1,a+st*.56]];P.forEach(([r,b],j)=>p[i||j?'lineTo':'moveTo'](cos(b)*r,sin(b)*r))}p.closePath();return GP[n]=p}
 function gear(g,x,y,r,n,rot,fill,stroke,lw,hub){g.save();g.translate(x,y);g.rotate(rot);g.scale(r,r);const p=gearP(n);if(fill){g.fillStyle=fill;g.fill(p)}if(stroke){g.strokeStyle=stroke;g.lineWidth=(lw||2)/r;g.stroke(p);if(hub){g.beginPath();g.arc(0,0,.62,0,TAU);g.moveTo(.22,0);g.arc(0,0,.22,0,TAU);for(let i=0;i<5;i++){const b=i*TAU/5;g.moveTo(cos(b)*.22,sin(b)*.22);g.lineTo(cos(b)*.62,sin(b)*.62)}g.stroke()}}else if(hub&&fill){g.fillStyle=hub;g.beginPath();g.arc(0,0,.34,0,TAU);g.fill()}g.restore()}
 // a brass casing, tumbling
 function casing(g,x,y,a,s){g.save();g.translate(x,y);g.rotate(a);g.fillStyle=BRASS;g.fillRect(-s*.5,-s*.18,s,s*.36);g.fillStyle='#fff0c0';g.fillRect(-s*.5,-s*.18,s,s*.1);g.fillStyle='#8a5a20';g.fillRect(s*.4,-s*.22,s*.12,s*.44);g.restore()}
 // ---------- the badge: a plain six-ray sunburst with a clock face at its heart
 function badge(g,x,y,r,t){g.save();g.translate(x,y);g.lineJoin='round';
  const G=g.createLinearGradient(-r,-r,r,r);G.addColorStop(0,'#fff6d0');G.addColorStop(.45,GOLD);G.addColorStop(1,'#b07a28');
  g.beginPath();for(let i=0;i<6;i++){const b=i*TAU/6-PI/2,w=.3;g.moveTo(cos(b-w)*r*.46,sin(b-w)*r*.46);g.lineTo(cos(b)*r*.96,sin(b)*r*.96);g.lineTo(cos(b+w)*r*.46,sin(b+w)*r*.46)}g.fillStyle=G;g.fill();g.strokeStyle='#5a3a10';g.lineWidth=r*.06;g.stroke();
  for(let i=0;i<6;i++){const b=i*TAU/6-PI/2;g.beginPath();g.arc(cos(b)*r*1.02,sin(b)*r*1.02,r*.12,0,TAU);g.fillStyle=G;g.fill();g.stroke()}
  g.beginPath();g.arc(0,0,r*.52,0,TAU);g.fillStyle=G;g.fill();g.stroke();g.beginPath();g.arc(0,0,r*.38,0,TAU);g.fillStyle='#1c3036';g.fill();g.strokeStyle='#ffe9a8';g.lineWidth=r*.04;g.stroke();
  g.strokeStyle=CY;g.lineWidth=r*.035;g.beginPath();for(let i=0;i<12;i++){const b=i*TAU/12;g.moveTo(cos(b)*r*.3,sin(b)*r*.3);g.lineTo(cos(b)*r*.36,sin(b)*r*.36)}g.stroke();
  g.strokeStyle='#e0fbff';g.lineCap='round';g.lineWidth=r*.05;const h=t*.9;g.beginPath();g.moveTo(0,0);g.lineTo(cos(h-PI/2)*r*.28,sin(h-PI/2)*r*.28);g.moveTo(0,0);g.lineTo(cos(h/12+.6)*r*.18,sin(h/12+.6)*r*.18);g.stroke();
  // a shine that slides across
  g.save();g.beginPath();g.arc(0,0,r*1.1,0,TAU);g.clip();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,255,240,.5)';const sx=-r*1.6+((t*.7)%1.6)*r*2;g.beginPath();g.moveTo(sx,-r*1.2);g.lineTo(sx+r*.3,-r*1.2);g.lineTo(sx-r*.2,r*1.2);g.lineTo(sx-r*.5,r*1.2);g.closePath();g.fill();g.restore();
  g.restore()}
 // ---------- the outfit
 const dress={
  // the duster's back: two long tails split at the vent, a high collar behind the neck
  back(g,J){const k=J.k.p3||0;if(k<=0)return;const e=ease(k),w=J.wnd,t=J.t,sw=sin(t*1.9)*22+w*260,len=lerp(200,1010,e);
   const A=J.rot(-128,-386),B=J.rot(100,-386),T1=[A[0]-170-sw,J.hy+len*.62+sin(t*2.6)*16],T2=[J.hx+20-sw*.55,J.hy+len*.66+sin(t*2.2+1)*12],S0=[J.hx-74-sw*.3,J.hy+lerp(40,100,e)];
   const p=new Path2D();p.moveTo(A[0],A[1]);p.bezierCurveTo(A[0]-70-sw*.15,A[1]+len*.3,T1[0]-40,T1[1]-len*.35,T1[0],T1[1]);p.quadraticCurveTo(T1[0]+80,T1[1]+10,T1[0]+140,T1[1]-14);p.quadraticCurveTo(S0[0]-50,S0[1]+120,S0[0],S0[1]);p.quadraticCurveTo(S0[0]+14,S0[1]+140,T2[0]-70,T2[1]-8);p.quadraticCurveTo(T2[0],T2[1]+16,T2[0]+80,T2[1]-20);p.bezierCurveTo(T2[0]+120,T2[1]-len*.3,B[0]+30-sw*.08,B[1]+len*.3,B[0],B[1]);p.closePath();
   const G=g.createLinearGradient(A[0],A[1],T1[0],T1[1]);G.addColorStop(0,'#8a5a34');G.addColorStop(.55,LEA);G.addColorStop(1,'#3a2214');g.fillStyle=G;g.fill(p);g.strokeStyle=INK;g.lineWidth=3;g.stroke(p);
   g.save();g.clip(p);g.strokeStyle='rgba(30,14,6,.42)';g.lineWidth=12;for(let i=0;i<4;i++){g.beginPath();g.moveTo(A[0]+i*46,A[1]+60);g.quadraticCurveTo(T1[0]+i*70,T1[1]-len*.45,T1[0]+30+i*60,T1[1]+10);g.stroke()}
    // a gold stitched hem and a clockwork line just above it
    g.fillStyle='#2e5660';g.beginPath();g.moveTo(S0[0],S0[1]);g.quadraticCurveTo(S0[0]-50,S0[1]+120,T1[0]+140,T1[1]-14);g.lineTo(T1[0]+96,T1[1]-6);g.quadraticCurveTo(S0[0]-90,S0[1]+140,S0[0]-34,S0[1]+30);g.closePath();g.fill();g.strokeStyle='rgba(255,216,138,.45)';g.lineWidth=3;g.stroke();
    g.strokeStyle=GOLD;g.lineWidth=10;g.beginPath();g.moveTo(T1[0]-10,T1[1]+2);g.quadraticCurveTo(T1[0]+80,T1[1]+12,T1[0]+140,T1[1]-12);g.moveTo(T2[0]-70,T2[1]-6);g.quadraticCurveTo(T2[0],T2[1]+18,T2[0]+86,T2[1]-20);g.stroke();
    g.strokeStyle='rgba(106,223,255,.55)';g.lineWidth=3;g.setLineDash([10,8]);g.beginPath();g.moveTo(T1[0]-14,T1[1]-26);g.quadraticCurveTo(T1[0]+90,T1[1]-14,T1[0]+170,T1[1]-40);g.stroke();g.setLineDash([]);g.restore();
   // the high collar, turned up behind the neck
   g.fillStyle='#5a3820';g.strokeStyle=INK;g.lineWidth=3;const c0=J.rot(-118,-392),c1=J.rot(-150,-478),c2=J.rot(-60,-468),c3=J.rot(-30,-404);g.beginPath();g.moveTo(c0[0],c0[1]);g.lineTo(c1[0]-sw*.04,c1[1]);g.quadraticCurveTo(c2[0]-30,c2[1]-26,c2[0],c2[1]);g.lineTo(c3[0],c3[1]);g.closePath();g.globalAlpha=Math.min(1,k*2);g.fill();g.stroke();g.globalAlpha=1},
  torso(g,J){const k1=J.k.p1||0,k3=J.k.p3||0,t=J.t;
   if(k1>0){const e=ease(k1);g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);g.translate(0,(1-e)*-50);g.globalAlpha=Math.min(1,k1*2);
    // the waistcoat: dark teal, gold piping, a pointed hem
    const v=new Path2D();v.moveTo(-124,-366);v.lineTo(-40,-400);v.lineTo(-4,-250);v.lineTo(34,-400);v.lineTo(104,-370);v.quadraticCurveTo(92,-250,72,-150);v.lineTo(76,-84);v.lineTo(24,-62);v.lineTo(-6,-92);v.lineTo(-38,-62);v.lineTo(-88,-84);v.lineTo(-80,-150);v.quadraticCurveTo(-112,-250,-124,-366);v.closePath();
    const G=g.createLinearGradient(-120,-400,100,-60);G.addColorStop(0,'#2e5660');G.addColorStop(.5,TEAL);G.addColorStop(1,'#122428');g.fillStyle=G;g.fill(v);g.save();g.clip(v);g.strokeStyle='rgba(255,216,138,.13)';g.lineWidth=2;g.beginPath();for(let i=-6;i<8;i++){g.moveTo(-140+i*30,-420);g.lineTo(-120+i*30,-40)}g.stroke();g.fillStyle='rgba(8,18,20,.4)';g.fillRect(-140,-420,50,400);g.restore();
    g.strokeStyle=INK;g.lineWidth=3;g.stroke(v);g.strokeStyle=GOLD;g.lineWidth=5;g.beginPath();g.moveTo(-40,-400);g.lineTo(-4,-250);g.lineTo(34,-400);g.moveTo(-88,-84);g.lineTo(-38,-62);g.lineTo(-6,-92);g.lineTo(24,-62);g.lineTo(76,-84);g.stroke();
    g.fillStyle=GOLD;g.strokeStyle='#5a3a10';g.lineWidth=2;for(let i=0;i<4;i++){g.beginPath();g.arc(-6,-226+i*36,7,0,TAU);g.fill();g.stroke()}
    // the watch chain and the watch peeking out of its pocket
    g.strokeStyle=GOLD;g.lineWidth=3.4;g.setLineDash([7,5]);g.beginPath();g.moveTo(-6,-190);g.quadraticCurveTo(24,-150+sin(t*2)*3,58,-176);g.stroke();g.setLineDash([]);g.fillStyle=GOLD;g.beginPath();g.arc(62,-184,15,0,TAU);g.fill();g.strokeStyle='#5a3a10';g.stroke();g.fillStyle='#d8f8ff';g.beginPath();g.arc(62,-184,10,0,TAU);g.fill();g.strokeStyle='#123';g.lineWidth=2;g.beginPath();g.moveTo(62,-184);g.lineTo(62+cos(t*3)*7,-184+sin(t*3)*7);g.stroke();g.fillStyle='rgba(20,36,40,.9)';g.fillRect(44,-178,40,14);
    // the gun belt, slung low, with brass in its loops
    const bt=new Path2D();bt.moveTo(-104,-104);bt.lineTo(104,-128);bt.lineTo(108,-78);bt.lineTo(-108,-48);bt.closePath();g.fillStyle=LEAD;g.fill(bt);g.strokeStyle=INK;g.lineWidth=2.6;g.stroke(bt);g.strokeStyle='rgba(255,216,138,.5)';g.lineWidth=2;g.setLineDash([6,6]);g.beginPath();g.moveTo(-100,-96);g.lineTo(100,-120);g.moveTo(-102,-56);g.lineTo(102,-86);g.stroke();g.setLineDash([]);
    for(let i=0;i<8;i++){const u=i/7,bx=lerp(-80,92,u),by=lerp(-92,-114,u);g.fillStyle=BRASS;g.fillRect(bx-6,by,12,26);g.fillStyle='#fff0c0';g.fillRect(bx-6,by,4,26);g.fillStyle='#b8682a';g.beginPath();g.arc(bx,by,6,PI,0);g.fill()}
    g.fillStyle=GOLD;g.strokeStyle='#5a3a10';g.lineWidth=2.4;g.fillRect(-20,-110,36,50);g.strokeRect(-20,-110,36,50);g.fillStyle=TEAL;g.fillRect(-10,-100,16,30);
    g.restore()}
   // the duster's front: open, wide lapels, falling past the knees
   if(k3>0){const e=ease(k3),w=J.wnd*240+sin(t*2.3)*14,hem=J.hy+lerp(120,560,e),kN=J.kneeN||[J.hx-60,J.hy+405],kF=J.kneeF||[J.hx+60,J.hy+405];
    g.save();g.globalAlpha=Math.min(1,k3*2);g.lineJoin='round';
    // far panel first
    {const A=J.rot(46,-404),B=J.rot(110,-366),C=J.rot(98,-20),Fp=J.rot(44,-130),N=J.rot(64,-262),Dx=Math.max(C[0],kF[0])+46-w*.5,Ex=kF[0]-40-w*.7;
     const p=new Path2D();p.moveTo(A[0],A[1]);p.lineTo(B[0],B[1]);p.quadraticCurveTo(B[0]+10,C[1]-120,C[0],C[1]);p.quadraticCurveTo(Dx+10,lerp(C[1],hem,.5),Dx,hem);p.quadraticCurveTo(lerp(Dx,Ex,.5),hem+20,Ex,hem-6);p.quadraticCurveTo(Fp[0]-10-w*.2,lerp(Fp[1],hem,.4),Fp[0],Fp[1]);p.lineTo(N[0],N[1]);p.closePath();
     const G=g.createLinearGradient(A[0],A[1],Dx,hem);G.addColorStop(0,'#6a4426');G.addColorStop(1,'#33200f');g.fillStyle=G;g.fill(p);g.strokeStyle=INK;g.lineWidth=2.8;g.stroke(p);g.strokeStyle=GOLD;g.lineWidth=4;g.beginPath();g.moveTo(Ex,hem-6);g.quadraticCurveTo(Fp[0]-10-w*.2,lerp(Fp[1],hem,.4),Fp[0],Fp[1]);g.lineTo(N[0],N[1]);g.lineTo(A[0],A[1]);g.stroke()}
    // near panel
    {const A=J.rot(-96,-398),B=J.rot(-142,-360),C=J.rot(-118,-10),Fp=J.rot(-76,-128),N=J.rot(-108,-262),Dx=Math.min(C[0],kN[0])-80-w,Ex=kN[0]+40-w*.7;
     const p=new Path2D();p.moveTo(A[0],A[1]);p.lineTo(B[0],B[1]);p.quadraticCurveTo(B[0]-14,C[1]-120,C[0],C[1]);p.quadraticCurveTo(Dx-10,lerp(C[1],hem,.5),Dx,hem+10);p.quadraticCurveTo(lerp(Dx,Ex,.5),hem+30,Ex,hem);p.quadraticCurveTo(Fp[0]+12-w*.2,lerp(Fp[1],hem,.45),Fp[0],Fp[1]);p.lineTo(N[0],N[1]);p.closePath();
     const G=g.createLinearGradient(B[0],B[1],Ex,hem);G.addColorStop(0,LEAL);G.addColorStop(.35,LEA);G.addColorStop(1,'#3e2616');g.fillStyle=G;g.fill(p);g.save();g.clip(p);g.strokeStyle='rgba(30,14,6,.35)';g.lineWidth=10;g.beginPath();g.moveTo(C[0]+20,C[1]);g.quadraticCurveTo(lerp(C[0],Dx,.5)+30,lerp(C[1],hem,.5),Dx+50,hem);g.stroke();g.restore();g.strokeStyle=INK;g.lineWidth=2.8;g.stroke(p);
     g.strokeStyle=GOLD;g.lineWidth=4;g.beginPath();g.moveTo(Ex,hem);g.quadraticCurveTo(Fp[0]+12-w*.2,lerp(Fp[1],hem,.45),Fp[0],Fp[1]);g.lineTo(N[0],N[1]);g.lineTo(A[0],A[1]);g.moveTo(Dx,hem+10);g.quadraticCurveTo(lerp(Dx,Ex,.5),hem+30,Ex,hem);g.stroke()}
    g.restore()}
   // the badge sits on the waistcoat, over the heart
   if(k1>0){const e=ease(k1),b=J.rot(-56,-300);g.save();g.globalAlpha=Math.min(1,k1*2);badge(g,b[0],b[1]-(1-e)*40,50*(.4+.6*e),t);g.restore()}
   // the holster on the near hip, a second revolver in it, over the coat
   if(k1>0){const h0=J.rot(-104,-70),a=J.lean+.12;g.save();g.globalAlpha=Math.min(1,k1*2);g.translate(h0[0],h0[1]);g.rotate(a);g.fillStyle='#3a2414';g.fillRect(-24,-40,30,40);g.fillStyle='#2a1a10';g.beginPath();g.moveTo(-6,-6);g.quadraticCurveTo(-34,-30,-46,-62);g.lineTo(-22,-74);g.quadraticCurveTo(-4,-50,14,-18);g.closePath();g.fill();g.fillStyle=BRASS;g.beginPath();g.arc(-36,-68,7,0,TAU);g.fill();
    const hp=new Path2D();hp.moveTo(-30,-10);hp.lineTo(30,-14);hp.quadraticCurveTo(40,120,22,250);hp.lineTo(-6,256);hp.quadraticCurveTo(-30,120,-30,-10);hp.closePath();g.fillStyle=LEAD;g.fill(hp);g.strokeStyle=INK;g.lineWidth=2.6;g.stroke(hp);g.strokeStyle=GOLD;g.lineWidth=2;g.setLineDash([5,6]);g.beginPath();g.moveTo(-22,0);g.quadraticCurveTo(-20,120,-2,244);g.stroke();g.setLineDash([]);gear(g,6,90,14,10,t*.6,GOLD,'#5a3a10',1.6,'#1c3036');g.restore()}},
  front(g,J){const k=J.k.p3||0;if(k<=0)return;const e=ease(k),t=J.t;
   // spurs: a little gear for a rowel at each heel
   for(const K of[J.kneeF,J.kneeN]){if(!K)continue;const ax=K[2],ay=K[3];g.save();g.globalAlpha=Math.min(1,k*2);g.strokeStyle=GOLD;g.lineWidth=5;g.beginPath();g.moveTo(ax-44,ay+18);g.lineTo(ax+30,ay+14);g.moveTo(ax-44,ay+22);g.lineTo(ax-76,ay+14);g.stroke();gear(g,ax-86,ay+12,18*e,9,t*2.4,GOLD,'#5a3a10',1.6,'#3a2414');g.restore()}},
  head(g,J){const k1=J.k.p1||0,k=J.k.p2||0,sy=sin(J.yaw||.26),t=J.t,w=J.wnd||0;
   // a rust neckerchief knotted at the throat
   if(k1>0){const nx=sy*10;g.save();g.globalAlpha=Math.min(1,k1*2);g.fillStyle=RUST;g.strokeStyle='#4a160c';g.lineWidth=2.6;g.beginPath();g.moveTo(nx-46,132);g.quadraticCurveTo(nx,160,nx+48,128);g.lineTo(nx+52,168);g.quadraticCurveTo(nx+30,196,nx+4,252);g.quadraticCurveTo(nx-26,196,nx-50,170);g.closePath();g.fill();g.stroke();g.fillStyle='#c85a3c';g.beginPath();g.ellipse(nx-30,170,14,10,.4,0,TAU);g.fill();g.stroke();
    g.fillStyle='#8a3020';g.beginPath();g.moveTo(nx-40,172);g.quadraticCurveTo(nx-80-w*40,200,nx-96-w*70+sin(t*4)*6,236);g.lineTo(nx-70-w*60,226);g.quadraticCurveTo(nx-60,196,nx-34,178);g.closePath();g.fill();g.stroke();g.restore()}
   if(k<=0)return;const e=ease(k),cx=sy*34;
   g.save();g.globalAlpha=Math.min(1,k*2.2);g.translate(cx*.5,-(1-e)*170);g.rotate(.07-(1-e)*.3);
   // the brim's shadow on the fringe
   const S=g.createLinearGradient(0,-118,0,-46);S.addColorStop(0,'rgba(28,12,6,.62)');S.addColorStop(1,'rgba(28,12,6,0)');g.fillStyle=S;g.beginPath();g.ellipse(0,-100,124,58,0,0,TAU);g.fill();
   // the crown, creased on top
   const cr=new Path2D();cr.moveTo(-118,-112);cr.bezierCurveTo(-126,-172,-114,-226,-96,-246);cr.quadraticCurveTo(-54,-270,-6,-238);cr.quadraticCurveTo(42,-270,92,-248);cr.bezierCurveTo(110,-226,124,-172,118,-116);cr.closePath();
   const G=g.createLinearGradient(-120,0,120,0);G.addColorStop(0,'#3e2614');G.addColorStop(.42,'#7a4e2c');G.addColorStop(.7,'#9a6a40');G.addColorStop(1,'#5a3820');g.fillStyle=G;g.fill(cr);g.strokeStyle=INK;g.lineWidth=3.4;g.stroke(cr);
   g.strokeStyle='rgba(30,14,6,.5)';g.lineWidth=5;g.beginPath();g.moveTo(-6,-236);g.quadraticCurveTo(-12,-200,-20,-176);g.stroke();
   // the gold band and its gear
   g.fillStyle=GOLD;g.beginPath();g.moveTo(-121,-140);g.quadraticCurveTo(0,-128,120,-144);g.lineTo(119,-116);g.quadraticCurveTo(0,-100,-119,-112);g.closePath();g.fill();g.strokeStyle='#5a3a10';g.lineWidth=2.4;g.stroke();
   g.strokeStyle='#8a5a18';g.lineWidth=2;g.beginPath();for(let i=0;i<9;i++){const x=-100+i*24;g.moveTo(x,-132+Math.abs(x)*.02);g.lineTo(x+10,-112+Math.abs(x)*.02)}g.stroke();
   gear(g,58+cx*.4,-124,20,10,t*.9,GOLD,'#5a3a10',2,'#1c3036');g.fillStyle=CY;g.beginPath();g.arc(58+cx*.4,-124,5,0,TAU);g.fill();
   // the brim: wide, its sides curled up, seen nearly edge on
   const bw=246,br=new Path2D();br.moveTo(-bw,-156);br.quadraticCurveTo(-bw+40,-128,-150,-122);br.quadraticCurveTo(0,-112,150,-126);br.quadraticCurveTo(bw-36,-132,bw,-162);br.quadraticCurveTo(bw-4,-118,170,-98);br.quadraticCurveTo(0,-76,-166,-94);br.quadraticCurveTo(-bw+6,-112,-bw,-156);br.closePath();
   const BG=g.createLinearGradient(0,-160,0,-80);BG.addColorStop(0,'#8a5a34');BG.addColorStop(.5,'#5a3820');BG.addColorStop(1,'#2e1a0c');g.fillStyle=BG;g.fill(br);g.strokeStyle=INK;g.lineWidth=3.4;g.stroke(br);
   g.strokeStyle='rgba(255,216,138,.7)';g.lineWidth=2.4;g.setLineDash([8,7]);g.beginPath();g.moveTo(-bw+14,-146);g.quadraticCurveTo(-bw+10,-116,-166,-102);g.quadraticCurveTo(0,-84,170,-106);g.quadraticCurveTo(bw-10,-122,bw-14,-152);g.stroke();g.setLineDash([]);
   g.restore()}};
 // ---------- poses for a revolver
 const POSE={gather:{nh:[40,546],fh:[-10,470],wa:1.3,wFront:1,lean:.02,nf:[-80,0],ff:[96,0]},
  piece:{nh:[120,480],fh:[0,480],wa:.75,wFront:1,lean:.02},
  hero:{nh:[340,-40],fh:[60,320],wa:-1.15,wFront:1,lean:-.05,nf:[-190,0],ff:[210,0],py:20},
  windup:{nh:[430,60],fh:[300,110],wa:-.04,wFront:1,lean:-.04,py:30,nf:[-170,0],ff:[190,0]}};
 // ---------- the place: a ghost town on the plain, the sun going down behind the mesas
 function plate(x,R,P){const{W,H,glow,rgba}=P,SX=1610,SY=738;
  glow(x,SX,SY,900,'#ff5a3a',.36);glow(x,SX,SY,420,'#ff7040',.42);glow(x,SX,SY,200,'#ff8a5a',.5);
  const SG=x.createRadialGradient(SX,SY,0,SX,SY,74);SG.addColorStop(0,'#fffbe8');SG.addColorStop(.7,'#ffe6a8');SG.addColorStop(1,'rgba(255,200,120,0)');x.fillStyle=SG;x.beginPath();x.arc(SX,SY,80,0,TAU);x.fill();
  // long clouds, lit from below
  for(let i=0;i<16;i++){const y=120+R()*470,w=220+R()*520,X=R()*W,h=10+R()*20;x.globalAlpha=.55;x.fillStyle=y<330?'#3a2048':'#6a2e48';x.beginPath();x.ellipse(X,y,w,h,0,0,TAU);x.fill();x.globalAlpha=.45*(y/600)+.1;x.fillStyle=X>W*.5?'#ffb070':'#e07a5a';x.beginPath();x.ellipse(X+w*.08,y+h*.55,w*.85,h*.35,0,0,TAU);x.fill()}x.globalAlpha=1;
  // the far mesas in haze, then nearer ones, flat-topped
  const mesa=(base,col,seed,hgt)=>{const Q=EVC1.mixC&&R;x.fillStyle=col;x.beginPath();x.moveTo(0,H);let X=-40;x.lineTo(X,base);while(X<W+60){const w=60+R()*260,top=base-hgt*(.3+R()*.7),flat=R()<.6;x.lineTo(X+20+R()*30,top+R()*10);if(flat)x.lineTo(X+w-30,top+R()*8);x.lineTo(X+w,base-R()*16);X+=w+R()*80;x.lineTo(X,base-R()*10)}x.lineTo(W+60,H);x.closePath();x.fill()};
  mesa(752,'#7a4258',0,120);mesa(770,'#542a40',0,70);
  // horizon haze
  {const G=x.createLinearGradient(0,690,0,820);G.addColorStop(0,'rgba(255,150,80,0)');G.addColorStop(.6,'rgba(255,130,80,.3)');G.addColorStop(1,'rgba(255,170,100,0)');x.fillStyle=G;x.fillRect(0,690,W,130)}
  // the town: false-front buildings, a water tower, a windmill, telegraph poles
  x.fillStyle='#2a1420';const bld=[[90,140,120],[214,110,90],[316,170,150],[492,120,96],[1180,130,110],[1300,100,80],[1392,150,124]];for(const[X,w,h]of bld){x.fillRect(X,800-h,w,h);x.fillRect(X+w*.15,800-h-30,w*.7,32);x.fillStyle='#ffb060';for(let j=0;j<2;j++)if(R()<.6){x.globalAlpha=.55;x.fillRect(X+14+j*(w*.5),800-h*.55,14,18)}x.globalAlpha=1;x.fillStyle='#2a1420'}
  // water tower
  {const X=640,Y=800;x.strokeStyle='#2a1420';x.lineWidth=6;x.beginPath();x.moveTo(X-40,Y);x.lineTo(X-30,Y-120);x.moveTo(X+40,Y);x.lineTo(X+30,Y-120);x.moveTo(X-40,Y-20);x.lineTo(X+30,Y-110);x.moveTo(X+40,Y-20);x.lineTo(X-30,Y-110);x.stroke();x.fillStyle='#2a1420';x.fillRect(X-50,Y-210,100,92);x.beginPath();x.moveTo(X-58,Y-210);x.lineTo(X,Y-250);x.lineTo(X+58,Y-210);x.fill()}
  // windmill
  {const X=1530,Y=812;x.strokeStyle='#2a1420';x.lineWidth=5;x.beginPath();x.moveTo(X-34,Y);x.lineTo(X,Y-230);x.lineTo(X+34,Y);x.moveTo(X-24,Y-70);x.lineTo(X+24,Y-70);x.moveTo(X-14,Y-150);x.lineTo(X+14,Y-150);x.stroke();x.fillStyle='#2a1420';for(let i=0;i<14;i++){const b=i*TAU/14+.2;x.save();x.translate(X,Y-236);x.rotate(b);x.fillRect(8,-5,62,10);x.restore()}x.beginPath();x.moveTo(X+4,Y-236);x.lineTo(X+80,Y-250);x.lineTo(X+86,Y-224);x.closePath();x.fill()}
  // telegraph line across the plain
  x.strokeStyle='#2a1420';x.lineWidth=4;const poles=[[30,820,190],[400,808,120],[700,800,80],[900,796,56]];for(const[X,Y,h]of poles){x.beginPath();x.moveTo(X,Y);x.lineTo(X,Y-h);x.moveTo(X-h*.22,Y-h*.9);x.lineTo(X+h*.22,Y-h*.9);x.stroke()}x.lineWidth=1.6;for(let j=-1;j<=1;j+=2){x.beginPath();for(let i=0;i<poles.length-1;i++){const[a,b,h]=poles[i],[c,d,h2]=poles[i+1];const ax=a+j*h*.18,ay=b-h*.9,cx2=c+j*h2*.18,cy=d-h2*.9;x.moveTo(ax,ay);x.quadraticCurveTo((ax+cx2)/2,Math.max(ay,cy)+18,cx2,cy)}x.stroke()}
  // the ground: sun-baked, raked by long shadows, wheel ruts running into the distance
  {const G=x.createLinearGradient(0,800,0,H);G.addColorStop(0,'#d08a4e');G.addColorStop(.25,'#9a5832');G.addColorStop(.7,'#5a2e1a');G.addColorStop(1,'#2a140a');x.fillStyle=G;x.fillRect(0,800,W,H-800)}
  {const G=x.createRadialGradient(SX,812,10,SX,812,900);G.addColorStop(0,'rgba(255,214,140,.55)');G.addColorStop(1,'rgba(255,214,140,0)');x.fillStyle=G;x.fillRect(0,800,W,H-800)}
  x.strokeStyle='rgba(40,16,8,.4)';x.lineWidth=5;for(const s of[-1,1]){x.beginPath();x.moveTo(1000+s*14,806);x.quadraticCurveTo(900+s*100,900,560+s*360,H);x.stroke()}
  for(let i=0;i<70;i++){const y=812+Math.pow(R(),1.7)*260,X=R()*W,s=(y-790)/290;x.fillStyle='rgba(40,18,8,.5)';x.beginPath();x.ellipse(X,y,(6+R()*16)*s*3,(2+R()*4)*s*2,0,0,TAU);x.fill();x.fillStyle='rgba(255,200,130,.35)';x.beginPath();x.ellipse(X+2*s,y-2*s,(4+R()*8)*s*2,(1+R()*2)*s*2,0,0,TAU);x.fill()}
  // cacti and a rail fence in the near corners, dark against the glow
  const cactus=(X,Y,s)=>{x.fillStyle='#1c0e10';const r=(a,b,c,d)=>{x.beginPath();x.moveTo(a-c/2,b);x.lineTo(a-c/2,b-d+c/2);x.arc(a,b-d+c/2,c/2,PI,0);x.lineTo(a+c/2,b);x.closePath();x.fill()};r(X,Y,34*s,300*s);r(X-50*s,Y-110*s,24*s,110*s);x.fillRect(X-50*s,Y-120*s,50*s,22*s);r(X+48*s,Y-150*s,24*s,90*s);x.fillRect(X,Y-160*s,48*s,22*s)};
  cactus(150,1080,1.25);cactus(1810,900,.55);cactus(820,812,.22);cactus(1100,806,.16);
  x.fillStyle='#1c0e10';for(let i=0;i<5;i++){const X=1660+i*70,Y=1080-i*14;x.fillRect(X,Y-130+i*6,12,130-i*6)}x.fillRect(1650,968,300,10);x.fillRect(1650,1010,300,10);
  // warm dust in the air
  for(let i=0;i<120;i++){const X=R()*W,Y=300+R()*700;x.fillStyle=rgba('#ffd8a0',.08+R()*.2);x.fillRect(X,Y,2,2)}}
 // ---------- the signature move's six marks: brass shooting-gallery plates on posts, a gear rim around a cyan bullseye
 function target(y,X,Y,h,t,i,gy){const r=h*.34,sw=sin(t*1.6+i*1.3)*.05;
  // the post, planted in the ground, with a brace
  y.fillStyle='#2a1420';y.fillRect(X-r*.09,Y,r*.18,gy-Y);y.fillRect(X-r*.42,gy-r*.1,r*.84,r*.1);
  y.save();y.globalAlpha=.35;y.fillStyle='#1a0a10';y.beginPath();y.ellipse(X,gy,r*.7,r*.12,0,0,TAU);y.fill();y.restore();
  y.save();y.translate(X,Y);y.rotate(sw);
  gear(y,0,0,r,16,t*.25+i,BRASS,'#4a2a0c',3,0);
  y.fillStyle='#1c3036';y.beginPath();y.arc(0,0,r*.86,0,TAU);y.fill();
  y.lineWidth=r*.07;y.strokeStyle=CY;for(const f of[.7,.46]){y.beginPath();y.arc(0,0,r*f,0,TAU);y.stroke()}
  y.fillStyle=GOLD;y.beginPath();y.arc(0,0,r*.22,0,TAU);y.fill();y.fillStyle='#fff6d0';y.beginPath();y.arc(-r*.06,-r*.06,r*.08,0,TAU);y.fill();
  y.strokeStyle='rgba(255,240,200,.55)';y.lineWidth=r*.05;y.beginPath();y.arc(0,0,r*.95,PI*1.1,PI*1.45);y.stroke();
  y.fillStyle='#5a3a10';for(let j=0;j<4;j++){const b=j*TAU/4+PI/4;y.beginPath();y.arc(cos(b)*r*.78,sin(b)*r*.78,r*.04,0,TAU);y.fill()}
  y.restore()}
 const TOOTH=new Path2D('M-1,-.5L1,-.5L.7,.5L-.7,.5Z');
 let A0=null;
 EVC1.add('gunslinger',{
  pal:[GOLD,'#4a2416','#fff2d6'],eye:'#ffb83a',
  C:{coat:'#6a4428',dark:'#3e2814',trim:GOLD,inner:'#efe2c8',boot:'#4a2e1a',glove:'#2e2018',leg:'#3b3346',scarf:null,coatLen:0},
  wl:560,dress,pieces:['chest','head',[-150,-960,.62]],
  glyph(g,cx,cy,rx,ry,k,t){g.globalCompositeOperation='lighter';const st=Math.floor(t*2.5),f=t*2.5-st,rot=(st+ease(f*3))*TAU/6;g.globalAlpha=k*.95;g.strokeStyle='#ffe2a0';g.lineWidth=rx*.06;for(let i=0;i<6;i++){const b=rot+i*TAU/6;g.beginPath();g.ellipse(cx+cos(b)*rx*.62,cy+sin(b)*ry*.62,rx*.14,ry*.14,0,0,TAU);g.stroke()}
   g.globalAlpha=k*.7;g.fillStyle='#ffe2a0';for(let i=0;i<24;i++){const b=i*TAU/24-t*.3;g.save();g.translate(cx+cos(b)*rx*.88,cy+sin(b)*ry*.88);g.rotate(b);g.fillRect(-rx*.03,-rx*.05,rx*.08,rx*.1);g.restore()}},
  sky:[[0,'#140c26'],[.26,'#3a1e4c'],[.48,'#8a3a52'],[.62,'#e0743c'],[.72,'#ff8a5c'],[.76,'#ffa274'],[1,'#3a1c10']],
  plate,
  aura(y,X,Y,k0,t){y.globalCompositeOperation='lighter';const k=cl(.3+k0*1.1,0,1);
   // big translucent clock gears turning flat on the ground behind her feet
   y.save();y.translate(X,Y-6);y.scale(1,.3);y.globalAlpha=k*.22;gear(y,-150,-260,330,28,t*.35,CY,null);y.globalAlpha=k*.55;gear(y,-150,-260,330,28,t*.35,null,CY,5,1);y.globalAlpha=k*.18;gear(y,260,-360,210,20,-t*.55,GOLD,null);y.globalAlpha=k*.5;gear(y,260,-360,210,20,-t*.55,null,GOLD,4,1);y.restore();
   // a dust devil: gold dust spiralling up from the feet to the shoulders
   y.lineCap='round';for(let s=0;s<4;s++){const ph=t*2.6+s*TAU/4;for(let pass=0;pass<2;pass++){y.globalAlpha=k*(pass?.9:.3);y.strokeStyle=pass?'#ffe8b0':'#ff9a50';y.lineWidth=pass?4.5:20;y.beginPath();for(let j=0;j<=34;j++){const u=j/34,h=u*560*k,rad=(70+u*190)*(1+.08*sin(t*3+s)),b=ph+u*7.5;y[j?'lineTo':'moveTo'](X+cos(b)*rad,Y-h+sin(b)*rad*.18)}y.stroke()}}
   // heat and gold dust rising
   for(let i=0;i<40;i++){const q=(t*.42+i/40)%1,px=X+sin(i*7.3)*(150+(i%9)*30),py=Y-q*640*k;y.globalAlpha=(1-q)*k*.85;y.fillStyle=i%4?'#ffd88a':'#ffffff';y.fillRect(px+sin(t*2+i)*8,py,5,14)}
   // gears and brass orbiting the hips
   for(let i=0;i<8;i++){const b=t*.9+i*TAU/8,ox=X+cos(b)*360,oy=Y-420+sin(b)*70,d=.75+.25*sin(b);y.globalAlpha=k*(.45+.5*d);if(i%2)gear(y,ox,oy,(28+(i%3)*14)*d,12,t*2+i,null,i%4==1?CY:GOLD,4,1);else casing(y,ox,oy,t*3+i,50*d)}
   // a turning ring of dust at the feet
   y.globalAlpha=k*.6;y.strokeStyle='#ffd88a';y.lineWidth=4;for(let j=0;j<3;j++){y.beginPath();y.ellipse(X,Y,260+j*80,40+j*12,0,t*1.4+j,t*1.4+j+2.2);y.stroke()}},
  // the floor: a clock face around a revolver's six chambers
  sigil(y,k,t,R0){y.globalCompositeOperation='lighter';const a=Math.min(1,k*1.4),sweep=Math.min(1,k*1.6)*TAU;y.strokeStyle=GOLD;y.fillStyle=GOLD;
   y.globalAlpha=a;y.lineWidth=10;y.beginPath();y.arc(0,0,R0,-PI/2,-PI/2+sweep);y.stroke();y.lineWidth=4;y.beginPath();y.arc(0,0,R0*.9,-PI/2,-PI/2+sweep);y.stroke();
   y.lineWidth=3;y.beginPath();for(let i=0;i<60;i++){const b=i*TAU/60-PI/2;if(b>-PI/2+sweep)break;const l=i%5?.04:.1;y.moveTo(cos(b)*R0*.9,sin(b)*R0*.9);y.lineTo(cos(b)*R0*(.9+l*0+(i%5?.04:.1)*.95),sin(b)*R0*(.9+(i%5?.04:.1)*.95))}y.stroke();
   y.lineWidth=12;y.beginPath();for(let i=0;i<12;i++){const b=i*TAU/12-PI/2;if(b>-PI/2+sweep)break;y.moveTo(cos(b)*R0*.8,sin(b)*R0*.8);y.lineTo(cos(b)*R0*.88,sin(b)*R0*.88)}y.stroke();
   if(k>.25){const g2=Math.min(1,(k-.25)*2);y.globalAlpha=g2*.85;gear(y,0,0,R0*.62,36,-t*.12,null,CY,4,0);
    y.globalAlpha=g2;y.strokeStyle=GOLD;y.lineWidth=7;const cr=t*.25;for(let i=0;i<6;i++){const b=cr+i*TAU/6;y.beginPath();y.arc(cos(b)*R0*.36,sin(b)*R0*.36,R0*.11,0,TAU);y.stroke()}y.lineWidth=5;y.beginPath();y.arc(0,0,R0*.13,0,TAU);y.stroke()}
   if(k>.5){const g3=Math.min(1,(k-.5)*2);y.globalAlpha=g3;y.lineCap='round';y.strokeStyle='#fff2c8';y.lineWidth=16;const m=t*.5-PI/2,h=t*.5/12+.9;y.beginPath();y.moveTo(0,0);y.lineTo(cos(m)*R0*.84,sin(m)*R0*.84);y.stroke();y.lineWidth=24;y.beginPath();y.moveTo(0,0);y.lineTo(cos(h)*R0*.5,sin(h)*R0*.5);y.stroke()}},
  pose:POSE,
  // the silhouette: six tracers cross behind, a gear turns on the ground
  burst(y,k,t,A){A0=A;y.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const yy=520+i*82,run=A.eo(cl(k*1.6-i*.08,0,1)),x0=960+(i%2?-1:1)*120,x1=x0+(i%2?-1:1)*1200*run;const G=y.createLinearGradient(x0,0,x1,0);G.addColorStop(0,'rgba(255,255,255,0)');G.addColorStop(1,'rgba(255,255,255,.95)');y.fillStyle=G;y.fillRect(Math.min(x0,x1),yy-5,Math.abs(x1-x0),10)}
   y.save();y.translate(960,1020);y.scale(1,.27);y.globalAlpha=.9;gear(y,0,0,700*A.eo(k),40,t*.4,null,'#ffffff',10,0);y.restore()},
  spark(x,c,A){A0=A;A.view(x,c.C,1,y=>{const t=c.t;y.save();y.globalAlpha=.32;gear(y,1560,860,330,30,t*.5,null,CY,4,1);gear(y,1240,1000,170,18,-t*.9,null,GOLD,3,1);y.restore();
   for(let i=0;i<5;i++){const u=(t*.18+i*.21)%1,px=lerp(1900,900,u)+i*40,py=200+i*120+sin(u*6+i)*40;casing(y,px,py,t*1.2+i*2,46)}})},
  piece(x,c,A,i){A0=A;const t=c.t;A.view(x,c.C,1,y=>{
   if(i==0&&t>.64){const f=cl(1-(t-.76)/.2,0,1)*cl((t-.64)/.08,0,1);y.save();y.globalCompositeOperation='lighter';const G=y.createLinearGradient(400,0,1500,0);G.addColorStop(0,'rgba(255,230,170,0)');G.addColorStop(.5,'rgba(255,240,200,'+(.9*f)+')');G.addColorStop(1,'rgba(255,230,170,0)');y.fillStyle=G;y.fillRect(560,540,760,4);y.restore();A.glow(y,922,540,120,'#ffe2a0',.7*f)}
   if(i==1){A.motes(y,40,c.T,26,0,700,1920,380,'#ffd88a',5,-90,.8)}
   if(i==2){y.save();y.globalCompositeOperation='lighter';y.strokeStyle='rgba(255,220,160,.5)';y.lineCap='round';for(let j=0;j<10;j++){const u=((t*1.4+j*.13)%1),yy=300+j*70,xx=lerp(1900,-200,u);y.lineWidth=2+(j%3);y.beginPath();y.moveTo(xx,yy);y.lineTo(xx+260,yy-8);y.stroke()}y.restore();A.motes(y,41,c.T,30,0,600,1920,480,'#ffc070',6,-40,.8)}})},
  windup(x,c,A){A0=A;const t=c.t,k=A.ez(c.u);A.view(x,c.C,1,y=>{y.save();y.globalCompositeOperation='lighter';const mx=1650,my=572;y.globalAlpha=.85*k;gear(y,mx,my,80+30*k,14,t*3,null,CY,4,1);y.globalAlpha=.6*k;y.strokeStyle=GOLD;y.lineWidth=3;y.beginPath();for(let j=0;j<12;j++){const b=j*TAU/12-t*.6;y.moveTo(mx+cos(b)*150,my+sin(b)*150);y.lineTo(mx+cos(b)*176,my+sin(b)*176)}y.stroke();y.restore()});
   // time begins to slow: the colour drains to the edges
   x.save();const G=x.createRadialGradient(960,540,300,960,540,1100);G.addColorStop(0,'rgba(20,60,80,0)');G.addColorStop(1,'rgba(20,60,80,'+(.55*k)+')');x.fillStyle=G;x.fillRect(0,0,1920,1080);x.restore()},
  // Six Bells: draw, time stops, six shots hang in the air, everything lands at once, the last light rings out
  sig:{hits:[.42,1.34,1.96],draw(x,c,A){A0=A;const{q}=A,t=c.t,sp=q.sp,H0=.42,H1=1.34,H2=1.96,SH=[.42,.54,.66,.78,.9,1.02],S=.5,X0=470,FY=1000,PY=30,LEAN=-.04;
   const GX=X0+300;const TG=[[1700,250,190],[1480,430,250],[1820,560,300],[1250,600,330],[1600,770,400],[1180,860,380]];
   const NSx=X0+(-128*cos(LEAN)+372*sin(LEAN))*S,NSy=FY+(-830+PY-128*sin(LEAN)-372*cos(LEAN))*S;
   const ang=TG.map(([tx,ty])=>Math.atan2(ty-NSy,tx-NSx)),aD=Math.atan2(FY+6-NSy,GX-NSx),RA=560,MZ=225,muz=a=>[NSx+cos(a)*(RA+MZ)*S,NSy+sin(a)*(RA+MZ)*S];
   const FR=[.46,.5,.4,.56,.44,.5],fz=t<.28?0:t<H0?A.ez((t-.28)/(H0-.28)):t<H1-.06?1:0;
   const Tf=c.T-(t>H0?Math.min(t,H1)-H0:0)*.96; // the world's clock: almost stopped between the first shot and the landing
   // where the gun points now
   let aim=ang[0],kick=0;if(t>=SH[0]){let j=0;while(j<5&&t>=SH[j+1]-.05)j++;aim=ang[j];if(j<5&&t>SH[j+1]-.05)aim=lerp(ang[j],ang[j+1],A.ez((t-(SH[j+1]-.05))/.05));const ls=SH.filter(s=>s<=t).pop();if(ls!=null)kick=Math.exp(-(t-ls)/.05)}
   A.bg(x,c,.22);
   A.view(x,c.C,1,y=>{
    // the clock on the ground
    A.sigil(y,X0+60,FY+4,lerp(300,1100,A.eo(cl((t-.15)/.4,0,1))),cl(.4+t*1.5,0,1),Tf,.85);
    // the six brass targets on their posts
    for(let i=0;i<6;i++){const[tx,ty,h]=TG[i],gy=Math.max(ty+h*.6,830+(ty/1080)*120);if(t<H1){const drift=t<.3?(1-t/.3)*90:0,rise=t<.3?(1-A.eo(t/.3))*h*.5:0;target(y,tx+drift,ty+rise,h,Tf,i,gy)}
     else{const v=(t-H1)/.9;if(v<1){y.save();y.globalAlpha=1-v;y.fillStyle='#2a1420';y.fillRect(tx-h*.03,ty+h*.3+v*h*.4,h*.06,Math.max(0,gy-ty-h*.3-v*h*.4));y.restore()}if(v<1){A.glow(y,tx,ty,h*(1.2+v*.8),'#ffc860',(1-v)*.9);A.glow(y,tx,ty,h*.4,'#ffffff',(1-v));const R=A.sr(70+i);y.save();y.globalAlpha=1-v*v;for(let s=0;s<10;s++){const b=R()*TAU,sp2=(300+R()*700)*h/300,px=tx+cos(b)*sp2*v,py=ty+sin(b)*sp2*v+600*v*v,rr=h*(.05+R()*.05);y.save();y.translate(px,py);y.rotate(b+v*(8+s));if(s%3==2){y.restore();casing(y,px,py,b+v*12,rr*1.6);continue}y.scale(rr,rr);y.fillStyle=s%3?BRASS:'#ffe6a0';y.fill(TOOTH);y.restore()}y.restore();A.sparks(y,80+i,t-H1,tx,ty,14,900,'#ffe7a0',.7,900);if(i%2==0)A.painter(y,'ring',tx,ty,h*.9,v/.6,0,3,6)}}}
    // the last light, flat on the earth and behind her: the ring runs out from the third shot's mark, the horizon catches it
    if(t>H2){const v=cl((t-H2)/.84,0,1),fa=1-v;y.save();y.beginPath();y.rect(-200,815,2320,400);y.clip();
     y.save();y.translate(GX,FY);y.scale(1,.27);A.painter(y,'ring',0,0,2600,v,0,3,9);y.globalCompositeOperation='lighter';y.globalAlpha=fa;y.strokeStyle='#fff2c8';y.lineWidth=46;y.beginPath();y.arc(0,0,2400*A.eo(v),0,TAU);y.stroke();y.globalAlpha=fa*.6;y.strokeStyle=CY;y.lineWidth=14;y.beginPath();y.arc(0,0,2100*A.eo(v),0,TAU);y.stroke();y.globalAlpha=fa*.8;gear(y,0,0,200+900*A.eo(v),32,t*.6,null,CY,8,0);y.restore();
     // cracks in the baked earth from the mark
     y.globalAlpha=cl(1.4-v,0,1);y.strokeStyle='#2a1008';y.lineWidth=7;y.lineCap='round';const R=A.sr(31);y.beginPath();for(let j=0;j<7;j++){let b=(j/7)*TAU+R()*.5,px=GX,py=FY+6;y.moveTo(px,py);const L=A.eo(cl(v*4,0,1))*(160+R()*220);for(let s=1;s<=3;s++){b+=(R()-.5)*.7;px=GX+cos(b)*L*s/3*1.6;py=FY+6+sin(b)*L*s/3*.42;y.lineTo(px,py)}}y.stroke();y.globalCompositeOperation='lighter';y.strokeStyle='rgba(255,210,120,.7)';y.lineWidth=3;y.stroke();y.restore();
     y.save();y.globalCompositeOperation='lighter';const hb=y.createLinearGradient(0,700,0,840);hb.addColorStop(0,'rgba(255,200,110,0)');hb.addColorStop(.5,'rgba(255,236,190,'+(.85*fa)+')');hb.addColorStop(1,'rgba(255,200,110,0)');y.fillStyle=hb;const run=A.eo(cl(v*2.4,0,1));y.fillRect(GX,700,(1920-GX)*run,140);y.restore();
     A.glow(y,GX+(1920-GX)*run,770,260,'#ffe2a0',.8*fa)}
    // the hero
    const DOWN=kk=>({nh:[cos(aD)*(RA-60*kk),sin(aD)*(RA-60*kk)],fh:[cos(aD)*RA*.55+110,sin(aD)*RA*.55-90-40*kk],wa:aD-.5*kk,lean:.03,py:PY+40,nf:[-190,0],ff:[230,0]});
    const UP={nh:[470,-190],fh:[-30,420],wa:-.72,lean:-.06,py:10,nf:[-150,0],ff:[180,0]};let P;if(t<.28){const u=A.ez(t/.28),d={nh:[160,440],fh:[-20,420],wa:1.0,lean:.04,py:70,nf:[-200,0],ff:[220,0]},a=ang[0],m={nh:[cos(a)*RA,sin(a)*RA],fh:[cos(a)*RA*.7+228*.3,sin(a)*RA*.7+30],wa:a,lean:LEAN,py:PY,nf:[-180,0],ff:[210,0]};P=A.F.lerpPose(d,m,u)}
    else if(t<H1-.14){const a=aim,f=Math.sin(t*60)*kick;P={nh:[cos(a)*(RA-60*kick),sin(a)*(RA-60*kick)],fh:[cos(a)*RA*.62+228*.5-20+f*30,sin(a)*RA*.62-50-60*kick],wa:a-.42*kick,lean:LEAN-.03*kick,py:PY,nf:[-180,0],ff:[210,0]}}
    else if(t<H2-.16){const u=A.ez((t-(H1-.14))/.14),a=ang[5];P=A.F.lerpPose({nh:[cos(a)*RA,sin(a)*RA],fh:[cos(a)*RA*.62+94,sin(a)*RA*.62-50],wa:a,lean:LEAN,py:PY,nf:[-180,0],ff:[210,0]},UP,u)}
    else if(t<H2){P=A.F.lerpPose(UP,DOWN(0),A.ez((t-(H2-.16))/.12))}
    else if(t<H2+.14)P=DOWN(Math.exp(-(t-H2)/.05));
    else{const u=A.eo(cl((t-H2-.14)/.2,0,1));P=A.F.lerpPose(DOWN(0),POSE.hero,u);P.wa+=TAU*2*A.ez(cl((t-H2-.22)/.55,0,1))}
    P.wFront=1;P.hd={yaw:.3,eye:{open:t>H1&&t<H2?.7:.62,angry:.7,pupil:.8},brow:{angry:.75},mouth:{open:t>=H1&&t<H1+.3?.3:.06,smile:t>H2?.2:-.15}};
    A.hero(c,y,X0,FY,S,P,{wind:.5+(t>H1?.5:0)+fz*-.35,act:{rim:[sp.pal[0],1,-8,-3]}})});
   // the world stops: the colour drains away, a cold cast
   if(fz>0){x.save();x.globalCompositeOperation='saturation';x.globalAlpha=.8*fz;x.fillStyle='#808080';x.fillRect(0,0,1920,1080);x.globalCompositeOperation='multiply';x.globalAlpha=.6*fz;x.fillStyle='#6aaed8';x.fillRect(0,0,1920,1080);x.globalCompositeOperation='screen';x.globalAlpha=.12*fz;x.fillStyle='#1a5a7a';x.fillRect(0,0,1920,1080);x.restore()}
   A.view(x,c.C,1,y=>{
    // the shots: flash, a bullet that runs out and hangs in a turning gear, a casing that hangs in the air
    for(let j=0;j<6;j++){const s=SH[j];if(t<s)continue;const a=ang[j],M=muz(a),[tx,ty]=TG[j],Fp=[lerp(M[0],tx,FR[j]),lerp(M[1],ty,FR[j])];
     const fl=t-s;if(fl<.08){const f=1-fl/.08,sc=j?1:1.6;A.glow(y,M[0],M[1],200*sc,'#ffd88a',f);A.glow(y,M[0],M[1],70*sc,'#ffffff',f);y.save();y.globalCompositeOperation='lighter';y.fillStyle='rgba(255,240,200,'+f+')';for(const[d,l,w]of[[0,260,26],[.85,80,14],[-.85,80,14]]){const b=a+d;y.beginPath();y.moveTo(M[0]+cos(b+1.57)*w*sc,M[1]+sin(b+1.57)*w*sc);y.lineTo(M[0]+cos(b)*l*sc,M[1]+sin(b)*l*sc);y.lineTo(M[0]-cos(b+1.57)*w*sc,M[1]-sin(b+1.57)*w*sc);y.closePath();y.fill()}y.restore()}
     let bx,by;if(t<H1-.06){const u=A.eo(cl(fl/.07,0,1));bx=lerp(M[0],Fp[0],u);by=lerp(M[1],Fp[1],u)}else if(t<H1){const u=(t-(H1-.06))/.06;bx=lerp(Fp[0],tx,u);by=lerp(Fp[1],ty,u)}else{bx=null}
     if(bx!=null){y.save();y.globalCompositeOperation='lighter';const L0=t<H1-.06?.0:.0,G=y.createLinearGradient(M[0],M[1],bx,by);G.addColorStop(0,'rgba(106,223,255,0)');G.addColorStop(1,t<H1-.06?'rgba(160,236,255,.7)':'rgba(255,230,160,1)');y.strokeStyle=G;y.lineWidth=t<H1-.06?3:9;y.beginPath();y.moveTo(M[0],M[1]);y.lineTo(bx,by);y.stroke();y.restore();
      A.glow(y,bx,by,60,'#ffd88a',.9);y.save();y.translate(bx,by);y.rotate(a);y.fillStyle='#fff2c8';y.beginPath();y.ellipse(0,0,16,7,0,0,TAU);y.fill();y.restore();
      if(t<H1-.06&&fl>.05){const g=A.ez((fl-.05)/.2);y.save();y.globalCompositeOperation='lighter';y.globalAlpha=g*.95;gear(y,bx,by,48*g,12,Tf*1.5+j+c.T*.6,null,j%2?CY:GOLD,3,1);y.globalAlpha=g*.5;y.strokeStyle='#e0fbff';y.lineWidth=2;y.beginPath();y.arc(bx,by,74*g,0,TAU);y.stroke();y.restore()}}
     // the casing
     {const ca=fl<.1?fl:.1+(Math.min(t,H1)-s-.1)*.05+(t>H1?t-H1:0),hx=NSx+cos(a)*RA*S,hy=NSy+sin(a)*RA*S,vx=-260-j*30,vy=-520+j*20,px=hx+vx*ca,py=hy+vy*ca+(t>H1?1400*(t-H1)*(t-H1):0);if(py<1100)casing(y,px,py,ca*24+j,26)}}
    // a little smoke at the muzzle after the landing
    if(t>H1&&t<H2-.1){const M=[NSx+470*S+cos(-.72)*MZ*S,NSy-190*S+sin(-.72)*MZ*S];for(let i=0;i<6;i++){const v=((t-H1)*1.2+i*.17)%1;A.glow(y,M[0]+30+sin(i*3+t)*20,M[1]-40-v*220,30+v*60,'#c8b8a8',.25*(1-v))}}
    // the third bell: one shot straight down into the clock face, a gold flash at her feet and a burst of gear teeth
    if(t>=H2-.01&&t<H2+.9){const fl=t-H2,M=muz(aD);
     if(fl<.09){const f=1-Math.max(0,fl)/.09;A.glow(y,M[0],M[1],300,'#ffd88a',f);A.glow(y,M[0],M[1],100,'#ffffff',f);y.save();y.globalCompositeOperation='lighter';y.fillStyle='rgba(255,240,200,'+f+')';for(const[d,l,w]of[[0,300,30],[.85,100,16],[-.85,100,16]]){const b=aD+d;y.beginPath();y.moveTo(M[0]+cos(b+1.57)*w,M[1]+sin(b+1.57)*w);y.lineTo(M[0]+cos(b)*l,M[1]+sin(b)*l);y.lineTo(M[0]-cos(b+1.57)*w,M[1]-sin(b+1.57)*w);y.closePath();y.fill()}
      y.strokeStyle='rgba(255,236,190,'+f+')';y.lineWidth=12;y.beginPath();y.moveTo(M[0],M[1]);y.lineTo(GX,FY+6);y.stroke();y.restore()}
     const v=cl(fl/.7,0,1);A.glow(y,GX,FY,520*(1+v),'#ffc860',.95*(1-v));A.glow(y,GX,FY,200,'#ffffff',(1-v)*(1-v));
     const R=A.sr(97);for(let s=0;s<16;s++){const b=-PI*(.08+R()*.84),sp2=500+R()*900,px=GX+cos(b)*sp2*fl,py=FY+sin(b)*sp2*fl+1300*fl*fl,rr=14+R()*16;if(py>FY+40)continue;y.save();y.globalAlpha=1-v;y.translate(px,py);y.rotate(b+fl*(10+s));if(s%4==3){y.restore();y.save();y.globalAlpha=1-v;casing(y,px,py,b+fl*14,rr*1.8)}else{y.scale(rr,rr);y.fillStyle=s%2?BRASS:'#ffe6a0';y.fill(TOOTH)}y.restore()}
     A.sparks(y,133,fl,GX,FY-10,18,1100,'#ffe7a0',.6,900)}
    // the six marks catch the last light as it passes
    if(t>H2){const v=cl((t-H2)/.84,0,1);
     for(let i=0;i<6;i++){const[tx,ty]=TG[i],u=cl(v*1.6-i*.05,0,1);if(u<=0||u>=1)continue;const gx=tx,gy=Math.max(800,Math.min(1000,ty+260)),hh=700*A.eo(u)*(1-u*.4),wv=46*(1-u);y.save();y.globalCompositeOperation='lighter';const G=y.createLinearGradient(0,gy,0,gy-hh);G.addColorStop(0,'rgba(255,250,220,'+(.9*(1-u))+')');G.addColorStop(.4,'rgba(255,200,110,'+(.55*(1-u))+')');G.addColorStop(1,'rgba(255,200,110,0)');y.fillStyle=G;y.beginPath();y.moveTo(gx-wv,gy);y.quadraticCurveTo(gx-wv*.3,gy-hh*.5,gx,gy-hh);y.quadraticCurveTo(gx+wv*.3,gy-hh*.5,gx+wv,gy);y.closePath();y.fill();y.restore();A.glow(y,gx,gy,120,'#ffd88a',.8*(1-u));A.sparks(y,120+i,(t-H2)-i*.04,gx,gy-40,10,700,'#ffe7a0',.8,600)}}
    if(t>H2-.02&&t<H2+.16)A.speedLines(y,GX,FY,31,c.T,'rgba(255,240,200,.85)',.6,40,240);
    if(t>H0-.02&&t<H0+.18)A.speedLines(y,muz(ang[0])[0],muz(ang[0])[1],29,c.T,'rgba(255,240,200,.85)',.6,40,240)});
   if(t>=H1&&t<H1+.3)A.rect(x,'#fff2d0',.6*(1-(t-H1)/.3));if(t>=H2&&t<H2+.3)A.rect(x,'#ffd88a',.45*(1-(t-H2)/.3));
   if(A.lit(t,H0,.06)||A.lit(t,H1,.07)||A.lit(t,H2,.06))A.impact(x)}}
 })})()}catch(e){console.error('EVC gunslinger',e)}
