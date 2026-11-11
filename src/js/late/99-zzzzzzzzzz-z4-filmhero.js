// ===== FILM1: the film model. The game's character is a small chibi figure, right for play but unable to act: no eyelids, no mouth shapes, a fixed side view.
// This draws the SAME person (hair style and colour, eyes, skin, body type, read from the player's own character) at film quality: a head that turns in 3D, real eyelids, brows, gaze, lip shapes and tears,
// anime proportions, tapered limbs solved with two-bone IK. Used only by the class story movies (MOVIE1); the game's own figure is untouched and costs nothing extra.
// Units: head height (crown to chin) is 260. head() is centred on the middle of the skull; body() stands on its feet at the origin. Everything is resolution-independent vector art. =====
try{window.FILM1=(()=>{
 const TAU=6.2832,cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,sin=Math.sin,cos=Math.cos;
 const sh=(c,k)=>AC6.shade(c,k),hh=i=>{const v=sin(i*12.9898+7.3)*43758.5453;return v-Math.floor(v)};
 const INK='#2a1a30';
 const hex=c=>{const p=parseInt(c.slice(1),16);return[p>>16,p>>8&255,p&255]},mix=(a,b,k)=>{const A=hex(a),B=hex(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')},dk=(c,k)=>mix(c,'#1a0c26',k),lt=(c,k)=>mix(c,'#ffffff',k),warm=(c,k)=>mix(c,'#b85a68',k);
 const HS=[{back:'short',top:5,th:10,bang:5,sw:1},{back:'tail',top:3,th:6,bang:5,sw:1},{back:'short',top:0,th:0,bang:7,sw:-1},{back:'shoulder',top:6,th:13,bang:6,sw:1},{back:'none',top:3,th:5,bang:3,sw:1},{back:'long',top:4,th:8,bang:6,sw:1},{back:'none',top:0,th:2,bang:3,sw:1},{back:'shoulder',top:2,th:4,bang:8,sw:-1},{back:'straight',top:0,th:0,bang:6,sw:1},{back:'twin',top:0,th:2,bang:6,sw:-1}];
 const look=()=>{const L=AC6.info(typeof window.look!='undefined'?window.look:null,'me',true);return L};
 // ---- a tapered, bent lock of hair as a Path2D
 function lock(x0,y0,x1,y1,w,bend,p){p=p||new Path2D();const dx=x1-x0,dy=y1-y0,D=Math.hypot(dx,dy)||1,nx=-dy/D,ny=dx/D,mx=(x0+x1)/2+nx*bend,my=(y0+y1)/2+ny*bend;
  p.moveTo(x0+nx*w,y0+ny*w);p.quadraticCurveTo(mx+nx*w*.82,my+ny*w*.82,x1,y1);p.quadraticCurveTo(mx-nx*w*.74,my-ny*w*.74,x0-nx*w,y0-ny*w);p.closePath();return p}
 const hgr=(g,c,y0,y1)=>{const G=g.createLinearGradient(0,y0,0,y1);G.addColorStop(0,lt(c,.22));G.addColorStop(.34,lt(c,.06));G.addColorStop(.72,c);G.addColorStop(1,dk(c,.24));return G};
 // ---- the eye: a real opening with lids, a layered iris, catch-lights, lashes
 function eye(g,L,E,cx,cy,w,h,side,gd){
  const A0=g.globalAlpha,es=L.es|0,open=cl(E.open==null?1:E.open,0,1.25),ang=(E.angry||0)+(es==2?.3:es==0?.16:0)-(E.soft||0)*.3,ln=INK,col=E.col||L.eyeCol;
  const ox=cx+side*w,oy=cy-h*(.1+ang*.34),ix=cx-side*w*.94,iy=cy+h*(.2+ang*.18);
  if(open<.16){ // closed: one soft curved line with a little wing, lashes down
   g.strokeStyle=ln;g.lineCap='round';g.lineWidth=h*.14;g.beginPath();g.moveTo(ox,oy+h*.3);g.quadraticCurveTo(cx,cy+h*.86,ix,iy+h*.08);g.stroke();
   g.lineWidth=h*.07;g.beginPath();g.moveTo(ox,oy+h*.3);g.lineTo(ox+side*w*.22,oy+h*.1);g.stroke();
   if(gd==2){g.lineWidth=h*.05;for(let i=0;i<3;i++){const u=.2+i*.2,x=lerp(ox,ix,u),y=lerp(oy+h*.3,iy,u)+h*.3*sin(u*3.14);g.beginPath();g.moveTo(x,y);g.lineTo(x+side*w*.1,y+h*.2);g.stroke()}}
   return}
  const pk=cy-h*open*(1.04-ang*.34),pkx=cx+side*w*(.16-ang*.1),botY=cy+h*.88*cl(open+.1,.3,1),U=()=>{g.moveTo(ox,oy);g.quadraticCurveTo(pkx,2*pk-(oy+iy)/2,ix,iy)},shape=new Path2D();
  shape.moveTo(ox,oy);shape.quadraticCurveTo(pkx,2*pk-(oy+iy)/2,ix,iy);shape.quadraticCurveTo(cx-side*w*.08,2*botY-(oy+iy)/2,ox,oy);shape.closePath();
  g.save();g.clip(shape);g.fillStyle='#fdfaff';g.fill(shape);
  const lk=E.look||[0,0],irx=cx+lk[0]*w*.34-side*w*.02,iry=cy+h*.12+lk[1]*h*.26,rx=w*.68,ry=h*.98;
  // iris: deep at the top, lit at the bottom, like glass with light going through it
  const I=g.createLinearGradient(0,iry-ry,0,iry+ry);I.addColorStop(0,sh(col,-.72));I.addColorStop(.38,sh(col,-.3));I.addColorStop(.72,col);I.addColorStop(1,sh(col,.55));g.fillStyle=I;g.beginPath();g.ellipse(irx,iry,rx,ry,0,0,TAU);g.fill();
  g.strokeStyle=sh(col,-.8);g.lineWidth=h*.06;g.stroke();
  g.strokeStyle=sh(col,.45);g.globalAlpha=A0*.32;g.lineWidth=h*.022;g.beginPath();for(let i=0;i<20;i++){const a=.25+i/19*2.65,r0=.5,r1=.9;g.moveTo(irx+cos(a)*rx*r0,iry+sin(a)*ry*r0);g.lineTo(irx+cos(a)*rx*r1,iry+sin(a)*ry*r1)}g.stroke();g.globalAlpha=A0;
  const pup=E.pupil==null?1:E.pupil;g.fillStyle=sh(col,-.88);g.beginPath();g.ellipse(irx,iry+h*.02,rx*.44*pup,ry*.5*pup,0,0,TAU);g.fill();
  if(E.iris)E.iris(g,irx,iry,rx,ry);
  g.globalAlpha=A0*.6;g.fillStyle=sh(col,.7);g.beginPath();g.ellipse(irx,iry+ry*.66,rx*.62,ry*.2,0,0,TAU);g.fill();g.globalAlpha=A0;
  // the shadow the upper lid throws on the eyeball
  g.fillStyle='rgba(58,28,92,.42)';g.beginPath();g.moveTo(ox-side*2,oy-h);g.lineTo(ix,iy-h*1.2);g.lineTo(ix,iy+h*.14);g.quadraticCurveTo(pkx,2*(pk+h*.42)-(oy+iy)/2,ox,oy+h*.18);g.closePath();g.fill();
  // catch-lights
  g.fillStyle='#fff';g.beginPath();g.ellipse(irx-side*-rx*.0-rx*.34,iry-ry*.42,rx*.34,ry*.25,-.35,0,TAU);g.fill();g.globalAlpha=A0*.92;g.beginPath();g.arc(irx+rx*.42,iry+ry*.36,rx*.14,0,TAU);g.fill();g.globalAlpha=A0*.55;g.beginPath();g.arc(irx-rx*.5,iry+ry*.24,rx*.08,0,TAU);g.fill();g.globalAlpha=A0;
  if(E.wet){g.globalAlpha=A0*.55*E.wet;g.fillStyle='#fff';g.beginPath();g.ellipse(cx,botY-h*.12,w*.8,h*.1,0,0,TAU);g.fill();g.globalAlpha=A0}
  g.restore();
  // upper lash line: heavy at the outer corner, tapering to nothing at the inner
  g.fillStyle=ln;g.beginPath();g.moveTo(ox+side*w*.16,oy-h*.1);g.quadraticCurveTo(pkx,2*(pk-h*.13)-(oy+iy)/2-h*.02,ix-side*w*.02,iy);g.quadraticCurveTo(pkx,2*pk-(oy+iy)/2,ox,oy+h*.04);g.closePath();g.fill();
  // crease, lower lash
  g.strokeStyle='rgba(90,40,60,.5)';g.lineCap='round';g.lineWidth=h*.035;g.beginPath();g.moveTo(ox-side*w*.1,oy-h*.3);g.quadraticCurveTo(pkx,2*(pk-h*.32)-(oy+iy)/2,ix+side*w*.34,iy-h*.5);g.stroke();
  g.strokeStyle=ln;g.lineWidth=h*.05;g.beginPath();g.moveTo(ox-side*w*.02,oy+h*.1);g.quadraticCurveTo(cx+side*w*.56,botY+h*.03,cx+side*w*.06,botY+h*.02);g.stroke();
  if(gd==2){g.lineWidth=h*.05;for(const[u,l]of[[.02,.34],[.13,.3],[.25,.22]]){const x=lerp(ox,ix,u),y=lerp(oy,iy,u)-h*.16*sin(u*3.14)*open;g.beginPath();g.moveTo(x,y);g.lineTo(x+side*w*l,y-h*l*.74);g.stroke()}}
 }
 // ---- the back of the hair: behind the neck and shoulders
 function hairBack(g,L,o){const h=HS[L.hs]||HS[0],c=dk(L.hair,.14),ln=dk(L.hair,.6),t=o.t||0,wnd=o.wind||0,w1=sin(t*1.7)*5+wnd*24;
  if(h.back=='none')return;
  const mass=new Path2D(),strandsL=[];
  if(h.back=='twin'){for(const s of[-1,1]){const x0=s*118,k=sin(t*1.6+s)*7+wnd*30;const P0=new Path2D();P0.moveTo(x0-s*18,-86);P0.bezierCurveTo(x0+s*64,-92,x0+s*88+k*.3,120,x0+s*40+k,430);P0.lineTo(x0+s*26+k,496);P0.lineTo(x0+s*12+k,424);P0.lineTo(x0-s*12+k,470);P0.bezierCurveTo(x0-s*22+k*.4,250,x0-s*30,60,x0-s*18,-22);P0.closePath();g.fillStyle=hgr(g,c,-90,500);g.fill(P0);g.strokeStyle=ln;g.lineWidth=2;g.stroke(P0);
    g.strokeStyle=dk(c,.4);g.globalAlpha=.6;g.lineWidth=1;g.beginPath();g.moveTo(x0+s*10,-60);g.quadraticCurveTo(x0+s*44,160,x0+s*12+k,420);g.moveTo(x0+s*34,-40);g.quadraticCurveTo(x0+s*62,150,x0+s*30+k,440);g.stroke();g.globalAlpha=1;
    g.fillStyle=lt(L.hair,.15);g.beginPath();g.ellipse(x0-s*2,-74,20,14,s*.5,0,TAU);g.fill();g.strokeStyle=ln;g.stroke()}return}
  const len=h.back=='tail'?0:({short:96,long:520,straight:640,shoulder:240}[h.back]||96),wide=h.back=='short'?122:h.back=='shoulder'?134:130;
  if(h.back=='tail'){const k=sin(t*1.7)*16+wnd*46;mass.moveTo(-74,-120);mass.bezierCurveTo(-236,-140,-292+k*.4,120,-212+k,350);mass.lineTo(-206+k,420);mass.lineTo(-174+k,352);mass.lineTo(-146+k,410);mass.bezierCurveTo(-142+k*.5,240,-138,70,-82,20);mass.closePath()}
  else{mass.moveTo(-108,-90);mass.bezierCurveTo(-wide-22,0,-wide-18+w1*.3,len*.55,-wide+34+w1,len);const n=7,xa=-wide+34+w1,xb=wide-42+w1*.6;for(let i=1;i<=n;i++){const u=i/n,x=lerp(xa,xb,u),xm=lerp(xa,xb,u-.5/n);mass.quadraticCurveTo(xm-10,len+10,xm,len+40+30*hh(i+n));mass.quadraticCurveTo(xm+12,len+8,x,len-(i<n?22:0))}mass.bezierCurveTo(wide+18,len*.55,wide+18,0,108,-90);mass.closePath()}
  g.fillStyle=hgr(g,c,-100,len?len+30:420);g.fill(mass);g.strokeStyle=ln;g.lineWidth=2.2;g.stroke(mass);
  if(len){g.save();g.clip(mass);g.strokeStyle=dk(c,.42);g.globalAlpha=.55;g.lineWidth=1.3;g.beginPath();for(let i=0;i<9;i++){const u=i/8,x=lerp(-wide+24,wide-24,u);g.moveTo(x*.6,-60);g.quadraticCurveTo(x*1.02+w1*.3,len*.5,x+w1*.8,len+12)}g.stroke();g.globalAlpha=1;g.restore()}
 }
 // ---- the hair over the face: a smooth cap, then the fringe drawn as whole contours (no lock-by-lock outlines), thin side locks, tufts
 function fringe(n,y0,sw,cx,w1,bl,seed,spread){const p=new Path2D(),edge=new Path2D(),L0=-(spread||110)+cx*.2,R0=(spread||110)+cx*.2,T=[];
  // the top follows the skull, inside the cap, so nothing pokes out
  p.moveTo(L0-2,-46);p.bezierCurveTo(L0+14,-146,R0-14,-146,R0+2,-46);edge.moveTo(R0+2,-46);let px=R0+2,py=-46;
  for(let i=n-1;i>=0;i--){const u=(i+.5)/n,xm=lerp(L0,R0,u),wd=(R0-L0)/n,lean=sw*(10+22*u)+w1,tx=xm+lean+cx*.5,dep=1-Math.abs(u-.5)*.5,ty=y0+bl+(hh(i*3+seed)-.5)*26+(i%2?12:-8)*dep;const vx=xm-wd*.5,vy=-74+bl*.35-(hh(i+seed*2)*26);
   for(const q of[p,edge]){q.quadraticCurveTo(xm+wd*.52+lean*.3,lerp(ty,-46,.62),tx,ty);q.quadraticCurveTo(xm-wd*.14+lean*.3,lerp(ty,vy,.74),vx,vy)}T.push([vx,vy,tx,ty,xm])}
  p.lineTo(L0-2,-46);p.closePath();edge.lineTo(L0-2,-46);return{p,T,edge}}
 function hairFront(g,L,o){const h=HS[L.hs]||HS[0],c=L.hair,ln=dk(c,.62),t=o.t||0,wnd=o.wind||0,sy=sin(o.yaw||0),sw=h.sw,cx=sy*38,w1=sin(t*2.1)*2.4+wnd*12,G=hgr(g,c,-168,44),bl=(h.bang-6)*9;
  const cap=new Path2D();cap.moveTo(-122,14);cap.bezierCurveTo(-140,-98,-76,-164,4,-164);cap.bezierCurveTo(92,-164,142,-94,120,14);cap.lineTo(100,-38);cap.quadraticCurveTo(cx,-110,-100,-38);cap.closePath();
  const sl=h.back=='none'?-6:h.back=='short'?50:h.back=='shoulder'?100:150,sides=[lock(-100,-84,-120+w1,sl,22,22),lock(-110,-44,-132+w1*1.4,sl*.66,12,24),lock(102,-84,114+w1*.6+sy*8,sl*.9,19,-20),lock(112,-44,125+w1+sy*8,sl*.56,10,-20)];
  const tufts=[];if(h.top){const m=Math.min(h.top,4);for(let i=0;i<m;i++){const u=(i+.5)/m,X=lerp(-76,76,u),Hh=(10+h.th*4)*(.72+.42*sin(i*2.3+.7)),ry=-150+Math.abs(u-.5)*40;tufts.push(lock(X,ry,X+sw*(26+u*18)+w1*1.5,ry-18-Hh,15,sw*14))}}
  const backF=fringe(6,-12,sw,cx,w1*.8,bl,5),F=fringe(7,-30,sw,cx,w1,bl,1),all=new Path2D();all.addPath(cap);for(const p of sides)all.addPath(p);for(const p of tufts)all.addPath(p);all.addPath(backF.p);all.addPath(F.p);
  g.save();g.lineJoin='round';
  if(o.rim&&o.rim.a){g.save();g.strokeStyle=o.rim.c;g.globalAlpha=o.rim.a;g.lineWidth=12;g.stroke(all);g.restore()}
  g.strokeStyle=ln;g.lineWidth=3.6;g.stroke(all);
  g.fillStyle=G;for(const p of tufts)g.fill(p);for(const p of sides)g.fill(p);g.fillStyle=hgr(g,dk(c,.16),-168,50);g.fill(backF.p);g.fillStyle=G;g.fill(cap);g.fill(F.p);
  g.strokeStyle=ln;g.lineWidth=2.4;g.stroke(F.edge);
  // short ink lines rising from each valley into the mass, thin, tapering: this is what makes it read as locks of hair
  g.save();g.clip(all);g.lineCap='round';for(const[vx,vy,tx,ty,xm]of F.T){g.strokeStyle=dk(c,.46);g.globalAlpha=.62;g.lineWidth=1.5;g.beginPath();g.moveTo(vx,vy+4);g.quadraticCurveTo(vx+sw*4,vy-22,vx+sw*2+(xm-vx)*.2,vy-42);g.stroke();
   g.strokeStyle=dk(c,.38);g.globalAlpha=.34;g.lineWidth=1.3;g.beginPath();g.moveTo(xm+(tx-xm)*.52,lerp(vy,ty,.6));g.quadraticCurveTo(xm+(tx-xm)*.2,lerp(vy,ty,.2),xm-sw*3,vy-40);g.stroke()}g.globalAlpha=1;
  
  const S=g.createLinearGradient(0,-74,0,30);S.addColorStop(0,'rgba(36,18,60,0)');S.addColorStop(1,'rgba(36,18,60,.24)');g.fillStyle=S;g.fillRect(-180,-74,360,120);
  // the ring of shine: broken, hard-edged, following the curve of the skull
  g.fillStyle=lt(c,.78);for(let i=0;i<17;i++){const u=i/16,x=lerp(-98,102,u)+cx*.1,y=-100-40*(1-(u*2-1)*(u*2-1))+((hh(i)-.5)*7),w=6+9*hh(i+2),H=11+22*hh(i+5);g.globalAlpha=.3+.5*hh(i+9);g.beginPath();g.moveTo(x-w,y);g.quadraticCurveTo(x,y-H*.42,x+w*.8,y-1);g.quadraticCurveTo(x+1,y+H*.7,x-w,y);g.fill()}g.globalAlpha=1;
  g.restore();g.restore();return{all,F}}
 // ---- the whole head. o: yaw, tilt, t, eye{open,angry,soft,look,pupil,wet,iris}, brow{up,angry}, mouth{open,smile,wide}, tear, blush, wind, rim{c,a}, shade (0..1 how dark the light is)
 function head(g,L,o){o=o||{};if(o.eyesOnly){const y0=o.yaw==null?.34:o.yaw,gd0=L.gd|0,X0=th=>100*sin(th+y0),W0=th=>cos(th+y0),ew0=gd0==1?31:33,eh0=(L.es==3?32:L.es==1?24:L.es==2?26:28);g.save();if(o.tilt)g.rotate(o.tilt);eye(g,L,o.eye||{},X0(-.44),16,ew0*W0(-.44),eh0,-1,gd0);eye(g,L,o.eye||{},X0(.44),16,ew0*W0(.44),eh0,1,gd0);g.restore();return}const yaw=o.yaw==null?.34:o.yaw,t=o.t||0,sy=sin(yaw),skin=L.skin,gd=L.gd|0,fl=warm(skin,.72),E=o.eye||{},B=o.brow||{},M=o.mouth||{};
  const X=th=>100*sin(th+yaw),W=th=>cos(th+yaw);g.save();g.lineJoin='round';g.lineCap='round';if(o.tilt)g.rotate(o.tilt);
  if(!o.noBack)hairBack(g,L,o);
  // neck
  if(!o.noNeck){const nx=sy*10,nw=gd==1?42:gd==2?30:36;g.fillStyle=warm(skin,.1);g.beginPath();g.moveTo(nx-nw,86);g.lineTo(nx+nw,86);g.lineTo(nx+nw+6,214);g.lineTo(nx-nw-6,214);g.closePath();g.fill();g.fillStyle=warm(skin,.42);g.beginPath();g.moveTo(nx-nw,100);g.lineTo(nx+nw,100);g.lineTo(nx+nw,150);g.quadraticCurveTo(nx,186,nx-nw,146);g.closePath();g.fill();g.strokeStyle=fl;g.lineWidth=1.4;g.beginPath();g.moveTo(nx-nw,120);g.lineTo(nx-nw-5,214);g.moveTo(nx+nw,120);g.lineTo(nx+nw+5,214);g.stroke()}
  // ears
  const ex=X(-1.42);g.fillStyle=warm(skin,.14);g.strokeStyle=fl;g.lineWidth=1.3;g.beginPath();g.ellipse(ex-sy*4-(W(-1.42)>0?6:0),18,12,24,.08,0,TAU);g.fill();g.stroke();
  // the face
  const chin=sy*50,jw=gd==1?10:gd==2?-6:2,face=new Path2D();face.moveTo(-100,-30);face.bezierCurveTo(-104,26,-92+sy*10-jw,66,-58+sy*12,100);face.bezierCurveTo(-34+chin*.5,124,chin-16,136,chin,136);{const px=62+sy*2+jw*.6,py=92-sy*8;face.bezierCurveTo(chin+18,136,px-13,py+21,px,py);face.bezierCurveTo(px+20,py-30,102-sy*6,26,102-sy*2,-30)}face.bezierCurveTo(100,-140,-98,-140,-100,-30);face.closePath();
  const SG=g.createLinearGradient(-110,0,110,0);SG.addColorStop(0,warm(skin,.14));SG.addColorStop(.3,skin);SG.addColorStop(1,lt(skin,.1));g.fillStyle=SG;g.fill(face);
  g.save();g.clip(face);
  // the fringe's cast shadow across the forehead: the fringe's own edge, a little lower
  {const h=HS[L.hs]||HS[0],shd=fringe(7,-30,h.sw,sy*38,sin(t*2.1)*2.4+(o.wind||0)*12,(h.bang-6)*9,1);g.save();g.translate(sy*3,17);g.fillStyle=warm(skin,.34);g.globalAlpha=.75;g.fill(shd.p);g.restore();g.globalAlpha=1}
  // the side plane of the face and under the jaw
  g.fillStyle=warm(skin,.28);g.globalAlpha=.5;g.beginPath();g.moveTo(-108,0);g.bezierCurveTo(-92,40,-74,84,-50+sy*12,106);g.bezierCurveTo(-30,124,chin-16,138,chin,140);g.lineTo(-130,150);g.closePath();g.fill();g.globalAlpha=1;
  const bl=(o.blush==null?(gd==2?.3:gd==1?.12:.2):o.blush);for(const[bx,by,r0]of[[X(-.6),66,34],[X(.66),64,25]]){const RG=g.createRadialGradient(bx,by,0,bx,by,r0);RG.addColorStop(0,'rgba(255,104,136,'+bl+')');RG.addColorStop(1,'rgba(255,104,136,0)');g.fillStyle=RG;g.fillRect(bx-r0,by-r0,r0*2,r0*2)}
  g.restore();
  g.strokeStyle=fl;g.lineWidth=1.8;g.stroke(face);
  // eyes
  const ew=gd==1?31:33,eh=(L.es==3?32:L.es==1?24:L.es==2?26:28),ey=16,th0=.44;
  eye(g,L,E,X(-th0),ey,ew*W(-th0),eh,-1,gd);eye(g,L,E,X(th0),ey,ew*W(th0),eh,1,gd);
  // brows
  const ba=(B.angry||0)+(L.es==2?.5:0),bu=B.up||0;const BR=[];g.fillStyle=sh(L.hair,-.55);for(const[side,th]of[[-1,-th0],[1,th0]]){const cx=X(th),w=ew*W(th)*1.15,yIn=-36-bu*12+ba*12,yOut=-42-bu*5-ba*8,xI=cx-side*w*.8,xO=cx+side*w*1.05,B0=new Path2D();B0.moveTo(xI,yIn+3.5);B0.quadraticCurveTo(cx,Math.min(yIn,yOut)-9,xO,yOut);B0.quadraticCurveTo(cx,Math.min(yIn,yOut)-2,xI,yIn-3.5);B0.closePath();g.fill(B0);BR.push(B0)}
  // nose: only the shadow under its tip
  const nx=X(0)+sy*6;g.strokeStyle=warm(skin,.62);g.lineWidth=2;g.beginPath();g.moveTo(nx+sy*8+3,58);g.quadraticCurveTo(nx+sy*5,63,nx+sy*3-4,60);g.stroke();
  // mouth
  const mx=X(0)+sy*2,my=98,mo=cl(M.open||0,0,1),sm=M.smile==null?.16:M.smile,mw=(M.wide||1)*(gd==1?19:17)*(1-Math.abs(sy)*.18);
  if(mo<.06){g.strokeStyle=gd==2?'#b84a5e':'#7e4048';g.lineWidth=2.8;g.beginPath();g.moveTo(mx-mw,my-sm*7);g.quadraticCurveTo(mx,my+sm*11,mx+mw,my-sm*7);g.stroke();g.fillStyle='rgba(180,84,100,.2)';g.beginPath();g.ellipse(mx,my+9,mw*.42,2.6,0,0,TAU);g.fill()}
  else{const oh=8+mo*42,m0=new Path2D();m0.moveTo(mx-mw,my-sm*5-4);m0.quadraticCurveTo(mx,my-5-mo*5,mx+mw,my-sm*5-4);m0.quadraticCurveTo(mx+mw*.8,my+oh*1.0,mx,my+oh);m0.quadraticCurveTo(mx-mw*.8,my+oh,mx-mw,my-sm*5-4);m0.closePath();g.fillStyle='#52161f';g.fill(m0);g.save();g.clip(m0);g.fillStyle='#d8606e';g.beginPath();g.ellipse(mx,my+oh*1.02,mw*.7,oh*.5,0,0,TAU);g.fill();if(mo>.25){g.fillStyle='#fffaf4';g.fillRect(mx-mw,my-16,mw*2,11+mo*4)}g.restore();g.strokeStyle=gd==2?'#a23e52':'#6e3640';g.lineWidth=2;g.stroke(m0)}
  // tears
  if(o.tear){const a=cl(o.tear,0,1);g.save();g.globalAlpha=a;for(const[side,th]of[[-1,-th0],[1,th0]]){const cx=X(th),tx=cx+side*2,ty=ey+eh*.8;const G2=g.createLinearGradient(0,ty,0,ty+90);G2.addColorStop(0,'rgba(190,226,255,.92)');G2.addColorStop(1,'rgba(190,226,255,.1)');g.fillStyle=G2;g.beginPath();g.moveTo(tx-5,ty);g.bezierCurveTo(tx-9,ty+36,tx-2,ty+60,tx+2,ty+94);g.bezierCurveTo(tx+5,ty+60,tx+10,ty+30,tx+5,ty);g.closePath();g.fill();const v=((t*.55+side*.2)%1+1)%1;g.fillStyle='#e6f4ff';g.beginPath();g.ellipse(tx+1,ty+v*110,3.6,6,0,0,TAU);g.fill()}g.restore()}
  if(!o.noFringe)hairFront(g,L,o);
  if(BR.length){g.fillStyle=dk(L.hair,.6);g.globalAlpha=.88;for(const q of BR)g.fill(q);g.globalAlpha=1}
  g.restore()}
 // ---- the body: anime proportions, tapered limbs, two-bone IK. Origin at the feet, facing right.
 const THIGH=405,SHIN=405,UARM=300,FARM=292,HIPY=-830,TORSO=380;
 const STAND={px:0,py:0,lean:.02,nh:[-16,560],fh:[10,556],nf:[-58,0],ff:[66,0],wa:-1.2,hd:{}};
 function lerpPose(a,b,k){const o={};for(const q of new Set([...Object.keys(a),...Object.keys(b)])){const A=a[q],B=b[q];if(A==null){o[q]=B;continue}if(B==null){o[q]=A;continue}if(typeof A=='number'&&typeof B=='number')o[q]=A+(B-A)*k;else if(Array.isArray(A)&&Array.isArray(B))o[q]=A.map((v,i)=>v+(B[i]-v)*k);else if(typeof A=='object'&&typeof B=='object')o[q]=lerpPose(A,B,k);else o[q]=k<.5?A:B}return o}
 // keyframed pose track: [[t,pose,ease]...]
 function track(keys,t){if(t<=keys[0][0])return Object.assign({},STAND,keys[0][1]);for(let i=1;i<keys.length;i++){if(t<=keys[i][0]){const a=keys[i-1],b=keys[i];let k=(t-a[0])/((b[0]-a[0])||1);const e=b[2]||'io';k=e=='li'?k:e=='o'?1-Math.pow(1-k,3):e=='i'?k*k*k:k*k*(3-2*k);return lerpPose(Object.assign({},STAND,a[1]),Object.assign({},STAND,b[1]),k)}}return Object.assign({},STAND,keys[keys.length-1][1])}
 const lineScale=(g,k)=>new Proxy(g,{set(t,p,v){t[p]=p==='lineWidth'?v*k:v;return true},get(t,p){const v=t[p];return typeof v=='function'?v.bind(t):v}});
 function limb(g,x1,y1,x2,y2,w1,w2,col,ln,shd){const dx=x2-x1,dy=y2-y1,D=Math.hypot(dx,dy)||1,nx=-dy/D,ny=dx/D,mx=(x1+x2)/2,my=(y1+y2)/2,bg=Math.min(w1,w2)*.16,p=new Path2D();p.moveTo(x1+nx*w1,y1+ny*w1);p.quadraticCurveTo(mx+nx*(w1+w2)/2*1.05+nx*bg,my+ny*(w1+w2)/2*1.05+ny*bg,x2+nx*w2,y2+ny*w2);p.arc(x2,y2,w2,Math.atan2(ny,nx),Math.atan2(-ny,-nx),true);p.quadraticCurveTo(mx-nx*(w1+w2)/2*1.05-nx*bg,my-ny*(w1+w2)/2*1.05-ny*bg,x1-nx*w1,y1-ny*w1);p.arc(x1,y1,w1,Math.atan2(-ny,-nx),Math.atan2(ny,nx),true);p.closePath();g.fillStyle=col;g.fill(p);if(shd){g.save();g.clip(p);g.strokeStyle=shd;g.lineWidth=Math.max(w1,w2)*.7;g.lineCap='butt';g.beginPath();g.moveTo(x1-nx*w1*.9,y1-ny*w1*.9);g.lineTo(x2-nx*w2*.9,y2-ny*w2*.9);g.stroke();g.restore()}g.strokeStyle=ln;g.lineWidth=2.6;g.beginPath();g.moveTo(x1+nx*w1,y1+ny*w1);g.quadraticCurveTo(mx+nx*(w1+w2)/2*1.05+nx*bg,my+ny*(w1+w2)/2*1.05+ny*bg,x2+nx*w2,y2+ny*w2);g.moveTo(x1-nx*w1,y1-ny*w1);g.quadraticCurveTo(mx-nx*(w1+w2)/2*1.05-nx*bg,my-ny*(w1+w2)/2*1.05-ny*bg,x2-nx*w2,y2-ny*w2);g.stroke();return p}
 // one feather of the Nightshade mantle
 function feather(g,x,y,a,len,w,c1,c2,edge){g.save();g.translate(x,y);g.rotate(a);const p=new Path2D();p.moveTo(0,-w*.3);p.quadraticCurveTo(len*.5,-w,len,0);p.quadraticCurveTo(len*.5,w,0,w*.3);p.closePath();const G=g.createLinearGradient(0,0,len,0);G.addColorStop(0,c1);G.addColorStop(1,c2);g.fillStyle=G;g.fill(p);g.strokeStyle=edge;g.lineWidth=1.8;g.stroke(p);g.strokeStyle=edge;g.globalAlpha=.55;g.lineWidth=1;g.beginPath();g.moveTo(2,0);g.lineTo(len*.92,0);g.stroke();g.restore()}
 function coatPanel(g,x0,y0,x1,len,wnd,t,col,trim,ln,ph,ragged){const w=sin(t*2+ph)*14+wnd*150,x2=x1+w,y2=y0+len,p=new Path2D();p.moveTo(x0,y0);p.bezierCurveTo(x0-10+w*.1,y0+len*.4,x1-30+w*.5,y0+len*.72,x1-46+w,y2);if(ragged){const n=5;for(let i=1;i<=n;i++){const u=i/n,X=x2-46+u*(110),Xm=x2-46+(u-.5/n)*110;p.lineTo(Xm,y2+26+(i%2)*26);p.lineTo(X,y2-(i%2?6:0))}}else{p.quadraticCurveTo(x2+8,y2+24,x2+64,y2-4)}p.bezierCurveTo(x1+44+w*.5,y0+len*.7,x0+96+w*.1,y0+len*.4,x0+84,y0);p.closePath();g.fillStyle=col;g.fill(p);g.strokeStyle=ln;g.lineWidth=2.6;g.stroke(p);if(!ragged){g.strokeStyle=trim;g.lineWidth=5;g.beginPath();g.moveTo(x1-46+w,y2);g.quadraticCurveTo(x2+8,y2+24,x2+64,y2-4);g.stroke()}return p}
 /* body(g,L,pose,o). o: t, C{coat,dark,trim,inner,boot,glove,leg,scarf (null: none),coatLen (0: no coat)}, wpn (Mythic class key) or none, wpnLen, tier, wind, face{}, rim{c,a}, evo{mantle,tails,hood,gaunt},
    dress{back,torso,head,front}(g,J): a class's own outfit, drawn in body space (head: in head space, after the face). J has the joints (NS FS near/far shoulder, HD head, nA fA arms [elbow x,y, hand x,y], kneeN kneeF [knee x,y, ankle x,y], hipN hipF, hx hy hip, lean, rot(x,y) torso space to body space, yaw, t, wnd, L look, C colours, k = o.dk growth values). pose.wFront: weapon over the near hand (gauntlets, pistols). */
 function body(g,L,pose,o){o=o||{};const P0=Object.assign({},STAND,pose),t=o.t||0,C=o.C||DEFC,wnd=(o.wind||0)+(P0.wnd||0),E=o.evo||{},gd=L.gd|0,ln=dk(C.coat,.6),skin=L.skin;
  const hx=P0.px,hy=HIPY+P0.py,ln2=INK,lean=P0.lean;const sw0=gd==1?1.1:gd==2?.86:1;
  const rot=(x,y)=>[hx+x*cos(lean)-y*sin(lean),hy+x*sin(lean)+y*cos(lean)];
  const NS=rot(-128*sw0,-372),FS=rot(100*sw0,-372),NK=rot(-6,-408),HD=rot(-10+(P0.hdx||0),-592);
  g.save();g.lineJoin='round';g.lineCap='round';
  // what is behind everything: the scarf tails and a long rear panel of the coat
  const DR=o.dress||null,J={t,wnd,lean,hx,hy,rot,NS,FS,NK,HD,gd,L,C,k:o.dk||{}};if(DR&&DR.back){g.save();try{DR.back(g,J)}catch(e){dressErr(e)}g.restore()}
  const sc=wnd*200+sin(t*2.2)*24;if(C.scarf)for(const[i,w0]of[[0,30],[1,22]]){const b0=rot(-36,-386);g.fillStyle=i?C.scarf2||dk(C.scarf,.2):C.scarf;g.strokeStyle=dk(C.scarf,.6);g.lineWidth=2.4;g.beginPath();g.moveTo(b0[0],b0[1]);g.bezierCurveTo(b0[0]-170+sc*.2,b0[1]+40+i*40,b0[0]-300+sc*.6,b0[1]+70+i*70,b0[0]-430+sc,b0[1]+150+i*100+sin(t*3+i)*18);g.lineTo(b0[0]-380+sc,b0[1]+180+i*100);g.bezierCurveTo(b0[0]-280+sc*.6,b0[1]+130+i*70,b0[0]-160+sc*.2,b0[1]+80+i*40,b0[0]+w0*.6,b0[1]+w0);g.closePath();g.fill();g.stroke()}
  const tl=E.tails||0,CL=C.coatLen==null?1:C.coatLen;if(CL>0)coatPanel(g,hx-84,hy-40,hx-30,(620+tl*180)*CL,wnd+tl*.25,t,C.dark,C.trim,ln,0,tl>.4);
  // hair behind the shoulders
  g.save();g.translate(HD[0],HD[1]);if(o.noHairBack!==1)hairBack(g,L,Object.assign({t,wind:wnd},P0.hd));g.restore();
  // the far arm
  const LW=P0.lw||1,Wc=C.glove,armC=C.coat,sh2=dk(armC,.3);const FH=[FS[0]+P0.fh[0],FS[1]+P0.fh[1]],fA=AC6.ik2(FS[0],FS[1],FH[0],FH[1],UARM,FARM,P0.fb==null?1:P0.fb);J.fA=fA;limb(g,FS[0],FS[1],fA[0],fA[1],44,36,dk(armC,.1),ln,sh2);limb(g,fA[0],fA[1],fA[2],fA[3],36,26,dk(armC,.1),ln,sh2);
  if(!P0.noFarHand){g.fillStyle=Wc;g.strokeStyle=ln;g.lineWidth=2.4;g.beginPath();g.ellipse(fA[2],fA[3]+6,28,32,0,0,TAU);g.fill();g.stroke()}
  // legs (far then near)
  const hipF=rot(60,0),hipN=rot(-64,0),legC=C.leg||dk(C.coat,.14);for(const[hp,foot,nm]of[[hipF,P0.ff,'f'],[hipN,P0.nf,'n']]){const Fx=foot[0],Fy=foot[1]-36,k=AC6.ik2(hp[0],hp[1],Fx,Fy,THIGH,SHIN,P0.kb==null?-1:P0.kb);J[nm=='f'?'kneeF':'kneeN']=k;J[nm=='f'?'hipF':'hipN']=hp;const c=nm=='f'?dk(legC,.12):legC,s1=dk(c,.3);limb(g,hp[0],hp[1],k[0],k[1],78,56,c,ln,s1);limb(g,k[0],k[1],k[2],k[3],54,40,C.boot,ln,dk(C.boot,.34));
   // boot foot and cuff
   g.fillStyle=C.boot;g.strokeStyle=ln;g.lineWidth=2.6;g.beginPath();g.moveTo(k[2]-40,k[3]-6);g.lineTo(k[2]+36,k[3]-10);g.quadraticCurveTo(k[2]+108,k[3]+14,k[2]+104,k[3]+40);g.lineTo(k[2]-44,k[3]+40);g.closePath();g.fill();g.stroke();g.strokeStyle=C.trim;g.lineWidth=4;const ux=lerp(k[0],k[2],.3),uy=lerp(k[1],k[3],.3);g.beginPath();g.moveTo(ux-46,uy);g.lineTo(ux+46,uy);g.stroke()}
  // coat, front panels
  if(CL>0){coatPanel(g,hx+6,hy-44,hx+76,(540+tl*140)*CL,wnd*.9,t,dk(C.coat,.08),C.trim,ln,1.7,tl>.4);coatPanel(g,hx-96,hy-44,hx-46,(560+tl*150)*CL,wnd,t,C.coat,C.trim,ln,3.1,tl>.4)}
  // torso
  g.save();g.translate(hx,hy);g.rotate(lean);const wst=gd==2?62:gd==1?78:70,hipw=gd==2?92:86,T=new Path2D();T.moveTo(-52,-402);T.bezierCurveTo(-92,-392,-128*sw0,-392,-138*sw0,-362);T.bezierCurveTo(-120*sw0,-260,-wst-6,-190,-wst,-126);T.bezierCurveTo(-wst-2,-70,-hipw-6,-30,-hipw,14);T.lineTo(hipw-6,14);T.bezierCurveTo(hipw-2,-30,wst-2,-70,wst,-126);T.bezierCurveTo(wst+6,-190,104*sw0,-260,112*sw0,-362);T.bezierCurveTo(100*sw0,-392,80,-392,52,-402);T.closePath();g.fillStyle=C.coat;g.fill(T);g.save();g.clip(T);g.fillStyle=dk(C.coat,.28);g.beginPath();g.moveTo(-200,-420);g.lineTo(-60,-420);g.bezierCurveTo(-100,-250,-50,-100,-40,40);g.lineTo(-200,40);g.closePath();g.fill();
   // the inner shirt in a V, seams
   g.fillStyle=C.inner;g.beginPath();g.moveTo(-34,-410);g.lineTo(46,-410);g.lineTo(10,-150);g.closePath();g.fill();g.strokeStyle=C.trim;g.lineWidth=5;g.beginPath();g.moveTo(-34,-410);g.lineTo(10,-150);g.lineTo(46,-410);g.stroke();g.restore();g.strokeStyle=ln;g.lineWidth=2.8;g.stroke(T);
   // belt
   g.fillStyle=dk(C.coat,.42);g.beginPath();g.moveTo(-wst-6,-150);g.lineTo(wst+6,-150);g.lineTo(wst+4,-108);g.lineTo(-wst-4,-108);g.closePath();g.fill();g.strokeStyle=ln;g.lineWidth=2.2;g.stroke();g.fillStyle=C.trim;g.beginPath();g.moveTo(-8,-156);g.lineTo(22,-156);g.lineTo(26,-102);g.lineTo(-12,-102);g.closePath();g.fill();g.strokeStyle=ln;g.stroke();
   g.restore();
  if(DR&&DR.torso){g.save();try{DR.torso(g,J)}catch(e){dressErr(e)}g.restore()}
  // the weapon is held in the near hand, in front of the body and behind the head
  const NH=[NS[0]+P0.nh[0],NS[1]+P0.nh[1]],nA=AC6.ik2(NS[0],NS[1],NH[0],NH[1],UARM,FARM,P0.nb==null?1:P0.nb);J.nA=nA;J.NH=NH;if(o.wpn&&!P0.noWpn&&!P0.wBack&&!P0.wFront)drawWpn(g,o,NH,P0);
  // neck, head and face
  g.save();g.translate(HD[0],HD[1]);const fc=Object.assign({t,wind:wnd,noBack:1,rim:o.rim},P0.hd,o.face);if(E.hood){hoodBack(g,E.hood,C,t,fc.yaw==null?.34:fc.yaw)}head(g,L,fc);if(E.hood){hoodFront(g,E.hood,C,t,fc.yaw==null?.34:fc.yaw)}if(DR&&DR.head){J.yaw=fc.yaw==null?.34:fc.yaw;g.save();try{DR.head(g,J)}catch(e){dressErr(e)}g.restore()}g.restore();
  // high collar and scarf at the throat
  if(C.scarf){const n=rot(-6,-404);g.save();g.translate(n[0],n[1]);g.rotate(lean);g.fillStyle=C.scarf;g.strokeStyle=dk(C.scarf,.6);g.lineWidth=2.6;g.beginPath();g.moveTo(-84,24);g.bezierCurveTo(-100,-22,-46,-50,8,-46);g.bezierCurveTo(64,-50,104,-20,84,24);g.bezierCurveTo(56,50,-52,50,-84,24);g.closePath();g.fill();g.stroke();g.strokeStyle=dk(C.scarf,.46);g.lineWidth=2;g.beginPath();g.moveTo(-70,4);g.quadraticCurveTo(0,28,72,2);g.moveTo(-52,-26);g.quadraticCurveTo(8,-8,62,-28);g.stroke();g.restore()}
  // the mantle of feathers, unfolding row by row
  if(E.mantle){const m=E.mantle,rows=[[0,.0,10,240,50],[1,.2,9,200,44],[2,.45,8,160,38]];for(const[r,d0,n,len,w]of rows){const k=cl((m-d0)/.5,0,1);if(k<=0)continue;for(let i=0;i<n;i++){const u=i/(n-1),a=lerp(2.5,.42,u)+sin(t*1.8+i)*.03+wnd*.2,cx0=lerp(NS[0],FS[0],u),cy0=lerp(NS[1],FS[1],u)+6-r*26+30*sin(u*3.14)*-.5;feather(g,cx0,cy0,a,len*k,w*k,lerp(0,1,1)?C.feather:C.feather,C.feather2,C.trim)}}}
  // the near arm, weapon held in the near hand (or off in space)
  limb(g,NS[0],NS[1],nA[0],nA[1],48,38,armC,ln,sh2);limb(g,nA[0],nA[1],nA[2],nA[3],38,28,armC,ln,sh2);
  // cuff and hand
  g.strokeStyle=C.trim;g.lineWidth=6;const cf=[lerp(nA[0],nA[2],.76),lerp(nA[1],nA[3],.76)];{const a=Math.atan2(nA[3]-nA[1],nA[2]-nA[0])+1.57;g.beginPath();g.moveTo(cf[0]+cos(a)*36,cf[1]+sin(a)*36);g.lineTo(cf[0]-cos(a)*36,cf[1]-sin(a)*36);g.stroke()}
  g.fillStyle=Wc;g.strokeStyle=ln;g.lineWidth=2.6;g.beginPath();g.ellipse(nA[2],nA[3]+4,30,34,0,0,TAU);g.fill();g.stroke();
  if(E.gaunt){const k=E.gaunt,a0=Math.atan2(nA[3]-nA[1],nA[2]-nA[0]);for(let i=0;i<7;i++){const u=i/6,x=lerp(nA[0],nA[2],u),y=lerp(nA[1],nA[3],u);feather(g,x,y,a0+2.5+sin(i)*.12,130*k*(1-u*.3),24*k,C.feather,C.feather2,C.trim)}for(let i=0;i<4;i++){const a=a0-.5+i*.34;g.strokeStyle=C.feather2;g.lineWidth=8*k;g.beginPath();g.moveTo(nA[2]+cos(a)*20,nA[3]+sin(a)*20);g.lineTo(nA[2]+cos(a)*62*k,nA[3]+sin(a)*62*k);g.stroke()}}
  if(o.wpn&&!P0.noWpn&&P0.wFront)drawWpn(g,o,NH,P0);
  if(DR&&DR.front){g.save();try{DR.front(g,J)}catch(e){dressErr(e)}g.restore()}
  g.restore();return{NH:[nA[2],nA[3]],HD,NS,FS,J}}
 function dressErr(e){if(!dressErr.n){dressErr.n=1;console.error('FILM1 dress',e)}}
 function drawWpn(g,o,H,P0){try{const k=o.wpn,pf=MYTH.prof(k),len=o.wpnLen||1560,th=lineScale(g,.32);g.save();g.translate(H[0],H[1]);g.rotate(P0.wa);if(P0.wflip)g.scale(1,-1);g.translate(-len*(pf.piv||.4),0);MYART.weapon(th,k,o.tier||5,len,o.t||0,{vector:1});g.restore()}catch(e){g.restore&&0;if(!drawWpn.e){drawWpn.e=1;console.error('FILM1 weapon',e)}}}
 const DEFC={coat:'#44327a',dark:'#2c1f58',trim:'#c8a8ff',inner:'#1a1030',boot:'#2e2252',glove:'#352860',leg:'#362a5e',scarf:'#6a44ae',scarf2:'#4e3288',feather:'#2a1f58',feather2:'#7a5ad0'};
 function hoodBack(g,k,C,t,yaw){g.save();g.globalAlpha=cl(k,0,1);const c0=-60*(1-k);g.translate(0,c0+40*(1-k));g.fillStyle=dk(C.dark,.2);g.strokeStyle=dk(C.dark,.5);g.lineWidth=2.4;g.beginPath();g.moveTo(-150,120);g.bezierCurveTo(-186,-120,-96,-214,10,-212);g.bezierCurveTo(120,-214,190,-110,146,120);g.bezierCurveTo(90,210,-90,210,-150,120);g.closePath();g.fill();g.stroke();g.restore()}
 function hoodFront(g,k,C,t,yaw){const sy=sin(yaw),cx=sy*36,grow=cl(k,0,1);g.save();g.globalAlpha=grow;const pth=new Path2D();pth.moveTo(-142,130);pth.bezierCurveTo(-190,-120,-110,-206-30*(1-grow),10,-206-30*(1-grow));pth.bezierCurveTo(120,-206-30*(1-grow),196,-110,146,130);pth.lineTo(112,146);pth.bezierCurveTo(146,-10,96,-120+60*(1-grow),cx+6,-124+60*(1-grow));pth.bezierCurveTo(-92,-120+60*(1-grow),-142,-10,-108,146);pth.closePath();g.fillStyle=C.dark;g.fill(pth);g.strokeStyle=C.trim;g.lineWidth=3.2;g.stroke(pth);
  // the shadow the hood throws over the top of the face
  g.save();g.clip(pth);g.restore();const sh0=g.createRadialGradient(cx,-150,20,cx,-120,170);sh0.addColorStop(0,'rgba(8,4,18,.86)');sh0.addColorStop(1,'rgba(8,4,18,0)');g.globalAlpha=grow*.9;g.fillStyle=sh0;g.beginPath();g.ellipse(cx,-110,132,120,0,0,TAU);g.fill();g.restore()}
 return{head,hairBack,hairFront,eye,look,HS,lerp,cl,body,track,lerpPose,STAND,DEFC,lineScale,feather,limb,dk,lt,mix,warm}})()}catch(e){console.error('FILM1',e)}
