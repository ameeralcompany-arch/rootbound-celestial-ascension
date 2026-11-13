// ===== Cosmetic art: Silver Moon Court (elegant, royal): white, silver and gold with moon motifs, in the game's own cel style (COS1.H helpers).
// Body space: feet at 0, facing right (+x is the front), shoulders c.sh (about -37), hips c.hip (about -21), torso about 19 wide; the head layer is in
// head space (head centre c.hy, about -50; face spans x -10..10, y hy-10..hy+12). Nothing bright or ring-shaped is ever drawn behind the head. =====
try{(()=>{const C=COS1,H=C.H,OL=H.OL,TAU=6.2832,sin=Math.sin,cl=(v,a,b)=>v<a?a:v>b?b:v;
 const WH='#f7f5fc',WF='#e3e1ef',GO='#f3cd62',GD='#b9872b',SI='#cfd6e8',PE='#fbf6ef',MN='#28306a';
 // cel fill with an optional trim band just inside the edge: dark base, lit shape offset toward the light, trim, outline
 function cel(g,P,col,tc,tw,lw){P();g.fillStyle=H.shade(col,-.3);g.fill();g.save();g.clip();g.translate(1.3,-1);P();g.fillStyle=col;g.fill();if(tc){g.translate(-1.3,1);P();g.strokeStyle=tc;g.lineWidth=tw;g.stroke()}g.restore();P();g.strokeStyle=OL;g.lineWidth=lw||1;g.stroke()}
 // shapes added to the current path: a crescent with its horns up (tilted by a), a four-point star
 function cres(g,x,y,r,a){const ca=Math.cos(a),sa=Math.sin(a),p=(u,v)=>[x+u*ca-v*sa,y+u*sa+v*ca],q=p(-r,-r*.75),o=p(0,r*1.35),e=p(r,-r*.75),i=p(0,r*.45);g.moveTo(q[0],q[1]);g.quadraticCurveTo(o[0],o[1],e[0],e[1]);g.quadraticCurveTo(i[0],i[1],q[0],q[1]);g.closePath()}
 function star(g,x,y,r){const k=r*.26;g.moveTo(x,y-r);g.lineTo(x+k,y-k);g.lineTo(x+r,y);g.lineTo(x+k,y+k);g.lineTo(x,y+r);g.lineTo(x-k,y+k);g.lineTo(x-r,y);g.lineTo(x-k,y-k);g.closePath()}

 // ---- Silver Moon Regalia: a white court coat with a high gold-lined collar, gold frogging, epaulettes, a crescent brooch and long tails that flow
 function epau(g,x,y,c,s){const sw=H.sw(c,s)*.35+(c.run?sin(c.t*14+s)*.4:0)+(c.air?-.8:0);
  g.strokeStyle=GD;g.lineWidth=.8;g.lineCap='round';g.beginPath();for(let i=0;i<5;i++){const fx=x-3+i*1.5;g.moveTo(fx,y+1);g.lineTo(fx+sw*(.6+i*.1),y+4.4-Math.abs(i-2)*.5)}g.stroke();
  cel(g,()=>{g.beginPath();g.ellipse(x,y,4,2.3,s*.15,0,TAU)},GO,null,0,.9);g.fillStyle='#fff6d8';g.beginPath();g.arc(x+.6,y-.5,.7,0,TAU);g.fill()}
 // the long tails, behind the legs: they trail as you move and lift in the air. The Moonlit Cape draws them again over itself (a cape hangs behind the coat).
 let TL=null;function tails(g,c){const hip=c.hip,run=c.run?1:0,fl=H.sw(c)*1.25+run*sin(c.t*12)*.8-(c.air?2.5+sin(c.t*7)*.8:0),up=c.air?4:run*1.5,fy=-3.4-up,sp=c.air?4:0;
  const P=()=>{g.beginPath();g.moveTo(-8.6,hip-4);g.lineTo(7.4,hip-4);g.bezierCurveTo(9.4,hip+4,8.6+fl*.5+sp,fy-7,7.4+fl+sp,fy);g.quadraticCurveTo(3+fl*.8,fy-3.6,-.6+fl*.45,hip+6.6);g.quadraticCurveTo(-5.4+fl*.8,fy-2.6,-12+fl*1.15-sp,fy+.6-up*.2);g.bezierCurveTo(-13+fl*.6-sp,fy-8,-11.4,hip+4,-8.6,hip-4);g.closePath()};
  cel(g,P,'#e9e7f4',GO,2.4,1.1);
  g.fillStyle=GD;g.beginPath();cres(g,5+fl*.85+sp*.7,fy-4.6,1.5,-.3);cres(g,-9+fl*.95-sp*.7,fy-3.6,1.4,.35);g.fill()}
 // the look's own short cape (60-char.js draws it right after this layer) would cover the tails or the Moonlit Cape: this frame's look object is
 // fresh for every draw (info()), so these items simply switch it off for the frame they are drawn in
 const noCape=c=>{try{if(c.L&&c.L.cape)c.L.cape=0}catch(_){}};
 C.art('cos_royal_coat',{hb:1,oc:'#f1eff8',
  back(g,c){noCape(c);tails(g,c);TL=c},
  torso(g,c){const sh=c.sh,hip=c.hip,gd=c.gd,w=gd==1?11.3:gd==2?9.8:10.5,wa=gd==1?9.4:gd==2?7.7:8.6,sw=H.sw(c)*.5,up=c.air?2.6:0;
   // the front skirts, cut away over the legs, gold-edged
   for(const s of[-1,1]){const P=()=>{g.beginPath();g.moveTo(s*1.4,hip-4);g.lineTo(s*(wa+.4),hip-4);g.quadraticCurveTo(s*(wa+2)+sw*.4,hip+3,s*(wa+2.6)+sw,hip+9.4-up);g.quadraticCurveTo(s*(wa-1.4)+sw*.8,hip+8.8-up,s*2.4+sw*.3,hip+2.2);g.closePath()};cel(g,P,s<0?WF:WH,GO,2.2,1)}
   // the fitted bodice
   cel(g,()=>{g.beginPath();g.moveTo(-w,sh+.3);g.quadraticCurveTo(-w-.7,sh+7.5,-wa,hip-3);g.lineTo(-wa+.3,hip-1.2);g.lineTo(wa-.3,hip-1.2);g.lineTo(wa,hip-3);g.quadraticCurveTo(w+.7,sh+7.5,w,sh+.3);g.closePath()},WH,null,0,1.1);
   // gold embroidery: a curling vine on each front skirt
   g.lineCap='round';g.strokeStyle=GD;g.lineWidth=.7;g.beginPath();for(const s of[-1,1]){const x=s*(wa-.6)+sw*.7,y=hip+5.6-up;g.moveTo(s*3.4+sw*.3,hip+1.2);g.quadraticCurveTo(s*(wa-3)+sw*.5,hip+1,x,y);g.arc(x-s*.9,y-.4,1,s>0?.4:2.74,s>0?3.6:-.46,s<0)}g.stroke();
   // two rows of gold frogging, each a braid with a loop and a button at both ends (no centre line, so it never reads as a cross)
   g.strokeStyle=GD;g.lineWidth=1.4;g.beginPath();for(let i=0;i<2;i++){const y=sh+6.7+i*2.7,a=-4.4+i*.5,b=5.2-i*.5;g.moveTo(a,y);g.quadraticCurveTo(.4,y+1.1,b,y)}g.stroke();g.strokeStyle=GO;g.lineWidth=.6;g.stroke();
   g.fillStyle=GO;g.beginPath();for(let i=0;i<2;i++){const y=sh+6.7+i*2.7,a=-4.4+i*.5,b=5.2-i*.5;g.moveTo(a+.95,y);g.arc(a,y,.95,0,TAU);g.moveTo(b+.95,y);g.arc(b,y,.95,0,TAU)}g.fill();g.strokeStyle=OL;g.lineWidth=.45;g.stroke();
   // gold belt; its buckle is a little night sky with a silver crescent
   g.fillStyle=GD;g.fillRect(-wa+.2,hip-5.4,2*wa-.4,2.6);g.fillStyle=GO;g.fillRect(-wa+.2,hip-5.4,2*wa-.4,1);g.strokeStyle=OL;g.lineWidth=.6;g.strokeRect(-wa+.2,hip-5.4,2*wa-.4,2.6);
   g.fillStyle=MN;g.beginPath();g.ellipse(.4,hip-4.1,2.5,2,0,0,TAU);g.fill();g.strokeStyle=GO;g.lineWidth=.7;g.stroke();g.fillStyle='#eef1fa';g.beginPath();cres(g,.5,hip-3.8,1.4,-.5);g.fill();
   // the high collar, gold-lined, standing up beside the jaw
   for(const s of[-1,1]){const tx=s<0?-w-1:w,ty=sh-(s<0?6.8:3.6);cel(g,()=>{g.beginPath();g.moveTo(.4+s*2.2,sh+2.4);g.lineTo(s*(w-1.2),sh+.8);g.quadraticCurveTo(tx+s*-.4,sh-2.4,tx,ty);g.quadraticCurveTo(s*(w-3.6),ty+1.8,.4+s*3.2,sh-3.2);g.closePath()},s<0?WF:WH,GO,2.2,1)}
   // the moon brooch at the throat
   g.fillStyle=GO;g.beginPath();cres(g,.4,sh+4.2,2,.45);g.fill();g.strokeStyle=OL;g.lineWidth=.5;g.stroke();g.fillStyle=PE;g.beginPath();g.arc(.9,sh+3.6,.9,0,TAU);g.fill();g.stroke();
   epau(g,-w+1.4,sh+1.2,c,-1)},
  front(g,c){const ash=c.gd==1?.6:c.gd==2?-.4:0;epau(g,6.8+ash,c.sh+1.8,c,1)}});

 // ---- Crescent Tiara: a slim silver band along the brow, a small crescent at its centre cradling a pearl; a glint runs along it now and then
 C.art('cos_moon_tiara',{hh:1,
  head(g,c){const hy=c.hy,cx=1.4,x0=-9.6,y0=hy-5.2,x2=10.2,y2=hy-4.6,qy=hy-13.6,bz=u=>{const a=1-u;return[a*a*x0+2*u*a*cx+u*u*x2,a*a*y0+2*u*a*qy+u*u*y2]};
   // the band: thickest at the brow's centre, tapering into the hair at the temples, with a bright line along its top
   cel(g,()=>{g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(cx,qy,x2,y2);g.quadraticCurveTo(cx,qy+3.8,x0,y0);g.closePath()},'#e4e9f5',null,0,.75);
   g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=.45;g.beginPath();const a0=bz(.2),a1=bz(.8);g.moveTo(a0[0],a0[1]+.5);g.quadraticCurveTo(cx,qy+.6,a1[0],a1[1]+.5);g.stroke();
   // two small peaks each side of the crescent, and two moonstones
   g.fillStyle='#eef2fa';g.strokeStyle=OL;g.lineWidth=.5;g.beginPath();for(const[u,h]of[[.3,2.2],[.7,2.2],[.17,1.3],[.83,1.3]]){const p=bz(u);g.moveTo(p[0]-1,p[1]+.6);g.quadraticCurveTo(p[0]-.3,p[1]-h*.4,p[0],p[1]-h);g.quadraticCurveTo(p[0]+.3,p[1]-h*.4,p[0]+1,p[1]+.6);g.closePath()}g.fill();g.stroke();
   g.fillStyle='#b8d0ff';g.beginPath();for(const u of[.38,.62]){const p=bz(u);g.moveTo(p[0]+.7,p[1]+.9);g.arc(p[0],p[1]+.9,.7,0,TAU)}g.fill();g.lineWidth=.4;g.stroke();
   // the crescent and its pearl
   cel(g,()=>{g.beginPath();cres(g,cx,hy-10.5,3.2,0)},'#f1f4fb',null,0,.8);
   const pg=g.createRadialGradient(cx-.5,hy-12.8,.2,cx,hy-12.3,1.7);pg.addColorStop(0,'#ffffff');pg.addColorStop(.6,PE);pg.addColorStop(1,'#e0cbdc');g.fillStyle=pg;g.beginPath();g.arc(cx,hy-12.3,1.45,0,TAU);g.fill();g.lineWidth=.6;g.stroke();
   g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.arc(cx-.45+sin(c.t*1.3)*.15,hy-12.8,.42,0,TAU);g.fill();
   // a glint that runs along the band (quicker while running; it fades as it passes the crescent), and the pearl shimmers in the air
   const u=(c.t*(c.run?.8:.45))%1.5;g.save();g.globalCompositeOperation='lighter';g.fillStyle='#fff6d6';
   if(u<1){const p=bz(u),r=sin(u*Math.PI)*1.9*Math.min(1,Math.abs(u-.5)*6);if(r>.2){g.globalAlpha=.85;g.beginPath();star(g,p[0],p[1]+.4,r);g.fill()}}
   if(c.air){g.globalAlpha=.45+sin(c.t*9)*.15;g.fillStyle='#fff3e6';g.beginPath();g.arc(cx-.2,hy-12.5,1.15,0,TAU);g.fill()}g.restore()}});

 // ---- Moonlit Cape: a long silver cape with a midnight lining; a soft sheen runs over it like light on water; crescents and stars along the hem
 C.art('cos_moon_cape',{
  back(g,c){noCape(c);const sh=c.sh,t=c.t,run=c.run?1:0,fl=cl(-c.vx*.04+sin(t*2.2)*1.4+run*sin(t*11)*1.1-(c.air?4+sin(t*6)*1.2:0),-14,14),af=Math.abs(fl),up=c.air?7:run*3,bot=-1.2-up,w1=sin(t*3.1)*1.4,w2=sin(t*3.1+1.9)*1.6;
   const nx=9.4+fl*.85,ny=bot+w1*.3,mx=-2.8+fl*1.05,my=bot+.4-af*.2,fx=-16.4+fl*1.3,fy=bot-3+w2*.5-af*.5;
   const P=()=>{g.beginPath();g.moveTo(-7.6,sh-.5);g.lineTo(6.8,sh-.5);g.bezierCurveTo(10.2,sh+8,11+fl*.25,sh+20,nx,ny);g.quadraticCurveTo(3.4+fl*.95,bot+2.2+w1,mx,my);g.quadraticCurveTo(-9.4+fl*1.15,bot-1.2+w2-af*.3,fx,fy);g.bezierCurveTo(-17.2+fl*.7,sh+20,-13,sh+7,-7.6,sh-.5);g.closePath()};
   // the midnight lining shows at the far edge and the hem
   g.save();g.translate(-1.4-af*.12,1.3);P();g.fillStyle=MN;g.fill();g.strokeStyle=OL;g.lineWidth=1;g.stroke();g.restore();
   P();g.fillStyle='#8a94b6';g.fill();g.save();g.clip();g.save();g.translate(1.3,-1);P();const V=g.createLinearGradient(0,sh,0,bot);V.addColorStop(0,'#e6ebf6');V.addColorStop(.55,'#c8d0e5');V.addColorStop(1,'#aab4d2');g.fillStyle=V;g.fill();g.restore();
   // folds, a moving sheen and drifting ripples of light
   g.strokeStyle='rgba(70,80,125,.35)';g.lineWidth=1.3;g.beginPath();g.moveTo(-3,sh+3);g.quadraticCurveTo(-5+fl*.4,sh+18,-6+fl*.95,bot);g.moveTo(3.4,sh+3);g.quadraticCurveTo(3.6+fl*.3,sh+18,3+fl*.9,bot+1);g.stroke();
   const k=((t*.22)%1.5)-.25,G=g.createLinearGradient(-16,sh,10,bot),s0=cl(k-.2,0,1),s1=cl(k,0,1),s2=cl(k+.2,0,1);G.addColorStop(s0,'rgba(255,255,255,0)');G.addColorStop(s1,'rgba(255,255,255,.6)');G.addColorStop(s2,'rgba(255,255,255,0)');g.fillStyle=G;g.fillRect(-30,sh-2,44,bot-sh+6);
   g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1;g.beginPath();for(let i=0;i<3;i++){const y=sh+7+((t*2.4+i*9)%27),d=(y-sh)/(bot-sh),xl=-11+fl*d*1.1,xr=8+fl*d*.8,o=sin(t*2+i*2.1)*1.2;g.moveTo(xl,y+o);g.quadraticCurveTo((xl+xr)/2,y-1.6-o,xr,y+o*.5)}g.stroke();
   // the hem: a darker band with a gold thread, small crescents and stars
   g.strokeStyle='#6f79a3';g.lineWidth=4.6;g.beginPath();g.moveTo(nx,ny);g.quadraticCurveTo(3.4+fl*.95,bot+2.2+w1,mx,my);g.quadraticCurveTo(-9.4+fl*1.15,bot-1.2+w2-af*.3,fx,fy);g.stroke();
   g.strokeStyle='rgba(243,205,98,.8)';g.lineWidth=.6;g.beginPath();g.moveTo(nx,ny-2.6);g.quadraticCurveTo(3.4+fl*.95,bot-.4+w1,mx,my-2.6);g.quadraticCurveTo(-9.4+fl*1.15,bot-3.8+w2-af*.3,fx,fy-2.6);g.stroke();
   const q=(a,b,cc,u)=>(1-u)*(1-u)*a+2*u*(1-u)*b+u*u*cc;g.fillStyle='rgba(246,224,150,.9)';g.beginPath();
   cres(g,q(nx,3.4+fl*.95,mx,.45),q(ny,bot+2.2+w1,my,.45)-.9,1.15,0);star(g,mx,my-1.1,1.35);cres(g,q(mx,-9.4+fl*1.15,fx,.5),q(my,bot-1.2+w2-af*.3,fy,.5)-.9,1.15,.2);star(g,q(mx,-9.4+fl*1.15,fx,.88),q(my,bot-1.2+w2-af*.3,fy,.88)-1,1);g.fill();
   g.restore();P();g.strokeStyle=OL;g.lineWidth=1.1;g.stroke();
   if(TL===c)tails(g,c)},
  torso(g,c){/* the chain across the chest and the far clasp */const sh=c.sh,sw=H.sw(c)*.25;
   g.strokeStyle=GD;g.lineWidth=.9;g.lineCap='round';g.beginPath();g.moveTo(-7.4,sh+2.2);g.quadraticCurveTo(.4+sw,sh+6.4,7.6,sh+2.2);g.stroke();g.strokeStyle=GO;g.lineWidth=.4;g.stroke();
   cel(g,()=>{g.beginPath();cres(g,-7.4,sh+1.8,1.8,-.5)},SI,null,0,.7)},
  front(g,c){/* the near clasp, over the shoulder */const ash=c.gd==1?.6:c.gd==2?-.4:0;cel(g,()=>{g.beginPath();cres(g,7.6+ash,c.sh+1.8,1.8,.5)},SI,null,0,.7)}});
})()}catch(e){console.error('COS silvermoon',e)}
