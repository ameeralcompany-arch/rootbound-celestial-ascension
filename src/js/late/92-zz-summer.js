// ===== SUMMER9: summer things at the water + seats you can sit on. When a world is generated, every open-sky pool / lake gets a
// deterministic (world-seeded) set: a beach umbrella over a sun lounger, a deck chair or a bench on the other bank, a sandcastle, a beach
// ball, swim rings / a duck ring / an air mattress bobbing and tilting on the real wavy surface (WATER9), and on wider lakes a little
// wooden dock. In the Plaza only the pond gets a ring and a deck chair on its pier. Seats (loungers, deck chairs, benches, the dock edge,
// and the placeable Bench / Sun Lounger / Deck Chair objects): press E nearby to sit (AC6 sitting pose), any movement key or E stands up.
// Decor is never saved: it is rebuilt from the generated terrain on every load and an item hides itself while a block fills its spot or
// its ground / water is gone. The new store objects (tiles 90-92, 97-98) reuse the object pipeline. All art is anime-style vector drawn
// once into cached sprites (2x for crisp zoom); per frame it costs one drawImage per item on screen. =====
const SUMMER9=(()=>{
 const O='#140c1c',SC=2,rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const hx=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
 const sh=(c,k)=>{const v=hx(c),t=k<0?0:255,a=Math.abs(k);return'rgb('+v.map(q=>Math.round(q+(t-q)*a)).join(',')+')'};
 function mkS(w,h,ax,ay,f){const c=document.createElement('canvas');c.width=w*SC;c.height=h*SC;const x=c.getContext('2d');x.scale(SC,SC);x.translate(ax,ay);x.lineJoin='round';x.lineCap='round';f(x);return{c,w,h,ax,ay}}
 const flipS=s=>{const c=document.createElement('canvas');c.width=s.c.width;c.height=s.c.height;const x=c.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(s.c,0,0);return{c,w:s.w,h:s.h,ax:s.w-s.ax,ay:s.ay}};
 const rrp=(x,a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
 const olS=(x,lw)=>{x.strokeStyle=O;x.lineWidth=lw||1.4;x.stroke()};
 const shadow=(x,cx,rx)=>{x.fillStyle='rgba(20,30,60,.15)';x.beginPath();x.ellipse(cx,0,rx,3.2,0,0,6.3);x.fill()};
 const PAL=[['#ff5d73','#fff7ee'],['#22c3c9','#fff7ee'],['#ffb627','#ff6f91'],['#5b8cff','#fff7ee'],['#a26bff','#ffe0f4']];
 // ---------------- art (origin = the item's ground point, y up is negative) ----------------
 const ART9={
  umbrella:p=>mkS(100,108,50,104,x=>{shadow(x,0,32);x.fillStyle='#e9d39a';x.beginPath();x.ellipse(0,0,6,2,0,0,6.3);x.fill();
   x.fillStyle='#f4efe4';x.beginPath();x.rect(-1.8,-82,3.6,82);x.fill();olS(x,1.2);x.fillStyle='rgba(60,40,80,.18)';x.fillRect(.4,-82,1.4,82);
   const top=-100,rim=-76,R=45,path=()=>{x.beginPath();x.moveTo(-R,rim);x.bezierCurveTo(-R+5,top+7,-15,top,0,top);x.bezierCurveTo(15,top,R-5,top+7,R,rim);for(let i=6;i>0;i--){const a=-R+2*R*i/6,b=-R+2*R*(i-1)/6;x.quadraticCurveTo((a+b)/2,rim+6.5,b,rim)}x.closePath()};
   x.save();path();x.clip();for(let i=0;i<6;i++){x.fillStyle=p[i%2];const a=-R+2*R*i/6,b=-R+2*R*(i+1)/6;x.beginPath();x.moveTo(0,top-6);x.lineTo(a*1.18,rim+9);x.lineTo(b*1.18,rim+9);x.closePath();x.fill()}
    x.fillStyle='rgba(255,255,255,.26)';x.beginPath();x.ellipse(-17,top+9,21,8,-.3,0,6.3);x.fill();x.fillStyle='rgba(40,10,60,.16)';x.beginPath();x.moveTo(-R,rim+9);x.quadraticCurveTo(0,rim-7,R,rim+9);x.fill();x.fillStyle='rgba(40,10,60,.1)';x.fillRect(16,top,R,40);x.restore();
   path();olS(x,1.6);x.strokeStyle='rgba(20,12,28,.35)';x.lineWidth=.8;for(let i=1;i<6;i++){const a=-R+2*R*i/6;x.beginPath();x.moveTo(0,top);x.quadraticCurveTo(a*.6,top+7,a,rim);x.stroke()}
   x.fillStyle=p[0];x.beginPath();x.arc(0,top-2,2.8,0,6.3);x.fill();olS(x,1);x.fillStyle='#fff';x.beginPath();x.arc(-22,top+11,1.7,0,6.3);x.fill();x.beginPath();x.arc(-15,top+6,1,0,6.3);x.fill()}),
  lounger:p=>mkS(90,48,40,44,x=>{shadow(x,4,38);const fr='#f8f4ec';
   for(const lx of[-22,32]){x.fillStyle=fr;x.beginPath();x.rect(lx-1.6,-11,3.2,11);x.fill();olS(x,1.1)}
   // backrest: hinged near the left end of the bed, leaning back up-left, with a striped cushion on the sitter's side
   const hxp=-14,hyp=-13,tx=-33,ty=-40,ln=Math.hypot(tx-hxp,ty-hyp),nx=-(ty-hyp)/ln,ny=(tx-hxp)/ln,ln2=(a,b,c,d,w,col,dash)=>{x.strokeStyle=col;x.lineWidth=w;if(dash)x.setLineDash(dash);x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();if(dash)x.setLineDash([])};
   ln2(hxp,hyp,tx,ty,6.6,O);ln2(hxp,hyp,tx,ty,4.2,fr);const ox=nx*4.6,oy=ny*4.6;ln2(hxp+ox,hyp+oy,tx+ox,ty+oy,9,O);ln2(hxp+ox,hyp+oy,tx+ox,ty+oy,6.6,p[0]);ln2(hxp+ox,hyp+oy,tx+ox,ty+oy,6.6,p[1],[3.6,3.6]);
   ln2(hxp+ox*1.5,hyp+oy*1.5,tx+ox*1.5,ty+oy*1.5,1.4,'rgba(255,255,255,.45)');
   x.fillStyle=fr;rrp(x,-26,-13,64,4.6,2);x.fill();olS(x,1.2);x.fillStyle='rgba(60,40,80,.18)';x.fillRect(-25,-10,62,1.4);
   x.save();rrp(x,-22,-19.5,58,7,3.5);x.clip();x.fillStyle=p[0];x.fillRect(-22,-20,58,8);x.fillStyle=p[1];for(let i=0;i<8;i+=2)x.fillRect(-22+i*7.25,-20,7.25,8);x.fillStyle='rgba(255,255,255,.4)';x.fillRect(-22,-19.5,58,1.8);x.fillStyle='rgba(40,10,60,.14)';x.fillRect(-22,-14.6,58,2.2);x.restore();
   rrp(x,-22,-19.5,58,7,3.5);olS(x,1.3);x.fillStyle='#fff';x.beginPath();x.arc(-12,-17.5,1.1,0,6.3);x.fill()}),
  chair:p=>mkS(50,58,24,54,x=>{shadow(x,0,19);const wd='#c8955a',bar=(a,b,c,d,w)=>{x.strokeStyle=O;x.lineWidth=w+2.2;x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();x.strokeStyle=wd;x.lineWidth=w;x.stroke();x.strokeStyle='rgba(255,236,200,.55)';x.lineWidth=1;x.beginPath();x.moveTo(a-.7,b);x.lineTo(c-.7,d);x.stroke()};
   bar(-11,0,12,-21,2.8);bar(14,0,-12,-47,3.2);
   const sl=()=>{x.beginPath();x.moveTo(-13,-46);x.quadraticCurveTo(-7,-17,12,-20);x.lineTo(13,-16);x.quadraticCurveTo(-12,-12,-17.5,-44);x.closePath()};
   x.save();sl();x.clip();x.fillStyle=p[0];x.fillRect(-20,-50,36,40);x.fillStyle=p[1];for(let i=-20;i<16;i+=8)x.fillRect(i,-50,4,40);x.fillStyle='rgba(40,10,60,.16)';x.beginPath();x.moveTo(-16,-44);x.quadraticCurveTo(-11,-14,13,-16);x.lineTo(13,-12);x.lineTo(-20,-12);x.fill();x.restore();sl();olS(x,1.3);
   bar(-7,-25,13,-25,2.2);x.fillStyle='#fff';x.beginPath();x.arc(-10,-38,1.1,0,6.3);x.fill()}),
  bench:()=>mkS(80,46,40,42,x=>{shadow(x,0,36);const ir='#3d3550',wd='#bb7a42',wl='#dd9e62';
   for(const s of[-1,1]){x.strokeStyle=O;x.lineWidth=4.4;x.beginPath();x.moveTo(s*29,0);x.quadraticCurveTo(s*27,-9,s*30,-16);x.lineTo(s*31,-38);x.stroke();x.strokeStyle=ir;x.lineWidth=2.4;x.stroke();x.beginPath();x.moveTo(s*24,0);x.quadraticCurveTo(s*27,-8,s*29,-15);x.strokeStyle=O;x.lineWidth=4;x.stroke();x.strokeStyle=ir;x.lineWidth=2;x.stroke()}
   for(const[y,h]of[[-37,4],[-30.5,4]]){x.fillStyle=wd;rrp(x,-35,y,70,h,1.6);x.fill();olS(x,1.1);x.fillStyle=wl;x.fillRect(-34,y+.6,68,1.1)}
   x.fillStyle=wd;rrp(x,-37,-19,74,5,1.8);x.fill();olS(x,1.2);x.fillStyle=wl;x.fillRect(-36,-18.3,72,1.3);x.strokeStyle='rgba(60,30,10,.45)';x.lineWidth=.8;for(let i=-24;i<36;i+=12){x.beginPath();x.moveTo(i,-18.5);x.lineTo(i,-14.5);x.stroke()}}),
  castle:()=>mkS(50,48,25,44,x=>{const sd='#f1d79b',dk='#cfae6c',lt='#fff0c8';shadow(x,0,22);x.fillStyle=sd;x.beginPath();x.ellipse(0,-3,22,6,0,0,6.3);x.fill();olS(x,1.2);
   const tower=(a,b,top,w)=>{x.fillStyle=sd;x.beginPath();x.moveTo(a,-4);x.lineTo(a,top);for(let i=0;i<3;i++){const s=a+i*w/3;x.lineTo(s,top-3.5);x.lineTo(s+w/6,top-3.5);x.lineTo(s+w/6,top);x.lineTo(s+w/3,top)}x.lineTo(b,top);x.lineTo(b,-4);x.closePath();x.fill();olS(x,1.2);x.fillStyle=dk;x.fillRect(b-3,top+1,2.4,-top-6);x.fillStyle=lt;x.fillRect(a+1.4,top+1,1.6,-top-7)};
   tower(-13,13,-22,26);tower(-20,-9,-30,11);tower(9,20,-28,11);tower(-5,5,-38,10);
   x.fillStyle='#8a6a3a';x.beginPath();x.moveTo(-4,-4);x.lineTo(-4,-11);x.arc(0,-11,4,Math.PI,0);x.lineTo(4,-4);x.closePath();x.fill();olS(x,1);
   x.strokeStyle=O;x.lineWidth=1.2;x.beginPath();x.moveTo(0,-41);x.lineTo(0,-52);x.stroke();x.fillStyle='#ff6f91';x.beginPath();x.moveTo(0,-52);x.lineTo(9,-49);x.lineTo(0,-46);x.closePath();x.fill();olS(x,1);
   x.fillStyle='#ffd6e0';for(const[a,b]of[[-16,-2],[14,-1],[8,-5]]){x.beginPath();x.arc(a,b,1.6,0,6.3);x.fill()}x.fillStyle='rgba(0,0,0,.25)';for(const[a,b]of[[-15,-16],[14,-14],[0,-28]])x.fillRect(a-1,b-1,2,2)}),
  ball:()=>mkS(24,24,12,12,x=>{const C=['#ff4d6d','#ffffff','#3a86ff','#ffffff','#ffd23f','#ffffff'];x.save();x.beginPath();x.arc(0,0,9,0,6.3);x.clip();
   for(let i=0;i<6;i++){x.fillStyle=C[i];x.beginPath();x.moveTo(0,0);x.arc(0,0,10,i*1.0472-.4,(i+1)*1.0472-.4);x.closePath();x.fill()}
   x.fillStyle='rgba(20,0,50,.2)';x.beginPath();x.arc(3,3,10,0,6.3);x.arc(-1,-1,9,0,6.3,true);x.fill();x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.ellipse(-3.5,-4,2.6,1.6,-.6,0,6.3);x.fill();x.restore();
   x.fillStyle='#fff';x.beginPath();x.arc(0,0,2,0,6.3);x.fill();x.beginPath();x.arc(0,0,9,0,6.3);olS(x,1.3)}),
  ring:p=>mkS(48,26,24,12,x=>{x.save();x.beginPath();x.ellipse(0,0,20,8,0,0,6.3);x.ellipse(0,-1.2,9,3,0,0,6.3);x.clip('evenodd');x.fillStyle=p[0];x.fillRect(-21,-9,42,18);
   x.fillStyle=p[1];for(let i=0;i<8;i+=2){const a=i*.7854,b=a+.7854;x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a)*30,Math.sin(a)*30);x.lineTo(Math.cos(b)*30,Math.sin(b)*30);x.closePath();x.fill()}
   x.fillStyle='rgba(40,10,70,.18)';x.fillRect(-21,2,42,8);x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=1.6;x.beginPath();x.ellipse(0,-1,16,5.5,0,3.5,5.3);x.stroke();x.fillStyle='rgba(70,165,230,.45)';x.fillRect(-21,2.5,42,8);x.restore();
   x.beginPath();x.ellipse(0,0,20,8,0,0,6.3);olS(x,1.3);x.beginPath();x.ellipse(0,-1.2,9,3,0,3.3,6.1);olS(x,1)}),
  duck:()=>mkS(54,40,27,26,x=>{const Y='#ffd23f';x.save();x.beginPath();x.ellipse(0,0,20,8,0,0,6.3);x.ellipse(0,-1.2,9,3,0,0,6.3);x.clip('evenodd');x.fillStyle=Y;x.fillRect(-21,-9,42,18);x.fillStyle='#ff9f1c';x.fillRect(-21,-1,42,1.6);
   x.fillStyle='rgba(120,60,0,.18)';x.fillRect(-21,2,42,8);x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=1.6;x.beginPath();x.ellipse(0,-1,16,5.5,0,3.5,5.3);x.stroke();x.fillStyle='rgba(70,165,230,.45)';x.fillRect(-21,2.5,42,8);x.restore();
   x.beginPath();x.ellipse(0,0,20,8,0,0,6.3);olS(x,1.3);x.beginPath();x.ellipse(0,-1.2,9,3,0,3.3,6.1);olS(x,1);
   x.fillStyle=Y;x.beginPath();x.moveTo(-19,-2);x.quadraticCurveTo(-21,-10,-17,-14);x.lineTo(-12,-12);x.quadraticCurveTo(-14,-7,-12,-3);x.closePath();x.fill();olS(x,1.2);
   x.beginPath();x.arc(-15.5,-17,6.5,0,6.3);x.fill();olS(x,1.3);x.fillStyle='#ff8c1a';x.beginPath();x.moveTo(-21,-17.5);x.quadraticCurveTo(-27,-16.5,-26,-14);x.quadraticCurveTo(-23,-13,-20.5,-14.5);x.closePath();x.fill();olS(x,1);
   x.fillStyle=O;x.beginPath();x.arc(-16.5,-18.5,1.5,0,6.3);x.fill();x.fillStyle='#fff';x.fillRect(-16.9,-19.6,.9,.9);x.fillStyle='rgba(255,120,150,.6)';x.beginPath();x.ellipse(-13.5,-15,2,1.2,0,0,6.3);x.fill();
   x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(-14,-21,2.2,1.2,-.4,0,6.3);x.fill()}),
  lilo:p=>mkS(76,20,38,10,x=>{x.save();rrp(x,-34,-6.5,58,11,5.5);x.clip();x.fillStyle=p[0];x.fillRect(-35,-8,60,14);x.fillStyle=p[1];for(let i=0;i<7;i+=2)x.fillRect(-34+i*8.3,-8,8.3,14);x.fillStyle='rgba(255,255,255,.45)';x.fillRect(-35,-6,60,1.8);x.fillStyle='rgba(70,165,230,.42)';x.fillRect(-35,1.5,60,4);x.restore();
   rrp(x,-34,-6.5,58,11,5.5);olS(x,1.3);x.strokeStyle='rgba(20,12,28,.3)';x.lineWidth=.8;for(let i=1;i<7;i++){x.beginPath();x.moveTo(-34+i*8.3,-5.5);x.lineTo(-34+i*8.3,3.5);x.stroke()}
   x.fillStyle=p[1];rrp(x,22,-8,13,13,5.5);x.fill();olS(x,1.3);x.fillStyle='rgba(255,255,255,.55)';x.fillRect(24,-6.5,8,1.6);x.fillStyle='rgba(70,165,230,.42)';x.fillRect(23,1.5,11,3)}),
  dock:L=>{const len=L*T+6,h=Math.round(T*1.7);return mkS(len+4,h+12,2,10,x=>{const wd='#c08850',dk='#7a5230',lt='#e8b97e';
   for(const px of[6,len/2|0,len-7]){x.fillStyle=dk;x.beginPath();x.rect(px-2.8,4,5.6,h-6);x.fill();olS(x,1.1);x.fillStyle='rgba(255,220,170,.3)';x.fillRect(px-2,5,1.2,h-8)}
   x.strokeStyle='rgba(60,30,10,.7)';x.lineWidth=1.4;x.beginPath();x.moveTo(6,10);x.lineTo(len/2,22);x.lineTo(len-7,10);x.stroke();
   x.fillStyle=wd;x.beginPath();x.rect(0,0,len,7);x.fill();olS(x,1.3);x.fillStyle=lt;x.fillRect(.8,.8,len-1.6,1.6);x.strokeStyle='rgba(60,30,10,.5)';x.lineWidth=.9;for(let i=11;i<len;i+=11){x.beginPath();x.moveTo(i,1);x.lineTo(i,6.5);x.stroke()}
   x.fillStyle=dk;x.beginPath();x.rect(len-6,-8,4.5,8);x.fill();olS(x,1);x.strokeStyle='#e9d8b0';x.lineWidth=1.4;x.beginPath();x.ellipse(len-3.8,-4,4,1.5,0,0,6.3);x.stroke()})}};
 const SPR=new Map();function spr(k,v,f){const key=k+'|'+v+'|'+(f<0?1:0);let s=SPR.get(key);if(!s){const base=SPR.get(k+'|'+v+'|0')||(()=>{const b=ART9[k](k=='dock'?v:PAL[v%PAL.length]);SPR.set(k+'|'+v+'|0',b);return b})();s=f<0?flipS(base):base;SPR.set(key,s)}return s}
 const blit=(s,px,py)=>g.drawImage(s.c,px-s.ax,py-s.ay,s.w,s.h);
 // seat heights (world px above the feet) and names
 const SEATN={lounger:['Sun Lounger',18,.62],chair:['Deck Chair',15],bench:['Bench',15],dock:['Dock',19]};
 const SEATOBJ={37:['Bench',15],90:['Sun Lounger',18,.62,1],91:['Deck Chair',15,0,1]};
 // ---------------- generation ----------------
 let LAND=[],FLOAT=[],SEATS=[],POOLS=[],SIT=null;
 const solid=(x,y)=>{const b=tiles[y*W+x];return!!(b&&SOLID6[b])},ground=(x,y)=>{const b=tiles[y*W+x];return solid(x,y)&&b!=70&&!isObjId(b)};// natural ground (not the fishing boxes or objects)
 function surfRow(x){let y=1;while(y<H-3&&!tiles[y*W+x]&&!(wl[y*W+x]>0))y++;return wl[y*W+x]>0&&!tiles[y*W+x]?y:-1}
 function findPools(){const out=[];let x=2;while(x<W-2){const r=surfRow(x);if(r<0){x++;continue}let xb=x,rm=r;while(xb+1<W-2){const r2=surfRow(xb+1);if(r2<0||Math.abs(r2-rm)>1)break;xb++;rm=Math.min(rm,r2)}if(xb-x+1>=3)out.push({xa:x,xb,r:rm,w:xb-x+1});x=xb+1}return out}
 function bank(pl,d,plaza){const L=[],v=typeof VILL9!='undefined'&&VILL9.info&&VILL9.info.v;for(let i=1;i<=8;i++){const c=d<0?pl.xa-i:pl.xb+i;if(c<2||c>W-3)break;
   let gy=-1;for(let y=Math.max(2,pl.r-5);y<=pl.r+2;y++){if(wl[y*W+c]>0&&!tiles[y*W+c])break;if(solid(c,y)){gy=y;break}}if(gy<0)break;if(!ground(c,gy)){L.push({c,gy,ok:false});continue}
   let ok=gy>=pl.r-3&&Math.abs(c-DX)>2&&!trees.has((gy-1)*W+c)&&!(v&&c>=v.x0-2&&c<=v.x1+2);for(let y=gy-3;y<gy&&ok;y++)if(y<1||tiles[y*W+c]||wl[y*W+c]>0)ok=false;
   if(plaza)ok=ok&&tiles[gy*W+c]==47;L.push({c,gy,ok})}return L}
 function build(){LAND=[];FLOAT=[];SEATS=[];SIT=null;POOLS=[];if(typeof tiles=='undefined'||!tiles)return;const plaza=cur=='plaza',R=rr((50311+Math.floor(ws*7919))>>>0),used=new Uint8Array(W);
  POOLS=findPools();for(const pl of POOLS){try{plan(pl,R,used,plaza)}catch(e){console.error('SUMMER9',e)}if(plaza)break}
  LAND.sort((a,b)=>a.z-b.z)}
 function add(k,c0,c1,gy,f,v,z,extra){const it=Object.assign({k,c0,c1,gy:gy*T,x:(c0+c1+1)*T/2,f,v,z},extra||{});LAND.push(it);
  if(SEATN[k]&&k!='dock'){const[n,h,ln]=SEATN[k];SEATS.push({it,n,sx:it.x+(k=='lounger'?-10*f:0),fy:it.gy,hy:it.gy-h,f,ex:it.x,ey:it.gy,lean:ln||0})}return it}
 function plan(pl,R,used,plaza){const sides=[-1,1].map(d=>({d,L:bank(pl,d,plaza)})).map(s=>Object.assign(s,{n:s.L.filter(e=>e.ok).length}));
  const one=s=>{for(const e of s.L)if(e.ok&&!used[e.c])return e;return null};
  const two=s=>{for(let i=0;i+1<s.L.length;i++){const a=s.L[i],b=s.L[i+1];if(a.ok&&b.ok&&!used[a.c]&&!used[b.c]&&a.gy==b.gy)return[a,b,i]}return null};
  const mark=(...e)=>{for(const q of e)used[q.c]=1},cs=(a,b)=>[Math.min(a.c,b.c),Math.max(a.c,b.c)];
  const pv=R()*PAL.length|0,noF=new Set();
  if(plaza){for(const s of sides){const e=s.L.find(e=>e.ok&&Math.abs(e.c-(s.d<0?pl.xa:pl.xb))==3)||one(s);if(e){mark(e);add('chair',e.c,e.c,e.gy,-s.d,pv,1);break}}}
  else if(pl.w>=5){const[A,B]=sides.slice().sort((a,b)=>b.n-a.n);
   // A: umbrella over a sun lounger (umbrella on the far side, so the canopy hangs over the lounger)
   if(A.n>=2&&R()<.92){const pr=two(A);if(pr){const[c0,c1]=cs(pr[0],pr[1]),f=-A.d;mark(pr[0],pr[1]);add('lounger',c0,c1,pr[0].gy,f,pv,1);const far=A.L[pr[2]+2],near=A.L[pr[2]-1];
     for(const e of[far,near])if(e&&e.ok&&!used[e.c]&&e.gy==pr[0].gy){mark(e);add('umbrella',e.c,e.c,e.gy,f,(pv+1)%PAL.length,0);break}}}
   // B: a deck chair (sometimes with its own umbrella) or a bench
   if(B.n>=1){if(R()<.55){const e=one(B);if(e){mark(e);add('chair',e.c,e.c,e.gy,-B.d,(pv+2)%PAL.length,1);const i=B.L.indexOf(e),u=B.L[i+1];if(u&&u.ok&&!used[u.c]&&u.gy==e.gy&&R()<.6){mark(u);add('umbrella',u.c,u.c,u.gy,-B.d,(pv+3)%PAL.length,0)}}}
    else{const pr=two(B);if(pr){const[c0,c1]=cs(pr[0],pr[1]);mark(pr[0],pr[1]);add('bench',c0,c1,pr[0].gy,-B.d,0,1)}else{const e=one(B);if(e){mark(e);add('chair',e.c,e.c,e.gy,-B.d,(pv+2)%PAL.length,1)}}}}
   else if(A.n>=1&&R()<.6){const e=one(A);if(e){mark(e);add('chair',e.c,e.c,e.gy,-A.d,(pv+2)%PAL.length,1)}}
   // sandcastle (prefers sand) + beach ball on the shore
   if(R()<.45){const all=[...A.L,...B.L].filter(e=>e.ok&&!used[e.c]);const e=all.find(e=>tiles[e.gy*W+e.c]==8)||all[0];if(e){mark(e);add('castle',e.c,e.c,e.gy,1,0,1)}}
   const ballOnLand=R()<.5,wantBall=R()<.7;if(wantBall&&ballOnLand){const e=one(B)||one(A);if(e){mark(e);add('ball',e.c,e.c,e.gy,1,0,2)}}
   // a little dock on wide lakes, from the bank that is level with the water
   if(pl.w>=9&&R()<.7){for(const s of[A,B]){const e=s.L[0];if(!e||!(e.gy>=pl.r-1&&e.gy<=pl.r)||used[e.c])continue;const L=Math.min(3,Math.floor(pl.w/3.5)),dir=-s.d,y0=pl.r*T-8;used[e.c]=1;
     const edge=dir>0?(e.c+1)*T:e.c*T,it={k:'dock',c0:e.c,c1:e.c,gy:e.gy*T,x:edge,y0,f:dir,v:L,z:0,L};LAND.push(it);for(let i=0;i<L;i++)noF.add(dir>0?pl.xa+i:pl.xb-i);
     SEATS.push({it,n:'Dock',sx:edge+dir*(L*T-12),fy:y0+19,hy:y0,f:dir,ex:e.c*T+T/2,ey:e.gy*T,dock:1});break}}
   if(wantBall&&!ballOnLand)FLOAT.push(fl('ball',pl,.5,R,noF))}
  // floaties on the water
  const n=plaza?1:1+(pl.w>=10?1:0)+(pl.w>=16?1:0),kinds=['ring','duck','lilo'];if(R()<.5)kinds.reverse();if(plaza)kinds[0]='ring';
  for(let i=0;i<n;i++)FLOAT.push(fl(kinds[i%3],pl,(i+1)/(n+1),R,noF,(pv+i+1)%PAL.length))}
 function fl(k,pl,u,R,noF,v){let hx=pl.xa+Math.floor(u*pl.w);for(let j=0;j<pl.w&&noF.has(hx);j++)hx=pl.xa+((hx-pl.xa+1)%pl.w);noF.add(hx);
  const span=Math.max(0,Math.min(T*1.3,(pl.w*T)/(2*(1+pl.w/8))));return{k,x0:hx*T+T/2,span,r:pl.r,xa:pl.xa,xb:pl.xb,ph:R()*6.28,sp:.12+R()*.1,v:v|0,cx:hx*T+T/2,cy:pl.r*T,vis:0}}
 // ---------------- validity, drawing ----------------
 function ok(it){if(it.k=='dock')return solid(it.c0,it.gy/T);const gy=it.gy/T,tall=it.k=='umbrella'?2:1;for(let c=it.c0;c<=it.c1;c++){if(!solid(c,gy))return false;for(let y=gy-tall;y<gy;y++)if(tiles[y*W+c]||wl[y*W+c]>0)return false}return true}
 function seatOk(s){return s.it?ok(s.it):!!s.obj&&tiles[s.obj]==s.t}
 function drawLand(now){if(!entered||!LAND.length)return;const t=now/1000,vw=cv.width/ZM,vh=cv.height/ZM,x0=cam.x-140,x1=cam.x+vw+140,y0=cam.y-60,y1=cam.y+vh+140,ns=SIT?null:nearSeat();
  for(const it of LAND){if(it.x<x0||it.x>x1||it.gy<y0||it.gy>y1||!ok(it))continue;
   if(it.k=='dock'){const s=spr('dock',it.L,it.f),px=it.x-cam.x;g.drawImage(s.c,it.f>0?px-2:px-s.w+2,it.y0-cam.y-10,s.w,s.h);continue}
   const s=spr(it.k,it.v,it.f);blit(s,it.x-cam.x,it.gy-cam.y-(it.k=='ball'?9:0))}
  if(ns&&ns.s.it){const s=ns.s,a=.55+.35*Math.sin(t*5),px=s.sx-cam.x,py=s.hy-cam.y-26-Math.sin(t*3)*2;g.save();g.globalAlpha=a;g.fillStyle='#fff';g.beginPath();g.moveTo(px,py-5);g.lineTo(px+3.5,py);g.lineTo(px,py+5);g.lineTo(px-3.5,py);g.closePath();g.fill();g.restore()}}
 function drawFloat(now){if(!entered||!FLOAT.length||typeof WATER9=='undefined')return;const t=now/1000,vw=cv.width/ZM,vh=cv.height/ZM;
  for(const f of FLOAT){const x=f.x0+Math.sin(t*f.sp+f.ph)*f.span;f.vis=0;if(x<cam.x-80||x>cam.x+vw+80||f.r*T<cam.y-80||f.r*T>cam.y+vh+80)continue;
   const s=WATER9.surfAt(x,(f.r-2)*T);if(s==null)continue;const h=WATER9.hgt,y=s+h(x,t,s)*.9+Math.sin(t*1.7+f.ph)*.7,tl=Math.max(-.35,Math.min(.35,(h(x+12,t,s)-h(x-12,t,s))/24*.9));f.cx=x;f.cy=y;f.vis=1;
   const sp=spr(f.k,f.v,1);g.save();g.translate(x-cam.x,y-cam.y-(f.k=='ball'?6:f.k=='duck'?1:0));g.rotate(tl+(f.k=='ball'?Math.sin(t*.6+f.ph)*.6:0));g.drawImage(sp.c,-sp.ax,-sp.ay,sp.w,sp.h);g.restore()}}
 {const _dn=drawNPCs;drawNPCs=function(now){try{drawLand(now)}catch(e){if(!drawLand.err){drawLand.err=1;console.error(e)}}return _dn.apply(this,arguments)}}
 {const _dw=drawWater;drawWater=function(x0,x1,y0,y1,now){const r=_dw.apply(this,arguments);try{drawFloat(now)}catch(e){if(!drawFloat.err){drawFloat.err=1;console.error(e)}}return r}}
 {const _g=gen;gen=function(){const r=_g.apply(this,arguments);try{build()}catch(e){console.error('SUMMER9 build',e)}return r}}
 // ---------------- sitting ----------------
 function objSeat(){try{const n=OBJ6.near();if(!n||!SEATOBJ[n.o.t])return null;const x=n.k%W,y=n.k/W|0,[nm,h,ln,fo]=SEATOBJ[n.o.t],fy=(y+1)*T;return{n:nm,sx:x*T+T/2-(ln?10:0),fy,hy:fy-h,lean:ln||0,f:fo||(P.f>0?1:-1),ex:x*T+T/2,ey:fy,obj:n.k,t:n.o.t}}catch(_){return null}}
 function nearSeat(){if(!entered)return null;const fx=P.x,fy=P.y+P.h;let best=null,bd=1e9;
  for(const s of SEATS){const dx=Math.abs(fx-s.sx),dy=Math.abs(fy-s.fy);let d=dx<T*1.4&&dy<T*1.6?dx+dy*.5:1e9;if(s.dock){const ax=Math.abs(fx-s.ex),ay=Math.abs(fy-s.ey);if(ax<T*1.3&&ay<T*1.3)d=Math.min(d,ax+ay*.5)}if(d<bd&&seatOk(s)){bd=d;best=s}}
  const o=objSeat();if(o){const d=Math.abs(fx-o.sx)+Math.abs(fy-o.fy)*.5;if(d<bd){bd=d;best=o}}return best?{s:best,d:bd}:null}
 function objDist(){try{const n=OBJ6.near();if(!n||SEATOBJ[n.o.t])return 1e9;return Math.abs(P.x-(n.k%W*T+T/2))+Math.abs(P.y+P.h/2-((n.k/W|0)*T+T/2))*.5}catch(_){return 1e9}}
 function npcDist(npc){return npc?Math.abs(P.x-(npc.x*T+T/2)):1e9}
 function sit(s){SIT=s;P.vx=0;P.vy=0;P.f=s.f;try{snd(330,.08,'triangle',.04,.7);noise(.05,900,.04)}catch(_){}}
 function stand(){const s=SIT;SIT=null;if(!s)return;if(s.dock){P.x=s.ex;P.y=s.ey-P.h-1}else P.y=s.fy-P.h-1;P.vy=0}
 const MOVE=['a','d','w','s',' ','arrowleft','arrowright','arrowup','arrowdown'];
 {const _u=update;update=function(dt){if(SIT){let mv=false;for(const k of MOVE)if(K[k])mv=true;if(mv||!entered||!seatOk(SIT))stand()}const r=_u.apply(this,arguments);if(SIT){P.x=SIT.sx;P.y=SIT.fy-P.h;P.vx=0;P.vy=0;P.g=true;P.f=SIT.f;try{P.hp=Math.min(maxHP(),P.hp+3*dt)}catch(_){}/* resting heals a little */}return r}}
 {const _i=interact;interact=function(){if(SIT&&!dlgOpen){stand();return}if(!dlgOpen&&!creatorOn&&!showInv&&menuEl.style.display=='none'){const ns=nearSeat();if(ns&&ns.d<=objDist()&&ns.d<=npcDist(nearNPC())){sit(ns.s);return}}return _i.apply(this,arguments)}}
 {const _pt=OBJ6.promptText;OBJ6.promptText=function(npc){if(SIT)return 'Sitting on the '+SIT.n+'  ·  E or move to stand up';const ns=nearSeat();if(ns&&ns.d<=objDist()&&ns.d<=npcDist(npc))return 'Press E to sit on the '+ns.s.n;return _pt.apply(this,arguments)}}
 {const _lw=loadWorld;loadWorld=function(){SIT=null;return _lw.apply(this,arguments)}}
 AC6.SIT=()=>SIT?{h:SIT.fy-SIT.hy,lean:SIT.lean||0}:0;
 // ---------------- placeable store objects (tiles 90-92, 97, 98) ----------------
 const OB={90:{k:'sun_lounger',n:'Sun Lounger',c:'#ff8fa0',hard:3,price:180,lv:3,a:['lounger',0,1]},91:{k:'deck_chair',n:'Deck Chair',c:'#4fd0d6',hard:3,price:120,lv:2,a:['chair',1,1]},
  92:{k:'beach_umbrella',n:'Beach Umbrella',c:'#ff6f91',hard:2,price:150,lv:2,a:['umbrella',0,1]},97:{k:'sandcastle',n:'Sandcastle',c:'#f1d79b',hard:1,price:60,lv:1,a:['castle',0,1]},98:{k:'beach_ball',n:'Beach Ball',c:'#ff4d6d',hard:1,price:40,lv:1,a:['ball',0,1]}};
 for(const id in OB){const d=OB[id];ODEF[id]={k:d.k,n:d.n,cat:'deco',c:d.c,hard:d.hard,price:d.price};BLK[id]=[d.n,d.c,d.hard];PRICE[id]=d.price;SOLID6[id]=0;LVREQ[id]=d.lv;
  ART[d.k]=(gg,o)=>{const[k,v,f]=d.a,s=spr(k,v,f),icon=gg.canvas!==cv,sc=icon?Math.min(1,(T-2)/s.w*1.1,(T-2)/s.h*1.1):1;gg.save();gg.translate(T/2,k=='ball'?-9*sc:0);gg.scale(sc,sc);gg.drawImage(s.c,-s.ax,-s.ay,s.w,s.h);gg.restore()}}
 ART.seat=(gg)=>{const s=spr('bench',0,1),icon=gg.canvas!==cv,sc=icon?(T-2)/s.w:1;gg.save();gg.translate(T/2,0);gg.scale(sc,sc);gg.drawImage(s.c,-s.ax,-s.ay,s.w,s.h);gg.restore()};
 return{build,nearSeat,sit,stand,get SIT(){return SIT},get LAND(){return LAND},get FLOAT(){return FLOAT},get SEATS(){return SEATS},get POOLS(){return POOLS},ok,spr,OB}})();
