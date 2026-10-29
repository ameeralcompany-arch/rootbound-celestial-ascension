// ===== V6 crafting (data-driven, discovery, timed, validated) + extra persistent state X6 (key rbc2, account-namespaced) =====
const X6={disc:{},q:null,friends:[],mute:[],emotes:1,sfx:1,seen:{},log:[],sc:{act:0,looks:[],fav:{},gal:'chars'},wx:{}};
function x6Load(){let o=null;try{o=JSON.parse(localStorage.getItem('rbc2')||'null')}catch(_){}if(!o||typeof o!='object')return;
 if(o.disc&&typeof o.disc=='object')for(const k of Object.keys(o.disc).slice(0,100))if(o.disc[k]===1)X6.disc[k.slice(0,24)]=1;
 const q=o.q;if(q&&typeof q=='object'&&typeof q.r=='string'&&Number.isFinite(+q.end)&&Number.isFinite(+q.n))X6.q={r:q.r.slice(0,24),end:+q.end,n:Math.max(1,Math.min(99,q.n|0))};
 const sl=(a,n,m)=>Array.isArray(a)?a.filter(x=>typeof x=='string').map(x=>x.slice(0,m)).slice(0,n):[];X6.friends=sl(o.friends,100,40);X6.mute=sl(o.mute,200,40);X6.emotes=o.emotes==0?0:1;X6.sfx=o.sfx==0?0:1;try{const c=o.sc||{};X6.sc.act=Math.max(0,Math.min(5,c.act|0));X6.sc.looks=Array.isArray(c.looks)?c.looks.slice(0,6).map(l=>l&&typeof l=='object'?sanAp(l):null):[];X6.sc.fav={};if(c.fav&&typeof c.fav=='object')for(const k of Object.keys(c.fav).slice(0,6))if(/^[0-5]$/.test(k)&&c.fav[k])X6.sc.fav[k]=1;X6.sc.gal=c.gal=='wings'?'wings':'chars'}catch(_){}try{X6.wx={};if(o.wx&&typeof o.wx=='object')for(const k of Object.keys(o.wx).slice(0,60))if(/^[a-z0-9_-]{1,16}$/.test(k)&&['blossom','space','galaxy'].includes(o.wx[k]))X6.wx[k]=o.wx[k]}catch(_){}}
function x6Save(){try{localStorage.setItem('rbc2',JSON.stringify({disc:X6.disc,q:X6.q,friends:X6.friends,mute:X6.mute,emotes:X6.emotes,sfx:X6.sfx,sc:X6.sc,wx:X6.wx}))}catch(_){}}
x6Load();
const RECIPES=[
 {id:'glass',n:'Glass',out:[6,2],in:[[8,2]],secs:4,lv:1},
 {id:'brick',n:'Bricks',out:[7,2],in:[[1,2],[11,1]],secs:5,lv:2},
 {id:'marble',n:'Marble',out:[12,2],in:[[3,2],[8,1]],secs:6,lv:3},
 {id:'lamp',n:'Lantern',out:[29,1],in:[[6,1],[10,1]],secs:8,lv:4},
 {id:'chest',n:'Treasure Chest',out:[27,1],in:[[5,6],[10,1]],secs:10,lv:3},
 {id:'door',n:'Oak Door',out:[20,1],in:[[5,5]],secs:6,lv:2},
 {id:'crystal',n:'Crystal',out:[9,1],in:[[6,3],[202,1]],secs:12,lv:6},
 {id:'shard',n:'Star Shard',out:[231,1],in:[[207,2],[209,1]],secs:20,lv:12},
 {id:'key',n:'Gate Key',out:[230,1],in:[[10,2],[9,1]],secs:15,lv:5},
 {id:'portal',n:'Magic Portal',out:[23,1],in:[[9,3],[231,1]],secs:30,lv:14}];
