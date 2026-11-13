// ===== RBSND: Rootbound's signature sound. Smooth, chill and satisfying: powerful never means loud, magical never means noisy.
//   Weapons: every swing is one layered sound built for its weapon type (fast blades: an airy whoosh and a clean slice; heavy weapons: warm, deep air and a
//   gentle low note; scythes: a sweeping wind with a dark resonance; magic: crystal tones with a soft rising hum; bows: a soft string and air; guns: a round
//   pop), with an element touch (ice, fire, storm, starlight, nature) and a warm low undertone for demonic weapons. Three variations rotate, every repeat is
//   a hair different, and very fast weapons sound on every other shot, so hours of attacks never tire the ear. The older beeps a swing used to make are
//   held back while it plays.
//   Hits: a clean, short impact for your own blows (deeper for heavy weapons, a bell for magic), at most one every 45 ms; a soft chime when a monster falls.
//   Ultimates: each class has its own sound, timed to its own moments: a smooth build-up while the music dips, a clean release on each strike (the last one
//   the biggest), a deep but controlled low end, and a long, beautiful fade. Built from the class's own chord and instrument (koto plucks, crystal bells,
//   taiko, wind chimes, a dark pad...), never from explosions or screams.
//   Ambience: gentle wind and birds in the Plaza and the worlds by day, crickets at night, a low hum and water drops underground and in dungeons. It follows
//   the Ambience slider and fades between places.
// Everything goes through the shared mixing desk (RBMIX, early) which tames harsh frequencies and can not clip. =====
try{window.RBSND=(()=>{
 const R=Math.random,TAU=6.2832;
 const okAC=()=>{try{if(!AC&&typeof ac=='function')ac()}catch(_){}return !!AC&&AC.state!='closed'};
 const sv=()=>{try{return (typeof mute!='undefined'&&mute)?0:(OPT.sv==null?1:+OPT.sv)}catch(_){return 1}};
 const av=()=>{try{return (typeof mute!='undefined'&&mute)?0:(OPT.av==null?1:+OPT.av)}catch(_){return 1}};
 let nb=null;const buf=()=>{try{if(window.SOFTSYN)return SOFTSYN.buf()}catch(_){}if(nb&&nb.ac===AC)return nb.b;const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=R()*2-1;nb={ac:AC,b};return b};
 // ---- the two building blocks: a tone with a smooth envelope, and a band of air that sweeps
 function tone(f,t,dur,o){o=o||{};const amp=(o.v||.02)*(o.k==null?sv():o.k);if(!(amp>.00015)||!(f>0))return;const os=AC.createOscillator(),g=AC.createGain();
  if(o.w=='soft'&&window.SOFTSYN)os.setPeriodicWave(SOFTSYN.wave('sawtooth'));else os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(o.to)os.frequency.exponentialRampToValueAtTime(Math.max(20,o.to),t+(o.glide||dur));
  if(o.vib){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=o.vib;lg.gain.value=f*.012;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+dur+.1)}
  const at=o.a==null?.008:o.a;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(amp,t+at);g.gain.exponentialRampToValueAtTime(.00005,t+Math.max(at+.02,dur));
  let last=g;os.connect(g);if(o.lp){const f2=AC.createBiquadFilter();f2.type='lowpass';f2.frequency.value=o.lp;f2.Q.value=.5;g.connect(f2);last=f2}
  last.connect(o.dest||AC.destination);os.start(t);os.stop(t+dur+.05)}
 function air(t,dur,f0,f1,o){o=o||{};const amp=(o.v||.03)*(o.k==null?sv():o.k);if(!(amp>.00015))return;const s=AC.createBufferSource(),bp=AC.createBiquadFilter(),g=AC.createGain();s.buffer=buf();
  bp.type=o.type||'bandpass';bp.Q.value=o.q||1;bp.frequency.setValueAtTime(f0,t);bp.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+dur*(o.peak||.6));if(o.back)bp.frequency.exponentialRampToValueAtTime(Math.max(40,o.back),t+dur);
  const at=o.a==null?dur*.35:o.a;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(amp,t+at);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(bp);bp.connect(g);g.connect(o.dest||AC.destination);s.start(t,R()*1.4,dur+.05)}
 // ---- weapon profiles
 const FAST=new Set(['sword','sickle','glaive','spear','chakram','shuriken','whip','knuckle','pan','dagger','katana','claw','fan','tool']),HEAVY=new Set(['hammer','maul','flail','axe','club','greatsword']),MAGIC=new Set(['wand','staff','orb','tome','book','scepter','rod']);
 const kindOf=w=>{if(!w)return'fast';if(w.gun)return'gun';const k=String(w.k||'');if(k=='fist')return'fist';if(k=='scythe')return'scythe';if(k=='bow')return'bow';if(HEAVY.has(k))return'heavy';if(MAGIC.has(k))return'magic';return'fast'};
 const elemOf=w=>{const s=(String(w&&w.id||'')+' '+String(w&&w.n||'')).toLowerCase();return/frost|rime|ice|glacier|blizzard|zero|snow/.test(s)?'ice':/ember|cinder|solar|blaze|fire|inferno|sun/.test(s)?'fire':/spark|storm|tempest|thunder|sky|gale|zephyr/.test(s)?'storm':/star|astral|moon|lumi|prism|lumina|celest/.test(s)?'star':/verdant|venom|thorn|leaf|viper|sakura|tide/.test(s)?'nature':''};
 const darkOf=w=>{try{if(CLASS7.of(w)=='demon')return true}catch(_){}return/void|crimson|umbra|blood|abyss|shadow|night|eclipse|gloom|reaper/.test((String(w&&w.id||'')+' '+String(w&&w.n||'')).toLowerCase())};
 const PENTA=[0,2,4,7,9],hz=n=>440*Math.pow(2,(n-9)/12);
 let rot=0,lastSwing=0,fastSkip=0;
 function swing(id){if(!okAC())return;const w=WPN[id];if(!w)return;const now=performance.now(),cd=+w.cd||.4;if(cd<.16){if((fastSkip=(fastSkip+1)%2))return}lastSwing=now;
  const t=AC.currentTime+.003,v=(rot=(rot+1)%3),pf=1+(v-1)*.035+(R()-.5)*.012,kd=kindOf(w),el=elemOf(w),q=cd<.16?.6:1;
  if(kd=='fast'){air(t,.15,780*pf,2300*pf,{q:1.1,v:.05*q,peak:.55});if(w.k!='whip'&&w.k!='pan')tone(2650*pf,t+.045,.06,{to:2250*pf,v:.006*q,a:.004})}
  else if(kd=='fist'){air(t,.11,420*pf,1000*pf,{q:.8,v:.045*q,peak:.5})}
  else if(kd=='heavy'){air(t,.27,240*pf,720*pf,{q:.7,v:.06,peak:.6});tone(96*pf,t+.03,.24,{to:62*pf,v:.04,a:.02})}
  else if(kd=='scythe'){air(t,.36,480*pf,1500*pf,{q:.9,v:.05,peak:.55,back:700*pf});tone(196*pf,t+.06,.48,{v:.011,a:.06});tone(293.7*pf,t+.08,.42,{v:.007,a:.07})}
  else if(kd=='magic'){const n=hz(PENTA[(v*2+((now/700)|0))%5]+12)*pf;tone(n,t,.34,{v:.018,a:.012});tone(n*2,t+.01,.22,{v:.007,a:.01});tone(n*1.5,t+.03,.26,{v:.005,type:'triangle',a:.02});air(t,.14,1500,3000,{q:2,v:.012})}
  else if(kd=='bow'){tone(210*pf,t,.16,{to:192*pf,v:.02,type:'triangle',lp:1400,a:.004});air(t+.02,.13,1200,2600,{q:1.4,v:.028})}
  else if(kd=='gun'){tone(320*pf,t,.08,{to:110*pf,v:.045*q,a:.003});air(t,.06,900,500,{q:.7,v:.035*q,a:.004})}
  if(darkOf(w)){tone(110,t+.02,.32,{v:.012,a:.04});tone(113,t+.02,.32,{v:.008,a:.04})}
  if(el=='ice'){tone(2093*pf,t+.05,.2,{v:.006});tone(2637*pf,t+.08,.16,{v:.004})}else if(el=='fire'){for(let i=0;i<3;i++)air(t+.03+i*.03,.04,700,900,{q:.6,v:.01,a:.004})}else if(el=='storm'){tone(1760*pf,t+.04,.09,{to:1320*pf,v:.006})}else if(el=='star'){tone(1568*pf,t+.05,.28,{v:.006,a:.02})}else if(el=='nature'){tone(523*pf,t+.04,.16,{v:.006,type:'triangle',lp:1600})}}
 let lastHit=0;
 function impact(m,w,dmg,killed){if(!okAC())return;const now=performance.now();if(now-lastHit<45&&!killed)return;lastHit=now;const t=AC.currentTime+.002,kd=kindOf(w),pf=1+(R()-.5)*.06;
  if(kd=='heavy'){tone(112*pf,t,.15,{to:50*pf,v:.05,a:.004});air(t,.1,600,300,{q:.6,v:.03,type:'lowpass',a:.004})}
  else if(kd=='scythe'){tone(132*pf,t,.11,{to:62*pf,v:.042,a:.004});tone(330*pf,t+.02,.26,{v:.008,a:.02})}
  else if(kd=='magic'){tone(hz(PENTA[(R()*5)|0]+24)*pf,t,.3,{v:.011,a:.004});tone(150*pf,t,.06,{to:90*pf,v:.022,a:.004})}
  else if(kd=='gun'){tone(200*pf,t,.05,{to:100*pf,v:.028,a:.003})}
  else{tone(172*pf,t,.07,{to:92*pf,v:.034,a:.003});air(t,.05,1800,1200,{q:.8,v:.022,a:.003})}
  if(killed){tone(784,t+.05,.32,{v:.009,a:.01});tone(1175,t+.09,.36,{v:.007,a:.01})}}
 // ---- the older swing beeps are held back while the new swing sound plays (the same with your own hits)
 let hold=0;
 let inDrops=false;
 if(typeof snd=='function'){const _s=snd;snd=function(f,d,ty,v){if(hold>0)return;if(inDrops&&d===.08&&ty==='triangle'&&(f===900||f===600))return;return _s.apply(this,arguments)}}
 if(typeof noise=='function'){const _n=noise;noise=function(){if(hold>0)return;return _n.apply(this,arguments)}}
 if(typeof useWeapon=='function'){const _u=useWeapon;useWeapon=function(){const id=wp;hold++;let r;try{r=_u.apply(this,arguments)}finally{hold--}try{if(id&&WPN[id]&&!(WPN[id].tool))swing(id)}catch(_){}return r}}
 if(typeof hurtMob=='function'){const _h=hurtMob;hurtMob=function(m,d,w,ang){const mine=!!(w&&w.id&&d>0&&m&&!m.dead),was=m&&m.hp>0;if(mine)hold++;let r;try{r=_h.apply(this,arguments)}finally{if(mine)hold--}try{if(mine)impact(m,w,d,was&&m.hp<=0)}catch(_){}return r}}
 // ---- picking things up: a soft pluck that climbs a pentatonic scale while you collect several in a row (a little melody), a brighter bell for gems,
 //      at most one note every 60 ms (the old fixed-pitch blip, with no limit, is skipped)
 let pk={i:0,t:0,last:0};
 function pickup(isGem){if(!okAC())return;const now=performance.now();if(now-pk.last<60)return;pk.i=now-pk.t<650?Math.min(pk.i+1,9):0;pk.t=now;pk.last=now;const t=AC.currentTime+.002,n=hz([0,2,4,7,9,12,14,16,19,21][pk.i]+12);
  if(isGem){tone(n*2,t,.26,{v:.012,a:.004});tone(n*3,t+.01,.16,{v:.004,a:.004})}else{tone(n,t,.2,{type:'triangle',v:.016,a:.004,lp:2600});tone(n*2,t,.1,{v:.004,a:.004})}}
 if(typeof updDrops=='function'){const _ud=updDrops;updDrops=function(){const n0=drops.length,before=n0?drops.slice():null;inDrops=true;let r;try{r=_ud.apply(this,arguments)}finally{inDrops=false}
   try{if(before&&drops.length<n0){const after=new Set(drops);for(const d of before)if(!after.has(d)&&Math.hypot(d.x-P.x,d.y-(P.y+P.h/2))<T*3){pickup(d.k=='gem');break}}}catch(_){}return r}}
 // ---- ultimates, one sound per class, timed to the class's ultimate (x-skills SC: its length and the moments its strikes land)
 const ULT={brawler:{h:[.55,.9,1.25,1.6],ch:[5,9,12],root:53,inst:'taiko'},knight:{h:[1.3,1.55],ch:[2,6,9],root:50,inst:'brass'},samurai:{h:[1.1,1.35,1.6],ch:[9,11,12,16,17],root:57,inst:'koto'},
  archer:{h:[.9,1.15,1.4,1.65],ch:[7,11,14],root:55,inst:'chime'},mage:{h:[1.5,1.9],ch:[4,8,11],root:64,inst:'bell'},demon:{h:[1,1.5,1.85],ch:[0,3,7],root:36,inst:'pad'},
  reaper:{h:[1,1.5],ch:[9,12,16],root:45,inst:'wind'},elementalist:{h:[.8,1.1,1.4,1.85],ch:[2,6,9,13],root:62,inst:'elem'},stormcaller:{h:[.95,1.3,1.75],ch:[10,14,17],root:46,inst:'storm'},
  berserker:{h:[1.15,1.5],ch:[4,11,16],root:40,inst:'taiko'},ninja:{h:[.6,.8,1,1.2,1.4,1.7],ch:[9,12,14,16,19,21],root:57,inst:'flute'},druid:{h:[.9,1.4,1.95],ch:[5,9,11,12],root:53,inst:'wood'},
  gunslinger:{h:[1.7],ch:[7,11,14],root:55,inst:'whistle'}};
 const mh=n=>440*Math.pow(2,(n-69)/12);
 function voice(inst,f,t,big,i){const k=big?1.7:1;switch(inst){
  case'koto':tone(f,t,.9,{type:'triangle',v:.02*k,a:.004,lp:3200});tone(f*2,t,.4,{v:.005*k,a:.004});break;
  case'bell':tone(f,t,1.4,{v:.016*k,a:.005});tone(f*2.76,t,.6,{v:.004*k,a:.005});break;
  case'chime':tone(f*2,t,1.1,{v:.01*k,a:.004});tone(f*3,t+.03,.8,{v:.005*k,a:.004});break;
  case'brass':tone(f,t,.9,{w:'soft',v:.016*k,a:.04,lp:1800});tone(f/2,t,.9,{v:.012*k,a:.05});break;
  case'pad':tone(f,t,1.6,{w:'soft',v:.012*k,a:.12,lp:900});tone(f*1.005,t,1.6,{v:.01*k,a:.14});break;
  case'wind':air(t,1.2,f*2,f*6,{q:2.5,v:.02*k,peak:.4});tone(f,t,1.4,{v:.011*k,a:.1});break;
  case'flute':tone(f*2,t,.5,{v:.013*k,a:.03,vib:5.5});air(t,.3,f*3,f*5,{q:4,v:.006*k});break;
  case'wood':tone(f,t,.35,{v:.02*k,a:.003});tone(f*4,t,.08,{v:.006*k,a:.002});break;
  case'whistle':tone(f*2,t-.5,.5,{to:f*3,v:.012,a:.08,vib:6});tone(f,t,1,{w:'soft',v:.02*k,a:.01,lp:2400});break;
  case'storm':air(t,1.4,180,90,{type:'lowpass',q:.6,v:.03*k,peak:.3,a:.15});tone(f,t,1,{w:'soft',v:.013*k,a:.02,lp:2200});break;
  case'elem':{const ins=['brass','bell','wood','pad'][i%4];voice(ins,f,t,big,0);break}
  case'taiko':tone(88,t,.45,{to:44,v:.06*k,a:.004});air(t,.12,500,250,{type:'lowpass',q:.6,v:.025*k,a:.004});tone(f,t,.7,{type:'triangle',v:.01*k,lp:1500});break}}
 function ultimate(cls){if(!okAC())return;const U=ULT[cls];if(!U)return;const t0=AC.currentTime+.02,first=U.h[0],last=U.h[U.h.length-1];
  try{RBMIX.duck(.7,last+.4)}catch(_){}
  // the build-up: air rising from below, two tones climbing a fifth, a soft swell of the class chord
  air(t0,first,220,2200,{q:1.4,v:.026,peak:1,a:first*.9});tone(mh(U.root),t0,first+.05,{to:mh(U.root+7),glide:first,v:.012,a:first*.6,w:'soft',lp:1600});tone(mh(U.root+12),t0+first*.3,first*.75,{to:mh(U.root+19),glide:first*.7,v:.007,a:first*.4});
  // each strike: a clean release in the class's voice and a controlled low note; a short breath of quiet before the last one
  U.h.forEach((h,i)=>{const big=i==U.h.length-1,t=t0+h,n=U.ch[i%U.ch.length];voice(U.inst,mh(U.root+12+n),t,big,i);tone(big?62:78,t,big?.6:.32,{to:big?36:50,v:big?.05:.03,a:.006});if(big){tone(mh(U.root+24+n),t+.02,1.2,{v:.008,a:.01});air(t,.5,3000,1800,{q:1.2,v:.012,a:.01})}});
  // the fade: the whole chord rings out for two and a half seconds
  const tf=t0+last+.08;U.ch.slice(0,4).forEach((n,i)=>tone(mh(U.root+12+n),tf+i*.06,2.6,{v:.008,a:.15,type:i%2?'triangle':'sine',lp:2400}))}
 function hookUlt(){if(!window.SK1||!SK1.cast||SK1.cast.__rbsnd)return false;const _c=SK1.cast;const f=function(sk){const isU=!!(sk&&sk.ult);let t0=null;if(isU&&typeof SFX7!='undefined'){t0=SFX7.tone;SFX7.tone=()=>{}}if(isU)hold++;let r;try{r=_c.apply(this,arguments)}finally{if(isU){hold--;if(t0)SFX7.tone=t0}}
   try{if(isU&&r){let k=sk.cls||null;try{k=k||CLASS7.cur()}catch(_){}ultimate(k)}}catch(_){}return r};f.__rbsnd=1;SK1.cast=f;return true}
 if(!hookUlt()){const iv=setInterval(()=>{if(hookUlt())clearInterval(iv)},1000);setTimeout(()=>clearInterval(iv),30000)}
 // ---- ambience: one small graph on the effects engine; the state follows where you are and the time of day
 const A={on:false};
 function ambStart(){if(A.on||!okAC())return;try{const src=AC.createBufferSource();src.buffer=buf();src.loop=true;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=480;lp.Q.value=.4;const wg=AC.createGain();wg.gain.value=0;
  const lfo=AC.createOscillator(),lg=AC.createGain();lfo.frequency.value=.07;lg.gain.value=.25;const wmul=AC.createGain();wmul.gain.value=1;lfo.connect(lg);lg.connect(wmul.gain);
  src.connect(lp);lp.connect(wmul);wmul.connect(wg);const bus=AC.createGain();bus.gain.value=0;wg.connect(bus);
  const dr=AC.createOscillator(),dr2=AC.createOscillator(),dg=AC.createGain();dr.frequency.value=55;dr2.frequency.value=82.4;dg.gain.value=0;dr.connect(dg);dr2.connect(dg);dg.connect(bus);
  bus.connect(AC.destination);src.start();lfo.start();dr.start();dr2.start();Object.assign(A,{on:true,src,lp,wg,dg,bus,ev:0,state:''})}catch(e){console.error('RBSND amb',e)}}
 function place(){try{if(typeof entered=='undefined'||!entered||window.RB_COVER||document.hidden)return'off';if(window.DG&&DG.run)return'dungeon';let dep=0;try{dep=MUS7.depthNow()}catch(_){}if(dep>=12)return'under';const n=typeof night=='number'?night:0;return(cur=='plaza'?'plaza':'world')+(n>.6?'-night':'-day')}catch(_){return'off'}}
 function ambTick(){try{const p=place();if(p!='off')ambStart();if(!A.on)return;const t=AC.currentTime,lvl=av()*.55,ramp=(g,v)=>{g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(v,t+2)};
  ramp(A.bus,p=='off'?0:lvl);const day=p.endsWith('-day'),nite=p.endsWith('-night');
  ramp(A.wg,p=='under'||p=='dungeon'?.06:day?.14:nite?.09:0);A.lp.frequency.setTargetAtTime(p=='under'||p=='dungeon'?260:480,t,.8);ramp(A.dg,p=='under'?.012:p=='dungeon'?.016:0);A.state=p;
  if(p=='off'||!(lvl>.01))return;const k=lvl;
  if(day&&R()<.22){const b=t+R()*.4,f=2300+R()*1600;for(let i=0;i<2+((R()*3)|0);i++)tone(f*(1+i*.07),b+i*.11,.08,{to:f*(1.25+i*.05),v:.0045,k,a:.01})}
  if(nite&&R()<.35){const b=t+R()*.4;for(let i=0;i<6;i++)tone(4200,b+i*.045,.025,{v:.0018,k,a:.004})}
  if((p=='under'||p=='dungeon')&&R()<.25){const f=900+R()*700;tone(f,t+R()*.4,.12,{to:f*.55,v:.006,k,a:.002})}}catch(_){}}
 setInterval(ambTick,700);
 return{pickup,swing,impact,ultimate,tone,air,kindOf,elemOf,darkOf,ULT,get hold(){return hold},get amb(){return A.state||''},place}})()}catch(e){console.error('RBSND',e)}
