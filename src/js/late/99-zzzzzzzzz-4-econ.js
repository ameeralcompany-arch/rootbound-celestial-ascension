// ===== ECON14: prices follow progress. A power item (weapons, gear, wings, charms; weather machines and effects lighter) costs about as many
// minutes of play as its rarity deserves, at the income you have when you can use it:
//   income(L)  = 30 + 4.5 L gems per minute of active play at player level L (monsters, quests, depth activities, chests)
//   minutes    = common 2, uncommon 5, rare 10, epic 18, legendary 30, mythic 50
//   level      = the item's level requirement, or the typical level of its rarity (1, 8, 16, 25, 38, 55) when it has none
//   price      = 0.3 x the designed price + 0.7 x income(level) x minutes x category weight, rounded to 5 gems
// Blocks, seeds, objects and pets keep their prices (building should stay cheap). Applied once when the game loads; the store, the
// wing screen and the gun shop all read item.price, so they all follow. Formulas and the whole plan: docs/progression-balance.md =====
const ECON14=(()=>{
 const income=L=>30+4.5*Math.max(1,L);
 const MIN={common:2,uncommon:5,rare:10,epic:18,legendary:30,mythic:50},TYP={common:1,uncommon:8,rare:16,epic:25,legendary:38,mythic:55};
 const CAT={weapons:1,gear:1,wings:1,charms:1,weather:.8,effects:.6};
 const r5=v=>Math.max(5,Math.round(v/5)*5);
 function target(i){const w=CAT[i.cat];if(!w)return null;const r=i.rar=='exclusive'?'mythic':i.rar;if(!MIN[r])return null;return income(i.lv||TYP[r])*MIN[r]*w}
 let n=0;try{for(const i of SHOP7.items){const t=target(i);if(t==null||!(i.price>0))continue;if(i.base==null)i.base=i.price;i.price=r5(.3*i.base+.7*t);n++;
   // the item's own cost follows, so the catalog stays consistent everywhere
   try{if(i.cat=='weapons'&&WPN[i.ref])WPN[i.ref].cost=i.price;else if(i.cat=='gear'&&WEAR[i.ref])WEAR[i.ref].cost=i.price;else if(i.cat=='wings'){const w=WINGS.find(q=>q.id==i.ref);if(w&&'cost' in w)w.cost=i.price}}catch(_){}}}catch(e){console.error('ECON14',e)}
 // the Anonymous set stays the store's flagship: priced above every other non-weapon item (the v10 aura sets, GEAR10, are priced on their own)
 try{const top=Math.max(...SHOP7.items.filter(i=>i.cat!='weapons'&&!i.id.startsWith('wear_anon')&&!(typeof GEAR10!='undefined'&&GEAR10.SET[i.ref])).map(i=>i.price||0));for(const[id,k]of[['wear_anonmask',1.06],['wear_anonsuit',1.12]]){const i=SHOP7.byId.get(id);if(i){i.price=Math.max(i.price,r5(top*k));if(WEAR[i.ref])WEAR[i.ref].cost=i.price}}}catch(_){}
 return{income,target,MIN,TYP,CAT,repriced:n}})();
