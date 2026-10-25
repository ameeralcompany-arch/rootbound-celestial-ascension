// ===== Weapon effects really hurt: the signature animations (rings, ice/leaf shards, light lances, fireballs) now carry damage zones =====
// Each swing that plays a signature animation also creates a damage zone that follows the SAME geometry as the picture.
// Every monster (and boss) is hit at most once per zone, using the normal hurtMob() path (crits, burn/slow, kills, rewards all apply).
const FXDMG7=(()=>{
 const Z=[],K=.65; // effect hits deal 65% of a normal hit (the melee arc still hits as before)
 const ease=u=>1-Math.pow(1-u,3),clampu=(v,a,b)=>Math.max(a,Math.min(b,v));
 const rectHit=(m,x0,x1,y0,y1)=>m.x+m.w/2>x0&&m.x-m.w/2<x1&&m.y+m.h>y0&&m.y<y1;
 const ellHit=(m,cx,cy,rx,ry)=>{const dx=(m.x-cx)/(rx+m.w/2),dy=(m.y+m.h/2-cy)/(ry+m.h/2);return dx*dx+dy*dy<=1};
 const SHAPES={
  // ice / crimson / leaf shards rise in a row in front of you, one every 45 ms; the ground ring grows to ~136 px
  shards(A,u){const n=Math.max(4,Math.round(8*Math.max(.5,QM.cur.vfx))),k=Math.min(n,Math.floor(u/.045)+1),reach=26+k*24+12,x0=A.d>0?A.x-10:A.x-reach,x1=A.d>0?A.x+reach:A.x+10;return m=>rectHit(m,x0,x1,A.y-100,A.y+8)},
  // violet chain ring: an ellipse that expands around you
  chains(A,u){const r=34+ease(clampu(u*1.5,0,1))*62;return m=>ellHit(m,A.x,A.y-14,r*1.3,r*.95)},
  // light lance: a thin beam that pierces everything along its length
  lance(A,u){const L=ease(clampu(u*1.8,0,1))*190,x0=A.d>0?A.x:A.x-L,x1=A.d>0?A.x+L:A.x;return m=>rectHit(m,x0,x1,A.y-26-24,A.y-26+24)},
  // solar orb in front of you; blasts outward in a ring at the end
  orb(A,u){const r=(10+ease(clampu(u*1.4,0,1))*34)*(u>.7?1-(u-.7)/.3*.4:1),R=u>.6?r*(1+(u-.6)/.4*1.6):r,cx=A.x+A.d*64,cy=A.y-44;return m=>ellHit(m,cx,cy,R,R)}};
 function zone(A,w){const sh=SHAPES[A.k];if(!sh)return;Z.push({A,w,sh,hit:new Set()})}
 function tick(){if(!Z.length)return;const now=performance.now();
  for(let i=Z.length-1;i>=0;i--){const z=Z[i],u=(now-z.A.t0)/z.A.dur;if(u>=1){Z.splice(i,1);continue}if(u<.04)continue;const test=z.sh(z.A,u);
   for(const m of mobs){if(m.hp<=0||m.dead||z.hit.has(m))continue;if(!test(m))continue;z.hit.add(m);const an=Math.atan2(m.y+m.h/2-(z.A.y-20),m.x-z.A.x);try{hurtMob(m,Math.max(1,Math.round(dmgM(z.w)*K)),z.w,an)}catch(_){}}}}
 // hook: every weapon swing already plays FX7.weaponAnim(id); take the animation it just queued and attach a zone to it
 const _wa=FX7.weaponAnim;FX7.weaponAnim=function(id){const n0=FX7.AN.length;_wa.apply(this,arguments);try{const A=FX7.AN[FX7.AN.length-1];if(A&&performance.now()-A.t0<8&&WPN[id])zone(A,WPN[id])}catch(_){}};
 const _et=evTick;evTick=function(dt){_et(dt);try{tick()}catch(_){}};
 return{Z,tick,SHAPES}})();
