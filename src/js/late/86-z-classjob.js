// ===== CJOB: class jobs. Talk to a class master in the Plaza (every NPC teaches the class of its house) to choose your class. Once you have a
// class you can only fight with that class's weapons (the fist and the five tools always work; before you choose, every weapon works). When
// the class you are using reaches level 10, any other class master will teach you another class; classes you learned keep their levels and
// you switch between them at their master or in Classes (K). You get a starter weapon if you own none of the class. Creative mode has no
// class limits. The lock itself is applied where weapons are already level-gated (86-z-levelscale gate, hotbar lock). State: RB_PREFIX +
// 'rbpcls' {cur, learned[], hint}. =====
const CJOB=(()=>{
 const NEED=10,C=CLASS7.C,K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpcls';
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const S={cur:null,learned:[],hint:0};
 try{const o=JSON.parse(localStorage.getItem(K())||'null');if(o&&typeof o=='object'){if(Array.isArray(o.learned))S.learned=[...new Set(o.learned.filter(k=>C[k]))];if(C[o.cur]&&S.learned.includes(o.cur))S.cur=o.cur;S.hint=o.hint?1:0}}catch(_){}
 const save=()=>{try{localStorage.setItem(K(),JSON.stringify(S))}catch(_){}};
 const free=()=>typeof RB_CREATIVE!='undefined'&&!!RB_CREATIVE;
 const clsOf=id=>{const w=WPN[id];return w?CLASS7.of(w):null};
 const pw=id=>{try{return typeof WPOWER=='function'?+WPOWER(id)||0:WPN[id].md|0}catch(_){return 0}};
 // true when your class keeps you from using this weapon
 function blocks(id){if(!S.cur||free()||!id||id=='fist')return false;const w=WPN[id];if(!w||w.k=='tool')return false;const k=clsOf(id);return !!k&&k!==S.cur}
 const master=k=>{try{const n=NPC2.list().find(n=>n.cls==k);return n?n.n:'its class master'}catch(_){return'its class master'}};
 function why(id){const k=clsOf(id),w=WPN[id]||{n:'That weapon'},c=C[k];return w.n+' is a '+(c?c.n:'other')+' weapon. You are a '+C[S.cur].n+(S.learned.includes(k)?' (switch to '+c.n+' at '+master(k)+' or in Classes (K))':'')}
 const canLearn=()=>!S.cur||CLASS7.lv(S.cur)>=NEED;
 // the best weapon of class k you own and can use; a starter weapon of the class if you own none
 function weaponFor(k){const ids=Object.keys(WPN).filter(id=>clsOf(id)==k&&WPN[id].k!='tool'&&id!='fist'),ok=id=>(WPN[id].lv|0)<=(lvl|0);let gift=null;
  if(!ids.some(id=>own[id])){const st=ids.filter(ok).sort((a,b)=>(WPN[a].lv|0)-(WPN[b].lv|0)||pw(a)-pw(b))[0]||ids.slice().sort((a,b)=>(WPN[a].lv|0)-(WPN[b].lv|0))[0];
   if(st){own[st]=1;gift=st;try{const it=SHOP7.items.find(i=>i.cat=='weapons'&&i.ref==st);if(it){SHOP7.st.own[it.id]=1;SHOP7.save()}}catch(_){}}}
  const mine=ids.filter(id=>own[id]&&ok(id)).sort((a,b)=>pw(b)-pw(a));return{id:mine[0]||'fist',gift}}
 // choose / learn / switch to class k
 function become(k){if(!C[k]||S.cur===k)return false;const first=!S.cur,learned=S.learned.includes(k);if(!learned&&!canLearn())return false;
  if(!learned)S.learned.push(k);S.cur=k;S.hint=1;save();const r=weaponFor(k);
  try{if(typeof HOTBAR!='undefined'&&HOTBAR.equip)HOTBAR.equip('w:'+r.id);else wp=r.id}catch(_){wp=r.id}try{renderW();renderBar()}catch(_){}
  const c=C[k];try{UI6.say6(c.ic+' '+(learned?'Switched to '+c.n:first?'You are now a '+c.n:'You learned '+c.n),learned?'Only '+c.n+' weapons work for you now.':'Only '+c.n+' weapons work for you now. Reach level '+NEED+' to learn another class from any class master.',3400)}catch(_){}
  if(r.gift)try{say('Starter weapon: '+WPN[r.gift].n+((WPN[r.gift].lv|0)>(lvl|0)?' (usable at level '+WPN[r.gift].lv+')':''))}catch(_){}
  try{VFX.levelUp(P.x,P.y+20)}catch(_){}try{SFX7.tone(523,523,.18,'triangle',.04);SFX7.tone(784,784,.22,'triangle',.04,.1);SFX7.tone(1047,1047,.3,'sine',.04,.2)}catch(_){}
  try{dispatchEvent(new CustomEvent('rbclass',{detail:{cur:k,learned:S.learned.slice()}}))}catch(_){}return true}
 // ---- NPC dialog row (added under the class row of every class master)
 function row(n){const k=n&&n.cls,c=C[k];if(!c)return'';const b=(a,t,dis)=>`<button data-a="${a}"${dis?' disabled':''}>${esc(t)}</button>`,box=(t,btn)=>`<div class="rw" style="border-left:3px solid ${c.c};padding-left:8px"><div style="flex:1"><small>${t}</small></div>${btn||''}</div>`;
  if(free())return box('Creative mode: every weapon works for you.');
  if(S.cur===k)return box('You are a '+esc(c.n)+' (level '+CLASS7.lv(k)+'). '+(CLASS7.lv(k)>=NEED?'You can learn another class from any other class master.':'Reach level '+NEED+' to learn another class.'));
  if(S.learned.includes(k))return box('You learned '+esc(c.n)+' (level '+CLASS7.lv(k)+'). Switching makes only '+esc(c.n)+' weapons work.',b('talk:job','Switch to '+c.n));
  if(n.jc)return box('Become a '+esc(c.n)+'? Only '+esc(c.n)+' weapons will work for you (fist and tools always do).',b('talk:jobok','Yes, become a '+c.n)+b('talk:jobno','Not now'));
  if(!S.cur)return box('Choose '+esc(c.n)+' as your class. '+esc(c.p),b('talk:job','Become a '+c.n));
  if(canLearn())return box('Your '+esc(C[S.cur].n)+' is level '+CLASS7.lv(S.cur)+': you can learn '+esc(c.n)+' too.',b('talk:job','Learn '+c.n));
  return box('Reach level '+NEED+' as a '+esc(C[S.cur].n)+' to learn '+esc(c.n)+' (now level '+CLASS7.lv(S.cur)+').',b('talk:job','Learn '+c.n,1))}
 {const _da=dlgAct;dlgAct=function(a){const n=typeof curNPC!='undefined'?curNPC:null;
   if(a=='talk:job'&&n&&C[n.cls]){if(S.learned.includes(n.cls))become(n.cls);else if(canLearn())n.jc=1;renderDlg();return}
   if(a=='talk:jobok'&&n){n.jc=0;become(n.cls);renderDlg();return}
   if(a=='talk:jobno'&&n){n.jc=0;renderDlg();return}
   if(a=='close'&&n)n.jc=0;return _da.apply(this,arguments)}}
 // ---- one quiet hint (a toast, not a banner), the first time you are in the Plaza without a class and nothing is open
 setInterval(()=>{try{if(S.hint||S.cur||free()||!entered||cur!='plaza'||dlgOpen||(typeof showInv!='undefined'&&showInv)||(typeof INV7!='undefined'&&INV7.isOpen))return;S.hint=1;save();say('Choose your class: talk to a class master in the Plaza (each house teaches its class)')}catch(_){}},4000);
 return{S,NEED,blocks,why,become,canLearn,row,weaponFor,get cur(){return S.cur},get learned(){return S.learned.slice()}}})();
