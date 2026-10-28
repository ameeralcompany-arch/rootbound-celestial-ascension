// ===== Wing progression + collection (v8) =====
// WINGX: persistent wing record (key rbcwing, saved/exported with the profile like every rbc* key):
//  - level rewards: the milestone table is derived from WINGS (src 'level'); each reward is announced once (claimed), and
//    everything a player had already earned when this update arrived is claimed silently.
//  - exclusive wings: unlocked by real achievements (bosses, mining, fishing, classes, Spirit Stones, Sky Run, journal);
//    once unlocked they stay unlocked. Never sold for gems.
//  - shop wings: bought through SHOP7 (gems validated there, no duplicates, charged once) and equipped right after purchase.
// UI6.ext.wings: the Wings & Aura tab, rebuilt as a filterable collection with live previews.
const WINGX=(()=>{
 const KEY='rbcwing',S={v:1,ex:{},claimed:{},fl:{},init:0};
 try{const o=JSON.parse(localStorage.getItem(KEY)||'null');if(o&&typeof o=='object'){for(const k of['ex','claimed','fl'])if(o[k]&&typeof o[k]=='object')for(const id of Object.keys(o[k]).slice(0,200))if(/^[a-z0-9_]{1,24}$/.test(id)&&o[k][id])S[k][id]=Math.max(1,+o[k][id]||1);S.init=o.init?1:0}}catch(_){}
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(_){}};
 const n=v=>{v=+v;return Number.isFinite(v)?v:0};
 const bossesDone=()=>{try{return BOSSES.filter(b=>(bossK[b.id]|0)>0).length}catch(_){return 0}};
 const bestClass=()=>{try{let m=0;for(const k in CLASS7.C)m=Math.max(m,CLASS7.lv(k)|0);return m}catch(_){return 0}};
 const achDone=()=>{try{return ACH.filter((a,i)=>achD[i]).length}catch(_){return 0}};
 // requirement rows: [label, current(), need]
 const REQ={
  sovereign:[['Defeat every boss',bossesDone,()=>{try{return BOSSES.length}catch(_){return 6}}]],
  monarch:[['Find all Spirit Stones in the Plaza',()=>{try{return HUNT7.count()}catch(_){return 0}},()=>{try{return HUNT7.SPOTS.length}catch(_){return 7}}],['Finish the Sky Run in under 90 s',()=>{try{return RUN7.title||(RUN7.best!=null&&RUN7.best<90000)?1:0}catch(_){return 0}},1]],
  voidemp:[['Mine a Void Geode (deep caves)',()=>S.fl.geode?1:0,1],['Catch a Void Eel',()=>S.fl.eel?1:0,1]],
  phoenix:[['Reach class level 25 in any class',bestClass,25],['Catch a Golden Carp',()=>S.fl.carp?1:0,1]],
  eternity:[['Reach level 150',()=>lvl|0,150],['Complete every journal achievement',achDone,()=>{try{return ACH.length}catch(_){return 14}}]],
  drakelord:[['Mine a Diamond Ore',()=>S.fl.diamond?1:0,1],['Defeat the Magma Colossus',()=>{try{return (bossK.magma|0)>0?1:0}catch(_){return 0}},1]]};
 function req(id){return(REQ[id]||[]).map(([t,c,nd])=>{const need=typeof nd=='function'?nd():nd,cur=Math.min(need,n(c()));return{t,cur,need,done:cur>=need}})}
 const has=id=>!!S.ex[id];
 const rewards=()=>WINGS.filter(w=>w.src=='level').sort((a,b)=>a.lvl-b.lvl);
 const say=(t,s,ms)=>{try{UI6.say6(t,s,ms)}catch(_){try{window.say&&window.say(t+' '+s)}catch(_){}}};
 function celebrate(w,title){try{if(entered&&typeof P!='undefined'){VFX.ascend(P.x,P.y+10,w.pal);VFX.wave(P.x,P.y+20,w.pal[3],w.a.L*1.6,1,.4);shake=Math.max(shake||0,cel.opt.reduce?0:.1)}}catch(_){}
  try{WINGSFX.play('e',w)}catch(_){}say(title,w.n.toUpperCase(),4400)}
 // ---- level rewards: announce each milestone once
 let lastL=-1,queue=[],qT=0;
 function levelTick(){const L=lvl|0;if(!S.init){for(const w of rewards())if(L>=w.lvl)S.claimed[w.id]=1;S.init=1;save();lastL=L;return}
  if(L===lastL)return;lastL=L;const fresh=rewards().filter(w=>L>=w.lvl&&!S.claimed[w.id]);if(!fresh.length)return;
  for(const w of fresh)S.claimed[w.id]=1;save();queue.push({w:fresh[fresh.length-1],t:fresh.length>1?fresh.length+' WINGS AWAKENED':'WINGS AWAKENED'})}
 // ---- exclusive achievements
 function exTick(){for(const w of WINGS){if(w.src!='excl'||S.ex[w.id])continue;const r=req(w.id);if(r.length&&r.every(x=>x.done)){S.ex[w.id]=Date.now();save();queue.push({w,t:'EXCLUSIVE WINGS UNLOCKED'})}}}
 function flags(){let ch=0;try{if(cnt(248)>0&&!S.fl.eel){S.fl.eel=1;ch=1}if(cnt(247)>0&&!S.fl.carp){S.fl.carp=1;ch=1}if(cnt(65)>0&&!S.fl.geode){S.fl.geode=1;ch=1}if(cnt(76)>0&&!S.fl.diamond){S.fl.diamond=1;ch=1}}catch(_){}if(ch)save()}
 // mined blocks: record Diamond Ore (76) and Void Geode (65) when they actually break
 {const _ba=breakAt;breakAt=function(x,y){const inb=x>=0&&y>=0&&x<W&&y<H,b=inb?tiles[y*W+x]:0;const r=_ba.apply(this,arguments);try{if(r&&inb&&!tiles[y*W+x]&&(b==76||b==65)){const k=b==76?'diamond':'geode';if(!S.fl[k]){S.fl[k]=1;save()}}}catch(_){}return r}}
 setInterval(()=>{if(!entered)return;try{cel.seenW=99}catch(_){}levelTick();flags();exTick();
  if(queue.length&&performance.now()>qT){const q=queue.shift();qT=performance.now()+3800;setTimeout(()=>celebrate(q.w,q.t),380)}},250);
 // ---- shop: equip after a successful wing purchase; exclusive wings can never be bought
 {const _b=SHOP7.buy;SHOP7.buy=async function(id,qty){const it=SHOP7.byId.get(id);if(it&&it.cat=='wings'){const w=wingById(it.ref);if(!w||w.src!='shop')return{ok:0,m:'These wings cannot be bought'}}
  const r=await _b.call(this,id,qty);try{if(r&&r.ok&&it&&it.cat=='wings'){if(wingEquip(it.ref)){const w=wingById(it.ref);setTimeout(()=>celebrate(w,'NEW WINGS EQUIPPED'),120)}}}catch(_){}return r}}
 return{has,req,rewards,REQ,S,save,flags,tick(){levelTick();flags();exTick()},grant(id){if(wingById(id)&&wingById(id).src=='excl'){S.ex[id]=Date.now();save();return true}return false}}})();

