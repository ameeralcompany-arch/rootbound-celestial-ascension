// ===== CLASS7: weapon classes (Brawler, Knight, Samurai, Archer, Mage, Demon, Reaper, Elementalist, Stormcaller, Berserker, Ninja, Druid, Gunslinger).
// Your class is the class of the weapon in your hand. Each class levels up on its own from hits and kills made with its weapons,
// and every level makes that class's weapons stronger and its passive better. State: key rbc4 (account-namespaced). =====
const CLASS7=(()=>{
 const MAX=100,need=l=>Math.round(40+l*l*22);
 const C={
  brawler:{n:'Brawler',c:'#ffb27a',ic:'✊',ids:['fist','pan','emberfist'],p:'Swift Fists: attacks recover up to 30% faster'},
  knight:{n:'Knight',c:'#ffd86a',ic:'🛡',ids:['ember','frost','solarfang','skyspear','tidecaller'],p:'Valor: heavier knockback, hits sometimes stun'},
  samurai:{n:'Samurai',c:'#ff7a9a',ic:'⚔',ids:['astralkat','frostbite','sakurakat'],p:'Iaido: up to 35% chance for a 1.6x critical cut'},
  archer:{n:'Archer',c:'#8affc0',ic:'🏹',ids:['zephyrbow','crowbow','icebow','raijinbow'],p:'Eagle Eye: more damage the farther the target'},
  mage:{n:'Mage',c:'#d08aff',ic:'✨',ids:['arcane','starwand','frostwand','chainwand','gravitystaff','lumistaff'],p:'Arcane Surge: +0.8% spell damage per level'},
  demon:{n:'Demon',c:'#ff4a5a',ic:'😈',ids:['blood','voidwand','tendrilwand','umbra','umbra1','umbra2','umbra3'],p:'Hunger: hits steal life'},
  reaper:{n:'Reaper',c:'#9a7aff',ic:'💀',ids:['void','sickle','crimsonrift'],p:'Harvest Souls: big damage to weakened foes, kills heal you'},
  elementalist:{n:'Elementalist',c:'#7ad8ff',ic:'🔥',ids:['cinder','cinder1','cinder2','cinder3','rime','rime1','rime2','rime3'],p:'Attunement: burns, chills and freezes last longer'},
  stormcaller:{n:'Stormcaller',c:'#fff07a',ic:'⚡',ids:['spark','spark1','spark2','spark3','hammer','stormflail'],p:'Static: hits can stun, more often each level'},
  berserker:{n:'Berserker',c:'#ff8a4a',ic:'🪓',ids:['titanmaul','dragonaxe'],p:'Rage: the lower your health, the harder you hit'},
  ninja:{n:'Ninja',c:'#9adcff',ic:'🌀',ids:['galeshuriken','moonchakram','glaive'],p:'Shadowstep: faster attacks and the odd critical'},
  druid:{n:'Druid',c:'#9aff7a',ic:'🌿',ids:['verdant','thornlash','venom'],p:'Grove: slowly regenerate health while holding a druid weapon'},
  gunslinger:{n:'Gunslinger',c:'#7ad8ff',ic:'🔫',ids:['popgun','revolver','shotgun','smg','moonpistol','sniper','rocket','prismcannon'],p:'Deadeye: faster trigger (up to 20%) and up to 30% chance for a 1.7x headshot'}
 };
 // ---- class level bonuses (balanced): every class grows by the same total value V(L)=1+g(L), g = 0.9*(1-e^-(L-1)/40) (+18% at 10, +41% at 25,
 // +63% at 50, +82% at 100). It is split into a shared damage part (1+0.6g) and a class perk worth p=(1+g)/(1+0.6g)-1 (+18% at 50), each
 // perk feeling different: speed, crits, range, execute, rage, lifesteal, armour, regen, chain sparks... Safety perks (Knight armour, Demon
 // lifesteal, Druid regen) carry half of p as damage and count the other half as survival. Level 1 = no bonus, so classes start equal.
 const gOf=L=>.9*(1-Math.exp(-(Math.max(1,L)-1)/40));
 function bon(k,L){const g=gOf(L),p=(1+g)/(1+.6*g)-1,o={g,p,dmg:1+.6*g,spd:0,crit:0,cm:1.6,far:0,exe:0,rage:0,ls:0,arm:0,regen:0,stun:0,arc:0,aff:0,floor:0};
  switch(k){case'brawler':o.spd=p;break;case'ninja':o.spd=p/2;o.crit=Math.min(.6,2*((1+p)/(1+p/2)-1));o.cm=1.5;break;case'samurai':o.crit=Math.min(.6,p/.6);o.cm=1.6;break;
   case'gunslinger':o.spd=p/2;o.crit=Math.min(.6,((1+p)/(1+p/2)-1)/.7);o.cm=1.7;break;case'archer':o.far=p;break;case'mage':o.dmg*=1+p;o.cdr=.15*g;break;
   case'demon':o.dmg*=1+p/2;o.ls=.03+.1*g;break;case'reaper':o.exe=Math.max(0,.35/Math.max(.05,1/(1+p)-.65)-1);break;
   case'elementalist':o.aff=p;break;case'stormcaller':o.arc=Math.min(.9,2*p);o.stun=Math.min(.3,p);break;case'berserker':o.floor=.3*p;o.rage=2*p;break;
   case'druid':o.dmg*=1+p/2;o.regen=1+5*g;break;case'knight':o.dmg*=1+p/2;o.arm=.12*g/.9;o.stun=Math.min(.3,p);break}
  return o}
 const pc=v=>Math.round(v*100)+'%';
 function perk(k,L){const o=bon(k,L);return({brawler:'Swift Fists: +'+pc(o.spd)+' attack speed',ninja:'Shadowstep: +'+pc(o.spd)+' attack speed, '+pc(o.crit)+' chance of a 1.5x critical',samurai:'Iaido: '+pc(o.crit)+' chance of a 1.6x critical cut',
  gunslinger:'Deadeye: +'+pc(o.spd)+' trigger speed, '+pc(o.crit)+' chance of a 1.7x headshot',archer:'Eagle Eye: +'+pc(o.far*1.2)+' damage to targets 4+ tiles away (+'+pc(o.far*.4)+' up close)',mage:'Arcane Surge: +'+pc(o.p)+' spell power, gear skills recharge '+pc(o.cdr)+' faster',
  demon:'Hunger: hits steal '+pc(o.ls)+' as life',reaper:'Harvest Souls: +'+pc(o.exe)+' damage to foes under 35% health, kills heal you',elementalist:'Attunement: +'+pc(o.aff*1.15)+' damage to burning, chilled or frozen foes; effects last longer',
  stormcaller:'Static: '+pc(o.arc)+' chance of a chain spark for +50% damage; hits can stun',berserker:'Rage: up to +'+pc(o.floor+o.rage)+' damage as your health drops',druid:'Grove: regenerate '+o.regen.toFixed(1)+' HP every 2 s holding a druid weapon',
  knight:'Valor: +'+pc(o.arm)+' armour, heavier knockback, hits can stun'})[k]+(L>1?' · +'+pc(o.dmg-1)+' damage':'')}
 const BYK={fist:'brawler',knuckle:'brawler',pan:'brawler',sword:'knight',spear:'knight',bow:'archer',wand:'mage',staff:'mage',scythe:'reaper',sickle:'reaper',hammer:'stormcaller',maul:'berserker',flail:'berserker',shuriken:'ninja',chakram:'ninja',glaive:'ninja',whip:'druid',gun:'gunslinger'};
 for(const k in C)C[k].ids.push('myth_'+k);   // each class's mythic scythe (99-zzzzzzzzz-2-mythic.js)
 const OF={};for(const k in C)for(const id of C[k].ids)OF[id]=k;
 const of=w=>w?(OF[w.id]||BYK[w.k]||null):null;
 const S={lv:{},xp:{}};for(const k in C){S.lv[k]=1;S.xp[k]=0}
 let dirty=false;
 function load(){let o=null;try{o=JSON.parse(localStorage.getItem('rbc4')||'null')}catch(_){}if(!o||typeof o!='object')return;
  for(const k in C){const l=+((o.lv||{})[k]),x=+((o.xp||{})[k]);if(Number.isFinite(l))S.lv[k]=Math.max(1,Math.min(MAX,l|0));if(Number.isFinite(x))S.xp[k]=Math.max(0,Math.min(1e9,x))}}
 function save(){if(!dirty)return;dirty=false;try{localStorage.setItem('rbc4',JSON.stringify(S))}catch(_){}}
 load();setInterval(save,4000);addEventListener('beforeunload',()=>{dirty=true;save()});
 const lv=k=>S.lv[k]||1;
 function gainXp(k,n){if(!k||!C[k]||lv(k)>=MAX)return;S.xp[k]+=n;dirty=true;
  while(S.lv[k]<MAX&&S.xp[k]>=need(S.lv[k])){S.xp[k]-=need(S.lv[k]);S.lv[k]++;const L=S.lv[k];
   try{if(L%5==0)UI6.say6(C[k].n+' level '+L,perk(k,L),2600);else say(C[k].n+' class level '+L+'!')}catch(_){}
   try{VFX.levelUp(P.x,P.y+20)}catch(_){try{burst(P.x,P.y+20,C[k].c,20,200,4,'p')}catch(__){}}
   try{SFX7.tone(523,523,.18,'triangle',.04);SFX7.tone(784,784,.22,'triangle',.04,.1);SFX7.tone(1047,1047,.3,'sine',.04,.2)}catch(_){}}
  if(S.lv[k]>=MAX)S.xp[k]=0}
 // the class of the weapon in your hand; with bare fists or a tool it is the class you chose at a class master (CJOB), if any
 const cur=()=>{try{const w=WPN[wp];if((!w||wp=='fist'||w.k=='tool')&&typeof CJOB!='undefined'&&CJOB.cur)return CJOB.cur;return of(w)}catch(_){return null}};
 // ---- damage + passives: one wrapper on hurtMob sees every weapon hit
 const BC={};const bonC=(k,L)=>{const c=BC[k];if(c&&c.L===L)return c.o;const o=bon(k,L);BC[k]={L,o};return o};
 {const _hm=hurtMob;hurtMob=function(m,d,w,ang){const k=of(w);if(!k||!(d>0))return _hm.apply(this,arguments);const L=lv(k),R=Math.random,o=bonC(k,L);let mul=o.dmg;
   if(o.crit>0&&R()<o.crit)mul*=o.cm;
   if(o.far>0){const dd=Math.hypot(m.x-P.x,m.y+m.h/2-P.y-P.h/2)/T;mul*=1+o.far*(dd>=4?1.2:.4)}
   if(o.exe>0&&m.hp<(m.mhp||m.hp*3)*.35)mul*=1+o.exe;
   if(o.rage>0||o.floor>0){const lo=Math.max(0,1-P.hp/Math.max(1,maxHP()));mul*=1+o.floor+o.rage*lo}
   if(o.aff>0)mul*=1+o.aff*(m.burn>0||m.slow>0||m.frz>0?1.15:.3);
   let spk=0;if(o.arc>0&&R()<o.arc){mul*=1.5;spk=1}
   const was=m.hp>0,r=_hm.call(this,m,Math.round(d*mul),w,ang);
   try{if(was){const dealt=Math.max(0,d*mul);
     if(spk)try{VFX.burst(m.x,m.y+m.h/2,['#fff6a0','#fff'],5,160,1,.3,8)}catch(_){}
     if(o.ls>0)P.hp=Math.min(maxHP(),P.hp+dealt*o.ls);
     if(o.stun>0&&!m.boss&&R()<o.stun)m.stun=Math.max(m.stun||0,.7);
     if(k=='knight'&&!m.boss)m.vx+=Math.cos(ang||0)*(60+L*2);
     if(k=='elementalist'){const e=1+o.g;if(m.burn>0)m.burn+=.3*e;if(m.slow>0)m.slow+=.3*e;if(m.frz>0)m.frz+=.15*e}
     gainXp(k,Math.max(1,Math.min(8,Math.round(dealt/12))));
     if(m.hp<=0){gainXp(k,m.boss?60:6+Math.round(((MK[m.k]||{}).gem||1)*3));if(k=='reaper')P.hp=Math.min(maxHP(),P.hp+3+L*.1)}}}catch(_){}
   return r}}
 // max-hp memo so Reaper knows what "weakened" means
 setInterval(()=>{try{for(const m of mobs)if(!m.mhp||m.hp>m.mhp)m.mhp=m.hp}catch(_){}},250);
 // attack-speed passives
 {const _uw=useWeapon;useWeapon=function(){const r=_uw.apply(this,arguments);try{const k=cur();if(k&&wcd>0){const o=bonC(k,lv(k));if(o.spd>0)wcd/=1+o.spd}}catch(_){}return r}}
 // knight armour (through bonus(), so every hit taken is reduced), mage skill cooldowns
 {const _b=bonus;bonus=function(){const r=_b.apply(this,arguments);try{const k=cur();if(k=='knight')r.arm=Math.min(.75,(r.arm||0)+bonC(k,lv(k)).arm);else if(k=='mage')r.cdr=Math.min(.5,(r.cdr||0)+bonC(k,lv(k)).cdr)}catch(_){}return r}}
 // druid regen
 setInterval(()=>{try{if(entered&&cur()=='druid'&&P.hp>0&&P.hp<maxHP())P.hp=Math.min(maxHP(),P.hp+bonC('druid',lv('druid')).regen)}catch(_){}},2000);
 // the class screen itself is CLS9 (98-z-classui.js): one CLASSES button in the top bar, or K
 return{C,S,of,lv,need,gainXp,cur,bon,perk,gOf}})();
