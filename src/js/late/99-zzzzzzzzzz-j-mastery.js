// ===== MASTERY1: weapon mastery. Every defeat made with a weapon counts toward that weapon's mastery (read from the game's own kill counter: stat('kill') is
// wrapped, and the weapon is the one in your hand). Five levels at 10, 50, 150, 400 and 1,000 defeats; each pays gems once and shows as stars on the weapon's tile
// in the inventory. Rootlink > Mastery lists every weapon you own with its stars and progress. No damage changes: mastery is pride and gems, not power, so the
// classes stay balanced. State: RB_PREFIX+'rbmast' {w:{id:{k:defeats,l:level paid}}}. =====
try{(()=>{
 const KEY=()=>(typeof RB_PREFIX!='undefined'?RB_PREFIX:'')+'rbmast';
 let S={w:{}};try{S=Object.assign(S,JSON.parse(localStorage.getItem(KEY())||'{}'))}catch(_){}
 let dirty=false;const save=()=>{try{localStorage.setItem(KEY(),JSON.stringify(S))}catch(_){}dirty=false};setInterval(()=>{if(dirty)save()},5000);addEventListener('beforeunload',()=>{if(dirty)save()});
 const NEED=[10,50,150,400,1000],GEMS=[50,150,400,1000,2500],NAMES=['Novice','Adept','Expert','Master','Grandmaster'];
 const lvlOf=k=>NEED.filter(n=>k>=n).length;
 const wname=id=>{try{return(WPN[id]&&WPN[id].n)||id}catch(_){return id}};
 const isWeapon=id=>{try{return !!(WPN[id]&&WPN[id].k!='tool'&&id!='fist')}catch(_){return false}};
 function add(id,n){if(!isWeapon(id)||!(n>0))return;const e=S.w[id]||(S.w[id]={k:0,l:0});e.k+=n;dirty=true;const L=lvlOf(e.k);
  while(e.l<L){const g=GEMS[e.l];e.l++;save();try{gems+=g;say(wname(id)+' mastery: '+NAMES[e.l-1]+'  '+'★'.repeat(e.l)+'  +'+g+' gems');snd(784,.2,'triangle',.05);setTimeout(()=>snd(1175,.3,'triangle',.05),120)}catch(_){}}
  paint()}
 // the game's own kill counter: a defeat counts for the weapon in hand
 try{const s0=stat;stat=function(k,n){const r=s0.apply(this,arguments);try{if(k=='kill'&&n>0)add(typeof wp!='undefined'?wp:'',n)}catch(_){}return r}}catch(e){console.error('MASTERY1 hook',e)}
 // stars on weapon tiles in the inventory (painted after the inventory draws its grid)
 function paint(){const g=document.querySelector('#inv7 .grid7');if(!g)return;for(const t of g.querySelectorAll('.it7[data-k^="w:"]')){const id=t.dataset.k.slice(2),e=S.w[id],l=e?e.l:0;let b=t.querySelector('.wm1');
   if(!l){if(b)b.remove();continue}if(!b){b=document.createElement('i');b.className='wm1';t.appendChild(b)}const s='★'.repeat(l);if(b.textContent!==s){b.textContent=s;b.title=NAMES[l-1]+' mastery'}b.dataset.l=l}}
 try{const mo=new MutationObserver(()=>{if(document.querySelector('#inv7.open,#inv7.show'))paint()});const watch=()=>{const inv=document.getElementById('inv7');if(inv){mo.observe(inv,{childList:true,subtree:true});return true}return false};if(!watch()){const iv=setInterval(()=>{if(watch())clearInterval(iv)},1500)}}catch(_){}
 try{const o=INV7.open;INV7.open=function(){const r=o.apply(this,arguments);setTimeout(()=>{try{const inv=document.getElementById('inv7');if(inv&&!inv.__wm){inv.__wm=1;const mo2=new MutationObserver(()=>paint());mo2.observe(inv,{childList:true,subtree:true})}paint()}catch(_){}},60);return r}}catch(_){}
 // the Mastery page (Rootlink > Mastery)
 let el=null;const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function render(){const owned=Object.keys(typeof own!='undefined'?own:{}).filter(isWeapon);const ids=[...new Set([...owned,...Object.keys(S.w).filter(isWeapon)])].sort((a,b)=>((S.w[b]||{}).k|0)-((S.w[a]||{}).k|0));
  const tot=ids.reduce((n,id)=>n+((S.w[id]||{}).l|0),0);el.querySelector('.wm-count').textContent=tot+' of '+ids.length*5+' stars';
  el.querySelector('.wm-list').innerHTML=ids.length?ids.map(id=>{const e=S.w[id]||{k:0,l:0},l=e.l|0,next=NEED[l],prev=l?NEED[l-1]:0,k=next?Math.min(1,(e.k-prev)/(next-prev)):1;let cc='#F4D59A';try{cc=CLASS7.C[CLASS7.of(id)].c}catch(_){}
   return'<div class="wm-row" style="--c:'+cc+'"><div class="wm-n"><b>'+esc(wname(id))+'</b><small>'+(l?NAMES[l-1]:'Not yet mastered')+' · '+e.k+' defeats</small></div><div class="wm-stars">'+[0,1,2,3,4].map(i=>'<i class="'+(i<l?'on':'')+'">★</i>').join('')+'</div><div class="wm-bar"><u style="width:'+Math.round(k*100)+'%"></u></div><small class="wm-next">'+(next?(next-e.k)+' more for '+NAMES[l]+' · +'+GEMS[l]+' gems':'Grandmaster')+'</small></div>'}).join(''):'<p class="wm-empty">Defeat monsters with a weapon to start mastering it.</p>'}
 function build(){el=document.createElement('div');el.id='wm1';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Weapon mastery');
  el.innerHTML='<div class="wm-scrim"></div><div class="wm-box"><header><div><small>Rootlink</small><h2>Weapon Mastery</h2></div><span class="wm-count"></span><button type="button" class="wm-x" aria-label="Close">×</button></header><p class="wm-sub">Every defeat counts toward the weapon in your hand. Five levels, each with a reward.</p><div class="wm-list"></div></div>';
  document.body.appendChild(el);el.querySelector('.wm-scrim').addEventListener('pointerdown',close);el.querySelector('.wm-x').addEventListener('click',close);
  addEventListener('keydown',e=>{if(el&&el.classList.contains('on')&&e.key=='Escape'){close();e.preventDefault();e.stopImmediatePropagation()}},true)}
 function open(){if(!el)build();try{NAV16.closeAll()}catch(_){}render();el.classList.add('on');return true}
 function close(){if(el)el.classList.remove('on')}
 window.MASTERY1={add,open,close,lvlOf,NEED,GEMS,NAMES,get on(){return !!(el&&el.classList.contains('on'))},get S(){return S},reset(){S={w:{}};save();paint()},paint};
})()}catch(e){console.error('MASTERY1',e)}
