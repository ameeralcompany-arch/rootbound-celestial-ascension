// ===== BUILDER10: the Builder (world building). One panel to find exactly the block or decoration you want, without digging through the bag:
//  categories (recent, favourites, colour blocks, materials, blocks, and the five decoration families), search across names, families and
//  descriptions, favourites (the star), a large preview with rarity and where it comes from, and a flip toggle for decorations.
//  Choosing an item you have puts it in your hand (the hotbar, like the bag does); choosing an earned pattern makes it your brush (patterns
//  have no item). Placing then works as usual: right click (or hold the left button), with the placement preview showing green where it fits
//  and red where it doesn't. Shift + right click fills a straight line from your last placed block to the cursor (up to 16, one item each).
//  Ctrl+Z / Ctrl+Y undo and redo your own recent placements in this world (an undone block comes back to your bag; nothing is created).
//  Open with the ` key or the Build button by the hotbar. =====
const BUILDER10=(()=>{
 const SK='rbbuild10';let S={fav:{},rec:[]};try{S=Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(_){}if(!Array.isArray(S.rec))S.rec=[];if(!S.fav||typeof S.fav!='object')S.fav={};
 const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(_){}};
 const RAR=['common','uncommon','rare','epic','legendary','mythic','exclusive'];
 const TABS=[['rec','Recent'],['fav','Favourites'],['col','Colour blocks'],['mat','Materials'],['blk','Blocks'],['nature','Nature'],['furniture','Furniture'],['fantasy','Fantasy'],['cute','Cute'],['premium','Premium']];
 // ---- every buildable thing as one entry: {id, key | pat, n, rar, fam, d}
 let ALL=null;
 function list(){if(ALL)return ALL;const out=[];const cat=id=>{try{return SHOP7.byId.get(id)}catch(_){return null}};
  for(let k=900;k<=907;k++)out.push({id:'k'+k,key:k,n:MATS10.nameOf(k),rar:k==907?'uncommon':'common',fam:'col',d:MATS10.descOf(k),sid:'blk_'+k});
  for(const f of MATS10.FIX){const k=f[0]+800,it=cat('blk_'+k);out.push({id:'k'+k,key:k,n:f[1],rar:it?it.rar:'common',fam:'mat',d:f[7],sid:'blk_'+k})}
  try{for(const it of SHOP7.items){if(it.cat!='blocks'||!it.stack)continue;const k=+it.ref;if(MATS10.isKey(k))continue;if(k==17)continue;out.push({id:'k'+k,key:k,n:it.n,rar:it.rar||'common',fam:'blk',d:it.d||'',sid:it.id})}}catch(_){}
  for(const d of DECOR10.L){if(DECOR10.isPat(d))out.push({id:'p'+d.id,pat:d.i,n:d.n,rar:d.rar,fam:d.fam,d:d.d,sid:'dec_'+d.id});else{const k=DECOR10.keyOf(d.i);out.push({id:'k'+k,key:k,n:d.n,rar:d.rar,fam:d.fam,d:d.d,sid:'obj_'+k})}}
  const seen=new Set();ALL=out.filter(e=>!seen.has(e.id)&&seen.add(e.id));return ALL}
 const byId=id=>list().find(e=>e.id==id);
 const have=e=>e.pat!=null?DECOR10.owns(DECOR10.L[e.pat]):cnt(e.key);
 function source(e){let it=null;try{it=SHOP7.byId.get(e.sid)}catch(_){}if(e.pat!=null){const d=DECOR10.L[e.pat];if(DECOR10.owns(d))return'Your pattern · place it as often as you like';return it&&it.earn?'Earn it: '+it.earn.t:'Earned by playing'}
  const n=cnt(e.key);return(n?'You have '+n:'You have none')+(it&&it.sale!==0&&it.price?' · store '+it.price+' gems':'')}
 // ---- panel
 let el=null,tab='col',q='',flip=0,sel=null,brush=null;
 const icon=e=>{try{if(e.pat!=null)return DECOR10.iconCanvas(e.pat,56).toDataURL();return iconURL(e.key)}catch(_){return''}};
 function mk(){if(el)return;el=document.createElement('div');el.id='bld10';el.setAttribute('role','dialog');el.setAttribute('aria-label','Builder');
  el.innerHTML='<header><div><h2>Builder</h2><p>Blocks, colours and decorations</p></div><button type="button" class="x" aria-label="Close the Builder">×</button></header>'+
   '<div class="b10r"><input type="search" placeholder="Search: duck, marble, pink, lamp…" aria-label="Search blocks and decorations"><button type="button" class="flip" aria-pressed="false" title="Decorations face the other way (/)">⇆ Flip</button></div>'+
   '<nav class="tabs" role="tablist">'+TABS.map(t=>'<button type="button" role="tab" data-t="'+t[0]+'">'+t[1]+'</button>').join('')+'</nav><div class="grid" role="listbox" aria-label="Items"></div>'+
   '<footer class="card" aria-live="polite"></footer><div class="hint">Right-click to place · <b>/</b> flips · <b>Shift</b>+right-click fills a line · <b>Ctrl+Z</b> undo</div>';
  document.body.appendChild(el);
  for(const ev of['pointerdown','mousedown','wheel','contextmenu'])el.addEventListener(ev,e=>e.stopPropagation());
  el.querySelector('.x').onclick=()=>close();
  const inp=el.querySelector('input');inp.addEventListener('input',()=>{q=inp.value.trim().toLowerCase();render()});inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key=='Escape'){if(inp.value){inp.value='';q='';render()}else close()}});inp.addEventListener('keyup',e=>e.stopPropagation());
  el.querySelector('.flip').onclick=()=>setFlip(!flip);
  el.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(!b)return;tab=b.dataset.t;q='';inp.value='';render()});
  const gr=el.querySelector('.grid');
  gr.addEventListener('click',e=>{const st=e.target.closest('.star');const t=e.target.closest('.b10i');if(!t)return;const en=byId(t.dataset.id);if(!en)return;if(st){S.fav[en.id]=S.fav[en.id]?0:1;if(!S.fav[en.id])delete S.fav[en.id];save();render();return}choose(en)});
  gr.addEventListener('mouseover',e=>{const t=e.target.closest('.b10i');if(t)card(byId(t.dataset.id))});gr.addEventListener('focusin',e=>{const t=e.target.closest('.b10i');if(t)card(byId(t.dataset.id))})}
 function items(){const L=list();if(q){const w=q.split(/\s+/);return L.filter(e=>{const h=(e.n+' '+e.fam+' '+e.rar+' '+e.d).toLowerCase();return w.every(x=>h.includes(x))||(e.key>=900&&e.key<=907&&MATS10.PAL.some(p=>p[0].toLowerCase().includes(q)||p[2].toLowerCase().includes(q)))})}
  if(tab=='rec')return S.rec.map(byId).filter(Boolean);if(tab=='fav')return L.filter(e=>S.fav[e.id]);return L.filter(e=>e.fam==tab)}
 function render(){if(!el)return;el.querySelectorAll('.tabs [data-t]').forEach(b=>{const on=!q&&b.dataset.t==tab;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false')});
  const xs=items(),gr=el.querySelector('.grid');
  if(!xs.length){gr.innerHTML='<p class="empty">'+(q?'Nothing matches “'+esc(q)+'”.':tab=='rec'?'What you place shows up here.':tab=='fav'?'Star an item to keep it here.':'Nothing here yet.')+'</p>';card(null);return}
  gr.innerHTML=xs.map(e=>{const n=have(e),lock=e.pat!=null&&!n;return'<button type="button" class="b10i'+(n?'':' none')+(lock?' lock':'')+(sel&&sel.id==e.id?' on':'')+'" data-id="'+e.id+'" data-rar="'+e.rar+'" role="option" aria-label="'+esc(e.n)+'">'+
   '<img alt="" src="'+icon(e)+'"><span class="nm">'+esc(e.n)+'</span>'+(e.pat!=null?'<span class="ct">'+(n?'∞':'🔒')+'</span>':'<span class="ct">'+(n>999?'999+':n)+'</span>')+
   '<span class="star'+(S.fav[e.id]?' on':'')+'" role="button" aria-label="Favourite" title="Favourite">★</span></button>'}).join('');if(!sel)card(xs[0])}
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function card(e){if(!el)return;const c=el.querySelector('.card');if(!e){c.innerHTML='';return}c.dataset.rar=e.rar;
  c.innerHTML='<img alt="" src="'+icon(e)+'"><div><b>'+esc(e.n)+'</b><span class="rar">'+e.rar[0].toUpperCase()+e.rar.slice(1)+(e.fam&&e.fam.length>3?' · '+e.fam:'')+'</span><p>'+esc(e.d)+'</p><small>'+esc(source(e))+'</small></div>'}
 function choose(e){sel=e;card(e);if(e.pat!=null){if(!have(e)){try{say('Earn the '+e.n+' first: '+source(e).replace('Earn it: ',''))}catch(_){}render();return}brush={pat:e.pat};chip();render();return}
  if(!cnt(e.key)){let it=null;try{it=SHOP7.byId.get(e.sid)}catch(_){}if(it&&it.sale!==0){try{close();STORE7.open({item:it.id})}catch(_){}}else try{say('You have no '+e.n+' yet')}catch(_){}return}
  brush=null;chip();try{HOTBAR.equip(e.key)}catch(_){}try{barDirty=1}catch(_){}render()}
 function open(){mk();el.classList.add('on');render();setTimeout(()=>{try{el.querySelector('input').focus({preventScroll:true})}catch(_){}},60)}
 function close(){if(el)el.classList.remove('on');try{document.activeElement&&document.activeElement.blur()}catch(_){}}
 const isOpen=()=>!!(el&&el.classList.contains('on'));
 function setFlip(v){flip=v?1:0;if(el){const b=el.querySelector('.flip');b.classList.toggle('on',!!flip);b.setAttribute('aria-pressed',flip?'true':'false')}chip()}
 // the brush chip (a pattern in hand)
 let ch=null;function chip(){if(!brush){if(ch)ch.classList.remove('on');return}if(!ch){ch=document.createElement('div');ch.id='bld10chip';document.body.appendChild(ch);ch.addEventListener('click',()=>{brush=null;chip()})}
  const d=DECOR10.L[brush.pat];ch.innerHTML='<img alt="" src="'+DECOR10.iconCanvas(d.i,32).toDataURL()+'"><span><b>'+esc(d.n)+'</b> · right-click to place'+(flip?' · flipped':'')+'</span><kbd>Esc</kbd>';ch.classList.add('on')}
 // ---- the button by the hotbar
 function btn(){if(document.getElementById('bld10btn'))return;const b=document.createElement('button');b.id='bld10btn';b.type='button';b.title='Builder (`)';b.setAttribute('aria-label','Open the Builder');b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 20V10l6-5 6 5v10M10 20v-5h4v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Build</span>';
  b.addEventListener('pointerdown',e=>e.stopPropagation());b.onclick=()=>isOpen()?close():open();document.body.appendChild(b)}
 setTimeout(btn,800);setInterval(()=>{try{const b=document.getElementById('bld10btn');if(b)b.style.display=entered&&menuEl.style.display=='none'?'':'none'}catch(_){}},500);
 addEventListener('keydown',e=>{const t=e.target;if(t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'||t.isContentEditable))return;
  if(e.key=='`'&&!e.ctrlKey&&!e.altKey){e.preventDefault();e.stopPropagation();isOpen()?close():open();return}
  if(e.key=='Escape'&&(brush||isOpen())){e.stopPropagation();e.preventDefault();if(isOpen())close();else{brush=null;chip()}return}
  if(e.key=='/'&&!e.ctrlKey&&!e.altKey&&entered&&!showInv){const it=MATS10.held();if(brush||DECOR10.isKey(it)||isOpen()){e.preventDefault();e.stopPropagation();setFlip(!flip);try{FEEL10.playPlace('fabric')}catch(_){}}return}
  if((e.ctrlKey||e.metaKey)&&!e.altKey&&entered&&!showInv){const k=e.key.toLowerCase();if(k=='z'&&!e.shiftKey){e.preventDefault();e.stopPropagation();undo()}else if(k=='y'||(k=='z'&&e.shiftKey)){e.preventDefault();e.stopPropagation();redo()}}},true);
 // ---- placing with the brush, and Shift + right click for a line
 const cursor=()=>MATS10.cursor();
 function placeOne(tx,ty){if(brush)return DECOR10.place(brush.pat,tx,ty,{quiet:1,flip:flipNow()});const it=MATS10.held();if(MATS10.isKey(it))return MATS10.placeKey(it,tx,ty);const i=DECOR10.idxOfKey(it);if(i>=0)return DECOR10.place(i,tx,ty,{quiet:1});return false}
 const flipNow=()=>(P.f<0?1:0)^flip;
 function line(){const L0=last();if(!L0)return false;const{tx,ty}=cursor(),x0=L0.k%W,y0=L0.k/W|0;if(tx!=x0&&ty!=y0)return false;const n=Math.min(16,Math.max(Math.abs(tx-x0),Math.abs(ty-y0)));if(!n)return false;const sx=Math.sign(tx-x0),sy=Math.sign(ty-y0);let put=0;
  for(let i=1;i<=n;i++){const X=x0+sx*i,Y=y0+sy*i;if(tiles[Y*W+X])continue;if(placeOne(X,Y))put++;else if(!MATS10.reach(X,Y))break}if(put)try{ft(tx*T+T/2,ty*T,put+' placed','#c8f0d0')}catch(_){}return true}
 const lineable=()=>!!brush||MATS10.isKey(MATS10.held())||DECOR10.isKey(MATS10.held());
 {const _pa=placeAction;placeAction=function(){try{if(!wrench()){if(K.shift&&lineable()){if(line())return}if(brush){const{tx,ty}=cursor();DECOR10.place(brush.pat,tx,ty,{flip:flipNow()});return}}}catch(e){console.error('BUILDER10 place',e)}return _pa.apply(this,arguments)}}
 {const _uw=useWeapon;useWeapon=function(){try{if(brush&&!showInv){const{tx,ty}=cursor();DECOR10.place(brush.pat,tx,ty,{quiet:1,flip:flipNow()});wcd=.25;return}}catch(_){}return _uw.apply(this,arguments)}}
 {const _dt=drawTarget;drawTarget=function(now){_dt.apply(this,arguments);try{if(brush&&!showInv&&menuEl.style.display=='none')DECOR10.preview(brush.pat,now)}catch(_){}}}
 // choosing a hotbar slot puts the brush down
 {try{const _p=HOTBAR.pick;HOTBAR.pick=function(){if(brush){brush=null;chip()}return _p.apply(this,arguments)}}catch(_){}}
 // ---- undo / redo: your own placements in this world, newest first; an undone block goes back to your bag
 const H=[],RD=[];let wld='';
 const keyGuess=(b,v)=>b<100?b:b<=114?b+300:b==115?900+((v>>6)%6):b==116?906:b==117?907:b>=120&&b<=138?b+800:b==DECOR10.TID?(DECOR10.isPat(DECOR10.L[v])?'p:'+DECOR10.L[v].id:DECOR10.keyOf(v)):null;
 function used(key,k,b,v){if(cur!==wld){H.length=0;RD.length=0;wld=cur}if(key==null)key=keyGuess(b,v);H.push({key,k,b,v,s:TST[k],t:performance.now()});if(H.length>40)H.shift();RD.length=0;
  const id=typeof key=='string'&&key.startsWith('p:')?'p'+key.slice(2):'k'+key;if(byId(id)){S.rec=[id].concat(S.rec.filter(x=>x!==id)).slice(0,24);save();if(isOpen()&&tab=='rec')render()}}
 const last=()=>{for(let i=H.length-1;i>=0;i--){const h=H[i];if(tiles[h.k]===h.b&&performance.now()-h.t<600000)return h}return null};
 function undo(){if(cur!==wld)return false;while(H.length){const h=H.pop();if(performance.now()-h.t>600000)continue;if(tiles[h.k]!==h.b||(VARID[h.b]&&TVAR[h.k]!==h.v))continue;if(!canEdit())return false;
   tiles[h.k]=0;hp[h.k]=0;pushEdit(h.k);if(typeof h.key=='number')addI(h.key,1);try{burst((h.k%W)*T+T/2,(h.k/W|0)*T+T/2,'#ffffff',4,70,2,'p')}catch(_){}try{FEEL10.playPlace('fabric')}catch(_){}RD.push(h);try{ft((h.k%W)*T+T/2,(h.k/W|0)*T,'Undone','#d8d2e6')}catch(_){}return true}return false}
 function redo(){if(cur!==wld)return false;const h=RD.pop();if(!h)return false;const x=h.k%W,y=h.k/W|0;let ok=false;
  if(typeof h.key=='string'&&h.key.startsWith('p:'))ok=DECOR10.place(h.v,x,y,{quiet:1,flip:(h.s&2)?1:0});else if(h.b==DECOR10.TID)ok=DECOR10.place(h.v,x,y,{quiet:1,flip:(h.s&2)?1:0});else if(MATS10.isKey(h.key))ok=MATS10.placeKey(h.key,x,y,{v:h.v});
  else if(typeof h.key=='number'&&cnt(h.key)>0&&!tiles[h.k]&&canEdit()&&h.b<100){addI(h.key,-1);tiles[h.k]=h.b;hp[h.k]=BLK[h.b][2];pushEdit(h.k);try{FEEL10.placed(h.b,h.k,0)}catch(_){}ok=true}
  return ok}
 setFlip(0);
 return{open,close,isOpen,render,used,undo,redo,list,get brush(){return brush},set brush(v){brush=v;chip()},get flip(){return flip},setFlip,H,S,line}})();
