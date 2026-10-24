// ===== Depth + realistic water renderer =====
// shade3D: contact shadows / edge lighting for every solid tile so the world reads as lit 3D volumes (light from the upper left).
// drawWater: depth colouring, wave surface, caustics, light shafts, foam, bubbles and night glints. Replaces the flat legacy water.
const R3D=(()=>{
 const lerp=(a,b,t)=>a+(b-a)*t,clampv=(v,a,b)=>Math.max(a,Math.min(b,v));
 const wave=(wx,t)=>Math.sin(t*1.5+wx*.045)*1.9+Math.sin(t*2.6+wx*.11+1.3)*.9+Math.sin(t*.8-wx*.021)*1.3;
 function shade3D(x0,x1,y0,y1){const q=typeof QM!='undefined'?QM.cur:{shadow:1};if(!q.shadow)return;g.save();
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const k=y*W+x,b=tiles[k];if(!b||!SOLID6[b])continue;const px=x*T-cam.x,py=y*T-cam.y;
   const below=y+1<H?tiles[k+W]:1,right=x+1<W?tiles[k+1]:1,left=x>0?tiles[k-1]:1,above=y>0?tiles[k-W]:1;
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
   if(above&&SOLID6[above]&&right&&SOLID6[right]){const gr=g.createRadialGradient(px+T,py,0,px+T,py,16);gr.addColorStop(0,'rgba(0,0,12,.22)');gr.addColorStop(1,'rgba(0,0,12,0)');g.fillStyle=gr;g.fillRect(px+T-16,py,16,16)}}
  g.restore()}
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
    const gy=py0+wave(x*T+T/2,t),gr=g.createLinearGradient(0,gy,0,gy+14);gr.addColorStop(0,'rgba(225,246,255,'+(.5*dim).toFixed(2)+')');gr.addColorStop(1,'rgba(225,246,255,0)');g.fillStyle=gr;g.fillRect(px,gy,T+1,14);
    g.strokeStyle='rgba(255,255,255,'+(.85*dim).toFixed(2)+')';g.lineWidth=1.6;g.beginPath();g.moveTo(px,py0+wave(x*T,t));for(let s=8;s<=T;s+=8)g.lineTo(px+s,py0+wave(x*T+s,t));g.stroke();
    g.strokeStyle='rgba(190,232,255,.35)';g.lineWidth=1;g.beginPath();g.moveTo(px,py0+4+wave(x*T+60,t*1.2));for(let s=8;s<=T;s+=8)g.lineTo(px+s,py0+4+wave(x*T+s+60,t*1.2));g.stroke();
    // foam against walls
    const wl_=x>0&&tiles[k-1]&&SOLID6[tiles[k-1]],wr_=x+1<W&&tiles[k+1]&&SOLID6[tiles[k+1]];if(wl_||wr_){g.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<4;i++){const fx=wl_?px+2+i*3:px+T-2-i*3;g.beginPath();g.arc(fx,gy+1+Math.sin(t*3+i+x)*1.4,2.2-i*.35,0,6.3);g.fill()}}
   }else{g.fillRect(px,py0,T+1,bot-py0+1)}
   if(!hq)continue;
   // caustics + light shafts + bubbles (additive)
   if(d<=5){g.globalCompositeOperation='lighter';const a=(.07*(1-d/6))*dim*Math.min(1,dens+.3);
    for(let c=0;c<2;c++){const cx=px+((Math.sin(t*.7+x*1.3+y*.8+c*2.1)*.5+.5)*(T-14))+4,cy=py0+8+((Math.cos(t*.6+x*.9+y*1.1+c*1.7)*.5+.5)*(h-16>0?h-16:1));g.fillStyle='rgba(200,250,255,'+a.toFixed(3)+')';g.beginPath();g.ellipse(cx,cy,9,3.2,Math.sin(t+c+x)*.6,0,6.3);g.fill()}
    if(!above&&((x+((t*.25)|0))%3==0)){const sx=px+T*.5+Math.sin(t*.5+x)*6,gr=g.createLinearGradient(0,py0,0,py0+T*4);gr.addColorStop(0,'rgba(210,245,255,.10)');gr.addColorStop(1,'rgba(210,245,255,0)');g.fillStyle=gr;g.beginPath();g.moveTo(sx-6,py0);g.lineTo(sx+9,py0);g.lineTo(sx+30+Math.sin(t*.4+x)*8,py0+T*4);g.lineTo(sx+8,py0+T*4);g.closePath();g.fill()}
    g.globalCompositeOperation='source-over'}
   if(d>=1&&((x*7+y*13)%9==0)){const u=((t*.18+(x*.37+y*.11))%1);g.strokeStyle='rgba(225,248,255,'+(.5*(1-u)).toFixed(2)+')';g.lineWidth=1;g.beginPath();g.arc(px+T*.5+Math.sin(u*9+x)*5,bot-u*T*1.2,2+u*1.5,0,6.3);g.stroke()}
   if(nt>.5&&!above&&((x*5+(t*3|0))%7==0)){g.fillStyle='rgba(255,255,255,'+((nt-.5)*1.1).toFixed(2)+')';g.fillRect(px+((x*37)%T),py0+2+wave(x*T,t),2,2)}
  }
  g.restore()}
 return{water,shade3D,wave}})();
drawWater=function(x0,x1,y0,y1,now){R3D.water(x0,x1,y0,y1,now)};
