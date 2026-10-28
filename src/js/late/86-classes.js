// ===== CLASS7: weapon classes (Brawler, Knight, Samurai, Archer, Mage, Demon, Reaper, Elementalist, Stormcaller, Berserker, Ninja, Druid).
// Your class is the class of the weapon in your hand. Each class levels up on its own from hits and kills made with its weapons,
// and every level makes that class's weapons stronger and its passive better. State: key rbc4 (account-namespaced). =====
const CLASS7=(()=>{
 const MAX=100,need=l=>Math.round(40+l*l*22);
 const C={
  brawler:{n:'Brawler',c:'#ffb27a',ic:'✊',ids:['fist','pan'],p:'Swift Fists: attacks recover up to 30% faster'},
  knight:{n:'Knight',c:'#ffd86a',ic:'🛡',ids:['ember','frost','solarfang','skyspear'],p:'Valor: heavier knockback, hits sometimes stun'},
  samurai:{n:'Samurai',c:'#ff7a9a',ic:'⚔',ids:['astralkat','frostbite'],p:'Iaido: up to 35% chance for a 1.6x critical cut'},
  archer:{n:'Archer',c:'#8affc0',ic:'🏹',ids:['zephyrbow','crowbow','icebow'],p:'Eagle Eye: more damage the farther the target'},
  mage:{n:'Mage',c:'#d08aff',ic:'✨',ids:['arcane','starwand','frostwand','chainwand','gravitystaff'],p:'Arcane Surge: +0.8% spell damage per level'},
  demon:{n:'Demon',c:'#ff4a5a',ic:'😈',ids:['blood','voidwand','tendrilwand','umbra','umbra1','umbra2','umbra3'],p:'Hunger: hits steal life'},
  reaper:{n:'Reaper',c:'#9a7aff',ic:'💀',ids:['void','sickle','crimsonrift'],p:'Harvest Souls: big damage to weakened foes, kills heal you'},
  elementalist:{n:'Elementalist',c:'#7ad8ff',ic:'🔥',ids:['cinder','cinder1','cinder2','cinder3','rime','rime1','rime2','rime3'],p:'Attunement: burns, chills and freezes last longer'},
  stormcaller:{n:'Stormcaller',c:'#fff07a',ic:'⚡',ids:['spark','spark1','spark2','spark3','hammer','stormflail'],p:'Static: hits can stun, more often each level'},
  berserker:{n:'Berserker',c:'#ff8a4a',ic:'🪓',ids:['titanmaul'],p:'Rage: the lower your health, the harder you hit'},
  ninja:{n:'Ninja',c:'#9adcff',ic:'🌀',ids:['galeshuriken','moonchakram','glaive'],p:'Shadowstep: faster attacks and the odd critical'},
  druid:{n:'Druid',c:'#9aff7a',ic:'🌿',ids:['verdant','thornlash','venom'],p:'Grove: slowly regenerate health while holding a druid weapon'}
 };
 const BYK={fist:'brawler',pan:'brawler',sword:'knight',spear:'knight',bow:'archer',wand:'mage',staff:'mage',scythe:'reaper',sickle:'reaper',hammer:'stormcaller',maul:'berserker',flail:'berserker',shuriken:'ninja',chakram:'ninja',glaive:'ninja',whip:'druid'};
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
   try{if(L%5==0)UI6.say6(C[k].n+' level '+L,C[k].p,2600);else say(C[k].n+' class level '+L+'!')}catch(_){}
   try{VFX.levelUp(P.x,P.y+20)}catch(_){try{burst(P.x,P.y+20,C[k].c,20,200,4,'p')}catch(__){}}
   try{SFX7.tone(523,523,.18,'triangle',.04);SFX7.tone(784,784,.22,'triangle',.04,.1);SFX7.tone(1047,1047,.3,'sine',.04,.2)}catch(_){}}
  if(S.lv[k]>=MAX)S.xp[k]=0}
 const cur=()=>{try{return of(WPN[wp])}catch(_){return null}};
 // ---- damage + passives: one wrapper on hurtMob sees every weapon hit
 {const _hm=hurtMob;hurtMob=function(m,d,w,ang){const k=of(w);if(!k||!(d>0))return _hm.apply(this,arguments);const L=lv(k),R=Math.random;let mul=1+(L-1)*.02;
   if(k=='samurai'&&R()<Math.min(.35,L*.005))mul*=1.6;
   if(k=='ninja'&&R()<Math.min(.2,L*.003))mul*=1.5;
   if(k=='archer'){const dd=Math.hypot(m.x-P.x,m.y-P.y)/T;if(dd>3)mul*=1+Math.min(.6,(dd-3)*L*.0025)}
   if(k=='mage')mul*=1+L*.008;
   if(k=='reaper'&&m.hp<(m.mhp||m.hp*3)*.3)mul*=1.5+L*.01;
   if(k=='berserker'){const lo=1-P.hp/Math.max(1,maxHP());mul*=1+lo*L*.015}
   const was=m.hp>0,r=_hm.call(this,m,Math.round(d*mul),w,ang);
   try{if(was){const dealt=Math.max(0,d*mul);
     if(k=='demon')P.hp=Math.min(maxHP(),P.hp+dealt*Math.min(.15,.03+L*.0012));
     if((k=='knight'||k=='stormcaller')&&R()<Math.min(.3,L*.004))m.stun=Math.max(m.stun||0,.7);
     if(k=='knight')m.vx+=Math.cos(ang||0)*(60+L*2);
     if(k=='elementalist'){if(m.burn>0)m.burn+=.4+L*.01;if(m.slow>0)m.slow+=.4+L*.01;if(m.frz>0)m.frz+=.2+L*.005}
     gainXp(k,Math.max(1,Math.min(8,Math.round(dealt/12))));
     if(m.hp<=0){gainXp(k,m.boss?60:6+Math.round(((MK[m.k]||{}).gem||1)*3));if(k=='reaper')P.hp=Math.min(maxHP(),P.hp+3+L*.1)}}}catch(_){}
   return r}}
 // max-hp memo so Reaper knows what "weakened" means
 setInterval(()=>{try{for(const m of mobs)if(!m.mhp||m.hp>m.mhp)m.mhp=m.hp}catch(_){}},250);
 // attack-speed passives
 {const _uw=useWeapon;useWeapon=function(){const r=_uw.apply(this,arguments);try{const k=cur();if((k=='brawler'||k=='ninja')&&wcd>0)wcd*=1-Math.min(k=='brawler'?.3:.2,lv(k)*.004)}catch(_){}return r}}
 // druid regen
 setInterval(()=>{try{if(entered&&cur()=='druid'&&P.hp>0&&P.hp<maxHP())P.hp=Math.min(maxHP(),P.hp+1+lv('druid')*.04)}catch(_){}},2000);
 // ---- HUD badge
 let badge=null,lastTxt='';
 function hud(){try{if(!badge){const host=document.getElementById('hudL');if(!host)return;badge=document.createElement('div');badge.id='clsBadge';badge.title='Your class (open the hub with C > Classes)';
    if(getComputedStyle(host).position=='static')host.style.position='relative';
    badge.style.cssText='position:absolute;right:12px;bottom:-12px;padding:2px 9px;border-radius:999px;font:600 11px/18px system-ui,sans-serif;color:#fff;background:rgba(20,18,30,.72);display:inline-block;cursor:pointer;pointer-events:auto;white-space:nowrap;z-index:2';badge.onclick=()=>{try{UI6.open('classes')}catch(_){}};host.appendChild(badge)}
   const k=cur();const t=k?C[k].ic+' '+C[k].n+' Lv '+lv(k)+' · '+Math.floor(100*S.xp[k]/need(lv(k)))+'%':'';if(t!==lastTxt){lastTxt=t;badge.textContent=t;badge.style.display=t?'inline-block':'none';if(k)badge.style.boxShadow='inset 0 0 0 1.5px '+C[k].c}}catch(_){}}
 setInterval(hud,500);
 // ---- hub tab
 try{UI6.TABS.splice(UI6.TABS.findIndex(t=>t[0]=='settings'),0,['classes','Classes']);
  UI6.ext.classes=function(){const esc=UI6.esc,k0=cur();let h='<h3>Classes</h3><p class="dim">Your class is the class of the weapon in your hand. Each class levels up on its own from the hits and kills you make with its weapons. Every level adds 2% damage to that class\'s weapons and strengthens its passive.</p><div class="hgrid">';
   for(const k in C){const c=C[k],L=lv(k),pc=L>=MAX?100:Math.floor(100*S.xp[k]/need(L)),ws=c.ids.filter(id=>WPN[id]);
    h+='<div class="hcard'+(k==k0?' on':'')+'" style="border-color:'+c.c+'"><b style="color:'+c.c+'">'+c.ic+' '+esc(c.n)+(k==k0?' (active)':'')+'</b><small>Level '+L+(L>=MAX?' (max)':'')+'</small>'+
     '<div class="stat"><div class="bar"><i style="width:'+pc+'%;background:'+c.c+'"></i></div></div><small>'+esc(c.p)+'</small><small class="dim">'+ws.map(id=>esc(WPN[id].n)+(own[id]?' ✓':'')+(WPN[id].move?' - '+esc(WPN[id].move):'')).join('<br>')+'</small></div>'}
   UI6.body.innerHTML=h+'</div>'}}catch(e){console.error('CLASS7 tab',e)}
 return{C,S,of,lv,need,gainXp,cur}})();
