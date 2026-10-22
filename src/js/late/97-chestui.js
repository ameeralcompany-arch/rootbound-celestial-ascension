// ===== V6 chest UI: two panes (chest | your backpack), click to move, clear hints, closes when you walk away =====
const CHEST6=(()=>{let el=null,K=-1;const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const mk=()=>{if(!el){el=document.createElement('div');el.id='chestui';document.body.appendChild(el);el.addEventListener('click',onClick);el.addEventListener('contextmenu',e=>{const b=e.target.closest('[data-m]');if(b){e.preventDefault();act(b,true)}})}};
 const icon=i=>{try{return '<img src="'+iconURL(i)+'" width="34" height="34" style="image-rendering:pixelated">'}catch(_){return '<span style="font-size:20px">▣</span>'}};
 const can=o=>OBJ6.canUse(o,myId)||!meta;
 const slot=(i,n,mode,empty)=>empty?'<div class="cs e"></div>':'<button class="cs" data-m="'+mode+'" data-i="'+i+'" data-n="'+n+'" title="'+esc(OBJ6.itemName(i))+'">'+icon(i)+'<b>'+n+'</b><small>'+esc(OBJ6.itemName(i))+'</small></button>';
 function render(){const o=OBJ[K];if(!o||!el)return close();const c=o.c,items=c.it,allowTake=can(o),allowPut=!meta||OBJ6.roleOf(myId)>=(c.dp|0);
  let left='';for(let s=0;s<12;s++)left+=items[s]?slot(items[s][0],items[s][1],'take'):slot(0,0,'',1);
  const bag=Object.keys(inv).map(Number).filter(k=>cnt(k)>0&&(MAT[k]||BLK[k%100]||BLK[k])&&!(k==17)).sort((a,b)=>a-b);
  const right=bag.length?bag.map(k=>slot(k,cnt(k),'put')).join(''):'<div class="hint2">Your backpack is empty.</div>';
  const mine=OBJ6.canConfig(myId);
  el.innerHTML='<div class="ch"><div><b>'+esc(c.nm||'Chest')+'</b> <small>'+items.length+'/12 slots'+(allowTake?'':' · view only')+(allowPut?'':' · you may not store here')+'</small></div><button class="x" data-a="close" title="Close (Esc)">✕</button></div>'
   +'<div class="cols"><div><h5>In the chest</h5><div class="grid">'+left+'</div></div><div><h5>Your backpack</h5><div class="grid bag">'+right+'</div></div></div>'
   +'<div class="hint2">Click an item to move <b>1</b> · <b>Shift</b> or <b>right-click</b> moves the <b>whole stack</b></div>'
   +'<div class="bt"><button data-a="takeall"'+(allowTake&&items.length?'':' disabled')+'>Take all</button><button data-a="stack"'+(allowPut&&items.length?'':' disabled')+'>Stack matching items</button>'+(mine?'<button data-a="cfg">⚙ Settings</button>':'')+'<button data-a="close">Close</button></div>';el.style.display='block'}
 function open(k){mk();K=k;OBJ[k]._open=1;render()}
 function close(){if(OBJ[K])OBJ[K]._open=0;K=-1;if(el)el.style.display='none'}
 function act(b,all){const mode=b.dataset.m,i=+b.dataset.i,n=+b.dataset.n,o=OBJ[K];if(!o)return;if(mode=='take'&&!can(o)){say('You are not allowed to take from this');return}
  OBJ6.chestOp(K,mode,i,all?n:1);if(!rm||rm.isHost)render()}
 function onClick(e){const b=e.target.closest('[data-m]');if(b){act(b,e.shiftKey);return}const a=e.target.closest('[data-a]');if(!a)return;const o=OBJ[K];
  if(a.dataset.a=='close')close();
  else if(a.dataset.a=='takeall'&&o){for(const [i,n] of o.c.it.slice())OBJ6.chestOp(K,'take',i,n);if(!rm||rm.isHost)render()}
  else if(a.dataset.a=='stack'&&o){for(const [i] of o.c.it.slice())if(cnt(i)>0)OBJ6.chestOp(K,'put',i,cnt(i));if(!rm||rm.isHost)render()}
  else if(a.dataset.a=='cfg'){const k=K;close();DOORS6.config(k,false)}}
 addEventListener('keydown',e=>{if(K>=0&&e.key=='Escape'){close();e.stopPropagation()}},true);
 const _t=OBJ6.tick;OBJ6.tick=function(dt){_t(dt);if(K>=0){const o=OBJ[K];if(!o){close();return}const x=K%W*T+T/2,y=(K/W|0)*T+T/2;if(Math.abs(P.x-x)>T*3.2||Math.abs(P.y+P.h/2-y)>T*3.2)close()}};
 UI6.chestRefresh=()=>{if(K>=0)render()};
 return{open,close,render,get k(){return K}}})();
