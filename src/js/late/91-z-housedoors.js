// ===== HDOOR9: small house doors you walk through (1 wide x 2 tall). Not the world-travel doors (DOORS6 / the EXIT door): these are
// tiles 95 (bottom, the item) + 96 (top), saved with the world like any block. They are never solid for you: a door swings open when you
// walk up to it and swings shut behind you (E next to it holds it open / lets it close). Closed doors stop walking monsters.
// The art is pre-rendered once into 9 open/close frames (BLK9.paintDoor), drawn right after the blocks for the doors in view only. =====
const HDOOR9=(()=>{
 const B=95,TOP=96,NF=9,frames=[],st=new Map();let scanT=0,full=true;
 const frame=i=>{if(frames[i])return frames[i];const c=document.createElement('canvas');c.width=T;c.height=T*2;BLK9.paintDoor(c.getContext('2d'),i/(NF-1));return frames[i]=c};
 const isDoor=k=>tiles[k]==B&&k>=W&&tiles[k-W]==TOP;
 const S=k=>{let s=st.get(k);if(!s){s={o:0,pin:0,last:0};st.set(k,s)}return s};
 // keep the list of doors: a full scan when a world loads, then the area around the camera twice a second (cheap) + direct adds
 function scan(x0,x1,y0,y1){for(let y=Math.max(1,y0);y<=Math.min(H-1,y1);y++)for(let x=Math.max(0,x0);x<=Math.min(W-1,x1);x++){const k=y*W+x;if(tiles[k]==B&&!st.has(k)&&isDoor(k))S(k)}}
 function prune(){for(const k of st.keys())if(!isDoor(k))st.delete(k)}
 const near=(k,px,py,rx)=>{const x=(k%W+.5)*T,yb=(k/W|0)*T+T;return Math.abs(px-x)<rx&&py>yb-T*2-T*.6&&py-P.h<yb+T*.2};
 function tick(dt){if(!entered||!tiles)return;scanT-=dt;if(full){full=false;st.clear();scan(0,W-1,0,H-1)}else if(scanT<=0){scanT=.5;prune();const vw=cv.width/ZM,vh=cv.height/ZM;scan(Math.floor(cam.x/T)-12,Math.ceil((cam.x+vw)/T)+12,Math.floor(cam.y/T)-8,Math.ceil((cam.y+vh)/T)+8)}
  const fy=P.y+P.h;for(const[k,s]of st){if(!isDoor(k)){st.delete(k);continue}const want=s.pin||near(k,P.x,fy,T*1.45)?1:0,o0=s.o;
   s.o+=(want-s.o)*Math.min(1,dt*(want?11:7));if(Math.abs(want-s.o)<.004)s.o=want;
   if(o0<.08&&s.o>=.08&&want)sfx(k,1);else if(o0>.3&&s.o<=.3&&!want)sfx(k,0)}}
 function sfx(k,open){const now=performance.now(),s=S(k);if(now-s.last<160)return;s.last=now;const d=Math.hypot((k%W+.5)*T-P.x,(k/W|0)*T-P.y);if(d>T*10)return;const v=Math.max(.2,1-d/(T*10));
  try{if(open){SFX7.tone(260,330,.12,'triangle',.028*v);SFX7.tone(520,470,.18,'sine',.012*v,.04)}else{SFX7.tone(180,120,.09,'triangle',.05*v);SFX7.tone(95,70,.12,'sine',.05*v,.02)}}catch(_){}}
 // ---- drawing (after the blocks, before trees and characters)
 function draw(x0,x1,y0,y1){if(!st.size)return;for(const[k,s]of st){const x=k%W,y=k/W|0;if(x<x0-1||x>x1+1||y<y0||y-1>y1+1)continue;g.drawImage(frame(Math.round(s.o*(NF-1))),x*T-cam.x,(y-1)*T-cam.y,T,T*2)}}
 {const _d=TILE7.draw;TILE7.draw=function(x0,x1,y0,y1,now){const r=_d.apply(this,arguments);try{draw(x0,x1,y0,y1)}catch(e){if(!HDOOR9.err){HDOOR9.err=1;console.error('HDOOR9',e)}}return r}}
 // ---- monsters: a walking mob may not step into the column of a closed door (fliers and ghosts ignore doors)
 {const _um=updMobs;updMobs=function(dt){if(!st.size||!mobs.length)return _um.apply(this,arguments);for(const m of mobs)m._px=m.x;const r=_um.apply(this,arguments);
   try{for(const m of mobs){const was=m._px;if(was==null||(MK[m.k]&&(MK[m.k].fly||MK[m.k].ph)))continue;const hw=(m.w||30)/2;for(const[k,s]of st){if(s.o>.5)continue;const dx=(k%W)*T,yb=(k/W|0)*T+T;if(m.y+(m.h||30)<yb-T*2+4||m.y>yb)continue;
     if(m.x+hw>dx+6&&m.x-hw<dx+T-6){m.x=was<dx+T/2?Math.min(was,dx+6-hw):Math.max(was,dx+T-6+hw);m.vx=0;if(m.dir)m.dir=was<dx+T/2?-1:1}}}}catch(_){}return r}}
 // ---- E next to a door holds it open (or lets it close again)
 function nearest(){let b=-1,bd=T*1.6;for(const k of st.keys()){const d=Math.abs((k%W+.5)*T-P.x)+Math.abs((k/W|0)*T-(P.y+P.h-T))*.5;if(d<bd&&near(k,P.x,P.y+P.h,T*1.6)){bd=d;b=k}}return b}
 function toggle(){const k=nearest();if(k<0)return false;const s=S(k);s.pin=s.pin?0:1;try{say(s.pin?'Door held open':'The door will close behind you')}catch(_){}return true}
 {const _lw=loadWorld;loadWorld=function(){st.clear();full=true;return _lw.apply(this,arguments)}}
 // ---- placing and breaking (called from 99-zzzz-build.js): the door needs two free tiles and ground under it
 function place(tx,ty){let by=ty;const free=y=>y>0&&y<H-1&&!tiles[y*W+tx]&&!trees.has(y*W+tx);if(!free(by)||!free(by-1)){if(free(by+1)&&free(by))by=ty+1;else return false}
  const below=tiles[(by+1)*W+tx];if(!below||!SOLID6[below])return false;const k=by*W+tx;tiles[k]=B;hp[k]=BLK[B][2];tiles[k-W]=TOP;hp[k-W]=BLK[B][2];pushEdit(k);pushEdit(k-W);S(k).o=0;pop.set(k,performance.now());return k}
 function breakDoor(k){const kb=tiles[k]==TOP?k+W:k;if(!isDoor(kb))return false;tiles[kb]=0;hp[kb]=0;tiles[kb-W]=0;hp[kb-W]=0;pushEdit(kb);pushEdit(kb-W);st.delete(kb);return kb}
 return{B,TOP,frame,state:st,tick,draw,toggle,place,breakDoor,isDoor,nearest,scan,get count(){return st.size},open:k=>{const s=st.get(k);return s?s.o:0}}})();
{const _t=OBJ6.tick;OBJ6.tick=function(dt){_t.call(this,dt);try{HDOOR9.tick(dt)}catch(e){if(!HDOOR9.terr){HDOOR9.terr=1;console.error('HDOOR9',e)}}}}
