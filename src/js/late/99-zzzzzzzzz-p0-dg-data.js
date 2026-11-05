// ===== DG: the dungeon expansion. This file holds the data every other dungeon module reads: the ten dungeons, the four difficulties, materials, keys and
// blueprints (real inventory items), the balance formulas and the save state. The modules are:
//   p0 data + balance + save · p1 instance (private world, layout, camera, hazards, parkour) · p2 monsters · p3 bosses · p4 UI · p5 music · p6 cinematics · p7 rewards + commands
//   q*  one file per dungeon: its monsters, boss and scenes
// Every module is wrapped so a mistake in one can never stop the rest of the game from loading. All state is in window.DG. =====
try{window.DG=(()=>{
 const pk=(a,b,c,d,e)=>({bg:a,rock:b,glow:c,accent:d,mist:e});
 // ---- the dungeons. entry: level needed. prev: the dungeon that must be finished first. skey: the key won in its parkour trial, opens its sealed gate. next: what its boss leaves you
 const LIST=[
  {id:'ruins',tier:'ancient',n:'Forgotten Ruins',sub:'Some secrets were buried for a reason.',entry:15,rec:'15–19',lvl:17,gear:1.5,prev:null,skey:731,boss:'sentinel',diff:'Challenging',p:pk('#07140f','#39463e','#5dffb0','#c9a968','#2a4a3a'),desc:'An abandoned temple swallowed by moss, where green crystals still answer to ancient magic.'},
  {id:'crimson',tier:'ancient',n:'Crimson Depths',sub:'Only the strongest survive the flames.',entry:20,rec:'20–24',lvl:22,gear:2,prev:'ruins',skey:732,boss:'sovereign2',diff:'Hard',p:pk('#180505','#3a1a16','#ff5a1e','#ffb02a','#4a1208'),desc:'A volcanic kingdom of lava rivers, crimson crystal and burning platforms.'},
  {id:'frozen',tier:'ancient',n:'Frozen Catacombs',sub:'Time itself has frozen here.',entry:25,rec:'25–29',lvl:27,gear:2.5,prev:'crimson',skey:733,boss:'empress',diff:'Hard',p:pk('#04101e','#2c4258','#6ad8ff','#dff8ff','#1a3a58'),desc:'A temple trapped in eternal winter. Bridges of ice, freezing winds and warriors who never thawed.'},
  {id:'hollow',tier:'ancient',n:'Hollow Sanctuary',sub:'Even the sacred can fall.',entry:30,rec:'30–34',lvl:32,gear:3,prev:'frozen',skey:734,boss:'saint',diff:'Very hard',p:pk('#0d0618','#2e2240','#b070ff','#e8d8a0','#2a1248'),desc:'A sacred place corrupted from within. Dark roots, floating halls and platforms that will not hold still.'},
  {id:'dragon',tier:'ancient',n:"Dragon's Grave",sub:'The dead are never truly forgotten.',entry:35,rec:'35–39',lvl:37,gear:3.5,prev:'hollow',skey:735,boss:'varkhazan',diff:'Very hard',p:pk('#10100f','#3e3830','#ff8a3a','#e8e0c8','#3a3028'),desc:'An ancient battlefield under a permanent storm, built on the bones of giants.'},
  {id:'abyss',tier:'ancient',n:'Eternal Abyss',sub:'Beyond this point, existence loses its meaning.',entry:40,rec:'40+',lvl:42,gear:4,prev:'dragon',skey:736,boss:'worldeater0',diff:'Deadly',p:pk('#04020c','#241a38','#9a5aff','#ff5ad0','#180a30'),desc:'Floating islands and broken celestial halls adrift in an endless void.'},
  {id:'star',tier:'abyssal',n:'Abyss of the Fallen Star',sub:'Even the stars can fall.',entry:60,rec:'60+',lvl:60,gear:6,prev:null,skey:737,boss:'fallenstar',diff:'Brutal',p:pk('#06040e','#2a2230','#ffd86a','#9a6aff','#2a1a40'),desc:'The impact crater of a dying star. Meteors fall, gravity bends and the corruption rises.'},
  {id:'night',tier:'abyssal',n:'Temple of Eternal Night',sub:'When the light disappears, something awakens.',entry:60,rec:'60+',lvl:62,gear:6,prev:'star',access:741,skey:738,boss:'eternalnight',diff:'Brutal',p:pk('#03040c','#161a2a','#a8c8ff','#e8ecff','#0a1020'),desc:'A black temple under one cold moon. What you cannot see is what hunts you.'},
  {id:'king',tier:'abyssal',n:"The Hollow King's Domain",sub:'A throne without a kingdom. A king without mercy.',entry:60,rec:'60+',lvl:65,gear:6,prev:'night',access:742,skey:739,boss:'hollowking',diff:'Brutal',p:pk('#08060e','#26222e','#c0a8ff','#d8dce8','#1a1428'),desc:'A dead royal city in silver and violet. Its retainers still keep their oaths.'},
  {id:'eater',tier:'abyssal',n:'Throne of the World Eater',sub:'Everything that begins must eventually end.',entry:60,rec:'60+',lvl:70,gear:6,prev:'king',access:743,skey:740,boss:'worldeater',diff:'Endgame',p:pk('#070205','#2a1014','#ff2a3a','#ff9a5a','#280810'),desc:'The final arena, where shattered planets drift toward something enormous.'}];
 const BY={};for(const d of LIST)BY[d.id]=d;
 // ---- difficulties. hp, dmg: multipliers. tel: telegraph time (never below 70%, every attack stays readable). mech: extra mechanics switched on. revives: tries before the run fails (0 = no limit)
 const DIFF={normal:{id:'normal',n:'Normal',hp:1,dmg:1,tel:1,mech:0,revives:0,loot:1},hard:{id:'hard',n:'Hard',hp:1.35,dmg:1.25,tel:.92,mech:1,revives:5,loot:1.5},nightmare:{id:'nightmare',n:'Nightmare',hp:1.8,dmg:1.55,tel:.84,mech:2,revives:3,loot:2.2},abyssal:{id:'abyssal',n:'Abyssal',hp:1.2,dmg:1.3,tel:.86,mech:3,revives:3,loot:3},cataclysm:{id:'cataclysm',n:'Cataclysm',hp:1.5,dmg:1.65,tel:.78,mech:3,revives:2,loot:4.5}};
 const diffsOf=d=>d.tier=='abyssal'?['abyssal','cataclysm']:d.id=='abyss'?['normal','hard','nightmare','abyssal']:['normal','hard','nightmare'];
 // ---- what a class of monster should cost you: seconds of your damage to kill it (TTK) and share of your health one normal hit takes. Abyssal monsters also lean on their mechanics, so their health stays honest
 const CL={regular:{n:'Monster',ttk:5.5,pct:.09,lab:'Challenging'},elite:{n:'Elite',ttk:16,pct:.15,lab:'Very hard'},mini:{n:'Mini-boss',ttk:38,pct:.2,lab:'Extremely hard'},boss:{n:'Dungeon boss',ttk:125,pct:.2,lab:'Very challenging'},aregular:{n:'Abyssal monster',ttk:8,pct:.14,lab:'Hard'},aelite:{n:'Abyssal elite',ttk:24,pct:.22,lab:'Brutal'},aboss:{n:'Abyssal boss',ttk:210,pct:.28,lab:'Endgame challenge'}};
 // ---- items. Keys, seals and sigils stay in your inventory until a boss falls, so dying or losing the connection can never cost you one. p sets the rarity through ITEM7
 const R={c:5,u:20,r:60,e:150,l:400,m:800},IT=[
  // materials
  [700,'Ancient Stone','#9aa88e',R.u,'stone','Worn stone that still hums with old magic. Ancient Dungeons.'],
  [701,'Monster Core','#ff7a6a',R.u,'core','The burning heart of a dungeon monster.'],
  [702,'Dungeon Essence','#7affd0',R.r,'essence','Raw magic, gathered only from dungeons. Weekly challenges pay in it.'],
  [703,'Emerald Rune Shard','#5dffb0',R.r,'shard','A piece of the Ancient Sentinel\'s runes. Only from Forgotten Ruins.'],
  [704,'Crimson Ember','#ff5a1e',R.r,'ember','An ember that refuses to cool. Only from Crimson Depths.'],
  [705,'Everfrost Crystal','#6ad8ff',R.r,'crystal','Ice that time forgot. Only from Frozen Catacombs.'],
  [706,'Hollow Root','#b070ff',R.e,'root','A dark root from the fallen sanctuary. Only from Hollow Sanctuary.'],
  [707,'Dragon Bone','#e8e0c8',R.e,'bone','Heavier than it looks, and still warm. Only from Dragon\'s Grave.'],
  [708,'Void Pearl','#9a5aff',R.e,'pearl','It drinks the light around it. Only from Eternal Abyss.'],
  [709,'Tempering Oil','#ffd86a',R.r,'flask','A crafting enhancer for dungeon forging.'],
  [710,'Sentinel Heart','#5dffb0',R.e,'heart','Only the Ancient Sentinel carries one.'],
  [711,'Sovereign Cinder','#ff7a2a',R.e,'heart','Only the Infernal Sovereign carries one.'],
  [712,'Empress Tear','#bfeeff',R.e,'heart','Only the Frost Empress weeps these.'],
  [713,'Saint\'s Halo Fragment','#e8d8a0',R.l,'heart','Only the Nameless Saint leaves one behind.'],
  [714,'Varkhazan Scale','#ff8a3a',R.l,'heart','Only Varkhazan the Ancient Dragon sheds these.'],
  [715,'World Eater Fang','#ff5ad0',R.l,'heart','Only the World Eater at the bottom of the Eternal Abyss.'],
  [716,'Abyssal Core','#c04aff',R.l,'core','The core of an Abyssal monster. Level 60 and beyond.'],
  [717,'Eternal Fragment','#fff2c0',R.l,'shard','A shard of something that was never meant to end.'],
  [718,'Void Crystal','#7a4aff',R.l,'crystal','Crystal grown where nothing else exists.'],
  [719,'Abyssal Essence','#ff4ae0',R.l,'essence','The rarest essence. Abyssal Dungeons only.'],
  [720,'Masterwork Component','#ffe9a8',R.m,'gear','A perfect part for masterwork forging.'],
  [721,'Starfall Core','#ffd86a',R.m,'heart','Only The Fallen Star carries one.'],
  [722,'Eclipse Veil','#a8c8ff',R.m,'heart','Only The Eternal Night wears one.'],
  [723,'Hollow Crown Shard','#c0a8ff',R.m,'heart','Only The Hollow King carries one.'],
  [724,'Heart of the End','#ff2a3a',R.m,'heart','Only The World Eater, on its throne.'],
  // stage keys: won in each dungeon's parkour trial, open its sealed gate. Kept until the boss falls
  [731,'Ancient Ruins Key','#5dffb0',R.r,'key','Opens the sealed gate in Forgotten Ruins. Stays with you until the boss falls.'],
  [732,'Crimson Seal','#ff5a1e',R.r,'seal','Opens the sealed gate in Crimson Depths. Stays with you until the boss falls.'],
  [733,'Frostbound Key','#6ad8ff',R.r,'key','Opens the sealed gate in Frozen Catacombs. Stays with you until the boss falls.'],
  [734,'Hollow Sanctum Key','#b070ff',R.e,'key','Opens the sealed gate in Hollow Sanctuary. Stays with you until the boss falls.'],
  [735,'Dragon\'s Grave Sigil','#ff8a3a',R.e,'seal','Opens the sealed gate in Dragon\'s Grave. Stays with you until the boss falls.'],
  [736,'Eternal Abyss Key','#9a5aff',R.l,'key','Opens the sealed gate in Eternal Abyss. Stays with you until the boss falls.'],
  [737,'Fallen Star Key','#ffd86a',R.l,'key','Opens the sealed gate in the Abyss of the Fallen Star.'],
  [738,'Moonless Key','#a8c8ff',R.l,'key','Opens the sealed gate in the Temple of Eternal Night.'],
  [739,'Royal Seal','#c0a8ff',R.l,'seal','Opens the sealed gate in the Hollow King\'s Domain.'],
  [740,'Key of Endings','#ff2a3a',R.m,'key','Opens the sealed gate on the Throne of the World Eater.'],
  // Abyssal access: the boss before leaves you the way forward
  [741,'Sigil of the Fallen Star','#ffd86a',R.m,'sigil','Lets you enter the Temple of Eternal Night. Never used up.'],
  [742,'Sigil of Eternal Night','#a8c8ff',R.m,'sigil','Lets you enter the Hollow King\'s Domain. Never used up.'],
  [743,'Sigil of the Hollow King','#c0a8ff',R.m,'sigil','Lets you enter the Throne of the World Eater. Never used up.'],
  // passage marks: proof that a boss has fallen, left in your inventory as a keepsake and a key to the next dungeon
  [744,'Mark of the Sentinel','#5dffb0',R.r,'sigil','You defeated the Ancient Sentinel. Opens the way to Crimson Depths.'],
  [745,'Mark of the Sovereign','#ff5a1e',R.r,'sigil','You defeated the Infernal Sovereign. Opens the way to Frozen Catacombs.'],
  [746,'Mark of the Empress','#6ad8ff',R.e,'sigil','You defeated the Frost Empress. Opens the way to Hollow Sanctuary.'],
  [747,'Mark of the Saint','#b070ff',R.e,'sigil','You defeated the Nameless Saint. Opens the way to Dragon\'s Grave.'],
  [748,'Mark of Varkhazan','#ff8a3a',R.l,'sigil','You defeated Varkhazan. Opens the way to Eternal Abyss.'],
  [749,'Mark of the Abyss','#9a5aff',R.l,'sigil','You stood at the bottom of the Eternal Abyss and lived.']];
 const ITEMS={};for(const[id,n,c,p,sh,d]of IT){ITEMS[id]={id,n,c,p,sh,d};try{MAT[id]={n,c,p,d,dg:1}}catch(_){}}
 const isKey=id=>id>=731&&id<=749;
 // the boss -> which item marks passage to the next dungeon
 const MARK={ruins:744,crimson:745,frozen:746,hollow:747,dragon:748,abyss:749,star:741,night:742,king:743};
 // ---- balance. Everything is computed from what a player at that point is expected to carry, then nudged toward what you really carry, so nobody is rewarded for wearing worse gear
 const band=t=>40*Math.pow(1.3,t);
 const dmgB=L=>{try{return LVL9.dmgB(L)}catch(_){return 0}};
 const hpB=L=>{try{return LVL9.hpB(L)}catch(_){return 0}};
 // the strongest weapon a player can legitimately hold today, read from the game's own weapon table, so Abyssal scales when stronger gear is added
 let bestC=0;function bestPower(){if(bestC)return bestC;let b=0;try{for(const id in WPN){const w=WPN[id];if(w.dgmark)continue;const p=+window.WPOWER(id)||0;if(p>b)b=p}}catch(_){}return bestC=Math.max(b,band(5))}
 const expDPS=d=>d.tier=='abyssal'?bestPower()*(1+dmgB(d.lvl)):band(d.gear)*(1+dmgB(d.lvl));
 const expHP=d=>100+hpB(d.lvl)+d.lvl*1.5;
 const myDPS=()=>{try{const b=bonus(),w=+window.WPOWER(wp)||band(0);return w*(1+dmgB(lvl|0))*(1+(b.dmg||0))}catch(_){return band(0)}};
 const clamp=(v,a,b)=>v<a?a:v>b?b:v;
 // how hard you hit, as the dungeon sees it: mostly what was expected, a quarter of what you really carry, capped both ways so a fresh weapon still feels strong
 function refDPS(d){const e=expDPS(d),m=myDPS();return clamp(e*.75+m*.25,e*.85,e*1.6)}
 function refHP(d){const e=expHP(d);let m=e;try{m=maxHP()}catch(_){}return clamp(e*.7+m*.3,e*.9,e*1.8)}
 function mobHP(d,cls,ttk,df){const c=CL[cls]||CL.regular;return Math.round((ttk||c.ttk)*refDPS(d)*df.hp)}
 function mobDmg(d,cls,pct,df){const c=CL[cls]||CL.regular;return Math.round((pct||c.pct)*refHP(d)*df.dmg*10)/10}
 // ---- the save, one per account. Never holds anything a later version could not read: unknown fields are kept
 const KEY=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbdg';const blank=()=>({v:1,clr:{},best:{},first:{},seen:{},bseen:{},disc:{},found:{},sec:{},weekly:{},titles:{},kills:{},deaths:0,bosses:{},miles:{},opt:{shake:1,fx:1,auto:0}});
 let S=blank();function load(){try{const o=JSON.parse(localStorage.getItem(KEY())||'null');if(o&&typeof o=='object'){S=Object.assign(blank(),o);S.opt=Object.assign(blank().opt,o.opt||{})}}catch(_){S=blank()}}load();
 const creative=()=>{try{return !!CRV8.on}catch(_){return false}};
 function save(){if(creative())return;try{localStorage.setItem(KEY(),JSON.stringify(S))}catch(_){}}
 // ---- who may enter. why() is what the player reads; nothing here trusts anything but the save and the inventory
 const cleared=(id)=>{const c=S.clr[id];return !!(c&&(c.normal||c.hard||c.nightmare||c.abyssal||c.cataclysm))};
 const lvlNow=()=>Math.max(lvl|0,window.DG&&DG.lvlOverride|0);
 function gearOK(d){if(d.tier!='abyssal')return true;try{const w=WPN[wp];const r=window.WPNRAR?WPNRAR(wp):'common';return w&&['epic','legendary','mythic'].includes(r)}catch(_){return false}}
 function lockReason(id){const d=BY[id];if(!d)return'No such dungeon';if(lvlNow()<d.entry)return'Reach level '+d.entry;if(d.prev&&!cleared(d.prev)&&!(window.DG&&DG.unlocked&&DG.unlocked[id]))return'Finish '+BY[d.prev].n+' first';if(d.access&&cnt(d.access)<=0&&!(window.DG&&DG.unlocked&&DG.unlocked[id]))return'You need the '+ITEMS[d.access].n;if(!gearOK(d))return'Abyssal needs an Epic weapon or better in your hand';return''}
 const diffOpen=(d,di)=>{const L=diffsOf(d),i=L.indexOf(di);if(i<0)return false;if(i==0)return true;const c=S.clr[d.id];return !!(c&&c[L[i-1]])||!!(window.DG&&DG.unlocked&&DG.unlocked[d.id]=='all')};
 // ---- the ISO week, so weekly challenges roll over at the same moment for everyone
 function weekId(t){const d=new Date(t||Date.now());d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));const y=new Date(Date.UTC(d.getUTCFullYear(),0,1)),w=Math.ceil(((d-y)/864e5+1)/7);return d.getUTCFullYear()+'-'+w}
 return{LIST,BY,DIFF,diffsOf,CL,ITEMS,IT,isKey,MARK,band,expDPS,expHP,myDPS,refDPS,refHP,mobHP,mobDmg,bestPower,clamp,cleared,gearOK,lockReason,diffOpen,weekId,creative,load,save,lvlNow,unlocked:{},lvlOverride:0,get S(){return S},set S(v){S=v}}})()}catch(e){console.error('DG data',e)}
