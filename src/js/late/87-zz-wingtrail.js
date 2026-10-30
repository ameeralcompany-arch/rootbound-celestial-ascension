// ===== WTRAIL: top-tier wing effects for the local player's legendary and mythic (and exclusive) wings. FLY7 gives these wings stronger lift
// and more breath; this file makes them look the part. Normal wings get nothing extra here.
//  Themed trails: the trail follows the worn wing's own theme and palette, never a generic rainbow. WTRAIL.theme(wing) classifies every wing
//  from its family, effect kind, name and colours: 'dark' | 'light' | 'fire' | 'ice' | 'crystal' | 'storm' | 'nature' | 'water' | 'cosmic' |
//  'tech' | 'arcane'. Dark / corrupted wings stream smoky obsidian and deep-violet wisps (drawn darkening, source-over) with faint violet
//  glints; light wings shed soft golden / starlight motes and feathers; fire embers rise, frost sparkles and shards fall, storm wings crackle
//  with electric streaks, nature wings drop petals, water wings blow bubbles, cosmic wings scatter star dust in their own hues.
//  Particles inherit part of the player's velocity (they stream behind and drift with the motion), slow down by drag, follow a per-theme
//  gravity and fade in / out smoothly. Gliding shows a lighter version.
//  legendary: the trail, theme flakes shed on every beat, a shockwave ring on the take-off burst.
//  mythic   : a denser trail, motes orbiting you, an aura that pulses with the beat (a dark smoky halo for dark wings), a recoloured afterimage
//             of the wings on climbing beats and a double ring on take-off.
//  Grounded float: standing or walking on the ground with legendary / mythic wings, the character floats a few px above the terrain with a gentle
//  bob (only the drawn offset through the aura-pose hook AC6.PZ; P, physics and hitboxes never change), the wings stay half open in a slow
//  breathing flap (WING9.gnd) and a soft glow (a shadow for dark wings) lies under the feet. Jumping or falling blends it out quickly.
// Cost: every sprite is painted once per wing into small canvases (gradients only at build time; the afterimage silhouette is built in an idle
// callback). A frame is only drawImage stamps from fixed pools (48 particles, 1 afterimage, 3 rings, 5 motes) with one save/restore per layer.
// It thins out on low quality (QM.cur.wfx), reduced motion (QM.reduce) and when frames run over budget (FDT against the display's own rate).
const WTRAIL=(()=>{
 const TAU=Math.PI*2,R=Math.random;
 const hx=h=>{const n=parseInt(String(h).slice(1),16);return[n>>16&255,n>>8&255,n&255]};
 const mixc=(p,q,t)=>p.map((v,i)=>Math.round(v+(q[i]-v)*t));
 const css=(c,a)=>'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';
 const lum=c=>(c[0]*.3+c[1]*.59+c[2]*.11)/255;
 const sr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(2,Math.ceil(w));c.height=Math.max(2,Math.ceil(h));return c};
 const WHITE=[255,255,255],BLACK=[0,0,0];
 // ---------- theme classifier (also used outside, e.g. a "dark alignment" voice filter) ----------
 const DARKW=/void|shadow|umbral|obsidian|night|eclipse|raven|crimson|bone|ossuar|ink|wraith|shroud|abyss|\bbat\b|omen|corrupt|demon|death|skull|forge|spectr/;
 const LIGHTW=/celest|seraph|halo|angel|holy|divine|dove|swan|silver|radiant|lunar|eternity|ascend|royal|dawn|\bsun|solar|light|pearl|mythic|fledgling/;
 const THC=new Map();
 function theme(w){if(typeof w=='string')w=wingById(w);if(!w)return'none';let r=THC.get(w.id);if(r)return r;
  const t=(w.id+' '+(w.n||'')).toLowerCase(),fx=String(w.fxk||''),s=fx+' '+t,p=(w.pal||[]).map(hx),L1=p[1]?lum(p[1]):.5;let d=0,l=0;
  if(w.fam=='dark')d+=2;if(/smoke|omen|crimson/.test(fx))d+=2;if(DARKW.test(t))d+=2;if(L1<.25)d+=3;
  if(fx=='glitter')l+=2;if(LIGHTW.test(t))l+=2;if(L1>.7)l+=2;if(w.fam=='feathered')l+=1;
  if(d>=4&&d>l)r='dark';else if(l>=4&&l>d)r='light';else if(/embers|fire|flame|phoenix|dragon|drake|plume|magma|lava/.test(s))r='fire';
  else if(/snow|frost|\bice|glacier/.test(s))r='ice';else if(/glints|crystal|amethyst/.test(s))r='crystal';else if(/volt|storm|thunder|lance|lightning/.test(s))r='storm';
  else if(/petals|leaf|blossom|zephyr|flower|sakura/.test(s))r='nature';else if(/bubbles|tide|wave|aqua|ocean/.test(s))r='water';
  else if(/stars|cosmic|galaxy|astral|nebula/.test(s))r='cosmic';else if(/sparks|mech|circuit|aegis|gear/.test(s))r='tech';
  else r=l>d?'light':d>l?'dark':'arcane';THC.set(w.id,r);return r}
 // per theme: sprite kinds (main trail, accent, shed flake), gravity (px/s^2, - = rises), drag, spread speed, life and size ranges, growth,
 // accent chance per main particle (ac)
 const TH={
  dark:{main:'smoke',acc:'glow',flk:'shard',g:-14,drag:1.6,sp:22,life:[.7,1.1],size:[22,32],grow:1.1,ac:.22},
  light:{main:'glow',acc:'star',flk:'feather',g:-8,drag:1.2,sp:26,life:[.55,.9],size:[10,17],grow:.2,ac:.3},
  fire:{main:'glow',acc:'streak',flk:null,g:-70,drag:1.4,sp:30,life:[.45,.75],size:[8,14],grow:-.3,ac:.15},
  ice:{main:'star',acc:'glow',flk:'shard',g:28,drag:1.8,sp:24,life:[.6,1],size:[8,13],grow:-.2,ac:.2},
  crystal:{main:'star',acc:'glow',flk:'shard',g:18,drag:1.6,sp:24,life:[.6,1],size:[9,14],grow:-.2,ac:.2},
  storm:{main:'streak',acc:'star',flk:null,g:0,drag:3,sp:50,life:[.3,.5],size:[30,44],grow:-.3,ac:.25},
  nature:{main:'flake',acc:'glow',flk:'petal',g:22,drag:1.4,sp:30,life:[.8,1.3],size:[14,20],grow:0,ac:.2},
  water:{main:'bubble',acc:'glow',flk:null,g:-40,drag:1.6,sp:26,life:[.6,1],size:[8,14],grow:.3,ac:.2},
  cosmic:{main:'glow',acc:'star',flk:null,g:0,drag:1.2,sp:24,life:[.6,1],size:[10,16],grow:.1,ac:.3},
  tech:{main:'spark',acc:'glow',flk:null,g:40,drag:2,sp:40,life:[.35,.6],size:[6,9],grow:0,ac:.15},
  arcane:{main:'glow',acc:'star',flk:null,g:0,drag:1.4,sp:24,life:[.5,.9],size:[10,16],grow:.1,ac:.25}};
 // colours from the wing palette [deep, mid, light, glow]; light wings lean gold / starlight, dark wings obsidian / deep violet
 function cols(th,p){const[d,m,l,gl]=p;
  if(th=='dark')return{main:[mixc(d,BLACK,.25),mixc(m,gl,.18),mixc(m,BLACK,.1)],acc:[gl,mixc(gl,WHITE,.3)],flk:[mixc(m,BLACK,.2),l],ring:[mixc(m,gl,.35),gl],gh:[d,m,gl,m]};
  if(th=='light'){const gold=mixc([255,200,80],gl,.2);return{main:[gold,mixc(gold,WHITE,.45),mixc(l,gl,.4)],acc:[mixc(gold,WHITE,.3),WHITE],flk:[gold,mixc([255,240,190],l,.3)],ring:[gold,mixc(gold,WHITE,.5)],gh:[gold,mixc(gold,WHITE,.5),gl,l]}}
  return{main:[gl,l,mixc(m,l,.5)],acc:[mixc(gl,WHITE,.35),l],flk:[m,l],ring:[gl,l,m],gh:[m,gl,l,gl]}}
 // ---------- sprites ----------
 function glow(r,c){const C=mk(r*2,r*2),x=C.getContext('2d'),g=x.createRadialGradient(r,r,0,r,r,r);g.addColorStop(0,css(mixc(c,WHITE,.5),1));g.addColorStop(.22,css(c,.85));g.addColorStop(.55,css(c,.26));g.addColorStop(1,css(c,0));x.fillStyle=g;x.fillRect(0,0,r*2,r*2);return C}
 function flare(c){const r=96,C=mk(r*2,r*2),x=C.getContext('2d'),g=x.createRadialGradient(r,r,0,r,r,r);g.addColorStop(0,'rgba(255,255,255,.7)');g.addColorStop(.16,css(c,.5));g.addColorStop(.45,css(c,.15));g.addColorStop(1,css(c,0));x.fillStyle=g;x.fillRect(0,0,r*2,r*2);return C}
 function smoke(c,seed,r){r=r||24;const C=mk(r*2,r*2),x=C.getContext('2d'),rn=sr(seed*977+13);for(let k=0;k<6;k++){const a=rn()*TAU,d=rn()*r*.35,bx=r+Math.cos(a)*d,by=r+Math.sin(a)*d,br=r*(.45+rn()*.35),g=x.createRadialGradient(bx,by,0,bx,by,br);g.addColorStop(0,css(c,.42));g.addColorStop(.6,css(c,.18));g.addColorStop(1,css(c,0));x.fillStyle=g;x.fillRect(0,0,r*2,r*2)}return C}
 function streaks(c){const out=[];for(let i=0;i<16;i++){const C=mk(44,44),x=C.getContext('2d');x.translate(22,22);x.rotate(i/16*Math.PI);x.scale(1,.2);const g=x.createRadialGradient(0,0,0,0,0,21);g.addColorStop(0,css(mixc(c,WHITE,.6),1));g.addColorStop(.18,css(c,.95));g.addColorStop(.55,css(c,.38));g.addColorStop(1,css(c,0));x.fillStyle=g;x.beginPath();x.arc(0,0,21,0,TAU);x.fill();out.push(C)}return out}
 function star(c){const C=mk(28,28),x=C.getContext('2d');x.drawImage(glow(14,c),0,0);x.globalCompositeOperation='lighter';x.fillStyle=css(mixc(c,WHITE,.75),.95);x.beginPath();x.moveTo(14,1);x.lineTo(15.3,12.7);x.lineTo(27,14);x.lineTo(15.3,15.3);x.lineTo(14,27);x.lineTo(12.7,15.3);x.lineTo(1,14);x.lineTo(12.7,12.7);x.closePath();x.fill();return C}
 function bubble(c){const C=mk(24,24),x=C.getContext('2d');x.fillStyle=css(c,.14);x.beginPath();x.arc(12,12,9,0,TAU);x.fill();x.strokeStyle=css(mixc(c,WHITE,.3),.85);x.lineWidth=1.6;x.stroke();x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=1.4;x.beginPath();x.arc(12,12,6,3.6,4.6);x.stroke();return C}
 function spark(c){const C=mk(12,12),x=C.getContext('2d');x.fillStyle=css(c,.35);x.fillRect(1,1,10,10);x.fillStyle=css(mixc(c,WHITE,.6),1);x.fillRect(4,4,4,4);return C}
 const FLK={feather(x,c,l){const g=x.createLinearGradient(-10,0,10,0);g.addColorStop(0,css(mixc(c,BLACK,.3),1));g.addColorStop(.6,css(c,1));g.addColorStop(1,css(l,1));x.fillStyle=g;x.beginPath();x.moveTo(-10,0);x.bezierCurveTo(-5,-5,5,-4.6,10,-.4);x.bezierCurveTo(5,3.4,-5,3.8,-10,0);x.fill();x.strokeStyle=css(l,.95);x.lineWidth=.9;x.beginPath();x.moveTo(-11,.4);x.quadraticCurveTo(0,-.6,10,-.4);x.stroke()},
  petal(x,c,l){x.fillStyle=css(c,.95);x.beginPath();x.moveTo(-8,0);x.bezierCurveTo(-4,-6,5,-6,8,0);x.bezierCurveTo(5,5,-4,5,-8,0);x.fill();x.strokeStyle=css(l,.8);x.lineWidth=.9;x.beginPath();x.moveTo(-6,0);x.lineTo(6,0);x.stroke()},
  shard(x,c,l){x.fillStyle=css(c,.95);x.beginPath();x.moveTo(-9,0);x.lineTo(-1,-4);x.lineTo(9,0);x.lineTo(-1,3.5);x.closePath();x.fill();x.strokeStyle=css(l,.9);x.lineWidth=.9;x.beginPath();x.moveTo(-9,0);x.lineTo(-1,-4);x.lineTo(9,0);x.stroke()}};
 function flakes(kind,c,l){const out=[];for(let i=0;i<8;i++){const C=mk(26,26),x=C.getContext('2d');x.translate(13,13);x.rotate(i/8*TAU);(FLK[kind]||FLK.feather)(x,c,l);out.push(C)}return out}
 function ring(cs){const S=160,h=S/2,C=mk(S,S),x=C.getContext('2d'),n=36;x.lineCap='round';for(const[lw,a,wt]of[[14,.16,0],[6,.6,0],[2,.85,.45]])for(let i=0;i<n;i++){x.strokeStyle=css(mixc(cs[Math.floor(i/n*cs.length)],WHITE,wt),a);x.lineWidth=lw;x.beginPath();x.arc(h,h,h-12,i/n*TAU,(i+1.15)/n*TAU);x.stroke()}return C}
 function gndSpr(c,a){const C=mk(64,16),x=C.getContext('2d');x.translate(32,8);x.scale(1,.25);const g=x.createRadialGradient(0,0,0,0,0,32);g.addColorStop(0,css(c,a));g.addColorStop(.5,css(c,a*.45));g.addColorStop(1,css(c,0));x.fillStyle=g;x.fillRect(-32,-32,64,64);return C}
 function kind(k,cs,flk){switch(k){case'glow':return cs.map(c=>glow(14,c));case'star':return cs.map(star);case'smoke':return cs.map((c,i)=>smoke(c,i+1));case'streak':return cs.map(streaks);
  case'bubble':return cs.map(bubble);case'spark':return cs.map(spark);case'flake':return[flakes(flk||'feather',cs[0],cs[1]||cs[0])];default:return cs.map(c=>glow(14,c))}}
 const SET=new Map();
 function set(w,tk){const id=w.id+':'+tk;let s=SET.get(id);if(s)return s;const p=((w.pal||[]).length>=4?w.pal:['#a07a2a','#f2d68a','#fff6dc','#ffd36a']).map(hx),th=theme(w),T=TH[th]||TH.arcane,C=cols(th,p),dk=th=='dark';
  s={tk,th,T,C,dk,main:kind(T.main,T.main=='flake'?C.flk:C.main,T.flk),acc:kind(T.acc,C.acc,T.flk),flk:T.flk?kind('flake',C.flk,T.flk):null,ring:ring(C.ring),
   gnd:dk?gndSpr(mixc(p[0],BLACK,.4),.7):gndSpr(C.ring[0],.6),gl:dk?null:glow(32,C.ring[0])};
  if(tk==2){s.mote=dk?C.acc.map(c=>glow(10,c)):C.acc.map(star);s.flare=dk?smoke(mixc(p[1],BLACK,.35),7,96):flare(C.ring[0]);s.ghost=[null,null];s.gq=0}
  SET.set(id,s);if(SET.size>4)SET.delete(SET.keys().next().value);return s}
 // afterimage: the wing at full flare recoloured once in the theme's colours (built in an idle callback, then just stamped)
 function ghost(s,w,k){try{const i=WINGS.indexOf(w),f=k?-1:1,S=Math.ceil(w.a.L*3.4+80),C=mk(S,S),x=C.getContext('2d'),ax=S/2,ay=Math.round(S*.55);WingArt.draw(x,i,ax,ay,f,1.3,2,0,0,1,null,0,{kf:0});
   const d=x.getImageData(0,0,S,S).data;let x0=S,x1=-1,y0=S,y1=-1;for(let y=0;y<S;y+=2)for(let q=0;q<S;q+=2)if(d[(y*S+q)*4+3]>16){if(q<x0)x0=q;if(q>x1)x1=q;if(y<y0)y0=y;if(y>y1)y1=y}
   if(x1<0){s.ghost[k]=false;return}x0=Math.max(0,x0-3);y0=Math.max(0,y0-3);const cw=Math.min(S-x0,x1-x0+6),ch=Math.min(S-y0,y1-y0+6),G=mk(cw,ch),q=G.getContext('2d');q.drawImage(C,x0,y0,cw,ch,0,0,cw,ch);
   q.globalCompositeOperation='source-atop';const lg=q.createLinearGradient(0,0,cw,ch),gc=s.C.gh;gc.forEach((c,j)=>lg.addColorStop(j/(gc.length-1),css(s.dk?c:mixc(c,WHITE,.2),1)));q.globalAlpha=.88;q.fillStyle=lg;q.fillRect(0,0,cw,ch);
   s.ghost[k]={c:G,ox:ax-x0,oy:ay-y0}}catch(_){s.ghost[k]=false}}
 function queueGhost(s,w){if(s.gq)return;s.gq=1;const run=()=>{for(const k of[0,1])if(s.ghost[k]===null)ghost(s,w,k)};try{if(window.requestIdleCallback)requestIdleCallback(run,{timeout:1500});else setTimeout(run,200)}catch(_){setTimeout(run,200)}}
 // ---------- particle pool (world coordinates). KD: 0 trail, 1 accent, 2 shed flake; MD: 0 always source-over (smoke, flakes), 1 light (additive at night)
 const N=48,X=new Float32Array(N),Y=new Float32Array(N),VX=new Float32Array(N),VY=new Float32Array(N),AG=new Float32Array(N),LF=new Float32Array(N),SZ=new Float32Array(N),GR=new Float32Array(N),RT=new Float32Array(N),VR=new Float32Array(N),AL=new Float32Array(N);
 const KD=new Uint8Array(N),CI=new Uint8Array(N),MD=new Uint8Array(N),SQ=new Uint32Array(N);let cur=0,seq=1;
 function spawn(kd,x,y,vx,vy,life,size,grow,alpha,md){let i=-1;for(let n=0;n<N;n++){const j=(cur+n)%N;if(AG[j]>=LF[j]){i=j;break}}if(i<0)i=cur;cur=(i+1)%N;
  X[i]=x;Y[i]=y;VX[i]=vx;VY[i]=vy;AG[i]=0;LF[i]=life;SZ[i]=size;GR[i]=grow;AL[i]=alpha;MD[i]=md;KD[i]=kd;RT[i]=R()*TAU;VR[i]=(R()-.5)*5;CI[i]=(R()*4)|0;SQ[i]=seq++;return i}
 const clear=()=>{for(let i=0;i<N;i++)AG[i]=LF[i]=0};
 const lerp=(r,u)=>r[0]+(r[1]-r[0])*u;
 const GH={l:0,age:0,x:0,y:0,k:0},RG=[0,1,2].map(()=>({l:0,age:0,x:0,y:0,k:0,a:0,s:null,ov:0}));
 const st={beats:0,bursts:0,rings:0,ghosts:0,frames:0};
 let clock=0,seen=0,beatK=0,flareK=0,mv=0,ema=1/60,base=1,lastGhost=-9,curW=null,curTk=0,S=null,ox=0,oy=0,fc=1,thin=1,q=2,rm=false,on=false,nightL=true,darkT=0,comp='lighter',emit=0,hv=0,hovPx=0,inWorld=false;
 const wingNow=()=>{try{return curWing(lvl)}catch(_){return null}};
 // inherited velocity: particles keep 35% of the player's motion plus a theme spread, so they stream behind and drift with you
 function shed(kd,x,y,k){const T=S.T,isMain=kd==0,kk=isMain?T.main:T.acc,md=kk=='smoke'||kk=='flake'?0:1;
  const life=(isMain?lerp(T.life,R()):.4+R()*.3)*(k<1?.8:1),size=isMain?lerp(T.size,R())*(curTk==2?1.1:1):(kk=='streak'?24+R()*10:6+R()*4);
  return spawn(kd,x,y,P.vx*.35+(R()-.5)*T.sp,P.vy*.35+(R()-.5)*T.sp,life,size,isMain?T.grow:0,(k<1?.55:1)*(kk=='smoke'?.8:.9),md)}
 function flake(x,y,vx,vy){if(!S)return;if(S.flk)spawn(2,x,y,vx,vy,1.1+R()*.5,22,0,.95,0);else spawn(1,x,y,vx,vy,.6+R()*.3,9,0,.9,1)}
 // strong flap from FLY7 (through WINGSFX.flap): legendary sheds flakes, mythic pulses its aura and leaves an afterimage
 function beat(){if(!curTk||!FLY7.F.on||!S)return;st.beats++;beatK=1;
  if(curTk==1){if(q>=1)for(let i=0,n=thin>1?1:2;i<n;i++){const s=R()<.5?-1:1;flake(P.x+s*(curW.a.L*.45+R()*14),P.y+P.h*.3+(R()-.5)*16,s*(20+R()*30)+P.vx*.3,-30+R()*30)}}
  else{flareK=Math.max(flareK,.55);const G=S.ghost&&S.ghost[fc<0?1:0];if(G&&q>=2&&!rm&&P.vy<-80&&clock-lastGhost>.45){lastGhost=clock;GH.l=.42;GH.age=0;GH.x=P.x;GH.y=P.y;GH.k=fc<0?1:0;st.ghosts++}}}
 function takeoff(){if(!S)return;st.bursts++;const take=()=>RG.reduce((a,b)=>b.age>=b.l?b:a.age>=a.l?a:(b.age/b.l>a.age/a.l?b:a));
  const p=take();Object.assign(p,{l:.6,age:0,x:P.x,y:P.y+P.h*.45,k:curTk,a:0,s:S.ring,ov:S.dk?1:0});st.rings++;flareK=1;
  if(curTk==2){const p2=take();Object.assign(p2,{l:.6,age:-.09,x:p.x,y:p.y,k:2,a:1,s:S.ring,ov:p.ov})}
  else if(q>=1)for(let i=0;i<6;i++){const a=i/6*TAU+R()*.4;flake(p.x+Math.cos(a)*14,p.y+Math.sin(a)*10,Math.cos(a)*120,Math.sin(a)*80-20)}
  try{WINGSFX.burst(curTk,curW)}catch(_){}}
 {const _f=WINGSFX.flap;WINGSFX.flap=function(s){try{beat()}catch(_){}return _f.apply(this,arguments)}}
 // ---------- per-frame update (driven by the local player's draw, dt from the main loop) ----------
 function update(){const dt=Math.min(.05,window.FDT||1/60);clock+=dt;ema+=(dt-ema)*.05;base=Math.min(base+dt*.0002,ema);   // base ~ the display's own frame time
  const w=wingNow(),tk=w?FLY7.tkOf(w):0;if(w!==curW){curW=w;curTk=tk;S=tk?set(w,tk):null;clear();if(!tk)mv=0}
  q=QM.cur.wfx|0;rm=!!QM.reduce;
  // additive light reads at night and underground; on a bright day sky the same sprites are laid on normally so their colour shows
  if(clock>darkT){darkT=clock+.25;let d=0;try{d=depthAt(P.x,P.y)}catch(_){}nightL=(typeof night=='number'&&night>.45)||d>8;comp=nightL?'lighter':'source-over'}
  const over=ema/base;thin=q<=0||ema>.03||over>2?3:q==1||over>1.35?2:1;   // frames running over budget thin the layer out
  const fly=!!FLY7.F.on,air=!P.g&&!P.sw,hold=K.w||K[' ']||K.arrowup,glide=tk&&air&&!fly&&hold&&P.vy>0,k=tk?(fly?1:glide?.5:0):0;
  if(FLY7.F.bursts!==seen){seen=FLY7.F.bursts;if(tk)takeoff()}
  if(tk==2&&S&&S.ghost&&S.ghost[0]===null&&q>=2)queueGhost(S,w);
  // grounded float: eases in on the ground (walking too), drops out fast when you jump or fall
  const ht=tk&&P.g&&!P.sw?1:0;hv+=(ht-hv)*Math.min(1,dt*(ht>hv?2.2:12));if(hv<.002)hv=0;hovPx=hv*(6+2*Math.sin(clock*1.8));
  mv+=((tk==2?(fly?1:air?.5:0):0)-mv)*Math.min(1,dt*5);beatK=Math.max(0,beatK-dt*3.2);flareK=Math.max(0,flareK-dt*(rm?3:1.8));
  if(k>0&&S&&Math.abs(P.vx)+Math.abs(P.vy)>30){emit+=dt*(curTk==2?40:30)*k/thin;let n=0;while(emit>=1&&n++<4){emit--;const x=P.x-fc*4+(R()-.5)*8,y=P.y+P.h*.42+(R()-.5)*10;shed(0,x,y,k);if(q>=1&&R()<S.T.ac*(curTk==2?1.4:1)*(S.dk&&nightL?2:1)/thin)shed(1,x+(R()-.5)*14,y+(R()-.5)*14,k)}}else emit=0;
  if(curTk==1&&glide&&q>=1&&R()<dt*2.5)flake(P.x+(R()<.5?-1:1)*curW.a.L*.45,P.y+P.h*.3,P.vx*.3,-10);
  let alive=0;const T=S?S.T:TH.arcane,dg=Math.exp(-T.drag*dt);
  for(let i=0;i<N;i++){if(AG[i]>=LF[i])continue;AG[i]+=dt;alive++;const kd=KD[i];VY[i]+=(kd==2?45:T.g)*dt;VX[i]*=kd==2?Math.exp(-1.6*dt):dg;VY[i]*=kd==2?1:dg;if(kd==2&&VY[i]>55)VY[i]=55;
   X[i]+=(VX[i]+(kd==2||T.main=='flake'&&kd==0?Math.sin(AG[i]*3+i)*20:0))*dt;Y[i]+=VY[i]*dt;RT[i]+=VR[i]*dt}
  if(GH.age<GH.l){GH.age+=dt;alive++}for(const p of RG)if(p.age<p.l){p.age+=dt;alive++}
  return alive>0||mv>.01||hv>0}
 // ---------- draw: behind the character (ground glow, aura, afterimage, particles, back motes) and in front (front motes, rings)
 function motes(g,front){if(mv<.02||!S||!S.mote)return;const n=thin>=3?3:5,L=curW?curW.a.L:80,rx=24+L*.2,cx=P.x+ox,cy=P.y+P.h*.42+oy+(WingArt.FL.bob||0);
  for(let i=0;i<n;i++){const a=clock*(rm?.8:1.7)+i*TAU/n,z=Math.sin(a);if(front!==(z>=0))continue;const s=(12+4*z)*(.8+.2*Math.sin(clock*7+i*1.9));g.globalAlpha=mv*(.5+.25*(z+1));g.drawImage(S.mote[i%S.mote.length],cx+Math.cos(a)*rx-s/2,cy+z*9-6+Math.sin(clock*2.3+i)*3-s/2,s,s)}}
 function parts(g,md){for(let i=0;i<N;i++){if(AG[i]>=LF[i]||MD[i]!==md)continue;const u=AG[i]/LF[i],a=AL[i]*(u<.12?u/.12:1)*Math.pow(1-u,1.3);if(a<.01)continue;
  const arr=KD[i]==0?S.main:KD[i]==1?S.acc:S.flk;if(!arr)continue;let img=arr[CI[i]%arr.length];
  if(img.length){img=img.length==16?img[((Math.round(Math.atan2(VY[i],VX[i])/Math.PI*16)%16)+16)%16]:img[((Math.round(RT[i]/TAU*8)%8)+8)%8]}
  const s=SZ[i]*(1+GR[i]*u);g.globalAlpha=a;g.drawImage(img,X[i]+ox-s/2,Y[i]+oy-s/2,s,s)}}
 function pre(g){if(!S)return;g.save();
  if(hv>0){const fx=P.x+ox,fy=P.y+P.h+oy,w=58*(1-.12*Math.sin(clock*1.8));g.globalCompositeOperation=S.dk?'source-over':comp;g.globalAlpha=hv*(S.dk?.75:nightL?.55:.4);g.drawImage(S.gnd,fx-w/2,fy-7,w,14);
   if(S.gl){const L=curW.a.L,sz=L*.9+30;g.globalCompositeOperation='lighter';g.globalAlpha=hv*(.1+.06*Math.sin(clock*1.3))*(nightL?1:.6);g.drawImage(S.gl,fx-sz/2,P.y+P.h*.4+oy-hovPx-sz/2,sz,sz)}}
  if(S.flare&&mv>.01){const L=curW.a.L,sz=(L+50)*(1+.1*beatK+.25*flareK);
   if(S.dk){g.globalCompositeOperation='source-over';g.globalAlpha=Math.min(1,(.22+.2*flareK)*mv)}else{g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,(.3+.35*flareK+.1*beatK)*mv*(nightL?1:.4))}
   g.drawImage(S.flare,P.x+ox-sz/2,P.y+P.h*.45+oy-sz/2,sz,sz)}
  if(S.ghost&&GH.age<GH.l){const G=S.ghost[GH.k];if(G){const u=GH.age/GH.l;g.globalCompositeOperation=S.dk?'source-over':comp;g.globalAlpha=(S.dk?.36:nightL?.42:.32)*(1-u)*(1-u);g.drawImage(G.c,GH.x+ox-G.ox,GH.y+24+oy-G.oy-u*6)}}
  g.globalCompositeOperation='source-over';parts(g,0);g.globalCompositeOperation=comp;parts(g,1);motes(g,false);g.restore()}
 function post(g){g.save();g.globalCompositeOperation=comp;motes(g,true);
  for(const p of RG)if(p.age<p.l&&p.age>=0&&p.s){const u=p.age/p.l,e=1-Math.pow(1-u,3),sz=(p.a?14:24)+e*(p.k==2?(p.a?120:200):170);g.globalCompositeOperation=p.ov?'source-over':comp;g.globalAlpha=Math.pow(1-u,1.5)*.9;g.drawImage(p.s,p.x+ox-sz/2,p.y+oy-sz/2,sz,sz)}
  g.restore()}
 const err=e=>{if(!err.n){err.n=1;console.error('WTRAIL',e)}};
 // the local player's character: effects behind it, then the character (and its wings), then the front layer
 {const _dc=drawChar;drawChar=function(cx,cy){if(arguments[15]!=='me')return _dc.apply(this,arguments);if(api.off){hv=hovPx=0;return _dc.apply(this,arguments)}on=false;
   try{if(entered){fc=arguments[2]<0?-1:1;ox=cx-P.x;oy=cy-P.y;on=update();if(on){st.frames++;pre(g)}}}catch(e){err(e);on=false}
   inWorld=true;let r;try{r=_dc.apply(this,arguments)}finally{inWorld=false}if(on)try{post(g)}catch(e){err(e)}return r}}
 // grounded float: lift the drawn body + wings through the aura-pose hook (visual only), and keep the wings half open while grounded
 {const _pz=AC6.PZ;if(_pz)AC6.PZ=function(key,wi,air,vx,sw,t,local){const r=_pz.apply(this,arguments);if(r&&local&&key==='me'&&inWorld&&hovPx>0&&!air)r.lev=Math.max(r.lev,hovPx);return r}}
 try{WING9.gnd=()=>inWorld?hv:0}catch(_){}
 // ---------- test / perf helpers ----------
 function counts(){let t=0,a=0,f=0,rg=0;for(let i=0;i<N;i++)if(AG[i]<LF[i]){if(KD[i]==0)t++;else if(KD[i]==1)a++;else f++}for(const p of RG)if(p.age<p.l)rg++;
  return{tk:curTk,theme:S?S.th:null,trail:t,feathers:f,twinkles:a,ghosts:GH.age<GH.l?1:0,rings:rg,motes:+mv.toFixed(2),thin,hover:+hovPx.toFixed(2)}}
 // one particle by id (default: the newest trail particle), in world px, for the velocity / fade checks
 function peek(id){let b=-1;for(let i=0;i<N;i++){if(AG[i]>=LF[i])continue;if(id){if(SQ[i]===id){b=i;break}}else if(KD[i]==0&&(b<0||SQ[i]>SQ[b]))b=i}if(b<0)return null;const u=AG[b]/LF[b];
  return{id:SQ[b],x:X[b],y:Y[b],vx:VX[b],vy:VY[b],age:AG[b],life:LF[b],alpha:+(AL[b]*(u<.12?u/.12:1)*Math.pow(1-u,1.3)).toFixed(4)}}
 // draw cost of one full frame of effects (pools filled to the cap) on an offscreen 1280x720 canvas, ms per frame
 function bench(id,n){const w=wingById(id),tk=w?FLY7.tkOf(w):0;if(!tk)return null;const sv=[curW,curTk,S,ox,oy,mv,hv];curW=w;curTk=tk;S=set(w,tk);if(S.ghost)for(const k of[0,1])if(S.ghost[k]===null)ghost(S,w,k);
  ox=640-P.x;oy=360-P.y;mv=tk==2?1:0;hv=0;clear();cur=0;for(let i=0;i<N;i++){const kd=i%6==5?1:i%9==8&&S.flk?2:0,kk=kd==0?S.T.main:S.T.acc;spawn(kd,P.x-i*6,P.y+20+i*3,-40,10,1,kd==0?lerp(S.T.size,.5):10,0,.9,kk=='smoke'||kk=='flake'||kd==2?0:1);AG[i]=.3}
  GH.l=.5;GH.age=.1;GH.x=P.x;GH.y=P.y;GH.k=0;Object.assign(RG[0],{l:.6,age:.2,x:P.x,y:P.y,k:tk,a:0,s:S.ring,ov:S.dk?1:0});
  const c=mk(1280,720).getContext('2d'),t0=performance.now();n=n||300;for(let i=0;i<n;i++){pre(c);post(c)}const ms=(performance.now()-t0)/n;
  clear();GH.l=GH.age=0;for(const p of RG)p.l=p.age=0;[curW,curTk,S,ox,oy,mv,hv]=sv;return{id,tk,theme:theme(w),ms:+ms.toFixed(3)}}
 // off: switch the whole layer off (A/B performance checks)
 const api={st,counts,peek,bench,set,theme,off:false,get tier(){return curTk},get hover(){return hovPx},get themes(){return Object.keys(TH)}};return api})();
