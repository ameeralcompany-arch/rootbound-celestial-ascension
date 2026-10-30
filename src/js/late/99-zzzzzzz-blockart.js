// ===== BART9: hand-painted "soft 3D" block art. Chunky rounded bevels, soft top-left light, gentle ambient occlusion in the cracks and a
// painterly, slightly glossy finish, for the natural and building blocks: dirt with glowing teal roots, mossy grass, calm river-stone grey,
// pale oak planks, velvety moss, faceted sapphire / emerald / ruby... gems in dark cracked rock, gold nuggets in cobbles, wind-swept sand and
// iridescent pearl marble. This file loads after every other blockSprite wrapper (it sorts last), so it wins for the ids it covers and
// passes every other id straight through.
// Contract: blockSprite(b,v) still returns a T x T canvas, painted once per block / variant and cached in SPR by spr(); the TILE7 chunk
// cache, icons and the per-frame drawing are unchanged. Each sprite is painted at 2x into one reused scratch canvas and filtered down to
// T x T, so the fine detail (pebbles, facets, moss strands) comes out anti-aliased and crisp. Nothing here runs per frame. =====
const BART9=(()=>{
 const Q=2,TAU=Math.PI*2,RAD=5.5;
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 // ---- colours (hex in, hex out so they chain)
 const h2r=c=>{const n=parseInt(c.slice(1),16);return[n>>16&255,n>>8&255,n&255]};
 const r2h=(r,g,b)=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
 const tn=(c,f)=>{const[r,g,b]=h2r(c);return f<=1?r2h(r*f,g*f,b*f):r2h(r+(255-r)*(f-1),g+(255-g)*(f-1),b+(255-b)*(f-1))};// f<1 darker, f>1 towards white
 const mx=(a,b,t)=>{const A=h2r(a),B=h2r(b);return r2h(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t)};
 const ra=(c,a)=>{const[r,g,b]=h2r(c);return'rgba('+r+','+g+','+b+','+a+')'};
 // ---- drawing helpers (all in T-space; the context is scaled by Q)
 const lin=(x,x0,y0,x1,y1,st)=>{const g=x.createLinearGradient(x0,y0,x1,y1);st.forEach((c,i)=>g.addColorStop(i/(st.length-1),c));return g};
 const rrect=(x,a,b,w,h,r)=>{x.beginPath();if(x.roundRect)x.roundRect(a,b,w,h,r);else{x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}};
 const poly=(x,p)=>{x.beginPath();x.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)x.lineTo(p[i][0],p[i][1]);x.closePath()};
 const smooth=(x,p)=>{const n=p.length,m=i=>[(p[i%n][0]+p[(i+1)%n][0])/2,(p[i%n][1]+p[(i+1)%n][1])/2];x.beginPath();let s=m(n-1);x.moveTo(s[0],s[1]);for(let i=0;i<n;i++){const e=m(i);x.quadraticCurveTo(p[i][0],p[i][1],e[0],e[1])}x.closePath()};
 const blob=(R,cx,cy,r,n,j,sy)=>{const p=[];for(let i=0;i<n;i++){const a=i/n*TAU,q=r*(1-j/2+R()*j);p.push([cx+Math.cos(a)*q,cy+Math.sin(a)*q*(sy||1)])}return p};
 const blot=(x,cx,cy,r,c,a)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,ra(c,a));g.addColorStop(1,ra(c,0));x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2)};
 const mottle=(x,R,n,cols,r0,r1,a)=>{for(let i=0;i<n;i++)blot(x,R()*T,R()*T,r0+R()*(r1-r0),cols[R()*cols.length|0],a*(.45+R()*.55))};
 const speck=(x,R,n,c,a,s0,s1,y0,y1)=>{x.fillStyle=c;for(let i=0;i<n;i++){x.globalAlpha=a*(.35+R()*.65);const s=s0+R()*(s1-s0);x.beginPath();x.arc(R()*T,(y0||0)+R()*((y1||T)-(y0||0)),s,0,TAU);x.fill()}x.globalAlpha=1};
 const glint=(x,cx,cy,s,a)=>{x.save();x.globalAlpha=a==null?1:a;x.fillStyle='#ffffff';x.beginPath();x.moveTo(cx,cy-s);x.quadraticCurveTo(cx,cy,cx+s*.8,cy);x.quadraticCurveTo(cx,cy,cx,cy+s);x.quadraticCurveTo(cx,cy,cx-s*.8,cy);x.quadraticCurveTo(cx,cy,cx,cy-s);x.fill();x.beginPath();x.arc(cx,cy,s*.18,0,TAU);x.fill();x.restore()};
 const free=(pts,cx,cy,r)=>pts.every(([px,py,pr])=>Math.hypot(px-cx,py-cy)>pr+r+1.2);
 function spots(R,n,r0,r1,m){const out=[];for(let t=0;t<n*30&&out.length<n;t++){const r=out.length?r0+R()*(r1-r0)*.55:r1-R()*(r1-r0)*.25,cx=m+r+R()*(T-2*m-2*r),cy=m+r+R()*(T-2*m-2*r);if(free(out,cx,cy,r))out.push([cx,cy,r])}return out}
 // a crack network: polylines wandering in from the edges
 function cracks(R,n,len){const L=[];for(let i=0;i<n;i++){const e=R()*4|0;let px=e==0?R()*T:e==1?T:e==2?R()*T:0,py=e==0?0:e==1?R()*T:e==2?T:R()*T;const a0=Math.atan2(T/2-py,T/2-px)+(R()-.5)*1.2;const p=[[px,py]];
  let a=a0;for(let k=0;k<len;k++){a+=(R()-.5)*1.1;const s=4+R()*6;px+=Math.cos(a)*s;py+=Math.sin(a)*s;p.push([px,py])}L.push(p)}return L}
 const strokeLines=(x,L)=>{x.beginPath();for(const p of L){x.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)x.lineTo(p[i][0],p[i][1])}x.stroke()};
 // ---- materials
 // pebble: contact shadow, round body lit from the top-left, a soft shine
 function pebble(x,cx,cy,rx,ry,c,rot,sh){rot=rot||0;x.fillStyle='rgba(28,14,6,.42)';x.beginPath();x.ellipse(cx+.5,cy+1,rx*1.06,ry*1.08,rot,0,TAU);x.fill();
  const g=x.createRadialGradient(cx-rx*.38,cy-ry*.45,0,cx,cy,Math.max(rx,ry)*1.15);g.addColorStop(0,tn(c,1.3));g.addColorStop(.5,c);g.addColorStop(1,tn(c,.6));x.fillStyle=g;x.beginPath();x.ellipse(cx,cy,rx,ry,rot,0,TAU);x.fill();
  x.fillStyle='rgba(255,255,255,'+(sh==null?.5:sh)+')';x.beginPath();x.ellipse(cx-rx*.36,cy-ry*.44,rx*.34,ry*.2,-.5,0,TAU);x.fill()}
 // faceted gem seen from the front: an outer hexagon, a lighter table, six facets shaded by how they face the light
 const LX=-.62,LY=-.78;
 function gemHex(x,cx,cy,r,G,rot,sides){const n=sides||6,o=[],q=[];for(let i=0;i<n;i++){const a=rot+i*TAU/n;o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);q.push([cx+Math.cos(a)*r*.5-r*.06,cy+Math.sin(a)*r*.5-r*.08])}
  x.save();x.shadowColor=G.glow;x.shadowBlur=r*1.6*Q;poly(x,o);x.fillStyle=G.lo;x.fill();x.restore();
  x.fillStyle='rgba(0,0,0,.35)';poly(x,o.map(([a,b])=>[a+.5,b+.8]));x.globalCompositeOperation='destination-over';x.fill();x.globalCompositeOperation='source-over';
  for(let i=0;i<n;i++){const j=(i+1)%n,am=rot+(i+.5)*TAU/n,d=(Math.cos(am)*LX+Math.sin(am)*LY+1)/2;poly(x,[o[i],o[j],q[j],q[i]]);x.fillStyle=mx(G.lo,G.hi,Math.min(1,d*d*1.15));x.fill()}
  poly(x,q);x.fillStyle=lin(x,cx-r*.5,cy-r*.5,cx+r*.5,cy+r*.5,[G.hi,G.mid,tn(G.mid,.8)]);x.fill();
  x.strokeStyle=ra('#ffffff',.55);x.lineWidth=.35;poly(x,q);x.stroke();x.beginPath();for(let i=0;i<n;i++){x.moveTo(q[i][0],q[i][1]);x.lineTo(o[i][0],o[i][1])}x.strokeStyle=ra('#ffffff',.22);x.stroke();
  x.strokeStyle=ra(tn(G.lo,.45),.85);x.lineWidth=.55;poly(x,o);x.stroke();
  x.fillStyle='rgba(255,255,255,.75)';poly(x,[q[(n/2|0)+1]||q[0],q[(n/2|0)+2]||q[1],[cx-r*.05,cy-r*.12]]);x.globalAlpha=.55;x.fill();x.globalAlpha=1;
  glint(x,cx-r*.32,cy-r*.36,Math.max(1.2,r*.42),.95)}
 // long hexagonal crystal shard growing from (bx,by), tilted by ang
 function shard(x,bx,by,len,w,ang,G){x.save();x.translate(bx,by);x.rotate(ang);const tip=-len,sh=-len*.74;
  x.save();x.shadowColor=G.glow;x.shadowBlur=w*2.4*Q;poly(x,[[-w,1],[-w,sh],[0,tip],[w,sh],[w,1]]);x.fillStyle=G.lo;x.fill();x.restore();
  poly(x,[[-w,1],[-w,sh],[0,tip],[-w*.28,sh],[-w*.28,1]]);x.fillStyle=lin(x,-w,0,-w*.2,0,[G.hi,tn(G.mid,1.1)]);x.fill();
  poly(x,[[-w*.28,1],[-w*.28,sh],[0,tip],[w*.3,sh],[w*.3,1]]);x.fillStyle=lin(x,0,0,0,tip,[G.mid,tn(G.hi,1.1)]);x.fill();
  poly(x,[[w*.3,1],[w*.3,sh],[0,tip],[w,sh],[w,1]]);x.fillStyle=lin(x,0,0,w,0,[tn(G.mid,.8),G.lo]);x.fill();
  x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=.45;x.beginPath();x.moveTo(-w*.62,-1);x.lineTo(-w*.62,sh*.95);x.stroke();
  x.strokeStyle=ra(tn(G.lo,.45),.9);x.lineWidth=.55;poly(x,[[-w,1],[-w,sh],[0,tip],[w,sh],[w,1]]);x.stroke();
  glint(x,-w*.4,sh+1,Math.max(1.1,w*.7),.95);x.restore()}
 // metallic nugget: irregular lump, shaded from a pale highlight to a deep rim, with white glints
 function nugget(x,R,cx,cy,r,M){const p=blob(R,cx,cy,r,9,.45,.85);x.save();x.translate(.6,1.1);smooth(x,p);x.fillStyle='rgba(20,10,0,.5)';x.fill();x.restore();
  if(M.glow){x.save();x.shadowColor=M.glow;x.shadowBlur=r*1.5*Q;smooth(x,p);x.fillStyle=M.lo;x.fill();x.restore()}
  smooth(x,p);const g=x.createRadialGradient(cx-r*.35,cy-r*.4,0,cx,cy,r*1.2);g.addColorStop(0,M.hi);g.addColorStop(.45,M.mid);g.addColorStop(1,M.lo);x.fillStyle=g;x.fill();
  x.strokeStyle=M.dk;x.lineWidth=.6;x.stroke();
  x.fillStyle=ra(M.hi,.55);x.beginPath();x.moveTo(cx-r*.55,cy-r*.15);x.lineTo(cx-r*.15,cy-r*.6);x.lineTo(cx+r*.1,cy-r*.35);x.lineTo(cx-r*.3,cy+r*.05);x.closePath();x.fill();
  glint(x,cx-r*.3,cy-r*.38,Math.max(1.1,r*.55),.95);if(r>3)glint(x,cx+r*.35,cy+r*.2,r*.25,.6)}
 function vein(x,R,M,w){const p=[];let px=-2,py=8+R()*32,a=(R()-.5)*.8;p.push([px,py]);while(px<T+2){a+=(R()-.5)*.9;a=Math.max(-.9,Math.min(.9,a));px+=4+R()*4;py+=Math.sin(a)*5;p.push([px,py])}
  x.lineCap='round';x.lineJoin='round';const st=(c,lw,dx,dy)=>{x.strokeStyle=c;x.lineWidth=lw;x.beginPath();x.moveTo(p[0][0]+dx,p[0][1]+dy);for(const q of p)x.lineTo(q[0]+dx,q[1]+dy);x.stroke()};
  if(M.glow){x.save();x.shadowColor=M.glow;x.shadowBlur=w*2*Q;st(M.lo,w+1,0,0);x.restore()}st('rgba(20,10,0,.45)',w+1.4,.4,.9);st(M.dk,w+.9,0,0);st(M.lo,w,0,0);st(M.mid,w*.6,-.15,-.2);st(ra(M.hi,.9),w*.25,-.3,-.4);return p}
 // cobbles: irregular rounded stones with dark seams between them
 function cobbles(x,R,c,seam,o){o=o||{};x.fillStyle=seam;x.fillRect(0,0,T,T);const rows=o.rows||3,rh=T/rows,cols=o.cols||3,cw=T/cols;
  for(let r=-1;r<=rows;r++)for(let k=-1;k<=cols;k++){const cx=(k+.5)*cw+(r&1?cw/2:0)+(R()-.5)*cw*.25,cy=(r+.5)*rh+(R()-.5)*rh*.2,rx=cw*.5*(o.fill||.92),ry=rh*.5*(o.fill||.92),cc=tn(c,.86+R()*.3);
   const p=blob(R,0,0,1,10,.22).map(([a,b])=>[cx+a*rx,cy+b*ry]);x.save();x.translate(.5,.9);smooth(x,p);x.fillStyle='rgba(0,0,0,.35)';x.fill();x.restore();
   smooth(x,p);const g=x.createRadialGradient(cx-rx*.4,cy-ry*.5,0,cx,cy,Math.max(rx,ry)*1.25);g.addColorStop(0,tn(cc,1.3));g.addColorStop(.55,cc);g.addColorStop(1,tn(cc,.68));x.fillStyle=g;x.fill();
   x.save();smooth(x,p);x.clip();for(let i=0;i<3;i++)blot(x,cx+(R()-.5)*rx,cy+(R()-.5)*ry,2+R()*4,R()<.5?'#ffffff':'#000000',.07);x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=.7;x.beginPath();x.ellipse(cx,cy,rx*.84,ry*.8,0,Math.PI*1.08,Math.PI*1.62);x.stroke();x.restore()}}
 // velvety moss: soft clumps, then hundreds of tiny strands in a few greens (batched into one path per colour)
 function moss(x,R,o,y0,y1){const base=o.base;y0=y0||0;y1=y1||T;x.fillStyle=lin(x,0,y0,0,y1,[tn(base,1.12),base,tn(base,.82)]);x.fillRect(0,y0,T,y1-y0);
  for(let i=0;i<18;i++){const cx=R()*T,cy=y0+R()*(y1-y0),r=3.5+R()*5;blot(x,cx+r*.5,cy+r*.6,r*1.1,o.lo,.45);blot(x,cx-r*.25,cy-r*.3,r,o.hi,.38)}
  const cols=[[o.lo,.6],[tn(base,.9),.75],[tn(base,1.2),.75],[o.hi,.8],[tn(o.hi,1.3),.7]];x.lineCap='round';const n=Math.round((y1-y0)*T*.24);
  for(const[c,a]of cols){x.strokeStyle=ra(c,a);x.lineWidth=.55;x.beginPath();for(let i=0;i<n/cols.length;i++){const px=R()*T,py=y0+.5+R()*(y1-y0-.5),l=1.1+R()*1.7,an=-Math.PI/2+(R()-.5)*1.9;x.moveTo(px,py);x.lineTo(px+Math.cos(an)*l,py+Math.sin(an)*l)}x.stroke()}
  x.fillStyle=ra(tn(o.hi,1.4),.8);for(let i=0;i<26;i++){x.beginPath();x.arc(R()*T,y0+R()*(y1-y0),.35+R()*.3,0,TAU);x.fill()}
  x.save();x.globalCompositeOperation='lighter';blot(x,T*.35,y0+(y1-y0)*.35,(y1-y0)*.8,o.hi,.14);x.restore()}
 function leaves(x,R,o){moss(x,R,o);for(let i=0;i<34;i++){const cx=R()*T,cy=R()*T,a=R()*TAU,c=R()<.5?o.lo:tn(o.base,1.2);x.save();x.translate(cx,cy);x.rotate(a);x.fillStyle=ra(c,.85);x.beginPath();x.ellipse(0,0,3.2,1.5,0,0,TAU);x.fill();x.strokeStyle=ra(tn(c,.7),.6);x.lineWidth=.35;x.beginPath();x.moveTo(-2.8,0);x.lineTo(2.8,0);x.stroke();x.fillStyle=ra('#ffffff',.25);x.beginPath();x.ellipse(-.6,-.6,1.4,.5,0,0,TAU);x.fill();x.restore()}}
 // planks: vertical (or, rotated, horizontal) boards with grain, knots and dark seams
 function planks(x,R,o){x.save();if(o.horiz){x.translate(T,0);x.rotate(Math.PI/2)}const n=o.n||3,w=T/n;
  for(let i=0;i<n;i++){const px=i*w,c=tn(o.base,.9+R()*.18);x.fillStyle=lin(x,px,0,px+w,0,[tn(c,1.1),c,tn(c,.86)]);x.fillRect(px,0,w,T);
   x.save();x.beginPath();x.rect(px,0,w,T);x.clip();mottle(x,R,4,[tn(c,1.15),tn(c,.85)],5,10,.25);
   const kn=R()<.6?[px+w*(.3+R()*.4),6+R()*36]:null;
   for(let k=0;k<8;k++){const gx=px+1.2+k*(w-2.4)/7+(R()-.5)*1.2;x.strokeStyle=ra(R()<.75?tn(c,.62):tn(c,1.18),.25+R()*.3);x.lineWidth=.35+R()*.45;x.beginPath();x.moveTo(gx,0);
    let yy=0;while(yy<T){const ny=yy+8+R()*8;let bx=(R()-.5)*1.3;if(kn&&Math.abs(ny-kn[1])<7&&Math.abs(gx-kn[0])<5)bx+=(gx<kn[0]?-1:1)*(5-Math.abs(gx-kn[0]))*.8;x.quadraticCurveTo(gx+bx,(yy+ny)/2,gx+bx*.4,ny);yy=ny}x.stroke()}
   if(kn){const[kx,ky]=kn;for(let k=3;k>=0;k--){x.strokeStyle=ra(tn(c,.55),.35+k*.06);x.lineWidth=.5;x.beginPath();x.ellipse(kx,ky,1+k*1.1,1.6+k*1.9,0,0,TAU);x.stroke()}x.fillStyle=ra(tn(c,.45),.8);x.beginPath();x.ellipse(kx,ky,.9,1.5,0,0,TAU);x.fill();blot(x,kx-1,ky-2,3,'#ffffff',.18)}
   if(R()<.45){const jy=6+R()*36;x.fillStyle=ra(tn(c,.4),.8);x.fillRect(px,jy-.5,w,1);x.fillStyle='rgba(255,255,255,.3)';x.fillRect(px,jy+.6,w,.7);x.fillStyle='rgba(0,0,0,.12)';x.fillRect(px,jy-3,w,2.5)}
   x.restore();
   x.fillStyle='rgba(255,255,255,.3)';x.fillRect(px+.9,0,.8,T);x.fillStyle='rgba(0,0,0,.16)';x.fillRect(px+w-2.2,0,1.4,T);if(i>0){x.fillStyle=ra(tn(o.base,.32),.9);x.fillRect(px-.7,0,1.4,T)}}
  x.restore()}
 function sand(x,R,c){x.fillStyle=lin(x,0,0,T,T,[tn(c,1.1),c,tn(c,.9)]);x.fillRect(0,0,T,T);mottle(x,R,7,[tn(c,1.12),mx(c,'#e0b070',.4)],8,16,.35);
  for(let i=0;i<5;i++){const y=4+i*9.5+(R()-.5)*3,ph=R()*TAU,am=1.6+R()*1.4,fr=.1+R()*.06,x0=-4+R()*6;const path=dy=>{x.beginPath();for(let px=x0;px<=T+4;px+=2){const py=y+dy+Math.sin(px*fr+ph)*am;px==x0?x.moveTo(px,py):x.lineTo(px,py)}};
   x.lineCap='round';path(1.5);x.strokeStyle=ra(tn(c,.78),.28);x.lineWidth=1.3;x.stroke();path(0);x.strokeStyle=ra(tn(c,1.25),.55);x.lineWidth=1.6;x.stroke()}
  speck(x,R,40,tn(c,.7),.25,.25,.5);speck(x,R,24,'#ffffff',.4,.2,.45)}
 function pearl(x,R,o){const c=o.base;x.fillStyle=lin(x,0,0,T,T,[tn(c,1.15),c,tn(c,.9)]);x.fillRect(0,0,T,T);
  // iridescent sheen: broad pastel pools of pink, blue and lavender, deeper towards the shaded corner
  for(let i=0;i<11;i++)blot(x,R()*T,R()*T,9+R()*12,o.tints[i%o.tints.length],.8);
  blot(x,T*.9,T*.92,28,tn(o.tints[2],.8),.5);blot(x,T*.1,T*.1,16,'#ffffff',.55);
  x.fillStyle=lin(x,0,T*.1,T,T*.9,['rgba(255,255,255,0)','rgba(255,255,255,0)','rgba(255,255,255,.38)','rgba(255,255,255,0)','rgba(255,255,255,0)']);x.fillRect(0,0,T,T);
  const L=cracks(R,o.cracks||2,4);x.lineCap='round';x.lineJoin='round';x.strokeStyle=ra(o.crack,.26);x.lineWidth=2.4;strokeLines(x,L);x.strokeStyle=ra(o.crack,.42);x.lineWidth=.7;strokeLines(x,L);
  x.save();x.translate(.7,.7);x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=.55;strokeLines(x,L);x.restore();speck(x,R,10,'#ffffff',.7,.25,.6)}
 function stone(x,R,o){const c=o.base;x.fillStyle=lin(x,0,0,T,T,[tn(c,1.12),c,tn(c,.86)]);x.fillRect(0,0,T,T);mottle(x,R,o.mot||10,[tn(c,1.2),tn(c,.8),o.tint||c],6,15,.32);speck(x,R,o.fl||22,tn(c,.62),.22,.25,.7);speck(x,R,12,'#ffffff',.18,.25,.6);
  const L=cracks(R,o.cr==null?(R()<.6?2:1):o.cr,3);x.lineCap='round';x.lineJoin='round';x.strokeStyle=ra(tn(c,.45),.5);x.lineWidth=.55;strokeLines(x,L);x.save();x.translate(.55,.6);x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=.45;strokeLines(x,L);x.restore()}
 function strata(x,R,o){const c=o.base;x.fillStyle=lin(x,0,0,T,T,[tn(c,1.15),c,tn(c,.85)]);x.fillRect(0,0,T,T);let y=-2;while(y<T){const h=5+R()*8,cc=tn(c,.88+R()*.24),ph=R()*TAU;x.fillStyle=ra(cc,.7);x.beginPath();x.moveTo(0,y);for(let px=0;px<=T;px+=4)x.lineTo(px,y+Math.sin(px*.12+ph)*1.2);x.lineTo(T,y+h);for(let px=T;px>=0;px-=4)x.lineTo(px,y+h+Math.sin(px*.12+ph+1)*1.2);x.closePath();x.fill();
   if(R()<.6){x.strokeStyle=ra(tn(c,.55),.45);x.lineWidth=.5;x.beginPath();for(let px=0;px<=T;px+=4)px?x.lineTo(px,y+h+Math.sin(px*.12+ph+1)*1.2):x.moveTo(px,y+h+Math.sin(ph+1)*1.2);x.stroke();x.strokeStyle='rgba(255,255,255,.12)';x.beginPath();for(let px=0;px<=T;px+=4)px?x.lineTo(px,y+h+.7+Math.sin(px*.12+ph+1)*1.2):x.moveTo(px,y+h+.7+Math.sin(ph+1)*1.2);x.stroke()}y+=h}
  mottle(x,R,6,[tn(c,1.25),tn(c,.75)],6,13,.25);speck(x,R,16,tn(c,1.5),.25,.2,.5);speck(x,R,12,tn(c,.5),.3,.25,.6)}
 function columns(x,R,o){const c=o.base,n=3,w=T/n;for(let i=0;i<n;i++){const px=i*w,cc=tn(c,.9+R()*.2);x.fillStyle=lin(x,px,0,px+w,0,[tn(cc,1.3),cc,tn(cc,.7)]);rrect(x,px+.6,-3,w-1.2,T+6,3);x.fill();
   x.save();rrect(x,px+.6,-3,w-1.2,T+6,3);x.clip();mottle(x,R,3,[tn(cc,1.2),tn(cc,.8)],4,8,.3);const cy=8+R()*32;x.strokeStyle=ra(tn(cc,.45),.7);x.lineWidth=.6;x.beginPath();x.moveTo(px,cy);x.lineTo(px+w*.5,cy+(R()-.5)*3);x.lineTo(px+w,cy+(R()-.5)*3);x.stroke();x.strokeStyle='rgba(255,255,255,.2)';x.beginPath();x.moveTo(px,cy+.7);x.lineTo(px+w,cy+.7);x.stroke();x.restore()}}
 function hexcells(x,R,o){const c=o.base;x.fillStyle=tn(c,.45);x.fillRect(0,0,T,T);const r=9.6;for(let row=-1;row<4;row++)for(let k=-1;k<4;k++){const cx=k*r*1.732+(row&1?r*.866:0)+4,cy=row*r*1.5+6,cc=tn(c,.88+R()*.25),p=[];for(let i=0;i<6;i++){const a=Math.PI/6+i*Math.PI/3;p.push([cx+Math.cos(a)*(r-1),cy+Math.sin(a)*(r-1)])}
   poly(x,p);x.fillStyle=lin(x,cx-r,cy-r,cx+r,cy+r,[tn(cc,1.35),cc,tn(cc,.7)]);x.fill();const q=p.map(([a,b])=>[cx+(a-cx)*.72,cy+(b-cy)*.72]);poly(x,q);x.fillStyle=lin(x,cx-r,cy-r,cx+r,cy+r,[tn(cc,1.12),tn(cc,.92)]);x.fill();x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=.5;x.stroke()}}
 function bricks(x,R,o){x.fillStyle=o.mortar;x.fillRect(0,0,T,T);const rh=o.rh||12,bw=o.bw||24;for(let r=0;r*rh<T;r++)for(let k=-1;k*bw<T+bw;k++){const px=k*bw+(r&1?bw/2:0),py=r*rh,c=tn(o.base,.86+R()*.26);
   x.fillStyle='rgba(0,0,0,.3)';rrect(x,px+1.3,py+1.7,bw-2.2,rh-2.2,2.6);x.fill();x.fillStyle=lin(x,0,py,0,py+rh,[tn(c,1.22),c,tn(c,.78)]);rrect(x,px+1,py+1,bw-2.2,rh-2.4,2.6);x.fill();
   x.save();rrect(x,px+1,py+1,bw-2.2,rh-2.4,2.6);x.clip();mottle(x,R,3,[tn(c,1.2),tn(c,.78)],3,7,.35);speck(x,R,5,tn(c,.6),.4,.25,.6,py,py+rh);x.restore();
   x.fillStyle='rgba(255,255,255,.3)';x.fillRect(px+3,py+1.6,bw-6.5,.8)}
  if(o.moss)for(let i=0;i<4;i++){const cx=R()*T,cy=(R()*4|0)*rh+R()*3;for(let j=0;j<7;j++){x.fillStyle=ra(j&1?'#6fbf4a':'#4c9a3a',.85);x.beginPath();x.arc(cx+(R()-.5)*9,cy+R()*3.5,1.2+R()*2.2,0,TAU);x.fill()}}}
 function slabs(x,R,o){x.fillStyle=tn(o.base,.5);x.fillRect(0,0,T,T);for(const[ox,oy]of[[0,0],[24,0],[0,24],[24,24]]){const c=tn(o.base,.9+R()*.2);x.fillStyle=lin(x,ox,oy,ox+24,oy+24,[tn(c,1.3),c,tn(c,.75)]);rrect(x,ox+1,oy+1,22,22,3);x.fill();
   x.fillStyle=lin(x,ox,oy,ox+24,oy+24,[tn(c,1.1),tn(c,.95)]);rrect(x,ox+3,oy+3,18,18,2);x.fill();x.save();rrect(x,ox+3,oy+3,18,18,2);x.clip();mottle(x,R,3,[tn(c,1.2),tn(c,.8)],3,7,.3);x.restore()}}
 // dirt body: darker moist top with small pebbles and glowing teal roots, a lighter lower part packed with round pebbles
 function dirt(x,R,o,top){const c=o.base;top=top||0;const split=top+(T-top)*.46;
  x.fillStyle=lin(x,0,top,0,T,[tn(c,.6),tn(c,.68),tn(c,.8),tn(c,1.04),tn(c,1.14)]);x.fillRect(0,top,T,T-top);
  // the moist upper soil: dark blotches with a soft, ragged edge into the lighter packed soil below
  for(let i=0;i<10;i++)blot(x,R()*T,top+R()*(split-top),4+R()*6,tn(c,.5),.4);for(let i=0;i<9;i++)blot(x,R()*T,split+(R()-.5)*7,3+R()*5,tn(c,.62),.35);
  for(let i=0;i<8;i++)blot(x,R()*T,split+R()*(T-split),4+R()*7,tn(c,1.25),.3);
  speck(x,R,46,tn(c,.45),.5,.25,.7,top,T);speck(x,R,26,tn(c,1.4),.35,.2,.5,split,T);
  for(let i=0;i<(o.small==null?6:o.small);i++){const r=.75+R()*1.1;pebble(x,2+R()*(T-4),top+2+R()*(split-top-1),r*1.2,r*.9,mx('#8e8d8a',c,.2*R()),R()*.6,.35)}
  const nr=o.roots==null?1+(R()<.35?1:0):o.roots;if(nr)roots(x,R,top+2,split+2,nr);
  // the lower soil, packed with round grey-brown pebbles of many sizes (big ones first so the small ones tuck in between)
  const P=[];for(let t=0;t<260&&P.length<(o.peb||17);t++){const r=P.length<4?3+R()*1.8:1.2+R()*2.2,cx=r+R()*(T-2*r),cy=split+r*.5+R()*(T-split-r*.9);if(free(P,cx,cy,r*.8-.8))P.push([cx,cy,r])}
  for(const[cx,cy,r]of P.sort((a,b)=>a[1]-b[1]))pebble(x,cx,cy,r*1.1,r*.86,mx(['#9b8e7e','#8a7f70','#a69a88','#7d7265','#b3a793','#94877a'][R()*6|0],c,.22),(R()-.5)*.7,.38)}
 function roots(x,R,y0,y1,n){x.lineCap='round';x.lineJoin='round';for(let i=0;i<n;i++){const p=[];let px=R()<.5?-2:T*R(),py=y0+R()*(y1-y0),a=(px<0?0:Math.PI/2*(R()<.5?1:-1)*.4)+(R()-.5)*.8;for(let k=0;k<8;k++){p.push([px,py]);a+=(R()-.5)*1.2;px+=Math.cos(a)*5.5;py+=Math.sin(a)*3.5;py=Math.max(y0,Math.min(y1,py))}
   const path=()=>{x.beginPath();x.moveTo(p[0][0],p[0][1]);for(let k=1;k<p.length-1;k++){x.quadraticCurveTo(p[k][0],p[k][1],(p[k][0]+p[k+1][0])/2,(p[k][1]+p[k+1][1])/2)}};
   x.save();x.shadowColor='rgba(70,255,210,.95)';x.shadowBlur=3.2*Q;path();x.strokeStyle='rgba(40,170,150,.75)';x.lineWidth=1.25;x.stroke();x.restore();path();x.strokeStyle='#7ff7dc';x.lineWidth=.6;x.stroke();
   const b=p[3+(R()*3|0)];x.beginPath();x.moveTo(b[0],b[1]);x.quadraticCurveTo(b[0]+3,b[1]+3,b[0]+4+R()*3,b[1]+5+R()*3);x.strokeStyle='rgba(127,247,220,.8)';x.lineWidth=.45;x.save();x.shadowColor='rgba(70,255,210,.9)';x.shadowBlur=2*Q;x.stroke();x.restore()}}
 // ores
 function gemRock(x,R,o){const c=o.rock;x.fillStyle=lin(x,0,0,T,T,[tn(c,1.4),c,tn(c,.6)]);x.fillRect(0,0,T,T);mottle(x,R,9,[tn(c,1.45),tn(c,.6)],5,12,.4);
  // rock facets: a few angular plates, lit on their upper-left side
  for(let i=0;i<5;i++){const cx=R()*T,cy=R()*T,p=blob(R,cx,cy,6+R()*6,5,.6);poly(x,p);x.fillStyle=ra(tn(c,R()<.5?1.3:.75),.35);x.fill();x.strokeStyle=ra(tn(c,1.7),.18);x.lineWidth=.5;x.stroke()}
  const L=cracks(R,o.ncr||4,4);x.lineCap='round';x.lineJoin='round';x.strokeStyle='rgba(0,0,0,.55)';x.lineWidth=1.3;strokeLines(x,L);
  if(o.crack){x.save();x.shadowColor=o.crack;x.shadowBlur=3*Q;x.strokeStyle=ra(o.crack,.9);x.lineWidth=.6;strokeLines(x,L);x.restore();x.strokeStyle=ra(tn(o.crack,1.5),.9);x.lineWidth=.3;strokeLines(x,L)}
  else{x.save();x.translate(.5,.6);x.strokeStyle=ra(tn(c,1.8),.2);x.lineWidth=.45;strokeLines(x,L);x.restore()}
  speck(x,R,14,tn(c,1.8),.25,.2,.5);
  const G=o.gem;if(o.style=='shard'){const S=spots(R,3,4,8.5,4);// clusters of shards plus chips
    S.forEach(([cx,cy,r],i)=>{const k=i==0?3:2;for(let j=0;j<k;j++){const a=(j-(k-1)/2)*.55+(R()-.5)*.3+(i&1?.35:-.2);shard(x,cx+(j-(k-1)/2)*r*.35,cy+r*.75,r*(j==(k>>1)?2.1:1.5),r*.36,a,G)}});
    for(let i=0;i<4;i++){const cx=4+R()*40,cy=4+R()*40;if(free(S,cx,cy,2))gemHex(x,cx,cy,1.4+R()*1.2,G,R()*TAU,R()<.5?4:6)}}
  else{const S=spots(R,o.n==null?5:o.n,2.2,o.big||9.5,4);S.forEach(([cx,cy,r])=>gemHex(x,cx,cy,r,G,R()*.5,o.sides||6))}}
 function metalOre(x,R,o){if(o.cob)cobbles(x,R,o.rock,tn(o.rock,.42));else stone(x,R,{base:o.rock,cr:1,mot:8});const M=o.metal;
  for(let i=0;i<(o.veins==null?1:o.veins);i++){const p=vein(x,R,M,1.3+R()*.8);for(let k=1;k<p.length-1;k+=2+(R()*2|0))if(R()<.5)nugget(x,R,p[k][0],p[k][1],1.6+R()*1.4,M)}
  const S=spots(R,o.n||4,2,o.big||6,5);S.forEach(([cx,cy,r])=>nugget(x,R,cx,cy,r,M))}
 // ---- palettes
 const GEM={sap:{hi:'#c9e6ff',mid:'#3f8cff',lo:'#0f2f8f',glow:'rgba(80,190,255,.85)'},cry:{hi:'#e6fdff',mid:'#5fdcff',lo:'#0e6f9a',glow:'rgba(110,235,255,.85)'},
  emr:{hi:'#c8ffd9',mid:'#21d873',lo:'#06603a',glow:'rgba(60,255,150,.8)'},rub:{hi:'#ffd0d8',mid:'#ff2f55',lo:'#7a0620',glow:'rgba(255,70,100,.8)'},
  dia:{hi:'#ffffff',mid:'#c9f7ff',lo:'#5f9fb8',glow:'rgba(200,250,255,.9)'},moon:{hi:'#f2f0ff',mid:'#a9b8ff',lo:'#4b4fa8',glow:'rgba(170,185,255,.85)'},
  voi:{hi:'#f0dcff',mid:'#a86bff',lo:'#3e1580',glow:'rgba(170,110,255,.9)'},geo:{hi:'#ffe6ff',mid:'#c48cff',lo:'#5a2a9a',glow:'rgba(220,150,255,.9)'}};
 const MET={gold:{hi:'#fff8c8',mid:'#ffc928',lo:'#c26a0c',dk:'#6e3604'},copper:{hi:'#ffe0c4',mid:'#e8874a',lo:'#93421a',dk:'#4f200a'},
  iron:{hi:'#ffffff',mid:'#d9cbbd',lo:'#8a7a6c',dk:'#4a3f36'},amber:{hi:'#fff1b8',mid:'#f2a52a',lo:'#a2520a',dk:'#5a2a04',glow:'rgba(255,170,60,.55)'},
  lava:{hi:'#fff6c0',mid:'#ffa030',lo:'#e0420e',dk:'#5a1404',glow:'rgba(255,110,30,.95)'}};
 const MOSS={base:'#56bf3c',hi:'#b4f27c',lo:'#2a7a26'},DIRT={base:'#8e5c34'};
 // ---- every covered block: [family, painter, base colour (for the groove and bevel), bevel strength]
 const D={
  1:{base:'#8e5c34',k:.9,p:(x,R,v)=>dirt(x,R,{base:DIRT.base,roots:v==0?1:0})},
  2:{base:'#6c8a3a',k:.9,p:(x,R,v)=>grassTop(x,R,MOSS,DIRT.base,v)},
  43:{base:'#6e4a30',k:.9,p:(x,R)=>dirt(x,R,{base:'#6e4a30',peb:10,small:7,roots:2})},
  42:{base:'#4fae3a',k:.85,p:(x,R)=>moss(x,R,MOSS)},
  15:{base:'#3f8f4a',k:.85,p:(x,R)=>leaves(x,R,{base:'#3f9448',hi:'#9fe07a',lo:'#1f5a2a'})},
  3:{base:'#a2a7ae',k:1.25,p:(x,R)=>stone(x,R,{base:'#a2a7ae',tint:'#b8b2a6',mot:14})},
  55:{base:'#9aa6ae',k:1.2,p:(x,R)=>cobbles(x,R,'#a5b0b8','#59636b',{rows:2,cols:2,fill:.96})},
  11:{base:'#8f939a',k:1.1,p:(x,R)=>cobbles(x,R,'#959aa2',tn('#959aa2',.42))},
  57:{base:'#7d8f78',k:1.1,p:(x,R)=>{cobbles(x,R,'#8e968e',tn('#8e968e',.42));mossPatches(x,R)}},
  77:{base:'#4c5366',k:1.05,p:(x,R)=>strata(x,R,{base:'#4c5366'})},
  78:{base:'#45444f',k:1.05,p:(x,R)=>columns(x,R,{base:'#4a4955'})},
  54:{base:'#3f4452',k:1.05,p:(x,R)=>hexcells(x,R,{base:'#4a5060'})},
  4:{base:'#2c2d36',k:.9,p:(x,R)=>cobbles(x,R,'#3a3b46','#15151b',{rows:3,cols:3})},
  7:{base:'#b5523b',k:1,p:(x,R)=>bricks(x,R,{base:'#c05a3f',mortar:'#d9c7b0'})},
  100:{base:'#b5523b',k:1,p:(x,R)=>bricks(x,R,{base:'#b5523b',mortar:'#6e4234'})},
  102:{base:'#8a9190',k:1,p:(x,R)=>bricks(x,R,{base:'#949b99',mortar:'#50564f',rh:16,moss:1})},
  44:{base:'#5d6a82',k:1.1,p:(x,R)=>slabs(x,R,{base:'#6a7891'})},
  5:{base:'#d9b47c',k:1,p:(x,R)=>planks(x,R,{base:'#dcb985'})},
  50:{base:'#e6a3b0',k:1,p:(x,R)=>planks(x,R,{base:'#eaaab6'})},
  103:{base:'#b07a45',k:1,p:(x,R)=>planks(x,R,{base:'#c08a52',horiz:1,n:4})},
  8:{base:'#ecdaa8',k:.8,p:(x,R)=>sand(x,R,'#efdcac')},
  45:{base:'#d9b982',k:.95,p:(x,R)=>bricks(x,R,{base:'#e0c48e',mortar:'#a8895a',rh:16})},
  10:{base:'#8d9097',k:1.05,p:(x,R)=>metalOre(x,R,{rock:'#8d9198',cob:1,metal:MET.gold,n:4,big:6.5})},
  71:{base:'#7f8389',k:1.05,p:(x,R)=>metalOre(x,R,{rock:'#868a90',cob:1,metal:MET.copper,n:4})},
  72:{base:'#7c7f86',k:1.05,p:(x,R)=>metalOre(x,R,{rock:'#80838a',metal:MET.iron,n:5,big:5})},
  61:{base:'#6e5f52',k:1,p:(x,R)=>metalOre(x,R,{rock:'#77695c',metal:MET.amber,n:3,big:7.5,veins:0})},
  62:{base:'#3a2a26',k:1,p:(x,R)=>{gemRock(x,R,{rock:'#3a2c28',crack:'#ff7a2a',ncr:5,gem:GEM.rub,n:0});for(let i=0;i<2;i++)vein(x,R,MET.lava,1.6);spots(R,3,1.6,3.5,6).forEach(([cx,cy,r])=>nugget(x,R,cx,cy,r,MET.lava))}},
  79:{base:'#3a221c',k:1,p:(x,R)=>{gemRock(x,R,{rock:'#33201c',crack:'#ff6a20',ncr:6,gem:GEM.rub,n:0});vein(x,R,MET.lava,2);spots(R,2,1.6,3,6).forEach(([cx,cy,r])=>nugget(x,R,cx,cy,r,MET.lava))}},
  9:{base:'#1f2c48',k:1,p:(x,R)=>gemRock(x,R,{rock:'#1d2a46',crack:'#6fe6ff',gem:GEM.cry})},
  74:{base:'#18203a',k:1,p:(x,R)=>gemRock(x,R,{rock:'#172038',crack:'#4fc8ff',gem:GEM.sap,big:11})},
  75:{base:'#33373c',k:1,p:(x,R)=>gemRock(x,R,{rock:'#34383e',gem:GEM.emr,style:'shard'})},
  73:{base:'#3a3034',k:1,p:(x,R)=>gemRock(x,R,{rock:'#3b3035',gem:GEM.rub,big:7.5})},
  76:{base:'#3d4552',k:1,p:(x,R)=>gemRock(x,R,{rock:'#3e4654',crack:'#bff6ff',gem:GEM.dia,style:'shard'})},
  60:{base:'#3a4260',k:1,p:(x,R)=>gemRock(x,R,{rock:'#3a4262',gem:GEM.moon,n:4,big:7,sides:8})},
  65:{base:'#1f1530',k:1,p:(x,R)=>gemRock(x,R,{rock:'#1f1632',crack:'#b07aff',gem:GEM.voi,style:'shard'})},
  94:{base:'#2b2440',k:1,p:(x,R)=>gemRock(x,R,{rock:'#2c2542',crack:'#e0a0ff',gem:GEM.geo,n:6,big:7})},
  12:{base:'#ece6ee',k:1,groove:.62,p:(x,R)=>pearl(x,R,{base:'#eee8f0',tints:['#ffb8d8','#b0d8ff','#cbb8ff','#ffd8ec','#b8f0ec'],crack:'#9a88b8'})},
  68:{base:'#e4dcf4',k:1,groove:.6,p:(x,R)=>{pearl(x,R,{base:'#ebe4f8',tints:['#d9b8ff','#ffc4ea','#b8d4ff'],crack:'#8a78c0',cracks:1});for(let i=0;i<4;i++)glint(x,4+R()*40,4+R()*40,1.2+R()*1.6,.9)}},
  112:{base:'#e9e4ec',k:1,groove:.62,p:(x,R)=>{pearl(x,R,{base:'#f1ecf3',tints:['#ffc8e0','#c4e4ff','#dccbff'],crack:'#9a88b8',cracks:1});x.strokeStyle='rgba(120,105,150,.4)';x.lineWidth=1;x.beginPath();x.moveTo(24,0);x.lineTo(24,T);x.moveTo(0,24);x.lineTo(T,24);x.stroke();x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=.6;x.beginPath();x.moveTo(25,0);x.lineTo(25,T);x.moveTo(0,25);x.lineTo(T,25);x.stroke()}}};
 function grassTop(x,R,M,dc,v){dirt(x,R,{base:dc,peb:9,small:3,roots:v==1?1:0},14);
  // moss cap with a soft lumpy lower edge and a shadow on the soil under it
  const edge=[];for(let px=-2;px<=T+2;px+=3)edge.push([px,14+Math.sin(px*.45+v*2)*1.4+R()*2.4]);
  x.save();x.beginPath();x.moveTo(-2,0);for(const[a,b]of edge)x.lineTo(a,b+2.4);x.lineTo(T+2,0);x.closePath();x.fillStyle='rgba(20,12,4,.45)';x.filter='blur(1.2px)';x.fill();x.filter='none';x.restore();
  x.save();x.beginPath();x.moveTo(-2,0);for(let i=0;i<edge.length;i++){const[a,b]=edge[i];x.lineTo(a,b)}x.lineTo(T+2,0);x.closePath();x.clip();moss(x,R,M,0,20);x.restore();
  x.lineCap='round';x.strokeStyle=ra(M.lo,.8);x.lineWidth=.5;x.beginPath();for(const[a,b]of edge){for(let k=0;k<2;k++){const px=a+R()*3;x.moveTo(px,b-1);x.lineTo(px+(R()-.5)*1.2,b+.8+R()*1.6)}}x.stroke();
  x.strokeStyle=ra(M.base,.9);x.beginPath();for(const[a,b]of edge){const px=a+R()*3;x.moveTo(px,b-1.5);x.lineTo(px+(R()-.5),b+.5+R()*1.2)}x.stroke()}
 function mossPatches(x,R){for(let i=0;i<3;i++){const cx=R()*T,cy=R()<.6?R()*14:R()*T,p=blob(R,cx,cy,5+R()*4,8,.5,.7);x.save();smooth(x,p);x.fillStyle='rgba(0,0,0,.3)';x.translate(.4,.9);x.fill();x.restore();x.save();smooth(x,p);x.clip();moss(x,R,{base:'#5aa83e',hi:'#a6e07a',lo:'#2c6a26'},Math.max(0,cy-10),Math.min(T,cy+10));x.restore()}}
 // ---- bevel: soft top-left light, rounded chunky edges, gentle occlusion in the groove between blocks
 function light(x){x.fillStyle=lin(x,0,0,T,T,['rgba(255,250,240,.14)','rgba(255,255,255,0)','rgba(255,255,255,0)','rgba(20,10,40,.2)']);x.fillRect(0,0,T,T)}
 function bevel(x,k){const a=(s)=>s*k;x.save();rrect(x,.5,.5,T-1,T-1,RAD);x.clip();
  let g=lin(x,0,0,0,7,['rgba(255,255,255,'+a(.4)+')','rgba(255,255,255,'+a(.12)+')','rgba(255,255,255,0)']);x.fillStyle=g;x.fillRect(0,0,T,7);
  g=lin(x,0,0,6,0,['rgba(255,255,255,'+a(.28)+')','rgba(255,255,255,0)']);x.fillStyle=g;x.fillRect(0,0,6,T);
  g=lin(x,0,T,0,T-8,['rgba(16,8,24,'+a(.42)+')','rgba(16,8,24,'+a(.12)+')','rgba(16,8,24,0)']);x.fillStyle=g;x.fillRect(0,T-8,T,8);
  g=lin(x,T,0,T-7,0,['rgba(16,8,24,'+a(.32)+')','rgba(16,8,24,0)']);x.fillStyle=g;x.fillRect(T-7,0,7,T);
  // crisp rims: light on the upper-left half, dark on the lower-right half
  x.lineWidth=1.1;x.save();x.beginPath();x.moveTo(0,0);x.lineTo(T,0);x.lineTo(0,T);x.closePath();x.clip();rrect(x,1.6,1.6,T-3.2,T-3.2,RAD-1);x.strokeStyle='rgba(255,255,255,'+a(.5)+')';x.stroke();x.restore();
  x.save();x.beginPath();x.moveTo(T,0);x.lineTo(T,T);x.lineTo(0,T);x.closePath();x.clip();rrect(x,1.6,1.6,T-3.2,T-3.2,RAD-1);x.strokeStyle='rgba(10,5,20,'+a(.3)+')';x.stroke();x.restore();
  x.restore();rrect(x,.5,.5,T-1,T-1,RAD);x.strokeStyle='rgba(8,4,14,.38)';x.lineWidth=1;x.stroke()}
 // ---- render: one shared 2x scratch canvas, filtered down into the T x T sprite
 let big=null;const errs=[];
 function render(b,v){const d=D[b];if(!big){big=document.createElement('canvas');big.width=big.height=T*Q}const x=big.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,T*Q,T*Q);x.setTransform(Q,0,0,Q,0,0);
  x.globalAlpha=1;x.globalCompositeOperation='source-over';x.shadowBlur=0;x.filter='none';
  x.fillStyle=tn(d.base,d.groove||.42);x.fillRect(0,0,T,T);// corner pockets: the occlusion where four blocks meet
  const R=rr((b*7919+v*104729+12345)>>>0);x.save();rrect(x,.5,.5,T-1,T-1,RAD);x.clip();try{d.p(x,R,v)}catch(e){errs.push(b+':'+(e&&e.message));console.error('BART9',b,e)}light(x);x.restore();bevel(x,d.k||1);
  const c=document.createElement('canvas');c.width=c.height=T;const y=c.getContext('2d');y.imageSmoothingEnabled=true;y.imageSmoothingQuality='high';y.drawImage(big,0,0,T,T);c.bart9=1;return c}
 const IDS=Object.keys(D).map(Number);
 {const _bs=blockSprite;blockSprite=function(b,v){if(D[b])return render(b,v);return _bs.apply(this,arguments)}}
 // sprites or icons cached before this file loaded (the hotbar draws during start-up) are dropped so they repaint in the new style
 try{for(const b of IDS)for(let v=0;v<4;v++)delete SPR[b*4+v];for(const b of IDS)for(const k of[b,b+300]){delete ICON[k];delete ICONC[k]}if(TILE7&&TILE7.cache)TILE7.cache.clear();renderBar()}catch(_){}
 // a sprite takes ~1-2 ms to paint: warm the cache in idle time (most common terrain first) so the first chunk that shows a new block
 // type never pays for it inside a frame. spr() would paint any missing one on demand anyway.
 {const first=[2,1,3,77,8,11,5,42,15,10,9,71,72,60,61,62,65,73,74,75,76,94,4],q=[...first.filter(b=>D[b]),...IDS.filter(b=>!first.includes(b))].flatMap(b=>[0,1,2].map(v=>b*4+v));
  const later=f=>typeof requestIdleCallback=='function'?requestIdleCallback(f,{timeout:3000}):setTimeout(f,60);
  const step=dl=>{try{do{const k=q.shift();if(k!=null&&!SPR[k])SPR[k]=blockSprite(k>>2,k&3)}while(q.length&&dl&&dl.timeRemaining&&dl.timeRemaining()>4)}catch(_){}if(q.length)later(step)};later(step)}
 return{IDS,has:b=>!!D[b],render,errs}})();
