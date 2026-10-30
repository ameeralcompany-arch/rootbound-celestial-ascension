// ===== PERF7: a light load governor. It keeps a smoothed frame time (window.FDT, read once per frame in VFX.update) next to the fastest
// frame time it has seen lately (the screen's refresh period: ~6.9 ms at 144 Hz, 16.7 ms at 60 Hz), and gives a factor k: 1 while frames
// keep up, down to .45 when they run well over (a storm boss in the rain with every effect on). Decoration-heavy layers multiply their
// counts by k (rain streaks, the classic particle bursts, extra VFX sparks, block-break effects), so busy moments shed a little
// decoration instead of frames. Graphics quality itself never changes on its own, and a 60 Hz screen that keeps up is never thinned. =====
const PERF7=(()=>{
 let ema=1/144,best=1/144,k=1;
 function upd(dt){const f=window.FDT||dt;if(!(f>0))return;ema+=(f-ema)*.04;best=Math.min(best*1.0004,f);if(best<1/400)best=1/400;
  k=Math.max(.45,Math.min(1,1-(ema/best-1.15)*1.25))}
 {const _u=VFX.update;VFX.update=function(dt){try{upd(dt)}catch(_){}return _u.apply(this,arguments)}}
 {const _a=VFX.add;VFX.add=function(){if(k<1&&Math.random()>k)return;return _a.apply(this,arguments)}}
 return{get k(){return k},get ema(){return ema},get best(){return best}}})();
