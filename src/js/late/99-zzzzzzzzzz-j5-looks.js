// ===== LOOKS1: exclusive looks are earned by playing. Wings, effects, companions, pets, cosmetics and sky-only weather are no longer sold; each has one
// progress goal (server/catalog.json earn {m, n, t}; the full list is docs/master-update-2/cosmetic-sources.md). Every few seconds the game reads your
// progress (level, monsters, blocks broken and placed, fish, harvests, bosses, worlds, dungeons, world bosses, achievements, classes) and claims what you
// have earned: online the server records it on your account and adds it to what you own; offline it goes straight into your collection. A look you already
// owned (bought before this update) stays yours. Each new one gets an "Earned · exclusive" card. =====
try{const LOOKS1=window.LOOKS1=(()=>{
 const K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rblooks';let seen=null;
 const load=()=>{try{seen=JSON.parse(localStorage.getItem(K())||'null')}catch(_){seen=null}};const save=()=>{try{localStorage.setItem(K(),JSON.stringify(seen))}catch(_){}};
 function mx(){const S=typeof stats!='undefined'?stats:{},o={lv:lvl|0,kill:S.kill|0,brk:S.break|0,place:S.place|0,fish:S.fish|0,harvest:S.harvest|0,boss:S.bosskills|0,worlds:S.worlds|0,dg:0,wb:0,ach:0,cls:0};
  try{o.dg=DG.LIST.filter(d=>DG.cleared(d.id)).length}catch(_){}try{const w=JSON.parse(localStorage.getItem((typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbwboss')||'null');o.wb=w&&w.w?Object.keys(w.w).length:0}catch(_){}
  try{o.ach=Object.values(achD).filter(Boolean).length}catch(_){}try{o.cls=(CJOB.S.learned||[]).length}catch(_){}return o}
 const earnable=()=>SHOP7.items.filter(i=>i.sale===0&&i.earn&&i.earn.m);
 const online=()=>{try{return NET7.online&&NET7.auth&&NET7.auth.kind!='guest'}catch(_){return false}};
 const ICON=it=>it.cat=='wings'?'wing:'+it.ref:it.cat=='cosmetics'?'cos:'+it.id:'id:'+it.id;
 const RT={common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5,exclusive:5,relic:5};
 function card(it){try{REW8.card({kind:'look',kick:'Earned · exclusive',title:it.n,sub:it.earn.t,tier:RT[it.rar]!=null?RT[it.rar]:2,icon:ICON(it),ms:4600})}catch(_){}try{say('Earned: '+it.n)}catch(_){}api.lastCard=it.id}
 // one or two at a time get their own card; more (a returning player meeting many goals at once) share one card, so nothing floods the screen
 function announce(list){if(!list.length)return;api.lastBatch=list.map(i=>i.id);if(list.length<=2){for(const it of list)card(it);return}const top=list.slice().sort((a,b)=>(RT[b.rar]||0)-(RT[a.rar]||0))[0];
  try{REW8.card({kind:'look',kick:'Earned · exclusive',title:list.length+' exclusive looks',sub:'Including '+top.n+' · see them in your Collection',tier:RT[top.rar]!=null?RT[top.rar]:2,icon:ICON(top),ms:5200})}catch(_){}try{say('You earned '+list.length+' exclusive looks')}catch(_){}api.lastCard=top.id}
 let lastSend=0,lastSig='';
 function tick(){try{if(typeof entered=='undefined'||!entered||typeof SHOP7=='undefined')return;if(!seen){load();if(!seen){seen={};for(const it of earnable())if(SHOP7.has(it.id))seen[it.id]=1;save()}}
   const m=mx(),want=[],fresh=[];for(const it of earnable()){const owned=SHOP7.has(it.id);if(owned&&!seen[it.id]){seen[it.id]=1;fresh.push(it);continue}if(!owned&&(m[it.earn.m]|0)>=it.earn.n)want.push(it)}
   if(fresh.length){save();announce(fresh)}if(!want.length)return;
   if(online()){const sig=want.map(i=>i.id).join();const now=performance.now();if(sig===lastSig&&now-lastSend<20000)return;if(now-lastSend<6000)return;lastSig=sig;lastSend=now;
    let cl='',clv=0;try{cl=CJOB.S.cur||'';clv=CLASS7.lv(cl)|0}catch(_){}NET7.send({t:'earn',ids:want.slice(0,40).map(i=>i.id),mx:m,lv:lvl|0,cls:cl,clv});return}
   for(const it of want){SHOP7.grant(it.id);seen[it.id]=1}save();announce(want)}catch(e){if(!tick.e){tick.e=1;console.error('LOOKS1',e)}}}
 setInterval(tick,3000);
 // a new account or a reload: forget the "already announced" list of the previous profile
 try{addEventListener('rbaccount',()=>{seen=null})}catch(_){}
 const api={mx,earnable,tick,announce,lastCard:'',lastBatch:[],reset(){seen=null;try{localStorage.removeItem(K())}catch(_){}}};return api})()}catch(e){console.error('LOOKS1',e)}
