// ===== GUIDE10: the starting guide. A short card deck that explains what Rootbound is and what to do: moving and tools, the hidden word
// of every world and the realms it leads to, classes and getting stronger, and how everything you do is rewarded. It opens once for a new
// player after the story intro (when they enter their first world) and any time with F1 or from the hub button. Pages slide with a light
// transform/opacity transition (none with reduced motion). State: RB_PREFIX + 'rbguide' (seen). Automated test browsers skip the auto-open. =====
const GUIDE10=(()=>{
 const K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbguide';
 const seen=()=>{try{return !!localStorage.getItem(K())}catch(_){return true}},mark=()=>{try{localStorage.setItem(K(),'1')}catch(_){}};
 const kb=k=>'<kbd>'+k+'</kbd>';
 const PAGES=[
  ['🌱','Welcome to Rootbound','A cozy anime block adventure. Explore hand-made worlds, mine and build, fight monsters, and rise from a little sprout to a <b>Celestial Ascension</b> through ever stranger realms.'],
  ['🎮','Moving and doing',kb('A')+' '+kb('D')+' move · '+kb('W')+' or '+kb('Space')+' jump · aim with the mouse and <b>left-click</b> to attack or use.<br>Your hotbar ('+kb('1')+'–'+kb('7')+') holds weapons and tools: only <b>tools break blocks</b>. '+kb('F')+' talks, opens, uses and picks things up · '+kb('I')+' opens your bag · '+kb('Q')+' '+kb('E')+' '+kb('R')+' '+kb('Z')+' '+kb('V')+' skills, '+kb('X')+' '+kb('C')+' class skills, '+kb('Shift')+' dash.'],
  ['🔤','Every world hides a word','Shiny <b>letter blocks</b> are hidden on the surface, in caves and deep below. Each one is guarded by a <b>Letter Warden</b>. Find them all and a huge <b>World Boss</b> wakes to take them back: the world collapses and you fight it alone. Defeat it, then solve the <b>Word Gate</b> to open the next realm:<br><b>World → Inferno → Galaxy → Abyssal Sea → Crystal Realm</b>, each with a longer word, new biomes and tougher monsters.'],
  ['🗡️','Grow stronger','Visit a <b>class master</b> in the Plaza to pick a class (Brawler, Knight, Mage, Archer and more), then press '+kb('K')+' to see it. Level up, buy gear and weapons in the <b>Store</b>, forge your class\'s <b>mythic weapon</b>, and light the <b>totems</b> in each biome.'],
  ['🎁','Everything is rewarded','Breaking, building, fighting, farming, fishing, exploring: it all adds up to <b>milestones</b> that pay gems and XP. Quests and achievements are under '+kb('J')+', and new <b>avatar frames</b> unlock as you level (click your portrait).'],
  ['✨','You\'re ready','Start with the <b>Getting started</b> list on the right: it walks you through your first steps. Press '+kb('F1')+' any time to read this guide again. Have fun!']];
 let el=null,pg=0;
 function build(){el=document.createElement('div');el.id='guide10';el.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-labelledby="g10t"><div class="pg"></div><div class="dots"></div><div class="acts"><button class="skip">Skip</button><span></span><button class="back">Back</button><button class="next pri">Next</button></div></div>';
  document.body.appendChild(el);el.querySelector('.skip').onclick=()=>close();el.querySelector('.back').onclick=()=>go(pg-1);el.querySelector('.next').onclick=()=>pg>=PAGES.length-1?close():go(pg+1);
  el.addEventListener('mousedown',e=>{if(e.target===el)close()});
  addEventListener('keydown',e=>{if(!el.classList.contains('on'))return;if(e.key=='Escape'){e.stopPropagation();e.preventDefault();close()}else if(e.key=='ArrowRight'||e.key=='Enter'){e.stopPropagation();e.preventDefault();pg>=PAGES.length-1?close():go(pg+1)}else if(e.key=='ArrowLeft'){e.stopPropagation();e.preventDefault();go(pg-1)}},true)}
 function go(n,first){n=Math.max(0,Math.min(PAGES.length-1,n));const dir=n>=pg?1:-1;pg=n;const p=PAGES[n],box=el.querySelector('.pg');
  box.innerHTML='<div class="ic" aria-hidden="true">'+p[0]+'</div><h3 id="g10t">'+p[1]+'</h3><p>'+p[2]+'</p>';box.style.setProperty('--d',dir);if(!first){box.classList.remove('in');void box.offsetWidth}box.classList.add('in');
  el.querySelector('.dots').innerHTML=PAGES.map((_,i)=>'<i class="'+(i==n?'on':'')+'"></i>').join('');el.querySelector('.back').disabled=n==0;el.querySelector('.next').textContent=n>=PAGES.length-1?'Start playing':'Next';
  try{UIS.play(first?'open':'tab')}catch(_){}}
 function open(){if(!el)build();el.style.display='flex';pg=0;go(0,true);requestAnimationFrame(()=>el.classList.add('on'));try{for(const k in keys)keys[k]=0}catch(_){}}
 function close(){if(!el)return;mark();el.classList.remove('on');setTimeout(()=>{if(!el.classList.contains('on'))el.style.display='none'},180);try{UIS.play('close')}catch(_){}}
 const isOpen=()=>!!el&&el.classList.contains('on');
 addEventListener('keydown',e=>{if(e.key=='F1'&&!e.repeat){e.preventDefault();isOpen()?close():open()}});
 // first time: a moment after the player enters their first world (not under automated test browsers unless asked)
 const auto=!(navigator.webdriver&&!localStorage.getItem('rb_force_guide'));
 if(auto&&!seen()){const iv=setInterval(()=>{try{if(typeof entered!='undefined'&&entered&&!(typeof CINE7!='undefined'&&CINE7.playing)&&menuEl.style.display=='none'&&!window.RB_COVER){clearInterval(iv);setTimeout(()=>{if(!seen())open()},1200)}}catch(_){}},800)}
 return{open,close,get isOpen(){return isOpen()},PAGES,get page(){return pg}}})();
