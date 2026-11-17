// ===== MATS10: the colour and material collection (world building). Loads after the block art (BART9) so its sprites win for its own ids.
//  - Paintable materials: one tile id each would use up the ids the server accepts (only 115-149 are free), so a material is ONE tile and the colour
//    rides with each placed block (TVAR, carried in the edit array a[2]; see pushEdit/applyEdit). Tile 115 is six materials x 51 colours
//    (variant = material*64 + colour): Plaster, Glazed Tile, Woven Fabric, Polished Stone, Fired Brick, Stained Planks. Tile 116 is Tinted Glass and
//    117 a Glow Block, each in the 51 colours. In the bag a material is one item (keys 900-907); the colour is chosen while placing (the colour strip
//    above the hotbar, or , and . to step), and remembered per material.
//  - 19 fixed materials (tiles 120-138, keys 920-938): woods, marble, granite, parquet, gilded filigree, brushed steel, ice, snow, celestial tile,
//    tide glass, moss cobble, terracotta, crystal lattice, garden path, flower turf, moonstone bricks, blossom shingles.
//  - Every sprite is painted once (2x supersampled, then filtered down) and cached; the animated ones (glow, celestial, tide glass, crystal lattice)
//    get a light per-frame overlay only while on screen.
//  The palette has 17 families x 3 shades: whites, blacks, greys, reds, oranges, yellows, greens, mints, blues, cyans, purples, pinks, browns,
//  creams, pastels, neons and deep darks. =====
const MATS10=(()=>{
 const Q=2,TAU=Math.PI*2;
 const PAL=[
  ['Snow','#f7f5ef','White'],['Ivory','#efe6cf','White'],['Pearl','#e2dfea','White'],
  ['Graphite','#55545e','Black'],['Charcoal','#3a3a44','Black'],['Ink','#1f1e28','Black'],
  ['Silver','#bcbfc9','Grey'],['Stone Grey','#8b8e98','Grey'],['Slate','#646a78','Grey'],
  ['Scarlet','#e0483e','Red'],['Crimson','#b32a3a','Red'],['Wine','#6e1f2e','Red'],
  ['Tangerine','#f07d34','Orange'],['Amber','#f0a23a','Orange'],['Rust','#b4572a','Orange'],
  ['Lemon','#f5dc5a','Yellow'],['Gold','#d9ac3b','Yellow'],['Butter','#f6e7a0','Yellow'],
  ['Leaf','#5cae4a','Green'],['Emerald','#2f9e6a','Green'],['Forest','#2c5a3c','Green'],
  ['Mint','#9fe0c0','Mint'],['Pistachio','#c8e6a0','Mint'],['Sage','#a9c49a','Mint'],
  ['Sky','#7ab4ee','Blue'],['Ocean','#2f6fc0','Blue'],['Navy','#22325e','Blue'],
  ['Aqua','#8fe6e8','Cyan'],['Turquoise','#36c3c0','Cyan'],['Teal','#1f7f86','Cyan'],
  ['Lavender','#b9a2ee','Purple'],['Violet','#7a4fd0','Purple'],['Plum','#5a2f6e','Purple'],
  ['Blush','#f6c4cf','Pink'],['Rose','#e8899f','Pink'],['Fuchsia','#d94d9a','Pink'],
  ['Tan','#c49a6c','Brown'],['Chestnut','#8e5a35','Brown'],['Walnut','#6a442a','Brown'],
  ['Cream','#f2e6c8','Cream'],['Beige','#dccbaa','Cream'],['Sandstone','#cdb88f','Cream'],
  ['Peach','#f8c6a8','Pastel'],['Lilac','#d8c6f2','Pastel'],['Powder Blue','#c4dcf4','Pastel'],
  ['Neon Pink','#ff4fd0','Neon'],['Neon Lime','#b6ff3a','Neon'],['Neon Cyan','#3af2ff','Neon'],
  ['Midnight','#141a33','Deep'],['Deep Moss','#18301f','Deep'],['Oxblood','#3a0f17','Deep']];
 const NC=PAL.length;
 // ---- colour helpers
 const h2r=c=>{const n=parseInt(c.slice(1),16);return[n>>16&255,n>>8&255,n&255]};
 const r2h=(r,g,b)=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
 const tn=(c,f)=>{const[r,g,b]=h2r(c);return f<=1?r2h(r*f,g*f,b*f):r2h(r+(255-r)*(f-1),g+(255-g)*(f-1),b+(255-b)*(f-1))};
 const mixc=(a,b,t)=>{const A=h2r(a),B=h2r(b);return r2h(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t)};
 const ra=(c,a)=>{const[r,g,b]=h2r(c);return'rgba('+r+','+g+','+b+','+a+')'};
 const lum=c=>{const[r,g,b]=h2r(c);return(r*.3+g*.59+b*.11)/255};
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const lin=(x,x0,y0,x1,y1,st)=>{const g=x.createLinearGradient(x0,y0,x1,y1);st.forEach((c,i)=>g.addColorStop(i/(st.length-1),c));return g};
 const rrect=(x,a,b,w,h,r)=>{x.beginPath();if(x.roundRect)x.roundRect(a,b,w,h,r);else x.rect(a,b,w,h)};
 const speck=(x,R,n,c,a,s0,s1)=>{x.fillStyle=c;for(let i=0;i<n;i++){x.globalAlpha=a*(.35+R()*.65);const s=s0+R()*(s1-s0);x.beginPath();x.arc(R()*T,R()*T,s,0,TAU);x.fill()}x.globalAlpha=1};
 const blot=(x,cx,cy,r,c,a)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,ra(c,a));g.addColorStop(1,ra(c,0));x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2)};
 // a soft bevel: light top/left, shade bottom/right (every solid material shares it, so they sit together)
 function bevel(x,a){a=a==null?1:a;x.fillStyle='rgba(255,255,255,'+(.22*a)+')';x.fillRect(0,0,T,1.6);x.fillRect(0,0,1.6,T);x.fillStyle='rgba(20,12,30,'+(.24*a)+')';x.fillRect(0,T-2,T,2);x.fillRect(T-2,0,2,T)}
 // ---- 2x scratch, filtered down into a fresh T x T canvas
 let scr=null;function paint(fn){if(!scr){scr=document.createElement('canvas');scr.width=scr.height=T*Q}const x=scr.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,T*Q,T*Q);x.setTransform(Q,0,0,Q,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';
  try{fn(x)}catch(e){console.error('MATS10 paint',e)}const c=document.createElement('canvas');c.width=c.height=T;const y=c.getContext('2d');y.imageSmoothingEnabled=true;try{y.imageSmoothingQuality='high'}catch(_){}y.drawImage(scr,0,0,T,T);return c}
 // ---- the six paintable materials (tile 115)
 const PM=[
  {n:'Plaster',d:'Smooth hand-trowelled plaster with a soft matte finish.',cat:'stone',p:3,lv:1,f(x,c,R){x.fillStyle=lin(x,0,0,0,T,[tn(c,1.05),c,tn(c,.95)]);x.fillRect(0,0,T,T);
    for(let i=0;i<6;i++){x.strokeStyle=ra(R()<.5?tn(c,1.18):tn(c,.86),.22);x.lineWidth=3+R()*4;x.beginPath();const y=R()*T,a=R()*T;x.arc(a,y+20,22+R()*14,-2.6,-.6);x.stroke()}speck(x,R,26,tn(c,.75),.16,.4,.9);speck(x,R,14,tn(c,1.3),.18,.4,.8);bevel(x,.8)}},
  {n:'Glazed Tile',d:'Four glossy glazed tiles set in fine grout.',cat:'stone',p:4,lv:2,f(x,c,R){const gr=lum(c)>.5?tn(c,.62):tn(c,1.55);x.fillStyle=gr;x.fillRect(0,0,T,T);const s=T/2;
    for(let i=0;i<2;i++)for(let j=0;j<2;j++){const t=tn(c,.94+R()*.12),a=i*s+1.2,b=j*s+1.2,w=s-2.4;x.fillStyle=lin(x,a,b,a+w,b+w,[tn(t,1.12),t,tn(t,.86)]);rrect(x,a,b,w,w,2.2);x.fill();
     x.save();rrect(x,a,b,w,w,2.2);x.clip();x.fillStyle='rgba(255,255,255,.28)';x.beginPath();x.ellipse(a+w*.3,b+w*.26,w*.32,w*.12,-.6,0,TAU);x.fill();x.fillStyle='rgba(255,255,255,.1)';x.fillRect(a,b+w*.62,w,1.2);x.restore()}}},
  {n:'Woven Fabric',d:'A soft quilted cushion of woven cloth, stitched at the edges.',cat:'soft',p:3,lv:1,f(x,c,R){x.fillStyle=c;x.fillRect(0,0,T,T);
    for(let y=0;y<T;y+=3){x.fillStyle=ra(y%6?tn(c,1.12):tn(c,.9),.5);x.fillRect(0,y,T,1.2)}for(let X=0;X<T;X+=3){x.fillStyle=ra(X%6?tn(c,.92):tn(c,1.08),.35);x.fillRect(X,0,1.1,T)}
    const g=x.createRadialGradient(T*.42,T*.38,2,T/2,T/2,T*.72);g.addColorStop(0,'rgba(255,255,255,.2)');g.addColorStop(.6,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(10,5,20,.32)');x.fillStyle=g;x.fillRect(0,0,T,T);
    x.strokeStyle=ra(tn(c,1.35),.75);x.lineWidth=1;x.setLineDash([2.2,2]);rrect(x,4,4,T-8,T-8,5);x.stroke();x.setLineDash([])}},
  {n:'Polished Stone',d:'Cut and polished stone with fine veins and a quiet shine.',cat:'stone',p:5,lv:3,f(x,c,R){x.fillStyle=lin(x,0,0,T,T,[tn(c,1.1),c,tn(c,.88)]);x.fillRect(0,0,T,T);
    for(let i=0;i<3;i++){x.strokeStyle=ra(i==1?tn(c,1.4):tn(c,.66),.45);x.lineWidth=.7+R()*.9;x.beginPath();let px=-2,py=R()*T;x.moveTo(px,py);for(let k=0;k<5;k++){px+=10+R()*6;py+=(R()-.5)*14;x.quadraticCurveTo(px-5,py+(R()-.5)*8,px,py)}x.stroke()}
    x.fillStyle=lin(x,0,0,T,T,['rgba(255,255,255,0)','rgba(255,255,255,0)','rgba(255,255,255,.16)','rgba(255,255,255,0)','rgba(255,255,255,0)']);x.fillRect(0,0,T,T);speck(x,R,6,'#ffffff',.5,.3,.6);bevel(x)}},
  {n:'Fired Brick',d:'Kiln-fired bricks in a running bond with pale mortar.',cat:'stone',p:4,lv:1,f(x,c,R){const mo=mixc(tn(c,1.45),'#d8d0c4',.5);x.fillStyle=mo;x.fillRect(0,0,T,T);const rh=12,bw=24;
    for(let r=0;r*rh<T;r++)for(let k=-1;k*bw<T+bw;k++){const px=k*bw+(r%2?bw/2:0),py=r*rh,t=tn(c,.88+R()*.24);x.fillStyle=lin(x,0,py,0,py+rh,[tn(t,1.14),t,tn(t,.8)]);rrect(x,px+1.4,py+1.4,bw-2.8,rh-2.8,2);x.fill();x.fillStyle='rgba(255,255,255,.14)';x.fillRect(px+2.6,py+2,bw-5.2,1.2)}
    speck(x,R,14,tn(c,.55),.3,.5,1.1)}},
  {n:'Stained Planks',d:'Smooth planks stained in your colour; the grain still shows.',cat:'wood',p:3,lv:1,f(x,c,R){const ph=12;for(let r=0;r<4;r++){const y=r*ph,t=tn(c,.9+R()*.18);x.fillStyle=lin(x,0,y,0,y+ph,[tn(t,1.12),t,tn(t,.86)]);x.fillRect(0,y,T,ph);
     x.strokeStyle=ra(tn(c,.7),.35);x.lineWidth=.7;for(let g=0;g<3;g++){x.beginPath();const gy=y+2.5+g*3.2+R();x.moveTo(0,gy);for(let X=0;X<=T;X+=8)x.lineTo(X,gy+Math.sin(X*.2+R()*2)*.8);x.stroke()}
     x.fillStyle='rgba(20,10,5,.35)';x.fillRect(0,y+ph-1.2,T,1.2);const j=(r%2?T*.62:T*.28)+R()*4;x.fillRect(j,y,1.2,ph);x.fillStyle='rgba(30,20,10,.45)';x.beginPath();x.arc(j-3,y+ph/2,.9,0,TAU);x.arc(j+4,y+ph/2,.9,0,TAU);x.fill()}bevel(x,.6)}}];
 // ---- glass and glow (tiles 116, 117)
 function glass(x,c,R){x.fillStyle=ra(c,.32);x.fillRect(0,0,T,T);x.fillStyle=lin(x,0,0,T,T,[ra(tn(c,1.3),.35),ra(c,.05),ra(tn(c,.7),.3)]);x.fillRect(0,0,T,T);
  x.strokeStyle=ra(tn(c,.75),.85);x.lineWidth=2;x.strokeRect(1,1,T-2,T-2);x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=1;x.strokeRect(2.5,2.5,T-5,T-5);
  x.fillStyle='rgba(255,255,255,.4)';x.beginPath();x.moveTo(8,T-10);x.lineTo(T-14,6);x.lineTo(T-9,6);x.lineTo(13,T-10);x.closePath();x.fill();x.fillStyle='rgba(255,255,255,.22)';x.beginPath();x.moveTo(18,T-8);x.lineTo(T-6,14);x.lineTo(T-5,17);x.lineTo(20,T-8);x.closePath();x.fill()}
 function glow(x,c,R){x.fillStyle=tn(c,.32);x.fillRect(0,0,T,T);x.fillStyle=tn(c,.5);rrect(x,2,2,T-4,T-4,5);x.fill();const g=x.createRadialGradient(T/2,T/2,1,T/2,T/2,T*.5);g.addColorStop(0,'#ffffff');g.addColorStop(.35,tn(c,1.4));g.addColorStop(1,tn(c,.75));
  x.fillStyle=g;rrect(x,5,5,T-10,T-10,4);x.fill();x.strokeStyle=ra(tn(c,1.6),.55);x.lineWidth=1;x.beginPath();x.moveTo(T/2,9);x.lineTo(T-9,T/2);x.lineTo(T/2,T-9);x.lineTo(9,T/2);x.closePath();x.stroke();
  x.fillStyle='rgba(255,255,255,.35)';x.fillRect(6,6,T-12,1.4)}
 // ---- the fixed materials (tiles 120-138): [tile, name, colour, hardness, price, level, sound/tool category, description, painter]
 const wood=(base,grain,knot)=>(x,R)=>{const ph=12;for(let r=0;r<4;r++){const y=r*ph,t=tn(base,.92+R()*.16);x.fillStyle=lin(x,0,y,0,y+ph,[tn(t,1.1),t,tn(t,.84)]);x.fillRect(0,y,T,ph);x.strokeStyle=ra(grain,.45);x.lineWidth=.7;
   for(let g=0;g<3;g++){x.beginPath();const gy=y+2+g*3.4+R();x.moveTo(0,gy);for(let X=0;X<=T;X+=6)x.lineTo(X,gy+Math.sin(X*.25+r)*1.1);x.stroke()}if(knot&&R()<.45){x.fillStyle=ra(knot,.8);x.beginPath();x.ellipse(8+R()*30,y+ph/2,2.6,1.4,0,0,TAU);x.fill()}
   x.fillStyle='rgba(20,10,5,.32)';x.fillRect(0,y+ph-1.1,T,1.1);x.fillRect((r%2?30:12)+R()*4,y,1.1,ph)}bevel(x,.6)};
 const FIX=[
  [120,'Birch Planks','#e6d3ad',4,4,1,'wood','Pale birch with dark knots, light and Nordic.',wood('#e6d3ad','#b89a6a','#4a3626')],
  [121,'Cherry Planks','#c46a5a',4,5,2,'wood','Warm rosy cherry wood with a satin grain.',wood('#c46a5a','#8a3a32','#5a2420')],
  [122,'Ebony Planks','#3a2a26',4,6,3,'wood','Near-black ebony with a thin gold grain.',wood('#3a2a26','#c9a25a',null)],
  [123,'Veined Marble','#eeebe6',6,7,3,'stone','Classic white marble with grey and gold veins.',(x,R)=>{x.fillStyle=lin(x,0,0,T,T,['#fbfaf7','#ece8e1','#e2ddd5']);x.fillRect(0,0,T,T);
    for(let i=0;i<4;i++){x.strokeStyle=i==0?'rgba(200,160,80,.55)':'rgba(120,118,130,'+(.25+R()*.3)+')';x.lineWidth=i==0?.9:.6+R()*.8;x.beginPath();let px=R()*T,py=-2;x.moveTo(px,py);for(let k=0;k<5;k++){px+=(R()-.5)*16;py+=11;x.lineTo(px,py)}x.stroke()}bevel(x,.7)}],
  [124,'Polished Granite','#8f7f86',6,6,2,'stone','Speckled granite, cut and polished.',(x,R)=>{x.fillStyle=lin(x,0,0,T,T,['#9a8a92','#857680','#776a72']);x.fillRect(0,0,T,T);speck(x,R,90,'#2a2228',.6,.4,1.3);speck(x,R,60,'#e9dde0',.55,.3,1);speck(x,R,30,'#c76f68',.45,.4,1.1);
    x.fillStyle=lin(x,0,0,T,T,['rgba(255,255,255,0)','rgba(255,255,255,.14)','rgba(255,255,255,0)']);x.fillRect(0,0,T,T);bevel(x)}],
  [125,'Herringbone Parquet','#b98a55',4,6,2,'wood','Oak strips laid in a herringbone.',(x,R)=>{x.fillStyle='#5a3a20';x.fillRect(0,0,T,T);x.save();x.translate(T/2,T/2);x.rotate(Math.PI/4);
    for(let i=-6;i<6;i++)for(let j=-3;j<3;j++){const a=i*8,b=j*20+(i%2?10:0),t=tn('#b98a55',.85+R()*.3);x.fillStyle=t;if(i%2)x.fillRect(a,b,7,18);else x.fillRect(a-6,b+4,18,7)}x.restore();x.fillStyle='rgba(255,240,210,.08)';x.fillRect(0,0,T,T/2);bevel(x,.6)}],
  [126,'Gilded Filigree','#d8b04a',7,14,4,'stone','Gold scrollwork on a deep panel: a touch of luxury.',(x,R)=>{x.fillStyle=lin(x,0,0,0,T,['#3b2a4a','#2a1e38']);x.fillRect(0,0,T,T);x.strokeStyle='#e8c46a';x.lineWidth=1.6;
    const sc=(cx,cy,s)=>{x.beginPath();x.arc(cx,cy,6*s,Math.PI,TAU*.95);x.arc(cx+4*s,cy,2.4*s,Math.PI,TAU*.9);x.stroke()};sc(14,18,1);sc(34,30,1);x.save();x.translate(T,T);x.rotate(Math.PI);sc(14,18,1);sc(34,30,1);x.restore();
    x.strokeStyle='#f6dc90';x.lineWidth=1.2;x.strokeRect(3,3,T-6,T-6);x.fillStyle='#fff3c8';x.beginPath();x.arc(T/2,T/2,2,0,TAU);x.fill();bevel(x)}],
  [127,'Brushed Steel','#9aa3ad',7,8,3,'stone','Brushed metal plates with rivets. Cool and modern.',(x,R)=>{x.fillStyle=lin(x,0,0,0,T,['#c3cbd3','#9aa3ad','#7d868f']);x.fillRect(0,0,T,T);for(let y=0;y<T;y+=1.2){x.fillStyle='rgba(255,255,255,'+(R()*.08)+')';x.fillRect(0,y,T,.6)}
    x.strokeStyle='rgba(40,48,58,.55)';x.lineWidth=1;x.strokeRect(.5,.5,T/2,T-1);x.strokeRect(T/2+.5,.5,T/2-1,T-1);x.fillStyle='#5c656e';for(const[a,b]of[[5,5],[T/2-5,5],[5,T-5],[T/2-5,T-5],[T/2+5,5],[T-5,5],[T/2+5,T-5],[T-5,T-5]]){x.beginPath();x.arc(a,b,1.6,0,TAU);x.fill()}
    x.fillStyle='rgba(255,255,255,.5)';for(const[a,b]of[[5,5],[T/2+5,5]]){x.beginPath();x.arc(a-.5,b-.5,.6,0,TAU);x.fill()}bevel(x)}],
  [128,'Clear Ice','#bfe6fb',3,4,2,'soft','A block of clear blue ice with frozen cracks.',(x,R)=>{x.fillStyle='rgba(190,230,250,.55)';x.fillRect(0,0,T,T);x.fillStyle=lin(x,0,0,T,T,['rgba(255,255,255,.4)','rgba(160,215,245,.1)','rgba(120,180,230,.35)']);x.fillRect(0,0,T,T);
    x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=.8;x.beginPath();let px=6,py=10;x.moveTo(px,py);for(let k=0;k<5;k++){px+=6+R()*4;py+=(R()-.3)*8;x.lineTo(px,py)}x.moveTo(20,20);x.lineTo(26,34);x.lineTo(34,38);x.stroke();x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=1.4;x.strokeRect(1,1,T-2,T-2)}],
  [129,'Packed Snow','#f4f8fc',2,2,1,'soft','Soft packed snow. Squeaks underfoot.',(x,R)=>{x.fillStyle=lin(x,0,0,0,T,['#ffffff','#eef4fa','#dfe8f2']);x.fillRect(0,0,T,T);for(let i=0;i<10;i++)blot(x,R()*T,R()*T,6+R()*8,i%2?'#d6e2f0':'#ffffff',.5);speck(x,R,20,'#c8d8ea',.35,.5,1.2);speck(x,R,10,'#ffffff',.9,.4,.9)}],
  [130,'Celestial Tile','#1e2450',6,12,4,'stone','Midnight tile with gold star inlay. The stars twinkle.',(x,R)=>{x.fillStyle=lin(x,0,0,T,T,['#2a3168','#1e2450','#161a3c']);x.fillRect(0,0,T,T);x.strokeStyle='rgba(232,196,106,.7)';x.lineWidth=1;x.strokeRect(2.5,2.5,T-5,T-5);
    const star=(cx,cy,s)=>{x.fillStyle='#f3d27a';x.beginPath();for(let i=0;i<10;i++){const r=i%2?s*.42:s,a=-Math.PI/2+i*Math.PI/5;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}x.closePath();x.fill()};star(T/2,T/2,6);star(11,12,2.4);star(37,35,2);star(36,11,1.6);speck(x,R,12,'#ffffff',.7,.3,.7);bevel(x,.7)}],
  [131,'Tide Glass','#5fc6e0',3,8,3,'soft','Sea-blue glass with water moving inside.',(x,R)=>{x.fillStyle='rgba(70,170,210,.5)';x.fillRect(0,0,T,T);for(let i=0;i<4;i++){x.strokeStyle='rgba(220,250,255,.45)';x.lineWidth=1;x.beginPath();const y=8+i*10;x.moveTo(0,y);for(let X=0;X<=T;X+=4)x.lineTo(X,y+Math.sin(X*.3+i)*1.6);x.stroke()}
    x.strokeStyle='rgba(30,110,150,.85)';x.lineWidth=2;x.strokeRect(1,1,T-2,T-2);x.fillStyle='rgba(255,255,255,.3)';x.fillRect(4,4,T-8,1.4)}],
  [132,'Moss Cobble','#7d8a74',6,4,1,'stone','Old cobbles with moss in the cracks.',(x,R)=>{x.fillStyle='#4a5244';x.fillRect(0,0,T,T);for(let i=0;i<9;i++){const cx=4+(i%3)*16+R()*6,cy=4+(i/3|0)*16+R()*6,rw=6+R()*2.4,rh=5+R()*2;x.fillStyle=lin(x,cx-rw,cy-rh,cx+rw,cy+rh,['#a8b0a0','#7d8a74','#5d6858']);x.beginPath();x.ellipse(cx+2,cy+2,rw,rh,R(),0,TAU);x.fill()}
    for(let i=0;i<14;i++){x.fillStyle='rgba('+(80+R()*40|0)+','+(140+R()*40|0)+',70,.85)';x.beginPath();x.arc(R()*T,R()*T,1+R()*1.8,0,TAU);x.fill()}bevel(x,.6)}],
  [133,'Terracotta Tile','#c9714a',5,4,1,'stone','Sun-baked clay tiles, warm and rustic.',(x,R)=>{x.fillStyle='#8a4a30';x.fillRect(0,0,T,T);for(let i=0;i<2;i++)for(let j=0;j<2;j++){const t=tn('#c9714a',.9+R()*.2),a=i*24+1,b=j*24+1;x.fillStyle=lin(x,a,b,a+22,b+22,[tn(t,1.12),t,tn(t,.86)]);rrect(x,a,b,22,22,1.5);x.fill();speck(x,R,5,'#6a3020',.3,.4,.9)}bevel(x,.6)}],
  [134,'Crystal Lattice','#9ad8ff',5,14,4,'soft','A lattice of living crystal. It glows and sparkles.',(x,R)=>{x.fillStyle='#1a2a4a';x.fillRect(0,0,T,T);const g=x.createRadialGradient(T/2,T/2,2,T/2,T/2,T*.6);g.addColorStop(0,'rgba(180,235,255,.9)');g.addColorStop(1,'rgba(80,140,220,.2)');x.fillStyle=g;x.fillRect(0,0,T,T);
    x.strokeStyle='rgba(225,248,255,.85)';x.lineWidth=1.1;for(const[a,b,c,d]of[[0,T/2,T/2,0],[T/2,0,T,T/2],[T,T/2,T/2,T],[T/2,T,0,T/2],[T/2,0,T/2,T],[0,T/2,T,T/2]]){x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()}x.fillStyle='#ffffff';x.beginPath();x.arc(T/2,T/2,2.2,0,TAU);x.fill();bevel(x,.8)}],
  [135,'Garden Path','#b8a98c',3,2,1,'soft','Fine pebbles in packed earth. Paths that feel walked.',(x,R)=>{x.fillStyle=lin(x,0,0,0,T,['#a4906c','#8e7a58']);x.fillRect(0,0,T,T);for(let i=0;i<34;i++){const cx=R()*T,cy=R()*T,r=1.4+R()*2.6,t=['#d8ccb4','#bfb39a','#e8dfcc','#9c9078'][R()*4|0];x.fillStyle='rgba(40,25,10,.35)';x.beginPath();x.ellipse(cx+.5,cy+.8,r,r*.8,0,0,TAU);x.fill();x.fillStyle=t;x.beginPath();x.ellipse(cx,cy,r,r*.78,R(),0,TAU);x.fill()}bevel(x,.4)}],
  [136,'Flower Turf','#5aa84a',3,3,1,'soft','Thick turf with tiny flowers woven in.',(x,R)=>{x.fillStyle=lin(x,0,0,0,T,['#6cbf55','#4f9a40','#3d7c34']);x.fillRect(0,0,T,T);for(let i=0;i<60;i++){x.strokeStyle='rgba('+(90+R()*60|0)+','+(170+R()*50|0)+',70,.7)';x.lineWidth=.8;const a=R()*T,b=R()*T;x.beginPath();x.moveTo(a,b);x.lineTo(a+(R()-.5)*3,b-3-R()*3);x.stroke()}
    for(let i=0;i<9;i++){const cx=R()*T,cy=R()*T,c=['#ffd6e6','#fff2a8','#cfe3ff','#ffffff'][R()*4|0];x.fillStyle=c;for(let p=0;p<5;p++){x.beginPath();x.arc(cx+Math.cos(p*1.26)*1.5,cy+Math.sin(p*1.26)*1.5,1.1,0,TAU);x.fill()}x.fillStyle='#f0b030';x.beginPath();x.arc(cx,cy,.8,0,TAU);x.fill()}}],
  [137,'Moonstone Bricks','#b9c6e6',6,9,3,'stone','Pale moonstone bricks with a faint inner light.',(x,R)=>{x.fillStyle='#5a6488';x.fillRect(0,0,T,T);const rh=16,bw=24;for(let r=0;r*rh<T;r++)for(let k=-1;k*bw<T+bw;k++){const px=k*bw+(r%2?bw/2:0),py=r*rh,t=tn('#b9c6e6',.92+R()*.14);x.fillStyle=lin(x,px,py,px+bw,py+rh,[tn(t,1.15),t,tn(t,.85)]);rrect(x,px+1.4,py+1.4,bw-2.8,rh-2.8,2.5);x.fill()}
    for(let i=0;i<3;i++)blot(x,R()*T,R()*T,6,'#e8f0ff',.35);bevel(x)}],
  [138,'Blossom Shingles','#e9a0b4',5,6,2,'wood','Rows of rosy shingles, for roofs under the blossoms.',(x,R)=>{x.fillStyle='#8a4a5a';x.fillRect(0,0,T,T);for(let r=0;r<4;r++)for(let k=-1;k<5;k++){const px=k*12+(r%2?6:0),py=r*12,t=tn('#e9a0b4',.88+R()*.2);x.fillStyle=lin(x,0,py,0,py+14,[tn(t,1.12),t,tn(t,.8)]);x.beginPath();x.moveTo(px+1,py);x.lineTo(px+11,py);x.lineTo(px+11,py+9);x.quadraticCurveTo(px+6,py+14,px+1,py+9);x.closePath();x.fill()}bevel(x,.5)}]];
 const FIXID=new Set(FIX.map(f=>f[0])),FIXD={};for(const f of FIX)FIXD[f[0]]=f;
 const ANIM=new Set([117,130,131,134]);
 // ---- keys: paintable materials 900-905 (tile 115, material 0-5), tinted glass 906 (116), glow block 907 (117); fixed materials 920-938 (tile+800)
 const MKEY=k=>{k=+k;return k>=900&&k<=907},FKEY=k=>{k=+k;return k>=920&&k<=938&&FIXID.has(k-800)},isKey=k=>MKEY(k)||FKEY(k);
 const tileOf=k=>{k=+k;return k<=905?115:k==906?116:k==907?117:k-800};
 const keyOf=(b,v)=>b==115?900+((v>>6)%PM.length):b==116?906:b==117?907:FIXID.has(b)?b+800:0;
 const NAMES={906:['Tinted Glass','Clear glass with a soft colour tint.','soft',4,2],907:['Glow Block','A softly glowing block; it lights the area around it.','soft',8,3]};
 // the colour each material is placed in (remembered)
 const SK='rbmats10';let S={col:{}};try{S=Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(_){}
 const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(_){}};
 const colOf=k=>{const c=S.col[k];return Number.isInteger(c)&&c>=0&&c<NC?c:(k==907?47:k==906?24:k==905?37:k==904?10:0)};
 const varOf=k=>{k=+k;return k<=905?(k-900)*64+colOf(k):colOf(k)};
 // ---- sprites: one per tile + variant, cached
 const VS=new Map();
 function vsprite(b,v){const id=b*65536+v;let c=VS.get(id);if(c)return c;const ci=Math.min(NC-1,v&63),col=PAL[ci][1],R=rr(b*977+v*131+7);
  if(b==115){const m=Math.min(PM.length-1,v>>6);c=paint(x=>PM[m].f(x,col,R))}else if(b==116)c=paint(x=>glass(x,col,R));else c=paint(x=>glow(x,col,R));VS.set(id,c);return c}
 window.VSPR=(b,x,y)=>vsprite(b,(x|0)>=0&&(y|0)>=0&&x<W&&y<H?TVAR[y*W+x]:0);
 const FS=new Map();
 function fsprite(b,v){const id=b*4+v;let c=FS.get(id);if(c)return c;const f=FIXD[b],R=rr(b*131+v*977+3);c=paint(x=>f[8](x,R));FS.set(id,c);return c}
 // ---- register the blocks
 for(const b of[115,116,117]){VARID[b]=1;SOLID6[b]=1}
 BLK[115]=['Painted Block','#efe6cf',4];BLK[116]=['Tinted Glass','#7ab4ee',2];BLK[117]=['Glow Block','#ffe6a8',3];GLOW7[117]=[255,236,200];GLOW7[134]=[170,225,255];
 for(const f of FIX){const[b,n,c,h,p,lv]=f;BLK[b]=[n,c,h];SOLID6[b]=1;try{PRICE[b]=p;LVREQ[b]=lv}catch(_){}MAT[b+800]={n,c,p:Math.max(1,p>>1),blk:b}}
 PM.forEach((m,i)=>{MAT[900+i]={n:m.n,c:'#efe6cf',p:Math.max(1,m.p>>1),blk:115}});MAT[906]={n:'Tinted Glass',c:'#7ab4ee',p:2,blk:116};MAT[907]={n:'Glow Block',c:'#ffe6a8',p:4,blk:117};
 try{const C=TOOLS8.CAT;C[115]='stone';C[116]='soft';C[117]='soft';for(const f of FIX)C[f[0]]=f[6]}catch(_){}
 // which of the paintable materials a placed tile is (sounds and tools follow it)
 const catAt=(b,k)=>b==115?PM[Math.min(PM.length-1,(TVAR[k]||0)>>6)].cat:b==116||b==117?'soft':FIXD[b]?FIXD[b][6]:'';
 // the old sprite chain still answers for these ids (icons, debris, previews): variant v 0-2 shows three sample colours
 {const _bs=blockSprite;blockSprite=function(b,v){if(FIXID.has(b))return fsprite(b,v|0);if(b==115||b==116||b==117)return vsprite(b,[0,24,33][(v|0)%3]+(b==115?0:0));return _bs.apply(this,arguments)}}
 // ---- names, categories, icons
 const nameOf=k=>{k=+k;if(k>=900&&k<=905)return PM[k-900].n;if(NAMES[k])return NAMES[k][0];if(FKEY(k))return FIXD[k-800][1];return''};
 const descOf=k=>{k=+k;if(k>=900&&k<=905)return PM[k-900].d+' Comes in '+NC+' colours.';if(NAMES[k])return NAMES[k][1]+' Comes in '+NC+' colours.';if(FKEY(k))return FIXD[k-800][7];return''};
 /* names come from MAT (iname reads it for every key it knows) */
 {const _c=ITEM7.cat;ITEM7.cat=function(k){if(isKey(k))return'block';return _c.apply(this,arguments)}}
 {const _cn=ITEM7.catName;ITEM7.catName=function(k){if(MKEY(k))return'Colour block · pick a colour, click to place';if(FKEY(k))return'Block · click to place';return _cn.apply(this,arguments)}}
 function iconCanvas(k,S){const c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');try{burstBG(x,S)}catch(_){}x.save();x.shadowColor='rgba(30,20,55,.35)';x.shadowBlur=4;x.shadowOffsetY=2;
  if(MKEY(k)){const b=tileOf(k),m=k<=905?(k-900)*64:0,cs=[9,24,18,33];const h=S*.38,o=S*.12;cs.forEach((ci,i)=>x.drawImage(vsprite(b,m+ci),o+(i%2)*h,o*.8+(i>>1)*h,h,h))}else x.drawImage(fsprite(tileOf(k),0),S*.1,S*.08,S*.8,S*.8);x.restore();return c}
 {const _iu=iconURL;iconURL=function(k){if(!isKey(k))return _iu.apply(this,arguments);if(ICON[k])return ICON[k];return ICON[k]=iconCanvas(+k,48).toDataURL()}}
 {const _mi=matIcon;matIcon=function(x,k,S){if(!isKey(k))return _mi.apply(this,arguments);x.drawImage(iconCanvas(+k,S),0,0,S,S)}}
 // a broken block drops its bag item (never the tile id: 100-199 read as seeds); colour blocks drop their material
 {const _ba=breakAt;breakAt=function(x,y,dmg){const inb=x>=0&&y>=0&&x<W&&y<H,k=y*W+x,b=inb?tiles[k]:0;if(!(VARID[b]&&b<=117)&&!FIXID.has(b))return _ba.apply(this,arguments);
   const v=TVAR[k],n0=drops.length,r=_ba.apply(this,arguments);for(let i=n0;i<drops.length;i++)if(drops[i].k===b||drops[i].k===100+b)drops[i].k=drops[i].k===b?keyOf(b,v):'gem';
   if(!tiles[k])try{FEEL10.broke(b,k,v)}catch(_){}else try{FEEL10.hit(b,k,v)}catch(_){}return r}}
 // ---- placing (the same rules as any block: reach, edit rights, an empty tile, never inside you)
 const reach=(tx,ty)=>Math.hypot(tx*T+T/2-P.x,ty*T+T/2-(P.y+P.h/2))<REACH;
 const cursor=()=>({tx:Math.floor((mx+cam.x)/T),ty:Math.floor((my+cam.y)/T)});
 const held=()=>{try{const k=HOTBAR.held();if(k!=null)return k}catch(_){}return bar[sel]};
 function canPlaceAt(tx,ty,b){if(tx<1||ty<1||tx>=W-1||ty>=H-1)return'edge';if(!reach(tx,ty))return'far';const k=ty*W+tx;if(tiles[k]||trees.has(k))return'taken';
  if(SOLID6[b]&&tx*T<P.x+P.w/2&&(tx+1)*T>P.x-P.w/2&&ty*T<P.y+P.h&&(ty+1)*T>P.y)return'you';try{if(typeof XSPAN=='function'){const s=XSPAN();if(tx<=s[0]||tx>=s[1]-1)return'edge'}}catch(_){}return''}
 function placeKey(key,tx,ty,opt){opt=opt||{};if(!isKey(key)||cnt(key)<1)return false;const b=tileOf(key);if(canPlaceAt(tx,ty,b))return false;if(!canEdit()){try{if(performance.now()-lockWarned>1500){lockWarned=performance.now();say(lockMsg())}}catch(_){}return false}
  const k=ty*W+tx,v=opt.v!=null?opt.v:VARID[b]?varOf(key):0;addI(key,-1);tiles[k]=b;hp[k]=BLK[b][2];TVAR[k]=VARID[b]?v:0;TST[k]=0;pushEdit(k);try{FEEL10.placed(b,k,v)}catch(_){pop.set(k,performance.now())}try{stat('place',1);G('place')}catch(_){}try{BUILDER10.used(key,k,b,v)}catch(_){}return true}
 function placeHere(key){const{tx,ty}=cursor();return placeKey(key,tx,ty)}
 {const _pa=placeAction;placeAction=function(){try{if(!wrench()){const it=held();if(isKey(it)&&cnt(it)>0){placeHere(it);return}}}catch(e){console.error('MATS10 place',e)}return _pa.apply(this,arguments)}}
 {const _uw=useWeapon;useWeapon=function(){try{const it=held();if(isKey(it)&&cnt(it)>0&&!showInv){placeHere(it);wcd=.13;return}}catch(e){console.error('MATS10 use',e)}return _uw.apply(this,arguments)}}
 // ---- the colour strip above the hotbar while a colour material is held; , and . step through the colours
 let strip=null,shown=-1;
 function mkStrip(){strip=document.createElement('div');strip.id='mats10';strip.setAttribute('role','listbox');strip.setAttribute('aria-label','Block colour');
  strip.innerHTML='<div class="m10h"><b></b><span></span></div><div class="m10g"></div>';const gr=strip.querySelector('.m10g');
  PAL.forEach((p,i)=>{const s=document.createElement('button');s.type='button';s.className='m10s';s.dataset.i=i;s.style.setProperty('--c',p[1]);s.title=p[0]+' ('+p[2]+')';s.setAttribute('aria-label',p[0]);gr.appendChild(s)});
  strip.addEventListener('pointerdown',e=>{e.stopPropagation()});strip.addEventListener('click',e=>{const s=e.target.closest('.m10s');if(!s)return;e.stopPropagation();setCol(held(),+s.dataset.i)});document.body.appendChild(strip)}
 function setCol(key,i){if(!MKEY(key))return;S.col[key]=Math.max(0,Math.min(NC-1,i|0));save();shown=-1;sync();try{FEEL10.tick&&FEEL10.ui('colour')}catch(_){}}
 function sync(){const it=held(),on=MKEY(it)&&cnt(it)>0&&!showInv&&menuEl.style.display=='none';if(!on){if(strip)strip.classList.remove('on');shown=-1;return}if(!strip)mkStrip();strip.classList.add('on');
  const c=colOf(it),sig=it*100+c;if(sig===shown)return;shown=sig;strip.querySelector('.m10h b').textContent=nameOf(it);strip.querySelector('.m10h span').textContent=PAL[c][0];
  strip.querySelectorAll('.m10s').forEach(s=>{const o=+s.dataset.i===c;s.classList.toggle('on',o);s.setAttribute('aria-selected',o?'true':'false')})}
 setInterval(()=>{try{sync()}catch(_){}},150);
 addEventListener('keydown',e=>{if(e.ctrlKey||e.altKey||e.metaKey)return;const t=e.target;if(t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'||t.isContentEditable))return;if(e.key!==','&&e.key!=='.')return;const it=held();if(!MKEY(it)||showInv)return;
  e.preventDefault();setCol(it,(colOf(it)+(e.key=='.'?1:-1)+NC)%NC)},true);
 // ---- the cursor preview: the block in its colour, green edge where it can go, red where it can't
 {const _dt=drawTarget;drawTarget=function(now){_dt.apply(this,arguments);try{const it=held();if(!isKey(it)||cnt(it)<1||showInv||menuEl.style.display!='none')return;const{tx,ty}=cursor(),b=tileOf(it),why=canPlaceAt(tx,ty,b);if(why=='edge'||why=='taken')return;
   const px=tx*T-cam.x,py=ty*T-cam.y,pl=.5+.5*Math.sin(now/260),sp=VARID[b]?vsprite(b,varOf(it)):fsprite(b,(tx*7+ty*13)%3);g.save();g.globalAlpha=why?.28:.5+.1*pl;g.drawImage(sp,px+2,py+2,T-4,T-4);g.globalAlpha=1;
   g.strokeStyle=why?'rgba(240,138,138,.85)':'rgba(170,240,190,'+(.55+.3*pl)+')';g.lineWidth=2;g.strokeRect(px+1,py+1,T-2,T-2);g.restore()}catch(_){}}}
 // ---- living materials: a light overlay on the animated blocks that are on screen (nothing for the rest)
 function overlay(x0,x1,y0,y1,now){const t=now/1000;let n=0;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const k=y*W+x,b=tiles[k];if(!ANIM.has(b))continue;if(++n>500)return;const px=x*T-cam.x,py=y*T-cam.y,ph=(x*7.3+y*3.1)%6.28;
   if(b==117){const c=PAL[Math.min(NC-1,TVAR[k]&63)][1],a=.1+.08*Math.sin(t*1.6+ph);g.fillStyle=ra(tn(c,1.5),a);g.fillRect(px+5,py+5,T-10,T-10)}
   else if(b==130){for(let i=0;i<2;i++){const s=Math.sin(t*(1.3+i*.4)+ph+i*2);if(s<.55)continue;const sx=px+[11,37][i],sy=py+[12,35][i];g.fillStyle='rgba(255,246,210,'+((s-.55)*1.8)+')';g.beginPath();g.arc(sx,sy,1.8,0,TAU);g.fill();g.fillRect(sx-4,sy-.4,8,.8);g.fillRect(sx-.4,sy-4,.8,8)}}
   else if(b==131){g.strokeStyle='rgba(235,252,255,.35)';g.lineWidth=1;g.beginPath();const yy=py+T*.5+Math.sin(t*1.2+ph)*6;g.moveTo(px+3,yy);for(let X=0;X<=T-6;X+=6)g.lineTo(px+3+X,yy+Math.sin(X*.25+t*2.4+ph)*1.6);g.stroke()}
   else if(b==134){const s=(t*.7+ph)%3;if(s<1){g.fillStyle='rgba(255,255,255,'+(.6*(1-s))+')';const sx=px+T/2+Math.cos(ph*3)*12,sy=py+T/2+Math.sin(ph*5)*12;g.beginPath();g.arc(sx,sy,1.4+s*1.2,0,TAU);g.fill()}}}}
 return{PAL,PM,FIX,FIXID,ANIM,NC,isKey,MKEY,FKEY,tileOf,keyOf,varOf,colOf,setCol,nameOf,descOf,vsprite,fsprite,placeKey,canPlaceAt,catAt,overlay,cursor,held,reach,iconCanvas,S,tn,ra,mixc,rr,paint}})();
