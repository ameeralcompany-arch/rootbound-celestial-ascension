// ===== Depth + realistic water renderer =====
// shade3D: contact shadows / edge lighting for every solid tile so the world reads as lit 3D volumes (light from the upper left).
// drawWater: depth colouring, wave surface, caustics, light shafts, foam, bubbles and night glints. Replaces the flat legacy water.
const R3D=(()=>{
 const lerp=(a,b,t)=>a+(b-a)*t,clampv=(v,a,b)=>Math.max(a,Math.min(b,v));
 const wave=(wx,t)=>Math.sin(t*1.5+wx*.045)*1.9+Math.sin(t*2.6+wx*.11+1.3)*.9+Math.sin(t*.8-wx*.021)*1.3;
 // Shadows are painted once per 8x8-tile chunk into a cached canvas (at the screen's real scale, so it looks the same) and redrawn
 // only when a block in or around the chunk changes solid/empty, or the zoom changes. Painting them per tile every frame cost ~40% of a frame.
 const CH=8,PAD=16,CW=CH*T+PAD,cache=new Map(),MAXC=72;let cScale=0;
 const sol=(x,y)=>{if(x<0||y<0||x>=W||y>=H)return 1;const b=tiles[y*W+x];return b&&SOLID6[b]?1:0};
 function sig(cx,cy){let h=7;for(let y=cy*CH-1;y<=cy*CH+CH;y++)for(let x=cx*CH-1;x<=cx*CH+CH;x++)h=(Math.imul(h,31)+sol(x,y))|0;return h}
 function shade3D(x0,x1,y0,y1){const q=typeof QM!='undefined'?QM.cur:{shadow:1};if(!q.shadow)return;
  const m=g.getTransform(),sc=Math.min(4,Math.max(.25,Math.hypot(m.a,m.b)));if(Math.abs(sc-cScale)>.001){cScale=sc;cache.clear()}
  const now=performance.now();
  for(let cy=Math.floor(y0/CH);cy<=Math.floor(y1/CH);cy++)for(let cx=Math.floor(x0/CH);cx<=Math.floor(x1/CH);cx++){const key=cy*1024+cx,s=sig(cx,cy);let e=cache.get(key);
   if(!e||e.s!==s){if(!e){e={c:document.createElement('canvas')};e.c.width=e.c.height=Math.ceil(CW*sc);cache.set(key,e)}e.s=s;const c=e.c.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,e.c.width,e.c.height);c.setTransform(sc,0,0,sc,0,0);
    for(let y=cy*CH;y<cy*CH+CH&&y<H;y++)for(let x=cx*CH;x<cx*CH+CH&&x<W;x++)paint(c,x,y,(x-cx*CH)*T,(y-cy*CH)*T)}
   e.u=now;g.drawImage(e.c,cx*CH*T-cam.x,cy*CH*T-cam.y,CW,CW)}
  if(cache.size>MAXC){const old=[...cache].sort((a,b)=>a[1].u-b[1].u).slice(0,cache.size-MAXC);for(const[k]of old)cache.delete(k)}}
 // the original per-tile look: contact shadows, lit top lip, darker front edges, ambient occlusion in inner corners
 function paint(g,x,y,px,py){const k=y*W+x,b=tiles[k];if(!b||!SOLID6[b])return;
  {const below=y+1<H?tiles[k+W]:1,right=x+1<W?tiles[k+1]:1,left=x>0?tiles[k-1]:1,above=y>0?tiles[k-W]:1;
   // cast shadow on the empty tile below / to the right (light comes from the upper left)
   if(!below||!SOLID6[below]){const gr=g.createLinearGradient(0,py+T,0,py+T+16);gr.addColorStop(0,'rgba(8,10,28,.34)');gr.addColorStop(1,'rgba(8,10,28,0)');g.fillStyle=gr;g.fillRect(px,py+T,T,16)}
   if(!right||!SOLID6[right]){const gr=g.createLinearGradient(px+T,0,px+T+12,0);gr.addColorStop(0,'rgba(8,10,28,.24)');gr.addColorStop(1,'rgba(8,10,28,0)');g.fillStyle=gr;g.fillRect(px+T,py,12,T)}
   // top-lit lip + extruded darker front edge
   if(!above||!SOLID6[above]){g.fillStyle='rgba(255,255,255,.2)';g.fillRect(px,py,T,3);g.fillStyle='rgba(255,255,255,.07)';g.fillRect(px,py+3,T,4)}
   if(!below||!SOLID6[below]){const gr=g.createLinearGradient(0,py+T-12,0,py+T);gr.addColorStop(0,'rgba(0,0,10,0)');gr.addColorStop(1,'rgba(0,0,10,.38)');g.fillStyle=gr;g.fillRect(px,py+T-12,T,12)}
   if(!right||!SOLID6[right]){const gr=g.createLinearGradient(px+T-10,0,px+T,0);gr.addColorStop(0,'rgba(0,0,10,0)');gr.addColorStop(1,'rgba(0,0,10,.28)');g.fillStyle=gr;g.fillRect(px+T-10,py,10,T)}
   if(!left||!SOLID6[left]){const gr=g.createLinearGradient(px,0,px+8,0);gr.addColorStop(0,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(px,py,8,T)}
   // ambient occlusion in inner corners where a tile meets two neighbours
   if(above&&SOLID6[above]&&left&&SOLID6[left]){const gr=g.createRadialGradient(px,py,0,px,py,16);gr.addColorStop(0,'rgba(0,0,12,.22)');gr.addColorStop(1,'rgba(0,0,12,0)');g.fillStyle=gr;g.fillRect(px,py,16,16)}
   if(above&&SOLID6[above]&&right&&SOLID6[right]){const gr=g.createRadialGradient(px+T,py,0,px+T,py,16);gr.addColorStop(0,'rgba(0,0,12,.22)');gr.addColorStop(1,'rgba(0,0,12,0)');g.fillStyle=gr;g.fillRect(px+T-16,py,16,16)}}}
 // water sprites, painted once: the bright band under the surface and one light shaft (skewed per frame instead of a new gradient)
 const SPR3={};{const mk=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'));return c};
  SPR3.band=mk(T+1,14,x=>{const gr=x.createLinearGradient(0,0,0,14);gr.addColorStop(0,'rgba(225,246,255,.5)');gr.addColorStop(1,'rgba(225,246,255,0)');x.fillStyle=gr;x.fillRect(0,0,T+1,14)});
  SPR3.shaft=mk(40,T*4,x=>{const gr=x.createLinearGradient(0,0,0,T*4);gr.addColorStop(0,'rgba(210,245,255,.10)');gr.addColorStop(1,'rgba(210,245,255,0)');x.fillStyle=gr;x.beginPath();x.moveTo(0,0);x.lineTo(15,0);x.lineTo(36,T*4);x.lineTo(14,T*4);x.closePath();x.fill()});
  // caustic light flecks: one solid ellipse pre-drawn at 7 tilts (-.6..+.6 rad); drawn with globalAlpha instead of a new path + colour string per fleck
  SPR3.caus=[];for(let i=0;i<7;i++){const r=-.6+i*.2;SPR3.caus.push(mk(22,22,x=>{x.fillStyle='rgb(200,250,255)';x.beginPath();x.ellipse(11,11,9,3.2,r,0,6.3);x.fill()}))}}
 function water(x0,x1,y0,y1,now){shade3D(x0,x1,y0,y1);const t=now/1000,nt=typeof night=='number'?night:0,dim=1-nt*.38,hq=QM.cur.wfx>=1;g.save();
  const dens=(typeof QM!='undefined'?QM.cur.vfx:1);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const k=y*W+x,v=wl[k];if(!v||tiles[k])continue;
   const above=y>0&&wl[k-W]>0,full=above||v>=8,h=full?T:Math.max(4,v/8*T),px=x*T-cam.x,py0=y*T-cam.y+(T-h),bot=y*T-cam.y+T;
   let d=0;for(let j=1;j<=8&&y-j>=0&&wl[k-W*j]>0;j++)d++;const f=clampv(d/7,0,1);
   const r=lerp(104,10,f)*dim,gc=lerp(206,56,f)*dim,bl=lerp(240,128,f)*dim,al=lerp(.5,.84,f);
   g.fillStyle='rgba('+(r|0)+','+(gc|0)+','+(bl|0)+','+al.toFixed(3)+')';
   if(!above){ // wavy surface polygon, continuous across tiles because it depends on world x
    g.beginPath();g.moveTo(px,bot+1);const y0w=wave(x*T,t);g.lineTo(px,py0+y0w);for(let s=8;s<=T;s+=8){g.lineTo(px+s,py0+wave(x*T+s,t))}g.lineTo(px+T,bot+1);g.closePath();g.fill();
    // lighter band just under the surface, bright crest line
    const gy=py0+wave(x*T+T/2,t);g.globalAlpha=dim;g.drawImage(SPR3.band,px,gy,T+1,14);g.globalAlpha=1;// pre-rendered (was a new gradient per surface tile per frame)
    g.strokeStyle='rgba(255,255,255,'+(.85*dim).toFixed(2)+')';g.lineWidth=1.6;g.beginPath();g.moveTo(px,py0+wave(x*T,t));for(let s=8;s<=T;s+=8)g.lineTo(px+s,py0+wave(x*T+s,t));g.stroke();
    g.strokeStyle='rgba(190,232,255,.35)';g.lineWidth=1;g.beginPath();g.moveTo(px,py0+4+wave(x*T+60,t*1.2));for(let s=8;s<=T;s+=8)g.lineTo(px+s,py0+4+wave(x*T+s+60,t*1.2));g.stroke();
    // foam against walls
    const wl_=x>0&&tiles[k-1]&&SOLID6[tiles[k-1]],wr_=x+1<W&&tiles[k+1]&&SOLID6[tiles[k+1]];if(wl_||wr_){g.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<4;i++){const fx=wl_?px+2+i*3:px+T-2-i*3;g.beginPath();g.arc(fx,gy+1+Math.sin(t*3+i+x)*1.4,2.2-i*.35,0,6.3);g.fill()}}
   }else{g.fillRect(px,py0,T+1,bot-py0+1)}
   if(!hq)continue;
   // caustics + light shafts + bubbles (additive)
   if(d<=5){g.globalCompositeOperation='lighter';const a=(.07*(1-d/6))*dim*Math.min(1,dens+.3);
    g.globalAlpha=a;for(let c=0;c<2;c++){const cx=px+((Math.sin(t*.7+x*1.3+y*.8+c*2.1)*.5+.5)*(T-14))+4,cy=py0+8+((Math.cos(t*.6+x*.9+y*1.1+c*1.7)*.5+.5)*(h-16>0?h-16:1));g.drawImage(SPR3.caus[Math.round((Math.sin(t+c+x)+1)*3)],cx-11,cy-11)}g.globalAlpha=1;
    if(!above&&((x+((t*.25)|0))%3==0)){const sx=px+T*.5+Math.sin(t*.5+x)*6,sk=Math.sin(t*.4+x)*8/(T*4);g.save();g.transform(1,0,sk,1,sx,py0);g.drawImage(SPR3.shaft,-6,0);g.restore()}
    g.globalCompositeOperation='source-over'}
   if(d>=1&&((x*7+y*13)%9==0)){const u=((t*.18+(x*.37+y*.11))%1);g.strokeStyle='rgba(225,248,255,'+(.5*(1-u)).toFixed(2)+')';g.lineWidth=1;g.beginPath();g.arc(px+T*.5+Math.sin(u*9+x)*5,bot-u*T*1.2,2+u*1.5,0,6.3);g.stroke()}
   if(nt>.5&&!above&&((x*5+(t*3|0))%7==0)){g.fillStyle='rgba(255,255,255,'+((nt-.5)*1.1).toFixed(2)+')';g.fillRect(px+((x*37)%T),py0+2+wave(x*T,t),2,2)}
  }
  g.restore()}
 return{water,shade3D,wave}})();
drawWater=function(x0,x1,y0,y1,now){R3D.water(x0,x1,y0,y1,now)};
