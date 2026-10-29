// ===== TREE9: smoother, softer trees + fixed tree VFX (outside the plaza; the plaza draws no trees of its own here).
// Art: every tree type / growth stage is pre-rendered once into two sprites, a trunk and a crown. Crowns are soft layered leaf clusters
// with one clean outline, a back layer for depth, a shaded underside, a lit top and little leaf crescents (round oaks, pink cherry
// blossoms, dark hedges, tiered pines for stone/ice trees, palms for sand). No gradients or shadow blur per frame.
// Fixes: growth stages used to pop from one sprite to the next (now the next stage cross-fades in and the tree grows continuously);
// ripe fruit popped in (now fades in); the ripe glow was a flickering flat ellipse drawn with a fresh path every frame (now a soft
// pre-rendered glow with a slow breath); harvested trees vanished in one frame and threw square debris (now the tree shrinks away and
// sheds real leaves, and the green harvest debris is drawn as leaves); the whole sprite was sheared to sway, bending the crown like
// rubber (now the trunk barely leans and the crown sways around the top of the trunk). Mature trees drop a falling leaf now and then
// (pooled, capped, only trees on screen). =====
const TREE9=(()=>{
 const SW=170,SH=250,BX=85,BY=242,rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const HT=[12,26,46,66,84,96,102],TW=[3,4,6,8,10,11,12],CR=[8,11,16,22,28,32,35];
 const kind=r=>r==8?'palm':r==3||r==11||r==56||r==77||r==54?'pine':r==15?'bush':r==50||r==59?'bloom':'round';
 const hx=c=>{c=String(c);if(c[0]=='#')return c;const m=c.match(/\d+/g);return m?'#'+m.slice(0,3).map(v=>(+v|0).toString(16).padStart(2,'0')).join(''):'#4fa84a'};
 const leafOf=r=>{if(r==50||r==59)return'#f4a8c8';if(r==15)return'#3f8a3c';if(r==8)return'#6fbf4a';return hx(blend((BLK[r]||BLK[5])[1],'#4fa84a',.55))};
 const barkOf=r=>r==8?'#b9945a':r==3||r==11||r==77?'#6c6a68':r==50?'#6b3f3a':r==5?'#8a5a32':'#7a5230';
 const C={},glowC={};let glow=null;
 const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 function trunk(x,R,sg,bark,kd){const h=HT[sg],tw=TW[sg],top=BY-h;x.lineJoin='round';x.lineCap='round';
  if(kd=='palm'){x.strokeStyle='#2a1a0c';x.lineWidth=tw*1.3+3;x.beginPath();x.moveTo(BX,BY);x.quadraticCurveTo(BX+h*.28,BY-h*.55,BX+h*.12,top);x.stroke();x.strokeStyle=bark;x.lineWidth=tw*1.3;x.stroke();
   x.strokeStyle='rgba(60,36,14,.55)';x.lineWidth=1.4;for(let i=1;i<9;i++){const t=i/9,px=BX+(1-t)*(1-t)*0+2*(1-t)*t*h*.28+t*t*h*.12,py=BY+(-h*.55*2*(1-t)*t)+(-h)*t*t;x.beginPath();x.moveTo(px-tw*.65,py);x.lineTo(px+tw*.65,py-1.5);x.stroke()}return{tx:BX+h*.12,ty:top}}
  const g1=x.createLinearGradient(BX-tw,0,BX+tw,0);g1.addColorStop(0,mixc(bark,.62));g1.addColorStop(.42,mixc(bark,1.2));g1.addColorStop(1,mixc(bark,.68));
  x.fillStyle=g1;x.strokeStyle='#1d1209';x.lineWidth=2.4;x.beginPath();x.moveTo(BX-tw*1.25,BY);x.bezierCurveTo(BX-tw*.6,BY-4,BX-tw*.52,BY-h*.3,BX-tw*.44,BY-h*.6);x.lineTo(BX-tw*.32,top);x.lineTo(BX+tw*.32,top);x.lineTo(BX+tw*.44,BY-h*.6);x.bezierCurveTo(BX+tw*.52,BY-h*.3,BX+tw*.6,BY-4,BX+tw*1.25,BY);x.closePath();x.fill();x.stroke();
  if(sg>=2){x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=1.1;for(let i=0;i<3+sg;i++){const yy=BY-8-R()*(h-14),xx=BX+(R()-.5)*tw*.6;x.beginPath();x.moveTo(xx,yy);x.lineTo(xx+(R()-.5)*1.6,yy-4-R()*7);x.stroke()}
   x.fillStyle='rgba(255,230,190,.16)';x.fillRect(BX-tw*.2,BY-h*.85,Math.max(1,tw*.22),h*.7);
   x.strokeStyle='#1d1209';x.lineWidth=1.8;x.fillStyle=mixc(bark,.8);for(const sd of[-1,1]){x.beginPath();x.ellipse(BX+sd*tw*1.2,BY-1,tw*.5,2,0,0,6.3);x.fill();x.stroke()}}
  if(sg>=3&&kd!='pine'){for(const sd of[-1,1]){x.strokeStyle='#1d1209';x.lineWidth=Math.max(2.4,tw*.42);x.beginPath();x.moveTo(BX,BY-h*.62);x.quadraticCurveTo(BX+sd*CR[sg]*.35,BY-h*.78,BX+sd*CR[sg]*.72,top-CR[sg]*.1);x.stroke();x.strokeStyle=mixc(bark,1.05);x.lineWidth=Math.max(1,tw*.24);x.stroke()}}
  return{tx:BX,ty:top}}
 // union of circles with one outline: back layer (darker, offset) -> outline -> fill -> clipped shading -> leaf crescents
 function blobs(x,R,list,leaf,ol,detail){const L=mixc(leaf,1.28),D=mixc(leaf,.68),DD=mixc(leaf,.5);
  x.fillStyle=DD;for(const[a,b,r]of list){x.beginPath();x.arc(a+2.5,b+3.5,r,0,6.3);x.fill()}
  x.strokeStyle=ol;x.lineWidth=3.6;for(const[a,b,r]of list){x.beginPath();x.arc(a,b,r,0,6.3);x.stroke()}
  x.fillStyle=leaf;for(const[a,b,r]of list){x.beginPath();x.arc(a,b,r,0,6.3);x.fill()}
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const[a,b,r]of list){x0=Math.min(x0,a-r);y0=Math.min(y0,b-r);x1=Math.max(x1,a+r);y1=Math.max(y1,b+r)}const cx=(x0+x1)/2,cy=(y0+y1)/2,rw=(x1-x0)/2,rh=(y1-y0)/2;
  x.save();x.beginPath();for(const[a,b,r]of list){x.moveTo(a+r,b);x.arc(a,b,r,0,6.3)}x.clip();
  let g2=x.createRadialGradient(cx+rw*.25,cy+rh*.55,rh*.1,cx+rw*.25,cy+rh*.55,rh*1.15);g2.addColorStop(0,'rgba(0,0,0,0)');g2.addColorStop(.35,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=D;x.globalAlpha=.55;x.beginPath();x.ellipse(cx+rw*.3,cy+rh*.75,rw*1.05,rh*.75,0,0,6.3);x.fill();
  g2=x.createRadialGradient(cx-rw*.35,cy-rh*.45,1,cx-rw*.35,cy-rh*.45,Math.max(rw,rh)*.95);g2.addColorStop(0,L);g2.addColorStop(1,'rgba(255,255,255,0)');x.globalAlpha=.75;x.fillStyle=g2;x.fillRect(x0,y0,x1-x0,y1-y0);x.globalAlpha=1;
  if(detail){x.lineCap='round';for(const[a,b,r]of list){if(r<5)continue;const n=r>14?3:2;for(let i=0;i<n;i++){const an=-2.3+R()*1.5,rr2=r*(.45+R()*.4),px=a+Math.cos(an)*rr2*.6,py=b+Math.sin(an)*rr2*.6,s=r*(.28+R()*.14);x.strokeStyle=L;x.globalAlpha=.6;x.lineWidth=1.8;x.beginPath();x.arc(px,py,s,3.6,5.6);x.stroke()}
    const an=.6+R()*1.2,px=a+Math.cos(an)*r*.45,py=b+Math.sin(an)*r*.45;x.strokeStyle=D;x.globalAlpha=.55;x.lineWidth=1.6;x.beginPath();x.arc(px,py,r*.3,.3,2.6);x.stroke()}x.globalAlpha=1}
  x.restore();return{cx,cy,rw,rh}}
 function crown(x,R,sg,leaf,kd,ripe,r,piv){const cr=CR[sg],ol='#14240f',cy=piv.ty-cr*.42;
  if(sg==0){x.strokeStyle='#1b2a14';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(BX,BY);x.quadraticCurveTo(BX-2,BY-7,BX,BY-HT[0]);x.stroke();x.strokeStyle='#6fcf5a';x.lineWidth=3;x.stroke();
   for(const s of[-1,1]){x.fillStyle=s<0?'#7be06a':'#5fc050';x.strokeStyle='#1b2a14';x.lineWidth=2;x.beginPath();x.ellipse(BX+s*7,BY-HT[0]+2,8,4,s*-.5,0,6.3);x.fill();x.stroke();x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=1;x.beginPath();x.moveTo(BX+s*3,BY-HT[0]+1);x.lineTo(BX+s*11,BY-HT[0]);x.stroke()}return}
  if(kd=='palm'){const n=7,L=cr*1.55;x.lineJoin='round';for(let pass=0;pass<2;pass++)for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*.48,ex=piv.tx+Math.cos(a)*L,ey=piv.ty+Math.sin(a)*L*.55+L*.38*Math.abs(Math.cos(a)),mx2=piv.tx+Math.cos(a)*L*.5,my2=piv.ty+Math.sin(a)*L*.62-6;
    x.fillStyle=pass?leaf:mixc(leaf,.62);x.strokeStyle=ol;x.lineWidth=2.4;const off=pass?0:3;x.beginPath();x.moveTo(piv.tx,piv.ty+off);x.quadraticCurveTo(mx2-5,my2-6+off,ex,ey+off);x.quadraticCurveTo(mx2+5,my2+5+off,piv.tx,piv.ty+4+off);x.closePath();x.fill();if(pass){x.stroke();x.strokeStyle=mixc(leaf,1.35);x.lineWidth=1.2;x.beginPath();x.moveTo(piv.tx,piv.ty+1);x.quadraticCurveTo(mx2,my2,ex,ey);x.stroke()}}
   if(ripe)for(const[ox,oy]of[[-5,6],[5,7],[0,10]]){x.fillStyle='#6b4a22';x.strokeStyle='#2a1a0c';x.lineWidth=1.5;x.beginPath();x.arc(piv.tx+ox,piv.ty+oy,4.4,0,6.3);x.fill();x.stroke()}return}
  let list=[];
  if(kd=='pine'){const tiers=sg<3?2:sg<5?3:4;for(let i=0;i<tiers;i++){const u=i/tiers,w=cr*(1.25-u*.75),yb=piv.ty+cr*.5-i*cr*.62;x.fillStyle=mixc(leaf,.55);x.beginPath();x.moveTo(BX-w+2,yb+3);x.lineTo(BX+2,yb-cr*1.0+3);x.lineTo(BX+w+2,yb+3);x.closePath();x.fill()}
   for(let i=0;i<tiers;i++){const u=i/tiers,w=cr*(1.25-u*.75),yb=piv.ty+cr*.5-i*cr*.62,yt=yb-cr*1.0;x.beginPath();x.moveTo(BX-w,yb);for(let s=0;s<=4;s++){const px=BX-w+s*w/2;x.quadraticCurveTo(px-w/4,yb+4,px,yb)}x.lineTo(BX,yt);x.closePath();
    const g2=x.createLinearGradient(BX-w,0,BX+w,0);g2.addColorStop(0,mixc(leaf,1.25));g2.addColorStop(.55,leaf);g2.addColorStop(1,mixc(leaf,.72));x.fillStyle=g2;x.fill();x.strokeStyle=ol;x.lineWidth=2.6;x.stroke();
    x.strokeStyle=mixc(leaf,1.4);x.globalAlpha=.5;x.lineWidth=1.4;x.beginPath();x.moveTo(BX-2,yt+6);x.lineTo(BX-w*.55,yb-3);x.stroke();x.globalAlpha=1}
   if(ripe)drawFruit(x,r,[[-.5,.5],[.45,.2],[0,-.5]].map(([a,b])=>[BX+a*cr,piv.ty+b*cr]));return}
  const rx=cr*(kd=='bush'?1.35:1.12),ry=cr*(kd=='bush'?.7:.86),ccy=kd=='bush'?piv.ty-cr*.1:cy,n=sg<2?4:6+sg*2;
  // a ring of even, overlapping leaf clusters around a filled core = a soft scalloped silhouette (no lumpy random blobs)
  const m=sg<2?5:7+sg;list.push([BX,ccy,Math.min(rx,ry)*.72],[BX-rx*.32,ccy-ry*.18,cr*.5],[BX+rx*.3,ccy-ry*.08,cr*.5]);
  for(let i=0;i<m;i++){const a=i/m*6.283+(R()-.5)*.3,rad=cr*(.4+R()*.1)+2;list.push([BX+Math.cos(a)*(rx-rad*.55),ccy+Math.sin(a)*(ry-rad*.55),rad])}
  list.sort((p,q)=>p[1]-q[1]);const bb=blobs(x,R,list,leaf,ol,sg>=2);
  if(kd=='bloom'){for(let i=0;i<10+sg*4;i++){const a=R()*6.28,d=Math.sqrt(R())*.85,px=BX+Math.cos(a)*bb.rw*d,py=bb.cy+Math.sin(a)*bb.rh*d;x.fillStyle=R()<.6?'#fff4f8':'#ff7aa8';x.globalAlpha=.85;for(let j=0;j<5;j++){const b2=j*1.2566;x.beginPath();x.arc(px+Math.cos(b2)*1.6,py+Math.sin(b2)*1.6,1.3,0,6.3);x.fill()}}x.globalAlpha=1}
  else if(sg>=3){for(let i=0;i<6;i++){x.fillStyle=R()<.5?mixc(leaf,1.45):mixc(leaf,.55);const a=R()*6.28,d=R()*.8;x.globalAlpha=.7;x.fillRect(BX+Math.cos(a)*bb.rw*d,bb.cy+Math.sin(a)*bb.rh*d,2,2)}x.globalAlpha=1}
  if(ripe)drawFruit(x,r,[[-.62,.3],[.46,.12],[0,-.5],[-.2,.55],[.7,.48]].map(([a,b])=>[BX+a*bb.rw,bb.cy+b*bb.rh]))}
 function drawFruit(x,r,pts){const sp=spr(r,0,0);x.strokeStyle='#1d1209';x.lineWidth=1.4;for(const[fx,fy]of pts){x.beginPath();x.moveTo(fx,fy-11);x.lineTo(fx,fy-6);x.stroke();x.save();x.beginPath();x.arc(fx,fy+3,8.5,0,6.3);x.closePath();x.fillStyle='#1d1209';x.fill();x.clip();x.drawImage(sp,fx-9,fy-6,18,18);x.restore();x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.arc(fx-3,fy,2,0,6.3);x.fill()}}
 // sprite pair for tree type r at size sg (0-6); ripe adds fruit. Cached forever (a few dozen small canvases at most).
 function get(r,sg,ripe){const key=r*20+sg*2+(ripe?1:0);if(C[key])return C[key];const kd=kind(r),R=rr(r*7919+sg*104729+(ripe?13:0)),t=mk(SW,SH),c=mk(SW,SH),leaf=leafOf(r);
  // a sapling is all "trunk" (it leans from its base); bigger trees get a trunk sprite + a crown that sways around the trunk top
  const piv=sg==0?{tx:BX,ty:BY-HT[0]}:trunk(t.getContext('2d'),R,sg,barkOf(r),kd);crown((sg==0?t:c).getContext('2d'),rr(r*31+sg*977+7),sg,leaf,kd,ripe,r,piv);return C[key]={t,c,px:piv.tx,py:piv.ty,leaf}}
 const glowSpr=()=>glow||(glow=(()=>{const c=mk(128,128),x=c.getContext('2d'),g2=x.createRadialGradient(64,64,0,64,64,64);g2.addColorStop(0,'rgba(255,232,150,.5)');g2.addColorStop(.5,'rgba(255,225,140,.2)');g2.addColorStop(1,'rgba(255,220,130,0)');x.fillStyle=g2;x.fillRect(0,0,128,128);return c})());
 // ---- drawing one tree (replaces the legacy drawTree)
 const fell=[];
 function drawOne(k,t,now,alpha,shrink){const x=k%W,y=k/W|0,p=t.deco?1:prog(t),f6=p*6,st=t.deco||p>=1?6:Math.min(5,Math.floor(f6)),f=t.deco||p>=1?0:f6-st,bx=x*T+T/2-cam.x,by=(y+1)*T-cam.y;
  const wind=(typeof WX6!='undefined'?WX6.wind:0)+(ptype=='storm'?wxI*1.5:wxI*.4),amp=(.018+wind*.05)*(.35+Math.min(1,p*1.2)),ang=Math.sin(now/1150+x*1.37)*amp+Math.sin(now/530+x*.7)*amp*.25*Math.min(1,wind),lean=ang*.18;
  const sc0=(1+f*.07)*(shrink==null?1:shrink),ripeA=p>=1&&!t.deco?Math.min(1,(Date.now()-t.p)/1000-need(t)>=0?((Date.now()-t.p)/1000-need(t))/.6:0):0;
  const layer=(s,a)=>{if(a<=.01)return;g.globalAlpha=a*alpha;g.setTransform(ZM*sc0,0,-lean*ZM*sc0,ZM*sc0,(bx)*ZM+o0x,(by)*ZM+o0y);g.drawImage(s.t,-BX,-BY);
   const tx=(s.px-BX)*sc0-lean*(s.py-BY)*sc0,ty=(s.py-BY)*sc0,c=Math.cos(ang),sn=Math.sin(ang);g.setTransform(c*ZM*sc0,sn*ZM*sc0,-sn*ZM*sc0,c*ZM*sc0,(bx+tx)*ZM+o0x,(by+ty)*ZM+o0y);g.drawImage(s.c,-s.px,-s.py)};
  const m=g.getTransform(),o0x=m.e-cam.x*0,o0y=m.f;// world transform is scale(ZM) + shake translate
  const A=get(t.r,st,false);
  if(st==6&&!t.deco&&p>=1){layer(A,1-ripeA);layer(get(t.r,6,true),ripeA)}else if(f>.72&&st<6){const b=(f-.72)/.28;layer(A,1-b*b);layer(get(t.r,st+1,false),Math.min(1,b*1.6))}else layer(A,1);
  g.setTransform(m);g.globalAlpha=1;
  if(p>=1&&!t.deco&&alpha>=1&&ripeA>0){const a=(.16+Math.sin(now/1400+x)*.04)*ripeA,s=150;g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(glowSpr(),bx-s/2,by-HT[6]-CR[6]*.5-s/2,s,s);g.globalAlpha=1;g.globalCompositeOperation='source-over'}}
 drawTree=function(k,t,now){if(!t||!BLK[t.r])return;try{drawOne(k,t,now,1)}catch(e){g.globalAlpha=1;if(!TREE9.err){TREE9.err=1;console.error('TREE9',e)}}};
 // ---- harvest: the tree shrinks away over ~0.45 s and sheds leaves; the green harvest debris becomes leaves too
 {const _hv=harvest;harvest=function(k){const t=trees.get(k),n0=parts.length;const r=_hv.apply(this,arguments);try{if(t&&!trees.has(k)){fell.push({k,t,s:performance.now()});const L=get(t.r,t.deco||prog(t)>=1?6:Math.min(5,Math.floor(prog(t)*6)),false);leaves(k,L.leaf,prog(t)>=1||t.deco?16:6,true)}
   for(let i=n0;i<parts.length;i++){const q=parts[i];if(q&&q.k=='d'&&(q.c=='#6fcf5a'||(t&&q.c==(BLK[t.r]||[])[1]))){q.k='f';q.s=Math.max(2,q.s*.7)}}}catch(_){}return r}}
 // ---- falling leaves (harvest bursts + an occasional leaf from mature trees in view): pre-rendered leaf sprites, pooled, capped
 const LF=[],LC={};const leafSpr=c=>LC[c]||(LC[c]=(()=>{const s=mk(14,9),x=s.getContext('2d');x.fillStyle=c;x.beginPath();x.moveTo(1,4.5);x.quadraticCurveTo(7,-1.5,13,4.5);x.quadraticCurveTo(7,10.5,1,4.5);x.fill();x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=.8;x.beginPath();x.moveTo(2,4.5);x.lineTo(12,4.5);x.stroke();x.fillStyle='rgba(255,255,255,.3)';x.fillRect(4,2.5,4,1);return s})());
 function leaves(k,col,n,burst){const x=(k%W+.5)*T,y=(k/W|0)*T+T;for(let i=0;i<n&&LF.length<70;i++){const sx=x+(Math.random()-.5)*(burst?70:60),sy=y-HT[6]*.9-Math.random()*CR[6]*1.3;LF.push({x:sx,y:sy,vx:(Math.random()-.5)*(burst?160:20),vy:burst?-60-Math.random()*120:10,r:Math.random()*6.3,vr:(Math.random()-.5)*5,p:Math.random()*6.3,l:burst?1.6+Math.random():3.5+Math.random()*2,c:Math.random()<.3?mixc(col,1.25):col})}}
 let spawnT=0;
 function fx(vw,vh,now,dt){dt=Math.min(.05,dt||0);const red=typeof QM!='undefined'&&QM.reduce;
  // harvest shrink-away
  for(let i=fell.length-1;i>=0;i--){const q=fell[i],a=(now-q.s)/450;if(a>=1){fell.splice(i,1);continue}try{drawOne(q.k,q.t,now,1-a*a,1-a*.55)}catch(_){fell.splice(i,1)}}
  // ambient leaves from mature trees on screen
  spawnT-=dt;if(spawnT<=0&&!red&&cur!='plaza'){spawnT=.35;const wind=typeof WX6!='undefined'?WX6.wind:0;const x0=cam.x/T-2,x1=(cam.x+vw)/T+2,y0=cam.y/T-2,y1=(cam.y+vh)/T+6;for(const[k,t]of trees){const x=k%W,y=k/W|0;if(x<x0||x>x1||y<y0||y>y1)continue;if(!(t.deco||prog(t)>=.8))continue;if(Math.random()<.05+wind*.15)leaves(k,get(t.r,6,false).leaf,1,false)}}
  if(!LF.length)return;const t=now/1000,wind=(typeof WX6!='undefined'?WX6.wind:0)*60;
  for(let i=LF.length-1;i>=0;i--){const f=LF[i];f.l-=dt;f.vy+=(f.vy<38?60:-20)*dt;f.vx+=((Math.sin(t*1.7+f.p)*28+wind)-f.vx)*dt*1.5;f.x+=f.vx*dt;f.y+=f.vy*dt;f.r+=f.vr*dt;const tx=Math.floor(f.x/T),ty=Math.floor((f.y+4)/T);
   if(f.l<=0||(tx>=0&&ty>=0&&tx<W&&ty<H&&tiles[ty*W+tx]&&SOLID6[tiles[ty*W+tx]]&&f.vy>0)){LF.splice(i,1);continue}const sx=f.x-cam.x,sy=f.y-cam.y;if(sx<-40||sx>vw+40||sy<-60||sy>vh+40)continue;
   const s=Math.abs(Math.cos(f.r*1.3))*.75+.25;g.save();g.globalAlpha=Math.min(1,f.l*1.5);g.translate(sx,sy);g.rotate(f.r);g.scale(1,s);g.drawImage(leafSpr(f.c),-7,-4.5);g.restore()}}
 return{get:get,kind,leafOf,drawOne,fx,leaves,fell,LF,cache:C}})();
