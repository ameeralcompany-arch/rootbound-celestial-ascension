// ===== WALL9: a background-wall layer (house interiors). One byte per tile in bw[] (0 = none, 1-9 = a wall type), drawn behind blocks,
// trees and characters, never solid. Painted per 8x8-tile chunk into a cached canvas (like TILE7) and repainted only when a wall in that
// chunk changes (a version number per chunk, no per-frame hashing); chunks without walls cost nothing. Saved with the world edits under
// edits.bw = {tileIndex: wallId} (0 = a generated wall that was removed), so old saves simply load with no walls. Wall items are the
// inventory keys 320-328 (registered as materials so they stack, sell and survive saves) and are listed with the blocks in the store
// and inventory. Placing / breaking walls is wired in 99-zzzz-build.js. =====
const WALL9=(()=>{
 const N=W*H,bw=new Uint8Array(N),CH=8,NCX=Math.ceil(W/CH),NCY=Math.ceil(H/CH),ver=new Uint32Array(NCX*NCY),cntc=new Uint16Array(NCX*NCY),cache=new Map(),MAXC=60;let cKey='';
 // id: [name, colour, tool category, price]
 const D={1:['Oak Panel Wall','#8a5a32','wood'],2:['Stone Brick Wall','#80868a','stone'],3:['Cream Floral Wallpaper','#efe2c4','soft'],4:['Red Brick Wall','#a8492f','stone'],5:['Whitewash Plaster Wall','#ece6da','soft'],
  6:['Dark Timber Wall','#4a3020','wood'],7:['Blue Striped Wallpaper','#7d9cc4','soft'],8:['Mossy Stone Wall','#7d8a78','stone'],9:['Cottage Window Wall','#ece6da','soft']};
 const KEY0=319,key=id=>KEY0+id,idOf=k=>{k=+k;return k>KEY0&&k<=KEY0+9?k-KEY0:0},isKey=k=>idOf(k)>0;
 const PR={1:6,2:6,3:8,4:7,5:6,6:7,7:8,8:7,9:12};
 for(const id in D){const k=key(+id);MAT[k]={n:D[id][0],c:D[id][1],p:Math.max(1,PR[id]>>1)};}
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296,sh=(c,f)=>mixc(c[0]=='#'?c:'#'+(c.match(/\d+/g)||[0,0,0]).slice(0,3).map(v=>(+v|0).toString(16).padStart(2,'0')).join(''),f);
 const lg=(x,x0,y0,x1,y1,st)=>{const g=x.createLinearGradient(x0,y0,x1,y1);st.forEach((c,i)=>g.addColorStop(i/(st.length-1),c));return g};
 function brk(x,R,mortar,rh,bwd,base,vr){x.fillStyle=mortar;x.fillRect(0,0,T,T);for(let r=0;r*rh<T;r++)for(let k=-1;k*bwd<T+bwd;k++){const px=k*bwd+(r%2?bwd/2:0),py=r*rh,c=sh(base,1-vr/2+R()*vr);x.fillStyle=lg(x,0,py,0,py+rh,[sh(c,1.12),c,sh(c,.86)]);x.fillRect(px+1.5,py+1.5,bwd-3,rh-3)}}
 const PT={
  1(x,R){for(let i=0;i<4;i++){const px=i*12,c=sh('#8a5a32',.88+R()*.22);x.fillStyle=lg(x,px,0,px+12,0,[sh(c,1.12),c,sh(c,.84)]);x.fillRect(px,0,12,T);x.strokeStyle='rgba(50,28,12,.35)';x.lineWidth=.9;for(let j=0;j<2;j++){const gx=px+3+j*5+R()*2;x.beginPath();x.moveTo(gx,0);x.bezierCurveTo(gx+(R()-.5)*3,16,gx+(R()-.5)*3,32,gx,T);x.stroke()}x.fillStyle='rgba(30,16,6,.55)';x.fillRect(px+11,0,1.2,T)}},
  2(x,R){brk(x,R,'#4e5458',16,24,'#80868a',.2)},
  3(x,R){x.fillStyle='#efe2c4';x.fillRect(0,0,T,T);x.fillStyle='rgba(200,180,140,.35)';for(let i=0;i<T;i+=12)x.fillRect(i,0,1.5,T);
   for(const[px,py]of[[6,8],[30,20],[18,34],[42,44],[6,44]]){x.fillStyle='#d98aa0';for(let j=0;j<5;j++){const a=j*1.2566;x.beginPath();x.arc(px+Math.cos(a)*2.2,py+Math.sin(a)*2.2,1.7,0,6.3);x.fill()}x.fillStyle='#f2c14e';x.beginPath();x.arc(px,py,1.1,0,6.3);x.fill();x.fillStyle='#7aa860';x.beginPath();x.ellipse(px+4,py+3,2.4,1.1,.6,0,6.3);x.fill()}},
  4(x,R){brk(x,R,'#5a3428',12,16,'#a8492f',.24)},
  5(x,R){x.fillStyle=lg(x,0,0,T,T,['#f2ece2','#e2dace']);x.fillRect(0,0,T,T);for(let i=0;i<46;i++){x.fillStyle=R()<.5?'rgba(190,175,150,.35)':'rgba(255,255,255,.5)';x.fillRect(R()*T,R()*T,1.5+R()*2,1.5+R()*2)}x.strokeStyle='rgba(170,150,120,.25)';x.lineWidth=2;x.beginPath();x.moveTo(R()*T,0);x.quadraticCurveTo(R()*T,T/2,R()*T,T);x.stroke()},
  6(x,R){for(let r=0;r<4;r++){const py=r*12,c=sh('#4a3020',.85+R()*.3);x.fillStyle=lg(x,0,py,0,py+12,[sh(c,1.2),c,sh(c,.8)]);x.fillRect(0,py,T,12);x.fillStyle='rgba(20,10,4,.6)';x.fillRect(0,py+11,T,1.2);x.fillRect((r*17+5)%T,py,1.2,12);x.fillStyle='#1c120a';x.beginPath();x.arc(((r*17+5)%T)+5,py+6,1,0,6.3);x.fill()}},
  7(x,R){x.fillStyle='#7d9cc4';x.fillRect(0,0,T,T);for(let i=0;i<T;i+=8){x.fillStyle='rgba(255,255,255,.22)';x.fillRect(i,0,3,T);x.fillStyle='rgba(30,50,90,.18)';x.fillRect(i+5,0,1,T)}},
  8(x,R){brk(x,R,'#454c46',16,24,'#7d8a78',.22);for(let i=0;i<14;i++){x.fillStyle='rgba('+(60+R()*30|0)+','+(120+R()*50|0)+','+(50+R()*25|0)+','+(.45+R()*.35)+')';x.beginPath();x.arc(R()*T,(R()*3|0)*16+R()*4,1.4+R()*2.6,0,6.3);x.fill()}},
  9(x,R){PT[5](x,R);x.fillStyle='#2c1a0f';x.fillRect(7,7,T-14,T-14);const sky=lg(x,0,9,0,T-9,['#cfeaff','#9fd0f2','#e8f6ff']);x.fillStyle=sky;x.fillRect(10,10,T-20,T-20);x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.moveTo(13,T-12);x.lineTo(22,11);x.lineTo(26,11);x.lineTo(17,T-12);x.closePath();x.fill();
   x.fillStyle='#6b4528';x.fillRect(T/2-1.5,10,3,T-20);x.fillRect(10,T/2-1.5,T-20,3);x.fillStyle='#8a5e38';x.fillRect(5,T-9,T-10,4);x.fillStyle='rgba(255,230,190,.35)';x.fillRect(5,T-9,T-10,1)}};
 // a wall is a darker, slightly cooler version of its texture so it reads as "behind"; the window keeps its light
 const SPC={};function sprite(id,v){const k=id*4+v;if(SPC[k])return SPC[k];const c=document.createElement('canvas');c.width=c.height=T;const x=c.getContext('2d');PT[id](x,rr(id*613+v*97+5));
  x.globalCompositeOperation='source-atop';x.fillStyle=id==9?'rgba(24,18,36,.22)':'rgba(24,18,36,.36)';x.fillRect(0,0,T,T);x.fillStyle=lg(x,0,0,0,T,['rgba(255,255,255,.05)','rgba(0,0,0,0)','rgba(0,0,0,.12)']);x.fillRect(0,0,T,T);return SPC[k]=c}
 // ---- data
 const cix=k=>((k/W|0)/CH|0)*NCX+((k%W)/CH|0);
 function set(k,id){id=id|0;if(k<0||k>=N||id<0||id>9||bw[k]===id)return false;const c=cix(k);if(!bw[k]&&id)cntc[c]++;else if(bw[k]&&!id)cntc[c]--;bw[k]=id;ver[c]++;return true}
 function clear(){bw.fill(0);cntc.fill(0);for(let i=0;i<ver.length;i++)ver[i]++}
 // player edits go into edits.bw (saved with the world every few seconds by the normal save loop)
 function edit(k,id){if(!set(k,id))return false;try{if(!edits.bw||typeof edits.bw!='object')edits.bw={};edits.bw[k]=id;dirty=1}catch(_){}return true}
 function applySaved(o){if(!o||typeof o!='object')return;for(const k in o){const n=+k,v=o[k]|0;if(Number.isInteger(n)&&n>=0&&n<N&&v>=0&&v<=9)set(n,v)}}
 const clean=o=>{const r={};if(!o||typeof o!='object')return r;let n=0;for(const k in o){const i=+k,v=o[k]|0;if(Number.isInteger(i)&&i>=0&&i<N&&v>=0&&v<=9){r[i]=v;if(++n>N)break}}return r};
 // ---- rendering (chunk cache at the screen's real scale)
 function paintChunk(c,cx,cy){for(let y=cy*CH;y<cy*CH+CH&&y<H;y++)for(let x=cx*CH;x<cx*CH+CH&&x<W;x++){const k=y*W+x,id=bw[k];if(!id)continue;const px=(x-cx*CH)*T,py=(y-cy*CH)*T;c.drawImage(sprite(id,(x*7+y*13)%3),px,py,T,T);
   // soft inner edges where the wall ends, so a wall patch has depth instead of a hard cut-out look
   if(x>0&&!bw[k-1]){c.fillStyle='rgba(10,8,20,.28)';c.fillRect(px,py,3,T)}if(x<W-1&&!bw[k+1]){c.fillStyle='rgba(10,8,20,.28)';c.fillRect(px+T-3,py,3,T)}if(y>0&&!bw[k-W]){c.fillStyle='rgba(10,8,20,.32)';c.fillRect(px,py,T,4)}if(y<H-1&&!bw[k+W]){c.fillStyle='rgba(10,8,20,.2)';c.fillRect(px,py+T-2,T,2)}}}
 function draw(x0,x1,y0,y1){const m=g.getTransform(),sc=Math.min(4,Math.max(.25,Math.hypot(m.a,m.b))),k0=sc.toFixed(3)+'|'+g.imageSmoothingEnabled;if(k0!==cKey){cKey=k0;cache.clear()}const t=performance.now(),CW=CH*T;
  const blit=!m.b&&!m.c&&Math.abs(m.a-sc)<.001&&Math.abs(m.d-sc)<.001;if(blit)g.setTransform(1,0,0,1,0,0);// whole-pixel copies: no seams
  for(let cy=Math.max(0,Math.floor(y0/CH));cy<=Math.min(NCY-1,Math.floor(y1/CH));cy++)for(let cx=Math.max(0,Math.floor(x0/CH));cx<=Math.min(NCX-1,Math.floor(x1/CH));cx++){const ci=cy*NCX+cx;if(!cntc[ci])continue;let e=cache.get(ci);
   if(!e||e.v!==ver[ci]){if(!e){e={c:document.createElement('canvas')};e.c.width=e.c.height=Math.ceil(CW*sc);cache.set(ci,e)}e.v=ver[ci];const c=e.c.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,e.c.width,e.c.height);c.imageSmoothingEnabled=g.imageSmoothingEnabled;c.setTransform(sc,0,0,sc,0,0);paintChunk(c,cx,cy)}
   e.u=t;if(blit)g.drawImage(e.c,Math.round((cx*CW-cam.x)*m.a+m.e),Math.round((cy*CW-cam.y)*m.d+m.f));else g.drawImage(e.c,cx*CW-cam.x,cy*CW-cam.y,CW,CW)}
  if(blit)g.setTransform(m);
  if(cache.size>MAXC){const old=[...cache].sort((a,b)=>a[1].u-b[1].u).slice(0,cache.size-MAXC);for(const[k]of old)cache.delete(k)}}
 // walls go down first: TILE7.draw paints the blocks right after (trees, characters and the rest come later in the frame)
 {const _d=TILE7.draw;TILE7.draw=function(x0,x1,y0,y1,now){try{if(cur!='plaza'||cntc.some(Boolean))draw(x0,x1,y0,y1)}catch(e){if(!WALL9.err){WALL9.err=1;console.error('WALL9',e)}}return _d.apply(this,arguments)}}
 // ---- world lifecycle: cleared before generation (generators may add walls), saved overrides applied after the world's edits load
 {const _gb=genBase;genBase=function(){clear();return _gb.apply(this,arguments)}}
 {const _lw=loadWorld;loadWorld=function(n,e){const r=_lw.apply(this,arguments);try{if(cur!='plaza')applySaved(edits.bw)}catch(err){console.error('WALL9 load',err)}return r}}
 {const _ce=cleanEdits;cleanEdits=function(e){const o=_ce.apply(this,arguments);try{if(e&&typeof e=='object'){if(e.bw)o.bw=clean(e.bw);if(e.g===1||e.g===2)o.g=e.g}}catch(_){}return o}}
 // ---- items: icons (inventory, hotbar, drops, store) and the inventory / store category
 {const _mi=matIcon;matIcon=function(x,k,S){const id=idOf(k);if(!id)return _mi.apply(this,arguments);x.save();x.scale(S/48,S/48);x.fillStyle='rgba(0,0,0,.28)';x.fillRect(9,11,32,32);x.drawImage(sprite(id,0),6,6,34,34);x.strokeStyle='#1b1430';x.lineWidth=2;x.strokeRect(6,6,34,34);
   x.fillStyle='rgba(255,255,255,.85)';x.font='700 9px sans-serif';x.fillText('WALL',10,46);x.restore()}}
 {const _iu=iconURL;iconURL=function(k){const id=idOf(k);if(!id)return _iu.apply(this,arguments);if(ICON[k])return ICON[k];const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
   x.fillStyle='rgba(0,0,0,.25)';x.fillRect(12,14,46,46);x.drawImage(sprite(id,0),8,8,46,46);x.strokeStyle='#1b1430';x.lineWidth=3;x.strokeRect(8,8,46,46);x.fillStyle='#fff';x.strokeStyle='#1b1430';x.lineWidth=3;x.font='800 11px sans-serif';x.strokeText('WALL',14,62);x.fillText('WALL',14,62);return ICON[k]=c.toDataURL()}}
 return{bw,D,key,idOf,isKey,set,edit,clear,draw,sprite,applySaved,clean,get count(){let n=0;for(const v of cntc)n+=v;return n},cntc,ver}})();
