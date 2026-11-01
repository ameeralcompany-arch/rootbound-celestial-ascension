// ===== RB_ACCT: every signed-in account has its own save. While one is active, each game key in this browser's storage is read and written under
// "a_<account id>_", so a new account starts empty (level 1) whatever this computer has played before, and the offline save stays untouched under the plain
// keys. This runs before anything reads a save. Device-wide keys keep their names: "rb_*", the sign-in token and the server address. Which account is active
// is decided by ACCT13 (late), which reloads the page when it changes. =====
const RB_ACCT=(()=>{let id='',ls=null,fz=false;try{ls=window.localStorage;id=ls.getItem('rb_acct')||''}catch(_){return{id:'',pre:'',free:()=>true,freeze(){}}}
 if(!/^[A-Za-z0-9_-]{1,40}$/.test(id))id='';const pre=id?'a_'+id+'_':'',free=k=>/^rb_|^rbtok$|^rbsrv$|^a_/.test(k);
 if(id){const S=Storage.prototype,g=S.getItem,s=S.setItem,r=S.removeItem,mp=(o,k)=>{k=String(k);return o===ls&&!free(k)?pre+k:k};
  S.getItem=function(k){return g.call(this,mp(this,k))};S.setItem=function(k,v){if(fz&&this===ls&&!free(String(k)))return;return s.call(this,mp(this,k),v)};S.removeItem=function(k){if(fz&&this===ls&&!free(String(k)))return;return r.call(this,mp(this,k))}}
 // freeze: a save was just replaced and the page is reloading, so the game's save-on-close must not write the old state over it
 return{id,pre,free,freeze(){fz=true}}})();
