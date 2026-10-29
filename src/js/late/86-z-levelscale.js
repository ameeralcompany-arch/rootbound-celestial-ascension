// ===== LVL9: level power. Every level makes you stronger on a smooth, softly capped curve: about +3% damage per level early on
// (approaching +150%), extra max HP (approaching +120) and a little armour (approaching +10%). One multiplier on hurtMob covers every weapon.
// Bosses toughen with your level more slowly than you grow, so they stay beatable but never trivial. Weapons with a level requirement
// (WPN[id].lv) cannot be used or kept equipped below it. Shown on the Profile tab, in the inventory Stats and on level up. =====
const LVL9=(()=>{
 const E=(L,k)=>1-Math.exp(-(Math.max(1,L)-1)/k);
 const dmgB=L=>1.5*E(L,45),hpB=L=>Math.round(120*E(L,40)),armB=L=>.1*E(L,50),bossB=L=>1+.65*dmgB(L);
 const pct=v=>Math.round(v*100);
 let cL=-1,cD=0,cH=0,cA=0;const upd=()=>{const L=lvl|0;if(L!==cL){cL=L;cD=dmgB(L);cH=hpB(L);cA=armB(L)}};
 // ---- stats: max HP + armour through bonus(), damage through one hurtMob multiplier (player weapon hits only)
 {const _b=bonus;bonus=function(){const r=_b.apply(this,arguments);upd();r.hp=(r.hp||0)+cH;r.arm=Math.min(.75,(r.arm||0)+cA);return r}}
 {const _hm=hurtMob;hurtMob=function(m,d,w,ang){if(w&&d>0&&d<1e5){upd();if(cD>0)d=Math.round(d*(1+cD))}return _hm.call(this,m,d,w,ang)}}
 // ---- bosses: more health the higher you are (x1.65 at most), scaled once per boss, keeping its current health fraction
 const scaleBoss=m=>{if(!m||!m.boss||m.lvS)return;m.lvS=1;upd();const k=bossB(cL);m.hp=Math.round(m.hp*k);m.mhp=Math.round((m.mhp||m.hp/k)*k)};
 {const _sp=BOSS6.spawn;BOSS6.spawn=function(){const r=_sp.apply(this,arguments);try{scaleBoss(BOSS6.active())}catch(_){}return r}}
 {const _t=BOSS6.tick;BOSS6.tick=function(dt){_t.call(this,dt);try{for(let i=0;i<mobs.length;i++){const m=mobs[i];if(m.boss&&!m.lvS&&m.hp>0)scaleBoss(m)}}catch(_){}}}
 // ---- level-gated weapons: blocked when used, swapped back to your last allowed weapon if equipped any other way
 const okW=id=>{const w=WPN[id];return !w||(w.lv|0)<=(lvl|0)};
 let lastOk='fist',warnT=0;
 function gate(){if(!WPN[wp])return true;if(okW(wp)){lastOk=wp;return true}const w=WPN[wp];wp=own[lastOk]&&okW(lastOk)&&WPN[lastOk]?lastOk:'fist';
  const n=performance.now();if(n-warnT>1200){warnT=n;try{say('Reach level '+w.lv+' to use '+w.n)}catch(_){}try{UIS.play('error')}catch(_){}}try{renderBar()}catch(_){}return false}
 {const _u=update;update=function(dt){gate();const r=_u.apply(this,arguments);gate();return r}}
 {const _uw=useWeapon;useWeapon=function(){if(!gate())return;return _uw.apply(this,arguments)}}
 // ---- level up: a floating "power up", plus a banner when new weapons unlock
 let seenL=null;
 setInterval(()=>{try{const L=lvl|0;if(seenL===null||!entered){seenL=L;return}if(L<=seenL){seenL=L;return}const o=seenL;seenL=L;upd();
  const un=Object.keys(WPN).filter(id=>(WPN[id].lv|0)>o&&(WPN[id].lv|0)<=L).map(id=>WPN[id].n);
  try{ft(P.x,P.y-44,'Power +'+pct(cD)+'%','#ffd24a')}catch(_){}
  if(un.length)try{UI6.say6('Level '+L+': new weapon'+(un.length>1?'s':'')+' unlocked',un.join(', ')+' · find '+(un.length>1?'them':'it')+' in the Store',3400)}catch(_){}}catch(_){}},500);
 // ---- Profile tab card
 function card(body){upd();const L=lvl|0,nx=dmgB(L+1)-cD,d=document.createElement('div');d.className='lvp9';
  d.innerHTML='<h4>Level power</h4><div class="kv7"><div><small>Damage</small><b>+'+pct(cD)+'%</b></div><div><small>Max HP</small><b>+'+cH+'</b></div><div><small>Armor</small><b>+'+pct(cA)+'%</b></div></div>'+
   '<p class="dim">Every level makes all of your weapons stronger (next level: +'+(nx*100).toFixed(1)+'% damage). Bosses toughen up as you level too, but more slowly than you.</p>';
  const host=body.querySelector('.prof>div:last-child')||body;host.appendChild(d)}
 // (installed after every script has loaded: the settings module replaces UI6.ext.post outright)
 setTimeout(()=>{try{const _p=UI6.ext.post;UI6.ext.post=function(tab,body){if(_p)_p.apply(this,arguments);try{if(tab=='profile')card(body)}catch(e){console.error('LVL9 profile',e)}}}catch(e){console.error('LVL9 hub',e)}},0);
 const info=()=>{upd();return{lvl:lvl|0,dmg:cD,hp:cH,arm:cA,boss:bossB(lvl|0)}};
 return{dmgB,hpB,armB,bossB,okW,gate,info,pct}})();
