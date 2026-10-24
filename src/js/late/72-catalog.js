// ===== SHOP7: item catalog (shared with the server), ownership, equipment slots and the purchase flow =====
// The catalog (ids, prices, rarity) is generated into server/catalog.json and inlined here at build time. Online (signed-in) purchases are
// validated by the server against its own copy of the catalog and its own wallet; offline/guest purchases are validated locally.
const CATALOG7=/*@@CATALOG@@*/{items:[]};
const SHOP7=(()=>{
 const items=CATALOG7.items,byId=new Map(items.map(i=>[i.id,i])),RAR=['common','uncommon','rare','epic','legendary','mythic','exclusive'];
 const RN={common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',legendary:'Legendary',mythic:'Mythic',exclusive:'Exclusive'};
 const CATS=[['featured','Featured'],['weapons','Weapons'],['wings','Wings'],['effects','Effects'],['charms','Charms'],['weather','Weather'],['gear','Gear'],['blocks','Blocks'],['seeds','Seeds'],['objects','Objects']];
 const SLOTS=['aura','trail','spawn','victory','wtrail','wskin']; // effect sub-types, one equipped at a time each (+ 'charm')
 const st={own:{},eq:{},seen:{},pend:0,first:1};
 const lsGet=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
 function load(){try{const o=JSON.parse(lsGet('rbc3')||'{}');if(o.own&&typeof o.own=='object')for(const k of Object.keys(o.own).slice(0,400)){const it=byId.get(k);if(it&&o.own[k]>0)st.own[k]=Math.min(9999,o.own[k]|0)}
  if(o.eq&&typeof o.eq=='object')for(const s of [...SLOTS,'charm'])if(typeof o.eq[s]=='string'&&byId.has(o.eq[s]))st.eq[s]=o.eq[s];if(o.seen&&typeof o.seen=='object')for(const k of Object.keys(o.seen).slice(0,400))if(byId.has(k))st.seen[k]=1;st.pend=Math.max(0,Math.min(1e7,+o.pend||0))}catch(_){}}
 function save(){try{localStorage.setItem('rbc3',JSON.stringify({own:st.own,eq:st.eq,seen:st.seen,pend:st.pend}))}catch(_){}}
 load();
 // ---- server link
 let srv=null; // {owned:{id:qty}} from the server wallet message
 const srvMode=()=>{try{return NET7.online&&NET7.auth&&NET7.auth.kind!='guest'&&!!srv}catch(_){return false}};
 // ---- ownership. Legacy items keep living in their old stores (own / ownW); everything else is in st.own (or the server record when signed in).
 function has(id){const it=byId.get(id);if(!it)return false;
  if(it.cat=='weapons'&&it.legacy)return !!(own[it.ref]);if(it.cat=='gear'&&it.legacy)return !!(typeof ownW!='undefined'&&ownW[it.ref]);
  if(it.stack)return count(id)>0;
  if(srvMode())return !!(srv.owned[id]);return !!st.own[id]}
 const count=id=>{const it=byId.get(id);if(!it)return 0;if(it.stack){const k=+it.ref;return typeof cnt=='function'?cnt(k):0}return has(id)?1:0};
 function grantLocal(it,q){q=q||1;
  if(it.cat=='weapons'){if(it.legacy||true)own[it.ref]=1;st.own[it.id]=1}
  else if(it.cat=='gear'){ownW[it.ref]=1;st.own[it.id]=1}
  else if(it.stack){addI(+it.ref,q);try{barDirty=1}catch(_){}}
  else st.own[it.id]=1;
  save();try{saveP()}catch(_){}}
 // ---- levels
 const needLv=it=>it.lv|0;
 const lvOk=it=>(lvl|0)>=needLv(it);
 // ---- purchase
 const pending=new Map(),RO7={common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5,exclusive:6};
 const rid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
 function sfx(n){try{UIS.play(n)}catch(_){}}
 async function buy(id,qty){const it=byId.get(id);if(!it)return{ok:0,m:'That item does not exist'};
  qty=it.stack?Math.max(1,Math.min(99,qty|0||1)):1;const total=it.price*qty;
  if(!lvOk(it)){sfx('error');return{ok:0,m:'Requires level '+needLv(it)}}
  if(!it.stack&&has(id)){sfx('error');return{ok:0,m:'You already own this'}}
  if(gems<total){sfx('error');return{ok:0,m:'Not enough gems ('+total+' needed)'}}
  if(srvMode()){const r=rid();
   const res=await new Promise(ok=>{const t=setTimeout(()=>{pending.delete(r);ok({ok:0,m:'The server did not answer. You were not charged.'})},8000);pending.set(r,v=>{clearTimeout(t);ok(v)});if(!NET7.send({t:'buy',id,qty,rid:r})){clearTimeout(t);pending.delete(r);ok({ok:0,m:'Not connected. You were not charged.'})}});
   if(!res.ok){sfx('error');return res}
   gems=Math.max(0,res.gems|0);if(!srv.owned)srv.owned={};srv.owned[id]=res.owned|0;grantLocal(it,res.qty||qty);try{renderBar&&renderBar()}catch(_){}sfx(RO7[it.rar]>=3?'rare':'buy');return{ok:1,qty:res.qty||qty,m:'Purchased '+it.n}}
  gems-=total;grantLocal(it,qty);sfx(RO7[it.rar]>=3?'rare':'buy');return{ok:1,qty,m:'Purchased '+it.n+(qty>1?' x'+qty:'')}}
 function net(m){if(m.t=='wallet'){if(m.guest){srv=null;return}srv={owned:m.owned||{}};
   // adopt the server wallet; any local excess is credited gradually (the server rate-limits gem growth)
   const total=(gems|0)+st.pend;if(st.first){st.first=0;}
   if(m.gems!=null){const w=m.gems|0;if(total>w){st.pend=total-w}else st.pend=0;gems=w;save()}
   return}
  if(m.t=='buy_res'){const f=pending.get(m.rid);if(f){pending.delete(m.rid);f(m)}}}
 setInterval(()=>{if(!srvMode())return;try{const total=Math.max(0,(gems|0)+st.pend);NET7.send({t:'sync',gems:total})}catch(_){}},15000);
 // ---- equipment
 const slotOf=it=>it.cat=='effects'?it.sub:it.cat=='charms'?'charm':it.cat=='wings'?'wing':it.cat=='weapons'?'weapon':it.cat=='gear'?'gear':null;
 function equipped(id){const it=byId.get(id);if(!it)return false;const s=slotOf(it);if(s=='wing')return cel.wingsOn&&cel.wing==it.ref;if(s=='weapon')return wp==it.ref;if(s=='gear')return wear[it.sub]==it.ref;return st.eq[s]===id}
 function equip(id){const it=byId.get(id);if(!it||!has(id)){sfx('error');return false}const s=slotOf(it);if(!s)return false;
  if(!lvOk(it)){say('Requires level '+needLv(it));sfx('error');return false}
  if(s=='wing'){cel.wing=it.ref;cel.wingsOn=1;try{celSave()}catch(_){}}
  else if(s=='gear'){wear[it.sub]=it.ref}
  else if(s=='weapon'){if(!own[it.ref])return false;wp=it.ref;try{renderW();renderBar()}catch(_){}}
  else{st.eq[s]=id;save()}
  sfx('select');try{FX7.onEquip(s,id)}catch(_){}return true}
 function unequip(id){const it=byId.get(id);if(!it)return;const s=slotOf(it);if(s=='wing'){cel.wingsOn=0;try{celSave()}catch(_){}}else if(s=='weapon'){wp='fist';try{renderW();renderBar()}catch(_){}}else if(s=='gear'){wear[it.sub]=''}else{delete st.eq[s];save()}sfx('click');try{FX7.onEquip(s,null)}catch(_){}}
 const eqRef=slot=>{const id=st.eq[slot];const it=id&&byId.get(id);return it&&has(id)?it.ref:null};
 return{items,byId,RAR,RN,CATS,SLOTS,st,has,count,buy,net,equip,unequip,equipped,eqRef,slotOf,lvOk,needLv,get serverMode(){return srvMode()},get pend(){return st.pend},save,
  markSeen(id){if(!st.seen[id]){st.seen[id]=1;save()}},isNew(id){const it=byId.get(id);return !!(it&&it.new&&!st.seen[id])},grantLocal}})();
