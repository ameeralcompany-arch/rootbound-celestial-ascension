// ===== V6 hooks: connect gameplay events to VFX without rewriting legacy systems =====
const _hm6=hurtMob;hurtMob=function(m,d,w,ang){const r=_hm6.apply(this,arguments);try{if(m&&d>0)VFX.hit(m.x,m.y+(m.h||20)/2,'#fff',false)}catch(_){}return r};
const _brk6=breakAt;breakAt=function(x,y,dmg){const r=_brk6.apply(this,arguments);try{if(r){const b=BLK[tiles[y*W+x]]||null;VFX.mine((x+.5)*T,(y+.5)*T,'#fff')}}catch(_){}return r};
const EV6={wasG:true,vy:0,stepT:0,dash:0};
function evTick(dt){if(!entered)return;try{FX7.tick(dt)}catch(_){}const e=EV6;if(P.g&&!e.wasG&&e.vy>260)VFX.land(P.x,P.y+P.h,e.vy);e.wasG=P.g;e.vy=P.vy;e.stepT-=dt;if(P.g&&Math.abs(P.vx)>70&&e.stepT<=0){e.stepT=.13;VFX.step(P.x-P.f*4,P.y+P.h)}
 if(dash>0&&e.dash<=0){const w=curWing(lvl);VFX.dash(P.x,P.y+25,-P.f,w?w.pal[3]:'#9fd8ff');if(w)for(let i=0;i<5;i++)VFX.feather(P.x,P.y+20+i*4,w.pal[2],P.f)}e.dash=dash;
 const w=curWing(lvl);if(w&&!P.g&&P.vy<-100&&Math.random()<.5)VFX.feather(P.x-P.f*10,P.y+25,w.pal[2],P.f)}
