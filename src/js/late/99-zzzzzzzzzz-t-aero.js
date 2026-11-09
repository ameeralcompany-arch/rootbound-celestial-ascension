// ===== AERO1: wings that behave like wings. The existing flap cycle stays; this layer reads how each character is really moving (speed, acceleration, falling, turning, how far the ground is) and bends the wings to match:
// walking and running tuck them, a stoop folds them up and back, fast flight sweeps them and shortens the beat, turning banks them, stopping flares them, and the ground coming up makes them brake before the landing. Feathers flutter with air speed; metal barely moves.
// Then the air itself: tip trails, streamlines, dust and leaves under a low flyer, ripples on water, snow pushed aside, grass leaning away. All of it scales with rarity (see RK), runs from one fixed pool, thins with the quality setting and can be switched off in Settings; the wing movement never depends on it.
// Other players: nothing new is sent. Their air state and fall speed are worked out here from where they are drawn. =====
try{(()=>{
 const cl=(v,a,b)=>v<a?a:v>b?b:v,RN=Math.random,TAU=6.2832,ST=new Map();
 const hx=h=>{const n=parseInt(String(h).slice(1),16);return[n>>16&255,n>>8&255,n&255]},rgb=(h,a)=>{const c=hx(h);return'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'};
 // how far a wing bends in moving air: feathers fully, membrane nearly, ribbons more, metal and floating stone barely
 const STIFF=/plate|scale|steel|prism|bone/;
 function give(art){if(art.aeroM!=null)return art.aeroM;const P=art.W.a.parts[art.W.a.parts.length-1];let m=1;if(P.s=='mech')m=.18;else if(P.s=='frag')m=.3;else if(P.s=='mem')m=.8;else if(P.s=='rib')m=1.25;else if(P.s=='tier'&&STIFF.test((P.e||[])[0]||''))m=.2;else if(P.s=='fan'&&/shard|ice|blade/.test(P.tip||''))m=.25;return art.aeroM=m}
 // rarity rank for the air effects: 0 common .. 5 mythic, 6 relic (exclusive sits with mythic)
 const rk=W=>W.rar=='relic'?6:W.rar=='exclusive'?5:Math.max(0,WRAR.indexOf(W.rar));
 const RK=[{rib:.09,w:.9,n:6,st:3,mo:0},{rib:.14,w:1.1,n:8,st:5,mo:2},{rib:.22,w:1.4,n:10,st:8,mo:5},{rib:.32,w:1.8,n:12,st:11,mo:9},{rib:.4,w:2.4,n:14,st:13,mo:4},{rib:.48,w:2.8,n:14,st:15,mo:6},{rib:.54,w:3,n:14,st:16,mo:8}];
 const mk=t=>({t,vx:0,vy:0,ax:0,ay:0,f:1,air:false,dive:0,fast:0,brake:0,flut:0,turn:0,gait:0,fall:0,landK:0,launch:0,stride:0,wx:null,wy:null,peak:0,gap:999,k:[new Float32Array(9),new Float32Array(9),new Float32Array(9)],R:null,rt:0});
 // pixels of open air under a point, up to six rows; 99 means further than that
 function gapAt(x,y){const tx=x/T|0;let ty=y/T|0;if(tx<0||tx>=W)return 999;for(let n=0;n<7;n++,ty++){if(ty<0||ty>=H)return 999;if(SOLID6[tiles[ty*W+tx]]===1)return Math.max(0,ty*T-y)}return 999}
 const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
 function aero(ps,key,tier,t,mode,vx,vy,Wg,o,art,f){
  if(!key||WingArt.dbg||(o&&o.kf!=null)||api.off)return ps;
  let s=ST.get(key);if(!s){s=mk(t);ST.set(key,s);if(ST.size>48)ST.delete(ST.keys().next().value)}
  let dt=t-s.t;s.t=t;if(!(dt>0)||dt>.1)dt=.016;
  const air=mode==2,me=key=='me',V=vy==null?0:vy,spd=Math.hypot(vx,V),M=give(art);f=f||1;
  s.ax=damp(s.ax,cl((vx-s.vx)/dt,-5000,5000),14,dt);s.ay=damp(s.ay,cl((V-s.vy)/dt,-5000,5000),14,dt);s.vx=vx;s.vy=V;
  if(me){s.wx=P.x;s.wy=P.y+P.h}
  s.gap=!air?0:s.wx!=null?gapAt(s.wx,s.wy):999;
  if(air)s.peak=Math.max(V,s.peak*Math.exp(-dt*1.5));
  // state changes
  if(air&&f!==s.f)s.turn=1;s.f=f;
  if(!s.air&&air)s.launch=1;
  if(s.air&&!air&&mode>=0){s.landK=cl(s.peak/900,.18,1);try{onLand(s,art.W,s.landK,key)}catch(_){}s.peak=0}
  s.air=air;
  const down=me&&(K.s||K.arrowdown),hd=Math.abs(vx);
  const tDive=air&&V>300?cl((V-300)/380,0,1)*(down||V>560?1:0):0,tFast=air?cl((hd-200)/170,0,1):0,flare=air&&V>130&&s.gap<150?(1-s.gap/150)*cl(V/500,.3,1):0,
   tBrake=Math.max(air&&hd>60&&s.ax*vx<0?cl(Math.abs(s.ax)/1400,0,1):0,flare),tGait=air?0:cl(hd/300,0,1.25),tFall=air&&V>120?cl(V/500,0,1):0;
  s.dive=damp(s.dive,tDive,tDive>s.dive?7:5,dt);s.fast=damp(s.fast,tFast,5,dt);s.brake=damp(s.brake,tBrake,tBrake>s.brake?12:5,dt);s.gait=damp(s.gait,tGait,8,dt);s.fall=damp(s.fall,tFall,6,dt);
  s.flut=damp(s.flut,(cl((spd-260)/560,0,1)+s.dive*.7)*M,6,dt);s.turn=Math.max(0,s.turn-dt/.38);s.launch=Math.max(0,s.launch-dt/.26);s.landK=Math.max(0,s.landK-dt/.42);s.stride+=dt*(7+7*s.gait)*(air?0:1);
  const D=s.dive,Fa=s.fast,B=s.brake,G=s.gait,Fl=s.fall,tn=s.turn*s.turn*(3-2*s.turn);
  // the same adjustments for every wing family: both wings together (rot), one against the other (bank), near and far span
  ps.rot=(air?-.5*D-.16*Fa-.22*B-.1*Fl*(1-D)+.24*s.launch:-.06*G+Math.sin(s.stride)*.035*G)+.26*s.landK*(s.landK<.6?s.landK/.6:1);
  ps.bank=tn*.3*(.45+.55*Math.min(1,M*1.6));ps.trm=tn*M;
  ps.xn=air?(1-.16*Fa+.06*B)*(1-.52*D):1-.1*G;ps.xf=air?(1+.1*Fa+.04*B)*(1-.52*D):1+.06*G;
  ps.flut=s.flut;ps.splay=1+.22*B-.62*D+.1*tn;ps.flex=cl(-s.ay/2600,-.3,.3)*M*.8+(s.launch*.14*M);
  ps.fl=(ps.fl||0)*(1-.45*Fa);if(ps.fll!=null)ps.fll*=1-.45*Fa;
  if(ps.k0){for(let j=0;j<3;j++){const a=s.k[j];a.set(ps['k'+j]);a[0]=-.1+(a[0]+.1)*(1-.4*Fa);a[1]+=.85*D+.12*Fa-.18*B;a[2]=cl(a[2]*(1-.6*D)+.18*B,0,1);a[3]+=.5*D-.2*B;a[4]*=1-.14*D;a[5]+=.2*D;ps['k'+j]=a}}
  if(air)ps.s=cl(ps.s*(1-.55*D)+B*.12,0,1);
  s.W=Wg;s.me=me;return ps}
 // ---------- other players ----------
 function remote(r,name){const key='p:'+name;let s=ST.get(key);if(!s){s=mk(0);ST.set(key,s)}const now=performance.now()/1000,dt=now-(s.rn||now);s.rn=now;if(r.ly!=null&&dt>0&&dt<.2)s.rvy=(s.rvy||0)+((r.y-r.ly)/dt-(s.rvy||0))*.22;r.ly=r.y;s.wx=r.x;s.wy=r.y+P.h;
  let g2=0;try{const c=gapAt(r.x,r.y+P.h+2);g2=c>9?1:0;if(inWater(r.x,r.y+P.h*.6))g2=0}catch(_){}s.ac=g2?Math.min(6,(s.ac|0)+1):0;return s.ac>=3?1:0}
 const vyOf=key=>{const s=ST.get(key);return s&&s.rvy!=null?s.rvy:null};
 // ---------- the air: one fixed pool in world space. kinds: 0 streamline 1 dust 2 mote 3 feather 4 tip vortex 5 pressure arc 6 leaf 7 clock ring
 const N=72,X=new Float32Array(N),Y=new Float32Array(N),VX=new Float32Array(N),VY=new Float32Array(N),AG=new Float32Array(N),LF=new Float32Array(N),SZ=new Float32Array(N),RT=new Float32Array(N),AL=new Float32Array(N),KD=new Uint8Array(N),C=new Array(N).fill('#fff');let cur=0;
 function spawn(k,x,y,vx,vy,life,size,alpha,col,rot){const i=cur;cur=(cur+1)%N;X[i]=x;Y[i]=y;VX[i]=vx;VY[i]=vy;AG[i]=0;LF[i]=life;SZ[i]=size;AL[i]=alpha;KD[i]=k;C[i]=col;RT[i]=rot||0;return i}
 const fxOn=()=>QM.cur.wfx>0&&cel.opt.wair!==0&&!api.off;
 const kOf=()=>[0,.5,.8,1][Math.min(3,QM.cur.wfx|0)]*Math.min(1.25,QM.vfxK||1)*(window.PERF7&&PERF7.k!=null?Math.min(1,PERF7.k):1);
 const tileCol=(x,y)=>{let c='#c8ad8a';try{const b=tiles[Math.floor((y+4)/T)*W+Math.floor(x/T)],n=(BLK[b]||[''])[0];c=WX6.acc>.35&&b==2?'#f4f8ff':/Grass|Leaf|Moss/.test(n)?'#b6d68a':/Sand/.test(n)?'#ead9a6':/Snow|Ice/.test(n)?'#f2f6ff':/Stone|Cobble|Brick|Marble|Slate|Basalt/.test(n)?'#c4c4c8':/Wood|Plank/.test(n)?'#c9a57a':'#c8ad8a'}catch(_){}return c};
 const leafy=(x,y)=>{try{const n=(BLK[tiles[Math.floor((y+4)/T)*W+Math.floor(x/T)]]||[''])[0];return/Grass|Leaf|Moss/.test(n)&&WX6.acc<=.35}catch(_){return false}};
 function onLand(s,Wg,k,key){if(!fxOn()||s.wx==null)return;const x=s.wx,y=s.wy,n=Math.round((4+k*11)*kOf()),c=tileCol(x,y),L=Wg.a.L;for(let i=0;i<n;i++){const d=i%2?1:-1;spawn(1,x+d*(4+RN()*16),y-3,d*(50+RN()*150)*(.5+k),-(8+RN()*42),.35+RN()*.3,8+RN()*10+k*8,.5,c)}
  spawn(5,x,y-4,0,0,.32,L*.5+k*30,.28*k+.08,'#ffffff');if(leafy(x,y))for(let i=0;i<Math.round(k*5*kOf());i++){const d=i%2?1:-1;spawn(6,x+d*RN()*20,y-6,d*(30+RN()*90),-(40+RN()*90),.8+RN()*.5,5,.9,RN()<.5?'#7fb456':'#a7c86a',RN()*6)}}
 // ---------- local flyer: wash on the ground ----------
 const WASH={k:0,x:0,y:0,beat:0,water:0};let wr=0,dustAcc=0;
 function env(dt,s,Wg,t){const on=s.air&&s.gap<4.6*T&&!P.sw,tg=on?(1-s.gap/(4.6*T))*(FLY7.F.on?1:.55):0;WASH.k=damp(WASH.k,tg,tg>WASH.k?9:5,dt);WASH.x=P.x;WASH.y=s.wy+s.gap;WASH.beat=Math.max(0,WASH.beat-dt*3.4);if(!on||!fxOn())return;
  // low over water: ripples under each wing
  wr-=dt;if(wr<=0){let w0=-1;try{const tx=P.x/T|0;let ty=(P.y+P.h)/T|0;for(let n=0;n<6&&ty<H;n++,ty++){const q=ty*W+tx;if(wl[q]>0&&!tiles[q]){w0=ty;break}if(tiles[q])break}}catch(_){}
   if(w0>=0){wr=.16+RN()*.08;try{const L=Wg.a.L*.45,sy=WATER9.surfAt(P.x,w0*T+2);if(sy!=null){WATER9.ripple(P.x+(RN()<.5?-L:L)*(.5+RN()*.5),sy,1+WASH.beat+WASH.k*1.2);if(RN()<.6*kOf())spawn(2,P.x+(RN()-.5)*L*2,sy-4,(RN()-.5)*50,-(40+RN()*70),.4+RN()*.25,4,.6,'#dff6ff')}}catch(_){}WASH.water=1}else{wr=.2;WASH.water=0}}
  if(!WASH.water&&s.gap<3.4*T){dustAcc+=dt*(3+Math.abs(P.vx)/40)*WASH.k*kOf();while(dustAcc>=1){dustAcc--;const d=RN()<.5?-1:1,x=P.x+d*(20+RN()*90),y=s.wy+s.gap;spawn(1,x,y-3,d*(40+RN()*90)+P.vx*.3,-(6+RN()*30),.32+RN()*.3,7+RN()*9,.3+WASH.k*.2,tileCol(x,y));if(leafy(x,y)&&RN()<.28)spawn(6,x,y-6,d*(30+RN()*80)+P.vx*.3,-(30+RN()*80),.8+RN()*.5,5,.9,RN()<.5?'#7fb456':'#a7c86a',RN()*6)}}}
 function onBeat(){WASH.beat=1;const s=ST.get('me');if(!s||!s.W||!fxOn())return;const rkv=rk(s.W),L=s.W.a.L,c=s.W.pal[3];if(s.gap<3.4*T&&!WASH.water){const n=Math.round(5*WASH.k*kOf());for(let i=0;i<n;i++){const d=i%2?1:-1,x=P.x+d*(10+RN()*L*.8),y=s.wy+s.gap;spawn(1,x,y-3,d*(90+RN()*140),-(10+RN()*30),.32+RN()*.26,10+RN()*12,.4,tileCol(x,y))}}
  spawn(5,P.x,P.y+P.h*.5+10,0,50,.26,L*.6,.09+rkv*.018,'#ffffff');
  if(rkv>=5&&s.tp)for(let k=0;k<2;k++){const i=k?6:0;spawn(4,s.tp[i],s.tp[i+1],P.vx*.15,P.vy*.15+22,.55,12+rkv*2,.36,c,RN()*6)}
  if(s.W.a.sig=='hours')spawn(7,P.x,P.y+P.h*.4,0,0,.8,L*.9,.5,c,RN()*6)}
 try{const _f=WINGSFX.flap;WINGSFX.flap=function(){try{onBeat()}catch(_){}return _f.apply(this,arguments)}}catch(_){}
 // ---------- drawing from the wing POST hook, once per frame ----------
 const TIP=new Float32Array(12);let lastT=-1;
 function stepPool(dt){for(let i=0;i<N;i++){if(AG[i]>=LF[i])continue;AG[i]+=dt;const k=KD[i];const dr=k==0?2.4:k==1?2.8:k==6?1.2:1.6;VX[i]*=Math.exp(-dr*dt);VY[i]*=Math.exp(-dr*dt);if(k==6||k==3)VY[i]+=(k==6?170:70)*dt;if(k==1)VY[i]-=12*dt;X[i]+=(VX[i]+(k==6||k==3?Math.sin(AG[i]*5+i)*22:0))*dt;Y[i]+=VY[i]*dt;RT[i]+=(k==6||k==3?5:k==4?7:k==7?1.4:0)*dt}}
 let DUST=null;const dustImg=()=>{if(DUST)return DUST;const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.5,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);return DUST=c};
 function drawPool(g2,light){const ox=cam.x,oy=cam.y,dust=dustImg();g2.save();g2.lineCap='round';for(let i=0;i<N;i++){if(AG[i]>=LF[i])continue;const u=AG[i]/LF[i],k=KD[i],sz=SZ[i],x=X[i]-ox,y=Y[i]-oy,fade=(u<.14?u/.14:1)*Math.pow(1-u,1.2)*AL[i];if(fade<.01)continue;g2.globalAlpha=fade;
   switch(k){case 0:g2.globalCompositeOperation=light;g2.strokeStyle=C[i];g2.lineWidth=1;g2.beginPath();g2.moveTo(x,y);g2.lineTo(x+Math.cos(RT[i])*sz*(1-u*.5),y+Math.sin(RT[i])*sz*(1-u*.5));g2.stroke();break;
    case 1:{g2.globalCompositeOperation='source-over';g2.fillStyle=C[i];const z=sz*(1+u*1.3);g2.beginPath();g2.ellipse(x,y,z*.6,z*.34,0,0,6.3);g2.fill();break}
    case 2:g2.globalCompositeOperation=light;{const z=sz*(1-u*.4)*3;g2.drawImage(dust,x-z/2,y-z/2,z,z)}break;
    case 3:g2.globalCompositeOperation='source-over';g2.save();g2.translate(x,y);g2.rotate(RT[i]);g2.fillStyle=C[i];g2.beginPath();g2.moveTo(-sz,0);g2.quadraticCurveTo(0,-sz*.45,sz,0);g2.quadraticCurveTo(0,sz*.32,-sz,0);g2.fill();g2.restore();break;
    case 4:g2.globalCompositeOperation=light;g2.strokeStyle=C[i];g2.lineWidth=1.3;g2.beginPath();g2.arc(x,y,sz*(.5+u*1.1),RT[i],RT[i]+4.2);g2.stroke();break;
    case 5:g2.globalCompositeOperation='source-over';g2.strokeStyle=C[i];g2.lineWidth=1.2;g2.beginPath();g2.ellipse(x,y,sz*(.45+u*.9),sz*(.12+u*.2),0,.25,2.9);g2.stroke();break;
    case 6:g2.globalCompositeOperation='source-over';g2.save();g2.translate(x,y);g2.rotate(RT[i]);g2.fillStyle=C[i];g2.beginPath();g2.ellipse(0,0,sz,sz*.45,0,0,6.3);g2.fill();g2.restore();break;
    case 7:g2.globalCompositeOperation=light;g2.strokeStyle=C[i];g2.lineWidth=1.1;{const r=sz*(.4+u*.8);g2.beginPath();g2.arc(x,y,r,0,6.3);g2.stroke();for(let q=0;q<12;q++){const a=RT[i]+q*.5236,l=q%3?.04:.09;g2.beginPath();g2.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);g2.lineTo(x+Math.cos(a)*r*(1-l),y+Math.sin(a)*r*(1-l));g2.stroke()}}break}}g2.restore()}
 // tip ribbons: the path each wing tip has just drawn through the air
 const PTS=16;function pushRib(s,tips,t){if(!s.R)s.R={x:[new Float32Array(PTS),new Float32Array(PTS)],y:[new Float32Array(PTS),new Float32Array(PTS)],n:0,h:0,t:0};const q=s.R;if(t-q.t<.024)return;q.t=t;if(q.n){const dx=tips[0]+cam.x-q.x[0][q.h],dy=tips[1]+cam.y-q.y[0][q.h];if(dx*dx+dy*dy>48400)q.n=0}q.h=(q.h+1)%PTS;for(let k=0;k<2;k++){q.x[k][q.h]=tips[k*6]+cam.x;q.y[k][q.h]=tips[k*6+1]+cam.y}q.n=Math.min(PTS,q.n+1)}
 function path(g2,q,k,a,b,dx,dy){const n=q.n;let st=false,px=0,py=0;for(let i=a;i<=b&&i<n;i++){const j=(q.h-i+PTS*2)%PTS,x=q.x[k][j]-cam.x+(dx?dx(i):0),y=q.y[k][j]-cam.y+(dy?dy(i):0);if(st)g2.quadraticCurveTo(px,py,(px+x)/2,(py+y)/2);else{g2.moveTo(x,y);st=true}px=x;py=y}if(st)g2.lineTo(px,py)}
 function ribbons(g2,s,Wg,I,light,t){const q=s.R;if(!q||q.n<4)return;const r=RK[rk(Wg)],len=Math.min(q.n-1,r.n-1),col=rk(Wg)<2?'#ffffff':(Wg.sp||Wg.pal[3]);g2.save();g2.globalCompositeOperation=light;g2.lineCap='round';g2.lineJoin='round';
  const sg=Wg.a.sig;
  if(sg=='aurora'&&q.n>6){g2.beginPath();path(g2,q,0,0,len);for(let i=Math.min(q.n-1,len);i>=0;i--){const j=(q.h-i+PTS*2)%PTS;g2.lineTo(q.x[1][j]-cam.x,q.y[1][j]-cam.y)}g2.closePath();g2.globalAlpha=.07+.08*I;const G=g2.createLinearGradient(0,0,0,g2.canvas.height*.9);G.addColorStop(0,rgb(Wg.pal[2],.85));G.addColorStop(.5,rgb(Wg.pal[3],.65));G.addColorStop(1,rgb(Wg.pal[1],.45));g2.fillStyle=G;g2.fill()}
  for(let k=0;k<2;k++){const stp=Math.max(2,Math.ceil(len/3));for(let b=0;b<3;b++){const a=b*stp,e=Math.min(len,(b+1)*stp);g2.beginPath();path(g2,q,k,a,e);g2.globalAlpha=r.rib*I*(1-b/3.2);g2.strokeStyle=col;g2.lineWidth=r.w*(1-b*.26);g2.stroke()}
   if(rk(Wg)>=3){g2.beginPath();path(g2,q,k,0,Math.ceil(len*.5));g2.globalAlpha=r.rib*I*.9;g2.strokeStyle='#ffffff';g2.lineWidth=Math.max(.6,r.w*.34);g2.stroke()}
   if(sg=='root'){for(let v=0;v<2;v++){const ph=v*2.1+k;g2.beginPath();path(g2,q,k,0,len,i=>Math.sin(i*.9+ph+t*2)*i*1.1,i=>Math.cos(i*.7+ph)*i*1.1);g2.globalAlpha=.5*I;g2.strokeStyle=Wg.pal[3];g2.lineWidth=1;g2.stroke()}}
   if(sg=='null'){g2.globalCompositeOperation='source-over';g2.beginPath();path(g2,q,k,0,len);g2.globalAlpha=.34*I;g2.strokeStyle=Wg.pal[0];g2.lineWidth=r.w*4;g2.stroke();g2.globalCompositeOperation=light}}
  g2.restore()}
 function post(g2,art,ps,rx,ry,f,t,key,o,fx){if(!key||WingArt.dbg||(o&&o.kf!=null)||api.off||typeof cam=='undefined')return;const s=ST.get(key);if(!s)return;const Wg=art.W,me=key=='me';
  const first=t!==lastT;if(first){const dt=cl(t-lastT,0,.05);lastT=t;stepPool(dt||.016);if(me)try{env(dt||.016,s,Wg,t)}catch(_){}}
  else if(me)try{env(.016,s,Wg,t)}catch(_){}
  const on=fxOn()&&!QM.reduce&&(me||fx>=2);if(!on)return;
  const spd=Math.hypot(s.vx,s.vy),I=s.air?cl((spd-110)/320,0,1):0,light=(typeof night=='number'&&night>.45)?'lighter':'source-over';
  WING9.tipsUser(art,ps,rx,ry,f,TIP);if(!s.tp)s.tp=new Float32Array(12);for(let i=0;i<12;i+=2){s.tp[i]=TIP[i]+cam.x;s.tp[i+1]=TIP[i+1]+cam.y}
  if(s.air)pushRib(s,TIP,t);else if(s.R)s.R.n=Math.max(0,s.R.n-1);
  if(I>.02&&s.R)ribbons(g2,s,Wg,I,light,t);
  if(me){const r=RK[rk(Wg)],k=kOf(),dt=.016;if(I>.05){s.rt+=dt*(r.st*k*I);while(s.rt>=1){s.rt--;const L=Wg.a.L,a=Math.atan2(s.vy,s.vx)+Math.PI,side=RN()<.5?-1:1;spawn(0,P.x+side*(L*.25+RN()*L*.5)+(RN()-.5)*30,P.y+P.h*.2+(RN()-.5)*L*.6,s.vx*.25,s.vy*.25,.22+RN()*.2,18+spd*.08,.1+.035*rk(Wg),rk(Wg)<2?'#ffffff':Wg.sp||'#ffffff',a)}
    if(RN()<r.mo*k*I*dt){const i=(RN()*6|0)*2;spawn(2,s.tp[i],s.tp[i+1],s.vx*.1+(RN()-.5)*30,s.vy*.1+(RN()-.5)*30,.5+RN()*.4,3+rk(Wg)*.5,.8,Wg.sp||Wg.pal[3])}
    if(M1(Wg)&&s.flut>.5&&RN()<dt*(.6+tnf(s)*5)*k){const i=(RN()*6|0)*2;spawn(3,s.tp[i],s.tp[i+1],s.vx*.2,s.vy*.2,1+RN()*.5,5+rk(Wg)*.5,.9,Wg.pal[2],RN()*6)}}
   if(Wg.a.sig=='first'&&I>.1&&RN()<dt*2.4*k)spawn(3,P.x+(RN()-.5)*Wg.a.L,P.y+P.h*.3,s.vx*.1,s.vy*.1,1.8,9,1,Wg.pal[3],RN()*6);
   drawPool(g2,light)}}
 const M1=Wg=>Wg.fam=='feathered'||(Wg.fam=='dark'&&/real|ragged/.test(Wg.a.parts[0].tip||''));const tnf=s=>s.turn;
 // ---------- things the world reads ----------
 const washAt=(bx,by)=>{if(WASH.k<.02)return 0;const dx=bx-WASH.x;if(dx>170||dx<-170||by-WASH.y>60||WASH.y-by>60)return 0;return(dx<0?-1:1)*(1-Math.abs(dx)/170)*WASH.k*(5+3*WASH.beat)};
 function gustFlake(f,w,hh,dt){const x=f.x*w,y=f.y*hh,px=(P.x-cam.x)*ZM,py=(P.y-cam.y)*ZM,dx=x-px,dy=y-py,r2=dx*dx+dy*dy,R0=170*ZM;if(r2>R0*R0)return;const d=Math.sqrt(r2)||1,k=(1-d/R0)*(api.push.k+.4)*dt;f.x+=(dx/d*210*k+P.vx*.16*(1-d/R0)*dt)/w;f.y+=(dy/d*210*k+P.vy*.1*(1-d/R0)*dt)/hh}
 const api={off:false,remote,vyOf,washAt,gustFlake,push:{k:0},state:k=>ST.get(k),wash:WASH,count(){let n=0;for(let i=0;i<N;i++)if(AG[i]<LF[i])n++;return n},rk,RK,get gusting(){if(!fxOn()||!WX6.snow)return false;const s=ST.get('me');const on=!!(s&&s.air&&Math.hypot(s.vx,s.vy)>90);api.push.k=on?1:0;return on},pool:{spawn}};
 WingArt.AERO=aero;{const p0=WingArt.POST;WingArt.POST=function(g2,art,ps,rx,ry,f,t,key,o,fx){if(p0)p0.apply(this,arguments);try{post(g2,art,ps,rx,ry,f,t,key,o,fx)}catch(e){if(!api.err){api.err=1;console.error('AERO1',e)}}}}
 window.AERO1=api;
})()}catch(e){console.error('AERO1',e)}
