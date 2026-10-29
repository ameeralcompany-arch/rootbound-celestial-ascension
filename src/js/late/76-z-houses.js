// ===== HOUSE7: pre-rendered Plaza buildings. Every NPC lives in a house whose architecture shows the NPC's class
// (Mage tower, Knight keep, Archer lodge, Samurai teahouse, Reaper crypt, Demon manor, Gunslinger trading post, Berserker longhouse,
// Brawler dojo, Stormcaller windmill bakery, Druid lodge, Ninja hideout, Elementalist shrine) plus the World Gate, the Sky Beam dais,
// the town map board, the pond pier and the two sky islands. Each facade is painted once per zoom bucket into an offscreen canvas,
// with a half-resolution glow layer (windows, runes, fires) that is added with 'lighter' and brightens at night. Facades are drawn
// behind every character and are not solid, so nothing above the street can trap the player. Per frame: one or two drawImage calls
// per visible building plus a few cheap animated strokes (banners, sails, flames); no per-frame gradients or shadowBlur. =====
const HOUSE7=(()=>{
 const OL='#1e1430',TAU=Math.PI*2,PI=Math.PI,{sin,cos,abs,min,max,floor,round,ceil,hypot}=Math;
 const rng=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296,hs=s=>[...s].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7);
 const M=(c,k)=>mixc(c,k);
 // ---------- drawing kit (x = facade ctx, q = glow ctx; both use facade px with the ground at y=H)
 function pth(x,a){x.beginPath();x.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)x.lineTo(a[i],a[i+1]);x.closePath()}
 function ink(x,lw){x.strokeStyle=OL;x.lineWidth=lw==null?2.4:lw;x.lineJoin='round';x.lineCap='round';x.stroke()}
 function poly(x,a,f,lw){pth(x,a);x.fillStyle=f;x.fill();if(lw!==0)ink(x,lw)}
 function box(x,X,Y,w,h,f,lw,r){x.beginPath();if(r)x.roundRect(X,Y,w,h,r);else x.rect(X,Y,w,h);x.fillStyle=f;x.fill();if(lw!==0)ink(x,lw)}
 function ell(x,X,Y,rx,ry,f,lw){x.beginPath();x.ellipse(X,Y,rx,ry,0,0,TAU);x.fillStyle=f;x.fill();if(lw!==0)ink(x,lw)}
 function lin(x,x0,y0,x1,y1,st){const g=x.createLinearGradient(x0,y0,x1,y1);st.forEach((c,i)=>g.addColorStop(i/(st.length-1),c));return g}
 function seg(x,pts,w,c){x.lineCap=x.lineJoin='round';x.beginPath();x.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)x.lineTo(pts[i],pts[i+1]);x.strokeStyle=OL;x.lineWidth=w+2.4;x.stroke();x.strokeStyle=c;x.lineWidth=w;x.stroke()}
 function clip(x,a,fn){x.save();if(typeof a=='function')a();else pth(x,a);x.clip();fn();x.restore()}
 function side(x,X,Y,w,h,k){const g=x.createLinearGradient(X,0,X+w,0);g.addColorStop(0,'rgba(16,8,32,'+(k||.3)+')');g.addColorStop(.2,'rgba(16,8,32,0)');g.addColorStop(.8,'rgba(16,8,32,0)');g.addColorStop(1,'rgba(16,8,32,'+((k||.3)+.06)+')');x.fillStyle=g;x.fillRect(X,Y,w,h)}
 function eave(x,X,Y,w,d){const g=x.createLinearGradient(0,Y,0,Y+(d||34));g.addColorStop(0,'rgba(16,8,32,.42)');g.addColorStop(1,'rgba(16,8,32,0)');x.fillStyle=g;x.fillRect(X,Y,w,d||34)}
 function bricks(x,X,Y,w,h,bw,bh,c,R,ml){x.save();x.beginPath();x.rect(X,Y,w,h);x.clip();x.fillStyle=M(c,.7);x.fillRect(X,Y,w,h);let r=0;for(let yy=Y+h;yy>Y-bh;yy-=bh,r++){const off=(r%2)*bw/2;for(let xx=X-off;xx<X+w;xx+=bw){x.fillStyle=M(c,.84+R()*.3);x.fillRect(xx+1.2,yy-bh+1.2,bw-2.4,bh-2.4);if(R()<.3){x.fillStyle='rgba(255,255,255,.12)';x.fillRect(xx+2,yy-bh+2,bw-5,2)}}}x.restore();if(ml){x.strokeStyle=ml;x.lineWidth=1;x.strokeRect(X,Y,w,h)}}
 function stones(x,X,Y,w,h,c,R,sz){x.save();x.beginPath();x.rect(X,Y,w,h);x.clip();x.fillStyle=M(c,.62);x.fillRect(X,Y,w,h);const s=sz||26;for(let yy=Y;yy<Y+h;yy+=s*.72)for(let xx=X-s+((yy/s|0)%2)*s*.5;xx<X+w+s;xx+=s*(.8+R()*.4)){x.beginPath();x.ellipse(xx+s*.4,yy+s*.36,s*(.36+R()*.12),s*(.27+R()*.08),R()*.4-.2,0,TAU);x.fillStyle=M(c,.85+R()*.35);x.fill();x.strokeStyle='rgba(20,10,30,.45)';x.lineWidth=1.2;x.stroke()}x.restore()}
 function planks(x,X,Y,w,h,pw,c,R,horiz){x.save();x.beginPath();x.rect(X,Y,w,h);x.clip();const n=ceil((horiz?h:w)/pw);for(let i=0;i<n;i++){const k=.86+R()*.24;x.fillStyle=M(c,k);if(horiz)x.fillRect(X,Y+i*pw,w,pw);else x.fillRect(X+i*pw,Y,pw,h);x.strokeStyle='rgba(30,15,10,.45)';x.lineWidth=1.3;x.beginPath();if(horiz){x.moveTo(X,Y+i*pw);x.lineTo(X+w,Y+i*pw)}else{x.moveTo(X+i*pw,Y);x.lineTo(X+i*pw,Y+h)}x.stroke();x.strokeStyle='rgba(30,15,10,.18)';x.lineWidth=1;for(let j=0;j<2;j++){x.beginPath();if(horiz){const yy=Y+i*pw+pw*(.3+R()*.4);x.moveTo(X+R()*w*.3,yy);x.lineTo(X+w*(.5+R()*.5),yy)}else{const xx=X+i*pw+pw*(.3+R()*.4);x.moveTo(xx,Y+R()*h*.3);x.lineTo(xx,Y+h*(.5+R()*.5))}x.stroke()}}x.restore()}
 function shingles(x,X,Y,w,h,sw,sh_,c,R){for(let yy=Y,r=0;yy<Y+h;yy+=sh_,r++){const off=(r%2)*sw/2;for(let xx=X-off-sw;xx<X+w+sw;xx+=sw){x.fillStyle=M(c,.82+R()*.3);x.beginPath();x.moveTo(xx,yy);x.lineTo(xx+sw,yy);x.lineTo(xx+sw,yy+sh_*.75);x.quadraticCurveTo(xx+sw/2,yy+sh_*1.35,xx,yy+sh_*.75);x.closePath();x.fill();x.strokeStyle='rgba(20,10,30,.38)';x.lineWidth=1.2;x.stroke()}}}
 function tiles2(x,X,Y,w,h,sw,c,R){/* ridged clay/glazed tiles (vertical rolls) */for(let xx=X;xx<X+w;xx+=sw){x.fillStyle=lin(x,xx,0,xx+sw,0,[M(c,.7),M(c,1.18),M(c,.82)]);x.fillRect(xx,Y,sw,h);x.strokeStyle='rgba(20,10,30,.35)';x.lineWidth=1;x.beginPath();x.moveTo(xx,Y);x.lineTo(xx,Y+h);x.stroke()}for(let yy=Y+h*.33;yy<Y+h;yy+=h*.33){x.strokeStyle='rgba(20,10,30,.22)';x.beginPath();x.moveTo(X,yy);x.lineTo(X+w,yy);x.stroke()}}
 function shapeW(x,X,Y,w,h,o){x.beginPath();if(o.round)x.ellipse(X+w/2,Y+h/2,w/2,h/2,0,0,TAU);else if(o.arch==2){x.moveTo(X,Y+h);x.lineTo(X,Y+w*.55);x.quadraticCurveTo(X,Y+w*.05,X+w/2,Y-w*.32);x.quadraticCurveTo(X+w,Y+w*.05,X+w,Y+w*.55);x.lineTo(X+w,Y+h);x.closePath()}else if(o.arch){x.moveTo(X,Y+h);x.lineTo(X,Y+w/2);x.arc(X+w/2,Y+w/2,w/2,PI,0);x.lineTo(X+w,Y+h);x.closePath()}else x.rect(X,Y,w,h)}
 function glowS(q,col,blur,fn){q.save();q.shadowColor=col;q.shadowBlur=blur;q.fillStyle=col;q.strokeStyle=col;fn();q.restore()}
 // window: frame, warm glass, panes, glare, optional sill/shutters; also lights the glow layer
 function win(x,q,X,Y,w,h,o){o=o||{};const fr=o.fr||'#4a3020',gl=o.gl||'#ffd98a';const f=o.round?0:5;
  shapeW(x,X-f,Y-f,w+f*2,h+f*2,o.round?{round:1,}:o);if(o.round){x.beginPath();x.ellipse(X+w/2,Y+h/2,w/2+6,h/2+6,0,0,TAU)}x.fillStyle=fr;x.fill();ink(x,2);
  shapeW(x,X,Y,w,h,o);x.fillStyle=lin(x,0,Y,0,Y+h,[M(gl,1.08),M(gl,.8),M(gl,.62)]);x.fill();
  x.save();shapeW(x,X,Y,w,h,o);x.clip();x.fillStyle='rgba(255,255,255,.3)';x.beginPath();x.moveTo(X+3,Y+h*.62);x.lineTo(X+w*.48,Y-4);x.lineTo(X+w*.66,Y-4);x.lineTo(X+3,Y+h*.86);x.closePath();x.fill();
  if(o.cur){x.fillStyle=o.cur;for(const s of[0,1]){x.beginPath();const cx=s?X+w:X;x.moveTo(cx,Y-6);x.quadraticCurveTo(cx+(s?-1:1)*w*.32,Y+h*.35,cx+(s?-1:1)*w*.14,Y+h);x.lineTo(cx,Y+h);x.closePath();x.fill()}}
  x.strokeStyle=fr;x.lineWidth=o.pl||3;const c=o.c==null?2:o.c,r=o.r==null?2:o.r;x.beginPath();for(let i=1;i<c;i++){x.moveTo(X+w*i/c,Y-w);x.lineTo(X+w*i/c,Y+h)}for(let i=1;i<r;i++){x.moveTo(X,Y+h*i/r);x.lineTo(X+w,Y+h*i/r)}x.stroke();x.restore();
  shapeW(x,X,Y,w,h,o);ink(x,1.5);
  if(o.sill)box(x,X-9,Y+h+2,w+18,8,fr,1.6,2);
  if(o.shut){for(const s of[-1,1]){const sx=s<0?X-w*.46-6:X+w+6;box(x,sx,Y-3,w*.46,h+6,o.shut,1.8,2);x.strokeStyle='rgba(20,10,20,.35)';x.lineWidth=1.2;for(let yy=Y+5;yy<Y+h;yy+=7){x.beginPath();x.moveTo(sx+3,yy);x.lineTo(sx+w*.46-3,yy);x.stroke()}}}
  if(o.box){box(x,X-6,Y+h+4,w+12,14,o.box,1.6,3);for(let i=0;i<5;i++)ell(x,X-2+i*(w+4)/4,Y+h+2,5,5,['#ff8fb0','#ffe27a','#ffffff','#ff9a5a','#c9a2ff'][i%5],1)}
  glowS(q,gl,22,()=>{shapeW(q,X,Y,w,h,o);q.globalAlpha=.85;q.fill()})}
 function door(x,X,Y,w,h,c,o){o=o||{};const fr=o.fr||M(c,.6);shapeW(x,X-7,Y-7,w+14,h+7,o);x.fillStyle=fr;x.fill();ink(x,2.2);
  x.save();shapeW(x,X,Y,w,h,o);x.clip();planks(x,X,Y-w,w,h+w,o.pw||w/3,c,o.R||Math.random,false);if(o.band){x.fillStyle=o.band;for(const yy of[.22,.72]){x.fillRect(X,Y+h*yy,w,6)}x.fillStyle='rgba(255,255,255,.25)';for(const yy of[.22,.72])for(let i=0;i<3;i++)x.fillRect(X+w*(.2+i*.3),Y+h*yy+1,3,3)}x.restore();shapeW(x,X,Y,w,h,o);ink(x,1.8);
  ell(x,X+w*(o.kx||.78),Y+h*.56,3.6,3.6,o.knob||'#ffd24a',1.2)}
 function gable(x,xl,xr,yb,yt,c,R,o){o=o||{};const cx=(xl+xr)/2,a=[xl,yb,cx,yt,xr,yb];pth(x,a);x.fillStyle=M(c,.8);x.fill();clip(x,a,()=>{(o.tex||shingles)(x,xl,yt,xr-xl,yb-yt,o.sw||30,o.sh||16,c,R);x.fillStyle=lin(x,0,yt,0,yb,['rgba(255,255,255,.12)','rgba(0,0,0,.18)']);x.fillRect(xl,yt,xr-xl,yb-yt)});pth(x,a);ink(x,2.6);if(o.trim){seg(x,[xl-4,yb+2,cx,yt-4,xr+4,yb+2],o.tw||7,o.trim)}}
 // pagoda roof: straight top, eaves that sweep up at both tips
 function pagoda(x,xl,xr,yb,h,c,R,o){o=o||{};const tl=xl+h*1.15,tr=xr-h*1.15,lift=o.lift||h*.55,a=()=>{x.beginPath();x.moveTo(tl,yb-h);x.lineTo(tr,yb-h);x.quadraticCurveTo(xr-h*.35,yb-h*.25,xr+8,yb-lift);x.quadraticCurveTo(xr-h*.2,yb+4,xr-h*.55,yb+3);x.lineTo(xl+h*.55,yb+3);x.quadraticCurveTo(xl+h*.2,yb+4,xl-8,yb-lift);x.quadraticCurveTo(xl+h*.35,yb-h*.25,tl,yb-h);x.closePath()};
  a();x.fillStyle=M(c,.8);x.fill();clip(x,a,()=>{tiles2(x,xl-10,yb-h,xr-xl+20,h+8,o.sw||14,c,R);x.fillStyle=lin(x,0,yb-h,0,yb,['rgba(255,255,255,.16)','rgba(0,0,0,.25)']);x.fillRect(xl-10,yb-h,xr-xl+20,h+8)});a();ink(x,2.6);
  if(o.trim){x.beginPath();x.moveTo(xl+h*.55,yb+3);x.lineTo(xr-h*.55,yb+3);x.strokeStyle=OL;x.lineWidth=8;x.stroke();x.strokeStyle=o.trim;x.lineWidth=5;x.stroke()}
  if(o.ridge){box(x,tl-6,yb-h-10,tr-tl+12,12,o.ridge,2,4)}}
 function cone(x,cx,rw,yb,yt,c,R,o){o=o||{};const a=()=>{x.beginPath();x.moveTo(cx-rw,yb);x.quadraticCurveTo(cx-rw*.35,yb-(yb-yt)*.38,cx+(o.lean||0),yt);x.quadraticCurveTo(cx+rw*.35,yb-(yb-yt)*.38,cx+rw,yb);x.closePath()};a();x.fillStyle=c;x.fill();clip(x,a,()=>{shingles(x,cx-rw,yt,rw*2,yb-yt,o.sw||22,o.sh||14,c,R);x.fillStyle=lin(x,cx-rw,0,cx+rw,0,['rgba(0,0,0,.32)','rgba(255,255,255,.1)','rgba(0,0,0,.36)']);x.fillRect(cx-rw,yt,rw*2,yb-yt)});a();ink(x,2.6)}
 function merlons(x,X,Y,w,mw,mh,c,R){for(let xx=X;xx<X+w-1;xx+=mw*2){const ww=min(mw,X+w-xx);box(x,xx,Y-mh,ww,mh+2,M(c,.95+R()*.1),2)}}
 function banner(x,X,Y,w,h,c,trim,emb){poly(x,[X,Y,X+w,Y,X+w,Y+h,X+w/2,Y+h-w*.38,X,Y+h],c,2);x.fillStyle=trim;x.fillRect(X+3,Y+4,w-6,4);x.fillRect(X+3,Y+h-w*.38-10,w-6,3);if(emb)emb(X+w/2,Y+h*.42);box(x,X-5,Y-6,w+10,7,'#6a4a2a',1.6,2)}
 function star(x,X,Y,r,c,n){n=n||5;x.beginPath();for(let i=0;i<n*2;i++){const a=-PI/2+i*PI/n,rr=i%2?r*.45:r;x.lineTo(X+cos(a)*rr,Y+sin(a)*rr)}x.closePath();x.fillStyle=c;x.fill();ink(x,1.4)}
 function txt(x,s,X,Y,sz,f,st,font){x.font=(font||'800 ')+sz+'px '+FONT;x.textAlign='center';x.textBaseline='middle';if(st){x.lineWidth=max(2.5,sz*.13);x.strokeStyle=st;x.lineJoin='round';x.strokeText(s,X,Y)}x.fillStyle=f;x.fillText(s,X,Y)}
 function flame(x,X,Y,s,c0,c1,c2){x.save();x.translate(X,Y);x.scale(s,s);x.beginPath();x.moveTo(-9,0);x.bezierCurveTo(-11,-10,-3,-14,0,-28);x.bezierCurveTo(4,-16,11,-11,9,0);x.closePath();x.fillStyle=c0;x.fill();x.beginPath();x.moveTo(-5,0);x.bezierCurveTo(-6,-7,-1,-9,0,-18);x.bezierCurveTo(3,-10,6,-7,5,0);x.closePath();x.fillStyle=c1;x.fill();x.beginPath();x.ellipse(0,-3,3,4,0,0,TAU);x.fillStyle=c2;x.fill();x.restore()}
 function crystal(x,X,Y,s,c){poly(x,[X,Y-s*1.6,X+s*.62,Y-s*.5,X+s*.38,Y+s*.5,X,Y+s*.75,X-s*.38,Y+s*.5,X-s*.62,Y-s*.5],c,1.8);poly(x,[X,Y-s*1.6,X+s*.62,Y-s*.5,X,Y-s*.2],'rgba(255,255,255,.45)',0);poly(x,[X,Y-s*.2,X,Y+s*.75,X-s*.38,Y+s*.5,X-s*.62,Y-s*.5],'rgba(0,0,40,.18)',0)}
 function lamp(x,q,X,Y,c){/* hanging lantern centred at X,Y */seg(x,[X,Y-22,X,Y-12],1.5,'#3a2a20');box(x,X-9,Y-12,18,24,c,1.8,5);x.fillStyle='rgba(255,255,255,.35)';x.fillRect(X-5,Y-8,3,14);box(x,X-11,Y-15,22,5,'#4a3020',1.4,2);box(x,X-7,Y+11,14,4,'#4a3020',1.2,2);glowS(q,c,26,()=>{q.beginPath();q.arc(X,Y,16,0,TAU);q.fill()})}
 function shadowBase(x,W,H,w){x.fillStyle='rgba(10,10,30,.22)';x.beginPath();x.ellipse(W/2,H-3,(w||W)*.5,10,0,0,TAU);x.fill()}
 function steps(x,cx,H,w,n,c){for(let i=0;i<n;i++){const ww=w-i*16;box(x,cx-ww/2,H-(i+1)*9,ww,9,M(c,1-i*.06),1.6,2)}}
 function grass(x,X,Y,w,R,c){x.strokeStyle=c||'#5a9a3a';x.lineWidth=2;for(let i=0;i<w/5;i++){const xx=X+R()*w,hh=5+R()*9;x.beginPath();x.moveTo(xx,Y);x.quadraticCurveTo(xx+(R()-.5)*4,Y-hh*.6,xx+(R()-.5)*7,Y-hh);x.stroke()}}
 function flowers(x,X,Y,w,R,n){for(let i=0;i<(n||6);i++){const xx=X+R()*w,yy=Y-4-R()*8;seg(x,[xx,Y,xx,yy],1,'#3f7a35');ell(x,xx,yy,3.4,3.4,['#ff9fbf','#fff1a0','#ffffff','#c9a8ff','#ffb27a'][floor(R()*5)],1)}}
 // ---------- painters: P[cls](x,q,W,H,R) draw the facade (ground at y=H, centred at W/2)
 const P={};
 P.mage=(x,q,W,H,R)=>{const cx=W/2,B=H,st='#6c62b8';shadowBase(x,W,H,W*.8);
  // left annex tower
  {const X=cx-210,w=104;bricks(x,X,B-290,w,290,30,16,'#7d74c4',R);side(x,X,B-290,w,290);x.strokeStyle=OL;x.lineWidth=2.4;x.strokeRect(X,B-290,w,290);cone(x,X+w/2,w*.7,B-284,B-430,'#2e2a7e',R,{lean:-6});crystal(x,X+w/2-6,B-440,11,'#7fe9ff');glowS(q,'#7fe9ff',18,()=>{q.beginPath();q.arc(X+w/2-6,B-446,12,0,TAU);q.fill()});win(x,q,X+30,B-235,44,62,{arch:1,fr:'#3a2c6a',gl:'#9ff3ff',c:2,r:2,sill:1})}
  // right library wing
  {const X=cx+92,w=120;bricks(x,X,B-200,w,200,30,16,'#7d74c4',R);side(x,X,B-200,w,200);x.strokeStyle=OL;x.lineWidth=2.4;x.strokeRect(X,B-200,w,200);gable(x,X-14,X+w+14,B-196,B-292,'#2e2a7e',R,{trim:'#e8c45a',tw:5});win(x,q,X+38,B-150,46,46,{round:1,fr:'#3a2c6a',gl:'#9ff3ff',c:2,r:2});box(x,X+18,B-62,84,40,'#5a3a2a',1.8,3);for(let i=0;i<6;i++)box(x,X+22+i*13,B-58,10,30,['#c0504a','#4a7ab8','#e0b040','#6aa04a','#9a5ab8','#d07a3a'][i],1)}
  // main tower
  {const X=cx-92,w=184,top=B-560;bricks(x,X,top,w,560,32,17,st,R);x.fillStyle=lin(x,X,0,X+w,0,['rgba(16,8,40,.45)','rgba(255,255,255,.08)','rgba(255,255,255,.04)','rgba(16,8,40,.5)']);x.fillRect(X,top,w,560);x.strokeStyle=OL;x.lineWidth=2.6;x.strokeRect(X,top,w,560);
   for(const yy of[B-170,B-395])box(x,X-6,yy,w+12,12,'#e8c45a',2,3);
   // rune band
   x.strokeStyle='#bff8ff';x.lineWidth=2;for(let i=0;i<7;i++){const rx=X+16+i*25,ry=B-381;x.beginPath();if(i%3==0){x.arc(rx,ry,6,0,TAU);x.moveTo(rx,ry-9);x.lineTo(rx,ry+9)}else if(i%3==1){x.moveTo(rx-6,ry+6);x.lineTo(rx,ry-7);x.lineTo(rx+6,ry+6);x.moveTo(rx-4,ry+1);x.lineTo(rx+4,ry+1)}else{x.moveTo(rx-6,ry-5);x.lineTo(rx+6,ry-5);x.lineTo(rx-6,ry+6);x.lineTo(rx+6,ry+6)}x.stroke()}
   glowS(q,'#7fe9ff',14,()=>{q.fillRect(X+6,B-392,w-12,22)});
   eave(x,X,top+20,w,40);box(x,X-22,top-4,w+44,26,'#e8c45a',2.4,6);for(let i=0;i<6;i++)crystal(x,X-6+i*39,top+9,6,['#7fe9ff','#ff8fd0','#ffe27a'][i%3]);
   cone(x,cx,w*.72,top-2,10,'#2c2884',R,{lean:14,sw:24,sh:15});clip(x,()=>{x.beginPath();x.moveTo(cx-w*.72,top-2);x.quadraticCurveTo(cx-w*.25,top-170,cx+14,10);x.quadraticCurveTo(cx+w*.25,top-170,cx+w*.72,top-2);x.closePath()},()=>{for(let i=0;i<22;i++){const sx=cx+(R()-.5)*w*1.2,sy=top-20-R()*200;star(x,sx,sy,3+R()*4,'#ffe27a',4)}x.fillStyle='#e8c45a';x.fillRect(cx-w,top-46,w*2,9)});
   win(x,q,cx-34,B-332,68,68,{round:1,fr:'#3a2c6a',gl:'#9ff3ff',c:2,r:2});win(x,q,cx-24,B-505,48,48,{round:1,fr:'#3a2c6a',gl:'#c9b0ff',c:1,r:2});
   win(x,q,X+22,B-250,30,52,{arch:1,fr:'#3a2c6a',gl:'#9ff3ff',c:1,r:1});win(x,q,X+w-52,B-250,30,52,{arch:1,fr:'#3a2c6a',gl:'#9ff3ff',c:1,r:1});
   // door with rune arch
   door(x,cx-42,B-150,84,150,'#5a3a86',{arch:1,fr:'#3a2c6a',band:'#c9a24a',knob:'#9ff3ff'});x.strokeStyle='#bff8ff';x.lineWidth=2.4;x.beginPath();x.arc(cx,B-108,58,PI*1.05,PI*1.95);x.stroke();for(let i=0;i<7;i++){const a=PI*1.1+i*PI*.8/6;star(x,cx+cos(a)*58,B-108+sin(a)*58,4,'#bff8ff',4)}
   glowS(q,'#7fe9ff',18,()=>{q.lineWidth=7;q.beginPath();q.arc(cx,B-108,58,PI*1.05,PI*1.95);q.stroke()});
   // moon banner
   banner(x,X+w+8,top+40,34,120,'#5a2a8a','#e8c45a',(bx,by)=>{x.beginPath();x.arc(bx,by,10,0,TAU);x.fillStyle='#ffe9a8';x.fill();x.beginPath();x.arc(bx+5,by-3,9,0,TAU);x.fillStyle='#5a2a8a';x.fill()})}
  steps(x,cx,B,150,2,'#c8c0e0');grass(x,0,B,W,R,'#6aa04a')};
 P.knight=(x,q,W,H,R)=>{const cx=W/2,B=H,st='#9aa2b4';shadowBase(x,W,H,W*.9);
  for(const s of[-1,1]){const X=s<0?18:W-138,w=120,top=B-460;bricks(x,X,top,w,460,30,18,st,R);side(x,X,top,w,460,.34);x.strokeStyle=OL;x.lineWidth=2.4;x.strokeRect(X,top,w,460);merlons(x,X-6,top,w+12,18,18,st,R);cone(x,X+w/2,w*.62,top-18,top-140,'#3a5ab8',R,{sw:20});ell(x,X+w/2,top-144,7,7,'#ffd24a',1.6);seg(x,[X+w/2,top-150,X+w/2,top-190],2,'#5a4a3a');poly(x,[X+w/2,top-190,X+w/2+30,top-182,X+w/2,top-172],'#d8434a',1.4);
   for(const yy of[top+70,top+190,top+300])box(x,X+w/2-6,yy,12,44,'#1e1a2a',1.8,3)}
  {const X=138,w=W-276,top=B-390;bricks(x,X,top,w,390,34,18,st,R);side(x,X,top,w,390,.2);x.strokeStyle=OL;x.lineWidth=2.4;x.strokeRect(X,top,w,390);merlons(x,X,top,w,20,22,st,R);box(x,X-4,top+30,w+8,10,M(st,.7),1.6);
   win(x,q,X+30,B-300,42,64,{arch:1,fr:'#3a3a4a',gl:'#ffd98a',c:2,r:2,sill:1});win(x,q,X+w-72,B-300,42,64,{arch:1,fr:'#3a3a4a',gl:'#ffd98a',c:2,r:2,sill:1})}
  // great gate with portcullis
  {const gw=130,gx=cx-gw/2,gy=B-200;shapeW(x,gx-14,gy-14,gw+28,214,{arch:1});x.fillStyle=M(st,.75);x.fill();ink(x,2.4);clip(x,()=>shapeW(x,gx,gy,gw,200,{arch:1}),()=>{planks(x,gx,gy-60,gw,260,26,'#7a5232',R);x.fillStyle='#2a2430';for(let i=0;i<7;i++)x.fillRect(gx+8+i*19,gy-60,5,118);x.fillRect(gx,gy+54,gw,5);for(let yy=gy+90;yy<B;yy+=40)for(let i=0;i<5;i++){ell(x,gx+16+i*25,yy,3,3,'#c8ccd8',0)}});shapeW(x,gx,gy,gw,200,{arch:1});ink(x,2.2);
   // shield crest
   const sy=gy-60;poly(x,[cx-30,sy-34,cx+30,sy-34,cx+30,sy+2,cx,sy+30,cx-30,sy+2],'#3a5ab8',2.2);poly(x,[cx-30,sy-6,cx,sy-24,cx+30,sy-6,cx+30,sy+4,cx,sy-14,cx-30,sy+4],'#ffd24a',1.4);star(x,cx,sy+8,9,'#ffd24a');
   // torches
   for(const s of[-1,1]){const tx=cx+s*94;box(x,tx-4,B-150,8,26,'#5a4a3a',1.6,2);flame(x,tx,B-152,1,'#ff7a2a','#ffc04a','#fff3c0');glowS(q,'#ffa040',22,()=>{q.beginPath();q.arc(tx,B-164,15,0,TAU);q.fill()})}}
  steps(x,cx,B,170,2,'#b8bcc8')};
 P.archer=(x,q,W,H,R)=>{const B=H,log='#9a6a3e';shadowBase(x,W,H,W*.9);const X=52,w=360,cx=X+w/2;
  // target on an easel (left)
  {const tx=26,ty=B-96;seg(x,[tx-16,B,tx,ty+20],3,'#7a5232');seg(x,[tx+16,B,tx,ty+20],3,'#7a5232');for(const[r,c]of[[26,'#f4f0e8'],[20,'#d8434a'],[14,'#f4f0e8'],[8,'#d8434a'],[3,'#ffd24a']])ell(x,tx,ty,r,r,c,r==26?2:1);seg(x,[tx+4,ty-2,tx+22,ty-14],1.6,'#6a4a2a');poly(x,[tx+20,ty-18,tx+28,ty-14,tx+24,ty-10],'#5aa04a',1)}
  stones(x,X-8,B-34,w+16,34,'#8a8f98',R,22);
  // log walls
  {const top=B-250;x.save();x.beginPath();x.rect(X,top,w,216);x.clip();for(let yy=top;yy<B-34;yy+=24){x.fillStyle=lin(x,0,yy,0,yy+24,[M(log,1.18),M(log,.9),M(log,.68)]);x.fillRect(X,yy,w,24);x.strokeStyle='rgba(30,15,5,.5)';x.lineWidth=1.4;x.beginPath();x.moveTo(X,yy+24);x.lineTo(X+w,yy+24);x.stroke();x.strokeStyle='rgba(30,15,5,.2)';for(let i=0;i<4;i++){const gx=X+R()*w;x.beginPath();x.moveTo(gx,yy+8);x.lineTo(gx+20+R()*30,yy+9);x.stroke()}}x.restore();x.strokeStyle=OL;x.lineWidth=2.4;x.strokeRect(X,top,w,216);
   for(const ex of[X-8,X+w+8])for(let yy=top;yy<B-34;yy+=24){ell(x,ex,yy+12,11,11,M(log,1.05),1.6);ell(x,ex,yy+12,5,5,M(log,.75),0)}}
  gable(x,X-34,X+w+34,B-246,B-440,'#4f8a3a',R,{trim:'#7a5232',tw:9,sw:28,sh:16});win(x,q,cx-26,B-380,52,40,{arch:1,fr:'#5a3a22',gl:'#ffd98a',c:2,r:1});
  eave(x,X,B-250,w,30);
  win(x,q,X+38,B-196,64,58,{fr:'#5a3a22',shut:'#4f8a3a',c:2,r:2,sill:1,box:'#7a5232'});win(x,q,X+w-102,B-196,64,58,{fr:'#5a3a22',shut:'#4f8a3a',c:2,r:2,sill:1,box:'#7a5232'});
  door(x,cx-34,B-150,68,116,'#8a5a32',{fr:'#5a3a22',band:'#3a3a3a'});
  // crossed arrows + leaf crest over the door
  {const yy=B-178;seg(x,[cx-34,yy+16,cx+34,yy-16],2.4,'#e8d8b0');seg(x,[cx+34,yy+16,cx-34,yy-16],2.4,'#e8d8b0');for(const s of[-1,1]){poly(x,[cx+s*34,yy-16,cx+s*24,yy-18,cx+s*30,yy-8],'#c0c8d0',1.2);poly(x,[cx-s*34,yy+16,cx-s*40,yy+8,cx-s*30,yy+12],'#5aa04a',1)}ell(x,cx,yy,15,15,'#4f8a3a',2);x.beginPath();x.ellipse(cx,yy,5,10,.5,0,TAU);x.fillStyle='#9ad86a';x.fill();ink(x,1.2)}
  // quiver + bow by the door
  box(x,cx+46,B-92,16,48,'#7a3a2a',1.6,4);for(let i=0;i<3;i++){seg(x,[cx+50+i*4,B-92,cx+50+i*4,B-106],1.2,'#e8d8b0');poly(x,[cx+47+i*4,B-106,cx+53+i*4,B-106,cx+50+i*4,B-114],'#d8434a',.8)}
  x.beginPath();x.arc(cx-56,B-80,30,-1.2,1.2);x.strokeStyle=OL;x.lineWidth=5;x.stroke();x.strokeStyle='#a8743f';x.lineWidth=3;x.stroke();seg(x,[cx-56+cos(-1.2)*30,B-80+sin(-1.2)*30,cx-56+cos(1.2)*30,B-80+sin(1.2)*30],.8,'#f4f0e8');
  // lookout tower (right)
  {const L=X+w+44,Rr=W-14,top=B-300;for(const px of[L,Rr])seg(x,[px,B,px,top],6,'#7a5232');seg(x,[L,B-60,Rr,top+40],3,'#6a4428');seg(x,[Rr,B-60,L,top+40],3,'#6a4428');
   for(let yy=B-20;yy>top+10;yy-=26)seg(x,[(L+Rr)/2-12,yy,(L+Rr)/2+12,yy],2.4,'#a8743f');seg(x,[(L+Rr)/2-12,B,(L+Rr)/2-12,top],2.4,'#8a5a32');seg(x,[(L+Rr)/2+12,B,(L+Rr)/2+12,top],2.4,'#8a5a32');
   box(x,L-14,top-14,Rr-L+28,16,'#a8743f',2,3);for(let i=0;i<=5;i++)seg(x,[L-10+i*(Rr-L+20)/5,top-14,L-10+i*(Rr-L+20)/5,top-48],2,'#8a5a32');seg(x,[L-10,top-48,Rr+10,top-48],3,'#a8743f');
   for(const px of[L-6,Rr+6])seg(x,[px,top-48,px,top-96],3,'#7a5232');gable(x,L-26,Rr+26,top-92,top-150,'#4f8a3a',R,{sw:22,sh:13,trim:'#7a5232',tw:6})}
  // hay bale
  box(x,X+w-60,B-34-30,56,30,'#e0c060',1.8,8);x.strokeStyle='rgba(120,80,20,.6)';x.lineWidth=1.4;for(let i=0;i<6;i++){x.beginPath();x.moveTo(X+w-56+i*9,B-62);x.lineTo(X+w-58+i*9,B-36);x.stroke()}
  grass(x,0,B,W,R,'#5a9a3a');flowers(x,X,B,w,R,8)};
 P.samurai=(x,q,W,H,R)=>{const cx=W/2,B=H,wall='#f2ece0',tim='#3a2a26';shadowBase(x,W,H,W*.92);
  box(x,26,B-26,W-52,26,'#8f9aa3',2,3);stones(x,28,B-24,W-56,22,'#8f9aa3',R,18);
  // ground floor
  {const X=70,w=W-140,top=B-228;box(x,X,top,w,202,wall,2.4);const posts=6;for(let i=0;i<=posts;i++){const px=X+i*w/posts;box(x,px-6,top,12,202,tim,1.6)}box(x,X,top,w,12,tim,1.8);box(x,X,top+120,w,8,tim,1.4);
   for(let i=0;i<posts;i++){if(i==2||i==3)continue;const px=X+i*w/posts+10,pw=w/posts-20;win(x,q,px,top+20,pw,92,{fr:tim,gl:'#ffe6b0',c:3,r:4,pl:2})}
   // noren curtain entrance
   const dx=X+2*w/posts+8,dw=2*w/posts-16;box(x,dx,top+20,dw,182,'#2a1e1a',1.8);glowS(q,'#ffd090',20,()=>{q.fillRect(dx+6,top+70,dw-12,120)});x.fillStyle=lin(x,0,top+70,0,top+202,['rgba(255,214,150,.55)','rgba(200,120,70,.22)']);x.fillRect(dx+6,top+70,dw-12,132);x.fillStyle='#6a4a32';x.fillRect(dx+4,top+186,dw-8,16);x.strokeStyle='rgba(40,20,10,.5)';x.lineWidth=1.4;for(let i=1;i<4;i++){x.beginPath();x.moveTo(dx+4+i*(dw-8)/4,top+186);x.lineTo(dx+4+i*(dw-8)/4,top+202);x.stroke()}for(let i=0;i<3;i++){box(x,dx+i*dw/3+2,top+18,dw/3-4,64,'#2f3d8a',1.6,2)}ell(x,cx,top+48,14,14,'#f4f0e8',1.4);ell(x,cx+4,top+44,10,10,'#2f3d8a',0);
   eave(x,X,top,w,30)}
  pagoda(x,16,W-16,B-226,70,'#2b3566',R,{trim:'#c0303a',ridge:'#e8c45a',sw:13});
  // upper floor + balcony
  {const X=140,w=W-280,top=B-400;box(x,X,top,w,104,wall,2.4);for(let i=0;i<=4;i++)box(x,X+i*w/4-5,top,10,104,tim,1.4);for(let i=0;i<4;i++)win(x,q,X+i*w/4+10,top+16,w/4-20,64,{fr:tim,gl:'#ffe6b0',c:2,r:3,pl:2});eave(x,X,top,w,26);
   box(x,X-24,B-306,w+48,10,tim,1.8);for(let i=0;i<=16;i++)seg(x,[X-20+i*(w+40)/16,B-306,X-20+i*(w+40)/16,B-330],1.6,'#5a3a2a');box(x,X-24,B-336,w+48,8,'#c0303a',1.6)}
  pagoda(x,80,W-80,B-396,82,'#2b3566',R,{trim:'#c0303a',ridge:'#e8c45a',sw:13});
  // ridge finials + spire
  for(const s of[-1,1]){const fx=cx+s*(W/2-80-94);poly(x,[fx,B-488,fx+s*14,B-506,fx+s*6,B-492,fx+s*18,B-484],'#e8c45a',1.6)}
  box(x,cx-5,B-560,10,74,'#5a3a2a',1.6);for(let i=0;i<4;i++)ell(x,cx,B-500-i*14,12-i*2,4,'#e8c45a',1.4);ell(x,cx,B-566,6,6,'#e8c45a',1.4);
  // katana rack
  {const rx=W-128,ry=B-100;box(x,rx,ry,8,74,'#3a2a26',1.4);box(x,rx+52,ry,8,74,'#3a2a26',1.4);box(x,rx-4,ry+20,68,6,'#3a2a26',1.4);for(const yy of[ry+8,ry+30]){seg(x,[rx-10,yy,rx+70,yy],2.6,'#1a1a22');seg(x,[rx-10,yy,rx+8,yy],3.4,'#c0303a')}}
  grass(x,0,B,W,R,'#5a9a3a')};
 P.reaper=(x,q,W,H,R)=>{const B=H,st='#4a4e5e',teal='#5fffd0';shadowBase(x,W,H,W*.9);
  // graveyard (left)
  for(const[gx,gh]of[[24,62],[66,48],[104,56]]){box(x,gx-15,B-gh,30,gh,'#8a8f9c',2,[14,14,2,2]);x.strokeStyle='rgba(30,30,40,.55)';x.lineWidth=2;x.beginPath();x.moveTo(gx,B-gh+12);x.lineTo(gx,B-gh+32);x.moveTo(gx-8,B-gh+19);x.lineTo(gx+8,B-gh+19);x.stroke();grass(x,gx-16,B,32,R,'#4a6a4a')}
  for(let i=0;i<9;i++){const fx=8+i*16;seg(x,[fx,B,fx,B-34],2,'#2a2a34');poly(x,[fx-3,B-34,fx,B-42,fx+3,B-34],'#2a2a34',0)}seg(x,[6,B-26,138,B-26],2,'#2a2a34');
  // chapel body
  {const X=150,w=280,top=B-320;bricks(x,X,top,w,320,30,20,st,R);side(x,X,top,w,320,.3);x.strokeStyle=OL;x.lineWidth=2.6;x.strokeRect(X,top,w,320);
   for(const bx of[X-12,X+w-8])poly(x,[bx,B,bx,top+90,bx+10,top+70,bx+20,top+90,bx+20,B],M(st,.85),2);
   gable(x,X-20,X+w+20,top+4,top-220,'#2d3f4a',R,{sw:22,sh:16,trim:'#1a2228',tw:6});
   win(x,q,X+34,top+110,46,110,{arch:2,fr:'#1e2228',gl:teal,c:2,r:3});win(x,q,X+w-80,top+110,46,110,{arch:2,fr:'#1e2228',gl:teal,c:2,r:3});
   const rx=X+w/2,ry=top+60;win(x,q,rx-30,ry-30,60,60,{round:1,fr:'#1e2228',gl:teal,c:1,r:1});x.strokeStyle='#1e2228';x.lineWidth=3;for(let i=0;i<6;i++){const a=i*PI/3;x.beginPath();x.moveTo(rx,ry);x.lineTo(rx+cos(a)*30,ry+sin(a)*30);x.stroke()}
   door(x,rx-38,B-170,76,170,'#3a2a2e',{arch:2,fr:'#1e2228',band:'#5a6070',knob:teal});
   // braziers
   for(const s of[-1,1]){const bx=rx+s*78;box(x,bx-6,B-56,12,56,'#3a3e4a',1.6);box(x,bx-18,B-68,36,14,'#2a2e38',1.8,[2,2,10,10]);glowS(q,teal,26,()=>{q.beginPath();q.arc(bx,B-84,16,0,TAU);q.fill()})}}
  // bell tower + scythe weathervane
  {const X=W-130,w=104,top=B-440;bricks(x,X,top,w,440,26,20,M(st,.92),R);side(x,X,top,w,440,.34);x.strokeStyle=OL;x.lineWidth=2.4;x.strokeRect(X,top,w,440);
   const by=top+40;shapeW(x,X+22,by,w-44,80,{arch:2});x.fillStyle='#14161c';x.fill();ink(x,2);poly(x,[X+w/2-16,by+64,X+w/2+16,by+64,X+w/2+10,by+36,X+w/2-10,by+36],'#c8a24a',1.6);ell(x,X+w/2,by+66,4,4,'#c8a24a',1.2);
   win(x,q,X+w/2-14,top+200,28,60,{arch:2,fr:'#1e2228',gl:teal,c:1,r:2});
   gable(x,X-14,X+w+14,top+4,top-170,'#2d3f4a',R,{sw:18,sh:14});const sx=X+w/2,sy=top-170;seg(x,[sx,sy,sx,sy-46],2.4,'#2a2a34');x.beginPath();x.moveTo(sx,sy-46);x.quadraticCurveTo(sx+30,sy-62,sx+44,sy-40);x.quadraticCurveTo(sx+28,sy-50,sx+2,sy-40);x.closePath();x.fillStyle='#c8ccd8';x.fill();ink(x,1.6)}
  lamp(x,q,150+140,B-196,teal)};
 P.demon=(x,q,W,H,R)=>{const cx=W/2,B=H,st='#3e2438',vi='#c060ff',red='#ff4a6a';shadowBase(x,W,H,W*.92);
  const horn=(hx,hy,s,h)=>{x.beginPath();x.moveTo(hx-12*s,hy);x.quadraticCurveTo(hx-20*s,hy-h*.6,hx-44*s,hy-h);x.quadraticCurveTo(hx-8*s,hy-h*.55,hx+12*s,hy);x.closePath();x.fillStyle=lin(x,0,hy-h,0,hy,['#f4e8d8','#9a8a7a']);x.fill();ink(x,2)};
  {const X=70,w=W-140,top=B-330;bricks(x,X,top,w,330,30,18,st,R);side(x,X,top,w,330,.35);x.strokeStyle=OL;x.lineWidth=2.6;x.strokeRect(X,top,w,330);
   gable(x,X-24,X+w+24,top+4,top-200,'#5a1a2a',R,{sw:24,sh:16,trim:'#1a0a14',tw:7});horn(X+6,top+2,1,150);horn(X+w-6,top+2,-1,150);
   for(const s of[-1,1]){const wx=cx+s*150-23;win(x,q,wx,top+110,46,92,{arch:2,fr:'#1a0a14',gl:red,c:2,r:3});banner(x,cx+s*96-15,top+30,30,120,'#7a1a2a','#e8c45a',(bx,by)=>{x.beginPath();x.arc(bx,by,8,0,TAU);x.fillStyle='#ffd27a';x.fill();x.beginPath();x.arc(bx+4,by-2,7,0,TAU);x.fillStyle='#7a1a2a';x.fill()})}}
  // central tower with the violet eye window
  {const X=cx-66,w=132,top=B-520;bricks(x,X,top,w,520,26,18,M(st,1.1),R);side(x,X,top,w,520,.4);x.strokeStyle=OL;x.lineWidth=2.6;x.strokeRect(X,top,w,520);
   cone(x,cx,w*.66,top+2,top-170,'#4a1424',R,{sw:18,sh:13});horn(X+10,top,1,90);horn(X+w-10,top,-1,90);ell(x,cx,top-176,6,6,'#ffd27a',1.4);
   const ey=top+120;x.beginPath();x.ellipse(cx,ey,44,30,0,0,TAU);x.fillStyle='#1a0a14';x.fill();ink(x,2.2);x.beginPath();x.ellipse(cx,ey,38,24,0,0,TAU);x.fillStyle=lin(x,0,ey-24,0,ey+24,['#f0a0ff','#a040e0','#5a1a8a']);x.fill();x.beginPath();x.ellipse(cx,ey,7,22,0,0,TAU);x.fillStyle='#1a0a14';x.fill();glowS(q,vi,26,()=>{q.beginPath();q.ellipse(cx,ey,40,26,0,0,TAU);q.fill()});
   win(x,q,cx-18,top+230,36,64,{arch:2,fr:'#1a0a14',gl:vi,c:1,r:2});
   // fanged door
   door(x,cx-40,B-176,80,176,'#2a141e',{arch:2,fr:'#140810',band:'#7a2a3a',knob:red});for(let i=0;i<6;i++){const a=PI*1.12+i*PI*.76/5,r=46;poly(x,[cx+cos(a)*r-5,B-136+sin(a)*r,cx+cos(a)*r+5,B-136+sin(a)*r,cx+cos(a)*(r-14),B-136+sin(a)*(r-14)],'#f4ece0',1)}}
  for(const s of[-1,1]){const bx=cx+s*120;box(x,bx-7,B-60,14,60,'#2a1a24',1.6);box(x,bx-20,B-72,40,14,'#1a0e16',1.8,[2,2,10,10]);glowS(q,'#ff40a0',28,()=>{q.beginPath();q.arc(bx,B-90,17,0,TAU);q.fill()})}
  for(let i=0;i<4;i++){const bx=90+R()*(W-180),by=B-400-R()*160;x.fillStyle='#140810';x.beginPath();x.moveTo(bx,by);x.quadraticCurveTo(bx-8,by-8,bx-16,by-2);x.quadraticCurveTo(bx-10,by+1,bx-6,by+5);x.lineTo(bx,by+2);x.lineTo(bx+6,by+5);x.quadraticCurveTo(bx+10,by+1,bx+16,by-2);x.quadraticCurveTo(bx+8,by-8,bx,by);x.fill()}};
 P.gunslinger=(x,q,W,H,R)=>{const cx=W/2,B=H,wood='#c48f55';shadowBase(x,W,H,W*.94);
  // false front
  const fl=56,fr=W-56,top=B-430;poly(x,[fl,B-24,fl,top+50,fl+50,top+50,fl+50,top,fr-50,top,fr-50,top+50,fr,top+50,fr,B-24],wood,0);clip(x,[fl,B-24,fl,top+50,fl+50,top+50,fl+50,top,fr-50,top,fr-50,top+50,fr,top+50,fr,B-24],()=>{planks(x,fl,top,fr-fl,410,20,wood,R,true);side(x,fl,top,fr-fl,410,.22)});poly(x,[fl,B-24,fl,top+50,fl+50,top+50,fl+50,top,fr-50,top,fr-50,top+50,fr,top+50,fr,B-24],'rgba(0,0,0,0)',2.6);
  box(x,fl+44,top-8,fr-fl-88,12,'#7a4a2a',2,2);box(x,fl-6,top+44,58,10,'#7a4a2a',1.8,2);box(x,fr-52,top+44,58,10,'#7a4a2a',1.8,2);
  // sign
  {const sw=fr-fl-120,sx=cx-sw/2,sy=top+14;box(x,sx,sy,sw,62,'#8a2f2a',2.4,6);box(x,sx+6,sy+6,sw-12,50,'rgba(0,0,0,0)',1.2,4);txt(x,"MIRA'S TRADING POST",cx,sy+32,22,'#ffe08a','#3a1410');star(x,sx+22,sy+31,9,'#ffd24a');star(x,sx+sw-22,sy+31,9,'#ffd24a')}
  win(x,q,fl+70,top+110,74,64,{fr:'#5a3a22',gl:'#ffd98a',c:2,r:2,sill:1,cur:'#c0504a'});win(x,q,fr-144,top+110,74,64,{fr:'#5a3a22',gl:'#ffd98a',c:2,r:2,sill:1,cur:'#c0504a'});
  // porch awning
  const ay=B-214;poly(x,[30,ay,W-30,ay,W-40,ay+24,40,ay+24],'#9a6a3a',2.4);clip(x,[30,ay,W-30,ay,W-40,ay+24,40,ay+24],()=>planks(x,30,ay,W-60,24,26,'#a8743f',R,false));for(let i=0;i<24;i++){const fx=44+i*(W-88)/23;poly(x,[fx-9,ay+24,fx+9,ay+24,fx,ay+34],i%2?'#f2e6c8':'#c0504a',1)}
  eave(x,fl,ay+24,fr-fl,30);
  for(const px of[52,186,W-186,W-52])box(x,px-7,ay+24,14,B-24-ay-24,'#8a5a32',1.8);
  // ground windows + saloon doors
  win(x,q,fl+40,B-180,96,84,{fr:'#5a3a22',gl:'#ffd98a',c:3,r:2,sill:1});win(x,q,fr-136,B-180,96,84,{fr:'#5a3a22',gl:'#ffd98a',c:3,r:2,sill:1});
  {const dx=cx-42,dw=84,dy=B-196;box(x,dx-8,dy-8,dw+16,172+8,'#5a3a22',2);box(x,dx,dy,dw,172,'#2a1a14',1.6);glowS(q,'#ffc070',18,()=>{q.fillRect(dx+4,dy+10,dw-8,150)});x.fillStyle='rgba(255,200,120,.35)';x.fillRect(dx+4,dy+10,dw-8,160);for(const s of[0,1]){const hx=dx+s*dw/2+2;x.beginPath();x.moveTo(hx,dy+40);x.lineTo(hx+dw/2-4,dy+40);x.lineTo(hx+dw/2-4,dy+120);x.quadraticCurveTo(hx+dw/4,dy+128,hx,dy+120);x.closePath();x.fillStyle='#b07a44';x.fill();ink(x,1.8);x.strokeStyle='rgba(40,20,10,.5)';x.lineWidth=1.4;for(let i=1;i<4;i++){x.beginPath();x.moveTo(hx+i*(dw/2-4)/4,dy+44);x.lineTo(hx+i*(dw/2-4)/4,dy+118);x.stroke()}}}
  // wanted poster, barrels, crate, lanterns
  box(x,cx+62,B-176,40,52,'#efe0b8',1.6,2);txt(x,'WANTED',cx+82,B-166,8,'#5a2a1a');ell(x,cx+82,B-148,9,10,'#c8b088',1);
  for(const[bx,by]of[[96,B-24],[134,B-24]]){box(x,bx-17,by-46,34,46,'#8a5a32',1.8,8);for(const yy of[by-36,by-12])box(x,bx-18,yy,36,5,'#4a4a52',1)}
  box(x,W-130,B-24-40,48,40,'#a8743f',1.8,2);x.strokeStyle=OL;x.lineWidth=1.6;x.beginPath();x.moveTo(W-130,B-64);x.lineTo(W-82,B-24);x.moveTo(W-82,B-64);x.lineTo(W-130,B-24);x.stroke();
  for(const lx of[cx-130,cx+130])lamp(x,q,lx,ay+60,'#ffc060');
  box(x,30,B-24,W-60,24,'#7a5232',2);planks(x,32,B-22,W-64,20,30,'#8a5a32',R,false)};
 P.berserker=(x,q,W,H,R)=>{const cx=W/2,B=H,wood='#5e4030';shadowBase(x,W,H,W*.94);
  stones(x,46,B-30,W-92,30,'#7b8089',R,22);
  {const X=60,w=W-120,top=B-206;planks(x,X,top,w,176,22,wood,R,false);side(x,X,top,w,176,.25);x.strokeStyle=OL;x.lineWidth=2.4;x.strokeRect(X,top,w,176);box(x,X,top,w,12,M(wood,.7),1.6);
   win(x,q,X+44,B-130,40,40,{fr:'#3a2618',gl:'#ffb050',c:2,r:2});win(x,q,X+w-84,B-130,40,40,{fr:'#3a2618',gl:'#ffb050',c:2,r:2});
   // shields along the wall
   const SC=[['#c0303a','#f4f0e8'],['#3a5ab8','#ffd24a'],['#4a8a3a','#f4f0e8'],['#c0303a','#1e1a24'],['#e8a030','#3a2618']];[X+40,X+120,X+w-120,X+w-40].forEach((sx,i)=>{const sy=top+44,c=SC[i%SC.length];ell(x,sx,sy,26,26,c[0],2.2);clip(x,()=>{x.beginPath();x.arc(sx,sy,26,0,TAU)},()=>{x.fillStyle=c[1];if(i%2)x.fillRect(sx-26,sy-26,26,26),x.fillRect(sx,sy,26,26);else{x.fillRect(sx-6,sy-26,12,52);x.fillRect(sx-26,sy-6,52,12)}});x.beginPath();x.arc(sx,sy,26,0,TAU);ink(x,2.2);ell(x,sx,sy,7,7,'#b8bcc8',1.4)})}
  // big A roof with carved dragon gable
  gable(x,18,W-18,B-200,B-462,'#4a3626',R,{sw:30,sh:18,trim:'#2a1a12',tw:8});
  {const ay=B-462;for(const s of[-1,1]){seg(x,[cx-s*26,ay+44,cx+s*34,ay-30],8,'#6a4a32');const hx=cx+s*34,hy=ay-30;x.beginPath();x.moveTo(hx,hy);x.quadraticCurveTo(hx+s*22,hy-10,hx+s*20,hy+8);x.quadraticCurveTo(hx+s*14,hy+2,hx+s*6,hy+6);x.closePath();x.fillStyle='#6a4a32';x.fill();ink(x,2);ell(x,hx+s*12,hy-2,2,2,'#ffd24a',0)}
   box(x,cx-60,B-380,120,26,'#3a2618',2,4);for(let i=0;i<5;i++){const rx=cx-48+i*24;x.strokeStyle='#e8c45a';x.lineWidth=2;x.beginPath();x.moveTo(rx,B-374);x.lineTo(rx,B-360);if(i%2){x.moveTo(rx,B-374);x.lineTo(rx+6,B-368)}else{x.moveTo(rx-5,B-368);x.lineTo(rx+5,B-368)}x.stroke()}}
  eave(x,60,B-206,W-120,34);
  // double door + crossed axes
  {const dw=104,dx=cx-dw/2,dy=B-176;door(x,dx,dy,dw/2,146,'#7a5232',{fr:'#2a1a12',band:'#4a4a52',kx:.82});door(x,dx+dw/2,dy,dw/2,146,'#7a5232',{fr:'#2a1a12',band:'#4a4a52',kx:.18});
   const ay=dy-30;for(const s of[-1,1]){seg(x,[cx-s*34,ay+20,cx+s*34,ay-20],3,'#7a5232');const hx=cx+s*34,hy=ay-20;x.beginPath();x.moveTo(hx,hy);x.quadraticCurveTo(hx+s*22,hy+4,hx+s*14,hy+24);x.lineTo(hx-s*4,hy+8);x.closePath();x.fillStyle='#c8ccd8';x.fill();ink(x,1.6)}}
  // smoke hole
  box(x,cx+120,B-360,30,26,'#3a2618',1.8,3)};
 P.brawler=(x,q,W,H,R)=>{const cx=W/2,B=H,red='#c0303a',gold='#e8b33a';shadowBase(x,W,H,W*.92);
  box(x,30,B-24,W-60,24,'#8f9aa3',2,3);
  {const X=62,w=W-124,top=B-220;box(x,X,top,w,196,'#f2e6cc',2.4);x.fillStyle=lin(x,0,top,0,top+196,['rgba(0,0,0,.12)','rgba(0,0,0,0)']);x.fillRect(X,top,w,196);
   // lattice windows
   for(const s of[-1,1]){const wx=s<0?X+30:X+w-112;box(x,wx-6,top+46,94,94,red,2,4);x.save();x.beginPath();x.rect(wx,top+52,82,82);x.clip();x.fillStyle='#ffe0a0';x.fillRect(wx,top+52,82,82);x.strokeStyle=red;x.lineWidth=4;for(let i=-82;i<82;i+=16){x.beginPath();x.moveTo(wx+i,top+52);x.lineTo(wx+i+82,top+134);x.moveTo(wx+i+82,top+52);x.lineTo(wx+i,top+134);x.stroke()}x.restore();glowS(q,'#ffd090',18,()=>{q.fillRect(wx,top+52,82,82)})}
   // moon door
   x.beginPath();x.arc(cx,B-96,66,0,TAU);x.fillStyle=red;x.fill();ink(x,2.4);x.beginPath();x.arc(cx,B-96,56,0,TAU);x.fillStyle='#2a1a1a';x.fill();ink(x,1.6);x.fillStyle='#8a5a32';x.fillRect(cx-56,B-60,112,20);glowS(q,'#ffb060',16,()=>{q.beginPath();q.arc(cx,B-90,40,0,TAU);q.fill()});x.fillStyle='rgba(255,190,110,.3)';x.beginPath();x.arc(cx,B-96,50,0,TAU);x.fill();
   for(const px of[X+8,X+w-8,cx-82,cx+82])box(x,px-9,top,18,196,red,2,3)}
  pagoda(x,22,W-22,B-218,62,gold,R,{trim:red,ridge:red,sw:12});
  {const X=110,w=W-220;box(x,X,B-322,w,44,'#f2e6cc',2);for(let i=0;i<=4;i++)box(x,X+i*w/4-5,B-322,10,44,red,1.4)}
  pagoda(x,74,W-74,B-318,58,gold,R,{trim:red,ridge:red,sw:12});
  for(const s of[-1,1]){const fx=cx+s*(W/2-74-67);x.beginPath();x.arc(fx,B-384,9,s<0?0:PI,s<0?PI*1.5:PI*.5+PI*2*0,s>0);x.strokeStyle=OL;x.lineWidth=6;x.stroke();x.strokeStyle=red;x.lineWidth=3.5;x.stroke()}
  ell(x,cx,B-388,10,10,gold,1.8);
  // sign board with fist emblem
  {const sy=B-266;box(x,cx-70,sy-24,140,40,'#1e1a24',2.2,4);box(x,cx-64,sy-18,128,28,'rgba(0,0,0,0)',1,3);txt(x,'DOJO',cx+16,sy-4,20,gold,null);const fx=cx-40,fy=sy-4;box(x,fx-11,fy-9,22,18,gold,1.4,5);for(let i=0;i<3;i++){x.strokeStyle='#1e1a24';x.lineWidth=1.4;x.beginPath();x.moveTo(fx-11+i*7+7,fy-9);x.lineTo(fx-11+i*7+7,fy-2);x.stroke()}}
  for(const lx of[cx-130,cx+130])lamp(x,q,lx,B-176,'#ff5a4a');
  // wooden training dummy (left)
  {const dx=24,dy=B-24;box(x,dx-7,dy-120,14,120,'#8a5a32',1.8,4);ell(x,dx,dy-128,12,12,'#a8743f',1.8);for(const[yy,s]of[[dy-96,1],[dy-80,-1],[dy-60,1]])seg(x,[dx,yy,dx+s*20,yy-6],4,'#7a5232')}};
 P.stormcaller=(x,q,W,H,R)=>{const B=H;shadowBase(x,W,H,W*.94);
  // bakery cottage
  {const X=24,w=290;stones(x,X,B-110,w,110,'#9aa0a8',R,24);x.strokeStyle=OL;x.lineWidth=2.2;x.strokeRect(X,B-110,w,110);box(x,X,B-236,w,126,'#f4ead4',2.2);for(const px of[X,X+w*.33,X+w*.66,X+w])box(x,px-6,B-236,12,126,'#6a4528',1.4);box(x,X,B-236,w,10,'#6a4528',1.4);x.strokeStyle='#6a4528';x.lineWidth=7;x.beginPath();x.moveTo(X+8,B-120);x.lineTo(X+w*.33-8,B-228);x.moveTo(X+w*.66+8,B-228);x.lineTo(X+w-8,B-120);x.stroke();
   gable(x,X-18,X+w+18,B-232,B-370,'#b8683a',R,{sw:26,sh:15,trim:'#6a4528',tw:6});box(x,X+w-78,B-374,30,64,'#9aa0a8',2,2);box(x,X+w-84,B-380,42,10,'#6a6e78',1.6,2);
   win(x,q,X+120,B-212,80,62,{fr:'#6a4528',gl:'#ffd080',c:3,r:2,sill:1,box:'#6a4528'});
   door(x,X+28,B-110,58,110,'#8a5a32',{arch:1,fr:'#5a3a22',band:'#4a4a52'});win(x,q,X+150,B-96,96,64,{fr:'#6a4528',gl:'#ffcf70',c:3,r:1,sill:1});
   for(let i=0;i<3;i++){const bx=X+170+i*28;x.beginPath();x.ellipse(bx,B-44,12,7,0,PI,0);x.fillStyle='#d8963a';x.fill();ink(x,1.2)}
   const sx=X+w-30,sy=B-150;seg(x,[sx,sy-40,sx+40,sy-40],3,'#3a2a20');seg(x,[sx+30,sy-40,sx+30,sy-28],1.4,'#3a2a20');ell(x,sx+30,sy-6,22,22,'#f4ead4',2);x.beginPath();x.ellipse(sx+30,sy-4,14,9,0,0,TAU);x.fillStyle='#d8963a';x.fill();ink(x,1.4);x.strokeStyle='#8a5a20';x.lineWidth=1.4;for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(sx+30+i*6-3,sy-10);x.lineTo(sx+30+i*6+3,sy+1);x.stroke()}}
  // windmill tower
  {const L=316,Rr=W-26,top=B-520,tl=L+34,tr=Rr-34,a=[L,B,tl,top,tr,top,Rr,B];poly(x,a,'#e8e2d8',0);clip(x,a,()=>{bricks(x,L,top,Rr-L,520,34,20,'#dcd4c4',R);x.fillStyle=lin(x,L,0,Rr,0,['rgba(16,8,40,.35)','rgba(255,255,255,.08)','rgba(16,8,40,.42)']);x.fillRect(L,top,Rr-L,520);for(const yy of[B-150,B-330])x.fillStyle='#6a7488',x.fillRect(L,yy,Rr-L,14)});pth(x,a);ink(x,2.6);
   const mx=(L+Rr)/2;door(x,mx-30,B-104,60,104,'#3a5a8a',{arch:1,fr:'#2a3a5a',band:'#c8ccd8'});win(x,q,mx-20,B-260,40,56,{arch:1,fr:'#2a3a5a',gl:'#bfe8ff',c:1,r:2});win(x,q,mx-17,B-440,34,48,{arch:1,fr:'#2a3a5a',gl:'#bfe8ff',c:1,r:2});
   // lightning bolt mural
   poly(x,[mx+44,B-400,mx+22,B-352,mx+38,B-352,mx+18,B-300,mx+56,B-366,mx+40,B-366,mx+58,B-400],'#ffe24a',1.8);glowS(q,'#ffe870',14,()=>pth(q,[mx+44,B-400,mx+22,B-352,mx+38,B-352,mx+18,B-300,mx+56,B-366,mx+40,B-366,mx+58,B-400])||q.fill());
   // cap + rod
   x.beginPath();x.moveTo(tl-18,top+4);x.quadraticCurveTo(tl-10,top-90,mx,top-104);x.quadraticCurveTo(tr+10,top-90,tr+18,top+4);x.closePath();x.fillStyle='#4a5a7a';x.fill();clip(x,()=>{x.beginPath();x.moveTo(tl-18,top+4);x.quadraticCurveTo(tl-10,top-90,mx,top-104);x.quadraticCurveTo(tr+10,top-90,tr+18,top+4);x.closePath()},()=>shingles(x,tl-20,top-110,tr-tl+40,116,18,13,'#4a5a7a',R));x.beginPath();x.moveTo(tl-18,top+4);x.quadraticCurveTo(tl-10,top-90,mx,top-104);x.quadraticCurveTo(tr+10,top-90,tr+18,top+4);x.closePath();ink(x,2.4);
   seg(x,[mx,top-104,mx,top-190],3,'#8a8f9a');ell(x,mx,top-194,6,6,'#ffe24a',1.4);poly(x,[mx-26,top-150,mx-10,top-150,mx-14,top-158,mx+4,top-144,mx-12,top-144,mx-8,top-136],'#ffe24a',1.2)}
  grass(x,0,B,W,R,'#5a9a3a');flowers(x,24,B,290,R,6)};
 P.druid=(x,q,W,H,R)=>{const cx=W/2,B=H,bark='#7a5a3a';shadowBase(x,W,H,W*.94);
  const body=()=>{x.beginPath();x.moveTo(64,B);x.lineTo(64,B-170);x.bezierCurveTo(64,B-330,W-64,B-330,W-64,B-170);x.lineTo(W-64,B);x.closePath()};
  body();x.fillStyle=bark;x.fill();clip(x,body,()=>{for(let i=0;i<40;i++){const rx=64+R()*(W-128);x.strokeStyle=M(bark,.6+R()*.6);x.lineWidth=2+R()*4;x.beginPath();x.moveTo(rx,B);x.bezierCurveTo(rx+(R()-.5)*40,B-100,rx+(R()-.5)*60,B-200,rx+(R()-.5)*80,B-320);x.stroke()}x.fillStyle=lin(x,64,0,W-64,0,['rgba(16,8,0,.35)','rgba(255,255,255,.05)','rgba(16,8,0,.4)']);x.fillRect(0,0,W,H)});body();ink(x,2.6);
  // moss dome roof with flowers
  const roof=()=>{x.beginPath();x.moveTo(30,B-160);x.bezierCurveTo(26,B-420,W-26,B-420,W-30,B-160);for(let i=0;i<=12;i++){const px=W-30-i*(W-60)/12;x.quadraticCurveTo(px+(W-60)/24,B-140+((i%2)?6:-4),px,B-156)}x.closePath()};
  roof();x.fillStyle='#5aa040';x.fill();clip(x,roof,()=>{for(let i=0;i<70;i++){const px=30+R()*(W-60),py=B-380+R()*230;x.fillStyle=M('#5aa040',.75+R()*.5);x.beginPath();x.arc(px,py,10+R()*16,0,TAU);x.fill()}x.fillStyle=lin(x,0,B-400,0,B-140,['rgba(255,255,200,.18)','rgba(0,30,0,.3)']);x.fillRect(0,B-420,W,300);for(let i=0;i<30;i++){const px=40+R()*(W-80),py=B-360+R()*190;ell(x,px,py,3.4,3.4,['#ff9fbf','#fff1a0','#ffffff','#c9a8ff'][i%4],1)}});roof();ink(x,2.6);
  // hanging vines
  for(let i=0;i<9;i++){const vx=60+i*(W-120)/8,len=26+R()*44;x.strokeStyle='#3f7a35';x.lineWidth=2.4;x.beginPath();x.moveTo(vx,B-152);x.quadraticCurveTo(vx+6,B-152+len*.5,vx-2,B-152+len);x.stroke();for(let j=0;j<3;j++){x.beginPath();x.ellipse(vx+(j%2?4:-3),B-148+len*(j+1)/4,4,2.4,j,0,TAU);x.fillStyle='#6ab84a';x.fill()}}
  // round door
  {const dw=96,dx=cx-dw/2,dy=B-150;x.beginPath();x.arc(cx,dy+dw/2,dw/2+9,PI,0);x.lineTo(cx+dw/2+9,B);x.lineTo(cx-dw/2-9,B);x.closePath();x.fillStyle='#5a3a22';x.fill();ink(x,2.2);door(x,dx,dy,dw,150,'#4f7a3a',{arch:1,fr:'#3a2a18',knob:'#ffd24a',kx:.5});x.beginPath();x.ellipse(cx,dy+46,9,20,0,0,TAU);x.fillStyle='#8ad86a';x.fill();ink(x,1.4);x.strokeStyle='#3a6a2a';x.lineWidth=1.4;x.beginPath();x.moveTo(cx,dy+28);x.lineTo(cx,dy+64);x.stroke()}
  win(x,q,cx-178,B-150,62,62,{round:1,fr:'#5a3a22',gl:'#ffd98a',c:2,r:2});win(x,q,cx+116,B-150,62,62,{round:1,fr:'#5a3a22',gl:'#ffd98a',c:2,r:2});
  // QUESTS leaf sign
  {const sx=cx-118,sy=B-218;seg(x,[sx,sy-30,sx,sy-10],1.6,'#3a2a18');box(x,sx-46,sy-10,92,30,'#8a5a32',2,6);txt(x,'QUESTS',sx,sy+5,14,'#fff3c4','#3a2a18');ell(x,sx+52,sy+5,9,9,'#ffd24a',1.6);txt(x,'!',sx+52,sy+5,13,'#3a2200')}
  // glowing mushrooms
  for(const[mx,s]of[[40,1],[64,.7],[W-46,1.1],[W-70,.75],[cx+70,.6]]){box(x,mx-4*s,B-22*s,8*s,22*s,'#f4ead4',1.4,3);x.beginPath();x.ellipse(mx,B-22*s,16*s,10*s,0,PI,0);x.closePath();const mc=mx%2?'#5fe0ff':'#c98aff';x.fillStyle=mc;x.fill();ink(x,1.6);for(let i=0;i<3;i++)ell(x,mx-8*s+i*8*s,B-27*s,2*s,2*s,'#fff',0);glowS(q,mc,20,()=>{q.beginPath();q.ellipse(mx,B-26*s,15*s,9*s,0,0,TAU);q.fill()})}
  grass(x,0,B,W,R,'#4f9a3a')};
 P.ninja=(x,q,W,H,R)=>{const cx=W/2,B=H,wd='#3e3644';shadowBase(x,W,H,W*.94);
  // bamboo fences
  for(const[X0,X1]of[[0,58],[W-58,W]]){for(let px=X0+6;px<X1;px+=11){box(x,px-4,B-96-(px%3)*6,8,96+(px%3)*6,'#8ab85a',1.4,3);for(let yy=B-30;yy>B-96;yy-=30){x.fillStyle='#5a8a3a';x.fillRect(px-4,yy,8,3)}}seg(x,[X0+2,B-60,X1-2,B-60],2.4,'#7a5232')}
  for(const px of[84,cx,W-84])box(x,px-6,B-36,12,36,'#2a2430',1.6);box(x,64,B-46,W-128,12,'#5a4a3a',2,2);
  {const X=72,w=W-144,top=B-252;planks(x,X,top,w,206,24,wd,R,false);side(x,X,top,w,206,.3);x.strokeStyle=OL;x.lineWidth=2.4;x.strokeRect(X,top,w,206);
   // shoji doors
   const dw=120,dx=cx-dw/2;box(x,dx-6,top+40,dw+12,166,'#2a2430',2);for(let i=0;i<2;i++){win(x,q,dx+i*dw/2+3,top+46,dw/2-6,156,{fr:'#2a2430',gl:'#ffe6c0',c:2,r:4,pl:2})}
   // round window with spiral shutter
   win(x,q,X+30,top+70,70,70,{round:1,fr:'#2a2430',gl:'#c8b0ff',c:2,r:2});
   // shuriken target
   {const tx=X+w-62,ty=top+104;ell(x,tx,ty,36,36,'#a8743f',2.2);ell(x,tx,ty,24,24,'#8a5a32',1.4);ell(x,tx,ty,10,10,'#c0303a',1.4);for(const[ox,oy,r]of[[-8,-18,.3],[14,6,1.1],[-14,12,2]]){x.save();x.translate(tx+ox,ty+oy);x.rotate(r);star(x,0,0,8,'#c8ccd8',4);ell(x,0,0,2,2,'#2a2430',0);x.restore()}}
   eave(x,X,top,w,34)}
  pagoda(x,26,W-26,B-248,96,'#2a2630',R,{trim:'#6a2a8a',ridge:'#4a4452',sw:13,lift:44});
  // purple banner + paper lantern
  banner(x,96,B-232,28,96,'#6a2a8a','#d8c8f0',(bx,by)=>{x.save();x.translate(bx,by);star(x,0,0,8,'#e8e0ff',4);x.restore()});
  lamp(x,q,W-110,B-210,'#ff9a5a');
  for(const sx of[cx-40,cx+20,cx+70])ell(x,sx,B-4,14,5,'#8f9aa3',1.4)};
 P.elementalist=(x,q,W,H,R)=>{const cx=W/2,B=H;shadowBase(x,W,H,W*.94);
  for(let i=0;i<3;i++){const w=W-60-i*40;box(x,cx-w/2,B-(i+1)*18,w,18,M('#ece8f4',1-i*.05),1.8,3)}
  // pillars with crystal caps
  const PX=[cx-196,cx-92,cx+92,cx+196];for(const px of PX){box(x,px-15,B-330,30,276,'#f2eefa',2);x.fillStyle=lin(x,px-15,0,px+15,0,['rgba(60,40,100,.25)','rgba(255,255,255,.2)','rgba(60,40,100,.3)']);x.fillRect(px-15,B-330,30,276);for(let i=1;i<4;i++){x.strokeStyle='rgba(80,60,120,.3)';x.lineWidth=1.2;x.beginPath();x.moveTo(px-15+i*7.5,B-326);x.lineTo(px-15+i*7.5,B-58);x.stroke()}box(x,px-21,B-340,42,14,'#e8c45a',1.8,3);box(x,px-21,B-68,42,14,'#e8c45a',1.8,3)}
  box(x,cx-236,B-372,472,34,'#f2eefa',2.4,4);box(x,cx-236,B-350,472,8,'#e8c45a',1.6);for(let i=0;i<9;i++){const ex=cx-210+i*52.5;i%2?flame(x,ex,B-354,.5,'#ff6a3a','#ffc04a','#fff3c0'):crystal(x,ex,B-360,7,'#9fe8ff')}
  // split dome: fire | ice
  {const r=196,dy=B-372;clip(x,()=>{x.beginPath();x.arc(cx,dy,r,PI,0);x.closePath()},()=>{x.fillStyle=lin(x,0,dy-r,0,dy,['#ffb04a','#e0502a']);x.fillRect(cx-r,dy-r,r,r);x.fillStyle=lin(x,0,dy-r,0,dy,['#e8fbff','#5ab0e8']);x.fillRect(cx,dy-r,r,r);x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=2;for(let a=PI*1.1;a<PI*1.95;a+=PI/9){x.beginPath();x.moveTo(cx,dy);x.lineTo(cx+cos(a)*r,dy+sin(a)*r);x.stroke()}for(let i=1;i<4;i++){x.beginPath();x.arc(cx,dy,r*i/4,PI,0);x.stroke()}});x.beginPath();x.arc(cx,dy,r,PI,0);x.closePath();ink(x,2.6);seg(x,[cx,dy,cx,dy-r],5,'#e8c45a');
   box(x,cx-8,dy-r-60,16,62,'#e8c45a',1.8,3);ell(x,cx,dy-r-80,24,24,'#fff6d0',2);ell(x,cx,dy-r-80,16,16,'#ffe9a0',0);glowS(q,'#fff0a0',34,()=>{q.beginPath();q.arc(cx,dy-r-80,24,0,TAU);q.fill()})}
  // altar, brazier, ice crystal
  box(x,cx-34,B-130,68,76,'#e8e4f0',2,4);box(x,cx-44,B-140,88,14,'#e8c45a',1.8,3);crystal(x,cx,B-150,12,'#d8b8ff');glowS(q,'#c8a0ff',24,()=>{q.beginPath();q.arc(cx,B-162,14,0,TAU);q.fill()});
  {const bx=cx-144;box(x,bx-16,B-110,32,56,'#8a8f98',2,3);box(x,bx-24,B-122,48,14,'#5a5e68',1.8,[2,2,10,10]);glowS(q,'#ff8a3a',30,()=>{q.beginPath();q.arc(bx,B-140,18,0,TAU);q.fill()})}
  {const bx=cx+144;box(x,bx-16,B-110,32,56,'#8a8f98',2,3);crystal(x,bx-10,B-118,9,'#bff0ff');crystal(x,bx+8,B-116,7,'#9fe0ff');crystal(x,bx,B-124,13,'#d8f8ff');glowS(q,'#9fe8ff',26,()=>{q.beginPath();q.arc(bx,B-138,18,0,TAU);q.fill()})}};
 // ---- town pieces
 P.gate=(x,q,W,H,R)=>{const cx=W/2,B=H,mar='#ece6f4',ay=B-330,PR=136;
  steps(x,cx,B,W-180,3,'#d8d2e4');
  // portal behind the door
  const portal=()=>{x.beginPath();x.moveTo(cx-PR,B-27);x.lineTo(cx-PR,ay);x.arc(cx,ay,PR,PI,0);x.lineTo(cx+PR,B-27);x.closePath()};
  portal();x.fillStyle=lin(x,0,ay-PR,0,B,['#3a2a8a','#6a3ab8','#2a8aa8','#1a2a5a']);x.fill();clip(x,portal,()=>{for(let i=0;i<5;i++){x.strokeStyle='rgba(200,230,255,'+(.12+i*.05)+')';x.lineWidth=3;x.beginPath();for(let a=0;a<TAU*1.6;a+=.15){const rr=10+a*24+i*10;x.lineTo(cx+cos(a+i)*rr,B-200+sin(a+i)*rr*.9)}x.stroke()}for(let i=0;i<40;i++){x.fillStyle='rgba(255,255,255,'+(.4+R()*.6)+')';const s=1+R()*2.5;x.fillRect(cx-PR+R()*PR*2,ay-PR+R()*(B-ay+PR),s,s)}});portal();ink(x,2.4);
  glowS(q,'#a080ff',40,()=>{portal();q.globalAlpha=.55;q.fill()});
  // pillars
  for(const s of[-1,1]){const px=cx+s*196;box(x,px-46,ay,92,B-27-ay,mar,2.6);x.fillStyle=lin(x,px-46,0,px+46,0,['rgba(60,40,100,.28)','rgba(255,255,255,.18)','rgba(60,40,100,.34)']);x.fillRect(px-46,ay,92,B-27-ay);for(let i=1;i<6;i++){x.strokeStyle='rgba(80,60,120,.28)';x.lineWidth=1.4;x.beginPath();x.moveTo(px-46+i*15.3,ay+20);x.lineTo(px-46+i*15.3,B-60);x.stroke()}
   box(x,px-56,B-60,112,34,'#e8c45a',2.2,4);box(x,px-56,ay-6,112,30,'#e8c45a',2.2,4);
   banner(x,px-20,ay+50,40,150,'#5a3ab8','#e8c45a',(bx,by)=>star(x,bx,by,10,'#ffe27a'))}
  // arch band with voussoirs, keystone gem
  {const ro=212,ri=142;x.beginPath();x.arc(cx,ay,ro,PI,0);x.arc(cx,ay,ri,0,PI,true);x.closePath();x.fillStyle=mar;x.fill();clip(x,()=>{x.beginPath();x.arc(cx,ay,ro,PI,0);x.arc(cx,ay,ri,0,PI,true);x.closePath()},()=>{x.strokeStyle='rgba(80,60,120,.35)';x.lineWidth=2;for(let a=PI;a<=TAU;a+=PI/13){x.beginPath();x.moveTo(cx+cos(a)*ri,ay+sin(a)*ri);x.lineTo(cx+cos(a)*ro,ay+sin(a)*ro);x.stroke()}x.fillStyle=lin(x,0,ay-ro,0,ay,['rgba(255,255,255,.2)','rgba(60,40,100,.18)']);x.fillRect(cx-ro,ay-ro,ro*2,ro)});x.beginPath();x.arc(cx,ay,ro,PI,0);x.arc(cx,ay,ri,0,PI,true);x.closePath();ink(x,2.6);
   x.beginPath();x.arc(cx,ay,ro-6,PI,0);x.strokeStyle='#e8c45a';x.lineWidth=5;x.stroke();x.beginPath();x.arc(cx,ay,ri+6,PI,0);x.stroke();
   poly(x,[cx,ay-ro-22,cx+30,ay-ro+16,cx,ay-ri+10,cx-30,ay-ro+16],'#e8c45a',2.2);crystal(x,cx,ay-ro+8,16,'#5ff0e0');glowS(q,'#5ff0e0',26,()=>{q.beginPath();q.arc(cx,ay-ro+2,20,0,TAU);q.fill()});
   for(const s of[-1,1]){crystal(x,cx+s*196,ay-30,14,'#5ff0e0');glowS(q,'#5ff0e0',24,()=>{q.beginPath();q.arc(cx+s*196,ay-36,18,0,TAU);q.fill()})}}
  // plaque
  {const py=ay-100;box(x,cx-118,py-24,236,48,'#1e2a5a',2.6,8);box(x,cx-112,py-18,224,36,'rgba(0,0,0,0)',1.2,6);x.strokeStyle='#e8c45a';x.lineWidth=2;x.strokeRect(cx-112,py-18,224,36);txt(x,'WORLD GATE',cx,py,26,'#ffe08a','#0e1430');txt(x,'TRAVEL TO ANY WORLD',cx,py+40,12,'#ffffff','#1e2a5a','700 ')}};
 P.dais=(x,q,W,H,R)=>{const cx=W/2,B=H;
  ell(x,cx,B-12,124,15,'#9aa2b4',2.2);ell(x,cx,B-20,112,13,'#e8e4f4',2.2);x.beginPath();x.ellipse(cx,B-20,84,9,0,0,TAU);x.strokeStyle='#5ff0e0';x.lineWidth=4;x.stroke();for(let i=0;i<8;i++){const a=i*TAU/8;star(x,cx+cos(a)*98,B-20+sin(a)*11,3,'#9ff3ff',4)}
  glowS(q,'#5ff0e0',24,()=>{q.beginPath();q.ellipse(cx,B-20,86,11,0,0,TAU);q.lineWidth=8;q.stroke()});
  // sign post (left)
  const sx=14;seg(x,[sx+30,B,sx+30,B-150],4,'#7a5232');box(x,sx-6,B-190,94,52,'#2a3a6a',2.2,6);txt(x,'SKY RUN',sx+41,B-174,15,'#ffe08a','#0e1430');txt(x,'stand on the beam',sx+41,B-153,9,'#d8f0ff',null,'700 ');poly(x,[sx+41,B-216,sx+57,B-196,sx+25,B-196],'#5ff0e0',1.8)};
 P.board=(x,q,W,H,R)=>{const B=H;for(const px of[20,W-20])seg(x,[px,B,px,B-110],5,'#6a4528');box(x,4,B-176,W-8,96,'#8a5a32',2.4,6);box(x,12,B-168,W-24,80,'#efe0b8',1.6,3);txt(x,'TOWN MAP',W/2,B-156,12,'#5a2a1a');
  const cols=['#9adcff','#9a7aff','#8affc0','#fff07a','#d08aff','#7ad8ff','#5ff0e0','#9aff7a','#ff8a4a','#ffd86a','#ff7a9a','#ffb27a','#7ad8ff','#ff4a5a'];x.strokeStyle='#7a5232';x.lineWidth=2;x.beginPath();x.moveTo(18,B-118);x.lineTo(W-18,B-118);x.stroke();for(let i=0;i<14;i++){const px=20+i*(W-40)/13;ell(x,px,B-118,4,4,cols[i],1)}star(x,20+6*(W-40)/13,B-134,6,'#e84a4a');txt(x,'YOU ARE HERE',W/2,B-100,7,'#5a2a1a',null,'700 ')};
 P.pond=(x,q,W,H,R)=>{const g0=H-5*T;/* ground line inside this piece */for(const px of[72,168])box(x,px-7,g0+4,14,5*T-4,'#5a3a22',1.6);
  seg(x,[64,g0,64,g0-120],4,'#6a4528');seg(x,[64,g0-120,84,g0-120],2.4,'#6a4528');lamp(x,q,84,g0-96,'#ffb85a');
  const sx=W-110;seg(x,[sx,g0,sx,g0-96],4,'#6a4528');box(x,sx-58,g0-132,116,46,'#2a4a6a',2.2,6);txt(x,'MOONLIT POND',sx,g0-116,13,'#ffe08a','#0e1430');txt(x,'fishing spot',sx,g0-98,9,'#d8f0ff',null,'700 ');
  for(let i=0;i<5;i++){const cx2=W-40+i*8;seg(x,[cx2,g0,cx2-3+i,g0-34-i*4],1.6,'#4a7a3a');box(x,cx2-6+i,g0-44-i*4,5,12,'#7a4a2a',1,2)}};
 P.skystart=(x,q,W,H,R)=>{const B=H;for(const px of[18,W-18]){seg(x,[px,B,px,B-110],4,'#e8c45a');ell(x,px,B-114,7,7,'#5ff0e0',1.4);glowS(q,'#5ff0e0',20,()=>{q.beginPath();q.arc(px,B-114,9,0,TAU);q.fill()})}x.beginPath();x.moveTo(18,B-96);x.quadraticCurveTo(W/2,B-70,W-18,B-96);x.strokeStyle=OL;x.lineWidth=12;x.stroke();x.strokeStyle='#ff6a8a';x.lineWidth=8;x.stroke();for(let i=1;i<8;i++){const u=i/8,px=18+(W-36)*u,py=B-96+sin(u*PI)*26;poly(x,[px-7,py,px+7,py,px,py+14],i%2?'#ffe27a':'#7fe9ff',1)}};
 P.shrine=(x,q,W,H,R)=>{const B=H,red='#e8504a',gold='#e8c45a';
  for(const px of[30,170])box(x,px-8,B-170,16,170,red,2,3);box(x,8,B-186,184,18,red,2.2,4);box(x,0,B-200,200,14,'#2a2430',2.2,[8,8,2,2]);box(x,20,B-140,160,12,red,2,3);box(x,86,B-176,28,40,'#1e1a24',1.8,3);txt(x,'SKY',100,B-166,9,gold,null);txt(x,'SHRINE',100,B-152,7,gold,null);
  seg(x,[100,B-140,100,B-120],1.4,'#3a2a20');x.beginPath();x.moveTo(84,B-88);x.quadraticCurveTo(84,B-122,100,B-122);x.quadraticCurveTo(116,B-122,116,B-88);x.closePath();x.fillStyle=gold;x.fill();ink(x,2);ell(x,100,B-86,5,4,'#a07a2a',1.2);glowS(q,'#ffe08a',20,()=>{q.beginPath();q.arc(100,B-104,16,0,TAU);q.fill()});
  const px=(W-T*2.5);ell(x,px,B-8,58,9,'#e8e4f4',2);x.beginPath();x.ellipse(px,B-8,44,6,0,0,TAU);x.strokeStyle='#ffd27a';x.lineWidth=3;x.stroke();glowS(q,'#ffd27a',20,()=>{q.beginPath();q.ellipse(px,B-8,46,7,0,0,TAU);q.lineWidth=7;q.stroke()});txt(x,'RETURN',px,B-34,10,'#ffe08a','#3a2410');poly(x,[px,B-14,px-8,B-24,px+8,B-24],'#ffd27a',1.2)};
 // ---------- animated overlays (cheap, no gradients): A[cls](g,ox,oy,W,H,t,nt)
 const SPR={};
 function glowSpr(col){if(SPR['g'+col])return SPR['g'+col];const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,1,32,32,32);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return SPR['g'+col]=c}
 function flameSpr(k,c0,c1,c2){if(SPR[k])return SPR[k];const c=document.createElement('canvas');c.width=40;c.height=48;const x=c.getContext('2d');flame(x,20,46,1.4,c0,c1,c2);return SPR[k]=c}
 function addGlow(g,col,X,Y,r,a){g.globalAlpha=a;g.drawImage(glowSpr(col),X-r,Y-r,r*2,r*2)}
 function fire(g,k,X,Y,t,s,cols){const sp=flameSpr(k,...cols),f=1+.12*sin(t*13+X)+.08*sin(t*21+Y);g.drawImage(sp,X-20*s,Y-48*s*f,40*s,48*s*f)}
 function wave(g,X,Y,w,h,c,trim,t,ph){g.beginPath();const n=8;g.moveTo(X,Y);for(let i=0;i<=n;i++){const u=i/n;g.lineTo(X+w+sin(t*2.4+ph+u*3)*u*5,Y+h*u)}g.lineTo(X+w/2+sin(t*2.4+ph+3)*5,Y+h-w*.4);for(let i=n;i>=0;i--){const u=i/n;g.lineTo(X+sin(t*2.4+ph+u*3)*u*5,Y+h*u)}g.closePath();g.fillStyle=c;g.fill();g.strokeStyle=OL;g.lineWidth=2;g.stroke();g.fillStyle=trim;g.fillRect(X+3+sin(t*2.4+ph+.6)*.6,Y+6,w-6,4)}
 const A={};
 A.mage=(g,X,Y,W,H,t)=>{const cx=X+W/2+14,cy=Y-26+sin(t*1.6)*7;g.save();g.globalCompositeOperation='lighter';addGlow(g,'rgba(127,233,255,.8)',cx,cy,40,.55+.2*sin(t*3));g.restore();g.save();g.translate(cx,cy);g.rotate(sin(t*.9)*.15);crystal(g,0,0,13,'#9ff3ff');g.restore();
  for(let i=0;i<3;i++){const a=t*1.4+i*TAU/3;g.fillStyle='rgba(220,250,255,.85)';g.fillRect(cx+cos(a)*30-2,cy+sin(a)*10-2,4,4)}};
 A.knight=(g,X,Y,W,H,t,nt)=>{const B=Y+H;wave(g,X+138+30,B-390+8,40,130,'#3a5ab8','#ffd24a',t,0);wave(g,X+W-138-70,B-390+8,40,130,'#3a5ab8','#ffd24a',t,1.7);
  for(const s of[-1,1]){const tx=X+W/2+s*94;fire(g,'kf',tx,B-150,t,.62,['#ff7a2a','#ffc04a','#fff3c0'])}};
 A.archer=(g,X,Y,W,H,t)=>{const px=X+W-14-((W-14)-(52+360+44))/2,py=Y+H-300-150;g.beginPath();g.moveTo(px,py);g.lineTo(px,py-34);g.strokeStyle=OL;g.lineWidth=3;g.stroke();g.beginPath();g.moveTo(px,py-34);for(let i=0;i<=6;i++){const u=i/6;g.lineTo(px+u*32,py-34+sin(t*5+u*4)*3*u+u*4)}g.lineTo(px,py-18);g.closePath();g.fillStyle='#5aa04a';g.fill();g.strokeStyle=OL;g.lineWidth=1.6;g.stroke()};
 A.samurai=(g,X,Y,W,H,t)=>{const B=Y+H;for(const[lx,ph]of[[X+110,0],[X+W-110,1.3]]){const a=sin(t*1.8+ph)*.12,ly=B-212;g.save();g.translate(lx,ly);g.rotate(a);g.strokeStyle=OL;g.lineWidth=1.6;g.beginPath();g.moveTo(0,0);g.lineTo(0,14);g.stroke();g.beginPath();g.ellipse(0,30,13,17,0,0,TAU);g.fillStyle='#e8504a';g.fill();g.stroke();g.fillStyle='#2a1a1a';g.fillRect(-7,11,14,4);g.fillRect(-7,45,14,4);g.globalCompositeOperation='lighter';addGlow(g,'rgba(255,170,90,.7)',0,30,30,.5);g.restore()}};
 A.reaper=(g,X,Y,W,H,t)=>{const B=Y+H,rx=X+150+140;for(const s of[-1,1])fire(g,'rf',rx+s*78,B-68,t,.75,['#2fd8b0','#8fffe0','#e8fff8']);
  for(let i=0;i<3;i++){const a=t*.6+i*2.1,wx=X+60+((t*14+i*70)%160),wy=B-90-((t*10+i*33)%120);g.fillStyle='rgba(160,255,230,'+(.35+.25*sin(a*3))+')';g.beginPath();g.arc(wx,wy,2.4,0,TAU);g.fill()}};
 A.demon=(g,X,Y,W,H,t)=>{const B=Y+H;for(const s of[-1,1])fire(g,'df',X+W/2+s*120,B-74,t,.8,['#c040ff','#ff60b0','#ffe0f0'])};
 A.gunslinger=(g,X,Y,W,H,t)=>{};
 A.berserker=(g,X,Y,W,H,t)=>{const sx=X+W/2+135,sy=Y+H-366;for(let i=0;i<4;i++){const u=((t*.35+i/4)%1),a=.32*(1-u);g.fillStyle='rgba(170,165,175,'+a+')';g.beginPath();g.arc(sx+sin(t+i*2)*10+u*30,sy-u*90,8+u*16,0,TAU);g.fill()}};
 A.brawler=(g,X,Y,W,H,t)=>{const hx=X+W-34,hy=Y+H-232,a=sin(t*2.2)*.2;g.save();g.translate(hx,hy);g.rotate(a);g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(0,0);g.lineTo(0,28);g.stroke();box(g,-17,28,34,80,'#c0303a',2.2,12);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-17,48,34,6);g.fillRect(-17,84,34,6);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(-11,34,5,60);g.restore()};
 A.stormcaller=(g,X,Y,W,H,t,nt)=>{const L=316,Rr=W-26,mx=X+(L+Rr)/2,hy=Y+H-540;const sp=SPR.blade||(SPR.blade=(()=>{const c=document.createElement('canvas');c.width=56;c.height=210;const x=c.getContext('2d');x.lineJoin='round';box(x,24,0,8,210,'#6a4528',1.6);x.fillStyle='rgba(244,234,212,.92)';x.fillRect(32,30,22,172);x.strokeStyle='#6a4528';x.lineWidth=2;x.strokeRect(32,30,22,172);for(let yy=44;yy<200;yy+=16){x.beginPath();x.moveTo(32,yy);x.lineTo(54,yy);x.stroke()}x.beginPath();x.moveTo(43,30);x.lineTo(43,202);x.stroke();return c})());
  const a=t*.9;for(let i=0;i<4;i++){g.save();g.translate(mx,hy);g.rotate(a+i*PI/2);g.drawImage(sp,-28,-206,56,210);g.restore()}ell(g,mx,hy,14,14,'#4a5a7a',2);ell(g,mx,hy,5,5,'#ffe24a',1);
  const ry=Y+H-520-194,ph=(t*1.3)%3;if(ph<.25){g.save();g.globalCompositeOperation='lighter';addGlow(g,'rgba(255,240,120,.9)',mx,ry,34,1-ph*3);g.restore();g.strokeStyle='rgba(255,250,200,'+(1-ph*4)+')';g.lineWidth=2;g.beginPath();g.moveTo(mx,ry);g.lineTo(mx-12,ry-18);g.lineTo(mx-2,ry-22);g.lineTo(mx-14,ry-40);g.stroke()}
  const sx=X+24+290-63,sy=Y+H-384;for(let i=0;i<3;i++){const u=((t*.3+i/3)%1);g.fillStyle='rgba(240,240,245,'+(.35*(1-u))+')';g.beginPath();g.arc(sx+sin(t+i)*6,sy-u*70,7+u*12,0,TAU);g.fill()}};
 A.druid=(g,X,Y,W,H,t,nt)=>{if(nt<.3)return;for(let i=0;i<6;i++){const fx=X+40+((i*97+t*12)%(W-80)),fy=Y+H-40-((i*53)%140)+sin(t*1.7+i)*10,a=(.4+.6*sin(t*2.3+i*1.7)**2)*min(1,(nt-.3)*2);g.fillStyle='rgba(220,255,140,'+a+')';g.fillRect(fx-1.5,fy-1.5,3,3)}};
 A.ninja=(g,X,Y,W,H,t)=>{};
 A.elementalist=(g,X,Y,W,H,t)=>{const cx=X+W/2,cy=Y+H-372-196-80;for(let i=0;i<2;i++){const a=t*1.6+i*PI,ox=cx+cos(a)*44,oy=cy+sin(a)*16;g.save();g.globalCompositeOperation='lighter';addGlow(g,i?'rgba(140,220,255,.9)':'rgba(255,140,60,.9)',ox,oy,16,.9);g.restore();ell(g,ox,oy,5,5,i?'#d8f8ff':'#ffd080',1.2)}
  fire(g,'ef',X+W/2-144,Y+H-118,t,.7,['#ff6a2a','#ffc04a','#fff3c0'])};
 A.gate=(g,X,Y,W,H,t)=>{const cx=X+W/2,cy=Y+H-200;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const a=t*(.5+i*.07)+i*.63,r=30+((t*30+i*23)%120);g.fillStyle='rgba(200,230,255,'+(.55*(1-r/150))+')';g.fillRect(cx+cos(a)*r-1.5,cy+sin(a)*r*.9-1.5,3,3)}g.restore()};
 A.dais=(g,X,Y,W,H,t)=>{const cx=X+W/2,B=Y+H-20,sp=SPR.beam||(SPR.beam=(()=>{const c=document.createElement('canvas');c.width=64;c.height=256;const x=c.getContext('2d'),gr=x.createLinearGradient(0,0,64,0);gr.addColorStop(0,'rgba(95,240,224,0)');gr.addColorStop(.5,'rgba(190,255,250,.85)');gr.addColorStop(1,'rgba(95,240,224,0)');x.fillStyle=gr;x.fillRect(0,0,64,256);const g2=x.createLinearGradient(0,0,0,256);g2.addColorStop(0,'rgba(0,0,0,1)');g2.addColorStop(1,'rgba(0,0,0,0)');x.globalCompositeOperation='destination-out';x.fillStyle=g2;x.fillRect(0,0,64,256);return c})());
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.55+.15*sin(t*3);g.drawImage(sp,cx-40,B-420,80,420);g.globalAlpha=1;for(let i=0;i<8;i++){const u=((t*.6+i/8)%1);g.fillStyle='rgba(220,255,250,'+(.8*(1-u))+')';g.fillRect(cx-24+((i*37)%48),B-u*380,3,3)}g.restore()};
 A.shrine=(g,X,Y,W,H,t)=>{const px=X+W-T*2.5,B=Y+H-8,sp=SPR.beam;if(!sp)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.35+.1*sin(t*3);g.drawImage(sp,px-30,B-160,60,160);g.restore()};
 // ---------- cache: one facade + glow canvas per (piece, zoom bucket), LRU by pixel budget; painting is queued so a frame paints at most one
 const C=new Map(),MAXPX=34e6;let px=0;
 const bucket=s=>max(.5,min(2.5,round(s*4)/4));
 function paint(it,k){const W=it.W,H=it.H,c=document.createElement('canvas');c.width=ceil(W*k);c.height=ceil(H*k);const x=c.getContext('2d');x.scale(k,k);x.lineJoin='round';x.lineCap='round';
  const gk=max(.25,k*.5),gl=document.createElement('canvas');gl.width=ceil(W*gk);gl.height=ceil(H*gk);const q=gl.getContext('2d');q.scale(gk,gk);
  try{(P[it.cls]||(()=>{}))(x,q,W,H,rng(hs(it.id)))}catch(e){if(!paint.e){paint.e=1;console.error('HOUSE7',it.cls,e)}}
  return{c,gl,px:c.width*c.height+gl.width*gl.height,u:0}}
 function get(it,k,force){const key=it.id+'@'+k;let e=C.get(key);if(e){e.u=performance.now();return e}if(!force)return null;e=paint(it,k);e.u=performance.now();C.set(key,e);px+=e.px;
  if(px>MAXPX){const arr=[...C].sort((a,b)=>a[1].u-b[1].u);for(const[kk,v]of arr){if(px<=MAXPX*.8||v===e)break;C.delete(kk);px-=v.px}}return e}
 let painted=0;
 function draw(g,it,k,ox,oy,t,nt){let e=get(it,k);if(!e&&painted<2){painted++;e=get(it,k,true)}if(e){g.drawImage(e.c,ox,oy,it.W,it.H);const a=min(.74,.16+nt*.7);if(a>.02){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(e.gl,ox,oy,it.W,it.H);g.restore()}}
  const an=A[it.cls];if(an)try{an(g,ox,oy,it.W,it.H,t,nt)}catch(err){if(!draw.e){draw.e=1;console.error('HOUSE7 anim',it.cls,err)}}}
 // warm-up: paint one missing piece per call (call once per frame while in the plaza)
 function warm(items,k){for(const it of items){if(!C.has(it.id+'@'+k)){get(it,k,true);return true}}return false}
 function frame(){painted=0}
 return{draw,warm,frame,bucket,get,P,A,cache:C,get px(){return px},glowSpr,addGlow,CLS:Object.keys(P)}})();
