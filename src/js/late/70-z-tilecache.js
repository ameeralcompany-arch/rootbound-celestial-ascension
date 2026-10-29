// ===== TILE7: the world's blocks are painted once per 8x8-tile chunk into a cached canvas (at the screen's real scale) and reused every
// frame. A chunk is repainted only when a block in it, or right above/below it, changes, or when the zoom/quality changes. Drawing every
// visible block one by one was the bulk of each frame at full HD. Hit "pop", cracks and the lamp list for lighting stay live. =====
const TDRAW7=new Uint8Array(256);// non-solid tiles that are still painted into the chunk cache (fences, rugs, lanterns, planters, campfire base); see 70-zz-blocks2.js
const TILE7=(()=>{
 const CH=8,CW=CH*T,cache=new Map(),MAXC=72;let cKey='';
 // tiles in the chunk plus the row above and below (the lit lip / dark edge depend on them)
 function sig(cx,cy){let h=7;const x0=cx*CH,y0=cy*CH;for(let y=y0-1;y<=y0+CH;y++){if(y<0||y>=H)continue;for(let x=x0;x<x0+CH&&x<W;x++)h=(Math.imul(h,31)+tiles[y*W+x])|0}return h}
 // the same look the per-block loop had: sprite, lit lip under air, dark edge above air
 function paint(c,cx,cy,lips){for(let y=cy*CH;y<cy*CH+CH&&y<H;y++)for(let x=cx*CH;x<cx*CH+CH&&x<W;x++){const k=y*W+x,b=tiles[k];if(!b||!(SOLID6[b]||TDRAW7[b]))continue;const px=(x-cx*CH)*T,py=(y-cy*CH)*T;
   c.drawImage(spr(b,x,y),px,py,T,T);if(lips&&SOLID6[b]){if(!tiles[k-W]&&y>0){c.fillStyle='rgba(255,255,255,.2)';c.fillRect(px,py,T,3)}if(!tiles[k+W]){c.fillStyle='rgba(0,0,0,.28)';c.fillRect(px,py+T-4,T,4)}}}}
 function draw(x0,x1,y0,y1,now){const m=g.getTransform(),sc=Math.min(4,Math.max(.25,Math.hypot(m.a,m.b))),lips=ZM>=.8,key=sc.toFixed(3)+'|'+lips+'|'+(typeof QM!='undefined'?QM.cur.id:'')+'|'+g.imageSmoothingEnabled;
  if(key!==cKey){cKey=key;cache.clear()}const t=performance.now();
  // chunks are copied 1:1 at whole device pixels (no resampling): neighbouring chunks no longer show hairline seams at odd zoom levels
  const blit=!m.b&&!m.c&&Math.abs(m.a-sc)<.001&&Math.abs(m.d-sc)<.001;if(blit)g.setTransform(1,0,0,1,0,0);
  for(let cy=Math.floor(y0/CH);cy<=Math.floor(y1/CH);cy++)for(let cx=Math.floor(x0/CH);cx<=Math.floor(x1/CH);cx++){const id=cy*1024+cx,s=sig(cx,cy);let e=cache.get(id);
   if(!e||e.s!==s){if(!e){e={c:document.createElement('canvas')};e.c.width=e.c.height=Math.ceil(CW*sc);cache.set(id,e)}e.s=s;const c=e.c.getContext('2d');
    c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,e.c.width,e.c.height);c.imageSmoothingEnabled=g.imageSmoothingEnabled;c.setTransform(sc,0,0,sc,0,0);paint(c,cx,cy,lips)}
   e.u=t;if(blit)g.drawImage(e.c,Math.round((cx*CW-cam.x)*m.a+m.e),Math.round((cy*CW-cam.y)*m.d+m.f));else g.drawImage(e.c,cx*CW-cam.x,cy*CW-cam.y,CW,CW)}
  if(blit)g.setTransform(m);
  if(cache.size>MAXC){const old=[...cache].sort((a,b)=>a[1].u-b[1].u).slice(0,cache.size-MAXC);for(const[k]of old)cache.delete(k)}
  // live layer: lamps for the lighting pass, the hit "pop" and crack overlays
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const k=y*W+x,b=tiles[k];if(!b||!(SOLID6[b]||TDRAW7[b]))continue;if(b==13||(window.GLOW7&&GLOW7[b]))lampL.push(x*T+T/2-cam.x,y*T+T/2-cam.y);
   const pp=pop.get(k),mh=BLK[b][2],dmg=hp[k]<mh&&hp[k]>0;if(!pp&&!dmg)continue;const px=x*T-cam.x,py=y*T-cam.y;
   if(pp){const a=(now-pp)/180;if(a>=1)pop.delete(k);else{const s2=1+.22*Math.sin(Math.min(1,a)*3.14);g.save();g.translate(px+T/2,py+T/2);g.scale(s2,s2);g.drawImage(spr(b,x,y),-T/2,-T/2,T,T);g.restore()}}
   if(dmg){const r=1-hp[k]/mh;g.drawImage(CR[Math.min(3,1+(r*3|0))],px,py,T,T)}}}
 return{draw,cache,on:true}})();
