// ===== Cosmetic art: Nebula Drift (cosmic: deep indigo, violet, cyan stars, nebula clouds), the rarest finds, only ever found by breaking. Same cel style
// as Mochi Dreams (COS1.H helpers); cloth with stars inside is clipped to its own shape, and every star comes from one fixed seeded list (tiny rects, the
// same every frame for the same c.t, at most ~60 per item). Body space: feet at 0, facing right, shoulders c.sh, hips c.hip; the head layer is in head space (c.hy). =====
try{(()=>{const C=COS1,H=C.H,TAU=6.2832,PI=3.1416,sin=Math.sin,cos=Math.cos,cl=(v,a,b)=>v<a?a:v>b?b:v;
 // ---- shared: one star field seeded once, starry cloth, sparkles
 // hide parts of the player's own look for this draw only (info() builds a fresh look object every draw)
 const hideLook=(c,acc)=>{const L=c.L;if(!L)return;L.cape=0;if(acc&&acc.includes(L.acc))L.acc=0};
 const SF=(()=>{let s=74531;const r=()=>(s=s*16807%2147483647)/2147483647,a=[];for(let i=0;i<64;i++)a.push({u:r(),v:r(),z:r(),p:r()*TAU,k:r()});return a})();
 const SCOL=['#ffffff','#a6f4ff','#d8c8ff','#ffc8f2'];
 // n stars from the list (starting at o) over the box x,y,w,h, drifting dx,dy box-sizes a second; they fade toward the box edges so none pops in or out
 function stars(g,x,y,w,h,t,n,o,dx,dy,a0){for(let i=0;i<n;i++){const S=SF[(i+o)%64],sp=.55+S.z*.9;let u=(S.u+t*dx*sp)%1,v=(S.v+t*dy*sp)%1;if(u<0)u++;if(v<0)v++;
   const tw=.3+.7*Math.max(0,sin(t*(1.2+S.k*2.8)+S.p)),a=(a0||1)*tw*Math.sqrt(sin(PI*u)*sin(PI*v));if(a<.04)continue;const sz=.42+S.z*.8,px=x+u*w,py=y+v*h;
   g.globalAlpha=a;g.fillStyle=SCOL[(S.k*4)|0];g.fillRect(px-sz/2,py-sz/2,sz,sz);
   if(S.z>.84&&tw>.75){g.globalAlpha=a*.75;g.fillRect(px-.15,py-sz*1.9,.3,sz*3.8);g.fillRect(px-sz*1.3,py-.15,sz*2.6,.3)}}g.globalAlpha=1}
 // a four-point sparkle (the anime glint), a little taller than wide
 function spark(g,x,y,r,col,a){g.globalAlpha=a==null?1:a;g.fillStyle=col;g.beginPath();g.moveTo(x,y-r*1.35);g.quadraticCurveTo(x+r*.12,y-r*.12,x+r,y);g.quadraticCurveTo(x+r*.12,y+r*.12,x,y+r*1.35);g.quadraticCurveTo(x-r*.12,y+r*.12,x-r,y);g.quadraticCurveTo(x-r*.12,y-r*.12,x,y-r*1.35);g.fill();g.globalAlpha=1}
 // cel cloth with something drawn inside it (clipped to its shape), then the outline again on top
 function cloth(g,path,col,lw,inner){H.celf(g,path,col,lw);g.save();path();g.clip();try{inner()}finally{g.restore()}path();g.strokeStyle=H.OL;g.lineWidth=lw||1;g.stroke()}

 // ---- Comet Scarf: a dark starry top with a short peplum, and a long pale scarf; its long end streams behind you and ends in a comet with a tail of light
 const CT='#241c5c',SCA='#a9b7ff',SCL='#eef2ff',SCD='#6f7fd6';
 C.art('cos_comet_scarf',{hb:1,oc:'#2a2268',
  back(g,c){hideLook(c,[1]);const sh=c.sh,t=c.t,k=cl(c.vx/230,-.3,1),up=c.air?1:0;
   // the long end: a ribbon along a curve from behind the neck, a wave travelling down it, narrowing into the comet; the comet's pull keeps it afloat
   // behind you even when you stand still (bobbing slowly), and running it streams straight back
   const x0=-4.5,y0=sh+1.5,x1=-11.5-1.5*k,y1=sh+5.5-5*k-2*up,x2=-18-6*k+sin(t*2.3+1)*1.4,y2=sh+7.5-4*k-3*up+sin(t*1.6)*1.5,x3=-25-8*k+sin(t*1.7)*1.4,y3=sh+1.5-k-3*up+sin(t*1.2+.5)*2.5;
   const N=10,A=[],B=[];let ex=0,ey=0,dx=0,dy=1;
   for(let i=0;i<=N;i++){const s=i/N,m=1-s,px=m*m*m*x0+3*m*m*s*x1+3*m*s*s*x2+s*s*s*x3,py=m*m*m*y0+3*m*m*s*y1+3*m*s*s*y2+s*s*s*y3,
     tx=3*m*m*(x1-x0)+6*m*s*(x2-x1)+3*s*s*(x3-x2),ty=3*m*m*(y1-y0)+6*m*s*(y2-y1)+3*s*s*(y3-y2),ln=Math.hypot(tx,ty)||1,nx=-ty/ln,ny=tx/ln,wv=sin(t*4.2-s*5.5)*1.3*s,hw=2.9-s*2.1;
     A.push(px+nx*(wv+hw),py+ny*(wv+hw));B.push(px+nx*(wv-hw),py+ny*(wv-hw));if(i==N){ex=px+nx*wv;ey=py+ny*wv;dx=tx/ln;dy=ty/ln}}
   const rib=()=>{g.beginPath();g.moveTo(A[0],A[1]);for(let i=2;i<A.length;i+=2)g.lineTo(A[i],A[i+1]);for(let i=B.length-2;i>=0;i-=2)g.lineTo(B[i],B[i+1]);g.closePath()};
   H.celf(g,rib,SCA,1);g.strokeStyle=SCL;g.lineWidth=.7;g.beginPath();for(const i of[12,14]){g.moveTo(A[i],A[i+1]);g.lineTo(B[i],B[i+1])}g.stroke();
   // the comet: a wedge of light streaming on from the end, a bright head and motes drifting off it
   const L=12+7*k,qx=-dy,qy=dx,fx=ex+dx*L,fy=ey+dy*L;g.save();g.globalCompositeOperation='lighter';const tg=g.createLinearGradient(ex,ey,fx,fy);tg.addColorStop(0,'rgba(170,240,255,.8)');tg.addColorStop(.6,'rgba(140,160,255,.25)');tg.addColorStop(1,'rgba(120,140,255,0)');
   /* the tail widens as it leaves the head, like a real comet's */g.fillStyle=tg;g.beginPath();g.moveTo(ex+qx*1.3,ey+qy*1.3);g.quadraticCurveTo(ex+dx*L*.6+qx*2.6,ey+dy*L*.6+qy*2.6,fx+qx*3.6,fy+qy*3.6);g.quadraticCurveTo(fx+dx*1.5,fy+dy*1.5,fx-qx*3.6,fy-qy*3.6);g.quadraticCurveTo(ex+dx*L*.6-qx*2.6,ey+dy*L*.6-qy*2.6,ex-qx*1.3,ey-qy*1.3);g.closePath();g.fill();
   g.strokeStyle=tg;g.lineWidth=.5;g.beginPath();for(const o of[-1.1,.9]){g.moveTo(ex,ey);g.quadraticCurveTo(ex+dx*L*.5+qx*o,ey+dy*L*.5+qy*o,fx+qx*o*2.6,fy+qy*o*2.6)}g.stroke();g.restore();
   H.glow(g,ex,ey,6.5,'#c8f6ff',.8);g.fillStyle='#ffffff';g.beginPath();g.arc(ex,ey,1.15,0,TAU);g.fill();
   for(let i=0;i<7;i++){const f=(t*.8+i/7)%1,q=sin(i*2.3+t*2.6)*f*2.4,d=2+f*(L+4),z=1.1-f*.6;g.globalAlpha=(1-f)*.9;g.fillStyle=i%2?'#ffffff':'#9ff3ff';g.fillRect(ex+dx*d+qx*q-z/2,ey+dy*d+qy*q-z/2,z,z)}
   spark(g,ex,ey,1.8+.5*sin(t*5),'#ffffff',.95)},
  torso(g,c){const sh=c.sh,hip=c.hip,t=c.t,w=c.gd==1?10.9:c.gd==2?9.5:10.2,wa=c.gd==1?8.9:c.gd==2?8.3:8.6,sw=cl(-c.vx*.02,-4,4)+sin(t*2.8)*.6,lf=c.air?-1.6:0;
   const top=()=>{g.beginPath();g.moveTo(-w,sh+.6);g.lineTo(w,sh+.6);g.quadraticCurveTo(w-.4,(sh+hip)/2,wa,hip-3.5);g.quadraticCurveTo(wa+1.6,hip,wa+2.6+sw*.4,hip+4.4+lf);g.quadraticCurveTo(sw*.5,hip+6.6+lf,-wa-2.6+sw*.4,hip+4.4+lf);g.quadraticCurveTo(-wa-1.6,hip,-wa,hip-3.5);g.quadraticCurveTo(-w+.4,(sh+hip)/2,-w,sh+.6);g.closePath()};
   cloth(g,top,CT,1.1,()=>{H.glow(g,-4,sh+8,10,'#7a4fe0',.5);H.glow(g,5,hip+2,7,'#d860d0',.32);H.glow(g,6,sh+4,5,'#3fc8e0',.25);stars(g,-w-1,sh,2*w+2,hip+7-sh,t,16,0,.01,-.018)});
   // a belt of night silk with a star buckle, and a line of light along the hem
   g.fillStyle='#151033';g.fillRect(-wa-.3,hip-5.4,2*wa+.6,2.3);g.strokeStyle=H.OL;g.lineWidth=.6;g.strokeRect(-wa-.3,hip-5.4,2*wa+.6,2.3);spark(g,1.6,hip-4.25,1.5,'#dff9ff',1);
   g.strokeStyle='rgba(160,236,255,.75)';g.lineWidth=.6;g.beginPath();g.moveTo(wa+2.1+sw*.4,hip+3.6+lf);g.quadraticCurveTo(sw*.5,hip+5.7+lf,-wa-2.1+sw*.4,hip+3.6+lf);g.stroke()},
  front(g,c){const sh=c.sh,t=c.t,sw=H.sw(c),up=c.air?-2.2:0;
   // the short end, hanging down the chest from a soft knot
   const kx=3.2,ky=sh+3.2,ex=kx+.6+sw*.35,ey=sh+14.5+up;
   H.celf(g,()=>{g.beginPath();g.moveTo(kx-2.4,ky);g.quadraticCurveTo(kx-2.2+sw*.15,ky+5.5,ex-2.4,ey);g.lineTo(ex-1.2,ey+1.5);g.lineTo(ex,ey+.5);g.lineTo(ex+1.2,ey+1.6);g.lineTo(ex+2.4,ey+.2);g.quadraticCurveTo(kx+2.6+sw*.15,ky+5.5,kx+2.6,ky);g.closePath()},SCA,1);
   g.strokeStyle=SCL;g.lineWidth=.7;g.beginPath();g.moveTo(ex-2.2,ey-2);g.lineTo(ex+2.3,ey-1.8);g.moveTo(ex-2.1,ey-3.4);g.lineTo(ex+2.3,ey-3.2);g.stroke();
   // the wrap, a soft roll under the chin
   const wrap=()=>{g.beginPath();g.moveTo(-9,sh-2);g.quadraticCurveTo(-4,sh-.2,1.6,sh-.2);g.quadraticCurveTo(6.6,sh-.4,9.2,sh-2.4);g.quadraticCurveTo(11,sh+.8,9.2,sh+3.6);g.quadraticCurveTo(1.6,sh+6.4,-8.8,sh+3.8);g.quadraticCurveTo(-10.8,sh+.8,-9,sh-2);g.closePath()};
   H.celf(g,wrap,SCA,1.1);
   g.strokeStyle=SCD;g.lineWidth=.7;g.beginPath();g.moveTo(-8,sh+1.4);g.quadraticCurveTo(1,sh+3.8,8.8,sh+.9);g.stroke();
   g.strokeStyle=SCL;g.lineWidth=.6;g.beginPath();g.moveTo(-7.6,sh-.6);g.quadraticCurveTo(1,sh+1.6,8,sh-1.2);g.stroke();
   for(let i=0;i<4;i++)spark(g,-6+i*4.2,sh+2.2+(i%2)*.8,.7,i%2?'#ffffff':'#bff6ff',.55+.45*sin(t*3+i*1.7))}});

 // ---- Moonstone Mask: a pale pearl cat-eye half-mask with swept points; its eye-holes are rimmed in moonstone and glow softly, tied with a violet ribbon
 const MP='#eeecf9';
 C.art('cos_moonstone_mask',{
  back(g,c){/* the look's cloth face-mask would sit under this one */if(c.L&&c.L.acc==3)c.L.acc=0},
  head(g,c){const hy=c.hy,t=c.t,sw=H.sw(c),lf=c.air?-1.6:0;
   // the ribbon tie at the back of the head: a knot and two short tails that sway
   g.strokeStyle='#3a2a72';g.lineWidth=1.4;g.lineCap='round';g.beginPath();g.moveTo(-10,hy-2.2);g.quadraticCurveTo(-12.6,hy-3.2,-14.4,hy-2.4);g.stroke();
   for(const s of[0,1])H.celf(g,()=>{const ox=-14.4,oy=hy-2.4,tx=ox-1.6-s*1.8+sw*.5,ty=oy+7.5-s*1.2+lf;g.beginPath();g.moveTo(ox-.6,oy);g.quadraticCurveTo(ox-1+sw*.2,oy+4,tx-.8,ty);g.lineTo(tx+.9,ty-.6);g.quadraticCurveTo(ox+.6+sw*.2,oy+3.6,ox+.8,oy);g.closePath()},s?'#4a3790':'#3a2a72',.7);
   H.celf(g,()=>{g.beginPath();g.ellipse(-14.4,hy-2.4,1.5,1.3,0,0,TAU)},'#4a3790',.7);
   // the eye-holes follow the eyes' own almond shape, a little larger; a narrow bridge between them
   const holeF=()=>{g.moveTo(-6.5,hy-.6);g.quadraticCurveTo(-3.6,hy-6.2,.9,hy-2.8);g.quadraticCurveTo(.9,hy+6.4,-2.6,hy+6.8);g.quadraticCurveTo(-6.6,hy+6.5,-6.5,hy-.6);g.closePath()},
    holeN=()=>{g.moveTo(1.7,hy-.2);g.quadraticCurveTo(4.8,hy-6.6,11.2,hy-3.4);g.quadraticCurveTo(10.4,hy+6.4,5.8,hy+6.7);g.quadraticCurveTo(1.6,hy+6.6,1.7,hy-.2);g.closePath()};
   const Po=()=>{g.beginPath();g.moveTo(-10.4,hy+.4);g.quadraticCurveTo(-11.4,hy-4.6,-12.6,hy-7.8);g.quadraticCurveTo(-8.6,hy-6.6,-4.4,hy-6.6);g.quadraticCurveTo(-1.6,hy-6.8,.2,hy-7.2);g.lineTo(1.2,hy-8.8);g.lineTo(2.3,hy-7.4);
    g.quadraticCurveTo(5.4,hy-7.6,8.6,hy-7.4);g.quadraticCurveTo(12.4,hy-7.8,14.6,hy-10.8);g.quadraticCurveTo(14.4,hy-5,11.8,hy-1.4);g.quadraticCurveTo(11.4,hy+4.6,9,hy+7);g.quadraticCurveTo(7,hy+8,5,hy+7.5);g.quadraticCurveTo(3.4,hy+7,1.3,hy+7.6);
    g.quadraticCurveTo(-1.6,hy+8.4,-4.4,hy+7.6);g.quadraticCurveTo(-8.6,hy+6.4,-10.4,hy+.4);g.closePath()},P=()=>{Po();holeF();holeN()};
   // pearl, in the cel style: dark under-layer, lit layer offset toward the light, a moonstone sheen sliding across
   P();g.fillStyle=H.shade(MP,-.3);g.fill('evenodd');g.save();P();g.clip('evenodd');g.translate(1,-.8);P();g.fillStyle=MP;g.fill('evenodd');g.translate(-1,.8);
   H.glow(g,-12+((t*.2)%1)*30,hy-2,7,'#9cc4ff',.32);H.glow(g,12.5,hy-7.5,3.5,'#d8b8ff',.4);H.glow(g,-11,hy-5,3,'#c8b0ff',.3);g.restore();
   /* the game outline round the outside only; the holes get the moonstone rim below */Po();g.strokeStyle=H.OL;g.lineWidth=.8;g.stroke();
   // fine lilac filigree along the brow and a curl on each point
   g.strokeStyle='#8f7ee0';g.lineWidth=.42;g.beginPath();g.moveTo(-6.8,hy-3.3);g.quadraticCurveTo(-3.6,hy-7.6,.1,hy-4.4);g.moveTo(2.4,hy-3.2);g.quadraticCurveTo(5.2,hy-7.8,10.6,hy-4.8);g.moveTo(10.8,hy-5.4);g.quadraticCurveTo(12.8,hy-6.4,13.6,hy-9.2);g.moveTo(-10.2,hy-2.4);g.quadraticCurveTo(-11,hy-5.2,-11.8,hy-6.8);g.stroke();
   // the moonstone eyes: a pale tint, a soft pulsing glow, a moonstone rim with a bevel under it
   [holeF,holeN].forEach((hp,i)=>{const pu=sin(t*1.7+i*1.3),x=i?6:-2.8,y=hy+1.6;g.save();g.beginPath();hp();g.clip();g.fillStyle='rgba(150,205,255,.15)';g.fillRect(x-8,y-9,16,18);H.glow(g,x,y,i?7:6,'#8fe6ff',.3+.12*pu);
    /* the moonstone rim: light welling up along the inside of the hole, no hard frame */g.globalCompositeOperation='lighter';g.beginPath();hp();g.strokeStyle='rgba(120,200,255,'+(.4+.15*pu)+')';g.lineWidth=2.6;g.stroke();g.strokeStyle='rgba(235,248,255,.6)';g.lineWidth=.7;g.stroke();g.restore();
    g.beginPath();hp();g.strokeStyle='rgba(70,50,130,.3)';g.lineWidth=.35;g.stroke();H.glow(g,x,y,i?8:7,'#9fdcff',.13+.07*pu)});
   // the moonstone over the bridge: a teardrop with a blue light moving inside it
   const gx=1.2,gy=hy-5.8;g.beginPath();g.moveTo(gx,gy-2.1);g.quadraticCurveTo(gx+1.5,gy+.4,gx,gy+1.3);g.quadraticCurveTo(gx-1.5,gy+.4,gx,gy-2.1);g.fillStyle='#e2f2ff';g.fill();g.strokeStyle=H.OL;g.lineWidth=.45;g.stroke();
   g.fillStyle='rgba(120,180,255,.7)';g.fillRect(gx-.6+sin(t*1.3)*.4,gy-.2,1.2,.9);H.glow(g,gx,gy,3.2,'#bfe8ff',.45+.15*sin(t*2));
   for(let i=0;i<3;i++){g.globalAlpha=.5+.5*sin(t*2.6+i*2);g.fillStyle=i==1?'#ffffff':'#a6f4ff';g.fillRect(11.6+i*.9,hy-4.6-i*1.6,.65,.65)}g.globalAlpha=1}});

 // ---- Fallen Star Crown: a small crown of crystallised starlight seated on top of the head; light runs across it, every point glitters, a fallen star
 // crowns the tallest point and motes of glitter keep rising off it
 const SPK=[[-6.1,3.8,2.7],[-3.1,6,3.1],[0,8.8,3.3],[3.2,6.2,3.1],[6.2,4,2.7]],yb=x=>1.3*(1-(x/7.4)*(x/7.4));
 C.art('cos_star_crown',{hh:1,
  head(g,c){const hy=c.hy,t=c.t;g.translate(.4,hy-13.7);g.rotate(-.12+(c.run?sin(t*14)*.025:0)+(c.air?-.04:0));g.scale(1.08,1.08);
   /* its shadow on the hair, so it sits */g.fillStyle='rgba(16,8,30,.32)';g.beginPath();g.moveTo(-7.6,.4);g.quadraticCurveTo(0,3.6,7.6,.2);g.quadraticCurveTo(0,1.8,-7.6,.4);g.fill();
   const crown=()=>{g.beginPath();g.moveTo(-7.4,0);g.quadraticCurveTo(0,2.6,7.4,0);g.lineTo(7.3,-2.2);
    for(let i=SPK.length-1;i>=0;i--){const[x,h,w]=SPK[i],b=yb(x)-2.2;g.lineTo(x+w/2,yb(x+w/2)-2.2);g.quadraticCurveTo(x+w*.3,b-h*.45,x*1.1,b-h);g.quadraticCurveTo(x-w*.3,b-h*.45,x-w/2,yb(x-w/2)-2.2)}
    g.lineTo(-7.3,-2.2);g.closePath()};
   const gr=g.createLinearGradient(0,-11,0,1.5);gr.addColorStop(0,'#ffffff');gr.addColorStop(.32,'#e6f7ff');gr.addColorStop(.64,'#fff1c2');gr.addColorStop(.88,'#ffd36a');gr.addColorStop(1,'#d4913a');
   crown();g.fillStyle=gr;g.fill();
   g.save();crown();g.clip();
   // crystal facets: the left half of each point tinted the blue of the night, a bright ridge down the middle
   g.fillStyle='rgba(110,140,240,.3)';g.beginPath();for(const[x,h,w]of SPK){const b=yb(x)-2.2;g.moveTo(x-w/2,yb(x-w/2)-2.2);g.lineTo(x*1.1,b-h);g.lineTo(x,b)}g.fill();
   // starlight from inside, and a glint of light running across the crown every few seconds
   g.globalCompositeOperation='lighter';H.glow(g,0,-4,8,'#fff3d0',.4);const sx=((t*.45)%2.4-.7)*12;g.globalAlpha=.55;g.fillStyle='#ffffff';g.beginPath();g.moveTo(sx-1.6,1.5);g.lineTo(sx+.2,1.5);g.lineTo(sx+3.2,-12);g.lineTo(sx+1.4,-12);g.closePath();g.fill();g.restore();
   g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=.4;g.beginPath();for(const[x,h]of SPK){const b=yb(x)-2.2;g.moveTo(x*1.1,b-h+.7);g.lineTo(x,b)}g.moveTo(-6.8,-1);g.quadraticCurveTo(0,1.4,7,-1);g.stroke();
   crown();g.strokeStyle=H.OL;g.lineWidth=.65;g.stroke();
   // three small gems on the band
   for(const[x,col,r]of[[-3.2,'#b48cff',.75],[0,'#7ff0ff',1],[3.3,'#b48cff',.75]]){const y=yb(x)-1;g.fillStyle=col;g.beginPath();g.moveTo(x,y-r);g.lineTo(x+r*.8,y);g.lineTo(x,y+r);g.lineTo(x-r*.8,y);g.closePath();g.fill();g.strokeStyle=H.OL;g.lineWidth=.3;g.stroke();g.fillStyle='#fff';g.fillRect(x-.35,y-.45,.4,.4)}
   // a glint on every point, the fallen star on the tallest
   SPK.forEach(([x,h],i)=>{if(i==2)return;const b=yb(x)-2.2,tw=.55+.45*sin(t*3.2+i*1.9);H.glow(g,x*1.1,b-h,2.6,'#bff6ff',.45*tw);spark(g,x*1.1,b-h,1.35*tw,i%2?'#c4f7ff':'#ffffff',.95)});
   const sy=yb(0)-2.2-8.8,pu=sin(t*2.4);H.glow(g,0,sy,4.6,'#bff6ff',.6+.15*pu);spark(g,0,sy,2.6+.4*pu,'#ffffff',1);spark(g,0,sy,1,'#9ff3ff',.9);
   // motes of glitter rising off the crown and fading
   for(let i=0;i<9;i++){const f=(t*.33+i*.37)%1,x=-6.4+i*1.6+sin(t*1.3+i*2.1)*.9,y=-3-f*11;g.globalAlpha=sin(PI*f)*.9;g.fillStyle=i%3?'#fff6d0':'#a6f4ff';const z=.8-f*.3;g.fillRect(x-z/2,y-z/2,z,z)}g.globalAlpha=1}});

 // ---- Galaxy Cloak: a long cloak of deep space with a spiral galaxy turning slowly inside it, stars and nebula around it; a silver chain and star clasp
 const GK='#191244';
 C.art('cos_galaxy_cloak',{
  back(g,c){hideLook(c);const sh=c.sh,hip=c.hip,t=c.t,k=cl(c.vx/230,-.4,1),up=c.air?1:0,fl=-k*11+sin(t*2.1)*1.1,lift=k*7+up*2;
   const brx=10+fl*.3+up*3,bry=-2.5-lift*.4,blx=-21.5+fl*1.15-up*4,bly=-2-lift,HM=[];
   for(let i=0;i<=6;i++){const s=i/6;HM.push(brx+(blx-brx)*s,bry+(bly-bry)*s+1.2*sin(PI*s)+sin(t*3+s*7)*.7)}
   const hem=mv=>{if(mv)g.moveTo(HM[0],HM[1]);for(let i=2;i<HM.length;i+=4)g.quadraticCurveTo(HM[i],HM[i+1]+1.6,HM[i+2],HM[i+3])};
   const cape=()=>{g.beginPath();g.moveTo(-7.6,sh+.5);g.lineTo(6.8,sh+.5);g.bezierCurveTo(9.6,sh+8,10.5+fl*.12,hip,brx,bry);hem();g.bezierCurveTo(blx+2.5-fl*.2,hip-1,-13+fl*.3,sh+7,-7.6,sh+.5);g.closePath()};
   const gx=-13+fl*.8-up*1.5,gy=hip+4.5-lift*.5;
   cloth(g,cape,GK,1.1,()=>{H.glow(g,gx-7,gy+7,11,'#b048d0',.4);H.glow(g,gx+9,sh+9,10,'#2a9cc8',.32);H.glow(g,gx,gy,13,'#5a3ad8',.35);
    stars(g,blx-1,sh,brx-blx+2,-sh+1,t,24,8,.006,0);
    // the galaxy: two arms of stars around a warm core, tilted, turning slowly
    g.save();g.translate(gx,gy);g.rotate(-.42);g.scale(1,.52);g.globalCompositeOperation='lighter';const R=t*.35;
    for(let a=0;a<2;a++){g.strokeStyle=a?'rgba(150,120,255,.45)':'rgba(255,140,230,.4)';g.lineWidth=3;g.beginPath();for(let j=0;j<=10;j++){const s=j/10,an=R+a*PI+s*3.8,r=1+s*9.5;j?g.lineTo(cos(an)*r,sin(an)*r):g.moveTo(cos(an)*r,sin(an)*r)}g.stroke();
     for(let j=0;j<12;j++){const S=SF[j+a*12],s=(j+.5)/12,an=R+a*PI+s*3.8+(S.u-.5)*.35,r=1+s*9.5+(S.v-.5)*1.4,z=1.3-s*.6;g.globalAlpha=1-s*.5;g.fillStyle=s<.25?'#fff1d0':j%3?'#a6f4ff':'#ffc8f2';g.fillRect(cos(an)*r-z/2,sin(an)*r-z/2,z,z)}}
    g.globalAlpha=1;g.restore();H.glow(g,gx,gy,5,'#ffe9c8',.95)});
   g.strokeStyle='rgba(200,190,255,.85)';g.lineWidth=.7;g.beginPath();hem(1);g.stroke()},
  torso(g,c){const sh=c.sh,w=c.gd==1?10.6:c.gd==2?9.2:9.8,t=c.t;
   // the cloak's edge over each shoulder, a silver chain between them and a star clasp
   for(const s of[-1,1])H.celf(g,()=>{g.beginPath();g.moveTo(s*(w-4.6),sh-.4);g.quadraticCurveTo(s*(w+.6),sh-.8,s*(w+1.2),sh+3.4);g.lineTo(s*(w-1.2),sh+2.6);g.quadraticCurveTo(s*(w-3),sh+.8,s*(w-5),sh+1.2);g.closePath()},'#221a55',.9);
   g.strokeStyle='#c9c2ff';g.lineWidth=.7;g.beginPath();g.moveTo(-w+3,sh+1.4);g.quadraticCurveTo(0,sh+5,w-3,sh+1.4);g.stroke();
   spark(g,.6,sh+3.3,1.9,'#ffffff',1);g.fillStyle='#7ff0ff';g.fillRect(.15,sh+2.85,.9,.9);H.glow(g,.6,sh+3.3,3,'#bff6ff',.4+.15*sin(t*2.2))}});

 // ---- Nebula Sovereign: a gown of living nebula with stars drifting through the cloth: a dark starry overskirt open at the front over a glowing nebula
 // underskirt, a starlit high collar standing up around the jaw to frame the face, and a long mantle whose train trails behind and sheds stardust
 const NB='#1f1658',NU='#4630b0',NCO='#2a2080';
 const puff=(g,x,y,t,i)=>{const cap=()=>{g.beginPath();g.moveTo(x-3.5,y+1.6);g.quadraticCurveTo(x-3.9,y-3.3,x,y-3.1);g.quadraticCurveTo(x+3.9,y-3.3,x+3.6,y+1.6);g.quadraticCurveTo(x+1.8,y+2.4,x,y+1.7);g.quadraticCurveTo(x-1.8,y+2.4,x-3.5,y+1.6);g.closePath()};
  cloth(g,cap,'#2c2178',.9,()=>{H.glow(g,x-1,y-1,4,i?'#40c8e0':'#d060d0',.45);stars(g,x-3.5,y-3,7,5,t,3,i?40:36,.01,-.03)});g.strokeStyle='rgba(160,240,255,.85)';g.lineWidth=.55;g.beginPath();g.moveTo(x-3.2,y+1.2);g.quadraticCurveTo(x-1.8,y+1.9,x,y+1.3);g.quadraticCurveTo(x+1.8,y+1.9,x+3.3,y+1.2);g.stroke()};
 C.art('cos_nebula_suit',{hb:1,hh:1,oc:'#2b2070',
  back(g,c){hideLook(c,[1,5]);const sh=c.sh,hip=c.hip,t=c.t,k=cl(c.vx/230,-.4,1),up=c.air?1:0,fl=-k*13+sin(t*1.9)*1.3,lift=k*6+up*6;
   // the mantle: from the shoulders down; at rest its train lies on the ground behind you, running it streams out
   const brx=10+fl*.3,bry=-1.2-lift*.3,blx=-25+fl*1.1,bly=-.4-lift*1.1,hw=sin(t*2.4)*.6;
   const hemP=()=>{g.bezierCurveTo(brx-8+fl*.2,bry+1.8+hw,blx+10,bly+1.8,blx,bly)};
   const man=()=>{g.beginPath();g.moveTo(-7.8,sh+1);g.lineTo(6.6,sh+1);g.bezierCurveTo(9.5,sh+10,10+fl*.15,hip+6,brx,bry);hemP();g.bezierCurveTo(blx+4+fl*.1,bly-6,-15+fl*.5,hip,-11+fl*.15,sh+10);g.quadraticCurveTo(-9,sh+4,-7.8,sh+1);g.closePath()};
   cloth(g,man,'#1d1552',1.1,()=>{const d=sin(t*.6)*2;H.glow(g,-14+fl*.8+d,-7-lift*.6,11,'#d050c8',.42);H.glow(g,-4+fl*.4,hip+2,10,'#2fc0d8',.3);H.glow(g,-20+fl,-3-lift,8,'#8a5cff',.45);
    stars(g,blx-1,sh,brx-blx+2,-sh+1,t,12,20,.012,-.008)});
   g.strokeStyle='rgba(150,236,255,.7)';g.lineWidth=.7;g.beginPath();g.moveTo(brx,bry);hemP();g.stroke();
   // stardust lifting off the end of the train
   for(let i=0;i<6;i++){const f=(t*.45+i/6)%1,x=blx+2+i*1.6+sin(t*1.4+i*2)*1.2-f*3,y=bly-1-f*9;g.globalAlpha=sin(PI*f)*.85;g.fillStyle=i%2?'#a6f4ff':'#ffffff';g.fillRect(x-.4,y-.4,.8,.8)}g.globalAlpha=1;
   // the inside of the collar, behind the neck (dark, below the chin)
   H.celf(g,H.poly(g,[-10.5,sh-5,10.5,sh-5,8,sh+2,-7.6,sh+2]),'#171044',.8)},
  torso(g,c){const sh=c.sh,hip=c.hip,t=c.t,gd=c.gd,w=gd==1?10.9:gd==2?9.4:10.1,wa=gd==1?8.6:gd==2?7.8:8.2,sway=cl(-c.vx*.02,-5,5)+sin(t*2.6)*.7,up=c.air?1:0,ls=c.ls||0,run=c.run?1:0;
   // the skirt, from the waist to the ankles: it flares when you run and lifts in the air
   const hy0=-6+up*1.2-run*.6,hf=12.5+ls*2.6+run*1.2+up*1.5,hb=-12.8+sway*1.3-run*2.6-up*1.5,wv=sin(t*2.2),hm=hf*.5+hb*.5,ox=hf-5.2+ls;
   const hemS=()=>{g.quadraticCurveTo(hf-3,hy0+1.8+wv*.4,hm+2,hy0+.8);g.quadraticCurveTo(hb+4,hy0+2+wv*.5,hb,hy0-.4)};
   const sk=()=>{g.beginPath();g.moveTo(-wa,hip-5);g.lineTo(wa,hip-5);g.bezierCurveTo(wa+1.2,hip+3,hf-2.5,hy0-7,hf,hy0);hemS();g.bezierCurveTo(hb+2.5,hy0-7,-wa-1.2,hip+3,-wa,hip-5);g.closePath()};
   // the underskirt: the brightest part of the nebula, rose and cyan
   cloth(g,sk,NU,1.1,()=>{const d=sin(t*.8)*1.4;H.glow(g,hf-5+d,-9,10,'#ff6ed8',.7);H.glow(g,hf-3,hip+5-d,8,'#40e0f0',.5);stars(g,2,hip-5,hf-1,hy0-hip+6,t,8,30,.004,-.035)});
   // the overskirt: deep night with drifting stars, open at the front edge
   const ovE=()=>{g.bezierCurveTo(4.6,hip+2,ox-2.6,hy0-8,ox,hy0+.9)},
    ov=()=>{g.beginPath();g.moveTo(-wa,hip-5);g.lineTo(3.4,hip-5);ovE();g.quadraticCurveTo(ox-3.5,hy0+1.6+wv*.4,hm+1,hy0+.9);g.quadraticCurveTo(hb+4,hy0+2+wv*.5,hb,hy0-.4);g.bezierCurveTo(hb+2.5,hy0-7,-wa-1.2,hip+3,-wa,hip-5);g.closePath()};
   cloth(g,ov,NB,1.1,()=>{const d=sin(t*.7)*1.6;H.glow(g,-2+d,-10,9,'#b04ad0',.42);H.glow(g,-8-d,-15,8,'#2fc8e0',.3);H.glow(g,-1,hip+1,8,'#7a50f0',.42);stars(g,hb-2,hip-6,ox-hb+3,hy0-hip+8,t,12,0,.006,-.03)});
   g.strokeStyle='rgba(8,4,26,.45)';g.lineWidth=.7;g.beginPath();g.moveTo(-3,hip);g.quadraticCurveTo(-4.5+sway*.3,(hip+hy0)/2,-6+sway*.6,hy0+.9);g.moveTo(-.5,hip+1);g.quadraticCurveTo(.4,(hip+hy0)/2,1.6+ls*.5,hy0+1);g.stroke();
   // starlight trim: down the opening and along both hems, a few glints riding it
   g.strokeStyle='rgba(160,240,255,.9)';g.lineWidth=.75;g.beginPath();g.moveTo(3.4,hip-5);ovE();g.moveTo(hf,hy0);hemS();g.stroke();
   for(let i=0;i<3;i++){const s=(i+.5)/3;spark(g,hf+(hb-hf)*s,hy0+1.2,.9,'#ffffff',.4+.6*Math.max(0,sin(t*2.2+i*2.1)))}spark(g,ox-1.2,hy0-5,.8,'#c8f8ff',.5+.5*sin(t*1.9));
   // the bodice
   const bd=()=>{g.beginPath();g.moveTo(-w,sh+.5);g.lineTo(w,sh+.5);if(gd==2){g.quadraticCurveTo(6.6,sh+9,wa,hip-4.5);g.lineTo(-wa,hip-4.5);g.quadraticCurveTo(-6.6,sh+9,-w,sh+.5)}else{g.quadraticCurveTo(w-.6,sh+9,wa,hip-4.5);g.lineTo(-wa,hip-4.5);g.quadraticCurveTo(-w+.6,sh+9,-w,sh+.5)}g.closePath()};
   cloth(g,bd,'#261c66',1.1,()=>{H.glow(g,-2,sh+7,8,'#8a5cff',.45);H.glow(g,4,sh+3,5,'#e070d8',.25);stars(g,-w,sh,2*w,hip-sh,t,6,44,.01,-.02)});
   g.strokeStyle='rgba(170,236,255,.55)';g.lineWidth=.6;g.beginPath();g.moveTo(-5,sh+1);g.lineTo(.4,hip-6);g.lineTo(6,sh+1);g.stroke();
   // the sash: night silk with a row of tiny stars and a jewel
   H.celf(g,H.poly(g,[-wa-.4,hip-7,wa+.4,hip-7,wa+.6,hip-3.6,-wa-.6,hip-3.6]),'#3a2a90',.8);
   for(let i=0;i<5;i++){g.globalAlpha=.55+.45*sin(t*2.8+i*1.4);g.fillStyle=i%2?'#a6f4ff':'#ffffff';g.fillRect(-wa+1.6+i*(2*wa-3.2)/4-.35,hip-5.65,.7,.7)}g.globalAlpha=1;
   spark(g,.8,hip-5.3,1.7,'#dffaff',1);H.glow(g,.8,hip-5.3,3,'#9ff3ff',.4);
   puff(g,-6.6-(gd==1?.6:gd==2?-.4:0),sh+2.4,t,0)},
  head(g,c){/* the high collar, drawn in body space after the head: two points of starlit night standing up around the jaw, in front of the side hair */
   const b=c.hy+50,sh=c.sh,t=c.t,sw=sin(t*1.8)*.25;g.translate(0,-43+b);g.scale(1/1.24,1/1.24);g.translate(0,43-b);
   const W=[[-1,-4.6,sh+1.6,-8.6,sh-2.4,-10.4,sh-6.4,-12.6,sh-9.2,-16.2,sh-10.6,-15.8,sh-4.6,-13,sh-.6,-10.4,sh+1.8,-7.6,sh+2.6],
            [1,5.2,sh+1.4,9.2,sh-2.2,11.4,sh-6.6,13.4,sh-9.4,17,sh-10.8,16.8,sh-4.6,14,sh-.6,11.2,sh+1.8,8.2,sh+2.6]];
   for(const p of W){const s=p[0],tx=p[9]+s*sw,ty=p[10]-Math.abs(sw),inner=()=>{g.moveTo(p[1],p[2]);g.quadraticCurveTo(p[3],p[4],p[5],p[6]);g.quadraticCurveTo(p[7],p[8],tx,ty)},
     wing=()=>{g.beginPath();inner();g.quadraticCurveTo(p[11],p[12],p[13],p[14]);g.quadraticCurveTo(p[15],p[16],p[17],p[18]);g.closePath()};
    cloth(g,wing,NCO,.9,()=>{/* the lining catches the light along the inner edge */g.strokeStyle='#5d48c8';g.lineWidth=3;g.beginPath();inner();g.stroke();g.strokeStyle='#8a6ee8';g.lineWidth=1.2;g.stroke();
     H.glow(g,p[13],sh-5,6,s<0?'#d060d0':'#40c8e0',.35);stars(g,Math.min(p[1],p[15])-1,sh-13,12,16,t,4,s<0?52:58,.008,-.025)});
    g.strokeStyle='rgba(200,244,255,.95)';g.lineWidth=.6;g.beginPath();inner();g.stroke();
    spark(g,tx,ty,1.1+.4*sin(t*2.6+s),s<0?'#bff6ff':'#ffffff',.9)}},
  front(g,c){const sh=c.sh,t=c.t,gd=c.gd;puff(g,6.8+(gd==1?.6:gd==2?-.4:0),sh+2.4,t,1);
   // a few motes of starlight drifting up around the gown
   for(let i=0;i<5;i++){const f=(t*.2+i*.21)%1,s=i%2?1:-1,x=s*(12.5+(i*1.3)%2.5)+sin(t*1.1+i*2)*1.2-f*s*2.5,y=-3-f*20;g.globalAlpha=sin(PI*f)*.75;g.fillStyle=i%2?'#a6f4ff':'#ffffff';g.fillRect(x-.35,y-.35,.7,.7)}g.globalAlpha=1;
   /* the brooch at the throat */H.glow(g,.6,sh+2.6,4,'#9ff3ff',.45+.15*sin(t*2));spark(g,.6,sh+2.6,2,'#ffffff',1);g.fillStyle='#7ff0ff';g.fillRect(.15,sh+2.15,.9,.9)}});
})()}catch(e){console.error('COS nebula',e)}
