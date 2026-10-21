// ===== V6 profile namespace: every per-player save key is prefixed by the active account =====
// Guest = legacy un-prefixed keys (keeps your existing save). Accounts = "a_<id>_" prefix.
// If nobody is signed in yet, writes go to a throw-away "pending_" prefix and the login screen blocks play.
const RB_SESS=(()=>{try{const s=JSON.parse(localStorage.getItem('rb_session')||'null');if(s&&typeof s.id=='string')return s}catch(_){}return null})();
const RB_PREFIX=RB_SESS?(RB_SESS.id=='guest'?'':'a_'+RB_SESS.id+'_'):'pending_';
(function(){const KEYS=/^(rbp|rbp_bak|rbp_corrupt_|rbopt|rbw_|rbidx|rbid|rbc)/,P=Storage.prototype,gi=P.getItem,si=P.setItem,ri=P.removeItem;
 const map=(o,k)=>o===localStorage&&typeof k=='string'&&KEYS.test(k)&&RB_PREFIX?RB_PREFIX+k:k;
 P.getItem=function(k){return gi.call(this,map(this,k))};P.setItem=function(k,v){return si.call(this,map(this,k),v)};P.removeItem=function(k){return ri.call(this,map(this,k))}})();
