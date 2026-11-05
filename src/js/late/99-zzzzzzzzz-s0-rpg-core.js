// ===== RPG: one connected progression. Level -> dungeon access -> materials -> weapon upgrades -> Combat Power -> stronger dungeons.
// This file holds the numbers you can tune (CFG) and the Combat Power calculation. Nothing here invents a damage number: Combat Power is built from the same values the
// game hits with (dmgM in the old engine, LVL9, CLASS7 and BAL11), so a test can compare it against real damage on a real monster. See docs/progression-rpg.md. =====
try{window.RPG=(()=>{
 // ---- everything you might want to adjust. The enhancement table is repeated in server/enhance.js, because the server is what charges for it; tests/rpg.js fails if the two differ
 const CFG={
  // Combat Power per point of effective weapon power. Only sets the size of the number
  cpScale:1.6,
  // what each dungeon asks for. A dungeon you have already cleared stays open, so no update can ever lock you out of your own progress
  dungeon:{ruins:{cp:200},crimson:{cp:500},frozen:{cp:700},hollow:{cp:1150},dragon:{cp:1500},abyss:{cp:2200},star:{cp:2450},night:{cp:3000},king:{cp:3400},eater:{cp:3800}},
  // about how long a run takes on Normal, measured by tests/dungeon-fights.js and rounded. Shown as an estimate only
  minutes:{ruins:8,crimson:9,frozen:10,hollow:11,dragon:12,abyss:14,star:18,night:20,king:22,eater:26},
  // gems for clearing a dungeon. The same numbers the server pays a party (server/party.js). Each harder difficulty adds half
  dungeonGems:{ruins:800,crimson:1100,frozen:1500,hollow:2000,dragon:2600,abyss:3400,star:6000,night:7000,king:8000,eater:10000},
  // damage added per enhancement level: the first ten are the big ones
  enhDmg:l=>Math.min(l,10)*.18+Math.max(0,l-10)*.06,
  enhMax:15,
  enhLevel:l=>3+3*l,     // the level needed to go from +l to +l+1
  // [gems, [item, count], ...]. 3 is Stone: the first three upgrades need no dungeon, so a new player can earn the Combat Power for the first dungeon
  enhCost:[
   [100,[3,10]],[250,[3,20]],[450,[3,30]],
   [500,[700,14],[701,8],[703,2]],[800,[700,22],[701,12],[703,5]],[1200,[700,30],[701,16],[704,6]],
   [1700,[701,22],[704,10],[702,3]],[2300,[701,26],[705,12],[702,4]],[3000,[705,14],[706,6],[702,6]],
   [4000,[706,12],[702,8]],[6000,[707,12],[702,10],[709,3]],[8000,[707,16],[708,6]],
   [10000,[708,14],[702,14],[709,4]],[14000,[716,20],[717,6]],[20000,[716,30],[718,8],[719,4],[720,1]]]
 };
 const num=(v,d)=>Number.isFinite(+v)?+v:(d||0);
 // ---- the weapon that counts: the one in your hand, or the last one you held while you hold a tool, so swapping to a pickaxe never makes you "weaker"
 let lastW='fist';
 const isW=id=>{const w=WPN[id];return !!(w&&w.k!='tool'&&w.md>0)};
 function activeId(){try{if(isW(wp)){lastW=wp;return wp}if(isW(lastW)&&own[lastW])return lastW}catch(_){}return'fist'}
 // ---- a mythic weapon's ascension tiers really add damage, so they count too
 function mythMul(id){try{const w=WPN[id];if(!w||!w.myth)return 1;const k=CLASS7.of(w),t=(typeof MYTH!='undefined'?MYTH.tier(k):0)|0;return 1+(typeof MYTH!='undefined'?MYTH.DMG:.25)*Math.max(0,t-1)}catch(_){return 1}}
 const classOf=id=>{try{return CLASS7.of(WPN[id])}catch(_){return null}};
 // ---- the calculation, with the upgrade level as an argument so the forge can preview the next one exactly
 function parts(id,up){id=id||activeId();const w=WPN[id],out={id,up:0,total:0,weapon:0,enh:0,gear:0,prog:0,dmgPct:0};if(!w||!(w.md>0))return out;
  const u=up==null?(wUp[id]|0):up,b=bonus(),L=lvl|0,f=(prof.fight&&prof.fight.l)|0;out.up=u;
  const base=num(window.WPOWER&&WPOWER(id),w.md)*mythMul(id),eu=CFG.enhDmg(u),k=classOf(id);
  // the additive part of dmgM: fight level + enhancement + gear
  const aProg=f*.04,aGear=num(b.pow)*.08+num(b.dmg);
  const fE=(1+aProg+aGear+eu)/(1+aProg+aGear),fA=1+aProg+aGear;
  // level and class. Every class grows by the same total value g, however it spends it (speed, crits, lifesteal...), which is what makes this fair between classes
  const lvM=1+num(LVL9.dmgB(L)),clsM=1+(k?num(CLASS7.gOf(CLASS7.lv(k))):0);
  // crits: the same odds and size the game rolls. The part that comes from fight level is progression, the rest is gear
  const cPr=Math.min(.6,.06+f*.004),cAll=Math.min(.6,cPr+num(b.crit)),cs=.75+num(b.cdmg),crP=1+cPr*.75,crA=1+cAll*cs;
  // staying alive is worth something, but much less than damage: a quarter-power curve on effective health
  const lvHP=100+num(LVL9.hpB(L)),lvArm=num(LVL9.armB(L));let arm=Math.min(.75,num(b.arm));if(k=='knight'){try{arm=Math.max(0,arm-num(CLASS7.bon(k,CLASS7.lv(k)).arm))}catch(_){}}
  let hp=lvHP;try{hp=maxHP()}catch(_){}const eff=(h,a)=>h/(1-Math.min(.75,a)),svP=Math.pow(eff(lvHP,lvArm)/100,.25),svA=Math.pow(Math.max(eff(hp,arm),eff(lvHP,lvArm))/100,.25);
  // four factors. Their logarithms decide who gets the credit for what they multiply together, so the four lines always add up to the total
  const W=CFG.cpScale*base,fEnh=fE,fProg=(1+aProg)*lvM*clsM*crP*svP,fGear=(fA/(1+aProg))*(crA/crP)*(svA/svP),T=W*fEnh*fProg*fGear;
  const lE=Math.log(fEnh),lP=Math.log(fProg),lG=Math.log(fGear),ls=lE+lP+lG||1,ex=T-W;
  out.weapon=Math.round(W);out.total=Math.round(T);out.enh=Math.round(ex*lE/ls);out.gear=Math.round(ex*lG/ls);out.prog=out.total-out.weapon-out.enh-out.gear;
  out.dmgPct=Math.round(eu*100);return out}
 const cp=()=>{try{return parts().total}catch(_){return 0}};
 // ---- real damage of one normal hit for a weapon at an upgrade level, the same sum as dmgM. Used by the forge's preview
 function hitDamage(id,up){const w=WPN[id];if(!w)return 0;const b=bonus(),f=(prof.fight&&prof.fight.l)|0;return Math.round(w.md*(1+f*.04+CFG.enhDmg(up==null?(wUp[id]|0):up)+num(b.pow)*.08+num(b.dmg))*(1+num(LVL9.dmgB(lvl|0))))}
 // expected damage over time: lets a fast weapon and a heavy one be compared fairly, on top of the base number
 const dps=(id,up)=>{const w=WPN[id];if(!w)return 0;return Math.round(num(window.WPOWER&&WPOWER(id),w.md)*mythMul(id)*(1+CFG.enhDmg(up==null?(wUp[id]|0):up)))};
 // ---- who may enter: level, then what came before, then Combat Power
 function reqs(id){const d=DG.BY[id],c=CFG.dungeon[id]||{},L=DG.lvlNow(),C=cp(),out=[];if(!d)return out;out.push({k:'level',n:'Level '+d.entry,need:d.entry,have:L,ok:L>=d.entry});out.push({k:'cp',n:(c.cp|0)+' Combat Power',need:c.cp|0,have:C,ok:C>=(c.cp|0)||DG.cleared(id)});
  const free=!!(DG.unlocked&&DG.unlocked[id]);if(d.prev)out.push({k:'prev',n:'Finish '+DG.BY[d.prev].n,ok:DG.cleared(d.prev)||free,go:d.prev});if(d.access)out.push({k:'access',n:DG.ITEMS[d.access].n,ok:cnt(d.access)>0||free,item:d.access});if(d.tier=='abyssal')out.push({k:'gear',n:'An Epic weapon or better in your hand',ok:DG.gearOK(d)});return out}
 function short(id){const r=reqs(id),l=r.find(q=>q.k=='level'),c=r.find(q=>q.k=='cp');return{level:l&&!l.ok?l.need-l.have:0,cp:c&&!c.ok?c.need-c.have:0}}
 {const _lr=DG.lockReason;DG.lockReason=function(id){const w=_lr.apply(this,arguments);if(w)return w;try{const c=CFG.dungeon[id];if(c&&!DG.cleared(id)&&!(DG.unlocked&&DG.unlocked[id])&&!DG.creative()){const C=cp();if(C<c.cp)return'You need '+(c.cp-C)+' more Combat Power ('+C+' of '+c.cp+')'}}catch(e){console.error('RPG lock',e)}return''}}
 // ---- saved progress of the guide, the roadmap and paid-out milestones, one per account
 const KEY=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbrpg',blank=()=>({v:1,tour:{step:0,done:0,off:0,paused:0},paid:{},opt:{vol:.9,mute:0,sub:1,auto:1},seenLv:0});
 let S=blank();function load(){try{const o=JSON.parse(localStorage.getItem(KEY())||'null');if(o&&typeof o=='object'){S=Object.assign(blank(),o);S.tour=Object.assign(blank().tour,o.tour||{});S.opt=Object.assign(blank().opt,o.opt||{});S.paid=o.paid&&typeof o.paid=='object'?o.paid:{}}}catch(_){S=blank()}}load();
 const save=()=>{try{if(DG.creative())return}catch(_){}try{localStorage.setItem(KEY(),JSON.stringify(S))}catch(_){}};
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 return{CFG,parts,cp,hitDamage,dps,reqs,short,activeId,isW,classOf,esc,save,load,get S(){return S}}})()}catch(e){console.error('RPG core',e)}
