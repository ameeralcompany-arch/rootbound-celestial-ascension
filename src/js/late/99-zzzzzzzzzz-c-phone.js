// ===== ROOTLINK: your adventure device. M opens it (Shift+M still mutes the music); Esc, M or a click outside puts it away.
// A glass phone slides up beside the game, its screen lights, its apps settle into place. The home screen shows who you are (portrait, name, level,
// class, world, Combat Power, gems), what needs you (the dock's badges), today's three challenges and a way into the dungeons. Every app opens a real
// screen that already exists (NAV16's features, the dungeon page, the trailer); the phone holds no game state of its own.
// Cost: the markup is built once, on first open; while closed nothing runs. While open, one timer refreshes the clock every 10 s. =====
try{(()=>{
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const ic=n=>{try{return NAV16.icon(n)}catch(_){return''}};
 const EXTRA={dungeons:'<path class="d" d="M4 21V10l8-6 8 6v11z"/><path d="M9.500 21v-5.500a2.500 2.500 0 0 1 5 0V21"/>',cinema:'<rect class="d" x="3" y="5" width="18" height="14" rx="2.500"/><path d="M10 9.200v5.600l4.800-2.800z"/>'};
 const xic=n=>'<svg class="n16i" viewBox="0 0 24 24" aria-hidden="true">'+EXTRA[n]+'</svg>';
 // the apps: id, label, icon, accent, how it opens. nav: a NAV16 feature id
 const APPS=[
  {id:'character',n:'Character',nav:'character',c:'#9db4ff'},{id:'inventory',n:'Inventory',nav:'inventory',c:'#ffcf7a'},{id:'equipment',n:'Equipment',nav:'equipment',c:'#8fe3c1'},{id:'skills',n:'Skills',nav:'skills',c:'#ffe27a'},
  {id:'classes',n:'Classes',nav:'classes',c:'#ff9ab8'},{id:'quests',n:'Quests',nav:'quests',c:'#b8a4ff'},{id:'dungeons',n:'Dungeons',c:'#ff8a6a',x:'dungeons',open:()=>DG.page.open()},{id:'worlds',n:'Worlds',nav:'worlds',c:'#7ad8ff'},
  {id:'bosses',n:'Codex',nav:'bosses',c:'#ff6a7a',ico:'bosses'},{id:'social',n:'Friends',nav:'social',c:'#9affc8'},{id:'store',n:'Store',nav:'store',c:'#ffd27a'},{id:'collection',n:'Collection',nav:'collection',c:'#d0a4ff'},
  {id:'ach',n:'Achievements',nav:'ach',c:'#ffe9a8',ico:'achievements'},{id:'guide',n:'Guide',nav:'guide',c:'#a4e0ff'},{id:'cinema',n:'Trailer',c:'#f4c8ff',x:'cinema',open:()=>INTRO60.trailer()},{id:'settings',n:'Settings',nav:'settings',c:'#c8cede'}];
 let root=null,dev=null,on=false,tmr=0,closing=0,lastFocus=null;
 const navF=id=>{try{return NAV16.F.find(f=>f.id==id)}catch(_){return null}};
 const usable=a=>{if(a.nav){const f=navF(a.nav);if(!f)return false;try{if(f.solo&&typeof DG!='undefined'&&DG.run)return true}catch(_){}return true}if(a.id=='dungeons')return !!(window.DG&&DG.page);if(a.id=='cinema')return typeof INTRO60!='undefined'&&!!INTRO60.trailer;return true};
 const badge=a=>{if(!a.nav)return'';const f=navF(a.nav),b=f&&f.el&&f.el.querySelector('.bdg');return b&&!b.hidden?b.textContent:''};
 const tone=(k)=>{try{if(typeof OPT!='undefined'&&OPT.uim)return;if(k=='open'){snd(660,.09,'sine',.035);setTimeout(()=>snd(990,.12,'sine',.03),70)}else if(k=='close'){snd(740,.07,'sine',.03);setTimeout(()=>snd(520,.09,'sine',.025),55)}else snd(880,.04,'triangle',.03)}catch(_){}};

 function build(){
  root=document.createElement('div');root.id='rlk';root.setAttribute('aria-hidden','true');
  root.innerHTML='<div class="rlk-scrim"></div><div class="rlk-dev" role="dialog" aria-modal="true" aria-label="Rootlink"><div class="rlk-scr"><div class="rlk-sheen"></div>'
   +'<div class="rlk-bar"><b class="rlk-time">--:--</b><i class="rlk-isle"><span>ROOTLINK</span></i><span class="rlk-net"></span></div>'
   +'<div class="rlk-body">'
   +'<section class="rlk-me"><canvas width="128" height="128" class="rlk-av"></canvas><div class="rlk-id"><b class="rlk-name"></b><span class="rlk-lv"></span><span class="rlk-world"></span></div>'
   +'<div class="rlk-stats"><div><small>Combat Power</small><b class="rlk-cp">0</b></div><div><small>Gems</small><b class="rlk-gems">0</b></div></div></section>'
   +'<section class="rlk-note" hidden></section>'
   +'<section class="rlk-day"><h3>Today<span class="rlk-streak"></span></h3><div class="rlk-tasks"></div></section>'
   +'<button type="button" class="rlk-feat" data-app="dungeons"><span class="rlk-feat-k">Dungeons</span><b>Ten guardians wait below</b><small>Alone or with a friend · open the dungeon page</small></button>'
   +'<section class="rlk-apps" role="list">'+APPS.map((a,i)=>'<button type="button" role="listitem" class="rlk-app" data-app="'+a.id+'" style="--c:'+a.c+';--i:'+i+'"><span class="rlk-ico">'+(a.x?xic(a.x):ic(a.ico||a.id))+'<em class="rlk-bdg" hidden></em></span><span class="rlk-lab">'+esc(a.n)+'</span></button>').join('')+'</section>'
   +'</div><div class="rlk-home" aria-hidden="true"></div></div></div>';
  document.body.appendChild(root);dev=root.querySelector('.rlk-dev');
  root.querySelector('.rlk-scrim').addEventListener('pointerdown',()=>close());
  root.addEventListener('click',e=>{const b=e.target.closest('[data-app]');if(b)launch(b.dataset.app)});
  dev.addEventListener('keydown',e=>{const k=e.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(k)){const L=[...root.querySelectorAll('.rlk-app:not([disabled])')],i=L.indexOf(document.activeElement);if(i<0){L[0]&&L[0].focus();e.preventDefault();return}
   const n=k=='ArrowLeft'?i-1:k=='ArrowRight'?i+1:k=='ArrowUp'?i-4:i+4;if(L[n])L[n].focus();e.preventDefault()}});
 }
 const clock=()=>{if(!root)return;const d=new Date();root.querySelector('.rlk-time').textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  let st='',rt=0;try{st=NET7.state;rt=NET7.rtt|0}catch(_){}const n=root.querySelector('.rlk-net');n.dataset.k=st=='online'?'ok':st=='reconnecting'||st=='connecting'?'re':'off';n.textContent=st=='online'?(rt?rt+' ms':'Online'):st=='reconnecting'||st=='connecting'?'…':'Offline'};
 function fill(){
  const q=s=>root.querySelector(s);
  // who you are
  let cls='',cl=0,cc='#9db4ff';try{const k=CLASS7.cur(),C=CLASS7.C[k];if(C){cls=C.n;cl=CLASS7.lv(k)|0;cc=C.c}}catch(_){}
  q('.rlk-name').textContent=(typeof myName!='undefined'&&myName)||'Traveler';
  q('.rlk-lv').innerHTML='Level '+esc(typeof lvl!='undefined'?lvl:1)+(cls?' · <i style="color:'+esc(cc)+'">'+esc(cls)+'</i> '+esc(cl):'');
  let w='';try{w=(typeof cur!='undefined'&&cur)?(cur=='plaza'?'The Plaza':(window.DG&&DG.run?(DG.run.d&&DG.run.d.n)||'A dungeon':cur)):''}catch(_){}
  q('.rlk-world').textContent=w?'In '+w:'';
  let cp=0;try{cp=Math.round(RPG.cp())}catch(_){}q('.rlk-cp').textContent=cp.toLocaleString();q('.rlk-gems').textContent=(typeof gems!='undefined'?Math.floor(gems):0).toLocaleString();
  const av=q('.rlk-av'),x=av.getContext('2d');x.clearRect(0,0,128,128);try{const o=g;g=x;try{x.save();const hz=wear.hat&&WEAR[wear.hat]?1:0;x.translate(64,232-hz*8);x.scale(3.3-hz*.4,3.3-hz*.4);AC6.headFull(x,AC6.info(look,null,true),-50,0,0,wear);x.restore()}finally{g=o}}catch(_){}
  // what needs you: the dock's own badges, in words
  const notes=[];for(const a of APPS){const b=badge(a);if(b)notes.push('<button type="button" data-app="'+a.id+'" style="--c:'+a.c+'"><b>'+esc(b)+'</b> '+esc(a.n)+'</button>')}
  const N=q('.rlk-note');N.hidden=!notes.length;N.innerHTML=notes.length?'<h3>Needs you</h3><div>'+notes.join('')+'</div>':'';
  // today's challenges, straight from DAILY6
  let rows='',streak=0;try{streak=dly.streak|0;for(const t of (dly.tasks||[])){const p=Math.min(t.need,DAILY6.prog(t)|0),k=t.need?p/t.need:0;rows+='<div class="rlk-task'+(t.claimed?' done':p>=t.need?' ready':'')+'"><span>'+esc(DAILY6.label(t))+'</span><i><u style="width:'+Math.round(k*100)+'%"></u></i><small>'+(t.claimed?'Claimed':p>=t.need?'Ready to claim':p+' / '+t.need)+'</small></div>'}}catch(_){}
  q('.rlk-tasks').innerHTML=rows||'<div class="rlk-task"><span>New challenges arrive each day.</span></div>';q('.rlk-streak').textContent=streak>0?streak+' day streak':'';
  q('.rlk-day').dataset.app='quests';
  for(const b of root.querySelectorAll('.rlk-app')){const a=APPS.find(z=>z.id==b.dataset.app),u=usable(a);b.disabled=!u;const n=badge(a),e=b.querySelector('.rlk-bdg');e.hidden=!n;e.textContent=n}
  clock();
 }
 // can it open now? Not over a film, a cinematic, the character creator, or while typing
 const blocked=()=>{try{if(typeof INTRO60!='undefined'&&INTRO60.playing)return true;if(typeof CINE7!='undefined'&&CINE7.playing)return true;if(window.DG&&DG.cine&&DG.cine.on)return true;if(window.DG&&DG.boss&&DG.boss.inIntro)return true;if(typeof creatorOn!='undefined'&&creatorOn)return true;if(typeof entered!='undefined'&&!entered)return true}catch(_){}return false};
 function open(){if(on||blocked())return false;if(!root)build();clearTimeout(closing);try{NAV16.closeAll()}catch(_){}lastFocus=document.activeElement;fill();on=true;root.setAttribute('aria-hidden','false');root.classList.remove('out');void root.offsetWidth;root.classList.add('on');
  tone('open');tmr=setInterval(clock,10000);setTimeout(()=>{if(on){const f=root.querySelector('.rlk-app:not([disabled])');f&&f.focus({preventScroll:true})}},260);return true}
 function close(then){if(!on)return false;on=false;clearInterval(tmr);root.classList.remove('on');root.classList.add('out');root.setAttribute('aria-hidden','true');if(!then)tone('close');
  closing=setTimeout(()=>{root.classList.remove('out');if(then)try{then()}catch(e){console.error('ROOTLINK app',e)}else try{lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true})}catch(_){}},then?170:240);return true}
 function launch(id){const a=APPS.find(z=>z.id==id);if(!a||!usable(a))return;tone('tap');const b=root.querySelector('.rlk-app[data-app="'+id+'"]');if(b){b.classList.add('press');setTimeout(()=>b.classList.remove('press'),200)}
  close(()=>{if(a.open)return a.open();const f=navF(a.nav);let up=false;try{up=!!(f&&f.on&&f.on())}catch(_){}if(!up)try{NAV16.act(a.nav)}catch(e){console.error('ROOTLINK',e)}})}
 // M: open or put away. Shift+M is left to the game (mute). Typing in a field never opens it
 addEventListener('keydown',e=>{if(e.key!='m'&&e.key!='M')return;if(e.shiftKey||e.ctrlKey||e.altKey||e.metaKey||e.repeat)return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
  if(on){close();e.preventDefault();e.stopImmediatePropagation();return}if(open()){e.preventDefault();e.stopImmediatePropagation()}},true);
 addEventListener('keydown',e=>{if(on&&e.key=='Escape'){close();e.preventDefault();e.stopImmediatePropagation()}},true);
 window.ROOTLINK={open,close,toggle:()=>on?close():open(),get on(){return on},APPS};
})()}catch(e){console.error('ROOTLINK',e)}
