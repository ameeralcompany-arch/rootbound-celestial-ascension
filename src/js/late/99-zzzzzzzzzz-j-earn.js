// ===== EARN1: weapons and gear are earned by playing. The store sells only things that give no advantage (catalog "sale":0 marks the rest).
// Each class has its own weapon ladder: its store weapons, granted when that class reaches each class level (catalog earn {cls,clv}, made by
// tools/earned-catalog.js). Only classes you have learned get theirs, never another class's. A new weapon of your current class is equipped at once
// if you are holding nothing better of that class; the old one stays yours. Gear arrives at player levels by rarity (earn {lv}), class armour at class
// levels. Every grant happens once, is saved with your progress, and is recorded by the server ('earn'), which hands its record back on sign-in.
// Players who are already past some levels get everything they have earned at once, in one summary. =====
try{window.EARN1=(()=>{
 const items=(typeof CATALOG7!='undefined'&&CATALOG7.items)||[],LAD={},CG={},GEAR=[],RANK={common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5,exclusive:6};
 for(const it of items){if(it.sale!==0||!it.earn)continue;const e=it.earn;
  if(it.cat=='weapons'&&e.cls)(LAD[e.cls]=LAD[e.cls]||[]).push({id:it.ref,cid:it.id,clv:e.clv,rar:it.rar,n:it.n});
  else if(it.cat=='gear'&&e.cls)(CG[e.cls]=CG[e.cls]||[]).push({ref:it.ref,cid:it.id,clv:e.clv,rar:it.rar,n:it.n});
  else if(it.cat=='gear')GEAR.push({ref:it.ref,cid:it.id,lv:e.lv,rar:it.rar,n:it.n})}
 for(const k in LAD)LAD[k].sort((a,b)=>a.clv-b.clv);GEAR.sort((a,b)=>a.lv-b.lv);
 // a ladder weapon's only gate is its class level (the old player-level gate belonged to buying it)
 for(const k in LAD)for(const e of LAD[k])try{if(WPN[e.id])WPN[e.id].lv=0}catch(_){}
 const learned=()=>{try{const S=CJOB.S,L=new Set(S.learned||[]);if(S.cur)L.add(S.cur);return[...L]}catch(_){return[]}};
 const clv=k=>{try{return CLASS7.lv(k)|0}catch(_){return 0}};
 const need=e=>{let c=e.clv;try{c=Math.max(c,CJOB.creq(e.id)|0)}catch(_){}return c};
 const creative=()=>typeof RB_CREATIVE!='undefined'&&!!RB_CREATIVE;
 const rankIn=(k,id)=>{const L=LAD[k]||[];for(let i=0;i<L.length;i++)if(L[i].id===id)return i;return -1};
 // what the next rung is, for the Classes screen and item tooltips
 function next(k){const L=LAD[k]||[],c=clv(k);for(const e of L)if(!own[e.id])return{id:e.id,n:e.n,clv:need(e),now:c};return null}
 function ruleOf(id,kind){const L=kind=='g'?[].concat(...Object.values(CG),GEAR):[].concat(...Object.values(LAD));for(const e of L)if(e.id===id||e.ref===id)return e;return null}
 function label(id,kind){const e=ruleOf(id,kind);if(!e)return null;if(e.lv!=null)return'Earned at level '+e.lv;let n=e.clv;for(const k in (kind=='g'?CG:LAD))if((kind=='g'?CG:LAD)[k].includes(e)){let c='';try{c=CLASS7.C[k].n}catch(_){c=k}return'Earned at '+c+' level '+(kind=='g'?n:need(e))}return null}
 let busy=0;
 let held=false;   // tests that set up weapons by hand pause the automatic earning (EARN1.hold(true))
 function check(){try{if(held||busy||typeof entered=='undefined'||!entered||window.RB_COVER||creative())return;if(typeof creatorOn!='undefined'&&creatorOn)return}catch(_){return}
  const got=[],rep={};
  for(const k of learned()){const c=clv(k);if(!c)continue;
   for(const e of LAD[k]||[])if(c>=need(e)&&!own[e.id]){own[e.id]=1;got.push({t:'w',e,k});(rep[k]=rep[k]||[]).push(e.cid)}
   for(const e of CG[k]||[])if(c>=e.clv&&!ownW[e.ref]){ownW[e.ref]=1;got.push({t:'g',e,k});(rep[k]=rep[k]||[]).push(e.cid)}}
  for(const e of GEAR)if((lvl|0)>=e.lv&&!ownW[e.ref]){ownW[e.ref]=1;got.push({t:'g',e});(rep._=rep._||[]).push(e.cid)}
  if(!got.length)return;
  // the best new weapon of your current class goes into your hand, unless you already hold something better of that class (a Mythic, an arsenal weapon, a higher rung)
  const cur=CJOB.cur,mine=got.filter(g=>g.t=='w'&&g.k===cur).map(g=>g.e);let eq=null;
  if(mine.length){const best=mine[mine.length-1],held=wp,hr=rankIn(cur,held);let better=false;try{const w=WPN[held];better=!!(w&&(w.myth||w.ars)&&held!=='fist')}catch(_){}
   if(!better&&(held=='fist'||!own[held]||hr<0||hr<rankIn(cur,best.id))){try{if(typeof HOTBAR!='undefined'&&HOTBAR.equip)HOTBAR.equip('w:'+best.id);else wp=best.id}catch(_){wp=best.id}eq=best}}
  try{saveP()}catch(_){}try{renderBar()}catch(_){}try{renderSkills()}catch(_){}
  report(rep);present(got,eq)}
 function report(rep){try{if(!NET7.online||!NET7.auth||NET7.auth.kind=='guest')return;for(const k in rep)NET7.send({t:'earn',ids:rep[k].slice(0,80),cls:k=='_'?'':k,clv:k=='_'?0:clv(k),lv:lvl|0})}catch(_){}}
 // the server's record, on every sign-in: anything earned on another computer comes here too
 try{NET7.on('earned',m=>{if(!Array.isArray(m.ids))return;let n=0;for(const cid of m.ids){const it=items.find(i=>i.id===cid);if(!it||!it.earn)continue;if(it.cat=='weapons'&&!own[it.ref]){own[it.ref]=1;n++}else if(it.cat=='gear'&&!ownW[it.ref]){ownW[it.ref]=1;n++}}if(n){try{saveP()}catch(_){}try{renderBar()}catch(_){}}})}catch(_){}
 // ---- how it is shown: a weapon gets its own card and a burst of its rarity's light; a catch-up of many becomes one summary
 const tierOf=r=>Math.min(5,RANK[r]|0);
 function present(got,eq){const W=got.filter(g=>g.t=='w'),G=got.filter(g=>g.t=='g');
  try{if(got.length>3){REW8.card({tier:Math.max(...got.map(g=>tierOf(g.e.rar))),kick:'Earned by playing',title:(W.length?W.length+' weapon'+(W.length>1?'s':''):'')+(W.length&&G.length?' and ':'')+(G.length?G.length+' gear piece'+(G.length>1?'s':''):''),sub:(eq?'Now in your hands: '+eq.n+'. ':'')+'Everything is in your inventory.',showTier:true,kind:'earn'})}
   else{for(const g of W){let c='';try{c=CLASS7.C[g.k].n}catch(_){}REW8.card({tier:tierOf(g.e.rar),kick:c+' weapon earned · class level '+need(g.e),title:g.e.n,sub:eq&&eq.id===g.e.id?'Equipped. Your previous weapon is in your inventory.':'It is in your inventory.',showTier:true,kind:'earn'})}
    for(const g of G)REW8.card({tier:tierOf(g.e.rar),kick:'Gear earned · '+(g.k?'class level '+g.e.clv:'level '+g.e.lv),title:g.e.n,sub:'Open your inventory to wear it.',showTier:true,kind:'earn'})}}catch(_){}
  try{const t=Math.max(...got.map(g=>tierOf(g.e.rar))),c=REW8.RC[t];REW8.celebrate(P.x,P.y+P.h*.5,c,{n:W.length?34:16})}catch(_){}
  try{if(typeof UIS!='undefined')UIS.play(W.length?'rare':'confirm')}catch(_){}}
 setInterval(()=>{try{check()}catch(e){if(!check.e){check.e=1;console.error('EARN1',e)}}},1800);
 return{LAD,CG,GEAR,check,next,label,ruleOf,need,hold(v){held=!!v}}})()}catch(e){console.error('EARN1',e)}
