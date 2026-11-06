// ===== DG.bossAI: bosses that read the fight. On top of each boss's own weights it chooses by distance and by how you play (keep away and it closes in; stay close and it
// clears the space around it), never repeats its strongest abilities back to back, holds back when the floor is already full of hazards, answers a flurry with a warned counter and a
// burst with a short guard. All timers run on the boss's own game clock (m.ph), so slow motion and pauses never stretch them. Every reaction is warned like any other attack and has a cooldown. Reactions live in def.kit so co-op can replay them. =====
try{(()=>{
 const DG=window.DG,A=DG.A,fx=DG.fx,now=()=>performance.now();
 const RANGED=['archer','gunslinger','mage','elementalist','stormcaller'];
 const isUlt=(m,a)=>!!(a.ult||(m.dgx.legend&&m.dgx.legend.ult&&m.dgx.legend.ult.includes(a.name)));
 // a counter: the boss flashes its own colour for over half a second, then a ring bursts around it. Step back or jump
 const counter=def=>({name:'counter',wind:.62,rec:.55,start(m){fx.c(m.x,m.y+m.h/2,T*3.2,.6,.25,{c:def.c,dmg:A.dmg(m,.55),kind:'slam',kb:520})},fire(m){try{A.wave(m.x,m.y+m.h/2,def.c,T*4,.5,.3)}catch(_){}}});
 // a guard: a visible shield for two seconds that takes most of the damage. Wait it out or use the time to heal and reposition
 const guard=def=>({name:'guard',wind:.25,rec:.3,start(m){m.guardUntil=m.ph+2.2;A.say('',def.n+' guards',800)}});
 for(const id in DG.boss.DEF){const def=DG.boss.DEF[id];if(!def.isBoss||id[0]=='_')continue;def.kit=(def.kit||[]).concat([counter(def),guard(def)])}
 const findK=(def,n)=>def.kit.find(a=>a.name==n);
 // what the boss has seen of you lately: hits it took and how hard
 {const _hm=hurtMob;hurtMob=function(m,d,w,ang){if(m&&m.dgb&&!m.inv&&d>0){if(m.guardUntil&&m.ph<m.guardUntil)d=Math.max(1,Math.round(d*.5));const r=_hm.call(this,m,d,w,ang);try{const h=m.aiH||(m.aiH=[]),t=m.ph;h.push([t,d]);while(h.length&&t-h[0][0]>2)h.shift()}catch(_){}return r}return _hm.apply(this,arguments)}}
 const AI={
  // a forced answer, chosen before the boss's normal pick
  force(m,def){if(!def.legend)return null;const t=m.ph,h=(m.aiH||[]).filter(q=>t-q[0]<1.5),d=A.dist(m);
   if(h.length>=6&&d<T*4&&(m.cAt==null||t-m.cAt>12)){m.cAt=t;m.aiH.length=0;return findK(def,'counter')}
   const burst=(m.aiH||[]).reduce((s,q)=>s+q[1],0);if(m.phase>=2&&burst>m.mhp*.09&&(m.gAt==null||t-m.gAt>20)){m.gAt=t;return findK(def,'guard')}return null},
  // how much more or less likely each attack is right now
  w(m,a,d){const L=m.dgx.legend;if(!L)return 1;let w=1;const far=m.farT>2.5,near=m.nearT>3;
   if(L.gap&&L.gap.includes(a.name))w*=far?1.9:d<T*4?.6:1;
   if(L.area&&L.area.includes(a.name))w*=near?1.6:1;else if(a.tag=='area'&&near)w*=1.3;
   try{if(L.gap&&L.gap.includes(a.name)&&RANGED.includes(CLASS7.cur()))w*=1.3}catch(_){}
   if(isUlt(m,a)){if(m.uAt!=null&&m.ph-m.uAt<16)return 0;w*=.85}
   if(a.tag=='area'&&fx.count>14)w*=.4;return w},
  picked(m,a){if(isUlt(m,a))m.uAt=m.ph}};
 DG.bossAI=AI;
})()}catch(e){console.error('DG boss AI',e)}
