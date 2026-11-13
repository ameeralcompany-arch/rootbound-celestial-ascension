// ===== COL1: the Collection. Every cosmetic in the game, owned or not: a live try-on of your own character, its rarity, its collection, where it comes
// from (the store and its price, or breaking and its exact odds), wear and take off, and how complete each collection is. The odds and the duplicate
// rule are written out in full here, the same numbers the server uses. Opens from the Store, the dock (Collection) and Rootlink. =====
try{window.COL1=(()=>{
 if(!window.COS1)return{open(){},close(){}};
 const C=COS1,esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const RN={common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',legendary:'Legendary',mythic:'Mythic',exclusive:'Exclusive'};
 let el=null,filt='all',sel=null,raf=0,run=0,flip=1;
 const pct=t=>((C.TIERS[t]||{p:0}).p*100).toFixed(2)+'%';
 const how=it=>it.how==='drop'?'Found by breaking · '+esc((C.TIERS[it.tier]||{}).n||'Rare')+' · '+pct(it.tier)+' per break':'Store · '+it.price+' gems';
 const list=()=>C.items.filter(it=>filt=='all'||it.sub==filt||it.set==filt||(filt=='owned'&&C.owns(it.id))||(filt=='missing'&&!C.owns(it.id))).sort((a,b)=>(a.set>b.set?1:a.set<b.set?-1:0)||a.ord-b.ord);
 function setStats(){const out={};for(const it of C.items){const s=out[it.set]||(out[it.set]={n:0,h:0});s.n++;if(C.owns(it.id))s.h++}return out}
 function open(){close();el=document.createElement('div');el.id='col1';el.setAttribute('role','dialog');el.setAttribute('aria-label','Collection');document.body.appendChild(el);
  el.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(e.target===el){close();return}if(!b)return;const a=b.dataset.c;
   if(a=='x')close();else if(a=='f'){filt=b.dataset.v;render()}else if(a=='i'){sel=b.dataset.v;try{UIS.play('select')}catch(_){}render()}else if(a=='wear'){C.equip(sel);render()}else if(a=='off'){const it=C.byId.get(sel);if(it)C.unequip(it.sub);render()}
   else if(a=='store'){close();try{STORE7.open()}catch(_){}}else if(a=='book'){close();try{BOOK7.open()}catch(_){}}else if(a=='run'){run=run?0:1}else if(a=='flip'){flip=-flip}});
  addEventListener('keydown',onKey,true);if(!sel)sel=(C.items.find(it=>C.owns(it.id))||C.items[0]||{}).id;render();try{UIS.play('open')}catch(_){}}
 function onKey(e){if(!el)return;if(e.key=='Escape'){e.stopImmediatePropagation();e.preventDefault();close()}}
 function close(){if(!el)return;cancelAnimationFrame(raf);el.remove();el=null;removeEventListener('keydown',onKey,true)}
 function render(){if(!el)return;const S=setStats(),own=C.items.filter(it=>C.owns(it.id)).length,tot=C.items.length,it=C.byId.get(sel);
  const chips=[['all','All'],['owned','Owned'],['missing','Not yet'],...C.SLOTS.map(s=>[s,C.SLOTN[s]]),...Object.keys(C.SETS).map(k=>[k,C.SETS[k]])];
  el.innerHTML='<div class="c1p"><header><div><small>COLLECTION</small><h3>'+own+' / '+tot+' cosmetics</h3><div class="c1bar"><i style="width:'+Math.round(own/tot*100)+'%"></i></div></div><div class="c1hb"><button data-c="book" class="c1m">Milestone rewards</button><button class="c1x" data-c="x" aria-label="Close">×</button></div></header>'+
   '<nav>'+chips.map(([v,n])=>'<button data-c="f" data-v="'+v+'" class="'+(filt==v?'on':'')+'">'+esc(n)+(S[v]?' <em>'+S[v].h+'/'+S[v].n+'</em>':'')+'</button>').join('')+'</nav>'+
   '<main><section class="c1g">'+list().map(q=>'<button class="c1c'+(C.owns(q.id)?' own':'')+(q.id===sel?' sel':'')+(C.eq[q.sub]===q.id?' worn':'')+'" data-c="i" data-v="'+q.id+'" data-rar="'+q.rar+'"><canvas width="112" height="112" data-pv="'+q.id+'"></canvas><b>'+esc(q.n)+'</b><small>'+(C.owns(q.id)?(C.eq[q.sub]===q.id?'Wearing':'Owned'):(q.how==='drop'?'Not found yet':'In the store'))+'</small></button>').join('')+'</section>'+
   '<aside>'+(it?'<canvas class="c1big" width="300" height="300"></canvas><div class="c1pv"><button data-c="run">Walk / stand</button><button data-c="flip">Turn</button></div><span class="c1r" data-rar="'+it.rar+'">'+esc(RN[it.rar]||it.rar)+' · '+esc(C.SLOTN[it.sub]||it.sub)+'</span><h4>'+esc(it.n)+'</h4><p class="c1set">'+esc(it.setn||'')+'</p><p>'+esc(it.d.replace(/ Found only by breaking.*$/,''))+'</p><p class="c1how">'+how(it)+'</p>'+
    (C.owns(it.id)?(C.eq[it.sub]===it.id?'<button class="c1b s" data-c="off">Take off</button>':'<button class="c1b" data-c="wear">Wear it</button>'):it.how==='drop'?'<p class="c1note">Keep breaking natural blocks. Every counted break has the same chance.</p>':'<button class="c1b" data-c="store">See it in the store</button>'):'')+'</aside></main>'+
   '<footer><b>How rare finds work.</b> Every natural block you break by hand (one you or anyone has never placed or broken before) is a counted break, up to 60 a minute. For each one the server rolls: Ultra-exclusive 0.01%, Mythical 0.02%, Extremely rare 0.05%, Very rare 0.10%, Rare 0.50%. You always get a cosmetic of that tier you do not own yet; if you own the whole tier, one from the next tier down; if you own every cosmetic that can be found, gems instead. Buying cosmetics never changes these odds.</footer></div>';
  // the small pictures: your character wearing each one (drawn once per open)
  for(const c of el.querySelectorAll('canvas[data-pv]')){const q=C.byId.get(c.dataset.pv),x=c.getContext('2d');C.preview(x,q,112,112,1.2,{scale:1.55,only:false});if(!C.owns(q.id)){x.globalCompositeOperation='source-atop';x.fillStyle='rgba(10,8,22,.45)';x.fillRect(0,0,112,112);x.globalCompositeOperation='source-over'}}
  cancelAnimationFrame(raf);const big=el.querySelector('.c1big');if(big&&it){const x=big.getContext('2d'),t0=performance.now();const tick=()=>{if(!el||!big.isConnected)return;x.clearRect(0,0,300,300);C.preview(x,it,300,300,(performance.now()-t0)/1000,{scale:3.9,f:flip,vx:run?160:0});raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)}}
 return{open,close,get isOpen(){return !!el}}})()}catch(e){console.error('COL1',e)}
// the dock and the store: a way in
try{(()=>{const add=()=>{try{const s=document.querySelector('#s7 header, .s7 header, #store7 header');if(s&&!s.querySelector('[data-col1]')){const b=document.createElement('button');b.dataset.col1='1';b.className='s7col';b.textContent='Collection';b.onclick=()=>{try{STORE7.close()}catch(_){}COL1.open()};s.appendChild(b)}}catch(_){}};setInterval(add,700)})()}catch(_){}
