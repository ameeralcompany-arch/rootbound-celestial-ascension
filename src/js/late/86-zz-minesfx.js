// ===== MSFX8: mining sounds. Every tool hit and break gets a synthesized sound for its material: soft dirt / sand / grass (a crumbly "shff"
// with a soft thump), leaves (a rustle), glass (a tinkly shatter), wood (a hollow knock + splinter), stone (a sharp crack, a low thud and a gravel
// tail with pebble ticks), ore (a crunchy rock crack plus a bright crystalline "ting" and sparkles, pitched up the rarer the ore), Crystal Geodes
// (an even longer rising shimmer), Twiggy's tree chop (knock + creak + leaves), a cascade of rising tings when Glimmer mines a whole vein, a dull
// muffled "tok" when the tool is wrong for the block, and a shiny chime for tool level-ups. WebAudio only: one shared noise buffer and a few short
// oscillators per sound, small random pitch variation, a soft compressor on its own bus, follows the "Sound effects" slider (OPT.sv), and a voice
// budget + per-sound gap so fast mining never piles up. MSFX8.log keeps the last sounds asked for (tests read it).
// Tuned to be easy on the ears: soft 8-10 ms attacks (no clicks), the bright crack bands moved down to a rounder ~2 kHz "tok", a gentle
// treble shelf and lowpass on the bus, a short warm room tail, and repeated hits play quieter than the final break. =====
const MSFX8=(()=>{
 const R=Math.random;let mul=1;const vol=()=>(typeof OPT=='undefined'||OPT.sv==null?1:+OPT.sv)*mul;
 const ok=()=>{try{ac()}catch(_){}return typeof AC!='undefined'&&!!AC&&AC.state!='closed'&&vol()>0};
 let nb=null,bus=null;
 const buf=()=>{if(nb&&nb.sampleRate==AC.sampleRate)return nb;const b=AC.createBuffer(1,AC.sampleRate,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;return nb=b};
 // bus: treble shelf -> lowpass -> soft compressor -> out, plus a quiet send into a short warm room (a generated, darkened impulse)
 const room=()=>{const n=Math.round(AC.sampleRate*.42),b=AC.createBuffer(2,n,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);let lp=0;for(let i=0;i<n;i++){lp+=(R()*2-1-lp)*.22;d[i]=lp*Math.pow(1-i/n,3.2)}}return b};
 const out=()=>{if(bus&&bus.context===AC)return bus;bus=AC.createGain();bus.gain.value=.9;
  const sh=AC.createBiquadFilter();sh.type='highshelf';sh.frequency.value=3200;sh.gain.value=-6;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=7000;lp.Q.value=.5;
  const cp=AC.createDynamicsCompressor();cp.threshold.value=-20;cp.knee.value=18;cp.ratio.value=3;cp.attack.value=.004;cp.release.value=.18;
  bus.connect(sh);sh.connect(lp);lp.connect(cp);cp.connect(AC.destination);
  try{const cv=AC.createConvolver(),wet=AC.createGain();cv.buffer=room();wet.gain.value=.16;lp.connect(cv);cv.connect(wet);wet.connect(cp)}catch(_){}
  return bus};
 // filtered noise burst: d seconds, filter type, f0 -> f1, Q, volume, delay
 function nz(d,ty,f0,f1,q,v,dl){const t=AC.currentTime+(dl||0)+.004,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=buf();f.type=ty;f.Q.value=q||1;f.frequency.setValueAtTime(f0,t);if(f1!=f0)f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol(),t+Math.min(.01,d*.25));g.gain.exponentialRampToValueAtTime(.0004,t+d);s.connect(f);f.connect(g);g.connect(out());s.start(t,R()*.75,d+.05);s.stop(t+d+.06)}
 // oscillator with a pitch glide and a fast attack / exponential decay
 function os(ty,f0,f1,d,v,dl,at){const t=AC.currentTime+(dl||0)+.004,o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t);if(f1!=f0)o.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d*.9);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol(),t+(at||Math.min(.008,d*.2)));g.gain.exponentialRampToValueAtTime(.0004,t+d);o.connect(g);g.connect(out());o.start(t);o.stop(t+d+.05)}
 // a bell-like "ting": sine + an inharmonic partial + a quiet octave
 const ting=(f,d,v,dl)=>{os('sine',f,f*1.002,d,v,dl);os('sine',f*2.76,f*2.7,d*.4,v*.28,dl);os('triangle',f*2,f*2,d*.5,v*.22,(dl||0)+.006)};
 const PENT=[1047,1175,1319,1568,1760,2093,2349,2637,3136,3520,4186,4699];
 // ---- budget: voices started in a short window, and a minimum gap per sound kind
 let win=0,used=0;const gap={};
 function gate(kind,n,ms){const now=performance.now();if(now-(gap[kind]||0)<(ms==null?28:ms))return false;if(now-win>120){win=now;used=0}if(used+n>64)return false;used+=n;gap[kind]=now;return true}
 const log=[],count={};let seq=0;function note(k,c){seq++;const key=k+':'+c;count[key]=(count[key]||0)+1;log.push({k,c,t:performance.now()});if(log.length>40)log.shift()}
 const p=()=>.96+R()*.08;
 const vari=b=>{const n=((typeof BLK!='undefined'&&BLK[b])||[''])[0];return b==93?'cache':/Glass|Ice/.test(n)?'glass':/Leaf|Leaves|Hedge|Moss|Vine/.test(n)?'leaf':/Sand|Snow/.test(n)?'sand':/Grass/.test(n)?'grass':'dirt'};
 const rar=b=>{try{const pr=(typeof PRICE!='undefined'&&PRICE[b])||0;return pr>=150?5:pr>=90?4:pr>=60?3:pr>=25?2:pr>=12?1:0}catch(_){return 1}};
 // ---- material voices
 const V={
  soft(b,brk,q){const v=vari(b);if(v=='glass'){if(brk){for(let i=0;i<4;i++){const f=2600+R()*2600;os('sine',f,f*.96,.06+R()*.08,.05,i*.03+R()*.02)}nz(.18,'highpass',4200,3000,.7,.06)}else{os('sine',2600*q,2500*q,.08,.05);nz(.05,'highpass',4200,3400,.7,.035)}return}
   if(v=='leaf'){nz(brk?.24:.12,'bandpass',3200*q,2100,1.4,brk?.15:.09);nz(brk?.14:.08,'bandpass',2200*q,1600,1.8,.08,.05);if(brk)os('sine',170*q,90,.07,.08);return}
   const hi=v=='sand'?1.6:v=='grass'?1.15:1;
   if(brk){nz(.17,'lowpass',2300*hi*q,420,.7,.24);nz(.08,'bandpass',950*hi*q,620,1.2,.13,.01);os('sine',150*q,68,.1,.17);if(v=='grass')nz(.09,'highpass',4200,3000,.7,.05,.02);if(v=='cache'){os('triangle',520*q,300,.08,.08,.04);ting(1568*q,.3,.05,.08)}}
   else{nz(.07,'lowpass',1600*hi*q,600,.7,.15);os('sine',190*q,120,.05,.09)}},
  wood(b,brk,q){if(brk){os('triangle',380*q,190,.09,.15);os('sine',225*q,118,.13,.15);nz(.1,'bandpass',1250*q,820,2.5,.16);os('triangle',310*q,165,.07,.08,.05);nz(.06,'highpass',2600,1800,.8,.06,.03)}
   else{os('sine',430*q,260,.07,.12);nz(.05,'bandpass',1300*q,1000,2,.07)}},
  stone(b,brk,q){if(brk){nz(.08,'bandpass',1900*q,950,1,.2);os('sine',122*q,52,.2,.22);nz(.32,'lowpass',1200*q,260,.6,.12,.02);for(let i=0;i<3;i++){const f=1300+R()*700;os('sine',f,f*.82,.04,.03,.07+i*.05+R()*.03)}}
   else{nz(.06,'bandpass',1800*q,1150,1,.12);os('sine',240*q,150,.07,.1)}},
  ore(b,brk,q){const r=b==94?5:rar(b),f=PENT[3+r]*q;
   if(brk){nz(.08,'bandpass',1900*q,950,1,.21);os('sine',112*q,50,.2,.22);nz(.28,'lowpass',1300*q,280,.6,.1,.02);ting(f,.55+r*.06,.085,.03);
    for(let i=0,n=2+(r>>1);i<n;i++){const s=PENT[5+((R()*7)|0)];os('sine',s,s*1.02,.06,.03,.08+i*.045+R()*.02)}}
   else{nz(.06,'bandpass',1850*q,1200,1,.11);os('sine',230*q,150,.06,.08);ting(f*.75,.18,.04,.01)}},
  geode(b,brk,q,pr){if(brk){V.ore(94,true,q);[1047,1319,1568,2093,2637,3136,4186].forEach((f,i)=>os('sine',f*q,f*q*1.004,.3,.045,.1+i*.055));os('sine',4186,4180,1.3,.014,.45);nz(.55,'highpass',6500,5200,.6,.03,.12)}
   else{nz(.07,'bandpass',1900*q,1100,1,.15);os('sine',130*q,60,.12,.14);const f=PENT[2+Math.round((pr||0)*5)];os('sine',f,f,.22,.035,.03)}}};
 const SZ={soft:6,wood:6,stone:9,ore:14,geode:24};
 // ---- hits: one smooth voice for every material (the sound you hear several times a second while mining): a rounded sine "thock" with a short
 // pitch drop and a lowpassed puff of noise for texture; ores and geodes add a quiet, slow-attack sine chime instead of a bright ting. Pitch
 // follows the material and climbs a little over a run of hits on a block; a fast run also gets slightly quieter so mining never gets harsh.
 const HM={soft:[175,900,.1],dirt:[175,900,.1],leaf:[240,1400,.07],sand:[205,1100,.09],grass:[185,1000,.1],glass:[520,1800,.05],cache:[200,950,.1],wood:[300,1100,.09],stone:[150,1000,.1],ore:[160,1050,.1],geode:[170,1100,.1]};
 let lastHit=0,run=0;
 function hit(c,b,pr){const v0=c=='soft'?vari(b):c,h=HM[v0]||HM.soft,now=performance.now();run=now-lastHit<300?Math.min(run+1,6):0;lastHit=now;
  const dk=1-run*.05,q=.985+R()*.03,up=1+run*.015+(pr||0)*.06,f0=h[0]*q*up;
  os('sine',f0*1.6,f0,.11,.1*dk);nz(.07,'lowpass',h[1]*q,h[1]*.55,.7,h[2]*.7*dk);
  if(v0=='wood')os('sine',f0*2.1,f0*1.6,.06,.05*dk,.004);
  if(v0=='glass')os('sine',f0*3,f0*2.95,.12,.03*dk,0,.012);
  if(c=='ore'||c=='geode'){const f=PENT[1+(c=='geode'?4:rar(b))]*q*up;os('sine',f,f,.24,.026*dk,.01,.03)}}
 function play(kind,cat,b,o){o=o||{};const c=cat=='ore'&&b==94?'geode':cat;if(!V[c])return false;const tag=kind+':'+c,brk=kind=='break';if(!gate(tag,brk?SZ[c]||8:4,brk?28:45))return false;note(kind,c);if(!ok())return true;
  mul=brk?1:.8;try{if(brk)V[c](b,true,p(),o.pr);else hit(c,b,o.pr)}catch(_){}finally{mul=1}return true}
 // ---- specials
 function wrong(cat){if(!gate('wrong',3,70))return false;note('wrong',cat||'');if(!ok())return true;const q=p();try{os('sine',205*q,140,.08,.13);nz(.05,'lowpass',700*q,320,.8,.11);if(cat=='ore')nz(.04,'bandpass',3600,3000,2,.03,.02)}catch(_){}return true}
 function tree(){if(!gate('tree',12,60))return false;note('break','tree');if(!ok())return true;const q=p();try{os('triangle',300*q,150,.11,.16);os('sine',170*q,92,.16,.17);nz(.11,'bandpass',1100*q,700,2.4,.16);
  nz(.32,'bandpass',3000*q,2000,1.2,.11,.06);os('triangle',165*q,128,.24,.035,.09,.05);os('triangle',300*q,170,.07,.07,.06)}catch(_){}return true}
 // one step of a vein cascade: a crunchy little crack and the next note up the scale; the last block lands a sparkly chord
 function vein(i,n,b){if(!gate('vein',6,20))return false;note('vein','ore');if(!ok())return true;const q=.985+R()*.03,r=rar(b),f=PENT[Math.min(PENT.length-1,(i+r)%PENT.length)]*q;
  try{nz(.05,'bandpass',2400*q,1300,1.2,.13);ting(f,.32,.075);if(i>=n-1){[0,2,4].forEach((s,j)=>ting(PENT[Math.min(PENT.length-1,(i+r+s)%PENT.length)]*q,.6,.05,.07+j*.05));nz(.4,'highpass',6800,5600,.6,.025,.12)}}catch(_){}return true}
 function levelup(lv){note('level',String(lv));if(!ok())return;try{const top=lv>=10;[1319,1568,2093,2637].forEach((f,i)=>ting(f,.5,.05,.05+i*.07));if(top){for(let i=0;i<10;i++){const f=PENT[i%PENT.length]*(i>=PENT.length?2:1);os('sine',f,f*1.003,.22,.03,.36+i*.05)}os('sine',2093,2093,1.6,.02,.9)}else os('sine',3136,3136,.9,.018,.35)}catch(_){}}
 // ---- hits that are not tool mining (fist, weapons, blasts) used breakAt's old square-wave blip: mute it there and play the soft material
 // sound instead, unless the tool code already played one for this hit (it does that right after breakAt returns, so check a microtask later)
 let inBrk=0;
 {const _s=snd;snd=function(f){if(inBrk&&f!=660&&f!=880)return;return _s.apply(this,arguments)}}
 {const _n=noise;noise=function(){if(inBrk)return;return _n.apply(this,arguments)}}
 {const _ba=breakAt;breakAt=function(x,y){const k=y*W+x,b=x>=0&&y>=0&&x<W&&y<H?tiles[k]:0;inBrk++;let r;try{r=_ba.apply(this,arguments)}finally{inBrk--}
  if(r&&b){const s0=seq,brk=!tiles[k];queueMicrotask(()=>{if(seq!==s0)return;let c='soft';try{c=TOOLS8.catOf(b)||'soft'}catch(_){}play(brk?'break':'hit',c,b)})}return r}}
 return{play,wrong,tree,vein,levelup,log,count,vari,rar,get budget(){return used}}})();
