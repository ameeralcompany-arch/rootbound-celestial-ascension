// ===== V6 social: chat safeguards, emotes, whispers, friends, mute, two-phase trading =====
// Transport facts (honest): rooms are a PeerJS star; the room host relays every message to every guest. So whispers/trades are
// filtered client-side by recipient but are NOT confidential on the wire, and a modified client can lie in a trade. See README.
const EMOTES=[['wave','👋','Wave'],['dance','💃','Dance'],['cheer','🎉','Cheer'],['heart','💖','Heart'],['bow','🙇','Bow'],['sit','🪑','Sit'],['laugh','😄','Laugh'],['think','💭','Think']];
function chatIn6(m){try{const d=m.data;if(!d||typeof d.t!='string')return false;const who=String(d.n||'').slice(0,14);if(X6.mute.includes(who.toLowerCase()))return false;
 const t=performance.now(),b=(chatIn6.b=chatIn6.b||{}),q=(b[m.peer]=(b[m.peer]||[]).filter(x=>t-x<6000));if(q.length>=6)return false;q.push(t);
 if(d.e!=null&&X6.emotes){const em=EMOTES[d.e|0];if(em){const r=rp[m.peer];if(r)try{VFX.burst(r.x,r.y-10,['#ffd36a','#fff'],8,100,1,.6,8)}catch(_){}}}
 return true}catch(_){return false}}
