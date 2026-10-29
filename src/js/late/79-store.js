// ===== STORE7: the full item store (every catalog item: browse, preview, buy, equip). Prices/ownership come from SHOP7 (server-validated when signed in). =====
const STORE7=(()=>{
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const RO={common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5,exclusive:6};
 const COLL=[['Void Collection','Dark violet power',['wpn_void','fx_aura_void','fx_wt_void','fx_skin_obsidian','wing_umbral']],['Blossom Collection','Soft pink spring',['wing_blossom','fx_aura_blossom','fx_spawn_bloom','fx_wt_rose','fx_skin_sakura','obj_39','charm_leaf']],['Astral Collection','Stars and moonlight',['wpn_astralkat','fx_aura_astral','wing_galaxy','obj_41','charm_moon','charm_star']],['Ember & Frost','Fire against ice',['wpn_solarfang','fx_aura_solar','fx_trail_ember','wpn_frostbite','fx_aura_frost','fx_wt_azure']]];
 const FX_COL={aura_void:['#6a2cc8','#e0c8ff','rise'],aura_solar:['#ffd24a','#fff4c4','orbit'],aura_blossom:['#ffb0cf','#fff0f6','fall'],aura_frost:['#bfe8ff','#ffffff','fall'],aura_astral:['#9fe0ff','#ffffff','orbit'],trail_ember:['#ff8a2a','#ffd24a','stream'],trail_neon:['#3ff3ff','#ff5ae8','stream'],trail_crow:['#14101e','#8a6bff','stream'],spawn_chains:['#c9b8ff','#ffffff','burst'],spawn_bloom:['#ffb0cf','#fff0f6','burst'],vic_nova:['#ffe9a0','#9fe0ff','burst'],wt_rose:['#ff7fb0','#ffd0e4','arc'],wt_azure:['#4fb4ff','#d0ecff','arc'],wt_void:['#8a4cff','#e0c8ff','arc'],skin_obsidian:['#2a2238','#7a5cff','arc'],skin_pearl:['#f2eeff','#ffffff','arc'],skin_sakura:['#ffaac8','#fff0f6','arc']};
 const WX_COL={39:['#40204a','#ff9cc8','petal'],40:['#050a24','#9fc8ff','star'],41:['#1a0a40','#ff7fe0','star'],85:['#3a8fe8','#ffd84a','petal'],86:['#4a1846','#ff9a7a','petal'],87:['#1a2366','#ffb07a','star'],88:['#120a2a','#ff4fd8','star'],89:['#02101f','#4dffb0','star']};
 let el=null,cat='featured',q='',sort='feat',rar='all',ownedOnly=0,selId=null,pv=null,raf=0,parts=[],fxLast=0,busy=0;
 const st=()=>({gems:gems|0});
 const cache={};let missing=0;function thumb(it){if(cache[it.id])return cache[it.id];let u='';missing=0;try{const z=it.cat=='gear'?2:1,c=document.createElement('canvas');c.width=132*z;c.height=106*z;const x=c.getContext('2d');drawPrev(x,it,132*z,106*z,.8,.45,true);u=c.toDataURL()}catch(_){}if(missing)return u;return cache[it.id]=u}
 function silhouette(x,cx,cy,s){x.save();x.translate(cx,cy);x.scale(s,s);x.fillStyle='rgba(70,60,110,.55)';x.beginPath();x.arc(0,-34,11,0,6.3);x.fill();x.beginPath();x.moveTo(-13,-20);x.lineTo(13,-20);x.lineTo(10,22);x.lineTo(-10,22);x.closePath();x.fill();x.fillRect(-9,22,7,26);x.fillRect(2,22,7,26);x.restore()}
 function sparkle(x,px,py,c,r,a){x.save();x.globalCompositeOperation='lighter';x.globalAlpha=a;x.fillStyle=c;x.beginPath();x.arc(px,py,r,0,6.3);x.fill();x.restore()}
 function drawPrev(x,it,W,H,t,sc,still){x.clearRect(0,0,W,H);const k=W/300,cx=W/2,cy=H*.58;const ref=it.ref;
  const z=still?1.35:1; // card thumbnails show weapons and wings larger so their silhouettes read at a glance
  try{
  if(it.cat=='weapons'){x.save();x.translate(cx,cy+8*k);x.scale(k*1.25*z,k*1.25*z);const a=still?-.9:-1.1+Math.sin(t*2.4)*.7;x.rotate(a);x.translate(-30,0);const w=WPN[ref];
   if(w){x.save();x.globalCompositeOperation='lighter';x.strokeStyle='rgba('+w.g+',.35)';x.lineWidth=14;x.beginPath();x.arc(30,0,70,-.2,-.2-(still?1.2:Math.max(0,Math.cos(t*2.4))*1.6),true);x.stroke();x.restore()}
   drawWeapon(x,ref,96,t);x.restore()}
  else if(it.cat=='wings'){const s2=k*.72*z;silhouette(x,cx,cy+(z-1)*30*k,k*1.1*z);const i=WINGS.findIndex(w=>w.id==ref);x.save();x.scale(s2,s2);if(i>=0)WingArt.draw(x,i,cx/s2,(cy-10*k+(z-1)*30*k)/s2,1,t,0,0,0,1);x.restore();
   if(!still){const W2=WINGS[i];if(W2&&W2.fxk&&Math.random()<.5)parts.push({x:cx+(Math.random()-.5)*170*k,y:cy-30*k+Math.random()*70*k,vx:(Math.random()-.5)*8,vy:W2.fxk=='petals'?26:-22,l:1.3,c:W2.pal[3],r:2.2})}}
  else if(it.cat=='charms'){silhouette(x,cx,cy,k*1.1);x.save();x.scale(k*1.6,k*1.6);if(ref=='raven'){x.translate(cx/k/1.6-(P.x-cam.x)+30,cy/k/1.6-(P.y-cam.y)-50)}else x.translate(cx/k/1.6,(cy-30*k)/k/1.6);FX7.charmDraw(x,ref,0,0,t,1);x.restore()}
  else if(it.cat=='effects'){const f=FX_COL[ref]||['#fff','#fff','rise'];silhouette(x,cx,cy,k*1.1);const sub=it.sub;
   if(sub=='aura'||sub=='spawn'||sub=='victory'||sub=='trail'||still){x.save();x.globalCompositeOperation='lighter';const g=x.createRadialGradient(cx,cy+40*k,2,cx,cy+40*k,70*k);g.addColorStop(0,f[0]+'aa');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H);x.restore()}
   if(sub=='wtrail'||sub=='wskin'){x.save();x.translate(cx,cy);x.scale(k*1.1,k*1.1);const a=still?-1:-1.1+Math.sin(t*2.4)*.7;x.globalCompositeOperation='lighter';x.strokeStyle=f[0];x.lineWidth=12;x.beginPath();x.arc(0,0,76,a-1.1,a);x.stroke();x.strokeStyle=f[1];x.lineWidth=4;x.stroke();x.globalCompositeOperation='source-over';x.rotate(a);x.fillStyle=sub=='wskin'?f[0]:'#c8d0dc';x.strokeStyle=sub=='wskin'?f[1]:'#000';x.lineWidth=2;x.beginPath();x.moveTo(0,-4);x.lineTo(76,-2);x.lineTo(84,0);x.lineTo(76,2);x.lineTo(0,4);x.closePath();x.fill();x.stroke();x.restore()}
   else if(!still&&Math.random()<.8){const m=f[2];const n=m=='burst'?3:1;for(let i=0;i<n;i++){const a=Math.random()*6.28;parts.push(m=='orbit'?{x:cx+Math.cos(t*2.2+i)*50*k,y:cy+10*k+Math.sin(t*2.2+i)*14*k,vx:0,vy:-14,l:1,c:f[i%2],r:2}:m=='fall'?{x:cx+(Math.random()-.5)*110*k,y:cy-60*k,vx:(Math.random()-.5)*10,vy:30,l:1.6,c:f[i%2],r:2.4}:m=='burst'?{x:cx,y:cy,vx:Math.cos(a)*90,vy:Math.sin(a)*90,l:.9,c:f[i%2],r:2.4}:m=='stream'?{x:cx-20*k,y:cy+Math.random()*40*k,vx:-70,vy:0,l:.7,c:f[i%2],r:3}:{x:cx+(Math.random()-.5)*50*k,y:cy+44*k,vx:(Math.random()-.5)*10,vy:-34,l:1.3,c:f[i%2],r:2.6})}}
   else if(still){for(let i=0;i<8;i++)sparkle(x,cx+Math.cos(i*.9)*(40+i*5)*k,cy+Math.sin(i*1.3)*40*k,f[i%2],2.4,.8)}}
  else if(it.cat=='weather'){const c=WX_COL[ref]||['#222','#fff','star'];const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,c[0]);g.addColorStop(1,c[1]+'66');x.fillStyle=g;x.fillRect(0,0,W,H);
   if(still)for(let i=0;i<24;i++)sparkle(x,(i*53)%W,(i*37)%H,c[1],1.6+(i%3)*.6,.7);else if(Math.random()<.7)parts.push(c[2]=='petal'?{x:Math.random()*W,y:-4,vx:12,vy:26+Math.random()*20,l:H/30,c:c[1],r:3}:{x:Math.random()*W,y:Math.random()*H,vx:0,vy:0,l:1.6,c:c[1],r:1.8});
   x.save();x.translate(cx,H*.72);x.fillStyle='#2a2f44';x.strokeStyle='#000';x.lineWidth=2;x.fillRect(-26,-18,52,36);x.strokeRect(-26,-18,52,36);x.fillStyle=c[1];x.beginPath();x.arc(0,-2,10,0,6.3);x.fill();x.restore()}
  else if(it.cat=='gear'&&still&&typeof GEAR7!='undefined'&&typeof WEAR!='undefined'&&WEAR[ref]){const s=Math.min(W,H)*1.02;x.save();x.translate(cx-s/2,H/2-s/2);GEAR7.icon(x,ref,s);x.restore()} // card art: the gear itself, no plate-in-a-card
  else if(it.cat=='gear'&&!still&&typeof WEAR!='undefined'&&WEAR[ref]&&typeof AC6!='undefined'){ // live try-on: your character wearing this piece over your current gear
   const sl=WEAR[ref].s,wr=Object.assign({},typeof wear!='undefined'?wear:{},{wing:''});wr[sl]=ref;const s=k*(sl=='hat'?3.6:2.75);x.save();x.translate(cx,sl=='hat'?H*1.3:H*.93);x.scale(s,s);x.beginPath();x.rect(-70,-91,140,100);x.clip();
   const o=g;g=x;try{AC6.draw(0,-54,1,0,'',t,0,false,'',typeof wp!='undefined'?wp:'fist',0,0,wr,false,typeof look!='undefined'?look:null,null)}finally{g=o}x.restore()}
  else{let u=null;const key=it.cat=='gear'?'a:'+ref:it.cat=='seeds'?+ref:+ref;try{u=iconURL(key)}catch(_){}
   if(u){let im=cache['i'+key];if(!im){im=cache['i'+key]=new Image();im.onload=()=>{try{delete cache[it.id];if(isOpen())render()}catch(_){}};im.src=u}if(!im.complete)missing=1;const s=Math.min(W,H)*.62,by=still?0:Math.sin(t*2)*4;if(im.complete)x.drawImage(im,cx-s/2,cy-s*.65+by,s,s)}}
  }catch(e){}
  if(!still){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.l-=.016;if(p.l<=0||parts.length>160){parts.splice(i,1);continue}p.x+=p.vx*.016;p.y+=p.vy*.016;sparkle(x,p.x,p.y,p.c,p.r,Math.min(1,p.l*2))}}}
 // ---- state helpers
 const has=it=>SHOP7.has(it.id),cnt=it=>SHOP7.count(it.id),eqd=it=>SHOP7.equipped(it.id),equipable=it=>!!SHOP7.slotOf(it);
 const stateOf=it=>it.stack?(cnt(it)>0?'Owned x'+cnt(it):''):eqd(it)?'EQUIPPED':has(it)?'OWNED':'';
 function list(){let L=SHOP7.items.slice();
  if(cat=='featured')L=L.filter(i=>i.feat||i.new&&!i.legacy&&i.cat!='gear'&&0);else if(cat!='all')L=L.filter(i=>i.cat==cat);
  if(q){const s=q.toLowerCase();L=L.filter(i=>(i.n+' '+i.d+' '+i.cat+' '+i.rar+' '+(i.sub||'')).toLowerCase().includes(s))}
  if(rar!='all')L=L.filter(i=>i.rar==rar);if(ownedOnly)L=L.filter(has);
  const cmp={feat:(a,b)=>(b.feat|0)-(a.feat|0)||(b.new|0)-(a.new|0)||a.price-b.price,pa:(a,b)=>a.price-b.price,pd:(a,b)=>b.price-a.price,rar:(a,b)=>RO[b.rar]-RO[a.rar]||a.price-b.price,name:(a,b)=>a.n.localeCompare(b.n),neu:(a,b)=>(b.new|0)-(a.new|0)||a.price-b.price}[sort];L.sort(cmp);return L}
 function card(it){const s=stateOf(it),b=eqd(it)?'<span class="badge eq">EQUIPPED</span>':!it.stack&&has(it)?'<span class="badge own">OWNED</span>':SHOP7.isNew(it.id)?'<span class="badge new">NEW</span>':'';
  const lk=!SHOP7.lvOk(it);return'<button class="card'+(selId==it.id?' sel':'')+(lk?' lock':'')+'" data-id="'+it.id+'" data-rar="'+it.rar+'" data-cat="'+it.cat+'" aria-label="'+esc(it.n)+', '+it.rar+', '+it.price+' gems">'+b+'<img alt="" src="'+thumb(it)+'"><b>'+esc(it.n)+'</b><span class="rtag">'+esc(SHOP7.RN[it.rar])+'</span><span class="pr"><span><i class="gem"></i>'+it.price+'</span>'+(lk?'<small>Lv '+it.lv+'</small>':s&&!it.stack?'<small>✓</small>':'')+'</span></button>'}
 let lastKey='';
 function render(){if(!el)return;MOTION7.tick(el.querySelector('#s7g'),gems|0);el.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.c==cat));try{MOTION7.ind(el.querySelector('nav'),'button.on','v')}catch(_){}
  const key=cat+'|'+sort+'|'+rar+'|'+ownedOnly,anim=key!=lastKey;lastKey=key; // cards cascade in when the shelf changes, not on every refresh
  const g=el.querySelector('.grid');let h='';
  if(cat=='featured'&&!q&&rar=='all'&&!ownedOnly){h+='<h4>Featured</h4><div class="cards">'+list().map(card).join('')+'</div>';for(const[n,sub,ids]of COLL){const its=ids.map(i=>SHOP7.byId.get(i)).filter(Boolean);if(its.length)h+='<h4>'+esc(n)+' · '+esc(sub)+'</h4><div class="cards">'+its.map(card).join('')+'</div>'}}
  else{const L=list();h+=L.length?'<div class="cards">'+L.map(card).join('')+'</div>':'<div class="empty">Nothing matches. Try a different search or filter.</div>'}
  if(!anim)MOTION7.still(g);g.innerHTML=h;if(anim){g.scrollTop=0;MOTION7.stagger(g,'.card,h4',16)}g.querySelectorAll('.card').forEach(c=>c.onclick=()=>select(c.dataset.id));renderDetail()}
 function renderDetail(){const a=el.querySelector('aside');const it=selId&&SHOP7.byId.get(selId);if(!it){a.innerHTML='<h3>Pick an item</h3><p>Select anything to see a live preview, what it does, and how to get it.</p>';pv=null;return}
  const owned=!it.stack&&has(it),lk=!SHOP7.lvOk(it),can=gems>=it.price;let btn='';
  if(owned){btn=equipable(it)?(eqd(it)?'<button data-a="un">Unequip</button>':'<button class="pri" data-a="eq">Equip</button>'):'<button disabled>Owned</button>'}
  else if(lk)btn='<button disabled>Requires level '+it.lv+'</button>';
  else btn=(it.stack?'<span class="qty"><input id="s7q" type="number" min="1" max="99" value="1" aria-label="Quantity"></span>':'')+'<button class="pri" data-a="buy"'+(can?'':' disabled')+'>'+(can?'Buy · '+it.price+' gems':'Need '+(it.price-gems)+' more gems')+'</button>';
  a.dataset.cat=it.cat;a.innerHTML='<canvas id="s7pv" width="300" height="255"></canvas><div><span class="rtag" data-rar="'+it.rar+'">'+esc(SHOP7.RN[it.rar])+' · '+esc(it.cat)+(it.sub?' · '+esc(it.sub):'')+'</span><h3>'+esc(it.n)+'</h3></div><p>'+esc(it.d)+'</p>'+(it.lv?'<p>Level required: <b>'+it.lv+'</b></p>':'')+(it.stack?'<p>You have: <b>'+cnt(it)+'</b></p>':'')+'<div class="acts">'+btn+'</div><small id="s7m" role="status" style="color:var(--muted)"></small>';
  pv=a.querySelector('#s7pv');parts.length=0;a.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>act(b.dataset.a))}
 function select(id){selId=id;SHOP7.markSeen(id);try{UIS.play('select')}catch(_){}render()}
 const msg=t=>{const m=el&&el.querySelector('#s7m');if(m)m.textContent=t;else try{say(t)}catch(_){}};
 async function act(a){const it=SHOP7.byId.get(selId);if(!it||busy)return;
  if(a=='eq'){if(SHOP7.equip(it.id))msg(it.n+' equipped');render();return}
  if(a=='un'){SHOP7.unequip(it.id);render();return}
  if(a=='buy'){const qEl=el.querySelector('#s7q'),qty=it.stack?Math.max(1,Math.min(99,(qEl&&+qEl.value)|0||1)):1,total=it.price*qty;
   if(total>=500||qty>1){const ok=await DLG7.confirm('Buy '+it.n+(qty>1?' x'+qty:'')+'?','This costs '+total+' gems. You have '+(gems|0)+'.','Buy for '+total);if(!ok)return}
   busy=1;const r=await SHOP7.buy(it.id,qty);busy=0;msg(r.m);if(r.ok){try{VFX.add(1,'#ffe9a0',P.x,P.y,0,-30,1,14,2)}catch(_){}if(SHOP7.slotOf(it)&&!it.stack)msg(r.m+' — press Equip to use it.')}render()}}
 function mk(){if(el)return;el=document.createElement('div');el.id='store7';el.innerHTML='<div class="shell" role="dialog" aria-modal="true" aria-label="Item store"><header><h2>STORE</h2><span class="gv"><i class="gem"></i><b id="s7g">0</b></span><button class="x" aria-label="Close store">✕</button></header>'
  +'<div class="bar"><input id="s7s" type="search" placeholder="Search items" aria-label="Search items"><select id="s7r" aria-label="Rarity"><option value="all">All rarities</option>'+SHOP7.RAR.slice(0,6).map(r=>'<option value="'+r+'">'+SHOP7.RN[r]+'</option>').join('')+'</select><select id="s7o" aria-label="Sort"><option value="feat">Featured</option><option value="pa">Price: low to high</option><option value="pd">Price: high to low</option><option value="rar">Rarity</option><option value="name">Name</option><option value="neu">Newest</option></select><button class="chip" id="s7w">Owned only</button></div>'
  +'<div class="main"><nav>'+[['featured','Featured']].concat(SHOP7.CATS.slice(1)).map(c=>'<button data-c="'+c[0]+'">'+c[1]+'</button>').join('')+'<button data-c="all">All items</button></nav><div class="grid"></div><aside></aside></div></div>';
  document.body.appendChild(el);
  el.querySelector('.x').onclick=close;el.addEventListener('mousedown',e=>{if(e.target===el)close()});
  el.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{cat=b.dataset.c;render()});
  el.querySelector('#s7s').oninput=e=>{q=e.target.value.trim();render()};el.querySelector('#s7r').onchange=e=>{rar=e.target.value;render()};el.querySelector('#s7o').onchange=e=>{sort=e.target.value;render()};el.querySelector('#s7w').onclick=e=>{ownedOnly^=1;e.target.classList.toggle('on',!!ownedOnly);render()};
  addEventListener('keydown',e=>{if(el.style.display!='none'&&el.style.display&&e.key=='Escape'&&!DLG7.isOpen){e.stopPropagation();close()}},true)}
 const isOpen=()=>!!el&&el.style.display=='flex';
 function loop(){if(!isOpen()){raf=0;return}const t=performance.now()/1000;if(pv&&selId){const it=SHOP7.byId.get(selId);if(it)drawPrev(pv.getContext('2d'),it,300,255,t,1,false)}raf=requestAnimationFrame(loop)}
 function open(o){mk();lastKey='';if(o&&o.cat)cat=o.cat;if(o&&o.item){const it=SHOP7.byId.get(o.item);if(it){cat='all';selId=it.id}}el.style.display='flex';requestAnimationFrame(()=>el.classList.add('on'));render();try{UIS.play('open')}catch(_){}if(!raf)raf=requestAnimationFrame(loop);try{keys&&Object.keys(keys).forEach(k=>keys[k]=0)}catch(_){}}
 function close(){if(!el)return;el.classList.remove('on');try{UIS.play('close')}catch(_){}setTimeout(()=>{if(!el.classList.contains('on'))el.style.display='none'},200)}
 function btn(){if(document.getElementById('bstore'))return;const hr=document.getElementById('hudR');if(!hr)return;const b=document.createElement('button');b.id='bstore';b.className='pn';b.textContent='STORE';b.title='Open the item store';b.onclick=()=>isOpen()?close():open();hr.insertBefore(b,hr.firstChild)}
 btn();if(document.readyState!='complete')addEventListener('load',btn);
 return{open,close,get isOpen(){return isOpen()},list,select,act,render,drawPrev,flush(){for(const k in cache)delete cache[k];if(isOpen())render()},get selected(){return selId},setFilter(o){if(o.cat)cat=o.cat;if(o.q!=null)q=o.q;if(o.sort)sort=o.sort;if(o.rar)rar=o.rar;if('owned'in o)ownedOnly=o.owned?1:0;render()}}})();
