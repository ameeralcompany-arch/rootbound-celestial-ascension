// ===== BAL11: weapon power follows rarity. Every weapon was measured headlessly against a training dummy (single target up close and at range,
// and a group of three) with its real move, projectiles and effects; its base damage (WPN[id].md) is then set so its effective power lands in
// its rarity band: common < uncommon < rare < epic < legendary < mythic (x1.3 per tier), ordered inside a band by level requirement, then price.
// Power = single-target DPS x (1 + 15% per extra target an attack reaches) x 1.1 for ranged weapons (they trade ~9% DPS for safety).
// WPOWER(id): one number per weapon (base damage x its measured move factor) for sorting and tooltips. WPNRAR(id): its rarity, including the
// evolved forms (one rarity up per stage) and Fists. Ids, costs and catalog rarities are unchanged, so saves and the store keep working. =====
const BAL11=(()=>{
 const RO=['common','uncommon','rare','epic','legendary','mythic'],B0=40,G=1.3;
 // rarity of weapons that are not in the store catalog (Fists, evolved stages)
 const XR={fist:'common'};for(const[b,r]of[['cinder',1],['rime',1],['spark',1],['umbra',2]])for(let s=1;s<4;s++)XR[b+s]=RO[Math.min(5,r+s)];
 // measured base damage per weapon (tools/sim: tests/balance.js re-measures and checks the bands)
 const MD=/*MD*/{fist:5.7,ember:7.8,frost:7.7,venom:5.5,blood:19.5,arcane:12.3,void:10.7,glaive:14.4,hammer:28,pan:8.1,sickle:12.2,cinder:12,cinder1:13.2,cinder2:8.2,cinder3:5.3,rime:11.1,rime1:13.8,rime2:10.4,rime3:11.5,spark:31,spark1:37,spark2:48,spark3:63,umbra:23,umbra1:28,umbra2:34,umbra3:42,solarfang:13.2,frostbite:7.7,astralkat:7.3,crimsonrift:23,verdant:12.6,skyspear:20,thornlash:28,moonchakram:24,zephyrbow:23,stormflail:61,gravitystaff:49,galeshuriken:15.2,titanmaul:78,starwand:11,frostwand:18.3,voidwand:27,tendrilwand:37,chainwand:87,crowbow:13,icebow:19.5,popgun:8.6,emberfist:8.7,revolver:17,sakurakat:13.9,shotgun:10.5,tidecaller:14.3,smg:7.5,moonpistol:29,sniper:38,lumistaff:13.1,rocket:49,raijinbow:25,prismcannon:44,dragonaxe:46}/*MD*/;
 // measured power per point of base damage (attack speed, projectiles, multi-hits, area and range folded in)
 const K=/*K*/{fist:5.965,ember:5.538,frost:6.753,venom:9.8,blood:2.826,arcane:4.585,void:6.477,glaive:5.014,hammer:2.496,pan:5.136,sickle:4.467,cinder:4.383,cinder1:5.121,cinder2:10.72,cinder3:21.547,rime:4.793,rime1:4.942,rime2:8.519,rime3:10.035,spark:1.797,spark1:1.968,spark2:1.89,spark3:1.868,umbra:2.991,umbra1:3.214,umbra2:3.426,umbra3:3.536,solarfang:6.977,frostbite:9.234,astralkat:12.808,crimsonrift:5.413,verdant:4.524,skyspear:3.525,thornlash:3.189,moonchakram:3.808,zephyrbow:3.191,stormflail:1.556,gravitystaff:2.424,galeshuriken:4.717,titanmaul:1.582,starwand:6.727,frostwand:5.071,voidwand:4.526,tendrilwand:2.584,chainwand:1.392,crowbow:9.231,icebow:4.831,popgun:5.209,emberfist:6.621,revolver:3.424,sakurakat:5.367,shotgun:7.152,tidecaller:5.294,smg:12.84,moonpistol:3.345,sniper:2.571,lumistaff:7.511,rocket:2.565,raijinbow:5.072,prismcannon:2.909,dragonaxe:3.615}/*K*/;
 for(const id in MD)if(WPN[id])WPN[id].md=MD[id];
 function rar(id){const w=WPN[id];if(!w)return null;if(w.rar)return w.rar;if(XR[id])return XR[id];try{const it=SHOP7.byId.get('wpn_'+id);if(it)return it.rar=='exclusive'?'mythic':it.rar}catch(_){}return'common'}
 const kOf=id=>K[id]||(WPN[id]&&WPN[id].cd?1/WPN[id].cd:1);
 function power(id){const w=WPN[id];if(!w||!(w.md>0))return 0;return Math.round(w.md*kOf(id))}
 const band=r=>B0*Math.pow(G,Math.max(0,RO.indexOf(r)));
 // the inventory / store rarity labels follow WPNRAR for weapons outside the catalog (evolved forms were shown as Common)
 try{const I=ITEM7,t0=I.tier,GL=['○','◇','◆','✦','★','✷'];const wt=k=>typeof k=='string'&&k.startsWith('w:')&&XR[k.slice(2)]&&k!='w:fist'?RO.indexOf(XR[k.slice(2)]):-1;
  I.tier=k=>{const t=wt(k);return t>=0?t:t0(k)};const o={rar:I.rar,label:I.label,attrs:I.attrs,tag:I.tag,glyph:I.glyph};
  I.rar=k=>wt(k)>=0?I.RAR[wt(k)]:o.rar(k);I.label=k=>wt(k)>=0?I.RN[wt(k)]:o.label(k);
  I.attrs=k=>wt(k)>=0?' data-cat="weapon" data-rar="'+I.RAR[wt(k)]+'"':o.attrs(k);I.tag=k=>wt(k)>=0?'<span class="rtag" data-rar="'+I.RAR[wt(k)]+'">'+I.RN[wt(k)]+'</span>':o.tag(k);
  I.glyph=k=>wt(k)>=0?'<i class="rp7" aria-hidden="true">'+GL[wt(k)]+'</i>':o.glyph(k)}catch(e){console.error('BAL11 rarity labels',e)}
 // bosses: more health so a fight at the expected level lasts about a minute (it was 15-35 s): simulated TTK per class in tests/balance.js
 const BHP={warden:2000,sovereign:4200,magma:5600,eclipse:7000,tide:10000,storm:13000};try{for(const b of BOSSES)if(BHP[b.id]){b.hp=BHP[b.id];if(MK['boss_'+b.id])MK['boss_'+b.id].hp=BHP[b.id]}}catch(e){console.error('BAL11 bosses',e)}
 window.WPOWER=power;window.WPNRAR=rar;   // (WRAR is the wing rarity list in 20-data.js)
 return{RO,B0,G,MD,K,XR,BHP,rar,power,band,kOf}})();
