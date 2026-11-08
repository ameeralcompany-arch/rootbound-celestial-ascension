// ===== WRENCH2: the wrench as a real tool. Holding it (V, or from the hotbar) opens a small panel with three modes, each one a thing the wrench truly does:
//   Inspect   click anything: a block (what it is, how tough, who may build here), an object, a World Lock, or another player
//   Configure click a door, teleporter, chest or other object you are allowed to set up, or your World Lock
//   People    click another player for their card: trade, friend, block, report (and the owner's tools)
// What is under the mouse is outlined: gold when it can be used, red when it can not, and the panel says why. R changes mode. V or Esc puts the wrench away.
// TOOLI1: the first time you hold each tool, a card says what it does, how to use it, why it helps, its special trick and its controls. Once per tool. =====
try{(()=>{
 const MODES=[{id:'inspect',n:'Inspect',d:'Point at anything and click to see what it is.'},{id:'config',n:'Configure',d:'Click a door, chest, teleporter or your World Lock to set it up.'},{id:'people',n:'People',d:'Click another player to trade, add a friend, block or report.'}];
 let mode=0,el=null,shown=false,info=null;
 const tone=(a,b,d,t,v,dl)=>{try{SFX7.tone(a,b,d,t,v,dl)}catch(_){}};
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const active=()=>{try{return typeof wp!='undefined'&&wp=='wrench'&&entered&&!window.RB_COVER}catch(_){return false}};
 const ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.700 6.300a4.500 4.500 0 0 0-5.900 5.900L3 18l3 3 5.800-5.800a4.500 4.500 0 0 0 5.900-5.900l-2.900 2.900-2.300-2.300z"/></svg>';
 const inReach=(x,y)=>{try{return Math.hypot(x-P.x,y-(P.y+P.h/2))<REACH}catch(_){return false}};
 const buildRule=()=>{try{if(typeof cur!='undefined'&&cur=='plaza')return'Nobody can build in the Plaza';if(!meta)return'No World Lock: anyone can build here';if(isOwner())return'Your world: you can build';if(meta.pub)return meta.on+"'s world: open to everyone";return meta.on+"'s world: owner and friends only"}catch(_){return''}};
 // what is under the mouse right now, for this mode
 function target(){const c={x:mx+cam.x,y:my+cam.y},tx=Math.floor(c.x/T),ty=Math.floor(c.y/T),m=MODES[mode].id;if(tx<0||ty<0||tx>=W||ty>=H)return{ok:false,msg:'Nothing here'};
  let peer=null;try{peer=ONL10.peerAt(c)}catch(_){}
  const k=ty*W+tx,o=(()=>{try{return OBJ6.OBJ[k]||null}catch(_){return null}})(),lock=(()=>{try{return !!(meta&&tx==meta.x&&ty==meta.y&&tiles[k]==17)}catch(_){return false}})(),far=!inReach(tx*T+T/2,ty*T+T/2);
  const box={x:tx*T,y:ty*T,w:T,h:T};
  if(m=='people'){try{if(!NET7.room)return{ok:false,msg:'People are only here on a server'}}catch(_){return{ok:false,msg:'People are only here on a server'}}if(peer)return{ok:true,kind:'peer',peer,msg:'Click to open '+((peer.presence&&peer.presence.n)||'their')+' card',box:null};return{ok:false,msg:'Point at another player'}}
  if(m=='config'){if(lock){if(far)return{ok:false,msg:'Too far away',box};return{ok:true,kind:'lock',msg:'World Lock: click to open its settings',box}}if(o){const d=ODEF[o.t];if(far)return{ok:false,msg:'Too far away',box};if(!OBJ6.canConfig(myId))return{ok:false,msg:'Only the owner and builders can set this up',box};return{ok:true,kind:'obj',k,msg:(o.c&&o.c.nm||d.n)+': click to set it up',box}}return{ok:false,msg:'Point at a door, chest or World Lock',box:tiles[k]?box:null}}
  if(peer)return{ok:true,kind:'peer',peer,msg:((peer.presence&&peer.presence.n)||'Player')+': click for their card',box:null};
  if(lock)return{ok:true,kind:'lock',msg:'World Lock: click for details',box};
  if(o){const d=ODEF[o.t];return{ok:true,kind:'objinfo',k,o,msg:(o.c&&o.c.nm||d.n),box}}
  const t=tiles[k];if(t)return{ok:true,kind:'tile',t,msg:(BLK[t]||['Block'])[0],box};return{ok:false,msg:'Point at something'}}
 function use(c){const t=target(),m=MODES[mode].id;if(!t.ok){tone(200,140,.14,'triangle',.05);try{say(t.msg)}catch(_){}return}tone(620,860,.1,'triangle',.05);
  if(t.kind=='peer'){try{ONL10.card(t.peer)}catch(e){console.error(e)}return}
  if(t.kind=='lock'){try{wrench()}catch(_){}return}
  if(t.kind=='obj'){try{DOORS6.config(t.k,false)}catch(e){console.error(e)}return}
  if(t.kind=='objinfo'){const d=ODEF[t.o.t];info={h:t.o.c&&t.o.c.nm||d.n,rows:[['Kind',String(d.cat||'object')],['Who can set it up',OBJ6.canConfig(myId)?'You can':'The owner and builders']],m};paint();return}
  if(t.kind=='tile'){const b=BLK[t.t]||['Block',0,1];info={h:b[0],rows:[['Toughness',String(b[2])],['Building here',buildRule()]],m};paint();return}}
 function build(){el=document.createElement('section');el.id='wr2';el.setAttribute('aria-label','Wrench');el.innerHTML='<header><span class="wr-i">'+ICON+'</span><b>Wrench</b><button type="button" class="wr-x" aria-label="Put the wrench away (V)">✕</button></header><nav>'+MODES.map((m,i)=>'<button type="button" data-m="'+i+'">'+m.n+'</button>').join('')+'</nav><p class="wr-d"></p><div class="wr-t" role="status"></div><div class="wr-info"></div><footer><kbd>R</kbd> mode <kbd>V</kbd> put away</footer>';document.body.appendChild(el);
  el.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b){setMode(+b.dataset.m);return}if(e.target.closest('.wr-x'))putAway()});el.addEventListener('pointerdown',e=>e.stopPropagation())}
 function putAway(){try{ONL10.toggleWrench()}catch(_){}}
 function setMode(i){mode=(i+MODES.length)%MODES.length;info=null;tone(520,700,.08,'triangle',.04);paint()}
 function paint(){if(!el)return;el.querySelectorAll('[data-m]').forEach(b=>{const on=+b.dataset.m==mode;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false')});el.querySelector('.wr-d').textContent=MODES[mode].d;const inf=el.querySelector('.wr-info');inf.innerHTML=info?'<h4>'+esc(info.h)+'</h4>'+info.rows.map(r=>'<div><span>'+esc(r[0])+'</span><b>'+esc(r[1])+'</b></div>').join(''):'';inf.style.display=info?'':'none'}
 let last='';setInterval(()=>{try{const on=active();if(on&&!el)build();if(el&&on!==shown){shown=on;el.classList.toggle('on',on);if(on){info=null;tone(380,640,.12,'triangle',.04);paint()}}if(!on||!el)return;const t=target(),s=(t.ok?'1':'0')+t.msg;if(s!=last){last=s;const e=el.querySelector('.wr-t');e.textContent=t.msg;e.classList.toggle('ok',!!t.ok)}}catch(_){}},90);
 addEventListener('keydown',e=>{try{if(!active()||e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;if(dlgOpen||showInv||menuEl.style.display!='none'||(window.DLG7&&DLG7.isOpen))return;if(e.key=='r'||e.key=='R'){e.preventDefault();e.stopImmediatePropagation();setMode(mode+1)}else if(e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();putAway()}}catch(_){}},true);
 // the outline in the world, drawn with the same hook the dungeons use
 try{const dp=BOSS6.drawProj;BOSS6.drawProj=function(){const r=dp.apply(this,arguments);try{if(active()){const t=target(),now=performance.now();const col=t.ok?'rgba(244,213,154,':'rgba(255,90,100,',a=.75+Math.sin(now/180)*.2;g.save();g.lineWidth=2.5;g.strokeStyle=col+a+')';g.fillStyle=col+'.14)';if(t.box){g.beginPath();g.roundRect(t.box.x-cam.x+1,t.box.y-cam.y+1,t.box.w-2,t.box.h-2,6);g.fill();g.stroke()}else if(t.peer){const q=t.peer.presence;const px=(q.x||0)-cam.x,py=(q.y||0)-cam.y;g.beginPath();g.roundRect(px-24,py-14,48,84,10);g.fill();g.stroke()}g.restore()}}catch(_){}return r}}catch(e){console.error('WRENCH2 outline',e)}
 // removing a World Lock frees the whole world: ask first
 try{const la=lockAct;lockAct=function(p){if(p[1]=='rm'){DLG7.open({title:'Remove your World Lock?',text:'Anyone will be able to build here again.',ok:'Remove it',danger:1}).then(v=>{if(v)la(p)});return}return la(p)}}catch(_){}
 window.WRENCH2={use,target,setMode,get mode(){return MODES[mode].id},get info(){return info}};
})()}catch(e){console.error('WRENCH2',e)}
try{(()=>{
 const KEY=()=>(typeof RB_PREFIX!='undefined'?RB_PREFIX:'')+'rbtooli';
 let seen={};try{seen=JSON.parse(localStorage.getItem(KEY())||'{}')||{}}catch(_){}
 const T1={
  pip:{t:'Pip the Pocket Shovel',what:'Digs soft ground: dirt, grass, sand, wood, glass and leaves.',how:'Hold it and left-click a block in reach.',why:'One hit each, so clearing ground is quick.',spec:'Levels up the more you dig.',keys:'Left-click to dig'},
  pebble:{t:'Pebble the Rock Tapper',what:'Breaks stone, cobble, brick, marble and deepslate.',how:'Hold it and left-click stone.',why:'Cuts through rock in a single tap.',spec:'The only tool that can break Geode Rock.',keys:'Left-click to break'},
  glimmer:{t:'Glimmer the Ore Pick',what:'Mines ores, and only ores.',how:'Hold it and left-click an ore.',why:'Takes the whole vein at once.',spec:'Finds bonus ore and makes nearby ores twinkle.',keys:'Left-click an ore'},
  twiggy:{t:'Twiggy the Tree Axe',what:'Chops trees and wooden blocks.',how:'Hold it and left-click a tree.',why:'Gives extra wood from every tree.',spec:'Splits wooden blocks too.',keys:'Left-click a tree'},
  bubbles:{t:'Bubbles the Fishing Rod',what:'Catches fish from any water.',how:'Click water to cast, click when it bites, then hold to keep the fish in the green zone.',why:'Fish sell well, and some are rare.',spec:'Bait from Tackle Boxes helps.',keys:'Click to cast, hold to reel'},
  wrench:{t:'The Wrench',what:'Inspects anything, sets up objects and reaches other players.',how:'Choose a mode in its panel, then click your target.',why:'Everything you can set up, in one tool.',spec:'Outlines what you can use in gold, and what you can not in red.',keys:'V hold, R mode, Esc put away'}};
 let el=null,tm=0;
 function show(id){const q=T1[id];if(!q)return;if(el)el.remove();el=document.createElement('aside');el.id='tooli1';let pic='';try{pic=iconURL('w:'+id)}catch(_){}el.innerHTML='<img alt="" src="'+pic+'"><div><small>New tool</small><h4>'+q.t+'</h4><dl><dt>What it does</dt><dd>'+q.what+'</dd><dt>How to use it</dt><dd>'+q.how+'</dd><dt>Why it helps</dt><dd>'+q.why+'</dd><dt>Special</dt><dd>'+q.spec+'</dd><dt>Controls</dt><dd>'+q.keys+'</dd></dl></div><button type="button" aria-label="Got it">Got it</button>';document.body.appendChild(el);const done=()=>{clearTimeout(tm);if(el){el.classList.add('out');const e=el;el=null;setTimeout(()=>e.remove(),240)}};el.querySelector('button').onclick=done;tm=setTimeout(done,16000);try{SFX7.tone(560,840,.16,'triangle',.05)}catch(_){}}
 setInterval(()=>{try{if(!entered||window.RB_COVER||typeof wp=='undefined'||!T1[wp]||seen[wp]||menuEl.style.display!='none')return;if(typeof creatorOn!='undefined'&&creatorOn)return;seen[wp]=1;localStorage.setItem(KEY(),JSON.stringify(seen));show(wp)}catch(_){}},500);
 window.TOOLI1={T1,show,reset(){seen={};try{localStorage.setItem(KEY(),'{}')}catch(_){}}};
})()}catch(e){console.error('TOOLI1',e)}
