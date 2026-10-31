// ===== LOAD15: every class keeps its own loadout. While you play a class, what you wear (hat, body, wings, boots, gloves), the weapon in your
// hand, the whole hotbar and the mythic outfit switch are remembered for that class. When you switch class (at a class master or with
// Equip in the Classes screen), the old class's loadout is stored and the new class's is put back (only what you still own). A class
// you have never played keeps what you had on. State: RB_PREFIX + 'rbload'. =====
const LOAD15=(()=>{
 const SK=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbload';let L={};
 try{const o=JSON.parse(localStorage.getItem(SK())||'null');if(o&&typeof o=='object')L=o}catch(_){}
 const save=()=>{try{localStorage.setItem(SK(),JSON.stringify(L))}catch(_){}};
 const SLOTS=['hat','body','wing','boot','glove'];
 const cls=()=>{try{return CJOB.cur||null}catch(_){return null}};
 function snap(){const o={wear:{},hot:[],cur:-1,wp:typeof wp=='string'?wp:'fist',out:1};try{for(const s of SLOTS)o.wear[s]=wear[s]||''}catch(_){}
  try{o.hot=HOTBAR.slots.map(x=>x==null?null:x);o.cur=HOTBAR.cur}catch(_){}try{o.out=MYTH.outfit}catch(_){}return o}
 const ownsWear=(s,id)=>{if(!id)return true;try{if(s=='wing'){const w=WINGS.find(x=>x.id==id);return !!w&&(typeof wingOwned!='function'||wingOwned(w))}return !!ownW[id]}catch(_){return false}};
 const ownsKey=k=>{if(k==null)return true;try{if(typeof k=='string'&&k.startsWith('w:'))return !!own[k.slice(2)]||k=='w:fist';if(typeof k=='number')return cnt(k)>0;return HOTBAR.assignable(k)}catch(_){return false}};
 function apply(o){if(!o)return;try{for(const s of SLOTS){const id=o.wear&&o.wear[s];if(id!==undefined&&ownsWear(s,id))wear[s]=id}}catch(_){}
  try{if(Array.isArray(o.hot))o.hot.forEach((k,i)=>{if(i<HOTBAR.N&&ownsKey(k)){if(k==null)HOTBAR.clear(i);else HOTBAR.set(i,k)}})}catch(_){}
  try{if(o.cur>=0&&o.hot&&o.hot[o.cur]!=null)HOTBAR.pick(o.cur);else if(o.wp&&own[o.wp]&&!CJOB.blocks(o.wp))HOTBAR.equip('w:'+o.wp)}catch(_){}
  try{if(o.out!=null)MYTH.setOutfit(o.out)}catch(_){}try{renderW();renderBar()}catch(_){}try{if(typeof saveP=='function')saveP()}catch(_){}}
 // watch the class: remember the current loadout every second; on a change, file the last one under the old class and restore the new one
 let last=null,lastSnap=null;
 setInterval(()=>{try{if(!entered)return;const c=cls();if(c!==last){if(last&&lastSnap){L[last]=lastSnap}if(c&&L[c])apply(L[c]);last=c;lastSnap=c?snap():null;if(c)L[c]=lastSnap;save();return}if(c){lastSnap=snap();L[c]=lastSnap}}catch(e){if(!LOAD15.e){LOAD15.e=1;console.error('LOAD15',e)}}},1000);
 setInterval(save,8000);addEventListener('beforeunload',save);
 return{get data(){return L},snap,apply,save}})();
