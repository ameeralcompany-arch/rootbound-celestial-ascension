// ===== NPCART: original procedural anime NPC bodies, one distinct silhouette per archetype =====
// Every body is drawn at the feet origin (0,0), facing right, in world px, and NPC2 (77-npcs2.js) caches each pose frame on an offscreen canvas.
// o = {a: animation name, u: phase 0..1 (already quantized to a frame), b: blink, v: variant, c: palette, L: face look for AC6.head}
const NPCART=(()=>{
 const OL='#140c1c',TAU=6.2832,{sin,cos,abs,max,min,PI}=Math,S=(c,k)=>AC6.shade(c,k);
 const pg=(...a)=>x=>{x.beginPath();x.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)x.lineTo(a[i],a[i+1]);x.closePath()};
 const el=(cx,cy,rx,ry,r)=>x=>{x.beginPath();x.ellipse(cx,cy,rx,ry,r||0,0,TAU)};
 const rrp=(X,Y,w,h,r)=>x=>{x.beginPath();x.roundRect(X,Y,w,h,r)};
 // cel fill: dark base, lit shape nudged toward the light, ink outline (same language as the player renderer)
 function cel(x,p,c,lw){p(x);x.fillStyle=S(c,-.3);x.fill();x.save();p(x);x.clip();x.translate(1.4,-1.2);p(x);x.fillStyle=c;x.fill();x.restore();p(x);x.strokeStyle=OL;x.lineWidth=lw||1.1;x.stroke()}
 function line(x,pts,w,c){x.lineCap=x.lineJoin='round';x.beginPath();x.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)x.lineTo(pts[i],pts[i+1]);x.strokeStyle=OL;x.lineWidth=w+2.2;x.stroke();x.strokeStyle=c;x.lineWidth=w;x.stroke()}
 const dot=(x,cx,cy,r,c)=>{x.beginPath();x.arc(cx,cy,r,0,TAU);x.fillStyle=c;x.fill();x.strokeStyle=OL;x.lineWidth=1;x.stroke()};
 function ik(sx,sy,hx,hy,a,b,bend){let dx=hx-sx,dy=hy-sy,d=Math.hypot(dx,dy)||.01;if(d>a+b-.05){const k=(a+b-.05)/d;dx*=k;dy*=k;d=a+b-.05}const an=Math.atan2(dy,dx),c=Math.acos(max(-1,min(1,(a*a+d*d-b*b)/(2*a*d)))),e=an+bend*c;return[sx,sy,sx+cos(e)*a,sy+sin(e)*a,sx+dx,sy+dy]}
 // two-bone arm; c2 = forearm colour (rolled sleeves), returns the joint points
 function arm(x,sx,sy,hx,hy,a,b,w,c,hc,c2,bend){const p=ik(sx,sy,hx,hy,a,b,bend==null?1:bend);if(c2){line(x,p.slice(2),w*.92,c2);line(x,p.slice(0,4),w,c)}else line(x,p,w,c);if(hc)dot(x,p[4],p[5],w*.6,hc);return p}
 function leg(x,hx,hy,fx,fy,a,b,w,c,boot,bl){const p=ik(hx,hy,fx,fy-4,a,b,-1);line(x,p,w,c);const X=p[4];cel(x,pg(X-3.2,fy-5.5,X+2.6,fy-5.5,X+(bl||5.8),fy-1.6,X+(bl||5.8),fy,X-3.4,fy),boot,1)}
 // walk cycle helper: f(s) foot x, l(s) foot lift, bob, arm swing
 const gait=(o,str,lift)=>{const w=o.a=='walk',ph=o.u*TAU;return{w,bob:w?-abs(sin(ph))*1.6:sin(ph)*.55,f:s=>w?sin(ph+(s>0?0:PI))*str:0,l:s=>w?max(0,-cos(ph+(s>0?0:PI)))*lift:0,sw:w?sin(ph):0}};
 function face(x,L,hx,hy,sc,blink,back,front){x.save();x.translate(hx,hy);x.scale(sc,sc);if(back)back(x);AC6.head(x,L,0,0,false,blink,0);if(front)front(x);x.restore()}
 // fringe + skull cap (+ optional spikes), head-local coords
 function hairF(x,col,o){o=o||{};const dn=o.bang||5,sw=o.sw||1;
  cel(x,p=>{p.beginPath();p.moveTo(-10.8,1);p.bezierCurveTo(-12.2,-10,-6,-15.6,1,-15.6);p.bezierCurveTo(8,-15.6,12.4,-9,11,1);p.lineTo(9.2,-3.5);for(let i=5;i>=0;i--){const X=-9+i*3.6,tip=-3+dn*(.55+.45*sin(i*1.9+1));p.lineTo(X+sw*2.2,tip+(i%2?1.5:0));p.lineTo(X-1.7,-6.5)}p.closePath()},col,1.1);
  if(o.spk)cel(x,p=>{p.beginPath();p.moveTo(-9,-8);for(let i=0;i<o.spk;i++){const X=-9+(i+.5)/o.spk*18,H=o.sh*(.7+.5*sin(i*2.3+.7));p.lineTo(X-2.4,-11);p.lineTo(X-sw*3.4,-12-H);p.lineTo(X+2.4,-11)}p.lineTo(9,-8);p.closePath()},col,1);
  x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1.2;x.beginPath();x.moveTo(-5,-11.5);x.quadraticCurveTo(0,-14.5,5,-11.5);x.stroke()}
 const star4=(x,cx,cy,r,c)=>{x.fillStyle=c;x.beginPath();x.moveTo(cx,cy-r);x.quadraticCurveTo(cx,cy,cx+r,cy);x.quadraticCurveTo(cx,cy,cx,cy+r);x.quadraticCurveTo(cx,cy,cx-r,cy);x.quadraticCurveTo(cx,cy,cx,cy-r);x.fill()};

 // ---------------- MERCHANT (Mira): wide feathered hat, pouch belt, big satchel, monocle; inspects goods, flips coins
 function merchant(x,o){const L=o.L,c=o.c,g=gait(o,5,3),a=o.a,u=o.u,b=g.bob,hip=-20+b,sh=-35+b,tl=sin(u*TAU)*1.5+(g.w?-2.5:0),bg=g.w?sin(u*TAU*2)*1.2:0;
  let fx=-8-g.sw*3,fy=hip+1;if(a=='inspect'){fx=3;fy=-29+b}else if(a=='coins'){fx=4;fy=hip-3}
  arm(x,-6,sh+3,fx,fy,8.5,8.5,3.8,S(c.coat,-.22),c.skin);
  cel(x,rrp(-17,hip-7+bg,12,12,3),c.bag,1.1);cel(x,pg(-17,hip-7+bg,-5,hip-7+bg,-6,hip-2+bg,-16,hip-2+bg),S(c.bag,.18),1);dot(x,-11,hip-2.5+bg,1.3,'#ffd24a');
  leg(x,-2.5,hip,-2.5+g.f(-1)-1,-g.l(-1),9.5,9.5,4.4,S(c.pants,-.18),c.boot);leg(x,2.5,hip,2.5+g.f(1)+1,-g.l(1),9.5,9.5,4.6,c.pants,c.boot);
  const sw=g.w?-g.sw*1.6:sin(u*TAU)*.6;cel(x,pg(-9,hip-4,9,hip-4,12.5+sw,-7,5,-5.5,0,-8.5,-4,-5.5,-12.5+sw,-7),S(c.coat,-.08),1.1);
  cel(x,pg(-9,sh+1,9,sh+1,8,hip,-8,hip),c.coat,1.1);x.fillStyle=S(c.coat,.25);x.fillRect(-1,sh+3,2,hip-sh-4);
  x.strokeStyle=S(c.bag,-.35);x.lineWidth=2.4;x.beginPath();x.moveTo(7,sh+1.5);x.lineTo(-8,hip-3);x.stroke();
  cel(x,rrp(-8.5,hip-4.5,17,3.6,1),c.sash,.9);for(const[px,w]of[[1.2,4.6],[6.2,3.8],[-4,3.6]])cel(x,rrp(px-w/2,hip-1.6,w,5.4,1.6),c.pouch,.9);
  cel(x,pg(-4,sh+1,-1,sh+2.5,-9+tl*1.4,sh+12,-12.5+tl*1.4,sh+9.5),S(c.scarf,-.1),1);cel(x,pg(-6.5,sh-1.8,6.5,sh-1.8,6,sh+3.2,-6,sh+3.2),c.scarf,1);
  face(x,L,1,-46+b,1.08,o.b,h=>{cel(h,p=>{p.beginPath();p.moveTo(-6,-9);p.bezierCurveTo(-16,-9,-19+tl,3,-15+tl,17);p.bezierCurveTo(-12,9,-10,2,-5,0);p.closePath()},L.hair,1);cel(h,pg(-9,-9,-14,-14,-13,-5),c.scarf,.9);cel(h,pg(-9,-9,-15,-6,-12,-2),c.scarf,.9)},
   h=>{hairF(h,L.hair,{bang:5});h.strokeStyle='#e0b84a';h.lineWidth=1.3;h.beginPath();h.arc(5.6,1.3,4.3,0,TAU);h.stroke();h.lineWidth=.8;h.beginPath();h.moveTo(9.6,2.8);h.quadraticCurveTo(11.5,8,7.5,11.5);h.stroke();
    if(a=='inspect'&&u>.4&&u<.75){h.globalAlpha=.85;star4(h,7.4,-1,3.4,'#fff');h.globalAlpha=1}
    cel(h,p=>{p.beginPath();p.moveTo(-8,-12);p.bezierCurveTo(-8,-21,-5,-24,1,-24);p.bezierCurveTo(7,-24,9.5,-21,9,-12);p.closePath()},c.hat,1.1);h.fillStyle=c.scarf;h.fillRect(-8.2,-15.6,17.2,2.6);
    cel(h,p=>{p.beginPath();p.moveTo(-5,-19);p.bezierCurveTo(-12,-28,-19,-27,-25,-22);p.bezierCurveTo(-19,-24,-12,-22,-6,-15);p.closePath()},'#f4efe0',.9);
    cel(h,el(1,-11.5,19.5,4,-.05),S(c.hat,.08),1.1)});
  let hx=8.5+g.sw*3,hy=hip+.5,gem=0,coin=0;
  if(a=='inspect'){hx=13;hy=-43+b;gem=1}else if(a=='coins'){hx=11;hy=hip-5;coin=1}else if(a=='greet'){hx=14+sin(u*TAU*2)*2;hy=-49+b}else if(a=='talk'){hx=16;hy=-32+b+sin(u*TAU)*1.5}
  arm(x,6,sh+3,hx,hy,9,9,4,c.coat,c.skin);
  if(gem){const w=1+3*abs(cos(u*TAU));cel(x,pg(hx,hy-8,hx+w,hy-4.5,hx,hy-1.5,hx-w,hy-4.5),'#7fe9ff',.9)}
  if(coin){const cy=hy-5-abs(sin(u*PI))*15;cel(x,el(hx,cy,.8+2.6*abs(cos(u*TAU*1.5)),2.8),'#ffd24a',.9)}}

 // ---------------- BLACKSMITH (Bram): broad shoulders, leather apron, heavy gloves, goggles; hammers at the anvil
 function smith(x,o){const L=o.L,c=o.c,g=gait(o,4.5,2.6),a=o.a,u=o.u;let b=g.bob,lean=0,k=0;
  if(a=='work'){k=u<.55?u/.55:u<.7?1-(u-.55)/.15:0;lean=u>=.55&&u<.85?2.2:k*-.6;b+=u>=.6&&u<.85?1.2:0}
  const hip=-22+b,sh=-40+b+(a=='work'?abs(lean)*.3:0);
  let fx=-11-g.sw*3,fy=hip+2;if(a=='work'){fx=17;fy=-24}else if(a=='talk'){fx=-9;fy=hip-2}
  arm(x,-10+lean,sh+4,fx,fy,10,10,6,S(c.shirt,-.22),c.glove,S(c.skin,-.2));
  if(a=='work'){x.strokeStyle='#3a3a44';x.lineWidth=2;x.beginPath();x.moveTo(fx,fy);x.lineTo(fx+9,fy+1.5);x.stroke();x.fillStyle='#ff9a3a';x.fillRect(fx+6,fy-.5,8,3)}
  leg(x,-3.5+lean*.3,hip,-4+g.f(-1),-g.l(-1),10.5,10.5,6.2,S(c.pants,-.18),c.boot,6.4);leg(x,3.5+lean*.3,hip,4.5+g.f(1),-g.l(1),10.5,10.5,6.4,c.pants,c.boot,6.4);
  cel(x,pg(-14+lean,sh,14+lean,sh,10,hip+1,-10,hip+1),c.shirt,1.1);
  cel(x,pg(-8+lean,sh+5,9+lean,sh+5,12,-8,-10,-8),c.apron,1.1);x.strokeStyle=S(c.apron,-.4);x.lineWidth=1;x.strokeRect(-3+lean*.5,hip-4,7,5);
  x.strokeStyle=S(c.apron,-.45);x.lineWidth=1.6;x.beginPath();x.moveTo(-7+lean,sh+5.5);x.lineTo(-3+lean,sh-1);x.moveTo(8+lean,sh+5.5);x.lineTo(4+lean,sh-1);x.stroke();
  cel(x,rrp(-10.5,hip-3,21,3.6,1),S(c.apron,-.5),.9);
  face(x,L,2+lean,-52+b,1.04,o.b,null,h=>{hairF(h,L.hair,{bang:3,spk:6,sh:5});h.fillStyle='rgba(40,25,20,.35)';for(let i=0;i<9;i++)h.fillRect(-4+i*1.5,8.5+(i%2),1,1);
   h.strokeStyle='#2a2630';h.lineWidth=2.4;h.beginPath();h.moveTo(-11,-8.5);h.lineTo(11,-8.5);h.stroke();for(const s of[-3.2,5.4]){h.fillStyle='#4a4f5a';h.beginPath();h.arc(s,-9,4,0,TAU);h.fill();h.strokeStyle=OL;h.lineWidth=1;h.stroke();h.fillStyle='rgba(160,220,255,.85)';h.beginPath();h.arc(s,-9,2.6,0,TAU);h.fill();h.fillStyle='#fff';h.fillRect(s-1.4,-10.4,1.2,1.2)}});
  const shx=10+lean,shy=sh+4;let ang=1.5+g.sw*.3,dir=1.6,hx,hy;
  if(a=='work'){ang=.55-k*2.9;dir=ang+.45}else if(a=='greet'){ang=-1.2-sin(u*TAU*2)*.25;dir=-1.6}else if(a=='talk'){ang=.15;dir=.35}else if(a=='wipe'){ang=-2.2;dir=-2.9}
  if(a=='wipe'){hx=7+lean;hy=-58+b}else{hx=shx+cos(ang)*18;hy=shy+sin(ang)*18}
  const hammer=()=>{x.save();x.translate(hx,hy);x.rotate(dir);line(x,[0,0,17,0],2.4,'#7a5232');cel(x,rrp(14,-5,7,10,1.5),'#7d8492',1);x.fillStyle='#c8d0dc';x.fillRect(19.5,-4,1.2,8);x.restore()};
  if(a=='wipe'){x.save();x.translate(-12,hip+4);x.rotate(1.75);line(x,[0,0,14,0],2.4,'#7a5232');cel(x,rrp(12,-5,7,10,1.5),'#7d8492',1);x.restore()}
  if(dir<0&&a!='wipe')hammer();arm(x,shx,shy,hx,hy,10,10,6.4,c.shirt,c.glove,S(c.skin,-.05));if(dir>=0)hammer();
  dot(x,hx,hy,4,c.glove)}

 // ---------------- FARMER (Hana): straw hat, braids, denim overalls, watering can; waters and tends the crops
 function farmer(x,o){const L=o.L,c=o.c,g=gait(o,4.6,3),a=o.a,u=o.u,tend=a=='tend';let b=g.bob;if(tend)b=0;
  const hip=tend?-11:-18+b,sh=tend?-25:-33+b,lx=tend?3:0;
  let fx=-8-g.sw*3,fy=hip+1;if(tend){fx=10;fy=-10}else if(a=='water'){fx=7;fy=-25}else if(a=='idle'||a=='wipe'){fx=-9;fy=hip-3}
  arm(x,-6+lx,sh+3,fx,fy,8,8,3.8,S(c.shirt,-.2),c.skin);
  if(tend){leg(x,-2.5,hip,-3,0,8,8,4.6,S(c.over,-.18),c.boot);leg(x,3,hip,8,0,8,8,4.8,c.over,c.boot)}
  else{leg(x,-2.5,hip,-2.5+g.f(-1)-1,-g.l(-1),8.5,8.5,4.6,S(c.over,-.18),c.boot);leg(x,2.5,hip,2.5+g.f(1)+1,-g.l(1),8.5,8.5,4.8,c.over,c.boot)}
  cel(x,pg(-8.5+lx,sh+1,8.5+lx,sh+1,8,hip,-8,hip),c.shirt,1.1);cel(x,pg(-6.5+lx,sh+7,6.5+lx,sh+7,8.2,hip+2,-8.2,hip+2),c.over,1.1);
  x.strokeStyle=S(c.over,-.35);x.lineWidth=1.8;x.beginPath();x.moveTo(-5.5+lx,sh+7.5);x.lineTo(-6+lx,sh+1);x.moveTo(5.5+lx,sh+7.5);x.lineTo(5+lx,sh+1);x.stroke();dot(x,-5+lx,sh+8,1.1,'#ffd24a');dot(x,5+lx,sh+8,1.1,'#ffd24a');x.strokeStyle=S(c.over,-.3);x.lineWidth=.9;x.strokeRect(-2.5+lx,sh+10,5,4);
  face(x,L,1+lx*1.3,(tend?-36:-44+b),1.1,o.b,h=>{for(const s of[-1,1]){const bx=s<0?-10:-6;cel(h,p=>{p.beginPath();p.moveTo(bx,-2);p.quadraticCurveTo(bx-3,8,bx-1.5,15);p.lineTo(bx+2,15);p.quadraticCurveTo(bx+1.5,7,bx+3.5,-2);p.closePath()},s<0?S(L.hair,-.15):L.hair,1);dot(h,bx+.2,15.5,1.6,c.band)}},
   h=>{hairF(h,L.hair,{bang:4,sw:-1});cel(h,p=>{p.beginPath();p.moveTo(-9,-11);p.bezierCurveTo(-9,-21,-4,-23,1,-23);p.bezierCurveTo(6,-23,10,-21,10,-11);p.closePath()},c.hat,1.1);h.fillStyle=c.band;h.fillRect(-9.2,-14.5,19.4,3);
    cel(h,el(1,-11,21,4.4,.04),S(c.hat,.06),1.1);h.strokeStyle=S(c.hat,-.3);h.lineWidth=.6;h.beginPath();for(let i=-3;i<=3;i++){h.moveTo(1+i*5.5,-13.8);h.lineTo(1+i*6.4,-8.2)}h.stroke()});
  let hx=8.5+g.sw*3,hy=hip+1,can=1,tilt=0;
  if(tend){hx=15;hy=-2-abs(sin(u*TAU*2))*2;can=0}else if(a=='water'){hx=12;hy=-27;tilt=u<.2?u/.2*.75:u>.85?(1-u)/.15*.75:.75}else if(a=='greet'){hx=14+sin(u*TAU*2)*2;hy=-46+b;can=0}else if(a=='talk'){hx=15;hy=-28+b;can=0}else if(a=='wipe'){hx=7;hy=-46;can=0}
  if(can){x.save();x.translate(hx,hy+(a=='water'?0:6));x.rotate(tilt);cel(x,rrp(-5,-1,10,8,2),c.can,1);line(x,[4,2,11,-3],1.6,c.can);x.strokeStyle=OL;x.lineWidth=1;x.beginPath();x.arc(-1,-1,4,PI,0);x.stroke();x.restore();
   if(tilt>.5){const tx=hx+cos(tilt)*11+3*sin(tilt),ty=hy+sin(tilt)*11-3*cos(tilt)+1;x.fillStyle='#8fd4ff';for(let i=0;i<5;i++){const s=((u*5+i*.2)%1);x.beginPath();x.arc(tx+s*6,ty+s*s*24,1.2,0,TAU);x.fill()}}}
  else if(a=='greet'||a=='talk'||a=='wipe'){x.save();x.translate(-11,hip+8);cel(x,rrp(-4,-1,9,7,2),c.can,1);x.restore()}
  arm(x,6+lx,sh+3,hx,hy,8,8,4,c.shirt,c.skin)}

 // ---------------- GUARD (Kael): plumed helmet, pauldrons, tabard, round shield on the back, tall spear; marches a patrol
 function guard(x,o){const L=o.L,c=o.c,g=gait(o,6,5),a=o.a,u=o.u,b=g.bob,hip=-22+b,sh=-39+b,nod=a=='greet'?sin(u*PI)*1.6:0,lift=a=='greet'?-sin(u*PI)*6:0;
  cel(x,el(-11,-30+b,10,12),c.shield,1.2);x.strokeStyle=c.gold;x.lineWidth=1.6;x.beginPath();x.ellipse(-11,-30+b,7.6,9.6,0,0,TAU);x.stroke();star4(x,-11,-30+b,4,c.gold);
  arm(x,-7,sh+3,-9-g.sw*2,hip,9,9,4.2,S(c.armor,-.25),S(c.glove,-.1));
  leg(x,-3,hip,-3+g.f(-1),-g.l(-1),10,10,4.8,S(c.pants,-.2),c.armorD);leg(x,3,hip,3+g.f(1),-g.l(1),10,10,5,c.pants,c.armorD);
  cel(x,el(-10,sh+2,6,4.6),S(c.armor,-.12),1);
  cel(x,pg(-11,sh,11,sh,9,hip+1,-9,hip+1),c.armor,1.1);x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1.2;x.beginPath();x.moveTo(3,sh+3);x.lineTo(2,hip-3);x.stroke();
  cel(x,pg(-6,sh+7,6,sh+7,7,-8,0,-5.5,-7,-8),c.tab,1);x.strokeStyle=c.gold;x.lineWidth=1;x.beginPath();x.moveTo(-6,sh+9);x.lineTo(6,sh+9);x.stroke();star4(x,0,hip-6,2.4,c.gold);
  cel(x,rrp(-9.5,hip-2.5,19,3.4,1),'#4a3a2a',.9);x.fillStyle=c.gold;x.fillRect(-1.5,hip-2.8,3,4);
  face(x,L,1,-51+b+nod,1.02,o.b,null,h=>{
   cel(h,p=>{p.beginPath();p.moveTo(-6,-16);p.bezierCurveTo(-14,-24,-24,-18,-26,-5);p.lineTo(-22,-9);p.lineTo(-21,-2);p.lineTo(-17,-8);p.bezierCurveTo(-14,-14,-9,-14,-4,-12);p.closePath()},c.plume,1);
   cel(h,p=>{p.beginPath();p.moveTo(-11.5,2);p.bezierCurveTo(-13,-10,-7,-17,1,-17);p.bezierCurveTo(8,-17,12.6,-11,11.6,-3);p.lineTo(11.6,-1);p.lineTo(-7,-3);p.lineTo(-8,4);p.closePath()},c.armor,1.1);
   cel(h,rrp(-9,-5.5,22,3.6,1),S(c.armor,-.2),1);cel(h,pg(5,-4,7.5,-4,7,4,5.6,4),S(c.armor,-.1),.9);x.fillStyle=c.gold;h.fillStyle=c.gold;h.fillRect(-1,-16.6,2.4,5)});
  const sx=13+(g.w?2:0),top=-92+lift;line(x,[sx,1+lift,sx-(g.w?1.5:0),top],2.2,c.shaft);cel(x,pg(sx-1.5,top,sx+2,top-6,sx-1.5,top-15,sx-5,top-6),c.tip,1);x.fillStyle=c.plume;x.beginPath();x.moveTo(sx-1.5,top+1);x.lineTo(sx-5,top+9);x.lineTo(sx+1.5,top+8);x.closePath();x.fill();
  cel(x,el(10,sh+2,6,4.6),c.armor,1);
  arm(x,7,sh+3,sx-1,-23+b+lift*.6,9,9,4.4,S(c.armor,-.05),c.glove)}

 // ---------------- MAGE (Seren): tall witch hat, flowing robe + capelet, long silver hair, crescent-moon staff, spellbook
 function mage(x,o){const L=o.L,c=o.c,g=gait(o,3.4,1.5),a=o.a,u=o.u,b=g.bob*.6,hip=-24+b,sh=-42+b,sw=g.w?-g.sw*2:sin(u*TAU)*1.2,cast=a=='cast';
  face(x,L,1,-53+b,1.04,false,h=>{cel(h,p=>{p.beginPath();p.moveTo(-9,-6);p.bezierCurveTo(-17,4,-16+sw*.5,20,-13+sw,32);p.lineTo(-3,30);p.bezierCurveTo(-2,18,4,6,8,-4);p.closePath()},L.hair,1)});
  let fx=-5-g.sw*2,fy=hip+2;if(a=='read'){fx=7;fy=-35+b}else if(cast){fx=17;fy=-44+b}else if(a=='greet'){fx=-17+sin(u*TAU*2)*2.5;fy=-52+b}else if(a=='talk'){fx=14;fy=-37+b}
  const fp=arm(x,-6,sh+4,fx,fy,9.5,9.5,5.6,S(c.robe,-.25),c.skin);cel(x,el(fp[4]-1,fp[5]-1.5,3.6,2.4,-.4),S(c.trim,-.2),.8);
  if(g.w)for(const s of[-1,1])cel(x,el(s*3+g.f(s)*.8+2,-1.5,4,2),'#2a1f3a',.9);
  cel(x,pg(-10,sh,10,sh,15+sw,-1.5,6,-.5,0,-2,-6,-.5,-15+sw,-1.5),c.robe,1.1);cel(x,pg(1,sh+4,5,sh+4,8+sw*.5,-1.5,-1+sw*.3,-1.5),c.inner,1);
  x.strokeStyle=c.trim;x.lineWidth=1.4;x.beginPath();x.moveTo(-14.5+sw,-2.6);x.lineTo(14.5+sw,-2.6);x.stroke();cel(x,rrp(-8,hip-3,16,3,1),c.trim,.8);dot(x,0,hip-1.5,1.6,c.gem);
  cel(x,pg(-11,sh-1,11,sh-1,13,sh+9,0,sh+11.5,-13,sh+9),c.cape,1.1);
  face(x,L,1,-53+b,1.04,o.b,null,h=>{hairF(h,L.hair,{bang:7,sw:-1});
   cel(h,p=>{p.beginPath();p.moveTo(-9.5,-13);p.bezierCurveTo(-8,-26,-6,-36,-14,-48);p.bezierCurveTo(-2,-40,4,-28,9.5,-13);p.closePath()},c.hat,1.1);h.fillStyle=c.trim;h.fillRect(-9.4,-17,19,2.8);star4(h,-14,-49,3.6,c.trim);
   cel(h,el(.5,-12.5,18.5,3.8,-.04),S(c.hat,.1),1.1);star4(h,4,-15.6,2,'#fff')});
  const ang=cast?.5*sin(min(1,u*2)*PI*.5):0,hx=12,hy=-30+b+(cast?-6:0);x.save();x.translate(hx,hy);x.rotate(ang);
  line(x,[1,32,0,-52],2.2,c.staff);x.strokeStyle=OL;x.lineWidth=1;
  cel(x,p=>{p.beginPath();p.arc(0,-60,8.5,PI*.35,PI*1.65,false);p.arc(-2.6,-60,6.2,PI*1.6,PI*.4,true);p.closePath()},c.moon,1);
  x.save();x.shadowColor=c.gem;x.shadowBlur=cast?10:5;dot(x,1.4,-60,2.8,c.gem);x.restore();star4(x,1.4,-60,cast?6:4,'rgba(255,255,255,.85)');
  cel(x,pg(-2,-50,2,-50,4,-45,-4,-45),c.trim,.8);x.restore();
  if(a=='read'){cel(x,pg(fx-1,fy-5,fx+9,fy-7,fx+10,fy+1,fx,fy+3),c.book,1);x.fillStyle=c.page;x.beginPath();x.moveTo(fx+.5,fy-4);x.lineTo(fx+8.5,fy-5.8);x.lineTo(fx+9,fy);x.lineTo(fx+1,fy+1.8);x.fill();x.strokeStyle='rgba(80,60,40,.5)';x.lineWidth=.6;for(let i=0;i<3;i++){x.beginPath();x.moveTo(fx+2,fy-2.5+i*1.6);x.lineTo(fx+7.5,fy-3.7+i*1.6);x.stroke()}
   if(u>.5&&u<.84){x.fillStyle='#fffaf0';x.beginPath();x.moveTo(fx+4.8,fy-5);x.quadraticCurveTo(fx+3+(u-.5)*12,fy-11,fx+1,fy-4);x.fill()}}
  if(cast){const r=5+u*9;x.save();x.globalCompositeOperation='lighter';x.strokeStyle='rgba(140,230,255,'+(.9-u*.5)+')';x.lineWidth=1.2;x.beginPath();x.ellipse(fx+9,fy-4,r*.45,r,0,0,TAU);x.stroke();for(let i=0;i<6;i++){const q=i/6*TAU+u*3;x.fillStyle='rgba(220,200,255,.9)';x.fillRect(fx+9+cos(q)*r*.45-.8,fy-4+sin(q)*r-.8,1.6,1.6)}x.restore()}
  arm(x,7,sh+4,hx-.5,hy+1,9.5,9.5,5.8,c.robe,c.skin);cel(x,el(hx-1,hy-1,4,2.6,-.5),S(c.trim,-.1),.8)}

 // ---------------- TRAVELER (Ren): long dark coat, high collar, giant backpack + bedroll, scarf; checks the map, rests on the pack
 function traveler(x,o){const L=o.L,c=o.c,g=gait(o,5.5,3.4),a=o.a,u=o.u,sit=a=='sit';let b=sit?0:g.bob;
  const hip=sit?-8:-21+b,sh=sit?-24:-38+b,lb=sit?-3:0,fl=g.w?g.sw*2.5:sin(u*TAU)*.8;
  cel(x,rrp(-21+lb,sh-3,13,25,3),c.pack,1.1);cel(x,rrp(-23+lb,sh-9,17,6.5,3),c.roll,1.1);x.strokeStyle=S(c.roll,-.35);x.lineWidth=1;x.beginPath();x.moveTo(-18+lb,sh-9);x.lineTo(-18+lb,sh-2.5);x.moveTo(-11+lb,sh-9);x.lineTo(-11+lb,sh-2.5);x.stroke();cel(x,rrp(-20+lb,sh+8,6,7,2),S(c.pack,-.12),.9);dot(x,-22+lb,sh+18,2.2,'#9aa0aa');
  let fx=-6-g.sw*3,fy=hip+1;if(a=='map'){fx=9;fy=-37+b}else if(sit){fx=6;fy=-13}else if(a=='stretch'){fx=-1;fy=-62+sin(u*PI)*2}
  arm(x,-6+lb,sh+3,fx,fy,9,9,4.2,S(c.coat,-.25),c.skin);
  if(sit){leg(x,-2,hip,9,0,9,9.5,4.8,S(c.pants,-.18),c.boot);leg(x,2.5,hip,15,0,9,9.5,5,c.pants,c.boot)}
  else{leg(x,-2.6,hip,-2.6+g.f(-1)-1,-g.l(-1),9.5,9.5,4.8,S(c.pants,-.18),c.boot);leg(x,2.6,hip,2.6+g.f(1)+1,-g.l(1),9.5,9.5,5,c.pants,c.boot)}
  if(!sit){cel(x,pg(-9,hip-3,-1,hip-3,-3,-5,-14+fl,-5.5),S(c.coat,-.12),1.1);cel(x,pg(-1,hip-3,9,hip-3,11.5+fl*.5,-6.5,1,-5),S(c.coat,-.04),1.1)}
  else cel(x,pg(-9+lb,hip-3,9,hip-3,10,-1,-12,-1),S(c.coat,-.08),1.1);
  cel(x,pg(-10+lb,sh,10+lb*.5,sh,9,hip,-9,hip),c.coat,1.1);cel(x,pg(-.5+lb*.5,sh+1,5+lb*.5,sh+1,3,hip-2),c.inner,.8);
  x.strokeStyle='#18161c';x.lineWidth=2;x.beginPath();x.moveTo(-6+lb,sh+1);x.lineTo(-4,hip-2);x.stroke();cel(x,rrp(-9.5,hip-3,19,3,1),'#1a1820',.8);dot(x,2,hip-1.5,1.2,'#b8bcc8');
  cel(x,pg(-8.5+lb,sh+2,-4+lb,sh-6.5,0+lb*.5,sh+1),S(c.coat,.1),1);cel(x,pg(8+lb*.5,sh+2,4+lb*.5,sh-6.5,0+lb*.5,sh+1),S(c.coat,.15),1);
  const sc=g.w?-3:sin(u*TAU)*1.2;cel(x,pg(-3+lb,sh-1,0+lb,sh,-11+sc+lb,sh+10,-14+sc+lb,sh+8),S(c.scarf,-.1),1);cel(x,pg(-5.5+lb,sh-2,5.5+lb,sh-2,5,sh+2.5,-5,sh+2.5),c.scarf,1);
  face(x,L,1+lb,-49+b+(sit?14:0),1.05,o.b,h=>{cel(h,p=>{p.beginPath();p.moveTo(-9,-8);p.lineTo(-14,0);p.lineTo(-10.5,1);p.lineTo(-13,7);p.lineTo(-7,6);p.lineTo(-4,0);p.closePath()},L.hair,1)},h=>hairF(h,L.hair,{bang:8,spk:6,sh:5.5,sw:-1}));
  let hx=9+g.sw*3,hy=hip+1;if(a=='map'){hx=17;hy=-36+b}else if(sit){hx=13;hy=-12}else if(a=='greet'){hx=9+sin(u*TAU*2)*1.5;hy=-55+b}else if(a=='talk'){hx=16;hy=-33+b}else if(a=='stretch'){hx=7;hy=-64+sin(u*PI)*2}
  if(a=='map'){const op=.6+.4*sin(min(1,u*1.6)*PI*.5);cel(x,pg(fx,fy-5,fx+(hx-fx)*op+2,fy-6,hx+1,hy+4,fx+1,fy+5),c.map,1);x.strokeStyle='rgba(120,80,40,.6)';x.lineWidth=.7;x.beginPath();x.moveTo(fx+3,fy-2);x.lineTo(fx+5,fy+1);x.lineTo(hx-3,hy-2);x.stroke();x.fillStyle='#d8434a';x.fillRect(hx-4,hy-1,1.6,1.6)}
  arm(x,6+lb*.5,sh+3,hx,hy,9.5,9.5,4.4,c.coat,c.skin)}

 // ---------------- ELDER SAGE (Oak): stooped back, long white beard, bushy brows, leaf crown, hands behind back, cane
 function elder(x,o){const L=o.L,c=o.c,g=gait(o,3.2,2),a=o.a,u=o.u,sit=a=='sit',b=sit?0:g.bob*.6,hip=sit?-14:-18+b,sh=sit?-28:-31+b,sx=sit?2:3,hdx=sit?7:9,hdy=sit?-37:-39+b,sw=g.w?-g.sw:sin(u*TAU)*.5;
  let fx=-9,fy=hip-5;if(a=='think'){fx=8;fy=-28}else if(a=='greet'){fx=-4+sin(u*TAU*2)*2;fy=-52+b}
  arm(x,sx-6,sh+3,fx,fy,8,8,4,S(c.robe,-.25),c.skin);
  if(sit){leg(x,-2,hip,5,0,8,8,4.2,S(c.robe,-.2),c.boot);leg(x,2,hip,9,0,8,8,4.4,S(c.robe,-.1),c.boot);cel(x,pg(-10,hip-3,10,hip-3,14,hip+4,-8,hip+3),c.robe,1.1)}
  else{for(const s of[-1,1])cel(x,el(s*3+g.f(s)+2,-1.6,4.2,2.1),c.boot,.9);
   cel(x,p=>{p.beginPath();p.moveTo(sx-5,sh-1);p.bezierCurveTo(-11,sh+1,-12,hip-2,-11+sw,-1.5);p.lineTo(11+sw,-1.5);p.bezierCurveTo(10,hip,9,sh+6,sx+7,sh+1);p.closePath()},c.robe,1.1);x.strokeStyle=c.trim;x.lineWidth=1.6;x.beginPath();x.moveTo(-10.6+sw,-2.6);x.lineTo(10.6+sw,-2.6);x.stroke()}
  if(sit)cel(x,p=>{p.beginPath();p.moveTo(sx-6,sh-1);p.bezierCurveTo(-12,sh+3,-11,hip,-9,hip);p.lineTo(9,hip);p.bezierCurveTo(9,sh+6,sx+7,sh+3,sx+7,sh+1);p.closePath()},c.robe,1.1);
  cel(x,rrp(-9,hip-3,18,3.2,1),c.sash,.9);
  face(x,L,hdx,hdy,1.04,o.b,h=>{cel(h,p=>{p.beginPath();p.moveTo(-8,-6);p.quadraticCurveTo(-14,-2,-11,7);p.lineTo(-7,5);p.closePath()},L.hair,1)},h=>{
   cel(h,p=>{p.beginPath();p.moveTo(-10.6,-2);p.bezierCurveTo(-11.5,-12,-5,-15,1,-15);p.bezierCurveTo(7,-15,11.5,-11,10.8,-3);p.bezierCurveTo(6,-9,-4,-10,-10.6,-2);p.closePath()},S(L.hair,-.05),1);
   h.strokeStyle='#fff';h.lineWidth=2.3;h.lineCap='round';h.beginPath();h.moveTo(-6.5,-4.2);h.lineTo(-1,-5.2);h.moveTo(2.5,-5.4);h.lineTo(9.5,-4.6);h.stroke();
   const bw=sin(u*TAU)*.8+(a=='think'?sin(u*TAU*2):0);cel(h,p=>{p.beginPath();p.moveTo(-5,6);p.quadraticCurveTo(-6,15,-1+bw,24);p.lineTo(1.5+bw,20);p.lineTo(3+bw,25);p.quadraticCurveTo(8,15,9,6);p.quadraticCurveTo(4,9.5,2,9);p.quadraticCurveTo(-1,9.5,-5,6);p.closePath()},L.hair,1);
   h.strokeStyle=S(L.hair,-.2);h.lineWidth=1.6;h.beginPath();h.moveTo(-.5,7.6);h.quadraticCurveTo(3,6.4,7,7.8);h.stroke();
   for(let i=-3;i<=3;i++){h.save();h.translate(i*3.6,-13.6+abs(i)*1.2);h.rotate(i*.5);cel(h,el(0,-2.6,1.9,3.6),i%2?c.leaf:S(c.leaf,-.15),.8);h.restore()}});
  let hx=16+g.f(1)*.5,hy=-21+b,ctop=[18+g.f(1)*.6,0,16+g.f(1)*.5,-23+b];
  if(sit){hx=11;hy=-17;ctop=[13,0,11,-19]}else if(a=='talk'){hx=15;hy=-40+b+sin(u*TAU)*1.5;ctop=[19,0,13,-21]}else if(a=='think'){ctop=[19,0,14,-21];hx=11;hy=-28}else if(a=='greet'){ctop=[19,0,14,-21]}
  line(x,ctop,2.1,c.cane);x.strokeStyle=OL;x.lineWidth=4.2;x.beginPath();x.arc(ctop[2]+2.4,ctop[3],2.4,PI,0);x.stroke();x.strokeStyle=c.cane;x.lineWidth=2.1;x.stroke();
  if(a=='talk'||a=='think'||a=='greet'){arm(x,sx+5,sh+3,a=='greet'?13:hx,a=='greet'?-44+b:hy,8,8,4.2,c.robe,c.skin);if(a=='talk')line(x,[hx,hy,hx+1,hy-4],1.5,c.skin)}
  else arm(x,sx+5,sh+3,hx,hy,8,8.5,4.2,c.robe,c.skin)}

 // ---------------- VILLAGERS: short and rounded. kid (Pip) / girl (Lulu, teahouse) / stout (Tobi the baker)
 function kid(x,o){const L=o.L,c=o.c,a=o.a,u=o.u,g=gait(o,4,3.2),sit=a=='sit',jump=a=='react'||a=='play'?-abs(sin(u*TAU*(a=='play'?1:.5)))*6:0,b=(sit?0:g.bob*1.2)+jump,hip=sit?-6:-10+b,sh=sit?-17:-21+b;
  let fx=-8-g.sw*3,fy=hip;if(sit){fx=-2;fy=-5}else if(a=='react'||a=='play'){fx=-9;fy=sh-9}else if(a=='greet'){fx=-14;fy=sh+1+sin(u*TAU*2)*2}
  arm(x,-6,sh+3,fx,fy,5.5,5.5,3.4,S(c.shirt,-.22),c.skin);
  if(sit){cel(x,el(-1,-3,7,2.8,.1),S(c.pants,-.15),1);cel(x,el(4,-2.6,7,2.8,-.1),c.pants,1)}
  else{leg(x,-2.2,hip,-2.2+g.f(-1),-g.l(-1)+jump*0,5.2,5.2,3.8,S(c.pants,-.18),c.boot,4.6);leg(x,2.2,hip,2.2+g.f(1),-g.l(1),5.2,5.2,4,c.pants,c.boot,4.6)}
  cel(x,el(0,sh+7,9.5,8.4),c.shirt,1.1);x.fillStyle=S(c.shirt,.3);x.fillRect(-6,sh+11,12,1.6);dot(x,3,sh+5,1.2,'#fff');
  face(x,L,1,(sit?-26:-31+b),1.28,o.b,null,h=>{hairF(h,L.hair,{bang:5});cel(h,p=>{p.beginPath();p.moveTo(-10.8,-5);p.bezierCurveTo(-11,-15,-5,-17.5,1,-17.5);p.bezierCurveTo(7,-17.5,11.5,-14,11,-5);p.closePath()},c.cap,1.1);cel(h,pg(6,-7.5,18,-6.5,17.5,-3.6,6,-4.6),S(c.cap,-.12),1);dot(h,1,-17.5,1.6,'#fff')});
  let hx=8+g.sw*3,hy=hip;if(sit){hx=7;hy=-5}else if(a=='greet'){hx=15;hy=sh+1-sin(u*TAU*2)*2}else if(a=='talk'){hx=12;hy=sh+6+sin(u*TAU)*1.5}else if(a=='react'||a=='play'){hx=9;hy=sh-9}
  arm(x,6,sh+3,hx,hy,5.5,5.5,3.6,c.shirt,c.skin)}
 function girl(x,o){const L=o.L,c=o.c,a=o.a,u=o.u,g=gait(o,4.2,3),sit=a=='sit',b=sit?0:g.bob,hip=sit?-8:-16+b,sh=sit?-22:-30+b,sw=g.w?-g.sw*1.4:sin(u*TAU)*.6;
  let fx=-7-g.sw*3,fy=hip+1;if(a=='sweep'){fx=10;fy=-24+b}else if(sit){fx=3;fy=-9}else if(a=='sip'){fx=6;fy=-26+b}
  arm(x,-6,sh+3,fx,fy,7,7,3.4,S(c.dress,-.22),c.skin);
  if(!sit)for(const s of[-1,1])leg(x,s*2.2,-9+b,s*2.2+g.f(s),-g.l(s),4,4.6,3.4,S(c.skin,s<0?-.15:0),c.boot,4.8);
  if(sit)cel(x,p=>{p.beginPath();p.moveTo(-8,sh+2);p.lineTo(8,sh+2);p.quadraticCurveTo(14,-6,15,-1);p.lineTo(-11,-1);p.quadraticCurveTo(-11,-6,-8,sh+2);p.closePath()},c.dress,1.1);
  else cel(x,p=>{p.beginPath();p.moveTo(-7.5,sh+1);p.lineTo(7.5,sh+1);p.quadraticCurveTo(11,hip,13.5+sw,-7);p.quadraticCurveTo(0,-4.5,-13.5+sw,-7);p.quadraticCurveTo(-11,hip,-7.5,sh+1);p.closePath()},c.dress,1.1);
  cel(x,p=>{p.beginPath();p.moveTo(-4,sh+6);p.lineTo(5,sh+6);p.lineTo(7+sw*.5,sit?-3:-8);p.quadraticCurveTo(1,sit?-1:-6,-6+sw*.5,sit?-3:-8);p.closePath()},c.apron,1);x.strokeStyle=S(c.apron,-.25);x.lineWidth=1.4;x.beginPath();x.moveTo(-7,sh+6);x.lineTo(7,sh+6);x.stroke();
  face(x,L,1,(sit?-33:-41+b),1.14,o.b,h=>{for(const s of[-1,1]){const bx=s<0?-11:-7,sw2=g.w?-1.5:0;cel(h,p=>{p.beginPath();p.moveTo(bx+2,-2);for(let i=0;i<4;i++){p.lineTo(bx-1+sw2*i*.4,3+i*4);p.lineTo(bx+3+sw2*i*.4,5+i*4)}p.lineTo(bx+4,-2);p.closePath()},s<0?S(L.hair,-.15):L.hair,1);dot(h,bx+1.5+sw2*1.6,19,1.8,c.clip)}},
   h=>{hairF(h,L.hair,{bang:6,sw:-1});for(let i=0;i<5;i++){const q=i/5*TAU;h.fillStyle=c.clip;h.beginPath();h.arc(8+cos(q)*2.6,-11+sin(q)*2.6,1.9,0,TAU);h.fill()}dot(h,8,-11,1.3,'#fff3a0')});
  let hx=8.5+g.sw*3,hy=hip+1,cup=0;if(a=='sweep'){hx=14;hy=-18+b}else if(sit){hx=8;hy=-9}else if(a=='sip'){cup=1;const up=u>.3&&u<.7;hx=up?8:9;hy=up?-37+b:-27+b}else if(a=='greet'){hx=14+sin(u*TAU*2)*2;hy=-42+b}else if(a=='talk'){hx=13;hy=-26+b+sin(u*TAU)*1.5}
  if(a=='sweep'){const sx=sin(u*TAU)*5;line(x,[hx-6,hy-10,15+sx,-3],1.8,'#9a7040');cel(x,pg(10+sx,-4,20+sx,-4,22+sx,0,8+sx,0),'#e0c070',1)}
  arm(x,6,sh+3,hx,hy,7,7.5,3.6,c.dress,c.skin);
  if(cup){cel(x,rrp(hx-1,hy-5,6,5,1.5),'#f4f0ff',.9);x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=1;x.beginPath();x.moveTo(hx+2,hy-6);x.quadraticCurveTo(hx+4,hy-9,hx+1.5,hy-12);x.stroke()}}
 function stout(x,o){const L=o.L,c=o.c,a=o.a,u=o.u,g=gait(o,4.2,2.6),st=a=='stretch',b=g.bob,hip=-15+b,sh=-31+b+(st?-sin(u*PI)*1.5:0);
  let fx=-11-g.sw*2,fy=hip+1;if(st){fx=-4;fy=-55+b}
  arm(x,-9,sh+3,fx,fy,7,7.5,4.6,S(c.shirt,-.22),c.skin);
  leg(x,-3.5,hip,-3.5+g.f(-1),-g.l(-1),6.5,6.5,5.4,S(c.pants,-.18),c.boot,5.6);leg(x,3.5,hip,3.5+g.f(1),-g.l(1),6.5,6.5,5.6,c.pants,c.boot,5.6);
  cel(x,el(1,sh+11,13.5,11.5),c.shirt,1.1);cel(x,p=>{p.beginPath();p.moveTo(-6,sh+5);p.lineTo(8,sh+5);p.quadraticCurveTo(15,sh+14,10,hip+4);p.lineTo(-6,hip+4);p.quadraticCurveTo(-11,sh+14,-6,sh+5);p.closePath()},c.apron,1);x.strokeStyle=S(c.apron,-.3);x.lineWidth=1.3;x.beginPath();x.moveTo(-11,hip-3);x.lineTo(13,hip-3);x.stroke();
  face(x,L,2,-42+b+(st?-sin(u*PI)*1.5:0),1.08,o.b,null,h=>{hairF(h,L.hair,{bang:3});cel(h,p=>{p.beginPath();p.moveTo(-11,-4);p.bezierCurveTo(-11.5,-14,-5,-16.5,1,-16.5);p.bezierCurveTo(7,-16.5,11.6,-13,11,-4);p.closePath()},c.band,1.1);cel(h,pg(-10,-6,-17,-1,-13,-9),S(c.band,-.1),.9);
   cel(h,p=>{p.beginPath();p.moveTo(.5,6.3);p.quadraticCurveTo(-2,8.8,-4,7.6);p.quadraticCurveTo(-1,6,3,5.2);p.quadraticCurveTo(7,6,10,7.8);p.quadraticCurveTo(8,9,5.5,6.6);p.closePath()},S(L.hair,-.1),.8)});
  let hx=11+g.sw*2,hy=hip+2,bk=!st&&a!='greet'&&a!='talk';if(st){hx=8;hy=-56+b}else if(a=='greet'){hx=17+sin(u*TAU*2)*2;hy=-41+b}else if(a=='talk'){hx=16;hy=-28+b+sin(u*TAU)*1.5}
  if(bk){const by=hy+3;cel(x,rrp(hx-7,by,14,8,2.5),c.basket,1);x.strokeStyle=S(c.basket,-.35);x.lineWidth=.8;for(let i=1;i<4;i++){x.beginPath();x.moveTo(hx-7+i*3.5,by);x.lineTo(hx-7+i*3.5,by+8);x.stroke()}for(const[bx2,r]of[[-3,3.4],[2.5,3]])cel(x,el(hx+bx2,by-.5,r+1,r*.7),c.bread,.9);x.strokeStyle=OL;x.lineWidth=1.6;x.beginPath();x.arc(hx,by,7,PI,0);x.stroke()}
  arm(x,8,sh+3,hx,bk?hy-1:hy,8,8,4.8,c.shirt,c.skin)}

 // ---------------- LUMI (rare moth spirit): fluffy body, feathery antennae, big soft wings with eye spots; flutters at night, naps by day
 function lumi(x,o){const c=o.c,a=o.a,u=o.u,rest=a=='perch',sp=rest?.32:a=='greet'?1.05:.55+.45*abs(sin(u*TAU)),by=rest?3:sin(u*TAU)*1.5;
  const wing=(s,up,far)=>{x.save();x.translate(s*2,by-1);x.scale(s*sp,up?1:1);x.globalAlpha=far?.85:1;
   if(up){cel(x,p=>{p.beginPath();p.moveTo(0,-2);p.bezierCurveTo(-6,-20,-22,-24,-25,-12);p.bezierCurveTo(-25,-4,-14,1,0,1);p.closePath()},far?S(c.wing,-.15):c.wing,1);x.strokeStyle=c.vein;x.lineWidth=.7;x.beginPath();x.moveTo(0,-1);x.lineTo(-20,-17);x.moveTo(0,-1);x.lineTo(-23,-9);x.stroke();x.fillStyle=c.spot;x.beginPath();x.arc(-15,-12,3.6,0,TAU);x.fill();x.fillStyle=c.spot2;x.beginPath();x.arc(-15,-12,1.6,0,TAU);x.fill()}
   else{cel(x,p=>{p.beginPath();p.moveTo(0,0);p.bezierCurveTo(-8,2,-18,8,-14,15);p.bezierCurveTo(-9,18,-3,10,0,3);p.closePath()},far?S(c.wing2,-.15):c.wing2,1)}
   x.restore()};
  wing(1,1,1);wing(1,0,1);wing(-1,0,0);wing(-1,1,0);
  cel(x,el(0,by+4,6,8),c.body,1.1);x.fillStyle=S(c.body,-.12);for(let i=0;i<3;i++)x.fillRect(-4.5,by+4+i*2.6,9,.9);
  for(let i=0;i<7;i++){const q=PI+i/6*PI;cel(x,el(cos(q)*6.5,by-3+sin(q)*-1.5+2,3,2.4),c.fluff,.7)}
  cel(x,el(0,by-6,7.5,6.8),c.fluff,1.1);
  for(const s of[-1,1]){x.strokeStyle=c.ant;x.lineWidth=1.2;x.beginPath();x.moveTo(s*2.5,by-12);x.quadraticCurveTo(s*5,by-20,s*10,by-21);x.stroke();x.lineWidth=.8;for(let i=1;i<5;i++){const t=i/5,px=s*(2.5+t*7.5),py=by-12-t*8.6;x.beginPath();x.moveTo(px,py);x.lineTo(px+s*1.6,py+2.2);x.stroke()}}
  if(rest){x.strokeStyle=OL;x.lineWidth=1.2;for(const s of[-2.8,3.2]){x.beginPath();x.arc(s,by-6,1.8,.2,PI-.2);x.stroke()}x.fillStyle='rgba(255,255,255,.9)';x.font='700 7px sans-serif';x.fillText('z',9,by-12-u*3);x.font='700 5px sans-serif';x.fillText('z',13,by-17-u*3)}
  else for(const s of[-2.8,3.2]){x.fillStyle='#2a1a3a';x.beginPath();x.ellipse(s,by-6,2.1,2.8,0,0,TAU);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(s-.6,by-7.2,.9,0,TAU);x.fill()}
  x.fillStyle='rgba(255,140,170,.45)';x.beginPath();x.ellipse(-5,by-3.5,1.6,1,0,0,TAU);x.ellipse(5.4,by-3.5,1.6,1,0,0,TAU);x.fill()}

 // ---------------- THE HOLLOW (rare night wanderer): shadow body, white eyes, thorn halo, pale hands, ragged wide trousers + grey sash
 function hollow(x,o){const c=o.c,a=o.a,u=o.u,fb=sin(u*TAU)*1.5,hip=-25+fb,sh=-43+fb,hy=-54+fb,sw=sin(u*TAU)*1.4;
  x.save();x.translate(0,hy-20);x.scale(1,.32);x.rotate(u*TAU/7);x.strokeStyle='#2c2636';x.lineWidth=2.6;x.beginPath();x.arc(0,0,15,0,TAU);x.stroke();x.lineWidth=1.4;x.strokeStyle='#4a4258';for(let i=0;i<14;i++){const q=i/14*TAU,r1=14,r2=i%2?22:19;x.beginPath();x.moveTo(cos(q)*r1,sin(q)*r1);x.lineTo(cos(q+.18)*r2,sin(q+.18)*r2);x.stroke()}x.restore();
  cel(x,p=>{p.beginPath();p.moveTo(-8,hy-10);p.bezierCurveTo(-18,hy,-16+sw,hy+22,-18+sw*1.5,hy+34);p.lineTo(-12+sw,hy+29);p.lineTo(-11+sw,hy+36);p.lineTo(-6,hy+26);p.lineTo(-2,hy+10);p.closePath()},c.hair,1);
  let fx=-7,fy=hip+4;if(a=='greet'){fx=-2;fy=-60+fb}
  const fp=arm(x,-6,sh+3,fx,fy,10,10,3.4,c.body);dot(x,fp[4],fp[5],2.4,c.hand);
  for(const s of[-1,1]){cel(x,p=>{const X=s*3.4;p.beginPath();p.moveTo(X-3.5,hip);p.lineTo(X+3.5,hip);p.quadraticCurveTo(X+7+sw*.4,-10,X+5,-3);p.lineTo(X+3,-5);p.lineTo(X+2,-1);p.lineTo(X-1,-4);p.lineTo(X-4,-1);p.quadraticCurveTo(X-6,-10,X-3.5,hip);p.closePath()},s<0?S(c.pants,-.2):c.pants,1);cel(x,rrp(s*3.4-3,-4,6,4,1.5),'#3a3444',.9)}
  cel(x,pg(-8.5,sh,8.5,sh,7,hip,-7,hip),c.body,1.1);
  cel(x,rrp(-8,hip-3.5,16,4,1.5),c.sash,1);x.globalAlpha=.75;cel(x,p=>{p.beginPath();p.moveTo(2,hip);p.lineTo(6,hip);p.lineTo(7+sw,hip+20);p.lineTo(3+sw,hip+18);p.closePath()},c.sash,.8);x.globalAlpha=1;dot(x,0,hip-1.5,2.2,'#6a6474');
  star4(x,1,sh+7,3.4,'#fff');x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=.8;x.beginPath();x.moveTo(1.5,sh+9);x.lineTo(1.8,sh+17);x.stroke();
  x.save();x.translate(1,hy);cel(x,p=>{p.beginPath();p.moveTo(-9,-3);p.bezierCurveTo(-10,6,-6,10,-1,11);p.lineTo(2,11);p.bezierCurveTo(7,9,10,5,10,-3);p.bezierCurveTo(10,-10,-9,-10,-9,-3);p.closePath()},c.body,1.1);
  x.save();x.shadowColor='#fff';x.shadowBlur=6;x.fillStyle=c.eye;const ey=a=='react'&&u>.5?.6:2;for(const s of[-2.6,5])x.beginPath(),x.ellipse(s,1,2.3,ey,0,0,TAU),x.fill();x.restore();
  cel(x,p=>{p.beginPath();p.moveTo(-11,3);p.bezierCurveTo(-13,-12,-5,-17,1,-16);p.bezierCurveTo(8,-17,13,-11,11,2);p.lineTo(9,-4);p.lineTo(7,1);p.lineTo(5,-6);p.lineTo(2,-1);p.lineTo(-1,-7);p.lineTo(-4,0);p.lineTo(-6,-5);p.lineTo(-8,4);p.closePath()},c.hair,1);x.restore();
  let hx=8,hy2=hip+4;if(a=='talk'){hx=14;hy2=-36+fb+sin(u*TAU)*1.5}else if(a=='greet'){hx=12;hy2=-44+fb}
  const np=arm(x,6,sh+3,hx,hy2,10,10,3.4,S(c.body,.12));x.strokeStyle=c.hand;x.lineWidth=1.1;for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(np[4],np[5]);x.lineTo(np[4]+2+i*.8,np[5]+4.5);x.stroke()}dot(x,np[4],np[5],2.4,c.hand)}

 const ARCH={merchant,smith,farmer,guard,mage,traveler,elder,villager:(x,o)=>o.v=='kid'?kid(x,o):o.v=='girl'?girl(x,o):stout(x,o),lumi,hollow};
 // ---------------- station props (static, cached once): market stall, anvil, forge, bench, crops, tea table, banner
 const PROP={};
 function prop(k,s){s=s||1;const key=k+'@'+s;if(PROP[key])return PROP[key];const c=document.createElement('canvas');c.width=Math.ceil(180*s);c.height=Math.ceil(140*s);const x=c.getContext('2d');x.scale(s,s);x.translate(90,130);x.lineJoin='round';
  if(k=='stall'){cel(x,rrp(-34,-24,68,24,3),'#9a6a3a',1.3);x.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<4;i++)x.fillRect(-32,-19+i*5,64,1.2);cel(x,rrp(-37,-27,74,5,2),'#c8945a',1.2);
   for(const s of[-1,1])line(x,[s*33,-26,s*33,-70],2.6,'#7a5232');
   for(let i=0;i<6;i++){const X=-40+i*13.4;cel(x,p=>{p.beginPath();p.moveTo(X,-78);p.lineTo(X+13.4,-78);p.lineTo(X+13.4,-66);p.quadraticCurveTo(X+6.7,-61,X,-66);p.closePath()},i%2?'#fff2dc':'#d8435a',1)}
   cel(x,rrp(-41,-82,82,6,2),'#b8324a',1.1);
   const it=[['#7fe9ff',-26],['#ffd24a',-15],['#7ee06a',-4],['#ff8fd0',7],['#b78cff',18]];for(const[cc,X]of it){cel(x,pg(X,-36,X+3.5,-32,X,-28,X-3.5,-32),cc,.9)}cel(x,rrp(23,-36,8,8,1.5),'#c8945a',.9);cel(x,el(-30,-29,3.5,2.4),'#ffd24a',.8);
   x.fillStyle='#fff3c4';x.font='700 8px sans-serif';x.textAlign='center';x.fillText('SHOP',0,-12)}
  else if(k=='anvil'){cel(x,rrp(-6,-11,12,11,1),'#3a3e46',1.2);cel(x,pg(-15,-21,13,-21,19,-18,13,-14,-11,-14,-15,-17),'#6a707c',1.2);x.fillStyle='rgba(255,255,255,.35)';x.fillRect(-12,-20.5,22,1.4);cel(x,rrp(-9,-3,18,3,1),'#2a2e36',1)}
  else if(k=='forge'){cel(x,rrp(-17,-30,34,30,4),'#6a5a58',1.3);x.fillStyle='rgba(0,0,0,.2)';for(let i=0;i<4;i++)for(let j=0;j<3;j++)x.fillRect(-15+j*11+(i%2)*5,-27+i*7,9,1.2);cel(x,rrp(-11,-22,22,12,5),'#1a1214',1.1);
   for(let i=0;i<6;i++){x.fillStyle=['#ff6a2a','#ffb03a','#ff8a2a'][i%3];x.beginPath();x.arc(-8+i*3.2,-12-(i%2)*1.6,2.4,0,TAU);x.fill()}cel(x,rrp(-13,-46,9,17,1),'#4a3e3e',1.1);cel(x,rrp(-19,-33,38,5,2),'#8a7a74',1.1)}
  else if(k=='bench'){cel(x,rrp(-22,-15,44,4,1.5),'#a0703e',1.2);cel(x,rrp(-22,-27,44,4,1.5),'#a0703e',1.2);for(const s of[-1,1]){line(x,[s*18,-12,s*18,0],2.6,'#6a4626');line(x,[s*18,-25,s*18,-15],2,'#6a4626')}}
  else if(k=='crops'){for(let i=0;i<3;i++){const X=-34+i*34;cel(x,el(X,-1,13,3),'#5a3a22',1);
    if(i==0){for(let j=0;j<5;j++){x.save();x.translate(X,-3);x.rotate(-1+j*.5);cel(x,el(0,-6,3,7),j%2?'#7ec850':'#5aa83a',.9);x.restore()}cel(x,el(X,-7,5,4.4),'#a8e070',1)}
    else if(i==1){for(let j=0;j<4;j++){line(x,[X-5+j*3.4,-2,X-7+j*4,-14-j%2*3],1.4,'#5ab040');cel(x,el(X-7+j*4,-15-j%2*3,2,3.4),'#6ec84a',.8)}cel(x,pg(X-3,-2,X+3,-2,X,4),'#ff8a3a',.9)}
    else{line(x,[X,-2,X,-30],1.8,'#4a9a3a');cel(x,el(X+4,-14,4,2,.5),'#5aa83a',.8);for(let j=0;j<10;j++){const q=j/10*TAU;cel(x,el(X+cos(q)*5.5,-32+sin(q)*5.5,2.4,1.4,q),'#ffd24a',.7)}dot(x,X,-32,3.4,'#7a4a1a')}}}
  else if(k=='table'){cel(x,rrp(-20,-12,40,4,1.5),'#7a3a2a',1.2);for(const s of[-1,1])line(x,[s*15,-9,s*15,0],2.4,'#5a2a1a');cel(x,el(-6,-15,5,3.6),'#e8f0f4',1);cel(x,rrp(3,-15,6,4,1),'#f4f0ff',.9);cel(x,el(12,-13,3,1.4),'#e8f0f4',.8)}
  else if(k=='banner'){line(x,[0,0,0,-62],2.2,'#6a4a2a');cel(x,p=>{p.beginPath();p.moveTo(1,-60);p.lineTo(17,-60);p.lineTo(17,-36);p.lineTo(9,-41);p.lineTo(1,-36);p.closePath()},'#3a6ad0',1.1);star4(x,9,-50,4.4,'#ffd24a');dot(x,0,-63,2,'#ffd24a')}
  return PROP[key]=c}
 return{draw:(x,arch,o)=>{const f=ARCH[arch];if(f)f(x,o)},prop,star4}})();
