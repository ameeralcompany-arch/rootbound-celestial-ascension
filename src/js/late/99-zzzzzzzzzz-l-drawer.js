// ===== DRAWER1: the inventory (INV7) as a bottom drawer. It grows out of the hotbar, which stays visible and stays a drop target. Three states: collapsed (a small handle on the
// hotbar), expanded and full view. Drag the handle or the drawer's header up and down (6 px before a drag begins, so a click stays a click), flick it, or tap to toggle.
// A spring runs the motion, transform only; the sheet's height is set just once, when it comes to rest, so the grid inside scrolls normally and nothing reflows while it moves.
// Keys while open: arrows move the selection, [ and ] change category, Enter or E uses, Delete drops, Page Up / Page Down grow and shrink, Esc closes. No controller: the game has no gamepad layer.
// ITEMSRC: "Where to find" and "What is it used for?" on every item kind, read from the same data the game runs on (RPG.items, BIOME17, WPN, WEAR, WINGS, SHOP7); no rate is ever made up. =====
try{(()=>{
 const reduce=()=>{try{return MOTION7.reduce()}catch(_){return false}};
 let el=null,sheet=null,vis=0,v=0,target=0,raf=0,last=0,drag=null,level='half',rest=true,onDone=null;
 const bar=()=>document.getElementById('bar');
 function metrics(){const b=bar(),r=b&&b.getClientRects().length?b.getBoundingClientRect():null,bot=r&&r.height?Math.round(innerHeight-r.top+6):12,z=uiz(),full=Math.max(320,(innerHeight-bot-10)/z),half=Math.min(full,Math.max(340,Math.round(innerHeight*.5/z)));return{bot,full,half}}
 const uiz=()=>{try{return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--uiz'))||1}catch(_){return 1}};
 const stops=()=>{const m=metrics();return[0,m.half,m.full]};
 function moving(){if(!sheet||!rest)return;rest=false;const m=metrics();sheet.style.setProperty('height',m.full+'px','important');paint()}
 function paint(){const m=metrics();sheet.style.transform='translate3d(0,'+(m.full-vis).toFixed(1)+'px,0)'}
 function settle(){rest=true;v=0;raf=0;if(!sheet)return;sheet.style.setProperty('height',Math.round(vis)+'px','important');sheet.style.transform='none';el.dataset.lv=level;const d=onDone;onDone=null;if(d)d()}
 function tick(t){const dt=Math.min(.032,(t-last)/1000||.016);last=t;const k=420,c=34,a=-k*(vis-target)-c*v;v+=a*dt;vis+=v*dt;if(Math.abs(vis-target)<.6&&Math.abs(v)<14){vis=target;paint();settle();return}paint();raf=requestAnimationFrame(tick)}
 function go(to){target=to;moving();if(reduce()){vis=to;paint();settle();return}if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}}
 function setLevel(l){const m=metrics();level=l;go(l=='full'?m.full:m.half)}
 function attach(){if(el)return true;el=document.getElementById('inv7');if(!el)return false;sheet=el.querySelector('.sheet');el.classList.add('drw7');
  el.addEventListener('pointerdown',e=>{if(e.button!=0||!INV7.isOpen)return;const h=e.target.closest('header');if(!h||e.target.closest('button,input,select,a'))return;begin(e,false)})}
 function layout(){if(!el)return;const m=metrics();el.style.setProperty('--dbot',m.bot+'px')}
 // ---- dragging, from the header or from the collapsed handle
 function begin(e,fromHandle){drag={id:e.pointerId,y0:e.clientY,vis0:fromHandle?0:vis,moved:false,fromHandle,t:performance.now(),ly:e.clientY,lt:performance.now(),vy:0};addEventListener('pointermove',move);addEventListener('pointerup',up);addEventListener('pointercancel',up)}
 function move(e){if(!drag||e.pointerId!=drag.id)return;const dy=e.clientY-drag.y0,now=performance.now();if(!drag.moved){if(Math.abs(dy)<6)return;drag.moved=true;if(drag.fromHandle){if(dy>0){drag=null;off();return}try{NAV16.act('inventory')}catch(_){}if(!INV7.isOpen){drag=null;off();return}cancelAnimationFrame(raf);raf=0}else{cancelAnimationFrame(raf);raf=0}moving();document.documentElement.classList.add('drw-drag')}
  if(now>drag.lt){const q=(e.clientY-drag.ly)/(now-drag.lt);drag.vy=drag.vy*.6+q*.4;drag.lt=now;drag.ly=e.clientY}const m=metrics();let w=drag.vis0-dy/uiz();if(w>m.full)w=m.full+(w-m.full)*.2;if(w<0)w=0;vis=w;v=0;paint()}
 function off(){removeEventListener('pointermove',move);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);document.documentElement.classList.remove('drw-drag')}
 function up(e){if(!drag||e.pointerId!=drag.id)return;const d=drag;drag=null;off();
  if(!d.moved){if(d.fromHandle){try{NAV16.act('inventory')}catch(_){}}else setLevel(level=='full'?'half':'full');return}
  const fly=-d.vy*1000,aim=vis+fly*.16,S=stops();let best=S[0];for(const s of S)if(Math.abs(aim-s)<Math.abs(aim-best))best=s;v=fly;if(best==0){try{INV7.close()}catch(_){}return}level=best==S[2]?'full':'half';go(best)}
 // ---- opening and closing
 {const o0=INV7.open;INV7.open=function(){const was=INV7.isOpen,r=o0.apply(this,arguments);try{attach();layout();sheet=el.querySelector('.sheet');if(!was){level='half';if(!drag||!drag.moved){vis=0;v=0;rest=true;moving();paint();setLevel('half')}}}catch(e){console.error('DRAWER1 open',e)}return r}}
 {const c0=INV7.close;INV7.close=function(){const live=INV7.isOpen;try{if(live&&sheet){if(reduce()){vis=0;paint()}else{cancelAnimationFrame(raf);raf=0;const t0=performance.now(),a=vis;moving();const ease=()=>{if(INV7.isOpen||!sheet)return;const k=Math.min(1,(performance.now()-t0)/190);vis=a*(1-k*k);paint();if(k<1)requestAnimationFrame(ease)};requestAnimationFrame(ease)}}}catch(_){}return c0.apply(this,arguments)}}
 addEventListener('resize',()=>{try{if(el&&INV7.isOpen){layout();setLevel(level)}}catch(_){}});
 // ---- keys
 const CATS=()=>[...el.querySelectorAll('nav [data-f]')];
 addEventListener('keydown',e=>{try{if(!INV7.isOpen||!el||e.ctrlKey||e.altKey||e.metaKey)return;const tg=e.target;if(tg&&/^(INPUT|SELECT|TEXTAREA)$/.test(tg.tagName))return;if(window.DLG7&&DLG7.isOpen)return;const k=e.key;
   if(k=='PageUp'||k=='PageDown'){e.preventDefault();e.stopPropagation();if(k=='PageUp')setLevel('full');else if(level=='full')setLevel('half');else INV7.close();return}
   if(k=='['||k==']'){e.preventDefault();e.stopPropagation();const c=CATS(),i=c.findIndex(b=>b.classList.contains('on')),n=c[(i+(k==']'?1:-1)+c.length)%c.length];if(n)n.click();return}
   if(k=='ArrowLeft'||k=='ArrowRight'||k=='ArrowUp'||k=='ArrowDown'){const g=el.querySelector('.grid7'),L=[...g.querySelectorAll('.it7')];if(!L.length)return;e.preventDefault();e.stopPropagation();let i=L.findIndex(t=>t.classList.contains('sel'));const y0=L[0].offsetTop;let cols=L.findIndex(t=>t.offsetTop!=y0);if(cols<1)cols=L.length;const d=k=='ArrowLeft'?-1:k=='ArrowRight'?1:k=='ArrowUp'?-cols:cols;i=i<0?0:Math.max(0,Math.min(L.length-1,i+d));const t=L[i];INV7.select(/^\d+$/.test(t.dataset.k)?+t.dataset.k:t.dataset.k);t.scrollIntoView({block:'nearest'});return}
   if(k=='Delete'&&INV7.selK!=null){const b=el.querySelector('aside [data-a=drop]');if(b){e.preventDefault();e.stopPropagation();b.click()}}}catch(_){}},true);
 // ---- the collapsed handle, on top of the hotbar
 let h=null;function build(){h=document.createElement('button');h.id='invh7';h.type='button';h.setAttribute('aria-label','Open your items (I)');h.dataset.n16tip='Items|Drag up, or click|I';h.innerHTML='<i></i><span>Items</span>';document.body.appendChild(h);h.addEventListener('pointerdown',e=>{if(e.button==0){e.preventDefault();begin(e,true)}});h.addEventListener('keydown',e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();e.stopPropagation();try{NAV16.act('inventory')}catch(_){}}})}
 setInterval(()=>{try{if(!h)build();const b=bar(),show=typeof entered!='undefined'&&entered&&!window.RB_COVER&&!INV7.isOpen&&b&&b.getClientRects().length&&menuEl.style.display=='none'&&!(typeof creatorOn!='undefined'&&creatorOn);h.style.display=show?'':'none';if(show){const r=b.getBoundingClientRect();h.style.left=Math.round(r.left+r.width/2)+'px';h.style.top=Math.round(r.top-24)+'px'}}catch(_){}},300);
 window.DRAWER1={get level(){return level},get vis(){return vis},get rest(){return rest},setLevel,metrics};
})()}catch(e){console.error('DRAWER1',e)}
// ---- ITEMSRC: every item says what it is, where it comes from and what uses it
try{(()=>{
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const num=k=>typeof k=='number';
 const biomeOf=i=>{try{const b=BIOME17.BI.find(b=>b.ore==i||b.mat==i);return b?b.n:null}catch(_){return null}};
 const wingOf=k=>{try{return wingById(k.slice(5))}catch(_){return null}},shopOf=k=>{try{return SHOP7.byId.get(k.slice(3))}catch(_){return null}};
 const dungeonRows=i=>{try{return RPG.items.dungeonsWith(i)}catch(_){return[]}};
 // [{t:text, go:{kind,arg}?}] : the go button appears only when there is a real place to send you
 function where(k){const o=[];
  if(num(k)){const dg=dungeonRows(k);let src=[];try{src=RPG.items.sources(k)}catch(_){}const b=biomeOf(k);if(b)o.push({t:'Found in '+b+', a depth biome under the surface'});for(const s of src){const d=dg.find(x=>s.startsWith(x.d.n));o.push({t:s,go:d?{kind:'dungeon',arg:d.d.id}:undefined})}return o}
  if(k.startsWith('w:')){const w=WPN[k.slice(2)];if(!w)return o;if(w.cost>0)o.push({t:'Buy it here in your inventory for '+w.cost.toLocaleString()+' gems'+(w.lv?', from level '+w.lv:'')});else if(w.dg)o.push({t:'Forged from dungeon materials',go:{kind:'forge'}});else o.push({t:w.k=='tool'?'A starting tool':'Earned through play, not sold'});return o}
  if(k[0]=='a'&&WEAR[k.slice(2)]){const w=WEAR[k.slice(2)];if(w.cost>0)o.push({t:'Buy it here in your inventory for '+w.cost.toLocaleString()+' gems'+(w.lv?', from level '+w.lv:'')});else o.push({t:'Earned through play, not sold'});return o}
  if(k.startsWith('wing:')){const w=wingOf(k);if(w&&w.lvl)o.push({t:'Reached at level '+w.lvl});else if(w&&w.src=='excl'){const label=w.how&&WINGX.HOW?WINGX.HOW[w.how]:'Achievement';for(const r of WINGX.req(w.id))o.push({t:label+': '+r.t+' ('+r.cur+' / '+r.need+')'})}else o.push({t:'The Store',go:{kind:'store'}});return o}
  if(k.startsWith('id:')){const it=shopOf(k);if(it&&it.price)o.push({t:'The Store, '+it.price.toLocaleString()+' gems',go:{kind:'store'}});else o.push({t:'The Store',go:{kind:'store'}});return o}
  return o}
 function used(k){const o=[];
  if(num(k)){let u=[];try{u=RPG.items.uses(k)}catch(_){}for(const q of u)o.push({t:q.t+(q.n?' × '+q.n:''),go:q.k=='forge'?{kind:'forge'}:undefined});if(!o.length){let p='';try{p=RPG.items.purpose(k)}catch(_){}if(p)o.push({t:p})}return o}
  if(k.startsWith('w:')){const w=WPN[k.slice(2)];if(!w)return o;if(w.k=='tool'){o.push({t:w.d||'A tool'});return o}o.push({t:'Attack with it'});try{const c=CLASS7.of(w);if(c)o.push({t:'A '+CLASS7.C[c].n+' weapon: it trains that class'})}catch(_){}try{if(RPG.isW(k.slice(2)))o.push({t:'Can be upgraded at the forge',go:{kind:'forge',arg:k.slice(2)}})}catch(_){}return o}
  if(k[0]=='a'){const w=WEAR[k.slice(2)];if(w)o.push({t:'Wear it: '+(w.sd||w.d||'')});return o}
  if(k.startsWith('wing:')){o.push({t:'Wear it to glide and fly'});return o}
  if(k.startsWith('id:')){const it=shopOf(k);o.push({t:(it&&it.d)||'Equip it'});return o}
  return o}
 // what the game's rules really allow
 function rules(k){const c=(()=>{try{return DROP2.can(k)}catch(_){return{ok:false,why:''}}})();const T=[];if(k===17)T.push('Can\'t be traded or dropped');else if(num(k)&&k>=731&&k<=749)T.push('Quest item: can\'t be traded');else if(num(k))T.push(c.ok?'Can be traded and dropped':'Can be traded');else if(c.ok)T.push('Can be traded and dropped');else if(c.why&&!/own/.test(c.why))T.push(c.why);return T}
 function go(g){if(!g)return;try{INV7.close()}catch(_){}try{if(g.kind=='dungeon')DG.page.open(null,g.arg);else if(g.kind=='store')STORE7.open();else if(g.kind=='forge')RPG.enh.open(g.arg||(typeof wp!='undefined'?wp:undefined))}catch(e){console.error('ITEMSRC go',e)}}
 let open='',cache=[];
 function list(k,which){cache=which=='where'?where(k):used(k);if(!cache.length)return'<p class="src-none">'+(which=='where'?'No known source.':'Nothing uses it yet.')+'</p>';return'<ul class="src-l">'+cache.map((q,i)=>'<li><span>'+esc(q.t)+'</span>'+(q.go?'<button type="button" class="src-go" data-srcgo="'+i+'">Go</button>':'')+'</li>').join('')+'</ul>'}
 function row(s){if(!s)return'';const k=s.k,own=s.own?(s.n?'You own '+s.n:'You own this'):'You don\'t own this yet',rl=rules(k);return'<div class="src8"><div class="src-b"><button type="button" data-src="where" class="'+(open=='where'?'on':'')+'" aria-expanded="'+(open=='where')+'">Where to find</button><button type="button" data-src="used" class="'+(open=='used'?'on':'')+'" aria-expanded="'+(open=='used')+'">What is it used for?</button></div>'+(open?list(k,open):'')+'<p class="src-r">'+esc(own)+(rl.length?' · '+esc(rl.join(' · ')):'')+'</p></div>'}
 document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-src],[data-srcgo]');if(!t||!t.closest('#inv7'))return;e.stopPropagation();if(t.dataset.srcgo!=null){go((cache[+t.dataset.srcgo]||{}).go);return}open=open==t.dataset.src?'':t.dataset.src;try{const k=INV7.selK;if(k!=null)INV7.select(k)}catch(_){}},true);
 window.ITEMSRC={row,where,used,rules,reset(){open=''}};
})()}catch(e){console.error('ITEMSRC',e)}
