// ===== V6 Auth: local-prototype accounts (PBKDF2), recovery code, guest, per-account saves =====
const AUTH=(()=>{
 const ITER=150000,enc=new TextEncoder(),hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''),unhex=h=>new Uint8Array(h.match(/../g).map(x=>parseInt(x,16)));
 const okName=n=>/^[A-Za-z0-9_-]{3,16}$/.test(n),idOf=n=>n.toLowerCase();
 const rd=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}},raw=localStorage;
 // keys not in the namespaced list are untouched by the profile layer
 async function derive(pw,salt,iters){const km=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:salt,iterations:iters},km,256))}
 const rnd=n=>crypto.getRandomValues(new Uint8Array(n));
 const recCode=()=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',b=rnd(12);let s='';for(let i=0;i<12;i++){s+=A[b[i]%A.length];if(i%4==3&&i<11)s+='-'}return s};
 const fails=()=>rd('rb_fail')||{};
 function lockLeft(id){const f=fails()[id];return f&&f.until>Date.now()?Math.ceil((f.until-Date.now())/1000):0}
 function bad(id){const f=fails(),e=f[id]||{n:0,until:0};e.n++;if(e.n>=5){e.until=Date.now()+30000*Math.min(8,e.n-4)}f[id]=e;raw.setItem('rb_fail',JSON.stringify(f))}
 function good(id){const f=fails();delete f[id];raw.setItem('rb_fail',JSON.stringify(f))}
 const api={
  secure:()=>!!(window.crypto&&crypto.subtle),
  list:()=>(rd('rb_accidx')||[]),
  async create(name,pw){name=String(name||'').trim();if(!okName(name))throw Error('Name must be 3-16 characters: letters, numbers, _ or -');if(String(pw||'').length<8)throw Error('Password must be at least 8 characters');if(!api.secure())throw Error('This browser blocks secure hashing here (open the game over https or localhost). You can still play as a guest.');
   const id=idOf(name);if(rd('rb_acc_'+id))throw Error('That account name is taken on this device');const salt=rnd(16),rc=recCode(),rsalt=rnd(16);
   const acc={v:1,name,salt:hex(salt),iters:ITER,hash:await derive(pw,salt,ITER),rsalt:hex(rsalt),rhash:await derive(rc.replace(/-/g,''),rsalt,ITER),created:Date.now()};
   raw.setItem('rb_acc_'+id,JSON.stringify(acc));const ix=api.list();ix.push(id);raw.setItem('rb_accidx',JSON.stringify(ix));return{id,name,recovery:rc}},
  async login(name,pw){name=String(name||'').trim();const id=idOf(name),acc=rd('rb_acc_'+id);const w=lockLeft(id);if(w)throw Error('Too many attempts. Try again in '+w+'s');
   if(!acc){await derive('x',rnd(16),ITER).catch(()=>0);throw Error('Wrong account name or password')}
   const h=await derive(String(pw||''),unhex(acc.salt),acc.iters||ITER);if(h!==acc.hash){bad(id);throw Error('Wrong account name or password')}good(id);return{id,name:acc.name}},
  async recover(name,code,newpw){const id=idOf(String(name||'').trim()),acc=rd('rb_acc_'+id);const w=lockLeft(id);if(w)throw Error('Too many attempts. Try again in '+w+'s');if(String(newpw||'').length<8)throw Error('New password must be at least 8 characters');
   if(!acc){throw Error('Unknown account or wrong recovery code')}const h=await derive(String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,''),unhex(acc.rsalt),acc.iters||ITER);if(h!==acc.rhash){bad(id);throw Error('Unknown account or wrong recovery code')}good(id);
   const salt=rnd(16),rc=recCode(),rsalt=rnd(16);acc.salt=hex(salt);acc.hash=await derive(newpw,salt,ITER);acc.rsalt=hex(rsalt);acc.rhash=await derive(rc.replace(/-/g,''),rsalt,ITER);acc.iters=ITER;raw.setItem('rb_acc_'+id,JSON.stringify(acc));return{id,name:acc.name,recovery:rc}},
  start(id,name){raw.setItem('rb_session',JSON.stringify({id,name,t:Date.now()}));location.reload()},
  logout(){raw.removeItem('rb_session');location.reload()},
  sess:RB_SESS};
 return api})();