const SOC6=(()=>{
 const rate={};const MUTE={};const mkPanel=()=>{let e=document.getElementById('socui');if(!e){e=document.createElement('div');e.id='socui';e.className='objpanel';document.body.appendChild(e)}return e};
 const peers=()=>rm?rm.peers().filter(p=>!p.isMe&&p.presence&&p.presence.n):[];
 const byName=n=>{n=String(n||'').toLowerCase();return peers().find(p=>p.presence.n.toLowerCase()==n)||peers().find(p=>p.presence.n.toLowerCase().startsWith(n))};
 const myPeer=()=>rm&&rm.id;
 // ---- trading state
 const T6={out:null,inn:null,esc:null};const nameOf=i=>i==0?'gems':OBJ6.itemName(i);const have=(i,n)=>i==0?gems>=n:cnt(i)>=n;const take=(i,n)=>{if(i==0)gems-=n;else addI(i,-n)};const give=(i,n)=>{if(i==0)gems+=n;else addI(i,n)};
 const send=(o)=>{if(rm)rm.emit('x',o)};
 function offer(name,gi,gn,wi,wn){const p=byName(name);if(!p){say('No such player here');return}if(T6.out&&Date.now()-T6.out.t<15000){say('Finish your current offer first');return}if(!have(gi,gn)){say('You do not have that');return}
  const id=Math.random().toString(36).slice(2,10);T6.out={id,to:p.peer,give:[gi,gn],want:[wi,wn],t:Date.now()};send({op:'tr_offer',to:p.peer,id,give:[gi,gn],want:[wi,wn],n:myName});say('Offer sent to '+p.presence.n+' ('+gn+' '+nameOf(gi)+' for '+wn+' '+nameOf(wi)+')')}
 function showInbound(){const o=T6.inn;if(!o)return;const e=mkPanel();e.innerHTML='<h3>Trade offer</h3><p><b>'+esc(o.n)+'</b> gives you <b>'+o.give[1]+' × '+esc(nameOf(o.give[0]))+'</b><br>and wants <b>'+o.want[1]+' × '+esc(nameOf(o.want[0]))+'</b></p><p style="color:#bcb0d8;font-size:12px">'+(have(o.want[0],o.want[1])?'You have it.':'<span style="color:#ff8a8a">You do not have enough.</span>')+' Nothing changes until you confirm. Trades are for in-game items only.</p><div class="row"><button id="tr_y">Accept</button> <button id="tr_n">Decline</button></div>';e.style.display='block';
  e.querySelector('#tr_y').onclick=accept;e.querySelector('#tr_n').onclick=()=>decline()}
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function accept(){const o=T6.inn;if(!o||Date.now()-o.t>20000){say('Offer expired');closeP();T6.inn=null;return}if(!have(o.want[0],o.want[1])){say('You do not have enough');return}
  take(o.want[0],o.want[1]);T6.esc={id:o.id,give:o.give,want:o.want,t:Date.now()};send({op:'tr_acc',to:o.from,id:o.id});T6.inn=null;closeP();say('Waiting for the other player to confirm...')}
 function decline(){const o=T6.inn;if(o)send({op:'tr_no',to:o.from,id:o.id});T6.inn=null;closeP()}
 const closeP=()=>{const e=document.getElementById('socui');if(e)e.style.display='none'};
 function remote(d,from){if(!d||typeof d.op!='string')return;if(d.to!=myPeer())return;
  if(d.op=='wh'){if(X6.mute.includes(String(d.n).toLowerCase()))return;say('[whisper] '+String(d.n).slice(0,14)+': '+String(d.t).slice(0,60));OBJ6.sfx('ok');return}
  if(d.op=='tr_offer'){if(T6.inn&&Date.now()-T6.inn.t<20000)return;const p=rm.ps[from]||{};if(X6.mute.includes(String(p.n||'').toLowerCase()))return;T6.inn={id:d.id,from,give:d.give,want:d.want,n:String(p.n||d.n||'Player').slice(0,14),t:Date.now()};say(T6.inn.n+' sent you a trade offer');OBJ6.sfx('ok');showInbound();return}
  if(d.op=='tr_acc'){const o=T6.out;if(!o||o.id!=d.id||o.to!=from){return}T6.out=null;if(!have(o.give[0],o.give[1])){send({op:'tr_fail',to:from,id:o.id});say('Trade failed: you no longer have the items');return}take(o.give[0],o.give[1]);give(o.want[0],o.want[1]);send({op:'tr_done',to:from,id:o.id});say('Trade complete: got '+o.want[1]+' '+nameOf(o.want[0]));OBJ6.sfx('ok');return}
  if(d.op=='tr_done'){const e=T6.esc;if(!e||e.id!=d.id)return;give(e.give[0],e.give[1]);T6.esc=null;say('Trade complete: got '+e.give[1]+' '+nameOf(e.give[0]));OBJ6.sfx('ok');return}
  if(d.op=='tr_fail'||d.op=='tr_no'){const e=T6.esc;if(e&&e.id==d.id){give(e.want[0],e.want[1]);T6.esc=null;say('Trade cancelled, your items were returned');return}if(T6.out&&T6.out.id==d.id){T6.out=null;say('Offer declined')}return}
 }
 // escrow timeout: refund if the partner never confirms (checked in tick)
 let ac=0;function tick(dt){ac+=dt;if(ac<1)return;ac=0;const e=T6.esc;if(e&&Date.now()-e.t>15000){give(e.want[0],e.want[1]);T6.esc=null;say('Trade timed out, your items were returned')}if(T6.out&&Date.now()-T6.out.t>20000)T6.out=null;if(T6.inn&&Date.now()-T6.inn.t>20000){T6.inn=null;closeP()}}
 // ---- commands
 const HELP='/e <wave|dance|cheer|heart|bow|sit|laugh|think>  /w name msg  /mute name  /unmute name  /friend name  /unfriend name  /friends  /players  /profile name  /trade name giveId n wantId n  (id 0 = gems)  /name x';
 function cmd(t){const a=t.trim().split(/\s+/),c=a[0].toLowerCase();
  if(c=='/help'||c=='/?'){say(HELP);return true}
  if(c=='/e'||c=='/emote'){const i=EMOTES.findIndex(e=>e[0]==(a[1]||'').toLowerCase());if(i<0){say('Emotes: '+EMOTES.map(e=>e[0]).join(', '));return true}emote(i);return true}
  if(c=='/w'||c=='/whisper'){const p=byName(a[1]);const m=a.slice(2).join(' ').slice(0,80);if(!p||!m){say('Usage: /w name message (room players only)');return true}send({op:'wh',to:p.peer,t:m,n:myName});say('[to '+p.presence.n+'] '+m);return true}
  if(c=='/mute'){const n=(a[1]||'').toLowerCase();if(!n){say('Usage: /mute name');return true}if(!X6.mute.includes(n))X6.mute.push(n);x6Save();say('Muted '+n);return true}
  if(c=='/unmute'){X6.mute=X6.mute.filter(x=>x!=(a[1]||'').toLowerCase());x6Save();say('Unmuted');return true}
  if(c=='/friend'){const n=(a[1]||'').slice(0,14);if(!n){say('Usage: /friend name');return true}if(!X6.friends.some(f=>f.toLowerCase()==n.toLowerCase())&&X6.friends.length<100)X6.friends.push(n);x6Save();say('Added '+n+' to friends');return true}
  if(c=='/unfriend'){X6.friends=X6.friends.filter(f=>f.toLowerCase()!=(a[1]||'').toLowerCase());x6Save();say('Removed');return true}
  if(c=='/friends'){const on=new Set(peers().map(p=>p.presence.n.toLowerCase()));say(X6.friends.length?'Friends: '+X6.friends.map(f=>f+(on.has(f.toLowerCase())?' (here)':'')).join(', '):'No friends yet. /friend name');return true}
  if(c=='/players'){const ps=peers();say(ps.length?'Here: '+ps.map(p=>p.presence.n+' Lv'+(p.presence.lv|0)).join(', '):(rm?'Only you are here':'You are not in a room'));return true}
  if(c=='/profile'){const p=byName(a[1]);if(!p){say('Usage: /profile name (players in this room)');return true}const q=p.presence,np=typeof npName=='function'&&q.cx?npName(q.cx.t):'';say(q.n+' · Level '+(q.lv|0)+(np?' · '+np:'')+(X6.friends.some(f=>f.toLowerCase()==q.n.toLowerCase())?' · friend':''));return true}
  if(c=='/trade'){if(!rm){say('Trading needs a room with another player');return true}const n=a.slice(2).map(Number);if(n.length<4||n.some(v=>!Number.isInteger(v)||v<0)||n[1]<1||n[3]<1){say('Usage: /trade name giveId n wantId n  (id 0 = gems)');return true}offer(a[1],n[0],n[1],n[2],n[3]);return true}
  return false}
 let emoCd=0;function emote(i){const t=performance.now();if(t-emoCd<1200)return;emoCd=t;const em=EMOTES[i];bub.me={t:em[1],e:t+2500};if(rm)rm.emit('chat',{n:myName,t:em[1],e:i});try{VFX.burst(P.x,P.y+10,['#ffd36a','#fff'],8,100,1,.6,8)}catch(_){}if(i==1||i==2)P.vy=Math.min(P.vy,-120)}
 return{cmd,emote,remote,offer,accept,decline,tick,T6,EMOTES,mute:MUTE,byName,peers,HELP}})();
const _sc6=sendChat;sendChat=function(){const v=chatEl.value;const t=v.trim();if(t.startsWith('/')&&!t.startsWith('/name ')){let h=false;try{h=SOC6.cmd(t)}catch(e){console.error(e)}if(h){chatEl.value='';chatEl.style.display='none';chatEl.blur();return}}
 const n=performance.now();sendChat.h=(sendChat.h||[]).filter(x=>n-x<5000);if(t&&sendChat.h.length>=4){say('Slow down a little');chatEl.value='';return}sendChat.h.push(n);_sc6()};
const _t94=OBJ6.tick;OBJ6.tick=function(dt){_t94(dt);try{SOC6.tick(dt)}catch(_){}};
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'||menuEl.style.display!='none')return;const k=e.key.toLowerCase();if(k=='b'&&!e.repeat&&entered)SOC6.emote(((SOC6.__e=((SOC6.__e|0)+1)%SOC6.EMOTES.length)))});
