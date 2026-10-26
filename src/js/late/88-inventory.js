// ===== V7 inventory (editorial) + 3-slot hotbar: [Block 1] [Block 2] [Weapon] =====
const INV7=(()=>{
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const FILT=[['all','All'],['blocks','Blocks'],['seeds','Seeds'],['mats','Materials'],['objects','Objects'],['wear','Wearables'],['weapons','Weapons'],['fav','★ Favourites'],['stats','Stats']];
 let el=null,filter='all',selK=null,assign=-1,hold=0,q='',sortBy='default',favs={};
 const PK=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpinv';
 try{const o=JSON.parse(localStorage.getItem(PK())||'{}');favs=o.f||{};sortBy=o.s||'default'}catch(_){}
 const saveP=()=>{try{localStorage.setItem(PK(),JSON.stringify({f:favs,s:sortBy}))}catch(_){}};
 const SORTS=[['default','Default order'],['name','Name A–Z'],['count','Most owned'],['rar','Rarest first'],['value','Highest value']];
 const RARS=[['Common','#9aa0ab'],['Uncommon','#3f9b5a'],['Rare','#3a78c2'],['Epic','#8a4cc4'],['Legendary','#c27a1a']];
 const rarByCost=c=>c<30?0:c<110?1:c<320?2:c<800?3:4;
 const kind=k=>typeof k=='string'?(k[0]=='a'?'wear':'weapons'):k>=200?'mats':k>=100?'seeds':(k>=20&&k<=41&&typeof ODEF!='undefined'&&ODEF[k])?'objects':'blocks';
 const costOf=k=>typeof k=='string'?(k[0]=='a'?WEAR[k.slice(2)].cost+(WEAR[k.slice(2)].lv|0)*40:WPN[k.slice(2)].cost):MAT[k]?MAT[k].p*3:(PRICE[k%100]||10)*(k>=100?5:1);
 const nameOf=k=>typeof k=='string'?(k[0]=='a'?WEAR[k.slice(2)].n:WPN[k.slice(2)].n):iname(k);
 const iconOf=k=>{try{return iconURL(k)}catch(_){return ''}};
 const descOf=k=>{const t=kind(k);if(t=='blocks')return 'A building block. Right-click to place it, left-click with a tool to break it.';if(t=='seeds')return 'Plant on a block with right-click. It grows in real time, even while the game is closed.';if(t=='mats')return 'Dropped by monsters and bosses. Used in crafting and sold at the market.';if(t=='objects')return (ODEF[k].cat=='door'?'An interactive gate. Place it, then press G beside it to choose where it leads.':ODEF[k].cat=='cont'?'Stores items. Press E beside it to open.':'A world object. Press E beside it to use it.');return ''};
 function items(){const out=[];
  const inv2=Object.keys(inv).map(Number).filter(k=>cnt(k)>0&&(MAT[k]||BLK[k%100]||BLK[k]));
  for(const k of inv2.sort((a,b)=>a-b)){const t=kind(k);if(k==17&&0)continue;out.push({k,t,n:cnt(k),own:1})}
  for(const id in WEAR){const w=WEAR[id];out.push({k:'a:'+id,t:'wear',own:!!ownW[id],lock:lvl<w.lv&&!ownW[id],worn:wear[w.s]==id})}
  for(const id in WPN){const w=WPN[id];if(w.hid&&!own[id])continue;out.push({k:'w:'+id,t:'weapons',own:!!own[id],worn:wp==id})}
  return out}
 const mk=()=>{if(el)return;el=document.createElement('div');el.id='inv7';el.className='ed';el.innerHTML='<div class="sheet" role="dialog" aria-label="Inventory"></div>';document.body.appendChild(el);
  const ab=document.createElement('div');ab.className='assignbanner ed';ab.id='asb';document.body.appendChild(ab);
  el.addEventListener('mousedown',e=>{if(e.target===el)close()});el.addEventListener('click',onClick);
  el.addEventListener('input',e=>{if(e.target.id=='inq7'){q=e.target.value;const p=e.target.selectionStart;render();const n=document.getElementById('inq7');if(n){n.focus();try{n.setSelectionRange(p,p)}catch(_){}}}});
  el.addEventListener('change',e=>{if(e.target.id=='ins7'){sortBy=e.target.value;saveP();render()}});
  el.addEventListener('keydown',e=>{if(e.target.id=='inq7'){e.stopPropagation();if(e.key=='Escape'){if(q){q='';render()}else close()}}});
  addEventListener('keydown',e=>{if(showInv&&el.classList.contains('open')&&e.key=='Escape'){close();e.stopPropagation()}},true)};
 function render(){const sh=el.querySelector('.sheet'),all=items(),cntOf=f=>all.filter(i=>f=='all'?i.own:f=='fav'?(i.own&&favs[i.k]):(i.t==f&&i.own)).length;
  let list=all.filter(i=>filter=='all'?i.own:filter=='stats'?false:filter=='fav'?(i.own&&favs[i.k]):i.t==filter);
  const qq=q.trim().toLowerCase();if(qq)list=list.filter(i=>nameOf(i.k).toLowerCase().includes(qq));
  const val=i=>{try{return costOf(i.k)}catch(_){return 0}};
  list=list.map((i,x)=>[i,x]).sort((A,B)=>{const a=A[0],b=B[0];let d=(favs[b.k]?1:0)-(favs[a.k]?1:0);if(d)return d;d=(b.own|0)-(a.own|0);if(d)return d;
   if(sortBy=='name')d=nameOf(a.k).localeCompare(nameOf(b.k));else if(sortBy=='count')d=(b.n|0)-(a.n|0);else if(sortBy=='rar')d=rarByCost(val(b))-rarByCost(val(a));else if(sortBy=='value')d=val(b)-val(a);
   return d||A[1]-B[1]}).map(x=>x[0]);
  const sel=list.find(i=>i.k===selK)||null;
  let h='<header><div><div class="eyebrow">Backpack · '+esc(myName)+'</div><h2 class="ttl">Inventory</h2></div><div style="display:flex;gap:8px;align-items:center"><span class="eyebrow">◆ '+gems+' gems</span><button class="x" data-a="close" title="Close (Esc)" aria-label="Close">✕</button></div></header>';
  h+='<nav>'+FILT.map(([f,n])=>'<button data-f="'+f+'" class="'+(f==filter?'on':'')+'">'+n+(f!='stats'?'<small>'+cntOf(f)+'</small>':'')+'</button>').join('')+'</nav>';
  if(filter!='stats')h+='<div class="tb7"><input type="search" id="inq7" placeholder="Search your items…" value="'+esc(q)+'" aria-label="Search items" autocomplete="off"><select id="ins7" aria-label="Sort items">'+SORTS.map(([v,n])=>'<option value="'+v+'"'+(v==sortBy?' selected':'')+'>'+n+'</option>').join('')+'</select><span class="eyebrow">'+list.length+' shown</span></div>';
  if(filter=='stats')h+='<div class="grid7">'+stats()+'</div>';
  else h+='<div class="grid7">'+(list.length?list.map(i=>tile(i)).join(''):'<div class="empty7">'+(q.trim()?'No items match “'+esc(q.trim())+'”.':filter=='fav'?'No favourites yet. Select an item and press ☆ Favourite to pin it here and to the top of every list.':filter=='all'||filter=='blocks'||filter=='seeds'||filter=='mats'||filter=='objects'?'Nothing here yet. Break blocks, harvest crops and defeat monsters to fill your backpack.':'Nothing to show.')+'</div>')+'</div>';
  h+='<aside>'+detail(sel)+'</aside>';sh.innerHTML=h;
  const ab=document.getElementById('asb');ab.style.display=assign>=0?'block':'none';ab.textContent='Choose a block for slot '+(assign+1)+' · Esc to cancel'}
 function tile(i){const t=i.t,own=i.own,r=RARS[rarByCost(costOf(i.k))];return'<button class="it7'+(selK===i.k?' sel':'')+(own?'':' lock')+'" data-k="'+esc(i.k)+'" title="'+esc(nameOf(i.k))+'"><i class="rar" style="background:'+r[1]+'"></i><img src="'+iconOf(i.k)+'" alt="">'+(favs[i.k]?'<u class="fv7">★</u>':'')+(i.n?'<b>'+i.n+'</b>':'')+(i.worn?'<em>'+(t=='wear'?'WORN':'EQUIPPED')+'</em>':'')+'<span>'+esc(nameOf(i.k))+'</span></button>'}
 function detail(s){if(!s)return'<div class="eyebrow">Details</div><p>Select an item to see what it does and what you can do with it.</p><p style="margin-top:14px">Tip: <b>1</b> and <b>2</b> choose your block slots, <b>3</b> switches weapon.</p>';
  const k=s.k,nm=nameOf(k),r=RARS[rarByCost(costOf(k))];let h='<div class="eyebrow">'+({blocks:'Block',seeds:'Seed',mats:'Material',objects:'Object',wear:'Wearable',weapons:'Weapon'})[s.t]+' · <span style="color:'+r[1]+'">'+r[0]+'</span></div><div class="pic"><img src="'+iconOf(k)+'" alt=""></div><h3 class="ttl">'+esc(nm)+'</h3>';
  if(s.t=='wear'){const w=WEAR[k.slice(2)];h+='<p>'+esc(w.d)+'<br><b>'+esc(w.sd)+'</b></p>';h+='<div class="kv"><span>Slot</span>'+({hat:'Head',body:'Body',wing:'Wings',boot:'Boots',glove:'Gloves'})[w.s]+'</div>'+(w.lv?'<div class="kv"><span>Requires level</span>'+w.lv+'</div>':'');
   h+='<div class="row7"><button class="btn ghost" data-a="fav">'+(favs[k]?'★ Favourited':'☆ Favourite')+'</button></div><div class="row7">'+(s.own?'<button class="btn" data-a="wear">'+(s.worn?'Take off':'Wear')+'</button>':s.lock?'<button class="btn" disabled>Level '+w.lv+'</button>':'<button class="btn" data-a="buy"'+(gems<w.cost?' disabled':'')+'>Buy · '+w.cost+' gems</button>')+'</div>'+(!s.own&&!s.lock&&gems<w.cost?'<p>You need '+(w.cost-gems)+' more gems.</p>':'')}
  else if(s.t=='weapons'){const w=WPN[k.slice(2)],u=wUp[k.slice(2)]|0;h+='<p>'+esc(w.d)+'</p><div class="kv"><span>Power</span>'+(w.bd+u)+'</div><div class="kv"><span>Speed</span>'+(1/w.cd).toFixed(1)+' / s</div>'+(w.ev?'<div class="kv"><span>Evolves</span>'+(wK[k.slice(2)]|0)+' / '+w.kn+' kills</div>':w.st?'<div class="kv"><span>Form</span>Final</div>':'');
   h+='<div class="row7"><button class="btn ghost" data-a="fav">'+(favs[k]?'★ Favourited':'☆ Favourite')+'</button></div><div class="row7">'+(s.own?'<button class="btn" data-a="equip"'+(s.worn?' disabled':'')+'>'+(s.worn?'Equipped':'Equip')+'</button>':'<button class="btn" data-a="buy"'+(gems<w.cost?' disabled':'')+'>Buy · '+w.cost+' gems</button>')+'</div>'+(!s.own&&gems<w.cost?'<p>You need '+(w.cost-gems)+' more gems.</p>':'')}
  else{h+='<p>'+esc(descOf(k))+'</p><div class="kv"><span>Owned</span>'+s.n+'</div><div class="kv"><span>Market value</span>'+(typeof sellP=='function'?sellP(k):'?')+' gems each</div>';
   h+='<div class="row7"><button class="btn ghost" data-a="fav">'+(favs[k]?'★ Favourited':'☆ Favourite')+'</button></div>';
   if(s.t=='blocks'||s.t=='seeds'||s.t=='objects')h+='<div class="row7"><button class="btn" data-a="slot0">Slot 1</button><button class="btn ghost" data-a="slot1">Slot 2</button></div>'+(bar[0]==k?'<p>In slot 1.</p>':bar[1]==k?'<p>In slot 2.</p>':'')}
  return h}
 function stats(){const b=bonus(),bar2=(n,p,q)=>'<div class="s"><b class="ttl" style="font-size:13px">'+n+'</b><div class="bar7"><i style="width:'+Math.max(0,Math.min(100,p*100))+'%"></i></div><small style="color:var(--ed-mute)">'+q+'</small></div>';
  return'<div class="stat7">'+bar2('Level '+lvl,xp/xpNeed(lvl),Math.floor(xp)+' / '+xpNeed(lvl)+' XP')+bar2('Mining '+prof.mine.l,prof.mine.x/(xpNeed(prof.mine.l)*.7),'Break power +'+Math.floor(prof.mine.l/6))+bar2('Farming '+prof.farm.l,prof.farm.x/(xpNeed(prof.farm.l)*.7),'Gardening gear boosts this XP')+bar2('Combat '+prof.fight.l,prof.fight.x/(xpNeed(prof.fight.l)*.7),'Damage +'+Math.round(prof.fight.l*4)+'%')+'<div class="s"><b class="ttl" style="font-size:13px">Active bonuses</b><br><small style="color:var(--ed-mute);line-height:1.8">Gems +'+Math.round(b.gem*100)+'% · Speed '+Math.round(b.spd*100)+'% · Jump +'+Math.round(b.jump*100)+'% · Armor '+Math.round(b.arm*100)+'% · XP +'+Math.round(b.xp*100)+'% · Light +'+Math.round(b.light)+'</small></div></div>'}
 function onClick(e){const f=e.target.closest('[data-f]');if(f){filter=f.dataset.f;selK=null;render();UIS&&UIS.play('tab');return}
  const t=e.target.closest('[data-k]');if(t){let k=t.dataset.k;if(/^\d+$/.test(k))k=+k;
   if(assign>=0&&(kind(k)=='blocks'||kind(k)=='seeds'||kind(k)=='objects')){setSlot(assign,k);assign=-1;render();return}
   selK=k;render();UIS&&UIS.play('select');return}
  const a=e.target.closest('[data-a]');if(!a)return;const act=a.dataset.a,k=selK;
  if(act=='close'){close();return}
  if(act=='fav'&&k!=null){if(favs[k])delete favs[k];else favs[k]=1;saveP();render();UIS&&UIS.play('select');return}
  if(act=='slot0'||act=='slot1'){setSlot(+act[4],k);render();return}
  if(typeof k=='string'&&k[0]=='a'){const id=k.slice(2),w=WEAR[id];
   if(act=='buy'){if(lvl<w.lv)return say('Reach level '+w.lv+' first');if(gems<w.cost){say('Need '+w.cost+' gems');UIS&&UIS.play('error');return}gems-=w.cost;ownW[id]=1;wear[w.s]=id;try{G('wear')}catch(_){}UIS&&UIS.play('buy');say(w.n+' purchased and worn');renderSkills();render();return}
   if(act=='wear'){wear[w.s]=wear[w.s]==id?'':id;if(wear[w.s])try{G('wear')}catch(_){}UIS&&UIS.play('select');renderSkills();render()}return}
  if(typeof k=='string'&&k[0]=='w'){const id=k.slice(2),w=WPN[id];
   if(act=='buy'){if(gems<w.cost){say('Need '+w.cost+' gems');UIS&&UIS.play('error');return}gems-=w.cost;own[id]=1;wp=id;try{G('forge')}catch(_){}UIS&&UIS.play('buy');say(w.n+' purchased and equipped');renderBar();render();return}
   if(act=='equip'){wp=id;UIS&&UIS.play('select');renderBar();render()}return}}
 function setSlot(i,k){if(i<0||i>1)return;const o=bar[1-i];if(o==k)bar[1-i]=bar[i];bar[i]=k;sel=i;try{renderBar()}catch(_){}say((nameOf(k))+' → slot '+(i+1))}
 function open(f,slot){mk();if(f){filter=f;q=''}assign=slot==null?-1:slot;selK=null;showInv=true;el.classList.add('open');requestAnimationFrame(()=>el.classList.add('show'));render();try{G('bag')}catch(_){}UIS&&UIS.play('open')}
 function close(){if(!el)return;assign=-1;showInv=false;el.classList.remove('show');setTimeout(()=>{if(!showInv)el.classList.remove('open')},230);const ab=document.getElementById('asb');if(ab)ab.style.display='none';UIS&&UIS.play('close')}
 return{open,close,render,get isOpen(){return showInv&&!!el&&el.classList.contains('open')},get filter(){return filter},set filter(v){filter=v}}})();