(function(){const L=$('login');if(RB_SESS){return}
 // the single-player desktop app has one save and no login screen
 if(window.RB_CONFIG&&RB_CONFIG.solo&&/Electron/i.test(navigator.userAgent)){AUTH.start('guest','Guest');return}L.style.display='flex';
 let mode='in';const msg=(t,ok)=>{$('lmsg').textContent=t||'';$('lmsg').className=ok?'ok':''};
 const setMode=m=>{mode=m;for(const[k,id]of[['in','ltIn'],['up','ltUp'],['rec','ltRec']])$(id).classList.toggle('on',k==m);$('lfRec').style.display=m=='rec'?'block':'none';$('lfPass').style.display=m=='rec'?'none':'block';$('lgo').textContent=m=='in'?'Sign in':m=='up'?'Create account':'Reset password';$('lp').autocomplete=m=='up'?'new-password':'current-password';msg('');$('lrec').style.display='none'};
 $('ltIn').onclick=()=>setMode('in');$('ltUp').onclick=()=>setMode('up');$('ltRec').onclick=()=>setMode('rec');
 $('lguest').onclick=()=>AUTH.start('guest','Guest');
 const go=async()=>{const b=$('lgo');b.disabled=true;msg('Working...');try{
   if(mode=='in'){const r=await AUTH.login($('lu').value,$('lp').value);AUTH.start(r.id,r.name)}
   else if(mode=='up'){const r=await AUTH.create($('lu').value,$('lp').value);$('lrec').style.display='block';$('lrec').textContent=r.recovery;msg('Account created. Write this recovery code down - it is shown once and is the only way to reset your password.\nThen press Continue.',1);b.textContent='Continue';b.onclick=()=>AUTH.start(r.id,r.name);b.disabled=false;return}
   else{const r=await AUTH.recover($('lu').value,$('lr').value,$('lp2').value);$('lrec').style.display='block';$('lrec').textContent=r.recovery;msg('Password reset. Your NEW recovery code is shown above - save it.',1);b.textContent='Continue';b.onclick=()=>AUTH.start(r.id,r.name);b.disabled=false;return}
  }catch(e){msg(e.message||'Something went wrong')}b.disabled=false};
 $('lgo').onclick=go;for(const i of['lu','lp','lr','lp2'])$(i).addEventListener('keydown',e=>{if(e.key=='Enter')$('lgo').onclick()});
 // animated backdrop: drifting crystal motes + slow rune ring
 const c=$('lbg'),x=c.getContext('2d');let W,H,m=[],t0=performance.now();const rs=()=>{W=c.width=innerWidth;H=c.height=innerHeight};rs();addEventListener('resize',rs);
 for(let i=0;i<70;i++)m.push({x:Math.random(),y:Math.random(),s:Math.random()*2+.5,v:Math.random()*.02+.005,h:Math.random()<.5?270:200});
 (function f(n){if(L.style.display=='none')return;const t=(n-t0)/1000;x.clearRect(0,0,W,H);x.save();x.translate(W/2,H*.46);for(let r=0;r<3;r++){x.save();x.rotate(t*(.05+r*.03)*(r%2?-1:1));x.strokeStyle='rgba(154,107,255,'+(.22-r*.05)+')';x.lineWidth=1.2;const R=Math.min(W,H)*(.42+r*.1);x.beginPath();x.arc(0,0,R,0,6.3);x.stroke();x.setLineDash([2,14]);x.beginPath();x.arc(0,0,R*.93,0,6.3);x.stroke();x.setLineDash([]);x.beginPath();for(let k=0;k<=7;k++){const a=k*6.283*2/7;x[k?'lineTo':'moveTo'](Math.cos(a)*R*.9,Math.sin(a)*R*.9)}x.stroke();x.restore()}x.restore();
  for(const p of m){p.y-=p.v*.016;if(p.y<0)p.y=1;x.fillStyle='hsla('+p.h+',90%,75%,'+(.3+.4*Math.sin(t*2+p.x*9))+')';x.beginPath();x.arc(p.x*W,p.y*H,p.s,0,6.3);x.fill()}requestAnimationFrame(f)})(t0);
 // block legacy input while the login screen is up
 addEventListener('keydown',e=>{if(L.style.display!='none'&&e.target.tagName!='INPUT')e.stopPropagation()},true);
})();