// ---- collection UI (Wings & Aura tab)
(()=>{const RC={common:'#aab6d8',uncommon:'#6ad88a',rare:'#5aa8ff',epic:'#c05cff',legendary:'#ffb347',mythic:'#ff5a8a',exclusive:'#ff3a4a'},RN={common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',legendary:'Legendary',mythic:'Mythic',exclusive:'Exclusive'};
 const F={rar:'all',fam:'all',own:'all'};let selId=null,raf=0,root=null;
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const item=w=>{try{return SHOP7.byId.get('wing_'+w.id)}catch(_){return null}};
 const owned=w=>wingOwned(w);
 function status(w){const eq=curWing(lvl);if(owned(w))return eq&&eq.id==w.id?'Equipped':'Owned';
  if(w.src=='level')return'Unlocks at level '+w.lvl;if(w.src=='shop'){const it=item(w);return it?it.price+' gems'+(it.lv?' · Lv '+it.lv:''):'Store'}
  const r=WINGX.req(w.id);return'Exclusive · '+r.filter(x=>x.done).length+'/'+r.length}
 const pct=(c,n)=>Math.max(0,Math.min(100,n?c/n*100:0));
 const bar=(c,n,col)=>'<div class="bar" style="height:6px;border-radius:3px;background:rgba(127,127,160,.25);overflow:hidden;margin:3px 0 6px"><i style="display:block;height:100%;width:'+pct(c,n)+'%;background:'+(col||'#7ff0ff')+'"></i></div>';
 const rtag=w=>'<span class="hchip" style="border-color:'+RC[w.rar]+';color:'+RC[w.rar]+'">'+RN[w.rar]+'</span>';
 function info(w){const it=item(w),own=owned(w),eq=curWing(lvl),isEq=eq&&eq.id==w.id,prev=WPREV.id==w.id;let h='<div class="wc-info"><b style="font-size:18px">'+esc(w.n)+'</b><div class="hrow">'+rtag(w)+'<span class="hchip">'+WFAM[w.fam]+'</span><span class="hchip'+(own?' on':'')+'">'+(own?(isEq?'Equipped':'Owned'):'Locked')+'</span></div><p class="dim">'+esc(w.d)+' Gives a double jump; hold Space in the air to fly.</p>';
  if(w.src=='level')h+='<small>Level reward · level '+w.lvl+(own?' · unlocked':' · you are level '+lvl)+'</small>'+(own?'':bar(lvl,w.lvl,RC[w.rar]));
  else if(w.src=='shop')h+='<small>Gem store · '+(it?it.price+' gems'+(it.lv?' · needs level '+it.lv:''):'not listed')+(own?' · owned':' · you have '+(gems|0)+' gems')+'</small>';
  else{h+='<small>Exclusive · cannot be bought. Requirements:</small>';for(const r of WINGX.req(w.id))h+='<div style="font-size:12px;margin-top:4px">'+(r.done?'✔ ':'○ ')+esc(r.t)+' <span class="dim">'+r.cur+' / '+r.need+'</span></div>'+bar(r.cur,r.need,r.done?'#6ad88a':RC.exclusive)}
  h+='<div class="hrow" style="margin-top:8px"><button class="hbtn" data-wa="prev">'+(prev?'Stop preview':'Preview')+'</button>';
  if(own)h+=isEq?'<button class="hbtn" data-wa="un">Unequip</button>':'<button class="hbtn" data-wa="eq">Equip</button>';
  else if(w.src=='shop'&&it){const lk=(lvl|0)<(it.lv|0),poor=(gems|0)<it.price;h+='<button class="hbtn" data-wa="buy"'+(lk||poor?' disabled style="opacity:.45"':'')+'>'+(lk?'Needs level '+it.lv:poor?'Need '+(it.price-(gems|0))+' more gems':'Buy · '+it.price+' gems')+'</button>'}
  return h+'</div><small id="wcMsg" class="dim" role="status"></small></div>'}
 function upcoming(){const L=lvl|0,nx=WINGX.rewards().filter(w=>w.lvl>L).slice(0,3);if(!nx.length)return'<p class="dim">Every level reward is unlocked.</p>';
  return'<div class="hrow" style="flex-wrap:wrap;gap:8px">'+nx.map(w=>'<div class="hcard" data-w="'+w.id+'" style="min-width:150px;flex:1;cursor:pointer"><small>Level '+w.lvl+'</small><b style="color:'+RC[w.rar]+'">'+esc(w.n)+'</b>'+bar(L,w.lvl,RC[w.rar])+'<small class="dim">'+(w.lvl-L)+' level'+(w.lvl-L==1?'':'s')+' to go</small></div>').join('')+'</div>'}
 const list=()=>WINGS.filter(w=>(F.rar=='all'||w.rar==F.rar)&&(F.fam=='all'||w.fam==F.fam)&&(F.own=='all'||(F.own=='owned')==owned(w)));
 const chips=(k,opts)=>'<div class="hrow" style="flex-wrap:wrap">'+opts.map(([v,t])=>'<span class="hchip'+(F[k]==v?' on':'')+'" data-f="'+k+'" data-v="'+v+'">'+t+'</span>').join('')+'</div>';
 function grid(){return list().map(w=>{const own=owned(w),eq=curWing(lvl);return'<div class="hcard wc-card'+(own?'':' lock')+(selId==w.id?' sel':'')+'" data-w="'+w.id+'" style="cursor:pointer"><canvas width="168" height="112" data-wc="'+w.id+'" style="width:100%;height:auto;display:block"></canvas><b>'+esc(w.n)+'</b><small style="color:'+RC[w.rar]+'">● '+RN[w.rar]+' · '+WFAM[w.fam]+'</small><small>'+(eq&&eq.id==w.id?'<b>Equipped</b>':esc(status(w)))+'</small></div>'}).join('')||'<p class="dim">No wings match these filters.</p>'}
 function auraHtml(){const a0=curAura(lvl);let h='<h3 style="margin-top:18px">Ground Aura</h3><div class="hrow"><span class="hchip'+(cel.auraOn?' on':'')+'" id="atog">Aura '+(cel.auraOn?'ON':'OFF')+'</span><span class="hchip'+(cel.aura=='auto'?' on':'')+'" id="aauto">Auto</span></div><div class="hgrid">';
  AURAS.forEach((a,i)=>{if(a.id=='none')return;const u=lvl>=a.lvl;h+='<div class="hcard'+(u?'':' lock')+(a0.id==a.id?' sel':'')+'" data-a="'+i+'"><div class="cv"></div><b>'+a.n+'</b><small>'+(u?'Unlocked':'Unlocks at level '+a.lvl)+'</small></div>'});return h+'</div>'}
 function render(){const B=UI6.body;if(!selId||!wingById(selId)){const e=curWing(lvl);selId=e?e.id:WINGS[0].id}const w=wingById(selId),own=WINGS.filter(owned).length,eq=curWing(lvl);
  B.innerHTML='<div id="wcRoot"><h3>Wing Collection</h3><div class="hrow"><span class="hchip on">Owned '+own+' / '+WINGS.length+'</span><span class="hchip">'+(eq?'Wearing: '+esc(eq.n):'No wings equipped')+'</span>'+(eq?'<button class="hbtn" data-wa="unall">Unequip wings</button>':'')+'</div>'+
   '<div class="prof" style="align-items:flex-start;flex-wrap:wrap"><canvas id="wcPv" width="340" height="250" style="max-width:100%;border-radius:12px"></canvas><div id="wcTop" style="flex:1;min-width:220px">'+info(w)+'</div></div>'+
   '<h4>Next level rewards</h4>'+upcoming()+
   '<h4>Filters</h4>'+chips('own',[['all','All'],['owned','Owned'],['locked','Locked']])+chips('rar',[['all','Any rarity'],...WRAR.map(r=>[r,RN[r]])])+chips('fam',[['all','Any family'],...Object.keys(WFAM).map(k=>[k,WFAM[k]])])+
   '<div class="hgrid" id="wcGrid">'+grid()+'</div>'+auraHtml()+'</div>';
  root=B.querySelector('#wcRoot');bind(B);loop()}
 function refreshTop(){const t=root&&root.querySelector('#wcTop');if(t){t.innerHTML=info(wingById(selId));bindTop(t)}root&&root.querySelectorAll('.wc-card').forEach(c=>c.classList.toggle('sel',c.dataset.w==selId))}
 const msg=t=>{const m=root&&root.querySelector('#wcMsg');if(m)m.textContent=t};
 async function act(a){const w=wingById(selId);if(!w)return;const sfx=n=>{try{UIS.play(n)}catch(_){}};
  if(a=='prev'){if(WPREV.id==w.id)WPREV.id=null;else{WPREV.id=w.id;WPREV.until=performance.now()+15000}sfx('select');refreshTop();return}
  if(a=='eq'){if(wingEquip(w.id)){sfx('select');render()}else{sfx('error');msg('You do not own these wings yet.')}return}
  if(a=='un'||a=='unall'){wingUnequip();sfx('click');render();return}
  if(a=='buy'){const it=item(w);if(!it)return;if(it.price>=500){try{const ok=await DLG7.confirm('Buy '+w.n+'?','This costs '+it.price+' gems. You have '+(gems|0)+'.','Buy for '+it.price);if(!ok)return}catch(_){}}
   const r=await SHOP7.buy(it.id,1);if(r.ok){render();msg(r.m+' and equipped.')}else msg(r.m||'Purchase failed');return}}
 function bindTop(el){el.querySelectorAll('[data-wa]').forEach(b=>b.onclick=()=>act(b.dataset.wa))}
 function bind(B){bindTop(B);B.querySelectorAll('[data-wa="unall"]').forEach(b=>b.onclick=()=>act('unall'));
  B.querySelectorAll('[data-f]').forEach(c=>c.onclick=()=>{F[c.dataset.f]=c.dataset.v;try{UIS.play('tab')}catch(_){}render()});
  B.querySelectorAll('.hcard[data-w]').forEach(c=>c.onclick=()=>{selId=c.dataset.w;try{UIS.play('select')}catch(_){}refreshTop()});
  B.querySelectorAll('.hcard[data-a]').forEach(d=>{const i=+d.dataset.a,a=AURAS[i],c=document.createElement('canvas');c.width=260;c.height=120;const x=c.getContext('2d'),o=g;g=x;try{Sigil.draw(x,a,130,60,0,110,lvl>=a.lvl?1:.3)}catch(_){}finally{g=o}d.querySelector('.cv').appendChild(c);d.onclick=()=>{if(lvl>=a.lvl){cel.aura=a.id;cel.auraOn=1;celSave();render()}}});
  const tg=(id,f)=>{const e=B.querySelector('#'+id);if(e)e.onclick=f};tg('atog',()=>{cel.auraOn=cel.auraOn?0:1;celSave();render()});tg('aauto',()=>{cel.aura='auto';celSave();render()})}
 // live previews: the character (with the selected/previewed/equipped wing) and every visible card; art is built lazily
 let lastCard=0;const built=new Set();
 function loop(){cancelAnimationFrame(raf);const step=now=>{if(!UI6.on||UI6.tab!='wings'||!root||!root.isConnected){WPREV.id=null;return}raf=requestAnimationFrame(step);const t=now/1000;
   const pv=root.querySelector('#wcPv');if(pv){const x=pv.getContext('2d'),w=wingShown(lvl);x.clearRect(0,0,pv.width,pv.height);const gr=x.createRadialGradient(170,150,10,170,140,190);gr.addColorStop(0,'rgba(140,120,220,.28)');gr.addColorStop(1,'rgba(20,16,40,0)');x.fillStyle=gr;x.fillRect(0,0,pv.width,pv.height);
    const k=w?Math.min(1.25,120/(w.a.L*1.25)):1.25,o=g;g=x;x.save();x.translate(170,150);x.scale(k,k);WingArt.dbg={s:1,fl:Math.sin(t*2)*.05};try{AC6.draw(0,0,1,0,'',t,0,false,'',typeof wp!='undefined'?wp:'fist',0,0,typeof wear!='undefined'?wear:{},false,typeof look!='undefined'?look:null,'me')}catch(e){}finally{WingArt.dbg=null;x.restore();g=o}
    if(WPREV.id){x.fillStyle='rgba(255,255,255,.85)';x.font='600 12px sans-serif';x.fillText('PREVIEW',10,18)}}
   if(now-lastCard<40)return;lastCard=now;const br=UI1();let nb=0;
   for(const c of root.querySelectorAll('canvas[data-wc]')){const r=c.getBoundingClientRect();if(r.bottom<br.top||r.top>br.bottom||!r.width)continue;const id=c.dataset.wc,i=WINGS.findIndex(w=>w.id==id);if(i<0)continue;
    if(!built.has(id)){if(nb>=2)continue;nb++;built.add(id)}const W=WINGS[i],x=c.getContext('2d'),k=Math.min(1.15,46/(W.a.L*1.18)),own=owned(W);x.clearRect(0,0,168,112);
    x.save();x.translate(84,78);x.scale(k,k);try{WingArt.draw(x,i,0,6,1,t+i*.37,0,0,i,own?1:.38,null,null,{ds:1})}catch(_){}x.restore();if(!own){x.fillStyle='rgba(255,255,255,.75)';x.font='600 11px sans-serif';x.fillText('LOCKED',6,14)}}};raf=requestAnimationFrame(step)}
 const UI1=()=>{try{return UI6.body.getBoundingClientRect()}catch(_){return{top:0,bottom:innerHeight}}};
 UI6.ext.wings=render;
 return{render}})();
