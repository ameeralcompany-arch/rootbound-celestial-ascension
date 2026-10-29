// ===== CHEST6 (v8 storage chests): two panes, chest | your backpack. Click moves 1, Shift-click or right-click the whole stack,
// Ctrl-click half; drag a tile across to move its stack. Take all, Deposit matching (stack onto what the chest already holds), Deposit all
// (everything except what is on your hotbar), Sort, a search over both sides, Quick-stack into every chest within 8 tiles, rename + colour.
// Capacity: Treasure Chest 24 slots, Storage Crate 16; one slot per item type, up to 9999 each (stacks always merge).
// Every move is one synchronous transaction (counts are clamped to what really exists, so rapid clicks can never duplicate or lose an
// item), and the world + backpack are saved together shortly after any change, on close, before a world change and when the page hides.
// The window closes when you walk away, press Esc / E, change worlds or the chest breaks. Drawn only on change (no per-frame DOM). =====
const CHEST6=(()=>{
 const CAP={27:24,34:16},MAXS=9999,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const capOf=o=>o&&CAP[o.t]||12;
 let el=null,K=-1,q='',bsort='cat',saveT=0;
 const nm=i=>OBJ6.itemName(i),icon=i=>{try{return'<img src="'+iconURL(i)+'" width="34" height="34" alt="">'}catch(_){return'<span>▣</span>'}};
 const can=o=>OBJ6.canUse(o,myId)||!meta,canPut=o=>!meta||OBJ6.roleOf(myId)>=(o.c.dp|0);
 const storable=k=>k>0&&k!=17&&cnt(k)>0&&!!(MAT[k]||BLK[k%100]||BLK[k]); // World Locks stay in the backpack
 const catRank=k=>{const c=ITEM7.cat(k);return({block:0,obj:1,door:1,seed:2,mat:3,fish:4,bait:5})[c]|0};
 // ---- saving: world edits + backpack together (the 4 s autosave could otherwise save one side without the other)
 function flush(){clearTimeout(saveT);saveT=0;try{if(dirty&&!guest){dirty=0;localStorage.setItem('rbw_'+cur,JSON.stringify(edits));if(dbRef)dbRef.set({e:JSON.stringify(edits)}).catch(()=>{})}}catch(_){}try{saveP()}catch(_){}}
 const later=()=>{clearTimeout(saveT);saveT=setTimeout(flush,350)};
 function changed(k,o,mode){edits.o=OBJ;dirty=1;try{if(rm)rm.emit('o',{op:'cfg',k,v:{t:o.t,c:o.c,s:o.s}})}catch(_){}if(mode)OBJ6.sfx(mode=='take'?'pick':'put');try{barDirty=1}catch(_){}later();if(k===K)panes()}
 // ---- the one move primitive. Returns how many items actually moved. Requests for more than exists are refused (never partly filled
 // from nowhere); a deposit onto a nearly full 9999 stack moves only what fits.
 const _op=OBJ6.chestOp;
 function move(k,mode,it,n,quiet){const o=OBJ[k];if(!o||!o.c||!Array.isArray(o.c.it))return 0;it=it|0;n=Math.floor(+n||0);if(!(it>0)||n<1)return 0;
  if(rm&&!rm.isHost){_op(k,mode,it,n);return 0} // guests ask the host (91-objects.js)
  const L=o.c.it,s=L.find(x=>x[0]==it),no=m=>{if(!quiet)say(m);return 0};
  if(mode=='take'){if(!can(o))return no('You are not allowed to take from this');if(!s||s[1]<n)return no('Not there anymore');s[1]-=n;if(s[1]<=0)L.splice(L.indexOf(s),1);addI(it,n);if(!quiet)say('Took '+n+' × '+nm(it))}
  else{if(!canPut(o))return no('You may not store items here');if(it==17)return no('World Locks stay in your backpack');if(cnt(it)<n)return no('You do not have that');
   if(s)n=Math.min(n,MAXS-s[1]);else if(L.length>=capOf(o))return no('This chest is full ('+capOf(o)+' slots)');else n=Math.min(n,MAXS);if(n<1)return no('That stack is full (9999)');
   addI(it,-n);if(s)s[1]+=n;else L.push([it,n])}
  changed(k,o,quiet?'':mode);return n}
 OBJ6.chestOp=function(k,op,it,n){return move(k,op,it,n)};
 // ---- bulk actions (one sound + one redraw each)
 function bulk(k,f){const o=OBJ[k];if(!o)return 0;let moved=0;const was=K;K=-1;try{moved=f(o)}finally{K=was}if(moved){OBJ6.sfx('put');if(k===K)panes()}return moved}
 const takeAll=k=>bulk(k,o=>{let m=0;for(const[i,n]of o.c.it.slice())m+=move(k,'take',i,n,1);if(!m)say(can(o)?'The chest is empty':'You are not allowed to take from this');else say('Took '+m+' items');return m});
 const depMatch=k=>bulk(k,o=>{let m=0;for(const[i]of o.c.it.slice())if(cnt(i)>0)m+=move(k,'put',i,cnt(i),1);return m});
 const onBar=i=>{try{return HOTBAR.slotOf(i)>=0}catch(_){return false}};
 const depAll=k=>bulk(k,o=>{let m=0,full=0;for(const i of bag())if(!onBar(i)){const r=move(k,'put',i,cnt(i),1);m+=r;if(!r)full++}say(m?'Stored '+m+' items'+(full?' · '+full+' did not fit':'')+' (hotbar items stay with you)':full?'This chest is full':'Nothing to store (hotbar items stay with you)');return m});
 function sortChest(k){const o=OBJ[k];if(!o)return;o.c.it.sort((a,b)=>catRank(a[0])-catRank(b[0])||nm(a[0]).localeCompare(nm(b[0])));changed(k,o);OBJ6.sfx('click')}
 function nearby(r){const out=[];if(!entered)return out;for(const k in OBJ){const o=OBJ[k];if(!ODEF[o.t]||ODEF[o.t].cat!='cont')continue;const x=k%W*T+T/2,y=(k/W|0)*T+T/2;if(Math.abs(P.x-x)<=T*r&&Math.abs(P.y+P.h/2-y)<=T*r&&can(o)&&canPut(o))out.push(+k)}return out}
 function quick(){const ks=nearby(8);let m=0,c=0;for(const k of ks){const n=depMatch(k);if(n){m+=n;c++}}say(m?'Quick-stacked '+m+' items into '+c+' chest'+(c>1?'s':''):'Nothing matched the chests nearby');if(K>=0)panes();return m}
 // ---- view
 function bag(){const k=Object.keys(inv).map(Number).filter(storable);
  return k.sort((a,b)=>bsort=='name'?nm(a).localeCompare(nm(b)):bsort=='count'?cnt(b)-cnt(a)||a-b:catRank(a)-catRank(b)||a-b)}
 const hit=i=>!q||nm(i).toLowerCase().includes(q);
 const tile=(i,n,mode)=>{let hs=-1;try{hs=HOTBAR.slotOf(i)}catch(_){}return'<button class="cs" draggable="true" data-m="'+mode+'" data-i="'+i+'"'+ITEM7.attrs(i)+' title="'+esc(nm(i)+' × '+n+'\nClick: 1 · Shift / right-click: all · Ctrl: half · or drag across')+'">'+icon(i)+'<b>'+n+'</b><small>'+esc(nm(i))+'</small>'+(hs>=0?'<u class="hb8" title="On hotbar slot '+(hs+1)+'">'+(hs+1)+'</u>':'')+'</button>'};
 function shell(){const o=OBJ[K],c=o.c,C=CHCOL[c.col|0]||CHCOL[0],cfg=OBJ6.canConfig(myId);
  el.innerHTML='<div class="ch ch8"><div class="hd8"><span class="sw8" style="--c1:'+C[1]+';--c2:'+C[2]+'"></span><b class="nm8">'+esc(c.nm||ODEF[o.t].n)+'</b>'+(cfg?'<button class="ic8" data-a="ren" title="Rename this chest" aria-label="Rename this chest">✎</button><span class="cols8" role="group" aria-label="Chest colour">'+CHCOL.map((x,i)=>'<button data-col="'+i+'" class="'+(i==(c.col|0)?'on':'')+'" style="--c1:'+x[1]+';--c2:'+x[2]+'" title="'+x[0]+'" aria-label="'+x[0]+' chest"></button>').join('')+'</span>':'')
   +'<small class="cap8"></small></div><button class="x" data-a="close" title="Close (Esc or E)">✕</button></div>'
   +'<div class="tb8"><input id="chq8" type="search" placeholder="Search the chest and your backpack…" autocomplete="off" aria-label="Search items" value="'+esc(q)+'"></div>'
   +'<div class="cols"><section><h5><span>In the chest</span><span class="ha8"><button data-a="sort" title="Sort the chest by type and name">Sort</button><button data-a="takeall">Take all</button></span></h5><div class="grid" data-drop="take"></div></section>'
   +'<section><h5><span>Your backpack</span><span class="ha8"><select data-a="bsort" aria-label="Sort backpack"><option value="cat">By type</option><option value="name">By name</option><option value="count">Most first</option></select><button data-a="match" title="Store everything the chest already has a stack of">Deposit matching</button><button data-a="putall" title="Store everything except the items on your hotbar">Deposit all</button></span></h5><div class="grid bag" data-drop="put"></div></section></div>'
   +'<div class="hint2">Click moves <b>1</b> · <b>Shift</b>-click or <b>right-click</b> moves the <b>whole stack</b> · <b>Ctrl</b>-click moves half · drag a tile to the other side</div>'
   +'<div class="bt"><button data-a="quick" title="Store matching items in every chest within 8 tiles">Quick-stack nearby</button>'+(cfg?'<button data-a="cfg">⚙ Access</button>':'')+'<button data-a="close">Close</button></div>';
  el.querySelector('[data-a=bsort]').value=bsort;el.style.display='block'}
 function panes(){const o=OBJ[K];if(!o||!el)return close();const c=o.c,L=c.it,cap=capOf(o),tk=can(o),pt=canPut(o);
  let left='';for(let s=0;s<Math.max(cap,L.length);s++){const x=L[s];if(x){if(hit(x[0]))left+=tile(x[0],x[1],'take')}else if(!q)left+='<div class="cs e"></div>'}if(q&&!left)left='<div class="hint2">Nothing in the chest matches.</div>';
  const B=bag().filter(hit),right=B.length?B.map(k=>tile(k,cnt(k),'put')).join(''):'<div class="hint2">'+(q?'Nothing in your backpack matches.':'Your backpack is empty.')+'</div>';
  const g=el.querySelectorAll('.grid');g[0].innerHTML=left;g[1].innerHTML=right;const tot=L.reduce((a,x)=>a+x[1],0);
  el.querySelector('.cap8').textContent=L.length+' / '+cap+' slots · '+tot+' item'+(tot==1?'':'s')+(tk?'':' · view only')+(pt?'':' · you may not store here');
  const dis=(a,v)=>{const b=el.querySelector('[data-a='+a+']');if(b)b.disabled=!v};dis('takeall',tk&&L.length);dis('sort',L.length>1);const has=B.length>0;dis('match',pt&&has&&L.some(x=>cnt(x[0])>0));dis('putall',pt&&has)}
 function mk(){if(el)return;el=document.createElement('div');el.id='chestui';el.setAttribute('role','dialog');el.setAttribute('aria-label','Chest');document.body.appendChild(el);
  el.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b){act(b,e.shiftKey?'all':e.ctrlKey||e.metaKey?'half':'one');return}const cb=e.target.closest('[data-col]');if(cb){recolour(+cb.dataset.col);return}
   const a=e.target.closest('button[data-a]');if(!a||a.disabled)return;const A=a.dataset.a,k=K;
   if(A=='close')close();else if(A=='takeall')takeAll(k);else if(A=='match'){if(!depMatch(k))say('Nothing in your backpack matches the chest')}else if(A=='putall')depAll(k);else if(A=='sort')sortChest(k);else if(A=='quick')quick();else if(A=='ren')rename();else if(A=='cfg'){close();DOORS6.config(k,false)}});
  el.addEventListener('contextmenu',e=>{const b=e.target.closest('[data-m]');if(b){e.preventDefault();act(b,'all')}});
  el.addEventListener('change',e=>{if(e.target.dataset.a=='bsort'){bsort=e.target.value;panes()}});
  el.addEventListener('input',e=>{if(e.target.id=='chq8'){q=e.target.value.trim().toLowerCase();panes()}});
  el.addEventListener('keydown',e=>{if(e.target.id=='chq8'){e.stopPropagation();if(e.key=='Escape'){if(q){q='';e.target.value='';panes()}else close()}}});
  // drag a tile to the other side = move its whole stack
  el.addEventListener('dragstart',e=>{const b=e.target.closest('[data-m]');if(!b)return;try{e.dataTransfer.setData('text/plain','rbchest:'+b.dataset.m+':'+b.dataset.i);e.dataTransfer.effectAllowed='move'}catch(_){}el.classList.add('drag8')});
  el.addEventListener('dragover',e=>{const g=e.target.closest('[data-drop]');if(!g||!el.classList.contains('drag8'))return;e.preventDefault();g.classList.add('over')});
  el.addEventListener('dragleave',e=>{const g=e.target.closest('[data-drop]');if(g&&!g.contains(e.relatedTarget))g.classList.remove('over')});
  el.addEventListener('drop',e=>{const g=e.target.closest('[data-drop]');if(!g)return;e.preventDefault();g.classList.remove('over');el.classList.remove('drag8');let d='';try{d=e.dataTransfer.getData('text/plain')}catch(_){}const m=/^rbchest:(take|put):(\d+)$/.exec(d);
   if(!m)return;const mode=m[1],it=+m[2];if(g.dataset.drop==mode)return;/* dropped on its own side */const o=OBJ[K];if(!o)return;const n=mode=='take'?((o.c.it.find(x=>x[0]==it)||[0,0])[1]):cnt(it);if(n>0)move(K,mode,it,n)});
  document.addEventListener('dragend',()=>{if(el){el.classList.remove('drag8');for(const g of el.querySelectorAll('.over'))g.classList.remove('over')}})}
 function act(b,how){const mode=b.dataset.m,i=+b.dataset.i,o=OBJ[K];if(!o)return;const have=mode=='take'?((o.c.it.find(x=>x[0]==i)||[0,0])[1]):cnt(i);if(have<1){panes();return}
  if(!move(K,mode,i,how=='all'?have:how=='half'?Math.ceil(have/2):1)&&!(rm&&!rm.isHost))panes()}
 async function rename(){const o=OBJ[K],k=K;if(!o)return;const v=await DLG7.open({title:'Name this chest',fields:[{k:'nm',label:'Name (16 letters)',val:o.c.nm||'',max:16}],ok:'Save'});if(!v||!OBJ[k])return;
  const n=String(v.nm||'').replace(/[<>]/g,'').trim().slice(0,16)||ODEF[OBJ[k].t].n;OBJ[k].c.nm=n;changed(k,OBJ[k]);if(K===k){const b=el.querySelector('.nm8');if(b)b.textContent=n}}
 function recolour(i){const o=OBJ[K];if(!o||!OBJ6.canConfig(myId))return;o.c.col=Math.max(0,Math.min(CHCOL.length-1,i|0));changed(K,o);OBJ6.sfx('click');const C=CHCOL[o.c.col];const s=el.querySelector('.sw8');if(s){s.style.setProperty('--c1',C[1]);s.style.setProperty('--c2',C[2])}for(const b of el.querySelectorAll('[data-col]'))b.classList.toggle('on',+b.dataset.col==o.c.col)}
 function open(k){const o=OBJ[k];if(!o||!ODEF[o.t]||ODEF[o.t].cat!='cont')return;mk();if(K>=0&&K!==k&&OBJ[K])OBJ[K]._open=0;K=k;o._open=1;try{o.c.it=o.c.it.filter(x=>Array.isArray(x)&&x[0]>0&&x[1]>0)}catch(_){}shell();panes()}
 function close(){if(OBJ[K])OBJ[K]._open=0;const was=K>=0;K=-1;if(el)el.style.display='none';try{const a=document.activeElement;if(a&&el&&el.contains(a))a.blur()}catch(_){}if(was)flush()}
 // Esc closes; E closes too (E beside a chest opens it), unless you are typing or the inventory is on top
 addEventListener('keydown',e=>{if(K<0)return;if(e.key=='Escape'){if(DLG7.isOpen)return;close();e.stopPropagation();return}
  if((e.key=='e'||e.key=='E')&&!e.repeat&&!e.ctrlKey&&!e.altKey&&!e.metaKey){try{if(isTextEl(e.target))return}catch(_){}if(typeof INV7!='undefined'&&INV7.isOpen)return;if(DLG7.isOpen)return;close();e.stopPropagation();e.preventDefault()}},true);
 const _t=OBJ6.tick;OBJ6.tick=function(dt){_t(dt);if(K>=0){const o=OBJ[K];if(!o||!ODEF[o.t]||ODEF[o.t].cat!='cont'){close();return}const x=K%W*T+T/2,y=(K/W|0)*T+T/2;if(Math.abs(P.x-x)>T*3.2||Math.abs(P.y+P.h/2-y)>T*3.6)close()}};
 const _lw=loadWorld;loadWorld=function(){try{close();flush()}catch(_){}return _lw.apply(this,arguments)};
 addEventListener('pagehide',flush);addEventListener('beforeunload',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
 UI6.chestRefresh=()=>{if(K>=0)panes()};
 return{open,close,render:()=>{if(K>=0)panes()},move,takeAll,depositMatching:depMatch,depositAll:depAll,sort:sortChest,quick,nearby,flush,capOf,CAP,get k(){return K},get q(){return q},set q(v){q=String(v||'').trim().toLowerCase();if(K>=0){const i=el.querySelector('#chq8');if(i)i.value=q;panes()}}}})();
