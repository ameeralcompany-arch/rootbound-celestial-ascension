// ===== CRV8: Creative mode. A sandbox on top of your save (the early switch RB_CREATIVE keeps a copy of your normal progress): full level
// (150, the highest any wing or aura asks for), every class and tool at max level, every wing, outfit, weapon, effect and charm unlocked and
// wearable, 999 of every block, seed and object (topped up so they never run out), plenty of gems, and no damage. Switched from the main menu (under Play) or Hub > Settings; the game
// reloads, and going back to Survival restores your normal save exactly as it was. A small CREATIVE badge shows while it is on. =====
const CRV8=(()=>{
 const on=typeof RB_CREATIVE!='undefined'&&!!RB_CREATIVE,FILL=999,GEMS=999999;
 const MAXL=(()=>{let m=100;try{for(const w of WINGS)if(w.src=='level')m=Math.max(m,w.lvl|0)}catch(_){}try{for(const a of AURAS)m=Math.max(m,a.lvl|0)}catch(_){}return Math.min(999,m)})();
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function grant(){
  lvl=MAXL;xp=0;gems=Math.max(gems|0,GEMS);
  try{for(const id in WPN)own[id]=1}catch(_){}
  try{for(const id in WEAR)ownW[id]=1}catch(_){}
  try{for(const it of SHOP7.items){if(it.stack)continue;if(it.cat=='weapons')own[it.ref]=1;else if(it.cat=='gear')ownW[it.ref]=1;SHOP7.st.own[it.id]=1}SHOP7.save()}catch(_){}
  try{WINGX.has=()=>true}catch(_){}
  try{for(const k in CLASS7.C){CLASS7.S.lv[k]=CLASS7.S.lv[k]>=100?CLASS7.S.lv[k]:100;CLASS7.S.xp[k]=0}}catch(_){}
  try{for(const id of TOOLLV.IDS)if(TOOLLV.lvl(id)<TOOLLV.MAX)TOOLLV.set(id,TOOLLV.MAX,0)}catch(_){}
  fill();try{saveP()}catch(_){}try{renderW()}catch(_){}try{renderBar()}catch(_){}}
 // every stackable store item (blocks, seeds, objects, weather machines) kept at 999
 function fill(){try{let ch=0;for(const it of SHOP7.items){if(!it.stack)continue;const k=+it.ref;if(!(k>0))continue;const c=cnt(k);if(c<FILL){addI(k,FILL-c);ch=1}}if(ch)try{barDirty=1}catch(_){}}catch(_){}}
 if(on){
  grant();setInterval(fill,1500);
  // no damage: hits do nothing and health always reads full (covers every damage source, falls and the knock-out check)
  try{hurtP=function(){}}catch(_){}
  try{Object.defineProperty(P,'hp',{get(){try{return maxHP()}catch(_){return 100}},set(){},configurable:true})}catch(_){}
  // level and gems stay topped up if anything spends or changes them
  setInterval(()=>{try{if(lvl<MAXL)lvl=MAXL;if((gems|0)<GEMS/2)gems=GEMS}catch(_){}},2000)}
 // ---- switching
 let dlg=null;
 function ask(){if(dlg)return;dlg=document.createElement('div');dlg.id='crv8d';dlg.setAttribute('role','dialog');dlg.setAttribute('aria-modal','true');
  dlg.innerHTML='<div class="crv8c"><h3>'+(on?'Back to Survival?':'Creative mode')+'</h3>'+(on?'<p>Your normal save comes back exactly as you left it. Things you got in creative are not kept; what you built in your worlds stays.</p>'
   :'<p>Max level, every class and tool maxed, every wing, outfit, weapon, effect and charm unlocked, unlimited blocks and items, and no damage.</p><p>Your normal save is kept safe and comes back when you switch to Survival.</p>')
   +'<div class="crv8b"><button class="btn" data-a="go">'+(on?'Back to Survival':'Start creative')+'</button><button class="btn ghost" data-a="no">Cancel</button></div></div>';
  dlg.onclick=e=>{const a=e.target.closest('[data-a]');if(e.target===dlg||(a&&a.dataset.a=='no'))close();else if(a&&a.dataset.a=='go')toggle()};
  dlg.addEventListener('keydown',e=>{if(e.key=='Escape'){e.stopPropagation();close()}});document.body.appendChild(dlg);try{dlg.querySelector('[data-a=go]').focus()}catch(_){}}
 function close(){if(dlg){dlg.remove();dlg=null}}
 function toggle(){try{saveP()}catch(_){}try{localStorage.setItem('rb_cr_go',on?'off':'on')}catch(_){return false}location.reload();return true}
 // ---- main menu button under Play, Hub > Settings row, badge
 function menuBtn(){const bp=document.getElementById('bp');if(!bp||document.getElementById('bcr'))return;const b=document.createElement('button');b.className='big';b.id='bcr';b.textContent=on?'Back to Survival':'Creative mode';b.onclick=ask;bp.insertAdjacentElement('afterend',b)}
 menuBtn();
 try{const _p=UI6.ext.post;UI6.ext.post=function(tab,body){if(tab=='settings'){const r=document.createElement('div');r.className='hrow';r.innerHTML='<label>Game mode</label><button class="btn'+(on?'':' ghost')+'" id="crv8s">'+esc(on?'Creative · back to Survival':'Survival · try Creative')+'</button>';
   r.querySelector('button').onclick=ask;const h=body.querySelector('h3');h&&h.nextSibling?body.insertBefore(r,h.nextSibling):body.appendChild(r)}return _p&&_p.apply(this,arguments)}}catch(_){}
 if(on){const bd=document.createElement('div');bd.id='crv8b';bd.textContent='Creative';bd.title='Creative mode: max level, everything unlocked, no damage';document.body.appendChild(bd)}
 return{get on(){return on},ask,close,toggle,grant,fill,MAXL,FILL}})();
