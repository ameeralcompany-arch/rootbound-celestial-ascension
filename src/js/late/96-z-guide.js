// ===== GUIDE8: the Tool Guide. A hub tab ("Tool Guide") that explains exactly how to use every tool: what each one breaks in one hit (with
// real block icons), what it is slow at, how to hold and use it, its special abilities, what earns XP, every level's perk and gem reward, and
// how the shine grows (live, animated previews of each shine tier drawn with the in-game shine code). Also pages for the basics, levels & shine
// and where to dig at each depth. Open it with G (when you are not standing beside a door or object; G there still sets the object up), from
// the hub (C) -> Tool Guide, or the "Tool guide" button in the inventory header. A one-time hint mentions it. Preview canvases animate only
// while the guide is on screen. =====
const GUIDE8=(()=>{
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const IDS=TOOLLV.IDS,TL=TOOLS8.TL,NM=id=>TL[id].n.replace(/ the .*$/,'');
 const ico=k=>{try{return iconURL(k)}catch(_){return''}},bn=k=>{try{return iname(k)}catch(_){return'Block'}};
 const wooden=()=>{const o=[5];try{for(const k in BLK){const n=+k;if(n!=5&&/Plank|Log|Bamboo|Crate/.test(BLK[k][0])&&o.length<4)o.push(n)}}catch(_){}return o};
 const D={
  pip:{role:'Your digging buddy for everything soft.',best:()=>[1,2,8,6,15,5,93],slow:'Stone, brick, marble, deepslate and every ore. Swap to Pebble or Glimmer for those.',
   how:['Put Pip in a hotbar slot (1–6) and press its number, or scroll the mouse wheel until Pip is in your hand.','Aim at a soft block within reach and left-click: one scoop breaks it. Hold the button to keep digging.','In the Glowroot Hollows (8–25 m deep) dig up the golden <b>Buried Caches</b> for treasure and gems.'],
   sp:['Breaks dirt, grass, sand, glass, leaves and wood in one scoop','Digs out Buried Caches (treasure, gems, ores)','From level 4 the soil turns up Worm Bait for Bubbles, Glow Bait from level 7'],xp:'Soft blocks and wood <b>+2 XP</b> · Buried Cache <b>+12 XP</b>'},
  pebble:{role:'A little hammer that cracks stone in one tap.',best:()=>[3,11,7,12,14,77],slow:'Dirt, sand, wood and ores. Glimmer gets far more out of ores.',
   how:['Put Pebble in a hotbar slot (1–6) or scroll to it.','Left-click stone, cobblestone, brick, marble, roof tiles or deepslate: one tap each. Hold to tunnel.','Deepslate begins around 44 m deep and is tough for any other tool, so Pebble is the way through.'],
   sp:['One tap per stone block, even deepslate','From level 4 stone can crack into Quartz Shards, Amethyst from level 7','From level 5 some stones hold gems'],xp:'Stone blocks <b>+2 XP</b>'},
  glimmer:{role:'The sparkly ore pick: one click mines the whole vein.',best:()=>[71,72,73,74,75,76,9,10,94],slow:'Everything that is not an ore, crystal, gold or a geode.',
   how:['Put Glimmer in a hotbar slot (1–6) or scroll to it. While you hold it, ores within about 9 blocks <b>twinkle</b>, so you can see where to dig.','Left-click one ore block: Glimmer mines the whole connected vein (8 blocks, up to 22 with levels) and often pops out a bonus ore.','Crystal Geodes (purple, 26–45 m deep) need 3 taps (2 from level 7) and burst into gems and rare crystals.'],
   sp:['Mines the entire connected vein in one click','50% chance of a bonus ore on every ore you click','Nearby ores twinkle while you hold it','Cracks Crystal Geodes for gems and crystals'],xp:'Ore <b>+6 XP</b> · every extra vein block <b>+4 XP</b> · Crystal Geode <b>+20 XP</b>'},
  twiggy:{role:'A leafy axe that chops whole trees for extra wood.',best:wooden,slow:'Stone, dirt, sand and ores.',
   how:['Put Twiggy in a hotbar slot (1–6) or scroll to it.','Click a tree (trunk or leaves) to chop the whole tree: you get its wood <b>plus 2 extra</b> (up to 6 with levels).','Left-click wood, planks, logs, bamboo or crates to split them in one hit.'],
   sp:['Chops whole trees with bonus wood','Splits wooden blocks in one hit','From level 5 trees can drop gems'],xp:'Each tree <b>+6 XP</b> · wooden blocks <b>+2 XP</b>'},
  bubbles:{role:'A cute fishing rod with a duck bobber. It never breaks blocks.',best:()=>[240,241,242,243,247,250,251,252],slow:'It does not mine at all: it only fishes.',
   how:['Stand on dry ground next to a lake or pool (not swimming) and hold Bubbles: hotbar slot (1–6) or scroll to it.','Click the water to cast. The duck bobber flies out and floats on the surface.','Wait for the bite. When a red <b>!</b> pops up over your head and the bobber dips, click again <b>quickly</b>. Click too early and you reel in nothing; too slow and it gets away.','Then <b>reel it in</b>: hold the mouse (or Space) to push the green zone right, let go to let it drift left, and keep the fish inside it. Inside, the catch meter fills; outside, the line tension rises and at full tension the line snaps. Rarer fish fight harder; higher Bubbles levels give a bigger zone, slower fish and a tougher line.','Bait is used automatically, best first. Punch the blue <b>Tackle Boxes</b> on lake shores with your fists to get Worm, Glow and Golden Bait: better bait means sooner bites and rarer fish.'],
   sp:['Fish sell at the shop and count for collections','Night: Moonfish · caves: Glowfin · deep caves (35 m+): Void Eel · anywhere: the rare Golden Carp','From level 5 you can catch two fish at once'],xp:'Each fish <b>+12 XP</b> plus a quarter of its price (rarer fish give more) · junk <b>+3 XP</b>'}};
 const PAGES=[...IDS,'basics','levels','dig'],PN={basics:'Basics',levels:'Levels & shine',dig:'Where to dig'};
 let pg=null,raf=0,hinted=false;
 const B=()=>UI6.body,on=()=>UI6.on&&UI6.tab=='toolguide';
 // ---- pieces
 const bar=(p)=>'<span class="tg8bar"><i style="transform:scaleX('+Math.max(0,Math.min(1,p)).toFixed(3)+')"></i></span>';
 const chip=k=>'<span class="tg8c"><img alt="" src="'+ico(k)+'">'+esc(bn(k))+'</span>';
 function navBtn(id){const i=TOOLLV.info(id);return'<button role="tab" class="tg8t'+(pg==id?' on':'')+'" data-g="'+id+'" style="--tc:'+TOOLLV.COL[id]+'" aria-selected="'+(pg==id)+'"><img alt="" src="'+ico('w:'+id)+'"><span><b>'+esc(NM(id))+'</b><small>Lv '+i.l+(i.l>=10?' · MAX':'')+'</small>'+bar(i.l>=10?1:i.x/i.need)+'</span></button>'}
 function lvList(id){const i=TOOLLV.info(id),P=TOOLLV.PERKS[id];let h='<ol class="tg8pl">';
  for(let l=1;l<=10;l++){const st=l<=i.l?(l==i.l?'cur':'got'):l==i.l+1?'next':'',p=l==1?['Starter','Breaks its own blocks in one hit']:P[l];
   h+='<li class="'+st+'" data-tier="'+TOOLLV.TIER[l]+'"><i>'+l+'</i><div><b>'+esc(p[0])+'</b><small>'+esc(p[1])+'</small></div>'+(TOOLLV.GEMS[l]?'<em><i class="gem"></i>'+TOOLLV.GEMS[l]+'</em>':'<em></em>')+'</li>'}return h+'</ol>'}
 function toolPage(id){const d=D[id],i=TOOLLV.info(id),nx=i.next;
  return'<div class="tg8tool" style="--tc:'+TOOLLV.COL[id]+'"><div class="tg8hero"><canvas class="tg8cv" width="440" height="300" data-id="'+id+'" aria-label="'+esc(NM(id))+' with its current shine"></canvas>'
   +'<div class="tg8lv"><div class="tg8lvt"><b>Level '+i.l+'</b><span class="tg8tn" data-tier="'+i.tier+'">'+esc(i.tierName)+'</span></div>'+bar(i.l>=10?1:i.x/i.need)+'<small>'+(i.l>=10?'Max level · rainbow shine':Math.floor(i.x)+' / '+i.need+' XP · next: <b>'+esc(nx[0])+'</b> (+'+i.gemsNext+' gems)')+'</small></div>'
   +'<div class="tg8now"><h5>Right now</h5><ul>'+i.summary.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul></div></div>'
   +'<div class="tg8info"><small class="tg8k">Tool</small><h4>'+esc(TL[id].n)+'</h4><p class="tg8d">'+esc(d.role)+'</p>'
   +'<section><h5>'+(id=='bubbles'?'Catches':'Breaks in one hit')+'</h5><div class="tg8chips">'+d.best().map(chip).join('')+(id=='twiggy'?'<span class="tg8c tg8tree"><i aria-hidden="true"></i>Whole trees</span>':'')+'</div></section>'
   +'<section><h5>Slow at</h5><p>'+esc(d.slow)+'</p></section>'
   +'<section><h5>How to use</h5><ol class="tg8steps">'+d.how.map(s=>'<li>'+s+'</li>').join('')+'</ol></section>'
   +'<section><h5>Special</h5><ul class="tg8sp">'+d.sp.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul></section>'
   +'<section><h5>Earns tool XP for</h5><p>'+d.xp+'. The wrong tool earns nothing.</p></section></div></div>'
   +'<section class="tg8lvls"><h5>Levels and rewards</h5><p class="dim">Each level pays gems and adds a perk. The tool shines brighter as it climbs, and level 10 turns it rainbow.</p>'+lvList(id)+'</section>'}
 function basics(){const rows=[['Dirt · grass · sand · glass · leaves','pip'],['Stone · cobble · brick · marble · deepslate','pebble'],['Ores · crystal · gold · Crystal Geodes','glimmer'],['Trees · wood · planks · bamboo · crates','twiggy'],['Lakes and pools (fish)','bubbles']];
  return'<div class="tg8cards"><div class="tg8card"><h5>1 · Hold a tool</h5><p>Put a tool in a <b>hotbar slot (1–6)</b> and press its number, or <b>scroll the mouse wheel</b> to it. <kbd>X</kbd> swaps between your last weapon and your last tool.</p></div>'
   +'<div class="tg8card"><h5>2 · Mine</h5><p><b>Left-click</b> a block within reach. Hold the button to keep mining. The right tool breaks a block in <b>one hit</b> with its own sound: a soft crunch for dirt, a knock for wood, a crack for stone and a crystal <i>ting</i> for ore.</p></div>'
   +'<div class="tg8card"><h5>3 · Pick the right one</h5><p>The wrong tool still works but needs many slow taps, makes a dull <i>tok</i> and earns no XP. You will see “Slow — try another tool”.</p></div>'
   +'<div class="tg8card warn"><h5>Only tools break blocks</h5><p>Weapons fight; they never dig. Your fists can still open Tackle Boxes for bait. Tools never wear out or break.</p></div></div>'
   +'<section><h5>Which tool for which block?</h5><div class="tg8tbl">'+rows.map(([a,id])=>'<button class="tg8row" data-g="'+id+'" style="--tc:'+TOOLLV.COL[id]+'"><span>'+esc(a)+'</span><b><img alt="" src="'+ico('w:'+id)+'">'+esc(NM(id))+'</b></button>').join('')+'</div></section>'
   +'<section><h5>Opening this guide</h5><p>Press <kbd>G</kbd> anywhere (beside a door or object G sets that object up instead), open the hub with <kbd>C</kbd> and choose <b>Tool Guide</b>, or press <b>Tool guide</b> in your inventory.</p></section>'}
 function levels(){const sel=IDS.includes(pg)?pg:(IDS.includes(wp)?wp:'pip');let tot=0;
  let h='<section><h5>How tools level up</h5><p>Every tool goes from <b>level 1 to 10</b> by doing its own job. Glimmer learns from ores, Pebble from stone, Pip from soft blocks, Twiggy from trees, Bubbles from fish. Each level pays gems, adds a perk and makes the tool shine brighter.</p>'
   +'<ul class="tg8sp">'+IDS.map(id=>'<li><b>'+esc(NM(id))+':</b> '+D[id].xp+'</li>').join('')+'</ul></section>';
  h+='<section><h5>Shine</h5><div class="tg8shine">';const SH=[[1,'Lv 1'],[2,'Lv 2'],[3,'Lv 3–4'],[5,'Lv 5–6'],[7,'Lv 7–8'],[9,'Lv 9'],[10,'Lv 10']];
  for(const[l,t]of SH){const tr=TOOLLV.TIER[l];h+='<figure data-tier="'+tr+'"><canvas class="tg8cv sm" width="180" height="150" data-id="'+sel+'" data-tr="'+tr+'"></canvas><figcaption><b>'+esc(TOOLLV.TIERN[tr])+'</b><small>'+t+'</small></figcaption></figure>'}
  h+='</div><p class="dim">The shine shows in your hand and on the tool’s icon in the hotbar, inventory and cards. Previewing: '+esc(NM(sel))+' (pick another tool above to preview it).</p></section>';
  h+='<section><h5>XP and gems per level</h5><div class="tg8xt"><div class="hd"><span>Level</span><span>XP needed</span><span>Total XP</span><span>Gems</span><span>Shine</span></div>';
  for(let l=2;l<=10;l++){const n=TOOLLV.need(l-1);tot+=n;h+='<div data-tier="'+TOOLLV.TIER[l]+'"><span>'+(l-1)+' → '+l+'</span><span>'+n+'</span><span>'+tot+'</span><span><i class="gem"></i>'+TOOLLV.GEMS[l]+'</span><span>'+esc(TOOLLV.TIERN[TOOLLV.TIER[l]])+'</span></div>'}
  return h+'</div></section>'}
 function dig(){const BD=typeof DEPTH8!='undefined'?DEPTH8.BANDS:[];const col=i=>(BD[i]&&BD[i].c)||'#7a8aa0';
  const Z=[['Surface','0–7 m','#6fbf5a',[['pip','Dirt, grass and sand'],['twiggy','Trees for wood'],['bubbles','Lakes for fishing · Tackle Boxes on the shore for bait'],['glimmer','Copper Ore from 3 m']]],
   [BD[0]?BD[0].n:'Glowroot Hollows','8–25 m',col(0),[['pip','Buried Caches: dig them with Pip for treasure'],['glimmer','Iron Ore from 12 m'],['pebble','Stone everywhere: Pebble tunnels fast']]],
   [BD[1]?BD[1].n:'Crystal Caverns','26–45 m',col(1),[['glimmer','Ruby from 30 m, Sapphire from 38 m'],['glimmer','Crystal Geodes: 3 taps with Glimmer (2 from level 7)'],['pebble','Deepslate starts around 44 m']]],
   [BD[2]?BD[2].n:'Emberdeep','46 m +',col(2),[['glimmer','Emerald from 48 m, Diamond from 62 m'],['pebble','Deepslate: Pebble breaks it in one tap'],['bubbles','Void Eels swim in deep cave water (35 m+)']]]];
  return'<section><h5>Where to dig</h5><p class="dim">Depth is counted in blocks below the surface. Rarer ores sit deeper, and each band has its own treasures.</p><div class="tg8dig">'+Z.map(([n,d,c,L])=>'<div class="tg8z" style="--zc:'+c+'"><div class="tg8zh"><b>'+esc(n)+'</b><small>'+d+'</small></div><ul>'+L.map(([id,t])=>'<li><img alt="" src="'+ico('w:'+id)+'"><span><b>'+esc(NM(id))+'</b> '+esc(t)+'</span></li>').join('')+'</ul></div>').join('')+'</div></section>'}
 // ---- render
 function render(){const b=B();if(!b)return;if(!pg)pg=IDS.includes(wp)?wp:'basics';
  let h='<div class="tg8"><div class="tg8top"><div><small class="tg8k">Field manual</small><h3 class="tg8h">Tool Guide</h3><p class="dim">Only tools break blocks. The right tool breaks a block in one hit; the wrong one takes many slow taps.</p></div><div class="tg8key"><kbd>G</kbd><span>opens this guide</span></div></div>';
  h+='<nav class="tg8nav" role="tablist" aria-label="Tool guide pages">'+IDS.map(navBtn).join('')+'<span class="tg8sep"></span>'+['basics','levels','dig'].map(p=>'<button role="tab" class="tg8p'+(pg==p?' on':'')+'" data-g="'+p+'" aria-selected="'+(pg==p)+'">'+PN[p]+'</button>').join('')+'</nav>';
  h+='<div class="tg8pg" data-p="'+pg+'">'+(IDS.includes(pg)?toolPage(pg):pg=='basics'?basics():pg=='levels'?levels():dig())+'</div></div>';
  b.innerHTML=h;b.querySelectorAll('[data-g]').forEach(x=>x.onclick=()=>go(x.dataset.g));
  try{MOTION7.stagger(b.querySelector('.tg8pg'),'section,.tg8hero,.tg8info,.tg8card,figure,.tg8z,.tg8pl li',14)}catch(_){}loop()}
 function go(p){if(!PAGES.includes(p))return;const keep=B()?B().scrollTop:0;pg=p;render();try{UIS.play('tab')}catch(_){}const pgE=B()&&B().querySelector('.tg8pg');if(pgE){pgE.classList.add('tg8in');setTimeout(()=>pgE.classList.remove('tg8in'),500)}try{const n=B().querySelector('.tg8nav');B().scrollTop=Math.min(keep,n?n.offsetTop:0)}catch(_){}}
 // animated previews (only while visible)
 function loop(){cancelAnimationFrame(raf);const step=()=>{const b=B();if(!on()||!b){raf=0;return}const cs=b.querySelectorAll('canvas.tg8cv');if(!cs.length){raf=0;return}const t=performance.now()/1000;
   for(const c of cs){const x=c.getContext('2d'),id=c.dataset.id,tr=c.dataset.tr!=null?+c.dataset.tr:TOOLLV.tier(id),sm=c.classList.contains('sm'),w=c.width,h=c.height;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,w,h);
    const sc=sm?2.6:5.2,L=40;x.translate(w/2-L*sc*.12,h/2+L*sc*.16);x.scale(sc,sc);x.rotate(-Math.PI/4+Math.sin(t*1.6+(tr||0))*.08);x.translate(-L*.42,0);try{TOOLLV.drawTool(x,id,L,t+(tr||0)*.37,tr)}catch(_){}}
   raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)}
 // ---- hub tab + openers
 UI6.TABS.splice(Math.max(0,UI6.TABS.findIndex(t=>t[0]=='settings')),0,['toolguide','Tool Guide']);
 UI6.ext.toolguide=render;
 function open(p){if(p&&PAGES.includes(p))pg=p;try{if(typeof showInv!='undefined'&&showInv)INV7.close()}catch(_){}UI6.open('toolguide');hinted=true;try{localStorage.setItem(HK(),'1')}catch(_){}}
 function close(){if(on())UI6.close()}
 function refresh(){if(on())render()}
 addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.altKey||e.metaKey||String(e.key).toLowerCase()!='g')return;try{if(isTextEl(e.target))return}catch(_){}
  if(typeof entered=='undefined'||!entered||creatorOn||dlgOpen||menuEl.style.display!='none'||UI6.on)return;try{if(OBJ6.near())return}catch(_){}open()});
 // inventory header button (re-added whenever the inventory re-renders its sheet)
 let obs=null;function invBtn(){const s=document.querySelector('#inv7 .sheet');if(!s)return;if(!obs){obs=new MutationObserver(invBtn);obs.observe(s,{childList:true})}const hd=s.querySelector('header');if(!hd||hd.querySelector('.tg8ib'))return;
  const btn=document.createElement('button');btn.className='tg8ib';btn.type='button';btn.title='How to use every tool (G)';btn.innerHTML='<i aria-hidden="true">?</i>Tool guide';btn.onclick=e=>{e.stopPropagation();open()};const x=hd.querySelector('.x');if(x&&x.parentNode)x.parentNode.insertBefore(btn,x);else hd.appendChild(btn)}
 try{const _o=INV7.open;INV7.open=function(){const r=_o.apply(this,arguments);try{invBtn()}catch(_){}return r}}catch(_){}
 // one-time hint
 const HK=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbptgh';
 let hT=0;const hI=setInterval(()=>{try{if(hinted){clearInterval(hI);return}if(localStorage.getItem(HK())){hinted=true;clearInterval(hI);return}if(!entered||menuEl.style.display!='none'){hT=0;return}hT+=3;if(hT<15||UI6.on||showInv)return;
  hinted=true;clearInterval(hI);localStorage.setItem(HK(),'1');UI6.say6('Tool guide · press G','How each tool works · tools level up and shine as you use them',5200)}catch(_){}},3000);
 return{open,close,refresh,go,get page(){return pg},get isOpen(){return on()},D,PAGES}})();
