// ===== GROUND10: natural ground (world building). Natural terrain (dirt, grass, stone, sand, deepslate that no player placed) is drawn aware of
// its neighbours, so the world stops looking like a grid of squares:
//  - soft rounded outer corners where the ground meets open air (a gentle radius, never on blocks a player placed);
//  - grass wraps over an exposed edge (a fringe of blades down the open side) instead of stopping in a hard line;
//  - seams between materials crumble into each other: stone pebbles rise into dirt above stone, dirt crumbs fall onto stone, sand spills over
//    grass edges, grass blades creep onto neighbouring sand;
//  - every tile gets a small, fixed variation in tone and a few embedded pebbles / roots on exposed faces, so no two neighbours repeat;
//  - each world has a ground identity from its name: green meadow, blossom (fallen petals in the grass), crystal (tiny shards on stone faces),
//    starlit (faint sparkles in the grass), snowy (soft snow caps), desert (warm sand ripples), enchanted forest (glowing moss), dusk (deep violet
//    grass). It changes details and tint only, never the blocks, and curated places (the Plaza, dungeons, biomes, realms) keep their own look.
// Everything is baked into the cached block sprites (one per tile kind + neighbour shape + theme), so it costs nothing per frame; the chunk cache
// (TILE7) repaints a chunk when a neighbour changes, as before. =====
const GROUND10=(()=>{
 const IDS=[1,2,3,8,77],TAU=Math.PI*2;for(const b of IDS)NBID[b]=1;
 const THEMES=['meadow','blossom','crystal','starlit','snowy','desert','enchanted','dusk'];
 const h32=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
 const curated=w=>typeof w!='string'||w=='plaza'||/^(dg_|biome-|wb_|rootbound)/.test(w)||/-(inf|gal|sea|cry)$/.test(w)||(typeof SIM!='undefined'&&SIM)||false;
 let theme='meadow',tw='';
 function themeOf(w){if(curated(w))return'';const h=h32(String(w));return h%3==0?'meadow':THEMES[(h>>>3)%THEMES.length]}
 const open=k=>{const b=tiles[k];return!b||!SOLID6[b]};
 const placed=k=>{const e=edits[k];return!!(e&&e[0])};
 const C=new Map();
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const TINT={blossom:['rgba(255,170,200,',.10],crystal:['rgba(150,200,255,',.07],starlit:['rgba(120,130,255,',.08],snowy:['rgba(235,245,255,',.12],desert:['rgba(255,210,140,',.10],enchanted:['rgba(90,230,180,',.08],dusk:['rgba(120,60,170,',.16]};
 // which neighbour shape this tile has: corners (4 bits), open sides (4 bits), neighbour materials (below / left / right), theme
 function shape(b,x,y){const k=y*W+x;let m=0;const L=x>0?open(k-1):0,Rr=x<W-1?open(k+1):0,U=y>0?open(k-W):0,D=y<H-1?open(k+W):0;
  if(U&&L&&open(k-W-1))m|=1;if(U&&Rr&&open(k-W+1))m|=2;if(D&&L&&open(k+W-1))m|=4;if(D&&Rr&&open(k+W+1))m|=8;if(L)m|=16;if(Rr)m|=32;if(U)m|=64;
  const nb=j=>{const t=tiles[j];return t==3||t==77?1:t==1?2:t==8?3:t==2?4:0};const below=y<H-1?nb(k+W):0,above=y>0?nb(k-W):0,lf=x>0?nb(k-1):0,rt=x<W-1?nb(k+1):0;return{m,below,above,lf,rt}}
 function sprite(b,x,y,base){const k=y*W+x;if(placed(k))return base();if(cur!==tw){tw=cur;theme=themeOf(cur)}const s=shape(b,x,y),v=(x*7+y*13)%3,tone=(Math.imul(x+1,73856093)^Math.imul(y+1,19349663))>>>0;
  const tv=tone%5,key=b+'|'+v+'|'+s.m+'|'+s.below+'|'+s.above+'|'+s.lf+'|'+s.rt+'|'+(theme||'-')+'|'+tv;let c=C.get(key);if(c)return c;if(C.size>3000)C.clear();
  const src=base();c=document.createElement('canvas');c.width=c.height=T;const g2=c.getContext('2d');g2.drawImage(src,0,0,T,T);const R=rr(tone|1);
  try{paint(g2,b,s,R,tv)}catch(e){if(!GROUND10.e){GROUND10.e=1;console.error('GROUND10',e)}}C.set(key,c);return c}
 const grassC=()=>theme=='dusk'?['#5a3a8a','#7a52b0']:theme=='snowy'?['#5a9a68','#7ab884']:theme=='desert'?['#8aa048','#a8b860']:theme=='blossom'?['#5aa860','#78c070']:['#4c9a3f','#6cbf55'];
 function paint(x,b,s,R,tv){const m=s.m;
  // tone variation (fixed per tile)
  const tvA=[0,.035,-.03,.05,-.045][tv];if(tvA>0){x.fillStyle='rgba(255,250,235,'+tvA+')';x.fillRect(0,0,T,T)}else if(tvA<0){x.fillStyle='rgba(20,10,30,'+(-tvA)+')';x.fillRect(0,0,T,T)}
  // material seams
  if((b==1||b==2)&&s.below==1){for(let i=0;i<7;i++){const px=R()*T,r=2+R()*3.4,py=T-R()*7;x.fillStyle='rgba(30,20,10,.35)';x.beginPath();x.ellipse(px+.6,py+.8,r,r*.8,0,0,TAU);x.fill();x.fillStyle=['#8a8f98','#7b8089','#9aa0a8'][i%3];x.beginPath();x.ellipse(px,py,r,r*.78,R(),0,TAU);x.fill()}}
  if((b==3||b==77)&&s.above==2){for(let i=0;i<9;i++){const px=R()*T,py=R()*6,r=1.4+R()*2.4;x.fillStyle=['#7a5230','#6a4628','#8a6038'][i%3];x.beginPath();x.ellipse(px,py,r,r*.7,R(),0,TAU);x.fill()}}
  if(b==2&&(s.lf==3||s.rt==3)){const sd=s.rt==3?1:-1;for(let i=0;i<10;i++){x.fillStyle=['#e4cf8a','#d8c078','#f0dca0'][i%3];const px=sd>0?T-R()*7:R()*7,py=8+R()*(T-10);x.beginPath();x.arc(px,py,1+R()*1.4,0,TAU);x.fill()}}
  if(b==8&&(s.lf==4||s.rt==4)&&(m&64)){const sd=s.rt==4?1:-1,gc=grassC();for(let i=0;i<6;i++){const px=sd>0?T-1-R()*8:1+R()*8;x.strokeStyle=gc[i%2];x.lineWidth=1.2;x.beginPath();x.moveTo(px,6);x.lineTo(px+(R()-.5)*3,1+R()*2);x.stroke()}}
  // exposed faces: a few embedded pebbles and roots in dirt, chips in stone
  if(b==1&&(m&48)){const sd=(m&16)?0:T;for(let i=0;i<3;i++){const px=Math.abs(sd-(2+R()*8)),py=8+R()*(T-14),r=1.6+R()*2;x.fillStyle='#9a8a74';x.beginPath();x.ellipse(px,py,r,r*.8,R(),0,TAU);x.fill();x.fillStyle='rgba(255,255,255,.3)';x.beginPath();x.arc(px-r*.3,py-r*.3,r*.35,0,TAU);x.fill()}}
  // grass wraps over open sides
  if(b==2&&(m&64)){const gc=grassC();for(const side of[16,32]){if(!(m&side))continue;const ex=side==16?0:T;const sg=side==16?1:-1;x.fillStyle=gc[0];x.beginPath();x.moveTo(ex,0);x.lineTo(ex+sg*5,0);for(let yy=0;yy<=16;yy+=2)x.lineTo(ex+sg*(3+Math.sin(yy*1.7)*1.6+R()*1.2),yy);x.lineTo(ex,18);x.closePath();x.fill();
    for(let i=0;i<5;i++){x.strokeStyle=gc[1];x.lineWidth=1;const yy=4+R()*12;x.beginPath();x.moveTo(ex,yy);x.lineTo(ex+sg*(2+R()*3),yy+3+R()*3);x.stroke()}}}
  // theme details
  if(theme&&TINT[theme]&&(b==2||b==1||b==8)&&(m&64)){const t=TINT[theme];x.fillStyle=lgr(x,t[0]+t[1]+')',t[0]+'0)');x.fillRect(0,0,T,T*.5)}
  if(b==2&&(m&64)){if(theme=='blossom')for(let i=0;i<4;i++){x.fillStyle=['#ffc6d6','#f5aec4','#ffe0ea'][i%3];x.beginPath();x.ellipse(4+R()*(T-8),2+R()*5,2,1.2,R()*3,0,TAU);x.fill()}
   else if(theme=='starlit')for(let i=0;i<3;i++){const px=4+R()*(T-8),py=2+R()*7;x.fillStyle='rgba(230,235,255,.9)';x.fillRect(px-.4,py-2,.8,4);x.fillRect(px-2,py-.4,4,.8)}
   else if(theme=='snowy'){x.fillStyle='#f4f8fc';x.beginPath();x.moveTo(0,0);for(let px=0;px<=T;px+=6)x.lineTo(px,3+Math.sin(px*.5+R()*2)*1.6+R()*1.4);x.lineTo(T,0);x.closePath();x.fill();x.fillStyle='rgba(200,220,240,.6)';x.fillRect(0,0,T,1)}
   else if(theme=='enchanted')for(let i=0;i<3;i++){const px=4+R()*(T-8),py=4+R()*8;x.fillStyle='rgba(120,255,200,.75)';x.beginPath();x.arc(px,py,1.2,0,TAU);x.fill()}
   else if(theme=='meadow'&&R()<.5){x.fillStyle='#8a7a64';x.beginPath();x.ellipse(6+R()*(T-12),3+R()*3,1.8,1.2,0,0,TAU);x.fill()}}
  if((b==3||b==77)&&theme=='crystal'&&(m&112)){for(let i=0;i<2;i++){const px=6+R()*(T-12),py=(m&64)?2:T/2,h=4+R()*5;x.fillStyle=['#9ad8ff','#c0a8ff'][i%2];x.beginPath();x.moveTo(px-2,py+h);x.lineTo(px,py);x.lineTo(px+2,py+h);x.closePath();x.fill()}}
  if(b==8&&theme=='desert'&&(m&64)){x.strokeStyle='rgba(180,140,80,.35)';x.lineWidth=1;for(let i=0;i<3;i++){x.beginPath();const yy=8+i*9;x.moveTo(0,yy);for(let px=0;px<=T;px+=6)x.lineTo(px,yy+Math.sin(px*.25+i)*1.5);x.stroke()}}
  // soft rounded outer corners (cut away, with a soft rim)
  const RAD=9;x.save();x.globalCompositeOperation='destination-out';for(const[bit,cx,cy,sx,sy]of[[1,0,0,1,1],[2,T,0,-1,1],[4,0,T,1,-1],[8,T,T,-1,-1]]){if(!(m&bit))continue;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+sx*RAD,cy);x.arc(cx+sx*RAD,cy+sy*RAD,RAD,Math.atan2(-sy,0),Math.atan2(0,-sx),sx*sy>0);x.closePath();x.fill()}x.restore();
  for(const[bit,cx,cy,sx,sy]of[[1,0,0,1,1],[2,T,0,-1,1],[4,0,T,1,-1],[8,T,T,-1,-1]]){if(!(m&bit))continue;x.strokeStyle=sy>0?'rgba(255,255,255,.18)':'rgba(0,0,0,.25)';x.lineWidth=1.4;x.beginPath();x.arc(cx+sx*RAD,cy+sy*RAD,RAD-.7,Math.atan2(-sy,-sx)-.78,Math.atan2(-sy,-sx)+.78);x.stroke()}}
 const lgr=(x,a,b)=>{const g=x.createLinearGradient(0,0,0,T*.5);g.addColorStop(0,a);g.addColorStop(1,b);return g};
 window.NSPR=(b,x,y,base)=>sprite(b,x,y,base);
 // the chunk cache must repaint a chunk when its left / right neighbours change too (corners and seams read them)
 return{sprite,shape,themeOf,get theme(){return theme},THEMES,C,curated}})();
