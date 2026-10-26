// ===== SFX7: synthesized voice shouts, cute monster sounds, water sounds. All WebAudio, no files. Volume follows the "Sound effects" slider. =====
const SFX7=(()=>{
 const R=Math.random,vol=()=>(OPT.sv==null?1:OPT.sv);
 const ok=()=>{try{ac()}catch(_){}return !!AC&&AC.state!='closed'};
 let nbuf=null;const noiseBuf=()=>nbuf||(nbuf=(()=>{const b=AC.createBuffer(1,AC.sampleRate,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b})());
 // (character voice removed: the hero is silent)
 // ---- cute, calm monster sounds: soft sine "pyu/pop/boop" with a little pitch glide, per species
 const MV={slime:[330,.7,'boop'],moth:[880,1,'flute'],crab:[520,.9,'tick'],cloud:[260,.6,'fuwa'],bat:[1100,1.2,'squeak'],golem:[170,.55,'dun'],wraith:[420,.8,'woo'],magma:[210,.6,'blub']};
 function tone(f0,f1,d,ty,v,delay,vib){if(!ok())return;const t=AC.currentTime+(delay||0)+.005,o=AC.createOscillator(),g=AC.createGain(),lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600;o.type=ty||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d*.9);
  if(vib){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=7;lg.gain.value=f0*.02;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+d+.05)}
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol(),t+.012);g.gain.exponentialRampToValueAtTime(.0005,t+d);o.connect(lp);lp.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.05)}
 const near=m=>{const d=Math.hypot(m.x-P.x,m.y-P.y);return d<T*14?Math.max(.25,1-d/(T*14)):0};
 function mobSound(m,kind){const a=near(m);if(!a||!ok())return;const s=MV[m.k]||[400,.8,'boop'],f=s[0]*(.94+R()*.12),k=s[2],v=.05*a;
  if(kind=='hit'){tone(f*1.3,f*.8,.14,'sine',v);tone(f*2.6,f*1.6,.09,'triangle',v*.3)}
  else if(kind=='die'){tone(f*1.4,f*.95,.16,'sine',v);tone(f*1.1,f*.6,.28,'sine',v*.9,.13);tone(f*3,f*2,.1,'triangle',v*.25,.05)}
  else{ // idle chirp
   if(k=='boop')tone(f*.8,f*1.25,.12,'sine',v*.8);else if(k=='flute')tone(f,f*1.1,.3,'sine',v*.7,0,1);else if(k=='tick'){tone(f*1.5,f,.05,'triangle',v*.6);tone(f*1.7,f*1.1,.05,'triangle',v*.6,.09)}
   else if(k=='fuwa')tone(f,f*1.15,.45,'sine',v*.5,0,1);else if(k=='squeak'){tone(f,f*1.4,.07,'triangle',v*.5);tone(f*1.2,f*1.6,.07,'triangle',v*.5,.1)}
   else if(k=='dun')tone(f*1.1,f*.8,.2,'sine',v);else if(k=='woo')tone(f*.9,f*1.2,.5,'sine',v*.5,0,1);else tone(f*.7,f*1.3,.15,'sine',v*.8)}}
 // ---- water: satisfying "bloop" (rising sine) + soft body + tiny droplets
 function bloop(size,delay){if(!ok())return;size=Math.max(.3,Math.min(1.6,size||1));const f=(200+R()*60)/Math.sqrt(size)*1.0;tone(f,f*2.3,.1+.05*size,'sine',.11*Math.min(1,size+.2),delay||0);tone(f*2,f*3.4,.08,'sine',.035,(delay||0)+.01)}
 function plip(delay){tone(700+R()*900,1300+R()*900,.04+R()*.03,'sine',.035,delay||0)}
 function splash(power){if(!ok())return;const s=Math.max(.3,Math.min(1.6,power/420));bloop(s);if(s>.7){bloop(s*.55,.07);}
  const n=Math.min(5,1+(s*3|0));for(let i=0;i<n;i++)plip(.05+i*.045+R()*.03);
  const t=AC.currentTime,nz=AC.createBufferSource();nz.buffer=noiseBuf();const bp=AC.createBiquadFilter();bp.type='lowpass';bp.frequency.setValueAtTime(1500,t);bp.frequency.exponentialRampToValueAtTime(350,t+.25);const g=AC.createGain();g.gain.setValueAtTime(.05*vol()*s,t);g.gain.exponentialRampToValueAtTime(.0005,t+.28);nz.connect(bp);bp.connect(g);g.connect(AC.destination);nz.start(t);nz.stop(t+.3)}
 function bubble(){if(!ok())return;const f=500+R()*500;tone(f,f*1.8,.07,'sine',.03)}
 return{mobSound,bloop,plip,splash,bubble,tone}})();
// --- hooks
{ // swing -> shout
 // monsters: soft hit/death sounds
 const _hm=hurtMob;hurtMob=function(m,d,w,ang){const was=m.hp>0,r=_hm.apply(this,arguments);try{if(was&&d>0)SFX7.mobSound(m,m.hp<=0?'die':'hit')}catch(_){}return r};
 setInterval(()=>{try{if(!entered||!mobs.length||Math.random()<.45)return;const m=mobs[(Math.random()*mobs.length)|0];if(m&&!m.dead)SFX7.mobSound(m,'idle')}catch(_){}},2600);
 // water: splash replaces the old hissy noise; placing a block into water goes "bloop"
 const _sf=splashFx;splashFx=function(x,y,pw){const sv=OPT.sv;OPT.sv=0;try{_sf.apply(this,arguments)}finally{OPT.sv=sv}SFX7.splash(Math.abs(pw)||300)};
 const _pa=placeAction;placeAction=function(){let k=-1,w0=0,c0=0;try{const it=bar[sel],tx=Math.floor((mx+cam.x)/T),ty=Math.floor((my+cam.y)/T);k=ty*W+tx;w0=wl[k]|0;c0=it?cnt(it):0;const r=_pa.apply(this,arguments);if(w0>0&&it&&cnt(it)<c0)SFX7.bloop(.9);return r}catch(e){throw e}};
 // rain/storm bed was a constant noisy hiss: removed. Thunder is kept but quiet and low.
 ambUpdate=function(){try{if(typeof ambG!='undefined'&&ambG)ambG.gain.value=0}catch(_){}};
 const _nz=noise;noise=function(d,f,v){return _nz(d,Math.min(f,420),(v||.1)*.3)};
 // swim bubbles/jump in water use the soft sounds
 const _bf=bubFx;bubFx=function(n){_bf.apply(this,arguments);if(Math.random()<.5)SFX7.bubble()};
}
