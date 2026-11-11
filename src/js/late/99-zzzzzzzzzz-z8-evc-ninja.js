// ===== Ninja evolution cinematic: Voidstep Phantom. A cold ink-wash night above a sea of fog, black bamboo, a long line of pale light on the horizon; ink ribbons, a hood, a mask.
// The signature: the world turns to paper, the hero is gone, black cuts appear across the frame one after another, the hero is standing somewhere else, and every cut bursts open with pale light. =====
try{(()=>{const F=()=>FILM1,sin=Math.sin,cos=Math.cos,TAU=6.2832,PI=Math.PI;
 const BLUE='#9adcff',INK='#05060f',INK2='#0d1124',PALE='#eaf8ff',PAPER='#dcefff';
 const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,ease=k=>{k=cl(k,0,1);return 1-Math.pow(1-k,3)},hh=i=>{const v=sin(i*12.9898+7.3)*43758.5453;return v-Math.floor(v)};
 const BL=a=>'rgba(154,220,255,'+a+')';
 // ---------- one long ink ribbon from (X,Y), trailing back: a wave runs down it, the end is a swallowtail that comes apart into flakes
 function ribbon(g,X,Y,L,w,ph,t,wnd,droop){if(L<10)return;const n=20,st=L/n,P=[];let x=X,y=Y;const lift=cl(wnd,0,1.2)*.62;
  for(let i=0;i<=n;i++){const s=i/n,h=PI-droop*(1-lift)+sin(t*5.4+ph-s*6.2)*.44*s+sin(t*1.9+ph*2)*.07;P.push([x,y,h,w*(1-s*.5)]);x+=cos(h)*st;y+=sin(h)*st}
  const top=[],bot=[];P.forEach((q,i)=>{const nx=-sin(q[2]),ny=cos(q[2]),hw=q[3]*.5*(.72+.28*sin(t*6+ph+i*.8));top.push([q[0]+nx*hw,q[1]+ny*hw]);bot.push([q[0]-nx*hw,q[1]-ny*hw])});
  const e=P[n],dx=cos(e[2]),dy=sin(e[2]),nx=-dy,ny=dx,hw=e[3]*.5,p=new Path2D();top.forEach((q,i)=>i?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1]));
  p.lineTo(e[0]+dx*w*1.3+nx*hw,e[1]+dy*w*1.3+ny*hw);p.lineTo(e[0]+dx*w*.35,e[1]+dy*w*.35);p.lineTo(e[0]+dx*w*1.3-nx*hw,e[1]+dy*w*1.3-ny*hw);for(let i=n;i>=0;i--)p.lineTo(bot[i][0],bot[i][1]);p.closePath();
  const G=g.createLinearGradient(X,Y,e[0],e[1]);G.addColorStop(0,'#1a2140');G.addColorStop(.5,INK2);G.addColorStop(1,INK);g.fillStyle=G;g.fill(p);
  g.strokeStyle='rgba(2,3,8,.9)';g.lineWidth=2.4;g.stroke(p);
  // the fold down the middle and the pale edge the light catches
  g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=w*.16;g.beginPath();P.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke();
  g.save();g.globalCompositeOperation='lighter';g.strokeStyle=BL(.85);g.lineWidth=3.2;g.beginPath();top.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke();g.restore();
  // the end comes apart: less of it each time you look
  for(let j=0;j<6;j++){const f=((t*.9+hh(j+ph*7))%1),d=w*1.3+f*w*5,s=w*(.34-f*.24),px=e[0]+dx*d+nx*sin(j*2.1+t*3)*w*.6*f,py=e[1]+dy*d+ny*sin(j*2.1+t*3)*w*.6*f+f*30;if(s<=1)continue;
   g.save();g.translate(px,py);g.rotate(t*3+j);g.globalAlpha=1-f;g.fillStyle=INK;g.fillRect(-s/2,-s/2,s,s);g.strokeStyle=BL(.7);g.lineWidth=1.6;g.strokeRect(-s/2,-s/2,s,s);g.restore()}}
 // ---------- a kunai, pointing along +x from its ring at the origin
 function kunai(g,len,fill,edge){const w=len*.12;g.beginPath();g.moveTo(len,0);g.lineTo(len*.5,-w);g.lineTo(len*.38,-w*.3);g.lineTo(len*.38,w*.3);g.lineTo(len*.5,w);g.closePath();g.fillStyle=fill;g.fill();if(edge){g.strokeStyle=edge;g.lineWidth=len*.02;g.stroke()}
  g.fillRect(len*.1,-w*.22,len*.28,w*.44);g.beginPath();g.arc(0,0,len*.09,0,TAU);g.lineWidth=len*.035;g.strokeStyle=fill;g.stroke()}
 // ---------- the outfit
 // the hood's inside and its long pointed tail, behind the head (head space)
 function hoodBack(g,J,k){const e=ease(k),w=J.wnd,t=J.t;g.save();g.globalAlpha=Math.min(1,k*2.2);g.translate(0,-(1-e)*90);
  const tl=new Path2D(),sw=sin(t*3.6)*26+w*40;tl.moveTo(-60,-214);tl.bezierCurveTo(-200,-230,-300-w*60,-150+sw*.3,-430-w*120,-70+sw);tl.bezierCurveTo(-330-w*60,-90+sw*.5,-250,-40,-176,-20);tl.closePath();
  g.fillStyle=INK2;g.fill(tl);g.strokeStyle='#020308';g.lineWidth=2.6;g.stroke(tl);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=BL(.7);g.lineWidth=3;g.beginPath();g.moveTo(-60,-214);g.bezierCurveTo(-200,-230,-300-w*60,-150+sw*.3,-430-w*120,-70+sw);g.stroke();g.restore();
  const p=new Path2D();p.moveTo(-168,226);p.bezierCurveTo(-222,40,-208,-168,-60,-226);p.bezierCurveTo(70,-256,200,-170,186,40);p.bezierCurveTo(182,120,176,180,166,230);p.closePath();g.fillStyle='#04050c';g.fill(p);g.restore()}
 function hoodFront(g,J,k){const e=ease(k),sy=sin(J.yaw==null?.26:J.yaw),cx=sy*34;g.save();g.globalAlpha=Math.min(1,k*2.2);g.translate(0,-(1-e)*90);
  const p=new Path2D();p.moveTo(-160,232);p.bezierCurveTo(-212,40,-204,-156,-74,-220);p.bezierCurveTo(-10,-250,104,-246,150,-196);p.bezierCurveTo(206,-136,214,40,172,232);
  p.lineTo(130,222);p.bezierCurveTo(156,70,144,-50,cx+100,-108);p.bezierCurveTo(cx+62,-146,cx-62,-146,cx-104,-104);p.bezierCurveTo(-144,-54,-150,70,-120,222);p.closePath();
  const G=g.createLinearGradient(0,-250,0,230);G.addColorStop(0,'#26304e');G.addColorStop(.35,'#151b34');G.addColorStop(1,'#0a0d1c');g.fillStyle=G;g.fill(p);
  // folds of the cloth
  g.save();g.clip(p);g.strokeStyle='rgba(3,4,12,.6)';g.lineWidth=7;g.beginPath();g.moveTo(-150,-120);g.quadraticCurveTo(-176,40,-150,200);g.moveTo(170,-100);g.quadraticCurveTo(190,60,160,210);g.moveTo(-60,-236);g.quadraticCurveTo(-20,-200,40,-226);g.stroke();
  g.fillStyle='rgba(180,220,255,.08)';g.beginPath();g.ellipse(40,-200,90,26,-.1,0,TAU);g.fill();g.restore();
  g.strokeStyle='#020308';g.lineWidth=3;g.stroke(p);
  // the pale edge of the opening
  // the edge of the opening, as cloth: only its lower two-thirds, none over the brow
  g.save();g.beginPath();g.rect(-300,-20,600,300);g.clip();g.strokeStyle=BL(.45);g.lineWidth=3;g.beginPath();g.moveTo(130,222);g.bezierCurveTo(156,70,144,-50,cx+100,-108);g.moveTo(cx-104,-104);g.bezierCurveTo(-144,-54,-150,70,-120,222);g.stroke();g.restore();
  // the shadow the hood throws down over the brow
  const S=g.createRadialGradient(cx,-150,30,cx,-120,150);S.addColorStop(0,'rgba(6,8,20,.85)');S.addColorStop(1,'rgba(6,8,20,0)');g.fillStyle=S;g.beginPath();g.ellipse(cx,-112,124,100,0,0,TAU);g.fill();g.restore()}
 // the mask over the lower face: pulled up from the collar
 function mask(g,J,k){const e=ease(k),yw=J.yaw==null?.26:J.yaw,sy=sin(yw),nx=100*sin(yw)+sy*12;
  const shp=()=>{const p=new Path2D();p.moveTo(-122,30);p.quadraticCurveTo(nx-46,44,nx,36);p.quadraticCurveTo(nx+34,44,124,26);p.bezierCurveTo(132,96,106,160,84,244);p.lineTo(-92,246);p.bezierCurveTo(-116,166,-130,96,-122,30);p.closePath();return p};
  const p=shp();g.save();g.clip(p);g.translate(0,(1-e)*220);
  const G=g.createLinearGradient(0,30,0,246);G.addColorStop(0,'#1c2442');G.addColorStop(.4,'#10152a');G.addColorStop(1,'#070912');g.fillStyle=G;g.fill(p);
  g.strokeStyle='rgba(2,3,10,.7)';g.lineWidth=5;g.beginPath();for(let i=0;i<3;i++){const y=96+i*44;g.moveTo(-118,y-10);g.quadraticCurveTo(nx,y+22,120,y-16)}g.stroke();
  g.strokeStyle='rgba(200,230,255,.22)';g.lineWidth=6;g.beginPath();g.moveTo(nx+4,44);g.quadraticCurveTo(nx+12,64,nx+6,84);g.stroke();
  g.globalCompositeOperation='lighter';g.strokeStyle=BL(1);g.lineWidth=4;g.beginPath();g.moveTo(-122,30);g.quadraticCurveTo(nx-46,44,nx,36);g.quadraticCurveTo(nx+34,44,124,26);g.stroke();
  g.strokeStyle=BL(.45);g.lineWidth=2;g.beginPath();g.moveTo(-112,52);g.quadraticCurveTo(nx-40,64,nx,58);g.quadraticCurveTo(nx+34,64,122,48);g.stroke();
  g.restore();g.strokeStyle='#020308';g.lineWidth=2.6;g.globalAlpha=e;g.stroke(p);g.globalAlpha=1}
 const dress={
  back(g,J){const h=J.k.p2||0;if(h>0){g.save();g.translate(J.HD[0],J.HD[1]);hoodBack(g,J,h);g.restore()}
   const k=J.k.p1||0;if(k<=0)return;const e=ease(k),K=J.rot(-40,-396),w=J.wnd,t=J.t;
   ribbon(g,K[0],K[1],1250*e,54,0,t,w,.55);ribbon(g,K[0]+8,K[1]+14,980*e,42,1.9,t,w,.82);ribbon(g,K[0]-6,K[1]+6,700*e,32,3.4,t,w,.3)},
  torso(g,J){const k=J.k.p1||0;if(k<=0)return;const e=ease(k),t=J.t;g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);g.globalAlpha=Math.min(1,k*2);
   // the sash: a dark wrap at the waist, knotted at the side, its two short tails swinging
   const p=new Path2D();p.moveTo(-96,-168);p.quadraticCurveTo(0,-180,92,-168);p.lineTo(96,-96);p.quadraticCurveTo(0,-84,-100,-96);p.closePath();g.fillStyle=INK2;g.fill(p);g.strokeStyle='#020308';g.lineWidth=2.6;g.stroke(p);
   g.save();g.globalCompositeOperation='lighter';g.strokeStyle=BL(.9);g.lineWidth=3;g.beginPath();g.moveTo(-96,-160);g.quadraticCurveTo(0,-172,92,-160);g.stroke();g.strokeStyle=BL(.4);g.beginPath();g.moveTo(-98,-104);g.quadraticCurveTo(0,-92,94,-104);g.stroke();g.restore();
   for(let i=0;i<2;i++){const sw=sin(t*4+i)*14+J.wnd*90,L=(200-i*50)*e,x0=-70+i*16,q=new Path2D();q.moveTo(x0-14,-110);q.quadraticCurveTo(x0-30-sw*.4,-110+L*.5,x0-40-sw,-110+L);q.lineTo(x0-16-sw,-110+L-16);q.lineTo(x0-6-sw,-110+L+6);q.quadraticCurveTo(x0+2-sw*.4,-110+L*.5,x0+14,-110);q.closePath();g.fillStyle=i?INK:'#141a32';g.fill(q);g.strokeStyle='#020308';g.lineWidth=2;g.stroke(q)}
   g.fillStyle='#141a32';g.beginPath();g.ellipse(-64,-122,26,20,.3,0,TAU);g.fill();g.strokeStyle=BL(.8);g.lineWidth=2.4;g.stroke();
   // a kunai at the hip
   g.save();g.translate(70,-120);g.rotate(1.9);kunai(g,150*e,'#2a3456',BL(.8));g.restore();
   g.restore()},
  front(g,J){const k=J.k.p1||0;if(k<=0)return;const e=ease(k),A=J.nA,NS=J.NS;
   // wraps on the near forearm
   if(A){g.save();g.lineCap='butt';for(let i=0;i<5;i++){const u=.22+i*.13,x=lerp(A[0],A[2],u),y=lerp(A[1],A[3],u),a=Math.atan2(A[3]-A[1],A[2]-A[0]),r=lerp(40,30,u)*e;g.save();g.translate(x,y);g.rotate(a+1.57+.35);g.strokeStyle=INK2;g.lineWidth=16;g.beginPath();g.moveTo(-r,0);g.lineTo(r,0);g.stroke();g.strokeStyle=BL(.7);g.lineWidth=2.4;g.beginPath();g.moveTo(-r,-8);g.lineTo(r,-8);g.stroke();g.restore()}g.restore()}
   // a shoulder guard of lacquered plates, sharp at the back
   const ua=A?Math.atan2(A[1]-NS[1],A[0]-NS[0]):1.57;g.save();g.translate(NS[0]+cos(ua)*30,NS[1]+sin(ua)*30);g.rotate(ua-1.57-.12);g.scale(e*.74,e*.74);for(let i=2;i>=0;i--){const y=i*38,w=128-i*18,p=new Path2D();p.moveTo(-w-70,y+44);p.bezierCurveTo(-w*.9,y-64,w*.9,y-70,w,y+20);p.quadraticCurveTo(0,y+40,-w-70,y+44);p.closePath();const G=g.createLinearGradient(0,y-70,0,y+46);G.addColorStop(0,'#5a6e9c');G.addColorStop(.3,'#26304e');G.addColorStop(1,'#0a0d1c');g.fillStyle=G;g.fill(p);g.strokeStyle='#020308';g.lineWidth=2.6;g.stroke(p);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=BL(.9);g.lineWidth=3;g.beginPath();g.moveTo(-w-40,y+28);g.quadraticCurveTo(0,y+54,w*.95,y+24);g.stroke();g.restore()}g.restore()},
  head(g,J){const k1=J.k.p1||0,k2=J.k.p2||0,k3=J.k.p3||0;
   // a high collar under the jaw (p1), the mask (p3), the hood (p2)
   if(k1>0){const e=ease(k1),sy=sin(J.yaw==null?.26:J.yaw),top=196-46*e;g.save();g.globalAlpha=Math.min(1,k1*2);const p=new Path2D();p.moveTo(-112,262);p.bezierCurveTo(-120,220,-104,top+10,-84,top);p.quadraticCurveTo(sy*40,top+34,92,top-4);p.bezierCurveTo(112,top+12,120,220,116,262);p.quadraticCurveTo(0,280,-112,262);p.closePath();const G=g.createLinearGradient(-110,0,116,0);G.addColorStop(0,'#070912');G.addColorStop(.6,'#151b34');G.addColorStop(1,'#0c1022');g.fillStyle=G;g.fill(p);g.save();g.clip(p);g.strokeStyle='rgba(2,3,10,.75)';g.lineWidth=5;g.beginPath();for(let i=0;i<3;i++){const yy=top+26+i*22;g.moveTo(-110,yy+4);g.quadraticCurveTo(sy*40,yy+30,112,yy-2)}g.stroke();g.restore();g.strokeStyle='#020308';g.lineWidth=2.4;g.stroke(p);g.globalCompositeOperation='lighter';g.strokeStyle=BL(.85);g.lineWidth=3;g.beginPath();g.moveTo(-84,top);g.quadraticCurveTo(sy*40,top+34,92,top-4);g.stroke();g.restore()}
   if(k3>0)mask(g,J,k3);if(k2>0)hoodFront(g,J,k2)}};
 // ---------- an ink cut: a brush stroke from (x0,y0) to (x1,y1), blunt where it starts, a needle where it ends; drawn to fraction u
 function inkCut(y,x0,y0,x1,y1,w,u,col,core,seed){if(u<=0)return;const L=Math.hypot(x1-x0,y1-y0),a=Math.atan2(y1-y0,x1-x0),l=L*Math.min(1,u);y.save();y.translate(x0,y0);y.rotate(a);
  const n=16,p=new Path2D(),pr=s=>s<.1?.5+s/.1*.5:1-Math.pow((s-.1)/.9,1.5);p.moveTo(-w*.18,0);for(let i=0;i<=n;i++){const s=i/n;p.lineTo(s*l,-w*.5*pr(s)*(1+.1*sin(seed+i*2.3)))}for(let i=n;i>=0;i--){const s=i/n;p.lineTo(s*l,w*.5*pr(s)*(.86+.1*sin(seed*2+i*1.7)))}p.closePath();
  y.fillStyle=col;y.fill(p);
  // dry-brush streaks and splatter at the start
  y.strokeStyle=col;y.lineWidth=Math.max(2,w*.07);y.beginPath();for(let j=0;j<3;j++){const o=(j-1)*w*.36,s0=.55+hh(seed+j)*.1;y.moveTo(l*s0,o*1.05);y.lineTo(l*(s0+.22+hh(seed+j+5)*.12),o*.6)}y.stroke();
  y.fillStyle=col;for(let j=0;j<6;j++){const r=w*(.05+hh(seed+j*3)*.12);y.beginPath();y.arc(-w*.2-hh(seed+j)*w*1.4,(hh(seed+j*7)-.5)*w*2,r,0,TAU);y.fill()}
  if(core){y.strokeStyle=core;y.lineWidth=Math.max(2,w*.1);y.beginPath();y.moveTo(w*.3,0);y.lineTo(l*.97,0);y.stroke()}
  y.restore()}
 // the cuts of the signature, in order: [time it lands, x0,y0, x1,y1, width]
 const CUTS=[[.42,-120,250,2040,770,92],[.53,160,-60,1520,700,40],[.62,260,600,2040,1060,50],[.71,880,-80,2040,500,34],[.8,-110,40,940,400,32],[.88,-80,860,940,1120,40],[1.0,-140,730,2060,650,104]];
 // the hero at the head of each cut, a solid ink shape: three dash poses (lunge, low slide, leap)
 const GP=[{nh:[600,170],fh:[-340,60],wa:.2,lean:.45,py:120,nf:[-380,-30],ff:[280,-150],hd:{yaw:.3}},
  {nh:[320,330],fh:[-360,-40],wa:2.9,lean:.64,py:270,nf:[-420,0],ff:[330,0],hd:{yaw:.3}},
  {nh:[-240,-300],fh:[260,160],wa:-2.3,lean:.25,py:30,nf:[-240,-280],ff:[210,-130],hd:{yaw:.3}}];
 // where it stands for each cut: x, feet y, facing, scale, pose. Hit 0 lands on the hero mid-frame.
 const GS=[[1100,1000,1,.5,0],[560,900,-1,.36,1],[1460,980,1,.42,2],[800,780,-1,.3,0],[1260,760,1,.3,1],[430,1000,-1,.46,2],[680,1000,1,.5,0]];
 // the finishing hit: coiled, flung through, settled
 const COIL={nh:[-320,240],fh:[170,250],wa:2.8,lean:.45,py:240,nf:[-330,0],ff:[260,0]},
  FOLL={nh:[590,-70],fh:[-320,40],wa:-.5,lean:.5,py:150,nf:[-350,0],ff:[300,-60]},
  HOLD={nh:[540,130],fh:[-300,90],wa:-.15,lean:.34,py:185,nf:[-330,0],ff:[270,0]};
 const lp=(P,Q,k)=>{const o={};for(const n in P){const a=P[n],b=Q[n];o[n]=Array.isArray(a)?[lerp(a[0],b[0],k),lerp(a[1],b[1],k)]:lerp(a,b,k)}return o};
 // ---------- ink flakes: little torn squares of black, edged in pale light
 function flakes(y,seed,n,X,Y,R,t,col,edge,a){y.save();for(let i=0;i<n;i++){const ang=hh(seed+i)*TAU,v=R*(.3+hh(seed+i*3)),px=X+cos(ang)*v*t,py=Y+sin(ang)*v*t*.7+220*t*t,s=(8+hh(seed+i*5)*16)*(1-t*.6);if(s<=1)continue;y.save();y.translate(px,py);y.rotate(t*6*(hh(seed+i*9)-.5)*4+i);y.globalAlpha=a*cl(1-t,0,1);y.fillStyle=col;y.fillRect(-s/2,-s/2,s,s*.7);if(edge){y.strokeStyle=edge;y.lineWidth=1.6;y.strokeRect(-s/2,-s/2,s,s*.7)}y.restore()}y.restore()}
 EVC1.add('ninja',{
  pal:[BLUE,INK,'#ffffff'],eye:BLUE,
  C:{coat:'#161b33',dark:'#0a0d1c',trim:BLUE,inner:'#05060e',boot:'#10142a',glove:'#1a2038',leg:'#11152a',scarf:null,coatLen:.5},
  wl:720,dress,pieces:[[-60,-1240,1.15],[-40,-1420,1.4],[-10,-1400,1.95]],
  evo:(gr,ev)=>ev?{tails:.3}:null,
  glyph(g,cx,cy,rx,ry,k,t){g.globalAlpha=k*.92;g.fillStyle='#01020a';g.beginPath();g.ellipse(cx,cy+ry*.04,rx*.13,ry*.58,0,0,TAU);g.fill();
   g.globalCompositeOperation='lighter';g.strokeStyle=PALE;g.lineWidth=rx*.07;for(let i=0;i<5;i++){const a0=i*TAU/5+t*1.1;g.globalAlpha=k*(.55+.45*sin(t*3+i));g.beginPath();g.ellipse(cx,cy,rx*.68,ry*.68,0,a0,a0+.78);g.stroke()}},
  sky:[[0,'#020309'],[.32,'#071024'],[.55,'#132c4a'],[.64,'#2e5a80'],[.7,'#10203a'],[.78,'#080c18'],[1,'#030409']],
  plate(x,R,P){const{W,H,glow}=P;
   for(let i=0;i<140;i++){const X=R()*W,Y=R()*480,s=R()<.1?2.4:1.2;x.globalAlpha=.25+R()*.55;x.fillStyle=R()<.3?'#cfeaff':'#ffffff';x.fillRect(X,Y,s,s)}x.globalAlpha=1;
   // a long line of cold light along the horizon, right behind where the hero stands; a weaker one to the left
   x.save();x.translate(960,720);x.scale(3.4,.62);glow(x,0,0,320,BLUE,.62);glow(x,0,0,110,'#ffffff',.55);x.restore();x.save();x.translate(420,692);x.scale(2.6,.5);glow(x,0,0,260,BLUE,.3);x.restore();x.save();x.translate(1560,712);x.scale(2.6,.5);glow(x,0,0,240,'#6aa8e0',.4);x.restore();
   // ridges in ink wash, far to near, fog pooled between them
   const ridge=(yb,amp,c1,c2,fr,seed)=>{x.beginPath();x.moveTo(0,H);for(let X=0;X<=W+24;X+=24){const v=sin(X*fr+seed)*.5+sin(X*fr*2.3+seed*2)*.3+sin(X*fr*5.1+seed*3)*.12+(R()-.5)*.06;x.lineTo(X,yb-amp*(.55+v))}x.lineTo(W,H);x.closePath();const G=x.createLinearGradient(0,yb-amp,0,yb+90);G.addColorStop(0,c1);G.addColorStop(1,c2);x.fillStyle=G;x.fill()};
   ridge(640,300,'#1a2a46','rgba(90,140,180,.55)',.0042,1);
   x.globalAlpha=.5;for(let i=0;i<6;i++){x.save();x.translate(R()*W,560+R()*120);x.scale(1,.12);glow(x,0,0,300+R()*300,'#bfe2ff',.35);x.restore()}x.globalAlpha=1;
   ridge(712,200,'#101a30','rgba(60,100,140,.6)',.006,4);
   x.save();x.translate(960,745);x.scale(9,.5);glow(x,0,0,120,'#a8d8ff',.28);x.restore();
   // a bright band of fog behind the stance, low (y 700-780), well below the head
   x.save();x.translate(960,742);x.scale(5.2,.3);glow(x,0,0,140,'#d8efff',.42);glow(x,0,0,60,'#ffffff',.3);x.restore();
   ridge(790,120,'#090f1e','#0c1424',.009,7);
   // small ink pines along the near ridge
   x.fillStyle='#070b16';for(let i=0;i<26;i++){const X=R()*W,Y=760+R()*40,h=30+R()*50;for(let j=0;j<3;j++){x.beginPath();x.moveTo(X,Y-h+j*h*.28);x.lineTo(X-h*(.2+j*.08),Y-h*.5+j*h*.3);x.lineTo(X+h*(.2+j*.08),Y-h*.5+j*h*.3);x.closePath();x.fill()}}
   // the ground: wet stone, the horizon light lying on it
   const G2=x.createLinearGradient(0,820,0,H);G2.addColorStop(0,'#1a2840');G2.addColorStop(.25,'#0e1626');G2.addColorStop(1,'#030409');x.fillStyle=G2;x.beginPath();x.moveTo(0,840);for(let X=0;X<=W;X+=60)x.lineTo(X,826+sin(X*.004)*8);x.lineTo(W,H);x.lineTo(0,H);x.closePath();x.fill();
   x.strokeStyle='rgba(2,4,10,.7)';x.lineWidth=2;for(let i=0;i<7;i++){const yy=840+Math.pow(i/6,1.7)*240;x.beginPath();x.moveTo(0,yy);for(let X=0;X<=W;X+=80)x.lineTo(X,yy+(R()-.5)*6);x.stroke()}for(let i=-10;i<=10;i++){const o=R()*40;x.beginPath();x.moveTo(960+i*90+o,836);x.lineTo(960+i*300+o*3,H);x.stroke()}
   x.save();x.globalCompositeOperation='lighter';for(let i=0;i<26;i++){const X=760+R()*400,w=4+R()*16;const G=x.createLinearGradient(0,836,0,1080);G.addColorStop(0,'rgba(154,220,255,'+(.08+R()*.14)+')');G.addColorStop(1,'rgba(154,220,255,0)');x.fillStyle=G;x.fillRect(X,836,w,200+R()*60)}x.restore();
   x.fillStyle='rgba(180,220,255,.08)';x.fillRect(0,826,W,8);
   // ink splashes on the stones
   x.fillStyle='rgba(1,2,6,.7)';for(let i=0;i<14;i++){const X=R()*W,Y=880+R()*190,r=10+R()*40;x.beginPath();x.ellipse(X,Y,r,r*.28,0,0,TAU);x.fill();for(let j=0;j<4;j++){x.beginPath();x.ellipse(X+(R()-.5)*r*4,Y+(R()-.5)*r*.8,r*.12,r*.05,0,0,TAU);x.fill()}}
   // black bamboo at both sides, near stalks darkest, the horizon light on their left edges
   const stalk=(X,w,lean,col,rim,leaves)=>{const top=-60,bot=900;x.fillStyle=col;x.beginPath();x.moveTo(X-w/2,bot);x.quadraticCurveTo(X-w/2+lean*.5,(top+bot)/2,X-w/2+lean,top);x.lineTo(X+w/2+lean,top);x.quadraticCurveTo(X+w/2+lean*.5,(top+bot)/2,X+w/2,bot);x.closePath();x.fill();
    if(rim){x.strokeStyle=BL(rim);x.lineWidth=2;x.beginPath();x.moveTo(X-w/2,bot);x.quadraticCurveTo(X-w/2+lean*.5,(top+bot)/2,X-w/2+lean,top);x.stroke()}
    for(let y=bot-60-R()*80;y>top;y-=150+R()*70){const f=(bot-y)/(bot-top),cx=X+lean*f*f;x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=4;x.beginPath();x.moveTo(cx-w/2-2,y);x.lineTo(cx+w/2+2,y);x.stroke();x.strokeStyle=rim?BL(rim*.8):'rgba(120,160,200,.12)';x.lineWidth=1.5;x.beginPath();x.moveTo(cx-w/2,y-4);x.lineTo(cx+w/2,y-4);x.stroke();
     if(leaves&&R()<.55&&y<620){const dir=R()<.5?-1:1;for(let j=0;j<5;j++){const a=dir*(.3+j*.18)+(dir<0?PI:0)+.25,L=70+R()*60;x.fillStyle=col;x.beginPath();x.moveTo(cx,y);x.quadraticCurveTo(cx+cos(a-.12)*L*.5,y+sin(a-.12)*L*.5+6,cx+cos(a)*L,y+sin(a)*L+16);x.quadraticCurveTo(cx+cos(a+.12)*L*.5,y+sin(a+.12)*L*.5+14,cx,y);x.fill()}}}};
   for(const[X,w,l]of[[300,18,-20],[1640,16,24],[420,14,10],[1520,20,-14],[120,20,30],[1800,18,-30]])stalk(X,w,l,'#0b1222',.1,0);
   for(const[X,w,l]of[[200,30,-30],[350,26,24],[60,36,10],[1720,32,30],[1600,26,-20],[1870,38,-10],[470,22,-8]])stalk(X,w,l,'#03050b',.3,1);
   // a low drift of fog over the ground
   x.save();x.translate(960,850);x.scale(8,.35);glow(x,0,0,140,'#cfe8ff',.18);x.restore()},
  aura(y,X,Y,k,t){if(k<=0)return;
   y.globalAlpha=Math.min(1,k*1.4);y.fillStyle='rgba(1,2,6,.8)';y.beginPath();y.ellipse(X,Y+6,360*k,50*k,0,0,TAU);y.fill();
   y.save();y.globalCompositeOperation='lighter';y.strokeStyle=BL(.6);y.lineWidth=3;y.beginPath();y.ellipse(X,Y+6,360*k,50*k,0,0,TAU);y.stroke();y.restore();
   // a helix of ink and pale light winding up around the body
   y.save();y.lineCap='round';const ka=Math.min(1,k*1.5);for(let i=0;i<3;i++){const ph=i*TAU/3+t*1.7,n=18;let px=0,py=0;for(let j=0;j<=n;j++){const v=j/n,b=ph+v*4.4,r=(190+140*v)*k*(1+.08*sin(t*2+i)),qx=X+cos(b)*r,qy=Y-10-v*(700+i*70)*k+sin(b)*r*.22;
     // a brush stroke: broad at the foot, thinning upward; the pale light only along the side turned to us
     if(j){const front=sin(b)>-.15,o=9-v*7;y.globalAlpha=ka*(.95-v*.5)*(front?1:.75);y.strokeStyle=INK;y.lineWidth=18-v*14;y.beginPath();y.moveTo(px,py);y.lineTo(qx,qy);y.stroke();
      if(front){y.globalCompositeOperation='lighter';y.globalAlpha=ka*(.85-v*.45);y.strokeStyle=BLUE;y.lineWidth=3;y.beginPath();y.moveTo(px,py-o);y.lineTo(qx,qy-o);y.stroke();y.globalCompositeOperation='source-over'}}px=qx;py=qy}}y.restore();
   // torn flakes of ink lifting off and fading: less of it each time you look
   for(let i=0;i<36;i++){const q=(t*.32+hh(i))%1,px=X+(hh(i+3)-.5)*760+sin(t+i)*30,py=Y-q*820*k,s=(7+hh(i+7)*12)*(1-q*.5);y.save();y.translate(px,py);y.rotate(t*2+i);y.globalAlpha=(1-q)*k;y.fillStyle=INK;y.fillRect(-s/2,-s/2,s,s*.7);y.strokeStyle=BL(.8);y.lineWidth=1.4;y.strokeRect(-s/2,-s/2,s,s*.7);y.restore()}
   y.globalAlpha=1},
  sigil(y,k,t,R0){const L0=y.lineWidth,a=Math.min(1,k*1.4);y.globalCompositeOperation='lighter';y.strokeStyle=BLUE;y.fillStyle=BLUE;
   // a broken outer ring that turns one way, a thin full ring
   y.save();y.rotate(-t*.22);for(let i=0;i<7;i++){const a0=i*TAU/7,len=TAU/7*.7*Math.min(1,k*1.6);y.lineWidth=12-(i%3)*3;y.globalAlpha=a*.9;y.beginPath();y.arc(0,0,R0,a0,a0+len);y.stroke()}y.restore();
   y.lineWidth=3;y.globalAlpha=a*.55;y.beginPath();y.arc(0,0,R0*.9,0,TAU*Math.min(1,k*1.3));y.stroke();
   // eight kunai, points in, turning the other way
   y.save();y.rotate(t*.14);for(let i=0;i<8;i++){y.save();y.rotate(i*TAU/8);y.translate(R0*.86,0);y.rotate(PI);y.globalAlpha=a*.95;kunai(y,R0*.3*Math.min(1,k*1.5),BLUE,null);y.restore()}y.restore();
   // a spiral of dashes running inwards
   for(let i=0;i<34;i++){const u=i/34,r=R0*(.6-u*.46),b=u*TAU*2.2-t*.9;y.globalAlpha=a*(1-u*.5);y.lineWidth=6;y.beginPath();y.arc(0,0,r,b,b+.2);y.stroke()}
   y.globalCompositeOperation='source-over';y.globalAlpha=a*.9;y.fillStyle=INK;y.beginPath();y.arc(0,0,R0*.13,0,TAU);y.fill();y.lineWidth=L0},
  pose:{gather:{nh:[70,500],fh:[30,520],wa:1.75,lean:.02},
   piece:{nh:[70,500],fh:[30,520],wa:1.75},
   hero:{nh:[560,440],fh:[-420,90],wa:.1,lean:.26,px:-180,py:140,nf:[-260,0],ff:[230,0],hd:{yaw:.22,tilt:-.06,eye:{angry:.5},brow:{angry:.4}}},
   windup:{nh:[-230,230],fh:[200,170],wa:2.6,lean:.3,py:110,nf:[-260,0],ff:[260,0]}},
  burst(y,k,t,A){for(let i=0;i<6;i++){const c=[[-100,180,2020,560,70],[200,-40,1700,620,36],[-80,760,2000,1000,50],[1100,-60,2040,300,30],[-100,420,900,640,34],[600,980,2040,1180,40]][i];inkCut(y,c[0],c[1],c[2],c[3],c[4]*1.4,ease(k*1.4-i*.1),INK,null,i*7)}},
  // the Mythic wakes: the bladed ring turns in the dark, pale light runs round its edge, ink beads fly off its points, and a black cut closes the shot
  spark(x,c,A){const t=c.t,u=c.u,L=1250,cx=lerp(860,820,u),cy=560,R=L*.27,ang=-.5+t*.6;A.bg(x,c,.82,1);A.glow(x,cx,cy,700,BLUE,.12);
   A.view(x,c.C,1,y=>{y.save();y.translate(cx,cy);y.scale(1,.84);A.wpn(y,-L*.2,0,0,L,c.T*.6);
    const hd=t*5.4-1.2,run=A.ez(cl((t-.1)/.4,0,1));if(run>0){A.crescent(y,0,0,R*.92,hd-2.2*run,hd,26,BLUE,.9*run,1);A.glow(y,cos(hd)*R*.92,sin(hd)*R*.92,170,BLUE,.8*run);A.glow(y,cos(hd)*R*.92,sin(hd)*R*.92,46,'#ffffff',.9*run)}
    for(let i=0;i<14;i++){const f=((t*1.1+hh(i))%1),b=hh(i*3)*TAU+t*.5,r=R*(1.02+f*.9),s=(5+hh(i+4)*9)*(1-f*.5);y.save();y.translate(cos(b)*r,sin(b)*r+f*f*160);y.rotate(b+f*4);y.globalAlpha=(1-f)*.9;y.fillStyle=INK;y.fillRect(-s,-s*.5,s*2,s);y.strokeStyle=BL(.8);y.lineWidth=1.5;y.strokeRect(-s,-s*.5,s*2,s);y.restore()}
    y.restore();A.sparks(y,11,(t*1.4)%.7,cx+cos(hd)*R*.92,cy+sin(hd)*R*.78,18,520,BLUE,.5,300)});
   A.motes(x,3,c.T,40,0,0,1920,1080,BLUE,5,-30,.6*u);
   if(t>1.06)inkCut(x,-80,1000,2020,700,64,A.eo((t-1.06)/.1),INK,BL(1),3)},
  piece(x,c,A,i){const t=c.t;if(t>.5&&t<.9){const v=(t-.5)/.4;x.save();x.globalCompositeOperation='lighter';x.globalAlpha=(1-v)*.9;x.strokeStyle=PALE;x.lineWidth=3*(1-v)+1;x.beginPath();const y0=[980,1010,1000][i];x.moveTo(-40,y0);x.lineTo(lerp(-40,1980,A.eo(v*2)),y0-lerp(0,160,A.eo(v*2)));x.stroke();x.restore()}
   flakes(x,40+i,22,[300,1500,1600][i],[860,880,860][i],700,cl((t-.1)/.8,0,1),INK,BL(.8),.9)},
  windup(x,c,A){const t=c.t,k=A.ez(c.u);
   // ink streaks rushing past the edges of the frame
   x.save();for(let i=0;i<12;i++){const yy=i<6?40+i*34:1080-40-(i-6)*34,sp=1800+hh(i)*900,px=((t*sp+hh(i+4)*2400)%2600)-400;inkCut(x,px+700,yy,px,yy+(i<6?6:-6),10+hh(i+2)*16,1,INK,null,i)}x.restore();
   flakes(x,77,26,960,520,-900,cl(1-c.u,0,1),INK,BL(.8),.8*k)},
  // Voidstep: crouch, gone, cut after cut across the paper-white world, standing somewhere else, and every cut bursts
  sig:{hits:[.42,1.0,1.72],draw(x,c,A){const t=c.t,h0=.42,h1=1.0,h2=1.72,paper=t>=h0-.02&&t<h2,X0=820,X1=1330;
   A.bg(x,c,t<h0?.3:.42);
   if(paper){A.rect(x,PAPER,.88);const G=x.createRadialGradient(960,540,300,960,540,1150);G.addColorStop(0,'rgba(40,70,110,0)');G.addColorStop(1,'rgba(40,70,110,.45)');x.fillStyle=G;x.fillRect(0,0,1920,1080)}
   // the cuts landed so far (drawn again in negative on the two impact frames)
   const cutsAt=(y,neg)=>{for(let i=0;i<CUTS.length;i++){const[tc,x0,y0,x1,y1,w]=CUTS[i],u=(t-(tc-.07))/.07;if(u<=0)continue;inkCut(y,x0,y0,x1,y1,w,A.eo(u),neg?PAPER:INK,neg?BLUE:i==0||i==6?BL(1):'#3a6a90',i*7+1);
     if(!neg&&u<1.6){const f=Math.min(1,A.eo(u)),hx=lerp(x0,x1,f),hy=lerp(y0,y1,f),an=Math.atan2(y1-y0,x1-x0),al=(1-Math.max(0,u-1)/.6);y.save();y.translate(hx,hy);y.rotate(an);y.scale(5,.35);A.glow(y,-30,0,60,'#ffffff',al*.9);y.restore()}}};
   // the hero, a solid ink shape at the head of each cut, somewhere new each time, with a smear of ink trailing it
   // each one holds, solid, until the next appears (hard cuts, like a strobe); the last holds until the hero re-forms
   const ghosts=(y,col)=>{for(let i=0;i<CUTS.length;i++){const t0=CUTS[i][0]-.042,t1=i<CUTS.length-1?CUTS[i+1][0]-.042:1.12;if(t<t0||t>=t1)continue;const u=(t-(CUTS[i][0]-.07))/.07,[gx,gy,f,s,pi]=GS[i],P=GP[pi],al=1,sl=(1-cl((u-.4)/.6,0,1))*f*-70;
     for(let j=0;j<3;j++){const yy=gy-(lerp(500,1150,j/2)-P.py)*s;inkCut(y,gx+sl-f*40,yy,gx+sl-f*(240+hh(i*3+j)*420)*s*2,yy+(j-1)*14,(26-j*6)*s*2,1,col,null,i*5+j)}
     const act={sil:1,silC:col,a:al};if(col==INK)act.rim=[BLUE,.9,-6,-2];A.hero(c,y,gx+sl,gy,s,P,{f,wind:1.3,act})}};
   A.view(x,c.C,1,y=>{
    // before: the crouch, the eyes, then the body comes apart in flakes and is gone
    if(t<.4){const v=cl((t-.24)/.14,0,1);A.aura(y,X0,1000,1-v,c.T);A.hero(c,y,X0+v*60,1000,.5,{nh:[-170,330],fh:[160,290],wa:2.7,lean:.38,py:200,nf:[-300,0],ff:[270,0],hd:{yaw:.3,eye:{open:.66,angry:.8,pupil:.7},brow:{angry:.9}}},{wind:.9,act:{a:1-v,sil:v,silC:INK,rim:[BLUE,1,-8,-3]}});
     if(t<.3){y.save();y.globalCompositeOperation='lighter';y.lineCap='round';for(let i=0;i<22;i++){const yy=180+hh(i)*820,sp=2600+hh(i+9)*1800,px=2100-((t*sp+hh(i+3)*2400)%2600),len=160+hh(i+5)*360;y.globalAlpha=.55*(1-t/.3);y.strokeStyle=i%3?BLUE:'#ffffff';y.lineWidth=1.5+hh(i+7)*3;y.beginPath();y.moveTo(px,yy);y.lineTo(px+len,yy);y.stroke()}y.restore()}if(v>0)flakes(y,9,60,X0,700,900,v,INK,BL(.9),1)}
    // the cuts, one after another, the hero in ink at the head of every one
    if(t<h2){cutsAt(y,0);ghosts(y,INK)}
    else for(let i=0;i<CUTS.length;i++){const[tc,x0,y0,x1,y1,w]=CUTS[i];{const v=(t-h2)/.9;if(v<1){y.save();y.globalCompositeOperation='lighter';y.lineCap='round';y.strokeStyle=BL(1);y.globalAlpha=(1-v);y.lineWidth=w*(.6+v*1.4)*(1-v*.7);y.beginPath();y.moveTo(x0,y0);y.lineTo(x1,y1);y.stroke();y.strokeStyle='#ffffff';y.lineWidth=w*.28*(1-v);y.stroke();y.restore()}
      const s=(t-h2)/1.1;if(s<1){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;y.save();for(let j=0;j<9;j++){const f=hh(i*20+j),side=j%2?1:-1,d=(120+hh(i*20+j+5)*380)*A.eo(s),px=x0+dx*f+nx*side*d,py=y0+dy*f+ny*side*d+260*s*s,sz=(14+hh(j+i)*22)*(1-s*.5);y.save();y.translate(px,py);y.rotate(s*8*(hh(j*3+i)-.5)+j);y.globalAlpha=1-s;y.fillStyle=INK;y.beginPath();y.moveTo(-sz,-sz*.3);y.lineTo(sz,0);y.lineTo(-sz*.4,sz*.5);y.closePath();y.fill();y.strokeStyle=BL(.9);y.lineWidth=2;y.stroke();y.restore()}y.restore();A.sparks(y,70+i,t-h2,lerp(x0,x1,.5),lerp(y0,y1,.5),14,900,BLUE,.6,500)}}}
    // standing somewhere else: the flakes come back together
    // coiled low before the last hit, flung through on it, then settled
    if(t>1.1){const v=cl((t-1.1)/.24,0,1);if(v<1)flakes(y,13,50,X1,700,700,1-v,INK,BL(.9),1);
     const P=t<h2?Object.assign({},COIL):t<h2+.06?lp(COIL,FOLL,A.eo((t-h2)/.06)):lp(FOLL,HOLD,A.ez(cl((t-h2-.3)/.38,0,1))),dx=t>h2?A.eo(cl((t-h2)/.12,0,1))*70:0,hx=X1+dx;
     P.hd=t<h2?{yaw:.3,tilt:-.08,eye:{open:.62,angry:.85,pupil:.7},brow:{angry:.9}}:{yaw:.18,eye:{open:.8,angry:.75},brow:{angry:.8},mouth:{open:t<h2+.4?.3:.1,smile:-.2}};
     if(t>h2){A.aura(y,hx,1000,cl((t-h2)/.4,0,1),c.T);A.painter(y,'ring',hx,1000,700,(t-h2)/1.1,0,3,6)}
     A.hero(c,y,hx,1000,.5,P,{wind:1.15,act:{a:v,sil:paper?(1-v)*.9:0,silC:INK,rim:[paper?'#1a2a44':BLUE,paper?.6:1,-8,-3]}});
     // the smear along the arm's path as it whips through
     if(t>h2-.01&&t<h2+.12){const k=(t-h2+.01)/.13,sx=hx+60,sy=1060-(1200-P.py)*.5;A.crescent(y,sx,sy,230,2.3,-.15,90,BLUE,.95*(1-k),1);A.speedLines(y,sx,sy,5,c.T,BL(.9),.55*(1-k),30,330)}}});
   // the first two hits: a hand-made negative (black world, pale cuts, the hero in white); the last inverts the dark plate
   if(A.lit(t,h0,.07)||A.lit(t,h1,.06)){A.rect(x,INK,1);A.view(x,c.C,1,y=>{cutsAt(y,1);ghosts(y,'#ffffff')})}
   else if(A.lit(t,h2,.07))A.impact(x);
   if(t>h2&&t<h2+.3)A.rect(x,'#cfeeff',.55*(1-(t-h2)/.3))}}
 })})()}catch(e){console.error('EVC ninja',e)}
