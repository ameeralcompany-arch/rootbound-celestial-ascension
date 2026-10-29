// ===== V7 Showcase: editorial character gallery home screen =====
// v9: the old preset gallery characters (Yuzuki, Kaede, Ren, Sora, Mio) were removed - they showed outdated weapon art. Only your own
// character is in the gallery now; saves that still hold preset slots are cleaned below (CHARMIG9) without touching your look or progress.
const CHARS=[
 {id:'you',first:null,last:null,lv:1,stars:3,lore:'Your own character. Everything you change in the appearance editor is saved here, and your level, wings and nameplate follow you into every world.'}
];
const SHOW7=(()=>{
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 let el,cv,cx,open=false,cur=0,raf=0,t0=0,lastDraw=0,busy=0,tiles={},dust=[],gpage=0;
 const NAV=[['home','Home'],['chars','Characters'],['inv','Inventory'],['store','Store'],['worlds','Worlds'],['coll','Collection'],['prof','Profile'],['set','Settings']];
 const reduce=()=>{try{return cel.opt.reduce||matchMedia('(prefers-reduced-motion: reduce)').matches}catch(_){return false}};
 // ---- data
 function apOf(i){const sc=X6.sc;if(i==0)return sc.looks[0]||sanAp(cel.ap);return sc.looks[i]||sanAp(CHARS[i].ap)}
 const unlocked=i=>lvl>=CHARS[i].lv;
 function nameOf(i){if(i==0){const n=String(myName||'Hero');return[n,(npName?npName(npTier(lvl)):'Wanderer').toUpperCase()]}const c=CHARS[i];return[c.first,c.last]}
 const titleOf=i=>i==0?(npName?npName(npTier(lvl)):'Wanderer'):CHARS[i].title;
 function grey(L){const g=h=>{const n=parseInt(h.slice(1),16),v=Math.round(((n>>16)*.3+(n>>8&255)*.59+(n&255)*.11)*.5+120);const x=('0'+Math.min(255,v).toString(16)).slice(-2);return'#'+x+x+x};return Object.assign({},L,{skin:g(L.skin),hair:g(L.hair),eye:g(L.eye),out:g(L.out),trim:g(L.trim)})}
 // ---- DOM
 function build(){if(el)return;el=document.createElement('div');el.id='show';el.className='ed';el.setAttribute('role','region');el.setAttribute('aria-label','Home');
  el.innerHTML='<div class="wm"><svg viewBox="0 0 200 230" aria-hidden="true"><path d="M100 4 L190 55 L190 175 L100 226 L10 175 L10 55 Z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M100 30 L168 69 L168 161 L100 200 L32 161 L32 69 Z" fill="none" stroke="currentColor" stroke-width=".6"/><path d="M100 4 V226 M10 55 L190 175 M190 55 L10 175" stroke="currentColor" stroke-width=".4"/></svg></div>'
   +'<header class="top"><div class="logo"><b>ROOTBOUND</b><i>CELESTIAL ASCENSION</i></div><nav aria-label="Main">'+NAV.map(([k,n])=>'<a href="#" data-n="'+k+'" role="button">'+n+'<u></u></a>').join('')+'</nav></header>'
   +'<section class="stage"><canvas id="showCv" aria-label="Character portrait"></canvas><div class="idx"><div class="num"><b id="sIdx">01</b><i id="sTot">/06</i></div><span class="ln"></span><div class="arrows"><button data-d="-1" aria-label="Previous character">‹</button><button data-d="1" aria-label="Next character">›</button></div></div></section>'
   +'<section class="info"><div id="sInfo"></div></section>'
   +'<footer>© Rootbound · original artwork, code and sound · all rights reserved</footer>';
  document.body.appendChild(el);cv=el.querySelector('#showCv');cx=cv.getContext('2d');
  el.addEventListener('click',onClick);
  addEventListener('keydown',onKey,true);
  addEventListener('resize',()=>{if(open)fit()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(open)loop()});
  for(let i=0;i<24;i++)dust.push({x:Math.random(),y:Math.random(),r:.6+Math.random()*1.6,s:.01+Math.random()*.03,p:Math.random()*6})}
 function fit(){const r=cv.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);const w=Math.max(200,r.width*d|0),h=Math.max(200,r.height*d|0);if(cv.width!=w||cv.height!=h){cv.width=w;cv.height=h}}
 function info(){const i=cur,[a,b]=nameOf(i),L=unlocked(i),act=X6.sc.act==i,c=CHARS[i],tier=npName?npName(npTier(lvl)):'';
  const stars='★'.repeat(c.stars)+'<span style="opacity:.25">'+'★'.repeat(5-c.stars)+'</span>';
  const xpp=Math.max(0,Math.min(100,xp/xpNeed(lvl)*100));
  let h='<div class="dots"><i></i><i></i><i></i></div><div class="rank"><span>#'+(i+1)+' Collection</span><span class="stars" aria-label="'+c.stars+' stars">'+stars+'</span></div>'
   +'<h1 class="name"><span>'+esc(a)+'</span><span>'+esc(b)+'</span></h1>'
   +'<div class="meta">'+(i?'<em>'+esc(c.title)+'</em> · ':'')+(L?'Level '+lvl+' · '+esc(tier):'<b>Locked</b> · reach level '+c.lv)+'</div>'+(i==0&&typeof GENDER7!='undefined'?GENDER7.html(apOf(0).gd):'')
   +'<div class="acts"><button class="btn" data-a="play"'+(L?'':' disabled')+'>▶ Play</button><button class="btn ghost" data-a="select"'+(L&&!act?'':' disabled')+'>'+(act?'✓ Active':'Select')+'</button><button class="heart'+(X6.sc.fav[i]?' on':'')+'" data-a="fav" aria-pressed="'+(X6.sc.fav[i]?'true':'false')+'" title="'+(X6.sc.fav[i]?'Remove from favorites':'Add to favorites')+'">'+(X6.sc.fav[i]?'♥':'♡')+'</button><button class="btn ghost" data-a="custom"'+(L?'':' disabled')+'>Customize</button></div>'
   +'<p class="lore">'+esc(c.lore)+'</p>'
   +'<div class="xp"><span>Level '+lvl+'</span><div><i style="width:'+xpp+'%"></i></div><span>'+Math.floor(xp)+' / '+xpNeed(lvl)+' XP</span></div>'
   +'<div class="galhead"><div class="gsel"><button data-a="gmenu" aria-haspopup="true">MY GALLERY ▾</button><div class="gmenu" hidden><button data-g="chars" class="'+(X6.sc.gal=='chars'?'on':'')+'">Characters</button><button data-g="wings" class="'+(X6.sc.gal=='wings'?'on':'')+'">Wings</button></div></div><div class="gpg"><button data-p="-1" aria-label="Previous page">‹</button><span>'+(gpage+1)+'/'+pages()+'</span><button data-p="1" aria-label="Next page">›</button></div></div>'
   +'<div class="gal">'+galTiles()+'</div>';
  return h}
 const gItems=()=>X6.sc.gal=='wings'?WINGS.map((w,i)=>({k:'w'+i,n:w.n,lock:!wingOwned(w),sub:!wingOwned(w)?(w.shop?'Store':'Lv '+w.lvl):(cel.wing==w.id||(cel.wing=='auto'&&bestWing(lvl)==w)?'Equipped':'Unlocked')})):CHARS.map((c,i)=>({k:'c'+i,n:i?c.first:String(myName).slice(0,10),lock:!unlocked(i),sub:unlocked(i)?(X6.sc.act==i?'Active':X6.sc.fav[i]?'Favorite':'Owned'):'Lv '+c.lv,cur:i==cur}));
 const pages=()=>Math.max(1,Math.ceil(gItems().length/4));
 function galTiles(){const it=gItems().slice(gpage*4,gpage*4+4);return it.map(x=>'<button class="gt'+(x.cur?' sel':'')+(x.lock?' lock':'')+'" data-t="'+x.k+'" aria-label="'+esc(x.n)+' '+esc(x.sub)+'"><canvas width="160" height="100" data-tk="'+x.k+'"></canvas><span>'+esc(x.n)+'</span><small>'+esc(x.sub)+'</small></button>').join('')}
 function paintTiles(){el.querySelectorAll('canvas[data-tk]').forEach(c=>{const k=c.dataset.tk,g=c.getContext('2d');g.clearRect(0,0,160,100);const gb=g.createLinearGradient(0,0,160,100);gb.addColorStop(0,dk()?'#33285a':'#f1ecf9');gb.addColorStop(1,dk()?'#1f2744':'#dfe8f6');g.fillStyle=gb;g.fillRect(0,0,160,100);
  if(k[0]=='c'){const i=+k.slice(1),L=SHOWART.info(apOf(i));g.save();g.beginPath();g.rect(0,0,160,100);g.clip();try{SHOWART.draw(g,160,230,{look:unlocked(i)?L:grey(L),t:0,wpn:'fist',wings:false,zoom:1.5,ox:80,dy:92})}catch(e){}g.restore()}
  else{const i=+k.slice(1);g.save();g.translate(80,60);g.scale(.62,.62);if(!wingOwned(WINGS[i]))g.globalAlpha=.35;try{WingArt.draw(g,i,0,0,1,1,0,0,0,1)}catch(e){}g.restore()}})}
 function render(){const box=el.querySelector('#sInfo');box.innerHTML=info();paintTiles();el.querySelector('#sIdx').textContent=String(cur+1).padStart(2,'0');el.querySelector('#sTot').textContent='/'+String(CHARS.length).padStart(2,'0');
  el.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.n=='home'));const ar=el.querySelector('.idx .arrows');if(ar)ar.style.visibility=CHARS.length<2?'hidden':''}
 // ---- drawing
 let glow=null,glowK='';const dk=()=>document.documentElement.dataset.theme=='dark';
 function draw(now){if(!open)return;raf=requestAnimationFrame(draw);const fps=reduce()?6:36;if(now-lastDraw<1000/fps)return;lastDraw=now;fit();const W=cv.width,H=cv.height,t=reduce()?1.2:(now-t0)/1000,D=dk();cx.clearRect(0,0,W,H);
  // soft floor light (gradient cached per size + theme) + dust
  const gk=W+'x'+H+D;if(gk!=glowK){glowK=gk;glow=cx.createRadialGradient(W*.42,H*.62,10,W*.42,H*.62,H*.8);glow.addColorStop(0,D?'rgba(184,165,242,.32)':'rgba(255,255,255,.9)');glow.addColorStop(1,D?'rgba(184,165,242,0)':'rgba(255,255,255,0)')}cx.fillStyle=glow;cx.fillRect(0,0,W,H);
  if(!reduce()){cx.fillStyle=D?'rgba(230,220,255,.28)':'rgba(20,18,26,.18)';for(const d of dust){const x=((d.x+Math.sin(t*d.s*6+d.p)*.02)%1)*W,y=((d.y-t*d.s*.12)%1+1)%1*H;cx.beginPath();cx.arc(x,y,d.r*(W/900),0,6.3);cx.fill()}}
  const i=cur,L=SHOWART.info(apOf(i));const useL=unlocked(i)?L:grey(L);
  const wi=i==cur&&X6.sc.gal=='wings'&&galHover>=0?galHover:undefined;
  try{SHOWART.draw(cx,W,H,{look:useL,t,wpn:unlocked(i)?(typeof wp!='undefined'?wp:'fist'):'fist',wings:unlocked(i),wingIdx:wi,ox:W*.5,zoom:1.02,gear:i==X6.sc.act&&unlocked(i)&&typeof wear!='undefined'?wear:null})}catch(e){if(!draw.e){draw.e=1;console.error(e)}}}
 let galHover=-1;
 function loop(){cancelAnimationFrame(raf);t0=performance.now()-(t0?0:0);raf=requestAnimationFrame(draw)}
 function stop(){cancelAnimationFrame(raf)}
 // ---- actions
 function swap(d){if(busy||CHARS.length<2)return;busy=1;const n=(cur+d+CHARS.length)%CHARS.length;el.classList.add('swap');UIS.play('char');setTimeout(()=>{cur=n;gpage=Math.floor(cur/4);render();el.classList.remove('swap');el.classList.add('swapin');setTimeout(()=>{el.classList.remove('swapin');busy=0},320)},200)}
 function selectCur(){const i=cur;if(!unlocked(i))return false;X6.sc.act=i;Object.assign(cel.ap,apOf(i));try{celSave()}catch(_){}x6Save();UIS.play(CHARS[i].stars>=5?'rare':'select');say((i?CHARS[i].first:'Your look')+' is now active');return true}
 function ensureGame(cb){if(entered){cb();return}try{$('bp').click()}catch(_){}setTimeout(()=>{if(entered||creatorOn)cb()},60)}
 function close(){if(!open)return;open=false;window.RB_COVER=false;stop();el.classList.remove('in');setTimeout(()=>{if(!open)el.style.display='none'},260);UIS.play('close')}
 function openUI(){build();open=true;window.RB_COVER=true;   /* full-screen and opaque: pause the world behind it */el.style.display='block';try{menuEl.style.display='none'}catch(_){}if(!X6.sc.looks[0])X6.sc.looks[0]=sanAp(cel.ap);cur=X6.sc.act;if(!unlocked(cur))cur=0;gpage=Math.floor(cur/4);render();fit();el.classList.remove('in');void el.offsetWidth;requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('in')));t0=performance.now();loop();UIS.play('open')}
 function onClick(e){const a=e.target.closest('[data-a],[data-n],[data-d],[data-g],[data-p],[data-t]');if(!a){el.querySelectorAll('.gmenu').forEach(m=>m.hidden=true);return}
  if(a.dataset.n){e.preventDefault();nav(a.dataset.n);return}
  if(a.dataset.d){swap(+a.dataset.d);return}
  if(a.dataset.p){const n=pages();gpage=(gpage+ +a.dataset.p+n)%n;el.querySelector('.gal').innerHTML=galTiles();el.querySelector('.gpg span').textContent=(gpage+1)+'/'+n;paintTiles();UIS.play('tab');return}
  if(a.dataset.g){X6.sc.gal=a.dataset.g;gpage=0;x6Save();render();UIS.play('tab');return}
  if(a.dataset.t){const k=a.dataset.t,i=+k.slice(1);if(k[0]=='c'){if(i!=cur){const d=i-cur;busy=0;cur=cur;swapTo(i)}}else{const w=WINGS[i];if(!wingOwned(w)){say(w.shop?w.n+' is sold in the Store':w.n+' unlocks at level '+w.lvl);UIS.play('error');return}cel.wing=w.id;try{celSave()}catch(_){}render();UIS.play('select')}return}
  const act=a.dataset.a;
  if(act=='gmenu'){const m=el.querySelector('.gmenu');m.hidden=!m.hidden;UIS.play('tab');e.stopPropagation();return}
  if(act=='fav'){X6.sc.fav[cur]=X6.sc.fav[cur]?0:1;if(!X6.sc.fav[cur])delete X6.sc.fav[cur];x6Save();render();UIS.play('select');return}
  if(act=='select'){if(selectCur())render();return}
  if(act=='play'){if(!selectCur())return;UIS.play('world');close();ensureGame(()=>{})}
  if(act=='custom'){if(!selectCur())return;close();ensureGame(()=>{try{UI6.open('look')}catch(_){}})}}
 function swapTo(i){if(busy)return;busy=1;el.classList.add('swap');UIS.play('char');setTimeout(()=>{cur=i;render();el.classList.remove('swap');el.classList.add('swapin');setTimeout(()=>{el.classList.remove('swapin');busy=0},320)},200)}
 function nav(k){UIS.play('click');
  if(k=='home'||k=='chars'){X6.sc.gal='chars';render();return}
  const go=f=>{close();ensureGame(f)};
  if(k=='inv')go(()=>INV7.open());
  else if(k=='store')go(()=>STORE7.open());
  else if(k=='worlds'){close();setTimeout(()=>{try{openMenu('mworlds')}catch(_){}},120)}
  else if(k=='coll')go(()=>{try{BOOK7.open()}catch(_){try{UI6.open('wings')}catch(_){}}});
  else if(k=='prof')go(()=>{try{UI6.open('profile')}catch(_){}});
  else if(k=='set')go(()=>{try{UI6.open('settings')}catch(_){}})}
 function onKey(e){if(!open)return;if(e.target&&(e.target.tagName=='INPUT'||e.target.tagName=='SELECT'))return;
  if(e.key=='ArrowLeft'){swap(-1);e.preventDefault();e.stopPropagation()}else if(e.key=='ArrowRight'){swap(1);e.preventDefault();e.stopPropagation()}
  else if(e.key=='Escape'&&entered){close();e.stopPropagation();e.preventDefault()}
  else if(e.key=='Enter'&&!e.target.closest('button,a')){const b=el.querySelector('[data-a=play]');if(b&&!b.disabled)b.click()}}
 return{open:openUI,close,render,get isOpen(){return open},get cur(){return cur},set cur(v){cur=v},nav,CHARS}})();
