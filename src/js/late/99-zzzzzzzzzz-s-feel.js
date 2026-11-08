// ===== FEEL1: small things that make hits and clicks feel immediate.  A click on the world counts even if it was shorter than a frame or came just before your weapon was ready (140 ms buffer, read in update()).
// A hit nudges the view a couple of pixels towards the target, more for heavy weapons, and heavy weapons get a tiny hit-stop (fast weapons do not, so they never stutter). Shake setting and reduced motion are respected. =====
try{(()=>{
 const reduce=()=>{try{return MOTION7.reduce()}catch(_){return false}};
 window.KICK={x:0,y:0};window.ATKQ=0;
 addEventListener('pointerdown',e=>{try{if(e.button==0&&e.target===cv)window.ATKQ=performance.now()}catch(_){}},true);
 {const u=update;update=function(dt){const r=u.apply(this,arguments);try{const k=Math.exp(-dt*24),K=window.KICK;K.x*=k;K.y*=k;if(Math.abs(K.x)<.02)K.x=0;if(Math.abs(K.y)<.02)K.y=0}catch(_){}return r}}
 {const h=hurtMob;hurtMob=function(m,d,w,kb){const r=h.apply(this,arguments);try{if(w&&w.k!='tool'&&m&&!reduce()){const dir=Math.sign(m.x-P.x)||P.f||1,cd=+w.cd||.4,sh=typeof OPT!='undefined'&&OPT.sh!=null?+OPT.sh:1,amt=Math.min(3.2,.7+cd*5)*sh;window.KICK.x=dir*amt;if(cd>=.3)window.HS_T=Math.max(window.HS_T||0,Math.min(.03,cd*.07))}}catch(_){}return r}}
})()}catch(e){console.error('FEEL1',e)}
