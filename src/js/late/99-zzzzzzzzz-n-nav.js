// ===== NAV16: the one menu dock. Every major feature has one button here (bottom right), with a tooltip, its key, a selected state and a
// badge when something needs you; on small windows the dock folds into one Menu button. Only one main panel is open at a time, whichever
// route opened it. The Hub shows just the tabs of the section you opened, and this file adds the pages that had no home of their own:
// Bosses, Quests, Achievements and Events. All buttons call the existing features; no game system lives here. See docs/ui-redesign.md. =====
const NAV16=(()=>{
 const el=id=>document.getElementById(id),esc=s=>UI6.esc(s),X=UI6.ext;
 const IC={
  character:'<circle class="d" cx="12" cy="8" r="4"/><path d="M4.5 20.5c1-4.2 4-6.5 7.500-6.500s6.500 2.300 7.500 6.500"/>',
  equipment:'<path class="d" d="M12 3l7.500 2.800v5.400c0 4.600-3.100 8-7.500 9.800-4.400-1.800-7.500-5.200-7.500-9.800V5.800z"/><path d="M12 8v8M8.500 11.500h7"/>',
  inventory:'<path class="d" d="M6 9.500a6 6 0 0 1 12 0V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/><path d="M9.500 4.200v-.7a2.500 2.500 0 0 1 5 0v.7M9 14h6v3.500H9z"/>',
  classes:'<path d="M20 4l-9.500 9.500M20 4h-4.500M20 4v4.500M4 4l9.500 9.500M4 4h4.500M4 4v4.500M8 13.500l2.500 2.500M5 20l3.500-3.500M16 13.500L13.500 16M19 20l-3.500-3.500"/>',
  skills:'<path class="d" d="M13.500 2.500L5 13.500h6l-1 8 8.500-11h-6z"/>',
  worlds:'<circle class="d" cx="12" cy="12" r="5.600"/><path d="M6.900 14.400C4 16.100 2.400 17.600 2.900 18.500c.8 1.400 5.600-.3 10.700-3.300s8.900-6.300 8.100-7.700c-.5-.9-2.600-.6-5.600.4"/>',
  bosses:'<path class="d" d="M5 3c0 3 .9 4.600 2.400 5.600A7.200 7.200 0 0 0 5 14c0 2.700 1.500 4.300 3.500 5v2h7v-2c2-.7 3.500-2.300 3.500-5a7.200 7.200 0 0 0-2.400-5.400C18.100 7.600 19 6 19 3c-1.400 1.600-3.300 2.800-7 2.800S6.400 4.600 5 3z"/><path d="M12 16.500v1.500"/><circle class="f" cx="9.300" cy="13.300" r="1.400"/><circle class="f" cx="14.700" cy="13.300" r="1.400"/>',
  quests:'<path d="M6 17.500V5a1.500 1.500 0 0 1 1.500-1.500H19a2 2 0 0 1 2 2V7h-3"/><path class="d" d="M18 5.500V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.500h10.500V19a2 2 0 0 0 2 2"/><path d="M9.500 8h5M9.500 11.500h5"/>',
  achievements:'<path class="d" d="M7.500 3.500h9V10a4.500 4.500 0 0 1-9 0z"/><path d="M7.500 5.500H4V7a4 4 0 0 0 3.800 4M16.500 5.500H20V7a4 4 0 0 1-3.800 4M12 14.500V18M8 20.500h8M9.500 18h5"/>',
  collection:'<path class="d" d="M12 6.500C10.200 5 7.600 4.300 3.500 4.500V19c4.100-.2 6.700.5 8.500 2 1.800-1.500 4.400-2.200 8.500-2V4.500c-4.100-.2-6.700.5-8.500 2z"/><path d="M12 6.500V21"/>',
  guide:'<circle class="d" cx="12" cy="12" r="9"/><path d="M15.800 8.200l-2.200 5.400-5.400 2.200 2.200-5.400z"/>',
  social:'<circle class="d" cx="9" cy="8.500" r="3.500"/><path d="M2.500 20c.7-3.600 3.200-5.600 6.500-5.600s5.800 2 6.500 5.600M15.500 5.300a3.500 3.500 0 0 1 0 6.400M18 14.800c2 .7 3.200 2.500 3.500 5.200"/>',
  store:'<path class="d" d="M7 4h10l4.500 5.500L12 21 2.500 9.500z"/><path d="M2.500 9.500h19M9 9.500L12 21l3-11.500M9 9.500L12 4l3 5.500"/>',
  settings:'<circle class="d" cx="12" cy="12" r="6.200"/><circle cx="12" cy="12" r="2.400"/><path d="M12 2.500v3.300M12 18.200v3.300M2.500 12h3.300M18.200 12h3.300M5.300 5.300l2.300 2.300M16.400 16.400l2.300 2.300M18.700 5.300l-2.300 2.300M7.600 16.400l-2.300 2.300"/>',
  menu:'<rect class="d" x="3.500" y="3.500" width="7" height="7" rx="1.500"/><rect x="13.500" y="3.500" width="7" height="7" rx="1.500"/><rect x="3.500" y="13.500" width="7" height="7" rx="1.500"/><rect class="d" x="13.500" y="13.500" width="7" height="7" rx="1.500"/>',
  soundon:'<path class="d" d="M4 9.500v5h3.500l5 4.500V5l-5 4.500z"/><path d="M16 9a4 4 0 0 1 0 6M18.500 6.500a8 8 0 0 1 0 11"/>',
  soundoff:'<path class="d" d="M4 9.500v5h3.500l5 4.500V5l-5 4.500z"/><path d="M16.500 9.500l5 5M21.500 9.500l-5 5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
  respawn:'<path d="M4 12a8 8 0 1 0 2.600-5.900"/><path d="M4 4.500V9h4.500"/>',
  owner:'<path class="d" d="M3.500 18.500l-1-11 5.500 4L12 4l4 7.500 5.500-4-1 11z"/><path d="M4 21.500h16"/>',
  tools:'<path class="d" d="M20.500 6.500L17 10l-3-3 3.500-3.500A5 5 0 0 0 11 10l-7 7 3 3 7-7a5 5 0 0 0 6.500-6.500z"/>'};
 const icon=n=>'<svg class="n16i" viewBox="0 0 24 24" aria-hidden="true">'+(IC[n]||'')+'</svg>';
 const solo=()=>!!(window.RB_CONFIG&&RB_CONFIG.solo);
 const menuOn=()=>{try{return menuEl.style.display!='none'&&getComputedStyle(menuEl).display!='none'}catch(_){return false}};
 // the Hub's sections: each dock button opens its own, and only its own tabs show
 const SEC={character:{t:'Character',jp:'人物',ic:'character',tabs:['profile','look','wings','plates']},skills:{t:'Skills',jp:'技能',ic:'skills',tabs:['skills']},bosses:{t:'Bosses',jp:'討伐',ic:'bosses',tabs:['bosses']},
  quests:{t:'Quests',jp:'依頼',ic:'quests',tabs:['quests']},ach:{t:'Achievements',jp:'実績',ic:'achievements',tabs:['ach']},guide:{t:'Guide',jp:'案内',ic:'guide',tabs:['toolguide','craft'],acts:[['_start','Starting guide',()=>{UI6.close();GUIDE10.open()}]]},
  social:{t:'Social',jp:'交流',ic:'social',tabs:['social']},world:{t:'Worlds',jp:'世界',ic:'worlds',acts0:[['_travel','Travel',()=>{UI6.close();openMenu('mworlds')}]],tabs:['world','events']},
  system:{t:'Settings',jp:'設定',ic:'settings',tabs:['settings','account'],acts:[['_acct','Account & sign in',()=>{UI6.close();openMenu('mworlds');try{el('wnet').scrollIntoView({block:'start'})}catch(_){}}]]},owner:{t:'Owner',jp:'管理',ic:'owner',tabs:['owner']}};
 const secOf=t=>{for(const k in SEC)if(SEC[k].tabs.includes(t))return k;return'character'};
 function view(tab){const s=SEC[secOf(tab)],name=t=>(UI6.TABS.find(x=>x[0]==t)||[t,t])[1],acts={};let tabs=[];
  for(const a of s.acts0||[]){acts[a[0]]=a[2];tabs.push([a[0],a[1]])}
  tabs=tabs.concat(s.tabs.filter(t=>UI6.TABS.some(x=>x[0]==t)).map(t=>[t,name(t)]));
  for(const a of s.acts||[]){if(a[0]=='_acct'&&solo())continue;acts[a[0]]=a[2];tabs.push([a[0],a[1]])}
  return{title:s.t,jp:s.jp,ic:icon(s.ic),tabs,acts}}
 const live=id=>{const e=el(id);return !!e&&e.classList.contains('on')};/* Classes and the Store stay on screen for a moment while they fade out; a panel on its way out no longer counts */
 // ---- the features
 const HUB=t=>({hub:t,open:()=>UI6.open(t),close:()=>UI6.close(),on:()=>UI6.on&&SEC[secOf(UI6.tab)].tabs.includes(t)});
 const F=[
  {id:'character',btn:'bhub',ic:'character',g:'Character',key:'P',n:'Character',d:'Profile, appearance, wings and nameplates',row:0,...HUB('profile')},
  {id:'equipment',btn:'beq9',ic:'equipment',g:'Character',key:'C',n:'Equipment',d:'See and change the gear you are wearing',row:0,open:()=>EQM9.show(),close:()=>EQM9.close(),on:()=>EQM9.isOpen},
  {id:'inventory',btn:'binv7',ic:'inventory',g:'Character',key:'I',n:'Inventory',d:'Your items, blocks and tools',row:0,open:()=>INV7.open(),close:()=>INV7.close(),on:()=>INV7.isOpen},
  {id:'classes',btn:'bcls',ic:'classes',g:'Character',key:'K',n:'Classes',d:'Your class, its skills and its gear',row:0,open:()=>CLS9.open(),close:()=>CLS9.close(),on:()=>live('cls9')},
  {id:'skills',btn:'bskl',ic:'skills',g:'Character',key:'U',n:'Skills',d:'Spend your skill points',row:0,...HUB('skills')},
  {id:'store',btn:'bstore',ic:'store',g:'Shop',n:'Store',d:'Buy weapons, wings, gear and more',row:0,gold:1,open:()=>STORE7.open(),close:()=>STORE7.close(),on:()=>live('store7')},
  {id:'settings',btn:'bset16',ic:'settings',g:'System',key:'O',n:'Settings',d:'Graphics, audio, controls and your save',row:0,hub:'settings',open:()=>UI6.open('settings'),close:()=>UI6.close(),on:()=>UI6.on&&secOf(UI6.tab)=='system'},
  {id:'worlds',btn:'bworlds',ic:'worlds',g:'World',n:'Worlds',d:'Travel, realms, your worlds and events',row:1,open:()=>openMenu('mworlds'),close:()=>closeMenu(),on:()=>menuOn()||UI6.on&&secOf(UI6.tab)=='world',hubAlso:1},
  {id:'bosses',btn:'bboss',ic:'bosses',g:'World',key:'N',n:'Bosses',d:'Every boss: rewards, difficulty and your progress',row:1,...HUB('bosses')},
  {id:'quests',btn:'bqm',ic:'quests',g:'World',key:'J',n:'Quests',d:'Daily challenges, your first steps and town quests',row:1,...HUB('quests')},
  {id:'ach',btn:'bach',ic:'achievements',g:'World',key:'Y',n:'Achievements',d:'Achievements and milestones',row:1,...HUB('ach')},
  {id:'collection',btn:'bbook',ic:'collection',g:'World',n:'Collection',d:'Everything you have collected, with rewards',row:1,open:()=>BOOK7.open(),close:()=>BOOK7.close(),on:()=>BOOK7.isOpen},
  {id:'guide',btn:'bguide',ic:'guide',g:'World',key:'G',n:'Guide',d:'How to use every tool, recipes and the starting guide',row:1,hub:'toolguide',open:()=>GUIDE8.open(),close:()=>UI6.close(),on:()=>UI6.on&&secOf(UI6.tab)=='guide'},
  {id:'social',btn:'bsoc',ic:'social',g:'Social',n:'Social',d:'Emotes, players here and friends',row:1,solo:1,...HUB('social')}];
 const byId=id=>F.find(f=>f.id==id);
 // one main panel at a time, whichever route opened it. The Store may sit on top of the Hub: a Hub page sends you to it and you come back.
  const PANELS=[['hub',()=>UI6.on,()=>UI6.close()],['eq',()=>EQM9.isOpen,()=>EQM9.close()],['inv',()=>INV7.isOpen,()=>INV7.close()],['cls',()=>live('cls9'),()=>CLS9.close()],['store',()=>live('store7'),()=>STORE7.close()],['book',()=>BOOK7.isOpen,()=>BOOK7.close()],['menu',menuOn,()=>closeMenu()]];
 const safe=f=>{try{return f()}catch(_){return false}};
 function closeAll(but){for(const p of PANELS)if(p[0]!=but&&safe(p[1]))try{p[2]()}catch(_){}}
 const opened={};let seq=0;
 function enforce(){const open=PANELS.filter(p=>safe(p[1]));for(const p of PANELS)if(!open.includes(p))opened[p[0]]=0;for(const p of open)if(!opened[p[0]])opened[p[0]]=++seq;
  if(open.length<2||!entered)return;const last=open.reduce((a,b)=>opened[b[0]]>opened[a[0]]?b:a);for(const p of open){if(p===last||p[0]=='hub'&&last[0]=='store')continue;try{p[2]();opened[p[0]]=0}catch(_){}}}
 function act(id){const f=byId(id);if(!f)return false;try{if(safe(f.on)){f.close();pop(false);return true}
   closeAll(f.hub?'hub':id=='equipment'?'eq':id=='inventory'?'inv':id=='classes'?'cls':id=='store'?'store':id=='collection'?'book':id=='worlds'?'menu':'');if(id=='worlds'&&UI6.on)UI6.close();const r=f.open();pop(false);sync();return r!==false}catch(e){console.error('NAV16',id,e);return false}}
 // ---- the dock
 let root,grid,mb,tip,folded=false;
 function build(){root=document.createElement('nav');root.id='nav16';root.setAttribute('aria-label','Game menu');
  mb=document.createElement('button');mb.id='nav16m';mb.type='button';mb.className='n16b n16menu';mb.innerHTML=icon('menu')+'<span class="lbl">Menu</span>';mb.setAttribute('aria-expanded','false');mb.dataset.n16tip='Menu|All game menus';mb.onclick=()=>pop(!root.classList.contains('open'));
  grid=document.createElement('div');grid.id='nav16g';root.append(mb,grid);document.body.appendChild(root);
  for(const r of[0,1]){const row=document.createElement('div');row.className='n16r';let g='';for(const f of F.filter(x=>x.row==r)){if(f.solo&&solo())continue;
    if(f.g!=g){if(g){const s=document.createElement('i');s.className='n16s';s.setAttribute('aria-hidden','true');row.appendChild(s)}g=f.g;const h=document.createElement('h5');h.textContent=g;row.appendChild(h)}
    const b=document.createElement('button');b.id=f.btn;b.type='button';b.className='n16b'+(f.gold?' gold':'');b.dataset.g=f.g;b.setAttribute('aria-label',f.n+(f.key?' ('+f.key+')':''));b.dataset.n16tip=f.n+'|'+f.d+'|'+(f.key||'');
    b.innerHTML=icon(f.ic)+'<span class="lbl">'+f.n+'</span><em class="bdg" hidden></em>';b.onclick=()=>act(f.id);row.appendChild(b);f.el=b}
   grid.appendChild(row)}
  tip=document.createElement('div');tip.id='nav16tip';tip.setAttribute('role','tooltip');document.body.appendChild(tip);
  // the map tools, attached to the minimap
  const hr=el('hudR'),mini=el('mini');if(hr&&mini){const t=document.createElement('div');t.className='maptools';for(const[id,ic,lab,d]of[['bzi','plus','Zoom in','Keys + and 0 to reset'],['bzo','minus','Zoom out','Key −'],['bmus','soundon','Music','Turn the music on or off|M']]){const b=el(id);if(!b)continue;b.removeAttribute('title');b.innerHTML=icon(ic);b.setAttribute('aria-label',lab);b.dataset.n16tip=lab+'|'+d;t.appendChild(b)}hr.innerHTML='';hr.append(t,mini)}
  // a tooltip for everything that has one
  const show=b=>{const p=String(b.dataset.n16tip).split('|');tip.innerHTML='<b>'+esc(p[0])+(p[2]?'<kbd>'+esc(p[2])+'</kbd>':'')+'</b>'+(p[1]?'<small>'+esc(p[1])+'</small>':'');tip.classList.add('on');const r=b.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;let x=r.left+r.width/2-w/2,y=r.top-h-8;if(y<6)y=r.bottom+8;x=Math.max(6,Math.min(innerWidth-w-6,x));tip.style.transform='translate('+Math.round(x)+'px,'+Math.round(y)+'px)'};
  const hide=()=>tip.classList.remove('on');
  document.addEventListener('pointerover',e=>{const b=e.target.closest&&e.target.closest('[data-n16tip]');if(b)show(b);else hide()},true);document.addEventListener('focusin',e=>{const b=e.target.closest&&e.target.closest('[data-n16tip]');if(b&&b.matches(':focus-visible'))show(b)});document.addEventListener('focusout',hide);document.addEventListener('pointerdown',hide,true);
  document.addEventListener('pointerdown',e=>{if(folded&&root.classList.contains('open')&&!root.contains(e.target))pop(false)},true);
  addEventListener('resize',layout);const au=UI6.applyUi;UI6.applyUi=function(){au.apply(this,arguments);try{for(const id of['nav16','ow15bt'])if(el(id))el(id).style.zoom=cel.opt.ui;layout()}catch(_){}};UI6.applyUi();
  worldsPanel();layout()}
 function pop(on){if(!root)return;root.classList.toggle('open',!!on);mb.setAttribute('aria-expanded',on?'true':'false')}
 // the dock shares the bottom row with the hotbar: full size, then smaller, then folded into one button
 function layout(){if(!root)return;const bar=el('bar'),z=+(cel.opt&&cel.opt.ui)||1,right=bar?bar.getBoundingClientRect().right:innerWidth/2+260,room=(innerWidth-right)/z-20;const m=room>=352?'':room>=304?'sm':'fold';root.classList.toggle('sm',m=='sm');const was=folded;folded=m=='fold';root.classList.toggle('fold',folded);if(was&&!folded)pop(false);
  // the skills sit left of the hotbar; on narrow windows they step up above it
  const sk=el('skills');if(sk&&bar){const r=sk.getBoundingClientRect(),l=bar.getBoundingClientRect().left;const up=r.width>0&&r.right>l-6;sk.classList.toggle('n16up',up);document.documentElement.classList.toggle('n16up',up)}}
 // ---- state: which button is lit, badges, hiding with the rest of the HUD
 let lastVis=null,lastSnd=null,ownerDone={};
 function sync(){if(!root)return;for(const f of F){if(!f.el)continue;const on=!!safe(f.on);if(on!==f._on){f._on=on;f.el.classList.toggle('on',on);if(on)f.el.setAttribute('aria-current','true');else f.el.removeAttribute('aria-current')}}
  const anyOn=F.some(f=>f._on);if(anyOn!==mb._on){mb._on=anyOn;mb.classList.toggle('on',anyOn)}
  const vis=safe(()=>entered)&&!window.RB_COVER;if(vis!==lastVis){lastVis=vis;root.style.display=vis?'':'none'}
  const ms=safe(()=>mute);if(ms!==lastSnd){lastSnd=ms;const b=el('bmus');if(b){b.innerHTML=icon(ms?'soundoff':'soundon');b.classList.toggle('off',!!ms)}}
  // the row under the character card, right below the card whatever its height
  const row=el('ow15bt'),hl=el('hudL');if(row&&hl&&hl.offsetWidth){const z=+(cel.opt&&cel.opt.ui)||1,y=Math.round(hl.getBoundingClientRect().bottom/z+6);if(row._y!==y){row._y=y;row.style.top=y+'px'}const t=el('btools');if(t&&t.parentNode!==row)row.appendChild(t);for(const[id,ic,tp,txt]of[['brsp','respawn','Respawn|Back to the spawn point. Keeps everything you have',1],['bown15','owner','Owner|Owner controls. Press / for commands',0],['btools','tools','Creator tools|Owner only',0]]){const b=el(id);if(!b||ownerDone[id]===b)continue;ownerDone[id]=b;const lab=b.textContent;b.removeAttribute('title');b.dataset.n16tip=tp;b.setAttribute('aria-label',tp.split('|')[0]);b.innerHTML=icon(ic)+(txt?'<span>'+esc(lab)+'</span>':'')}}}
 function badges(){if(!root)return;const set=(id,n)=>{const f=byId(id),b=f&&f.el&&f.el.querySelector('.bdg');if(!b)return;const t=n>0?String(n>99?'99+':n):'';if(b.textContent!==t){b.textContent=t;b.hidden=!t}};
  set('skills',safe(()=>pst.pts)|0);set('quests',safe(()=>{DAILY6.roll();return dly.tasks.filter(t=>!t.claimed&&DAILY6.prog(t)>=t.need).length})|0);
  const bb=el('bmus');if(bb)bb.setAttribute('aria-pressed',safe(()=>mute)?'true':'false')}
 // ---- the Worlds panel: the Travel / This world / Events bar
 function worldsPanel(){const w=el('mworlds');if(!w||el('wtabs16'))return;const h=document.createElement('div');h.id='wtabs16';h.innerHTML='<div class="whead16">'+icon('worlds')+'<b>Worlds</b><i aria-hidden="true">世界</i></div><div class="wnav16"><button type="button" class="on">Travel</button><button type="button" data-w="world">This world</button><button type="button" data-w="events">Events</button></div>';w.insertBefore(h,w.firstChild);
  h.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{const t=b.dataset.w;try{menuEl.style.display='none'}catch(_){}UI6.open(t)})}
 // ---- pages
 const fmtN=n=>Number(n||0).toLocaleString();
 const bar=(v,m)=>'<div class="bar"><i style="width:'+Math.min(100,m>0?v/m*100:0)+'%"></i></div>';
 // bosses: the art is the boss's own drawing, painted once and kept
 const PORT={};
 function portrait(b){if(PORT[b.id])return PORT[b.id];const S=168,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),gr=x.createRadialGradient(S/2,S*.45,4,S/2,S/2,S*.72);gr.addColorStop(0,b.c+'70');gr.addColorStop(1,'rgba(10,10,28,0)');x.fillStyle=gr;x.fillRect(0,0,S,S);
  if(b.wb){try{const k=S*.8/Math.max(b.aw,b.ah);x.save();x.translate(S/2,S*.92);x.scale(k,k);WBOSS13.ART[b.id](x,{w:b.aw,h:b.ah,t:1,fl:0,ph:1,eye:1,at:0,lx:0,ly:0,cine:1});x.restore()}catch(e){console.error('NAV16 art',e)}return PORT[b.id]=c}
  const og=g,cx=cam.x,cy=cam.y;try{const m={k:'boss_'+b.id,x:0,y:0,w:b.w,h:b.h,vx:0,vy:0,hp:1,mhp:1,dmg:0,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:1,g:true,wall:0,boss:1,bs:'idle',bt:2,at:0,phase:1,born:-1e7},k=S*.76/Math.max(b.w,b.h);g=x;cam.x=0;cam.y=0;x.save();x.translate(S/2,S*.9);x.scale(k,k);x.translate(0,-b.h);drawMob(m,4000);x.restore()}catch(e){console.error('NAV16 art',e)}finally{g=og;cam.x=cx;cam.y=cy}
  return PORT[b.id]=c}
 const DIFF=['Easy','Moderate','Hard','Very hard','Deadly'],REALM=['Base world','Inferno','Galaxy','Abyssal Sea','Crystal Realm'];
 function bossCard(b,stars,dp){const k=bossK[b.id]|0,rel=!!relics[b.relic],d=MK['boss_'+b.id]||b,hp=d.hp||b.hp,dmg=d.dmg||b.dmg;let why='',btn='';
  if(b.wb){const here=safe(()=>WBOSS13.need(cur)&&WORD9.bossFor?true:false);const can=safe(()=>WBOSS13.need(cur)&&((WBOSS13.BY[b.id]||{}).sg===realmIndex()));why=k?'Beaten. Find this realm\'s hidden word in another world to face him again.':'Guards the hidden word in the '+REALM[b.sg||0];if(b.she)why=why.replace(' him ',' her ');if(can)btn='<button class="hbtn" data-wb="1">Open the Word Gate</button>'}
  else{const pl=cur=='plaza',low=dp<b.depth;why=pl?'Bosses do not appear in the Plaza':low?'Dig to depth '+b.depth+' to wake it (you are at '+dp+')':'Ready to challenge';btn='<button class="hbtn pri" data-b="'+b.id+'"'+(pl||low?' disabled':'')+'>Challenge</button>'}
  return'<article class="bs16'+(k?' won':'')+'" style="--bc:'+b.c+'" data-boss="'+b.id+'"><div class="pic" data-p="'+b.id+'"></div><div class="tx"><header><h4>'+esc(b.n)+'</h4><span class="diff" title="'+DIFF[stars-1]+'" aria-label="Difficulty: '+DIFF[stars-1]+'">'+'★'.repeat(stars)+'<i>'+'★'.repeat(5-stars)+'</i></span></header><p>'+esc(b.desc||'')+'</p><dl><div><dt>Health</dt><dd>'+fmtN(hp)+'</dd></div><div><dt>Hit</dt><dd>'+fmtN(dmg)+'</dd></div><div><dt>Gems</dt><dd>'+fmtN(b.gems)+'</dd></div><div><dt>XP</dt><dd>'+fmtN(b.xp)+'</dd></div>'+(b.wb?'<div><dt>Suggested</dt><dd>Lv '+b.lv+'</dd></div>':'<div><dt>Depth</dt><dd>'+b.depth+'</dd></div>')+'<div><dt>Defeated</dt><dd>'+k+'</dd></div></dl><div class="relic'+(rel?' on':'')+'"><b>'+(rel?'✓ ':'')+'Relic: '+esc(b.rn)+'</b><small>'+esc(b.rd)+(rel?'':' · won the first time you beat it')+'</small></div><footer><small>'+esc(why)+'</small>'+btn+'</footer></div></article>'}
 const realmIndex=()=>{const m=String(cur||'').match(/-(inf|gal|sea|cry)$/);return m?['inf','gal','sea','cry'].indexOf(m[1])+1:0};
 X.bosses=function(){const b=UI6.body,dp=Math.max(0,Math.round(safe(()=>depthAt(P.x,P.y+P.h/2))||0)),D=BOSSES.filter(q=>!q.wb),W2=BOSSES.filter(q=>q.wb),hpOf=q=>(MK['boss_'+q.id]||q).hp||q.hp,sorted=[...BOSSES].sort((a,c)=>hpOf(a)-hpOf(c)),stars=q=>1+Math.floor(sorted.indexOf(q)*5/sorted.length),dd=D.filter(q=>bossK[q.id]|0).length,wd=W2.filter(q=>bossK[q.id]|0).length,rl=BOSSES.filter(q=>relics[q.relic]).length;
  b.innerHTML='<h3>Bosses</h3><div class="sum16"><div><small>Depth bosses beaten</small><b>'+dd+' / '+D.length+'</b>'+bar(dd,D.length)+'</div><div><small>World bosses beaten</small><b>'+wd+' / '+W2.length+'</b>'+bar(wd,W2.length)+'</div><div><small>Relics won</small><b>'+rl+' / '+BOSSES.length+'</b>'+bar(rl,BOSSES.length)+'</div></div><h4>Depth bosses</h4><p class="dim">Dig deep enough, then call them out from here.</p><div class="bl16">'+D.map(q=>bossCard(q,stars(q),dp)).join('')+'</div>'+(W2.length?'<h4>World bosses</h4><p class="dim">They hold the letters of a world\'s hidden word. Find every letter to wake them.</p><div class="bl16">'+W2.map(q=>bossCard(q,stars(q),dp)).join('')+'</div>':'');
  b.querySelectorAll('.pic[data-p]').forEach(p=>{const q=BOSSES.find(x=>x.id==p.dataset.p);if(q)p.appendChild(portrait(q))});
  b.querySelectorAll('button[data-b]').forEach(x=>x.onclick=()=>{if(BOSS6.spawn(x.dataset.b))UI6.close()});b.querySelectorAll('button[data-wb]').forEach(x=>x.onclick=()=>{UI6.close();try{WORD9.open()}catch(_){}})};
 X.quests=function(){const b=UI6.body;DAILY6.roll();const nd=QUEST.filter(q=>done[q[2]]).length;
  let h='<h3>Quests</h3><h4>Daily challenges</h4><div class="hrow"><div class="hchip on">Streak: '+dly.streak+' day'+(dly.streak==1?'':'s')+'</div><small class="dim">+10% rewards per streak day (max +50%). Resets at local midnight.</small></div><div class="ql16">';
  dly.tasks.forEach((t,i)=>{const p=Math.min(t.need,DAILY6.prog(t)),ok=p>=t.need;h+='<div class="q16'+(t.claimed?' done':'')+'"><div><b>'+DAILY6.label(t)+'</b>'+bar(p,t.need)+'</div><span class="n">'+p+' / '+t.need+'</span><button class="hbtn'+(ok&&!t.claimed?' pri':'')+'" data-d="'+i+'"'+(t.claimed||!ok?' disabled':'')+'>'+(t.claimed?'Claimed':'Claim '+t.g+' gems')+'</button></div>'});
  h+='</div><h4>Getting started <small class="dim">'+nd+' / '+QUEST.length+'</small></h4><div class="ql16">'+QUEST.map(q=>'<div class="q16'+(done[q[2]]?' done':'')+'"><div><b>'+(done[q[2]]?'✓ ':'')+esc(q[0])+'</b><small>'+esc(q[1])+'</small></div><span class="n">'+q[3]+' gems</span></div>').join('')+'</div>';
  h+='<h4>Town quests <small class="dim">claim from Elder Oak in the Plaza</small></h4><div class="ql16">'+qs.map(q=>'<div class="q16"><div><b>'+esc(q.n)+'</b><small>'+esc(q.d)+' · '+q.g+' gems, '+q.x+' XP</small>'+bar(q.p,q.need)+'</div><span class="n">'+q.p+' / '+q.need+'</span></div>').join('')+'</div>';
  b.innerHTML=h;b.querySelectorAll('button[data-d]').forEach(x=>x.onclick=()=>{DAILY6.claim(+x.dataset.d);UI6.render()})};
 X.ach=function(){const b=UI6.body,n=ACH.filter((a,i)=>achD[i]).length;
  let h='<h3>Achievements</h3><div class="sum16"><div><small>Achievements earned</small><b>'+n+' / '+ACH.length+'</b>'+bar(n,ACH.length)+'</div></div><h4>Achievements</h4><p class="dim">Rewards are paid automatically.</p><div class="ql16 two">';
  ACH.forEach((a,i)=>{const v=Math.min(a[3],a[2]=='level'?lvl:stats[a[2]]|0);h+='<div class="q16'+(achD[i]?' done':'')+'"><div><b>'+(achD[i]?'✓ ':'')+esc(a[0])+'</b><small>'+esc(a[1])+' · '+a[4]+' gems</small>'+bar(v,a[3])+'</div><span class="n">'+v+' / '+a[3]+'</span></div>'});
  h+='</div><h4>Milestones</h4><p class="dim">Everything you do adds up. Each step pays gems and XP.</p><div class="ql16 two">';
  try{for(const k in MILE10.KINDS){const[nm,L]=MILE10.KINDS[k],c=MILE10.count(k),r=MILE10.rungAt(L,c),t=MILE10.target(L,r),p0=r?MILE10.target(L,r-1):0;h+='<div class="q16"><div><b>'+esc(nm)+'</b><small>Step '+r+' · next at '+fmtN(t)+'</small>'+bar(c-p0,t-p0)+'</div><span class="n">'+fmtN(c)+'</span></div>'}}catch(_){}
  b.innerHTML=h+'</div>'};
 // events: the world's own shared clock decides them, so what is listed here is what will really happen
 const EVD={meteor:'Dodge the impact rings and loot the gems the meteors leave. They hurt monsters too.',rift:'A rift sends monsters. Defeat them all to close it for a reward.',spirit:'Talk to the spirit (E) for a full heal, gems and seeds.',trader:'A merchant sells a bundle of blocks for your gems.'};
 const clock=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
 X.events=function(){const b=UI6.body;let h='<h3>Events</h3>';if(cur=='plaza'||!WEV7){b.innerHTML=h+'<p class="dim">Events happen out in the worlds, never in the Plaza. Travel to a world to see what is coming there.</p><h4>What can happen</h4><div class="ql16">'+Object.keys(EVD).map(k=>'<div class="q16"><div><b>'+esc(WEV7.names[k])+'</b><small>'+esc(EVD[k])+'</small></div></div>').join('')+'</div>';return}
  const now=Date.now(),n=Math.floor(now/WEV7.SLOT),L=[];for(let k=n-1;k<=n+5;k++){const e=WEV7.eventFor(k);if(e&&e.t1>now)L.push(e)}L.sort((a,c)=>a.t0-c.t0);const lv=L.find(e=>e.t0<=now);
  h+='<p class="dim">Everyone in this world sees the same events at the same time.</p><h4>In '+esc(cur)+'</h4><div class="ql16">'+(L.length?L.slice(0,5).map(e=>'<div class="q16'+(e===lv?' live':'')+'"><div><b>'+esc(WEV7.names[e.kind])+'</b><small>'+esc(EVD[e.kind])+'</small></div><span class="n" data-t0="'+e.t0+'" data-t1="'+e.t1+'"></span></div>').join(''):'<p class="dim">Nothing is planned here for now.</p>')+'</div>';b.innerHTML=h;tickEvents()};
 function tickEvents(){if(!UI6.on||UI6.tab!='events')return;const now=Date.now();UI6.body.querySelectorAll('[data-t0]').forEach(s=>{const a=+s.dataset.t0,z=+s.dataset.t1,t=now>=z?'Ended':now>=a?'Now · '+clock(z-now)+' left':'In '+clock(a-now);if(s.textContent!==t)s.textContent=t})}
 // ---- keys. The old keys keep working; P U N Y O are new. These also let you jump between panels while the Hub has the keyboard.
 const KEYS={p:'character',u:'skills',n:'bosses',y:'ach',o:'settings'};
 addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'||t.tagName=='SELECT'||t.isContentEditable))return;const k=String(e.key).toLowerCase();
  if(k=='escape'){if(folded&&root&&root.classList.contains('open')){pop(false);e.stopImmediatePropagation();return}
   const pc=el('pcard10');if(pc&&pc.style.display!='none'&&getComputedStyle(pc).display!='none'){pc.style.display='none';e.stopImmediatePropagation();return}
   if(safe(()=>dlgOpen)&&!UI6.on){try{closeDlg()}catch(_){}e.stopImmediatePropagation();return}return}
  if(!safe(()=>entered)||window.RB_COVER||safe(()=>dlgOpen)||safe(()=>DLG7.isOpen)||safe(()=>CINE7.playing)||safe(()=>creatorOn))return;
  let id=KEYS[k];if(!id&&UI6.on){if(k=='j')id='quests';else if(k=='i'||k=='tab')id='inventory';else if(k=='g')id='guide'}if(!id)return;
  e.preventDefault();e.stopImmediatePropagation();act(id)},true);
 // ---- start
 function start(){build();sync();badges();setInterval(()=>{if(document.hidden)return;try{enforce();sync();tickEvents()}catch(er){if(!start.e){start.e=1;console.error('NAV16',er)}}},150);setInterval(()=>{if(document.hidden)return;try{badges();layout()}catch(_){}},1000)}
 setTimeout(start,0);
 return{act,view,icon,sync,layout,F,SEC,closeAll,get folded(){return folded},pop}})();
