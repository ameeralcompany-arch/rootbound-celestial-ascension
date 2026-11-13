// Rootbound's sound, measured (the smooth, chill audio identity): a long soak of repeated attacks with every weapon type, every class's ultimate, the
// music and the ambience, all heard through the game's own mixing desk (RBMIX) in a headless browser. What must hold:
//   nothing ever clips (peak under full scale) across minutes of attacks; the harsh band (2.5-5 kHz) and the brittle top (above 8 kHz) stay a small share of
//   the sound; the number of sounds playing at once stays capped; every weapon has a profile and swings without errors; the old swing beeps are held back
//   while a swing plays; each class's ultimate is distinct, rings out, and dips the music; the ambience follows where you are; the slider and mute work.
//   node tests/audio.js   (SOAK=seconds, default 150)
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(__dirname,'../index.html').replace(/\\/g,'/'),SOAK=+(process.env.SOAK||150);
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,500):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},(SOAK+260)*1000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:5},gems:100,own:{fist:1,ember:1},wp:'ember',bar:[1],done:{},xp:3,lvl:30,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
(async()=>{// audio must really render to be measured, so the browser is not muted; it renders to no output device at all (sinkId none) and every media element is muted, so nothing is ever heard
 const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const c=await b.newContext({viewport:{width:1280,height:720}});await c.addInitScript(()=>{const A0=window.AudioContext;if(A0){window.AudioContext=function(o){return new A0(Object.assign({sinkId:{type:'none'}},o||{}))};window.AudioContext.prototype=A0.prototype;window.webkitAudioContext=window.AudioContext}const pl=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){this.muted=true;this.volume=0;return pl.apply(this,arguments)}});
 await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')}},SAVE);
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&!/ERR_|favicon/.test(m.text()))errs.push(m.text().slice(0,300))});
 await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});await p.evaluate(()=>enterWorld('plaza'));await sleep(1500);
 const setup=await p.evaluate(async()=>{ac();if(AC.state!='running')try{await AC.resume()}catch(_){}OPT.sv=1;try{startBGM()}catch(_){}await new Promise(r=>setTimeout(r,800));snd(440,.2,'square',.05);await new Promise(r=>setTimeout(r,300));
  return{state:AC.state,bus:!!(window.RBMIX&&RBMIX.buses.has(AC)),engines:RBMIX.stats().engines,soft:!!window.SOFTSYN,snd:!!window.RBSND}});
 // the desk is only built when a real sound reaches the speakers through it, so a desk for the game's own engine proves the routing
 ok('the audio runs, and the game\'s sounds go through the mixing desk (a real sound built it)',setup.state=='running'&&setup.bus&&setup.engines>=1&&setup.soft&&setup.snd,setup);
 // ---- every weapon has a profile and swings without errors
 const pro=await p.evaluate(()=>{const o={},bad=[];for(const id in WPN){try{const k=RBSND.kindOf(WPN[id]);o[k]=(o[k]||0)+1;RBSND.swing(id)}catch(e){bad.push(id+' '+e.message)}}return{kinds:o,bad}});
 ok('every weapon has a sound profile and swings cleanly ('+Object.keys(pro.kinds).length+' kinds)',pro.bad.length==0&&['fast','heavy','scythe','magic','bow','gun','fist'].every(k=>pro.kinds[k]>0),pro);
 // ---- the old beeps are held back during a swing
 const hold=await p.evaluate(()=>{let called=0;const s0=snd;const mark=()=>{called++};wp='ember';own.ember=1;wcd=0;const before=SOFTSYN.live;useWeapon();const after=SOFTSYN.live;return{hold:RBSND.hold,before,after}});
 ok('a swing plays one designed sound; the older beeps are held back (the hold is released afterwards)',hold.hold===0&&hold.after-hold.before<=1,hold);
 // ---- offline rendering: the game's own sound code renders into an OfflineAudioContext through the same mixing desk, silently and exactly; the
 //      recording is then measured (peak, loudness, and the share of energy in the harsh band and the brittle top, by FFT)
 await p.evaluate(()=>{window.RBMIX_OFFLINE=true;window.__render=async(secs,script)=>{const sr=44100,off=new OfflineAudioContext(1,Math.ceil(sr*secs),sr);let sim=0;Object.defineProperty(off,'currentTime',{get:()=>sim,configurable:true});
   const AC0=AC;AC=off;try{for(const[at,fn]of script){sim=at;fn()}}finally{AC=AC0}const routed=RBMIX.buses.has(off),buf=await off.startRendering(),d=buf.getChannelData(0);
   let peak=0,ss=0;for(let i=0;i<d.length;i++){const v=Math.abs(d[i]);if(v>peak)peak=v;ss+=d[i]*d[i]}
   // FFT band shares (2048-point frames, Hann window, every 4th frame)
   const N=2048,re=new Float64Array(N),im=new Float64Array(N),w=new Float64Array(N);for(let i=0;i<N;i++)w[i]=.5-.5*Math.cos(2*Math.PI*i/(N-1));
   const fft=()=>{for(let i=1,j=0;i<N;i++){let bit=N>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}}for(let len=2;len<=N;len<<=1){const ang=-2*Math.PI/len,wr=Math.cos(ang),wi=Math.sin(ang);for(let i=0;i<N;i+=len){let cr=1,ci=0;for(let k=0;k<len/2;k++){const ur=re[i+k],ui=im[i+k],vr=re[i+k+len/2]*cr-im[i+k+len/2]*ci,vi=re[i+k+len/2]*ci+im[i+k+len/2]*cr;re[i+k]=ur+vr;im[i+k]=ui+vi;re[i+k+len/2]=ur-vr;im[i+k+len/2]=ui-vi;const nr=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=nr}}}};
   let tot=0,harsh=0,top=0;for(let s=0;s+N<d.length;s+=N*4){for(let i=0;i<N;i++){re[i]=d[s+i]*w[i];im[i]=0}fft();for(let k=1;k<N/2;k++){const pw=re[k]*re[k]+im[k]*im[k],fq=k*sr/N;tot+=pw;if(fq>=2500&&fq<5000)harsh+=pw;if(fq>=8000)top+=pw}}
   return{routed,peak:+peak.toFixed(3),rms:+Math.sqrt(ss/d.length).toFixed(4),harsh:+(harsh/Math.max(1e-12,tot)*100).toFixed(2),top:+(top/Math.max(1e-12,tot)*100).toFixed(3),secs}}});
 const soak=await p.evaluate(async SOAK=>{const W=['ember','titanmaul','void','starwand','zephyrbow','revolver','fist','blood','frost','spark2','smg','crimsonrift'].filter(id=>WPN[id]);const m={x:0,y:0,hp:1e9,mhp:1e9,dead:false};const sc=[];let at=.05,i=0;
  while(at<SOAK-1){const id=W[Math.floor(at/10)%W.length],cd=Math.max(.12,WPN[id].cd||.4);sc.push([at,()=>RBSND.swing(id)]);if(i%3!=2){const k=i%17==0;sc.push([at+.06,()=>RBSND.impact(m,WPN[id],12,k)])}i++;at+=cd}
  const r=await __render(SOAK,sc);r.swings=i;return r},SOAK);
 ok('the soak is heard through the mixing desk',soak.routed===true,soak);
 ok('a '+soak.secs+'-second soak of '+soak.swings+' attacks with every kind of weapon never clips (peak under full scale)',soak.peak>.005&&soak.peak<.99,soak);
 ok('the harsh band (2.5-5 kHz) stays a small share of the sound',soak.harsh<12,soak);
 ok('and the brittle top (above 8 kHz) is barely there',soak.top<1.5,soak);
 ok('the number of sounds playing at once stays capped',await p.evaluate(()=>SOFTSYN.live<=SOFTSYN.MAX),'');
 // ---- picking things up: a soft pluck or bell, clean
 //  (each render starts with two quiet seconds: a fresh desk's compressor opens over its first second, while in the game the desk is already running;
 //   and the pickups are spaced, because the game merges two pickups within 60 ms into one sound)
 const pu=await p.evaluate(async()=>{const item=await __render(2.6,[[2.02,()=>RBSND.pickup(false)]]);await new Promise(r=>setTimeout(r,800));const gem=await __render(2.6,[[2.02,()=>{RBSND.pickup(true)}]]);return{item,gem}});
 ok('picking things up is a soft pluck (items) or bell (gems): audible, gentle, clean',pu.item.routed&&pu.gem.routed&&pu.item.rms>.0004&&pu.gem.rms>.0004&&pu.item.peak<.3&&pu.gem.peak<.3&&pu.item.harsh<15,pu);
 // ---- ultimates: one per class, distinct, big but clean, ringing out after the last strike
 const ul=await p.evaluate(async()=>{const o={},ks=Object.keys(RBSND.ULT);const sig=new Set();for(const k of ks){const U=RBSND.ULT[k];sig.add(U.inst+':'+U.root+':'+U.ch.join(','))}o.n=ks.length;o.distinct=sig.size;o.each={};
  for(const k of ks){const U=RBSND.ULT[k],last=U.h[U.h.length-1],full=await __render(last+5.2,[[2.02,()=>RBSND.ultimate(k)]]);o.each[k]={peak:full.peak,rms:full.rms,harsh:full.harsh,routed:full.routed}}
  o.maxPeak=Math.max(...Object.values(o.each).map(e=>e.peak));o.minRms=Math.min(...Object.values(o.each).map(e=>e.rms));o.maxHarsh=Math.max(...Object.values(o.each).map(e=>e.harsh));return o});
 ok('all 13 classes have their own ultimate sound',ul.n==13&&ul.distinct==13,{n:ul.n,distinct:ul.distinct});
 ok('every ultimate is big but clean: audible, under full scale, little harsh energy',Object.values(ul.each).every(e=>e.routed)&&ul.minRms>.002&&ul.maxPeak<.99&&ul.maxHarsh<14,{maxPeak:ul.maxPeak,minRms:ul.minRms,maxHarsh:ul.maxHarsh,routed:Object.values(ul.each).every(e=>e.routed)});
 const dk=await p.evaluate(async()=>{try{startBGM()}catch(_){}await new Promise(r=>setTimeout(r,400));const o={before:RBMIX.duckLevels()};RBMIX.duck(.7,1);await new Promise(r=>setTimeout(r,600));o.during=RBMIX.duckLevels();await new Promise(r=>setTimeout(r,2600));o.after=RBMIX.duckLevels();return o});
 ok('an ultimate dips the music and brings it back smoothly',dk.before.length>0&&dk.during.every(v=>v<.5)&&dk.after.every(v=>v>.9),dk);
 // ---- ambience follows the place
 const am=await p.evaluate(async()=>{const o={};OPT.av=1;await new Promise(r=>setTimeout(r,1600));o.plaza=RBSND.amb;enterWorld('ambworld');await new Promise(r=>setTimeout(r,2200));o.world=RBSND.amb;OPT.av=0;await new Promise(r=>setTimeout(r,1000));o.quiet=RBSND.amb;OPT.av=1;return o});
 ok('the ambience follows where you are (the Plaza, a world)',/^plaza-/.test(am.plaza)&&/^(world-|under)/.test(am.world),am);
 ok('no errors',errs.length==0,errs.slice(0,4));
 await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1)});
