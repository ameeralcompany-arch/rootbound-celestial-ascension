// ===== INV7 (v8 inventory). Everything you own in one sheet: tabs (weapons, tools, gear, wings, charms, blocks ...), search, sorting,
// and an "Equipped" strip (hand, hat, body, boots, gloves, wings, charm) with one-click unequip. Equipping anything is one action:
// the big button in the details, double-click a tile, E / Enter on the selected tile, right-click for a menu (equip, hotbar slot 1-7,
// favourite, drop), or drag a tile onto the Equipped strip (equips it) or onto a hotbar slot (HOTBAR, 99-zzz-hotbar.js).
// Weapons and tools are ordered by rarity tier (mythic first) and then power (ITEM7.power = window.WPOWER when the balance module
// provides it). The sheet is rebuilt only when something changes; selecting a tile patches the tile classes + details only. =====
const INV7=(()=>{
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const FILT=[['all','All'],['weapons','Weapons'],['tools','Tools'],['wear','Gear'],['wings','Wings'],['charms','Charms'],['blocks','Blocks'],['seeds','Seeds'],['mats','Materials'],['objects','Objects'],['fav','★ Favourites'],['stats','Stats']];
 let el=null,filter='all',selK=null,assign=-1,q='',sortBy='default',favs={},seen=null,got={},menu=null,clk={k:null,t:0},last=[];
 const PK=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpinv';
 try{const o=JSON.parse(localStorage.getItem(PK())||'{}');favs=o.f||{};sortBy=o.s||'default';if(o.n&&typeof o.n=='object')seen=o.n;if(o.g&&typeof o.g=='object')got=o.g}catch(_){}
 const saveP=()=>{try{localStorage.setItem(PK(),JSON.stringify({f:favs,s:sortBy,n:seen||{},g:got}))}catch(_){}};
 const SORTS=[['default','Smart order'],['rar','Rarity, then power'],['power','Power'],['name','Name A–Z'],['new','Newest first'],['count','Most owned'],['value','Highest value']];
 const snd=n=>{try{UIS.play(n)}catch(_){}};
 // ---- item vocabulary: numbers = blocks / seeds / materials / objects, 'w:' weapon or tool, 'a:' wearable, 'wing:' wings, 'id:' charm or effect
 const isNew=i=>i.own&&seen&&!seen[i.k];
 const kind=k=>{if(typeof k=='string'){if(k.startsWith('w:'))return(WPN[k.slice(2)]||{}).k=='tool'?'tools':'weapons';if(k[0]=='a')return'wear';if(k.startsWith('wing:'))return'wings';if(k.startsWith('id:'))return'charms'}
  return({block:'blocks',seed:'seeds',mat:'mats',fish:'mats',bait:'mats',obj:'objects',door:'objects'})[ITEM7.cat(k)]||'blocks'};
 const wingOf=k=>{try{return wingById(k.slice(5))}catch(_){return null}},shopOf=k=>{try{return SHOP7.byId.get(k.slice(3))}catch(_){return null}};
 const nameOf=k=>{try{if(typeof k!='string')return iname(k);if(k.startsWith('w:'))return WPN[k.slice(2)].n;if(k[0]=='a')return WEAR[k.slice(2)].n;if(k.startsWith('wing:')){const w=wingOf(k);return w?(w.n||w.name||w.id):k}if(k.startsWith('id:'))return(shopOf(k)||{}).n||k}catch(_){}return String(k)};
 const TH={};function thumb(k){if(TH[k])return TH[k];let it=null;if(k.startsWith('wing:'))it={id:'wing_'+k.slice(5),cat:'wings',ref:k.slice(5)};else it=shopOf(k);if(!it)return'';
  try{const c=document.createElement('canvas');c.width=132;c.height=106;STORE7.drawPrev(c.getContext('2d'),it,132,106,.8,.45,true);return TH[k]=c.toDataURL()}catch(_){return''}}
 const iconOf=k=>{try{return typeof k=='string'&&(k.startsWith('wing:')||k.startsWith('id:'))?thumb(k):iconURL(k)}catch(_){return''}};
 const costOf=k=>{try{if(typeof k=='string'&&k.startsWith('id:'))return(shopOf(k)||{}).price|0;return ITEM7.value(k)}catch(_){return 0}};
 const tierOf=k=>{try{if(typeof k=='string'&&k.startsWith('id:')){const it=shopOf(k);return Math.max(0,ITEM7.RAR.indexOf(it.rar=='exclusive'?'mythic':it.rar))}if(typeof k=='string'&&k.startsWith('wing:')){const w=wingOf(k),r=w&&w.rar;const t=ITEM7.RAR.indexOf(r=='exclusive'?'mythic':r);return t>=0?t:Math.min(5,Math.floor(((w&&w.lvl)|0)/25))}return ITEM7.tier(k)}catch(_){return 0}};
 const RARA=k=>' data-cat="'+ITEM7.cat(k)+'" data-rar="'+ITEM7.RAR[tierOf(k)]+'"';
 const isWpn=k=>typeof k=='string'&&k.startsWith('w:');
 const descOf=k=>{const t=kind(k);if(t=='blocks')return 'A building block. Hold it on the hotbar and click to place it; break it with a tool.';if(t=='seeds')return 'Hold it and click soil to plant. It grows in real time, even while the game is closed.';if(t=='mats')return 'Dropped by monsters and bosses. Used in crafting and sold at the market.';
  if(t=='objects')return (ODEF[k].cat=='door'?'An interactive gate. Place it, then press G beside it to choose where it leads.':ODEF[k].cat=='cont'?'Stores items. Place it, then press E beside it to open it.':'A world object. Press E beside it to use it.');
  if(t=='wings'){const w=wingOf(k);return(w&&(w.d||w.desc))||'Wings: worn on your back, they let you glide and fly.'}if(t=='charms'){const it=shopOf(k);return(it&&it.d)||''}return ''};
 // ---- what is equipped: the hand (held hotbar item / weapon), the four wearable slots, wings and the charm
 const HB=()=>typeof HOTBAR!='undefined'?HOTBAR:null,hbSlot=k=>{const h=HB();return h?h.slotOf(k):-1},hbOk=k=>{const h=HB();return!!h&&h.assignable(k)};
 const heldW=id=>{const h=HB();return wp==id&&(!h||h.cur<0||h.held()==='w:'+id)};
 const heldK=()=>{const h=HB(),k=h?h.held():null;if(wp&&wp!='fist')return'w:'+wp;return typeof k=='number'&&cnt(k)>0?k:null};
 const curWingK=()=>{try{const w=curWing(lvl);return w?'wing:'+w.id:null}catch(_){return null}};
 const charmK=()=>{try{const id=SHOP7.st.eq.charm;return id&&SHOP7.has(id)?'id:'+id:null}catch(_){return null}};
 const SLOTS8=[['hand','Hand','✋'],['hat','Head','◠'],['body','Body','▭'],['boot','Boots','⌒'],['glove','Gloves','✊'],['wings','Wings','❧'],['charm','Charm','✿']];
 const eqK=s=>s=='hand'?heldK():s=='wings'?curWingK():s=='charm'?charmK():wear[s]?'a:'+wear[s]:null;
 const isWorn=k=>{if(k==null)return false;if(typeof k=='number')return HB()&&HB().held()===k&&cnt(k)>0;if(isWpn(k))return heldW(k.slice(2));if(k[0]=='a'){const w=WEAR[k.slice(2)];return!!w&&wear[w.s]==k.slice(2)}if(k.startsWith('wing:'))return curWingK()===k;if(k.startsWith('id:'))try{return SHOP7.equipped(k.slice(3))}catch(_){}return false};
 function items(){const out=[];
  for(const k of Object.keys(inv).map(Number).filter(k=>cnt(k)>0&&(MAT[k]||BLK[k%100]||BLK[k])).sort((a,b)=>a-b))out.push({k,t:kind(k),n:cnt(k),own:1,worn:isWorn(k)});
  for(const id in WEAR){const w=WEAR[id];out.push({k:'a:'+id,t:'wear',own:!!ownW[id],lock:lvl<w.lv&&!ownW[id],worn:wear[w.s]==id})}
  const ws=Object.keys(WPN).filter(id=>!(WPN[id].hid&&!own[id])).map(id=>'w:'+id).sort(ITEM7.wcmp);
  for(const k of ws){const id=k.slice(2),w=WPN[id];out.push({k,t:kind(k),own:!!own[id],lock:lvl<(w.lv|0),worn:heldW(id)})}
  try{const cw=curWingK();for(const w of WINGS){let o=false;try{o=!!wingOwned(w)}catch(_){}if(o)out.push({k:'wing:'+w.id,t:'wings',own:1,worn:cw==='wing:'+w.id})}}catch(_){}
  try{for(const it of SHOP7.items)if((it.cat=='charms'||it.cat=='effects')&&SHOP7.has(it.id))out.push({k:'id:'+it.id,t:'charms',own:1,worn:SHOP7.equipped(it.id),sub:it.cat=='effects'?(it.sub||'effect'):'charm'})}catch(_){}
  return out}
 // ---- the main action of an item (the big button, double-click, E / Enter)
 function primary(i){if(!i)return null;const k=i.k,t=i.t;
  if(t=='weapons'||t=='tools'){const w=WPN[k.slice(2)];if(i.lock)return{a:'',l:'Reach level '+w.lv};if(!i.own)return{a:'buy',l:'Buy · '+w.cost+' gems',dis:gems<w.cost};return i.worn?{a:'unequip',l:'Put away'}:{a:'equip',l:'Equip'+(HB()?' · slot '+(HB().equipSlot(k)+1):'')}}
  if(t=='wear'){const w=WEAR[k.slice(2)];if(i.own)return{a:'wear',l:i.worn?'Take off':'Wear'};if(i.lock)return{a:'',l:'Level '+w.lv};return{a:'buy',l:'Buy · '+w.cost+' gems',dis:gems<w.cost}}
  if(t=='wings')return{a:i.worn?'unequip':'equip',l:i.worn?'Take off':'Wear wings'};
  if(t=='charms')return{a:i.worn?'unequip':'equip',l:i.worn?'Unequip':'Equip'};
  if(t=='mats')return null;
  return i.worn?{a:'',l:'In your hand'}:{a:'equip',l:'Hold'+(HB()?' · slot '+(HB().equipSlot(k)+1):'')}}
 // equip / unequip any key. Returns true when something changed.
 function equip(k){const t=kind(k);
  if(t=='weapons'||t=='tools'){const id=k.slice(2),w=WPN[id];if(!own[id]){say('You do not own '+w.n+' yet');snd('error');return false}if(lvl<(w.lv|0)){say('Reach level '+w.lv+' to use '+w.n);snd('error');return false}if(HB())HB().equip(k);else wp=id;try{renderBar()}catch(_){}snd('select');return true}
  if(t=='wear'){const id=k.slice(2),w=WEAR[id];if(!ownW[id]){say('Buy '+w.n+' first');snd('error');return false}wear[w.s]=id;try{G('wear')}catch(_){}try{renderSkills()}catch(_){}snd('select');try{HB()&&HB().render()}catch(_){}return true}
  if(t=='wings'){let ok=false;try{ok=wingEquip(k.slice(5))}catch(_){}if(!ok){snd('error');return false}snd('select');return true}
  if(t=='charms'){try{return!!SHOP7.equip(k.slice(3))}catch(_){return false}}
  if(t=='mats'){say('Materials are for crafting and selling');return false}
  if(typeof k=='number'&&cnt(k)>0&&HB()){HB().equip(k);snd('select');return true}return false}
 function unequip(k){if(k==null)return false;const t=kind(k);
  if(t=='weapons'||t=='tools'||typeof k=='number'){if(HB())HB().unhold();else wp='fist';try{renderBar()}catch(_){}snd('close');return true}
  if(t=='wear'){const w=WEAR[k.slice(2)];if(w&&wear[w.s]==k.slice(2)){wear[w.s]='';try{renderSkills()}catch(_){}try{HB()&&HB().render()}catch(_){}snd('close');return true}return false}
  if(t=='wings'){try{wingUnequip()}catch(_){}snd('close');return true}
  if(t=='charms'){try{SHOP7.unequip(k.slice(3))}catch(_){}return true}return false}
 function buy(k){const t=kind(k);
  if(t=='wear'){const id=k.slice(2),w=WEAR[id];if(lvl<w.lv){say('Reach level '+w.lv+' first');return false}if(gems<w.cost){say('Need '+w.cost+' gems');snd('error');return false}gems-=w.cost;ownW[id]=1;wear[w.s]=id;try{G('wear')}catch(_){}snd('buy');say(w.n+' purchased and worn');try{renderSkills()}catch(_){}return true}
  if(t=='weapons'||t=='tools'){const id=k.slice(2),w=WPN[id];if(lvl<(w.lv|0)){say('Reach level '+w.lv+' to use '+w.n);snd('error');return false}if(gems<w.cost){say('Need '+w.cost+' gems');snd('error');return false}gems-=w.cost;own[id]=1;if(HB())HB().equip(k);else wp=id;try{G('forge')}catch(_){}snd('buy');say(w.n+' purchased and equipped');try{renderBar()}catch(_){}return true}return false}
 function run(a,k){if(k==null||!a)return false;let r=false;if(a=='equip')r=equip(k);else if(a=='unequip')r=unequip(k);else if(a=='buy')r=buy(k);else if(a=='wear')r=isWorn(k)?unequip(k):equip(k);if(isOpen())render();return r}
 function doPrimary(k){const i=items().find(x=>x.k===k);const p=primary(i);if(!p||!p.a||p.dis){if(i)say(!p?nameOf(k)+': nothing to equip — put it on the hotbar or sell it at the market':p.dis?'Not enough gems':p.l);snd('error');return false}const r=run(p.a,k);if(r)pulse(k);return r}
 // throw items on the ground in front of you (picked up again after a moment if you stay close)
 function drop(k,n){if(typeof k!='number'||!(cnt(k)>0))return false;n=Math.max(1,Math.min(cnt(k),n|0));const L=drops.length;spawnDrop(P.x+(P.f||1)*44,P.y+P.h*.4,k,n);if(drops.length==L){say('Too many items on the ground here');return false}
  const d=drops[drops.length-1];d.t=-1.6;d.vx=(P.f||1)*Math.abs(d.vx||120);addI(k,-n);say('Dropped '+n+' × '+nameOf(k));snd('close');if(isOpen())render();return true}
 // ---- rendering
 const mk=()=>{if(el)return;el=document.createElement('div');el.id='inv7';el.className='ed';el.innerHTML='<div class="sheet" role="dialog" aria-label="Inventory"></div>';document.body.appendChild(el);
  const ab=document.createElement('div');ab.className='assignbanner ed';ab.id='asb';document.body.appendChild(ab);
  el.addEventListener('mousedown',e=>{if(menu&&!e.target.closest('#ictx8'))closeMenu();if(e.target===el)close()});el.addEventListener('click',onClick);el.addEventListener('contextmenu',onCtx);
  el.addEventListener('scroll',closeMenu,true);
  // drag a tile onto a hotbar slot (handled by HOTBAR) or onto the Equipped strip (equips it)
  el.addEventListener('dragstart',e=>{const t=e.target.closest&&e.target.closest('.it7[draggable=true]');if(!t)return;closeMenu();let k=t.dataset.k;try{e.dataTransfer.setData('text/plain','rbitem:'+k);e.dataTransfer.effectAllowed='copyMove';const im=t.querySelector('img');if(im)e.dataTransfer.setDragImage(im,24,24)}catch(_){}
   el.classList.add('eqdrag');if(/^\d+$/.test(k))k=+k;if(HB()&&hbOk(k))HB().dragBegin()});
  el.addEventListener('dragover',e=>{const s=e.target.closest('.eq8');if(!s||!el.classList.contains('eqdrag'))return;e.preventDefault();try{e.dataTransfer.dropEffect='copy'}catch(_){}s.classList.add('over')});
  el.addEventListener('dragleave',e=>{const s=e.target.closest('.eq8');if(s&&!s.contains(e.relatedTarget))s.classList.remove('over')});
  el.addEventListener('drop',e=>{const s=e.target.closest('.eq8');if(!s)return;e.preventDefault();s.classList.remove('over');let d='';try{d=e.dataTransfer.getData('text/plain')}catch(_){}if(!d.startsWith('rbitem:'))return;let k=d.slice(7);if(/^\d+$/.test(k))k=+k;selK=k;if(equip(k))pulse(k);render();try{HB()&&HB().dragEnd()}catch(_){}});
  document.addEventListener('dragend',()=>{if(el){el.classList.remove('eqdrag');const s=el.querySelector('.eq8.over');if(s)s.classList.remove('over')}});
  el.addEventListener('input',e=>{if(e.target.id=='inq7'){q=e.target.value;const p=e.target.selectionStart;render();const n=document.getElementById('inq7');if(n){n.focus();try{n.setSelectionRange(p,p)}catch(_){}}}});
  el.addEventListener('change',e=>{if(e.target.id=='ins7'){sortBy=e.target.value;saveP();render()}});
  el.addEventListener('keydown',e=>{if(e.target.id=='inq7'){e.stopPropagation();if(e.key=='Escape'){if(q){q='';render()}else close()}else if(e.key=='Enter'&&last.length){e.preventDefault();const k=last[0].k;if(selK===k)doPrimary(k);else select(k)}}});
  // keyboard: Esc closes (the menu first), E / Enter equip or use the selected item
  addEventListener('keydown',e=>{if(!isOpen())return;if(e.key=='Escape'){if(menu){closeMenu();e.stopPropagation();return}close();e.stopPropagation();return}
   if(e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;try{if(isTextEl(e.target))return}catch(_){}if(DLG7.isOpen)return;
   if((e.key=='e'||e.key=='E'||e.key=='Enter')&&selK!=null&&filter!='stats'){e.preventDefault();e.stopPropagation();closeMenu();doPrimary(selK)}},true)};
 function sorted(all){let list=all.filter(i=>filter=='all'?i.own:filter=='stats'?false:filter=='fav'?(i.own&&favs[i.k]):i.t==filter);
  const qq=q.trim().toLowerCase();if(qq)list=list.filter(i=>(nameOf(i.k)+' '+ITEM7.label(i.k)+' '+(i.sub||'')).toLowerCase().includes(qq)||ITEM7.RN[tierOf(i.k)].toLowerCase()==qq);
  const pw=i=>isWpn(i.k)?ITEM7.power(i.k):0,tv=i=>tierOf(i.k);
  return list.map((i,x)=>[i,x]).sort((A,B)=>{const a=A[0],b=B[0];let d=(favs[b.k]?1:0)-(favs[a.k]?1:0);if(d)return d;d=(b.own|0)-(a.own|0);if(d)return d;
   if(sortBy=='name')d=nameOf(a.k).localeCompare(nameOf(b.k));else if(sortBy=='count')d=(b.n|0)-(a.n|0);else if(sortBy=='rar')d=tv(b)-tv(a)||pw(b)-pw(a)||costOf(b.k)-costOf(a.k);
   else if(sortBy=='power')d=pw(b)-pw(a)||tv(b)-tv(a);else if(sortBy=='value')d=costOf(b.k)-costOf(a.k);else if(sortBy=='new')d=(got[b.k]||0)-(got[a.k]||0)||(isNew(b)?1:0)-(isNew(a)?1:0);
   return d||A[1]-B[1]}).map(x=>x[0])}
 function render(){if(!el)return;const sh=el.querySelector('.sheet'),all=items();let ch=0;if(!seen){seen={};for(const i of all)if(i.own){seen[i.k]=1;got[i.k]=0}ch=1}
  const now=Date.now();for(const i of all)if(i.own&&got[i.k]==null){got[i.k]=now;ch=1}if(ch)saveP();
  const cntOf=f=>all.filter(i=>f=='all'?i.own:f=='fav'?(i.own&&favs[i.k]):(i.t==f&&i.own)).length;
  const list=last=sorted(all),sel=all.find(i=>i.k===selK)||null;
  let h='<header><div><div class="eyebrow">Backpack · '+esc(myName)+'</div><h2 class="ttl">Inventory</h2></div><div style="display:flex;gap:8px;align-items:center"><span class="eyebrow gem7">◆ <b>'+gems+'</b> gems</span><button class="x" data-a="close" title="Close (Esc)" aria-label="Close">✕</button></div></header>';
  h+='<nav>'+FILT.map(([f,n])=>{const c=f!='stats'?cntOf(f):0;return(f=='wings'||f=='charms')&&!c&&f!=filter?'':'<button data-f="'+f+'" class="'+(f==filter?'on':'')+'">'+n+(f!='stats'?'<small>'+c+'</small>':'')+'</button>'}).join('')+'</nav>';
  if(filter!='stats')h+='<div class="tb7"><input type="search" id="inq7" placeholder="Search your items… (Enter picks the first)" value="'+esc(q)+'" aria-label="Search items" autocomplete="off"><select id="ins7" aria-label="Sort items">'+SORTS.map(([v,n])=>'<option value="'+v+'"'+(v==sortBy?' selected':'')+'>'+n+'</option>').join('')+'</select><span class="eyebrow">'+list.length+' shown</span></div>';
  h+=strip();
  if(filter=='stats')h+='<div class="grid7">'+stats()+'</div>';
  else h+='<div class="grid7">'+(list.length?list.map(tile).join(''):'<div class="empty7">'+(q.trim()?'No items match “'+esc(q.trim())+'”.':filter=='fav'?'No favourites yet. Right-click an item and choose ☆ Favourite to pin it here and to the top of every list.':filter=='wings'?'No wings yet. Level up or visit the store.':filter=='charms'?'No charms or effects yet. Find them in the store.':'Nothing here yet. Break blocks, harvest crops and defeat monsters to fill your backpack.')+'</div>')+'</div>';
  h+='<aside>'+detail(sel)+'</aside>';sh.innerHTML=h;/* the right-click menu lives outside the sheet and survives refreshes */
  try{MOTION7.ind(sh.querySelector('nav'),'button.on','u',el);const gb=sh.querySelector('.gem7 b');MOTION7.tick(gb,gems,el._g!=null?el._g:gems);el._g=gems;const sk=filter+'|'+sortBy;if(sk!=el._sk){el._sk=sk;MOTION7.stagger(sh.querySelector('.grid7'),'.it7,.stat7 .s',18)}}catch(_){}
  const ab=document.getElementById('asb');ab.style.display=assign>=0?'block':'none';ab.textContent='Choose anything for hotbar slot '+(assign+1)+' · Esc to cancel'}
 // the Equipped strip: one cell per slot, ✕ unequips, click selects, drop a tile on it to equip
 function strip(){let h='<div class="eq8" aria-label="Equipped"><span class="eyebrow">Equipped</span>';
  for(const[s,n,g]of SLOTS8){const k=eqK(s);h+='<div class="es8'+(k!=null?' on':'')+'" data-slot="'+s+'"'+(k!=null?' data-ek="'+esc(k)+'"'+RARA(k):'')+' title="'+esc(n+': '+(k!=null?nameOf(k)+' · click to select, ✕ to unequip':'empty · drag an item here or double-click it to equip'))+'">'
   +'<span class="ei8">'+(k!=null?'<img src="'+iconOf(k)+'" alt="">':'<i aria-hidden="true">'+g+'</i>')+'</span><small>'+n+'</small>'+(k!=null?'<button class="ux8" data-u="'+s+'" title="Unequip '+esc(nameOf(k))+'" aria-label="Unequip '+esc(nameOf(k))+'">✕</button>':'')+'</div>'}
  return h+'</div>'}
 const wInfo=k=>{const w=WPN[k.slice(2)];return w?'Power '+ITEM7.power(k)+' · damage '+w.md+' · '+(1/w.cd).toFixed(1)+' hits/s'+(w.lv?' · Lv '+w.lv+(lvl<w.lv?' required':''):''):''};
 function tip(i){const k=i.k,p=primary(i);return nameOf(k)+'\n'+ITEM7.RN[tierOf(k)]+' '+(i.t=='charms'?(i.sub=='charm'?'charm':'effect'):i.t=='wings'?'wings':ITEM7.catName(k).toLowerCase())+(i.n?' · '+i.n+' owned':'')+(isWpn(k)?'\n'+wInfo(k):'')+(p&&p.a&&!p.dis?'\nDouble-click or E: '+p.l.replace(/ ·.*$/,''):'')+'\nRight-click for more'}
 function tile(i){const t=i.t,own=i.own,nm=nameOf(i.k),hs=hbSlot(i.k),pw=t=='weapons'?ITEM7.power(i.k):0,dr=own&&(hbOk(i.k)||t=='wings'||t=='charms'||t=='wear'&&!i.lock);
  return'<button class="it7'+(selK===i.k?' sel':'')+(own?'':' lock')+(i.worn?' eq':'')+(isNew(i)?' new':'')+'" data-k="'+esc(i.k)+'"'+(dr?' draggable="true"':'')+RARA(i.k)+' title="'+esc(tip(i))+'">'+'<i class="rp7" aria-hidden="true">'+ITEM7.GLY[tierOf(i.k)]+'</i>'+'<span class="pl7"><img src="'+iconOf(i.k)+'" alt="">'+(i.n?'<b class="q7">'+i.n+'</b>':'')+'</span>'+(favs[i.k]?'<u class="fv7">★</u>':'')+(hs>=0?'<u class="hbn7" title="Hotbar slot '+(hs+1)+'">'+(hs+1)+'</u>':'')+(pw?'<u class="pw7" title="Power">⚔'+pw+'</u>':'')+(i.worn?'<em class="st7">'+(t=='wear'||t=='wings'?'WORN':typeof i.k=='number'?'HELD':'EQUIPPED')+'</em>':'')+'<span class="nm7">'+esc(nm)+'</span></button>'}
 function hbRow(k){const h=HB();if(!h||!h.assignable(k))return'';const s=h.slotOf(k);let b='';for(let i=0;i<h.N;i++)b+='<button class="btn ghost'+(i===s?' on':'')+'" data-a="hb'+i+'" title="'+(i===s?'Remove from slot ':'Put in slot ')+(i+1)+'" aria-label="'+(i===s?'Remove from hotbar slot ':'Put in hotbar slot ')+(i+1)+'">'+(i+1)+'</button>';
  return'<div class="eyebrow" style="margin-top:12px">Hotbar slot</div><div class="hbrow7">'+b+'</div><p class="hbtip7">'+(s>=0?'In slot '+(s+1)+' (click it again to take it off the bar). ':'')+'Or press 1–7, or drag it onto the hotbar.</p>'}
 function actRow(i){const p=primary(i);let h='<div class="row7 act8">';if(p)h+=p.a=='equip'&&i.worn||!p.a?'<button class="btn" disabled>'+esc(p.a?'Equipped':p.l)+'</button>':'<button class="btn" data-a="'+p.a+'"'+(p.dis?' disabled':'')+'>'+esc(p.l)+'</button>';
  if((i.t=='weapons'||i.t=='tools')&&i.worn)h='<div class="row7 act8"><button class="btn" data-a="equip" disabled>Equipped</button><button class="btn ghost" data-a="unequip">Put away</button>';
  h+='<button class="btn ghost" data-a="fav" title="Favourite">'+(favs[i.k]?'★':'☆')+'</button></div>';if(p&&p.a&&!p.dis)h+='<p class="kb8"><kbd>E</kbd> or double-click: '+esc(p.l.replace(/ ·.*$/,''))+' · right-click for more</p>';return h}
 function detail(s){if(!s)return'<div class="eyebrow">Details</div><p>Select an item to see what it does.</p><p style="margin-top:14px"><b>Equip anything fast:</b> double-click an item, or select it and press <kbd>E</kbd>. Right-click for a menu, or drag it onto <b>Equipped</b> or onto the hotbar.</p><p>Your hotbar has <b>seven</b> slots, keys <b>1–7</b> or the <b>mouse wheel</b>. Select an item and press <b>1–7</b> to put it in that slot. <b>X</b> swaps weapon ⇄ tool. Only tools break blocks.</p>';
  const k=s.k,nm=nameOf(k),c=ITEM7.cat(k),t=s.t;let h='<div class="rbar7"><span class="catl7"><i>'+(ITEM7.CATG[c]||'✦')+'</i>'+(t=='wings'?'Wings':t=='charms'?(s.sub=='charm'?'Charm':'Effect'):ITEM7.CATN[c])+'</span><span class="rtag" data-rar="'+ITEM7.RAR[tierOf(k)]+'">'+ITEM7.RN[tierOf(k)]+'</span></div><div class="pic"'+RARA(k)+'><img src="'+iconOf(k)+'" alt=""></div><h3 class="ttl">'+esc(nm)+'</h3>';
  if(t=='wear'){const w=WEAR[k.slice(2)];h+='<p>'+esc(w.d)+'<br><b>'+esc(w.sd)+'</b></p><div class="kv"><span>Slot</span>'+({hat:'Head',body:'Body',wing:'Wings',boot:'Boots',glove:'Gloves'})[w.s]+'</div>'+(w.lv?'<div class="kv"><span>Requires level</span>'+w.lv+'</div>':'')+actRow(s)+(!s.own&&!s.lock&&gems<w.cost?'<p>You need '+(w.cost-gems)+' more gems.</p>':'')+hbRow(k)}
  else if(t=='weapons'||t=='tools'){const w=WPN[k.slice(2)],lk=s.lock;h+='<p>'+esc(w.d)+'</p>'+(w.move?'<div class="kv"><span>Special</span>'+esc(w.move)+'</div>':'')+(t=='weapons'?'<div class="kv"><span>Power</span><b class="pw8" data-rar="'+ITEM7.RAR[tierOf(k)]+'">⚔ '+ITEM7.power(k)+'</b></div>':'')+'<div class="kv"><span>Damage</span>'+w.md+'</div><div class="kv"><span>Speed</span>'+(1/w.cd).toFixed(1)+' / s</div>'+(w.lv?'<div class="kv"><span>Requires level</span>'+(lk?'<b style="color:#e0566a">'+w.lv+'</b>':w.lv+' ✓')+'</div>':'')+(w.ev?'<div class="kv"><span>Evolves</span>'+(wK[k.slice(2)]|0)+' / '+w.kn+' kills</div>':w.st?'<div class="kv"><span>Form</span>Final</div>':'');
   h+=actRow(s)+(lk?'<p>Unlocks at level '+w.lv+' (you are level '+lvl+').</p>':!s.own&&gems<w.cost?'<p>You need '+(w.cost-gems)+' more gems.</p>':'')+hbRow(k)}
  else if(t=='wings'||t=='charms'){h+='<p>'+esc(descOf(k))+'</p>'+(t=='charms'?'<div class="kv"><span>Slot</span>'+esc(s.sub=='charm'?'Charm (companion)':'Effect · '+s.sub)+'</div>':'')+actRow(s)}
  else{h+='<p>'+esc(descOf(k))+'</p><div class="kv"><span>Owned</span>'+s.n+'</div><div class="kv"><span>Market value</span>'+(typeof sellP=='function'?sellP(k):'?')+' gems each</div>'+actRow(s)+hbRow(k)}
  return h}
 function stats(){const b=bonus(),bar2=(n,p,q)=>'<div class="s"><b class="ttl" style="font-size:13px">'+n+'</b><div class="bar7"><i style="width:'+Math.max(0,Math.min(100,p*100))+'%"></i></div><small style="color:var(--ed-mute)">'+q+'</small></div>';
  return'<div class="stat7">'+bar2('Level '+lvl,xp/xpNeed(lvl),Math.floor(xp)+' / '+xpNeed(lvl)+' XP')+bar2('Mining '+prof.mine.l,prof.mine.x/(xpNeed(prof.mine.l)*.7),'Break power +'+Math.floor(prof.mine.l/6))+bar2('Farming '+prof.farm.l,prof.farm.x/(xpNeed(prof.farm.l)*.7),'Gardening gear boosts this XP')+bar2('Combat '+prof.fight.l,prof.fight.x/(xpNeed(prof.fight.l)*.7),'Damage +'+Math.round(prof.fight.l*4)+'%')+(typeof LVL9!='undefined'?(i=>bar2('Level power',i.dmg/1.5,'All weapons +'+Math.round(i.dmg*100)+'% damage · Max HP +'+i.hp+' · Armor +'+Math.round(i.arm*100)+'%'))(LVL9.info()):'')+'<div class="s"><b class="ttl" style="font-size:13px">Active bonuses</b><br><small style="color:var(--ed-mute);line-height:1.8">Gems +'+Math.round(b.gem*100)+'% · Speed '+Math.round(b.spd*100)+'% · Jump +'+Math.round(b.jump*100)+'% · Armor '+Math.round(b.arm*100)+'% · XP +'+Math.round(b.xp*100)+'% · Light +'+Math.round(b.light)+'</small></div></div>'}
 // selecting patches the tiles + details (no full rebuild), so clicks stay instant
 const tileEl=k=>el&&el.querySelector('.it7[data-k="'+(window.CSS&&CSS.escape?CSS.escape(String(k)):String(k))+'"]');
 function select(k){selK=k;if(seen&&!seen[k]){seen[k]=1;saveP()}if(!el)return;for(const x of el.querySelectorAll('.it7.sel'))x.classList.remove('sel');const t=tileEl(k);if(t){t.classList.add('sel');t.classList.remove('new')}
  const a=el.querySelector('aside');if(a)a.innerHTML=detail(items().find(i=>i.k===k)||null)}
 function pulse(k){const t=tileEl(k);try{if(t&&t.animate&&!MOTION7.reduce())t.animate([{transform:'scale(.92)'},{transform:'scale(1.06)',offset:.6},{transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.9,.3,1.2)'})}catch(_){}}
 const keyOf=s=>/^\d+$/.test(s)?+s:s;
 function onClick(e){const m=e.target.closest('#ictx8 [data-c]');if(m){menuAct(m.dataset.c);return}
  const f=e.target.closest('[data-f]');if(f){filter=f.dataset.f;selK=null;render();snd('tab');return}
  const u=e.target.closest('[data-u]');if(u){e.stopPropagation();const k=eqK(u.dataset.u);if(unequip(k))render();return}
  const es=e.target.closest('.es8[data-ek]');if(es){const k=keyOf(es.dataset.ek);if(!sorted(items()).some(i=>i.k===k)){filter='all';q=''}selK=k;render();select(k);return}
  const t=e.target.closest('.it7[data-k]');if(t){const k=keyOf(t.dataset.k);
   if(assign>=0&&hbOk(k)){HB().set(assign,k);assign=-1;selK=k;render();return}
   const now=performance.now();if(clk.k===k&&now-clk.t<420){clk.k=null;doPrimary(k);return}clk={k,t:now};
   select(k);snd('select');return}
  const a=e.target.closest('[data-a]');if(!a)return;const act=a.dataset.a,k=selK;
  if(act=='close'){close();return}
  if(act=='fav'&&k!=null){if(favs[k])delete favs[k];else favs[k]=1;saveP();render();snd('select');return}
  if(/^hb\d$/.test(act)&&k!=null&&HB()){const i=+act.slice(2);HB().set(i,HB().slotOf(k)===i?null:k);render();return}
  if(['equip','unequip','buy','wear'].includes(act)&&k!=null){if(run(act,k))pulse(k)}}
 // ---- right-click menu
 function closeMenu(){if(menu){menu.remove();menu=null}}
 function onCtx(e){const t=e.target.closest('.it7[data-k]'),es=e.target.closest('.es8[data-ek]');if(!t&&!es)return;e.preventDefault();const k=keyOf((t||es).dataset[t?'k':'ek']);if(t)select(k);else selK=k;
  const i=items().find(x=>x.k===k);if(!i)return;const p=primary(i),h=HB();let b='<div class="mh8">'+esc(nameOf(k))+'</div>';
  if(p&&p.a&&!p.dis)b+='<button data-c="p">'+esc(p.l)+'<kbd>E</kbd></button>';if(i.worn&&p&&p.a!='unequip'&&kind(k)!='mats'&&!(p.a=='wear'))b+='<button data-c="u">Unequip</button>';
  if(h&&h.assignable(k)){const s=h.slotOf(k);b+='<div class="ms8">Put in hotbar slot</div><div class="mr8">';for(let x=0;x<h.N;x++)b+='<button data-c="hb'+x+'" class="'+(x===s?'on':'')+'" title="Slot '+(x+1)+'">'+(x+1)+'</button>';b+='</div>';if(s>=0)b+='<button data-c="hbx">Remove from hotbar</button>'}
  b+='<button data-c="fav">'+(favs[k]?'★ Unfavourite':'☆ Favourite')+'</button>';
  if(typeof k=='number'&&cnt(k)>0){b+='<button data-c="d1">Drop 1</button>';if(cnt(k)>1)b+='<button data-c="da">Drop all ('+cnt(k)+')</button>'}
  closeMenu();menu=document.createElement('div');menu.id='ictx8';menu.setAttribute('role','menu');menu.dataset.k=String(k);menu.innerHTML=b;el.appendChild(menu);
  const r=menu.getBoundingClientRect(),x=Math.min(e.clientX,innerWidth-r.width-8),y=Math.min(e.clientY,innerHeight-r.height-8);menu.style.transform='translate('+Math.max(8,x)+'px,'+Math.max(8,y)+'px)'}
 function menuAct(c){if(!menu)return;const k=keyOf(menu.dataset.k);closeMenu();const h=HB();
  if(c=='p')doPrimary(k);else if(c=='u'){if(unequip(k))render()}else if(c=='fav'){if(favs[k])delete favs[k];else favs[k]=1;saveP();render()}
  else if(/^hb\d$/.test(c)&&h){h.set(+c.slice(2),k);render()}else if(c=='hbx'&&h){const s=h.slotOf(k);if(s>=0)h.set(s,null);render()}
  else if(c=='d1')drop(k,1);else if(c=='da')drop(k,cnt(k))}
 const isOpen=()=>showInv&&!!el&&el.classList.contains('open');
 function open(f,slot){mk();document.documentElement.classList.add('inv6');el._sk='';el._ind=null;if(f){filter=f;q=''}assign=slot==null?-1:slot;selK=null;showInv=true;el.classList.add('open');requestAnimationFrame(()=>el.classList.add('show'));render();try{G('bag')}catch(_){}snd('open')}
 function close(){if(!el)return;closeMenu();assign=-1;showInv=false;try{const a=document.activeElement;if(a&&el.contains(a))a.blur()}catch(_){}el.classList.remove('show');setTimeout(()=>{if(!showInv){el.classList.remove('open');document.documentElement.classList.remove('inv6')}},230);const ab=document.getElementById('asb');if(ab)ab.style.display='none';snd('close')}
 return{open,close,render,select,equip,unequip,doPrimary,drop,items,sorted,primary,nameOf,kind,
  get isOpen(){return isOpen()},get filter(){return filter},set filter(v){filter=v},get selK(){return selK},set selK(v){selK=v},get assign(){return assign},get sortBy(){return sortBy},set sortBy(v){sortBy=v;saveP()},get q(){return q},set q(v){q=String(v||'')},get list(){return last.map(i=>i.k)}}})();
// ---- legacy hooks: inventory toggle (the bar is drawn by HOTBAR in 99-zzz-hotbar.js)
setInv=function(v){if(v)INV7.open();else INV7.close()};
renderInv=function(){if(INV7.isOpen)INV7.render()};
renderW=function(){renderBar()};
function cycleWeapon(){const ids=Object.keys(WPN).filter(id=>own[id]&&!(WPN[id].hid&&!own[id]));if(!ids.length)return;wp=ids[(ids.indexOf(wp)+1)%ids.length];renderBar();say(WPN[wp].n);try{UIS.play('select')}catch(_){}}
(()=>{ // migrate old saves: make sure the two block slots are filled, then draw
 const fillable=Object.keys(inv).map(Number).filter(k=>cnt(k)>0&&k<20&&k!=17&&k!=4&&k!=16);
 for(let i=0;i<2;i++)if(!bar[i]||!cnt(bar[i])&&bar[i]>=200)bar[i]=fillable[i]||bar[i]||0;
 sel=0;try{renderBar()}catch(_){}})();
