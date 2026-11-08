// ===== CRV8: god mode, the old creative powers, reachable only through the server owner's /god chat command (ONL10 calls enable() when the server says so).
// Full level (150, the highest any wing or aura asks for), every class and tool at max level, every wing, outfit, weapon, effect and charm unlocked and
// wearable, 999 of every block, seed and object (topped up so they never run out), plenty of gems, and no damage. It sits on top of the real save (RB_GOD keeps
// a copy): turning it off reloads and the early switch restores that copy. A small OWNER MODE badge shows while it is on. Other modules read CRV8.on / RB_CREATIVE. =====
const CRV8=(()=>{
 let on=false;const FILL=999,GEMS=999999;
 const MAXL=(()=>{let m=100;try{for(const w of WINGS)if(w.src=='level')m=Math.max(m,w.lvl|0)}catch(_){}try{for(const a of AURAS)m=Math.max(m,a.lvl|0)}catch(_){}return Math.min(999,m)})();
 function grant(){
  lvl=MAXL;xp=0;gems=Math.max(gems|0,GEMS);
  try{for(const id in WPN)own[id]=1}catch(_){}
  try{for(const id in WEAR)ownW[id]=1}catch(_){}
  try{for(const it of SHOP7.items){if(it.stack)continue;if(it.cat=='weapons')own[it.ref]=1;else if(it.cat=='gear')ownW[it.ref]=1;SHOP7.st.own[it.id]=1}SHOP7.save()}catch(_){}
  try{WINGX.has=()=>true}catch(_){}
  try{for(const k in CLASS7.C){CLASS7.S.lv[k]=CLASS7.MAX||75;CLASS7.S.xp[k]=0}}catch(_){}
  try{for(const id of TOOLLV.IDS)if(TOOLLV.lvl(id)<TOOLLV.MAX)TOOLLV.set(id,TOOLLV.MAX,0)}catch(_){}
  fill();try{saveP()}catch(_){}try{renderW()}catch(_){}try{renderBar()}catch(_){}}
 // every stackable store item (blocks, seeds, objects, weather machines) kept at 999
 function fill(){try{let ch=0;for(const it of SHOP7.items){if(!it.stack)continue;const k=+it.ref;if(!(k>0))continue;const c=cnt(k);if(c<FILL){addI(k,FILL-c);ch=1}}if(ch)try{barDirty=1}catch(_){}}catch(_){}}
 function enable(){if(on)return true;if(!RB_GOD.begin())return false;on=true;grant();setInterval(fill,1500);
  // no damage: hits do nothing and health always reads full (covers every damage source, falls and the knock-out check)
  try{hurtP=function(){}}catch(_){}
  try{Object.defineProperty(P,'hp',{get(){try{return maxHP()}catch(_){return 100}},set(){},configurable:true})}catch(_){}
  // level and gems stay topped up if anything spends or changes them
  setInterval(()=>{try{if(lvl<MAXL)lvl=MAXL;if((gems|0)<GEMS/2)gems=GEMS}catch(_){}},2000);
  const bd=document.createElement('div');bd.id='crv8b';bd.textContent='Invincible mode';bd.title='Server owner: max level, everything unlocked, no damage';document.body.appendChild(bd);try{say('Invincible mode on')}catch(_){}return true}
 function disable(){if(!on)return;try{saveP()}catch(_){}location.reload()}
 return{get on(){return on},enable,disable,grant,fill,MAXL,FILL}})();
