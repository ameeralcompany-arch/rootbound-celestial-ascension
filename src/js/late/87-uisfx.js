// ===== V7 UI sounds: tiny soft synthesised cues (no audio files), own volume + mute, rate limited =====
const UIS=(()=>{let ctx=null,last={},master=null;const opt=()=>{try{return cel.opt}catch(_){return{}}};
 const vol=()=>{const o=opt();return o.uim?0:(o.uiv==null?.6:o.uiv)};
 function ac(){if(ctx)return ctx;try{const C=window.AudioContext||window.webkitAudioContext;ctx=new C();master=ctx.createGain();master.gain.value=1;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=5200;master.connect(lp);lp.connect(ctx.destination)}catch(_){ctx=null}return ctx}
 function tone(f,t,d,v,type,slide){const c=ac();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,c.currentTime+t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f*slide),c.currentTime+t+d);
  g.gain.setValueAtTime(0,c.currentTime+t);g.gain.linearRampToValueAtTime(v,c.currentTime+t+.012);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+t+d);o.connect(g);g.connect(master);o.start(c.currentTime+t);o.stop(c.currentTime+t+d+.05)}
 function air(t,d,v,f){const c=ac();if(!c)return;const n=c.sampleRate*d|0,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource();s.buffer=b;const fl=c.createBiquadFilter();fl.type='bandpass';fl.frequency.value=f||2400;fl.Q.value=.8;const g=c.createGain();g.gain.value=0;g.gain.linearRampToValueAtTime(v,c.currentTime+t+d*.3);g.gain.linearRampToValueAtTime(0,c.currentTime+t+d);s.connect(fl);fl.connect(g);g.connect(master);s.start(c.currentTime+t)}
 const BANK={hover:()=>tone(1500,0,.05,.018),click:()=>{tone(520,0,.07,.05,'triangle',.7);tone(780,0,.05,.025)},tab:()=>tone(660,0,.08,.04,'triangle'),select:()=>{tone(740,0,.1,.045,'sine');tone(1110,.04,.12,.03,'sine')},
  open:()=>{air(0,.22,.05,2000);tone(392,.02,.18,.03,'sine',1.25)},close:()=>{air(0,.18,.035,1400);tone(440,0,.16,.03,'sine',.75)},
  char:()=>{tone(523,0,.35,.04);tone(784,.07,.4,.035);tone(1046,.14,.5,.025)},rare:()=>{[523,659,784,1046,1318].forEach((f,i)=>tone(f,i*.07,.6,.035));air(0,.5,.03,4200)},
  buy:()=>{tone(659,0,.14,.05,'triangle');tone(988,.09,.28,.05,'triangle')},error:()=>{tone(220,0,.16,.045,'sine',.85)},level:()=>{[392,494,587,784].forEach((f,i)=>tone(f,i*.09,.4,.045,'triangle'))},world:()=>{air(0,.5,.06,900);tone(330,0,.5,.035,'sine',2)}};
 const gap={hover:140,click:40,tab:50,select:60,open:120,close:120,char:150,rare:300,buy:150,error:200,level:400,world:300};
 function play(n){const v=vol();if(!v||!BANK[n])return;const t=performance.now();if(t-(last[n]||0)<(gap[n]||60))return;last[n]=t;const c=ac();if(!c)return;if(c.state=='suspended')c.resume().catch(()=>{});if(master)master.gain.value=v;try{BANK[n]()}catch(_){}}
 // global hover/click for editorial UI
 document.addEventListener('pointerover',e=>{const b=e.target.closest&&e.target.closest('.ed button:not(:disabled),.ed .it7,.ed .hb,.ed .gal');if(b&&b!==UIS._h){UIS._h=b;play('hover')}},true);
 document.addEventListener('pointerout',e=>{if(e.target===UIS._h)UIS._h=null},true);
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.ed .btn,.ed .nav a,.ed nav a');if(b)play('click')},true);
 return{play,get vol(){return vol()}}})();
