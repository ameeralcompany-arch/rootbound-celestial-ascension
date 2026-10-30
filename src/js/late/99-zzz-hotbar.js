// ===== HOTBAR6 (v7): seven slots on keys 1-7 (mouse wheel cycles them). Any item you own fits in any slot: blocks, seeds, objects,
// materials, weapons and guns, the five tools, wearables. Using the held slot does what the item does: blocks / seeds / objects place
// (left or right click), weapons attack, tools dig, Bubbles fishes, a wearable slot puts it on / takes it off. Empty slot = fists.
// Assign: drag an item from the inventory onto a slot, or select it and press 1-7 / click a slot / use the slot buttons in its details.
// Right-click a slot to clear it; drag slot onto slot to swap. A stack that runs out stays in its slot, greyed (never silently swapped).
// Under-level weapons show locked and say why when used. Layout + selection are saved per profile (RB_PREFIX + 'rbphb', v2 = 7 slots).
// Saves from the 6-slot bar (v1) keep every slot where it was; the new slot 7 gets Twiggy (the 5th tool, which never fit before) unless
// Twiggy is already on the bar, then it starts empty. New saves: 1 weapon, 2 Pip, 3 Pebble, 4 Glimmer, 5 a block, 6 Bubbles, 7 Twiggy.
// The bar is drawn once and patched only when something changes (barDirty / selection / level); slot icons all go through paint(),
// which calls window.SLOTDECO(ctx,item,x,y,size) and TOOLLV.badge(ctx,id,x,y,size,t) when present (tool-level shine hook). =====
const HOTBAR=(()=>{
 const N=7,PITCH=72,PK=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbphb';
 const S={s:Array(N).fill(null),c:0},H={wp:null,st:null,lv:-1,drag:0,warnT:0,pillT:0};
 const norm=k=>typeof k=='string'&&/^\d+$/.test(k)?+k:(k===0||k==='')?null:k;
 const okKey=k=>{if(k==null)return false;if(typeof k=='number')return Number.isInteger(k)&&k>0&&(k>=200?!!MAT[k]:k>=100?!!BLK[k-100]:!!BLK[k]);if(typeof k!='string')return false;
  if(k.startsWith('w:'))return!!WPN[k.slice(2)];if(k.startsWith('a:'))return!!WEAR[k.slice(2)];return false};
 const wid=k=>typeof k=='string'&&k.startsWith('w:')?k.slice(2):'';
 const kind=k=>k==null?'empty':typeof k=='number'?(k<200?'place':'mat'):k[0]=='a'?'wear':(WPN[wid(k)]||{}).k=='tool'?'tool':'weapon';
 const owned=k=>{if(k==null)return false;if(typeof k=='number')return cnt(k)>0;const id=k.slice(2);return k[0]=='a'?!!ownW[id]:!!own[id]};
 const locked=k=>{const w=WPN[wid(k)];return!!w&&((w.lv|0)>(lvl|0)||CJOB.blocks(wid(k)))};   // under level, or another class's weapon (CJOB)
 const state=k=>k==null?'empty':typeof k=='number'?(cnt(k)>0?'ok':'out'):!owned(k)?'missing':locked(k)?'lock':'ok';
 const assignable=k=>{k=norm(k);return okKey(k)&&(typeof k=='number'?cnt(k)>0:owned(k))};
 const nameOf=k=>{try{if(k==null)return'Empty';if(typeof k=='number')return iname(k);return k[0]=='a'?WEAR[k.slice(2)].n:WPN[k.slice(2)].n}catch(_){return String(k)}};
 const wearing=k=>{const w=WEAR[(k||'').slice(2)];return!!w&&wear[w.s]==k.slice(2)};
 const icon=k=>{try{return iconURL(k)}catch(_){return''}};
 const free=()=>entered&&!(typeof dlgOpen!='undefined'&&dlgOpen)&&!(typeof creatorOn!='undefined'&&creatorOn)&&menuEl.style.display=='none';
 const snd=n=>{try{UIS.play(n)}catch(_){}};
 // ---- default layout (new saves and saves from before the hotbar): 1 your weapon, 2-4 Pip / Pebble / Glimmer, 5 your block, 6 Bubbles, 7 Twiggy
 function bestWeapon(){const ids=Object.keys(WPN).filter(id=>own[id]&&WPN[id].k!='tool'&&id!='fist'&&!locked('w:'+id));
  for(const id of[wp,typeof PLAY8!='undefined'?PLAY8.last.wpn:''])if(id&&ids.includes(id))return id;
  const pw=id=>typeof window.WPOWER=='function'?+WPOWER(id)||0:WPN[id].md|0;   // effective power (86-zz-balance.js), raw damage as fallback
  ids.sort((a,b)=>pw(b)-pw(a)||(WPN[b].lv|0)-(WPN[a].lv|0));return ids[0]||'fist'}
 function bestBlock(){const ok=k=>typeof k=='number'&&k>0&&k<200&&okKey(k)&&cnt(k)>0;if(ok(bar[sel]))return bar[sel];for(const k of bar)if(ok(k))return k;
  const ks=Object.keys(inv).map(Number).filter(k=>ok(k)&&k<100&&k!=17&&k!=4&&k!=16).sort((a,b)=>cnt(b)-cnt(a));return ks[0]||null}
 function defaults(){return['w:'+bestWeapon(),'w:pip','w:pebble','w:glimmer',bestBlock(),'w:bubbles','w:twiggy'].map(k=>okKey(k)?k:null)}
 // v1 (6 slots) -> v2 (7 slots): slots 1-6 stay as they were; slot 7 = Twiggy when it is not on the bar yet, else empty
 function load(){let o=null;try{o=JSON.parse(localStorage.getItem(PK())||'null')}catch(_){}
  if(o&&Array.isArray(o.s)){const seen=new Set(),old=!(o.v>=2);S.s=Array(N).fill(null);for(let i=0;i<N;i++){const k=norm(o.s[i]);S.s[i]=okKey(k)&&!seen.has(k)?k:null;if(S.s[i]!=null)seen.add(k)}
   if(old&&S.s[6]==null&&!seen.has('w:twiggy')&&okKey('w:twiggy'))S.s[6]='w:twiggy';S.c=Number.isInteger(o.c)&&o.c>=-1&&o.c<N?o.c:0;if(old)H.mig=1;return true}
  S.s=defaults();const i=S.s.indexOf('w:'+wp);S.c=i>=0?i:0;return false}
 const save=()=>{try{localStorage.setItem(PK(),JSON.stringify({v:2,s:S.s,c:S.c}))}catch(_){}};
 // ---- holding: the selected slot decides what is in your hand (wp) and what a click places (bar[sel])
 function hold(){const k=S.c>=0?S.s[S.c]:null,t=kind(k),st=state(k);H.st=st;
  if(S.c>=0){bar[0]=typeof k=='number'?k:0;sel=0;let w='fist';if((t=='tool'||t=='weapon')&&st=='ok')w=wid(k);wp=w}H.wp=wp}
 function pick(i,quiet){if(i<0||i>=N)return;const k=S.s[i];if(kind(k)=='wear'){toggleWear(k,i);return}const ch=i!==S.c;S.c=i;hold();save();render();if(!quiet){pill(i);if(ch){snd('select');pop(i)}}}
 function step(d){const c=S.c<0?(d>0?-1:N):S.c;pick((c+d+N)%N)}
 function toggleWear(k,i){const id=k.slice(2),w=WEAR[id];if(!ownW[id]){warn(k,'missing');return}wear[w.s]=wear[w.s]==id?'':id;if(wear[w.s])try{G('wear')}catch(_){}
  try{renderSkills()}catch(_){}snd('select');pop(i);render();pill(i,(wear[w.s]?'Wearing':'Took off')+' · press '+(i+1)+' again to '+(wear[w.s]?'take it off':'wear it'))}
 // something outside the hotbar changed the hand (store / inventory equip, X swap, a level gate): follow it
 function sync(){if(wp===H.wp)return;H.wp=wp;const i=S.s.indexOf('w:'+wp);
  if(i>=0)S.c=i;else{const t=S.c>=0?kind(S.s[S.c]):'';if(!(wp=='fist'&&(t=='place'||t=='mat'||t=='empty'))){S.c=-1;bar[0]=0}}
  H.st=S.c>=0?state(S.s[S.c]):null;save();render();if(entered)pill(S.c)}
 function refresh(){if(wp!==H.wp){sync();return}if(S.c>=0&&state(S.s[S.c])!==H.st)hold();render()}
 function set(i,k,o){if(i<0||i>=N)return false;k=norm(k);if(k!=null&&!okKey(k))return false;const j=k==null?-1:S.s.indexOf(k);if(j>=0&&j!==i)S.s[j]=S.s[i];S.s[i]=k;
  if(S.c<0){const a=S.s.indexOf('w:'+wp);if(a>=0)S.c=a}if(S.c===i||S.c===j)hold();save();render();
  if(!(o&&o.quiet)){if(k!=null){pop(i);snd('select');try{say(nameOf(k)+' → slot '+(i+1))}catch(_){}}else{snd('close');try{say('Slot '+(i+1)+' cleared')}catch(_){}}}return true}
 function swap(a,b){if(a===b||a<0||b<0||a>=N||b>=N)return;const t=S.s[a];S.s[a]=S.s[b];S.s[b]=t;if(S.c===a)S.c=b;else if(S.c===b)S.c=a;hold();save();render();pop(b);snd('select')}
 // inventory "Equip": hold it now; if it is not on the bar yet it goes to the first empty slot, else replaces the selected slot
 const equipSlot=k=>{k=norm(k);const j=S.s.indexOf(k);if(j>=0)return j;const e=S.s.indexOf(null);return e>=0?e:S.c>=0?S.c:0};
 function equip(k){k=norm(k);if(!assignable(k))return false;const i=equipSlot(k);if(S.s[i]!==k)set(i,k,{quiet:1});pick(i);return true}
 function warn(k,st){const n=performance.now(),wk=st+'|'+k;if(n-H.warnT<1200&&H.wk===wk)return;H.warnT=n;H.wk=wk;const w=WPN[wid(k)];
  try{say(st=='lock'?((w.lv|0)>(lvl|0)?'Reach level '+w.lv+' to use '+w.n:CJOB.why(wid(k))):st=='out'?'Out of '+nameOf(k)+' — break or buy more':'You do not own '+nameOf(k)+' any more')}catch(_){}snd('error')}
 // ---- input: the left button places a held block (same rules as right-click) or explains a locked / used-up slot instead of punching
 {const _u=update;update=function(dt){sync();if((lvl|0)!==H.lv){H.lv=lvl|0;refresh()}
   if(!mdL||S.c<0)return _u.apply(this,arguments);const k=S.s[S.c],t=kind(k),st=state(k);
   if(t!='place'&&(st=='ok'||st=='empty'))return _u.apply(this,arguments);
   let fake=false;mdL=false;if(t=='place'&&st=='ok'){if(!mdR){mdR=true;fake=true}}else if(!showInv)warn(k,st);
   try{return _u.apply(this,arguments)}finally{if(fake)mdR=false;if(menuEl.style.display=='none')mdL=true}}}
 // ---- keys 1-7 (8-9 do nothing); with the inventory open and an item selected, 1-7 put that item in the slot
 selBar=function(i){if(i<0||i>=N)return;if(typeof INV7!='undefined'&&INV7.isOpen){const k=INV7.selK;if(k!=null&&assignable(k)){set(i,k);try{INV7.render()}catch(_){}return}}if(free())pick(i)};
 let acc=0,lastW=0,lastStep=0;
 function wheel(e){if(!free())return;const now=performance.now(),dy=e.deltaY*(e.deltaMode==1?33:e.deltaMode==2?400:1);if(now-lastW>350)acc=0;lastW=now;acc+=dy;
  if(Math.abs(acc)>=45&&now-lastStep>90){lastStep=now;step(acc>0?1:-1);acc=0}}
 try{PLAY8.wheel=wheel}catch(_){}
 cycleW=function(){step(1)};
 // the Store's "Equip" on a weapon puts it on the bar too (first empty slot, else the selected one), like the inventory
 try{const _se=SHOP7.equip;SHOP7.equip=function(id){const r=_se.apply(this,arguments);try{const it=SHOP7.byId.get(id);if(r&&it&&SHOP7.slotOf(it)=='weapon'&&own[it.ref])equip('w:'+it.ref)}catch(_){}return r}}catch(_){}
 // ---- drawing: built once, then each slot is patched only when its item / count / state / selection changes
 const LOCK='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 7V5.2a3.5 3.5 0 0 1 7 0V7h.8c.4 0 .7.3.7.7v6.6c0 .4-.3.7-.7.7H3.7a.7.7 0 0 1-.7-.7V7.7c0-.4.3-.7.7-.7zm1.8 0h3.4V5.2a1.7 1.7 0 0 0-3.4 0z"/></svg>';
 const SUB={soft:'Tool · digs dirt, sand, wood',stone:'Tool · cracks stone & brick',ore:'Tool · mines whole ore veins',tree:'Tool · chops trees & wood',rod:'Tool · click water to fish'};
 function sub(k){const t=kind(k),st=state(k);if(t=='empty')return'Empty · drag an item here, or click to choose';if(st=='missing')return'You do not own this any more';
  if(st=='lock')return'Locked · reach level '+WPN[wid(k)].lv;if(st=='out')return'Used up · break or buy more';
  if(t=='place'){const c=ITEM7.cat(k);return(c=='seed'?'Seed · click soil to plant':c=='obj'||c=='door'?'Object · click to place':'Block · click to place')+' · '+cnt(k)}
  if(t=='mat')return ITEM7.catName(k)+' · '+cnt(k)+' · sells at the market';if(t=='wear')return wearing(k)?'Wearing · press again to take off':'Wearable · press to wear';
  const w=WPN[wid(k)];if(t=='tool')return SUB[w.tool]||'Tool';return(typeof GUN9!='undefined'&&GUN9.AIM&&GUN9.AIM.has(wid(k))?'Ranged · aim with the mouse':'Weapon · fights, never digs')}
 let root=null,ind=null,pl=null;const slots=[],IMC={};
 const DPR=()=>Math.min(2,Math.max(1,Math.round(window.devicePixelRatio||1)));
 // the ONE place slot icons are drawn: base icon, then the decoration hooks (SLOTDECO / TOOLLV.badge)
 function paint(cv,k){const x=cv.getContext('2d'),Z=cv.width;x.clearRect(0,0,Z,Z);if(k==null)return;const url=icon(k);if(!url)return;
  const im=IMC[url]||(IMC[url]=Object.assign(new Image(),{src:url}));
  const go=()=>{if(cv._k!==k)return;x.clearRect(0,0,Z,Z);x.imageSmoothingEnabled=false;try{x.drawImage(im,0,0,Z,Z)}catch(_){}deco(x,k,0,0,Z)};
  if(im.complete&&im.naturalWidth)go();else im.addEventListener('load',go,{once:true})}
 function deco(x,k,X,Y,Z){try{if(typeof window.SLOTDECO=='function')window.SLOTDECO(x,k,X,Y,Z)}catch(e){console.error('SLOTDECO',e)}
  try{const id=wid(k);if(id&&WPN[id].k=='tool'&&typeof TOOLLV!='undefined'&&TOOLLV&&typeof TOOLLV.badge=='function')TOOLLV.badge(x,id,X,Y,Z,performance.now()/1000)}catch(e){console.error('TOOLLV.badge',e)}}
 function build(){const el=document.getElementById('bar');if(!el)return false;if(root===el&&slots[0]&&slots[0].parentNode===el)return true;root=el;slots.length=0;el.innerHTML='';el.classList.add('hb6');el.setAttribute('role','toolbar');el.setAttribute('aria-label','Hotbar');
  ind=document.createElement('i');ind.className='ind6';ind.setAttribute('aria-hidden','true');el.append(ind);const Z=48*DPR();
  for(let i=0;i<N;i++){const s=document.createElement('div');s.className='s6 st-empty';s.dataset.i=i;s.tabIndex=0;s.setAttribute('role','button');s.draggable=true;
   s.innerHTML='<canvas width="'+Z+'" height="'+Z+'"></canvas><i class="k6">'+(i+1)+'</i><b class="n6"></b><u class="lk6">'+LOCK+'</u>';s._cv=s.firstChild;s._n=s.querySelector('.n6');s._sig='';el.append(s);slots.push(s)}
  pl=document.createElement('div');pl.className='pill6';pl.setAttribute('aria-live','polite');pl.innerHTML='<kbd></kbd><span><b></b><small></small></span>';el.append(pl);
  el.addEventListener('click',e=>{const s=e.target.closest('.s6');if(!s)return;click(+s.dataset.i)});
  el.addEventListener('keydown',e=>{if(e.key=='Enter'){const s=e.target.closest('.s6');if(s){e.preventDefault();click(+s.dataset.i)}}});
  el.addEventListener('contextmenu',e=>{e.preventDefault();const s=e.target.closest('.s6');if(s&&S.s[+s.dataset.i]!=null)set(+s.dataset.i,null)});
  el.addEventListener('dragstart',e=>{const s=e.target.closest('.s6');if(!s||S.s[+s.dataset.i]==null){e.preventDefault();return}try{e.dataTransfer.setData('text/plain','rbslot:'+s.dataset.i);e.dataTransfer.effectAllowed='move'}catch(_){}dragBegin()});
  el.addEventListener('dragover',e=>{if(!H.drag)return;const s=e.target.closest('.s6');if(!s)return;e.preventDefault();try{e.dataTransfer.dropEffect='move'}catch(_){}if(!s.classList.contains('over')){for(const o of slots)o.classList.remove('over');s.classList.add('over')}});
  el.addEventListener('dragleave',e=>{const s=e.target.closest('.s6');if(s&&!s.contains(e.relatedTarget))s.classList.remove('over')});
  el.addEventListener('drop',e=>{const s=e.target.closest('.s6');if(!s)return;e.preventDefault();let d='';try{d=e.dataTransfer.getData('text/plain')}catch(_){}drop(+s.dataset.i,d);dragEnd()});
  return true}
 function drop(i,d){d=String(d||'');if(d.startsWith('rbslot:'))swap(+d.slice(7),i);else if(d.startsWith('rbitem:')){const k=norm(d.slice(7));if(assignable(k)){set(i,k);try{if(INV7.isOpen)INV7.render()}catch(_){}}}}
 function dragBegin(){H.drag=1;document.documentElement.classList.add('hbdrag');show('↓','Drop it on a hotbar slot','Slots 1–7 · if it is already on the bar the two slots swap','ok',60000)}
 function dragEnd(){if(!H.drag)return;H.drag=0;document.documentElement.classList.remove('hbdrag');for(const o of slots)o.classList.remove('over');clearTimeout(H.pillT);H.pillT=setTimeout(()=>{if(pl)pl.classList.remove('on')},500)}
 document.addEventListener('dragend',dragEnd);
 function click(i){const inv7=typeof INV7!='undefined'&&INV7.isOpen;
  if(inv7){const k=INV7.selK;if(k!=null&&assignable(k)){set(i,k);try{INV7.render()}catch(_){}}else try{INV7.open(null,i)}catch(_){}return}
  if(i===S.c||S.s[i]==null){try{INV7.open(null,i)}catch(_){}return}pick(i)}
 function render(){if(!build())return;for(let i=0;i<N;i++){const s=slots[i],k=S.s[i],t=kind(k),st=state(k),n=(t=='place'||t=='mat')?cnt(k):0,on=i===S.c,url=k==null?'':icon(k),wr=t=='wear'&&wearing(k);
   const sig=k+'|'+st+'|'+n+'|'+on+'|'+wr;if(sig===s._sig&&url===s._u)continue;s._sig=sig;
   s.className='s6 st-'+st+' t-'+t+(on?' on':'')+(wr?' worn':'');if(k!=null){s.dataset.rar=ITEM7.rar(k);s.dataset.cat=ITEM7.cat(k)}else{delete s.dataset.rar;delete s.dataset.cat}
   const nt=st=='lock'?'Lv '+WPN[wid(k)].lv:(t=='place'||t=='mat')?String(n):'';if(s._n.textContent!==nt){const up=n>(s._c|0)&&s._k===k;s._n.textContent=nt;if(up)bump(s._n)}s._c=n;
   s.title=(i+1)+' · '+nameOf(k)+' — '+sub(k)+(k!=null?' · right-click to clear':'');s.setAttribute('aria-label',s.title);s.setAttribute('aria-pressed',on?'true':'false');
   if(s._k!==k||url!==s._u){s._k=k;s._u=url;s._cv._k=k;paint(s._cv,k)}}
  if(ind._c!==S.c){ind._c=S.c;if(S.c>=0)ind.style.transform='translate3d('+(S.c*PITCH)+'px,0,0)';ind.classList.toggle('off',S.c<0)}}
 const anim=(el,kf,o)=>{try{if(el&&el.animate&&!MOTION7.reduce())el.animate(kf,o)}catch(_){}};
 function pop(i){const s=slots[i];if(s)anim(s._cv,[{transform:'scale(.72) rotate(-8deg)'},{transform:'scale(1.12) rotate(3deg)',offset:.6},{transform:'none'}],{duration:280,easing:'cubic-bezier(.2,.9,.3,1.2)'})}
 function bump(el){anim(el,[{transform:'scale(1.35)'},{transform:'none'}],{duration:220,easing:'ease-out'})}
 function pill(i,txt){const k=i>=0?S.s[i]:wp?'w:'+wp:null;show(i>=0?String(i+1):'✋',i>=0?nameOf(k):nameOf(k)+' (not on the hotbar)',txt||(i>=0?sub(k):'Drag it onto the hotbar, or press 1–7 to switch'),i>=0?state(k):'ok')}
 function show(kb,ti,su,st,ms){if(!build())return;pl.querySelector('kbd').textContent=kb;pl.querySelector('b').textContent=ti;pl.querySelector('small').textContent=su;pl.dataset.st=st;
  if(pl.classList.contains('on'))anim(pl.querySelector('span'),[{transform:'translateY(5px)',opacity:.3},{transform:'none',opacity:1}],{duration:200,easing:'ease-out'});else pl.classList.add('on');
  clearTimeout(H.pillT);H.pillT=setTimeout(()=>pl.classList.remove('on'),ms||1700)}
 // ---- install: replace the old fixed bar, migrate, draw
 renderBar=function(){refresh()};renderW=function(){refresh()};
 try{const q=QUEST.find(q=>q[2]=='break');if(q)q[1]='Hold a tool from your hotbar (keys 1–7 or the mouse wheel), then left-click a block';const p=QUEST.find(q=>q[2]=='place');if(p)p[1]='Select a block on the hotbar, then click to place it'}catch(_){}
 const had=load();hold();if(!had||H.mig)save();render();
 // "put away": nothing in the hand (no slot selected, fists) until a slot is picked again
 function unhold(){S.c=-1;bar[0]=0;wp='fist';H.wp=wp;H.st=null;save();render()}
 return{get slots(){return S.s.slice()},get cur(){return S.c},N,set,clear:i=>set(i,null),pick,step,swap,equip,equipSlot,unhold,assignable,state,kind,nameOf,render,repaint(){for(const s of slots){s._sig='';s._u=null}render()},paint,deco,defaults,load,dragBegin,dragEnd,drop,wheel,
  slotOf:k=>S.s.indexOf(norm(k)),held:()=>S.c>=0?S.s[S.c]:null}})();
