// ===== Reaper evolution cinematic: Nightshade Reaper. A crow field at the last hour of the night, a broken clock tower, nightshade in the grass; a clock-face sigil whose hands close on twelve; feather mantle, hood and a cape of crow feathers;
// The Final Hour: a wall of crows, one crossing cut through it, the flock bursting into feathers a beat later, and a last reap that strikes the hour. =====
try{(()=>{const F=()=>FILM1,sin=Math.sin,cos=Math.cos,TAU=6.2832,PI=Math.PI;
 const VI='#b48aff',DEEP='#0a0614',PALE='#e8dcff',HOT='#e04aff',INK='#07040f';
 const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,ease=k=>1-Math.pow(1-cl(k,0,1),3),ez=k=>{k=cl(k,0,1);return k*k*(3-2*k)};
 const SR=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 // ---------- a crow silhouette facing +x (d=-1 faces left), wings at phase ph: three small fills, cheap enough for a flock
 function crow(y,X,Y,s,ph,d,a,col,eye){const v=sin(ph);y.save();y.translate(X,Y);y.rotate(a||0);y.scale(s*(d||1),s);y.fillStyle=col||INK;
  for(const[sc,ox]of[[.78,9],[1,0]]){const w=v*sc,tx=-22-12*(1-Math.abs(w))+ox,ty=-76*w-3;y.beginPath();y.moveTo(18+ox,-6);y.quadraticCurveTo(18+ox,-52*w,tx+18,ty);for(let j=0;j<4;j++){y.lineTo(tx-j*9,ty+j*12*w);y.lineTo(tx-j*9+5,ty+j*12*w+10*w)}y.quadraticCurveTo(-30+ox,-22*w,-14+ox,-2);y.closePath();y.fill()}
  y.beginPath();y.moveTo(54,-1);y.quadraticCurveTo(42,-9,32,-12);y.quadraticCurveTo(18,-15,4,-9);y.quadraticCurveTo(-14,-6,-30,-4);y.lineTo(-62,-11);y.lineTo(-57,-2);y.lineTo(-64,7);y.lineTo(-30,6);y.quadraticCurveTo(-6,14,14,10);y.quadraticCurveTo(32,6,42,2);y.closePath();y.fill();
  if(eye){y.fillStyle=eye;y.fillRect(30,-9,5,4)}y.restore()}
 // one feather, a single fill
 function plume(y,X,Y,len,a,col){const c=cos(a),s=sin(a),w=len*.2;const nx=-s*w,ny=c*w;y.beginPath();y.moveTo(X,Y);y.quadraticCurveTo(X+c*len*.45+nx,Y+s*len*.45+ny,X+c*len,Y+s*len);y.quadraticCurveTo(X+c*len*.5-nx*.8,Y+s*len*.5-ny*.8,X,Y);y.fillStyle=col;y.fill()}
 // ---------- the outfit (on top of FILM1's own mantle, hood, tails and gauntlet flags)
 const dress={
  // p3: a cape of crow feathers, ragged at the hem, that lifts in the wind
  back(g,J){const k=J.k.p3||0;if(k<=0)return;const e=ease(k),t=J.t,w=J.wnd,A=J.rot(-130,-380),B=J.rot(100,-380),len=lerp(200,1000,e),sw=sin(t*1.7)*26+w*620+120*e;
   const bx=A[0]-90-sw,by=A[1]+len,p=new Path2D();p.moveTo(A[0],A[1]);p.bezierCurveTo(A[0]-90-sw*.2,A[1]+len*.3,bx-40,by-len*.3,bx-60,by);
   const n=9,span=lerp(220,520,e);for(let i=1;i<=n;i++){const u=i/n,X=bx-60+u*span,Y=by-u*u*120*e+(i%2?60:0)*e;p.lineTo(X-span/n*.5,Y+38*e);p.lineTo(X,Y)}
   p.bezierCurveTo(bx+span*.9,by-len*.5,B[0]+30-sw*.1,B[1]+len*.3,B[0],B[1]);p.closePath();
   const G=g.createLinearGradient(A[0],A[1],bx,by);G.addColorStop(0,'#3a2a7a');G.addColorStop(.6,'#22164e');G.addColorStop(1,'#0e0822');g.fillStyle=G;g.fill(p);g.strokeStyle='rgba(232,220,255,.9)';g.lineWidth=6.5;g.stroke(p);
   g.save();g.clip(p);g.lineWidth=2.6;for(let r=0;r<5;r++){const v=.25+r*.17;for(let i=0;i<7;i++){const u=i/6,X=lerp(lerp(A[0],bx-60,v),lerp(B[0],bx-60+span,v),u),Y=lerp(A[1],by,v)+sin(u*3.14)*30;g.strokeStyle='rgba(190,150,255,'+(.3+.05*r)+')';g.beginPath();g.moveTo(X-30,Y-40);g.quadraticCurveTo(X-6,Y+10,X+4,Y+46);g.stroke()}}g.restore();
   // the hem: loose long feathers
   for(let i=0;i<8;i++){const u=i/7,X=bx-60+u*span,Y=by-u*u*120*e+(i%2?60:0)*e;F().feather(g,X,Y-20,1.75-u*.5+sin(t*2.3+i)*.08-w*.5,lerp(40,170,e)*(.8+.3*(i%3)/2),26*e,'#1a1238',VI,'#05030c')}},
  // p1: a crow-wing clasp at the throat, a strap across the chest, an hourglass at the belt (drawn over FILM1's mantle so it shows)
  front(g,J){const k=J.k.p1||0;if(k<=0)return;const e=ease(k),t=J.t;g.save();g.translate(J.hx,J.hy);g.rotate(J.lean);g.globalAlpha=Math.min(1,k*2);
   g.strokeStyle='#04020a';g.lineWidth=3;g.fillStyle='#2a2048';g.beginPath();g.moveTo(-120,-350);g.lineTo(-96,-366);g.lineTo(70,-150);g.lineTo(48,-128);g.closePath();g.fill();g.stroke();
   g.fillStyle='#cfc4e8';for(let i=0;i<5;i++){const u=(i+.5)/5;g.beginPath();g.arc(lerp(-108,58,u),lerp(-358,-139,u),5.5,0,TAU);g.fill()}
   // the hourglass: dark frame, violet sand running
   g.save();g.translate(64,-96);g.rotate(.12+sin(t*2.4)*.06);g.fillStyle='#1a1230';g.fillRect(-26,-8,52,8);g.fillRect(-26,82,52,8);g.beginPath();g.moveTo(-20,0);g.quadraticCurveTo(-18,30,0,41);g.quadraticCurveTo(-18,52,-20,82);g.lineTo(20,82);g.quadraticCurveTo(18,52,0,41);g.quadraticCurveTo(18,30,20,0);g.closePath();g.fillStyle='rgba(232,220,255,.35)';g.fill();g.strokeStyle='#cfc4e8';g.lineWidth=2.4;g.stroke();
   const s0=(t*.2)%1;g.fillStyle=VI;g.beginPath();g.moveTo(-14+s0*10,6+s0*30);g.lineTo(14-s0*10,6+s0*30);g.lineTo(0,40);g.closePath();g.fill();g.beginPath();g.moveTo(-16,80);g.quadraticCurveTo(0,80-20-s0*14,16,80);g.closePath();g.fill();g.fillRect(-1.5,40,3,40);g.restore();
   // the clasp: two small crow wings folded over the collar
   g.translate(-6,-404);for(const s of[-1,1]){for(let i=0;i<3;i++)F().feather(g,s*10,6,(s<0?PI-.35:.35)+i*.22*s,(70-i*14)*e,15*e,'#2a2058',PALE,'#05030c')}g.fillStyle='#e8dcff';g.beginPath();g.ellipse(0,8,13,15,0,0,TAU);g.fill();g.fillStyle=VI;g.beginPath();g.ellipse(0,8,7,9,0,0,TAU);g.fill();
   g.restore()},
  // p2: a fan of crow feathers at the side of the hood, a violet stitch along its edge
  head(g,J){const k=J.k.p2||0;if(k<=0)return;const e=ease(k),sy=sin(J.yaw||.26),t=J.t;g.save();g.globalAlpha=Math.min(1,k*1.6);
   for(let i=0;i<4;i++)F().feather(g,128+sy*6,-96+i*8,-1.05+i*.3+sin(t*2+i)*.04,(120-i*16)*e,22*e,'#1c1440',VI,'#05030c');
   g.strokeStyle='rgba(200,170,255,.75)';g.lineWidth=3;g.setLineDash([10,9]);g.beginPath();g.moveTo(-128,120);g.bezierCurveTo(-174,-110,-100,-190,10,-190);g.bezierCurveTo(116,-190,180,-104,132,120);g.stroke();g.setLineDash([]);g.restore()}};
 // ---------- the flock for the signature move, made once
 let FLOCK=null;function flock(){if(FLOCK)return FLOCK;const R=SR(4242),L=[];for(let i=0;i<104;i++){const a=R()*TAU,r=Math.sqrt(R());L.push({hx:1030+cos(a)*r*580,hy:480+sin(a)*r*350,s:.45+R()*R()*1.5,ph:R()*TAU,fr:16+R()*8,v:[R()-.5,R()-.5],q:R()})}L.sort((a,b)=>a.s-b.s);return FLOCK=L}
 // the cut: a long gentle arc, from where the reaper stood to where it stops
 const CUT={cx:960,cy:2600,r:2000};const onCut=(X,Y)=>Math.abs(Math.hypot(X-CUT.cx,Y-CUT.cy)-CUT.r);
 EVC1.add('reaper',{
  pal:[VI,DEEP,PALE],eye:'#c89aff',
  C:{coat:'#231849',dark:'#120c2a',trim:'#d8c0ff',inner:'#0a0616',boot:'#1c1440',glove:'#1c1440',leg:'#20184a',scarf:'#2c1f5e',scarf2:'#1c1446',feather:'#1e1648',feather2:'#a080f0',coatLen:1},
  wl:1380,dress,pieces:['shoulders',[110,-1500,1.5],[-260,-700,.58]],
  evo(gr,ev){if(!ev)return null;return{mantle:gr.p1||0,hood:gr.p2||0,tails:gr.p3||0,gaunt:gr.p3||0}},
  // the iris: a clock rim of twelve ticks, a crescent blade turning inside it
  glyph(g,cx,cy,rx,ry,k,t){g.globalCompositeOperation='lighter';g.strokeStyle='#efe4ff';g.lineCap='round';for(let i=0;i<12;i++){const a=i*TAU/12;g.globalAlpha=k*(i==0?1:.55);g.lineWidth=rx*(i==0?.07:.04);g.beginPath();g.moveTo(cx+cos(a)*rx*.66,cy+sin(a)*ry*.66);g.lineTo(cx+cos(a)*rx*(i==0?.9:.8),cy+sin(a)*ry*(i==0?.9:.8));g.stroke()}
   const a0=t*1.4;g.globalAlpha=k*.85;g.fillStyle='#d8c0ff';g.beginPath();g.arc(cx,cy,rx*.56,a0,a0+2.2);g.arc(cx+cos(a0+1.1)*rx*.12,cy+sin(a0+1.1)*ry*.12,rx*.5,a0+2.2,a0,true);g.closePath();g.fill()},
  sky:[[0,'#04020c'],[.3,'#0e0824'],[.56,'#22124a'],[.72,'#3c2270'],[.8,'#24143e'],[1,'#0a0614']],
  plate(x,R,P){const{W,H,glow,rgba}=P;
   // stars
   for(let i=0;i<240;i++){const X=R()*W,Y=R()*620,s=.6+R()*R()*2.4;x.globalAlpha=.2+R()*.7;x.fillStyle=R()<.2?'#d8c0ff':'#ffffff';x.fillRect(X,Y,s,s)}x.globalAlpha=1;
   // a thin waning moon, low on the left, with cloud across it
   glow(x,300,240,560,'#7a4ad0',.35);glow(x,300,240,200,'#c8a8ff',.35);x.save();x.beginPath();x.arc(300,240,104,0,TAU);x.clip();x.fillStyle='#f2ebff';x.fill();x.fillStyle='rgba(22,12,48,.94)';x.beginPath();x.arc(344,214,100,0,TAU);x.fill();x.restore();
   x.fillStyle='rgba(30,18,64,.85)';for(let i=0;i<7;i++){const Y=180+i*44+R()*20,X=R()*W*.7;x.beginPath();x.ellipse(X,Y,220+R()*360,8+R()*10,0,0,TAU);x.fill()}
   x.fillStyle='rgba(150,110,230,.08)';for(let i=0;i<6;i++){x.beginPath();x.ellipse(R()*W,300+R()*240,300+R()*400,14,0,0,TAU);x.fill()}
   // far ranges, layered into the violet haze
   const ridge=(y0,a,f,ph,col)=>{x.fillStyle=col;x.beginPath();x.moveTo(0,H);for(let i=0;i<=W;i+=12)x.lineTo(i,y0+sin(i*f+ph)*a+sin(i*f*2.7+ph*1.3)*a*.4+sin(i*f*7.1)*a*.12);x.lineTo(W,H);x.fill()};
   ridge(610,60,.0032,1.2,'#2a1854');ridge(660,44,.0047,3.1,'#1e1040');
   {const G=x.createLinearGradient(0,600,0,780);G.addColorStop(0,'rgba(180,138,255,0)');G.addColorStop(.6,'rgba(180,138,255,.22)');G.addColorStop(1,'rgba(180,138,255,0)');x.fillStyle=G;x.fillRect(0,600,W,180)}
   // the broken clock tower far off on the right, stopped a minute short of twelve
   {const X=1830,top=330;x.fillStyle='#160c30';x.beginPath();x.moveTo(X-70,760);x.lineTo(X-64,top+40);x.lineTo(X-40,top+10);x.lineTo(X-20,top+34);x.lineTo(X+6,top-6);x.lineTo(X+30,top+28);x.lineTo(X+64,top+16);x.lineTo(X+72,760);x.closePath();x.fill();
    x.fillStyle='#120a28';x.fillRect(X-90,560,180,200);const DY=top+240;x.fillStyle='rgba(200,170,255,.1)';x.beginPath();x.arc(X,DY,40,0,TAU);x.fill();x.strokeStyle='rgba(220,200,255,.25)';x.lineWidth=3;x.stroke();
    x.strokeStyle='rgba(230,215,255,.35)';x.lineWidth=4;x.beginPath();x.moveTo(X,DY);x.lineTo(X-3,DY-30);x.moveTo(X,DY);x.lineTo(X-6,DY-24);x.stroke();for(let i=0;i<12;i++){const a=i*TAU/12;x.fillStyle='rgba(230,215,255,.3)';x.fillRect(X+cos(a)*33-1.5,DY+sin(a)*33-1.5,3,3)}
    x.fillStyle='rgba(200,170,255,.3)';for(const[wx,wy]of[[X-30,top+110],[X+18,top+330]])x.fillRect(wx,wy,10,26)}
   ridge(720,26,.006,.4,'#160a30');
   // near hills of the field
   {const G=x.createLinearGradient(0,760,0,H);G.addColorStop(0,'#2a1650');G.addColorStop(.25,'#1c1038');G.addColorStop(1,'#07040f');x.fillStyle=G;x.beginPath();x.moveTo(0,H);for(let i=0;i<=W;i+=10)x.lineTo(i,800+sin(i*.003+.6)*22+sin(i*.011)*6);x.lineTo(W,H);x.fill()}
   // the dead trees, with crows on them
   const perch=[];const branch=(X,Y,a,len,w,d)=>{const X2=X+cos(a)*len,Y2=Y+sin(a)*len;x.strokeStyle='#07040f';x.lineWidth=w;x.lineCap='round';x.beginPath();x.moveTo(X,Y);x.quadraticCurveTo((X+X2)/2+sin(a)*len*.12,(Y+Y2)/2-cos(a)*len*.12,X2,Y2);x.stroke();if(d<=0||w<2){if(R()<.35)perch.push([X2,Y2]);return}const n=R()<.3?3:2;for(let i=0;i<n;i++)branch(X2,Y2,a+(i-(n-1)/2)*(.5+R()*.4)+(R()-.5)*.3,len*(.62+R()*.18),w*.62,d-1)};
   branch(150,900,-1.42,250,46,6);branch(110,880,-2.1,160,24,4);branch(1620,830,-1.66,170,26,5);
   for(const[X,Y]of perch.slice(0,9)){const s=.55+R()*.3;x.save();x.translate(X,Y-8*s);x.scale(R()<.5?-s:s,s);x.fillStyle='#07040f';x.beginPath();x.ellipse(0,0,24,13,-.3,0,TAU);x.fill();x.beginPath();x.arc(18,-14,10,0,TAU);x.fill();x.beginPath();x.moveTo(26,-16);x.lineTo(40,-12);x.lineTo(26,-9);x.fill();x.beginPath();x.moveTo(-18,4);x.lineTo(-40,22);x.lineTo(-30,6);x.fill();x.fillStyle='#c89aff';x.fillRect(19,-17,3,3);x.restore()}
   // a broken fence running into the dark
   x.strokeStyle='#0c0820';for(let i=0;i<9;i++){const X=380+i*i*14+i*60,Y=806+i*4,h=60-i*4,lean=(R()-.5)*.3;x.lineWidth=10-i*.7;x.beginPath();x.moveTo(X,Y+6);x.lineTo(X+sin(lean)*h,Y-h);x.stroke()}x.lineWidth=3;x.beginPath();x.moveTo(380,780);for(let i=1;i<9;i++){x.lineTo(380+i*i*14+i*60,780+i*6+(i%3==1?16:0))}x.stroke();
   // the field: dry grass, mist, and nightshade in the near corners
   x.lineCap='round';for(let i=0;i<900;i++){const X=R()*W,Y=812+Math.pow(R(),.7)*(H-812),h=(10+R()*30)*(.6+(Y-812)/300);x.strokeStyle=R()<.2?'#3a2470':R()<.5?'#1e1240':'#140c2c';x.globalAlpha=.5+R()*.5;x.lineWidth=1+R()*2*(Y-800)/280;x.beginPath();x.moveTo(X,Y);x.quadraticCurveTo(X+R()*8,Y-h*.6,X+R()*20-6,Y-h);x.stroke()}x.globalAlpha=1;
   {const G=x.createLinearGradient(0,790,0,900);G.addColorStop(0,'rgba(160,120,240,0)');G.addColorStop(.5,'rgba(160,120,240,.16)');G.addColorStop(1,'rgba(160,120,240,0)');x.fillStyle=G;x.fillRect(0,790,W,110)}
   const shade=(X,Y,s)=>{x.save();x.translate(X,Y);x.scale(s,s);x.strokeStyle='#1a2a24';x.lineWidth=5;x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(10,-110,-30,-200);x.stroke();
    for(let i=0;i<4;i++){const ly=-40-i*44,sd=i%2?1:-1;x.fillStyle='#16241e';x.beginPath();x.moveTo(sd*2,ly);x.quadraticCurveTo(sd*50,ly-40,sd*90,ly-6);x.quadraticCurveTo(sd*44,ly+10,sd*2,ly);x.fill()}
    for(let i=0;i<4;i++){const bx=-30+i*22-(i>1?40:0),by=-200+i*30;x.strokeStyle='#1a2a24';x.lineWidth=3;x.beginPath();x.moveTo(bx,by-30);x.quadraticCurveTo(bx+12,by-16,bx+8,by);x.stroke();const G=x.createLinearGradient(bx,by,bx,by+40);G.addColorStop(0,'#5a2a9a');G.addColorStop(1,'#a87ae8');x.fillStyle=G;x.beginPath();x.moveTo(bx-2,by);x.bezierCurveTo(bx-20,by+6,bx-20,by+34,bx-26,by+44);x.lineTo(bx-12,by+38);x.lineTo(bx+6,by+46);x.lineTo(bx+22,by+38);x.lineTo(bx+36,by+42);x.bezierCurveTo(bx+28,by+30,bx+26,by+4,bx+14,by);x.closePath();x.fill();x.fillStyle='#e8d070';x.fillRect(bx+4,by+40,4,8)}
    for(let i=0;i<5;i++){const BX=30+i*16,BY=-80+((i*7)%3)*10;x.fillStyle='#05030a';x.beginPath();x.arc(BX,BY,11,0,TAU);x.fill();x.fillStyle='rgba(220,200,255,.7)';x.beginPath();x.arc(BX-3,BY-4,3,0,TAU);x.fill()}x.restore()};
   shade(70,H+10,1.3);shade(250,H+30,1);shade(1840,H+10,1.25);shade(1690,H+40,.9);
   glow(x,960,1000,700,'#3a1c70',.25)},
  // the aura: smoke curling up from the ground, a slow ring of feathers round the waist, embers
  aura(y,X,Y,k,t){if(k<=0)return;y.globalCompositeOperation='source-over';for(let i=0;i<14;i++){const u=((t*.35+i/14)%1),px=X+sin(i*2.7)*(150+i*16)+sin(t+i)*20,py=Y-u*520*k,r=(50+i%4*20)*(.6+u);y.globalAlpha=.35*k*sin(u*PI);y.fillStyle=i%3?'#120a28':'#1e1240';y.beginPath();y.ellipse(px,py,r,r*.7,0,0,TAU);y.fill()}
   y.globalAlpha=1;const ry=Y-430;for(let i=0;i<22;i++){const a=i/22*TAU+t*.9,front=sin(a)>0;if(front)continue;plume(y,X+cos(a)*320*k,ry+sin(a)*70*k,52*k,a+1.9,i%4?'#1a1236':'#6a4ac0')}
   y.globalCompositeOperation='lighter';for(let i=0;i<40;i++){const q=(t*.4+i/40)%1,px=X+sin(i*5.3)*(120+i*7),py=Y-q*600*k;y.globalAlpha=(1-q)*k*.9;y.fillStyle=i%4?VI:'#ffffff';y.fillRect(px,py,3,6)}
   y.globalCompositeOperation='source-over';y.globalAlpha=k;for(let i=0;i<22;i++){const a=i/22*TAU+t*.9;if(sin(a)<=0)continue;plume(y,X+cos(a)*320*k,ry+sin(a)*70*k,60*k,a+1.9,i%4?'#120a28':'#7a5ad0')}y.globalAlpha=1},
  // the floor sigil: a clock face, ticks for every minute, scythe blades turning in it, hands closing on twelve
  sigil(y,k,t,R0){y.globalCompositeOperation='lighter';const A0=Math.min(1,k*1.4);y.strokeStyle=VI;y.fillStyle=VI;y.lineCap='round';
   for(const[f,w]of[[1,10],[.93,3],[.74,6],[.28,4]]){y.lineWidth=w;y.globalAlpha=A0;y.beginPath();y.arc(0,0,R0*f,0,TAU);y.stroke()}
   y.lineWidth=4;for(let i=0;i<60;i++){const a=i*TAU/60-PI/2,l=i%5?.04:.12;y.globalAlpha=A0*(i%5?.6:1);y.beginPath();y.moveTo(cos(a)*R0*(.93-l),sin(a)*R0*(.93-l));y.lineTo(cos(a)*R0*.93,sin(a)*R0*.93);y.stroke()}
   y.save();y.rotate(-t*.5);for(let i=0;i<7;i++){const a=i*TAU/7;y.globalAlpha=A0*.75;y.beginPath();for(let j=0;j<=12;j++){const u=j/12;y.lineTo(cos(a+u*.9)*R0*(.72-u*.3),sin(a+u*.9)*R0*(.72-u*.3))}for(let j=12;j>=0;j--){const u=j/12,r=.72-u*.3-.06*sin(u*PI);y.lineTo(cos(a+u*.9+.05*sin(u*PI))*R0*r,sin(a+u*.9+.05*sin(u*PI))*R0*r)}y.closePath();y.fill()}y.restore();
   // the hands: the long one reaches twelve as the power peaks
   const h1=-PI/2-(1-k)*2.2,h2=-PI/2-(1-k)*.5,hand=(g,L,c)=>{y.fillStyle=c;y.beginPath();y.moveTo(0,0);y.quadraticCurveTo(cos(g+.42)*L*.62,sin(g+.42)*L*.62,cos(g)*L,sin(g)*L);y.quadraticCurveTo(cos(g+.2)*L*.5,sin(g+.2)*L*.5,0,0);y.fill()};y.globalAlpha=A0*.9;hand(h2,R0*.55,VI);hand(h1,R0*.88,PALE);y.globalAlpha=1},
  pose:{gather:{nh:[290,70],fh:[150,420],wa:-1.5,lean:.02},piece:{nh:[300,330],fh:[110,430],wa:2.05,wflip:1},hero:{nh:[150,330],fh:[-230,500],wa:2.12,wflip:1,lean:.1,nf:[-220,0],ff:[220,0],hd:{yaw:.3,eye:{open:.85,angry:.35},brow:{angry:.3},mouth:{smile:.05}}},windup:{nh:[-110,340],fh:[90,380],wa:2.6,lean:.15,py:50,nf:[-200,0],ff:[220,0]}},
  // the moment it becomes real: the crows scatter outward against the light
  burst(y,k,t,A){const R=SR(77);for(let i=0;i<46;i++){const a=R()*TAU,sp=.5+R(),d=(380+k*1100*sp),X=960+cos(a)*d,Y=600+sin(a)*d*.7,s=.6+R()*1.3;if(Math.abs(X-960)<300&&Y>250)continue;crow(y,X,Y,s*(.7+k*.5),t*20+i,cos(a)<0?-1:1,sin(a)*.4*(cos(a)<0?-1:1),'#2a1a4a')}
   y.globalCompositeOperation='source-over'},
  spark(x,c,A){const t=c.t;x.save();A.view(x,c.C,1,y=>{for(let i=0;i<14;i++){const R=SR(300+i),X=(R()*2200-100-t*(160+R()*200)),Y=R()*1080+t*(80+R()*60)+sin(t*2+i)*30;y.globalAlpha=.75;plume(y,X,Y,40+R()*50,R()*TAU+t*(R()-.5)*3,i%3?'#1a1236':'#7a5ad0')}y.globalAlpha=1;
    if(t>.65){const u=(t-.65)/.65;y.save();crow(y,lerp(2100,-200,u),lerp(700,800,u),1.6,t*24,-1,.05,'#030208');crow(y,lerp(2300,0,u),lerp(800,880,u),1.1,t*22+1,-1,.08,'#030208');y.restore()}});x.restore()},
  // the new look: feathers spiral in onto the piece
  piece(x,c,A,i){const t=c.t;x.save();const R=SR(500+i);for(let j=0;j<26;j++){const a0=R()*TAU,r0=500+R()*500,u=ez(t/.6),a=a0+u*2.4,r=r0*(1-u),X=960+cos(a)*r,Y=540+sin(a)*r*.7;if(u>=1)continue;x.globalAlpha=.9*(1-u*.6);plume(x,X,Y,50+R()*40,a+1.9,j%3?'#140c2c':'#9a70f0')}
   for(let j=0;j<10;j++){const X=((R()*2000+t*700*(R()+.5))%2200)-140,Y=R()*1080+sin(t+j)*40;x.globalAlpha=.55;plume(x,X,Y,90+R()*60,2.6+sin(t*2+j)*.4,'#05030a')}x.restore()},
  windup(x,c,A){const t=c.t;x.save();for(let j=0;j<9;j++){const R=SR(700+j),s=1.8+R()*2.6,X=2200-((t*(2400+R()*900)+R()*1600)%2800),Y=R()*1080;crow(x,X,Y,s,t*30+j,-1,(R()-.5)*.2,'#030208')}x.restore();
   const G=x.createRadialGradient(960,540,300,960,540,1100);G.addColorStop(0,'rgba(5,3,12,0)');G.addColorStop(1,'rgba(5,3,12,.75)');x.fillStyle=G;x.fillRect(0,0,1920,1080)},
  // The Final Hour: the reaper crosses through a wall of crows in one cut; the flock hangs a beat, then bursts into feathers; a last reap strikes twelve
  sig:{hits:[.4,1.15,1.9],draw(x,c,A){const t=c.t,h0=.4,h1=1.15,h2=1.9,FL=flock(),X1=1360;
   A.bg(x,c,.42);
   A.view(x,c.C,1,y=>{
    // the hour-light behind the flock, so black wings read against it
    A.glow(y,1020,520,980,'#6a3ac0',.6+(t>h0&&t<h1?.15:0));A.glow(y,1020,540,460,'#c8a8ff',.28);
    // the floor clock: its long hand reaches twelve on the last hit
    const kk=t<h2?.45+.55*Math.pow(t/h2,2):1;A.sigil(y,960,1012,t<h2?760:lerp(760,1150,A.eo((t-h2)/.5)),kk,c.T,t<h2?.8:1);
    // the flock rushes in, slows to a crawl after the cut, and is gone into feathers
    const tt=t<h0?t:h0+(t-h0)*.1;
    if(t<h1){const e=A.ez(tt/.38),cd=t>h0?Math.min(1,(t-h0)/.6):0;for(let i=0;i<FL.length;i++){const f=FL[i];let X=f.hx+(1-e)*(1400+f.q*600)+sin(tt*3+i)*14,Y=f.hy+sin(tt*5+i*1.3)*12+(1-e)*260*f.v[1];const dc=Math.hypot(X-CUT.cx,Y-CUT.cy)-CUT.r,cut=Math.abs(dc)<40*f.s&&t>h0;if(cut)Y+=(dc<0?-1:1)*18*cd;
      crow(y,X,Y,f.s,tt*f.fr+f.ph,-1,.06*sin(i),cut?'#2a1258':f.s<.8?'#1c1238':f.s<1.2?'#0e0820':INK,f.q<.3?(cut?'#ffffff':'#c89aff'):null)}}
    // the crossing: a smear where the reaper was, and streaks along the dash
    if(t>h0-.08&&t<h0+.35){const u=cl((t-h0+.08)/.05,0,1),fd=t<h0?1:1-(t-h0)/.35;y.save();y.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const R=SR(900+i),Y=560+R()*280,x0=lerp(480,X1,R()*.3),x1=lerp(x0,X1+120,u);y.globalAlpha=fd*(.35+R()*.5);y.strokeStyle=i%3?VI:'#ffffff';y.lineWidth=8+R()*10;y.beginPath();y.moveTo(x0,Y);y.lineTo(x1,Y-(x1-x0)*.02);y.stroke()}y.restore()}
    // the cut itself: a blade of light along the whole arc, then a thin line left hanging in the air
    const a0=-PI/2-.33,a1=-PI/2+.32;
    if(t>h0-.02&&t<h1+.25){const grow=Math.min(1,(t-h0+.02)/.06),fat=t<h0+.12,f=cl((t-h0)/.12,0,1),al=t<h1?1:1-(t-h1)/.25,a2=lerp(a0,a1,grow);if(fat){A.crescent(y,CUT.cx,CUT.cy,CUT.r,a0,a2,lerp(70,26,f),PALE,1-f*.4,1);A.crescent(y,CUT.cx,CUT.cy,CUT.r,a0,a2,9,'#ffffff',1-f*.5,0)}else A.crescent(y,CUT.cx,CUT.cy,CUT.r,a0,a2,22+8*sin(t*50),VI,al*.85,1)}
    if(t>h0&&t<h0+.45)A.sparks(y,77,t-h0,1000,620,60,1500,PALE,.45,300);
    // the burst: every crow into feathers, a flash at each
    if(t>=h1){const d=t-h1,dr=(1-Math.exp(-2.6*d))/2.6,fade=Math.max(0,1-d/1.6);
     if(d<.4){A.crescent(y,CUT.cx,CUT.cy,CUT.r,a0,a1,lerp(120,14,A.eo(d/.3)),PALE,1-d/.4,1);for(let i=0;i<FL.length;i+=1){const f=FL[i];A.glow(y,f.hx,f.hy,(50+f.s*50)*(1+d*2),i%3?VI:'#ffffff',(1-d/.4)*.55)}A.glow(y,1020,520,1300*A.eo(d/.3),'#c8a8ff',.6*(1-d/.4))}
     y.save();for(let i=0;i<FL.length;i++){const f=FL[i],X0=f.hx+sin(tt*3+i)*14,Y0=f.hy;for(let j=0;j<3;j++){const a=f.ph+j*2.1+f.v[j%2],sp0=(260+f.q*560)*(.7+j*.25),vx=cos(a)*sp0,vy=sin(a)*sp0*.8-160;let X=X0+vx*dr,Y=Y0+vy*dr+90*d*d;
       if(t>h2){const e=1-Math.exp(-3.4*(t-h2)),dx=X-X1,dy=Y-640,D=Math.hypot(dx,dy)||1;X+=dx/D*1100*e;Y+=dy/D*420*e}
       y.globalAlpha=fade;plume(y,X,Y,22+f.s*24,a+d*(4+j*3)*(f.q-.5)*2,j==1?'#3a2478':INK)}}y.restore()}
    // the reaper
    const wind={wind:1,act:{rim:[VI,1,-8,-3]}},angry={yaw:.3,eye:{open:.75,angry:.85,pupil:.7},brow:{angry:.9},mouth:{open:.1,smile:-.25}};
    if(t<h0-.08){const u=A.ez(t/.32);A.speedLines(y,520,700,31,t,'rgba(200,170,255,.7)',.25+u*.4,40,440);A.hero(c,y,480+u*40,1000,.5,{nh:[-230,130],fh:[-180,190],wa:-2.75,lean:.18+u*.08,py:60+u*40,nf:[-220,0],ff:[240,0],hd:angry},wind)}
    else if(t<h0-.02){const u=cl((t-h0+.08)/.06,0,1),X=lerp(640,1140,A.eo(u)),lunge={nh:[320,230],fh:[200,290],wa:.1,lean:.45,py:130,nf:[-360,0],ff:[300,0],hd:angry};
     for(const[o,a]of[[-420,.22],[-220,.4]])A.hero(c,y,X+o,1000,.5,lunge,{wind:1,act:{sil:1,silC:'#7a52d8',a}});A.hero(c,y,X,1000,.5,lunge,{wind:1,act:{rim:[PALE,1,-10,-3]}})}
    else if(t<h2-.2){const u=A.eo((t-h0)/.35);A.hero(c,y,X1+u*20,1000,.5,{nh:[-20-u*30,420],fh:[60,440],wa:2.72+u*.08,lean:.32-u*.1,py:150-u*50,nf:[-320,0],ff:[280,0],hd:Object.assign({},angry,{yaw:.36,eye:{open:.66,angry:.95,pupil:.6}})},wind)}
    else if(t<h2){const u=A.ez((t-h2+.2)/.2);A.hero(c,y,X1,1000,.5,{nh:[-280,-40+u*20],fh:[-180,60],wa:-2.3+u*.2,lean:-.14,py:50,nf:[-200,0],ff:[220,0],hd:angry},Object.assign({f:-1},wind))}
    else{const u=A.eo((t-h2)/.3);A.hero(c,y,X1-u*50,1000,.5,{nh:[340,330-u*40],fh:[160,400],wa:.3-u*.15,lean:.3,py:140,nf:[-280,0],ff:[300,0],hd:Object.assign({},angry,{mouth:{open:.4,smile:-.3}})},Object.assign({f:-1},wind))}
    // the last reap: the blade's light runs round the waist, a shock runs along the ground
    if(t>h2){const d=t-h2;y.save();y.translate(X1-40,640);y.scale(1,.26);A.crescent(y,0,0,lerp(160,1000,A.eo(d/.4)),-PI*.1,PI*1.15,lerp(160,20,A.eo(d/.5)),VI,Math.max(0,1-d/.7),1);y.restore();
     y.save();y.globalCompositeOperation='lighter';y.translate(X1-40,1004);y.scale(1,.24);for(const[o,w]of[[0,34],[.1,12]]){const r=lerp(100,1900,A.eo((d-o)/.9));y.globalAlpha=Math.max(0,1-(d-o)/.9);y.strokeStyle=o?'#ffffff':VI;y.lineWidth=w;y.beginPath();y.arc(0,0,r,0,TAU);y.stroke()}y.restore();
     A.sparks(y,91,d,X1-60,980,50,1300,PALE,.7,800);A.glow(y,X1-40,980,700*A.eo(d/.3),VI,.6*(1-d/.6))}
   });
   if(A.lit(t,h0,.07)||A.lit(t,h1,.06)||A.lit(t,h2,.07))A.impact(x);if(t>h2&&t<h2+.2)A.rect(x,PALE,.4*(1-(t-h2)/.2))}}
 })})()}catch(e){console.error('EVC reaper',e)}