// ---- legacy hooks: inventory toggle, bar, weapon slot
setInv=function(v){if(v)INV7.open();else INV7.close()};
renderInv=function(){if(INV7.isOpen)INV7.render()};
renderBar=function(){const el=document.getElementById('bar');if(!el)return;el.innerHTML='';
 if(sel>1)sel=0;
 const blk=i=>{const k=bar[i],s=document.createElement('div');s.className='hb'+(i==sel?' on':'')+(k?'':' empty');s.tabIndex=0;s.title=k?iname(k)+' — click to select, click again to change':'Empty — click to choose a block';
  if(k){const im=new Image();im.src=iconURL(k);s.append(im);const b=document.createElement('b');b.textContent=cnt(k);s.append(b)}const n=document.createElement('i');n.textContent=i+1;s.append(n);const sm=document.createElement('small');sm.textContent=k?iname(k):'Block';if(!k)s.append(sm);
  s.onclick=()=>{if(i==sel||!bar[i]){INV7.open('blocks',i)}else{sel=i;renderBar();try{UIS.play('select')}catch(_){}}};s.onkeydown=e=>{if(e.key=='Enter')s.onclick()};return s};
 el.append(blk(0),blk(1));
 const w=WPN[wp],s=document.createElement('div');s.className='hb wp';s.tabIndex=0;s.title='Weapon — press 3 to switch, click to open weapons';const im=new Image();im.src=iconURL('w:'+wp);const d=document.createElement('div');d.innerHTML=esc3(w.n)+'<small>'+(w.ev?'Evolves '+(wK[wp]|0)+'/'+w.kn+' kills':w.st?'Final form':'Left click to use')+'</small>';const n=document.createElement('i');n.textContent='3';s.append(im,d,n);s.onclick=()=>INV7.open('weapons');s.onkeydown=e=>{if(e.key=='Enter')s.onclick()};el.append(s)};
const esc3=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
renderW=function(){renderBar()};
selBar=function(i){if(i<=1){sel=i;renderBar()}else if(i==2){cycleWeapon()}};
function cycleWeapon(){const ids=Object.keys(WPN).filter(id=>own[id]&&!(WPN[id].hid&&!own[id]));if(!ids.length)return;wp=ids[(ids.indexOf(wp)+1)%ids.length];renderBar();say(WPN[wp].n);try{UIS.play('select')}catch(_){}}
(()=>{ // migrate old saves: make sure the two block slots are filled, then draw
 const fillable=Object.keys(inv).map(Number).filter(k=>cnt(k)>0&&k<20&&k!=17&&k!=4&&k!=16);
 for(let i=0;i<2;i++)if(!bar[i]||!cnt(bar[i])&&bar[i]>=200)bar[i]=fillable[i]||bar[i]||0;
 sel=0;try{renderBar()}catch(_){}})();
