// ===== Aura pose (v9): whenever wings are on, the character takes an "ascended" stance. In the air (flying, gliding, hovering): a heroic
// flight pose (leaning into the motion, legs together and trailing, far arm swept back, near arm reaching forward) inside an aura glow
// tinted by the wing. On the ground at rest: a slow levitation a few px above the ground with open arms and a shimmering aura.
// Running, attacking, mining and hit reactions fade the stance out so their animations stay readable. Purely visual: the lift is a draw
// offset (AC6.draw), P / hitboxes never change, and the pet's local-player check (82-companions, 16 px y slack) still matches.
const AURAP=(()=>{
 const S=new Map(),GC=new Map(),cl=(v,a,b)=>v<a?a:v>b?b:v;
 const hx=h=>{const n=parseInt(String(h).slice(1),16);return[n>>16&255,n>>8&255,n&255]},R=(h,a)=>{const c=hx(h);return'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'};
 // pre-rendered aura (soft body glow + rising flame tongues), cached per colour; one or two drawImage calls per frame
 function spr(col,c2){const k=col+c2;let c=GC.get(k);if(c)return c;c=document.createElement('canvas');c.width=120;c.height=150;const x=c.getContext('2d');x.translate(60,104);
  x.save();x.scale(1,1.55);const g=x.createRadialGradient(0,-14,2,0,-14,40);g.addColorStop(0,R(c2,.55));g.addColorStop(.35,R(col,.3));g.addColorStop(1,R(col,0));x.fillStyle=g;x.beginPath();x.arc(0,-14,40,0,6.3);x.fill();x.restore();
  // flame tongues: pointed at both ends and faded at the base so they never read as a block
  for(let i=0;i<7;i++){const a=(i-3)*.34,bx=Math.sin(a)*17,h=44+((i*37)%5)*7,y0=4-Math.abs(i-3)*4,gr=x.createLinearGradient(0,y0,0,y0-h);gr.addColorStop(0,R(col,0));gr.addColorStop(.22,R(col,.34));gr.addColorStop(.62,R(c2,.18));gr.addColorStop(1,R(c2,0));x.fillStyle=gr;x.beginPath();x.moveTo(bx,y0);x.quadraticCurveTo(bx-8,y0-h*.4,bx+a*12,y0-h);x.quadraticCurveTo(bx+8,y0-h*.42,bx,y0);x.closePath();x.fill()}
  GC.set(k,c);if(GC.size>40)GC.delete(GC.keys().next().value);return c}
 function pose(key,wi,air,vx,sw,t,local){const W=WINGS[wi];if(!W)return null;let st=S.get(key);if(!st){st={air:air?1:0,lev:air?0:1,t,mo:0};S.set(key,st);if(S.size>48)S.delete(S.keys().next().value)}
  let dt=t-st.t;st.t=t;if(!(dt>0)||dt>.1)dt=.016;const prev=WingArt.dbg;   // wing collection preview: settle at once
  const run=Math.abs(vx)>10,act=sw>0,hurt=local&&typeof iT!='undefined'&&iT>0;
  const ta=air?(act?.45:1):0,tl=!air&&!run&&!act&&!hurt?1:0;
  if(prev){st.air=ta;st.lev=tl}else{st.air+=(ta-st.air)*(1-Math.exp(-dt*9));st.lev+=(tl-st.lev)*(1-Math.exp(-dt*(tl>st.lev?3:9)))}
  const sp=cl(Math.abs(vx)/260,0,1),lean=st.air*(.07+sp*.15);
  if(local&&!prev&&st.lev>.6&&QM.cur.wfx>=1&&typeof VFX!='undefined'&&typeof cam!='undefined'){st.mo+=dt*2.2;if(st.mo>=1){st.mo=0;try{VFX.mote(P.x+(Math.random()-.5)*34,P.y+P.h-4,W.pal[3])}catch(_){}}}
  return{lev:st.lev*(4.5+Math.sin(t*1.9)*1.6),air:st.air,arms:st.lev*(1-st.air),lean,col:W.pal[3],c2:W.pal[2],ga:cl(.2+.22*st.air+.08*st.lev,0,.6)}}
 function glow(g,pz,cx,fy,t){if(QM.cur.wfx<0)return;const c=spr(pz.col,pz.c2),pu=.82+.18*Math.sin(t*3.3),s=1+.04*Math.sin(t*2.1);g.save();g.globalCompositeOperation='lighter';g.globalAlpha*=pz.ga*pu;g.translate(cx,fy);g.scale(s,s*(1+.05*Math.sin(t*4.7)));g.drawImage(c,-60,-104);g.restore()}
 AC6.PZ=pose;AC6.PZG=glow;
 return{pose,glow,S}})();
