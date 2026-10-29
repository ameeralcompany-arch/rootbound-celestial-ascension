// ===== Shared UI components (modal / confirm / form). Uses design tokens only. =====
const DLG7=(()=>{
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 let host=null,cur=null;
 function ensure(){if(host)return host;host=document.createElement('div');host.id='dlg7';host.innerHTML='<div class="box" role="dialog" aria-modal="true"></div>';document.body.appendChild(host);
  host.addEventListener('mousedown',e=>{if(e.target===host&&cur&&cur.dismiss)cur.done(null)});
  addEventListener('keydown',e=>{if(!cur)return;if(e.key=='Escape'){e.stopPropagation();e.preventDefault();cur.done(null)}else if(e.key=='Enter'&&e.target.tagName!='TEXTAREA'&&e.target.tagName!='BUTTON'){const b=host.querySelector('[data-ok]');if(b){e.stopPropagation();e.preventDefault();b.click()}}},true);return host}
 // fields: [{k,label,type,ph,val,max}] ; resolves with {k:value} or null
 function open({title,text,fields=[],ok='OK',cancel='Cancel',danger,dismiss=true,html}){return new Promise(res=>{ensure();if(cur)cur.done(null);const box=host.firstChild;
  box.innerHTML='<h3>'+esc(title||'')+'</h3>'+(text?'<p>'+esc(text)+'</p>':'')+(html||'')+fields.map(f=>'<label>'+esc(f.label||'')+(f.type=='select'?'<select data-k="'+f.k+'">'+f.opts.map(o=>'<option value="'+esc(o[0])+'"'+(o[0]==f.val?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>':'<input data-k="'+f.k+'" type="'+(f.type||'text')+'" placeholder="'+esc(f.ph||'')+'" maxlength="'+(f.max||40)+'" value="'+esc(f.val||'')+'" autocomplete="off">')+'</label>').join('')
   +'<div class="acts">'+(cancel?'<button data-cancel>'+esc(cancel)+'</button>':'')+'<button data-ok class="'+(danger?'danger':'pri')+'">'+esc(ok)+'</button></div>';
  const done=v=>{if(cur&&cur.done!==done)return;cur=null;host.classList.remove('on');try{UIS.play('close')}catch(_){}setTimeout(()=>{if(!cur)host.style.display='none'},200);res(v)};
  cur={done,dismiss};host.style.display='flex';requestAnimationFrame(()=>host.classList.add('on'));try{UIS.play('open')}catch(_){}
  box.querySelector('[data-ok]').onclick=()=>{const o={};for(const i of box.querySelectorAll('[data-k]'))o[i.dataset.k]=i.value;done(o)};const c=box.querySelector('[data-cancel]');if(c)c.onclick=()=>done(null);
  const f=box.querySelector('input,select');setTimeout(()=>{try{(f||box.querySelector('[data-ok]')).focus()}catch(_){}},30)})}
 return{open,confirm:(title,text,ok,danger)=>open({title,text,ok:ok||'Confirm',danger}).then(v=>!!v),alert:(title,text)=>open({title,text,cancel:'',ok:'OK'}),esc,get isOpen(){return !!cur}}})();
// ===== MOTION7: helpers for the shared motion language (88-motion.css). Transform/opacity only; instant with reduced motion. =====
// stagger(el,sel)  : items fade/rise in one after another (index in --i, capped), played once, then the class is dropped so hovers work normally
// still(el)        : re-render without replaying the entrance
// ind(nav,sel,mode): one sliding indicator per nav ('v' pill behind vertical tabs, 'u' underline under horizontal tabs); host keeps the last position across re-renders
// tick(el,to,from) : numbers count to their new value (~0.4 s ease-out)
const MOTION7=(()=>{
 const reduce=()=>document.documentElement.getAttribute('data-reduce')=='true';
 function stagger(el,sel,max){if(!el)return;const its=el.querySelectorAll(sel||':scope>*');let i=0;for(const k of its){k.classList.add('si');k.style.setProperty('--i',Math.min(i++,max||14))}el.classList.add('stg');clearTimeout(el._stg);el._stg=setTimeout(()=>el.classList.remove('stg'),1100)}
 function still(el){if(el){clearTimeout(el._stg);el.classList.remove('stg')}}
 function ind(nav,sel,mode,host){if(!nav)return;host=host||nav;mode=mode||'v';const on=nav.querySelector(sel||'.on');let b=nav.querySelector(':scope>.nind7');if(!b){b=document.createElement('i');b.className='nind7 '+mode;b.setAttribute('aria-hidden','true');nav.insertBefore(b,nav.firstChild)}
  if(!on){b.style.opacity=0;host._ind=null;return}const r={x:on.offsetLeft,y:on.offsetTop,w:on.offsetWidth,h:on.offsetHeight},prev=host._ind;host._ind=r;
  const set=q=>{if(mode=='u')b.style.transform='translate('+q.x+'px,'+(q.y+q.h-2)+'px) scaleX('+(q.w/100)+')';else{b.style.width=q.w+'px';b.style.height=q.h+'px';b.style.transform='translate('+q.x+'px,'+q.y+'px)'}};
  const snap=q=>{b.style.transition='none';set(q);b.style.opacity=1;void b.offsetWidth;b.style.transition=''};
  if(prev&&!reduce()&&(prev.x!=r.x||prev.y!=r.y)){snap(prev);set(r)}else snap(r)}
 function tick(el,to,from){if(!el)return;to=Math.round(+to||0);const f=from!=null?+from:el._v!=null?el._v:to;el._v=to;cancelAnimationFrame(el._raf);if(reduce()||f===to||!isFinite(f)){el.textContent=to;return}
  const t0=performance.now(),d=Math.min(700,320+Math.abs(to-f)*.6);el.textContent=Math.round(f);const step=now=>{const u=Math.min(1,(now-t0)/d),e=1-Math.pow(1-u,3);el.textContent=Math.round(f+(to-f)*e);if(u<1)el._raf=requestAnimationFrame(step)};el._raf=requestAnimationFrame(step)}
 return{stagger,still,ind,tick,reduce}})();
// ===== ITEM7: one item vocabulary for every screen. Category from the key, rarity from the catalog first (else by value), glyph + label so rarity never relies on colour alone =====
const ITEM7=(()=>{
 const RAR=['common','uncommon','rare','epic','legendary','mythic'],RN=['Common','Uncommon','Rare','Epic','Legendary','Mythic'],GLY=['○','◇','◆','✦','★','✷'];
 const CATN={block:'Block',seed:'Seed',mat:'Material',fish:'Fish',bait:'Bait',obj:'Object',door:'Door',wear:'Wearable',weapon:'Weapon',wing:'Wings',fx:'Effect'};
 const CATG={block:'▦',seed:'❦',mat:'◈',fish:'≈',bait:'∘',obj:'▣',door:'⌂',wear:'✧',weapon:'⚔︎',wing:'❧',fx:'✺'};
 let map=null;const keyOf=i=>i.cat=='weapons'?'w:'+i.ref:i.cat=='gear'?'a:'+i.ref:i.cat=='wings'?'wing:'+i.ref:(i.cat=='blocks'||i.cat=='seeds'||i.cat=='objects')?String(+i.ref):'id:'+i.id;
 const idx=()=>{if(map)return map;map={};try{for(const i of SHOP7.items)map[keyOf(i)]=i.rar=='exclusive'?'mythic':i.rar}catch(_){}return map};
 function cat(k){if(typeof k=='string'){if(/^\d+$/.test(k))k=+k;else return k[0]=='a'?'wear':k.startsWith('w:')?'weapon':k.startsWith('wing:')?'wing':'fx'}
  if(k>=250&&k<=252)return'bait';if(k>=240&&k<=249)return'fish';if(k>=200)return'mat';if(k>=100)return'seed';
  if((k>=20&&k<=41||k>=85&&k<=89)&&typeof ODEF!='undefined'&&ODEF[k])return ODEF[k].cat=='door'?'door':'obj';return'block'}
 function value(k){try{if(typeof k=='string'){if(k[0]=='a'){const w=WEAR[k.slice(2)];return w.cost+(w.lv|0)*40}if(k.startsWith('w:'))return WPN[k.slice(2)].cost|0;return 0}return MAT[k]?MAT[k].p*3:(PRICE[k%100]||10)*(k>=100?5:1)}catch(_){return 0}}
 const byValue=c=>c<30?0:c<110?1:c<320?2:c<800?3:c<2000?4:5;
 function tier(k){if(typeof k=='string'&&k.startsWith('w:')&&typeof WPN!='undefined'){const wr=(WPN[k.slice(2)]||{}).rar,t=RAR.indexOf(wr=='exclusive'?'mythic':wr);if(t>=0)return t}const r=idx()[String(k)];if(r){const t=RAR.indexOf(r);if(t>=0)return t}return byValue(value(k))}
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 // attributes for any item element, and the small rarity label
 const attrs=k=>' data-cat="'+cat(k)+'" data-rar="'+RAR[tier(k)]+'"';
 const tag=k=>{const t=tier(k);return'<span class="rtag" data-rar="'+RAR[t]+'">'+RN[t]+'</span>'};
 const glyph=k=>{const t=tier(k);return'<i class="rp7" aria-hidden="true">'+GLY[t]+'</i>'};
 // weapon power: one number per weapon. window.WPOWER(id) (combat balance) when present, else damage per second from WPN (md / cd)
 function power(k){const id=typeof k=='string'&&k.startsWith('w:')?k.slice(2):k;const w=typeof WPN!='undefined'&&WPN[id];if(!w)return 0;
  try{if(typeof window.WPOWER=='function'){const v=+window.WPOWER(id);if(isFinite(v))return Math.round(v)}}catch(_){}return Math.round((+w.md||0)/Math.max(.08,+w.cd||.5))}
 // weapons/tools order everywhere: rarity tier high -> low (mythic first), then power high -> low, then level requirement, then name
 const wcmp=(a,b)=>tier(b)-tier(a)||power(b)-power(a)||((WPN[b.slice(2)]||{}).lv|0)-((WPN[a.slice(2)]||{}).lv|0)||String((WPN[a.slice(2)]||{}).n).localeCompare(String((WPN[b.slice(2)]||{}).n));
 return{RAR,RN,GLY,CATN,CATG,cat,value,tier,power,wcmp,rar:k=>RAR[tier(k)],label:k=>RN[tier(k)],attrs,tag,glyph,esc,catName:k=>CATN[cat(k)]||'Item'}})();
