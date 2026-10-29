// ===== Flight (FLY7): hold Space (or W / Up) in the air with wings to beat upward. Lift comes in pulses with each wing beat,
// stamina limits it, the rest is a glide. Only the worn wing's own sounds play (WINGSFX: one profile per wing); there is no generic wind loop. =====
const FLY7=(()=>{
 const F={on:false,sta:1,ph:0,air:0,beat:0,last:0,tier:0,t0:0};
 const wingNow=()=>{try{return curWing(lvl)}catch(_){return null}};
 const maxT=t=>3.2+.14*t;
 function flap(strong){try{wingFlap=1;wingOpen=1}catch(_){}try{featherFx(strong?3:1)}catch(_){}
  if(typeof WINGSFX!='undefined'){WINGSFX.flap(strong);return}
  const v=Math.min(.12,.07+F.tier*.004);noise(.16,520+F.tier*30,v);snd(90+F.tier*3,.14,'sine',.05,.55)}
 function step(dt,ax,busy){const w=wingNow(),hold=!busy&&(K.w||K[' ']||K.arrowup),down=K.s||K.arrowdown;
  F.tier=w?w.pw:0;   // flight power follows rarity (and size), not the table index
  if(P.g||P.sw){F.air=0;F.sta=Math.min(1,F.sta+dt*1.1);if(F.on){F.on=false;WingArt.FL.on=false}F.last=0;return}
  F.air+=dt;
  const can=!!w&&!busy&&hold&&F.sta>0&&F.air>.1&&(P.vy>-150||F.on);
  if(can){
   if(!F.on){F.on=true;F.ph=0;F.last=-1;F.t0=performance.now()}
   WingArt.FL.on=true;WingArt.FL.rate=2*Math.PI*(2.9-.05*Math.min(8,F.tier))*(1.12-Math.min(.42,(w.a.L-34)/180));/* deeper strokes the harder you climb, and a quicker burst of beats right at take-off */const climbK=Math.max(0,Math.min(1,-P.vy/420)),boost=Math.max(0,1-(performance.now()-F.t0)/450);WingArt.FL.rate*=1+boost*.3;WingArt.FL.amp=(w.a.parts[0].s=='mech'?.32:.5)*(.85+climbK*.3+boost*.15);
   F.ph+=dt*WingArt.FL.rate;WingArt.FL.ph=F.ph;/* the wing cycle reads this phase: F2 peak at s=0 (beat sound), F3 power snap at s=1 (max lift) */const s=Math.sin(F.ph);F.sta=Math.max(0,F.sta-dt/maxT(F.tier));
   if(s>=0&&F.last<0)flap(true);F.last=s>=0?1:-1;
   const climb=-(230+F.tier*12)*(.55+.45*s);
   if(down)P.vy=Math.min(P.vy+900*dt,160);else if(P.vy>climb)P.vy=climb+(P.vy-climb)*Math.exp(-dt*28);
   if(ax){const top=260*(1+bonus().spd)*1.2;P.vx+=(ax*top-P.vx)*Math.min(1,dt*2.6)}
   if(F.sta<=0){F.on=false;WingArt.FL.on=false;try{say('Out of breath - glide!')}catch(_){}}
  }else{
   if(F.on){F.on=false;WingArt.FL.on=false}
   if(w&&!busy&&hold&&P.vy>0)P.vy=Math.min(P.vy,F.sta>0?170:200);   // gliding
   F.sta=Math.min(1,F.sta+dt*(hold?0:.18));F.last=0}}
 {const _p=physics;physics=function(dt,ax,busy){const r=_p.apply(this,arguments);try{step(dt,ax,busy)}catch(e){console.error('FLY7',e)}return r}}
 // stamina pill above the head
 function drawMeter(g,cx,cy){if(F.sta>=.995&&!F.on)return;const x=P.x-cx,y=P.y-cy-44,w=44;g.save();g.globalAlpha=.9;g.fillStyle='rgba(20,18,30,.55)';g.beginPath();g.roundRect?g.roundRect(x-w/2,y,w,6,3):g.rect(x-w/2,y,w,6);g.fill();
  g.fillStyle=F.sta>.3?'#bff3ff':'#ff9a8a';g.beginPath();g.roundRect?g.roundRect(x-w/2+1,y+1,(w-2)*Math.max(.02,F.sta),4,2):g.rect(x-w/2+1,y+1,(w-2)*F.sta,4);g.fill();g.restore()}
 {const _d=BOSS6.drawProj;BOSS6.drawProj=function(g,cx,cy){_d.call(this,g,cx,cy);try{if(wingNow())drawMeter(g,cx,cy)}catch(_){}}}
 // the body lifts a little on every downstroke while flying (the wings are drawn inside drawChar, so they follow)
 {const _dc=drawChar;drawChar=function(cx,cy){if(arguments[15]==='me'&&F.on){const a=[...arguments];a[1]=cy+(WingArt.FL.bob||0);return _dc.apply(this,a)}return _dc.apply(this,arguments)}}
 return{F,step}})();
