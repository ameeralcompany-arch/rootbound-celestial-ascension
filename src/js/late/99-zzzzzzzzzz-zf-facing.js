// ===== FACE1: which way you face in a fight. Before this, the walking keys rewrote your facing every frame, so an attack aimed with the mouse turned you
// for one frame and then snapped you back while the move (and its lunge) carried on the other way. Now:
//   - an attack, a skill, a Mythic swing or a held gun/bow keeps you facing where you aim until it ends (you can still back away, at a careful step);
//   - "which side is the aim" is one test with a small dead zone, so a cursor right on your body never makes you flicker;
//   - the aim is re-read from the pointer every frame, so zooming (ultimates, the camera) never leaves it stale;
//   - a skill pressed during a wind-up waits up to 0.5 s instead of being dropped;
//   - turning is drawn as a quick 70 ms squash-turn (instant for the game itself: hit boxes and logic use the real facing);
//   - other players see your moves: the move id, its facing and its aim travel in presence, and their moves play on them (FIGHT.remote is now called).
try{window.FACE1=(()=>{
 const now=()=>performance.now();
 // ---- fresh aim
 let cX=null,cY=null;try{cv.addEventListener('mousemove',e=>{cX=e.clientX;cY=e.clientY},{passive:true})}catch(_){}
 function freshAim(){if(cX==null)return;try{mx=cX*cv.width/innerWidth/ZM;my=cY*cv.height/innerHeight/ZM}catch(_){}}
 const DZ=6;function side(wx){const d=wx-P.x;return Math.abs(d)<DZ?(P.f>0?1:-1):(d>0?1:-1)}
 const aimX=()=>mx+cam.x,aimY=()=>my+cam.y,aimA=()=>Math.atan2(aimY()-(P.y+23),aimX()-P.x);
 // ---- the attack-facing lock
 let lockUntil=0;function lock(f,ms){P.f=f>0?1:-1;lockUntil=Math.max(lockUntil,now()+(ms||250))}
 const ranged=()=>{try{const w=WPN[wp];if(!w)return false;if(w.k=='bow')return true;return typeof GUN9!='undefined'&&GUN9.AIM&&GUN9.AIM.has(wp)}catch(_){return false}};
 function held(){if(now()<lockUntil)return true;try{if(swing>0)return true}catch(_){}
  try{if(window.FIGHT){const s=FIGHT.state('me');if(s&&s.q&&!s.soft)return true}}catch(_){}
  try{if(typeof MYTH!='undefined'&&MYTH.swing)return true}catch(_){}
  try{if(mdL&&ranged()&&!showInv&&entered)return true}catch(_){}return false}
 // ---- every frame: fresh aim first; a held gun or bow turns you toward the pointer before anything fires
 {const _u=update;update=function(dt){freshAim();try{if(mdL&&ranged()&&!showInv&&entered&&!dlgOpen)P.f=side(aimX())}catch(_){}const r=_u.apply(this,arguments);retry();return r}}
 // ---- backing away mid-swing: you can, at a careful step (45% speed; 70% with a gun or bow, so kiting still works). Swinging forward while
 //      running full speed backwards looked like the two were fighting, and carried you out of your own reach
 {const _p=physics;physics=function(dt,ax,busy){try{if(ax&&Math.sign(ax)!==(P.f>0?1:-1)&&held())ax*=ranged()?.7:.45}catch(_){}return _p.call(this,dt,ax,busy)}}
 // ---- a skill pressed during another move's wind-up is held (up to half a second) and cast the moment the wind-up allows, rather than lost
 let pend=null;function retry(){if(!pend)return;if(now()-pend.t>500){pend=null;return}try{if(window.SK1&&SK1.cast(pend.sk)){pend=null}}catch(_){pend=null}}
 try{if(window.SK1&&SK1.cast){const _c=SK1.cast;SK1.cast=function(sk){const r=_c.apply(this,arguments);if(!r&&sk&&!pend){try{const st=FIGHT.state('me');if(FIGHT.active('me')&&st&&!st.soft&&!sk.dash)pend={sk,t:now()}}catch(_){}}else if(r&&pend&&pend.sk===sk)pend=null;return r}}}catch(_){}
 // ---- a quick squash-turn when you change direction (drawing only)
 const TV=new Map();const reduce=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(_){return false}};
 {const _dc=drawChar;drawChar=function(cx,cy,f){const q=arguments[15],key=q==='me'?'me':String(arguments[4]||'');
   // another player's move: play it on them (once per move, by its id and sequence)
   if(q&&q!=='me'&&typeof q=='object'){try{if(window.FIGHT&&FIGHT.remote)FIGHT.remote(String(arguments[4]||''),q)}catch(_){}}
   const ff=f>0?1:-1;if(reduce()||!key)return _dc.apply(this,arguments);const t=now();let s=TV.get(key);if(!s){s={v:ff,t};TV.set(key,s);if(TV.size>64)TV.delete(TV.keys().next().value)}
   const dt=Math.min(.05,(t-s.t)/1000);s.t=t;if(s.v!==ff){const step=dt/.07*2;s.v=ff>s.v?Math.min(ff,s.v+step):Math.max(ff,s.v-step)}
   if(s.v===ff)return _dc.apply(this,arguments);
   const k=Math.max(.2,Math.abs(s.v)),a=[...arguments];a[2]=s.v>0?1:-1;g.save();try{g.translate(cx,0);g.scale(k,1);g.translate(-cx,0);return _dc.apply(this,a)}finally{g.restore()}}}
 // ---- your move's facing and aim travel with its id: [id, seq, facing, aim x100]
 try{const _n=FIGHT.net;FIGHT.net=function(){const r=_n.apply(this,arguments);if(!r)return r;let a=0;try{a=Math.round(aimA()*100)}catch(_){}return[r[0],r[1],P.f>0?1:-1,Math.max(-315,Math.min(315,a))]}}catch(_){}
 try{const _cc=cleanCx;cleanCx=function(c){const r=_cc.apply(this,arguments);try{if(r&&r.fa&&c&&Array.isArray(c.fa)){r.fa=[r.fa[0],r.fa[1],(+c.fa[2])>0?1:(+c.fa[2])<0?-1:0,Math.max(-315,Math.min(315,(+c.fa[3])|0))]}}catch(_){}return r}}catch(_){}
 // their move plays with their own facing, not the last sampled walking direction
 try{const _o=FIGHT.onRemote;FIGHT.onRemote=function(key,id,q){try{const fa=q&&q.cx&&q.cx.fa;if(Array.isArray(fa)&&fa[2])q=Object.assign({},q,{f:fa[2]})}catch(_){}return _o?_o.call(this,key,id,q):undefined}}catch(_){}
 return{held,lock,side,aimA,freshAim,get pending(){return pend&&pend.sk&&pend.sk.id}}})()}catch(e){console.error('FACE1',e)}
