// ===== Flight (FLY7): hold Space (or W / Up) in the air with wings to beat upward. Lift comes in pulses with each wing beat,
// stamina limits it, the rest is a glide. Only the worn wing's own sounds play (WINGSFX: one profile per wing); there is no generic wind loop. =====
const FLY7=(()=>{
 const F={on:false,sta:1,ph:0,air:0,beat:0,last:0,tier:0,t0:0,tk:0,burst:0,bursts:0};
 const wingNow=()=>{try{return curWing(lvl)}catch(_){return null}};
 // tk = top-tier class: 0 normal, 1 legendary, 2 mythic (exclusive flies like mythic). Top-tier wings climb ~1.5x / ~2x an epic wing
 // and hold the climb longer, so they reach far higher before running out of breath. Peak climb stays < 900 px/s (no tunnelling).
 const tkOf=w=>!w?0:(w.rar=='mythic'||w.rar=='exclusive')?2:w.rar=='legendary'?1:0;
 const lift=(t,tk)=>Math.min(900,tk==2?460+Math.max(0,t-6)*8:tk==1?345+Math.max(0,t-4)*8:230+t*12);
 const maxT=(t,tk)=>(3.2+.14*t)*(tk==2?1.5:tk==1?1.25:1);
 function flap(strong){try{wingFlap=1;wingOpen=1}catch(_){}try{featherFx(strong?3:1)}catch(_){}
  if(typeof WINGSFX!='undefined'){WINGSFX.flap(strong);return}
  const v=Math.min(.12,.07+F.tier*.004);noise(.16,520+F.tier*30,v);snd(90+F.tier*3,.14,'sine',.05,.55)}
 function step(dt,ax,busy){const w=wingNow(),hold=!busy&&(K.w||K[' ']||K.arrowup),down=K.s||K.arrowdown;
  F.tier=w?w.pw:0;F.tk=tkOf(w);   // flight power follows rarity (and size), not the table index
  if(P.g||P.sw){F.air=0;F.sta=Math.min(1,F.sta+dt*1.1);if(F.on){F.on=false;WingArt.FL.on=false}F.last=0;return}
  F.air+=dt;
  const can=!!w&&!busy&&hold&&F.sta>0&&F.air>.1&&(P.vy>-150||F.on);
  if(can){
   if(!F.on){F.on=true;F.ph=0;F.last=-1;F.t0=performance.now();
    // top-tier take-off burst: a quick upward kick (at most once every 0.8 s); 87-zz-wingtrail.js draws the shockwave on F.burst
    if(F.tk&&F.t0-F.burst>800){F.burst=F.t0;F.bursts++;P.vy=Math.min(P.vy,-lift(F.tier,F.tk)*.7)}}
   WingArt.FL.on=true;WingArt.FL.rate=2*Math.PI*(2.9-.05*Math.min(8,F.tier))*(1.12-Math.min(.42,(w.a.L-34)/180));/* deeper strokes the harder you climb, and a quicker burst of beats right at take-off */const climbK=Math.max(0,Math.min(1,-P.vy/420)),boost=Math.max(0,1-(performance.now()-F.t0)/450);WingArt.FL.rate*=1+boost*.3;WingArt.FL.amp=(w.a.parts[0].s=='mech'?.32:.5)*(.85+climbK*.3+boost*.15);
   F.ph+=dt*WingArt.FL.rate;WingArt.FL.ph=F.ph;/* the wing cycle reads this phase: F2 peak at s=0 (beat sound), F3 power snap at s=1 (max lift) */const s=Math.sin(F.ph);F.sta=Math.max(0,F.sta-dt/maxT(F.tier,F.tk));
   if(s>=0&&F.last<0)flap(true);F.last=s>=0?1:-1;
   const climb=-lift(F.tier,F.tk)*(.55+.45*s);
   if(down)P.vy=Math.min(P.vy+900*dt,160);else if(P.vy>climb)P.vy=climb+(P.vy-climb)*Math.exp(-dt*28);
   if(ax){const top=260*(1+bonus().spd)*1.2*(1+.1*F.tk);P.vx+=(ax*top-P.vx)*Math.min(1,dt*2.6)}
   if(F.sta<=0){F.on=false;WingArt.FL.on=false;try{say('Out of breath - glide!')}catch(_){}}
  }else{
   if(F.on){F.on=false;WingArt.FL.on=false}
   if(w&&!busy&&hold&&P.vy>0)P.vy=Math.min(P.vy,(F.sta>0?170:200)-F.tk*25);   // gliding (top-tier wings sink slower)
   F.sta=Math.min(1,F.sta+dt*(hold?0:.18));F.last=0}}
 {const _p=physics;physics=function(dt,ax,busy){const r=_p.apply(this,arguments);try{step(dt,ax,busy)}catch(e){console.error('FLY7',e)}return r}}
 // stamina pill above the head
 function drawMeter(g,cx,cy){if(F.sta>=.995&&!F.on)return;const x=P.x-cx,y=P.y-cy-44,w=44;g.save();g.globalAlpha=.9;g.fillStyle='rgba(20,18,30,.55)';g.beginPath();g.roundRect?g.roundRect(x-w/2,y,w,6,3):g.rect(x-w/2,y,w,6);g.fill();
  g.fillStyle=F.sta>.3?'#bff3ff':'#ff9a8a';g.beginPath();g.roundRect?g.roundRect(x-w/2+1,y+1,(w-2)*Math.max(.02,F.sta),4,2):g.rect(x-w/2+1,y+1,(w-2)*F.sta,4);g.fill();g.restore()}
 {const _d=BOSS6.drawProj;BOSS6.drawProj=function(g,cx,cy){_d.call(this,g,cx,cy);try{if(wingNow())drawMeter(g,cx,cy)}catch(_){}}}
 // the body lifts a little on every downstroke while flying (the wings are drawn inside drawChar, so they follow)
 {const _dc=drawChar;drawChar=function(cx,cy){if(arguments[15]==='me'&&F.on){const a=[...arguments];a[1]=cy+(WingArt.FL.bob||0);return _dc.apply(this,a)}return _dc.apply(this,arguments)}}
 return{F,step,tkOf,lift,maxT}})();
