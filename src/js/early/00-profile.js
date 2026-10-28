// ===== Single save: Rootbound is single-player and has no accounts, so every save key is used as-is. =====
// Older versions kept account saves under an "a_<id>_" prefix. If the last session was an account and there is no plain save yet,
// that account's save is copied to the plain keys once, so nobody loses progress.
const RB_SESS={id:'guest',name:'Guest'},RB_PREFIX='';
(function(){try{const KEYS=/^(rbp|rbp_bak|rbopt|rbw_|rbidx|rbid|rbc)/,s=JSON.parse(localStorage.getItem('rb_session')||'null');
 if(s&&typeof s.id=='string'&&s.id!='guest'&&!localStorage.getItem('rbp')){const pre='a_'+s.id+'_',ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(pre)&&KEYS.test(k.slice(pre.length)))ks.push(k)}
  for(const k of ks)localStorage.setItem(k.slice(pre.length),localStorage.getItem(k))}
 localStorage.removeItem('rb_session')}catch(_){}})();