const recipeById=id=>RECIPES.find(r=>r.id==id);
const CRAFT6=(()=>{let el=null,open=false;
 const mk=()=>{if(!el){el=document.createElement('div');el.id='craftui';el.className='objpanel';document.body.appendChild(el)}};
 const nm=i=>OBJ6.itemName(i);
 const has=r=>r.in.every(([i,n])=>cnt(i)>=n);
 const known=r=>{if(X6.disc[r.id])return true;if(r.in.every(([i])=>cnt(i)>0||X6.seen[i])){X6.disc[r.id]=1;x6Save();return true}return false};
 function canStation(){const n=OBJ6.near();return !!(n&&ODEF[n.o.t].cat=='station')}
 function start(id,times){const r=recipeById(id);if(!r)return;if(X6.q){say('Already crafting something');return}if(lvl<r.lv){say('Requires level '+r.lv);return}if(!canStation()){say('Stand next to a Crafting Table');return}times=Math.max(1,Math.min(10,times|0));
  for(const [i,n] of r.in)if(cnt(i)<n*times){say('Missing '+nm(i));OBJ6.sfx('bad');return}
  for(const [i,n] of r.in)addI(i,-n*times);X6.q={r:id,end:Date.now()+r.secs*1000*times,n:times};x6Save();OBJ6.sfx('craft');say('Crafting '+times+'x '+r.n+'...');render()}
 function collect(){const q=X6.q;if(!q)return;const r=recipeById(q.r);if(!r){X6.q=null;x6Save();return}if(Date.now()<q.end)return;addI(r.out[0],r.out[1]*q.n);X6.q=null;x6Save();say('Crafted '+r.out[1]*q.n+' x '+nm(r.out[0]));OBJ6.sfx('ok');try{VFX.burst(P.x,P.y,['#ffd36a','#fff'],14,160,1,.7,10)}catch(_){}render()}
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),ic=i=>{try{return iconURL(i)}catch(_){return''}};
 const out=(i,n)=>'<span class="out7"'+ITEM7.attrs(i)+'><img src="'+ic(i)+'" alt=""><b>'+n+'</b></span>';
 // recipe card: output tile, name + time, actions, then ingredient chips (✓ / ✗ as well as colour)
 function render(){if(!open)return;mk();let h='<h3>Crafting Table</h3><div class="sub7">Recipes reveal themselves once you have held every material. Crafts keep running while you are away.</div>';const q=X6.q;
  if(q){const r=recipeById(q.r),left=Math.max(0,q.end-Date.now()),tot=Math.max(1,r.secs*1000*q.n),pct=Math.max(0,Math.min(100,100-left/tot*100));h+='<div class="cq">'+out(r.out[0],r.out[1]*q.n)+'<div style="flex:1;min-width:0"><b>'+(left>0?'Crafting '+q.n+'× '+esc(r.n):q.n+'× '+esc(r.n)+' is ready')+'</b><small style="display:block;color:var(--muted);margin:2px 0 6px">'+(left>0?Math.ceil(left/1000)+'s left · keeps going if you leave':'Collect it to add it to your backpack')+'</small><div class="pg7"><i style="width:'+pct+'%"></i></div></div>'+(left>0?'':'<button class="pri" data-c="collect">Collect</button>')+'</div>'}
  for(const r of RECIPES){if(!known(r)){h+='<div class="rc unk">Undiscovered recipe · gather the right materials to reveal it</div>';continue}
   const ok=has(r)&&lvl>=r.lv&&!q,ok5=ok&&r.in.every(([i,n])=>cnt(i)>=n*5);
   h+='<div class="rc rc7">'+out(r.out[0],r.out[1])+'<div class="nm7"><b>'+esc(nm(r.out[0]))+'</b><small>'+r.secs+'s · '+(lvl<r.lv?'needs level '+r.lv:'level '+r.lv)+'</small></div><div class="go7"><button class="pri" data-c="make:'+r.id+':1"'+(ok?'':' disabled')+'>Craft</button><button data-c="make:'+r.id+':5"'+(ok5?'':' disabled')+' title="Craft five">×5</button></div>'
    +'<div class="ings7">'+r.in.map(([i,n])=>'<span class="ing7 '+(cnt(i)>=n?'ok':'no')+'"><img src="'+ic(i)+'" alt="">'+n+'× '+esc(nm(i))+' <em>('+cnt(i)+')</em></span>').join('')+'</div></div>'}
  h+='<div class="row"><button data-c="close">Close</button></div>';el.innerHTML=h;el.style.display='block'}
 function openUI(){mk();clearTimeout(close.t);el.classList.remove('out');open=true;for(const k of Object.keys(inv))if(cnt(+k)>0)X6.seen[k]=1;render();try{MOTION7.stagger(el,'.rc,.cq',10)}catch(_){}}
 function close(){open=false;if(!el)return;el.classList.add('out');clearTimeout(close.t);close.t=setTimeout(()=>{el.classList.remove('out');if(!open)el.style.display='none'},MOTION7.reduce()?0:150)}
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#craftui [data-c]');if(!b)return;const a=b.dataset.c.split(':');if(a[0]=='close')close();else if(a[0]=='collect')collect();else if(a[0]=='make')start(a[1],+a[2])});
 addEventListener('keydown',e=>{if(open&&e.key=='Escape')close()});
 let acc=0;function tick(dt){acc+=dt;if(acc<1)return;acc=0;if(open){if(!canStation()&&!(X6.q&&Date.now()>=X6.q.end))close();else render()}
  if(X6.q&&Date.now()>=X6.q.end&&!X6.notified){X6.notified=1;say('Your craft is ready at a Crafting Table')}if(!X6.q)X6.notified=0}
 return{open:openUI,close,start,collect,tick,recipeById,has,get isOpen(){return open}}})();
const _t93=OBJ6.tick;OBJ6.tick=function(dt){_t93(dt);try{CRAFT6.tick(dt)}catch(_){}};
