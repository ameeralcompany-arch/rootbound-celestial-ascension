// ===== WTRAIL: top-tier flight effects for the local player's legendary and mythic (and exclusive) wings. FLY7 gives these wings
// stronger lift and more breath; this file makes them look the part. Normal wings get nothing extra here.
//  legendary: golden light streaks behind you while flying, gold feathers shed on every beat, a gold shockwave ring on the take-off burst.
//  mythic   : a prismatic ribbon trail with twinkles, star motes orbiting you, a radiant aura flare that pulses with the beat, an iridescent
//             afterimage of the wings on hard climbing beats and a prismatic double ring on take-off.
//  Gliding shows a lighter version (half the trail, softer). Everything is tinted by the wing's own palette (pal = [deep, mid, light, glow]).
// Cost: every sprite is painted once per wing into small canvases (gradients only at build time; the afterimage silhouette is built in an
// idle callback). A frame is only drawImage stamps from fixed pools (32 trail points, 10 feathers, 8 twinkles, 1 afterimage, 3 rings) with
// one save/restore per layer. It thins out on low quality (QM.cur.wfx), reduced motion (QM.reduce) and when frames run over budget (FDT).
const WTRAIL=(()=>{
 const TAU=Math.PI*2,R=Math.random;
 const hx=h=>{const n=parseInt(String(h).slice(1),16);return[n>>16&255,n>>8&255,n&255]};
 const mixc=(p,q,t)=>p.map((v,i)=>Math.round(v+(q[i]-v)*t));
 const css=(c,a)=>'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';
 const hue=(h,s,l)=>{h=(((h%360)+360)%360)/360;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))))};return[f(0),f(8),f(4)]};
 const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(2,Math.ceil(w));c.height=Math.max(2,Math.ceil(h));return c};
 const WHITE=[255,255,255];
 // ---------- sprites (built once per wing, small LRU) ----------
 function glow(r,c,core){const C=mk(r*2,r*2),x=C.getContext('2d'),g=x.createRadialGradient(r,r,0,r,r,r);g.addColorStop(0,core||'rgba(255,255,255,.95)');g.addColorStop(.22,css(c,.85));g.addColorStop(.55,css(c,.26));g.addColorStop(1,css(c,0));x.fillStyle=g;x.fillRect(0,0,r*2,r*2);return C}
 function flare(c){const r=96,C=mk(r*2,r*2),x=C.getContext('2d'),g=x.createRadialGradient(r,r,0,r,r,r);g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(.16,css(c,.5));g.addColorStop(.45,css(c,.15));g.addColorStop(1,css(c,0));x.fillStyle=g;x.fillRect(0,0,r*2,r*2);
  x.globalCompositeOperation='lighter';x.translate(r,r);for(let i=0;i<6;i++){x.rotate(TAU/6);const s=x.createLinearGradient(0,0,r*.9,0);s.addColorStop(0,css(mixc(c,WHITE,.5),.22));s.addColorStop(1,css(c,0));x.fillStyle=s;x.beginPath();x.moveTo(0,-3);x.lineTo(r*.9,0);x.lineTo(0,3);x.fill()}return C}
 function streaks(c){const out=[];for(let i=0;i<16;i++){const C=mk(44,44),x=C.getContext('2d');x.translate(22,22);x.rotate(i/16*Math.PI);x.scale(1,.24);const g=x.createRadialGradient(0,0,0,0,0,21);g.addColorStop(0,css(mixc(c,WHITE,.6),1));g.addColorStop(.18,css(c,.95));g.addColorStop(.55,css(c,.38));g.addColorStop(1,css(c,0));x.fillStyle=g;x.beginPath();x.arc(0,0,21,0,TAU);x.fill();out.push(C)}return out}
 function feathers(c,l){const out=[];for(let i=0;i<8;i++){const C=mk(26,26),x=C.getContext('2d');x.translate(13,13);x.rotate(i/8*TAU);const g=x.createLinearGradient(-10,0,10,0);g.addColorStop(0,css(mixc(c,[90,60,10],.35),1));g.addColorStop(.6,css(c,1));g.addColorStop(1,css(l,1));
   x.fillStyle=g;x.beginPath();x.moveTo(-10,0);x.bezierCurveTo(-5,-5,5,-4.6,10,-.4);x.bezierCurveTo(5,3.4,-5,3.8,-10,0);x.fill();x.strokeStyle=css(l,.95);x.lineWidth=.9;x.beginPath();x.moveTo(-11,.4);x.quadraticCurveTo(0,-.6,10,-.4);x.stroke();
   x.strokeStyle=css(WHITE,.35);x.lineWidth=.6;for(let k=-6;k<8;k+=3){x.beginPath();x.moveTo(k,-.3);x.lineTo(k+2.4,-3.2);x.stroke()}out.push(C)}return out}
 function ring(cols){const S=160,h=S/2,C=mk(S,S),x=C.getContext('2d');
  if(cols.length==1){const c=cols[0],g=x.createRadialGradient(h,h,0,h,h,h);g.addColorStop(0,css(c,0));g.addColorStop(.64,css(c,0));g.addColorStop(.8,css(c,.7));g.addColorStop(.87,'rgba(255,255,255,.95)');g.addColorStop(.93,css(c,.45));g.addColorStop(1,css(c,0));x.fillStyle=g;x.fillRect(0,0,S,S);return C}
  const n=48;x.lineCap='round';for(const[lw,a,wt]of[[14,.16,0],[6,.6,0],[2,.85,.55]])for(let i=0;i<n;i++){x.strokeStyle=css(mixc(cols[Math.floor(i/n*cols.length)],WHITE,wt),a);x.lineWidth=lw;x.beginPath();x.arc(h,h,h-12,i/n*TAU,(i+1.15)/n*TAU);x.stroke()}return C}
 function star(c){const C=mk(28,28),x=C.getContext('2d');x.drawImage(glow(14,c),0,0);x.globalCompositeOperation='lighter';x.fillStyle='rgba(255,255,255,.95)';x.beginPath();x.moveTo(14,1);x.lineTo(15.3,12.7);x.lineTo(27,14);x.lineTo(15.3,15.3);x.lineTo(14,27);x.lineTo(12.7,15.3);x.lineTo(1,14);x.lineTo(12.7,12.7);x.closePath();x.fill();return C}
 const SET=new Map();
 function set(w,tk){const id=w.id+':'+tk;let s=SET.get(id);if(s)return s;const p=(w.pal||[]).length>=4?w.pal:['#a07a2a','#f2d68a','#fff6dc','#ffd36a'],gl=hx(p[3]);
  if(tk==1){const gold=mixc([255,190,40],gl,.18),lite=mixc([255,236,160],hx(p[2]),.15);s={tk,str:streaks(gold),gd:glow(16,gold,css(mixc(gold,WHITE,.45),1)),fea:feathers(gold,lite),ring:ring([gold])}}
  else{const hs=[];for(let i=0;i<12;i++)hs.push(mixc(hue(i*30,1,.6),gl,.15));s={tk,hs,pr:hs.map(c=>glow(14,c,css(mixc(c,WHITE,.5),1))),stars:[star(WHITE),star(mixc(gl,WHITE,.3)),star(hs[8])],flare:flare(gl),ring:ring(hs),ghost:[null,null],gq:0}}
  SET.set(id,s);if(SET.size>4)SET.delete(SET.keys().next().value);return s}
 // iridescent wing silhouette for the afterimage: the wing at full flare, recoloured once (built in an idle callback, then just stamped)
 function ghost(s,w,k){try{const i=WINGS.indexOf(w),f=k?-1:1,S=Math.ceil(w.a.L*3.4+80),C=mk(S,S),x=C.getContext('2d'),ax=S/2,ay=Math.round(S*.55);WingArt.draw(x,i,ax,ay,f,1.3,2,0,0,1,null,0,{kf:0});
   const d=x.getImageData(0,0,S,S).data;let x0=S,x1=-1,y0=S,y1=-1;for(let y=0;y<S;y+=2)for(let q=0;q<S;q+=2)if(d[(y*S+q)*4+3]>16){if(q<x0)x0=q;if(q>x1)x1=q;if(y<y0)y0=y;if(y>y1)y1=y}
   if(x1<0){s.ghost[k]=false;return}x0=Math.max(0,x0-3);y0=Math.max(0,y0-3);const cw=Math.min(S-x0,x1-x0+6),ch=Math.min(S-y0,y1-y0+6),G=mk(cw,ch),q=G.getContext('2d');q.drawImage(C,x0,y0,cw,ch,0,0,cw,ch);
   q.globalCompositeOperation='source-atop';const lg=q.createLinearGradient(0,0,cw,ch);s.hs.forEach((c,j)=>lg.addColorStop(j/(s.hs.length-1),css(mixc(c,WHITE,.25),1)));q.globalAlpha=.88;q.fillStyle=lg;q.fillRect(0,0,cw,ch);
   s.ghost[k]={c:G,ox:ax-x0,oy:ay-y0}}catch(_){s.ghost[k]=false}}
 function queueGhost(s,w){if(s.gq)return;s.gq=1;const run=()=>{for(const k of[0,1])if(s.ghost[k]===null)ghost(s,w,k)};try{if(window.requestIdleCallback)requestIdleCallback(run,{timeout:1500});else setTimeout(run,200)}catch(_){setTimeout(run,200)}}
 // ---------- pools ----------
 const N=32,TX=new Float32Array(N),TY=new Float32Array(N),TA=new Float32Array(N),TT=new Float32Array(N),TK=new Float32Array(N),TI=new Uint16Array(N);let th=0,tn=0,emit=0,seq=0,life=.5;
 const pool=n=>Array.from({length:n},()=>({l:0,x:0,y:0,vx:0,vy:0,a:0,va:0,age:0,k:0}));
 const FE=pool(10),TW=pool(8),GH=pool(1),RG=pool(3);
 const take=a=>{let o=a[0];for(const q of a){if(q.age>=q.l)return q;if(q.age/q.l>o.age/o.l)o=q}return o};
 const st={beats:0,bursts:0,rings:0,ghosts:0,frames:0};
 let clock=0,seen=0,beatK=0,flareK=0,mv=0,ema=1/60,base=1,lastGhost=-9,curW=null,curTk=0,S=null,ox=0,oy=0,fc=1,thin=1,q=2,rm=false,on=false,dark=true,darkT=0,comp='lighter';
 const wingNow=()=>{try{return curWing(lvl)}catch(_){return null}};
 function addTrail(x,y,a,k){TX[th]=x;TY[th]=y;TA[th]=a;TT[th]=clock;TK[th]=k;TI[th]=seq++&4095;th=(th+1)%N;if(tn<N)tn++}
 function feather(x,y,vx,vy){if(!S||!S.fea)return;const p=take(FE);p.l=1.1+R()*.6;p.age=0;p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.a=R()*TAU;p.va=(R()-.5)*5;p.k=R()*6}
 function twinkle(x,y){const p=take(TW);p.l=.45+R()*.4;p.age=0;p.x=x;p.y=y;p.vx=(R()-.5)*20;p.vy=-8-R()*16;p.k=(R()*3)|0;p.a=6+R()*5}
 // strong flap from FLY7 (through WINGSFX.flap): feathers / aura pulse / afterimage
 function beat(){if(!curTk||!FLY7.F.on)return;st.beats++;beatK=1;
  if(curTk==1){if(q>=1)for(let i=0,n=thin>1?1:2;i<n;i++){const s=R()<.5?-1:1;feather(P.x+s*(curW.a.L*.45+R()*14),P.y+P.h*.3+(R()-.5)*16,s*(20+R()*30)-P.vx*.15,-30+R()*30)}}
  else{flareK=Math.max(flareK,.55);const G=S&&S.ghost[fc<0?1:0];if(G&&q>=2&&!rm&&P.vy<-80&&clock-lastGhost>.45){lastGhost=clock;const p=take(GH);p.l=.42;p.age=0;p.x=P.x;p.y=P.y;p.k=fc<0?1:0;st.ghosts++}}}
 function takeoff(){if(!S)return;st.bursts++;const p=take(RG);p.l=.6;p.age=0;p.x=P.x;p.y=P.y+P.h*.45;p.k=curTk;p.a=0;p.s=S.ring;st.rings++;flareK=1;
  if(curTk==2){const p2=take(RG);p2.l=.6;p2.age=-.09;p2.x=p.x;p2.y=p.y;p2.k=2;p2.a=1;p2.s=S.ring}
  else if(q>=1)for(let i=0;i<6;i++){const a=i/6*TAU+R()*.4;feather(p.x+Math.cos(a)*14,p.y+Math.sin(a)*10,Math.cos(a)*120,Math.sin(a)*80-20)}
  try{WINGSFX.burst(curTk,curW)}catch(_){}}
 {const _f=WINGSFX.flap;WINGSFX.flap=function(s){try{beat()}catch(_){}return _f.apply(this,arguments)}}
 // ---------- per-frame update (driven by the local player's draw, dt from the main loop) ----------
 function update(){const dt=Math.min(.05,window.FDT||1/60);clock+=dt;ema+=(dt-ema)*.05;base=Math.min(base+dt*.0002,ema);   // base ~ the display's own frame time (fastest recent average)
  const w=wingNow(),tk=w?FLY7.tkOf(w):0;if(w!==curW){curW=w;curTk=tk;S=tk?set(w,tk):null;tn=0;if(!tk)mv=0}
  q=QM.cur.wfx|0;rm=!!QM.reduce;
  // additive light reads at night and underground; on a bright day sky the same sprites are laid on normally so their colour shows
  if(clock>darkT){darkT=clock+.25;let d=0;try{d=depthAt(P.x,P.y)}catch(_){}dark=(typeof night=='number'&&night>.45)||d>8;comp=dark?'lighter':'source-over'}const over=ema/base;   // frames running over budget (e.g. 144 Hz dropping below ~105 fps) thin the layer out
  thin=q<=0||ema>.03||over>2?3:q==1||over>1.35?2:1;
  const fly=!!FLY7.F.on,air=!P.g&&!P.sw,hold=K.w||K[' ']||K.arrowup,glide=tk&&air&&!fly&&hold&&P.vy>0,k=tk?(fly?1:glide?.5:0):0;
  if(FLY7.F.bursts!==seen){seen=FLY7.F.bursts;if(tk)takeoff()}
  if(tk==2&&S&&S.ghost[0]===null&&q>=2)queueGhost(S,w);
  mv+=((tk==2?(fly?1:air?.5:0):0)-mv)*Math.min(1,dt*5);beatK=Math.max(0,beatK-dt*3.2);flareK=Math.max(0,flareK-dt*(rm?3:1.8));
  life=tk==2?.6:.5;
  if(k>0&&Math.abs(P.vx)+Math.abs(P.vy)>30){emit+=dt*(k>=1?(tk==2?36:45):20)/thin;let n=0;while(emit>=1&&n++<4){emit--;addTrail(P.x-fc*4,P.y+P.h*.42,Math.atan2(P.vy,P.vx),k);if(tk==2&&R()<(.25*k)/thin&&q>=1)twinkle(P.x+(R()-.5)*16,P.y+P.h*.42+(R()-.5)*16)}}else emit=0;
  if(curTk==1&&glide&&q>=1&&R()<dt*2.5)feather(P.x+(R()<.5?-1:1)*curW.a.L*.45,P.y+P.h*.3,-P.vx*.1,-10);
  while(tn&&clock-TT[(th-tn+N)%N]>life)tn--;
  let alive=tn;
  for(const p of FE)if(p.age<p.l){p.age+=dt;p.vy=Math.min(55,p.vy+45*dt);p.vx*=Math.exp(-dt*1.6);p.x+=(p.vx+Math.sin(p.age*3+p.k)*22)*dt;p.y+=p.vy*dt;p.a+=p.va*dt;alive++}
  for(const p of TW)if(p.age<p.l){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;alive++}
  for(const p of GH)if(p.age<p.l){p.age+=dt;alive++}
  for(const p of RG)if(p.age<p.l){p.age+=dt;alive++}
  return alive>0||mv>.01}
 // ---------- draw: behind the character (aura flare, afterimages, trail, feathers, back motes) and in front (front motes, twinkles, rings)
 function motes(g,front){if(mv<.02||!S||!S.stars)return;const n=thin>=3?3:5,L=curW?curW.a.L:80,rx=24+L*.2,cx=P.x+ox,cy=P.y+P.h*.42+oy+(WingArt.FL.bob||0);
  for(let i=0;i<n;i++){const a=clock*(rm?.8:1.7)+i*TAU/n,z=Math.sin(a);if(front!==(z>=0))continue;const s=(12+4*z)*(.8+.2*Math.sin(clock*7+i*1.9));g.globalAlpha=mv*(.5+.25*(z+1));g.drawImage(S.stars[i%3],cx+Math.cos(a)*rx-s/2,cy+z*9-6+Math.sin(clock*2.3+i)*3-s/2,s,s)}}
 function pre(g){g.save();g.globalCompositeOperation='lighter';
  if(S&&S.flare&&mv>.01){const L=curW.a.L,sz=(L+50)*(1+.1*beatK+.25*flareK),a=(.3+.35*flareK+.1*beatK)*mv*(dark?1:.4);g.globalAlpha=Math.min(1,a);g.drawImage(S.flare,P.x+ox-sz/2,P.y+P.h*.45+oy-sz/2,sz,sz)}
  g.globalCompositeOperation=comp;
  if(S&&S.ghost)for(const p of GH)if(p.age<p.l){const G=S.ghost[p.k];if(!G)continue;const u=p.age/p.l;g.globalAlpha=(dark?.42:.32)*(1-u)*(1-u);g.drawImage(G.c,p.x+ox-G.ox,p.y+24+oy-G.oy-u*6)}
  if(tn&&S){const step=thin;let j=0;
   if(S.str){for(let n=0;n<tn;n+=step){const i=(th-1-n+N*2)%N,u=(clock-TT[i])/life;if(u>=1)continue;const a=TA[i],b=(Math.round(a/Math.PI*16)%16+16)%16,sz=48*(1-.45*u),al=Math.pow(1-u,1.4)*TK[i];
     // streaks overlap a lot, so they alternate with the cheaper gold glow (streak on even points + the newest 3, glow on the rest)
     const odd=(n/step&1)==1&&n>2;if(odd||!dark){const s3=30*(1-.4*u);g.globalAlpha=al*(dark?.5:.6);g.drawImage(S.gd,TX[i]+ox-s3/2,TY[i]+oy-s3/2,s3,s3)}
     if(!odd){g.globalAlpha=al*.9;g.drawImage(S.str[b],TX[i]+ox-sz/2,TY[i]+oy-sz/2,sz,sz)}
     if((j++)%4==0){const px=-Math.sin(a),py=Math.cos(a),d=11+8*u,s2=sz*.7;g.globalAlpha=al*.45;g.drawImage(S.str[b],TX[i]+ox+px*d-s2/2,TY[i]+oy+py*d-s2/2,s2,s2);g.drawImage(S.str[b],TX[i]+ox-px*d-s2/2,TY[i]+oy-py*d-s2/2,s2,s2)}}}
   else{const hs=(clock*9)|0;for(let n=0;n<tn;n+=step){const i=(th-1-n+N*2)%N,u=(clock-TT[i])/life;if(u>=1)continue;const a=TA[i]+Math.PI/2,c=Math.cos(a),s=Math.sin(a),wv=Math.sin(TT[i]*11+clock*3)*8*(1-u),sz=34*(1-.5*u)*(.6+.4*TK[i]),al=.85*Math.pow(1-u,1.2)*TK[i];
     g.globalAlpha=al;g.drawImage(S.pr[(TI[i]+hs)%12],TX[i]+ox+c*wv-sz/2,TY[i]+oy+s*wv-sz/2,sz,sz);
     if(thin==1&&n%3==0){const s2=sz*.7;g.globalAlpha=al*.7;g.drawImage(S.pr[(TI[i]+hs+6)%12],TX[i]+ox-c*wv-s2/2,TY[i]+oy-s*wv-s2/2,s2,s2)}}}}
  motes(g,false);
  g.globalCompositeOperation='source-over';
  if(S&&S.fea)for(const p of FE)if(p.age<p.l){const u=p.age/p.l;g.globalAlpha=Math.min(1,(1-u)*1.6)*.95;g.drawImage(S.fea[((Math.round(p.a/TAU*8)%8)+8)%8],p.x+ox-12,p.y+oy-12,24,24)}
  g.restore()}
 function post(g){g.save();g.globalCompositeOperation=comp;motes(g,true);
  if(S&&S.stars)for(const p of TW)if(p.age<p.l){const u=p.age/p.l,s=p.a*(1-u*.5);g.globalAlpha=(1-u)*(.6+.4*Math.sin(p.age*30));g.drawImage(S.stars[p.k],p.x+ox-s/2,p.y+oy-s/2,s,s)}
  for(const p of RG)if(p.age<p.l&&p.age>=0&&p.s){const u=p.age/p.l,e=1-Math.pow(1-u,3),sz=(p.a?14:24)+e*(p.k==2?(p.a?120:200):170);g.globalAlpha=Math.pow(1-u,1.5)*.9;g.drawImage(p.s,p.x+ox-sz/2,p.y+oy-sz/2,sz,sz)}
  g.restore()}
 const err=e=>{if(!err.n){err.n=1;console.error('WTRAIL',e)}};
 // the local player's character: effects behind it, then the character (and its wings), then the front layer
 {const _dc=drawChar;drawChar=function(cx,cy){if(arguments[15]!=='me'||api.off)return _dc.apply(this,arguments);on=false;
   try{if(entered){fc=arguments[2]<0?-1:1;ox=cx-P.x;oy=cy-P.y;on=update();if(on){st.frames++;pre(g)}}}catch(e){err(e);on=false}
   const r=_dc.apply(this,arguments);if(on)try{post(g)}catch(e){err(e)}return r}}
 // ---------- test / perf helpers ----------
 function counts(){let f=0,t=0,gh=0,rg=0;for(const p of FE)if(p.age<p.l)f++;for(const p of TW)if(p.age<p.l)t++;for(const p of GH)if(p.age<p.l)gh++;for(const p of RG)if(p.age<p.l)rg++;return{tk:curTk,trail:tn,feathers:f,twinkles:t,ghosts:gh,rings:rg,motes:+mv.toFixed(2),thin}}
 // draw cost of one full frame of effects (pools filled to the cap) on an offscreen 1280x720 canvas, ms per frame
 function bench(id,n){const w=wingById(id),tk=w?FLY7.tkOf(w):0;if(!tk)return null;const sv=[curW,curTk,S,ox,oy,mv,clock];curW=w;curTk=tk;S=set(w,tk);if(tk==2)for(const k of[0,1])if(S.ghost[k]===null)ghost(S,w,k);
  ox=640-P.x;oy=360-P.y;mv=1;for(let i=0;i<N;i++)addTrail(P.x-i*6,P.y+20+i*3,1,1);clock+=.001;for(const p of FE){p.l=1;p.age=.2;p.x=P.x;p.y=P.y}for(const p of TW){p.l=1;p.age=.2;p.x=P.x;p.y=P.y;p.k=0;p.a=8}for(const p of GH){p.l=.5;p.age=.1;p.x=P.x;p.y=P.y;p.k=0}RG[0].l=.6;RG[0].age=.2;RG[0].x=P.x;RG[0].y=P.y;RG[0].k=tk;RG[0].s=S.ring;
  const c=mk(1280,720).getContext('2d'),t0=performance.now();n=n||300;for(let i=0;i<n;i++){pre(c);post(c)}const ms=(performance.now()-t0)/n;
  for(const a of[FE,TW,GH,RG])for(const p of a){p.age=p.l=0}tn=0;[curW,curTk,S,ox,oy,mv,clock]=sv;return{id,tk,ms:+ms.toFixed(3)}}
 // off: switch the whole layer off (A/B performance checks)
 const api={st,counts,bench,set,off:false,get tier(){return curTk}};return api})();
