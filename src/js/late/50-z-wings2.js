// ===== Wing animation v9 ("ascended" flight): three-tier wings, an 8-key flight cycle, emissive tips and shed trail particles =====
// Plugs into WingArt (50-wings.js) through its hooks:
//  FAM.tier - shape family of three overlapping tiers: T1 primaries (one sprite per feather, hinged at the wrist, each with an additive
//             emissive tip sprite), T2 secondaries and T3 coverts (one pre-rendered row each, hinged on the arm). Painted once per
//             wing + resolution (shadowBlur/gradients only at build time); a frame is ~20 drawImage calls per side.
//  CYC      - keyframed pose per character. F1 flare (take-off, equip), F2-F5 flap loop while flying/ascending (synced to FLY7's lift:
//             F2 upstroke peak = the beat sound, F3 power snap = max lift), F6-F8 heavy hover loop while gliding / airborne idle.
//             Catmull-Rom between keys, 0.12-0.2 s crossfades between phases; the tiers sample the cycle with small phase lags so they
//             overlap dynamically. Every family (the 38 older wings too) follows the cycle in the air through s / fl / fll / sx.
//  PRE/POST - halo ring behind the back; trail particles shed from the wing tips (time based, capped per quality preset QM.cur.wfx).
const WING9=(()=>{
 const RAD=Math.PI/180,TAU=Math.PI*2,cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ease=x=>{x=cl(x,0,1);return x*x*(3-2*x)};
 const hx=h=>{const n=parseInt(String(h).slice(1),16);return[n>>16&255,n>>8&255,n&255]},R=(h,a)=>{const c=hx(h);return'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'};
 const M=(a,b,t)=>{const p=hx(a),q=hx(b);return'#'+p.map((v,i)=>('0'+Math.round(v+(q[i]-v)*t).toString(16)).slice(-2)).join('')};
 const sr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296,hash=s=>{let h=7;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return h};
 // ---------- keyframes: A arm angle (rad, + = down), H wrist (+ = hand folds down/back, - = curls in over the head), S spread,
 // K tier stacking, X horizontal foreshortening, W wrap (low tiers sweep in / forward), B body bob px, G tip glow, E trail emission
 const KF=[
  [-.12,-.12,1,-.25,1.07,0,-1,1.8,3],     // F1 sprout / flare: explosive burst, maximum span
  [-.95,-.42,.85,.85,.88,0,2,.9,.4],      // F2 upstroke peak: high above the head, feathers stacked
  [.3,-.22,1,.1,.96,.3,-3,1.4,2.2],       // F3 downstroke power snap: driving down and forward
  [.8,.12,.95,.2,.86,.65,-2,1.1,1.1],     // F4 max extension low: wrapping around the front
  [.08,1.05,.55,.6,.76,.12,1,.8,.6],      // F5 recovery lift: folded at the joint, slicing upward
  [-.22,.04,.96,.12,1,0,0,1,.35],         // F6 hover: open, buoyant
  [.14,-.1,1,.04,.97,.06,-1.6,1.15,.55],  // F7 hover: heavy billow down, tips trailing up
  [-.06,.2,.97,.26,.99,0,.9,.95,.3]];     // F8 hover: settle, tips curl
 const NAMES=['F1 Flare','F2 Upstroke Peak','F3 Power Snap','F4 Max Extension','F5 Recovery Lift','F6 Hover','F7 Hover Billow','F8 Hover Settle'];
 const FOLD=[-.55,2.1,.18,1,.6,0,0,.6,0],DEF=new Float32Array([0,0,1,0,1,0,0,1,0]);
 const FT=[0,.25,.45,.72],FS=[1,2,3,4],HT=[0,.38,.7],HS=[5,6,7],LAG=[0,.04,.08];
 function loop(out,seq,tm,c){c=((c%1)+1)%1;const n=seq.length;let i=n-1;for(let k=0;k<n;k++)if(c<(k+1<n?tm[k+1]:1)){i=k;break}
  const t0=tm[i],t1=i+1<n?tm[i+1]:1,u=(c-t0)/(t1-t0),a=KF[seq[(i-1+n)%n]],b=KF[seq[i]],q=KF[seq[(i+1)%n]],d=KF[seq[(i+2)%n]],u2=u*u,u3=u2*u;
  for(let j=0;j<9;j++)out[j]=.5*(2*b[j]+(q[j]-a[j])*u+(2*a[j]-5*b[j]+4*q[j]-d[j])*u2+(3*b[j]-a[j]-3*q[j]+d[j])*u3);return out}
 // key i (0..7), tier j (0 arm/T3, 1 T2, 2 T1), dc = cycle offset
 function kfVec(i,j,dc,out){out=out||new Float32Array(9);dc=dc||0;if(i<=0){out.set(KF[0]);return out}
  return i<=4?loop(out,FS,FT,FT[i-1]-LAG[j]+dc):loop(out,HS,HT,HT[i-5]-LAG[j]*.6+dc)}
 // ---------- element painters (pointing +x from the attach point; L length, w width) ----------
 const grad=(x,L,st)=>{const g=x.createLinearGradient(0,0,L,0);for(const s of st)g.addColorStop(s[0],s[1]);return g};
 const edge=(x,L,C)=>grad(x,L,[[0,C.line],[.62,C.line],[1,R(C.tip,.95)]]);
 function fade(x,L,w,a){x.globalCompositeOperation='destination-out';const g=x.createLinearGradient(L*.66,0,L*1.02,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+a+')');x.fillStyle=g;x.fillRect(L*.6,-w*6,L*.6,w*12);x.globalCompositeOperation='source-over'}
 function core(x,w,C,x0,y0,cx,cy,x1,y1,lw){x.save();x.globalCompositeOperation='lighter';x.lineCap='round';x.shadowColor=C.glow;x.shadowBlur=Math.max(2,w*1.2);x.strokeStyle=R(C.tip,.8);x.lineWidth=lw;x.beginPath();x.moveTo(x0,y0);x.quadraticCurveTo(cx,cy,x1,y1);x.stroke();x.shadowBlur=0;x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=lw*.4;x.stroke();x.restore()}
 function eye(x,X,Y,s,C){x.fillStyle=R(C.c2,.85);x.beginPath();x.ellipse(X,Y,s,s*.82,-.3,0,6.3);x.fill();x.fillStyle=C.c0;x.beginPath();x.ellipse(X,Y,s*.72,s*.6,-.3,0,6.3);x.fill();x.strokeStyle=R(C.c2,.6);x.lineWidth=Math.max(.4,s*.08);x.beginPath();x.ellipse(X,Y,s*.5,s*.4,-.3,0,6.3);x.stroke();
  x.save();x.globalCompositeOperation='lighter';x.shadowColor=C.glow;x.shadowBlur=Math.max(2,s*.9);x.fillStyle=C.tip;x.beginPath();x.ellipse(X,Y,s*.22,s*.3,-.3,0,6.3);x.fill();x.restore()}
 const PT={
  feather(x,L,w,C,r){const P=()=>{x.beginPath();x.moveTo(0,-w*.2);x.bezierCurveTo(L*.3,-w*1.0,L*.8,-w*.74,L,-w*.02);x.bezierCurveTo(L*.82,w*.46,L*.32,w*.6,0,w*.2);x.closePath()};
   P();x.fillStyle=grad(x,L,[[0,C.c0],[.4,C.c1],[.76,C.c2],[1,C.tip]]);x.fill();
   x.save();P();x.clip();const sh=x.createLinearGradient(0,-w,0,w);sh.addColorStop(0,'rgba(255,255,255,.22)');sh.addColorStop(.5,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.28)');x.fillStyle=sh;x.fillRect(0,-w*1.2,L*1.05,w*2.4);
    x.lineWidth=Math.max(.35,w*.045);const n=Math.max(6,L/5|0);for(let i=1;i<n;i++){const u=i/n,px=L*u,py=-w*.08*u;x.strokeStyle='rgba(255,255,255,'+(.3-.15*u)+')';x.beginPath();x.moveTo(px,py);x.lineTo(px+L*.08,py-w*(.9-.5*u));x.stroke();x.strokeStyle='rgba(0,0,0,.16)';x.beginPath();x.moveTo(px,py);x.lineTo(px+L*.08,py+w*(.7-.35*u));x.stroke()}
    fade(x,L,w,.5);x.restore();
   core(x,w,C,L*.42,-w*.04,L*.72,-w*.12,L*.97,-w*.03,Math.max(.6,w*.13));
   P();x.lineJoin='round';x.strokeStyle=edge(x,L,C);x.lineWidth=Math.max(.55,w*.07);x.stroke()},
  covert(x,L,w,C){const P=()=>{x.beginPath();x.moveTo(0,-w*.3);x.bezierCurveTo(L*.3,-w*1.1,L*.9,-w*1.0,L,-w*.1);x.bezierCurveTo(L*1.02,w*.5,L*.5,w*.85,0,w*.3);x.closePath()};
   P();x.fillStyle=grad(x,L,[[0,M(C.c0,C.c1,.5)],[.55,C.c1],[1,C.c2]]);x.fill();x.save();P();x.clip();x.fillStyle='rgba(255,255,255,.28)';x.beginPath();x.ellipse(L*.5,-w*.4,L*.3,w*.25,-.1,0,6.3);x.fill();x.fillStyle='rgba(0,0,0,.18)';x.beginPath();x.ellipse(L*.45,w*.5,L*.4,w*.3,0,0,6.3);x.fill();x.restore();
   x.save();x.globalCompositeOperation='lighter';x.strokeStyle=R(C.tip,.4);x.lineWidth=Math.max(.5,w*.12);x.beginPath();x.moveTo(L*.55,-w*.62);x.quadraticCurveTo(L*.95,-w*.5,L*.98,-w*.05);x.stroke();x.restore();
   P();x.strokeStyle=C.line;x.lineWidth=Math.max(.5,w*.07);x.stroke()},
  plate(x,L,w,C){const P=()=>{x.beginPath();x.moveTo(0,-w*.42);x.lineTo(L*.6,-w*.8);x.lineTo(L*.88,-w*.52);x.lineTo(L,-w*.02);x.lineTo(L*.64,w*.44);x.lineTo(0,w*.3);x.closePath()};
   P();const g=x.createLinearGradient(0,-w*.8,0,w*.45);g.addColorStop(0,C.c2);g.addColorStop(.3,C.c1);g.addColorStop(1,C.c0);x.fillStyle=g;x.fill();
   x.save();P();x.clip();x.fillStyle='rgba(255,255,255,.09)';x.beginPath();x.moveTo(0,-w*.42);x.lineTo(L*.6,-w*.8);x.lineTo(L*.88,-w*.52);x.lineTo(L*.5,-w*.12);x.lineTo(0,-w*.1);x.closePath();x.fill();fade(x,L,w,.3);x.restore();
   P();x.lineJoin='miter';x.strokeStyle='#000';x.lineWidth=Math.max(.7,w*.09);x.stroke();
   x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=Math.max(.4,w*.035);x.beginPath();x.moveTo(L*.04,-w*.38);x.lineTo(L*.6,-w*.74);x.lineTo(L*.86,-w*.5);x.stroke();
   x.save();x.globalCompositeOperation='lighter';x.lineCap='round';x.lineJoin='round';x.shadowColor=C.glow;x.shadowBlur=Math.max(2,w*1.1);x.strokeStyle=C.glow;x.lineWidth=Math.max(.7,w*.12);x.beginPath();x.moveTo(L*.08,-w*.06);x.lineTo(L*.55,-w*.2);x.lineTo(L*.9,-w*.08);x.stroke();
   x.beginPath();x.moveTo(L*.88,-w*.52);x.lineTo(L,-w*.02);x.lineTo(L*.78,w*.28);x.stroke();x.shadowBlur=0;x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=Math.max(.35,w*.04);x.beginPath();x.moveTo(L*.1,-w*.06);x.lineTo(L*.55,-w*.2);x.lineTo(L*.88,-w*.08);x.stroke();x.restore()},
  scale(x,L,w,C){const P=()=>{x.beginPath();x.moveTo(0,-w*.45);x.lineTo(L*.66,-w*.62);x.lineTo(L,0);x.lineTo(L*.66,w*.55);x.lineTo(0,w*.42);x.closePath()};
   P();const g=x.createLinearGradient(0,-w*.6,0,w*.5);g.addColorStop(0,C.c2);g.addColorStop(.35,C.c1);g.addColorStop(1,C.c0);x.fillStyle=g;x.fill();P();x.strokeStyle='#000';x.lineWidth=Math.max(.7,w*.1);x.stroke();
   x.save();x.globalCompositeOperation='lighter';x.shadowColor=C.glow;x.shadowBlur=Math.max(2,w*.8);x.strokeStyle=R(C.glow,.85);x.lineWidth=Math.max(.6,w*.09);x.beginPath();x.moveTo(L*.66,-w*.62);x.lineTo(L,0);x.lineTo(L*.66,w*.55);x.stroke();x.restore()},
  tendril(x,L,w,C,r){const ph=r()*6.3,amp=w*(.6+r()*.6),N=16,T=[],B=[],cyf=u=>Math.sin(u*Math.PI*2.2+ph)*amp*u;
   for(let i=0;i<=N;i++){const u=i/N,cy=cyf(u),wd=w*(Math.pow(1-u,.75)*.85+.05);T.push(L*u,cy-wd);B.push(L*u,cy+wd*.75)}
   const P=()=>{x.beginPath();x.moveTo(T[0],T[1]);for(let i=2;i<T.length;i+=2)x.lineTo(T[i],T[i+1]);for(let i=B.length-2;i>=0;i-=2)x.lineTo(B[i],B[i+1]);x.closePath()};
   P();x.fillStyle=grad(x,L,[[0,C.c0],[.55,C.c1],[1,R(C.c2,.85)]]);x.fill();
   x.save();P();x.clip();x.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const u=r();x.fillStyle=R(i%3?'#ffffff':C.tip,.4+r()*.6);const s=.5+r()*1.1;x.fillRect(L*u,cyf(u)+(r()-.5)*w*.9,s,s)}x.globalCompositeOperation='source-over';fade(x,L,w,.45);x.restore();
   x.save();x.lineJoin='round';x.strokeStyle=edge(x,L,C);x.lineWidth=Math.max(.5,w*.09);x.beginPath();x.moveTo(T[0],T[1]);for(let i=2;i<T.length;i+=2)x.lineTo(T[i],T[i+1]);x.stroke();
   x.globalCompositeOperation='lighter';x.shadowColor=C.glow;x.shadowBlur=Math.max(2,w);x.fillStyle=R(C.tip,.75);for(let k=1;k<=3;k++){const u=1+k*.07;x.beginPath();x.arc(L*u,cyf(u),Math.max(.6,w*(.24-k*.05)),0,6.3);x.fill()}x.restore()},
  shroud(x,L,w,C,r){const P=()=>{x.beginPath();x.moveTo(0,-w*.4);x.bezierCurveTo(L*.3,-w*1.0,L*.6,-w*.9,L*.8,-w*.7);x.lineTo(L*.88,-w*.3);x.lineTo(L*.95,-w*.55);x.lineTo(L,-w*.05);x.lineTo(L*.9,w*.2);x.lineTo(L*.94,w*.45);x.lineTo(L*.78,w*.4);x.bezierCurveTo(L*.55,w*.8,L*.3,w*.7,0,w*.35);x.closePath()};
   P();x.fillStyle=grad(x,L,[[0,C.c0],[.6,C.c1],[1,M(C.c1,C.c2,.5)]]);x.fill();x.save();P();x.clip();x.globalCompositeOperation='lighter';for(let i=0;i<6;i++){x.fillStyle=R('#ffffff',.3+r()*.5);x.fillRect(r()*L,(r()-.5)*w,1,1)}x.restore();P();x.strokeStyle=R(C.tip,.4);x.lineWidth=Math.max(.5,w*.07);x.stroke()},
  ink(x,L,w,C,r){const j=()=>(r()-.5)*w*.25,P=()=>{x.beginPath();x.moveTo(0,-w*.3);x.bezierCurveTo(L*.25,-w*1.05+j(),L*.6,-w*.95+j(),L*.82,-w*.55);x.lineTo(L*.9,-w*.62);x.lineTo(L*.93,-w*.3);x.lineTo(L,-w*.18);x.lineTo(L*.9,w*.02);x.lineTo(L*.96,w*.22);x.lineTo(L*.8,w*.2);x.bezierCurveTo(L*.6,w*.65+j(),L*.3,w*.7,0,w*.3);x.closePath()};
   const s0=r()*1e9|0,PP=()=>{const rr=sr(s0);const jj=()=>(rr()-.5)*w*.25;x.beginPath();x.moveTo(0,-w*.3);x.bezierCurveTo(L*.25,-w*1.05+jj(),L*.6,-w*.95+jj(),L*.82,-w*.55);x.lineTo(L*.9,-w*.62);x.lineTo(L*.93,-w*.3);x.lineTo(L,-w*.18);x.lineTo(L*.9,w*.02);x.lineTo(L*.96,w*.22);x.lineTo(L*.8,w*.2);x.bezierCurveTo(L*.6,w*.65+jj(),L*.3,w*.7,0,w*.3);x.closePath()};
   PP();x.fillStyle=grad(x,L,[[0,C.c0],[.5,C.c1],[1,M(C.c1,C.c2,.35)]]);x.fill();
   x.save();PP();x.clip();x.lineCap='round';for(let k=0;k<3;k++){x.strokeStyle=R(C.c2,.22+k*.12);x.lineWidth=Math.max(.5,w*(.18-k*.05));x.beginPath();const y0=-w*(.55-k*.18);x.moveTo(L*(.25+k*.1),y0);x.bezierCurveTo(L*.5,y0-w*.15,L*.75,y0+w*.05,L*.97,y0*.4);x.stroke()}fade(x,L,w,.55);x.restore();
   core(x,w,C,L*.55,-w*.45,L*.8,-w*.5,L*.98,-w*.2,Math.max(.6,w*.12));
   for(let k=0;k<3;k++){const u=1.04+k*.08+r()*.03,y=(r()-.6)*w*.6;x.fillStyle=R(k==2?C.c2:C.c1,.65-k*.15);x.beginPath();x.ellipse(L*u,y,w*(.28-k*.06),w*(.12-k*.02),-.2,0,6.3);x.fill()}
   PP();x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=Math.max(.5,w*.05);x.stroke();void P},
  moth(x,L,w,C){const P=()=>{x.beginPath();x.moveTo(0,-w*.12);x.bezierCurveTo(L*.22,-w*1.05,L*.78,-w*1.35,L*.98,-w*.72);for(let i=1;i<=6;i++){const u=i/6,ex=L*(.98-.2*u),ey=-w*.72+w*1.15*u;x.quadraticCurveTo(ex+L*.05,ey-w*.1,ex,ey)}x.bezierCurveTo(L*.5,w*.62,L*.22,w*.5,0,w*.16);x.closePath()};
   P();x.fillStyle=grad(x,L,[[0,C.c0],[.5,C.c1],[1,M(C.c1,C.c0,.3)]]);x.fill();
   x.save();P();x.clip();x.strokeStyle=R(C.c2,.45);x.lineWidth=Math.max(.6,w*.035);x.lineCap='round';for(let i=0;i<6;i++){const a=-.95+i*.33;x.beginPath();x.moveTo(L*.04,0);x.quadraticCurveTo(L*.45,a*w*.6,L*.95,a*w*.85-w*.1);x.stroke()}
    x.strokeStyle=R(C.c2,.65);x.lineWidth=Math.max(.8,w*.06);x.beginPath();x.moveTo(L*.35,-w*.92);x.bezierCurveTo(L*.7,-w*1.05,L*.86,-w*.7,L*.8,-w*.1);x.bezierCurveTo(L*.76,w*.25,L*.6,w*.42,L*.45,w*.45);x.stroke();
    eye(x,L*.62,-w*.42,w*.3,C);eye(x,L*.33,-w*.2,w*.17,C);eye(x,L*.8,w*.02,w*.12,C);fade(x,L,w,.25);x.restore();
   P();x.strokeStyle=R(C.c2,.85);x.lineWidth=Math.max(.6,w*.045);x.stroke()},
  mothhind(x,L,w,C){const P=()=>{x.beginPath();x.moveTo(0,-w*.3);x.bezierCurveTo(L*.3,-w*.95,L*.7,-w*.8,L*.86,-w*.3);x.quadraticCurveTo(L*.92,-w*.12,L,-w*.08);x.quadraticCurveTo(L*.9,w*.12,L*.8,w*.15);x.bezierCurveTo(L*.6,w*.7,L*.25,w*.65,0,w*.3);x.closePath()};
   P();x.fillStyle=grad(x,L,[[0,C.c0],[.55,C.c1],[1,M(C.c1,C.c2,.3)]]);x.fill();
   x.save();P();x.clip();x.strokeStyle=R(C.c2,.4);x.lineWidth=Math.max(.6,w*.035);for(let i=0;i<5;i++){const a=-.8+i*.38;x.beginPath();x.moveTo(L*.04,0);x.quadraticCurveTo(L*.4,a*w*.5,L*.85,a*w*.7);x.stroke()}eye(x,L*.5,-w*.12,w*.3,C);eye(x,L*.76,-w*.2,w*.12,C);x.restore();
   P();x.strokeStyle=R(C.c2,.85);x.lineWidth=Math.max(.6,w*.045);x.stroke()},
  mothfur(x,L,w,C,r){x.fillStyle=C.c1;x.beginPath();x.ellipse(L*.5,0,L*.5,w*.6,0,0,6.3);x.fill();x.strokeStyle=R(C.c2,.35);x.lineWidth=Math.max(.4,w*.06);x.lineCap='round';for(let i=0;i<22;i++){const a=r()*6.3,k=.6+r()*.5;x.beginPath();x.moveTo(L*.5+Math.cos(a)*L*.3,Math.sin(a)*w*.35);x.lineTo(L*.5+Math.cos(a)*L*.5*k,Math.sin(a)*w*.62*k);x.stroke()}x.strokeStyle=R(C.c2,.6);x.lineWidth=Math.max(.5,w*.05);x.beginPath();x.ellipse(L*.5,0,L*.5,w*.6,0,0,6.3);x.stroke()},
  bolt(x,L,w,C,r){x.save();x.globalCompositeOperation='lighter';x.beginPath();x.moveTo(0,-w*.3);x.bezierCurveTo(L*.3,-w*1.1,L*.75,-w*.6,L,-w*.02);x.bezierCurveTo(L*.75,w*.4,L*.3,w*.6,0,w*.3);x.closePath();x.fillStyle=grad(x,L,[[0,R(C.c1,.5)],[.6,R(C.c1,.22)],[1,R(C.c2,.06)]]);x.fill();
   x.lineCap='round';x.lineJoin='round';const S=[],strand=(x0,y0,a,len,j,n)=>{const p=[x0,y0];for(let i=1;i<=n;i++){const u=i/n;p.push(x0+Math.cos(a)*len*u+(i<n?(r()-.5)*j*(1-u*.5):0),y0+Math.sin(a)*len*u+(i<n?(r()-.5)*j*(1-u*.5):0))}S.push(p);return p};
   const m=strand(0,0,-.02,L,w*.75,10);for(let k=0;k<2;k++){const i=2+((r()*6)|0)*2;strand(m[i],m[i+1],(r()<.5?-1:1)*(.35+r()*.45),L*(.16+r()*.2),w*.5,4)}
   for(const[lw,col,bl]of[[w*.85,R(C.glow,.16),0],[w*.24,R(C.c2,.8),w*1.2],[w*.08,'rgba(255,255,255,.95)',0]]){x.strokeStyle=col;x.lineWidth=Math.max(.4,lw);x.shadowColor=C.glow;x.shadowBlur=bl;for(const p of S){x.beginPath();x.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)x.lineTo(p[i],p[i+1]);x.stroke()}}x.restore()},
  arc(x,L,w,C,r){x.save();x.globalCompositeOperation='lighter';x.lineCap='round';for(let k=0;k<2;k++){const a=(r()-.5)*.6,b=(r()-.5)*1.2;for(const[lw,col]of[[w*.8,R(C.glow,.25)],[w*.3,R(C.c2,.8)],[w*.1,'#ffffff']]){x.strokeStyle=col;x.lineWidth=Math.max(.4,lw);x.beginPath();x.moveTo(0,0);x.bezierCurveTo(L*.35,a*w*2,L*.7,b*w*2,L,(a+b)*w*.6);x.stroke()}}x.restore()},
  bone(x,L,w,C,r){const cx=L*.5,cy=-w*1.4,ex=L*.93,ey=-w*.25,Q=u=>{const b=2*(1-u)*u,c=u*u;return[b*cx+c*ex,b*cy+c*ey]},D='#120c10';x.lineCap='round';
   const seg=(u0,u1,wd,col)=>{x.strokeStyle=col;x.lineWidth=wd;x.beginPath();let p=Q(u0);x.moveTo(p[0],p[1]);for(let i=1;i<=6;i++){p=Q(u0+(u1-u0)*i/6);x.lineTo(p[0],p[1])}x.stroke()},S=[[0,.36,w],[.36,.7,w*.78],[.7,.96,w*.56]];
   for(const s of S)seg(s[0],s[1],s[2]+Math.max(1.2,w*.3),D);for(const s of S)seg(s[0],s[1],s[2],C.c2);for(const s of S)seg(s[0]+.03,s[1]-.03,s[2]*.28,'rgba(110,90,100,.5)');
   const p=Q(.96),q=Q(1);x.save();x.translate(p[0],p[1]);x.rotate(Math.atan2(q[1]-p[1],q[0]-p[0]));x.beginPath();x.moveTo(0,-w*.32);x.quadraticCurveTo(L*.1,-w*.42,L*.13,w*.7);x.quadraticCurveTo(L*.05,w*.05,0,w*.32);x.closePath();x.fillStyle=C.c2;x.fill();x.strokeStyle=D;x.lineWidth=Math.max(.6,w*.14);x.stroke();x.restore();
   for(const u of[.36,.7]){const k=Q(u);x.fillStyle=D;x.beginPath();x.arc(k[0],k[1],w*.72,0,6.3);x.fill();x.fillStyle=C.c2;x.beginPath();x.arc(k[0],k[1],w*.55,0,6.3);x.fill();x.save();x.globalCompositeOperation='lighter';x.shadowColor=C.glow;x.shadowBlur=w*1.4;x.fillStyle=R(C.tip,.8);x.beginPath();x.arc(k[0],k[1],w*.22,0,6.3);x.fill();x.restore()}
   x.save();x.globalCompositeOperation='lighter';for(let k=0;k<3;k++){const d=Q(.18+k*.27+r()*.08),len=w*(2+r()*3),g=x.createLinearGradient(0,d[1],0,d[1]+len);g.addColorStop(0,R(C.tip,.75));g.addColorStop(1,R(C.tip,0));x.fillStyle=g;x.fillRect(d[0]-w*.12,d[1],w*.24,len);x.fillStyle=R(C.tip,.8);x.beginPath();x.arc(d[0],d[1]+len,w*.16,0,6.3);x.fill()}x.restore()},
  drip(x,L,w,C,r){x.save();x.globalCompositeOperation='lighter';const len=L*(.5+r()*.5),g=x.createLinearGradient(0,0,len,0);g.addColorStop(0,R(C.tip,.75));g.addColorStop(.7,R(C.c2,.35));g.addColorStop(1,R(C.c2,.05));x.fillStyle=g;x.beginPath();x.moveTo(0,-w*.5);x.quadraticCurveTo(len*.5,-w*.25,len,-w*.08);x.lineTo(len,w*.08);x.quadraticCurveTo(len*.5,w*.25,0,w*.5);x.closePath();x.fill();
   x.shadowColor=C.glow;x.shadowBlur=w*2;x.fillStyle=R(C.tip,.9);x.beginPath();x.ellipse(len+w*.3,0,w*.55,w*.42,0,0,6.3);x.fill();x.shadowBlur=0;x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.arc(len+w*.3,0,w*.18,0,6.3);x.fill();x.restore()},
  boneplate(x,L,w,C){x.beginPath();x.moveTo(0,-w*.5);x.quadraticCurveTo(L*.5,-w*.9,L,-w*.4);x.lineTo(L*.9,w*.5);x.quadraticCurveTo(L*.5,w*.75,L*.05,w*.45);x.closePath();const g=x.createLinearGradient(0,-w,0,w);g.addColorStop(0,C.c2);g.addColorStop(1,M(C.c2,C.c0,.55));x.fillStyle=g;x.fill();x.strokeStyle='#120c10';x.lineWidth=Math.max(.7,w*.14);x.stroke();x.strokeStyle='rgba(110,90,100,.6)';x.lineWidth=Math.max(.4,w*.06);x.beginPath();x.moveTo(L*.2,0);x.lineTo(L*.8,0);x.stroke()}};
 const EXT={bone:5.6,drip:1.6,moth:1.7,mothhind:1.3,mothfur:1,boneplate:1.2};
 const XEXT={tendril:1.3,ink:1.26,bone:1.16,bolt:1.08,drip:1.14};
 // one sprite per primary feather + a compact additive tip-glow sprite (only the tip area, so the per-frame glow pass stays cheap)
 function sprite(kind,L,w,C,r,ds,U){const ex=(EXT[kind]||3)*w+3,X0=-3,X1=L*(XEXT[kind]||1.1)+3,c=U.mkC((X1-X0)*ds,ex*2*ds),x=c.getContext('2d');x.scale(ds,ds);x.translate(-X0,ex);PT[kind](x,L,w,C,r);
  const ry=Math.max(w*1.1,3),rx=L*.24,gx=L*.86-rx,gy=-ry,gc=U.mkC(rx*2*ds,ry*2*ds),y=gc.getContext('2d');y.scale(ds,ds);y.translate(rx,ry);y.scale(rx/ry,1);const g=y.createRadialGradient(0,0,0,0,0,ry);g.addColorStop(0,R(C.tip,.85));g.addColorStop(.45,R(C.glow,.35));g.addColorStop(1,R(C.glow,0));y.fillStyle=g;y.beginPath();y.arc(0,0,ry,0,6.3);y.fill();
  return{c,g:gc,gx,gy,gw:rx*2,gh:ry*2,ox:-X0,oy:ex,w:X1-X0,h:ex*2,L}}
 function row(kind,cnt,Lf,wf,ang,pos,L,la,C,r,ds,U,ridge){const els=[],ex=EXT[kind]||3;let x0=-2,y0=-2,x1=la+2,y1=2;
  for(let i=0;i<cnt;i++){const u=cnt>1?i/(cnt-1):.5,Li=L*Lf*(.86+.2*u)*(.94+r()*.1),wi=Li*wf,e={x:la*lerp(pos[0],pos[1],u),a:lerp(ang[0],ang[1],u)*RAD+(r()-.5)*.05,L:Li,w:wi};els.push(e);
   const ca=Math.cos(e.a),sa=Math.sin(e.a);for(const q of[[0,-wi*ex],[Li*1.32,-wi*ex],[Li*1.32,wi*ex],[0,wi*ex]]){const X=e.x+q[0]*ca-q[1]*sa,Y=q[0]*sa+q[1]*ca;x0=Math.min(x0,X);x1=Math.max(x1,X);y0=Math.min(y0,Y);y1=Math.max(y1,Y)}}
  x0-=3;y0-=3;x1+=3;y1+=3;const c=U.mkC((x1-x0)*ds,(y1-y0)*ds),x=c.getContext('2d');x.scale(ds,ds);x.translate(-x0,-y0);
  if(ridge&&la>L*.15&&kind!='boneplate'){x.lineCap='round';if(C.add){x.globalCompositeOperation='lighter';x.shadowColor=C.glow;x.shadowBlur=L*.05;x.strokeStyle=R(C.glow,.8);x.lineWidth=Math.max(1,L*.02);x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(la*.5,-L*.012,la,0);x.stroke();x.shadowBlur=0;x.strokeStyle='#ffffff';x.lineWidth=Math.max(.5,L*.006);x.stroke();x.globalCompositeOperation='source-over'}
   else{x.strokeStyle='#0c0810';x.lineWidth=Math.max(1.4,L*.032);x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(la*.5,-L*.012,la,0);x.stroke();x.strokeStyle=C.c2;x.lineWidth=Math.max(.8,L*.018);x.stroke();x.strokeStyle=R(C.tip,.6);x.lineWidth=Math.max(.4,L*.006);x.stroke()}}
  for(const e of els){x.save();x.translate(e.x,0);x.rotate(e.a);PT[kind](x,e.L,e.w,C,r);x.restore()}
  return{c,ox:-x0,oy:-y0,w:x1-x0,h:y1-y0}}
 function orn(kind,L,C,ds,U){const s=L*.13,m=s*1.6,c=U.mkC(m*2*ds,m*2*ds),x=c.getContext('2d');x.scale(ds,ds);x.translate(m,m);
  if(kind=='claw'){for(let k=0;k<3;k++){x.save();x.rotate(-1.3+k*.42);const t=s*(.85+k*.12);x.beginPath();x.moveTo(0,-t*.13);x.quadraticCurveTo(t*.7,-t*.28,t*1.05,t*.3);x.quadraticCurveTo(t*.6,-t*.02,0,t*.13);x.closePath();const g=x.createLinearGradient(0,0,t,0);g.addColorStop(0,C.c0);g.addColorStop(.6,C.c1);g.addColorStop(1,C.tip);x.fillStyle=g;x.fill();x.strokeStyle='#14061f';x.lineWidth=Math.max(.6,t*.06);x.stroke();
    x.globalCompositeOperation='lighter';x.shadowColor=C.glow;x.shadowBlur=t*.4;x.strokeStyle=R(C.tip,.85);x.lineWidth=Math.max(.5,t*.045);x.beginPath();x.moveTo(t*.4,-t*.18);x.quadraticCurveTo(t*.8,-t*.15,t*1.02,t*.27);x.stroke();x.restore()}}
  else{x.beginPath();x.moveTo(0,-s*.5);x.lineTo(s*.32,0);x.lineTo(0,s*.5);x.lineTo(-s*.32,0);x.closePath();x.fillStyle=C.c1;x.fill();x.strokeStyle='#000';x.lineWidth=Math.max(.6,s*.06);x.stroke();x.globalCompositeOperation='lighter';x.shadowColor=C.glow;x.shadowBlur=s*.6;x.fillStyle=R(C.glow,.9);x.beginPath();x.moveTo(0,-s*.3);x.lineTo(s*.16,0);x.lineTo(0,s*.3);x.lineTo(-s*.16,0);x.closePath();x.fill()}
  return{c,o:m,m:m*2}}
 function build(W,p,L,ds,pal,seed,U){const r=U.sr(seed),E=p.e||['feather','feather','covert'],N=p.n||[9,8,7],LEN=p.len||[.62,.38,.2],fw=p.fw||.18,WD=p.wd||[fw,fw*1.3,fw*1.7],la=(p.la!=null?p.la:.4)*L,lh=(p.lh!=null?p.lh:.12)*L,dark=U.lum(pal[1])<.3;
  const C={c0:pal[0],c1:pal[1],c2:pal[2],tip:p.tip||pal[3],glow:pal[3],line:dark?R(pal[3],.4):R(M(pal[0],'#000000',.5),.7),pal,add:p.add};
  const pr=[];for(let i=0;i<N[0];i++){const u=N[0]>1?i/(N[0]-1):0,Li=L*LEN[0]*(1-.32*Math.pow(u,1.3))*(.95+r()*.08);pr.push(sprite(E[0],Li,Li*WD[0]*(1+u*.2),C,r,ds,U))}
  const RA=p.ra||[[100,72],[78,58]],RP=p.rp||[[.1,1.02],[0,.98]],PA=p.pa||[-12,96];
  return{kind:'tier',L,la,lh,arm:(p.arm!=null?p.arm:-36)*RAD,pa0:PA[0]*RAD,pa1:PA[1]*RAD,pr,t2:row(E[1],N[1],LEN[1],WD[1],RA[0],RP[0],L,la,C,r,ds,U,0),t3:row(E[2],N[2],LEN[2],WD[2],RA[1],RP[1],L,la,C,r,ds,U,1),orn:p.orn?orn(p.orn,L,C,ds,U):null,al:p.al||1,glow:p.glow?1:0}}
 // ---------- drawing one side (mirrored frame, +x outward, root at 0,0) ----------
 function drawTier(g,P,ps,t,ph,fx){const k0=ps.k0||DEF,k1=ps.k1||k0,k2=ps.k2||k0,a0=g.globalAlpha*P.al,G=k0[7];
  const A=P.arm+k0[0],wx=Math.cos(A)*P.la,wy=Math.sin(A)*P.la,aH=A+(k2[0]-k0[0])+k2[1],ch=Math.cos(aH),sh=Math.sin(aH),sp=lerp(.22,1,k2[2])*(1-k2[3]*.55),sl=lerp(.8,1,k2[2]),n=P.pr.length;
  g.globalAlpha=a0;
  // T1 primaries: one setTransform per feather (base matrix x hinge), no save/restore
  const M=g.getTransform(),ma=M.a,mb=M.b,mc=M.c,md=M.d,me=M.e,mf=M.f,gl=fx&&P.glow;
  for(let i=n-1;i>=0;i--){const u=n>1?i/(n-1):0,s=P.pr[i],a=aH+(P.pa0+(P.pa1-P.pa0)*u)*sp-k2[5]*u*.6+Math.sin(t*5.2+i*1.3+ph)*.014*(.5+k2[8]),d=P.lh*(1-u),bx=wx+ch*d,by=wy+sh*d,co=Math.cos(a),si=Math.sin(a);
   g.setTransform((ma*co+mc*si)*sl,(mb*co+md*si)*sl,mc*co-ma*si,md*co-mb*si,ma*bx+mc*by+me,mb*bx+md*by+mf);g.drawImage(s.c,-s.ox,-s.oy,s.w,s.h);
   if(gl){g.globalCompositeOperation='lighter';g.globalAlpha=a0*cl(.42*G*(.78+.22*Math.sin(t*3.1+i*.7+ph)),0,1);g.drawImage(s.g,s.gx,s.gy,s.gw,s.gh);g.globalCompositeOperation='source-over';g.globalAlpha=a0}}
  g.setTransform(M);
  const T2=P.t2,T3=P.t3;g.save();g.rotate(A+(k1[0]-k0[0])+k1[5]*.35);g.scale(1,lerp(.5,1,k1[2])*(1-k1[3]*.28));g.drawImage(T2.c,-T2.ox,-T2.oy,T2.w,T2.h);g.restore();
  g.save();g.rotate(A);g.scale(1,lerp(.62,1,k0[2])*(1-k0[3]*.15));g.drawImage(T3.c,-T3.ox,-T3.oy,T3.w,T3.h);g.restore();
  if(P.orn){const o=P.orn;g.save();g.translate(wx,wy);g.rotate(aH);g.drawImage(o.c,-o.o,-o.o,o.m,o.m);g.restore()}
  g.globalAlpha=a0/P.al}
 // tip positions (3 outermost primaries) in the side frame; older families get an estimate from spread + stroke angle
 function tipsLocal(P,ps,out){const k0=ps.k0||DEF,k2=ps.k2||k0,A=P.arm+k0[0],wx=Math.cos(A)*P.la,wy=Math.sin(A)*P.la,aH=A+(k2[0]-k0[0])+k2[1],sp=lerp(.22,1,k2[2])*(1-k2[3]*.55),sl=lerp(.8,1,k2[2]),n=P.pr.length;
  for(let i=0;i<3;i++){const ii=Math.min(n-1,i),u=n>1?ii/(n-1):0,a=aH+(P.pa0+(P.pa1-P.pa0)*u)*sp-k2[5]*u*.6,d=P.lh*(1-u),L=P.pr[ii].L*sl*.96;out[i*2]=wx+Math.cos(aH)*d+Math.cos(a)*L;out[i*2+1]=wy+Math.sin(aH)*d+Math.sin(a)*L}}
 function oldTips(art,ps,out){const L=art.L*(.45+.55*cl(ps.s||0,0,1)),f=ps.fl||0;const A=[[-.8,.95],[-.15,.85],[.55,.7]];for(let i=0;i<3;i++){const a=A[i][0]+f*(1.2-i*.2);out[i*2]=Math.cos(a)*L*A[i][1];out[i*2+1]=Math.sin(a)*L*A[i][1]}}
 const LT=new Float32Array(6);
 function tipsUser(art,ps,rx,ry,f,out){const P=art.parts.find(p=>p.kind=='tier');let k=0;f=f||1;
  for(let side=-1;side<=1;side+=2){const far=side*f<0,sx=(far?.95:1)*(ps.sx||1),sy=far?.97:1;if(P)tipsLocal(P,ps,LT);else oldTips(art,ps,LT);for(let i=0;i<3;i++){out[k++]=rx+side*3+side*sx*LT[i*2];out[k++]=ry+sy*LT[i*2+1]}}return out}
 // ---------- the cycle (per character key) ----------
 const ST=new Map(),tmp=new Float32Array(9),PV=[new Float32Array(9),new Float32Array(9),new Float32Array(9)];
 const mkSt=()=>({ph:'g',t:0,c:0,hc:Math.random(),fw:1,ft:0,tier:-1,air:false,init:0,o:[0,1,2].map(()=>new Float32Array(9)),fr:[0,1,2].map(()=>new Float32Array(9))});
 function target(st,j,ps,out){switch(st.ph){
  case'f':{out.set(KF[0]);const e=Math.exp(-st.ft*5);out[0]+=Math.sin(st.ft*16-j*.7)*.08*e;out[1]+=Math.sin(st.ft*16-j*.9-1)*.06*e*j;return out}
  case'p':return loop(out,FS,FT,st.c-LAG[j]);
  case'h':return loop(out,HS,HT,st.hc-LAG[j]*.6);
  default:{loop(out,HS,HT,st.hc-LAG[j]*.6);const e=ease(ps.s);for(let i=0;i<9;i++)out[i]=FOLD[i]+(out[i]-FOLD[i])*e;out[0]+=(ps.land||0)*.35;out[8]*=.35;return out}}}
 function apply(ps,k0,k1,k2,air,cph,amp){ps.k0=k0;ps.k1=k1;ps.k2=k2;ps.open=ps.s;if(air){ps.s=cl(ps.s*k0[2],0,1);ps.fl=k0[0]*.6;ps.fll=k2[0]*.6;ps.sx=k0[4];if(cph!=null){ps.ph=cph;ps.amp=amp}}return ps}
 function cyc(ps,key,tier,t,mode,vy,W,o,art){
  if(o&&o.kf!=null){const i=cl(o.kf|0,0,7),k=[0,1,2].map(j=>kfVec(i,j,0));apply(ps,k[0],k[1],k[2],true,i*.8,.2);ps.open=1;ps.land=0;return ps}
  if(!key||WingArt.dbg){if(!art.parts.some(P=>P.kind=='tier'))return ps;const c=t/2.6+(ps.ph||0)*.01;for(let j=0;j<3;j++)loop(PV[j],HS,HT,c-LAG[j]*.6);ps.k0=PV[0];ps.k1=PV[1];ps.k2=PV[2];return ps}
  let st=ST.get(key);if(!st){st=mkSt();ST.set(key,st);if(ST.size>48)ST.delete(ST.keys().next().value)}
  let dt=t-st.t;st.t=t;if(!(dt>0)||dt>.1)dt=.016;
  const air=mode==2,me=key=='me',fly=air&&(me?WingArt.FL.on:vy!=null&&vy<-60),big=cl((W.a.L-40)/70,0,1);let np=st.ph;
  if(st.tier!==tier){if(mode>=0){np='f';st.ft=0}st.tier=tier}
  if(air&&!st.air&&mode>=0){np='f';st.ft=0}st.air=air;
  if(np=='f'){st.ft+=dt;if(st.ft>(fly?.34:.62))np='x'}
  if(np!='f')np=mode<0||!air?'g':fly?'p':'h';
  if(np!==st.ph){for(let j=0;j<3;j++)st.fr[j].set(st.o[j]);st.fw=st.init?0:1;st.ph=np}st.init=1;
  if(fly&&me)st.c=((WingArt.FL.ph/TAU)%1+1)%1;else st.c+=dt*(15-big*5)/TAU;st.hc+=dt/(2.3+big*.9);
  st.fw=Math.min(1,st.fw+dt/(st.ph=='f'?.12:.2));const e=ease(st.fw);
  for(let j=0;j<3;j++){target(st,j,ps,tmp);const a=st.o[j],f=st.fr[j];for(let i=0;i<9;i++)a[i]=f[i]+(tmp[i]-f[i])*e}
  apply(ps,st.o[0],st.o[1],st.o[2],air,st.ph=='p'?st.c*TAU:st.hc*TAU,st.ph=='p'?.26:.07);
  if(me){if(WingArt.FL.on&&air)WingArt.FL.bob=st.o[0][6];else WingArt.FL.bob=0}
  return ps}
 // ---------- halo ring behind the back (+ orbiting petals) ----------
 function ringSpr(art){if(art.ring9)return art.ring9;const A=art.W.a.ring,col=A.c,r=A.r*art.L,m=r*.7,S=r+m,ds=2,c=document.createElement('canvas');c.width=c.height=Math.ceil(S*2*ds);const x=c.getContext('2d');x.scale(ds,ds);x.translate(S,S);
  x.shadowColor=col;x.shadowBlur=m*.8;x.strokeStyle=col;x.lineWidth=Math.max(1.5,r*.13);x.beginPath();x.arc(0,0,r,0,6.3);x.stroke();x.shadowBlur=m*.3;x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=Math.max(.8,r*.045);x.stroke();x.shadowBlur=0;
  for(let k=0;k<12;k++){x.save();x.rotate(k/12*TAU);x.translate(0,-r);x.fillStyle=k%2?R(col,.8):'rgba(255,255,255,.85)';x.beginPath();x.moveTo(0,-r*.16);x.quadraticCurveTo(r*.07,0,0,r*.06);x.quadraticCurveTo(-r*.07,0,0,-r*.16);x.fill();x.restore()}
  return art.ring9={c,o:S,s:S*2,r}}
 function pre(g,art,ps,rx,ry,t,fx){const A=art.W.a;if(!A.ring)return;const Rg=ringSpr(art),s=(.6+.4*ease(ps.open!=null?ps.open:ps.s))*(1+.025*Math.sin(t*2));g.save();g.globalCompositeOperation='lighter';g.globalAlpha*=.9;g.translate(rx,ry-art.L*.05);g.rotate(Math.sin(t*.4)*.05);g.drawImage(Rg.c,-Rg.o*s,-Rg.o*s,Rg.s*s,Rg.s*s);
  if(fx){const P=tsprite(art,'petal'),a0=g.globalAlpha;for(let k=0;k<6;k++){const a=t*.6+k*1.047,x=Math.cos(a)*Rg.r*s*1.15,y=Math.sin(a)*Rg.r*s*1.15;g.globalAlpha=a0*(.55+.3*Math.sin(t*2+k));g.drawImage(P,x-5,y-5,10,10)}}g.restore()}
 // ---------- trail particles: dust, light feathers, embers, sparks, petals, ink smoke, light drips, void motes ----------
 const PK={dust:{add:1,g:-10,dr:1.4,l:[.6,1.2],z:[3,6]},spark:{add:1,g:40,dr:2.6,l:[.25,.55],z:[5,9],vel:1},ember:{add:1,g:-45,dr:1.2,l:[.5,1],z:[3,5]},feather:{add:0,g:22,dr:3.2,l:[.9,1.6],z:[7,10],spin:1},
  petal:{add:0,g:16,dr:2.6,l:[1,1.8],z:[5,8],spin:1},smoke:{add:0,g:-16,dr:2,l:[.6,1.1],z:[8,14],grow:1},drip:{add:1,g:170,dr:.4,l:[.45,.85],z:[5,8],vel:1},void:{add:0,g:-6,dr:1.8,l:[.7,1.3],z:[4,7]}};
 function tsprite(art,kind){const C=art.tsp9||(art.tsp9={});if(C[kind])return C[kind];const pal=art.W.pal,S=32,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');x.translate(S/2,S/2);
  if(kind=='dust'||kind=='ember'){const col=kind=='ember'?pal[2]:pal[3],g=x.createRadialGradient(0,0,0,0,0,15);g.addColorStop(0,'#ffffff');g.addColorStop(.25,col);g.addColorStop(1,R(col,0));x.fillStyle=g;x.fillRect(-16,-16,32,32)}
  else if(kind=='spark'){const g=x.createRadialGradient(0,0,0,0,0,9);g.addColorStop(0,R(pal[3],.9));g.addColorStop(1,R(pal[3],0));x.fillStyle=g;x.fillRect(-16,-16,32,32);x.fillStyle='#fff';x.beginPath();x.moveTo(-15,0);x.quadraticCurveTo(0,-1.6,15,0);x.quadraticCurveTo(0,1.6,-15,0);x.moveTo(0,-6);x.quadraticCurveTo(1,0,0,6);x.quadraticCurveTo(-1,0,0,-6);x.fill()}
  else if(kind=='feather'){x.rotate(-.4);x.beginPath();x.moveTo(-13,0);x.quadraticCurveTo(-2,-6,13,-1);x.quadraticCurveTo(0,5,-13,0);x.fillStyle=pal[2];x.fill();x.strokeStyle=R(pal[0],.6);x.lineWidth=1;x.stroke();x.beginPath();x.moveTo(-13,0);x.lineTo(12,-1);x.strokeStyle='rgba(255,255,255,.75)';x.stroke()}
  else if(kind=='petal'){x.beginPath();x.moveTo(-10,0);x.bezierCurveTo(-4,-9,8,-7,11,0);x.bezierCurveTo(7,6,-4,7,-10,0);x.fillStyle=M(pal[2],'#ffc8e0',.45);x.fill();x.fillStyle='rgba(255,255,255,.65)';x.beginPath();x.ellipse(1,-2,5,2,0,0,6.3);x.fill()}
  else if(kind=='smoke'){const g=x.createRadialGradient(0,0,0,0,0,15);g.addColorStop(0,R(pal[1],.75));g.addColorStop(.6,R(pal[0],.4));g.addColorStop(1,R(pal[0],0));x.fillStyle=g;x.fillRect(-16,-16,32,32)}
  else if(kind=='drip'){const g=x.createLinearGradient(-15,0,10,0);g.addColorStop(0,R(pal[3],0));g.addColorStop(1,R(pal[3],.9));x.fillStyle=g;x.beginPath();x.moveTo(-15,0);x.quadraticCurveTo(2,-4,9,-4);x.arc(9,0,4,-Math.PI/2,Math.PI/2);x.quadraticCurveTo(2,4,-15,0);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(9,0,1.8,0,6.3);x.fill()}
  else{x.fillStyle=pal[0];x.beginPath();x.arc(0,0,9,0,6.3);x.fill();x.strokeStyle=R(pal[3],.9);x.lineWidth=1.8;x.stroke();x.fillStyle='#fff';x.fillRect(-1,-1,2,2)}
  return C[kind]=c}
 const TRS=new Map(),TT=new Float32Array(12),TP=new Float32Array(12);
 function drawPts(g,art,P,dt,ox,oy,step){if(!P.length)return;const a0=g.globalAlpha;g.save();let add=-1;
  for(let i=P.length-1;i>=0;i--){const p=P[i];if(step){p.l+=dt;if(p.l>=p.m){P[i]=P[P.length-1];P.pop();continue}const K=PK[p.k]||PK.dust,dr=Math.exp(-K.dr*dt);p.vx*=dr;p.vy=p.vy*dr+K.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt}
   const K=PK[p.k]||PK.dust,u=p.l/p.m,a=Math.min(1,u*6+(step?0:1))*(1-u)*(p.a||1),z=p.z*(K.grow?1+u*1.5:1-u*.35);if(a<=.01)continue;const s=tsprite(art,p.k);
   if(K.add!==add){g.globalCompositeOperation=K.add?'lighter':'source-over';add=K.add}g.globalAlpha=a0*a;const X=p.x-ox,Y=p.y-oy;
   if(K.spin||K.vel){g.save();g.translate(X,Y);g.rotate(K.vel?Math.atan2(p.vy,p.vx):p.r);g.drawImage(s,-z,-z,z*2,z*2);g.restore()}else g.drawImage(s,X-z,Y-z,z*2,z*2)}
  g.restore()}
 // frozen trail for still frames (sprite sheet): particles laid out behind each tip, against its motion between neighbouring keys
 function frozen(g,art,ps,rx,ry,f,i,kinds){tipsUser(art,ps,rx,ry,f,TT);
  if(i==0){for(let k=0;k<6;k++){TP[k*2]=lerp(rx,TT[k*2],.8);TP[k*2+1]=lerp(ry,TT[k*2+1],.8)}}
  else{const k=[0,1,2].map(j=>kfVec(i,j,i<=4?-.07:-.12)),q={s:k[0][2],fl:k[0][0]*.6,sx:k[0][4],k0:k[0],k1:k[1],k2:k[2]};tipsUser(art,q,rx,ry,f,TP)}
  const rr=sr(hash(art.W.id)+i*77),P=[];
  for(let k=0;k<6;k++){let dx=TT[k*2]-TP[k*2],dy=TT[k*2+1]-TP[k*2+1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;if(i==0){dx=-dx;dy=-dy}
   for(let j=0;j<4;j++){const kd=kinds[(j+k)%kinds.length],K=PK[kd]||PK.dust,s=6+j*9+rr()*5;P.push({x:TT[k*2]-dx*s+(rr()-.5)*5,y:TT[k*2+1]-dy*s+(rr()-.5)*5,vx:-dx,vy:-dy,l:j*.15+.05,m:1,z:(K.z[0]+K.z[1])*.5*(1-j*.1),r:rr()*6.3,k:kd,a:.95})}}
  drawPts(g,art,P,0,0,0,false)}
 function post(g,art,ps,rx,ry,f,t,key,o,fx){const kinds=art.W.a.trail;if(!kinds)return;
  if(o&&o.kf!=null){if(o.trail)frozen(g,art,ps,rx,ry,f,cl(o.kf|0,0,7),kinds);return}
  if(!key||WingArt.dbg||!fx||typeof cam=='undefined')return;if(key!='me'&&fx<2)return;
  let st=TRS.get(key);if(!st){st={p:[],tp:new Float32Array(12),has:0,acc:0,t,n:0};TRS.set(key,st);if(TRS.size>16)TRS.delete(TRS.keys().next().value)}
  let dt=t-st.t;st.t=t;if(!(dt>0)||dt>.1){dt=.016;st.has=0}
  tipsUser(art,ps,rx,ry,f,TT);for(let k=0;k<12;k+=2){TT[k]+=cam.x;TT[k+1]+=cam.y}
  const cap=Math.round([0,12,24,40][Math.min(3,fx)]*(key=='me'?1:.5)*Math.min(1.25,QM.vfxK||1)),E=ps.k0?ps.k0[8]:.4,Rn=Math.random;
  if(st.has){st.acc+=dt*18*E;while(st.acc>=1){st.acc-=1;if(st.p.length>=cap)continue;const k=(Rn()*6)|0,X=TT[k*2],Y=TT[k*2+1],vx=cl((X-st.tp[k*2])/dt,-420,420),vy=cl((Y-st.tp[k*2+1])/dt,-420,420),kd=kinds[(st.n++)%kinds.length],K=PK[kd]||PK.dust;
    st.p.push({x:X+(Rn()-.5)*4,y:Y+(Rn()-.5)*4,vx:vx*.18+(Rn()-.5)*30,vy:vy*.18+(Rn()-.5)*30,l:0,m:K.l[0]+Rn()*(K.l[1]-K.l[0]),z:K.z[0]+Rn()*(K.z[1]-K.z[0]),r:Rn()*6.3,vr:(Rn()-.5)*5,k:kd})}}
  st.tp.set(TT);st.has=1;drawPts(g,art,st.p,dt,cam.x,cam.y,true)}
 WingArt.FAM.tier={build,draw:drawTier};WingArt.CYC=cyc;WingArt.PRE=pre;WingArt.POST=post;
 return{KF,NAMES,FOLD,kfVec,loop,tipsUser,state:k=>ST.get(k),parts:k=>{const s=TRS.get(k);return s?s.p.length:0},ST,TRS,PK}})();
