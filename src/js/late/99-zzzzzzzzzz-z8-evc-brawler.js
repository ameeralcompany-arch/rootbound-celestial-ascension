// ===== Brawler evolution cinematic: Sunfist Champion. A sparring ring on a sun-baked mesa at dusk; heat rises and two small suns circle the waist; a twin-sun wheel of flame on the cracked earth;
// hand wraps and an open jacket, a red headband with long tails, flare-rays from the back; Hundred Suns: a blur of punches that cracks a monolith, then one giant sun-fist that blows it apart. =====
try{(()=>{const F=()=>FILM1,sin=Math.sin,cos=Math.cos,TAU=6.2832,PI=Math.PI;
 const SUN='#ffc04a',CREAM='#fff0c0',RED='#d8341a',WL=560,KN=WL*.24;
 const cl=(v,a,b)=>v<a?a:v>b?b:v,ease=k=>{k=cl(k,0,1);return 1-Math.pow(1-k,3)},lerp=(a,b,k)=>a+(b-a)*k,L2=(a,b,k)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const FLM=['rgba(255,250,225,.95)','rgba(255,206,96,.88)','rgba(255,120,40,.55)','rgba(200,40,20,0)'],FLM2=['rgba(255,236,170,.75)','rgba(255,170,60,.62)','rgba(240,80,30,.32)','rgba(160,20,10,0)'];
 // fist fire: a shot sets these just before drawing the hero; otherwise it follows the timeline
 const FX={on:0,fist:0,far:0};
 // the arm, solved like FILM1 does, so each gauntlet lines up with its forearm
 function ik2(sx,sy,tx,ty,l1,l2,b){let dx=tx-sx,dy=ty-sy,d=Math.hypot(dx,dy)||.001;const m=l1+l2-.01;if(d>m){dx*=m/d;dy*=m/d;d=m}const a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a)),px=sx+dx*a/d,py=sy+dy*a/d;return[px-b*h*dy/d,py+b*h*dx/d,sx+dx,sy+dy]}
 function arm(p,far){const ln=p.lean==null?.02:p.lean,hy=-830+(p.py||0),sx=far?100:-128,S=[sx*cos(ln)+372*sin(ln),hy+sx*sin(ln)-372*cos(ln)],h=far?(p.fh||[0,560]):(p.nh||[-16,560]),b=far?p.fb:p.nb,A=ik2(S[0],S[1],S[0]+h[0],S[1]+h[1],300,292,b==null?1:b);return{S,E:[A[0],A[1]],H:[A[2],A[3]],a:Math.atan2(A[3]-A[1],A[2]-A[0])}}
 // a pose whose gauntlet follows the forearm
 const fit=p=>{p.wa=arm(p).a;p.wFront=1;return p};
 // the fist's centre on screen for a hero drawn at X,Y,s with pose p (far: the far arm's fist)
 function fistAt(p,X,Y,s,f,far){const A=arm(p,far),d=f==null?KN:f;return[X+(A.H[0]+cos(A.a)*d)*s,Y+(A.H[1]+sin(A.a)*d)*s,A.a]}
 function smooth(p,P){const n=P.length;p.moveTo((P[n-1][0]+P[0][0])/2,(P[n-1][1]+P[0][1])/2);for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];p.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}p.closePath();return p}
 // one tongue of flame from x,y along angle a
 function flame(g,x,y,a,len,w,t,ph,G,wob){if(len<4||w<1)return;wob=wob==null?1:wob;g.save();g.translate(x,y);g.rotate(a);const n=6,P=[[-w*.15,0]];for(let i=1;i<=n;i++){const u=i/n,hw=w*.5*Math.pow(1-u,.7)*(1+.3*wob*sin(t*11+ph+u*5)),yo=sin(t*7+ph-u*4)*w*.45*u*wob;P.push([u*len,yo-hw])}for(let i=n-1;i>=1;i--){const u=i/n,hw=w*.5*Math.pow(1-u,.7)*(1+.3*wob*sin(t*13+ph*1.7+u*6)),yo=sin(t*7+ph-u*4)*w*.45*u*wob;P.push([u*len,yo+hw])}
  const p=smooth(new Path2D(),P),Gr=g.createLinearGradient(0,0,len,0);G=G||FLM;Gr.addColorStop(0,G[0]);Gr.addColorStop(.3,G[1]);Gr.addColorStop(.7,G[2]);Gr.addColorStop(1,G[3]);g.fillStyle=Gr;g.fill(p);g.restore()}
 // a ribbon tail: from x,y trailing along angle a, waving
 function ribbon(g,x,y,a,len,w,t,ph,c1,c2,ln){if(len<6)return;const n=10,L=[],R=[],ca=cos(a),sa=sin(a);let px=x-ca,py=y-sa;for(let i=0;i<=n;i++){const u=i/n,wv=sin(t*8.5-u*5.5+ph)*u*len*.09,cx=x+ca*u*len-sa*wv,cy=y+sa*u*len+ca*wv+u*u*len*.08,hw=w*(1-u*.35)*(.75+.25*cos(t*8.5-u*5.5+ph));const dx=cx-px,dy=cy-py,D=Math.hypot(dx,dy)||1,nx=-dy/D,ny=dx/D;L.push([cx+nx*hw,cy+ny*hw]);R.push([cx-nx*hw,cy-ny*hw]);px=cx;py=cy}
  const p=new Path2D();p.moveTo(L[0][0],L[0][1]);for(let i=1;i<=n;i++)p.lineTo(L[i][0],L[i][1]);const e=L[n],f=R[n],mx=(e[0]+f[0])/2-ca*w*1.2,my=(e[1]+f[1])/2-sa*w*1.2;p.lineTo(mx,my);for(let i=n;i>=0;i--)p.lineTo(R[i][0],R[i][1]);p.closePath();
  const G=g.createLinearGradient(x,y,e[0],e[1]);G.addColorStop(0,c1);G.addColorStop(1,c2);g.fillStyle=G;g.fill(p);g.strokeStyle=ln;g.lineWidth=2.6;g.lineJoin='round';g.stroke(p);
  g.save();g.clip(p);g.strokeStyle='rgba(255,220,180,.35)';g.lineWidth=w*.28;g.beginPath();for(let i=0;i<=n;i++){const q=L[i],r=R[i];g[i?'lineTo':'moveTo'](lerp(q[0],r[0],.3),lerp(q[1],r[1],.3))}g.stroke();g.restore()}
 // the shape of a fist, knuckles to the right, about 2 units wide
 // a clenched fist in profile, thumb side to us: tapered wrist stub on the left, four finger rolls stacked on the right, each with its knuckle bump
 const NOTCH=[-.33,-.01,.29];
 const FIST=(()=>{const p=new Path2D();p.moveTo(-1.6,-.34);p.lineTo(-.8,-.5);p.quadraticCurveTo(-.3,-.76,.2,-.71);
  p.quadraticCurveTo(.7,-.73,.7,-.52);p.quadraticCurveTo(.7,-.36,.52,-.33);
  p.quadraticCurveTo(.75,-.32,.75,-.17);p.quadraticCurveTo(.75,-.02,.54,-.01);
  p.quadraticCurveTo(.71,.01,.71,.14);p.quadraticCurveTo(.71,.27,.5,.29);
  p.quadraticCurveTo(.62,.31,.6,.43);p.quadraticCurveTo(.58,.57,.36,.58);
  p.quadraticCurveTo(0,.65,-.32,.61);p.quadraticCurveTo(-.66,.57,-.84,.42);p.lineTo(-1.6,.28);p.closePath();return p})();
 // the thumb, curled across the front of the index and middle fingers
 const THUMB=(()=>{const p=new Path2D();p.moveTo(-.7,.0);p.quadraticCurveTo(-.25,-.16,.22,-.13);p.quadraticCurveTo(.47,-.11,.47,.05);p.quadraticCurveTo(.46,.21,.22,.21);p.quadraticCurveTo(-.2,.24,-.58,.44);p.closePath();return p})();
 // fill a fist (unit space) with shade, creases, rim light and the thumb
 function fistBody(g,G,edge,rim,crease){g.fillStyle=G;g.fill(FIST);g.save();g.clip(FIST);
  // palm side (below) in shade, a bright rim along the back of the hand and the knuckles
  const D=g.createLinearGradient(0,.05,0,.65);D.addColorStop(0,'rgba(120,24,0,0)');D.addColorStop(1,'rgba(120,24,0,.6)');g.fillStyle=D;g.fillRect(-1.7,-.8,2.6,1.6);
  g.save();g.translate(-.055,.06);g.strokeStyle=rim;g.lineWidth=.12;g.stroke(FIST);g.restore();
  // the fold where the fingers curl in, and the creases between them
  g.strokeStyle=crease;g.lineCap='round';g.lineWidth=.035;g.beginPath();g.moveTo(.1,-.66);g.quadraticCurveTo(.02,-.05,.08,.56);g.stroke();
  g.lineWidth=.05;g.beginPath();for(const y of NOTCH){g.moveTo(.02,y+.03);g.quadraticCurveTo(.3,y-.04,.56,y)}g.stroke();
  // knuckle bumps catch the light
  g.fillStyle=rim;for(const[y,x]of[[-.55,.55],[-.21,.6],[.11,.57],[.41,.47]]){g.beginPath();g.ellipse(x,y,.1,.045,-.3,0,TAU);g.fill()}
  g.restore();g.strokeStyle=edge;g.lineWidth=.05;g.lineJoin='round';g.stroke(FIST);
  // the thumb in its own deeper colour, with a cast shadow under it and a lit top edge, so it reads as a separate digit
  g.save();g.translate(.02,.05);g.fillStyle='rgba(110,20,0,.45)';g.fill(THUMB);g.restore();
  const T=g.createLinearGradient(0,-.15,0,.4);T.addColorStop(0,'#ffb648');T.addColorStop(.6,'#e0641a');T.addColorStop(1,'#a83a08');g.fillStyle=T;g.fill(THUMB);g.strokeStyle=edge;g.lineWidth=.05;g.stroke(THUMB);
  g.strokeStyle=rim;g.lineWidth=.035;g.beginPath();g.moveTo(-.5,-.06);g.quadraticCurveTo(-.2,-.13,.2,-.1);g.quadraticCurveTo(.4,-.08,.43,.02);g.stroke();
  g.fillStyle='rgba(255,246,214,.85)';g.beginPath();g.ellipse(.36,-.02,.07,.05,-.2,0,TAU);g.fill();
  g.strokeStyle=crease;g.lineWidth=.03;g.beginPath();g.moveTo(-.05,-.1);g.quadraticCurveTo(0,.05,-.06,.2);g.stroke()}
 // a soft warm glow image, made once
 let GLC=null;function GL(){if(GLC)return GLC;const c=MOVIE1.kit.mk(256,256),x=c.getContext('2d'),G=x.createRadialGradient(128,128,0,128,128,128);G.addColorStop(0,'rgba(255,240,200,.9)');G.addColorStop(.3,'rgba(255,170,70,.5)');G.addColorStop(.7,'rgba(255,90,30,.12)');G.addColorStop(1,'rgba(255,60,20,0)');x.fillStyle=G;x.fillRect(0,0,256,256);return GLC=c}
 // the giant sun-fist: a fist of light with a mane of flame streaming back
 // back: how far behind its centre (along the arm) the real fist is; nothing is drawn behind that, so the hero's arm stays clean
 function sunFist(g,X,Y,S,t,a,al,back){if(S<2||al<=0)return;g.save();g.translate(X,Y);g.rotate(a||0);g.globalAlpha=al;if(back!=null){g.beginPath();g.rect(-back,-S*5,back+S*8,S*10);g.clip()}g.globalCompositeOperation='lighter';
  // the flame mane streams back from the wrist along the arm
  for(let i=0;i<9;i++){const yy=(i-4)*.1*S;flame(g,-S*1.3,yy,PI+sin(t*5+i)*.1+(i-4)*.05,S*(1.3+.4*sin(t*9+i*2.1))*(1-Math.abs(i-4)*.08),S*.38,t,i*1.3)}
  g.drawImage(GL(),-S*1.6,-S*1.4,S*2.8,S*2.8);
  // flames licking off the knuckles and the top of the hand, behind the fist so its outline stays clean
  for(let i=0;i<14;i++){const b=-1.9+i*3.6/13+sin(t*4+i)*.06;flame(g,.1*S+cos(b)*S*.5,sin(b)*S*.58,b,S*(.42+.18*sin(t*12+i*2.3)),S*.22,t,i*1.9)}
  g.globalCompositeOperation='source-over';
  g.save();g.scale(S,S);const G=g.createRadialGradient(.42,-.3,.02,-.1,0,1.5);G.addColorStop(0,'#fff6c8');G.addColorStop(.2,'#ffd468');G.addColorStop(.5,'#ff9a24');G.addColorStop(1,'#b82a04');fistBody(g,G,'#7a2004','rgba(255,250,220,.95)','rgba(150,40,4,.85)');
  // heat moving inside it
  g.save();g.clip(FIST);g.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const yy=-.5+i*.25+sin(t*6+i)*.05;g.fillStyle='rgba(255,220,130,.12)';g.beginPath();g.ellipse(-.5+((t*3+i*.37)%1)*.9,yy,.4,.06,0,0,TAU);g.fill()}g.restore();
  g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,200,120,.45)';g.lineWidth=.12;g.stroke(FIST);g.restore();
  g.restore()}
 // a small ghost fist of the punch rush
 function ghostFist(g,X,Y,S,a,al){g.save();g.translate(X,Y);g.rotate(a);g.globalAlpha=al;g.globalCompositeOperation='lighter';const G=g.createLinearGradient(-S*4,0,0,0);G.addColorStop(0,'rgba(255,120,40,0)');G.addColorStop(1,'rgba(255,220,150,.7)');g.fillStyle=G;g.beginPath();g.moveTo(-S*4,0);g.lineTo(-S*.4,-S*.6);g.lineTo(-S*.4,S*.6);g.closePath();g.fill();g.drawImage(GL(),-S*1.4,-S*1.4,S*2.8,S*2.8);
  g.globalCompositeOperation='source-over';g.globalAlpha=al*.85;g.scale(S,S);g.fillStyle='#ffb84a';g.fill(FIST);g.fillStyle='#ffd27a';g.fill(THUMB);g.strokeStyle='#fff4d0';g.lineWidth=.1;g.stroke(FIST);g.strokeStyle='rgba(170,60,10,.8)';g.lineWidth=.06;g.beginPath();for(const y of NOTCH){g.moveTo(.1,y);g.lineTo(.56,y)}g.stroke();g.restore()}
 // fire around a fist (body space): from the elbow ex,ey through the hand hx,hy, burning at the knuckles
 function fistFire(g,hx,hy,ex,ey,k,t,ph){if(k<=0)return;const a=Math.atan2(hy-ey,hx-ex),fx=hx+cos(a)*KN,fy=hy+sin(a)*KN,r=130*k;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,k);g.drawImage(GL(),fx-r*2,fy-r*2,r*4,r*4);
  for(let i=0;i<7;i++){const b=a+PI+(i-3)*.3+sin(t*6+i+ph)*.1;flame(g,fx+cos(a)*r*.3,fy+sin(a)*r*.3,b,r*(1.4+.5*sin(t*10+i*1.7+ph)),r*.5,t,i+ph)}
  const G=g.createRadialGradient(fx,fy,0,fx,fy,r*.8);G.addColorStop(0,'rgba(255,255,240,.9)');G.addColorStop(.5,'rgba(255,210,110,.5)');G.addColorStop(1,'rgba(255,140,40,0)');g.fillStyle=G;g.beginPath();g.arc(fx,fy,r*.8,0,TAU);g.fill();g.restore()}
 function fireAt(T){const A=EVC1.AT;if(T>=A.windup&&T<A.sig)return[.3+.9*cl((T-A.windup)/.7,0,1),.25];if(T>=A.hero&&T<A.windup)return[.4,.45];if(T>=A.title)return[.32,.22];return[0,0]}
 let TIER=0;const tier=()=>TIER||(TIER=(()=>{try{return Math.max(3,MYTH.tier('brawler')|0)}catch(_){return 3}})());
 // ---------- the outfit
 const dress={
  back(g,J){const t=J.t,w=J.wnd;
   // p3: flare-rays from the shoulder blades and the small of the back, swept back and low, never above the head
   const k3=J.k.p3||0;if(k3>0){const e=ease(k3),A=J.rot(-96,-270),B=J.rot(-80,-130);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,k3*1.6);
    const r0=120*e;g.drawImage(GL(),A[0]-r0*1.5,A[1]-r0,r0*2.4,r0*2);
    for(let i=0;i<11;i++){const u=i/10,a=PI+J.lean+lerp(-.62,.36,u)+sin(t*2.4+i)*.03+w*.08,L=(420+260*((i*37)%5)/4)*e*(.9+.1*sin(t*9+i*2)),wd=(30-Math.abs(u-.55)*18)*e;flame(g,A[0],A[1],a,L,wd*1.5,t,i*2.3,FLM,.35)}
    for(let i=0;i<6;i++){const u=i/5,a=PI+J.lean+lerp(-.95,-.25,u)+sin(t*3+i)*.04,L=(260+90*((i*29)%3))*e*(.88+.12*sin(t*8+i));flame(g,B[0],B[1],a,L,30*e,t,i*3.1+1,FLM2,.5)}
    g.restore()}
   // p2: the headband's tails, from the knot at the back of the head
   const k2=J.k.p2||0;if(k2>0){const e=ease(k2),kx=J.HD[0]-120,ky=J.HD[1]-48,a=PI-(.34-w*.36);
    ribbon(g,kx,ky+8,a+.12,640*e,24,t,0,'#e8401e','#8a1a0c','#4a0a04');ribbon(g,kx,ky,a-.06,520*e,20,t,1.7,RED,'#a0200e','#4a0a04')}},
  torso(g,J){const k=J.k.p1||0;if(k<=0)return;const e=ease(k),t=J.t,w=J.wnd;
   // the second sun: a gauntlet on the far fist too
   if(J.fA){const[ex,ey,hx,hy]=J.fA,a=Math.atan2(hy-ey,hx-ex);g.save();g.globalAlpha=Math.min(1,k*2);g.translate(hx,hy);g.rotate(a);g.scale(lerp(.4,1,e),lerp(.4,1,e));try{MYART.weapon(F().lineScale(g,.32),'brawler',tier(),WL,t,{vector:1})}catch(_){}g.restore()}
   g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);g.translate(0,(1-e)*-50);g.globalAlpha=Math.min(1,k*2);
   // the chest wrap, seen through the open jacket
   const W0=new Path2D();W0.moveTo(-50,-404);W0.lineTo(56,-404);W0.lineTo(30,-150);W0.lineTo(-38,-150);W0.closePath();g.fillStyle='#f6e8c8';g.fill(W0);g.save();g.clip(W0);g.strokeStyle='rgba(150,96,60,.55)';g.lineWidth=3;for(let i=0;i<9;i++){const y=-398+i*30;g.beginPath();g.moveTo(-60,y+8);g.quadraticCurveTo(0,y-6,70,y+4);g.stroke()}g.fillStyle='rgba(120,60,30,.2)';g.fillRect(-60,-410,30,270);g.restore();
   // lapels of the short jacket: deep red with a cream edge, and a stiff collar standing at the neck
   for(const s of[-1,1]){const x0=s<0?-50:56,x1=s<0?-38:30,o=s*34,p=new Path2D();p.moveTo(x0,-406);p.lineTo(x0+o,-400);p.lineTo(x1+o*.6,-160);p.lineTo(x1,-150);p.closePath();g.fillStyle='#9a2410';g.fill(p);g.strokeStyle='#3a0a04';g.lineWidth=2.4;g.stroke(p);g.strokeStyle=CREAM;g.lineWidth=5;g.beginPath();g.moveTo(x0,-404);g.lineTo(x1,-152);g.stroke();
    const c=new Path2D();c.moveTo(x0+o*.2,-404);c.lineTo(x0+s*86,-470);c.lineTo(x0+s*110,-392);c.closePath();g.fillStyle='#c0461a';g.fill(c);g.strokeStyle='#3a0a04';g.lineWidth=2.4;g.stroke(c);g.strokeStyle=SUN;g.lineWidth=3;g.beginPath();g.moveTo(x0+s*86,-466);g.lineTo(x0+s*106,-396);g.stroke()}
   // the sash: wide red cloth over the belt, knotted at the side, its ends swinging
   const sp=new Path2D();sp.moveTo(-96,-186);sp.quadraticCurveTo(0,-176,96,-188);sp.lineTo(98,-96);sp.quadraticCurveTo(0,-86,-98,-96);sp.closePath();const G=g.createLinearGradient(0,-190,0,-90);G.addColorStop(0,'#f0582a');G.addColorStop(.5,RED);G.addColorStop(1,'#8a1a0c');g.fillStyle=G;g.fill(sp);g.strokeStyle='#4a0a04';g.lineWidth=2.6;g.stroke(sp);
   g.strokeStyle='rgba(80,10,4,.45)';g.lineWidth=3;g.beginPath();g.moveTo(-90,-160);g.quadraticCurveTo(0,-148,92,-162);g.moveTo(-92,-124);g.quadraticCurveTo(0,-112,94,-126);g.stroke();
   ribbon(g,-70,-120,PI*.5+.5+w*.5,200*e,20,t*.8,2.4,'#e8401e','#7a160a','#4a0a04');ribbon(g,-56,-118,PI*.5+.3+w*.4,160*e,16,t*.8,4,RED,'#7a160a','#4a0a04');
   g.fillStyle='#e8401e';g.strokeStyle='#4a0a04';g.lineWidth=2.4;g.beginPath();g.ellipse(-72,-136,30,24,-.4,0,TAU);g.fill();g.stroke();
   // the sun badge at the front of the sash
   g.save();g.translate(30,-140);g.fillStyle=SUN;g.strokeStyle='#6a2a08';g.lineWidth=2;for(let i=0;i<12;i++){const a=i*TAU/12+t*.6;g.beginPath();g.moveTo(cos(a-.14)*20,sin(a-.14)*20);g.lineTo(cos(a)*36,sin(a)*36);g.lineTo(cos(a+.14)*20,sin(a+.14)*20);g.closePath();g.fill();g.stroke()}g.beginPath();g.arc(0,0,22,0,TAU);const G2=g.createRadialGradient(-6,-6,2,0,0,22);G2.addColorStop(0,'#fff6d0');G2.addColorStop(1,'#ff9a2a');g.fillStyle=G2;g.fill();g.stroke();g.restore();
   g.restore();
   const f=FX.on?FX.far:fireAt(t)[1];if(J.fA&&f>0)fistFire(g,J.fA[2],J.fA[3],J.fA[0],J.fA[1],f*.85,t,2)},
  front(g,J){const k=J.k.p1||0,t=J.t;if(k>0&&J.nA){const e=ease(k),[ex,ey,hx,hy]=J.nA,a=Math.atan2(hy-ey,hx-ex),ca=cos(a),sa=sin(a);
    // the hand wrap: cream cloth from mid-forearm to the wrist, bound in criss-cross turns, under a red cuff
    g.save();g.globalAlpha=Math.min(1,k*2);const s0=lerp(.34,.8,1-e),sx=lerp(ex,hx,s0),sy=lerp(ey,hy,s0),wx=lerp(ex,hx,.9),wy=lerp(ey,hy,.9),p=F().limb(g,sx,sy,wx,wy,40,32,'#f6ead0','#7a4a2a','rgba(190,140,100,.4)');
    g.save();g.clip(p);g.strokeStyle='rgba(140,90,50,.6)';g.lineWidth=3;const D=Math.hypot(wx-sx,wy-sy),n=Math.max(2,Math.floor(D/26));g.beginPath();for(let i=0;i<=n;i++){const u=i/n,cx=lerp(sx,wx,u),cy=lerp(sy,wy,u);g.moveTo(cx-sa*44-ca*14,cy+ca*44-sa*14);g.lineTo(cx+sa*44+ca*14,cy-ca*44+sa*14)}g.stroke();g.restore();
    g.fillStyle='#9a2410';g.strokeStyle='#3a0a04';g.lineWidth=2.4;g.beginPath();g.moveTo(sx-sa*46-ca*10,sy+ca*46-sa*10);g.lineTo(sx+sa*46-ca*10,sy-ca*46-sa*10);g.lineTo(sx+sa*46+ca*18,sy-ca*46+sa*18);g.lineTo(sx-sa*46+ca*18,sy+ca*46+sa*18);g.closePath();g.fill();g.stroke();g.strokeStyle=SUN;g.lineWidth=3;g.beginPath();g.moveTo(sx-sa*44+ca*4,sy+ca*44+sa*4);g.lineTo(sx+sa*44+ca*4,sy-ca*44+sa*4);g.stroke();
    // loose wrap ends fluttering from the cuff
    ribbon(g,sx,sy,a+PI+.9+sin(t*4)*.2,120*e,9,t,3,'#f6ead0','#d8c49a','#7a4a2a');g.restore();
    // the gauntlet again, over the wrap, exactly where FILM1 put it
    g.save();g.translate(hx,hy);g.rotate(a);try{MYART.weapon(F().lineScale(g,.32),'brawler',tier(),WL,t,{vector:1})}catch(_){}g.restore()}
   const f=FX.on?FX.fist:fireAt(t)[0];if(J.nA&&f>0)fistFire(g,J.nA[2],J.nA[3],J.nA[0],J.nA[1],f,t,0)},
  head(g,J){const k=J.k.p2||0;if(k<=0)return;const e=ease(k),sy=sin(J.yaw==null?.26:J.yaw);g.save();g.globalAlpha=Math.min(1,k*2);g.translate(0,(1-e)*-40);
   // a red headband across the brow, knotted at the back
   // it sits low on the brow and is clipped to the head's outline, so both ends wrap round the head instead of ending square
   g.save();g.beginPath();g.ellipse(0,0,132,140,0,0,TAU);g.clip();
   const b=new Path2D();b.moveTo(-150,-62);b.quadraticCurveTo(sy*40,-114,150,-66);b.lineTo(150,-28);b.quadraticCurveTo(sy*40,-80,-150,-24);b.closePath();const G=g.createLinearGradient(0,-100,0,-30);G.addColorStop(0,'#ff5a2a');G.addColorStop(.55,RED);G.addColorStop(1,'#8a1a0c');g.fillStyle=G;g.fill(b);g.strokeStyle='#4a0a04';g.lineWidth=3;g.stroke(b);
   g.strokeStyle='rgba(255,230,190,.55)';g.lineWidth=2.4;g.setLineDash([9,7]);g.beginPath();g.moveTo(-140,-50);g.quadraticCurveTo(sy*40,-100,140,-54);g.stroke();g.setLineDash([]);
   // the band's own shading where it turns away round the head
   const E=g.createRadialGradient(sy*30,-60,40,sy*30,-60,150);E.addColorStop(0,'rgba(60,6,2,0)');E.addColorStop(1,'rgba(60,6,2,.45)');g.fillStyle=E;g.fill(b);
   // the sun plate on the brow
   const px=sy*40,py=-72;g.translate(px,py);const q=1-Math.abs(sy)*.3;g.fillStyle='#ffb040';g.strokeStyle='#5a1a08';g.lineWidth=2.2;g.beginPath();g.ellipse(0,0,34*q,18,0,0,TAU);g.fill();g.stroke();g.fillStyle='#fff2c0';g.beginPath();g.ellipse(-6,-5,10,5,0,0,TAU);g.fill();g.strokeStyle='#8a3a0a';g.lineWidth=2;for(let i=0;i<8;i++){const a=i*TAU/8+.39;g.beginPath();g.moveTo(cos(a)*9*q,sin(a)*5);g.lineTo(cos(a)*17*q,sin(a)*10);g.stroke()}g.restore();
   // the knot at the back of the head
   g.fillStyle='#e8401e';g.strokeStyle='#4a0a04';g.lineWidth=2.6;for(const[dx,dy,r]of[[-12,-14,.6],[-6,16,-.5]]){g.beginPath();g.ellipse(-124+dx,-44+dy,26,14,r,0,TAU);g.fill();g.stroke()}g.beginPath();g.arc(-122,-44,13,0,TAU);g.fill();g.stroke();g.restore()}};
 // ---------- the monolith the signature move breaks: a grid of chunks, built once
 let ROCK=null;function rock(A){if(ROCK)return ROCK;const R=A.sr(77),cols=3,rows=6,X0t=1250,X1t=1500,X0b=1200,X1b=1560,Yt=330,Yb=1010,P=[];
  // inner vertices jittered hard (each column and row line wanders), so no two pieces are alike
  for(let j=0;j<=rows;j++){P.push([]);for(let i=0;i<=cols;i++){const v=j/rows,u=i/cols,x=lerp(lerp(X0t,X0b,v),lerp(X1t,X1b,v),u)+(i>0&&i<cols?(R()-.5)*76:0),y=lerp(Yt,Yb,v)+(j>0&&j<rows?(R()-.5)*90:j==0?(R()-.5)*60+(u-.5)*-40:0);P[j].push([x,y])}}
  // every cell splits along a random diagonal into two shards; the bottom row and part of the next stay standing as a jagged stump
  const ch=[];for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const Q=[P[j][i],P[j][i+1],P[j+1][i+1],P[j+1][i]],tris=R()<.5?[[Q[0],Q[1],Q[2]],[Q[0],Q[2],Q[3]]]:[[Q[0],Q[1],Q[3]],[Q[1],Q[2],Q[3]]];
   // in the second row up, only the shard resting on the row below may stay, and the one above it only if that one did
   const s2=j==rows-3&&R()<.7,s1=s2&&R()<.4;
   tris.forEach((q,ti)=>{const cx=(q[0][0]+q[1][0]+q[2][0])/3,cy=(q[0][1]+q[1][1]+q[2][1])/3,stay=j>=rows-2||(ti?s2:s1);ch.push({q:q.map(p=>[p[0]-cx,p[1]-cy]),cx,cy,stay,vx:stay?0:250+R()*1150+(rows-j)*50,vy:stay?0:-250-R()*950,sp:(R()-.5)*9,sh:R()})})}
  // small fast pebbles for scale
  const pb=[];for(let i=0;i<26;i++){const y0=380+R()*560;pb.push({x:lerp(X0t,X0b,(y0-Yt)/(Yb-Yt))+R()*300,y:y0,vx:300+R()*2100,vy:-1500+R()*1300,s:6+R()*13,sp:(R()-.5)*20,a:R()*TAU})}
  const out=[];for(let i=0;i<=cols;i++)out.push(P[0][i]);for(let j=1;j<=rows;j++)out.push(P[j][cols]);for(let i=cols-1;i>=0;i--)out.push(P[rows][i]);for(let j=rows-1;j>0;j--)out.push(P[j][0]);
  const cr=[];for(let i=0;i<8;i++){const y0=430+i*44+R()*20;let x=lerp(X0t,X0b,(y0-Yt)/(Yb-Yt))+4,y=y0;const pts=[[x,y]];for(let j=0;j<4;j++){x+=30+R()*55;y+=(R()-.5)*80;pts.push([x,y])}cr.push({p:pts,b:0});if(i%2==0){let bx=pts[2][0],by=pts[2][1];const br=[[bx,by]];for(let j=0;j<3;j++){bx+=20+R()*40;by+=(R()-.3)*70;br.push([bx,by])}cr.push({p:br,b:1})}}
  return ROCK={ch,out,cr,pb}}
 // a soft dust puff image, made once
 let DUC=null;function DU(){if(DUC)return DUC;const c=MOVIE1.kit.mk(128,128),x=c.getContext('2d'),G=x.createRadialGradient(64,64,0,64,64,64);G.addColorStop(0,'rgba(222,150,96,.85)');G.addColorStop(.5,'rgba(186,104,62,.5)');G.addColorStop(1,'rgba(150,70,34,0)');x.fillStyle=G;x.fillRect(0,0,128,128);return DUC=c}
 // dust and smoke rolling off the stump's base: grows and fades over .8 s
 function dust(y,cx,cy,d,seed,sc){if(d<0||d>.85)return;const R=MOVIE1.kit.sr(seed),f=1-d/.85;y.save();for(let i=0;i<9;i++){const dir=R()<.5?-1:1,px=cx+(R()-.5)*300+dir*A0.eo(d/.85)*(120+R()*160),py=cy-30-R()*60-A0.eo(d/.85)*(60+R()*130),r=(55+R()*60)*(.45+A0.eo(d/.85)*1.1)*(sc||1);y.globalAlpha=f*.8;y.drawImage(DU(),px-r*1.3,py-r*.8,r*2.6,r*1.6)}
  // the hot side of the cloud, lit by the fire
  y.globalCompositeOperation='lighter';y.globalAlpha=f*.3;y.drawImage(GL(),cx-260,cy-140,520,220);y.restore()}
 // a gouge torn through the ground from x0 to x1, flame tongues licking up along it, growing in from the start (d: time since the blow)
 function trench(y,x0,x1,gy,d,t,al){const len=x1-x0;if(len<20||al<=0)return;y.save();y.globalAlpha=al;
  const N=18,T=[],B=[];for(let i=0;i<=N;i++){const u=i/N,w=Math.pow(sin(u*PI),.7)*(11+4*sin(i*2.7)),xx=x0+u*len;T.push([xx,gy-w*.7+sin(i*1.9)*2]);B.push([xx,gy+w*.45])}
  const p=new Path2D();p.moveTo(T[0][0],T[0][1]);for(let i=1;i<=N;i++)p.lineTo(T[i][0],T[i][1]);for(let i=N;i>=0;i--)p.lineTo(B[i][0],B[i][1]);p.closePath();
  y.globalCompositeOperation='lighter';y.globalAlpha=al*.55;y.drawImage(GL(),x0-40,gy-70,len+80,120);y.globalAlpha=al;
  y.globalCompositeOperation='source-over';y.fillStyle='#1a0602';y.fill(p);
  // the molten seam inside the gouge
  y.globalCompositeOperation='lighter';y.strokeStyle='rgba(255,150,50,.9)';y.lineWidth=2.5;y.beginPath();for(let i=1;i<N;i++){const q=T[i],r=B[i];y[i>1?'lineTo':'moveTo'](q[0],lerp(q[1],r[1],.55))}y.stroke();
  for(let i=0;i<16;i++){const u=(i+.5)/16,g0=cl((d-u*.18)/.2,0,1);if(g0<=0)continue;const tp=Math.pow(sin(u*PI),.6),h=(80+55*sin(t*9+i*1.7))*g0*tp;flame(y,x0+u*len,gy-2,-1.57+sin(t*3+i*1.3)*.16,h,24*tp+6,t,i*1.3,FLM2)}
  y.restore()}
 const rockFill=(g,y0,y1)=>{const G=g.createLinearGradient(1200,0,1560,0);G.addColorStop(0,'#d07a44');G.addColorStop(.35,'#9a4a28');G.addColorStop(1,'#4a1e12');return G};
 function drawRock(y,t,H0,H1,A){const K=rock(A),sh=t>H0&&t<H1?sin(t*90)*4:0;y.save();
  if(t<H1){y.translate(sh,0);const p=new Path2D();K.out.forEach((q,i)=>p[i?'lineTo':'moveTo'](q[0],q[1]));p.closePath();y.fillStyle=rockFill(y);y.fill(p);y.strokeStyle='#2a0e06';y.lineWidth=4;y.stroke(p);
   y.save();y.clip(p);y.strokeStyle='rgba(60,20,8,.25)';y.lineWidth=4;for(let i=0;i<9;i++){const Y=380+i*72;y.beginPath();y.moveTo(1150,Y);y.quadraticCurveTo(1380,Y+18*sin(i*2.1),1600,Y-10);y.stroke()}y.fillStyle='rgba(255,190,120,.22)';y.fillRect(1150,300,70,720);y.fillStyle='rgba(30,8,10,.3)';y.fillRect(1470,300,140,720);
   // cracks open where the punches land, with sun-fire inside
   // each crack tapers from wide at its root to a hairline at its tip; a thin hot seam glows inside it
   y.lineCap='round';y.lineJoin='round';for(let i=0;i<K.cr.length;i++){const c0=H0+i*.07,u=cl((t-c0)/.18,0,1);if(u<=0)continue;const C=K.cr[i],pts=C.p,m=pts.length-1,n=Math.max(1,Math.round(u*m)),bw=C.b?.55:1,hk=cl((t-c0)/.6,0,1);
    y.strokeStyle='#1a0602';for(let j=0;j<n;j++){y.lineWidth=lerp(14,3,j/(m-1||1))*bw;y.beginPath();y.moveTo(pts[j][0],pts[j][1]);y.lineTo(pts[j+1][0],pts[j+1][1]);y.stroke()}
    y.save();y.globalCompositeOperation='lighter';y.strokeStyle='rgba(255,130,40,'+(.35+.6*hk)+')';for(let j=0;j<n;j++){y.lineWidth=lerp(3,1.2,j/(m-1||1))*bw;y.beginPath();y.moveTo(pts[j][0],pts[j][1]);y.lineTo(pts[j+1][0],pts[j+1][1]);y.stroke()}
    if(!C.b){y.globalAlpha=.35*hk;y.drawImage(GL(),pts[0][0]-50,pts[0][1]-50,100,100)}y.restore()}
   if(t>1.3){y.save();y.globalCompositeOperation='lighter';y.globalAlpha=cl((t-1.3)/.3,0,1)*.5;y.drawImage(GL(),1100,300,500,500);y.restore()}
   y.restore()}
  else{const d=t-H1;
   // the stump keeps standing and glowing where it broke
   y.save();y.globalCompositeOperation='lighter';y.globalAlpha=.4*cl(1-d/1.6,.25,1);y.drawImage(GL(),1200,700,360,200);y.restore();
   for(const c of K.ch){const X=c.stay?c.cx:c.cx+c.vx*d,Y=c.stay?c.cy:c.cy+c.vy*d+850*d*d,r=c.stay?0:c.sp*d;if(Y>1300||X>2200)continue;y.save();y.translate(X,Y);y.rotate(r);const p=new Path2D();c.q.forEach((q,i)=>p[i?'lineTo':'moveTo'](q[0]*(c.stay?1:.9),q[1]*(c.stay?1:.9)));p.closePath();y.fillStyle=c.stay?(c.cx<1330?'#94482a':c.cx<1440?'#70321c':'#481a0e'):c.sh>.5?'#9a4a28':'#7a3a20';y.fill(p);y.strokeStyle='#2a0e06';y.lineWidth=c.stay?4:3;y.stroke(p);
    // heat in the broken faces: the flying shards cool as they fly, the stump keeps an ember edge
    y.save();y.clip(p);y.globalCompositeOperation='lighter';if(!c.stay){y.fillStyle='rgba(255,150,60,'+(.75*cl(1-d/1.3,0,1))+')';y.fillRect(-200,-200,60,400)}else{const Gs=y.createLinearGradient(0,-60,0,-12);Gs.addColorStop(0,'rgba(255,140,50,'+(.6*cl(1-d/2,.35,1))+')');Gs.addColorStop(1,'rgba(255,120,40,0)');y.fillStyle=Gs;y.fillRect(-200,-200,400,400)}y.restore();y.restore()}
   // pebbles, faster and smaller
   y.fillStyle='#5a2614';y.strokeStyle='rgba(255,170,90,.8)';y.lineWidth=2;for(const b of K.pb){const X=b.x+b.vx*d,Y=b.y+b.vy*d+1100*d*d;if(Y>1100||X>2100)continue;y.save();y.translate(X,Y);y.rotate(b.a+b.sp*d);y.beginPath();y.moveTo(-b.s,-b.s*.4);y.lineTo(b.s*.3,-b.s*.7);y.lineTo(b.s,b.s*.2);y.lineTo(-b.s*.2,b.s*.6);y.closePath();y.fill();y.stroke();y.restore()}}
  y.restore()}
 // the stance for the rush: the punching arm out and back, the other at the chest
 const BASE={lean:.14,py:100,nf:[-250,0],ff:[250,0],hd:{yaw:.3,eye:{open:.72,angry:.85},brow:{angry:.9},mouth:{open:.55,smile:-.3}}};
 function rushPose(t){const ph=t/.06,i=Math.floor(ph),u=ph-i,e=u<.4?A0.eo(u/.4):1-A0.ez((u-.4)/.6),nearTurn=i%2==0,out=nearTurn?e:0,outF=nearTurn?0:e;
  return fit(Object.assign({},BASE,{nh:L2([70,140],[560,130],out),fh:L2([10,170],[470,160],outF),lean:.14+.05*e,_far:!nearTurn}))}
 let A0=null;
 EVC1.add('brawler',{
  pal:['#ff8a2a','#5a1a08','#fff0c0'],eye:'#ffb030',
  C:{coat:'#e8641a',dark:'#8a2a0e',trim:CREAM,inner:'#f6e8c8',boot:'#5a2414',glove:'#f6ead0',leg:'#2e1712',scarf:null,coatLen:0},
  wl:WL,wlClose:1600,dress,pieces:['chest','head','back'],
  glyph(g,cx,cy,rx,ry,k,t){g.globalCompositeOperation='lighter';g.strokeStyle='#fff0c0';g.fillStyle='#ffc04a';const r=Math.min(rx,ry);g.globalAlpha=k*.9;g.lineWidth=r*.07;g.beginPath();g.ellipse(cx,cy,rx*.44,ry*.44,0,0,TAU);g.stroke();
   for(let i=0;i<10;i++){const a=i*TAU/10+t*.7;g.globalAlpha=k*(.55+.45*sin(t*5+i*1.3));g.beginPath();g.moveTo(cx+cos(a-.16)*rx*.5,cy+sin(a-.16)*ry*.5);g.quadraticCurveTo(cx+cos(a+.05)*rx*.72,cy+sin(a+.05)*ry*.72,cx+cos(a+.12)*rx*.86,cy+sin(a+.12)*ry*.86);g.lineTo(cx+cos(a+.16)*rx*.5,cy+sin(a+.16)*ry*.5);g.closePath();g.fill()}},
  sky:[[0,'#24081c'],[.3,'#5a1428'],[.52,'#b8401e'],[.66,'#ff9a48'],[.72,'#ffcc78'],[1,'#3a1408']],
  plate(x,R,P){const{W,H,glow}=P;
   // the sun, low on the left, sinking behind the far mesas
   glow(x,420,640,1100,'#ff6a1a',.5);glow(x,420,640,460,'#ffb040',.8);{const G=x.createRadialGradient(405,620,10,420,640,140);G.addColorStop(0,'#fffbe8');G.addColorStop(.55,'#ffe2a0');G.addColorStop(1,'#ffa040');x.fillStyle=G;x.beginPath();x.arc(420,640,140,0,TAU);x.fill()}
   // long thin clouds lit from below, one crossing the sun
   for(let i=0;i<18;i++){const y=100+R()*540,w=240+R()*520,X=R()*W,h=7+R()*16;x.globalAlpha=.5+R()*.5;x.fillStyle=y>420?'rgba(255,170,100,.32)':'rgba(255,110,90,.18)';x.beginPath();x.ellipse(X,y,w,h,0,0,TAU);x.fill();x.fillStyle='rgba(60,10,30,.25)';x.beginPath();x.ellipse(X+20,y-h*.5,w*.9,h*.5,0,0,TAU);x.fill()}x.globalAlpha=1;
   x.fillStyle='rgba(120,30,40,.55)';x.beginPath();x.ellipse(470,612,330,9,0,0,TAU);x.fill();x.beginPath();x.ellipse(330,668,260,7,0,0,TAU);x.fill();
   // heat haze over the horizon
   {const G=x.createLinearGradient(0,620,0,820);G.addColorStop(0,'rgba(255,150,70,0)');G.addColorStop(.6,'rgba(255,150,70,.35)');G.addColorStop(1,'rgba(255,120,60,0)');x.fillStyle=G;x.fillRect(0,620,W,200)}
   // three ranges of flat-topped mesas, far to near; low in the middle so the hero stands clear
   const mesa=(y0,hMin,hMax,col,edge)=>{let X=-40;x.fillStyle=col;x.beginPath();x.moveTo(-40,H);x.lineTo(-40,y0);while(X<W+40){const cen=Math.abs(X-960)/960,h=lerp(hMin,hMax,Math.pow(cen,1.4))*(.55+R()*.6),w=90+R()*260,s=20+R()*50;x.lineTo(X+s,y0-h);x.lineTo(X+s+w,y0-h+R()*8);x.lineTo(X+s*2+w,y0);X+=s*2+w+R()*120;x.lineTo(X,y0-R()*10)}x.lineTo(W+40,H);x.closePath();x.fill();if(edge){x.strokeStyle=edge;x.lineWidth=3;x.stroke()}};
   mesa(770,20,110,'#8a3a4a');{const G=x.createLinearGradient(0,600,0,800);G.addColorStop(0,'rgba(255,140,80,0)');G.addColorStop(1,'rgba(255,140,80,.3)');x.fillStyle=G;x.fillRect(0,600,W,200)}
   mesa(810,30,280,'#5a1e2c','rgba(255,150,90,.35)');mesa(850,20,420,'#36121a','rgba(255,120,60,.3)');
   // the ground: sun-baked earth, cracked, lit from the left
   {const G=x.createLinearGradient(0,830,0,H);G.addColorStop(0,'#8a3c1c');G.addColorStop(.35,'#5a2412');G.addColorStop(1,'#220c08');x.fillStyle=G;x.fillRect(0,830,W,H-830)}
   {const G=x.createRadialGradient(420,840,40,420,840,900);G.addColorStop(0,'rgba(255,170,90,.45)');G.addColorStop(1,'rgba(255,170,90,0)');x.fillStyle=G;x.fillRect(0,830,W,H-830)}
   // the sparring ring: a worn circle of packed stone, posts bound in rope behind it
   x.fillStyle='rgba(30,10,6,.35)';x.beginPath();x.ellipse(960,1000,920,150,0,0,TAU);x.fill();x.fillStyle='#7a3a1e';x.beginPath();x.ellipse(960,990,880,130,0,0,TAU);x.fill();x.strokeStyle='#c8703a';x.lineWidth=4;x.stroke();x.strokeStyle='rgba(40,12,6,.5)';x.lineWidth=3;x.beginPath();x.ellipse(960,990,700,100,0,0,TAU);x.stroke();
   for(let i=0;i<40;i++){const a=R()*TAU,r=R(),X=960+cos(a)*r*840,Y=990+sin(a)*r*120;x.fillStyle='rgba(40,14,6,.4)';x.beginPath();x.ellipse(X,Y,6+R()*16,2+R()*4,0,0,TAU);x.fill()}
   const posts=[[150,930],[520,872],[1400,872],[1770,930]];x.strokeStyle='#e8c890';x.lineWidth=5;for(let i=0;i<posts.length-1;i++){const a=posts[i],b=posts[i+1];if(i==1)continue;for(const o of[30,70]){x.beginPath();x.moveTo(a[0],a[1]-150+o);x.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2-100+o,b[0],b[1]-150+o);x.stroke()}}
   for(const[X,Y]of posts){x.fillStyle='#3a1a0e';x.fillRect(X-16,Y-190,32,190);x.fillStyle='#6a3218';x.fillRect(X-16,Y-190,10,190);x.fillStyle='#e8d0a0';for(let j=0;j<5;j++)x.fillRect(X-19,Y-176+j*14,38,7);x.fillStyle='#d8341a';x.beginPath();x.moveTo(X+14,Y-160);x.quadraticCurveTo(X+60,Y-150,X+90,Y-120);x.lineTo(X+70,Y-112);x.quadraticCurveTo(X+44,Y-138,X+14,Y-140);x.closePath();x.fill()}
   // cracks with heat in them
   for(let i=0;i<22;i++){let X=R()*W,Y=860+R()*210;x.strokeStyle='rgba(30,8,4,.75)';x.lineWidth=3;x.beginPath();x.moveTo(X,Y);const pts=[[X,Y]];for(let j=0;j<5;j++){X+=(R()-.5)*120;Y+=(R()-.3)*30;x.lineTo(X,Y);pts.push([X,Y])}x.stroke();x.strokeStyle='rgba(255,140,50,.45)';x.lineWidth=1.4;x.beginPath();pts.forEach((p,j)=>x[j?'lineTo':'moveTo'](p[0],p[1]-1));x.stroke()}
   // pebbles
   for(let i=0;i<70;i++){const X=R()*W,Y=840+Math.pow(R(),.7)*240,s=2+R()*7*(Y-820)/260;x.fillStyle='#2a0e08';x.beginPath();x.ellipse(X,Y,s*1.4,s*.7,0,0,TAU);x.fill();x.fillStyle='rgba(255,170,100,.4)';x.beginPath();x.ellipse(X-s*.3,Y-s*.3,s*.6,s*.25,0,0,TAU);x.fill()}
   x.fillStyle='rgba(20,6,10,.35)';x.fillRect(0,0,W,40);{const G=x.createLinearGradient(0,980,0,H);G.addColorStop(0,'rgba(10,2,4,0)');G.addColorStop(1,'rgba(10,2,4,.55)');x.fillStyle=G;x.fillRect(0,980,W,100)}},
  aura(y,X,Y,k,t){y.globalCompositeOperation='lighter';
   // flames licking up from the ground in a ring
   for(let i=0;i<20;i++){const a=i*TAU/20+t*.3,fx=X+cos(a)*310,fy=Y+sin(a)*44,h=(120+((i*53)%4)*45)*k*(.7+.3*sin(t*7+i*2.1));flame(y,fx,fy,-1.57+sin(t*2+i)*.14,h,30*k,t,i*1.9,FLM2)}
   // two small suns circling the waist, trailing light
   for(let s=0;s<2;s++){const a=t*2.4+s*PI,ox=X+cos(a)*330*k,oy=Y-430+sin(a)*70;for(let j=9;j>0;j--){const b=a-j*.07,qx=X+cos(b)*330*k,qy=Y-430+sin(b)*70,r=34*(1-j/11);y.globalAlpha=k*(1-j/10)*.6;y.drawImage(GL(),qx-r,qy-r,r*2,r*2)}y.globalAlpha=k;y.drawImage(GL(),ox-120,oy-120,240,240);const G=y.createRadialGradient(ox-6,oy-6,2,ox,oy,28);G.addColorStop(0,'#ffffff');G.addColorStop(.5,'#ffe08a');G.addColorStop(1,'#ff8a2a');y.fillStyle=G;y.beginPath();y.arc(ox,oy,28,0,TAU);y.fill()}
   // embers rising
   for(let i=0;i<54;i++){const q=(t*.45+i/54)%1,px=X+sin(i*5.7)*(200+i*5)+sin(t*2+i)*20,py=Y-q*760*k;y.globalAlpha=(1-q)*k;y.fillStyle=i%4?'#ffb050':'#fff0c0';y.fillRect(px,py,3,6)}
   y.globalAlpha=1},
  sigil(y,k,t,R0){y.globalCompositeOperation='lighter';const L=y.lineWidth,al=Math.min(1,k*1.4);y.strokeStyle='#ffb040';y.fillStyle='#ffb040';y.rotate(t*.12);
   for(const[f,w]of[[1,10],[.93,4],[.7,5]]){y.lineWidth=w;y.globalAlpha=al;y.beginPath();y.arc(0,0,R0*f,0,TAU);y.stroke()}
   // flame tongues around the rim
   y.globalAlpha=al*.85;for(let i=0;i<28;i++){const a=i*TAU/28,l=R0*(.1+.05*sin(t*6+i*1.7));y.beginPath();y.moveTo(cos(a-.06)*R0,sin(a-.06)*R0);y.quadraticCurveTo(cos(a+.02)*(R0+l*.7),sin(a+.02)*(R0+l*.7),cos(a+.07)*(R0+l),sin(a+.07)*(R0+l));y.lineTo(cos(a+.06)*R0,sin(a+.06)*R0);y.closePath();y.fill()}
   y.lineWidth=6;y.globalAlpha=al*.8;for(let i=0;i<36;i++){const a=i*TAU/36;y.beginPath();y.arc(0,0,R0*.82,a,a+.09);y.stroke()}
   // two suns side by side, each with its own rays, around a centre spiral
   y.rotate(-t*.3);for(const s of[-1,1]){const cx=s*R0*.32,r=R0*.2;y.globalAlpha=al;y.lineWidth=6;y.beginPath();y.arc(cx,0,r,0,TAU);y.stroke();y.globalAlpha=al*.35;y.beginPath();y.arc(cx,0,r*.7,0,TAU);y.fill();y.globalAlpha=al*.9;for(let i=0;i<14;i++){const a=i*TAU/14+s*t*.8;y.beginPath();y.moveTo(cx+cos(a-.08)*r*1.12,sin(a-.08)*r*1.12);y.lineTo(cx+cos(a)*r*(1.5+.08*sin(t*7+i)),sin(a)*r*(1.5+.08*sin(t*7+i)));y.lineTo(cx+cos(a+.08)*r*1.12,sin(a+.08)*r*1.12);y.closePath();y.fill()}}
   y.globalAlpha=al;y.lineWidth=5;y.beginPath();for(let i=0;i<=60;i++){const u=i/60,a=u*TAU*2.2,r=R0*.1*u;y[i?'lineTo':'moveTo'](cos(a)*r,sin(a)*r)}y.stroke();y.lineWidth=L;y.globalAlpha=1},
  pose:{gather:fit({nh:[150,330],fh:[10,330],lean:.04,py:50,nf:[-160,0],ff:[170,0],hd:{yaw:.22,eye:{open:.9,angry:.4},brow:{angry:.35}}}),
   piece:fit({nh:[150,330],fh:[10,330],lean:.04,py:30,nf:[-140,0],ff:[150,0]}),
   // the poster: a forward fighting guard, lead fist out at chin height clear of the face, rear fist chambered at the ribs, wide and low
   hero:fit({nh:[310,280],fh:[30,250],lean:.14,py:110,nf:[-280,0],ff:[260,0],hd:{yaw:.26,eye:{open:.92,angry:.3},brow:{angry:.3},mouth:{smile:.35}}}),
   windup:fit({nh:[-130,140],nb:-1,fh:[300,40],lean:-.12,py:90,nf:[-250,0],ff:[270,0]})},
  burst(y,k,t,A){y.globalCompositeOperation='lighter';for(let i=0;i<12;i++){const s=i%2?1:-1,x0=960+s*(240+(i>>1)*150),h=(700+((i*37)%4)*160)*k;flame(y,x0,1080,-1.57+s*.06,h,120,t,i*1.7)}},
  spark(x,c,A){A0=A;const q=A.q,u=c.u,L=q.wl0,a=-.32+u*.06,X=lerp(380,300,u),Y=650,k=A.ez(cl((c.t-.3)/.7,0,1));A.view(x,c.C,1,y=>{const nx=-sin(a),ny=cos(a),P=(u,v)=>[X+(cos(a)*u+nx*v)*L/100,Y+(sin(a)*u+ny*v)*L/100];y.save();y.globalCompositeOperation='lighter';
   // a warm glint on each knuckle
   for(let i=0;i<4;i++){const p=P(30,-8.5+i*5.6),r=L*.05*(1+.2*sin(c.T*7+i));y.globalAlpha=.95;y.drawImage(GL(),p[0]-r,p[1]-r,r*2,r*2);y.globalCompositeOperation='source-over';const q=L*.022,G=y.createRadialGradient(p[0],p[1],0,p[0],p[1],q);G.addColorStop(0,'#fff6d0');G.addColorStop(.65,'rgba(255,214,120,1)');G.addColorStop(1,'rgba(255,190,90,0)');y.fillStyle=G;y.beginPath();y.arc(p[0],p[1],q,0,TAU);y.fill();y.globalCompositeOperation='lighter'}
   if(k>0){const f=P(24,0);y.globalAlpha=k*.7;y.drawImage(GL(),f[0]-380*k,f[1]-380*k,760*k,760*k);
    // the knuckles catch fire and it streams back past the gauntlet, above and below it
    y.globalAlpha=k;for(const[v,l]of[[-15,1],[-12.5,.8],[-9,.6],[9,.6],[12.5,.8],[15,1],[-3,.5],[3,.5]]){const p=P(30,v);flame(y,p[0],p[1],PI+a-v*.012+sin(c.T*5+v)*.05,(380+130*sin(c.T*8+v))*k*l,70+40*l,c.T,v,FLM)}}
   y.restore();A.sparks(y,5,c.t-.4,P(30,0)[0],P(30,0)[1],24,700,'#ffd080',.6,-300)})},
  windup(x,c,A){A0=A;const s=.95,X=A.W/2+60*s,Y=A.H/2+1150*s,p=A.pose.windup,f=fistAt(p,X,Y,s),k=A.ez(c.u);A.view(x,c.C,1,y=>{y.save();y.globalCompositeOperation='lighter';
   // sunlight pulled in from everywhere to the cocked fist
   for(let i=0;i<26;i++){const b=i*2.4+.3,ph=((c.t*1.8+i*.137)%1),r=lerp(760,90,A.ei(ph));y.globalAlpha=k*Math.sin(ph*PI)*.9;y.strokeStyle=i%3?'#ffb050':'#fff0c0';y.lineWidth=3+(i%3)*2;y.beginPath();y.moveTo(f[0]+cos(b)*r,f[1]+sin(b)*r);y.lineTo(f[0]+cos(b)*(r+110),f[1]+sin(b)*(r+110));y.stroke()}
   y.restore()})},
  // Hundred Suns: dash in, a blur of punches that cracks the monolith, the two suns fold into one fist, and one giant sun-fist blows the stone apart
  sig:{hits:[.42,1.62,2.14],draw(x,c,A){A0=A;const t=c.t,sp=A.q.sp,H0=.42,H1=1.62,H2=2.14,R0=1.3,HX=640,HY=1000,S=.58;
   A.bg(x,c,t<H1?.3:.12);
   if(t>H1){x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.35*cl(1-(t-H1)/1.1,0,1);x.fillStyle='#ff7a2a';x.fillRect(0,0,A.W,A.H);x.restore()}
   A.view(x,c.C,1,y=>{
    // the camera pushes in through the rush and the charge, and snaps back on the big punch
    const z=t<H0?lerp(1,1.1,A.ez(t/H0)):t<R0?1.1+(t-H0)*.04:t<H1?lerp(1.14,1.24,A.ez((t-R0)/(H1-R0))):lerp(1.24,1,A.eo((t-H1)/.14));y.translate(900,640);y.scale(z,z);y.translate(-900,-640);
    drawRock(y,t,H0,H1,A);
    let X=HX,P;
    if(t<H0){const u=A.eo(t/H0);X=lerp(220,HX,u);P=fit(Object.assign({},BASE,{nh:[-170,190],fh:[320,30],lean:.32,py:120,nf:[-320,0],ff:[200,-30],hd:{yaw:.3,eye:{open:.7,angry:.8},brow:{angry:.9},mouth:{open:.2}}}));
     // afterimages of the dash
     for(let j=2;j>=1;j--){A.hero(c,y,X-j*130*(1-u*.6),HY,S,P,{wind:1,act:{sil:1,silC:'#ff8a2a',a:.22/j}})}
     y.save();y.globalCompositeOperation='lighter';for(let i=0;i<18;i++){const yy=400+((i*97)%560),l=300+((i*53)%300);y.globalAlpha=.5*(1-u*.5);y.fillStyle=i%3?'#ffb060':'#fff0c0';y.fillRect(X-l-120,yy,l,3+(i%3))}y.restore()}
    else if(t<R0){P=rushPose(t-H0);X=HX+sin(t*60)*5}
    else if(t<H1){const u=A.ez((t-R0)/(H1-R0));P=fit(Object.assign({},BASE,{nh:L2([200,120],[-280,170],u),fh:L2([200,60],[380,10],u),lean:lerp(.14,-.16,u),py:lerp(100,130,u),nf:[-270,0],ff:[260,0]}))}
    else{const u=A.eo((t-H1)/.08);P=fit(Object.assign({},BASE,{nh:L2([-280,170],[570,150],u),fh:L2([380,10],[-40,140],u),lean:lerp(-.16,.3,u),py:130,nf:[-340,0],ff:[230,0],hd:{yaw:.3,eye:{open:.85,angry:.9},brow:{angry:1},mouth:{open:t<H2+.3?.75:.35,smile:-.3}}}));X=HX+60*u}
    const fist=fistAt(P,X,HY,S);
    // the giant sun-fist rides out along the punching arm: worked out first so it can be drawn behind the hero
    let GX=0,GY=0,GS=0,GD=0;
    if(t>H1){const d=t-H1,u=A.eo(d/.16),dm=Math.min(d,H2-H1),Dm=Math.max(0,(1530-.7*250-fist[0])/Math.max(.3,cos(fist[2])));GS=lerp(80,250,u)*(1+.05*sin(t*40))+dm*50;GD=lerp(0,Dm,u)+dm*40;GX=fist[0]+cos(fist[2])*GD;GY=fist[1]+sin(fist[2])*GD;
     // the ground: a gouge of fire torn from the hero's feet to the stump, the shockwave, dust rolling off the stump
     trench(y,X+170,lerp(X+170,1500,A.eo(d/.2)),992,d,t,cl(1-(d-.5)/1.1,0,1));
     y.save();y.globalCompositeOperation='lighter';y.strokeStyle='rgba(255,220,150,'+cl(1-d/.7,0,1)+')';y.lineWidth=14*(1-cl(d/.7,0,1))+2;y.beginPath();y.ellipse(1340,990,lerp(80,1400,A.eo(d/.7)),lerp(20,220,A.eo(d/.7)),0,0,TAU);y.stroke();y.restore();
     dust(y,1380,1000,d-.04,301);dust(y,1380,1000,t-H2,302,1.3);
     if(t<H2+.3)sunFist(y,GX,GY,GS*(t>H2?1+(t-H2)*3:1),t,fist[2],t<H2?1:cl(1-(t-H2)/.25,0,1),GD)}
    FX.on=1;FX.fist=t<H0?.5:t<R0?.7:t<H1?lerp(.7,2.4,A.ez((t-R0)/(H1-R0))):t<H2?1.2:.6;FX.far=t<R0?.4:.25;
    A.hero(c,y,X,HY,S,P,{wind:1,act:{rim:[CREAM,1,-8,-3]}});FX.on=0;
    y.save();y.globalCompositeOperation='lighter';
    // the rush: ghost fists fly from the fist that is out toward the stone, hit sparks on its face
    if(t>H0&&t<R0+.05){const fr=Math.floor(t*30),R=A.sr(fr*13+5),sh=fistAt(P,X,HY,S,null,P._far);for(let i=0;i<14;i++){const ty=430+R()*320,tx=1210+ty*.03+R()*30,v=.45+R()*.55,gx=lerp(sh[0],tx,v),gy=lerp(sh[1],ty,v),a=Math.atan2(ty-sh[1],tx-sh[0]);ghostFist(y,gx,gy,32+R()*22,a,.35+R()*.5)}
     for(let i=0;i<3;i++){const ty=420+R()*360,tx=1220+ty*.03;A.painter(y,'hit',tx,ty,90+R()*70,(t*30%1),R()*3,3,5);A.glow(y,tx,ty,120,'#ffd080',.6)}A.sparks(y,fr,(t*30%1)/30*4,1215,600,10,900,'#ffd080',.3,600)}
    // two suns spiral in and fold into the cocked fist
    if(t>R0&&t<H1){const u=A.ez((t-R0)/(H1-R0-.04));for(const s of[-1,1]){const a=t*9+s*1.57,r=lerp(330,0,u),ox=fist[0]+cos(a)*r,oy=fist[1]+sin(a)*r*.5;A.glow(y,ox,oy,110,'#ffc060',1-u*.6);A.glow(y,ox,oy,30,'#ffffff',1)}
     for(let i=0;i<20;i++){const b=i*2.4,ph=((t*2.4+i*.137)%1),r=lerp(620,80,A.ei(ph));y.globalAlpha=Math.sin(ph*PI)*.8;y.strokeStyle=i%3?'#ffb050':'#fff0c0';y.lineWidth=3+(i%3)*2;y.beginPath();y.moveTo(fist[0]+cos(b)*r,fist[1]+sin(b)*r);y.lineTo(fist[0]+cos(b)*(r+90),fist[1]+sin(b)*(r+90));y.stroke()}y.globalAlpha=1}
    // sparks off the stone where the giant fist breaks it
    if(t>H1){const d=t-H1;A.sparks(y,91,d,1360,620,60,1500,'#ffd080',.9,900);A.sparks(y,92,d,1360,620,40,1000,'#fff0c0',.7,1200)}
    // the second blow: the sun-fist bursts at its knuckles
    if(t>H2){const d=t-H2,e=A.eo(d/.5),BX=GX+GS*.4,BY=GY;A.glow(y,BX,BY,lerp(300,1400,e),'#ffd080',cl(1-d/.7,0,1));A.glow(y,BX,BY,lerp(80,380,e),'#ffffff',cl(1-d/.4,0,1));
     // flare rays thrown out to the right, up and down: none reaches back toward the hero
     for(let i=0;i<22;i++){const b=-1.75+i*3.5/21,l=lerp(200,700,e)*(.7+.3*((i*37)%5)/4);y.globalAlpha=.7*cl(1-d/.6,0,1);y.strokeStyle=i%2?'#ffe0a0':'#ffffff';y.lineWidth=10*(1-e)+2;y.beginPath();y.moveTo(BX+cos(b)*l*.3,BY+sin(b)*l*.3);y.lineTo(BX+cos(b)*l,BY+sin(b)*l);y.stroke()}y.globalAlpha=1;
     // the class ring, laid flat on the ground as the last shockwave
     y.save();y.translate(1400,995);y.scale(1,.24);A.painter(y,'ring',0,0,lerp(260,560,e),d/.8,0,3,6);y.restore();
     A.sparks(y,93,d,BX,BY,36,1300,'#ffe0a0',.8,1100)}
    y.restore();
    // embers falling after it is over
    if(t>H1)A.motes(y,44,c.T,70,600,0,1320,1000,'#ffb050',5,160,.8*cl((t-H1)/.4,0,1))});
   if(A.lit(t,H0,.06)||A.lit(t,H1,.07)||A.lit(t,H2,.05))A.impact(x);if(t>H1&&t<H1+.12)A.rect(x,'#fff4d0',.7*(1-(t-H1)/.12));if(t>H2&&t<H2+.2)A.rect(x,'#fff0c0',.6*(1-(t-H2)/.2))}}
 })})()}catch(e){console.error('EVC brawler',e)}
