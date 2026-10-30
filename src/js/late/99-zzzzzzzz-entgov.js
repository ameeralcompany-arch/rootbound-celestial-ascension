// ===== ENT13: entity governor. Fixes the slow, compounding FPS slide in long busy fights.
// A 5-minute soak (heavy mining, weapon spam, rain, pets, repeated boss fights) showed heap, DOM, timers and listeners flat, but the
// monster count kept climbing (7 -> 140) because several spawners bypass the natural cap of ~14: boss minions, infection spawns, rifts,
// depth guardians. Each monster costs ~0.02 ms a frame to draw, all of them drawn even far off screen, so frame time crept up for as
// long as the fight lasted (114 -> 86 fps, p95 11.6 -> 26.7 ms).
//  1. Hard ceiling on living monsters (36; 24 with reduced effects; 28 while the frame-time governor PERF7 is cutting effects).
//     Ordinary spawns past the ceiling are skipped. Bosses, rift / vault / elite monsters always spawn; if that goes past the ceiling,
//     the farthest ordinary monster quietly leaves to make room.
//  2. Monsters outside the view (plus a margin for big ones) are not drawn. They still move, fight and count; only the drawing is skipped.
// stats() reports the counts for the soak test (tests/perfsoak.js). =====
const ENT13=(()=>{
 const prot=m=>!!(m&&(m.boss||m.rift||m.vg||m.elite||m.ev));
 const cap=()=>{let c=36;try{if(QM.reduce)c=24}catch(_){}try{if(PERF7.k<.6)c=Math.min(c,28)}catch(_){}return c};
 const live=()=>{let n=0;for(let i=0;i<mobs.length;i++){const m=mobs[i];if(m&&!m.dead&&m.hp>0)n++}return n};
 let skipped=0,evicted=0,culled=0;
 function farthest(){let best=-1,bd=-1;for(let i=0;i<mobs.length;i++){const m=mobs[i];if(!m||prot(m)||m.dead)continue;const d=Math.abs(m.x-P.x)+Math.abs(m.y-P.y);if(d>bd){bd=d;best=i}}return best}
 const base=Array.prototype.push;
 function push(){const c=cap();let n=live();for(let a=0;a<arguments.length;a++){const m=arguments[a];
   if(n<c||!m){base.call(mobs,m);n++;continue}
   if(prot(m)){const i=farthest();if(i>=0){mobs.splice(i,1);evicted++}base.call(mobs,m);continue}
   skipped++}
  return mobs.length}
 const install=()=>{try{if(mobs.push!==push)mobs.push=push}catch(_){}};install();
 // drawing: skip monsters that are well outside the view
 const vis=m=>{try{const M=Math.max(m.w||32,m.h||32)*1.5+160,vw=cv.width/ZM,vh=cv.height/ZM,px=m.x-cam.x,py=m.y-cam.y;return px>-M&&px<vw+M&&py>-M&&py<vh+M}catch(_){return true}};
 {const _dm=drawMob;drawMob=function(m){if(!m.boss&&!vis(m)){culled++;return}return _dm.apply(this,arguments)}}
 {const _u=updMobs;updMobs=function(){install();return _u.apply(this,arguments)}}
 return{cap,live,vis,stats:()=>({live:live(),cap:cap(),skipped,evicted,culled,parts:typeof parts!='undefined'?parts.length:-1,pool:typeof PPOOL!='undefined'?PPOOL.length:-1})}})();
