// ===== BLK9: house-building blocks + the Wooden House Door item (95; its top half is 96, see 91-z-housedoors.js).
// The tile ids 0-99 are full, so these blocks use the extended tile range 100-114 (tiles[] is a Uint8Array; validEdit / server rules
// accept tiles up to 149). Their INVENTORY key is the tile id + 300 (400-414), because item keys 100-199 already mean "seed of block
// k-100" and 200-399 are materials / walls: the keys are registered as materials (so they stack, sell and survive saves) and are placed
// and dropped through BUILD9 (99-zzzz-build.js). The door (95) is a normal 0-99 tile, so it lives in tools/new-blocks.json.
// Every sprite is painted once per variant (3 per block) and then rendered through the TILE7 chunk cache. Fences, rugs, lanterns and
// planters are see-through and walkable: they are non-solid but still painted into the chunk cache (TDRAW7), like the campfire base.
// Names are picked so the mining category (TOOLS8.catOf) and the mining sounds come out right: Brick/Stone/Slate/Marble/Roof Tile = stone
// (Pebble), Wood/Plank = wood (Twiggy, Pip), the rest = soft (Pip). =====
const BLK9=(()=>{
 const IDS=[100,101,102,103,104,105,106,107,108,109,110,111,112,113,114],DECO=[108,110,111,113],rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 // [tile, name, colour, hardness, price, level]
 const DEF=[[100,'Clay Brick','#b5523b',5,12,1],[101,'Half-Timber Wood Frame','#efe4cf',4,16,2],[102,'Mossy Stone Brick','#8a9190',6,14,2],[103,'Polished Wood Floor','#b07a45',4,12,1],[104,'Slate Roof Tile','#4d5866',5,18,3],
  [105,'Mossgreen Roof Tile','#4f8a4a',5,18,3],[106,'Thatch Roof','#d8b45a',3,10,1],[107,'Framed Window','#9fd4ef',2,20,2],[108,'Iron Lantern','#ffc070',2,35,3],[109,'Wooden Bookshelf','#6b4528',4,28,3],
  [110,'Wooden Fence','#a8784a',3,8,1],[111,'Woven Rug','#c0504a',2,14,2],[112,'Marble Floor Tiles','#e9e6df',6,26,4],[113,'Flower Planter','#e86a8a',2,16,2],[114,'Gravel Path','#b9ad96',3,6,1]];
 const KEY=t=>t+300,TILE=k=>{k=+k;return k>=400&&k<=414?k-300:0};
 for(const[id,n,c,h,p,lv]of DEF){BLK[id]=[n,c,h];PRICE[id]=p;LVREQ[id]=lv;SOLID6[id]=1;MAT[KEY(id)]={n,c,p:Math.max(1,p>>1),blk:id}}GLOW7[108]=[255,196,120];
 for(const b of DECO){SOLID6[b]=0;TDRAW7[b]=1}TDRAW7[69]=1;// the campfire base (stones + logs) was never painted: TILE7 skipped it as non-solid
 SOLID6[95]=0;SOLID6[96]=0;BLK[96]=['Wooden House Door','#8a5a32',3];PRICE[96]=0;LVREQ[96]=0;
 const sh=(c,f)=>mixc(c[0]=='#'?c:'#'+(c.match(/\d+/g)||[0,0,0]).slice(0,3).map(v=>(+v|0).toString(16).padStart(2,'0')).join(''),f),rc=(x,a,b,w,h,r)=>{x.beginPath();x.roundRect?x.roundRect(a,b,w,h,r):x.rect(a,b,w,h)};
 const speck=(x,R,col,n,a,sz,y0,y1)=>{x.save();x.fillStyle=col;for(let i=0;i<n;i++){x.globalAlpha=a*(.4+R()*.6);const z=sz*(.5+R());x.fillRect(R()*T,(y0||0)+R()*((y1||T)-(y0||0)),z,z)}x.restore()};
 const lg=(x,x0,y0,x1,y1,st)=>{const g=x.createLinearGradient(x0,y0,x1,y1);st.forEach((c,i)=>g.addColorStop(i/(st.length-1),c));return g};
 // brick rows: rows of height rh, bricks of width bw, offset every other row; col(R) gives each brick its tone
 function bricks(x,R,mortar,rh,bw,col,round){x.fillStyle=mortar;x.fillRect(0,0,T,T);for(let r=0;r*rh<T;r++)for(let k=-1;k*bw<T+bw;k++){const px=k*bw+(r%2?bw/2:0),py=r*rh,c=col(R);x.fillStyle=lg(x,0,py,0,py+rh,[sh(c,1.18),c,sh(c,.82)]);rc(x,px+1.5,py+1.5,bw-3,rh-3,round||1.5);x.fill();x.fillStyle='rgba(255,255,255,.16)';x.fillRect(px+2.5,py+2,bw-5,1.4)}}
 const P={
  100(x,R){bricks(x,R,'#6e4234',12,16,R=>['#b5523b','#a8492f','#c0613f','#9c4632'][R()*4|0],2.5);speck(x,R,'#3a1a10',16,.35,2);speck(x,R,'#f0b090',8,.25,1.5)},
  101(x,R,v){x.fillStyle=lg(x,0,0,T,T,['#f4ebd8','#e8dcc3']);x.fillRect(0,0,T,T);speck(x,R,'#c9b896',40,.35,2);speck(x,R,'#ffffff',14,.4,2);
   const beam=(a,b,c,d,w)=>{x.strokeStyle='#2c1a0f';x.lineWidth=w+2.4;x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();x.strokeStyle='#5a3820';x.lineWidth=w;x.stroke();x.strokeStyle='rgba(255,220,170,.18)';x.lineWidth=1;x.beginPath();x.moveTo(a+1,b+1);x.lineTo(c+1,d+1);x.stroke()};
   beam(0,3,T,3,5);beam(0,T-3,T,T-3,5);beam(4,0,4,T,5);if(v==0)beam(8,T-6,T-2,6,4);else if(v==1)beam(8,6,T-2,T-6,4);else{beam(T-6,0,T-6,T,4)}},
  102(x,R){bricks(x,R,'#4e5452',16,24,R=>sh('#8a9190',.88+R()*.24),2);for(let i=0;i<5;i++){const px=R()*T,py=(R()*3|0)*16+1;x.fillStyle='rgba('+(70+R()*30|0)+','+(130+R()*40|0)+','+(60+R()*20|0)+',.8)';for(let j=0;j<6;j++){x.beginPath();x.arc(px+(R()-.5)*10,py+R()*4,1.4+R()*2.4,0,6.3);x.fill()}}
   x.strokeStyle='rgba(30,34,34,.5)';x.lineWidth=1;x.beginPath();const cx=R()*T;x.moveTo(cx,4+R()*8);x.lineTo(cx+(R()-.5)*8,14+R()*8);x.stroke()},
  103(x,R){for(let r=0;r<4;r++){const py=r*12,c=sh('#b07a45',.9+R()*.2);x.fillStyle=lg(x,0,py,0,py+12,[sh(c,1.15),c,sh(c,.86)]);x.fillRect(0,py,T,12);x.strokeStyle='rgba(90,50,20,.35)';x.lineWidth=1;for(let i=0;i<2;i++){const yy=py+3+i*4+R()*2;x.beginPath();x.moveTo(0,yy);x.bezierCurveTo(16,yy+(R()-.5)*3,32,yy+(R()-.5)*3,T,yy);x.stroke()}
    const sx=(r*19+7)%T;x.fillStyle='rgba(60,30,12,.6)';x.fillRect(sx,py,1.5,12);x.fillStyle='rgba(50,26,10,.55)';x.fillRect(0,py+11,T,1.2);x.fillStyle='rgba(255,236,200,.28)';x.fillRect(0,py,T,1.2)}
   x.fillStyle='rgba(255,255,255,.12)';x.beginPath();x.moveTo(6,0);x.lineTo(16,0);x.lineTo(4,T);x.lineTo(-6,T);x.closePath();x.fill()},
  104(x,R){x.fillStyle='#2c333d';x.fillRect(0,0,T,T);for(let r=0;r<4;r++)for(let k=-1;k<4;k++){const px=k*16+(r%2?8:0),py=r*12-2,c=sh('#4d5866',.86+R()*.3);x.fillStyle=lg(x,0,py,0,py+15,[sh(c,1.3),c,sh(c,.75)]);x.beginPath();x.moveTo(px+1,py);x.lineTo(px+15,py);x.lineTo(px+15,py+11);x.quadraticCurveTo(px+8,py+15,px+1,py+11);x.closePath();x.fill();x.strokeStyle='rgba(10,14,22,.6)';x.lineWidth=1.1;x.stroke();x.fillStyle='rgba(200,215,235,.18)';x.fillRect(px+3,py+1,10,1.2)}},
  105(x,R){x.fillStyle='#24401f';x.fillRect(0,0,T,T);for(let r=0;r<5;r++)for(let k=-1;k<4;k++){const px=k*16+(r%2?8:0)+8,py=r*10+3,c=sh('#4f8a4a',.85+R()*.3);const g=x.createRadialGradient(px-3,py-2,1,px,py,11);g.addColorStop(0,sh(c,1.5));g.addColorStop(1,sh(c,.8));x.fillStyle=g;x.beginPath();x.arc(px,py,8.5,0,Math.PI);x.lineTo(px-8.5,py-4);x.lineTo(px+8.5,py-4);x.fill();x.strokeStyle='rgba(12,30,10,.65)';x.lineWidth=1.2;x.beginPath();x.arc(px,py,8.5,0,Math.PI);x.stroke();x.strokeStyle='rgba(220,255,200,.25)';x.beginPath();x.arc(px,py,5.5,.4,Math.PI-.4);x.stroke()}},
  106(x,R){x.fillStyle='#8a6a2a';x.fillRect(0,0,T,T);for(let r=0;r<4;r++){const py=r*12;x.fillStyle=lg(x,0,py,0,py+12,['#e8c870','#d8b45a','#a8823a']);x.fillRect(0,py,T,12);for(let i=0;i<26;i++){const px=R()*T;x.strokeStyle=R()<.5?'rgba(255,236,160,.75)':'rgba(120,84,30,.6)';x.lineWidth=1;x.beginPath();x.moveTo(px,py);x.lineTo(px-2+R()*1.5,py+11+R()*2);x.stroke()}x.fillStyle='rgba(90,60,20,.55)';x.fillRect(0,py+10.5,T,1.6)}},
  107(x,R){x.clearRect(0,0,T,T);x.fillStyle='rgba(170,220,250,.42)';x.fillRect(4,4,T-8,T-8);x.fillStyle=lg(x,4,4,T-4,T-4,['rgba(255,255,255,.32)','rgba(255,255,255,0)','rgba(120,170,220,.2)']);x.fillRect(4,4,T-8,T-8);
   x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.moveTo(9,T-10);x.lineTo(20,9);x.lineTo(25,9);x.lineTo(14,T-10);x.closePath();x.fill();x.fillStyle='rgba(255,255,255,.3)';x.beginPath();x.moveTo(27,T-10);x.lineTo(34,24);x.lineTo(36,24);x.lineTo(29,T-10);x.closePath();x.fill();
   const fr='#6b4528';x.fillStyle='#2c1a0f';x.fillRect(0,0,T,5);x.fillRect(0,T-6,T,6);x.fillRect(0,0,5,T);x.fillRect(T-5,0,5,T);x.fillRect(T/2-2.5,0,5,T);x.fillRect(0,T/2-2.5,T,5);
   x.fillStyle=fr;x.fillRect(1,1,T-2,3);x.fillRect(1,T-5,T-2,4);x.fillRect(1,1,3,T-2);x.fillRect(T-4,1,3,T-2);x.fillRect(T/2-1.5,1,3,T-2);x.fillRect(1,T/2-1.5,T-2,3);x.fillStyle='#8a5e38';x.fillRect(1,T-5,T-2,1.4)},
  108(x,R){x.clearRect(0,0,T,T);const cx=T/2;x.lineJoin='round';x.strokeStyle='#1a1410';x.lineWidth=2;
   x.beginPath();x.arc(cx,9,4,Math.PI,0);x.stroke();const gl=x.createRadialGradient(cx,30,1,cx,30,22);gl.addColorStop(0,'rgba(255,214,140,.55)');gl.addColorStop(1,'rgba(255,190,110,0)');x.fillStyle=gl;x.fillRect(0,6,T,T-6);
   x.fillStyle='#3a3430';rc(x,cx-10,12,20,5,2);x.fill();x.stroke();const gg=x.createRadialGradient(cx,30,1,cx,30,12);gg.addColorStop(0,'#fff6d0');gg.addColorStop(.45,'#ffc870');gg.addColorStop(1,'#d9822a');x.fillStyle=gg;rc(x,cx-8,17,16,20,2);x.fill();
   x.fillStyle='#fffbe6';x.beginPath();x.moveTo(cx,22);x.quadraticCurveTo(cx+4,29,cx,33);x.quadraticCurveTo(cx-4,29,cx,22);x.fill();
   x.strokeStyle='#2a221c';x.lineWidth=2;rc(x,cx-8,17,16,20,2);x.stroke();x.beginPath();x.moveTo(cx,17);x.lineTo(cx,37);x.stroke();x.fillStyle='#3a3430';rc(x,cx-11,37,22,6,2);x.fill();x.strokeStyle='#1a1410';x.stroke();x.fillStyle='rgba(255,255,255,.25)';x.fillRect(cx-9,38,18,1.4)},
  109(x,R){x.fillStyle='#3e2616';x.fillRect(0,0,T,T);x.fillStyle='#22140b';for(const py of[2,17,32])x.fillRect(3,py,T-6,13);const COL=['#b8433a','#3a6bb0','#d9a441','#4f8a4a','#7a4aa0','#e0d6c0','#2f6b6b','#c0703a'];
   for(const py of[2,17,32]){let px=4;while(px<T-6){const w=3+(R()*3|0),h=9+R()*4;if(px+w>T-4)break;const c=COL[R()*COL.length|0];if(R()<.12&&px<T-14){x.save();x.translate(px,py+13);x.rotate(-.35);x.fillStyle=c;x.fillRect(0,-h,w,h);x.restore();px+=w+4;continue}
    x.fillStyle=lg(x,px,0,px+w,0,[sh(c,1.2),c,sh(c,.75)]);x.fillRect(px,py+13-h,w,h);x.fillStyle='rgba(255,230,160,.6)';x.fillRect(px,py+15-h,w,1);px+=w+.6}}
   x.fillStyle=lg(x,0,0,0,4,['#7a5030','#4a2e1a']);for(const py of[0,15,30,45])x.fillRect(0,py,T,py==45?3:3);x.fillStyle='#5a3820';x.fillRect(0,0,3,T);x.fillRect(T-3,0,3,T);x.fillStyle='rgba(255,220,170,.22)';for(const py of[0,15,30])x.fillRect(0,py,T,1)},
  110(x,R){x.clearRect(0,0,T,T);x.lineJoin='round';const wd='#a8784a';for(const ry of[22,35]){x.fillStyle='#3a2414';x.fillRect(0,ry-1,T,8);x.fillStyle=lg(x,0,ry,0,ry+6,['#c8945e',wd,'#7a5232']);x.fillRect(0,ry,T,6)}
   for(const px of[8,32]){x.fillStyle='#3a2414';x.beginPath();x.moveTo(px-5,T);x.lineTo(px-5,14);x.lineTo(px,8);x.lineTo(px+5,14);x.lineTo(px+5,T);x.closePath();x.fill();x.fillStyle=lg(x,px-4,0,px+4,0,['#c8945e',wd,'#7a5232']);x.beginPath();x.moveTo(px-3.6,T);x.lineTo(px-3.6,14.5);x.lineTo(px,10);x.lineTo(px+3.6,14.5);x.lineTo(px+3.6,T);x.closePath();x.fill();x.fillStyle='rgba(40,24,12,.5)';x.beginPath();x.arc(px,25,1.1,0,6.3);x.arc(px,38,1.1,0,6.3);x.fill()}},
  111(x,R){x.clearRect(0,0,T,T);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,T-6,T,6);x.fillStyle='#8a2e2a';x.fillRect(0,T-9,T,8);x.fillStyle='#c0504a';x.fillRect(0,T-8,T,6);x.fillStyle='#f0d8a8';x.fillRect(0,T-7,T,1.2);x.fillRect(0,T-3.6,T,1.2);
   x.fillStyle='#2f5a8a';for(let i=0;i<T;i+=8){x.beginPath();x.moveTo(i+4,T-6.2);x.lineTo(i+6,T-5);x.lineTo(i+4,T-3.8);x.lineTo(i+2,T-5);x.closePath();x.fill()}x.fillStyle='rgba(255,255,255,.18)';x.fillRect(0,T-9,T,1)},
  112(x,R){for(const[ox,oy,w]of[[0,0,1],[24,0,0],[0,24,0],[24,24,1]]){const c=w?'#ece9e2':'#9fb0a6';x.fillStyle=lg(x,ox,oy,ox+24,oy+24,[sh(c,1.08),c,sh(c,.9)]);x.fillRect(ox,oy,24,24);x.strokeStyle=w?'rgba(150,150,160,.35)':'rgba(60,80,70,.4)';x.lineWidth=1;x.beginPath();let px=ox+R()*24,py=oy;x.moveTo(px,py);for(let k=0;k<3;k++){px+=(R()-.5)*10;py+=8;x.lineTo(px,py)}x.stroke();x.fillStyle='rgba(255,255,255,.35)';x.fillRect(ox+2,oy+2,9,1.5)}
   x.strokeStyle='rgba(60,60,70,.45)';x.lineWidth=1.2;x.strokeRect(.6,.6,T-1.2,T-1.2);x.beginPath();x.moveTo(24,0);x.lineTo(24,T);x.moveTo(0,24);x.lineTo(T,24);x.stroke()},
  113(x,R){x.clearRect(0,0,T,T);const FL=['#ff7aa8','#ffd84a','#ffffff','#b48cff','#ff9a5a'];x.lineCap='round';
   for(let i=0;i<7;i++){const px=8+i*5.3+(R()-.5)*2,h=10+R()*14;x.strokeStyle='#3f7a34';x.lineWidth=1.6;x.beginPath();x.moveTo(px,33);x.quadraticCurveTo(px+(R()-.5)*6,33-h*.5,px+(R()-.5)*4,33-h);x.stroke();x.fillStyle='#5aa848';x.beginPath();x.ellipse(px+3,33-h*.45,3.4,1.6,-.5,0,6.3);x.fill()}
   for(let i=0;i<6;i++){const px=9+i*6+(R()-.5)*3,py=12+R()*12,c=FL[R()*FL.length|0];x.fillStyle=c;for(let j=0;j<5;j++){const a=j*1.2566;x.beginPath();x.arc(px+Math.cos(a)*2.6,py+Math.sin(a)*2.6,2.2,0,6.3);x.fill()}x.fillStyle='#ffc94a';x.beginPath();x.arc(px,py,1.5,0,6.3);x.fill()}
   x.fillStyle='#2c1a0f';rc(x,3,31,T-6,17,2);x.fill();x.fillStyle=lg(x,0,32,0,47,['#b07a45','#8a5a32','#6b4528']);rc(x,4.5,32.5,T-9,14,1.5);x.fill();x.fillStyle='#4a3020';x.fillRect(5,32.5,T-10,3);x.fillStyle='rgba(255,230,190,.3)';x.fillRect(5,36,T-10,1.2);x.fillStyle='rgba(40,24,12,.45)';x.fillRect(16,37,1.2,9);x.fillRect(31,37,1.2,9)},
  114(x,R){x.fillStyle=lg(x,0,0,0,T,['#8a6a4a','#6b4a33']);x.fillRect(0,0,T,T);speck(x,R,'#3a2616',20,.5,3,12,T);x.fillStyle='#9a8c76';x.fillRect(0,0,T,12);
   for(let i=0;i<34;i++){const px=R()*T,py=R()*12,r=1.4+R()*2.4,c=['#cfc3ac','#b9ad96','#a39780','#e2d8c4','#8f8470'][R()*5|0];x.fillStyle=c;x.beginPath();x.ellipse(px,py+1,r,r*.75,R()*3,0,6.3);x.fill();x.fillStyle='rgba(255,255,255,.35)';x.fillRect(px-r*.4,py,r*.5,.9)}
   x.fillStyle='rgba(60,40,24,.35)';for(let i=0;i<8;i++){x.beginPath();x.arc(R()*T,12+R()*3,1.6+R()*1.6,0,6.3);x.fill()}x.fillStyle='rgba(255,250,235,.22)';x.fillRect(0,0,T,2)}};
 // ---- the house door, 1 tile wide x 2 tall (48x96), hinge on the left; o = how far it is open (0 closed .. 1 open). The leaf turns in
 // perspective (narrows towards the hinge and shows its edge), so the room behind (background wall) shows through the doorway.
 function paintDoor(x,o){const W2=T,H2=T*2,fx=4,ft=7,iw=W2-fx*2,lw=iw*(1-o*.8),sk=o*5;x.save();x.lineJoin='round';
  // doorway shadow (only visible while open) + frame
  x.fillStyle='rgba(10,6,4,'+(.18+o*.22)+')';x.fillRect(fx,ft,iw,H2-ft-2);
  const leaf=()=>{x.beginPath();x.moveTo(fx,ft);x.lineTo(fx+lw,ft+sk);x.lineTo(fx+lw,H2-2-sk*.6);x.lineTo(fx,H2-2);x.closePath()};
  if(lw>1){leaf();x.fillStyle='#2a180c';x.fill();x.save();leaf();x.clip();const sc=lw/iw;
   x.fillStyle=lg(x,fx,0,fx+lw,0,[mixc('#8a5a32',1.15-o*.4),mixc('#8a5a32',1-o*.35),mixc('#8a5a32',.82-o*.3)]);x.fillRect(fx,ft,lw,H2);
   x.strokeStyle='rgba(40,22,10,.55)';x.lineWidth=1.3;for(let i=1;i<3;i++){const px=fx+lw*i/3;x.beginPath();x.moveTo(px,ft);x.lineTo(px,H2);x.stroke()}
   x.strokeStyle='rgba(60,34,16,.35)';x.lineWidth=.8;for(let i=0;i<9;i++){const px=fx+lw*(i+.5)/9;x.beginPath();x.moveTo(px,ft+4+(i*13)%20);x.lineTo(px,H2-6-(i*7)%18);x.stroke()}
   for(const by of[ft+40,H2-16]){x.fillStyle='#4a2c16';x.fillRect(fx,by,lw,6);x.fillStyle='rgba(255,220,170,.22)';x.fillRect(fx,by,lw,1.2)}
   // little 4-pane window at the top
   const wx=fx+lw*.22,ww=lw*.56;if(ww>4){x.fillStyle='#2a180c';x.fillRect(wx-1.5,ft+7,ww+3,22);x.fillStyle=o>.5?'rgba(150,180,200,.6)':'#bfe3f5';x.fillRect(wx,ft+8.5,ww,19);x.fillStyle='rgba(255,255,255,.55)';x.fillRect(wx+ww*.15,ft+10,ww*.18,16);x.fillStyle='#4a2c16';x.fillRect(wx+ww/2-1,ft+8.5,2,19);x.fillRect(wx,ft+17,ww,2)}
   x.restore();leaf();x.strokeStyle='#1c1008';x.lineWidth=2;x.stroke();
   if(o>.05){x.fillStyle='#4a2c16';x.fillRect(fx+lw-1,ft+sk,Math.min(5,1+o*5),H2-2-ft-sk*1.6)}// the leaf's edge while it turns
   if(o<.6){const kx=fx+lw-6*(1-o),ky=ft+48;x.fillStyle='#f2c14e';x.beginPath();x.arc(kx,ky,2.6*(1-o*.5),0,6.3);x.fill();x.strokeStyle='#5a3a10';x.lineWidth=1;x.stroke();x.fillStyle='#fff3c0';x.fillRect(kx-1,ky-1.6,1.2,1.2)}
   x.fillStyle='#1c1008';for(const hy of[ft+12,H2-22])x.fillRect(fx-1,hy,4,7)}
  x.fillStyle='#2a180c';x.fillRect(0,0,fx,H2);x.fillRect(W2-fx,0,fx,H2);x.fillRect(0,0,W2,ft);x.fillStyle='#6b4528';x.fillRect(1,1,fx-2,H2-2);x.fillRect(W2-fx+1,1,fx-2,H2-2);x.fillRect(1,1,W2-2,ft-2);
  x.fillStyle='rgba(255,220,170,.25)';x.fillRect(1,1,W2-2,1.4);x.fillStyle='#4a4038';x.fillRect(0,H2-3,W2,3);x.restore()}
 function doorIcon(x){x.clearRect(0,0,T,T);x.save();x.translate(T/2-12,0);x.scale(.5,.5);paintDoor(x,0);x.restore()}
 const paint=(b,v)=>{const c=document.createElement('canvas');c.width=c.height=T;const x=c.getContext('2d');if(b==95||b==96){try{doorIcon(x)}catch(_){}return c}P[b](x,rr(b*991+v*173+3),v);if(SOLID6[b]&&b!=107)try{NB7.bevel(c,b)}catch(_){}return c};
 {const _bs=blockSprite;blockSprite=function(b,v){if(P[b]||b==95||b==96)return paint(b,v);return _bs(b,v)}}
 return{IDS,DECO,DEF,P,paintDoor,KEY,TILE,isKey:k=>TILE(k)>0}})();
