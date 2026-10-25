// ===== Wearable wings are gone. Wings are appearance items (Character menu / Store) and every wing gives a double jump. =====
const REMOVED_WEAR7=['angel','fairy','bat','phoenix','crystal'];
// hidden (non-enumerable) rather than deleted: old saves that still name them can never crash the game
for(const id of REMOVED_WEAR7){try{const v=WEAR[id];Object.defineProperty(WEAR,id,{value:v,enumerable:false,writable:true,configurable:true})}catch(_){}}
const WINGFIX7=(()=>{
 function run(){try{let refund=0;for(const id of REMOVED_WEAR7){if(ownW[id]){refund+=({angel:150,fairy:240,bat:330,phoenix:520,crystal:900})[id]||0;delete ownW[id]}}
  for(const sl in wear)if(wear[sl]&&(!WEAR[wear[sl]]||REMOVED_WEAR7.includes(wear[sl])))wear[sl]=''
  if(refund>0){gems+=refund;try{say('Wearable wings were removed. Refunded '+refund+' gems.')}catch(_){}}}catch(_){}}
 run();setInterval(run,300);return{run}})();
// double-jump feathers use the equipped appearance wing's colours, plus a soft whoosh
featherFx=function(n){const w=curWing(lvl);if(!w||parts.length>480)return;const pal=w.pal;for(let i=0;i<n;i++)parts.push({x:P.x-P.f*10,y:P.y+22+rnd(-10,10),vx:-P.f*rnd(20,110)+rnd(-40,40),vy:rnd(-60,40),l:rnd(.6,1.2),c:pal[1+(i%3)],s:rnd(3,5),r:Math.random()*6,k:'f'});
 try{if(n>=10)SFX7.tone(520,880,.18,'sine',.05)}catch(_){}};
// saves made before this update may still reference the removed wings: clean them while the save is read, before anything draws them
{const _ss=sanitizeSave;sanitizeSave=function(p){const r=_ss(p);try{if(r){const pr={angel:150,fairy:240,bat:330,phoenix:520,crystal:900};let ref=0;
 if(r.ownW)for(const id of REMOVED_WEAR7)if(r.ownW[id]){ref+=pr[id]||0;delete r.ownW[id]}
 if(r.wear)for(const sl in r.wear)if(REMOVED_WEAR7.includes(r.wear[sl]))r.wear[sl]='';
 if(ref&&Number.isFinite(+r.gems))r.gems=+r.gems+ref}}catch(_){}return r}}
{const _dw=drawWearIcon;drawWearIcon=function(x,id,S){if(!WEAR[id])return;return _dw(x,id,S)}}
