// ===== Cosmetic art: Sunken Empire (an ancient empire under the sea: tarnished bronze, verdigris, sea blue, coral). All four are found only by breaking.
// Body space: feet at 0, facing right (+x is the front), shoulders c.sh (about -37), hips c.hip (about -21), torso about 19 wide; the head layer is in
// head space (head centre c.hy, about -50; face spans x -10..10, y hy-10..hy+12). Drawn in the game's cel style with the COS1.H helpers. =====
try{(()=>{const C=COS1,H=C.H,TAU=6.2832,PI=Math.PI,sin=Math.sin,cos=Math.cos,cl=(v,a,b)=>v<a?a:v>b?b:v,fr=x=>x-Math.floor(x),shade=H.shade;
 const BZ='#c08b42',BZD='#76502a',BZL='#f0cc86',VG='#4fae95',VGD='#2f7f6d',VGL='#a3e3cc',SB='#2f6e9b',SBD='#1d4a70',CO='#ff7f6c',COD='#cf4f45',COL='#ffc0ab';
 // the head layer's own transform, for parts drawn behind the hair from the back layer
 const headSpace=(g,c)=>{const b=c.hy+50;g.translate(0,-43+b);g.scale(1.24,1.24);g.translate(0,43-b)};
 // a soft blob (one subpath) for patina specks
 const blob=(g,x,y,rx,ry,r)=>{g.moveTo(x+rx*cos(r),y+rx*sin(r));g.ellipse(x,y,rx,ry,r,0,TAU)};
 // a ribbon through points [x,y,halfWidth, then its two edges], cel-filled; the end is a swallowtail (fork) or a point (a kelp blade)
 const pts=n=>{const P=[];for(let i=0;i<=n;i++)P.push([0,0,0,0,0,0,0]);return P};
 const ribbon=(g,P,col,lw,fork)=>{const n=P.length-1;for(let i=0;i<=n;i++){const a=P[i?i-1:0],b=P[i<n?i+1:n],q=P[i];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;q[3]=q[0]-dy*q[2];q[4]=q[1]+dx*q[2];q[5]=q[0]+dy*q[2];q[6]=q[1]-dx*q[2]}
  const e=P[n],f=P[n-1],el=Math.hypot(e[0]-f[0],e[1]-f[1])||1,ex=(e[0]-f[0])/el,ey=(e[1]-f[1])/el,tk=fork?-1.2:1.6;
  H.celf(g,()=>{g.beginPath();g.moveTo(P[0][3],P[0][4]);for(let i=1;i<n;i++)g.quadraticCurveTo(P[i][3],P[i][4],(P[i][3]+P[i+1][3])/2,(P[i][4]+P[i+1][4])/2);g.lineTo(e[3],e[4]);g.lineTo(e[0]+ex*tk,e[1]+ey*tk);g.lineTo(e[5],e[6]);
   for(let i=n-1;i>0;i--)g.quadraticCurveTo(P[i][5],P[i][6],(P[i][5]+P[i-1][5])/2,(P[i][6]+P[i-1][6])/2);g.lineTo(P[0][5],P[0][6]);g.closePath()},col,lw)};

 // ---- Sunken Laurel: a bronze laurel wreath around the crown, its two branches meeting at the brow over a pair of coral berries, a few leaves gone to
 // verdigris. The far half sits behind the hair (its leaf tips show above it); sea-blue ribbon ends tied at the back drift with your movement.
 const LB='#d8a250',WR={x:.3,y:-13.4,rx:12,ry:4.4},LV={near:[[],[]],far:[[],[]]};
 const twig=(set,a,b,n,green)=>{const d=b>a?1:-1;for(let i=0;i<=n;i++){const th=a+(b-a)*i/n,u=i/n,x=WR.x+WR.rx*cos(th),y=WR.y+WR.ry*sin(th),ta=Math.atan2(WR.ry*cos(th)*d,-WR.rx*sin(th)*d);
   if(i==n){set[0].push([x,y,ta,3.6,2,i]);break}for(const s of[-1,1])set[green.includes(i*s)?1:0].push([x,y,ta+s*.58,5.3-1.3*u,2.15,i*2+s])}};
 twig(LV.near,PI+.15,1.5,6,[2,-5]);twig(LV.near,-.15,1.28,5,[-3]);twig(LV.far,3.85,PI+.15,2,[]);twig(LV.far,3.85,TAU-.15,6,[2,-4]);
 const leaves=(g,L,hy,t)=>()=>{g.beginPath();for(const[x,y0,a0,l,w,i]of L){const y=hy+y0,a=a0+sin(t*2.1+i*1.7)*.045,ca=cos(a),sa=sin(a),mx=x+ca*l*.5,my=y+sa*l*.5;g.moveTo(x,y);g.quadraticCurveTo(mx-sa*w,my+ca*w,x+ca*l,y+sa*l);g.quadraticCurveTo(mx+sa*w,my-ca*w,x,y)}};
 const GL=[[-6.6,-11.6],[6.9,-11.8],[-1.4,-9.5]],KT=PI+.3,KX=WR.x+WR.rx*cos(KT),KY=WR.y+WR.ry*sin(KT),LT=[pts(4),pts(4)];
 C.art('cos_laurel',{hh:1,
  back(g,c){headSpace(g,c);const hy=c.hy;/* the far half of the wreath, behind the hair */
   g.strokeStyle=BZD;g.lineWidth=1;g.beginPath();g.ellipse(WR.x,hy+WR.y,WR.rx,WR.ry,0,PI,TAU);g.stroke();
   /* mostly hidden by the hair, so flat-filled */g.lineWidth=.45;g.strokeStyle=H.OL;for(const k of[0,1]){leaves(g,LV.far[k],hy,c.t)();g.fillStyle=k?VGD:shade(LB,-.12);g.fill();g.stroke()}},
  head(g,c){const hy=c.hy,y=hy+WR.y,t=c.t,drag=cl(c.vx*.02,-5,5),air=c.air?1:0,run=c.run?1:0,kx=KX+.6,ky=hy+KY+.6;
   // ribbon ends tied at the back, drifting behind (they stream back when you run and lift in the air)
   for(const s of[1,0]){const P=LT[s],n=P.length-1,L=s?8:11.5,dx=-2.6-s*1.4-drag*1.1-run*1.6,dy=L-run*2.4-air*2.6;
    for(let i=0;i<=n;i++){const u=i/n,q=P[i],wv=sin(t*2.4-u*3+s*1.7)*u*1.1;q[0]=kx+dx*u+wv-u*u*run*1.6;q[1]=ky+dy*u+wv*.3+air*u*u*1.4;q[2]=1.05-u*.15}
    ribbon(g,P,s?SBD:SB,.65,1)}
   // the near half: stem, leaves, the knot, and the berries at the brow
   g.strokeStyle=BZD;g.lineWidth=1;g.beginPath();g.ellipse(WR.x,y,WR.rx,WR.ry,0,1.5,PI+.3);g.moveTo(WR.x+WR.rx*cos(-.15),y+WR.ry*sin(-.15));g.ellipse(WR.x,y,WR.rx,WR.ry,0,-.15,1.28);g.stroke();
   H.celf(g,leaves(g,LV.near[0],hy,t),LB,.45);H.celf(g,leaves(g,LV.near[1],hy,t),VG,.45);
   // glints of polished bronze that come and go
   const gl=.45+.4*sin(t*1.7);g.fillStyle='rgba(255,244,205,'+gl.toFixed(2)+')';g.beginPath();for(const[x,yy]of GL){g.moveTo(x+.42,hy+yy);g.arc(x,hy+yy,.42,0,TAU)}g.fill();
   H.celf(g,()=>{g.beginPath();g.ellipse(kx+.7,ky+.4,1.6,1.3,.4,0,TAU)},SB,.6);
   H.celf(g,()=>{g.beginPath();g.arc(1.9,hy-8.7,1.05,0,TAU);g.moveTo(4.25,hy-9.6);g.arc(3.2,hy-9.6,1.05,0,TAU)},CO,.6);
   g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(2.2,hy-9.1,.32,0,TAU);g.moveTo(3.8,hy-10);g.arc(3.5,hy-10,.32,0,TAU);g.fill()}});

 // ---- Sunken Bronze Mantle: sea-blue cloth under tarnished bronze: a ridged breastplate, a scallop-shell pauldron on each shoulder, bronze tabs (their
 // tips gone green) over a sea-blue skirt, a coral sash draped from the near shoulder to the far hip with a swinging end, and a short sea-blue mantle behind.
 const scallop=(g,x,y,a,r)=>()=>{const n=5,sp=1.05;g.beginPath();g.moveTo(x,y);g.lineTo(x+cos(a-sp)*r,y+sin(a-sp)*r);for(let i=0;i<n;i++){const a1=a-sp+2*sp*(i+1)/n,am=a1-sp/n;g.quadraticCurveTo(x+cos(am)*r*1.22,y+sin(am)*r*1.22,x+cos(a1)*r,y+sin(a1)*r)}g.closePath()};
 const ribs=(g,x,y,a,r)=>{const n=5,sp=1.05;g.beginPath();for(let i=1;i<n;i++){const ai=a-sp+2*sp*i/n;g.moveTo(x+cos(ai)*r*.24,y+sin(ai)*r*.24);g.lineTo(x+cos(ai)*r*.94,y+sin(ai)*r*.94)}};
 const pauldron=(g,x,y,a,r)=>{H.celf(g,scallop(g,x,y,a,r),BZ,.85);g.lineCap='round';g.strokeStyle=BZD;g.lineWidth=.65;ribs(g,x,y,a,r);g.stroke();g.save();g.translate(.45,-.4);g.strokeStyle=BZL;g.globalAlpha=.75;g.lineWidth=.4;ribs(g,x,y,a,r);g.stroke();g.restore();
  g.fillStyle=VG;g.globalAlpha=.85;g.beginPath();blob(g,x+cos(a+.62)*r*.72,y+sin(a+.62)*r*.72,1,.55,a);blob(g,x+cos(a-.75)*r*.6,y+sin(a-.75)*r*.6,.75,.45,a);g.fill();g.globalAlpha=1;
  g.fillStyle=BZL;g.strokeStyle=H.OL;g.lineWidth=.5;g.beginPath();g.ellipse(x,y,1.15,.8,a-1.57,0,TAU);g.fill();g.stroke()};
 C.art('cos_bronze_mantle',{hb:1,oc:SB,
  back(g,c){if(c.L)c.L.cape=0;/* the mantle is the cape: the look's own short cape (drawn right after this layer) stays off */const sh=c.sh,fl=cl(-c.vx*.03,-10,10)+sin(c.t*2.2)*1.1+(c.air?-5:0),len=c.hip-sh+3;
   const path=()=>{g.beginPath();g.moveTo(-6.5,sh+1);g.lineTo(4.5,sh+1);g.bezierCurveTo(6+fl*.2,sh+len*.45,6+fl*.7,sh+len*.85,2+fl*1.1,sh+len);g.quadraticCurveTo(-3+fl*1.1,sh+len+2.6,-11+fl*1.35,sh+len-1);g.bezierCurveTo(-11.6+fl*.5,sh+len*.5,-9,sh+6,-6.5,sh+1);g.closePath()};
   H.celf(g,path,SBD,1);g.save();path();g.clip();g.strokeStyle=BZ;g.lineWidth=2.2;g.beginPath();g.moveTo(2+fl*1.1,sh+len);g.quadraticCurveTo(-3+fl*1.1,sh+len+2.6,-11+fl*1.35,sh+len-1);g.stroke();g.restore()},
  torso(g,c){const sh=c.sh,hip=c.hip,gd=c.gd,tw=gd==1?10.4:gd==2?8.8:9.5,sway=cl(-c.vx*.02,-5,5)+sin(c.t*2.8)*.8,lift=c.air?-3:0,ash=gd==1?.6:gd==2?-.4:0;
   // the sea-blue skirt with short bronze tabs hanging over it, their tips gone to verdigris
   H.celf(g,()=>{g.beginPath();g.moveTo(-8.4,hip-5);g.lineTo(8.4,hip-5);g.lineTo(10.6+sway,hip+8.6+lift);g.quadraticCurveTo(sway,hip+10+lift,-10.6+sway,hip+8.6+lift);g.closePath()},shade(SB,-.06),1.05);
   g.strokeStyle=SBD;g.lineWidth=.6;g.beginPath();g.moveTo(-3.6,hip+3);g.lineTo(-4.6+sway*.8,hip+8.8+lift);g.moveTo(3.6,hip+3);g.lineTo(4.4+sway*.8,hip+8.8+lift);g.stroke();
   const TB=[];for(let i=0;i<5;i++){const x=-7+i*3.5;TB.push([x,x*1.1+sway*.7+sin(c.t*2.8+i)*.25,hip+3.4+lift*.7])}
   H.celf(g,()=>{g.beginPath();for(const[x,bx,by]of TB){g.moveTo(x-1.55,hip-4.5);g.lineTo(x+1.55,hip-4.5);g.lineTo(bx+1.6,by-1);g.quadraticCurveTo(bx,by+1.3,bx-1.6,by-1);g.closePath()}},BZ,.7);
   g.fillStyle=VG;g.globalAlpha=.9;g.beginPath();for(const i of[0,2,4]){const[,bx,by]=TB[i];blob(g,bx,by-.5,1.1,.65,0)}g.fill();g.globalAlpha=1;
   // the breastplate: two ridged lames with patina in the grooves, a sheen, and a rolled lower rim
   const w=tw-.4,wb=gd==2?8.3:8;
   H.celf(g,()=>{g.beginPath();g.moveTo(-w,sh+1.1);g.quadraticCurveTo(0,sh+3.6,w,sh+1.1);if(gd==2)g.quadraticCurveTo(6.2,sh+9,wb,hip-4);else g.lineTo(wb,hip-4);g.quadraticCurveTo(0,hip-2.4,-wb,hip-4);if(gd==2)g.quadraticCurveTo(-6.2,sh+9,-w,sh+1.1);g.closePath()},BZ,1);
   g.lineCap='round';for(const k of[0,1]){const y=sh+6.2+k*4.2,e=w-1.1-k*.7;g.strokeStyle=BZD;g.lineWidth=.7;g.beginPath();g.moveTo(-e,y-1.1);g.quadraticCurveTo(0,y+2,e,y-1.1);g.stroke();g.strokeStyle=BZL;g.lineWidth=.45;g.beginPath();g.moveTo(-e+.6,y-.3);g.quadraticCurveTo(0,y+2.8,e-.6,y-.3);g.stroke()}
   g.strokeStyle=BZD;g.lineWidth=1.3;g.beginPath();g.moveTo(-wb+.4,hip-4.6);g.quadraticCurveTo(0,hip-3,wb-.4,hip-4.6);g.stroke();
   g.fillStyle=VG;g.globalAlpha=.85;g.beginPath();blob(g,-5.4,sh+6.2,1.3,.55,.35);blob(g,3.6,sh+10.4,1.1,.5,-.3);blob(g,-1.6,hip-4.4,1,.45,.1);g.fill();g.globalAlpha=1;
   g.fillStyle='rgba(255,240,200,.38)';g.beginPath();g.ellipse(-4.2,sh+3.6,2.2,.75,-.2,0,TAU);g.fill();
   // the coral sash, near shoulder to far hip, held by a round bronze brooch; its end swings
   const s2=cl(-c.vx*.03,-7,7)+sin(c.t*2.4)*1,bx=-7.6,by=hip-5.4;
   H.celf(g,()=>{g.beginPath();g.moveTo(5.8,sh+.3);g.lineTo(9,sh+2.4);g.quadraticCurveTo(1.6,hip-6.4,bx+.8,by+1.6);g.lineTo(bx-.8,by-1.6);g.quadraticCurveTo(-.8,hip-10.4,5.8,sh+.3);g.closePath()},CO,.85);
   g.strokeStyle=COD;g.lineWidth=.45;g.beginPath();g.moveTo(7.2,sh+2);g.quadraticCurveTo(.4,hip-8.6,bx,by);g.stroke();
   H.celf(g,()=>{g.beginPath();g.moveTo(bx-1.2,by);g.lineTo(bx+1.1,by+.6);g.quadraticCurveTo(bx-.2+s2*.4,by+6,bx-1.2+s2,by+11.4+lift);g.lineTo(bx-2.4+s2,by+10.2+lift);g.lineTo(bx-3.8+s2,by+10.9+lift);g.quadraticCurveTo(bx-2.6+s2*.3,by+5,bx-1.2,by);g.closePath()},COD,.85);
   H.celf(g,()=>{g.beginPath();g.arc(bx,by,2,0,TAU)},BZ,.7);g.fillStyle=VG;g.beginPath();g.arc(bx+.15,by-.1,.85,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(bx+.5,by-.9,.4,0,TAU);g.fill();
   // the far pauldron (the near one is drawn over the near arm)
   pauldron(g,-5.8-ash,sh-.4,PI-1.15,4.8)},
  front(g,c){const ash=c.gd==1?.6:c.gd==2?-.4:0;pauldron(g,5.2+ash,c.sh-.8,1.12,6.2)}});

 // ---- Coral Ribbon: a little tree of living coral pinned at the back of the head (its branches bend in a slow current, polyps at the tips), tied at its
 // foot with a coral-silk ribbon whose two long ends drift as if underwater (a wave travels down them and they twist as they turn); they stream back when you
 // run and float up in the air, and now and then a tiny bubble rises from the coral.
 const RP=[pts(6),pts(6)];
 // coral branches: [from x,y, control x,y, to x,y] relative to the foot (negative x leans back, negative y is up); the tips get polyps
 const CB=[[0,.3,-.3,-1.5,-1.1,-2.8],[-1.1,-2.8,-.3,-4.2,-.7,-5.4],[-.7,-5.4,-1.2,-6.6,-2.1,-7.8],[-.7,-5.4,.4,-6.1,.9,-7.3],[-1.1,-2.8,-2.7,-3,-3.6,-4.4],[-3.6,-4.4,-4.8,-4.5,-6,-5],[-3.6,-4.4,-3.8,-5.9,-4.6,-7.1],[-.5,-1.2,-2.1,-1.1,-3.6,-1.7]],CT=[2,3,5,6,7];
 C.art('cos_coral_ribbon',{
  head(g,c){const hy=c.hy,t=c.t,x0=-9.4,y0=hy-9.6,drag=cl(c.vx*.022,-6,6),air=c.air?1:0,run=c.run?1:0;
   // the two ribbon ends, behind the coral
   for(const k of[1,0]){const P=RP[k],n=P.length-1,ph=k*1.9,dx=(k?-7.4:-10)-drag*1.1-run*2.2,dy=(k?9.6:13)-run*3;
    for(let i=0;i<=n;i++){const s=i/n,q=P[i],wv=sin(t*1.5-s*3.4+ph)*s*2.2;q[0]=x0-.4+dx*s+wv*.85;q[1]=y0+1+dy*s-air*4.2*s*s+wv*.4;q[2]=(1.55-s*.35)*(.58+.42*Math.abs(cos(t*1.1-s*3.6+ph)))}
    ribbon(g,P,k?COD:CO,.65,1);
    g.strokeStyle=COL;g.globalAlpha=.5;g.lineWidth=.42;g.beginPath();g.moveTo(P[1][0],P[1][1]);for(let i=2;i<n;i++)g.lineTo(P[i][0],P[i][1]);g.stroke();g.globalAlpha=1}
   // the coral: round tubes (outline, dark, lit), bending in a slow current
   const cu=sin(t*1.25)*.09+drag*.012+(air?.05:0),X=(x,y)=>x0+x-y*cu,br=()=>{g.beginPath();for(const[a,b,p,q,e,f]of CB){g.moveTo(X(a,b),y0+b);g.quadraticCurveTo(X(p,q),y0+q,X(e,f),y0+f)}};
   g.lineCap='round';g.lineJoin='round';br();g.strokeStyle=H.OL;g.lineWidth=2.5;g.stroke();g.strokeStyle=COD;g.lineWidth=1.65;g.stroke();g.save();g.translate(.3,-.3);g.strokeStyle=CO;g.lineWidth=.85;br();g.stroke();g.restore();
   g.fillStyle=COL;g.beginPath();for(const i of CT){const e=CB[i][4],f=CB[i][5],x=X(e,f),y=y0+f;g.moveTo(x+.6,y);g.arc(x,y,.6,0,TAU)}g.fill();
   // the ribbon wrapped around the coral's foot
   H.celf(g,()=>{g.beginPath();g.ellipse(x0-.3,y0+.9,1.75,1.2,.45,0,TAU)},CO,.65);g.strokeStyle=COD;g.lineWidth=.45;g.beginPath();g.moveTo(x0-1.3,y0+.1);g.lineTo(x0+.6,y0+1.8);g.stroke();
   // a tiny bubble rising from the coral now and then, drifting back
   const p=fr(t*.28),a=sin(p*PI)*.6,bx=X(.9,-7.3)-p*2.6+sin(t*2.3)*.4,by=y0-8.4-p*7,r=.45+.3*p;g.fillStyle='rgba(190,240,255,'+a.toFixed(2)+')';g.beginPath();g.arc(bx,by,r,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,'+Math.min(1,a*1.4).toFixed(2)+')';g.beginPath();g.arc(bx-r*.35,by-r*.35,r*.35,0,TAU);g.fill()}});

 // ---- Tide Relic Shield (very rare): an ancient round bronze shield slung on the back: a thick riveted rim (one rivet long lost) with barnacles on its
 // edge, verdigris blooms, a sea-blue enamel field with a breaking wave inlaid in pale gold, a softly glowing coral gem set in the lowest point of the rim,
 // a slow shine that sweeps across it, two strands of kelp still caught on the rim, and drops of sea water that gather under the gem and fall.
 // A leather strap crosses the chest; it takes the back, so the look's own short cape is not drawn over it.
 const RIV=[];for(let i=0;i<10;i++)if(i!=2&&i!=3&&i!=5)RIV.push([cos(i*TAU/10+.31),sin(i*TAU/10+.31)]);
 const DR=[[PI/2-.6,0],[PI/2,.37],[PI/2+.55,.71]],KP=[pts(5),pts(4)];
 C.art('cos_relic_shield',{
  back(g,c){if(c.L)c.L.cape=0;/* the shield takes the back: the look's short cape would cover it */const sh=c.sh,hip=c.hip,t=c.t,gd=c.gd,R=10.6,sx=.8,cx=gd==1?-15.9:gd==2?-14.9:-15.4,cy=(sh+hip)/2+1.4+(c.air?-1.2:0),
    rot=.12+cl(c.vx*.0006,-.14,.14)+(c.run?sin(t*14)*.035:sin(t*1.9)*.015)+(c.air?-.08:0),cr=cos(rot),sr=sin(rot);
   const toB=(a,r)=>{const lx=r*cos(a),ly=r*sin(a);return[cx+lx*sx*cr-ly*sr,cy+lx*sx*sr+ly*cr]};
   // kelp caught on the lower rim (behind the shield), drifting
   const d=cl(-c.vx*.02,-5,5);for(const k of[0,1]){const P=KP[k],n=P.length-1,[kx,ky]=toB(PI/2+.62+k*.3,R-1),L=k?6.5:10;for(let i=0;i<=n;i++){const s=i/n,q=P[i];q[0]=kx+d*s*s-1.6*s+sin(t*1.4-s*3.2+k*2)*s*1.8;q[1]=ky+s*L+(c.air?-3*s*s:0);q[2]=(1.3-s*.5)*(k?.8:1)}
    ribbon(g,P,k?'#3f8a55':'#56a866',.65,0)}
   g.save();g.translate(cx,cy);g.rotate(rot);g.scale(sx,1);
   // the edge of the shield (its thickness, seen from the side), then the rim and the face
   g.fillStyle='#3d2714';g.beginPath();g.arc(-2.3,.3,R,0,TAU);g.fill();g.strokeStyle=H.OL;g.lineWidth=1.1;g.stroke();
   H.celf(g,()=>{g.beginPath();g.arc(0,0,R,0,TAU)},BZ,1.1);
   H.celf(g,()=>{g.beginPath();g.arc(.2,-.1,R-2.1,0,TAU)},shade(BZ,.08),.75);
   // verdigris blooms in the hollows of the bronze
   g.fillStyle=VG;g.globalAlpha=.85;g.beginPath();blob(g,-7.4,3.4,1.6,.8,1.2);blob(g,5.4,-6.2,1.3,.65,-.75);blob(g,-6.6,-4.6,.9,.55,-1);blob(g,2.6,7.6,1.2,.5,-.2);g.fill();g.fillStyle=VGL;g.globalAlpha=.55;g.beginPath();blob(g,-7.2,3,.7,.32,1.2);blob(g,5.6,-6.4,.5,.28,-.75);g.fill();g.globalAlpha=1;
   // rivets (one long lost)
   g.fillStyle=BZL;g.strokeStyle=H.OL;g.lineWidth=.55;g.beginPath();for(const[a,b]of RIV){const x=a*(R-1.05),y=b*(R-1.05);g.moveTo(x+.8,y);g.arc(x,y,.8,0,TAU)}g.fill();g.stroke();
   // barnacles crusted on the lower edge
   g.fillStyle='#ece2c8';g.beginPath();for(const[x,y,r]of[[-7,8,1.15],[-5,9.5,.85],[-8.6,6,.75]]){g.moveTo(x+r,y);g.arc(x,y,r,0,TAU)}g.fill();g.stroke();g.fillStyle='#a8977a';g.beginPath();for(const[x,y,r]of[[-6.85,7.85,.45],[-4.9,9.4,.32]]){g.moveTo(x+r,y);g.arc(x,y,r,0,TAU)}g.fill();
   // the enamel field: a breaking wave inlaid in pale gold, its curl turned outward
   const fld=()=>{g.beginPath();g.arc(.3,-.2,6.1,0,TAU)};H.celf(g,fld,'#2a6a98',.8);
   g.save();fld();g.clip();g.translate(.3,-.2);g.scale(-1,1);
   H.celf(g,()=>{g.beginPath();g.moveTo(-6.4,3.2);g.bezierCurveTo(-4.6,1.6,-2.4,-.2,-.8,-2.6);g.bezierCurveTo(.6,-4.6,3.4,-5,4.7,-3.2);g.bezierCurveTo(5.5,-2,4.9,-.2,3.5,-.4);g.bezierCurveTo(4.3,-1.4,3.7,-2.7,2.4,-2.4);g.bezierCurveTo(.7,-1.9,.5,.9,2.2,2.3);g.bezierCurveTo(3.2,3.2,4.8,3.4,6.6,3.3);g.lineTo(6.6,7);g.lineTo(-6.4,7);g.closePath()},'#efd59a',.6);
   g.fillStyle='#fff6dc';g.beginPath();blob(g,5.3,-.1,.48,.48,0);blob(g,4.6,1,.34,.34,0);blob(g,3.9,1.8,.24,.24,0);g.fill();
   g.strokeStyle='#5b9fca';g.lineWidth=.6;g.lineCap='round';g.beginPath();g.moveTo(-4.8,5);g.quadraticCurveTo(-2.4,4.1,0,5);g.quadraticCurveTo(2.4,5.9,4.8,5);g.stroke();g.restore();
   // the coral gem set in the lowest point of the rim, glowing softly (the sea water drips from it)
   const pu=.5+.5*sin(t*2.2),gx=0,gy=R-1.15;H.glow(g,gx,gy,3.4,'#ff8a70',.2+.2*pu);
   H.celf(g,()=>{g.beginPath();g.ellipse(gx,gy,1.9,1.5,0,0,TAU)},BZ,.7);H.celf(g,()=>{g.beginPath();g.ellipse(gx,gy,1.2,1,0,0,TAU)},CO,.5);g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(gx-.4,gy-.4,.36,0,TAU);g.fill();
   // a slow shine sweeping across the bronze, and a resting highlight
   const p=fr(t/3.4);if(p<.42){const q=p/.42,x=-16+q*32;g.save();g.beginPath();g.arc(0,0,R,0,TAU);g.clip();g.globalCompositeOperation='lighter';g.globalAlpha=.32*sin(q*PI);g.fillStyle='#fff2c8';g.beginPath();g.moveTo(x-1.6,-R);g.lineTo(x+1.4,-R);g.lineTo(x-2.6,R);g.lineTo(x-5.6,R);g.closePath();g.fill();g.restore()}
   g.fillStyle='rgba(255,246,220,.4)';g.beginPath();g.ellipse(4,-7,2.8,.9,-.6,0,TAU);g.fill();
   g.restore();
   // drops of sea water gather on the lower edge and fall
   g.fillStyle='rgba(170,226,250,.9)';for(const[a,o]of DR){const p=fr(t*.55+o),[bx,by]=toB(a,R);let x=bx,y=by+.4,r;
    if(p<.5){r=.35+p*1.3;y+=r*.6}else{const q=(p-.5)/.5;r=.95-q*.25;x-=cl(c.vx*.012,-4,4)*q;y+=1+q*q*15;g.globalAlpha=1-q*q}
    g.beginPath();g.moveTo(x,y-r*2.3);g.quadraticCurveTo(x+r*1.2,y-.1,x,y+r);g.quadraticCurveTo(x-r*1.2,y-.1,x,y-r*2.3);g.fill();g.globalAlpha=1}},
  torso(g,c){const sh=c.sh,hip=c.hip;
   // the leather strap from the far shoulder across the chest, with a bronze buckle
   H.celf(g,()=>{g.beginPath();g.moveTo(-9.6,sh+.6);g.lineTo(-6.6,sh+.2);g.lineTo(9,hip-5.8);g.lineTo(8.6,hip-2.6);g.closePath()},'#6a4428',.8);
   H.celf(g,H.poly(g,[-1.4,sh+6.8,1.6,sh+8.8,.6,sh+10.6,-2.4,sh+8.6]),BZ,.7)}});
})()}catch(e){console.error('COS sunken',e)}
