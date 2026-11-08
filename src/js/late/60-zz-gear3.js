// ===== GEAR10: the v10 wardrobe. Six animated sets of two pieces (hat + body), each with its own living aura, worn art, icons and skills:
//   Bubblegum Dream (mythic)  — a pastel bunny hood and a frilly bubble dress; iridescent bubbles rise, wobble and pop into sparkles and hearts
//   Celestial Dawn (mythic) — a halo crown and a white-gold robe with feather wings; drifting feathers, a sun halo, a column of light
//   Inferno Dragon (mythic)   — a horned dragon helm and crimson scale armour with wings; licking flames, embers, a burning ring
//   Sakura Kitsune (legendary) — a fox mask with fox ears and a kimono with three swaying fox tails; sakura petals and blue foxfire wisps
//   Frost Empress (legendary) — an ice tiara and a frost gown with a frost mantle; falling snowflakes, rising ice shards, an ice ring
//   Neon Cyber (legendary)    — a techwear hood with a glowing visor and a neon jacket; rising neon pixels, glitch bars, a hex ring
// One piece shows the aura softly, the full set at full strength (like the Anonymous set in 60-z-gear2.js). Stats live in WEAR (added here),
// the store items in tools/gear-v8.json → server/catalog.json. Aura cost: every sprite is rendered once per theme to an offscreen canvas;
// particle motion is stateless (a function of time + index), so a frame is ~40 drawImage calls per aura wearer and nothing allocates.
const GEAR10=(()=>{
 const OL='#140c1c',sh=(c,k)=>AC6.shade(c,k),D=GEAR7.D,TAU=Math.PI*2;
 // ---- vector helpers (same cel language as GEAR7 / GEAR8)
 function cel(x,path,col,lw,lx,ly){path();x.fillStyle=sh(col,-.3);x.fill();x.save();path();x.clip();x.translate(lx==null?1.3:lx,ly==null?-1:ly);path();x.fillStyle=col;x.fill();x.restore();path();x.strokeStyle=OL;x.lineWidth=lw==null?1:lw;x.stroke()}
 const PL=(x,a,c)=>()=>{x.beginPath();x.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)x.lineTo(a[i],a[i+1]);if(c!==false)x.closePath()};
 const E=(x,cx,cy,rx,ry,r)=>()=>{x.beginPath();x.ellipse(cx,cy,rx,ry,r||0,0,TAU)};
 function line(x,c,w,p){x.strokeStyle=c;x.lineWidth=w;x.beginPath();x.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)x.lineTo(p[i],p[i+1]);x.stroke()}
 const hl=(x,w,a,p)=>{x.save();x.globalAlpha=a;line(x,'#fff',w,p);x.restore()};
 function star(x,cx,cy,r1,r2,n,rot){x.beginPath();for(let i=0;i<n*2;i++){const a=(rot==null?-Math.PI/2:rot)+i*Math.PI/n,r=i%2?r2:r1;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}x.closePath()}
 function glow(x,cx,cy,r,col,a){const gr=x.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,col);gr.addColorStop(1,col+'00');x.save();x.globalAlpha=a||.6;x.fillStyle=gr;x.fillRect(cx-r,cy-r,r*2,r*2);x.restore()}
 function gem(x,cx,cy,r,col){x.beginPath();x.moveTo(cx,cy-r);x.lineTo(cx+r*.9,cy);x.lineTo(cx,cy+r);x.lineTo(cx-r*.9,cy);x.closePath();const gr=x.createLinearGradient(cx-r,cy-r,cx+r,cy+r);gr.addColorStop(0,sh(col,.6));gr.addColorStop(.5,col);gr.addColorStop(1,sh(col,-.5));x.fillStyle=gr;x.fill();x.strokeStyle=OL;x.lineWidth=Math.max(.35,r*.28);x.stroke();x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(cx-r*.28,cy-r*.34,r*.26,0,TAU);x.fill()}
 const spark=(x,cx,cy,r,col)=>{star(x,cx,cy,r,r*.28,4,0);x.fillStyle=col||'#fff';x.fill()};
 const dot=(x,cx,cy,r,col)=>{x.fillStyle=col;x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill()};
 function bubble(x,cx,cy,r,a){const gr=x.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);gr.addColorStop(0,'rgba(255,255,255,'+(.9*(a||1))+')');gr.addColorStop(.35,'rgba(200,240,255,'+(.25*(a||1))+')');gr.addColorStop(.8,'rgba(255,170,230,'+(.3*(a||1))+')');gr.addColorStop(1,'rgba(140,220,255,'+(.55*(a||1))+')');
  x.fillStyle=gr;x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();x.strokeStyle='rgba(120,90,170,'+(.6*(a||1))+')';x.lineWidth=Math.max(.3,r*.12);x.stroke();x.fillStyle='rgba(255,255,255,.95)';x.beginPath();x.ellipse(cx-r*.38,cy-r*.42,r*.22,r*.13,-.6,0,TAU);x.fill()}
 function heart(x,cx,cy,r,col){x.beginPath();x.moveTo(cx,cy+r*.9);x.bezierCurveTo(cx-r*1.4,cy,cx-r*.7,cy-r*1.1,cx,cy-r*.35);x.bezierCurveTo(cx+r*.7,cy-r*1.1,cx+r*1.4,cy,cx,cy+r*.9);x.closePath();x.fillStyle=col;x.fill()}
 // hood rim shapes shared by the hoods (3/4 view, the face looks to +x; the head centre is 0,0)
 const hoodOuter=(x,s)=>{s=s||1;x.moveTo(11.8*s,-2);x.bezierCurveTo(12.4*s,-14.4,5.4,-21.6,-1.5,-21.6);x.bezierCurveTo(-11.4,-21.6,-16.4,-12.4,-15.8,-1);x.bezierCurveTo(-15.6,6,-14.6,11.8,-12,15.4);x.lineTo(-6.4,14.2);x.lineTo(-2,15.8);x.lineTo(3.4,14);x.lineTo(10.2,14.4);x.bezierCurveTo(12.2,9,12.5,4,11.8*s,-2);x.closePath()};
 const faceOp=x=>{x.moveTo(-6.8,12);x.bezierCurveTo(-9.4,6,-9.6,-2,-7.2,-7.8);x.bezierCurveTo(-3.8,-13,6.4,-13.8,11.4,-6.2);x.lineTo(11.8,12.4);x.closePath()};
 const faceRim=x=>{x.beginPath();x.moveTo(-6.8,12);x.bezierCurveTo(-9.4,6,-9.6,-2,-7.2,-7.8);x.bezierCurveTo(-3.8,-13,6.4,-13.8,11.4,-6.2)};
 function hood(x,col,lit){x.save();x.beginPath();hoodOuter(x);faceOp(x);x.fillStyle=sh(col,-.3);x.fill('evenodd');x.beginPath();hoodOuter(x);faceOp(x);x.clip('evenodd');x.translate(1.3,-1);x.beginPath();hoodOuter(x);x.fillStyle=col;x.fill();x.restore();
  x.beginPath();hoodOuter(x);x.strokeStyle=OL;x.lineWidth=1.1;x.stroke();faceRim(x);x.strokeStyle=OL;x.lineWidth=1;x.stroke();if(lit){faceRim(x);x.strokeStyle=lit;x.lineWidth=.5;x.stroke()}}
 const torsoP=x=>()=>{x.beginPath();x.moveTo(-9.5,1);x.lineTo(9.5,1);x.lineTo(8,16);x.lineTo(-8,16);x.closePath()};
 // ================= worn art =================
 Object.assign(D,{
  // ---------- Bubblegum Dream: Bubble Bunny Hood
  bubblehood:{cover:1,ib:[-19,-40,36,56],
   hatB:{bb:[-19,-40,26,58],f(x){const C='#ffb3dc';
    // far ear (behind), then the back of the hood
    x.save();x.translate(-3,-17);x.rotate(-.55);cel(x,E(x,0,-11,4.2,12),sh(C,-.12),1);x.fillStyle='#ffd8ee';x.beginPath();x.ellipse(.4,-11,2.1,8.6,0,0,TAU);x.fill();x.restore();
    cel(x,()=>{x.beginPath();x.moveTo(-9,-4);x.bezierCurveTo(-16.4,4,-16.8,15,-14.6,25);x.lineTo(-7,23.4);x.lineTo(-4.6,25.6);x.lineTo(2.6,22.8);x.bezierCurveTo(5,15,3.6,6,1.6,0);x.closePath()},sh(C,-.08),1)}},
   hatF:{bb:[-19,-42,36,60],f(x){const C='#ffb3dc',IN='#ffe0f2';hood(x,C);
    // fluffy white trim around the face
    x.fillStyle='#fff8fc';x.strokeStyle=OL;x.lineWidth=.6;for(const[px,py]of[[-6.8,11],[-8.6,6.4],[-9.2,1.6],[-8.6,-3.2],[-6.8,-7.6],[-3.6,-10.8],[.4,-12.6],[4.6,-12.4],[8.6,-9.6],[11.4,-6]]){x.beginPath();x.arc(px,py,2.2,0,TAU);x.fill();x.stroke()}
    x.fillStyle='#fff8fc';for(const[px,py]of[[-6.8,11],[-8.6,6.4],[-9.2,1.6],[-8.6,-3.2],[-6.8,-7.6],[-3.6,-10.8],[.4,-12.6],[4.6,-12.4],[8.6,-9.6],[11.4,-6]]){x.beginPath();x.arc(px,py,1.6,0,TAU);x.fill()}
    // near ear (flops back a little), pink inside
    x.save();x.translate(2,-19);x.rotate(-.25);cel(x,E(x,0,-11.5,4.4,12.6),C,1);x.fillStyle=IN;x.beginPath();x.ellipse(.6,-11,2.2,9,0,0,TAU);x.fill();hl(x,.7,.5,[-2.6,-18,-3,-6]);x.restore();
    // cyan ribbon bow between the ears, a bubble charm and polka dots
    x.save();x.translate(-2,-19);for(const s of[-1,1])cel(x,()=>{x.beginPath();x.moveTo(0,0);x.bezierCurveTo(s*4,-4.4,s*7.4,-2.4,s*6.6,1.4);x.bezierCurveTo(s*5.6,4,s*2,2.4,0,0);x.closePath()},'#7ae8ff',.7);cel(x,E(x,0,.4,1.8,1.6),'#bff6ff',.6);x.restore();
    for(const[px,py,r]of[[-12,6,1.2],[-10.4,-10,1],[-13.6,-2,.9],[-7,13,.9]])dot(x,px,py,r,'#ffe9f6');
    line(x,'#c98ab0',.5,[-11.2,14,-11.4,19]);bubble(x,-11.4,21.6,2.8);spark(x,-8.2,19.4,1,'#fff')}}},
  // ---------- Celestial Dawn: Halo Crown
  seraphcrown:{ib:[-17,-40,34,32],
   hatB:{bb:[-17,-38,34,14],f(x){x.save();x.strokeStyle='#b8862a';x.lineWidth=2.6;x.beginPath();x.ellipse(0,-29,12,3.4,-.08,Math.PI,TAU);x.stroke();x.strokeStyle='#ffe9a0';x.lineWidth=1.2;x.stroke();x.restore()}},
   hatF:{bb:[-17,-40,34,32],f(x){const G='#f2c14e';
    glow(x,0,-29,14,'#fff2b0',.55);x.strokeStyle=OL;x.lineWidth=3.6;x.beginPath();x.ellipse(0,-29,12,3.4,-.08,0,Math.PI);x.stroke();x.strokeStyle='#ffd65a';x.lineWidth=2.4;x.stroke();x.strokeStyle='#fffbe0';x.lineWidth=.9;x.stroke();
    for(let i=0;i<6;i++){const a=Math.PI*(.08+i*.168),px=Math.cos(a)*12,py=-29+Math.sin(a)*3.4;spark(x,px,py-.3,1.1,'#fff')}
    // a laurel circlet with a sun gem
    cel(x,()=>{x.beginPath();x.moveTo(-12,-8.4);x.quadraticCurveTo(0,-13.6,12,-8.6);x.lineTo(11.6,-6.4);x.quadraticCurveTo(0,-11,-11.6,-6.2);x.closePath()},G,.8);
    for(const s of[-1,1])for(let i=0;i<4;i++){const px=s*(3.4+i*2.3),py=-11.4+i*.9;x.save();x.translate(px,py);x.rotate(s*(.9+i*.15));cel(x,E(x,0,-2.2,1.2,2.6),i%2?'#e0b040':'#ffd65a',.45,.3,-.3);x.restore()}
    gem(x,0,-12.2,2.4,'#ffef9a');star(x,0,-12.2,4.4,1.2,8,0);x.save();x.globalAlpha=.55;x.fillStyle='#fffbe0';x.fill();x.restore()}}},
  // ---------- Inferno Dragon: Dragon Helm
  dragonhelm:{cover:1,ib:[-26,-40,40,58],
   hatB:{bb:[-28,-40,30,30],f(x){x.save();x.translate(-8,-14);cel(x,()=>{x.beginPath();x.moveTo(0,0);x.bezierCurveTo(-6,-6,-14,-10,-18,-22);x.bezierCurveTo(-12,-15,-6,-11,3,-5);x.closePath()},'#d8c8a8',.9);x.restore()}},
   hatF:{bb:[-26,-42,40,60],f(x){const C='#6a1a24',GD='#f2c14e';hood(x,C,'rgba(255,140,60,.6)');
    x.save();x.beginPath();hoodOuter(x);faceOp(x);x.clip('evenodd');x.strokeStyle='rgba(20,4,8,.45)';x.lineWidth=.7;for(let r=0;r<6;r++)for(let c=0;c<7;c++){const px=-15+c*4.4+(r%2)*2.2,py=-18+r*5.4;x.beginPath();x.arc(px,py,2.4,0,Math.PI);x.stroke()}x.restore();
    faceRim(x);x.strokeStyle=GD;x.lineWidth=1.3;x.stroke();
    // crest spikes along the top, the near horn, a cheek guard and a glowing ember stone
    for(let i=0;i<4;i++){const px=-11+i*5,py=-20.6+Math.abs(i-1.5)*1.2;cel(x,PL(x,[px-2,py+1.6,px,py-4.6-(i==1?1.6:0),px+2,py+1.6]),'#3a0c12',.6)}
    x.save();x.translate(-5,-15);cel(x,()=>{x.beginPath();x.moveTo(0,0);x.bezierCurveTo(-7,-6,-15,-9,-21,-23);x.bezierCurveTo(-14,-17,-7,-12,4,-4.4);x.closePath()},'#f0e2c4',.9);for(let i=1;i<4;i++)line(x,'rgba(120,90,50,.5)',.45,[-i*4.6,-i*3.4-1,-i*4.6+2.4,-i*3.4+1.2]);x.restore();
    cel(x,PL(x,[11.6,4,12.4,12.6,6.6,14.4,8.6,8]),GD,.7);glow(x,-8.6,-6,5,'#ff7a2a',.8);gem(x,-8.6,-6,2,'#ff8a3a')}}},
  // ---------- Sakura Kitsune: Fox Mask (worn on the side, with fox ears)
  kitsunemask:{ib:[-20,-40,36,44],
   hatF:{bb:[-20,-40,36,44],f(x){const O='#ff9a4a',W='#fff6ee',R='#e0303e';
    for(const[px,ro,sc]of[[-6,-.45,.92],[5,.2,1]]){x.save();x.translate(px,-11);x.rotate(ro);x.scale(sc,sc);cel(x,PL(x,[-4.4,1,0,-12,4.4,1]),O,.9);x.fillStyle='#fff0e2';PL(x,[-2.2,.4,0,-7.6,2.2,.4])();x.fill();x.fillStyle='#3a2018';PL(x,[-1.2,-8.6,0,-12,1.2,-8.6])();x.fill();x.restore()}
    // the mask, tilted up on the side of the head
    x.save();x.translate(-8,-6);x.rotate(-.7);const m=()=>{x.beginPath();x.moveTo(0,-8.6);x.bezierCurveTo(5.4,-8.6,7.8,-4,7.4,.6);x.bezierCurveTo(7,4.6,3.6,7.8,0,9.6);x.bezierCurveTo(-3.6,7.8,-7,4.6,-7.4,.6);x.bezierCurveTo(-7.8,-4,-5.4,-8.6,0,-8.6);x.closePath()};
    for(const s of[-1,1])cel(x,PL(x,[s*3.4,-7,s*6.8,-14,s*7,-5.6]),W,.7);cel(x,m,W,.9);
    for(const s of[-1,1]){x.strokeStyle=R;x.lineWidth=1.1;x.beginPath();x.moveTo(s*1.4,-1.4);x.quadraticCurveTo(s*3.6,-3,s*5.4,-1.2);x.stroke();x.fillStyle=R;PL(x,[s*4.6,-11.6,s*6,-8,s*4.4,-8.4])();x.fill();x.beginPath();x.moveTo(s*5.6,2.4);x.lineTo(s*3,3.4);x.lineTo(s*5.4,4.2);x.strokeStyle=R;x.lineWidth=.7;x.stroke()}
    dot(x,0,4.6,.9,'#2a1414');x.fillStyle=R;x.beginPath();x.arc(0,-5.4,1.2,0,TAU);x.fill();hl(x,.8,.6,[-5.6,-2,-4.6,-6.6]);x.restore();
    line(x,R,.8,[-1.6,-4,6,-9.4]);dot(x,6.4,-9.6,1.2,'#ffd24a');x.save();x.translate(-14,4);x.rotate(.3);for(let i=0;i<2;i++){x.fillStyle=i?'#ffb7cf':'#ffd6e4';star(x,i*3,i*3.4,2.2,1.1,5);x.fill()}x.restore()}}},
  // ---------- Frost Empress: Ice Tiara
  frostcrown:{ib:[-15,-38,30,32],
   hatF:{bb:[-15,-38,30,32],f(x){glow(x,1,-16,14,'#bff6ff',.45);
    cel(x,()=>{x.beginPath();x.moveTo(-11.6,-8.6);x.quadraticCurveTo(0,-13.4,11.8,-8.8);x.lineTo(11.4,-6.8);x.quadraticCurveTo(0,-11,-11.2,-6.6);x.closePath()},'#e6eef8',.8);
    const sp=(px,py,h,w)=>{const gr=x.createLinearGradient(px,py-h,px+w,py);gr.addColorStop(0,'#ffffff');gr.addColorStop(.5,'#bff2ff');gr.addColorStop(1,'#5ac8f0');x.beginPath();x.moveTo(px-w,py);x.lineTo(px-w*.4,py-h*.62);x.lineTo(px,py-h);x.lineTo(px+w*.45,py-h*.6);x.lineTo(px+w,py);x.closePath();x.fillStyle=gr;x.fill();x.strokeStyle=OL;x.lineWidth=.6;x.stroke();line(x,'rgba(255,255,255,.9)',.4,[px,py-h+1,px-.4,py-1])};
    sp(-8.6,-8.4,7,1.8);sp(8.8,-8.6,7,1.8);sp(-4.4,-10.4,11,2.2);sp(4.6,-10.6,11,2.2);sp(.1,-11.6,17,2.8);
    gem(x,.1,-13,2.2,'#7ae8ff');for(const[px,py,r]of[[-6,-22,1.4],[7,-24,1.1],[0,-31,1.6]])spark(x,px,py,r,'#ffffff');
    x.save();x.translate(-11.4,-4);x.strokeStyle='#e6f8ff';x.lineWidth=.7;for(let i=0;i<3;i++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(-2.6,0);x.lineTo(2.6,0);x.stroke()}x.restore()}}},
  // ---------- Neon Cyber: Glitch Hood (glowing visor)
  cyberhood:{cover:1,ib:[-18,-30,32,48],
   hatB:{bb:[-18,-8,22,36],f(x){cel(x,()=>{x.beginPath();x.moveTo(-9,-4);x.bezierCurveTo(-16,4,-16.4,15,-14.4,24.6);x.lineTo(-7,23.2);x.lineTo(-4.6,25.4);x.lineTo(2.6,22.6);x.bezierCurveTo(5,15,3.6,6,1.6,0);x.closePath()},'#10121a',1);line(x,'#24e0ff',.5,[-12,4,-12.6,20])}},
   hatF:{bb:[-18,-30,32,48],f(x){const C='#181b26';hood(x,C,'#24e0ff');
    x.save();x.beginPath();hoodOuter(x);x.clip();line(x,'#24e0ff',.6,[-13.4,-6,-13.8,10]);line(x,'#ff4fd8',.5,[-4,-19,-11,-12]);line(x,'#24e0ff',.4,[2,-20.4,8.6,-15]);x.restore();
    // LED "ears" and the visor across the eyes
    for(const[px,py,c]of[[-6,-21,'#ff4fd8'],[3,-21.6,'#24e0ff']]){cel(x,PL(x,[px-2.6,py+2,px,py-3.4,px+2.6,py+2]),'#232838',.6);glow(x,px,py-.6,3,c,.8);dot(x,px,py-.4,.8,c)}
    cel(x,()=>{x.beginPath();x.moveTo(-5.6,-3.4);x.lineTo(12.2,-4.6);x.lineTo(12.6,1.8);x.lineTo(-5.4,2.6);x.closePath()},'#0a0d16',.8);
    glow(x,4,-1,8,'#24e0ff',.5);x.fillStyle='#5ff3ff';x.fillRect(-4,-1.6,15,1.1);x.fillStyle='rgba(255,79,216,.9)';x.fillRect(6,.4,2,.7);x.fillRect(9,.4,1.2,.7);hl(x,.5,.6,[-4.6,-3,11.6,-4])}}},
  // ---------- Bubblegum Dream Dress
  bubbledress:{legs:'#ffe0f0',ib:[-18,-6,36,44],
   torso:{bb:[-11,-1,22,19],f(x){const C='#ff9fd2';cel(x,()=>{x.beginPath();x.moveTo(-9.2,1);x.lineTo(9.2,1);x.quadraticCurveTo(6.6,8,7.4,16);x.lineTo(-7.4,16);x.quadraticCurveTo(-6.6,8,-9.2,1);x.closePath()},C,1);
    x.fillStyle='#fff8fc';x.strokeStyle=OL;x.lineWidth=.5;for(let i=0;i<7;i++){x.beginPath();x.arc(-7.2+i*2.4,1.6,1.6,0,Math.PI);x.fill();x.stroke()}
    for(const s of[-1,1])cel(x,()=>{x.beginPath();x.moveTo(0,5);x.bezierCurveTo(s*3.6,1.6,s*6.6,3.6,s*5.6,6.8);x.bezierCurveTo(s*4.6,8.6,s*1.6,7,0,5);x.closePath()},'#7ae8ff',.6);cel(x,E(x,0,5.2,1.5,1.4),'#bff6ff',.5);
    for(const yy of[9.2,12])bubble(x,0,yy,1.1);x.fillStyle='#c8a8ff';x.fillRect(-7.4,13.6,14.8,2.2);for(let i=-6;i<=6;i+=3)dot(x,i,14.7,.5,'#fff');hl(x,.6,.45,[-7.4,3.4,-6.4,12.4])}},
   shoulder:{bb:[-14,-4,28,12],f(x){for(const s of[-1,1]){cel(x,E(x,s*9.6,2.2,4.2,3.6),'#ffb3dc',.8);x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.ellipse(s*9.6-1.4,1,1.8,1,-.4,0,TAU);x.fill();line(x,'#7ae8ff',.6,[s*6.4,4.8,s*12.8,4.6])}}},
   skirt:{bb:[-16,-4,32,22],f(x){const sc=(w,y,c,n)=>{cel(x,()=>{x.beginPath();x.moveTo(-7,-3);x.lineTo(7,-3);x.lineTo(w,y);for(let i=0;i<=n;i++){const px=w-i*(w*2/n);x.quadraticCurveTo(px-w/n,y+3.2,px-w*2/n,y)}x.closePath()},c,.9)};
    sc(14.4,13,'#c8a8ff',6);sc(12.2,8.6,'#ff9fd2',5);x.fillStyle='#fff';for(const[px,py]of[[-8,4],[-3,6.4],[3,4.6],[8,6.6],[-5.6,10.4],[5,10.8],[0,9.4]])dot(x,px,py,.75,'#fff');
    line(x,'#7ae8ff',.7,[-12.2,8.4,12.2,8.4]);bubble(x,-11,15.6,1.4);bubble(x,10.6,16.2,1.1)}},
   back:{bb:[-22,-4,26,28],f(x){bubble(x,-12.6,6.4,7,.9);bubble(x,-9.4,16.6,5,.9);bubble(x,-17.4,15.2,2.6,.9)}}},
  // ---------- Celestial Starlight Robe
  seraphrobe:{legs:'#efe6d2',ib:[-22,-8,44,46],
   torso:{bb:[-11,-1,22,19],f(x){const W='#f8f4ec',G='#f2c14e';cel(x,torsoP(x),W,1);
    line(x,G,1.2,[-8.8,1.6,0,10.4,8.8,1.6]);x.save();torsoP(x)();x.clip();x.fillStyle='rgba(242,193,78,.85)';x.beginPath();x.moveTo(-9,10);x.lineTo(9,13);x.lineTo(9,15.2);x.lineTo(-9,12.2);x.closePath();x.fill();x.restore();
    glow(x,0,6.4,5,'#fff2b0',.7);star(x,0,6.4,3.4,1.4,8,0);x.fillStyle=G;x.fill();x.strokeStyle=OL;x.lineWidth=.45;x.stroke();dot(x,0,6.4,1.3,'#fffbe6');hl(x,.6,.5,[-7.6,3,-6.8,13])}},
   shoulder:{bb:[-15,-6,30,14],f(x){for(const s of[-1,1])for(let i=0;i<3;i++){x.save();x.translate(s*(7.6+i*1.6),1+i*1.4);x.rotate(s*(.5+i*.25));cel(x,E(x,0,0,2.2,4.4),i==2?'#ffe9a8':'#fffaf0',.5);x.restore()}}},
   skirt:{bb:[-14,-4,28,26],f(x){const W='#f8f4ec';cel(x,()=>{x.beginPath();x.moveTo(-8,-3);x.lineTo(8,-3);x.lineTo(12,19);x.lineTo(-12,19);x.closePath()},W,1);
    for(const px of[-6,-2,2.4,6.6])line(x,'rgba(160,140,110,.35)',.5,[px*.6,0,px,18]);x.fillStyle='#f2c14e';x.fillRect(-12,16.4,24,2.4);x.strokeStyle=OL;x.lineWidth=.6;x.strokeRect(-12,16.4,24,2.4);for(let i=-10;i<=10;i+=4)spark(x,i,17.6,.9,'#fffbe6')}},
   back:{bb:[-26,-10,40,36],f(x){for(let i=0;i<6;i++){x.save();x.translate(-6,3);x.rotate(-2.2+i*.24);const L=13+i*1.6;cel(x,E(x,L*.55,0,L*.55,2.6),i%2?'#fffaf0':'#f2ece0',.6);x.fillStyle='#ffd65a';x.beginPath();x.ellipse(L*1.02,0,1.6,1.3,0,0,TAU);x.fill();x.restore()}}}},
  // ---------- Inferno Dragon Plate
  dragonplate:{legs:'#2a1418',ib:[-24,-12,44,44],
   torso:{bb:[-11,-1,22,19],f(x){const C='#7a1a22',GD='#f2c14e';cel(x,torsoP(x),C,1);
    x.save();torsoP(x)();x.clip();x.strokeStyle='rgba(20,4,8,.5)';x.lineWidth=.6;for(let r=0;r<5;r++)for(let c=0;c<6;c++){x.beginPath();x.arc(-8.6+c*3.4+(r%2)*1.7,2+r*3.2,1.8,0,Math.PI);x.stroke()}x.restore();
    cel(x,()=>{x.beginPath();x.moveTo(-5.6,1.4);x.lineTo(5.6,1.4);x.lineTo(4.6,9.6);x.lineTo(0,12.4);x.lineTo(-4.6,9.6);x.closePath()},'#3a0c12',.8);line(x,GD,.8,[-5.6,1.6,-4.6,9.6,0,12.2,4.6,9.6,5.6,1.6]);
    glow(x,0,6,4.6,'#ff7a2a',.9);gem(x,0,6,2.2,'#ff8a3a');x.fillStyle='#2a0a0e';x.fillRect(-8.1,13.6,16.2,2.4);x.fillStyle=GD;x.fillRect(-1.4,13.4,2.8,2.8)}},
   shoulder:{bb:[-16,-8,32,16],f(x){for(const s of[-1,1]){cel(x,E(x,s*9.6,2,5,3.8),'#3a0c12',.8);line(x,'#f2c14e',.7,[s*5,4.6,s*14.4,4]);for(const[a,l]of[[0,6],[.5,4.6]]){x.save();x.translate(s*(9+a*6),-.6);cel(x,PL(x,[-1.4,1,s*.6,-l,1.4,1]),'#e8dcc4',.5);x.restore()}}}},
   skirt:{bb:[-11,-4,22,14],f(x){for(const[px,w]of[[-5.6,5.6],[0,5.8],[5.6,5.6]])cel(x,PL(x,[px-w/2,-2,px+w/2,-2,px+w/2*.9,8.6,px,10.2,px-w/2*.9,8.6]),'#5a141c',.7);for(const px of[-5.6,0,5.6])line(x,'#f2c14e',.5,[px-2.2,7.8,px,9.2,px+2.2,7.8])}},
   back:{bb:[-30,-14,34,34],f(x){x.save();x.translate(-5,2);const M='#4a0e16';x.beginPath();x.moveTo(0,0);x.lineTo(-10,-12);x.lineTo(-24,-10);x.quadraticCurveTo(-21,-3,-24,4);x.quadraticCurveTo(-17,3,-17,10);x.quadraticCurveTo(-11,7,-8,14);x.closePath();
    const gr=x.createLinearGradient(0,-12,-24,10);gr.addColorStop(0,'#8a1e28');gr.addColorStop(1,M);x.fillStyle=gr;x.fill();x.strokeStyle=OL;x.lineWidth=.9;x.stroke();for(const[a,b]of[[-24,-10],[-24,4],[-17,10],[-8,14]])line(x,'#2a0a0e',.9,[-10,-12,a,b]);line(x,'#2a0a0e',1.6,[0,0,-10,-12]);dot(x,-10,-12,1.2,'#e8dcc4');x.restore()}}},
  // ---------- Sakura Kitsune Kimono (three fox tails sway behind)
  kitsunekimono:{legs:'#f2ece6',ib:[-26,-22,46,52],
   torso:{bb:[-11,-1,22,19],f(x){const W='#fbf6f0',R='#d8333f';cel(x,torsoP(x),W,1);
    for(const s of[-1,1]){x.strokeStyle=R;x.lineWidth=2.2;x.beginPath();x.moveTo(s*5.4,1);x.lineTo(-s*2.6,11);x.stroke()}x.strokeStyle=OL;x.lineWidth=.5;x.beginPath();x.moveTo(6.6,1);x.lineTo(-1.6,11.4);x.stroke();
    x.fillStyle='#2a1a2e';x.fillRect(-8.3,10.4,16.6,4.2);x.strokeStyle=OL;x.lineWidth=.6;x.strokeRect(-8.3,10.4,16.6,4.2);line(x,'#f2c14e',.6,[-8,12.5,8,12.5]);dot(x,4.6,14.8,1.2,'#ffd24a');
    for(const[px,py]of[[-6,4],[6.2,6.6],[-4,8]]){x.save();x.translate(px,py);for(let i=0;i<5;i++){x.rotate(TAU/5);x.fillStyle='#ffb7cf';x.beginPath();x.ellipse(0,-1.1,.6,1,0,0,TAU);x.fill()}x.restore()}hl(x,.6,.45,[-7.6,3,-6.8,10])}},
   skirt:{bb:[-14,-4,28,22],f(x){cel(x,()=>{x.beginPath();x.moveTo(-8,-3);x.lineTo(8,-3);x.lineTo(12.4,15);x.lineTo(-12.4,15);x.closePath()},'#c82838',1);for(const px of[-7,-3.4,0,3.4,7])line(x,'rgba(60,8,16,.45)',.6,[px*.55,-1,px,14.6]);x.fillStyle='#fbf6f0';x.fillRect(-12.4,13.2,24.8,1.6)}},
   tail:{bb:[-34,-34,38,40],f(x){const O='#ff9a4a';for(const[a,l,w]of[[-2.4,28,7],[-1.95,30,7.6],[-1.5,26,6.6]]){x.save();x.rotate(a+Math.PI/2);
     const tl=()=>{x.beginPath();x.moveTo(-w*.4,0);x.bezierCurveTo(-w*1.3,-l*.35,-w*.9,-l*.8,0,-l);x.bezierCurveTo(w*1.1,-l*.8,w*1.2,-l*.35,w*.4,0);x.closePath()};cel(x,tl,O,.9);
     x.save();tl();x.clip();x.fillStyle='#fff6ee';x.beginPath();x.ellipse(0,-l,w*1.2,l*.3,0,0,TAU);x.fill();x.restore();tl();x.strokeStyle=OL;x.lineWidth=.9;x.stroke();hl(x,.7,.4,[-w*.6,-l*.2,-w*.6,-l*.6]);x.restore()}}}},
  // ---------- Frost Empress Gown (a frost mantle behind)
  frostgown:{legs:'#e6f4ff',ib:[-18,-6,36,46],
   torso:{bb:[-11,-1,22,19],f(x){const C='#cfeaff';cel(x,()=>{x.beginPath();x.moveTo(-9.2,1);x.lineTo(9.2,1);x.quadraticCurveTo(6.6,8,7.4,16);x.lineTo(-7.4,16);x.quadraticCurveTo(-6.6,8,-9.2,1);x.closePath()},C,1);
    line(x,'#ffffff',.9,[-8.6,1.8,8.6,1.8]);line(x,'#8ac8e8',.6,[-6.6,4,0,12.6,6.6,4]);x.save();x.translate(0,6.4);x.strokeStyle='#ffffff';x.lineWidth=.8;for(let i=0;i<3;i++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(-3,0);x.lineTo(3,0);x.stroke()}x.restore();gem(x,0,6.4,1.4,'#7ae8ff');
    x.fillStyle='#a8d8f0';x.fillRect(-7.4,13.8,14.8,2);hl(x,.6,.5,[-7.6,3.4,-6.6,12.4])}},
   shoulder:{bb:[-15,-8,30,14],f(x){for(const s of[-1,1])for(const[o,h]of[[0,6],[2.4,4.4],[-2.2,3.6]]){const px=s*(9+o),gr=x.createLinearGradient(px,-h,px,2);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#7ad0f0');x.beginPath();x.moveTo(px-1.4,2.6);x.lineTo(px,-h);x.lineTo(px+1.4,2.6);x.closePath();x.fillStyle=gr;x.fill();x.strokeStyle=OL;x.lineWidth=.5;x.stroke()}}},
   skirt:{bb:[-16,-4,32,26],f(x){x.beginPath();x.moveTo(-7.4,-3);x.lineTo(7.4,-3);x.lineTo(13.6,18);for(let i=0;i<=8;i++){const px=13.6-i*3.4;x.lineTo(px-1.7,18+(i%2?0:3.4))}x.lineTo(-13.6,18);x.closePath();const gr=x.createLinearGradient(0,-3,0,22);gr.addColorStop(0,'#cfeaff');gr.addColorStop(1,'#f4fbff');x.fillStyle=gr;x.fill();x.strokeStyle=OL;x.lineWidth=.9;x.stroke();
    for(const[px,py]of[[-6,5],[5,8],[-2,12],[8,14],[-9,13]]){x.save();x.translate(px,py);x.strokeStyle='rgba(120,190,230,.8)';x.lineWidth=.5;for(let i=0;i<3;i++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(-1.6,0);x.lineTo(1.6,0);x.stroke()}x.restore()}}},
   back:{bb:[-17,-3,26,38],f(x){x.save();x.globalAlpha=.78;x.beginPath();x.moveTo(-7.6,.6);x.bezierCurveTo(-13,8,-15,22,-14,34);x.lineTo(8,32);x.bezierCurveTo(8.6,20,8.4,10,7.6,.6);x.closePath();const gr=x.createLinearGradient(0,0,0,34);gr.addColorStop(0,'#bfe6ff');gr.addColorStop(1,'rgba(230,248,255,.6)');x.fillStyle=gr;x.fill();x.restore();x.strokeStyle=OL;x.lineWidth=.8;x.stroke();for(let i=0;i<4;i++)line(x,'rgba(255,255,255,.7)',.5,[-9+i*4.6,6,-11+i*5.6,32])}}},
  // ---------- Neon Cyber Jacket
  cyberjacket:{legs:'#1a1c26',ib:[-18,-6,32,28],
   torso:{bb:[-11,-3,22,21],f(x){const C='#1b1e2a';cel(x,torsoP(x),C,1);cel(x,PL(x,[-6.4,1,-2.4,-2.6,0,1.4,2.4,-2.6,6.4,1,0,4]),'#232838',.7);
    line(x,'#ff4fd8',.9,[0,4,0,15.6]);glow(x,0,9,5,'#ff4fd8',.35);for(const s of[-1,1])line(x,'#24e0ff',.6,[s*8.6,3,s*7.2,15.4]);
    cel(x,()=>{x.beginPath();x.rect(2.4,6,4.6,3.4)},'#0a0d16',.5);x.fillStyle='#5ff3ff';x.fillRect(3,7,1.6,.6);x.fillRect(3,8.2,3,.5);dot(x,6,7.2,.5,'#ff4fd8');x.fillStyle='#24e0ff';x.fillRect(-8,14.4,16,.7)}},
   shoulder:{bb:[-15,-5,30,12],f(x){for(const s of[-1,1]){cel(x,()=>{x.beginPath();x.moveTo(s*5,0);x.lineTo(s*12.4,.6);x.lineTo(s*12.8,4.6);x.lineTo(s*6,5);x.closePath()},'#262b3c',.7);line(x,'#24e0ff',.6,[s*6.4,2.6,s*12,2.8])}}},
   back:{bb:[-16,-2,14,22],f(x){cel(x,()=>{x.beginPath();x.rect(-14,2,8,13)},'#232838',.8);line(x,'#24e0ff',.7,[-12.6,4,-12.6,13]);line(x,'#ff4fd8',.6,[-8.4,5,-8.4,12]);dot(x,-10.4,15.6,.9,'#24e0ff')}}}
 });
 // ================= items: stats (WEAR, read by bonus() and the equip UI) =================
 const IT=[
  ['bubblehood','hat','Bubble Bunny Hood','#ffb3dc',5200,22,36,'Luck +15%, speed +8%, jump +8%, regenerate','Bubble Shield: float inside a shimmering bubble for 5s (untouchable, gentle healing)',{luck:.15,spd:.08,jump:.08,regen:1,light:60},'bubble'],
  ['bubbledress','body','Bubblegum Dream Dress','#ff9fd2',7800,26,42,'Damage taken -22%, +60 HP, damage +10%, gems +10%, regenerate','Bubble Burst: bubbles trap every monster nearby, then pop for big damage; heals 18%',{arm:.22,hp:60,dmg:.1,gem:.1,regen:2},'bubble'],
  ['seraphcrown','hat','Celestial Star Crown','#f2c14e',9000,30,40,'Crit +15%, damage +14%, XP +10%, light +120','Radiant Light: a pillar of light strikes monsters around you and heals you 20%',{crit:.15,dmg:.14,xp:.1,light:120},'seraph'],
  ['seraphrobe','body','Celestial Starlight Robe','#f8f4ec',12000,34,46,'Damage taken -28%, +80 HP, damage +15%, regenerate','Verdict: rays of light strike up to 8 monsters at once',{arm:.28,hp:80,dmg:.15,regen:2},'seraph'],
  ['dragonhelm','hat','Inferno Dragon Helm','#6a1a24',9500,32,40,'Damage +18%, crit +10%, crit damage +25%, damage taken -6%','Dragon Roar: a blast of fire burns and stuns monsters in front of you',{dmg:.18,crit:.1,cdmg:.25,arm:.06},'dragon'],
  ['dragonplate','body','Inferno Dragon Plate','#7a1a22',13000,38,48,'Damage taken -30%, damage +18%, +70 HP','Dragonfire Nova: a ring of fire burns every monster within 8 tiles',{arm:.3,dmg:.18,hp:70},'dragon'],
  ['kitsunemask','hat','Sakura Kitsune Mask','#ff9a4a',3600,18,32,'Crit +12%, speed +10%, luck +8%','Foxfire: five blue wisps seek out the nearest monsters',{crit:.12,spd:.1,luck:.08,light:40},'kitsune'],
  ['kitsunekimono','body','Sakura Kitsune Kimono','#fbf6f0',4400,20,36,'Damage taken -18%, speed +10%, damage +10%','Petal Step: dash through monsters in a storm of petals',{arm:.18,spd:.1,dmg:.1},'kitsune'],
  ['frostcrown','hat','Frost Empress Tiara','#bff2ff',3800,19,34,'XP +12%, cooldowns -10%, light +80','Glacial Gaze: monsters around you freeze for 3s',{xp:.12,cdr:.1,light:80},'frost'],
  ['frostgown','body','Frost Empress Gown','#cfeaff',4800,22,38,'Damage taken -20%, +50 HP, regenerate','Blizzard: a snowstorm around you slows and hurts monsters for 5s',{arm:.2,hp:50,regen:1},'frost'],
  ['cyberhood','hat','Neon Glitch Hood','#181b26',3200,16,26,'Cooldowns -12%, speed +8%, crit +8%','Glitch Step: blink up to 6 tiles ahead, untouchable for a moment',{cdr:.12,spd:.08,crit:.08,light:50},'cyber'],
  ['cyberjacket','body','Neon Cyber Jacket','#1b1e2a',4000,18,34,'Damage taken -16%, speed +12%, damage +8%','EMP Pulse: stuns every monster around you',{arm:.16,spd:.12,dmg:.08},'cyber']];
 const IDS=IT.map(i=>i[0]),SET={};
 for(const[id,s,n,c,cost,lv,cd,d,sd,b,set]of IT){WEAR[id]={s,n,c,cost,lv,cd,d,sd,b};SET[id]=set}
 // ================= auras =================
 // theme: colours, particle kind, halo kind. Sprites are built once per theme.
 const TH={
  bubble:{glow:'rgba(255,170,230,.5)',glow2:'rgba(140,230,255,.4)',pool:'rgba(255,190,240,',rim:'rgba(160,230,255,'},
  seraph:{glow:'rgba(255,236,160,.55)',glow2:'rgba(255,255,255,.35)',pool:'rgba(255,240,180,',rim:'rgba(255,220,120,'},
  dragon:{glow:'rgba(255,110,40,.55)',glow2:'rgba(255,200,80,.35)',pool:'rgba(255,90,30,',rim:'rgba(255,150,60,'},
  kitsune:{glow:'rgba(255,170,200,.45)',glow2:'rgba(110,170,255,.4)',pool:'rgba(255,180,210,',rim:'rgba(140,190,255,'},
  frost:{glow:'rgba(170,230,255,.5)',glow2:'rgba(255,255,255,.35)',pool:'rgba(190,240,255,',rim:'rgba(200,245,255,'},
  cyber:{glow:'rgba(40,220,255,.45)',glow2:'rgba(255,80,220,.35)',pool:'rgba(40,220,255,',rim:'rgba(255,80,220,'}};
 const SP={};const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const rad=(x,cx,cy,r,stops)=>{const gr=x.createRadialGradient(cx,cy,0,cx,cy,r);for(const s of stops)gr.addColorStop(s[0],s[1]);x.fillStyle=gr;x.fillRect(cx-r,cy-r,r*2,r*2)};
 function spr(th){if(SP[th])return SP[th];const q=TH[th],S={};
  S.glow=(()=>{const c=mk(96,96),x=c.getContext('2d');rad(x,48,48,48,[[0,q.glow],[.5,q.glow.replace(/[\d.]+\)$/,'.18)')],[1,'rgba(0,0,0,0)']]);return c})();
  S.glow2=(()=>{const c=mk(96,96),x=c.getContext('2d');rad(x,48,48,48,[[0,q.glow2],[1,'rgba(0,0,0,0)']]);return c})();
  S.pool=(()=>{const c=mk(192,56),x=c.getContext('2d');x.translate(96,28);x.scale(1,.29);rad(x,0,0,96,[[0,q.pool+'.55)'],[.7,q.pool+'.22)'],[1,q.pool+'0)']]);return c})();
  S.ring=(()=>{const c=mk(256,256),x=c.getContext('2d');for(const[w,a]of[[16,.08],[9,.16],[4.5,.35],[1.8,.9]]){x.strokeStyle=q.rim+a+')';x.lineWidth=w;x.beginPath();x.arc(128,128,92,0,TAU);x.stroke()}return c})();
  S.spark=(()=>{const c=mk(24,24),x=c.getContext('2d');rad(x,12,12,12,[[0,'rgba(255,255,255,1)'],[.3,q.glow.replace(/[\d.]+\)$/,'.9)')],[1,'rgba(0,0,0,0)']]);return c})();
  // the halo behind the head
  S.halo=(()=>{const c=mk(256,256),x=c.getContext('2d');x.translate(128,128);
   if(th=='bubble'){for(let i=0;i<14;i++){const a=i/14*TAU,r=12+(i%3)*5;bubble(x,Math.cos(a)*92,Math.sin(a)*92,r,.95)}}
   else if(th=='seraph'){rad(x,0,0,128,[[0,'rgba(255,250,220,.0)'],[.55,'rgba(255,240,180,.0)'],[.66,'rgba(255,230,150,.55)'],[.74,'rgba(255,220,120,.25)'],[1,'rgba(255,220,120,0)']]);for(let i=0;i<24;i++){x.rotate(TAU/24);x.fillStyle=i%2?'rgba(255,236,170,.5)':'rgba(255,250,220,.7)';x.beginPath();x.moveTo(-3,-90);x.lineTo(0,i%2?-118:-126);x.lineTo(3,-90);x.closePath();x.fill()}}
   else if(th=='dragon'){for(let i=0;i<18;i++){x.rotate(TAU/18);const gr=x.createLinearGradient(0,-80,0,-122);gr.addColorStop(0,'rgba(255,120,40,.8)');gr.addColorStop(1,'rgba(255,220,90,0)');x.fillStyle=gr;x.beginPath();x.moveTo(-9,-82);x.quadraticCurveTo(-4,-104,0,-124);x.quadraticCurveTo(4,-104,9,-82);x.closePath();x.fill()}}
   else if(th=='kitsune'){rad(x,0,0,128,[[0,'rgba(255,220,235,0)'],[.6,'rgba(255,200,225,.0)'],[.7,'rgba(255,190,220,.45)'],[.78,'rgba(255,190,220,.12)'],[1,'rgba(0,0,0,0)']]);for(let i=0;i<10;i++){x.rotate(TAU/10);x.fillStyle='rgba(255,183,207,.8)';for(let k=0;k<5;k++){x.save();x.translate(0,-92);x.rotate(k*TAU/5);x.beginPath();x.ellipse(0,-5,2.6,5,0,0,TAU);x.fill();x.restore()}}}
   else if(th=='frost'){for(let i=0;i<12;i++){x.rotate(TAU/12);const gr=x.createLinearGradient(0,-80,0,-120);gr.addColorStop(0,'rgba(200,245,255,.9)');gr.addColorStop(1,'rgba(255,255,255,.2)');x.fillStyle=gr;x.beginPath();x.moveTo(-5,-82);x.lineTo(0,i%2?-108:-122);x.lineTo(5,-82);x.closePath();x.fill()}}
   else{x.strokeStyle='rgba(40,220,255,.75)';x.lineWidth=3;x.beginPath();for(let i=0;i<=6;i++){const a=i/6*TAU+Math.PI/6;i?x.lineTo(Math.cos(a)*96,Math.sin(a)*96):x.moveTo(Math.cos(a)*96,Math.sin(a)*96)}x.stroke();x.strokeStyle='rgba(255,80,220,.6)';x.lineWidth=2;x.setLineDash([10,8]);x.beginPath();x.arc(0,0,80,0,TAU);x.stroke();x.setLineDash([])}
   return c})();
  // particles (several shapes per theme)
  S.p=[0,1,2].map(v=>{const c=mk(48,48),x=c.getContext('2d');x.translate(24,24);
   if(th=='bubble'){if(v<2)bubble(x,0,0,v?14:20);else heart(x,0,0,13,'#ff8ac8')}
   else if(th=='seraph'){if(v<2){x.rotate(v?.5:-.3);const gr=x.createLinearGradient(0,-20,0,20);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#ffe9b0');x.fillStyle=gr;x.beginPath();x.moveTo(0,-20);x.bezierCurveTo(9,-12,8,10,0,20);x.bezierCurveTo(-6,10,-7,-12,0,-20);x.fill();x.strokeStyle='rgba(200,160,80,.7)';x.lineWidth=1.2;x.beginPath();x.moveTo(0,-18);x.lineTo(0,20);x.stroke()}else{rad(x,0,0,20,[[0,'rgba(255,255,255,1)'],[.3,'rgba(255,240,180,.8)'],[1,'rgba(255,220,120,0)']])}}
   else if(th=='dragon'){const fl=()=>{x.beginPath();x.moveTo(0,22);x.bezierCurveTo(-12,14,-10,-2,-4,-10);x.bezierCurveTo(-2,-16,2,-18,0,-24);x.bezierCurveTo(8,-12,14,4,0,22);x.closePath()};fl();const gr=x.createLinearGradient(0,22,0,-24);gr.addColorStop(0,v==2?'rgba(255,240,180,.95)':'rgba(255,90,20,.9)');gr.addColorStop(.6,'rgba(255,170,50,.75)');gr.addColorStop(1,'rgba(255,230,120,0)');x.fillStyle=gr;x.fill()}
   else if(th=='kitsune'){if(v<2){x.rotate(v*1.3);x.fillStyle=v?'#ffd0e0':'#ffb7cf';x.beginPath();x.moveTo(0,-16);x.bezierCurveTo(10,-10,9,8,0,16);x.bezierCurveTo(-9,8,-10,-10,0,-16);x.fill();x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.ellipse(-2,-4,2.4,6,0,0,TAU);x.fill()}else{rad(x,0,0,22,[[0,'rgba(230,245,255,1)'],[.3,'rgba(120,180,255,.85)'],[1,'rgba(60,110,255,0)']])}}
   else if(th=='frost'){if(v<2){x.strokeStyle='rgba(235,250,255,.95)';x.lineWidth=v?2:2.6;for(let i=0;i<3;i++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(-16,0);x.lineTo(16,0);x.stroke();for(const s of[-1,1]){x.beginPath();x.moveTo(s*9,0);x.lineTo(s*13,-4);x.moveTo(s*9,0);x.lineTo(s*13,4);x.stroke()}}}else{const gr=x.createLinearGradient(0,-20,0,20);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#7ad0f0');x.fillStyle=gr;x.beginPath();x.moveTo(0,-22);x.lineTo(6,0);x.lineTo(0,22);x.lineTo(-6,0);x.closePath();x.fill()}}
   else{x.fillStyle=v==0?'rgba(40,230,255,.95)':v==1?'rgba(255,80,220,.95)':'rgba(255,255,255,.95)';x.fillRect(-7,-7,14,14);x.fillStyle='rgba(255,255,255,.6)';x.fillRect(-7,-7,14,3)}
   return c});
  return SP[th]=S}
 const h=i=>{const v=Math.sin(i*12.9898+4.1)*43758.5453;return v-Math.floor(v)};
 const qk=()=>{try{return Math.max(.35,Math.min(1.25,QM.cur.vfx*(QM.reduce?.45:1)))}catch(_){return 1}};
 // o: {cx, base (feet), rise, w (half spread), k (scale), hx, hy, hr (halo)}; lv 1 = one piece, 2 = the full set
 function paint(g,o,t,layer,th,lv){const s=spr(th),A=lv>1?1:.7,q=qk()*(lv>1?1:.65),k=o.k,{cx,base,rise,w}=o,PI=Math.PI;g.save();
  if(layer=='b'){
   g.globalAlpha=Math.min(1,.85*A);const pw=w*3*(1+.05*Math.sin(t*2.2));g.drawImage(s.pool,cx-pw/2,base-pw*.15,pw,pw*.3);
   g.globalCompositeOperation='lighter';for(let j=0;j<2;j++){const u=(t*.45+j*.5)%1,r=w*(.6+u*1.5);g.globalAlpha=(1-u)*(1-u)*.45*A;g.drawImage(s.ring,cx-r,base-r*.26,r*2,r*.52)}
   g.globalAlpha=(.6+.15*Math.sin(t*2.4))*A;g.drawImage(s.glow,cx-w*1.9,base-rise*.95,w*3.8,rise*1.05);
   if(th=='seraph'){g.globalAlpha=(.22+.1*Math.sin(t*1.6))*A;g.drawImage(s.glow2,cx-w*.9,base-rise*2.2,w*1.8,rise*2.3)}
   g.globalCompositeOperation='source-over';
   if(o.hr){const r=o.hr*(1+.04*Math.sin(t*1.8));g.save();g.translate(o.hx,o.hy);g.rotate(th=='cyber'?t*.5:th=='bubble'?t*.35:t*.22);g.globalAlpha=.8*A;g.drawImage(s.halo,-r,-r,r*2,r*2);g.globalCompositeOperation='lighter';g.globalAlpha=(.3+.2*Math.sin(t*3))*A;g.drawImage(s.ring,-r*.9,-r*.9,r*1.8,r*1.8);g.restore()}
   // particles behind the body
   const n=Math.round(16*q);for(let i=0;i<n;i++){const sp=.18+.16*h(i+7),u=(t*sp+h(i))%1,ph=h(i+3)*TAU;let x,y,z,a,rot=0,sp2=s.p[i%3];
    if(th=='seraph'||th=='frost'&&i%3<2){y=base-rise*1.05+u*rise*1.1;x=cx+Math.sin(u*4+ph+t*.6)*w*1.1+(h(i+5)-.5)*w;rot=Math.sin(t*1.5+i)*.8;z=k*(th=='frost'?10:13)*(.7+.5*h(i+9))}
    else if(th=='kitsune'){const a0=t*(.6+h(i)*.4)+ph;x=cx+Math.cos(a0)*w*(1.1+.3*h(i+2));y=base-rise*(.2+.7*u);rot=a0*2;z=k*(i%3==2?14:10)*(.8+.4*h(i+4))}
    else{y=base-u*rise*.95;x=cx+Math.sin(u*5+ph+t*.7)*w*(.6+u*.35)+(h(i+3)-.5)*w*.5;z=k*(th=='bubble'?(8+u*9):th=='cyber'?(4+4*h(i+8)):(14+u*16))*(.8+.4*h(i+5));if(th=='cyber')x=cx+Math.round(((h(i+3)-.5)*2*w*1.1)/3)*3}
    a=Math.sin(u*PI)*A;if(th=='bubble'&&u>.9){a*=1-(u-.9)*10}
    if(th=='dragon'||th=='cyber'||i%3==2&&(th=='kitsune'||th=='seraph'))g.globalCompositeOperation='lighter';g.globalAlpha=a*(th=='dragon'?.85:1);
    if(rot){g.save();g.translate(x,y);g.rotate(rot);g.drawImage(sp2,-z/2,-z/2,z,z);g.restore()}else g.drawImage(sp2,x-z/2,y-z/2,z,z);g.globalCompositeOperation='source-over'}}
  else{
   g.globalCompositeOperation='lighter';const ne=Math.round(16*q);for(let i=0;i<ne;i++){const sp=.3+.3*h(i+11),u=(t*sp+h(i+13))%1,y=base-u*rise*1.05,x=cx+(h(i+17)-.5)*2*w*.95+Math.sin(u*9+i)*w*.18,z=k*(3.5+3.5*h(i+19))*(1-u*.4);g.globalAlpha=Math.sin(u*PI)*A;g.drawImage(s.spark,x-z/2,y-z/2,z,z)}
   g.globalCompositeOperation='source-over';
   // front particles: a few bubbles pop / petals / pixels pass in front of the body
   for(let i=0;i<4;i++){const u=(t*.24+h(i+31))%1,y=base-u*rise*.7,x=cx+Math.sin(u*5+i*1.7+t*.6)*w*.9,z=k*(th=='bubble'?9+u*7:th=='cyber'?5:11);g.globalAlpha=Math.sin(u*PI)*.8*A;if(th=='dragon'||th=='cyber')g.globalCompositeOperation='lighter';g.drawImage(s.p[i%2],x-z/2,y-z/2,z,z);g.globalCompositeOperation='source-over'}
   if(th=='bubble'){for(let i=0;i<3;i++){const u=(t*.5+h(i+41))%1;if(u<.82)continue;const p=(u-.82)/.18,x=cx+(h(i+43)-.5)*w*2,y=base-rise*(.3+.5*h(i+45));g.globalAlpha=(1-p)*A;g.globalCompositeOperation='lighter';for(let j=0;j<6;j++){const a=j/6*TAU;g.drawImage(s.spark,x+Math.cos(a)*p*k*10-3*k,y+Math.sin(a)*p*k*10-3*k,6*k,6*k)}g.globalCompositeOperation='source-over'}}}
  g.restore()}
 // which aura a wearer shows: the body piece's set first, else the hat's; the full set doubles its strength
 function pick(wr){if(!wr)return null;const sb=SET[wr.body],sh2=SET[wr.hat];const th=sb||sh2;if(!th)return null;return{th,lv:(sb==th?1:0)+(sh2==th?1:0)}}
 // in-game: wrap the character renderer (world, store try-on, hub previews). Feet are at cy+54, the head near cy-8.
 const st={bub:0,bliz:0,blzT:0};
 const _ad=AC6.draw;AC6.draw=function(cx,cy,f,hue,name,t,vx,air,bubT,wpn,sw,fm,wr,dsh,lk,q){const a=pick(wr),me=q==='me';if(!a&&!(me&&st.bub>0))return _ad.apply(this,arguments);
  const o={cx,base:cy+56,rise:78,w:18,k:1,hx:cx-f*1.5,hy:cy+3,hr:27};if(air)o.base-=4;
  if(a)try{paint(g,o,t,'b',a.th,a.lv)}catch(_){}
  _ad.apply(this,arguments);
  if(a)try{paint(g,o,t,'f',a.th,a.lv)}catch(_){}
  // Bubble Shield: a big iridescent bubble around you while it lasts
  if(me&&st.bub>0)try{const r=40+Math.sin(t*3)*2,y=cy+22;g.save();g.globalAlpha=Math.min(1,st.bub*2)*.9;bubble(g,cx,y,r,.55);g.globalCompositeOperation='lighter';g.globalAlpha=.25+.1*Math.sin(t*5);g.strokeStyle='#bff6ff';g.lineWidth=2;g.beginPath();g.arc(cx,y,r-3,-.6+t,.9+t);g.stroke();g.restore()}catch(_){}};
 // the large portrait (SHOWART) gets the same aura, scaled up (its hooks are defined later, in 89-z-gearart.js)
 setTimeout(()=>{try{const X=SHOWART.EXT;const _b=X.back;X.back=function(g,G,t){const a=pick(G);if(a)try{paint(g,{cx:310,base:905,rise:840,w:250,k:7.5,hx:310,hy:250,hr:250},t,'b',a.th,a.lv)}catch(_){}if(_b)return _b.apply(this,arguments)}}catch(_){}},0);
 // ================= icons (same parts, fitted, on the set's glow) =================
 function torsoBase(x,c){cel(x,PL(x,[-9.5,1,9.5,1,8,16,-8,16]),c,1.1)}
 function sleeve(x,c,s){x.lineCap='round';x.strokeStyle=OL;x.lineWidth=6.8;x.beginPath();x.moveTo(s*7.6,3.2);x.lineTo(s*11,11.6);x.stroke();x.strokeStyle=s<0?sh(c,-.15):c;x.lineWidth=4.6;x.stroke()}
 function icon(x,id,S){const d=D[id],w=WEAR[id];if(!d||!w)return false;x.save();x.lineJoin='round';x.lineCap='round';
  const s=spr(SET[id]);x.save();x.globalAlpha=.9;x.drawImage(s.halo,S*.04,S*.04,S*.92,S*.92);x.globalCompositeOperation='lighter';x.globalAlpha=.75;x.drawImage(s.glow,S*.08,S*.08,S*.84,S*.84);for(let i=0;i<6;i++)x.drawImage(s.spark,S*(.14+((i*.37)%1)*.72),S*(.12+((i*.61)%1)*.74),S*.07,S*.07);x.restore();
  const fit=(bb,f)=>{const k=Math.min(S*.8/bb[2],S*.8/bb[3]);x.translate(S/2,S/2+S*.02);x.scale(k,k);x.translate(-(bb[0]+bb[2]/2),-(bb[1]+bb[3]/2));f()};
  if(w.s=='hat')fit(d.ib,()=>{if(d.hatB)d.hatB.f(x);d.hatF.f(x)});
  else{const c=w.c;fit(d.ib,()=>{if(d.tail){x.save();x.translate(-7.5,17.5);d.tail.f(x);x.restore()}if(d.back)d.back.f(x);sleeve(x,c,-1);if(d.skirt){x.save();x.translate(0,16);d.skirt.f(x);x.restore()}torsoBase(x,c);d.torso.f(x);sleeve(x,c,1);if(d.shoulder)d.shoulder.f(x)})}
  x.restore();return true}
 const _icon=GEAR7.icon;GEAR7.icon=function(x,id,S){if(SET[id])return icon(x,id,S);return _icon.apply(this,arguments)};
 // ================= skills (the base useSkill handles cooldown, ring and burst; these add the effect) =================
 const near=r=>{const o=[];try{for(const m of mobs)if(!m.dead&&m.hp>0&&Math.hypot(m.x-P.x,m.y-P.y)<T*r)o.push(m)}catch(_){}return o};
 const V=(k,c,x,y,vx,vy,l,s0,s1,o)=>{try{VFX.add(k,c,x,y,vx,vy,l,s0,s1,o)}catch(_){}};
 const fx=f=>{try{f()}catch(_){}};
 const SK={
  bubblehood(){st.bub=5;brace=Math.max(brace,5);fx(()=>{VFX.burst(P.x,P.y+30,['#ffb3dc','#bff6ff','#ffffff'],24,200,1,.9,12);VFX.wave(P.x,P.y+30,'#ff9ad8',90,.5,.4);snd(880,.25,'sine',.04,1.6);snd(1320,.2,'sine',.03,1.4)})},
  bubbledress(){const d=Math.round(45+lvl*2.8),L=near(8);for(const m of L){m.stun=Math.max(m.stun||0,1.6);m.vx=0;m.vy=Math.min(m.vy||0,-60)}
   fx(()=>{for(let i=0;i<30;i++){const a=i/30*TAU;V(1,i%2?'#ffb3dc':'#bff6ff',P.x,P.y+30,Math.cos(a)*220,Math.sin(a)*160,.8,10,4,{d:1.6})}VFX.wave(P.x,P.y+30,'#ff9ad8',T*8,.7,.32);snd(660,.3,'sine',.05,1.8)});
   setTimeout(()=>{for(const m of L)if(!m.dead&&m.hp>0)fx(()=>{hurtMob(m,d,null,Math.atan2(m.y-P.y,m.x-P.x));VFX.burst(m.x,m.y+m.h/2,['#ffffff','#ffb3dc','#bff6ff'],14,240,1,.6,10)});fx(()=>snd(1200,.15,'triangle',.05,.6))},650);
   P.hp=Math.min(maxHP(),P.hp+maxHP()*.18);ft(P.x,P.y-20,'+'+Math.round(maxHP()*.18),'#ff9ad8')},
  seraphcrown(){const d=Math.round(50+lvl*2.6);for(const m of near(7))hurtMob(m,d,null,Math.atan2(m.y-P.y,m.x-P.x));P.hp=Math.min(maxHP(),P.hp+maxHP()*.2);ft(P.x,P.y-20,'+'+Math.round(maxHP()*.2),'#ffe27a');
   fx(()=>{VFX.wave(P.x,P.y+30,'#ffe27a',T*7,.7,.35);VFX.levelUp(P.x,P.y,'#fff2b0');for(let i=0;i<24;i++)V(1,'#fff6c0',P.x+(Math.random()-.5)*60,P.y+40,0,-300-Math.random()*300,.8,8,2,{d:1.5});snd(523,.5,'triangle',.05,1.2);snd(784,.6,'sine',.04,1.2)})},
  seraphrobe(){const d=Math.round(70+lvl*3),L=near(10).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y)).slice(0,8);
   L.forEach((m,i)=>setTimeout(()=>{if(m.dead||m.hp<=0)return;fx(()=>{hurtMob(m,d,null,-Math.PI/2);VFX.burst(m.x,m.y+m.h/2,['#ffffff','#ffe27a'],16,260,1,.6,10);for(let j=0;j<10;j++)V(1,'#fff6c0',m.x,m.y-200+j*20,0,600,.3,6,2,{d:2});snd(900+i*60,.18,'triangle',.04,.8)})},i*90));
   fx(()=>VFX.wave(P.x,P.y+30,'#fff2b0',T*10,.6,.3))},
  dragonhelm(){const d=Math.round(40+lvl*2.4),f=P.f||1;for(const m of near(6))if(Math.sign(m.x-P.x)==f||Math.abs(m.x-P.x)<T){hurtMob(m,d,null,f>0?0:Math.PI);m.burn=Math.max(m.burn||0,4);m.stun=Math.max(m.stun||0,1.2)}
   fx(()=>{for(let i=0;i<34;i++){const a=(Math.random()-.5)*.7+(f>0?0:Math.PI),v=300+Math.random()*320;V(1,i%2?'#ff7a2a':'#ffd24a',P.x+f*20,P.y+24,Math.cos(a)*v,Math.sin(a)*v,.6,10,3,{d:1.4})}shake=Math.max(shake,.18);snd(90,.6,'sawtooth',.07,.4)})},
  dragonplate(){const d=Math.round(75+lvl*3.2);for(const m of near(8)){hurtMob(m,d,null,Math.atan2(m.y-P.y,m.x-P.x));m.burn=Math.max(m.burn||0,5)}shake=Math.max(shake,.26);
   fx(()=>{for(const[r,l,c]of[[T*8,.8,'#ff5a1a'],[T*5,.6,'#ffb040'],[T*2.5,.45,'#fff0a0']])VFX.wave(P.x,P.y+30,c,r,l,.34);for(let i=0;i<36;i++){const a=i/36*TAU;V(1,'#ff8a2a',P.x,P.y+30,Math.cos(a)*380,Math.sin(a)*240,.7,12,3,{d:1.5})}snd(70,.8,'sawtooth',.07,.3)})},
  kitsunemask(){const d=Math.round(30+lvl*2),L=near(9).slice(0,5);L.forEach((m,i)=>setTimeout(()=>{if(m.dead||m.hp<=0)return;fx(()=>{hurtMob(m,d,null,Math.atan2(m.y-P.y,m.x-P.x));VFX.burst(m.x,m.y+m.h/2,['#bfe0ff','#5a9aff','#ffffff'],14,220,1,.6,10);snd(1100,.15,'sine',.04,1.2)})},140+i*120));
   fx(()=>{for(let i=0;i<5;i++){const a=i/5*TAU;V(1,'#7ab0ff',P.x+Math.cos(a)*30,P.y+20+Math.sin(a)*20,Math.cos(a)*60,-80,.9,10,4,{d:1.2})}})},
  kitsunekimono(){dash=.26;dashDir=P.f||1;brace=Math.max(brace,.45);for(const m of near(4))if(Math.sign(m.x-P.x)==dashDir||Math.abs(m.x-P.x)<T)hurtMob(m,Math.round(35+lvl*2.2),null,dashDir>0?0:Math.PI);
   fx(()=>{for(let i=0;i<26;i++)V(1,i%2?'#ffb7cf':'#ffd6e4',P.x-dashDir*i*8,P.y+20+(Math.random()-.5)*40,-dashDir*60,(Math.random()-.5)*80,.9,6,3,{d:1});snd(700,.2,'triangle',.04,1.4)})},
  frostcrown(){for(const m of near(6)){m.stun=Math.max(m.stun||0,3);m.slow=5;hurtMob(m,Math.round(20+lvl),null,Math.atan2(m.y-P.y,m.x-P.x))}fx(()=>{VFX.wave(P.x,P.y+30,'#bff6ff',T*6,.6,.35);VFX.burst(P.x,P.y+30,['#ffffff','#bff6ff','#7ad0f0'],26,260,1,.8,10);snd(1500,.4,'sine',.04,.6)})},
  frostgown(){st.bliz=5;st.blzT=0;fx(()=>{VFX.wave(P.x,P.y+30,'#e6f8ff',T*7,.8,.3);snd(300,.8,'triangle',.03,.4)})},
  cyberhood(){const f=P.f||1;let best=0;for(let d=1;d<=6;d++){const tx=Math.floor((P.x+f*d*T)/T),ty=Math.floor((P.y+P.h-6)/T),ty2=Math.floor((P.y+8)/T);if(solidAt(tx,ty)||solidAt(tx,ty2))break;best=d}
   if(best){fx(()=>VFX.burst(P.x,P.y+30,['#24e0ff','#ff4fd8','#ffffff'],18,220,1,.5,8));P.x+=f*best*T;brace=Math.max(brace,.6);fx(()=>{VFX.burst(P.x,P.y+30,['#24e0ff','#ff4fd8'],18,220,1,.5,8);snd(1800,.12,'square',.03,.5);snd(400,.12,'square',.03,1.5)})}},
  cyberjacket(){const d=Math.round(30+lvl*1.8);for(const m of near(7)){m.stun=Math.max(m.stun||0,2.2);hurtMob(m,d,null,Math.atan2(m.y-P.y,m.x-P.x))}fx(()=>{VFX.wave(P.x,P.y+30,'#24e0ff',T*7,.5,.4);VFX.wave(P.x,P.y+30,'#ff4fd8',T*5,.45,.3);snd(120,.4,'square',.05,.5)})}};
 {const _us=useSkill;useSkill=function(slot){const id=wear[slot];if(SK[id]&&!(cdT[slot]>0)&&!showInv&&!dlgOpen){_us.apply(this,arguments);try{SK[id]()}catch(e){console.error('GEAR10 skill',e)}return}return _us.apply(this,arguments)}}
 // timers: the bubble floats you (falling capped) and heals gently; the blizzard slows and hurts monsters around you
 {const _p=physics;physics=function(dt){const r=_p.apply(this,arguments);try{
  if(st.bub>0){st.bub-=dt;if(!P.g&&P.vy>0)P.vy=Math.min(P.vy,140);if(P.hp>0)P.hp=Math.min(maxHP(),P.hp+maxHP()*.03*dt)}
  if(st.bliz>0){st.bliz-=dt;st.blzT-=dt;if(st.blzT<=0){st.blzT=.5;const d=Math.round(8+lvl*.6);for(const m of near(7)){m.slow=Math.max(m.slow||0,1);hurtMob(m,d,null,Math.atan2(m.y-P.y,m.x-P.x))}try{for(let i=0;i<14;i++)V(1,'#ffffff',P.x+(Math.random()-.5)*T*12,P.y-T*2,-40+Math.random()*80,160+Math.random()*120,1.2,4,2,{d:.5})}catch(_){}}}}catch(_){}return r}}
 return{IDS,SET,SK,st,paint,pick,spr,icon,TH}})();
