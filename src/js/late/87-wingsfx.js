// ===== WINGSFX: every wing has its own smooth sound set (double jump, flight beat, glide, equip). All WebAudio, soft attacks,
// exponential tails and lowpass filters so nothing clicks or hisses. Volume follows the "Sound effects" slider. =====
const WINGSFX=(()=>{
 const R=Math.random,vol=()=>(OPT.sv==null?1:OPT.sv);
 const ok=()=>{try{ac()}catch(_){}return !!AC&&AC.state!='closed'};
 let nb=null;const nbuf=()=>nb||(nb=(()=>{const b=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=l*.5+(R()*2-1)*.5;d[i]=l}return b})());
 // soft tone: smooth attack (att s), exponential release, gentle lowpass
 function tn(f0,f1,d,ty,v,dl,att,lpf){if(!ok())return;const t=AC.currentTime+(dl||0)+.005,o=AC.createOscillator(),g=AC.createGain(),lp=AC.createBiquadFilter();
  lp.type='lowpass';lp.frequency.value=lpf||2400;o.type=ty||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(25,f1),t+d*.9);
  const a=Math.max(.008,att||.02);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol(),t+a);g.gain.exponentialRampToValueAtTime(.0004,t+a+d);
  o.connect(lp);lp.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+a+d+.05)}
 // soft air: filtered noise swell whose band sweeps f0 -> f1
 function air(d,f0,f1,q,v,dl,att){if(!ok())return;const t=AC.currentTime+(dl||0)+.005,s=AC.createBufferSource(),bp=AC.createBiquadFilter(),lp=AC.createBiquadFilter(),g=AC.createGain();
  s.buffer=nbuf();bp.type='bandpass';bp.Q.value=q||.8;bp.frequency.setValueAtTime(f0,t);bp.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+d);lp.type='lowpass';lp.frequency.value=Math.min(3200,Math.max(f0,f1)*2);
  const a=Math.max(.02,att||d*.35);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol(),t+a);g.gain.exponentialRampToValueAtTime(.0004,t+d);
  s.connect(bp);bp.connect(lp);lp.connect(g);g.connect(AC.destination);s.start(t,R()*1.5);s.stop(t+d+.05)}
 const chord=(fs,d,ty,v,step,att)=>fs.forEach((f,i)=>tn(f,f*1.01,d,ty,v,i*(step||0),att));
 const sparkle=(n,lo,hi,v,sp)=>{for(let i=0;i<n;i++){const f=lo+R()*(hi-lo);tn(f,f*1.06,.18,'sine',v,.03+i*(sp||.05)+R()*.02,.01,4200)}};
 const flutter=(n,f,v,gap)=>{for(let i=0;i<n;i++)air(.07,f*(.9+R()*.2),f*.7,2.2,v,i*(gap||.045),.015)};
 const PENTA=[523,587,659,784,880,1047,1175,1319];
 // ---- one profile per wing: j = double jump, f = flight beat (s = strong), g = glide start, e = equip
 const P7={
  celestial:{j(){chord([659,988],.5,'sine',.035,.04,.03);air(.35,1800,900,.7,.03)},f(s){air(.28,900,520,.8,.05);tn(330,350,.3,'sine',.018,0,.04)},g(){air(.9,700,1300,.6,.03,0,.35);tn(659,662,.8,'sine',.012,.1,.3)},e(){chord([523,659,784,1047],.7,'sine',.03,.07)}},
  frost:{j(){sparkle(4,1500,2600,.022,.045);air(.3,2600,1600,1.4,.02)},f(s){air(.22,1600,1100,1.6,.03);tn(1760,1980,.14,'sine',.012)},g(){air(1,1400,2200,1.2,.02,0,.4);sparkle(2,1800,2400,.012,.25)},e(){sparkle(6,1400,2800,.025,.06)}},
  silver:{j(){tn(880,885,.6,'sine',.032,0,.01);tn(2428,2430,.35,'sine',.008,0,.01)},f(s){air(.25,1100,700,1,.04);tn(440,442,.25,'sine',.014,.02,.02)},g(){air(.9,800,1200,.8,.028,0,.35)},e(){tn(784,786,.9,'sine',.03,0,.01);tn(2163,2165,.5,'sine',.008,0,.01);tn(1175,1177,.8,'sine',.018,.12,.01)}},
  astral:{j(){air(.35,600,1600,.9,.045,0,.06);for(let i=0;i<3;i++)air(.03,3000,2400,4,.025,.08+i*.06+R()*.03,.006)},f(s){air(.3,500,320,.7,.06);tn(70,60,.35,'sine',.03,0,.05)},g(){air(1.1,400,900,.6,.04,0,.4);tn(55,52,1,'sine',.02,0,.4)},e(){air(.6,300,1800,.8,.05,0,.2);for(let i=0;i<4;i++)air(.03,3200,2500,4,.03,.25+i*.07,.006)}},
  eclipse:{j(){tn(220,150,.5,'sine',.04,0,.04,900);air(.4,500,260,.9,.035)},f(s){air(.3,380,220,.9,.055);tn(110,95,.3,'sine',.025,0,.04,600)},g(){air(1.1,260,480,.7,.035,0,.45);tn(98,100,1,'sine',.02,0,.45,500)},e(){tn(196,131,1,'sine',.045,0,.06,900);tn(294,196,.9,'sine',.02,.05,.06,900)}},
  ascendant:{j(){chord([523,659,784,1047],.45,'triangle',.022,.05,.008);air(.3,1500,900,.8,.02)},f(s){air(.26,950,560,.8,.048);tn(523,523,.2,'triangle',.012,0,.01)},g(){chord([784,988,1175],.9,'sine',.012,.12,.2);air(.9,700,1200,.7,.022,0,.35)},e(){chord([392,523,659,784,1047,1319],.6,'triangle',.022,.06,.008)}},
  cosmic:{j(){tn(440,660,.55,'sine',.025,0,.05);tn(443,663,.55,'sine',.025,0,.05);sparkle(3,1800,3000,.012,.06)},f(s){air(.32,700,400,.6,.05);tn(220,224,.3,'sine',.015,0,.05)},g(){air(1.2,500,1500,.5,.03,0,.5);tn(330,333,1.1,'sine',.012,0,.5)},e(){tn(262,523,1,'sine',.03,0,.1);tn(264,527,1,'sine',.03,0,.1);sparkle(6,1600,3200,.015,.09)}},
  dove:{j(){flutter(4,1900,.035,.04);tn(1047,1175,.12,'sine',.01,.05)},f(s){flutter(s?3:2,1700,.035,.035)},g(){air(.8,1400,2000,.9,.022,0,.3)},e(){flutter(5,2000,.035,.05);tn(1319,1397,.25,'sine',.015,.15,.02)}},
  blossom:{j(){for(let i=0;i<3;i++){const f=PENTA[(R()*PENTA.length)|0]*1.5;tn(f,f,.25,'triangle',.018,i*.06,.006,3000)}air(.25,1500,1100,1,.018)},f(s){air(.24,1300,900,1,.035);const f=PENTA[(R()*5)|0]*2;tn(f,f,.18,'triangle',.008,.02,.006,3000)},g(){air(.9,1100,1600,.8,.02,0,.35);for(let i=0;i<3;i++){const f=PENTA[(R()*PENTA.length)|0]*1.5;tn(f,f,.3,'sine',.008,.2+i*.18,.01)}},e(){[0,2,4,5,7].forEach((n,i)=>tn(PENTA[n]*1.5,PENTA[n]*1.5,.35,'triangle',.018,i*.07,.006,3000))}},
  crystal:{j(){tn(1568,1570,.55,'sine',.024,0,.006);tn(2349,2352,.4,'sine',.012,.03,.006)},f(s){air(.2,1500,1000,1.4,.03);tn(2093,2095,.2,'sine',.008,0,.006)},g(){air(.9,1200,1900,1.2,.02,0,.35);tn(1760,1762,.7,'sine',.008,.15,.05)},e(){[1568,1976,2349,3136].forEach((f,i)=>tn(f,f+2,.6,'sine',.018,i*.08,.006))}},
  mech:{j(){tn(180,420,.22,'sawtooth',.022,0,.02,700);air(.2,900,1600,1.5,.02,.05)},f(s){tn(140,260,.16,'sawtooth',.018,0,.02,600);air(.12,1200,800,2,.015,.08,.01)},g(){tn(200,240,.9,'sawtooth',.01,0,.3,500)},e(){tn(120,360,.4,'sawtooth',.025,0,.03,800);tn(360,370,.25,'square',.008,.42,.01,1200);tn(540,550,.25,'square',.008,.5,.01,1200)}},
  umbral:{j(){air(.4,350,180,.9,.05);tn(90,70,.45,'sine',.035,0,.05,400)},f(s){air(.3,300,170,.9,.06);tn(70,62,.3,'sine',.03,0,.04,400)},g(){air(1.2,200,420,.7,.04,0,.5)},e(){air(.9,600,150,.7,.05,0,.3);tn(110,73,1,'sine',.04,0,.1,500)}},
  galaxy:{j(){sparkle(5,1600,3400,.016,.04);tn(392,588,.4,'sine',.02,0,.05)},f(s){air(.28,800,450,.7,.045);sparkle(1,2000,3200,.01)},g(){air(1.1,600,1400,.6,.028,0,.45);sparkle(3,2200,3400,.01,.25)},e(){sparkle(9,1400,3600,.018,.06);tn(196,392,1,'sine',.025,0,.1)}},
  dragon:{j(){air(.5,420,170,.7,.075,0,.08);tn(70,48,.5,'sine',.05,0,.05,300)},f(s){air(.42,320,140,.6,s?.09:.07,0,.06);tn(55,44,.4,'sine',.05,0,.04,260)},g(){air(1.3,180,380,.6,.05,0,.5);tn(46,48,1.2,'sine',.025,0,.5,240)},e(){air(1,200,700,.6,.07,0,.4);tn(82,55,1.1,'sine',.05,.1,.15,320);tn(123,82,1,'sine',.02,.15,.15,320)}},
  moth:{j(){flutter(6,950,.03,.03);tn(440,415,.5,'sine',.014,.05,.08)},f(s){flutter(s?4:3,900,.03,.03)},g(){air(1,700,1000,1.2,.022,0,.4);tn(392,370,1,'sine',.008,.1,.4)},e(){flutter(8,1000,.03,.035);tn(330,311,1,'sine',.02,.1,.1)}},
  eagle:{j(){air(.4,900,450,.8,.06,0,.06)},f(s){air(.36,750,380,.8,s?.075:.06,0,.05)},g(){air(1.3,500,1000,.7,.04,0,.5)},e(){air(.6,1000,400,.8,.06,0,.1);air(.5,900,380,.8,.05,.3,.08)}},
  swan:{j(){air(.38,1100,600,.8,.05,0,.07);tn(587,622,.22,'sine',.012,.08,.03)},f(s){air(.34,950,520,.8,.055,0,.06)},g(){air(1.3,700,1200,.7,.035,0,.5);tn(659,698,.6,'sine',.008,.2,.2)},e(){air(.6,1200,500,.8,.05,0,.1);tn(523,587,.3,'sine',.015,.25,.03);tn(784,830,.3,'sine',.01,.4,.03)}},
  raven:{j(){flutter(3,1200,.035,.05);air(.3,600,320,.9,.04,.04)},f(s){air(.3,700,340,.9,.055);flutter(1,1300,.025)},g(){air(1.1,420,800,.8,.032,0,.45)},e(){flutter(5,1250,.035,.06);tn(330,247,.4,'triangle',.012,.25,.02,900)}},
  plume:{j(){air(.42,800,1600,.8,.05,0,.08);tn(392,784,.45,'sine',.022,0,.05);for(let i=0;i<3;i++)air(.025,2800,2200,4,.02,.1+i*.07+R()*.04,.005)},f(s){air(.34,700,380,.8,.055);air(.025,2600,2000,4,.014,.1,.005)},g(){air(1.2,600,1300,.6,.035,0,.45);tn(523,540,1,'sine',.01,.2,.4)},e(){air(.9,500,1800,.7,.05,0,.3);tn(262,784,.9,'sine',.03,.05,.1);for(let i=0;i<5;i++)air(.025,2900,2200,4,.022,.3+i*.08,.005)}}
 };
 const fallback={j(){air(.35,900,500,.8,.05)},f(s){air(.3,700,400,.8,.05)},g(){air(1,600,1000,.7,.03,0,.4)},e(){chord([523,784],.5,'sine',.025,.06)}};
 const prof=w=>(w&&P7[w.id])||fallback;
 const wingNow=()=>{try{return cel.wingsOn?curWing(lvl):null}catch(_){return null}};
 const last={};const gate=(k,ms)=>{const t=performance.now();if(t-(last[k]||0)<ms)return false;last[k]=t;return true};
 function play(kind,w,s){w=w||wingNow();if(!w||!ok()||window.RB_COVER)return;try{prof(w)[kind](s)}catch(_){}}
 const jump=()=>{if(gate('j',90))play('j')};
 const flap=s=>{if(gate('f',110))play('f',null,s)};
 // glide start + equip changes are detected each physics step
 let gl=false,prevId=null,ready=false;
 function step(busy){const w=wingNow(),id=w?w.id:null;
  if(id!==prevId){if(ready&&id&&gate('e',400))play('e',w);prevId=id}ready=true;
  const hold=!busy&&(K.w||K[' ']||K.arrowup),g=!!w&&!P.g&&!P.sw&&hold&&P.vy>0&&!(typeof FLY7!='undefined'&&FLY7.F.on);
  if(g&&!gl&&gate('g',1200))play('g',w);gl=g}
 {const _p=physics;physics=function(dt,ax,busy){const r=_p.apply(this,arguments);try{step(busy)}catch(_){}return r}}
 return{jump,flap,play,P7}})();
