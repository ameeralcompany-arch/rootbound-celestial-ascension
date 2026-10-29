// ===== Wing renderer v8: shape families painted procedurally from the WINGS art specs (20-data.js) =====
// fan  = rows of elements (feathers, petals, shards, blades, crescents, flames...) pre-rendered per row; rows unfurl like a fan,
//        feathers ruffle, crystals glint, star feathers twinkle. Multi-pair wings are several fan parts with an angle offset.
// mem  = bone + membrane wings, rebuilt each frame from a 3-bone arm and fingers, so the membrane flexes and billows.
// mech = segmented plates hinged on an articulated arm; plates open one after another.
// frag = floating fragments (stones, void shards, stars) that drift, spin and gather into a wing; optional constellation lines.
// rib  = energy ribbons (nebula, wind, water, flame, void) stroked per frame along a waving spine.
// Static art is cached per wing + resolution (LRU), so a frame only costs transforms, a few strokes and some twinkles.
const WingArt=(()=>{
 const RAD=Math.PI/180,cache=new Map(),CMAX=56;
 const sr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const hash=s=>{let h=7;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return h};
 const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ease=x=>{x=cl(x,0,1);return x*x*(3-2*x)};
 const hx=h=>{const n=parseInt(String(h).slice(1),16);return[n>>16&255,n>>8&255,n&255]};
 const rgba=(h,a)=>{const c=hx(h);return'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'};
 const mix=(a,b,t)=>{const p=hx(a),q=hx(b);return'#'+p.map((v,i)=>('0'+Math.round(v+(q[i]-v)*t).toString(16)).slice(-2)).join('')};
 const lum=h=>{const c=hx(h);return(c[0]*.3+c[1]*.59+c[2]*.11)/255};
 const mkC=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(2,Math.ceil(w));c.height=Math.max(2,Math.ceil(h));return c};
 // ---------- element outlines (pointing along +x from the attach point) ----------
 const PATH={
  round(x,L,w){x.moveTo(0,-w*.22);x.bezierCurveTo(L*.3,-w*1.15,L*.86,-w*1.18,L*.99,-w*.12);x.bezierCurveTo(L*1.03,w*.55,L*.55,w*.95,0,w*.26)},
  point(x,L,w){x.moveTo(0,-w*.2);x.bezierCurveTo(L*.3,-w*.98,L*.76,-w*.78,L,-w*.04);x.bezierCurveTo(L*.8,w*.52,L*.34,w*.72,0,w*.22)},
  sickle(x,L,w){x.moveTo(0,-w*.4);x.bezierCurveTo(L*.35,-w*1.3,L*.75,-w*1.5,L,-w*2.3);x.bezierCurveTo(L*.84,-w*.8,L*.45,w*.6,0,w*.4)},
  ragged(x,L,w){x.moveTo(0,-w*.2);x.bezierCurveTo(L*.3,-w*.95,L*.62,-w*.85,L*.8,-w*.62);x.lineTo(L*.86,-w*.36);x.lineTo(L*.92,-w*.58);x.lineTo(L*.96,-w*.28);x.lineTo(L,-w*.02);x.lineTo(L*.92,w*.14);x.lineTo(L*.95,w*.32);x.lineTo(L*.83,w*.4);x.bezierCurveTo(L*.6,w*.7,L*.3,w*.7,0,w*.22)},
  real(x,L,w){const up=w*.55,lo=w*.95;x.moveTo(0,0);x.bezierCurveTo(L*.25,-up,L*.75,-up*1.05,L*.97,-up*.25);x.quadraticCurveTo(L*1.04,0,L*.96,lo*.3);x.bezierCurveTo(L*.7,lo*1.15,L*.28,lo,0,0)},
  petal(x,L,w){x.moveTo(0,0);x.bezierCurveTo(L*.2,-w*1.3,L*.8,-w*1.4,L*.98,-w*.35);x.lineTo(L*.88,-w*.05);x.lineTo(L,w*.3);x.bezierCurveTo(L*.7,w*1.1,L*.25,w*1.0,0,0)},
  lobe(x,L,w){x.moveTo(0,0);x.bezierCurveTo(L*.05,-w*1.15,L*.88,-w*1.3,L,-w*.2);x.bezierCurveTo(L*1.02,w*.6,L*.45,w*.9,0,0)},
  shard(x,L,w){x.moveTo(0,0);x.lineTo(L*.32,-w*.95);x.lineTo(L,-w*.06);x.lineTo(L*.5,w*.72)},
  ice(x,L,w){x.moveTo(0,0);x.lineTo(L*.16,-w*.62);x.lineTo(L*.74,-w*.5);x.lineTo(L,-w*.02);x.lineTo(L*.76,w*.44);x.lineTo(L*.18,w*.5)},
  blade(x,L,w){x.moveTo(0,-w*.3);x.lineTo(L*.72,-w*.62);x.lineTo(L,-w*.12);x.lineTo(L*.64,w*.34);x.lineTo(0,w*.28)},
  crescent(x,L,w){x.moveTo(0,-w*.25);x.quadraticCurveTo(L*.5,-w*2.3,L,-w*1.0);x.quadraticCurveTo(L*.52,-w*.7,0,w*.35)},
  flame(x,L,w){x.moveTo(0,-w*.4);x.bezierCurveTo(L*.3,-w*1.15,L*.48,-w*.2,L*.68,-w*.72);x.bezierCurveTo(L*.8,-w*1.02,L*.9,-w*.62,L,-w*.95);x.bezierCurveTo(L*.88,-w*.1,L*.72,w*.62,L*.46,w*.3);x.bezierCurveTo(L*.3,w*.82,L*.1,w*.55,0,w*.4)},
  wisp(x,L,w){x.moveTo(0,-w*.4);x.bezierCurveTo(L*.35,-w*1.25,L*.62,-w*.1,L*.78,-w*.62);x.lineTo(L*.86,-w*.3);x.bezierCurveTo(L*.92,-w*.5,L*.96,-w*.62,L,-w*.86);x.bezierCurveTo(L*.88,w*.2,L*.6,w*.5,L*.42,w*.2);x.lineTo(L*.3,w*.52);x.bezierCurveTo(L*.18,w*.42,L*.08,w*.5,0,w*.4)}};
 // crescent moon: the outer circle minus an offset inner circle (convex side outward)
 PATH.moon=(x,L,w)=>{const R=L*.5,d=-R*.58,r=R*.8,x0=(R*R-r*r+d*d)/(2*d),y0=Math.sqrt(Math.max(0,R*R-x0*x0)),a1=Math.atan2(y0,x0),b1=Math.atan2(y0,x0-d);x.moveTo(R+x0,-y0);x.arc(R,0,R,-a1,a1,false);x.arc(R+d,0,r,b1,-b1,true)};
 PATH.water=PATH.round;PATH.star=PATH.point;PATH.storm=PATH.point;
 // ---------- interior detail per element type (drawn clipped to the outline) ----------
 const shade=(x,L,w,a)=>{const g=x.createLinearGradient(0,-w,0,w);g.addColorStop(0,'rgba(255,255,255,'+a+')');g.addColorStop(.48,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,'+Math.min(.6,a*1.4)+')');x.fillStyle=g;x.fillRect(-2,-w*2.6,L+4,w*3.8)};
 const barbs=(x,L,w,lite,dark,n)=>{x.lineCap='round';x.strokeStyle=lite;x.lineWidth=Math.max(.5,w*.07);x.beginPath();x.moveTo(L*.02,0);x.quadraticCurveTo(L*.5,-w*.15,L*.95,-w*.06);x.stroke();
  x.lineWidth=Math.max(.35,w*.035);for(let i=1;i<n;i++){const u=i/n,px=L*u,py=-w*.12*u;x.strokeStyle=lite;x.beginPath();x.moveTo(px,py);x.lineTo(px+L*.1,py-w*(.8-.4*u));x.stroke();x.strokeStyle=dark;x.beginPath();x.moveTo(px,py);x.lineTo(px+L*.1,py+w*(.7-.35*u));x.stroke()}};
 const bolt=(x,x0,y0,x1,y1,j,r,n)=>{x.beginPath();x.moveTo(x0,y0);for(let i=1;i<n;i++){const u=i/n;x.lineTo(lerp(x0,x1,u)+(r()-.5)*j,lerp(y0,y1,u)+(r()-.5)*j)}x.lineTo(x1,y1);x.stroke()};
 const DET={
  point(x,L,w){shade(x,L,w,.22);barbs(x,L,w,'rgba(255,255,255,.42)','rgba(0,0,0,.12)',7)},
  round(x,L,w){shade(x,L,w,.18);barbs(x,L,w,'rgba(255,255,255,.45)','rgba(0,0,0,.08)',5);x.fillStyle='rgba(255,255,255,.32)';x.beginPath();x.ellipse(L*.45,-w*.36,L*.26,w*.22,-.1,0,6.3);x.fill()},
  ragged(x,L,w){shade(x,L,w,.16);barbs(x,L,w,'rgba(255,255,255,.17)','rgba(0,0,0,.25)',9)},
  sickle(x,L,w,c){shade(x,L,w,.3);x.lineCap='round';x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=Math.max(.6,w*.16);x.beginPath();x.moveTo(L*.05,-w*.05);x.bezierCurveTo(L*.4,-w*.7,L*.75,-w*1.05,L*.97,-w*2.05);x.stroke();
   x.strokeStyle='rgba(40,50,70,.35)';x.lineWidth=Math.max(.5,w*.1);x.beginPath();x.moveTo(L*.05,w*.22);x.bezierCurveTo(L*.4,w*.05,L*.75,-w*.5,L*.94,-w*1.5);x.stroke()},
  real(x,L,w,c,r){const up=w*.55,lo=w*.95,N=Math.max(10,(L/2.6)|0);x.lineWidth=Math.max(.45,w*.024);
   for(let i=1;i<N;i++){const u=i/N,bx=L*u,sw=L*.12*(1-u*.4),ju=(r()-.5)*w*.04;x.strokeStyle='rgba(255,255,255,'+(.14+.1*(1-u))+')';x.beginPath();x.moveTo(bx,0);x.lineTo(bx+sw,-up*(1-u*.55)+ju);x.stroke();x.strokeStyle='rgba(0,0,0,'+(.1+.12*u)+')';x.beginPath();x.moveTo(bx,0);x.lineTo(bx+sw*1.1,lo*(1-u*.5)+ju);x.stroke()}
   shade(x,L,w,.24);x.lineCap='round';x.strokeStyle=c.c2;x.lineWidth=Math.max(.7,w*.05);x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(L*.5,-w*.04,L*.96,-w*.02);x.stroke()},
  petal(x,L,w){shade(x,L,w,.16);x.strokeStyle='rgba(190,60,110,.42)';x.lineWidth=Math.max(.8,w*.06);x.beginPath();x.moveTo(L*.05,0);x.quadraticCurveTo(L*.5,-w*.25,L*.9,-w*.05);x.stroke();x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(L*.4,-w*.5,L*.2,w*.25,-.2,0,6.3);x.fill()},
  lobe(x,L,w,c){x.strokeStyle=rgba(c.pal[3],.55);x.lineWidth=Math.max(.8,w*.04);for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(L*.04,0);x.quadraticCurveTo(L*.5,i*w*.4,L*.95,i*w*.42-w*.15);x.stroke()}
   x.fillStyle='#fff0d8';x.beginPath();x.ellipse(L*.68,-w*.36,w*.19,w*.26,.4,0,6.3);x.fill();x.fillStyle='#2a0612';x.beginPath();x.ellipse(L*.69,-w*.36,w*.1,w*.14,.4,0,6.3);x.fill();
   x.strokeStyle=rgba(c.pal[2],.8);x.lineWidth=Math.max(1,w*.08);x.beginPath();x.moveTo(L*.15,-w*.62);x.bezierCurveTo(L*.5,-w*1.0,L*.9,-w*.9,L*.98,-w*.2);x.stroke()},
  shard(x,L,w){x.fillStyle='rgba(255,255,255,.34)';x.beginPath();x.moveTo(0,0);x.lineTo(L*.32,-w*.95);x.lineTo(L*.5,-w*.08);x.closePath();x.fill();x.fillStyle='rgba(30,0,60,.25)';x.beginPath();x.moveTo(L*.5,-w*.08);x.lineTo(L,-w*.06);x.lineTo(L*.5,w*.72);x.closePath();x.fill();
   x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=Math.max(.5,w*.04);x.beginPath();x.moveTo(L*.32,-w*.95);x.lineTo(L*.5,w*.72);x.moveTo(0,0);x.lineTo(L,-w*.06);x.stroke()},
  ice(x,L,w,c,r){x.fillStyle='rgba(255,255,255,.28)';x.beginPath();x.moveTo(0,0);x.lineTo(L*.16,-w*.62);x.lineTo(L*.74,-w*.5);x.lineTo(L*.5,-w*.05);x.closePath();x.fill();x.fillStyle='rgba(20,70,140,.2)';x.beginPath();x.moveTo(L*.5,-w*.05);x.lineTo(L,-w*.02);x.lineTo(L*.76,w*.44);x.closePath();x.fill();
   x.strokeStyle='rgba(255,255,255,.75)';x.lineCap='round';x.lineWidth=Math.max(.5,w*.05);x.beginPath();x.moveTo(L*.06,0);x.lineTo(L*.94,-w*.02);for(let i=1;i<5;i++){const px=L*i/5.2,s=w*(.42-.05*i);x.moveTo(px,0);x.lineTo(px+s*.7,-s);x.moveTo(px,0);x.lineTo(px+s*.7,s);x.moveTo(px+s*.35,-s*.5);x.lineTo(px+s*.75,-s*.42)}x.stroke()},
  blade(x,L,w,c){const g=x.createLinearGradient(0,-w*.6,0,w*.3);g.addColorStop(0,'rgba(255,255,255,.3)');g.addColorStop(.5,'rgba(255,255,255,.04)');g.addColorStop(1,'rgba(0,0,0,.3)');x.fillStyle=g;x.beginPath();x.moveTo(0,-w*.3);x.lineTo(L*.72,-w*.62);x.lineTo(L,-w*.12);x.lineTo(L*.1,-w*.05);x.closePath();x.fill();
   x.strokeStyle=rgba(c.pal[3],.5);x.lineWidth=Math.max(.5,w*.06);x.beginPath();x.moveTo(L*.08,-w*.1);x.lineTo(L*.96,-w*.13);x.stroke()},
  moon(x,L,w,c){const R=L*.5;const g=x.createRadialGradient(R*1.3,-R*.3,R*.1,R,0,R);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,-R,L,L);x.fillStyle=rgba(c.pal[0],.25);for(let i=0;i<3;i++){x.beginPath();x.arc(R*(1.5+.15*i),R*(-.4+.4*i),R*(.08+.04*i),0,6.3);x.fill()}},
  crescent(x,L,w,c){x.strokeStyle=rgba(c.pal[3],.45);x.lineWidth=Math.max(1,w*.25);x.beginPath();x.moveTo(L*.05,-w*.1);x.quadraticCurveTo(L*.5,-w*2.0,L*.97,-w*1.0);x.stroke();x.fillStyle='rgba(255,255,255,.12)';x.beginPath();x.ellipse(L*.45,-w*1.15,L*.22,w*.3,-.35,0,6.3);x.fill()},
  flame(x,L,w,c){x.globalCompositeOperation='lighter';x.fillStyle=rgba(c.pal[2],.55);x.save();x.translate(L*.04,w*.05);x.scale(.74,.56);x.beginPath();PATH.flame(x,L,w);x.fill();x.fillStyle=rgba(c.pal[3],.6);x.scale(.7,.6);x.beginPath();PATH.flame(x,L,w);x.fill();x.restore();x.globalCompositeOperation='source-over'},
  water(x,L,w,c,r){shade(x,L,w,.18);x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.ellipse(L*.42,-w*.4,L*.24,w*.16,-.12,0,6.3);x.fill();x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=Math.max(.5,w*.05);for(let i=0;i<3;i++){x.beginPath();x.arc(L*(.3+r()*.55),(r()-.3)*w*.8,Math.max(1,w*(.08+r()*.1)),0,6.3);x.stroke()}
   x.strokeStyle=rgba(c.pal[3],.5);x.beginPath();x.moveTo(L*.05,w*.15);x.quadraticCurveTo(L*.5,w*.3,L*.95,-w*.05);x.stroke()},
  star(x,L,w,c,r){shade(x,L,w,.12);x.globalCompositeOperation='lighter';x.fillStyle=rgba(c.pal[3],.22);x.beginPath();x.ellipse(L*(.3+r()*.4),(r()-.5)*w*.6,L*.22,w*.45,0,0,6.3);x.fill();
   for(let i=0;i<16;i++){x.fillStyle=['#ffffff','#bfefff','#ffc8f2','#d8c8ff'][i%4];x.globalAlpha=.35+r()*.65;const s=.6+r()*1.4;x.fillRect(r()*L,(r()-.5)*w*1.4,s,s)}x.globalAlpha=1;x.globalCompositeOperation='source-over';barbs(x,L,w,'rgba(200,220,255,.25)','rgba(0,0,0,.1)',5)},
  storm(x,L,w,c,r){shade(x,L,w,.2);barbs(x,L,w,'rgba(200,215,255,.22)','rgba(0,0,0,.2)',6);x.lineCap='round';x.lineJoin='round';x.shadowColor=c.pal[3];x.shadowBlur=Math.max(2,w*.6);x.strokeStyle=c.pal[3];x.lineWidth=Math.max(.7,w*.08);bolt(x,L*.06,0,L*.95,-w*.08,w*.7,r,6);x.lineWidth=Math.max(.5,w*.04);bolt(x,L*.4,-w*.05,L*.75,w*.45,w*.4,r,3);x.shadowBlur=0},
  wisp(x,L,w,c){shade(x,L,w,.1);x.strokeStyle=rgba(c.pal[3],.35);x.lineCap='round';x.lineWidth=Math.max(.5,w*.07);for(let i=0;i<3;i++){x.beginPath();x.moveTo(L*.05,(i-1)*w*.2);x.bezierCurveTo(L*.4,(i-1)*w*.4-w*.4,L*.6,w*.1,L*.92,-w*.6+(i*w*.15));x.stroke()}}};
 function dress(x,tip,L,w,c,r){const P=PATH[tip]||PATH.point;x.save();x.beginPath();P(x,L,w);x.closePath();
  const g=x.createLinearGradient(0,0,L,0);if(c.tipc){g.addColorStop(0,c.c0);g.addColorStop(.4,c.c1);g.addColorStop(Math.max(.45,1-c.tl),c.c2);g.addColorStop(1,c.tipc)}else{g.addColorStop(0,c.c0);g.addColorStop(.45,c.c1);g.addColorStop(1,c.c2)}
  if(c.glow){x.shadowColor=c.glow;x.shadowBlur=Math.max(3,w*.9)}x.fillStyle=g;x.fill();x.shadowBlur=0;
  x.save();x.clip();(DET[tip]||DET.point)(x,L,w,c,r);x.restore();
  x.lineJoin='round';x.strokeStyle=c.line;x.lineWidth=Math.max(.6,w*.06);x.stroke();
  if(c.rim){x.strokeStyle=c.rim;x.lineWidth=Math.max(.8,w*.09);x.stroke()}x.restore()}
 // length curves along the fan (u = 0 top .. 1 bottom)
 const LC={top:u=>.45+.55*Math.pow(1-u,.8),mid:u=>.6+.4*Math.sin(Math.PI*cl((1-u)*1.1,0,1)),eagle:u=>.5+.5*Math.sin(Math.PI/2*cl((1-u)*1.6,0,1)),flat:u=>.86+.14*(1-u)};
 // elements attach along a leading-edge "arm" (angle p.arm, length att*L): outer elements (u=0) sit at the wrist and point
 // up/out, inner ones hang from near the shoulder. Each further row is a shorter covert row laid over the bases.
 function armOf(p){return(p.arm!=null?p.arm:p.a[0]+12)*RAD}
 function fanEls(p,L,j,R,r,cov){const n=Math.max(2,Math.round(p.n*(1-j*.1))),a0=p.a[0]+j*5,a1=p.a[1]-j*7,att=p.att==null?.5:p.att,armA=armOf(p),lm=Math.pow(p.rf||.6,j),out=[];
  for(let i=0;i<n;i++){const u=n>1?i/(n-1):0,a=(a0+(a1-a0)*u+(r()-.5)*3)*RAD,d=att*L*(1-u)*(1-j*.03);
   let Li=L*(p.lc=='rand'?.58+.42*r():(LC[p.lc]||LC.top)(u))*(1-.5*att*(1-u))*lm*(.94+r()*.1);if(cov)Li*=.9;let wi=Li*p.fw*(1+j*.3);if(p.fing&&j==0&&u<.36)wi*=.6;
   out.push({x:Math.cos(armA)*d,y:Math.sin(armA)*d,a,L:Li,w:wi})}return out}
 function sample(l,ds,n,r){const out=[];if(!n)return out;let d;try{d=l.c.getContext('2d').getImageData(0,0,l.c.width,l.c.height).data}catch(_){return out}
  for(let k=0;k<n*30&&out.length<n;k++){const px=(r()*l.c.width)|0,py=(r()*l.c.height)|0;if(d[(py*l.c.width+px)*4+3]>150)out.push([px/ds-l.ox,py/ds-l.oy,.6+r()*2.4,r()*6.3])}return out}
 const isDark=pal=>lum(pal[1])<.33;
 function buildFan(W,p,L,ds,pal,seed,A){const r=sr(seed),R=p.rows||1,layers=[],dark=isDark(pal);
  for(let j=0;j<R;j++){const jf=R>1?j/(R-1):1,cov=!!(p.cov&&j==R-1&&R>=3),tip=cov?p.cov:p.tip,els=fanEls(p,L,j,R,r,cov);
   const c={c0:mix(pal[0],pal[1],jf*.5),c1:mix(pal[1],pal[2],.12+jf*.5),c2:j==R-1?pal[2]:mix(pal[1],pal[2],.75),line:dark?rgba(pal[3],.38):rgba(mix(pal[0],'#000000',.45),.62),tipc:p.tipc,tl:p.tl||.3,rim:p.rim,glow:p.glow&&j==0?pal[3]:null,pal};
   let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const e of els){const ca=Math.cos(e.a),sa=Math.sin(e.a);for(const q of[[0,-e.w*2.5],[e.L*1.05,-e.w*2.5],[e.L*1.05,e.w*1.3],[0,e.w*1.3]]){const X=e.x+q[0]*ca-q[1]*sa,Y=e.y+q[0]*sa+q[1]*ca;if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y}}
   const m=4+(c.glow?L*.08:0);x0=Math.min(x0,0)-m;y0-=m;x1+=m;y1+=m;
   const cv=mkC((x1-x0)*ds,(y1-y0)*ds),x=cv.getContext('2d');x.scale(ds,ds);x.translate(-x0,-y0);x.globalAlpha=p.al||1;
   for(const e of els){x.save();x.translate(e.x,e.y);x.rotate(e.a);dress(x,tip,e.L,e.w,c,r);x.restore()}
   layers.push({c:cv,ox:-x0,oy:-y0,w:x1-x0,h:y1-y0})}
  const off=(p.off||0)*RAD,fl=layers[layers.length-1];
  const nS=(A.stars|0)*(p.sc&&p.sc<1?.3:1)|0,nG=A.glint?10:0;
  // folded = the same art squeezed narrow behind the shoulder (wrist up, feathers hanging along the back)
  return{kind:'fan',layers,fold:.12+(p.off||0)*RAD*.25,rest:off-(A.rise||0)*RAD,fsx:p.att===0?.4:.3,fsy:cl(58/L,.45,.86),stg:A.unfold?.85:.35,ruf:/point|round|ragged|real|star|storm/.test(p.tip),stars:sample(fl,ds,nS,r),glints:sample(fl,ds,nG,r),glow:p.glow?pal[3]:null,pal,sub:p.sc&&p.sc<1?1:0}}
 // ---------- fragments ----------
 function fragSprite(shape,s,pal,r,ds){const m=s*1.6,cv=mkC(m*2*ds,m*2*ds),x=cv.getContext('2d');x.scale(ds,ds);x.translate(m,m);x.shadowColor=pal[3];x.shadowBlur=s*.8;x.lineJoin='round';
  if(shape=='star'){x.fillStyle=pal[2];x.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,R=i%2?s*.3:s;x.lineTo(Math.cos(a)*R,Math.sin(a)*R)}x.closePath();x.fill();x.shadowBlur=0;x.fillStyle='#fff';x.beginPath();x.arc(0,0,s*.22,0,6.3);x.fill()}
  else if(shape=='void'){x.beginPath();x.moveTo(-s*.5,0);x.lineTo(-s*.1,-s*.42);x.lineTo(s*.5,-s*.18);x.lineTo(s*1.25,-s*.05);x.lineTo(s*.4,s*.22);x.lineTo(s*.1,s*.48);x.closePath();const g=x.createLinearGradient(-s,0,s,0);g.addColorStop(0,pal[0]);g.addColorStop(1,pal[1]);x.fillStyle=g;x.fill();x.shadowBlur=0;x.strokeStyle=pal[2];x.lineWidth=Math.max(.8,s*.1);x.stroke();x.strokeStyle=rgba(pal[3],.6);x.lineWidth=Math.max(.5,s*.05);x.beginPath();x.moveTo(-s*.1,-s*.3);x.lineTo(s*1.1,-s*.05);x.stroke()}
  else{const n=5+((r()*3)|0),pts=[];for(let i=0;i<n;i++){const a=i/n*6.283+r()*.5,R=s*(.65+r()*.4);pts.push([Math.cos(a)*R,Math.sin(a)*R*.85])}x.beginPath();pts.forEach(q=>x.lineTo(q[0],q[1]));x.closePath();const g=x.createLinearGradient(0,-s,0,s);g.addColorStop(0,pal[1]);g.addColorStop(1,pal[0]);x.fillStyle=g;x.fill();x.shadowBlur=0;
   x.fillStyle=rgba(pal[2],.55);x.beginPath();x.moveTo(pts[0][0],pts[0][1]);x.lineTo(pts[1][0],pts[1][1]);x.lineTo(0,0);x.closePath();x.fill();x.strokeStyle=pal[2];x.lineWidth=Math.max(.7,s*.09);x.beginPath();pts.forEach(q=>x.lineTo(q[0],q[1]));x.closePath();x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(-s*.15,-s*.2,s*.12,0,6.3);x.fill()}
  return{c:cv,o:m,m:m*2}}
 function buildFrag(W,p,L,ds,pal,seed,A){const r=sr(seed),n=p.n,fr=[],sz=p.sz||[6,12],k=L/80,vars=[];L*=p.sc||1;
  for(let i=0;i<Math.min(6,n);i++)vars.push(fragSprite(p.shape,lerp(sz[0],sz[1],i/5)*k,pal,r,ds));
  // fragments sit where feathers would be (arm model): one at the middle and one at the tip of each "ray"
  const rays=Math.ceil(n/2),att=p.att==null?.5:p.att,armA=armOf(p),pairs=[];
  for(let i=0;i<n;i++){const k=i%rays,tipF=i>=rays,u=rays>1?k/(rays-1):0,ra=lerp(p.a[0],p.a[1],u)*RAD,d=att*L*(1-u),Li=L*LC.top(u)*(1-.5*att*(1-u)),dist=Li*(tipF?.92:.42)*(.92+r()*.16);
   const x=Math.cos(armA)*d+Math.cos(ra)*dist,y=Math.sin(armA)*d+Math.sin(ra)*dist,rad=Math.hypot(x,y);
   fr.push({a:Math.atan2(y,x),r:rad,fa:(-72+u*150)*RAD,k:rad/L,ph:r()*6.3,v:tipF?Math.min(vars.length-1,(r()*2)|0):(vars.length-1-((r()*2)|0)),rot:r()*6.3,spin:(r()-.5)*.6,ori:p.shape=='void'?1:0})}
  if(p.line)for(let k=0;k<rays;k++){if(k+rays<n)pairs.push([k,k+rays]);if(k+1<rays)pairs.push([k,k+1])}
  return{kind:'frag',fr,vars,pairs,line:p.line?pal[2]:null,fs:cl(36/L,.28,.5),tmp:new Float32Array(n*2),pal,L,scat:A.unfold||W.id=='voidemp'?1:0}}
 // ---------- mechanical plates ----------
 function plate(style,lp,w,pal,joint,ds){const pad=4,cv=mkC((lp+pad*2)*ds,(w*2.6+pad*2)*ds),x=cv.getContext('2d'),oy=w*1.3+pad;x.scale(ds,ds);x.translate(pad,oy);x.lineJoin='round';
  if(style=='hex'){const m=3,R=lp/(m*1.45);x.strokeStyle=pal[1];x.lineWidth=Math.max(1,w*.16);x.beginPath();x.moveTo(0,0);x.lineTo(lp,0);x.stroke();
   for(let k=0;k<m;k++){const cx=lp*(k+.62)/m,rr=R*(1-k*.12);x.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;x.lineTo(cx+Math.cos(a)*rr,Math.sin(a)*rr)}x.closePath();x.fillStyle=rgba(pal[3],.22);x.fill();x.shadowColor=pal[3];x.shadowBlur=w*.8;x.strokeStyle=pal[2];x.lineWidth=Math.max(.8,w*.1);x.stroke();x.shadowBlur=0;
    x.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3+.52;x.lineTo(cx+Math.cos(a)*rr*.5,Math.sin(a)*rr*.5)}x.closePath();x.strokeStyle=rgba(pal[3],.7);x.lineWidth=Math.max(.5,w*.05);x.stroke()}}
  else if(style=='panel'){x.beginPath();x.moveTo(0,-w*.5);x.lineTo(lp*.8,-w*.66);x.lineTo(lp,-w*.16);x.lineTo(lp*.88,w*.5);x.lineTo(0,w*.42);x.closePath();const g=x.createLinearGradient(0,-w*.7,0,w*.5);g.addColorStop(0,pal[2]);g.addColorStop(.45,pal[1]);g.addColorStop(1,pal[0]);x.fillStyle=g;x.fill();x.strokeStyle='#0c1018';x.lineWidth=Math.max(1,w*.1);x.stroke();
   x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=Math.max(.5,w*.05);x.beginPath();x.moveTo(lp*.08,-w*.3);x.lineTo(lp*.78,-w*.42);x.lineTo(lp*.9,-w*.1);x.stroke();x.strokeStyle='rgba(0,0,0,.35)';x.beginPath();x.moveTo(lp*.12,w*.26);x.lineTo(lp*.8,w*.32);x.stroke();
   x.fillStyle=joint||pal[3];x.beginPath();x.moveTo(lp*.8,-w*.66);x.lineTo(lp,-w*.16);x.lineTo(lp*.9,-w*.2);x.lineTo(lp*.74,-w*.56);x.closePath();x.fill();
   x.shadowColor=pal[3];x.shadowBlur=w*.6;x.strokeStyle=pal[3];x.lineWidth=Math.max(1,w*.12);x.beginPath();x.moveTo(lp*.14,0);x.lineTo(lp*.7,-w*.06);x.stroke();x.shadowBlur=0;x.fillStyle='#e8eef9';for(let i=0;i<2;i++){x.beginPath();x.arc(lp*.06,(i?.22:-.25)*w,Math.max(.8,w*.07),0,6.3);x.fill()}}
  else{x.beginPath();x.moveTo(0,-w*.28);x.lineTo(lp*.9,-w*.55);x.lineTo(lp,-w*.04);x.lineTo(lp*.85,w*.45);x.lineTo(0,w*.3);x.closePath();const g=x.createLinearGradient(0,-w,0,w);g.addColorStop(0,'#dfe5ef');g.addColorStop(.45,pal[1]);g.addColorStop(1,pal[0]);x.fillStyle=g;x.fill();x.strokeStyle='#161a22';x.lineWidth=Math.max(1,w*.09);x.stroke();
   x.shadowColor=pal[3];x.shadowBlur=w*.5;x.strokeStyle=pal[3];x.lineWidth=Math.max(1,w*.1);x.beginPath();x.moveTo(lp*.1,0);x.lineTo(lp*.82,-w*.16);x.stroke();x.shadowBlur=0;x.fillStyle='#e8eef9';for(let i=1;i<4;i++){x.beginPath();x.arc(lp*(.18+i*.2),-w*.22+i*.02*w,Math.max(.8,w*.06),0,6.3);x.fill()}}
  return{c:cv,ox:pad,oy,w:lp+pad*2,h:w*2.6+pad*2,lp}}
 function buildMech(W,p,L,ds,pal){const n=p.n,spr=[],ang=[],fa=[];for(let i=0;i<n;i++){const u=n>1?i/(n-1):0,lp=L*(p.style=='hex'?.56-.2*u:.62-.22*u),w=lp*(p.style=='panel'?.26:p.style=='hex'?.2:.25);spr.push(plate(p.style,lp,w,pal,p.joint,ds));ang.push(lerp(p.a[0],p.a[1],u)*RAD);fa.push((96+u*8)*RAD)}
  return{kind:'mech',n,spr,ang,fa,L,pal,joint:p.joint||pal[2],style:p.style,click:p.style=='panel',fs:cl(58/L,.45,.92),dark:mix(pal[0],'#000000',.4)}}
 function buildMem(W,p,L,pal){const nf=p.fingers,lens=[],fa=[],ff=[];for(let i=0;i<nf;i++){const u=nf>1?i/(nf-1):0;lens.push(L*(.6-.2*u));fa.push(lerp(-34,64,u)*RAD);ff.push((84+i*5)*RAD)}
  const x=mkC(2,2).getContext('2d'),gr=x.createLinearGradient(0,-L*.5,L*.8,L*.4);gr.addColorStop(0,mix(pal[0],pal[1],.35));gr.addColorStop(.55,pal[1]);gr.addColorStop(1,mix(pal[1],pal[2],.55));
  return{kind:'mem',L,nf,lens,fa,ff,gr,bone:p.bone,dark:mix(pal[0],'#000000',.55),pal,claw:p.claw,hook:p.hook,scal:p.scal||.26,ghost:p.ghost,spikes:p.spikes,vein:p.vein,gv:p.glowVein,fs:cl(60/L,.45,.9),tmp:new Float32Array(nf*2)}}
 const RIBK={nebula:{add:1,w:7,wav:.12,sp:1.1,bend:.32},wind:{add:0,w:3,wav:.16,sp:2.1,bend:.6,dash:1},water:{add:0,w:3,wav:.22,sp:1.5,bend:.45,dash:1},flame:{add:1,w:5,wav:.28,sp:6.5,bend:-.12},void:{add:0,w:6,wav:.2,sp:1.4,bend:.25}};
 function buildRib(W,p,L,pal){const K=RIBK[p.kind]||RIBK.nebula,n=p.n,a=[];for(let i=0;i<n;i++)a.push(lerp(p.a[0],p.a[1],n>1?i/(n-1):.5)*RAD);
  const c1=p.kind=='nebula'?pal[3]:p.kind=='wind'?'#ffffff':p.kind=='void'?pal[0]:pal[1],c2=p.kind=='void'?pal[3]:pal[2];
  return{kind:'rib',n,a,L,len:p.len||1,w:(p.w||K.w)*L/60,K,c1,c2,fold:96*RAD,fs:cl(44/L,.3,.92)}}
 function buildParts(W,list,L,ds,pal,seed){return list.map((p,i)=>{const pl=p.p2&&W.pal2?W.pal2:pal,Lp=L*(p.sc&&p.s!='frag'?p.sc:1),sd=seed+i*101;
  return p.s=='fan'?buildFan(W,p,Lp,ds,pl,sd,W.a):p.s=='frag'?buildFrag(W,p,L,ds,pl,sd,W.a):p.s=='mech'?buildMech(W,p,Lp,ds,pl):p.s=='mem'?buildMem(W,p,Lp,pl):buildRib(W,p,Lp,pl)})}
 // shared sprites
 let SPK=null;const spark=()=>{if(SPK)return SPK;const c=mkC(24,24),x=c.getContext('2d');x.translate(12,12);const g=x.createRadialGradient(0,0,0,0,0,6);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(-12,-12,24,24);x.fillStyle='#fff';x.beginPath();x.moveTo(0,-12);x.quadraticCurveTo(1,-1,12,0);x.quadraticCurveTo(1,1,0,12);x.quadraticCurveTo(-1,1,-12,0);x.quadraticCurveTo(-1,-1,0,-12);x.fill();return SPK=c};
 function ringSprite(col,R,ds){const m=R*.5,cv=mkC((R*2+m*2)*ds,(R*2+m*2)*ds),x=cv.getContext('2d');x.scale(ds,ds);x.translate(R+m,R+m);x.shadowColor=col;x.shadowBlur=m*.9;x.strokeStyle=col;x.lineWidth=Math.max(1.5,R*.09);x.beginPath();x.arc(0,0,R,0,6.3);x.stroke();x.shadowBlur=0;x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=Math.max(.8,R*.03);x.stroke();return{c:cv,o:R+m,s:R*2+m*2}}
 function coronaSprite(col,R,ds){const m=R*.7,S=R+m,cv=mkC(S*2*ds,S*2*ds),x=cv.getContext('2d');x.scale(ds,ds);x.translate(S,S);const g=x.createRadialGradient(0,0,R*.85,0,0,S);g.addColorStop(0,rgba(col,.95));g.addColorStop(.18,rgba(col,.45));g.addColorStop(1,rgba(col,0));x.fillStyle=g;x.fillRect(-S,-S,S*2,S*2);
  x.fillStyle='#050208';x.beginPath();x.arc(0,0,R*.92,0,6.3);x.fill();x.strokeStyle=rgba(col,.9);x.lineWidth=Math.max(1,R*.05);x.beginPath();x.arc(0,0,R*.94,0,6.3);x.stroke();x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=Math.max(.6,R*.015);x.stroke();return{c:cv,o:S,s:S*2}}
 function build(tier,ds){const W=WINGS[tier],A=W.a,L=A.L,seed=hash(W.id);
  return{parts:buildParts(W,A.parts,L,ds,W.pal,seed),alt:A.alt?buildParts(W,A.alt,L,ds,W.pal,seed+9):null,L,W,
   halo:A.halo?ringSprite(A.halo,17,ds):null,corona:A.corona?coronaSprite(A.corona.c,L*A.corona.r,ds):null}}
 function get(tier,ds){if(ds===true||ds===false)ds=ds?2:1.25;ds=ds||1.25;const k=tier+':'+ds;let a=cache.get(k);if(a){cache.delete(k);cache.set(k,a);return a}
  a=build(tier,ds);cache.set(k,a);if(cache.size>CMAX)cache.delete(cache.keys().next().value);return a}
 // ---------- pose: spread 0 (folded on the back) .. 1 (open); idle breathing, calm open/fold cycle, jump snap, landing dip,
 // equip unfold, flight beats (FL from FLY7), slow majestic opening and a special idle flourish for exclusive wings
 const FL={on:false,rate:15,amp:.3,bob:0};const POSE=new Map();
 // powered flight beat: a quick power downstroke (40% of the beat) and a slower recovery upstroke, instead of an even sine.
 // The phase is warped so the curve stays smooth at the top and bottom of the stroke. Returns the sine-like value and how far into the upstroke we are.
 const TAU=Math.PI*2;function beat(th){const v=((th/TAU-.25)%1+1)%1,up=v>=.4,w=up?.75+(v-.4)/.6*.5:.25+v/.4*.5;return{val:Math.sin(TAU*w),fold:up?Math.sin(Math.PI*(v-.4)/.6):0}}
 function pose(key,tier,t,mode,vy,ph,W){let p=POSE.get(key);const A=W.a;
  if(!p){p={s:mode==2?1:0,t,fl:0,lastAir:mode==2,tier,eq:0,land:0};POSE.set(key,p);if(POSE.size>48)POSE.delete(POSE.keys().next().value)}
  let dt=t-p.t;p.t=t;if(!(dt>0)||dt>.25)dt=.016;
  if(p.tier!==tier){p.tier=tier;p.s=0;p.eq=1}
  const air=mode==2,ex=W.src=='excl'||A.unfold||A.slow,u=((t+ph*3.1)%8.5)/8.5,idle=ease(u/.1)*(1-ease((u-.34)/.12));
  const target=mode<0?0:air?1:mode==1?.28+idle*.5:idle*(ex?1:.9);
  const fly=key=='me'&&FL.on&&air,rising=fly||air&&(vy==null||vy<60),big=cl((A.L-40)/70,0,1);
  const rate=fly?FL.rate:rising?15-big*5:air?4.5-big*1.5:mode==1?7:A.flutter?8:0,amp=fly?FL.amp:rising?.3:air?.07:mode==1?.04:A.flutter?.05:0;
  p.fl+=dt*rate;if(air&&!p.lastAir)p.fl=0;if(!air&&p.lastAir&&mode>=0)p.land=1;p.lastAir=air;
  const k=target>p.s?(air?20:A.slow?1.3:3.2):(air?6:mode<0?7:2.4);p.s+=(target-p.s)*(1-Math.exp(-dt*k));
  p.eq=Math.max(0,p.eq-dt*1.2);p.land=Math.max(0,p.land-dt*3.5);
  const dir=rising?-1:1;
  if(fly){// realistic flight: power stroke, wings tuck in on the upstroke, outer feathers trail the arm, the body lifts on each downstroke
   const b=beat(p.fl),bl=beat(p.fl-.45);FL.bob=b.val*3;
   return{s:p.s*(1-b.fold*.32),fl:b.val*amp*dir,fll:bl.val*amp*dir,ph:p.fl,amp:amp*dir,rise:true,land:0,eq:p.eq,flare:0}}
  if(key=='me')FL.bob=0;
  const fl=Math.sin(p.fl)*amp*(air?1:Math.max(p.s,A.flutter?.6:0));
  return{s:p.s,fl:fl*dir,ph:p.fl,amp:amp*dir*(air?1:Math.max(p.s,A.flutter?.6:0)),rise:rising,land:p.land*(1-p.land)*4,eq:p.eq,flare:ex&&!air?idle:0}}
 // ---------- per-family drawing (inside one side's mirrored frame; +x = outward, root at 0,0) ----------
 function drawFan(g,P,ps,t,ph,fx){const nl=P.layers.length,S=ps.s;
  for(let i=0;i<nl;i++){const l=P.layers[i],kb=nl>1?1-i/(nl-1):0,e=ease(S*(1+P.stg)-kb*P.stg-P.sub*.08);
   const ang=lerp(P.fold,P.rest,e)+(ps.fll!=null?ps.fl*(1-kb*.6)+ps.fll*kb*.6:ps.fl)*(.5+kb*.8)*(P.sub?.7:1)+ps.lag*(.5+kb)+Math.sin(t*1.7+ph)*.016*(1+kb)+(P.ruf?Math.sin(t*2.6+i*1.9+ph)*.02*S*(1+kb):0)+ps.land*.32*(1+kb*.5);
   g.save();g.rotate(ang);g.scale(lerp(P.fsx,1,e),lerp(P.fsy,1,e));g.drawImage(l.c,-l.ox,-l.oy,l.w,l.h);
   if(i==nl-1&&fx&&S>.25){const a0=g.globalAlpha;
    if(P.glow){g.globalCompositeOperation='lighter';g.globalAlpha=a0*(.07+.06*Math.sin(t*2.2+ph))*S;g.drawImage(l.c,-l.ox,-l.oy,l.w,l.h);g.globalAlpha=a0}
    if(P.stars.length){g.globalCompositeOperation='lighter';g.fillStyle='#ffffff';for(let j=0;j<P.stars.length;j++){const q=P.stars[j],tw=Math.sin(t*q[2]+q[3]);if(tw<-.2)continue;g.globalAlpha=a0*S*(.25+.75*tw*tw);const z=.8+tw*.9;g.fillRect(q[0]+Math.sin(t*.6+q[3])*1.4-z/2,q[1]+Math.cos(t*.5+q[3])*1.1-z/2,z,z)}g.globalAlpha=a0}
    if(P.glints.length){g.globalCompositeOperation='lighter';const sp=spark();for(let j=0;j<P.glints.length;j++){const q=P.glints[j],c=((t*.9+j*.61)%3.2)/.5;if(c>1)continue;const z=7*Math.sin(c*Math.PI);g.globalAlpha=a0*S;g.drawImage(sp,q[0]-z/2,q[1]-z/2,z,z)}g.globalAlpha=a0}
    g.globalCompositeOperation='source-over'}
   g.restore()}}
 function drawMem(g,P,ps,t,ph,fx){const S=ps.s,e=ease(S*1.15),L=P.L,sc=lerp(P.fs,1,e),q=ps.ph,A=ps.amp,F=P.tmp,nf=P.nf,a0=g.globalAlpha;const flx=k=>Math.sin(q-k)*A;
  const armA=lerp(-36,-20,e)*RAD+ps.fl*.7+ps.land*.3,foreA=lerp(104,-50,e)*RAD+flx(.35)*.9+ps.land*.4,la=L*.22,lf=L*.27;
  g.save();g.scale(sc,sc);const Ex=Math.cos(armA)*la,Ey=Math.sin(armA)*la,Wx=Ex+Math.cos(foreA)*lf,Wy=Ey+Math.sin(foreA)*lf;
  for(let i=0;i<nf;i++){const u=nf>1?i/(nf-1):0,ei=ease(S*1.3-u*.3),a=lerp(P.ff[i],P.fa[i],ei)+flx(.6+i*.3)*(.8+.35*i)+Math.sin(t*1.5+i+ph)*.025+ps.land*.3,ln=P.lens[i]*lerp(.55,1,ei);F[i*2]=Wx+Math.cos(a)*ln;F[i*2+1]=Wy+Math.sin(a)*ln}
  const Bx=L*.06,By=L*.3,sca=P.scal*(1+Math.sin(q*.5+ph)*.12);
  g.beginPath();g.moveTo(0,0);g.lineTo(Ex,Ey);g.lineTo(Wx,Wy);g.lineTo(F[0],F[1]);
  for(let i=0;i<nf-1;i++){const mx=(F[i*2]+F[i*2+2])/2,my=(F[i*2+1]+F[i*2+3])/2;g.quadraticCurveTo(lerp(mx,Wx,sca),lerp(my,Wy,sca),F[i*2+2],F[i*2+3])}
  {const i=nf-1,mx=(F[i*2]+Bx)/2,my=(F[i*2+1]+By)/2;g.quadraticCurveTo(lerp(mx,Wx,sca*.7),lerp(my,Wy,sca*.7),Bx,By)}g.closePath();
  g.globalAlpha=a0*(P.ghost?.5:.97);g.fillStyle=P.gr;g.fill();
  if(P.ghost){g.globalCompositeOperation='lighter';g.strokeStyle=rgba(P.pal[3],.55);g.lineWidth=L*.035;g.stroke();g.strokeStyle=rgba(P.pal[2],.8);g.lineWidth=L*.01;g.stroke();g.globalCompositeOperation='source-over'}else{g.strokeStyle=P.dark;g.lineWidth=Math.max(1,L*.014);g.stroke()}
  g.globalAlpha=a0;g.lineCap='round';g.lineJoin='round';
  if(P.vein){if(P.gv){g.globalCompositeOperation='lighter';g.strokeStyle=rgba(P.pal[3],.45+.25*Math.sin(t*3+ph))}else g.strokeStyle=rgba(P.pal[2],.35);g.lineWidth=Math.max(.6,L*.008);g.beginPath();
   for(let i=0;i<nf-1;i++){const mx=(F[i*2]+F[i*2+2])/2,my=(F[i*2+1]+F[i*2+3])/2;g.moveTo(Wx,Wy);g.quadraticCurveTo(lerp(Wx,mx,.5)+L*.03,lerp(Wy,my,.5),lerp(mx,Wx,sca*1.15),lerp(my,Wy,sca*1.15))}g.stroke();g.globalCompositeOperation='source-over'}
  for(let i=0;i<nf;i++){const tx=F[i*2],ty=F[i*2+1];g.strokeStyle=P.dark;g.lineWidth=L*.03;g.beginPath();g.moveTo(Wx,Wy);g.lineTo(tx,ty);g.stroke();g.strokeStyle=P.bone;g.lineWidth=L*.014;g.stroke();
   if(P.claw&&(P.ghost||P.spikes||i==0)){const a=Math.atan2(ty-Wy,tx-Wx),c=L*.05;g.fillStyle=P.bone;g.beginPath();g.moveTo(tx+Math.cos(a)*c,ty+Math.sin(a)*c);g.lineTo(tx+Math.cos(a+1.6)*c*.35,ty+Math.sin(a+1.6)*c*.35);g.lineTo(tx+Math.cos(a-1.6)*c*.35,ty+Math.sin(a-1.6)*c*.35);g.closePath();g.fill()}}
  g.strokeStyle=P.dark;g.lineWidth=L*.06;g.beginPath();g.moveTo(0,0);g.lineTo(Ex,Ey);g.lineTo(Wx,Wy);g.stroke();g.strokeStyle=P.bone;g.lineWidth=L*.032;g.stroke();
  if(P.spikes){g.fillStyle=P.pal[2];for(let k=1;k<=4;k++){const u=k/5,px=k<3?Ex*u*2.5/2:Ex+(Wx-Ex)*(u*2.5-1.25)/1.25,py=k<3?Ey*u*2.5/2:Ey+(Wy-Ey)*(u*2.5-1.25)/1.25,a=(k<3?armA:foreA)-Math.PI/2,s=L*.05;g.beginPath();g.moveTo(px+Math.cos(a+1.5)*s*.3,py+Math.sin(a+1.5)*s*.3);g.lineTo(px+Math.cos(a)*s,py+Math.sin(a)*s);g.lineTo(px+Math.cos(a-1.5)*s*.3,py+Math.sin(a-1.5)*s*.3);g.closePath();g.fill()}}
  if(P.claw){const a=foreA-.9,c=L*(P.hook?.1:.07);g.strokeStyle=P.bone;g.lineWidth=L*.02;g.beginPath();g.moveTo(Wx,Wy);g.quadraticCurveTo(Wx+Math.cos(a)*c,Wy+Math.sin(a)*c,Wx+Math.cos(a+.9)*c*1.1,Wy+Math.sin(a+.9)*c*1.1);g.stroke()}
  g.fillStyle=P.bone;g.beginPath();g.arc(Ex,Ey,L*.022,0,6.3);g.moveTo(Wx+L*.026,Wy);g.arc(Wx,Wy,L*.026,0,6.3);g.fill();g.restore()}
 function drawMech(g,P,ps,t,ph,fx){const S=ps.s,e=ease(S*1.2),L=P.L,sc=lerp(P.fs,1,e),a0=g.globalAlpha;
  const armA=lerp(-66,-26,e)*RAD+ps.fl*.6+ps.land*.25,foreA=lerp(64,-50,e)*RAD+ps.fl*.85+ps.land*.3,la=L*.22,lf=L*.26;
  g.save();g.scale(sc,sc);const Ex=Math.cos(armA)*la,Ey=Math.sin(armA)*la,Wx=Ex+Math.cos(foreA)*lf,Wy=Ey+Math.sin(foreA)*lf,tot=la+lf;
  for(let i=P.n-1;i>=0;i--){const u=P.n>1?i/(P.n-1):0,ei=ease(S*1.7-u*.7),ov=P.click?Math.sin(ei*Math.PI)*.1:0,v=(1-u*.8)*tot;
   const hx=v<=la?Ex*v/la:Ex+(Wx-Ex)*(v-la)/lf,hy=v<=la?Ey*v/la:Ey+(Wy-Ey)*(v-la)/lf,pa=lerp(P.fa[i],P.ang[i],ei)+ov+ps.fl*(.35+.5*(1-u))+Math.sin(t*1.4+i*.8+ph)*.012;
   const s=P.spr[i];g.save();g.translate(hx,hy);g.rotate(pa);g.drawImage(s.c,-s.ox,-s.oy,s.w,s.h);
   if(fx&&S>.3){const pu=.5+.5*Math.sin(t*4-i*.9+ph);g.globalCompositeOperation='lighter';g.globalAlpha=a0*pu*.7*S;g.strokeStyle=P.pal[3];g.lineWidth=Math.max(1,s.lp*.03);g.beginPath();g.moveTo(s.lp*.15,0);g.lineTo(s.lp*(.3+.5*pu),-s.lp*.02);g.stroke();g.globalAlpha=a0;g.globalCompositeOperation='source-over'}
   g.restore();g.fillStyle=P.joint;g.beginPath();g.arc(hx,hy,Math.max(1.2,L*.022),0,6.3);g.fill()}
  g.lineCap='round';g.strokeStyle=P.dark;g.lineWidth=L*.065;g.beginPath();g.moveTo(0,0);g.lineTo(Ex,Ey);g.lineTo(Wx,Wy);g.stroke();g.strokeStyle=P.pal[1];g.lineWidth=L*.035;g.stroke();g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=L*.01;g.stroke();
  g.fillStyle=P.joint;for(const q of[[0,0],[Ex,Ey],[Wx,Wy]]){g.beginPath();g.arc(q[0],q[1],L*.035,0,6.3);g.fill()}g.fillStyle=P.pal[3];g.beginPath();g.arc(Ex,Ey,L*.014,0,6.3);g.moveTo(Wx+L*.014,Wy);g.arc(Wx,Wy,L*.014,0,6.3);g.fill();g.restore()}
 function drawFrag(g,P,ps,t,ph,fx,flare){const S=ps.s,n=P.fr.length,pts=P.tmp,a0=g.globalAlpha,sca=1+P.scat*flare*.22;
  for(let i=0;i<n;i++){const f=P.fr[i],ei=ease(S*1.3-f.k*.3),a=lerp(f.fa,f.a,ei)+ps.fl*(.35+f.k*.6)+Math.sin(t*.9+f.ph)*.03+ps.land*.25,rad=f.r*lerp(P.fs,1,ei)*(1+(sca-1)*f.k)+Math.sin(t*1.4+f.ph)*1.6*S;pts[i*2]=Math.cos(a)*rad*lerp(.35,1,ei);pts[i*2+1]=Math.sin(a)*rad}
  if(P.line&&S>.3&&P.pairs.length){g.globalCompositeOperation='lighter';g.strokeStyle=rgba(P.line,.42*S);g.lineWidth=Math.max(.6,P.L*.008);g.beginPath();for(const q of P.pairs){g.moveTo(pts[q[0]*2],pts[q[0]*2+1]);g.lineTo(pts[q[1]*2],pts[q[1]*2+1])}g.stroke();g.globalCompositeOperation='source-over'}
  for(let i=0;i<n;i++){const f=P.fr[i],v=P.vars[f.v],x=pts[i*2],y=pts[i*2+1],z=lerp(.5,1,ease(S*1.3-f.k*.3));g.save();g.translate(x,y);g.rotate(f.ori?Math.atan2(y,x):f.rot+t*f.spin);g.drawImage(v.c,-v.o*z,-v.o*z,v.m*z,v.m*z);g.restore()}}
 function drawRib(g,P,ps,t,ph,fx){const S=ps.s,e=ease(S*1.25-.12);if(e<=.02)return;const K=P.K,L=P.L*lerp(P.fs,1,e),a0=g.globalAlpha;
  g.save();g.lineCap='round';g.lineJoin='round';if(K.add)g.globalCompositeOperation='lighter';if(K.dash){g.setLineDash([L*.22,L*.12]);g.lineDashOffset=-t*L*.9}
  for(let i=0;i<P.n;i++){const u=P.n>1?i/(P.n-1):.5,ba=lerp(P.fold,P.a[i],e)+ps.fl*(.5+.4*(1-u))+ps.land*.3,Lr=L*P.len*(.55+.45*(1-u));let px=0,py=0;g.beginPath();g.moveTo(0,0);
   for(let s=1;s<=6;s++){const q=s/6,aa=ba+K.bend*q+Math.sin(t*K.sp+q*3+i*1.7+ph)*K.wav*q,nx=Math.cos(aa)*Lr*q,ny=Math.sin(aa)*Lr*q;g.quadraticCurveTo(px,py,(px+nx)/2,(py+ny)/2);px=nx;py=ny}g.lineTo(px,py);
   g.globalAlpha=a0*.24*e;g.strokeStyle=P.c1;g.lineWidth=P.w*2.4;g.stroke();g.globalAlpha=a0*.85*e;g.strokeStyle=P.c2;g.lineWidth=P.w*.55;g.stroke()}
  g.restore()}
 const DRAW={fan:drawFan,mem:drawMem,mech:drawMech,frag:drawFrag,rib:drawRib};
 // ---------- main entry: both wings behind the body. cx,cy = character centre (+24 from the char code); f = facing; t = time;
 // mode: 0 idle 1 run 2 air (-1 = fold away); key/vy optional (pose per character); o.ds overrides the art resolution
 let LAST=null;
 function draw(g,tier,cx,cy,f,t,mode,vx,phase,alpha,key,vy,o){const W=WINGS[tier];if(!W)return 0;
  const ds=o&&o.ds||(QM.cur.hd?2:1.25),art=get(tier,ds),ph=phase||0;f=f||1;
  let ps=key?pose(key,tier,t,mode,vy,ph,W):{s:1,fl:Math.sin(t*2.2+ph)*.06,ph:t*2.2+ph,amp:.06,rise:false,land:0,eq:0,flare:.5+.5*Math.sin(t*.7)};
  if(api.dbg&&key=='me'){ps=Object.assign({},ps,{s:api.dbg.s,fl:api.dbg.fl!=null?api.dbg.fl:api.dbg.s?ps.fl*.2:0,land:0,flare:0})}
  ps.lag=Math.min(.16,Math.abs(vx||0)*.00028);LAST={ps,W,art,t,key};const fx=QM.cur.wfx;
  g.save();if(alpha!=null)g.globalAlpha*=alpha;const rx=cx,ry=cy-7;
  if(art.corona){const C=art.corona,s=(.55+.45*ease(ps.s))*(1+.03*Math.sin(t*1.6))*(1+ps.flare*.06),y=ry-art.L*.1;g.save();g.globalAlpha*=.6+.4*ease(ps.s);g.translate(rx,y);g.rotate(t*.05);g.drawImage(C.c,-C.o*s,-C.o*s,C.s*s,C.s*s);g.restore()}
  for(let side=-1;side<=1;side+=2){const far=side*f<0,parts=art.alt&&side*f>0?art.alt:art.parts;
   g.save();g.translate(rx+side*3,ry);g.scale(side*(far?.95:1),far?.97:1);if(far)g.globalAlpha*=.9;
   for(const P of parts)DRAW[P.kind](g,P,ps,t,ph,fx,ps.flare);g.restore()}
  g.restore();return ps.s}
 // extras that sit with the wings: halo, orbit ring, lightning arcs, rebirth flare, particles (only in the world)
 const RB=new Map();
 function extras(g,tier,cx,cy,t){const W=WINGS[tier];if(!W)return;const A=W.a,fx=QM.cur.wfx,ps=LAST&&LAST.W==W?LAST.ps:{s:1,flare:0},L=A.L;
  if(A.halo){const H=get(tier,QM.cur.hd?2:1.25).halo;if(H){g.save();g.globalCompositeOperation='lighter';g.globalAlpha*=.8;g.translate(cx,cy-62+Math.sin(t*2)*1.5);g.scale(1,.3);g.drawImage(H.c,-H.o,-H.o,H.s,H.s);g.restore()}}
  if(!fx)return;
  if(A.orbit&&ps.s>.2){g.save();g.globalCompositeOperation='lighter';g.translate(cx,cy-L*.12);g.rotate(-.18);g.strokeStyle=rgba(A.orbit,.35*ps.s);g.lineWidth=1.2;g.beginPath();g.ellipse(0,0,L*.62,L*.15,0,0,6.3);g.stroke();
   const sp=spark();for(let k=0;k<3;k++){const a=t*(.6+k*.15)+k*2.1,x=Math.cos(a)*L*.62,y=Math.sin(a)*L*.15,z=5+k*1.5;g.globalAlpha=ps.s;g.drawImage(sp,x-z/2,y-z/2,z,z)}g.restore()}
  if(A.arcs&&fx>=2&&ps.s>.4&&((t*7)|0)%4==0){const r=sr(((t*7)|0)*131+7);g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
   for(let s=-1;s<=1;s+=2){let x=cx+s*6,y=cy-4;const pts=[[x,y]];for(let i=0;i<5;i++){x+=s*(L*.12+r()*L*.06);y+=-L*.12+r()*L*.18;pts.push([x,y])}
    for(const[w,a]of[[4,.25],[1.4,.95]]){g.strokeStyle=rgba(A.arcs,a);g.lineWidth=w;g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke()}
    const b=pts[2+((r()*2)|0)];g.strokeStyle=rgba(A.arcs,.7);g.lineWidth=1;g.beginPath();g.moveTo(b[0],b[1]);g.lineTo(b[0]+s*L*.12,b[1]+L*.16);g.lineTo(b[0]+s*L*.2,b[1]+L*.12);g.stroke()}g.restore()}
  const key=LAST&&LAST.key;if(!key||typeof VFX=='undefined'||typeof cam=='undefined')return;const wx=cx+cam.x,wy=cy+cam.y;
  if(A.rebirth||A.unfold||W.src=='excl'){let st=RB.get(key);if(!st){st={on:0};RB.set(key,st)}if(ps.flare>.95&&!st.on){st.on=1;try{const c=[W.pal[1],W.pal[2],W.pal[3],'#ffffff'];VFX.wave(wx,wy-L*.2,W.pal[3],L*1.3,.9,.5);if(A.rebirth)VFX.burst(wx,wy-L*.2,c,26,260,1,1.1,16);else VFX.burst(wx,wy-L*.2,c,12,160,1,.9,12)}catch(_){}}else if(ps.flare<.2)st.on=0}
  if(Math.random()>.14*(QM.vfxK||1))return;const R=Math.random,px=wx+(R()<.5?-1:1)*(10+R()*L*.8),py=wy-L*.25+R()*L*.6;
  try{switch(W.fxk){case'snow':VFX.add(1,'#e8f8ff',px,py,(R()-.5)*10,14+R()*10,1.6,7,2,{a:.9});break;case'crimson':VFX.add(4,'#b0102a',px,py,(R()-.5)*30,20+R()*20,1.6,9,6,{r:R()*6,vr:2,g:10});break;
   case'volt':VFX.add(1,'#fff2a0',px,py,(R()-.5)*90,(R()-.5)*90,.22,11,2,{a:1});break;case'leaf':VFX.add(4,'#9fe0c0',px,py,(R()-.5)*60,-10+R()*20,1.4,8,6,{r:R()*6,vr:3});break;
   case'bubbles':VFX.add(3,'#bfefff',px,py,(R()-.5)*8,-30,1.2,6,4,{a:.7});break;default:if(window.FX7)FX7.wingFx(W,cx,cy,t)}}catch(_){}}
 // small ambient puff for idle characters (feathers for feathered wings, motes for the rest); world coordinates
 function idleFx(W,x,y,f){if(!W||typeof VFX=='undefined')return;const s=(Math.random()<.5?-1:1)*W.a.L*.45;if(/fan/.test(W.a.parts[0].s)&&/point|round|ragged|real|sickle/.test(W.a.parts[W.a.parts.length-1].tip||''))VFX.feather(x+s,y,W.pal[2],f);else VFX.mote(x+s,y,W.sp||W.pal[3])}
 // character entry: handles equip unfold (pose resets when the wing changes) and a fold-and-fade when wings are removed
 const TR=new Map();
 function drawChar(g,idx,cx,cy,f,t,mode,vx,ph,key,vy){let st=TR.get(key);if(!st){st={last:idx,fade:0,t};TR.set(key,st);if(TR.size>48)TR.delete(TR.keys().next().value)}
  const dt=cl(t-st.t,0,.1);st.t=t;
  if(idx<0||!WINGS[idx]){if(st.last>=0&&WINGS[st.last]){st.fade+=dt/.45;if(st.fade>=1){st.last=-1;st.fade=0;return}draw(g,st.last,cx,cy,f,t,-1,vx,ph,1-ease(st.fade),key,vy)}return}
  if(idx!==st.last){const was=st.last;st.last=idx;st.fade=0;if(key=='me'&&was!==undefined&&typeof VFX!='undefined'&&typeof cam!='undefined'){try{const W=WINGS[idx];VFX.wave(cx+cam.x,cy+cam.y,W.pal[3],W.a.L*1.1,.6,.45);VFX.burst(cx+cam.x,cy+cam.y-10,[W.pal[1],W.pal[2],W.pal[3]],14,180,1,.8,12)}catch(_){}}}
  draw(g,idx,cx,cy,f,t,mode,vx,ph,null,key,vy);extras(g,idx,cx,cy,t)}
 const api={get,draw,drawChar,extras,idleFx,pose,STY:{},FL,dbg:null,cacheSize:()=>cache.size,get tiers(){return WINGS.length}};return api})();
