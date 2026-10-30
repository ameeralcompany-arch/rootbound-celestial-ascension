// ===== WATER9: smooth, flowing liquid water (replaces R3D's tile-by-tile water; R3D still paints the block shadows first).
// How: each frame the visible tiles are classified once into still "pool" water (resting on a block or on full water, or held up by pool
// water on both sides) and falling "stream" water (above air, or a part-filled tile with water on top of it). Adjacent pool columns are
// linked into one body with a single wavy surface line (three sines in world x, plus player ripples and waterfall impacts); the body is
// clipped under that line and filled per column from a pre-rendered depth strip (light cyan at the top, deep blue lower down) measured from
// the body's highest surface, so every row has one colour across the body. Column edges are snapped to whole device pixels: neighbours share
// edges exactly, no seams, nothing drawn twice. On top: a soft glow + bright crest, wall foam and drifting current dashes (faster where the
// level slopes, i.e. where water flows), two scrolling pre-rendered caustic textures, light shafts / bubbles as sprites. Streams: a
// scrolling streak texture + bright edges, a lip where they spill over, gaps between falling packets bridged, and foam, mist, spray and
// ripple rings where they land. Cost: about 2-4 drawImage per visible water column + 1 clip and 3 strokes per body; no per-frame
// gradients or shadowBlur. =====
const WATER9=(()=>{
 const mk=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;if(f)f(c.getContext('2d'));return c};
 const rng=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296,cl=(v,a,b)=>v<a?a:v>b?b:v,fr=v=>v-Math.floor(v);
 const DEP=T*8,PRE=16,BAND=7,CP=256,CD=T*3,FH=160,FW=24;
 // ---- sprites (built once, lazily); depth strips + colours per night-dim step (0 day .. 7 night). Strip row = depth below the body's
 // highest surface + PRE (the first PRE + BAND rows are the flat surface colour, so wave crests above the reference stay that colour)
 const STR=[],DEEPC=[];const S={};
 function strip(i){if(STR[i])return STR[i];const dm=1-i/7*.4,c=(r,gg,b,a)=>'rgba('+(r*dm|0)+','+(gg*dm|0)+','+(b*dm|0)+','+a+')',L=DEP+PRE,top=c(112,210,244,.44);DEEPC[i]=c(10,46,118,.88);
  return STR[i]=mk(2,L,x=>{const gr=x.createLinearGradient(0,0,0,L);gr.addColorStop(0,top);gr.addColorStop((PRE+BAND*1.5)/L,top);gr.addColorStop((PRE+DEP*.15)/L,c(62,162,224,.57));gr.addColorStop((PRE+DEP*.4)/L,c(28,108,190,.72));gr.addColorStop(1,DEEPC[i]);x.fillStyle=gr;x.fillRect(0,0,2,L)})}
 // caustics: the bright borders of a warped cell (Voronoi) pattern, periodic in x, fading with depth; computed once into pixels (~10 ms)
 function sprites(){if(S.ok)return S;const caus=(seed,N)=>{const R=rng(seed),w=CP,h=CD+8,pt=[];for(let i=0;i<N;i++)pt.push([R()*w,R()*h*1.1-h*.05]);
   const one=mk(w,h,x=>{const img=x.createImageData(w,h),d=img.data,K=6.2832/w;
    for(let y=0;y<h;y++){const fy=y<h*.1?.3+.7*y/(h*.1):Math.max(0,1-(y-h*.1)/(h*.9))**1.3;for(let X=0;X<w;X++){const qx=X+Math.sin(y*.06+seed)*5,qy=y+Math.sin(X*K*3+seed)*5;let d1=1e9,d2=1e9;
      for(let i=0;i<N;i++){let dx=Math.abs(qx-pt[i][0]);dx=dx%w;if(dx>w/2)dx=w-dx;const dy=qy-pt[i][1],dd=dx*dx+dy*dy;if(dd<d1){d2=d1;d1=dd}else if(dd<d2)d2=dd}
      const e=Math.sqrt(d2)-Math.sqrt(d1),v=Math.max(0,1-e/3)*(.5+.5*Math.sin(X*K*2+y*.045+seed)),o=(y*w+X)*4;d[o]=212;d[o+1]=250;d[o+2]=255;d[o+3]=v*v*235*fy}}x.putImageData(img,0,0)});
   return mk(w*2,h,x=>{x.drawImage(one,0,0);x.drawImage(one,w,0)})};
  S.c1=caus(7,30);S.c2=caus(23,22);
  S.shaft=mk(40,T*4,x=>{const gr=x.createLinearGradient(0,0,0,T*4);gr.addColorStop(0,'rgba(215,247,255,.13)');gr.addColorStop(1,'rgba(215,247,255,0)');x.fillStyle=gr;x.beginPath();x.moveTo(0,0);x.lineTo(15,0);x.lineTo(36,T*4);x.lineTo(14,T*4);x.closePath();x.fill()});
  {const R=rng(91),one=mk(FW,FH,x=>{x.fillStyle='rgba(186,234,255,.62)';x.fillRect(0,0,FW,FH);
    for(let i=0;i<28;i++){const sx=R()*FW,w=.8+R()*2.4,len=14+R()*64,y=R()*FH;x.fillStyle='rgba(255,255,255,'+(.18+R()*.5).toFixed(2)+')';for(const o of[-FH,0,FH])x.fillRect(sx,y+o,w,len)}
    for(let i=0;i<10;i++){const sx=R()*FW,len=20+R()*50,y=R()*FH;x.fillStyle='rgba(40,120,205,.22)';for(const o of[-FH,0,FH])x.fillRect(sx,y+o,1.5,len)}
    const gr=x.createLinearGradient(0,0,FW,0);gr.addColorStop(0,'rgba(255,255,255,.42)');gr.addColorStop(.22,'rgba(255,255,255,0)');gr.addColorStop(.78,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(255,255,255,.36)');x.fillStyle=gr;x.fillRect(0,0,FW,FH)});
   S.fall=mk(FW,FH*2,x=>{x.drawImage(one,0,0);x.drawImage(one,0,FH)})}
  const soft=(w,h,a)=>mk(w,h,x=>{const gr=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gr.addColorStop(0,'rgba(255,255,255,'+a+')');gr.addColorStop(.55,'rgba(250,253,255,'+a*.55+')');gr.addColorStop(1,'rgba(250,253,255,0)');x.setTransform(1,0,0,h/w,0,0);x.fillStyle=gr;x.fillRect(0,0,w,w)});
  S.puff=soft(32,32,.95);S.mist=soft(64,32,.5);
  S.bub=mk(12,12,x=>{x.strokeStyle='rgba(230,250,255,.85)';x.lineWidth=1.2;x.beginPath();x.arc(6,6,4,0,6.3);x.stroke();x.fillStyle='rgba(255,255,255,.9)';x.fillRect(4,3.5,1.6,1.6)});
  S.foam=mk(20,12,x=>{x.fillStyle='rgba(255,255,255,.78)';for(const[cx,cy,r]of[[4,7,3.4],[9,6,2.8],[13.5,7,2.3],[17,6.5,1.6],[7,9,2]]){x.beginPath();x.arc(cx,cy,r,0,6.3);x.fill()}});
  S.ok=1;return S}
 // ---- surface motion: three sines in world x + ripples (player in/out, swimming) + impacts (waterfalls landing; last frame's list)
 const RIP=[];let IMP=[],IMPn=[];
 function ripple(x,y,a){if(RIP.length>=14)RIP.shift();RIP.push({x,y,t0:performance.now()/1000,a:a||2})}
 function hgt(wx,t,sy){let h=Math.sin(t*1.6+wx*.045)*1.5+Math.sin(t*2.7+wx*.11+1.3)*.75+Math.sin(t*.9-wx*.021);
  for(let i=0;i<RIP.length;i++){const r=RIP[i];if(Math.abs(r.y-sy)>T)continue;const age=t-r.t0,dx=Math.abs(wx-r.x);if(age<0||age>2.6||dx>age*95)continue;h+=r.a*Math.exp(-age*1.3-dx/150)*Math.sin(dx*.13-age*10)}
  for(let i=0;i<IMP.length;i++){const m=IMP[i];if(Math.abs(m.y-sy)>T)continue;const dx=Math.abs(wx-m.x);if(dx<56)h+=m.a*(1-dx/56)*Math.sin(t*13-dx*.3)}
  return h}
 // world y of the water surface in the column under wx (searching from wy), or null
 function surfAt(wx,wy){const tx=Math.floor(wx/T);if(tx<1||tx>=W-1)return null;let ty=Math.floor(wy/T),n=0;while(n<3&&ty<H-1&&!(wl[ty*W+tx]>0&&!tiles[ty*W+tx])){ty++;n++}
  if(!(wl[ty*W+tx]>0)||tiles[ty*W+tx])return null;while(ty>1&&wl[(ty-1)*W+tx]>0&&!tiles[(ty-1)*W+tx])ty--;return(ty+1)*T-wl[ty*W+tx]/8*T}
 let FB=new Uint8Array(4096);const stats={pools:0,surf:0,segs:0,streams:0,splash:0,ms:0};
 function draw(x0,x1,y0,y1,now){try{R3D.shade3D(x0,x1,y0,y1)}catch(_){}
  const t0=performance.now(),t=now/1000,nt=typeof night=='number'?night:0,di=cl(Math.round(nt*6.65),0,7),dim=1-di/7*.4,q=QM.cur.wfx|0,hq=q>=1,uq=q>=2,red=QM.reduce?.5:1,Sp=sprites(),ST=strip(di);
  const m=g.getTransform(),snap=!m.b&&!m.c&&m.a>0,ms=m.a,me=m.e,md=m.d,mf=m.f,cx=cam.x,cy=cam.y;
  const SX=snap?v=>(Math.round(v*ms+me)-me)/ms:v=>v,SY=snap?v=>(Math.round(v*md+mf)-mf)/md:v=>v;
  const vt=cy-T*2,vb=cy+cv.height/ZM+T*2;
  // ---- 1. classify the window (column-major flags: 1 pool, 2 stream)
  const X0=Math.max(1,x0-1),X1=Math.min(W-2,x1+1),Y0=Math.max(1,y0-1),Y1=Math.min(H-2,y1+1),RH=Y1-Y0+1,CWn=X1-X0+1;if(CWn<1||RH<1)return;
  if(CWn*RH>FB.length)FB=new Uint8Array(CWn*RH*2);const fi=(x,y)=>(x-X0)*RH+(y-Y0);
  let any=0;
  for(let x=X0;x<=X1;x++){let below=0;for(let y=Y1;y>=Y0;y--){const k=y*W+x;let fl=0;
    if(wl[k]>0&&!tiles[k]){any=1;const kb=k+W,sup=tiles[kb]?1:y==Y1?(wl[kb]>0?1:0):(below==1&&wl[kb]>=8?1:0),uns=wl[k]<8&&wl[k-W]>0&&!tiles[k-W];fl=!sup||uns?2:1}
    FB[fi(x,y)]=fl;below=fl}}
  if(!any){IMP=[];stats.pools=stats.surf=stats.segs=stats.streams=stats.splash=0;stats.ms=performance.now()-t0;return}
  for(let x=X0+1;x<X1;x++)for(let y=Y0;y<=Y1;y++){const i=fi(x,y);if(FB[i]==2&&FB[i-RH]==1&&FB[i+RH]==1)FB[i]=3}// held up by pool water on both sides
  for(let i=0;i<CWn*RH;i++)if(FB[i]==3)FB[i]=1;
  // ---- 2. sections
  const pools=[],streams=[];
  for(let x=X0;x<=X1;x++){let y=Y0;while(y<=Y1){const f=FB[fi(x,y)];if(!f){y++;continue}let yb=y;while(yb<Y1&&FB[fi(x,yb+1)]==f)yb++;
    const k=y*W+x,ka=k-W,v=wl[k];
    if(f==1){let sY,srf=1,cov=0,ceil=-1e9;const aw=wl[ka]>0&&!tiles[ka];
     if(aw&&y==Y0){let a=y;while(a>1&&wl[(a-1)*W+x]>0&&!tiles[(a-1)*W+x]&&y-a<90)a--;sY=(a+1)*T-wl[a*W+x]/8*T;srf=0}
     else if(tiles[ka]){if(v>=8){sY=y*T;srf=0;cov=1}else{sY=(y+1)*T-v/8*T;ceil=y*T}}
     else sY=(y+1)*T-v/8*T;
     pools.push({x,ya:y,yb,sY,bot:(yb+1)*T,srf,cov,ceil})}
    else{let vol=0;for(let r=y;r<=yb;r++)vol+=wl[r*W+x];vol/=yb-y+1;const sl=x>X0&&FB[fi(x-1,y)]==1,sr=x<X1&&FB[fi(x+1,y)]==1,side=sl?-1:sr?1:0;
     const aw=wl[ka]>0&&!tiles[ka];let top;if(aw)top=y*T;else if(side){const nk=k+side;top=(y+1)*T-cl(wl[nk],1,8)/8*T}else top=(y+1)*T-Math.max(2,v)/8*T;
     let bot=(yb+1)*T,imp=0;const kb=(yb+1)*W+x;if(yb<Y1&&FB[fi(x,yb+1)]==1){bot=(yb+2)*T-wl[kb]/8*T;imp=1}else if(tiles[kb]){imp=2}
     else{let y2=yb+1;while(y2<=Y1&&y2-yb<9&&!tiles[y2*W+x]&&!(wl[y2*W+x]>0))y2++;const k2=y2*W+x;if(y2<=Y1&&!tiles[k2]&&wl[k2]>0){if(FB[fi(x,y2)]==1){bot=(y2+1)*T-wl[k2]/8*T;imp=1}else bot=(y2+1)*T-Math.max(2,wl[k2])/8*T}}// falling packets: bridge the gap to the next water below so the stream reads as one fall
     streams.push({x,ya:y,yb,vol,side,top,bot,imp})}
    y=yb+1}}
  g.save();g.globalAlpha=1;g.globalCompositeOperation='source-over';
  // ---- 3. link neighbouring pool columns with a visible surface into bodies; one depth reference (the highest surface) per body
  const segs=[];{let prev=[],cur=[],curX=-9;for(const p of pools){p.ref=p.sY;if(!p.srf||p.sY<vt-T||p.sY>vb)continue;if(p.x!==curX){prev=p.x===curX+1?cur:[];cur=[];curX=p.x}
    let sg=null;for(const s of prev){const l=s[s.length-1];if(s.ux!==p.x&&Math.abs(l.sY-p.sY)<T*.75){sg=s;break}}if(!sg){sg=[];segs.push(sg)}sg.push(p);p.seg=sg;sg.ux=p.x;cur.push(sg)}}
  for(const sg of segs){let r=1e9;for(const p of sg)r=Math.min(r,p.sY);for(const p of sg)p.ref=r}
  // body column: depth strip from y a to b (edges on device pixels), deep colour below the strip
  const body=(p,a,b)=>{a=Math.max(a,vt);b=Math.min(b,vb);if(b<=a)return;const X=SX(p.x*T-cx),Xr=SX((p.x+1)*T-cx),Ya=SY(a-cy),d0=a-p.ref+PRE,dS=Math.min(DEP+PRE,b-p.ref+PRE);
   if(dS>d0+.01){const Yb=SY(p.ref+dS-PRE-cy);if(Yb>Ya)g.drawImage(ST,0,d0,1,dS-d0,X,Ya,Xr-X,Yb-Ya)}
   if(b-p.ref>DEP){const Yd=SY(Math.max(a,p.ref+DEP)-cy),Yb=SY(b-cy);if(Yb>Yd){g.fillStyle=DEEPC[di];g.fillRect(X,Yd,Xr-X,Yb-Yd)}}};
  for(const p of pools)if(!p.seg)body(p,p.srf?p.sY:p.cov?p.ya*T:p.ya*T,p.bot);
  // ---- 4. each body: one wavy surface line (base level interpolated between column centres + waves), bodies clipped under it
  const wa=red*(typeof WX6!='undefined'?1+Math.min(1.2,WX6.wind*.35):1),SEG=[];let surfN=0;
  for(const sg of segs){const n=sg.length,xa=sg[0].x*T,xb=(sg[n-1].x+1)*T,pts=[],p2=[];
   const base=wx=>{let j=cl(Math.floor((wx-xa)/T),0,n-1);const c=sg[j],u=(wx-c.x*T)/T;let s=c.sY;if(u<.5&&j>0)s=sg[j-1].sY+(c.sY-sg[j-1].sY)*(.5+u);else if(u>.5&&j<n-1)s=c.sY+(sg[j+1].sY-c.sY)*(u-.5);return[s,c]};
   const yAt=wx=>{const[s,c]=base(wx);return cl(s+hgt(wx,t,c.sY)*cl((c.bot-c.sY)/16,.12,1)*wa,Math.max(c.sY-6,c.ceil+1),c.sY+BAND-1)};
   for(let wx=xa;wx<=xb+.1;wx+=8){const w2=Math.min(wx,xb-.01),px=wx==xa?SX(xa-cx):wx>=xb?SX(xb-cx):wx-cx;pts.push(px,yAt(w2)-cy);if(hq){const[s,c]=base(w2);p2.push(px,s+5.5+hgt(wx+60,t*1.2,c.sY)*cl((c.bot-c.sY)/16,.12,1)*wa*.6-cy)}}
   const path=new Path2D();path.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)path.lineTo(pts[i],pts[i+1]);
   const clip=new Path2D(path);let mb=0;for(const c of sg)mb=Math.max(mb,c.bot);clip.lineTo(SX(xb-cx),Math.min(mb,vb)-cy+2);clip.lineTo(SX(xa-cx),Math.min(mb,vb)-cy+2);clip.closePath();
   g.save();g.clip(clip);for(const c of sg)body(c,c.sY-7,c.bot);g.restore();
   SEG.push({sg,n,path,p2,yAt});surfN+=n}
  // ---- 5. caustics (two textures sliding opposite ways, additive) + light shafts
  if(hq){g.globalCompositeOperation='lighter';const bob=Math.sin(t*.7)*3+4,o1=t*17,o2=-t*11+90;
   for(const p of pools){if(p.cov)continue;const a=Math.max(p.srf?p.sY+BAND:p.ya*T,vt),b=Math.min(p.bot,p.ref+CD,vb);if(b<=a+1)continue;const X=SX(p.x*T-cx),Xr=SX((p.x+1)*T-cx),Ya=SY(a-cy),Yb=SY(b-cy),sy=a-p.ref+bob,sh=b-a;if(sy<0||sy+sh>CD+8)continue;
    g.globalAlpha=.36*dim;g.drawImage(Sp.c1,((p.x*T+o1)%CP+CP)%CP,sy,T,sh,X,Ya,Xr-X,Yb-Ya);if(uq){g.globalAlpha=.28*dim;g.drawImage(Sp.c2,((p.x*T+o2)%CP+CP)%CP,sy,T,sh,X,Ya,Xr-X,Yb-Ya)}}
   for(const p of pools){if(!p.srf||p.bot-p.sY<T*1.5||p.x%3)continue;const u=fr(t*.045+p.x*.618);if(u>.42)continue;const sx=p.x*T+T*.5-cx+Math.sin(t*.5+p.x)*6,sk=Math.sin(t*.4+p.x)*8/(T*4);
    g.globalAlpha=Math.sin(u/.42*Math.PI)*.9*dim;g.save();g.transform(1,0,sk,1,sx,p.sY-cy);g.drawImage(Sp.shaft,-6,0);g.restore()}
   g.globalAlpha=1;g.globalCompositeOperation='source-over'}
  // ---- 6. surface highlights: soft glow + bright crest + inner shimmer line, wall foam, drifting current dashes, night glints
  for(const{sg,n,path,p2,yAt}of SEG){
   g.lineJoin='round';g.strokeStyle='rgba(228,248,255,'+(.24*dim).toFixed(3)+')';g.lineWidth=4.5;g.translate(0,2.6);g.stroke(path);g.translate(0,-2.6);
   g.strokeStyle='rgba(255,255,255,'+(.86*dim).toFixed(3)+')';g.lineWidth=1.6;g.stroke(path);
   if(hq&&p2.length){g.strokeStyle='rgba(200,238,255,'+(.3*dim).toFixed(3)+')';g.lineWidth=1;g.beginPath();g.moveTo(p2[0],p2[1]);for(let i=2;i<p2.length;i+=2)g.lineTo(p2[i],p2[i+1]);g.stroke()}
   for(const[c,dir]of[[sg[0],-1],[sg[n-1],1]]){const r=Math.floor((c.sY-1)/T),kk=r*W+c.x+dir;if(!tiles[kk]||!SOLID6[tiles[kk]])continue;const ex=dir<0?c.x*T:(c.x+1)*T,fx=dir<0?ex:ex-20;g.globalAlpha=.85*dim;g.drawImage(Sp.foam,fx-cx,yAt(dir<0?ex+3:ex-3)-cy-6+Math.sin(t*3+c.x)*1.2,20,12);g.globalAlpha=1}
   if(hq){const wd=typeof WX6!='undefined'?Math.sign(WX6.wind||1)||1:1;for(let j=0;j<n;j++){const c=sg[j],fl=j>0&&j<n-1?(sg[j+1].sY-sg[j-1].sY)/T:0,sp=fl?cl(fl*160,-90,90):wd*12;
     for(let h=0;h<(uq?2:1);h++){const u=fr(t*(sp/T)*(h?.7:1)+c.x*.37+h*.5),wx=c.x*T+u*T,a=Math.sin(u*Math.PI)*(h?.3:.55)*dim;if(a<.04)continue;g.fillStyle='rgba(255,255,255,'+a.toFixed(3)+')';g.fillRect(wx-cx-(fl?6:3),yAt(wx)-cy+2.5+h*4,(fl?12:7)+Math.abs(fl)*10,1.5)}}}
   if(nt>.5&&hq){g.fillStyle='rgba(255,255,255,'+((nt-.5)*1.1).toFixed(2)+')';for(const c of sg)if((c.x*5+(t*3|0))%7==0){const wx=c.x*T+((c.x*37)%T);g.fillRect(wx-cx,yAt(wx)-cy,2,2)}}}
  // ripple rings on the surface (player in / out / swimming)
  if(RIP.length){g.lineWidth=1.3;for(let i=RIP.length-1;i>=0;i--){const r=RIP[i],age=t-r.t0;if(age>2.6){RIP.splice(i,1);continue}if(age>1.3||age<0)continue;
    for(let k=0;k<2;k++){const a2=age-k*.22;if(a2<0)continue;const R2=8+a2*62*Math.min(1.4,r.a/2);g.strokeStyle='rgba(235,250,255,'+((1-a2/1.3)*.6*dim).toFixed(3)+')';g.beginPath();g.ellipse(r.x-cx,r.y-cy+1,R2,R2*.18,0,0,6.3);g.stroke()}}}
  // ---- 6. streams (waterfalls): scrolling streaks, bright edges, lip, foam + spray + rings where they land
  let spl=0;IMPn=[];
  for(const s of streams){const a=Math.max(s.top,vt),b=Math.min(s.bot,vb);if(b<=a+.5)continue;const v=cl(s.vol/6,0,1),w=T*(.42+.58*v),xl=s.side<0?s.x*T:s.side>0?(s.x+1)*T-w:s.x*T+(T-w)/2;
   const X=SX(xl-cx),Xr=SX(xl+w-cx);g.globalAlpha=(.78+.22*v)*dim;
   for(let y=a;y<b;y+=FH){const h=Math.min(FH,b-y),sy=((y-t*250)%FH+FH)%FH,Ya=SY(y-cy),Yb=SY(y+h-cy);if(Yb>Ya)g.drawImage(Sp.fall,0,sy,FW,h,X,Ya,Xr-X,Yb-Ya)}
   g.globalAlpha=1;g.fillStyle='rgba(240,252,255,'+(.5*dim).toFixed(3)+')';g.fillRect(X,a-cy,1.4,b-a);g.fillRect(Xr-1.4,a-cy,1.4,b-a);
   if(s.top>=vt&&!(wl[(s.ya-1)*W+s.x]>0)){g.fillStyle='rgba(255,255,255,'+(.7*dim).toFixed(3)+')';g.fillRect(X,s.top-cy,Xr-X,2.2)}
   const mx=xl+w/2;
   if(s.imp&&s.bot>vt&&s.bot<vb){spl++;if(IMPn.length<12&&s.imp==1)IMPn.push({x:mx,y:s.bot,a:1.6*(.4+v*.6)});const iy=s.bot-cy,sz=.55+.45*v;
    g.globalAlpha=.5*dim;g.drawImage(Sp.mist,mx-cx-46*sz,iy-28*sz,92*sz,38*sz);g.globalAlpha=.95*dim;g.drawImage(Sp.foam,mx-cx-w*.5-7,iy-7+Math.sin(t*9+s.x)*1.2,w+14,11);
    for(let i=0;i<4;i++){const ph=fr(t*1.7+i/4+s.x*.37),r=(9+ph*15)*sz;g.globalAlpha=(1-ph)*.95*dim;g.drawImage(Sp.puff,mx-cx+(i-1.5)*w*.32+Math.sin(t*2+i)*2-r,iy-ph*9*sz-r*.8,r*2,r*1.6)}
    if(hq){g.fillStyle='rgba(240,252,255,.9)';for(let i=0;i<7;i++){const ph=fr(t*1.25+i*.143+s.x*.31),dir=i%2?1:-1;g.globalAlpha=(1-ph)*dim;g.fillRect(mx-cx+dir*(3+i*2.2)*ph*2.2,iy-Math.sin(ph*Math.PI)*(12+i%3*5)*sz,2,2)}}
    if(s.imp==1){g.lineWidth=1.2;for(let k=0;k<2;k++){const ph=fr(t*.9+k*.5);g.globalAlpha=(1-ph)*.55*dim;g.strokeStyle='#eefaff';g.beginPath();g.ellipse(mx-cx,iy+1,w*.5+ph*30,(w*.5+ph*30)*.16,0,0,6.3);g.stroke()}}
    g.globalAlpha=1}}
  // ---- 7. rising bubbles in deeper water
  if(uq){g.globalAlpha=1;for(const p of pools){if(p.bot-p.sY<T*1.5||(p.x*7)%3)continue;const top=Math.max(p.sY+10,vt),bot=Math.min(p.bot,vb);if(bot<=top)continue;for(let i=0;i<2;i++){const u=fr(t*(.16+i*.05)+p.x*.37+i*.5),y=p.bot-u*(p.bot-p.sY-10);if(y<top||y>bot)continue;g.globalAlpha=(1-u)*.9*dim;g.drawImage(Sp.bub,p.x*T+T*.5-cx+Math.sin(u*9+p.x+i)*6-6,y-cy-6,12,12)}}g.globalAlpha=1}
  g.restore();IMP=IMPn;
  stats.pools=pools.length;stats.surf=surfN;stats.segs=segs.length;stats.streams=streams.length;stats.splash=spl;stats.ms=performance.now()-t0}
 // ---- player ripples: entering / leaving the water and swimming along the surface
 let sw0=0,rT=0;
 {const _wf=waterFx;waterFx=function(dt){const r=_wf.apply(this,arguments);try{const sw=P.sw?1:0;if(sw!==sw0){const s=surfAt(P.x,P.y+P.h*.3);if(s!=null)ripple(P.x,s,sw?Math.min(4,1.6+Math.abs(P.vy)/260):2.2)}sw0=sw;
   if(sw&&!P.hw){rT-=dt;if(rT<=0&&Math.abs(P.vx)+Math.abs(P.vy)>60){rT=.3;const s=surfAt(P.x,P.y);if(s!=null)ripple(P.x,s,1.1)}}}catch(_){}return r}}
 return{draw,ripple,surfAt,hgt,stats,RIP,get IMP(){return IMP}}})();
drawWater=function(x0,x1,y0,y1,now){WATER9.draw(x0,x1,y0,y1,now)};
