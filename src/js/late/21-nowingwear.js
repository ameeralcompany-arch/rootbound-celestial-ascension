// ===== Wearable wings are gone. Wings are appearance items (Character menu / Store) and every wing gives a double jump. =====
const REMOVED_WEAR7=['angel','fairy','bat','phoenix','crystal'];
for(const id of REMOVED_WEAR7){try{delete WEAR[id]}catch(_){}}
const WINGFIX7=(()=>{
 function run(){try{let refund=0;for(const id of REMOVED_WEAR7){if(ownW[id]){refund+=({angel:150,fairy:240,bat:330,phoenix:520,crystal:900})[id]||0;delete ownW[id]}}
  for(const sl in wear)if(wear[sl]&&!WEAR[wear[sl]])wear[sl]=''
  if(refund>0){gems+=refund;try{say('Wearable wings were removed. Refunded '+refund+' gems.')}catch(_){}}}catch(_){}}
 run();setInterval(run,300);return{run}})();
// double-jump feathers use the equipped appearance wing's colours, plus a soft whoosh
featherFx=function(n){const w=curWing(lvl);if(!w||parts.length>480)return;const pal=w.pal;for(let i=0;i<n;i++)parts.push({x:P.x-P.f*10,y:P.y+22+rnd(-10,10),vx:-P.f*rnd(20,110)+rnd(-40,40),vy:rnd(-60,40),l:rnd(.6,1.2),c:pal[1+(i%3)],s:rnd(3,5),r:Math.random()*6,k:'f'});
 try{if(n>=10)SFX7.tone(520,880,.18,'sine',.05)}catch(_){}};