function openStore(){const n=NPCS.find(x=>x.k=='shop');if(!n)return;curNPC=n;dlgOpen=true;dlg.style.display='block';try{renderDlg()}catch(_){}try{UIS.play('open')}catch(_){}}
// persist edits made in the appearance editor into the active character slot
{const _cs=celSave;celSave=function(){try{if(typeof SHOW7!='undefined'&&X6&&X6.sc&&!(X6.sc.act>0&&0)){X6.sc.looks[X6.sc.act|0]=sanAp(cel.ap);x6Save()}}catch(_){}_cs()}}
// open at launch and via the HUD Home button / H key chord
if(!(navigator.webdriver&&!localStorage.getItem('rb_force_launch')))/* automated browsers skip the launch screens unless a test asks for them */{const home=()=>{if(!creatorOn){SHOW7.open();return}let tries=0,iv=setInterval(()=>{if(++tries>600){clearInterval(iv);return}if(creatorOn)return;clearInterval(iv);SHOW7.open()},300)};
 /* every launch: the story intro (CINE7) plays first, then fades into the home screen */try{CINE7.launch(home)}catch(e){console.error('CINE7',e);home()}}
(()=>{const mkb=()=>{const g=document.querySelector('#hudbtns')||document.querySelector('#bmenu')?.parentElement;if(!g||document.getElementById('bhome'))return;const b=document.createElement('button');b.id='bhome';b.title='Home / characters';b.textContent='⌂';b.onclick=()=>{if(SHOW7.isOpen)SHOW7.close();else SHOW7.open()};g.insertBefore(b,g.firstChild)};setTimeout(mkb,400)})();
// ---- CHARMIG9: remove the old preset character slots from every save (any computer). Keeps slot 0 (your own look), your level, gems,
// inventory, gear and wings untouched; if a preset was the active character, your own saved look becomes active again.
const CHARMIG9=(()=>{function run(){try{const sc=X6&&X6.sc;if(!sc)return false;const a=sc.act|0,own=Array.isArray(sc.looks)&&sc.looks[0]&&typeof sc.looks[0]=='object'?sc.looks[0]:null,had=a>0||(Array.isArray(sc.looks)&&sc.looks.length>1)||Object.keys(sc.fav||{}).some(k=>k!='0');
  if(!had)return false;sc.act=0;if(a>0&&own){Object.assign(cel.ap,sanAp(own))}sc.looks=[own?sanAp(own):sanAp(cel.ap)];const f0=sc.fav&&sc.fav[0];sc.fav={};if(f0)sc.fav[0]=1;try{x6Save()}catch(_){}try{celSave()}catch(_){}try{localStorage.setItem('rbcharmig9','1')}catch(_){}return true}catch(e){console.error('CHARMIG9',e);return false}}
 const did=run();return{run,did}})();
