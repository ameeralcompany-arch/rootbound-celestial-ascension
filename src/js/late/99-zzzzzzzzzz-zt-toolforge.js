// ===== TFORGE: the Tool Forge. Using a tool fills its bar (TOOLLV); a full bar is "ready to forge", and forging to the next level costs gems plus the
// tool's own materials, rarer at each step, with Monster Cores, Dungeon Essence, Tempering Oil and a Masterwork Component near the top. Online the server
// checks and charges it (server/toolforge.js, the same table; a retried request is charged once); offline the same price comes off your bag.
// A success plays a short anvil moment (three soft strikes, sparks, a bloom) before the level-up celebration. The forge lives in the Tool Guide (G),
// under each tool's level bar, and a card says when a tool is ready. =====
try{const TFORGE=window.TFORGE=(()=>{
 const NAT={pip:[1,8,250,260,265],pebble:[3,77,262,263,264],glimmer:[71,72,73,75,76],twiggy:[5,260,706,261,265],bubbles:[240,242,244,246,248]};
 const RECIPE={2:[60,[[0,30]],[]],3:[120,[[0,60]],[]],4:[220,[[0,40],[1,10]],[]],5:[350,[[1,20]],[[701,4]]],6:[550,[[1,30],[2,8]],[[701,8]]],
  7:[800,[[2,14]],[[702,3]]],8:[1200,[[2,20],[3,6]],[[702,5]]],9:[1700,[[3,10]],[[702,8],[709,2]]],10:[2500,[[3,16],[4,2]],[[720,1]]]};
 function cost(id,to){const r=RECIPE[to],nat=NAT[id];if(!r||!nat)return null;const out=[[0,r[0]]];for(const[t,n]of r[1])out.push([nat[t],n]);for(const[i,n]of r[2])out.push([i,n]);const m=new Map();for(const[i,n]of out)m.set(i,(m.get(i)||0)+n);return[...m.entries()]}
 const have=i=>i===0?(gems|0):cnt(i);
 const nm=i=>{try{return i===0?'Gems':iname(i)}catch(_){return'#'+i}};
 const tname=id=>{try{return TOOLS8.TL[id].n.replace(/ the .*$/,'')}catch(_){return id}};
 const creative=()=>{try{return DG.creative()}catch(_){return false}};
 const srv=()=>{try{return NET7.online&&NET7.auth&&NET7.auth.kind!='guest'}catch(_){return false}};
 function state(id){const i=TOOLLV.info(id);if(!i)return{ok:false,why:'Not a tool'};const s={id,l:i.l,max:i.l>=TOOLLV.MAX,ready:TOOLLV.ready(id),cost:null,miss:[],ok:false,why:''};
  if(s.max){s.why=tname(id)+' is at its highest level';return s}s.cost=cost(id,i.l+1).map(([it,n])=>({it,n,have:have(it),name:nm(it)}));s.miss=s.cost.filter(c=>c.have<c.n);
  if(!s.ready)s.why='Use '+tname(id)+' to fill its bar first ('+Math.floor(i.x)+' / '+i.need+')';else if(s.miss.length)s.why='Still needed: '+s.miss.map(c=>(c.n-c.have)+' '+c.name).join(', ');else s.ok=true;if(creative()&&s.ready)s.ok=true;return s}
 // ---- forging
 let busy=false;const open4=new Map(),pending=new Map();try{NET7.on('tup_res',m=>{const f=pending.get(String(m.rid||''));if(f){pending.delete(String(m.rid||''));f(m)}})}catch(_){}
 async function forge(id){if(busy)return{ok:0,m:'One moment…'};const s=state(id);if(!s.ok)return{ok:0,m:s.why};busy=true;
  try{if(srv()&&!creative()){const rid=open4.get(id+':'+s.l)||('t'+Date.now().toString(36)+Math.random().toString(36).slice(2,8));open4.set(id+':'+s.l,rid);
    try{NET7.send({t:'sync',gems:Math.max(0,(gems|0)+(SHOP7.pend|0))})}catch(_){}try{window.RB_BAGREPORT&&RB_BAGREPORT()}catch(_){}
    const r=await new Promise(ok=>{const t=setTimeout(()=>{pending.delete(rid);ok({ok:0,m:'The server is slow to answer. Nothing is lost: try again and you will only be charged once.'})},8000);pending.set(rid,v=>{clearTimeout(t);ok(v)});if(!NET7.send({t:'tup',tool:id,from:s.l,rid})){clearTimeout(t);pending.delete(rid);ok({ok:0,m:'Not connected. You were not charged.'})}});
    if(!r.ok){if(r.to!=null&&r.to>s.l){while(TOOLLV.lvl(id)<r.to&&TOOLLV.forged(id)){}}return{ok:0,m:r.m||'That did not work. Nothing was spent.'}}open4.delete(id+':'+s.l)}
   else if(!creative()){for(const c of s.cost){if(c.it===0)gems-=c.n;else addI(c.it,-c.n)}try{saveP()}catch(_){}}
   await anvil(id,s.l+1);TOOLLV.forged(id);decorate();return{ok:1,to:s.l+1}}finally{busy=false}}
 // ---- the anvil moment: three soft strikes with sparks, then a bloom, then TOOLLV's level-up celebration
 const reduce=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches||!!(cel.opt&&cel.opt.reduce)}catch(_){return false}};
 function strikeSnd(i){try{const f=[392,440,523][i]||523;snd(f,.09,'triangle',.035,.55);noise(.05,2600+i*400,.04)}catch(_){}}
 function chime(){try{[784,988,1175,1568].forEach((f,i)=>setTimeout(()=>{try{snd(f,.32,'sine',.028,1.4)}catch(_){}},i*80))}catch(_){}}
 function anvil(id,to){return new Promise(res=>{if(reduce()){chime();return res()}const el=document.createElement('div');el.id='tf9anim';el.setAttribute('aria-hidden','true');const cv2=document.createElement('canvas');cv2.width=420;cv2.height=300;el.appendChild(cv2);
  const cap=document.createElement('p');cap.textContent='Forging '+tname(id)+' to level '+to;el.appendChild(cap);document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('on'));
  const x=cv2.getContext('2d'),t0=performance.now(),D=1500,sp=[];let hit=-1;const col=TOOLLV.COL[id]||'#ffd27a';
  const frame=now=>{const t=now-t0;x.clearRect(0,0,420,300);
   // anvil
   x.fillStyle='#3a3350';x.beginPath();x.moveTo(110,206);x.lineTo(310,206);x.quadraticCurveTo(330,196,336,180);x.lineTo(150,180);x.quadraticCurveTo(116,186,110,206);x.fill();x.fillRect(176,206,68,30);x.fillRect(150,236,120,14);x.strokeStyle='#1e1430';x.lineWidth=3;x.strokeRect(176,206,68,30);
   // the tool on the anvil, glowing more with each strike
   const glow=Math.min(1,Math.max(0,hit+1)/3);x.save();x.translate(210,168);x.rotate(-.18);try{drawWeapon(x,id,92,0)}catch(_){}x.restore();if(glow>0){x.save();x.globalCompositeOperation='lighter';const g=x.createRadialGradient(210,168,4,210,168,90);g.addColorStop(0,'rgba(255,240,200,'+(.5*glow)+')');g.addColorStop(1,'rgba(255,200,120,0)');x.fillStyle=g;x.fillRect(110,80,200,180);x.restore()}
   // the hammer: three strikes
   const k=Math.min(2,Math.floor(t/380)),u=(t%380)/380,down=u<.35?u/.35:u<.5?1:1-(u-.5)/.5;if(t<1140&&k>hit&&u>.33){hit=k;strikeSnd(k);for(let i=0;i<14;i++)sp.push({x:210,y:172,vx:(Math.random()-.5)*360,vy:-Math.random()*280-60,l:.6+Math.random()*.4,c:i%3?col:'#fff2c0'})}
   if(t<1140){x.save();x.translate(286,40);x.rotate(-1.1+down*1.05);x.fillStyle='#6b4a3e';x.fillRect(-5,0,10,120);x.fillStyle='#8f8aa6';x.fillRect(-26,112,52,26);x.strokeStyle='#1e1430';x.lineWidth=2.5;x.strokeRect(-26,112,52,26);x.restore()}
   // sparks
   const dt=1/60;for(const s of sp){s.l-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=700*dt;if(s.l>0){x.globalAlpha=Math.min(1,s.l*1.6);x.fillStyle=s.c;x.fillRect(s.x,s.y,3,3)}}x.globalAlpha=1;
   // the bloom
   if(t>1150){const b=(t-1150)/350;x.save();x.globalCompositeOperation='lighter';x.fillStyle='rgba(255,236,190,'+(Math.max(0,1-b)*.6)+')';x.beginPath();x.arc(210,168,40+b*160,0,6.3);x.fill();x.restore()}
   if(t<D)requestAnimationFrame(frame);else{chime();el.classList.remove('on');setTimeout(()=>{try{el.remove()}catch(_){}},260);res()}};requestAnimationFrame(frame)})}
 // ---- telling you when a tool is ready
 function ready(id){try{const i=TOOLLV.info(id);REW8.card({kind:'tool',kick:'Ready to forge',title:tname(id)+' → level '+(i.l+1),sub:'Open the Tool Guide (G) and forge it with its materials',tier:2,icon:'w:'+id,ms:4200})}catch(_){}}
 // ---- the forge panel under the level bar on each tool's page of the Tool Guide
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 let msg='';
 function panel(id){const s=state(id);if(s.max)return'<div class="tf9 max"><b>Highest level</b><small>'+esc(tname(id))+' is fully forged.</small></div>';
  const rows=s.cost.map(c=>'<li class="'+(c.have>=c.n?'ok':'no')+'">'+(c.it===0?'<i class="gem" aria-hidden="true"></i>':'<img alt="" src="'+(()=>{try{return iconURL(c.it)}catch(_){return''}})()+'">')+'<span>'+esc(c.name)+'</span><em>'+Math.min(c.have,c.n).toLocaleString()+' / '+c.n.toLocaleString()+'</em></li>').join('');
  return'<div class="tf9'+(s.ok?' ok':'')+'"><div class="tf9h"><b>Tool Forge</b><small>to level '+(s.l+1)+'</small></div><ul>'+rows+'</ul>'+(s.why?'<p class="tf9w">'+esc(s.why)+'</p>':'')+(msg?'<p class="tf9m">'+esc(msg)+'</p>':'')+'<button type="button" class="tf9b"'+(s.ok?'':' disabled')+' data-tf="'+id+'">Forge</button></div>'}
 function decorate(){try{if(!(UI6.on&&UI6.tab=='toolguide'))return;const id=GUIDE8.page;if(!TOOLLV.IDS.includes(id))return;const lv=UI6.body&&UI6.body.querySelector('.tg8lv');if(!lv)return;let box=lv.parentNode.querySelector('.tf9wrap');if(!box){box=document.createElement('div');box.className='tf9wrap';lv.after(box)}box.innerHTML=panel(id);
   const b=box.querySelector('[data-tf]');if(b)b.onclick=async()=>{b.disabled=true;msg='';const r=await forge(id);msg=r.ok?'':r.m||'';try{GUIDE8.refresh()}catch(_){}decorate()}}catch(e){console.error('TFORGE panel',e)}}
 try{for(const k of['open','refresh','go']){const f0=GUIDE8[k];GUIDE8[k]=function(){const r=f0.apply(this,arguments);try{decorate()}catch(_){}return r}}}catch(_){}
 return{NAT,RECIPE,cost,state,forge,ready,decorate,panel}})()}catch(e){console.error('TFORGE',e)}
