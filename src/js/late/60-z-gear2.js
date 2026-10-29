// ===== GEAR8: v8 wardrobe. Worn art + icons for the new outfits (registered into GEAR7.D, so they use its sprite cache), their skills,
// and the Anonymous set's dark aura. Items: witchhat, headphones, kabuto, astrohelm, samurai, bomber, astrosuit, moonboots, hightops,
// royalgaunt, anonmask + anonsuit (mythic). Stats/prices live in the legacy WEAR table and server/catalog.json.
// Aura budget: every sprite (smoke puffs, tendrils, halo, embers, ground pool) is rendered once to an offscreen canvas; a frame is
// ~40 drawImage calls per aura wearer. Particle motion is stateless (a function of time + index), so nothing allocates per frame.
const GEAR8=(()=>{
 const OL='#140c1c',sh=(c,k)=>AC6.shade(c,k),D=GEAR7.D;
 const VI='#8a4cff',VL='#c9a8ff',GOLD='#f2c14e';
 // ---- vector helpers (same cel language as GEAR7)
 function cel(x,path,col,lw,lx,ly){path();x.fillStyle=sh(col,-.34);x.fill();x.save();path();x.clip();x.translate(lx==null?1.4:lx,ly==null?-1.1:ly);path();x.fillStyle=col;x.fill();x.restore();path();x.strokeStyle=OL;x.lineWidth=lw==null?1:lw;x.stroke()}
 const PL=(x,a,c)=>()=>{x.beginPath();x.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)x.lineTo(a[i],a[i+1]);if(c!==false)x.closePath()};
 const E=(x,cx,cy,rx,ry,r)=>()=>{x.beginPath();x.ellipse(cx,cy,rx,ry,r||0,0,6.3)};
 function line(x,c,w,p,dash){x.strokeStyle=c;x.lineWidth=w;if(dash)x.setLineDash(dash);x.beginPath();x.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)x.lineTo(p[i],p[i+1]);x.stroke();if(dash)x.setLineDash([])}
 const hl=(x,w,a,p)=>{x.save();x.globalAlpha=a;line(x,'#fff',w,p);x.restore()};
 function star(x,cx,cy,r1,r2,n,rot){x.beginPath();for(let i=0;i<n*2;i++){const a=(rot==null?-Math.PI/2:rot)+i*Math.PI/n,r=i%2?r2:r1;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}x.closePath()}
 function glow(x,cx,cy,r,col,a){const gr=x.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,col);gr.addColorStop(1,col+'00');x.save();x.globalAlpha=a||.6;x.fillStyle=gr;x.fillRect(cx-r,cy-r,r*2,r*2);x.restore()}
 function gem(x,cx,cy,r,col){x.beginPath();x.moveTo(cx,cy-r);x.lineTo(cx+r*.9,cy);x.lineTo(cx,cy+r);x.lineTo(cx-r*.9,cy);x.closePath();x.fillStyle=col;x.fill();x.strokeStyle=OL;x.lineWidth=Math.max(.35,r*.28);x.stroke();x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.moveTo(cx,cy-r*.8);x.lineTo(cx+r*.4,cy-r*.1);x.lineTo(cx,cy);x.closePath();x.fill()}
 const spark=(x,cx,cy,r,col)=>{star(x,cx,cy,r,r*.28,4,0);x.fillStyle=col||'#fff';x.fill()};
 const dot=(x,cx,cy,r,col)=>{x.fillStyle=col;x.beginPath();x.arc(cx,cy,r,0,6.3);x.fill()};
 // rounded rect path
 const RR=(x,X,Y,w,h,r)=>()=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()};
 // gauntlet / mitt (cuff toward the wrist, rounded fist, thumb on the facing side)
 function mitt(x,col,cuff,metal){const fist=()=>{x.beginPath();x.moveTo(-3.1,-2.3);x.bezierCurveTo(-3.8,1.4,-2.2,3.6,.1,3.6);x.bezierCurveTo(2.5,3.6,3.6,1.8,3.3,-2.3);x.closePath()};
  if(metal){fist();const gr=x.createLinearGradient(-3,-3,3,3.5);gr.addColorStop(0,'#fff6c8');gr.addColorStop(.5,col);gr.addColorStop(1,'#8a6410');x.fillStyle=gr;x.fill();x.strokeStyle=OL;x.lineWidth=.55;x.stroke()}else cel(x,fist,col,.55,.6,-.5);
  const th=()=>{x.beginPath();x.moveTo(3.1,-1.2);x.bezierCurveTo(4.6,-.6,4.4,1.6,2.8,2);x.bezierCurveTo(1.6,2.3,.6,1.6,.9,.9);x.closePath()};x.fillStyle=metal?'#ffe7a0':sh(col,.1);th();x.fill();x.strokeStyle=OL;x.lineWidth=.5;x.stroke();
  for(const a of[-1.9,-.6])line(x,metal?'rgba(110,70,0,.5)':sh(col,-.38),.32,[a,1.8,a,3.3]);
  cel(x,()=>{x.beginPath();x.moveTo(-3.3,-5);x.lineTo(3.3,-5);x.lineTo(4,-1.9);x.lineTo(-4,-1.9);x.closePath()},cuff,.55,.6,-.5);hl(x,.6,.6,[-2.3,-1.2,-2.1,1.2])}
 // ---- Anonymous mask: smooth featureless white face plate, hollow slanted eye slits (no moustache, no smile)
 function maskFace(x,cx,cy,rx,ry,sym){const m=()=>{x.beginPath();x.moveTo(cx,cy-ry);x.bezierCurveTo(cx+rx*.78,cy-ry,cx+rx*1.04,cy-ry*.5,cx+rx,cy+ry*.04);x.bezierCurveTo(cx+rx*.97,cy+ry*.62,cx+rx*.6,cy+ry*1.02,cx+(sym?0:rx*.08),cy+ry*1.1);x.bezierCurveTo(cx-rx*.6,cy+ry*1.02,cx-rx*.97,cy+ry*.62,cx-rx,cy+ry*.04);x.bezierCurveTo(cx-rx*1.04,cy-ry*.5,cx-rx*.78,cy-ry,cx,cy-ry);x.closePath()};
  m();x.fillStyle='#c9c4d4';x.fill();x.save();m();x.clip();x.fillStyle='#f6f4fa';x.beginPath();x.ellipse(cx+(sym?0:rx*.18),cy-ry*.1,rx*.98,ry*1.02,0,0,6.3);x.fill();
  x.fillStyle='rgba(70,56,96,.16)';x.beginPath();x.ellipse(cx-rx*(sym?0:.95),cy+ry*.2,rx*(sym?1.25:.55),ry*1.1,0,0,6.3);if(sym){x.ellipse(cx,cy+ry*1.3,rx*1.2,ry*.4,0,0,6.3)}x.fill();
  x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.ellipse(cx+(sym?-rx*.3:rx*.05),cy-ry*.62,rx*.36,ry*.12,-.2,0,6.3);x.fill();
  x.strokeStyle='rgba(90,76,120,.28)';x.lineWidth=rx*.06;x.beginPath();x.moveTo(cx+(sym?0:rx*.18),cy-ry*.35);x.quadraticCurveTo(cx+(sym?0:rx*.24),cy+ry*.2,cx+(sym?0:rx*.16),cy+ry*.42);x.stroke();x.restore();
  m();x.strokeStyle=OL;x.lineWidth=Math.max(.7,rx*.11);x.stroke()}
 function slit(x,cx,cy,w,dir,s){x.beginPath();x.moveTo(cx-w*dir,cy+.5*s);x.quadraticCurveTo(cx,cy-1.4*s,cx+w*dir,cy-.25*s);x.quadraticCurveTo(cx+w*.1*dir,cy+1.3*s,cx-w*dir,cy+.5*s);x.closePath();x.fillStyle='#07040c';x.fill();x.strokeStyle='rgba(185,130,255,.75)';x.lineWidth=.32*s;x.stroke()}
 // ---------------- item art ----------------
 Object.assign(D,{
  // ---------- Anonymous Mask: deep black hood + the plain white mask
  anonmask:{cover:1,ib:[-17,-22,32,40],
   hatB:{bb:[-17,-6,24,32],f(x){cel(x,()=>{x.beginPath();x.moveTo(-9,-4);x.bezierCurveTo(-16,4,-16.4,15,-14.4,24.6);x.lineTo(-7,23.2);x.lineTo(-4.6,25.4);x.lineTo(2.6,22.6);x.bezierCurveTo(5,15,3.6,6,1.6,0);x.closePath()},'#18131f',1);line(x,'#2c2338',.6,[-11.6,6,-12.6,20]);line(x,'#2c2338',.5,[-6,6,-5.4,21])}},
   hatF:{bb:[-17,-22,31,38],f(x){const S='#1b1624';
    cel(x,()=>{x.beginPath();x.moveTo(11.6,-2);x.bezierCurveTo(12,-14,5.2,-21,-1.5,-21);x.bezierCurveTo(-11,-21,-16,-12,-15.4,-1);x.bezierCurveTo(-15.2,6,-14.2,11.6,-11.8,15.2);x.lineTo(-6.4,14);x.lineTo(-2,15.6);x.lineTo(3.4,13.8);x.lineTo(10,14.2);x.bezierCurveTo(12,9,12.3,4,11.6,-2);x.closePath()},S,1.1);
    line(x,'#2e2540',.7,[-12.6,-6,-13,8]);line(x,'#2e2540',.6,[-6,-18.6,-10.6,-12]);hl(x,.9,.22,[-2,-19.6,5,-17.4,9.6,-11]);
    const op=()=>{x.beginPath();x.moveTo(-6.8,12);x.bezierCurveTo(-9.4,6,-9.6,-2,-7.2,-7.8);x.bezierCurveTo(-3.8,-13,6.4,-13.8,11.4,-6.2);x.lineTo(11.8,12.4);x.closePath()};
    op();x.fillStyle='#06030a';x.fill();x.save();op();x.clip();x.fillStyle='rgba(120,60,220,.18)';x.beginPath();x.ellipse(3,1,9,12,0,0,6.3);x.fill();x.restore();
    maskFace(x,2.9,.9,6.9,10,0);slit(x,6,1.2,2.3,1,1);slit(x,-1.5,1.2,1.7,-1,.85);
    const rim=()=>{x.beginPath();x.moveTo(-6.8,12);x.bezierCurveTo(-9.4,6,-9.6,-2,-7.2,-7.8);x.bezierCurveTo(-3.8,-13,6.4,-13.8,11.4,-6.2)};rim();x.strokeStyle=OL;x.lineWidth=2.6;x.stroke();rim();x.strokeStyle='#3a2a55';x.lineWidth=1.5;x.stroke();rim();x.strokeStyle='rgba(170,120,255,.55)';x.lineWidth=.45;x.stroke()}},
   front(x){const S='#1b1624',t=performance.now()/1000;
    cel(x,()=>{x.beginPath();x.moveTo(0,-23.4);x.bezierCurveTo(9.6,-23.4,14.6,-15,14.4,-3);x.bezierCurveTo(14.2,6,13.4,12,15.6,19.4);x.lineTo(8,18.2);x.lineTo(3,19.6);x.lineTo(-3,18.2);x.lineTo(-8,19.6);x.lineTo(-15.6,19.4);x.bezierCurveTo(-13.4,12,-14.2,6,-14.4,-3);x.bezierCurveTo(-14.6,-15,-9.6,-23.4,0,-23.4);x.closePath()},S,.24,.5,-.4);
    line(x,'#2e2540',.22,[-11.6,-8,-12.2,10]);line(x,'#2e2540',.22,[11.6,-8,12.2,10]);hl(x,.3,.2,[-6,-21.4,0,-22.4,6,-21.4]);
    const op=()=>{x.beginPath();x.moveTo(0,-13.8);x.bezierCurveTo(6.8,-13.8,9.6,-7,9.6,0);x.bezierCurveTo(9.6,7.2,6.2,13,0,14);x.bezierCurveTo(-6.2,13,-9.6,7.2,-9.6,0);x.bezierCurveTo(-9.6,-7,-6.8,-13.8,0,-13.8);x.closePath()};
    op();x.fillStyle='#06030a';x.fill();maskFace(x,0,.6,7.2,11,1);slit(x,3.4,.9,2.3,1,.9);slit(x,-3.4,.9,2.3,-1,.9);
    op();x.strokeStyle=OL;x.lineWidth=.55;x.stroke();x.strokeStyle='#3a2a55';x.lineWidth=.32;x.stroke();
    const a=.55+.35*Math.sin(t*2.6);x.save();x.globalCompositeOperation='lighter';x.globalAlpha=a;for(const s of[-1,1])x.drawImage(spr8().eye,s*3.4-2.6,-1.7,5.2,5.2);x.restore()}},
  // ---------- Witch Hat
  witchhat:{cover:1,ib:[-19,-40,38,35],
   hatF:{bb:[-19,-40,38,35],f(x){const c='#5b3a9e';
    cel(x,E(x,1,-8.6,17.6,3.8,-.06),sh(c,-.28),1.1);x.fillStyle=sh(c,-.55);x.beginPath();x.ellipse(1,-7.6,12,2,-.06,0,6.3);x.fill();
    const cone=()=>{x.beginPath();x.moveTo(-9,-10);x.bezierCurveTo(-8.2,-19,-7,-27,-12.6,-35.4);x.bezierCurveTo(-4.6,-33.4,4,-24,10.2,-10.4);x.quadraticCurveTo(.8,-7.6,-9,-10);x.closePath()};cel(x,cone,c,1.1);
    x.save();cone();x.clip();x.fillStyle='rgba(20,10,40,.22)';x.beginPath();x.moveTo(-2,-30);x.lineTo(14,-8);x.lineTo(2,-8);x.closePath();x.fill();x.restore();hl(x,.8,.35,[-7,-14,-6.6,-22,-9.6,-31]);
    cel(x,()=>{x.beginPath();x.moveTo(-9.2,-11.4);x.quadraticCurveTo(1,-8.4,10.4,-11.8);x.lineTo(9.4,-14.6);x.quadraticCurveTo(.8,-11.8,-8.7,-14.2);x.closePath()},'#2a1a48',.8);
    cel(x,()=>{x.beginPath();x.rect(-.4,-14.6,3.8,3.6)},GOLD,.6);x.fillStyle='#2a1a48';x.fillRect(.6,-13.6,1.8,1.6);
    x.save();x.translate(-12.6,-35.4);x.rotate(.3);star(x,0,2.6,2.6,1.1,5);x.fillStyle='#ffe27a';x.fill();x.strokeStyle=OL;x.lineWidth=.5;x.stroke();x.restore();
    spark(x,6,-20,1.3,'#ffe9a8');spark(x,-4,-25,.9,'#ffe9a8');hl(x,1,.55,[-12,-10.2,-4,-11.6])}},
   front(x){const c='#5b3a9e';cel(x,E(x,0,-9,18.6,3.4,0),sh(c,-.28),.3,.5,-.4);
    const cone=()=>{x.beginPath();x.moveTo(-9.4,-10);x.bezierCurveTo(-8,-20,-4,-30,-7,-38);x.bezierCurveTo(0,-34,6,-22,9.4,-10);x.quadraticCurveTo(0,-7.6,-9.4,-10);x.closePath()};cel(x,cone,c,.3,.5,-.4);
    cel(x,()=>{x.beginPath();x.moveTo(-9.5,-11.2);x.quadraticCurveTo(0,-8.4,9.5,-11.2);x.lineTo(9,-14);x.quadraticCurveTo(0,-11.4,-9,-14);x.closePath()},'#2a1a48',.25,.4,-.3);
    cel(x,()=>{x.beginPath();x.rect(-1.9,-14.2,3.8,3.6)},GOLD,.2,.3,-.2);x.save();x.translate(-7,-38);star(x,0,2.4,2.4,1,5);x.fillStyle='#ffe27a';x.fill();x.strokeStyle=OL;x.lineWidth=.2;x.stroke();x.restore()}},
  // ---------- Beat Headphones
  headphones:{ib:[-16,-21,31,30],
   hatF:{bb:[-16,-21,30,28],f(x){const c='#ff4f9a';
    cel(x,RR(x,9.4,-3.2,3.4,7.6,1.4),sh(c,-.1),.8);
    const band=()=>{x.beginPath();x.moveTo(-10.6,-1.6);x.bezierCurveTo(-12.4,-17,8.4,-20.6,11,-3)};band();x.strokeStyle=OL;x.lineWidth=4.2;x.stroke();band();x.strokeStyle='#2a2438';x.lineWidth=3;x.stroke();band();x.strokeStyle=c;x.lineWidth=1.3;x.stroke();
    cel(x,RR(x,-14,-3.4,7.4,10,3),'#2a2438',1);cel(x,RR(x,-13.2,-2.4,5.6,8,2.4),c,.7);x.strokeStyle='#5ff3ff';x.lineWidth=.7;x.beginPath();x.arc(-10.4,1.6,2,0,6.3);x.stroke();dot(x,-10.4,1.6,.8,'#ffffff');hl(x,.7,.6,[-12.4,-1.4,-12.6,2])}},
   front(x){const c='#ff4f9a';const band=()=>{x.beginPath();x.moveTo(-11.6,-1);x.bezierCurveTo(-12.4,-24,12.4,-24,11.6,-1)};band();x.strokeStyle=OL;x.lineWidth=1.3;x.stroke();band();x.strokeStyle='#2a2438';x.lineWidth=.9;x.stroke();band();x.strokeStyle=c;x.lineWidth=.38;x.stroke();
    for(const s of[-1,1]){cel(x,RR(x,s*11.8-3.4,-4,6.8,10,2.6),'#2a2438',.3,.4,-.3);cel(x,RR(x,s*11.8-2.6,-3.2,5.2,8.4,2),c,.22,.3,-.2);x.strokeStyle='#5ff3ff';x.lineWidth=.25;x.beginPath();x.arc(s*11.8,1,1.8,0,6.3);x.stroke()}}},
  // ---------- Ronin Kabuto (black lacquer dome, red guards, gold crest)
  kabuto:{cover:1,ib:[-18,-33,35,46],
   hatF:{bb:[-18,-33,35,46],f(x){const R='#b0283a',K='#2b2230';
    for(let i=2;i>=0;i--)cel(x,()=>{x.beginPath();x.moveTo(-10.6,-4+i*3.2);x.bezierCurveTo(-13+i*.2,-2+i*3.4,-15.4-i*.4,2+i*3.6,-16-i*.6,5+i*3.6);x.lineTo(-7+i,6.2+i*3.6);x.lineTo(-4,-2+i*3);x.closePath()},i%2?sh(R,-.12):R,.8);
    for(let i=0;i<3;i++)line(x,'#ffd27a',.35,[-14.6-i*.4,4+i*3.6,-8+i,5.6+i*3.6],[.6,.8]);
    const dome=()=>{x.beginPath();x.moveTo(-11.6,-4.4);x.bezierCurveTo(-12,-15.4,-5,-20.6,1,-20.6);x.bezierCurveTo(7.6,-20.6,12.6,-15.4,12.1,-4.8);x.quadraticCurveTo(0,-2.6,-11.6,-4.4);x.closePath()};cel(x,dome,K,1.1);
    x.save();dome();x.clip();for(const a of[-7,-3.4,0,3.4,7])line(x,'rgba(255,255,255,.18)',.5,[a*.5+1,-20,a+1,-3]);x.restore();for(const a of[-8,-4,0,4,8])dot(x,a+1,-5.8,.5,GOLD);hl(x,1.1,.5,[-8,-13,-5.6,-17.4,-1.6,-19.4]);
    cel(x,()=>{x.beginPath();x.moveTo(-5,-5.4);x.quadraticCurveTo(5,-7.6,13.4,-5.6);x.quadraticCurveTo(14.6,-3.6,12.6,-2.6);x.quadraticCurveTo(4,-4.6,-4.8,-3);x.closePath()},R,.9);
    cel(x,()=>{x.beginPath();x.moveTo(-9.4,-5.8);x.lineTo(-14,-9.4);x.lineTo(-15.2,-3.4);x.lineTo(-10.4,-1.6);x.closePath()},R,.8);dot(x,-12.4,-5,1,GOLD);
    for(const s of[-1,1]){x.save();x.translate(6.6,-12.6);x.scale(s>0?1:.82,1);x.beginPath();x.moveTo(0,0);x.bezierCurveTo(s*1,-7,s*5,-13,s*13,-17);x.bezierCurveTo(s*9.6,-10,s*6.8,-4.6,s*3.6,.8);x.closePath();x.fillStyle=GOLD;x.fill();x.strokeStyle=OL;x.lineWidth=.6;x.stroke();line(x,'#fff6c8',.4,[s*1.4,-3,s*5.4,-13]);x.restore()}
    x.beginPath();x.arc(6.6,-11.4,2.6,0,6.3);x.fillStyle=GOLD;x.fill();x.strokeStyle=OL;x.lineWidth=.6;x.stroke();dot(x,6.6,-11.4,1.1,R)}},
   front(x){const R='#b0283a',K='#2b2230';
    for(const s of[-1,1])for(let i=2;i>=0;i--)cel(x,()=>{x.beginPath();x.moveTo(s*10.4,-4+i*3.2);x.bezierCurveTo(s*13,-2+i*3.4,s*(15.4+i*.4),2+i*3.6,s*(16+i*.6),5+i*3.6);x.lineTo(s*(8-i*.5),7+i*3.6);x.lineTo(s*7,-2+i*3);x.closePath()},i%2?sh(R,-.12):R,.25,.4,-.3);
    const dome=()=>{x.beginPath();x.moveTo(-12,-4.4);x.bezierCurveTo(-12.4,-16,-6,-21,0,-21);x.bezierCurveTo(6,-21,12.4,-16,12,-4.4);x.quadraticCurveTo(0,-2.4,-12,-4.4);x.closePath()};cel(x,dome,K,.32,.5,-.4);
    x.save();dome();x.clip();for(const a of[-8,-4,0,4,8])line(x,'rgba(255,255,255,.18)',.18,[a*.4,-20.6,a,-3]);x.restore();
    cel(x,()=>{x.beginPath();x.moveTo(-12.6,-5);x.quadraticCurveTo(0,-8,12.6,-5);x.quadraticCurveTo(13.6,-3,12,-2.4);x.quadraticCurveTo(0,-5,-12,-2.4);x.quadraticCurveTo(-13.6,-3,-12.6,-5);x.closePath()},R,.25,.3,-.2);
    for(const s of[-1,1]){x.beginPath();x.moveTo(s*1,-11);x.bezierCurveTo(s*3,-18,s*7,-25,s*14,-31);x.bezierCurveTo(s*12,-22,s*8,-14,s*4,-9.4);x.closePath();x.fillStyle=GOLD;x.fill();x.strokeStyle=OL;x.lineWidth=.2;x.stroke()}
    x.beginPath();x.arc(0,-10.6,2.8,0,6.3);x.fillStyle=GOLD;x.fill();x.strokeStyle=OL;x.lineWidth=.2;x.stroke();dot(x,0,-10.6,1.2,R)}},
  // ---------- Astro Helmet (glass bubble over the face, collar ring, antenna)
  astrohelm:{cover:1,ib:[-18,-27,36,43],
   hatF:{bb:[-18,-27,36,43],f(x){
    cel(x,E(x,-15.2,-1,2.6,3.8),'#dfe6f2',.8);dot(x,-15.6,-1.2,1,'#4fb4ff');
    line(x,OL,1.4,[-7,-15,-9.4,-23.6]);line(x,'#c9d2e0',.7,[-7,-15,-9.4,-23.6]);
    x.beginPath();x.arc(1,-3,15.6,0,6.3);x.fillStyle='rgba(170,220,255,.2)';x.fill();
    x.save();x.beginPath();x.arc(1,-3,15.6,0,6.3);x.clip();x.fillStyle='rgba(255,255,255,.1)';x.beginPath();x.ellipse(-4,-10,10,7,-.5,0,6.3);x.fill();x.restore();
    x.strokeStyle=OL;x.lineWidth=2.4;x.beginPath();x.arc(1,-3,15.6,0,6.3);x.stroke();x.strokeStyle='#e8eef8';x.lineWidth=1.3;x.stroke();
    hl(x,1.4,.8,[-10.4,-8,-8,-13.4,-3,-16.6]);hl(x,.8,.55,[8,-14,10.6,-11]);hl(x,.7,.4,[11.6,2,10,6.4]);
    cel(x,E(x,1,11.6,11.4,3.4),'#dfe6f2',1);x.fillStyle='#ff8a2a';x.beginPath();x.ellipse(1,11.2,11,1.1,0,0,Math.PI);x.fill();line(x,'#8e98ab',.5,[-9,12.4,11,12.4])}},
   front(x){x.beginPath();x.arc(0,-2,15.4,0,6.3);x.fillStyle='rgba(170,220,255,.18)';x.fill();x.strokeStyle=OL;x.lineWidth=.7;x.stroke();x.strokeStyle='#e8eef8';x.lineWidth=.4;x.stroke();
    hl(x,.45,.8,[-11,-6,-8.4,-12,-3,-15.6]);hl(x,.25,.5,[9,-12,11.6,-8]);cel(x,E(x,0,13.4,12.4,3.4),'#dfe6f2',.3,.4,-.3);x.fillStyle='#ff8a2a';x.fillRect(-12,12.6,24,.9);
    for(const s of[-1,1]){cel(x,E(x,s*15.6,-1,2.4,3.6),'#dfe6f2',.25,.3,-.2);dot(x,s*15.6,-1,.9,'#4fb4ff')}line(x,OL,.4,[-8,-14,-10,-23]);dot(x,-10,-23.4,1.2,'#ff4d4d')}},
  // ---------- Samurai Armor
  samurai:{legs:'#2a1c24',torso:{bb:[-10,0,20,17],f(x){const R='#b0283a',K='#2b2230';
    for(const y of[3.4,6.8,10.2]){x.fillStyle=sh(R,-.22);x.fillRect(-9.2+y*.1,y+2.8,18.4-y*.2,.6);for(let a=-8;a<=8;a+=2)dot(x,a,y+1.4,.32,(a/2)%2?'#1a1018':'#ffd27a')}
    cel(x,()=>{x.beginPath();x.moveTo(-6.4,.8);x.lineTo(6.4,.8);x.lineTo(5.4,3.6);x.lineTo(-5.4,3.6);x.closePath()},K,.7);line(x,GOLD,.4,[-6.2,1.1,6.2,1.1]);
    x.beginPath();x.arc(0,7.4,1.9,0,6.3);x.fillStyle=GOLD;x.fill();x.strokeStyle=OL;x.lineWidth=.45;x.stroke();star(x,0,7.4,1.1,.5,3);x.fillStyle=R;x.fill();
    cel(x,PL(x,[-8.3,13.6,8.3,13.6,8.1,16,-8.1,16]),K,.6);cel(x,E(x,2.6,14.8,1.6,1.2),GOLD,.4);line(x,'#ffd27a',.35,[2.6,15.8,3.4,17.4])}},
   shoulder:{bb:[-17,-3,34,15],f(x){const R='#b0283a';for(const s of[-1,1]){x.save();x.translate(s*10.6,2.2);x.rotate(s*.16);cel(x,()=>{x.beginPath();x.rect(-3,0,6,8.6)},R,.8);for(const y of[2.6,5.2])line(x,sh(R,-.4),.45,[-3,y,3,y]);for(const y of[1.3,3.9,6.5])for(const a of[-1.8,0,1.8])dot(x,a,y,.3,'#ffd27a');cel(x,()=>{x.beginPath();x.rect(-3.4,-1,6.8,1.6)},'#2b2230',.6);line(x,GOLD,.35,[-3.2,-.2,3.2,-.2]);x.restore()}}},
   skirt:{bb:[-11,-4,22,13],f(x){const R='#b0283a';for(const[a,r]of[[-6.4,-.14],[-2.1,-.04],[2.1,.04],[6.4,.14]]){x.save();x.translate(a,-2.6);x.rotate(r);cel(x,()=>{x.beginPath();x.rect(-2.1,0,4.2,9)},R,.7);for(const y of[3,6])line(x,sh(R,-.4),.4,[-2.1,y,2.1,y]);for(const y of[1.5,4.5,7.5])dot(x,0,y,.32,'#ffd27a');x.restore()}}}},
  // ---------- Street Bomber Jacket
  bomber:{legs:'#2c3346',torso:{bb:[-10,0,20,17],f(x){const c='#2f6b4f',O='#ff8a2a';
    x.fillStyle=O;PL(x,[-3,1,3,1,0,5])();x.fill();cel(x,()=>{x.beginPath();x.moveTo(-6.4,.4);x.quadraticCurveTo(0,3.6,6.4,.4);x.lineTo(5.6,-.8);x.quadraticCurveTo(0,2,-5.6,-.8);x.closePath()},'#1e2a24',.6);for(let a=-5;a<=5;a+=1.25)line(x,'rgba(255,255,255,.18)',.25,[a,-.4,a*.96,1.2+(1-Math.abs(a)/6)*1.4]);
    line(x,OL,.9,[.4,3.6,.4,15.4]);line(x,'#c9d2e0',.45,[.4,3.6,.4,15.4]);for(let y=4.4;y<15;y+=.9)line(x,'#8e98ab',.22,[-.1,y,.9,y]);cel(x,RR(x,-.2,3.2,1.2,1.8,.4),'#dfe6f2',.35);
    cel(x,E(x,-5,5.4,2.1,2.1),O,.55);star(x,-5,5.4,1.3,.55,5);x.fillStyle='#fff';x.fill();
    for(const s of[-1,1])cel(x,PL(x,[s*2.6,9.4,s*7.4,8.6,s*7.2,10.2,s*2.8,11]),sh(c,-.12),.5);
    x.fillStyle='#1e2a24';x.fillRect(-8.1,14.2,16.2,2);for(let i=-7.6;i<=7.6;i+=1.1)line(x,'rgba(255,255,255,.16)',.25,[i,14.3,i,16.1]);hl(x,.6,.4,[-7.6,2.4,-7,12])}}},
  // ---------- Astro Suit
  astrosuit:{legs:'#e6eaf2',torso:{bb:[-10,0,20,17],f(x){
    cel(x,E(x,0,.9,6.4,1.8),'#c9d2e0',.6);x.fillStyle='#4fb4ff';x.fillRect(-4.6,.5,9.2,.6);
    cel(x,RR(x,-4.8,3.4,9.6,5.4,1.2),'#8e98ab',.6);x.fillStyle='#1a2236';x.fillRect(-3.8,4.2,4.4,2.4);x.fillStyle='#5ff3ff';x.fillRect(-3.4,4.6,1.4,.5);x.fillRect(-3.4,5.6,2.6,.4);dot(x,2,5,.7,'#ff4d4d');dot(x,3.6,5,.7,'#ffd24a');dot(x,2.8,7,.7,'#3fdf7f');
    x.fillStyle='#ff8a2a';x.fillRect(-8.6,10.6,17.2,1.3);cel(x,E(x,6,2.6,1.4,1.4),'#3a5bd6',.4);spark(x,6,2.6,.9,'#fff');
    cel(x,PL(x,[-8.3,13.6,8.3,13.6,8.1,16,-8.1,16]),'#8e98ab',.6);cel(x,RR(x,-1.6,13.3,3.2,3,.6),'#dfe6f2',.45);hl(x,.7,.6,[-7.8,2,-7.2,12])}},
   back:{bb:[-15,-1,15,20],f(x){cel(x,RR(x,-13.6,1,8.6,16,2.4),'#dfe6f2',1);line(x,'#8e98ab',.5,[-12,5,-6.6,5]);line(x,'#8e98ab',.5,[-12,12,-6.6,12]);cel(x,E(x,-9.3,8.6,2,2),'#ff8a2a',.5);x.strokeStyle=OL;x.lineWidth=1.6;x.beginPath();x.moveTo(-6.6,3);x.quadraticCurveTo(-3,1,-1.6,2.4);x.stroke();x.strokeStyle='#8e98ab';x.lineWidth=.8;x.stroke()}}},
  // ---------- Anonymous Cloak: black suit + flowing cloak + capelet with a violet-gem clasp
  anonsuit:{legs:'#141018',ib:[-18,-6,34,46],torso:{bb:[-10,0,20,17],f(x){const K='#15111c',L='#241c30';
    x.fillStyle='#2b1d42';PL(x,[-3.6,.8,3.6,.8,0,9])();x.fill();
    x.fillStyle='#08060c';PL(x,[-.9,1.2,.9,1.2,1.4,8,0,9.6,-1.4,8])();x.fill();line(x,'rgba(160,110,255,.6)',.3,[-.9,1.4,-1.3,8,0,9.4,1.3,8,.9,1.4]);
    for(const s of[-1,1]){cel(x,PL(x,[s*3.6,.8,s*8.6,1.2,s*5.8,5,s*7.6,5.6,s*.8,10]),L,.6);line(x,'rgba(150,100,255,.55)',.3,[s*3.5,1.1,s*5.6,5.1,s*1,9.8])}
    dot(x,.9,11.4,.6,'#c9c4d4');dot(x,.9,13.6,.6,'#c9c4d4');x.fillStyle=VI;PL(x,[4.6,3.6,6.8,3.4,5.8,4.9])();x.fill();
    line(x,'rgba(255,255,255,.12)',.4,[-7.4,6,-6.6,15.6]);x.fillStyle=sh(K,-.3);x.fillRect(-8.1,15.2,16.2,1)}},
   back:{bb:[-17,-2,28,41],f(x){const hem=[-15,36,-11.4,33.6,-8.4,38,-4.6,34.6,-.6,37.6,3,33.8,6.2,36.8,9.2,33];
    const cl=()=>{x.beginPath();x.moveTo(-8.6,.6);x.bezierCurveTo(-14,8,-16,22,-15,36);for(let i=2;i<hem.length;i+=2)x.lineTo(hem[i],hem[i+1]);x.bezierCurveTo(9.6,22,9.4,10,8.6,.6);x.closePath()};
    cl();const gr=x.createLinearGradient(0,0,0,38);gr.addColorStop(0,'#211a2c');gr.addColorStop(1,'#0a070f');x.fillStyle=gr;x.fill();x.save();cl();x.clip();x.fillStyle='rgba(120,60,220,.14)';x.beginPath();x.ellipse(-9,26,6,14,.2,0,6.3);x.fill();
    for(const[a,b,c2,d]of[[-9,6,-12.4,33],[-3.6,8,-4.4,34],[2.4,8,2.6,34],[6.4,6,7.6,32]])line(x,'rgba(60,44,80,.8)',.6,[a,b,c2,d]);x.restore();
    cl();x.strokeStyle=OL;x.lineWidth=1;x.stroke();x.save();x.globalAlpha=.7;x.strokeStyle=VI;x.lineWidth=.5;x.beginPath();x.moveTo(hem[0],hem[1]);for(let i=2;i<hem.length;i+=2)x.lineTo(hem[i],hem[i+1]);x.stroke();x.restore()}},
   shoulder:{bb:[-13,-4,26,13],f(x){const zz=[11.6,5,8.6,6.6,6,5.4,3,7.4,0,5.8,-3,7.6,-6,5.6,-8.8,7,-11.6,5];
    const cp=()=>{x.beginPath();x.moveTo(-11.6,5);x.bezierCurveTo(-11,-1,-5,-2.6,0,-2.6);x.bezierCurveTo(5,-2.6,11,-1,11.6,5);for(let i=2;i<zz.length;i+=2)x.lineTo(zz[i],zz[i+1]);x.closePath()};cel(x,cp,'#1d1727',.9);
    x.save();x.globalAlpha=.8;x.strokeStyle=VI;x.lineWidth=.4;x.beginPath();x.moveTo(zz[0],zz[1]);for(let i=2;i<zz.length;i+=2)x.lineTo(zz[i],zz[i+1]);x.stroke();x.restore();line(x,'rgba(60,44,80,.9)',.5,[-6,-1,-7.4,5]);line(x,'rgba(60,44,80,.9)',.5,[5.6,-1,7,5]);
    cel(x,E(x,1,.6,1.9,1.9),'#c9c4d4',.5);gem(x,1,.6,1.2,'#9a5cff')}},
   skirt:{bb:[-10,-4,20,10],f(x){cel(x,()=>{x.beginPath();x.moveTo(-8.4,-3.2);x.lineTo(8.4,-3.2);x.lineTo(9.2,4.4);x.lineTo(1.6,5.6);x.lineTo(.6,1);x.lineTo(-.4,5.6);x.lineTo(-9.2,4.6);x.closePath()},'#15111c',.7);line(x,'rgba(150,100,255,.45)',.3,[-9,4.4,-.4,5.4]);line(x,'rgba(150,100,255,.45)',.3,[1.6,5.4,9,4.2])}}},
  // ---------- boots
  moonboots:{shaft:.62,sc:'#dfe6f2',foot:{bb:[-7,-9,15,13],f(x){const c='#e8edf6';
    cel(x,()=>{x.beginPath();x.moveTo(-4.4,-7.4);x.lineTo(3.2,-7.4);x.lineTo(3.8,-3.4);x.bezierCurveTo(7,-3.2,7.4,.8,6.6,2);x.lineTo(-5,2);x.bezierCurveTo(-5.8,-.4,-5.4,-4.4,-4.4,-7.4);x.closePath()},c,1);
    for(const y of[-5.6,-3.6])line(x,'#b9c2d4',.45,[-4.6,y,3.4,y+.2]);x.fillStyle='#4fa8ff';x.fillRect(-4.8,-1.8,10.6,.9);
    cel(x,RR(x,-5.6,1.2,13,2.6,1),'#8a93a6',.8);for(let a=-4.4;a<7;a+=1.6)line(x,'#5b6270',.35,[a,1.6,a,3.4]);hl(x,.7,.7,[-3.6,-6.6,-3.8,-2.4])}}},
  hightops:{shaft:.42,sc:'#1c1a2a',foot:{bb:[-6,-8,13,14],f(x){const c='#1c1a2a',N='#24e0ff';
    cel(x,()=>{x.beginPath();x.moveTo(-3.4,-7);x.lineTo(2.4,-7);x.lineTo(2.8,-3);x.bezierCurveTo(5.8,-2.6,6.2,.4,5.6,.8);x.lineTo(-3.8,.8);x.closePath()},c,1);
    x.fillStyle='#f4f4ff';x.beginPath();x.moveTo(3,-2.8);x.bezierCurveTo(5.6,-2.4,6,.2,5.6,.8);x.lineTo(2.6,.8);x.closePath();x.fill();
    x.strokeStyle=N;x.lineWidth=.8;x.beginPath();x.moveTo(-3,-1.4);x.quadraticCurveTo(1,-1.6,4.6,-3.4);x.stroke();for(let i=0;i<3;i++)line(x,'#ff5ae8',.55,[.2+i*.5,-6+i*1.1,2.2+i*.4,-6.3+i*1.1]);
    glow(x,1,1.6,4,'#24e0ff',.5);cel(x,RR(x,-4.2,.6,10.4,1.8,.8),N,.6);hl(x,.5,.8,[-3.6,1.2,5.6,1.2])}}},
  // ---------- gloves
  royalgaunt:{glove:{bb:[-6,-7,12,12],f(x){mitt(x,'#e8c35a','#c9d2e0',1);x.fillStyle='#b0283a';x.fillRect(-3.6,-3.6,7.2,.9);for(const a of[-2.4,-.8,.8])cel(x,PL(x,[a,-1.7,a+1.5,-1.7,a+1.3,-.7,a+.2,-.7]),'#f6e2a0',.3,.2,-.15);gem(x,-.3,1.2,1.3,'#e0284a');spark(x,2.8,-2.2,1.2,'#fff')}}}
 });
 const IDS=['witchhat','headphones','kabuto','astrohelm','samurai','bomber','astrosuit','moonboots','hightops','royalgaunt','anonmask','anonsuit'],ANON={anonmask:1,anonsuit:1};
 // ---------------- icons (same parts, fitted; the mythic pieces sit on their own dark aura) ----------------
 function torsoBase(x,c){cel(x,PL(x,[-9.5,1,9.5,1,8,16,-8,16]),c,1.1)}
 function sleeve(x,c,s){x.lineCap='round';x.strokeStyle=OL;x.lineWidth=6.8;x.beginPath();x.moveTo(s*7.6,3.2);x.lineTo(s*11,11.6);x.stroke();x.strokeStyle=s<0?sh(c,-.15):c;x.lineWidth=4.6;x.stroke()}
 function icon(x,id,S){const d=D[id],w=WEAR[id];if(!d||!w)return false;x.save();x.lineJoin='round';x.lineCap='round';
  if(ANON[id]){const s=spr8();x.save();x.globalAlpha=.95;x.drawImage(s.halo,S*.02,S*.02,S*.96,S*.96);x.globalAlpha=.85;for(let i=0;i<5;i++)x.drawImage(s.puff[i%3],S*(.08+i*.17),S*(.55-Math.sin(i*1.9)*.1),S*.34,S*.34);x.globalCompositeOperation='lighter';x.globalAlpha=.7;x.drawImage(s.vio,S*.1,S*.1,S*.8,S*.8);for(let i=0;i<7;i++)x.drawImage(s.ember,S*(.14+((i*.37)%1)*.72),S*(.12+((i*.61)%1)*.74),S*.07,S*.07);x.restore()}
  const fit=(bb,f)=>{const s=Math.min(S*.8/bb[2],S*.8/bb[3]);x.translate(S/2,S/2+S*.02);x.scale(s,s);x.translate(-(bb[0]+bb[2]/2),-(bb[1]+bb[3]/2));f()};
  if(w.s=='hat')fit(d.ib||d.hatF.bb,()=>{if(d.hatB)d.hatB.f(x);d.hatF.f(x)});
  else if(w.s=='body'){const c=w.c;fit(d.ib||(d.shoulder?[-17,-5,34,30]:d.back?[-15,-4,30,24]:[-13,-6,26,26]),()=>{if(d.back)d.back.f(x);sleeve(x,c,-1);torsoBase(x,c);d.torso.f(x);sleeve(x,c,1);if(d.skirt){x.save();x.translate(0,16);d.skirt.f(x);x.restore()}if(d.shoulder)d.shoulder.f(x)})}
  else if(w.s=='boot'){const fb=d.foot.bb,tp=-5-(d.shaft||0)*13;fit([Math.min(-6.5,fb[0]),Math.min(fb[1],tp-3),Math.max(13.5,fb[2]),3.4-Math.min(fb[1],tp-3)+1],()=>{if(d.shaft){cel(x,PL(x,[-3.2,tp,2.6,tp,2.7,-6,-3.3,-6]),d.sc,1);cel(x,PL(x,[-3.7,tp-1,3.1,tp-1,3,tp+1.1,-3.6,tp+1.1]),sh(d.sc,.25),.8,.5,-.4)}d.foot.f(x)})}
  else if(w.s=='glove')fit([-6,-7.4,12,12],()=>d.glove.f(x));
  x.restore();return true}
 const _icon=GEAR7.icon;GEAR7.icon=function(x,id,S){if(IDS.includes(id))return icon(x,id,S);return _icon.apply(this,arguments)};
 // ---------------- shared aura sprites (built once, lazily) ----------------
 let SP=null;const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const rad=(x,cx,cy,r,stops)=>{const gr=x.createRadialGradient(cx,cy,0,cx,cy,r);for(const s of stops)gr.addColorStop(s[0],s[1]);x.fillStyle=gr;x.fillRect(cx-r,cy-r,r*2,r*2)};
 function spr8(){if(SP)return SP;SP={};
  // dark smoke puffs (normal blending): lumpy clusters of soft dark-violet blobs
  SP.puff=[0,1,2].map(v=>{const c=mk(96,96),x=c.getContext('2d');for(let i=0;i<7;i++){const a=i*2.39+v,r0=i?14+((i*5+v*3)%4)*2:0,px=48+Math.cos(a)*r0,py=48+Math.sin(a)*r0*.8,r=20+((i*7+v*5)%5)*3;rad(x,px,py,r,[[0,'rgba(10,4,18,.5)'],[.55,'rgba(22,8,40,.26)'],[1,'rgba(24,8,44,0)']])}return c});
  SP.vio=(()=>{const c=mk(96,96),x=c.getContext('2d');rad(x,48,48,48,[[0,'rgba(170,90,255,.55)'],[.45,'rgba(120,40,230,.22)'],[1,'rgba(90,20,200,0)']]);return c})();
  SP.ember=(()=>{const c=mk(24,24),x=c.getContext('2d');rad(x,12,12,12,[[0,'rgba(255,255,255,1)'],[.22,'rgba(226,190,255,.95)'],[.5,'rgba(150,70,255,.55)'],[1,'rgba(110,30,230,0)']]);return c})();
  SP.eye=(()=>{const c=mk(24,24),x=c.getContext('2d');rad(x,12,12,12,[[0,'rgba(240,220,255,1)'],[.3,'rgba(170,100,255,.8)'],[1,'rgba(120,40,240,0)']]);return c})();
  // tendril: a dark flame licking upward (normal) + its violet rim (additive)
  const flame=x=>{x.beginPath();x.moveTo(24,124);x.bezierCurveTo(4,110,6,78,16,56);x.bezierCurveTo(24,38,18,20,26,2);x.bezierCurveTo(30,22,40,40,40,62);x.bezierCurveTo(42,88,44,112,24,124);x.closePath()};
  SP.ten=(()=>{const c=mk(48,128),x=c.getContext('2d');flame(x);const gr=x.createLinearGradient(0,128,0,0);gr.addColorStop(0,'rgba(6,3,10,.92)');gr.addColorStop(.55,'rgba(22,10,40,.75)');gr.addColorStop(1,'rgba(60,20,120,0)');x.fillStyle=gr;x.fill();return c})();
  SP.tenR=(()=>{const c=mk(48,128),x=c.getContext('2d');flame(x);const gr=x.createLinearGradient(0,128,0,0);gr.addColorStop(0,'rgba(140,60,255,0)');gr.addColorStop(.35,'rgba(150,70,255,.55)');gr.addColorStop(1,'rgba(210,170,255,.0)');x.strokeStyle=gr;for(const[w,a]of[[7,.18],[4,.35],[1.6,.9]]){x.globalAlpha=a;x.lineWidth=w;x.stroke()}return c})();
  // halo: an eclipse-dark ring with thorn rays (normal) and a glowing violet rim (additive)
  SP.halo=(()=>{const c=mk(256,256),x=c.getContext('2d');rad(x,128,128,128,[[0,'rgba(10,4,20,0)'],[.5,'rgba(10,4,20,0)'],[.6,'rgba(12,5,24,.55)'],[.68,'rgba(16,6,30,.85)'],[.76,'rgba(50,16,100,.5)'],[.9,'rgba(60,20,120,.0)']]);
   x.translate(128,128);for(let i=0;i<24;i++){x.rotate(Math.PI/12);const L=i%2?100:112;x.beginPath();x.moveTo(-4,-86);x.lineTo(0,-L);x.lineTo(4,-86);x.closePath();x.fillStyle=i%2?'rgba(40,14,76,.55)':'rgba(20,8,38,.7)';x.fill()}return c})();
  SP.haloR=(()=>{const c=mk(256,256),x=c.getContext('2d');for(const[w,a]of[[16,.08],[9,.16],[4.5,.35],[1.8,.9]]){x.strokeStyle='rgba(170,110,255,'+a+')';x.lineWidth=w;x.beginPath();x.arc(128,128,92,0,6.3);x.stroke()}
   x.strokeStyle='rgba(220,190,255,.5)';x.lineWidth=1.2;for(let i=0;i<6;i++){x.beginPath();x.arc(128,128,100,i*1.05,i*1.05+.5);x.stroke()}return c})();
  SP.pool=(()=>{const c=mk(192,56),x=c.getContext('2d');x.translate(96,28);x.scale(1,.29);rad(x,0,0,96,[[0,'rgba(6,2,12,.8)'],[.62,'rgba(20,6,40,.55)'],[.82,'rgba(120,50,240,.32)'],[1,'rgba(90,20,200,0)']]);return c})();
  return SP}
 // ---------------- the aura: stateless particles as a function of time ----------------
 const h=i=>{const v=Math.sin(i*12.9898+4.1)*43758.5453;return v-Math.floor(v)};
 const qk=()=>{try{return Math.max(.35,Math.min(1.25,QM.cur.vfx*(QM.reduce?.45:1)))}catch(_){return 1}};
 // o: {cx, base (y where smoke starts), rise, w (half spread), k (sprite scale), hx, hy, hr (halo), lv (1 piece / 2 full set), boost (Vanish)}
 function paint(g,o,t,layer){const s=spr8(),lv=o.lv,A=(lv>1?1:.72)*(o.boost?1.25:1),q=qk()*(lv>1?1:.7),k=o.k,{cx,base,rise,w}=o,PI=Math.PI;g.save();
  if(layer=='b'){
   // ground: a shadow pool + slow ripples spreading along the floor (reads as dark heat-haze)
   g.globalAlpha=Math.min(1,.9*A);const pw=w*3*(1+.05*Math.sin(t*2.2));g.drawImage(s.pool,cx-pw/2,base-pw*.15,pw,pw*.3);
   g.globalCompositeOperation='lighter';for(let j=0;j<2;j++){const u=(t*.5+j*.5)%1,r=w*(.6+u*1.5);g.globalAlpha=(1-u)*(1-u)*.5*A;g.drawImage(s.haloR,cx-r,base-r*.26,r*2,r*.52)}
   // violet body glow so the silhouette pops on dark backgrounds
   g.globalAlpha=(.48+.14*Math.sin(t*2.4))*A;g.drawImage(s.vio,cx-w*1.9,base-rise*.95,w*3.8,rise*1.05);g.globalCompositeOperation='source-over';
   // dark halo behind the head
   if(o.hr){const r=o.hr*(1+.04*Math.sin(t*1.8));g.save();g.translate(o.hx,o.hy);g.rotate(t*.3);g.globalAlpha=.7*A;g.drawImage(s.halo,-r,-r,r*2,r*2);g.rotate(-t*.75);g.globalCompositeOperation='lighter';g.globalAlpha=(.4+.25*Math.sin(t*3))*A;g.drawImage(s.haloR,-r,-r,r*2,r*2);g.restore()}
   // tendrils of shadow flame licking up around the body
   const nt=Math.round(9*q);for(let i=0;i<nt;i++){const side=i%2?1:-1,x=cx+side*w*(.25+.6*h(i+1)),H=rise*.72*(.7+.4*Math.sin(t*1.9+i*1.9))*(.8+.4*h(i+2)),W=k*14*(.8+.4*h(i+3));g.save();g.translate(x,base+k*2);g.rotate(Math.sin(t*1.4+i*1.7)*.22+side*.16);g.globalAlpha=A;g.drawImage(s.ten,-W/2,-H,W,H);g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,1.1*A);g.drawImage(s.tenR,-W/2,-H,W,H);g.restore()}
   // smoke spiralling up the body (fades out before it clears the head)
   const nw=Math.round(14*q);for(let i=0;i<nw;i++){const sp=.24+.18*h(i+7),u=(t*sp+h(i))%1,y=base-u*rise*.82,sw=Math.sin(u*5.5+i*2.1+t*.7),x=cx+sw*w*(.55+u*.35)+(h(i+3)-.5)*w*.5,z=k*(16+u*26)*(.8+.4*h(i+5)),a=Math.sin(u*PI)*(1-u*.5)*.9*A;
    g.globalAlpha=a;g.drawImage(s.puff[i%3],x-z/2,y-z/2,z,z);if(i%2==0){g.globalCompositeOperation='lighter';g.globalAlpha=a*.5;g.drawImage(s.vio,x-z*.35,y-z*.35,z*.7,z*.7);g.globalCompositeOperation='source-over'}}}
  else{
   // a few thin wisps in front of the legs wrap the character in the smoke
   for(let i=0;i<4;i++){const u=(t*.22+h(i+23))%1,y=base-u*rise*.5,x=cx+Math.sin(u*5+i*1.7+t*.6)*w*.8,z=k*(16+u*16);g.globalAlpha=Math.sin(u*PI)*.42*A;g.drawImage(s.puff[i%3],x-z/2,y-z/2,z,z)}
   g.globalCompositeOperation='lighter';
   const ne=Math.round(20*q);for(let i=0;i<ne;i++){const sp=.3+.3*h(i+11),u=(t*sp+h(i+13))%1,y=base-u*rise*1.05,x=cx+(h(i+17)-.5)*2*w*.95+Math.sin(u*9+i)*w*.18,z=k*(4+4*h(i+19))*(1-u*.45);g.globalAlpha=Math.sin(u*PI)*A;g.drawImage(s.ember,x-z/2,y-z/2,z,z)}}
  g.restore()}
 const level=wr=>wr?(wr.hat=='anonmask'?1:0)+(wr.body=='anonsuit'?1:0):0;
 // in-game: wrap the character renderer (every caller: world, store try-on, hub previews). Feet are at cy+54, the head near cy-8.
 const st={vanish:0,lowg:0};
 const _ad=AC6.draw;AC6.draw=function(cx,cy,f,hue,name,t,vx,air,bubT,wpn,sw,fm,wr,dsh,lk,q){const lv=level(wr),me=q==='me',van=me&&st.vanish>0;if(!lv&&!van)return _ad.apply(this,arguments);
  const o={cx,base:cy+56,rise:78,w:18,k:1,hx:cx-f*1.5,hy:cy+3,hr:27,lv:Math.max(1,lv),boost:van};if(air)o.base-=4;
  try{paint(g,o,t,'b')}catch(_){}
  if(van){const a0=g.globalAlpha;g.globalAlpha=.42;try{_ad.apply(this,arguments)}finally{g.globalAlpha=a0}}else _ad.apply(this,arguments);
  try{paint(g,o,t,'f')}catch(_){}};
 // the mask's eye slits glow and pulse (the hood itself is a cached sprite); the astro helmet's antenna light blinks
 const _hat=GEAR7.hat;GEAR7.hat=function(g,id,hy,t,layer,k){const r=_hat.apply(this,arguments);if(layer=='F'){try{
  if(id=='anonmask'){const s=spr8(),a=.6+.4*Math.sin(t*2.6);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(s.eye,6-2.6,hy-1.4,5.2,5.2);g.globalAlpha=a*.8;g.drawImage(s.eye,-1.5-2.1,hy-.9,4.2,4.2);g.restore()}
  else if(id=='astrohelm'&&(t%1.6)<.8){const s=spr8();g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.9;g.fillStyle='#ff4d4d';g.beginPath();g.arc(-9.4,hy-24,1.3,0,6.3);g.fill();g.globalAlpha=.6;g.drawImage(s.ember,-12.4,hy-27,6,6);g.restore()}
  else if(id=='astrohelm'){g.fillStyle='#8a2a2a';g.beginPath();g.arc(-9.4,hy-24,1.3,0,6.3);g.fill()}}catch(_){}}return r};
 // ---------------- skills (the base useSkill handles cooldown, ring and burst; these add the effect) ----------------
 const near=r=>{const o=[];try{for(const m of mobs)if(Math.hypot(m.x-P.x,m.y-P.y)<T*r)o.push(m)}catch(_){}return o};
 const V=(k,c,x,y,vx,vy,l,s0,s1,o)=>{try{VFX.add(k,c,x,y,vx,vy,l,s0,s1,o)}catch(_){}};
 const SK={
  witchhat(){for(const m of near(6)){m.slow=4;hurtMob(m,Math.round(8+lvl*.6),null,Math.atan2(m.y-P.y,m.x-P.x))}try{VFX.wave(P.x,P.y+40,'#9a5cff',T*6,.6,.3);VFX.burst(P.x,P.y+30,['#9a5cff','#7dff8a'],18,220,1,.7,10)}catch(_){}},
  headphones(){sprint=4;try{VFX.wave(P.x,P.y+30,'#ff4f9a',90,.4,1);VFX.wave(P.x,P.y+30,'#5ff3ff',60,.35,1)}catch(_){}},
  kabuto(){rally=6;try{VFX.burst(P.x,P.y+20,['#ffd27a','#ff3a5a'],18,240,1,.6,12)}catch(_){}},
  astrohelm(){st.lowg=6;try{VFX.burst(P.x,P.y+40,['#bfe8ff','#ffffff'],14,160,1,.8,8)}catch(_){}},
  samurai(){dash=.24;dashDir=P.f||1;for(const m of near(4))if(Math.sign(m.x-P.x)==dashDir||Math.abs(m.x-P.x)<T)hurtMob(m,Math.round(18+lvl*1.2),null,dashDir>0?0:Math.PI);try{FX7.anim('lance',P.x,P.y+P.h,dashDir,['#ff3a5a','#ffffff'])}catch(_){}},
  bomber(){sprint=5},
  astrosuit(){P.hp=Math.min(maxHP(),P.hp+35);ft(P.x,P.y-20,'+35','#7dff8a');try{VFX.burst(P.x,P.y+30,['#bfe8ff','#7dff8a'],16,140,1,.8,9)}catch(_){}},
  moonboots(){P.vy=-1150;P.g=false;st.lowg=1.8;try{VFX.land(P.x,P.y+P.h,600)}catch(_){}},
  hightops(){dash=.22;dashDir=P.f||1;try{VFX.dash(P.x,P.y+30,dashDir,'#24e0ff')}catch(_){}},
  royalgaunt(){midas=6;try{VFX.burst(P.x,P.y+20,['#ffd24a','#fff6c0'],20,220,1,.8,10)}catch(_){}},
  // Vanish: a living shadow for 5s. Untouchable (the brace timer), +40% speed, the aura flares, a burst of dark smoke
  anonmask(){st.vanish=5;brace=Math.max(brace,5);sprint=Math.max(sprint,5);shake=Math.max(shake,.08);for(let i=0;i<22;i++){const a=i/22*6.283;V(0,'#1a0c2e',P.x,P.y+30,Math.cos(a)*120,Math.sin(a)*80-20,.9,22,44,{d:2.2,a:.8,add:0});V(1,'#b884ff',P.x,P.y+30,Math.cos(a)*200,Math.sin(a)*150,.6,8,2,{d:2,a:1})}
   try{VFX.wave(P.x,P.y+30,'#8a4cff',140,.55,.35);snd(140,.5,'sawtooth',.05,.4)}catch(_){}},
  // Legion of Shadows: a dark nova; every monster within 9 tiles is crushed, dragged toward you and slowed. You recover 15% health.
  anonsuit(){const d=Math.round(40+lvl*2.5);for(const m of near(9)){hurtMob(m,d,null,Math.atan2(P.y-m.y,P.x-m.x));m.vx=(P.x-m.x)*2.2;m.slow=3.5;m.stun=Math.max(m.stun||0,1)}
   P.hp=Math.min(maxHP(),P.hp+maxHP()*.15);shake=Math.max(shake,.28);try{FX7.anim('chains',P.x,P.y+P.h,P.f||1,['#8a4cff','#e0c8ff']);for(const[r,l,c]of[[T*9,.9,'#8a4cff'],[T*6,.7,'#2a1046'],[T*3.5,.5,'#e0c8ff']])VFX.wave(P.x,P.y+30,c,r,l,.32)}catch(_){}
   for(let i=0;i<36;i++){const a=i/36*6.283,v=180+h(i)*220;V(0,'#12081f',P.x+Math.cos(a)*T*7,P.y+30+Math.sin(a)*T*3,-Math.cos(a)*v,-Math.sin(a)*v*.5,.8,30,10,{d:1.5,a:.75,add:0});V(1,'#c9a8ff',P.x,P.y+30,Math.cos(a)*v*1.4,Math.sin(a)*v,.7,9,2,{d:1.8})}try{snd(70,.8,'sawtooth',.07,.3);snd(220,.6,'triangle',.05,.5)}catch(_){}}};
 {const _us=useSkill;useSkill=function(slot){const id=wear[slot];if(SK[id]&&!(cdT[slot]>0)&&!showInv&&!dlgOpen){_us.apply(this,arguments);try{SK[id]()}catch(e){console.error('GEAR8 skill',e)}return}return _us.apply(this,arguments)}}
 // timers + low gravity (Astro Helmet / Moon Boots): falling is capped so jumps float
 {const _p=physics;physics=function(dt){const r=_p.apply(this,arguments);try{if(st.vanish>0)st.vanish-=dt;if(st.lowg>0){st.lowg-=dt;if(!P.g&&P.vy>0)P.vy=Math.min(P.vy,175)}}catch(_){}return r}}
 return{IDS,ANON,SK,st,paint,level,spr8,icon,get sprites(){return SP}}})();
