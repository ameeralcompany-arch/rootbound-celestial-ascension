// ===== Creative mode is no longer a menu choice: its powers are the server owner's /god command (CRV8). This runs before the save is read and puts back
// any save that a creative session or a god session left behind (the stash made when it started), so nobody stays in those powers without the server's
// say-so: a normal player who was in creative when this update arrived gets their real save back, and the owner's client asks again after signing in.
// RB_CREATIVE reads the live state, so every module that checks it follows /god without a reload. =====
const RB_GOD=(function(){let on=false;const SKIP=/^(rbw_|rbopt$|rbidx$|rbid$|rbtheme$|rbt$|rbplz$|rbcr|rbtok$|rbsrv$)/;
 const keys=LS=>{const a=[];for(let i=0;i<LS.length;i++){const k=LS.key(i);if(k&&/^rb[a-z0-9]/.test(k)&&!SKIP.test(k))a.push(k)}return a};
 try{const LS=localStorage;LS.removeItem('rb_cr_go');if(LS.getItem('rbcr')=='1'){let o=null;try{o=JSON.parse(LS.getItem('rbcr_stash')||'null')}catch(_){}
   if(o&&typeof o=='object'){for(const k of keys(LS))if(!(k in o))LS.removeItem(k);for(const k in o)if(typeof o[k]=='string')LS.setItem(k,o[k])}
   LS.removeItem('rbcr_stash');LS.removeItem('rbcr')}}catch(_){}
 Object.defineProperty(window,'RB_CREATIVE',{get(){return on},configurable:false});
 // the copy that the next load restores. If it cannot be written, god mode stays off rather than risk the real save.
 return{begin(){if(on)return true;try{const LS=localStorage,o={};for(const k of keys(LS))o[k]=LS.getItem(k);LS.setItem('rbcr_stash',JSON.stringify(o));LS.setItem('rbcr','1');on=true;return true}catch(_){return false}},get on(){return on}}})();
