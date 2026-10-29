// ===== V7 showcase illustration: original procedural anime bust-up portrait (vector, scales crisply) =====
// Driven by the real character data: cel.ap (hair, eyes, outfit, accessory, cape, colours), level-gated wings, equipped weapon.
const SHOWART=(()=>{
 const OL='#1a1220',sh=(c,k)=>AC6.shade(c,k);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 // hair style params: len = side/back length below chin, flow = sideways drift, top = spikes, ahoge, tail
 const HST=[
  {len:40,flow:.35,top:5,th:46,fr:6,side:0,name:'swept'},   // 0 spiky swept
  {len:60,flow:.1,top:2,th:22,fr:6,side:1,tail:1},           // 1 long tail
  {len:150,flow:.05,top:0,th:0,fr:5,side:1,part:1},          // 2 side-parted
  {len:110,flow:.45,top:7,th:56,fr:7,side:1},                // 3 wild layered
  {len:30,flow:.1,top:3,th:28,fr:5,side:0,under:1},          // 4 undercut
  {len:330,flow:.9,top:3,th:30,fr:6,side:1,wind:1},          // 5 windblown long
  {len:28,flow:0,top:0,th:0,fr:6,side:0,crop:1},             // 6 short crop
  {len:175,flow:.08,top:1,th:14,fr:6,side:1}];               // 7 shoulder
 function info(A){A=A||cel.ap;return{skin:A.skinCol,hair:A.hairCol,eye:AP.eyeCol[A.eyeCol|0]||'#35c9c0',out:A.outCol,trim:A.trimCol,hs:A.hair|0,es:A.eyes|0,of:A.outfit|0,acc:A.acc|0,cape:A.cape|0}}
 function bez(g,pts){g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=6)g.bezierCurveTo(pts[i],pts[i+1],pts[i+2],pts[i+3],pts[i+4],pts[i+5])}

 // ---------- shared drawing helpers ----------
 const LW=1.7;
 // tapered ribbon along a cubic bezier: root width w, bulges slightly, tapers to a point. Returns path, fills + outlines.
 function ribbon(g,P,w,col,opt){opt=opt||{};const n=16,L=[],R=[];
  for(let i=0;i<=n;i++){const u=i/n,m=1-u;const x=m*m*m*P[0]+3*m*m*u*P[2]+3*m*u*u*P[4]+u*u*u*P[6],y=m*m*m*P[1]+3*m*m*u*P[3]+3*m*u*u*P[5]+u*u*u*P[7];
   const dx=3*m*m*(P[2]-P[0])+6*m*u*(P[4]-P[2])+3*u*u*(P[6]-P[4]),dy=3*m*m*(P[3]-P[1])+6*m*u*(P[5]-P[3])+3*u*u*(P[7]-P[5]),l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
   const wd=w*(opt.blunt?(1-.35*u):Math.pow(Math.sin(Math.PI*clamp(u*.9+.06,0,1)),.75)*(1-.45*u)+.02);L.push([x+nx*wd,y+ny*wd]);R.push([x-nx*wd,y-ny*wd])}
  g.beginPath();g.moveTo(L[0][0],L[0][1]);for(let i=1;i<=n;i++)g.lineTo(L[i][0],L[i][1]);for(let i=n;i>=0;i--)g.lineTo(R[i][0],R[i][1]);g.closePath();
  const gr=g.createLinearGradient(P[0],P[1],P[6],P[7]);gr.addColorStop(0,opt.c0||col);gr.addColorStop(1,opt.c1||col);g.fillStyle=gr;g.fill();
  if(opt.hl){g.save();g.clip();g.strokeStyle=opt.hl;g.lineWidth=Math.max(2,w*.34);g.globalAlpha=.7;g.beginPath();for(let i=2;i<n-3;i++){const q=L[i],r=R[i];const x=q[0]*.72+r[0]*.28,y=q[1]*.72+r[1]*.28;i==2?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();g.restore()}
  g.strokeStyle=OL;g.lineWidth=opt.lw||LW;g.lineJoin='round';g.stroke()}
 // ---------- face ----------
 const FACE=g=>{g.beginPath();g.moveTo(238,206);g.bezierCurveTo(238,160,272,140,310,140);g.bezierCurveTo(348,140,382,160,382,206);g.bezierCurveTo(382,250,364,290,338,314);g.bezierCurveTo(324,324,296,324,282,314);g.bezierCurveTo(256,290,238,250,238,206);g.closePath()};
 function eye(g,x,y,L,blink,side){const w=27,h=(L.es==3?29:L.es==1?22:L.es==2?23:26)*(blink?.1:1);
  g.save();g.translate(x,y);
  if(blink){g.strokeStyle=OL;g.lineWidth=3.6;g.lineCap='round';g.beginPath();g.moveTo(-w,-2);g.quadraticCurveTo(0,9,w,-3);g.stroke();g.restore();return}
  const top=()=>{g.moveTo(-w,2);g.bezierCurveTo(-w*.7,-h*1.1,w*.5,-h*1.25,w*1.02,-h*(L.es==2?.0:.32))};
  g.beginPath();top();g.bezierCurveTo(w*.9,h*.85,w*.1,h*1.05,-w*.2,h*1.0);g.bezierCurveTo(-w*.75,h*.92,-w*1.02,h*.5,-w,2);g.closePath();g.fillStyle='#f3f4fb';g.fill();
  g.save();g.clip();
  const cx=w*.04,ir=h*1.02,gr=g.createLinearGradient(0,-h,0,h*1.05);gr.addColorStop(0,sh(L.eye,-.7));gr.addColorStop(.35,sh(L.eye,-.25));gr.addColorStop(.75,L.eye);gr.addColorStop(1,sh(L.eye,.65));
  g.fillStyle=gr;g.beginPath();g.ellipse(cx,h*.02,ir*.9,ir,0,0,6.3);g.fill();
  g.fillStyle='#120a1a';g.beginPath();g.ellipse(cx,h*.05,ir*.34,ir*.5,0,0,6.3);g.fill();
  g.fillStyle='rgba(255,255,255,.96)';g.beginPath();g.ellipse(cx-ir*.28,-ir*.38,ir*.22,ir*.28,-.35,0,6.3);g.fill();g.beginPath();g.arc(cx+ir*.34,ir*.42,ir*.1,0,6.3);g.fill();
  g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(cx+ir*.1,ir*.62,ir*.5,ir*.18,0,0,6.3);g.fill();
  g.fillStyle='rgba(30,10,40,.35)';g.fillRect(-w*1.1,-h*1.3,w*2.3,h*.5); // upper lid shadow
  g.restore();
  g.lineCap='round';g.strokeStyle=OL;g.lineWidth=5.2;g.beginPath();top();g.stroke();
  g.lineWidth=2.4;g.beginPath();g.moveTo(w*1.0,-h*.3);g.quadraticCurveTo(w*1.2,-h*.45,w*1.34,-h*.62);g.stroke();
  g.beginPath();g.moveTo(-w*.95,-h*.1);g.quadraticCurveTo(-w*1.12,-h*.14,-w*1.22,-h*.3);g.stroke();
  g.restore()}
 function drawFace(g,L,t,blink){
  g.save();
  g.fillStyle=sh(L.skin,-.22);g.beginPath();g.moveTo(288,296);g.lineTo(286,376);g.bezierCurveTo(300,394,326,394,336,376);g.lineTo(334,296);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=LW;g.stroke();
  g.fillStyle='rgba(70,30,40,.28)';g.beginPath();g.moveTo(288,310);g.bezierCurveTo(300,340,326,340,334,310);g.lineTo(334,296);g.lineTo(288,296);g.closePath();g.fill();
  FACE(g);g.fillStyle=L.skin;g.fill();g.save();FACE(g);g.clip();
  const sg=g.createLinearGradient(236,0,386,0);sg.addColorStop(0,'rgba(255,255,255,.10)');sg.addColorStop(.6,'rgba(0,0,0,0)');sg.addColorStop(1,'rgba(120,60,70,.30)');g.fillStyle=sg;g.fillRect(230,130,160,210);
  g.fillStyle='rgba(110,60,66,.20)';g.beginPath();g.ellipse(310,166,112,34,0,0,6.3);g.fill();
  g.fillStyle='rgba(255,110,128,.30)';g.beginPath();g.ellipse(264,276,20,8,0,0,6.3);g.fill();g.beginPath();g.ellipse(356,276,20,8,0,0,6.3);g.fill();
  g.restore();FACE(g);g.strokeStyle=OL;g.lineWidth=LW+.4;g.stroke();
  g.strokeStyle=sh(L.hair,-.5);g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(248,208+(L.es==2?-5:0));g.quadraticCurveTo(272,196,298,206);g.stroke();g.beginPath();g.moveTo(322,206);g.quadraticCurveTo(348,196,372,208+(L.es==2?-5:0));g.stroke();
  eye(g,276,240,L,blink,1);g.save();g.translate(620,0);g.scale(-1,1);eye(g,276,240,L,blink,-1);g.restore();
  g.strokeStyle='rgba(130,70,70,.75)';g.lineWidth=2;g.beginPath();g.moveTo(308,266);g.quadraticCurveTo(311,271,315,268);g.stroke();
  g.strokeStyle='#7a2a36';g.lineWidth=3;g.beginPath();g.moveTo(297,292);g.quadraticCurveTo(310,299,323,292);g.stroke();g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=1.3;g.beginPath();g.moveTo(303,297);g.lineTo(317,297);g.stroke();
  g.restore()}
 // ---------- hair ----------
 function hairBack(g,L,t,H){const hc=L.hair,dark=sh(hc,-.5),mid=sh(hc,-.25),hl=sh(hc,.3),sw=Math.sin(t*1.2)*8*(.4+H.flow);
  const len=H.len;g.save();
  if(H.crop||H.under){g.beginPath();g.moveTo(240,196);g.bezierCurveTo(228,236,240,276,264,296);g.lineTo(356,296);g.bezierCurveTo(382,276,394,236,382,196);g.closePath();g.fillStyle=dark;g.fill();g.strokeStyle=OL;g.lineWidth=LW;g.stroke();g.restore();return}
  const fl=H.flow*70;
  g.beginPath();g.moveTo(240,176);g.bezierCurveTo(206,214,198,262+len*.3,206-fl*.2+sw,300+len);g.bezierCurveTo(250+sw,322+len,286,316+len*.9,310,328+len*.7);g.bezierCurveTo(334,316+len*.9,372,322+len,414+fl*.5+sw,300+len);g.bezierCurveTo(424+fl*.3,262+len*.3,414,214,380,176);g.closePath();
  const gr=g.createLinearGradient(0,150,0,330+len);gr.addColorStop(0,sh(hc,-.35));gr.addColorStop(1,dark);g.fillStyle=gr;g.fill();g.strokeStyle=OL;g.lineWidth=LW;g.stroke();
  g.save();g.clip();for(let i=0;i<5;i++){const x=216+i*46;ribbon(g,[x,190,x+6+sw*.2,250+len*.4,x-4+sw*.4,290+len*.7,x+sw*.7+(i-2)*6,310+len],17,mid,{c0:mid,c1:dark,lw:1.2})}g.restore();
  if(H.tail){ribbon(g,[386,170,470+sw,200,500+sw*1.4,320,470+sw*1.8,470],34,mid,{c0:mid,c1:dark,hl:hl,lw:LW});ribbon(g,[394,190,520+sw,260,520+sw*1.6,430,490+sw*2,560],26,dark,{hl:hl,lw:LW});ribbon(g,[390,206,455+sw,300,455+sw*1.7,420,430+sw*2.2,520],20,mid,{hl:hl,lw:LW})}
  if(H.wind){for(let i=0;i<8;i++){const y0=172+i*20,wob=Math.sin(t*1.5+i*.8)*20;ribbon(g,[380,y0,470,y0-10+wob,560+wob,y0+70+i*14,660+wob*1.5,y0+140+i*30],17-(i%3)*2,i%2?dark:mid,{c0:i%2?mid:hc,c1:dark,hl:hl,lw:LW})}}
  g.restore()}
 function hairFront(g,L,t,H){const hc=L.hair,dark=sh(hc,-.5),mid=sh(hc,-.18),lit=sh(hc,.38),sw=Math.sin(t*1.7)*3;g.save();
  // cap
  g.beginPath();g.moveTo(232,216);g.bezierCurveTo(222,150,262,108,312,108);g.bezierCurveTo(364,108,402,150,388,216);g.bezierCurveTo(386,188,372,160,352,150);g.bezierCurveTo(346,174,334,188,318,194);g.bezierCurveTo(302,178,282,178,268,192);g.bezierCurveTo(252,186,246,198,232,216);g.closePath();
  const cg=g.createLinearGradient(0,108,0,216);cg.addColorStop(0,hc);cg.addColorStop(1,sh(hc,-.3));g.fillStyle=cg;g.fill();g.strokeStyle=OL;g.lineWidth=LW;g.stroke();
  g.save();g.clip();g.fillStyle=lit;g.globalAlpha=.85;g.beginPath();g.ellipse(298,136,56,12,-.16,0,6.3);g.fill();g.globalAlpha=.55;g.fillStyle='#fff';g.beginPath();g.ellipse(290,134,30,4.5,-.16,0,6.3);g.fill();g.globalAlpha=1;g.restore();
  // bangs: wide curved locks from the crown
  const sd=H.part?-1:1,nb=H.fr;for(let i=0;i<nb;i++){const u=i/(nb-1),x=262+u*100,tipX=x+(u-.5)*-34+sd*14+sw,tipY=206+16*Math.sin(i*1.7+.4)+(H.part&&u<.5?44:0)+(i%2?12:0);
   ribbon(g,[318+(u-.5)*30,112,x+sd*18,150,x+(u-.5)*-14+sd*8,tipY-26,tipX,tipY],19,hc,{c0:hc,c1:mid,hl:lit,lw:LW})}
  // side locks
  if(H.side){for(const s of[-1,1]){const x=s<0?240:380,tipY=300+H.len*.5+(s>0?12:0),tipX=x+s*(H.flow*50+(H.wind?60:6))+Math.sin(t*1.4+s)*6;
   ribbon(g,[x,168,x+s*14,220,x+s*(8+H.flow*20),tipY-50,tipX,tipY],18,mid,{c0:hc,c1:dark,hl:lit,lw:LW});ribbon(g,[x-s*4,190,x-s*2,240,x+s*(2+H.flow*10),tipY-60,tipX-s*14,tipY-34],12,hc,{hl:lit,lw:1.4})}}
  else{for(const s of[-1,1]){const x=s<0?240:380;ribbon(g,[x,176,x-s*2,214,x-s*4,250,x-s*2,278],12,mid,{c0:hc,c1:dark,lw:LW})}}
  // top: swept tufts / ahoge
  if(H.top){for(let i=0;i<H.top;i++){const u=(i+.5)/H.top,x=262+u*100,dir=H.flow>.3?1:(i%2?1:-1),tx=x+dir*(24+H.th*.25)+Math.sin(t*1.8+i)*3,ty=106-H.th*(.55+.4*Math.sin(i*2.3+.7));ribbon(g,[x,128,x+dir*4,112,tx-dir*8,(ty+112)/2,tx,ty],12,hc,{c0:hc,c1:mid,hl:lit,lw:LW})}}
  g.restore()}
 function accHead(g,L,t){const a=L.acc;g.save();
  if(a==4){g.fillStyle=L.trim;g.beginPath();g.moveTo(234,174);g.bezierCurveTo(280,152,348,152,388,172);g.lineTo(390,190);g.bezierCurveTo(350,170,280,170,232,192);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=LW;g.stroke();ribbon(g,[386,176,420,186+Math.sin(t*3)*4,440,210,452,240+Math.sin(t*3+1)*6],12,L.out,{lw:LW})}
  if(a==2){for(const x of[234,386]){g.fillStyle=L.trim;g.beginPath();g.arc(x,264,5,0,6.3);g.fill();g.strokeStyle=OL;g.lineWidth=1.5;g.stroke();g.strokeStyle=L.trim;g.lineWidth=2.5;g.beginPath();g.moveTo(x,269);g.lineTo(x,284);g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(x,290,4.5,0,6.3);g.fill();g.strokeStyle=OL;g.lineWidth=1.4;g.stroke()}}
  if(a==3){g.fillStyle=sh(L.out,-.15);g.beginPath();g.moveTo(246,274);g.quadraticCurveTo(310,300,374,274);g.lineTo(366,320);g.quadraticCurveTo(310,336,254,320);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=LW;g.stroke()}
  g.restore()}
 // ---------- body / outfit ----------
 function body(g,L,t){const out=L.out,tr=L.trim,dk=sh(out,-.45),br=Math.sin(t*1.5)*3;
  g.save();g.translate(0,br);
  if(L.cape){g.fillStyle=sh(out,-.6);g.beginPath();g.moveTo(190,404);g.bezierCurveTo(150,520,130,700,80,900);g.lineTo(540,900);g.bezierCurveTo(490,700,470,520,430,404);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=LW;g.stroke()}
  g.beginPath();g.moveTo(206,434);g.bezierCurveTo(218,392,262,380,292,376);g.lineTo(330,376);g.bezierCurveTo(360,380,404,392,416,434);g.bezierCurveTo(430,520,440,640,448,900);g.lineTo(172,900);g.bezierCurveTo(180,640,192,520,206,434);g.closePath();
  const bg=g.createLinearGradient(190,0,430,0);bg.addColorStop(0,sh(out,.08));bg.addColorStop(.55,out);bg.addColorStop(1,sh(out,-.3));g.fillStyle=bg;g.fill();g.strokeStyle=OL;g.lineWidth=LW+.4;g.stroke();
  g.save();g.clip();
  g.strokeStyle='rgba(0,0,0,.16)';g.lineWidth=2;for(const [a,b,c,d] of[[240,470,262,600],[372,470,356,620],[300,640,310,780],[220,660,236,820],[400,640,390,820]]){g.beginPath();g.moveTo(a,b);g.quadraticCurveTo((a+c)/2+10,(b+d)/2,c,d);g.stroke()}
  g.fillStyle=tr;g.strokeStyle=tr;g.lineWidth=5;const of=L.of;
  if(of==0){g.beginPath();g.moveTo(310,380);g.lineTo(310,900);g.stroke();for(let i=0;i<6;i++){g.beginPath();g.arc(298,480+i*70,4.5,0,6.3);g.fill()}}
  if(of==1){g.fillRect(298,380,24,530);g.fillStyle='#fff';g.fillRect(304,470,12,64);g.fillRect(290,494,40,12);g.strokeStyle=OL;g.lineWidth=1.4;g.strokeRect(304,470,12,64)}
  if(of==2){g.lineWidth=7;g.beginPath();g.moveTo(250,386);g.lineTo(310,560);g.lineTo(370,386);g.stroke();g.lineWidth=3;g.beginPath();g.moveTo(206,650);g.quadraticCurveTo(310,700,416,650);g.stroke()}
  if(of==3){g.lineWidth=3;g.beginPath();g.moveTo(310,380);g.lineTo(310,900);g.stroke();g.fillRect(254,470,56,12);g.fillRect(310,540,56,12)}
  if(of==4){g.fillStyle='#f4f0e8';g.beginPath();g.moveTo(274,378);g.lineTo(310,470);g.lineTo(346,378);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=1.6;g.stroke();g.fillStyle=tr;g.beginPath();g.moveTo(310,420);g.lineTo(301,520);g.lineTo(310,548);g.lineTo(319,520);g.closePath();g.fill();g.stroke()}
  if(of==5){g.fillStyle='#f4f0e8';g.beginPath();g.moveTo(264,378);g.lineTo(310,520);g.lineTo(356,378);g.lineTo(342,378);g.lineTo(310,470);g.lineTo(278,378);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=1.6;g.stroke();g.strokeStyle=tr;g.lineWidth=6;g.beginPath();g.moveTo(190,570);g.quadraticCurveTo(310,610,432,570);g.stroke();g.lineWidth=14;g.strokeStyle=sh(tr,-.2);g.beginPath();g.moveTo(190,648);g.quadraticCurveTo(310,688,432,648);g.stroke()}
  g.restore();
  g.fillStyle=sh(out,.14);g.beginPath();g.moveTo(246,376);g.bezierCurveTo(262,396,288,406,310,408);g.bezierCurveTo(332,406,358,396,374,376);g.bezierCurveTo(356,368,334,364,310,364);g.bezierCurveTo(286,364,266,368,246,376);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=LW;g.stroke();
  if(L.acc==5){g.fillStyle='#e9e9f2';g.beginPath();g.moveTo(190,430);g.quadraticCurveTo(310,364,432,430);g.lineTo(424,456);g.quadraticCurveTo(310,402,198,456);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=LW;g.stroke();for(let i=0;i<14;i++){const x=198+i*16.5,y=438+Math.abs(Math.sin(i*1.3))*6;g.beginPath();g.moveTo(x-8,y);g.lineTo(x+1,y+16+Math.sin(i*2+t)*3);g.lineTo(x+9,y);g.closePath();g.fillStyle='#d7d7e4';g.fill();g.stroke()}}
  if(L.acc==1){g.fillStyle=L.trim;g.beginPath();g.moveTo(240,364);g.quadraticCurveTo(310,404,382,364);g.lineTo(378,392);g.quadraticCurveTo(310,430,244,392);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=LW;g.stroke();g.beginPath();g.moveTo(346,398);g.lineTo(352,474+Math.sin(t*2)*4);g.lineTo(372,466);g.lineTo(366,392);g.closePath();g.fill();g.stroke()}
  g.restore()}
 // ---------- worn equipment (front view, design space). Hats reuse GEAR7's vector art scaled onto the head; body pieces get a front-facing overlay ----------
 const GY='#ffd23f',GC='#fff3c9',GT='#36d6e0',GG='#f2c14e';
 function gstar(g,cx,cy,r1,r2,n,rot){g.beginPath();for(let i=0;i<n*2;i++){const a=(rot==null?-Math.PI/2:rot)+i*Math.PI/n,r=i%2?r2:r1;g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}g.closePath()}
 function gfill(g,c,lw){g.fillStyle=c;g.fill();g.strokeStyle=OL;g.lineWidth=lw||LW;g.stroke()}
 function gearBack(g,G,t){const b=G.body;
  if(b=='sparksuit'){const sw=Math.sin(t*2.4)*.06;g.save();g.translate(430,830);g.rotate(sw+.12);g.scale(1.15,1.15);g.beginPath();g.moveTo(-10,30);g.bezierCurveTo(60,20,118,-40,112,-140);g.bezierCurveTo(108,-200,80,-226,52,-232);g.lineTo(44,-196);g.bezierCurveTo(66,-188,80,-170,78,-140);g.bezierCurveTo(76,-70,40,-20,-20,-10);g.closePath();const gr=g.createLinearGradient(0,30,110,-230);gr.addColorStop(0,sh(GY,-.25));gr.addColorStop(1,GY);g.fillStyle=gr;g.fill();g.strokeStyle=OL;g.lineWidth=LW;g.stroke();
   g.save();g.globalCompositeOperation='lighter';const gl=g.createRadialGradient(50,-236,4,50,-236,70);gl.addColorStop(0,'rgba(127,246,255,.55)');gl.addColorStop(1,'rgba(127,246,255,0)');g.fillStyle=gl;g.fillRect(-30,-310,160,150);g.restore();
   gstar(g,50,-240,40,18,5,-1.75);gfill(g,GT);gstar(g,50,-240,20,9,5,-1.75);g.fillStyle='#bdfcff';g.fill();g.restore()}
  if(b=='sparksuit'&&G.hat!='sparkhood'){g.beginPath();g.moveTo(232,400);g.bezierCurveTo(226,340,270,322,310,322);g.bezierCurveTo(350,322,394,340,388,400);g.closePath();gfill(g,sh(GY,-.12));for(const s of[-1,1]){g.save();g.translate(310+s*62,336);g.rotate(s*.7);g.beginPath();g.moveTo(-14,6);g.bezierCurveTo(-18,-20,-10,-44,0,-48);g.bezierCurveTo(10,-44,18,-20,14,6);g.closePath();gfill(g,GY,1.4);g.restore()}}
  if(b=='hoodie'){g.beginPath();g.moveTo(236,404);g.bezierCurveTo(228,350,270,334,310,334);g.bezierCurveTo(350,334,392,350,384,404);g.closePath();gfill(g,sh('#8f8fa8',-.12))}}
 function gearBody(g,G,t,L){const b=G.body;if(!b||!WEAR[b])return;const br=Math.sin(t*1.5)*3;g.save();g.translate(0,br);g.lineJoin='round';
  if(b=='sparksuit'){g.beginPath();g.moveTo(310,540);g.bezierCurveTo(392,540,404,700,396,900);g.lineTo(224,900);g.bezierCurveTo(216,700,228,540,310,540);g.closePath();gfill(g,GC);gstar(g,310,690,38,16,5);gfill(g,GT,1.6);g.fillStyle='#e8ffff';g.beginPath();g.arc(300,676,6,0,6.3);g.fill();
   g.strokeStyle='rgba(120,80,10,.55)';g.lineWidth=3;g.beginPath();g.moveTo(310,400);g.lineTo(310,540);g.stroke();gstar(g,322,452,13,4,4,0);g.fillStyle=GT;g.fill();g.fillStyle=GC;for(let i=0;i<7;i++){g.beginPath();g.arc(262+i*16,382+Math.abs(i-3)*-2,9,0,Math.PI);g.fill()}for(const[a,c]of[[236,500],[390,470]]){gstar(g,a,c,12,3.4,4,0);g.fillStyle=GT;g.fill()}}
  else if(b=='plate'){const S='#c9d2e0';g.beginPath();g.moveTo(222,430);g.bezierCurveTo(260,400,360,400,398,430);g.lineTo(392,600);g.quadraticCurveTo(310,676,228,600);g.closePath();const gr=g.createLinearGradient(220,0,400,0);gr.addColorStop(0,'#f2f5fa');gr.addColorStop(.5,S);gr.addColorStop(1,sh(S,-.35));g.fillStyle=gr;g.fill();g.strokeStyle=OL;g.lineWidth=LW+.4;g.stroke();
   g.strokeStyle=sh(S,-.5);g.lineWidth=2;g.beginPath();g.moveTo(310,410);g.lineTo(310,640);g.stroke();g.strokeStyle='#e2b54a';g.lineWidth=5;g.beginPath();g.moveTo(230,600);g.quadraticCurveTo(310,670,390,600);g.stroke();for(let i=0;i<2;i++){g.beginPath();g.moveTo(232,650+i*44);g.quadraticCurveTo(310,690+i*44,388,650+i*44);g.lineTo(390,684+i*44);g.quadraticCurveTo(310,724+i*44,230,684+i*44);g.closePath();gfill(g,sh(S,-.1-i*.06))}
   g.save();g.globalCompositeOperation='lighter';const gl=g.createRadialGradient(310,500,2,310,500,50);gl.addColorStop(0,'rgba(127,230,255,.7)');gl.addColorStop(1,'rgba(127,230,255,0)');g.fillStyle=gl;g.fillRect(250,440,120,120);g.restore();g.beginPath();g.moveTo(310,480);g.lineTo(326,500);g.lineTo(310,520);g.lineTo(294,500);g.closePath();gfill(g,'#3fc4ff',2);
   for(const s of[-1,1]){g.save();g.translate(310+s*104,442);g.rotate(s*.3);g.beginPath();g.ellipse(0,22,54,26,0,0,6.3);gfill(g,sh(S,-.14));g.beginPath();g.ellipse(0,0,60,40,0,Math.PI,0);g.quadraticCurveTo(0,30,-60,0);gfill(g,S);g.strokeStyle='#e2b54a';g.lineWidth=5;g.beginPath();g.moveTo(-56,12);g.quadraticCurveTo(0,36,56,12);g.stroke();g.restore()}}
  else if(b=='robe'){g.strokeStyle=GG;g.lineWidth=8;g.beginPath();g.moveTo(262,382);g.lineTo(310,520);g.lineTo(358,382);g.stroke();g.fillStyle=sh(GG,-.1);g.fillRect(196,612,232,26);g.save();g.globalCompositeOperation='lighter';const gl=g.createRadialGradient(310,625,2,310,625,40);gl.addColorStop(0,'rgba(159,243,255,.8)');gl.addColorStop(1,'rgba(159,243,255,0)');g.fillStyle=gl;g.fillRect(260,575,100,100);g.restore();g.beginPath();g.moveTo(310,608);g.lineTo(324,625);g.lineTo(310,642);g.lineTo(296,625);g.closePath();gfill(g,'#5be0ff',2);for(const[a,c,r]of[[244,500,13],[376,540,11],[262,760,10],[372,800,12],[224,860,9]]){gstar(g,a,c,r,r*.3,4,0);g.fillStyle='#ffe9a8';g.fill()}}
  else if(b=='vest'){g.fillStyle='#e9e4dc';g.beginPath();g.moveTo(286,380);g.lineTo(334,380);g.lineTo(326,900);g.lineTo(294,900);g.closePath();g.fill();for(const s of[-1,1]){g.fillStyle='#e7f05a';g.fillRect(s<0?200:330,640,90,30);g.fillStyle='#dfe4ee';g.fillRect(s<0?200:330,650,90,10);g.beginPath();g.rect(s<0?226:344,470,52,58);gfill(g,sh('#b5774a',-.08),1.4)}}
  else if(b=='hoodie'){for(const s of[-1,1]){g.strokeStyle=OL;g.lineWidth=7;g.beginPath();g.moveTo(310+s*18,392);g.lineTo(310+s*24,500);g.stroke();g.strokeStyle='#f6f4fb';g.lineWidth=4;g.stroke()}g.beginPath();g.moveTo(240,700);g.lineTo(380,700);g.lineTo(400,820);g.lineTo(220,820);g.closePath();gfill(g,sh('#8f8fa8',-.08))}
  else if(b=='jacket'){g.fillStyle='#f2f0ea';g.beginPath();g.moveTo(280,380);g.lineTo(340,380);g.lineTo(330,900);g.lineTo(290,900);g.closePath();g.fill();for(const s of[-1,1]){g.beginPath();g.moveTo(310+s*30,380);g.lineTo(310+s*104,392);g.lineTo(310+s*62,470);g.lineTo(310+s*26,440);g.closePath();gfill(g,sh('#3f6fb0',.1));g.beginPath();g.rect(s<0?228:340,520,52,46);gfill(g,sh('#3f6fb0',.06),1.4)}}
  else if(b=='pajamas'){for(const s of[-1,1]){g.beginPath();g.moveTo(310,380);g.bezierCurveTo(310+s*20,430,310+s*70,430,310+s*80,384);g.closePath();gfill(g,'#f4f1ff')}g.fillStyle='#fff';for(let i=0;i<5;i++){g.beginPath();g.arc(318,480+i*80,7,0,6.3);g.fill()}for(const[a,c,r]of[[244,520,14],[380,600,12],[256,720,11],[370,780,13]]){gstar(g,a,c,r,r*.3,4,0);g.fillStyle='#ffe27a';g.fill()}}
  g.restore()}
 function gearHat(g,G,t){const h=G.hat;if(!h||!WEAR[h]||typeof GEAR7=='undefined'||!GEAR7.has(h,'hatF'))return;const cv=GEAR7.cover(h);g.save();g.translate(310,(cv?232:222)+Math.sin(t*1.5)*3);g.scale(cv?9.6:8.2,cv?8.6:8.2);try{GEAR7.front(g,h,t)}catch(_){}g.restore()}
 function hand(g,x,y,r,col){g.save();g.translate(x,y);g.rotate(r);g.fillStyle=col||'#2a2430';g.beginPath();g.moveTo(-26,-18);g.quadraticCurveTo(-30,0,-24,18);g.lineTo(18,22);g.quadraticCurveTo(30,0,18,-22);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=LW+.6;g.stroke();g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=2;for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(-16,i*11);g.lineTo(14,i*11);g.stroke()}g.restore()}
 // weapon art in local space: grip at origin, blade along +x
 function weaponLocal(g,id,t){const w=WPN[id],k=w.k,gc='rgb('+w.g.join(',')+')',lt=sh('#'+w.g.map(v=>('0'+Math.min(255,v).toString(16)).slice(-2)).join(''),.55),dk=sh('#'+w.g.map(v=>('0'+Math.min(255,v).toString(16)).slice(-2)).join(''),-.45);
  const steel=(x0,x1,wid)=>{const gr=g.createLinearGradient(0,-wid,0,wid);gr.addColorStop(0,'#f6f8ff');gr.addColorStop(.5,gc);gr.addColorStop(1,dk);return gr};
  g.lineJoin='round';g.strokeStyle=OL;g.lineWidth=LW+.6;
  const grip=(len,col)=>{g.fillStyle=col||'#2a2430';g.fillRect(-60,-7,len,14);g.strokeRect(-60,-7,len,14);g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=2;for(let i=-50;i<len-60;i+=12){g.beginPath();g.moveTo(i,-7);g.lineTo(i+6,7);g.stroke()}g.strokeStyle=OL;g.lineWidth=LW+.6};
  if(k=='sword'){grip(120,'#2a2430');g.fillStyle='#d8b86a';g.beginPath();g.arc(-64,0,10,0,6.3);g.fill();g.stroke();
   g.fillStyle='#d8b86a';g.beginPath();g.moveTo(60,-26);g.lineTo(74,-30);g.lineTo(74,30);g.lineTo(60,26);g.closePath();g.fill();g.stroke();
   g.fillStyle=steel(74,560,22);g.beginPath();g.moveTo(74,-17);g.lineTo(520,-15);g.quadraticCurveTo(590,-4,600,0);g.quadraticCurveTo(590,6,520,15);g.lineTo(74,17);g.closePath();g.fill();g.stroke();
   g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=2;g.beginPath();g.moveTo(90,-3);g.lineTo(540,-2);g.stroke();
   g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba('+w.g.join(',')+',.55)';g.lineWidth=8;g.shadowColor=gc;g.shadowBlur=18;g.beginPath();g.moveTo(80,0);g.lineTo(560,0);g.stroke();g.restore()}
  else if(k=='scythe'||k=='sickle'){const L=k=='sickle'?240:520;g.fillStyle='#3a3044';g.fillRect(-80,-6,L+80,12);g.strokeRect(-80,-6,L+80,12);g.fillStyle=steel(0,0,40);g.beginPath();g.moveTo(L-30,-10);g.bezierCurveTo(L+40,-120,L+150,-120,L+230,-40);g.bezierCurveTo(L+140,-92,L+60,-80,L,-3);g.closePath();g.fill();g.stroke()}
  else if(k=='hammer'){g.fillStyle='#3a3044';g.fillRect(-80,-8,440,16);g.strokeRect(-80,-8,440,16);g.fillStyle=steel(0,0,50);g.fillRect(330,-60,130,120);g.strokeRect(330,-60,130,120);g.fillStyle='rgba(255,255,255,.4)';g.fillRect(338,-52,114,10)}
  else if(k=='glaive'){g.fillStyle='#3a3044';g.fillRect(-80,-6,500,12);g.strokeRect(-80,-6,500,12);for(const sgn of[-1,1]){g.fillStyle=steel(0,0,40);g.beginPath();g.moveTo(400,0);g.bezierCurveTo(440,sgn*70,520,sgn*100,600,sgn*30);g.bezierCurveTo(520,sgn*58,450,sgn*38,410,sgn*6);g.closePath();g.fill();g.stroke()}}
  else if(k=='pan'){g.fillStyle='#2a2430';g.fillRect(-60,-8,230,16);g.strokeRect(-60,-8,230,16);g.fillStyle=steel(0,0,60);g.beginPath();g.arc(240,0,78,0,6.3);g.fill();g.stroke();g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(240,0,58,0,6.3);g.fill()}
  else{g.fillStyle='#3a3044';g.fillRect(-60,-6,500,12);g.strokeRect(-60,-6,500,12)}}
 function drawWeaponLarge(g,wpn,t,hc){if(!wpn||wpn=='fist')return;const bob=Math.sin(t*1.1)*.012;g.save();g.translate(446,800);g.rotate(-1.2+bob);g.scale(1,1);try{weaponLocal(g,wpn,t)}catch(e){}g.restore();
  hand(g,446,800,-1.2+bob,hc);hand(g,416,716,-1.2+bob,hc)}
 function wings(g,t,idx){if(idx<0)return;g.save();g.translate(310,470);g.scale(2.7,2.7);g.globalAlpha=.92;try{WingArt.draw(g,idx,0,0,1,t,0,0,0,1);WingArt.extras&&WingArt.extras(g,idx,0,0,t)}catch(_){}g.restore()}
 // ---------- compose ----------
 // draws the portrait in a 620x860 design space scaled to fit (cover) the given canvas height; anchor bottom, figure left-centered
 function draw(g,W,H,o){o=o||{};const L=o.look||info(o.ap),t=o.t||0,A=cel.ap,H0=HST[L.hs]||HST[0],wpnId=o.wpn===undefined?(typeof wp!='undefined'?wp:'fist'):o.wpn,s=H/760*(o.zoom||1),ox=(o.ox==null?W*.5:o.ox),blink=((t*.7)%4)>3.86;
  g.save();g.translate(ox-310*s,H-860*s+60*s+(o.dy||0));g.scale(s,s);
  // wings (only when unlocked at this level)
  const wg=o.wingIdx!=null?o.wingIdx:(()=>{const w=curWing(lvl);return w?WINGS.indexOf(w):-1})();
  if(wg>=0&&o.wings!==false)wings(g,t,wg,W,H);
  // equipment (only for the player's own active character; gallery presets pass no gear)
  const G=o.gear||{},GB=G.body&&WEAR[G.body]?G.body:'',cover=G.hat&&typeof GEAR7!='undefined'&&GEAR7.cover(G.hat),Hh=cover?Object.assign({},H0,{top:0}):H0,Lb=GB?Object.assign({},L,{out:WEAR[GB].c,of:-1,trim:GB=='sparksuit'?GC:L.trim,cape:GB=='sparksuit'?0:L.cape}):L;
  const gl=G.glove&&WEAR[G.glove]?WEAR[G.glove].c:GB=='sparksuit'?GC:undefined;
  hairBack(g,L,t,H0);
  if(GB)gearBack(g,G,t);
  body(g,Lb,t);if(GB)gearBody(g,G,t,Lb);
  g.save();g.translate(0,Math.sin(t*1.5)*3);
  drawFace(g,L,t,blink);accHead(g,L,t);hairFront(g,L,t,Hh);g.restore();gearHat(g,G,t);
  drawWeaponLarge(g,wpnId,t,gl);
  g.restore()}
 return{draw,info}})();

// shared appearance sanitiser (also used for saved character slots)
function sanAp(a){const n=(v,d,lo,hi)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v|0)):d},col=(v,d)=>/^#[0-9a-f]{6}$/i.test(v)?v:d;a=a||{};
 return{hair:n(a.hair,0,0,AP.hair.length-1),eyes:n(a.eyes,0,0,AP.eyes.length-1),outfit:n(a.outfit,0,0,AP.outfit.length-1),acc:n(a.acc,0,0,AP.acc.length-1),cape:n(a.cape,0,0,AP.cape.length-1),eyeCol:n(a.eyeCol,0,0,AP.eyeCol.length-1),hairCol:col(a.hairCol,'#3a2a3a'),skinCol:col(a.skinCol,'#f1c9a0'),outCol:col(a.outCol,'#2d3f6b'),trimCol:col(a.trimCol,'#d9b46a')}}
