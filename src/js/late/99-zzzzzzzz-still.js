// ===== STILL13: "Still background" (Settings > Graphics, on by default). The sky stays still: clouds, birds, sun rays, twinkling stars
// and the weather-machine scenery (Blossom, Space, Galaxy, Sakura Sunset...) are drawn frozen in place, and there is no weather at all:
// no rain, snow, fog, storms, lightning or tumbling leaves, and weather machines can no longer start any (their scenery still shows, still).
// How: every sky / scenery layer animates from the frame time it is given, so drawSky gets one fixed time while this is on (day and night
// still follow the game clock, and the layers still shift with the camera as you walk, so the world keeps its depth). The weather manager
// is held on 'clear' and the precipitation / fog / leaves layer is not drawn. Switching it off restores everything as it was. =====
const STILL13=(()=>{
 const on=()=>{try{return cel.opt.still!=0}catch(_){return true}};
 let frozen=null;
 {const _ds=drawSky;drawSky=function(w,hh,now){if(on()){if(frozen==null)frozen=now;return _ds.call(this,w,hh,frozen)}frozen=null;return _ds.apply(this,arguments)}}
 {const _dp=drawPrecip;drawPrecip=function(){if(on())return;return _dp.apply(this,arguments)}}
 try{const _u=WX6.update;WX6.update=function(dt){if(!on())return _u.apply(this,arguments);const f=WX6.force;WX6.force='clear';try{return _u.apply(this,arguments)}finally{WX6.force=f}}}catch(_){}
 return{on,get frozen(){return frozen}}})();
