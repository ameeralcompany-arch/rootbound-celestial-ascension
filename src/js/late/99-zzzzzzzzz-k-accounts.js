// ===== ACCT13: each account's progress lives on the server, so it follows the account to any computer and a reset really starts everyone over. Signing in
// makes that account's save the active one (RB_ACCT) and reloads the page; a new account has nothing saved, so it starts at level 1. While you play, the save
// is sent to the server every 30 s when it has changed (not your local worlds, the backup copy or god mode). The server's copy wins: if it is newer (another
// computer) it replaces this one, and if the server was reset (gen) this copy is wiped. The server cannot watch gameplay, so it stores what the game reports. =====
const ACCT13=(()=>{
 const ID=RB_ACCT.id,PRE=RB_ACCT.pre,LS=(()=>{try{return localStorage}catch(_){return null}})(),SKIP=/^(rbw_|rbidx|rbid$|rbp_bak|rbp_corrupt|rbcr|rbprof)/,CH=20000;
 let base=0,last='',live=false,seq=0,asked=false;
 const reload=()=>{try{location.reload()}catch(_){}};
 const setActive=u=>{try{u?LS.setItem('rb_acct',u):LS.removeItem('rb_acct')}catch(_){}};
 function names(){const out=[];for(let i=0;i<LS.length;i++){const k=LS.key(i);if(k&&k.startsWith(PRE))out.push(k.slice(PRE.length))}return out}
 function gather(){const o={};for(const n of names())if(!SKIP.test(n)&&!RB_ACCT.free(n)){const v=LS.getItem(n);if(typeof v=='string')o[n]=v}return o}
 function wipe(){for(const n of names())LS.removeItem(n)}
 function upload(force){if(!live||!ID)return;try{if(CRV8.on)return}catch(_){}try{saveP()}catch(_){}try{celSave()}catch(_){}
  const s=JSON.stringify(gather());if(s===last&&!force)return;if(s.length>1.2e6){console.warn('ACCT13: save too large to upload',s.length);return}
  last=s;const id=++seq,n=Math.max(1,Math.ceil(s.length/CH));for(let i=0;i<n;i++)NET7.send({t:'prof_put',id,i,n,base,d:s.slice(i*CH,(i+1)*CH)})}
 // once the game is showing: the account and its progress are safe, only the sign-in ran out
 function askSignIn(){let n=0;const t=setInterval(()=>{if(++n>480){clearInterval(t);return}try{if(window.RB_COVER||!entered||DLG7.isOpen)return;clearInterval(t);DLG7.confirm('Your sign-in ended','You are on this computer\'s offline save right now. Your account and its progress are safe. Sign in again to get back to them.','Sign in').then(ok=>{if(ok)NET7.signIn()})}catch(_){clearInterval(t)}},500)}
 // called by NET7 for every auth answer; true = the page is reloading, stop here
 function auth(m){if(!LS)return false;
  if(!m.ok){if(ID&&m.expired){try{LS.removeItem('rbtok');LS.setItem('rb_relogin','1')}catch(_){}setActive('');reload();return true}return false}
  if(m.kind=='guest'){if(ID){setActive('');reload();return true}try{if(LS.getItem('rb_relogin')){LS.removeItem('rb_relogin');askSignIn()}}catch(_){}return false}
  try{if(m.name)LS.setItem('rb_lastname',String(m.name).slice(0,64))}catch(_){}
  if(m.uid!==ID){try{if(m.token)LS.setItem('rbtok',m.token)}catch(_){}setActive(m.uid);reload();return true}
  const g=m.gen|0,lg=LS.getItem('rbprofgen');if(lg!=null&&+lg!==g){wipe();LS.setItem('rbprofgen',String(g));LS.setItem('rbprofrev','0');try{if(m.token)LS.setItem('rbtok',m.token)}catch(_){}RB_ACCT.freeze();reload();return true}LS.setItem('rbprofgen',String(g));
  const srv=m.prev|0,mine=+LS.getItem('rbprofrev')||0;base=srv;
  if(srv>mine){asked=true;setTimeout(()=>NET7.send({t:'prof_get'}),0);return false}   // another computer saved something newer
  live=true;setTimeout(()=>upload(true),4000);return false}
 NET7.on('prof',m=>{if(!ID||!m.keys||typeof m.keys!='object')return;live=false;for(const n of names())if(!SKIP.test(n)||/^rbprof/.test(n))LS.removeItem(n);for(const k in m.keys){if(typeof m.keys[k]=='string'&&!RB_ACCT.free(k)&&!SKIP.test(k))LS.setItem(k,m.keys[k])}LS.setItem('rbprofrev',String(m.rev|0));LS.setItem('rbprofgen',String(m.gen|0));RB_ACCT.freeze();reload()});
 NET7.on('prof_ok',m=>{base=m.rev|0;LS.setItem('rbprofrev',String(base))});
 NET7.on('prof_stale',()=>{live=false;NET7.send({t:'prof_get'})});
 setInterval(()=>upload(false),30000);addEventListener('beforeunload',()=>{try{if(live)upload(false)}catch(_){}});
 // gems an earlier version moved from this computer's own save to "pending" for an account come back to it (accounts have their own saves now)
 if(!ID)setTimeout(()=>{try{const q=SHOP7.st;if(q&&q.pend>0){gems=(gems|0)+(q.pend|0);q.pend=0;SHOP7.save();saveP()}}catch(_){}},1500);
 // sign out / disconnect: back to this computer's own save
 function leave(stayOff){try{upload(false)}catch(_){}live=false;if(stayOff)try{sessionStorage.setItem('rb_stayoff','1')}catch(_){}if(ID){setActive('');reload();return true}return false}
 return{auth,leave,upload,get live(){return live},get base(){return base},get active(){return ID}}})();
