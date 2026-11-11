// ===== Archer evolution cinematic: Galewarden. A windswept plateau at sunrise above a sea of cloud; the gale coils up around the archer; a spiral vortex on the grass; leaf-blade pauldrons, a leaf crest at the temples, a short wind-torn mantle;
// Galeshot: one arrow drawn from the wind, loosed with a recoil step back, that coils into a gale spiral, tears across the sky into a cyclone and bursts. =====
try{(()=>{const F=()=>FILM1,sin=Math.sin,cos=Math.cos,TAU=6.2832,PI=Math.PI;
 const G0='#8affc0',DEEP='#134a38',MID='#1f6a52',PALE='#d8fff0',LEAF='#3ec48a',INK='#0b2e22',WL=900;
 const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,ease=k=>{k=cl(k,0,1);return 1-Math.pow(1-k,3)},sm=k=>{k=cl(k,0,1);return k*k*(3-2*k)};
 // what the drawn bow is doing right now (set around a hero call by the shots that need it; the default shots read it from the pose itself)
 const S={arrow:1,vib:0,out:null};
 // ---------- shapes
 // a leaf blade along +x from the origin, with a slight bend and a pale midrib
 function leaf(g,len,w,c0,c1,edge,bend){const b=bend||0,p=new Path2D();p.moveTo(0,0);p.bezierCurveTo(len*.22,-w*1.05+b*.5,len*.68,-w*.72+b*1.4,len,b*2);p.bezierCurveTo(len*.7,w*.5+b*1.4,len*.24,w*.92+b*.5,0,0);p.closePath();
  const G=g.createLinearGradient(0,0,len,0);G.addColorStop(0,c0);G.addColorStop(1,c1);g.fillStyle=G;g.fill(p);if(edge){g.strokeStyle=edge;g.lineWidth=2.4;g.stroke(p)}
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1.6;g.beginPath();g.moveTo(len*.05,0);g.quadraticCurveTo(len*.5,b*.9-w*.06,len*.9,b*1.85);g.stroke();return p}
 // a small leaf for particles (cheap: one path, one fill)
 function chip(g,x,y,a,s,c){g.save();g.translate(x,y);g.rotate(a);g.fillStyle=c;g.beginPath();g.moveTo(-s,0);g.quadraticCurveTo(0,-s*.5,s,0);g.quadraticCurveTo(0,s*.5,-s,0);g.fill();g.restore()}
 // the arrow of wind: a light shaft, a leaf-shaped head and two leaf vanes
 function arrow(g,x0,y0,x1,y1,w,t,glowA){const a=Math.atan2(y1-y0,x1-x0),L=Math.hypot(x1-x0,y1-y0);g.save();g.translate(x0,y0);g.rotate(a);
  if(glowA){g.globalCompositeOperation='lighter';g.globalAlpha=glowA;g.strokeStyle=G0;g.lineWidth=w*3.2;g.beginPath();g.moveTo(0,0);g.lineTo(L,0);g.stroke();g.globalAlpha=1;g.globalCompositeOperation='source-over'}
  g.strokeStyle=G0;g.lineWidth=w*1.5;g.beginPath();g.moveTo(w*2,0);g.lineTo(L-w*4,0);g.stroke();g.strokeStyle='#ffffff';g.lineWidth=w*.7;g.stroke();
  // the gale coil wound round the shaft
  g.strokeStyle='rgba(234,255,244,.85)';g.lineWidth=w*.35;for(let j=0;j<2;j++){g.beginPath();for(let i=0;i<=22;i++){const u=i/22,X=w*4+u*(L-w*10);g[i?'lineTo':'moveTo'](X,sin(u*14-t*16+j*PI)*w*1.5)}g.stroke()}
  for(const s of[-1,1]){g.save();g.translate(w*7,0);g.rotate(PI+s*.42);leaf(g,w*7,w*1.3,PALE,G0,INK,0);g.restore()}
  g.save();g.translate(L-w*6.5,0);leaf(g,w*9,w*2.1,'#ffffff',G0,INK,0);g.restore();g.restore()}
 // a leaf-blade pauldron: three blades fanned down and out, under a rounded cap
 function pauldron(g,X,Y,e,s,flip,t,w){if(e<=0)return;g.save();g.translate(X,Y);g.scale(s*(flip?-1:1)*e,s*e);
  const B=[[2.5,200,52],[2.06,232,58],[1.66,176,48]];for(let i=0;i<3;i++){const[a,len,wd]=B[i];g.save();g.rotate(a+sin(t*6+i*1.3)*.035*(1+w));leaf(g,len,wd,i==1?'#2c9a72':MID,i==1?'#9affd0':LEAF,INK,-6);g.restore()}
  g.beginPath();g.ellipse(0,-4,84,52,-.12,0,TAU);const G=g.createLinearGradient(0,-56,0,50);G.addColorStop(0,'#3aa882');G.addColorStop(.5,MID);G.addColorStop(1,DEEP);g.fillStyle=G;g.fill();g.strokeStyle=INK;g.lineWidth=3;g.stroke();
  g.strokeStyle=PALE;g.lineWidth=5;g.beginPath();g.ellipse(0,-4,70,40,-.12,PI*.15,PI*.85);g.stroke();
  g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(-18,-28,34,10,-.3,0,TAU);g.fill();
  // a leaf-cut emerald
  g.fillStyle='#4affb0';g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.moveTo(0,-20);g.quadraticCurveTo(14,0,0,22);g.quadraticCurveTo(-14,0,0,-20);g.fill();g.stroke();g.fillStyle='#ffffff';g.fillRect(-3,-10,4,8);g.restore()}
 // the bow string, and the arrow when one is nocked: read from the arms, so any pose that holds the bow out reads as aiming
 // the Mythic bow itself, grip in the hand (the film body would put a bow's grip 0.4 of its length off the hand, so the poses say noWpn and it is drawn here)
 // drawn here rather than by MYART.weapon: the same two limbs, crystals, feathers and grip as the Mythic bow, but with leaves and soft round glows where the game's bow has its four-point stars (and no halo ring)
 let BP=null;function bowAt(g,X,Y,wa,t,str){const M=MYART;if(!BP){try{BP=M.TH.archer.pal}catch(_){}BP=BP||['#c8b8ff','#fff6e0','#2a2050','#ffd98a']}const[m,l,d,a]=BP;
  g.save();g.translate(X,Y);g.rotate(wa);g.scale(WL/100,WL/100);const h=F().lineScale(g,.32);h.lineJoin='round';h.lineCap='round';
  try{const lim=s=>{h.beginPath();h.moveTo(2,s*4);h.bezierCurveTo(14,s*20,8,s*40,22,s*58);h.lineTo(26,s*55);h.bezierCurveTo(14,s*40,20,s*20,6,s*3);h.closePath();h.fillStyle=M.metal(h,0,0,26,s*58,'archer',.3);h.fill();h.strokeStyle=M.OL;h.lineWidth=1.1;h.stroke()};
   lim(-1);lim(1);
   for(const s of[-1,1]){M.crystal(h,16,s*30,9,s>0?PI*.8:PI*.2,m);M.feather(h,22,s*56,14,s*(PI*.35),'#ffffff',M.mix(m,'#ffffff',.4));
    h.save();h.globalCompositeOperation='lighter';const gr=h.createRadialGradient(24,s*57,0,24,s*57,5);gr.addColorStop(0,'rgba(234,255,244,.6)');gr.addColorStop(1,'rgba(138,255,192,0)');h.fillStyle=gr;h.beginPath();h.arc(24,s*57,5,0,TAU);h.fill();h.restore();
    chip(h,25,s*57.5,s*(1.1+sin(t*5+s)*.25),4.2,'#9affd0')}
   if(str){h.beginPath();h.moveTo(23,-57);h.lineTo(-10,0);h.lineTo(23,57);h.strokeStyle=M.rgba(l,.95);h.lineWidth=.8;h.stroke();h.save();h.globalCompositeOperation='lighter';h.strokeStyle=M.rgba(m,.4);h.lineWidth=2.4;h.stroke();h.restore()}
   h.beginPath();h.roundRect(-3,-7,8,14,3);h.fillStyle=M.mix(d,'#000000',.2);h.fill();h.strokeStyle=M.OL;h.lineWidth=1.1;h.stroke();M.gem(h,4,0,4,a,true);M.curl(h,6,-6,6,-1,false,M.mix(l,'#ffffff',.4),.9);M.curl(h,6,6,6,1,true,M.mix(l,'#ffffff',.4),.9);
   // three leaves wheeling round the grip
   h.save();h.translate(4,0);h.rotate(t*1.4);for(let i=0;i<3;i++){const q=i/3*TAU;chip(h,cos(q)*10,sin(q)*10,q+1.6,3,i?'#7affb8':'#eafff4')}h.restore()}
  catch(e){if(!bowAt.e){bowAt.e=1;console.error('EVC archer bow',e)}}g.restore()}
 const LOW=PI+.14,GW=.1;
 // the title reuses the hero pose (flipped); it holds the bow lowered and ready instead, so nothing points at the name
 let TITLE=0;
 function bowString(g,J){const nA=J.nA,fA=J.fA,NS=J.NS;if(!nA||!fA)return;const hx=J.NH?J.NH[0]:nA[2],hy=J.NH?J.NH[1]:nA[3],dx=hx-NS[0],dy=hy-NS[1],aiming=!TITLE&&Math.hypot(dx,dy)>430&&dx>260;
  const wa=S.wa!=null?S.wa:TITLE?-.3:aiming?Math.atan2(dy,dx):dx>-75?GW:LOW;bowAt(g,hx,hy,wa,J.t,!aiming);g.fillStyle=J.C.glove;g.strokeStyle=INK;g.lineWidth=2.6;g.beginPath();g.ellipse(nA[2],nA[3]+4,30,34,0,0,TAU);g.fill();g.stroke();
  if(!aiming){S.out=null;return}const c=cos(wa),s=sin(wa),L=WL,R=(lx,ly)=>[hx+lx*c-ly*s,hy+lx*s+ly*c];
  const T1=R(.225*L,-.565*L),T2=R(.225*L,.565*L),rest=R(-.06*L,0),fx=fA[2],fy=fA[3]+6,drawn=S.arrow&&Math.hypot(fx-hx,fy-hy)<520;
  let D=drawn?[fx,fy]:rest;if(!drawn&&S.vib){const v=sin(J.t*70)*S.vib*34;D=[rest[0]-s*v,rest[1]+c*v]}
  g.save();g.lineCap='round';g.strokeStyle='rgba(138,255,192,.45)';g.lineWidth=12;g.beginPath();g.moveTo(T1[0],T1[1]);g.lineTo(D[0],D[1]);g.lineTo(T2[0],T2[1]);g.stroke();g.strokeStyle='#f2fff8';g.lineWidth=3.6;g.stroke();
  const tip=R(.47*L,0);if(drawn){arrow(g,D[0],D[1],tip[0],tip[1],15,J.t,0);g.fillStyle=J.C.glove;g.strokeStyle=INK;g.lineWidth=2.4;g.beginPath();g.ellipse(fx,fy,27,30,0,0,TAU);g.fill();g.stroke()}
  g.restore();S.out={hand:[hx,hy],D,tip,T1,T2,wa,drawn}}
 const dress={
  back(g,J){const k=J.k.p3||0;if(k<=0)return;const e=ease(k),w=J.wnd,t=J.t,A=J.rot(-140,-384),B=J.rot(92,-394),len=lerp(90,480,e),sw=sin(t*2.1)*26+w*430;
   // the short mantle, torn into tongues that the wind drags back
   const bx=A[0]-150*e-sw*.8,by=A[1]+len,ex=B[0]-30-sw*.3,ey=B[1]+len*.8,n=6,p=new Path2D();p.moveTo(A[0],A[1]);p.bezierCurveTo(A[0]-50-sw*.3,A[1]+len*.4,bx+16,by-len*.32,bx,by);
   const tips=[];for(let i=0;i<n;i++){const u0=i/n,u1=(i+1)/n,um=(u0+u1)/2,b1=[lerp(bx,ex,u1),lerp(by,ey,u1)],tx=lerp(bx,ex,um)-(50+((i*37)%5)*26)*e-sw*.28*(1-um)+sin(t*6.3+i*1.9)*22,ty=lerp(by,ey,um)+(80+((i*53)%4)*34)*e+sin(t*5+i)*14;tips.push([tx,ty]);
    p.quadraticCurveTo(lerp(bx,ex,u0+.02)-10,lerp(by,ey,u0)+40*e,tx,ty);p.quadraticCurveTo(lerp(bx,ex,um+.06),lerp(by,ey,um)+30*e,b1[0],b1[1])}
   p.bezierCurveTo(ex+40,ey-len*.4,B[0]+30,B[1]+len*.2,B[0],B[1]);p.closePath();
   const G=g.createLinearGradient(A[0],A[1],bx,by+120);G.addColorStop(0,'#2e9a72');G.addColorStop(.45,MID);G.addColorStop(1,DEEP);g.fillStyle=G;g.fill(p);
   g.save();g.clip(p);g.strokeStyle='rgba(4,26,18,.42)';g.lineWidth=12;for(let i=0;i<5;i++){g.beginPath();g.moveTo(A[0]+i*48,A[1]+30);g.quadraticCurveTo(lerp(A[0],bx,.6)+i*40,lerp(A[1],by,.5),tips[i][0]+20,tips[i][1]-30);g.stroke()}
   g.strokeStyle='rgba(216,255,240,.55)';g.lineWidth=16;g.beginPath();g.moveTo(A[0]-6,A[1]+10);g.bezierCurveTo(A[0]-50-sw*.3,A[1]+len*.4,bx+16,by-len*.32,bx+4,by);g.stroke();g.restore();
   g.strokeStyle=INK;g.lineWidth=3;g.stroke(p);
   // gale wisps streaming off the torn ends
   g.globalCompositeOperation='lighter';g.strokeStyle='rgba(138,255,192,.5)';g.lineWidth=5;for(let i=0;i<n;i+=2){const[tx,ty]=tips[i];g.beginPath();g.moveTo(tx,ty);g.bezierCurveTo(tx-80-w*90,ty+20,tx-150-w*160,ty-40+sin(t*4+i)*30,tx-240-w*220,ty-10);g.stroke()}g.globalCompositeOperation='source-over'},
  torso(g,J){const k1=J.k.p1||0,k3=J.k.p3||0,t=J.t,w=J.wnd;g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);
   // the mantle's wind collar, standing up at both sides of the neck
   if(k3>0){const e=ease(k3);for(const s of[-1,1]){const x0=s<0?-46:42,fl=(sin(t*5+s)*6+w*20)*e;g.beginPath();g.moveTo(x0,-388);g.quadraticCurveTo(x0+s*70,-400,x0+s*(96+fl),-470*e-390*(1-e)+fl);g.quadraticCurveTo(x0+s*60,-430,x0+s*8,-418*e-388*(1-e));g.closePath();const G=g.createLinearGradient(x0,-470,x0+s*90,-388);G.addColorStop(0,PALE);G.addColorStop(1,MID);g.fillStyle=G;g.fill();g.strokeStyle=INK;g.lineWidth=2.6;g.stroke()}
    g.fillStyle=DEEP;g.beginPath();g.moveTo(-150*1,-372);g.quadraticCurveTo(-100,-412,-40,-400);g.lineTo(-30,-372);g.quadraticCurveTo(-90,-360,-150,-340);g.closePath();g.globalAlpha=Math.min(1,k3*2);g.fill();g.globalAlpha=1}
   if(k1>0){const e=ease(k1);g.save();g.translate(0,(1-e)*-60);g.globalAlpha=Math.min(1,k1*2);
    // the chest guard: two pale leaf plates meeting at a leaf-cut emerald
    const PL=[[[-114,-362],[-8,-376],[-6,-232],[-98,-264]],[[8,-376],[100,-362],[84,-270],[6,-232]]];
    for(const P of PL){g.beginPath();g.moveTo(P[0][0],P[0][1]);g.quadraticCurveTo((P[0][0]+P[1][0])/2,P[0][1]-14,P[1][0],P[1][1]);g.quadraticCurveTo(P[1][0]+6,(P[1][1]+P[2][1])/2,P[2][0],P[2][1]);g.quadraticCurveTo((P[2][0]+P[3][0])/2,P[3][1]+20,P[3][0],P[3][1]);g.closePath();
     const G=g.createLinearGradient(0,-380,0,-230);G.addColorStop(0,'#ffffff');G.addColorStop(.4,PALE);G.addColorStop(1,'#7ccaa6');g.fillStyle=G;g.fill();g.strokeStyle=INK;g.lineWidth=2.6;g.stroke();
     // a gust engraved on each plate
     const cx=(P[0][0]+P[2][0])/2,cy=-306;g.strokeStyle=MID;g.lineWidth=3.4;g.beginPath();for(let i=0;i<=14;i++){const u=i/14,a=u*4.6,r=4+u*24;g[i?'lineTo':'moveTo'](cx+cos(a)*r,cy+sin(a)*r*.8)}g.stroke()}
    g.save();g.beginPath();g.rect(-120,-380,224,150);g.clip();g.fillStyle='rgba(255,255,255,.5)';const gx=-220+((t*240)%560);g.beginPath();g.moveTo(gx,-390);g.lineTo(gx+34,-390);g.lineTo(gx-30,-220);g.lineTo(gx-64,-220);g.closePath();g.fill();g.restore();
    // the bow strap across the body, with leaf studs
    g.strokeStyle='#0d2a20';g.lineWidth=26;g.beginPath();g.moveTo(-118,-380);g.quadraticCurveTo(-10,-250,82,-118);g.stroke();g.strokeStyle='rgba(216,255,240,.6)';g.lineWidth=2;g.setLineDash([10,9]);g.stroke();g.setLineDash([]);
    for(const u of[.25,.5,.75]){const x=lerp(-118,82,u)+(u<.5?-12:0),y=lerp(-380,-118,u)+(u==.5?18:0);chip(g,x,y,.95,16,'#9affd0')}
    g.fillStyle='#4affb0';g.strokeStyle=INK;g.lineWidth=2.4;g.beginPath();g.moveTo(0,-330);g.quadraticCurveTo(18,-300,0,-262);g.quadraticCurveTo(-18,-300,0,-330);g.fill();g.stroke();g.fillStyle='#ffffff';g.fillRect(-4,-316,5,14);
    g.restore()}
   g.restore();if(k1>0)pauldron(g,J.FS[0]+8,J.FS[1]+6,ease(k1),.62,1,t,w)},
  front(g,J){const k1=J.k.p1||0,t=J.t;
   if(k1>0&&J.nA){const e=ease(k1),nA=J.nA,a=Math.atan2(nA[3]-nA[1],nA[2]-nA[0]);
    // a pale bracer on the bow arm, with a leaf fin swept back
    g.save();g.translate(lerp(nA[0],nA[2],.5),lerp(nA[1],nA[3],.5));g.rotate(a);g.scale(1,e);g.globalAlpha=Math.min(1,k1*2);
    g.save();g.translate(-40,-30);g.rotate(PI+.5+sin(t*7)*.06);leaf(g,150*e,26,PALE,G0,INK,4);g.restore();
    g.beginPath();g.moveTo(-92,-40);g.lineTo(78,-34);g.quadraticCurveTo(92,0,78,34);g.lineTo(-92,40);g.quadraticCurveTo(-104,0,-92,-40);g.closePath();const G=g.createLinearGradient(0,-40,0,40);G.addColorStop(0,'#ffffff');G.addColorStop(.5,PALE);G.addColorStop(1,'#6ab894');g.fillStyle=G;g.fill();g.strokeStyle=INK;g.lineWidth=2.6;g.stroke();
    g.strokeStyle=MID;g.lineWidth=7;for(const x of[-60,40]){g.beginPath();g.moveTo(x,-38);g.lineTo(x+6,38);g.stroke()}g.restore();
    pauldron(g,J.NS[0]-8,J.NS[1]+2,e,.78,0,t,J.wnd)}
   bowString(g,J)},
  head(g,J){const k=J.k.p2||0;if(k<=0)return;const e=ease(k),sy=sin(J.yaw||.26),w=J.wnd,t=J.t;g.save();g.globalAlpha=Math.min(1,k*2);
   // leaf-blade crests rising from the temples, swept back by the wind
   for(const s of[1,-1]){const X=s*114+sy*12,Y=-74;for(let i=2;i>=0;i--){const a=(s<0?-2.2-i*.3:-1.32-i*.26)-w*.14-sin(t*5.5+i+s)*.04;g.save();g.translate(X,Y);g.rotate(a);leaf(g,[200,160,118][i]*e,[30,25,20][i],PALE,i?LEAF:G0,INK,s*-3);g.restore()}}
   // the circlet: a thin band across the brow, a leaf-cut emerald at its centre
   g.strokeStyle=INK;g.lineWidth=2.6;g.fillStyle=PALE;g.beginPath();g.moveTo(-124,-80);g.quadraticCurveTo(sy*40,-124,124,-84);g.lineTo(122,-70);g.quadraticCurveTo(sy*40,-108,-122,-66);g.closePath();g.fill();g.stroke();
   g.strokeStyle=MID;g.lineWidth=3;g.beginPath();g.moveTo(-110,-72);g.quadraticCurveTo(sy*40,-114,110,-77);g.stroke();
   const cx=sy*40,cy=-102;g.fillStyle='#4affb0';g.beginPath();g.moveTo(cx,cy-24);g.quadraticCurveTo(cx+15,cy,cx,cy+18);g.quadraticCurveTo(cx-15,cy,cx,cy-24);g.fill();g.stroke();g.fillStyle='#ffffff';g.fillRect(cx-4,cy-14,4,10);g.restore()}};
 // ---------- poses: the bow held out, the draw at the jaw; nh along the aim so the string and arrow follow
 const NSb=[-128,-1202],FSb=[100,-1202];
 function aimP(ang,o){o=o||{};const c=cos(ang),s=sin(ang),R=o.R||560,Dd=o.Dd==null?280:o.Dd,nh=[R*c,R*s],hand=[NSb[0]+nh[0],NSb[1]+nh[1]],D=[hand[0]-Dd*c,hand[1]-Dd*s];
  return Object.assign({nh,fh:[D[0]-FSb[0]+(o.fx||0),D[1]-FSb[1]-6+(o.fy||0)],wa:ang,noWpn:1,fb:o.fb==null?-1:o.fb,lean:-.03,nf:[-150,0],ff:[170,0]},o.p||{})}
 const P_HERO=aimP(-.18,{R:480,p:{py:130,lean:-.05,nf:[-260,0],ff:[270,0],hd:{yaw:.32,eye:{open:.9,angry:.3,look:[.5,-.1]},brow:{angry:.3}}}});
 // the engine copies pose objects but keeps their arrays and hd by reference, so the title look is swapped in place (set by the floor-mark call that comes just before each hero)
 const cp=o=>JSON.parse(JSON.stringify(o)),H0=cp({nh:P_HERO.nh,fh:P_HERO.fh,nf:P_HERO.nf,ff:P_HERO.ff,hd:P_HERO.hd}),
  H1={nh:[300,330],fh:[-10,450],nf:[-170,0],ff:[190,0],hd:{yaw:.3,tilt:-.04,eye:{open:.9,angry:.2,look:[.2,-.05]},brow:{angry:.2},mouth:{open:0,smile:.25}}};
 function heroMode(t){t=t?1:0;if(TITLE===t)return;TITLE=t;const src=t?H1:H0;for(const k of['nh','fh','nf','ff'])P_HERO[k][0]=src[k][0],P_HERO[k][1]=src[k][1];const hd=P_HERO.hd;for(const k in hd)delete hd[k];Object.assign(hd,cp(src.hd))}
 const P_WIND=aimP(-.12,{Dd:300,p:{py:40,lean:-.08,nf:[-200,0],ff:[220,0]}});
 // gathering: the bow held out in front, tipped forward, the draw hand on the string, eyes down on the forming vortex
 const P_GATH={nh:[200,420],fh:[-118,411],wa:GW,noWpn:1,lean:.05,nf:[-110,0],ff:[120,0],hd:{yaw:.2,tilt:.08,eye:{open:.72,angry:.35,look:[.15,.6]},brow:{angry:.35},mouth:{open:0,smile:0}}};
 const P_PIECE={nh:[-110,500],fh:[60,430],wa:LOW,noWpn:1,lean:.02,nf:[-80,0],ff:[90,0]};
 // ---------- the place: a windswept plateau at sunrise above a sea of cloud
 function plate(x,R,P){const{W,H,glow}=P;
  glow(x,1660,700,900,'#e8fff0',.7);glow(x,1660,700,300,'#fffbe8',.9);glow(x,1660,706,100,'#ffffff',1);
  // two faint gale spirals high in the sky
  x.save();x.lineCap='round';for(const[cx,cy,r]of[[700,105,200],[1730,170,230]])for(let j=0;j<3;j++){x.strokeStyle='rgba(230,255,244,'+(.13-j*.03)+')';x.lineWidth=10-j*3;x.beginPath();for(let i=0;i<=60;i++){const u=i/60,a=u*7+j*2.1,rr=r*(.1+.9*u);x[i?'lineTo':'moveTo'](cx+cos(a)*rr,cy+sin(a)*rr*.5)}x.stroke()}
  // long cirrus torn by the wind
  for(let i=0;i<46;i++){const y=50+R()*560,x0=R()*W-200,len=300+R()*900,nr=1-Math.min(1,Math.hypot(x0+len/2-1660,y-700)/1400);x.strokeStyle='rgba('+(nr>.4?'255,255,250':'220,255,240')+','+(.05+R()*.14+nr*.2)+')';x.lineWidth=1+R()*6;x.beginPath();x.moveTo(x0,y);x.quadraticCurveTo(x0+len*.5,y-14-R()*34,x0+len,y+R()*12);x.stroke()}x.restore();
  // far ranges, hazed, rimmed by the sun on their right flanks
  const ridge=(base,amp,step,col,rim,seed,lit)=>{const pts=[];let h=0;for(let X=-40;X<=W+40;X+=step){h=h*.55+(R()-.5)*amp;const Y=base-amp*.6-Math.abs(sin(X*.004+seed))*amp*1.1+h;pts.push([X,Y])}x.fillStyle=col;x.beginPath();x.moveTo(-40,H);for(const p of pts)x.lineTo(p[0],p[1]);x.lineTo(W+40,H);x.closePath();x.fill();
   // the faces turned to the sunrise catch the light
   x.fillStyle=lit;for(let i=1;i<pts.length;i++){if(pts[i][1]<pts[i-1][1])continue;const nr=1-Math.min(1,Math.abs(pts[i][0]-1660)/1500);x.globalAlpha=.35+.5*nr;x.beginPath();x.moveTo(pts[i-1][0],pts[i-1][1]);x.lineTo(pts[i][0],pts[i][1]);x.lineTo(pts[i][0]-step*.7,pts[i][1]+amp*.7);x.lineTo(pts[i-1][0]-step*.5,pts[i-1][1]+amp*1.1);x.closePath();x.fill()}x.globalAlpha=1;
   x.strokeStyle=rim;x.lineWidth=3;x.beginPath();for(let i=1;i<pts.length;i++){if(pts[i][1]<pts[i-1][1])continue;x.moveTo(pts[i-1][0],pts[i-1][1]);x.lineTo(pts[i][0],pts[i][1])}x.stroke()};
  ridge(690,130,46,'#82bcb4','rgba(255,255,240,.5)',1.3,'#b8e4d8');{const G=x.createLinearGradient(0,560,0,760);G.addColorStop(0,'rgba(220,250,240,0)');G.addColorStop(1,'rgba(220,250,240,.55)');x.fillStyle=G;x.fillRect(0,560,W,200)}
  ridge(738,100,34,'#4c8e86','rgba(240,255,240,.45)',4.1,'#7cbcae');
  // the sea of cloud
  for(let i=0;i<70;i++){const X=R()*W,Y=712+R()*60,rx=80+R()*240,ry=16+R()*30,nr=1-Math.min(1,Math.abs(X-1660)/1100);const G=x.createLinearGradient(0,Y-ry,0,Y+ry);G.addColorStop(0,'rgba(255,255,255,'+(.35+nr*.5)+')');G.addColorStop(1,'rgba(170,220,210,'+(.2+nr*.2)+')');x.fillStyle=G;x.beginPath();x.ellipse(X,Y,rx,ry,0,0,TAU);x.fill()}
  glow(x,1660,740,500,'#ffffff',.35);
  // the plateau's back rim and a wind-bent tree, all leaning away from the sunrise
  x.fillStyle='#1d5a42';x.beginPath();x.moveTo(0,H);x.lineTo(0,800);for(let X=0;X<=W;X+=30)x.lineTo(X,806-sin(X*.006)*12-(X<420?(420-X)*.08:0));x.lineTo(W,H);x.closePath();x.fill();
  x.strokeStyle='#2c7a58';x.lineWidth=2;for(let i=0;i<500;i++){const X=R()*W,Y=804-sin(X*.006)*12-(X<420?(420-X)*.08:0)+R()*8,h=8+R()*20;x.beginPath();x.moveTo(X,Y);x.quadraticCurveTo(X-h*.2,Y-h*.6,X-h*.6,Y-h);x.stroke()}
  {const tx=230,ty=790;x.strokeStyle='#14281f';x.lineCap='round';x.lineWidth=26;x.beginPath();x.moveTo(tx,ty);x.bezierCurveTo(tx+10,ty-90,tx-30,ty-180,tx-110,ty-240);x.stroke();x.lineWidth=12;x.beginPath();x.moveTo(tx-20,ty-150);x.quadraticCurveTo(tx-80,ty-170,tx-190,ty-190);x.moveTo(tx-70,ty-215);x.quadraticCurveTo(tx-130,ty-280,tx-230,ty-290);x.stroke();
   for(let i=0;i<34;i++){const X=tx-60-R()*280,Y=ty-170-R()*150,rx=30+R()*60,ry=14+R()*22;x.fillStyle=R()<.5?'#1c4a36':'#24603f';x.beginPath();x.ellipse(X,Y,rx,ry,-.2,0,TAU);x.fill();x.fillStyle='rgba(170,255,200,.25)';x.beginPath();x.ellipse(X+rx*.4,Y-ry*.4,rx*.5,ry*.4,-.2,0,TAU);x.fill()}
   for(let i=0;i<16;i++)chip(x,tx-300-R()*500,ty-160-R()*260,R()*3,6+R()*6,'rgba(40,110,80,.8)')}
  // the meadow, lit from the right
  const G=x.createLinearGradient(0,820,0,H);G.addColorStop(0,'#74c08c');G.addColorStop(.25,'#3e9064');G.addColorStop(1,'#123a28');x.fillStyle=G;x.fillRect(0,822,W,H-822);
  const G2=x.createLinearGradient(0,0,W,0);G2.addColorStop(0,'rgba(5,20,14,.35)');G2.addColorStop(.6,'rgba(5,20,14,0)');G2.addColorStop(1,'rgba(230,255,220,.16)');x.fillStyle=G2;x.fillRect(0,822,W,H-822);
  glow(x,960,960,520,'#b8ffd8',.22);
  // wind waves running through the grass
  x.lineCap='round';for(let i=0;i<16;i++){const Y=836+Math.pow(i/15,1.5)*230,x0=R()*W*.7-200;x.strokeStyle='rgba(210,255,225,'+(.06+R()*.08)+')';x.lineWidth=6+i*1.6;x.beginPath();for(let X=x0;X<x0+700+i*30;X+=30)x.lineTo(X,Y+sin(X*.012+i)*6);x.stroke()}
  // blades, leaning left with the gale
  for(let i=0;i<2600;i++){const d=Math.pow(R(),1.5),Y=824+d*258,X=R()*W,h=(8+d*90)*(.6+R()*.7),lt=R();x.strokeStyle=lt<.15?'rgba(200,255,215,.7)':lt<.55?(d<.4?'#3c8a60':'#245e40'):(d<.4?'#2c7550':'#173f2c');x.lineWidth=1+d*3.2;x.beginPath();x.moveTo(X,Y);x.quadraticCurveTo(X-h*.15,Y-h*.6,X-h*(.4+R()*.5),Y-h);x.stroke()}
  for(let i=0;i<180;i++){const d=Math.pow(R(),1.4),Y=830+d*240,X=R()*W;x.fillStyle=R()<.6?'rgba(255,255,255,.85)':'rgba(170,255,210,.85)';x.beginPath();x.arc(X,Y,1.4+d*3.4,0,TAU);x.fill()}
  // a few rocks, and dark grass in the near corners
  for(const[X,Y,s]of[[520,860,1],[1460,880,1.3],[110,960,1.8]]){x.fillStyle='#21443a';x.beginPath();x.moveTo(X-40*s,Y);x.lineTo(X-28*s,Y-26*s);x.lineTo(X+6*s,Y-34*s);x.lineTo(X+38*s,Y-14*s);x.lineTo(X+44*s,Y);x.closePath();x.fill();x.fillStyle='rgba(220,255,230,.3)';x.beginPath();x.moveTo(X+6*s,Y-34*s);x.lineTo(X+38*s,Y-14*s);x.lineTo(X+20*s,Y-10*s);x.closePath();x.fill()}
  x.strokeStyle='#08201a';for(let i=0;i<220;i++){const side=R()<.5,X=side?R()*360:W-R()*360,Y=H+10,h=60+R()*170;x.lineWidth=3+R()*5;x.beginPath();x.moveTo(X,Y);x.quadraticCurveTo(X-h*.2,Y-h*.6,X-h*(.5+R()*.4),Y-h);x.stroke()}
  // loose leaves riding the wind
  for(let i=0;i<26;i++)chip(x,R()*W,120+R()*640,R()*3,5+R()*8,'rgba('+(R()<.5?'60,140,100':'190,255,220')+',.7)')}
 EVC1.add('archer',{
  pal:['#8affc0','#134a38','#ffffff'],eye:'#6affb4',
  C:{coat:'#1d6a50',dark:'#123f31',trim:'#c8ffe6',inner:'#eafff6',boot:'#1e3a32',glove:'#2a4a3e',leg:'#16302a',scarf:null,coatLen:.46},
  wl:WL,wlClose:950,dress,pieces:['chest',[0,-1520,1.55],[-200,-930,.76]],
  // the iris: two gusts chasing each other round the pupil
  glyph(g,cx,cy,rx,ry,k,t){g.globalCompositeOperation='lighter';g.lineCap='round';const e=ry/rx;
   // two tapered gusts wheeling round the pupil
   for(let j=0;j<2;j++){g.globalAlpha=k;g.fillStyle=j?'#c8ffe4':'#f4fff8';g.beginPath();const N=18;for(let i=0;i<=N;i++){const u=i/N,r=rx*(.22+.6*u)+rx*.12*(1-u),a=t*1.8+j*PI+u*2.7;g[i?'lineTo':'moveTo'](cx+cos(a)*r,cy+sin(a)*r*e)}for(let i=N;i>=0;i--){const u=i/N,r=rx*(.22+.6*u)-rx*.02,a=t*1.8+j*PI+u*2.7;g.lineTo(cx+cos(a)*r,cy+sin(a)*r*e)}g.closePath();g.fill()}g.strokeStyle='#eafff4';
   g.lineWidth=rx*.035;g.globalAlpha=k*.6;for(let j=0;j<2;j++){g.beginPath();g.ellipse(cx,cy,rx*.84,ry*.84,0,t*-.7+j*PI,t*-.7+j*PI+2.2);g.stroke()}},
  sky:[[0,'#103c4e'],[.28,'#2f8086'],[.52,'#9ee2cc'],[.66,'#f6fff6'],[.76,'#d4f4e4'],[1,'#123a2c']],
  plate,
  // the gale coils up around the archer: a rising helix, leaves riding it, ripples in the grass
  aura(y,X,Y,k,t){
   // before the change there is no outfit to carry the bow, so in the gather shot (the only one that calls this with k under 1) the bow is drawn here, behind the hand that holds it
   if(k<.95){y.save();y.translate(X+(-120.6+P_GATH.nh[0])*.5,Y+(-1204.5+P_GATH.nh[1])*.5);y.scale(.5,.5);bowAt(y,0,0,GW,t,1);y.restore()}
   if(k<=0)return;y.globalCompositeOperation='lighter';y.lineCap='round';
   for(let j=0;j<2;j++){const rr=(t*.55+j/2)%1;y.globalAlpha=(1-rr)*.45*k;y.strokeStyle=G0;y.lineWidth=5;y.beginPath();y.ellipse(X,Y,200+560*rr,(200+560*rr)*.2,0,0,TAU);y.stroke()}
   for(let j=0;j<4;j++){let px=0,py=0;for(let i=0;i<=36;i++){const h=i/36,a=h*10-t*4.6+j*TAU/4,r=lerp(130,440,Math.pow(h,1.15)),qx=X+cos(a)*r,qy=Y-10-h*700*k+sin(a)*r*.22;if(i){const fr=(sin(a)+1)/2,fd=h<.1?h/.1:1-sm((h-.55)/.32);y.globalAlpha=k*fd*(.18+.5*fr);y.strokeStyle=fr>.6?'#eafff4':G0;y.lineWidth=2+5*fr;y.beginPath();y.moveTo(px,py);y.lineTo(qx,qy);y.stroke()}px=qx;py=qy}}
   y.globalCompositeOperation='source-over';for(let i=0;i<26;i++){const p=(t*.32+i/26)%1,a=p*10-t*4.6+i*2.4,r=lerp(150,560,p),qx=X+cos(a)*r,qy=Y-p*820*k+sin(a)*r*.22;y.globalAlpha=k*sin(p*PI)*.95;chip(y,qx,qy,a*1.3+t*3,9+(i%3)*5,i%3?'#7affb8':'#eafff4')}
   y.globalAlpha=1;y.globalCompositeOperation='lighter';y.strokeStyle='rgba(220,255,236,.5)';for(let i=0;i<10;i++){const L=160+(i*71)%180,xx=((-t*1500+i*397)%2400+2400)%2400-240,yy=Y-30-(i*83)%560;y.globalAlpha=.35*k;y.lineWidth=2+(i%3);y.beginPath();y.moveTo(xx,yy);y.lineTo(xx+L,yy-6);y.stroke()}},
  // the floor mark: a vortex of seven gusts inside a fletched ring
  sigil(y,k,t,R0){if(R0===520&&k===1)heroMode(1);else if(R0===700)heroMode(0);
   // the sigil shot (the only caller at full alpha with a wide mark before the change) has no outfit to carry the bow: a dark bow shape in the hand of the dark figure
   if(y.globalAlpha>.999&&R0>=379&&k<1){y.save();y.scale(1,1/.27);y.translate((-120.6+P_GATH.nh[0])*.36,(-1204.5+P_GATH.nh[1])*.36);y.scale(.36,.36);y.rotate(GW);const L=WL;y.lineCap='round';y.strokeStyle='#06040e';y.lineWidth=30;y.beginPath();y.moveTo(.225*L,-.565*L);y.bezierCurveTo(.02*L,-.36*L,.08*L,-.1*L,0,0);y.bezierCurveTo(.08*L,.1*L,.02*L,.36*L,.225*L,.565*L);y.stroke();y.strokeStyle='rgba(138,255,192,.7)';y.lineWidth=5;y.stroke();y.strokeStyle='rgba(234,255,244,.5)';y.lineWidth=2;y.beginPath();y.moveTo(.225*L,-.565*L);y.lineTo(-.06*L,0);y.lineTo(.225*L,.565*L);y.stroke();y.restore()}
   y.globalCompositeOperation='lighter';y.lineCap='round';y.strokeStyle=G0;y.fillStyle=G0;const L=y.lineWidth,a0=Math.min(1,k*1.4);y.rotate(-t*.5);
   y.globalAlpha=a0;for(const[f,w]of[[1,9],[.9,3],[.4,5],[.12,4]]){y.lineWidth=w;y.beginPath();y.arc(0,0,R0*f,0,TAU);y.stroke()}
   y.lineWidth=4;for(let i=0;i<30;i++){const a=i*TAU/30;y.beginPath();y.moveTo(cos(a-.04)*R0*.92,sin(a-.04)*R0*.92);y.lineTo(cos(a+.03)*R0*.95,sin(a+.03)*R0*.95);y.lineTo(cos(a-.04)*R0*.98,sin(a-.04)*R0*.98);y.stroke()}
   const reach=Math.min(1,k*1.25);for(let j=0;j<7;j++){let px=0,py=0;for(let i=0;i<=15;i++){const u=i/15*reach,rr=R0*(.14+.72*u),a=j*TAU/7+u*2.7,qx=cos(a)*rr,qy=sin(a)*rr;if(i){y.lineWidth=11-9*u;y.strokeStyle=u<.5?'#eafff4':G0;y.beginPath();y.moveTo(px,py);y.lineTo(qx,qy);y.stroke()}px=qx;py=qy}if(reach>.9){y.save();y.translate(px,py);y.rotate(j*TAU/7+2.7+1.4);y.globalAlpha=a0;chip(y,0,0,0,R0*.07,'#eafff4');y.restore()}}
   y.lineWidth=L},
  pose:{gather:P_GATH,piece:P_PIECE,hero:P_HERO,windup:P_WIND},
  // the Mythic wakes: an arrow of light is drawn along the bow, and the first gust goes by
  // (the frame is repainted here, so the bow is this file's own leaf-tipped one, fully in frame)
  spark(x,c,A){const u=c.u,sc=.6,BL=WL*sc,a=-.3+u*.06,X=lerp(600,540,u),Y=600,run=A.ez(cl((c.t-.05)/.85,0,1)),T=c.T;
   A.bg(x,c,.8,1);
   A.view(x,c.C,1,y=>{const ca=cos(a),sa=sin(a);A.glow(y,X,Y,260,G0,.22+.1*sin(T*7));
    // leaves wheeling round the grip from the first frame
    for(let i=0;i<7;i++){const b=i*TAU/7+T*2.6,r=150+(i%3)*45;y.globalAlpha=.85;chip(y,X+cos(b)*r,Y+sin(b)*r*.7,b+1.6,9+(i%3)*4,i%2?'#7affb8':'#eafff4')}y.globalAlpha=1;
    y.save();y.translate(X,Y);y.scale(sc,sc);bowAt(y,0,0,a,T,1);y.restore();
    const n0=[X-ca*BL*.1,Y-sa*BL*.1],e=lerp(-.1,1.25,run),hd=[X+ca*BL*e,Y+sa*BL*e];
    if(run>.01){arrow(y,n0[0],n0[1],hd[0],hd[1],11,T,.35*run);A.glow(y,hd[0],hd[1],170,G0,.6);A.glow(y,hd[0],hd[1],44,'#ffffff',.9);A.sparks(y,11,c.t-.05,hd[0],hd[1],22,520,'#eafff4',.5,400)}});
   A.motes(x,3,T,40,0,0,A.W,A.H,G0,5,-30,.6*u);
   x.save();x.globalCompositeOperation='lighter';x.lineCap='round';for(let i=0;i<14;i++){const xx=((-c.T*2200+i*523)%2600+2600)%2600-300,yy=80+(i*137)%900,L=200+(i*91)%300;x.globalAlpha=.3;x.strokeStyle=i%3?G0:'#ffffff';x.lineWidth=1.5+(i%3);x.beginPath();x.moveTo(xx,yy);x.quadraticCurveTo(xx+L*.5,yy-10,xx+L,yy-4);x.stroke()}x.restore();
   x.save();for(let i=0;i<10;i++){const p=((c.t*.7+i*.1)%1),xx=W0(1-p)+((i*173)%300),yy=200+(i*97)%700+sin(c.T*3+i)*40;x.globalAlpha=.85;chip(x,xx,yy,c.T*4+i,8+(i%3)*4,i%2?'#7affb8':'#d8fff0')}x.restore()},
  // each new piece: leaves wheel in from the edges and settle on it
  piece(x,c,A,i){const t=c.t;x.save();for(let j=0;j<16;j++){const p=ease(t/.6),r=lerp(1100,520+(j%3)*60,p),a=j*TAU/16+t*(3+i)+i,px=960+cos(a)*r,py=540+sin(a)*r*.62;x.globalAlpha=t<.6?.9:Math.max(0,.9-(t-.6)*4);chip(x,px,py,a+1.6,12+(j%3)*5,j%3?'#7affb8':'#eafff4')}
   // as it lands, one gust sweeps across the frame, right to left
   if(t>.5){const v=(t-.5)/.4;x.globalCompositeOperation='lighter';x.lineCap='round';for(let j=0;j<7;j++){const y0=[24,62,880,930,980,1030,1066][j],xh=2100-2600*ease(v)-j*60,L=500+(j%3)*200;x.globalAlpha=Math.max(0,.5*(1-v));x.strokeStyle=j%2?G0:'#eafff4';x.lineWidth=3+(j%3)*2;x.beginPath();x.moveTo(xh,y0);x.quadraticCurveTo(xh+L*.5,y0-30,xh+L,y0-6);x.stroke()}}x.restore()},
  // the moment it becomes real: black leaves torn past the silhouette, ribbons of gale low across the light
  burst(y,k,t,A){heroMode(0);y.globalCompositeOperation='lighter';y.lineCap='round';for(let j=0;j<6;j++){const y0=620+j*80;y.globalAlpha=.55*k;y.strokeStyle='#ffffff';y.lineWidth=4+j*4;y.beginPath();for(let X=-60;X<=1980;X+=40)y.lineTo(X,y0+sin(X*.006+t*6+j)*30-X*.03);y.stroke()}
   y.globalCompositeOperation='source-over';y.globalAlpha=1;for(let i=0;i<30;i++){const p=((t*.9+i/30)%1),X=2000-p*2200,Y=150+(i*131)%850+sin(t*4+i)*60;chip(y,X,Y,t*6+i,14+(i%4)*8,'#020806')}},
  // the wind-up: the gale is pulled into the arrowhead
  windup(x,c,A){const o=S.out;if(!o||!o.drawn)return;const k=A.ez(c.u);A.view(x,c.C,1,y=>{const s=.95,X=A.W/2+60*s,Y=A.H/2+1150*s,P=b=>[X+b[0]*s,Y+b[1]*s],tp=P(o.tip),ca=cos(o.wa),sa=sin(o.wa);
   y.save();y.globalCompositeOperation='lighter';y.lineCap='round';for(let i=0;i<30;i++){const f=(c.t*1.7+i*.137)%1,b=i*2.399,r1=60+900*(1-f),r2=r1+60+200*(1-f);y.globalAlpha=f*.75;y.strokeStyle=i%3?G0:'#ffffff';y.lineWidth=2+(i%3)*1.5;y.beginPath();y.moveTo(tp[0]+cos(b)*r2,tp[1]+sin(b)*r2);y.lineTo(tp[0]+cos(b)*r1,tp[1]+sin(b)*r1);y.stroke()}y.restore();
   A.glow(y,tp[0],tp[1],140+120*k,G0,.45+.4*k);A.glow(y,tp[0],tp[1],46+20*k,'#ffffff',.9);
   for(let i=0;i<12;i++){const f=(c.t*1.3+i/12)%1,b=i*2.1+c.T,r=40+600*(1-f);y.globalAlpha=f;chip(y,tp[0]+cos(b)*r,tp[1]+sin(b)*r,b+1.6,10+(i%3)*4,i%2?'#7affb8':'#eafff4')}y.globalAlpha=1;
   if(c.t>.5&&c.t<.75){const v=(c.t-.5)/.25;y.save();y.globalCompositeOperation='lighter';y.globalAlpha=1-v;y.fillStyle='#ffffff';y.beginPath();y.ellipse(tp[0],tp[1],420*(1-v*.4),5,o.wa,0,TAU);y.fill();y.restore()}})},
  // Galeshot: the draw, the release with a recoil step back, the gale spiral across the sky, the cyclone, the burst
  sig:{hits:[.42,1.2,1.95],draw(x,c,A){const t=c.t,h0=.42,h1=1.2,h2=1.95,AIM=-.2,ca=cos(AIM),sa=sin(AIM),Y0=1010,sc=.5,XS=450;
   const rec=t<h0?0:A.eo((t-h0)/.45),X0=XS-120*rec;A.bg(x,c,.22+(t>h1?.1:0)-(t>h0&&t<h0+.2?.1:0));
   // the bow hand at the release, and the place in the sky where the gale turns into a cyclone
   const O=[XS+(NSb[0]+560*ca)*sc,Y0+(NSb[1]+50+560*sa)*sc],V=[O[0]+800*ca,O[1]+800*sa],nx=-sa,ny=ca;
   const preP=u=>aimP(AIM,{Dd:lerp(200,300,u),p:{py:50,lean:-.06,nf:[-200,0],ff:[230,0],hd:{yaw:.32,eye:{open:.7,angry:.8,look:[.6,-.1],pupil:.8},brow:{angry:.85},mouth:{open:.05,smile:-.2}}}});
   A.view(x,c.C,1,y=>{y.lineCap='round';
    // the cyclone
    if(t>h1-.08){const v=t-h1,k=A.eo((v+.08)/.5),fade=t<h2+.15?1:1-sm((t-h2-.15)/.4),R0=540*k*(t<h2?1:1+.8*A.eo((t-h2)/.35)),spin=v*7.5+(t>h2?(t-h2)*16:0);if(fade>0){y.save();y.globalCompositeOperation='lighter';
     A.glow(y,V[0],V[1],R0*.95,G0,.45*fade);
     // nine arms, each in three strokes that thin and cool towards the rim; on the last hit they are flung outward
     for(let j=0;j<9;j++)for(let s=0;s<3;s++){y.beginPath();for(let i=0;i<=8;i++){const u=(s+i/8)/3,rr=R0*(.07+.93*u),a=j*TAU/9-u*3.6+spin;y[i?'lineTo':'moveTo'](V[0]+cos(a)*rr,V[1]+sin(a)*rr*.58)}y.globalAlpha=fade*(.95-.25*s);y.strokeStyle=s==0?'#ffffff':j%3?G0:'#d8fff0';y.lineWidth=(15-5*s)*(j%2?1.4:.9);y.stroke()}
     A.glow(y,V[0],V[1],170*k,'#ffffff',.9*fade);
     y.globalCompositeOperation='source-over';for(let i=0;i<48;i++){const p=((v*.9+i/48)%1),rr=R0*1.4*(1-p)+24,a=i*2.4+p*8+v*3,qx=V[0]+cos(a)*rr,qy=V[1]+sin(a)*rr*.58;y.globalAlpha=fade*Math.min(1,p*4);chip(y,qx,qy,a*2,6+(i%4)*4,i%6==0?'#4a3a26':i%2?'#2e8a5e':'#d8fff0')}y.restore()}}
    // the gale spiral wound round the arrow's path
    if(t>h0){const d=4300*(t-h0),dEnd=Math.min(d,2400),trA=t<h1?1:1-sm((t-h1)/.35);if(trA>0){y.save();y.globalCompositeOperation='lighter';const d0=110;
     y.globalAlpha=trA*.32;y.strokeStyle=G0;y.lineWidth=46*(1-cl((t-h0)/.8,0,.7));y.beginPath();y.moveTo(O[0]+ca*d0,O[1]+sa*d0);y.lineTo(O[0]+ca*dEnd,O[1]+sa*dEnd);y.stroke();y.globalAlpha=trA;y.strokeStyle='#ffffff';y.lineWidth=10*(1-cl((t-h0)/.9,0,.8));y.stroke();
     for(let j=0;j<3;j++){const pts=[];for(let dd=d0;dd<=dEnd;dd+=24){const age=t-h0-dd/4300,r=(10+230*ease(age/.7))*(.3+.7*cl((dd-d0)/700,0,1)),ph=dd*.011-t*15+j*TAU/3,sp=sin(ph);pts.push([O[0]+ca*dd+nx*r*sp,O[1]+sa*dd+ny*r*sp,cos(ph)])}
      y.globalAlpha=trA*.4;y.strokeStyle=G0;y.lineWidth=7;y.beginPath();pts.forEach((p,i)=>y[i?'lineTo':'moveTo'](p[0],p[1]));y.stroke();
      y.strokeStyle='#f4fff8';for(let i=1;i<pts.length;i++){const fr=pts[i][2];if(fr<.1)continue;y.globalAlpha=trA*(.3+.65*fr);y.lineWidth=2+7*fr;y.beginPath();y.moveTo(pts[i-1][0],pts[i-1][1]);y.lineTo(pts[i][0],pts[i][1]);y.stroke()}}
     for(const dd of[320,720,1120]){if(d<dd)continue;const age=t-h0-dd/4300,rr=30+190*A.eo(age/.5);y.globalAlpha=trA*Math.max(0,.55-age*.8);y.strokeStyle='#eafff4';y.lineWidth=4;y.beginPath();y.ellipse(O[0]+ca*dd,O[1]+sa*dd,rr*.3,rr,AIM,0,TAU);y.stroke()}
     // torn cloud racing along the line
     for(let i=0;i<20;i++){const off=((i*97)%640)-320,s0=((t-h0)*2600+i*311)%2400,L=140+(i*53)%260,bx=O[0]+ca*(s0-300)+nx*off,by=O[1]+sa*(s0-300)+ny*off;y.globalAlpha=trA*.32;y.strokeStyle='#eafff4';y.lineWidth=2+(i%3)*2;y.beginPath();y.moveTo(bx,by);y.lineTo(bx+ca*L,by+sa*L);y.stroke()}
     if(d<2400){const hx=O[0]+ca*(d+220),hy=O[1]+sa*(d+220);y.globalCompositeOperation='source-over';y.globalAlpha=1;arrow(y,hx-ca*250,hy-sa*250,hx,hy,9,c.T,.5);A.glow(y,hx,hy,230,G0,.8);A.glow(y,hx,hy,70,'#ffffff',1)}
     y.restore()}}
    // the burst: a ring of wind across everything, leaves flung out
    if(t>h2){const v=(t-h2)/.6;if(v<1){y.save();y.globalCompositeOperation='lighter';const rr=150+2700*A.eo(v);y.globalAlpha=(1-v)*.9;y.strokeStyle='#ffffff';y.lineWidth=36*(1-v)+4;y.beginPath();y.ellipse(V[0],V[1],rr,rr*.58,0,0,TAU);y.stroke();y.strokeStyle=G0;y.lineWidth=30*(1-v)+2;y.beginPath();y.ellipse(V[0],V[1],rr*.8,rr*.46,0,0,TAU);y.stroke();y.restore()}
     // the core flash, radial speed lines and white shards: the cyclone blows apart
     const v2=t-h2;if(v2<.25){A.glow(y,V[0],V[1],lerp(600,900,v2/.25),'#ffffff',1-v2/.25);A.glow(y,V[0],V[1],260,'#ffffff',1-v2/.25)}
     if(v2<.45)A.speedLines(y,V[0],V[1],57,t,'rgba(255,255,255,.95)',.85*(1-v2/.45),48,180+900*v2);
     if(v2<.7){y.save();y.globalCompositeOperation='lighter';y.fillStyle='#ffffff';for(let i=0;i<22;i++){const a=i*2.399+.3,sp=900+(i*173)%900,d=60+sp*v2,len=70+(i%4)*40,wd=6+(i%3)*4,px=V[0]+cos(a)*d,py=V[1]+sin(a)*d*.62;y.globalAlpha=Math.max(0,1-v2/.7);y.beginPath();y.moveTo(px+cos(a)*len,py+sin(a)*len*.62);y.lineTo(px-sin(a)*wd,py+cos(a)*wd);y.lineTo(px-cos(a)*len*.4,py-sin(a)*len*.25);y.lineTo(px+sin(a)*wd,py-cos(a)*wd);y.closePath();y.fill()}y.restore()}
     A.painter(y,'ring',V[0],V[1],900,(t-h2)/1.1,0,3,8);A.sparks(y,77,t-h2,V[0],V[1],70,1500,G0,.9,300);
     y.save();for(let i=0;i<24;i++){const v2=t-h2,a=i*2.4,sp=500+(i*137)%700,qx=V[0]+cos(a)*sp*v2,qy=V[1]+sin(a)*sp*v2*.6+260*v2*v2;y.globalAlpha=Math.max(0,1-v2*1.1);chip(y,qx,qy,a+v2*8,9+(i%3)*5,i%2?'#7affb8':'#eafff4')}y.restore()}
    // the archer: a step back on the release, an afterimage left where the shot was aimed from
    A.sigil(y,X0,Y0,lerp(260,560,rec),t<h0?.5:Math.max(0,1-(t-h0)*.8),c.T,.7);
    if(t>h0&&t<h0+.55){const v=(t-h0)/.55;S.arrow=0;A.hero(c,y,XS+30*v,Y0,sc,preP(1),{wind:1,act:{sil:1,silC:'#bfffe0',a:.55*(1-v)}})}
    let P;S.wa=null;if(t<h0){S.arrow=1;S.vib=0;P=preP(A.ez(t/h0))}
    else{const lo=0,sh=t>h1-.05&&t<h1+.35;S.arrow=0;S.vib=Math.max(0,1-(t-h0)*1.6);const a=aimP(AIM,{p:{py:50+40*rec,lean:-.06-.08*rec,nf:[-200-40*rec,0],ff:[230+60*rec,0],hd:{yaw:.32+.06*rec,eye:{open:.85,angry:.6,look:[.7,-.3]},brow:{angry:.6},mouth:{open:sh?.42:.08,smile:-.1}}}});a.fh=[-30,240];
     P=Object.assign({},a);if(lo>0){S.wa=lerp(AIM,LOW,lo);P.nh=[lerp(a.nh[0],-110,lo),lerp(a.nh[1],500,lo)];P.fh=[lerp(a.fh[0],60,lo),lerp(a.fh[1],430,lo)];P.lean=lerp(a.lean,.02,lo);P.py=lerp(a.py,20,lo);P.nf=[lerp(a.nf[0],-120,lo),0];P.ff=[lerp(a.ff[0],150,lo),0];P.hd={yaw:lerp(.38,.2,lo),eye:{open:.9,angry:lerp(.6,.2,lo),look:[lerp(.7,.1,lo),lerp(-.3,0,lo)]},brow:{angry:lerp(.6,.15,lo)},mouth:{open:0,smile:.2*lo}}}}
    A.hero(c,y,X0,Y0,sc,P,{wind:t<h0?.7+.4*t:1.05+(t>h1&&t<h2?.3:0),act:{rim:[G0,1,-8,-3]}});const out=S.out;S.arrow=1;S.vib=0;S.wa=null;
    if(t<h0&&out&&out.drawn){const tp=[X0+out.tip[0]*sc,Y0+out.tip[1]*sc],k=t/h0;A.glow(y,tp[0],tp[1],90+150*k,G0,.4+.5*k);A.glow(y,tp[0],tp[1],30+30*k,'#ffffff',.9);
     y.save();y.globalCompositeOperation='lighter';for(let i=0;i<22;i++){const f=(t*2.2+i*.137)%1,b=i*2.399,r1=30+600*(1-f);y.globalAlpha=f*.7;y.strokeStyle=i%3?G0:'#ffffff';y.lineWidth=2+(i%3);y.beginPath();y.moveTo(tp[0]+cos(b)*(r1+140*(1-f)),tp[1]+sin(b)*(r1+140*(1-f)));y.lineTo(tp[0]+cos(b)*r1,tp[1]+sin(b)*r1);y.stroke()}y.restore()}
    // recoil: the heels plough the grass and kick up a spray of blades
    if(t>h0&&t<h0+.9){const v=t-h0;A.sparks(y,31,v,X0+60,Y0-6,26,520,'#bfffd8',.6,1400);A.sparks(y,32,v,X0-80,Y0-6,20,420,'#4a9a6a',.7,1400)}
    if(t>h0&&t<h0+.35)A.speedLines(y,O[0],O[1],41,t,'rgba(234,255,244,.9)',.6*(1-(t-h0)/.35),40,260)});
   if(A.lit(t,h0,.07)||A.lit(t,h1,.06)||A.lit(t,h2,.06))A.impact(x);if(t>h2&&t<h2+.3)A.rect(x,'#eafff4',.18*(1-(t-h2)/.3));if(t>h0&&t<h0+.12)A.rect(x,'#ffffff',.3*(1-(t-h0)/.12))}}
 });
 function W0(p){return -200+p*2400}
})()}catch(e){console.error('EVC archer',e)}
