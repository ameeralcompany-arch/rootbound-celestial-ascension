// ===== STORY1: "The Worlds We Left Behind" (docs/story-proposal.md). The Journal: short story pages that unlock from what the player really does, never from a
// script of its own. Seeing a realm, speaking its word at the Word Gate (WORD9), letting its guardian rest (WBOSS13), clearing dungeons (DG.S.clr). At the moments that
// matter Lavi says a line in her own recorded voice (RPG.guide.say, tools/voice/fairy-lines.json "st_*"), but never over a fight, a film or a boss.
// Read it from Rootlink (M > Journal). State: RB_PREFIX+'rbstory' {got:{id:time}, read:{id:1}, seen:{stage:1}}. Cost: one check every 3 s while playing. =====
try{(()=>{
 const KEY=()=>(typeof RB_PREFIX!='undefined'?RB_PREFIX:'')+'rbstory';
 let S={got:{},read:{},seen:{}};try{S=Object.assign(S,JSON.parse(localStorage.getItem(KEY())||'{}'))}catch(_){}
 const save=()=>{try{localStorage.setItem(KEY(),JSON.stringify(S))}catch(_){}};
 // ---- what the player has done, read from the game's own records
 const stage=n=>{try{return WORD9.stageOf(n)}catch(_){return -1}};
 const wordOk=sg=>{try{const w=WORD9.state.w||{};return Object.keys(w).some(n=>w[n]&&w[n].ok&&n!='plaza'&&stage(n)===sg)}catch(_){return false}};
 const guard=sg=>{try{const w=(WBOSS13.state&&WBOSS13.state.w)||{};return Object.keys(w).some(n=>w[n]&&stage(n)===sg)}catch(_){return false}};
 const clr=d=>{try{const c=DG.S.clr[d];return !!(c&&Object.keys(c).length)}catch(_){return false}};
 const anyClr=()=>{try{return Object.keys(DG.S.clr||{}).some(clr)}catch(_){return false}};
 const seen=sg=>!!S.seen[sg];
 const L=()=>typeof lvl!='undefined'?lvl:1;
 // ---- the pages. if: unlock rule. lavi: her line when it unlocks. hint: shown while locked
 const CH=[
  {k:'pro',n:'Prologue',pages:[
   {id:'wake',t:'A Hundred Years',if:()=>true,x:'You woke in the Plaza with dust on your coat and the sound of roots in your ears. Lavi says nobody else can hear them any more. She says that is the whole point of you.'},
   {id:'silence',t:'The Great Silence',if:()=>L()>=3||[0,1,2,3,4].some(seen),lavi:'st_silence',hint:'Step out into a world',x:'Once, travelers walked the Rootways between every world, and each world kept its own songs, festivals and creatures. Then came the Great Silence. Nobody knows why. The roads went quiet, the worlds drifted apart, and each world\'s name-word broke into scattered letters.'}]},
  {k:'plaza',n:'The Plaza',pages:[
   {id:'plaza',t:'The Last Crossroads',if:()=>true,x:'The Plaza is the one place where travelers still meet. Everyone here remembers a piece of the old Rootways: half as a joke, half as a sorrow. Mira swears she once sold apples to a dragon. Vesper says she used to see the future, before the Silence. Nobody believes either of them, which they both find very rude.'}]},
  {k:'w0',n:'The First World',pages:[
   {id:'w0_seen',t:'Flowers Shaped Like Letters',if:()=>seen(0),lavi:'st_w1_letters',hint:'Visit the first world',x:'The meadow by the lake grows flowers in the shapes of letters, and the letters glitter in the stone. A world without its word cannot call to the others. This one is still trying.'},
   {id:'w0_word',t:'The First Word',if:()=>wordOk(0),lavi:'st_word',hint:'Gather the first world\'s letters and speak its word at the Word Gate',x:'You spoke the word, and for a moment the whole meadow held its breath. Somewhere very far away, something answered.'},
   {id:'w0_guard',t:'Thornmaw\'s Roots',if:()=>guard(0),lavi:'st_guard_root',hint:'Face the first world\'s guardian',x:'Thornmaw the Rootwarden wrapped its roots around the world\'s word to keep it from thieves. When you took the letters, you looked like a thief. After the fight it let the roots go, slowly, the way a tired hand opens.'}]},
  {k:'w1',n:'Inferno',pages:[
   {id:'w1_seen',t:'Cold Forges',if:()=>seen(1),hint:'Visit an Inferno world',x:'A world of forges whose fires burn cold. Bram learned his trade here, long ago. He won\'t say more than that, but he gets very quiet when you mention it.'},
   {id:'w1_word',t:'The Forge-Song',if:()=>wordOk(1),lavi:'st_word',hint:'Speak an Inferno world\'s word',x:'The forges remember their song. The anvils ring all at once, out of time, like a crowd that has not sung together in a hundred years.'},
   {id:'w1_guard',t:'Vulkhar\'s Pride',if:()=>guard(1),lavi:'st_guard_pyre',hint:'Face Vulkhar the Pyrelord',x:'Vulkhar the Pyrelord kept every forge lit by itself, and would not let anyone help. Pride is a heavy thing to carry for a hundred years. It finally put it down.'}]},
  {k:'w2',n:'Galaxy',pages:[
   {id:'w2_seen',t:'Stars Going Out',if:()=>seen(2),hint:'Visit a Galaxy world',x:'Floating stone under a sea of stars, and the stars are going out one by one. Seren comes here to count them. Lumi the moth spirit was born here, and will not say so out loud.'},
   {id:'w2_word',t:'A Name in the Sky',if:()=>wordOk(2),lavi:'st_word',hint:'Speak a Galaxy world\'s word',x:'The word is spoken, and three new stars open over the islands, small and very bright, like eyes after a long sleep.'},
   {id:'w2_guard',t:'Nyx\'s Hunger',if:()=>guard(2),lavi:'st_guard_nyx',hint:'Face Nyx the Astral Devourer',x:'Nyx ate dying stars so their light would not go to waste. It was grief, turned into hunger. Now that it rests, new stars have room to grow.'}]},
  {k:'w3',n:'Abyssal Sea',pages:[
   {id:'w3_seen',t:'The Drowned City',if:()=>seen(3),hint:'Visit an Abyssal Sea world',x:'Under the waves, a drowned city still rings with old songs. Kael never comes here. His partner was a sailor on this sea, and never came home.'},
   {id:'w3_word',t:'The Tide Remembers',if:()=>wordOk(3),lavi:'st_word',hint:'Speak an Abyssal Sea world\'s word',x:'The word goes out across the water, and the tide turns as if it had been waiting for permission.'},
   {id:'w3_guard',t:'Maelor\'s Song',if:()=>guard(3),lavi:'st_guard_mael',hint:'Face Maelor the Leviathan',x:'Maelor held the city\'s last song in its lungs, because it was all that was left. When it let the song go, the sea began to sing it back. Far off, a lighthouse light came on that nobody had lit.'}]},
  {k:'w4',n:'Crystal Realm',pages:[
   {id:'w4_seen',t:'The Frozen Festival',if:()=>seen(4),hint:'Visit a Crystal Realm world',x:'Perfect crystal reflections of a festival, stopped mid-dance. Lulu from the teahouse danced here once. She says she was the best. Tobi says she fell over.'},
   {id:'w4_word',t:'The Music Starts',if:()=>wordOk(4),lavi:'st_word',hint:'Speak a Crystal Realm world\'s word',x:'The word is spoken, and a single note rings through the crystal, the first note of a song that stopped a hundred years ago.'},
   {id:'w4_guard',t:'Aurelia\'s Moment',if:()=>guard(4),lavi:'st_guard_prism',hint:'Face Aurelia the Prism Empress',x:'Aurelia froze the festival so the happiest moment would last forever. But a festival is meant to end, so it can happen again. When she rested, the dancers took one step, then another.'}]},
  {k:'deep',n:'The Deep Roads',pages:[
   {id:'dg_first',t:'Buried Rootways',if:anyClr,lavi:'st_dungeon_first',hint:'Clear any dungeon',x:'Every dungeon is an old Rootway, buried deep under the worlds. Whoever kept each one was left alone in the dark when the Silence came. The Silence changed them.'},
   {id:'dg_ruins',t:'The Last Door',if:()=>clr('ruins'),hint:'Clear the Forgotten Ruins',x:'The Ancient Sentinel kept guarding a door long after anyone remembered why. "I am the last door," it said. It was right. It just did not know what it was a door to.'},
   {id:'dg_frozen',t:'One Hour, Kept',if:()=>clr('frozen'),hint:'Clear the Frozen Catacombs',x:'The Frost Empress stopped time to keep one hour she could not bear to lose. "At last, the thaw," she said, and it sounded like relief.'},
   {id:'dg_shadow',t:'Its Shadow',if:()=>clr('abyss'),lavi:'st_shadow',hint:'Clear the Eternal Abyss',x:'In the Eternal Abyss you met the World Eater\'s shadow. "I am only its shadow," it said. "Imagine the rest." Lavi has not been able to stop imagining.'},
   {id:'dg_eater',t:'Everything That Begins',if:()=>clr('eater'),hint:'Clear the Throne of the World Eater',x:'The World Eater was never a god and never simply evil. It was what the Great Silence became: the universe forgetting itself, swallowing every world nobody remembered. "Then... let it all begin again," it said, at the end.'}]},
  {k:'end',n:'The End',pages:[
   {id:'end',t:'Someone Willing to Remember',if:()=>[0,1,2,3,4].every(guard)&&clr('eater'),hint:'Let every realm\'s guardian rest, and reach the bottom of everything',x:'Even when worlds drift apart and memories fade, the moments we share still leave something behind. Sometimes, all it takes to bring light back is someone willing to remember.'}]},
 ];
 const ALL=CH.flatMap(c=>c.pages.map(p=>Object.assign(p,{ch:c.k})));
 // ---- unlocking. Lavi waits for a quiet moment to speak
 const queue=[];
 const busy=()=>{try{if(typeof INTRO60!='undefined'&&INTRO60.playing)return true;if(typeof CINE7!='undefined'&&CINE7.playing)return true;if(window.DG&&(DG.run||(DG.cine&&DG.cine.on)))return true;if(typeof WBOSS13!='undefined'&&WBOSS13.fight)return true;if(typeof entered!='undefined'&&!entered)return true;if(window.RPG&&RPG.guide&&RPG.guide.touring)return true}catch(_){}return false};
 const toast=t=>{try{say('Journal: '+t+' (M > Journal)')}catch(_){}};
 function check(){
  try{const c=typeof cur!='undefined'?cur:'';if(c&&c!='plaza'&&!(window.DG&&DG.run)){const sg=stage(c);if(sg>=0&&!S.seen[sg]){S.seen[sg]=1;save()}}}catch(_){}
  let n=0;for(const p of ALL){if(S.got[p.id])continue;let ok=false;try{ok=!!p.if()}catch(_){}if(ok){S.got[p.id]=Date.now();n++;if(p.lavi)queue.push(p);else if(!API.busy())toast(p.t)}}
  if(n)save();
  if(queue.length&&!API.busy()){const p=queue.shift();try{RPG.guide.say(p.lavi)}catch(_){}toast(p.t)}
 }
 let started=false;function boot(){if(started)return;started=true;setInterval(check,3000);setTimeout(check,1500)}
 if(typeof entered!='undefined'&&entered)boot();else{const iv=setInterval(()=>{if(typeof entered!='undefined'&&entered){clearInterval(iv);boot()}},1000)}

 // ---- the Journal panel: chapters on the left, the page on the right
 let el=null,sel=null;
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function build(){el=document.createElement('div');el.id='stj';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Journal');
  el.innerHTML='<div class="stj-scrim"></div><div class="stj-book"><header><div><small>Journal</small><h2>The Worlds We Left Behind</h2></div><span class="stj-count"></span><button type="button" class="stj-x" aria-label="Close">×</button></header><div class="stj-cols"><nav class="stj-list"></nav><article class="stj-page"></article></div></div>';
  document.body.appendChild(el);el.querySelector('.stj-scrim').addEventListener('pointerdown',close);el.querySelector('.stj-x').addEventListener('click',close);
  el.querySelector('.stj-list').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(b){sel=b.dataset.p;render()}});
  addEventListener('keydown',e=>{if(el&&el.classList.contains('on')&&e.key=='Escape'){close();e.preventDefault();e.stopImmediatePropagation()}},true)}
 function render(){const got=ALL.filter(p=>S.got[p.id]).length;el.querySelector('.stj-count').textContent=got+' of '+ALL.length+' pages';
  el.querySelector('.stj-list').innerHTML=CH.map(c=>'<section><h3>'+esc(c.n)+'</h3>'+c.pages.map(p=>{const g=!!S.got[p.id],nw=g&&!S.read[p.id];return'<button type="button" data-p="'+p.id+'" class="'+(g?'got':'lock')+(sel==p.id?' sel':'')+'">'+(g?esc(p.t):'? ? ?')+(nw?'<i>New</i>':'')+'</button>'}).join('')+'</section>').join('');
  const p=ALL.find(q=>q.id==sel)||ALL.find(q=>S.got[q.id]);if(!p)return;sel=p.id;const c=CH.find(c=>c.k==p.ch);
  el.querySelector('.stj-page').innerHTML=S.got[p.id]?'<small>'+esc(c.n)+'</small><h1>'+esc(p.t)+'</h1><p>'+esc(p.x)+'</p>'+(p.lavi?'<button type="button" class="stj-hear" data-l="'+p.lavi+'">Hear Lavi</button>':'')+(p.replay?'<button type="button" class="stj-hear stj-replay">Watch the ending</button>':''):'<small>'+esc(c.n)+'</small><h1 class="lock">A page not yet written</h1><p class="hint">'+esc(p.hint||'Keep exploring')+'</p>';
  const rp=el.querySelector('.stj-replay');if(rp)rp.onclick=()=>{close();try{p.replay()}catch(_){}};const h=el.querySelector('.stj-hear:not(.stj-replay)');if(h)h.onclick=()=>{try{RPG.guide.say(h.dataset.l)}catch(_){}};
  if(S.got[p.id]&&!S.read[p.id]){S.read[p.id]=1;save();setTimeout(()=>{const b=el.querySelector('[data-p="'+p.id+'"] i');if(b)b.remove()},600)}}
 function open(){if(!el)build();try{NAV16.closeAll()}catch(_){}sel=sel||(ALL.filter(p=>S.got[p.id]&&!S.read[p.id])[0]||{}).id||null;render();el.classList.add('on');try{snd(520,.08,'sine',.03)}catch(_){}return true}
 function close(){if(!el||!el.classList.contains('on'))return false;el.classList.remove('on');return true}
 const API=window.STORY1={open,close,check,busy,get on(){return !!(el&&el.classList.contains('on'))},get unread(){return ALL.filter(p=>S.got[p.id]&&!S.read[p.id]).length},get got(){return Object.keys(S.got)},PAGES:ALL,CH,get S(){return S},reset(){S={got:{},read:{},seen:{}};save()}};
})()}catch(e){console.error('STORY1',e)}
