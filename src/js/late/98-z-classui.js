// ===== CLS9: the Classes screen. One CLASSES button in the top bar (or K) opens a full-screen glass section in a dark editorial style:
// soft cream light over black, a chrome class title, a glass side panel with the class level ring and its status (active / switch /
// learn / locked), a panel with the passive, its milestones, how to play and who teaches it, every weapon of the class with its key
// numbers (damage, speed, power, level, rarity, effect, special move, owned or not), and a rail of all 13 classes (click, or the arrow
// keys). Learned classes are switched here; new ones are still taught by their master in the Plaza (CJOB). It replaces the old HUD class
// badge and the Hub > Classes tab. =====
const CLS9=(()=>{
 const C=CLASS7.C,KEYS=Object.keys(C),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const pad=n=>String(n).padStart(2,'0'),pc=v=>Math.round(v*100)+'%';
 const free=()=>typeof RB_CREATIVE!='undefined'&&!!RB_CREATIVE;
 const job=()=>{try{return CJOB.cur}catch(_){return null}},learned=k=>{try{return CJOB.learned.includes(k)}catch(_){return false}};
 const master=k=>{try{const n=NPC2.list().find(n=>n.cls==k);return n?n.n:null}catch(_){return null}};
 const tip=k=>{try{return NPC2.TIPS[k]||''}catch(_){return''}};
 const KIND={fist:'Fists',knuckle:'Knuckles',pan:'Pan',sword:'Blade',spear:'Spear',bow:'Bow',wand:'Wand',staff:'Staff',scythe:'Scythe',sickle:'Sickle',hammer:'Hammer',maul:'Maul',flail:'Flail',shuriken:'Shuriken',chakram:'Chakram',glaive:'Glaive',whip:'Whip',gun:'Gun'};
 const FX={burn:'Burns',frost:'Chills',freeze:'Freezes',wave:'Light wave',poison:'Poisons',chain:'Chains',bleed:'Bleeds',stun:'Stuns',drain:'Drains life'};
 // the weapons of a class (no tools, no hidden evolution stages), starter first
 const weapons=k=>Object.keys(WPN).filter(id=>{const w=WPN[id];return w&&w.k!='tool'&&!w.hid&&CLASS7.of(w)==k}).sort((a,b)=>(WPN[a].lv|0)-(WPN[b].lv|0)||ITEM7.power('w:'+a)-ITEM7.power('w:'+b));
 let MX=null;const maxes=()=>MX||(MX=(()=>{let d=1,s=1,p=1;for(const id in WPN){const w=WPN[id];if(!w||w.k=='tool'||w.hid)continue;d=Math.max(d,+w.md||0);s=Math.max(s,1/Math.max(.08,+w.cd||.5));p=Math.max(p,ITEM7.power('w:'+id))}return{d,s,p}})());
 function status(k){if(free())return{t:'free',lab:'Open',sub:'creative mode'};const cj=job();
  if(cj===k)return{t:'active',lab:'Active',sub:'your class'};
  if(learned(k))return{t:'switch',lab:'Switch',sub:'learned · tap to use'};
  if(!cj||CJOB.canLearn())return{t:'learn',lab:'Learn',sub:'talk to '+(master(k)||'its master')};
  return{t:'locked',lab:'Locked',sub:C[cj].n+' level '+CJOB.NEED+' first'}}
 const ring=f=>{const r=44,c=2*Math.PI*r;return'<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="'+r+'" class="trk"/><circle cx="50" cy="50" r="'+r+'" class="val" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+(c*(1-f)).toFixed(1)+'"/></svg>'};
 const bar=(lab,v,max,txt)=>'<div class="sb"><label>'+lab+'</label><span><i style="width:'+Math.max(4,Math.min(100,Math.round(100*v/max)))+'%"></i></span><em>'+txt+'</em></div>';
 function wcard(id){const w=WPN[id],k='w:'+id,M=maxes(),sp=1/Math.max(.08,+w.cd||.5),pw=ITEM7.power(k),lv=w.lv|0,mine=!!own[id],low=lv>(lvl|0);let pic='';try{pic=iconURL(k)}catch(_){}
  const tags=[ITEM7.label(k),KIND[w.k]||w.k,lv?'Lv '+lv:'',FX[w.fx]||'',w.ev?'Evolves':''].filter(Boolean);
  return'<article class="c9w'+(mine?' own':'')+'" data-rar="'+ITEM7.rar(k)+'"><div class="pic">'+(pic?'<img src="'+pic+'" alt="">':'')+'</div><div class="tx"><b>'+esc(w.n)+'</b>'+
   '<span class="tags">'+tags.map((t,i)=>'<i'+(i?'':' class="rt"')+'>'+esc(t)+'</i>').join('')+'</span>'+
   bar('DMG',+w.md||0,M.d,Math.round(+w.md||0))+bar('SPD',sp,M.s,sp.toFixed(1)+'/s')+bar('PWR',pw,M.p,pw)+
   '<p class="mv">'+esc(w.move||w.d||'')+'</p><span class="own">'+(mine?'Owned':low?'Reach level '+lv:'In the Store')+'</span></div></article>'}
 // ---- the screen
 let el=null,sel=null;
 function html(){const k=sel,c=C[k],i=KEYS.indexOf(k),L=CLASS7.lv(k),need=CLASS7.need(L),xp=CLASS7.S.xp[k]||0,f=L>=100?1:Math.min(1,xp/need),st=status(k),ws=weapons(k),cj=job(),mn=master(k);
  const pname=(c.p.split(':')[0]||c.n).trim(),hand=(()=>{try{return CLASS7.cur()===k}catch(_){return false}})();
  const ms=[10,25,50,100].map(m=>'<li class="'+(L>=m?'got':'')+'"><b>Lv '+m+'</b><span>'+esc(CLASS7.perk(k,m))+'</span></li>').join('');
  const rules=free()?'Creative mode: every weapon works, whatever your class.':!cj?'You have no class yet, so every weapon works. Choose one by talking to its master.':
   'You can only fight with your class\'s weapons (fists and tools always work). Reach level '+CJOB.NEED+' in the class you use to learn another; learned classes keep their levels.';
  return'<div class="c9bg" aria-hidden="true"><i class="s1"></i><i class="s2"></i><i class="s3"></i><i class="s4"></i></div>'+
   '<header class="c9top"><span class="c9brand">Rootbound.</span><nav aria-label="Sections"><button data-go="my">Mythic</button><button data-go="ov">Overview</button><button data-go="wp">Weapons</button><button data-go="ms">Master</button></nav>'+
   '<span class="c9meta">Classes</span><button class="c9x" data-a="close" aria-label="Close classes">Close <b aria-hidden="true">✕</b></button></header>'+
   '<div class="c9v c9vl" aria-hidden="true">Class '+pad(i+1)+' / '+pad(KEYS.length)+'</div><div class="c9v c9vr" aria-hidden="true">'+esc(c.n)+' · #Lv'+L+'</div>'+
   '<div class="c9art" aria-hidden="true"><canvas class="c9heroc"></canvas></div>'+
   '<section class="c9hero"><div class="c9eye"><span>'+pad(i+1)+'</span><span>'+ws.length+' weapons</span><span>'+(hand?'in your hand':st.t=='active'?'your class':'')+'</span></div>'+
   '<h1 class="c9title">'+esc(c.n)+'<em>.</em></h1><p class="c9sub">'+esc(pname.toLowerCase())+' edition</p></section>'+
   '<aside class="c9side"><div class="c9orb c9lv" title="'+(L>=100?'Max level':Math.floor(xp)+' / '+need+' XP to the next level')+'">'+ring(f)+'<b>'+L+'</b><small>Level · '+(L>=100?'max':Math.floor(f*100)+'%')+'</small></div>'+
   '<button class="c9orb c9st" data-a="st" data-st="'+st.t+'"'+(st.t=='switch'?'':' aria-disabled="true"')+'><b>'+st.lab+'</b><small>'+esc(st.sub)+'</small></button></aside>'+
   '<main class="c9body"><div class="c9col">'+(typeof MYUI!='undefined'?MYUI.section(k):'')+
    '<section class="c9card" id="c9-ov"><h4>Passive</h4><p class="pk">'+esc(CLASS7.perk(k,L))+'</p>'+
     '<h4>Milestones</h4><ol class="c9ms">'+ms+'</ol><h4>How to play</h4><p>'+esc(tip(k))+'</p><p class="dim">Levels come from the hits and kills you make with '+esc(c.n)+' weapons.</p></section>'+
    '<section class="c9card" id="c9-ms"><h4>Master</h4><p><b>'+esc(mn||'A class master')+'</b> teaches '+esc(c.n)+' at their house in the Plaza.</p><p class="dim">'+esc(rules)+'</p>'+
     (st.t=='switch'?'<button class="c9go" data-a="st">Switch to '+esc(c.n)+'</button>':'')+'</section></div>'+
   '<section class="c9card c9wp" id="c9-wp"><h4>Weapons <small>'+ws.length+'</small></h4><div class="c9ws">'+ws.map(wcard).join('')+'</div></section></main>'+
   '<footer class="c9foot"><div class="c9logo">ROOTBOUND<em>.</em><small>← → browse · Enter switch · Esc close</small></div><div class="c9rail" role="tablist" aria-label="Classes">'+
    KEYS.map((q,n)=>'<button class="c9c'+(q==k?' on':'')+(learned(q)?' ln':'')+(cj==q?' act':'')+'" role="tab" aria-selected="'+(q==k)+'" data-k="'+q+'"><small>'+pad(n+1)+'</small><b>'+esc(C[q].n)+'</b><em>Lv '+CLASS7.lv(q)+'</em></button>').join('')+'</div></footer>'}
 function render(){if(!el)return;const rail=el.querySelector('.c9rail'),sl=rail?rail.scrollLeft:0,bd=el.querySelector('.c9body'),st=bd?bd.scrollTop:0;el.style.setProperty('--cc',C[sel].c);
  let wrap=el.querySelector('.c9wrap');if(!wrap){el.innerHTML='<canvas class="c9fx" aria-hidden="true"></canvas><div class="c9wrap"></div>';wrap=el.querySelector('.c9wrap')}wrap.innerHTML=html();
  const b2=el.querySelector('.c9body');if(b2&&render.keep)b2.scrollTop=st;render.keep=false;
  const r2=el.querySelector('.c9rail');if(r2){r2.scrollLeft=sl;const on=r2.querySelector('.on');if(on){const a=on.offsetLeft,b=a+on.offsetWidth;if(a<r2.scrollLeft||b>r2.scrollLeft+r2.clientWidth)r2.scrollLeft=a-(r2.clientWidth-on.offsetWidth)/2}}
  const t=el.querySelector('.c9title');if(t){t.classList.add('in')}try{(typeof MYUI!='undefined'?MYUI.after(el,sel):0)}catch(e){console.error('CLS9 mythic',e)}}
 function pick(k){if(!C[k]||k===sel)return;sel=k;render();try{UIS.play('tab')}catch(_){}}
 function step(d){const i=KEYS.indexOf(sel);pick(KEYS[(i+d+KEYS.length)%KEYS.length])}
 function act(){const st=status(sel);if(st.t!='switch')return false;let ok=false;try{ok=CJOB.become(sel)}catch(_){}if(ok){try{UIS.play('confirm')}catch(_){}render()}return ok}
 function build(){if(el)return el;el=document.createElement('div');el.id='cls9';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Classes');document.body.appendChild(el);
  el.addEventListener('click',e=>{const b=e.target.closest('[data-k],[data-a],[data-go]');if(b&&b.getAttribute('aria-disabled')=='true'&&b.dataset.a&&b.dataset.a.startsWith('my:'))return;if(!b)return;
   if(b.dataset.k)pick(b.dataset.k);else if(b.dataset.a=='close')close();else if(b.dataset.a=='st')act();
   else if(b.dataset.a&&b.dataset.a.startsWith('my:')){try{if(MYUI.act(b.dataset.a.slice(3),sel)){render.keep=true;render()}}catch(e){console.error('CLS9 mythic',e)}}
   else if(b.dataset.go){const s=el.querySelector('#c9-'+b.dataset.go);if(s)s.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}});
  el.addEventListener('wheel',e=>{const r=e.target.closest('.c9rail');if(r&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){r.scrollLeft+=e.deltaY;e.preventDefault()}},{passive:false});
  return el}
 const isOpen=()=>!!el&&el.style.display=='block';
 function open(k){build();try{if(UI6.on)UI6.close()}catch(_){}try{if(INV7.isOpen)INV7.close()}catch(_){}try{if(SHOP7.isOpen())SHOP7.close()}catch(_){}
  try{for(const q in K)K[q]=0}catch(_){}sel=C[k]?k:(()=>{try{return CLASS7.cur()||job()||KEYS[0]}catch(_){return KEYS[0]}})();
  el.style.display='block';render();void el.offsetWidth;el.classList.add('on');try{UIS.play('open')}catch(_){}try{(typeof MYUI!='undefined'?MYUI.start(el):0)}catch(_){}}
 function close(){if(!isOpen())return;el.classList.remove('on');try{(typeof MYUI!='undefined'?MYUI.stop():0)}catch(_){}try{UIS.play('close')}catch(_){}setTimeout(()=>{if(!el.classList.contains('on'))el.style.display='none'},220)}
 // while open the screen owns the keyboard: arrows browse, Enter switches, Esc / K close, nothing reaches the game
 addEventListener('keydown',e=>{if(!isOpen())return;const k=e.key;
  if(k=='Escape'||k=='k'||k=='K')close();else if(k=='ArrowLeft'||k=='a'||k=='A')step(-1);else if(k=='ArrowRight'||k=='d'||k=='D')step(1);else if(k=='Enter')act();else if(k=='Tab')return;
  e.preventDefault();e.stopImmediatePropagation()},true);
 addEventListener('keydown',e=>{if(isOpen()||e.repeat||e.ctrlKey||e.metaKey||e.altKey||(e.key!='k'&&e.key!='K'))return;const t=e.target;if(t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'||t.isContentEditable))return;
  try{if(!entered||dlgOpen||creatorOn)return}catch(_){}e.preventDefault();e.stopImmediatePropagation();open()},true);
 // the one CLASSES button, next to STORE
 function btn(){if(document.getElementById('bcls'))return;const hr=document.getElementById('hudR');if(!hr)return;const b=document.createElement('button');b.id='bcls';b.className='pn';b.textContent='CLASSES';b.title='Classes (K)';
  b.onclick=()=>isOpen()?close():open();const s=document.getElementById('bstore');s&&s.nextSibling?hr.insertBefore(b,s.nextSibling):hr.insertBefore(b,hr.firstChild)}
 btn();if(document.readyState!='complete')addEventListener('load',btn);setTimeout(btn,1500);
 return{open,close,isOpen,pick,step,act,status,weapons,refresh(){render.keep=true;render()},get sel(){return sel},el:()=>el}})();
