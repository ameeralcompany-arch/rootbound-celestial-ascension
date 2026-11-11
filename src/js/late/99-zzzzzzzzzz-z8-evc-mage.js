// ===== Mage evolution cinematic: Starwright. A night terrace above a sea of clouds, an orrery and a ringed planet; gold equations written in the air; a star-cloth high collar, a swept-back pointed hat,
// a rune ring orbiting the waist and a cloak of stars; Starfall: the hero writes the old equations across the sky, they collapse into a newborn star, and the star falls. =====
try{(()=>{const F=()=>FILM1,K=MOVIE1.kit,sin=Math.sin,cos=Math.cos,TAU=6.2832,PI=Math.PI;
 const GOLD='#ffd98a',VIO='#c89aff',WHITE='#fff6e6';
 const hh=i=>{const v=sin(i*12.9898+7.3)*43758.5453;return v-Math.floor(v)};
 const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,ease=k=>{k=cl(k,0,1);return 1-Math.pow(1-k,3)};
 const GL=['π','∑','∫','∞','θ','λ','Δ','φ','ω','∂','√','Ω','≈','∇','ψ','μ'];
 const EQ=['F = G Mm / r²','T² ∝ a³','v = √(GM / r)','∇²Φ = 4πGρ','λ = h / p','ω = 2π / T','∫ exp(−x²) dx = √π','∑ 1/n² = π²/6','S = k log W','E = mc²'];
 const FONT=s=>"italic 500 "+Math.max(4,Math.round(s))+"px 'Cormorant Garamond',Georgia,'Cambria Math',serif";
 const WL=1320,ORB=.64; // the staff's length on the film body, and where its head sits from the hand (fraction of the length)
 // an equation being written: clipped to how far the pen has gone, with the pen's light at the cursor
 function eq(g,s,x,y,sz,u,col,a,pen){if(u<=0||a<=0)return;g.save();g.font=FONT(sz);g.textAlign='left';g.textBaseline='middle';const w=g.measureText(s).width;g.globalAlpha=a;g.fillStyle=col;if(u<1){g.beginPath();g.rect(x-6,y-sz,w*u+6,sz*2);g.clip()}g.fillText(s,x,y);g.restore();if(pen&&u<1)K.glow(g,x+w*u,y,sz*1.3,GOLD,a)}
 // fixed star positions for the cloth
 const ST=[...Array(64)].map((_,i)=>[hh(i*3+1),hh(i*3+2),.4+.6*hh(i*3+3)]);
 function starCloth(g,x0,y0,w,h,n,a,t,r0){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const s=ST[i%64],tw=.55+.45*sin(t*2.3+i*1.7);g.globalAlpha=a*tw*s[2];g.fillStyle=i%5?'#e8dcff':GOLD;g.beginPath();g.arc(x0+s[0]*w,y0+s[1]*h,(r0||5)*s[2],0,TAU);g.fill()}g.restore()}
 // where the staff's head is on screen, for a pose drawn at X,Y scale s
 function handAt(X,Y,s,P){const l=P.lean||0,hy=-830+(P.py||0),nx=-128*cos(l)+372*sin(l)+(P.px||0),ny=hy-128*sin(l)-372*cos(l);return[X+s*(nx+P.nh[0]),Y+s*(ny+P.nh[1])]}
 function orbAt(X,Y,s,P){const l=P.lean||0,hy=-830+(P.py||0),nx=-128*cos(l)+372*sin(l)+(P.px||0),ny=hy-128*sin(l)-372*cos(l),d=WL*ORB;return[X+s*(nx+P.nh[0]+cos(P.wa)*d),Y+s*(ny+P.nh[1]+sin(P.wa)*d)]}
 // ---------- the outfit
 // p1: the star-cloth high collar, two stiff wings that stand at the sides of the neck (never above the head), and a gold clasp
 function flap(g,J,s,e,t){const P=(x,y)=>J.rot(-6+s*x,y),w=s>0?.86:1;const bi=P(30,-404),bo=P(150*w,-360),to=P((196+10*e)*w,-404-196*e),ti=P(128*w,-404-140*e),cA=P(196*w,-410),cB=P(104*w,-470);
  const p=new Path2D();p.moveTo(bi[0],bi[1]);p.lineTo(bo[0],bo[1]);p.quadraticCurveTo(cA[0],cA[1],to[0],to[1]);p.lineTo(ti[0],ti[1]);p.quadraticCurveTo(cB[0],cB[1],bi[0],bi[1]);p.closePath();
  const G=g.createLinearGradient(bi[0],bi[1],to[0],to[1]);G.addColorStop(0,s>0?'#3a1c84':'#2a1466');G.addColorStop(1,'#120734');g.fillStyle=G;g.fill(p);
  g.save();g.clip(p);starCloth(g,Math.min(bi[0],to[0])-20,to[1]-20,Math.abs(to[0]-bi[0])+60,Math.abs(bo[1]-to[1])+60,12,e,t,5);g.restore();
  g.strokeStyle='#08031a';g.lineWidth=3;g.stroke(p);g.strokeStyle=GOLD;g.lineWidth=6;g.beginPath();g.moveTo(bo[0],bo[1]);g.quadraticCurveTo(cA[0],cA[1],to[0],to[1]);g.lineTo(ti[0],ti[1]);g.quadraticCurveTo(cB[0],cB[1],bi[0],bi[1]);g.stroke();
  g.fillStyle=GOLD;g.beginPath();g.arc(to[0],to[1],10*e,0,TAU);g.fill();g.strokeStyle='#5a4010';g.lineWidth=2;g.stroke()}
 function collarBack(g,J,e,t){const a=J.rot(-196,-372),b=J.rot(-206,-372-170*e),c=J.rot(0,-372-196*e),d=J.rot(178,-372-160*e),f=J.rot(150,-368);const p=new Path2D();p.moveTo(a[0],a[1]);p.lineTo(b[0],b[1]);p.quadraticCurveTo(c[0],c[1]-30,d[0],d[1]);p.lineTo(f[0],f[1]);p.closePath();g.fillStyle='#0e0628';g.fill(p);g.save();g.clip(p);starCloth(g,a[0],c[1]-40,f[0]-a[0],240,10,.7*e,t,4);g.restore()}
 function clasp(g,J,e){const a=J.rot(6,-394),b=J.rot(6,-176),l=J.rot(-16,-300),r=J.rot(28,-300),cL=J.rot(-40,-404),cR=J.rot(52,-404);g.strokeStyle=GOLD;g.lineWidth=4;g.beginPath();g.moveTo(cL[0],cL[1]);g.lineTo(a[0],a[1]);g.lineTo(cR[0],cR[1]);g.stroke();
  g.fillStyle=GOLD;g.strokeStyle='#5a4010';g.lineWidth=2.4;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(r[0],r[1]);g.lineTo(lerp(a[0],b[0],e),lerp(a[1],b[1],e));g.lineTo(l[0],l[1]);g.closePath();g.fill();g.stroke();g.fillStyle='#ffffff';g.beginPath();g.arc(lerp(a[0],b[0],.38),lerp(a[1],b[1],.38),7,0,TAU);g.fill()}
 // p3: the cloak of stars, behind, with a hem of star points
 function cloak(g,J,k){const w=J.wnd,t=J.t,e=ease(k),A=J.rot(-150,-380),B=J.rot(118,-384),len=lerp(180,1130,e),sw=sin(t*1.7)*26+w*480,bx=A[0]-80-sw*.9,by=A[1]+len,x1=B[0]+70-sw*.12,y1=B[1]+len*.97;
  const hem=[[bx-60,by]];for(let i=1;i<=5;i++){const u=i/5,X=lerp(bx-60,x1,u),Xm=lerp(bx-60,x1,u-.1),Y=lerp(by,y1,u);hem.push([Xm,Y+52*e],[X,Y-(i<5?10:0)])}
  const p=new Path2D();p.moveTo(A[0],A[1]);p.bezierCurveTo(A[0]-70-sw*.25,A[1]+len*.32,bx-40,by-len*.36,bx-60,by);for(const h of hem)p.lineTo(h[0],h[1]);p.bezierCurveTo(x1+20,B[1]+len*.6,B[0]+40-sw*.08,B[1]+len*.28,B[0],B[1]);p.closePath();
  const G=g.createLinearGradient(A[0],A[1],bx,by);G.addColorStop(0,'#2c1468');G.addColorStop(.55,'#1a0c46');G.addColorStop(1,'#0c0526');g.fillStyle=G;g.fill(p);
  g.save();g.clip(p);const x0=Math.min(A[0],bx-60)-40,w0=Math.max(B[0],x1)-x0+80;starCloth(g,x0,A[1],w0,len+60,48,.95*e,t,7);
  g.strokeStyle=GOLD;g.globalAlpha=.5*e;g.lineWidth=2.4;g.beginPath();for(const[i,j]of[[3,7],[7,12],[12,18],[18,22],[30,34],[34,41],[41,45],[45,50]]){const a=ST[i],b=ST[j];g.moveTo(x0+a[0]*w0,A[1]+a[1]*len);g.lineTo(x0+b[0]*w0,A[1]+b[1]*len)}g.stroke();
  g.globalAlpha=1;g.strokeStyle='rgba(6,2,20,.5)';g.lineWidth=14;for(let i=0;i<4;i++){g.beginPath();g.moveTo(A[0]+30+i*60,A[1]+40);g.quadraticCurveTo(bx+i*80,by-len*.5,bx-20+i*(x1-bx)/3.4,by+10);g.stroke()}g.restore();
  g.strokeStyle='#08031a';g.lineWidth=3;g.stroke(p);g.save();g.strokeStyle=GOLD;g.lineWidth=6;g.globalAlpha*=e;g.beginPath();hem.forEach((h,i)=>g[i?'lineTo':'moveTo'](h[0],h[1]));g.stroke();g.fillStyle=GOLD;for(let i=1;i<hem.length;i+=2){g.beginPath();g.arc(hem[i][0],hem[i][1],7,0,TAU);g.fill()}g.restore()}
 // p3: the rune ring that orbits the waist; its far half is drawn behind the body, its near half in front
 function ring(g,J,k,front){const e=ease(k);if(e<=.01)return;const c=J.rot(0,-112),rx=262*e,ry=64*e,t=J.t;
  g.save();g.translate(c[0],c[1]);g.rotate(J.lean*.5);g.globalCompositeOperation='lighter';const a0=front?0:PI,a1=front?PI:TAU,al=(front?1:.55)*Math.min(1,k*2);
  g.globalAlpha=al*.35;g.strokeStyle=VIO;g.lineWidth=22;g.beginPath();g.ellipse(0,0,rx,ry,0,a0,a1);g.stroke();
  g.globalAlpha=al;g.strokeStyle=GOLD;g.lineWidth=5;g.beginPath();g.ellipse(0,0,rx,ry,0,a0,a1);g.stroke();g.lineWidth=2;g.strokeStyle=VIO;g.beginPath();g.ellipse(0,0,rx*1.13,ry*1.13,0,a0,a1);g.stroke();
  g.strokeStyle=GOLD;g.lineWidth=2.4;g.beginPath();for(let i=0;i<48;i++){const a=i*TAU/48+t*.5,s=sin(a);if(front?s<0:s>=0)continue;const l=i%4?.05:.12;g.moveTo(cos(a)*rx,s*ry);g.lineTo(cos(a)*rx*(1+l),s*ry*(1+l))}g.stroke();
  g.font=FONT(54);g.textAlign='center';g.textBaseline='middle';for(let i=0;i<8;i++){const a=i*TAU/8-t*.9,s=sin(a);if(front?s<0:s>=0)continue;g.globalAlpha=al*e*(.55+.45*Math.abs(s));g.fillStyle=i%2?GOLD:'#f0e2ff';g.fillText(GL[(i*2)%16],cos(a)*rx*1.04,s*ry*1.04-30)}
  for(let i=0;i<3;i++){const a=i*2.1+t*(1.3+i*.4),s=sin(a);if(front?s<0:s>=0)continue;const px=cos(a)*rx*.99,py=s*ry*.99,r=(8+i*4)*e;K.glow(g,px,py,r*5,VIO,.6*al);g.globalAlpha=al;g.fillStyle=i==1?GOLD:'#ffffff';g.beginPath();g.arc(px,py,r,0,TAU);g.fill()}
  g.restore()}
 // p2: the tall pointed hat, its tip bent back and swinging; a ringed-planet charm at the tip
 function hat(g,J,k){const e=ease(k),sy=sin(J.yaw==null?.26:J.yaw),cx=sy*22,t=J.t,w=J.wnd;g.save();g.globalAlpha=Math.min(1,k*1.6);g.translate(0,-(1-e)*240);
  const bc=[cx+4,-128],brx=268,bry=52,brA=-.05+sin(t*1.3)*.02;
  const brim=(half)=>{g.save();g.translate(bc[0],bc[1]);g.rotate(brA);const G=g.createLinearGradient(0,-bry,0,bry);G.addColorStop(0,'#3a1c84');G.addColorStop(1,'#12072e');g.fillStyle=G;g.beginPath();g.ellipse(0,0,brx,bry,0,half?PI:0,half?TAU:PI);if(!half){g.ellipse(0,0,brx*.46,bry*.5,0,PI,0,true)}g.closePath();g.fill();g.strokeStyle='#08031a';g.lineWidth=3;g.stroke();if(!half){g.strokeStyle=GOLD;g.lineWidth=6;g.beginPath();g.ellipse(0,0,brx-4,bry-4,0,.05,PI-.05);g.stroke()}g.restore()};
  brim(1);
  // the cone: a spine from the crown up, bending back to the tip
  const sw=sin(t*1.8)*18+w*70,B=[cx-2,-140],C1=[cx-40,-320],T=[cx-260-sw,-330+sin(t*2.2)*12],n=18,L=[],R=[];
  for(let i=0;i<=n;i++){const u=i/n,v=1-u,x=v*v*B[0]+2*u*v*C1[0]+u*u*T[0],y=v*v*B[1]+2*u*v*C1[1]+u*u*T[1],dx=2*v*(C1[0]-B[0])+2*u*(T[0]-C1[0]),dy=2*v*(C1[1]-B[1])+2*u*(T[1]-C1[1]),D=Math.hypot(dx,dy)||1,nx=-dy/D,ny=dx/D,wd=(136*Math.pow(v,.9)+3)*(.4+.6*e);L.push([x+nx*wd,y+ny*wd]);R.push([x-nx*wd,y-ny*wd])}
  const p=new Path2D();p.moveTo(R[0][0],R[0][1]);for(let i=1;i<=n;i++)p.lineTo(R[i][0],R[i][1]);for(let i=n;i>=0;i--)p.lineTo(L[i][0],L[i][1]);p.closePath();
  const G=g.createLinearGradient(cx-140,0,cx+140,0);G.addColorStop(0,'#10062e');G.addColorStop(.55,'#2e1670');G.addColorStop(.9,'#4a2aa0');G.addColorStop(1,'#6a48c8');g.fillStyle=G;g.fill(p);
  g.save();g.clip(p);starCloth(g,cx-260,-480,420,360,18,e,t,6);g.strokeStyle='rgba(8,2,24,.45)';g.lineWidth=10;g.beginPath();g.moveTo(cx-40,-150);g.quadraticCurveTo(cx-60,-330,T[0]+20,T[1]+16);g.stroke();
  // the gold band with a small orbit emblem
  g.strokeStyle=GOLD;g.lineWidth=26;g.beginPath();g.moveTo(R[0][0]-10,R[0][1]-14);g.quadraticCurveTo(cx,-150,L[0][0]+10,L[0][1]-20);g.stroke();g.strokeStyle='#5a4010';g.lineWidth=2;g.stroke();g.restore();
  g.strokeStyle='#08031a';g.lineWidth=3;g.stroke(p);
  g.save();g.translate(cx+40,-168);g.rotate(-.3);g.strokeStyle='#3a1a78';g.lineWidth=3;g.beginPath();g.ellipse(0,0,24,8,0,0,TAU);g.stroke();g.fillStyle='#3a1a78';g.beginPath();g.arc(0,0,6,0,TAU);g.fill();g.restore();
  brim(0);
  // the charm at the tip: a tiny ringed planet
  const tp=[T[0],T[1]+30+sin(t*2.6)*4];g.strokeStyle=GOLD;g.lineWidth=2;g.beginPath();g.moveTo(T[0],T[1]);g.lineTo(tp[0],tp[1]);g.stroke();K.glow(g,tp[0],tp[1],18,GOLD,.25*e);g.fillStyle=GOLD;g.beginPath();g.arc(tp[0],tp[1],13,0,TAU);g.fill();g.save();g.translate(tp[0],tp[1]);g.rotate(-.35);g.strokeStyle='#fff2c8';g.lineWidth=3;g.beginPath();g.ellipse(0,0,28,8,0,0,TAU);g.stroke();g.restore();
  g.restore()}
 const dress={
  back(g,J){const k3=J.k.p3||0,k1=J.k.p1||0;if(k3>0){cloak(g,J,k3);ring(g,J,k3,0)}if(k1>0)collarBack(g,J,ease(k1),J.t)},
  torso(g,J){const k=J.k.p1||0;if(k<=0)return;g.save();g.globalAlpha=Math.min(1,k*2);clasp(g,J,ease(k));g.restore()},
  head(g,J){const k=J.k.p2||0;if(k>0)hat(g,J,k)},
  front(g,J){const k3=J.k.p3||0,k1=J.k.p1||0;if(k3>0)ring(g,J,k3,1);if(k1>0){const e=ease(k1);g.save();g.globalAlpha=Math.min(1,k1*2);flap(g,J,1,e,J.t);flap(g,J,-1,e,J.t);g.restore()}}};
 // ---------- the floor sigil: an astrolabe of equations
 function sigil(y,k,t,R0){y.globalCompositeOperation='lighter';const a=Math.min(1,k*1.5);y.rotate(t*.1);
  y.strokeStyle=GOLD;y.lineWidth=10;y.globalAlpha=a;y.beginPath();y.arc(0,0,R0,0,TAU*Math.min(1,k*1.4+.05));y.stroke();y.lineWidth=3;y.beginPath();y.arc(0,0,R0*.9,0,TAU);y.stroke();
  y.lineWidth=4;y.beginPath();for(let i=0;i<90;i++){const b=i*TAU/90,l=i%5?.035:.08;y.moveTo(cos(b)*R0*.9,sin(b)*R0*.9);y.lineTo(cos(b)*R0*(.9+l),sin(b)*R0*(.9+l))}y.stroke();
  y.fillStyle=GOLD;y.font=FONT(R0*.08);y.textAlign='center';y.textBaseline='middle';for(let i=0;i<20;i++){y.save();y.rotate(i*TAU/20);y.translate(0,-R0*.8);y.globalAlpha=a*(.55+.45*sin(t*3+i));y.fillText(GL[i%16],0,0);y.restore()}
  y.globalAlpha=a;y.strokeStyle=VIO;y.lineWidth=3;y.beginPath();y.arc(0,0,R0*.7,0,TAU);y.stroke();
  for(let j=0;j<3;j++){y.save();y.rotate(j*TAU/3+t*.2);y.strokeStyle=j==1?GOLD:VIO;y.lineWidth=3;y.globalAlpha=a*.8;y.beginPath();y.ellipse(0,0,R0*.62,R0*.24,0,0,TAU);y.stroke();const b=t*(1.2+j*.3)+j;y.fillStyle='#fff';y.globalAlpha=a;y.beginPath();y.arc(cos(b)*R0*.62,sin(b)*R0*.24,R0*.025,0,TAU);y.fill();y.restore()}
  y.rotate(-t*.35);y.strokeStyle=GOLD;y.lineWidth=4;y.globalAlpha=a;y.beginPath();for(let i=0;i<=60;i++){const u=i/60*Math.min(1,k*1.3),b=u*TAU*2.2,r=R0*.03*Math.exp(u*2.6);y[i?'lineTo':'moveTo'](cos(b)*r,sin(b)*r)}y.stroke();
  y.fillStyle='#fff';y.beginPath();y.arc(0,0,R0*.03,0,TAU);y.fill()}
 // ---------- the aura: two rune rings at the feet and shins, glyphs rising, stardust
 function aura(y,X,Y,k,t){y.globalCompositeOperation='lighter';K.glow(y,X,Y-60,460,VIO,.3*k);
  for(const[h,r,sp,c,j]of[[0,330,.35,GOLD,0],[190,240,-.55,VIO,1]]){y.save();y.translate(X,Y-h*k);y.scale(1,.26);y.rotate(t*sp);y.globalAlpha=.85*k;y.strokeStyle=c;y.lineWidth=5;y.beginPath();y.arc(0,0,r*k,0,TAU);y.stroke();y.lineWidth=3;y.beginPath();for(let i=0;i<36;i++){const b=i*TAU/36,l=i%3?.06:.13;y.moveTo(cos(b)*r*k,sin(b)*r*k);y.lineTo(cos(b)*r*k*(1+l),sin(b)*r*k*(1+l))}y.stroke();
   y.fillStyle=j?GOLD:'#ffffff';for(let i=0;i<6;i++){const b=i*TAU/6;y.beginPath();y.arc(cos(b)*r*k*1.1,sin(b)*r*k*1.1,9,0,TAU);y.fill()}y.restore()}
  y.textAlign='center';y.textBaseline='middle';y.font=FONT(40);for(let i=0;i<18;i++){const q=(t*.32+i/18)%1,px=X+(hh(i)-.5)*620+sin(t+i)*14,py=Y-20-q*600*k;y.globalAlpha=Math.sin(q*PI)*k*.85;y.fillStyle=i%3?GOLD:'#efe2ff';y.fillText(GL[i%16],px,py)}
  for(let i=0;i<40;i++){const q=(t*.22+hh(i+40))%1,px=X+(hh(i+9)-.5)*760,py=Y-q*680*k;y.globalAlpha=(1-q)*k;y.fillStyle=i%4?'#efe2ff':GOLD;y.fillRect(px,py,3,3)}}
 EVC1.add('mage',{
  pal:['#c89aff','#2a1460','#ffd98a'],eye:'#c08aff',
  C:{coat:'#3c1f86',dark:'#1e0e4a',trim:GOLD,inner:'#f2eaff',boot:'#2a1660',glove:'#efe6ff',leg:'#24124e',scarf:null,coatLen:.95},
  wl:WL,wlClose:1500,dress,pieces:[[-40,-1250,1.15],[-80,-1560,1.15],[-20,-1000,.8]],
  glyph(g,cx,cy,rx,ry,k,t){g.globalCompositeOperation='lighter';g.save();g.translate(cx,cy);g.rotate(-.45);g.strokeStyle=GOLD;g.lineWidth=rx*.07;g.globalAlpha=k*.95;g.beginPath();g.ellipse(0,0,rx*.8,ry*.3,0,0,TAU);g.stroke();const b=t*2.4;g.fillStyle='#fff';g.beginPath();g.arc(cos(b)*rx*.8,sin(b)*ry*.3,rx*.1,0,TAU);g.fill();g.restore();
   g.strokeStyle=GOLD;g.lineWidth=rx*.035;g.globalAlpha=k*.7;g.beginPath();for(let i=0;i<24;i++){const a=i*TAU/24+t*.3,r0=rx*.5,r1=rx*(i%3?.58:.66);g.moveTo(cx+cos(a)*r0,cy+sin(a)*r0*ry/rx);g.lineTo(cx+cos(a)*r1,cy+sin(a)*r1*ry/rx)}g.stroke();
   for(const[i,dx,dy]of[[0,-.34,-.46],[1,.42,-.18],[2,.12,.52]]){g.globalAlpha=k*(.6+.4*sin(t*5+i*2));g.fillStyle=i==1?GOLD:'#fff';g.beginPath();g.arc(cx+dx*rx,cy+dy*ry,rx*.055,0,TAU);g.fill()}},
  sky:[[0,'#05021a'],[.3,'#140a3e'],[.52,'#2c1862'],[.64,'#5a3486'],[.7,'#b87a88'],[.74,'#ffc88a'],[.79,'#3a2458'],[1,'#120a26']],
  plate(x,R,P){const{W,H,glow}=P;
   // the milky way, stars, the dark places where heads will stand
   for(let i=0;i<26;i++){const u=i/25,cx=lerp(-100,2020,u)+(R()-.5)*140,cy=lerp(600,-80,u)+(R()-.5)*140;glow(x,cx,cy,170+R()*170,i%3?'#7a5ac8':'#c89aff',.07+R()*.07)}
   for(let i=0;i<1200;i++){let sx,sy;if(R()<.55){const u=R();sx=lerp(-100,2020,u)+(R()-.5)*380;sy=lerp(600,-80,u)+(R()-.5)*300}else{sx=R()*W;sy=R()*720}const r=R()<.93?.7+R()*1.1:1.8+R()*1.4;x.globalAlpha=.3+R()*.7;x.fillStyle=R()<.15?'#ffe0a0':R()<.4?'#d8c8ff':'#ffffff';x.fillRect(sx,sy,r,r)}x.globalAlpha=1;
   for(let i=0;i<36;i++){const sx=R()*W,sy=R()*620;glow(x,sx,sy,10+R()*18,R()<.3?'#ffe0a0':'#e8dcff',.7);x.fillStyle='#fff';x.beginPath();x.arc(sx,sy,1.9,0,TAU);x.fill()}
   for(const[cx,cy,r]of[[960,300,340],[1380,340,260],[560,300,240]]){const G=x.createRadialGradient(cx,cy,0,cx,cy,r);G.addColorStop(0,'rgba(5,2,18,.5)');G.addColorStop(1,'rgba(5,2,18,0)');x.fillStyle=G;x.fillRect(cx-r,cy-r,r*2,r*2)}
   // constellations, an orbit path, and old equations faint in the sky
   x.strokeStyle='rgba(255,217,138,.3)';x.lineWidth=1.6;for(const C of[[[70,110],[160,80],[250,140],[340,100],[300,210],[190,236]],[[1580,80],[1670,140],[1770,110],[1850,190],[1740,240]],[[640,70],[710,120],[790,64],[850,110]]]){x.beginPath();C.forEach((p,i)=>x[i?'lineTo':'moveTo'](p[0],p[1]));x.stroke();for(const p of C){glow(x,p[0],p[1],16,'#ffe0a0',.8);x.fillStyle='#fff';x.beginPath();x.arc(p[0],p[1],2.6,0,TAU);x.fill()}}
   x.save();x.translate(300,300);x.rotate(-.2);x.setLineDash([10,14]);x.strokeStyle='rgba(255,217,138,.22)';x.lineWidth=2;x.beginPath();x.ellipse(0,0,440,120,0,0,TAU);x.stroke();x.setLineDash([]);x.restore();
   x.font=FONT(34);x.fillStyle='rgba(255,217,138,.17)';x.fillText('T² ∝ a³',60,440);x.fillText('ω = 2π / T',480,90);x.fillText('∇²Φ = 4πGρ',1520,420);x.fillText('F = G Mm / r²',1500,300);x.fillText('λ = h / p',1250,90);
   // the ringed planet
   {const px=130,py=150,pr=80,ring=half=>{x.save();x.translate(px,py);x.rotate(-.32);x.scale(1,.24);x.lineWidth=16;for(const[r,c,a]of[[pr*1.5,'#e8c890',.55],[pr*1.76,'#b89ad8',.4],[pr*2.02,'#e8c890',.22]]){x.strokeStyle=c;x.globalAlpha=a;x.beginPath();x.arc(0,0,r,half?PI:0,half?TAU:PI);x.stroke()}x.restore();x.globalAlpha=1};
    ring(1);const G=x.createRadialGradient(px+46,py+40,10,px,py,pr);G.addColorStop(0,'#b89a88');G.addColorStop(.4,'#8a5e8e');G.addColorStop(.85,'#3a2066');G.addColorStop(1,'#1a0c3a');x.fillStyle=G;x.beginPath();x.arc(px,py,pr,0,TAU);x.fill();
    x.save();x.beginPath();x.arc(px,py,pr,0,TAU);x.clip();x.translate(px,py);x.rotate(-.32);for(let i=0;i<6;i++){x.globalAlpha=.14;x.fillStyle=i%2?'#3a1a6a':'#fff0d0';x.fillRect(-pr,-pr+i*38+R()*10,pr*2,10+R()*12)}x.globalAlpha=1;const S=x.createLinearGradient(-pr,-pr,pr*.4,pr*.4);S.addColorStop(0,'rgba(8,3,24,.85)');S.addColorStop(1,'rgba(8,3,24,0)');x.fillStyle=S;x.fillRect(-pr,-pr,pr*2,pr*2);x.restore();ring(0)}
   // the horizon: gold afterglow, two ranges of peaks, a sea of clouds
   glow(x,980,770,1000,'#ffb078',.34);glow(x,1480,770,520,'#ffd08a',.28);
   for(const[y0,amp,c,st]of[[690,80,'#3c2668',.018],[735,50,'#24143e',.031]]){x.fillStyle=c;x.beginPath();x.moveTo(0,H);x.lineTo(0,y0);for(let i=0;i<=W;i+=24){const n=Math.abs(sin(i*st+y0))*amp+Math.abs(sin(i*st*2.7+1))*amp*.4;x.lineTo(i,y0+amp*.6-n)}x.lineTo(W,H);x.closePath();x.fill()}
   for(let i=0;i<70;i++){const cx=R()*W,cy=740+R()*70,rw=70+R()*160,rh=18+R()*20;const G=x.createLinearGradient(0,cy-rh,0,cy+rh);G.addColorStop(0,'rgba(255,200,170,.5)');G.addColorStop(.5,'rgba(150,100,170,.45)');G.addColorStop(1,'rgba(40,24,80,.0)');x.fillStyle=G;x.beginPath();x.ellipse(cx,cy,rw,rh,0,0,TAU);x.fill()}
   // the telescope, on the left
   {x.strokeStyle='#120a24';x.lineWidth=8;x.beginPath();x.moveTo(250,690);x.lineTo(190,830);x.moveTo(250,690);x.lineTo(310,830);x.moveTo(250,690);x.lineTo(262,836);x.stroke();
    x.save();x.translate(250,680);x.rotate(-.62);const G=x.createLinearGradient(0,-30,0,30);G.addColorStop(0,'#ffe0a0');G.addColorStop(.35,'#c8904a');G.addColorStop(1,'#4a2a18');x.fillStyle=G;x.beginPath();x.moveTo(-150,-20);x.lineTo(260,-30);x.lineTo(260,30);x.lineTo(-150,20);x.closePath();x.fill();x.strokeStyle='#2a1408';x.lineWidth=2;x.stroke();x.fillStyle='#2a1408';for(const s of[-80,40,180])x.fillRect(s,-32,10,64);x.fillStyle='#5a3a20';x.fillRect(250,-38,22,76);x.restore()}
   // the orrery, on the right
   {const ox=1740,oy=560;x.fillStyle='#160c2c';x.fillRect(ox-22,oy+40,44,240);x.fillRect(ox-70,oy+270,140,26);
    for(const[rx,ry,a]of[[170,52,.3],[160,150,-.5],[150,96,1.2]]){x.save();x.translate(ox,oy);x.rotate(a);x.strokeStyle='#3a2418';x.lineWidth=12;x.beginPath();x.ellipse(0,0,rx,ry,0,0,TAU);x.stroke();x.strokeStyle='#c8984e';x.lineWidth=6;x.beginPath();x.ellipse(0,0,rx,ry,0,0,TAU);x.stroke();x.fillStyle='#e8c890';x.beginPath();x.arc(rx,0,12,0,TAU);x.fill();x.restore()}
    glow(x,ox,oy,90,'#ffd08a',.5);x.fillStyle='#ffe6b0';x.beginPath();x.arc(ox,oy,24,0,TAU);x.fill()}
   // the balustrade and its lamps
   x.fillStyle='#120a26';x.fillRect(0,770,W,16);x.fillStyle='#4a3080';x.fillRect(0,768,W,3);for(let i=8;i<W;i+=34){x.fillStyle='#180e32';x.beginPath();x.ellipse(i,808,9,22,0,0,TAU);x.fill()}x.fillStyle='#120a26';x.fillRect(0,826,W,10);
   for(const lx of[110,650,1270,1830]){x.fillStyle='#0e0820';x.fillRect(lx-9,690,18,140);glow(x,lx,680,90,'#ffd08a',.75);x.fillStyle='#fff0c8';x.beginPath();x.arc(lx,680,12,0,TAU);x.fill()}
   // the terrace floor: polished stone, gold inlay, the horizon reflected
   const G2=x.createLinearGradient(0,834,0,H);G2.addColorStop(0,'#3a2660');G2.addColorStop(.25,'#1e1240');G2.addColorStop(1,'#0a0520');x.fillStyle=G2;x.fillRect(0,834,W,H-834);
   x.save();x.translate(980,846);x.scale(1,.1);glow(x,0,0,1000,'#ffb078',.4);x.restore();
   x.strokeStyle='rgba(255,217,138,.09)';x.lineWidth=2;for(let i=-16;i<=16;i++){x.beginPath();x.moveTo(960+i*70,836);x.lineTo(960+i*300,H);x.stroke()}x.strokeStyle='rgba(8,4,24,.5)';for(let i=1;i<9;i++){const y=836+Math.pow(i/8,1.8)*244;x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke()}
   x.strokeStyle='rgba(255,217,138,.16)';x.lineWidth=3;for(const r of[780,580,400]){x.beginPath();x.ellipse(960,1000,r,r*.26,0,0,TAU);x.stroke()}
   const V=x.createLinearGradient(0,940,0,H);V.addColorStop(0,'rgba(4,2,14,0)');V.addColorStop(1,'rgba(4,2,14,.6)');x.fillStyle=V;x.fillRect(0,940,W,H-940)},
  aura,sigil,
  pose:{gather:{nh:[380,440],fh:[220,360],wa:-1.3,lean:.02,py:80},hero:{nh:[470,360],fh:[-60,120],wa:-1.32,lean:-.04,py:200,nf:[-240,0],ff:[260,0]},piece:{nh:[600,440],fh:[150,420],wa:-1.15},windup:{nh:[260,180],fh:[320,20],wa:-.14,lean:.06,py:30,nf:[-200,0],ff:[220,0]}},
  spark(x,c,A){const t=c.t,u=c.u,L=A.q.wl0,a=-.32+u*.06,X=lerp(380,300,u),Y=650,run=A.ez(cl((t-.15)/.9,0,1));x.save();x.textAlign='center';x.textBaseline='middle';
   for(let i=0;i<9;i++){const f=.08+i*.075,k=cl((run-f/.7)*5,0,1);if(k<=0)continue;const d=L*f,px=X+cos(a)*d,py=Y+sin(a)*d,lift=70+30*(i%3)+k*30;x.globalAlpha=k*(1-cl((t-1.05)/.25,0,1));x.font=FONT(46+(i%3)*10);x.fillStyle=i%2?GOLD:'#efe2ff';x.fillText(GL[(i*5)%16],px+sin(a)*-lift*-1,py-lift)}
   x.restore();const o=[X+cos(a)*L*ORB,Y+sin(a)*L*ORB];x.save();x.translate(o[0],o[1]);x.globalCompositeOperation='lighter';for(let j=0;j<2;j++){x.save();x.rotate(-.3+j*.9+t*(j?-1:1)*.8);x.scale(1,.3);x.strokeStyle=j?VIO:GOLD;x.lineWidth=3;x.globalAlpha=run*.8;x.beginPath();x.arc(0,0,220+j*50,0,TAU*run);x.stroke();x.restore()}x.restore()},
  piece(x,c,A,i){const t=c.t,k=cl(t/.6,0,1),pos=[[90,150],[90,930],[1240,150]][i],s=[EQ[0],EQ[1],EQ[5]][i];eq(x,s,pos[0],pos[1],58,k,GOLD,.85,1);eq(x,EQ[(i*3+3)%10],pos[0]+40,pos[1]+70,38,cl((t-.2)/.6,0,1),'#efe2ff',.55,0);
   x.save();x.globalCompositeOperation='lighter';x.strokeStyle=GOLD;x.lineWidth=2;x.globalAlpha=.55;const D=[[0,0],[90,-40],[170,10],[240,-30],[300,40]],ox=pos[0]+(i==2?120:60),oy=pos[1]+(i==1?-130:160);x.beginPath();D.forEach((p,j)=>{if(j/4<=k)x[j?'lineTo':'moveTo'](ox+p[0],oy+p[1])});x.stroke();for(let j=0;j<5;j++){if(j/4>k)continue;K.glow(x,ox+D[j][0],oy+D[j][1],22,GOLD,.8)}x.restore()},
  windup(x,c,A){const t=c.t,k=A.ez(cl(t/.75,0,1)),s=.95,X=960+60*s,Y=540+1150*s,P=A.q.pose.windup,l=P.lean||0,hy=-830+(P.py||0),fx=X+s*(100*cos(l)+372*sin(l)+P.fh[0]),fy=Y+s*(hy+100*sin(l)-372*cos(l)+P.fh[1])+20;
   x.save();x.globalCompositeOperation='lighter';K.glow(x,fx,fy,160+200*k,VIO,.8);K.glow(x,fx,fy,40+60*k,WHITE,1);for(let j=0;j<3;j++){x.save();x.translate(fx,fy);x.rotate(j*1.05+t*(1+j*.5));x.scale(1,.32);x.strokeStyle=j==1?VIO:GOLD;x.lineWidth=4;x.globalAlpha=.9;x.beginPath();x.arc(0,0,(120+j*40)*(.4+.6*k),0,TAU);x.stroke();x.restore()}
   x.textAlign='center';x.textBaseline='middle';for(let j=0;j<10;j++){const a=j*TAU/10+t*2.4,r=(220-120*k)+j%3*20,px=fx+cos(a)*r,py=fy+sin(a)*r*.5;x.globalAlpha=.9*(1-k*.4);x.font=FONT(40);x.fillStyle=j%2?GOLD:'#efe2ff';x.fillText(GL[(j*3)%16],px,py)}x.restore();
   for(let j=0;j<4;j++)eq(x,EQ[(j+4)%10],70,150+j*90,50-j*4,cl((t-j*.1)/.35,0,1),j%2?'#efe2ff':GOLD,.8-j*.12,1)},
  burst(y,k,t,A){y.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const r=(260+i*300)*A.eo(Math.min(1,k*1.2+.1));y.save();y.translate(960,1010);y.scale(1,.25);y.strokeStyle=i%2?GOLD:'#ffffff';y.lineWidth=12-i*2;y.globalAlpha=.85-i*.15;y.beginPath();y.arc(0,0,r,0,TAU);y.stroke();y.restore()}
   for(let i=0;i<10;i++){const u=(t*1.4+hh(i))%1,side=i%2,sx=(side?1300+hh(i+3)*700:-100+hh(i+3)*700)-u*600,sy=-80+hh(i+7)*300+u*800,dx=.6,dy=-.8,L=280;if(Math.abs(sx-960)<300&&sy<560)continue;const G=y.createLinearGradient(sx,sy,sx+dx*L,sy+dy*L);G.addColorStop(0,'rgba(255,255,255,.95)');G.addColorStop(1,'rgba(255,217,138,0)');y.strokeStyle=G;y.lineWidth=4;y.globalAlpha=Math.sin(u*PI);y.beginPath();y.moveTo(sx,sy);y.lineTo(sx+dx*L,sy+dy*L);y.stroke()}},
  // Starfall: the equations are written across the sky, they collapse into a newborn star, the star falls, and the ground answers in a ring of light
  sig:{hits:[.42,1.22,1.85],draw(x,c,A){const t=c.t,T=c.T,h0=.42,h1=1.22,h2=1.85,X0=560,S=.5,P=[1380,330],G=[1400,990];
   // where the newborn star is while it falls
   const ff=cl((t-h0-.1)/(h1-h0-.1),0,1),ffe=Math.pow(ff,2.1),SP=[lerp(P[0],G[0],ffe)+sin(ffe*PI)*80,lerp(P[1],G[1],ffe)];
   let pz=0;for(const h of[h0,h1,h2])if(t>h&&t<h+.35)pz=Math.max(pz,1-(t-h)/.35);x.save();if(pz>0){const z=1+.05*pz*pz;x.translate(960,600);x.scale(z,z);x.translate(-960,-600)}
   A.bg(x,c,t<h1?.42:.25);
   // the hero's pose track
   const W1={nh:[470,-120],fh:[180,160],wa:-.5,lean:-.06,nf:[-120,0],ff:[150,0],hd:{yaw:.36,eye:{open:.88,angry:.35,look:[.7,-.7]},brow:{angry:.3,up:.2},mouth:{open:.08}}},
    W2={nh:[480,-40],fh:[200,140],wa:-.22,lean:-.1,nf:[-120,0],ff:[150,0],hd:{yaw:.38,eye:{open:.9,angry:.4,look:[.8,-.8]},brow:{angry:.35,up:.2},mouth:{open:.12}}},
    CALL={nh:[420,60],fh:[-120,300],wa:.36,lean:.2,py:70,nf:[-240,0],ff:[250,0],hd:{yaw:.34,eye:{open:.8,angry:.85,look:[.8,.5]},brow:{angry:.9},mouth:{open:.45,smile:-.3}}},
    BRACE={nh:[380,140],fh:[-220,220],wa:.2,lean:-.06,py:100,nf:[-270,0],ff:[230,0],hd:{yaw:.3,eye:{open:.55,angry:.6,look:[.9,.2]},brow:{angry:.6},mouth:{open:.25}}},
    RAISE={nh:[380,-200],fh:[-120,200],wa:-.85,lean:-.04,py:60,nf:[-240,0],ff:[230,0],hd:{yaw:.34,eye:{open:.75,angry:.8,look:[.8,.3]},brow:{angry:.8},mouth:{open:.3,smile:-.2}}},
    THRUST={nh:[440,120],fh:[-160,260],wa:.12,lean:.16,py:90,nf:[-260,0],ff:[260,0],hd:{yaw:.34,eye:{open:.8,angry:.9,look:[.9,.4]},brow:{angry:.9},mouth:{open:.5,smile:-.3}}},
    END={nh:[360,200],fh:[120,380],wa:-.4,lean:.02,py:20,nf:[-160,0],ff:[170,0],hd:{yaw:.3,eye:{open:.92,angry:.2,look:[.6,0]},brow:{angry:.1},mouth:{open:0,smile:.3}}};
   const CALL2=Object.assign({},CALL,{lean:.26,py:96,nh:[440,90]});
   const pose=A.F.track([[0,W1],[.36,W2,'io'],[.54,CALL,'o'],[1.18,CALL2,'li'],[1.32,BRACE,'o'],[1.66,RAISE,'io'],[1.85,THRUST,'i'],[2.0,THRUST],[2.5,END,'io']],t);
   // the staff head points at the equations' focus as they collapse, then follows the falling star down
   {const aw=t<.18?0:t<.38?A.ez((t-.18)/.2):t<h1+.04?1:1-cl((t-h1-.04)/.16,0,1);if(aw>0){const hd=handAt(X0,1000,S,pose),tg=t<h0+.12?P:[SP[0],SP[1]+40],aim=Math.atan2(tg[1]-hd[1],tg[0]-hd[0]);pose.wa=lerp(pose.wa,aim,aw)}}
   if(t<h0)pose.wa+=sin(t*24)*.09*(1-cl((t-.3)/.12,0,1));
   const orb=orbAt(X0,1000,S,pose);
   A.view(x,c.C,1,y=>{
    // 1. the equations, written across the sky by the staff
    const EP=[[1060,300,52],[1230,470,58],[1500,150,48],[1060,560,44],[1560,520,54],[1690,300,46],[1020,80,40]];
    if(t<h0+.3){const v=cl((t-h0)/.24,0,1),vi=v*v;y.save();y.globalCompositeOperation='lighter';
     if(t<h0+.05){const ca=cl(t/.36,0,1);y.strokeStyle=GOLD;y.globalAlpha=.7*(1-v);y.lineWidth=3;y.beginPath();y.arc(P[0],P[1],230,-PI/2,-PI/2+TAU*ca);y.stroke();y.lineWidth=2;y.beginPath();for(let i=0;i<60*ca;i++){const b=-PI/2+i*TAU/60,l=i%5?12:26;y.moveTo(P[0]+cos(b)*230,P[1]+sin(b)*230);y.lineTo(P[0]+cos(b)*(230+l),P[1]+sin(b)*(230+l))}y.stroke();y.strokeStyle=VIO;y.beginPath();y.arc(P[0],P[1],140,PI/2,PI/2-TAU*ca,true);y.stroke()}
     EP.forEach((e,i)=>{const u=cl((t-i*.04)/.2,0,1),ex=lerp(e[0],P[0],vi),ey=lerp(e[1],P[1],vi);if(u<=0)return;y.strokeStyle=GOLD;y.lineWidth=1.6;y.globalAlpha=.4*u*(1-v);y.beginPath();y.moveTo(ex+60,ey);y.lineTo(P[0],P[1]);y.stroke();eq(y,EQ[i],ex,ey,e[2]*(1-v*.7),u,i%2?'#efe2ff':GOLD,1-v,1)});
     if(t<h0){const i=Math.min(EP.length-1,(t/.04|0)%EP.length),e=EP[i];y.strokeStyle=GOLD;y.globalAlpha=.6;y.lineWidth=3;y.beginPath();y.moveTo(orb[0],orb[1]);y.quadraticCurveTo((orb[0]+e[0])/2,Math.min(orb[1],e[1])-120,e[0],e[1]);y.stroke();K.glow(y,orb[0],orb[1],110,GOLD,.9)}
     y.restore()}
    // 2. the star is born, and falls
    let sp=null;if(t>=h0&&t<h1){const f=ff,fe=ffe;sp=SP;
     A.sigil(y,G[0],G[1],80+420*A.ez(cl((t-h0)/.6,0,1)),cl((t-h0)/.5,0,1),T,.9);
     if(t<h0+.4){const b=(t-h0)/.4,eb=A.eo(b);A.rays(y,P[0],P[1],18,900,GOLD,.5*(1-b),T,6);y.save();y.globalCompositeOperation='lighter';for(let j=0;j<3;j++){const r=40+eb*(220+j*80);y.strokeStyle=j%2?VIO:GOLD;y.lineWidth=10*(1-b);y.globalAlpha=1-b;y.beginPath();y.arc(P[0],P[1],r,0,TAU);y.stroke()}y.restore();if(b<.625)K.glow(y,P[0],P[1],300,WHITE,1-b/.625)}
     // the tail: back along the path, glyphs shed from it
     if(f>0){const dx=G[0]-P[0],dy=G[1]-P[1],D=Math.hypot(dx,dy),ux=dx/D,uy=dy/D,Lt=Math.min(1100,120+fe*D*1.2),tx=sp[0]-ux*Lt,ty=sp[1]-uy*Lt,nx=-uy,ny=ux;y.save();y.globalCompositeOperation='lighter';
      for(const[w,c,a]of[[150,'200,154,255',.45],[70,'255,217,138',.8],[26,'255,255,255',1]]){const Gr=y.createLinearGradient(sp[0],sp[1],tx,ty);Gr.addColorStop(0,'rgba('+c+','+a+')');Gr.addColorStop(1,'rgba('+c+',0)');y.fillStyle=Gr;y.beginPath();y.moveTo(sp[0]+nx*w*.5,sp[1]+ny*w*.5);y.quadraticCurveTo(sp[0]-ux*Lt*.4+nx*w*.6,sp[1]-uy*Lt*.4+ny*w*.6,tx,ty);y.quadraticCurveTo(sp[0]-ux*Lt*.4-nx*w*.6,sp[1]-uy*Lt*.4-ny*w*.6,sp[0]-nx*w*.5,sp[1]-ny*w*.5);y.closePath();y.fill()}
      y.textAlign='center';y.textBaseline='middle';for(let j=0;j<12;j++){const d=(j+1)/13*Lt,px=sp[0]-ux*d+nx*sin(j*2.3+t*9)*70,py=sp[1]-uy*d+ny*sin(j*2.3+t*9)*70;y.globalAlpha=(1-d/Lt)*.95;y.font=FONT(34+j%3*10);y.fillStyle=j%2?GOLD:'#ffffff';y.fillText(GL[(j*7)%16],px,py)}y.restore()}
     K.glow(y,sp[0],sp[1],260,VIO,.85);K.glow(y,sp[0],sp[1],120,GOLD,1);K.glow(y,sp[0],sp[1],60,WHITE,1);y.fillStyle='#fff';y.beginPath();y.arc(sp[0],sp[1],24+8*sin(t*40),0,TAU);y.fill();
     y.save();y.globalCompositeOperation='lighter';y.strokeStyle='#fff';y.lineCap='round';for(let j=0;j<14;j++){const b=j*TAU/14+t*3,l=(60+50*hh(j))*(1+.3*sin(t*30+j));y.globalAlpha=.7;y.lineWidth=3;y.beginPath();y.moveTo(sp[0]+cos(b)*30,sp[1]+sin(b)*30);y.lineTo(sp[0]+cos(b)*l,sp[1]+sin(b)*l);y.stroke()}y.restore();
     if(f>.5)A.speedLines(y,G[0],G[1]-200,31,T,'rgba(255,236,200,.8)',.4*(f-.5)*2,40,500)}
    // 3. the impact: crater, shockwave, column, debris
    if(t>=h1){const u=t-h1;
     y.save();y.translate(G[0],G[1]);y.scale(1,.26);y.fillStyle='#07031a';y.globalAlpha=.85;y.beginPath();y.arc(0,0,280*A.eo(cl(u/.2,0,1)),0,TAU);y.fill();y.globalCompositeOperation='lighter';y.strokeStyle=GOLD;y.lineWidth=14;y.globalAlpha=.6+.4*sin(t*10);y.stroke();
      for(let j=0;j<2;j++){const v=cl((u-j*.1)/.9,0,1);if(v<=0||v>=1)continue;y.strokeStyle=j?VIO:WHITE;y.lineWidth=50*(1-v);y.globalAlpha=1-v;y.beginPath();y.arc(0,0,120+1500*A.eo(v),0,TAU);y.stroke()}y.restore();
     A.sigil(y,G[0],G[1],520,1,T,.8*(1-cl((u-1.2)/.4,0,1)));
     // cracks running out from the crater
     y.save();y.strokeStyle='#05020f';y.lineWidth=6;const cr=A.eo(cl(u/.25,0,1));for(let j=0;j<10;j++){const b=j*TAU/10+.3,R=A.sr(300+j);y.beginPath();let px=G[0],py=G[1];y.moveTo(px,py);for(let s=0;s<6;s++){px+=cos(b+(R()-.5)*.6)*70*cr;py+=sin(b+(R()-.5)*.6)*20*cr;y.lineTo(px,py)}y.stroke()}y.restore();
     if(u<.8){const v=u/.8,ve=A.eo(cl(u/.12,0,1));y.save();y.globalCompositeOperation='lighter';
      // the dome of light where the star went in
      y.save();y.translate(G[0],G[1]);y.scale(1,.62);const dr=(180+300*A.eo(cl(u/.35,0,1))),DG=y.createRadialGradient(0,0,0,0,0,dr);DG.addColorStop(0,'rgba(255,255,255,'+(1-v)+')');DG.addColorStop(.35,'rgba(255,230,180,'+(.8*(1-v))+')');DG.addColorStop(.7,'rgba(200,154,255,'+(.45*(1-v))+')');DG.addColorStop(1,'rgba(200,154,255,0)');y.fillStyle=DG;y.beginPath();y.arc(0,0,dr,PI,TAU);y.fill();y.restore();
      // the column, tapering as it rises
      const w=(300*(1-v)+30)*ve,Gc=y.createLinearGradient(0,G[1],0,G[1]-1300);Gc.addColorStop(0,'rgba(255,255,255,'+(1-v)+')');Gc.addColorStop(.4,'rgba(255,217,138,'+(.8*(1-v))+')');Gc.addColorStop(1,'rgba(200,154,255,0)');y.fillStyle=Gc;y.beginPath();y.moveTo(G[0]-w/2,G[1]);y.lineTo(G[0]-w*.12,G[1]-1300);y.lineTo(G[0]+w*.12,G[1]-1300);y.lineTo(G[0]+w/2,G[1]);y.closePath();y.fill();
      // rays thrown out along the ground and up into the air
      y.strokeStyle='#fff';y.lineCap='round';const Rr=A.sr(55);for(let j=0;j<26;j++){const b=-PI*(.02+.96*Rr()),L=(300+900*Rr())*A.eo(cl(u/.25,0,1)),r0=60+L*.25;y.globalAlpha=(1-v)*(.4+.6*Rr());y.lineWidth=3+Rr()*6;y.beginPath();y.moveTo(G[0]+cos(b)*r0,G[1]+sin(b)*r0*.7);y.lineTo(G[0]+cos(b)*L,G[1]+sin(b)*L*.7);y.stroke()}
      y.restore()}
     K.glow(y,G[0],G[1]-40,300+400*A.eo(cl(u/.5,0,1)),VIO,.9*(1-cl(u/1.4,0,1)));K.glow(y,G[0],G[1]-30,200+180*A.eo(cl(u/.3,0,1)),WHITE,1-cl(u/.8,0,1));
     A.sparks(y,91,u,G[0],G[1]-30,30,1500,GOLD,.9,1300);A.sparks(y,92,u,G[0],G[1]-30,20,1100,VIO,1.1,900)}
    // 4. the ring of light: the floor's equations answer
    if(t>=h2){const v=(t-h2)/.9;if(v<1){y.save();y.globalCompositeOperation='lighter';for(let j=0;j<16;j++){const b=j*TAU/16+.2,px=G[0]+cos(b)*560,py=G[1]+sin(b)*140,d=hh(j),hgt=(500+700*d)*A.eo(cl(v*3-d*.4,0,1))*(1-v*.3),w=(10+26*hh(j+5))*(1-v*.6),c=j%2?'255,217,138':'200,154,255';if(hgt<=0)continue;const Gc=y.createLinearGradient(0,py,0,py-hgt);Gc.addColorStop(0,'rgba(255,255,255,'+(1-v)+')');Gc.addColorStop(.25,'rgba('+c+','+(.85*(1-v))+')');Gc.addColorStop(1,'rgba('+c+',0)');y.fillStyle=Gc;y.beginPath();y.moveTo(px-w,py);y.lineTo(px-w*.25,py-hgt);y.lineTo(px+w*.25,py-hgt);y.lineTo(px+w,py);y.closePath();y.fill();K.glow(y,px,py,90*(1-v)+20,j%2?GOLD:VIO,1-v)}
      y.textAlign='center';y.textBaseline='middle';for(let j=0;j<16;j++){const b=j*TAU/16+.2,px=G[0]+cos(b)*560,py=G[1]+sin(b)*140-v*700-hh(j)*120;y.globalAlpha=(1-v);y.font=FONT(44);y.fillStyle=j%2?GOLD:'#fff';y.fillText(GL[j],px,py)}
      y.translate(G[0],G[1]);y.scale(1,.25);y.strokeStyle=WHITE;y.lineWidth=30*(1-v);y.globalAlpha=1-v;y.beginPath();y.arc(0,0,560+400*A.eo(v),0,TAU);y.stroke();y.restore()}}
    if(t>=h1)K.motes(y,77,T,60,G[0]-700,G[1]-900,1400,900,GOLD,5,-120,.8*cl((t-h1)/.4,0,1));
    // the hero
    const fl=t>=h1?1-cl((t-h1)/.5,0,1):0,f2=t>=h2?1-cl((t-h2)/.4,0,1):0;
    A.hero(c,y,X0,1000,S,pose,{wind:t<h1?.7:1.2-cl((t-h1)/1.4,0,1)*.5,act:{rim:[t>=h0?GOLD:VIO,1,-10,-3],rim2:[VIO,.5,8,-2],grade:fl+f2>0?['#fff2dc',.22*Math.max(fl,f2)]:null}});
    // debris thrown out of the crater, some past the camera
    if(t>=h1){const u=t-h1,R=A.sr(808);y.save();for(let j=0;j<28;j++){const vx=(R()-.5)*1700,vy=-(500+R()*1100),r=8+R()*26,sp2=(R()-.5)*14,px=G[0]+vx*u,py=G[1]-30+vy*u+1500*u*u;if(py>1100)continue;y.save();y.translate(px,py);y.rotate(sp2*u);const q1=.6+R()*.6,q2=.5+R()*.7,q3=.6+R()*.5;y.fillStyle='#1a0e34';y.strokeStyle=j%3?GOLD:VIO;y.lineWidth=2.5;y.beginPath();y.moveTo(-r*q1,-r*.3);y.lineTo(-r*.1,-r*q2);y.lineTo(r*q3,-r*.5);y.lineTo(r*.5,r*q1*.7);y.lineTo(-r*.6*q2,r*.5);y.closePath();y.fill();y.stroke();if(j%2==0){y.fillStyle=j%3?'rgba(255,217,138,.55)':'rgba(200,154,255,.55)';y.beginPath();y.moveTo(-r*q1,-r*.3);y.lineTo(-r*.1,-r*q2);y.lineTo(r*q3,-r*.5);y.lineTo(0,-r*.1);y.closePath();y.fill()}y.restore()}y.restore()}
   });
   if(A.lit(t,h0,.06)||A.lit(t,h1,.07)||A.lit(t,h2,.06)){A.rect(x,'#000',.3);A.impact(x);x.save();x.globalCompositeOperation='saturation';A.rect(x,'#808080',1);x.globalCompositeOperation='multiply';A.rect(x,'#d8c0ff',1);x.restore()}
   if(t>h1&&t<h1+.3)A.rect(x,'#fff6e6',.6*(1-(t-h1)/.3));if(t>h2&&t<h2+.2)A.rect(x,'#ffe8b0',.35*(1-(t-h2)/.2));
   x.restore()}}
 })})()}catch(e){console.error('EVC mage',e)}
