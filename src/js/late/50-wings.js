// ===== V6 wing renderer: layered, pre-rendered feather rows + crystal roots, animated per layer =====
// Painted procedurally (gradients, facets, glow). Reference art direction: white/blue crystal wings, violet feathered wings.
const WingArt=(()=>{
 const cache=new Map(),RAD=Math.PI/180;
 const sr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 function feather(x,L,w,col0,col1,col2,glow,edge,crystal,rand){
  x.save();x.beginPath();x.moveTo(0,0);x.bezierCurveTo(L*.25,-w*1.0,L*.7,-w*.9,L,-w*.15);x.bezierCurveTo(L*.72,w*.55,L*.3,w*.8,0,0);x.closePath();
  const gr=x.createLinearGradient(0,0,L,0);gr.addColorStop(0,col0);gr.addColorStop(.35,col1);gr.addColorStop(1,col2);
  if(glow){x.shadowColor=glow;x.shadowBlur=w*.9}
  x.fillStyle=gr;x.fill();x.shadowBlur=0;x.strokeStyle='rgba(28,24,80,.55)';x.lineWidth=Math.max(1,w*.07);x.stroke();
  // rachis + barbs: subtle vein lines give it feather structure
  x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=Math.max(.8,w*.09);x.beginPath();x.moveTo(L*.03,0);x.quadraticCurveTo(L*.5,-w*.22,L*.97,-w*.14);x.stroke();
  x.lineWidth=.6;x.strokeStyle='rgba(255,255,255,.22)';for(let i=1;i<7;i++){const u=i/7,px=L*u,py=-w*.2*u;x.beginPath();x.moveTo(px,py);x.lineTo(px+L*.12,py-w*(.55-.35*u));x.moveTo(px,py);x.lineTo(px+L*.12,py+w*(.45-.3*u));x.stroke()}
  if(edge){x.strokeStyle=edge;x.lineWidth=Math.max(1,w*.14);x.beginPath();x.moveTo(0,0);x.bezierCurveTo(L*.25,-w*1.0,L*.7,-w*.9,L,-w*.15);x.stroke()}
  if(crystal){ // faceted sheen: a couple of translucent triangles
   x.fillStyle='rgba(255,255,255,.2)';x.beginPath();x.moveTo(L*.2,-w*.2);x.lineTo(L*.62,-w*.7);x.lineTo(L*.48,-w*.05);x.closePath();x.fill();
   x.fillStyle='rgba(120,200,255,.18)';x.beginPath();x.moveTo(L*.4,w*.1);x.lineTo(L*.9,-w*.1);x.lineTo(L*.55,w*.5);x.closePath();x.fill()}
  x.restore()}
 const STY={}; // extra feather silhouettes (shop wings); filled in by 51-wings2.js
 function build(tier,hd){
  const W=WINGS[tier],ds=hd?2:1.25,CW=Math.round(250*ds*W.span*.9),CH=Math.round(260*ds*W.span*.9),ox=Math.round(CW*.1),oy=Math.round(CH*.72),pal=W.pal,rand=sr(tier*977+13),layers=[];
  const Lmax=Math.min(CW*.86,128*ds*W.span);
  const rows=W.rows;
  for(let j=0;j<rows;j++){ // layer j: row j (0 = back/longest)
   const c=document.createElement('canvas');c.width=CW;c.height=CH;const x=c.getContext('2d');x.translate(ox,oy);x.scale(ds,ds);const sc=1;
   const jf=j/(rows-1||1),n=W.fe-(j>>1),aMin=-60+j*2,aMax=26-j*4;
   const col0=j<rows/2?pal[0]:pal[1],col1=j<rows/2?pal[1]:pal[2],col2=j==rows-1?pal[2]:pal[2];
   for(let i=0;i<n;i++){const u=i/(n-1||1),a=(aMin+(aMax-aMin)*u+(rand()-.5)*3)*RAD,L=Lmax/ds*(.5+.5*Math.pow(1-u,.7))*(1-jf*.4)*(.94+rand()*.12),w=L*(.2+.06*(1-jf));
    x.save();x.rotate(a);x.globalAlpha=.78+.22*(j/rows);(STY[W.style]||feather)(x,L,w,col0,col1,col2,W.corona||W.cosmic?pal[3]:null,W.corona?pal[3]:null,W.crys>3,rand);x.restore()}
   if(W.nebula&&j==rows-1){ // sparkle-star dust across the front row
    x.globalCompositeOperation='source-atop';for(let i=0;i<46;i++){const a=(aMin+rand()*(aMax-aMin))*RAD,r=10+rand()*Lmax/ds*.8;x.fillStyle=['#fff','#7ff0ff','#ff9be8','#c05cff'][i%4];x.globalAlpha=.4+rand()*.5;x.fillRect(Math.cos(a)*r,Math.sin(a)*r,1.6,1.6)}}
   layers.push(c)}
  // crystal root cluster
  const cc=document.createElement('canvas');cc.width=CW;cc.height=CH;const x=cc.getContext('2d');x.translate(ox,oy);x.scale(ds,ds);
  x.shadowColor=pal[3];x.shadowBlur=14;
  for(let i=0;i<W.crys;i++){const a=(-100+rand()*120)*RAD,r=4+rand()*Lmax/ds*.28,px=Math.cos(a)*r,py=Math.sin(a)*r,sz=7+rand()*10+W.crys*.5,rot=a+(rand()-.5)*1.2;
   x.save();x.translate(px,py);x.rotate(rot);const g2=x.createLinearGradient(0,-sz,0,sz);g2.addColorStop(0,'#ffffff');g2.addColorStop(.5,pal[2]);g2.addColorStop(1,pal[3]);x.fillStyle=g2;x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=.9;
   x.beginPath();x.moveTo(0,-sz*1.5);x.lineTo(sz*.55,-sz*.2);x.lineTo(sz*.38,sz*.9);x.lineTo(-sz*.4,sz*.9);x.lineTo(-sz*.55,-sz*.25);x.closePath();x.globalAlpha=.9;x.fill();x.globalAlpha=1;x.stroke();
   x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.moveTo(0,-sz*1.5);x.lineTo(sz*.55,-sz*.2);x.lineTo(0,sz*.1);x.closePath();x.fill();x.fillStyle='rgba(60,120,255,.25)';x.beginPath();x.moveTo(0,sz*.1);x.lineTo(-sz*.55,-sz*.25);x.lineTo(-sz*.4,sz*.9);x.closePath();x.fill();x.restore()}
  layers.push(cc);
  return{layers,ox,oy,ds,W:CW,H:CH,rows}}
 function get(tier,hd){const k=tier+(hd?'h':'l');let a=cache.get(k);if(!a){a=build(tier,hd);cache.set(k,a)}return a}
 // draw both wings behind the body. cx,cy = character centre; f = facing; t = time; mode: 0 idle 1 run 2 air; strength = open amount
 // ---- wing pose: smoothed spread per character. 0 = folded against the back, 1 = fully spread.
 // Idle: wings rest folded, then every few seconds open calmly, hold, and fold back. Jump: snap open with a flap on the way up, glide open on the way down.
 const POSE=new Map();const sm=(a,b,x)=>{x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)};
 function pose(key,t,mode,vx,vy,ph){let p=POSE.get(key);if(!p){p={s:0,t:t,fl:0,air:0,lastAir:0};POSE.set(key,p);if(POSE.size>40)POSE.delete(POSE.keys().next().value)}
  let dt=t-p.t;p.t=t;if(!(dt>0)||dt>.25)dt=.016;
  const air=mode==2,u=((t+ph*3.1)%8.5)/8.5,idle=sm(0,.1,u)*(1-sm(.34,.46,u)); // calm open (~0.9s), hold (~2s), fold (~1s)
  let target=air?1:mode==1?.28+idle*.5:idle*.92;
  // flap: strong beats while rising, slow soft beats while gliding/falling, a small flutter when running
  const rising=air&&(vy==null||vy<60);const rate=rising?15:air?4.5:mode==1?7:0;const amp=rising?.3:air?.07:mode==1?.04:0;
  p.fl+=dt*rate;if(air&&!p.lastAir)p.fl=0;p.lastAir=air?1:0;
  const k=target>p.s?(air?20:3.2):(air?6:2.4);p.s+=(target-p.s)*(1-Math.exp(-dt*k));
  return{s:p.s,flap:Math.sin(p.fl)*amp*(air?1:p.s),rise:rising}}
 // draw both wings behind the body. cx,cy = character centre; f = facing; t = time; mode: 0 idle 1 run 2 air. key/vy optional (pose smoothing per character).
 function draw(g,tier,cx,cy,f,t,mode,vx,phase,alpha,key,vy){
  const art=get(tier,QM.cur.hd),W=WINGS[tier],ph=phase||0,ps=key?pose(key,t,mode,vx,vy,ph):{s:1,flap:0,rise:0},S=ps.s;
  const lag=Math.max(-.25,Math.min(.25,-(vx||0)*.0006))*f,sh=QM.cur.wfx>=1;
  g.save();if(alpha!=null)g.globalAlpha*=alpha;
  const sx=1/art.ds,rootY=cy+6,breathe=Math.sin(t*1.7+ph)*.018;
  for(let side=-1;side<=1;side+=2){
   g.save();g.translate(cx+side*4,rootY);g.scale(side,1);
   const far=(side*f<0)?.82:1,nl=art.layers.length;
   for(let i=0;i<nl;i++){
    const isC=i==nl-1,k=isC?0:(art.rows-1-i)/art.rows;                  // k: 0 = back/long row, ~1 = front/short row
    const sk=Math.max(0,Math.min(1,S*1.35-k*.35));                         // outer feathers open a beat later, so the wing unfurls like a fan
    const fold=1.4-k*.4,spread=-.1-k*.05;                                 // folded: swept down along the back; spread: lifted out and up
    const ang=fold+(spread-fold)*sk+ps.flap*(.55+k*.9)*(ps.rise?-1:1)+lag*(.5+k)+breathe*(1+k)+Math.sin(t*2.1+i*.7+ph)*.012*S;
    const wsx=.4+.6*sk+(ps.rise?ps.flap*.08:0);
    g.save();g.globalAlpha*=far;g.rotate(ang);g.scale(wsx,1-.06*(1-sk));
    g.drawImage(art.layers[i],-art.ox*sx,-art.oy*sx,art.W*sx,art.H*sx);
    if(sh&&isC){g.globalCompositeOperation='lighter';g.globalAlpha*=(.35+.2*Math.sin(t*3+ph))*Math.min(1,.4+S);g.drawImage(art.layers[i],-art.ox*sx,-art.oy*sx,art.W*sx,art.H*sx)}
    g.restore()}
   g.restore()}
  g.restore();return S}
 // extras that sit with the wings: halo above the head, storm arcs
 function extras(g,tier,cx,cy,t){const W=WINGS[tier],ph=QM.cur.wfx;if(!ph)return;if(W.fxk&&window.FX7)FX7.wingFx(W,cx,cy,t);
  if(W.halo){g.save();g.globalCompositeOperation='lighter';g.translate(cx,cy-50);g.scale(1,.28);g.lineWidth=3;g.strokeStyle=W.pal[3];g.shadowColor=W.pal[3];g.shadowBlur=10;g.globalAlpha=.85;g.beginPath();g.arc(0,0,19,0,6.3);g.stroke();g.lineWidth=1;g.globalAlpha=.6;g.setLineDash([3,5]);g.lineDashOffset=-t*20;g.beginPath();g.arc(0,0,24,0,6.3);g.stroke();g.restore()}
  if(W.arc&&ph>=2&&((t*8)|0)%5==0){g.save();g.globalCompositeOperation='lighter';g.strokeStyle='#bfe8ff';g.lineWidth=1.4;g.shadowColor='#78c8ff';g.shadowBlur=8;for(let s=-1;s<=1;s+=2){g.beginPath();let x=cx+s*8,y=cy-4;g.moveTo(x,y);for(let i=0;i<5;i++){x+=s*(10+((t*97+i*13)%7));y+=-6+((t*57+i*31)%12);g.lineTo(x,y)}g.stroke()}g.restore()}}
 return{get,draw,extras,STY,tiers:WINGS.length}})();
