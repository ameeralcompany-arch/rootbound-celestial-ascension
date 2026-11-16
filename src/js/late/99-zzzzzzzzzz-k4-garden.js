// ===== GARDEN1: the Lantern Gardens, a sunken garden level under Rootbound Town that roughly doubles the Plaza. The town street (row 64) stays
// exactly as it was; under it, rows 70-85 open into a calm, lantern-lit garden from x 24 to 232, reached by two Garden Steps arches on the street
// (in the gaps west of Stormwind Bakery and west of Bram's Longhouse). West to east:
//   Waterfall Nook (a hidden crystal alcove with a Moon Lily) | Willow Walk | West Steps | Lantern Stream under an arched bridge, with koi
//   | Flower Meadow | MOON PAVILION (the central meeting place, under Gate Square: marble terrace, fountain, moon gate, benches)
//   | Bamboo Grove | East Steps | Koi Pond with stepping stones | Starlight Terrace (a raised lookout with a telescope) | Wisteria Arbor
//   | Firefly Hollow (tucked behind a hedge).
// Glass skylights in the street let people above look down into it. The garden is rebuilt from code like the rest of the Plaza (never saved),
// reads as the surface (no mine music, no depth zone), and costs little: every sprite is cached per zoom bucket, everything off screen is skipped,
// fireflies and koi only move while the garden is in view.
try{const GARDEN1=window.GARDEN1=(()=>{
 const S=PLZ7.S,X0=23,X1=233,TOP=S+6,FLOOR=S+22,{floor,ceil,max,min,sin,cos,abs,round,PI,hypot}=Math;
 // ---- the ground line: the top solid row of each column (FLOOR unless shaped below)
 const fl=new Int16Array(W).fill(FLOOR);const WATER=[];const ZONES=[];
 const shape=(a,b,row)=>{for(let x=a;x<=b;x++)fl[x]=row};
 shape(114,115,FLOOR-1);shape(116,140,FLOOR-2);shape(141,142,FLOOR-1);   // the Moon Pavilion terrace: one step, then the marble floor
 shape(158,158,FLOOR-1);shape(159,159,FLOOR-2);shape(160,160,FLOOR-3);shape(161,170,FLOOR-4);shape(171,171,FLOOR-3);shape(172,172,FLOOR-2);shape(173,173,FLOOR-1);  // Starlight Terrace
 shape(219,219,FLOOR-1);                                 // the hedge before Firefly Hollow
 const STREAM={x0:60,x1:78,d:3},POOL={x0:29,x1:35,d:2},KOI={x0:175,x1:188,d:3};
 const BRIDGE={x0:60,x1:78},STONES=[178,182,186],SKY=[[32,33],[48,49],[97,98],[174,175],[207,208],[222,223]];
 const STEPS=[{id:'w',x:83,n:'West Garden Steps'},{id:'e',x:192,n:'East Garden Steps'}];
 const NAMES=[[24,'Waterfall Nook'],[38,'Willow Walk'],[59,'Lantern Stream'],[80,'Flower Meadow'],[113,'Moon Pavilion'],[144,'Bamboo Grove'],[157,'Starlight Terrace'],[174,'Koi Pond'],[197,'Wisteria Arbor'],[220,'Firefly Hollow']];
 const LILY={x:26,row:FLOOR};
 // ---- carving the garden (runs after the town is built, on every Plaza load)
 function set(x,y,b){if(x<0||x>=W||y<0||y>=H)return;const k=y*W+x;tiles[k]=b;hp[k]=b?BLK[b][2]:0;wl[k]=0}
 function carve(){
  for(let x=X0;x<=X1;x++)for(let y=TOP;y<FLOOR+6;y++){const g=fl[x];let b=0;if(x==X0||x==X1)b=3;else if(y<g)b=0;else if(y==g)b=x>=116&&x<=140?12:(x==219?15:2);else if(y<g+4)b=1;else b=3;set(x,y,b)}
  // water: the pool under the waterfall, the stream, the koi pond (bed of river stone)
  const pool=(o,top)=>{for(let x=o.x0;x<=o.x1;x++){for(let y=top;y<top+o.d;y++){set(x,y,0);wl[y*W+x]=8}set(x,top+o.d,55)}set(o.x0-1,top,2);set(o.x1+1,top,2)};
  pool(POOL,FLOOR);pool(STREAM,FLOOR);pool(KOI,FLOOR);
  // the arched bridge over the stream (wood), resting on the banks; its middle rises one row
  for(let x=BRIDGE.x0;x<=BRIDGE.x1;x++){const mid=abs(x-(BRIDGE.x0+BRIDGE.x1)/2)<4.5;set(x,mid?FLOOR-2:FLOOR-1,5)}
  // stepping stones across the koi pond
  for(const x of STONES)set(x,FLOOR,11);
  // skylights: glass through the street and the slab under it
  for(const[a,b]of SKY)for(let x=a;x<=b;x++)for(let y=S;y<TOP;y++)set(x,y,6)}
 try{for(const lx of[84,193]){const i=PLZ7.LAMPS.indexOf(lx);if(i>=0)PLZ7.LAMPS.splice(i,1)}}catch(_){}
 const inSpan=x=>x>X0*T&&x<X1*T;
 const inG=()=>{try{return cur=='plaza'&&P.y>(TOP-1)*T&&inSpan(P.x)}catch(_){return false}};
 // ---- in the garden the ground you stand on is the surface: no depth darkness, no mine music, no depth zone
 window.PSH=x=>{if(cur=='plaza'&&inG()){const c=x|0;if(c>X0&&c<X1)return fl[c]}return null};
 {const _g=gen;gen=function(){_g.apply(this,arguments);if(cur=='plaza'){try{carve()}catch(e){console.error('GARDEN1',e)}}}}
 // ---- sprites, cached per zoom bucket
 const SP=new Map();const OL='#2a2140';
 function spr(key,w,h,k,paint){const id=key+'|'+k;let c=SP.get(id);if(c)return c;c=document.createElement('canvas');c.width=max(1,ceil(w*k));c.height=max(1,ceil(h*k));const x=c.getContext('2d');x.scale(k,k);x.lineJoin=x.lineCap='round';try{paint(x,w,h)}catch(e){console.error('GARDEN1 art',key,e)}SP.set(id,c);if(SP.size>160)SP.delete(SP.keys().next().value);return c}
 let seed=1;const R=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;
 const line=(x,pts,lw,col)=>{x.beginPath();x.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)x.lineTo(pts[i],pts[i+1]);x.strokeStyle=OL;x.lineWidth=lw+2.2;x.stroke();x.strokeStyle=col;x.lineWidth=lw;x.stroke()};
 const blob=(x,cx,cy,r,col,ol)=>{x.beginPath();x.arc(cx,cy,r,0,6.284);if(ol){x.strokeStyle=OL;x.lineWidth=2.2;x.stroke()}x.fillStyle=col;x.fill()};
 const P_={
  lantern:(x,w,h)=>{x.fillStyle='rgba(10,8,30,.25)';x.beginPath();x.ellipse(w/2,h-3,17,4,0,0,6.3);x.fill();const s=(px,py,ww,hh,c)=>{x.fillStyle=c;x.beginPath();x.roundRect(px,py,ww,hh,3);x.fill();x.strokeStyle=OL;x.lineWidth=2;x.stroke()};
   s(w/2-14,h-12,28,10,'#8b879a');s(w/2-5,h-36,10,24,'#9a96aa');s(w/2-12,h-50,24,14,'#a8a4b8');x.fillStyle='#ffe2a8';x.fillRect(w/2-7,h-47,14,8);s(w/2-17,h-60,34,9,'#8b879a');x.fillStyle='#8b879a';x.beginPath();x.moveTo(w/2-12,h-60);x.quadraticCurveTo(w/2,h-74,w/2+12,h-60);x.fill();x.stroke()},
  cherry:(x,w,h)=>{seed=17;const bx=w/2,by=h;line(x,[bx-4,by,bx-8,by-60,bx-2,by-110,bx+10,by-140],11,'#6b4a3e');line(x,[bx-4,by-98,bx-40,by-128],6,'#6b4a3e');line(x,[bx+4,by-112,bx+44,by-140],6,'#6b4a3e');
   const cl=[];for(let i=0;i<26;i++){const a=R()*6.28,r=R()*70;cl.push([bx+cos(a)*r*1.3,by-150+sin(a)*r*.6,18+R()*16])}for(const[a,b,r]of cl)blob(x,a,b+5,r,'#d89bb4');for(const[a,b,r]of cl)blob(x,a,b,r*.92,'#f4c6d6');for(const[a,b,r]of cl)if(R()<.5)blob(x,a-r*.3,b-r*.35,r*.35,'#fde4ec')},
  bamboo:(x,w,h)=>{seed=29;for(let i=0;i<5;i++){const bx=12+i*16+R()*6,top=20+R()*60,c=['#6f9f64','#7fae6e','#5f8f58'][i%3];x.strokeStyle=OL;x.lineWidth=9;x.beginPath();x.moveTo(bx,h);x.lineTo(bx+2,top);x.stroke();x.strokeStyle=c;x.lineWidth=6.5;x.stroke();
    for(let y=h-30;y>top;y-=36){x.strokeStyle='#3e6a3e';x.lineWidth=2;x.beginPath();x.moveTo(bx-3.5,y);x.lineTo(bx+5.5,y);x.stroke();if(R()<.55){x.fillStyle='#8fc27a';x.beginPath();const s=R()<.5?-1:1;x.ellipse(bx+s*14,y-4,13,3.4,s*.5,0,6.3);x.fill()}}}},
  wisteria:(x,w,h)=>{seed=41;line(x,[0,6,w*.3,14,w*.65,8,w,16],4,'#5d4a3a');for(let i=0;i<9;i++){const bx=10+i*(w-20)/8+R()*6,len=70+R()*90;for(let j=0;j<len;j+=9){const r=6-j/len*3.5;blob(x,bx+sin(j*.12+i)*4,14+j,r+1.2,'#8f78c8');blob(x,bx+sin(j*.12+i)*4,14+j,r,j/len>.6?'#d2c4f2':'#b9a6e8')}}},
  moongate:(x,w,h)=>{const cx=w/2,cy=h*.5,R1=w*.36,R0=w*.28;// low wings either side
   for(const s of[-1,1]){x.fillStyle='#8d899e';x.beginPath();x.roundRect(s<0?6:w-62,h*.62,56,h*.38,4);x.fill();x.strokeStyle=OL;x.lineWidth=2.4;x.stroke();x.fillStyle='#5d5872';x.fillRect(s<0?2:w-66,h*.6,64,8);x.strokeRect(s<0?2:w-66,h*.6,64,8)}
   // the ring itself, with a soft inner shade and a few stones picked out
   x.beginPath();x.arc(cx,cy,R1,0,6.284);x.arc(cx,cy,R0,0,6.284,true);x.fillStyle='#a19db4';x.fill('evenodd');x.strokeStyle=OL;x.lineWidth=2.6;x.beginPath();x.arc(cx,cy,R1,0,6.284);x.stroke();x.beginPath();x.arc(cx,cy,R0,0,6.284);x.stroke();
   x.strokeStyle='rgba(60,50,90,.35)';x.lineWidth=1.4;for(let i=0;i<16;i++){const a=i/16*6.284;x.beginPath();x.moveTo(cx+cos(a)*R0,cy+sin(a)*R0);x.lineTo(cx+cos(a)*R1,cy+sin(a)*R1);x.stroke()}
   x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=3;x.beginPath();x.arc(cx,cy,(R0+R1)/2,PI*1.1,PI*1.6);x.stroke();
   // a small tiled cap on top
   x.fillStyle='#5d4a6a';x.beginPath();x.moveTo(cx-R1*.55,cy-R1+6);x.quadraticCurveTo(cx,cy-R1-22,cx+R1*.55,cy-R1+6);x.closePath();x.fill();x.strokeStyle=OL;x.lineWidth=2;x.stroke()},
  basin:(x,w,h)=>{x.fillStyle='rgba(10,8,30,.25)';x.beginPath();x.ellipse(w/2,h-3,w*.42,6,0,0,6.3);x.fill();x.fillStyle='#b8b4c8';x.beginPath();x.moveTo(8,h-34);x.quadraticCurveTo(w/2,h+4,w-8,h-34);x.closePath();x.fill();x.strokeStyle=OL;x.lineWidth=2.4;x.stroke();
   x.fillStyle='#7fc6e6';x.beginPath();x.ellipse(w/2,h-34,w/2-10,7,0,0,6.3);x.fill();x.stroke();x.fillStyle='#a8a4b8';x.fillRect(w/2-7,h-74,14,40);x.strokeRect(w/2-7,h-74,14,40);x.fillStyle='#c4c0d4';x.beginPath();x.ellipse(w/2,h-74,26,6,0,0,6.3);x.fill();x.stroke()},
  flowers:(x,w,h)=>{seed=53;for(let i=0;i<34;i++){const fx=6+R()*(w-12),fy=h-4-R()*20,c=['#ffd0e0','#f8e6a0','#c9b8ff','#ffffff','#ffb8a8'][i%5];line(x,[fx,h,fx+(R()-.5)*4,fy],1.4,'#5f8f58');blob(x,fx,fy,4+R()*2.5,c);blob(x,fx,fy,1.6,'#f2c45a')}},
  mush:(x,w,h)=>{seed=61;for(let i=0;i<4;i++){const mx=8+i*10+R()*4,mh=10+R()*12;x.fillStyle='#e8e2d8';x.fillRect(mx-2,h-mh,4,mh);x.fillStyle=i%2?'#9fe6ff':'#c8a8ff';x.beginPath();x.ellipse(mx,h-mh,7+R()*3,5,0,PI,0);x.fill();x.strokeStyle=OL;x.lineWidth=1.5;x.stroke()}},
  crystal:(x,w,h)=>{for(const[cx,hh,c]of[[w*.3,h*.7,'#8fe0ff'],[w*.55,h*.95,'#b8a8ff'],[w*.78,h*.55,'#8fe0ff']]){x.fillStyle=c;x.beginPath();x.moveTo(cx-9,h);x.lineTo(cx-6,h-hh*.8);x.lineTo(cx,h-hh);x.lineTo(cx+6,h-hh*.8);x.lineTo(cx+9,h);x.closePath();x.fill();x.strokeStyle=OL;x.lineWidth=2;x.stroke();x.fillStyle='rgba(255,255,255,.45)';x.fillRect(cx-2,h-hh*.8,2,hh*.6)}},
  telescope:(x,w,h)=>{line(x,[w/2,h,w/2-16,h-6],3,'#5d4a3a');line(x,[w/2,h,w/2+16,h-6],3,'#5d4a3a');line(x,[w/2,h,w/2,h-40],3,'#5d4a3a');x.save();x.translate(w/2,h-44);x.rotate(-.55);x.fillStyle='#c9a46a';x.beginPath();x.roundRect(-28,-6,56,12,4);x.fill();x.strokeStyle=OL;x.lineWidth=2;x.stroke();x.fillStyle='#8a6a3e';x.fillRect(22,-7,8,14);x.restore()},
  steps:(x,w,h)=>{// the street arch over a stair going down into the gardens
   x.fillStyle='#3a3350';x.beginPath();x.roundRect(10,20,w-20,h-20,[w/2-10,w/2-10,0,0]);x.fill();for(let i=0;i<5;i++){x.fillStyle=i%2?'#7d7890':'#8d899e';x.fillRect(18+i*4,h-14-i*12,w-36-i*8,10)}
   x.strokeStyle=OL;x.lineWidth=3;x.beginPath();x.moveTo(6,h);x.lineTo(6,40);x.arc(w/2,40,w/2-6,PI,0);x.lineTo(w-6,h);x.stroke();x.strokeStyle='#a9a5ba';x.lineWidth=7;x.stroke();
   x.font='800 11px '+FONT;x.textAlign='center';x.textBaseline='middle';const tx='LANTERN GARDENS',tw=x.measureText(tx).width+18;x.fillStyle='#6a4528';x.beginPath();x.roundRect(w/2-tw/2,-2,tw,22,5);x.fill();x.strokeStyle=OL;x.lineWidth=2;x.stroke();x.fillStyle='#fff3c4';x.fillText(tx,w/2,9)},
  stair:(x,w,h)=>{// in the garden: steps rising into the opening under the street
   for(let i=0;i<8;i++){x.fillStyle=i%2?'#7d7890':'#8d899e';x.fillRect(4+i*(w-8)/9,h-10-i*(h-20)/8,(w-8)/9+2,10+i*(h-20)/8)}x.strokeStyle=OL;x.lineWidth=2;x.strokeRect(4,6,w-8,h-6);x.fillStyle='rgba(255,236,190,.28)';x.fillRect(w-26,0,22,h*.4)},
  hedge:(x,w,h)=>{seed=71;for(let i=0;i<10;i++)blob(x,8+R()*(w-16),h-10-R()*14,10+R()*6,i%2?'#4f8a52':'#5f9a5f',1)},
  lily:(x,w,h)=>{seed=83;for(let i=0;i<5;i++){const lx=10+i*(w-20)/4+R()*8;x.fillStyle='#5f9a5f';x.beginPath();x.ellipse(lx,h/2,12,4.5,0,.3,6.0);x.lineTo(lx,h/2);x.fill();if(i%2==0)blob(x,lx+3,h/2-3,3.2,'#ffd6e6')}},
  string:(x,w,h)=>{x.strokeStyle='#4a3a30';x.lineWidth=1.6;x.beginPath();x.moveTo(0,6);x.quadraticCurveTo(w/2,h-10,w,6);x.stroke();for(let i=1;i<9;i++){const u=i/9,lx=u*w,ly=6+(h-16)*4*u*(1-u)*.98+8;x.fillStyle=i%2?'#ffb38a':'#ffd98a';x.beginPath();x.ellipse(lx,ly,6,8,0,0,6.3);x.fill();x.strokeStyle=OL;x.lineWidth=1.4;x.stroke()}}};
 // ---- what stands where (tile x, art key, art size in px, ground row offset; light: a lantern glow at night)
 const D=[];const put=(x,k,w,h,o)=>D.push(Object.assign({x,k,w,h},o||{}));
 put(26,'crystal',70,70);put(24.6,'mush',50,32);put(42,'cherry',220,240,{light:0});put(52,'lantern',40,74,{light:1});put(56.5,'flowers',110,34);
 put(80.6,'lantern',40,74,{light:1});put(88,'flowers',130,34);put(96,'cherry',220,240);put(103,'lantern',40,74,{light:1});put(108,'flowers',150,34);
 put(128,'moongate',300,300,{dy:-0});put(128,'basin',150,110,{fountain:1});put(118,'lantern',40,74,{light:1});put(138,'lantern',40,74,{light:1});
 put(147,'bamboo',100,330);put(152,'bamboo',100,300);put(155.5,'lantern',40,74,{light:1});
 put(166,'telescope',70,92);put(169,'lantern',40,74,{light:1});put(195.6,'lantern',40,74,{light:1});put(203,'cherry',220,240);put(224,'mush',50,32);put(229,'mush',50,32);put(226,'crystal',70,60);
 for(const s of STEPS)put(s.x+.5,'stair',3*T,5*T,{stair:s.id});
 const HANG=[[44,'wisteria',190,190],[69,'string',400,70],[132,'string',380,70],[206,'wisteria',220,210],[212,'wisteria',160,170],[230,'wisteria',120,150]];
 const STREETART=STEPS.map(s=>({x:s.x+.5,id:s.id}));
 // ---- benches: real seats (SUMMER9), on the pavilion and along the paths
 const BENCH=[[119,120,FLOOR-2],[136,137,FLOOR-2],[45,46,FLOOR],[164,165,FLOOR-4],[209,210,FLOOR]];
 function addSeats(){try{if(cur!='plaza'||typeof SUMMER9=='undefined')return;const L=SUMMER9.LAND,Se=SUMMER9.SEATS;for(const[c0,c1,row]of BENCH){if(L.some(i=>i.gdn&&i.c0==c0))continue;const it={k:'bench',c0,c1,gy:row*T,x:(c0+c1+1)*T/2,f:1,v:0,z:1,gdn:1};L.push(it);Se.push({it,n:'Bench',sx:it.x,fy:it.gy,hy:it.gy-15,f:1,ex:it.x,ey:it.gy,lean:0})}}catch(_){}}
 setInterval(()=>{try{if(entered&&cur=='plaza')addSeats()}catch(_){}},2000);
 // ---- life: fireflies and koi move only while the garden is on screen
 const FF=[];for(let i=0;i<34;i++)FF.push({x:(i<20?214+Math.random()*18:60+Math.random()*18)*T,y:(FLOOR-1-Math.random()*8)*T,a:Math.random()*6.28,s:.6+Math.random()*.6});
 const FISH=[{o:STREAM,u:.2,v:.05,c:'#ff9a5a'},{o:STREAM,u:.7,v:-.04,c:'#fff0e0'},{o:KOI,u:.3,v:.04,c:'#ff7a4a'},{o:KOI,u:.8,v:-.05,c:'#ffd27a'}];
 // ---- drawing (world space, behind blocks and players): backdrop, light shafts, the art, water life; the two street arches
 let lastT=performance.now();
 function view(){const vw=cv.width/ZM,vh=cv.height/ZM;return{L:cam.x-200,Rr:cam.x+vw+200,Tp:cam.y-200,Bt:cam.y+vh+200,vw,vh}}
 function backdrop(v,t,nt){const y0=(TOP-.5)*T,y1=(FLOOR+1)*T;if(y1<v.Tp||y0>v.Bt)return;const x0=max(v.L,X0*T),x1=min(v.Rr,X1*T);if(x1<=x0)return;
  const dk=min(1,nt||0),gr=g.createLinearGradient(0,y0-cam.y,0,y1-cam.y);gr.addColorStop(0,dk>.5?'#141a33':'#2a3556');gr.addColorStop(.55,dk>.5?'#182a3e':'#2e5566');gr.addColorStop(1,dk>.5?'#1d3434':'#3f6f62');g.fillStyle=gr;g.fillRect(x0-cam.x,y0-cam.y,x1-x0,y1-y0);
  // soft rock arches far away (parallax), then lantern bokeh
  const k=min(.75,HOUSE7.bucket(Math.hypot(g.getTransform().a,g.getTransform().b))),strip=spr('strip'+(dk>.5?'n':'d'),960,FLOOR*T-TOP*T+T,k,(x,w,h)=>{seed=97;x.fillStyle=dk>.5?'rgba(20,24,48,.55)':'rgba(40,58,88,.45)';for(let i=0;i<5;i++){const cx=i*200+60,r=110+R()*60;x.beginPath();x.moveTo(cx-r,h);x.lineTo(cx-r,h-r*.9);x.arc(cx,h-r*.9,r,PI,0);x.lineTo(cx+r,h);x.closePath();x.fill()}
   for(let i=0;i<26;i++){x.fillStyle='rgba(255,214,150,'+(.05+R()*.1)+')';x.beginPath();x.arc(R()*w,R()*h*.8,4+R()*10,0,6.3);x.fill()}});
  const off=((cam.x*.35)%960+960)%960;g.save();g.beginPath();g.rect(x0-cam.x,y0-cam.y,x1-x0,y1-y0);g.clip();for(let sx=x0-cam.x-off-960;sx<x1-cam.x;sx+=960)g.drawImage(strip,sx,TOP*T-cam.y-T*.5,960,FLOOR*T-TOP*T+T);
  // daylight through the skylights
  if(dk<.6){g.globalCompositeOperation='lighter';for(const[a,b]of SKY){const lx=a*T,lw=(b-a+1)*T;if(lx+lw<v.L||lx>v.Rr)continue;const lg=g.createLinearGradient(0,TOP*T-cam.y,0,FLOOR*T-cam.y);lg.addColorStop(0,'rgba(255,244,214,'+(.22*(1-dk))+')');lg.addColorStop(1,'rgba(255,244,214,0)');g.fillStyle=lg;g.beginPath();g.moveTo(lx-cam.x,TOP*T-cam.y);g.lineTo(lx+lw-cam.x,TOP*T-cam.y);g.lineTo(lx+lw+40-cam.x,FLOOR*T-cam.y);g.lineTo(lx-40-cam.x,FLOOR*T-cam.y);g.closePath();g.fill()}g.globalCompositeOperation='source-over'}
  g.restore()}
 function waterfall(t,v){const x=31*T,y0=TOP*T,y1=FLOOR*T+T*.3,w=3*T;if(x+w<v.L||x>v.Rr||y1<v.Tp||y0>v.Bt)return;g.save();g.globalAlpha=.78;const gr=g.createLinearGradient(x-cam.x,0,x+w-cam.x,0);gr.addColorStop(0,'rgba(170,220,245,.25)');gr.addColorStop(.5,'rgba(220,244,255,.75)');gr.addColorStop(1,'rgba(170,220,245,.25)');g.fillStyle=gr;g.fillRect(x-cam.x,y0-cam.y,w,y1-y0);
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2;for(let i=0;i<7;i++){const lx=x+8+i*(w-16)/6,ph=(t*260+i*97)%(y1-y0);g.beginPath();g.moveTo(lx-cam.x,y0+ph-cam.y);g.lineTo(lx-cam.x,y0+ph+34-cam.y);g.stroke()}
  g.globalAlpha=.55;g.fillStyle='#ffffff';for(let i=0;i<6;i++){const a=t*1.7+i;g.beginPath();g.arc(x+w/2+sin(a*1.3)*w*.45-cam.x,y1-6+sin(a)*4-cam.y,10+sin(a*2)*4,0,6.3);g.fill()}g.restore()}
 function fountain(t,cx,cy){g.save();g.strokeStyle='rgba(200,236,255,.8)';g.lineWidth=2.5;for(const s of[-1,1])for(let i=0;i<3;i++){const ph=(t*1.4+i*.33)%1;g.globalAlpha=1-ph;g.beginPath();g.moveTo(cx,cy-74);g.quadraticCurveTo(cx+s*(14+i*8),cy-110+ph*6,cx+s*(26+i*12),cy-38);g.stroke()}g.restore()}
 function life(dt,t,v){// fireflies drift; koi glide
  const nt=typeof night=='number'?night:0;g.save();g.globalCompositeOperation='lighter';for(const f of FF){f.a+=dt*f.s;f.x+=cos(f.a*1.3)*dt*14;f.y+=sin(f.a)*dt*10;if(f.x<v.L||f.x>v.Rr||f.y<v.Tp||f.y>v.Bt)continue;const b=.35+.45*(.5+.5*sin(t*3+f.a*4));g.fillStyle='rgba(255,236,140,'+(b*(.45+nt*.55)).toFixed(3)+')';g.beginPath();g.arc(f.x-cam.x,f.y-cam.y,2.6,0,6.3);g.fill()}
  g.restore();for(const k of FISH){k.u+=k.v*dt;if(k.u>.95||k.u<.05)k.v=-k.v;const x=(k.o.x0+(k.o.x1-k.o.x0)*k.u)*T,y=(FLOOR+1.4+sin(t+k.u*9)*.4)*T;if(x<v.L||x>v.Rr||y<v.Tp||y>v.Bt)continue;g.save();g.translate(x-cam.x,y-cam.y);g.scale(k.v>0?1:-1,1);g.fillStyle=k.c;g.globalAlpha=.85;g.beginPath();g.ellipse(0,0,14,5.5,0,0,6.3);g.fill();g.beginPath();g.moveTo(-12,0);g.lineTo(-22,-6+sin(t*8)*2);g.lineTo(-22,6+sin(t*8)*2);g.closePath();g.fill();g.restore()}}
 function back(now){const t=now/1000,dt=min(.05,(now-lastT)/1000);lastT=now;const v=view(),nt=typeof night=='number'?night:0,m=g.getTransform(),k=HOUSE7.bucket(Math.hypot(m.a,m.b));
  // the two street arches (always cheap: two cached sprites)
  for(const s of STREETART){const px=s.x*T,w=3.2*T,h=3.4*T;if(px+w<v.L||px-w>v.Rr||S*T<v.Tp||S*T-h>v.Bt)continue;g.drawImage(spr('steps',w,h,k,P_.steps),px-w/2-cam.x,S*T-h-cam.y,w,h)}
  const gy0=TOP*T,gy1=(FLOOR+4)*T;if(gy1<v.Tp||gy0>v.Bt)return;
  backdrop(v,t,nt);waterfall(t,v);
  for(const[x0,kk,w,h]of HANG){const px=x0*T;if(px+w<v.L||px-w>v.Rr)continue;g.drawImage(spr(kk,w,h,k,P_[kk]),px-w/2-cam.x,TOP*T-cam.y,w,h)}
  for(const d of D){const col=floor(d.x),gyRow=d.stair?FLOOR:fl[col]||FLOOR,px=d.x*T,py=gyRow*T+(d.dy||0);if(px+d.w<v.L||px-d.w>v.Rr||py<v.Tp||py-d.h>v.Bt)continue;g.drawImage(spr(d.k,d.w,d.h,k,P_[d.k]),px-d.w/2-cam.x,py-d.h-cam.y,d.w,d.h);
   if(d.fountain)fountain(t,px-cam.x,py-cam.y);if(d.light&&nt>.25){try{lampL.push(px-cam.x,py-48-cam.y)}catch(_){}}}
  for(const x of[STREAM,KOI])for(const lx of[x.x0+3,x.x1-6]){const px=lx*T;if(px<v.L||px>v.Rr)continue;g.drawImage(spr('lily',130,24,k,P_.lily),px-cam.x,FLOOR*T+4-cam.y,130,24)}
  // the Moon Lily in the hidden alcove: a bud, open while you are near
  {const px=LILY.x*T+T/2,py=LILY.row*T;if(px>v.L&&px<v.Rr){const near=hypot(P.x-px,P.y+P.h-py)<T*3,o=lilyOpen=lilyOpen+(((near?1:0))-lilyOpen)*min(1,dt*3);g.save();g.translate(px-cam.x,py-cam.y);for(let i=0;i<6;i++){g.save();g.rotate(-PI/2+(i-2.5)*(.28+.22*o));g.fillStyle=i%2?'#e8f4ff':'#f6f0ff';g.beginPath();g.ellipse(0,-10-o*4,4+o*2,12+o*4,0,0,6.3);g.fill();g.restore()}if(o>.2){g.globalCompositeOperation='lighter';g.fillStyle='rgba(180,220,255,'+(o*.35)+')';g.beginPath();g.arc(0,-14,22,0,6.3);g.fill()}g.restore()}}
  life(dt,t,v)}
 let lilyOpen=0;
 {const _td=TILE7.draw;TILE7.draw=function(){if(cur=='plaza'&&!creatorOn)try{back(performance.now())}catch(e){if(!back.e){back.e=1;console.error('GARDEN1',e)}}return _td.apply(this,arguments)}}
 // ---- the Garden Steps: press the Use key at an arch on the street to go down, at the stair in the garden to come back up
 const useKey=()=>window.DG&&DG.keyName?DG.keyName('use'):'F';
 function nearStep(){if(cur!='plaza')return null;for(const s of STEPS){const px=(s.x+.5)*T;if(abs(P.x-px)<T*1.6){if(abs(P.y+P.h-S*T)<T*1.2)return{s,dir:'down'};if(inG()&&abs(P.y+P.h-FLOOR*T)<T*1.4)return{s,dir:'up'}}}return null}
 let fadeEl=null,busy=0;
 function go(n){if(busy)return;busy=1;if(!fadeEl){fadeEl=document.createElement('div');fadeEl.id='gdfade';fadeEl.style.cssText='position:fixed;inset:0;background:#0b0a16;opacity:0;pointer-events:none;z-index:8600;transition:opacity .22s ease';document.body.appendChild(fadeEl)}
  try{snd(392,.12,'sine',.03,.9);setTimeout(()=>{try{snd(523,.14,'sine',.025,.9)}catch(_){}},90)}catch(_){}fadeEl.style.opacity='1';
  setTimeout(()=>{try{const px=(n.s.x+.5)*T;P.x=px;P.vx=P.vy=0;if(n.dir=='down'){P.y=FLOOR*T-P.h-1}else{P.y=S*T-P.h-1}P.g=true;cam.x=P.x-cv.width/ZM/2;cam.y=P.y-cv.height/ZM/2;say(n.dir=='down'?'The Lantern Gardens':'Rootbound Town')}catch(_){}fadeEl.style.opacity='0';setTimeout(()=>{busy=0},260)},230)}
 function lily(){const px=LILY.x*T+T/2;return cur=='plaza'&&inG()&&abs(P.x-px)<T*1.6&&abs(P.y+P.h-LILY.row*T)<T*1.3}
 let lilyMsg=0;const LILYT=['The Moon Lily opens, just for you.','A tiny moth settles on your shoulder, then drifts away.','The waterfall hums a note only you can hear.','You feel lucky. That is enough.'];
 if(typeof interact=='function'){const _i=interact;interact=function(){try{if(!dlgOpen&&menuEl.style.display=='none'){const n=nearStep();if(n){go(n);return}if(lily()){lilyMsg=(lilyMsg+1)%LILYT.length;say(LILYT[lilyMsg]);api.lastMsg=LILYT[lilyMsg];try{snd(880,.18,'sine',.02,1.2);setTimeout(()=>{try{snd(1175,.22,'sine',.018,1.2)}catch(_){}},120)}catch(_){}return}}}catch(_){}return _i.apply(this,arguments)}}
 setInterval(()=>{try{const pr=document.getElementById('prompt');if(!pr)return;const n=entered&&!dlgOpen&&menuEl.style.display=='none'?nearStep():null;let t='';if(n)t='Press '+useKey()+(n.dir=='down'?' to go down to the Lantern Gardens':' to go back up to town');else if(entered&&lily())t='Press '+useKey()+' to touch the Moon Lily';
  if(t){pr.style.display='block';if(pr.textContent!=t)pr.textContent=t;pr.dataset.gdn='1'}else if(pr.dataset.gdn){pr.dataset.gdn='';pr.style.display='none'}}catch(_){}},200);
 // ---- a little name card when you walk into a part of the garden
 let lastZone='';setInterval(()=>{try{if(!entered||!inG())return;const c=P.x/T;let z='';for(const[x,n]of NAMES)if(c>=x)z=n;if(z&&z!==lastZone){lastZone=z;say(z)}}catch(_){}},700);
 // the town's camera looks up toward the rooftops; under the street it looks straight ahead
 {const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{if(inG())window.CAMUP=0}catch(_){}return r}}
 if(typeof cur!='undefined'&&cur=='plaza'){try{carve()}catch(e){console.error('GARDEN1',e)}}
 const api={S,X0,X1,TOP,FLOOR,fl,STEPS,STREAM,KOI,POOL,BRIDGE,STONES,SKY,BENCH,LILY,NAMES,carve,inG,nearStep,go,addSeats,lastMsg:'',get busy(){return busy}};return api})()}catch(e){console.error('GARDEN1',e)}
